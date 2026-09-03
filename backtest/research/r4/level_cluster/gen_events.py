"""Level-Cluster-Sweeps: Event-Generator.
Pro Tag Level-Liste (PDH/PDL/PDC, Wochen-H/L 5 Tage, Overnight-H/L, Asia-H/L, London-H/L, Premarket-H/L, Midnight-Open,
Tages-Open, Vortages-VWAP (RTH), laufender VWAP ab 18:00, runde Zahlen). Pro Level State-Machine:
  Zustand 'unter' (letzter Close < L) -> Sweep wenn High > L (echte Kreuzung) -> Reclaim = erster Close < L innerhalb MAX_WAIT
  Minuten (erster Close entscheidet; Body-Filter spaeter). Symmetrisch fuer Longs.
Entry = Close der Reclaim-Kerze, SL = Sweep-Extrem +/- buf*ATR10, TP = 1R. Entry-Bar: nur SL gewertet, nie TP. SL vor TP im selben Bar.
Ergebnisse fuer buf in BUFS und Zeitstopp in TSTOPS werden vorab berechnet; Overlap-Regel wird in der Analyse angewandt.
Kein Look-Ahead: Level werden erst nach Abschluss ihrer Session aktiv; VWAP-Wert des Vor-Bars wird fuer den aktuellen Bar benutzt.
"""
import sys, os, pickle, datetime as dt
from bisect import bisect_left
sys.path.insert(0, "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r3")
from load_vol import load_days_vol
SP = "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad"
OUT = SP + "/research/r4/level_cluster"
CFG = {"NQ": dict(dir=SP+"/data", cost=0.75, usd=20, grids=[(250,"R250"),(100,"R100"),(50,"R50")]),
       "ES": dict(dir=SP+"/data_es", cost=0.4, usd=50, grids=[(50,"R50"),(25,"R25"),(10,"R10")]),
       "YM": dict(dir=SP+"/data_ym", cost=2.5, usd=5, grids=[(250,"R250"),(100,"R100")])}
INST = sys.argv[1]; cfg = CFG[INST]
MAX_WAIT = 120; BUFS = [0.02, 0.05]; TSTOPS = [None, 120]; TOL_ATR = 0.1
T_START, T_END_ENTRY, T_EOD = 120, 930, 960

days = load_days_vol(cfg["dir"]); dates = sorted(days)
def rth_stats(d):
    mods, o, c, lo, hi, v = days[d]; i = bisect_left(mods, 570); j = bisect_left(mods, 960)
    if j - i < 0.6 * 390: return None
    flat = sum(1 for k in range(i, j) if hi[k] == lo[k])
    if flat > 0.5 * (j - i): return None
    H = max(hi[i:j]); L = min(lo[i:j])
    if H <= L: return None
    pv = sum((hi[k]+lo[k]+c[k])/3*v[k] for k in range(i, j)); vv = sum(v[i:j])
    return dict(H=H, L=L, C=c[j-1], O=o[i], VWAP=(pv/vv if vv > 0 else (H+L)/2))
rth = {}; hist = []
for d in dates:
    if d.weekday() >= 5: continue
    r = rth_stats(d)
    if r: rth[d] = r; hist.append(d)
prev = {hist[i]: hist[i-1] for i in range(1, len(hist))}
atr = {hist[i]: sum(rth[hist[i-k]]["H"]-rth[hist[i-k]]["L"] for k in range(1, 11))/10 for i in range(10, len(hist))}
weekHL = {hist[i]: (max(rth[hist[i-k]]["H"] for k in range(1, 6)), min(rth[hist[i-k]]["L"] for k in range(1, 6))) for i in range(10, len(hist))}
# Kalender-Vortag fuer Overnight-Bars (18:00-24:00)
def prev_cal_bars(d):
    for back in (1, 2, 3):
        pdd = d - dt.timedelta(days=back)
        if pdd in days:
            mods, o, c, lo, hi, v = days[pdd]; i = bisect_left(mods, 1080)
            if len(mods) - i > 30: return tuple(col[i:] for col in days[pdd])
            return None
    return None

def simulate(mods, c, lo, hi, k, dirn, entry, sl, tstop):
    sld = abs(entry - sl); tp = entry + sld if dirn == "long" else entry - sld; m = len(mods)
    if (dirn == "long" and lo[k] <= sl) or (dirn == "short" and hi[k] >= sl): return -sld, mods[k], "SL"
    tlim = mods[k] + tstop if tstop else 10**9; kk = k + 1; last = k
    while kk < m and mods[kk] < T_EOD and mods[kk] <= tlim:
        if dirn == "long":
            if lo[kk] <= sl: return -sld, mods[kk], "SL"
            if hi[kk] >= tp: return sld, mods[kk], "TP"
        else:
            if hi[kk] >= sl: return -sld, mods[kk], "SL"
            if lo[kk] <= tp: return sld, mods[kk], "TP"
        last = kk; kk += 1
    res = (c[last] - entry) if dirn == "long" else (entry - c[last])
    return res, mods[last], ("EOD" if not tstop or mods[last] >= T_EOD - 1 else "TS")

events = []; ndays = 0
for d in dates:
    if d.weekday() >= 5 or d not in atr or d not in prev or d not in rth: continue
    A = atr[d]; tol = TOL_ATR * A
    mods, o, c, lo, hi, v = days[d]; m = len(mods)
    pdd = prev[d]; pr = rth[pdd]
    static = [("PDH", pr["H"]), ("PDL", pr["L"]), ("PDC", pr["C"]), ("WKH", weekHL[d][0]), ("WKL", weekHL[d][1]), ("PVWAP", pr["VWAP"])]
    i0 = bisect_left(mods, 0)
    if i0 < m and mods[i0] < 60: static.append(("MIDO", o[i0]))
    pb = prev_cal_bars(d)
    # Sessions: Asia 18:00-02:00, Overnight 18:00-09:30 (inkl. Vortag), London 02:00-05:00, Premarket 05:00-09:30
    iA = bisect_left(mods, 120); iL = bisect_left(mods, 300); iR = bisect_left(mods, 570)
    timed = []  # (aktiv_ab_minute, typ, wert)
    if pb is not None and iA > 30:
        timed.append((120, "ASH", max(max(pb[4]), max(hi[:iA])))); timed.append((120, "ASL", min(min(pb[3]), min(lo[:iA]))))
    if iL - iA >= 120:
        timed.append((300, "LDH", max(hi[iA:iL]))); timed.append((300, "LDL", min(lo[iA:iL])))
    if iR - iL >= 150:
        timed.append((570, "PMH", max(hi[iL:iR]))); timed.append((570, "PML", min(lo[iL:iR])))
    if pb is not None and iR > 300:
        timed.append((570, "ONH", max(max(pb[4]), max(hi[:iR])))); timed.append((570, "ONL", min(min(pb[3]), min(lo[:iR]))))
    if iR < m and mods[iR] < 580: timed.append((570, "DO", o[iR]))
    # laufender VWAP ab 18:00 Vortag
    vw = [0.0]*m; spv = 0.0; sv = 0.0
    if pb is not None:
        for k in range(len(pb[0])):
            spv += (pb[4][k]+pb[3][k]+pb[2][k])/3*pb[5][k]; sv += pb[5][k]
    for k in range(m):
        spv += (hi[k]+lo[k]+c[k])/3*v[k]; sv += v[k]; vw[k] = spv/sv if sv > 0 else c[k]
    ndays += 1
    # Level-Universum: id -> (typ, wert); runde Zahlen dynamisch
    levels = {}
    for t, val in static: levels[t] = (t, val)
    for t0, t, val in timed: levels[t] = (t, val)
    def active_levels(k):
        """Liste (id, typ, wert) aktiver Level fuer Bar k (VWAP vom Bar k-1)."""
        out = []
        for lid, (t, val) in levels.items():
            out.append((lid, t, val))
        if k > 0: out.append(("VWAP", "VWAP", vw[k-1]))
        return out
    act_from = {t: t0 for t0, t, val in timed}
    # State pro Level-ID: dict(state, j, ext)
    st = {}; newev = []
    g0 = cfg["grids"][-1][0]
    kstart = bisect_left(mods, T_START)
    for k in range(kstart, m):
        mk = mods[k]
        if mk >= T_EOD: break
        if hi[k] == lo[k]: continue
        # aktive Level dieses Bars
        cur = []
        for lid, (t, val) in levels.items():
            if t in act_from and mk < act_from[t]: continue
            cur.append((lid, t, val))
        if k > 0: cur.append(("VWAP", "VWAP", vw[k-1]))
        # runde Zahlen um den Preis (+-1.5 ATR)
        base = int(c[k] // g0) * g0
        r = base - int(1.5*A // g0 + 1) * g0
        while r <= base + int(1.5*A // g0 + 2) * g0:
            typ = None
            for g, name in cfg["grids"]:
                if r % g == 0: typ = name; break
            cur.append(("RN%d" % r, typ, float(r))); r += g0
        pc = c[k-1] if k > 0 else o[k]
        for lid, t, L in cur:
            s = st.get(lid)
            if s is None:
                s = st[lid] = dict(state=("below" if pc < L else "above"), j=None, ext=None)
                if lid == "VWAP": s["state"] = "below" if pc < L else "above"
            if s["state"] == "below":
                if hi[k] > L:
                    s["state"] = "sw_up"; s["j"] = k; s["ext"] = hi[k]
                    if c[k] < L:  # Sweep-Kerze schliesst selbst wieder unter L
                        newev.append((d, k, k, "short", lid, t, L, hi[k])); s["state"] = "below"
            elif s["state"] == "above":
                if lo[k] < L:
                    s["state"] = "sw_dn"; s["j"] = k; s["ext"] = lo[k]
                    if c[k] > L:
                        newev.append((d, k, k, "long", lid, t, L, lo[k])); s["state"] = "above"
            elif s["state"] == "sw_up":
                s["ext"] = max(s["ext"], hi[k])
                if c[k] < L:
                    if mk - mods[s["j"]] <= MAX_WAIT: newev.append((d, s["j"], k, "short", lid, t, L, s["ext"]))
                    s["state"] = "below"
            elif s["state"] == "sw_dn":
                s["ext"] = min(s["ext"], lo[k])
                if c[k] > L:
                    if mk - mods[s["j"]] <= MAX_WAIT: newev.append((d, s["j"], k, "long", lid, t, L, s["ext"]))
                    s["state"] = "above"
        # Cluster-Annotation + Simulation fuer neue Events dieses Bars
        while newev:
            ev = newev.pop(); dd, j, kk_, dirn, lid, t, L, ext = ev
            if mods[kk_] > T_END_ENTRY or mods[kk_] < T_START: continue
            # Cluster: aktive Level (zum Sweep-Zeitpunkt j; hier: aktuelle Liste ohne self) innerhalb tol
            near = [(l2, t2, v2) for l2, t2, v2 in cur if l2 != lid and abs(v2 - L) <= tol]
            nsw = sum(1 for l2, t2, v2 in near if (v2 <= ext if dirn == "short" else v2 >= ext))
            entry = c[kk_]; body = abs(c[kk_]-o[kk_])/(hi[kk_]-lo[kk_]) if hi[kk_] > lo[kk_] else 0.0
            depth = (ext - L) if dirn == "short" else (L - ext)
            res = {}
            for b in BUFS:
                sl = ext + b*A if dirn == "short" else ext - b*A
                for ts in TSTOPS:
                    res[(b, ts)] = simulate(mods, c, lo, hi, kk_, dirn, entry, sl, ts)
            events.append(dict(date=dd, sweep_t=mods[j], entry_t=mods[kk_], dir=dirn, lid=lid, typ=t, L=L, ext=ext, entry=entry,
                               body=body, depth_atr=depth/A, atr=A, ncl=1+len(near), cl_types=tuple(sorted(t2 for _, t2, _ in near)),
                               nswept=nsw, dur=mods[kk_]-mods[j], same_bar=(j == kk_), res=res,
                               close_dist_atr=abs(entry - L)/A))
print(INST, "days", ndays, "events", len(events), flush=True)
pickle.dump(events, open(OUT + f"/events_{INST}.pkl", "wb"))
