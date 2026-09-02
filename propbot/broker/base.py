"""Broker-Schnittstelle - eine schmale Tuer zwischen Bot und Aussenwelt.

Der Bot kennt keinen Broker. Er kennt nur diese vier Faehigkeiten: Kerzen
holen, Kontostand lesen, Position eroeffnen/schliessen, Stop nachziehen. Damit
laeuft derselbe Code gegen den Papier-Broker (Test), gegen MetaTrader 5 (echte
Prop-Firma) oder gegen jede andere Anbindung, die man spaeter ergaenzt.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime

import pandas as pd

from ..models import Side

__all__ = ["AccountInfo", "Broker", "BrokerError", "BrokerPosition"]


class BrokerError(RuntimeError):
    """Der Broker hat eine Anfrage abgelehnt oder ist nicht erreichbar."""


@dataclass(frozen=True, slots=True)
class AccountInfo:
    """Kontostand beim Broker."""

    balance: float
    equity: float
    currency: str = "USD"
    leverage: int = 100
    server_time: datetime | None = None


@dataclass(frozen=True, slots=True)
class BrokerPosition:
    """Eine offene Position beim Broker."""

    ticket: int
    symbol: str
    side: Side
    size: float
    entry_price: float
    stop_price: float | None = None
    target_price: float | None = None
    opened_at: datetime | None = None
    profit: float = 0.0
    comment: str = ""


class Broker(ABC):
    """Vertrag jeder Broker-Anbindung."""

    @abstractmethod
    def now(self) -> datetime:
        """Serverzeit in UTC."""

    @abstractmethod
    def bars(self, symbol: str, timeframe: str, count: int) -> pd.DataFrame:
        """Die letzten ``count`` **abgeschlossenen** Kerzen."""

    @abstractmethod
    def account(self) -> AccountInfo:
        """Aktueller Kontostand."""

    @abstractmethod
    def positions(self, symbol: str | None = None) -> list[BrokerPosition]:
        """Offene Positionen."""

    @abstractmethod
    def market_order(
        self,
        symbol: str,
        side: Side,
        size: float,
        *,
        stop_price: float | None = None,
        target_price: float | None = None,
        comment: str = "",
    ) -> BrokerPosition:
        """Marktorder senden."""

    @abstractmethod
    def close(self, position: BrokerPosition, *, comment: str = "") -> float:
        """Position schliessen, Ergebnis in Kontowaehrung zurueckgeben."""

    @abstractmethod
    def modify(
        self,
        position: BrokerPosition,
        *,
        stop_price: float | None = None,
        target_price: float | None = None,
    ) -> BrokerPosition:
        """Stop oder Ziel einer offenen Position aendern."""

    def symbol_price(self, symbol: str) -> float:
        """Letzter bekannter Kurs - Standardimplementierung ueber die Kerzen."""
        frame = self.bars(symbol, "M15", 1)
        if frame.empty:
            raise BrokerError(f"Keine Kurse fuer {symbol}.")
        return float(frame["close"].iloc[-1])
