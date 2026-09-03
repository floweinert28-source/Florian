"""Schritt 1: Basis-Setups (8 Zonen) fuer ein Instrument, Basisstatistik + Quartil-Analyse auf TRAIN; Rows als Pickle."""
import sys, pickle, time
sys.path.insert(0, "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r4/es_ym_features")
import fw
TAG = sys.argv[1]
t0 = time.time(); I = fw.Inst(TAG); NQ = fw.Inst("NQ") if TAG != "NQ" else None
print(f"{TAG}: {len(I.hist)} RTH-Tage, {sum(1 for d in I.dates if I.tradable(d))} handelbar; geladen in {time.time()-t0:.0f}s", flush=True)
allrows = {}
for kind in ("london", "asia", "premkt", "orb15", "orb30", "overnight", "pd", "pd_pre"):
    rows = fw.build(I, kind, NQ)
    allrows[kind] = rows
    if not rows: print(kind, "keine Trades"); continue
    fw.quartiles(rows, f"{TAG} {kind} Sweep+Reclaim buf0.1 wait120 1R")
pickle.dump(allrows, open(f"rows_{TAG}.pkl", "wb"))
print("fertig", time.time()-t0)
