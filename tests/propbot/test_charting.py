"""Tests der Chart-Werkzeuge."""

from __future__ import annotations

import numpy as np
import pandas as pd
import pytest

from propbot.charting import TIMEFRAMES, male_chart, schneide, zahlentafel, zeitprofil


@pytest.fixture(scope="module")
def markt() -> pd.DataFrame:
    """Drei Handelstage aus M1-Kerzen, 09:30 bis 16:00 New Yorker Zeit."""
    rng = np.random.default_rng(3)
    teile = []
    for nummer, datum in enumerate(pd.bdate_range("2024-03-04", periods=3)):
        start = pd.Timestamp(f"{datum:%Y-%m-%d} 09:30", tz="America/New_York")
        index = pd.DatetimeIndex([start + pd.Timedelta(minutes=i) for i in range(390)])
        kurse = 18_000 + nummer * 50 + np.cumsum(rng.normal(0, 3.0, 390))
        frame = pd.DataFrame(
            {
                "open": kurse,
                "high": kurse + rng.uniform(1, 6, 390),
                "low": kurse - rng.uniform(1, 6, 390),
                "close": kurse + rng.normal(0, 2, 390),
                "volume": rng.uniform(50, 200, 390),
            },
            index=index.tz_convert("UTC"),
        )
        frame.index.name = "time"
        teile.append(frame)
    return pd.concat(teile)


def test_alle_timeframes_lassen_sich_schneiden(markt) -> None:
    for name in ("1m", "5m", "15m", "30m", "1h"):
        a = schneide(markt, timeframe=name, datum="2024-03-05")
        assert len(a.kerzen) > 0
        assert a.timeframe == name


def test_groesserer_zeitrahmen_hat_weniger_kerzen(markt) -> None:
    fein = schneide(markt, timeframe="5m", datum="2024-03-05")
    grob = schneide(markt, timeframe="30m", datum="2024-03-05")
    assert len(grob.kerzen) < len(fein.kerzen)
    # Aggregation muss verlustfrei sein: Extremwerte bleiben erhalten.
    assert grob.kerzen["high"].max() == pytest.approx(fein.kerzen["high"].max())
    assert grob.kerzen["low"].min() == pytest.approx(fein.kerzen["low"].min())


def test_vortageslevel_kommen_vom_vortag(markt) -> None:
    a = schneide(markt, timeframe="15m", datum="2024-03-05")
    vortag = markt[
        markt.index.tz_convert("America/New_York").date == pd.Timestamp("2024-03-04").date()
    ]
    assert a.vortag_hoch == pytest.approx(float(vortag["high"].max()))
    assert a.vortag_tief == pytest.approx(float(vortag["low"].min()))


def test_kerzenzahl_ist_gedeckelt(markt) -> None:
    """Zu viele Kerzen machen das Bild unlesbar - der Deckel muss greifen."""
    a = schneide(markt, timeframe="1m", datum="2024-03-05", max_kerzen=60)
    assert len(a.kerzen) == 60


def test_zeitfenster_wird_beachtet(markt) -> None:
    a = schneide(markt, timeframe="5m", datum="2024-03-05", von="10:00", bis="11:00")
    zeiten = a.kerzen.index.tz_convert("America/New_York")
    assert zeiten.min().strftime("%H:%M") >= "10:00"
    assert zeiten.max().strftime("%H:%M") < "11:00"


def test_unbekannter_zeitrahmen_meldet_sich(markt) -> None:
    with pytest.raises(ValueError, match="Unbekannter Zeitrahmen"):
        schneide(markt, timeframe="7m", datum="2024-03-05")


def test_tag_ohne_daten_meldet_sich(markt) -> None:
    with pytest.raises(ValueError, match="Keine Daten"):
        schneide(markt, timeframe="5m", datum="2024-03-09")


def test_bild_wird_geschrieben(markt, tmp_path) -> None:
    ausschnitte = [schneide(markt, timeframe=tf, datum="2024-03-05") for tf in ("5m", "15m")]
    ziel = male_chart(ausschnitte, tmp_path / "chart.png", titel="TEST", marken=["10:00"])
    assert ziel.exists()
    assert ziel.stat().st_size > 5_000, "Bild ist verdaechtig klein"


def test_zahlentafel_nennt_hoch_und_tief(markt) -> None:
    a = schneide(markt, timeframe="15m", datum="2024-03-05")
    text = zahlentafel(a)
    assert f"{a.kerzen['high'].max():,.2f}" in text
    assert f"{a.kerzen['low'].min():,.2f}" in text
    assert "Zeitrahmen 15m" in text


def test_zeitprofil_deckt_den_handelstag_ab(markt) -> None:
    profil = zeitprofil(markt, takt=30)
    assert profil.index[0] == "09:30"
    assert "15:30" in profil.index
    assert (profil["kerzen"] > 0).all()
    assert (profil["anteil_gruen"].between(0, 1)).all()


def test_timeframe_tabelle_ist_vollstaendig() -> None:
    for name in ("1m", "5m", "15m", "30m", "1h", "4h", "1d"):
        assert name in TIMEFRAMES
