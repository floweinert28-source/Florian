"""Sweep-Tiefe: Limit-Entry erst in definierter Tiefe HINTER der Range-Linie (0.25/0.5/1.0 W),
SL weitere sl_mult*W dahinter, TP Range-Mitte / Gegenseite. Zonen: LON 02-05, PRE 05-08, 08:12-09:12, 06:20-06:35, 09:30-10:00, 11:00-12:00.
Fill nur durch spaeteren Bar als der Bruch-Bar (konservativ: der Bruch-Bar selbst darf nicht fuellen, ausser er handelt tiefer -> dann Fill zum Level, Entry-Bar nur SL).
"""
import sys, datetime as dt, math
from bisect import bisect_left
from collections import defaultdict
sys.path.insert(0, "/home/user/Florian/backtest")
from sweep_reclaim_backtest import load_days
DATA = sys.argv[1]; COST = float(sys.argv[2]); USD = float(sys.argv[3])
days = load_days(DATA); dates = sorted(days)
ZONES = {"LON": (120, 300), "PRE": (300, 480), "Z0620": (380, 395), "Z812": (492, 552), "OPEN": (570, 600), "Z11": (660, 720)}
def run(zs, ze, depth, sl_mult, tp_mode):
    trades = []
    for d in dates:
        if d.weekday() >= 5: continue
        mods, o, c, lo, hi = days[d]
        a = bisect_left(mods, zs); b = bisect_left(mods, ze)
        if b - a < (ze - zs) * 0.6: continue
        rh = max(hi[a:b]); rl = min(lo[a:b]); W = rh - rl
        if W <= 0: continue
        m = len(mods); j = b; dirn = None
        while j < m and mods[j] < 960:
            hh = hi[j] >= rh; hl = lo[j] <= rl
            if hh or hl:
                dirn = None if (hh and hl) else ("short" if hh else "long"); break
            j += 1
        if dirn is None: continue
        level = rh + depth*W if dirn == "short" else rl - depth*W
        ei = None; k = j
        while k < m and mods[k] < 960 and mods[k] - mods[j] <= 120:
            if (dirn == "short" and hi[k] >= level) or (dirn == "long" and lo[k] <= level): ei = k; break
            # Abbruch, wenn Gegenseite vorher geholt
            if (dirn == "short" and lo[k] <= rl) or (dirn == "long" and hi[k] >= rh): break
            k += 1
        if ei is None: continue
        entry = level; sl = entry + sl_mult*W if dirn == "short" else entry - sl_mult*W; sld = sl_mult*W
        tp = ((rh+rl)/2) if tp_mode == "mid" else (rl if dirn == "short" else rh)
        tpd = abs(tp - entry); res = None
        if (dirn == "long" and lo[ei] <= sl) or (dirn == "short" and hi[ei] >= sl): res = -sld
        k = ei + 1
        while res is None and k < m and mods[k] < 960:
            if dirn == "long":
                if lo[k] <= sl: res = -sld; break
                if hi[k] >= tp: res = tpd; break
            else:
                if hi[k] >= sl: res = -sld; break
                if lo[k] <= tp: res = tpd; break
            k += 1
        if res is None:
            k = min(k, m-1); res = (c[k]-entry) if dirn == "long" else (entry-c[k])
        trades.append((d, (res-COST)*USD))
    return trades
def line(label, tr):
    n = len(tr)
    if n < 150: return
    v = [x[1] for x in tr]; mean = sum(v)/n; sd = math.sqrt(sum((x-mean)**2 for x in v)/(n-1)) or 1
    a = sum(x[1] for x in tr if x[0] < dt.date(2025,1,1)); b = sum(x[1] for x in tr if x[0] >= dt.date(2025,1,1))
    wr = sum(1 for x in v if x > 0)/n*100
    flag = " <-- T&T>0" if a > 0 and b > 0 else ""
    print(f"{label}: N={n} WR={wr:.1f}% Ø{mean:+.0f}$ t={mean/(sd/math.sqrt(n)):.2f} | Train {a:+,.0f} | Test {b:+,.0f}{flag}")
ts = []
for zn, (zs, ze) in ZONES.items():
    for depth in (0.25, 0.5, 1.0):
        for slm in (0.5, 1.0, 2.0):
            for tm in ("mid", "other"):
                tr = run(zs, ze, depth, slm, tm)
                line(f"{zn:5s} depth={depth} SL={slm}W TP={tm}", tr)
print(f"\n{len(ZONES)*18} Kombis getestet")
