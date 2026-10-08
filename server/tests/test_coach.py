"""Tests für Coach Mode: Schlüssel, Gruppen, Beitritt, Rechte-Trennung, Kurz-Stats, Journal, Mentor-Notizen, Austritt, Bilder."""

from __future__ import annotations

import base64
import importlib
import sys
from datetime import date, timedelta
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[2]

MENTOR_KEY = "mentor-key-0123456789abcdef"
ANNA_KEY = "anna-key-0123456789abcdef"
BEN_KEY = "ben-key-00123456789abcdef"
OTHER_MENTOR_KEY = "other-mentor-0123456789abcdef"


@pytest.fixture()
def coach(tmp_path, monkeypatch):
    monkeypatch.setenv("MENTOR_PROMPT_FILE", str(ROOT / "docs" / "mentor-systemprompt.md"))
    monkeypatch.setenv("MENTOR_DB", str(tmp_path / "mentor.sqlite"))
    monkeypatch.setenv("MENTOR_APP_TOKEN", "geheim")
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-key")
    sys.path.insert(0, str(ROOT))
    import server.coach as coach_mod
    import server.mentor_server as mod

    coach_mod = importlib.reload(coach_mod)
    mod = importlib.reload(mod)
    client = TestClient(mod.app)
    client.headers.update({"Authorization": "Bearer geheim"})
    return mod, coach_mod, client


def as_(key: str) -> dict:
    return {"X-Coach-Key": key}


def make_group(client, name="Kurs Herbst 2026", key=MENTOR_KEY) -> dict:
    client.post("/api/coach/me", json={"name": "Coach Max"}, headers=as_(key))
    r = client.post("/api/coach/groups", json={"name": name}, headers=as_(key))
    assert r.status_code == 200, r.text
    return r.json()["group"]


def join(client, token, key, name, since=None) -> dict:
    r = client.post(f"/api/coach/invite/{token}/join", json={"name": name, "since": since}, headers=as_(key))
    assert r.status_code == 200, r.text
    return r.json()


def day(d: date, n=1, wins=1, losses=0, be=0, win_r=2.0, loss_r=0.0, pnl_pct=0.5) -> dict:
    return {
        "date": d.isoformat(), "n": n, "wins": wins, "losses": losses, "be": be, "win_r": win_r, "loss_r": loss_r,
        "win_n_r": wins, "loss_n_r": losses, "pnl_r": win_r + loss_r, "pnl_pct": pnl_pct,
    }


def entry(eid: str, d: date, title="Tag", text="Ruhig gehandelt.") -> dict:
    at = f"{d.isoformat()}T18:00:00+00:00"
    return {"id": eid, "title": title, "content": '{"ops":[{"insert":"' + text + '\\n"}]}', "date_key": d.isoformat(), "created_at": at, "updated_at": at}


# ---------------------------------------------------------------- Zugang
def test_key_and_app_token_are_required(coach):
    _, _, client = coach
    r = client.post("/api/coach/me", json={"name": "x"})
    assert r.status_code == 401 and r.json()["detail"]["error"] == "key"
    r = client.post("/api/coach/me", json={"name": "x"}, headers={"X-Coach-Key": "kurz"})
    assert r.status_code == 401
    bare = TestClient(coach[0].app)
    r = bare.post("/api/coach/me", json={"name": "x"}, headers=as_(MENTOR_KEY))
    assert r.status_code == 401 and r.json()["detail"]["error"] == "auth"


def test_me_creates_a_stable_user_and_health_announces_coach(coach):
    _, _, client = coach
    a = client.post("/api/coach/me", json={"name": "Anna"}, headers=as_(ANNA_KEY)).json()
    b = client.post("/api/coach/me", json={"name": ""}, headers=as_(ANNA_KEY)).json()
    assert a["user"]["id"] == b["user"]["id"] and b["user"]["name"] == "Anna" and a["groups"] == [] and a["own"] == []
    assert client.get("/api/mentor/health").json()["coach"] is True


def test_there_is_no_endpoint_for_trades_balances_or_playbooks(coach):
    mod, _, _ = coach
    paths = [getattr(r, "path", "") for r in mod.app.routes]
    assert not any("trade" in p or "account" in p or "playbook" in p or "strateg" in p for p in paths)


# ---------------------------------------------------------------- Gruppe und Beitritt
def test_invite_preview_join_and_lists(coach):
    _, _, client = coach
    g = make_group(client)
    assert g["invite_token"] and g["members"] == 0
    r = client.get(f"/api/coach/invite/{g['invite_token']}", headers=as_(ANNA_KEY))
    assert r.status_code == 200 and r.json() == {"group": {"id": g["id"], "name": "Kurs Herbst 2026"}, "mentor": "Coach Max", "mentors": ["Coach Max"], "own": False, "member": False}
    out = join(client, g["invite_token"], ANNA_KEY, "Anna", since=None)
    assert out["membership"]["group_name"] == "Kurs Herbst 2026" and out["membership"]["mentor_name"] == "Coach Max" and out["groups"][0]["group_id"] == g["id"]
    assert client.get(f"/api/coach/invite/{g['invite_token']}", headers=as_(ANNA_KEY)).json()["member"] is True
    # Mentor sieht sie, mit Namen; Gruppe zählt ein Mitglied
    rows = client.get(f"/api/coach/groups/{g['id']}/students", headers=as_(MENTOR_KEY)).json()
    assert [s["name"] for s in rows["students"]] == ["Anna"] and rows["group"]["invite_token"] == g["invite_token"]
    assert client.get("/api/coach/groups", headers=as_(MENTOR_KEY)).json()["groups"][0]["members"] == 1
    # Ungültiger Link, eigener Link
    assert client.get("/api/coach/invite/nope", headers=as_(ANNA_KEY)).status_code == 404
    r = client.post(f"/api/coach/invite/{g['invite_token']}/join", json={"name": "Max"}, headers=as_(MENTOR_KEY))
    assert r.status_code == 409 and r.json()["detail"]["error"] == "own"
    # since muss ein Datum sein
    r = client.post(f"/api/coach/invite/{g['invite_token']}/join", json={"name": "Anna", "since": "gestern"}, headers=as_(ANNA_KEY))
    assert r.status_code == 422


def test_rename_rotate_and_archive(coach):
    mod, _, client = coach
    g = make_group(client)
    join(client, g["invite_token"], ANNA_KEY, "Anna")
    assert client.patch(f"/api/coach/groups/{g['id']}", json={"name": "  Kurs   Winter "}, headers=as_(MENTOR_KEY)).json()["group"]["name"] == "Kurs Winter"
    new_token = client.post(f"/api/coach/groups/{g['id']}/invite/rotate", headers=as_(MENTOR_KEY)).json()["invite_token"]
    assert new_token != g["invite_token"] and client.get(f"/api/coach/invite/{g['invite_token']}", headers=as_(BEN_KEY)).status_code == 404
    client.put("/api/coach/sync", json={"entries": [entry("e1", date.today())], "days": [day(date.today())]}, headers=as_(ANNA_KEY))
    r = client.delete(f"/api/coach/groups/{g['id']}", headers=as_(MENTOR_KEY))
    assert r.json() == {"ok": True, "removed_members": 1}
    assert client.get("/api/coach/groups", headers=as_(MENTOR_KEY)).json()["groups"] == []
    assert client.post("/api/coach/me", json={}, headers=as_(ANNA_KEY)).json()["groups"] == []
    # Daten der Schülerin sind weg, weil sie in keiner Gruppe mehr ist
    anna = mod.app.state.coach.user_for_key(ANNA_KEY)
    assert mod.app.state.coach.entries_of(anna["id"], None) == [] and mod.app.state.coach.days_of(anna["id"], None) == []


# ---------------------------------------------------------------- Rechte-Trennung
def test_students_never_see_each_other_and_mentor_routes_need_the_owner(coach):
    _, _, client = coach
    g = make_group(client)
    join(client, g["invite_token"], ANNA_KEY, "Anna")
    join(client, g["invite_token"], BEN_KEY, "Ben")
    client.put("/api/coach/sync", json={"entries": [entry("a1", date.today())], "days": []}, headers=as_(ANNA_KEY))
    anna_id = client.post("/api/coach/me", json={}, headers=as_(ANNA_KEY)).json()["user"]["id"]
    # Ben (Schüler) kann weder die Liste noch Annas Journal lesen, auch nicht über die Gruppe, in der er selbst ist
    assert client.get(f"/api/coach/groups/{g['id']}/students", headers=as_(BEN_KEY)).status_code == 404
    assert client.get(f"/api/coach/groups/{g['id']}/students/{anna_id}/journal", headers=as_(BEN_KEY)).status_code == 404
    assert client.post(f"/api/coach/groups/{g['id']}/students/{anna_id}/notes", json={"entry_id": "a1", "text": "hi"}, headers=as_(BEN_KEY)).status_code == 404
    # Ein anderer Mentor kommt an fremde Gruppen nicht heran
    make_group(client, "Fremd", key=OTHER_MENTOR_KEY)
    assert client.get(f"/api/coach/groups/{g['id']}/students", headers=as_(OTHER_MENTOR_KEY)).status_code == 404
    assert client.delete(f"/api/coach/groups/{g['id']}", headers=as_(OTHER_MENTOR_KEY)).status_code == 404
    # Der Mentor sieht beide, aber nur Kurz-Stats und Journal
    rows = client.get(f"/api/coach/groups/{g['id']}/students", headers=as_(MENTOR_KEY)).json()["students"]
    assert sorted(s["name"] for s in rows) == ["Anna", "Ben"]
    assert set(rows[0]) == {"user_id", "name", "joined_at", "since", "stats", "last_entry_key", "entries", "new", "entries_in_period", "new_replies", "tasks", "open_tasks"}
    # Ohne Mitgliedschaft wird nichts hochgeladen
    assert client.put("/api/coach/sync", json={"entries": [], "days": []}, headers=as_(OTHER_MENTOR_KEY)).status_code == 403


# ---------------------------------------------------------------- Kurz-Stats
def test_dashboard_stats_by_period_without_money(coach):
    _, coach_mod, client = coach
    g = make_group(client)
    join(client, g["invite_token"], ANNA_KEY, "Anna")
    today = date.today()
    monday = today - timedelta(days=today.weekday())
    first = today.replace(day=1)
    old = first - timedelta(days=40)
    days = [
        day(old, n=3, wins=1, losses=2, win_r=1.5, loss_r=-2.0, pnl_pct=-0.4),           # nur „gesamt“
        day(first, n=2, wins=2, losses=0, win_r=3.0, loss_r=0.0, pnl_pct=1.0),          # Monat
        day(monday, n=2, wins=0, losses=1, be=1, win_r=0.0, loss_r=-1.0, pnl_pct=-0.5),  # Woche (kann = first sein)
    ]
    # gleiche Tage zusammenlegen, falls Monatsanfang = Montag = heute
    merged: dict[str, dict] = {}
    for d in days:
        if d["date"] in merged:
            m = merged[d["date"]]
            for k in ("n", "wins", "losses", "be", "win_r", "loss_r", "win_n_r", "loss_n_r", "pnl_r", "pnl_pct"):
                m[k] += d[k]
        else:
            merged[d["date"]] = dict(d)
    r = client.put("/api/coach/sync", json={"entries": [entry("e1", today)], "days": list(merged.values())}, headers=as_(ANNA_KEY))
    assert r.status_code == 200 and r.json()["stored"]["days"] == len(merged)

    def stats(period):
        r = client.get(f"/api/coach/groups/{g['id']}/students", params={"period": period}, headers=as_(MENTOR_KEY))
        assert r.status_code == 200, r.text
        return r.json()["students"][0]["stats"]

    total = stats("all")
    assert total["n"] == 7 and total["wins"] == 3 and total["losses"] == 3 and total["be"] == 1
    assert total["win_rate"] == pytest.approx(3 / 7) and total["pf"] == pytest.approx(4.5 / 3.0)
    assert total["avg_win_r"] == pytest.approx(1.5) and total["avg_loss_r"] == pytest.approx(-1.0)
    assert total["max_dd_r"] == pytest.approx(1.0) and total["max_dd_pct"] == pytest.approx(0.5)
    assert "sum_r" in total and not any(k.endswith("money") or "eur" in k or "usd" in k for k in total)
    month = stats("month")
    assert month["n"] == 4 and month["losses"] == 1
    assert client.get(f"/api/coach/groups/{g['id']}/students", params={"period": "jahr"}, headers=as_(MENTOR_KEY)).status_code == 422
    # Nur R und Prozent: reine Funktion ohne Geldfelder, leere Liste gibt None statt Division durch 0
    empty = coach_mod.summarize([])
    assert empty["n"] == 0 and empty["win_rate"] is None and empty["pf"] == 0.0 and empty["max_dd_r"] is None


def test_since_limits_entries_and_days_on_both_sides(coach):
    _, _, client = coach
    g = make_group(client)
    today = date.today()
    join(client, g["invite_token"], ANNA_KEY, "Anna", since=today.isoformat())
    old = today - timedelta(days=10)
    r = client.put("/api/coach/sync", json={"entries": [entry("old", old), entry("new", today)], "days": [day(old, n=5, wins=5, win_r=5.0), day(today)]}, headers=as_(ANNA_KEY))
    assert r.json()["stored"] == {"entries": 1, "days": 1}  # Älteres kommt gar nicht erst auf den Server
    rows = client.get(f"/api/coach/groups/{g['id']}/students", params={"period": "all"}, headers=as_(MENTOR_KEY)).json()["students"]
    assert rows[0]["stats"]["n"] == 1 and rows[0]["entries"] == 1 and rows[0]["since"] == today.isoformat()
    anna_id = rows[0]["user_id"]
    j = client.get(f"/api/coach/groups/{g['id']}/students/{anna_id}/journal", headers=as_(MENTOR_KEY)).json()
    assert [e["id"] for e in j["entries"]] == ["new"]


# ---------------------------------------------------------------- Journal, Neu-Markierung, Notizen
def test_journal_marks_new_entries_and_notes_round_trip(coach):
    _, _, client = coach
    g = make_group(client)
    join(client, g["invite_token"], ANNA_KEY, "Anna")
    today = date.today()
    client.put("/api/coach/sync", json={"entries": [entry("e1", today - timedelta(days=1), "Gestern"), entry("e2", today, "Heute")], "days": []}, headers=as_(ANNA_KEY))
    row = client.get(f"/api/coach/groups/{g['id']}/students", headers=as_(MENTOR_KEY)).json()["students"][0]
    assert row["new"] == 2 and row["entries"] == 2 and row["last_entry_key"] == today.isoformat()
    anna_id = row["user_id"]
    j = client.get(f"/api/coach/groups/{g['id']}/students/{anna_id}/journal", headers=as_(MENTOR_KEY)).json()
    assert j["student"]["name"] == "Anna" and [e["id"] for e in j["entries"]] == ["e2", "e1"] and all(e["is_new"] for e in j["entries"]) and j["notes"] == []
    # Gelesen: beim nächsten Mal nichts Neues, bis ein Eintrag sich ändert
    assert client.get(f"/api/coach/groups/{g['id']}/students", headers=as_(MENTOR_KEY)).json()["students"][0]["new"] == 0
    e2 = entry("e2", today, "Heute, ergänzt"); e2["updated_at"] = "2999-01-01T00:00:00+00:00"
    client.put("/api/coach/sync", json={"entries": [entry("e1", today - timedelta(days=1), "Gestern"), e2], "days": []}, headers=as_(ANNA_KEY))
    assert client.get(f"/api/coach/groups/{g['id']}/students", headers=as_(MENTOR_KEY)).json()["students"][0]["new"] == 1
    # Mentor schreibt an e2; Schülerin bekommt sie mit Badge-Daten (Name, Gruppe, Zeit)
    r = client.post(f"/api/coach/groups/{g['id']}/students/{anna_id}/notes", json={"entry_id": "e2", "text": "  Gute Beobachtung. Warum erst 11 Uhr? "}, headers=as_(MENTOR_KEY))
    assert r.status_code == 200, r.text
    note = r.json()["note"]
    assert note["text"] == "Gute Beobachtung. Warum erst 11 Uhr?" and note["mentor_name"] == "Coach Max" and note["group_name"] == "Kurs Herbst 2026" and note["entry_id"] == "e2"
    assert client.post(f"/api/coach/groups/{g['id']}/students/{anna_id}/notes", json={"entry_id": "fehlt", "text": "x"}, headers=as_(MENTOR_KEY)).status_code == 404
    mine = client.get("/api/coach/notes", headers=as_(ANNA_KEY)).json()["notes"]
    assert len(mine) == 1 and mine[0]["id"] == note["id"] and mine[0]["deleted_at"] is None
    assert client.put("/api/coach/sync", json={"entries": [], "days": []}, headers=as_(ANNA_KEY)).json()["notes"][0]["id"] == note["id"]
    # Schülerin kann die Notiz nicht ändern oder löschen; ein anderer Mentor auch nicht
    assert client.patch(f"/api/coach/notes/{note['id']}", json={"text": "doch"}, headers=as_(ANNA_KEY)).status_code == 404
    assert client.delete(f"/api/coach/notes/{note['id']}", headers=as_(ANNA_KEY)).status_code == 404
    assert client.patch(f"/api/coach/notes/{note['id']}", json={"text": "doch"}, headers=as_(OTHER_MENTOR_KEY)).status_code == 404
    # Mentor bearbeitet und löscht; gelöscht bleibt als Markierung sichtbar, damit die Website sie entfernt
    assert client.patch(f"/api/coach/notes/{note['id']}", json={"text": "Neu formuliert"}, headers=as_(MENTOR_KEY)).json()["note"]["text"] == "Neu formuliert"
    assert client.get(f"/api/coach/groups/{g['id']}/students/{anna_id}/journal", headers=as_(MENTOR_KEY)).json()["notes"][0]["text"] == "Neu formuliert"
    assert client.delete(f"/api/coach/notes/{note['id']}", headers=as_(MENTOR_KEY)).json() == {"ok": True}
    assert client.get(f"/api/coach/groups/{g['id']}/students/{anna_id}/journal", headers=as_(MENTOR_KEY)).json()["notes"] == []
    gone = client.get("/api/coach/notes", headers=as_(ANNA_KEY)).json()["notes"]
    assert len(gone) == 1 and gone[0]["deleted_at"]


def test_leaving_removes_access_and_data(coach):
    mod, _, client = coach
    g = make_group(client)
    join(client, g["invite_token"], ANNA_KEY, "Anna")
    today = date.today()
    client.put("/api/coach/sync", json={"entries": [entry("e1", today)], "days": [day(today)]}, headers=as_(ANNA_KEY))
    anna_id = client.get(f"/api/coach/groups/{g['id']}/students", headers=as_(MENTOR_KEY)).json()["students"][0]["user_id"]
    client.post(f"/api/coach/groups/{g['id']}/students/{anna_id}/notes", json={"entry_id": "e1", "text": "Merk dir das."}, headers=as_(MENTOR_KEY))
    r = client.post(f"/api/coach/groups/{g['id']}/leave", headers=as_(ANNA_KEY))
    assert r.status_code == 200 and r.json()["groups"] == []
    assert client.post(f"/api/coach/groups/{g['id']}/leave", headers=as_(ANNA_KEY)).status_code == 404
    assert client.get(f"/api/coach/groups/{g['id']}/students", headers=as_(MENTOR_KEY)).json()["students"] == []
    assert client.get(f"/api/coach/groups/{g['id']}/students/{anna_id}/journal", headers=as_(MENTOR_KEY)).status_code == 404
    assert client.post(f"/api/coach/groups/{g['id']}/students/{anna_id}/notes", json={"entry_id": "e1", "text": "x"}, headers=as_(MENTOR_KEY)).status_code == 404
    store = mod.app.state.coach
    assert store.entries_of(anna_id, None) == [] and store.days_of(anna_id, None) == []
    # Vom Server kommen keine Notizen der verlassenen Gruppe mehr (die Website behält ihre Kopie)
    assert client.get("/api/coach/notes", headers=as_(ANNA_KEY)).json()["notes"] == []
    # Wiederbeitritt ist möglich und beginnt sauber
    out = join(client, g["invite_token"], ANNA_KEY, "Anna", since=today.isoformat())
    assert out["membership"]["since"] == today.isoformat()
    assert client.get(f"/api/coach/groups/{g['id']}/students", headers=as_(MENTOR_KEY)).json()["students"][0]["entries"] == 0


def test_student_in_two_groups_uploads_once_and_each_mentor_sees_only_from_their_since(coach):
    _, _, client = coach
    g1 = make_group(client, "Eins")
    g2 = make_group(client, "Zwei", key=OTHER_MENTOR_KEY)
    today = date.today()
    old = today - timedelta(days=5)
    join(client, g1["invite_token"], ANNA_KEY, "Anna")
    join(client, g2["invite_token"], ANNA_KEY, "Anna B.", since=today.isoformat())
    r = client.put("/api/coach/sync", json={"entries": [entry("old", old), entry("new", today)], "days": [day(old), day(today)]}, headers=as_(ANNA_KEY))
    assert r.json()["stored"] == {"entries": 2, "days": 2}
    one = client.get(f"/api/coach/groups/{g1['id']}/students", params={"period": "all"}, headers=as_(MENTOR_KEY)).json()["students"][0]
    two = client.get(f"/api/coach/groups/{g2['id']}/students", params={"period": "all"}, headers=as_(OTHER_MENTOR_KEY)).json()["students"][0]
    assert one["entries"] == 2 and one["stats"]["n"] == 2 and one["name"] == "Anna"
    assert two["entries"] == 1 and two["stats"]["n"] == 1 and two["name"] == "Anna B."
    # Austritt aus einer Gruppe löscht nichts, solange die andere bleibt
    client.post(f"/api/coach/groups/{g2['id']}/leave", headers=as_(ANNA_KEY))
    assert client.get(f"/api/coach/groups/{g1['id']}/students", params={"period": "all"}, headers=as_(MENTOR_KEY)).json()["students"][0]["entries"] == 2


# ---------------------------------------------------------------- Bilder und Migration
def test_assets_upload_and_public_fetch_with_limits(coach):
    _, coach_mod, client = coach
    g = make_group(client)
    png = base64.b64encode(b"\x89PNG\r\n\x1a\n" + b"0" * 100).decode()
    assert client.post("/api/coach/assets", json={"mime": "image/png", "data": png}, headers=as_(ANNA_KEY)).status_code == 403
    join(client, g["invite_token"], ANNA_KEY, "Anna")
    r = client.post("/api/coach/assets", json={"mime": "image/png", "data": png}, headers=as_(ANNA_KEY))
    assert r.status_code == 200 and r.json()["url"] == "/api/coach/assets/" + r.json()["id"] and len(r.json()["id"]) == 32
    bare = TestClient(coach[0].app)
    got = bare.get(r.json()["url"])
    assert got.status_code == 200 and got.headers["content-type"].startswith("image/png") and got.content.startswith(b"\x89PNG")
    assert bare.get("/api/coach/assets/" + "0" * 32).status_code == 404
    assert client.post("/api/coach/assets", json={"mime": "text/html", "data": png}, headers=as_(ANNA_KEY)).status_code == 422
    assert client.post("/api/coach/assets", json={"mime": "image/png", "data": "!!!"}, headers=as_(ANNA_KEY)).status_code == 422
    big = base64.b64encode(b"x" * (coach_mod.ASSET_MAX_BYTES + 1)).decode()
    assert client.post("/api/coach/assets", json={"mime": "image/png", "data": big}, headers=as_(ANNA_KEY)).status_code == 413


def test_migration_is_idempotent_and_keeps_data(tmp_path):
    sys.path.insert(0, str(ROOT))
    from server.coach import CoachStore

    s1 = CoachStore(tmp_path / "c.sqlite")
    u = s1.user_for_key("x" * 20, "Flo")
    s2 = CoachStore(tmp_path / "c.sqlite")
    assert s2.migrate() == len(CoachStore.MIGRATIONS)
    assert s2.user_for_key("x" * 20)["id"] == u["id"] and s2.user_name(u["id"]) == "Flo"


# ================================================================ Phase 2 und 3
LISA_KEY = "lisa-cocoach-0123456789abcdef"


def setup_group_with_anna(client, today=None):
    today = today or date.today()
    g = make_group(client)
    join(client, g["invite_token"], ANNA_KEY, "Anna")
    client.put("/api/coach/sync", json={"entries": [entry("e1", today, "Heute")], "days": [day(today)]}, headers=as_(ANNA_KEY))
    anna_id = client.get(f"/api/coach/groups/{g['id']}/students", headers=as_(MENTOR_KEY)).json()["students"][0]["user_id"]
    note = client.post(f"/api/coach/groups/{g['id']}/students/{anna_id}/notes", json={"entry_id": "e1", "text": "Warum so früh raus?"}, headers=as_(MENTOR_KEY)).json()["note"]
    return g, anna_id, note


def test_replies_thread_between_student_and_mentor(coach):
    _, _, client = coach
    g, anna_id, note = setup_group_with_anna(client)
    r = client.post(f"/api/coach/notes/{note['id']}/replies", json={"text": "  Angst vor dem Gap. "}, headers=as_(ANNA_KEY))
    assert r.status_code == 200, r.text
    rep = r.json()["reply"]
    assert rep["role"] == "student" and rep["text"] == "Angst vor dem Gap." and rep["author_name"] == "Anna"
    # Mentor sieht die Antwort als neu, in der Tabelle und im Journal
    row = client.get(f"/api/coach/groups/{g['id']}/students", headers=as_(MENTOR_KEY)).json()["students"][0]
    assert row["new_replies"] == 1
    j = client.get(f"/api/coach/groups/{g['id']}/students/{anna_id}/journal", headers=as_(MENTOR_KEY)).json()
    assert j["notes"][0]["replies"][0]["is_new"] is True and j["notes"][0]["replies"][0]["text"] == "Angst vor dem Gap."
    assert client.get(f"/api/coach/groups/{g['id']}/students", headers=as_(MENTOR_KEY)).json()["students"][0]["new_replies"] == 0
    # Mentor antwortet zurück; Schülerin bekommt beides im Abgleich
    m = client.post(f"/api/coach/notes/{note['id']}/replies", json={"text": "Dann Stopp enger setzen."}, headers=as_(MENTOR_KEY)).json()["reply"]
    assert m["role"] == "mentor" and m["author_name"] == "Coach Max"
    inbox = client.get("/api/coach/notes", headers=as_(ANNA_KEY)).json()
    assert [x["role"] for x in inbox["notes"][0]["replies"]] == ["student", "mentor"]
    # Fremde dürfen nicht antworten, niemand löscht fremde Antworten
    assert client.post(f"/api/coach/notes/{note['id']}/replies", json={"text": "hi"}, headers=as_(BEN_KEY)).status_code == 404
    join(client, g["invite_token"], BEN_KEY, "Ben")
    assert client.post(f"/api/coach/notes/{note['id']}/replies", json={"text": "hi"}, headers=as_(BEN_KEY)).status_code == 404  # Mitschüler
    assert client.delete(f"/api/coach/replies/{m['id']}", headers=as_(ANNA_KEY)).status_code == 404
    assert client.delete(f"/api/coach/replies/{rep['id']}", headers=as_(ANNA_KEY)).json() == {"ok": True}
    after = client.get("/api/coach/notes", headers=as_(ANNA_KEY)).json()["notes"][0]["replies"]
    assert [x["deleted_at"] is not None for x in after] == [True, False]  # gelöscht bleibt als Markierung, damit die Website sie entfernt
    assert client.post(f"/api/coach/notes/{note['id']}/replies", json={"text": "   "}, headers=as_(ANNA_KEY)).status_code == 422


def test_email_notifications_only_with_consent_and_with_daily_limit(coach):
    mod, coach_mod, client = coach
    sent: list[tuple[str, str, str]] = []
    mod.app.state.coach_mailer = lambda to, subject, body: sent.append((to, subject, body))
    g, anna_id, note = setup_group_with_anna(client)
    assert sent == []  # keine Einwilligung, keine Mail
    r = client.put("/api/coach/notify", json={"email": "anna@example.com", "notify_email": True}, headers=as_(ANNA_KEY))
    assert r.json() == {"ok": True, "email": "anna@example.com", "notify_email": True, "mail": True}
    assert client.put("/api/coach/notify", json={"email": "keine-adresse", "notify_email": True}, headers=as_(ANNA_KEY)).status_code == 422
    assert client.put("/api/coach/notify", json={"email": "", "notify_email": True}, headers=as_(ANNA_KEY)).status_code == 422
    assert client.post("/api/coach/me", json={}, headers=as_(ANNA_KEY)).json()["user"]["email"] == "anna@example.com"
    client.post(f"/api/coach/groups/{g['id']}/students/{anna_id}/notes", json={"entry_id": "e1", "text": "Gut gemacht."}, headers=as_(MENTOR_KEY))
    client.post(f"/api/coach/notes/{note['id']}/replies", json={"text": "Noch eine Frage dazu."}, headers=as_(MENTOR_KEY))
    client.post(f"/api/coach/groups/{g['id']}/tasks", json={"text": "Max. 3 Trades pro Tag", "student_id": anna_id, "due": "2026-12-31"}, headers=as_(MENTOR_KEY))
    assert [x[0] for x in sent] == ["anna@example.com"] * 3
    assert sent[0][1] == "Neue Notiz von Coach Max – Kurs Herbst 2026" and "Gut gemacht." in sent[0][2]
    assert sent[1][1].startswith("Neue Antwort von Coach Max") and sent[2][1].startswith("Neue Aufgabe von Coach Max") and "Bis: 2026-12-31" in sent[2][2]
    # Mentor ohne Einwilligung bekommt keine Mail für Antworten der Schülerin
    client.post(f"/api/coach/notes/{note['id']}/replies", json={"text": "Danke!"}, headers=as_(ANNA_KEY))
    assert len(sent) == 3
    # Ausgeschaltet: keine Mail mehr
    client.put("/api/coach/notify", json={"email": "anna@example.com", "notify_email": False}, headers=as_(ANNA_KEY))
    client.post(f"/api/coach/groups/{g['id']}/students/{anna_id}/notes", json={"entry_id": "e1", "text": "Still"}, headers=as_(MENTOR_KEY))
    assert len(sent) == 3
    # Tageslimit, und ein kaputter Versand stört die Anfrage nicht
    client.put("/api/coach/notify", json={"email": "anna@example.com", "notify_email": True}, headers=as_(ANNA_KEY))
    store = mod.app.state.coach
    for _ in range(30):
        store.mail_reserve(anna_id, store.today().isoformat(), 10_000)
    client.post(f"/api/coach/groups/{g['id']}/students/{anna_id}/notes", json={"entry_id": "e1", "text": "über dem Limit"}, headers=as_(MENTOR_KEY))
    assert len(sent) == 3

    def broken(to, subject, body):
        raise OSError("SMTP weg")

    mod.app.state.coach_mailer = broken
    store.set_notify(anna_id, "anna@example.com", True)
    with store.lock, store._conn() as c:
        c.execute("DELETE FROM coach_mail_usage")
    r = client.post(f"/api/coach/groups/{g['id']}/students/{anna_id}/notes", json={"entry_id": "e1", "text": "trotzdem gespeichert"}, headers=as_(MENTOR_KEY))
    assert r.status_code == 200
    # Ohne Versand auf dem Server: health sagt es, Einstellung wird trotzdem gespeichert
    mod.app.state.coach_mailer = None
    assert client.put("/api/coach/notify", json={"email": "anna@example.com", "notify_email": True}, headers=as_(ANNA_KEY)).json()["mail"] is False
    # Text der Mail enthält keine Zahlen über Trades oder Konten, nur die Notiz
    subject, body = coach_mod.mail_text("note", author="Max", group="G", text="T", app_url="https://j.example")
    assert body.endswith("Du findest sie im Notebook unter dem Eintrag.") and "https://j.example" in body


def test_smtp_mailer_from_env(coach, monkeypatch):
    _, coach_mod, _ = coach
    assert coach_mod.smtp_mailer_from_env({}) is None
    calls = []

    class FakeSMTP:
        def __init__(self, host, port, timeout=0):
            calls.append(("connect", host, port))

        def __enter__(self):
            return self

        def __exit__(self, *a):
            return False

        def starttls(self):
            calls.append(("starttls",))

        def login(self, u, p):
            calls.append(("login", u))

        def send_message(self, msg):
            calls.append(("send", msg["To"], msg["Subject"], msg["From"]))

    import smtplib
    monkeypatch.setattr(smtplib, "SMTP", FakeSMTP)
    send = coach_mod.smtp_mailer_from_env({"COACH_SMTP_HOST": "smtp.example.com", "COACH_SMTP_USER": "bot@example.com", "COACH_SMTP_PASS": "x", "COACH_SMTP_FROM": "Journalyst <bot@example.com>"})
    send("anna@example.com", "Betreff", "Text")
    assert calls == [("connect", "smtp.example.com", 587), ("starttls",), ("login", "bot@example.com"), ("send", "anna@example.com", "Betreff", "Journalyst <bot@example.com>")]
    calls.clear()
    coach_mod.smtp_mailer_from_env({"COACH_SMTP_HOST": "127.0.0.1", "COACH_SMTP_PORT": "1025", "COACH_SMTP_STARTTLS": "0", "COACH_SMTP_FROM": "j@example.com"})("a@example.com", "B", "T")
    assert calls == [("connect", "127.0.0.1", 1025), ("send", "a@example.com", "B", "j@example.com")]


def test_co_coach_sees_group_but_cannot_manage_it(coach):
    _, _, client = coach
    g, anna_id, note = setup_group_with_anna(client)
    info = client.get(f"/api/coach/groups/{g['id']}/coaches", headers=as_(MENTOR_KEY)).json()
    token = info["coach_token"]
    assert info["role"] == "owner" and info["coaches"] == [] and token and token != g["invite_token"]
    # Vorschau, Beitritt als Co-Coach
    prev = client.get(f"/api/coach/coach-invite/{token}", headers=as_(LISA_KEY)).json()
    assert prev == {"group": {"id": g["id"], "name": "Kurs Herbst 2026"}, "owner": "Coach Max", "own": False, "coach": False, "member": False, "students": 1}
    r = client.post(f"/api/coach/coach-invite/{token}/join", json={"name": "Lisa"}, headers=as_(LISA_KEY))
    assert r.status_code == 200 and r.json()["coached"][0]["id"] == g["id"] and r.json()["coached"][0]["owner_name"] == "Coach Max"
    # Der Schüler sieht jetzt beide Mentoren
    assert client.post("/api/coach/me", json={}, headers=as_(ANNA_KEY)).json()["groups"][0]["mentors"] == ["Coach Max", "Lisa"]
    # Lisa sieht Schüler, Journal, schreibt Notizen, Antworten und Aufgaben
    rows = client.get(f"/api/coach/groups/{g['id']}/students", headers=as_(LISA_KEY)).json()
    assert rows["group"]["role"] == "coach" and "invite_token" not in rows["group"] and rows["students"][0]["name"] == "Anna" and rows["group"]["coaches"] == ["Lisa"]
    assert client.get(f"/api/coach/groups/{g['id']}/students/{anna_id}/journal", headers=as_(LISA_KEY)).status_code == 200
    n2 = client.post(f"/api/coach/groups/{g['id']}/students/{anna_id}/notes", json={"entry_id": "e1", "text": "Von Lisa"}, headers=as_(LISA_KEY)).json()["note"]
    assert n2["mentor_name"] == "Lisa"
    assert client.post(f"/api/coach/notes/{note['id']}/replies", json={"text": "Ergänzung von Lisa"}, headers=as_(LISA_KEY)).json()["reply"]["role"] == "mentor"
    # Fremde Notizen nicht bearbeiten; verwalten darf nur der Besitzer
    assert client.patch(f"/api/coach/notes/{note['id']}", json={"text": "x"}, headers=as_(LISA_KEY)).status_code == 404
    for method, path in [("patch", f"/api/coach/groups/{g['id']}"), ("post", f"/api/coach/groups/{g['id']}/invite/rotate"), ("delete", f"/api/coach/groups/{g['id']}"), ("post", f"/api/coach/groups/{g['id']}/coach-invite/rotate")]:
        kw = {"json": {"name": "x"}} if method == "patch" else {}
        assert getattr(client, method)(path, headers=as_(LISA_KEY), **kw).status_code == 404, path
    assert "coach_token" not in client.get(f"/api/coach/groups/{g['id']}/coaches", headers=as_(LISA_KEY)).json()
    # Schüler kann nicht Co-Coach werden (er würde die anderen sehen) und Co-Coach nicht Schüler
    assert client.post(f"/api/coach/coach-invite/{token}/join", json={"name": "Anna"}, headers=as_(ANNA_KEY)).status_code == 409
    assert client.post(f"/api/coach/invite/{g['invite_token']}/join", json={"name": "Lisa"}, headers=as_(LISA_KEY)).status_code == 409
    assert client.post(f"/api/coach/coach-invite/{token}/join", json={"name": "Max"}, headers=as_(MENTOR_KEY)).status_code == 409
    # Neuer Co-Coach-Link: alter ungültig; Besitzer entfernt Lisa → kein Zugriff mehr
    new_token = client.post(f"/api/coach/groups/{g['id']}/coach-invite/rotate", headers=as_(MENTOR_KEY)).json()["coach_token"]
    assert new_token != token and client.get(f"/api/coach/coach-invite/{token}", headers=as_(BEN_KEY)).status_code == 404
    lisa_id = client.post("/api/coach/me", json={}, headers=as_(LISA_KEY)).json()["user"]["id"]
    assert client.delete(f"/api/coach/groups/{g['id']}/coaches/{lisa_id}", headers=as_(MENTOR_KEY)).json()["coaches"] == []
    assert client.get(f"/api/coach/groups/{g['id']}/students", headers=as_(LISA_KEY)).status_code == 404
    assert client.post("/api/coach/me", json={}, headers=as_(ANNA_KEY)).json()["groups"][0]["mentors"] == ["Coach Max"]
    # Wieder beitreten und selbst austreten; Gruppe schließen beendet auch Co-Coach-Rollen
    client.post(f"/api/coach/coach-invite/{new_token}/join", json={"name": "Lisa"}, headers=as_(LISA_KEY))
    assert client.post(f"/api/coach/groups/{g['id']}/coaches/leave", headers=as_(LISA_KEY)).json()["coached"] == []
    assert client.post(f"/api/coach/groups/{g['id']}/coaches/leave", headers=as_(LISA_KEY)).status_code == 404
    client.post(f"/api/coach/coach-invite/{new_token}/join", json={"name": "Lisa"}, headers=as_(LISA_KEY))
    client.delete(f"/api/coach/groups/{g['id']}", headers=as_(MENTOR_KEY))
    assert client.get("/api/coach/groups", headers=as_(LISA_KEY)).json()["coached"] == []


def test_tasks_for_one_or_all_students(coach):
    _, _, client = coach
    g, anna_id, _ = setup_group_with_anna(client)
    join(client, g["invite_token"], BEN_KEY, "Ben")
    ben_id = [s for s in client.get(f"/api/coach/groups/{g['id']}/students", headers=as_(MENTOR_KEY)).json()["students"] if s["name"] == "Ben"][0]["user_id"]
    one = client.post(f"/api/coach/groups/{g['id']}/tasks", json={"text": "  Diese Woche   max. 3 Trades pro Tag ", "student_id": anna_id, "due": "2026-10-11"}, headers=as_(MENTOR_KEY))
    assert one.status_code == 200 and one.json()["tasks"][0]["text"] == "Diese Woche max. 3 Trades pro Tag" and one.json()["tasks"][0]["due"] == "2026-10-11"
    allr = client.post(f"/api/coach/groups/{g['id']}/tasks", json={"text": "Jeden Abend Tagesnotiz", "all": True}, headers=as_(MENTOR_KEY)).json()["tasks"]
    assert sorted(t["student_id"] for t in allr) == sorted([anna_id, ben_id])
    assert client.post(f"/api/coach/groups/{g['id']}/tasks", json={"text": "x"}, headers=as_(MENTOR_KEY)).status_code == 422
    assert client.post(f"/api/coach/groups/{g['id']}/tasks", json={"text": "x", "student_id": "fremd"}, headers=as_(MENTOR_KEY)).status_code == 404
    assert client.post(f"/api/coach/groups/{g['id']}/tasks", json={"text": "x", "student_id": anna_id, "due": "morgen"}, headers=as_(MENTOR_KEY)).status_code == 422
    assert client.post(f"/api/coach/groups/{g['id']}/tasks", json={"text": "x", "all": True}, headers=as_(ANNA_KEY)).status_code == 404  # Schüler gibt keine Aufgaben
    # Schülerin sieht nur ihre zwei, Ben nur seine eine
    anna_tasks = client.get("/api/coach/notes", headers=as_(ANNA_KEY)).json()["tasks"]
    ben_tasks = client.get("/api/coach/notes", headers=as_(BEN_KEY)).json()["tasks"]
    assert len(anna_tasks) == 2 and len(ben_tasks) == 1 and all(t["student_id"] == anna_id for t in anna_tasks) and anna_tasks[0]["mentor_name"] == "Coach Max"
    # Erledigen nur durch die Schülerin selbst; zurücknehmen geht
    tid = one.json()["tasks"][0]["id"]
    assert client.post(f"/api/coach/tasks/{tid}/done", json={"done": True}, headers=as_(BEN_KEY)).status_code == 404
    assert client.post(f"/api/coach/tasks/{tid}/done", json={"done": True}, headers=as_(MENTOR_KEY)).status_code == 404
    assert client.post(f"/api/coach/tasks/{tid}/done", json={"done": True}, headers=as_(ANNA_KEY)).json()["task"]["done_at"]
    row = [s for s in client.get(f"/api/coach/groups/{g['id']}/students", headers=as_(MENTOR_KEY)).json()["students"] if s["name"] == "Anna"][0]
    assert row["tasks"] == 2 and row["open_tasks"] == 1
    assert client.post(f"/api/coach/tasks/{tid}/done", json={"done": False}, headers=as_(ANNA_KEY)).json()["task"]["done_at"] is None
    # Mentor sieht die Aufgaben im Journal, bearbeitet und löscht eigene
    j = client.get(f"/api/coach/groups/{g['id']}/students/{anna_id}/journal", headers=as_(MENTOR_KEY)).json()
    assert len(j["tasks"]) == 2
    assert client.patch(f"/api/coach/tasks/{tid}", json={"text": "Max. 2 Trades pro Tag", "due": ""}, headers=as_(MENTOR_KEY)).json()["task"]["due"] is None
    assert client.patch(f"/api/coach/tasks/{tid}", json={"text": "x"}, headers=as_(ANNA_KEY)).status_code == 404
    assert client.delete(f"/api/coach/tasks/{tid}", headers=as_(MENTOR_KEY)).json() == {"ok": True}
    gone = [t for t in client.get("/api/coach/notes", headers=as_(ANNA_KEY)).json()["tasks"] if t["id"] == tid][0]
    assert gone["deleted_at"]
    # Nach dem Austritt sind die Aufgaben der Gruppe weg
    client.post(f"/api/coach/groups/{g['id']}/leave", headers=as_(BEN_KEY))
    assert client.get("/api/coach/notes", headers=as_(BEN_KEY)).json()["tasks"] == []


def test_group_stats_are_averages_for_mentors_only(coach):
    _, _, client = coach
    g = make_group(client)
    today = date.today()
    join(client, g["invite_token"], ANNA_KEY, "Anna")
    join(client, g["invite_token"], BEN_KEY, "Ben")
    client.put("/api/coach/sync", json={"entries": [entry("a1", today), entry("a2", today, "Zwei")], "days": [day(today, n=4, wins=3, losses=1, win_r=6.0, loss_r=-1.0, pnl_pct=2.0)]}, headers=as_(ANNA_KEY))
    client.put("/api/coach/sync", json={"entries": [], "days": [day(today, n=2, wins=1, losses=1, win_r=1.0, loss_r=-1.0, pnl_pct=0.0)]}, headers=as_(BEN_KEY))
    out = client.get(f"/api/coach/groups/{g['id']}/students", params={"period": "all"}, headers=as_(MENTOR_KEY)).json()
    gs = out["group_stats"]
    assert gs["students"] == 2 and gs["active"] == 2 and gs["trades"] == 6 and gs["entries"] == 2 and gs["open_tasks"] == 0 and gs["notes"] == 0
    assert gs["avg_win_rate"] == pytest.approx((0.75 + 0.5) / 2) and gs["avg_pf"] == pytest.approx((6.0 + 1.0) / 2)
    assert gs["avg_win_r"] == pytest.approx((2.0 + 1.0) / 2) and gs["avg_loss_r"] == pytest.approx(-1.0)
    # Schüler kommen an die Gruppen-Statistik nicht heran
    assert client.get(f"/api/coach/groups/{g['id']}/students", headers=as_(ANNA_KEY)).status_code == 404
    # Leere Gruppe: keine Division durch null
    g2 = make_group(client, "Leer")
    gs2 = client.get(f"/api/coach/groups/{g2['id']}/students", headers=as_(MENTOR_KEY)).json()["group_stats"]
    assert gs2["students"] == 0 and gs2["avg_win_rate"] is None and gs2["trades"] == 0


def test_migration_from_version_1_keeps_data(tmp_path):
    """Eine Datenbank aus Phase 1 (Schema 1) wird auf den neuen Stand gebracht, ohne Daten zu verlieren."""
    sys.path.insert(0, str(ROOT))
    import sqlite3
    from server.coach import CoachStore

    db = tmp_path / "old.sqlite"
    c = sqlite3.connect(str(db))
    c.execute("CREATE TABLE coach_schema (version INTEGER NOT NULL)")
    c.execute("INSERT INTO coach_schema (version) VALUES (1)")
    for sql in CoachStore.MIGRATIONS[0]:
        c.execute(sql)
    c.execute("INSERT INTO coach_users (id, key_hash, name, created_at) VALUES ('u1', 'h1', 'Flo', '2026-10-01T00:00:00+00:00')")
    c.execute("INSERT INTO coach_groups (id, owner_id, name, invite_token, created_at, archived_at) VALUES ('g1', 'u1', 'Alt', 'tok', '2026-10-01T00:00:00+00:00', NULL)")
    c.commit(); c.close()
    s = CoachStore(db)
    assert s.migrate() == len(CoachStore.MIGRATIONS)
    assert s.user("u1") == {"id": "u1", "name": "Flo", "email": "", "notify_email": False}
    assert s.group("g1")["name"] == "Alt" and s.coach_token("g1") and s.coach_token("g1") == s.coach_token("g1")
    assert s.tasks_for_student("u1") == [] and s.coaches("g1") == []
