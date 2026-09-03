"""Runde 13i: Wick-Magnet - Konfluenzen und Exits, Basis = PESSIMISTISCHE Ausfuehrung (Entry am Close des Tap-Bars).
Getestet auf NQ; die besten Filter danach auf ES/YM gegengeprueft.
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
        if len(mods) < 400: continue
        med = statistics.median([hi[i]-lo[i] for i in range(len(mods)) if hi[i] > lo[i]] or [1])
        P[d] = (mods, o, c, lo, hi, len(mods), med)
    return P

def events(P, TF, wmin, t0, t1, maxage=480, minsize=1.0):
    """Liefert je Tag Liste (tap_idx, dirn, rng, wick_frac, bull, delay, hour, body_pos)."""
    out = {}
    for d in P:
        mods, o, c, lo, hi, n, med = P[d]
        levels = []; i = 0
        while i < n:
            blk = mods[i] // TF; j = i; O = o[i]; H = hi[i]; L = lo[i]
            while j < n and mods[j] // TF == blk:
                H = max(H, hi[j]); L = min(L, lo[j]); j += 1
            C = c[j-1]; em = mods[j-1]; ei = j-1; rng = H - L
            if rng > 0 and rng >= minsize*med and t0 <= em <= t1:
                bh = max(O, C); bl = min(O, C); bull = C > O
                uw = (H-bh)/rng; dw = (bl-L)/rng
                if uw > wmin: levels.append((bh, 1, ei+1, rng, em+maxage, "up", uw, bull, em, H))
                if dw > wmin: levels.append((bl, -1, ei+1, rng, em+maxage, "dn", dw, bull, em, L))
            i = j
        evs = []; used = set()
        for (lvl, dirn, fi, rng, exp, side, wf, bull, sigm, tip) in levels:
            k = fi
            while k < n and mods[k] <= exp and mods[k] < 955:
                if (hi[k] >= lvl) if side == "up" else (lo[k] <= lvl):
                    key = (round(lvl,3), side)
                    if key not in used: evs.append((k, lvl, dirn, rng, wf, bull, mods[k]-sigm, mods[k]//60, tip))
                    used.add(key); break
                k += 1
        evs.sort(); out[d] = evs
    return out

def trade(P, EV, COST, USD, tpmul=1.0, slmul=1.0, filt=None, entry_mode="close"):
    rows = []
    for d, evs in EV.items():
        mods, o, c, lo, hi, n, med = P[d]
        last = -1
        for (i0, lvl, dirn, rng, wf, bull, delay, hour, tip) in evs:
            if i0 <= last: continue
            f = dict(wf=wf, bull=bull, delay=delay, hour=hour, dirn=dirn, size=rng/med, wd=d.weekday())
            if filt and not filt(f): continue
            entry = c[i0] if entry_mode == "close" else lvl
            dist = slmul*rng
            sl = entry - dist if dirn == 1 else entry + dist
            tp = entry + tpmul*dist if dirn == 1 else entry - tpmul*dist
            res = None; pnl = None; j = i0+1
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

def rep(label, rows, nd, minn=200):
    n = len(rows)
    if n < minn: return
    tr = [r for r in rows if r[0] < dt.date(2025,1,1)]; te = [r for r in rows if r[0] >= dt.date(2025,1,1)]
    wr = sum(r[1] for r in rows)/n*100
    wtr = sum(r[1] for r in tr)/max(1,len(tr))*100; wte = sum(r[1] for r in te)/max(1,len(te))*100
    net = sum(r[2] for r in rows)
    print(f"  {label:42s} N={n:5d} {n/nd:5.2f}/Tag WR {wr:5.1f}% (Tr {wtr:5.1f}/Te {wte:5.1f}) {net/n:+6.1f}$/Trade Netto {net:+9,.0f}$", flush=True)

PN = prep("../../data"); nd = len(PN)
print(f"##### NQ Wick-Magnet, PESSIMISTISCHE Ausfuehrung (Entry Close des Tap-Bars), {nd} Tage #####")
print("--- Timeframe der Signal-Kerze (TP 1R, Docht>20%, RTH) ---")
EVS = {}
for TF in (5, 15, 30, 60):
    EVS[TF] = events(PN, TF, 0.20, 570, 950)
    rep(f"tf{TF}", trade(PN, EVS[TF], 0.75, 20), nd)
EV = EVS[15]
print("--- Docht-Groesse (tf15) ---")
for w in (0.15, 0.25, 0.35, 0.50):
    rep(f"Docht > {w*100:.0f}%", trade(PN, events(PN, 15, w, 570, 950), 0.75, 20), nd)
print("--- Richtung / Kerzentyp (tf15, Docht>20%) ---")
rep("LONG (oberer Docht)", trade(PN, EV, 0.75, 20, filt=lambda f: f["dirn"] == 1), nd)
rep("SHORT (unterer Docht)", trade(PN, EV, 0.75, 20, filt=lambda f: f["dirn"] == -1), nd)
rep("Signal-Kerze bullish", trade(PN, EV, 0.75, 20, filt=lambda f: f["bull"]), nd)
rep("Signal-Kerze bearish", trade(PN, EV, 0.75, 20, filt=lambda f: not f["bull"]), nd)
rep("Docht GEGEN Kerzenrichtung", trade(PN, EV, 0.75, 20, filt=lambda f: (f["dirn"] == 1) != f["bull"]), nd)
rep("Docht MIT Kerzenrichtung", trade(PN, EV, 0.75, 20, filt=lambda f: (f["dirn"] == 1) == f["bull"]), nd)
print("--- Tap-Verzoegerung ---")
for a, b in ((0,15),(15,45),(45,120),(120,999)):
    rep(f"{a}-{b} min nach Kerzenschluss", trade(PN, EV, 0.75, 20, filt=lambda f, a=a, b=b: a <= f["delay"] < b), nd)
print("--- Uhrzeit ---")
for a, b in ((9,11),(11,13),(13,16)):
    rep(f"{a}-{b} Uhr", trade(PN, EV, 0.75, 20, filt=lambda f, a=a, b=b: a <= f["hour"] < b), nd)
print("--- Kerzengroesse (x Median-Bar) ---")
for a, b in ((0,4),(4,8),(8,99)):
    rep(f"{a}-{b}", trade(PN, EV, 0.75, 20, filt=lambda f, a=a, b=b: a <= f["size"] < b), nd)
print("--- TP/SL-Gitter (alle Events) ---")
for sl in (0.5, 1.0, 1.5):
    for tp in (0.5, 1.0, 1.5, 2.0):
        rep(f"SL {sl}xRange TP {tp}R", trade(PN, EV, 0.75, 20, tpmul=tp, slmul=sl), nd)
print("\n##### Beste Filter auf ES / YM #####")
for TAG, DATA, COST, USD in (("ES", "../../data_es", 0.4, 50), ("YM", "../../data_ym", 2.5, 5)):
    P = prep(DATA); n2 = len(P); E = events(P, 15, 0.20, 570, 950)
    rep(f"{TAG} Basis tf15 TP1R", trade(P, E, COST, USD), n2)
    rep(f"{TAG} Docht GEGEN Kerzenrichtung", trade(P, E, COST, USD, filt=lambda f: (f["dirn"] == 1) != f["bull"]), n2)
    rep(f"{TAG} SL1.5 TP1R", trade(P, E, COST, USD, tpmul=1.0, slmul=1.5), n2)
