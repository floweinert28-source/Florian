"""Handrechnungen gegen die VIC-VWAP- und OR-Berechnung."""

from datetime import datetime, timezone

import numpy as np
import pandas as pd
import pytest

from propbot.vic_levels import berechne_vic_level


def _frame(zeilen):
    """zeilen: Liste (iso_utc, o, h, l, c, v)."""
    idx = pd.DatetimeIndex([pd.Timestamp(z[0], tz="UTC") for z in zeilen])
    return pd.DataFrame(
        {
            "open": [z[1] for z in zeilen],
            "high": [z[2] for z in zeilen],
            "low": [z[3] for z in zeilen],
            "close": [z[4] for z in zeilen],
            "volume": [z[5] for z in zeilen],
        },
        index=idx,
    )


def test_ny_vwap_handrechnung():
    # September: New York = UTC-4, 09:30 ET = 13:30 UTC.
    frame = _frame(
        [
            ("2025-09-02 13:29:00", 100, 101, 99, 100, 5),   # vor RTH
            ("2025-09-02 13:30:00", 100, 102, 100, 101, 2),  # hlc3=101
            ("2025-09-02 13:31:00", 101, 104, 101, 103, 4),  # hlc3=102.6667
        ]
    )
    out = berechne_vic_level(frame)
    assert np.isnan(out["ny_vwap"].iloc[0])
    assert out["ny_vwap"].iloc[1] == pytest.approx(101.0)
    erwartet = (101.0 * 2 + (104 + 101 + 103) / 3 * 4) / 6
    assert out["ny_vwap"].iloc[2] == pytest.approx(erwartet)


def test_overnight_ankert_um_18_et_und_laeuft_durch():
    # 18:00 ET am 1.9. = 22:00 UTC; alles danach gehoert zum Handelstag 2.9.
    frame = _frame(
        [
            ("2025-09-01 21:59:00", 10, 10, 10, 10, 1),   # alter Handelstag
            ("2025-09-01 22:00:00", 20, 20, 20, 20, 1),   # neuer Handelstag
            ("2025-09-02 13:30:00", 40, 40, 40, 40, 1),   # RTH desselben Handelstags
        ]
    )
    out = berechne_vic_level(frame)
    assert out["ov_vwap"].iloc[0] == pytest.approx(10.0)
    assert out["ov_vwap"].iloc[1] == pytest.approx(20.0)
    # Kein Reset um 09:30: (20 + 40) / 2
    assert out["ov_vwap"].iloc[2] == pytest.approx(30.0)


def test_pd_vwap_ankert_am_vortags_open_und_rollt_um_16():
    frame = _frame(
        [
            ("2025-09-02 13:30:00", 100, 100, 100, 100, 1),  # Tag1 Open
            ("2025-09-02 19:59:00", 110, 110, 110, 110, 1),  # Tag1 RTH
            ("2025-09-02 20:00:00", 120, 120, 120, 120, 1),  # 16:00 ET -> Session zu
            ("2025-09-03 13:30:00", 130, 130, 130, 130, 1),  # Tag2 Open
        ]
    )
    out = berechne_vic_level(frame)
    # Waehrend Tag1-RTH gibt es noch keine geschlossene Session -> NaN.
    assert np.isnan(out["pd_vwap"].iloc[1])
    # Ab 16:00 ist Tag1 zu: Anker = Tag1-Open, kumuliert weiter.
    assert out["pd_vwap"].iloc[2] == pytest.approx((100 + 110 + 120) / 3)
    assert out["pd_vwap"].iloc[3] == pytest.approx((100 + 110 + 120 + 130) / 4)


def test_opening_range_sperrt_um_0945():
    zeilen = []
    for m in range(30, 50):
        preis = 100 + m
        zeilen.append((f"2025-09-02 13:{m:02d}:00", preis, preis + 2, preis - 2, preis, 1))
    out = berechne_vic_level(_frame(zeilen))
    # 09:30-09:44 -> High der Kerze 13:44 (100+44+2), Low der Kerze 13:30 (100+30-2)
    gesperrt = out[out["or_locked"]]
    assert not gesperrt.empty
    assert gesperrt["or_high"].iloc[0] == pytest.approx(146.0)
    assert gesperrt["or_low"].iloc[0] == pytest.approx(128.0)
    # Ab 09:45 friert die Range ein.
    assert out["or_locked"].iloc[15] and not out["or_locked"].iloc[14]
    assert out["or_high"].iloc[-1] == pytest.approx(146.0)


def test_nullvolumen_verschiebt_vwap_nicht():
    frame = _frame(
        [
            ("2025-09-02 13:30:00", 100, 100, 100, 100, 2),
            ("2025-09-02 13:31:00", 500, 500, 500, 500, 0),
            ("2025-09-02 13:32:00", 100, 100, 100, 100, 2),
        ]
    )
    out = berechne_vic_level(frame)
    assert out["ny_vwap"].iloc[2] == pytest.approx(100.0)
