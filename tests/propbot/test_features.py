"""Tests des Marktkontexts: VWAP, Tagesstruktur, Momentum, Kerzen."""

from __future__ import annotations

import numpy as np
import pandas as pd
import pytest

from propbot.features import FEATURE_GRUPPEN, baue_features, volumenprofil


def tag(datum: str, kerzen, volumen=None):
    start = pd.Timestamp(f"{datum} 09:30", tz="America/New_York").tz_convert("UTC")
    index = [start + pd.Timedelta(minutes=15 * i) for i in range(len(kerzen))]
    frame = pd.DataFrame(kerzen, columns=["open", "high", "low", "close"], index=index)
    frame["volume"] = volumen if volumen is not None else 1.0
    return frame


def markt(tage) -> pd.DataFrame:
    frame = pd.concat(tage)
    frame.index.name = "time"
    return frame


def ruhig(datum: str, basis: float = 15_000.0, n: int = 26):
    return tag(datum, [(basis, basis + 30, basis - 30, basis) for _ in range(n)])


def test_vwap_liegt_zwischen_hoch_und_tief() -> None:
    frame = markt([ruhig(f"{t:%Y-%m-%d}") for t in pd.bdate_range("2023-01-02", periods=10)])
    f = baue_features(frame)

    assert (f["vwap"] >= f["low"].groupby(f.index.date).cummin() - 1e-6).all()
    assert (f["vwap"] <= f["high"].groupby(f.index.date).cummax() + 1e-6).all()


def test_vwap_startet_jeden_tag_neu() -> None:
    tage = [
        ruhig(f"{t:%Y-%m-%d}", basis)
        for t, basis in zip(
            pd.bdate_range("2023-01-02", periods=4), [15_000, 16_000, 17_000, 18_000]
        )
    ]
    f = baue_features(markt(tage))
    erste = f.groupby(f.index.date)["vwap"].first()

    # Der erste VWAP eines Tages ist der Typical Price dieser Kerze, nicht der Vortagswert
    assert erste.iloc[1] == pytest.approx(16_000, abs=30)
    assert erste.iloc[2] == pytest.approx(17_000, abs=30)


def test_vortageswerte_stammen_vom_vortag() -> None:
    tage = [ruhig("2023-01-02", 15_000), ruhig("2023-01-03", 16_000)]
    f = baue_features(markt(tage))
    zweiter = f[f.index.date == pd.Timestamp("2023-01-03").date()]

    # Vortageshoch war 15.030, der Kurs steht bei 16.000
    assert (zweiter["pdh_abstand"] > 0).all()
    assert zweiter["gap_atr"].iloc[0] > 0, "Eroeffnung ueber dem Vortagsschluss = Gap hoch"


def test_kerzenmerkmale_rechnen_richtig() -> None:
    kerzen = [(100.0, 110.0, 90.0, 105.0)] + [(100.0, 110.0, 90.0, 105.0)] * 25
    f = baue_features(markt([tag("2023-01-02", kerzen)]))
    zeile = f.iloc[5]

    assert zeile["koerper_anteil"] == pytest.approx(5 / 20)
    assert zeile["docht_oben"] == pytest.approx(5 / 20)
    assert zeile["docht_unten"] == pytest.approx(10 / 20)


def test_folge_gruen_zaehlt_serien() -> None:
    kerzen = [
        (100, 101, 99, 101),
        (101, 102, 100, 102),
        (102, 103, 101, 103),
        (103, 104, 102, 101),
    ] + [(101, 102, 100, 101)] * 22
    f = baue_features(markt([tag("2023-01-02", kerzen)]))

    assert list(f["folge_gruen"].iloc[:4]) == [1, 2, 3, 0]


def test_volumenprofil_ist_normiert() -> None:
    frame = markt([ruhig(f"{t:%Y-%m-%d}") for t in pd.bdate_range("2023-01-02", periods=5)])
    profil = volumenprofil(frame)

    assert profil.mean() == pytest.approx(1.0, abs=0.01)
    assert (profil > 0).all()


@pytest.mark.parametrize("spalte", ["vwap", "rsi", "roc_8", "pdh_abstand", "vwap_abstand"])
def test_merkmale_schauen_nicht_in_die_zukunft(spalte) -> None:
    """Kein Merkmal darf sich aendern, wenn spaetere Kerzen fehlen."""
    from propbot.data import synthetic_market

    frame = synthetic_market(bars=3000, seed=11, timeframe_minutes=15)
    voll = baue_features(frame)
    for schnitt in (1500, 2000, 2500):
        gekuerzt = baue_features(frame.iloc[:schnitt])
        a, b = gekuerzt[spalte].iloc[-1], voll[spalte].iloc[schnitt - 1]
        if pd.isna(a) and pd.isna(b):
            continue
        assert a == pytest.approx(b, rel=1e-6), spalte


def test_alle_gruppen_liefern_spalten() -> None:
    from propbot.data import synthetic_market

    f = baue_features(synthetic_market(bars=800, seed=3, timeframe_minutes=15))
    for gruppe, namen in FEATURE_GRUPPEN.items():
        for name in namen:
            assert name in f.columns, f"{gruppe}: {name} fehlt"
            assert np.isfinite(f[name].dropna()).all(), name
