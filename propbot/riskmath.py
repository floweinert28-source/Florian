"""Zustandslose Risikomathematik: Erwartungswert, Kelly, Ruinwahrscheinlichkeit.

Die zentrale Frage eines 50k-Kontos mit +4.000 $ Ziel und 2.000 $ Drawdown ist
nicht "welcher Indikator", sondern: *Reicht mein Puffer, um zwei Drawdown-
Budgets zu verdienen, bevor eine Verlustserie ihn auffrisst?*

Alles hier rechnet in **R** (ein R = geplantes Risiko eines Trades). Das macht
die Formeln unabhaengig von Kontogroesse und Instrument.

Kern ist :func:`prob_target_before_ruin`: ein exakt geloester Random Walk mit
zwei absorbierenden Raendern (Ziel und Boden) statt einer Faustformel. Der
Walk laeuft auf einem Gitter aus ``risk / resolution``-Schritten, damit auch
krumme Chance-Risiko-Verhaeltnisse wie 1.7R sauber abgebildet werden.
"""

from __future__ import annotations

from dataclasses import dataclass
from math import ceil, inf, log

import numpy as np

__all__ = [
    "RuinResult",
    "half_life_of_edge",
    "log_growth_rate",
    "breakeven_win_rate",
    "expectancy_r",
    "kelly_fraction",
    "max_consecutive_losses",
    "prob_target_before_ruin",
    "prob_loss_streak",
    "risk_sweep",
    "trades_needed",
]


def expectancy_r(win_rate: float, reward_ratio: float, cost_r: float = 0.0) -> float:
    """Erwartungswert je Trade in R.

    ``cost_r`` sind Kosten (Spread, Kommission, Slippage) als Anteil eines R.
    Bei 250 $ Risiko und 12 $ Kosten je Trade also ``0.048``.
    """
    win_rate = _check_probability(win_rate)
    if reward_ratio <= 0:
        raise ValueError("reward_ratio muss positiv sein.")
    return win_rate * reward_ratio - (1 - win_rate) - cost_r


def breakeven_win_rate(reward_ratio: float, cost_r: float = 0.0) -> float:
    """Trefferquote, ab der die Strategie ueberhaupt Geld verdient."""
    if reward_ratio <= 0:
        raise ValueError("reward_ratio muss positiv sein.")
    return (1 + cost_r) / (1 + reward_ratio)


def kelly_fraction(win_rate: float, reward_ratio: float) -> float:
    """Kelly-Anteil des Kapitals. Negativ = die Strategie ist kein Edge.

    In der Praxis handelt niemand volles Kelly: schon ein Viertel-Kelly hat auf
    einem Prop-Konto Drawdowns, die den Boden reissen. Der Wert dient hier als
    *Obergrenze*, nicht als Empfehlung.
    """
    win_rate = _check_probability(win_rate)
    if reward_ratio <= 0:
        raise ValueError("reward_ratio muss positiv sein.")
    return win_rate - (1 - win_rate) / reward_ratio


def max_consecutive_losses(risk_money: float, budget: float) -> int:
    """Wie viele Verluste in Folge das Budget aushaelt."""
    if risk_money <= 0:
        raise ValueError("risk_money muss positiv sein.")
    return int(budget // risk_money)


def prob_loss_streak(loss_rate: float, streak: int, trades: int) -> float:
    """Wahrscheinlichkeit, dass in ``trades`` Trades mindestens einmal
    ``streak`` Verluste in Folge auftreten.

    Exakt ueber die Rekursion fuer "keine Serie der Laenge k" - die oft zitierte
    Naeherung ``trades * q**streak`` ueberschaetzt bei kurzen Serien deutlich.
    """
    loss_rate = _check_probability(loss_rate)
    if streak <= 0:
        raise ValueError("streak muss positiv sein.")
    if trades < streak:
        return 0.0
    # a[i] = P(bis Trade i ist keine Serie der Laenge `streak` aufgetreten).
    # a[i] = a[i-1] - p * q**streak * a[i-streak-1]  (klassische Runs-Rekursion)
    win_rate = 1 - loss_rate
    a = [1.0] * (trades + 1)
    for i in range(streak, trades + 1):
        prefix = a[i - streak - 1] if i - streak - 1 >= 0 else 1.0
        starter = win_rate if i - streak >= 1 else 1.0
        a[i] = max(0.0, a[i - 1] - prefix * starter * loss_rate**streak)
    return 1 - a[trades]


@dataclass(frozen=True, slots=True)
class RuinResult:
    """Ergebnis der Random-Walk-Rechnung."""

    win_rate: float
    reward_ratio: float
    risk_money: float
    prob_target: float
    prob_ruin: float
    expected_trades: float
    max_losses_in_row: int

    @property
    def edge_per_trade(self) -> float:
        return expectancy_r(self.win_rate, self.reward_ratio) * self.risk_money

    def describe(self) -> str:
        return (
            f"Risiko {self.risk_money:,.0f} $ | Trefferquote {self.win_rate:.0%} | "
            f"CRV {self.reward_ratio:.1f} -> Payout {self.prob_target:.1%}, "
            f"Bust {self.prob_ruin:.1%}, ~{self.expected_trades:.0f} Trades, "
            f"haelt {self.max_losses_in_row} Verluste in Folge aus"
        )


def prob_target_before_ruin(
    win_rate: float,
    reward_ratio: float,
    risk_money: float,
    *,
    budget: float = 2_000.0,
    target: float = 4_000.0,
    cost_r: float = 0.0,
    resolution: int = 4,
    max_states: int = 20_000,
) -> RuinResult:
    """Wahrscheinlichkeit, das Gewinnziel vor dem Boden zu erreichen.

    Modell: konstanter Geldeinsatz je Trade (``risk_money``), Gewinn
    ``reward_ratio * risk_money``, Verlust ``risk_money``, dazu ``cost_r``
    Kosten auf beiden Seiten. Zwei absorbierende Raender: ``0`` (Boden) und
    ``budget + target`` (Payout).

    Geloest wird das lineare Gleichungssystem exakt, nicht simuliert - dadurch
    gibt es keine Monte-Carlo-Streuung. Fuer pfadabhaengige Regeln (Tageslimit,
    Trailing-Boden) ist :mod:`propbot.montecarlo` zustaendig.
    """
    win_rate = _check_probability(win_rate)
    if reward_ratio <= 0:
        raise ValueError("reward_ratio muss positiv sein.")
    if risk_money <= 0:
        raise ValueError("risk_money muss positiv sein.")
    if budget <= 0 or target <= 0:
        raise ValueError("budget und target muessen positiv sein.")

    unit = risk_money / resolution
    win_units = max(1, int(round((reward_ratio - cost_r) * resolution)))
    loss_units = max(1, int(round((1 + cost_r) * resolution)))
    total_units = int(ceil((budget + target) / unit))
    start_units = int(round(budget / unit))
    if total_units > max_states:
        # Gitter vergroebern statt das Gleichungssystem zu sprengen.
        factor = ceil(total_units / max_states)
        win_units = max(1, win_units // factor)
        loss_units = max(1, loss_units // factor)
        total_units = int(ceil(total_units / factor))
        start_units = int(round(start_units / factor))

    size = total_units - 1  # innere Zustaende 1..total_units-1
    if size <= 0 or start_units <= 0:
        return RuinResult(win_rate, reward_ratio, risk_money, 0.0, 1.0, 0.0, 0)
    if start_units >= total_units:
        return RuinResult(win_rate, reward_ratio, risk_money, 1.0, 0.0, 0.0, 0)

    loss_rate = 1 - win_rate
    matrix = np.eye(size)
    prob_rhs = np.zeros(size)
    steps_rhs = np.ones(size)
    for row, state in enumerate(range(1, total_units)):
        up = state + win_units
        down = state - loss_units
        if up >= total_units:
            prob_rhs[row] += win_rate
        else:
            matrix[row, up - 1] -= win_rate
        if down > 0:
            matrix[row, down - 1] -= loss_rate
        # down <= 0 ist Ruin: Beitrag 0 zur Zielwahrscheinlichkeit

    prob = np.linalg.solve(matrix, prob_rhs)
    steps = np.linalg.solve(matrix, steps_rhs)
    index = start_units - 1
    return RuinResult(
        win_rate=win_rate,
        reward_ratio=reward_ratio,
        risk_money=risk_money,
        prob_target=float(prob[index]),
        prob_ruin=float(1 - prob[index]),
        expected_trades=float(steps[index]),
        max_losses_in_row=max_consecutive_losses(risk_money, budget),
    )


def trades_needed(win_rate: float, reward_ratio: float, risk_money: float, target: float) -> float:
    """Wie viele Trades das Ziel im Erwartungswert braucht (ohne Pfadrisiko)."""
    edge = expectancy_r(win_rate, reward_ratio) * risk_money
    if edge <= 0:
        return inf
    return target / edge


def risk_sweep(
    win_rate: float,
    reward_ratio: float,
    risks: list[float] | tuple[float, ...],
    *,
    budget: float = 2_000.0,
    target: float = 4_000.0,
    cost_r: float = 0.0,
) -> list[RuinResult]:
    """Rechnet mehrere Risikogroessen durch - die Basis der Risikotabelle im CLI."""
    return [
        prob_target_before_ruin(
            win_rate,
            reward_ratio,
            risk,
            budget=budget,
            target=target,
            cost_r=cost_r,
        )
        for risk in risks
    ]


def half_life_of_edge(win_rate: float, reward_ratio: float) -> float:
    """Wie stark die Trefferquote fallen darf, bis der Edge verschwindet.

    Rueckgabe in Prozentpunkten. Ein Wert unter ~3 heisst: die Strategie lebt
    von einer Annahme, die im Livehandel schnell kippen kann.
    """
    breakeven = breakeven_win_rate(reward_ratio)
    return (win_rate - breakeven) * 100


def _check_probability(value: float) -> float:
    if not 0 < value < 1:
        raise ValueError(f"Wahrscheinlichkeit muss zwischen 0 und 1 liegen, nicht {value!r}.")
    return float(value)


def log_growth_rate(win_rate: float, reward_ratio: float, risk_fraction: float) -> float:
    """Erwartetes logarithmisches Wachstum je Trade bei fixem Prozentrisiko.

    Wird der Wert negativ, schrumpft das Konto langfristig - egal wie gut die
    Trefferquote aussieht. Genau das passiert bei zu grossem Risiko.
    """
    win_rate = _check_probability(win_rate)
    if not 0 < risk_fraction < 1:
        raise ValueError("risk_fraction muss zwischen 0 und 1 liegen.")
    if reward_ratio <= 0:
        raise ValueError("reward_ratio muss positiv sein.")
    return win_rate * log(1 + reward_ratio * risk_fraction) + (1 - win_rate) * log(
        1 - risk_fraction
    )
