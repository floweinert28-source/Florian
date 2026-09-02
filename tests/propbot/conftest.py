"""Gemeinsame Fixtures und Hilfen fuer die Bot-Tests."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pandas as pd
import pytest

from propbot.data import synthetic_market
from propbot.models import Instrument, Side, Signal
from propbot.rules import PropFirmRules
from propbot.strategy.base import SessionWindow, Strategy

START = datetime(2026, 1, 5, 8, 0, tzinfo=timezone.utc)  # ein Montag

#: Instrument ohne Kosten - macht Erwartungswerte in Tests exakt nachrechenbar.
CLEAN = Instrument(
    symbol="TEST",
    value_per_point=100_000.0,
    spread=0.0,
    commission=0.0,
    slippage=0.0,
    size_step=0.01,
    min_size=0.01,
    max_size=100.0,
    digits=5,
)

#: Instrument mit realistischen Kosten.
COSTLY = Instrument(
    symbol="TESTC",
    value_per_point=100_000.0,
    spread=0.0002,
    commission=7.0,
    slippage=0.0001,
    size_step=0.01,
    min_size=0.01,
    max_size=100.0,
    digits=5,
)


def bars(
    rows: list[tuple[float, float, float, float]], *, start: datetime = START, minutes: int = 15
) -> pd.DataFrame:
    """Baut einen Kerzen-DataFrame aus (open, high, low, close)-Tupeln."""
    index = pd.DatetimeIndex(
        [start + timedelta(minutes=minutes * i) for i in range(len(rows))], name="time"
    )
    frame = pd.DataFrame(rows, columns=["open", "high", "low", "close"], index=index)
    frame["volume"] = 100.0
    return frame


class ScriptedStrategy(Strategy):
    """Strategie, die genau an vorgegebenen Kerzen ein Signal liefert."""

    name = "scripted"

    def __init__(
        self, signals: dict[int, Signal], *, warmup: int = 1, session: SessionWindow | None = None
    ) -> None:
        super().__init__(
            session
            or SessionWindow(
                start="00:00",
                end="23:59",
                no_new_trades_after="23:59",
                flat_at="23:59",
                blackouts=(),
                skip_friday_after=None,
            )
        )
        self.signals = signals
        self._warmup = warmup
        self.closed_trades = []

    @property
    def warmup(self) -> int:
        return self._warmup

    def prepare(self, frame: pd.DataFrame) -> pd.DataFrame:
        data = frame.copy()
        data["atr"] = (data["high"] - data["low"]).rolling(3, min_periods=1).mean()
        return data

    def signal(self, frame: pd.DataFrame, index: int) -> Signal | None:
        return self.signals.get(index)

    def on_trade_closed(self, trade) -> None:
        self.closed_trades.append(trade)


@pytest.fixture
def rules() -> PropFirmRules:
    return PropFirmRules()


@pytest.fixture(scope="session")
def market() -> pd.DataFrame:
    """Ein kleiner synthetischer Markt, einmal je Testlauf erzeugt."""
    return synthetic_market(bars=6000, seed=99)


@pytest.fixture
def long_signal() -> Signal:
    return Signal(side=Side.LONG, stop_price=1.0980, target_price=1.1040, setup="test_long")
