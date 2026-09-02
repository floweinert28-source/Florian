"""Tests der Monte-Carlo-Simulation."""

from __future__ import annotations

import numpy as np
import pytest

from propbot.montecarlo import format_sweep, simulate, sweep_risk
from propbot.rules import PropFirmRules


def serie(win_rate: float, reward: float = 2.0, count: int = 300, seed: int = 5) -> np.ndarray:
    rng = np.random.default_rng(seed)
    return np.where(rng.random(count) < win_rate, reward, -1.0)


def test_wahrscheinlichkeiten_ergeben_eins() -> None:
    result = simulate(serie(0.45), runs=200, max_trades=200)

    summe = result.prob_target + result.prob_breach + result.prob_stalled + result.prob_unfinished
    assert summe == pytest.approx(1.0)


def test_guter_edge_erreicht_das_ziel_meistens() -> None:
    result = simulate(serie(0.50), runs=400, max_trades=400, seed=1)

    assert result.prob_target > 0.8
    assert "Solide" in result.verdict()


def test_schlechter_edge_scheitert() -> None:
    result = simulate(serie(0.25), runs=300, max_trades=400, seed=2)

    assert result.prob_target < 0.2
    assert result.prob_failed > 0.8


def test_bloecke_erhalten_verlustserien() -> None:
    """Block-Bootstrap muss pessimistischer sein als unabhaengiges Ziehen."""
    values = np.array([-1.0] * 6 + [2.0] * 6)  # klare Serienstruktur

    einzeln = simulate(values, runs=400, max_trades=200, block_size=1, seed=3)
    bloecke = simulate(values, runs=400, max_trades=200, block_size=6, seed=3)

    assert bloecke.prob_breach >= einzeln.prob_breach


def test_adaptives_risiko_senkt_die_bustrate() -> None:
    values = serie(0.42)

    fix = simulate(values, runs=300, max_trades=400, adaptive_risk=False, risk_money=400)
    adaptiv = simulate(values, runs=300, max_trades=400, adaptive_risk=True)

    assert adaptiv.prob_breach < fix.prob_breach


def test_risiko_sweep_ist_sortiert_und_formatierbar() -> None:
    rules = PropFirmRules()
    ergebnisse = sweep_risk(serie(0.45), [100, 250, 500], rules=rules, runs=150, max_trades=300)

    assert [item.risk_money for item in ergebnisse] == [100, 250, 500]
    text = format_sweep(ergebnisse, rules)
    assert "Payout" in text and "%" in text


def test_leere_eingabe_fliegt_auf() -> None:
    with pytest.raises(ValueError):
        simulate([])
    with pytest.raises(ValueError):
        simulate([1.0], runs=0)
