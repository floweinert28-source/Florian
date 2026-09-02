"""Strukturpruefungen der VIC-Strategie auf einem echten Datenausschnitt."""

from pathlib import Path

import numpy as np
import pandas as pd
import pytest

from propbot.data import load_csv
from propbot.strategy.vic import FOMC_TAGE, Vic, VicParams

DATEN = Path(__file__).resolve().parents[2] / "data" / "nq_m1.csv"

pytestmark = pytest.mark.skipif(not DATEN.exists(), reason="NQ-Datensatz fehlt")


@pytest.fixture(scope="module")
def vorbereitet():
    frame = load_csv(DATEN).loc["2026-05-01":"2026-07-15"]
    return Vic().prepare(frame)


def test_signale_nur_im_fenster(vorbereitet):
    sig = vorbereitet[vorbereitet["vic_signal"] != 0]
    assert len(sig) > 0, "Ausschnitt sollte Signale enthalten"
    minuten = sig["minute_et"]
    assert (minuten >= 9 * 60 + 45).all()
    assert (minuten <= 11 * 60 + 15).all()


def test_stop_und_ziel_auf_der_richtigen_seite(vorbereitet):
    sig = vorbereitet[vorbereitet["vic_signal"] != 0]
    long = sig[sig["vic_signal"] > 0]
    short = sig[sig["vic_signal"] < 0]
    assert (long["vic_stop"] < long["close"]).all()
    assert (long["vic_target"] > long["close"]).all()
    assert (short["vic_stop"] > short["close"]).all()
    assert (short["vic_target"] < short["close"]).all()


def test_stop_nie_direkt_auf_einem_vwap(vorbereitet):
    p = VicParams()
    sig = vorbereitet[vorbereitet["vic_signal"] != 0]
    for _, row in sig.iterrows():
        for linie in (row["ny_vwap"], row["ov_vwap"], row["pd_vwap"]):
            if np.isfinite(linie):
                assert abs(row["vic_stop"] - linie) >= p.vwap_stop_abstand - 1e-9


def test_fomc_tage_ohne_signal(vorbereitet):
    sig = vorbereitet[vorbereitet["vic_signal"] != 0]
    tage = set(sig.index.tz_convert("America/New_York").date)
    assert not (tage & FOMC_TAGE)


def test_kein_lookahead_am_signal(vorbereitet):
    """Signal muss auf gekuerzten Daten identisch entstehen."""
    voll = vorbereitet
    sig_idx = np.flatnonzero(voll["vic_signal"].to_numpy() != 0)
    t = int(sig_idx[0])
    roh = load_csv(DATEN).loc["2026-05-01":"2026-07-15"]
    kurz = Vic().prepare(roh.iloc[: t + 1])
    assert kurz["vic_signal"].iloc[t] == voll["vic_signal"].iloc[t]
    assert kurz["vic_stop"].iloc[t] == pytest.approx(voll["vic_stop"].iloc[t])
    assert kurz["vic_target"].iloc[t] == pytest.approx(voll["vic_target"].iloc[t])
