"""15-min-Swing-Liquiditaetspools (ICT): Event-Generator.
Kontinuierlicher 1-min-Strom ueber alle Tage. 15-min-Bars aus 1-min. Fraktal-Hoch/Tief (k=2, k=3; strikt beidseitig) wird
erst NACH Abschluss des k-ten Folgebars aktiv (kein Look-Ahead). Pool bleibt aktiv, bis ein 1-min-Bar ihn durchhandelt
(Low < Pool-Low bzw. High > Pool-High, strikt). Sweep -> Pending-Zustand je Seite (weitere Pools im Pending werden gemerged).
Entry-Modi:
  R1  : erster 1-min-Close zurueck ueber dem hoechsten gesweepten Pool-Level (Long) binnen MAX_WAIT; erster Close entscheidet.
  M15 : erster 15-min-Close zurueck ueber dem Level (Entry = Close des letzten 1-min-Bars des 15-min-Slots).
  MSS : erster 1-min-Close ueber dem letzten bestaetigten 1-min-Fraktalhoch (k=2), das VOR dem Sweep-Bar lag (Market Structure Shift).
Entry = Close des Signalbars. SL = Sweep-Extrem -/+ buf*ATR10. TP = 1R. Entry-Bar: nur SL gewertet, nie TP. SL vor TP im selben Bar.
Ergebnis fuer buf in BUFS und Zeitstopp in TSTOPS (Minuten; None = bis Tagesende NY-Kalendertag) vorab berechnet.
ATR10 = Mittel der RTH-Tagesrange der letzten 10 Handelstage (nur Vergangenheit).
"""
import sys, os, pickle, datetime as dt, time
from bisect import bisect_left, insort
sys.path.insert(0, "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r3")
from load_vol import load_days_vol
SP = "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad"
OUT = SP + "/research/r4/swing_pools"
CFG = {"NQ": dict(dir=SP+"/data", cost=0.75, usd=20), "ES": dict(dir=SP+"/data_es", cost=0.4, usd=50), "YM": dict(dir=SP+"/data_ym", cost=2.5, usd=5)}
INST = sys.argv[1]; cfg = CFG[INST]
SLOT = int(sys.argv[2]) if len(sys.argv) > 2 else 15
SUF = "" if SLOT == 15 else f"_{SLOT}m"
MAX_WAIT = 90; BUFS = [0.0, 0.02, 0.05]; TSTOPS = [60, 120, 240, None]
KS = (2, 3)
t0 = time.time()
days = load_days_vol(cfg["dir"]); dates = sorted(days)

# --- Tagesfilter + ATR10 ---
def rth(d):
    mods, o, c, lo, hi, v = days[d]; i = bisect_left(mods, 570); j = bisect_left(mods, 960)
    if j - i < 0.6 * 390: return None
    if sum(1 for k in range(i, j) if hi[k] == lo[k]) > 0.5 * (j - i): return None
    H = max(hi[i:j]); L = min(lo[i:j])
    return (H, L) if H > L else None
hist = []; rthd = {}
for d in dates:
    if d.weekday() >= 5: continue
    r = rth(d)
    if r: rthd[d] = r; hist.append(d)
atr = {hist[i]: sum(rthd[hist[i-k]][0]-rthd[hist[i-k]][1] for k in range(1, 11))/10 for i in range(10, len(hist))}
good = set(hist)

# --- kontinuierlicher Strom ---
G_date, G_mod, G_o, G_c, G_lo, G_hi = [], [], [], [], [], []
for d in dates:
    mods, o, c, lo, hi, v = days[d]
    flat = sum(1 for k in range(len(mods)) if hi[k] == lo[k])
    if len(mods) and flat > 0.5 * len(mods): continue   # Feiertags-Fuellung
    G_date.extend([d]*len(mods)); G_mod.extend(mods); G_o.extend(o); G_c.extend(c); G_lo.extend(lo); G_hi.extend(hi)
N = len(G_mod); print(INST, "bars", N, "days", len(set(G_date)), flush=True)
day_end = {}   # letzter Index je Datum
for i in range(N): day_end[G_date[i]] = i

def simulate(ei, dirn, entry, sl, d):
    """Rueckgabe: dict tstop -> (res_pts, exit_idx). Entry-Bar nur SL."""
    sld = abs(entry - sl); tp = entry + sld if dirn == "long" else entry - sld
    last = day_end[d]
    hit = None; hidx = None
    if (dirn == "long" and G_lo[ei] <= sl) or (dirn == "short" and G_hi[ei] >= sl): hit, hidx = -sld, ei
    else:
        k = ei + 1
        while k <= last:
            if dirn == "long":
                if G_lo[k] <= sl: hit, hidx = -sld, k; break
                if G_hi[k] >= tp: hit, hidx = sld, k; break
            else:
                if G_hi[k] >= sl: hit, hidx = -sld, k; break
                if G_lo[k] <= tp: hit, hidx = sld, k; break
            k += 1
    out = {}
    for ts in TSTOPS:
        lim = last if ts is None else min(last, ei + ts)
        if hidx is not None and hidx <= lim: out[ts] = (hit, hidx)
        else:
            px = G_c[lim]; out[ts] = ((px - entry) if dirn == "long" else (entry - px), lim)
    return out, sld

events = []
# 15-min-Bars
m15 = []            # list of [hi, lo, close, start_idx, end_idx]
cur_slot = None
# aktive Pools: dict level -> info, plus sortierte Level-Listen
low_pools = {}; low_lv = []; high_pools = {}; high_lv = []
pend = {"long": None, "short": None}
last_sweep = {"long": -10**9, "short": -10**9}
# 1-min-Fraktale k=2 fuer MSS
last_sh = None; last_sl = None   # (level, idx)
# 15m-Trend: SMA20 der 15m-Closes
def finalize_m15():
    bar = m15[-1]
    for k in KS:
        i = len(m15) - 1 - k
        if i - k < 0: continue
        h = m15[i][0]; l = m15[i][1]
        if all(h > m15[i-j][0] and h > m15[i+j][0] for j in range(1, k+1)):
            prom = min(max(m15[i-j][0] for j in range(1, k+1)), max(m15[i+j][0] for j in range(1, k+1)))
            if k == 3 and h in high_pools: high_pools[h]["k"] = 3
            elif h not in high_pools:
                span = 0
                while i - 1 - span >= 0 and m15[i-1-span][0] < h and span < 200: span += 1
                high_pools[h] = dict(k=k, idx=m15[i][3], prom=h - prom, span=span); insort(high_lv, h)
        if all(l < m15[i-j][1] and l < m15[i+j][1] for j in range(1, k+1)):
            prom = max(min(m15[i-j][1] for j in range(1, k+1)), min(m15[i+j][1] for j in range(1, k+1)))
            if k == 3 and l in low_pools: low_pools[l]["k"] = 3
            elif l not in low_pools:
                span = 0
                while i - 1 - span >= 0 and m15[i-1-span][1] > l and span < 200: span += 1
                low_pools[l] = dict(k=k, idx=m15[i][3], prom=prom - l, span=span); insort(low_lv, l)

for t in range(N):
    d = G_date[t]; mod = G_mod[t]; slot = (d, mod // SLOT)
    if slot != cur_slot:
        if m15: finalize_m15()
        m15.append([G_hi[t], G_lo[t], G_c[t], t, t]); cur_slot = slot
        if len(m15) > 400: del m15[:200]   # Speicher; Indizes bleiben absolut in [3]
    else:
        b = m15[-1]; b[0] = max(b[0], G_hi[t]); b[1] = min(b[1], G_lo[t]); b[2] = G_c[t]; b[4] = t
    # 1-min-Fraktale (bestaetigt bei t fuer Bar t-2)
    if t >= 4:
        i = t - 2
        if G_hi[i] > G_hi[i-1] and G_hi[i] > G_hi[i-2] and G_hi[i] > G_hi[i+1] and G_hi[i] > G_hi[i+2]: last_sh = (G_hi[i], i)
        if G_lo[i] < G_lo[i-1] and G_lo[i] < G_lo[i-2] and G_lo[i] < G_lo[i+1] and G_lo[i] < G_lo[i+2]: last_sl = (G_lo[i], i)
    tradable = d in atr
    A = atr.get(d, 0.0)
    lo = G_lo[t]; hi = G_hi[t]; c = G_c[t]; o = G_o[t]
    # --- Sweeps unten (Long-Setup) ---
    j = bisect_left(low_lv, lo)   # Pools mit Level > lo -> gesweept (Level == lo nicht)
    j = bisect_left(low_lv, lo + 1e-9)
    swept = low_lv[j:]
    if swept:
        del low_lv[j:]
        infos = [low_pools.pop(l) for l in swept]
        p = pend["long"]
        if p is None:
            p = dict(t0=t, level=max(swept), ext=lo, n=len(swept), kmax=max(x["k"] for x in infos),
                     age=t - max(x["idx"] for x in infos), age_old=t - min(x["idx"] for x in infos),
                     prom=max(x["prom"] for x in infos), span=max(x["span"] for x in infos), ref=last_sh[0] if last_sh and last_sh[1] < t else None,
                     mss_done=False, r1_done=False, m15_done=False, opp=t - last_sweep["short"], m15_at_sweep=len(m15))
            pend["long"] = p
        else:
            p["n"] += len(swept); p["kmax"] = max(p["kmax"], max(x["k"] for x in infos)); p["prom"] = max(p["prom"], max(x["prom"] for x in infos)); p["span"] = max(p["span"], max(x["span"] for x in infos))
            p["level"] = max(p["level"], max(swept)); p["age_old"] = max(p["age_old"], t - min(x["idx"] for x in infos))
        last_sweep["long"] = t
    j = bisect_left(high_lv, hi)
    swept = high_lv[:j]
    if swept:
        del high_lv[:j]
        infos = [high_pools.pop(l) for l in swept]
        p = pend["short"]
        if p is None:
            p = dict(t0=t, level=min(swept), ext=hi, n=len(swept), kmax=max(x["k"] for x in infos),
                     age=t - max(x["idx"] for x in infos), age_old=t - min(x["idx"] for x in infos),
                     prom=max(x["prom"] for x in infos), span=max(x["span"] for x in infos), ref=last_sl[0] if last_sl and last_sl[1] < t else None,
                     mss_done=False, r1_done=False, m15_done=False, opp=t - last_sweep["long"], m15_at_sweep=len(m15))
            pend["short"] = p
        else:
            p["n"] += len(swept); p["kmax"] = max(p["kmax"], max(x["k"] for x in infos)); p["prom"] = max(p["prom"], max(x["prom"] for x in infos)); p["span"] = max(p["span"], max(x["span"] for x in infos))
            p["level"] = min(p["level"], min(swept)); p["age_old"] = max(p["age_old"], t - min(x["idx"] for x in infos))
        last_sweep["short"] = t
    # --- Pending verarbeiten ---
    for dirn in ("long", "short"):
        p = pend[dirn]
        if p is None: continue
        if t - p["t0"] > MAX_WAIT or (p["r1_done"] and p["mss_done"] and p["m15_done"]):
            pend[dirn] = None; continue
        if dirn == "long": p["ext"] = min(p["ext"], lo)
        else: p["ext"] = max(p["ext"], hi)
        slot_end = (t + 1 >= N) or ((G_date[t+1], G_mod[t+1] // SLOT) != slot)
        body = abs(c - o) / (hi - lo) if hi > lo else 0.0
        rng = (hi - lo) / A if A else 0.0
        # Trend-Kontext: 15m-SMA20 der abgeschlossenen 15m-Closes
        sma = None
        if len(m15) >= 21:
            sma = sum(b[2] for b in m15[-21:-1]) / 20
        def emit(mode, ei=None, entry=None):
            if not tradable or A <= 0: return
            if ei is None: ei = t
            if entry is None: entry = c
            sld0 = abs(entry - p["ext"])
            if sld0 <= 0: return
            res = {}
            for buf in BUFS:
                sl = p["ext"] - buf * A if dirn == "long" else p["ext"] + buf * A
                out, sld = simulate(ei, dirn, entry, sl, d)
                res[buf] = (sld, out)
            events.append(dict(date=d, dirn=dirn, mode=mode, entry_t=G_mod[ei], sweep_t=G_mod[p["t0"]], entry_idx=ei, entry=entry, span=p["span"],
                               ext=p["ext"], level=p["level"], dur=t - p["t0"], n=p["n"], kmax=p["kmax"],
                               age=p["age"], age_old=p["age_old"], prom=p["prom"] / A, depth=abs(p["level"] - p["ext"]) / A,
                               body=body, rng=rng, opp=p["opp"], sld_atr=sld0 / A, atr=A,
                               trend=((c - sma) / A) if sma else None,
                               swept_since=(t - p["t0"]), res=res))
        # R1
        if not p["r1_done"]:
            if (dirn == "long" and c > p["level"]) or (dirn == "short" and c < p["level"]):
                p["r1_done"] = True; emit("R1")
                # LIM: Retest-Limit am Pool-Level, gueltig 60 min, Fill nur durch spaetere Bars (Low <= Level bzw. High >= Level)
                last = day_end[d]; kk = t + 1
                while kk <= last and kk <= t + 60:
                    if (dirn == "long" and G_lo[kk] <= p["level"]) or (dirn == "short" and G_hi[kk] >= p["level"]):
                        emit("LIM", ei=kk, entry=p["level"]); break
                    kk += 1
        # M15
        if not p["m15_done"] and slot_end:
            if (dirn == "long" and c > p["level"]) or (dirn == "short" and c < p["level"]):
                p["m15_done"] = True; emit("M15")
        # MSS
        if not p["mss_done"]:
            ref = p["ref"]
            if ref is None: p["mss_done"] = True
            elif (dirn == "long" and c > ref) or (dirn == "short" and c < ref):
                p["mss_done"] = True; emit("MSS")
    if t % 200000 == 0: print(t, len(events), f"{time.time()-t0:.0f}s", flush=True)

print("events", len(events), f"{time.time()-t0:.0f}s")
pickle.dump(dict(events=events, cfg=cfg, BUFS=BUFS, TSTOPS=TSTOPS), open(f"{OUT}/events_{INST}{SUF}.pkl", "wb"))
