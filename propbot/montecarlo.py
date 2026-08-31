"""Monte-Carlo-Simulation des Kontoverlaufs unter den echten Prop-Regeln.

Ein Backtest ist *ein* Pfad. Die Reihenfolge der Trades war Zufall - eine
andere Reihenfolge derselben Trades kann das Konto reissen oder zum Payout
bringen. Genau das misst dieses Modul: es zieht die R-Ergebnisse des Backtests
neu (Bootstrap) und laesst sie durch dasselbe Regelwerk laufen, inklusive
Trailing-Boden, Tageslimit, Handelslimits und adaptiver Positionsgroesse.

Das Ergebnis ist die einzige Zahl, die vor dem Kauf einer Challenge zaehlt:
**Wie wahrscheinlich ist der Payout, und wie wahrscheinlich der Bust?**

``block_size`` > 1 zieht zusammenhaengende Bloecke statt einzelner Trades. Das
erhaelt Verlustserien, die in echten Daten gehaeuft auftreten - ein reiner
Einzel-Bootstrap ist zu optimistisch.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone

import numpy as np

from .risk import RiskManager, RiskSettings
from .rules import AccountState, AccountStatus, PropFirmRules

__all__ = ["MonteCarloResult", "simulate", "sweep_risk"]

_START = datetime(2026, 1, 5, 9, 0, tzinfo=timezone.utc)


@dataclass(slots=True)
class MonteCarloResult:
    """Verteilung ueber viele simulierte Kontoverlaeufe."""

    runs: int
    prob_target: float
    prob_breach_drawdown: float
    prob_breach_daily: float
    prob_stalled: float
    prob_unfinished: float
    median_trades: float
    median_days: float
    balance_p05: float
    balance_p50: float
    balance_p95: float
    max_drawdown_p50: float
    max_drawdown_p95: float
    worst_streak_p95: float
    risk_money: float = 0.0
    expectancy_r: float = 0.0
    settings: dict[str, float | str] = field(default_factory=dict)

    @property
    def prob_breach(self) -> float:
        return self.prob_breach_drawdown + self.prob_breach_daily

    @property
    def prob_failed(self) -> float:
        """Alles, was kein Payout ist: gerissen, festgefahren oder nicht fertig.

        ``prob_stalled`` sind Konten, die formal noch leben, deren Puffer aber
        so klein ist, dass der Risk-Manager keinen Trade mehr freigibt. Auf dem
        echten Konto ist das dasselbe wie tot, nur langsamer.
        """
        return self.prob_breach + self.prob_stalled + self.prob_unfinished

    def describe(self) -> str:
        return (
            f"Payout {self.prob_target:.1%} | Bust {self.prob_breach:.1%} "
            f"(davon Tageslimit {self.prob_breach_daily:.1%}) | "
            f"festgefahren {self.prob_stalled:.1%} | offen {self.prob_unfinished:.1%} | "
            f"Median {self.median_trades:.0f} Trades / {self.median_days:.0f} Tage | "
            f"Endstand p05/p50/p95: {self.balance_p05:,.0f} / {self.balance_p50:,.0f} / "
            f"{self.balance_p95:,.0f} $"
        )

    def verdict(self) -> str:
        """Klartext-Einschaetzung fuer den Report."""
        if self.prob_target >= 0.80:
            return "Solide: das Regelwerk passt zum Edge."
        if self.prob_target >= 0.60:
            return "Machbar, aber teuer - Risiko senken oder Edge verbessern."
        if self.prob_target >= 0.40:
            return "Grenzwertig: eher Muenzwurf als Geschaeftsmodell."
        return "Finger weg: mit diesen Zahlen ist die Challenge ein Lottoschein."


def simulate(
    r_multiples: list[float] | np.ndarray,
    *,
    rules: PropFirmRules | None = None,
    risk_settings: RiskSettings | None = None,
    risk_money: float | None = None,
    runs: int = 3_000,
    max_trades: int = 400,
    trades_per_day: int = 2,
    block_size: int = 1,
    adaptive_risk: bool = True,
    seed: int = 7,
) -> MonteCarloResult:
    """Simuliert ``runs`` Kontoverlaeufe aus den gegebenen R-Ergebnissen."""
    values = np.asarray(list(r_multiples), dtype=float)
    if values.size == 0:
        raise ValueError("Ohne Trades laesst sich nichts simulieren.")
    if runs < 1 or max_trades < 1:
        raise ValueError("runs und max_trades muessen positiv sein.")
    if trades_per_day < 1:
        raise ValueError("trades_per_day muss mindestens 1 sein.")

    rules = rules or PropFirmRules()
    risk_settings = risk_settings or RiskSettings()
    fixed_risk = risk_money or rules.start_balance * risk_settings.base_risk_pct
    rng = np.random.default_rng(seed)

    outcomes = np.zeros(runs, dtype=int)
    balances = np.zeros(runs)
    trade_counts = np.zeros(runs)
    day_counts = np.zeros(runs)
    drawdowns = np.zeros(runs)
    streaks = np.zeros(runs)

    for run in range(runs):
        sequence = _bootstrap(values, max_trades, block_size, rng)
        account = AccountState(rules, start_time=_START)
        manager = RiskManager(risk_settings)
        peak = account.balance
        worst = 0.0
        streak = longest = 0
        moment = _START
        used_today = 0
        index = 0
        stalled = False

        for r_value in sequence:
            if used_today >= trades_per_day:
                moment = _next_day(moment)
                used_today = 0
                account.mark(moment, account.equity)  # Tageswechsel im Konto
            if not manager.trading_allowed(account).allowed:
                if account.status.is_final:
                    break
                # Heute gesperrt (Verluste, Tagesstop) -> morgen weiter.
                moment = _next_day(moment)
                used_today = 0
                account.mark(moment, account.equity)
                if not manager.trading_allowed(account).allowed:
                    stalled = True  # dauerhaft gesperrt, z. B. Puffer aufgebraucht
                    break

            risk = manager.budget(account) if adaptive_risk else fixed_risk
            if risk < risk_settings.min_risk_money:
                stalled = True
                break
            status = account.apply_trade(moment, r_value * risk)
            manager.register_result(r_value, moment)
            used_today += 1
            index += 1
            moment += timedelta(minutes=90)

            peak = max(peak, account.balance)
            worst = max(worst, peak - account.balance)
            streak = streak + 1 if r_value < 0 else 0
            longest = max(longest, streak)
            if status.is_final:
                break

        outcomes[run] = 4 if (stalled and not account.status.is_final) else _encode(account.status)
        balances[run] = account.balance
        trade_counts[run] = index
        day_counts[run] = max(1, len(account.trading_days))
        drawdowns[run] = worst
        streaks[run] = longest

    return MonteCarloResult(
        runs=runs,
        prob_target=float((outcomes == 1).mean()),
        prob_breach_drawdown=float((outcomes == 2).mean()),
        prob_breach_daily=float((outcomes == 3).mean()),
        prob_stalled=float((outcomes == 4).mean()),
        prob_unfinished=float((outcomes == 0).mean()),
        median_trades=float(np.median(trade_counts)),
        median_days=float(np.median(day_counts)),
        balance_p05=float(np.percentile(balances, 5)),
        balance_p50=float(np.percentile(balances, 50)),
        balance_p95=float(np.percentile(balances, 95)),
        max_drawdown_p50=float(np.percentile(drawdowns, 50)),
        max_drawdown_p95=float(np.percentile(drawdowns, 95)),
        worst_streak_p95=float(np.percentile(streaks, 95)),
        risk_money=fixed_risk,
        expectancy_r=float(values.mean()),
        settings={
            "runs": runs,
            "block_size": block_size,
            "trades_per_day": trades_per_day,
            "adaptive_risk": str(adaptive_risk),
            "sample_trades": int(values.size),
        },
    )


def sweep_risk(
    r_multiples: list[float] | np.ndarray,
    risks: list[float],
    *,
    rules: PropFirmRules | None = None,
    runs: int = 1_500,
    **kwargs,
) -> list[MonteCarloResult]:
    """Dieselbe Simulation fuer mehrere Risikogroessen - zeigt das Optimum.

    Typisches Ergebnis: die Payout-Wahrscheinlichkeit steigt bis zu einem
    Maximum und faellt danach steil ab. Mehr Risiko bringt ab diesem Punkt
    nicht mehr Gewinn, sondern nur noch mehr Bust.
    """
    results = []
    for risk in risks:
        results.append(
            simulate(
                r_multiples,
                rules=rules,
                risk_money=risk,
                runs=runs,
                adaptive_risk=False,
                **kwargs,
            )
        )
    return results


def format_sweep(results: list[MonteCarloResult], rules: PropFirmRules) -> str:
    """Formatiert einen Risiko-Sweep als Tabelle."""
    lines = [
        f"{'Risiko':>9} {'% Konto':>8} {'Payout':>8} {'Bust':>7} {'fest':>7} {'Trades':>7} "
        f"{'Endstand p05':>13}",
        "-" * 62,
    ]
    for result in results:
        lines.append(
            f"{result.risk_money:>9,.0f} "
            f"{result.risk_money / rules.start_balance:>7.2%} "
            f"{result.prob_target:>8.1%} {result.prob_breach:>7.1%} "
            f"{result.prob_stalled:>7.1%} "
            f"{result.median_trades:>7.0f} {result.balance_p05:>13,.0f}"
        )
    return "\n".join(lines)


def _bootstrap(
    values: np.ndarray, length: int, block_size: int, rng: np.random.Generator
) -> np.ndarray:
    """Zieht eine Trade-Folge - einzeln oder in Bloecken (erhaelt Serien)."""
    if block_size <= 1:
        return rng.choice(values, size=length, replace=True)
    blocks = int(np.ceil(length / block_size))
    starts = rng.integers(0, values.size, size=blocks)
    pieces = [
        np.take(values, np.arange(start, start + block_size), mode="wrap") for start in starts
    ]
    return np.concatenate(pieces)[:length]


def _next_day(moment: datetime) -> datetime:
    """Naechster Werktag, 9:00 UTC."""
    following = moment + timedelta(days=1)
    while following.weekday() >= 5:
        following += timedelta(days=1)
    return following.replace(hour=9, minute=0, second=0, microsecond=0)


def _encode(status: AccountStatus) -> int:
    return {
        AccountStatus.RUNNING: 0,
        AccountStatus.TARGET_REACHED: 1,
        AccountStatus.BREACHED_DRAWDOWN: 2,
        AccountStatus.BREACHED_DAILY_LOSS: 3,
    }[status]
