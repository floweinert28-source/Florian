"""Runde 13j: Wickless-Zone MIT Bestaetigungskerze.
Ablauf: 15-min-Kerze ohne (bzw. mit kleinem) Docht -> Zone = Extrem -> Preis tappt die Zone ->
danach warten auf Bestaetigung (max K Bars). Entry am CLOSE der Bestaetigungskerze (kein Look-Ahead,
Bewertung ab dem Folgebar). SL hinter dem Extrem, das seit dem Tap erreicht wurde, + Puffer. TP = x R.

Bestaetigungs-Modi:
  rej1   : 1-min-Close wieder jenseits des Levels (zurueck in Handelsrichtung)
  body   : wie rej1, zusaetzlich Kerzenkoerper >= 50 % der Kerzenrange
  two    : zwei aufeinanderfolgende 1-min-Closes in Handelsrichtung
  mss    : Close unter dem Tief (Short) bzw. ueber dem Hoch (Long) des Tap-Bars
  tf5    : erster 5-min-Close jenseits des Levels
Kontrolle: gleiche Logik mit Kerzen MIT Docht (>20 %).
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

def run(P, COST, USD, mode="rej1", tol=0.02, wicked=False, K=10, buf=0.1, tpmul=1.0,
        t0=570, t1=950, maxage=480, minsize=1.0, sl_mode="extreme"):
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
                bh = max(O, C); bl = min(O, C); uw = (H-bh)/rng; dw = (bl-L)/rng
                if (uw > 0.20 if wicked else uw <= tol): levels.append((H, -1, ei+1, rng, em+maxage, "up"))
                if (dw > 0.20 if wicked else dw <= tol): levels.append((L, 1, ei+1, rng, em+maxage, "dn"))
            i = j
        evs = []; used = set()
        for (lvl, dirn, fi, rng, exp, side) in levels:
            k = fi
            while k < n and mods[k] <= exp and mods[k] < 950:
                if (hi[k] >= lvl) if side == "up" else (lo[k] <= lvl):
                    key = (round(lvl,3), side)
                    if key not in used: evs.append((k, lvl, dirn, rng))
                    used.add(key); break
                k += 1
        evs.sort(); last = -1
        for (i0, lvl, dirn, rng) in evs:
            if i0 <= last: continue
            ext = hi[i0] if dirn == -1 else lo[i0]
            ci = None; run_dir = 0
            for k in range(i0, min(n, i0+K+1)):
                if mods[k] >= 952: break
                ext = max(ext, hi[k]) if dirn == -1 else min(ext, lo[k])
                ok = False
                if mode == "rej1":
                    ok = (c[k] < lvl) if dirn == -1 else (c[k] > lvl)
                elif mode == "body":
                    body = abs(c[k]-o[k]); r = hi[k]-lo[k]
                    ok = ((c[k] < lvl) if dirn == -1 else (c[k] > lvl)) and r > 0 and body >= 0.5*r \
                         and ((c[k] < o[k]) if dirn == -1 else (c[k] > o[k]))
                elif mode == "two":
                    good = (c[k] < o[k]) if dirn == -1 else (c[k] > o[k])
                    run_dir = run_dir + 1 if good else 0
                    ok = run_dir >= 2 and ((c[k] < lvl) if dirn == -1 else (c[k] > lvl))
                elif mode == "mss":
                    ok = (c[k] < lo[i0]) if dirn == -1 else (c[k] > hi[i0])
                elif mode == "tf5":
                    ok = (mods[k] % 5 == 4) and ((c[k] < lvl) if dirn == -1 else (c[k] > lvl))
                if ok and k > i0 - 1: ci = k; break
            if ci is None: continue
            entry = c[ci]
            if sl_mode == "extreme":
                sl = ext + buf*rng if dirn == -1 else ext - buf*rng
            else:
                sl = entry + rng if dirn == -1 else entry - rng
            dist = abs(entry - sl)
            if dist <= 0 or dist > 3*rng: continue
            tp = entry - tpmul*dist if dirn == -1 else entry + tpmul*dist
            res = None; pnl = None; j = ci+1
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
            rows.append((d, res > 0, (pnl-COST)*USD, dist)); last = j
    return rows

def rep(label, rows, nd, minn=150):
    n = len(rows)
    if n < minn: print(f"  {label:46s} zu wenig ({n})"); return
    tr = [r for r in rows if r[0] < dt.date(2025,1,1)]; te = [r for r in rows if r[0] >= dt.date(2025,1,1)]
    wr = sum(r[1] for r in rows)/n*100
    wtr = sum(r[1] for r in tr)/max(1,len(tr))*100; wte = sum(r[1] for r in te)/max(1,len(te))*100
    net = sum(r[2] for r in rows); se = 100*math.sqrt(0.25/n); mdist = sorted(r[3] for r in rows)[n//2]
    print(f"  {label:46s} N={n:5d} {n/nd:5.2f}/Tag WR {wr:5.1f}%+-{se:.1f} (Tr {wtr:5.1f}/Te {wte:5.1f}) {net/n:+6.1f}$/Tr SL~{mdist:.1f}Pkt Netto {net:+9,.0f}$", flush=True)

PN = prep("../../data"); nd = len(PN)
print(f"##### NQ: Wickless-Zone MIT Bestaetigung, tf15, RTH ({nd} Tage) #####")
print("--- Bestaetigungs-Modus (tol 0.02, SL hinter Extrem +0.1xRange, TP 1R) ---")
for mode in ("rej1", "body", "two", "mss", "tf5"):
    rep(f"{mode}", run(PN, 0.75, 20, mode=mode), nd)
print("--- Kontrolle: gleiche Logik mit Docht-Kerzen (>20%) ---")
for mode in ("rej1", "body", "two", "mss"):
    rep(f"{mode} KONTROLLE(Docht)", run(PN, 0.75, 20, mode=mode, wicked=True), nd)
print("--- ohne Bestaetigung (Limit am Level, SL 1xRange) als Referenz ---")
rep("Limit sofort, SL 1xRange", run(PN, 0.75, 20, mode="rej1", K=0, sl_mode="range"), nd)
print("--- Wartefenster K (mode=body) ---")
for K in (3, 5, 10, 20):
    rep(f"max {K} Bars warten", run(PN, 0.75, 20, mode="body", K=K), nd)
print("--- TP-Varianten (mode=body, K=10) ---")
for tp in (0.5, 1.0, 1.5, 2.0):
    rep(f"TP {tp}R", run(PN, 0.75, 20, mode="body", tpmul=tp), nd)
print("--- Toleranz (mode=body) ---")
for tol in (0.0, 0.02, 0.05, 0.10):
    rep(f"Docht <= {tol*100:.0f}%", run(PN, 0.75, 20, mode="body", tol=tol), nd)
print("--- Zeitfenster (mode=body) ---")
for a, b, nm in ((570,950,"RTH"),(660,780,"11-13"),(570,780,"09:30-13"),(120,570,"EU/Pre"),(0,950,"ganzer Tag")):
    rep(nm, run(PN, 0.75, 20, mode="body", t0=a, t1=b), nd)
print("\n##### ES / YM (mode=body, tol 0.02, TP 1R) #####")
for TAG, DATA, COST, USD in (("ES", "../../data_es", 0.4, 50), ("YM", "../../data_ym", 2.5, 5)):
    P = prep(DATA); n2 = len(P)
    rep(f"{TAG} Wickless+Bestaetigung", run(P, COST, USD, mode="body"), n2)
    rep(f"{TAG} KONTROLLE(Docht)", run(P, COST, USD, mode="body", wicked=True), n2)
