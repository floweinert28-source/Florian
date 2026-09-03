"""Erzeugt Events (mit Regime-Features und 1:1-Ergebnis) fuer 4 Setup-Familien. Aufruf: python gen_events.py NQ|ES|YM"""
import sys, pickle, math, time
from bisect import bisect_left, bisect_right
sys.path.insert(0, "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r4/regime")
from common import *
OUT = SP + "/research/r4/regime"

def day_ctx(mk, d):
    """Kontext-Arrays fuer Intraday-Features (nur Vergangenheit)."""
    mods, o, c, lo, hi, v = mk.days[d]; a = bisect_left(mods, 570)
    runh = [None]*len(mods); runl = [None]*len(mods); h = -1e18; l = 1e18
    for k in range(a, len(mods)):
        h = max(h, hi[k]); l = min(l, lo[k]); runh[k] = h; runl[k] = l
    return dict(a=a, runh=runh, runl=runl, vw=mk.vwap_arrays(d), ro=o[a] if a < len(mods) else None)

def feats(mk, d, ctx, i, dirn):
    mods, o, c, lo, hi, v = mk.days[d]; r = mk.reg[d]; t = mods[i]
    f = dict(vol5_pct=r["vol5_pct"], on_atr=r["on_atr"] if t >= 570 else None, or30_atr=r["or30_atr"] if t >= 600 else None, gap_atr=r["gap_atr"] if t >= 570 else None,
             prev_body=r["prev_body"], prev_trend=r["prev_trend"], hour=t // 60, wd=d.weekday(), trend60=mk.trend60(d, t))
    if i >= ctx["a"] and i in ctx["vw"]:
        vw, sg = ctx["vw"][i]; f["vwap_sig"] = (c[i] - vw) / sg if sg > 0 else None
        rr = ctx["runh"][i] - ctx["runl"][i]; f["daytype"] = (c[i] - ctx["ro"]) / rr if rr > 0 else 0.0
        f["pos_rth"] = (c[i] - ctx["runl"][i]) / rr if rr > 0 else 0.5
    else: f["vwap_sig"] = None; f["daytype"] = None; f["pos_rth"] = None
    # signierte Versionen relativ zur Trade-Richtung (positiv = "mit dem Trade")
    s = 1 if dirn == "long" else -1
    f["trend_w"] = f["trend60"] * s if f["trend60"] is not None else None
    f["vwap_w"] = f["vwap_sig"] * s if f["vwap_sig"] is not None else None
    f["gap_w"] = f["gap_atr"] * s if f["gap_atr"] is not None else None; f["ptrend_w"] = f["prev_trend"] * s
    f["daytype_w"] = f["daytype"] * s if f["daytype"] is not None else None
    return f

def mk_event(mk, d, ctx, setup, sub, i, dirn, sl, extra=None):
    mods, o, c, lo, hi, v = mk.days[d]; entry = c[i]; sld = abs(entry - sl)
    if sld <= 0: return None
    tp = entry + sld if dirn == "long" else entry - sld
    res, tag, xi = simulate(mk, d, i, dirn, entry, sl, tp)
    e = dict(d=d, t=mods[i], setup=setup, sub=sub, dir=dirn, entry=entry, sl=sl, tp=tp, res=res, tag=tag, sld_atr=sld / mk.reg[d]["atr"],
             body=abs(c[i]-o[i]) / (hi[i]-lo[i]) if hi[i] > lo[i] else 0.0, hold=mods[xi]-mods[i])
    e.update(feats(mk, d, ctx, i, dirn))
    if extra: e.update(extra)
    return e

def gen_range_reclaim(mk, d, ctx, ev):
    """A: 30-min-Block-Range, Sweep im Folgeblock, Reclaim-Close binnen 30 min. Bloecke 02:00..15:30."""
    mods, o, c, lo, hi, v = mk.days[d]; m = len(mods)
    for s in range(120, 931, 30):
        z = mk.zone(d, s, s+30, 0.8)
        if z is None: continue
        rh, rl, a, b = z; W = rh - rl
        if W <= 0: continue
        j = b; dirn = None
        while j < m and mods[j] < s + 60:
            hh = hi[j] >= rh; hl = lo[j] <= rl
            if hh or hl:
                dirn = None if (hh and hl) else ("short" if hh else "long"); break
            j += 1
        if dirn is None: continue
        ext = hi[j] if dirn == "short" else lo[j]; k = j; ei = None
        while k < m and mods[k] - mods[j] <= 30 and mods[k] < 960:
            ext = max(ext, hi[k]) if dirn == "short" else min(ext, lo[k])
            if rl < c[k] < rh: ei = k; break
            k += 1
        if ei is None: continue
        sl = ext + 0.1*W if dirn == "short" else ext - 0.1*W
        e = mk_event(mk, d, ctx, "A_range", s, ei, dirn, sl, dict(W_atr=W / mk.reg[d]["atr"], sweep_depth=abs(ext - (rh if dirn == "short" else rl)) / W))
        if e: ev.append(e)

def gen_vwap(mk, d, ctx, ev):
    """B: VWAP-Rueckkehr. B1_K: nach Extension >= K sigma erster Close zurueck < K -> Trade Richtung VWAP, SL = Extrem +- 0.1 sigma.
       B2_K: Fade direkt beim ersten Close >= K sigma, SL = Extrem der letzten 5 Bars +- 0.1 sigma."""
    mods, o, c, lo, hi, v = mk.days[d]; m = len(mods); vw = ctx["vw"]
    for K in (1.5, 2.0, 2.5, 3.0):
        state = 0; ext = None; busy_until = -1
        for i in range(bisect_left(mods, 600), m):
            if mods[i] >= 930: break
            if i not in vw: continue
            vwap, sg = vw[i]
            if sg <= 0: continue
            sig = (c[i] - vwap) / sg
            if state == 0:
                if abs(sig) >= K and mods[i] > busy_until:
                    state = 1 if sig > 0 else -1; ext = hi[i] if sig > 0 else lo[i]
                    # B2: sofortiger Fade
                    dirn = "short" if sig > 0 else "long"
                    sl = max(hi[max(0, i-4):i+1]) + 0.1*sg if dirn == "short" else min(lo[max(0, i-4):i+1]) - 0.1*sg
                    e = mk_event(mk, d, ctx, "B2_fade", K, i, dirn, sl, dict(sig_at=sig))
                    if e: ev.append(e); busy_until = mods[e["t"]] if False else mods[i] + e["hold"]
            else:
                ext = max(ext, hi[i]) if state > 0 else min(ext, lo[i])
                if abs(sig) < K:
                    dirn = "short" if state > 0 else "long"; sl = ext + 0.1*sg if dirn == "short" else ext - 0.1*sg
                    e = mk_event(mk, d, ctx, "B1_reclaim", K, i, dirn, sl, dict(sig_at=sig, ext_sig=(ext - vwap) / sg))
                    if e: ev.append(e); busy_until = max(busy_until, mods[i] + e["hold"])
                    state = 0
                

def gen_level(mk, d, ctx, ev):
    """C: Level-Sweep + Reclaim. Levels PDH/PDL/ONH/ONL (ab 08:00), ORH/ORL (ab 10:00). Erster Sweep je Level, Reclaim binnen 30 min,
       SL = Extrem +- 0.05 ATR."""
    mods, o, c, lo, hi, v = mk.days[d]; m = len(mods); r = mk.reg[d]; A = r["atr"]
    levels = [("PDH", r["pdh"], "short", 480), ("PDL", r["pdl"], "long", 480), ("ONH", r["on_h"], "short", 570), ("ONL", r["on_l"], "long", 570),
              ("ORH", r["or_h"], "short", 600), ("ORL", r["or_l"], "long", 600)]
    for name, L, dirn, start in levels:
        if L is None: continue
        i = bisect_left(mods, start)
        if i >= m or i == 0: continue
        # Preis muss beim Start auf der "richtigen" Seite sein (unter PDH / ueber PDL)
        if (dirn == "short" and c[i-1] >= L) or (dirn == "long" and c[i-1] <= L): continue
        j = i; found = None
        while j < m and mods[j] < 930:
            if (dirn == "short" and hi[j] >= L) or (dirn == "long" and lo[j] <= L): found = j; break
            j += 1
        if found is None: continue
        ext = hi[j] if dirn == "short" else lo[j]; k = j; ei = None
        while k < m and mods[k] - mods[j] <= 30 and mods[k] < 960:
            ext = max(ext, hi[k]) if dirn == "short" else min(ext, lo[k])
            if (dirn == "short" and c[k] < L) or (dirn == "long" and c[k] > L): ei = k; break
            k += 1
        if ei is None: continue
        sl = ext + 0.05*A if dirn == "short" else ext - 0.05*A
        e = mk_event(mk, d, ctx, "C_level", name, ei, dirn, sl, dict(sweep_depth=abs(ext - L) / A, sweep_t=mods[j]))
        if e: ev.append(e)

def gen_momo(mk, d, ctx, ev):
    """D: Momentum-Breakout 5-min. D_N: 5-min-Close > max(High der letzten N 5-min-Kerzen) und Kerze gruen -> Long am Close
       (Short spiegelbildlich). SL = min(Low der letzten 3 5-min-Kerzen inkl. Breakout) bzw. max High. 09:35-15:30. Nur ein offener Trade."""
    mods, o, c, lo, hi, v = mk.days[d]; m = len(mods); f = mk.f5[d]
    idx_by_start = {}
    for i in range(m): idx_by_start.setdefault(mods[i] - mods[i] % 5, i)
    for N in (6, 12):
        busy_until = -1
        for q in range(N, len(f)):
            s, fo, fh, fl, fc = f[q]
            if s < 575 or s >= 930 or s <= busy_until: continue
            prevs = f[q-N:q]
            if any(prevs[k+1][0] - prevs[k][0] != 5 for k in range(len(prevs)-1)): continue
            dirn = None
            if fc > max(p[2] for p in prevs) and fc > fo: dirn = "long"
            elif fc < min(p[3] for p in prevs) and fc < fo: dirn = "short"
            if dirn is None: continue
            # 1-min-Index des letzten Bars im Bucket
            i0 = idx_by_start.get(s)
            if i0 is None: continue
            i = i0
            while i + 1 < m and mods[i+1] < s + 5: i += 1
            last3 = f[q-2:q+1]
            sl = min(p[3] for p in last3) if dirn == "long" else max(p[2] for p in last3)
            e = mk_event(mk, d, ctx, "D_momo", N, i, dirn, sl, dict(brk_body=abs(fc-fo)/(fh-fl) if fh > fl else 0.0))
            if e: ev.append(e); busy_until = mods[i] + e["hold"]
            # Variante: SL = Low der Breakout-Kerze
            sl2 = fl if dirn == "long" else fh
            e2 = mk_event(mk, d, ctx, "D_momo_tight", N, i, dirn, sl2, dict(brk_body=abs(fc-fo)/(fh-fl) if fh > fl else 0.0))
            if e2: ev.append(e2)

if __name__ == "__main__":
    tag = sys.argv[1]; t0 = time.time(); mk = Market(tag); print(tag, "days", len(mk.reg), f"{time.time()-t0:.0f}s", flush=True)
    ev = []
    for n, d in enumerate(mk.hist):
        if d not in mk.reg: continue
        ctx = day_ctx(mk, d)
        gen_range_reclaim(mk, d, ctx, ev); gen_vwap(mk, d, ctx, ev); gen_level(mk, d, ctx, ev); gen_momo(mk, d, ctx, ev)
        if n % 200 == 0: print(n, len(ev), f"{time.time()-t0:.0f}s", flush=True)
    pickle.dump(ev, open(f"{OUT}/events_{tag}.pkl", "wb"))
    from collections import Counter
    print(Counter((e["setup"], e["sub"]) for e in ev)); print("done", f"{time.time()-t0:.0f}s")
