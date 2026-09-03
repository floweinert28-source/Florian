"""Unabhaengige Re-Simulation einer Trade-CSV aus den 1-min-Rohdaten (Look-Ahead-Audit):
Prueft je Trade: entry == Close des 1-min-Bars zu entry_time; Ergebnis (TP/SL/EOD) aus Folgebars (Entry-Bar nur SL, SL vor TP); pnl_usd stimmt."""
import sys, csv, datetime as dt
sys.path.insert(0, "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r4/tf5_exec")
from engine import *
from bisect import bisect_left
mk = Market(sys.argv[1]); end_mod = int(sys.argv[3]) if len(sys.argv) > 3 else 960
bad = 0; tot = 0
for r in csv.DictReader(open(sys.argv[2])):
    tot += 1; d = dt.date.fromisoformat(r["date"]); mods, o, c, lo, hi, v = mk.days[d]
    em = int(r["entry_time"][:2])*60 + int(r["entry_time"][3:]); ei = bisect_left(mods, em)
    entry, sl, tp = float(r["entry"]), float(r["sl"]), float(r["tp"]); long = r["dir"] == "long"
    if mods[ei] != em or abs(c[ei] - entry) > 0.011: bad += 1; print("ENTRY MISMATCH", r); continue
    res = None
    if (long and lo[ei] <= sl) or (not long and hi[ei] >= sl): res = "SL"
    k = ei + 1
    while res is None and k < len(mods) and mods[k] < end_mod:
        if long:
            if lo[k] <= sl: res = "SL"
            elif hi[k] >= tp: res = "TP"
        else:
            if hi[k] >= sl: res = "SL"
            elif lo[k] <= tp: res = "TP"
        k += 1
    if res is None: res = "EOD"
    if res != r["result"]: bad += 1; print("RESULT MISMATCH", res, r); continue
    pts = (tp - entry if long else entry - tp) if res == "TP" else (sl - entry if long else entry - sl) if res == "SL" else None
    if pts is not None and abs((pts - mk.cost)*mk.usd - float(r["pnl_usd"])) > 0.6*mk.usd: bad += 1; print("PNL MISMATCH", pts, r)
print(f"audit {sys.argv[2]}: {tot} trades, {bad} mismatches")
