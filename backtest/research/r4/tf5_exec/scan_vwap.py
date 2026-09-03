"""VWAP-Rueckkehr: Preis dehnt unter/ueber VWAP -/+ k*SD (1-min-Extrem), Signal-TF-Kerze schliesst zurueck innerhalb des Bandes
(bzw. Variante: zurueck ueber VWAP), Body >= thr, Richtung zum Trade. SL hinter Extrem - buf(0.03 ATR), TP 1R.
VWAP-Basis: RTH (ab 09:30) oder Session (ab 18:00 Vortag). Fenster bis 16:00."""
import sys, time, math
sys.path.insert(0, "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r4/tf5_exec")
from engine import *
mk = Market(sys.argv[1]); n = 0; t0 = time.time()
vw_cache = {}
def vwap_series(d, base):
    """Liste (vwap, sd) je 1-min-Index (kausal, inkl. Bar i). base RTH: ab 570; SESS: ab 18:00 Vortag (Vortag-Bars vorab kumuliert)."""
    key = (d, base)
    if key in vw_cache: return vw_cache[key]
    mods, o, c, lo, hi, v = mk.days[d]; m = len(mods)
    sv = spv = spv2 = 0.0
    if base == "SESS":
        pd_ = mk.prev.get(d)
        if pd_ in mk.days:
            pm, po, pc, plo, phi, pv = mk.days[pd_]; i0 = bisect_left(pm, 1080)
            for i in range(i0, len(pm)):
                tp = (phi[i]+plo[i]+pc[i])/3; sv += pv[i]; spv += tp*pv[i]; spv2 += tp*tp*pv[i]
    start = 570 if base == "RTH" else 0
    out = [None]*m
    for i in range(m):
        if mods[i] < start: continue
        tp = (hi[i]+lo[i]+c[i])/3; sv += v[i]; spv += tp*v[i]; spv2 += tp*tp*v[i]
        if sv <= 0: continue
        vw = spv/sv; var = max(spv2/sv - vw*vw, 0.0); out[i] = (vw, math.sqrt(var))
    vw_cache[key] = out; return out
def run_vwap(base, k, tf, body, wait, target, s_mod):
    out = []
    for d in mk.dates:
        if d not in mk.atr: continue
        mods, o, c, lo, hi, v = mk.days[d]; m = len(mods); bars, bar_of = mk.tfbars(d, tf); vs = vwap_series(d, base)
        j = bisect_left(mods, s_mod); buf = 0.03*mk.atr[d]; warm = 30
        while j < m and mods[j] < 900:
            if vs[j] is None or mods[j] < s_mod + warm: j += 1; continue
            vw, sd = vs[j]; lb = vw - k*sd; ub = vw + k*sd
            if sd <= 0: j += 1; continue
            if lo[j] <= lb: dirn = "long"
            elif hi[j] >= ub: dirn = "short"
            else: j += 1; continue
            ext = lo[j] if dirn == "long" else hi[j]; kb = bar_of[j]; ei = None; last_end = j
            while kb < len(bars):
                bs, be, bo, bh, bl, bc, bem = bars[kb]
                if bem - mods[j] > wait or bem >= 900: break
                seg_s = max(bs, j)
                ext = min(ext, min(lo[seg_s:be+1])) if dirn == "long" else max(ext, max(hi[seg_s:be+1]))
                last_end = be
                if vs[be] is None: kb += 1; continue
                vw2, sd2 = vs[be]
                thr = (vw2 - k*sd2) if target == "band" else vw2
                thr_s = (vw2 + k*sd2) if target == "band" else vw2
                inside = (bc > thr) if dirn == "long" else (bc < thr_s)
                if inside:
                    rng = bh - bl; bd = abs(bc-bo)/rng if rng > 0 else 0
                    if bd >= body and ((bc > bo) if dirn == "long" else (bc < bo)): ei = be; break
                kb += 1
            if ei is None:
                j = last_end + 1; continue
            entry = c[ei]; sl = ext - buf if dirn == "long" else ext + buf; sld = abs(entry-sl)
            if sld <= 0: j = ei+1; continue
            res, xi, tag = simulate(mk, d, ei, dirn, entry, sl, 960)
            out.append(dict(date=d.isoformat(), dir=dirn, entry_time=f"{mods[ei]//60:02d}:{mods[ei]%60:02d}", entry=round(entry,2), sl=round(sl,2),
                            tp=round(entry+sld if dirn=="long" else entry-sld,2), result=tag, pnl_pts=round(res,2), pnl_usd=round((res-mk.cost)*mk.usd,2),
                            sld=sld, win=res>0, day=d))
            j = xi + 1
            # Re-Arm: erst wieder, wenn Preis zurueck innerhalb des Bandes war
            while j < m and vs[j] is not None and ((lo[j] <= vs[j][0]-k*vs[j][1]) if dirn=="long" else (hi[j] >= vs[j][0]+k*vs[j][1])): j += 1
    return out
for base, s_mod in (("RTH", 570), ("SESS", 0)):
    for k in (1.0, 1.5, 2.0, 2.5):
        for target in ("band", "vwap"):
            for tf in (1, 5, 15):
                for body in (0.0, 0.6, 0.75):
                    for wait in (60, 180):
                        rows = run_vwap(base, k, tf, body, wait, target, s_mod); n += 1
                        print(fmt(f"{mk.tag} VWAP {base} k{k} ->{target} tf{tf} b{body} w{wait}", rows), flush=True)
print(f"VARIANTS {n} time {time.time()-t0:.0f}s")
