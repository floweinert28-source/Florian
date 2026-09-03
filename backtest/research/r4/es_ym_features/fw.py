"""Framework ES/YM Feature-Suche (r4/es_ym_features).
Basis-Setups: Sweep+Reclaim von Session-Ranges (Asia, London, Premarket, Open-Range, Overnight) und PDH/PDL.
Engine ohne Look-Ahead: Entry = Close des Reclaim-Bars; im Entry-Bar nur SL (konservativ), TP erst ab Folgebar; SL vor TP.
Features nur aus Bars <= Entry-Bar. Cross-Asset: NQ-Status zur Entry-Minute (nur Bars <= Entry-Minute).
"""
import sys, math, datetime as dt, statistics, csv, os
from bisect import bisect_left, bisect_right
from collections import defaultdict
sys.path.insert(0, "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r3")
from load_vol import load_days_vol
SP = "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad"
INSTR = {"NQ": (SP + "/data", 0.75, 20.0, 100.0), "ES": (SP + "/data_es", 0.4, 50.0, 10.0), "YM": (SP + "/data_ym", 2.5, 5.0, 100.0)}
TEST_START = dt.date(2025, 1, 1)
RTH_S, RTH_E = 570, 960

class Inst:
    def __init__(self, tag):
        self.tag = tag; path, self.cost, self.usd, self.rnd = INSTR[tag]
        self.days = load_days_vol(path); self.dates = sorted(self.days)
        self.rth = {}; hist = []
        for d in self.dates:
            if d.weekday() >= 5: continue
            z = self.zone(d, RTH_S, RTH_E, 0.6)
            if z is None: continue
            mods, o, c, lo, hi, v = self.days[d]
            # Open = erster non-flat Bar ab 09:30, Close = letzter non-flat Bar vor 16:00
            i, j = z[2], z[3]; op = None; cl = None
            for k in range(i, j):
                if hi[k] > lo[k]: op = o[k]; break
            for k in range(j-1, i-1, -1):
                if hi[k] > lo[k]: cl = c[k]; break
            self.rth[d] = (z[0], z[1], cl, op); hist.append(d)
        self.hist = hist
        self.prev = {hist[i]: hist[i-1] for i in range(1, len(hist))}
        self.atr = {hist[i]: sum(self.rth[hist[i-k]][0]-self.rth[hist[i-k]][1] for k in range(1, 11))/10 for i in range(10, len(hist))}
        self.prevcal = {self.dates[i]: self.dates[i-1] for i in range(1, len(self.dates))}
        # Overnight-Range 18:00 (Vortag kal.) .. 09:30 und Asia 18:00..02:00
        self.on = {}; self.asia = {}
        for d in hist:
            pc = self.prevcal.get(d)
            if pc is None or (d - pc).days > 1: continue
            zp = self.zone(pc, 1080, 1440, 0.5); zc = self.zone(d, 0, RTH_S, 0.5); za = self.zone(d, 0, 120, 0.5)
            if zp and zc: self.on[d] = (max(zp[0], zc[0]), min(zp[1], zc[1]))
            if zp and za: self.asia[d] = (max(zp[0], za[0]), min(zp[1], za[1]))
    def zone(self, d, a, b, cov=0.6):
        """(high, low, i, j) ueber non-flat Bars in [a,b); None wenn zu wenig non-flat Bars."""
        if d not in self.days: return None
        mods, o, c, lo, hi, v = self.days[d]; i = bisect_left(mods, a); j = bisect_left(mods, b)
        hs = [hi[k] for k in range(i, j) if hi[k] > lo[k]]
        if len(hs) < (b - a) * cov: return None
        ls = [lo[k] for k in range(i, j) if hi[k] > lo[k]]
        return max(hs), min(ls), i, j
    def tradable(self, d):
        return d.weekday() < 5 and d in self.atr and d in self.prev and self.prev[d] in self.prev and self.rth[d][3] is not None

def setups(I, d, kind):
    """Liefert (rh, rl, start_min, label) fuer Basis-Setup 'kind' am Tag d, oder None."""
    if kind == "london":
        z = I.zone(d, 120, 300, 0.87); return (z[0], z[1], 300) if z else None
    if kind == "asia":
        a = I.asia.get(d); return (a[0], a[1], 120) if a else None
    if kind == "premkt":
        z = I.zone(d, 420, RTH_S, 0.87); return (z[0], z[1], RTH_S) if z else None
    if kind == "orb15":
        z = I.zone(d, RTH_S, RTH_S+15, 0.9); return (z[0], z[1], RTH_S+15) if z else None
    if kind == "orb30":
        z = I.zone(d, RTH_S, RTH_S+30, 0.9); return (z[0], z[1], RTH_S+30) if z else None
    if kind == "overnight":
        a = I.on.get(d); return (a[0], a[1], RTH_S) if a else None
    if kind == "pd":
        pdh, pdl, pdc, pdo = I.rth[I.prev[d]]; return (pdh, pdl, RTH_S)
    if kind == "pd_pre":
        pdh, pdl, pdc, pdo = I.rth[I.prev[d]]; return (pdh, pdl, 240)
    raise ValueError(kind)

def simulate(I, d, rh, rl, start_min, buf=0.1, max_wait=120, tp_mult=1.0, end=RTH_E, body_min=0.0, first_close_only=True):
    """Sweep+Reclaim: erster Bar ab start_min, der rh/rl bricht (beide -> kein Trade). Reclaim = erster Close zurueck in der Range
    binnen max_wait; Entry = Close. SL = Sweep-Extrem +/- buf*W. TP = tp_mult * SL-Distanz. Rueckgabe dict oder None."""
    W = rh - rl
    if W <= 0: return None
    mods, o, c, lo, hi, v = I.days[d]; m = len(mods); j = bisect_left(mods, start_min); dirn = None
    while j < m and mods[j] < end:
        if hi[j] > lo[j]:
            hh = hi[j] >= rh; hl = lo[j] <= rl
            if hh or hl:
                dirn = None if (hh and hl) else ("short" if hh else "long"); break
        j += 1
    if dirn is None: return None
    ext = hi[j] if dirn == "short" else lo[j]; k = j; ei = None
    while k < m and mods[k] - mods[j] <= max_wait and mods[k] < end:
        ext = max(ext, hi[k]) if dirn == "short" else min(ext, lo[k])
        if rl < c[k] < rh and hi[k] > lo[k]:
            body = abs(c[k]-o[k]) / (hi[k]-lo[k])
            if body >= body_min: ei = k; break
            if first_close_only: break
        k += 1
    if ei is None: return None
    entry = c[ei]; sl = ext + buf*W if dirn == "short" else ext - buf*W; sld = abs(entry - sl)
    if sld <= 0: return None
    tp = entry - tp_mult*sld if dirn == "short" else entry + tp_mult*sld; res = None; tag = None
    if (dirn == "long" and lo[ei] <= sl) or (dirn == "short" and hi[ei] >= sl): res = -sld; tag = "SL"; kk = ei
    else:
        kk = ei + 1
        while kk < m and mods[kk] < end:
            if dirn == "long":
                if lo[kk] <= sl: res = -sld; tag = "SL"; break
                if hi[kk] >= tp: res = tp_mult*sld; tag = "TP"; break
            else:
                if hi[kk] >= sl: res = -sld; tag = "SL"; break
                if lo[kk] <= tp: res = tp_mult*sld; tag = "TP"; break
            kk += 1
        if res is None:
            kk = min(kk, m-1); res = (c[kk]-entry) if dirn == "long" else (entry-c[kk]); tag = "EOD"
    return dict(d=d, dirn=dirn, j=j, ei=ei, xi=kk, ext=ext, entry=entry, sl=sl, tp=tp, sld=sld, res=res, tag=tag, rh=rh, rl=rl, W=W)

def _med_vol(v, j):
    vv = [x for x in v[max(0, j-60):j] if x > 0]
    return statistics.median(vv) if len(vv) >= 10 else 0.0

def nq_status(NQ, d, kind, dirn, sweep_min, entry_min):
    """Cross-Asset: Status von NQ zur Entry-Minute (nur NQ-Bars mit mod <= entry_min).
    nq_swept: NQ hat seine eigene gleichartige Range in derselben Richtung ab start_min bis entry_min gebrochen (1/0).
    nq_back: NQ-Close zur Entry-Minute wieder innerhalb seiner Range (1) / noch draussen (0) / nie gebrochen (-1 -> 0.5 codiert).
    nq_rs: NQ-Return (sweep_min..entry_min) / NQ-ATR, richtungsbereinigt (positiv = NQ laeuft in Trade-Richtung)."""
    out = dict(nq_swept=0.0, nq_back=0.5, nq_rs=0.0, nq_pos=0.5)
    if d not in NQ.days or d not in NQ.atr: return out
    try: s = setups(NQ, d, kind)
    except Exception: return out
    if s is None: return out
    rh, rl, start = s; W = rh - rl
    if W <= 0: return out
    mods, o, c, lo, hi, v = NQ.days[d]; i0 = bisect_left(mods, start); i1 = bisect_right(mods, entry_min) - 1
    if i1 < i0: return out
    swept = 0
    for k in range(i0, i1+1):
        if hi[k] <= lo[k]: continue
        if (dirn == "short" and hi[k] >= rh) or (dirn == "long" and lo[k] <= rl): swept = 1; break
    out["nq_swept"] = float(swept)
    if swept: out["nq_back"] = 1.0 if rl < c[i1] < rh else 0.0
    out["nq_pos"] = (c[i1] - rl) / W
    a = bisect_left(mods, sweep_min)
    if a > 0 and a <= i1:
        ret = (c[i1] - c[a-1]) / NQ.atr[d]; out["nq_rs"] = ret if dirn == "long" else -ret
    return out

def features(I, t, kind, ze_min, NQ=None):
    d = t["d"]; mods, o, c, lo, hi, v = I.days[d]; j, ei = t["j"], t["ei"]; dirn = t["dirn"]; sgn = 1 if dirn == "long" else -1
    A = I.atr[d]; W = t["W"]; rh, rl = t["rh"], t["rl"]; entry = t["entry"]; ext = t["ext"]
    pd_ = I.prev[d]; pdh, pdl, pdc, pdo = I.rth[pd_]; ppc = I.rth[I.prev[pd_]][2]
    medv = _med_vol(v, j)
    # Overnight-Range KAUSAL: 18:00 Vortag (kal.) bis min(Sweep-Bar, 09:30) -> vor 09:30 nur der bisherige Teil
    on = None; pc = I.prevcal.get(d)
    if pc is not None and (d - pc).days == 1:
        zp = I.zone(pc, 1080, 1440, 0.5); jcut = min(j, bisect_left(mods, RTH_S))
        hs_ = [hi[k] for k in range(0, jcut) if hi[k] > lo[k]]; ls_ = [lo[k] for k in range(0, jcut) if hi[k] > lo[k]]
        if zp and hs_: on = (max(zp[0], max(hs_)), min(zp[1], min(ls_)))
    # Cash-Open-Gap nur, wenn Entry >= 09:30 (sonst kausal: Preis vor Sweep vs Vortagesclose)
    op = I.rth[d][3]
    gap = (op - pdc) / A if (mods[ei] >= RTH_S and op is not None and pdc is not None) else ((c[j-1] - pdc) / A if j >= 1 else 0.0)
    # Tagesrange bis Entry (ab 00:00 heute, non-flat)
    hs = [hi[k] for k in range(0, ei+1) if hi[k] > lo[k]]; ls = [lo[k] for k in range(0, ei+1) if hi[k] > lo[k]]
    dh, dl = (max(hs), min(ls)) if hs else (entry, entry)
    # Momentum vor dem Sweep: 30 min
    jj = max(0, j-31); mom = (c[j-1] - c[jj]) / A if j >= 1 else 0.0
    # Runde Level: naechstes Vielfaches von I.rnd zum Sweep-Extrem bzw. Entry
    rnd = I.rnd; d_ext = abs(ext - round(ext / rnd) * rnd); d_ent = abs(entry - round(entry / rnd) * rnd)
    # Liegt ein rundes Level zwischen Entry und TP (Hindernis)? 1/0
    lo_, hi_ = sorted((entry, t["tp"])); obst = 1.0 if math.floor(hi_ / rnd) * rnd > lo_ else 0.0
    f = dict(
        sweep_depth=((ext - rh) if dirn == "short" else (rl - ext)) / W,
        sweep_atr=((ext - rh) if dirn == "short" else (rl - ext)) / A,
        sweep_dur=float(mods[ei] - mods[j]),
        reclaim_body=abs(c[ei]-o[ei]) / (hi[ei]-lo[ei]) if hi[ei] > lo[ei] else 0.0,
        reclaim_rng=(hi[ei]-lo[ei]) / A,
        entry_pos=(entry - rl) / W,
        vol_sweep=(v[j] / medv) if medv else 0.0,
        vol_entry=(v[ei] / medv) if medv else 0.0,
        W_atr=W / A, hour=mods[ei] / 60, wd=float(d.weekday()),
        prev_trend=(pdc - ppc) / A,
        dist_pdh=(pdh - entry) / A, dist_pdl=(entry - pdl) / A,
        on_pos=((entry - on[1]) / (on[0]-on[1])) if on and on[0] > on[1] else 0.5,
        on_size=((on[0]-on[1]) / A) if on else 0.0,
        gap=gap, gap_align=gap * sgn, gap_abs=abs(gap),
        rnd_ext=d_ext / A, rnd_entry=d_ent / A, rnd_obst=obst,
        mom_align=mom * sgn, sld_atr=t["sld"] / A,
        t_since_zone=float(mods[j] - ze_min),
        day_rng=(dh - dl) / A, day_pos=((entry - dl) / (dh - dl)) if dh > dl else 0.5,
        dir_long=1.0 if dirn == "long" else 0.0,
    )
    if NQ is not None and I.tag != "NQ":
        f.update(nq_status(NQ, d, kind, dirn, mods[j], mods[ei]))
    return f

ZONE_END = dict(london=300, asia=120, premkt=RTH_S, orb15=RTH_S+15, orb30=RTH_S+30, overnight=RTH_S, pd=RTH_S, pd_pre=240)

def build(I, kind, NQ=None, **kw):
    rows = []
    for d in I.dates:
        if not I.tradable(d): continue
        s = setups(I, d, kind)
        if s is None: continue
        t = simulate(I, d, s[0], s[1], s[2], **kw)
        if t is None: continue
        f = features(I, t, kind, ZONE_END[kind], NQ)
        mods = I.days[d][0]
        rows.append(dict(day=d, kind=kind, win=t["res"] > 0, usd=(t["res"] - I.cost) * I.usd, res=t["res"], tag=t["tag"], dirn=t["dirn"],
                         entry_t=mods[t["ei"]], entry=t["entry"], sl=t["sl"], tp=t["tp"], **f))
    return rows

def wr(rows): return (sum(r["win"] for r in rows) / len(rows) * 100) if rows else float("nan")
def split(rows):
    return [r for r in rows if r["day"] < TEST_START], [r for r in rows if r["day"] >= TEST_START]
def stats(rows):
    n = len(rows)
    if n == 0: return "n=0"
    usd = [r["usd"] for r in rows]; mean = sum(usd)/n
    sd = math.sqrt(sum((x-mean)**2 for x in usd)/(n-1)) if n > 1 else 1; t = mean/(sd/math.sqrt(n)) if sd else 0
    return f"N={n:4d} WR={wr(rows):5.1f}% t={t:5.2f} Netto {sum(usd):+8.0f}"
def weeks(rows):
    if not rows: return 0
    ds = sorted(r["day"] for r in rows); return max(1, (ds[-1]-ds[0]).days / 7)
def years_pos(rows):
    py = defaultdict(float)
    for r in rows: py[r["day"].year] += r["usd"]
    return "/".join(f"{y}:{'+' if py[y] > 0 else '-'}" for y in sorted(py))
def write_csv(rows, path):
    with open(path, "w", newline="") as f:
        w = csv.writer(f); w.writerow(["date", "dir", "entry_time", "entry", "sl", "tp", "result", "pnl_usd"])
        for r in rows:
            w.writerow([r["day"].isoformat(), r["dirn"], f"{r['entry_t']//60:02d}:{r['entry_t']%60:02d}", round(r["entry"], 2),
                        round(r["sl"], 2), round(r["tp"], 2), r["tag"], round(r["usd"], 2)])

FEATS_SKIP = ("day", "kind", "win", "usd", "res", "tag", "dirn", "entry_t", "entry", "sl", "tp")
def feat_names(rows): return [k for k in rows[0] if k not in FEATS_SKIP]

def quartiles(rows, name, show=True, min_n=40):
    """Quartil-Analyse auf TRAIN, Test daneben. Liefert Liste (wtr, wte, ntr, nte, f, lo, hi)."""
    tr, te = split(rows); out = []
    if show: print(f"\n=== {name}: Train {stats(tr)} | Test {stats(te)} | {len(rows)/weeks(rows):.1f}/Woche ===", flush=True)
    for f in feat_names(rows):
        vals = sorted(r[f] for r in tr)
        if not vals: continue
        qs = [vals[int(len(vals)*q)] for q in (0.25, 0.5, 0.75)]
        if qs[0] == qs[2]:  # binaere / degenerierte Features: Split nach Wert
            uv = sorted(set(vals)); bounds = [(u, u + 1e-9) for u in uv] if len(uv) <= 4 else [(-1e9, qs[1]), (qs[1], 1e9)]
        else:
            bounds = [(-1e9, qs[0]), (qs[0], qs[1]), (qs[1], qs[2]), (qs[2], 1e9)]
        parts = []
        for lo_, hi_ in bounds:
            g = [r for r in tr if lo_ <= r[f] < hi_]; gt = [r for r in te if lo_ <= r[f] < hi_]
            if len(g) < min_n: continue
            parts.append(f"{wr(g):4.0f}/{wr(gt):4.0f}({len(g)})"); out.append((wr(g), wr(gt), len(g), len(gt), f, lo_, hi_))
        if show and parts: print(f"  {f:13s} " + " | ".join(parts))
    return out
