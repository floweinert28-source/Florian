"""Slash-Commands rund um Aufgaben: ``/task add``, ``/task list``, ..."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import TYPE_CHECKING

import discord
from discord import app_commands
from discord.ext import commands, tasks

from ..models import Priority, Status, Task
from ..timeparse import DueDateError, describe_formats, parse_due
from ..ui import TaskView, relative, task_embed, task_list_embed

if TYPE_CHECKING:
    from ..bot import TasksBot

log = logging.getLogger(__name__)

PRIORITY_CHOICES = [
    app_commands.Choice(name="Hoch", value=Priority.HIGH.value),
    app_commands.Choice(name="Normal", value=Priority.NORMAL.value),
    app_commands.Choice(name="Niedrig", value=Priority.LOW.value),
]

STATUS_CHOICES = [
    app_commands.Choice(name="Offen (offen + in Arbeit)", value="active"),
    app_commands.Choice(name="Nur offen", value=Status.OPEN.value),
    app_commands.Choice(name="Nur in Arbeit", value=Status.DOING.value),
    app_commands.Choice(name="Nur erledigt", value=Status.DONE.value),
    app_commands.Choice(name="Alle", value="all"),
]

_STATUS_FILTERS: dict[str, tuple[Status, ...] | None] = {
    "active": (Status.OPEN, Status.DOING),
    Status.OPEN.value: (Status.OPEN,),
    Status.DOING.value: (Status.DOING,),
    Status.DONE.value: (Status.DONE,),
    "all": None,
}


def is_moderator(user: discord.User | discord.Member) -> bool:
    """Moderation = darf Nachrichten verwalten."""
    return isinstance(user, discord.Member) and user.guild_permissions.manage_messages


@app_commands.guild_only()
class TaskCommands(commands.GroupCog, name="task", description="Aufgaben im Channel verwalten"):
    """Alle ``/task ...``-Befehle."""

    def __init__(self, bot: "TasksBot") -> None:
        self.bot = bot
        self.store = bot.store
        super().__init__()

    async def cog_load(self) -> None:
        if self.bot.config.reminders_enabled:
            self.reminder_loop.change_interval(minutes=self.bot.config.reminder_interval_minutes)
            self.reminder_loop.start()

    async def cog_unload(self) -> None:
        self.reminder_loop.cancel()

    # ------------------------------------------------------------------
    # Hilfsfunktionen
    # ------------------------------------------------------------------
    async def _fetch_editable(
        self, interaction: discord.Interaction, task_id: int
    ) -> Task | None:
        """Holt eine Aufgabe und prueft die Rechte. Antwortet selbst bei Fehlern."""
        task = await self.store.get(task_id)

        if task is None or task.guild_id != interaction.guild_id:
            await interaction.response.send_message(
                f"Ich finde keine Aufgabe `#{task_id}` auf diesem Server.", ephemeral=True
            )
            return None

        if not task.may_edit(interaction.user.id, is_moderator=is_moderator(interaction.user)):
            await interaction.response.send_message(
                f"`#{task_id}` gehört <@{task.creator_id}>. Ändern dürfen sie nur die "
                "erstellende oder zuständige Person sowie die Moderation.",
                ephemeral=True,
            )
            return None

        return task

    async def _refresh_message(self, task: Task) -> None:
        """Aktualisiert die urspruengliche Aufgabennachricht, falls es sie noch gibt."""
        if task.message_id is None:
            return
        channel = self.bot.get_channel(task.channel_id)
        if not isinstance(channel, discord.abc.Messageable):
            return
        try:
            message = await channel.fetch_message(task.message_id)
            await message.edit(embed=task_embed(task), view=TaskView(task))
        except (discord.NotFound, discord.Forbidden, discord.HTTPException) as error:
            log.debug("Nachricht zu Aufgabe #%s nicht aktualisierbar: %s", task.id, error)

    async def _mark_message_deleted(self, task: Task) -> None:
        """Entwertet die Karte einer geloeschten Aufgabe."""
        if task.message_id is None:
            return
        channel = self.bot.get_channel(task.channel_id)
        if not isinstance(channel, discord.abc.Messageable):
            return
        try:
            message = await channel.fetch_message(task.message_id)
            await message.edit(
                content=f"🗑️ Aufgabe `#{task.id}` (**{task.title}**) wurde gelöscht.",
                embed=None,
                view=None,
            )
        except (discord.NotFound, discord.Forbidden, discord.HTTPException) as error:
            log.debug("Karte zu Aufgabe #%s nicht entwertbar: %s", task.id, error)

    async def _parse_due(self, interaction: discord.Interaction, raw: str) -> datetime | None:
        """Liest eine Faelligkeitsangabe. Antwortet selbst, wenn sie unklar ist."""
        try:
            return parse_due(raw, tz=self.bot.config.timezone)
        except DueDateError as error:
            await interaction.response.send_message(
                f"❌ {error}\n{describe_formats()}", ephemeral=True
            )
            return None

    async def task_id_autocomplete(
        self, interaction: discord.Interaction, current: str
    ) -> list[app_commands.Choice[int]]:
        """Schlaegt Aufgaben aus dem aktuellen Channel vor."""
        if interaction.guild_id is None:
            return []
        candidates = await self.store.list_tasks(
            guild_id=interaction.guild_id,
            channel_id=interaction.channel_id,
            search=current or None,
            limit=25,
        )
        return [
            app_commands.Choice(
                name=f"#{task.id} {task.status.emoji} {task.title}"[:100], value=task.id
            )
            for task in candidates
        ]

    # ------------------------------------------------------------------
    # Anlegen und bearbeiten
    # ------------------------------------------------------------------
    @app_commands.command(name="add", description="Legt eine neue Aufgabe in diesem Channel an")
    @app_commands.describe(
        titel="Worum geht es?",
        zustaendig="Wer soll die Aufgabe übernehmen?",
        faellig="Wann ist sie fällig? z. B. 2h, morgen 09:00, freitag, 05.09.2026",
        prioritaet="Wie dringend ist die Aufgabe?",
        notizen="Zusätzliche Details",
    )
    @app_commands.choices(prioritaet=PRIORITY_CHOICES)
    async def add(
        self,
        interaction: discord.Interaction,
        titel: app_commands.Range[str, 1, 200],
        zustaendig: discord.Member | None = None,
        faellig: str | None = None,
        prioritaet: app_commands.Choice[str] | None = None,
        notizen: app_commands.Range[str, 1, 1000] | None = None,
    ) -> None:
        due_at = None
        if faellig:
            due_at = await self._parse_due(interaction, faellig)
            if due_at is None:
                return

        task = await self.store.create(
            guild_id=interaction.guild_id,  # type: ignore[arg-type]
            channel_id=interaction.channel_id,  # type: ignore[arg-type]
            title=titel,
            creator_id=interaction.user.id,
            notes=notizen,
            priority=Priority(prioritaet.value) if prioritaet else Priority.NORMAL,
            assignee_id=zustaendig.id if zustaendig else None,
            due_at=due_at,
        )

        content = f"<@{zustaendig.id}>, neue Aufgabe für dich:" if zustaendig else None
        await interaction.response.send_message(
            content=content, embed=task_embed(task), view=TaskView(task)
        )

        # Message-ID merken, damit spaetere Aenderungen die Karte aktualisieren.
        message = await interaction.original_response()
        await self.store.update(task.id, message_id=message.id)

    @app_commands.command(name="done", description="Markiert eine Aufgabe als erledigt")
    @app_commands.describe(id="Nummer der Aufgabe")
    @app_commands.autocomplete(id=task_id_autocomplete)
    async def done(self, interaction: discord.Interaction, id: app_commands.Range[int, 1]) -> None:
        task = await self._fetch_editable(interaction, id)
        if task is None:
            return
        if task.is_done:
            await interaction.response.send_message(
                f"`#{id}` ist bereits erledigt.", ephemeral=True
            )
            return

        updated = await self.store.set_status(id, Status.DONE, user_id=interaction.user.id)
        assert updated is not None
        await interaction.response.send_message(f"✅ **{updated.title}** ist erledigt.")
        await self._refresh_message(updated)

    @app_commands.command(name="reopen", description="Öffnet eine erledigte Aufgabe wieder")
    @app_commands.describe(id="Nummer der Aufgabe")
    @app_commands.autocomplete(id=task_id_autocomplete)
    async def reopen(
        self, interaction: discord.Interaction, id: app_commands.Range[int, 1]
    ) -> None:
        task = await self._fetch_editable(interaction, id)
        if task is None:
            return

        status = Status.DOING if task.assignee_id else Status.OPEN
        updated = await self.store.set_status(id, status, user_id=interaction.user.id)
        assert updated is not None
        await interaction.response.send_message(
            f"🔄 **{updated.title}** ist wieder offen.", embed=task_embed(updated)
        )
        await self._refresh_message(updated)

    @app_commands.command(name="assign", description="Weist eine Aufgabe jemandem zu")
    @app_commands.describe(id="Nummer der Aufgabe", zustaendig="Wer übernimmt? Leer lassen = freigeben")
    @app_commands.autocomplete(id=task_id_autocomplete)
    async def assign(
        self,
        interaction: discord.Interaction,
        id: app_commands.Range[int, 1],
        zustaendig: discord.Member | None = None,
    ) -> None:
        task = await self._fetch_editable(interaction, id)
        if task is None:
            return

        if zustaendig is None:
            updated = await self.store.update(id, assignee_id=None, status=Status.OPEN)
            message = f"↩️ **{task.title}** ist wieder frei."
        else:
            status = Status.DOING if not task.is_done else task.status
            updated = await self.store.update(id, assignee_id=zustaendig.id, status=status)
            message = f"🙋 <@{zustaendig.id}> übernimmt **{task.title}**."

        assert updated is not None
        await interaction.response.send_message(message, embed=task_embed(updated))
        await self._refresh_message(updated)

    @app_commands.command(name="edit", description="Ändert Titel, Notizen, Fälligkeit oder Priorität")
    @app_commands.describe(
        id="Nummer der Aufgabe",
        titel="Neuer Titel",
        faellig="Neue Fälligkeit (`-` entfernt sie)",
        prioritaet="Neue Priorität",
        notizen="Neue Notizen (`-` entfernt sie)",
    )
    @app_commands.choices(prioritaet=PRIORITY_CHOICES)
    @app_commands.autocomplete(id=task_id_autocomplete)
    async def edit(
        self,
        interaction: discord.Interaction,
        id: app_commands.Range[int, 1],
        titel: app_commands.Range[str, 1, 200] | None = None,
        faellig: str | None = None,
        prioritaet: app_commands.Choice[str] | None = None,
        notizen: app_commands.Range[str, 1, 1000] | None = None,
    ) -> None:
        task = await self._fetch_editable(interaction, id)
        if task is None:
            return

        changes: dict[str, object] = {}
        if titel:
            changes["title"] = titel
        if prioritaet:
            changes["priority"] = Priority(prioritaet.value)
        if notizen:
            changes["notes"] = None if notizen.strip() == "-" else notizen
        if faellig:
            if faellig.strip() == "-":
                changes["due_at"] = None
            else:
                due_at = await self._parse_due(interaction, faellig)
                if due_at is None:
                    return
                changes["due_at"] = due_at
            # Neue Frist heisst: erneut erinnern duerfen.
            changes["reminded_at"] = None

        if not changes:
            await interaction.response.send_message(
                "Es gab nichts zu ändern — gib mindestens ein Feld an.", ephemeral=True
            )
            return

        updated = await self.store.update(id, **changes)
        assert updated is not None
        await interaction.response.send_message(
            f"✏️ Aufgabe `#{id}` aktualisiert.", embed=task_embed(updated)
        )
        await self._refresh_message(updated)

    @app_commands.command(name="delete", description="Löscht eine Aufgabe endgültig")
    @app_commands.describe(id="Nummer der Aufgabe")
    @app_commands.autocomplete(id=task_id_autocomplete)
    async def delete(
        self, interaction: discord.Interaction, id: app_commands.Range[int, 1]
    ) -> None:
        task = await self._fetch_editable(interaction, id)
        if task is None:
            return

        await self.store.delete(id)
        await interaction.response.send_message(
            f"🗑️ Aufgabe `#{id}` (**{task.title}**) gelöscht.", ephemeral=True
        )
        await self._mark_message_deleted(task)

    # ------------------------------------------------------------------
    # Ansichten
    # ------------------------------------------------------------------
    @app_commands.command(name="list", description="Zeigt die Aufgaben dieses Channels")
    @app_commands.describe(
        status="Welche Aufgaben? Standard: offen und in Arbeit",
        zustaendig="Nur Aufgaben dieser Person",
        suche="Nur Aufgaben, deren Titel oder Notizen das enthalten",
        serverweit="Aufgaben aus allen Channels statt nur aus diesem",
        nur_fuer_mich="Antwort nur für dich sichtbar",
    )
    @app_commands.choices(status=STATUS_CHOICES)
    async def list_tasks(
        self,
        interaction: discord.Interaction,
        status: app_commands.Choice[str] | None = None,
        zustaendig: discord.Member | None = None,
        suche: str | None = None,
        serverweit: bool = False,
        nur_fuer_mich: bool = False,
    ) -> None:
        statuses = _STATUS_FILTERS[status.value if status else "active"]
        channel_id = None if serverweit else interaction.channel_id

        found = await self.store.list_tasks(
            guild_id=interaction.guild_id,  # type: ignore[arg-type]
            channel_id=channel_id,
            statuses=statuses,
            assignee_id=zustaendig.id if zustaendig else None,
            search=suche,
            limit=100,
        )
        counts = await self.store.count_by_status(
            guild_id=interaction.guild_id,  # type: ignore[arg-type]
            channel_id=channel_id,
        )

        filters = []
        if zustaendig:
            filters.append(f"von <@{zustaendig.id}>")
        if suche:
            filters.append(f"Suche: `{suche}`")

        scope = "auf dem Server" if serverweit else f"in <#{interaction.channel_id}>"
        embed = task_list_embed(
            found,
            title="📋 Aufgaben",
            subtitle=" · ".join([f"Aufgaben {scope}", *filters]),
            counts=counts,
        )
        await interaction.response.send_message(embed=embed, ephemeral=nur_fuer_mich)

    @app_commands.command(name="mine", description="Zeigt deine offenen Aufgaben auf dem Server")
    @app_commands.describe(nur_fuer_mich="Antwort nur für dich sichtbar (Standard: ja)")
    async def mine(
        self, interaction: discord.Interaction, nur_fuer_mich: bool = True
    ) -> None:
        found = await self.store.list_tasks(
            guild_id=interaction.guild_id,  # type: ignore[arg-type]
            statuses=(Status.OPEN, Status.DOING),
            assignee_id=interaction.user.id,
            limit=100,
        )
        overdue = sum(1 for task in found if task.is_overdue())
        subtitle = f"{len(found)} offene Aufgabe(n)"
        if overdue:
            subtitle += f" · ⚠️ {overdue} überfällig"

        embed = task_list_embed(
            found, title=f"📌 Aufgaben von {interaction.user.display_name}", subtitle=subtitle
        )
        await interaction.response.send_message(embed=embed, ephemeral=nur_fuer_mich)

    @app_commands.command(name="show", description="Zeigt eine Aufgabe im Detail")
    @app_commands.describe(id="Nummer der Aufgabe")
    @app_commands.autocomplete(id=task_id_autocomplete)
    async def show(
        self, interaction: discord.Interaction, id: app_commands.Range[int, 1]
    ) -> None:
        task = await self.store.get(id)
        if task is None or task.guild_id != interaction.guild_id:
            await interaction.response.send_message(
                f"Ich finde keine Aufgabe `#{id}` auf diesem Server.", ephemeral=True
            )
            return
        await interaction.response.send_message(embed=task_embed(task), view=TaskView(task))

    @app_commands.command(
        name="clear", description="Entfernt alle erledigten Aufgaben aus diesem Channel"
    )
    @app_commands.checks.has_permissions(manage_messages=True)
    async def clear(self, interaction: discord.Interaction) -> None:
        removed = await self.store.delete_completed(
            guild_id=interaction.guild_id,  # type: ignore[arg-type]
            channel_id=interaction.channel_id,  # type: ignore[arg-type]
        )
        await interaction.response.send_message(
            f"🧹 {removed} erledigte Aufgabe(n) entfernt."
            if removed
            else "Hier gibt es keine erledigten Aufgaben zum Aufräumen.",
            ephemeral=True,
        )

    # ------------------------------------------------------------------
    # Erinnerungen
    # ------------------------------------------------------------------
    @tasks.loop(minutes=5)
    async def reminder_loop(self) -> None:
        """Meldet ueberfaellige Aufgaben einmalig im jeweiligen Channel."""
        overdue = await self.store.due_before(datetime.now(timezone.utc))
        for task in overdue:
            # Erst merken, dann senden: so wird auch bei einem Fehler beim
            # Senden nicht in jeder Runde erneut gepingt.
            await self.store.update(task.id, reminded_at=datetime.now(timezone.utc))
            await self._send_reminder(task)

    async def _send_reminder(self, task: Task) -> None:
        channel = self.bot.get_channel(task.channel_id)
        if not isinstance(channel, discord.abc.Messageable):
            return

        who = f"<@{task.assignee_id}>" if task.assignee_id else f"<@{task.creator_id}>"
        due = relative(task.due_at) if task.due_at else "jetzt"
        try:
            await channel.send(
                f"⏰ {who} — Aufgabe `#{task.id}` **{task.title}** war {due} fällig.",
                embed=task_embed(task),
                view=TaskView(task),
            )
        except (discord.Forbidden, discord.HTTPException) as error:
            log.warning("Erinnerung zu Aufgabe #%s fehlgeschlagen: %s", task.id, error)

    @reminder_loop.before_loop
    async def _before_reminder_loop(self) -> None:
        await self.bot.wait_until_ready()


async def setup(bot: "TasksBot") -> None:
    """Einstiegspunkt fuer ``bot.load_extension``."""
    await bot.add_cog(TaskCommands(bot))
