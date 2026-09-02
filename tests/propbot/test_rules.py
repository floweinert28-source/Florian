"""Tests des Prop-Firm-Regelwerks - der Teil, der ueber das Konto entscheidet."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest

from propbot.rules import AccountState, AccountStatus, DrawdownMode, PropFirmRules

from .conftest import START


def test_standardregeln_entsprechen_der_aufgabe() -> None:
    rules = PropFirmRules()

    assert rules.start_balance == 50_000
    assert rules.target_balance == 54_000
    assert rules.static_floor == 48_000
    assert rules.target_to_drawdown == 2.0


@pytest.mark.parametrize(
    "value",
    [
        {"start_balance": 0},
        {"profit_target": -1},
        {"max_drawdown": 0},
        {"daily_loss_limit": 0},
        {"daily_reset_hour": 24},
        {"consistency_cap": 1.5},
    ],
)
def test_unsinnige_regeln_fliegen_auf(value) -> None:
    with pytest.raises(ValueError):
        PropFirmRules(**value)


def test_handelstag_wechselt_zur_rollover_zeit() -> None:
    rules = PropFirmRules(daily_reset_hour=22)
    abends = datetime(2026, 1, 5, 21, 59, tzinfo=timezone.utc)
    nachts = datetime(2026, 1, 5, 22, 30, tzinfo=timezone.utc)

    assert rules.day_key(abends) != rules.day_key(nachts)
    assert rules.day_key(nachts) == rules.day_key(datetime(2026, 1, 6, 10, tzinfo=timezone.utc))


def test_statischer_boden_bleibt_stehen() -> None:
    state = AccountState(PropFirmRules(drawdown_mode=DrawdownMode.STATIC), start_time=START)

    state.mark(START, 53_000, 53_000)

    assert state.floor == 48_000
    assert state.remaining_drawdown == 5_000


def test_trailing_intraday_folgt_dem_equity_hoch() -> None:
    rules = PropFirmRules(drawdown_mode=DrawdownMode.TRAILING_INTRADAY)
    state = AccountState(rules, start_time=START)

    state.mark(START, 51_500, 50_000)  # nur Buchgewinn

    assert state.floor == 49_500
    assert state.status is AccountStatus.RUNNING


def test_trailing_eod_folgt_erst_beim_tageswechsel() -> None:
    rules = PropFirmRules(drawdown_mode=DrawdownMode.TRAILING_EOD)
    state = AccountState(rules, start_time=START)

    state.mark(START, 51_500, 51_500)
    assert state.floor == 48_000, "am selben Tag darf sich der Boden nicht bewegen"

    state.mark(START + timedelta(days=1), 51_500, 51_500)
    assert state.floor == 49_500


def test_trailing_boden_friert_am_startkapital_ein() -> None:
    rules = PropFirmRules(drawdown_mode=DrawdownMode.TRAILING_INTRADAY)
    state = AccountState(rules, start_time=START)

    state.mark(START, 53_000, 53_000)

    assert state.floor == 50_000, "der Boden darf nie ueber das Startkapital steigen"


def test_drawdown_bruch_wird_erkannt() -> None:
    state = AccountState(PropFirmRules(daily_loss_limit=None), start_time=START)

    status = state.mark(START, 47_999, 47_999)

    assert status is AccountStatus.BREACHED_DRAWDOWN
    assert state.status.is_final and state.status.is_breach


def test_tageslimit_bruch_wird_erkannt() -> None:
    state = AccountState(PropFirmRules(), start_time=START)

    status = state.mark(START, 49_000, 49_000)

    assert status is AccountStatus.BREACHED_DAILY_LOSS


def test_drawdown_hat_vorrang_vor_tageslimit() -> None:
    """Beides gleichzeitig gerissen -> der haertere Verstoss zaehlt."""
    state = AccountState(PropFirmRules(), start_time=START)

    status = state.mark(START, 47_500, 47_500)

    assert status is AccountStatus.BREACHED_DRAWDOWN


def test_ziel_wird_erkannt_und_ist_endgueltig() -> None:
    state = AccountState(PropFirmRules(), start_time=START)

    status = state.mark(START, 54_000, 54_000)

    assert status is AccountStatus.TARGET_REACHED
    assert state.status.is_final
    # Spaetere Kursbewegungen aendern nichts mehr
    assert state.mark(START + timedelta(hours=1), 40_000, 40_000) is AccountStatus.TARGET_REACHED


def test_ziel_erst_nach_mindesthandelstagen() -> None:
    rules = PropFirmRules(min_trading_days=3)
    state = AccountState(rules, start_time=START)

    assert state.mark(START, 54_500, 54_500) is AccountStatus.RUNNING

    for day in range(3):
        state.apply_trade(START + timedelta(days=day), 0.0)

    assert state.mark(START + timedelta(days=3), 54_500, 54_500) is AccountStatus.TARGET_REACHED


def test_tagesbudget_schrumpft_mit_dem_verlust() -> None:
    state = AccountState(PropFirmRules(), start_time=START)

    state.mark(START, 49_600, 49_600)

    assert state.remaining_daily_loss == pytest.approx(600)
    assert state.daily_loss_used() == pytest.approx(0.4)


def test_payout_sicherung_bei_schwebendem_gewinn() -> None:
    state = AccountState(PropFirmRules(), start_time=START)

    state.mark(START, 54_200, 51_000)  # Ziel nur als Buchgewinn erreicht

    assert state.should_secure_payout() is True
    assert state.status is AccountStatus.RUNNING


def test_konsistenzregel_begrenzt_den_tagesgewinn() -> None:
    state = AccountState(PropFirmRules(consistency_cap=0.4), start_time=START)

    assert state.max_day_profit_allowed() == pytest.approx(1_600)

    state.apply_trade(START, 1_500)

    assert state.max_day_profit_allowed() == pytest.approx(100)
    assert state.consistency_ok() is True


def test_bester_tag_anteil_ueber_mehrere_tage() -> None:
    state = AccountState(PropFirmRules(consistency_cap=0.4), start_time=START)

    state.apply_trade(START, 800)
    state.apply_trade(START + timedelta(days=1), 1_200)
    state.mark(START + timedelta(days=2), state.balance, state.balance)

    assert state.best_day_share() == pytest.approx(1_200 / 2_000)
    assert state.consistency_ok(at_payout=True) is False
    assert state.consistency_ok() is True, "gegen das Gesamtziel gerechnet noch im Rahmen"


def test_zustand_ueberlebt_neustart() -> None:
    """Der Trailing-Boden muss gespeichert werden - sonst luegt der Bot nach dem Neustart."""
    rules = PropFirmRules(drawdown_mode=DrawdownMode.TRAILING_INTRADAY)
    state = AccountState(rules, start_time=START)
    state.mark(START, 51_600, 51_600)
    state.apply_trade(START, 100)

    restored = AccountState.from_dict(state.to_dict(), rules)

    assert restored.floor == state.floor == 49_700
    assert restored.balance == state.balance
    assert restored.trading_days == state.trading_days
    assert restored.day_key == state.day_key


def test_tagesabschluss_wird_protokolliert() -> None:
    state = AccountState(PropFirmRules(), start_time=START)

    state.apply_trade(START, 300)
    state.mark(START + timedelta(days=1), state.balance, state.balance)

    assert len(state.days) == 1
    assert state.days[0].profit == pytest.approx(300)
