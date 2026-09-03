"""Runde 13e: Konfluenzen fuer NQ 15-min Wickless-Rejection in der US-Session (korrigierte P&L).
Untersucht: Kerzenrichtung (bullish/bearish Signal-Kerze), Stunde, TP/SL-Gitter, Kerzengroesse, Tap-Verzoegerung,
Naehe zu PDH/PDL/Open/VWAP, Trendkontext, Wochentag, Long vs Short. Zusaetzlich YM-Gegenprobe.
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

def build_ctx(P):
    D = sorted(P); rth = {}; vwap = {}
    for d in D:
        mods, o, c, lo, hi, n, med = P[d]
        a = bisect_left(mods, 570); b = bisect_left(mods, 960)
        if b - a > 300: rth[d] = (max(hi[a:b]), min(lo[a:b]), c[b-1], o[a])
        pv = 0.0; vv = 0.0; vw = [0.0]*n
        for i in range(n):
            tp = (hi[i]+lo[i]+c[i])/3; pv += tp; vv += 1; vw[i] = pv/vv
        vwap[d] = vw
    prev = {D[i]: D[i-1] for i in range(1, len(D))}
    atr = {D[i]: sum(rth[x][0]-rth[x][1] for x in D[i-10:i])/10 for i in range(10, len(D)) if all(x in rth for x in D[i-10:i])}
    return rth, prev, atr, vwap

def events(P, ctx, tol, t0=570, t1=950, minsize=1.0, maxage=480):
    rth, prev, atr, vwap = ctx
    out = []
    for d in P:
        if d not in atr or d not in prev or prev[d] not in rth: continue
        mods, o, c, lo, hi, n, med = P[d]
        vw = vwap[d]; A = atr[d]; pdh, pdl, pdc, dop = rth[prev[d]]
        levels = []; i = 0
        while i < n:
            blk = mods[i] // TF; j = i; O = o[i]; H = hi[i]; L = lo[i]
            while j < n and mods[j] // TF == blk:
                H = max(H, hi[j]); L = min(L, lo[j]); j += 1
            C = c[j-1]; em = mods[j-1]; ei = j-1; rng = H - L
            if rng > 0 and rng >= minsize*med and t0 <= em <= t1:
                bh = max(O, C); bl = min(O, C); bull = C > O
                if H - bh <= tol*rng: levels.append((H, -1, ei+1, rng, em+maxage, bull, em))
                if bl - L <= tol*rng: levels.append((L, 1, ei+1, rng, em+maxage, bull, em))
            i = j
        evs = []; used = set()
        for (lvl, dirn, fi, rng, exp, bull, sigm) in levels:
            k = fi
            while k < n and mods[k] <= exp and mods[k] < 955:
                if (dirn == -1 and hi[k] >= lvl) or (dirn == 1 and lo[k] <= lvl):
                    key = (round(lvl,3), dirn)
                    if key not in used:
                        evs.append((k, lvl, dirn, rng, bull, mods[k]-sigm, vw[k]))
                    used.add(key); break
                k += 1
        evs.sort()
        for e in evs: out.append((d, e, A, pdh, pdl, pdc))
    return out

def trades(P, evlist, slmul, tpmul, COST, USD, filt=None):
    rows = []; lastday = None; last = -1
    for (d, (i, lvl, dirn, rng, bull, delay, vw), A, pdh, pdl, pdc) in evlist:
        if d != lastday: lastday = d; last = -1
        if i <= last: continue
        feat = dict(day=d, dirn=dirn, bull=bull, delay=delay, hour=None, size=rng/A,
                    d_pdh=abs(lvl-pdh)/A, d_pdl=abs(lvl-pdl)/A, d_vwap=(lvl-vw)/A, wd=d.weekday())
        mods, o, c, lo, hi, n, med = P[d]
        feat["hour"] = mods[i]//60
        if filt and not filt(feat): continue
        dist = slmul*rng; entry = lvl
        sl = entry - dist if dirn == 1 else entry + dist
        tp = entry + tpmul*dist if dirn == 1 else entry - tpmul*dist
        res = None; pnl = None
        if (dirn == 1 and lo[i] <= sl) or (dirn == -1 and hi[i] >= sl): res, pnl = -1, -dist
        else:
            j = i+1
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
            last = j
        feat["win"] = res > 0; feat["usd"] = (pnl - COST)*USD
        rows.append(feat)
    return rows

def rep(label, rows, nd, minn=120):
    n = len(rows)
    if n < minn: return
    tr = [r for r in rows if r["day"] < dt.date(2025,1,1)]; te = [r for r in rows if r["day"] >= dt.date(2025,1,1)]
    wr = sum(r["win"] for r in rows)/n*100
    wtr = sum(r["win"] for r in tr)/max(1,len(tr))*100; wte = sum(r["win"] for r in te)/max(1,len(te))*100
    print(f"  {label:44s} N={n:5d} {n/nd:4.2f}/Tag WR {wr:5.1f}% (Tr {wtr:5.1f} / Te {wte:5.1f}) Netto {sum(r['usd'] for r in rows):+9,.0f}$", flush=True)

for TAG, DATA, COST, USD in (("NQ", "../../data", 0.75, 20), ("YM", "../../data_ym", 2.5, 5)):
    P = prep(DATA); ctx = build_ctx(P); nd = len(P)
    print(f"\n##### {TAG} tf15 Wickless-Rejection US-Session ({nd} Tage) #####")
    for tol in (0.0, 0.02):
        ev = events(P, ctx, tol)
        base = trades(P, ev, 1.0, 1.0, COST, USD)
        print(f"--- Toleranz {tol} (Basis) ---")
        rep("Basis US-Session", base, nd)
        if TAG != "NQ": continue
        print("  Signal-Kerze bullish/bearish:")
        rep("   Signal-Kerze BULLISH", [r for r in base if r["bull"]], nd)
        rep("   Signal-Kerze BEARISH", [r for r in base if not r["bull"]], nd)
        rep("   LONG (kein unterer Docht)", [r for r in base if r["dirn"] == 1], nd)
        rep("   SHORT (kein oberer Docht)", [r for r in base if r["dirn"] == -1], nd)
        print("  Stunde:")
        for h0, h1 in ((9,11),(11,13),(13,16)):
            rep(f"   {h0:02d}-{h1:02d} Uhr", [r for r in base if h0 <= r["hour"] < h1], nd)
        print("  Tap-Verzoegerung:")
        for a, b in ((0,15),(15,60),(60,240),(240,999)):
            rep(f"   {a}-{b} min", [r for r in base if a <= r["delay"] < b], nd)
        print("  Kerzengroesse (Range/ATR):")
        for a, b in ((0,0.04),(0.04,0.08),(0.08,9)):
            rep(f"   {a}-{b}", [r for r in base if a <= r["size"] < b], nd)
        print("  Naehe PDH/PDL (ATR):")
        rep("   |Level-PDH| < 0.15", [r for r in base if r["d_pdh"] < 0.15], nd)
        rep("   |Level-PDL| < 0.15", [r for r in base if r["d_pdl"] < 0.15], nd)
        rep("   fern von beiden (>0.5)", [r for r in base if r["d_pdh"] > 0.5 and r["d_pdl"] > 0.5], nd)
        print("  Level vs VWAP:")
        rep("   Level ueber VWAP", [r for r in base if r["d_vwap"] > 0], nd)
        rep("   Level unter VWAP", [r for r in base if r["d_vwap"] <= 0], nd)
        rep("   Short ueber VWAP / Long unter VWAP", [r for r in base if (r["dirn"] == -1) == (r["d_vwap"] > 0)], nd)
        print("  Wochentag:")
        for wd, nm in enumerate(["Mo","Di","Mi","Do","Fr"]):
            rep(f"   {nm}", [r for r in base if r["wd"] == wd], nd)
        print("  TP/SL-Gitter:")
        for sl in (0.5, 1.0, 1.5):
            for tp in (0.5, 1.0, 1.5, 2.0):
                rep(f"   SL {sl}xR TP {tp}R", trades(P, ev, sl, tp, COST, USD), nd)
