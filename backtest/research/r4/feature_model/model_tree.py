"""Schritt 2b: Entscheidungsbaum Tiefe 3 (Gini, eigene Impl.) auf allen Sweep+Reclaim-Events (NQ).
 (1) Innere Validierung (Fit <2024, Val 2024), (2) Fit auf TRAIN -> Blaetter; beste Blaetter (>= 3/wk) auf TEST."""
import sys, math, datetime as dt, pickle
from fm_lib import *
TAG = sys.argv[1] if len(sys.argv) > 1 else "NQ"
MINLEAF = int(sys.argv[2]) if len(sys.argv) > 2 else 1500
DEPTH = int(sys.argv[3]) if len(sys.argv) > 3 else 3
rows, feats0 = load(TAG)
feats = [f for f in feats0 if f not in ("atr_pts", "sld_pts", "minute")]
tr, te = split(rows)
def leaves(node, path=""):
    if "feat" in node:
        return leaves(node["left"], path + f"{node['fname']}<={node['thr']:.3f} & ") + leaves(node["right"], path + f"{node['fname']}>{node['thr']:.3f} & ")
    return [(path.rstrip(" &"), node)]
def run(trA, trB, label, weeksA):
    XA = matrix(trA, feats); XB = matrix(trB, feats)
    tree = train_tree(XA, [r["win"] for r in trA], depth=DEPTH, min_leaf=MINLEAF, feats=feats)
    print(f"=== {label} Baum ==="); tree_print(tree)
    sA = [tree_predict(tree, XA, i) for i in range(len(trA))]; sB = [tree_predict(tree, XB, i) for i in range(len(trB))]
    for path, node in sorted(leaves(tree), key=lambda t: -t[1]["wr"]):
        gA = [r for r, s in zip(trA, sA) if s == node["wr"]]; gB = [r for r, s in zip(trB, sB) if s == node["wr"]]
        nA, nB = nonoverlap(gA), nonoverlap(gB)
        print(f"  Blatt [{path}] fit N={len(gA)} WR={wr(gA):.1f} ({len(gA)/weeksA:.1f}/wk) NO N={len(nA)} WR={wr(nA):.1f} | holdout N={len(gB)} WR={wr(gB):.1f} NO N={len(nB)} WR={wr(nB):.1f} net={netto(nB):+.0f}")
    return tree, sA, sB
cut = dt.date(2024, 1, 1)
run([r for r in tr if r["day"] < cut], [r for r in tr if r["day"] >= cut], "INNER fit<2024 val 2024", (cut - dt.date(2021, 9, 1)).days/7)
tree, sTR, sTE = run(tr, te, "FULL train->TEST", WEEKS_TRAIN)
pickle.dump(dict(tree=tree, feats=feats, sTR=sTR, sTE=sTE), open(f"{OUT}/tree_{TAG}_d{DEPTH}_ml{MINLEAF}.pkl", "wb"))
# Kandidat: bestes Blatt (Train) als Regel
best = max(leaves(tree), key=lambda t: t[1]["wr"])
s_tr = [r for r, s in zip(tr, sTR) if s == best[1]["wr"]]; s_te = [r for r, s in zip(te, sTE) if s == best[1]["wr"]]
n_tr, n_te = nonoverlap(s_tr), nonoverlap(s_te)
print(f"KANDIDAT Baum bestes Blatt [{best[0]}]: TRAIN N={len(s_tr)} WR={wr(s_tr):.1f} NO N={len(n_tr)} WR={wr(n_tr):.1f} net={netto(n_tr):+.0f} | TEST N={len(s_te)} WR={wr(s_te):.1f} NO N={len(n_te)} WR={wr(n_te):.1f} net={netto(n_te):+.0f}")
write_trades(n_tr + n_te, f"{OUT}/trades_tree_{TAG}_d{DEPTH}.csv"); print("Jahre:", years_pos(n_tr + n_te))
