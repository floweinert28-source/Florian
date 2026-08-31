"""Tests der Lernschicht: Fehler-Label, Gedaechtnis und Sperren."""

from __future__ import annotations

from datetime import timedelta

import pytest

from propbot.engine import Backtester
from propbot.learning import (
    AdaptiveSettings,
    AdaptiveStrategy,
    BucketStats,
    PerformanceMemory,
    lessons,
    tag_trades,
)
from propbot.models import ExitReason, Side, Trade
from propbot.strategy import SessionWindow, TrendPullback

from .conftest import CLEAN, START


def trade(**kwargs) -> Trade:
    defaults = dict(
        symbol="TEST",
        side=Side.LONG,
        entry_time=START,
        entry_price=1.1000,
        size=1.0,
        stop_price=1.0980,
        risk_money=250.0,
        setup="test_long",
    )
    defaults.update(kwargs)
    item = Trade(**{key: value for key, value in defaults.items() if key != "pnl"})
    item.exit_time = item.entry_time + timedelta(minutes=60)
    item.gross_pnl = kwargs.get("pnl", 0.0)
    item.exit_reason = kwargs.get("exit_reason", ExitReason.TARGET)
    return item


def test_gewinn_verschenkt_wird_erkannt() -> None:
    verloren = trade(pnl=0.0, exit_reason=ExitReason.BREAKEVEN)
    verloren.mfe = 400.0  # lag mit 1,6 R im Plus

    tag_trades([verloren])

    assert "gewinn_verschenkt" in verloren.tags


def test_knapper_stop_wird_erkannt() -> None:
    gewinner = trade(pnl=500.0)
    gewinner.mae = 230.0  # 0,92 R Buchverlust vor dem Ziel

    tag_trades([gewinner])

    assert "knapper_stop" in gewinner.tags


def test_grosser_verlust_wird_erkannt() -> None:
    gap = trade(pnl=-400.0, exit_reason=ExitReason.STOP)

    tag_trades([gap])

    assert "grosser_verlust" in gap.tags


def test_rachetrade_nach_verlust() -> None:
    verlust = trade(pnl=-250.0, exit_reason=ExitReason.STOP)
    schnell = trade(entry_time=verlust.entry_time + timedelta(minutes=75), pnl=100.0)

    tag_trades([verlust, schnell], cooldown_minutes=45)

    assert "rachetrade" in schnell.tags, "15 Minuten nach dem Ausstieg ist zu frueh"


def test_overtrading_wird_gezaehlt() -> None:
    items = [trade(entry_time=START + timedelta(minutes=30 * i), pnl=10.0) for i in range(5)]

    tag_trades(items, max_trades_per_day=3)

    assert [item.tags for item in items[3:]] == [["overtrading"], ["overtrading"]]
    assert items[0].tags == []


def test_duenne_session_und_newsfenster() -> None:
    session = SessionWindow(blackouts=(("13:25", "13:35"),))
    nachts = trade(entry_time=START.replace(hour=3), pnl=-250.0, exit_reason=ExitReason.STOP)
    news = trade(entry_time=START.replace(hour=13, minute=30), pnl=-250.0)

    tag_trades([nachts, news], session=session)

    assert "duenne_session" in nachts.tags
    assert "news_fenster" in news.tags


def test_lessons_zeigen_die_teuerste_richtung() -> None:
    shorts = [
        trade(
            side=Side.SHORT,
            setup="s",
            pnl=-250.0,
            exit_reason=ExitReason.STOP,
            entry_time=START + timedelta(hours=i),
        )
        for i in range(15)
    ]
    longs = [trade(pnl=500.0, entry_time=START + timedelta(days=1, hours=i)) for i in range(15)]

    ergebnisse = lessons(shorts + longs, min_sample=10)

    assert any("Short" in lesson.finding for lesson in ergebnisse)
    assert ergebnisse[0].impact_r < 0, "die teuerste Erkenntnis steht oben"


def test_lessons_warnen_bei_zu_wenig_daten() -> None:
    ergebnisse = lessons([trade(pnl=100.0)], min_sample=12)

    assert "Datenlage" == ergebnisse[0].topic


def test_bucket_statistik_rechnet_richtig() -> None:
    bucket = BucketStats("x")
    for value in (2.0, -1.0, -1.0, 2.0):
        bucket.add(value)

    assert bucket.mean == pytest.approx(0.5)
    assert bucket.win_rate == pytest.approx(0.5)
    assert bucket.lower_bound(1.0) < bucket.mean < bucket.upper_bound(1.0)


def test_gedaechtnis_sperrt_nur_bei_klarer_evidenz() -> None:
    memory = PerformanceMemory(AdaptiveSettings(min_trades=10, z_score=1.0, explore_rate=0.0))
    context = {"session": "london", "adx_bucket": "q1"}

    for _ in range(10):
        memory.observe(trade(setup="test_long", pnl=100.0, context=context))
    assert memory.verdict("test_long", context)[0] is True

    memory = PerformanceMemory(AdaptiveSettings(min_trades=10, z_score=1.0, explore_rate=0.0))
    for _ in range(12):
        memory.observe(trade(setup="test_long", pnl=-250.0, context=context))
    allowed, key = memory.verdict("test_long", context)

    assert allowed is False and "setup=test_long" in key


def test_gedaechtnis_sperrt_nicht_nach_pechserie() -> None:
    """Drei Verluste sind keine Evidenz - das ist der klassische Anfaengerfehler."""
    memory = PerformanceMemory(AdaptiveSettings(min_trades=15))
    for _ in range(3):
        memory.observe(trade(pnl=-250.0))

    assert memory.verdict("test_long", {})[0] is True


def test_adaptive_strategie_blockt_und_erkundet_weiter(market) -> None:
    strategy = AdaptiveStrategy(TrendPullback(), AdaptiveSettings(min_trades=8, explore_rate=0.2))
    result = Backtester(strategy, CLEAN).run(market)

    assert result.report.trades > 0
    assert isinstance(strategy.report(), str)
    assert strategy.memory.buckets, "die Lernschicht muss mitschreiben"


def test_adaptive_strategie_reicht_parameter_durch() -> None:
    strategy = AdaptiveStrategy(TrendPullback())

    assert strategy.params()["adaptive_min_trades"] > 0
    assert strategy.warmup == TrendPullback().warmup
    assert strategy.name.startswith("adaptive_")


def test_zu_kleine_stichprobe_wird_abgelehnt() -> None:
    with pytest.raises(ValueError):
        AdaptiveSettings(min_trades=2)
    with pytest.raises(ValueError):
        AdaptiveSettings(explore_rate=1.5)
