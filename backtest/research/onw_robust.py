"""Robustheit: Fade an der 08:12-09:12-Linie an Kompressionstagen (Overnight-Range / Zonen-Range >= k)."""
import sys, datetime as dt, math, random
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

def build(RS, RE, on_start):
    setups = []
    for idx, d in enumerate(dates):
        if d.weekday() >= 5: continue
        r = rng(d, RS, RE)
        if r is None: continue
        rh, rl, a, b = r; W = rh - rl
        if W <= 0: continue
        if on_start == 0:
            on = rng(d, 0, RS)
        else:  # 18:00 Vortag bis RS
            prev = dates[idx-1] if idx > 0 else None
            if prev is None or (d - prev).days > 3: continue
            p = rng(prev, 18*60, 24*60, 0.3); q = rng(d, 0, RS)
            on = (max(p[0], q[0]), min(p[1], q[1]), 0, 0) if p and q else None
        if on is None: continue
        setups.append(dict(day=d, rh=rh, rl=rl, W=W, b=b, on_W=(on[0]-on[1])/W, wd=d.weekday()))
    return setups

def simulate(ss, sl_mult, tp_mode="other", end=960):
    trades = []
    for s in ss:
        mods, o, c, lo, hi = days[s["day"]]; m = len(mods); rh, rl, W = s["rh"], s["rl"], s["W"]
        j = s["b"]; dirn = None
        while j < m and mods[j] < end:
            hh = hi[j] >= rh; hl = lo[j] <= rl
            if hh or hl:
                dirn = None if (hh and hl) else ("short" if hh else "long"); break
            j += 1
        if dirn is None: continue
        entry = rh if dirn == "short" else rl
        sl = entry + sl_mult*W if dirn == "short" else entry - sl_mult*W
        tp = (rl if dirn == "short" else rh) if tp_mode == "other" else (rh+rl)/2
        sld = sl_mult*W; tpd = abs(tp-entry); res = None
        if (dirn == "long" and lo[j] <= sl) or (dirn == "short" and hi[j] >= sl): res = -sld
        k = j + 1
        while res is None and k < m and mods[k] < end:
            if dirn == "long":
                if lo[k] <= sl: res = -sld; break
                if hi[k] >= tp: res = tpd; break
            else:
                if hi[k] >= sl: res = -sld; break
                if lo[k] <= tp: res = tpd; break
            k += 1
        if res is None:
            k = min(k, m-1); res = (c[k]-entry) if dirn == "long" else (entry-c[k])
        trades.append(dict(day=s["day"], usd=(res-COST)*USD, W=W, first_t=mods[j]))
    return trades

def stats(trades):
    n = len(trades)
    if n < 30: return None
    xs = [t["usd"] for t in trades]; mean = sum(xs)/n
    sd = math.sqrt(sum((x-mean)**2 for x in xs)/(n-1)); t = mean/(sd/math.sqrt(n))
    tr = [t_ for t_ in trades if t_["day"] < dt.date(2025,1,1)]; te = [t_ for t_ in trades if t_["day"] >= dt.date(2025,1,1)]
    py = defaultdict(float)
    for t_ in trades: py[t_["day"].year] += t_["usd"]
    pos = sum(1 for v in py.values() if v > 0)
    return dict(n=n, net=sum(xs), mean=mean, t=t, train=sum(x["usd"] for x in tr), test=sum(x["usd"] for x in te), pos=f"{pos}/{len(py)}",
                wr=sum(1 for x in xs if x > 0)/n*100, medW=sorted(t_["W"] for t_ in trades)[n//2])

def line(label, trades):
    s = stats(trades)
    if s is None: print(f"{label}: zu wenig ({len(trades)})"); return
    print(f"{label}: N={s['n']} WR={s['wr']:.1f}% Ø{s['mean']:+.0f}$ t={s['t']:.2f} | Netto {s['net']:+,.0f} | Train {s['train']:+,.0f} | Test {s['test']:+,.0f} | Jahre+ {s['pos']} | MedW {s['medW']:.1f}")

base = build(8*60+12, 9*60+12, 0)
print("=== Schwelle ON/W (Overnight = 00:00-08:12), TP other, SL 1.0W ===")
for k in (1.5, 2, 2.5, 3, 3.5, 4, 5):
    line(f"ON/W>={k}", simulate([s for s in base if s["on_W"] >= k], 1.0))
print("\n=== Schwelle ON/W mit Overnight = 18:00-08:12 ===")
base18 = build(8*60+12, 9*60+12, 18)
for k in (2, 3, 4, 5, 6):
    line(f"ON18/W>={k}", simulate([s for s in base18 if s["on_W"] >= k], 1.0))
print("\n=== ON/W>=3: Wochentage einzeln ===")
for wd, nm in enumerate(["Mo","Di","Mi","Do","Fr"]):
    line(f"  {nm}", simulate([s for s in base if s["on_W"] >= 3 and s["wd"] == wd], 1.0))
print("\n=== ON/W>=3: SL/TP-Nachbarn ===")
sel = [s for s in base if s["on_W"] >= 3]
for slm in (0.5, 0.75, 1.0, 1.25, 1.5, 2.0):
    line(f"  TP other SL {slm}W", simulate(sel, slm))
line("  TP mid SL 1.0W", simulate(sel, 1.0, "mid"))
line("  Ende 12:00 statt 16:00", simulate(sel, 1.0, "other", 720))
print("\n=== ON/W>=3: Zonen-Nachbarn ===")
for rs, re_ in ((8*60+6, 9*60+6), (8*60+18, 9*60+18), (8*60, 9*60), (8*60+30, 9*60+30), (8*60+12, 9*60), (8*60+12, 9*60+30)):
    line(f"  Zone {rs//60:02d}:{rs%60:02d}-{re_//60:02d}:{re_%60:02d}", simulate([s for s in build(rs, re_, 0) if s["on_W"] >= 3], 1.0))
print("\n=== ON/W>=3: Kosten x2 ===")
COST *= 2
line("  Kosten doppelt", simulate(sel, 1.0))
COST /= 2
# Bootstrap ueber Jahre (Block): Wahrscheinlichkeit, dass Mittelwert <= 0
tr = simulate(sel, 1.0)
byy = defaultdict(list)
for t_ in tr: byy[t_["day"].year].append(t_["usd"])
years = list(byy); random.seed(1); neg = 0; B = 2000
for _ in range(B):
    smp = [x for y in random.choices(years, k=len(years)) for x in byy[y]]
    if sum(smp)/len(smp) <= 0: neg += 1
print(f"\nBlock-Bootstrap (Jahre) ON/W>=3 SL1.0: P(Mittel<=0) = {neg/B*100:.1f}%")
