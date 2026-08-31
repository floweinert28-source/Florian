"""Live- und Paper-Handel: dieselbe Logik wie im Backtest, nur mit echtem Broker.

Der Loop macht bei jedem Durchlauf genau das, was die Engine je Kerze macht:

1. Kontostand vom Broker holen und gegen die Prop-Regeln pruefen.
2. Bei Regelverstoss oder erreichtem Ziel: alles schliessen und **aufhoeren**.
3. Offene Position nachfuehren (Break-even, Trailing, Sessionende).
4. Sonst: letzte **abgeschlossene** Kerze auswerten und ggf. einsteigen.
5. Zustand speichern, Trade ins Journal schreiben.

Zwei Sicherungen sind fest eingebaut:

* ``dry_run`` ist Standard. Der Bot rechnet und loggt alles, sendet aber keine
  Order. Erst wer bewusst ``dry_run=False`` setzt, handelt echt.
* Der Zustand (vor allem der Trailing-Boden und die Tageszaehler) liegt in
  einer JSON-Datei. Ein Neustart mitten am Handelstag setzt das Tageslimit
  nicht zurueck - sonst waere der wichtigste Schutz nach jedem Absturz weg.
"""

from __future__ import annotations

import json
import logging
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

from .broker.base import Broker, BrokerError, BrokerPosition
from .engine import ExecutionSettings
from .journal import TradeJournal
from .models import ExitReason, Instrument, Side, Trade
from .risk import RiskManager, RiskSettings
from .rules import AccountState, AccountStatus, PropFirmRules
from .strategy.base import Strategy

__all__ = ["LiveSettings", "LiveTrader", "StepResult"]

log = logging.getLogger("propbot.live")


@dataclass(frozen=True, slots=True)
class LiveSettings:
    """Einstellungen des Live-Loops."""

    symbol: str = "EURUSD"
    timeframe: str = "M15"
    # Grosszuegig gewaehlt: EMA und ATR werden rekursiv gerechnet und haengen
    # damit an der gesamten Historie. Mit nur 250 statt 800 Kerzen weicht die
    # EMA200 im Test um rund 1,8 Pips ab - genug, um Signale an der Grenze zu
    # kippen. Der Rechenaufwand haengt fast nur an der Zahl der Aufrufe, nicht
    # an der Laenge, deshalb kostet die lange Historie praktisch nichts.
    history_bars: int = 800
    poll_seconds: int = 30
    dry_run: bool = True
    state_path: Path = Path("data/live_state.json")
    journal_path: Path = Path("data/journal.db")
    max_spread: float | None = None
    comment_prefix: str = "propbot"


@dataclass(slots=True)
class StepResult:
    """Was in einem Durchlauf passiert ist."""

    time: datetime
    action: str
    detail: str = ""
    status: AccountStatus = AccountStatus.RUNNING
    balance: float = 0.0
    equity: float = 0.0
    position: BrokerPosition | None = None
    extras: dict = field(default_factory=dict)

    @property
    def finished(self) -> bool:
        return self.status.is_final

    def __str__(self) -> str:
        return (
            f"{self.time:%Y-%m-%d %H:%M} | {self.action:<16} | "
            f"{self.balance:,.0f} $ / {self.equity:,.0f} $ | {self.detail}"
        )


class LiveTrader:
    """Fuehrt eine Strategie live (oder auf Papier) gegen einen Broker aus."""

    def __init__(
        self,
        broker: Broker,
        strategy: Strategy,
        instrument: Instrument,
        *,
        rules: PropFirmRules | None = None,
        risk: RiskSettings | None = None,
        execution: ExecutionSettings | None = None,
        settings: LiveSettings | None = None,
        journal: TradeJournal | None = None,
    ) -> None:
        self.broker = broker
        self.strategy = strategy
        self.instrument = instrument
        self.rules = rules or PropFirmRules()
        self.execution = execution or ExecutionSettings()
        self.settings = settings or LiveSettings()
        self.manager = RiskManager(risk or RiskSettings())
        self.account = self._load_state()
        self.journal = journal
        self.run_id: int | None = None
        self.open_trade: Trade | None = None
        self._balance_at_entry: float | None = None
        self._last_bar_time: pd.Timestamp | None = None
        self.history: list[StepResult] = []

    # -------------------------------------------------------------- Zustand
    def _load_state(self) -> AccountState:
        path = self.settings.state_path
        if path.exists():
            try:
                data = json.loads(path.read_text(encoding="utf-8"))
                state = AccountState.from_dict(data.get("account", {}), self.rules)
                log.info("Zustand geladen: Boden %.2f, Status %s", state.floor, state.status.value)
                return state
            except (json.JSONDecodeError, KeyError, ValueError) as error:
                log.warning("Zustandsdatei unbrauchbar (%s) - starte frisch.", error)
        return AccountState(self.rules, start_time=datetime.now(timezone.utc))

    def save_state(self) -> None:
        path = self.settings.state_path
        path.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "saved_at": datetime.now(timezone.utc).isoformat(),
            "account": self.account.to_dict(),
            "risk": {
                "loss_streak": self.manager.loss_streak,
                "win_streak": self.manager.win_streak,
                "streak_factor": self.manager.streak_factor,
                "day_trades": self.manager.day_trades,
                "day_losses": self.manager.day_losses,
            },
        }
        path.write_text(json.dumps(payload, indent=2, default=str), encoding="utf-8")

    # ----------------------------------------------------------- Hauptschritt
    def step(self) -> StepResult:
        """Ein Durchlauf: Konto pruefen, Position fuehren, Signal handeln."""
        info = self.broker.account()
        moment = info.server_time or self.broker.now()
        status = self.account.mark(moment, info.equity, info.balance)
        positions = self.broker.positions(self.settings.symbol)
        position = positions[0] if positions else None

        if position is None and self.open_trade is not None:
            self._register_close(moment, info.balance)

        if status.is_final:
            if position is not None:
                self._close(position, "regelstopp")
            return self._result(moment, "STOPP", status.label, info, position)

        if position is not None:
            return self._manage(moment, position, info)

        return self._look_for_entry(moment, info)

    def run(self, *, max_steps: int | None = None, sleep: bool = True) -> StepResult:
        """Laeuft, bis das Ziel erreicht, eine Regel gerissen oder Schluss ist."""
        result = self._result(self.broker.now(), "START", "", self.broker.account(), None)
        steps = 0
        while max_steps is None or steps < max_steps:
            try:
                result = self.step()
            except BrokerError as error:
                log.error("Brokerfehler: %s", error)
                result = StepResult(
                    time=datetime.now(timezone.utc), action="FEHLER", detail=str(error)
                )
            self.history.append(result)
            log.info("%s", result)
            self.save_state()
            if result.finished:
                log.info("Ende: %s", result.status.label)
                break
            steps += 1
            if sleep and self.settings.poll_seconds > 0:
                time.sleep(self.settings.poll_seconds)
        return result

    # ------------------------------------------------------------- Bausteine
    def _look_for_entry(self, moment, info) -> StepResult:
        settings = self.settings
        frame = self.broker.bars(settings.symbol, settings.timeframe, settings.history_bars)
        if len(frame) < self.strategy.warmup + 2:
            return self._result(moment, "WARTEN", "zu wenig Historie", info, None)

        last_time = frame.index[-1]
        if self._last_bar_time is not None and last_time <= self._last_bar_time:
            return self._result(moment, "WARTEN", "keine neue Kerze", info, None)

        data = self.strategy.prepare(frame)
        index = len(data) - 1
        signal = self.strategy.signal(data, index)
        self._last_bar_time = last_time
        if signal is None:
            return self._result(moment, "KEIN SIGNAL", f"Kerze {last_time:%H:%M}", info, None)

        bar_time = pd.Timestamp(last_time)
        if not self.strategy.allows_entry(bar_time):
            return self._result(moment, "GESPERRT", "ausserhalb der Handelszeit", info, None)

        price = float(data["close"].iloc[index])
        decision = self.manager.plan(
            self.account,
            self.instrument,
            signal.side,
            price,
            signal.stop_price,
            target_price=signal.target_price,
        )
        if not decision.allowed:
            return self._result(moment, "ABGELEHNT", decision.reason, info, None)

        detail = (
            f"{signal.side.label} {decision.size} {settings.symbol} @ ~{price:.5f}, "
            f"Stop {signal.stop_price:.5f}, Ziel {signal.target_price:.5f}, "
            f"Risiko {decision.risk_money:,.0f} $"
        )
        if settings.dry_run:
            return self._result(moment, "DRY-RUN", detail, info, None)

        position = self.broker.market_order(
            settings.symbol,
            signal.side,
            decision.size,
            stop_price=signal.stop_price,
            target_price=signal.target_price,
            comment=f"{settings.comment_prefix}:{signal.setup}"[:31],
        )
        self.open_trade = Trade(
            symbol=settings.symbol,
            side=signal.side,
            entry_time=position.opened_at or moment,
            entry_price=position.entry_price,
            size=position.size,
            stop_price=signal.stop_price,
            target_price=signal.target_price,
            risk_money=decision.risk_money,
            setup=signal.setup,
            context={**signal.context, **self.strategy.context(data, index)},
        )
        self._balance_at_entry = info.balance
        return self._result(moment, "EINGESTIEGEN", detail, info, position)

    def _manage(self, moment, position: BrokerPosition, info) -> StepResult:
        """Break-even, Trailing und Sessionende fuer die offene Position."""
        settings = self.settings
        frame = self.broker.bars(settings.symbol, settings.timeframe, self.strategy.warmup + 50)
        if frame.empty:
            return self._result(moment, "HALTEN", "keine Kurse", info, position)

        data = self.strategy.prepare(frame)
        close = float(data["close"].iloc[-1])
        atr_value = (
            float(data[self.execution.atr_column].iloc[-1])
            if self.execution.atr_column in data
            else 0.0
        )
        bar_time = pd.Timestamp(data.index[-1])

        # Auch hier zaehlt das Ende der Kerze (siehe propbot.engine).
        laenge = data.index.to_series().diff().median()
        ende = bar_time + (laenge if pd.notna(laenge) else pd.Timedelta(0))
        if self.execution.respect_session_flat and self.strategy.session.must_be_flat(ende):
            self._close(position, "sessionende")
            return self._result(moment, "GESCHLOSSEN", "Sessionende", info, None)

        if self.account.should_secure_payout():
            self._close(position, "payout")
            return self._result(moment, "GESCHLOSSEN", "Ziel erreicht - Payout", info, None)

        stop = position.stop_price
        if stop is None or self.open_trade is None:
            return self._result(moment, "HALTEN", f"Kurs {close:.5f}", info, position)

        distance = abs(self.open_trade.entry_price - self.open_trade.stop_price)
        if distance <= 0:
            return self._result(moment, "HALTEN", "Stopabstand unbekannt", info, position)
        r_now = (close - self.open_trade.entry_price) * position.side.sign / distance

        new_stop = stop
        if self.execution.breakeven_at_r is not None and r_now >= self.execution.breakeven_at_r:
            offset = self.execution.breakeven_offset_r * distance
            new_stop = self._tighter(
                position.side, new_stop, self.open_trade.entry_price + position.side.sign * offset
            )
        if (
            self.execution.trail_after_r is not None
            and atr_value > 0
            and r_now >= self.execution.trail_after_r
        ):
            trail = close - position.side.sign * self.execution.trail_atr_mult * atr_value
            new_stop = self._tighter(position.side, new_stop, trail)

        new_stop = self.instrument.round_price(new_stop)
        if abs(new_stop - stop) > self.instrument.tick_size or (
            self.instrument.tick_size == 0
            and round(new_stop, self.instrument.digits) != round(stop, self.instrument.digits)
        ):
            if settings.dry_run:
                return self._result(
                    moment, "DRY-RUN STOP", f"Stop {stop:.5f} -> {new_stop:.5f}", info, position
                )
            position = self.broker.modify(position, stop_price=new_stop)
            return self._result(
                moment, "STOP GEZOGEN", f"auf {new_stop:.5f} ({r_now:+.2f} R)", info, position
            )
        return self._result(moment, "HALTEN", f"{r_now:+.2f} R", info, position)

    def _tighter(self, side: Side, current: float, candidate: float) -> float:
        return max(current, candidate) if side is Side.LONG else min(current, candidate)

    def _close(self, position: BrokerPosition, reason: str) -> None:
        if self.settings.dry_run:
            log.info("DRY-RUN: wuerde Position %s schliessen (%s)", position.ticket, reason)
            return
        try:
            self.broker.close(position, comment=reason)
        except BrokerError as error:
            log.error("Schliessen fehlgeschlagen: %s", error)

    def _register_close(self, moment, balance: float) -> None:
        """Position ist beim Broker verschwunden -> Trade abschliessen und buchen."""
        trade = self.open_trade
        if trade is None:
            return
        pnl = balance - (self._balance_at_entry or balance)
        trade.gross_pnl = pnl
        trade.commission = 0.0
        trade.exit_time = moment
        trade.exit_price = None
        trade.exit_reason = ExitReason.TARGET if pnl > 0 else ExitReason.STOP
        self.account.apply_trade(moment, 0.0)  # Kontostand kommt vom Broker
        self.manager.register_result(trade.r_multiple, moment)
        self.strategy.on_trade_closed(trade)
        if self.journal is not None and self.run_id is not None:
            self.journal.record(self.run_id, trade)
        log.info("Trade geschlossen: %+.2f $ (%.2f R)", pnl, trade.r_multiple)
        self.open_trade = None
        self._balance_at_entry = None

    def _result(self, moment, action: str, detail: str, info, position) -> StepResult:
        return StepResult(
            time=moment if isinstance(moment, datetime) else datetime.now(timezone.utc),
            action=action,
            detail=detail,
            status=self.account.status,
            balance=info.balance,
            equity=info.equity,
            position=position,
            extras=self.manager.status(self.account),
        )

    def describe(self) -> str:
        """Kurzer Statusbericht fuer Logs und Konsole."""
        snapshot = self.account.snapshot()
        modus = "DRY-RUN (keine Orders)" if self.settings.dry_run else "Orders aktiv"
        return (
            f"{self.settings.symbol} {self.settings.timeframe} | "
            f"{type(self.broker).__name__} | {modus} | "
            f"Stand {snapshot['balance']} $ | Boden {snapshot['floor']} $ | "
            f"bis Ziel {snapshot['remaining_to_target']} $ | Status {snapshot['status']}"
        )
