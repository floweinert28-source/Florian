"""Runde 5: Drift-Quellen statt Mean-Reversion-Entries.
 T  Drift-Karte: Entry am Beginn jedes 30-min-Fensters (Long UND Short getrennt), TP/SL = +/- k x ATR10-Tagesrange, bis Fensterende+? (bis 16:00 bzw. naechster Tag 09:30 fuer Overnight).
 O  Overnight: Entry 15:59 Close, TP/SL +/- k x ATR, Exit spaetestens 09:30 naechster Tag.
 M  Turn-of-Month: letzte 3 + erste 3 Handelstage: Long ab 09:30 mit TP/SL +/- k x ATR bis 16:00.
 R  Nach grossem Vortag (|Close-Close| >= 1.5 ATR): naechster Tag Mean-Reversion (Long nach Down-Tag) ab 09:30, TP/SL +/- k ATR.
 W  Wochentag x Richtung ab 09:30, +/- 0.5 ATR.
"""
import sys, math, datetime as dt
from bisect import bisect_left
from collections import defaultdict
sys.path.insert(0, "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r3")
from load_vol import load_days_vol
DATA = sys.argv[1]; COST = float(sys.argv[2]); USD = float(sys.argv[3]); TAG = sys.argv[4]
days = load_days_vol(DATA); dates = sorted(days)
def rth(d):
    mods, o, c, lo, hi, v = days[d]; a = bisect_left(mods, 570); b = bisect_left(mods, 960)
    if b - a < 300 or a >= len(mods) or mods[a] != 570: return None
    if sum(1 for i in range(a, b) if hi[i] == lo[i]) > 30: return None
    return max(hi[a:b]), min(lo[a:b]), o[a], c[b-1], a, b
T = [d for d in dates if d.weekday() < 5 and rth(d)]
info = {d: rth(d) for d in T}
atr = {}
for i, d in enumerate(T):
    if i >= 10: atr[d] = sum(info[T[i-k]][0]-info[T[i-k]][1] for k in range(1, 11))/10
def run_bar(day, ei, dirn, entry, dist, end):
    mods, o, c, lo, hi, v = days[day]; m = len(mods)
    sl = entry - dist if dirn == "long" else entry + dist; tp = entry + dist if dirn == "long" else entry - dist; res = None
    k = ei + 1
    while res is None and k < m and mods[k] < end:
        if dirn == "long":
            if lo[k] <= sl: res = -dist; break
            if hi[k] >= tp: res = dist; break
        else:
            if hi[k] >= sl: res = -dist; break
            if lo[k] <= tp: res = dist; break
        k += 1
    if res is None:
        k = min(k, m-1); res = (c[k]-entry) if dirn == "long" else (entry-c[k])
    return res
def report(label, tr, min_n=80):
    n = len(tr)
    if n < min_n: return
    usd = [(r - COST) * USD for _, r in tr]; mean = sum(usd)/n
    sd = math.sqrt(sum((x-mean)**2 for x in usd)/(n-1)) or 1; t = mean/(sd/math.sqrt(n))
    wr = sum(1 for _, r in tr if r > 0)/n*100
    ntr = sum(1 for d, _ in tr if d < dt.date(2025,1,1))
    wtr = sum(1 for d, r in tr if d < dt.date(2025,1,1) and r > 0)/max(1, ntr)*100
    wts = sum(1 for d, r in tr if d >= dt.date(2025,1,1) and r > 0)/max(1, n-ntr)*100
    flag = "  <==" if min(wtr, wts) >= 56 else ""
    print(f"{TAG} {label:44s} N={n:4d} WR={wr:5.1f}% (Train {wtr:4.1f}/Test {wts:4.1f}) t={t:5.2f}{flag}", flush=True)

print(f"##### {TAG} Runde 5 #####")
# T: Drift-Karte
for k in (0.25, 0.5):
    for w0 in range(570, 960, 30):
        for dirn in ("long", "short"):
            tr = []
            for d in T:
                if d not in atr: continue
                mods, o, c, lo, hi, v = days[d]; i = bisect_left(mods, w0)
                if i >= len(mods) or mods[i] != w0: continue
                tr.append((d, run_bar(d, i, dirn, o[i], k*atr[d], 960)))
            report(f"T {w0//60:02d}:{w0%60:02d} {dirn:5s} +/-{k}ATR bis 16:00", tr)
# O: Overnight
for k in (0.25, 0.5, 1.0):
    for dirn in ("long", "short"):
        tr = []
        for idx in range(len(T)-1):
            d = T[idx]; nd = T[idx+1]
            if d not in atr or (nd - d).days > 4: continue
            mods, o, c, lo, hi, v = days[d]; b = info[d][5]; entry = c[b-1]; dist = k*atr[d]
            sl = entry - dist if dirn == "long" else entry + dist; tp = entry + dist if dirn == "long" else entry - dist; res = None
            # Rest des Tages nach 16:00 + naechster Tag bis 09:30
            segs = [(days[d], b), (days[nd], 0)]
            for (mm, oo, cc, ll, hh, vv), start in segs:
                kk = start
                while kk < len(mm) and (mm is days[d][0] or mm[kk] < 570):
                    if mm is days[d][0] and kk == b: kk += 1; continue
                    if dirn == "long":
                        if ll[kk] <= sl: res = -dist; break
                        if hh[kk] >= tp: res = dist; break
                    else:
                        if hh[kk] >= sl: res = -dist; break
                        if ll[kk] <= tp: res = dist; break
                    kk += 1
                if res is not None: break
            if res is None:
                mm, oo, cc, ll, hh, vv = days[nd]; j = bisect_left(mm, 570)
                if j >= len(mm): continue
                res = (oo[j]-entry) if dirn == "long" else (entry-oo[j])
            tr.append((d, res))
        report(f"O Overnight {dirn:5s} +/-{k}ATR", tr)
# M: Turn-of-month
for k in (0.25, 0.5):
    for dirn in ("long", "short"):
        tr = []
        for idx, d in enumerate(T):
            if d not in atr: continue
            last3 = idx + 3 < len(T) and T[idx+3].month != d.month or (idx + 1 < len(T) and T[idx+1].month != d.month) or (idx + 2 < len(T) and T[idx+2].month != d.month)
            first3 = idx >= 3 and T[idx-3].month != d.month
            if not (last3 or first3): continue
            mods, o, c, lo, hi, v = days[d]; a = info[d][4]
            tr.append((d, run_bar(d, a, dirn, o[a], k*atr[d], 960)))
        report(f"M Turn-of-Month {dirn:5s} +/-{k}ATR", tr)
# R: Nach grossem Vortag
for k in (0.25, 0.5):
    for thr in (1.0, 1.5):
        for mode in ("rev", "cont"):
            tr = []
            for idx in range(1, len(T)):
                d = T[idx]; pd_ = T[idx-1]
                if d not in atr or pd_ not in info: continue
                mv = info[pd_][3] - (info[T[idx-2]][3] if idx >= 2 else info[pd_][2])
                if abs(mv) < thr * atr[d]: continue
                up = mv > 0
                dirn = ("short" if up else "long") if mode == "rev" else ("long" if up else "short")
                mods, o, c, lo, hi, v = days[d]; a = info[d][4]
                tr.append((d, run_bar(d, a, dirn, o[a], k*atr[d], 960)))
            report(f"R Vortag >={thr}ATR {mode} +/-{k}ATR", tr)
# W: Wochentag
for wd, nm in enumerate(["Mo", "Di", "Mi", "Do", "Fr"]):
    for dirn in ("long", "short"):
        tr = []
        for d in T:
            if d not in atr or d.weekday() != wd: continue
            mods, o, c, lo, hi, v = days[d]; a = info[d][4]
            tr.append((d, run_bar(d, a, dirn, o[a], 0.5*atr[d], 960)))
        report(f"W {nm} {dirn:5s} +/-0.5ATR ab 09:30", tr)
