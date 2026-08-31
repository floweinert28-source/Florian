"""Parser fuer Faelligkeitsangaben wie ``2h``, ``morgen 18:00`` oder ``05.09.2026``.

Bewusst ohne discord-Abhaengigkeit, damit die Logik isoliert testbar bleibt.
"""

from __future__ import annotations

import re
from datetime import date, datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo

__all__ = ["DueDateError", "parse_due", "describe_formats"]

# Wenn nur ein Datum ohne Uhrzeit angegeben wird, gilt die Aufgabe bis Tagesende.
_END_OF_DAY = time(23, 59)

_UNITS: dict[str, str] = {
    "m": "minutes",
    "min": "minutes",
    "mins": "minutes",
    "minute": "minutes",
    "minuten": "minutes",
    "h": "hours",
    "std": "hours",
    "stunde": "hours",
    "stunden": "hours",
    "hour": "hours",
    "hours": "hours",
    "d": "days",
    "t": "days",
    "tag": "days",
    "tage": "days",
    "tagen": "days",
    "day": "days",
    "days": "days",
    "w": "weeks",
    "woche": "weeks",
    "wochen": "weeks",
    "week": "weeks",
    "weeks": "weeks",
}

_WEEKDAYS: dict[str, int] = {
    "montag": 0, "mo": 0, "monday": 0,
    "dienstag": 1, "di": 1, "tuesday": 1,
    "mittwoch": 2, "mi": 2, "wednesday": 2,
    "donnerstag": 3, "do": 3, "thursday": 3,
    "freitag": 4, "fr": 4, "friday": 4,
    "samstag": 5, "sa": 5, "sonnabend": 5, "saturday": 5,
    "sonntag": 6, "so": 6, "sunday": 6,
}

_RELATIVE_PART = re.compile(r"(\d+)\s*([a-zäöü]+)")
_TIME_SUFFIX = re.compile(r"(?:^|\s)(\d{1,2})(?::|\.|\s*uhr\s*)(\d{2})?\s*(?:uhr)?$")
_ISO_DATE = re.compile(r"^(\d{4})-(\d{1,2})-(\d{1,2})$")
_DE_DATE = re.compile(r"^(\d{1,2})\.(\d{1,2})\.(\d{4}|\d{2})?$")


class DueDateError(ValueError):
    """Die Faelligkeitsangabe konnte nicht interpretiert werden."""


def describe_formats() -> str:
    """Kurze Hilfe, die bei Parse-Fehlern ausgegeben wird."""
    return (
        "Moegliche Angaben: `2h`, `30min`, `3d`, `1w`, `heute 17:00`, `morgen`, "
        "`morgen 09:30`, `uebermorgen`, `freitag 18:00`, `05.09.2026`, "
        "`2026-09-05 14:30`"
    )


def parse_due(text: str, *, now: datetime | None = None, tz: ZoneInfo | None = None) -> datetime:
    """Wandelt eine Faelligkeitsangabe in einen UTC-Zeitpunkt um.

    Args:
        text: Nutzereingabe, z. B. ``"morgen 18:00"``.
        now: Referenzzeitpunkt (aware). Default: aktuelle Zeit in UTC.
        tz: Zeitzone, in der die Eingabe gemeint ist. Default: UTC.

    Returns:
        Ein zeitzonenbewusster ``datetime`` in UTC.

    Raises:
        DueDateError: Wenn die Eingabe nicht interpretierbar ist.
    """
    tz = tz or timezone.utc  # type: ignore[assignment]
    now = (now or datetime.now(timezone.utc)).astimezone(tz)

    cleaned = " ".join(text.strip().lower().split())
    if not cleaned:
        raise DueDateError("Die Faelligkeitsangabe ist leer.")

    # Fuellwoerter am Anfang entfernen: "in 2h", "am freitag", "bis morgen".
    cleaned = re.sub(r"^(in|am|bis|um|ab)\s+", "", cleaned)
    if not cleaned:
        raise DueDateError("Die Faelligkeitsangabe ist leer.")

    relative = _try_relative(cleaned, now)
    if relative is not None:
        return relative.astimezone(timezone.utc)

    body, clock = _split_time_suffix(cleaned)
    day = _try_day(body, now)
    if day is None:
        raise DueDateError(f"{text!r} konnte nicht als Zeitpunkt gelesen werden.")

    moment = datetime.combine(day, clock or _END_OF_DAY, tzinfo=tz)

    # "freitag" ohne Datum meint den naechsten Freitag, nicht den vergangenen.
    if moment <= now and body in _WEEKDAYS:
        moment += timedelta(days=7)

    return moment.astimezone(timezone.utc)


def _try_relative(text: str, now: datetime) -> datetime | None:
    """Erkennt Angaben wie ``2h``, ``30 min`` oder ``1d 6h``."""
    matches = list(_RELATIVE_PART.finditer(text))
    if not matches:
        return None

    # Die Teile muessen den gesamten String abdecken, sonst ist es keine
    # reine Relativangabe (z. B. "05.09.2026" darf hier nicht greifen).
    if re.sub(r"[\s,und]+", "", _RELATIVE_PART.sub("", text)):
        return None

    delta = timedelta()
    for match in matches:
        amount, unit = int(match.group(1)), match.group(2)
        field = _UNITS.get(unit)
        if field is None:
            return None
        delta += timedelta(**{field: amount})

    if delta <= timedelta():
        raise DueDateError("Die Faelligkeit muss in der Zukunft liegen.")
    return now + delta


def _split_time_suffix(text: str) -> tuple[str, time | None]:
    """Trennt eine angehaengte Uhrzeit ab: ``"morgen 18:00"`` -> ``("morgen", 18:00)``."""
    match = _TIME_SUFFIX.search(text)
    if not match:
        return text, None

    hour = int(match.group(1))
    minute = int(match.group(2) or 0)
    if hour > 23 or minute > 59:
        raise DueDateError(f"{hour:02d}:{minute:02d} ist keine gueltige Uhrzeit.")

    body = text[: match.start()].strip()
    return body, time(hour, minute)


def _try_day(text: str, now: datetime) -> date | None:
    """Erkennt Tagesangaben: Schluesselwoerter, Wochentage und Datumsformate."""
    today = now.date()

    if not text:
        return today
    if text in {"heute", "today"}:
        return today
    if text in {"morgen", "tomorrow"}:
        return today + timedelta(days=1)
    if text in {"uebermorgen", "übermorgen"}:
        return today + timedelta(days=2)

    weekday = _WEEKDAYS.get(text)
    if weekday is not None:
        return today + timedelta(days=(weekday - today.weekday()) % 7)

    iso = _ISO_DATE.match(text)
    if iso:
        return _build_date(int(iso.group(1)), int(iso.group(2)), int(iso.group(3)))

    german = _DE_DATE.match(text)
    if german:
        year_part = german.group(3)
        if year_part is None:
            year = today.year
        elif len(year_part) == 2:
            year = 2000 + int(year_part)
        else:
            year = int(year_part)
        day = _build_date(year, int(german.group(2)), int(german.group(1)))
        # "24.12." ohne Jahr meint das naechste Vorkommen.
        if year_part is None and day < today:
            day = _build_date(year + 1, int(german.group(2)), int(german.group(1)))
        return day

    return None


def _build_date(year: int, month: int, day: int) -> date:
    try:
        return date(year, month, day)
    except ValueError:
        raise DueDateError(f"{day:02d}.{month:02d}.{year} ist kein gueltiges Datum.") from None
