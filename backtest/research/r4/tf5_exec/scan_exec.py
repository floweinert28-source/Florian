"""Ausfuehrungs-/Trigger-Varianten auf Signal-TF (1/5/15), Body>=thr, wait 180, ein Sweep je Zone/Tag:
 base      : Reclaim-Close -> Market am Close (wie engine)
 confirm   : Reclaim-Close, dann muss der NAECHSTE TF-Bar ebenfalls in der Range schliessen -> Entry an dessen Close (SL unveraendert)
 limit     : nach Reclaim-Close Limit an der Range-Kante (rl long / rh short), gueltig 60 min, Fill nur durch spaetere 1-min-Bars
             (SL vor Fill im selben Bar = kein Trade... konservativ: Bar der Limit UND SL beruehrt => Verlust)
 csweep    : Sweep = TF-Close AUSSERHALB der Range (echter Fehlausbruch), Reclaim = folgender TF-Close innen mit Body>=thr
 cs+confirm: csweep mit Bestaetigungs-Bar"""
import sys, time
sys.path.insert(0, "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r4/tf5_exec")
from engine import *
mk = Market(sys.argv[1]); n = 0; t0 = time.time()

def run(name, tf, body_thr, mode, max_wait=180, buf=0.1):
    out = []
    for d in mk.dates:
        if d not in mk.atr: continue
        z = zone_range(mk, d, name)
        if z is None: continue
        rh, rl, s_idx, scan_end, eval_end = z; W = rh - rl
        if W <= 0: continue
        bp = buf * W; mods, o, c, lo, hi, v = mk.days[d]; m = len(mods); bars, bar_of = mk.tfbars(d, tf)
        dirn = None; j = None
        if mode.startswith("csweep"):
            kb = bar_of[s_idx]
            while kb < len(bars):
                bs, be, bo, bh, bl, bc, bem = bars[kb]
                if bem >= scan_end: break
                if bs >= s_idx and (bc > rh or bc < rl):
                    if bh >= rh and bl <= rl: break
                    dirn = "short" if bc > rh else "long"; j = bs; kb0 = kb; break
                kb += 1
        else:
            j = s_idx
            while j < m and mods[j] < scan_end:
                hh = hi[j] >= rh; hl = lo[j] <= rl
                if hh or hl:
                    dirn = None if (hh and hl) else ("short" if hh else "long"); break
                j += 1
            kb0 = bar_of[j] if dirn else None
        if dirn is None: continue
        ext = hi[j] if dirn == "short" else lo[j]; kb = kb0; ei = None
        while kb < len(bars):
            bs, be, bo, bh, bl, bc, bem = bars[kb]
            if bem - mods[j] > max_wait or bem >= scan_end: break
            seg_s = max(bs, j)
            ext = max(ext, max(hi[seg_s:be+1])) if dirn == "short" else min(ext, min(lo[seg_s:be+1]))
            if mode.startswith("csweep") and kb == kb0: kb += 1; continue
            inside = (rl < bc < rh)
            if inside:
                rng = bh - bl; body = abs(bc - bo)/rng if rng > 0 else 0.0
                okdir = (bc < bo) if dirn == "short" else (bc > bo)
                if body >= body_thr and okdir: ei = be; break
            kb += 1
        if ei is None: continue
        sl = ext + bp if dirn == "short" else ext - bp
        if mode.endswith("confirm"):
            kb2 = bar_of[ei] + 1
            if kb2 >= len(bars): continue
            bs, be, bo, bh, bl, bc, bem = bars[kb2]
            if bem >= scan_end: continue
            if not (rl < bc < rh): continue
            # SL-Verletzung im Bestaetigungs-Bar -> Setup ungueltig
            if (dirn == "long" and bl <= sl) or (dirn == "short" and bh >= sl): continue
            ei = be
        if mode == "limit":
            lim = rl if dirn == "long" else rh
            k = ei + 1; fi = None
            while k < m and mods[k] - mods[ei] <= 60 and mods[k] < eval_end:
                if dirn == "long":
                    if lo[k] <= lim:
                        fi = k; break
                else:
                    if hi[k] >= lim:
                        fi = k; break
                k += 1
            if fi is None: continue
            entry = lim; sld = abs(entry - sl)
            if sld <= 0: continue
            # Fill-Bar: SL-Beruehrung im Fill-Bar zaehlt als Verlust (konservativ), TP erst ab Folgebar (simulate macht genau das)
            res, xi, tag = simulate(mk, d, fi, dirn, entry, sl, eval_end); ei = fi
        else:
            entry = c[ei]; sld = abs(entry - sl)
            if sld <= 0: continue
            res, xi, tag = simulate(mk, d, ei, dirn, entry, sl, eval_end)
        out.append(dict(date=d.isoformat(), dir=dirn, entry_time=f"{mods[ei]//60:02d}:{mods[ei]%60:02d}", entry=round(entry, 2), sl=round(sl, 2),
                        tp=round(entry - sld if dirn == "short" else entry + sld, 2), result=tag, pnl_pts=round(res, 2),
                        pnl_usd=round((res - mk.cost)*mk.usd, 2), sld=sld, win=res > 0, day=d))
    return out

pool = {}
for name in ZONES:
    for tf in (1, 5, 15):
        for mode in ("base", "confirm", "limit", "csweep", "csweep+confirm"):
            if tf == 1 and mode in ("csweep", "csweep+confirm"): continue
            for body in (0.6, 0.75):
                rows = run(name, tf, body, mode); n += 1
                print(fmt(f"{mk.tag} {name} tf{tf} b{body} {mode}", rows), flush=True)
                pool.setdefault((tf, mode, body), []).extend(rows)
for k in sorted(pool):
    print(fmt(f"{mk.tag} POOL-ALLZONES tf{k[0]} b{k[2]} {k[1]}", pool[k])); n += 1
print(f"VARIANTS {n} time {time.time()-t0:.0f}s")
