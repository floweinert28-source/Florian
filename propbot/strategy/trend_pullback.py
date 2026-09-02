"""Hauptstrategie: Trend-Pullback mit ATR-Stop.

Die Logik in einem Satz: *Im etablierten Trend auf einen Ruecksetzer warten und
erst einsteigen, wenn der Trend die Kontrolle zurueckholt.*

Warum genau diese Strategie fuer ein Prop-Konto mit 2.000 $ Puffer?

* **Definierter Stop.** Der Stop liegt hinter dem Ruecksetzer-Tief, nicht an
  einer runden Zahl. Damit ist das Risiko je Trade vorher exakt bekannt - die
  Voraussetzung fuer jede Groessenrechnung.
* **CRV > 1.** Ein Ruecksetzer-Einstieg liegt nahe am Stop, das Ziel liegt in
  Trendrichtung. Bei 45 % Trefferquote und 2R braucht man nur 33 % Treffer, um
  break-even zu sein - Puffer gegen schlechte Phasen.
* **Wenige, saubere Trades.** Die Filter (Trend, ADX, Session, Ruecksetzer,
  Trigger) lassen nur wenige Signale durch. Auf einem Konto mit acht
  Verlusten Puffer ist Selektivitaet wichtiger als Aktivitaet.

Ablauf eines Long-Signals:

1. **Trendfilter** - Kurs ueber der EMA200, EMA20 ueber EMA50 ueber EMA200.
2. **Trendstaerke** - ADX ueber der Schwelle (kein Gezappel im Nichts).
3. **Ruecksetzer** - in den letzten ``pullback_bars`` Kerzen war der RSI unter
   ``pullback_rsi`` oder der Kurs hat die EMA20 beruehrt.
4. **Trigger** - die aktuelle Kerze schliesst ueber dem Hoch der Vorkerze und
   bullisch. Ohne Trigger kein Einstieg: fallende Messer faengt niemand.
5. **Stop** - unter das Ruecksetzer-Tief minus ``stop_buffer_atr`` * ATR,
   mindestens ``min_stop_atr`` * ATR, hoechstens ``max_stop_atr`` * ATR.
6. **Ziel** - ``reward_ratio`` mal die Stopdistanz.

Short ist exakt gespiegelt.
"""

from __future__ import annotations

from dataclasses import dataclass

import pandas as pd

from ..indicators import adx, atr, ema, rsi
from ..models import Side, Signal
from .base import ArrayCache, SessionWindow, Strategy, StrategyParams

__all__ = ["TrendPullback", "TrendPullbackParams"]

#: Spalten, die :meth:`TrendPullback.signal` aus dem Array-Cache liest.
_COLUMNS = (
    "close",
    "atr",
    "rsi",
    "adx",
    "atr_ratio",
    "swing_low",
    "swing_high",
    "long_signal",
    "short_signal",
)


@dataclass(frozen=True, slots=True)
class TrendPullbackParams(StrategyParams):
    """Parameter der Trend-Pullback-Strategie."""

    ema_fast: int = 20
    ema_slow: int = 50
    ema_trend: int = 200
    atr_period: int = 14
    rsi_period: int = 14
    adx_period: int = 14
    adx_min: float = 20.0
    pullback_bars: int = 6
    pullback_rsi: float = 45.0
    trigger_rsi: float = 48.0
    stop_buffer_atr: float = 0.25
    min_stop_atr: float = 0.70
    # 3.5 statt urspruenglich 2.5: die Fehleranalyse (propbot lessons) zeigte,
    # dass 70 % der Stops an der Obergrenze gekappt wurden - der Stop sass dann
    # naeher am Einstieg als die Marktstruktur und wurde vom Rauschen getroffen.
    # Gegenprobe ueber 6 unabhaengige Datensaetze: Erwartungswert +0,050 R ->
    # +0,137 R, Ziel erreicht 3/6 -> 6/6.
    max_stop_atr: float = 3.50
    reward_ratio: float = 2.0
    min_atr_ratio: float = 0.00025
    allow_short: bool = True

    def __post_init__(self) -> None:
        if not self.ema_fast < self.ema_slow < self.ema_trend:
            raise ValueError("Es muss gelten: ema_fast < ema_slow < ema_trend.")
        if self.reward_ratio <= 0:
            raise ValueError("reward_ratio muss positiv sein.")
        if self.pullback_bars < 1:
            raise ValueError("pullback_bars muss mindestens 1 sein.")
        if self.min_stop_atr <= 0 or self.max_stop_atr <= self.min_stop_atr:
            raise ValueError("Es muss gelten: 0 < min_stop_atr < max_stop_atr.")


class TrendPullback(Strategy):
    """Trendfolge mit Ruecksetzer-Einstieg."""

    name = "trend_pullback"

    def __init__(
        self,
        params: TrendPullbackParams | None = None,
        session: SessionWindow | None = None,
    ) -> None:
        super().__init__(session)
        self.p = params or TrendPullbackParams()
        self._cache = ArrayCache()

    @property
    def warmup(self) -> int:
        return self.p.ema_trend + self.p.pullback_bars + 5

    def prepare(self, frame: pd.DataFrame) -> pd.DataFrame:
        """Rechnet Indikatoren *und* die kompletten Signalbedingungen vor.

        Alle Fenster laufen ueber abgeschlossene Kerzen bis einschliesslich der
        aktuellen, ``shift(1)`` greift bewusst auf die Vorkerze zu - damit bleibt
        jede Spalte kausal.
        """
        data = frame.copy()
        close, high, low, open_ = data["close"], data["high"], data["low"], data["open"]
        params = self.p
        data["ema_fast"] = ema(close, params.ema_fast)
        data["ema_slow"] = ema(close, params.ema_slow)
        data["ema_trend"] = ema(close, params.ema_trend)
        data["atr"] = atr(data, params.atr_period)
        data["rsi"] = rsi(close, params.rsi_period)
        data["adx"] = adx(data, params.adx_period)
        data["atr_ratio"] = data["atr"] / close

        window = params.pullback_bars + 1
        data["swing_low"] = low.rolling(window, min_periods=1).min()
        data["swing_high"] = high.rolling(window, min_periods=1).max()

        tradable = (data["adx"] >= params.adx_min) & (data["atr_ratio"] >= params.min_atr_ratio)
        uptrend = (
            (close > data["ema_trend"])
            & (data["ema_fast"] > data["ema_slow"])
            & (data["ema_slow"] > data["ema_trend"])
        )
        downtrend = (
            (close < data["ema_trend"])
            & (data["ema_fast"] < data["ema_slow"])
            & (data["ema_slow"] < data["ema_trend"])
        )

        touched_up = (low <= data["ema_fast"]).rolling(window, min_periods=1).max() > 0
        touched_down = (high >= data["ema_fast"]).rolling(window, min_periods=1).max() > 0
        dipped = data["rsi"].rolling(window, min_periods=1).min() <= params.pullback_rsi
        spiked = data["rsi"].rolling(window, min_periods=1).max() >= 100 - params.pullback_rsi

        trigger_long = (
            (close > high.shift(1)) & (close > open_) & (data["rsi"] >= params.trigger_rsi)
        )
        trigger_short = (
            (close < low.shift(1)) & (close < open_) & (data["rsi"] <= 100 - params.trigger_rsi)
        )

        data["long_signal"] = (tradable & uptrend & (dipped | touched_up) & trigger_long).fillna(
            False
        )
        data["short_signal"] = (
            tradable & downtrend & (spiked | touched_down) & trigger_short
        ).fillna(False) & bool(params.allow_short)
        return data

    def signal(self, frame: pd.DataFrame, index: int) -> Signal | None:
        if index < self.warmup:
            return None
        arrays = self._cache.arrays(frame, _COLUMNS)
        if arrays["long_signal"][index]:
            return self._build(Side.LONG, arrays, index)
        if arrays["short_signal"][index]:
            return self._build(Side.SHORT, arrays, index)
        return None

    def _build(self, side: Side, arrays: dict, index: int) -> Signal:
        """Setzt Stop und Ziel aus Ruecksetzer-Extrem und ATR."""
        entry = float(arrays["close"][index])
        atr_value = float(arrays["atr"][index])
        if side is Side.LONG:
            swing = float(arrays["swing_low"][index])
            distance = _clamp_distance(
                entry - (swing - self.p.stop_buffer_atr * atr_value), atr_value, self.p
            )
            stop = entry - distance
            target = entry + self.p.reward_ratio * distance
        else:
            swing = float(arrays["swing_high"][index])
            distance = _clamp_distance(
                (swing + self.p.stop_buffer_atr * atr_value) - entry, atr_value, self.p
            )
            stop = entry + distance
            target = entry - self.p.reward_ratio * distance

        return Signal(
            side=side,
            stop_price=stop,
            target_price=target,
            setup=f"{self.name}_{side.value}",
            context={
                "adx": round(float(arrays["adx"][index]), 1),
                "rsi": round(float(arrays["rsi"][index]), 1),
                "atr": round(atr_value, 6),
                "stop_atr": round(distance / atr_value, 2) if atr_value else 0.0,
                "trend": "up" if side is Side.LONG else "down",
            },
        )

    def context(self, frame: pd.DataFrame, index: int) -> dict[str, float | str]:
        arrays = self._cache.arrays(frame, _COLUMNS)
        base = super().context(frame, index)
        base.update(
            {
                "adx_bucket": _bucket(float(arrays["adx"][index]), (18, 25, 35)),
                "atr_bucket": _bucket(float(arrays["atr_ratio"][index]) * 10_000, (3, 6, 10)),
            }
        )
        return base

    def params(self) -> dict[str, float | str]:
        return self.p.to_dict()


def _clamp_distance(distance: float, atr_value: float, params: TrendPullbackParams) -> float:
    """Haelt die Stopdistanz in einem sinnvollen ATR-Korridor."""
    minimum = params.min_stop_atr * atr_value
    maximum = params.max_stop_atr * atr_value
    return max(minimum, min(distance, maximum))


def _bucket(value: float, edges: tuple[float, ...]) -> str:
    """Ordnet einen Wert einer Klasse zu - fuer die Lernstatistik."""
    for position, edge in enumerate(edges):
        if value < edge:
            return f"q{position}"
    return f"q{len(edges)}"
