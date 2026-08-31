"""Tests der Indikatoren - Werte und vor allem Kausalitaet."""

from __future__ import annotations

import numpy as np
import pandas as pd
import pytest

from propbot.indicators import adx, atr, bollinger, donchian, ema, rolling_slope, rsi, sma, zscore

from .conftest import bars


@pytest.fixture
def frame() -> pd.DataFrame:
    rng = np.random.default_rng(3)
    close = pd.Series(1.10 + np.cumsum(rng.normal(0, 0.0004, 400)))
    return bars(
        [
            (float(value), float(value) + 0.0006, float(value) - 0.0006, float(value) + 0.0001)
            for value in close
        ]
    )


def test_sma_und_ema_grundwerte() -> None:
    series = pd.Series([1.0, 2.0, 3.0, 4.0, 5.0])

    assert sma(series, 5).iloc[-1] == pytest.approx(3.0)
    assert pd.isna(sma(series, 5).iloc[-2]), "vor dem vollen Fenster gibt es keinen Wert"
    # EMA(3) mit adjust=False: alpha = 0.5, rekursiv ab dem ersten Wert
    # 1 -> 1.5 -> 2.25 -> 3.125 -> 4.0625 (so rechnet auch MetaTrader)
    assert ema(series, 3).iloc[-1] == pytest.approx(4.0625)


def test_atr_bei_konstanter_spanne() -> None:
    rows = [(1.1000, 1.1010, 1.0990, 1.1000)] * 30

    assert atr(bars(rows), 14).iloc[-1] == pytest.approx(0.0020)


def test_rsi_grenzfaelle() -> None:
    steigend = pd.Series(np.arange(1, 60, dtype=float))
    fallend = pd.Series(np.arange(60, 1, -1, dtype=float))
    konstant = pd.Series([5.0] * 60)

    assert rsi(steigend, 14).iloc[-1] == pytest.approx(100.0)
    assert rsi(fallend, 14).iloc[-1] == pytest.approx(0.0)
    assert rsi(konstant, 14).iloc[-1] == pytest.approx(50.0)


def test_adx_erkennt_trend_und_seitwaerts() -> None:
    trend = bars(
        [
            (
                1.10 + i * 0.001,
                1.10 + i * 0.001 + 0.0008,
                1.10 + i * 0.001 - 0.0002,
                1.10 + i * 0.001 + 0.0006,
            )
            for i in range(120)
        ]
    )
    seitwaerts = bars([(1.1000, 1.1008, 1.0992, 1.1000), (1.1000, 1.1008, 1.0992, 1.1000)] * 60)

    assert adx(trend, 14).iloc[-1] > 40
    assert adx(seitwaerts, 14).iloc[-1] < 25


def test_donchian_klammert_die_aktuelle_kerze_aus() -> None:
    rows = [(1.10, 1.11, 1.09, 1.10)] * 25 + [(1.10, 1.20, 1.09, 1.19)]
    upper, _ = donchian(bars(rows), 20)

    assert upper.iloc[-1] == pytest.approx(1.11), "sonst waere jeder Ausbruch schon passiert"


def test_bollinger_und_zscore_haengen_zusammen(frame) -> None:
    middle, upper, lower = bollinger(frame["close"], 20, 2.0)
    z = zscore(frame["close"], 20)

    assert (upper.dropna() > middle.dropna()).all()
    assert (lower.dropna() < middle.dropna()).all()
    letzte = frame["close"].iloc[-1]
    breite = (upper.iloc[-1] - middle.iloc[-1]) / 2
    assert z.iloc[-1] == pytest.approx((letzte - middle.iloc[-1]) / breite, rel=1e-6)


def test_steigung_hat_das_richtige_vorzeichen() -> None:
    aufwaerts = pd.Series(np.arange(50, dtype=float))

    assert rolling_slope(aufwaerts, 10).iloc[-1] == pytest.approx(1.0)
    assert rolling_slope(aufwaerts[::-1].reset_index(drop=True), 10).iloc[-1] == pytest.approx(-1.0)


@pytest.mark.parametrize(
    "name,call",
    [
        ("ema", lambda f: ema(f["close"], 20)),
        ("rsi", lambda f: rsi(f["close"], 14)),
        ("atr", lambda f: atr(f, 14)),
        ("adx", lambda f: adx(f, 14)),
        ("zscore", lambda f: zscore(f["close"], 30)),
    ],
)
def test_indikatoren_schauen_nicht_in_die_zukunft(frame, name, call) -> None:
    """Der Wert an Position i darf sich nicht aendern, wenn spaetere Kerzen fehlen."""
    voll = call(frame)
    for cut in (200, 300, 380):
        gekuerzt = call(frame.iloc[:cut])
        assert gekuerzt.iloc[-1] == pytest.approx(voll.iloc[cut - 1]), name


@pytest.mark.parametrize("period", [0, -5])
def test_unsinnige_perioden_fliegen_auf(frame, period) -> None:
    with pytest.raises(ValueError):
        ema(frame["close"], period)
