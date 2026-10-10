"""Tests für den News-Endpunkt: Bereinigen des Wochen-Exports, Zwischenspeicher, Fehlerfall, Zugangstoken."""

from __future__ import annotations

import importlib
import json
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest
from fastapi import FastAPI, Header, HTTPException
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from server import news  # noqa: E402

WEEK = [
    {"title": "CPI m/m", "country": "USD", "date": "2026-10-13T08:30:00-04:00", "impact": "High", "forecast": "0.3%", "previous": "0.2%"},
    {"title": "Bank Holiday", "country": "JPY", "date": "2026-10-12T00:00:00-04:00", "impact": "Holiday", "forecast": "", "previous": ""},
    {"title": "ZEW Economic Sentiment", "country": "eur", "date": "2026-10-13T05:00:00-04:00", "impact": "Medium"},
    {"title": "", "country": "USD", "date": "2026-10-13T10:00:00-04:00", "impact": "Low"},
    {"title": "Ohne Zeit", "country": "USD", "date": "kaputt", "impact": "Low"},
    "kein Eintrag",
]


def test_normalize_cleans_and_converts_to_utc():
    out = news.normalize(WEEK)
    assert [e["title"] for e in out] == ["CPI m/m", "Bank Holiday", "ZEW Economic Sentiment"]
    cpi = out[0]
    assert cpi["time"] == "2026-10-13T12:30:00Z" and cpi["impact"] == "high" and cpi["currency"] == "USD"
    assert cpi["forecast"] == "0.3%" and cpi["previous"] == "0.2%" and cpi["actual"] == ""
    assert out[1]["impact"] == "holiday" and out[2]["currency"] == "EUR" and out[2]["impact"] == "medium"
    assert news.normalize(WEEK)[0]["id"] == cpi["id"]  # stabile Kennung


def test_cache_merges_sorts_and_keeps_last_good_state():
    calls = {"n": 0}
    t = [datetime(2026, 10, 12, tzinfo=timezone.utc)]

    def fetch(url):
        calls["n"] += 1
        if "fail" in url and calls["n"] > 2:
            raise OSError("offline")
        return WEEK[:1] if url.startswith("https://a.") else WEEK[1:3]

    cache = news.NewsCache(["https://a.example/x.json", "https://fail.example/y.json"], fetch=fetch, ttl_min=30, now=lambda: t[0])
    events, updated, stale = cache.events()
    assert [e["title"] for e in events] == ["Bank Holiday", "ZEW Economic Sentiment", "CPI m/m"]
    assert updated == t[0] and not stale and calls["n"] == 2
    cache.events()
    assert calls["n"] == 2  # innerhalb der Gültigkeit kein neuer Abruf
    t[0] += timedelta(minutes=31)
    events, _, stale = cache.events()
    assert stale and len(events) == 3  # Quelle fällt aus: letzter guter Stand bleibt


def test_feed_urls_from_env():
    assert news.feed_urls_from_env({}) == news.DEFAULT_FEEDS
    assert news.feed_urls_from_env({"NEWS_FEED_URLS": " https://x/a.json , https://x/b.json "}) == ["https://x/a.json", "https://x/b.json"]


def test_endpoint_requires_token_and_returns_events():
    def auth(authorization: str | None = Header(default=None)):
        if authorization != "Bearer geheim":
            raise HTTPException(status_code=401)

    app = FastAPI()
    app.include_router(news.make_router(auth, news.NewsCache(["u"], fetch=lambda u: WEEK)))
    c = TestClient(app)
    assert c.get("/api/news").status_code == 401
    r = c.get("/api/news", headers={"Authorization": "Bearer geheim"})
    assert r.status_code == 200
    body = r.json()
    assert len(body["events"]) == 3 and body["stale"] is False and body["source"] and body["updated_at"].endswith("Z")


def test_server_includes_news_route(tmp_path, monkeypatch):
    monkeypatch.setenv("MENTOR_PROMPT_FILE", str(ROOT / "docs" / "mentor-systemprompt.md"))
    monkeypatch.setenv("MENTOR_DB", str(tmp_path / "mentor.sqlite"))
    monkeypatch.setenv("MENTOR_APP_TOKEN", "geheim")
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-key")
    feed = tmp_path / "week.json"
    feed.write_text(json.dumps(WEEK), encoding="utf-8")
    monkeypatch.setenv("NEWS_FEED_URLS", feed.as_uri())  # lokale Datei statt Netz
    import server.mentor_server as mod
    mod = importlib.reload(mod)
    c = TestClient(mod.app)
    assert c.get("/api/mentor/health").json()["news"] is True
    assert c.get("/api/news").status_code == 401
    body = c.get("/api/news", headers={"Authorization": "Bearer geheim"}).json()
    assert [e["title"] for e in body["events"]] == ["Bank Holiday", "ZEW Economic Sentiment", "CPI m/m"]
