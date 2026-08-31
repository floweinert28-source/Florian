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
    """Wann darf gehandelt werden.

    Die Zeiten gelten in ``zeitzone`` - das ist bei Futures entscheidend. Die
    US-Kernhandelszeit beginnt um 09:30 New Yorker Zeit, also je nach
    Sommerzeit um 13:30 oder 14:30 UTC. Wer das Fenster fest in UTC angibt,
    handelt ein halbes Jahr lang die falsche Stunde.

    ``blackouts`` sind taegliche Sperrfenster (Eroeffnungsauktion,
    Nachrichtentermine). ``no_new_trades_after`` verhindert Einstiege kurz vor
    Schluss, ``flat_at`` schliesst alles Offene.
    """

    start: str = "07:00"
    end: str = "16:30"
    weekdays: tuple[int, ...] = (0, 1, 2, 3, 4)
    blackouts: tuple[tuple[str, str], ...] = (("13:25", "13:35"),)
    no_new_trades_after: str = "15:30"
    flat_at: str = "20:45"
    skip_friday_after: str | None = "15:00"
    zeitzone: str = "UTC"

    @classmethod
    def fx_london_ny(cls) -> "SessionWindow":
        """London plus fruehe New-York-Session, Sperrfenster um 13:30 UTC."""
        return cls()

    @classmethod
    def us_futures_rth(cls) -> "SessionWindow":
        """Kernhandelszeit der US-Boersen (09:30-16:00 New York).

        Bewusst ohne Overnight-Handel: der Bot geht jeden Tag vor dem Schluss
        flach. Auf einem Konto mit Trailing-Drawdown ist eine Position, die
        ueber Nacht durch duenne Liquiditaet laeuft, das schlechteste Risiko -
        sie kann den Boden reissen, waehrend niemand zuschaut.

        Die ersten 15 Minuten sind gesperrt: die Eroeffnungsauktion erzeugt
        Spitzen, die jeden ATR-Stop zur Lotterie machen.
        """
        return cls(
            start="09:30",
            end="16:00",
            blackouts=(("09:30", "09:45"), ("14:00", "14:05")),
            no_new_trades_after="15:15",
            flat_at="15:50",
            skip_friday_after="15:00",
            zeitzone="America/New_York",
        )

    def lokal(self, moment: pd.Timestamp) -> pd.Timestamp:
        """Rechnet einen Zeitpunkt in die Zeitzone der Session um."""
        if moment.tzinfo is None:
            moment = moment.tz_localize("UTC")
        if self.zeitzone == "UTC":
            return moment
        return moment.tz_convert(self.zeitzone)

    def allows(self, moment: pd.Timestamp) -> bool:
        """Darf zu diesem Zeitpunkt ein *neuer* Trade eroeffnet werden?"""
        moment = self.lokal(moment)
        if moment.weekday() not in self.weekdays:
            return False
        now = moment.time()
        if not (_parse_clock(self.start) <= now <= _parse_clock(self.no_new_trades_after)):
            return False
        if self.skip_friday_after and moment.weekday() == 4:
            if now >= _parse_clock(self.skip_friday_after):
                return False
        for begin, finish in self.blackouts:
            # Ende exklusiv: das Sperrfenster 09:30-09:45 meint die ersten 15
            # Minuten. Die Kerze, die *um* 09:45 beginnt, gehoert nicht mehr
            # dazu - sonst blockiert der Filter beim Opening-Range-Breakout
            # ausgerechnet das erste handelbare Signal des Tages.
            if _parse_clock(begin) <= now < _parse_clock(finish):
                return False
        return True

    def must_be_flat(self, moment: pd.Timestamp) -> bool:
        """Muss eine offene Position jetzt geschlossen werden?

        Offen sein darf sie nur zwischen ``start`` und ``flat_at``. Alles
        davor und danach ist Feierabend - auch der Vormittag, falls eine
        Position durch eine Datenluecke uebrig geblieben ist.

        (Fenster ueber Mitternacht hinweg unterstuetzt diese Pruefung nicht;
        alle mitgelieferten Profile enden am selben Tag.)
        """
        moment = self.lokal(moment)
        now = moment.time()
        return now >= _parse_clock(self.flat_at) or now < _parse_clock(self.start)

    def describe(self) -> str:
        blackouts = ", ".join(f"{a}-{b}" for a, b in self.blackouts) or "keine"
        return (
            f"{self.start}-{self.end} {self.zeitzone}, neue Trades bis "
            f"{self.no_new_trades_after}, flat um {self.flat_at}, "
            f"Sperrfenster: {blackouts}"
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
