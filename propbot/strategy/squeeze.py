"""Squeeze-Breakout: jede Verengung im Tagesverlauf ist eine Gelegenheit.

Der Opening-Range-Breakout funktioniert, weil er eine Regel befolgt: warte, bis
sich der Markt auf eine enge Spanne geeinigt hat, und handle den Bruch dieser
Einigung - mit dem Stop auf der anderen Seite der Spanne. Er wendet diese Regel
allerdings **einmal am Tag** an, auf die Eroeffnung.

Dieses Setup wendet dieselbe Regel **den ganzen Tag** an. Immer wenn sich die
Spanne der letzten ``squeeze_bars`` Kerzen auf weniger als ``max_range_atr``
ATR zusammenzieht, entsteht eine neue Mikro-Range. Ihr Bruch ist das Signal,
die Gegenseite der Range ist der Stop.

Warum das die richtige Verallgemeinerung ist - alles aus der Merkmalsstudie
(PROPBOT.md, Kapitel 15) auf fuenf Jahren NQ:

* **Ein struktureller Stop schlaegt jeden ATR-Stop.** Beim Opening Range
  brachte die Gegenseite der Spanne +0,127 R, ein ATR-Stop +0,051 R und ein
  halbierter Stop +0,011 R.
* **Ueberdehnung ist der Feind.** Momentum, RSI und VWAP-Steigung wirken alle
  negativ. Eine Verengung ist das genaue Gegenteil von Ueberdehnung - der Markt
  hat sich beruhigt, bevor er losgeht.
* **Lage zum VWAP und Mehrtagestrend** sind die einzigen positiven
  Richtungsmerkmale und daher als Filter eingebaut.

Der Zweck ist Frequenz: das Ziel sind vier handelbare Signale am Tag statt
einem alle drei Tage. Ob der Vorteil bei dieser Frequenz erhalten bleibt, muss
der Walk-Forward zeigen - Frequenz allein ist wertlos.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd

from ..features import baue_features
from ..models import Side, Signal
from .base import ArrayCache, SessionWindow, Strategy, StrategyParams

__all__ = ["SqueezeBreakout", "SqueezeBreakoutParams"]

_COLUMNS = (
    "close",
    "atr",
    "sq_high",
    "sq_low",
    "sq_width",
    "minute",
    "long_signal",
    "short_signal",
)


@dataclass(frozen=True, slots=True)
class SqueezeBreakoutParams(StrategyParams):
    """Parameter des Squeeze-Breakouts."""

    squeeze_bars: int = 6
    # Eine Verengung ist *relativ* definiert: die aktuelle Spanne muss zu den
    # engsten `squeeze_quantil` der letzten `quantil_fenster` Kerzen gehoeren.
    # Eine feste ATR-Schwelle waere falsch geeicht - die Spanne ueber sechs
    # Kerzen betraegt im Median 2,2 ATR, nicht 1 ATR, und das verschiebt sich
    # je nach Instrument und Zeitrahmen.
    squeeze_quantil: float = 0.30
    quantil_fenster: int = 78
    max_range_atr: float = 2.5
    min_range_atr: float = 0.25
    breakout_buffer_atr: float = 0.05
    min_stop_atr: float = 0.35
    max_stop_atr: float = 1.6
    reward_ratio: float = 1.5
    min_minute: int = 15
    max_minute: int = 345
    cooldown_bars: int = 6
    max_signals_per_day: int = 6
    min_atr_pct: float | None = 0.05
    max_atr_pct: float | None = 0.5
    require_vwap_side: bool = True
    max_momentum: float = 0.8
    require_trend: bool = False
    allow_short: bool = True

    def __post_init__(self) -> None:
        if self.squeeze_bars < 2:
            raise ValueError("squeeze_bars muss mindestens 2 sein.")
        if self.min_range_atr <= 0 or self.max_range_atr <= self.min_range_atr:
            raise ValueError("Es muss gelten: 0 < min_range_atr < max_range_atr.")
        if not 0 < self.squeeze_quantil < 1:
            raise ValueError("squeeze_quantil muss zwischen 0 und 1 liegen.")
        if self.quantil_fenster < 10:
            raise ValueError("quantil_fenster muss mindestens 10 sein.")
        if self.min_stop_atr <= 0 or self.max_stop_atr <= self.min_stop_atr:
            raise ValueError("Es muss gelten: 0 < min_stop_atr < max_stop_atr.")
        if self.reward_ratio <= 0:
            raise ValueError("reward_ratio muss positiv sein.")
        if self.cooldown_bars < 0:
            raise ValueError("cooldown_bars darf nicht negativ sein.")
        if self.max_signals_per_day < 1:
            raise ValueError("max_signals_per_day muss mindestens 1 sein.")


class SqueezeBreakout(Strategy):
    """Ausbruch aus jeder Verengung des Tages."""

    name = "squeeze"

    def __init__(
        self,
        params: SqueezeBreakoutParams | None = None,
        session: SessionWindow | None = None,
    ) -> None:
        super().__init__(session or SessionWindow.us_futures_rth())
        self.p = params or SqueezeBreakoutParams()
        self._cache = ArrayCache()

    @property
    def warmup(self) -> int:
        return 80

    # ------------------------------------------------------------- Vorarbeit
    def prepare(self, frame: pd.DataFrame) -> pd.DataFrame:
        p = self.p
        d = baue_features(frame, zeitzone=self.session.zeitzone)
        tag = pd.Index(d.index.tz_convert(self.session.zeitzone).date)

        # Die Verengung wird aus den *abgeschlossenen* Kerzen vor der aktuellen
        # gemessen - sonst waere der Ausbruch Teil seiner eigenen Bedingung.
        hoch = d["high"].rolling(p.squeeze_bars, min_periods=p.squeeze_bars).max().shift(1)
        tief = d["low"].rolling(p.squeeze_bars, min_periods=p.squeeze_bars).min().shift(1)
        d["sq_high"], d["sq_low"] = hoch, tief
        d["sq_width"] = hoch - tief

        # Verengung relativ zur eigenen Vorgeschichte, dazu eine ATR-Klammer
        # gegen Ausreisser in beide Richtungen.
        schwelle = (
            d["sq_width"]
            .rolling(p.quantil_fenster, min_periods=p.quantil_fenster // 2)
            .quantile(p.squeeze_quantil)
            .shift(1)
        )
        eng = (
            (d["sq_width"] <= schwelle)
            & (d["sq_width"] <= p.max_range_atr * d["atr"])
            & (d["sq_width"] >= p.min_range_atr * d["atr"])
        )
        zeit_ok = (d["minute"] >= p.min_minute) & (d["minute"] <= p.max_minute)
        vola = d["atr"] / d["close"] * 100
        vola_ok = pd.Series(True, index=d.index)
        if p.min_atr_pct is not None:
            vola_ok &= vola >= p.min_atr_pct
        if p.max_atr_pct is not None:
            vola_ok &= vola <= p.max_atr_pct
        ruhig = d["roc_8"].abs() <= p.max_momentum
        basis = eng & zeit_ok & vola_ok & ruhig & d["sq_width"].gt(0)

        puffer = p.breakout_buffer_atr * d["atr"]
        raus_hoch = basis & (d["close"] > hoch + puffer)
        raus_tief = basis & (d["close"] < tief - puffer)
        if p.require_vwap_side:
            raus_hoch &= d["close"] > d["vwap"]
            raus_tief &= d["close"] < d["vwap"]
        if p.require_trend:
            raus_hoch &= d["tagesrichtung_5"] > 0
            raus_tief &= d["tagesrichtung_5"] < 0
        if not p.allow_short:
            raus_tief &= False

        roh = (raus_hoch | raus_tief).fillna(False)
        gewaehlt = _mit_abstand(
            roh.to_numpy(), tag.to_numpy(), p.cooldown_bars, p.max_signals_per_day
        )
        d["long_signal"] = raus_hoch.to_numpy() & gewaehlt
        d["short_signal"] = raus_tief.to_numpy() & gewaehlt
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
        gegenseite = float(a["sq_low"][index] if seite is Side.LONG else a["sq_high"][index])
        roh = abs(einstieg - gegenseite)
        distanz = max(p.min_stop_atr * atr_wert, min(roh, p.max_stop_atr * atr_wert))
        stop = einstieg - seite.sign * distanz
        ziel = einstieg + seite.sign * p.reward_ratio * distanz
        return Signal(
            side=seite,
            stop_price=stop,
            target_price=ziel,
            setup=f"{self.name}_{seite.value}",
            context={
                "sq_width_atr": round(float(a["sq_width"][index]) / atr_wert, 2),
                "stop_atr": round(distanz / atr_wert, 2),
                "minute": int(a["minute"][index]),
                "trend": "up" if seite is Side.LONG else "down",
            },
        )

    def context(self, frame: pd.DataFrame, index: int) -> dict[str, float | str]:
        a = self._cache.arrays(frame, _COLUMNS)
        basis = super().context(frame, index)
        atr_wert = float(a["atr"][index])
        if atr_wert > 0:
            basis["squeeze_bucket"] = _bucket(float(a["sq_width"][index]) / atr_wert)
        basis["stunde"] = int(float(a["minute"][index]) // 60)
        return basis

    def params(self) -> dict[str, float | str]:
        return self.p.to_dict()


def _mit_abstand(roh: np.ndarray, tag: np.ndarray, abstand: int, max_pro_tag: int) -> np.ndarray:
    """Duennt Signale aus: Mindestabstand in Kerzen und Tageshoechstzahl.

    Ohne das feuert eine Verengung mehrfach hintereinander, weil dieselbe
    Spanne noch mehrere Kerzen lang gebrochen bleibt.
    """
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


def _bucket(wert: float) -> str:
    if wert < 0.5:
        return "sehr_eng"
    if wert < 0.8:
        return "eng"
    return "normal"
