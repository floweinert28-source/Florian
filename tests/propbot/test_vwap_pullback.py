"""Tests des VWAP-Ruecksetzer-Setups."""

from __future__ import annotations

import pytest

import pandas as pd

from propbot.engine import check_no_lookahead
from propbot.models import Side
from propbot.strategy import SessionWindow, VwapPullback, VwapPullbackParams


def rth_tag(datum: str, kurse: list[float], volumen: float = 1.0):
    """Baut einen Handelstag aus 26 M15-Kerzen ab 09:30 New Yorker Zeit."""
    start = pd.Timestamp(f"{datum} 09:30", tz="America/New_York").tz_convert("UTC")
    index = [start + pd.Timedelta(minutes=15 * i) for i in range(len(kurse))]
    zeilen = []
    for i, kurs in enumerate(kurse):
        vorher = kurse[i - 1] if i else kurs
        zeilen.append((vorher, max(kurs, vorher) + 8, min(kurs, vorher) - 8, kurs))
    frame = pd.DataFrame(zeilen, columns=["open", "high", "low", "close"], index=index)
    frame["volume"] = volumen
    return frame


@pytest.fixture(scope="module")
def markt():
    """Acht steigende Tage; am letzten faellt der Kurs an den VWAP und dreht.

    Der Aufwaertstrend ist noetig, weil das Setup nur in Richtung des
    Mehrtagestrends handelt.
    """
    tage = []
    for nummer, datum in enumerate(pd.bdate_range("2023-03-06", periods=7)):
        basis = 15_000 + nummer * 120
        kurse = [basis + i * 6 for i in range(26)]
        tage.append(rth_tag(f"{datum:%Y-%m-%d}", kurse))
    # Letzter Tag: steigt, faellt bis unter den VWAP zurueck und erobert ihn wieder
    basis = 15_000 + 7 * 120
    verlauf = (
        [basis + i * 12 for i in range(8)]
        + [basis + 96 - i * 18 for i in range(1, 7)]
        + [basis + 10 + i * 14 for i in range(12)]
    )
    tage.append(rth_tag("2023-03-15", verlauf))
    frame = pd.concat(tage)
    frame.index.name = "time"
    return frame


def test_parameter_werden_geprueft() -> None:
    with pytest.raises(ValueError):
        VwapPullbackParams(touch_atr=0)
    with pytest.raises(ValueError):
        VwapPullbackParams(min_stop_atr=3.0, max_stop_atr=1.0)
    with pytest.raises(ValueError):
        VwapPullbackParams(max_signals_per_day=0)


def test_signale_liegen_im_zeitfenster(markt) -> None:
    strategie = VwapPullback(
        VwapPullbackParams(min_minute=60, max_minute=180, min_atr_pct=None, max_atr_pct=None),
        session=SessionWindow.us_futures_rth(),
    )
    daten = strategie.prepare(markt)
    treffer = daten[daten["long_signal"] | daten["short_signal"]]

    assert len(treffer) > 0
    assert (treffer["minute"] >= 60).all() and (treffer["minute"] <= 180).all()


def test_longs_schliessen_ueber_dem_vwap(markt) -> None:
    strategie = VwapPullback(
        VwapPullbackParams(min_atr_pct=None, max_atr_pct=None),
        session=SessionWindow.us_futures_rth(),
    )
    daten = strategie.prepare(markt)
    longs = daten[daten["long_signal"]]

    assert len(longs) > 0
    assert (longs["close"] > longs["vwap"]).all()


def test_stop_liegt_unter_dem_einstieg(markt) -> None:
    strategie = VwapPullback(
        VwapPullbackParams(min_atr_pct=None, max_atr_pct=None),
        session=SessionWindow.us_futures_rth(),
    )
    daten = strategie.prepare(markt)
    geprueft = 0
    for index in range(len(daten)):
        signal = strategie.signal(daten, index)
        if signal is None:
            continue
        einstieg = float(daten["close"].iloc[index])
        if signal.side is Side.LONG:
            assert signal.stop_price < einstieg < signal.target_price
        else:
            assert signal.target_price < einstieg < signal.stop_price
        geprueft += 1
    assert geprueft > 0


def test_shorts_sind_standardmaessig_aus(markt) -> None:
    daten = VwapPullback(
        VwapPullbackParams(min_atr_pct=None, max_atr_pct=None),
        session=SessionWindow.us_futures_rth(),
    ).prepare(markt)

    assert int(daten["short_signal"].sum()) == 0


def test_kein_blick_in_die_zukunft() -> None:
    from propbot.data import synthetic_market

    strategie = VwapPullback(session=SessionWindow.us_futures_rth())
    frame = synthetic_market(bars=4000, seed=23, timeframe_minutes=15)

    assert check_no_lookahead(strategie, frame, samples=12) == []
