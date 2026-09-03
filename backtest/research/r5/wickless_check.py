"""Runde 13d: Wickless-Rejection - korrigierte P&L (EOD-Exit zum Restwert), gezielte Pruefung der starken Slices.
Vergleicht: nur erster Tap pro Level vs alle Taps; Signal-Kerze im Fenster vs Tap im Fenster; tf 5/15; NQ vs ES vs YM.
"""
import sys, math, datetime as dt, statistics
from bisect import bisect_left
sys.path.insert(0, "/home/user/Florian/backtest")
from sweep_reclaim_backtest import load_days

def prep(DATA):
    days = load_days(DATA)
    P = {}
    for d in sorted(days):
        if d.weekday() >= 5: continue
        mods, o, c, lo, hi = days[d]
        if len(mods) < 400: continue
        med = statistics.median([hi[i]-lo[i] for i in range(len(mods)) if hi[i] > lo[i]] or [1])
        P[d] = (mods, o, c, lo, hi, len(mods), med)
    return P

def scan(P, TF, tol, minsize, maxage, first_only, win, slmul, tpmul, COST, USD):
    t0, t1 = win
    rows = []
    for d in P:
        mods, o, c, lo, hi, n, med = P[d]
        levels = []
        i = 0
        while i < n:
            blk = mods[i] // TF; j = i; O = o[i]; H = hi[i]; L = lo[i]
            while j < n and mods[j] // TF == blk:
                H = max(H, hi[j]); L = min(L, lo[j]); j += 1
            C = c[j-1]; em = mods[j-1]; ei = j-1; rng = H - L
            if rng > 0 and rng >= minsize*med and t0 <= em <= t1:
                bh = max(O, C); bl = min(O, C)
                if H - bh <= tol*rng: levels.append((H, -1, ei+1, rng, em+maxage))
                if bl - L <= tol*rng: levels.append((L, 1, ei+1, rng, em+maxage))
            i = j
        evs = []; used = set()
        for (lvl, dirn, fi, rng, exp) in levels:
            k = fi
            while k < n and mods[k] <= exp and mods[k] < 955:
                if (dirn == -1 and hi[k] >= lvl) or (dirn == 1 and lo[k] <= lvl):
                    key = (round(lvl, 3), dirn)
                    if not (first_only and key in used): evs.append((k, lvl, dirn, rng))
                    used.add(key); break
                k += 1
        evs.sort(); last = -1
        for (i0, lvl, dirn, rng) in evs:
            if i0 <= last: continue
            dist = slmul*rng
            if dist <= 0: continue
            entry = lvl
            sl = entry - dist if dirn == 1 else entry + dist
            tp = entry + tpmul*dist if dirn == 1 else entry - tpmul*dist
            res = None; pnl = None; j = i0
            if (dirn == 1 and lo[i0] <= sl) or (dirn == -1 and hi[i0] >= sl): res, pnl = -1, -dist
            else:
                j = i0 + 1
                while j < n and mods[j] < 955:
                    if dirn == 1:
                        if lo[j] <= sl: res, pnl = -1, -dist; break
                        if hi[j] >= tp: res, pnl = 1, tpmul*dist; break
                    else:
                        if hi[j] >= sl: res, pnl = -1, -dist; break
                        if lo[j] <= tp: res, pnl = 1, tpmul*dist; break
                    j += 1
                if res is None:
                    j = min(j, n-1)
                    pnl = (c[j]-entry) if dirn == 1 else (entry-c[j])   # EOD zum Restwert
                    res = 1 if pnl > 0 else -1
            rows.append((d, res > 0, (pnl - COST)*USD))
            last = j
    return rows

def rep(label, rows, ndays):
    n = len(rows)
    if n < 100: print(f"  {label:52s} zu wenig ({n})"); return
    tr = [r for r in rows if r[0] < dt.date(2025,1,1)]; te = [r for r in rows if r[0] >= dt.date(2025,1,1)]
    wr = sum(r[1] for r in rows)/n*100
    wtr = sum(r[1] for r in tr)/max(1,len(tr))*100; wte = sum(r[1] for r in te)/max(1,len(te))*100
    net = sum(r[2] for r in rows)
    print(f"  {label:52s} N={n:5d} {n/ndays:4.2f}/Tag WR {wr:5.1f}% (Tr {wtr:5.1f} / Te {wte:5.1f}) Netto {net:+9,.0f}$", flush=True)

WINS = {"ALL": (0, 950), "RTH": (570, 950), "MORN": (570, 780)}
for TAG, DATA, COST, USD in (("NQ", "../../data", 0.75, 20), ("ES", "../../data_es", 0.4, 50)):
    P = prep(DATA); nd = len(P)
    print(f"##### {TAG} ({nd} Tage), korrigierte P&L #####")
    for TF in (15, 5):
        for tol in (0.0, 0.02):
            for first_only in (True, False):
                for wname, win in WINS.items():
                    rep(f"tf{TF} tol{tol} {'ersterTap' if first_only else 'alleTaps'} {wname} SL1xR TP1R",
                        scan(P, TF, tol, 1.0, 480, first_only, win, 1.0, 1.0, COST, USD), nd)
