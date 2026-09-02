"""Parametersuche mit Walk-Forward - gegen die eigene Selbsttaeuschung.

Wer Parameter auf dem gesamten Datensatz optimiert, findet garantiert etwas:
irgendeine Kombination hat immer gut ausgesehen. Auf dem echten Konto ist davon
nichts uebrig. Deshalb gibt es hier nur zwei Wege:

``grid_search``
    Systematisch alle Kombinationen auf *einem* Datenausschnitt. Das Ergebnis
    ist ausdruecklich **in-sample** und damit kein Beweis.
``walk_forward``
    Der ehrliche Weg: Daten in Bloecke schneiden, auf Block *n* optimieren, auf
    Block *n+1* handeln, weiterruecken. Nur die aneinandergehaengten
    Testabschnitte zaehlen. Der Abstand zwischen In-Sample- und
    Out-of-Sample-Guete ("Degradation") sagt, wie viel der Optimierung
    Selbstbetrug war.

Bewertet wird nicht der Gewinn, sondern die *Qualitaet*: Erwartungswert je
Trade geteilt durch die Streuung, mal Wurzel der Trade-Zahl (System Quality
Number). Reiner Gewinn waehlt sonst immer die Variante mit dem groessten
Glueckstreffer.
"""

from __future__ import annotations

import itertools
import math
from collections.abc import Callable, Sequence
from dataclasses import dataclass, field

import numpy as np
import pandas as pd

from . import metrics
from .engine import BacktestResult, Backtester, ExecutionSettings
from .models import Instrument
from .risk import RiskSettings
from .rules import PropFirmRules
from .strategy.base import Strategy

__all__ = [
    "FoldResult",
    "WalkForwardResult",
    "expand_grid",
    "grid_search",
    "quality_score",
    "walk_forward",
]

StrategyFactory = Callable[[dict], Strategy]


def quality_score(result: BacktestResult, *, min_trades: int = 20) -> float:
    """Guetemass eines Laufs: SQN, hart bestraft bei Regelverstoss.

    Ein Lauf, der das Konto reisst, ist wertlos - egal wie hoch der Gewinn
    vorher war. Genau das bildet die Strafe ab.
    """
    report = result.report
    if report.trades < min_trades:
        return float("-inf")
    if report.status.is_breach:
        return -10.0 + report.expectancy_r
    if report.r_std <= 0:
        return report.expectancy_r * math.sqrt(report.trades)
    score = report.expectancy_r / report.r_std * math.sqrt(report.trades)
    if report.max_drawdown > result.account.rules.max_drawdown:
        score -= 2.0  # haette das Konto in der Realitaet gekostet
    return score


def expand_grid(
    grid: dict[str, Sequence], *, limit: int | None = None, seed: int = 0
) -> list[dict]:
    """Macht aus ``{"a": [1, 2], "b": [3]}`` eine Liste konkreter Parametersaetze."""
    if not grid:
        return [{}]
    keys = list(grid)
    combinations = [
        dict(zip(keys, values)) for values in itertools.product(*(grid[key] for key in keys))
    ]
    if limit is not None and len(combinations) > limit:
        rng = np.random.default_rng(seed)
        chosen = rng.choice(len(combinations), size=limit, replace=False)
        combinations = [combinations[int(index)] for index in sorted(chosen)]
    return combinations


@dataclass(slots=True)
class Candidate:
    """Ein Parametersatz mit seinem Ergebnis."""

    params: dict
    score: float
    result: BacktestResult

    @property
    def summary(self) -> str:
        report = self.result.report
        return (
            f"score {self.score:+.2f} | {report.trades:>3} Trades | "
            f"{report.expectancy_r:+.3f} R | {report.net_profit:+,.0f} $ | {self.params}"
        )


def grid_search(
    frame: pd.DataFrame,
    factory: StrategyFactory,
    grid: dict[str, Sequence],
    instrument: Instrument,
    *,
    rules: PropFirmRules | None = None,
    risk: RiskSettings | None = None,
    execution: ExecutionSettings | None = None,
    min_trades: int = 20,
    limit: int | None = None,
    progress: Callable[[int, int, "Candidate"], None] | None = None,
) -> list[Candidate]:
    """Testet alle (oder ``limit`` zufaellige) Kombinationen - bestes Ergebnis zuerst."""
    combinations = expand_grid(grid, limit=limit)
    candidates: list[Candidate] = []
    for position, params in enumerate(combinations, start=1):
        strategy = factory(params)
        result = Backtester(strategy, instrument, rules=rules, risk=risk, execution=execution).run(
            frame
        )
        candidate = Candidate(
            params=params, score=quality_score(result, min_trades=min_trades), result=result
        )
        candidates.append(candidate)
        if progress is not None:
            progress(position, len(combinations), candidate)
    candidates.sort(key=lambda item: item.score, reverse=True)
    return candidates


@dataclass(slots=True)
class FoldResult:
    """Ein Walk-Forward-Fenster: optimiert auf Training, gehandelt auf Test."""

    fold: int
    params: dict
    train_score: float
    test_score: float
    train_expectancy: float
    test_expectancy: float
    test_result: BacktestResult
    train_span: tuple[pd.Timestamp, pd.Timestamp]
    test_span: tuple[pd.Timestamp, pd.Timestamp]

    @property
    def line(self) -> str:
        report = self.test_result.report
        return (
            f"Fold {self.fold}: Test {self.test_span[0]:%Y-%m-%d} "
            f"bis {self.test_span[1]:%Y-%m-%d} | "
            f"IS {self.train_expectancy:+.3f} R -> OOS {self.test_expectancy:+.3f} R | "
            f"{report.trades:>3} Trades | {report.net_profit:+,.0f} $"
        )


@dataclass(slots=True)
class WalkForwardResult:
    """Gesamtergebnis der Walk-Forward-Analyse."""

    folds: list[FoldResult] = field(default_factory=list)
    combined: metrics.PerformanceReport | None = None
    rules: PropFirmRules = field(default_factory=PropFirmRules)

    @property
    def in_sample_expectancy(self) -> float:
        if not self.folds:
            return 0.0
        return sum(fold.train_expectancy for fold in self.folds) / len(self.folds)

    @property
    def out_of_sample_expectancy(self) -> float:
        if not self.folds:
            return 0.0
        return sum(fold.test_expectancy for fold in self.folds) / len(self.folds)

    @property
    def degradation(self) -> float:
        """Wie viel vom optimierten Vorteil im Test uebrig bleibt (1.0 = alles)."""
        inside = self.in_sample_expectancy
        if inside <= 0:
            return 0.0
        return self.out_of_sample_expectancy / inside

    @property
    def stable_params(self) -> dict:
        """Der Parametersatz, der ueber die Folds am haeufigsten gewaehlt wurde."""
        if not self.folds:
            return {}
        counts: dict[str, dict] = {}
        for fold in self.folds:
            key = repr(sorted(fold.params.items()))
            entry = counts.setdefault(key, {"params": fold.params, "count": 0, "score": 0.0})
            entry["count"] += 1
            entry["score"] += fold.test_score
        best = max(counts.values(), key=lambda item: (item["count"], item["score"]))
        return best["params"]

    def summary(self) -> str:
        lines = ["=== Walk-Forward ==="]
        lines.extend(fold.line for fold in self.folds)
        lines.append(
            f"Mittel: In-Sample {self.in_sample_expectancy:+.3f} R, "
            f"Out-of-Sample {self.out_of_sample_expectancy:+.3f} R "
            f"(Degradation {self.degradation:.0%})"
        )
        lines.append(_degradation_verdict(self.degradation, self.out_of_sample_expectancy))
        if self.combined is not None:
            lines.append("")
            lines.append(metrics.format_report(self.combined, self.rules, "Alle Testabschnitte"))
        return "\n".join(lines)


def _degradation_verdict(degradation: float, out_of_sample: float) -> str:
    if out_of_sample <= 0:
        return "Urteil: Out-of-Sample negativ - die Parameter waren Kurvenanpassung."
    if degradation >= 0.6:
        return "Urteil: stabil - der Vorteil ueberlebt den Fensterwechsel."
    if degradation >= 0.3:
        return "Urteil: brauchbar, aber ein grosser Teil war Anpassung. Weniger Parameter testen."
    return "Urteil: fast alles war Anpassung. Strategie vereinfachen, nicht weiter optimieren."


def walk_forward(
    frame: pd.DataFrame,
    factory: StrategyFactory,
    grid: dict[str, Sequence],
    instrument: Instrument,
    *,
    folds: int = 4,
    train_bars: int | None = None,
    rules: PropFirmRules | None = None,
    risk: RiskSettings | None = None,
    execution: ExecutionSettings | None = None,
    min_trades: int = 15,
    limit: int | None = None,
    anchored: bool = False,
    verbose: bool = False,
) -> WalkForwardResult:
    """Fuehrt die Walk-Forward-Analyse durch.

    ``anchored=True`` laesst das Trainingsfenster mitwachsen (immer ab Beginn),
    sonst rollt es mit fester Laenge - beides ist ueblich, rollend reagiert
    schneller auf Regimewechsel.
    """
    rules = rules or PropFirmRules()
    if folds < 2:
        raise ValueError("Fuer Walk-Forward braucht es mindestens 2 Folds.")
    total = len(frame)
    test_bars = total // (folds + 1)
    train_bars = train_bars or test_bars
    if test_bars < 200:
        raise ValueError("Datensatz zu kurz fuer diese Anzahl Folds.")

    result = WalkForwardResult(rules=rules)
    all_trades = []
    for fold in range(folds):
        test_start = train_bars + fold * test_bars
        test_end = min(test_start + test_bars, total)
        if test_end - test_start < 100:
            break
        train_start = 0 if anchored else max(0, test_start - train_bars)
        train = frame.iloc[train_start:test_start]
        test = frame.iloc[test_start:test_end]

        candidates = grid_search(
            train,
            factory,
            grid,
            instrument,
            rules=rules,
            risk=risk,
            execution=execution,
            min_trades=min_trades,
            limit=limit,
        )
        if not candidates or candidates[0].score == float("-inf"):
            if verbose:
                print(f"Fold {fold + 1}: kein Parametersatz mit genug Trades - uebersprungen.")
            continue
        best = candidates[0]
        strategy = factory(best.params)
        test_result = Backtester(
            strategy, instrument, rules=rules, risk=risk, execution=execution
        ).run(test)
        fold_result = FoldResult(
            fold=fold + 1,
            params=best.params,
            train_score=best.score,
            test_score=quality_score(test_result, min_trades=1),
            train_expectancy=best.result.report.expectancy_r,
            test_expectancy=test_result.report.expectancy_r,
            test_result=test_result,
            train_span=(train.index[0], train.index[-1]),
            test_span=(test.index[0], test.index[-1]),
        )
        result.folds.append(fold_result)
        all_trades.extend(test_result.trades)
        if verbose:
            print(fold_result.line)

    if all_trades:
        result.combined = metrics.compute(all_trades, None, rules)
    return result
