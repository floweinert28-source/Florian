"""Gemeinsame Fixtures fuer die Testsuite."""

from __future__ import annotations

from datetime import datetime, timezone
from zoneinfo import ZoneInfo

import pytest

from tasksbot.storage import TaskStore

GUILD = 1000
CHANNEL = 2000
OTHER_CHANNEL = 2001
ALICE = 10
BOB = 11

# Montag, 31.08.2026, 12:00 Uhr in Berlin.
NOW = datetime(2026, 8, 31, 10, 0, tzinfo=timezone.utc)
BERLIN = ZoneInfo("Europe/Berlin")


@pytest.fixture
async def store(tmp_path):
    """Eine frische, leere Datenbank je Test."""
    store = TaskStore(tmp_path / "tasks.db")
    await store.connect()
    try:
        yield store
    finally:
        await store.close()
