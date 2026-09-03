"""Univariate Karte: je Feature Dezile (Grenzen aus TRAIN), WR TRAIN und TEST, plus Spread max-min der Dezile auf TRAIN."""
import sys, math
from fm_lib import *
rows, feats = load("NQ"); tr, te = split(rows)
out = []
for f in feats:
    vals = sorted(r[f] for r in tr); n = len(vals)
    cuts = [vals[int(n*q/10)] for q in range(1, 10)]
    def dec(x):
        k = 0
        while k < 9 and x >= cuts[k]: k += 1
        return k
    gtr = [[] for _ in range(10)]; gte = [[] for _ in range(10)]
    for r in tr: gtr[dec(r[f])].append(r["win"])
    for r in te: gte[dec(r[f])].append(r["win"])
    wtr = [sum(g)/len(g)*100 if g else float('nan') for g in gtr]; wte = [sum(g)/len(g)*100 if g else float('nan') for g in gte]
    ok = [i for i in range(10) if gtr[i]]
    spread = max(wtr[i] for i in ok) - min(wtr[i] for i in ok)
    out.append((spread, f, wtr, wte, [len(g) for g in gtr]))
for spread, f, wtr, wte, ns in sorted(out, key=lambda t: -t[0]):
    print(f"{f:18s} spread {spread:4.1f} | TRAIN " + " ".join(f"{x:4.1f}" for x in wtr) + " | TEST " + " ".join(f"{x:4.1f}" for x in wte) + f" | n {ns[0]}..{ns[9]}")
