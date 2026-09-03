"""Reclaim-Qualitaets-Features auf Signal-TF 1/5/15 (Body>=0.6, wait 180, single Sweep je Zone/Tag), je Zone und gepoolt ueber alle Zonen
('ganzer Tag'). Features: Sweep-Tiefe/ATR, Reclaim-Close-Tiefe in Range (Anteil W), Engulf (Close jenseits Vor-TF-Bar-Extrem bzw. Sweep-Bar-Open),
Speed (Entry-Sweep Minuten), Reclaim-Bar-Volumen vs. Mittel der 12 vorherigen TF-Bars, Entry-Stunde, Wochentag, Abstand Entry-Extrem in W."""
import sys, time
sys.path.insert(0, "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r4/tf5_exec")
from engine import *
mk = Market(sys.argv[1]); BODY = float(sys.argv[2]) if len(sys.argv) > 2 else 0.6; n = 0; t0 = time.time()
def enrich(rows, tf):
    for r in rows:
        d = r["day"]; mods, o, c, lo, hi, v = mk.days[d]; bars, bar_of = mk.tfbars(d, tf); kb = r["tfbar"]; b = bars[kb]
        A = mk.atr[d]; W = r["rh"] - r["rl"]; long = r["dir"] == "long"; ent = c[r["ei"]]
        r["depth"] = ((r["rl"] - r["ext"]) if long else (r["ext"] - r["rh"])) / A
        r["cdepth"] = ((ent - r["rl"]) if long else (r["rh"] - ent)) / W
        pb = bars[kb-1] if kb > 0 else b
        r["eng_prev"] = (ent > pb[3]) if long else (ent < pb[4])
        sb = bars[bar_of[r["sj"]]]
        r["eng_sweep"] = (ent > sb[2]) if long else (ent < sb[2])
        r["speed"] = mods[r["ei"]] - mods[r["sj"]]
        vb = sum(v[b[0]:b[1]+1]); prevv = [sum(v[bars[q][0]:bars[q][1]+1]) for q in range(max(0, kb-12), kb)]
        r["vr"] = vb / (sum(prevv)/len(prevv)) if prevv and sum(prevv) > 0 else 1.0
        r["hour"] = mods[r["ei"]] // 60; r["dow"] = d.weekday()
        r["dist"] = abs(ent - r["ext"]) / W
        r["ksize"] = (b[3]-b[4]) / A
    return rows
def splits(tag, rows):
    global n
    print(fmt(tag + " ALL", rows)); n += 1
    if len(rows) < 80: return
    for f in ("depth", "cdepth", "speed", "vr", "dist", "ksize"):
        vals = sorted(r[f] for r in rows); q1, q2, q3 = vals[len(vals)//4], vals[len(vals)//2], vals[3*len(vals)//4]
        print(fmt(tag + f" {f}<Q1({q1:.2f})", [r for r in rows if r[f] < q1])); n += 1
        print(fmt(tag + f" {f}<med({q2:.2f})", [r for r in rows if r[f] < q2])); n += 1
        print(fmt(tag + f" {f}>=med", [r for r in rows if r[f] >= q2])); n += 1
        print(fmt(tag + f" {f}>=Q3({q3:.2f})", [r for r in rows if r[f] >= q3])); n += 1
    for f in ("eng_prev", "eng_sweep"):
        print(fmt(tag + f" {f}=1", [r for r in rows if r[f]])); n += 1
        print(fmt(tag + f" {f}=0", [r for r in rows if not r[f]])); n += 1
    for h in sorted(set(r["hour"] for r in rows)):
        g = [r for r in rows if r["hour"] == h]
        if len(g) >= 60: print(fmt(tag + f" hour{h:02d}", g)); n += 1
    for dw in range(5):
        g = [r for r in rows if r["dow"] == dw]
        if len(g) >= 60: print(fmt(tag + f" dow{dw}", g)); n += 1
    sys.stdout.flush()
pool = {1: [], 5: [], 15: []}
for name in ZONES:
    for tf in (1, 5, 15):
        rows = enrich(run_zone(mk, name, tf, BODY, max_wait=180), tf); pool[tf] += rows
        splits(f"{mk.tag} {name} tf{tf} b{BODY}", rows)
for tf in (1, 5, 15):
    splits(f"{mk.tag} POOL-ALLZONES tf{tf} b{BODY}", pool[tf])
    for dn in ("long", "short"): splits(f"{mk.tag} POOL-ALLZONES tf{tf} b{BODY} {dn}", [r for r in pool[tf] if r["dir"] == dn])
print(f"VARIANTS {n} time {time.time()-t0:.0f}s")
