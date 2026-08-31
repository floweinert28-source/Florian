"""Tests des Risk-Managers - Groesse, Budgets und Sperren."""

from __future__ import annotations

import pytest

from propbot.models import Side
from propbot.risk import RiskManager, RiskSettings
from propbot.rules import AccountState, PropFirmRules

from .conftest import CLEAN, COSTLY, START


def account(**kwargs) -> AccountState:
    state = AccountState(PropFirmRules(**kwargs), start_time=START)
    state.mark(START, state.balance, state.balance)
    return state


def test_groesse_ergibt_genau_das_gewuenschte_risiko() -> None:
    manager = RiskManager()
    decision = manager.plan(account(), CLEAN, Side.LONG, 1.1000, 1.0980, target_price=1.1060)

    assert decision.allowed
    assert decision.size == pytest.approx(1.25)
    assert decision.risk_money == pytest.approx(250.0)


def test_kommission_wird_ins_risiko_eingerechnet() -> None:
    manager = RiskManager()
    sauber = manager.plan(account(), CLEAN, Side.LONG, 1.1000, 1.0980, target_price=1.1060)
    teuer = manager.plan(account(), COSTLY, Side.LONG, 1.1000, 1.0980, target_price=1.1060)

    assert teuer.size < sauber.size, "Kommission gehoert zum Risiko, also kleinere Position"


def test_restpuffer_begrenzt_die_groesse() -> None:
    state = account()
    state.mark(START, 48_400, 48_400)  # nur noch 400 $ Puffer
    manager = RiskManager()

    decision = manager.plan(state, CLEAN, Side.LONG, 1.1000, 1.0980, target_price=1.1060)

    assert decision.risk_money <= 400 * RiskSettings().dd_buffer_fraction + 1e-9


def test_falsch_gesetzter_stop_wird_abgelehnt() -> None:
    manager = RiskManager()

    assert not manager.plan(account(), CLEAN, Side.LONG, 1.1000, 1.1020).allowed
    assert not manager.plan(account(), CLEAN, Side.SHORT, 1.1000, 1.0980).allowed
    assert not manager.plan(account(), CLEAN, Side.LONG, 1.1000, 1.1000).allowed


def test_zu_kleines_crv_wird_abgelehnt() -> None:
    manager = RiskManager(RiskSettings(min_reward_ratio=1.5))

    decision = manager.plan(account(), CLEAN, Side.LONG, 1.1000, 1.0980, target_price=1.1010)

    assert not decision.allowed and "CRV" in decision.reason


def test_verluste_in_folge_verkleinern_die_position() -> None:
    manager = RiskManager()
    state = account()
    voll = manager.plan(state, CLEAN, Side.LONG, 1.1000, 1.0980, target_price=1.1060).risk_money

    manager.register_result(-1.0)
    manager.register_result(-1.0)
    manager.day_losses = 0  # Tagessperre fuer diesen Test ausklammern
    reduziert = manager.plan(state, CLEAN, Side.LONG, 1.1000, 1.0980, target_price=1.1060)

    assert reduziert.risk_money < voll
    assert manager.streak_factor < 1.0


def test_gewinne_stellen_die_groesse_wieder_her() -> None:
    manager = RiskManager()
    manager.register_result(-1.0)
    manager.register_result(-1.0)
    verkleinert = manager.streak_factor

    manager.register_result(2.0)
    manager.register_result(2.0)

    assert manager.streak_factor > verkleinert


def test_tagessperren_greifen() -> None:
    manager = RiskManager(RiskSettings(max_trades_per_day=2, max_losses_per_day=5))
    state = account()

    manager.register_result(1.0)
    manager.register_result(1.0)

    assert not manager.trading_allowed(state).allowed


def test_verlusttag_beendet_den_handel() -> None:
    manager = RiskManager(RiskSettings(max_losses_per_day=2))
    state = account()

    manager.register_result(-1.0)
    manager.register_result(-1.0)

    decision = manager.trading_allowed(state)
    assert not decision.allowed and "Verluste" in decision.reason


def test_eigener_tagesstop_greift_vor_dem_firmenlimit() -> None:
    manager = RiskManager(RiskSettings(own_daily_stop_fraction=0.5))
    state = account()
    state.mark(START, 49_500, 49_500)  # 500 $ von 1.000 $ Tagesbudget verbraucht

    decision = manager.trading_allowed(state)

    assert not decision.allowed and "Tagesstop" in decision.reason


def test_payout_schutz_reduziert_nahe_am_ziel() -> None:
    manager = RiskManager()
    fern = account()
    nah = account()
    nah.mark(START, 53_800, 53_800)  # 95 % des Ziels erreicht

    risiko_fern = manager.plan(fern, CLEAN, Side.LONG, 1.1000, 1.0980, target_price=1.1060)
    risiko_nah = manager.plan(nah, CLEAN, Side.LONG, 1.1000, 1.0980, target_price=1.1060)

    assert risiko_nah.risk_money < risiko_fern.risk_money


def test_tageswechsel_setzt_die_zaehler_zurueck() -> None:
    from datetime import timedelta

    manager = RiskManager(RiskSettings(max_trades_per_day=1))
    state = account()
    manager.register_result(1.0)
    assert not manager.trading_allowed(state).allowed

    state.mark(START + timedelta(days=1), state.balance, state.balance)

    assert manager.trading_allowed(state).allowed


def test_budgetuebersicht_nennt_die_bindende_grenze() -> None:
    state = account(daily_loss_limit=None)  # sonst reisst der Tag zuerst
    state.mark(START, 48_300, 48_300)
    manager = RiskManager()

    status = manager.status(state)

    assert status["binding"] == "dd_puffer"
    assert status["risk_budget"] == pytest.approx(60.0)


def test_mindestposition_wird_nur_mit_toleranz_gehandelt() -> None:
    """Futures gibt es nur ganz: passt der kleinste Kontrakt knapp nicht ins
    Budget, entscheidet die Toleranz zwischen 'gar nicht' und 'etwas mehr'."""
    from propbot.models import INSTRUMENTS

    mnq = INSTRUMENTS["MNQ"]
    zustand = account()  # 250 $ Budget
    # Stop von 140 Punkten -> 1 Kontrakt riskiert 280 $, also 12 % ueber Budget
    einstieg, stop, ziel = 15_000.0, 14_860.0, 15_300.0

    streng = RiskManager(RiskSettings(min_position_tolerance=1.0))
    tolerant = RiskManager(RiskSettings(min_position_tolerance=1.25))

    hart = streng.plan(zustand, mnq, Side.LONG, einstieg, stop, target_price=ziel)
    weich = tolerant.plan(zustand, mnq, Side.LONG, einstieg, stop, target_price=ziel)

    assert not hart.allowed and "zu gross" in hart.reason
    assert weich.allowed and weich.size == 1
    assert 250 < weich.risk_money <= 250 * 1.25


def test_toleranz_bricht_die_harten_grenzen_nicht() -> None:
    """Restpuffer und Tageslimit sind Firmenregeln - da hilft keine Toleranz."""
    from propbot.models import INSTRUMENTS

    zustand = account(daily_loss_limit=None)
    zustand.mark(START, 48_150, 48_150)  # nur noch 150 $ Puffer
    manager = RiskManager(RiskSettings(min_position_tolerance=3.0))

    entscheidung = manager.plan(
        zustand, INSTRUMENTS["MNQ"], Side.LONG, 15_000.0, 14_860.0, target_price=15_300.0
    )

    assert not entscheidung.allowed
