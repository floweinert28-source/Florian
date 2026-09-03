"""Gemeinsame Bibliothek: Laden, Feature-Matrix, Standardisierung, Log. Regression (GD, L2), Entscheidungsbaum (Tiefe 3),
Schwellenwahl, Evaluierung, Nicht-ueberlappende Trade-Simulation. Pure Python (array-Modul fuer Speicher)."""
import math, pickle, datetime as dt, csv, random
from array import array
from operator import mul, add
from collections import defaultdict
SP = "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad"
OUT = SP + "/research/r4/feature_model"
TEST0 = dt.date(2025, 1, 1)
META = {"day", "ei", "xi", "dirn", "lt", "entry", "sl", "tp", "res", "tag", "win", "usd", "entry_abs", "exit_abs", "entry_time"}
WEEKS_TRAIN = (dt.date(2024, 12, 31) - dt.date(2021, 9, 1)).days / 7      # ~173.9
WEEKS_TEST = (dt.date(2026, 8, 31) - dt.date(2025, 1, 1)).days / 7        # ~86.9
WEEKS_ALL = WEEKS_TRAIN + WEEKS_TEST

def load(tag="NQ", fn="events2"):
    rows = pickle.load(open(f"{OUT}/{fn}_{tag}.pkl", "rb"))
    feats = [k for k in rows[0] if k not in META]
    return rows, feats

def split(rows):
    return [r for r in rows if r["day"] < TEST0], [r for r in rows if r["day"] >= TEST0]

def matrix(rows, feats):
    """Spaltenweise Feature-Matrix (array('d') je Feature)."""
    return [array("d", (float(r[f]) for r in rows)) for f in feats]

def standardize(cols_tr, cols_other_list):
    mu, sd = [], []
    for c in cols_tr:
        n = len(c); m = sum(c)/n; v = sum((x-m)**2 for x in c)/n; s = math.sqrt(v) if v > 0 else 1.0
        mu.append(m); sd.append(s)
    def tf(cols): return [array("d", ((x-m)/s for x in c)) for c, m, s in zip(cols, mu, sd)]
    return tf(cols_tr), [tf(c) for c in cols_other_list], mu, sd

def sigmoid(z): return 1.0/(1.0+math.exp(-z)) if z > -30 else 1e-13

def predict_lr(w, b, cols):
    n = len(cols[0]); z = [b]*n
    for wj, c in zip(w, cols):
        if wj: z = list(map(add, z, map(wj.__mul__, c)))
    return z  # Logits

def train_lr(cols, y, l2=1e-3, lr=0.3, epochs=300, mom=0.9, verbose=True, tol=1e-7):
    """Logistische Regression, Full-Batch-Gradientenabstieg mit Momentum, L2 auf Gewichte (nicht Bias).
    Loss = mean logloss + l2/2 * |w|^2."""
    n = len(y); p = len(cols); w = [0.0]*p; b = 0.0; vw = [0.0]*p; vb = 0.0; prev_loss = None
    ya = array("d", y)
    for ep in range(epochs):
        z = predict_lr(w, b, cols)
        pr = [sigmoid(v) for v in z]
        loss = -sum((math.log(max(q, 1e-12)) if t else math.log(max(1-q, 1e-12))) for q, t in zip(pr, y))/n + l2/2*sum(x*x for x in w)
        R = array("d", map(lambda q, t: q - t, pr, ya))
        gb = sum(R)/n
        gw = [sum(map(mul, R, c))/n + l2*wj for c, wj in zip(cols, w)]
        vw = [mom*v - lr*g for v, g in zip(vw, gw)]; vb = mom*vb - lr*gb
        w = [x + v for x, v in zip(w, vw)]; b += vb
        if verbose and (ep % 20 == 0 or ep == epochs-1): print(f"  ep {ep:4d} loss {loss:.6f}", flush=True)
        if prev_loss is not None and abs(prev_loss - loss) < tol and ep > 30:
            if verbose: print(f"  konvergiert ep {ep} loss {loss:.6f}", flush=True)
            break
        prev_loss = loss
    return w, b

# ---------- Entscheidungsbaum ----------
def train_tree(cols, y, depth=3, min_leaf=1500, feats=None):
    n = len(y); order = [sorted(range(n), key=c.__getitem__) for c in cols]
    def build(mask, d):
        idxs = [i for i in range(n) if mask[i]]; cnt = len(idxs); wins = sum(y[i] for i in idxs)
        node = {"n": cnt, "wr": wins/cnt if cnt else 0.5}
        if d == depth or cnt < 2*min_leaf: return node
        best = None
        for j, c in enumerate(cols):
            ordj = [i for i in order[j] if mask[i]]
            cw = 0; k = 0
            for k in range(cnt-1):
                i = ordj[k]; cw += y[i]
                if k+1 < min_leaf or cnt-k-1 < min_leaf: continue
                if c[ordj[k+1]] == c[i]: continue
                nl, nr = k+1, cnt-k-1; wl, wr_ = cw, wins-cw
                # Gini-Verbesserung
                gl = 1 - (wl/nl)**2 - (1-wl/nl)**2; gr = 1 - (wr_/nr)**2 - (1-wr_/nr)**2
                g = (nl*gl + nr*gr)/cnt
                if best is None or g < best[0]: best = (g, j, (c[i]+c[ordj[k+1]])/2, nl, nr)
        if best is None: return node
        g, j, thr, nl, nr = best
        ml = [mask[i] and cols[j][i] <= thr for i in range(n)]; mr = [mask[i] and cols[j][i] > thr for i in range(n)]
        node.update(feat=j, fname=(feats[j] if feats else str(j)), thr=thr, left=build(ml, d+1), right=build(mr, d+1))
        return node
    return build([True]*n, 0)

def tree_predict(tree, cols, i):
    node = tree
    while "feat" in node: node = node["left"] if cols[node["feat"]][i] <= node["thr"] else node["right"]
    return node["wr"]

def tree_print(node, ind=0, out=None):
    s = " "*ind
    if "feat" in node:
        print(f"{s}[{node['fname']} <= {node['thr']:.4f}] n={node['n']} wr={node['wr']*100:.1f}")
        tree_print(node["left"], ind+2); tree_print(node["right"], ind+2)
    else: print(f"{s}LEAF n={node['n']} wr={node['wr']*100:.1f}%")

# ---------- Auswertung ----------
def wr(rs): return sum(r["win"] for r in rs)/len(rs)*100 if rs else float("nan")
def netto(rs): return sum(r["usd"] for r in rs)

def nonoverlap(rs):
    """Nur ein offener Trade: Events chronologisch, ueberspringe Event, wenn Entry-Bar vor Exit des offenen Trades liegt."""
    out = []; busy_until = -1
    for r in sorted(rs, key=lambda r: r["entry_abs"]):
        if r["entry_abs"] <= busy_until: continue
        out.append(r); busy_until = r["exit_abs"]
    return out

def years_pos(rs):
    py = defaultdict(float)
    for r in rs: py[r["day"].year] += r["usd"]
    return " ".join(f"{y}:{'+' if py[y] > 0 else '-'}({py[y]:+.0f})" for y in sorted(py))

def report(name, tr, te, score_tr, score_te, thr):
    """tr/te rows mit score; thr auf Score. Gibt Statistik (alle Events + nicht-ueberlappend)."""
    s_tr = [r for r, s in zip(tr, score_tr) if s >= thr]; s_te = [r for r, s in zip(te, score_te) if s >= thr]
    n_tr, n_te = nonoverlap(s_tr), nonoverlap(s_te)
    line = (f"{name:38s} thr={thr:.4f} | TRAIN N={len(s_tr):5d} WR={wr(s_tr):5.1f} ({len(s_tr)/WEEKS_TRAIN:4.1f}/wk) NO: N={len(n_tr):4d} WR={wr(n_tr):5.1f} net={netto(n_tr):+8.0f}"
            f" | TEST N={len(s_te):5d} WR={wr(s_te):5.1f} ({len(s_te)/WEEKS_TEST:4.1f}/wk) NO: N={len(n_te):4d} WR={wr(n_te):5.1f} net={netto(n_te):+8.0f}")
    print(line, flush=True)
    return s_tr, s_te, n_tr, n_te

def thr_for_count(scores, target):
    """Kleinster Schwellwert, so dass mindestens target Events >= thr."""
    s = sorted(scores, reverse=True)
    return s[min(target, len(s))-1]

def write_trades(rs, path):
    with open(path, "w", newline="") as fh:
        w = csv.writer(fh); w.writerow(["date", "dir", "entry_time", "entry", "sl", "tp", "result", "pnl_usd", "level", "exit_time_abs"])
        for r in sorted(rs, key=lambda r: r["entry_abs"]):
            w.writerow([r["day"].isoformat(), r["dirn"], r["entry_time"], round(r["entry"], 2), round(r["sl"], 2), round(r["tp"], 2), r["tag"], round(r["usd"], 2), r["lt"], r["exit_abs"]])
