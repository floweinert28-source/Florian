"""Kandidaten-Export: Trade-CSV (date, dir, entry_time, entry, sl, tp, result, pnl_usd) + Jahresstatistik. Regeln siehe CANDS."""
import sys, csv, pickle, datetime as dt
from collections import defaultdict
OUT = "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r4/swing_pools"
SPLIT = dt.date(2025, 1, 1); WK_TR = (dt.date(2024,12,31) - dt.date(2021,9,1)).days / 7; WK_TE = (dt.date(2026,8,31) - dt.date(2025,1,1)).days / 7
CANDS = {
 # name: (inst, suffix, mode, buf, tstop, filter)
 "NQ_R1_pre0930_rng04":   ("NQ", "", "R1", 0.02, 120, lambda e: 300 <= e["entry_t"] < 570 and e["rng"] >= 0.04),
 "NQ_M15_RTH_dur15_long": ("NQ", "", "M15", 0.02, 120, lambda e: 570 <= e["entry_t"] < 960 and e["dur"] >= 15 and e["dirn"] == "long"),
 "NQ_MSS_span4_prom05_long": ("NQ", "", "MSS", 0.02, 120, lambda e: e["span"] < 4 and e["prom"] < 0.05 and e["dirn"] == "long"),
 "NQ60_R1_depth06_dur5":  ("NQ", "_60m", "R1", 0.02, 120, lambda e: e["depth"] >= 0.06 and e["dur"] >= 5),
 "NQ_R1_prom10":          ("NQ", "", "R1", 0.02, 120, lambda e: e["prom"] >= 0.1),
}
for name in (sys.argv[1:] or CANDS):
    inst, suf, mode, buf, ts, f = CANDS[name]
    D = pickle.load(open(f"{OUT}/events_{inst}{suf}.pkl", "rb")); cfg = D["cfg"]; COST, USD = cfg["cost"], cfg["usd"]
    evs = sorted([e for e in D["events"] if e["mode"] == mode and f(e)], key=lambda x: x["entry_idx"])
    rows = []; busy = -1
    for e in evs:
        if e["entry_idx"] <= busy: continue
        sld, res = e["res"][buf]; pts, xidx = res[ts]; busy = xidx
        sl = e["ext"] - buf * e["atr"] if e["dirn"] == "long" else e["ext"] + buf * e["atr"]
        tp = e["entry"] + sld if e["dirn"] == "long" else e["entry"] - sld
        tag = "TP" if pts >= sld - 1e-9 else ("SL" if pts <= -sld + 1e-9 else "TIME")
        rows.append(dict(date=e["date"].isoformat(), dir=e["dirn"], entry_time=f"{e['entry_t']//60:02d}:{e['entry_t']%60:02d}",
                         entry=round(e["entry"], 2), sl=round(sl, 2), tp=round(tp, 2), result=tag, pnl_usd=round((pts - COST) * USD, 2), win=pts > 0))
    path = f"{OUT}/trades_{name}.csv"
    with open(path, "w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=["date", "dir", "entry_time", "entry", "sl", "tp", "result", "pnl_usd"]); w.writeheader()
        for r in rows: w.writerow({k: r[k] for k in w.fieldnames})
    tr = [r for r in rows if r["date"] < "2025"]; te = [r for r in rows if r["date"] >= "2025"]
    st = lambda g: (len(g), sum(r["win"] for r in g) / len(g) * 100 if g else 0, sum(r["pnl_usd"] for r in g))
    a, b = st(tr), st(te)
    py = defaultdict(lambda: [0, 0, 0.0])
    for r in rows: y = r["date"][:4]; py[y][0] += 1; py[y][1] += r["win"]; py[y][2] += r["pnl_usd"]
    print(f"{name}: N={len(rows)} ({len(rows)/(WK_TR+WK_TE):.1f}/wk) TRAIN N={a[0]} WR={a[1]:.1f} {a[2]:+.0f}$ ({a[0]/WK_TR:.1f}/wk) | TEST N={b[0]} WR={b[1]:.1f} {b[2]:+.0f}$ ({b[0]/WK_TE:.1f}/wk)")
    print("  Jahre:", "  ".join(f"{y}: N={py[y][0]} WR={py[y][1]/py[y][0]*100:.0f}% {py[y][2]:+.0f}$" for y in sorted(py)), "->", path)
