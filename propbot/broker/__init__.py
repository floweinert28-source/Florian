"""Broker-Anbindungen."""

from .base import AccountInfo, Broker, BrokerError, BrokerPosition
from .paper import PaperBroker

__all__ = ["AccountInfo", "Broker", "BrokerError", "BrokerPosition", "PaperBroker", "MT5Broker"]


def __getattr__(name: str):
    """MT5 nur bei Bedarf laden - das Paket gibt es nicht auf jedem System."""
    if name == "MT5Broker":
        from .mt5 import MT5Broker

        return MT5Broker
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
