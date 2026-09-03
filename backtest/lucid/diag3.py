import sys, os, datetime as dt, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from strategies import coinflip, to_daily
DATES=[dt.date(2024,1,1)+dt.timedelta(days=i) for i in range(600)]
for wp in (0.50, 0.52, 0.55):
    tr = coinflip(DATES,1,20.0,wp,7)
    w = sum(1 for _,r,_ in tr if r>0)
    print(f"angefordert {wp:.0%} -> im Pool realisiert {w/len(tr)*100:.2f}%  (N={len(tr)})")
    pool = list(to_daily(tr).values())
    # empirischer Steady-State-Zyklus
    rng = random.Random(3); wins=deaths=0
    for _ in range(20000):
        bal=52_000.0
        while True:
            d=rng.choice(pool)
            bal += sum(r*s*2.0*7 for r,s in d) - 1.70*7*len(d)
            if bal<=50_100: deaths+=1; break
            if bal>=54_000: wins+=1; break
    print(f"    Steady-State-Zyklus 52.000->54.000 vs 50.100: {wins/(wins+deaths)*100:.1f}%")
