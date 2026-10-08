"""Coach Mode: Gruppen, Beitritt per Link, Kurz-Stats, Journal-Ansicht und Mentor-Notizen.

Lebt im selben Server wie der Mentor-Chat (mentor_server.py bindet den Router ein) und in derselben SQLite-Datei.

Wer ist wer: jede Journalyst-Installation erzeugt sich einen geheimen Schlüssel und schickt ihn als „X-Coach-Key“ mit.
Der Server kennt nur den SHA-256 davon und hängt daran eine Nutzer-ID. Der Schlüssel verlässt das Gerät nie, der
Einladungslink enthält nur ein Gruppen-Token. So sieht der Mentor genau die Schüler seiner Gruppe und ein Schüler nie
einen anderen, ohne dass es dafür Konten mit Passwort braucht. Das Zugangstoken des Servers (MENTOR_APP_TOKEN) gilt
zusätzlich wie beim Chat.

Was der Server vom Schüler hat: Journal-Einträge (Notizen ohne Trade-Notizen) und Tages-Summen in R und Prozent
(Anzahl, Gewinne, Verluste, Summe der R, Summe in Prozent der Kontogröße). Keine einzelnen Trades, keine Beträge,
keine Kontostände: es gibt dafür keine Tabelle und keinen Endpunkt. Verlässt ein Schüler seine letzte Gruppe, werden
seine Einträge, Summen und Bilder gelöscht; die Mentor-Notizen hat er lokal.

Datenbank-Änderungen nur über die Migrationen in CoachStore (schema_version), damit bestehende Daten erhalten bleiben.
"""

from __future__ import annotations

import base64
import hashlib
import secrets
import sqlite3
import threading
import uuid
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Callable
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, Header, HTTPException, Query, Response
from pydantic import BaseModel, Field, field_validator

PERIODS = ("week", "month", "all")
ASSET_MAX_BYTES = 1_500_000
ENTRY_MAX = 2000
NOTE_MAX = 4000


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _iso(at: datetime) -> str:
    return at.isoformat(timespec="seconds")


def _err(status: int, code: str, message: str) -> HTTPException:
    return HTTPException(status_code=status, detail={"error": code, "message": message})


def norm_ts(value: str) -> str:
    """Zeitstempel der Website (z. B. 2026-10-08T12:00:00.000Z) in eine feste UTC-Schreibweise bringen, damit Vergleiche als Text stimmen."""
    try:
        d = datetime.fromisoformat(value.strip())
    except ValueError as exc:
        raise ValueError("Kein gültiger Zeitstempel.") from exc
    if d.tzinfo is None:
        d = d.replace(tzinfo=timezone.utc)
    return _iso(d.astimezone(timezone.utc))


def period_start(period: str, today: date) -> str | None:
    """Erster Tag des Zeitraums als YYYY-MM-DD; None = alles."""
    if period == "week":
        return (today - timedelta(days=today.weekday())).isoformat()
    if period == "month":
        return today.replace(day=1).isoformat()
    return None


def summarize(days: list[dict]) -> dict:
    """Kurz-Stats aus Tages-Summen: nur R und Prozent, nie Geld.

    pf = Summe Gewinn-R / Summe Verlust-R; Ø Gewinn/Verlust in R über die Trades, die ein R haben;
    max_dd_r und max_dd_pct = größter Rückgang der kumulierten Tagesergebnisse (vom Hoch).
    """
    n = wins = losses = be = 0
    win_r = loss_r = 0.0
    win_n_r = loss_n_r = 0
    cum_r = peak_r = dd_r = 0.0
    cum_p = peak_p = dd_p = 0.0
    for d in days:
        n += d["n"]; wins += d["wins"]; losses += d["losses"]; be += d["be"]
        win_r += d["win_r"]; loss_r += d["loss_r"]; win_n_r += d["win_n_r"]; loss_n_r += d["loss_n_r"]
        cum_r += d["pnl_r"]; peak_r = max(peak_r, cum_r); dd_r = max(dd_r, peak_r - cum_r)
        cum_p += d["pnl_pct"]; peak_p = max(peak_p, cum_p); dd_p = max(dd_p, peak_p - cum_p)
    pf: float | None
    if loss_r < 0:
        pf = win_r / -loss_r
    else:
        pf = None if win_r > 0 else 0.0
    return {
        "n": n, "wins": wins, "losses": losses, "be": be,
        "win_rate": (wins / n) if n else None,
        "pf": pf,
        "avg_win_r": (win_r / win_n_r) if win_n_r else None,
        "avg_loss_r": (loss_r / loss_n_r) if loss_n_r else None,
        "sum_r": cum_r if (win_n_r or loss_n_r) else None,
        "sum_pct": cum_p if n else None,
        "max_dd_r": dd_r if (win_n_r or loss_n_r) else None,
        "max_dd_pct": dd_p if n else None,
        "days": len(days),
    }


# ---------------------------------------------------------------- Speicher
class CoachStore:
    """Alle Tabellen des Coach Mode in SQLite; Änderungen am Schema nur über migrate()."""

    MIGRATIONS: list[list[str]] = [
        [  # 1: Grundgerüst
            "CREATE TABLE IF NOT EXISTS coach_users (id TEXT PRIMARY KEY, key_hash TEXT NOT NULL UNIQUE, name TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL)",
            "CREATE TABLE IF NOT EXISTS coach_groups (id TEXT PRIMARY KEY, owner_id TEXT NOT NULL, name TEXT NOT NULL, invite_token TEXT NOT NULL UNIQUE, created_at TEXT NOT NULL, archived_at TEXT)",
            "CREATE INDEX IF NOT EXISTS idx_coach_groups_owner ON coach_groups (owner_id)",
            "CREATE TABLE IF NOT EXISTS coach_members (id TEXT PRIMARY KEY, group_id TEXT NOT NULL, user_id TEXT NOT NULL, name TEXT NOT NULL DEFAULT '', since TEXT, joined_at TEXT NOT NULL, left_at TEXT)",
            "CREATE INDEX IF NOT EXISTS idx_coach_members_group ON coach_members (group_id, user_id)",
            "CREATE INDEX IF NOT EXISTS idx_coach_members_user ON coach_members (user_id)",
            "CREATE TABLE IF NOT EXISTS coach_entries (user_id TEXT NOT NULL, id TEXT NOT NULL, title TEXT NOT NULL DEFAULT '', content TEXT NOT NULL, date_key TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, PRIMARY KEY (user_id, id))",
            "CREATE TABLE IF NOT EXISTS coach_days (user_id TEXT NOT NULL, date TEXT NOT NULL, n INTEGER NOT NULL, wins INTEGER NOT NULL, losses INTEGER NOT NULL, be INTEGER NOT NULL, win_r REAL NOT NULL, loss_r REAL NOT NULL, win_n_r INTEGER NOT NULL, loss_n_r INTEGER NOT NULL, pnl_r REAL NOT NULL, pnl_pct REAL NOT NULL, PRIMARY KEY (user_id, date))",
            "CREATE TABLE IF NOT EXISTS coach_notes (id TEXT PRIMARY KEY, group_id TEXT NOT NULL, mentor_id TEXT NOT NULL, student_id TEXT NOT NULL, entry_id TEXT NOT NULL, text TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT)",
            "CREATE INDEX IF NOT EXISTS idx_coach_notes_student ON coach_notes (student_id, updated_at)",
            "CREATE TABLE IF NOT EXISTS coach_seen (mentor_id TEXT NOT NULL, group_id TEXT NOT NULL, student_id TEXT NOT NULL, last_seen_at TEXT NOT NULL, PRIMARY KEY (mentor_id, group_id, student_id))",
            "CREATE TABLE IF NOT EXISTS coach_assets (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, mime TEXT NOT NULL, data BLOB NOT NULL, created_at TEXT NOT NULL)",
            "CREATE INDEX IF NOT EXISTS idx_coach_assets_user ON coach_assets (user_id)",
        ],
    ]

    def __init__(self, path: Path, tz: ZoneInfo | None = None):
        self.path = path
        self.tz = tz or ZoneInfo("Europe/Berlin")
        self.lock = threading.Lock()
        path.parent.mkdir(parents=True, exist_ok=True)
        self.migrate()

    def _conn(self) -> sqlite3.Connection:
        c = sqlite3.connect(str(self.path))
        c.row_factory = sqlite3.Row
        return c

    def migrate(self) -> int:
        with self.lock, self._conn() as c:
            c.execute("CREATE TABLE IF NOT EXISTS coach_schema (version INTEGER NOT NULL)")
            row = c.execute("SELECT version FROM coach_schema").fetchone()
            version = int(row[0]) if row else 0
            for i, steps in enumerate(self.MIGRATIONS, start=1):
                if i <= version:
                    continue
                for sql in steps:
                    c.execute(sql)
                version = i
            if row:
                c.execute("UPDATE coach_schema SET version = ?", (version,))
            else:
                c.execute("INSERT INTO coach_schema (version) VALUES (?)", (version,))
        return version

    def today(self, at: datetime | None = None) -> date:
        return (at or _now()).astimezone(self.tz).date()

    # ---- Nutzer
    @staticmethod
    def key_hash(key: str) -> str:
        return hashlib.sha256(key.encode("utf-8")).hexdigest()

    def user_for_key(self, key: str, name: str | None = None) -> dict:
        h = self.key_hash(key)
        with self.lock, self._conn() as c:
            row = c.execute("SELECT id, name FROM coach_users WHERE key_hash = ?", (h,)).fetchone()
            if row is None:
                uid = str(uuid.uuid4())
                c.execute("INSERT INTO coach_users (id, key_hash, name, created_at) VALUES (?, ?, ?, ?)", (uid, h, (name or "").strip(), _iso(_now())))
                return {"id": uid, "name": (name or "").strip()}
            if name is not None and name.strip() and name.strip() != row["name"]:
                c.execute("UPDATE coach_users SET name = ? WHERE id = ?", (name.strip(), row["id"]))
                return {"id": row["id"], "name": name.strip()}
            return {"id": row["id"], "name": row["name"]}

    def rename_user(self, uid: str, name: str) -> dict:
        with self.lock, self._conn() as c:
            c.execute("UPDATE coach_users SET name = ? WHERE id = ?", (name.strip(), uid))
        return {"id": uid, "name": name.strip()}

    def user_name(self, uid: str) -> str:
        with self.lock, self._conn() as c:
            row = c.execute("SELECT name FROM coach_users WHERE id = ?", (uid,)).fetchone()
        return row["name"] if row else ""

    # ---- Gruppen (Mentor)
    def create_group(self, owner_id: str, name: str) -> dict:
        gid = str(uuid.uuid4())
        g = {"id": gid, "owner_id": owner_id, "name": name.strip(), "invite_token": secrets.token_urlsafe(18), "created_at": _iso(_now()), "archived_at": None}
        with self.lock, self._conn() as c:
            c.execute("INSERT INTO coach_groups (id, owner_id, name, invite_token, created_at, archived_at) VALUES (?, ?, ?, ?, ?, NULL)", (gid, owner_id, g["name"], g["invite_token"], g["created_at"]))
        g["members"] = 0
        return g

    def group(self, gid: str) -> dict | None:
        with self.lock, self._conn() as c:
            row = c.execute("SELECT * FROM coach_groups WHERE id = ?", (gid,)).fetchone()
        return dict(row) if row else None

    def group_by_token(self, token: str) -> dict | None:
        with self.lock, self._conn() as c:
            row = c.execute("SELECT * FROM coach_groups WHERE invite_token = ? AND archived_at IS NULL", (token,)).fetchone()
        return dict(row) if row else None

    def own_groups(self, owner_id: str) -> list[dict]:
        with self.lock, self._conn() as c:
            rows = c.execute(
                "SELECT g.*, (SELECT COUNT(*) FROM coach_members m WHERE m.group_id = g.id AND m.left_at IS NULL) AS members "
                "FROM coach_groups g WHERE g.owner_id = ? AND g.archived_at IS NULL ORDER BY g.created_at", (owner_id,)
            ).fetchall()
        return [dict(r) for r in rows]

    def rename_group(self, gid: str, name: str) -> None:
        with self.lock, self._conn() as c:
            c.execute("UPDATE coach_groups SET name = ? WHERE id = ?", (name.strip(), gid))

    def rotate_invite(self, gid: str) -> str:
        token = secrets.token_urlsafe(18)
        with self.lock, self._conn() as c:
            c.execute("UPDATE coach_groups SET invite_token = ? WHERE id = ?", (token, gid))
        return token

    def archive_group(self, gid: str) -> list[str]:
        """Gruppe schließen: alle Mitglieder gelten als ausgetreten. Liefert die Nutzer, deren Daten geprüft werden müssen."""
        now = _iso(_now())
        with self.lock, self._conn() as c:
            users = [r["user_id"] for r in c.execute("SELECT user_id FROM coach_members WHERE group_id = ? AND left_at IS NULL", (gid,)).fetchall()]
            c.execute("UPDATE coach_members SET left_at = ? WHERE group_id = ? AND left_at IS NULL", (now, gid))
            c.execute("UPDATE coach_groups SET archived_at = ? WHERE id = ?", (now, gid))
        for uid in users:
            self.purge_if_alone(uid)
        return users

    # ---- Mitgliedschaft (Schüler)
    def membership(self, gid: str, uid: str) -> dict | None:
        with self.lock, self._conn() as c:
            row = c.execute("SELECT * FROM coach_members WHERE group_id = ? AND user_id = ? AND left_at IS NULL", (gid, uid)).fetchone()
        return dict(row) if row else None

    def memberships(self, uid: str) -> list[dict]:
        with self.lock, self._conn() as c:
            rows = c.execute(
                "SELECT m.id AS membership_id, m.group_id, m.name, m.since, m.joined_at, g.name AS group_name, g.owner_id, u.name AS mentor_name "
                "FROM coach_members m JOIN coach_groups g ON g.id = m.group_id LEFT JOIN coach_users u ON u.id = g.owner_id "
                "WHERE m.user_id = ? AND m.left_at IS NULL AND g.archived_at IS NULL ORDER BY m.joined_at", (uid,)
            ).fetchall()
        return [dict(r) for r in rows]

    def join(self, gid: str, uid: str, name: str, since: str | None) -> dict:
        now = _iso(_now())
        with self.lock, self._conn() as c:
            row = c.execute("SELECT id FROM coach_members WHERE group_id = ? AND user_id = ? AND left_at IS NULL", (gid, uid)).fetchone()
            if row:
                c.execute("UPDATE coach_members SET name = ?, since = ? WHERE id = ?", (name.strip(), since, row["id"]))
                mid = row["id"]
            else:
                mid = str(uuid.uuid4())
                c.execute("INSERT INTO coach_members (id, group_id, user_id, name, since, joined_at, left_at) VALUES (?, ?, ?, ?, ?, ?, NULL)", (mid, gid, uid, name.strip(), since, now))
        return {"membership_id": mid, "group_id": gid, "name": name.strip(), "since": since, "joined_at": now}

    def leave(self, gid: str, uid: str) -> bool:
        with self.lock, self._conn() as c:
            cur = c.execute("UPDATE coach_members SET left_at = ? WHERE group_id = ? AND user_id = ? AND left_at IS NULL", (_iso(_now()), gid, uid))
            left = cur.rowcount > 0
        if left:
            self.purge_if_alone(uid)
        return left

    def purge_if_alone(self, uid: str) -> bool:
        """Ohne aktive Mitgliedschaft bleibt nichts vom Schüler auf dem Server (Einträge, Summen, Bilder)."""
        with self.lock, self._conn() as c:
            n = c.execute("SELECT COUNT(*) FROM coach_members m JOIN coach_groups g ON g.id = m.group_id WHERE m.user_id = ? AND m.left_at IS NULL AND g.archived_at IS NULL", (uid,)).fetchone()[0]
            if n:
                return False
            c.execute("DELETE FROM coach_entries WHERE user_id = ?", (uid,))
            c.execute("DELETE FROM coach_days WHERE user_id = ?", (uid,))
            c.execute("DELETE FROM coach_assets WHERE user_id = ?", (uid,))
            return True

    def active_students(self, gid: str) -> list[dict]:
        with self.lock, self._conn() as c:
            rows = c.execute("SELECT user_id, name, since, joined_at FROM coach_members WHERE group_id = ? AND left_at IS NULL ORDER BY name COLLATE NOCASE, joined_at", (gid,)).fetchall()
        return [dict(r) for r in rows]

    # ---- Daten des Schülers
    def replace_snapshot(self, uid: str, entries: list[dict], days: list[dict]) -> dict:
        """Vollständiger Stand des Schülers: was fehlt, wird gelöscht (die Website schickt immer alles, was sie teilt)."""
        with self.lock, self._conn() as c:
            c.execute("DELETE FROM coach_entries WHERE user_id = ?", (uid,))
            c.execute("DELETE FROM coach_days WHERE user_id = ?", (uid,))
            c.executemany(
                "INSERT INTO coach_entries (user_id, id, title, content, date_key, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [(uid, e["id"], e["title"], e["content"], e["date_key"], e["created_at"], e["updated_at"]) for e in entries],
            )
            c.executemany(
                "INSERT INTO coach_days (user_id, date, n, wins, losses, be, win_r, loss_r, win_n_r, loss_n_r, pnl_r, pnl_pct) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [(uid, d["date"], d["n"], d["wins"], d["losses"], d["be"], d["win_r"], d["loss_r"], d["win_n_r"], d["loss_n_r"], d["pnl_r"], d["pnl_pct"]) for d in days],
            )
        return {"entries": len(entries), "days": len(days)}

    def days_of(self, uid: str, start: str | None) -> list[dict]:
        with self.lock, self._conn() as c:
            if start:
                rows = c.execute("SELECT * FROM coach_days WHERE user_id = ? AND date >= ? ORDER BY date", (uid, start)).fetchall()
            else:
                rows = c.execute("SELECT * FROM coach_days WHERE user_id = ? ORDER BY date", (uid,)).fetchall()
        return [dict(r) for r in rows]

    def entries_of(self, uid: str, since: str | None) -> list[dict]:
        with self.lock, self._conn() as c:
            if since:
                rows = c.execute("SELECT id, title, content, date_key, created_at, updated_at FROM coach_entries WHERE user_id = ? AND date_key >= ? ORDER BY date_key DESC, created_at DESC", (uid, since)).fetchall()
            else:
                rows = c.execute("SELECT id, title, content, date_key, created_at, updated_at FROM coach_entries WHERE user_id = ? ORDER BY date_key DESC, created_at DESC", (uid,)).fetchall()
        return [dict(r) for r in rows]

    def entry_exists(self, uid: str, entry_id: str, since: str | None) -> bool:
        with self.lock, self._conn() as c:
            row = c.execute("SELECT date_key FROM coach_entries WHERE user_id = ? AND id = ?", (uid, entry_id)).fetchone()
        return bool(row) and (not since or row["date_key"] >= since)

    def entry_summary(self, uid: str, since: str | None, seen_at: str | None) -> dict:
        with self.lock, self._conn() as c:
            params: list[Any] = [uid]
            where = "user_id = ?"
            if since:
                where += " AND date_key >= ?"; params.append(since)
            last = c.execute(f"SELECT MAX(date_key) AS last_key, COUNT(*) AS n FROM coach_entries WHERE {where}", params).fetchone()
            new = c.execute(f"SELECT COUNT(*) FROM coach_entries WHERE {where} AND updated_at > ?", params + [seen_at or ""]).fetchone()[0]
        return {"last_entry_key": last["last_key"], "entries": int(last["n"]), "new": int(new)}

    # ---- Gelesen-Stand des Mentors
    def seen_at(self, mentor_id: str, gid: str, sid: str) -> str | None:
        with self.lock, self._conn() as c:
            row = c.execute("SELECT last_seen_at FROM coach_seen WHERE mentor_id = ? AND group_id = ? AND student_id = ?", (mentor_id, gid, sid)).fetchone()
        return row["last_seen_at"] if row else None

    def mark_seen(self, mentor_id: str, gid: str, sid: str, at: str) -> None:
        with self.lock, self._conn() as c:
            c.execute(
                "INSERT INTO coach_seen (mentor_id, group_id, student_id, last_seen_at) VALUES (?, ?, ?, ?) "
                "ON CONFLICT(mentor_id, group_id, student_id) DO UPDATE SET last_seen_at = excluded.last_seen_at",
                (mentor_id, gid, sid, at),
            )

    # ---- Mentor-Notizen
    def add_note(self, gid: str, mentor_id: str, sid: str, entry_id: str, text: str) -> dict:
        now = _iso(_now())
        note = {"id": str(uuid.uuid4()), "group_id": gid, "mentor_id": mentor_id, "student_id": sid, "entry_id": entry_id, "text": text.strip(), "created_at": now, "updated_at": now, "deleted_at": None}
        with self.lock, self._conn() as c:
            c.execute(
                "INSERT INTO coach_notes (id, group_id, mentor_id, student_id, entry_id, text, created_at, updated_at, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)",
                (note["id"], gid, mentor_id, sid, entry_id, note["text"], now, now),
            )
        return note

    def note(self, nid: str) -> dict | None:
        with self.lock, self._conn() as c:
            row = c.execute("SELECT * FROM coach_notes WHERE id = ?", (nid,)).fetchone()
        return dict(row) if row else None

    def update_note(self, nid: str, text: str) -> None:
        with self.lock, self._conn() as c:
            c.execute("UPDATE coach_notes SET text = ?, updated_at = ? WHERE id = ?", (text.strip(), _iso(_now()), nid))

    def delete_note(self, nid: str) -> None:
        with self.lock, self._conn() as c:
            c.execute("UPDATE coach_notes SET deleted_at = ?, updated_at = ? WHERE id = ?", (_iso(_now()), _iso(_now()), nid))

    def notes_for_student(self, sid: str, gid: str | None = None, include_deleted: bool = False) -> list[dict]:
        """Notizen an einen Schüler, mit Gruppen- und Mentor-Namen; nur aus Gruppen, in denen er noch ist."""
        with self.lock, self._conn() as c:
            sql = (
                "SELECT n.*, g.name AS group_name, u.name AS mentor_name FROM coach_notes n "
                "JOIN coach_groups g ON g.id = n.group_id LEFT JOIN coach_users u ON u.id = n.mentor_id "
                "JOIN coach_members m ON m.group_id = n.group_id AND m.user_id = n.student_id AND m.left_at IS NULL "
                "WHERE n.student_id = ? AND g.archived_at IS NULL"
            )
            params: list[Any] = [sid]
            if gid:
                sql += " AND n.group_id = ?"; params.append(gid)
            if not include_deleted:
                sql += " AND n.deleted_at IS NULL"
            rows = c.execute(sql + " ORDER BY n.created_at", params).fetchall()
        return [dict(r) for r in rows]

    # ---- Bilder
    def put_asset(self, uid: str, mime: str, data: bytes) -> str:
        aid = secrets.token_hex(16)
        with self.lock, self._conn() as c:
            c.execute("INSERT INTO coach_assets (id, user_id, mime, data, created_at) VALUES (?, ?, ?, ?, ?)", (aid, uid, mime, data, _iso(_now())))
        return aid

    def asset(self, aid: str) -> tuple[str, bytes] | None:
        with self.lock, self._conn() as c:
            row = c.execute("SELECT mime, data FROM coach_assets WHERE id = ?", (aid,)).fetchone()
        return (row["mime"], bytes(row["data"])) if row else None

    def asset_count(self, uid: str) -> int:
        with self.lock, self._conn() as c:
            return int(c.execute("SELECT COUNT(*) FROM coach_assets WHERE user_id = ?", (uid,)).fetchone()[0])


# ---------------------------------------------------------------- Eingaben
class MeIn(BaseModel):
    name: str = Field("", max_length=80)


class GroupIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)

    @field_validator("name")
    @classmethod
    def _trim(cls, v: str) -> str:
        v = " ".join(v.split())
        if not v:
            raise ValueError("Der Name ist leer.")
        return v


class JoinIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    since: str | None = Field(None, description="YYYY-MM-DD: nur Einträge und Tage ab diesem Datum; leer = alles")

    @field_validator("name")
    @classmethod
    def _trim(cls, v: str) -> str:
        v = " ".join(v.split())
        if not v:
            raise ValueError("Der Name ist leer.")
        return v

    @field_validator("since")
    @classmethod
    def _date(cls, v: str | None) -> str | None:
        if v is None or v == "":
            return None
        return date.fromisoformat(v).isoformat()


class EntryIn(BaseModel):
    id: str = Field(..., min_length=1, max_length=80)
    title: str = Field("", max_length=300)
    content: str = Field("", max_length=400_000)  # Quill-Delta als JSON-Text (Bilder nur als Verweis auf hochgeladene Dateien)
    date_key: str = Field(..., min_length=10, max_length=10)
    created_at: str = Field(..., max_length=40)
    updated_at: str = Field(..., max_length=40)

    @field_validator("date_key")
    @classmethod
    def _date(cls, v: str) -> str:
        return date.fromisoformat(v).isoformat()

    @field_validator("created_at", "updated_at")
    @classmethod
    def _ts(cls, v: str) -> str:
        return norm_ts(v)


class DayIn(BaseModel):
    date: str = Field(..., min_length=10, max_length=10)
    n: int = Field(0, ge=0)
    wins: int = Field(0, ge=0)
    losses: int = Field(0, ge=0)
    be: int = Field(0, ge=0)
    win_r: float = 0.0
    loss_r: float = 0.0
    win_n_r: int = Field(0, ge=0)
    loss_n_r: int = Field(0, ge=0)
    pnl_r: float = 0.0
    pnl_pct: float = 0.0

    @field_validator("date")
    @classmethod
    def _date(cls, v: str) -> str:
        return date.fromisoformat(v).isoformat()


class SyncIn(BaseModel):
    entries: list[EntryIn] = Field(default_factory=list, max_length=ENTRY_MAX)
    days: list[DayIn] = Field(default_factory=list, max_length=5000)


class NoteIn(BaseModel):
    entry_id: str = Field(..., min_length=1, max_length=80)
    text: str = Field(..., min_length=1, max_length=NOTE_MAX)

    @field_validator("text")
    @classmethod
    def _not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Die Notiz ist leer.")
        return v.strip()


class NoteEdit(BaseModel):
    text: str = Field(..., min_length=1, max_length=NOTE_MAX)

    @field_validator("text")
    @classmethod
    def _not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Die Notiz ist leer.")
        return v.strip()


class AssetIn(BaseModel):
    mime: str = Field(..., pattern=r"^image/(png|jpeg|webp|gif)$")
    data: str = Field(..., min_length=1, max_length=2_100_000)  # Base64


# ---------------------------------------------------------------- Router
def make_router(store: CoachStore, app_auth: Callable[..., None]) -> APIRouter:
    router = APIRouter(prefix="/api/coach", dependencies=[Depends(app_auth)])

    def me(x_coach_key: str | None = Header(default=None, alias="X-Coach-Key")) -> dict:
        if not x_coach_key or not (16 <= len(x_coach_key) <= 128):
            raise _err(401, "key", "Der Coach-Schlüssel fehlt. Öffne in Journalyst den Bereich Coach, er wird dort angelegt.")
        return store.user_for_key(x_coach_key)

    def own_group(gid: str, user: dict) -> dict:
        g = store.group(gid)
        if not g or g["archived_at"] or g["owner_id"] != user["id"]:
            raise _err(404, "group", "Diese Gruppe gibt es nicht oder sie gehört dir nicht.")
        return g

    def member_group(gid: str, user: dict) -> dict:
        g = store.group(gid)
        m = store.membership(gid, user["id"]) if g and not g["archived_at"] else None
        if not m:
            raise _err(404, "group", "Du bist in dieser Gruppe nicht Mitglied.")
        return m

    def student_in(gid: str, sid: str) -> dict:
        m = store.membership(gid, sid)
        if not m:
            raise _err(404, "student", "Dieser Schüler ist nicht in der Gruppe.")
        return m

    def note_out(n: dict) -> dict:
        return {k: n.get(k) for k in ("id", "group_id", "group_name", "mentor_id", "mentor_name", "student_id", "entry_id", "text", "created_at", "updated_at", "deleted_at")}

    # ---- Wer bin ich, wo bin ich
    @router.post("/me")
    def post_me(body: MeIn, user: dict = Depends(me)) -> dict:
        if body.name.strip():
            user = store.rename_user(user["id"], body.name)
        return {"user": user, "groups": store.memberships(user["id"]), "own": store.own_groups(user["id"])}

    # ---- Mentor: Gruppen
    @router.post("/groups")
    def create_group(body: GroupIn, user: dict = Depends(me)) -> dict:
        if len(store.own_groups(user["id"])) >= 50:
            raise _err(409, "limit", "Mehr als 50 Gruppen sind nicht vorgesehen.")
        return {"group": store.create_group(user["id"], body.name)}

    @router.get("/groups")
    def list_groups(user: dict = Depends(me)) -> dict:
        return {"groups": store.own_groups(user["id"])}

    @router.patch("/groups/{gid}")
    def rename_group(gid: str, body: GroupIn, user: dict = Depends(me)) -> dict:
        own_group(gid, user)
        store.rename_group(gid, body.name)
        return {"ok": True, "group": store.group(gid)}

    @router.post("/groups/{gid}/invite/rotate")
    def rotate_invite(gid: str, user: dict = Depends(me)) -> dict:
        own_group(gid, user)
        return {"invite_token": store.rotate_invite(gid)}

    @router.delete("/groups/{gid}")
    def archive_group(gid: str, user: dict = Depends(me)) -> dict:
        own_group(gid, user)
        return {"ok": True, "removed_members": len(store.archive_group(gid))}

    # ---- Mentor: Dashboard und Journal
    @router.get("/groups/{gid}/students")
    def students(gid: str, period: str = Query("month"), user: dict = Depends(me)) -> dict:
        g = own_group(gid, user)
        if period not in PERIODS:
            raise _err(422, "period", "Zeitraum ist week, month oder all.")
        start = period_start(period, store.today())
        rows = []
        for m in store.active_students(gid):
            since = m["since"]
            lower = max([x for x in (start, since) if x], default=None)
            seen = store.seen_at(user["id"], gid, m["user_id"])
            summary = store.entry_summary(m["user_id"], since, seen)
            rows.append({
                "user_id": m["user_id"], "name": m["name"], "joined_at": m["joined_at"], "since": since,
                "stats": summarize(store.days_of(m["user_id"], lower)),
                "last_entry_key": summary["last_entry_key"], "entries": summary["entries"], "new": summary["new"],
            })
        return {"group": {"id": g["id"], "name": g["name"], "invite_token": g["invite_token"]}, "period": period, "period_start": start, "students": rows}

    @router.get("/groups/{gid}/students/{sid}/journal")
    def journal(gid: str, sid: str, user: dict = Depends(me)) -> dict:
        own_group(gid, user)
        m = student_in(gid, sid)
        seen = store.seen_at(user["id"], gid, sid) or ""
        entries = store.entries_of(sid, m["since"])
        for e in entries:
            e["is_new"] = e["updated_at"] > seen
        notes = [note_out(n) for n in store.notes_for_student(sid, gid)]
        # gelesen bis zum neuesten gezeigten Stand, auch wenn die Uhr der Website etwas vorgeht
        store.mark_seen(user["id"], gid, sid, max([_iso(_now())] + [e["updated_at"] for e in entries]))
        return {"student": {"id": sid, "name": m["name"], "since": m["since"], "joined_at": m["joined_at"]}, "entries": entries, "notes": notes}

    @router.post("/groups/{gid}/students/{sid}/notes")
    def add_note(gid: str, sid: str, body: NoteIn, user: dict = Depends(me)) -> dict:
        own_group(gid, user)
        m = student_in(gid, sid)
        if not store.entry_exists(sid, body.entry_id, m["since"]):
            raise _err(404, "entry", "Diesen Journal-Eintrag gibt es nicht (mehr).")
        n = store.add_note(gid, user["id"], sid, body.entry_id, body.text)
        n["mentor_name"] = user["name"]; n["group_name"] = store.group(gid)["name"]
        return {"note": note_out(n)}

    @router.patch("/notes/{nid}")
    def edit_note(nid: str, body: NoteEdit, user: dict = Depends(me)) -> dict:
        n = store.note(nid)
        if not n or n["deleted_at"] or n["mentor_id"] != user["id"]:
            raise _err(404, "note", "Diese Notiz gibt es nicht oder sie ist nicht von dir.")
        store.update_note(nid, body.text)
        return {"ok": True, "note": note_out(store.note(nid))}

    @router.delete("/notes/{nid}")
    def delete_note(nid: str, user: dict = Depends(me)) -> dict:
        n = store.note(nid)
        if not n or n["deleted_at"] or n["mentor_id"] != user["id"]:
            raise _err(404, "note", "Diese Notiz gibt es nicht oder sie ist nicht von dir.")
        store.delete_note(nid)
        return {"ok": True}

    # ---- Schüler: Einladung, Beitritt, Austritt
    @router.get("/invite/{token}")
    def invite(token: str, user: dict = Depends(me)) -> dict:
        g = store.group_by_token(token)
        if not g:
            raise _err(404, "invite", "Dieser Einladungslink ist ungültig oder die Gruppe wurde geschlossen.")
        return {"group": {"id": g["id"], "name": g["name"]}, "mentor": store.user_name(g["owner_id"]), "own": g["owner_id"] == user["id"], "member": store.membership(g["id"], user["id"]) is not None}

    @router.post("/invite/{token}/join")
    def join(token: str, body: JoinIn, user: dict = Depends(me)) -> dict:
        g = store.group_by_token(token)
        if not g:
            raise _err(404, "invite", "Dieser Einladungslink ist ungültig oder die Gruppe wurde geschlossen.")
        if g["owner_id"] == user["id"]:
            raise _err(409, "own", "Du bist der Mentor dieser Gruppe.")
        m = store.join(g["id"], user["id"], body.name, body.since)
        store.rename_user(user["id"], body.name)
        return {"membership": dict(m, group_name=g["name"], mentor_name=store.user_name(g["owner_id"])), "groups": store.memberships(user["id"])}

    @router.post("/groups/{gid}/leave")
    def leave(gid: str, user: dict = Depends(me)) -> dict:
        if not store.leave(gid, user["id"]):
            raise _err(404, "group", "Du bist in dieser Gruppe nicht Mitglied.")
        return {"ok": True, "groups": store.memberships(user["id"])}

    # ---- Schüler: Stand hochladen, Notizen holen
    @router.put("/sync")
    def sync(body: SyncIn, user: dict = Depends(me)) -> dict:
        groups = store.memberships(user["id"])
        if not groups:
            raise _err(403, "member", "Du bist in keiner Gruppe. Es wird nichts hochgeladen.")
        earliest = min([g["since"] for g in groups if g["since"]], default=None) if all(g["since"] for g in groups) else None
        entries = [e.model_dump() for e in body.entries if not earliest or e.date_key >= earliest]
        days = [d.model_dump() for d in body.days if not earliest or d.date >= earliest]
        counts = store.replace_snapshot(user["id"], entries, days)
        return {"ok": True, "stored": counts, "groups": groups, "notes": [note_out(n) for n in store.notes_for_student(user["id"], include_deleted=True)]}

    @router.get("/notes")
    def my_notes(user: dict = Depends(me)) -> dict:
        return {"groups": store.memberships(user["id"]), "notes": [note_out(n) for n in store.notes_for_student(user["id"], include_deleted=True)]}

    @router.post("/assets")
    def upload_asset(body: AssetIn, user: dict = Depends(me)) -> dict:
        if not store.memberships(user["id"]):
            raise _err(403, "member", "Du bist in keiner Gruppe.")
        if store.asset_count(user["id"]) >= 2000:
            raise _err(409, "limit", "Zu viele Bilder.")
        try:
            raw = base64.b64decode(body.data, validate=True)
        except Exception as exc:  # noqa: BLE001
            raise _err(422, "asset", "Das Bild ist nicht lesbar.") from exc
        if len(raw) > ASSET_MAX_BYTES:
            raise _err(413, "asset", "Das Bild ist zu groß (höchstens 1,5 MB).")
        aid = store.put_asset(user["id"], body.mime, raw)
        return {"id": aid, "url": f"/api/coach/assets/{aid}"}

    return router


def make_asset_route(store: CoachStore) -> APIRouter:
    """Bilder ohne Kopfzeilen abrufbar (<img src>): die Adresse ist ein 128-Bit-Zufallswert und steht nur in geteilten Einträgen."""
    router = APIRouter(prefix="/api/coach")

    @router.get("/assets/{aid}")
    def get_asset(aid: str) -> Response:
        a = store.asset(aid)
        if not a:
            raise HTTPException(status_code=404, detail={"error": "asset", "message": "Bild nicht gefunden."})
        return Response(content=a[1], media_type=a[0], headers={"Cache-Control": "private, max-age=86400"})

    return router
