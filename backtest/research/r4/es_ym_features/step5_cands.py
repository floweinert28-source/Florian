"""Schritt 5: Beste (nicht-ueberlebende) Zellen als dokumentierte Kandidaten: Trade-CSV, Jahresbilanz, Train/Test."""
import sys, pickle
from collections import defaultdict
sys.path.insert(0, "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r4/es_ym_features")
import fw
R = {t: pickle.load(open(f"rows_{t}.pkl", "rb")) for t in ("ES", "YM")}
pooled = {t: [r for rows in R[t].values() for r in rows] for t in R}
CANDS = [
 ("YM_pooled_deepsweep_weakbody", pooled["YM"], lambda r: r["sweep_atr"] >= 0.05 and r["reclaim_body"] < 0.35),
 ("YM_pooled_sweepQ3_dayrngQ3", pooled["YM"], lambda r: 0.03 <= r["sweep_atr"] < 0.07 and 0.54 <= r["day_rng"] < 0.76),
 ("YM_asia_hour0302_0339", R["YM"]["asia"], lambda r: 3.02 <= r["hour"] < 3.65),
 ("ES_premkt_onposQ2_dayposMID", R["ES"]["premkt"], lambda r: 0.19 <= r["on_pos"] < 0.54 and 0.23 <= r["day_pos"] < 0.81),
 ("ES_pdpre_sweepH2_WatrH2", R["ES"]["pd_pre"], lambda r: r["sweep_atr"] >= 0.03 and r["W_atr"] >= 0.93),
 ("YM_pooled_body075", pooled["YM"], lambda r: r["reclaim_body"] >= 0.75),
 ("ES_pooled_body075", pooled["ES"], lambda r: r["reclaim_body"] >= 0.75),
]
for name, rows, sel in CANDS:
    s = [r for r in rows if sel(r)]; s.sort(key=lambda r: (r["day"], r["entry_t"])); tr, te = fw.split(s)
    fw.write_csv(s, f"cand_{name}.csv")
    py = defaultdict(lambda: [0, 0, 0.0])
    for r in s: y = r["day"].year; py[y][0] += 1; py[y][1] += r["win"]; py[y][2] += r["usd"]
    print(f"{name}: N={len(s)} {len(s)/fw.weeks(s):.2f}/Wo | Train {fw.stats(tr)} | Test {fw.stats(te)} | Jahre {fw.years_pos(s)}")
    print("   " + "  ".join(f"{y}:{py[y][0]}/{py[y][1]/py[y][0]*100:.0f}%/{py[y][2]:+.0f}" for y in sorted(py)))
