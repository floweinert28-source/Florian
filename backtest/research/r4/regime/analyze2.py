"""2D-Regime-Zellen: Setup x (Feature1-Bin x Feature2-Bin). Bins = Terzile (Train). Aufruf: python analyze2.py NQ"""
import sys, pickle, itertools
from collections import defaultdict
sys.path.insert(0, "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r4/regime")
from common import *
tag = sys.argv[1]; MINN = 300
ev = pickle.load(open(f"{SP}/research/r4/regime/events_{tag}.pkl", "rb"))
F = ["vol5_pct", "on_atr", "or30_atr", "gap_w", "prev_body", "ptrend_w", "trend_w", "vwap_w", "daytype_w", "sld_atr", "body"]
def terc(vals):
    v = sorted(vals); return [v[len(v)//3], v[2*len(v)//3]]
def bi(x, e): return 0 if x < e[0] else (1 if x < e[1] else 2)
groups = defaultdict(list)
for e in ev:
    groups[e["setup"]].append(e)
    if e["setup"] in ("C_level", "B1_reclaim", "D_momo"): groups[(e["setup"], e["dir"])].append(e)
ncells = 0; res = []
for key, rows in groups.items():
    tr, te = split(rows)
    for f1, f2 in itertools.combinations(F, 2):
        vt = [r for r in tr if r.get(f1) is not None and r.get(f2) is not None]
        if len(vt) < 3*MINN: continue
        vv = [r for r in te if r.get(f1) is not None and r.get(f2) is not None]
        e1 = terc([r[f1] for r in vt]); e2 = terc([r[f2] for r in vt])
        ct = defaultdict(list); cv = defaultdict(list)
        for r in vt: ct[(bi(r[f1], e1), bi(r[f2], e2))].append(r)
        for r in vv: cv[(bi(r[f1], e1), bi(r[f2], e2))].append(r)
        for c_ in ct:
            ncells += 1
            if len(ct[c_]) >= MINN: res.append((wr(ct[c_]), len(ct[c_]), wr(cv.get(c_, [])), len(cv.get(c_, [])), str(key), f1, f2, c_, [round(x,2) for x in e1], [round(x,2) for x in e2]))
res.sort(reverse=True)
print(f"{tag}: 2D-Zellen {ncells}, mit N>={MINN}: {len(res)}; Top 25 nach Train-WR:")
for r in res[:25]: print(f"  train {r[0]:5.1f}% n={r[1]:4d} | test {r[2]:5.1f}% n={r[3]:4d} | {r[4]:28s} {r[5]}x{r[6]} bin{r[7]} e1={r[8]} e2={r[9]}")
# Theme-Hypothesen explizit
def sel(rows, **kw):
    out = []
    for r in rows:
        ok = True
        for k, (lo_, hi_) in kw.items():
            x = r.get(k)
            if x is None or x < lo_ or x >= hi_: ok = False; break
        if ok: out.append(r)
    return out
print("\nThemen-Hypothesen:")
H = [("MR A_range lowvol+range-day (vol5<.33, or30<.33q)", "A_range", dict(vol5_pct=(0, 0.33), or30_atr=(0, 0.25))),
     ("MR A_range lowvol", "A_range", dict(vol5_pct=(0, 0.25))),
     ("MR A_range prev range-day (prev_body<.3) + lowvol", "A_range", dict(vol5_pct=(0, 0.33), prev_body=(0, 0.3))),
     ("MR B1 lowvol+range-day", "B1_reclaim", dict(vol5_pct=(0, 0.33), or30_atr=(0, 0.25))),
     ("MR B1 lowvol", "B1_reclaim", dict(vol5_pct=(0, 0.25))),
     ("MR B1 gegen Trend (trend_w<-0.33) lowvol", "B1_reclaim", dict(vol5_pct=(0, 0.33), trend_w=(-2, -0.33))),
     ("MR C_level lowvol", "C_level", dict(vol5_pct=(0, 0.33))),
     ("MR C_level lowvol + range-day", "C_level", dict(vol5_pct=(0, 0.33), or30_atr=(0, 0.25))),
     ("MOMO D highvol", "D_momo", dict(vol5_pct=(0.75, 1.01))),
     ("MOMO D highvol + big OR", "D_momo", dict(vol5_pct=(0.67, 1.01), or30_atr=(0.3, 9))),
     ("MOMO D highvol + trend_w>.33", "D_momo", dict(vol5_pct=(0.67, 1.01), trend_w=(0.33, 2))),
     ("MOMO D trend_w>.5 + vwap_w>1", "D_momo", dict(trend_w=(0.5, 2), vwap_w=(1, 99))),
     ("MOMO D gap_w>.3 + daytype_w>.5", "D_momo", dict(gap_w=(0.3, 9), daytype_w=(0.5, 2))),
     ("MOMO D_tight highvol + trend", "D_momo_tight", dict(vol5_pct=(0.67, 1.01), trend_w=(0.33, 2))),
     ("MR A_range RTH lowvol + vwap_w<-1 (Entry gegen Extension)", "A_range", dict(vol5_pct=(0, 0.33), vwap_w=(-99, -1))),
     ("MR B2 fade lowvol + range-day", "B2_fade", dict(vol5_pct=(0, 0.33), or30_atr=(0, 0.25))),
     ]
for name, st, kw in H:
    rows = sel(groups[st], **kw); tr, te = split(rows)
    print(f"  {name:60s} TRAIN n={len(tr):5d} WR={wr(tr):5.1f}% | TEST n={len(te):5d} WR={wr(te):5.1f}%")
