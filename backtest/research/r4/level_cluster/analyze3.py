"""Dritte Runde: Stapelung der konsistenten Effekte + Kandidaten-CSV. Referenzlevel (PDC, PVWAP, MIDO) direkt aus den Daten."""
import sys, pickle, csv, datetime as dt
from bisect import bisect_left
from collections import defaultdict
from analyze import load, select, report, SPLIT, COST, USD
sys.path.insert(0, "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r3")
from load_vol import load_days_vol
SP = "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad"
DIRS = {"NQ": SP+"/data", "ES": SP+"/data_es", "YM": SP+"/data_ym"}
inst = sys.argv[1]; ev = load(inst); days = load_days_vol(DIRS[inst])
# Tagesreferenzen
rth = {}; hist = []
for d in sorted(days):
    if d.weekday() >= 5: continue
    mods, o, c, lo, hi, v = days[d]; i = bisect_left(mods, 570); j = bisect_left(mods, 960)
    if j - i < 234 or sum(1 for k in range(i, j) if hi[k] == lo[k]) > 0.5*(j-i) or max(hi[i:j]) <= min(lo[i:j]): continue
    pv = sum((hi[k]+lo[k]+c[k])/3*v[k] for k in range(i, j)); vv = sum(v[i:j])
    rth[d] = dict(C=c[j-1], VWAP=pv/vv if vv > 0 else c[j-1], H=max(hi[i:j]), L=min(lo[i:j])); hist.append(d)
prev = {hist[i]: hist[i-1] for i in range(1, len(hist))}
ref = {}
for d in hist:
    if d not in prev: continue
    mods, o, c, lo, hi, v = days[d]; i0 = bisect_left(mods, 0)
    mido = o[i0] if i0 < len(mods) and mods[i0] < 60 else None
    p = prev[d]; pp = prev.get(p)
    ref[d] = dict(PDC=rth[p]["C"], PVWAP=rth[p]["VWAP"], MIDO=mido, PDT=(rth[p]["C"] - rth[pp]["C"]) if pp else None)
key = (0.02, None)
seen = defaultdict(int)
for e in ev:
    r = ref.get(e["date"]); e["ok"] = r is not None
    if r is None: continue
    sgn = 1 if e["dir"] == "long" else -1
    e["tw_pdc"] = sgn*(r["PDC"] - e["entry"]) > 0          # Trade zeigt Richtung PDC
    e["tw_pvw"] = sgn*(r["PVWAP"] - e["entry"]) > 0
    e["tw_mido"] = (sgn*(r["MIDO"] - e["entry"]) > 0) if r["MIDO"] is not None else False
    sld = abs(e["entry"] - (e["ext"] + (0.02*e["atr"] if e["dir"] == "short" else -0.02*e["atr"])))
    e["sld_atr"] = sld / e["atr"]
    e["gap_pdc_R"] = abs(r["PDC"] - e["entry"]) / sld if sld > 0 else 0   # Abstand zum PDC in R
    e["pdt"] = (r["PDT"] / e["atr"]) if r["PDT"] is not None else 0.0
    e["ctr"] = -sgn * e["pdt"]                                # >0: Trade gegen Vortagesrichtung
    kk = (e["date"], e["lid"]); seen[kk] += 1; e["fresh"] = seen[kk] == 1
B = 0.6
base = lambda e: e["ok"] and e["body"] >= B
print(inst, "\n=== Stapelung (buf 0.02 ATR, Exit 16:00) ===")
tests = {
 "tw_pdc": lambda e: base(e) and e["tw_pdc"],
 "tw_pdc & tw_pvw": lambda e: base(e) and e["tw_pdc"] and e["tw_pvw"],
 "tw_pdc & tw_pvw & tw_mido": lambda e: base(e) and e["tw_pdc"] and e["tw_pvw"] and e["tw_mido"],
 "tw_pdc & gap>=1R": lambda e: base(e) and e["tw_pdc"] and e["gap_pdc_R"] >= 1,
 "tw_pdc & gap<1R": lambda e: base(e) and e["tw_pdc"] and e["gap_pdc_R"] < 1,
 "tw_pdc & gap 1-3R": lambda e: base(e) and e["tw_pdc"] and 1 <= e["gap_pdc_R"] < 3,
 "tw_pdc & gap>=3R": lambda e: base(e) and e["tw_pdc"] and e["gap_pdc_R"] >= 3,
 "tw_pdc&pvw & gap>=1R": lambda e: base(e) and e["tw_pdc"] and e["tw_pvw"] and e["gap_pdc_R"] >= 1,
 "fresh": lambda e: base(e) and e["fresh"],
 "not fresh": lambda e: base(e) and not e["fresh"],
 "fresh & tw_pdc": lambda e: base(e) and e["fresh"] and e["tw_pdc"],
 "stophunt depth>=.05 dur<=5": lambda e: base(e) and e["depth_atr"] >= 0.05 and e["dur"] <= 5,
 "stophunt & tw_pdc": lambda e: base(e) and e["depth_atr"] >= 0.05 and e["dur"] <= 5 and e["tw_pdc"],
 "ctr>0.3 (gegen Vortag)": lambda e: base(e) and e["ctr"] > 0.3,
 "ctr>0.3 & tw_pdc": lambda e: base(e) and e["ctr"] > 0.3 and e["tw_pdc"],
 "ctr<-0.3 (mit Vortag)": lambda e: base(e) and e["ctr"] < -0.3,
 "tw_pdc & body>=0.75": lambda e: e["ok"] and e["body"] >= 0.75 and e["tw_pdc"],
 "tw_pdc & ncl>=2": lambda e: base(e) and e["tw_pdc"] and e["ncl"] >= 2,
 "tw_pdc & ncl>=3 & whole": lambda e: base(e) and e["tw_pdc"] and e["ncl"] >= 3 and e["nswept"] == e["ncl"]-1,
 "tw_pdc & not same_bar": lambda e: base(e) and e["tw_pdc"] and not e["same_bar"],
 "tw_pdc & sld>=0.1": lambda e: base(e) and e["tw_pdc"] and e["sld_atr"] >= 0.1,
 "tw_pdc & sld<0.05": lambda e: base(e) and e["tw_pdc"] and e["sld_atr"] < 0.05,
 "tw_pdc & 09:30-12:00": lambda e: base(e) and e["tw_pdc"] and 570 <= e["entry_t"] < 720,
 "tw_pdc & 02:00-09:30": lambda e: base(e) and e["tw_pdc"] and e["entry_t"] < 570,
 "tw_pdc & typ RN": lambda e: base(e) and e["tw_pdc"] and e["typ"].startswith("R"),
 "tw_pdc & typ session-H/L": lambda e: base(e) and e["tw_pdc"] and e["typ"] in ("ASH","ASL","LDH","LDL","PMH","PML","ONH","ONL"),
 "tw_pdc & typ PDH/PDL/WK": lambda e: base(e) and e["tw_pdc"] and e["typ"] in ("PDH","PDL","WKH","WKL"),
 "tw_pdc & typ VWAP/PVWAP/MIDO/DO": lambda e: base(e) and e["tw_pdc"] and e["typ"] in ("VWAP","PVWAP","MIDO","DO"),
 "tw_all3 & gap>=1R & body>=.75": lambda e: e["ok"] and e["body"] >= 0.75 and e["tw_pdc"] and e["tw_pvw"] and e["tw_mido"] and e["gap_pdc_R"] >= 1,
 "tw_all3 & gap>=1R & ctr>0": lambda e: base(e) and e["tw_pdc"] and e["tw_pvw"] and e["tw_mido"] and e["gap_pdc_R"] >= 1 and e["ctr"] > 0,
}
res = {}
for name, pred in tests.items():
    res[name] = report(name, select(ev, key, pred), inst)
for name in ["tw_pdc & tw_pvw", "tw_pdc & gap>=1R"]:
    report(name + " [ts120]", select(ev, (0.02, 120), tests[name]), inst)
    report(name + " [buf.05]", select(ev, (0.05, None), tests[name]), inst)
print("VARIANTS", len(tests) + 4)
# Kandidat: beste vordeklarierte Regel nach TRAIN-WR mit N_train >= 500
best = max((k for k in res if res[k][0][0] >= 500), key=lambda k: res[k][0][1])
print("BEST", best, res[best])
sel = select(ev, key, tests[best])
with open(f"cand_{inst}.csv", "w", newline="") as f:
    w = csv.writer(f); w.writerow(["date", "dir", "entry_time", "entry", "sl", "tp", "result", "pnl_usd", "level", "ncl", "body"])
    for e, r, xt, tag in sel:
        sl = e["ext"] + (0.02*e["atr"] if e["dir"] == "short" else -0.02*e["atr"]); sld = abs(e["entry"] - sl)
        tp = e["entry"] + sld if e["dir"] == "long" else e["entry"] - sld
        w.writerow([e["date"].isoformat(), e["dir"], f"{e['entry_t']//60:02d}:{e['entry_t']%60:02d}", round(e["entry"], 2), round(sl, 2), round(tp, 2), tag, round((r - COST[inst]) * USD[inst], 2), e["typ"], e["ncl"], round(e["body"], 2)])
py = defaultdict(lambda: [0, 0, 0.0])
for e, r, xt, tag in sel: py[e["date"].year][0] += 1; py[e["date"].year][1] += r > 0; py[e["date"].year][2] += (r - COST[inst]) * USD[inst]
for y in sorted(py): print(f"  {y}: N={py[y][0]} WR={py[y][1]/py[y][0]*100:.1f} {py[y][2]:+.0f}$")
