"""Tests der Kennzahlen und Berichte."""

from __future__ import annotations

from datetime import timedelta

import pytest

from propbot import reporting
from propbot.metrics import compute, format_report
from propbot.models import ExitReason, Side, Trade
from propbot.risk import RiskSettings
from propbot.rules import AccountStatus, PropFirmRules

from .conftest import START


def trade(pnl: float, *, tag: int = 0, reason: ExitReason = ExitReason.TARGET) -> Trade:
    item = Trade(
        symbol="TEST",
        side=Side.LONG,
        entry_time=START + timedelta(days=tag),
        entry_price=1.1,
        size=1.0,
        stop_price=1.098,
        risk_money=250.0,
        setup="test_long",
    )
    item.exit_time = item.entry_time + timedelta(hours=1)
    item.exit_price = 1.102
    item.exit_reason = reason
    item.gross_pnl = pnl
    return item


def test_kennzahlen_einer_bekannten_serie() -> None:
    trades = [trade(500.0), trade(500.0), trade(-250.0), trade(-250.0)]

    report = compute(trades, None, PropFirmRules())

    assert report.trades == 4
    assert report.win_rate == pytest.approx(0.5)
    assert report.expectancy_r == pytest.approx(0.5)
    assert report.profit_factor == pytest.approx(2.0)
    assert report.payoff_ratio == pytest.approx(2.0)
    assert report.net_profit == pytest.approx(500.0)


def test_verlustserie_wird_gezaehlt() -> None:
    trades = [
        trade(-250.0),
        trade(-250.0),
        trade(500.0),
        trade(-250.0),
        trade(-250.0),
        trade(-250.0),
    ]

    report = compute(trades, None, PropFirmRules())

    assert report.longest_loss_streak == 3


def test_tage_und_konsistenz() -> None:
    trades = [trade(1_000.0, tag=0), trade(200.0, tag=1), trade(200.0, tag=2)]

    report = compute(trades, None, PropFirmRules())

    assert report.trading_days == 3
    assert report.best_day == pytest.approx(1_000.0)
    assert report.best_day_share == pytest.approx(1_000 / 1_400)


def test_leerer_lauf_bleibt_stabil() -> None:
    report = compute([], None, PropFirmRules())

    assert report.trades == 0
    assert report.net_profit == 0
    assert "Trades" in format_report(report, PropFirmRules())


def test_bericht_nennt_status_und_puffer() -> None:
    report = compute([trade(500.0)], None, PropFirmRules(), status=AccountStatus.TARGET_REACHED)

    text = format_report(report, PropFirmRules(), "Test")

    assert "Ziel erreicht" in text
    assert "Max. Drawdown" in text and "Puffer" in text


def test_rechenbericht_enthaelt_die_kernzahlen() -> None:
    text = reporting.full_math_report(PropFirmRules())

    for erwartet in ("50,000", "4,000", "2,000", "Payout", "Verlustserien", "Fazit"):
        assert erwartet in text


def test_sicheres_risiko_passt_zum_tageslimit() -> None:
    rules = PropFirmRules(daily_loss_limit=1_000)
    settings = RiskSettings(own_daily_stop_fraction=0.6, max_losses_per_day=2)

    sicher, gefahr = reporting.safe_risk_for_daily_limit(rules, settings)

    assert sicher == pytest.approx(495.0)
    assert gefahr and min(value for value, _ in gefahr) == pytest.approx(500.0)


def test_schlechtester_tag_wird_richtig_gerechnet() -> None:
    settings = RiskSettings(own_daily_stop_fraction=0.6, max_losses_per_day=2)

    assert reporting.worst_daily_loss(250, settings, 1_000) == pytest.approx(500)
    assert reporting.worst_daily_loss(700, settings, 1_000) == pytest.approx(700)


def test_kostenbericht_warnt_bei_teuren_trades() -> None:
    from propbot.models import INSTRUMENTS

    text = reporting.cost_report(INSTRUMENTS["EURUSD"], stop_distance=0.0005, risk_money=250)

    assert "Warnung" in text
