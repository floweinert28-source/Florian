"""Tests der Handelszeitfenster - besonders der Zeitzonen."""

from __future__ import annotations

import pandas as pd
import pytest

from propbot.config import ConfigError, load_config, sitzung_fuer
from propbot.models import INSTRUMENTS
from propbot.strategy import SessionWindow


def utc(text: str) -> pd.Timestamp:
    return pd.Timestamp(text, tz="UTC")


def test_us_profil_folgt_der_sommerzeit() -> None:
    """09:30 New York sind im Winter 14:30 UTC, im Sommer 13:30 UTC."""
    session = SessionWindow.us_futures_rth()

    # Januar (EST): 15:30 UTC = 10:30 NY -> erlaubt, 14:00 UTC = 09:00 NY -> zu frueh
    assert session.allows(utc("2023-01-10 15:30"))
    assert not session.allows(utc("2023-01-10 14:00"))

    # Juli (EDT): dieselbe Ortszeit liegt eine Stunde frueher in UTC
    assert session.allows(utc("2023-07-11 14:30"))
    assert not session.allows(utc("2023-07-11 13:00"))


def test_eroeffnungsauktion_ist_gesperrt() -> None:
    session = SessionWindow.us_futures_rth()

    assert not session.allows(utc("2023-01-10 14:35")), "09:35 NY liegt im Sperrfenster"
    assert session.allows(utc("2023-01-10 14:50")), "09:50 NY ist wieder frei"


def test_kein_einstieg_kurz_vor_schluss() -> None:
    session = SessionWindow.us_futures_rth()

    assert session.allows(utc("2023-01-10 20:10"))  # 15:10 NY
    assert not session.allows(utc("2023-01-10 20:20"))  # 15:20 NY


def test_flat_vor_dem_boersenschluss_und_ausserhalb() -> None:
    session = SessionWindow.us_futures_rth()

    assert session.must_be_flat(utc("2023-01-10 20:55"))  # 15:55 NY
    assert not session.must_be_flat(utc("2023-01-10 18:00"))  # 13:00 NY
    assert session.must_be_flat(utc("2023-01-10 09:00")), "vor der Eroeffnung nie offen"


def test_naive_zeitstempel_gelten_als_utc() -> None:
    session = SessionWindow.us_futures_rth()

    assert session.allows(pd.Timestamp("2023-01-10 15:30"))


def test_profil_wird_nach_instrument_gewaehlt() -> None:
    assert sitzung_fuer("auto", "MNQ").zeitzone == "America/New_York"
    assert sitzung_fuer("auto", "EURUSD").zeitzone == "UTC"
    assert sitzung_fuer("fx", "MNQ").zeitzone == "UTC"
    assert sitzung_fuer("us_rth", "EURUSD").zeitzone == "America/New_York"

    with pytest.raises(ConfigError):
        sitzung_fuer("mondphase", "MNQ")


def test_konfiguration_waehlt_automatisch() -> None:
    assert load_config(symbol="MNQ").session.zeitzone == "America/New_York"
    assert load_config(symbol="EURUSD").session.zeitzone == "UTC"
    assert load_config(symbol="MNQ", session_profile="fx").session.zeitzone == "UTC"


def test_eigene_session_schlaegt_das_profil(tmp_path) -> None:
    import json

    pfad = tmp_path / "config.json"
    pfad.write_text(
        json.dumps({"symbol": "MNQ", "session": {"start": "10:00", "zeitzone": "Europe/Berlin"}}),
        encoding="utf-8",
    )

    config = load_config(pfad)

    assert config.session.zeitzone == "Europe/Berlin"
    assert config.session.start == "10:00"


def test_nq_und_mnq_sind_richtig_bemessen() -> None:
    nq, mnq = INSTRUMENTS["NQ"], INSTRUMENTS["MNQ"]

    assert nq.value_per_point == 20.0 and mnq.value_per_point == 2.0
    assert nq.money(30, 1) == pytest.approx(600.0), "30 Punkte Stop = 600 $ je NQ-Kontrakt"
    assert mnq.money(30, 1) == pytest.approx(60.0)
    assert nq.round_price(15_123.30) == pytest.approx(15_123.25), "Tickgroesse 0,25"
    assert nq.min_size == 1.0 and nq.size_step == 1.0, "Futures gibt es nur ganz"


def test_ein_nq_kontrakt_sprengt_das_risikobudget() -> None:
    """Die wichtigste Zahl fuer ein 50k-Konto: NQ ist zu gross, MNQ passt."""
    from propbot.models import Side
    from propbot.risk import RiskManager
    from propbot.rules import AccountState, PropFirmRules

    zustand = AccountState(PropFirmRules())
    zustand.mark(pd.Timestamp("2026-01-05 15:00", tz="UTC"), 50_000, 50_000)
    manager = RiskManager()

    nq = manager.plan(zustand, INSTRUMENTS["NQ"], Side.LONG, 15_000, 14_970, target_price=15_060)
    mnq = manager.plan(zustand, INSTRUMENTS["MNQ"], Side.LONG, 15_000, 14_970, target_price=15_060)

    assert not nq.allowed, "ein einziger NQ-Kontrakt kostet mehr als das Budget erlaubt"
    assert mnq.allowed and mnq.size >= 3


def test_flat_regel_greift_bei_reinen_rth_daten() -> None:
    """Der Fehler, den erst echte NQ-Daten zeigten.

    Ein Datensatz mit nur der Kernhandelszeit endet mit der 15:45-Kerze. Wird
    dafuer der Kerzen*beginn* gegen ``flat_at`` (15:50) geprueft, loest die
    Regel nie aus - die Position laeuft ueber Nacht weiter. Geprueft werden
    muss das Kerzen*ende*.
    """
    from datetime import timedelta

    session = SessionWindow.us_futures_rth()
    letzte_kerze = utc("2023-01-10 20:45")  # 15:45 New York

    assert not session.must_be_flat(letzte_kerze), "Kerzenbeginn liegt vor der Flat-Zeit"
    assert session.must_be_flat(letzte_kerze + timedelta(minutes=15)), "Kerzenende nicht"


def test_engine_schliesst_am_sessionende(tmp_path) -> None:
    """Gegenprobe in der Engine: kein Trade darf ueber Nacht laufen."""
    import pandas as pd

    from propbot.engine import Backtester, ExecutionSettings
    from propbot.models import INSTRUMENTS, ExitReason, Side, Signal
    from propbot.rules import PropFirmRules

    from .conftest import ScriptedStrategy

    # Zwei Handelstage mit je vier M15-Kerzen der Kernhandelszeit
    zeiten = []
    for tag in ("2023-01-10", "2023-01-11"):
        zeiten += [
            pd.Timestamp(f"{tag} {zeit}", tz="UTC") for zeit in ("15:00", "15:15", "20:30", "20:45")
        ]
    frame = pd.DataFrame(
        {"open": 15_000.0, "high": 15_010.0, "low": 14_990.0, "close": 15_000.0, "volume": 1.0},
        index=pd.DatetimeIndex(zeiten, name="time"),
    )
    # Signal auf Kerze 1 (15:15 UTC = 10:15 NY), Einstieg zur naechsten Kerze
    strategie = ScriptedStrategy(
        {1: Signal(side=Side.LONG, stop_price=14_900.0, target_price=15_300.0)},
        session=SessionWindow.us_futures_rth(),
    )
    ergebnis = Backtester(
        strategie,
        INSTRUMENTS["MNQ"],  # Indexpreise brauchen ein Instrument mit passender Groesse
        rules=PropFirmRules(),
        execution=ExecutionSettings(
            partial_at_r=None, breakeven_at_r=None, trail_after_r=None, time_stop_bars=None
        ),
    ).run(frame)

    assert ergebnis.trades, "es haette ein Trade entstehen muessen"
    trade = ergebnis.trades[0]
    assert trade.exit_reason is ExitReason.SESSION_END
    assert trade.exit_time.date() == trade.entry_time.date(), "kein Uebernacht-Halten"
