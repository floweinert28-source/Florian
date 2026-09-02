"""Gefiltertes Range-Muster (08:12-09:12) -> konkreter Trade.
Filter (alle kausal): F1 Range-Breite/ATR10 < 0.2 (bekannt 09:12); F2 erster Bruch vor 09:30;
F3 Sweep-Tiefe binnen 30 min nach erstem Bruch < 0.25 Breiten (bekannt 30 min nach Bruch).
Trade-Varianten nach Bestaetigung des Filters:
  E1 "t30":  Entry am Close des Bars 30 min nach erstem Bruch (Richtung: zur anderen Seite).
  E2 "reclaim": Entry am ersten Close zurueck in der Range NACH Ablauf der 30 min (Tiefe dann bekannt) bzw. sofort
             wenn zum Zeitpunkt t30 schon in der Range.
SL = Sweep-Extrem -/+ buf*W; TP = andere Range-Seite ("other") oder Range-Mitte ("mid"). Auswertung bis 16:00.
Kosten 0.75 Pkt NQ / 0.4 ES. Split Train <2025 / Test >=2025.
"""
import sys, datetime as dt
from bisect import bisect_left
from collections import defaultdict
sys.path.insert(0, "/home/user/Florian/backtest")
from sweep_reclaim_backtest import load_days
DATA = sys.argv[1]; COST = float(sys.argv[2]); USD = float(sys.argv[3])
days = load_days(DATA); dates = sorted(days)
RS, RE = 8*60+12, 9*60+12

def rng(d, a_min, b_min):
    mods, o, c, lo, hi = days[d]
    a = bisect_left(mods, a_min); b = bisect_left(mods, b_min)
    if b - a < (b_min - a_min) * 0.6: return None
    return max(hi[a:b]), min(lo[a:b]), a, b

rth_hist = []
setups = []
for idx, d in enumerate(dates):
    if d.weekday() >= 5: continue
    mods, o, c, lo, hi = days[d]
    r = rng(d, RS, RE)
    rr = rng(d, 570, 960)
    atr = sum(rth_hist[-10:]) / len(rth_hist[-10:]) if len(rth_hist) >= 5 else None
    if rr: rth_hist.append(rr[0] - rr[1])
    if r is None or atr is None: continue
    rh, rl, a, b = r; W = rh - rl
    if W <= 0: continue
    on = rng(d, 0, RS)
    m = len(mods); j = b; first = None
    while j < m and mods[j] < 960:
        hh = hi[j] >= rh; hl = lo[j] <= rl
        if hh or hl:
            if hh and hl: first = "skip"
            else: first = "high" if hh else "low"
            break
        j += 1
    if first in (None, "skip"): continue
    fb = j; ft = mods[j]
    # Tiefe binnen 30 min + Index des Bars bei t+30
    ext = hi[fb] if first == "high" else lo[fb]; k = fb; both_hit_early = False
    while k < m and mods[k] - ft <= 30:
        ext = max(ext, hi[k]) if first == "high" else min(ext, lo[k])
        if (first == "high" and lo[k] <= rl) or (first == "low" and hi[k] >= rh): both_hit_early = True
        k += 1
    t30 = k - 1
    depth = ((ext - rh) if first == "high" else (rl - ext)) / W
    # Ergebnis bis 16:00: andere Seite geholt?
    other = False; kk = fb
    while kk < m and mods[kk] < 960:
        if (first == "high" and lo[kk] <= rl) or (first == "low" and hi[kk] >= rh): other = True; break
        kk += 1
    setups.append(dict(day=d, W=W, W_atr=W/atr, on_W=((on[0]-on[1])/W) if on else None, first=first, ft=ft,
                       depth=depth, ext=ext, rh=rh, rl=rl, fb=fb, t30=t30, both_early=both_hit_early, other=other))

def stat(label, ss):
    tr = [s for s in ss if s["day"] < dt.date(2025,1,1)]; te = [s for s in ss if s["day"] >= dt.date(2025,1,1)]
    q = lambda x: (sum(1 for s in x if s["other"]) / len(x) * 100) if x else float('nan')
    print(f"{label}: Train {q(tr):.1f}% ({len(tr)}) | Test {q(te):.1f}% ({len(te)})")

print("=== Bedingte Quoten (andere Seite bis 16:00) ===")
stat("Alle Setups", setups)
f1 = [s for s in setups if s["W_atr"] < 0.2]; stat("F1 W/ATR<0.2", f1)
f12 = [s for s in f1 if s["ft"] < 570]; stat("F1+F2 Bruch<09:30", f12)
f123 = [s for s in f12 if s["depth"] < 0.25 and not s["both_early"]]; stat("F1+F2+F3 Tiefe<0.25 (andere Seite noch nicht geholt)", f123)
f23 = [s for s in setups if s["ft"] < 570 and s["depth"] < 0.25 and not s["both_early"]]; stat("F2+F3 ohne F1", f23)
f3 = [s for s in setups if s["depth"] < 0.25 and not s["both_early"]]; stat("nur F3", f3)
f13on = [s for s in f123 if s["on_W"] is not None and s["on_W"] >= 2]; stat("F1+F2+F3+ON/W>=2", f13on)

def simulate(ss, entry_mode, tp_mode, buf):
    trades = []
    for s in ss:
        mods, o, c, lo, hi = days[s["day"]]; m = len(mods)
        rh, rl, W = s["rh"], s["rl"], s["W"]
        dirn = "short" if s["first"] == "high" else "long"
        ei = None
        if entry_mode == "t30":
            ei = s["t30"]
        else:
            k = s["t30"]
            while k < m and mods[k] < 960:
                if rl < c[k] < rh: ei = k; break
                k += 1
        if ei is None: continue
        entry = c[ei]
        sl = s["ext"] + buf * W if dirn == "short" else s["ext"] - buf * W
        sld = abs(entry - sl)
        if sld <= 0: continue
        if tp_mode == "other": tp = rl if dirn == "short" else rh
        else: tp = (rh + rl) / 2
        if (dirn == "short" and tp >= entry) or (dirn == "long" and tp <= entry): continue
        tpd = abs(tp - entry)
        res = None
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
            k = min(k, m - 1); res = (c[k] - entry) if dirn == "long" else (entry - c[k])
        trades.append(dict(day=s["day"], pts=res, sld=sld, tpd=tpd, win=res > 0))
    return trades

def rep(label, trades):
    if len(trades) < 30: print(f"{label}: zu wenig Trades ({len(trades)})"); return
    net = lambda ts: sum((t["pts"] - COST) * USD for t in ts)
    tr = [t for t in trades if t["day"] < dt.date(2025,1,1)]; te = [t for t in trades if t["day"] >= dt.date(2025,1,1)]
    wr = sum(1 for t in trades if t["win"]) / len(trades) * 100
    rrm = sum(t["tpd"] / t["sld"] for t in trades) / len(trades)
    py = defaultdict(float)
    for t in trades: py[t["day"].year] += (t["pts"] - COST) * USD
    yrs = " ".join(f"{y}:{v:+.0f}" for y, v in sorted(py.items()))
    top = sorted(((t["pts"] - COST) * USD for t in trades), reverse=True)[:10]
    print(f"{label}: N={len(trades)} WR={wr:.1f}% RR=1:{rrm:.2f} | Netto {net(trades):+,.0f}$ | Train {net(tr):+,.0f}$ ({len(tr)}) | Test {net(te):+,.0f}$ ({len(te)}) | Top10 {sum(top):+,.0f}$ | Ø/Trade {net(trades)/len(trades):+.0f}$")
    print(f"     Jahre: {yrs}")

print("\n=== Trades auf F1+F2+F3 ===")
for em in ("t30", "reclaim"):
    for tm in ("other", "mid"):
        for buf in (0.1, 0.25):
            rep(f"{em:8s} TP={tm:5s} buf={buf}", simulate(f123, em, tm, buf))
print("\n=== Trades auf F2+F3 (ohne Breiten-Filter) ===")
for em in ("t30", "reclaim"):
    for tm in ("other", "mid"):
        rep(f"{em:8s} TP={tm:5s} buf=0.1", simulate(f23, em, tm, 0.1))
print("\n=== Trades auf F1+F2+F3+ON/W>=2 ===")
for em in ("t30", "reclaim"):
    for tm in ("other", "mid"):
        rep(f"{em:8s} TP={tm:5s} buf=0.1", simulate(f13on, em, tm, 0.1))
