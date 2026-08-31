"""Tests fuer das Aufgaben-Datenmodell."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest

from tasksbot.models import Priority, Status, Task, parse_timestamp, to_timestamp

from .conftest import ALICE, BOB


def task(**kwargs) -> Task:
    defaults = dict(id=1, guild_id=1, channel_id=2, title="Aufgabe", creator_id=ALICE)
    return Task(**{**defaults, **kwargs})


def test_status_und_prioritaet_haben_labels() -> None:
    assert Status.DOING.label == "In Arbeit"
    assert Priority.HIGH.label == "Hoch"
    assert all(status.emoji for status in Status)
    assert all(priority.emoji for priority in Priority)


def test_timestamp_roundtrip_behaelt_utc() -> None:
    moment = datetime(2026, 9, 5, 14, 30, tzinfo=timezone.utc)

    assert parse_timestamp(to_timestamp(moment)) == moment


def test_timestamp_ohne_zeitzone_gilt_als_utc() -> None:
    naiv = datetime(2026, 9, 5, 14, 30)

    assert parse_timestamp(to_timestamp(naiv)) == naiv.replace(tzinfo=timezone.utc)


@pytest.mark.parametrize("value", [None, ""])
def test_leerer_timestamp(value) -> None:
    assert parse_timestamp(value) is None
    assert to_timestamp(None) is None


def test_is_overdue() -> None:
    now = datetime(2026, 8, 31, 12, 0, tzinfo=timezone.utc)

    assert task(due_at=now - timedelta(minutes=1)).is_overdue(now=now) is True
    assert task(due_at=now + timedelta(minutes=1)).is_overdue(now=now) is False
    assert task(due_at=None).is_overdue(now=now) is False


def test_erledigte_aufgaben_sind_nie_ueberfaellig() -> None:
    now = datetime(2026, 8, 31, 12, 0, tzinfo=timezone.utc)
    erledigt = task(due_at=now - timedelta(days=3), status=Status.DONE)

    assert erledigt.is_overdue(now=now) is False


def test_may_edit_erlaubt_ersteller_zustaendige_und_moderation() -> None:
    fremd = 999
    subject = task(creator_id=ALICE, assignee_id=BOB)

    assert subject.may_edit(ALICE) is True
    assert subject.may_edit(BOB) is True
    assert subject.may_edit(fremd) is False
    assert subject.may_edit(fremd, is_moderator=True) is True


def test_may_edit_ohne_zustaendige_person() -> None:
    """``assignee_id is None`` darf nicht versehentlich auf jede Person passen."""
    subject = task(creator_id=ALICE, assignee_id=None)

    assert subject.may_edit(BOB) is False
