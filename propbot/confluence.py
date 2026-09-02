"""Confluence-Schicht: bewertet ein Signal anhand des Marktkontexts.

Die Schicht legt sich um eine beliebige Strategie und laesst nur Signale durch,
die genug Punkte sammeln. Jede Bedingung stammt aus der Merkmalsstudie auf fuenf
Jahren NQ und hat dort den Out-of-Sample-Test bestanden (Details in PROPBOT.md,
Kapitel 15). Merkmale, die nur in-sample funktionierten - Gap, Innentag,
Engulfing, Dochte, Vortagsrichtung -, sind bewusst **nicht** dabei.

Das gemeinsame Thema der Befunde: **ein Ausbruch taugt nichts, wenn die
Bewegung schon gelaufen ist.** Hohes Momentum, hoher RSI, steiler VWAP und ein
Kurs weit ueber dem Vortageshoch sind alle negativ. Positiv sind dagegen die
Lage zum VWAP, die Richtung des Mehrtagestrends und eine spaetere Uhrzeit.

Bewusst als **Punktesystem** und nicht als harte Und-Verknuepfung: einzelne
Bedingungen sind schwach und verrauscht: fünf harte Filter hintereinander
lassen fast nichts uebrig und passen sich an die Stichprobe an. Eine Summe ist
robuster.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd

from .features import baue_features
from .models import Side, Signal
from .strategy.base import Strategy

__all__ = ["BEDINGUNGEN", "ConfluenceSettings", "ConfluenceStrategy"]

#: Name -> (Spalte, Richtung, Schwelle). Richtung +1: Wert soll ueber der
#: Schwelle liegen, -1: darunter. Richtungsabhaengige Werte werden fuer Shorts
#: gespiegelt.
BEDINGUNGEN: dict[str, tuple[str, int, float]] = {
    "ueber_vwap": ("vwap_abstand", +1, 0.0),
    "nicht_ueberdehnt": ("roc_8", -1, 0.35),
    "rsi_nicht_extrem": ("rsi", -1, 68.0),
    "vwap_nicht_steil": ("vwap_steigung", -1, 0.55),
    "platz_bis_pdh": ("pdh_abstand", -1, 0.6),
    "mehrtagestrend": ("tagesrichtung_5", +1, 0.5),
    "nicht_zu_frueh": ("minute", +1, 20.0),
}


@dataclass(frozen=True, slots=True)
class ConfluenceSettings:
    """Welche Bedingungen zaehlen und wie viele noetig sind."""

    mindestpunkte: int = 4
    bedingungen: tuple[str, ...] = tuple(BEDINGUNGEN)
    zeitzone: str = "America/New_York"

    def __post_init__(self) -> None:
        unbekannt = set(self.bedingungen) - set(BEDINGUNGEN)
        if unbekannt:
            raise ValueError(f"Unbekannte Bedingungen: {', '.join(sorted(unbekannt))}")
        if not 0 <= self.mindestpunkte <= len(self.bedingungen):
            raise ValueError(f"mindestpunkte muss zwischen 0 und {len(self.bedingungen)} liegen.")


#: Merkmale, deren Vorzeichen von der Handelsrichtung abhaengt.
_GESPIEGELT = {"vwap_abstand", "roc_8", "vwap_steigung", "pdh_abstand", "tagesrichtung_5"}


class ConfluenceStrategy(Strategy):
    """Huelle, die Signale nach Marktkontext bewertet."""

    def __init__(self, basis: Strategy, settings: ConfluenceSettings | None = None) -> None:
        super().__init__(basis.session)
        self.basis = basis
        self.settings = settings or ConfluenceSettings()
        self.name = f"confluence_{basis.name}"
        self.verworfen = 0
        self.punkte_verlauf: list[int] = []
        self._kontext: pd.DataFrame | None = None
        self._fingerabdruck: tuple | None = None

    @property
    def warmup(self) -> int:
        return max(self.basis.warmup, 60)

    def prepare(self, frame: pd.DataFrame) -> pd.DataFrame:
        self._kontext = baue_features(frame, zeitzone=self.settings.zeitzone)
        self._fingerabdruck = (len(frame), frame.index[0], frame.index[-1])
        return self.basis.prepare(frame)

    def signal(self, frame: pd.DataFrame, index: int) -> Signal | None:
        signal = self.basis.signal(frame, index)
        if signal is None:
            return None
        self._sichere_kontext(frame)
        punkte, erfuellt = self.bewerte(index, signal.side)
        self.punkte_verlauf.append(punkte)
        if punkte < self.settings.mindestpunkte:
            self.verworfen += 1
            return None
        signal.context["confluence"] = punkte
        signal.context["confluence_details"] = ",".join(erfuellt)
        return signal

    def bewerte(self, index: int, seite: Side) -> tuple[int, list[str]]:
        """Zaehlt die erfuellten Bedingungen fuer ein Signal."""
        zeile = self._kontext.iloc[index]
        vorzeichen = 1 if seite is Side.LONG else -1
        punkte, erfuellt = 0, []
        for name in self.settings.bedingungen:
            spalte, richtung, schwelle = BEDINGUNGEN[name]
            wert = zeile.get(spalte, np.nan)
            if wert is None or (isinstance(wert, float) and np.isnan(wert)):
                continue
            if spalte in _GESPIEGELT:
                wert = wert * vorzeichen
            elif spalte == "rsi" and seite is Side.SHORT:
                wert = 100 - wert
            if (richtung > 0 and wert >= schwelle) or (richtung < 0 and wert <= schwelle):
                punkte += 1
                erfuellt.append(name)
        return punkte, erfuellt

    def _sichere_kontext(self, frame: pd.DataFrame) -> None:
        if self._fingerabdruck != (len(frame), frame.index[0], frame.index[-1]):
            self._kontext = baue_features(frame, zeitzone=self.settings.zeitzone)
            self._fingerabdruck = (len(frame), frame.index[0], frame.index[-1])

    def context(self, frame: pd.DataFrame, index: int) -> dict[str, float | str]:
        basis = self.basis.context(frame, index)
        if self._kontext is not None and index < len(self._kontext):
            zeile = self._kontext.iloc[index]
            basis["vwap_seite"] = "ueber" if zeile.get("vwap_abstand", 0) > 0 else "unter"
        return basis

    def params(self) -> dict[str, float | str]:
        werte = dict(self.basis.params())
        werte["confluence_min"] = self.settings.mindestpunkte
        werte["confluence_checks"] = len(self.settings.bedingungen)
        return werte

    def on_trade_closed(self, trade) -> None:
        self.basis.on_trade_closed(trade)

    def report(self) -> str:
        if not self.punkte_verlauf:
            return "Confluence: keine Signale bewertet."
        verteilung = pd.Series(self.punkte_verlauf).value_counts().sort_index()
        zeilen = [f"Confluence-Punkte (Mindestwert {self.settings.mindestpunkte}):"]
        for punkte, anzahl in verteilung.items():
            markierung = " <- gehandelt" if punkte >= self.settings.mindestpunkte else ""
            zeilen.append(f"  {punkte} Punkte: {anzahl:>4} Signale{markierung}")
        zeilen.append(f"  verworfen: {self.verworfen} von {len(self.punkte_verlauf)}")
        return "\n".join(zeilen)
