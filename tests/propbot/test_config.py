"""Tests der Konfiguration."""

from __future__ import annotations

import json

import pytest

from propbot.config import ConfigError, load_config
from propbot.rules import DrawdownMode


def test_standard_entspricht_der_aufgabe() -> None:
    config = load_config()

    assert config.rules.start_balance == 50_000
    assert config.rules.profit_target == 4_000
    assert config.rules.max_drawdown == 2_000
    assert config.symbol == "EURUSD"
    assert config.dry_run is True, "Live-Handel muss man bewusst einschalten"


def test_umgebungsvariablen_schlagen_durch(monkeypatch) -> None:
    monkeypatch.setenv("PROPBOT_RULES_MAX_DRAWDOWN", "2500")
    monkeypatch.setenv("PROPBOT_RULES_DRAWDOWN_MODE", "static")
    monkeypatch.setenv("PROPBOT_RISK_BASE_RISK_PCT", "0.003")
    monkeypatch.setenv("PROPBOT_ADAPTIVE", "nein")

    config = load_config()

    assert config.rules.max_drawdown == 2_500
    assert config.rules.drawdown_mode is DrawdownMode.STATIC
    assert config.risk.base_risk_pct == 0.003
    assert config.adaptive is False


def test_json_datei_wird_gelesen(tmp_path) -> None:
    path = tmp_path / "config.json"
    path.write_text(
        json.dumps(
            {
                "symbol": "XAUUSD",
                "rules": {"profit_target": 3_000, "drawdown_mode": "trailing_intraday"},
                "risk": {"max_trades_per_day": 2},
            }
        ),
        encoding="utf-8",
    )

    config = load_config(path)

    assert config.symbol == "XAUUSD"
    assert config.rules.profit_target == 3_000
    assert config.rules.drawdown_mode is DrawdownMode.TRAILING_INTRADAY
    assert config.risk.max_trades_per_day == 2
    assert config.instrument.symbol == "XAUUSD"


def test_speichern_und_wieder_laden(tmp_path) -> None:
    original = load_config()
    pfad = original.save(tmp_path / "gespeichert.json")

    geladen = load_config(pfad)

    assert geladen.rules == original.rules
    assert geladen.risk == original.risk


def test_tippfehler_werden_gemeldet(tmp_path) -> None:
    path = tmp_path / "config.json"
    path.write_text(json.dumps({"rules": {"max_drawdon": 2_000}}), encoding="utf-8")

    with pytest.raises(ConfigError, match="max_drawdon"):
        load_config(path)


def test_unbekanntes_symbol_meldet_sich() -> None:
    config = load_config(symbol="GIBTESNICHT")

    with pytest.raises(ConfigError, match="Unbekanntes Symbol"):
        _ = config.instrument


def test_fehlende_datei_meldet_sich(tmp_path) -> None:
    with pytest.raises(ConfigError):
        load_config(tmp_path / "weg.json")
