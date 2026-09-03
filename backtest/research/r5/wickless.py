"""Runde 13b: "Wickless-Zone" (Florians Idee).
Signal-Kerze ohne oberen Docht  -> Zone = Kerzen-Hoch  -> bei Tap SHORT
Signal-Kerze ohne unteren Docht -> Zone = Kerzen-Tief  -> bei Tap LONG
Entry = Limit exakt am Zonen-Level, Fill nur durch einen SPAETEREN 1-min-Bar (nie durch die Signal-Kerze selbst).
Entry-Bar: nur SL werten. SL vor TP. Ein Trade gleichzeitig.
Parameter: Signal-Timeframe (1/5/15 min), Docht-Toleranz (0 / 5 / 10 % der Kerzenrange), Mindest-Kerzenrange
(x Median-Bar-Range), Level-Alter (Minuten), nur erster Tap, SL-Distanz (x Kerzenrange), TP (xR), Zeitfenster,
Richtung (rejection = wie beschrieben, continuation = Gegenprobe).
"""
import sys, math, datetime as dt, statistics
from bisect import bisect_left
from collections import defaultdict
sys.path.insert(0, "/home/user/Florian/backtest")
from sweep_reclaim_backtest import load_days

DATA = sys.argv[1]; COST = float(sys.argv[2]); USD = float(sys.argv[3]); TAG = sys.argv[4]
days = load_days(DATA); dates = sorted(d for d in days if d.weekday() < 5)

def build(d):
    mods, o, c, lo, hi = days[d]
    n = len(mods)
    if n < 400: return None
    med = statistics.median([hi[i]-lo[i] for i in range(n) if hi[i] > lo[i]][:2000] or [1])
    return mods, o, c, lo, hi, n, med

P = {}
for d in dates:
    b = build(d)
    if b: P[d] = b
print(f"##### {TAG}: {len(P)} Tage #####", flush=True)

def tf_candles(d, tf):
    """Aggregiert 1-min zu tf-Kerzen (Start bei Vielfachen von tf ab Mitternacht NY)."""
    mods, o, c, lo, hi, n, med = P[d]
    out = []  # (start_idx, end_idx, o, h, l, c, end_mod)
    i = 0
    while i < n:
        blk = mods[i] // tf
        j = i
        O = o[i]; H = hi[i]; L = lo[i]
        while j < n and mods[j] // tf == blk:
            H = max(H, hi[j]); L = min(L, lo[j]); j += 1
        out.append((i, j-1, O, H, L, c[j-1], mods[j-1]))
        i = j
    return out

def events(d, tf, tol, minsize, maxage, first_only, t0, t1):
    """Liefert Liste (entry_bar_idx, level, dirn, cand_range, signal_end_idx)."""
    mods, o, c, lo, hi, n, med = P[d]
    cands = tf_candles(d, tf) if tf > 1 else [(i, i, o[i], hi[i], lo[i], c[i], mods[i]) for i in range(n)]
    levels = []  # (level, dirn, active_from_idx, cand_range, expire_mod)
    for (si, ei, O, H, L, C, em) in cands:
        rng = H - L
        if rng <= 0 or rng < minsize * med: continue
        if not (t0 <= em <= t1): continue
        body_hi = max(O, C); body_lo = min(O, C)
        up_wick = H - body_hi; dn_wick = body_lo - L
        if up_wick <= tol * rng:
            levels.append((H, -1, ei + 1, rng, em + maxage))
        if dn_wick <= tol * rng:
            levels.append((L, 1, ei + 1, rng, em + maxage))
    evs = []
    used = set()
    for (lvl, dirn, from_idx, rng, exp) in levels:
        j = from_idx
        while j < n and mods[j] <= exp and mods[j] < 955:
            if (dirn == -1 and hi[j] >= lvl) or (dirn == 1 and lo[j] <= lvl):
                key = (round(lvl, 3), dirn)
                if not (first_only and key in used):
                    evs.append((j, lvl, dirn, rng))
                used.add(key)
                break
            j += 1
    evs.sort()
    return evs

def run(d, evs, sls, tps, invert):
    """sls: Liste SL-Faktoren (x Kerzenrange). tps: Liste TP in R. Liefert dict (sl,tp) -> list (win, usd)."""
    mods, o, c, lo, hi, n, med = P[d]
    out = {(s, t): [] for s in sls for t in tps}
    for s in sls:
        for tmul in tps:
            last = -1
            for (i, lvl, dirn, rng) in evs:
                if i <= last: continue
                dd = dirn * (-1 if invert else 1)
                dist = s * rng
                if dist <= 0: continue
                entry = lvl
                sl = entry - dist if dd == 1 else entry + dist
                tp = entry + tmul*dist if dd == 1 else entry - tmul*dist
                res = None; j = i
                if (dd == 1 and lo[i] <= sl) or (dd == -1 and hi[i] >= sl): res = -1
                else:
                    j = i + 1
                    while j < n and mods[j] < 955:
                        if dd == 1:
                            if lo[j] <= sl: res = -1; break
                            if hi[j] >= tp: res = 1; break
                        else:
                            if hi[j] >= sl: res = -1; break
                            if lo[j] <= tp: res = 1; break
                        j += 1
                if res is None:
                    j = min(j, n-1)
                    pts = (c[j]-entry) if dd == 1 else (entry-c[j])
                    res = 1 if pts > 0 else -1; pnl = pts
                else:
                    pnl = tmul*dist if res > 0 else -dist
                out[(s, tmul)].append((res > 0, (pnl - COST) * USD))
                last = j
    return out

SLS = [0.5, 1.0]; TPS = [1.0]
WINDOWS = {"ALL": (0, 950), "RTH": (570, 950), "MORN": (570, 780), "EU": (120, 570)}
results = []
for tf in (5, 15):
    for tol in (0.0, 0.05, 0.10):
        for minsize in (1.0, 2.0):
            for maxage in (120, 480):
                for first_only in (True,):
                    for wname, (t0, t1) in WINDOWS.items():
                        for invert in (False, True):
                            per = {(s, t): [] for s in SLS for t in TPS}
                            for d in P:
                                evs = events(d, tf, tol, minsize, maxage, first_only, t0, t1)
                                if not evs: continue
                                out = run(d, evs, SLS, TPS, invert)
                                for key, rows in out.items():
                                    for win, usd in rows: per[key].append((d, win, usd))
                            for (s, tmul), rows in per.items():
                                nn = len(rows)
                                if nn < 400: continue
                                tpd = nn / len(P)
                                tr = [r for r in rows if r[0] < dt.date(2025,1,1)]; te = [r for r in rows if r[0] >= dt.date(2025,1,1)]
                                if len(tr) < 250 or len(te) < 120: continue
                                wr = sum(r[1] for r in rows)/nn*100
                                wtr = sum(r[1] for r in tr)/len(tr)*100; wte = sum(r[1] for r in te)/len(te)*100
                                net = sum(r[2] for r in rows)
                                lab = f"tf{tf} tol{tol} size>={minsize} age{maxage} {wname} {'CONT' if invert else 'REJ'} SL{s}xR TP{tmul}R"
                                results.append((min(wtr, wte), wr, wtr, wte, nn, tpd, net, lab))
results.sort(reverse=True)
print(f"{TAG}: {len(results)} auswertbare Kombis. Top 20 nach min(Train,Test)-WR:")
for mn, wr, wtr, wte, nn, tpd, net, lab in results[:20]:
    print(f"  {lab:58s} N={nn:5d} {tpd:.1f}/Tag WR {wr:.1f}% (Train {wtr:.1f} / Test {wte:.1f}) Netto {net:+,.0f}$")
if results:
    v = sorted(r[1] for r in results)
    print(f"  Median-WR aller Kombis: {v[len(v)//2]:.1f}% | Max {v[-1]:.1f}% | Min {v[0]:.1f}%")
