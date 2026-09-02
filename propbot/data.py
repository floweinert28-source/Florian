"""Kursdaten laden oder erzeugen.

Zwei Quellen:

``load_csv``
    Liest echte Daten (Export aus MetaTrader, Dukascopy, Broker-API, ...).
    Erwartet Spalten fuer Zeit und OHLC, Gross-/Kleinschreibung egal.
``synthetic_market``
    Erzeugt einen kuenstlichen, aber strukturierten Markt: Trend- und
    Seitwaertsphasen wechseln sich ab, die Volatilitaet folgt den
    Handelssessions, Wochenenden fehlen, und es gibt Montags-Gaps.

**Wichtig und ehrlich gesagt:** synthetische Daten beweisen *keinen* Edge. Sie
sind dazu da, die Mechanik zu testen - Regeln, Groessen, Ausstiege, Reports -
ohne auf einen Datendownload zu warten. Fuer eine Aussage ueber die Strategie
brauchst du echte Kursdaten deines Brokers.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from pathlib import Path

import numpy as np
import pandas as pd

__all__ = [
    "REQUIRED_COLUMNS",
    "load_csv",
    "ohne_phantomkerzen",
    "resample",
    "split",
    "synthetic_market",
]

REQUIRED_COLUMNS = ("open", "high", "low", "close")

_TIME_CANDIDATES = ("time", "timestamp", "date", "datetime", "date_time", "<date>")


def load_csv(
    path: str | Path, *, time_column: str | None = None, drop_phantom: bool = True
) -> pd.DataFrame:
    """Laedt eine CSV-Datei mit OHLC-Daten und normalisiert sie.

    ``drop_phantom`` entfernt aufgefuellte Kerzen geschlossener Zeiten - siehe
    :func:`ohne_phantomkerzen`. Standardmaessig an, weil solche Kerzen jede
    Auswertung verfaelschen.
    """
    frame = pd.read_csv(path)
    frame.columns = [
        str(column).strip().lower().lstrip("<").rstrip(">") for column in frame.columns
    ]

    if time_column is None:
        for candidate in _TIME_CANDIDATES:
            if candidate in frame.columns:
                time_column = candidate
                break
    if time_column is None:
        if {"date", "time"} <= set(frame.columns):
            frame["__time"] = frame["date"].astype(str) + " " + frame["time"].astype(str)
            time_column = "__time"
        else:
            raise ValueError(f"Keine Zeitspalte gefunden. Vorhanden: {', '.join(frame.columns)}")

    index = pd.to_datetime(frame[time_column], utc=True, format="mixed")
    frame = frame.set_index(pd.DatetimeIndex(index, name="time"))

    missing = [column for column in REQUIRED_COLUMNS if column not in frame.columns]
    if missing:
        raise ValueError(f"Spalten fehlen in {path}: {', '.join(missing)}")
    if "volume" not in frame.columns:
        frame["volume"] = 0.0

    frame = frame[[*REQUIRED_COLUMNS, "volume"]].astype(float)
    frame = frame[~frame.index.duplicated(keep="last")].sort_index()
    if drop_phantom:
        frame = ohne_phantomkerzen(frame)
    return validate(frame)


def ohne_phantomkerzen(frame: pd.DataFrame) -> pd.DataFrame:
    """Entfernt Kerzen, die es nie gab.

    Datenanbieter fuellen geschlossene Zeiten oft mit flachen Kerzen auf:
    open = high = low = close, Volumen 0. Im NQ-Datensatz von Dukascopy
    betrifft das ganze Feiertage (15 Tage mit je 78 M5-Kerzen), die
    Nachmittagshaelfte von 44 halben Handelstagen und die taegliche
    CME-Wartungspause.

    Das ist kein Schoenheitsfehler: solche Kerzen verzerren ATR, VWAP und jedes
    rollende Quantil, und eine Strategie kann darauf Signale erzeugen, die es
    in Wirklichkeit nie gab.
    """
    flach = (frame["high"] == frame["low"]) & (frame["open"] == frame["close"])
    if "volume" in frame.columns:
        flach &= frame["volume"] <= 0
    return frame[~flach]


def validate(frame: pd.DataFrame) -> pd.DataFrame:
    """Prueft die Plausibilitaet der Kerzen und wirft bei Unsinn."""
    if frame.empty:
        raise ValueError("Datensatz ist leer.")
    if not isinstance(frame.index, pd.DatetimeIndex):
        raise ValueError("Index muss ein DatetimeIndex sein.")
    if frame[list(REQUIRED_COLUMNS)].isna().any().any():
        raise ValueError("Datensatz enthaelt Luecken (NaN) in den OHLC-Spalten.")
    high_ok = (frame["high"] >= frame[["open", "close", "low"]].max(axis=1) - 1e-9).all()
    low_ok = (frame["low"] <= frame[["open", "close", "high"]].min(axis=1) + 1e-9).all()
    if not (high_ok and low_ok):
        raise ValueError("Inkonsistente Kerzen: high/low passen nicht zu open/close.")
    if (frame[list(REQUIRED_COLUMNS)] <= 0).any().any():
        raise ValueError("Preise muessen positiv sein.")
    return frame


def resample(frame: pd.DataFrame, rule: str) -> pd.DataFrame:
    """Fasst Kerzen zu einem groesseren Zeitrahmen zusammen ('1h', '4h', '1D')."""
    aggregated = frame.resample(rule, label="left", closed="left").agg(
        {"open": "first", "high": "max", "low": "min", "close": "last", "volume": "sum"}
    )
    return aggregated.dropna(subset=["open", "high", "low", "close"])


def split(frame: pd.DataFrame, train_share: float = 0.6) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Teilt chronologisch in Trainings- und Testdaten (nie zufaellig!)."""
    if not 0 < train_share < 1:
        raise ValueError("train_share muss zwischen 0 und 1 liegen.")
    cut = int(len(frame) * train_share)
    return frame.iloc[:cut], frame.iloc[cut:]


def synthetic_market(
    *,
    bars: int = 20_000,
    timeframe_minutes: int = 15,
    start: datetime | None = None,
    start_price: float = 1.08000,
    daily_volatility: float = 0.0055,
    seed: int = 42,
    trend_persistence: float = 0.985,
    subticks: int = 12,
) -> pd.DataFrame:
    """Erzeugt einen kuenstlichen Markt mit Trend-, Range- und Session-Struktur.

    Das Modell ist bewusst kein reiner Random Walk: ein verstecktes Regime
    (Aufwaerts / Abwaerts / Seitwaerts) steuert Drift und Volatilitaet, und
    innerhalb einer Seitwaertsphase zieht der Kurs zu seinem Mittel zurueck.
    Damit entstehen genau die beiden Muster, die die Strategien im Paket
    abgreifen - und die Backtests werden nicht durch reines Rauschen
    entwertet.
    """
    if bars < 100:
        raise ValueError("bars muss mindestens 100 sein.")
    if timeframe_minutes <= 0 or 1440 % timeframe_minutes:
        raise ValueError("timeframe_minutes muss ein Teiler von 1440 sein.")

    rng = np.random.default_rng(seed)
    start = start or datetime(2023, 1, 2, 0, 0, tzinfo=timezone.utc)
    step = timedelta(minutes=timeframe_minutes)
    bars_per_day = 1440 // timeframe_minutes
    bar_volatility = daily_volatility / np.sqrt(bars_per_day)

    times: list[datetime] = []
    moment = start
    while len(times) < bars:
        if moment.weekday() < 5:  # Wochenende ueberspringen
            times.append(moment)
        moment += step

    # Regime-Kette: 0 = Range, 1 = Aufwaerts, 2 = Abwaerts
    regimes = np.empty(bars, dtype=int)
    state = 0
    switch = 1 - trend_persistence
    for i in range(bars):
        if rng.random() < switch:
            state = int(rng.choice([0, 1, 2], p=[0.45, 0.275, 0.275]))
        regimes[i] = state

    drift_map = np.array([0.0, 0.30, -0.30]) * bar_volatility
    volatility_map = np.array([0.80, 1.05, 1.10])

    opens = np.empty(bars)
    highs = np.empty(bars)
    lows = np.empty(bars)
    closes = np.empty(bars)
    volumes = np.empty(bars)

    price = start_price
    anchor = start_price
    for i, moment in enumerate(times):
        regime = regimes[i]
        session = _session_factor(moment.hour)
        volatility = bar_volatility * volatility_map[regime] * session
        drift = drift_map[regime] * session
        if regime == 0:
            # Rueckkehr zum Mittel der Seitwaertsphase
            drift += -0.03 * (price - anchor) / max(price, 1e-9)
        else:
            anchor = price

        if i and times[i].date() != times[i - 1].date() and times[i].weekday() == 0:
            price *= 1 + rng.normal(0, bar_volatility * 3)  # Wochenend-Gap

        opens[i] = price
        path = price * np.cumprod(
            1 + rng.normal(drift / subticks, volatility / np.sqrt(subticks), subticks)
        )
        highs[i] = max(opens[i], path.max())
        lows[i] = min(opens[i], path.min())
        closes[i] = path[-1]
        volumes[i] = max(1.0, rng.normal(1000, 250) * session)
        price = closes[i]

    frame = pd.DataFrame(
        {
            "open": opens,
            "high": highs,
            "low": lows,
            "close": closes,
            "volume": volumes,
            "regime": regimes,
        },
        index=pd.DatetimeIndex(times, name="time"),
    )
    validate(frame)
    return frame


def _session_factor(hour_utc: int) -> float:
    """Volatilitaetsprofil ueber den Tag (London- und New-York-Session).

    Die Werte sind grob an FX-Majors angelehnt: die asiatische Session ist
    duenn, die Ueberschneidung London/New York (13-16 UTC) ist am aktivsten.
    """
    if 7 <= hour_utc < 12:
        return 1.20
    if 12 <= hour_utc < 17:
        return 1.45
    if 17 <= hour_utc < 21:
        return 0.85
    return 0.45
