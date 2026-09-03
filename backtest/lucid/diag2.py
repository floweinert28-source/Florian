import sys, os, datetime as dt
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sim import Config
from mc import run_mc
from strategies import coinflip, to_daily
DATES=[dt.date(2024,1,1)+dt.timedelta(days=i) for i in range(600)]
def pool(wp): return list(to_daily(coinflip(DATES,1,20.0,wp,7)).values())
for wp in (0.50, 0.52):
    for md in (500, 2000):
        r = run_mc(pool(wp), Config("flex"), "nq", 300.0, "full", n=5000, seed=11, max_days=md)
        d=r["dist"]
        print(f"WR {wp:.0%} max_days={md:4d}  dist=" + " ".join(f"{d[k]*100:5.1f}" for k in range(6)))
        print(f"   Uebergaenge: " + "  ".join(f"{k}:{v*100:.1f}%" for k,v in r["cond"].items()))
        print(f"   P(tot)={r['p_dead']*100:.1f}%  Median Tage bis P1={r['median_days_p1']}  bis P5={r['median_days_p5']}")
