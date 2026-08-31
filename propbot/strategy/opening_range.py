"""Opening-Range-Breakout - der Klassiker auf Index-Futures.

Die Idee passt zur Struktur des Handelstags an einer US-Boerse: in den ersten
Minuten nach der Eroeffnung treffen die ueber Nacht aufgelaufenen Orders
aufeinander. Die Spanne, die sich dabei bildet (die *Opening Range*), ist die
Preiszone, auf die sich Kaeufer und Verkaeufer geeinigt haben. Verlaesst der
Kurs sie, hat eine Seite gewonnen - und genau dann steigt diese Strategie ein.

Warum das besser zu NQ passt als der Trend-Pullback:

* **Der Zeitpunkt ist definiert, nicht der Zustand.** Es wird nicht auf ein
  Muster gewartet, das irgendwann auftreten kann, sondern taeglich zur selben
  Zeit an einer klar bestimmten Marke gehandelt. Der Nasdaq-Future macht den
  Grossteil seiner Tagesbewegung in den ersten Stunden.
* **Das Risiko ist vorher bekannt.** Die Spanne der Eroeffnung *ist* der Stop.
  Damit steht schon um 09:45 fest, ob der Trade ins Risikobudget passt - das
  war beim Trend-Pullback das grosse Problem: dort ergab sich der Stopabstand
  erst aus dem Ruecksetzer und sprengte in 69 % der Faelle das Budget.
* **Wenige, klare Gelegenheiten.** Ein bis zwei Signale je Tag statt Dutzender
  Zufallstreffer.

Ablauf:

1. **Spanne messen** - Hoch und Tief der ersten ``range_minutes`` Minuten nach
   Handelsbeginn (Standard 15).
2. **Filter** - Die Spanne muss breit genug sein, damit sie etwas bedeutet, und
   schmal genug, dass der Stop ins Risikobudget passt. Beides wird in ATR
   gemessen, damit es ueber Jahre mit unterschiedlicher Volatilitaet gilt.
3. **Ausbruch** - Eine Kerze schliesst ueber dem Hoch (Long) bzw. unter dem
   Tief (Short) der Spanne, mit einem Puffer von ``breakout_buffer_atr``.
4. **Stop** - je nach ``stop_mode``: an der Gegenseite der Spanne, in ihrer
   Mitte, oder in ATR gemessen.
5. **Ziel** - ``reward_ratio`` mal die Stopdistanz.

Nach ``max_signals_per_day`` Ausbruechen ist der Tag beendet, spaetestens zur
``entry_deadline``.
"""

from __future__ import annotations

from dataclasses import dataclass

import pandas as pd

from ..indicators import atr
from ..models import Side, Signal
from .base import ArrayCache, SessionWindow, Strategy, StrategyParams

__all__ = ["OpeningRange", "OpeningRangeParams"]

#: Spalten, die :meth:`OpeningRange.signal` aus dem Array-Cache liest.
_COLUMNS = (
    "close",
    "atr",
    "or_high",
    "or_low",
    "or_width",
    "long_signal",
    "short_signal",
    "minute",
)


@dataclass(frozen=True, slots=True)
class OpeningRangeParams(StrategyParams):
    """Parameter des Opening-Range-Breakouts."""

    range_minutes: int = 15
    atr_period: int = 14
    min_range_atr: float = 0.5
    max_range_atr: float = 3.0
    breakout_buffer_atr: float = 0.05
    stop_mode: str = "range"
    stop_fraction: float = 1.0
    min_stop_atr: float = 0.5
    max_stop_atr: float = 3.0
    reward_ratio: float = 2.0
    entry_deadline_minutes: int = 210
    max_signals_per_day: int = 1
    allow_short: bool = True

    def __post_init__(self) -> None:
        if self.range_minutes < 1:
            raise ValueError("range_minutes muss mindestens 1 sein.")
        if self.stop_mode not in ("range", "fraction", "atr"):
            raise ValueError("stop_mode muss 'range', 'fraction' oder 'atr' sein.")
        if not 0 < self.stop_fraction <= 1:
            raise ValueError("stop_fraction muss zwischen 0 und 1 liegen.")
        if self.min_range_atr <= 0 or self.max_range_atr <= self.min_range_atr:
            raise ValueError("Es muss gelten: 0 < min_range_atr < max_range_atr.")
        if self.min_stop_atr <= 0 or self.max_stop_atr <= self.min_stop_atr:
            raise ValueError("Es muss gelten: 0 < min_stop_atr < max_stop_atr.")
        if self.reward_ratio <= 0:
            raise ValueError("reward_ratio muss positiv sein.")
        if self.max_signals_per_day < 1:
            raise ValueError("max_signals_per_day muss mindestens 1 sein.")


class OpeningRange(Strategy):
    """Ausbruch aus der Eroeffnungsspanne."""

    name = "opening_range"

    def __init__(
        self,
        params: OpeningRangeParams | None = None,
        session: SessionWindow | None = None,
    ) -> None:
        super().__init__(session or SessionWindow.us_futures_rth())
        self.p = params or OpeningRangeParams()
        self._cache = ArrayCache()

    @property
    def warmup(self) -> int:
        # Der ATR braucht Vorlauf; die Spanne selbst steht taeglich neu.
        return self.p.atr_period * 4

    # ------------------------------------------------------------- Vorarbeit
    def prepare(self, frame: pd.DataFrame) -> pd.DataFrame:
        """Rechnet Spanne, Filter und Ausbruchsbedingungen vor.

        Alles bleibt kausal: die Spanne eines Tages steht fest, sobald ihre
        Minuten vorbei sind, und sie wird nur auf Kerzen *danach* angewendet.
        """
        data = frame.copy()
        params = self.p
        data["atr"] = atr(data, params.atr_period)

        lokal = data.index.tz_convert(self.session.zeitzone)
        tag = pd.Index(lokal.date, name="tag")
        beginn = _minuten(self.session.start)
        minute = lokal.hour * 60 + lokal.minute - beginn
        data["minute"] = minute

        in_range = pd.Series((minute >= 0) & (minute < params.range_minutes), index=data.index)
        hoch = data["high"].where(in_range.values)
        tief = data["low"].where(in_range.values)
        data["or_high"] = hoch.groupby(tag.values).transform("max").values
        data["or_low"] = tief.groupby(tag.values).transform("min").values
        data["or_width"] = data["or_high"] - data["or_low"]

        nach_range = pd.Series(minute >= params.range_minutes, index=data.index)
        rechtzeitig = pd.Series(minute <= params.entry_deadline_minutes, index=data.index)
        breite_ok = (data["or_width"] >= params.min_range_atr * data["atr"]) & (
            data["or_width"] <= params.max_range_atr * data["atr"]
        )
        handelbar = nach_range & rechtzeitig & breite_ok & data["or_width"].gt(0)

        puffer = params.breakout_buffer_atr * data["atr"]
        ausbruch_hoch = handelbar & (data["close"] > data["or_high"] + puffer)
        ausbruch_tief = handelbar & (data["close"] < data["or_low"] - puffer)
        if not params.allow_short:
            ausbruch_tief &= False

        # Nur die ersten Ausbrueche des Tages zaehlen - danach ist Schluss.
        beide = (ausbruch_hoch | ausbruch_tief).fillna(False)
        nummer = beide.groupby(tag.values).cumsum()
        erste = beide & (nummer <= params.max_signals_per_day)

        data["long_signal"] = (ausbruch_hoch & erste).fillna(False)
        data["short_signal"] = (ausbruch_tief & erste).fillna(False)
        return data

    # ---------------------------------------------------------------- Signal
    def signal(self, frame: pd.DataFrame, index: int) -> Signal | None:
        if index < self.warmup:
            return None
        arrays = self._cache.arrays(frame, _COLUMNS)
        if arrays["long_signal"][index]:
            return self._build(Side.LONG, arrays, index)
        if arrays["short_signal"][index]:
            return self._build(Side.SHORT, arrays, index)
        return None

    def _build(self, side: Side, arrays: dict, index: int) -> Signal | None:
        params = self.p
        entry = float(arrays["close"][index])
        atr_value = float(arrays["atr"][index])
        hoch = float(arrays["or_high"][index])
        tief = float(arrays["or_low"][index])
        breite = hoch - tief
        if atr_value <= 0 or breite <= 0:
            return None

        if params.stop_mode == "range":
            roh = entry - tief if side is Side.LONG else hoch - entry
        elif params.stop_mode == "fraction":
            roh = breite * params.stop_fraction
        else:
            roh = atr_value

        distanz = max(
            params.min_stop_atr * atr_value, min(roh, params.max_stop_atr * atr_value)
        )
        if side is Side.LONG:
            stop = entry - distanz
            ziel = entry + params.reward_ratio * distanz
        else:
            stop = entry + distanz
            ziel = entry - params.reward_ratio * distanz

        return Signal(
            side=side,
            stop_price=stop,
            target_price=ziel,
            setup=f"{self.name}_{side.value}",
            context={
                "or_width": round(breite, 2),
                "or_width_atr": round(breite / atr_value, 2),
                "stop_atr": round(distanz / atr_value, 2),
                "minute": int(arrays["minute"][index]),
                "trend": "up" if side is Side.LONG else "down",
            },
        )

    def context(self, frame: pd.DataFrame, index: int) -> dict[str, float | str]:
        arrays = self._cache.arrays(frame, _COLUMNS)
        basis = super().context(frame, index)
        breite = float(arrays["or_width"][index])
        atr_value = float(arrays["atr"][index])
        basis["or_bucket"] = _bucket(breite / atr_value if atr_value else 0.0, (0.8, 1.3, 2.0))
        basis["minute_bucket"] = _bucket(float(arrays["minute"][index]), (30, 60, 120))
        return basis

    def params(self) -> dict[str, float | str]:
        return self.p.to_dict()


def _minuten(uhrzeit: str) -> int:
    stunde, _, minute = uhrzeit.partition(":")
    return int(stunde) * 60 + int(minute or 0)


def _bucket(wert: float, grenzen: tuple[float, ...]) -> str:
    for position, grenze in enumerate(grenzen):
        if wert < grenze:
            return f"q{position}"
    return f"q{len(grenzen)}"
