"""Mikrostruktur nach Uhrzeit (15-min-Fenster), NQ/ES.
(1) Fortsetzungsquote nach 5-min-Move: Vorzeichen der naechsten 5 min == Vorzeichen der letzten 5 min?
(2) Impulskerze (1-min Range >= 3x Median-Range des Fensters, Body >= 60%): Quote, dass 50% der Kerze
    innerhalb 15 min zurueckgeholt werden, bevor das Kerzen-Extrem erweitert wird (Fade-Chance).
(3) Fenster-Hoch/-Tief-Rueckeroberung: Wird das Hoch der letzten 15 min in den naechsten 30 min gehandelt?
Alles Train (<2025) vs Test (>=2025), nur Handelstage, nur Live-Bars (High!=Low).
"""
import sys, datetime as dt, statistics
from collections import defaultdict
sys.path.insert(0, "/home/user/Florian/backtest")
from sweep_reclaim_backtest import load_days
DATA = sys.argv[1]
days = load_days(DATA)
cont = defaultdict(lambda: [0,0,0,0])   # win -> [train_same, train_n, test_same, test_n]
imp = defaultdict(lambda: [0,0,0,0])
for d in sorted(days):
    if d.weekday() >= 5: continue
    mods, o, c, lo, hi = days[d]
    n = len(mods)
    if n < 600: continue
    live = [i for i in range(n) if hi[i] != lo[i]]
    if len(live) < 500: continue
    is_test = d >= dt.date(2025,1,1)
    med_rng = statistics.median(hi[i]-lo[i] for i in live)
    idx = {mods[i]: i for i in range(n)}
    # (1) Momentum vs Mean-Reversion: Move t-5..t vs t..t+5
    for t in range(10, 1430, 5):
        if t not in idx or (t-5) not in idx or (t+5) not in idx: continue
        i0, i1, i2 = idx[t-5], idx[t], idx[t+5]
        m1 = c[i1] - c[i0]; m2 = c[i2] - c[i1]
        if m1 == 0 or m2 == 0: continue
        w = (t // 15) * 15
        k = 2 if is_test else 0
        cont[w][k] += 1 if (m1 > 0) == (m2 > 0) else 0
        cont[w][k+1] += 1
    # (2) Impulskerzen-Fade
    for i in range(1, n - 16):
        r = hi[i] - lo[i]
        if r < 3 * med_rng or r == 0: continue
        body = abs(c[i] - o[i])
        if body < 0.6 * r: continue
        up = c[i] > o[i]
        mid = o[i] + (c[i]-o[i]) * 0.5
        ok = None
        for k in range(i+1, min(n, i+16)):
            if mods[k] - mods[i] > 15: break
            if up:
                if hi[k] > hi[i]: ok = False; break
                if lo[k] <= mid: ok = True; break
            else:
                if lo[k] < lo[i]: ok = False; break
                if hi[k] >= mid: ok = True; break
        if ok is None: continue
        w = (mods[i] // 15) * 15
        kk = 2 if is_test else 0
        imp[w][kk] += 1 if ok else 0
        imp[w][kk+1] += 1

print("Fenster | (1) Fortsetzung 5min: Train% (n) / Test% (n) | (2) Impuls-50%-Retrace vor Extremerweiterung: Train% (n) / Test% (n)")
for w in sorted(set(cont) | set(imp)):
    a = cont[w]; b = imp[w]
    def pct(x, y): return f"{x/y*100:5.1f}% ({y:5d})" if y else "   n/a       "
    print(f"{w//60:02d}:{w%60:02d}  | {pct(a[0],a[1])} / {pct(a[2],a[3])} | {pct(b[0],b[1])} / {pct(b[2],b[3])}")
