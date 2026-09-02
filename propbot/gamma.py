"""Gamma-Exposure aus oeffentlichen CBOE-Daten.

Marktmacher, die Optionen verkauft haben, hedgen ihre Position im Basiswert.
Bei **positivem** Gamma verkaufen sie in Staerke und kaufen in Schwaeche - das
daempft Bewegungen. Bei **negativem** Gamma ist es umgekehrt, sie verstaerken
die Bewegung. Der Kurs, an dem das Vorzeichen kippt ("Gamma Flip"), ist deshalb
eine oft beachtete Marke.

**Was dieses Modul kann und was nicht:**

* Es liest die frei verfuegbaren, **verzoegerten** Optionsketten von CBOE
  (NDX und QQQ) und rechnet daraus Gamma je Strike, die Gesamtsumme und den
  Nulldurchgang aus.
* Es ist damit ein **Live-Filter**, kein Backtest-Werkzeug: CBOE liefert nur
  den aktuellen Stand, keine Historie. Ob Gamma die Trefferquote verbessert,
  laesst sich mit diesen Daten **nicht** nachweisen - dafuer braeuchte es
  historische Optionsketten (kostenpflichtig).
* Die Zahlen sind Naeherungen: Open Interest ist vom Vortag, die Aufteilung in
  Call- und Put-Gamma unterstellt die uebliche Annahme "Calls von Haendlern
  long, Puts short".

Wer es benutzt, sollte es als Kontext lesen ("heute daempfendes Umfeld"), nicht
als Signal.
"""

from __future__ import annotations

import json
import urllib.request
from dataclasses import dataclass, field
from datetime import date, datetime, timezone

import numpy as np

__all__ = ["GammaProfil", "lade_kette", "rechne_gamma"]

_URL = "https://cdn.cboe.com/api/global/delayed_quotes/options/{symbol}.json"
_KOPF = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64)"}

#: Kontraktgroesse je Basiswert (Multiplikator der Option).
_MULTIPLIKATOR = {"_NDX": 100, "QQQ": 100, "_SPX": 100, "SPY": 100}


@dataclass(slots=True)
class GammaProfil:
    """Gamma-Landschaft eines Basiswerts."""

    symbol: str
    kurs: float
    stand: datetime
    netto_gamma: float
    flip_kurs: float | None
    je_strike: dict[float, float] = field(default_factory=dict)
    verfall: date | None = None

    @property
    def regime(self) -> str:
        return "positiv" if self.netto_gamma > 0 else "negativ"

    @property
    def deutung(self) -> str:
        if self.netto_gamma > 0:
            return (
                "Positives Gamma: Haendler hedgen gegen die Bewegung, Ausschlaege "
                "werden gedaempft. Ausbrueche laufen seltener weit."
            )
        return (
            "Negatives Gamma: Haendler hedgen mit der Bewegung, Ausschlaege werden "
            "verstaerkt. Ausbrueche haben mehr Schub - und mehr Rutschgefahr."
        )

    def groesste_strikes(self, anzahl: int = 5) -> list[tuple[float, float]]:
        """Die Strikes mit dem meisten Gamma - oft Magnete oder Bremsen."""
        return sorted(self.je_strike.items(), key=lambda p: -abs(p[1]))[:anzahl]

    def describe(self) -> str:
        flip = f"{self.flip_kurs:,.0f}" if self.flip_kurs else "nicht bestimmbar"
        zeilen = [
            f"Gamma-Profil {self.symbol} (Stand {self.stand:%Y-%m-%d %H:%M} UTC, verzoegert)",
            f"  Kurs:          {self.kurs:,.2f}",
            f"  Netto-Gamma:   {self.netto_gamma / 1e6:+,.1f} Mio. $ je 1 % Bewegung "
            f"({self.regime})",
            f"  Gamma-Flip:    {flip}",
            f"  {self.deutung}",
            "  Groesste Strikes:",
        ]
        for strike, wert in self.groesste_strikes():
            zeilen.append(f"    {strike:>10,.0f}  {wert / 1e6:>+8.1f} Mio. $")
        return "\n".join(zeilen)


def lade_kette(symbol: str = "_NDX", timeout: int = 60) -> dict:
    """Laedt die verzoegerte Optionskette von CBOE."""
    request = urllib.request.Request(_URL.format(symbol=symbol), headers=_KOPF)
    with urllib.request.urlopen(request, timeout=timeout) as antwort:
        return json.load(antwort)


def rechne_gamma(kette: dict, *, symbol: str = "_NDX", max_abstand: float = 0.15) -> GammaProfil:
    """Rechnet aus einer Optionskette das Gamma-Profil aus.

    ``max_abstand`` begrenzt die beruecksichtigten Strikes auf einen Bereich um
    den aktuellen Kurs (Standard 15 %) - weit entfernte Strikes tragen kaum
    etwas bei und verzerren den Nulldurchgang.
    """
    daten = kette.get("data", {})
    kurs = float(daten.get("current_price") or daten.get("close") or 0)
    if kurs <= 0:
        raise ValueError("Kein Kurs in der Optionskette gefunden.")
    multiplikator = _MULTIPLIKATOR.get(symbol, 100)

    je_strike: dict[float, float] = {}
    for option in daten.get("options", []):
        name = option.get("option", "")
        gamma = float(option.get("gamma") or 0)
        oi = float(option.get("open_interest") or 0)
        if not name or gamma == 0 or oi == 0:
            continue
        # Namensschema: QQQ260831C00490000 -> Typ C/P, Strike in 1/1000 Dollar
        try:
            typ = name[-9]
            strike = float(name[-8:]) / 1000
        except (IndexError, ValueError):
            continue
        if abs(strike / kurs - 1) > max_abstand:
            continue
        vorzeichen = 1.0 if typ == "C" else -1.0
        beitrag = vorzeichen * gamma * oi * multiplikator * kurs * kurs * 0.01
        je_strike[strike] = je_strike.get(strike, 0.0) + beitrag

    netto = float(sum(je_strike.values()))
    return GammaProfil(
        symbol=symbol,
        kurs=kurs,
        stand=datetime.now(timezone.utc),
        netto_gamma=netto,
        flip_kurs=_finde_flip(je_strike, kurs),
        je_strike=je_strike,
    )


def _finde_flip(je_strike: dict[float, float], kurs: float) -> float | None:
    """Sucht den Kurs, an dem das kumulierte Gamma das Vorzeichen wechselt."""
    if not je_strike:
        return None
    strikes = np.array(sorted(je_strike))
    werte = np.array([je_strike[s] for s in strikes])
    kumuliert = np.cumsum(werte)
    wechsel = np.flatnonzero(np.sign(kumuliert[:-1]) != np.sign(kumuliert[1:]))
    if not len(wechsel):
        return None
    # den Wechsel nehmen, der dem aktuellen Kurs am naechsten liegt
    kandidaten = strikes[wechsel]
    return float(kandidaten[np.argmin(np.abs(kandidaten - kurs))])
