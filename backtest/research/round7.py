"""Runde 7: Aus Verlierern lernen. Setup: London-Range 02-05 Sweep+Reclaim TP 1R (bestes 1:1-Setup, 54 %) und 08:12-Fade.
Fuer jeden Trade Features am Entry (kausal). Vergleich Gewinner vs Verlierer auf TRAIN, Filterregel ableiten, auf TEST pruefen.
Features: sweep_depth (Breiten), sweep_dur (min bis Reclaim), reclaim_body (Body/Range), entry_pos (Entry-Position in der Range 0..1),
vol_ratio (Sweep-Bar-Vol / Median), W_atr (Zonen-Range/ATR10), hour (Entry-Uhrzeit), wd, prev_trend (Vortag Close-Close/ATR),
dist_pdh/pdl (Entry - PDH bzw PDL in ATR), on_pos (Entry-Position in Overnight-Range).
"""
import sys, math, datetime as dt, statistics
from bisect import bisect_left
from collections import defaultdict
sys.path.insert(0, "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r3")
from load_vol import load_days_vol
DATA = sys.argv[1] if len(sys.argv) > 4 else "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/data"
COST = float(sys.argv[2]) if len(sys.argv) > 4 else 0.75; USD = float(sys.argv[3]) if len(sys.argv) > 4 else 20; TAG = sys.argv[4] if len(sys.argv) > 4 else "NQ"
days = load_days_vol(DATA); dates = sorted(days)
def zone(d, a, b, cov=0.6):
    mods, o, c, lo, hi, v = days[d]; i = bisect_left(mods, a); j = bisect_left(mods, b)
    if j - i < (b - a) * cov: return None
    return max(hi[i:j]), min(lo[i:j]), i, j
rth = {}; hist = []
for d in dates:
    if d.weekday() >= 5: continue
    z = zone(d, 570, 960)
    if z:
        mods, o, c, lo, hi, v = days[d]; rth[d] = (z[0], z[1], c[z[3]-1]); hist.append(d)
prev = {hist[i]: hist[i-1] for i in range(1, len(hist))}
atr = {hist[i]: sum(rth[hist[i-k]][0]-rth[hist[i-k]][1] for k in range(1, 11))/10 for i in range(10, len(hist))}

def build(zs, ze, buf=0.1, max_wait=120, entry_mode="reclaim"):
    rows = []
    for d in dates:
        if d.weekday() >= 5 or d not in atr or d not in prev: continue
        z = zone(d, zs, ze, 0.87 if zs == 120 else 0.6)
        if z is None: continue
        rh, rl, a, b = z; W = rh - rl
        if W <= 0: continue
        mods, o, c, lo, hi, v = days[d]; m = len(mods); j = b; dirn = None
        while j < m and mods[j] < 960:
            hh = hi[j] >= rh; hl = lo[j] <= rl
            if hh or hl:
                dirn = None if (hh and hl) else ("short" if hh else "long"); break
            j += 1
        if dirn is None: continue
        medv = statistics.median(v[max(0, j-60):j]) if j > 10 else 0
        ext = hi[j] if dirn == "short" else lo[j]; k = j; ei = None
        if entry_mode == "reclaim":
            while k < m and mods[k] - mods[j] <= max_wait and mods[k] < 960:
                ext = max(ext, hi[k]) if dirn == "short" else min(ext, lo[k])
                if rl < c[k] < rh: ei = k; break
                k += 1
            if ei is None: continue
            entry = c[ei]; sl = ext + buf*W if dirn == "short" else ext - buf*W
        else:
            ei = j; entry = rh if dirn == "short" else rl; sl = entry + W if dirn == "short" else entry - W
        sld = abs(entry - sl)
        if sld <= 0: continue
        tp = entry - sld if dirn == "short" else entry + sld; res = None
        if (dirn == "long" and lo[ei] <= sl) or (dirn == "short" and hi[ei] >= sl): res = -sld
        kk = ei + 1
        while res is None and kk < m and mods[kk] < 960:
            if dirn == "long":
                if lo[kk] <= sl: res = -sld; break
                if hi[kk] >= tp: res = sld; break
            else:
                if hi[kk] >= sl: res = -sld; break
                if lo[kk] <= tp: res = sld; break
            kk += 1
        if res is None:
            kk = min(kk, m-1); res = (c[kk]-entry) if dirn == "long" else (entry-c[kk])
        pd_ = prev[d]; pdh, pdl, pdc = rth[pd_]; ppc = rth[prev[pd_]][2] if pd_ in prev else pdc
        on = zone(d, 0, zs, 0.3)
        A = atr[d]
        feats = dict(
            sweep_depth=((ext - rh) if dirn == "short" else (rl - ext)) / W,
            sweep_dur=mods[ei] - mods[j],
            reclaim_body=abs(c[ei]-o[ei]) / (hi[ei]-lo[ei]) if hi[ei] > lo[ei] else 0,
            entry_pos=(entry - rl) / W,
            vol_ratio=(v[j] / medv) if medv else 0,
            W_atr=W / A, hour=mods[ei] / 60, wd=d.weekday(),
            prev_trend=(pdc - ppc) / A,
            dist_pdh=(pdh - entry) / A, dist_pdl=(entry - pdl) / A,
            on_pos=((entry - on[1]) / (on[0]-on[1])) if on and on[0] > on[1] else 0.5,
            dir_long=1 if dirn == "long" else 0,
        )
        rows.append(dict(day=d, win=res > 0, usd=(res - COST) * USD, **feats))
    return rows

def analyze(name, rows):
    tr = [r for r in rows if r["day"] < dt.date(2025,1,1)]; te = [r for r in rows if r["day"] >= dt.date(2025,1,1)]
    print(f"\n=== {TAG} {name}: Train N={len(tr)} WR={sum(r['win'] for r in tr)/len(tr)*100:.1f}% | Test N={len(te)} WR={sum(r['win'] for r in te)/len(te)*100:.1f}% ===")
    feats = [k for k in rows[0] if k not in ("day", "win", "usd")]
    best = []
    for f in feats:
        vals = sorted(r[f] for r in tr); qs = [vals[int(len(vals)*q)] for q in (0.25, 0.5, 0.75)]
        parts = []
        for lo_, hi_ in ((-1e9, qs[0]), (qs[0], qs[1]), (qs[1], qs[2]), (qs[2], 1e9)):
            g = [r for r in tr if lo_ <= r[f] < hi_]; gt = [r for r in te if lo_ <= r[f] < hi_]
            if not g: continue
            wtr = sum(r["win"] for r in g)/len(g)*100; wte = (sum(r["win"] for r in gt)/len(gt)*100) if gt else float("nan")
            parts.append(f"{wtr:4.0f}/{wte:4.0f}({len(g)})")
            best.append((wtr, wte, len(g), len(gt), f, lo_, hi_))
        print(f"  {f:13s} Quartile Train/Test WR%: " + " | ".join(parts))
    print("  -> Beste Train-Quartile (WR Train / Test, N):")
    for wtr, wte, n, nt, f, lo_, hi_ in sorted(best, key=lambda x: -x[0])[:6]:
        print(f"     {f:13s} [{lo_:.2f},{hi_:.2f}) Train {wtr:.1f}% ({n}) -> Test {wte:.1f}% ({nt})")
    # Kombi: die zwei besten Features (Train), Test
    top = sorted(best, key=lambda x: -x[0])
    seen = []; combo = []
    for item in top:
        if item[4] in seen: continue
        seen.append(item[4]); combo.append(item)
        if len(combo) == 2: break
    if len(combo) == 2:
        sel = lambda r: all(lo_ <= r[f] < hi_ for _, _, _, _, f, lo_, hi_ in combo)
        g = [r for r in tr if sel(r)]; gt = [r for r in te if sel(r)]
        if g and gt:
            print(f"  Kombi {combo[0][4]}&{combo[1][4]}: Train WR {sum(r['win'] for r in g)/len(g)*100:.1f}% ({len(g)}) -> Test WR {sum(r['win'] for r in gt)/len(gt)*100:.1f}% ({len(gt)})")

if __name__ == "__main__":
    analyze("London 02-05 Sweep+Reclaim 1R", build(120, 300))
    analyze("08:12-09:12 Fade an der Linie 1R", build(492, 552, entry_mode="line"))
    analyze("08:12-09:12 Sweep+Reclaim 1R", build(492, 552))
