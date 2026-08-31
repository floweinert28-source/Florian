"""Tests der Datenmodelle."""

from __future__ import annotations

from datetime import timedelta

import pytest

from propbot.models import INSTRUMENTS, ExitReason, Instrument, Side, Signal, Trade

from .conftest import CLEAN, START


def test_seiten_rechnen_mit_vorzeichen() -> None:
    assert Side.LONG.sign == 1 and Side.SHORT.sign == -1
    assert Side.LONG.opposite is Side.SHORT
    assert Side.SHORT.label == "Short"


def test_groesse_wird_immer_abgerundet() -> None:
    assert CLEAN.round_size(1.2799) == pytest.approx(1.27)
    assert CLEAN.round_size(0.005) == 0.0, "unter der Mindestgroesse gibt es keine Position"
    assert CLEAN.round_size(1_000) == CLEAN.max_size


def test_preis_wird_auf_die_tickgroesse_gerundet() -> None:
    futures = INSTRUMENTS["MNQ"]

    assert futures.round_price(18_234.31) == pytest.approx(18_234.25)
    assert CLEAN.round_price(1.123456789) == pytest.approx(1.12346)


@pytest.mark.parametrize(
    "kwargs",
    [
        {"value_per_point": 0},
        {"size_step": 0},
        {"min_size": 0},
        {"max_size": 0.001},
        {"spread": -1},
    ],
)
def test_unsinnige_instrumente_fliegen_auf(kwargs) -> None:
    defaults = dict(symbol="X", value_per_point=1.0, min_size=0.01, max_size=1.0, size_step=0.01)
    with pytest.raises(ValueError):
        Instrument(**{**defaults, **kwargs})


def test_geldwert_einer_bewegung() -> None:
    assert CLEAN.money(0.0010, 0.5) == pytest.approx(50.0)
    assert INSTRUMENTS["MNQ"].money(10.0, 2) == pytest.approx(40.0)


def test_signal_kennt_risiko_und_crv() -> None:
    signal = Signal(side=Side.LONG, stop_price=1.0980, target_price=1.1040)

    assert signal.risk_distance(1.1000) == pytest.approx(0.0020)
    assert signal.reward_ratio(1.1000) == pytest.approx(2.0)
    assert Signal(side=Side.LONG, stop_price=1.098).reward_ratio(1.1) is None


def test_trade_rechnet_r_und_kosten() -> None:
    trade = Trade(
        symbol="TEST",
        side=Side.LONG,
        entry_time=START,
        entry_price=1.1,
        size=1.0,
        stop_price=1.098,
        risk_money=200.0,
    )
    trade.gross_pnl = 420.0
    trade.commission = 14.0
    trade.spread_cost = 6.0
    trade.exit_time = START + timedelta(minutes=90)

    assert trade.pnl == pytest.approx(406.0)
    assert trade.r_multiple == pytest.approx(2.03)
    assert trade.total_costs == pytest.approx(20.0)
    assert trade.duration_minutes == pytest.approx(90)
    assert trade.is_open is False


def test_labels_sind_vollstaendig() -> None:
    assert all(reason.label for reason in ExitReason)
    assert ExitReason.STOP.is_loss_by_design
    assert not ExitReason.TARGET.is_loss_by_design


def test_labels_ohne_duplikate() -> None:
    trade = Trade(
        symbol="T",
        side=Side.LONG,
        entry_time=START,
        entry_price=1.0,
        size=1.0,
        stop_price=0.9,
        risk_money=100.0,
    )
    trade.add_tag("x")
    trade.add_tag("x")

    assert trade.tags == ["x"]
