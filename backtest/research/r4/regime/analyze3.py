"""(a) Zusatz-Regime 'Tagesrange bis Entry / ATR' (rng_used) und 'Stunde'; (b) Cross-Instrument-Replikation von 1D-Zellen."""
import sys, pickle
from bisect import bisect_left
from collections import defaultdict
sys.path.insert(0, "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r4/regime")
from common import *
EV = {}; MK = {}
for tag in ("NQ", "ES", "YM"):
    MK[tag] = Market(tag); ev = pickle.load(open(f"{SP}/research/r4/regime/events_{tag}.pkl", "rb"))
    # rng_used: (RTH-High - RTH-Low bis Entry-Bar)/ATR, nur RTH-Entries
    cache = {}
    for e in ev:
        d = e["d"]
        if e["t"] < 570: e["rng_used"] = None; continue
        if d not in cache:
            mods, o, c, lo, hi, v = MK[tag].days[d]; a = bisect_left(mods, 570); rh = []; rl = []; h = -1e18; l = 1e18
            for k in range(a, len(mods)): h = max(h, hi[k]); l = min(l, lo[k]); rh.append(h); rl.append(l)
            cache[d] = (a, rh, rl, mods)
        a, rh, rl, mods = cache[d]; i = bisect_left(mods, e["t"]) - a
        e["rng_used"] = (rh[i] - rl[i]) / MK[tag].reg[d]["atr"]
    EV[tag] = ev
EDGES = {"rng_used": [0.3, 0.5, 0.7, 1.0], "hour": [10, 11, 12, 13, 14, 15], "vol5_pct": [0.25, 0.5, 0.75], "trend_w": [-0.34, 0, 0.34],
         "vwap_w": [-2, -1, 0, 1, 2], "or30_atr": [0.25, 0.35, 0.5], "on_atr": [0.4, 0.6, 0.8], "prev_body": [0.3, 0.6], "gap_w": [-0.3, 0, 0.3],
         "ptrend_w": [-0.5, 0, 0.5], "daytype_w": [-0.5, 0, 0.5], "sld_atr": [0.1, 0.15, 0.25], "body": [0.4, 0.6, 0.8]}
def bi(x, e):
    b = 0
    for t in e:
        if x >= t: b += 1
    return b
print("(a) rng_used x Setup (feste Kanten, Train/Test):")
for st in ("A_range", "B1_reclaim", "C_level", "D_momo", "D_momo_tight"):
    for tag in ("NQ", "ES", "YM"):
        cells = defaultdict(list)
        for e in EV[tag]:
            if e["setup"] == st and e["rng_used"] is not None: cells[bi(e["rng_used"], EDGES["rng_used"])].append(e)
        line = f"  {st:13s} {tag}: "
        for b in sorted(cells):
            tr, te = split(cells[b]); line += f"[b{b} {wr(tr):4.1f}/{wr(te):4.1f} n={len(tr)}/{len(te)}] "
        print(line)
print("\n(b) Cross-Instrument: Zellen (Setup[,dir] x Feature-Bin, feste Kanten) mit Train-WR>=55% in ALLEN drei Instrumenten, N_train>=200 je Instr.:")
ncells = 0; found = 0
keys = set()
for tag in EV:
    for e in EV[tag]: keys.add(e["setup"]); keys.add((e["setup"], e["dir"]))
for key in sorted(keys, key=str):
    for f, edges in EDGES.items():
        for b in range(len(edges) + 1):
            ncells += 1; ok = True; desc = []
            for tag in ("NQ", "ES", "YM"):
                rows = [e for e in EV[tag] if (e["setup"] == key if isinstance(key, str) else (e["setup"] == key[0] and e["dir"] == key[1]))
                        and e.get(f) is not None and bi(e[f], edges) == b]
                tr, te = split(rows)
                if len(tr) < 200 or wr(tr) < 55: ok = False; break
                desc.append(f"{tag} {wr(tr):.1f}/{wr(te):.1f} n={len(tr)}/{len(te)}")
            if ok: found += 1; print("  ", key, f, "bin", b, " | ".join(desc))
print(f"  Zellen geprueft: {ncells} (x3 Instrumente), repliziert: {found}")
