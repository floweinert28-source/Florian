"""Kennzahlen eines Backtests - und zwar die, die auf einem Prop-Konto zaehlen.

Rendite allein sagt hier nichts. Entscheidend sind drei Fragen:

1. Wird das Ziel erreicht, bevor der Boden gerissen wird?
2. Wie tief ist der schlimmste Rueckgang unterwegs (gegen 2.000 $ Puffer)?
3. Reicht der Vorsprung gegenueber den Kosten, oder lebt der Edge von einem
   halben Pip?
"""

from __future__ import annotations

import statistics
from collections import Counter
from dataclasses import dataclass, field
from datetime import date

import pandas as pd

from .models import ExitReason, Trade
from .rules import AccountStatus, PropFirmRules

__all__ = ["PerformanceReport", "compute", "format_report"]


@dataclass(slots=True)
class PerformanceReport:
    """Alle Kennzahlen eines Laufs an einem Ort."""

    trades: int = 0
    wins: int = 0
    losses: int = 0
    scratches: int = 0
    net_profit: float = 0.0
    gross_win: float = 0.0
    gross_loss: float = 0.0
    win_rate: float = 0.0
    expectancy_r: float = 0.0
    avg_win_r: float = 0.0
    avg_loss_r: float = 0.0
    payoff_ratio: float = 0.0
    profit_factor: float = 0.0
    r_std: float = 0.0
    max_drawdown: float = 0.0
    max_drawdown_r: float = 0.0
    longest_loss_streak: int = 0
    trading_days: int = 0
    trades_per_day: float = 0.0
    best_day: float = 0.0
    worst_day: float = 0.0
    best_day_share: float | None = None
    sharpe: float = 0.0
    sortino: float = 0.0
    avg_duration_min: float = 0.0
    exit_reasons: dict[str, int] = field(default_factory=dict)
    setups: dict[str, dict[str, float]] = field(default_factory=dict)
    status: AccountStatus = AccountStatus.RUNNING
    final_balance: float = 0.0
    days_to_target: int | None = None
    total_costs: float = 0.0
    cost_per_trade_r: float = 0.0
    cost_share_of_gross: float = 0.0

    @property
    def target_reached(self) -> bool:
        return self.status is AccountStatus.TARGET_REACHED

    @property
    def breached(self) -> bool:
        return self.status.is_breach


def compute(
    trades: list[Trade],
    equity_curve: pd.Series | None,
    rules: PropFirmRules,
    *,
    status: AccountStatus = AccountStatus.RUNNING,
    final_balance: float | None = None,
) -> PerformanceReport:
    """Verdichtet Trades und Equity-Kurve zu einem Report."""
    report = PerformanceReport(status=status)
    closed = [trade for trade in trades if not trade.is_open]
    report.trades = len(closed)
    report.final_balance = (
        final_balance
        if final_balance is not None
        else rules.start_balance + sum(trade.pnl for trade in closed)
    )
    report.net_profit = report.final_balance - rules.start_balance
    if not closed:
        return report

    r_values = [trade.r_multiple for trade in closed]
    wins = [value for value in r_values if value > 0.0001]
    losses = [value for value in r_values if value < -0.0001]
    report.wins = len(wins)
    report.losses = len(losses)
    report.scratches = report.trades - report.wins - report.losses
    report.win_rate = report.wins / report.trades
    report.expectancy_r = sum(r_values) / report.trades
    report.avg_win_r = sum(wins) / len(wins) if wins else 0.0
    report.avg_loss_r = sum(losses) / len(losses) if losses else 0.0
    report.payoff_ratio = abs(report.avg_win_r / report.avg_loss_r) if losses else float("inf")
    report.r_std = statistics.pstdev(r_values) if len(r_values) > 1 else 0.0

    report.gross_win = sum(trade.pnl for trade in closed if trade.pnl > 0)
    report.gross_loss = -sum(trade.pnl for trade in closed if trade.pnl < 0)
    report.profit_factor = (
        report.gross_win / report.gross_loss if report.gross_loss > 0 else float("inf")
    )
    report.total_costs = sum(trade.total_costs for trade in closed)
    report.cost_per_trade_r = (
        report.total_costs
        / report.trades
        / (sum(trade.risk_money for trade in closed) / report.trades)
        if report.trades
        else 0.0
    )
    gross_before_costs = sum(abs(trade.gross_pnl) + trade.spread_cost for trade in closed)
    report.cost_share_of_gross = (
        report.total_costs / gross_before_costs if gross_before_costs else 0.0
    )

    report.longest_loss_streak = _longest_streak(r_values)
    report.avg_duration_min = sum(trade.duration_minutes for trade in closed) / report.trades
    report.exit_reasons = dict(
        Counter(
            trade.exit_reason.value if trade.exit_reason else "offen" for trade in closed
        ).most_common()
    )
    report.setups = _setup_stats(closed)

    daily = _daily_pnl(closed, rules)
    report.trading_days = len(daily)
    report.trades_per_day = report.trades / max(1, report.trading_days)
    if daily:
        report.best_day = max(daily.values())
        report.worst_day = min(daily.values())
        positive = [value for value in daily.values() if value > 0]
        if report.net_profit > 0 and positive:
            report.best_day_share = max(positive) / report.net_profit
        returns = [value / rules.start_balance for value in daily.values()]
        report.sharpe = _sharpe(returns)
        report.sortino = _sortino(returns)

    if equity_curve is not None and len(equity_curve) > 1:
        peak = equity_curve.cummax()
        drawdown = peak - equity_curve
        report.max_drawdown = float(drawdown.max())
    else:
        report.max_drawdown = _drawdown_from_trades(closed)
    average_risk = sum(trade.risk_money for trade in closed) / report.trades
    report.max_drawdown_r = report.max_drawdown / average_risk if average_risk else 0.0

    if status is AccountStatus.TARGET_REACHED:
        report.days_to_target = report.trading_days
    return report


def _setup_stats(trades: list[Trade]) -> dict[str, dict[str, float]]:
    """Kennzahlen je Setup - zeigt sofort, welche Variante Geld verbrennt."""
    grouped: dict[str, list[Trade]] = {}
    for trade in trades:
        grouped.setdefault(trade.setup or "unbenannt", []).append(trade)
    result: dict[str, dict[str, float]] = {}
    for setup, items in sorted(grouped.items()):
        r_values = [trade.r_multiple for trade in items]
        result[setup] = {
            "trades": len(items),
            "win_rate": sum(1 for value in r_values if value > 0) / len(items),
            "expectancy_r": sum(r_values) / len(items),
            "pnl": sum(trade.pnl for trade in items),
        }
    return result


def _daily_pnl(trades: list[Trade], rules: PropFirmRules) -> dict[date, float]:
    daily: dict[date, float] = {}
    for trade in trades:
        moment = trade.exit_time or trade.entry_time
        key = rules.day_key(moment)
        daily[key] = daily.get(key, 0.0) + trade.pnl
    return daily


def _longest_streak(r_values: list[float]) -> int:
    longest = current = 0
    for value in r_values:
        if value < 0:
            current += 1
            longest = max(longest, current)
        else:
            current = 0
    return longest


def _drawdown_from_trades(trades: list[Trade]) -> float:
    equity = peak = 0.0
    worst = 0.0
    for trade in trades:
        equity += trade.pnl
        peak = max(peak, equity)
        worst = max(worst, peak - equity)
    return worst


def _sharpe(returns: list[float], periods: int = 252) -> float:
    if len(returns) < 2:
        return 0.0
    deviation = statistics.pstdev(returns)
    if deviation == 0:
        return 0.0
    return (statistics.fmean(returns) / deviation) * (periods**0.5)


def _sortino(returns: list[float], periods: int = 252) -> float:
    if len(returns) < 2:
        return 0.0
    downside = [value for value in returns if value < 0]
    if not downside:
        return float("inf")
    deviation = (sum(value**2 for value in downside) / len(returns)) ** 0.5
    if deviation == 0:
        return 0.0
    return (statistics.fmean(returns) / deviation) * (periods**0.5)


def _reason_label(key: str) -> str:
    try:
        return ExitReason(key).label
    except ValueError:
        return key


def format_report(report: PerformanceReport, rules: PropFirmRules, title: str = "Backtest") -> str:
    """Formatiert den Report als Text fuer Konsole und Markdown-Datei."""
    lines = [
        f"=== {title} ===",
        f"Status:            {report.status.label}",
        f"Endstand:          {report.final_balance:,.2f} $  "
        f"({report.net_profit:+,.2f} $ / Ziel {rules.profit_target:,.0f} $)",
        f"Trades:            {report.trades} in {report.trading_days} Handelstagen "
        f"({report.trades_per_day:.2f}/Tag)",
        f"Trefferquote:      {report.win_rate:.1%} "
        f"({report.wins}W / {report.losses}V / {report.scratches}N)",
        f"Erwartungswert:    {report.expectancy_r:+.3f} R je Trade (Streuung {report.r_std:.2f} R)",
        f"Gewinn/Verlust:    +{report.avg_win_r:.2f} R / {report.avg_loss_r:.2f} R "
        f"(Payoff {report.payoff_ratio:.2f})",
        f"Profitfaktor:      {report.profit_factor:.2f}",
        f"Max. Drawdown:     {report.max_drawdown:,.2f} $ "
        f"({report.max_drawdown_r:.1f} R, Puffer {rules.max_drawdown:,.0f} $)",
        f"Laengste Serie:    {report.longest_loss_streak} Verluste in Folge",
        f"Bester/schlechtester Tag: {report.best_day:+,.0f} $ / {report.worst_day:+,.0f} $",
        f"Kosten:            {report.total_costs:,.2f} $ gesamt "
        f"({report.cost_per_trade_r:.3f} R je Trade, "
        f"{report.cost_share_of_gross:.1%} der Bruttobewegung)",
        f"Sharpe / Sortino:  {report.sharpe:.2f} / {report.sortino:.2f}",
        f"Haltedauer:        {report.avg_duration_min:.0f} Minuten im Schnitt",
    ]
    if report.best_day_share is not None and rules.consistency_cap:
        verdict = "ok" if report.best_day_share <= rules.consistency_cap else "VERLETZT"
        lines.append(
            f"Konsistenz:        bester Tag = {report.best_day_share:.0%} des Gewinns "
            f"(Limit {rules.consistency_cap:.0%}) -> {verdict}"
        )
    if report.exit_reasons:
        reasons = ", ".join(
            f"{_reason_label(key)}: {count}" for key, count in report.exit_reasons.items()
        )
        lines.append(f"Ausstiege:         {reasons}")
    if len(report.setups) > 1:
        lines.append("Setups:")
        for setup, stats in report.setups.items():
            lines.append(
                f"  {setup:<28} {int(stats['trades']):>4} Trades  "
                f"{stats['win_rate']:>5.1%}  {stats['expectancy_r']:+.3f} R  "
                f"{stats['pnl']:+,.0f} $"
            )
    return "\n".join(lines)
