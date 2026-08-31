"""Tests des Dukascopy-Downloaders (ohne Netzzugriff)."""

from __future__ import annotations

import lzma
import struct
from datetime import date

import pytest

from propbot.dukascopy import SYMBOLE, _entpacke, tagesdatei


def baue_datei(saetze: list[tuple[int, int, int, int, int, float]]) -> bytes:
    """Erzeugt eine .bi5-Datei im Dukascopy-Format."""
    roh = b"".join(struct.pack(">IiiiifX".replace("X", ""), *satz) for satz in saetze)
    return lzma.compress(roh, format=lzma.FORMAT_ALONE)


def test_pfad_zaehlt_monate_ab_null() -> None:
    """Dukascopys Januar ist die 00 - der haeufigste Fehler beim Nachbauen."""
    assert tagesdatei("USATECHIDXUSD", date(2023, 1, 10)) == (
        "USATECHIDXUSD/2023/00/10/BID_candles_min_1.bi5"
    )
    assert tagesdatei("USATECHIDXUSD", date(2023, 12, 31)) == (
        "USATECHIDXUSD/2023/11/31/BID_candles_min_1.bi5"
    )


def test_kerzen_werden_richtig_skaliert() -> None:
    datei = baue_datei(
        [
            (0, 11095170, 11093670, 11091200, 11097090, 0.1),
            (60, 11093000, 11094000, 11092000, 11095000, 0.2),
        ]
    )

    frame = _entpacke(datei, date(2023, 1, 10), 1000.0)

    assert len(frame) == 2
    assert frame["open"].iloc[0] == pytest.approx(11095.17)
    assert frame["high"].iloc[0] == pytest.approx(11097.09)
    assert str(frame.index[0]) == "2023-01-10 00:00:00+00:00"
    assert str(frame.index[1]) == "2023-01-10 00:01:00+00:00"


def test_minuten_ohne_handel_fliegen_raus() -> None:
    datei = baue_datei(
        [
            (0, 11095170, 11093670, 11091200, 11097090, 0.1),
            (60, 0, 0, 0, 0, 0.0),  # Luecke: Dukascopy fuellt mit Nullen
        ]
    )

    frame = _entpacke(datei, date(2023, 1, 10), 1000.0)

    assert len(frame) == 1


def test_kaputte_dateien_liefern_nichts() -> None:
    assert _entpacke(b"", date(2023, 1, 10), 1000.0) is None
    assert _entpacke(b"kein lzma", date(2023, 1, 10), 1000.0) is None
    assert (
        _entpacke(lzma.compress(b"123", format=lzma.FORMAT_ALONE), date(2023, 1, 10), 1000.0)
        is None
    )
    assert (
        _entpacke(lzma.compress(b"", format=lzma.FORMAT_ALONE), date(2023, 1, 10), 1000.0) is None
    )


def test_symbolzuordnung_deckt_die_indizes_ab() -> None:
    assert SYMBOLE["NQ"][0] == "USATECHIDXUSD"
    assert SYMBOLE["NQ"][1] == 3, "Indexkurse haben drei Nachkommastellen"
    assert SYMBOLE["EURUSD"][1] == 5
