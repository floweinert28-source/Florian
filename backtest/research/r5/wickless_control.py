"""Runde 13f: Entscheidender Kontrolltest.
Frage: Liegt der Effekt am fehlenden Docht - oder nur am Zeitfenster 11-13 Uhr?
Vergleich im selben Fenster, gleiche Trade-Logik (Limit am Level, SL 1x Kerzenrange, TP 1R):
  A) WICKLESS  : 15-min-Kerze ohne Docht (tol) -> Tap des Extrems
  B) MIT DOCHT : Kerze mit Docht > 20 % der Range -> Tap desselben Extrems
  C) ALLE      : jede 15-min-Kerze -> Tap des Extrems
  D) BODY      : Tap der Body-Kante (Open/Close) statt des Extrems, Kerzen mit Docht
Zusaetzlich: Stunden-Nachbarschaft, Jahresaufteilung, ES/YM.
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

def run(P, mode, tol, t0, t1, COST, USD, slmul=1.0, tpmul=1.0, minsize=1.0, maxage=480):
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
                bh = max(O, C); bl = min(O, C); uw = H - bh; dw = bl - L
                if mode == "WICKLESS":
                    if uw <= tol*rng: levels.append((H, -1, ei+1, rng, em+maxage))
                    if dw <= tol*rng: levels.append((L, 1, ei+1, rng, em+maxage))
                elif mode == "WICKED":
                    if uw > 0.20*rng: levels.append((H, -1, ei+1, rng, em+maxage))
                    if dw > 0.20*rng: levels.append((L, 1, ei+1, rng, em+maxage))
                elif mode == "ALLE":
                    levels.append((H, -1, ei+1, rng, em+maxage)); levels.append((L, 1, ei+1, rng, em+maxage))
                elif mode == "BODY":
                    if uw > 0.20*rng: levels.append((bh, -1, ei+1, rng, em+maxage))
                    if dw > 0.20*rng: levels.append((bl, 1, ei+1, rng, em+maxage))
            i = j
        evs = []; used = set()
        for (lvl, dirn, fi, rng, exp) in levels:
            k = fi
            while k < n and mods[k] <= exp and mods[k] < 955:
                if (dirn == -1 and hi[k] >= lvl) or (dirn == 1 and lo[k] <= lvl):
                    key = (round(lvl,3), dirn)
                    if key not in used: evs.append((k, lvl, dirn, rng))
                    used.add(key); break
                k += 1
        evs.sort(); last = -1
        for (i0, lvl, dirn, rng) in evs:
            if i0 <= last: continue
            dist = slmul*rng; entry = lvl
            sl = entry - dist if dirn == 1 else entry + dist
            tp = entry + tpmul*dist if dirn == 1 else entry - tpmul*dist
            res = None; pnl = None; j = i0
            if (dirn == 1 and lo[i0] <= sl) or (dirn == -1 and hi[i0] >= sl): res, pnl = -1, -dist
            else:
                j = i0+1
                while j < n and mods[j] < 955:
                    if dirn == 1:
                        if lo[j] <= sl: res, pnl = -1, -dist; break
                        if hi[j] >= tp: res, pnl = 1, tpmul*dist; break
                    else:
                        if hi[j] >= sl: res, pnl = -1, -dist; break
                        if lo[j] <= tp: res, pnl = 1, tpmul*dist; break
                    j += 1
                if res is None:
                    j = min(j, n-1); pnl = (c[j]-entry) if dirn == 1 else (entry-c[j]); res = 1 if pnl > 0 else -1
            rows.append((d, res > 0, (pnl-COST)*USD)); last = j
    return rows

def rep(label, rows, nd, years=False):
    n = len(rows)
    if n < 80: print(f"  {label:40s} zu wenig ({n})"); return
    tr = [r for r in rows if r[0] < dt.date(2025,1,1)]; te = [r for r in rows if r[0] >= dt.date(2025,1,1)]
    wr = sum(r[1] for r in rows)/n*100
    wtr = sum(r[1] for r in tr)/max(1,len(tr))*100; wte = sum(r[1] for r in te)/max(1,len(te))*100
    se = 100*math.sqrt(0.25/n)
    extra = ""
    if years:
        py = defaultdict(lambda: [0,0])
        for d, w, u in rows: py[d.year][0] += 1; py[d.year][1] += w
        extra = " | " + " ".join(f"{y}:{v[1]/v[0]*100:.0f}%({v[0]})" for y, v in sorted(py.items()))
    print(f"  {label:40s} N={n:5d} {n/nd:4.2f}/Tag WR {wr:5.1f}%+-{se:.1f} (Tr {wtr:5.1f}/Te {wte:5.1f}) Netto {sum(r[2] for r in rows):+9,.0f}${extra}", flush=True)

for TAG, DATA, COST, USD in (("NQ", "../../data", 0.75, 20), ("ES", "../../data_es", 0.4, 50), ("YM", "../../data_ym", 2.5, 5)):
    P = prep(DATA); nd = len(P)
    print(f"\n##### {TAG}: Kontrolltest Fenster 11:00-13:00 NY, tf15, SL 1xRange, TP 1R ({nd} Tage) #####")
    for mode in ("WICKLESS", "WICKED", "ALLE", "BODY"):
        for tol in ((0.0, 0.02) if mode == "WICKLESS" else (0.0,)):
            lab = f"{mode}" + (f" tol{tol}" if mode == "WICKLESS" else "")
            rep(lab, run(P, mode, tol, 660, 780, COST, USD), nd, years=(mode == "WICKLESS"))
    if TAG != "NQ": continue
    print("  --- Stunden-Nachbarschaft (WICKLESS tol0.02) ---")
    for a, b in ((540,660),(600,720),(630,750),(660,780),(690,810),(720,840),(660,840),(570,950)):
        rep(f"{a//60:02d}:{a%60:02d}-{b//60:02d}:{b%60:02d}", run(P, "WICKLESS", 0.02, a, b, COST, USD), nd)
    print("  --- Kontrolle im selben Fenster, andere Toleranzen ---")
    for tol in (0.05, 0.10, 0.15):
        rep(f"WICKLESS tol{tol} 11-13", run(P, "WICKLESS", tol, 660, 780, COST, USD), nd)
