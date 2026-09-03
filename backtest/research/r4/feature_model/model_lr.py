"""Schritt 2a: Logistische Regression (eigene Impl., Full-Batch-GD mit Momentum, L2) auf allen Sweep+Reclaim-Events (NQ).
 (1) Innere Validierung: Fit 2021-09..2023-12, Validierung 2024 (kein Test-Kontakt) -> traegt die Tail-Selektion out-of-sample?
 (2) Fit auf gesamtem TRAIN, Schwellwerte fuer 3/5/10/20 Trades pro Woche (auf TRAIN gewaehlt), einmalige Pruefung auf TEST.
 (3) Gewichte.
Aufruf: python model_lr.py [l2] [tag]"""
import sys, math, datetime as dt, pickle
from fm_lib import *
L2 = float(sys.argv[1]) if len(sys.argv) > 1 else 1e-3
TAG = sys.argv[2] if len(sys.argv) > 2 else "NQ"
rows, feats0 = load(TAG)
SUB = sys.argv[3] if len(sys.argv) > 3 else "all"
if SUB == "big": rows = [r for r in rows if r["sld_atr"] >= 0.1]
print("SUB", SUB, flush=True)
# abgeleitete Features: Stunden-Bins & Wochentag-One-Hot (kausal); Preisniveau-Features raus
HB = [(18, 24, "h18_24"), (0, 2, "h00_02"), (2, 5, "h02_05"), (5, 9.5, "h05_0930"), (9.5, 11, "h0930_11"), (11, 14, "h11_14"), (14, 16, "h14_16")]
for r in rows:
    for a, b, nm in HB: r[nm] = 1 if a <= r["hour"] < b else 0
    for k in range(5): r[f"wd{k}"] = 1 if r["wd"] == k else 0
    r["body_x_rth"] = r["reclaim_body"] * r["is_rth"]; r["body_x_depth"] = r["reclaim_body"] * r["sweep_depth_W"]
    r["log_sld"] = math.log(max(r["sld_atr"], 1e-4)); r["log_dur"] = math.log(1 + r["sweep_dur"]); r["log_vol"] = math.log(max(r["vol_reclaim"], 1e-3))
feats = [f for f in feats0 if f not in ("atr_pts", "sld_pts", "minute", "lt_code")] + [nm for _, _, nm in HB] + [f"wd{k}" for k in range(5)] + ["body_x_rth", "body_x_depth", "log_sld", "log_dur", "log_vol"]
print("Features:", len(feats), feats, flush=True)
tr, te = split(rows); ytr = [r["win"] for r in tr]; yte = [r["win"] for r in te]
print(f"TRAIN {len(tr)} WR {wr(tr):.2f} | TEST {len(te)} WR {wr(te):.2f}", flush=True)

def fit_eval(trA, trB, label, targets_per_week, weeksB, epochs=250):
    XA = matrix(trA, feats); XB = matrix(trB, feats)
    XA, (XB,), mu, sd = standardize(XA, [XB])
    w, b = train_lr(XA, [r["win"] for r in trA], l2=L2, lr=0.3, epochs=epochs, verbose=True)
    sA = predict_lr(w, b, XA); sB = predict_lr(w, b, XB)
    # Dezil-Kalibrierung auf B
    print(f"--- {label}: Dezile nach Score (Fit-Set / Holdout) ---")
    qs = sorted(sA)
    for q in range(10):
        lo_ = qs[int(len(qs)*q/10)]; hi_ = qs[min(len(qs)-1, int(len(qs)*(q+1)/10))] if q < 9 else 1e9
        gA = [r for r, s in zip(trA, sA) if lo_ <= s < hi_]; gB = [r for r, s in zip(trB, sB) if lo_ <= s < hi_]
        print(f"  D{q}: fit WR {wr(gA):5.1f} (n={len(gA)}) | holdout WR {wr(gB):5.1f} (n={len(gB)})")
    # Tail: Schwellwert aus Fit-Set fuer Ziel-Frequenz, angewendet auf Holdout
    weeksA = (trA[-1]["day"] - trA[0]["day"]).days/7
    for tpw in targets_per_week:
        thr = thr_for_count(sA, int(tpw*weeksA))
        report(f"{label} {tpw}/wk", trA, trB, sA, sB, thr)
    return w, b, mu, sd, sA, sB

# (1) innere Validierung
cut = dt.date(2024, 1, 1)
trA = [r for r in tr if r["day"] < cut]; trB = [r for r in tr if r["day"] >= cut]
fit_eval(trA, trB, "INNER(fit<2024, val 2024)", [3, 5, 10, 20, 40], 52, epochs=200)
# (2) voller Train -> Test
w, b, mu, sd, sTR, sTE = fit_eval(tr, te, "FULL(train->TEST)", [3, 5, 10, 20, 40], WEEKS_TEST, epochs=250)
print("--- Gewichte (standardisiert), sortiert nach |w| ---")
for f, x in sorted(zip(feats, w), key=lambda t: -abs(t[1])): print(f"  {f:18s} {x:+.4f}")
print(f"  bias {b:+.4f}")
pickle.dump(dict(feats=feats, w=w, b=b, mu=mu, sd=sd, sTR=sTR, sTE=sTE, l2=L2), open(f"{OUT}/lr_{TAG}_l2{L2:g}_{SUB}.pkl", "wb"))
# Kandidat: 3/wk-Schwellwert (train) -> Trade-CSVs
thr = thr_for_count(sTR, int(3*WEEKS_TRAIN))
s_tr, s_te, n_tr, n_te = report("KANDIDAT LR 3/wk", tr, te, sTR, sTE, thr)
write_trades(n_tr + n_te, f"{OUT}/trades_lr_{TAG}_{SUB}_3wk.csv")
print("Jahre:", years_pos(n_tr + n_te))
