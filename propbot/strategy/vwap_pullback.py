"""Zweites Setup: Ruecksetzer zum VWAP in Richtung des Mehrtagestrends.

Der Opening-Range-Breakout handelt einmal am Tag - und nur, wenn die Spanne
sauber verlassen wird. An den uebrigen zwei Dritteln der Tage passiert nichts.
Dieses Setup fuellt genau diese Luecke und benutzt dafuer die Merkmale, die in
der Studie (PROPBOT.md, Kapitel 15) den Out-of-Sample-Test bestanden haben:

* **Lage zum VWAP** - der Kurs muss oberhalb handeln (Long).
* **Mehrtagestrend** - der Schlusskurs von vor fuenf Tagen liegt tiefer.
* **Keine Ueberdehnung** - das Momentum der letzten acht Kerzen ist gering.
  Genau das unterscheidet den Ruecksetzer vom Nachlaufen.
* **Uhrzeit** - fruehestens ``min_minute`` nach der Eroeffnung.

Der Ablauf: Der Kurs faellt bis auf ``touch_atr`` ATR an den VWAP heran (oder
darunter) und schliesst anschliessend wieder darueber. Der Stop liegt unter dem
Tief des Ruecksetzers, das Ziel ist ein Vielfaches davon.

Das ist bewusst *kein* Gegentrend-Trade: gekauft wird nur, was der
uebergeordnete Trend ohnehin traegt.
"""

from __future__ import annotations

from dataclasses import dataclass

import pandas as pd

from ..features import baue_features
from ..models import Side, Signal
from .base import ArrayCache, SessionWindow, Strategy, StrategyParams

__all__ = ["VwapPullback", "VwapPullbackParams"]

_COLUMNS = (
    "close",
    "low",
    "high",
    "atr",
    "vwap",
    "minute",
    "long_signal",
    "short_signal",
    "swing_low",
    "swing_high",
)


@dataclass(frozen=True, slots=True)
class VwapPullbackParams(StrategyParams):
    """Parameter des VWAP-Ruecksetzers."""

    touch_atr: float = 0.35
    lookback: int = 4
    min_minute: int = 45
    max_minute: int = 300
    max_momentum: float = 0.6
    min_stop_atr: float = 0.4
    max_stop_atr: float = 2.0
    stop_buffer_atr: float = 0.2
    reward_ratio: float = 1.5
    min_atr_pct: float | None = 0.15
    max_atr_pct: float | None = 0.5
    require_trend: bool = True
    allow_short: bool = False
    max_signals_per_day: int = 2

    def __post_init__(self) -> None:
        if self.touch_atr <= 0:
            raise ValueError("touch_atr muss positiv sein.")
        if self.lookback < 1:
            raise ValueError("lookback muss mindestens 1 sein.")
        if self.min_stop_atr <= 0 or self.max_stop_atr <= self.min_stop_atr:
            raise ValueError("Es muss gelten: 0 < min_stop_atr < max_stop_atr.")
        if self.reward_ratio <= 0:
            raise ValueError("reward_ratio muss positiv sein.")
        if self.max_signals_per_day < 1:
            raise ValueError("max_signals_per_day muss mindestens 1 sein.")


class VwapPullback(Strategy):
    """Ruecksetzer an den VWAP, Einstieg bei der Rueckeroberung."""

    name = "vwap_pullback"

    def __init__(
        self,
        params: VwapPullbackParams | None = None,
        session: SessionWindow | None = None,
    ) -> None:
        super().__init__(session or SessionWindow.us_futures_rth())
        self.p = params or VwapPullbackParams()
        self._cache = ArrayCache()

    @property
    def warmup(self) -> int:
        return 80

    def prepare(self, frame: pd.DataFrame) -> pd.DataFrame:
        params = self.p
        d = baue_features(frame, zeitzone=self.session.zeitzone)
        tag = pd.Index(d.index.tz_convert(self.session.zeitzone).date)

        d["swing_low"] = d["low"].rolling(params.lookback, min_periods=1).min()
        d["swing_high"] = d["high"].rolling(params.lookback, min_periods=1).max()

        zeit_ok = (d["minute"] >= params.min_minute) & (d["minute"] <= params.max_minute)
        vola = d["atr"] / d["close"] * 100
        vola_ok = pd.Series(True, index=d.index)
        if params.min_atr_pct is not None:
            vola_ok &= vola >= params.min_atr_pct
        if params.max_atr_pct is not None:
            vola_ok &= vola <= params.max_atr_pct

        # Beruehrung des VWAP innerhalb der letzten `lookback` Kerzen ...
        nah_dran = (d["low"] - d["vwap"]) / d["atr"] <= params.touch_atr
        beruehrt = nah_dran.rolling(params.lookback, min_periods=1).max() > 0
        # ... und jetzt wieder darueber schliessen
        zurueck = (d["close"] > d["vwap"]) & (d["close"] > d["open"])
        nicht_ueberdehnt = d["roc_8"].abs() <= params.max_momentum
        trend_hoch = (d["tagesrichtung_5"] > 0) if params.require_trend else True

        basis = zeit_ok & vola_ok & beruehrt & nicht_ueberdehnt
        long_roh = basis & zurueck & trend_hoch & (d["vwap_steigung"] >= 0)

        nah_unten = (d["vwap"] - d["high"]) / d["atr"] <= params.touch_atr
        beruehrt_unten = nah_unten.rolling(params.lookback, min_periods=1).max() > 0
        zurueck_unten = (d["close"] < d["vwap"]) & (d["close"] < d["open"])
        trend_runter = (d["tagesrichtung_5"] < 0) if params.require_trend else True
        short_roh = (
            zeit_ok
            & vola_ok
            & beruehrt_unten
            & nicht_ueberdehnt
            & zurueck_unten
            & trend_runter
            & (d["vwap_steigung"] <= 0)
        )
        if not params.allow_short:
            short_roh &= False

        beide = (long_roh | short_roh).fillna(False)
        nummer = beide.groupby(tag).cumsum()
        erlaubt = beide & (nummer <= params.max_signals_per_day)
        d["long_signal"] = (long_roh & erlaubt).fillna(False)
        d["short_signal"] = (short_roh & erlaubt).fillna(False)
        return d

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
        einstieg = float(a["close"][index])
        atr_wert = float(a["atr"][index])
        if atr_wert <= 0:
            return None
        if seite is Side.LONG:
            roh = einstieg - (float(a["swing_low"][index]) - self.p.stop_buffer_atr * atr_wert)
        else:
            roh = (float(a["swing_high"][index]) + self.p.stop_buffer_atr * atr_wert) - einstieg
        distanz = max(self.p.min_stop_atr * atr_wert, min(roh, self.p.max_stop_atr * atr_wert))
        stop = einstieg - seite.sign * distanz
        ziel = einstieg + seite.sign * self.p.reward_ratio * distanz
        return Signal(
            side=seite,
            stop_price=stop,
            target_price=ziel,
            setup=f"{self.name}_{seite.value}",
            context={
                "vwap_abstand": round(float(einstieg - a["vwap"][index]) / atr_wert, 2),
                "stop_atr": round(distanz / atr_wert, 2),
                "minute": int(a["minute"][index]),
                "trend": "up" if seite is Side.LONG else "down",
            },
        )

    def params(self) -> dict[str, float | str]:
        return self.p.to_dict()
