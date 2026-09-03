"""Runde 6: Drift-Faktoren stapeln (long-only ab 09:30, TP/SL +/- k ATR bis 16:00) + Jahresaufloesung (2022 = Baerenjahr).
Faktoren: Mo, Fr, Turn-of-Month, Vortag Up >= 1 ATR (Continuation), Overnight Up (Open > Vortages-Close), Vortag Down >= 1 ATR (Reversal-Long).
Score = Anzahl aktiver bullischer Faktoren. Auch: symmetrische Variante Score fuer Short (Do, Vortag Down cont, Overnight Down).
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
T = [d for d in dates if d.weekday() < 5 and rth(d)]; info = {d: rth(d) for d in T}
atr = {T[i]: sum(info[T[i-k]][0]-info[T[i-k]][1] for k in range(1, 11))/10 for i in range(10, len(T))}
def run_bar(day, ei, dirn, entry, dist, end=960):
    mods, o, c, lo, hi, v = days[day]; m = len(mods)
    sl = entry - dist if dirn == "long" else entry + dist; tp = entry + dist if dirn == "long" else entry - dist; res = None; k = ei + 1
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
def report(label, tr, min_n=60):
    n = len(tr)
    if n < min_n: print(f"{TAG} {label:46s} zu wenig ({n})"); return
    usd = [(r-COST)*USD for _, r in tr]; mean = sum(usd)/n; sd = math.sqrt(sum((x-mean)**2 for x in usd)/(n-1)) or 1
    wr = sum(1 for _, r in tr if r > 0)/n*100
    py = defaultdict(lambda: [0, 0])
    for d, r in tr: py[d.year][0] += 1; py[d.year][1] += (1 if r > 0 else 0)
    yrs = " ".join(f"{y}:{v[1]/v[0]*100:.0f}%({v[0]})" for y, v in sorted(py.items()))
    print(f"{TAG} {label:46s} N={n:4d} WR={wr:5.1f}% t={mean/(sd/math.sqrt(n)):5.2f} | {yrs}", flush=True)
feats = {}
for idx, d in enumerate(T):
    if d not in atr or idx < 3: continue
    pd_ = T[idx-1]; ppd = T[idx-2]
    mv = info[pd_][3] - info[ppd][3]
    f = {"Mo": d.weekday() == 0, "Fr": d.weekday() == 4,
         "TOM": (idx + 3 < len(T) and T[idx+3].month != d.month) or T[idx-3].month != d.month,
         "PrevUp": mv >= 1.0*atr[d], "PrevDn": mv <= -1.0*atr[d],
         "ONup": info[d][2] > info[pd_][3], "ONdn": info[d][2] < info[pd_][3]}
    feats[d] = f
bull = ["Mo", "Fr", "TOM", "PrevUp", "ONup"]
print(f"##### {TAG} Runde 6 #####")
for k in (0.25, 0.5):
    for s in (1, 2, 3):
        tr = [(d, run_bar(d, info[d][4], "long", info[d][2], k*atr[d])) for d in T if d in feats and sum(feats[d][f] for f in bull) >= s]
        report(f"LONG Score>={s} +/-{k}ATR", tr)
    for f in bull + ["PrevDn", "ONdn"]:
        tr = [(d, run_bar(d, info[d][4], "long", info[d][2], k*atr[d])) for d in T if d in feats and feats[d][f]]
        report(f"LONG nur {f} +/-{k}ATR", tr)
    tr = [(d, run_bar(d, info[d][4], "long", info[d][2], k*atr[d])) for d in T if d in feats]
    report(f"LONG alle Tage +/-{k}ATR", tr)
    tr = [(d, run_bar(d, info[d][4], "short", info[d][2], k*atr[d])) for d in T if d in feats and feats[d]["PrevDn"] and feats[d]["ONdn"]]
    report(f"SHORT PrevDn&ONdn +/-{k}ATR", tr)
