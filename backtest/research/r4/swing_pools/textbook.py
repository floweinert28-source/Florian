"""Vorab spezifizierte 'Lehrbuch'-Kombis (wenige Varianten), alle Modi, buf 0.02, ts 120 und 240."""
import sys, pickle, datetime as dt
OUT = "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r4/swing_pools"
INST = sys.argv[1]; SUF = sys.argv[2] if len(sys.argv) > 2 else ""
D = pickle.load(open(f"{OUT}/events_{INST}{SUF}.pkl", "rb")); E = D["events"]; cfg = D["cfg"]
SPLIT = dt.date(2025, 1, 1); WK_TR = (dt.date(2024,12,31) - dt.date(2021,9,1)).days / 7; WK_TE = (dt.date(2026,8,31) - dt.date(2025,1,1)).days / 7
COST, USD = cfg["cost"], cfg["usd"]; V = 0
def run(evs, buf, ts):
    out = []; busy = -1
    for e in sorted(evs, key=lambda x: x["entry_idx"]):
        if e["entry_idx"] <= busy: continue
        sld, res = e["res"][buf]; pts, xidx = res[ts]; busy = xidx; out.append((e, pts, (pts - COST) * USD))
    return out
def st(tr):
    n = len(tr); return (n, sum(1 for x in tr if x[1] > 0) / n * 100 if n else 0.0, sum(x[2] for x in tr))
def line(tag, evs, buf, ts):
    global V; V += 1
    tr = run(evs, buf, ts); a = st([x for x in tr if x[0]["date"] < SPLIT]); b = st([x for x in tr if x[0]["date"] >= SPLIT])
    print(f"{tag:66s} TR N={a[0]:5d} WR={a[1]:5.1f} {a[2]:+9.0f}$ ({a[0]/WK_TR:4.1f}/wk) | TE N={b[0]:5d} WR={b[1]:5.1f} {b[2]:+9.0f}$ ({b[0]/WK_TE:4.1f}/wk)", flush=True)
kz = lambda e: (120 <= e["entry_t"] < 300) or (420 <= e["entry_t"] < 600) or (600 <= e["entry_t"] < 720) or (810 <= e["entry_t"] < 960)
C = {
 "displacement (body>=.75 & rng>=.05)": lambda e: e["body"] >= 0.75 and e["rng"] >= 0.05,
 "displacement & RTH": lambda e: e["body"] >= 0.75 and e["rng"] >= 0.05 and 570 <= e["entry_t"] < 960,
 "k3 & span>=16 (external pool)": lambda e: e["kmax"] == 3 and e["span"] >= 16,
 "k3 & span>=16 & killzones": lambda e: e["kmax"] == 3 and e["span"] >= 16 and kz(e),
 "k3 & span>=16 & body>=.6": lambda e: e["kmax"] == 3 and e["span"] >= 16 and e["body"] >= 0.6,
 "age>=1 Tag (>=1000 bars)": lambda e: e["age"] >= 1000,
 "age>=1 Tag & body>=.6": lambda e: e["age"] >= 1000 and e["body"] >= 0.6,
 "double-side (opp<=30)": lambda e: e["opp"] <= 30,
 "double-side (opp<=30) & body>=.6": lambda e: e["opp"] <= 30 and e["body"] >= 0.6,
 "n>=2 pools": lambda e: e["n"] >= 2,
 "n>=2 & body>=.6": lambda e: e["n"] >= 2 and e["body"] >= 0.6,
 "killzones & body>=.75": lambda e: kz(e) and e["body"] >= 0.75,
 "killzones & prom>=.1": lambda e: kz(e) and e["prom"] >= 0.1,
 "NY-AM 09:30-11 & span>=16": lambda e: 570 <= e["entry_t"] < 660 and e["span"] >= 16,
 "London 02-05 & span>=16": lambda e: 120 <= e["entry_t"] < 300 and e["span"] >= 16,
 "dur>=5 & body>=.75 (kein Same-Bar-Reclaim)": lambda e: e["dur"] >= 5 and e["body"] >= 0.75,
 "sweep-Tiefe .02-.08 & prom>=.1": lambda e: 0.02 <= e["depth"] <= 0.08 and e["prom"] >= 0.1,
}
for mode in ("R1", "M15", "MSS", "LIM"):
    evs = [e for e in E if e["mode"] == mode]
    for ts in (120, 240):
        line(f"[{mode} ts{ts}] BASIS", evs, 0.02, ts)
        for name, f in C.items(): line(f"[{mode} ts{ts}] {name}", [e for e in evs if f(e)], 0.02, ts)
print("VARIANTS", V)
