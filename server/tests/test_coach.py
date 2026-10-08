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
    assert r.status_code == 200 and r.json() == {"group": {"id": g["id"], "name": "Kurs Herbst 2026"}, "mentor": "Coach Max", "own": False, "member": False}
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
    assert set(rows[0]) == {"user_id", "name", "joined_at", "since", "stats", "last_entry_key", "entries", "new"}
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
