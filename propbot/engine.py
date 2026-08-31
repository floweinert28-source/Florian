"""Backtest-Engine mit Prop-Firm-Regeln.

Grundsatz der Engine: **lieber zu pessimistisch als zu schoen.** Ein Backtest,
der optimistisch rechnet, kostet auf dem echten Konto genau einmal Geld.
Deshalb gilt hier:

* Ein Signal entsteht am **Schluss** einer Kerze und wird zur **Eroeffnung der
  naechsten** ausgefuehrt - nie zum Signalkurs selbst.
* Die Positionsgroesse wird erst beim tatsaechlichen Fuellpreis berechnet, nicht
  beim Signalpreis. Was dann nicht mehr ins Risikobudget passt, wird kleiner
  oder faellt aus.
* Werden Stop und Ziel in derselben Kerze beruehrt, gilt der **Stop** als
  zuerst erreicht.
* Oeffnet eine Kerze jenseits des Stops (Gap), wird zur **Eroeffnung** gefuellt,
  nicht am Stop.
* Spread, Slippage und Kommission werden auf beiden Seiten abgezogen.
* Fuer die Drawdown-Pruefung zaehlt der **schlechteste Punkt innerhalb der
  Kerze** - so wie die Firma auch auf den Tick schaut.

Damit ist das Ergebnis eher zu schlecht als zu gut. Genau so soll es sein.
"""

from __future__ import annotations

from collections import Counter
from dataclasses import dataclass, field

import numpy as np
import pandas as pd

from . import metrics
from .models import ExitReason, Instrument, Side, Signal, Trade
from .risk import RiskManager, RiskSettings
from .rules import AccountState, AccountStatus, PropFirmRules
from .strategy.base import Strategy

__all__ = [
    "BacktestResult",
    "Backtester",
    "ExecutionSettings",
    "check_no_lookahead",
]


@dataclass(frozen=True, slots=True)
class ExecutionSettings:
    """Wie Positionen gefuehrt werden, nachdem sie offen sind."""

    partial_at_r: float | None = 1.0
    partial_fraction: float = 0.5
    breakeven_at_r: float | None = 1.0
    breakeven_offset_r: float = 0.05
    trail_after_r: float | None = 1.5
    trail_atr_mult: float = 2.0
    atr_column: str = "atr"
    time_stop_bars: int | None = 96
    respect_session_flat: bool = True
    stop_first: bool = True

    def __post_init__(self) -> None:
        if self.partial_at_r is not None and not 0 < self.partial_fraction < 1:
            raise ValueError("partial_fraction muss zwischen 0 und 1 liegen.")
        if self.trail_after_r is not None and self.trail_atr_mult <= 0:
            raise ValueError("trail_atr_mult muss positiv sein.")


@dataclass(slots=True)
class _Position:
    """Interner Zustand einer offenen Position."""

    trade: Trade
    remaining: float
    stop: float
    target: float | None
    stop_distance: float
    bars: int = 0
    partial_done: bool = False
    breakeven_done: bool = False
    trailing: bool = False

    def r_at(self, price: float) -> float:
        """Buchergebnis in R anhand des Preises (Kosten ausgeklammert)."""
        if self.stop_distance <= 0:
            return 0.0
        return (price - self.trade.entry_price) * self.trade.side.sign / self.stop_distance


@dataclass(slots=True)
class BacktestResult:
    """Ergebnis eines Laufs."""

    trades: list[Trade]
    equity: pd.DataFrame
    account: AccountState
    report: metrics.PerformanceReport
    signals: int = 0
    blocked: Counter = field(default_factory=Counter)
    strategy: str = ""
    params: dict[str, float | str] = field(default_factory=dict)

    @property
    def status(self) -> AccountStatus:
        return self.account.status

    def summary(self, title: str = "Backtest") -> str:
        text = metrics.format_report(self.report, self.account.rules, title)
        if self.blocked:
            top = ", ".join(f"{reason} ({count})" for reason, count in self.blocked.most_common(4))
            text += (
                f"\nAbgelehnte Signale:  {sum(self.blocked.values())} von {self.signals} -> {top}"
            )
        return text

    def r_multiples(self) -> list[float]:
        return [trade.r_multiple for trade in self.trades if not trade.is_open]


class Backtester:
    """Fuehrt eine Strategie unter Prop-Firm-Regeln durch historische Daten."""

    def __init__(
        self,
        strategy: Strategy,
        instrument: Instrument,
        *,
        rules: PropFirmRules | None = None,
        risk: RiskSettings | None = None,
        execution: ExecutionSettings | None = None,
    ) -> None:
        self.strategy = strategy
        self.instrument = instrument
        self.rules = rules or PropFirmRules()
        self.risk_settings = risk or RiskSettings()
        self.execution = execution or ExecutionSettings()

    # ---------------------------------------------------------------- Ablauf
    def run(self, frame: pd.DataFrame) -> BacktestResult:
        """Laesst die Strategie ueber den Datensatz laufen."""
        data = self.strategy.prepare(frame)
        account = AccountState(self.rules, start_time=data.index[0])
        manager = RiskManager(self.risk_settings)

        trades: list[Trade] = []
        position: _Position | None = None
        pending: Signal | None = None
        blocked: Counter = Counter()
        signals = 0
        curve: list[tuple[pd.Timestamp, float, float, float]] = []

        times = data.index
        opens = data["open"].to_numpy(dtype=float)
        highs = data["high"].to_numpy(dtype=float)
        lows = data["low"].to_numpy(dtype=float)
        closes = data["close"].to_numpy(dtype=float)
        atr_values = (
            data[self.execution.atr_column].to_numpy(dtype=float)
            if self.execution.atr_column in data.columns
            else np.full(len(data), np.nan)
        )

        start = max(self.strategy.warmup, 1)
        for index in range(start, len(data)):
            moment = times[index]

            # 1. Ausstehenden Einstieg zur Eroeffnung dieser Kerze ausfuehren.
            if pending is not None and position is None:
                position, reason = self._open(
                    pending, account, manager, moment, opens[index], atr_values[index]
                )
                if position is None and reason:
                    blocked[reason] += 1
                pending = None

            # 2. Offene Position durch die Kerze fuehren.
            if position is not None:
                closed = self._process_bar(
                    position,
                    account,
                    manager,
                    moment,
                    opens[index],
                    highs[index],
                    lows[index],
                    closes[index],
                    atr_values[index],
                )
                if closed is not None:
                    trades.append(closed)
                    position = None

            # 3. Konto bewerten - erst bestmoeglich (Trailing-Hoch), dann
            #    schlechtestmoeglich (Regelverstoss).
            equity_best, equity_worst = self._equity_range(
                account.balance, position, highs[index], lows[index]
            )
            account.mark(moment, equity_best)
            status = account.mark(moment, equity_worst)
            close_equity = account.balance + self._floating(position, closes[index])
            account.mark(moment, close_equity)
            curve.append((moment, close_equity, account.balance, account.floor))

            if account.should_secure_payout() and position is not None:
                trades.append(
                    self._close(
                        position, account, manager, moment, closes[index], ExitReason.PAYOUT
                    )
                )
                position = None
                status = account.status

            if status.is_final:
                if position is not None:
                    reason = ExitReason.BREACH if status.is_breach else ExitReason.PAYOUT
                    trades.append(
                        self._close(position, account, manager, moment, closes[index], reason)
                    )
                    position = None
                break

            # 4. Neues Signal am Kerzenschluss suchen.
            if position is None and pending is None:
                signal = self.strategy.signal(data, index)
                if signal is not None:
                    signals += 1
                    if not self.strategy.allows_entry(moment):
                        blocked["ausserhalb der Handelszeit"] += 1
                    else:
                        gate = manager.trading_allowed(account)
                        if not gate.allowed:
                            blocked[gate.reason] += 1
                        else:
                            pending = signal
                            pending.context.update(self.strategy.context(data, index))

        # Offene Position am Datenende glattstellen.
        if position is not None:
            last = len(data) - 1
            trades.append(
                self._close(
                    position, account, manager, times[last], closes[last], ExitReason.END_OF_DATA
                )
            )

        equity = pd.DataFrame(curve, columns=["time", "equity", "balance", "floor"]).set_index(
            "time"
        )
        report = metrics.compute(
            trades,
            equity["equity"] if not equity.empty else None,
            self.rules,
            status=account.status,
            final_balance=account.balance,
        )
        return BacktestResult(
            trades=trades,
            equity=equity,
            account=account,
            report=report,
            signals=signals,
            blocked=blocked,
            strategy=self.strategy.name,
            params=self.strategy.params(),
        )

    # ---------------------------------------------------------------- Handel
    def _open(
        self,
        signal: Signal,
        account: AccountState,
        manager: RiskManager,
        moment: pd.Timestamp,
        open_price: float,
        atr_value: float,
    ) -> tuple[_Position | None, str]:
        """Fuellt den Einstieg zur Eroeffnung der Kerze."""
        instrument = self.instrument
        side = signal.side
        half_spread = instrument.spread / 2
        fill = open_price + side.sign * (half_spread + instrument.slippage)
        fill = instrument.round_price(fill)

        # Der Markt kann ueber Nacht weggelaufen sein: dann ist das Setup weg.
        if side is Side.LONG and fill <= signal.stop_price:
            return None, "Gap durch den Stop"
        if side is Side.SHORT and fill >= signal.stop_price:
            return None, "Gap durch den Stop"
        if signal.target_price is not None:
            if side is Side.LONG and fill >= signal.target_price:
                return None, "Gap ueber das Ziel"
            if side is Side.SHORT and fill <= signal.target_price:
                return None, "Gap unter das Ziel"

        decision = manager.plan(
            account,
            instrument,
            side,
            fill,
            signal.stop_price,
            target_price=signal.target_price,
        )
        if not decision.allowed:
            return None, decision.reason

        trade = Trade(
            symbol=instrument.symbol,
            side=side,
            entry_time=moment.to_pydatetime(),
            entry_price=fill,
            size=decision.size,
            stop_price=signal.stop_price,
            target_price=signal.target_price,
            risk_money=decision.risk_money,
            setup=signal.setup,
            context={**signal.context, "risk_money": round(decision.risk_money, 2)},
        )
        trade.spread_cost = (
            decision.size * (half_spread + instrument.slippage) * instrument.value_per_point
        )
        if not np.isnan(atr_value):
            trade.context["atr_entry"] = round(float(atr_value), 6)
        return (
            _Position(
                trade=trade,
                remaining=decision.size,
                stop=signal.stop_price,
                target=signal.target_price,
                stop_distance=abs(fill - signal.stop_price),
            ),
            "",
        )

    def _process_bar(
        self,
        position: _Position,
        account: AccountState,
        manager: RiskManager,
        moment: pd.Timestamp,
        open_price: float,
        high: float,
        low: float,
        close: float,
        atr_value: float,
    ) -> Trade | None:
        """Fuehrt eine offene Position durch eine Kerze. Gibt den Trade bei Ausstieg zurueck."""
        position.bars += 1
        side = position.trade.side
        instrument = self.instrument
        self._update_excursions(position, high, low)

        # a) Gap ueber den Stop hinaus -> zur Eroeffnung raus.
        if side is Side.LONG and open_price <= position.stop:
            return self._close(
                position, account, manager, moment, open_price, self._stop_reason(position)
            )
        if side is Side.SHORT and open_price >= position.stop:
            return self._close(
                position, account, manager, moment, open_price, self._stop_reason(position)
            )

        stop_hit = low <= position.stop if side is Side.LONG else high >= position.stop
        target_hit = position.target is not None and (
            high >= position.target if side is Side.LONG else low <= position.target
        )

        # b) Stop und Ziel in derselben Kerze -> konservativ der Stop.
        if stop_hit and (self.execution.stop_first or not target_hit):
            return self._close(
                position, account, manager, moment, position.stop, self._stop_reason(position)
            )
        if target_hit:
            return self._close(
                position, account, manager, moment, float(position.target), ExitReason.TARGET
            )

        # c) Teilgewinn mitnehmen (nur wenn der Stop nicht beruehrt wurde).
        settings = self.execution
        if settings.partial_at_r is not None and not position.partial_done:
            level = (
                position.trade.entry_price
                + side.sign * settings.partial_at_r * position.stop_distance
            )
            reached = high >= level if side is Side.LONG else low <= level
            if reached:
                self._take_partial(position, moment, level)

        # d) Break-even und Trailing nach dem Kerzenschluss nachziehen.
        r_close = position.r_at(close)
        if settings.breakeven_at_r is not None and not position.breakeven_done:
            if r_close >= settings.breakeven_at_r:
                offset = settings.breakeven_offset_r * position.stop_distance
                new_stop = position.trade.entry_price + side.sign * offset
                position.stop = self._tighten(position, new_stop)
                position.breakeven_done = True
        if settings.trail_after_r is not None and not np.isnan(atr_value) and atr_value > 0:
            if r_close >= settings.trail_after_r:
                position.trailing = True
            if position.trailing:
                trail = close - side.sign * settings.trail_atr_mult * atr_value
                position.stop = self._tighten(position, instrument.round_price(trail))

        # e) Zeit- und Sessionstop.
        if settings.time_stop_bars is not None and position.bars >= settings.time_stop_bars:
            return self._close(position, account, manager, moment, close, ExitReason.TIME)
        if settings.respect_session_flat and self.strategy.session.must_be_flat(moment):
            return self._close(position, account, manager, moment, close, ExitReason.SESSION_END)
        return None

    def _stop_reason(self, position: _Position) -> ExitReason:
        if position.trailing:
            return ExitReason.TRAIL
        if position.breakeven_done:
            return ExitReason.BREAKEVEN
        return ExitReason.STOP

    def _tighten(self, position: _Position, new_stop: float) -> float:
        """Ein Stop wird nur enger, nie weiter - sonst waere das Risiko nicht fix."""
        if position.trade.side is Side.LONG:
            return max(position.stop, new_stop)
        return min(position.stop, new_stop)

    def _take_partial(self, position: _Position, moment: pd.Timestamp, price: float) -> None:
        """Schliesst einen Teil der Position zum Zielpreis."""
        instrument = self.instrument
        size = instrument.round_size(position.remaining * self.execution.partial_fraction)
        if size <= 0 or size >= position.remaining:
            position.partial_done = True
            return
        fill = self._exit_fill(position.trade.side, price)
        gross = instrument.money(
            (fill - position.trade.entry_price) * position.trade.side.sign, size
        )
        commission = instrument.commission_for(size)
        position.trade.spread_cost += size * (instrument.spread / 2) * instrument.value_per_point
        position.trade.gross_pnl += gross
        position.trade.commission += commission
        position.trade.partial_exits.append(
            {"time": moment.timestamp(), "price": fill, "size": size, "pnl": gross - commission}
        )
        position.remaining = round(position.remaining - size, 10)
        position.partial_done = True

    def _close(
        self,
        position: _Position,
        account: AccountState,
        manager: RiskManager,
        moment: pd.Timestamp,
        price: float,
        reason: ExitReason,
    ) -> Trade:
        """Schliesst die Position, bucht sie aufs Konto und meldet sie zurueck."""
        instrument = self.instrument
        trade = position.trade
        fill = self._exit_fill(trade.side, price, stop=reason.is_loss_by_design)
        gross = instrument.money((fill - trade.entry_price) * trade.side.sign, position.remaining)
        commission = instrument.commission_for(position.remaining)
        exit_cost = instrument.spread / 2 + (
            instrument.slippage if reason.is_loss_by_design else 0.0
        )
        trade.spread_cost += position.remaining * exit_cost * instrument.value_per_point
        trade.gross_pnl += gross
        trade.commission += commission
        trade.exit_price = fill
        trade.exit_time = moment.to_pydatetime()
        trade.exit_reason = reason
        trade.bars_held = position.bars
        position.remaining = 0.0

        account.apply_trade(trade.exit_time, trade.pnl)
        manager.register_result(trade.r_multiple, trade.exit_time)
        self.strategy.on_trade_closed(trade)
        return trade

    def _exit_fill(self, side: Side, price: float, *, stop: bool = False) -> float:
        """Ausstiegspreis inklusive Spread und Slippage."""
        instrument = self.instrument
        cost = instrument.spread / 2 + (instrument.slippage if stop else 0.0)
        return instrument.round_price(price - side.sign * cost)

    def _update_excursions(self, position: _Position, high: float, low: float) -> None:
        """Fuehrt MAE/MFE mit - Grundlage der spaeteren Fehleranalyse."""
        trade = position.trade
        instrument = self.instrument
        if trade.side is Side.LONG:
            worst, best = low, high
        else:
            worst, best = high, low
        adverse = instrument.money((trade.entry_price - worst) * trade.side.sign, trade.size)
        favourable = instrument.money((best - trade.entry_price) * trade.side.sign, trade.size)
        trade.mae = max(trade.mae, adverse)
        trade.mfe = max(trade.mfe, favourable)

    # ------------------------------------------------------------- Bewertung
    def _floating(self, position: _Position | None, price: float) -> float:
        if position is None:
            return 0.0
        trade = position.trade
        gross = self.instrument.money(
            (price - trade.entry_price) * trade.side.sign, position.remaining
        )
        return gross - self.instrument.commission_for(position.remaining)

    def _equity_range(
        self, balance: float, position: _Position | None, high: float, low: float
    ) -> tuple[float, float]:
        """Bestes und schlechtestes Equity-Niveau innerhalb der Kerze."""
        if position is None:
            return balance, balance
        side = position.trade.side
        best_price, worst_price = (high, low) if side is Side.LONG else (low, high)
        return (
            balance + self._floating(position, best_price),
            balance + self._floating(position, worst_price),
        )


def check_no_lookahead(
    strategy: Strategy, frame: pd.DataFrame, *, samples: int = 30, seed: int = 0
) -> list[int]:
    """Prueft, ob die Strategie in die Zukunft schaut.

    Fuer zufaellige Kerzen wird das Signal einmal auf dem vollen Datensatz und
    einmal auf dem bis dahin abgeschnittenen Datensatz berechnet. Unterscheiden
    sich die Ergebnisse, benutzt die Strategie Daten, die es zu dem Zeitpunkt
    noch nicht gab. Rueckgabe ist die Liste der auffaelligen Indizes - leer ist
    gut.
    """
    rng = np.random.default_rng(seed)
    full = strategy.prepare(frame)
    lowest = max(strategy.warmup + 1, int(len(frame) * 0.5))
    if lowest >= len(frame):
        raise ValueError("Datensatz ist zu kurz fuer die Lookahead-Pruefung.")
    candidates = rng.choice(
        np.arange(lowest, len(frame)), size=min(samples, len(frame) - lowest), replace=False
    )

    suspicious: list[int] = []
    for index in sorted(int(value) for value in candidates):
        truncated = strategy.prepare(frame.iloc[: index + 1])
        expected = strategy.signal(full, index)
        actual = strategy.signal(truncated, index)
        if _signal_key(expected) != _signal_key(actual):
            suspicious.append(index)
    return suspicious


def _signal_key(signal: Signal | None) -> tuple | None:
    if signal is None:
        return None
    return (signal.side, round(signal.stop_price, 8), signal.setup)
