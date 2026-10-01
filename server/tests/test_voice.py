"""Tests für das Sprachjournal: Auswertung als JSON, Listen-Begrenzung, Transkription, Tageslimit."""

from __future__ import annotations

import importlib
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[2]


@pytest.fixture()
def voice(tmp_path, monkeypatch):
    monkeypatch.setenv("MENTOR_PROMPT_FILE", str(ROOT / "docs" / "mentor-systemprompt.md"))
    monkeypatch.setenv("MENTOR_DB", str(tmp_path / "mentor.sqlite"))
    monkeypatch.setenv("MENTOR_APP_TOKEN", "geheim")
    monkeypatch.setenv("VOICE_DAILY_LIMIT", "2")
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-key")
    monkeypatch.delenv("VOICE_STT_URL", raising=False)
    sys.path.insert(0, str(ROOT))
    import server.mentor_server as mod

    mod = importlib.reload(mod)
    calls: list[dict] = []
    answer = {"emotion": "frustriert", "setup": "pullback", "mistakes": ["FOMO", "Unbekannt"], "summary": "Du bist zu früh rein.  Danach hast du nachgelegt."}

    def fake_ask_json(system: str, user_text: str) -> dict:
        calls.append({"system": system, "user": user_text})
        return dict(answer)

    mod.app.state.ask_json = fake_ask_json
    client = TestClient(mod.app)
    client.headers.update({"Authorization": "Bearer geheim"})
    return mod, client, calls, answer


def test_voice_analysis_keeps_suggestions_within_user_lists(voice):
    mod, client, calls, _ = voice
    body = {"user": "flo", "transcript": "  Bin zu früh rein   und habe nachgelegt. ", "setups": ["Pullback", "Breakout"], "mistakes": ["FOMO", "Revenge-Trade"], "trade": "DAX Long 09:15"}
    r = client.post("/api/voice/analyze", json=body)
    assert r.status_code == 200, r.text
    out = r.json()
    assert out["transcript"] == "Bin zu früh rein und habe nachgelegt."
    assert out["source"] == "browser"
    assert out["emotion"] == "frustriert"
    assert out["setup"] == "Pullback"  # Groß-/Kleinschreibung des Nutzers bleibt erhalten
    assert out["mistakes"] == ["FOMO"]  # unbekannte Tags fallen weg
    assert out["summary"] == "Du bist zu früh rein. Danach hast du nachgelegt."
    assert out["quota"] == {"limit": 2, "used": 1, "remaining": 1}
    assert "Erlaubte Setups: Pullback, Breakout" in calls[0]["user"] and "Trade: DAX Long 09:15" in calls[0]["user"]
    assert "Bin zu früh rein" in calls[0]["user"]


def test_voice_unknown_emotion_and_setup_fall_back(voice):
    mod, client, _, answer = voice
    answer.update({"emotion": "Hungrig", "setup": "Scalp", "mistakes": [], "summary": ""})
    r = client.post("/api/voice/analyze", json={"user": "flo", "transcript": "Test", "setups": ["Pullback"], "mistakes": []})
    assert r.status_code == 200
    assert r.json()["emotion"] == "neutral" and r.json()["setup"] == "" and r.json()["mistakes"] == []


def test_voice_without_transcript_needs_server_transcription(voice):
    mod, client, calls, _ = voice
    r = client.post("/api/voice/analyze", json={"user": "flo", "transcript": "", "audio": ""})
    assert r.status_code == 422 and r.json()["detail"]["error"] == "transcript"
    r = client.post("/api/voice/analyze", json={"user": "flo", "transcript": "", "audio": "AAAA", "mime": "audio/mp4"})
    assert r.status_code == 422 and r.json()["detail"]["error"] == "stt" and "VOICE_STT_URL" in r.json()["detail"]["message"]
    assert not calls


def test_voice_server_transcription_is_used_when_configured(voice, monkeypatch):
    mod, client, calls, _ = voice
    monkeypatch.setattr(mod, "STT_URL", "https://stt.example/v1/audio/transcriptions")
    seen = {}

    def fake_transcribe(audio_b64: str, mime: str, language: str) -> str:
        seen.update({"audio": audio_b64, "mime": mime, "language": language})
        return "Hallo aus der Aufnahme"

    mod.app.state.transcribe = fake_transcribe
    r = client.post("/api/voice/analyze", json={"user": "flo", "transcript": "", "audio": "AAAA", "mime": "audio/mp4", "language": "de"})
    assert r.status_code == 200 and r.json()["source"] == "server" and r.json()["transcript"] == "Hallo aus der Aufnahme"
    assert seen == {"audio": "AAAA", "mime": "audio/mp4", "language": "de"}
    assert "Hallo aus der Aufnahme" in calls[0]["user"]


def test_voice_daily_limit_is_separate_from_chat_and_released_on_failure(voice):
    mod, client, calls, _ = voice
    ok = {"user": "flo", "transcript": "Erste Notiz"}
    assert client.post("/api/voice/analyze", json=ok).status_code == 200
    mod.app.state.ask_json = lambda system, text: (_ for _ in ()).throw(RuntimeError("kaputt"))
    r = client.post("/api/voice/analyze", json=ok)
    assert r.status_code == 502 and r.json()["detail"]["error"] == "model"
    mod.app.state.ask_json = lambda system, text: {"emotion": "ruhig", "setup": "", "mistakes": [], "summary": "Ok."}
    assert client.post("/api/voice/analyze", json=ok).json()["quota"]["used"] == 2  # die fehlgeschlagene zählt nicht
    r = client.post("/api/voice/analyze", json=ok)
    assert r.status_code == 429 and r.json()["detail"]["error"] == "limit"
    # Chat-Kontingent ist unabhängig
    assert client.get("/api/mentor/history", params={"user": "flo"}).json()["quota"]["used"] == 0


def test_health_reports_voice_settings(voice):
    _, client, _, _ = voice
    h = client.get("/api/mentor/health").json()
    assert h["voice_limit"] == 2 and h["stt"] is False and "neutral" in h["emotions"]
