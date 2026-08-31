"""SQLite-Persistenz fuer Aufgaben.

Alle oeffentlichen Methoden sind ``async``: die eigentlichen SQLite-Aufrufe
laufen via :func:`asyncio.to_thread` in einem Worker-Thread, damit der
Event-Loop des Bots nie blockiert. Ein :class:`asyncio.Lock` serialisiert die
Zugriffe, sodass die Verbindung immer nur von einem Thread benutzt wird.
"""

from __future__ import annotations

import asyncio
import sqlite3
from collections.abc import Callable
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, TypeVar

from .models import Priority, Status, Task, to_timestamp

__all__ = ["TaskStore"]

T = TypeVar("T")

_SCHEMA_VERSION = 1

_SCHEMA = """
CREATE TABLE IF NOT EXISTS tasks (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id     INTEGER NOT NULL,
    channel_id   INTEGER NOT NULL,
    title        TEXT    NOT NULL,
    notes        TEXT,
    status       TEXT    NOT NULL DEFAULT 'open',
    priority     TEXT    NOT NULL DEFAULT 'normal',
    creator_id   INTEGER NOT NULL,
    assignee_id  INTEGER,
    due_at       TEXT,
    created_at   TEXT    NOT NULL,
    completed_at TEXT,
    completed_by INTEGER,
    message_id   INTEGER,
    reminded_at  TEXT
);

CREATE INDEX IF NOT EXISTS idx_tasks_channel ON tasks (guild_id, channel_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks (guild_id, assignee_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks (status, due_at);
"""

# Felder, die :meth:`TaskStore.update` schreiben darf.
_UPDATABLE = {
    "title", "notes", "status", "priority", "assignee_id",
    "due_at", "completed_at", "completed_by", "message_id", "reminded_at",
}


class TaskStore:
    """Speichert Aufgaben in einer SQLite-Datei."""

    def __init__(self, path: Path | str) -> None:
        self.path = Path(path)
        self._connection: sqlite3.Connection | None = None
        self._lock = asyncio.Lock()

    # ------------------------------------------------------------------
    # Lebenszyklus
    # ------------------------------------------------------------------
    async def connect(self) -> None:
        """Oeffnet die Datenbank und legt das Schema an."""
        if self._connection is not None:
            return
        if self.path.parent and str(self.path.parent) not in ("", "."):
            self.path.parent.mkdir(parents=True, exist_ok=True)
        self._connection = await asyncio.to_thread(self._open)

    def _open(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.path, check_same_thread=False)
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA journal_mode = WAL")
        connection.execute("PRAGMA foreign_keys = ON")
        connection.executescript(_SCHEMA)
        connection.execute(f"PRAGMA user_version = {_SCHEMA_VERSION}")
        connection.commit()
        return connection

    async def close(self) -> None:
        """Schliesst die Datenbankverbindung."""
        connection, self._connection = self._connection, None
        if connection is not None:
            await asyncio.to_thread(connection.close)

    async def _run(self, func: Callable[[sqlite3.Connection], T]) -> T:
        if self._connection is None:
            raise RuntimeError("TaskStore.connect() wurde nicht aufgerufen.")
        connection = self._connection
        async with self._lock:
            return await asyncio.to_thread(func, connection)

    # ------------------------------------------------------------------
    # Schreiben
    # ------------------------------------------------------------------
    async def create(
        self,
        *,
        guild_id: int,
        channel_id: int,
        title: str,
        creator_id: int,
        notes: str | None = None,
        priority: Priority = Priority.NORMAL,
        assignee_id: int | None = None,
        due_at: datetime | None = None,
    ) -> Task:
        """Legt eine neue Aufgabe an und gibt sie zurueck."""
        created_at = datetime.now(timezone.utc)
        status = Status.DOING if assignee_id is not None else Status.OPEN

        def op(connection: sqlite3.Connection) -> Task:
            cursor = connection.execute(
                """
                INSERT INTO tasks (guild_id, channel_id, title, notes, status, priority,
                                   creator_id, assignee_id, due_at, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (guild_id, channel_id, title, notes, str(status), str(priority),
                 creator_id, assignee_id, to_timestamp(due_at), to_timestamp(created_at)),
            )
            connection.commit()
            row = connection.execute(
                "SELECT * FROM tasks WHERE id = ?", (cursor.lastrowid,)
            ).fetchone()
            return Task.from_row(row)

        return await self._run(op)

    async def update(self, task_id: int, **fields: Any) -> Task | None:
        """Aendert einzelne Felder einer Aufgabe.

        ``datetime``-Werte werden automatisch serialisiert, ebenso ``Status``
        und ``Priority``. Gibt die aktualisierte Aufgabe zurueck oder ``None``,
        wenn es die Aufgabe nicht (mehr) gibt.
        """
        unknown = set(fields) - _UPDATABLE
        if unknown:
            raise ValueError(f"Unbekannte Felder: {', '.join(sorted(unknown))}")
        if not fields:
            return await self.get(task_id)

        values = [_encode(value) for value in fields.values()]
        assignments = ", ".join(f"{name} = ?" for name in fields)

        def op(connection: sqlite3.Connection) -> Task | None:
            connection.execute(
                f"UPDATE tasks SET {assignments} WHERE id = ?", (*values, task_id)
            )
            connection.commit()
            row = connection.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
            return Task.from_row(row) if row else None

        return await self._run(op)

    async def set_status(self, task_id: int, status: Status, *, user_id: int) -> Task | None:
        """Setzt den Status und pflegt dabei die Erledigt-Metadaten."""
        if status is Status.DONE:
            return await self.update(
                task_id,
                status=status,
                completed_at=datetime.now(timezone.utc),
                completed_by=user_id,
            )
        return await self.update(task_id, status=status, completed_at=None, completed_by=None)

    async def delete(self, task_id: int) -> bool:
        """Loescht eine Aufgabe. Gibt zurueck, ob es sie gab."""

        def op(connection: sqlite3.Connection) -> bool:
            cursor = connection.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
            connection.commit()
            return cursor.rowcount > 0

        return await self._run(op)

    async def delete_completed(self, *, guild_id: int, channel_id: int) -> int:
        """Raeumt erledigte Aufgaben eines Channels auf. Gibt die Anzahl zurueck."""

        def op(connection: sqlite3.Connection) -> int:
            cursor = connection.execute(
                "DELETE FROM tasks WHERE guild_id = ? AND channel_id = ? AND status = ?",
                (guild_id, channel_id, str(Status.DONE)),
            )
            connection.commit()
            return cursor.rowcount

        return await self._run(op)

    # ------------------------------------------------------------------
    # Lesen
    # ------------------------------------------------------------------
    async def get(self, task_id: int) -> Task | None:
        """Holt eine einzelne Aufgabe."""

        def op(connection: sqlite3.Connection) -> Task | None:
            row = connection.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
            return Task.from_row(row) if row else None

        return await self._run(op)

    async def list_tasks(
        self,
        *,
        guild_id: int,
        channel_id: int | None = None,
        statuses: tuple[Status, ...] | None = None,
        assignee_id: int | None = None,
        search: str | None = None,
        limit: int = 100,
    ) -> list[Task]:
        """Listet Aufgaben, sortiert nach Status, Prioritaet und Faelligkeit.

        Offene Aufgaben stehen vorn, danach erledigte (zuletzt erledigte zuerst).
        Aufgaben mit Faelligkeitsdatum kommen vor solchen ohne.
        """
        where = ["guild_id = ?"]
        params: list[Any] = [guild_id]

        if channel_id is not None:
            where.append("channel_id = ?")
            params.append(channel_id)
        if statuses:
            where.append(f"status IN ({', '.join('?' * len(statuses))})")
            params.extend(str(status) for status in statuses)
        if assignee_id is not None:
            where.append("assignee_id = ?")
            params.append(assignee_id)
        if search:
            where.append("(title LIKE ? OR IFNULL(notes, '') LIKE ?)")
            pattern = f"%{search}%"
            params.extend((pattern, pattern))

        query = f"""
            SELECT * FROM tasks
            WHERE {' AND '.join(where)}
            ORDER BY
                CASE status WHEN 'doing' THEN 0 WHEN 'open' THEN 1 ELSE 2 END,
                CASE priority WHEN 'high' THEN 0 WHEN 'normal' THEN 1 ELSE 2 END,
                due_at IS NULL, due_at,
                id
            LIMIT ?
        """
        params.append(limit)

        def op(connection: sqlite3.Connection) -> list[Task]:
            rows = connection.execute(query, params).fetchall()
            return [Task.from_row(row) for row in rows]

        return await self._run(op)

    async def count_by_status(self, *, guild_id: int, channel_id: int | None = None) -> dict[Status, int]:
        """Zaehlt Aufgaben je Status."""
        where = ["guild_id = ?"]
        params: list[Any] = [guild_id]
        if channel_id is not None:
            where.append("channel_id = ?")
            params.append(channel_id)
        query = f"SELECT status, COUNT(*) AS total FROM tasks WHERE {' AND '.join(where)} GROUP BY status"

        def op(connection: sqlite3.Connection) -> dict[Status, int]:
            rows = connection.execute(query, params).fetchall()
            counts = {status: 0 for status in Status}
            for row in rows:
                counts[Status(row["status"])] = row["total"]
            return counts

        return await self._run(op)

    async def due_before(self, moment: datetime, *, only_unreminded: bool = True) -> list[Task]:
        """Findet offene Aufgaben, die vor ``moment`` faellig waren."""
        query = """
            SELECT * FROM tasks
            WHERE status != 'done' AND due_at IS NOT NULL AND due_at <= ?
        """
        params: list[Any] = [to_timestamp(moment)]
        if only_unreminded:
            query += " AND reminded_at IS NULL"
        query += " ORDER BY due_at"

        def op(connection: sqlite3.Connection) -> list[Task]:
            rows = connection.execute(query, params).fetchall()
            return [Task.from_row(row) for row in rows]

        return await self._run(op)


def _encode(value: Any) -> Any:
    """Bereitet Python-Werte fuer SQLite auf."""
    if isinstance(value, datetime):
        return to_timestamp(value)
    if isinstance(value, (Status, Priority)):
        return str(value)
    return value
