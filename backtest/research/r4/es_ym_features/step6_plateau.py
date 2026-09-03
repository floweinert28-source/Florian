"""Schritt 6: Plateau-Check YM gepoolt: sweep_atr >= a & reclaim_body < b (Train / Test / N)."""
import sys, pickle
sys.path.insert(0, "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r4/es_ym_features")
import fw
for TAG in ("YM", "ES"):
    R = pickle.load(open(f"rows_{TAG}.pkl", "rb")); pooled = [r for rows in R.values() for r in rows]; tr, te = fw.split(pooled)
    print(f"{TAG} gepoolt: Zeile = sweep_atr >= a, Spalte = reclaim_body < b : WRtrain/WRtest (Ntr/Nte)")
    bs = (0.25, 0.35, 0.45, 0.55, 1.01); print(f"{'':8s}" + "".join(f"{'b<'+str(b):>24s}" for b in bs))
    for a in (0.0, 0.02, 0.03, 0.04, 0.05, 0.07, 0.10):
        line = f"a>={a:<5}"
        for b in bs:
            g = [r for r in tr if r["sweep_atr"] >= a and r["reclaim_body"] < b]; gt = [r for r in te if r["sweep_atr"] >= a and r["reclaim_body"] < b]
            line += f"{fw.wr(g):5.1f}/{fw.wr(gt):5.1f}({len(g)}/{len(gt)})".rjust(24)
        print(line)
    print("  Zonen-Aufschluesselung der Zelle a>=0.05,b<0.35:")
    for kind, rows in R.items():
        g = [r for r in rows if r["sweep_atr"] >= 0.05 and r["reclaim_body"] < 0.35]; a_, b_ = fw.split(g)
        print(f"    {kind:10s} {fw.wr(a_):5.1f}/{fw.wr(b_):5.1f} ({len(a_)}/{len(b_)})")
