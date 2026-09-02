"""Runde 11 (NQ): (A) LDR-Generalisierung fuer Frequenz: London-Reclaim mit Body-Schwelle ohne/mit lockerem Vortagsfilter, W-Filter.
(B) 'London retraced -> NY setzt fort': nach Down-Vortag (<= -k ATR) und Premarket-Retrace nach oben (05:00-09:29 High - 05:00 Open >= r*ATR)
    -> Short ab 09:30 mit +/- m ATR bis 16:00; Spiegel fuer Up-Vortag. Plus: Bedingung 'LDR-Trade heute gewonnen' (London reclaim stattgefunden)."""
import sys, math, datetime as dt
from bisect import bisect_left
from collections import defaultdict
sys.path.insert(0, "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r3")
import round7 as R
import round9 as R9
SP = "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad"
# round9 hat R bereits mit NQ initialisiert (Import fuehrt Modul-Code aus) - Ausgabe davon ignorieren wir.
def stats(rows):
    n = len(rows)
    if n == 0: return "n=0"
    wr = sum(r["win"] for r in rows)/n*100; usd = [r["usd"] for r in rows]; mean = sum(usd)/n
    sd = math.sqrt(sum((x-mean)**2 for x in usd)/(n-1)) if n > 1 else 1; t = mean/(sd/math.sqrt(n)) if sd else 0
    return f"N={n:3d} WR={wr:5.1f}% t={t:5.2f} Netto {sum(usd):+7.0f}"
def ev(tag, sel):
    tr = [r for r in sel if r["day"] < dt.date(2025,1,1)]; te = [r for r in sel if r["day"] >= dt.date(2025,1,1)]
    py = defaultdict(lambda: [0, 0])
    for r in sel: py[r["day"].year][0] += 1; py[r["day"].year][1] += r["win"]
    yrs = " ".join(f"{y}:{v[1]/v[0]*100:.0f}%({v[0]})" for y, v in sorted(py.items()))
    print(f"{tag:46s} ALL {stats(sel)} | Train {stats(tr)} | Test {stats(te)} | {yrs}", flush=True)

print("\n##### (A) London-Reclaim: Frequenz-Varianten #####")
base = R9.build_var(120, 300)
for bt in (0.75, 0.8, 0.85, 0.9):
    ev(f"Body>={bt}, KEIN Vortagsfilter", [r for r in base if r["reclaim_body"] >= bt])
    ev(f"Body>={bt}, Vortag<0 (jeder Down-Tag)", [r for r in base if r["reclaim_body"] >= bt and r["prev_trend"] < 0])
    ev(f"Body>={bt}, Vortag<-0.3", [r for r in base if r["reclaim_body"] >= bt and r["prev_trend"] < -0.3])
medW = sorted(r["W"] for r in base)[len(base)//2]
ev(f"Body>=0.75 & Vortag<-0.3 & W>=Median({medW:.0f})", [r for r in base if r["reclaim_body"] >= 0.75 and r["prev_trend"] < -0.3 and r["W"] >= medW])
ev("Body>=0.83 & Vortag<-0.3", [r for r in base if r["reclaim_body"] >= 0.83 and r["prev_trend"] < -0.3])
ev("Body>=0.83 & Vortag<0", [r for r in base if r["reclaim_body"] >= 0.83 and r["prev_trend"] < 0])
ev("Body>=0.83, kein Filter", [r for r in base if r["reclaim_body"] >= 0.83])

print("\n##### (B) NY-Fortsetzung nach Down-Vortag mit Premarket-Retrace #####")
days = R.days; dates = R.dates
ldr_days = {r["day"]: r["win"] for r in base if r["reclaim_body"] >= 0.75 and r["prev_trend"] < -0.3}
def run_open(dirn, d, m_atr):
    mods, o, c, lo, hi, v = days[d]; a = bisect_left(mods, 570)
    if a >= len(mods) or mods[a] != 570: return None
    entry = o[a]; dist = m_atr * R.atr[d]; sl = entry - dist if dirn == "long" else entry + dist; tp = entry + dist if dirn == "long" else entry - dist
    k = a + 1; res = None
    while k < len(mods) and mods[k] < 960:
        if dirn == "long":
            if lo[k] <= sl: res = -dist; break
            if hi[k] >= tp: res = dist; break
        else:
            if hi[k] >= sl: res = -dist; break
            if lo[k] <= tp: res = dist; break
        k += 1
    if res is None:
        k = min(k, len(mods)-1); res = (c[k]-entry) if dirn == "long" else (entry-c[k])
    return dict(day=d, win=res > 0, usd=(res - 0.75) * 20)
for k_prev in (0.3, 0.5, 1.0):
    for r_ret in (0.0, 0.25, 0.5):
        for m in (0.25, 0.5):
            sel = []
            for d in dates:
                if d.weekday() >= 5 or d not in R.atr or d not in R.prev: continue
                pd_ = R.prev[d]
                if pd_ not in R.prev: continue
                pt = (R.rth[pd_][2] - R.rth[R.prev[pd_]][2]) / R.atr[d]
                if pt > -k_prev: continue
                mods, o, c, lo, hi, v = days[d]; i0 = bisect_left(mods, 300); i1 = bisect_left(mods, 570)
                if i1 - i0 < 150 or i0 >= len(mods): continue
                retrace = (max(hi[i0:i1]) - o[i0]) / R.atr[d]
                if retrace < r_ret: continue
                t = run_open("short", d, m)
                if t: sel.append(t)
            ev(f"Vortag<=-{k_prev} & PreMkt-Retrace>={r_ret}ATR -> Short +/-{m}ATR", sel)
print("--- mit LDR-Bedingung (London-Reclaim fand statt) ---")
for m in (0.25, 0.5):
    sel = [run_open("short", d, m) for d in ldr_days]
    ev(f"LDR-Tage -> 09:30 Short +/-{m}ATR", [s for s in sel if s])
    sel = [run_open("long", d, m) for d in ldr_days]
    ev(f"LDR-Tage -> 09:30 Long +/-{m}ATR", [s for s in sel if s])
print("--- Spiegel: Up-Vortag & PreMkt-Retrace nach unten -> Long ---")
for k_prev in (0.5, 1.0):
    for r_ret in (0.25, 0.5):
        sel = []
        for d in dates:
            if d.weekday() >= 5 or d not in R.atr or d not in R.prev: continue
            pd_ = R.prev[d]
            if pd_ not in R.prev: continue
            pt = (R.rth[pd_][2] - R.rth[R.prev[pd_]][2]) / R.atr[d]
            if pt < k_prev: continue
            mods, o, c, lo, hi, v = days[d]; i0 = bisect_left(mods, 300); i1 = bisect_left(mods, 570)
            if i1 - i0 < 150 or i0 >= len(mods): continue
            retrace = (o[i0] - min(lo[i0:i1])) / R.atr[d]
            if retrace < r_ret: continue
            t = run_open("long", d, 0.5)
            if t: sel.append(t)
        ev(f"Vortag>=+{k_prev} & PreMkt-Retrace>={r_ret}ATR -> Long +/-0.5ATR", sel)
