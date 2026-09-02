"""Tests der Parametersuche und der Walk-Forward-Analyse."""

from __future__ import annotations

import pytest

from propbot.engine import Backtester
from propbot.optimize import expand_grid, grid_search, quality_score, walk_forward
from propbot.strategy import TrendPullback, TrendPullbackParams

from .conftest import CLEAN


def factory(params: dict) -> TrendPullback:
    return TrendPullback(TrendPullbackParams(**params))


def test_gitter_wird_vollstaendig_aufgespannt() -> None:
    grid = {"adx_min": [18.0, 22.0], "reward_ratio": [1.5, 2.0, 2.5]}

    combinations = expand_grid(grid)

    assert len(combinations) == 6
    assert {"adx_min": 18.0, "reward_ratio": 2.5} in combinations


def test_gitter_laesst_sich_begrenzen() -> None:
    grid = {"adx_min": [18.0, 20.0, 22.0], "reward_ratio": [1.0, 1.5, 2.0, 2.5]}

    begrenzt = expand_grid(grid, limit=5, seed=1)

    assert len(begrenzt) == 5
    assert expand_grid({}) == [{}]


def test_guete_bestraft_regelverstoss(market) -> None:
    ergebnis = Backtester(TrendPullback(), CLEAN).run(market)
    score = quality_score(ergebnis, min_trades=1)

    assert score > -10
    ergebnis.report.status = ergebnis.report.status.__class__("breached_drawdown")
    assert quality_score(ergebnis, min_trades=1) <= -9


def test_zu_wenige_trades_bekommen_keine_note(market) -> None:
    ergebnis = Backtester(TrendPullback(), CLEAN).run(market.iloc[:1200])

    assert quality_score(ergebnis, min_trades=500) == float("-inf")


def test_gittersuche_sortiert_nach_guete(market) -> None:
    grid = {"reward_ratio": [1.5, 2.5]}

    kandidaten = grid_search(market, factory, grid, CLEAN, min_trades=3)

    assert len(kandidaten) == 2
    assert kandidaten[0].score >= kandidaten[1].score
    assert "score" in kandidaten[0].summary


def test_walk_forward_trennt_training_und_test(market) -> None:
    grid = {"reward_ratio": [1.5, 2.0]}

    ergebnis = walk_forward(market, factory, grid, CLEAN, folds=2, min_trades=3)

    assert ergebnis.folds, "beide Fenster sollten Ergebnisse liefern"
    for fold in ergebnis.folds:
        assert fold.train_span[1] <= fold.test_span[0], "Test liegt immer nach dem Training"
    assert isinstance(ergebnis.summary(), str)
    assert "Degradation" in ergebnis.summary()


def test_walk_forward_braucht_genug_daten(market) -> None:
    with pytest.raises(ValueError):
        walk_forward(market.iloc[:300], factory, {"reward_ratio": [2.0]}, CLEAN, folds=4)
    with pytest.raises(ValueError):
        walk_forward(market, factory, {"reward_ratio": [2.0]}, CLEAN, folds=1)


def test_stabilste_parameter_werden_gewaehlt(market) -> None:
    grid = {"reward_ratio": [2.0]}

    ergebnis = walk_forward(market, factory, grid, CLEAN, folds=2, min_trades=3)

    assert ergebnis.stable_params == {"reward_ratio": 2.0}
