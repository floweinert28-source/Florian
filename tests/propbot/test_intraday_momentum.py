"""Tests des Intraday-Momentums."""

from __future__ import annotations

import numpy as np
import pandas as pd
import pytest

from propbot.engine import check_no_lookahead
from propbot.models import Side
from propbot.strategy import IntradayMomentum, IntradayMomentumParams, SessionWindow


def rth_tag(datum: str, kurse: list[float], spanne: float = 8.0):
    """Ein Handelstag aus M5-Kerzen ab 09:30 New Yorker Zeit."""
    start = pd.Timestamp(f"{datum} 09:30", tz="America/New_York").tz_convert("UTC")
    index = [start + pd.Timedelta(minutes=5 * i) for i in range(len(kurse))]
    zeilen = []
    for i, kurs in enumerate(kurse):
        vorher = kurse[i - 1] if i else kurs
        zeilen.append((vorher, max(kurs, vorher) + spanne, min(kurs, vorher) - spanne, kurs))
    frame = pd.DataFrame(zeilen, columns=["open", "high", "low", "close"], index=index)
    frame["volume"] = 1.0
    return frame


@pytest.fixture(scope="module")
def markt():
    """Zufallspfade als normale Tage, dann ein ungewoehnlich weiter Tag.

    Wichtig: die normalen Tage muessen echte Irrfahrten sein. Ein sich
    wiederholendes Muster haette an jeder Minute dieselbe Auslenkung von der
    Eroeffnung - dann waere das Band flach und der Test wertlos, ohne dass
    die Strategie etwas falsch macht.
    """
    rng = np.random.default_rng(7)
    tage = []
    for nummer, datum in enumerate(pd.bdate_range("2023-03-01", periods=40)):
        basis = 15_000 + nummer * 5
        kurse = list(basis + np.cumsum(rng.normal(0, 4.0, 78)))
        tage.append(rth_tag(f"{datum:%Y-%m-%d}", kurse, spanne=6.0))
    basis = 15_000 + 40 * 5
    lauf = [basis + i * 14 for i in range(78)]  # weit ueber das uebliche Band
    tage.append(rth_tag("2023-04-26", lauf, spanne=6.0))
    frame = pd.concat(tage)
    frame.index.name = "time"
    return frame


@pytest.fixture(scope="module")
def strategie():
    return IntradayMomentum(
        IntradayMomentumParams(lookback_tage=20, band_faktor=1.0, require_vwap_side=False),
        session=SessionWindow.us_futures_rth(),
    )


def test_band_waechst_im_tagesverlauf(markt, strategie) -> None:
    """Das Band muss sich oeffnen: spaeter am Tag ist der Markt weiter weg."""
    d = strategie.prepare(markt)
    letzter = d[d.index.tz_convert("America/New_York").date == pd.Timestamp("2023-04-26").date()]
    band = letzter["im_band"].dropna()
    assert len(band) > 20
    frueh = band.iloc[:10].mean()
    spaet = band.iloc[-10:].mean()
    assert spaet > frueh, f"Band schrumpft: frueh {frueh:.5f}, spaet {spaet:.5f}"


def test_weiter_tag_erzeugt_signal(markt, strategie) -> None:
    d = strategie.prepare(markt)
    assert d["long_signal"].any(), "Der ungewoehnlich weite Tag muss ein Long ausloesen."


def test_signal_hat_stop_auf_der_richtigen_seite(markt, strategie) -> None:
    d = strategie.prepare(markt)
    index = int(np.flatnonzero(d["long_signal"].to_numpy())[0])
    signal = strategie.signal(d, index)
    assert signal is not None
    assert signal.side is Side.LONG
    assert signal.stop_price < float(d["close"].iloc[index])
    assert signal.target_price > float(d["close"].iloc[index])


def test_band_nutzt_keine_zukunft(markt, strategie) -> None:
    """Die Schwelle darf den heutigen Wert nicht enthalten."""
    verdaechtig = check_no_lookahead(strategie, markt, samples=12)
    assert not verdaechtig, f"Lookahead bei {verdaechtig}"


def test_tageslimit_wird_eingehalten(markt) -> None:
    strategie = IntradayMomentum(
        IntradayMomentumParams(
            lookback_tage=20, max_signals_per_day=2, cooldown_bars=0, require_vwap_side=False
        ),
        session=SessionWindow.us_futures_rth(),
    )
    d = strategie.prepare(markt)
    signale = d["long_signal"] | d["short_signal"]
    je_tag = signale.groupby(d.index.tz_convert("America/New_York").date).sum()
    assert je_tag.max() <= 2, f"Zu viele Signale an einem Tag: {je_tag.max()}"


def test_unsinnige_parameter_fliegen_auf() -> None:
    with pytest.raises(ValueError):
        IntradayMomentumParams(lookback_tage=2)
    with pytest.raises(ValueError):
        IntradayMomentumParams(band_faktor=0)
    with pytest.raises(ValueError):
        IntradayMomentumParams(min_stop_atr=2.0, max_stop_atr=1.0)
