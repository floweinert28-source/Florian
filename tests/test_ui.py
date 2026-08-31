"""Tests fuer Embeds und die Button-Logik."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest

from tasksbot.models import Priority, Status, Task
from tasksbot.storage import TaskStore
from tasksbot.ui import TaskButton, TaskView, task_embed, task_line, task_list_embed

from .conftest import ALICE, BOB, CHANNEL, GUILD

FREMD = 999


async def make(store: TaskStore, **kwargs) -> Task:
    kwargs.setdefault("title", "Aufgabe")
    return await store.create(
        guild_id=GUILD, channel_id=CHANNEL, creator_id=ALICE, **kwargs
    )


def custom_ids(view: TaskView) -> list[str]:
    return [item.item.custom_id for item in view.children]


# ----------------------------------------------------------------------
# Welche Buttons erscheinen wann
# ----------------------------------------------------------------------
@pytest.mark.parametrize(
    ("status", "expected"),
    [
        (Status.OPEN, ["task:claim:1", "task:done:1"]),
        (Status.DOING, ["task:done:1", "task:release:1"]),
        (Status.DONE, ["task:reopen:1"]),
    ],
)
def test_buttons_passen_zum_status(status, expected) -> None:
    task = Task(id=1, guild_id=GUILD, channel_id=CHANNEL, title="X", creator_id=ALICE, status=status)

    assert custom_ids(TaskView(task)) == expected


def test_button_template_akzeptiert_nur_bekannte_aktionen() -> None:
    """Sonst laufen Klicks auf manipulierte custom_ids ins Leere."""
    pattern = TaskButton.__discord_ui_compiled_template__

    assert pattern.fullmatch("task:done:42")
    assert not pattern.fullmatch("task:drop_table:42")
    assert not pattern.fullmatch("task:done:abc")


# ----------------------------------------------------------------------
# Was ein Klick bewirkt
# ----------------------------------------------------------------------
async def test_claim_uebernimmt_offene_aufgabe(store: TaskStore) -> None:
    task = await make(store)

    updated = await TaskButton("claim", task.id)._apply(
        store, task, user_id=BOB, is_moderator=False
    )

    assert updated is not None
    assert updated.assignee_id == BOB
    assert updated.status is Status.DOING


async def test_claim_respektiert_fremde_zustaendigkeit(store: TaskStore) -> None:
    task = await make(store, assignee_id=BOB)

    assert await TaskButton("claim", task.id)._apply(
        store, task, user_id=FREMD, is_moderator=False
    ) is None


async def test_moderation_darf_zustaendigkeit_uebernehmen(store: TaskStore) -> None:
    task = await make(store, assignee_id=BOB)

    updated = await TaskButton("claim", task.id)._apply(
        store, task, user_id=FREMD, is_moderator=True
    )

    assert updated is not None and updated.assignee_id == FREMD


async def test_done_setzt_erledigt_metadaten(store: TaskStore) -> None:
    task = await make(store, assignee_id=BOB)

    updated = await TaskButton("done", task.id)._apply(
        store, task, user_id=BOB, is_moderator=False
    )

    assert updated is not None
    assert updated.status is Status.DONE
    assert updated.completed_by == BOB


async def test_done_ist_fuer_unbeteiligte_gesperrt(store: TaskStore) -> None:
    task = await make(store, assignee_id=BOB)

    assert await TaskButton("done", task.id)._apply(
        store, task, user_id=FREMD, is_moderator=False
    ) is None


async def test_release_gibt_die_aufgabe_frei(store: TaskStore) -> None:
    task = await make(store, assignee_id=BOB)

    updated = await TaskButton("release", task.id)._apply(
        store, task, user_id=BOB, is_moderator=False
    )

    assert updated is not None
    assert updated.assignee_id is None
    assert updated.status is Status.OPEN


async def test_reopen_kehrt_zur_zustaendigkeit_zurueck(store: TaskStore) -> None:
    """Mit zugewiesener Person geht es zurueck auf 'in Arbeit', sonst auf 'offen'."""
    zugewiesen = await make(store, assignee_id=BOB)
    frei = await make(store)
    await store.set_status(zugewiesen.id, Status.DONE, user_id=BOB)
    await store.set_status(frei.id, Status.DONE, user_id=ALICE)

    a = await TaskButton("reopen", zugewiesen.id)._apply(
        store, await store.get(zugewiesen.id), user_id=BOB, is_moderator=False
    )
    b = await TaskButton("reopen", frei.id)._apply(
        store, await store.get(frei.id), user_id=ALICE, is_moderator=False
    )

    assert a is not None and a.status is Status.DOING
    assert b is not None and b.status is Status.OPEN
    assert a.completed_at is None


# ----------------------------------------------------------------------
# Darstellung
# ----------------------------------------------------------------------
def test_task_embed_zeigt_die_kernfelder() -> None:
    task = Task(
        id=42, guild_id=GUILD, channel_id=CHANNEL, title="Doku", creator_id=ALICE,
        assignee_id=BOB, priority=Priority.HIGH, notes="Mit Details",
    )

    embed = task_embed(task)
    fields = {field.name: field.value for field in embed.fields}

    assert embed.title == "#42 · Doku"
    assert embed.description == "Mit Details"
    assert "Hoch" in fields["Priorität"]
    assert f"<@{BOB}>" in fields["Zuständig"]
    assert fields["Fällig"] == "—"


def test_task_embed_markiert_ueberfaelliges() -> None:
    past = datetime.now(timezone.utc) - timedelta(hours=2)
    task = Task(id=1, guild_id=GUILD, channel_id=CHANNEL, title="Spät", creator_id=ALICE, due_at=past)

    fields = {field.name: field.value for field in task_embed(task).fields}

    assert "überfällig" in fields["Fällig"]


def test_lange_titel_werden_gekuerzt() -> None:
    task = Task(id=1, guild_id=GUILD, channel_id=CHANNEL, title="A" * 400, creator_id=ALICE)

    assert len(task_embed(task).title) <= 256
    assert len(task_line(task)) < 200


def test_erledigte_aufgaben_werden_durchgestrichen() -> None:
    task = Task(
        id=1, guild_id=GUILD, channel_id=CHANNEL, title="Fertig",
        creator_id=ALICE, status=Status.DONE,
    )

    assert "~~Fertig~~" in task_line(task)


def test_task_list_embed_gruppiert_nach_status() -> None:
    tasks = [
        Task(id=1, guild_id=GUILD, channel_id=CHANNEL, title="Offen", creator_id=ALICE),
        Task(id=2, guild_id=GUILD, channel_id=CHANNEL, title="Läuft", creator_id=ALICE,
             status=Status.DOING, assignee_id=BOB),
        Task(id=3, guild_id=GUILD, channel_id=CHANNEL, title="Fertig", creator_id=ALICE,
             status=Status.DONE),
    ]

    embed = task_list_embed(tasks, title="Aufgaben", counts={Status.OPEN: 1})
    names = [field.name for field in embed.fields]

    assert len(names) == 3
    assert "In Arbeit (1)" in names[0]
    assert "Offen (1)" in names[1]
    assert "Erledigt (1)" in names[2]


def test_task_list_embed_ohne_aufgaben_gibt_einen_hinweis() -> None:
    embed = task_list_embed([], title="Aufgaben")

    assert "/task add" in embed.description
    assert not embed.fields


def test_task_list_embed_deckelt_die_anzahl() -> None:
    tasks = [
        Task(id=index, guild_id=GUILD, channel_id=CHANNEL, title=f"#{index}", creator_id=ALICE)
        for index in range(1, 41)
    ]

    embed = task_list_embed(tasks, title="Aufgaben", limit=25)

    assert "15 weitere" in embed.description
    assert len(embed.fields[0].value) <= 1024


def test_embed_nennt_erstellende_person() -> None:
    task = Task(id=1, guild_id=GUILD, channel_id=CHANNEL, title="T", creator_id=ALICE)

    fields = {field.name: field.value for field in task_embed(task).fields}

    assert fields["Erstellt von"] == f"<@{ALICE}>"


def test_fit_gibt_kurze_listen_unveraendert_zurueck() -> None:
    from tasksbot.ui import _fit

    assert _fit(["a", "b", "c"]) == "a\nb\nc"
    assert _fit([]) == ""


def test_fit_kuerzt_an_der_zeilengrenze() -> None:
    """Discord-Felder fassen 1024 Zeichen - mitten in einer Erwähnung darf
    dabei nicht abgeschnitten werden."""
    from tasksbot.ui import _fit

    lines = [f"`#{index}` 🔵 **{'X' * 60}** · <@123456789012345678>" for index in range(40)]

    result = _fit(lines)

    assert len(result) <= 1024
    assert result.splitlines()[-1].startswith("… und ")
    # Jede vollstaendig uebernommene Zeile ist unveraendert geblieben.
    for line in result.splitlines()[:-1]:
        assert line in lines


def test_task_list_embed_bleibt_in_den_discord_limits() -> None:
    tasks = [
        Task(
            id=index, guild_id=GUILD, channel_id=CHANNEL, title="Aufgabe " * 10,
            creator_id=ALICE, assignee_id=BOB,
            due_at=datetime.now(timezone.utc) + timedelta(days=1),
        )
        for index in range(1, 26)
    ]

    embed = task_list_embed(tasks, title="Aufgaben")

    assert len(embed.description or "") <= 4096
    for field in embed.fields:
        assert len(field.value) <= 1024
