"""Schritt 3: Ausfuehrungsvarianten je Zone (ES/YM): body_min, buf, wait, fixed-ATR-SL, Retest-Limit-Entry, Ende-Zeit."""
import sys, time
from bisect import bisect_left
sys.path.insert(0, "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r4/es_ym_features")
import fw
TAG = sys.argv[1]; I = fw.Inst(TAG); variants = 0
KINDS = ("london", "asia", "premkt", "orb15", "orb30", "overnight", "pd", "pd_pre")

def sim_ext(I, d, rh, rl, start_min, buf=0.1, max_wait=120, end=fw.RTH_E, body_min=0.0, first_close_only=True,
            sl_atr=None, retest=False, retest_wait=60):
    """Erweiterte Engine: sl_atr -> SL = Entry -/+ sl_atr*ATR (statt Sweep-Extrem); retest -> Limit an Range-Kante nach Reclaim,
    Fill nur durch SPAETERE Bars (Bar, dessen Low <= Limit (long)); dann SL/TP wie gehabt ab Fill-Bar (im Fill-Bar nur SL)."""
    W = rh - rl
    if W <= 0: return None
    mods, o, c, lo, hi, v = I.days[d]; m = len(mods); j = bisect_left(mods, start_min); dirn = None
    while j < m and mods[j] < end:
        if hi[j] > lo[j]:
            hh = hi[j] >= rh; hl = lo[j] <= rl
            if hh or hl: dirn = None if (hh and hl) else ("short" if hh else "long"); break
        j += 1
    if dirn is None: return None
    ext = hi[j] if dirn == "short" else lo[j]; k = j; ei = None
    while k < m and mods[k] - mods[j] <= max_wait and mods[k] < end:
        ext = max(ext, hi[k]) if dirn == "short" else min(ext, lo[k])
        if rl < c[k] < rh and hi[k] > lo[k]:
            if abs(c[k]-o[k]) / (hi[k]-lo[k]) >= body_min: ei = k; break
            if first_close_only: break
        k += 1
    if ei is None: return None
    A = I.atr[d]
    if retest:
        lim = rl if dirn == "long" else rh; fi = None
        for k in range(ei+1, m):
            if mods[k] >= end or mods[k] - mods[ei] > retest_wait: break
            if (dirn == "long" and lo[k] <= lim) or (dirn == "short" and hi[k] >= lim): fi = k; break
        if fi is None: return None
        entry = lim; ei = fi
    else:
        entry = c[ei]
    if sl_atr is not None: sl = entry - sl_atr*A if dirn == "long" else entry + sl_atr*A
    else: sl = ext + buf*W if dirn == "short" else ext - buf*W
    sld = abs(entry - sl)
    if sld <= 0: return None
    tp = entry + sld if dirn == "long" else entry - sld; res = None; tag = None
    if (dirn == "long" and lo[ei] <= sl) or (dirn == "short" and hi[ei] >= sl): res = -sld; tag = "SL"; kk = ei
    else:
        kk = ei + 1
        while kk < m and mods[kk] < end:
            if dirn == "long":
                if lo[kk] <= sl: res = -sld; tag = "SL"; break
                if hi[kk] >= tp: res = sld; tag = "TP"; break
            else:
                if hi[kk] >= sl: res = -sld; tag = "SL"; break
                if lo[kk] <= tp: res = sld; tag = "TP"; break
            kk += 1
        if res is None: kk = min(kk, m-1); res = (c[kk]-entry) if dirn == "long" else (entry-c[kk]); tag = "EOD"
    return dict(d=d, dirn=dirn, res=res, tag=tag, entry_t=mods[ei], entry=entry, sl=sl, tp=tp, sld=sld)

def run(kind, **kw):
    global variants; variants += 1; rows = []
    for d in I.dates:
        if not I.tradable(d): continue
        s = fw.setups(I, d, kind)
        if s is None: continue
        t = sim_ext(I, d, s[0], s[1], s[2], **kw)
        if t: rows.append(dict(day=d, win=t["res"] > 0, usd=(t["res"]-I.cost)*I.usd, **{k: t[k] for k in ("dirn", "tag", "entry_t", "entry", "sl", "tp")}))
    return rows
VARS = [("base", {}), ("body>=0.6", dict(body_min=0.6)), ("body>=0.75", dict(body_min=0.75)), ("body>=0.75 wait-for-strong", dict(body_min=0.75, first_close_only=False)),
        ("buf0", dict(buf=0.0)), ("buf0.3", dict(buf=0.3)), ("wait30", dict(max_wait=30)), ("wait240", dict(max_wait=240)),
        ("slATR0.1", dict(sl_atr=0.1)), ("slATR0.25", dict(sl_atr=0.25)), ("slATR0.5", dict(sl_atr=0.5)),
        ("retest60", dict(retest=True)), ("retest60+body0.6", dict(retest=True, body_min=0.6)), ("retest+slATR0.25", dict(retest=True, sl_atr=0.25))]
print(f"{TAG}: Zeile = Variante; Spalten = Zone: WRtrain/WRtest (Ntr/Nte)")
hdr = f"{'':28s}" + "".join(f"{k:>22s}" for k in KINDS); print(hdr, flush=True)
for name, kw in VARS:
    line = f"{name:28s}"
    for kind in KINDS:
        rows = run(kind, **kw); tr, te = fw.split(rows)
        line += f"{fw.wr(tr):5.1f}/{fw.wr(te):5.1f}({len(tr)}/{len(te)})".rjust(22)
    print(line, flush=True)
print("Varianten:", variants)
