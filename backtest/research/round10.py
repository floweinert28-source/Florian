"""Runde 10: Zweites Setup suchen – gleiche Methodik (Features am Entry, Quartile Train->Test) auf:
 Asia-Range (18:00 Vortag - 02:00) Sweep+Reclaim ab 02:00; Open-Range 09:30-10:00 Sweep+Reclaim; Pre-Market 05:00-08:00 Sweep+Reclaim; RTH-Vortagesrange (PDH/PDL) Sweep+Reclaim ab 09:30.
"""
import sys, math, datetime as dt, statistics
from bisect import bisect_left
sys.path.insert(0, "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r3")
import round7 as R
SP = "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad"
R.days = R.load_days_vol(SP + "/data"); R.dates = sorted(R.days); R.COST = 0.75; R.USD = 20; R.TAG = "NQ"
R.rth = {}; R.hist = []
for d in R.dates:
    if d.weekday() >= 5: continue
    z = R.zone(d, 570, 960)
    if z:
        mods, o, c, lo, hi, v = R.days[d]; R.rth[d] = (z[0], z[1], c[z[3]-1]); R.hist.append(d)
R.prev = {R.hist[i]: R.hist[i-1] for i in range(1, len(R.hist))}
R.atr = {R.hist[i]: sum(R.rth[R.hist[i-k]][0]-R.rth[R.hist[i-k]][1] for k in range(1, 11))/10 for i in range(10, len(R.hist))}

def build_custom(range_fn, start_min, end=960, buf=0.1, max_wait=120):
    rows = []
    for d in R.dates:
        if d.weekday() >= 5 or d not in R.atr or d not in R.prev: continue
        rr = range_fn(d)
        if rr is None: continue
        rh, rl = rr; W = rh - rl
        if W <= 0: continue
        mods, o, c, lo, hi, v = R.days[d]; m = len(mods); j = bisect_left(mods, start_min); dirn = None
        while j < m and mods[j] < end:
            hh = hi[j] >= rh; hl = lo[j] <= rl
            if hh or hl:
                dirn = None if (hh and hl) else ("short" if hh else "long"); break
            j += 1
        if dirn is None: continue
        medv = statistics.median(v[max(0, j-60):j]) if j > 10 else 0
        ext = hi[j] if dirn == "short" else lo[j]; k = j; ei = None
        while k < m and mods[k] - mods[j] <= max_wait and mods[k] < end:
            ext = max(ext, hi[k]) if dirn == "short" else min(ext, lo[k])
            if rl < c[k] < rh: ei = k; break
            k += 1
        if ei is None: continue
        entry = c[ei]; sl = ext + buf*W if dirn == "short" else ext - buf*W; sld = abs(entry - sl)
        if sld <= 0: continue
        tp = entry - sld if dirn == "short" else entry + sld; res = None
        if (dirn == "long" and lo[ei] <= sl) or (dirn == "short" and hi[ei] >= sl): res = -sld
        kk = ei + 1
        while res is None and kk < m and mods[kk] < end:
            if dirn == "long":
                if lo[kk] <= sl: res = -sld; break
                if hi[kk] >= sld and hi[kk] >= tp: res = sld; break
            else:
                if hi[kk] >= sl: res = -sld; break
                if lo[kk] <= tp: res = sld; break
            kk += 1
        if res is None:
            kk = min(kk, m-1); res = (c[kk]-entry) if dirn == "long" else (entry-c[kk])
        pd_ = R.prev[d]; pdh, pdl, pdc = R.rth[pd_]; ppc = R.rth[R.prev[pd_]][2] if pd_ in R.prev else pdc; A = R.atr[d]
        on = R.zone(d, 0, start_min, 0.3)
        rows.append(dict(day=d, win=res > 0, usd=(res - R.COST) * R.USD,
            sweep_depth=((ext - rh) if dirn == "short" else (rl - ext)) / W, sweep_dur=mods[ei]-mods[j],
            reclaim_body=abs(c[ei]-o[ei])/(hi[ei]-lo[ei]) if hi[ei] > lo[ei] else 0, entry_pos=(entry-rl)/W,
            vol_ratio=(v[j]/medv) if medv else 0, W_atr=W/A, hour=mods[ei]/60, wd=d.weekday(),
            prev_trend=(pdc-ppc)/A, dist_pdh=(pdh-entry)/A, dist_pdl=(entry-pdl)/A,
            on_pos=((entry-on[1])/(on[0]-on[1])) if on and on[0] > on[1] else 0.5, dir_long=1 if dirn == "long" else 0))
    return rows

def asia_range(d):
    pd_ = R.prev.get(d)
    if pd_ is None or (d - pd_).days > 3: return None
    mods, o, c, lo, hi, v = R.days[pd_]; i = bisect_left(mods, 1080)
    if len(mods) - i < 200: return None
    h1, l1 = max(hi[i:]), min(lo[i:])
    mods2, o2, c2, lo2, hi2, v2 = R.days[d]; j = bisect_left(mods2, 120)
    if j < 60: return None
    return max(h1, max(hi2[:j])), min(l1, min(lo2[:j]))
def pd_range(d):
    pd_ = R.prev.get(d); return (R.rth[pd_][0], R.rth[pd_][1]) if pd_ else None
def zone_range(a, b):
    def f(d):
        z = R.zone(d, a, b, 0.6); return (z[0], z[1]) if z else None
    return f

R.analyze("Asia-Range (18:00-02:00) Sweep+Reclaim ab 02:00, 1R", build_custom(asia_range, 120))
R.analyze("Pre-Market 05:00-08:00 Sweep+Reclaim, 1R", build_custom(zone_range(300, 480), 480))
R.analyze("Open-Range 09:30-10:00 Sweep+Reclaim, 1R", build_custom(zone_range(570, 600), 600))
R.analyze("PDH/PDL Sweep+Reclaim ab 09:30, 1R", build_custom(pd_range, 570))
