"""Fade an der Range-Linie (08:12-09:12) NUR an vorab gefilterten Tagen.
Filter (alle um 09:12 bekannt): W/ATR10 < 0.2, Overnight-Range/W >= 3, Montag, Kombinationen.
Trade: erster Bruch -> Entry an der Linie (Limit), TP andere Seite, SL = sl_mult * W hinter der Linie, bis 16:00.
Entry-Bar: nur SL werten. Kosten/USD per Argument.
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
rth_hist = []; setups = []
for d in dates:
    if d.weekday() >= 5: continue
    r = rng(d, RS, RE); rr = rng(d, 570, 960)
    atr = sum(rth_hist[-10:]) / len(rth_hist[-10:]) if len(rth_hist) >= 5 else None
    if rr: rth_hist.append(rr[0]-rr[1])
    if r is None or atr is None: continue
    rh, rl, a, b = r; W = rh - rl
    if W <= 0: continue
    on = rng(d, 0, RS)
    setups.append(dict(day=d, rh=rh, rl=rl, W=W, b=b, W_atr=W/atr, on_W=((on[0]-on[1])/W) if on else 0, wd=d.weekday()))

def simulate(ss, sl_mult, tp_mode="other"):
    trades = []
    for s in ss:
        mods, o, c, lo, hi = days[s["day"]]; m = len(mods); rh, rl, W = s["rh"], s["rl"], s["W"]
        j = s["b"]; dirn = None
        while j < m and mods[j] < 960:
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
        trades.append(dict(day=s["day"], pts=res, sld=sld, tpd=tpd))
    return trades

def rep(label, trades):
    if len(trades) < 50: print(f"{label}: zu wenig ({len(trades)})"); return
    net = lambda ts: sum((t["pts"]-COST)*USD for t in ts)
    tr = [t for t in trades if t["day"] < dt.date(2025,1,1)]; te = [t for t in trades if t["day"] >= dt.date(2025,1,1)]
    wr = sum(1 for t in trades if t["pts"] > 0)/len(trades)*100; rr = sum(t["tpd"]/t["sld"] for t in trades)/len(trades)
    py = defaultdict(float)
    for t in trades: py[t["day"].year] += (t["pts"]-COST)*USD
    yrs = " ".join(f"{y}:{v:+.0f}" for y, v in sorted(py.items()))
    print(f"{label}: N={len(trades)} WR={wr:.1f}% RR=1:{rr:.2f} BE={100/(1+rr):.1f}% | Netto {net(trades):+,.0f}$ | Train {net(tr):+,.0f}$ ({len(tr)}) | Test {net(te):+,.0f}$ ({len(te)}) | Ø {net(trades)/len(trades):+.0f}$")
    print(f"     {yrs}")

filters = {
  "alle": lambda s: True,
  "W/ATR<0.2": lambda s: s["W_atr"] < 0.2,
  "ON/W>=3": lambda s: s["on_W"] >= 3,
  "Montag": lambda s: s["wd"] == 0,
  "W/ATR<0.2 & ON/W>=2": lambda s: s["W_atr"] < 0.2 and s["on_W"] >= 2,
  "W/ATR<0.15": lambda s: s["W_atr"] < 0.15,
  "ON/W>=3 & Mo-Do": lambda s: s["on_W"] >= 3 and s["wd"] < 4,
}
for name, f in filters.items():
    ss = [s for s in setups if f(s)]
    print(f"\n### Filter {name}: {len(ss)} Tage")
    for slm in (1.0, 1.5, 2.0):
        rep(f"  TP other SL {slm}W", simulate(ss, slm, "other"))
    rep(f"  TP mid   SL 1.0W", simulate(ss, 1.0, "mid"))
