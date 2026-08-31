"""Gegenstrategie: Range-Fade in ruhigen Phasen.

Trendfolge verliert in Seitwaertsmaerkten Geld - genau dort, wo diese
Strategie arbeitet. Sie handelt die Rueckkehr zum Mittelwert: Kurs schiesst aus
dem Bollinger-Band heraus, kommt zurueck ins Band, und wird bis zur Mittellinie
gehandelt.

Das Chance-Risiko-Verhaeltnis ist hier kleiner (oft 1.0-1.5), dafuer ist die
Trefferquote hoeher. Fuer das Prop-Konto ist das ein bewusster Kompromiss: die
Strategie glaettet die Equity-Kurve in Phasen, in denen die Trendstrategie nur
Stops einsammelt. Sie laeuft deshalb nur, wenn der ADX niedrig ist.
"""

from __future__ import annotations

from dataclasses import dataclass

import pandas as pd

from ..indicators import adx, atr, bollinger, rsi
from ..models import Side, Signal
from .base import ArrayCache, SessionWindow, Strategy, StrategyParams

__all__ = ["RangeFade", "RangeFadeParams"]

#: Spalten, die :meth:`RangeFade.signal` aus dem Array-Cache liest.
_COLUMNS = (
    "close",
    "atr",
    "rsi",
    "adx",
    "bb_mid",
    "bb_upper",
    "bb_lower",
    "swing_low",
    "swing_high",
    "long_signal",
    "short_signal",
)


@dataclass(frozen=True, slots=True)
class RangeFadeParams(StrategyParams):
    """Parameter der Range-Fade-Strategie."""

    bb_period: int = 20
    bb_deviations: float = 2.2
    rsi_period: int = 14
    rsi_low: float = 30.0
    rsi_high: float = 70.0
    adx_period: int = 14
    adx_max: float = 20.0
    atr_period: int = 14
    stop_buffer_atr: float = 0.60
    min_stop_atr: float = 0.60
    max_stop_atr: float = 2.00
    min_reward_ratio: float = 1.0
    swing_bars: int = 3
    allow_short: bool = True

    def __post_init__(self) -> None:
        if self.bb_period < 5:
            raise ValueError("bb_period muss mindestens 5 sein.")
        if self.rsi_low >= self.rsi_high:
            raise ValueError("rsi_low muss kleiner als rsi_high sein.")
        if self.min_stop_atr <= 0 or self.max_stop_atr <= self.min_stop_atr:
            raise ValueError("Es muss gelten: 0 < min_stop_atr < max_stop_atr.")


class RangeFade(Strategy):
    """Fade der Bandextreme in Seitwaertsphasen."""

    name = "range_fade"

    def __init__(
        self,
        params: RangeFadeParams | None = None,
        session: SessionWindow | None = None,
    ) -> None:
        super().__init__(session)
        self.p = params or RangeFadeParams()
        self._cache = ArrayCache()

    @property
    def warmup(self) -> int:
        return max(self.p.bb_period, self.p.adx_period * 3, self.p.atr_period * 3) + 10

    def prepare(self, frame: pd.DataFrame) -> pd.DataFrame:
        """Indikatoren und Signalbedingungen vorrechnen (kausal, vektorisiert)."""
        data = frame.copy()
        close, high, low, open_ = data["close"], data["high"], data["low"], data["open"]
        params = self.p
        middle, upper, lower = bollinger(close, params.bb_period, params.bb_deviations)
        data["bb_mid"] = middle
        data["bb_upper"] = upper
        data["bb_lower"] = lower
        data["rsi"] = rsi(close, params.rsi_period)
        data["adx"] = adx(data, params.adx_period)
        data["atr"] = atr(data, params.atr_period)
        data["swing_low"] = low.rolling(params.swing_bars, min_periods=1).min()
        data["swing_high"] = high.rolling(params.swing_bars, min_periods=1).max()

        calm = (data["adx"] <= params.adx_max) & data["atr"].gt(0)
        overshoot_down = (close.shift(1) < lower.shift(1)) | (low < lower)
        back_inside_long = (close > lower) & (close > open_)
        overshoot_up = (close.shift(1) > upper.shift(1)) | (high > upper)
        back_inside_short = (close < upper) & (close < open_)

        # Der RSI wird ueber die letzten Kerzen geprueft, nicht nur ueber die
        # aktuelle: die Umkehrkerze hebt den RSI bereits an, sonst schliessen
        # sich "ueberverkauft" und "dreht gerade" gegenseitig aus.
        extreme_window = max(2, params.swing_bars)
        oversold = data["rsi"].rolling(extreme_window, min_periods=1).min() <= params.rsi_low
        overbought = data["rsi"].rolling(extreme_window, min_periods=1).max() >= params.rsi_high

        data["long_signal"] = (calm & overshoot_down & back_inside_long & oversold).fillna(False)
        data["short_signal"] = (calm & overshoot_up & back_inside_short & overbought).fillna(
            False
        ) & bool(params.allow_short)
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

    def _build(self, side: Side, arrays: dict, index: int) -> Signal | None:
        entry = float(arrays["close"][index])
        atr_value = float(arrays["atr"][index])
        target = float(arrays["bb_mid"][index])

        if side is Side.LONG:
            raw = entry - (float(arrays["swing_low"][index]) - self.p.stop_buffer_atr * atr_value)
            distance = self._clamp(raw, atr_value)
            stop = entry - distance
            reward = (target - entry) / distance
        else:
            raw = (float(arrays["swing_high"][index]) + self.p.stop_buffer_atr * atr_value) - entry
            distance = self._clamp(raw, atr_value)
            stop = entry + distance
            reward = (entry - target) / distance

        if reward < self.p.min_reward_ratio:
            return None  # Mittellinie zu nah - der Trade lohnt das Risiko nicht

        return Signal(
            side=side,
            stop_price=stop,
            target_price=target,
            setup=f"{self.name}_{side.value}",
            context={
                "adx": round(float(arrays["adx"][index]), 1),
                "rsi": round(float(arrays["rsi"][index]), 1),
                "reward": round(reward, 2),
                "trend": "range",
            },
        )

    def _clamp(self, distance: float, atr_value: float) -> float:
        return max(self.p.min_stop_atr * atr_value, min(distance, self.p.max_stop_atr * atr_value))

    def context(self, frame: pd.DataFrame, index: int) -> dict[str, float | str]:
        arrays = self._cache.arrays(frame, _COLUMNS)
        base = super().context(frame, index)
        base["adx_bucket"] = "range"
        base["band_width"] = round(
            float(
                (arrays["bb_upper"][index] - arrays["bb_lower"][index])
                / arrays["close"][index]
                * 10_000
            ),
            1,
        )
        return base

    def params(self) -> dict[str, float | str]:
        return self.p.to_dict()
