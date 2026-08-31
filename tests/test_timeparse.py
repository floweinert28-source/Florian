"""Tests fuer den Faelligkeits-Parser."""

from __future__ import annotations

from datetime import datetime, timedelta

import pytest

from tasksbot.timeparse import DueDateError, parse_due

from .conftest import BERLIN, NOW


def due(text: str) -> datetime:
    """Parst und gibt das Ergebnis in Berliner Zeit zurueck."""
    return parse_due(text, now=NOW, tz=BERLIN).astimezone(BERLIN)


@pytest.mark.parametrize(
    ("text", "expected"),
    [
        ("2h", "2026-08-31 14:00"),
        ("in 2h", "2026-08-31 14:00"),
        ("30min", "2026-08-31 12:30"),
        ("45 minuten", "2026-08-31 12:45"),
        ("3d", "2026-09-03 12:00"),
        ("3 tage", "2026-09-03 12:00"),
        ("1w", "2026-09-07 12:00"),
        ("1d 6h", "2026-09-01 18:00"),
    ],
)
def test_relative_angaben(text: str, expected: str) -> None:
    assert due(text).strftime("%Y-%m-%d %H:%M") == expected


@pytest.mark.parametrize(
    ("text", "expected"),
    [
        ("heute 17:00", "2026-08-31 17:00"),
        ("morgen 09:30", "2026-09-01 09:30"),
        ("morgen", "2026-09-01 23:59"),
        ("uebermorgen", "2026-09-02 23:59"),
        ("übermorgen", "2026-09-02 23:59"),
        ("17 uhr", "2026-08-31 17:00"),
        ("18:30", "2026-08-31 18:30"),
    ],
)
def test_schluesselwoerter(text: str, expected: str) -> None:
    assert due(text).strftime("%Y-%m-%d %H:%M") == expected


@pytest.mark.parametrize(
    ("text", "expected"),
    [
        ("freitag 18:00", "2026-09-04 18:00"),
        ("freitag", "2026-09-04 23:59"),
        ("fr", "2026-09-04 23:59"),
        ("am freitag", "2026-09-04 23:59"),
        # NOW ist selbst ein Montag: Tagesende ist noch nicht vorbei.
        ("montag", "2026-08-31 23:59"),
        # ... 08:00 Uhr am Montag ist es aber, also naechste Woche.
        ("montag 08:00", "2026-09-07 08:00"),
    ],
)
def test_wochentage(text: str, expected: str) -> None:
    assert due(text).strftime("%Y-%m-%d %H:%M") == expected


@pytest.mark.parametrize(
    ("text", "expected"),
    [
        ("2026-09-05", "2026-09-05 23:59"),
        ("2026-09-05 14:30", "2026-09-05 14:30"),
        ("05.09.2026", "2026-09-05 23:59"),
        ("5.9.2026 8:00", "2026-09-05 08:00"),
        ("5.9.26 8:00", "2026-09-05 08:00"),
        # Datum ohne Jahr meint das naechste Vorkommen ...
        ("24.12.", "2026-12-24 23:59"),
        # ... auch wenn das ins Folgejahr rutscht.
        ("01.02.", "2027-02-01 23:59"),
    ],
)
def test_datumsformate(text: str, expected: str) -> None:
    assert due(text).strftime("%Y-%m-%d %H:%M") == expected


@pytest.mark.parametrize(
    "text", ["", "   ", "quatsch", "irgendwann", "0h", "32.13.2026", "heute 25:00", "morgen 12:99"]
)
def test_unklare_angaben_werden_abgelehnt(text: str) -> None:
    with pytest.raises(DueDateError):
        parse_due(text, now=NOW, tz=BERLIN)


def test_ergebnis_ist_utc_und_in_der_zukunft() -> None:
    result = parse_due("2h", now=NOW, tz=BERLIN)
    assert result.utcoffset() == timedelta(0)
    assert result > NOW


def test_sommerzeitwechsel_wird_beruecksichtigt() -> None:
    """Ueber die Zeitumstellung hinweg bleibt die lokale Uhrzeit erhalten."""
    # 25.10.2026 ist der Umstellungstag von CEST auf CET.
    before = datetime(2026, 10, 23, 10, 0, tzinfo=BERLIN)
    result = parse_due("26.10.2026 09:00", now=before, tz=BERLIN).astimezone(BERLIN)
    assert result.strftime("%Y-%m-%d %H:%M %Z") == "2026-10-26 09:00 CET"
