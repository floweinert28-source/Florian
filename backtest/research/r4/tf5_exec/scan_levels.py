"""Level-Sweep + Reclaim: PDH/PDL/PDC (RTH-Vortag), ONH/ONL (18:00-09:30), PWH/PWL (Vorwoche RTH), Level-Sweep ab Fenster-Start.
Reclaim auf Signal-TF 1/5/15, Body-Schwelle, Buffer 0.03*ATR10. Fenster: RTH (09:30-16:00) und ganzer Tag (00:00-16:00, ON-Levels nur RTH)."""
import sys, time, datetime as dt
sys.path.insert(0, "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r4/tf5_exec")
from engine import *
mk = Market(sys.argv[1]); n = 0; t0 = time.time()
# Vorwoche RTH-H/L
week_hl = {}
from collections import defaultdict
wk = defaultdict(list)
for d in mk.hist: wk[d.isocalendar()[:2]].append(d)
wkeys = sorted(wk)
for i in range(1, len(wkeys)):
    ds = wk[wkeys[i-1]]; week_hl[wkeys[i]] = (max(mk.rth[x][0] for x in ds), min(mk.rth[x][1] for x in ds))
def levels(d, kind):
    pd_ = mk.prev.get(d)
    if pd_ is None: return []
    pdh, pdl, pdc = mk.rth[pd_]
    if kind == "PDH": return [pdh]
    if kind == "PDL": return [pdl]
    if kind == "PDHL": return [pdh, pdl]
    if kind == "PDC": return [pdc]
    if kind == "PWHL":
        w = week_hl.get(d.isocalendar()[:2]); return list(w) if w else []
    if kind == "ONHL":
        z1 = mk.zone(pd_, 1080, 1440, 0.5); z2 = mk.zone(d, 0, 570, 0.5)
        if z1 is None or z2 is None: return []
        return [max(z1[0], z2[0]), min(z1[1], z2[1])]
    return []
def run_levels(kind, tf, body, wait, multi, win):
    out = []
    for d in mk.dates:
        if d not in mk.atr: continue
        mods = mk.days[d][0]
        s_mod = 570 if win == "RTH" else 0
        s_idx = bisect_left(mods, s_mod)
        for L in levels(d, kind):
            out += sweep_reclaim(mk, d, L, L, s_idx, 960, 960, tf, body, wait, 0.03*mk.atr[d], multi, level=True)
    return out
for kind in ("PDHL", "PDC", "ONHL", "PWHL"):
    for win in ("RTH", "DAY"):
        if kind == "ONHL" and win == "DAY": continue
        for tf in (1, 5, 15):
            for multi in (False, True):
                for body in (0.0, 0.6, 0.75):
                    for wait in (60, 180):
                        rows = run_levels(kind, tf, body, wait, multi, win); n += 1
                        print(fmt(f"{mk.tag} LVL {kind} {win} tf{tf} b{body} w{wait} {'multi' if multi else 'single'}", rows), flush=True)
print(f"VARIANTS {n} time {time.time()-t0:.0f}s")
