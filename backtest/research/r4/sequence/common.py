"""Gemeinsame Basis fuer Sequenz-Muster (r4/sequence). Pure Python.
Kontinuierliche Bar-Serie ueber alle Tage (NY-Zeit), Sessions durch Luecken >= 30 min getrennt (17:00-18:00 Pause, Wochenende).
Kein Look-Ahead: Entry = Close eines abgeschlossenen Bars (oder Limit-Fill durch SPAETEREN Bar); im Entry-/Fill-Bar wird nur SL
(konservativ) gewertet, nie TP; ab dem Folgebar SL vor TP.
"""
import sys, os, math, csv, datetime as dt, pickle
from bisect import bisect_left, insort
from collections import defaultdict
SP = "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad"
sys.path.insert(0, SP + "/research/r3")
from load_vol import load_days_vol
INST = {"NQ": (SP + "/data", 0.75, 20.0), "ES": (SP + "/data_es", 0.4, 50.0), "YM": (SP + "/data_ym", 2.5, 5.0)}
TEST_START = dt.date(2025, 1, 1)
WEEKS_TRAIN = (dt.date(2024, 12, 31) - dt.date(2021, 9, 1)).days / 7.0
WEEKS_TEST = (dt.date(2026, 8, 31) - dt.date(2025, 1, 1)).days / 7.0
WEEKS_ALL = WEEKS_TRAIN + WEEKS_TEST

class Series:
    """Kontinuierliche Serie. Felder: date[i], mod[i] (Minute des NY-Tages), o,c,lo,hi,v, t[i] = Minuten seit Epoche (NY-Wandzeit),
    send[i] = Index des letzten Bars der Session von i, sstart[i] = erster Bar der Session, atr[i] = mittl. Bar-Range der letzten 60 Bars."""
    def __init__(self, inst):
        ddir, self.cost, self.usd = INST[inst]; self.inst = inst
        cache = SP + f"/research/r4/sequence/series_{inst}.pkl"
        if os.path.exists(cache):
            d = pickle.load(open(cache, "rb")); self.__dict__.update(d); return
        days = load_days_vol(ddir)
        date, mod, o, c, lo, hi, v = [], [], [], [], [], [], []
        for d in sorted(days):
            mods, oo, cc, ll, hh, vv = days[d]
            # Feiertags-/Flat-Filter: Tage mit > 40 % flachen Bars komplett raus
            n = len(mods); flat = sum(1 for k in range(n) if hh[k] == ll[k])
            if n < 100 or flat > 0.4 * n: continue
            for k in range(n):
                if hh[k] == ll[k] and vv[k] == 0: continue
                date.append(d); mod.append(mods[k]); o.append(oo[k]); c.append(cc[k]); lo.append(ll[k]); hi.append(hh[k]); v.append(vv[k])
        n = len(mod); ep = dt.date(2021, 1, 1)
        t = [(date[i] - ep).days * 1440 + mod[i] for i in range(n)]
        send = [0] * n; sstart = [0] * n; s = 0
        for i in range(1, n + 1):
            if i == n or t[i] - t[i - 1] >= 30:
                for k in range(s, i): send[k] = i - 1; sstart[k] = s
                s = i
        atr = [0.0] * n; run = 0.0
        for i in range(n):
            run += hi[i] - lo[i]
            if i >= 60: run -= hi[i - 60] - lo[i - 60]
            atr[i] = run / min(i + 1, 60)
        self.date, self.mod, self.o, self.c, self.lo, self.hi, self.v, self.t, self.send, self.sstart, self.atr = date, mod, o, c, lo, hi, v, t, send, sstart, atr
        self.n = n
        # Tages-Indizes (erster Bar je Datum) und RTH-Levels des Vortags (PDH/PDL/PDC) + Session-Ranges
        self.day_first = {}
        for i in range(n):
            if date[i] not in self.day_first: self.day_first[date[i]] = i
        self._build_session_levels()
        pickle.dump({k: getattr(self, k) for k in ("date", "mod", "o", "c", "lo", "hi", "v", "t", "send", "sstart", "atr", "n", "day_first", "sess", "cost", "usd", "inst")}, open(cache, "wb"))

    def _build_session_levels(self):
        """sess[d] = dict name -> (high, low, idx_confirmed) fuer Datum d. Namen: PD (RTH Vortag 09:30-16:00), ASIA (18:00 Vortag - 02:00),
        LON (02:00-05:00), PRE (05:00-09:30), OR15 (09:30-09:45), OR30, AM (09:30-12:00 -> fuer Nachmittag)."""
        n = self.n; date, mod, lo, hi = self.date, self.mod, self.lo, self.hi
        sess = defaultdict(dict); rth = {}
        # Aggregation je (Datum, Fenster)
        agg = defaultdict(lambda: [-1e18, 1e18, -1, 0])
        windows = [("RTH", 570, 960), ("LON", 120, 300), ("PRE", 300, 570), ("OR15", 570, 585), ("OR30", 570, 600), ("AM", 570, 720), ("ASIA_PM", 1080, 1440), ("ASIA_AM", 0, 120)]
        for i in range(n):
            m = mod[i]
            for nm, a, b in windows:
                if a <= m < b:
                    r = agg[(date[i], nm)]
                    if hi[i] > r[0]: r[0] = hi[i]
                    if lo[i] < r[1]: r[1] = lo[i]
                    r[2] = i; r[3] += 1
        dates = sorted(set(date)); prev_rth = None; prev_asia = None
        for d in dates:
            if prev_rth is not None and d in self.day_first:
                sess[d]["PD"] = (prev_rth[0], prev_rth[1], self.day_first[d])
            r = agg.get((d, "ASIA_AM"))
            if r is not None and r[3] >= 0.6 * 120 and prev_asia is not None and (d - date[prev_asia[2]]).days <= 3:
                sess[d]["ASIA"] = (max(prev_asia[0], r[0]), min(prev_asia[1], r[1]), r[2])
            prev_asia = None
            for nm, a, b in windows:
                r = agg.get((d, nm))
                if r is None or r[3] < 0.6 * (b - a): continue
                if nm == "RTH": prev_rth = (r[0], r[1], r[2]); continue
                if nm == "ASIA_PM": prev_asia = (r[0], r[1], r[2]); continue
                if nm == "ASIA_AM": continue
                sess[d][nm] = (r[0], r[1], r[2])
        self.sess = dict(sess)

    def sim(self, ei, dirn, entry, sl, tp, end=None, entry_bar_sl=True):
        """Market-Entry zum Close von Bar ei. Rueckgabe (res_pts, exit_idx, tag). end = letzter erlaubter Bar (default Session-Ende)."""
        lo, hi, c = self.lo, self.hi, self.c
        if end is None: end = self.send[ei]
        if entry_bar_sl and ((dirn == 1 and lo[ei] <= sl) or (dirn == -1 and hi[ei] >= sl)):
            return -(abs(entry - sl)), ei, "SL"
        k = ei + 1
        while k <= end:
            if dirn == 1:
                if lo[k] <= sl: return sl - entry, k, "SL"
                if hi[k] >= tp: return tp - entry, k, "TP"
            else:
                if hi[k] >= sl: return entry - sl, k, "SL"
                if lo[k] <= tp: return entry - tp, k, "TP"
            k += 1
        k = end; return (c[k] - entry) * dirn, k, "EOD"

    def sim_limit(self, si, dirn, limit, sl, tp, expire, end=None):
        """Limit-Order ab Bar si+1 (nur spaetere Bars fuellen). Fill-Bar: SL konservativ gewertet, TP nicht.
        Falls der Fill-Bar auch ueber den Limit hinaus 'gapt' (Open jenseits), Fill zum Open. Rueckgabe (res, fill_idx, exit_idx, tag) oder None."""
        lo, hi, o, c = self.lo, self.hi, self.o, self.c
        if end is None: end = self.send[si]
        k = si + 1; last = min(end, si + expire)
        while k <= last:
            if dirn == 1 and lo[k] <= limit:
                fill = min(limit, o[k]) if o[k] < limit else limit
                if lo[k] <= sl: return sl - fill, k, k, "SL"
                r = self.sim(k, 1, fill, sl, tp, end, entry_bar_sl=False); return r[0] + (fill - fill), k, r[1], r[2]
            if dirn == -1 and hi[k] >= limit:
                fill = max(limit, o[k]) if o[k] > limit else limit
                if hi[k] >= sl: return fill - sl, k, k, "SL"
                r = self.sim(k, -1, fill, sl, tp, end, entry_bar_sl=False); return r[0], k, r[1], r[2]
            k += 1
        return None

    def trade(self, ei, dirn, entry, sl, tp, res, xi, tag, extra=None):
        d = self.date[ei]; m = self.mod[ei]
        row = dict(date=d.isoformat(), dir="long" if dirn == 1 else "short", entry_time=f"{m//60:02d}:{m%60:02d}", entry=round(entry, 2),
                   sl=round(sl, 2), tp=round(tp, 2), result=tag, pnl_usd=round((res - self.cost) * self.usd, 2), pnl_pts=round(res, 3), _d=d, _ei=ei, _xi=xi)
        if extra: row.update(extra)
        return row

def pivots(S, k):
    """Swing-Hochs/Tiefs auf 1-min-Basis mit k Bars links/rechts (strikt hoeher/tiefer als alle). Bestaetigt bei Index i+k.
    Rueckgabe Listen (idx, price, confirm_idx) fuer highs und lows. Nur innerhalb einer Session."""
    hi, lo, n = S.hi, S.lo, S.n; PH, PL = [], []
    for i in range(k, n - k):
        if S.sstart[i] > i - k or S.send[i] < i + k: continue
        h = hi[i]; ok = True
        for j in range(i - k, i + k + 1):
            if j != i and hi[j] >= h: ok = False; break
        if ok: PH.append((i, h, i + k))
        l = lo[i]; ok = True
        for j in range(i - k, i + k + 1):
            if j != i and lo[j] <= l: ok = False; break
        if ok: PL.append((i, l, i + k))
    return PH, PL

def rolling_median_body(S, w=20):
    """Median des Kerzenkoerpers der letzten w abgeschlossenen Bars VOR i (also Bars i-w..i-1). Liste."""
    n = S.n; o, c = S.o, S.c; out = [0.0] * n; win = []; q = []
    for i in range(n):
        if len(win) >= 2:
            m = len(win); out[i] = win[m // 2] if m % 2 else 0.5 * (win[m // 2 - 1] + win[m // 2])
        b = abs(c[i] - o[i]); insort(win, b); q.append(b)
        if len(q) > w:
            old = q.pop(0); del win[bisect_left(win, old)]
    return out

def report(name, trades, S, show_years=True, quiet=False):
    """Train/Test-Statistik. Rueckgabe dict."""
    tr = [x for x in trades if x["_d"] < TEST_START]; te = [x for x in trades if x["_d"] >= TEST_START]
    def st(rows):
        n = len(rows)
        if n == 0: return (0, 0.0, 0.0)
        return n, sum(1 for r in rows if r["pnl_pts"] > 0) / n * 100, sum(r["pnl_usd"] for r in rows)
    ntr, wtr, utr = st(tr); nte, wte, ute = st(te); n = ntr + nte
    py = defaultdict(lambda: [0, 0, 0.0])
    for x in trades:
        y = x["_d"].year; py[y][0] += 1; py[y][1] += x["pnl_pts"] > 0; py[y][2] += x["pnl_usd"]
    ypos = "/".join(f"{y}:{'+' if py[y][2] > 0 else '-'}" for y in sorted(py))
    if not quiet:
        print(f"{name:60s} N={n:5d} ({n/WEEKS_ALL:4.1f}/wk) | TRAIN N={ntr:5d} WR={wtr:5.1f}% net={utr:+9.0f} | TEST N={nte:4d} WR={wte:5.1f}% net={ute:+8.0f} | {ypos}", flush=True)
    return dict(name=name, n=n, tpw=n / WEEKS_ALL, ntr=ntr, wtr=wtr, utr=utr, nte=nte, wte=wte, ute=ute, years=ypos)

def write_csv(path, trades):
    keys = ["date", "dir", "entry_time", "entry", "sl", "tp", "result", "pnl_usd", "pnl_pts"]
    with open(path, "w", newline="") as f:
        w = csv.writer(f); w.writerow(keys)
        for x in trades: w.writerow([x[k] for k in keys])
