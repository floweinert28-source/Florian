"""Regime-Router: waehlt je Kerze die passende Strategie.

Ein Markt ist entweder trendig oder seitwaerts, und keine Strategie ist in
beidem gut. Der Router misst das Regime am ADX und schickt die Kerze an die
zustaendige Strategie:

* ADX >= ``trend_threshold``  -> Trend-Pullback
* ADX <= ``range_threshold``  -> Range-Fade
* dazwischen                  -> gar nicht handeln (Niemandsland)

Die Luecke zwischen den Schwellen ist Absicht. Genau im Uebergangsbereich
verlieren beide Ansaetze Geld, und auf einem Konto mit 2.000 $ Puffer ist
"nicht handeln" eine vollwertige Entscheidung.

Technischer Hinweis: jede Teilstrategie rechnet ihre eigenen Indikatoren auf
einer eigenen Kopie des Datensatzes. Der Router haelt diese Kopien und leitet
:meth:`signal` an die passende weiter - so kollidieren gleichnamige Spalten
(``atr``, ``rsi``, ...) mit unterschiedlichen Perioden nicht.
"""

from __future__ import annotations

import pandas as pd

from ..indicators import adx
from ..models import Signal
from .base import SessionWindow, Strategy
from .mean_reversion import RangeFade
from .trend_pullback import TrendPullback

__all__ = ["RegimeRouter"]


class RegimeRouter(Strategy):
    """Kombiniert Trendfolge und Mean-Reversion regimeabhaengig."""

    name = "regime_router"

    def __init__(
        self,
        trend: TrendPullback | None = None,
        range_strategy: RangeFade | None = None,
        *,
        adx_period: int = 14,
        trend_threshold: float = 23.0,
        range_threshold: float = 18.0,
        session: SessionWindow | None = None,
    ) -> None:
        super().__init__(session)
        if range_threshold > trend_threshold:
            raise ValueError("range_threshold darf nicht ueber trend_threshold liegen.")
        self.trend = trend or TrendPullback(session=session)
        self.range_strategy = range_strategy or RangeFade(session=session)
        self.adx_period = adx_period
        self.trend_threshold = trend_threshold
        self.range_threshold = range_threshold
        self._views: dict[str, pd.DataFrame] = {}
        self._fingerprint: tuple[int, object, object] | None = None

    @property
    def warmup(self) -> int:
        return max(self.trend.warmup, self.range_strategy.warmup)

    def prepare(self, frame: pd.DataFrame) -> pd.DataFrame:
        self._views = {
            self.trend.name: self.trend.prepare(frame),
            self.range_strategy.name: self.range_strategy.prepare(frame),
        }
        self._fingerprint = _fingerprint(frame)
        data = frame.copy()
        data["adx_router"] = adx(data, self.adx_period)
        return data

    def signal(self, frame: pd.DataFrame, index: int) -> Signal | None:
        if index < self.warmup:
            return None
        self._ensure_views(frame)
        value = frame["adx_router"].iloc[index]
        if pd.isna(value):
            return None
        if value >= self.trend_threshold:
            return self.trend.signal(self._views[self.trend.name], index)
        if value <= self.range_threshold:
            return self.range_strategy.signal(self._views[self.range_strategy.name], index)
        return None

    def context(self, frame: pd.DataFrame, index: int) -> dict[str, float | str]:
        value = float(frame["adx_router"].iloc[index])
        base = super().context(frame, index)
        base["regime"] = "trend" if value >= self.trend_threshold else "range"
        base["adx_bucket"] = _bucket(value)
        return base

    def params(self) -> dict[str, float | str]:
        merged: dict[str, float | str] = {
            "trend_threshold": self.trend_threshold,
            "range_threshold": self.range_threshold,
        }
        merged.update({f"trend.{k}": v for k, v in self.trend.params().items()})
        merged.update({f"range.{k}": v for k, v in self.range_strategy.params().items()})
        return merged

    def _ensure_views(self, frame: pd.DataFrame) -> None:
        """Sichert zu, dass die Teilansichten zum uebergebenen Datensatz passen."""
        if self._fingerprint != _fingerprint(frame):
            self.prepare(frame.drop(columns=["adx_router"], errors="ignore"))


def _fingerprint(frame: pd.DataFrame) -> tuple[int, object, object]:
    return (len(frame), frame.index[0], frame.index[-1])


def _bucket(value: float) -> str:
    if value < 18:
        return "adx<18"
    if value < 25:
        return "adx18-25"
    if value < 35:
        return "adx25-35"
    return "adx>35"
