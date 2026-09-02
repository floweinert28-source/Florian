"""Datenquellen gegeneinander pruefen.

Der Backtest laeuft auf Dukascopy-CFD-Kursen des Nasdaq-100. Gehandelt wird
aber der CME-Future NQ. Bevor irgendein Ergebnis zaehlt, muss geklaert sein,
wie weit beide auseinanderliegen - sonst optimiert man auf ein Instrument, das
man gar nicht handelt.

Verglichen wird nicht das Preisniveau (der Future notiert wegen Zinsen und
Dividenden mit einem Aufschlag zum Index, der bis zum Verfall schrumpft),
sondern die **Renditen**: nur sie entscheiden ueber Gewinn und Verlust.
"""

from __future__ import annotations

import json
import time
import urllib.parse
import urllib.request
from dataclasses import dataclass
from typing import TYPE_CHECKING

import numpy as np
import pandas as pd

if TYPE_CHECKING:  # pragma: no cover - nur fuer Typpruefer
    from .strategy.base import SessionWindow

__all__ = ["Vergleich", "lade_yahoo", "vergleiche_quellen"]

_KOPF = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64)"}


def lade_yahoo(symbol: str = "NQ=F", intervall: str = "1h", tage: int = 720) -> pd.DataFrame:
    """Laedt Kerzen von Yahoo Finance (echte Futuresdaten).

    Grenzen der Quelle: 15-Minuten-Kerzen gibt es nur fuer 60 Tage,
    Stundenkerzen fuer rund 730 Tage, Tageskerzen unbegrenzt. Fuer den
    Fuenfjahres-Backtest reicht das nicht - fuer eine Gegenprobe schon.
    """
    jetzt = int(time.time())
    url = (
        f"https://query1.finance.yahoo.com/v8/finance/chart/"
        f"{urllib.parse.quote(symbol)}?interval={intervall}"
        f"&period1={jetzt - tage * 86400}&period2={jetzt}"
    )
    request = urllib.request.Request(url, headers=_KOPF)
    for versuch in range(4):
        try:
            with urllib.request.urlopen(request, timeout=45) as antwort:
                nutzlast = json.load(antwort)
            break
        except Exception:
            if versuch == 3:
                raise
            time.sleep(2 * (versuch + 1))

    ergebnis = nutzlast["chart"]["result"]
    if not ergebnis:
        raise RuntimeError(f"Yahoo liefert keine Daten fuer {symbol}: {nutzlast['chart']}")
    daten = ergebnis[0]
    kurse = daten["indicators"]["quote"][0]
    frame = pd.DataFrame(
        {
            "open": kurse["open"],
            "high": kurse["high"],
            "low": kurse["low"],
            "close": kurse["close"],
            "volume": kurse.get("volume") or [0] * len(daten["timestamp"]),
        },
        index=pd.DatetimeIndex(pd.to_datetime(daten["timestamp"], unit="s", utc=True), name="time"),
    )
    return frame.dropna(subset=["open", "high", "low", "close"]).astype(float)


@dataclass(slots=True)
class Vergleich:
    """Ergebnis des Quellenvergleichs."""

    kerzen: int
    korrelation: float
    mittlere_abweichung_punkte: float
    mittlere_abweichung_prozent: float
    aufschlag_punkte: float
    tracking_error_bp: float

    @property
    def brauchbar(self) -> bool:
        """Taugt die Ersatzquelle fuer Strategieentwicklung?"""
        return self.korrelation >= 0.97 and self.tracking_error_bp <= 20

    def describe(self) -> str:
        urteil = (
            "Die Ersatzquelle bildet den Future gut genug ab."
            if self.brauchbar
            else "ACHTUNG: die Quellen laufen zu weit auseinander."
        )
        return (
            f"Vergleich ueber {self.kerzen:,} gemeinsame Stunden:\n"
            f"  Korrelation der Renditen: {self.korrelation:.4f}\n"
            f"  Tracking Error:           {self.tracking_error_bp:.1f} Basispunkte je Stunde\n"
            f"  Mittlere Preisdifferenz:  {self.aufschlag_punkte:+.1f} Punkte "
            f"({self.mittlere_abweichung_prozent:.2f} % im Betrag)\n"
            f"  {urteil}"
        )


def vergleiche_quellen(
    ersatz: pd.DataFrame,
    original: pd.DataFrame,
    *,
    regel: str = "1h",
    fenster: "SessionWindow | None" = None,
) -> Vergleich:
    """Vergleicht zwei Kursreihen ueber ihre gemeinsame Zeit.

    ``fenster`` beschraenkt den Vergleich auf die Handelszeit. Das ist kein
    Schoenrechnen, sondern noetig: ausserhalb der Kernhandelszeit stehen
    CFD-Kurse oft still, waehrend der Future weiterlaeuft. Wer nur in der
    Kernzeit handelt, muss auch nur dort Uebereinstimmung verlangen - und
    sollte die Indikatoren dann ebenfalls nur auf diesen Kerzen rechnen.
    """
    from .data import resample

    a = resample(ersatz, regel)["close"] if regel else ersatz["close"]
    b = resample(original, regel)["close"] if regel else original["close"]
    gemeinsam = a.index.intersection(b.index)
    if fenster is not None:
        behalten = [
            zeitpunkt
            for zeitpunkt in gemeinsam
            if not fenster.must_be_flat(zeitpunkt) and zeitpunkt.weekday() < 5
        ]
        gemeinsam = pd.DatetimeIndex(behalten, name=gemeinsam.name)
    if len(gemeinsam) < 50:
        raise ValueError(f"Nur {len(gemeinsam)} gemeinsame Zeitpunkte - Vergleich waere sinnlos.")
    a, b = a.loc[gemeinsam], b.loc[gemeinsam]

    rendite_a = a.pct_change().dropna()
    rendite_b = b.pct_change().dropna()
    zusammen = pd.concat([rendite_a, rendite_b], axis=1).dropna()
    korrelation = float(zusammen.iloc[:, 0].corr(zusammen.iloc[:, 1]))
    differenz = zusammen.iloc[:, 0] - zusammen.iloc[:, 1]

    return Vergleich(
        kerzen=len(gemeinsam),
        korrelation=korrelation,
        mittlere_abweichung_punkte=float((a - b).abs().mean()),
        mittlere_abweichung_prozent=float(((a - b).abs() / b * 100).mean()),
        aufschlag_punkte=float((b - a).mean()),
        tracking_error_bp=float(np.std(differenz) * 10_000),
    )
