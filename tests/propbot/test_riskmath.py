"""Tests der Risikomathematik - gegen Brute Force und bekannte Grenzfaelle."""

from __future__ import annotations

import itertools

import pytest

from propbot.riskmath import (
    breakeven_win_rate,
    expectancy_r,
    half_life_of_edge,
    kelly_fraction,
    log_growth_rate,
    max_consecutive_losses,
    prob_loss_streak,
    prob_target_before_ruin,
    trades_needed,
)


def test_erwartungswert_und_breakeven_passen_zusammen() -> None:
    for ratio in (1.0, 1.5, 2.0, 3.0):
        win_rate = breakeven_win_rate(ratio)
        assert expectancy_r(win_rate, ratio) == pytest.approx(0.0, abs=1e-12)


def test_kosten_heben_die_noetige_trefferquote() -> None:
    assert breakeven_win_rate(2.0, cost_r=0.1) > breakeven_win_rate(2.0)


def test_kelly_ist_bei_fehlendem_edge_negativ() -> None:
    assert kelly_fraction(0.30, 2.0) < 0
    assert kelly_fraction(0.50, 2.0) == pytest.approx(0.25)


def test_verlustserien_gegen_brute_force() -> None:
    """Die Rekursion muss exakt der Abzaehlung aller Faelle entsprechen."""

    def brute(loss_rate: float, streak: int, trades: int) -> float:
        total = 0.0
        for combination in itertools.product([0, 1], repeat=trades):
            probability = 1.0
            longest = current = 0
            for value in combination:
                probability *= loss_rate if value else (1 - loss_rate)
                current = current + 1 if value else 0
                longest = max(longest, current)
            if longest >= streak:
                total += probability
        return total

    for loss_rate, streak, trades in [(0.55, 3, 8), (0.5, 4, 10), (0.6, 2, 6)]:
        assert prob_loss_streak(loss_rate, streak, trades) == pytest.approx(
            brute(loss_rate, streak, trades)
        )


def test_serie_laenger_als_die_stichprobe_ist_unmoeglich() -> None:
    assert prob_loss_streak(0.5, 10, 5) == 0.0


def test_ruinrechnung_gegen_klassische_formel() -> None:
    """Bei symmetrischen Einsaetzen gilt die Gambler's-Ruin-Formel exakt."""
    win_rate, risk, budget, target = 0.55, 100.0, 500.0, 500.0
    quotient = (1 - win_rate) / win_rate
    units_start = budget / risk
    units_total = (budget + target) / risk
    expected = (1 - quotient**units_start) / (1 - quotient**units_total)

    result = prob_target_before_ruin(
        win_rate, 1.0, risk, budget=budget, target=target, resolution=1
    )

    assert result.prob_target == pytest.approx(expected, abs=1e-6)


def test_mehr_risiko_senkt_die_payout_chance() -> None:
    chances = [
        prob_target_before_ruin(0.45, 2.0, risk).prob_target for risk in (100, 200, 400, 800)
    ]

    assert chances == sorted(chances, reverse=True)
    assert all(0 < value < 1 for value in chances)


def test_ohne_edge_bleibt_kaum_eine_chance() -> None:
    result = prob_target_before_ruin(0.30, 1.0, 250)

    assert result.prob_target < 0.05
    assert result.prob_ruin > 0.95


def test_erwartete_tradezahl_ist_plausibel() -> None:
    result = prob_target_before_ruin(0.50, 2.0, 250)
    grob = trades_needed(0.50, 2.0, 250, 4_000)

    assert 0.3 * grob < result.expected_trades < 3 * grob


def test_verlustserien_puffer() -> None:
    assert max_consecutive_losses(250, 2_000) == 8
    assert max_consecutive_losses(300, 2_000) == 6

    with pytest.raises(ValueError):
        max_consecutive_losses(0, 2_000)


def test_sicherheitsmarge_und_wachstum() -> None:
    assert half_life_of_edge(0.45, 2.0) == pytest.approx((0.45 - 1 / 3) * 100)
    assert log_growth_rate(0.55, 2.0, 0.01) > 0
    assert log_growth_rate(0.35, 1.0, 0.30) < 0


@pytest.mark.parametrize("win_rate", [0.0, 1.0, -0.2, 1.5])
def test_unmoegliche_wahrscheinlichkeiten_fliegen_auf(win_rate) -> None:
    with pytest.raises(ValueError):
        expectancy_r(win_rate, 2.0)
