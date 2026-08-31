"""Basisklassen fuer Strategien und der Handelszeitenfilter.

Eine Strategie hat genau zwei Aufgaben:

``prepare(frame)``
    Einmal alle Indikatoren rechnen (vektorisiert, kausal).
``signal(frame, i)``
    Fuer Kerze *i* entscheiden: Long, Short oder nichts - und dabei nur Daten
    bis einschliesslich *i* anfassen.

Groesse, Freigabe und Regelpruefung macht die Strategie **nicht**. Das ist
Absicht: so kann dieselbe Strategie auf einem 50k-Prop-Konto und auf einem
privaten Konto laufen, ohne dass eine Zeile Strategiecode sich aendert.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, fields
from datetime import time as clock_time

import pandas as pd

from ..models import Signal

__all__ = ["ArrayCache", "SessionWindow", "Strategy", "StrategyParams"]


def _parse_clock(value: str) -> clock_time:
    hour, _, minute = value.partition(":")
    return clock_time(int(hour), int(minute or 0))


@dataclass(frozen=True, slots=True)
class SessionWindow:
    """Wann darf gehandelt werden (alles in UTC).

    Standard ist 07:00-16:30 UTC: London-Session plus die ersten Stunden
    New York. Ausserhalb sind die Spreads breiter und die Bewegungen duenner -
    auf einem Konto mit 2.000 $ Puffer ist das schlecht bezahltes Risiko.

    ``blackouts`` sind taegliche Sperrfenster, typischerweise um
    Nachrichtentermine (13:30 UTC = US-Daten). ``no_new_trades_after`` verhindert
    Einstiege kurz vor Sessionende, ``flat_at`` schliesst alles offene.
    """

    start: str = "07:00"
    end: str = "16:30"
    weekdays: tuple[int, ...] = (0, 1, 2, 3, 4)
    blackouts: tuple[tuple[str, str], ...] = (("13:25", "13:35"),)
    no_new_trades_after: str = "15:30"
    flat_at: str = "20:45"
    skip_friday_after: str | None = "15:00"

    def allows(self, moment: pd.Timestamp) -> bool:
        """Darf zu diesem Zeitpunkt ein *neuer* Trade eroeffnet werden?"""
        if moment.weekday() not in self.weekdays:
            return False
        now = moment.timetz().replace(tzinfo=None)
        if not (_parse_clock(self.start) <= now <= _parse_clock(self.no_new_trades_after)):
            return False
        if self.skip_friday_after and moment.weekday() == 4:
            if now >= _parse_clock(self.skip_friday_after):
                return False
        for begin, finish in self.blackouts:
            if _parse_clock(begin) <= now <= _parse_clock(finish):
                return False
        return True

    def must_be_flat(self, moment: pd.Timestamp) -> bool:
        """Muss eine offene Position jetzt geschlossen werden?"""
        now = moment.timetz().replace(tzinfo=None)
        if moment.weekday() == 4 and now >= _parse_clock(self.flat_at):
            return True  # kein Wochenendrisiko
        return now >= _parse_clock(self.flat_at)

    def describe(self) -> str:
        blackouts = ", ".join(f"{a}-{b}" for a, b in self.blackouts) or "keine"
        return (
            f"{self.start}-{self.end} UTC, neue Trades bis {self.no_new_trades_after}, "
            f"flat um {self.flat_at}, Sperrfenster: {blackouts}"
        )


class ArrayCache:
    """Haelt Indikatorspalten als numpy-Arrays vor.

    ``frame.iloc[i]`` kostet in pandas rund 50 Mikrosekunden - bei 20.000
    Kerzen und mehreren Zugriffen je Kerze summiert sich das auf Sekunden.
    Ueber diesen Cache liest die Strategie stattdessen aus flachen Arrays.
    Der Cache erneuert sich automatisch, sobald ein anderer Datensatz kommt.
    """

    def __init__(self) -> None:
        self._key: tuple | None = None
        self._arrays: dict[str, object] = {}

    def arrays(self, frame: pd.DataFrame, columns: tuple[str, ...]) -> dict:
        key = (id(frame), len(frame), frame.index[0], frame.index[-1], columns)
        if key != self._key:
            self._arrays = {name: frame[name].to_numpy() for name in columns}
            self._key = key
        return self._arrays


@dataclass(frozen=True, slots=True)
class StrategyParams:
    """Basisklasse fuer Parametersaetze - liefert ein Dict fuer Reports."""

    def to_dict(self) -> dict[str, float | str]:
        result: dict[str, float | str] = {}
        for item in fields(self):
            value = getattr(self, item.name)
            if isinstance(value, (int, float, str)):
                result[item.name] = value
        return result


class Strategy(ABC):
    """Vertrag, den jede Strategie erfuellt."""

    name: str = "strategy"

    def __init__(self, session: SessionWindow | None = None) -> None:
        self.session = session or SessionWindow()

    @property
    @abstractmethod
    def warmup(self) -> int:
        """Wie viele Kerzen die Indikatoren zum Einschwingen brauchen."""

    @abstractmethod
    def prepare(self, frame: pd.DataFrame) -> pd.DataFrame:
        """Gibt eine Kopie mit allen Indikatorspalten zurueck."""

    @abstractmethod
    def signal(self, frame: pd.DataFrame, index: int) -> Signal | None:
        """Signal fuer Kerze ``index`` - darf nur Zeilen <= index lesen."""

    def context(self, frame: pd.DataFrame, index: int) -> dict[str, float | str]:
        """Marktkontext fuer das Journal (Session, Regime, Volatilitaet)."""
        moment = frame.index[index]
        return {
            "hour": int(moment.hour),
            "weekday": int(moment.weekday()),
            "session": _session_name(int(moment.hour)),
        }

    def params(self) -> dict[str, float | str]:
        """Parameter fuer Reports und Journal."""
        return {}

    def allows_entry(self, moment: pd.Timestamp) -> bool:
        return self.session.allows(moment)

    def on_trade_closed(self, trade) -> None:
        """Rueckmeldung nach jedem geschlossenen Trade.

        Standardmaessig passiert nichts - lernende Strategien
        (:class:`propbot.learning.AdaptiveStrategy`) haengen sich hier ein und
        werten das Ergebnis noch waehrend des Laufs aus.
        """

    def __repr__(self) -> str:  # pragma: no cover - reine Bequemlichkeit
        return f"{type(self).__name__}({self.params()})"


def _session_name(hour_utc: int) -> str:
    if 0 <= hour_utc < 7:
        return "asien"
    if 7 <= hour_utc < 12:
        return "london"
    if 12 <= hour_utc < 17:
        return "overlap"
    if 17 <= hour_utc < 21:
        return "newyork"
    return "spaet"
