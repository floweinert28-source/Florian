"""Kommandozeile des Bots: ``python -m propbot <befehl>``.

Befehle:

``math``         Rechenbericht zum Konto (Risiko, Serien, Kosten, Tageslimit)
``backtest``     Strategie durch historische oder synthetische Daten laufen lassen
``montecarlo``   Payout-/Bust-Wahrscheinlichkeit aus den Backtest-Trades
``walkforward``  Parameter suchen und ehrlich out-of-sample pruefen
``lessons``      Fehleranalyse und konkrete Verbesserungsvorschlaege
``paper``        Live-Logik gegen den Papier-Broker abspielen
``live``         Echter Handel ueber MetaTrader 5 (Dry-Run, bis man es abschaltet)
``journal``      Was im Tagebuch steht
"""

from __future__ import annotations

import argparse
import dataclasses
import logging
import sys
from pathlib import Path

import pandas as pd

from . import reporting
from .config import BotConfig, ConfigError, load_config
from .data import load_csv, synthetic_market
from .engine import Backtester, check_no_lookahead
from .journal import TradeJournal
from .learning import AdaptiveStrategy, lessons, tag_trades
from .models import INSTRUMENTS
from .montecarlo import format_sweep, simulate, sweep_risk
from .optimize import walk_forward
from .rules import DrawdownMode
from .strategy import (
    IntradayMomentum,
    IntradayMomentumParams,
    OpeningRange,
    OpeningRangeParams,
    RangeFade,
    RangeFadeParams,
    RegimeRouter,
    SqueezeBreakout,
    SqueezeBreakoutParams,
    TrendPullback,
    TrendPullbackParams,
    VwapPullback,
    VwapPullbackParams,
)

log = logging.getLogger("propbot")


# --------------------------------------------------------------------- Aufbau
def build_strategy(config: BotConfig, params: dict | None = None):
    """Erzeugt die Strategie aus der Konfiguration (inkl. Lernschicht)."""
    session = config.session
    name = config.strategy
    werte = {**config.strategy_params, **(params or {})}
    try:
        if name == "trend_pullback":
            base = TrendPullback(TrendPullbackParams(**werte), session=session)
        elif name == "range_fade":
            base = RangeFade(RangeFadeParams(**werte), session=session)
        elif name == "opening_range":
            base = OpeningRange(OpeningRangeParams(**werte), session=session)
        elif name == "squeeze":
            base = SqueezeBreakout(SqueezeBreakoutParams(**werte), session=session)
        elif name == "intraday_momentum":
            base = IntradayMomentum(IntradayMomentumParams(**werte), session=session)
        elif name == "vwap_pullback":
            base = VwapPullback(VwapPullbackParams(**werte), session=session)
        elif name == "regime_router":
            base = RegimeRouter(session=session)
        else:
            raise ConfigError(
                f"Unbekannte Strategie {name!r}. Erlaubt: trend_pullback, range_fade, "
                f"opening_range, squeeze, intraday_momentum, vwap_pullback, regime_router"
            )
    except TypeError as fehler:
        raise ConfigError(f"Parameter passen nicht zu {name!r}: {fehler}") from None
    return AdaptiveStrategy(base) if config.adaptive else base


def load_data(args, config: BotConfig) -> pd.DataFrame:
    """Laedt echte Daten oder erzeugt synthetische."""
    path = args.data or config.data_path
    if path:
        frame = load_csv(path)
        print(
            f"Daten: {len(frame):,} Kerzen aus {path} "
            f"({frame.index[0]:%Y-%m-%d} bis {frame.index[-1]:%Y-%m-%d})"
        )
        return frame
    frame = synthetic_market(bars=args.bars, seed=args.seed)
    print(
        f"Daten: {len(frame):,} synthetische Kerzen (seed {args.seed}). "
        f"ACHTUNG: synthetische Daten beweisen keinen Edge - sie testen die Mechanik."
    )
    return frame


# ------------------------------------------------------------------- Befehle
def cmd_math(args, config: BotConfig) -> int:
    instrument = INSTRUMENTS.get(config.symbol)
    text = reporting.full_math_report(
        config.rules,
        instrument,
        win_rate=args.win_rate,
        reward_ratio=args.reward_ratio,
        risk_money=args.risk or config.rules.start_balance * config.risk.base_risk_pct,
        stop_distance=args.stop_distance,
    )
    _emit(text, args.out)
    return 0


def cmd_backtest(args, config: BotConfig) -> int:
    frame = load_data(args, config)
    strategy = build_strategy(config)
    if args.check_lookahead:
        suspicious = check_no_lookahead(strategy, frame.iloc[: min(len(frame), 6000)], samples=15)
        print(
            f"Lookahead-Pruefung: {'sauber' if not suspicious else f'AUFFAELLIG bei {suspicious}'}"
        )

    result = Backtester(
        strategy,
        config.instrument,
        rules=config.rules,
        risk=config.risk,
        execution=config.execution,
    ).run(frame)

    tag_trades(result.trades, session=config.session, rules=config.rules)
    text = result.summary(f"Backtest {config.symbol} {config.strategy}")
    if isinstance(strategy, AdaptiveStrategy):
        text += "\n\n" + strategy.report()
    _emit(text, args.out)

    if args.journal:
        with TradeJournal(config.journal_path) as journal:
            run_id = journal.start_run(
                mode="backtest",
                strategy=strategy.name,
                symbol=config.symbol,
                params=result.params,
                note=args.note,
            )
            count = journal.record_many(run_id, result.trades)
            journal.record_equity(run_id, result.equity)
            print(f"\n{count} Trades als Lauf #{run_id} in {config.journal_path} gespeichert.")
    return 0 if not result.report.breached else 1


def cmd_montecarlo(args, config: BotConfig) -> int:
    frame = load_data(args, config)
    strategy = build_strategy(config)
    # Die Stichprobe muss aus dem *ganzen* Datensatz kommen, nicht aus einem
    # Lauf unter den echten Regeln. Ein solcher Lauf endet beim Payout - die
    # Trades danach fehlen, und die Frage "wie wahrscheinlich ist ein Payout?"
    # waere mit Daten beantwortet, die per Konstruktion einen enthalten.
    # Deshalb: Ziel und Drawdown zum Sammeln aushebeln, simuliert wird dann
    # wieder mit den echten Regeln.
    offen = dataclasses.replace(config.rules, profit_target=1e12, max_drawdown=1e12)
    result = Backtester(
        strategy,
        config.instrument,
        rules=offen,
        risk=config.risk,
        execution=config.execution,
    ).run(frame)
    r_values = result.r_multiples()
    if len(r_values) < 20:
        print(f"Nur {len(r_values)} Trades - fuer eine Simulation zu wenig.")
        return 1

    print(
        f"Grundlage: {len(r_values)} Trades ueber den ganzen Datensatz, "
        f"Erwartungswert {result.report.expectancy_r:+.3f} R\n"
    )
    lines = ["=== Monte-Carlo (Regeln des Kontos aktiv) ==="]
    for block in (1, 5):
        outcome = simulate(
            r_values,
            rules=config.rules,
            risk_settings=config.risk,
            runs=args.runs,
            block_size=block,
            trades_per_day=args.trades_per_day,
            seed=args.seed,
        )
        label = (
            "unabhaengig gezogen"
            if block == 1
            else f"in Bloecken von {block} (Serien bleiben erhalten)"
        )
        lines.append(f"\n{label}:")
        lines.append("  " + outcome.describe())
        lines.append("  " + outcome.verdict())
    lines.append("")
    lines.append("=== Fixes Risiko im Vergleich (ohne adaptive Groesse) ===")
    risks = [
        round(config.rules.start_balance * pct, 0)
        for pct in (0.002, 0.004, 0.005, 0.006, 0.008, 0.01, 0.015)
    ]
    lines.append(
        format_sweep(
            sweep_risk(r_values, risks, rules=config.rules, runs=max(400, args.runs // 3)),
            config.rules,
        )
    )
    _emit("\n".join(lines), args.out)
    return 0


def cmd_walkforward(args, config: BotConfig) -> int:
    frame = load_data(args, config)
    if config.strategy != "trend_pullback":
        print("Walk-Forward ist derzeit fuer 'trend_pullback' vorbereitet.")
        return 2
    grid = {
        "adx_min": [18.0, 22.0, 26.0],
        "reward_ratio": [1.5, 2.0, 2.5],
        "pullback_bars": [4, 6, 8],
        "stop_buffer_atr": [0.15, 0.30],
    }
    if args.quick:
        grid = {"adx_min": [18.0, 24.0], "reward_ratio": [1.5, 2.0, 2.5]}

    def factory(params: dict):
        return TrendPullback(TrendPullbackParams(**params), session=config.session)

    print(
        f"Gitter: {sum(1 for _ in _combinations(grid))} Kombinationen "
        f"x {args.folds} Folds - das dauert."
    )
    result = walk_forward(
        frame,
        factory,
        grid,
        config.instrument,
        folds=args.folds,
        rules=config.rules,
        risk=config.risk,
        execution=config.execution,
        verbose=True,
    )
    _emit(result.summary(), args.out)
    print(f"\nStabilster Parametersatz: {result.stable_params}")
    return 0


def cmd_lessons(args, config: BotConfig) -> int:
    frame = load_data(args, config)
    strategy = build_strategy(config)
    result = Backtester(
        strategy,
        config.instrument,
        rules=config.rules,
        risk=config.risk,
        execution=config.execution,
    ).run(frame)
    # Die Schwelle fuer "gekappter Stop" kommt aus der Strategie selbst, damit
    # das Label bei geaenderten Parametern weiter stimmt.
    grenze = float(result.params.get("max_stop_atr", 3.5)) * 0.95
    tagged = tag_trades(
        result.trades,
        session=config.session,
        max_trades_per_day=config.risk.max_trades_per_day,
        wide_stop_atr=grenze,
        rules=config.rules,
    )
    counts: dict[str, int] = {}
    for trade in tagged:
        for tag in trade.tags:
            counts[tag] = counts.get(tag, 0) + 1

    lines = [f"=== Fehleranalyse ueber {len(tagged)} Trades ==="]
    if counts:
        lines.append("Haeufigkeit der Muster:")
        for tag, count in sorted(counts.items(), key=lambda item: -item[1]):
            share = count / len(tagged)
            lines.append(f"  {count:>4}x ({share:>5.1%})  {tag}")
    else:
        lines.append("Keine Fehlermuster erkannt.")
    lines.append("")
    lines.append("=== Empfehlungen (nach Wirkung sortiert) ===")
    for lesson in lessons(tagged, wide_stop_atr=grenze):
        lines.append(str(lesson))
    if isinstance(strategy, AdaptiveStrategy):
        lines.append("")
        lines.append(strategy.report())
        table = strategy.memory.table(minimum=8)
        if table:
            lines.append("\nGedaechtnis der Lernschicht (schlechteste zuerst):")
            for bucket in table[:10]:
                lines.append(
                    f"  {bucket.key:<45} {bucket.count:>4} Trades  {bucket.mean:+.3f} R  "
                    f"Trefferquote {bucket.win_rate:.0%}"
                )
    _emit("\n".join(lines), args.out)
    return 0


def cmd_paper(args, config: BotConfig) -> int:
    from .broker import PaperBroker
    from .live import LiveSettings, LiveTrader

    frame = load_data(args, config)
    strategy = build_strategy(config)
    broker = PaperBroker(
        frame,
        config.instrument,
        balance=config.rules.start_balance,
        start_index=strategy.warmup + 5,
    )
    settings = LiveSettings(
        symbol=config.symbol,
        timeframe=config.timeframe,
        dry_run=False,  # Papier-Broker: "echte" Orders, aber kein Geld
        poll_seconds=0,
        state_path=Path(args.state or "data/paper_state.json"),
        journal_path=Path(config.journal_path),
    )
    if settings.state_path.exists():
        settings.state_path.unlink()  # Replay startet immer frisch

    with TradeJournal(config.journal_path) as journal:
        trader = LiveTrader(
            broker,
            strategy,
            config.instrument,
            rules=config.rules,
            risk=config.risk,
            execution=config.execution,
            settings=settings,
            journal=journal,
        )
        trader.run_id = journal.start_run(
            mode="paper", strategy=strategy.name, symbol=config.symbol, params=strategy.params()
        )
        actions: dict[str, int] = {}
        while broker.advance():
            step = trader.step()
            actions[step.action] = actions.get(step.action, 0) + 1
            laut = getattr(args, "verbose", False)  # Sammeloption, kann fehlen
            if laut and step.action not in ("KEIN SIGNAL", "HALTEN", "WARTEN"):
                print(step)
            if step.finished:
                print(f"\nEnde: {step.status.label}")
                break
        trader.save_state()

    print("\n=== Papierhandel ===")
    print(trader.describe())
    for action, count in sorted(actions.items(), key=lambda item: -item[1]):
        print(f"  {count:>5}x {action}")
    print(f"  {len(broker.closed):>5} geschlossene Positionen beim Broker")
    return 0


def cmd_live(args, config: BotConfig) -> int:
    from .broker.mt5 import MT5Broker
    from .live import LiveSettings, LiveTrader

    dry_run = not args.real
    if not dry_run and not args.i_know_what_i_do:
        print(
            "Echter Handel braucht zusaetzlich --i-know-what-i-do.\n"
            "Vorher bitte: (1) Demokonto mit --real testen, (2) Regeln der Firma "
            "in der Konfiguration pruefen, (3) montecarlo laufen lassen."
        )
        return 2

    broker = MT5Broker(login=args.login, password=args.password, server=args.server).connect()
    strategy = build_strategy(config)
    with TradeJournal(config.journal_path) as journal:
        trader = LiveTrader(
            broker,
            strategy,
            config.instrument,
            rules=config.rules,
            risk=config.risk,
            execution=config.execution,
            settings=LiveSettings(
                symbol=config.symbol,
                timeframe=config.timeframe,
                dry_run=dry_run,
                poll_seconds=args.poll,
                state_path=Path(config.state_path),
                journal_path=Path(config.journal_path),
            ),
            journal=journal,
        )
        trader.run_id = journal.start_run(
            mode="live" if not dry_run else "live-dry",
            strategy=strategy.name,
            symbol=config.symbol,
            params=strategy.params(),
        )
        print(trader.describe())
        trader.run(max_steps=args.steps)
    broker.disconnect()
    return 0


def cmd_fetch(args, config: BotConfig) -> int:
    """Laedt echte Kursdaten von Dukascopy und legt sie als CSV ab."""
    from datetime import date, timedelta

    from .data import resample
    from .dukascopy import SYMBOLE, lade_kerzen

    symbol = args.quelle or config.symbol
    if symbol not in SYMBOLE:
        print(
            f"Fuer {symbol!r} gibt es keine Dukascopy-Zuordnung. "
            f"Bekannt: {', '.join(sorted(SYMBOLE))}"
        )
        return 2

    ende = date.today() if args.bis is None else date.fromisoformat(args.bis)
    start = ende - timedelta(days=int(args.jahre * 365.25))
    print(f"Lade {symbol} ({SYMBOLE[symbol][0]}) von {start} bis {ende} ...")
    minuten = lade_kerzen(symbol, start, ende, cache=args.cache)

    regel = _timeframe_regel(args.timeframe)
    kerzen = resample(minuten, regel) if regel != "1min" else minuten
    ziel = Path(args.out or f"data/{symbol.lower()}_{args.timeframe.lower()}.csv")
    ziel.parent.mkdir(parents=True, exist_ok=True)
    kerzen.to_csv(ziel)
    print(
        f"{len(kerzen):,} {args.timeframe}-Kerzen gespeichert: {ziel}\n"
        f"Zeitraum {kerzen.index[0]:%Y-%m-%d} bis {kerzen.index[-1]:%Y-%m-%d}"
    )
    print(f"\nNaechster Schritt: python -m propbot backtest --data {ziel} --symbol {config.symbol}")
    return 0


def _timeframe_regel(name: str) -> str:
    """Uebersetzt 'M15' in die pandas-Regel '15min'."""
    text = name.strip().upper()
    einheiten = {"M": "min", "H": "h", "D": "D"}
    if text[0] not in einheiten or not text[1:].isdigit():
        raise ConfigError(f"Zeitrahmen {name!r} nicht verstanden. Beispiele: M1, M15, H1, D1")
    return f"{int(text[1:])}{einheiten[text[0]]}"


def cmd_validate(args, config: BotConfig) -> int:
    """Vergleicht die Backtest-Daten mit echten Futuresdaten von Yahoo."""
    from .validate import lade_yahoo, vergleiche_quellen

    pfad = args.data or config.data_path
    if not pfad:
        print("Bitte --data angeben: die zu pruefende Kursdatei.")
        return 2
    eigene = load_csv(pfad)
    print(
        f"Eigene Daten:  {len(eigene):,} Kerzen, {eigene.index[0]:%Y-%m-%d} bis {eigene.index[-1]:%Y-%m-%d}"
    )
    referenz = lade_yahoo(args.referenz, "1h", args.tage)
    print(
        f"Referenz {args.referenz}: {len(referenz):,} Stundenkerzen, "
        f"{referenz.index[0]:%Y-%m-%d} bis {referenz.index[-1]:%Y-%m-%d}\n"
    )
    ergebnis = vergleiche_quellen(eigene, referenz)
    _emit(ergebnis.describe(), args.out)
    return 0 if ergebnis.brauchbar else 1


def cmd_journal(args, config: BotConfig) -> int:
    with TradeJournal(config.journal_path) as journal:
        runs = journal.runs(limit=args.limit)
        if not runs:
            print(f"Noch nichts in {config.journal_path}.")
            return 0
        print(f"=== Laeufe in {config.journal_path} ===")
        for run in runs:
            trades = len(journal.trades(run["id"]))
            print(
                f"  #{run['id']:<4} {run['created_at'][:19]}  {run['mode']:<10} "
                f"{run['strategy']:<24} {run['symbol']:<8} {trades:>4} Trades"
            )
        run_id = args.run or runs[0]["id"]
        print(f"\n=== Auswertung Lauf #{run_id} ===")
        for field in ("setup", "session", "adx_bucket"):
            stats = journal.expectancy_by(field, run_id)
            if not stats:
                continue
            print(f"\nNach {field}:")
            for key, values in sorted(stats.items(), key=lambda item: item[1]["expectancy_r"]):
                print(
                    f"  {key:<24} {int(values['trades']):>4} Trades  "
                    f"{values['expectancy_r']:+.3f} R  Trefferquote {values['win_rate']:.0%}"
                )
        tags = journal.tag_counts(run_id)
        if tags:
            print("\nFehler-Label:")
            for tag, count in tags.items():
                print(f"  {count:>4}x {tag}")
    return 0


# ---------------------------------------------------------------------- Parser
def _common_options() -> argparse.ArgumentParser:
    """Optionen, die vor *und* nach dem Befehl stehen duerfen.

    ``SUPPRESS`` als Standard ist wichtig: sonst wuerde der Unterbefehl einen
    Wert, der vor dem Befehl gesetzt wurde, mit seinem eigenen Standard wieder
    ueberschreiben - ein bekannter Stolperstein von argparse.
    """
    common = argparse.ArgumentParser(add_help=False)
    common.add_argument("--config", default=argparse.SUPPRESS, help="JSON-Konfigurationsdatei")
    common.add_argument("--symbol", default=argparse.SUPPRESS, help="Instrument (Standard EURUSD)")
    common.add_argument(
        "--strategy",
        choices=[
            "trend_pullback",
            "range_fade",
            "opening_range",
            "squeeze",
            "intraday_momentum",
            "vwap_pullback",
            "regime_router",
        ],
        default=argparse.SUPPRESS,
    )
    common.add_argument(
        "--no-adaptive",
        dest="adaptive",
        action="store_false",
        default=argparse.SUPPRESS,
        help="Lernschicht abschalten",
    )
    common.add_argument(
        "--balance", type=float, default=argparse.SUPPRESS, help="Startkapital (Standard 50000)"
    )
    common.add_argument(
        "--target", type=float, default=argparse.SUPPRESS, help="Gewinnziel (Standard 4000)"
    )
    common.add_argument(
        "--drawdown", type=float, default=argparse.SUPPRESS, help="Max. Drawdown (Standard 2000)"
    )
    common.add_argument(
        "--daily-limit",
        type=float,
        default=argparse.SUPPRESS,
        help="Tagesverlustlimit (Standard 1000, 0 = keins)",
    )
    common.add_argument(
        "--dd-mode", choices=[mode.value for mode in DrawdownMode], default=argparse.SUPPRESS
    )
    common.add_argument(
        "--risk-pct",
        type=float,
        default=argparse.SUPPRESS,
        help="Basisrisiko je Trade, z. B. 0.005",
    )
    common.add_argument(
        "--journal-path", default=argparse.SUPPRESS, help="Pfad zur Tagebuch-Datenbank"
    )
    common.add_argument(
        "--session",
        dest="session_profile",
        choices=["auto", "fx", "us_rth"],
        default=argparse.SUPPRESS,
        help="Handelszeitfenster (Standard: auto nach Instrument)",
    )
    common.add_argument(
        "-v", "--verbose", action="store_true", default=argparse.SUPPRESS, help="Mehr Ausgabe"
    )
    return common


def build_parser() -> argparse.ArgumentParser:
    common = _common_options()
    parser = argparse.ArgumentParser(
        prog="propbot",
        parents=[common],
        description="Prop-Firm-Trading-Bot fuer ein 50.000-$-Konto "
        "(+4.000 $ Ziel, 2.000 $ Drawdown).",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="Beispiel: python -m propbot backtest --bars 30000 --journal",
    )

    subparsers = parser.add_subparsers(dest="command", required=True)

    def add(name: str, help_text: str):
        return subparsers.add_parser(name, parents=[common], help=help_text)

    def add_data_options(sub):
        sub.add_argument("--data", help="CSV mit OHLC-Daten")
        sub.add_argument("--bars", type=int, default=30_000, help="Kerzen, falls synthetisch")
        sub.add_argument("--seed", type=int, default=42, help="Zufallsstartwert")
        sub.add_argument("--out", help="Bericht zusaetzlich in diese Datei schreiben")

    math_parser = add("math", "Rechenbericht zum Konto")
    math_parser.add_argument("--win-rate", type=float, default=0.45)
    math_parser.add_argument("--reward-ratio", type=float, default=2.0)
    math_parser.add_argument("--risk", type=float, help="Risiko je Trade in Geld")
    math_parser.add_argument("--stop-distance", type=float, default=0.0015)
    math_parser.add_argument("--out")
    math_parser.set_defaults(func=cmd_math)

    backtest_parser = add("backtest", "Strategie testen")
    add_data_options(backtest_parser)
    backtest_parser.add_argument(
        "--journal", action="store_true", help="Trades ins Tagebuch schreiben"
    )
    backtest_parser.add_argument("--note", help="Notiz zum Lauf")
    backtest_parser.add_argument(
        "--check-lookahead", action="store_true", help="Kausalitaet pruefen"
    )
    backtest_parser.set_defaults(func=cmd_backtest)

    mc_parser = add("montecarlo", "Payout-Wahrscheinlichkeit simulieren")
    add_data_options(mc_parser)
    mc_parser.add_argument("--runs", type=int, default=2000)
    mc_parser.add_argument("--trades-per-day", type=int, default=2)
    mc_parser.set_defaults(func=cmd_montecarlo)

    wf_parser = add("walkforward", "Parameter out-of-sample pruefen")
    add_data_options(wf_parser)
    wf_parser.add_argument("--folds", type=int, default=4)
    wf_parser.add_argument("--quick", action="store_true", help="Kleineres Gitter")
    wf_parser.set_defaults(func=cmd_walkforward)

    lessons_parser = add("lessons", "Fehler analysieren")
    add_data_options(lessons_parser)
    lessons_parser.set_defaults(func=cmd_lessons)

    paper_parser = add("paper", "Live-Logik auf Papier abspielen")
    add_data_options(paper_parser)
    paper_parser.add_argument("--state", help="Pfad der Zustandsdatei")
    paper_parser.set_defaults(func=cmd_paper)

    live_parser = add("live", "Handel ueber MetaTrader 5")
    live_parser.add_argument("--real", action="store_true", help="Orders wirklich senden")
    live_parser.add_argument("--i-know-what-i-do", action="store_true")
    live_parser.add_argument("--login", type=int)
    live_parser.add_argument("--password")
    live_parser.add_argument("--server")
    live_parser.add_argument("--poll", type=int, default=30, help="Sekunden zwischen Durchlaeufen")
    live_parser.add_argument("--steps", type=int, help="Nach so vielen Durchlaeufen aufhoeren")
    live_parser.add_argument("--out")
    live_parser.set_defaults(func=cmd_live)

    fetch_parser = add("fetch", "Echte Kursdaten von Dukascopy laden")
    fetch_parser.add_argument("--quelle", help="Dukascopy-Symbol (Standard: wie --symbol)")
    fetch_parser.add_argument("--jahre", type=float, default=5.0, help="Wie viele Jahre zurueck")
    fetch_parser.add_argument("--bis", help="Enddatum JJJJ-MM-TT (Standard: heute)")
    fetch_parser.add_argument("--timeframe", default="M15", help="Zielzeitrahmen, z. B. M15")
    fetch_parser.add_argument("--cache", default="data/dukascopy", help="Ablage der Rohdateien")
    fetch_parser.add_argument("--out", help="Zieldatei (CSV)")
    fetch_parser.set_defaults(func=cmd_fetch)

    validate_parser = add("validate", "Kursdaten gegen echte Futuresdaten pruefen")
    validate_parser.add_argument("--data", help="Zu pruefende CSV")
    validate_parser.add_argument("--referenz", default="NQ=F", help="Yahoo-Symbol der Referenz")
    validate_parser.add_argument("--tage", type=int, default=720)
    validate_parser.add_argument("--out")
    validate_parser.set_defaults(func=cmd_validate)

    journal_parser = add("journal", "Tagebuch auswerten")
    journal_parser.add_argument("--run", type=int, help="Lauf-ID")
    journal_parser.add_argument("--limit", type=int, default=15)
    journal_parser.add_argument("--out")
    journal_parser.set_defaults(func=cmd_journal)
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    logging.basicConfig(
        level=logging.DEBUG if getattr(args, "verbose", False) else logging.INFO,
        format="%(asctime)s %(levelname)-7s %(message)s",
        datefmt="%H:%M:%S",
    )

    try:
        config = load_config(
            getattr(args, "config", None),
            symbol=getattr(args, "symbol", None),
            strategy=getattr(args, "strategy", None),
            adaptive=getattr(args, "adaptive", None),
            session_profile=getattr(args, "session_profile", None),
            journal_path=getattr(args, "journal_path", None),
        )
        config = _apply_rule_overrides(config, args)
        return args.func(args, config)
    except ConfigError as error:
        print(f"Konfigurationsfehler: {error}", file=sys.stderr)
        return 2
    except FileNotFoundError as error:
        print(f"Datei nicht gefunden: {error}", file=sys.stderr)
        return 2
    except KeyboardInterrupt:
        print("\nAbgebrochen.")
        return 130


def _apply_rule_overrides(config: BotConfig, args) -> BotConfig:
    from dataclasses import replace

    rule_updates = {}
    for argument, field_name in (
        ("balance", "start_balance"),
        ("target", "profit_target"),
        ("drawdown", "max_drawdown"),
    ):
        value = getattr(args, argument, None)
        if value is not None:
            rule_updates[field_name] = value
    daily = getattr(args, "daily_limit", None)
    if daily is not None:
        rule_updates["daily_loss_limit"] = daily or None
    mode = getattr(args, "dd_mode", None)
    if mode is not None:
        rule_updates["drawdown_mode"] = DrawdownMode(mode)
    if rule_updates:
        config.rules = replace(config.rules, **rule_updates)
    risk_pct = getattr(args, "risk_pct", None)
    if risk_pct is not None:
        config.risk = replace(config.risk, base_risk_pct=risk_pct)
    return config


def _combinations(grid: dict):
    from itertools import product

    return product(*grid.values())


def _emit(text: str, out: str | None = None) -> None:
    print(text)
    if out:
        path = Path(out)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text + "\n", encoding="utf-8")
        print(f"\n(Bericht gespeichert: {path})")
