"""Mehrfach-Konfluenzen (Baukasten), ehrlich mit Multiple-Testing-Ausweis.
Basis-Event: Sweep einer Session-Range-Seite (Zonen: London 02-05, PreMkt 05-08, 08:12-09:12, Open 09:30-10:00) mit Reclaim (Close zurueck, max 60 min).
Bausteine (Filter, alle kausal):
  A Trend-Kontext: Sweep-Richtung gegen/mit dem Vortages-Trend (PDC vs Vor-Vortages-Close)
  B Premium/Discount: Long nur unter 50% der Vortages-Range, Short nur darueber
  C Kompression: Zonen-Range/ATR10 < 0.25
  D Doppel-Sweep: Sweep-Extrem hat zusaetzlich PDL/PDH oder Overnight-Extrem mitgenommen
  E Displacement: Reclaim-Bar Body >= 1.5x Median-Bar-Range
  F Uhrzeit: Sweep innerhalb 30 min nach Zonen-Ende
Entry am Reclaim-Close, SL Sweep-Extrem -0.1W, TP 1R / 2R / Gegenseite. Bewertung: t-Stat, Train/Test.
Alle 2^6 Filter-Kombinationen x 4 Zonen x 3 TPs = 768 Tests. Top-Ergebnisse auf TRAIN gewaehlt, dann TEST.
"""
import sys, datetime as dt, math, itertools, statistics
from bisect import bisect_left
from collections import defaultdict
sys.path.insert(0, "/home/user/Florian/backtest")
from sweep_reclaim_backtest import load_days
DATA = sys.argv[1]; COST = float(sys.argv[2]); USD = float(sys.argv[3])
days = load_days(DATA); dates = sorted(days)
def rng(d, a_min, b_min, cov=0.6):
    mods, o, c, lo, hi = days[d]
    a = bisect_left(mods, a_min); b = bisect_left(mods, b_min)
    if b - a < (b_min - a_min) * cov: return None
    return max(hi[a:b]), min(lo[a:b]), a, b
ZONES = {"LON": (120, 300), "PRE": (300, 480), "Z812": (492, 552), "OPEN": (570, 600)}
# Vortages-Infos
tinfo = {}; hist = []
for d in dates:
    r = rng(d, 570, 960, 0.6)
    if d.weekday() < 5 and r: tinfo[d] = r; hist.append((d, r[0]-r[1], days[d][2][r[3]-1]))
prev_of = {}; 
for i in range(1, len(hist)):
    prev_of[hist[i][0]] = (hist[i-1], hist[i-2] if i >= 2 else None, sum(h[1] for h in hist[max(0,i-10):i])/min(10,i))

events = []  # pro Zone: Trades mit Feature-Flags
for zn, (zs, ze) in ZONES.items():
    for d in dates:
        if d not in prev_of: continue
        (pd_d, pdW, pdc), pp, atr = prev_of[d]
        pdh, pdl = tinfo[pd_d][0], tinfo[pd_d][1]
        ppc = pp[2] if pp else None
        r = rng(d, zs, ze)
        if r is None: continue
        rh, rl, a, b = r; W = rh - rl
        if W <= 0: continue
        on = rng(d, 0, zs, 0.3)
        mods, o, c, lo, hi = days[d]; m = len(mods)
        live = [hi[i]-lo[i] for i in range(max(0,a-120), b) if hi[i] != lo[i]]
        medbar = statistics.median(live) if live else 0
        j = b; dirn = None
        while j < m and mods[j] < 960:
            hh = hi[j] >= rh; hl = lo[j] <= rl
            if hh or hl:
                dirn = None if (hh and hl) else ("short" if hh else "long"); break
            j += 1
        if dirn is None: continue
        sweep_t = mods[j]; ext = hi[j] if dirn == "short" else lo[j]; k = j; ei = None
        while k < m and mods[k] - sweep_t <= 60:
            ext = max(ext, hi[k]) if dirn == "short" else min(ext, lo[k])
            if rl < c[k] < rh: ei = k; break
            k += 1
        if ei is None: continue
        entry = c[ei]; sl = ext + 0.1*W if dirn == "short" else ext - 0.1*W; sld = abs(entry - sl)
        if sld <= 0: continue
        feats = {
          "A": (ppc is not None) and ((dirn == "long" and pdc < ppc) or (dirn == "short" and pdc > ppc)),  # gegen Vortagestrend
          "B": (dirn == "long" and entry < (pdh+pdl)/2) or (dirn == "short" and entry > (pdh+pdl)/2),
          "C": W / atr < 0.25,
          "D": (dirn == "long" and (ext <= pdl or (on and ext <= on[1]))) or (dirn == "short" and (ext >= pdh or (on and ext >= on[0]))),
          "E": abs(c[ei]-o[ei]) >= 1.5*medbar if medbar else False,
          "F": sweep_t - ze <= 30,
        }
        outs = {}
        for tm in ("r1", "r2", "opp"):
            if tm == "r1": tp = entry + sld if dirn == "long" else entry - sld
            elif tm == "r2": tp = entry + 2*sld if dirn == "long" else entry - 2*sld
            else:
                tp = rh if dirn == "long" else rl
                if (dirn == "long" and tp <= entry) or (dirn == "short" and tp >= entry): outs[tm] = None; continue
            tpd = abs(tp-entry); res = None
            if (dirn == "long" and lo[ei] <= sl) or (dirn == "short" and hi[ei] >= sl): res = -sld
            kk = ei + 1
            while res is None and kk < m and mods[kk] < 960:
                if dirn == "long":
                    if lo[kk] <= sl: res = -sld; break
                    if hi[kk] >= tp: res = tpd; break
                else:
                    if hi[kk] >= sl: res = -sld; break
                    if lo[kk] <= tp: res = tpd; break
                kk += 1
            if res is None:
                kk = min(kk, m-1); res = (c[kk]-entry) if dirn == "long" else (entry-c[kk])
            outs[tm] = (res - COST) * USD
        events.append(dict(zone=zn, day=d, feats=feats, outs=outs))

def evaluate(evs, tm):
    xs = [(e["day"], e["outs"][tm]) for e in evs if e["outs"].get(tm) is not None]
    n = len(xs)
    if n < 150: return None
    v = [x[1] for x in xs]; mean = sum(v)/n; sd = math.sqrt(sum((x-mean)**2 for x in v)/(n-1)) or 1
    tr = [x[1] for x in xs if x[0] < dt.date(2025,1,1)]; te = [x[1] for x in xs if x[0] >= dt.date(2025,1,1)]
    if len(tr) < 100 or len(te) < 40: return None
    mtr = sum(tr)/len(tr); sdtr = math.sqrt(sum((x-mtr)**2 for x in tr)/(len(tr)-1)) or 1
    return dict(n=n, mean=mean, t=mean/(sd/math.sqrt(n)), train=sum(tr), test=sum(te), t_train=mtr/(sdtr/math.sqrt(len(tr))),
                wr=sum(1 for x in v if x > 0)/n*100)

results = []; tested = 0
FL = "ABCDEF"
for zn in ZONES:
    zev = [e for e in events if e["zone"] == zn]
    for r in range(0, 4):
        for combo in itertools.combinations(FL, r):
            sel = [e for e in zev if all(e["feats"][f] for f in combo)]
            for tm in ("r1", "r2", "opp"):
                tested += 1
                s = evaluate(sel, tm)
                if s: results.append((zn, "".join(combo) or "-", tm, s))
print(f"Getestet: {tested} Kombinationen, auswertbar: {len(results)}")
results.sort(key=lambda x: -x[3]["t_train"])
print("\nTop 15 nach TRAIN-t (dann TEST-Ergebnis):")
for zn, cb, tm, s in results[:15]:
    print(f"  {zn:5s} {cb:6s} {tm:3s} N={s['n']:4d} WR={s['wr']:.1f}% Ø{s['mean']:+.0f}$ t_train={s['t_train']:.2f} t_all={s['t']:.2f} | Train {s['train']:+,.0f} | Test {s['test']:+,.0f}")
ts = sorted(s["t"] for _, _, _, s in results)
print(f"\nt-Verteilung aller {len(ts)}: min {ts[0]:.2f} median {ts[len(ts)//2]:.2f} max {ts[-1]:.2f} | >2: {sum(1 for t in ts if t>2)} | <-2: {sum(1 for t in ts if t<-2)}")
both = [r for r in results if r[3]["train"] > 0 and r[3]["test"] > 0]
print(f"Train&Test>0: {len(both)} von {len(results)} (Zufallserwartung bei Nulleffekt ~25%)")
