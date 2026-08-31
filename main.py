#!/usr/bin/env python3
"""Startet den Aufgaben-Bot.

Aufruf:  python main.py
"""

from __future__ import annotations

import asyncio
import logging
import sys

import discord

from tasksbot.bot import create_bot
from tasksbot.config import Config, ConfigError

log = logging.getLogger("tasksbot")


def load_dotenv_if_available() -> None:
    """Laedt eine .env-Datei, falls python-dotenv installiert ist."""
    try:
        from dotenv import load_dotenv
    except ImportError:
        return
    load_dotenv()


async def run() -> int:
    load_dotenv_if_available()
    discord.utils.setup_logging(level=logging.INFO)

    try:
        config = Config.from_env()
    except ConfigError as error:
        log.error("Konfigurationsfehler: %s", error)
        return 2

    bot = create_bot(config)
    try:
        await bot.start(config.token)
    except discord.LoginFailure:
        log.error(
            "Discord hat den Token abgelehnt. Prüfe DISCORD_TOKEN in deiner .env — "
            "im Developer Portal unter Bot → Reset Token findest du einen neuen."
        )
        return 3
    except discord.PrivilegedIntentsRequired:
        log.error(
            "Discord verlangt privilegierte Intents. Dieser Bot braucht keine — "
            "prüfe, ob die Intents im Code angepasst wurden."
        )
        return 4
    finally:
        if not bot.is_closed():
            await bot.close()
    return 0


def main() -> int:
    try:
        return asyncio.run(run())
    except KeyboardInterrupt:
        log.info("Beendet.")
        return 0


if __name__ == "__main__":
    sys.exit(main())
