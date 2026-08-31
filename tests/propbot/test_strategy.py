"""Tests der Strategien und des Handelszeitfensters."""

from __future__ import annotations

import pandas as pd
import pytest

from propbot.models import Side
from propbot.strategy import (
    RangeFadeParams,
    RegimeRouter,
    SessionWindow,
    TrendPullback,
    TrendPullbackParams,
    build,
)


def stamp(text: str) -> pd.Timestamp:
    return pd.Timestamp(text, tz="UTC")


def test_handelsfenster_erlaubt_nur_die_liquide_zeit() -> None:
    session = SessionWindow()

    assert session.allows(stamp("2026-01-05 09:00"))
    assert not session.allows(stamp("2026-01-05 03:00")), "asiatische Session ist gesperrt"
    assert not session.allows(stamp("2026-01-05 16:00")), "nach no_new_trades_after"
    assert not session.allows(stamp("2026-01-03 09:00")), "Samstag"


def test_nachrichtenfenster_ist_gesperrt() -> None:
    session = SessionWindow(blackouts=(("13:25", "13:35"),))

    assert not session.allows(stamp("2026-01-05 13:30"))
    assert session.allows(stamp("2026-01-05 13:20"))


def test_freitagabend_wird_ausgelassen() -> None:
    session = SessionWindow(skip_friday_after="15:00")

    assert not session.allows(stamp("2026-01-09 15:30")), "Freitag - kein Wochenendrisiko"
    assert session.allows(stamp("2026-01-08 15:00")), "Donnerstag ist in Ordnung"


def test_flat_am_abend() -> None:
    session = SessionWindow(flat_at="20:45")

    assert session.must_be_flat(stamp("2026-01-05 21:00"))
    assert not session.must_be_flat(stamp("2026-01-05 18:00"))


def test_trend_parameter_werden_geprueft() -> None:
    with pytest.raises(ValueError):
        TrendPullbackParams(ema_fast=50, ema_slow=20)
    with pytest.raises(ValueError):
        TrendPullbackParams(reward_ratio=0)
    with pytest.raises(ValueError):
        TrendPullbackParams(min_stop_atr=2.0, max_stop_atr=1.0)


def test_range_parameter_werden_geprueft() -> None:
    with pytest.raises(ValueError):
        RangeFadeParams(rsi_low=80, rsi_high=20)
    with pytest.raises(ValueError):
        RangeFadeParams(bb_period=2)


def test_trend_signale_haben_stop_und_ziel(market) -> None:
    strategy = TrendPullback()
    data = strategy.prepare(market)
    signals = [strategy.signal(data, i) for i in range(len(data))]
    found = [signal for signal in signals if signal is not None]

    assert found, "auf 6.000 Kerzen sollte die Strategie etwas finden"
    for signal in found[:20]:
        assert signal.stop_price != 0 and signal.target_price is not None
        if signal.side is Side.LONG:
            assert signal.target_price > signal.stop_price
        else:
            assert signal.target_price < signal.stop_price


def test_crv_entspricht_dem_parameter(market) -> None:
    strategy = TrendPullback(TrendPullbackParams(reward_ratio=2.0))
    data = strategy.prepare(market)
    for index in range(len(data)):
        signal = strategy.signal(data, index)
        if signal is None:
            continue
        entry = float(data["close"].iloc[index])
        assert signal.reward_ratio(entry) == pytest.approx(2.0, abs=1e-6)


def test_stopabstand_bleibt_im_atr_korridor(market) -> None:
    params = TrendPullbackParams(min_stop_atr=0.7, max_stop_atr=2.5)
    strategy = TrendPullback(params)
    data = strategy.prepare(market)
    geprueft = 0
    for index in range(len(data)):
        signal = strategy.signal(data, index)
        if signal is None:
            continue
        entry = float(data["close"].iloc[index])
        atr_value = float(data["atr"].iloc[index])
        vielfaches = abs(entry - signal.stop_price) / atr_value
        assert params.min_stop_atr - 1e-9 <= vielfaches <= params.max_stop_atr + 1e-9
        geprueft += 1
    assert geprueft > 0


def test_shorts_lassen_sich_abschalten(market) -> None:
    strategy = TrendPullback(TrendPullbackParams(allow_short=False))
    data = strategy.prepare(market)
    sides = {
        signal.side
        for index in range(len(data))
        if (signal := strategy.signal(data, index)) is not None
    }

    assert Side.SHORT not in sides


def test_router_waehlt_nach_regime(market) -> None:
    router = RegimeRouter(trend_threshold=25.0, range_threshold=15.0)
    data = router.prepare(market)
    setups = set()
    for index in range(len(data)):
        signal = router.signal(data, index)
        if signal is None:
            continue
        adx_value = float(data["adx_router"].iloc[index])
        if signal.setup.startswith("trend"):
            assert adx_value >= 25.0
        else:
            assert adx_value <= 15.0
        setups.add(signal.setup.split("_")[0])
    assert setups


def test_router_lehnt_widerspruechliche_schwellen_ab() -> None:
    with pytest.raises(ValueError):
        RegimeRouter(trend_threshold=10.0, range_threshold=20.0)


def test_strategiefabrik() -> None:
    assert build("trend_pullback").name == "trend_pullback"
    assert build("range_fade").name == "range_fade"
    with pytest.raises(ValueError):
        build("gibt_es_nicht")


def test_kontext_enthaelt_lernmerkmale(market) -> None:
    strategy = TrendPullback()
    data = strategy.prepare(market)
    context = strategy.context(data, 500)

    assert {"hour", "weekday", "session", "adx_bucket", "atr_bucket"} <= set(context)
