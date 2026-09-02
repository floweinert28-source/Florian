"""Tests des Squeeze-Breakouts."""

from __future__ import annotations

import numpy as np
import pandas as pd
import pytest

from propbot.engine import check_no_lookahead
from propbot.models import Side
from propbot.strategy import SessionWindow, SqueezeBreakout, SqueezeBreakoutParams


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
    """Steigende Tage; am letzten eine enge Spanne, dann Ausbruch nach oben."""
    tage = []
    for nummer, datum in enumerate(pd.bdate_range("2023-03-01", periods=10)):
        basis = 15_000 + nummer * 150
        kurse = [basis + (i % 4) * 20 for i in range(78)]
        tage.append(rth_tag(f"{datum:%Y-%m-%d}", kurse, spanne=15.0))
    basis = 15_000 + 10 * 150
    ruhig = [basis + (i % 2) * 3 for i in range(40)]  # sehr enge Spanne
    ausbruch = [basis + 40 + i * 12 for i in range(38)]  # klarer Ausbruch
    tage.append(rth_tag("2023-03-15", ruhig + ausbruch, spanne=3.0))
    frame = pd.concat(tage)
    frame.index.name = "time"
    return frame


def test_parameter_werden_geprueft() -> None:
    with pytest.raises(ValueError):
        SqueezeBreakoutParams(squeeze_bars=1)
    with pytest.raises(ValueError):
        SqueezeBreakoutParams(squeeze_quantil=0)
    with pytest.raises(ValueError):
        SqueezeBreakoutParams(quantil_fenster=5)
    with pytest.raises(ValueError):
        SqueezeBreakoutParams(min_range_atr=3.0, max_range_atr=1.0)


def test_verengung_wird_aus_vorkerzen_gemessen(markt) -> None:
    """Die Ausbruchskerze darf nicht Teil ihrer eigenen Bedingung sein."""
    strategie = SqueezeBreakout(session=SessionWindow.us_futures_rth())
    daten = strategie.prepare(markt)

    versatz = daten["high"].rolling(strategie.p.squeeze_bars).max().shift(1)
    assert daten["sq_high"].equals(versatz)


def test_ausbruch_erzeugt_signal(markt) -> None:
    strategie = SqueezeBreakout(
        SqueezeBreakoutParams(require_vwap_side=False, min_atr_pct=None, max_atr_pct=None),
        session=SessionWindow.us_futures_rth(),
    )
    daten = strategie.prepare(markt)

    assert int(daten["long_signal"].sum()) > 0


def test_stop_liegt_an_der_gegenseite(markt) -> None:
    strategie = SqueezeBreakout(
        SqueezeBreakoutParams(require_vwap_side=False, min_atr_pct=None, max_atr_pct=None),
        session=SessionWindow.us_futures_rth(),
    )
    daten = strategie.prepare(markt)
    geprueft = 0
    for index in np.flatnonzero(daten["long_signal"].to_numpy()):
        signal = strategie.signal(daten, int(index))
        if signal is None:
            continue
        einstieg = float(daten["close"].iloc[index])
        assert signal.stop_price < einstieg < signal.target_price
        assert signal.side is Side.LONG
        geprueft += 1
    assert geprueft > 0


def test_abstand_und_tageslimit_greifen() -> None:
    """Ohne Mindestabstand feuert dieselbe Verengung mehrfach hintereinander.

    Geprueft wird die Ausduennung direkt: sie ist der Teil, der ueber die
    Trade-Zahl je Tag entscheidet.
    """
    from propbot.strategy.squeeze import _mit_abstand

    roh = np.array([True] * 10)
    tag = np.array([1] * 5 + [2] * 5)

    ohne = _mit_abstand(roh, tag, abstand=0, max_pro_tag=99)
    mit_abstand = _mit_abstand(roh, tag, abstand=2, max_pro_tag=99)
    mit_limit = _mit_abstand(roh, tag, abstand=0, max_pro_tag=2)

    assert ohne.sum() == 10, "ohne Bremse zaehlt jedes Signal"
    assert mit_abstand.sum() == 4, "je Tag nur jedes dritte Signal"
    assert mit_limit.sum() == 4, "zwei je Tag, an zwei Tagen"
    # Der Tageswechsel setzt beide Zaehler zurueck
    assert mit_abstand[0] and mit_abstand[5]


def test_shorts_lassen_sich_abschalten(markt) -> None:
    daten = SqueezeBreakout(
        SqueezeBreakoutParams(allow_short=False, require_vwap_side=False),
        session=SessionWindow.us_futures_rth(),
    ).prepare(markt)

    assert int(daten["short_signal"].sum()) == 0


def test_kein_blick_in_die_zukunft() -> None:
    from propbot.data import synthetic_market

    strategie = SqueezeBreakout(session=SessionWindow.us_futures_rth())
    frame = synthetic_market(bars=6000, seed=31, timeframe_minutes=5)

    assert check_no_lookahead(strategie, frame, samples=12) == []
