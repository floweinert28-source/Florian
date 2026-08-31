"""Tests des Datenmoduls."""

from __future__ import annotations

import pandas as pd
import pytest

from propbot.data import load_csv, resample, split, synthetic_market, validate


def test_synthetischer_markt_ist_plausibel() -> None:
    frame = synthetic_market(bars=2000, seed=1)

    assert len(frame) == 2000
    assert (frame["high"] >= frame[["open", "close"]].max(axis=1)).all()
    assert (frame["low"] <= frame[["open", "close"]].min(axis=1)).all()
    assert frame.index.is_monotonic_increasing
    assert (frame.index.weekday < 5).all(), "Wochenenden gehoeren nicht in den Datensatz"


def test_gleicher_seed_gleiche_daten() -> None:
    assert synthetic_market(bars=500, seed=7).equals(synthetic_market(bars=500, seed=7))
    assert not synthetic_market(bars=500, seed=7).equals(synthetic_market(bars=500, seed=8))


def test_volatilitaet_folgt_der_session() -> None:
    frame = synthetic_market(bars=6000, seed=2)
    spanne = (frame["high"] - frame["low"]) / frame["close"]
    overlap = spanne[(frame.index.hour >= 13) & (frame.index.hour < 16)].mean()
    asien = spanne[frame.index.hour < 6].mean()

    assert overlap > asien * 1.5


def test_csv_wird_normalisiert(tmp_path) -> None:
    path = tmp_path / "kurse.csv"
    path.write_text(
        "DATE,OPEN,HIGH,LOW,CLOSE,VOLUME\n"
        "2026-01-05 08:00,1.1,1.2,1.0,1.15,100\n"
        "2026-01-05 08:15,1.15,1.25,1.10,1.20,120\n",
        encoding="utf-8",
    )

    frame = load_csv(path)

    assert list(frame.columns) == ["open", "high", "low", "close", "volume"]
    assert str(frame.index.tz) == "UTC"
    assert len(frame) == 2


def test_csv_ohne_zeitspalte_meldet_sich(tmp_path) -> None:
    path = tmp_path / "kaputt.csv"
    path.write_text("a,b\n1,2\n", encoding="utf-8")

    with pytest.raises(ValueError, match="Zeitspalte"):
        load_csv(path)


def test_unplausible_kerzen_fliegen_auf() -> None:
    frame = pd.DataFrame(
        {"open": [1.0], "high": [0.9], "low": [0.8], "close": [0.85], "volume": [1.0]},
        index=pd.DatetimeIndex(["2026-01-05"], name="time"),
    )

    with pytest.raises(ValueError, match="Inkonsistente"):
        validate(frame)


def test_resample_verdichtet_richtig() -> None:
    frame = synthetic_market(bars=400, seed=4)
    stunden = resample(frame, "1h")

    assert len(stunden) < len(frame)
    assert stunden["high"].iloc[0] == pytest.approx(frame["high"].iloc[:4].max())
    assert stunden["open"].iloc[0] == pytest.approx(frame["open"].iloc[0])


def test_split_ist_chronologisch() -> None:
    frame = synthetic_market(bars=1000, seed=5)
    train, test = split(frame, 0.6)

    assert len(train) == 600 and len(test) == 400
    assert train.index[-1] < test.index[0], "niemals zufaellig teilen"
