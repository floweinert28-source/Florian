"""(c) Drei-Push-Muster: drei aufeinanderfolgende Swing-Hochs (1-min-Pivots, k Bars links/rechts) P1<P2<P3 mit je einem Pivot-Tief
dazwischen. Definition A: abnehmende Inkremente (P2-P1) > (P3-P2) > 0. Definition B: abnehmende Push-Hoehe (PH_i - vorheriges PL_i)
push1 > push2 > push3. Entry-Varianten: E1 = Close des Bestaetigungsbars von P3 (P3+k), falls Close < P3 -> Short zum Close;
E2 = erster Close unter dem letzten Pivot-Tief (zwischen P2 und P3) binnen 60 Bars nach P3-Bestaetigung.
SL = P3 + BUF x ATR60 (bzw. Extrem seit P3 falls hoeher), TP = 1:1. Gesamtdauer P1..P3 <= 240 min. Spiegelbildlich fuer Tiefs -> Long.
python3 threepush.py INST K"""
import sys, time
from common import *
inst = sys.argv[1]; K = int(sys.argv[2]); BUF = 0.5
S = Series(inst); o, c, lo, hi, atr = S.o, S.c, S.lo, S.hi, S.atr
PH, PL = pivots(S, K); t0 = time.time()
# gemischte Pivot-Sequenz nach Index
piv = sorted([(i, p, ci, 1) for i, p, ci in PH] + [(i, p, ci, -1) for i, p, ci in PL])
rows = {("A", "E1"): [], ("A", "E2"): [], ("B", "E1"): [], ("B", "E2"): [], ("AB", "E1"): [], ("AB", "E2"): []}
seen = set()
for side in (1, -1):
    # Liste der Pivots der Seite mit dem jeweils vorherigen Gegen-Pivot (Push-Basis)
    lastopp = None; seq = []  # (i, p, ci, opp_price, opp_idx)
    for i, p, ci, sd in piv:
        if sd == -side: lastopp = (i, p)
        elif lastopp is not None: seq.append((i, p, ci, lastopp[1], lastopp[0]))
    for j in range(2, len(seq)):
        i1, p1, _, _, _ = seq[j-2]; i2, p2, _, b2, ib2 = seq[j-1]; i3, p3, ci3, b3, ib3 = seq[j]
        if S.sstart[i1] != S.sstart[i3] or i3 - i1 > 240: continue
        if ib2 <= i1 or ib3 <= i2: continue  # Gegen-Pivot jeweils dazwischen
        hh = (p2 - p1) * side > 0 and (p3 - p2) * side > 0
        if not hh: continue
        incA = (p2 - p1) * side > (p3 - p2) * side
        push1 = (p1 - seq[j-2][3]) * side; push2 = (p2 - b2) * side; push3 = (p3 - b3) * side
        incB = push1 > push2 > push3 > 0
        if not (incA or incB): continue
        end = S.send[ci3]
        for ent in ("E1", "E2"):
            if ent == "E1":
                ei = ci3
                if (c[ei] - p3) * side >= 0: continue
            else:
                ei = None
                for k in range(ci3, min(ci3 + 60, end + 1)):
                    if (c[k] - b3) * side < 0: ei = k; break
                if ei is None: continue
            key = (ei, side, ent)
            if key in seen: continue
            seen.add(key)
            ext = max(hi[i3:ei+1]) if side == 1 else min(lo[i3:ei+1])
            entry = c[ei]; sl = ext + side * BUF * atr[ei]; sld = abs(entry - sl)
            if sld <= 0: continue
            dirn = -side; tp = entry + dirn * sld
            res, xi, tag = S.sim(ei, dirn, entry, sl, tp)
            row = S.trade(ei, dirn, entry, sl, tp, res, xi, tag, dict(sld_atr=sld / atr[ei] if atr[ei] > 0 else 0, hour=S.mod[ei] // 60, dur=i3 - i1))
            if incA: rows[("A", ent)].append(row)
            if incB: rows[("B", ent)].append(row)
            if incA and incB: rows[("AB", ent)].append(row)
print(f"{inst} K={K}: pivots {len(PH)}/{len(PL)}, {time.time()-t0:.0f}s")
for key in rows:
    rs = sorted(rows[key], key=lambda r: r["_ei"])
    report(f"3-Push {key[0]} {key[1]} K={K}", rs, S)
    if rs:
        report(f"   sld<=3ATR", [r for r in rs if r["sld_atr"] <= 3], S)
        report(f"   RTH 9:30-16", [r for r in rs if 9 <= r["hour"] < 16], S)
        report(f"   dur<=90", [r for r in rs if r["dur"] <= 90], S)
