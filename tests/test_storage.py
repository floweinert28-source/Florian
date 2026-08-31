"""Tests fuer die SQLite-Persistenz."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest

from tasksbot.models import Priority, Status
from tasksbot.storage import TaskStore

from .conftest import ALICE, BOB, CHANNEL, GUILD, OTHER_CHANNEL


async def make(store: TaskStore, title: str = "Aufgabe", **kwargs):
    """Legt eine Aufgabe mit sinnvollen Vorgaben an."""
    kwargs.setdefault("guild_id", GUILD)
    kwargs.setdefault("channel_id", CHANNEL)
    kwargs.setdefault("creator_id", ALICE)
    return await store.create(title=title, **kwargs)


async def test_create_setzt_defaults(store: TaskStore) -> None:
    task = await make(store, "Doku schreiben")

    assert task.id > 0
    assert task.title == "Doku schreiben"
    assert task.status is Status.OPEN
    assert task.priority is Priority.NORMAL
    assert task.assignee_id is None
    assert task.created_at is not None and task.created_at.tzinfo is not None


async def test_create_mit_zustaendiger_person_startet_in_arbeit(store: TaskStore) -> None:
    """Wer direkt zugewiesen wird, arbeitet auch direkt daran."""
    task = await make(store, assignee_id=BOB)

    assert task.status is Status.DOING
    assert task.assignee_id == BOB


async def test_get_liest_alle_felder_zurueck(store: TaskStore) -> None:
    due = datetime(2026, 9, 5, 12, 0, tzinfo=timezone.utc)
    created = await make(
        store, "Mit allem", notes="Details", priority=Priority.HIGH, due_at=due, assignee_id=BOB
    )

    task = await store.get(created.id)

    assert task is not None
    assert (task.title, task.notes) == ("Mit allem", "Details")
    assert task.priority is Priority.HIGH
    assert task.due_at == due


async def test_get_unbekannte_id(store: TaskStore) -> None:
    assert await store.get(999) is None


async def test_set_status_done_merkt_wer_und_wann(store: TaskStore) -> None:
    task = await make(store)

    done = await store.set_status(task.id, Status.DONE, user_id=BOB)

    assert done is not None
    assert done.status is Status.DONE
    assert done.completed_by == BOB
    assert done.completed_at is not None


async def test_wieder_oeffnen_raeumt_erledigt_metadaten_auf(store: TaskStore) -> None:
    task = await make(store)
    await store.set_status(task.id, Status.DONE, user_id=BOB)

    reopened = await store.set_status(task.id, Status.OPEN, user_id=ALICE)

    assert reopened is not None
    assert reopened.status is Status.OPEN
    assert reopened.completed_at is None
    assert reopened.completed_by is None


async def test_update_serialisiert_datetime_und_enums(store: TaskStore) -> None:
    task = await make(store)
    due = datetime(2026, 12, 24, 18, 0, tzinfo=timezone.utc)

    updated = await store.update(task.id, due_at=due, priority=Priority.HIGH, status=Status.DOING)

    assert updated is not None
    assert updated.due_at == due
    assert updated.priority is Priority.HIGH
    assert updated.status is Status.DOING


async def test_update_unbekanntes_feld_wird_abgelehnt(store: TaskStore) -> None:
    """Schutz gegen Tippfehler - und gegen SQL-Injection ueber Feldnamen."""
    task = await make(store)

    with pytest.raises(ValueError, match="Unbekannte Felder"):
        await store.update(task.id, titel="falscher Feldname")


async def test_update_ohne_felder_ist_ein_no_op(store: TaskStore) -> None:
    task = await make(store, "Unveraendert")

    assert (await store.update(task.id)).title == "Unveraendert"


async def test_update_unbekannte_id(store: TaskStore) -> None:
    assert await store.update(999, title="x") is None


async def test_delete(store: TaskStore) -> None:
    task = await make(store)

    assert await store.delete(task.id) is True
    assert await store.delete(task.id) is False
    assert await store.get(task.id) is None


async def test_list_filtert_nach_channel(store: TaskStore) -> None:
    await make(store, "Hier")
    await make(store, "Woanders", channel_id=OTHER_CHANNEL)

    found = await store.list_tasks(guild_id=GUILD, channel_id=CHANNEL)

    assert [task.title for task in found] == ["Hier"]


async def test_list_filtert_nach_server(store: TaskStore) -> None:
    await make(store, "Unser Server")
    await make(store, "Fremder Server", guild_id=9999)

    found = await store.list_tasks(guild_id=GUILD)

    assert [task.title for task in found] == ["Unser Server"]


async def test_list_filtert_nach_status_und_person(store: TaskStore) -> None:
    await make(store, "Offen")
    erledigt = await make(store, "Erledigt")
    await make(store, "Bobs Aufgabe", assignee_id=BOB)
    await store.set_status(erledigt.id, Status.DONE, user_id=ALICE)

    aktiv = await store.list_tasks(guild_id=GUILD, statuses=(Status.OPEN, Status.DOING))
    von_bob = await store.list_tasks(guild_id=GUILD, assignee_id=BOB)

    assert sorted(task.title for task in aktiv) == ["Bobs Aufgabe", "Offen"]
    assert [task.title for task in von_bob] == ["Bobs Aufgabe"]


async def test_list_durchsucht_titel_und_notizen(store: TaskStore) -> None:
    await make(store, "Deployment vorbereiten")
    await make(store, "Meeting", notes="Deployment besprechen")
    await make(store, "Unrelated")

    found = await store.list_tasks(guild_id=GUILD, search="deployment")

    assert sorted(task.title for task in found) == ["Deployment vorbereiten", "Meeting"]


async def test_list_sortiert_in_arbeit_vor_offen_vor_erledigt(store: TaskStore) -> None:
    await make(store, "Offen")
    await make(store, "In Arbeit", assignee_id=BOB)
    erledigt = await make(store, "Erledigt")
    await store.set_status(erledigt.id, Status.DONE, user_id=ALICE)

    found = await store.list_tasks(guild_id=GUILD, statuses=None)

    assert [task.title for task in found] == ["In Arbeit", "Offen", "Erledigt"]


async def test_list_sortiert_nach_prioritaet_und_faelligkeit(store: TaskStore) -> None:
    now = datetime.now(timezone.utc)
    await make(store, "Normal ohne Frist")
    await make(store, "Normal mit Frist", due_at=now + timedelta(days=1))
    await make(store, "Wichtig", priority=Priority.HIGH)
    await make(store, "Unwichtig", priority=Priority.LOW)

    found = await store.list_tasks(guild_id=GUILD)

    assert [task.title for task in found] == [
        "Wichtig",
        "Normal mit Frist",
        "Normal ohne Frist",
        "Unwichtig",
    ]


async def test_list_respektiert_das_limit(store: TaskStore) -> None:
    for index in range(5):
        await make(store, f"Aufgabe {index}")

    assert len(await store.list_tasks(guild_id=GUILD, limit=3)) == 3


async def test_count_by_status(store: TaskStore) -> None:
    await make(store, "Offen 1")
    await make(store, "Offen 2")
    doing = await make(store, "In Arbeit", assignee_id=BOB)
    await store.set_status(doing.id, Status.DONE, user_id=BOB)

    counts = await store.count_by_status(guild_id=GUILD, channel_id=CHANNEL)

    assert counts == {Status.OPEN: 2, Status.DOING: 0, Status.DONE: 1}


async def test_due_before_findet_nur_offene_und_unerinnerte(store: TaskStore) -> None:
    now = datetime.now(timezone.utc)
    past = now - timedelta(hours=1)

    faellig = await make(store, "Überfällig", due_at=past)
    await make(store, "Später", due_at=now + timedelta(days=1))
    await make(store, "Ohne Frist")
    erledigt = await make(store, "Erledigt aber fällig", due_at=past)
    await store.set_status(erledigt.id, Status.DONE, user_id=ALICE)

    assert [task.id for task in await store.due_before(now)] == [faellig.id]

    # Nach dem Erinnern taucht die Aufgabe nicht erneut auf.
    await store.update(faellig.id, reminded_at=now)
    assert await store.due_before(now) == []
    assert len(await store.due_before(now, only_unreminded=False)) == 1


async def test_delete_completed_raeumt_nur_den_eigenen_channel_auf(store: TaskStore) -> None:
    hier = await make(store, "Hier erledigt")
    dort = await make(store, "Dort erledigt", channel_id=OTHER_CHANNEL)
    await make(store, "Hier offen")
    await store.set_status(hier.id, Status.DONE, user_id=ALICE)
    await store.set_status(dort.id, Status.DONE, user_id=ALICE)

    removed = await store.delete_completed(guild_id=GUILD, channel_id=CHANNEL)

    assert removed == 1
    assert await store.get(dort.id) is not None
    assert len(await store.list_tasks(guild_id=GUILD, channel_id=CHANNEL)) == 1


async def test_daten_ueberleben_einen_neustart(store: TaskStore, tmp_path) -> None:
    """Der wichtigste Fall: Aufgaben sind nach einem Bot-Neustart noch da."""
    task = await make(store, "Persistent", priority=Priority.HIGH)
    await store.close()

    wieder_da = TaskStore(tmp_path / "tasks.db")
    await wieder_da.connect()
    try:
        geladen = await wieder_da.get(task.id)
        assert geladen is not None
        assert geladen.title == "Persistent"
        assert geladen.priority is Priority.HIGH
    finally:
        await wieder_da.close()


async def test_zugriff_ohne_connect_meldet_sich_deutlich(tmp_path) -> None:
    with pytest.raises(RuntimeError, match="connect"):
        await TaskStore(tmp_path / "x.db").get(1)
