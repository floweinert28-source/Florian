"""Schreibt Trade-CSVs fuer die (nicht ueberlebenden) Repraesentanten: 
 K1 NQ D_momo(N=6/12) long, Regime trend_w>=0.5 & vwap_w>=1 (Momentum nur bei starkem 60-min-Trend ueber VWAP)
 K2 NQ/ES/YM C_level Sweep+Reclaim (PDH/PDL/ONH/ONL/ORH/ORL), Regime rng_used>=1.0 ATR (Tagesrange bereits >= ATR10)"""
import sys, pickle
from bisect import bisect_left
sys.path.insert(0, "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r4/regime")
from common import *
OUT = SP + "/research/r4/regime"; WEEKS_TR = 174.3; WEEKS_ALL = 260.9
def report(name, rows, mk, path):
    tr, te = split(rows); write_csv(rows, mk, path)
    print(f"{name}: N={len(rows)} ({len(rows)/WEEKS_ALL:.2f}/Woche) | {stat_line(rows, mk)} | Jahre {years_pos(rows, mk)} | avg RR {sum(abs(r['tp']-r['entry']) for r in rows)/sum(abs(r['sl']-r['entry']) for r in rows):.2f}")
for tag in ("NQ", "ES", "YM"):
    mk = Market(tag); ev = pickle.load(open(f"{OUT}/events_{tag}.pkl", "rb"))
    if tag == "NQ":
        k1 = [e for e in ev if e["setup"] == "D_momo" and e["dir"] == "long" and e.get("trend_w") is not None and e["trend_w"] >= 0.5 and e.get("vwap_w") is not None and e["vwap_w"] >= 1]
        # Doppelte Entries (N=6 und N=12 am selben Bar) entfernen
        seen = set(); k1u = []
        for e in sorted(k1, key=lambda e: (e["d"], e["t"])):
            if (e["d"], e["t"]) in seen: continue
            seen.add((e["d"], e["t"])); k1u.append(e)
        report("K1 NQ D_momo long trend_w>=0.5 & vwap_w>=1", k1u, mk, f"{OUT}/trades_K1_NQ_momo_trend_vwap.csv")
    k2 = []
    for e in ev:
        if e["setup"] != "C_level" or e["t"] < 570: continue
        d = e["d"]; mods, o, c, lo, hi, v = mk.days[d]; a = bisect_left(mods, 570); i = bisect_left(mods, e["t"])
        if (max(hi[a:i+1]) - min(lo[a:i+1])) / mk.reg[d]["atr"] >= 1.0: k2.append(e)
    report(f"K2 {tag} C_level rng_used>=1.0", k2, mk, f"{OUT}/trades_K2_{tag}_level_exhausted.csv")
