"""Auswertung der Sequenz-Hypothesen (a),(b),(d),(e) auf Sweep-Events. python3 analyze.py INST LSET [BUF]
Basis-Trade je Event: Market-Entry zum Close des Reclaim-Bars irc, Richtung gegen den Sweep, SL = Sweep-Extrem +/- BUF x ATR60,
TP = 1:1. Ausstieg spaetestens Session-Ende. Dedupe: max. 1 Trade je (Bar, Richtung)."""
import sys, pickle, time
from common import *
inst, lset = sys.argv[1], sys.argv[2]; BUF = float(sys.argv[3]) if len(sys.argv) > 3 else 0.5
S = Series(inst); ev = pickle.load(open(f"events_{inst}_{lset}.pkl", "rb"))
ev.sort(key=lambda e: (e["irc"], e["ltype"])); t0 = time.time()
o, c, lo, hi, atr, mod = S.o, S.c, S.lo, S.hi, S.atr, S.mod
medb = rolling_median_body(S, 20)
seen = set(); rows = []; last_out = {}
for e in ev:
    irc = e["irc"]; side = e["side"]; dirn = -side
    key = (irc, dirn)
    prev_out = last_out.get(e["lid"])
    if key in seen: continue
    seen.add(key)
    entry = c[irc]; a = atr[irc]
    sl = e["ext"] + side * BUF * a; sld = abs(entry - sl)
    if sld <= 0: continue
    tp = entry + dirn * sld
    res, xi, tag = S.sim(irc, dirn, entry, sl, tp)
    win = res > 0; last_out[e["lid"]] = tag
    body = abs(c[irc] - o[irc]) / (hi[irc] - lo[irc]) if hi[irc] > lo[irc] else 0.0
    # Displacement-Kerze: irc selbst oder einer der 2 Folgebars mit Koerper >= 2 x Median(20) in Trade-Richtung
    disp = None
    for k in range(irc, min(irc + 3, S.send[irc] + 1)):
        b = (c[k] - o[k]) * dirn
        if medb[k] > 0 and b >= 2.0 * medb[k]:
            disp = k; break
    dres = None
    if disp is not None:
        mid = 0.5 * (o[disp] + c[disp]); sl2 = e["ext"] + side * BUF * a; sld2 = abs(mid - sl2)
        if sld2 > 0:
            r = S.sim_limit(disp, dirn, mid, sl2, mid + dirn * sld2, 60)
            if r is not None: dres = (r[0], r[1], r[2], r[3], mid, sl2, mid + dirn * sld2)
    row = S.trade(irc, dirn, entry, sl, tp, res, xi, tag, dict(
        seq=e["seq"], gap=(irc - e["prev_irc"]) if e["prev_irc"] >= 0 else 10**9, ltype=e["ltype"],
        deeper=(None if e["prev_ext"] is None else (e["ext"] - e["prev_ext"]) * side > 0),
        nbeyond=e["nbeyond"], fb3=(e["ifcb"] >= 0 and irc - e["ifcb"] <= 3), fb_sw=(e["ifcb"] == e["isw"]),
        body=body, depth=(e["ext"] - e["L"]) * side / a if a > 0 else 0, sld_atr=sld / a if a > 0 else 0, nb=irc - e["isw"] + 1,
        prev_out=prev_out, disp=disp, dres=dres, hour=mod[irc] // 60))
    rows.append(row)
print(f"{inst} {lset} BUF={BUF}: {len(rows)} Trades in {time.time()-t0:.0f}s", flush=True)

def R(name, sel):
    return report(name, sel, S)

R("ALLE Reclaim-Trades (Basis)", rows)
for lt in sorted(set(r["ltype"] for r in rows)): R(f"  ltype={lt}", [r for r in rows if r["ltype"] == lt])
R("  body>=0.75", [r for r in rows if r["body"] >= 0.75])
print("--- (a) Doppel-Sweep: seq==2 (zweiter Sweep desselben Levels) ---")
R("seq==1", [r for r in rows if r["seq"] == 1]); R("seq>=2", [r for r in rows if r["seq"] >= 2]); R("seq>=3", [r for r in rows if r["seq"] >= 3])
for X in (15, 30, 60, 120, 240):
    R(f"seq==2 & gap<={X}", [r for r in rows if r["seq"] == 2 and r["gap"] <= X])
R("seq==2 & deeper (2. Sweep tiefer)", [r for r in rows if r["seq"] == 2 and r["deeper"]])
R("seq==2 & flacher (2. Sweep flacher)", [r for r in rows if r["seq"] == 2 and r["deeper"] is False])
R("seq==2 & gap<=60 & deeper", [r for r in rows if r["seq"] == 2 and r["gap"] <= 60 and r["deeper"]])
R("seq==2 & gap<=60 & flacher", [r for r in rows if r["seq"] == 2 and r["gap"] <= 60 and r["deeper"] is False])
R("seq>=2 & gap<=60 & body>=0.75", [r for r in rows if r["seq"] >= 2 and r["gap"] <= 60 and r["body"] >= 0.75])
print("--- (b) Vorheriger Trade auf demselben Level ---")
for po in ("SL", "TP", "EOD"):
    R(f"prev_out={po}", [r for r in rows if r["prev_out"] == po])
    R(f"prev_out={po} & gap<=120", [r for r in rows if r["prev_out"] == po and r["gap"] <= 120])
R("prev_out=SL & seq==2", [r for r in rows if r["prev_out"] == "SL" and r["seq"] == 2])
R("prev_out=SL & body>=0.75", [r for r in rows if r["prev_out"] == "SL" and r["body"] >= 0.75])
R("prev_out=SL & flacher", [r for r in rows if r["prev_out"] == "SL" and r["deeper"] is False])
R("prev_out=SL & deeper", [r for r in rows if r["prev_out"] == "SL" and r["deeper"]])
print("--- (e) Failed-Breakout: Close jenseits, Close zurueck binnen 3 Bars ---")
R("nbeyond==0 (reiner Docht-Sweep)", [r for r in rows if r["nbeyond"] == 0])
R("nbeyond>=1", [r for r in rows if r["nbeyond"] >= 1])
R("fb3 (Close jenseits, zurueck <=3 Bars)", [r for r in rows if r["fb3"]])
R("fb3 & Sweep-Bar selbst schliesst jenseits", [r for r in rows if r["fb3"] and r["fb_sw"]])
R("fb3 & nbeyond==1", [r for r in rows if r["fb3"] and r["nbeyond"] == 1])
R("fb3 & body>=0.75", [r for r in rows if r["fb3"] and r["body"] >= 0.75])
R("fb3 & seq==1", [r for r in rows if r["fb3"] and r["seq"] == 1])
R("fb3 & seq>=2", [r for r in rows if r["fb3"] and r["seq"] >= 2])
R("nbeyond>=1 & irc-ifcb>3 (spaeter Reclaim)", [r for r in rows if r["nbeyond"] >= 1 and not r["fb3"]])
print("--- (d) Sweep -> Displacement-Kerze (Body>=2xMedian20) -> Limit an Kerzenmitte, 60 Bars gueltig ---")
drows = []
for r in rows:
    if r["dres"] is None: continue
    res, fi, xi, tag, mid, sl2, tp2 = r["dres"]
    d = dict(r); d["_ei0"] = r["_ei"]; d.update(entry=round(mid, 2), sl=round(sl2, 2), tp=round(tp2, 2), result=tag, pnl_pts=round(res, 3), pnl_usd=round((res - S.cost) * S.usd, 2), _ei=fi, _xi=xi)
    m = mod[fi]; d["entry_time"] = f"{m//60:02d}:{m%60:02d}"; drows.append(d)
R("[LOOK-AHEAD! nur Diagnose] Disp in irc..irc+2, Market@irc", [r for r in rows if r["disp"] is not None])
R("Reclaim-Bar selbst ist Displacement (Body>=2xMed), Market@irc", [r for r in rows if r["disp"] == r["_ei"]])
R("  dito & seq>=2", [r for r in rows if r["disp"] == r["_ei"] and r["seq"] >= 2])
R("  dito & fb3", [r for r in rows if r["disp"] == r["_ei"] and r["fb3"]])
R("  dito & body>=0.75", [r for r in rows if r["disp"] == r["_ei"] and r["body"] >= 0.75])
R("Displacement-Limit gefuellt (Mitte)", drows)
R("  davon Disp = Reclaim-Bar selbst", [r for r in drows if r["disp"] == r["_ei0"]])
R("  Disp-Limit & seq>=2", [r for r in drows if r["seq"] >= 2])
R("  Disp-Limit & fb3", [r for r in drows if r["fb3"]])
R("  Disp-Limit & body>=0.75", [r for r in drows if r["body"] >= 0.75])
print("--- Querschnitt: Depth / SL-Distanz / Uhrzeit (nur Orientierung) ---")
for lo_, hi_ in ((0, 0.5), (0.5, 1), (1, 2), (2, 99)): R(f"depth ATR [{lo_},{hi_})", [r for r in rows if lo_ <= r["depth"] < hi_])
for lo_, hi_ in ((0, 1.5), (1.5, 3), (3, 5), (5, 99)): R(f"sld ATR [{lo_},{hi_})", [r for r in rows if lo_ <= r["sld_atr"] < hi_])
for h0, h1 in ((0, 4), (4, 8), (8, 9), (9, 12), (12, 16), (16, 24)): R(f"hour [{h0},{h1})", [r for r in rows if h0 <= r["hour"] < h1])
pickle.dump(rows, open(f"rows_{inst}_{lset}_b{BUF}.pkl", "wb"))
