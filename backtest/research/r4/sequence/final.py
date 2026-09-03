"""Letzte legitime Varianten + CSV-Export der besten (nicht ueberlebenden) Kandidaten. python3 final.py INST
(d-M) Displacement-Bestaetigung: Sweep-Event (Session-Levels), erste Kerze in irc..irc+2 mit Koerper >= 2 x Median20 in Fade-Richtung;
      Market-Entry zum CLOSE dieser Kerze (kein Look-Ahead), SL = Sweep-Extrem +/- 0.5 ATR60, TP 1:1.
(b-inv) Continuation nach Fehl-Reclaim: Level, dessen vorheriger Reclaim-Trade per SL endete; beim naechsten Reclaim-Bar Entry MIT der
      Sweep-Richtung (Breakout erwartet), SL-Distanz = Distanz zum Sweep-Extrem + 0.5 ATR (symmetrisch), TP 1:1.
Beide zusaetzlich mit 'eine Position gleichzeitig' (OPA)."""
import sys, pickle
from common import *
inst = sys.argv[1]; S = Series(inst); o, c, lo, hi, atr = S.o, S.c, S.lo, S.hi, S.atr
ev = pickle.load(open(f"events_{inst}_sess.pkl", "rb")); ev.sort(key=lambda e: (e["irc"], e["ltype"])); medb = rolling_median_body(S, 20)
def opa(rows):
    out = []; busy = -1
    for r in sorted(rows, key=lambda r: r["_ei"]):
        if r["_ei"] <= busy: continue
        out.append(r); busy = r["_xi"]
    return out
# (d-M)
rows = []; seen = set()
for e in ev:
    irc = e["irc"]; side = e["side"]; dirn = -side; disp = None
    for k in range(irc, min(irc + 3, S.send[irc] + 1)):
        if medb[k] > 0 and (c[k] - o[k]) * dirn >= 2.0 * medb[k]: disp = k; break
    if disp is None or (disp, dirn) in seen: continue
    seen.add((disp, dirn)); entry = c[disp]; sl = e["ext"] + side * 0.5 * atr[disp]; sld = abs(entry - sl)
    if sld <= 0: continue
    tp = entry + dirn * sld; res, xi, tag = S.sim(disp, dirn, entry, sl, tp)
    rows.append(S.trade(disp, dirn, entry, sl, tp, res, xi, tag, dict(body=abs(c[disp]-o[disp])/(hi[disp]-lo[disp]) if hi[disp] > lo[disp] else 0, seq=e["seq"])))
report(f"{inst} (d-M) Disp-Bestaetigung Market@Close(Disp)", rows, S)
report(f"{inst} (d-M) & body>=0.75", [r for r in rows if r["body"] >= 0.75], S)
r1 = opa(rows); report(f"{inst} (d-M) OPA", r1, S)
write_csv(f"cand_{inst}_dispM.csv", r1)
# (b-inv)
BUF = 0.5; last = {}; rows2 = []; rows_fade = []; seen = set()
for e in ev:
    irc = e["irc"]; side = e["side"]; entry = c[irc]; slf = e["ext"] + side * BUF * atr[irc]; sld = abs(entry - slf)
    if sld <= 0: continue
    # Fade-Trade (Basis) fuer die Historie des Levels
    resf, xif, tagf = S.sim(irc, -side, entry, slf, entry - side * sld); po = last.get(e["lid"]); last[e["lid"]] = tagf
    if po == "SL" and (irc, side) not in seen:
        seen.add((irc, side)); dirn = side; sl = entry - side * sld; tp = entry + side * sld
        res, xi, tag = S.sim(irc, dirn, entry, sl, tp)
        rows2.append(S.trade(irc, dirn, entry, sl, tp, res, xi, tag, dict(seq=e["seq"], gap=irc - e["prev_irc"])))
report(f"{inst} (b-inv) Continuation nach Fehl-Reclaim", rows2, S)
report(f"{inst} (b-inv) & gap<=120", [r for r in rows2 if r["gap"] <= 120], S)
report(f"{inst} (b-inv) & seq==2", [r for r in rows2 if r["seq"] == 2], S)
r2 = opa(rows2); report(f"{inst} (b-inv) OPA", r2, S); write_csv(f"cand_{inst}_binv.csv", r2)
