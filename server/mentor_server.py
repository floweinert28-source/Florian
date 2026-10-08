"""Journalyst Mentor-Server.

Ruft das Sprachmodell ausschließlich serverseitig auf (der API-Schlüssel bleibt hier),
baut den System-Prompt aus docs/mentor-systemprompt.md, speichert den Chatverlauf pro
Nutzer in SQLite und begrenzt die Nachrichten pro Nutzer und Tag.

Start:  uvicorn server.mentor_server:app --host 0.0.0.0 --port 8787
Umgebung: siehe server/README.md
"""

from __future__ import annotations

import base64
import json
import logging
import os
import re
import sqlite3
import threading
import urllib.request
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Callable
from zoneinfo import ZoneInfo

from fastapi import Depends, FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

from server.coach import CoachStore, make_asset_route, make_router as make_coach_router

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
# Sprachjournal: Auswertung über dasselbe Modell, eigenes Tageslimit; Transkription optional über einen
# OpenAI-kompatiblen Speech-to-Text-Endpunkt (nur wenn der Browser kein Transkript liefern konnte)
VOICE_LIMIT = int(os.environ.get("VOICE_DAILY_LIMIT", "30"))
VOICE_MAX_TOKENS = int(os.environ.get("VOICE_MAX_TOKENS", "600"))
STT_URL = os.environ.get("VOICE_STT_URL", "")
STT_KEY = os.environ.get("VOICE_STT_KEY", "")
STT_MODEL = os.environ.get("VOICE_STT_MODEL", "whisper-1")
EMOTIONS = ["ruhig", "fokussiert", "zuversichtlich", "unsicher", "ängstlich", "gierig", "euphorisch", "frustriert", "wütend", "müde", "gelangweilt", "neutral"]
VOICE_SCHEMA = {
    "type": "object",
    "properties": {
        "emotion": {"type": "string", "enum": EMOTIONS},
        "setup": {"type": "string"},
        "mistakes": {"type": "array", "items": {"type": "string"}},
        "summary": {"type": "string"},
    },
    "required": ["emotion", "setup", "mistakes", "summary"],
    "additionalProperties": False,
}
VOICE_SYSTEM = (
    "Du wertest eine kurze gesprochene Trading-Notiz aus einem Trading-Journal aus. Antworte nur mit dem geforderten JSON.\n"
    "Regeln: emotion ist genau ein Wert aus der festen Liste (die dominierende Gefühlslage; 'neutral', wenn unklar). "
    "setup ist genau einer der erlaubten Setup-Namen des Nutzers oder ein leerer String, wenn keiner passt. "
    "mistakes enthält nur Namen aus der Liste der erlaubten Fehler-Tags des Nutzers, die der Text klar belegt (leer, wenn keiner). "
    "summary ist eine Zusammenfassung in höchstens zwei kurzen deutschen Sätzen in der Du-Form, ohne Bewertung, ohne Ratschläge."
)
PLACEHOLDER = re.compile(r"\{\{(APP_NAME|NUTZERNAME|GLAUBENSMODUS|JOURNAL_KONTEXT)\}\}")


def api_key_present() -> bool:
    return bool(os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("ANTHROPIC_AUTH_TOKEN"))


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


def conversation(past: list[dict], new_message: str) -> list[dict]:
    """Baut die Nachrichtenliste für das Modell: beginnt mit einer Nutzernachricht, Rollen wechseln sich ab.

    Ein ungerades Fenster oder eine verwaiste Nutzerzeile (Antwort ging verloren) würde sonst
    vom Modell mit 400 abgelehnt; gleiche Rollen in Folge werden zusammengefasst.
    """
    rows = [m for m in past if m.get("role") in ("user", "assistant")] + [{"role": "user", "content": new_message}]
    while rows and rows[0]["role"] != "user":
        rows.pop(0)
    out: list[dict] = []
    for m in rows:
        if out and out[-1]["role"] == m["role"]:
            out[-1] = {"role": m["role"], "content": out[-1]["content"] + "\n\n" + m["content"]}
        else:
            out.append({"role": m["role"], "content": m["content"]})
    return out


# ---------------------------------------------------------------- Speicher
class ChatStore:
    """Chatverlauf und Tageszähler pro Nutzer in SQLite; klein, ohne weitere Abhängigkeiten.

    Der Tageszähler (Tabelle usage) ist vom Verlauf getrennt: Löschen des Verlaufs setzt das Limit nicht zurück.
    """

    def __init__(self, path: Path):
        self.path = path
        self.lock = threading.Lock()
        path.parent.mkdir(parents=True, exist_ok=True)
        with self._conn() as c:
            c.execute(
                "CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL, "
                "role TEXT NOT NULL, content TEXT NOT NULL, created_at TEXT NOT NULL, day TEXT NOT NULL)"
            )
            c.execute("CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages (user_id, id)")
            c.execute("CREATE TABLE IF NOT EXISTS usage (user_id TEXT NOT NULL, day TEXT NOT NULL, n INTEGER NOT NULL, PRIMARY KEY (user_id, day))")

    def _conn(self) -> sqlite3.Connection:
        return sqlite3.connect(str(self.path))

    @staticmethod
    def day_of(at: datetime) -> str:
        return at.astimezone(TZ).date().isoformat()

    def used(self, user: str, day: str) -> int:
        with self.lock, self._conn() as c:
            row = c.execute("SELECT n FROM usage WHERE user_id = ? AND day = ?", (user, day)).fetchone()
        return int(row[0]) if row else 0

    def reserve(self, user: str, content: str, at: datetime, limit: int) -> int | None:
        """Zählt die Nachricht und legt die Nutzerzeile an, atomar. None, wenn das Tageslimit erreicht ist."""
        day = self.day_of(at)
        with self.lock, self._conn() as c:
            row = c.execute("SELECT n FROM usage WHERE user_id = ? AND day = ?", (user, day)).fetchone()
            n = int(row[0]) if row else 0
            if n >= limit:
                return None
            c.execute("INSERT INTO usage (user_id, day, n) VALUES (?, ?, 1) ON CONFLICT(user_id, day) DO UPDATE SET n = n + 1", (user, day))
            cur = c.execute(
                "INSERT INTO messages (user_id, role, content, created_at, day) VALUES (?, 'user', ?, ?, ?)", (user, content, at.isoformat(), day)
            )
            return int(cur.lastrowid)

    def reserve_usage(self, user: str, at: datetime, limit: int) -> bool:
        """Zählt nur im Tageszähler (ohne Nachricht), z. B. für das Sprachjournal. False, wenn das Limit erreicht ist."""
        day = self.day_of(at)
        with self.lock, self._conn() as c:
            row = c.execute("SELECT n FROM usage WHERE user_id = ? AND day = ?", (user, day)).fetchone()
            if (int(row[0]) if row else 0) >= limit:
                return False
            c.execute("INSERT INTO usage (user_id, day, n) VALUES (?, ?, 1) ON CONFLICT(user_id, day) DO UPDATE SET n = n + 1", (user, day))
            return True

    def release_usage(self, user: str, at: datetime) -> None:
        with self.lock, self._conn() as c:
            c.execute("UPDATE usage SET n = MAX(n - 1, 0) WHERE user_id = ? AND day = ?", (user, self.day_of(at)))

    def release(self, user: str, message_id: int, at: datetime) -> None:
        """Nimmt eine Reservierung zurück, wenn das Modell nicht geantwortet hat."""
        day = self.day_of(at)
        with self.lock, self._conn() as c:
            c.execute("DELETE FROM messages WHERE id = ?", (message_id,))
            c.execute("UPDATE usage SET n = MAX(n - 1, 0) WHERE user_id = ? AND day = ?", (user, day))

    def add_reply(self, user: str, content: str, at: datetime) -> dict:
        row = {"role": "assistant", "content": content, "at": at.isoformat()}
        with self.lock, self._conn() as c:
            c.execute(
                "INSERT INTO messages (user_id, role, content, created_at, day) VALUES (?, 'assistant', ?, ?, ?)",
                (user, content, row["at"], self.day_of(at)),
            )
        return row

    def history(self, user: str, limit: int = 200) -> list[dict]:
        with self.lock, self._conn() as c:
            rows = c.execute(
                "SELECT role, content, created_at FROM messages WHERE user_id = ? ORDER BY id DESC LIMIT ?", (user, limit)
            ).fetchall()
        return [{"role": r, "content": t, "at": a} for r, t, a in reversed(rows)]

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


def make_anthropic_ask_json(schema: dict, max_tokens: int) -> Callable[[str, str], dict]:
    """Modellanfrage mit erzwungenem JSON (output_config.format); liefert das geparste Objekt."""
    client = None

    def ask_json(system: str, user_text: str) -> dict:
        nonlocal client
        if client is None:
            import anthropic

            client = anthropic.Anthropic()
        resp = client.messages.create(
            model=MODEL,
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": user_text}],
            output_config={"format": {"type": "json_schema", "schema": schema}},
        )
        text = next((part.text for part in resp.content if getattr(part, "type", "") == "text"), "")
        return json.loads(text)

    return ask_json


def transcribe_remote(audio_b64: str, mime: str, language: str) -> str:
    """Transkription über einen OpenAI-kompatiblen Endpunkt (multipart/form-data, Feld 'file')."""
    if not STT_URL:
        raise RuntimeError("keine Transkription eingerichtet")
    data = base64.b64decode(audio_b64)
    ext = "mp4" if "mp4" in mime or "m4a" in mime or "aac" in mime else "ogg" if "ogg" in mime else "wav" if "wav" in mime else "webm"
    boundary = "----journalyst" + uuid.uuid4().hex
    parts = []
    for name, value in (("model", STT_MODEL), ("language", language or "de"), ("response_format", "json")):
        parts.append(f"--{boundary}\r\nContent-Disposition: form-data; name=\"{name}\"\r\n\r\n{value}\r\n".encode())
    parts.append(f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"aufnahme.{ext}\"\r\nContent-Type: {mime or 'application/octet-stream'}\r\n\r\n".encode() + data + b"\r\n")
    parts.append(f"--{boundary}--\r\n".encode())
    body = b"".join(parts)
    headers = {"Content-Type": f"multipart/form-data; boundary={boundary}"}
    if STT_KEY:
        headers["Authorization"] = f"Bearer {STT_KEY}"
    req = urllib.request.Request(STT_URL, data=body, headers=headers, method="POST")
    with urllib.request.urlopen(req, timeout=60) as resp:  # noqa: S310 - Ziel kommt aus der Server-Konfiguration
        payload = json.loads(resp.read().decode("utf-8"))
    return str(payload.get("text", "")).strip()


def clean_voice_result(raw: dict, setups: list[str], mistakes: list[str]) -> dict:
    """Hält die Vorschläge innerhalb der erlaubten Listen; unbekannte Werte fallen weg."""
    emotion = str(raw.get("emotion", "")).strip().lower()
    if emotion not in EMOTIONS:
        emotion = "neutral"
    by_lower = {s.strip().lower(): s for s in setups if s and s.strip()}
    setup = by_lower.get(str(raw.get("setup", "")).strip().lower(), "")
    allowed = {m.strip().lower(): m for m in mistakes if m and m.strip()}
    found: list[str] = []
    for m in raw.get("mistakes", []) or []:
        key = str(m).strip().lower()
        if key in allowed and allowed[key] not in found:
            found.append(allowed[key])
    summary = " ".join(str(raw.get("summary", "")).split())[:400]
    return {"emotion": emotion, "setup": setup, "mistakes": found, "summary": summary}


# ---------------------------------------------------------------- API
class ChatContext(BaseModel):
    app_name: str = Field(APP_NAME_DEFAULT, max_length=60)
    user_name: str = Field("", max_length=80)
    glaubensmodus: bool = True
    journal: str = Field("", max_length=8000)


class VoiceIn(BaseModel):
    user: str = Field(..., min_length=1, max_length=80)
    transcript: str = Field("", max_length=4000)
    audio: str = Field("", max_length=2_600_000)  # Base64 der Aufnahme (max. 30 s), nur nötig ohne Browser-Transkript
    mime: str = Field("", max_length=80)
    language: str = Field("de", max_length=10)
    setups: list[str] = Field(default_factory=list, max_length=100)
    mistakes: list[str] = Field(default_factory=list, max_length=100)
    trade: str = Field("", max_length=600)


class ChatIn(BaseModel):
    user: str = Field(..., min_length=1, max_length=80)
    message: str = Field(..., max_length=4000)
    context: ChatContext = ChatContext()

    @field_validator("message")
    @classmethod
    def _not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Die Nachricht ist leer.")
        return v


def create_app() -> FastAPI:
    app = FastAPI(title="Journalyst Mentor", version="1.1.0", docs_url=None, redoc_url=None)
    app.add_middleware(CORSMiddleware, allow_origins=ORIGINS, allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"], allow_headers=["Authorization", "Content-Type", "X-Coach-Key"])
    app.state.store = ChatStore(DB_PATH)
    app.state.coach = CoachStore(DB_PATH, TZ)
    app.state.ask = make_anthropic_ask()
    app.state.ask_json = make_anthropic_ask_json(VOICE_SCHEMA, VOICE_MAX_TOKENS)
    app.state.transcribe = transcribe_remote
    try:
        app.state.template = load_prompt_template()
    except FileNotFoundError:
        log.error("Prompt-Datei fehlt: %s", PROMPT_FILE)
        app.state.template = ""
    if not APP_TOKEN:
        log.warning("MENTOR_APP_TOKEN ist nicht gesetzt: der Server nimmt Anfragen ohne Zugangstoken an.")
    if not api_key_present():
        log.warning("ANTHROPIC_API_KEY ist nicht gesetzt: Chats werden fehlschlagen, bis der Schlüssel gesetzt ist.")

    def auth(authorization: str | None = Header(default=None)) -> None:
        if APP_TOKEN and authorization != f"Bearer {APP_TOKEN}":
            raise HTTPException(status_code=401, detail={"error": "auth", "message": "Zugangstoken fehlt oder ist falsch."})

    def now() -> datetime:
        return datetime.now(timezone.utc)

    def quota(user: str, at: datetime) -> dict:
        local = at.astimezone(TZ)
        used = app.state.store.used(user, local.date().isoformat())
        reset = (local + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
        return {"limit": DAILY_LIMIT, "used": used, "remaining": max(0, DAILY_LIMIT - used), "reset_at": reset.isoformat()}

    @app.get("/api/mentor/health")
    def health() -> dict:
        return {"ok": True, "model": MODEL, "limit": DAILY_LIMIT, "prompt_loaded": bool(app.state.template), "auth": bool(APP_TOKEN), "api_key": api_key_present(), "voice_limit": VOICE_LIMIT, "stt": bool(STT_URL), "emotions": EMOTIONS, "coach": True}

    @app.get("/api/mentor/history", dependencies=[Depends(auth)])
    def history(user: str = Query(..., min_length=1, max_length=80)) -> dict:
        return {"messages": app.state.store.history(user), "quota": quota(user, now())}

    @app.delete("/api/mentor/history", dependencies=[Depends(auth)])
    def clear(user: str = Query(..., min_length=1, max_length=80)) -> dict:
        return {"ok": True, "deleted": app.state.store.clear(user), "quota": quota(user, now())}

    @app.post("/api/mentor/chat", dependencies=[Depends(auth)])
    def chat(body: ChatIn) -> dict:
        if not app.state.template:
            raise HTTPException(status_code=500, detail={"error": "prompt", "message": "Der System-Prompt fehlt auf dem Server."})
        if not api_key_present():
            raise HTTPException(status_code=503, detail={"error": "key", "message": "Auf dem Server ist kein ANTHROPIC_API_KEY gesetzt."})
        at = now()
        past = app.state.store.history(body.user, HISTORY_WINDOW)
        reserved = app.state.store.reserve(body.user, body.message, at, DAILY_LIMIT)
        if reserved is None:
            raise HTTPException(status_code=429, detail={"error": "limit", "message": f"Tageslimit von {DAILY_LIMIT} Nachrichten erreicht.", "quota": quota(body.user, at)})
        system = build_system_prompt(
            app.state.template,
            app_name=body.context.app_name,
            user_name=body.context.user_name,
            glaubensmodus=body.context.glaubensmodus,
            journal=body.context.journal,
        )
        try:
            reply = app.state.ask(system, conversation(past, body.message))
            if not reply:
                raise RuntimeError("leere Antwort")
        except Exception as exc:  # noqa: BLE001 - jede Modellstörung wird als 502 gemeldet, nie als Absturz
            app.state.store.release(body.user, reserved, at)
            log.exception("Modellanfrage fehlgeschlagen")
            raise HTTPException(status_code=502, detail={"error": "model", "message": f"Das Sprachmodell hat nicht geantwortet: {type(exc).__name__}"}) from exc
        saved = app.state.store.add_reply(body.user, reply, now())
        return {"reply": reply, "at": saved["at"], "model": MODEL, "quota": quota(body.user, at)}

    @app.post("/api/voice/analyze", dependencies=[Depends(auth)])
    def voice(body: VoiceIn) -> dict:
        """Sprachjournal: Transkript (vom Browser oder per Server-Transkription) auswerten → Vorschläge als JSON."""
        if not api_key_present():
            raise HTTPException(status_code=503, detail={"error": "key", "message": "Auf dem Server ist kein ANTHROPIC_API_KEY gesetzt."})
        at = now()
        transcript = " ".join(body.transcript.split())
        source = "browser"
        if not transcript:
            if not body.audio:
                raise HTTPException(status_code=422, detail={"error": "transcript", "message": "Kein Transkript und keine Aufnahme erhalten."})
            if not STT_URL:
                raise HTTPException(status_code=422, detail={"error": "stt", "message": "Dein Browser hat kein Transkript geliefert und auf dem Server ist keine Transkription eingerichtet (VOICE_STT_URL)."})
            try:
                transcript = app.state.transcribe(body.audio, body.mime, body.language)
            except Exception as exc:  # noqa: BLE001
                log.exception("Transkription fehlgeschlagen")
                raise HTTPException(status_code=502, detail={"error": "stt", "message": f"Die Transkription ist fehlgeschlagen: {type(exc).__name__}"}) from exc
            source = "server"
            if not transcript:
                raise HTTPException(status_code=422, detail={"error": "transcript", "message": "In der Aufnahme wurde keine Sprache erkannt."})
        key = f"{body.user}#voice"
        if not app.state.store.reserve_usage(key, at, VOICE_LIMIT):
            raise HTTPException(status_code=429, detail={"error": "limit", "message": f"Tageslimit von {VOICE_LIMIT} Sprachnotizen erreicht."})
        setups = [s for s in body.setups if s.strip()][:100]
        mistakes = [m for m in body.mistakes if m.strip()][:100]
        user_text = (
            f"Erlaubte Setups: {', '.join(setups) or '(keine)'}\nErlaubte Fehler-Tags: {', '.join(mistakes) or '(keine)'}\n"
            + (f"Trade: {body.trade.strip()}\n" if body.trade.strip() else "")
            + f"Gesprochene Notiz:\n{transcript}"
        )
        try:
            raw = app.state.ask_json(VOICE_SYSTEM, user_text)
            if not isinstance(raw, dict):
                raise RuntimeError("keine Auswertung")
        except Exception as exc:  # noqa: BLE001
            app.state.store.release_usage(key, at)
            log.exception("Sprachauswertung fehlgeschlagen")
            raise HTTPException(status_code=502, detail={"error": "model", "message": f"Die Auswertung ist fehlgeschlagen: {type(exc).__name__}"}) from exc
        result = clean_voice_result(raw, setups, mistakes)
        used = app.state.store.used(key, ChatStore.day_of(at))
        return dict(result, transcript=transcript, source=source, model=MODEL, quota={"limit": VOICE_LIMIT, "used": used, "remaining": max(0, VOICE_LIMIT - used)})

    # Coach Mode (Gruppen, Journal-Ansicht, Mentor-Notizen): eigener Router, gleiches Zugangstoken, eigener Nutzer-Schlüssel
    app.include_router(make_coach_router(app.state.coach, auth))
    app.include_router(make_asset_route(app.state.coach))
    return app


app = create_app()
