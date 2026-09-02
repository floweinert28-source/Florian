"""Papier-Broker: spielt einen Datensatz Kerze fuer Kerze ab.

Damit laeuft der komplette Live-Code (inklusive Regelpruefung, Ordergroesse,
Stop-Nachfuehrung und Journal) ohne Geld und ohne Broker-Verbindung. Genau so
sollte jede Aenderung getestet werden, bevor sie ein echtes Konto sieht.

Die Fuellpreise sind bewusst gleich modelliert wie in der Backtest-Engine:
Spread und Slippage gehen zulasten des Bots.
"""

from __future__ import annotations

from datetime import datetime, timezone

import pandas as pd

from ..models import Instrument, Side
from .base import AccountInfo, Broker, BrokerError, BrokerPosition

__all__ = ["PaperBroker"]


class PaperBroker(Broker):
    """Simulierter Broker auf Basis historischer Kerzen."""

    def __init__(
        self,
        frame: pd.DataFrame,
        instrument: Instrument,
        *,
        balance: float = 50_000.0,
        start_index: int = 0,
    ) -> None:
        if frame.empty:
            raise ValueError("PaperBroker braucht Kursdaten.")
        self.frame = frame
        self.instrument = instrument
        self.balance = float(balance)
        self.index = max(0, min(start_index, len(frame) - 1))
        self._positions: dict[int, BrokerPosition] = {}
        self._next_ticket = 1
        self.closed: list[tuple[BrokerPosition, float, str]] = []

    # ------------------------------------------------------------- Zeitachse
    def advance(self, steps: int = 1) -> bool:
        """Rueckt zur naechsten Kerze und prueft Stops/Ziele. False am Ende."""
        for _ in range(steps):
            if self.index >= len(self.frame) - 1:
                return False
            self.index += 1
            self._check_exits()
        return True

    @property
    def current(self) -> pd.Series:
        return self.frame.iloc[self.index]

    def now(self) -> datetime:
        moment = self.frame.index[self.index]
        return moment.to_pydatetime().astimezone(timezone.utc)

    # ---------------------------------------------------------------- Daten
    def bars(self, symbol: str, timeframe: str, count: int) -> pd.DataFrame:
        start = max(0, self.index - count + 1)
        return self.frame.iloc[start : self.index + 1]

    def account(self) -> AccountInfo:
        equity = self.balance + sum(
            self._floating(position) for position in self._positions.values()
        )
        return AccountInfo(
            balance=round(self.balance, 2),
            equity=round(equity, 2),
            server_time=self.now(),
        )

    def positions(self, symbol: str | None = None) -> list[BrokerPosition]:
        return [
            position
            for position in self._positions.values()
            if symbol is None or position.symbol == symbol
        ]

    # --------------------------------------------------------------- Handel
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
        size = self.instrument.round_size(size)
        if size <= 0:
            raise BrokerError(f"Groesse {size} liegt unter dem Minimum.")
        price = float(self.current["close"])
        fill = self.instrument.round_price(
            price + side.sign * (self.instrument.spread / 2 + self.instrument.slippage)
        )
        position = BrokerPosition(
            ticket=self._next_ticket,
            symbol=symbol,
            side=side,
            size=size,
            entry_price=fill,
            stop_price=stop_price,
            target_price=target_price,
            opened_at=self.now(),
            comment=comment,
        )
        self._positions[position.ticket] = position
        self._next_ticket += 1
        return position

    def close(self, position: BrokerPosition, *, comment: str = "") -> float:
        live = self._positions.pop(position.ticket, None)
        if live is None:
            raise BrokerError(f"Position {position.ticket} existiert nicht (mehr).")
        price = float(self.current["close"])
        return self._settle(live, price, comment or "manuell")

    def modify(
        self,
        position: BrokerPosition,
        *,
        stop_price: float | None = None,
        target_price: float | None = None,
    ) -> BrokerPosition:
        live = self._positions.get(position.ticket)
        if live is None:
            raise BrokerError(f"Position {position.ticket} existiert nicht (mehr).")
        updated = BrokerPosition(
            ticket=live.ticket,
            symbol=live.symbol,
            side=live.side,
            size=live.size,
            entry_price=live.entry_price,
            stop_price=stop_price if stop_price is not None else live.stop_price,
            target_price=target_price if target_price is not None else live.target_price,
            opened_at=live.opened_at,
            profit=live.profit,
            comment=live.comment,
        )
        self._positions[live.ticket] = updated
        return updated

    # ------------------------------------------------------------- Intern
    def _check_exits(self) -> None:
        """Prueft Stop und Ziel gegen die aktuelle Kerze (Stop hat Vorrang)."""
        bar = self.current
        for ticket in list(self._positions):
            position = self._positions[ticket]
            stop, target = position.stop_price, position.target_price
            if position.side is Side.LONG:
                stop_hit = stop is not None and bar["low"] <= stop
                target_hit = target is not None and bar["high"] >= target
            else:
                stop_hit = stop is not None and bar["high"] >= stop
                target_hit = target is not None and bar["low"] <= target
            if stop_hit:
                self._positions.pop(ticket)
                self._settle(position, float(stop), "stop")
            elif target_hit:
                self._positions.pop(ticket)
                self._settle(position, float(target), "target")

    def _settle(self, position: BrokerPosition, price: float, reason: str) -> float:
        extra = self.instrument.slippage if reason == "stop" else 0.0
        fill = self.instrument.round_price(
            price - position.side.sign * (self.instrument.spread / 2 + extra)
        )
        gross = self.instrument.money(
            (fill - position.entry_price) * position.side.sign, position.size
        )
        pnl = gross - self.instrument.commission_for(position.size)
        self.balance += pnl
        self.closed.append((position, pnl, reason))
        return pnl

    def _floating(self, position: BrokerPosition) -> float:
        price = float(self.current["close"])
        gross = self.instrument.money(
            (price - position.entry_price) * position.side.sign, position.size
        )
        return gross - self.instrument.commission_for(position.size)
