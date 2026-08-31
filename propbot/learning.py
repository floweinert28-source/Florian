"""Aus Fehlern lernen - automatisch, nicht per Bauchgefuehl.

Drei Ebenen, von langsam nach schnell:

1. :func:`tag_trades` haengt jedem abgeschlossenen Trade Fehler-Label an
   ("Gewinn verschenkt", "Rachetrade", "Overtrading", ...). Das ist die
   Nachbesprechung, die sonst niemand macht.
2. :func:`lessons` verdichtet diese Label und die Statistik zu konkreten,
   nachpruefbaren Empfehlungen ("Shorts kosten 1,8 R ueber 40 Trades -
   abschalten und neu bewerten").
3. :class:`AdaptiveStrategy` zieht die Konsequenz **waehrend** des Laufens: sie
   fuehrt fuer jede Kombination aus Setup, Session und Regime eine laufende
   Statistik und blockiert Kombinationen, deren untere Vertrauensgrenze unter
   null liegt. Nach einer Sperre bleibt eine Restwahrscheinlichkeit fuer
   Stichproben, damit sich eine Sperre auch wieder aufheben kann.

Wichtig ist Punkt 3s Detail: bewertet wird mit einer **unteren
Vertrauensgrenze**, nicht mit dem blossen Mittelwert. Sonst sperrt der Bot nach
drei Pechtrades ein gutes Setup - der klassische Anfaengerfehler beim
"Optimieren".
"""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from datetime import timedelta
from math import sqrt

import pandas as pd

from .models import ExitReason, Side, Trade
from .rules import PropFirmRules
from .strategy.base import SessionWindow, Strategy

__all__ = [
    "MISTAKES",
    "AdaptiveSettings",
    "AdaptiveStrategy",
    "BucketStats",
    "Lesson",
    "PerformanceMemory",
    "lessons",
    "tag_trades",
]

#: Fehlerkatalog: Label -> (Beschreibung, Gegenmassnahme)
MISTAKES: dict[str, tuple[str, str]] = {
    "gewinn_verschenkt": (
        "Trade lag klar im Plus und ging trotzdem bei null oder minus raus.",
        "Teilgewinn frueher mitnehmen (partial_at_r senken) oder enger trailen.",
    ),
    "knapper_stop": (
        "Der Stop wurde fast beruehrt, der Trade lief danach ins Ziel.",
        "Stopabstand leicht erhoehen (stop_buffer_atr) - der Stop lag im Rauschen.",
    ),
    "stop_gekappt": (
        "Der Stop wurde von der ATR-Obergrenze gestutzt und liegt damit naeher "
        "am Einstieg als die eigentliche Marktstruktur.",
        "max_stop_atr erhoehen oder das Signal ueberspringen - ein gekappter "
        "Stop sitzt im Rauschen.",
    ),
    "rachetrade": (
        "Einstieg kurz nach einem Verlust - typisches Zurueckholen-Wollen.",
        "Wartezeit nach Verlusten erzwingen (cooldown_minutes).",
    ),
    "overtrading": (
        "Mehr Trades an einem Tag als geplant.",
        "max_trades_per_day senken - auf 2.000 $ Puffer zaehlt Qualitaet.",
    ),
    "news_fenster": (
        "Einstieg in einem gesperrten Nachrichtenfenster.",
        "Blackout-Fenster im SessionWindow pruefen und einhalten.",
    ),
    "duenne_session": (
        "Einstieg ausserhalb der liquiden Handelszeit.",
        "Handelszeit auf London/New York begrenzen.",
    ),
    "zeitstop": (
        "Position lief in den Zeitstop - das Setup hat nicht funktioniert.",
        "Zeitstop verkuerzen, das Kapital arbeitet woanders besser.",
    ),
    "grosser_verlust": (
        "Verlust deutlich groesser als ein geplantes R (Gap oder Slippage).",
        "Positionsgroesse und Haltezeit ueber Nacht/News pruefen.",
    ),
    "gegen_den_trend": (
        "Einstieg gegen die uebergeordnete Richtung.",
        "Trendfilter strenger setzen.",
    ),
}


def tag_trades(
    trades: list[Trade],
    *,
    session: SessionWindow | None = None,
    max_trades_per_day: int = 3,
    cooldown_minutes: int = 45,
    wide_stop_atr: float = 3.3,
    rules: PropFirmRules | None = None,
) -> list[Trade]:
    """Vergibt Fehler-Label an eine Liste geschlossener Trades.

    Arbeitet direkt auf den Objekten (und gibt sie zurueck), damit Backtest und
    Journal dieselben Label sehen.
    """
    rules = rules or PropFirmRules()
    closed = sorted(
        (trade for trade in trades if not trade.is_open), key=lambda item: item.entry_time
    )
    per_day: dict[object, int] = defaultdict(int)
    last_loss_exit = None

    for trade in closed:
        day = rules.day_key(trade.entry_time)
        per_day[day] += 1

        if trade.exit_reason in (ExitReason.STOP, ExitReason.BREAKEVEN, ExitReason.TRAIL):
            if trade.mfe_r >= 1.0 and trade.r_multiple <= 0.2:
                trade.add_tag("gewinn_verschenkt")
        if trade.r_multiple > 0 and trade.mae_r >= 0.85:
            trade.add_tag("knapper_stop")
        if trade.r_multiple <= -1.35:
            trade.add_tag("grosser_verlust")
        if trade.exit_reason is ExitReason.TIME and trade.r_multiple < 0:
            trade.add_tag("zeitstop")
        stop_atr = float(trade.context.get("stop_atr", 0) or 0)
        if stop_atr and stop_atr >= wide_stop_atr:
            trade.add_tag("stop_gekappt")
        if per_day[day] > max_trades_per_day:
            trade.add_tag("overtrading")
        if last_loss_exit is not None:
            gap = trade.entry_time - last_loss_exit
            if timedelta(0) <= gap <= timedelta(minutes=cooldown_minutes):
                trade.add_tag("rachetrade")
        if session is not None:
            moment = pd.Timestamp(trade.entry_time)
            if not session.allows(moment):
                trade.add_tag("duenne_session")
            now = moment.timetz().replace(tzinfo=None)
            for begin, finish in session.blackouts:
                begin_time = pd.Timestamp(f"2000-01-01 {begin}").time()
                finish_time = pd.Timestamp(f"2000-01-01 {finish}").time()
                if begin_time <= now <= finish_time:
                    trade.add_tag("news_fenster")
        trend = str(trade.context.get("trend", ""))
        if trend == "up" and trade.side is Side.SHORT:
            trade.add_tag("gegen_den_trend")
        if trend == "down" and trade.side is Side.LONG:
            trade.add_tag("gegen_den_trend")

        if trade.r_multiple < 0:
            last_loss_exit = trade.exit_time
    return closed


@dataclass(slots=True)
class Lesson:
    """Eine konkrete, aus Zahlen abgeleitete Empfehlung."""

    topic: str
    finding: str
    action: str
    impact_r: float = 0.0
    sample: int = 0

    def __str__(self) -> str:
        return f"[{self.topic}] {self.finding}\n    -> {self.action}" + (
            f"  (Stichprobe {self.sample}, Wirkung {self.impact_r:+.1f} R)" if self.sample else ""
        )


def lessons(
    trades: list[Trade], *, min_sample: int = 12, wide_stop_atr: float = 3.3
) -> list[Lesson]:
    """Leitet Empfehlungen aus den Trades ab - sortiert nach Wirkung."""
    closed = [trade for trade in trades if not trade.is_open]
    result: list[Lesson] = []
    if len(closed) < min_sample:
        return [
            Lesson(
                "Datenlage",
                f"Nur {len(closed)} Trades - fuer Schluesse zu wenig.",
                "Mehr Daten testen (mehrere Jahre, mehrere Symbole), bevor du etwas aenderst.",
            )
        ]

    # 1. Richtung
    for side in (Side.LONG, Side.SHORT):
        subset = [trade for trade in closed if trade.side is side]
        if len(subset) >= min_sample:
            total = sum(trade.r_multiple for trade in subset)
            if total < -1.0:
                result.append(
                    Lesson(
                        "Richtung",
                        f"{side.label}-Trades verlieren {total:+.1f} R ueber {len(subset)} Trades.",
                        f"{side.label}s abschalten und getrennt neu bewerten "
                        f"(allow_short=False bzw. Trendfilter pruefen).",
                        impact_r=total,
                        sample=len(subset),
                    )
                )

    # 2. Sessions
    for key, values in _group(closed, lambda trade: str(trade.context.get("session", "?"))).items():
        if len(values) >= min_sample:
            total = sum(values)
            if total < -1.0:
                result.append(
                    Lesson(
                        "Handelszeit",
                        f"Session '{key}' kostet {total:+.1f} R ueber {len(values)} Trades.",
                        f"Fenster '{key}' aus dem SessionWindow nehmen.",
                        impact_r=total,
                        sample=len(values),
                    )
                )

    # 3. Setups
    for key, values in _group(closed, lambda trade: trade.setup or "?").items():
        if len(values) >= min_sample and sum(values) < -1.0:
            result.append(
                Lesson(
                    "Setup",
                    f"Setup '{key}': {sum(values):+.1f} R ueber {len(values)} Trades.",
                    "Setup deaktivieren oder Filter verschaerfen - "
                    "die AdaptiveStrategy macht genau das automatisch.",
                    impact_r=sum(values),
                    sample=len(values),
                )
            )

    # 4. Fehler-Label mit Geldwirkung
    tagged: dict[str, list[float]] = defaultdict(list)
    for trade in closed:
        for tag in trade.tags:
            tagged[tag].append(trade.r_multiple)
    for tag, values in sorted(tagged.items(), key=lambda item: sum(item[1])):
        if tag in MISTAKES and len(values) >= max(3, min_sample // 3) and sum(values) < -0.5:
            description, action = MISTAKES[tag]
            result.append(
                Lesson(
                    "Fehlermuster",
                    f"{description} ({len(values)}x, {sum(values):+.1f} R)",
                    action,
                    impact_r=sum(values),
                    sample=len(values),
                )
            )

    # 5. Ausstiegsqualitaet
    stopped = [trade for trade in closed if trade.exit_reason is ExitReason.STOP]
    if len(stopped) >= min_sample:
        given_back = [trade for trade in stopped if trade.mfe_r >= 1.0]
        share = len(given_back) / len(stopped)
        if share >= 0.25:
            result.append(
                Lesson(
                    "Ausstieg",
                    f"{share:.0%} der ausgestoppten Trades lagen vorher mit 1 R im Plus.",
                    "Teilgewinn bei 1 R aktivieren bzw. Break-even frueher ziehen.",
                    impact_r=-sum(trade.r_multiple for trade in given_back),
                    sample=len(given_back),
                )
            )

    # 6. Stopabstand: wie oft wird der Stop von der Obergrenze gekappt?
    gekappt = [
        trade
        for trade in closed
        if float(trade.context.get("stop_atr", 0) or 0) >= wide_stop_atr
    ]
    if closed and len(gekappt) / len(closed) >= 0.4:
        share = len(gekappt) / len(closed)
        result.append(
            Lesson(
                "Stopabstand",
                f"{share:.0%} der Stops liegen an der ATR-Obergrenze - die "
                f"Marktstruktur lag weiter weg als erlaubt.",
                "max_stop_atr erhoehen oder pullback_bars verkleinern. Ein "
                "gekappter Stop sitzt im Rauschen statt hinter dem Ruecksetzer.",
                impact_r=sum(trade.r_multiple for trade in gekappt if trade.r_multiple < 0),
                sample=len(gekappt),
            )
        )

    winners = [trade.mfe_r for trade in closed if trade.r_multiple > 0]
    if winners and sum(winners) / len(winners) > 2.6:
        result.append(
            Lesson(
                "Ausstieg",
                f"Gewinner laufen im Schnitt bis {sum(winners) / len(winners):.1f} R, "
                f"das Ziel liegt darunter.",
                "Ziel weiter setzen oder mehr Trailing zulassen.",
                sample=len(winners),
            )
        )

    result.sort(key=lambda lesson: lesson.impact_r)
    if not result:
        result.append(
            Lesson(
                "Ergebnis",
                "Keine systematischen Fehlermuster gefunden.",
                "Parameter unveraendert lassen und Stichprobe vergroessern.",
                sample=len(closed),
            )
        )
    return result


def _group(trades: list[Trade], key) -> dict[str, list[float]]:
    grouped: dict[str, list[float]] = defaultdict(list)
    for trade in trades:
        grouped[key(trade)].append(trade.r_multiple)
    return dict(grouped)


@dataclass(slots=True)
class BucketStats:
    """Laufende Statistik einer Setup/Kontext-Kombination."""

    key: str
    count: int = 0
    total_r: float = 0.0
    total_squared: float = 0.0
    wins: int = 0
    blocked: int = 0

    def add(self, r_multiple: float) -> None:
        self.count += 1
        self.total_r += r_multiple
        self.total_squared += r_multiple**2
        if r_multiple > 0:
            self.wins += 1

    @property
    def mean(self) -> float:
        return self.total_r / self.count if self.count else 0.0

    @property
    def std(self) -> float:
        if self.count < 2:
            return 0.0
        variance = self.total_squared / self.count - self.mean**2
        return sqrt(max(0.0, variance))

    @property
    def standard_error(self) -> float:
        """Standardfehler des Mittelwerts - wie unsicher ist die Schaetzung?"""
        if self.count < 2:
            return float("inf")
        return self.std / sqrt(self.count)

    def lower_bound(self, z: float = 1.0) -> float:
        """Untere Vertrauensgrenze des Erwartungswerts in R."""
        if self.count < 2:
            return float("-inf")
        return self.mean - z * self.standard_error

    def upper_bound(self, z: float = 1.0) -> float:
        """Obere Vertrauensgrenze - der wohlwollendste Blick auf die Zahlen."""
        if self.count < 2:
            return float("inf")
        return self.mean + z * self.standard_error

    @property
    def win_rate(self) -> float:
        return self.wins / self.count if self.count else 0.0


@dataclass(frozen=True, slots=True)
class AdaptiveSettings:
    """Wann die lernende Schicht eingreift."""

    min_trades: int = 15
    z_score: float = 1.0
    block_threshold: float = 0.0
    explore_rate: float = 0.10
    keys: tuple[str, ...] = ("setup", "session", "adx_bucket")

    def __post_init__(self) -> None:
        if self.min_trades < 5:
            raise ValueError("min_trades sollte mindestens 5 sein, sonst lernt der Bot Rauschen.")
        if not 0 <= self.explore_rate < 1:
            raise ValueError("explore_rate muss zwischen 0 und 1 liegen.")


class PerformanceMemory:
    """Gedaechtnis ueber die Qualitaet einzelner Setup/Kontext-Kombinationen."""

    def __init__(self, settings: AdaptiveSettings | None = None) -> None:
        self.settings = settings or AdaptiveSettings()
        self.buckets: dict[str, BucketStats] = {}

    def observe(self, trade: Trade) -> None:
        for key in self._keys_for(trade.setup, trade.context):
            bucket = self.buckets.setdefault(key, BucketStats(key))
            bucket.add(trade.r_multiple)

    def verdict(self, setup: str, context: dict) -> tuple[bool, str]:
        """Darf dieses Setup in diesem Kontext gehandelt werden?

        Gesperrt wird erst, wenn selbst die **obere** Vertrauensgrenze unter der
        Schwelle liegt - wenn also auch die wohlwollende Lesart der Zahlen
        negativ ist. Mit der unteren Grenze zu sperren waere ein Fehler: bei 20
        Trades und einer Streuung von 1 R liegt die untere Grenze fast immer
        unter null, und der Bot wuerde funktionierende Setups abschalten.
        """
        settings = self.settings
        for key in self._keys_for(setup, context):
            bucket = self.buckets.get(key)
            if bucket is None or bucket.count < settings.min_trades:
                continue
            if bucket.upper_bound(settings.z_score) < settings.block_threshold:
                return False, key
        return True, ""

    def _keys_for(self, setup: str, context: dict) -> list[str]:
        keys = [f"setup={setup}"]
        for name in self.settings.keys:
            if name == "setup":
                continue
            value = context.get(name)
            if value is not None:
                keys.append(f"{setup}|{name}={value}")
        return keys

    def table(self, minimum: int = 1) -> list[BucketStats]:
        """Alle Kombinationen mit mindestens ``minimum`` Trades, schlechteste zuerst."""
        rows = [bucket for bucket in self.buckets.values() if bucket.count >= minimum]
        return sorted(rows, key=lambda bucket: bucket.mean)


class AdaptiveStrategy(Strategy):
    """Huelle um eine Strategie, die im laufenden Betrieb dazulernt."""

    def __init__(
        self,
        base: Strategy,
        settings: AdaptiveSettings | None = None,
        *,
        seed: int = 0,
    ) -> None:
        super().__init__(base.session)
        self.base = base
        self.name = f"adaptive_{base.name}"
        self.memory = PerformanceMemory(settings)
        self.blocked: dict[str, int] = defaultdict(int)
        self._seed = seed
        self._counter = 0

    @property
    def warmup(self) -> int:
        return self.base.warmup

    def prepare(self, frame: pd.DataFrame) -> pd.DataFrame:
        return self.base.prepare(frame)

    def signal(self, frame: pd.DataFrame, index: int):
        signal = self.base.signal(frame, index)
        if signal is None:
            return None
        context = {**self.base.context(frame, index), **signal.context}
        allowed, key = self.memory.verdict(signal.setup, context)
        if allowed or self._explore():
            return signal
        self.blocked[key] += 1
        return None

    def context(self, frame: pd.DataFrame, index: int) -> dict[str, float | str]:
        return self.base.context(frame, index)

    def params(self) -> dict[str, float | str]:
        params = dict(self.base.params())
        params["adaptive_min_trades"] = self.memory.settings.min_trades
        params["adaptive_z"] = self.memory.settings.z_score
        return params

    def on_trade_closed(self, trade: Trade) -> None:
        self.memory.observe(trade)
        self.base.on_trade_closed(trade)

    def _explore(self) -> bool:
        """Deterministische Stichprobe trotz Sperre, damit Sperren revidierbar bleiben."""
        rate = self.memory.settings.explore_rate
        if rate <= 0:
            return False
        self._counter += 1
        period = max(1, int(round(1 / rate)))
        return (self._counter + self._seed) % period == 0

    def report(self) -> str:
        """Was hat die Lernschicht gesperrt?"""
        if not self.blocked:
            return "Lernschicht: nichts gesperrt."
        lines = ["Lernschicht hat blockiert:"]
        for key, count in sorted(self.blocked.items(), key=lambda item: -item[1]):
            bucket = self.memory.buckets.get(key)
            detail = (
                f"{bucket.count} Trades, {bucket.mean:+.2f} R im Mittel "
                f"(obere Grenze {bucket.upper_bound(self.memory.settings.z_score):+.2f} R)"
                if bucket
                else ""
            )
            lines.append(f"  {count:>4}x Signal verworfen - {key}: {detail}")
        return "\n".join(lines)
