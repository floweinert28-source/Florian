"""Die Bot-Klasse: verbindet Datenbank, Commands und Discord-Gateway."""

from __future__ import annotations

import logging

import discord
from discord.ext import commands

from .config import Config
from .storage import TaskStore
from .ui import TaskButton

log = logging.getLogger(__name__)

EXTENSIONS = ("tasksbot.cogs.tasks",)


class TasksBot(commands.Bot):
    """Discord-Bot, der Aufgaben pro Channel verwaltet."""

    def __init__(self, config: Config) -> None:
        # Der Bot kommt ohne privilegierte Intents aus: alles laeuft ueber
        # Slash-Commands und Buttons, es wird kein Nachrichteninhalt gelesen.
        intents = discord.Intents.default()
        super().__init__(command_prefix=commands.when_mentioned, intents=intents, help_command=None)

        self.config = config
        self.store = TaskStore(config.database_path)

    async def setup_hook(self) -> None:
        """Wird einmal beim Start ausgefuehrt, bevor der Bot online geht."""
        await self.store.connect()
        log.info("Datenbank bereit: %s", self.config.database_path)

        # Damit Buttons an alten Nachrichten auch nach einem Neustart wirken.
        self.add_dynamic_items(TaskButton)

        for extension in EXTENSIONS:
            await self.load_extension(extension)
            log.info("Erweiterung geladen: %s", extension)

        await self._sync_commands()

    async def _sync_commands(self) -> None:
        """Meldet die Slash-Commands bei Discord an."""
        if self.config.guild_id is not None:
            guild = discord.Object(id=self.config.guild_id)
            self.tree.copy_global_to(guild=guild)
            synced = await self.tree.sync(guild=guild)
            log.info("%d Commands für Server %s registriert.", len(synced), self.config.guild_id)
        else:
            synced = await self.tree.sync()
            log.info(
                "%d Commands global registriert. Discord kann bis zu einer Stunde brauchen, "
                "bis sie überall auftauchen — setze GUILD_ID für sofortige Updates.",
                len(synced),
            )

    async def on_ready(self) -> None:
        log.info("Angemeldet als %s (ID %s)", self.user, getattr(self.user, "id", "?"))
        log.info("Aktiv auf %d Server(n).", len(self.guilds))
        await self.change_presence(
            activity=discord.Activity(type=discord.ActivityType.watching, name="/task")
        )

    async def close(self) -> None:
        """Faehrt sauber herunter und schliesst die Datenbank."""
        await self.store.close()
        await super().close()


async def on_app_command_error(
    interaction: discord.Interaction, error: discord.app_commands.AppCommandError
) -> None:
    """Zeigt Fehler verstaendlich an, statt still zu scheitern."""
    if isinstance(error, discord.app_commands.MissingPermissions):
        message = "Dafür fehlen dir die nötigen Rechte auf diesem Server."
    elif isinstance(error, discord.app_commands.NoPrivateMessage):
        message = "Aufgaben gibt es nur in Server-Channels, nicht in Direktnachrichten."
    elif isinstance(error, discord.app_commands.CommandOnCooldown):
        message = f"Zu schnell — versuch es in {error.retry_after:.0f} Sekunden nochmal."
    else:
        log.exception("Unerwarteter Fehler in %s", interaction.command, exc_info=error)
        message = "Da ist etwas schiefgelaufen. Der Fehler steht im Log des Bots."

    if interaction.response.is_done():
        await interaction.followup.send(message, ephemeral=True)
    else:
        await interaction.response.send_message(message, ephemeral=True)


def create_bot(config: Config) -> TasksBot:
    """Baut einen fertig konfigurierten Bot."""
    bot = TasksBot(config)
    bot.tree.on_error = on_app_command_error
    return bot
