"""Diagnose: stimmt der Simulator mit der analytischen Gambler's-Ruin-Loesung?

Steady State nach dem ersten Payout: Kontostand 52.000, Breach 50.100.
Schritt +-280 $/Tag, driftlos. Ziel 54.000 (+2.000), Barriere 50.100 (-1.900).
Analytisch: P(Ziel vor Barriere) = 1900/3900 = 48.7 %.
"""
import sys, os, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sim import Config, Account
from strategies import coinflip, to_daily
import datetime as dt

DATES = [dt.date(2024,1,1)+dt.timedelta(days=i) for i in range(600)]
pool = list(to_daily(coinflip(DATES, 1, 20.0, 0.50, 7)).values())
MICROS, MICRO_USD, COST = 7, 2.0, 1.70

def step_pnl(rng):
    d = rng.choice(pool)
    return sum(r*s*MICRO_USD*MICROS for r, s in d) - COST*MICROS*len(d)

# --- A: reiner Random Walk mit den gleichen Barrieren, ohne Simulator
rng = random.Random(3)
wins = deaths = 0
for _ in range(20000):
    bal = 52_000.0
    while True:
        bal += step_pnl(rng)
        if bal <= 50_100: deaths += 1; break
        if bal >= 54_000: wins += 1; break
print(f"A) Reiner Walk 52.000 -> 54.000 vs 50.100: {wins/(wins+deaths)*100:.1f}% "
      f"(analytisch 48.7 %)")

# --- B: derselbe Zyklus im Simulator (Konto startet im Steady State)
rng = random.Random(3)
wins = deaths = other = 0
bal_at_payout = []
for _ in range(20000):
    cfg = Config("flex")
    a = Account(cfg)
    # Steady State kuenstlich herstellen
    a.balance = 52_000.0
    a.max_eod_balance = 54_000.0
    a.breach_level = 50_100.0
    a.locked = True
    a.payouts = [2_000.0]
    a.cycle_days = []
    done = False
    for _ in range(2000):
        a.close_day(step_pnl(rng))
        if a.dead: deaths += 1; done = True; break
        ok, amt, why = a.payout_ready()
        if ok and amt >= cfg.flex_payout_cap - 1e-9:
            wins += 1; bal_at_payout.append(a.balance); done = True; break
    if not done: other += 1
print(f"B) Simulator, gleicher Zyklus:        {wins/(wins+deaths)*100:.1f}% "
      f"(Timeouts {other})")
if bal_at_payout:
    print(f"   Kontostand beim Payout-Trigger: Median "
          f"{sorted(bal_at_payout)[len(bal_at_payout)//2]:.0f}, "
          f"min {min(bal_at_payout):.0f}, max {max(bal_at_payout):.0f}")

# --- C: Erster Zyklus ab Werk (50.000, trailende Barriere)
rng = random.Random(3)
wins = deaths = other = 0
for _ in range(20000):
    cfg = Config("flex")
    a = Account(cfg)
    done = False
    for _ in range(2000):
        a.close_day(step_pnl(rng))
        if a.dead: deaths += 1; done = True; break
        ok, amt, why = a.payout_ready()
        if ok and amt >= cfg.flex_payout_cap - 1e-9:
            wins += 1; done = True; break
    if not done: other += 1
print(f"C) Erster Zyklus 50.000 -> 54.000, trailende Barriere: "
      f"{wins/(wins+deaths)*100:.1f}% (Timeouts {other})")
