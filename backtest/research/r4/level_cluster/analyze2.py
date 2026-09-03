"""Zweite Runde: Kreuz-Features. Selektion nur nach TRAIN-Werten (Test wird mitgedruckt, aber nicht zur Auswahl benutzt)."""
import sys, pickle, datetime as dt
from collections import defaultdict, Counter
from analyze import load, select, report, SPLIT
inst = sys.argv[1]; ev = load(inst)
key = (0.02, None); B = 0.6
HIGH = {"PDH","ASH","LDH","PMH","ONH","WKH"}; LOW = {"PDL","ASL","LDL","PML","ONL","WKL"}
def side(t): return "H" if t in HIGH else ("L" if t in LOW else "N")
# Vortages-Trend: aus Events nicht direkt; nutze PDC vs. PVWAP-Level-Werte pro Tag als Proxy (PDC-PVWAP)/ATR
daylv = {}
for e in ev:
    d = e["date"]
    if d not in daylv: daylv[d] = {}
    if e["typ"] in ("PDC","PVWAP","MIDO","DO","PDH","PDL"): daylv[d][e["typ"]] = e["L"]
def pdtrend(e):
    lv = daylv.get(e["date"], {})
    if "PDC" in lv and "PVWAP" in lv: return (lv["PDC"] - lv["PVWAP"]) / e["atr"]
    return None
for e in ev:
    e["sld_atr"] = abs(e["entry"] - (e["ext"] + (0.02*e["atr"] if e["dir"] == "short" else -0.02*e["atr"]))) / e["atr"]
    e["side"] = side(e["typ"]); e["pdt"] = pdtrend(e)
print(inst, "\n=== SL-Distanz/ATR (body>=0.6) ===")
for a_, b_ in [(0, 0.05), (0.05, 0.1), (0.1, 0.15), (0.15, 0.25), (0.25, 0.4), (0.4, 9)]:
    report(f"sld [{a_},{b_})", select(ev, key, lambda e, a_=a_, b_=b_: e["body"] >= B and a_ <= e["sld_atr"] < b_), inst)
print("=== Reclaim-Tiefe (Close jenseits Level)/ATR ===")
for a_, b_ in [(0, 0.01), (0.01, 0.03), (0.03, 0.06), (0.06, 0.1), (0.1, 9)]:
    report(f"cdist [{a_},{b_})", select(ev, key, lambda e, a_=a_, b_=b_: e["body"] >= B and a_ <= e["close_dist_atr"] < b_), inst)
print("=== Body-Stufen ===")
for a_ in [0.8, 0.9, 0.95]:
    report(f"body>={a_}", select(ev, key, lambda e, a_=a_: e["body"] >= a_), inst)
    report(f"body>={a_} & not same_bar", select(ev, key, lambda e, a_=a_: e["body"] >= a_ and not e["same_bar"]), inst)
print("=== ganzer Cluster gesweept (nswept==ncl-1, ncl>=2) ===")
for n in [2, 3, 4]:
    report(f"ncl>={n} whole", select(ev, key, lambda e, n=n: e["body"] >= B and e["ncl"] >= n and e["nswept"] == e["ncl"]-1), inst)
    report(f"ncl>={n} partial", select(ev, key, lambda e, n=n: e["body"] >= B and e["ncl"] >= n and e["nswept"] < e["ncl"]-1), inst)
print("=== Level-Seite x Richtung ===")
for s in "HLN":
    for dd in ("long", "short"):
        report(f"side {s} dir {dd}", select(ev, key, lambda e, s=s, dd=dd: e["body"] >= B and e["side"] == s and e["dir"] == dd), inst)
print("=== Cluster enthaelt Typ-Paar (Level + Nachbar), body>=0.6, Richtung getrennt; nur Kombis mit N_train>=200 ===")
pairs = defaultdict(list)
for e in ev:
    if e["body"] < B: continue
    for t2 in set(e["cl_types"]):
        a, b = sorted((e["typ"], t2)); pairs[(a, b, e["dir"])].append(e)
rows = []
for k2, lst in pairs.items():
    sel = select(lst, key); tr = [x for x in sel if x[0]["date"] < SPLIT]
    if len(tr) >= 200: rows.append((sum(1 for x in tr if x[1] > 0)/len(tr), k2, lst))
rows.sort(reverse=True)
for wr, k2, lst in rows[:12] + rows[-5:]:
    report(f"pair {k2}", select(lst, key), inst)
print("=== Vortag-Trend (PDC-PVWAP)/ATR x Richtung ===")
for dd in ("long", "short"):
    for a_, b_ in [(-9, -0.3), (-0.3, 0.3), (0.3, 9)]:
        report(f"pdt [{a_},{b_}) dir {dd}", select(ev, key, lambda e, a_=a_, b_=b_, dd=dd: e["body"] >= B and e["dir"] == dd and e["pdt"] is not None and a_ <= e["pdt"] < b_), inst)
print("=== Trend-Alignment: Entry vs VWAP/MIDO-Level des Tages ===")
for ref in ("MIDO", "PVWAP", "PDC"):
    for dd in ("long", "short"):
        for al in (True, False):
            def pred(e, ref=ref, dd=dd, al=al):
                lv = daylv.get(e["date"], {})
                if e["body"] < B or e["dir"] != dd or ref not in lv: return False
                above = e["entry"] > lv[ref]
                return (above == (dd == "long")) == al
            report(f"{ref} dir {dd} aligned={al}", select(ev, key, pred), inst)
print("=== Wochentag ===")
for wd in range(5):
    report(f"wd {wd}", select(ev, key, lambda e, wd=wd: e["body"] >= B and e["date"].weekday() == wd), inst)
print("=== Jahr (body>=0.6, alle) ===")
for y in range(2021, 2027):
    report(f"year {y}", select(ev, key, lambda e, y=y: e["body"] >= B and e["date"].year == y), inst)
