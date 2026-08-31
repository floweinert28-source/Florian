"""Tests fuer die Command-Definitionen.

Diese Tests brauchen keine Discord-Verbindung: sie pruefen, dass die
statischen Definitionen zueinander passen. Genau dort schlagen Aenderungen
sonst erst zur Laufzeit fehl - beim Klick der Nutzerin.
"""

from __future__ import annotations

import discord
import pytest

from tasksbot.cogs.tasks import (
    _STATUS_FILTERS,
    PRIORITY_CHOICES,
    STATUS_CHOICES,
    TaskCommands,
    is_moderator,
)
from tasksbot.models import Priority, Status

ERWARTETE_COMMANDS = {
    "add", "list", "mine", "show", "done", "reopen", "assign", "edit", "delete", "clear",
}


def test_jede_status_auswahl_hat_einen_filter() -> None:
    """Sonst wirft ``/task list`` einen KeyError."""
    for choice in STATUS_CHOICES:
        assert choice.value in _STATUS_FILTERS


def test_status_filter_verweisen_auf_echte_status() -> None:
    for statuses in _STATUS_FILTERS.values():
        if statuses is None:  # "alle"
            continue
        assert all(isinstance(status, Status) for status in statuses)


def test_prioritaets_auswahl_passt_zum_modell() -> None:
    values = {choice.value for choice in PRIORITY_CHOICES}

    assert values == {priority.value for priority in Priority}


def test_alle_commands_sind_definiert() -> None:
    commands = {
        command.name
        for command in TaskCommands.__cog_app_commands__
        if isinstance(command, discord.app_commands.Command)
    }

    assert commands == ERWARTETE_COMMANDS


def test_jeder_command_hat_eine_beschreibung() -> None:
    """Ohne Beschreibung lehnt Discord die Registrierung ab."""
    for command in TaskCommands.__cog_app_commands__:
        if isinstance(command, discord.app_commands.Command):
            assert command.description, f"/{command.name} hat keine Beschreibung"
            assert len(command.description) <= 100


def test_optionsnamen_sind_fuer_discord_gueltig() -> None:
    """Discord erlaubt nur kleingeschriebene Namen ohne Leerzeichen."""
    for command in TaskCommands.__cog_app_commands__:
        if not isinstance(command, discord.app_commands.Command):
            continue
        for parameter in command.parameters:
            assert parameter.name.islower(), f"{command.name}.{parameter.name}"
            assert " " not in parameter.name
            assert parameter.description, f"{command.name}.{parameter.name} ohne Beschreibung"


def test_aufgaben_gibt_es_nur_in_servern() -> None:
    """In DMs gibt es keinen Channel-Kontext - die Commands sind dort aus."""
    assert TaskCommands.__discord_app_commands_guild_only__ is True


@pytest.mark.parametrize("permission", [True, False])
def test_is_moderator_liest_die_server_rechte(permission: bool) -> None:
    class FakeMember(discord.Member):
        def __init__(self) -> None:  # pragma: no cover - kein echter Discord-State
            pass

        @property
        def guild_permissions(self) -> discord.Permissions:
            return discord.Permissions(manage_messages=permission)

    assert is_moderator(FakeMember()) is permission


def test_is_moderator_ist_ausserhalb_von_servern_false() -> None:
    class FakeUser(discord.User):
        def __init__(self) -> None:  # pragma: no cover
            pass

    assert is_moderator(FakeUser()) is False
