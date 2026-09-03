"""Analyse der Level-Sweep-Events: Overlap-freie Auswahl (chronologisch, naechster Trade erst nach Exit des vorherigen),
Train/Test getrennt, Aufschluesselung nach Level-Typ, Cluster-Groesse, Body, Buffer, Zeitstopp."""
import sys, pickle, math, datetime as dt
from collections import defaultdict
SP = "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r4/level_cluster"
COST = {"NQ": 0.75, "ES": 0.4, "YM": 2.5}; USD = {"NQ": 20, "ES": 50, "YM": 5}
SPLIT = dt.date(2025, 1, 1)
import os
SUF = os.environ.get("SUF", "")
def load(inst):
    ev = pickle.load(open(SP + f"/events_{inst}{SUF}.pkl", "rb")); ev.sort(key=lambda e: (e["date"], e["entry_t"], e["lid"]))
    return ev
def select(events, key, pred=lambda e: True, dedupe=True):
    """Overlap-frei: pro Tag chronologisch; gleicher Entry-Bar mehrerer Level -> ein Trade (dedupe)."""
    out = []; last_day = None; busy_until = -1
    for e in events:
        if not pred(e): continue
        if e["date"] != last_day: last_day = e["date"]; busy_until = -1
        if e["entry_t"] <= busy_until: continue   # laufender Trade (Exit-Bar zaehlt als belegt)
        r, xt, tag = e["res"][key]; out.append((e, r, xt, tag)); busy_until = xt
    return out
def stats(sel, inst):
    n = len(sel)
    if n == 0: return (0, 0.0, 0.0)
    w = sum(1 for e, r, xt, tag in sel if r > 0); usd = sum((r - COST[inst]) * USD[inst] for e, r, xt, tag in sel)
    return (n, w/n*100, usd)
def report(label, sel, inst, weeks_tr=174, weeks_te=87):
    tr = [x for x in sel if x[0]["date"] < SPLIT]; te = [x for x in sel if x[0]["date"] >= SPLIT]
    a = stats(tr, inst); b = stats(te, inst)
    print(f"{label:58s} TR N={a[0]:5d} WR={a[1]:5.1f} {a[2]:+9.0f}$ ({a[0]/weeks_tr:4.1f}/wk) | TE N={b[0]:5d} WR={b[1]:5.1f} {b[2]:+9.0f}$ ({b[0]/weeks_te:4.1f}/wk)")
    return a, b
if __name__ == "__main__":
    inst = sys.argv[1]; ev = load(inst)
    print(inst, "events", len(ev))
    for key in [(0.02, None), (0.05, None), (0.02, 120), (0.05, 120)]:
        print("\n=== buf/ts", key, "===")
        for bt in [0.0, 0.6, 0.75]:
            report(f"all body>={bt}", select(ev, key, lambda e: e["body"] >= bt), inst)
        for bt in [0.6, 0.75]:
            report(f"body>={bt} ncl>=2", select(ev, key, lambda e: e["body"] >= bt and e["ncl"] >= 2), inst)
            report(f"body>={bt} ncl>=3", select(ev, key, lambda e: e["body"] >= bt and e["ncl"] >= 3), inst)
            report(f"body>={bt} ncl==1", select(ev, key, lambda e: e["body"] >= bt and e["ncl"] == 1), inst)
            report(f"body>={bt} not same_bar", select(ev, key, lambda e: e["body"] >= bt and not e["same_bar"]), inst)
            report(f"body>={bt} same_bar", select(ev, key, lambda e: e["body"] >= bt and e["same_bar"]), inst)
    key = (0.02, None)
    print("\n=== nach Level-Typ, body>=0.6, buf 0.02, EOD (Events unabhaengig, ohne Overlap-Regel; TRAIN) ===")
    bytype = defaultdict(list)
    for e in ev:
        if e["body"] >= 0.6: bytype[e["typ"]].append(e)
    for t in sorted(bytype, key=lambda t: -len(bytype[t])):
        report(f"typ {t}", select(bytype[t], key), inst)
    print("\n=== nach Cluster-Groesse ncl (body>=0.6) ===")
    for n in range(1, 7):
        report(f"ncl=={n}", select(ev, key, lambda e, n=n: e["body"] >= 0.6 and e["ncl"] == n), inst)
    print("\n=== Richtung ===")
    for dd in ("long", "short"):
        report(f"dir {dd} body>=0.6", select(ev, key, lambda e, dd=dd: e["body"] >= 0.6 and e["dir"] == dd), inst)
    print("\n=== Stunde des Entry (body>=0.6) ===")
    for h in range(2, 16):
        report(f"hour {h:02d}", select(ev, key, lambda e, h=h: e["body"] >= 0.6 and e["entry_t"]//60 == h), inst)
    print("\n=== Sweep-Tiefe (ATR) body>=0.6 ===")
    for a_, b_ in [(0, 0.02), (0.02, 0.05), (0.05, 0.1), (0.1, 0.2), (0.2, 9)]:
        report(f"depth [{a_},{b_})", select(ev, key, lambda e, a_=a_, b_=b_: e["body"] >= 0.6 and a_ <= e["depth_atr"] < b_), inst)
    print("\n=== Dauer Sweep->Reclaim (min) body>=0.6 ===")
    for a_, b_ in [(0, 1), (1, 5), (5, 15), (15, 30), (30, 60), (60, 121)]:
        report(f"dur [{a_},{b_})", select(ev, key, lambda e, a_=a_, b_=b_: e["body"] >= 0.6 and a_ <= e["dur"] < b_), inst)
