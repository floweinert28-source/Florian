"""Tests der Backtest-Engine - Ausfuehrung, Kosten und Regelbremse."""

from __future__ import annotations

import pytest

from propbot.engine import Backtester, ExecutionSettings, check_no_lookahead
from propbot.models import ExitReason, Side, Signal
from propbot.risk import RiskManager, RiskSettings
from propbot.rules import AccountStatus, PropFirmRules
from propbot.strategy import TrendPullback

from .conftest import CLEAN, COSTLY, ScriptedStrategy, bars

FLAT = ExecutionSettings(
    partial_at_r=None, breakeven_at_r=None, trail_after_r=None, time_stop_bars=None
)


def run(rows, signals, *, instrument=CLEAN, execution=FLAT, rules=None, risk=None):
    strategy = ScriptedStrategy(signals)
    tester = Backtester(
        strategy,
        instrument,
        rules=rules or PropFirmRules(),
        risk=risk or RiskSettings(),
        execution=execution,
    )
    return tester.run(bars(rows))


def flat_bars(count: int, price: float = 1.1000) -> list[tuple[float, float, float, float]]:
    return [(price, price + 0.0001, price - 0.0001, price)] * count


def test_einstieg_erst_zur_naechsten_kerze() -> None:
    rows = flat_bars(3) + [(1.1010, 1.1012, 1.1008, 1.1010)] + flat_bars(3)
    signal = Signal(side=Side.LONG, stop_price=1.0980, target_price=1.1040)

    result = run(rows, {1: signal})
    trade = result.trades[0]

    assert trade.entry_time == bars(rows).index[2], "Signal auf Kerze 1 -> Einstieg auf Kerze 2"
    assert trade.entry_price == pytest.approx(1.1000), (
        "gefuellt zur Eroeffnung, nicht zum Signalkurs"
    )


def test_positionsgroesse_folgt_dem_risikobudget() -> None:
    rows = flat_bars(8)
    signal = Signal(side=Side.LONG, stop_price=1.0980, target_price=1.1060)

    result = run(rows, {1: signal})
    trade = result.trades[0]

    # 250 $ Risiko / (0,0020 * 100.000 $) = 1,25 Lot
    assert trade.size == pytest.approx(1.25)
    assert trade.risk_money == pytest.approx(250.0)


def test_stop_wird_zum_stoppreis_gefuellt() -> None:
    rows = flat_bars(3) + [(1.1000, 1.1002, 1.0975, 1.0985)] + flat_bars(3)
    signal = Signal(side=Side.LONG, stop_price=1.0980, target_price=1.1060)

    result = run(rows, {1: signal})
    trade = result.trades[0]

    assert trade.exit_reason is ExitReason.STOP
    assert trade.exit_price == pytest.approx(1.0980)
    assert trade.r_multiple == pytest.approx(-1.0)


def test_ziel_wird_zum_zielpreis_gefuellt() -> None:
    rows = flat_bars(3) + [(1.1000, 1.1045, 1.0999, 1.1040)] + flat_bars(3)
    signal = Signal(side=Side.LONG, stop_price=1.0980, target_price=1.1040)

    result = run(rows, {1: signal})
    trade = result.trades[0]

    assert trade.exit_reason is ExitReason.TARGET
    assert trade.r_multiple == pytest.approx(2.0)


def test_stop_zaehlt_vor_ziel_in_derselben_kerze() -> None:
    """Wer beides in einer Kerze trifft, hat im Backtest verloren - konservativ."""
    rows = flat_bars(3) + [(1.1000, 1.1045, 1.0975, 1.1040)] + flat_bars(3)
    signal = Signal(side=Side.LONG, stop_price=1.0980, target_price=1.1040)

    result = run(rows, {1: signal})

    assert result.trades[0].exit_reason is ExitReason.STOP


def test_gap_wird_zur_eroeffnung_gefuellt_nicht_am_stop() -> None:
    rows = flat_bars(3) + [(1.0950, 1.0955, 1.0940, 1.0945)] + flat_bars(3)
    signal = Signal(side=Side.LONG, stop_price=1.0980, target_price=1.1060)

    result = run(rows, {1: signal})
    trade = result.trades[0]

    assert trade.exit_price == pytest.approx(1.0950)
    assert trade.r_multiple < -1.0, "ein Gap kostet mehr als ein R - das muss sichtbar sein"


def test_gap_ueber_den_stop_verhindert_den_einstieg() -> None:
    rows = flat_bars(2) + [(1.0970, 1.0975, 1.0965, 1.0970)] + flat_bars(4)
    signal = Signal(side=Side.LONG, stop_price=1.0980, target_price=1.1060)

    result = run(rows, {1: signal})

    assert result.trades == []
    assert "Gap" in " ".join(result.blocked)


def test_kosten_verschlechtern_das_ergebnis() -> None:
    rows = flat_bars(3) + [(1.1000, 1.1045, 1.0999, 1.1040)] + flat_bars(3)
    signal = Signal(side=Side.LONG, stop_price=1.0980, target_price=1.1040)

    sauber = run(rows, {1: signal}).trades[0]
    teuer = run(rows, {1: signal}, instrument=COSTLY).trades[0]

    assert teuer.pnl < sauber.pnl
    assert teuer.spread_cost > 0 and teuer.commission > 0
    assert teuer.total_costs == pytest.approx(teuer.commission + teuer.spread_cost)


def test_short_funktioniert_spiegelbildlich() -> None:
    rows = flat_bars(3) + [(1.1000, 1.1001, 1.0955, 1.0960)] + flat_bars(3)
    signal = Signal(side=Side.SHORT, stop_price=1.1020, target_price=1.0960)

    result = run(rows, {1: signal})
    trade = result.trades[0]

    assert trade.side is Side.SHORT
    assert trade.exit_reason is ExitReason.TARGET
    assert trade.r_multiple == pytest.approx(2.0)


def test_breakeven_stop_wird_nachgezogen() -> None:
    execution = ExecutionSettings(
        partial_at_r=None,
        breakeven_at_r=1.0,
        breakeven_offset_r=0.0,
        trail_after_r=None,
        time_stop_bars=None,
    )
    rows = (
        flat_bars(3)
        + [(1.1000, 1.1022, 1.0999, 1.1021)]  # +1 R erreicht, Stop auf Einstieg
        + [(1.1020, 1.1021, 1.0990, 1.0995)]  # zurueck zum Einstieg
        + flat_bars(3)
    )
    signal = Signal(side=Side.LONG, stop_price=1.0980, target_price=1.1100)

    result = run(rows, {1: signal}, execution=execution)
    trade = result.trades[0]

    assert trade.exit_reason is ExitReason.BREAKEVEN
    assert trade.r_multiple == pytest.approx(0.0, abs=1e-9)


def test_teilgewinn_reduziert_die_position() -> None:
    execution = ExecutionSettings(
        partial_at_r=1.0,
        partial_fraction=0.5,
        breakeven_at_r=None,
        trail_after_r=None,
        time_stop_bars=None,
    )
    rows = (
        flat_bars(3)
        + [(1.1000, 1.1025, 1.0999, 1.1020)]  # Teilgewinn bei +1 R
        + [(1.1020, 1.1021, 1.0975, 1.0980)]  # Rest wird ausgestoppt
        + flat_bars(3)
    )
    signal = Signal(side=Side.LONG, stop_price=1.0980, target_price=1.1100)

    result = run(rows, {1: signal}, execution=execution)
    trade = result.trades[0]

    assert len(trade.partial_exits) == 1
    assert trade.partial_exits[0]["size"] == pytest.approx(0.62)
    assert trade.r_multiple > -1.0, "der Teilgewinn muss den Stopverlust abfedern"


def test_zeitstop_beendet_haengende_trades() -> None:
    execution = ExecutionSettings(
        partial_at_r=None, breakeven_at_r=None, trail_after_r=None, time_stop_bars=3
    )
    rows = flat_bars(12)
    signal = Signal(side=Side.LONG, stop_price=1.0980, target_price=1.1100)

    result = run(rows, {1: signal}, execution=execution)

    assert result.trades[0].exit_reason is ExitReason.TIME
    assert result.trades[0].bars_held == 3


def test_regelverstoss_beendet_den_handel() -> None:
    """Nach dem Bruch darf keine einzige Order mehr entstehen.

    Nur ein Gap kann das Konto ueberhaupt reissen: liegt der Kurs innerhalb der
    Kerze am Stop, greift der Stop und kostet planmaessig ein R.
    """
    rows = flat_bars(3) + [(1.0500, 1.0505, 1.0450, 1.0480)] + flat_bars(10)
    signal = Signal(side=Side.LONG, stop_price=1.0980, target_price=1.1100)
    rules = PropFirmRules(daily_loss_limit=None)

    result = run(rows, {1: signal, 6: signal, 9: signal}, rules=rules)

    assert result.status is AccountStatus.BREACHED_DRAWDOWN
    assert len(result.trades) == 1, "nach dem Bruch wird nicht weitergehandelt"


def test_ziel_erreicht_stoppt_den_handel() -> None:
    rows = flat_bars(3) + [(1.1000, 1.1500, 1.0999, 1.1480)] + flat_bars(10)
    signal = Signal(side=Side.LONG, stop_price=1.0980, target_price=1.1450)

    result = run(rows, {1: signal, 7: signal})

    assert result.status is AccountStatus.TARGET_REACHED
    assert len(result.trades) == 1
    assert result.account.balance >= 54_000


def test_kein_trade_ohne_puffer() -> None:
    """Ist der Drawdown-Puffer fast leer, wird gar nicht mehr gehandelt."""
    rows = flat_bars(8)
    signal = Signal(side=Side.LONG, stop_price=1.0980, target_price=1.1060)
    rules = PropFirmRules(max_drawdown=90, profit_target=4_000)

    result = run(rows, {1: signal}, rules=rules)

    assert result.trades == [], "20 % von 90 $ Restpuffer sind unter dem Mindestrisiko"
    assert any("Risikobudget" in reason for reason in result.blocked)


def test_equity_kurve_und_boden_werden_mitgeschrieben() -> None:
    rows = flat_bars(8)
    result = run(rows, {})

    assert list(result.equity.columns) == ["equity", "balance", "floor"]
    assert (result.equity["floor"] == 48_000).all()


def test_strategie_bekommt_jeden_abschluss_gemeldet() -> None:
    rows = flat_bars(3) + [(1.1000, 1.1045, 1.0999, 1.1040)] + flat_bars(3)
    signal = Signal(side=Side.LONG, stop_price=1.0980, target_price=1.1040)
    strategy = ScriptedStrategy({1: signal})

    Backtester(strategy, CLEAN, execution=FLAT).run(bars(rows))

    assert len(strategy.closed_trades) == 1, "Rueckmeldung ist die Basis der Lernschicht"


def test_lookahead_pruefung_auf_echter_strategie(market) -> None:
    assert check_no_lookahead(TrendPullback(), market.iloc[:3000], samples=12) == []


def test_kleines_ziel_wird_vom_risikomanager_gesperrt() -> None:
    """Ein Ziel bei 1:0.5 faellt am Standard-Mindest-CRV von 1.3 durch."""
    from propbot.rules import AccountState

    konto = AccountState(PropFirmRules())
    argumente = dict(side=Side.LONG, entry_price=100.0, stop_price=90.0, target_price=105.0)

    gesperrt = RiskManager(RiskSettings()).plan(konto, CLEAN, **argumente)
    assert not gesperrt.allowed
    assert gesperrt.reason == "CRV unter Mindestwert"

    # Mit gesenktem Mindestwert faellt genau dieser Grund weg (an der
    # Positionsgroesse kann derselbe Aufruf trotzdem noch scheitern).
    erlaubt = RiskManager(RiskSettings(min_reward_ratio=0.4)).plan(konto, CLEAN, **argumente)
    assert erlaubt.reason != "CRV unter Mindestwert"


def test_hinweis_wenn_crv_filter_alles_blockiert() -> None:
    """Ein zu kleines Ziel darf nicht still zu null Trades fuehren.

    Wer reward_ratio auf 0.5 stellt, bekommt mit dem Standard-Mindest-CRV von
    1.3 gar keine Trades. Ohne Hinweis sieht das aus, als faende die Strategie
    nichts - dabei ist es eine Einstellung des Risikomanagers.
    """
    ergebnis = run(flat_bars(5), {})
    ergebnis.signals = 10
    ergebnis.blocked["CRV unter Mindestwert"] = 8

    text = ergebnis.summary("Test")
    assert "min_reward_ratio" in text
    assert "1:0.5" in text


def test_kein_crv_hinweis_bei_wenigen_ablehnungen() -> None:
    ergebnis = run(flat_bars(5), {})
    ergebnis.signals = 10
    ergebnis.blocked["CRV unter Mindestwert"] = 2

    assert "min_reward_ratio" not in ergebnis.summary("Test")
