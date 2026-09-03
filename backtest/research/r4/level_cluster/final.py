"""Finale Kandidaten-CSVs: Basisregel (1m, body>=0.75, ncl>=2, buf 0.02 ATR, Exit 16:00) je Instrument + NQ 15m body>=0.75."""
import os, sys, csv, datetime as dt
from collections import defaultdict
import analyze as A
def run(inst, suf, name, pred):
    A.SUF = suf; ev = A.load(inst); key = (0.02, None); sel = A.select(ev, key, pred)
    fn = f"trades_{inst}{suf}_{name}.csv"
    with open(fn, "w", newline="") as f:
        w = csv.writer(f); w.writerow(["date", "dir", "entry_time", "entry", "sl", "tp", "result", "pnl_usd", "level", "ncl", "body"])
        for e, r, xt, tag in sel:
            sl = e["ext"] + (0.02*e["atr"] if e["dir"] == "short" else -0.02*e["atr"]); sld = abs(e["entry"] - sl)
            tp = e["entry"] + sld if e["dir"] == "long" else e["entry"] - sld
            w.writerow([e["date"].isoformat(), e["dir"], f"{e['entry_t']//60:02d}:{e['entry_t']%60:02d}", round(e["entry"], 2), round(sl, 2), round(tp, 2), tag, round((r - A.COST[inst]) * A.USD[inst], 2), e["typ"], e["ncl"], round(e["body"], 2)])
    tr = [x for x in sel if x[0]["date"] < A.SPLIT]; te = [x for x in sel if x[0]["date"] >= A.SPLIT]
    a = A.stats(tr, inst); b = A.stats(te, inst)
    py = defaultdict(lambda: [0, 0, 0.0])
    for e, r, xt, tag in sel: y = e["date"].year; py[y][0] += 1; py[y][1] += r > 0; py[y][2] += (r - A.COST[inst]) * A.USD[inst]
    print(f"{inst}{suf} {name}: N={len(sel)} ({len(sel)/261:.1f}/wk) TRAIN N={a[0]} WR={a[1]:.1f} net={a[2]:+.0f} | TEST N={b[0]} WR={b[1]:.1f} net={b[2]:+.0f} | " +
          " ".join(f"{y}:{py[y][1]/py[y][0]*100:.0f}%/{py[y][2]:+.0f}$" for y in sorted(py)) + f" | {os.path.abspath(fn)}")
for inst in ("NQ", "ES", "YM"):
    run(inst, "", "base", lambda e: e["body"] >= 0.75 and e["ncl"] >= 2)
run("NQ", "_15m", "b75", lambda e: e["body"] >= 0.75)
