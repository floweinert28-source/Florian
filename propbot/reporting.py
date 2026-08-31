"""Rechenberichte: was dieses Konto verlangt, bevor die erste Order laeuft.

Die Funktionen hier erzeugen Text - bewusst kein Diagramm und keine bunte
Oberflaeche. Der Bericht soll die Fragen beantworten, an denen Prop-Konten
tatsaechlich scheitern:

* Welche Trefferquote braucht die Strategie bei welchem CRV ueberhaupt?
* Welches Risiko je Trade maximiert die Payout-Chance - und ab wo kippt es?
* Wie viele Verluste in Folge haelt der Puffer aus?
* Was kosten Spread und Kommission, gemessen in R?
* Wo beissen sich Tageslimit und Positionsgroesse?
"""

from __future__ import annotations

from .models import Instrument
from .riskmath import (
    breakeven_win_rate,
    expectancy_r,
    half_life_of_edge,
    kelly_fraction,
    max_consecutive_losses,
    prob_loss_streak,
    prob_target_before_ruin,
    trades_needed,
)
from .risk import RiskSettings
from .rules import PropFirmRules

__all__ = [
    "cost_report",
    "safe_risk_for_daily_limit",
    "worst_daily_loss",
    "daily_limit_report",
    "full_math_report",
    "risk_table",
    "rules_report",
    "scenario_matrix",
    "streak_report",
]


def rules_report(rules: PropFirmRules) -> str:
    """Das Regelwerk in Klartext plus die erste harte Konsequenz."""
    lines = ["=== Konto und Regeln ===", rules.describe(), ""]
    lines.append(
        f"Kernproblem: du musst {rules.profit_target:,.0f} $ verdienen und darfst dabei "
        f"nie mehr als {rules.max_drawdown:,.0f} $ verlieren."
    )
    lines.append(
        f"Anders gesagt: die Strategie muss {rules.target_to_drawdown:.1f}x ihren eigenen "
        f"Notgroschen erwirtschaften, bevor eine Pechserie ihn aufbraucht."
    )
    if rules.is_trailing:
        lines.append(
            "Der Boden folgt dem Hoch nach oben. Ein Buchgewinn, den du wieder "
            "hergibst, verkleinert den Puffer dauerhaft - Gewinne mitnehmen ist "
            "hier keine Geschmacksfrage, sondern Regelwerk."
        )
    if rules.daily_loss_limit:
        ratio = rules.max_drawdown / rules.daily_loss_limit
        lines.append(
            f"Das Tageslimit von {rules.daily_loss_limit:,.0f} $ bedeutet: zwei schlechte "
            f"Tage kosten dich {2 / ratio:.0%} des gesamten Puffers."
        )
    return "\n".join(lines)


def risk_table(
    rules: PropFirmRules,
    *,
    win_rate: float = 0.45,
    reward_ratio: float = 2.0,
    risks: tuple[float, ...] = (100, 150, 200, 250, 300, 400, 500, 750, 1000),
    cost_r: float = 0.05,
) -> str:
    """Payout- und Bust-Wahrscheinlichkeit je Risikogroesse (exakt gerechnet)."""
    lines = [
        f"=== Risiko je Trade (Trefferquote {win_rate:.0%}, CRV {reward_ratio:.1f}, "
        f"Kosten {cost_r:.2f} R) ===",
        f"{'Risiko':>8} {'% Konto':>8} {'Verluste':>9} {'Payout':>8} {'Bust':>8} "
        f"{'Trades bis Ziel':>16}",
        "-" * 62,
    ]
    best = None
    for risk in risks:
        result = prob_target_before_ruin(
            win_rate,
            reward_ratio,
            risk,
            budget=rules.max_drawdown,
            target=rules.profit_target,
            cost_r=cost_r,
        )
        lines.append(
            f"{risk:>8,.0f} {risk / rules.start_balance:>7.2%} "
            f"{result.max_losses_in_row:>9} {result.prob_target:>8.1%} "
            f"{result.prob_ruin:>8.1%} {result.expected_trades:>16.0f}"
        )
        if best is None or result.prob_target > best[1]:
            best = (risk, result.prob_target)
    if best:
        lines.append("")
        lines.append(
            f"Hoechste Payout-Wahrscheinlichkeit bei {best[0]:,.0f} $ Risiko "
            f"({best[1]:.1%}). Kleiner ist fast immer besser: der Erwartungswert "
            f"je Trade aendert sich nicht, das Ruinrisiko schon."
        )
    return "\n".join(lines)


def scenario_matrix(
    rules: PropFirmRules,
    *,
    risk_money: float = 250.0,
    win_rates: tuple[float, ...] = (0.35, 0.40, 0.45, 0.50, 0.55, 0.60),
    reward_ratios: tuple[float, ...] = (1.0, 1.5, 2.0, 2.5, 3.0),
    cost_r: float = 0.05,
) -> str:
    """Payout-Wahrscheinlichkeit ueber Trefferquote und CRV - die Landkarte."""
    lines = [
        f"=== Payout-Wahrscheinlichkeit bei {risk_money:,.0f} $ Risiko je Trade ===",
        "Zeilen: Trefferquote | Spalten: Chance-Risiko-Verhaeltnis",
        "        " + "".join(f"{ratio:>9.1f}R" for ratio in reward_ratios),
    ]
    for win_rate in win_rates:
        cells = []
        for ratio in reward_ratios:
            if expectancy_r(win_rate, ratio, cost_r) <= 0:
                cells.append(f"{'kein Edge':>10}")
                continue
            result = prob_target_before_ruin(
                win_rate,
                ratio,
                risk_money,
                budget=rules.max_drawdown,
                target=rules.profit_target,
                cost_r=cost_r,
            )
            cells.append(f"{result.prob_target:>10.0%}")
        lines.append(f"{win_rate:>7.0%} " + "".join(cells))
    lines.append("")
    lines.append("Break-even-Trefferquoten (inkl. Kosten):")
    for ratio in reward_ratios:
        lines.append(
            f"  CRV {ratio:.1f} -> mindestens {breakeven_win_rate(ratio, cost_r):.1%} Treffer"
        )
    return "\n".join(lines)


def streak_report(
    rules: PropFirmRules,
    *,
    win_rate: float = 0.45,
    risk_money: float = 250.0,
    trades: int = 200,
) -> str:
    """Wie wahrscheinlich Verlustserien sind - und was der Puffer aushaelt."""
    survivable = max_consecutive_losses(risk_money, rules.max_drawdown)
    lines = [
        "=== Verlustserien ===",
        f"Bei {risk_money:,.0f} $ Risiko haelt der Puffer {survivable} Verluste in Folge aus.",
        f"Wahrscheinlichkeit, in {trades} Trades mindestens eine Serie dieser Laenge zu sehen:",
    ]
    loss_rate = 1 - win_rate
    for streak in range(3, min(survivable + 4, 15)):
        probability = prob_loss_streak(loss_rate, streak, trades)
        marker = "  <- reisst das Konto" if streak >= survivable else ""
        lines.append(f"  {streak:>2} Verluste in Folge: {probability:>6.1%}{marker}")
    lines.append("")
    lines.append(
        "Genau deshalb halbiert der Risk-Manager die Groesse nach zwei Verlusten "
        "in Folge: die Serie wird dadurch nicht kuerzer, aber billiger."
    )
    return "\n".join(lines)


def cost_report(
    instrument: Instrument,
    *,
    stop_distance: float,
    risk_money: float = 250.0,
    trades_per_month: int = 40,
) -> str:
    """Was Spread, Slippage und Kommission wirklich kosten - in R und in Geld."""
    risk_per_unit = stop_distance * instrument.value_per_point + instrument.commission
    size = risk_money / risk_per_unit
    price_cost = (instrument.spread + 2 * instrument.slippage) * instrument.value_per_point * size
    commission = instrument.commission_for(size) * 2
    total = price_cost + commission
    cost_r = total / risk_money
    lines = [
        f"=== Kosten je Trade ({instrument.symbol}) ===",
        f"Stopabstand:        {stop_distance:.5f} "
        f"({stop_distance * 10_000:.1f} Pips bei 4 Stellen)",
        f"Positionsgroesse:   {size:.2f} bei {risk_money:,.0f} $ Risiko",
        f"Spread + Slippage:  {price_cost:,.2f} $",
        f"Kommission (2x):    {commission:,.2f} $",
        f"Summe:              {total:,.2f} $  =  {cost_r:.3f} R je Trade",
        "",
        f"Auf {trades_per_month} Trades im Monat sind das {total * trades_per_month:,.0f} $ - "
        f"{total * trades_per_month / risk_money:.1f} R, die die Strategie erst verdienen muss.",
    ]
    if cost_r > 0.1:
        lines.append(
            "Warnung: ueber 0,10 R je Trade. Entweder groesserer Stopabstand "
            "(weniger Trades, mehr Substanz) oder ein guenstigeres Instrument."
        )
    return "\n".join(lines)


def worst_daily_loss(risk_money: float, settings: RiskSettings, limit: float) -> float:
    """Groesster Tagesverlust, den die eigenen Regeln noch zulassen.

    Der eigene Tagesstop greift erst, *nachdem* ein bestimmter Anteil des
    Limits verbraucht ist. Solange der Verbrauch darunter liegt, ist ein
    weiterer Trade erlaubt - der letzte Verlust kann das Limit also
    ueberspringen. Genau diese Luecke wird hier ausgerechnet.
    """
    stop_at = limit * settings.own_daily_stop_fraction
    used = 0.0
    trades = 0
    while trades < settings.max_losses_per_day and used < stop_at:
        used += risk_money
        trades += 1
    return used


def safe_risk_for_daily_limit(
    rules: PropFirmRules, settings: RiskSettings, *, step: float = 5.0
) -> tuple[float, list[tuple[float, float]]]:
    """Groesstes sicheres Risiko und die Zone, in der das Tageslimit reisst."""
    limit = rules.daily_loss_limit
    if not limit:
        return float("inf"), []
    safe = 0.0
    danger: list[tuple[float, float]] = []
    risk = step
    still_safe = True
    while risk <= limit:
        worst = worst_daily_loss(risk, settings, limit)
        if worst < limit:
            # Nur der zusammenhaengende Bereich ab null zaehlt als sicher.
            # Oberhalb der Gefahrenzone gibt es zwar wieder "sichere" Werte
            # (ein einziger Trade sprengt das Tagesbudget dann allein), das ist
            # aber kein sinnvoller Handelsbereich.
            if still_safe:
                safe = risk
        else:
            still_safe = False
            danger.append((risk, worst))
        risk += step
    return safe, danger


def daily_limit_report(rules: PropFirmRules, settings: RiskSettings | None = None) -> str:
    """Die Falle, die im Monte-Carlo sichtbar wurde: Risiko gegen Tageslimit.

    Wenn zwei Verluste exakt das Tageslimit treffen, ist ein einziger schlechter
    Tag das Ende - obwohl der grosse Puffer noch halb voll ist. Der eigene
    Tagesstop muss also *vor* dem Limit greifen, und die Positionsgroesse muss
    dazu passen.
    """
    settings = settings or RiskSettings()
    limit = rules.daily_loss_limit
    if not limit:
        return "=== Tageslimit ===\nKein Tageslimit gesetzt."
    stop_at = limit * settings.own_daily_stop_fraction
    safe, danger = safe_risk_for_daily_limit(rules, settings)
    base_risk = rules.start_balance * settings.base_risk_pct
    lines = [
        "=== Tageslimit und Positionsgroesse ===",
        f"Limit der Firma:        {limit:,.0f} $",
        f"Eigener Stop bei:       {stop_at:,.0f} $ "
        f"({settings.own_daily_stop_fraction:.0%} des Limits)",
        f"Max. Verluste am Tag:   {settings.max_losses_per_day}",
        "",
        f"Groesstes Risiko, bei dem selbst der schlechteste Tag das Limit nicht "
        f"reisst: {safe:,.0f} $ je Trade.",
        f"Basisrisiko {settings.base_risk_pct:.2%} = {base_risk:,.0f} $ -> "
        + ("passt." if base_risk <= safe else "ZU GROSS, Basisrisiko senken."),
    ]
    if danger:
        low = min(value for value, _ in danger)
        high = max(value for value, _ in danger)
        lines += [
            "",
            f"Gefahrenzone: zwischen {low:,.0f} $ und {high:,.0f} $ Risiko je Trade "
            f"kann ein einziger Tag das Limit reissen,",
            "obwohl der grosse Puffer noch fast voll ist. Die Monte-Carlo-Simulation "
            "zeigt genau dort einen Sprung der Bust-Rate.",
        ]
    return "\n".join(lines)


def full_math_report(
    rules: PropFirmRules | None = None,
    instrument: Instrument | None = None,
    *,
    win_rate: float = 0.45,
    reward_ratio: float = 2.0,
    risk_money: float = 250.0,
    cost_r: float = 0.05,
    stop_distance: float = 0.0015,
) -> str:
    """Der komplette Rechenbericht - genau das, was vor dem Start zu klaeren ist."""
    rules = rules or PropFirmRules()
    if instrument is not None:
        # Kosten nicht schaetzen, sondern aus Spread, Slippage und Kommission
        # des Instruments ausrechnen - sie gehen in jede Tabelle mit ein.
        risk_per_unit = stop_distance * instrument.value_per_point + instrument.commission
        size = risk_money / risk_per_unit
        cost_r = (
            (instrument.spread + 2 * instrument.slippage) * instrument.value_per_point * size
            + instrument.commission_for(size) * 2
        ) / risk_money
    parts = [
        rules_report(rules),
        "",
        risk_table(rules, win_rate=win_rate, reward_ratio=reward_ratio, cost_r=cost_r),
    ]
    parts += ["", scenario_matrix(rules, risk_money=risk_money, cost_r=cost_r)]
    parts += ["", streak_report(rules, win_rate=win_rate, risk_money=risk_money)]
    if instrument is not None:
        parts += ["", cost_report(instrument, stop_distance=stop_distance, risk_money=risk_money)]
    parts += ["", daily_limit_report(rules)]

    edge = expectancy_r(win_rate, reward_ratio, cost_r)
    needed = trades_needed(win_rate, reward_ratio, risk_money, rules.profit_target)
    parts += [
        "",
        "=== Fazit ===",
        f"Erwartungswert:     {edge:+.3f} R je Trade "
        f"({edge * risk_money:+,.0f} $ bei {risk_money:,.0f} $ Risiko)",
        f"Trades bis Ziel:    {needed:.0f} im Erwartungswert (ohne Pech-Serien)",
        f"Kelly-Obergrenze:   {kelly_fraction(win_rate, reward_ratio):.1%} des Kapitals - "
        f"gehandelt wird ein Bruchteil davon",
        f"Sicherheitsmarge:   {half_life_of_edge(win_rate, reward_ratio):.1f} Prozentpunkte "
        f"Trefferquote bis zum Break-even",
    ]
    if half_life_of_edge(win_rate, reward_ratio) < 5:
        parts.append(
            "Achtung: unter 5 Prozentpunkten Marge ist der Edge zu duenn fuer "
            "Live-Bedingungen (Slippage, Requotes, schlechtere Fills)."
        )
    return "\n".join(parts)
