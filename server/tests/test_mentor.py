"""Tests für den Mentor-Server: Prompt-Aufbau, Zugang, Verlauf, Tageslimit."""

from __future__ import annotations

import importlib
import os
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[2]


@pytest.fixture()
def server(tmp_path, monkeypatch):
    prompt = tmp_path / "prompt.md"
    prompt.write_text(
        "# Titel\n\n> Hinweise für die Einbindung (nicht senden)\n> - {{GLAUBENSMODUS}} erklärt\n\n---\n\n# Rolle\n"
        "Mentor in {{APP_NAME}}.\nName: {{NUTZERNAME}}\nGlaubensmodus: {{GLAUBENSMODUS}}\n<journal>\n{{JOURNAL_KONTEXT}}\n</journal>\n"
        "Verweise auf den Ruhepunkt in {{APP_NAME}}.\n",
        encoding="utf-8",
    )
    monkeypatch.setenv("MENTOR_PROMPT_FILE", str(prompt))
    monkeypatch.setenv("MENTOR_DB", str(tmp_path / "mentor.sqlite"))
    monkeypatch.setenv("MENTOR_APP_TOKEN", "geheim")
    monkeypatch.setenv("MENTOR_DAILY_LIMIT", "2")
    sys.path.insert(0, str(ROOT))
    import server.mentor_server as mod

    mod = importlib.reload(mod)
    calls: list[dict] = []

    def fake_ask(system: str, messages: list[dict]) -> str:
        calls.append({"system": system, "messages": messages})
        return f"Antwort {len(calls)} auf: {messages[-1]['content']}"

    mod.app.state.ask = fake_ask
    client = TestClient(mod.app)
    client.headers.update({"Authorization": "Bearer geheim"})
    return mod, client, calls


def test_prompt_template_drops_header_and_replaces_placeholders(server):
    mod, _, _ = server
    tpl = mod.app.state.template
    assert "Hinweise für die Einbindung" not in tpl
    assert tpl.startswith("# Rolle")
    out = mod.build_system_prompt(tpl, app_name="Journalyst", user_name="Flo", glaubensmodus=False, journal="")
    assert "Mentor in Journalyst." in out and "Name: Flo" in out and "Glaubensmodus: aus" in out
    assert "keine Daten vorhanden" in out and "{{" not in out
    sneaky = mod.build_system_prompt(tpl, app_name="", user_name="", glaubensmodus=True, journal="Notiz: {{NUTZERNAME}} bleibt Text")
    assert "Name: unbekannt" in sneaky and "{{NUTZERNAME}} bleibt Text" in sneaky  # Nutzertext wird nicht erneut ersetzt


def test_auth_required(server):
    _, client, _ = server
    anon = TestClient(client.app)
    assert anon.get("/api/mentor/history", params={"user": "flo"}).status_code == 401
    assert anon.get("/api/mentor/health").status_code == 200


def test_chat_stores_history_and_uses_context(server):
    mod, client, calls = server
    r = client.post("/api/mentor/chat", json={"user": "flo", "message": "Ich habe heute 3 Verluste.", "context": {"user_name": "Flo", "glaubensmodus": True, "journal": "Letzte Trades: -1R, -1R, -0.5R"}})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["reply"].startswith("Antwort 1") and body["quota"]["remaining"] == 1 and body["quota"]["limit"] == 2
    assert "Glaubensmodus: an" in calls[0]["system"] and "Letzte Trades: -1R" in calls[0]["system"]
    assert calls[0]["messages"] == [{"role": "user", "content": "Ich habe heute 3 Verluste."}]
    r2 = client.post("/api/mentor/chat", json={"user": "flo", "message": "Und jetzt?"})
    assert r2.status_code == 200
    assert [m["role"] for m in calls[1]["messages"]] == ["user", "assistant", "user"]
    hist = client.get("/api/mentor/history", params={"user": "flo"}).json()
    assert [m["role"] for m in hist["messages"]] == ["user", "assistant", "user", "assistant"]
    assert hist["quota"]["remaining"] == 0
    other = client.get("/api/mentor/history", params={"user": "anna"}).json()
    assert other["messages"] == [] and other["quota"]["remaining"] == 2


def test_daily_limit_blocks_third_message(server):
    _, client, calls = server
    for i in range(2):
        assert client.post("/api/mentor/chat", json={"user": "flo", "message": f"Nachricht {i}"}).status_code == 200
    r = client.post("/api/mentor/chat", json={"user": "flo", "message": "Noch eine"})
    assert r.status_code == 429
    assert r.json()["detail"]["error"] == "limit" and "reset_at" in r.json()["detail"]["quota"]
    assert len(calls) == 2  # das Modell wurde nicht mehr gerufen


def test_model_failure_is_reported_not_stored(server):
    mod, client, _ = server

    def broken(system, messages):
        raise RuntimeError("Netz weg")

    mod.app.state.ask = broken
    r = client.post("/api/mentor/chat", json={"user": "flo", "message": "Hallo"})
    assert r.status_code == 502 and "RuntimeError" in r.json()["detail"]["message"]
    assert client.get("/api/mentor/history", params={"user": "flo"}).json()["messages"] == []


def test_clear_history(server):
    _, client, _ = server
    client.post("/api/mentor/chat", json={"user": "flo", "message": "Hallo"})
    assert client.delete("/api/mentor/history", params={"user": "flo"}).json()["deleted"] == 2
    assert client.get("/api/mentor/history", params={"user": "flo"}).json()["messages"] == []
