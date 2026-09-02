"""Runde 9: Kandidat 'Down-Vortag + starker Reclaim' (a) Ausfuehrungsvarianten auf London-Zone, (b) Zeit-Karte: dieselbe Regel auf
Sweep+Reclaim aller 30-min-Zonen des Tages (NQ), (c) Verlierer-Features innerhalb des Kandidaten."""
import sys, math, datetime as dt, statistics
from bisect import bisect_left
from collections import defaultdict
sys.path.insert(0, "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r3")
import round7 as R
SP = "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad"
PT, BT = -0.3, 0.7

def stats(rows):
    n = len(rows)
    if n == 0: return "n=0"
    wr = sum(r["win"] for r in rows)/n*100; usd = [r["usd"] for r in rows]; mean = sum(usd)/n
    sd = math.sqrt(sum((x-mean)**2 for x in usd)/(n-1)) if n > 1 else 1; t = mean/(sd/math.sqrt(n)) if sd else 0
    return f"N={n:3d} WR={wr:5.1f}% t={t:5.2f} Netto {sum(usd):+7.0f}"
def ev(tag, rows):
    sel = [r for r in rows if r["prev_trend"] < PT and r["reclaim_body"] >= BT]
    tr = [r for r in sel if r["day"] < dt.date(2025,1,1)]; te = [r for r in sel if r["day"] >= dt.date(2025,1,1)]
    print(f"{tag:44s} ALL {stats(sel)} | Train {stats(tr)} | Test {stats(te)}", flush=True)
    return sel

def build_var(zs, ze, buf=0.1, max_wait=120, tp_mult=1.0, end=960, cov=0.87):
    """Wie R.build (reclaim), aber mit TP-Multiplikator und Ende-Zeit."""
    rows = []
    for d in R.dates:
        if d.weekday() >= 5 or d not in R.atr or d not in R.prev: continue
        z = R.zone(d, zs, ze, cov)
        if z is None: continue
        rh, rl, a, b = z; W = rh - rl
        if W <= 0: continue
        mods, o, c, lo, hi, v = R.days[d]; m = len(mods); j = b; dirn = None
        while j < m and mods[j] < end:
            hh = hi[j] >= rh; hl = lo[j] <= rl
            if hh or hl:
                dirn = None if (hh and hl) else ("short" if hh else "long"); break
            j += 1
        if dirn is None: continue
        ext = hi[j] if dirn == "short" else lo[j]; k = j; ei = None
        while k < m and mods[k] - mods[j] <= max_wait and mods[k] < end:
            ext = max(ext, hi[k]) if dirn == "short" else min(ext, lo[k])
            if rl < c[k] < rh: ei = k; break
            k += 1
        if ei is None: continue
        entry = c[ei]; sl = ext + buf*W if dirn == "short" else ext - buf*W; sld = abs(entry - sl)
        if sld <= 0: continue
        tp = entry - tp_mult*sld if dirn == "short" else entry + tp_mult*sld; res = None
        if (dirn == "long" and lo[ei] <= sl) or (dirn == "short" and hi[ei] >= sl): res = -sld
        kk = ei + 1
        while res is None and kk < m and mods[kk] < end:
            if dirn == "long":
                if lo[kk] <= sl: res = -sld; break
                if hi[kk] >= tp: res = tp_mult*sld; break
            else:
                if hi[kk] >= sl: res = -sld; break
                if lo[kk] <= tp: res = tp_mult*sld; break
            kk += 1
        if res is None:
            kk = min(kk, m-1); res = (c[kk]-entry) if dirn == "long" else (entry-c[kk])
        pd_ = R.prev[d]; pdh, pdl, pdc = R.rth[pd_]; ppc = R.rth[R.prev[pd_]][2] if pd_ in R.prev else pdc
        A = R.atr[d]
        rows.append(dict(day=d, win=res > 0, usd=(res - R.COST) * R.USD, prev_trend=(pdc - ppc)/A,
                         reclaim_body=abs(c[ei]-o[ei])/(hi[ei]-lo[ei]) if hi[ei] > lo[ei] else 0,
                         sld=sld, W=W, entry_t=mods[ei], sweep_t=mods[j], dirn=dirn, hold=(mods[min(kk, m-1)] - mods[ei])))
    return rows

R.days = R.load_days_vol(SP + "/data"); R.dates = sorted(R.days); R.COST = 0.75; R.USD = 20; R.TAG = "NQ"
R.rth = {}; R.hist = []
for d in R.dates:
    if d.weekday() >= 5: continue
    z = R.zone(d, 570, 960)
    if z:
        mods, o, c, lo, hi, v = R.days[d]; R.rth[d] = (z[0], z[1], c[z[3]-1]); R.hist.append(d)
R.prev = {R.hist[i]: R.hist[i-1] for i in range(1, len(R.hist))}
R.atr = {R.hist[i]: sum(R.rth[R.hist[i-k]][0]-R.rth[R.hist[i-k]][1] for k in range(1, 11))/10 for i in range(10, len(R.hist))}

print("##### (a) Ausfuehrungsvarianten London 02-05, Filter pt<-0.3 & body>=0.7 #####")
base = ev("Basis buf0.1 wait120 TP1R bis16:00", build_var(120, 300))
ev("buf 0.2", build_var(120, 300, buf=0.2)); ev("buf 0.0", build_var(120, 300, buf=0.0))
ev("wait 60", build_var(120, 300, max_wait=60)); ev("wait 240", build_var(120, 300, max_wait=240))
ev("TP 0.75R", build_var(120, 300, tp_mult=0.75)); ev("TP 1.5R", build_var(120, 300, tp_mult=1.5)); ev("TP 2R", build_var(120, 300, tp_mult=2.0))
ev("Ende 12:00", build_var(120, 300, end=720)); ev("Ende 09:30", build_var(120, 300, end=570))
ev("Zone 02:00-04:30", build_var(120, 270)); ev("Zone 02:30-05:00", build_var(150, 300)); ev("Zone 01:30-05:00", build_var(90, 300))
ev("Zone 18:00-02:00 (Asia)", build_var(1080, 1440, cov=0.5))
print("\n##### (b) Zeit-Karte: Sweep+Reclaim 30-min-Zonen, gleicher Filter #####")
for zs in range(0, 1410, 30):
    rows = build_var(zs, zs+30, cov=0.8)
    if rows: ev(f"Zone {zs//60:02d}:{zs%60:02d}-{(zs+30)//60:02d}:{(zs+30)%60:02d}", rows)
print("\n##### (c) Verlierer-Features im Kandidaten (Basis) #####")
for f in ("sld", "W", "entry_t", "sweep_t", "hold", "prev_trend", "reclaim_body"):
    vals = sorted(r[f] for r in base); med = vals[len(vals)//2]
    lo_ = [r for r in base if r[f] < med]; hi_ = [r for r in base if r[f] >= med]
    print(f"  {f:13s} < {med:8.2f}: WR {sum(r['win'] for r in lo_)/len(lo_)*100:5.1f}% ({len(lo_)}) | >= : WR {sum(r['win'] for r in hi_)/len(hi_)*100:5.1f}% ({len(hi_)})")
for dn in ("long", "short"):
    g = [r for r in base if r["dirn"] == dn]; print(f"  dir {dn}: {stats(g)}")
