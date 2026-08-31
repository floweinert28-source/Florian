"""Embeds und Buttons fuer die Aufgabenanzeige."""

from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import TYPE_CHECKING

import discord

from .models import Priority, Status, Task

if TYPE_CHECKING:
    from .storage import TaskStore

__all__ = ["TaskButton", "TaskView", "task_embed", "task_list_embed", "task_line"]

_COLORS = {
    Status.OPEN: discord.Color.blurple(),
    Status.DOING: discord.Color.orange(),
    Status.DONE: discord.Color.green(),
}
_OVERDUE_COLOR = discord.Color.red()

# Wie eine Schaltflaeche je Aktion aussieht. Der Schluessel steckt in der
# custom_id, damit Buttons auch nach einem Neustart des Bots noch funktionieren.
_BUTTON_SPECS: dict[str, dict[str, object]] = {
    "claim": {"label": "Übernehmen", "style": discord.ButtonStyle.primary, "emoji": "🙋"},
    "done": {"label": "Erledigt", "style": discord.ButtonStyle.success, "emoji": "✅"},
    "release": {"label": "Freigeben", "style": discord.ButtonStyle.secondary, "emoji": "↩️"},
    "reopen": {"label": "Wieder öffnen", "style": discord.ButtonStyle.secondary, "emoji": "🔄"},
}


def relative(moment: datetime) -> str:
    """Discord-Zeitstempel, den jede Person in ihrer eigenen Zeitzone sieht."""
    return f"<t:{int(moment.timestamp())}:R>"


def absolute(moment: datetime) -> str:
    return f"<t:{int(moment.timestamp())}:f>"


def due_text(task: Task, *, now: datetime | None = None) -> str:
    """Formatiert die Faelligkeit, ueberfaellige Aufgaben werden markiert."""
    if task.due_at is None:
        return "—"
    stamp = f"{absolute(task.due_at)} ({relative(task.due_at)})"
    if task.is_overdue(now=now):
        return f"⚠️ **überfällig** · {stamp}"
    return stamp


def task_embed(task: Task) -> discord.Embed:
    """Detailansicht einer einzelnen Aufgabe."""
    color = _OVERDUE_COLOR if task.is_overdue() else _COLORS[task.status]
    embed = discord.Embed(
        title=f"#{task.id} · {task.title}"[:256],
        description=task.notes or None,
        color=color,
    )
    embed.add_field(name="Status", value=f"{task.status.emoji} {task.status.label}", inline=True)
    embed.add_field(
        name="Priorität", value=f"{task.priority.emoji} {task.priority.label}", inline=True
    )
    embed.add_field(
        name="Zuständig",
        value=f"<@{task.assignee_id}>" if task.assignee_id else "niemand",
        inline=True,
    )
    embed.add_field(name="Erstellt von", value=f"<@{task.creator_id}>", inline=True)
    embed.add_field(name="Fällig", value=due_text(task), inline=False)

    if task.is_done and task.completed_at:
        completed_by = f" von <@{task.completed_by}>" if task.completed_by else ""
        embed.add_field(
            name="Erledigt", value=f"{relative(task.completed_at)}{completed_by}", inline=False
        )

    embed.set_footer(text=f"Aufgabe #{task.id}")
    embed.timestamp = task.created_at
    return embed


def task_line(task: Task, *, now: datetime | None = None) -> str:
    """Eine Aufgabe als einzelne Zeile fuer Listenansichten."""
    title = task.title if len(task.title) <= 70 else task.title[:69] + "…"
    if task.is_done:
        title = f"~~{title}~~"

    parts = [f"`#{task.id}`", task.status.emoji, f"**{title}**"]
    if task.priority is not Priority.NORMAL:
        parts.append(task.priority.emoji)

    details = []
    if task.assignee_id:
        details.append(f"<@{task.assignee_id}>")
    if task.due_at and not task.is_done:
        marker = "⚠️ " if task.is_overdue(now=now) else ""
        details.append(f"{marker}{relative(task.due_at)}")
    if details:
        parts.append("· " + " · ".join(details))

    return " ".join(parts)


def task_list_embed(
    tasks: list[Task],
    *,
    title: str,
    subtitle: str | None = None,
    counts: dict[Status, int] | None = None,
    limit: int = 25,
) -> discord.Embed:
    """Uebersicht mehrerer Aufgaben, gruppiert nach Status."""
    now = datetime.now(timezone.utc)
    embed = discord.Embed(title=title, color=discord.Color.blurple())

    if not tasks:
        embed.description = subtitle or "Keine Aufgaben gefunden. Lege eine an mit `/task add`."
        return embed

    shown, hidden = tasks[:limit], max(0, len(tasks) - limit)
    description = [subtitle] if subtitle else []

    for status in (Status.DOING, Status.OPEN, Status.DONE):
        group = [task for task in shown if task.status is status]
        if not group:
            continue
        embed.add_field(
            name=f"{status.emoji} {status.label} ({len(group)})",
            value=_fit([task_line(task, now=now) for task in group]),
            inline=False,
        )

    if hidden:
        description.append(f"… und {hidden} weitere. Grenze die Liste mit den Filtern ein.")
    if description:
        embed.description = "\n".join(description)[:4096]

    if counts:
        embed.set_footer(
            text=" · ".join(
                f"{status.label}: {counts.get(status, 0)}"
                for status in (Status.OPEN, Status.DOING, Status.DONE)
            )
        )
    return embed


def _fit(lines: list[str], *, limit: int = 1024) -> str:
    """Fuegt Zeilen zusammen, ohne das Feldlimit zu sprengen.

    Gekuerzt wird an der Zeilengrenze - sonst zerreisst es die letzte
    Erwaehnung oder den letzten Zeitstempel mitten im Markup.
    """
    kept: list[str] = []
    length = 0
    for index, line in enumerate(lines):
        remaining = len(lines) - index
        hint = f"… und {remaining} weitere"
        if length + len(line) + 1 > limit - (len(hint) + 1 if remaining > 1 else 0):
            kept.append(hint)
            break
        kept.append(line)
        length += len(line) + 1
    return "\n".join(kept)


class TaskButton(
    discord.ui.DynamicItem[discord.ui.Button],
    template=r"task:(?P<action>claim|done|release|reopen):(?P<id>\d+)",
):
    """Schaltflaeche an einer Aufgabennachricht.

    Die Aufgaben-ID steckt in der ``custom_id``. discord.py baut den Button
    daraus nach einem Neustart wieder auf, sodass alte Nachrichten weiter
    bedienbar bleiben - ganz ohne View im Speicher zu halten.
    """

    def __init__(self, action: str, task_id: int) -> None:
        spec = _BUTTON_SPECS[action]
        super().__init__(
            discord.ui.Button(
                label=spec["label"],  # type: ignore[arg-type]
                style=spec["style"],  # type: ignore[arg-type]
                emoji=spec["emoji"],  # type: ignore[arg-type]
                custom_id=f"task:{action}:{task_id}",
            )
        )
        self.action = action
        self.task_id = task_id

    @classmethod
    async def from_custom_id(
        cls,
        interaction: discord.Interaction,
        item: discord.ui.Button,
        match: re.Match[str],
        /,
    ) -> "TaskButton":
        # Das Template laesst nur bekannte Aktionen durch.
        return cls(match["action"], int(match["id"]))

    async def callback(self, interaction: discord.Interaction) -> None:  # type: ignore[override]
        store: "TaskStore" = interaction.client.store  # type: ignore[attr-defined]
        task = await store.get(self.task_id)

        if task is None:
            await interaction.response.send_message(
                f"Aufgabe `#{self.task_id}` gibt es nicht mehr.", ephemeral=True
            )
            return

        user = interaction.user
        is_moderator = isinstance(user, discord.Member) and user.guild_permissions.manage_messages

        updated = await self._apply(store, task, user_id=user.id, is_moderator=is_moderator)
        if updated is None:
            await interaction.response.send_message(
                "Dafür fehlen dir die Rechte — das dürfen nur die erstellende oder "
                "zuständige Person sowie die Moderation.",
                ephemeral=True,
            )
            return

        await interaction.response.edit_message(embed=task_embed(updated), view=TaskView(updated))

    async def _apply(
        self, store: "TaskStore", task: Task, *, user_id: int, is_moderator: bool
    ) -> Task | None:
        """Fuehrt die Aktion aus. ``None`` bedeutet: nicht erlaubt."""
        match self.action:
            case "claim":
                # Uebernehmen darf jede Person, solange niemand sonst dran ist.
                if task.assignee_id not in (None, user_id) and not is_moderator:
                    return None
                return await store.update(
                    task.id, assignee_id=user_id, status=Status.DOING,
                    completed_at=None, completed_by=None,
                )
            case "release":
                if not task.may_edit(user_id, is_moderator=is_moderator):
                    return None
                return await store.update(task.id, assignee_id=None, status=Status.OPEN)
            case "done":
                if not task.may_edit(user_id, is_moderator=is_moderator):
                    return None
                return await store.set_status(task.id, Status.DONE, user_id=user_id)
            case "reopen":
                if not task.may_edit(user_id, is_moderator=is_moderator):
                    return None
                status = Status.DOING if task.assignee_id else Status.OPEN
                return await store.set_status(task.id, status, user_id=user_id)
            case _:  # pragma: no cover - durch from_custom_id ausgeschlossen
                return None


class TaskView(discord.ui.View):
    """Buttons passend zum aktuellen Status einer Aufgabe."""

    def __init__(self, task: Task) -> None:
        super().__init__(timeout=None)
        for action in _actions_for(task):
            self.add_item(TaskButton(action, task.id))


def _actions_for(task: Task) -> tuple[str, ...]:
    match task.status:
        case Status.DONE:
            return ("reopen",)
        case Status.DOING:
            return ("done", "release")
        case _:
            return ("claim", "done")
