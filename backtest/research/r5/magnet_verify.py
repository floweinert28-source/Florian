"""Runde 13h: Haerte-Test des Wick-Magnet (CONT, TP 1R).
A) Ausfuehrungsrealismus: Entry exakt am Level (optimistisch) vs Entry am Close des Tap-Bars (pessimistisch) vs Level + Slippage.
B) Kosten x1 / x2 / x4.
C) Gold + WTI als 4./5. Instrument.
D) Unabhaengige Nachsimulation einer Stichprobe (Look-Ahead-Kontrolle).
"""
import sys, math, random, datetime as dt, statistics
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

def run(P, COST, USD, entry_mode="level", slip=0.0, wmin=0.20, t0=570, t1=950, slmul=1.0, tpmul=1.0, maxage=480, minsize=1.0, collect=None):
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
                if (H - bh) > wmin*rng: levels.append((bh, 1, ei+1, rng, em+maxage, "up"))
                if (bl - L) > wmin*rng: levels.append((bl, -1, ei+1, rng, em+maxage, "dn"))
            i = j
        evs = []; used = set()
        for (lvl, dirn, fi, rng, exp, side) in levels:
            k = fi
            while k < n and mods[k] <= exp and mods[k] < 955:
                if (hi[k] >= lvl) if side == "up" else (lo[k] <= lvl):
                    key = (round(lvl,3), side)
                    if key not in used: evs.append((k, lvl, dirn, rng, side))
                    used.add(key); break
                k += 1
        evs.sort(); last = -1
        for (i0, lvl, dirn, rng, side) in evs:
            if i0 <= last: continue
            if entry_mode == "level": entry = lvl + (slip if dirn == 1 else -slip)
            elif entry_mode == "close": entry = c[i0]
            elif entry_mode == "nextopen":
                if i0+1 >= n: continue
                entry = o[i0+1]
            dist = slmul*rng
            sl = entry - dist if dirn == 1 else entry + dist
            tp = entry + tpmul*dist if dirn == 1 else entry - tpmul*dist
            start = i0 if entry_mode == "level" else (i0+1 if entry_mode == "close" else i0+1)
            res = None; pnl = None; j = start
            if entry_mode == "level":
                if (dirn == 1 and lo[i0] <= sl) or (dirn == -1 and hi[i0] >= sl): res, pnl = -1, -dist
                else: j = i0+1
            if res is None:
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
            rows.append((d, res > 0, (pnl-COST)*USD))
            if collect is not None and len(collect) < 400:
                collect.append((d, i0, dirn, entry, sl, tp, res, pnl))
            last = j
    return rows

def rep(label, rows, nd):
    n = len(rows)
    if n < 80: print(f"  {label:46s} zu wenig ({n})"); return
    tr = [r for r in rows if r[0] < dt.date(2025,1,1)]; te = [r for r in rows if r[0] >= dt.date(2025,1,1)]
    wr = sum(r[1] for r in rows)/n*100
    wtr = sum(r[1] for r in tr)/max(1,len(tr))*100; wte = sum(r[1] for r in te)/max(1,len(te))*100
    net = sum(r[2] for r in rows)
    print(f"  {label:46s} N={n:5d} {n/nd:5.2f}/Tag WR {wr:5.1f}% (Tr {wtr:5.1f}/Te {wte:5.1f}) Netto {net:+9,.0f}$ = {net/n:+6.1f}$/Trade", flush=True)

PN = prep("../../data"); ndn = len(PN)
print(f"##### NQ Wick-Magnet CONT TP=1R: Ausfuehrung & Kosten ({ndn} Tage) #####")
rep("Entry am Level, Kosten 0.75", run(PN, 0.75, 20), ndn)
rep("Entry am Level + 0.25 Slippage", run(PN, 0.75, 20, slip=0.25), ndn)
rep("Entry am Level + 0.50 Slippage", run(PN, 0.75, 20, slip=0.50), ndn)
rep("Entry am CLOSE des Tap-Bars", run(PN, 0.75, 20, entry_mode="close"), ndn)
rep("Entry am OPEN des Folgebars", run(PN, 0.75, 20, entry_mode="nextopen"), ndn)
rep("Kosten x2 (1.5 Pkt)", run(PN, 1.5, 20), ndn)
rep("Kosten x4 (3.0 Pkt)", run(PN, 3.0, 20), ndn)
print("##### Gold / WTI #####")
for TAG, DATA, COST, USD in (("GOLD", "../../data_gold", 0.35, 100), ("WTI", "../../data_cl", 0.03, 1000)):
    P = prep(DATA); nd = len(P)
    rep(f"{TAG} CONT TP=1R Level-Entry", run(P, COST, USD), nd)
    rep(f"{TAG} CONT TP=1R Close-Entry", run(P, COST, USD, entry_mode="close"), nd)
print("##### Look-Ahead-Kontrolle: 400 Trades unabhaengig nachsimuliert #####")
sample = []
run(PN, 0.75, 20, collect=sample)
random.seed(3); pick = random.sample(sample, min(200, len(sample)))
bad = 0
for (d, i0, dirn, entry, sl, tp, res, pnl) in pick:
    mods, o, c, lo, hi, n, med = PN[d]
    r2 = None
    if (dirn == 1 and lo[i0] <= sl) or (dirn == -1 and hi[i0] >= sl): r2 = -1
    else:
        for j in range(i0+1, n):
            if mods[j] >= 955: break
            if dirn == 1:
                if lo[j] <= sl: r2 = -1; break
                if hi[j] >= tp: r2 = 1; break
            else:
                if hi[j] >= sl: r2 = -1; break
                if lo[j] <= tp: r2 = 1; break
    if r2 is not None and r2 != res: bad += 1
print(f"  Abweichungen: {bad} von {len(pick)}")
