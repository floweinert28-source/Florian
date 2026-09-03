"""Feature-Modell, Schritt 1: Alle Sweep+Reclaim-Events (NQ, ganzer Tag, alle Level-Typen) mit >= 30 kausalen Entry-Features.
Event-Definition (alle Zeiten NY, 1-min-Bars, flache Fuellbars hi==lo & vol==0 entfernt):
  Level-Typen (Hoch/Tief einer Range) und Aktivfenster:
    PD   : RTH-Range 09:30-16:00 des Vortags, aktiv 16:00 -> naechster Tag 16:00
    PW   : RTH-Range der Vorwoche (Mo-Fr), aktiv ganze Folgewoche
    ASIA : 18:00-02:00, aktiv 02:00-16:00 | LONDON 02:00-05:00, aktiv 05:00-16:00 | PRE 05:00-09:30, aktiv 09:30-16:00
    ON   : 18:00-09:30, aktiv 09:30-16:00 | OR 09:30-10:00, aktiv 10:00-16:00 | AM 10:00-12:00, aktiv 12:00-16:00
    LUNCH: 12:00-13:30, aktiv 13:30-16:00 | H1: jede volle Stunde (18..23, 0..15), aktiv die folgenden 120 min
  Seite ist 'scharf' erst nach einem Close innerhalb der Range. Sweep = Bar mit hi >= H (bzw. lo <= L; beide im selben Bar -> ignoriert).
  Reclaim = erster Close wieder innerhalb (L < c < H) binnen 120 min; sonst Seite fuer den Rest des Fensters aus.
  Nach Reclaim wird die Seite wieder scharf (sweep_no zaehlt). Entry = Close des Reclaim-Bars (Market).
  SL = Sweep-Extrem +/- buf, buf = min(0.1*W, 0.05*ATR10). TP = 1R. Entry-Bar: nur SL geprueft. Auswertung bis 480 min oder Datenluecke > 90 min
  (dann Close-Out). Events mit gleichem Entry-Bar & Richtung werden zusammengefasst (n_levels).
"""
import sys, os, math, pickle, csv, datetime as dt
from bisect import bisect_left, bisect_right
from collections import defaultdict
sys.path.insert(0, "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r3")
from load_vol import load_days_vol
SP = "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad"
OUT = SP + "/research/r4/feature_model"
DATA = sys.argv[1] if len(sys.argv) > 1 else SP + "/data"
TAG = sys.argv[2] if len(sys.argv) > 2 else "NQ"
COST, USD = {"NQ": (0.75, 20.0), "ES": (0.4, 50.0), "YM": (2.5, 5.0)}[TAG]
MAX_WAIT, MAX_HOLD, GAP = 120, 480, 90

days = load_days_vol(DATA); dates = sorted(days); D0 = dates[0]
# ---- globaler Stream ohne Flat-Bars ----
A, O, C, LO, HI, V, DAYI = [], [], [], [], [], [], []
for d in dates:
    if d.weekday() == 5: continue
    mods, o, c, lo, hi, v = days[d]; di = (d - D0).days
    for i in range(len(mods)):
        if hi[i] == lo[i] and v[i] == 0: continue
        A.append(di*1440 + mods[i]); O.append(o[i]); C.append(c[i]); LO.append(lo[i]); HI.append(hi[i]); V.append(v[i]); DAYI.append(di)
N = len(A); print(TAG, "bars", N, flush=True)
def idx(absmin): return bisect_left(A, absmin)
def rng(s, e, cov=0.6):
    i, j = idx(s), idx(e)
    if j - i < (e - s) * cov: return None
    return max(HI[i:j]), min(LO[i:j]), i, j
# ---- Tages-Hilfen: RTH, ATR10, Vola-Perzentil ----
wdays = [d for d in dates if d.weekday() < 5]
rth = {}; hist = []
for d in wdays:
    B = (d - D0).days*1440; z = rng(B+570, B+960)
    if z: rth[d] = (z[0], z[1], C[z[3]-1], O[z[2]]); hist.append(d)
prev = {hist[i]: hist[i-1] for i in range(1, len(hist))}
atr = {}; atr_hist = []
for i in range(10, len(hist)):
    a = sum(rth[hist[i-k]][0]-rth[hist[i-k]][1] for k in range(1, 11))/10; atr[hist[i]] = a
vola_pct = {}
for i in range(10, len(hist)):
    d = hist[i]; past = [atr[hist[j]] for j in range(max(10, i-250), i)]
    vola_pct[d] = (sum(1 for x in past if x < atr[d]) / len(past)) if past else 0.5
# ---- Sessions (Reset nach Luecke >= 60 min): VWAP, Session-Hoch/Tief, Session-Open ----
SESS_O, SESS_H, SESS_L, SVWAP, SESS_START = [0.0]*N, [0.0]*N, [0.0]*N, [0.0]*N, [0]*N
pv = vv = 0.0; sh = sl_ = so = None; ss = 0
for i in range(N):
    if i == 0 or A[i] - A[i-1] >= 60:
        pv = vv = 0.0; sh, sl_, so, ss = HI[i], LO[i], O[i], i
    sh = max(sh, HI[i]); sl_ = min(sl_, LO[i]); pv += (HI[i]+LO[i]+C[i])/3*V[i]; vv += V[i]
    SESS_O[i], SESS_H[i], SESS_L[i], SVWAP[i], SESS_START[i] = so, sh, sl_, (pv/vv if vv > 0 else C[i]), ss
CV = [0.0]*(N+1)
for i in range(N): CV[i+1] = CV[i] + V[i]
def avgvol(i, n):  # mittleres Volumen der n Bars vor i (exkl. i)
    a = max(0, i-n); return (CV[i]-CV[a])/(i-a) if i > a else 0.0
# RTH-Laufwerte pro Tag: Open 09:30, laufendes Hoch/Tief ab 09:30
RTH_O, RTH_H, RTH_L = [None]*N, [None]*N, [None]*N
cur = None
for i in range(N):
    m = A[i] % 1440
    if 570 <= m < 960:
        if cur is None or DAYI[i] != cur[0]: cur = [DAYI[i], O[i], HI[i], LO[i]]
        cur[2] = max(cur[2], HI[i]); cur[3] = min(cur[3], LO[i]); RTH_O[i], RTH_H[i], RTH_L[i] = cur[1], cur[2], cur[3]
    else: cur = None

# ---- Levels ----
LTYPES = ["PD", "PW", "ASIA", "LONDON", "PRE", "ON", "OR", "AM", "LUNCH", "H1"]
levels = []  # (ltype, H, L, s_abs, e_abs, day_for_context)
for d in hist:
    B = (d - D0).days*1440
    if d in prev:
        p = prev[d]; levels.append(("PD", rth[p][0], rth[p][1], (p - D0).days*1440 + 960, B + 960, d))
    for name, fs, fe, as_, ae, cov in (("ASIA", B-360, B+120, B+120, B+960, 0.5), ("LONDON", B+120, B+300, B+300, B+960, 0.8),
                                       ("PRE", B+300, B+570, B+570, B+960, 0.8), ("ON", B-360, B+570, B+570, B+960, 0.5),
                                       ("OR", B+570, B+600, B+600, B+960, 0.9), ("AM", B+600, B+720, B+720, B+960, 0.9),
                                       ("LUNCH", B+720, B+810, B+810, B+960, 0.9)):
        z = rng(fs, fe, cov)
        if z and z[0] > z[1]: levels.append((name, z[0], z[1], as_, ae, d))
    for h in list(range(18, 24)) + list(range(0, 16)):
        fs = B - 1440 + 60*h if h >= 18 else B + 60*h
        z = rng(fs, fs+60, 0.9)
        if z and z[0] > z[1]: levels.append(("H1", z[0], z[1], fs+60, min(fs+180, B+960 if h < 18 else B+120), d))
# Vorwoche
byweek = defaultdict(list)
for d in hist: byweek[d.isocalendar()[:2]].append(d)
weeks = sorted(byweek)
for wi in range(1, len(weeks)):
    pw = byweek[weeks[wi-1]]; cw = byweek[weeks[wi]]
    H = max(rth[x][0] for x in pw); L = min(rth[x][1] for x in pw)
    levels.append(("PW", H, L, (cw[0]-D0).days*1440 - 360, (cw[-1]-D0).days*1440 + 960, cw[0]))
print("levels", len(levels), flush=True)

# ---- Sweep+Reclaim-Suche ----
raw = defaultdict(list)  # (entry_idx, dir) -> list of event dicts
for lt, H, L, s, e, dctx in levels:
    if dctx not in atr or dctx not in prev: continue
    W = H - L; buf = min(0.1*W, 0.05*atr[dctx])
    i0, i1 = idx(s), idx(e)
    armed = {"hi": False, "lo": False}; sweep_no = {"hi": 0, "lo": 0}; i = i0
    while i < i1:
        hh = HI[i] >= H; hl = LO[i] <= L
        if hh and hl: i += 1; continue
        side = None
        if hh and armed["hi"]: side = "hi"
        elif hl and armed["lo"]: side = "lo"
        if side is None:
            if L < C[i] < H: armed["hi"] = armed["lo"] = True
            i += 1; continue
        # Sweep laeuft
        j = i; ext = HI[i] if side == "hi" else LO[i]; k = i; ei = None; nbeyond = 0
        while k < i1 and A[k] - A[j] <= MAX_WAIT:
            ext = max(ext, HI[k]) if side == "hi" else min(ext, LO[k])
            if L < C[k] < H: ei = k; break
            nbeyond += 1; k += 1
        if ei is None:
            armed[side] = False; i = k; continue
        sweep_no[side] += 1
        dirn = "short" if side == "hi" else "long"; lvl = H if side == "hi" else L
        raw[(ei, dirn)].append(dict(lt=lt, H=H, L=L, W=W, lvl=lvl, ext=ext, buf=buf, j=j, nbeyond=nbeyond, sweep_no=sweep_no[side], s=s, dctx=dctx))
        i = ei + 1
print("raw events", sum(len(v) for v in raw.values()), "merged", len(raw), flush=True)

# ---- Features + Simulation ----
PRIO = {t: n for n, t in enumerate(LTYPES)}
rows = []
for (ei, dirn), evs in sorted(raw.items()):
    evs.sort(key=lambda x: PRIO[x["lt"]]); p = evs[0]; d = p["dctx"]; At = atr[d]
    sgn = 1 if dirn == "long" else -1
    ext = min(x["ext"] for x in evs) if dirn == "long" else max(x["ext"] for x in evs)
    buf = max(x["buf"] for x in evs); j = min(x["j"] for x in evs)
    entry = C[ei]; sl = ext - buf if dirn == "long" else ext + buf; sld = abs(entry - sl)
    if sld <= 0: continue
    tp = entry + sld*sgn; res = None; xt = None; tag = None
    if (dirn == "long" and LO[ei] <= sl) or (dirn == "short" and HI[ei] >= sl): res, xt, tag = -sld, ei, "SL"
    kk = ei + 1
    while res is None and kk < N and A[kk] - A[ei] <= MAX_HOLD and A[kk] - A[kk-1] <= GAP:
        if dirn == "long":
            if LO[kk] <= sl: res, tag = -sld, "SL"; break
            if HI[kk] >= tp: res, tag = sld, "TP"; break
        else:
            if HI[kk] >= sl: res, tag = -sld, "SL"; break
            if LO[kk] <= tp: res, tag = sld, "TP"; break
        kk += 1
    if res is None:
        kk = min(kk-1, N-1); res = (C[kk]-entry)*sgn; tag = "EOD"
    xt = xt if xt is not None else kk
    # --- Features (nur Bars <= ei) ---
    o, c, lo, hi = O[ei], C[ei], LO[ei], HI[ei]; br = hi - lo
    W = p["W"]; lvl = p["lvl"]; H, L = p["H"], p["L"]
    pd_ = prev[d]; pdh, pdl, pdc, pdo = rth[pd_]; ppc = rth[prev[pd_]][2] if pd_ in prev else pdc
    av60 = avgvol(ei, 60); av390 = avgvol(ei, 390)
    m = A[ei] % 1440; wd = (D0 + dt.timedelta(days=DAYI[ei])).weekday()
    ss = SESS_START[ei]; nb = ei - ss + 1
    sh, sl2 = SESS_H[ei], SESS_L[ei]
    r60 = (max(HI[max(0, ei-59):ei+1]) - min(LO[max(0, ei-59):ei+1])) / At
    r15 = (max(HI[max(0, ei-14):ei+1]) - min(LO[max(0, ei-14):ei+1])) / At
    is_rth = 1 if 570 <= m < 960 else 0
    f = dict(
        dir_long=1 if dirn == "long" else 0,
        sweep_depth_W=abs(ext - lvl)/W, sweep_depth_atr=abs(ext - lvl)/At,
        sweep_dur=A[ei] - A[j], sweep_bars=ei - j + 1, bars_beyond=max(x["nbeyond"] for x in evs),
        reclaim_body=abs(c-o)/br if br > 0 else 0, reclaim_body_dir=(c-o)*sgn/br if br > 0 else 0,
        reclaim_range_atr=br/At, close_pos_bar=(c-lo)/br if br > 0 else 0.5,
        wick_rej=((min(o, c)-lo) if dirn == "long" else (hi-max(o, c)))/br if br > 0 else 0,
        wick_adv=((hi-max(o, c)) if dirn == "long" else (min(o, c)-lo))/br if br > 0 else 0,
        entry_pos_W=abs(entry - lvl)/W, entry_pos_range=(entry - L)/W,
        sld_atr=sld/At, sld_pts=sld, W_atr=W/At,
        vol_sweep=V[j]/av60 if av60 > 0 else 0, vol_reclaim=V[ei]/av60 if av60 > 0 else 0,
        vol_sweep_avg=((CV[ei+1]-CV[j])/(ei-j+1))/av60 if av60 > 0 else 0, vol_60_390=av60/av390 if av390 > 0 else 0,
        hour=m/60, minute=m, wd=wd, is_rth=is_rth,
        prev_trend=(pdc - ppc)/At, prev_range_atr=(pdh - pdl)/At, prev_close_pos=(pdc - pdl)/(pdh - pdl) if pdh > pdl else 0.5,
        prev_body=(pdc - pdo)/At,
        dist_pdh=(pdh - entry)/At, dist_pdl=(entry - pdl)/At,
        dist_vwap=(entry - SVWAP[ei])/At*sgn, vwap_slope=(SVWAP[ei] - SVWAP[max(ss, ei-60)])/At*sgn,
        sess_pos=(entry - sl2)/(sh - sl2) if sh > sl2 else 0.5, sess_range_atr=(sh - sl2)/At, sess_trend=(entry - SESS_O[ei])/At*sgn,
        day_pos=((entry - RTH_L[ei])/(RTH_H[ei]-RTH_L[ei]) if is_rth and RTH_H[ei] > RTH_L[ei] else 0.5),
        gap_atr=((RTH_O[ei] - pdc)/At*sgn) if is_rth else 0, since_open=(m - 570) if is_rth else 0,
        vola_pct=vola_pct[d], atr_pts=At, rv60=r60, rv15=r15,
        ret30=(c - C[max(ss, ei-30)])/At*sgn, ret120=(c - C[max(ss, ei-120)])/At*sgn,
        n_levels=len(evs), sweep_no=max(x["sweep_no"] for x in evs), since_level=A[ei] - p["s"],
        lt_code=PRIO[p["lt"]],
    )
    for t in LTYPES: f["lt_" + t] = 1 if any(x["lt"] == t for x in evs) else 0
    rows.append(dict(day=(D0 + dt.timedelta(days=DAYI[ei])), ei=ei, xi=xt, dirn=dirn, lt=p["lt"], entry=entry, sl=sl, tp=tp,
                     res=res, tag=tag, win=1 if res > 0 else 0, usd=(res - COST)*USD, entry_abs=A[ei], exit_abs=A[xt],
                     entry_time=f"{m//60:02d}:{m%60:02d}", **f))
# Events pro Tag vor diesem
cnt = defaultdict(int)
for r in rows:
    r["n_events_before"] = cnt[r["day"]]; cnt[r["day"]] += 1
print("events", len(rows), "WR", sum(r["win"] for r in rows)/len(rows), flush=True)
pickle.dump(rows, open(f"{OUT}/events_{TAG}.pkl", "wb"))
with open(f"{OUT}/events_{TAG}.csv", "w", newline="") as fh:
    w = csv.DictWriter(fh, fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)
# Kurzstatistik nach Level-Typ und Train/Test
def st(rs): return f"N={len(rs):5d} WR={sum(r['win'] for r in rs)/max(1,len(rs))*100:5.1f}% Netto={sum(r['usd'] for r in rs):+9.0f}" if rs else "N=0"
for t in LTYPES + ["ALL"]:
    rs = [r for r in rows if t == "ALL" or r["lt"] == t]
    tr = [r for r in rs if r["day"] < dt.date(2025, 1, 1)]; te = [r for r in rs if r["day"] >= dt.date(2025, 1, 1)]
    print(f"{t:7s} Train {st(tr)} | Test {st(te)}")
print("tags", {t: sum(1 for r in rows if r["tag"] == t) for t in ("TP", "SL", "EOD")})
