"""(d) Displacement-Varianten auf Basis der Sweep-Events: Displacement-Kerze = Reclaim-Bar oder einer der 2 Folgebars mit Koerper >= M x Median20
in Trade-Richtung. Limit bei Retrace-Anteil F der Kerze (0.5 = Mitte, 0.382, 0.618, 1.0 = Open). SL-Varianten: 'ext' = Sweep-Extrem +/- 0.5 ATR,
'cdl' = Kerzen-Extrem +/- 0.25 ATR. TP 1:1 ab Fill. Gueltigkeit EXP Bars. python3 dispvar.py INST LSET"""
import sys, pickle, time
from common import *
inst, lset = sys.argv[1], sys.argv[2]
S = Series(inst); ev = pickle.load(open(f"events_{inst}_{lset}.pkl", "rb")); ev.sort(key=lambda e: (e["irc"], e["ltype"]))
o, c, lo, hi, atr = S.o, S.c, S.lo, S.hi, S.atr; medb = rolling_median_body(S, 20)
def run(M, F, slmode, EXP, only_rc=False, min_sld=0.0):
    rows = []; seen = set()
    for e in ev:
        irc = e["irc"]; side = e["side"]; dirn = -side; disp = None
        for k in range(irc, min(irc + (1 if only_rc else 3), S.send[irc] + 1)):
            if medb[k] > 0 and (c[k] - o[k]) * dirn >= M * medb[k]: disp = k; break
        if disp is None or (disp, dirn) in seen: continue
        seen.add((disp, dirn))
        lim = c[disp] - dirn * F * abs(c[disp] - o[disp])
        if slmode == "ext": sl = e["ext"] + side * 0.5 * atr[disp]
        else: sl = (lo[disp] - 0.25 * atr[disp]) if dirn == 1 else (hi[disp] + 0.25 * atr[disp])
        sld = abs(lim - sl)
        if sld <= min_sld * atr[disp] or sld <= 0: continue
        r = S.sim_limit(disp, dirn, lim, sl, lim + dirn * sld, EXP)
        if r is None: continue
        res, fi, xi, tag = r
        rows.append(S.trade(fi, dirn, lim, sl, lim + dirn * sld, res, xi, tag, dict(hour=S.mod[fi] // 60)))
    return report(f"{inst} {lset} disp M={M} F={F} SL={slmode} EXP={EXP} onlyRC={only_rc} minSLD={min_sld}", rows, S)
run(2.0, 0.5, "ext", 60); run(2.0, 0.5, "ext", 30); run(2.0, 0.5, "ext", 120)
run(2.0, 0.382, "ext", 60); run(2.0, 0.618, "ext", 60); run(2.0, 1.0, "ext", 60)
run(3.0, 0.5, "ext", 60); run(3.0, 0.5, "ext", 60, only_rc=True); run(2.0, 0.5, "ext", 60, only_rc=True)
run(2.0, 0.5, "cdl", 60); run(3.0, 0.5, "cdl", 60); run(2.0, 0.618, "cdl", 60); run(3.0, 0.5, "cdl", 60, only_rc=True)
run(2.0, 0.5, "ext", 60, min_sld=1.5); run(3.0, 0.5, "ext", 60, min_sld=1.5)
