"""MetaTrader-5-Anbindung fuer den echten Prop-Firm-Handel.

Die meisten FX-Prop-Firmen (FTMO, FundedNext, The5ers, ...) geben MT5-Konten
aus. Diese Klasse spricht mit einem *lokal laufenden* MT5-Terminal ueber das
Paket ``MetaTrader5`` (nur Windows; unter Linux via Wine).

**Ehrliche Einordnung:** dieser Adapter ist der einzige Teil des Pakets, der
sich nicht ohne Terminal testen laesst - die Tests decken ihn nicht ab. Bevor
hier echtes Geld haengt, gehoert er auf ein Demokonto derselben Firma:
Verbindung, Symbolname, Lotgroessen, Stop-Level und Filling-Modus
unterscheiden sich je Broker.

Reihenfolge fuer den Ernstfall:
1. Demokonto, ``dry_run=True`` - der Bot loggt nur, was er tun wuerde.
2. Demokonto, ``dry_run=False`` - echte Orders, kein echtes Geld.
3. Erst dann die Challenge.
"""

from __future__ import annotations

from datetime import datetime, timezone

import pandas as pd

from ..models import Side
from .base import AccountInfo, Broker, BrokerError, BrokerPosition

__all__ = ["MT5Broker", "TIMEFRAMES"]

#: Zeitrahmen-Namen -> MT5-Konstanten (werden erst beim Verbinden aufgeloest).
TIMEFRAMES = ("M1", "M5", "M15", "M30", "H1", "H4", "D1")


class MT5Broker(Broker):
    """Duenner Adapter auf das ``MetaTrader5``-Paket."""

    def __init__(
        self,
        *,
        login: int | None = None,
        password: str | None = None,
        server: str | None = None,
        path: str | None = None,
        magic: int = 502_050,
        deviation: int = 20,
    ) -> None:
        self.login = login
        self.password = password
        self.server = server
        self.path = path
        self.magic = magic
        self.deviation = deviation
        self._mt5 = None

    # ----------------------------------------------------------- Verbindung
    def connect(self) -> "MT5Broker":
        """Startet die Verbindung zum Terminal."""
        try:
            import MetaTrader5 as mt5  # noqa: N813  (Paketname ist vorgegeben)
        except ImportError as error:  # pragma: no cover - haengt an der Umgebung
            raise BrokerError(
                "Paket 'MetaTrader5' fehlt. Installation: pip install MetaTrader5 "
                "(nur Windows; unter Linux ueber Wine)."
            ) from error

        kwargs = {}
        if self.path:
            kwargs["path"] = self.path
        if self.login:
            kwargs.update(login=int(self.login), password=self.password, server=self.server)
        if not mt5.initialize(**kwargs):
            raise BrokerError(f"MT5-Verbindung fehlgeschlagen: {mt5.last_error()}")
        self._mt5 = mt5
        return self

    def disconnect(self) -> None:
        if self._mt5 is not None:
            self._mt5.shutdown()
            self._mt5 = None

    @property
    def mt5(self):
        if self._mt5 is None:
            raise BrokerError("Nicht verbunden - erst connect() aufrufen.")
        return self._mt5

    # ---------------------------------------------------------------- Daten
    def now(self) -> datetime:
        return datetime.now(timezone.utc)

    def bars(self, symbol: str, timeframe: str, count: int) -> pd.DataFrame:
        mt5 = self.mt5
        constant = getattr(mt5, f"TIMEFRAME_{timeframe.upper()}", None)
        if constant is None:
            raise BrokerError(f"Unbekannter Zeitrahmen {timeframe!r}. Erlaubt: {TIMEFRAMES}")
        # Position 1 statt 0: die laufende Kerze ist noch nicht abgeschlossen
        # und darf nie in ein Signal einfliessen.
        rates = mt5.copy_rates_from_pos(symbol, constant, 1, count)
        if rates is None or len(rates) == 0:
            raise BrokerError(f"Keine Kerzen fuer {symbol} ({mt5.last_error()}).")
        frame = pd.DataFrame(rates)
        frame["time"] = pd.to_datetime(frame["time"], unit="s", utc=True)
        frame = frame.set_index("time")
        frame = frame.rename(columns={"tick_volume": "volume"})
        return frame[["open", "high", "low", "close", "volume"]].astype(float)

    def account(self) -> AccountInfo:
        info = self.mt5.account_info()
        if info is None:
            raise BrokerError(f"Kontodaten nicht lesbar: {self.mt5.last_error()}")
        return AccountInfo(
            balance=float(info.balance),
            equity=float(info.equity),
            currency=str(info.currency),
            leverage=int(info.leverage),
            server_time=self.now(),
        )

    def positions(self, symbol: str | None = None) -> list[BrokerPosition]:
        raw = self.mt5.positions_get(symbol=symbol) if symbol else self.mt5.positions_get()
        if raw is None:
            return []
        return [self._convert(item) for item in raw if item.magic in (0, self.magic)]

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
        mt5 = self.mt5
        tick = mt5.symbol_info_tick(symbol)
        info = mt5.symbol_info(symbol)
        if tick is None or info is None:
            raise BrokerError(f"Symbol {symbol} ist im Terminal nicht verfuegbar.")
        if not info.visible:
            mt5.symbol_select(symbol, True)

        price = tick.ask if side is Side.LONG else tick.bid
        request = {
            "action": mt5.TRADE_ACTION_DEAL,
            "symbol": symbol,
            "volume": float(size),
            "type": mt5.ORDER_TYPE_BUY if side is Side.LONG else mt5.ORDER_TYPE_SELL,
            "price": float(price),
            "deviation": self.deviation,
            "magic": self.magic,
            "comment": comment[:31],
            "type_time": mt5.ORDER_TIME_GTC,
            "type_filling": self._filling_mode(info),
        }
        if stop_price is not None:
            request["sl"] = float(stop_price)
        if target_price is not None:
            request["tp"] = float(target_price)

        result = mt5.order_send(request)
        if result is None or result.retcode != mt5.TRADE_RETCODE_DONE:
            raise BrokerError(f"Order abgelehnt: {getattr(result, 'comment', mt5.last_error())}")
        for position in self.positions(symbol):
            if position.ticket == result.order or position.ticket == getattr(result, "deal", 0):
                return position
        opened = self.positions(symbol)
        if not opened:
            raise BrokerError("Order ausgefuehrt, aber keine Position gefunden.")
        return opened[-1]

    def close(self, position: BrokerPosition, *, comment: str = "") -> float:
        mt5 = self.mt5
        tick = mt5.symbol_info_tick(position.symbol)
        info = mt5.symbol_info(position.symbol)
        if tick is None or info is None:
            raise BrokerError(f"Symbol {position.symbol} nicht verfuegbar.")
        request = {
            "action": mt5.TRADE_ACTION_DEAL,
            "symbol": position.symbol,
            "volume": float(position.size),
            "type": mt5.ORDER_TYPE_SELL if position.side is Side.LONG else mt5.ORDER_TYPE_BUY,
            "position": position.ticket,
            "price": float(tick.bid if position.side is Side.LONG else tick.ask),
            "deviation": self.deviation,
            "magic": self.magic,
            "comment": (comment or "close")[:31],
            "type_time": mt5.ORDER_TIME_GTC,
            "type_filling": self._filling_mode(info),
        }
        result = mt5.order_send(request)
        if result is None or result.retcode != mt5.TRADE_RETCODE_DONE:
            raise BrokerError(
                f"Schliessen abgelehnt: {getattr(result, 'comment', mt5.last_error())}"
            )
        return float(position.profit)

    def modify(
        self,
        position: BrokerPosition,
        *,
        stop_price: float | None = None,
        target_price: float | None = None,
    ) -> BrokerPosition:
        mt5 = self.mt5
        request = {
            "action": mt5.TRADE_ACTION_SLTP,
            "symbol": position.symbol,
            "position": position.ticket,
            "sl": float(stop_price if stop_price is not None else (position.stop_price or 0.0)),
            "tp": float(
                target_price if target_price is not None else (position.target_price or 0.0)
            ),
        }
        result = mt5.order_send(request)
        if result is None or result.retcode != mt5.TRADE_RETCODE_DONE:
            raise BrokerError(f"Stop-Aenderung abgelehnt: {getattr(result, 'comment', '')}")
        for updated in self.positions(position.symbol):
            if updated.ticket == position.ticket:
                return updated
        return position

    # --------------------------------------------------------------- Intern
    def _filling_mode(self, info):
        """Waehlt einen Filling-Modus, den der Broker akzeptiert."""
        mt5 = self.mt5
        allowed = getattr(info, "filling_mode", 0)
        if allowed & getattr(mt5, "SYMBOL_FILLING_FOK", 1):
            return mt5.ORDER_FILLING_FOK
        if allowed & getattr(mt5, "SYMBOL_FILLING_IOC", 2):
            return mt5.ORDER_FILLING_IOC
        return mt5.ORDER_FILLING_RETURN

    def _convert(self, raw) -> BrokerPosition:
        return BrokerPosition(
            ticket=int(raw.ticket),
            symbol=str(raw.symbol),
            side=Side.LONG if raw.type == 0 else Side.SHORT,
            size=float(raw.volume),
            entry_price=float(raw.price_open),
            stop_price=float(raw.sl) or None,
            target_price=float(raw.tp) or None,
            opened_at=datetime.fromtimestamp(raw.time, tz=timezone.utc),
            profit=float(raw.profit),
            comment=str(raw.comment),
        )
