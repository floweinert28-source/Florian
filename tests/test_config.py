"""Tests fuer das Einlesen der Konfiguration."""

from __future__ import annotations

from pathlib import Path
from zoneinfo import ZoneInfo

import pytest

from tasksbot.config import Config, ConfigError

ALL_KEYS = (
    "DISCORD_TOKEN", "GUILD_ID", "DATABASE_PATH",
    "TASK_REMINDERS", "REMINDER_INTERVAL_MINUTES", "TIMEZONE",
)


@pytest.fixture(autouse=True)
def clean_env(monkeypatch):
    for key in ALL_KEYS:
        monkeypatch.delenv(key, raising=False)


def test_defaults(monkeypatch) -> None:
    monkeypatch.setenv("DISCORD_TOKEN", "geheim")

    config = Config.from_env()

    assert config.token == "geheim"
    assert config.guild_id is None
    assert config.database_path == Path("data/tasks.db")
    assert config.reminders_enabled is True
    assert config.reminder_interval_minutes == 5
    assert config.timezone == ZoneInfo("Europe/Berlin")


def test_alle_werte_gesetzt(monkeypatch) -> None:
    monkeypatch.setenv("DISCORD_TOKEN", "geheim")
    monkeypatch.setenv("GUILD_ID", "12345")
    monkeypatch.setenv("DATABASE_PATH", "/var/lib/bot.db")
    monkeypatch.setenv("TASK_REMINDERS", "nein")
    monkeypatch.setenv("REMINDER_INTERVAL_MINUTES", "15")
    monkeypatch.setenv("TIMEZONE", "UTC")

    config = Config.from_env()

    assert config.guild_id == 12345
    assert config.database_path == Path("/var/lib/bot.db")
    assert config.reminders_enabled is False
    assert config.reminder_interval_minutes == 15
    assert config.timezone == ZoneInfo("UTC")


@pytest.mark.parametrize("value", ["", "   "])
def test_fehlender_token(monkeypatch, value) -> None:
    monkeypatch.setenv("DISCORD_TOKEN", value)

    with pytest.raises(ConfigError, match="DISCORD_TOKEN"):
        Config.from_env()


@pytest.mark.parametrize(
    ("key", "value", "match"),
    [
        ("GUILD_ID", "mein-server", "GUILD_ID"),
        ("TASK_REMINDERS", "vielleicht", "TASK_REMINDERS"),
        ("REMINDER_INTERVAL_MINUTES", "keine", "REMINDER_INTERVAL_MINUTES"),
        ("REMINDER_INTERVAL_MINUTES", "0", "mindestens"),
        ("TIMEZONE", "Mars/Olympus", "TIMEZONE"),
    ],
)
def test_ungueltige_werte_melden_das_feld(monkeypatch, key, value, match) -> None:
    monkeypatch.setenv("DISCORD_TOKEN", "geheim")
    monkeypatch.setenv(key, value)

    with pytest.raises(ConfigError, match=match):
        Config.from_env()


@pytest.mark.parametrize(("value", "expected"), [("true", True), ("JA", True), ("0", False), ("off", False)])
def test_boolean_schreibweisen(monkeypatch, value, expected) -> None:
    monkeypatch.setenv("DISCORD_TOKEN", "geheim")
    monkeypatch.setenv("TASK_REMINDERS", value)

    assert Config.from_env().reminders_enabled is expected


def test_leere_optionale_werte_fallen_auf_defaults_zurueck(monkeypatch) -> None:
    monkeypatch.setenv("DISCORD_TOKEN", "geheim")
    for key in ("GUILD_ID", "TASK_REMINDERS", "REMINDER_INTERVAL_MINUTES", "TIMEZONE"):
        monkeypatch.setenv(key, "")

    config = Config.from_env()

    assert config.guild_id is None
    assert config.reminders_enabled is True
