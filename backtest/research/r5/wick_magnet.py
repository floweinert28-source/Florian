"""Runde 13g: "Wick-Magnet". Aus dem Kontrolltest: Tap der Body-Kante einer Kerze MIT Docht -> Fade verliert (46.5 %).
Hypothese: der Preis wird zur Dochtspitze gezogen. Also CONTINUATION statt Fade.
Setup: 15-min-Kerze mit oberem Docht > w x Range. Level = Body-Oberkante (max(O,C)). Wenn der Preis nach Kerzenschluss
das Level von unten erreicht -> LONG (Richtung Dochtspitze). Spiegelbildlich unterer Docht -> SHORT an der Body-Unterkante.
TP-Varianten: Dochtspitze (= Kerzen-Hoch/Tief), 1R, 1.5R. SL: k x Kerzenrange bzw. hinter der Body-Gegenkante.
Kontrolle: dieselbe Logik als Fade (= alte Richtung) und mit wickless-Kerzen.
"""
import sys, math, datetime as dt, statistics
from bisect import bisect_left
from collections import defaultdict
sys.path.insert(0, "/home/user/Florian/backtest")
from sweep_reclaim_backtest import load_days
TF = 15

def prep(DATA):
    days = load_days(DATA); P = {}
    for d in sorted(days):
        if d.weekday() >= 5: continue
        mods, o, c, lo, hi = days[d]
        if len(mods) < 400: continue
        med = statistics.median([hi[i]-lo[i] for i in range(len(mods)) if hi[i] > lo[i]] or [1])
        P[d] = (mods, o, c, lo, hi, len(mods), med)
    return P

def run(P, COST, USD, wmin=0.20, t0=570, t1=950, cont=True, tp_mode="tip", slmul=1.0, maxage=480, minsize=1.0):
    """cont=True: Richtung Dochtspitze. tp_mode: 'tip' | '1R' | '1.5R'."""
    rows = []
    for d in P:
        mods, o, c, lo, hi, n, med = P[d]
        levels = []; i = 0
        while i < n:
            blk = mods[i] // TF; j = i; O = o[i]; H = hi[i]; L = lo[i]
            while j < n and mods[j] // TF == blk:
                H = max(H, hi[j]); L = min(L, lo[j]); j += 1
            C = c[j-1]; em = mods[j-1]; ei = j-1; rng = H - L
            if rng > 0 and rng >= minsize*med and t0 <= em <= t1:
                bh = max(O, C); bl = min(O, C)
                if (H - bh) > wmin*rng:   # oberer Docht -> Level Body-Oberkante, Tap von unten -> Richtung H
                    levels.append((bh, 1 if cont else -1, ei+1, rng, em+maxage, H, "up"))
                if (bl - L) > wmin*rng:
                    levels.append((bl, -1 if cont else 1, ei+1, rng, em+maxage, L, "dn"))
            i = j
        evs = []; used = set()
        for (lvl, dirn, fi, rng, exp, tip, side) in levels:
            k = fi
            while k < n and mods[k] <= exp and mods[k] < 955:
                touched = (hi[k] >= lvl) if side == "up" else (lo[k] <= lvl)
                if touched:
                    key = (round(lvl,3), side)
                    if key not in used: evs.append((k, lvl, dirn, rng, tip, side))
                    used.add(key); break
                k += 1
        evs.sort(); last = -1
        for (i0, lvl, dirn, rng, tip, side) in evs:
            if i0 <= last: continue
            dist = slmul*rng; entry = lvl
            sl = entry - dist if dirn == 1 else entry + dist
            if tp_mode == "tip":
                tp = tip
                if (dirn == 1 and tp <= entry) or (dirn == -1 and tp >= entry): continue
            else:
                mul = 1.0 if tp_mode == "1R" else 1.5
                tp = entry + mul*dist if dirn == 1 else entry - mul*dist
            res = None; pnl = None; j = i0
            if (dirn == 1 and lo[i0] <= sl) or (dirn == -1 and hi[i0] >= sl): res, pnl = -1, -dist
            else:
                j = i0+1
                while j < n and mods[j] < 955:
                    if dirn == 1:
                        if lo[j] <= sl: res, pnl = -1, -dist; break
                        if hi[j] >= tp: res, pnl = 1, tp-entry; break
                    else:
                        if hi[j] >= sl: res, pnl = -1, -dist; break
                        if lo[j] <= tp: res, pnl = 1, entry-tp; break
                    j += 1
                if res is None:
                    j = min(j, n-1); pnl = (c[j]-entry) if dirn == 1 else (entry-c[j]); res = 1 if pnl > 0 else -1
            rows.append((d, res > 0, (pnl-COST)*USD, abs(tp-entry)/dist)); last = j
    return rows

def rep(label, rows, nd, years=False):
    n = len(rows)
    if n < 80: print(f"  {label:44s} zu wenig ({n})"); return
    tr = [r for r in rows if r[0] < dt.date(2025,1,1)]; te = [r for r in rows if r[0] >= dt.date(2025,1,1)]
    wr = sum(r[1] for r in rows)/n*100
    wtr = sum(r[1] for r in tr)/max(1,len(tr))*100; wte = sum(r[1] for r in te)/max(1,len(te))*100
    rr = sum(r[3] for r in rows)/n; se = 100*math.sqrt(0.25/n)
    be = 100/(1+rr)
    extra = ""
    if years:
        py = defaultdict(lambda: [0,0,0.0])
        for d, w, u, _ in rows: py[d.year][0] += 1; py[d.year][1] += w; py[d.year][2] += u
        extra = " | " + " ".join(f"{y}:{v[1]/v[0]*100:.0f}%" for y, v in sorted(py.items()))
    print(f"  {label:44s} N={n:5d} {n/nd:4.2f}/Tag WR {wr:5.1f}%+-{se:.1f} (Tr {wtr:5.1f}/Te {wte:5.1f}) RR1:{rr:.2f} BE {be:.1f}% Netto {sum(r[2] for r in rows):+9,.0f}${extra}", flush=True)

for TAG, DATA, COST, USD in (("NQ", "../../data", 0.75, 20), ("ES", "../../data_es", 0.4, 50), ("YM", "../../data_ym", 2.5, 5)):
    P = prep(DATA); nd = len(P)
    print(f"\n##### {TAG}: Wick-Magnet (Tap Body-Kante -> Richtung Dochtspitze), tf15, RTH ({nd} Tage) #####")
    rep("CONT TP=Dochtspitze SL 1xRange", run(P, COST, USD, cont=True, tp_mode="tip"), nd, years=True)
    rep("FADE TP=1R SL 1xRange (Kontrolle)", run(P, COST, USD, cont=False, tp_mode="1R"), nd)
    rep("CONT TP=1R SL 1xRange", run(P, COST, USD, cont=True, tp_mode="1R"), nd, years=True)
    rep("CONT TP=1.5R SL 1xRange", run(P, COST, USD, cont=True, tp_mode="1.5R"), nd)
    if TAG != "NQ": continue
    print("  --- Docht-Mindestgroesse (CONT, TP Spitze) ---")
    for w in (0.10, 0.20, 0.30, 0.40):
        rep(f"Docht > {w*100:.0f}% der Range", run(P, COST, USD, wmin=w, cont=True, tp_mode="tip"), nd)
    print("  --- SL-Varianten (CONT, TP Spitze, Docht>20%) ---")
    for sl in (0.3, 0.5, 1.0, 1.5):
        rep(f"SL {sl} x Kerzenrange", run(P, COST, USD, cont=True, tp_mode="tip", slmul=sl), nd)
    print("  --- Zeitfenster (CONT, TP Spitze) ---")
    for a, b, nm in ((0,950,"ganzer Tag"),(120,570,"EU/Pre"),(570,780,"09:30-13"),(660,780,"11-13"),(780,950,"13-16")):
        rep(nm, run(P, COST, USD, cont=True, tp_mode="tip", t0=a, t1=b), nd)
