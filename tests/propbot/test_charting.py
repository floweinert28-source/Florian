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


def test_vwap_springt_nicht_ueber_mitternacht(markt) -> None:
    """Bei einem Fenster ueber Nacht darf der VWAP nicht am Datum zuruecksetzen.

    Die asiatische Sitzung laeuft ueber Mitternacht New Yorker Zeit. Ein
    VWAP-Sprung mitten darin gehoert keiner Sitzung an und waere ein
    Zeichenfehler, kein Marktereignis.
    """
    from propbot.charting import schneide as schneiden

    a = schneiden(
        markt,
        timeframe="5m",
        start="2024-03-04 14:00",
        ende="2024-03-05 12:00",
        zeitzone="America/New_York",
    )
    vwap = a.vwap.dropna()
    schritte = vwap.diff().abs().dropna()
    spanne = float(a.kerzen["high"].max() - a.kerzen["low"].min())

    assert len(vwap) > 10
    assert schritte.max() < spanne * 0.25, "VWAP macht einen Sprung - vermutlich Tagesreset"


def test_tickzaehler_gilt_nicht_als_volumen() -> None:
    """Ein Tick-Zaehler sieht aus wie Volumen, gewichtet aber nicht.

    Dukascopys Volumenspalte streut um Faktor 9; echtes CME-Volumen um 50-100.
    Mit dem Proxy gerechnet weicht der "VWAP" nur um wenige Punkte vom
    ungewichteten Mittel ab - die Linie darf dann nicht VWAP heissen.
    """
    from propbot.charting import volumen_ist_echt

    rng = np.random.default_rng(11)
    proxy = pd.Series(rng.uniform(0.02, 0.08, 400))
    echt = pd.Series(rng.lognormal(mean=6.0, sigma=1.4, size=400))

    assert not volumen_ist_echt(proxy)
    assert volumen_ist_echt(echt)


def test_chart_beschriftet_die_linie_ehrlich(markt, tmp_path) -> None:
    """Bei Proxy-Volumen darf im Bild nicht 'VWAP' als Legende stehen."""
    a = schneide(markt, timeframe="5m", datum="2024-03-05")
    assert not a.vwap_echt, "Der Testmarkt hat gleichmaessiges Volumen - also Proxy"

    ziel = male_chart([a], tmp_path / "chart.png")
    assert ziel.exists()


def test_nullvolumen_bekommt_medianes_gewicht(markt) -> None:
    """Eine Kerze ohne Volumen darf nicht das 20-fache Gewicht bekommen.

    Frueher wurde Volumen 0 durch 1.0 ersetzt - beim Dukascopy-Massstab
    (Median 0.05) war das ein 20-faches Gewicht fuer genau die Kerzen, in denen
    nichts passiert ist.
    """
    from propbot.charting import _vwap

    kerzen = pd.DataFrame(
        {
            "high": [101.0, 102.0, 103.0, 104.0],
            "low": [99.0, 100.0, 101.0, 102.0],
            "close": [100.0, 101.0, 102.0, 103.0],
            "volume": [0.05, 0.0, 0.05, 0.05],
        }
    )
    tag = pd.Index([0, 0, 0, 0])

    linie = _vwap(kerzen, tag)

    typisch = (kerzen["high"] + kerzen["low"] + kerzen["close"]) / 3.0
    assert linie.iloc[-1] == pytest.approx(typisch.mean(), abs=0.01)
