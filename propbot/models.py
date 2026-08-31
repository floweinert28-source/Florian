"""Datenmodelle des Trading-Bots - bewusst ohne Broker- und Pandas-Abhaengigkeit.

Alle Preise sind absolute Preise des Instruments (also 1.08432 fuer EURUSD,
nicht "Pips"). Groessen (``size``) sind Lots bzw. Kontrakte, und
:attr:`Instrument.value_per_point` uebersetzt beides in Geld:

    Gewinn = (Ausstieg - Einstieg) * size * value_per_point   (Long)
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from enum import StrEnum
from math import floor, isfinite

__all__ = [
    "INSTRUMENTS",
    "Candle",
    "ExitReason",
    "Instrument",
    "Side",
    "Signal",
    "Trade",
]


class Side(StrEnum):
    """Richtung einer Position."""

    LONG = "long"
    SHORT = "short"

    @property
    def sign(self) -> int:
        """+1 fuer Long, -1 fuer Short - praktisch fuer PnL-Formeln."""
        return 1 if self is Side.LONG else -1

    @property
    def label(self) -> str:
        return "Long" if self is Side.LONG else "Short"

    @property
    def opposite(self) -> "Side":
        return Side.SHORT if self is Side.LONG else Side.LONG


class ExitReason(StrEnum):
    """Warum eine Position geschlossen wurde."""

    STOP = "stop"
    TARGET = "target"
    TRAIL = "trail"
    BREAKEVEN = "breakeven"
    TIME = "time"
    SESSION_END = "session_end"
    DAILY_STOP = "daily_stop"
    PAYOUT = "payout"
    BREACH = "breach"
    END_OF_DATA = "end_of_data"
    SIGNAL = "signal"

    @property
    def label(self) -> str:
        return {
            "stop": "Stop-Loss",
            "target": "Take-Profit",
            "trail": "Trailing-Stop",
            "breakeven": "Break-even-Stop",
            "time": "Zeit-Stop",
            "session_end": "Session-Ende",
            "daily_stop": "Tageslimit",
            "payout": "Payout gesichert",
            "breach": "Regelverstoss",
            "end_of_data": "Datenende",
            "signal": "Gegensignal",
        }[self.value]

    @property
    def is_loss_by_design(self) -> bool:
        """Ausstiege, die planmaessig einen Verlust bedeuten duerfen."""
        return self in (ExitReason.STOP, ExitReason.DAILY_STOP, ExitReason.BREACH)


@dataclass(frozen=True, slots=True)
class Instrument:
    """Handelsspezifikation eines Symbols inklusive aller Kosten.

    ``value_per_point`` ist der Geldwert einer Preisbewegung von 1.0 bei einer
    Positionsgroesse von 1.0. Fuer EURUSD in Standard-Lots sind das 100_000 USD,
    fuer einen Micro-Nasdaq-Future (MNQ) 2 USD je Indexpunkt.
    """

    symbol: str
    value_per_point: float
    spread: float = 0.0
    commission: float = 0.0
    slippage: float = 0.0
    size_step: float = 0.01
    min_size: float = 0.01
    max_size: float = 100.0
    digits: int = 5
    tick_size: float = 0.0

    def __post_init__(self) -> None:
        if self.value_per_point <= 0:
            raise ValueError("value_per_point muss positiv sein.")
        if self.size_step <= 0 or self.min_size <= 0:
            raise ValueError("size_step und min_size muessen positiv sein.")
        if self.max_size < self.min_size:
            raise ValueError("max_size darf nicht kleiner als min_size sein.")
        if min(self.spread, self.commission, self.slippage) < 0:
            raise ValueError("Kosten duerfen nicht negativ sein.")

    def round_size(self, size: float) -> float:
        """Rundet eine Groesse auf das Handelsraster ab (nie auf)."""
        if not isfinite(size) or size <= 0:
            return 0.0
        steps = floor(round(size / self.size_step, 9))
        rounded = round(steps * self.size_step, 10)
        if rounded < self.min_size:
            return 0.0
        return min(rounded, self.max_size)

    def round_price(self, price: float) -> float:
        """Rundet einen Preis auf die Tickgroesse bzw. Nachkommastellen."""
        if self.tick_size > 0:
            return round(round(price / self.tick_size) * self.tick_size, 10)
        return round(price, self.digits)

    def money(self, price_move: float, size: float) -> float:
        """Geldwert einer Preisbewegung fuer eine Positionsgroesse."""
        return price_move * size * self.value_per_point

    def commission_for(self, size: float) -> float:
        """Round-Turn-Kommission fuer eine Positionsgroesse."""
        return self.commission * size

    def cost_per_unit(self) -> float:
        """Gesamtkosten (Spread, Slippage, Kommission) je 1.0 Groesse."""
        price_cost = self.spread + 2 * self.slippage
        return price_cost * self.value_per_point + self.commission


#: Vorkonfigurierte Instrumente mit realistischen Retail-Kosten.
INSTRUMENTS: dict[str, Instrument] = {
    "EURUSD": Instrument(
        symbol="EURUSD",
        value_per_point=100_000.0,
        spread=0.00012,
        commission=7.0,
        slippage=0.00003,
        size_step=0.01,
        min_size=0.01,
        max_size=20.0,
        digits=5,
    ),
    "GBPUSD": Instrument(
        symbol="GBPUSD",
        value_per_point=100_000.0,
        spread=0.00018,
        commission=7.0,
        slippage=0.00005,
        size_step=0.01,
        min_size=0.01,
        max_size=20.0,
        digits=5,
    ),
    "XAUUSD": Instrument(
        symbol="XAUUSD",
        value_per_point=100.0,
        spread=0.25,
        commission=7.0,
        slippage=0.08,
        size_step=0.01,
        min_size=0.01,
        max_size=20.0,
        digits=2,
    ),
    "NAS100": Instrument(
        symbol="NAS100",
        value_per_point=1.0,
        spread=1.2,
        commission=0.0,
        slippage=0.4,
        size_step=0.1,
        min_size=0.1,
        max_size=100.0,
        digits=1,
    ),
    # E-mini Nasdaq-100. Achtung: 20 $ je Indexpunkt - bei 2.000 $ Drawdown
    # ist schon ein einziger Kontrakt mit 30 Punkten Stop (600 $) fast ein
    # Drittel des gesamten Puffers. Auf einem 50k-Konto gehoert stattdessen
    # MNQ gehandelt (ein Zehntel der Groesse).
    "NQ": Instrument(
        symbol="NQ",
        value_per_point=20.0,
        spread=0.25,
        commission=4.00,
        slippage=0.25,
        size_step=1.0,
        min_size=1.0,
        max_size=10.0,
        digits=2,
        tick_size=0.25,
    ),
    # Micro E-mini Nasdaq-100: 2 $ je Punkt, ein Zehntel des NQ. Kommission
    # 1,34 $ Round Turn ist ein ueblicher Retail-/Prop-Satz inkl. Gebuehren.
    "MNQ": Instrument(
        symbol="MNQ",
        value_per_point=2.0,
        spread=0.25,
        commission=1.34,
        slippage=0.25,
        size_step=1.0,
        min_size=1.0,
        max_size=50.0,
        digits=2,
        tick_size=0.25,
    ),
}


@dataclass(frozen=True, slots=True)
class Candle:
    """Eine abgeschlossene Kerze."""

    time: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float = 0.0


@dataclass(frozen=True, slots=True)
class Signal:
    """Ein Einstiegsvorschlag der Strategie.

    Der Stop ist Pflicht: ohne definiertes Risiko kann der Risk-Manager keine
    Groesse berechnen, und ohne Groesse gibt es keinen Trade.
    """

    side: Side
    stop_price: float
    target_price: float | None = None
    setup: str = ""
    context: dict[str, float | str] = field(default_factory=dict)

    def risk_distance(self, entry_price: float) -> float:
        """Abstand zwischen Einstieg und Stop in Preiseinheiten."""
        return abs(entry_price - self.stop_price)

    def reward_ratio(self, entry_price: float) -> float | None:
        """Chance-Risiko-Verhaeltnis, falls ein Ziel gesetzt ist."""
        if self.target_price is None:
            return None
        risk = self.risk_distance(entry_price)
        if risk <= 0:
            return None
        return abs(self.target_price - entry_price) / risk


@dataclass(slots=True)
class Trade:
    """Ein Trade von Einstieg bis Ausstieg inklusive Nachbetrachtung."""

    symbol: str
    side: Side
    entry_time: datetime
    entry_price: float
    size: float
    stop_price: float
    risk_money: float
    target_price: float | None = None
    setup: str = ""
    exit_time: datetime | None = None
    exit_price: float | None = None
    exit_reason: ExitReason | None = None
    gross_pnl: float = 0.0
    commission: float = 0.0
    spread_cost: float = 0.0
    mae: float = 0.0
    mfe: float = 0.0
    bars_held: int = 0
    context: dict[str, float | str] = field(default_factory=dict)
    tags: list[str] = field(default_factory=list)
    partial_exits: list[dict[str, float]] = field(default_factory=list)

    @property
    def is_open(self) -> bool:
        return self.exit_time is None

    @property
    def pnl(self) -> float:
        """Nettoergebnis in Geld (Kommission bereits abgezogen).

        Spread und Slippage stecken bereits in den Fuellpreisen und damit in
        ``gross_pnl``; ``spread_cost`` haelt sie zusaetzlich fest, damit der
        Report die *gesamten* Handelskosten ausweisen kann.
        """
        return self.gross_pnl - self.commission

    @property
    def total_costs(self) -> float:
        """Alle Kosten des Trades: Kommission plus Spread und Slippage."""
        return self.commission + self.spread_cost

    @property
    def r_multiple(self) -> float:
        """Ergebnis in Vielfachen des geplanten Risikos."""
        if self.risk_money <= 0:
            return 0.0
        return self.pnl / self.risk_money

    @property
    def mae_r(self) -> float:
        """Groesster Buchverlust waehrend des Trades in R."""
        if self.risk_money <= 0:
            return 0.0
        return self.mae / self.risk_money

    @property
    def mfe_r(self) -> float:
        """Groesster Buchgewinn waehrend des Trades in R."""
        if self.risk_money <= 0:
            return 0.0
        return self.mfe / self.risk_money

    @property
    def duration_minutes(self) -> float:
        if self.exit_time is None:
            return 0.0
        return (self.exit_time - self.entry_time).total_seconds() / 60

    def add_tag(self, tag: str) -> None:
        """Haengt ein Fehler-/Analyse-Label an, ohne Duplikate."""
        if tag not in self.tags:
            self.tags.append(tag)
