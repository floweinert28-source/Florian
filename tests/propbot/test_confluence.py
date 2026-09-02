"""Tests der Confluence-Schicht."""

from __future__ import annotations

import pytest

from propbot.confluence import BEDINGUNGEN, ConfluenceSettings, ConfluenceStrategy
from propbot.data import synthetic_market
from propbot.models import Side, Signal
from propbot.strategy.base import SessionWindow, Strategy


class ImmerSignal(Strategy):
    """Testhilfe: liefert ab einem Index immer dasselbe Signal."""

    name = "immer"

    def __init__(self, seite=Side.LONG):
        super().__init__(SessionWindow.us_futures_rth())
        self.seite = seite

    @property
    def warmup(self) -> int:
        return 60

    def prepare(self, frame):
        return frame.copy()

    def signal(self, frame, index):
        if index < self.warmup:
            return None
        kurs = float(frame["close"].iloc[index])
        if self.seite is Side.LONG:
            return Signal(side=Side.LONG, stop_price=kurs * 0.99, target_price=kurs * 1.02)
        return Signal(side=Side.SHORT, stop_price=kurs * 1.01, target_price=kurs * 0.98)


@pytest.fixture(scope="module")
def markt():
    return synthetic_market(bars=3000, seed=5, timeframe_minutes=15)


def test_unbekannte_bedingung_fliegt_auf() -> None:
    with pytest.raises(ValueError, match="Unbekannte"):
        ConfluenceSettings(bedingungen=("gibt_es_nicht",))
    with pytest.raises(ValueError):
        ConfluenceSettings(mindestpunkte=99)


def test_hoehere_schwelle_laesst_weniger_durch(markt) -> None:
    durchgelassen = {}
    for schwelle in (0, 3, 6):
        s = ConfluenceStrategy(ImmerSignal(), ConfluenceSettings(mindestpunkte=schwelle))
        daten = s.prepare(markt)
        durchgelassen[schwelle] = sum(
            1 for i in range(len(daten)) if s.signal(daten, i) is not None
        )

    assert durchgelassen[0] > durchgelassen[3] > durchgelassen[6]
    assert durchgelassen[0] > 0


def test_punkte_landen_im_signal(markt) -> None:
    s = ConfluenceStrategy(ImmerSignal(), ConfluenceSettings(mindestpunkte=0))
    daten = s.prepare(markt)
    signale = [s.signal(daten, i) for i in range(len(daten))]
    treffer = [x for x in signale if x is not None]

    assert treffer
    assert "confluence" in treffer[0].context
    assert 0 <= treffer[0].context["confluence"] <= len(BEDINGUNGEN)


def test_richtungsabhaengige_merkmale_werden_gespiegelt(markt) -> None:
    """Dasselbe Umfeld muss fuer Long und Short unterschiedlich bewertet werden."""
    lang = ConfluenceStrategy(ImmerSignal(Side.LONG), ConfluenceSettings(mindestpunkte=0))
    kurz = ConfluenceStrategy(ImmerSignal(Side.SHORT), ConfluenceSettings(mindestpunkte=0))
    lang.prepare(markt)
    kurz.prepare(markt)
    punkte_l = [lang.bewerte(i, Side.LONG)[0] for i in range(200, 400)]
    punkte_k = [kurz.bewerte(i, Side.SHORT)[0] for i in range(200, 400)]

    assert punkte_l != punkte_k, "Long und Short duerfen nicht gleich bewertet werden"


def test_bericht_zeigt_die_verteilung(markt) -> None:
    s = ConfluenceStrategy(ImmerSignal(), ConfluenceSettings(mindestpunkte=4))
    daten = s.prepare(markt)
    for i in range(len(daten)):
        s.signal(daten, i)

    text = s.report()
    assert "Confluence-Punkte" in text and "verworfen" in text
