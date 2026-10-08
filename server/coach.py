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

Phase 2 und 3: Antworten auf Mentor-Notizen (kleiner Thread), E-Mail-Benachrichtigung (nur mit Einwilligung und nur, wenn
der Server einen SMTP-Zugang hat), Co-Coaches (eigener Einladungslink, gleiche Sicht wie der Mentor, verwalten darf nur der
Besitzer), Aufgaben vom Mentor an den Schüler und eine Gruppen-Statistik (Durchschnitt, nur für Mentoren sichtbar).

Datenbank-Änderungen nur über die Migrationen in CoachStore (coach_schema), damit bestehende Daten erhalten bleiben.
Jede Migration läuft in einer Transaktion: entweder ganz oder gar nicht.
"""

from __future__ import annotations

import base64
import hashlib
import logging
import re
import secrets
import sqlite3
import threading
import uuid
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Callable
from zoneinfo import ZoneInfo

from fastapi import APIRouter, BackgroundTasks, Depends, Header, HTTPException, Query, Request, Response
from pydantic import BaseModel, Field, field_validator

log = logging.getLogger("coach")

PERIODS = ("week", "month", "all")
REPLY_MAX = 2000
TASK_MAX = 300
EMAIL_RE = re.compile(r"^[^@\s]{1,64}@[^@\s]{1,190}\.[^@\s]{2,}$")
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
        [  # 2: Antworten, E-Mail-Benachrichtigung, Co-Coaches, Aufgaben
            "ALTER TABLE coach_users ADD COLUMN email TEXT NOT NULL DEFAULT ''",
            "ALTER TABLE coach_users ADD COLUMN notify_email INTEGER NOT NULL DEFAULT 0",
            "ALTER TABLE coach_groups ADD COLUMN coach_token TEXT",
            "CREATE TABLE IF NOT EXISTS coach_coaches (group_id TEXT NOT NULL, user_id TEXT NOT NULL, name TEXT NOT NULL DEFAULT '', joined_at TEXT NOT NULL, left_at TEXT)",
            "CREATE INDEX IF NOT EXISTS idx_coach_coaches_group ON coach_coaches (group_id, user_id)",
            "CREATE INDEX IF NOT EXISTS idx_coach_coaches_user ON coach_coaches (user_id)",
            "CREATE TABLE IF NOT EXISTS coach_replies (id TEXT PRIMARY KEY, note_id TEXT NOT NULL, author_id TEXT NOT NULL, role TEXT NOT NULL, text TEXT NOT NULL, created_at TEXT NOT NULL, deleted_at TEXT)",
            "CREATE INDEX IF NOT EXISTS idx_coach_replies_note ON coach_replies (note_id, created_at)",
            "CREATE TABLE IF NOT EXISTS coach_tasks (id TEXT PRIMARY KEY, group_id TEXT NOT NULL, mentor_id TEXT NOT NULL, student_id TEXT NOT NULL, text TEXT NOT NULL, due TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, done_at TEXT, deleted_at TEXT)",
            "CREATE INDEX IF NOT EXISTS idx_coach_tasks_student ON coach_tasks (student_id, group_id)",
            "CREATE TABLE IF NOT EXISTS coach_mail_usage (user_id TEXT NOT NULL, day TEXT NOT NULL, n INTEGER NOT NULL, PRIMARY KEY (user_id, day))",
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
        """Fehlende Migrationen nacheinander, jede in einer eigenen Transaktion (Tabellen und Spalten nur ergänzen, nie löschen)."""
        with self.lock:
            c = sqlite3.connect(str(self.path), isolation_level=None)
            try:
                c.execute("CREATE TABLE IF NOT EXISTS coach_schema (version INTEGER NOT NULL)")
                row = c.execute("SELECT version FROM coach_schema").fetchone()
                if row is None:
                    c.execute("INSERT INTO coach_schema (version) VALUES (0)")
                version = int(row[0]) if row else 0
                for i, steps in enumerate(self.MIGRATIONS, start=1):
                    if i <= version:
                        continue
                    c.execute("BEGIN")
                    try:
                        for sql in steps:
                            c.execute(sql)
                        c.execute("UPDATE coach_schema SET version = ?", (i,))
                        c.execute("COMMIT")
                    except Exception:
                        c.execute("ROLLBACK")
                        raise
                    version = i
            finally:
                c.close()
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

    def user(self, uid: str) -> dict | None:
        with self.lock, self._conn() as c:
            row = c.execute("SELECT id, name, email, notify_email FROM coach_users WHERE id = ?", (uid,)).fetchone()
        return {"id": row["id"], "name": row["name"], "email": row["email"], "notify_email": bool(row["notify_email"])} if row else None

    def set_notify(self, uid: str, email: str, notify: bool) -> dict:
        with self.lock, self._conn() as c:
            c.execute("UPDATE coach_users SET email = ?, notify_email = ? WHERE id = ?", (email.strip(), 1 if notify and email.strip() else 0, uid))
        return self.user(uid) or {}

    def mail_reserve(self, uid: str, day: str, limit: int) -> bool:
        """Zählt eine Mail im Tageszähler; False, wenn das Limit erreicht ist (Schutz vor Mail-Fluten)."""
        with self.lock, self._conn() as c:
            row = c.execute("SELECT n FROM coach_mail_usage WHERE user_id = ? AND day = ?", (uid, day)).fetchone()
            if (int(row[0]) if row else 0) >= limit:
                return False
            c.execute("INSERT INTO coach_mail_usage (user_id, day, n) VALUES (?, ?, 1) ON CONFLICT(user_id, day) DO UPDATE SET n = n + 1", (uid, day))
            return True

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

    def group_by_coach_token(self, token: str) -> dict | None:
        with self.lock, self._conn() as c:
            row = c.execute("SELECT * FROM coach_groups WHERE coach_token = ? AND archived_at IS NULL", (token,)).fetchone()
        return dict(row) if row else None

    def coach_token(self, gid: str) -> str:
        """Einladungslink für Co-Coaches; ältere Gruppen bekommen ihn beim ersten Abruf."""
        with self.lock, self._conn() as c:
            row = c.execute("SELECT coach_token FROM coach_groups WHERE id = ?", (gid,)).fetchone()
            if row and row["coach_token"]:
                return row["coach_token"]
            token = secrets.token_urlsafe(18)
            c.execute("UPDATE coach_groups SET coach_token = ? WHERE id = ?", (token, gid))
            return token

    def rotate_coach_token(self, gid: str) -> str:
        token = secrets.token_urlsafe(18)
        with self.lock, self._conn() as c:
            c.execute("UPDATE coach_groups SET coach_token = ? WHERE id = ?", (token, gid))
        return token

    def is_coach(self, gid: str, uid: str) -> bool:
        with self.lock, self._conn() as c:
            return c.execute("SELECT 1 FROM coach_coaches WHERE group_id = ? AND user_id = ? AND left_at IS NULL", (gid, uid)).fetchone() is not None

    def coaches(self, gid: str) -> list[dict]:
        with self.lock, self._conn() as c:
            rows = c.execute("SELECT user_id, name, joined_at FROM coach_coaches WHERE group_id = ? AND left_at IS NULL ORDER BY joined_at", (gid,)).fetchall()
        return [dict(r) for r in rows]

    def mentor_names(self, gid: str) -> list[str]:
        """Alle, die die Schüler dieser Gruppe sehen: zuerst der Besitzer, dann die Co-Coaches."""
        g = self.group(gid)
        names = [self.user_name(g["owner_id"]) or "Mentor"] if g else []
        return names + [x["name"] for x in self.coaches(gid)]

    def join_as_coach(self, gid: str, uid: str, name: str) -> dict:
        now = _iso(_now())
        with self.lock, self._conn() as c:
            row = c.execute("SELECT rowid FROM coach_coaches WHERE group_id = ? AND user_id = ? AND left_at IS NULL", (gid, uid)).fetchone()
            if row:
                c.execute("UPDATE coach_coaches SET name = ? WHERE rowid = ?", (name.strip(), row[0]))
            else:
                c.execute("INSERT INTO coach_coaches (group_id, user_id, name, joined_at, left_at) VALUES (?, ?, ?, ?, NULL)", (gid, uid, name.strip(), now))
        return {"group_id": gid, "name": name.strip(), "joined_at": now}

    def leave_coach(self, gid: str, uid: str) -> bool:
        with self.lock, self._conn() as c:
            cur = c.execute("UPDATE coach_coaches SET left_at = ? WHERE group_id = ? AND user_id = ? AND left_at IS NULL", (_iso(_now()), gid, uid))
            return cur.rowcount > 0

    def coached_groups(self, uid: str) -> list[dict]:
        with self.lock, self._conn() as c:
            rows = c.execute(
                "SELECT g.id, g.name, g.owner_id, u.name AS owner_name, (SELECT COUNT(*) FROM coach_members m WHERE m.group_id = g.id AND m.left_at IS NULL) AS members "
                "FROM coach_coaches k JOIN coach_groups g ON g.id = k.group_id LEFT JOIN coach_users u ON u.id = g.owner_id "
                "WHERE k.user_id = ? AND k.left_at IS NULL AND g.archived_at IS NULL ORDER BY k.joined_at", (uid,)
            ).fetchall()
        return [dict(r, role="coach") for r in rows]

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
            c.execute("UPDATE coach_coaches SET left_at = ? WHERE group_id = ? AND left_at IS NULL", (now, gid))
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
        out = [dict(r) for r in rows]
        for m in out:
            m["mentors"] = self.mentor_names(m["group_id"])  # der Schüler sieht immer, wer ihn sieht
        return out

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
            # E-Mail-Adresse nur behalten, solange der Nutzer noch als Mentor oder Co-Coach aktiv ist
            busy = c.execute(
                "SELECT (SELECT COUNT(*) FROM coach_groups WHERE owner_id = ? AND archived_at IS NULL) + "
                "(SELECT COUNT(*) FROM coach_coaches k JOIN coach_groups g ON g.id = k.group_id WHERE k.user_id = ? AND k.left_at IS NULL AND g.archived_at IS NULL)", (uid, uid)
            ).fetchone()[0]
            if not busy:
                c.execute("UPDATE coach_users SET email = '', notify_email = 0 WHERE id = ?", (uid,))
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

    def entries_count(self, uid: str, lower: str | None) -> int:
        with self.lock, self._conn() as c:
            if lower:
                return int(c.execute("SELECT COUNT(*) FROM coach_entries WHERE user_id = ? AND date_key >= ?", (uid, lower)).fetchone()[0])
            return int(c.execute("SELECT COUNT(*) FROM coach_entries WHERE user_id = ?", (uid,)).fetchone()[0])

    def new_student_replies(self, gid: str, sid: str, seen_at: str | None) -> int:
        with self.lock, self._conn() as c:
            return int(c.execute(
                "SELECT COUNT(*) FROM coach_replies r JOIN coach_notes n ON n.id = r.note_id "
                "WHERE n.group_id = ? AND n.student_id = ? AND n.deleted_at IS NULL AND r.role = 'student' AND r.deleted_at IS NULL AND r.created_at > ?",
                (gid, sid, seen_at or ""),
            ).fetchone()[0])

    def notes_since(self, gid: str, start: str | None) -> int:
        with self.lock, self._conn() as c:
            return int(c.execute("SELECT COUNT(*) FROM coach_notes WHERE group_id = ? AND deleted_at IS NULL AND created_at >= ?", (gid, start or "")).fetchone()[0])

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
        notes = [dict(r) for r in rows]
        replies = self.replies_for([n["id"] for n in notes], include_deleted)
        for n in notes:
            n["replies"] = replies.get(n["id"], [])
        return notes

    # ---- Antworten (kleiner Thread unter einer Mentor-Notiz)
    def add_reply(self, note_id: str, author_id: str, role: str, text: str) -> dict:
        r = {"id": str(uuid.uuid4()), "note_id": note_id, "author_id": author_id, "role": role, "text": text.strip(), "created_at": _iso(_now()), "deleted_at": None}
        with self.lock, self._conn() as c:
            c.execute("INSERT INTO coach_replies (id, note_id, author_id, role, text, created_at, deleted_at) VALUES (?, ?, ?, ?, ?, ?, NULL)", (r["id"], note_id, author_id, role, r["text"], r["created_at"]))
        r["author_name"] = self.user_name(author_id)
        return r

    def reply(self, rid: str) -> dict | None:
        with self.lock, self._conn() as c:
            row = c.execute("SELECT * FROM coach_replies WHERE id = ?", (rid,)).fetchone()
        return dict(row) if row else None

    def delete_reply(self, rid: str) -> None:
        with self.lock, self._conn() as c:
            c.execute("UPDATE coach_replies SET deleted_at = ? WHERE id = ?", (_iso(_now()), rid))

    def replies_for(self, note_ids: list[str], include_deleted: bool = False) -> dict[str, list[dict]]:
        if not note_ids:
            return {}
        out: dict[str, list[dict]] = {}
        with self.lock, self._conn() as c:
            for i in range(0, len(note_ids), 500):
                chunk = note_ids[i:i + 500]
                q = ",".join("?" * len(chunk))
                sql = f"SELECT r.*, u.name AS author_name FROM coach_replies r LEFT JOIN coach_users u ON u.id = r.author_id WHERE r.note_id IN ({q})"
                if not include_deleted:
                    sql += " AND r.deleted_at IS NULL"
                for row in c.execute(sql + " ORDER BY r.created_at", chunk).fetchall():
                    out.setdefault(row["note_id"], []).append(dict(row))
        return out

    # ---- Aufgaben vom Mentor an den Schüler
    def add_task(self, gid: str, mentor_id: str, sid: str, text: str, due: str | None) -> dict:
        now = _iso(_now())
        t = {"id": str(uuid.uuid4()), "group_id": gid, "mentor_id": mentor_id, "student_id": sid, "text": text.strip(), "due": due, "created_at": now, "updated_at": now, "done_at": None, "deleted_at": None}
        with self.lock, self._conn() as c:
            c.execute(
                "INSERT INTO coach_tasks (id, group_id, mentor_id, student_id, text, due, created_at, updated_at, done_at, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL)",
                (t["id"], gid, mentor_id, sid, t["text"], due, now, now),
            )
        return t

    def task(self, tid: str) -> dict | None:
        with self.lock, self._conn() as c:
            row = c.execute("SELECT * FROM coach_tasks WHERE id = ?", (tid,)).fetchone()
        return dict(row) if row else None

    def update_task(self, tid: str, text: str, due: str | None) -> None:
        with self.lock, self._conn() as c:
            c.execute("UPDATE coach_tasks SET text = ?, due = ?, updated_at = ? WHERE id = ?", (text.strip(), due, _iso(_now()), tid))

    def set_task_done(self, tid: str, done: bool) -> None:
        now = _iso(_now())
        with self.lock, self._conn() as c:
            c.execute("UPDATE coach_tasks SET done_at = ?, updated_at = ? WHERE id = ?", (now if done else None, now, tid))

    def delete_task(self, tid: str) -> None:
        now = _iso(_now())
        with self.lock, self._conn() as c:
            c.execute("UPDATE coach_tasks SET deleted_at = ?, updated_at = ? WHERE id = ?", (now, now, tid))

    def tasks_for_student(self, sid: str, gid: str | None = None, include_deleted: bool = False) -> list[dict]:
        """Aufgaben an einen Schüler aus Gruppen, in denen er noch ist; mit Gruppen- und Mentor-Namen."""
        with self.lock, self._conn() as c:
            sql = (
                "SELECT t.*, g.name AS group_name, u.name AS mentor_name FROM coach_tasks t "
                "JOIN coach_groups g ON g.id = t.group_id LEFT JOIN coach_users u ON u.id = t.mentor_id "
                "JOIN coach_members m ON m.group_id = t.group_id AND m.user_id = t.student_id AND m.left_at IS NULL "
                "WHERE t.student_id = ? AND g.archived_at IS NULL"
            )
            params: list[Any] = [sid]
            if gid:
                sql += " AND t.group_id = ?"; params.append(gid)
            if not include_deleted:
                sql += " AND t.deleted_at IS NULL"
            rows = c.execute(sql + " ORDER BY t.done_at IS NOT NULL, COALESCE(t.due, '9999'), t.created_at", params).fetchall()
        return [dict(r) for r in rows]

    def task_counts(self, gid: str, sid: str) -> dict:
        with self.lock, self._conn() as c:
            row = c.execute(
                "SELECT COUNT(*) AS n, SUM(CASE WHEN done_at IS NULL THEN 1 ELSE 0 END) AS open FROM coach_tasks WHERE group_id = ? AND student_id = ? AND deleted_at IS NULL",
                (gid, sid),
            ).fetchone()
        return {"tasks": int(row["n"] or 0), "open_tasks": int(row["open"] or 0)}

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


class NotifyIn(BaseModel):
    email: str = Field("", max_length=254)
    notify_email: bool = False

    @field_validator("email")
    @classmethod
    def _email(cls, v: str) -> str:
        v = v.strip()
        if v and not EMAIL_RE.match(v):
            raise ValueError("Das sieht nicht wie eine E-Mail-Adresse aus.")
        return v


class CoachJoinIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)

    @field_validator("name")
    @classmethod
    def _trim(cls, v: str) -> str:
        v = " ".join(v.split())
        if not v:
            raise ValueError("Der Name ist leer.")
        return v


class ReplyIn(BaseModel):
    text: str = Field(..., min_length=1, max_length=REPLY_MAX)

    @field_validator("text")
    @classmethod
    def _not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Die Antwort ist leer.")
        return v.strip()


class TaskIn(BaseModel):
    text: str = Field(..., min_length=1, max_length=TASK_MAX)
    due: str | None = None
    student_id: str | None = Field(None, max_length=80)
    all: bool = False  # an alle Schüler der Gruppe (je Schüler eine eigene Aufgabe)

    @field_validator("text")
    @classmethod
    def _not_blank(cls, v: str) -> str:
        v = " ".join(v.split())
        if not v:
            raise ValueError("Die Aufgabe ist leer.")
        return v

    @field_validator("due")
    @classmethod
    def _date(cls, v: str | None) -> str | None:
        if v is None or v == "":
            return None
        return date.fromisoformat(v).isoformat()


class TaskEdit(BaseModel):
    text: str = Field(..., min_length=1, max_length=TASK_MAX)
    due: str | None = None

    @field_validator("text")
    @classmethod
    def _not_blank(cls, v: str) -> str:
        v = " ".join(v.split())
        if not v:
            raise ValueError("Die Aufgabe ist leer.")
        return v

    @field_validator("due")
    @classmethod
    def _date(cls, v: str | None) -> str | None:
        if v is None or v == "":
            return None
        return date.fromisoformat(v).isoformat()


class DoneIn(BaseModel):
    done: bool = True


class AssetIn(BaseModel):
    mime: str = Field(..., pattern=r"^image/(png|jpeg|webp|gif)$")
    data: str = Field(..., min_length=1, max_length=2_100_000)  # Base64


# ---------------------------------------------------------------- Benachrichtigung per E-Mail
Mailer = Callable[[str, str, str], None]  # (an, Betreff, Text)


def mail_text(kind: str, **kw: str) -> tuple[str, str]:
    """Betreff und Text der Benachrichtigung, schlicht und ohne Daten außer dem, was der Empfänger ohnehin sehen darf."""
    link = f"\n\nIn Journalyst öffnen: {kw['app_url']}" if kw.get("app_url") else ""
    if kind == "note":
        return (f"Neue Notiz von {kw['author']} – {kw['group']}", f"{kw['author']} hat dir in „{kw['group']}“ eine Notiz geschrieben:\n\n{kw['text']}{link}\n\nDu findest sie im Notebook unter dem Eintrag.")
    if kind == "reply":
        return (f"Neue Antwort von {kw['author']} – {kw['group']}", f"{kw['author']} hat in „{kw['group']}“ geantwortet:\n\n{kw['text']}{link}")
    return (f"Neue Aufgabe von {kw['author']} – {kw['group']}", f"{kw['author']} hat dir in „{kw['group']}“ eine Aufgabe gegeben:\n\n{kw['text']}" + (f"\nBis: {kw['due']}" if kw.get("due") else "") + link)


# ---------------------------------------------------------------- Router
def make_router(store: CoachStore, app_auth: Callable[..., None], mail_limit: int = 20, app_url: str = "") -> APIRouter:
    router = APIRouter(prefix="/api/coach", dependencies=[Depends(app_auth)])

    def me(x_coach_key: str | None = Header(default=None, alias="X-Coach-Key")) -> dict:
        if not x_coach_key or not (16 <= len(x_coach_key) <= 128):
            raise _err(401, "key", "Der Coach-Schlüssel fehlt. Öffne in Journalyst den Bereich Coach, er wird dort angelegt.")
        return store.user_for_key(x_coach_key)

    def own_group(gid: str, user: dict) -> dict:
        """Nur der Besitzer (Mentor, der die Gruppe angelegt hat): umbenennen, Links, Co-Coaches, schließen."""
        g = store.group(gid)
        if not g or g["archived_at"] or g["owner_id"] != user["id"]:
            raise _err(404, "group", "Diese Gruppe gibt es nicht oder sie gehört dir nicht.")
        return g

    def coach_group(gid: str, user: dict) -> dict:
        """Besitzer oder aktiver Co-Coach: Schüler, Journal, Notizen, Aufgaben. Liefert die Gruppe mit role."""
        g = store.group(gid)
        if g and not g["archived_at"]:
            if g["owner_id"] == user["id"]:
                return dict(g, role="owner")
            if store.is_coach(gid, user["id"]):
                return dict(g, role="coach")
        raise _err(404, "group", "Diese Gruppe gibt es nicht oder du bist dort nicht Mentor.")

    def student_in(gid: str, sid: str) -> dict:
        m = store.membership(gid, sid)
        if not m:
            raise _err(404, "student", "Dieser Schüler ist nicht in der Gruppe.")
        return m

    def note_out(n: dict) -> dict:
        out = {k: n.get(k) for k in ("id", "group_id", "group_name", "mentor_id", "mentor_name", "student_id", "entry_id", "text", "created_at", "updated_at", "deleted_at")}
        out["replies"] = [reply_out(r) for r in n.get("replies", [])]
        return out

    def reply_out(r: dict) -> dict:
        return {k: r.get(k) for k in ("id", "note_id", "author_id", "author_name", "role", "text", "created_at", "deleted_at")}

    def task_out(t: dict) -> dict:
        return {k: t.get(k) for k in ("id", "group_id", "group_name", "mentor_id", "mentor_name", "student_id", "text", "due", "created_at", "updated_at", "done_at", "deleted_at")}

    def me_out(user: dict) -> dict:
        u = store.user(user["id"]) or user
        return {
            "user": {"id": u["id"], "name": u["name"], "email": u.get("email", ""), "notify_email": u.get("notify_email", False)},
            "groups": store.memberships(user["id"]),
            "own": store.own_groups(user["id"]),
            "coached": store.coached_groups(user["id"]),
        }

    def notify(request: Request, background: BackgroundTasks, to_uid: str, kind: str, **kw: str) -> None:
        """Mail nur mit Einwilligung, nur mit eingerichtetem Versand, höchstens mail_limit pro Tag; Fehler werden geloggt, nie gemeldet."""
        mailer: Mailer | None = getattr(request.app.state, "coach_mailer", None)
        u = store.user(to_uid)
        if not mailer or not u or not u["notify_email"] or not u["email"]:
            return
        if not store.mail_reserve(to_uid, store.today().isoformat(), mail_limit):
            return
        subject, body = mail_text(kind, app_url=app_url, **kw)

        def send() -> None:
            try:
                mailer(u["email"], subject, body)
            except Exception:  # noqa: BLE001 - eine fehlgeschlagene Mail darf nichts anderes stören
                log.exception("Coach-Mail an Nutzer %s fehlgeschlagen", to_uid)

        background.add_task(send)

    # ---- Wer bin ich, wo bin ich
    @router.post("/me")
    def post_me(body: MeIn, user: dict = Depends(me)) -> dict:
        if body.name.strip():
            user = store.rename_user(user["id"], body.name)
        return me_out(user)

    @router.put("/notify")
    def put_notify(body: NotifyIn, request: Request, user: dict = Depends(me)) -> dict:
        if body.notify_email and not body.email:
            raise _err(422, "email", "Für E-Mail-Benachrichtigungen fehlt die Adresse.")
        u = store.set_notify(user["id"], body.email, body.notify_email)
        return {"ok": True, "email": u["email"], "notify_email": u["notify_email"], "mail": bool(getattr(request.app.state, "coach_mailer", None))}

    # ---- Mentor: Gruppen
    @router.post("/groups")
    def create_group(body: GroupIn, user: dict = Depends(me)) -> dict:
        if len(store.own_groups(user["id"])) >= 50:
            raise _err(409, "limit", "Mehr als 50 Gruppen sind nicht vorgesehen.")
        return {"group": store.create_group(user["id"], body.name)}

    @router.get("/groups")
    def list_groups(user: dict = Depends(me)) -> dict:
        return {"groups": store.own_groups(user["id"]), "coached": store.coached_groups(user["id"])}

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

    # ---- Co-Coaches
    @router.get("/groups/{gid}/coaches")
    def list_coaches(gid: str, user: dict = Depends(me)) -> dict:
        g = coach_group(gid, user)
        out = {"owner": {"id": g["owner_id"], "name": store.user_name(g["owner_id"])}, "coaches": store.coaches(gid), "role": g["role"]}
        if g["role"] == "owner":
            out["coach_token"] = store.coach_token(gid)
        return out

    @router.post("/groups/{gid}/coach-invite/rotate")
    def rotate_coach_invite(gid: str, user: dict = Depends(me)) -> dict:
        own_group(gid, user)
        return {"coach_token": store.rotate_coach_token(gid)}

    @router.delete("/groups/{gid}/coaches/{uid}")
    def remove_coach(gid: str, uid: str, user: dict = Depends(me)) -> dict:
        own_group(gid, user)
        if not store.leave_coach(gid, uid):
            raise _err(404, "coach", "Diesen Co-Coach gibt es in der Gruppe nicht.")
        return {"ok": True, "coaches": store.coaches(gid)}

    @router.post("/groups/{gid}/coaches/leave")
    def leave_as_coach(gid: str, user: dict = Depends(me)) -> dict:
        if not store.leave_coach(gid, user["id"]):
            raise _err(404, "coach", "Du bist in dieser Gruppe nicht Co-Coach.")
        return {"ok": True, "coached": store.coached_groups(user["id"])}

    @router.get("/coach-invite/{token}")
    def coach_invite(token: str, user: dict = Depends(me)) -> dict:
        g = store.group_by_coach_token(token)
        if not g:
            raise _err(404, "invite", "Dieser Co-Coach-Link ist ungültig oder die Gruppe wurde geschlossen.")
        return {"group": {"id": g["id"], "name": g["name"]}, "owner": store.user_name(g["owner_id"]), "own": g["owner_id"] == user["id"],
                "coach": store.is_coach(g["id"], user["id"]), "member": store.membership(g["id"], user["id"]) is not None, "students": len(store.active_students(g["id"]))}

    @router.post("/coach-invite/{token}/join")
    def join_coach(token: str, body: CoachJoinIn, user: dict = Depends(me)) -> dict:
        g = store.group_by_coach_token(token)
        if not g:
            raise _err(404, "invite", "Dieser Co-Coach-Link ist ungültig oder die Gruppe wurde geschlossen.")
        if g["owner_id"] == user["id"]:
            raise _err(409, "own", "Du bist der Mentor dieser Gruppe.")
        if store.membership(g["id"], user["id"]):
            raise _err(409, "member", "Du bist in dieser Gruppe Schüler. Als Co-Coach würdest du die anderen Schüler sehen.")
        store.join_as_coach(g["id"], user["id"], body.name)
        store.rename_user(user["id"], body.name)
        return {"ok": True, "group": {"id": g["id"], "name": g["name"]}, "coached": store.coached_groups(user["id"])}

    # ---- Mentor: Dashboard und Journal
    @router.get("/groups/{gid}/students")
    def students(gid: str, period: str = Query("month"), user: dict = Depends(me)) -> dict:
        g = coach_group(gid, user)
        if period not in PERIODS:
            raise _err(422, "period", "Zeitraum ist week, month oder all.")
        start = period_start(period, store.today())
        rows = []
        for m in store.active_students(gid):
            since = m["since"]
            lower = max([x for x in (start, since) if x], default=None)
            seen = store.seen_at(user["id"], gid, m["user_id"])
            summary = store.entry_summary(m["user_id"], since, seen)
            rows.append(dict({
                "user_id": m["user_id"], "name": m["name"], "joined_at": m["joined_at"], "since": since,
                "stats": summarize(store.days_of(m["user_id"], lower)),
                "last_entry_key": summary["last_entry_key"], "entries": summary["entries"], "new": summary["new"],
                "entries_in_period": store.entries_count(m["user_id"], lower),
                "new_replies": store.new_student_replies(gid, m["user_id"], seen),
            }, **store.task_counts(gid, m["user_id"])))
        # Gruppen-Statistik: Durchschnitt über die Schüler mit Trades im Zeitraum, nur für Mentoren; keine Rangfolge
        traded = [r["stats"] for r in rows if r["stats"]["n"]]

        def avg(key: str) -> float | None:
            vals = [x[key] for x in traded if x.get(key) is not None]
            return sum(vals) / len(vals) if vals else None

        group_stats = {
            "students": len(rows), "active": len(traded), "trades": sum(x["n"] for x in traded),
            "avg_win_rate": avg("win_rate"), "avg_pf": avg("pf"), "avg_win_r": avg("avg_win_r"), "avg_loss_r": avg("avg_loss_r"), "avg_max_dd_pct": avg("max_dd_pct"),
            "entries": sum(r["entries_in_period"] for r in rows), "notes": store.notes_since(gid, start), "open_tasks": sum(r["open_tasks"] for r in rows),
        }
        group_out = {"id": g["id"], "name": g["name"], "role": g["role"], "owner": store.user_name(g["owner_id"]), "coaches": [c["name"] for c in store.coaches(gid)]}
        if g["role"] == "owner":
            group_out["invite_token"] = g["invite_token"]
        return {"group": group_out, "period": period, "period_start": start, "students": rows, "group_stats": group_stats}

    @router.get("/groups/{gid}/students/{sid}/journal")
    def journal(gid: str, sid: str, user: dict = Depends(me)) -> dict:
        coach_group(gid, user)
        m = student_in(gid, sid)
        seen = store.seen_at(user["id"], gid, sid) or ""
        entries = store.entries_of(sid, m["since"])
        for e in entries:
            e["is_new"] = e["updated_at"] > seen
        notes = [note_out(n) for n in store.notes_for_student(sid, gid)]
        for n in notes:
            for r in n["replies"]:
                r["is_new"] = r["role"] == "student" and r["created_at"] > seen
        tasks = [task_out(t) for t in store.tasks_for_student(sid, gid)]
        # gelesen bis zum neuesten gezeigten Stand, auch wenn die Uhr der Website etwas vorgeht
        store.mark_seen(user["id"], gid, sid, max([_iso(_now())] + [e["updated_at"] for e in entries]))
        return {"student": {"id": sid, "name": m["name"], "since": m["since"], "joined_at": m["joined_at"]}, "entries": entries, "notes": notes, "tasks": tasks}

    @router.post("/groups/{gid}/students/{sid}/notes")
    def add_note(gid: str, sid: str, body: NoteIn, request: Request, background: BackgroundTasks, user: dict = Depends(me)) -> dict:
        g = coach_group(gid, user)
        m = student_in(gid, sid)
        if not store.entry_exists(sid, body.entry_id, m["since"]):
            raise _err(404, "entry", "Diesen Journal-Eintrag gibt es nicht (mehr).")
        n = store.add_note(gid, user["id"], sid, body.entry_id, body.text)
        n["mentor_name"] = user["name"]; n["group_name"] = g["name"]
        notify(request, background, sid, "note", author=user["name"] or "Dein Mentor", group=g["name"], text=body.text)
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

    # ---- Antworten auf Notizen: der Schüler der Notiz und die Mentoren der Gruppe
    @router.post("/notes/{nid}/replies")
    def add_reply(nid: str, body: ReplyIn, request: Request, background: BackgroundTasks, user: dict = Depends(me)) -> dict:
        n = store.note(nid)
        g = store.group(n["group_id"]) if n else None
        if not n or n["deleted_at"] or not g or g["archived_at"]:
            raise _err(404, "note", "Diese Notiz gibt es nicht (mehr).")
        if n["student_id"] == user["id"] and store.membership(g["id"], user["id"]):
            role = "student"
        elif g["owner_id"] == user["id"] or store.is_coach(g["id"], user["id"]):
            if not store.membership(g["id"], n["student_id"]):
                raise _err(404, "student", "Dieser Schüler ist nicht mehr in der Gruppe.")
            role = "mentor"
        else:
            raise _err(404, "note", "Diese Notiz gibt es nicht (mehr).")
        if len(store.replies_for([nid]).get(nid, [])) >= 200:
            raise _err(409, "limit", "Dieser Verlauf ist voll.")
        r = store.add_reply(nid, user["id"], role, body.text)
        author = user["name"] or ("Dein Schüler" if role == "student" else "Dein Mentor")
        to = n["mentor_id"] if role == "student" else n["student_id"]
        notify(request, background, to, "reply", author=author, group=g["name"], text=body.text)
        return {"reply": reply_out(r)}

    @router.delete("/replies/{rid}")
    def delete_reply(rid: str, user: dict = Depends(me)) -> dict:
        r = store.reply(rid)
        if not r or r["deleted_at"] or r["author_id"] != user["id"]:
            raise _err(404, "reply", "Diese Antwort gibt es nicht oder sie ist nicht von dir.")
        store.delete_reply(rid)
        return {"ok": True}

    # ---- Aufgaben
    @router.post("/groups/{gid}/tasks")
    def add_task(gid: str, body: TaskIn, request: Request, background: BackgroundTasks, user: dict = Depends(me)) -> dict:
        g = coach_group(gid, user)
        if body.all:
            targets = [m["user_id"] for m in store.active_students(gid)]
            if not targets:
                raise _err(409, "students", "In der Gruppe ist noch kein Schüler.")
        else:
            if not body.student_id:
                raise _err(422, "student", "Für wen ist die Aufgabe?")
            student_in(gid, body.student_id)
            targets = [body.student_id]
        tasks = []
        for sid in targets:
            if len(store.tasks_for_student(sid, gid)) >= 200:
                continue
            t = store.add_task(gid, user["id"], sid, body.text, body.due)
            t["group_name"] = g["name"]; t["mentor_name"] = user["name"]
            tasks.append(task_out(t))
            notify(request, background, sid, "task", author=user["name"] or "Dein Mentor", group=g["name"], text=body.text, due=body.due or "")
        return {"tasks": tasks}

    @router.patch("/tasks/{tid}")
    def edit_task(tid: str, body: TaskEdit, user: dict = Depends(me)) -> dict:
        t = store.task(tid)
        if not t or t["deleted_at"] or t["mentor_id"] != user["id"]:
            raise _err(404, "task", "Diese Aufgabe gibt es nicht oder sie ist nicht von dir.")
        store.update_task(tid, body.text, body.due)
        return {"ok": True, "task": task_out(store.task(tid))}

    @router.delete("/tasks/{tid}")
    def delete_task(tid: str, user: dict = Depends(me)) -> dict:
        t = store.task(tid)
        if not t or t["deleted_at"] or t["mentor_id"] != user["id"]:
            raise _err(404, "task", "Diese Aufgabe gibt es nicht oder sie ist nicht von dir.")
        store.delete_task(tid)
        return {"ok": True}

    @router.post("/tasks/{tid}/done")
    def task_done(tid: str, body: DoneIn, user: dict = Depends(me)) -> dict:
        t = store.task(tid)
        if not t or t["deleted_at"] or t["student_id"] != user["id"] or not store.membership(t["group_id"], user["id"]):
            raise _err(404, "task", "Diese Aufgabe gibt es nicht.")
        store.set_task_done(tid, body.done)
        return {"ok": True, "task": task_out(store.task(tid))}

    # ---- Schüler: Einladung, Beitritt, Austritt
    @router.get("/invite/{token}")
    def invite(token: str, user: dict = Depends(me)) -> dict:
        g = store.group_by_token(token)
        if not g:
            raise _err(404, "invite", "Dieser Einladungslink ist ungültig oder die Gruppe wurde geschlossen.")
        return {"group": {"id": g["id"], "name": g["name"]}, "mentor": store.user_name(g["owner_id"]), "mentors": store.mentor_names(g["id"]),
                "own": g["owner_id"] == user["id"] or store.is_coach(g["id"], user["id"]), "member": store.membership(g["id"], user["id"]) is not None}

    @router.post("/invite/{token}/join")
    def join(token: str, body: JoinIn, user: dict = Depends(me)) -> dict:
        g = store.group_by_token(token)
        if not g:
            raise _err(404, "invite", "Dieser Einladungslink ist ungültig oder die Gruppe wurde geschlossen.")
        if g["owner_id"] == user["id"] or store.is_coach(g["id"], user["id"]):
            raise _err(409, "own", "Du bist Mentor dieser Gruppe.")
        m = store.join(g["id"], user["id"], body.name, body.since)
        store.rename_user(user["id"], body.name)
        return {"membership": dict(m, group_name=g["name"], mentor_name=store.user_name(g["owner_id"]), mentors=store.mentor_names(g["id"])), "groups": store.memberships(user["id"])}

    @router.post("/groups/{gid}/leave")
    def leave(gid: str, user: dict = Depends(me)) -> dict:
        if not store.leave(gid, user["id"]):
            raise _err(404, "group", "Du bist in dieser Gruppe nicht Mitglied.")
        return {"ok": True, "groups": store.memberships(user["id"])}

    # ---- Schüler: Stand hochladen, Notizen und Aufgaben holen
    def inbox(uid: str) -> dict:
        return {"notes": [note_out(n) for n in store.notes_for_student(uid, include_deleted=True)], "tasks": [task_out(t) for t in store.tasks_for_student(uid, include_deleted=True)]}

    @router.put("/sync")
    def sync(body: SyncIn, user: dict = Depends(me)) -> dict:
        groups = store.memberships(user["id"])
        if not groups:
            raise _err(403, "member", "Du bist in keiner Gruppe. Es wird nichts hochgeladen.")
        earliest = min([g["since"] for g in groups if g["since"]], default=None) if all(g["since"] for g in groups) else None
        entries = [e.model_dump() for e in body.entries if not earliest or e.date_key >= earliest]
        days = [d.model_dump() for d in body.days if not earliest or d.date >= earliest]
        counts = store.replace_snapshot(user["id"], entries, days)
        return dict({"ok": True, "stored": counts, "groups": groups}, **inbox(user["id"]))

    @router.get("/notes")
    def my_notes(user: dict = Depends(me)) -> dict:
        return dict({"groups": store.memberships(user["id"])}, **inbox(user["id"]))

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


def smtp_mailer_from_env(env: dict[str, str]) -> Mailer | None:
    """SMTP-Versand aus Umgebungsvariablen (nur auf dem Server). Ohne COACH_SMTP_HOST gibt es keine Mails."""
    host = env.get("COACH_SMTP_HOST", "").strip()
    if not host:
        return None
    import smtplib
    from email.message import EmailMessage

    port = int(env.get("COACH_SMTP_PORT", "587") or 587)
    user = env.get("COACH_SMTP_USER", "")
    password = env.get("COACH_SMTP_PASS", "")
    sender = env.get("COACH_SMTP_FROM", "") or user
    use_ssl = env.get("COACH_SMTP_SSL", "") in ("1", "true", "yes") or port == 465
    starttls = env.get("COACH_SMTP_STARTTLS", "1") not in ("0", "false", "no")  # nur für ein lokales Relay ohne TLS abschalten

    def send(to: str, subject: str, body: str) -> None:
        msg = EmailMessage()
        msg["From"] = sender; msg["To"] = to; msg["Subject"] = subject
        msg.set_content(body)
        if use_ssl:
            with smtplib.SMTP_SSL(host, port, timeout=20) as s:
                if user:
                    s.login(user, password)
                s.send_message(msg)
        else:
            with smtplib.SMTP(host, port, timeout=20) as s:
                if starttls:
                    s.starttls()
                if user:
                    s.login(user, password)
                s.send_message(msg)

    return send


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
