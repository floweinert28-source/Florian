"""Alle Strategien durch LucidDirect-Regeln (Bootstrap echter NQ-Trades). Sizing auf Ziel-Risiko R (Micros)."""
import sys, random, datetime as dt
sys.path.insert(0, "/home/user/Florian/backtest/propfirm")
import prop_eval_all as P
from lucid_direct_mc import sim_direct
random.seed(17); N = int(sys.argv[1]) if len(sys.argv) > 1 else 12000
RISK = float(sys.argv[2]) if len(sys.argv) > 2 else 600.0
P.TARGET_RISK = RISK
def roi(vals, fee):
    def day_fn(rng, st): return [rng.choice(vals)]
    res = [sim_direct(day_fn, fee) for _ in range(N)]
    e = sum(r["payouts"] for r in res) / N
    return e, sum(1 for r in res if r["payouts"] > 0) / N * 100
print(f"Ziel-Risiko {RISK:.0f}$ | {'Strategie':56s} | E[$] / >=1Pay | ROI@312 | ROI@520 | Train-ROI@312 | FairValue-ROI@312")
rows = []
for name, fn in P.STRATS.items():
    daily = P.to_daily(fn())
    if len(daily) < 100: continue
    allv = list(daily.values()); m = sum(allv) / len(allv)
    tr = [v for d, v in daily.items() if d < dt.date(2025, 1, 1)]; fv = [v - m for v in allv]
    e, a = roi(allv, 312.0); etr, _ = roi(tr, 312.0); efv, _ = roi(fv, 312.0)
    rows.append((name, e, a, (e-312)/312*100, (e-520)/520*100, (etr-312)/312*100, (efv-312)/312*100))
    r = rows[-1]
    print(f"{'':16s}| {r[0][:56]:56s} | {r[1]:5.0f} / {r[2]:4.1f}% | {r[3]:+5.0f}% | {r[4]:+5.0f}% | {r[5]:+5.0f}% | {r[6]:+5.0f}%", flush=True)
print("\n=== Ranking nach Fair-Value-ROI@312 ===")
for r in sorted(rows, key=lambda x: -x[6]):
    print(f"  FV {r[6]:+5.0f}% | gesamt {r[3]:+5.0f}% | Train {r[5]:+5.0f}% | {r[0]}")
