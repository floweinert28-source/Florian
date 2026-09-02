"""Intraday-Momentum: hat sich der Tag schon weiter bewegt als ein normaler Tag?

Diese Strategie stammt nicht von mir. Sie folgt Gao, Han, Li und Zhou,
*Market Intraday Momentum* (Journal of Financial Economics, 2018): die
Bewegung eines Handelstages sagt ihre eigene Fortsetzung voraus, und zwar
umso deutlicher, je volatiler der Tag ist. Das ist eine veroeffentlichte,
mehrfach unabhaengig geprueft Beobachtung - kein Muster, das ich aus fuenf
Jahren NQ herausoptimiert habe.

**Der Unterschied zu Opening Range und Squeeze.** Beide messen eine *lokale*
Spanne: die ersten 15 Minuten, oder die letzten sechs Kerzen. Diese Strategie
misst gegen die **Tageseroeffnung** und fragt:

    Wie weit ist der Markt bis zu dieser Uhrzeit typischerweise vom
    Eroeffnungskurs entfernt - und ist er heute weiter?

Daraus entsteht ein Band um den Eroeffnungskurs, das im Tagesverlauf breiter
wird, weil sich der Markt mit der Zeit weiter entfernt. Bricht der Kurs aus
diesem Band, war die heutige Bewegung ungewoehnlich gross; dann trage sie
weiter. Bleibt er drin, ist nichts passiert.

**Warum das die Frequenz bringt, die ORB und Squeeze nicht liefern.** Das Band
existiert an *jedem* Punkt des Tages, nicht nur nach einer Verengung. Der Kurs
kann es mehrfach kreuzen. Damit sind mehrere Signale am Tag strukturell
moeglich, ohne dass man den Zeitrahmen ins Absurde verkleinern muesste.

**Das Band ist rein historisch gerechnet.** ``sigma`` fuer die Minute *m*
kommt aus den letzten ``lookback_tage`` Tagen an derselben Minute, um einen
Tag versetzt. Der heutige Tag geht nie in seine eigene Schwelle ein - sonst
waere das Band ein Blick in die Zukunft und der ganze Test wertlos.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd

from ..features import baue_features
from ..models import Side, Signal
from .base import ArrayCache, SessionWindow, Strategy, StrategyParams

__all__ = ["IntradayMomentum", "IntradayMomentumParams"]

_COLUMNS = (
    "close",
    "atr",
    "vwap",
    "im_open",
    "im_band",
    "minute",
    "long_signal",
    "short_signal",
)


@dataclass(frozen=True, slots=True)
class IntradayMomentumParams(StrategyParams):
    """Parameter des Intraday-Momentums."""

    # Wie viele vergangene Tage die typische Auslenkung je Uhrzeit bestimmen.
    # Das Paper nimmt 14; laengere Fenster glaetten Regimewechsel besser, ohne
    # dass die Schwelle traege wird - sie waechst ja ohnehin mit der Uhrzeit.
    lookback_tage: int = 30
    # Vielfaches der typischen Auslenkung, ab dem ein Tag "ungewoehnlich" ist.
    band_faktor: float = 1.0
    # Der Stop sitzt am Band, nicht an einem ATR-Vielfachen: das Band ist die
    # Grenze, deren Bruch das Signal ausgeloest hat. Faellt der Kurs zurueck,
    # war der Ausbruch falsch. Die ATR-Klammer verhindert nur Entartungen.
    min_stop_atr: float = 0.5
    max_stop_atr: float = 2.5
    reward_ratio: float = 1.5
    min_minute: int = 20
    max_minute: int = 345
    cooldown_bars: int = 10
    max_signals_per_day: int = 8
    # Nur handeln, wenn der Kurs auf derselben Seite des VWAP steht wie das
    # Signal - das einzige Richtungsmerkmal, das sich in Kapitel 15 gehalten hat.
    require_vwap_side: bool = True
    min_atr_pct: float | None = 0.05
    max_atr_pct: float | None = 0.6
    allow_short: bool = True

    def __post_init__(self) -> None:
        if self.lookback_tage < 5:
            raise ValueError("lookback_tage muss mindestens 5 sein.")
        if self.band_faktor <= 0:
            raise ValueError("band_faktor muss positiv sein.")
        if self.min_stop_atr <= 0 or self.max_stop_atr <= self.min_stop_atr:
            raise ValueError("Es muss gelten: 0 < min_stop_atr < max_stop_atr.")
        if self.reward_ratio <= 0:
            raise ValueError("reward_ratio muss positiv sein.")
        if self.cooldown_bars < 0:
            raise ValueError("cooldown_bars darf nicht negativ sein.")
        if self.max_signals_per_day < 1:
            raise ValueError("max_signals_per_day muss mindestens 1 sein.")


class IntradayMomentum(Strategy):
    """Ausbruch aus dem taeglichen Normalbereich um die Eroeffnung."""

    name = "intraday_momentum"

    def __init__(
        self,
        params: IntradayMomentumParams | None = None,
        session: SessionWindow | None = None,
    ) -> None:
        super().__init__(session or SessionWindow.us_futures_rth())
        self.p = params or IntradayMomentumParams()
        self._cache = ArrayCache()

    @property
    def warmup(self) -> int:
        return 80

    # ------------------------------------------------------------- Vorarbeit
    def prepare(self, frame: pd.DataFrame) -> pd.DataFrame:
        p = self.p
        d = baue_features(frame, zeitzone=self.session.zeitzone)
        lokal = d.index.tz_convert(self.session.zeitzone)
        tag = pd.Index(lokal.date)

        # Eroeffnungskurs des Tages, auf jede Kerze des Tages verteilt.
        d["im_open"] = d.groupby(tag)["open"].transform("first")

        # Relative Auslenkung von der Eroeffnung.
        auslenkung = (d["close"] - d["im_open"]) / d["im_open"]

        # Typische Auslenkung *zu dieser Uhrzeit*, aus den letzten Tagen.
        # Entscheidend: shift(1) je Minute, damit der heutige Wert nicht in
        # seine eigene Schwelle eingeht.
        je_minute = auslenkung.abs().groupby(d["minute"])
        typisch = je_minute.transform(
            lambda s: (
                s.shift(1).rolling(p.lookback_tage, min_periods=max(5, p.lookback_tage // 3)).mean()
            )
        )
        d["im_band"] = (typisch * p.band_faktor).to_numpy()

        oben = d["im_open"] * (1.0 + d["im_band"])
        unten = d["im_open"] * (1.0 - d["im_band"])

        zeit_ok = (d["minute"] >= p.min_minute) & (d["minute"] <= p.max_minute)
        vola = d["atr"] / d["close"] * 100
        vola_ok = pd.Series(True, index=d.index)
        if p.min_atr_pct is not None:
            vola_ok &= vola >= p.min_atr_pct
        if p.max_atr_pct is not None:
            vola_ok &= vola <= p.max_atr_pct
        basis = zeit_ok & vola_ok & d["im_band"].gt(0)

        # Der *Bruch* zaehlt, nicht der Zustand: die vorige Kerze war drin.
        raus_hoch = basis & (d["close"] > oben) & (d["close"].shift(1) <= oben.shift(1))
        raus_tief = basis & (d["close"] < unten) & (d["close"].shift(1) >= unten.shift(1))
        if p.require_vwap_side:
            raus_hoch &= d["close"] > d["vwap"]
            raus_tief &= d["close"] < d["vwap"]
        if not p.allow_short:
            raus_tief &= False

        roh = (raus_hoch | raus_tief).fillna(False)
        gewaehlt = _mit_abstand(
            roh.to_numpy(), tag.to_numpy(), p.cooldown_bars, p.max_signals_per_day
        )
        d["long_signal"] = raus_hoch.fillna(False).to_numpy() & gewaehlt
        d["short_signal"] = raus_tief.fillna(False).to_numpy() & gewaehlt
        return d

    # ---------------------------------------------------------------- Signal
    def signal(self, frame: pd.DataFrame, index: int) -> Signal | None:
        if index < self.warmup:
            return None
        a = self._cache.arrays(frame, _COLUMNS)
        if a["long_signal"][index]:
            return self._build(Side.LONG, a, index)
        if a["short_signal"][index]:
            return self._build(Side.SHORT, a, index)
        return None

    def _build(self, seite: Side, a: dict, index: int) -> Signal | None:
        p = self.p
        einstieg = float(a["close"][index])
        atr_wert = float(a["atr"][index])
        if atr_wert <= 0:
            return None
        # Stop auf der anderen Seite des Bandes: dort war der Ausbruch falsch.
        eroeffnung = float(a["im_open"][index])
        band = float(a["im_band"][index])
        grenze = eroeffnung * (1.0 + seite.sign * band)
        roh = abs(einstieg - grenze)
        distanz = max(p.min_stop_atr * atr_wert, min(roh, p.max_stop_atr * atr_wert))
        stop = einstieg - seite.sign * distanz
        ziel = einstieg + seite.sign * p.reward_ratio * distanz
        return Signal(
            side=seite,
            stop_price=stop,
            target_price=ziel,
            setup=f"{self.name}_{seite.value}",
            context={
                "band_pct": round(band * 100, 3),
                "stop_atr": round(distanz / atr_wert, 2),
                "minute": int(a["minute"][index]),
            },
        )

    def context(self, frame: pd.DataFrame, index: int) -> dict[str, float | str]:
        a = self._cache.arrays(frame, _COLUMNS)
        basis = super().context(frame, index)
        basis["stunde"] = int(float(a["minute"][index]) // 60)
        return basis

    def params(self) -> dict[str, float | str]:
        return self.p.to_dict()


def _mit_abstand(roh: np.ndarray, tag: np.ndarray, abstand: int, max_pro_tag: int) -> np.ndarray:
    """Mindestabstand in Kerzen und Tageshoechstzahl."""
    behalten = np.zeros(len(roh), dtype=bool)
    letzter = -(10**9)
    zaehler = 0
    aktueller_tag = None
    for i in np.flatnonzero(roh):
        if tag[i] != aktueller_tag:
            aktueller_tag = tag[i]
            zaehler = 0
            letzter = -(10**9)
        if i - letzter <= abstand or zaehler >= max_pro_tag:
            continue
        behalten[i] = True
        letzter = i
        zaehler += 1
    return behalten
