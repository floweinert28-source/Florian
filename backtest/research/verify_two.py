"""Unabhaengiger Nachbau von zwei Kandidaten (eigener Code, nicht kopiert).
A) NQ London-Range 02:00-04:59 Sweep + Reclaim (Close zurueck in Range, max 120 min), Entry Close, SL Sweep-Extrem - 0.1W, TP 1R, bis 16:10.
B) NQ Gap >= 0.3*ATR10 + OR15-Break in Fill-Richtung -> Fade auf Vortagesclose, SL = OR15-Gegenseite, Exit 12:00.
Konservativ: Entry-Bar nur SL, SL vor TP. Kosten 0.75 Pkt. Split Train <2025 / Test >=2025. Zusatz: doppelte Kosten, Parameter-Nachbarn.
"""
import sys, datetime as dt
from bisect import bisect_left
from collections import defaultdict
sys.path.insert(0, "/home/user/Florian/backtest")
from sweep_reclaim_backtest import load_days

USD = 20.0
days = load_days("/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/data")
dates = sorted(days)

def is_trading_day(d):
    mods, o, c, lo, hi = days[d]
    if d.weekday() >= 5: return False
    a = bisect_left(mods, 570); b = bisect_left(mods, 960)
    if b - a < 300: return False
    flat = sum(1 for i in range(a, b) if hi[i] == lo[i])
    return flat < 30

def report(label, trades, cost_pts):
    if not trades: print(label, "keine Trades"); return
    tr = [t for t in trades]
    net = lambda ts: sum((t["pts"] - cost_pts) * USD for t in ts)
    train = [t for t in tr if t["day"] < dt.date(2025,1,1)]; test = [t for t in tr if t["day"] >= dt.date(2025,1,1)]
    wins = sum(1 for t in tr if t["pts"] > 0)
    py = defaultdict(float)
    for t in tr: py[t["day"].year] += (t["pts"] - cost_pts) * USD
    yrs = " ".join(f"{y}:{v:+.0f}" for y, v in sorted(py.items()))
    top10 = sorted(((t["pts"] - cost_pts) * USD for t in tr), reverse=True)[:10]
    print(f"{label}: N={len(tr)} WR={wins/len(tr)*100:.1f}% | Netto {net(tr):+,.0f}$ | Train {net(train):+,.0f}$ ({len(train)}) | Test {net(test):+,.0f}$ ({len(test)}) | Top10-Gewinner {sum(top10):+,.0f}$")
    print(f"    Jahre: {yrs}")

# ---------- A) London-Range Sweep + Reclaim ----------
def london_reclaim(rs=120, re=300, buf=0.1, tp_mult=1.0, max_wait=120, end_min=970):
    trades = []
    for d in dates:
        mods, o, c, lo, hi = days[d]
        if d.weekday() >= 5: continue
        a = bisect_left(mods, rs); b = bisect_left(mods, re)
        if b - a < (re - rs) * 0.87: continue
        rh = max(hi[a:b]); rl = min(lo[a:b]); W = rh - rl
        if W <= 0: continue
        m = len(mods); j = b; dirn = None
        while j < m and mods[j] < end_min:
            hh = hi[j] >= rh; hl = lo[j] <= rl
            if hh or hl:
                if hh and hl: dirn = None
                else: dirn = "long" if hl else "short"
                break
            j += 1
        if dirn is None: continue
        ext = lo[j] if dirn == "long" else hi[j]; t0 = mods[j]; ei = None
        while j < m and mods[j] - t0 <= max_wait and mods[j] < end_min:
            ext = min(ext, lo[j]) if dirn == "long" else max(ext, hi[j])
            if rl < c[j] < rh: ei = j; break
            j += 1
        if ei is None: continue
        entry = c[ei]
        sl = ext - buf * W if dirn == "long" else ext + buf * W
        sld = abs(entry - sl)
        if sld <= 0: continue
        tp = entry + tp_mult * sld if dirn == "long" else entry - tp_mult * sld
        res = None
        if (dirn == "long" and lo[ei] <= sl) or (dirn == "short" and hi[ei] >= sl): res = -sld
        k = ei + 1
        while res is None and k < m and mods[k] < end_min:
            if dirn == "long":
                if lo[k] <= sl: res = -sld; break
                if hi[k] >= tp: res = tp_mult * sld; break
            else:
                if hi[k] >= sl: res = -sld; break
                if lo[k] <= tp: res = tp_mult * sld; break
            k += 1
        if res is None:
            k = min(k, m - 1); res = (c[k] - entry) if dirn == "long" else (entry - c[k])
        trades.append({"day": d, "pts": res})
    return trades

print("=== A) NQ London-Range 02:00-05:00 Sweep+Reclaim TP1R ===")
base = london_reclaim()
report("Basis (Kosten 0.75)", base, 0.75)
report("Doppelte Kosten (1.5)", base, 1.5)
report("Nachbar: Range 02:06-05:06", london_reclaim(126, 306), 0.75)
report("Nachbar: Range 01:54-04:54", london_reclaim(114, 294), 0.75)
report("Nachbar: buf 0.2", london_reclaim(buf=0.2), 0.75)
report("Nachbar: TP 1.5R", london_reclaim(tp_mult=1.5), 0.75)
report("Nachbar: max_wait 60", london_reclaim(max_wait=60), 0.75)
# Split-Grenze verschoben
tr = [t for t in base if t["day"] < dt.date(2024,7,1)]; te = [t for t in base if t["day"] >= dt.date(2024,7,1)]
print(f"  Split 2024-07-01: Train {sum((t['pts']-0.75)*USD for t in tr):+,.0f}$ | Test {sum((t['pts']-0.75)*USD for t in te):+,.0f}$")

# ---------- B) Gap-Fade mit OR15-Bestaetigung ----------
def gap_fade(gap_thr=0.3, or_len=15, exit_min=720, atr_n=10):
    tdays = [d for d in dates if is_trading_day(d)]
    rth_ranges = {}
    for d in tdays:
        mods, o, c, lo, hi = days[d]
        a = bisect_left(mods, 570); b = bisect_left(mods, 960)
        rth_ranges[d] = max(hi[a:b]) - min(lo[a:b])
    trades = []
    for idx in range(atr_n + 1, len(tdays)):
        d = tdays[idx]; prev = tdays[idx - 1]
        atr = sum(rth_ranges[tdays[idx - k]] for k in range(1, atr_n + 1)) / atr_n
        pm, po, pc, plo, phi = days[prev]
        pb = bisect_left(pm, 959)
        if pb >= len(pm) or pm[pb] != 959: continue
        prev_close = pc[pb]
        mods, o, c, lo, hi = days[d]
        a = bisect_left(mods, 570)
        if a >= len(mods) or mods[a] != 570: continue
        gap = o[a] - prev_close
        if abs(gap) < gap_thr * atr: continue
        b = bisect_left(mods, 570 + or_len)
        orh = max(hi[a:b]); orl = min(lo[a:b])
        dirn = "short" if gap > 0 else "long"   # Fill-Richtung
        m = len(mods); j = b; ei = None
        while j < m and mods[j] < exit_min:
            if dirn == "short" and c[j] < orl: ei = j; break
            if dirn == "long" and c[j] > orh: ei = j; break
            j += 1
        if ei is None: continue
        entry = c[ei]
        sl = orh if dirn == "short" else orl
        tp = prev_close
        if (dirn == "short" and tp >= entry) or (dirn == "long" and tp <= entry): continue
        sld = abs(entry - sl); res = None
        if (dirn == "long" and lo[ei] <= sl) or (dirn == "short" and hi[ei] >= sl): res = -sld
        k = ei + 1
        while res is None and k < m and mods[k] < exit_min:
            if dirn == "long":
                if lo[k] <= sl: res = -sld; break
                if hi[k] >= tp: res = tp - entry; break
            else:
                if hi[k] >= sl: res = -sld; break
                if lo[k] <= tp: res = entry - tp; break
            k += 1
        if res is None:
            k = min(k, m - 1); res = (c[k] - entry) if dirn == "long" else (entry - c[k])
        trades.append({"day": d, "pts": res})
    return trades

print("\n=== B) NQ Gap>=0.3*ATR10 + OR15-Break Fade -> Vortagesclose, Exit 12:00 ===")
base = gap_fade()
report("Basis (Kosten 0.75)", base, 0.75)
report("Doppelte Kosten (1.5)", base, 1.5)
report("Nachbar: Gap >= 0.25", gap_fade(gap_thr=0.25), 0.75)
report("Nachbar: Gap >= 0.4", gap_fade(gap_thr=0.4), 0.75)
report("Nachbar: Gap >= 0.5", gap_fade(gap_thr=0.5), 0.75)
report("Nachbar: OR10", gap_fade(or_len=10), 0.75)
report("Nachbar: OR20", gap_fade(or_len=20), 0.75)
report("Nachbar: Exit 11:00", gap_fade(exit_min=660), 0.75)
report("Nachbar: Exit 13:00", gap_fade(exit_min=780), 0.75)
tr = [t for t in base if t["day"] < dt.date(2024,7,1)]; te = [t for t in base if t["day"] >= dt.date(2024,7,1)]
print(f"  Split 2024-07-01: Train {sum((t['pts']-0.75)*USD for t in tr):+,.0f}$ | Test {sum((t['pts']-0.75)*USD for t in te):+,.0f}$")
