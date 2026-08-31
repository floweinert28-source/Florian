"""Handelstagebuch in SQLite - die Grundlage jeder Verbesserung.

Ohne Aufzeichnung gibt es kein Lernen. Jeder Trade landet hier mit Kontext
(Session, Regime, ADX-Klasse), Ergebnis (R, MAE, MFE) und den Fehler-Labels aus
:mod:`propbot.learning`. Backtest und Livehandel schreiben in dasselbe Format,
damit man beide direkt vergleichen kann - genau dort zeigt sich, ob die
Realitaet der Simulation folgt.
"""

from __future__ import annotations

import json
import sqlite3
from collections.abc import Iterable
from datetime import datetime, timezone
from pathlib import Path

from .models import Trade

__all__ = ["TradeJournal"]

_SCHEMA_VERSION = 1

_SCHEMA = """
CREATE TABLE IF NOT EXISTS runs (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT    NOT NULL,
    mode       TEXT    NOT NULL,
    strategy   TEXT    NOT NULL,
    symbol     TEXT    NOT NULL,
    params     TEXT    NOT NULL DEFAULT '{}',
    note       TEXT
);

CREATE TABLE IF NOT EXISTS trades (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id      INTEGER NOT NULL REFERENCES runs (id) ON DELETE CASCADE,
    symbol      TEXT    NOT NULL,
    side        TEXT    NOT NULL,
    setup       TEXT    NOT NULL DEFAULT '',
    entry_time  TEXT    NOT NULL,
    exit_time   TEXT,
    entry_price REAL    NOT NULL,
    exit_price  REAL,
    size        REAL    NOT NULL,
    stop_price  REAL    NOT NULL,
    risk_money  REAL    NOT NULL,
    pnl         REAL    NOT NULL DEFAULT 0,
    r_multiple  REAL    NOT NULL DEFAULT 0,
    mae_r       REAL    NOT NULL DEFAULT 0,
    mfe_r       REAL    NOT NULL DEFAULT 0,
    bars_held   INTEGER NOT NULL DEFAULT 0,
    exit_reason TEXT,
    context     TEXT    NOT NULL DEFAULT '{}',
    tags        TEXT    NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS equity (
    run_id  INTEGER NOT NULL REFERENCES runs (id) ON DELETE CASCADE,
    time    TEXT    NOT NULL,
    equity  REAL    NOT NULL,
    balance REAL    NOT NULL,
    floor   REAL    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_trades_run ON trades (run_id);
CREATE INDEX IF NOT EXISTS idx_trades_setup ON trades (setup);
"""


class TradeJournal:
    """Schreib- und Lesezugriff auf das Tagebuch."""

    def __init__(self, path: str | Path = "data/journal.db") -> None:
        self.path = Path(path)
        self._connection: sqlite3.Connection | None = None

    # ---------------------------------------------------------- Verbindung
    def connect(self) -> "TradeJournal":
        if self._connection is not None:
            return self
        if str(self.path) != ":memory:":
            self.path.parent.mkdir(parents=True, exist_ok=True)
        connection = sqlite3.connect(self.path, detect_types=0)
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA foreign_keys = ON")
        connection.executescript(_SCHEMA)
        connection.execute(f"PRAGMA user_version = {_SCHEMA_VERSION}")
        connection.commit()
        self._connection = connection
        return self

    def close(self) -> None:
        if self._connection is not None:
            self._connection.close()
            self._connection = None

    def __enter__(self) -> "TradeJournal":
        return self.connect()

    def __exit__(self, *exc_info) -> None:
        self.close()

    @property
    def connection(self) -> sqlite3.Connection:
        if self._connection is None:
            raise RuntimeError("Journal ist nicht verbunden - erst connect() aufrufen.")
        return self._connection

    # ------------------------------------------------------------ Schreiben
    def start_run(
        self,
        *,
        mode: str,
        strategy: str,
        symbol: str,
        params: dict | None = None,
        note: str | None = None,
    ) -> int:
        """Legt einen Lauf an und gibt dessen ID zurueck."""
        cursor = self.connection.execute(
            "INSERT INTO runs (created_at, mode, strategy, symbol, params, note) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (
                datetime.now(timezone.utc).isoformat(),
                mode,
                strategy,
                symbol,
                json.dumps(params or {}, default=str),
                note,
            ),
        )
        self.connection.commit()
        return int(cursor.lastrowid)

    def record(self, run_id: int, trade: Trade) -> int:
        """Schreibt einen geschlossenen Trade ins Tagebuch."""
        cursor = self.connection.execute(
            "INSERT INTO trades (run_id, symbol, side, setup, entry_time, exit_time, "
            "entry_price, exit_price, size, stop_price, risk_money, pnl, r_multiple, "
            "mae_r, mfe_r, bars_held, exit_reason, context, tags) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                run_id,
                trade.symbol,
                trade.side.value,
                trade.setup,
                trade.entry_time.isoformat(),
                trade.exit_time.isoformat() if trade.exit_time else None,
                trade.entry_price,
                trade.exit_price,
                trade.size,
                trade.stop_price,
                trade.risk_money,
                trade.pnl,
                trade.r_multiple,
                trade.mae_r,
                trade.mfe_r,
                trade.bars_held,
                trade.exit_reason.value if trade.exit_reason else None,
                json.dumps(trade.context, default=str),
                json.dumps(trade.tags),
            ),
        )
        self.connection.commit()
        return int(cursor.lastrowid)

    def record_many(self, run_id: int, trades: Iterable[Trade]) -> int:
        """Schreibt viele Trades in einer Transaktion."""
        count = 0
        for trade in trades:
            if trade.is_open:
                continue
            self.record(run_id, trade)
            count += 1
        return count

    def record_equity(self, run_id: int, curve) -> None:
        """Speichert die Equity-Kurve eines Laufs (DataFrame mit Zeitindex)."""
        rows = [
            (run_id, str(index), float(row.equity), float(row.balance), float(row.floor))
            for index, row in curve.iterrows()
        ]
        self.connection.executemany(
            "INSERT INTO equity (run_id, time, equity, balance, floor) VALUES (?, ?, ?, ?, ?)",
            rows,
        )
        self.connection.commit()

    # --------------------------------------------------------------- Lesen
    def runs(self, limit: int = 20) -> list[dict]:
        rows = self.connection.execute(
            "SELECT * FROM runs ORDER BY id DESC LIMIT ?", (limit,)
        ).fetchall()
        return [dict(row) for row in rows]

    def trades(self, run_id: int | None = None, limit: int | None = None) -> list[dict]:
        query = "SELECT * FROM trades"
        params: list = []
        if run_id is not None:
            query += " WHERE run_id = ?"
            params.append(run_id)
        query += " ORDER BY id"
        if limit is not None:
            query += " LIMIT ?"
            params.append(limit)
        rows = self.connection.execute(query, params).fetchall()
        result = []
        for row in rows:
            item = dict(row)
            item["context"] = json.loads(item["context"])
            item["tags"] = json.loads(item["tags"])
            result.append(item)
        return result

    def tag_counts(self, run_id: int | None = None) -> dict[str, int]:
        """Wie oft welches Fehler-Label vergeben wurde."""
        counts: dict[str, int] = {}
        for trade in self.trades(run_id):
            for tag in trade["tags"]:
                counts[tag] = counts.get(tag, 0) + 1
        return dict(sorted(counts.items(), key=lambda item: -item[1]))

    def expectancy_by(self, field: str, run_id: int | None = None) -> dict[str, dict[str, float]]:
        """Erwartungswert je Auspraegung eines Feldes (``setup`` oder Kontextschluessel)."""
        grouped: dict[str, list[float]] = {}
        for trade in self.trades(run_id):
            key = trade.get(field)
            if key is None:
                key = trade["context"].get(field)
            if key is None:
                continue
            grouped.setdefault(str(key), []).append(float(trade["r_multiple"]))
        return {
            key: {
                "trades": len(values),
                "expectancy_r": sum(values) / len(values),
                "win_rate": sum(1 for value in values if value > 0) / len(values),
                "sum_r": sum(values),
            }
            for key, values in sorted(grouped.items())
        }
