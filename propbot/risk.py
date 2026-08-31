"""Positionsgroesse und Handelsfreigabe - der Waechter vor jedem Trade.

Die Strategie sagt nur *ob* und *wohin*. Wie viel riskiert wird und ob
ueberhaupt gehandelt werden darf, entscheidet ausschliesslich dieses Modul.
Es kennt dafuer den Kontostand (:class:`~propbot.rules.AccountState`) und die
juengste Trade-Historie.

Die Groesse ist das Minimum aus fuenf Budgets:

1. Basisrisiko in Prozent des Startkapitals (Standard 0,5 % = 250 $)
2. ein Anteil des *verbleibenden* Drawdown-Puffers (Standard 20 %)
3. ein Anteil des verbleibenden Tagesverlustbudgets (Standard 50 %)
4. der Streak-Faktor: nach Verlusten in Folge wird kleiner gehandelt
5. der Payout-Schutz: nahe am Ziel wird kleiner gehandelt

Punkt 2 ist der wichtigste Unterschied zu einem normalen Bot: auf einem
Prop-Konto ist nicht das Kapital die Grenze, sondern der Abstand zum Boden.
Ein Konto mit 300 $ Restpuffer darf keine 250 $ mehr riskieren.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime

from .models import Instrument, Side
from .rules import AccountState

__all__ = ["RiskDecision", "RiskManager", "RiskSettings"]


@dataclass(frozen=True, slots=True)
class RiskSettings:
    """Alle Stellschrauben des Risikomanagements."""

    base_risk_pct: float = 0.005
    max_risk_pct: float = 0.01
    min_risk_money: float = 20.0
    dd_buffer_fraction: float = 0.20
    daily_budget_fraction: float = 0.50
    own_daily_stop_fraction: float = 0.60
    max_trades_per_day: int = 3
    max_losses_per_day: int = 2
    loss_streak_trigger: int = 2
    loss_streak_step: float = 0.30
    min_streak_factor: float = 0.40
    wins_to_recover: int = 2
    payout_guard_start: float = 0.75
    payout_guard_factor: float = 0.50
    consistency_guard: bool = True
    max_stop_distance_atr: float = 3.0
    min_reward_ratio: float = 1.3

    def __post_init__(self) -> None:
        if not 0 < self.base_risk_pct <= self.max_risk_pct:
            raise ValueError("base_risk_pct muss positiv und <= max_risk_pct sein.")
        if not 0 < self.dd_buffer_fraction <= 1:
            raise ValueError("dd_buffer_fraction muss zwischen 0 und 1 liegen.")
        if not 0 < self.daily_budget_fraction <= 1:
            raise ValueError("daily_budget_fraction muss zwischen 0 und 1 liegen.")
        if not 0 < self.min_streak_factor <= 1:
            raise ValueError("min_streak_factor muss zwischen 0 und 1 liegen.")


@dataclass(slots=True)
class RiskDecision:
    """Antwort des Risk-Managers auf einen Signalvorschlag."""

    allowed: bool
    reason: str = ""
    size: float = 0.0
    risk_money: float = 0.0
    planned_risk: float = 0.0
    factors: dict[str, float] = field(default_factory=dict)

    def __bool__(self) -> bool:
        return self.allowed


def _blocked(reason: str, factors: dict[str, float] | None = None) -> RiskDecision:
    return RiskDecision(allowed=False, reason=reason, factors=factors or {})


class RiskManager:
    """Berechnet Positionsgroessen und blockt Trades, die Regeln gefaehrden."""

    def __init__(self, settings: RiskSettings | None = None) -> None:
        self.settings = settings or RiskSettings()
        self.loss_streak = 0
        self.win_streak = 0
        self.streak_factor = 1.0
        self.day_losses = 0
        self.day_trades = 0
        self._day_key = None

    # ------------------------------------------------------------ Rueckmeldung
    def register_result(self, r_multiple: float, moment: datetime | None = None) -> None:
        """Meldet ein Trade-Ergebnis zurueck - Grundlage der Streak-Anpassung."""
        settings = self.settings
        if r_multiple < 0:
            self.loss_streak += 1
            self.win_streak = 0
            self.day_losses += 1
            if self.loss_streak >= settings.loss_streak_trigger:
                over = self.loss_streak - settings.loss_streak_trigger + 1
                self.streak_factor = max(
                    settings.min_streak_factor, 1.0 - settings.loss_streak_step * over
                )
        else:
            self.win_streak += 1
            self.loss_streak = 0
            if self.win_streak >= settings.wins_to_recover:
                self.streak_factor = min(1.0, self.streak_factor + settings.loss_streak_step)
        self.day_trades += 1

    def start_day(self, key) -> None:
        """Setzt die Tageszaehler zurueck (Streaks bleiben bewusst bestehen)."""
        self._day_key = key
        self.day_losses = 0
        self.day_trades = 0

    def sync_day(self, account: AccountState) -> None:
        """Uebernimmt den Tageswechsel aus dem Kontozustand.

        Beim ersten Aufruf wird der Tag nur uebernommen, nicht zurueckgesetzt -
        sonst wuerden bereits gezaehlte Trades (etwa nach einem Neustart
        mitten am Handelstag) stillschweigend verschwinden.
        """
        if self._day_key is None:
            self._day_key = account.day_key
            return
        if account.day_key != self._day_key:
            self.start_day(account.day_key)

    # ------------------------------------------------------------- Freigaben
    def trading_allowed(self, account: AccountState) -> RiskDecision:
        """Darf heute ueberhaupt noch gehandelt werden?"""
        settings = self.settings
        self.sync_day(account)

        if account.status.is_final:
            return _blocked(f"Konto beendet: {account.status.label}")
        if self.day_trades >= settings.max_trades_per_day:
            return _blocked(f"Tageslimit erreicht: {settings.max_trades_per_day} Trades")
        if self.day_losses >= settings.max_losses_per_day:
            return _blocked(f"{self.day_losses} Verluste heute - Feierabend")
        if account.daily_loss_used() >= settings.own_daily_stop_fraction:
            return _blocked(
                f"Eigener Tagesstop bei {settings.own_daily_stop_fraction:.0%} "
                f"des Tageslimits erreicht"
            )
        if account.remaining_drawdown <= settings.min_risk_money:
            return _blocked("Drawdown-Puffer ist aufgebraucht")
        if settings.consistency_guard and account.max_day_profit_allowed() <= 0:
            return _blocked("Konsistenzregel: heute genug verdient")
        return RiskDecision(allowed=True, reason="ok")

    # ------------------------------------------------------------ Berechnung
    def plan(
        self,
        account: AccountState,
        instrument: Instrument,
        side: Side,
        entry_price: float,
        stop_price: float,
        *,
        target_price: float | None = None,
    ) -> RiskDecision:
        """Bestimmt die Positionsgroesse fuer einen konkreten Einstieg."""
        settings = self.settings
        gate = self.trading_allowed(account)
        if not gate.allowed:
            return gate

        distance = abs(entry_price - stop_price)
        if distance <= 0:
            return _blocked("Stop liegt auf dem Einstiegspreis")
        if side is Side.LONG and stop_price >= entry_price:
            return _blocked("Long-Stop muss unter dem Einstieg liegen")
        if side is Side.SHORT and stop_price <= entry_price:
            return _blocked("Short-Stop muss ueber dem Einstieg liegen")
        if target_price is not None:
            reward = abs(target_price - entry_price) / distance
            if reward < settings.min_reward_ratio:
                return _blocked(
                    f"CRV {reward:.2f} unter Mindestwert {settings.min_reward_ratio:.2f}"
                )

        budgets = self._budgets(account)
        risk_money = min(budgets.values())
        if risk_money < settings.min_risk_money:
            return _blocked(
                f"Risikobudget nur {risk_money:,.0f} $ - unter Minimum "
                f"{settings.min_risk_money:,.0f} $",
                budgets,
            )

        risk_per_unit = distance * instrument.value_per_point + instrument.commission
        raw_size = risk_money / risk_per_unit
        size = instrument.round_size(raw_size)
        if size <= 0:
            return _blocked(
                f"Positionsgroesse {raw_size:.4f} unter Mindestgroesse {instrument.min_size}",
                budgets,
            )

        actual_risk = size * risk_per_unit
        hard_cap = min(
            account.remaining_drawdown,
            account.remaining_daily_loss,
        )
        if actual_risk > hard_cap:
            # Aufrunden auf das Raster darf nie ueber die harte Grenze gehen.
            size = instrument.round_size(hard_cap / risk_per_unit)
            if size <= 0:
                return _blocked("Nach Rasterung bleibt keine zulaessige Groesse", budgets)
            actual_risk = size * risk_per_unit

        return RiskDecision(
            allowed=True,
            reason="ok",
            size=size,
            risk_money=actual_risk,
            planned_risk=risk_money,
            factors={**budgets, "streak_factor": self.streak_factor},
        )

    def budget(self, account: AccountState) -> float:
        """Das aktuell bindende Risikobudget in Geld (ohne konkretes Signal)."""
        return min(self._budgets(account).values())

    def _budgets(self, account: AccountState) -> dict[str, float]:
        """Die konkurrierenden Risikobudgets - das kleinste gewinnt."""
        settings = self.settings
        rules = account.rules
        base = rules.start_balance * settings.base_risk_pct * self.streak_factor
        base *= self._payout_guard(account)

        budgets = {
            "basis": base,
            "max_pct": rules.start_balance * settings.max_risk_pct,
            "dd_puffer": account.remaining_drawdown * settings.dd_buffer_fraction,
        }
        if account.remaining_daily_loss != float("inf"):
            budgets["tagesbudget"] = account.remaining_daily_loss * settings.daily_budget_fraction
        if settings.consistency_guard:
            allowed = account.max_day_profit_allowed()
            if allowed != float("inf"):
                # Nur begrenzen, wenn der Tag fast "voll" ist: sonst wuerde die
                # Konsistenzregel jeden ersten Trade des Tages verkleinern.
                budgets["konsistenz"] = max(allowed, settings.min_risk_money)
        return budgets

    def _payout_guard(self, account: AccountState) -> float:
        """Naeher am Ziel wird vorsichtiger gehandelt.

        Kurz vor dem Payout ist ein grosser Trade das schlechteste Geschaeft der
        Welt: er riskiert 4.000 $ Auszahlung fuer ein paar hundert Dollar mehr.
        """
        settings = self.settings
        progress = account.progress
        if progress < settings.payout_guard_start:
            return 1.0
        span = 1.0 - settings.payout_guard_start
        if span <= 0:
            return settings.payout_guard_factor
        share = (progress - settings.payout_guard_start) / span
        return 1.0 - share * (1.0 - settings.payout_guard_factor)

    def status(self, account: AccountState) -> dict[str, float | str]:
        """Momentaufnahme fuer Logs und Journal."""
        budgets = self._budgets(account)
        return {
            "streak_factor": round(self.streak_factor, 3),
            "loss_streak": self.loss_streak,
            "win_streak": self.win_streak,
            "day_trades": self.day_trades,
            "day_losses": self.day_losses,
            "payout_guard": round(self._payout_guard(account), 3),
            "risk_budget": round(min(budgets.values()), 2),
            "binding": min(budgets, key=budgets.get),
            "account_status": account.status.value,
        }
