"""Lucid Trading 50K Kontosimulator (LucidFlex und LucidDirect).

Der Simulator arbeitet TAGWEISE: pro Handelstag wird ein Tagesergebnis gebucht.
Innerhalb des Tages wird nur der tiefste Zwischenstand mitgefuehrt, weil die
MLL bei Lucid ausschliesslich am Session-Close ausgewertet wird.

Regeln (Stand Sept 2026, gegen Sekundaerquellen geprueft, siehe REPORT_LUCID.md):

Beide Kontotypen
  - MLL 2.000 $, Breach-Level startet bei 48.000 $
  - Trailing nur am Session-Close anhand des hoechsten Schluss-Kontostands
  - Ab Initial Trail Balance 52.100 $ lockt das Breach-Level bei 50.100 $
  - Breach: Schluss-Kontostand <= Breach-Level -> Konto tot
  - Max 5 Payouts, Split 90/10, Mindest-Payout 500 $
  - Kontraktdeckel: 4 Minis bzw. 40 Micros

LucidFlex funded
  - Kein DLL (sofern beim Kauf nicht zugebucht), keine Consistency Rule
  - Payout: 5 separate Tage mit je >= 150 $ Gewinn und positiver Zyklus-Netto
  - Payout-Hoehe: 50 % des Profits, gedeckelt bei 2.000 $
  - Nach Payout springt das Breach-Level auf 50.100 $
  - Scaling Plan (nur am Session-Ende, in beide Richtungen):
      Profit  <  1.000 $ -> 2 Minis / 20 Micros
      Profit 1.000-1.999 -> 3 Minis / 30 Micros
      Profit >= 2.000 $  -> 4 Minis / 40 Micros

LucidDirect
  - Fixed DLL 1.200 $, Soft Breach (Handel gesperrt bis zur naechsten Session)
  - Ab Initial Trail Balance ersetzt LucidScale den Fixed DLL:
    hoechster EOD-Profit x 60 %, steigt nur
  - 20 % Consistency: groesster Einzeltag <= 20 % des Zyklus-Profits
  - Profit Goal: Payout 1 = 3.000 $, ab Payout 2 = 2.500 $, resettet danach
  - Max Payout: Payouts 1-3 = 2.000 $, Payouts 4-5 = 2.500 $
  - Kein Scaling Plan, 4 Minis ab Tag 1

Unsichere Annahmen sind im Code mit ANNAHME markiert und in Config schaltbar.
"""
from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class Config:
    account_type: str = "flex"              # "flex" | "direct"
    start_balance: float = 50_000.0
    mll: float = 2_000.0
    initial_trail_balance: float = 52_100.0
    locked_breach_level: float = 50_100.0
    max_payouts: int = 5
    profit_split: float = 0.90              # Anteil, der beim Trader landet
    min_payout: float = 500.0
    max_minis: int = 4

    # --- Flex ---
    flex_min_profit_days: int = 5
    flex_min_day_profit: float = 150.0
    flex_payout_frac: float = 0.50
    flex_payout_cap: float = 2_000.0
    flex_dll: Optional[float] = None        # None = kein DLL zugebucht

    # --- Direct ---
    direct_dll: float = 1_200.0
    direct_scale_frac: float = 0.60
    direct_consistency: float = 0.20
    direct_goal_first: float = 3_000.0
    direct_goal_next: float = 2_500.0
    direct_caps: tuple = (2_000.0, 2_000.0, 2_000.0, 2_500.0, 2_500.0)

    # --- Sensitivitaeten ---
    # ANNAHME: Intraday-Unterschreitung breacht nicht. Zum Gegentest schaltbar.
    intraday_breach: bool = False
    # ANNAHME: Der DLL stoppt den Tagesverlust exakt. Ueberschiessen in $ hier.
    dll_overshoot: float = 0.0


@dataclass
class DayResult:
    day: int
    pnl: float
    balance: float
    breach_level: float
    tier_minis: int
    dll: Optional[float]
    dll_hit: bool
    dead: bool
    payout: float = 0.0


class Account:
    """Zustandsmaschine fuer ein einzelnes Lucid-Konto."""

    def __init__(self, cfg: Config):
        self.cfg = cfg
        self.balance = cfg.start_balance
        self.max_eod_balance = cfg.start_balance
        self.breach_level = cfg.start_balance - cfg.mll
        self.locked = False
        self.dead = False
        self.days = 0
        self.payouts: List[float] = []          # Brutto-Betraege
        self.cycle_days: List[float] = []       # Tagesergebnisse im laufenden Zyklus
        self.scale_dll = 0.0                    # LucidScale, steigt nur
        self.log: List[DayResult] = []
        self.tier_drops = 0
        self._last_tier = self.tier_minis()

    # ------------------------------------------------------------ Sizing
    def profit(self) -> float:
        return self.balance - self.cfg.start_balance

    def tier_minis(self) -> int:
        """Erlaubte Mini-Kontrakte. Flex skaliert, Direct nicht."""
        if self.cfg.account_type == "direct":
            return self.cfg.max_minis
        p = self.profit()
        if p >= 2_000.0:
            return 4
        if p >= 1_000.0:
            return 3
        return 2

    def current_dll(self) -> Optional[float]:
        if self.cfg.account_type == "flex":
            return self.cfg.flex_dll
        if self.max_eod_balance >= self.cfg.initial_trail_balance:
            self.scale_dll = max(
                self.scale_dll,
                self.cfg.direct_scale_frac * (self.max_eod_balance - self.cfg.start_balance),
            )
            return self.scale_dll
        return self.cfg.direct_dll

    # ------------------------------------------------------------- Tag
    def close_day(self, pnl: float, intraday_low: Optional[float] = None) -> DayResult:
        """Bucht ein Tagesergebnis. intraday_low = tiefster Kontostand im Tag."""
        if self.dead:
            raise RuntimeError("Konto ist bereits gebreacht")

        dll = self.current_dll()
        dll_hit = False
        if dll is not None and pnl < -dll:
            # Soft Breach: Handel wird gesperrt, der Verlust stoppt am DLL
            # (plus optionalem Ueberschiessen).
            pnl = -(dll + self.cfg.dll_overshoot)
            dll_hit = True

        self.balance += pnl
        self.days += 1
        self.cycle_days.append(pnl)

        if self.cfg.intraday_breach and intraday_low is not None:
            if intraday_low <= self.breach_level:
                self.dead = True

        # Breach-Pruefung am Session-Close
        if self.balance <= self.breach_level:
            self.dead = True

        if not self.dead:
            if self.balance > self.max_eod_balance:
                self.max_eod_balance = self.balance
            if not self.locked:
                if self.max_eod_balance >= self.cfg.initial_trail_balance:
                    self.breach_level = self.cfg.locked_breach_level
                    self.locked = True
                else:
                    self.breach_level = self.max_eod_balance - self.cfg.mll

        tier = self.tier_minis()
        if tier < self._last_tier:
            self.tier_drops += 1
        self._last_tier = tier

        r = DayResult(self.days, pnl, self.balance, self.breach_level, tier,
                      dll, dll_hit, self.dead)
        self.log.append(r)
        return r

    # ---------------------------------------------------------- Payout
    def payout_ready(self) -> tuple:
        """Liefert (moeglich: bool, brutto: float, grund: str)."""
        if self.dead:
            return False, 0.0, "gebreacht"
        if len(self.payouts) >= self.cfg.max_payouts:
            return False, 0.0, "5 Payouts erreicht"

        cyc = self.cycle_days
        cycle_profit = sum(cyc)

        if self.cfg.account_type == "flex":
            good_days = sum(1 for x in cyc if x >= self.cfg.flex_min_day_profit)
            if good_days < self.cfg.flex_min_profit_days:
                return False, 0.0, f"nur {good_days} Gewinntage >= 150 $"
            if cycle_profit <= 0:
                return False, 0.0, "Zyklus-Netto nicht positiv"
            amount = min(self.cfg.flex_payout_frac * self.profit(),
                         self.cfg.flex_payout_cap)
            if amount < self.cfg.min_payout:
                return False, 0.0, f"Betrag {amount:.0f} $ unter Mindest-Payout"
            return True, amount, "ok"

        # Direct
        goal = (self.cfg.direct_goal_first if not self.payouts
                else self.cfg.direct_goal_next)
        if cycle_profit < goal:
            return False, 0.0, f"Profit Goal {goal:.0f} $ nicht erreicht"
        best = max([x for x in cyc if x > 0], default=0.0)
        if best > self.cfg.direct_consistency * cycle_profit:
            return False, 0.0, (f"Consistency: bester Tag {best:.0f} $ > "
                                f"{self.cfg.direct_consistency:.0%} von "
                                f"{cycle_profit:.0f} $")
        cap = self.cfg.direct_caps[len(self.payouts)]
        amount = min(cap, cycle_profit)
        if amount < self.cfg.min_payout:
            return False, 0.0, "unter Mindest-Payout"
        return True, amount, "ok"

    def take_payout(self) -> float:
        ok, amount, reason = self.payout_ready()
        if not ok:
            raise RuntimeError(f"Payout nicht moeglich: {reason}")
        self.balance -= amount
        self.payouts.append(amount)
        # Nach dem Request lockt das Breach-Level auf 50.100 $
        self.breach_level = self.cfg.locked_breach_level
        self.locked = True
        self.max_eod_balance = max(self.max_eod_balance, self.balance)
        self.cycle_days = []
        self._last_tier = self.tier_minis()
        return amount

    # ----------------------------------------------------------- Info
    def net_to_trader(self) -> float:
        return sum(self.payouts) * self.cfg.profit_split

    def __repr__(self):
        return (f"<Account {self.cfg.account_type} bal={self.balance:.0f} "
                f"breach={self.breach_level:.0f} payouts={len(self.payouts)} "
                f"{'TOT' if self.dead else 'aktiv'}>")


# ------------------------------------------------------------- Kosten
@dataclass
class Costs:
    """Kosten je Kontrakt und Round Turn, in Dollar."""
    commission_mini: float = 4.00
    commission_micro: float = 1.20
    slippage_ticks: float = 1.0             # gesamt (Ein- und Ausstieg zusammen)
    tick_value_mini: float = 12.50          # ES; NQ = 5.00
    tick_value_micro: float = 1.25          # ES; NQ = 0.50

    def per_mini(self) -> float:
        return self.commission_mini + self.slippage_ticks * self.tick_value_mini

    def per_micro(self) -> float:
        return self.commission_micro + self.slippage_ticks * self.tick_value_micro


COSTS = {
    # tick_value: NQ 0.25 Pkt = 5 $ (Mini) / 0.50 $ (Micro)
    "nq": Costs(4.00, 1.20, 1.0, 5.00, 0.50),
    "es": Costs(4.00, 1.20, 1.0, 12.50, 1.25),
    "ym": Costs(4.00, 1.20, 1.0, 5.00, 0.50),
    "gold": Costs(4.00, 1.20, 1.0, 10.00, 1.00),
    "cl": Costs(4.00, 1.20, 1.0, 10.00, 1.00),
}
