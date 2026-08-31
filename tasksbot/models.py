"""Datenmodell fuer Aufgaben - bewusst ohne discord-Abhaengigkeit."""

from __future__ import annotations

import sqlite3
from dataclasses import dataclass
from datetime import datetime, timezone
from enum import StrEnum

__all__ = ["Priority", "Status", "Task", "parse_timestamp", "to_timestamp"]


class Status(StrEnum):
    """Lebenszyklus einer Aufgabe."""

    OPEN = "open"
    DOING = "doing"
    DONE = "done"

    @property
    def label(self) -> str:
        return {"open": "Offen", "doing": "In Arbeit", "done": "Erledigt"}[self.value]

    @property
    def emoji(self) -> str:
        return {"open": "\N{LARGE BLUE CIRCLE}", "doing": "\N{LARGE ORANGE CIRCLE}",
                "done": "\N{LARGE GREEN CIRCLE}"}[self.value]


class Priority(StrEnum):
    """Dringlichkeit einer Aufgabe."""

    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"

    @property
    def label(self) -> str:
        return {"low": "Niedrig", "normal": "Normal", "high": "Hoch"}[self.value]

    @property
    def emoji(self) -> str:
        return {"low": "\N{DOWNWARDS BLACK ARROW}", "normal": "\N{BLACK RIGHTWARDS ARROW}",
                "high": "\N{UPWARDS BLACK ARROW}"}[self.value]

    @property
    def sort_key(self) -> int:
        return {"high": 0, "normal": 1, "low": 2}[self.value]


def to_timestamp(moment: datetime | None) -> str | None:
    """Serialisiert einen Zeitpunkt als ISO-8601-String in UTC."""
    if moment is None:
        return None
    if moment.tzinfo is None:
        moment = moment.replace(tzinfo=timezone.utc)
    return moment.astimezone(timezone.utc).isoformat()


def parse_timestamp(raw: str | None) -> datetime | None:
    """Liest einen ISO-8601-String zurueck als aware ``datetime`` in UTC."""
    if not raw:
        return None
    moment = datetime.fromisoformat(raw)
    if moment.tzinfo is None:
        moment = moment.replace(tzinfo=timezone.utc)
    return moment.astimezone(timezone.utc)


@dataclass(slots=True)
class Task:
    """Eine Aufgabe in einem Channel."""

    id: int
    guild_id: int
    channel_id: int
    title: str
    creator_id: int
    status: Status = Status.OPEN
    priority: Priority = Priority.NORMAL
    notes: str | None = None
    assignee_id: int | None = None
    due_at: datetime | None = None
    created_at: datetime | None = None
    completed_at: datetime | None = None
    completed_by: int | None = None
    message_id: int | None = None
    reminded_at: datetime | None = None

    @classmethod
    def from_row(cls, row: sqlite3.Row) -> "Task":
        """Baut eine Aufgabe aus einer Datenbankzeile."""
        return cls(
            id=row["id"],
            guild_id=row["guild_id"],
            channel_id=row["channel_id"],
            title=row["title"],
            creator_id=row["creator_id"],
            status=Status(row["status"]),
            priority=Priority(row["priority"]),
            notes=row["notes"],
            assignee_id=row["assignee_id"],
            due_at=parse_timestamp(row["due_at"]),
            created_at=parse_timestamp(row["created_at"]),
            completed_at=parse_timestamp(row["completed_at"]),
            completed_by=row["completed_by"],
            message_id=row["message_id"],
            reminded_at=parse_timestamp(row["reminded_at"]),
        )

    @property
    def is_done(self) -> bool:
        return self.status is Status.DONE

    def is_overdue(self, *, now: datetime | None = None) -> bool:
        """True, wenn die Aufgabe faellig war und noch nicht erledigt ist."""
        if self.due_at is None or self.is_done:
            return False
        return self.due_at <= (now or datetime.now(timezone.utc))

    def may_edit(self, user_id: int, *, is_moderator: bool = False) -> bool:
        """Ersteller, zugewiesene Person und Moderation duerfen aendern."""
        return is_moderator or user_id in {self.creator_id, self.assignee_id}
