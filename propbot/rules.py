"""Das Regelwerk des Prop-Firm-Kontos - der wichtigste Teil des Bots.

Ein Prop-Konto verliert man nicht, weil die Strategie schlecht ist, sondern
weil eine Regel gerissen wird. Deshalb liegt die Regelpruefung hier in einem
eigenen Modul, unabhaengig von Strategie und Backtest-Engine, und wird von
beiden (Backtest wie Live) benutzt.

Standard ist das Konto aus der Aufgabenstellung:

* 50.000 $ Startkapital
* +4.000 $ Gewinnziel -> danach wird auf Payout gestellt und nicht mehr gehandelt
* 2.000 $ maximaler Drawdown
* zusaetzlich ein selbst gesetztes Tageslimit von 1.000 $

Drei Drawdown-Modelle sind implementiert, weil jede Firma es anders macht:

``STATIC``
    Fester Boden bei ``Start - max_drawdown`` (hier 48.000 $).
``TRAILING_INTRADAY``
    Der Boden folgt dem hoechsten *Equity*-Stand (inklusive schwebender
    Gewinne), typisch fuer Futures-Firmen wie Apex.
``TRAILING_EOD``
    Der Boden folgt dem hoechsten *Tagesschluss*-Kontostand, typisch fuer
    Topstep und die meisten FX-Firmen mit Trailing.

Bei den Trailing-Varianten friert der Boden ein, sobald er den Startkontostand
erreicht hat (``trailing_locks_at_start``) - ab dann kann das Konto nicht mehr
unter den Startbetrag fallen.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
from enum import StrEnum

__all__ = [
    "AccountState",
    "AccountStatus",
    "DrawdownMode",
    "PropFirmRules",
]


class DrawdownMode(StrEnum):
    """Wie die Firma den maximalen Verlust misst."""

    STATIC = "static"
    TRAILING_INTRADAY = "trailing_intraday"
    TRAILING_EOD = "trailing_eod"

    @property
    def label(self) -> str:
        return {
            "static": "Statisch (fester Boden)",
            "trailing_intraday": "Trailing am Equity-Hoch (intraday)",
            "trailing_eod": "Trailing am Tagesschluss",
        }[self.value]


class AccountStatus(StrEnum):
    """Zustand des Kontos. Alles ausser RUNNING beendet den Handel."""

    RUNNING = "running"
    TARGET_REACHED = "target_reached"
    BREACHED_DRAWDOWN = "breached_drawdown"
    BREACHED_DAILY_LOSS = "breached_daily_loss"

    @property
    def is_final(self) -> bool:
        return self is not AccountStatus.RUNNING

    @property
    def is_breach(self) -> bool:
        return self in (
            AccountStatus.BREACHED_DRAWDOWN,
            AccountStatus.BREACHED_DAILY_LOSS,
        )

    @property
    def label(self) -> str:
        return {
            "running": "Laeuft",
            "target_reached": "Ziel erreicht - Payout",
            "breached_drawdown": "Max. Drawdown gerissen",
            "breached_daily_loss": "Tagesverlustlimit gerissen",
        }[self.value]


@dataclass(frozen=True, slots=True)
class PropFirmRules:
    """Die Vertragsbedingungen des Kontos."""

    start_balance: float = 50_000.0
    profit_target: float = 4_000.0
    max_drawdown: float = 2_000.0
    daily_loss_limit: float | None = 1_000.0
    drawdown_mode: DrawdownMode = DrawdownMode.TRAILING_EOD
    trailing_locks_at_start: bool = True
    equity_based_drawdown: bool = True
    daily_reset_hour: int = 22
    min_trading_days: int = 0
    consistency_cap: float | None = 0.40

    def __post_init__(self) -> None:
        if self.start_balance <= 0:
            raise ValueError("start_balance muss positiv sein.")
        if self.profit_target <= 0:
            raise ValueError("profit_target muss positiv sein.")
        if self.max_drawdown <= 0:
            raise ValueError("max_drawdown muss positiv sein.")
        if self.daily_loss_limit is not None and self.daily_loss_limit <= 0:
            raise ValueError("daily_loss_limit muss positiv oder None sein.")
        if not 0 <= self.daily_reset_hour <= 23:
            raise ValueError("daily_reset_hour muss zwischen 0 und 23 liegen.")
        if self.consistency_cap is not None and not 0 < self.consistency_cap <= 1:
            raise ValueError("consistency_cap muss zwischen 0 und 1 liegen.")

    @property
    def target_balance(self) -> float:
        """Kontostand, ab dem ausgezahlt wird (hier 54.000 $)."""
        return self.start_balance + self.profit_target

    @property
    def static_floor(self) -> float:
        """Boden im statischen Modell (hier 48.000 $)."""
        return self.start_balance - self.max_drawdown

    @property
    def is_trailing(self) -> bool:
        return self.drawdown_mode is not DrawdownMode.STATIC

    @property
    def target_to_drawdown(self) -> float:
        """Wie viele Drawdown-Budgets muessen verdient werden (hier 2.0)."""
        return self.profit_target / self.max_drawdown

    def day_key(self, moment: datetime) -> date:
        """Handelstag eines Zeitpunkts unter Beruecksichtigung des Reset.

        Der Handelstag wechselt nicht um Mitternacht UTC, sondern zur
        Broker-Rollover-Zeit (``daily_reset_hour``, Standard 22:00 UTC =
        Mitternacht in Mitteleuropa bzw. 17:00 in New York waehrend der
        Sommerzeit). Ein Trade um 23:00 UTC gehoert damit bereits zum
        naechsten Handelstag - genau so rechnet die Firma auch ab.
        """
        if moment.tzinfo is None:
            moment = moment.replace(tzinfo=timezone.utc)
        shifted = moment.astimezone(timezone.utc) + timedelta(hours=24 - self.daily_reset_hour)
        return shifted.date()

    def describe(self) -> str:
        """Mehrzeilige Zusammenfassung fuer Reports und Logs."""
        daily = f"{self.daily_loss_limit:,.0f} $" if self.daily_loss_limit else "keins"
        consistency = (
            f"max. {self.consistency_cap:.0%} des Gewinns aus einem Tag"
            if self.consistency_cap
            else "keine"
        )
        return (
            f"Konto:            {self.start_balance:,.0f} $\n"
            f"Ziel:             +{self.profit_target:,.0f} $ "
            f"({self.profit_target / self.start_balance:.1%}) -> {self.target_balance:,.0f} $\n"
            f"Max. Drawdown:    {self.max_drawdown:,.0f} $ "
            f"({self.max_drawdown / self.start_balance:.1%}), {self.drawdown_mode.label}\n"
            f"Tageslimit:       {daily}\n"
            f"Konsistenzregel:  {consistency}\n"
            f"Verhaeltnis:      {self.target_to_drawdown:.1f} Drawdown-Budgets muessen "
            f"verdient werden"
        )


@dataclass(slots=True)
class DayRecord:
    """Ergebnis eines abgeschlossenen Handelstags."""

    key: date
    start_balance: float
    end_balance: float
    trades: int = 0

    @property
    def profit(self) -> float:
        return self.end_balance - self.start_balance


class AccountState:
    """Fuehrt Kontostand, Equity, Boden und Tageszaehler nach.

    Der Ablauf ist immer gleich: die Engine (oder der Live-Loop) ruft bei jeder
    Kursaktualisierung :meth:`mark` auf und bekommt den Status zurueck. Alles
    andere - Boden, Tageswechsel, Handelstage, Tagesgewinne - ergibt sich daraus.
    """

    def __init__(
        self,
        rules: PropFirmRules | None = None,
        *,
        start_time: datetime | None = None,
        balance: float | None = None,
    ) -> None:
        self.rules = rules or PropFirmRules()
        self.balance = self.rules.start_balance if balance is None else float(balance)
        self.equity = self.balance
        self.status = AccountStatus.RUNNING
        self.status_time: datetime | None = None

        self._peak = max(self.balance, self.rules.start_balance)
        self._floor = self._floor_from_peak(self._peak)
        self.min_equity = self.equity
        self.max_equity = self.equity

        self.day_key: date | None = None
        self.day_start_balance = self.balance
        self.day_start_equity = self.equity
        self.day_peak_equity = self.equity
        self.day_trades = 0
        self.days: list[DayRecord] = []
        self.trading_days: set[date] = set()
        self.closed_trades = 0
        if start_time is not None:
            self.day_key = self.rules.day_key(start_time)

    # ----------------------------------------------------------------- Boden
    def _floor_from_peak(self, peak: float) -> float:
        rules = self.rules
        if rules.drawdown_mode is DrawdownMode.STATIC:
            return rules.static_floor
        raw = peak - rules.max_drawdown
        if rules.trailing_locks_at_start:
            return min(raw, rules.start_balance)
        return raw

    @property
    def floor(self) -> float:
        """Aktueller Verlustboden. Darunter ist das Konto verloren."""
        return self._floor

    @property
    def peak(self) -> float:
        """Referenzhoch, an dem der Boden haengt."""
        return self._peak

    @property
    def drawdown_value(self) -> float:
        """Der Wert, den die Firma gegen den Boden prueft."""
        return self.equity if self.rules.equity_based_drawdown else self.balance

    @property
    def remaining_drawdown(self) -> float:
        """Wie viel Geld noch bis zum Boden bleibt (nie negativ)."""
        return max(0.0, self.drawdown_value - self._floor)

    @property
    def remaining_to_target(self) -> float:
        """Wie viel Gewinn noch bis zum Payout fehlt."""
        return max(0.0, self.rules.target_balance - self.balance)

    @property
    def daily_pnl(self) -> float:
        """Ergebnis des laufenden Handelstags (Equity-basiert)."""
        return self.drawdown_value - self.day_start_equity

    @property
    def remaining_daily_loss(self) -> float:
        """Verbleibendes Tagesverlustbudget (unendlich ohne Limit)."""
        limit = self.rules.daily_loss_limit
        if limit is None:
            return float("inf")
        loss = max(0.0, self.day_start_equity - self.drawdown_value)
        return max(0.0, limit - loss)

    @property
    def progress(self) -> float:
        """Fortschritt Richtung Ziel zwischen 0 und 1."""
        gain = self.balance - self.rules.start_balance
        return max(0.0, min(1.0, gain / self.rules.profit_target))

    # ------------------------------------------------------------ Tageslogik
    def _rollover(self, new_key: date) -> None:
        """Schliesst den alten Handelstag ab und startet den neuen."""
        if self.day_key is not None:
            record = DayRecord(
                key=self.day_key,
                start_balance=self.day_start_balance,
                end_balance=self.balance,
                trades=self.day_trades,
            )
            self.days.append(record)
            if self.rules.drawdown_mode is DrawdownMode.TRAILING_EOD:
                self._update_peak(self.balance)
        self.day_key = new_key
        self.day_start_balance = self.balance
        self.day_start_equity = self.drawdown_value
        self.day_peak_equity = self.drawdown_value
        self.day_trades = 0

    def _update_peak(self, value: float) -> None:
        if value > self._peak:
            self._peak = value
            self._floor = self._floor_from_peak(self._peak)

    # ------------------------------------------------------------ Hauptpfad
    def mark(self, moment: datetime, equity: float, balance: float | None = None) -> AccountStatus:
        """Bewertet das Konto neu und liefert den Status zurueck.

        ``equity`` enthaelt schwebende Gewinne/Verluste, ``balance`` nur
        geschlossene Trades. Fehlt ``balance``, gilt der bisherige Wert
        (typisch, wenn nur der Kurs weiterlaeuft).
        """
        # Reihenfolge ist wichtig: der Tageswechsel wird mit dem Stand vom
        # *Vortag* abgeschlossen. Wuerde erst der neue Kontostand gebucht,
        # landete der erste Trade des neuen Tages noch im alten Tag - und der
        # Trailing-Boden (TRAILING_EOD) haenge am falschen Wert.
        key = self.rules.day_key(moment)
        if self.day_key is not None and key != self.day_key:
            self._rollover(key)

        if balance is not None:
            self.balance = float(balance)
        self.equity = float(equity)
        self.min_equity = min(self.min_equity, self.equity)
        self.max_equity = max(self.max_equity, self.equity)

        if self.day_key is None:
            self.day_key = key
            self.day_start_balance = self.balance
            self.day_start_equity = self.drawdown_value
            self.day_peak_equity = self.drawdown_value

        self.day_peak_equity = max(self.day_peak_equity, self.drawdown_value)
        if self.rules.drawdown_mode is DrawdownMode.TRAILING_INTRADAY:
            self._update_peak(self.drawdown_value)

        if self.status.is_final:
            return self.status
        return self._evaluate(moment)

    def _evaluate(self, moment: datetime) -> AccountStatus:
        """Prueft die Regeln in der Reihenfolge ihrer Haerte."""
        value = self.drawdown_value
        if value <= self._floor + 1e-9:
            return self._set_status(AccountStatus.BREACHED_DRAWDOWN, moment)

        limit = self.rules.daily_loss_limit
        if limit is not None and (self.day_start_equity - value) >= limit - 1e-9:
            return self._set_status(AccountStatus.BREACHED_DAILY_LOSS, moment)

        if self.balance >= self.rules.target_balance - 1e-9 and self.days_ok:
            return self._set_status(AccountStatus.TARGET_REACHED, moment)
        return self.status

    def _set_status(self, status: AccountStatus, moment: datetime) -> AccountStatus:
        self.status = status
        self.status_time = moment
        return status

    @property
    def days_ok(self) -> bool:
        """Ist die Mindestanzahl an Handelstagen erfuellt?"""
        return len(self.trading_days) >= self.rules.min_trading_days

    # ------------------------------------------------------------- Buchungen
    def apply_trade(self, moment: datetime, pnl: float) -> AccountStatus:
        """Bucht einen geschlossenen Trade auf den Kontostand."""
        self.closed_trades += 1
        self.day_trades += 1
        self.trading_days.add(self.rules.day_key(moment))
        return self.mark(moment, self.balance + pnl, self.balance + pnl)

    # ------------------------------------------------------------- Auskuenfte
    def should_secure_payout(self) -> bool:
        """Steht das Ziel offen im Markt? Dann Position schliessen und Payout."""
        return (
            self.status is AccountStatus.RUNNING
            and self.equity >= self.rules.target_balance
            and self.days_ok
        )

    def daily_loss_used(self) -> float:
        """Bereits verbrauchter Anteil des Tagesverlustbudgets (0..1)."""
        limit = self.rules.daily_loss_limit
        if limit is None:
            return 0.0
        loss = max(0.0, self.day_start_equity - self.drawdown_value)
        return min(1.0, loss / limit)

    def day_profits(self) -> dict[date, float]:
        """Gewinn je abgeschlossenem Handelstag plus laufendem Tag."""
        profits = {record.key: record.profit for record in self.days}
        if self.day_key is not None:
            running = self.balance - self.day_start_balance
            if abs(running) > 1e-9 or self.day_trades:
                profits[self.day_key] = running
        return profits

    def best_day_share(self) -> float | None:
        """Anteil des besten Tages am Gesamtgewinn (Konsistenzregel)."""
        total = self.balance - self.rules.start_balance
        if total <= 0:
            return None
        profits = [value for value in self.day_profits().values() if value > 0]
        if not profits:
            return None
        return max(profits) / total

    def consistency_ok(self, *, at_payout: bool = False) -> bool:
        """Wird die Konsistenzregel eingehalten?

        Waehrend der Challenge waere der Vergleich mit dem *bisherigen* Gewinn
        unbrauchbar: am ersten Handelstag macht ein einziger Tag zwangslaeufig
        100 % des Gewinns aus. Solange das Ziel nicht erreicht ist, wird
        deshalb gegen das **Gesamtziel** geprueft - genau so, wie die Firma am
        Ende rechnen wird. Mit ``at_payout=True`` gilt der strenge Vergleich
        gegen den tatsaechlichen Gewinn.
        """
        cap = self.rules.consistency_cap
        if cap is None:
            return True
        profits = [value for value in self.day_profits().values() if value > 0]
        if not profits:
            return True
        best = max(profits)
        if at_payout:
            total = self.balance - self.rules.start_balance
            return total <= 0 or best / total <= cap + 1e-9
        return best <= cap * self.rules.profit_target + 1e-9

    def max_day_profit_allowed(self) -> float:
        """Wie viel darf heute noch verdient werden, ohne die Konsistenz zu reissen?

        Bei einem Cap von 40 % und einem Ziel von 4.000 $ darf ein einzelner Tag
        hoechstens 1.600 $ beitragen. Der Wert bezieht sich auf das Gesamtziel,
        nicht auf den bisherigen Gewinn - sonst waere der erste Tag immer 100 %.
        """
        cap = self.rules.consistency_cap
        if cap is None:
            return float("inf")
        allowed = cap * self.rules.profit_target
        today = self.balance - self.day_start_balance
        return max(0.0, allowed - today)

    # ------------------------------------------------------- Persistenz
    def to_dict(self) -> dict:
        """Zustand zum Speichern - wichtig fuer den Trailing-Boden.

        Ohne diesen Schritt beginnt der Bot nach einem Neustart wieder bei
        Boden = Start - Drawdown und haelt ein laengst gerissenes Konto fuer
        gesund. Der Boden gehoert deshalb auf die Platte, nicht in den RAM.
        """
        return {
            "balance": self.balance,
            "equity": self.equity,
            "status": self.status.value,
            "peak": self._peak,
            "floor": self._floor,
            "day_key": self.day_key.isoformat() if self.day_key else None,
            "day_start_balance": self.day_start_balance,
            "day_start_equity": self.day_start_equity,
            "day_trades": self.day_trades,
            "closed_trades": self.closed_trades,
            "trading_days": sorted(day.isoformat() for day in self.trading_days),
            "days": [
                {
                    "key": record.key.isoformat(),
                    "start_balance": record.start_balance,
                    "end_balance": record.end_balance,
                    "trades": record.trades,
                }
                for record in self.days
            ],
        }

    @classmethod
    def from_dict(cls, data: dict, rules: PropFirmRules | None = None) -> "AccountState":
        """Stellt einen gespeicherten Zustand wieder her."""
        state = cls(rules, balance=data.get("balance"))
        state.equity = float(data.get("equity", state.balance))
        state.status = AccountStatus(data.get("status", "running"))
        state._peak = float(data.get("peak", state.balance))
        state._floor = float(data.get("floor", state._floor_from_peak(state._peak)))
        day_key = data.get("day_key")
        state.day_key = date.fromisoformat(day_key) if day_key else None
        state.day_start_balance = float(data.get("day_start_balance", state.balance))
        state.day_start_equity = float(data.get("day_start_equity", state.balance))
        state.day_trades = int(data.get("day_trades", 0))
        state.closed_trades = int(data.get("closed_trades", 0))
        state.trading_days = {date.fromisoformat(day) for day in data.get("trading_days", [])}
        state.days = [
            DayRecord(
                key=date.fromisoformat(record["key"]),
                start_balance=float(record["start_balance"]),
                end_balance=float(record["end_balance"]),
                trades=int(record.get("trades", 0)),
            )
            for record in data.get("days", [])
        ]
        return state

    def snapshot(self) -> dict[str, float | str]:
        """Kompakter Zustand fuer Logs, Journal und Live-Monitoring."""
        return {
            "status": self.status.value,
            "balance": round(self.balance, 2),
            "equity": round(self.equity, 2),
            "floor": round(self._floor, 2),
            "peak": round(self._peak, 2),
            "remaining_drawdown": round(self.remaining_drawdown, 2),
            "remaining_to_target": round(self.remaining_to_target, 2),
            "daily_pnl": round(self.daily_pnl, 2),
            "trading_days": len(self.trading_days),
            "closed_trades": self.closed_trades,
        }
