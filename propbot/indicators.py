"""Indikatoren - alle streng kausal, also ohne Blick in die Zukunft.

Jede Funktion bekommt eine Serie/DataFrame und gibt eine Serie gleicher Laenge
zurueck, bei der Zeile *i* ausschliesslich aus Daten bis einschliesslich *i*
berechnet ist. Das ist die Bedingung dafuer, dass der Backtest nicht luegt -
:func:`propbot.engine.check_no_lookahead` prueft sie automatisch nach.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

__all__ = [
    "adx",
    "atr",
    "bollinger",
    "donchian",
    "ema",
    "rolling_slope",
    "rsi",
    "sma",
    "true_range",
    "zscore",
]


def sma(series: pd.Series, period: int) -> pd.Series:
    """Einfacher gleitender Durchschnitt."""
    _check_period(period)
    return series.rolling(period, min_periods=period).mean()


def ema(series: pd.Series, period: int) -> pd.Series:
    """Exponentieller gleitender Durchschnitt (adjust=False wie im Terminal)."""
    _check_period(period)
    return series.ewm(span=period, adjust=False, min_periods=period).mean()


def true_range(frame: pd.DataFrame) -> pd.Series:
    """True Range nach Wilder."""
    previous_close = frame["close"].shift(1)
    ranges = pd.concat(
        [
            frame["high"] - frame["low"],
            (frame["high"] - previous_close).abs(),
            (frame["low"] - previous_close).abs(),
        ],
        axis=1,
    )
    return ranges.max(axis=1)


def atr(frame: pd.DataFrame, period: int = 14) -> pd.Series:
    """Average True Range mit Wilder-Glaettung."""
    _check_period(period)
    return _wilder(true_range(frame), period)


def rsi(series: pd.Series, period: int = 14) -> pd.Series:
    """Relative Strength Index mit Wilder-Glaettung."""
    _check_period(period)
    change = series.diff()
    gains = change.clip(lower=0.0)
    losses = (-change).clip(lower=0.0)
    avg_gain = _wilder(gains, period)
    avg_loss = _wilder(losses, period)
    strength = avg_gain / avg_loss.replace(0.0, np.nan)
    result = 100 - 100 / (1 + strength)
    # Kein Verlust im Fenster -> RSI 100, kein Gewinn -> RSI 0.
    result = result.where(avg_loss != 0, 100.0)
    result = result.where(~((avg_gain == 0) & (avg_loss == 0)), 50.0)
    return result


def adx(frame: pd.DataFrame, period: int = 14) -> pd.Series:
    """Average Directional Index - misst, wie stark ein Trend laeuft."""
    _check_period(period)
    up_move = frame["high"].diff()
    down_move = -frame["low"].diff()
    plus_dm = np.where((up_move > down_move) & (up_move > 0), up_move, 0.0)
    minus_dm = np.where((down_move > up_move) & (down_move > 0), down_move, 0.0)
    atr_values = _wilder(true_range(frame), period)
    plus_di = 100 * _wilder(pd.Series(plus_dm, index=frame.index), period) / atr_values
    minus_di = 100 * _wilder(pd.Series(minus_dm, index=frame.index), period) / atr_values
    denominator = (plus_di + minus_di).replace(0.0, np.nan)
    directional_index = 100 * (plus_di - minus_di).abs() / denominator
    return _wilder(directional_index.fillna(0.0), period)


def donchian(frame: pd.DataFrame, period: int = 20) -> tuple[pd.Series, pd.Series]:
    """Hoechstes Hoch und tiefstes Tief der letzten ``period`` *abgeschlossenen* Kerzen.

    Die aktuelle Kerze wird bewusst ausgeklammert (``shift(1)``): sonst waere
    ein Ausbruch ueber das Hoch per Definition immer schon passiert.
    """
    _check_period(period)
    upper = frame["high"].rolling(period, min_periods=period).max().shift(1)
    lower = frame["low"].rolling(period, min_periods=period).min().shift(1)
    return upper, lower


def bollinger(
    series: pd.Series, period: int = 20, deviations: float = 2.0
) -> tuple[pd.Series, pd.Series, pd.Series]:
    """Mittellinie, oberes und unteres Band."""
    _check_period(period)
    middle = series.rolling(period, min_periods=period).mean()
    spread = series.rolling(period, min_periods=period).std(ddof=0) * deviations
    return middle, middle + spread, middle - spread


def zscore(series: pd.Series, period: int = 50) -> pd.Series:
    """Abweichung vom Mittel in Standardabweichungen."""
    _check_period(period)
    mean = series.rolling(period, min_periods=period).mean()
    deviation = series.rolling(period, min_periods=period).std(ddof=0)
    return (series - mean) / deviation.replace(0.0, np.nan)


def rolling_slope(series: pd.Series, period: int = 20) -> pd.Series:
    """Steigung einer Regressionsgeraden ueber ``period`` Werte, je Kerze."""
    _check_period(period)
    x = np.arange(period, dtype=float)
    x_centered = x - x.mean()
    denominator = float((x_centered**2).sum())

    def slope(window: np.ndarray) -> float:
        return float((x_centered * (window - window.mean())).sum() / denominator)

    return series.rolling(period, min_periods=period).apply(slope, raw=True)


def _wilder(series: pd.Series, period: int) -> pd.Series:
    """Wilders Glaettung - entspricht einem EMA mit alpha = 1/period."""
    return series.ewm(alpha=1 / period, adjust=False, min_periods=period).mean()


def _check_period(period: int) -> None:
    if period < 1:
        raise ValueError(f"period muss mindestens 1 sein, nicht {period}.")
