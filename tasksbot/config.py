"""Konfiguration aus Umgebungsvariablen (bzw. aus einer .env-Datei)."""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

_TRUE_VALUES = {"1", "true", "yes", "on", "ja"}
_FALSE_VALUES = {"0", "false", "no", "off", "nein"}


class ConfigError(RuntimeError):
    """Die Konfiguration ist unvollstaendig oder ungueltig."""


def _get_bool(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None or not raw.strip():
        return default
    value = raw.strip().lower()
    if value in _TRUE_VALUES:
        return True
    if value in _FALSE_VALUES:
        return False
    raise ConfigError(f"{name} muss true oder false sein, nicht {raw!r}.")


def _get_int(name: str, default: int, *, minimum: int = 1) -> int:
    raw = os.getenv(name)
    if raw is None or not raw.strip():
        return default
    try:
        value = int(raw)
    except ValueError:
        raise ConfigError(f"{name} muss eine ganze Zahl sein, nicht {raw!r}.") from None
    if value < minimum:
        raise ConfigError(f"{name} muss mindestens {minimum} sein, nicht {value}.")
    return value


@dataclass(frozen=True, slots=True)
class Config:
    """Alle Einstellungen des Bots an einem Ort."""

    token: str
    database_path: Path
    guild_id: int | None = None
    reminders_enabled: bool = True
    reminder_interval_minutes: int = 5
    timezone: ZoneInfo = ZoneInfo("Europe/Berlin")

    @classmethod
    def from_env(cls) -> "Config":
        """Liest die Konfiguration aus der Umgebung und validiert sie."""
        token = (os.getenv("DISCORD_TOKEN") or "").strip()
        if not token:
            raise ConfigError(
                "DISCORD_TOKEN fehlt. Lege eine .env-Datei nach dem Vorbild von "
                ".env.example an und trage den Bot-Token ein."
            )

        guild_raw = (os.getenv("GUILD_ID") or "").strip()
        guild_id: int | None = None
        if guild_raw:
            try:
                guild_id = int(guild_raw)
            except ValueError:
                raise ConfigError(
                    f"GUILD_ID muss eine Zahl sein (Server-ID), nicht {guild_raw!r}."
                ) from None

        tz_name = (os.getenv("TIMEZONE") or "Europe/Berlin").strip()
        try:
            timezone = ZoneInfo(tz_name)
        except (ZoneInfoNotFoundError, ValueError):
            raise ConfigError(f"TIMEZONE {tz_name!r} ist keine gueltige Zeitzone.") from None

        database_path = Path((os.getenv("DATABASE_PATH") or "data/tasks.db").strip())

        return cls(
            token=token,
            database_path=database_path,
            guild_id=guild_id,
            reminders_enabled=_get_bool("TASK_REMINDERS", True),
            reminder_interval_minutes=_get_int("REMINDER_INTERVAL_MINUTES", 5),
            timezone=timezone,
        )
