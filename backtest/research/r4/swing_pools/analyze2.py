"""Gitter-Suche auf TRAIN: Einzelfilter je Modus, dann Paar-/Tripel-Kombis der besten Einzelfilter. Zaehlt Varianten.
TEST wird fuer jede Zeile mit ausgegeben (Kontrolle), Auswahl NUR nach TRAIN."""
import sys, pickle, math, datetime as dt, itertools
from collections import defaultdict
OUT = "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r4/swing_pools"
INST = sys.argv[1]; SUF = sys.argv[4] if len(sys.argv) > 4 else ""; BUF = float(sys.argv[2]) if len(sys.argv) > 2 else 0.02; TS = int(sys.argv[3]) if len(sys.argv) > 3 and sys.argv[3] != "None" else None
D = pickle.load(open(f"{OUT}/events_{INST}{SUF}.pkl", "rb")); E = D["events"]; cfg = D["cfg"]
SPLIT = dt.date(2025, 1, 1); WK_TR = (dt.date(2024,12,31) - dt.date(2021,9,1)).days / 7; WK_TE = (dt.date(2026,8,31) - dt.date(2025,1,1)).days / 7
COST, USD = cfg["cost"], cfg["usd"]
VARS = 0
def run(evs, buf, ts):
    out = []; busy = -1
    for e in evs:
        if e["entry_idx"] <= busy: continue
        sld, res = e["res"][buf]; pts, xidx = res[ts]; busy = xidx
        out.append((e, pts, (pts - COST) * USD))
    return out
def st(tr):
    n = len(tr)
    return (n, sum(1 for x in tr if x[1] > 0) / n * 100 if n else 0.0, sum(x[2] for x in tr))
def evalf(evs, buf, ts):
    global VARS; VARS += 1
    tr = run(evs, buf, ts); a = [x for x in tr if x[0]["date"] < SPLIT]; b = [x for x in tr if x[0]["date"] >= SPLIT]
    return st(a), st(b)
def fmt(tag, ra, rb):
    return f"{tag:70s} TR N={ra[0]:5d} WR={ra[1]:5.1f} {ra[2]:+9.0f}$ ({ra[0]/WK_TR:4.1f}/wk) | TE N={rb[0]:5d} WR={rb[1]:5.1f} {rb[2]:+9.0f}$ ({rb[0]/WK_TE:4.1f}/wk)"
hour = lambda e: e["entry_t"] // 60
F = {
 "long": lambda e: e["dirn"] == "long", "short": lambda e: e["dirn"] == "short",
 "h02-05": lambda e: 120 <= e["entry_t"] < 300, "h05-0930": lambda e: 300 <= e["entry_t"] < 570, "h0930-11": lambda e: 570 <= e["entry_t"] < 660,
 "h11-1330": lambda e: 660 <= e["entry_t"] < 810, "h1330-16": lambda e: 810 <= e["entry_t"] < 960, "h18-24": lambda e: e["entry_t"] >= 1080,
 "h00-02": lambda e: e["entry_t"] < 120, "hRTH": lambda e: 570 <= e["entry_t"] < 960, "h07-12": lambda e: 420 <= e["entry_t"] < 720,
 "h0930-1030": lambda e: 570 <= e["entry_t"] < 630, "h08-0930": lambda e: 480 <= e["entry_t"] < 570,
 "prom>=.05": lambda e: e["prom"] >= 0.05, "prom>=.1": lambda e: e["prom"] >= 0.1, "prom>=.2": lambda e: e["prom"] >= 0.2, "prom<.05": lambda e: e["prom"] < 0.05,
 "span>=8": lambda e: e["span"] >= 8, "span>=16": lambda e: e["span"] >= 16, "span>=32": lambda e: e["span"] >= 32, "span<4": lambda e: e["span"] < 4,
 "age>=120": lambda e: e["age"] >= 120, "age>=240": lambda e: e["age"] >= 240, "age>=480": lambda e: e["age"] >= 480, "age<90": lambda e: e["age"] < 90,
 "ageold>=480": lambda e: e["age_old"] >= 480, "n>=2": lambda e: e["n"] >= 2, "k3": lambda e: e["kmax"] == 3, "k2only": lambda e: e["kmax"] == 2,
 "body>=.6": lambda e: e["body"] >= 0.6, "body>=.75": lambda e: e["body"] >= 0.75, "body<.4": lambda e: e["body"] < 0.4,
 "rng>=.04": lambda e: e["rng"] >= 0.04, "rng>=.07": lambda e: e["rng"] >= 0.07, "rng<.03": lambda e: e["rng"] < 0.03,
 "depth>=.03": lambda e: e["depth"] >= 0.03, "depth>=.06": lambda e: e["depth"] >= 0.06, "depth<.02": lambda e: e["depth"] < 0.02,
 "dur0": lambda e: e["dur"] == 0, "dur1-5": lambda e: 1 <= e["dur"] <= 5, "dur>=5": lambda e: e["dur"] >= 5, "dur>=15": lambda e: e["dur"] >= 15,
 "sld>=.04": lambda e: e["sld_atr"] >= 0.04, "sld>=.08": lambda e: e["sld_atr"] >= 0.08, "sld<.03": lambda e: e["sld_atr"] < 0.03, "sld.03-.1": lambda e: 0.03 <= e["sld_atr"] < 0.1,
 "trend_with": lambda e: e["trend"] is not None and ((e["dirn"] == "long" and e["trend"] > 0.05) or (e["dirn"] == "short" and e["trend"] < -0.05)),
 "trend_ctr": lambda e: e["trend"] is not None and ((e["dirn"] == "long" and e["trend"] < -0.05) or (e["dirn"] == "short" and e["trend"] > 0.05)),
 "opp<=60": lambda e: e["opp"] <= 60, "opp<=180": lambda e: e["opp"] <= 180, "opp>360": lambda e: e["opp"] > 360,
 "mon-tue": lambda e: e["date"].weekday() <= 1, "wed-thu": lambda e: e["date"].weekday() in (2, 3), "fri": lambda e: e["date"].weekday() == 4,
}
res_all = []
for mode in ("R1", "M15", "MSS", "LIM"):
    evs = sorted([e for e in E if e["mode"] == mode], key=lambda x: x["entry_idx"])
    ra, rb = evalf(evs, BUF, TS); print(fmt(f"[{mode}] BASIS buf{BUF} ts{TS}", ra, rb))
    singles = []
    for name, f in F.items():
        sub = [e for e in evs if f(e)]
        ra, rb = evalf(sub, BUF, TS)
        if ra[0] >= 300: singles.append((ra[1], name, ra, rb))
    singles.sort(reverse=True)
    print(f"--- {mode}: Top-12 Einzelfilter (TRAIN, N>=300)")
    for wr, name, ra, rb in singles[:12]: print("  " + fmt(f"[{mode}] {name}", ra, rb))
    print(f"--- {mode}: Flop-5")
    for wr, name, ra, rb in singles[-5:]: print("  " + fmt(f"[{mode}] {name}", ra, rb))
    top = [s[1] for s in singles[:14]]
    pairs = []
    for a, b in itertools.combinations(top, 2):
        sub = [e for e in evs if F[a](e) and F[b](e)]
        ra, rb = evalf(sub, BUF, TS)
        if ra[0] >= 300: pairs.append((ra[1], f"{a} & {b}", ra, rb))
    pairs.sort(reverse=True)
    print(f"--- {mode}: Top-12 Paare (TRAIN, N>=300)")
    for wr, name, ra, rb in pairs[:12]: print("  " + fmt(f"[{mode}] {name}", ra, rb))
    top3 = [p[1] for p in pairs[:6]]
    trip = []
    for pr in top3:
        a, b = pr.split(" & ")
        for cname in top:
            if cname in (a, b): continue
            sub = [e for e in evs if F[a](e) and F[b](e) and F[cname](e)]
            ra, rb = evalf(sub, BUF, TS)
            if ra[0] >= 300: trip.append((ra[1], f"{pr} & {cname}", ra, rb))
    trip.sort(reverse=True)
    print(f"--- {mode}: Top-8 Tripel (TRAIN, N>=300)")
    for wr, name, ra, rb in trip[:8]: print("  " + fmt(f"[{mode}] {name}", ra, rb))
    res_all.extend([(mode,) + s for s in singles + pairs + trip])
print("VARIANTS", VARS)
