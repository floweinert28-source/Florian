"""Engine: Session-Range-/Level-Sweep + Reclaim mit Signal-Timeframe 1/5/15 min, Ausfuehrung auf 1-min.
Regeln: Reclaim = Close des Signal-TF-Bars zurueck in Range (bzw. auf der Innenseite des Levels), Body >= thr der Signal-Kerze,
Body-Richtung zum Trade. Entry = Close des Signal-Bars (= Close des letzten 1-min-Bars). SL = Sweep-Extrem +/- Buffer. TP = 1R.
Kein Look-Ahead: Entry-Bar nur SL (konservativ), TP erst ab Folgebar; SL vor TP im selben Bar."""
import sys, math, datetime as dt, csv, os
from bisect import bisect_left
from collections import defaultdict
sys.path.insert(0, "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r3")
from load_vol import load_days_vol
SP = "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad"
INST = {"NQ": (SP + "/data", 0.75, 20.0), "ES": (SP + "/data_es", 0.4, 50.0), "YM": (SP + "/data_ym", 2.5, 5.0)}
TEST0 = dt.date(2025, 1, 1)
WEEKS = (dt.date(2026, 8, 31) - dt.date(2021, 9, 1)).days / 7.0

class Market:
    def __init__(self, tag):
        path, self.cost, self.usd = INST[tag]; self.tag = tag
        raw = load_days_vol(path)
        # Feiertags-/Flat-Tage filtern: Tag ohne Bewegung oder Wochenende raus
        self.days = {}
        for d, cols in raw.items():
            if d.weekday() >= 5: continue
            mods, o, c, lo, hi, v = cols
            if sum(1 for h, l in zip(hi, lo) if h > l) < 300: continue
            self.days[d] = cols
        self.dates = sorted(self.days)
        self.rth = {}; hist = []
        for d in self.dates:
            z = self.zone(d, 570, 960, 0.6)
            if z:
                self.rth[d] = (z[0], z[1], self.days[d][2][z[3]-1]); hist.append(d)
        self.hist = hist
        self.prev = {hist[i]: hist[i-1] for i in range(1, len(hist))}
        self.atr = {hist[i]: sum(self.rth[hist[i-k]][0]-self.rth[hist[i-k]][1] for k in range(1, 11))/10 for i in range(10, len(hist))}
        self.tfcache = {}

    def zone(self, d, a, b, cov=0.6):
        mods, o, c, lo, hi, v = self.days[d]; i = bisect_left(mods, a); j = bisect_left(mods, b)
        if j - i < (b - a) * cov: return None
        return max(hi[i:j]), min(lo[i:j]), i, j

    def tfbars(self, d, tf):
        """Signal-TF-Bars: Liste (start_idx, end_idx, o, h, l, c, end_mod); bar_of[i] = Bar-Index des 1-min-Bars i."""
        key = (d, tf)
        if key in self.tfcache: return self.tfcache[key]
        mods, o, c, lo, hi, v = self.days[d]; m = len(mods)
        if tf == 1:
            bars = [(i, i, o[i], hi[i], lo[i], c[i], mods[i]) for i in range(m)]; bar_of = list(range(m))
        else:
            bars = []; bar_of = [0]*m; cur = None; s = 0
            for i in range(m):
                g = mods[i] // tf
                if g != cur:
                    if cur is not None:
                        bars.append((s, i-1, o[s], max(hi[s:i]), min(lo[s:i]), c[i-1], mods[i-1]))
                    cur = g; s = i
                bar_of[i] = len(bars)
            bars.append((s, m-1, o[s], max(hi[s:m]), min(lo[s:m]), c[m-1], mods[m-1]))
        self.tfcache[key] = (bars, bar_of); return bars, bar_of

def simulate(mk, d, ei, dirn, entry, sl, end_mod, tp_mult=1.0):
    """1-min-Simulation ab Entry-Bar ei. Rueckgabe (res_pts, exit_idx, tag)."""
    mods, o, c, lo, hi, v = mk.days[d]; m = len(mods); sld = abs(entry - sl)
    tp = entry - tp_mult*sld if dirn == "short" else entry + tp_mult*sld
    if (dirn == "long" and lo[ei] <= sl) or (dirn == "short" and hi[ei] >= sl): return -sld, ei, "SL"
    kk = ei + 1
    while kk < m and mods[kk] < end_mod:
        if dirn == "long":
            if lo[kk] <= sl: return -sld, kk, "SL"
            if hi[kk] >= tp: return tp_mult*sld, kk, "TP"
        else:
            if hi[kk] >= sl: return -sld, kk, "SL"
            if lo[kk] <= tp: return tp_mult*sld, kk, "TP"
        kk += 1
    kk = min(kk-1, m-1)
    if kk <= ei: kk = ei
    return ((c[kk]-entry) if dirn == "long" else (entry-c[kk])), kk, "EOD"

def sweep_reclaim(mk, d, rh, rl, s_idx, scan_end, eval_end, tf, body_thr, max_wait, buf_pts, multi=False,
                  first_only=False, level=False, tp_mult=1.0, min_sld=0.0, max_sld=None):
    """Sucht Sweep(s) der Range [rl, rh] ab 1-min-Index s_idx (Sweep muss vor scan_end passieren) und Reclaim auf Signal-TF.
    level=True: rh==rl ist ein einzelnes Level; Richtung durch Anlauf-Seite (letzter Close vor Bruch).
    Liefert Liste Trades (dict)."""
    mods, o, c, lo, hi, v = mk.days[d]; m = len(mods); bars, bar_of = mk.tfbars(d, tf); trades = []
    j = s_idx; need_inside = False
    while j < m and mods[j] < scan_end:
        if need_inside:
            if (rl < c[j] < rh) if not level else True: need_inside = False
            j += 1; continue
        if level:
            pc = c[j-1] if j > 0 else o[j]
            hh = hi[j] >= rh and pc < rh; hl = lo[j] <= rl and pc > rl
        else:
            hh = hi[j] >= rh; hl = lo[j] <= rl
        if not (hh or hl): j += 1; continue
        if hh and hl:
            j += 1; need_inside = True; continue
        dirn = "short" if hh else "long"
        ext = hi[j] if dirn == "short" else lo[j]; kb = bar_of[j]; ei = None; last_end = j
        while kb < len(bars):
            bs, be, bo, bh, bl, bc, bem = bars[kb]
            if bem - mods[j] > max_wait or bem >= scan_end: break
            seg_s = max(bs, j)
            ext = max(ext, max(hi[seg_s:be+1])) if dirn == "short" else min(ext, min(lo[seg_s:be+1]))
            last_end = be
            inside = (bc < rh and (level or bc > rl)) if dirn == "short" else (bc > rl and (level or bc < rh))
            if inside:
                rng = bh - bl; body = abs(bc - bo)/rng if rng > 0 else 0.0
                okdir = (bc < bo) if dirn == "short" else (bc > bo)
                if body >= body_thr and okdir: ei = be; break
                if first_only: break
            kb += 1
        if ei is None:
            j = last_end + 1
            if not multi: break
            need_inside = True; continue
        entry = c[ei]; sl = ext + buf_pts if dirn == "short" else ext - buf_pts; sld = abs(entry - sl)
        if sld <= 0 or sld < min_sld or (max_sld is not None and sld > max_sld):
            j = ei + 1
            if not multi: break
            need_inside = True; continue
        res, xi, tag = simulate(mk, d, ei, dirn, entry, sl, eval_end, tp_mult)
        trades.append(dict(date=d.isoformat(), dir=dirn, entry_time=f"{mods[ei]//60:02d}:{mods[ei]%60:02d}", entry=round(entry, 2),
                           sl=round(sl, 2), tp=round(entry - tp_mult*sld if dirn == "short" else entry + tp_mult*sld, 2), result=tag,
                           pnl_pts=round(res, 2), pnl_usd=round((res - mk.cost)*mk.usd, 2), sweep_time=f"{mods[j]//60:02d}:{mods[j]%60:02d}",
                           sld=sld, win=res > 0, day=d, ext=ext, rh=rh, rl=rl, ei=ei, sj=j, tfbar=bar_of[ei], exit_idx=xi))
        if not multi: break
        j = xi + 1; need_inside = True
    return trades

# Session-Zonen (Minuten NY): name -> (zs, ze, scan_end, eval_end, cov)
ZONES = {
    "Asia 18-02": (1080, 1440, 570, 960, 0.5),      # Range aus Vortag 18:00-24:00 + Tag 00:00-02:00 -> speziell behandelt
    "London 02-05": (120, 300, 720, 960, 0.85),
    "Pre 05-0930": (300, 570, 960, 960, 0.85),
    "Pre 07-0930": (420, 570, 960, 960, 0.85),
    "0812-0912": (492, 552, 720, 960, 0.85),
    "Open 0930-0945": (570, 585, 960, 960, 0.9),
    "Open 0930-1000": (570, 600, 960, 960, 0.9),
    "AM 0930-1130": (570, 690, 960, 960, 0.9),
    "Mittag 1130-1330": (690, 810, 960, 960, 0.9),
}

def zone_range(mk, d, name):
    zs, ze, scan_end, eval_end, cov = ZONES[name]
    if name.startswith("Asia"):
        pd_ = mk.prev.get(d)
        if pd_ is None: return None
        z1 = mk.zone(pd_, 1080, 1440, 0.5); z2 = mk.zone(d, 0, 120, 0.5)
        if z1 is None or z2 is None: return None
        rh = max(z1[0], z2[0]); rl = min(z1[1], z2[1]); return rh, rl, z2[3], scan_end, eval_end
    z = mk.zone(d, zs, ze, cov)
    if z is None: return None
    return z[0], z[1], z[3], scan_end, eval_end

def run_zone(mk, name, tf, body_thr, max_wait=120, buf=0.1, multi=False, first_only=False, tp_mult=1.0, buf_mode="W"):
    out = []
    for d in mk.dates:
        if d not in mk.atr: continue
        z = zone_range(mk, d, name)
        if z is None: continue
        rh, rl, s_idx, scan_end, eval_end = z; W = rh - rl
        if W <= 0: continue
        bp = buf*W if buf_mode == "W" else buf*mk.atr[d]
        out += sweep_reclaim(mk, d, rh, rl, s_idx, scan_end, eval_end, tf, body_thr, max_wait, bp, multi, first_only, tp_mult=tp_mult)
    return out

def stats(rows):
    tr = [r for r in rows if r["day"] < TEST0]; te = [r for r in rows if r["day"] >= TEST0]
    def wr(x): return sum(r["win"] for r in x)/len(x)*100 if x else float("nan")
    def net(x): return sum(r["pnl_usd"] for r in x)
    py = defaultdict(float)
    for r in rows: py[r["day"].year] += r["pnl_usd"]
    yp = sum(1 for y in py if py[y] > 0)
    return dict(n=len(rows), ntr=len(tr), nte=len(te), wr_tr=wr(tr), wr_te=wr(te), net_tr=net(tr), net_te=net(te),
                tpw=len(rows)/WEEKS, yrs=f"{yp}/{len(py)}")

def fmt(tag, rows):
    s = stats(rows)
    return (f"{tag:58s} N={s['n']:5d} ({s['tpw']:4.1f}/wk) | TRAIN n={s['ntr']:4d} WR={s['wr_tr']:5.1f}% net={s['net_tr']:+8.0f}"
            f" | TEST n={s['nte']:4d} WR={s['wr_te']:5.1f}% net={s['net_te']:+8.0f} | yrs+ {s['yrs']}")

def save_csv(rows, path):
    with open(path, "w", newline="") as f:
        w = csv.writer(f); w.writerow(["date", "dir", "entry_time", "entry", "sl", "tp", "result", "pnl_usd"])
        for r in rows: w.writerow([r["date"], r["dir"], r["entry_time"], r["entry"], r["sl"], r["tp"], r["result"], r["pnl_usd"]])
