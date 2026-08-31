"""Strategien des Bots."""

from .base import SessionWindow, Strategy, StrategyParams
from .mean_reversion import RangeFade, RangeFadeParams
from .router import RegimeRouter
from .trend_pullback import TrendPullback, TrendPullbackParams

__all__ = [
    "RangeFade",
    "RangeFadeParams",
    "RegimeRouter",
    "SessionWindow",
    "Strategy",
    "StrategyParams",
    "TrendPullback",
    "TrendPullbackParams",
]


def build(name: str, **kwargs) -> Strategy:
    """Erzeugt eine Strategie ueber ihren Namen (fuer CLI und Konfiguration)."""
    registry = {
        "trend_pullback": TrendPullback,
        "range_fade": RangeFade,
        "regime_router": RegimeRouter,
    }
    if name not in registry:
        raise ValueError(
            f"Unbekannte Strategie {name!r}. Verfuegbar: {', '.join(sorted(registry))}"
        )
    return registry[name](**kwargs)
