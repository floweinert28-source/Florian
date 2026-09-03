"""Analyse der Pool-Events: Baseline-Gitter, Feature-Quartile (TRAIN), Overlap-Regel (ein offener Trade je Richtung/Modus)."""
import sys, pickle, math, datetime as dt
from collections import defaultdict
OUT = "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r4/swing_pools"
INST = sys.argv[1]
D = pickle.load(open(f"{OUT}/events_{INST}.pkl", "rb")); E = D["events"]; cfg = D["cfg"]; BUFS = D["BUFS"]; TSTOPS = D["TSTOPS"]
SPLIT = dt.date(2025, 1, 1); WK_TR = (dt.date(2024,12,31) - dt.date(2021,9,1)).days / 7; WK_TE = (dt.date(2026,8,31) - dt.date(2025,1,1)).days / 7
COST, USD = cfg["cost"], cfg["usd"]

def run(evs, buf, ts, overlap=False):
    """Trades mit Overlap-Regel: kein neuer Trade, solange ein Trade (gleiches Setup) offen ist."""
    out = []; busy_until = -1
    for e in sorted(evs, key=lambda x: x["entry_idx"]):
        if not overlap and e["entry_idx"] <= busy_until: continue
        sld, res = e["res"][buf]; pts, xidx = res[ts]
        busy_until = xidx
        out.append((e, pts, (pts - COST) * USD))
    return out
def st(tr):
    n = len(tr)
    if n == 0: return (0, 0.0, 0.0)
    return (n, sum(1 for x in tr if x[1] > 0) / n * 100, sum(x[2] for x in tr))
def split(tr):
    return [x for x in tr if x[0]["date"] < SPLIT], [x for x in tr if x[0]["date"] >= SPLIT]
def line(tag, tr):
    a, b = split(tr); na, wa, ua = st(a); nb, wb, ub = st(b)
    print(f"{tag:58s} TR N={na:5d} WR={wa:5.1f} {ua:+9.0f}$ ({na/WK_TR:4.1f}/wk) | TE N={nb:5d} WR={wb:5.1f} {ub:+9.0f}$ ({nb/WK_TE:4.1f}/wk)", flush=True)
    return (na, wa, ua), (nb, wb, ub)

print(f"### {INST}: Events {len(E)}  modes:", {m: sum(1 for e in E if e['mode']==m) for m in ('R1','M15','MSS')})
print("\n##### Baseline: Modus x buf x tstop (Overlap-Regel) #####")
for mode in ("R1", "M15", "MSS"):
    evs = [e for e in E if e["mode"] == mode]
    for buf in BUFS:
        for ts in TSTOPS:
            line(f"{mode} buf{buf} ts{ts}", run(evs, buf, ts))
print("\n##### Feature-Quartile auf TRAIN (R1, buf 0.02, ts 120) #####")
buf, ts = 0.02, 120
for mode in ("R1", "MSS"):
    evs = [e for e in E if e["mode"] == mode]
    tr = run(evs, buf, ts); tra, _ = split(tr)
    print(f"--- {mode}: Basis TRAIN N={len(tra)} WR={st(tra)[1]:.1f}")
    for f in ("dur", "n", "kmax", "age", "age_old", "prom", "depth", "body", "rng", "opp", "sld_atr", "trend", "entry_t"):
        vals = sorted(x[0][f] for x in tra if x[0][f] is not None)
        if not vals: continue
        qs = [vals[int(len(vals)*q)] for q in (0.25, 0.5, 0.75)]
        parts = []
        for lo_, hi_ in ((None, qs[0]), (qs[0], qs[1]), (qs[1], qs[2]), (qs[2], None)):
            g = [x for x in tra if x[0][f] is not None and (lo_ is None or x[0][f] >= lo_) and (hi_ is None or x[0][f] < hi_)]
            parts.append(f"{st(g)[1]:5.1f}%({len(g)})")
        print(f"  {f:9s} q={qs[0]:8.2f} {qs[1]:8.2f} {qs[2]:8.2f} | " + " ".join(parts))
    for dn in ("long", "short"):
        g = [x for x in tra if x[0]["dirn"] == dn]; print(f"  dir {dn}: WR {st(g)[1]:.1f} ({len(g)})")
    print("  Uhrzeit (Stunde):", " ".join(f"{h:02d}:{st([x for x in tra if x[0]['entry_t']//60==h])[1]:.0f}({len([x for x in tra if x[0]['entry_t']//60==h])})" for h in range(24)))
