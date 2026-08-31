"""Konfiguration: ein Ort fuer alle Einstellungen, ladbar aus JSON und .env.

Reihenfolge der Quellen (spaetere gewinnen):

1. Standardwerte im Code (das 50k-Konto aus der Aufgabenstellung)
2. JSON-Datei, falls angegeben
3. Umgebungsvariablen mit dem Praefix ``PROPBOT_``
4. Kommandozeilenargumente (macht das CLI selbst)
"""

from __future__ import annotations

import json
import os
from dataclasses import asdict, dataclass, field, fields, replace
from pathlib import Path

from .engine import ExecutionSettings
from .models import INSTRUMENTS, Instrument
from .risk import RiskSettings
from .rules import DrawdownMode, PropFirmRules
from .strategy.base import SessionWindow

__all__ = ["BotConfig", "ConfigError", "load_config"]

_PREFIX = "PROPBOT_"


class ConfigError(RuntimeError):
    """Die Konfiguration ist unvollstaendig oder unsinnig."""


@dataclass(slots=True)
class BotConfig:
    """Alles, was der Bot zum Laufen braucht."""

    symbol: str = "EURUSD"
    timeframe: str = "M15"
    strategy: str = "trend_pullback"
    adaptive: bool = True
    rules: PropFirmRules = field(default_factory=PropFirmRules)
    risk: RiskSettings = field(default_factory=RiskSettings)
    execution: ExecutionSettings = field(default_factory=ExecutionSettings)
    session: SessionWindow = field(default_factory=SessionWindow)
    data_path: str | None = None
    journal_path: str = "data/journal.db"
    state_path: str = "data/live_state.json"
    dry_run: bool = True

    @property
    def instrument(self) -> Instrument:
        if self.symbol not in INSTRUMENTS:
            raise ConfigError(
                f"Unbekanntes Symbol {self.symbol!r}. Bekannt: "
                f"{', '.join(sorted(INSTRUMENTS))}. Eigene Instrumente in "
                f"propbot/models.py ergaenzen."
            )
        return INSTRUMENTS[self.symbol]

    def to_dict(self) -> dict:
        data = asdict(self)
        data["rules"]["drawdown_mode"] = self.rules.drawdown_mode.value
        data["execution"] = asdict(self.execution)
        return data

    def save(self, path: str | Path) -> Path:
        target = Path(path)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(json.dumps(self.to_dict(), indent=2, default=str), encoding="utf-8")
        return target

    def describe(self) -> str:
        return (
            f"Symbol {self.symbol} ({self.timeframe}) | Strategie {self.strategy}"
            f"{' + Lernschicht' if self.adaptive else ''} | "
            f"Risiko {self.risk.base_risk_pct:.2%} | "
            f"{'DRY-RUN' if self.dry_run else 'LIVE'}\n" + self.rules.describe()
        )


def load_config(path: str | Path | None = None, **overrides) -> BotConfig:
    """Baut die Konfiguration aus Datei, Umgebung und expliziten Werten."""
    config = BotConfig()
    if path is not None:
        config = _from_dict(config, _read_json(path))
    config = _from_env(config)
    if overrides:
        config = _apply(
            config, {key: value for key, value in overrides.items() if value is not None}
        )
    return config


def _read_json(path: str | Path) -> dict:
    file = Path(path)
    if not file.exists():
        raise ConfigError(f"Konfigurationsdatei {file} gibt es nicht.")
    try:
        return json.loads(file.read_text(encoding="utf-8"))
    except json.JSONDecodeError as error:
        raise ConfigError(f"{file} ist kein gueltiges JSON: {error}") from None


def _from_dict(config: BotConfig, data: dict) -> BotConfig:
    nested = {
        "rules": PropFirmRules,
        "risk": RiskSettings,
        "execution": ExecutionSettings,
        "session": SessionWindow,
    }
    flat = {key: value for key, value in data.items() if key not in nested}
    config = _apply(config, flat)
    for name, factory in nested.items():
        if name in data and isinstance(data[name], dict):
            payload = dict(data[name])
            if name == "rules" and "drawdown_mode" in payload:
                payload["drawdown_mode"] = DrawdownMode(payload["drawdown_mode"])
            if name == "session":
                for key in ("weekdays", "blackouts"):
                    if key in payload and payload[key] is not None:
                        payload[key] = tuple(
                            tuple(item) if isinstance(item, list) else item for item in payload[key]
                        )
            known = {item.name for item in fields(factory)}
            unknown = set(payload) - known
            if unknown:
                raise ConfigError(
                    f"Unbekannte Einstellung(en) in '{name}': {', '.join(sorted(unknown))}"
                )
            setattr(config, name, replace(getattr(config, name), **payload))
    return config


def _from_env(config: BotConfig) -> BotConfig:
    """Liest ``PROPBOT_*``-Variablen, z. B. ``PROPBOT_RULES_MAX_DRAWDOWN=2000``."""
    mapping = {
        "SYMBOL": ("symbol", str),
        "TIMEFRAME": ("timeframe", str),
        "STRATEGY": ("strategy", str),
        "ADAPTIVE": ("adaptive", _to_bool),
        "DRY_RUN": ("dry_run", _to_bool),
        "DATA": ("data_path", str),
        "JOURNAL": ("journal_path", str),
        "STATE": ("state_path", str),
    }
    updates: dict = {}
    for suffix, (name, caster) in mapping.items():
        raw = os.getenv(_PREFIX + suffix)
        if raw:
            updates[name] = caster(raw)
    config = _apply(config, updates)

    for group, factory in (("RULES", PropFirmRules), ("RISK", RiskSettings)):
        payload: dict = {}
        for item in fields(factory):
            raw = os.getenv(f"{_PREFIX}{group}_{item.name.upper()}")
            if not raw:
                continue
            payload[item.name] = _cast(raw, item.type, item.name)
        if payload:
            attribute = group.lower()
            setattr(config, attribute, replace(getattr(config, attribute), **payload))
    return config


def _apply(config: BotConfig, values: dict) -> BotConfig:
    known = {item.name for item in fields(BotConfig)}
    for key, value in values.items():
        if key not in known:
            raise ConfigError(f"Unbekannte Einstellung {key!r}.")
        setattr(config, key, value)
    return config


def _cast(raw: str, annotation, name: str):
    text = str(annotation)
    if name == "drawdown_mode":
        try:
            return DrawdownMode(raw)
        except ValueError:
            raise ConfigError(
                f"drawdown_mode muss eines von {[mode.value for mode in DrawdownMode]} sein."
            ) from None
    if "bool" in text:
        return _to_bool(raw)
    if "int" in text and "float" not in text:
        return int(raw)
    if "float" in text:
        if raw.lower() in ("none", "null", ""):
            return None
        return float(raw)
    return raw


def _to_bool(raw: str) -> bool:
    value = raw.strip().lower()
    if value in ("1", "true", "yes", "on", "ja"):
        return True
    if value in ("0", "false", "no", "off", "nein"):
        return False
    raise ConfigError(f"{raw!r} ist kein Wahrheitswert.")
