"""Strategien des Bots."""

from .base import SessionWindow, Strategy, StrategyParams
from .mean_reversion import RangeFade, RangeFadeParams
from .opening_range import OpeningRange, OpeningRangeParams
from .router import RegimeRouter
from .squeeze import SqueezeBreakout, SqueezeBreakoutParams
from .trend_pullback import TrendPullback, TrendPullbackParams
from .vwap_pullback import VwapPullback, VwapPullbackParams

__all__ = [
    "OpeningRange",
    "OpeningRangeParams",
    "RangeFade",
    "RangeFadeParams",
    "RegimeRouter",
    "SessionWindow",
    "SqueezeBreakout",
    "SqueezeBreakoutParams",
    "Strategy",
    "StrategyParams",
    "TrendPullback",
    "TrendPullbackParams",
    "VwapPullback",
    "VwapPullbackParams",
]


def build(name: str, **kwargs) -> Strategy:
    """Erzeugt eine Strategie ueber ihren Namen (fuer CLI und Konfiguration)."""
    registry = {
        "trend_pullback": TrendPullback,
        "range_fade": RangeFade,
        "opening_range": OpeningRange,
        "squeeze": SqueezeBreakout,
        "vwap_pullback": VwapPullback,
        "regime_router": RegimeRouter,
    }
    if name not in registry:
        raise ValueError(
            f"Unbekannte Strategie {name!r}. Verfuegbar: {', '.join(sorted(registry))}"
        )
    return registry[name](**kwargs)
