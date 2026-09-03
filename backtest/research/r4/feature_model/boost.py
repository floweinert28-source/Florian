"""Schritt 2c: Gradient Boosting (eigene Impl., logistische Verlustfunktion, Newton-Blattwerte, Baeume Tiefe 1 oder 2 auf 32 Quantil-Bins).
Staerkster Test auf nichtlineares Signal. Innere Validierung (fit<2024, val 2024) waehlt Rundenzahl; dann Fit TRAIN -> TEST.
Aufruf: python boost.py <depth> <rounds> [subset: all|big]"""
import sys, math, datetime as dt, pickle
from array import array
from fm_lib import *
DEPTH = int(sys.argv[1]); ROUNDS = int(sys.argv[2]); SUB = sys.argv[3] if len(sys.argv) > 3 else "all"
NB, LR_, LAM, MINH = 32, 0.1, 10.0, 200.0
rows, feats0 = load("NQ")
feats = [f for f in feats0 if f not in ("atr_pts", "sld_pts", "minute", "lt_code")]
if SUB == "big": rows = [r for r in rows if r["sld_atr"] >= 0.1]
tr, te = split(rows); print("SUB", SUB, "TRAIN", len(tr), "TEST", len(te), flush=True)

def binify(trA, others):
    cuts = []
    for f in feats:
        v = sorted(r[f] for r in trA); n = len(v); cuts.append([v[int(n*q/NB)] for q in range(1, NB)])
    def enc(rs):
        out = []
        for f, ct in zip(feats, cuts):
            col = array("b")
            for r in rs:
                x = r[f]; k = 0
                # bisect
                lo_, hi_ = 0, len(ct)
                while lo_ < hi_:
                    mid = (lo_+hi_)//2
                    if ct[mid] <= x: lo_ = mid+1
                    else: hi_ = mid
                col.append(lo_)
            out.append(col)
        return out
    return enc(trA), [enc(o) for o in others], cuts

def fit_boost(B, y, rounds, evalsets):
    n = len(y); F = [0.0]*n; trees = []; Fe = [[0.0]*len(s[1]) for s in evalsets]; hist = []
    def best_split(idxs, g, h):
        G = sum(g[i] for i in idxs); H = sum(h[i] for i in idxs); base = G*G/(H+LAM); best = None
        for j, col in enumerate(B):
            Gb = [0.0]*NB; Hb = [0.0]*NB
            for i in idxs: b = col[i]; Gb[b] += g[i]; Hb[b] += h[i]
            gl = hl = 0.0
            for b in range(NB-1):
                gl += Gb[b]; hl += Hb[b]; gr = G-gl; hr = H-hl
                if hl < MINH or hr < MINH: continue
                gain = gl*gl/(hl+LAM) + gr*gr/(hr+LAM) - base
                if best is None or gain > best[0]: best = (gain, j, b, -gl/(hl+LAM), -gr/(hr+LAM))
        return best
    for t in range(rounds):
        p = [sigmoid(f) for f in F]; g = [pi - yi for pi, yi in zip(p, y)]; h = [pi*(1-pi) for pi in p]
        root = list(range(n)); sp = best_split(root, g, h)
        if sp is None: break
        _, j, b, vl, vr = sp; tree = {"j": j, "b": b}
        L = [i for i in root if B[j][i] <= b]; R = [i for i in root if B[j][i] > b]
        if DEPTH == 2:
            for side, idxs, v in (("L", L, vl), ("R", R, vr)):
                s2 = best_split(idxs, g, h)
                tree[side] = {"j": s2[1], "b": s2[2], "vl": s2[3], "vr": s2[4]} if s2 else {"v": v}
        else: tree["L"] = {"v": vl}; tree["R"] = {"v": vr}
        def val(tree, getb):
            node = tree["L"] if getb(tree["j"]) <= tree["b"] else tree["R"]
            if "v" in node: return node["v"]
            return node["vl"] if getb(node["j"]) <= node["b"] else node["vr"]
        for i in range(n): F[i] += LR_*val(tree, lambda jj: B[jj][i])
        for k, (Bk, yk) in enumerate(evalsets):
            for i in range(len(yk)): Fe[k][i] += LR_*val(tree, lambda jj: Bk[jj][i])
        trees.append(tree)
        ll = [-sum((math.log(max(sigmoid(f), 1e-12)) if yy else math.log(max(1-sigmoid(f), 1e-12))) for f, yy in zip(Fk, yk))/len(yk) for Fk, (Bk, yk) in zip(Fe, evalsets)]
        hist.append(ll)
        if t % 10 == 0 or t == rounds-1: print(f"  runde {t:3d} split {feats[j]}<=bin{b} | eval logloss " + " ".join(f"{x:.5f}" for x in ll), flush=True)
    return trees, F, Fe, hist

# (1) innere Validierung
cut = dt.date(2024, 1, 1); trA = [r for r in tr if r["day"] < cut]; trB = [r for r in tr if r["day"] >= cut]
BA, (BB,), cuts = binify(trA, [trB]); yA = [r["win"] for r in trA]; yB = [r["win"] for r in trB]
print("=== INNER fit<2024 val 2024 ===", flush=True)
trees, FA, (FB,), hist = fit_boost(BA, yA, ROUNDS, [(BB, yB)])
best_t = min(range(len(hist)), key=lambda t: hist[t][0]) + 1
print(f"beste Rundenzahl (val logloss) = {best_t}, logloss {hist[best_t-1][0]:.5f} (Basis {-(sum(yB)/len(yB)*math.log(sum(yB)/len(yB)) + (1-sum(yB)/len(yB))*math.log(1-sum(yB)/len(yB))):.5f})")
weeksA = (cut - dt.date(2021, 9, 1)).days/7
qs = sorted(FA)
for q in range(10):
    lo_ = qs[int(len(qs)*q/10)]; hi_ = qs[int(len(qs)*(q+1)/10)] if q < 9 else 1e9
    gA = [r for r, s in zip(trA, FA) if lo_ <= s < hi_]; gB = [r for r, s in zip(trB, FB) if lo_ <= s < hi_]
    print(f"  D{q}: fit WR {wr(gA):5.1f} (n={len(gA)}) | val WR {wr(gB):5.1f} (n={len(gB)})")
for tpw in (3, 5, 10, 20, 40):
    report(f"INNER boost d{DEPTH} {tpw}/wk", trA, trB, FA, FB, thr_for_count(FA, int(tpw*weeksA)))
# (2) TRAIN -> TEST mit best_t Runden
print(f"=== FULL train->TEST, {best_t} Runden ===", flush=True)
BT, (BE,), cuts = binify(tr, [te]); yT = [r["win"] for r in tr]; yE = [r["win"] for r in te]
trees, FT, (FE,), hist = fit_boost(BT, yT, best_t, [(BE, yE)])
for tpw in (3, 5, 10, 20, 40):
    report(f"FULL boost d{DEPTH} {tpw}/wk", tr, te, FT, FE, thr_for_count(FT, int(tpw*WEEKS_TRAIN)))
# Feature-Nutzung
use = {}
for t_ in trees:
    use[feats[t_["j"]]] = use.get(feats[t_["j"]], 0) + 1
    for s in ("L", "R"):
        if "j" in t_[s]: use[feats[t_[s]["j"]]] = use.get(feats[t_[s]["j"]], 0) + 1
print("Feature-Nutzung:", sorted(use.items(), key=lambda t: -t[1])[:20])
pickle.dump(dict(FT=FT, FE=FE, trees=trees, feats=feats, cuts=cuts), open(f"{OUT}/boost_d{DEPTH}_{SUB}.pkl", "wb"))
thr = thr_for_count(FT, int(3*WEEKS_TRAIN)); s_tr, s_te, n_tr, n_te = report(f"KANDIDAT boost d{DEPTH} {SUB} 3/wk", tr, te, FT, FE, thr)
write_trades(n_tr + n_te, f"{OUT}/trades_boost_d{DEPTH}_{SUB}_3wk.csv"); print("Jahre:", years_pos(n_tr + n_te))
