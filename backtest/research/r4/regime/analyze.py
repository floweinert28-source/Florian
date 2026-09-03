"""Regime-Zellen: WR (Train/Test) je Setup x Feature-Quartil. Aufruf: python analyze.py NQ [min_n]"""
import sys, pickle
from collections import defaultdict
sys.path.insert(0, "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r4/regime")
from common import *
tag = sys.argv[1]; MINN = int(sys.argv[2]) if len(sys.argv) > 2 else 300
ev = pickle.load(open(f"{SP}/research/r4/regime/events_{tag}.pkl", "rb"))
cost = INSTR[tag][1]; usd = INSTR[tag][2]
FEATS = ["vol5_pct", "on_atr", "or30_atr", "gap_w", "prev_body", "ptrend_w", "trend_w", "vwap_w", "daytype_w", "pos_rth", "hour", "sld_atr", "body"]
def W(rows): return wr(rows)
def quart_edges(vals, k=4):
    vals = sorted(vals); return [vals[int(len(vals) * q / k)] for q in range(1, k)]
def binidx(x, edges):
    b = 0
    for e in edges:
        if x >= e: b += 1
    return b
groups = defaultdict(list)
for e in ev:
    groups[e["setup"]].append(e)
    groups[(e["setup"], e["sub"])].append(e)
    groups[(e["setup"], e["dir"])].append(e)
ncells = 0; hits = []
def show(name, rows):
    global ncells
    tr, te = split(rows)
    if len(tr) < MINN: return
    print(f"\n=== {name}: TRAIN N={len(tr)} WR={W(tr):.1f}% | TEST N={len(te)} WR={W(te):.1f}%")
    for f in FEATS:
        vt = [r for r in tr if r.get(f) is not None]; vv = [r for r in te if r.get(f) is not None]
        if len(vt) < MINN: continue
        if f == "hour": edges = sorted(set(r[f] for r in vt))[1:]
        else: edges = quart_edges([r[f] for r in vt])
        cells_t = defaultdict(list); cells_v = defaultdict(list)
        for r in vt: cells_t[binidx(r[f], edges)].append(r)
        for r in vv: cells_v[binidx(r[f], edges)].append(r)
        line = f"  {f:10s} edges={[round(x,2) for x in edges]}: "
        for b in sorted(cells_t):
            ct = cells_t[b]; cv = cells_v.get(b, []); ncells += 1
            if len(ct) >= MINN: line += f"[b{b} {W(ct):4.1f}%/{W(cv):4.1f}% n={len(ct)}/{len(cv)}] "
            if len(ct) >= MINN and W(ct) >= 58: hits.append((name, f, b, edges, len(ct), W(ct), len(cv), W(cv)))
        print(line)
for key in sorted(groups, key=str):
    show(str(key), groups[key])
print(f"\n##### Zellen gezaehlt: {ncells}; Treffer (Train WR>=58, N>={MINN}):")
for h in sorted(hits, key=lambda x: -x[5]): print("  ", h)
