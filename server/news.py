"""Wirtschaftskalender (News) für den Bereich „News“ im Journal.

Quelle ist der öffentliche Wochen-Export des ForexFactory-Kalenders (JSON, ohne API-Schlüssel): diese Woche und, sobald
veröffentlicht, die nächste Woche. Der Browser darf den Export nicht direkt abrufen (keine CORS-Freigabe), deshalb holt
der Server ihn, hält ihn eine Weile im Speicher und liefert eine bereinigte Liste aus. Keine Datenbank, keine Schlüssel.

Umgebungsvariablen:
  NEWS_FEED_URLS   Komma-getrennte JSON-Adressen (Standard: ForexFactory diese und nächste Woche)
  NEWS_CACHE_MIN   Minuten, die ein Abruf gültig bleibt (Standard 30)
"""
from __future__ import annotations

import json
import logging
import os
import threading
import urllib.error
import zlib
import urllib.request
from datetime import datetime, timedelta, timezone
from typing import Callable

from fastapi import APIRouter, Depends

log = logging.getLogger("journalyst.news")

DEFAULT_FEEDS = [
    "https://nfs.faireconomy.media/ff_calendar_thisweek.json",
    "https://nfs.faireconomy.media/ff_calendar_nextweek.json",
]
IMPACT = {"high": "high", "medium": "medium", "low": "low", "holiday": "holiday", "non-economic": "low"}


def feed_urls_from_env(env: dict | None = None) -> list[str]:
    env = os.environ if env is None else env
    raw = (env.get("NEWS_FEED_URLS") or "").strip()
    return [u.strip() for u in raw.split(",") if u.strip()] or list(DEFAULT_FEEDS)


def fetch_json(url: str, timeout: float = 15.0):
    """Lädt eine JSON-Liste; eine noch nicht veröffentlichte Woche (404) ergibt eine leere Liste."""
    req = urllib.request.Request(url, headers={"User-Agent": "Journalyst/1.0 (+news)", "Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:  # noqa: S310 - feste bzw. vom Betreiber konfigurierte Adressen
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        if exc.code == 404:
            return []
        raise


def normalize(items) -> list[dict]:
    """Bringt Einträge in eine feste Form und verwirft unbrauchbare (ohne Titel oder Zeit)."""
    out = []
    for it in items if isinstance(items, list) else []:
        if not isinstance(it, dict):
            continue
        title = str(it.get("title") or "").strip()
        raw_date = str(it.get("date") or "").strip()
        if not title or not raw_date:
            continue
        try:
            at = datetime.fromisoformat(raw_date.replace("Z", "+00:00"))
        except ValueError:
            continue
        if at.tzinfo is None:
            at = at.replace(tzinfo=timezone.utc)
        at = at.astimezone(timezone.utc)
        impact = IMPACT.get(str(it.get("impact") or "").strip().lower(), "low")
        cur = str(it.get("country") or "").strip().upper()[:8] or "ALL"
        out.append({
            "id": f"{at.strftime('%Y%m%d%H%M')}-{cur}-{zlib.crc32(title.encode()):08x}",  # stabil über Neustarts
            "title": title[:160],
            "currency": cur,
            "time": at.isoformat().replace("+00:00", "Z"),
            "impact": impact,
            "forecast": str(it.get("forecast") or "").strip()[:40],
            "previous": str(it.get("previous") or "").strip()[:40],
            "actual": str(it.get("actual") or "").strip()[:40],
        })
    return out


class NewsCache:
    """Hält die Abrufe je Adresse für eine Weile; bei Fehlern bleibt der letzte gute Stand erhalten."""

    def __init__(self, urls: list[str], fetch: Callable[[str], object] = fetch_json, ttl_min: float = 30, now: Callable[[], datetime] | None = None):
        self.urls, self.fetch, self.ttl = urls, fetch, timedelta(minutes=ttl_min)
        self.now = now or (lambda: datetime.now(timezone.utc))
        self._data: dict[str, tuple[datetime, list[dict]]] = {}
        self._lock = threading.Lock()

    def events(self) -> tuple[list[dict], datetime | None, bool]:
        at, stale, newest = self.now(), False, None
        merged: dict[str, dict] = {}
        for url in self.urls:
            with self._lock:
                hit = self._data.get(url)
            if not hit or at - hit[0] >= self.ttl:
                try:
                    items = normalize(self.fetch(url))
                    hit = (at, items)
                    with self._lock:
                        self._data[url] = hit
                except Exception as exc:  # noqa: BLE001 - Quelle nicht erreichbar: alten Stand weiter nutzen
                    log.warning("News-Quelle nicht erreichbar (%s): %s", url, type(exc).__name__)
                    stale = True
            if hit:
                newest = hit[0] if newest is None or hit[0] > newest else newest
                for e in hit[1]:
                    merged[f"{e['time']}|{e['currency']}|{e['title']}"] = e
        return sorted(merged.values(), key=lambda e: (e["time"], e["currency"], e["title"])), newest, stale


def make_router(auth: Callable, cache: NewsCache | None = None) -> APIRouter:
    router = APIRouter()
    store = cache or NewsCache(feed_urls_from_env(), ttl_min=float(os.environ.get("NEWS_CACHE_MIN", "30") or 30))

    @router.get("/api/news", dependencies=[Depends(auth)])
    def news():
        events, updated, stale = store.events()
        return {
            "events": events,
            "updated_at": updated.isoformat().replace("+00:00", "Z") if updated else None,
            "stale": stale or updated is None,
            "source": "ForexFactory-Wirtschaftskalender",
        }

    return router
