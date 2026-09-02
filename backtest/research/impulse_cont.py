"""Impulskerzen-Continuation: 1-min-Kerze mit Range >= k x Median-Range (Tag) und Body >= 60%.
Entry = Open des naechsten Bars (Market nach Close), TP = Kerzen-Extrem + ext*R, SL = 50%-Retrace der Kerze.
Nur RTH 09:30-15:30, max. 1 Trade gleichzeitig. Kosten/USD per Argument. Train <2025 / Test >=2025.
"""
import sys, datetime as dt, statistics
from collections import defaultdict
sys.path.insert(0, "/home/user/Florian/backtest")
from sweep_reclaim_backtest import load_days
DATA = sys.argv[1]; COST = float(sys.argv[2]); USD = float(sys.argv[3])
days = load_days(DATA)

def run(kmult, ext, sl_frac, t_lo=570, t_hi=930, max_hold=30):
    trades = []
    for d in sorted(days):
        if d.weekday() >= 5: continue
        mods, o, c, lo, hi = days[d]; n = len(mods)
        live = [hi[i]-lo[i] for i in range(n) if hi[i] != lo[i]]
        if len(live) < 500: continue
        med = statistics.median(live)
        i = 0
        while i < n - 2:
            if not (t_lo <= mods[i] < t_hi): i += 1; continue
            R = hi[i] - lo[i]
            if R < kmult * med or R == 0 or abs(c[i]-o[i]) < 0.6 * R: i += 1; continue
            up = c[i] > o[i]
            entry = o[i+1]
            if up:
                tp = hi[i] + ext * R; sl = lo[i] + sl_frac * R
                if not (sl < entry < tp): i += 1; continue
            else:
                tp = lo[i] - ext * R; sl = hi[i] - sl_frac * R
                if not (tp < entry < sl): i += 1; continue
            res = None; k = i + 1
            while k < n and mods[k] - mods[i+1] <= max_hold:
                if up:
                    if lo[k] <= sl: res = -(entry - sl); break
                    if hi[k] >= tp: res = tp - entry; break
                else:
                    if hi[k] >= sl: res = -(sl - entry); break
                    if lo[k] <= tp: res = entry - tp; break
                k += 1
            if res is None:
                k = min(k, n-1); res = (c[k] - entry) if up else (entry - c[k])
            trades.append(dict(day=d, pts=res, sld=abs(entry-sl), tpd=abs(tp-entry)))
            i = k + 1
    return trades

def rep(label, trades):
    if len(trades) < 100: print(f"{label}: zu wenig ({len(trades)})"); return
    net = lambda ts: sum((t["pts"] - COST) * USD for t in ts)
    tr = [t for t in trades if t["day"] < dt.date(2025,1,1)]; te = [t for t in trades if t["day"] >= dt.date(2025,1,1)]
    wr = sum(1 for t in trades if t["pts"] > 0) / len(trades) * 100
    rr = sum(t["tpd"]/t["sld"] for t in trades) / len(trades)
    print(f"{label}: N={len(trades)} WR={wr:.1f}% RR=1:{rr:.2f} | Netto {net(trades):+,.0f}$ | Train {net(tr):+,.0f}$ | Test {net(te):+,.0f}$ | Ø {net(trades)/len(trades):+.0f}$")

for kmult in (3, 4):
    for ext in (0.0, 0.25, 0.5):
        for slf in (0.5, 0.0):
            rep(f"k={kmult} ext={ext} sl={slf}", run(kmult, ext, slf))
