import sys, random, datetime as dt
sys.path.insert(0, "/home/user/Florian/backtest/propfirm")
from prop_eval_all import STRATS, to_daily, sim, size, USD_MICRO
random.seed(9); N = 12000; fee = 136.0
TOP = ["Kompressions-Fade 08:12 (ON/W>=3), RR1:1", "London 02-05 Sweep+Reclaim TP 1R", "OTE 08:12 TP mid",
       "Gap>=0.3ATR + OR15 Fade -> PDC", "Midday 11:12 Fade, TP 0.25W, SL 1W (RR1:0.25)", "Zone 08:12-09:12 Fade, TP Gegenseite, SL 1.5W",
       "Zone 05:24-05:39 Fade RR1:1", "Zone 08:12-09:12 Fade, TP Gegenseite, SL 1W (RR1:1)"]
def roi(vals, model, breach):
    def day_fn(rng, st): return [rng.choice(vals)]
    res = [sim(day_fn, fee, model, breach) for _ in range(N)]
    e = sum(r["payouts"] for r in res) / N
    return (e - fee) / fee * 100
print(f"{'Strategie':50s} | Flex ROI: alle / Train / Test / FairValue | Daily ROI: alle / Train / Test / FairValue")
for name in TOP:
    daily = to_daily(STRATS[name]())
    allv = list(daily.values())
    tr = [v for d, v in daily.items() if d < dt.date(2025,1,1)]; te = [v for d, v in daily.items() if d >= dt.date(2025,1,1)]
    m = sum(allv)/len(allv); fv = [v - m for v in allv]
    f = [roi(allv, "flex", "eod"), roi(tr, "flex", "eod"), roi(te, "flex", "eod"), roi(fv, "flex", "eod")]
    dd = [roi(allv, "daily", "intraday"), roi(tr, "daily", "intraday"), roi(te, "daily", "intraday"), roi(fv, "daily", "intraday")]
    print(f"{name[:50]:50s} | {f[0]:+5.0f} / {f[1]:+5.0f} / {f[2]:+5.0f} / {f[3]:+5.0f} | {dd[0]:+5.0f} / {dd[1]:+5.0f} / {dd[2]:+5.0f} / {dd[3]:+5.0f}   (Ø$/Tag {m:+.0f}, Train {len(tr)}, Test {len(te)})", flush=True)
