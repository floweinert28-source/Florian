"""Tests des Live-Loops gegen den Papier-Broker."""

from __future__ import annotations

import json

import pytest

from propbot.broker import BrokerError, PaperBroker
from propbot.data import synthetic_market
from propbot.journal import TradeJournal
from propbot.live import LiveSettings, LiveTrader
from propbot.models import Side
from propbot.rules import AccountStatus, DrawdownMode, PropFirmRules
from propbot.strategy import TrendPullback

from .conftest import CLEAN


@pytest.fixture(scope="module")
def feed():
    return synthetic_market(bars=3000, seed=21)


def make_trader(feed, tmp_path, **kwargs):
    broker = PaperBroker(feed, CLEAN, balance=50_000.0, start_index=260)
    settings = LiveSettings(
        symbol="TEST",
        dry_run=kwargs.pop("dry_run", False),
        poll_seconds=0,
        state_path=tmp_path / "state.json",
        journal_path=tmp_path / "journal.db",
    )
    trader = LiveTrader(broker, TrendPullback(), CLEAN, settings=settings, **kwargs)
    return broker, trader


def test_papierbroker_fuellt_stop_und_ziel(feed) -> None:
    broker = PaperBroker(feed, CLEAN, start_index=100)
    preis = float(feed["close"].iloc[100])
    broker.market_order(
        "TEST", Side.LONG, 1.0, stop_price=preis - 0.02, target_price=preis + 0.0005
    )

    while broker.positions() and broker.advance():
        pass

    assert broker.closed, "die Position muss irgendwann geschlossen werden"
    assert broker.closed[0][2] in ("stop", "target")


def test_unbekannte_position_meldet_fehler(feed) -> None:
    broker = PaperBroker(feed, CLEAN, start_index=100)
    position = broker.market_order("TEST", Side.LONG, 1.0)
    broker.close(position)

    with pytest.raises(BrokerError):
        broker.close(position)


def test_dry_run_sendet_keine_order(feed, tmp_path) -> None:
    broker, trader = make_trader(feed, tmp_path, dry_run=True)
    aktionen = set()

    for _ in range(400):
        if not broker.advance():
            break
        aktionen.add(trader.step().action)

    assert "DRY-RUN" in aktionen, "es haette Signale gegeben"
    assert broker.positions() == [] and broker.closed == []


def test_live_loop_handelt_und_fuehrt_buch(feed, tmp_path) -> None:
    broker, trader = make_trader(feed, tmp_path)
    with TradeJournal(tmp_path / "journal.db") as journal:
        trader.journal = journal
        trader.run_id = journal.start_run(mode="paper", strategy="t", symbol="TEST")
        for _ in range(900):
            if not broker.advance():
                break
            if trader.step().finished:
                break
        eintraege = journal.trades(trader.run_id)

    assert broker.closed, "der Bot muss gehandelt haben"
    assert len(eintraege) >= 1
    assert all(item["exit_time"] for item in eintraege)


def test_zustand_wird_gespeichert_und_geladen(feed, tmp_path) -> None:
    broker, trader = make_trader(feed, tmp_path)
    for _ in range(120):
        broker.advance()
        trader.step()
    trader.save_state()

    data = json.loads((tmp_path / "state.json").read_text(encoding="utf-8"))
    assert "account" in data and "risk" in data

    _, neu = make_trader(feed, tmp_path)
    assert neu.account.floor == trader.account.floor
    assert neu.account.balance == pytest.approx(trader.account.balance)


def test_kaputte_zustandsdatei_blockiert_nicht(feed, tmp_path) -> None:
    (tmp_path / "state.json").write_text("{kein json", encoding="utf-8")

    _, trader = make_trader(feed, tmp_path)

    assert trader.account.status is AccountStatus.RUNNING


def test_regelverstoss_stoppt_den_loop(feed, tmp_path) -> None:
    """Ein Konto unter dem Boden fuehrt sofort zum Stopp - ohne neue Order."""
    broker, trader = make_trader(
        feed, tmp_path, rules=PropFirmRules(drawdown_mode=DrawdownMode.STATIC)
    )
    broker.balance = 47_000.0  # Bruch erzwingen

    broker.advance()
    ergebnis = trader.step()

    assert ergebnis.finished
    assert ergebnis.status is AccountStatus.BREACHED_DRAWDOWN
    assert broker.positions() == []


def test_ziel_erreicht_beendet_den_loop(feed, tmp_path) -> None:
    broker, trader = make_trader(feed, tmp_path)
    broker.balance = 54_500.0

    broker.advance()
    ergebnis = trader.step()

    assert ergebnis.status is AccountStatus.TARGET_REACHED


def test_beschreibung_nennt_boden_und_restweg(feed, tmp_path) -> None:
    _, trader = make_trader(feed, tmp_path)

    text = trader.describe()

    assert "Boden" in text and "Ziel" in text
