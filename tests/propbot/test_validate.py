"""Tests des Quellenvergleichs."""

from __future__ import annotations

import numpy as np
import pandas as pd
import pytest

from propbot.cli import _timeframe_regel
from propbot.config import ConfigError
from propbot.validate import vergleiche_quellen


def reihe(werte: np.ndarray, start: str = "2024-01-02 14:00") -> pd.DataFrame:
    index = pd.date_range(start, periods=len(werte), freq="1h", tz="UTC")
    return pd.DataFrame(
        {
            "open": werte,
            "high": werte * 1.001,
            "low": werte * 0.999,
            "close": werte,
            "volume": 1.0,
        },
        index=pd.DatetimeIndex(index, name="time"),
    )


def test_identische_quellen_sind_deckungsgleich() -> None:
    rng = np.random.default_rng(4)
    kurse = 15_000 * np.cumprod(1 + rng.normal(0, 0.001, 300))

    ergebnis = vergleiche_quellen(reihe(kurse), reihe(kurse))

    assert ergebnis.korrelation == pytest.approx(1.0)
    assert ergebnis.tracking_error_bp == pytest.approx(0.0, abs=1e-6)
    assert ergebnis.brauchbar


def test_konstanter_aufschlag_stoert_nicht() -> None:
    """Der Future notiert ueber dem Index - das ist kein Trackingfehler."""
    rng = np.random.default_rng(5)
    kurse = 15_000 * np.cumprod(1 + rng.normal(0, 0.001, 300))

    ergebnis = vergleiche_quellen(reihe(kurse), reihe(kurse + 120))

    assert ergebnis.korrelation > 0.999
    assert ergebnis.aufschlag_punkte == pytest.approx(120, abs=1)
    assert ergebnis.brauchbar


def test_unabhaengige_reihen_fallen_durch() -> None:
    rng = np.random.default_rng(6)
    a = 15_000 * np.cumprod(1 + rng.normal(0, 0.001, 300))
    b = 15_000 * np.cumprod(1 + rng.normal(0, 0.001, 300))

    ergebnis = vergleiche_quellen(reihe(a), reihe(b))

    assert ergebnis.korrelation < 0.5
    assert not ergebnis.brauchbar
    assert "ACHTUNG" in ergebnis.describe()


def test_zu_wenig_ueberschneidung_meldet_sich() -> None:
    rng = np.random.default_rng(7)
    a = reihe(15_000 * np.cumprod(1 + rng.normal(0, 0.001, 100)), start="2024-01-02 14:00")
    b = reihe(15_000 * np.cumprod(1 + rng.normal(0, 0.001, 100)), start="2025-01-02 14:00")

    with pytest.raises(ValueError, match="gemeinsame"):
        vergleiche_quellen(a, b)


@pytest.mark.parametrize(
    "name,regel", [("M1", "1min"), ("M15", "15min"), ("H1", "1h"), ("H4", "4h"), ("D1", "1D")]
)
def test_zeitrahmen_werden_uebersetzt(name, regel) -> None:
    assert _timeframe_regel(name) == regel


@pytest.mark.parametrize("name", ["15M", "X5", "M", "quatsch"])
def test_unsinnige_zeitrahmen_fliegen_auf(name) -> None:
    with pytest.raises(ConfigError):
        _timeframe_regel(name)
