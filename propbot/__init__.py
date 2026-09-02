"""propbot - Handelsbot fuer Prop-Firm-Konten.

Standardkonto: 50.000 $, +4.000 $ Gewinnziel (danach Payout), 2.000 $ maximaler
Drawdown, 1.000 $ Tageslimit.

Aufbau in einem Satz: :mod:`propbot.strategy` sagt *ob* gehandelt wird,
:mod:`propbot.risk` sagt *wie gross*, :mod:`propbot.rules` sagt *ob ueberhaupt
noch* - und :mod:`propbot.learning` schaut hinterher, was davon funktioniert hat.

Schnellstart::

    python -m propbot math
    python -m propbot backtest --bars 40000
    python -m propbot montecarlo

Die ausfuehrliche Doku steht in PROPBOT.md im Wurzelverzeichnis.
"""

from __future__ import annotations

__all__ = [
    "__version__",
    "AccountState",
    "Backtester",
    "PropFirmRules",
    "RiskManager",
]

__version__ = "1.0.0"


def __getattr__(name: str):
    """Kernklassen bequem erreichbar, ohne beim Import alles zu laden."""
    if name == "Backtester":
        from .engine import Backtester

        return Backtester
    if name in ("AccountState", "PropFirmRules"):
        from . import rules

        return getattr(rules, name)
    if name == "RiskManager":
        from .risk import RiskManager

        return RiskManager
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
