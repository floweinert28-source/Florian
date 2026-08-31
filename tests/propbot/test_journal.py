"""Tests des Handelstagebuchs."""

from __future__ import annotations

from datetime import timedelta

import pytest

from propbot.journal import TradeJournal
from propbot.models import ExitReason, Side, Trade

from .conftest import START


@pytest.fixture
def journal(tmp_path):
    with TradeJournal(tmp_path / "journal.db") as store:
        yield store


def make_trade(pnl: float, *, setup: str = "trend_long", session: str = "london") -> Trade:
    trade = Trade(
        symbol="EURUSD",
        side=Side.LONG,
        entry_time=START,
        entry_price=1.1,
        size=1.0,
        stop_price=1.098,
        risk_money=250.0,
        setup=setup,
        context={"session": session},
    )
    trade.exit_time = START + timedelta(hours=1)
    trade.exit_price = 1.102
    trade.exit_reason = ExitReason.TARGET if pnl > 0 else ExitReason.STOP
    trade.gross_pnl = pnl
    return trade


def test_lauf_und_trades_werden_gespeichert(journal) -> None:
    run_id = journal.start_run(mode="backtest", strategy="s", symbol="EURUSD", params={"a": 1})
    journal.record(run_id, make_trade(500.0))

    gespeichert = journal.trades(run_id)

    assert len(gespeichert) == 1
    assert gespeichert[0]["r_multiple"] == pytest.approx(2.0)
    assert gespeichert[0]["context"]["session"] == "london"
    assert journal.runs()[0]["strategy"] == "s"


def test_offene_trades_werden_uebersprungen(journal) -> None:
    run_id = journal.start_run(mode="backtest", strategy="s", symbol="EURUSD")
    offen = make_trade(0.0)
    offen.exit_time = None

    assert journal.record_many(run_id, [offen, make_trade(250.0)]) == 1


def test_auswertung_nach_setup_und_session(journal) -> None:
    run_id = journal.start_run(mode="backtest", strategy="s", symbol="EURUSD")
    journal.record(run_id, make_trade(500.0, setup="a"))
    journal.record(run_id, make_trade(-250.0, setup="b"))
    journal.record(run_id, make_trade(-250.0, setup="b"))

    nach_setup = journal.expectancy_by("setup", run_id)

    assert nach_setup["a"]["expectancy_r"] == pytest.approx(2.0)
    assert nach_setup["b"]["expectancy_r"] == pytest.approx(-1.0)
    assert nach_setup["b"]["trades"] == 2
    assert journal.expectancy_by("session", run_id)["london"]["trades"] == 3


def test_fehler_label_werden_gezaehlt(journal) -> None:
    run_id = journal.start_run(mode="backtest", strategy="s", symbol="EURUSD")
    trade = make_trade(-250.0)
    trade.add_tag("rachetrade")
    trade.add_tag("rachetrade")  # Duplikate werden verhindert
    journal.record(run_id, trade)

    assert journal.tag_counts(run_id) == {"rachetrade": 1}


def test_zugriff_ohne_verbindung_meldet_sich() -> None:
    store = TradeJournal(":memory:")

    with pytest.raises(RuntimeError):
        store.trades()


def test_datenbank_ueberlebt_neuoeffnen(tmp_path) -> None:
    path = tmp_path / "journal.db"
    with TradeJournal(path) as store:
        run_id = store.start_run(mode="backtest", strategy="s", symbol="EURUSD")
        store.record(run_id, make_trade(500.0))

    with TradeJournal(path) as store:
        assert len(store.trades()) == 1
