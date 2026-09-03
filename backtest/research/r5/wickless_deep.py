"""Runde 13c: Wickless-Zone im Detail. Basis = 15-min-Kerze ohne Docht (Toleranz variabel), Rejection-Richtung.
Analysiert: Uhrzeit, Toleranz/Frequenz-Kurve, TP-Varianten, Long vs Short, Konfluenzen
(Kerzengroesse, Trendkontext, Naehe zu PDH/PDL/VWAP, Tap-Verzoegerung, Tap-Anzahl, Tagestyp).
"""
import sys, math, datetime as dt, statistics
from bisect import bisect_left
from collections import defaultdict
sys.path.insert(0, "/home/user/Florian/backtest")
from sweep_reclaim_backtest import load_days

DATA = sys.argv[1]; COST = float(sys.argv[2]); USD = float(sys.argv[3]); TAG = sys.argv[4]
TF = int(sys.argv[5]) if len(sys.argv) > 5 else 15
days = load_days(DATA); dates = sorted(d for d in days if d.weekday() < 5)
P = {}
for d in dates:
    mods, o, c, lo, hi = days[d]
    if len(mods) < 400: continue
    med = statistics.median([hi[i]-lo[i] for i in range(len(mods)) if hi[i] > lo[i]] or [1])
    P[d] = (mods, o, c, lo, hi, len(mods), med)
D = sorted(P)
prev = {D[i]: D[i-1] for i in range(1, len(D))}
rth = {}
for d in D:
    mods, o, c, lo, hi, n, med = P[d]
    a = bisect_left(mods, 570); b = bisect_left(mods, 960)
    if b - a > 300: rth[d] = (max(hi[a:b]), min(lo[a:b]), c[b-1], o[a])
atr = {}
for i, d in enumerate(D):
    if i >= 10 and all(x in rth for x in D[i-10:i]):
        atr[d] = sum(rth[x][0]-rth[x][1] for x in D[i-10:i])/10

def events(d, tol, minsize, maxage=480):
    mods, o, c, lo, hi, n, med = P[d]
    evs = []
    i = 0
    # tf-Kerzen
    while i < n:
        blk = mods[i] // TF; j = i; O = o[i]; H = hi[i]; L = lo[i]
        while j < n and mods[j] // TF == blk:
            H = max(H, hi[j]); L = min(L, lo[j]); j += 1
        C = c[j-1]; em = mods[j-1]; ei = j-1
        rng = H - L
        if rng > 0 and rng >= minsize * med:
            bh = max(O, C); bl = min(O, C)
            for wick, lvl, dirn in ((H - bh, H, -1), (bl - L, L, 1)):
                if wick <= tol * rng:
                    k = ei + 1
                    while k < n and mods[k] <= em + maxage and mods[k] < 955:
                        if (dirn == -1 and hi[k] >= lvl) or (dirn == 1 and lo[k] <= lvl):
                            evs.append(dict(i=k, lvl=lvl, dirn=dirn, rng=rng, sig_end=em,
                                            delay=mods[k]-em, size=rng/med, hour=mods[k]//60))
                            break
                        k += 1
        i = j
    evs.sort(key=lambda e: e["i"])
    return evs

def trade(d, e, slmul=1.0, tpmul=1.0):
    mods, o, c, lo, hi, n, med = P[d]
    i = e["i"]; dirn = e["dirn"]; entry = e["lvl"]; dist = slmul * e["rng"]
    sl = entry - dist if dirn == 1 else entry + dist
    tp = entry + tpmul*dist if dirn == 1 else entry - tpmul*dist
    res = None
    if (dirn == 1 and lo[i] <= sl) or (dirn == -1 and hi[i] >= sl): res = -1
    else:
        j = i + 1
        while j < n and mods[j] < 955:
            if dirn == 1:
                if lo[j] <= sl: res = -1; break
                if hi[j] >= tp: res = 1; break
            else:
                if hi[j] >= sl: res = -1; break
                if lo[j] <= tp: res = 1; break
            j += 1
        if res is None:
            j = min(j, n-1); pts = (c[j]-entry) if dirn == 1 else (entry-c[j])
            res = 1 if pts > 0 else -1
    pnl = (tpmul*dist if res > 0 else -dist)
    return res > 0, (pnl - COST) * USD

def collect(tol, minsize, slmul=1.0, tpmul=1.0, t0=0, t1=955):
    rows = []
    for d in P:
        if d not in atr or d not in prev or prev[d] not in rth: continue
        last = -1
        for e in events(d, tol, minsize):
            if not (t0 <= e["hour"]*60 <= t1): continue
            if e["i"] <= last: continue
            win, usd = trade(d, e, slmul, tpmul)
            pdh, pdl, pdc, _ = rth[prev[d]]
            A = atr[d]
            rows.append(dict(day=d, win=win, usd=usd, hour=e["hour"], delay=e["delay"], size=e["size"],
                             dirn=e["dirn"], rng_atr=e["rng"]/A,
                             dist_pdh=abs(e["lvl"]-pdh)/A, dist_pdl=abs(e["lvl"]-pdl)/A,
                             above_pdc=1 if e["lvl"] > pdc else 0,
                             prev_trend=(pdc - rth[prev[prev[d]]][2])/A if prev[d] in prev and prev[prev[d]] in rth else 0))
            last = e["i"]
    return rows

def rep(label, rows, minn=150):
    n = len(rows)
    if n < minn: return None
    tr = [r for r in rows if r["day"] < dt.date(2025,1,1)]; te = [r for r in rows if r["day"] >= dt.date(2025,1,1)]
    if not tr or not te: return None
    wr = sum(r["win"] for r in rows)/n*100
    wtr = sum(r["win"] for r in tr)/len(tr)*100; wte = sum(r["win"] for r in te)/len(te)*100
    net = sum(r["usd"] for r in rows); tpd = n/len(P)
    print(f"  {label:46s} N={n:5d} {tpd:4.2f}/Tag WR {wr:5.1f}% (Tr {wtr:5.1f} / Te {wte:5.1f}) Netto {net:+9,.0f}$")
    return dict(n=n, wr=wr, wtr=wtr, wte=wte, net=net, tpd=tpd)

print(f"##### {TAG} tf{TF}: Wickless-Rejection im Detail ({len(P)} Tage) #####")
print("--- Toleranz / Frequenz-Kurve (size>=1.0, SL 1xRange, TP 1R) ---")
base = {}
for tol in (0.0, 0.01, 0.02, 0.03, 0.05, 0.10):
    rows = collect(tol, 1.0)
    base[tol] = rows
    rep(f"Docht <= {tol*100:.0f}% der Range", rows)
print("--- Kerzengroesse (tol 0.02) ---")
for ms in (0.5, 1.0, 1.5, 2.0, 3.0):
    rep(f"Range >= {ms} x Median-Bar", collect(0.02, ms))
print("--- TP-Varianten (tol 0.02, size>=1.0) ---")
for tp in (0.5, 1.0, 1.5, 2.0):
    rep(f"TP {tp}R", collect(0.02, 1.0, 1.0, tp))
print("--- SL-Varianten (tol 0.02, TP 1R) ---")
for sl in (0.5, 0.75, 1.0, 1.5):
    rep(f"SL {sl} x Kerzenrange", collect(0.02, 1.0, sl, 1.0))
rows = base[0.02]
print(f"--- Konfluenzen auf tol 0.02 (N={len(rows)}) ---")
def split(name, key, edges):
    for lo_, hi_ in edges:
        sel = [r for r in rows if lo_ <= r[key] < hi_]
        rep(f"{name} [{lo_},{hi_})", sel)
split("Stunde", "hour", [(0,6),(6,9),(9,12),(12,16),(16,24)])
split("Tap-Verzoegerung min", "delay", [(0,15),(15,60),(60,180),(180,999)])
split("Kerzengroesse x Median", "size", [(0,1.5),(1.5,3),(3,99)])
split("Range/ATR", "rng_atr", [(0,0.03),(0.03,0.06),(0.06,9)])
split("Abstand zu PDH (ATR)", "dist_pdh", [(0,0.1),(0.1,0.5),(0.5,9)])
split("Abstand zu PDL (ATR)", "dist_pdl", [(0,0.1),(0.1,0.5),(0.5,9)])
split("Vortagstrend (ATR)", "prev_trend", [(-9,-0.3),(-0.3,0.3),(0.3,9)])
for dn, nm in ((1, "LONG (kein unterer Docht)"), (-1, "SHORT (kein oberer Docht)")):
    rep(nm, [r for r in rows if r["dirn"] == dn])
for ap, nm in ((1, "Level ueber Vortages-Close"), (0, "Level unter Vortages-Close")):
    rep(nm, [r for r in rows if r["above_pdc"] == ap])
