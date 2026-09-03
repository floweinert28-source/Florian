"""(e2) Failed-Breakout auf 5-min-Basis: 5-min-Bars (NY-Zeit, Session-intern). Range = Hoch/Tief der letzten R 5-min-Bars (R=12 -> 60 min,
R=24 -> 120 min) vor dem Break-Bar. Break: 5m-Close ausserhalb der Range. Failed: binnen 3 folgenden 5m-Bars ein 5m-Close wieder innerhalb.
Entry = dieser 5m-Close (= Close des letzten 1-min-Bars), SL = Extrem seit Break + BUF x ATR60, TP 1:1. Session-Ende schliesst.
Varianten: R, Break-Bar Koerper, Failed-Bar Koerper >= 0.6, Break um >= 0.5 ATR60. python3 fb5.py INST"""
import sys, time
from common import *
inst = sys.argv[1]; BUF = 0.5
S = Series(inst); o, c, lo, hi, atr, mod = S.o, S.c, S.lo, S.hi, S.atr, S.mod
# 5-min-Bars: Gruppen nach (Session, mod//5)
bars = []  # (i0, i1, o, h, l, c)
i = 0; n = S.n
while i < n:
    j = i; g = mod[i] // 5; ss = S.sstart[i]
    while j + 1 < n and S.sstart[j+1] == ss and mod[j+1] // 5 == g: j += 1
    bars.append((i, j, o[i], max(hi[i:j+1]), min(lo[i:j+1]), c[j])); i = j + 1
print(inst, "5m bars", len(bars), flush=True)
def run(R, need_body=0.0, min_break=0.0, name=""):
    rows = []; seen = set(); m = len(bars)
    for b in range(R, m):
        i0, i1, bo, bh, bl, bc = bars[b]
        if S.sstart[bars[b-R][0]] != S.sstart[i0]: continue
        rh = max(x[3] for x in bars[b-R:b]); rl = min(x[4] for x in bars[b-R:b])
        a = atr[i1]
        if bc > rh and (bc - rh) >= min_break * a: side = 1; L = rh
        elif bc < rl and (rl - bc) >= min_break * a: side = -1; L = rl
        else: continue
        ext = bh if side == 1 else bl; ei = None
        for q in range(b + 1, min(b + 4, m)):
            q0, q1, qo, qh, ql, qc = bars[q]
            if S.sstart[q0] != S.sstart[i0]: break
            ext = max(ext, qh) if side == 1 else min(ext, ql)
            if (qc - L) * side < 0:
                body = abs(qc - qo) / (qh - ql) if qh > ql else 0
                if body >= need_body: ei = q1
                break
        if ei is None or (ei, side) in seen: continue
        seen.add((ei, side))
        entry = c[ei]; sl = ext + side * BUF * atr[ei]; sld = abs(entry - sl)
        if sld <= 0: continue
        dirn = -side; tp = entry + dirn * sld
        res, xi, tag = S.sim(ei, dirn, entry, sl, tp)
        rows.append(S.trade(ei, dirn, entry, sl, tp, res, xi, tag, dict(hour=mod[ei] // 60, sld_atr=sld / a if a > 0 else 0)))
    r = report(f"FB5 R={R} body>={need_body} brk>={min_break}ATR {name}", rows, S)
    report(f"    RTH", [x for x in rows if 9 <= x["hour"] < 16], S)
    return rows
for R in (6, 12, 24, 48):
    run(R)
run(12, need_body=0.6); run(12, min_break=0.5); run(12, need_body=0.6, min_break=0.5); run(24, need_body=0.6, min_break=0.5)
