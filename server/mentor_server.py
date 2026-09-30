"""Journalyst Mentor-Server.

Ruft das Sprachmodell ausschließlich serverseitig auf (der API-Schlüssel bleibt hier),
baut den System-Prompt aus docs/mentor-systemprompt.md, speichert den Chatverlauf pro
Nutzer in SQLite und begrenzt die Nachrichten pro Nutzer und Tag.

Start:  uvicorn server.mentor_server:app --host 0.0.0.0 --port 8787
Umgebung: siehe server/README.md
"""

from __future__ import annotations

import logging
import os
import re
import sqlite3
import threading
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Callable
from zoneinfo import ZoneInfo

from fastapi import Depends, FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

log = logging.getLogger("mentor")

ROOT = Path(__file__).resolve().parent
PROMPT_FILE = Path(os.environ.get("MENTOR_PROMPT_FILE", ROOT.parent / "docs" / "mentor-systemprompt.md"))
DB_PATH = Path(os.environ.get("MENTOR_DB", ROOT / "data" / "mentor.sqlite"))
MODEL = os.environ.get("MENTOR_MODEL", "claude-sonnet-5")
DAILY_LIMIT = int(os.environ.get("MENTOR_DAILY_LIMIT", "30"))
HISTORY_WINDOW = int(os.environ.get("MENTOR_HISTORY_WINDOW", "20"))
MAX_TOKENS = int(os.environ.get("MENTOR_MAX_TOKENS", "700"))
APP_TOKEN = os.environ.get("MENTOR_APP_TOKEN", "")
TZ = ZoneInfo(os.environ.get("MENTOR_TZ", "Europe/Berlin"))
ORIGINS = [o.strip() for o in os.environ.get("MENTOR_ALLOWED_ORIGINS", "*").split(",") if o.strip()]
APP_NAME_DEFAULT = "Journalyst"
PLACEHOLDER = re.compile(r"\{\{(APP_NAME|NUTZERNAME|GLAUBENSMODUS|JOURNAL_KONTEXT)\}\}")


# ---------------------------------------------------------------- Prompt
def load_prompt_template(path: Path = PROMPT_FILE) -> str:
    """Liest die Prompt-Datei und verwirft alles vor der ersten Trennlinie ---."""
    text = path.read_text(encoding="utf-8")
    m = re.search(r"^---[ \t]*$", text, flags=re.M)
    if m:
        text = text[m.end():]
    return text.strip() + "\n"


def build_system_prompt(template: str, *, app_name: str, user_name: str, glaubensmodus: bool, journal: str) -> str:
    """Ersetzt die Platzhalter in einem Durchgang, damit Nutzertext keine weiteren Platzhalter einschleusen kann."""
    values = {
        "APP_NAME": (app_name or APP_NAME_DEFAULT).strip(),
        "NUTZERNAME": (user_name or "").strip() or "unbekannt",
        "GLAUBENSMODUS": "an" if glaubensmodus else "aus",
        "JOURNAL_KONTEXT": (journal or "").strip() or "keine Daten vorhanden",
    }
    return PLACEHOLDER.sub(lambda m: values[m.group(1)], template)


# ---------------------------------------------------------------- Speicher
class ChatStore:
    """Chatverlauf pro Nutzer in SQLite; klein, ohne weitere Abhängigkeiten."""

    def __init__(self, path: Path):
        self.path = path
        self.lock = threading.Lock()
        path.parent.mkdir(parents=True, exist_ok=True)
        with self._conn() as c:
            c.execute(
                "CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL, "
                "role TEXT NOT NULL, content TEXT NOT NULL, created_at TEXT NOT NULL, day TEXT NOT NULL)"
            )
            c.execute("CREATE INDEX IF NOT EXISTS idx_messages_user_day ON messages (user_id, day)")
            c.execute("CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages (user_id, id)")

    def _conn(self) -> sqlite3.Connection:
        return sqlite3.connect(str(self.path))

    def add(self, user: str, role: str, content: str, now: datetime) -> dict:
        row = {"role": role, "content": content, "at": now.isoformat()}
        with self.lock, self._conn() as c:
            c.execute(
                "INSERT INTO messages (user_id, role, content, created_at, day) VALUES (?, ?, ?, ?, ?)",
                (user, role, content, row["at"], now.astimezone(TZ).date().isoformat()),
            )
        return row

    def history(self, user: str, limit: int = 200) -> list[dict]:
        with self.lock, self._conn() as c:
            rows = c.execute(
                "SELECT role, content, created_at FROM messages WHERE user_id = ? ORDER BY id DESC LIMIT ?", (user, limit)
            ).fetchall()
        return [{"role": r, "content": t, "at": a} for r, t, a in reversed(rows)]

    def count_user_messages(self, user: str, day: str) -> int:
        with self.lock, self._conn() as c:
            (n,) = c.execute(
                "SELECT COUNT(*) FROM messages WHERE user_id = ? AND day = ? AND role = 'user'", (user, day)
            ).fetchone()
        return int(n)

    def clear(self, user: str) -> int:
        with self.lock, self._conn() as c:
            cur = c.execute("DELETE FROM messages WHERE user_id = ?", (user,))
        return cur.rowcount


# ---------------------------------------------------------------- Modell
def make_anthropic_ask() -> Callable[[str, list[dict]], str]:
    """Erzeugt die Modellanfrage. Wird erst beim ersten Aufruf gebaut, damit Tests ohne Schlüssel laufen."""
    client = None

    def ask(system: str, messages: list[dict]) -> str:
        nonlocal client
        if client is None:
            import anthropic  # erst hier importieren: der Server startet auch ohne Schlüssel, meldet ihn aber beim Chat

            client = anthropic.Anthropic()
        resp = client.messages.create(model=MODEL, max_tokens=MAX_TOKENS, system=system, messages=messages)
        return "".join(getattr(part, "text", "") for part in resp.content).strip()

    return ask


# ---------------------------------------------------------------- API
class ChatContext(BaseModel):
    app_name: str = Field(APP_NAME_DEFAULT, max_length=60)
    user_name: str = Field("", max_length=80)
    glaubensmodus: bool = True
    journal: str = Field("", max_length=8000)


class ChatIn(BaseModel):
    user: str = Field(..., min_length=1, max_length=80)
    message: str = Field(..., min_length=1, max_length=4000)
    context: ChatContext = ChatContext()


def create_app() -> FastAPI:
    app = FastAPI(title="Journalyst Mentor", version="1.0.0", docs_url=None, redoc_url=None)
    app.add_middleware(CORSMiddleware, allow_origins=ORIGINS, allow_methods=["GET", "POST", "DELETE"], allow_headers=["Authorization", "Content-Type"])
    app.state.store = ChatStore(DB_PATH)
    app.state.ask = make_anthropic_ask()
    try:
        app.state.template = load_prompt_template()
    except FileNotFoundError:
        log.error("Prompt-Datei fehlt: %s", PROMPT_FILE)
        app.state.template = ""
    if not APP_TOKEN:
        log.warning("MENTOR_APP_TOKEN ist nicht gesetzt: der Server nimmt Anfragen ohne Zugangstoken an.")

    def auth(authorization: str | None = Header(default=None)) -> None:
        if APP_TOKEN and authorization != f"Bearer {APP_TOKEN}":
            raise HTTPException(status_code=401, detail={"error": "auth", "message": "Zugangstoken fehlt oder ist falsch."})

    def now() -> datetime:
        return datetime.now(timezone.utc)

    def quota(user: str, at: datetime) -> dict:
        local = at.astimezone(TZ)
        day = local.date().isoformat()
        used = app.state.store.count_user_messages(user, day)
        reset = (local + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
        return {"limit": DAILY_LIMIT, "used": used, "remaining": max(0, DAILY_LIMIT - used), "reset_at": reset.isoformat()}

    @app.get("/api/mentor/health")
    def health() -> dict:
        return {"ok": True, "model": MODEL, "limit": DAILY_LIMIT, "prompt_loaded": bool(app.state.template), "auth": bool(APP_TOKEN)}

    @app.get("/api/mentor/history", dependencies=[Depends(auth)])
    def history(user: str = Query(..., min_length=1, max_length=80)) -> dict:
        return {"messages": app.state.store.history(user), "quota": quota(user, now())}

    @app.delete("/api/mentor/history", dependencies=[Depends(auth)])
    def clear(user: str = Query(..., min_length=1, max_length=80)) -> dict:
        return {"ok": True, "deleted": app.state.store.clear(user)}

    @app.post("/api/mentor/chat", dependencies=[Depends(auth)])
    def chat(body: ChatIn) -> dict:
        if not app.state.template:
            raise HTTPException(status_code=500, detail={"error": "prompt", "message": "Der System-Prompt fehlt auf dem Server."})
        at = now()
        q = quota(body.user, at)
        if q["remaining"] <= 0:
            raise HTTPException(status_code=429, detail={"error": "limit", "message": f"Tageslimit von {DAILY_LIMIT} Nachrichten erreicht.", "quota": q})
        system = build_system_prompt(
            app.state.template,
            app_name=body.context.app_name,
            user_name=body.context.user_name,
            glaubensmodus=body.context.glaubensmodus,
            journal=body.context.journal,
        )
        past = app.state.store.history(body.user, HISTORY_WINDOW)
        messages = [{"role": m["role"], "content": m["content"]} for m in past if m["role"] in ("user", "assistant")]
        messages.append({"role": "user", "content": body.message.strip()})
        try:
            reply = app.state.ask(system, messages)
        except Exception as exc:  # noqa: BLE001 - jede Modellstörung wird als 502 gemeldet, nie als Absturz
            log.exception("Modellanfrage fehlgeschlagen")
            raise HTTPException(status_code=502, detail={"error": "model", "message": f"Das Sprachmodell hat nicht geantwortet: {type(exc).__name__}"}) from exc
        if not reply:
            raise HTTPException(status_code=502, detail={"error": "model", "message": "Das Sprachmodell hat eine leere Antwort geliefert."})
        app.state.store.add(body.user, "user", body.message.strip(), at)
        saved = app.state.store.add(body.user, "assistant", reply, now())
        return {"reply": reply, "at": saved["at"], "model": MODEL, "quota": quota(body.user, at)}

    return app


app = create_app()
