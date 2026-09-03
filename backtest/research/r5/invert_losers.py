"""Runde 13k: Die groessten Verlierer umgedreht.
A) Impulskerze (1-min Range >= k x Median, Body >= 60 %): FADE statt CONTINUATION.
   Entry = Open des Folgebars. Bei Up-Kerze -> SHORT. TP/SL als Anteile der Kerzenrange.
B) Fehl-Reclaim: nach verlorenem Reclaim-Trade Fade statt Continuation.
C) Kontrolle: dieselbe Logik in beide Richtungen, damit die Kosten-Asymmetrie sichtbar wird.
Alle: Entry am Open des Folgebars -> Bewertung ab diesem Bar (kein Look-Ahead-Problem, Entry ist der Bar-Open).
"""
import sys, math, datetime as dt, statistics
from bisect import bisect_left
from collections import defaultdict
sys.path.insert(0, "/home/user/Florian/backtest")
from sweep_reclaim_backtest import load_days

def prep(DATA):
    days = load_days(DATA); P = {}
    for d in sorted(days):
        if d.weekday() >= 5: continue
        mods, o, c, lo, hi = days[d]
        n = len(mods)
        if n < 400: continue
        med = statistics.median([hi[i]-lo[i] for i in range(n) if hi[i] > lo[i]] or [1])
        P[d] = (mods, o, c, lo, hi, n, med)
    return P

def impulse(P, COST, USD, kmult=3.0, tp_frac=0.5, sl_frac=1.0, fade=True, body_min=0.6,
            t0=0, t1=950, max_hold=30):
    """tp_frac / sl_frac als Vielfache der Kerzenrange, gemessen ab Entry."""
    rows = []
    for d in P:
        mods, o, c, lo, hi, n, med = P[d]
        i = 1; last = -1
        while i < n - 2:
            if not (t0 <= mods[i] <= t1): i += 1; continue
            R = hi[i] - lo[i]
            if R < kmult*med or R <= 0 or abs(c[i]-o[i]) < body_min*R: i += 1; continue
            if i <= last: i += 1; continue
            up = c[i] > o[i]
            dirn = (-1 if up else 1) if fade else (1 if up else -1)
            entry = o[i+1]
            tp = entry + dirn*tp_frac*R
            sl = entry - dirn*sl_frac*R
            res = None; pnl = None; j = i+1
            while j < n and mods[j] - mods[i+1] <= max_hold and mods[j] < 955:
                if dirn == 1:
                    if lo[j] <= sl: res, pnl = -1, -(entry-sl); break
                    if hi[j] >= tp: res, pnl = 1, tp-entry; break
                else:
                    if hi[j] >= sl: res, pnl = -1, -(sl-entry); break
                    if lo[j] <= tp: res, pnl = 1, entry-tp; break
                j += 1
            if res is None:
                j = min(j, n-1); pnl = dirn*(c[j]-entry); res = 1 if pnl > 0 else -1
            rows.append((d, res > 0, (pnl-COST)*USD, tp_frac/sl_frac))
            last = j; i = j + 1
    return rows

def rep(label, rows, nd, minn=200):
    n = len(rows)
    if n < minn: print(f"  {label:46s} zu wenig ({n})"); return
    tr = [r for r in rows if r[0] < dt.date(2025,1,1)]; te = [r for r in rows if r[0] >= dt.date(2025,1,1)]
    wr = sum(r[1] for r in rows)/n*100
    wtr = sum(r[1] for r in tr)/max(1,len(tr))*100; wte = sum(r[1] for r in te)/max(1,len(te))*100
    net = sum(r[2] for r in rows); rr = rows[0][3]; be = 100/(1+rr); se = 100*math.sqrt(0.25/n)
    py = defaultdict(lambda: [0,0])
    for dd, w, u, _ in rows: py[dd.year][0] += 1; py[dd.year][1] += u
    yrs = " ".join(f"{y}:{v[1]/1000:+.0f}k" for y, v in sorted(py.items()))
    print(f"  {label:46s} N={n:6d} {n/nd:5.2f}/Tag WR {wr:5.1f}%+-{se:.1f} (Tr {wtr:5.1f}/Te {wte:5.1f}) RR1:{rr:.2f} BE {be:.1f}% {net/n:+7.1f}$/Tr Netto {net:+10,.0f}$ | {yrs}", flush=True)

for TAG, DATA, COST, USD in (("NQ", "../../data", 0.75, 20), ("ES", "../../data_es", 0.4, 50), ("YM", "../../data_ym", 2.5, 5)):
    P = prep(DATA); nd = len(P)
    print(f"\n##### {TAG}: Impulskerzen-FADE (umgedrehte Verliererstrategie), {nd} Tage #####")
    for kmult in (3.0, 4.0):
        for tp, sl in ((0.5, 1.0), (1.0, 1.0), (1.0, 0.5), (2.0, 1.0)):
            rep(f"FADE k={kmult} TP {tp}xR SL {sl}xR", impulse(P, COST, USD, kmult, tp, sl, fade=True), nd)
    if TAG == "NQ":
        print("  --- Gegenprobe: dieselben Parameter als CONTINUATION ---")
        for kmult in (3.0,):
            for tp, sl in ((0.5, 1.0), (1.0, 1.0), (1.0, 0.5), (2.0, 1.0)):
                rep(f"CONT k={kmult} TP {tp}xR SL {sl}xR", impulse(P, COST, USD, kmult, tp, sl, fade=False), nd)
        print("  --- FADE k=3 TP1 SL1: Zeitfenster ---")
        for a, b, nm in ((570,950,"RTH"),(120,570,"EU/Pre"),(0,950,"ganzer Tag"),(660,780,"11-13")):
            rep(nm, impulse(P, COST, USD, 3.0, 1.0, 1.0, fade=True, t0=a, t1=b), nd)
        print("  --- FADE k=3 TP1 SL1: Haltedauer ---")
        for mh in (10, 30, 60, 240):
            rep(f"max {mh} min", impulse(P, COST, USD, 3.0, 1.0, 1.0, fade=True, max_hold=mh), nd)
        print("  --- FADE: Kosten x2 / x4 ---")
        rep("Kosten x2", impulse(P, 1.5, USD, 3.0, 1.0, 1.0, fade=True), nd)
        rep("Kosten x4", impulse(P, 3.0, USD, 3.0, 1.0, 1.0, fade=True), nd)
