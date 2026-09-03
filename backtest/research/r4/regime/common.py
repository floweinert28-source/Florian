"""Regime x Setup: gemeinsame Bausteine. Alle Zeiten NY. Pure Python.
Tages-Regime (vor dem Tag bekannt / bis Entry bekannt):
  vol5_pct : Perzentil (0..1) der mittleren RTH-Tagesrange der letzten 5 Handelstage relativ zu den letzten 120 Werten dieser Groesse
  on_atr   : Overnight-Range (18:00 Vortag .. 09:29) / ATR10
  or30_atr : Range 09:30-09:59 / ATR10 (nur fuer Entries >= 10:00 gueltig)
  gap_atr  : (09:30 Open - Vortages-RTH-Close) / ATR10
  prev_body: |PrevClose-PrevOpen| / PrevRange (Tagestyp Vortag: 0 = Range-Tag, 1 = Trend-Tag)
  prev_trend: (PrevClose - PrevPrevClose)/ATR10
Intraday (Bar i abgeschlossen):
  trend60  : (#gruene - #rote) / 12 der letzten 12 abgeschlossenen 5-min-Kerzen (signiert; |.| = Trendstaerke)
  vwap_sig : (Close - VWAP_ab_09:30) / sigma_vwap  (volumengewichtet)
  daytype  : Tagestyp-Score bis Entry = (Close - RTH-Open) / (RTH-High - RTH-Low bis jetzt) ... in [-1,1]
"""
import sys, math, csv, os, datetime as dt
from bisect import bisect_left, bisect_right
from collections import defaultdict
sys.path.insert(0, "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r3")
from load_vol import load_days_vol
SP = "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad"
INSTR = {"NQ": (SP+"/data", 0.75, 20.0), "ES": (SP+"/data_es", 0.4, 50.0), "YM": (SP+"/data_ym", 2.5, 5.0)}
TEST_START = dt.date(2025, 1, 1)

class Market:
    def __init__(self, tag):
        path, self.cost, self.usd = INSTR[tag]; self.tag = tag
        self.days = load_days_vol(path); self.dates = sorted(self.days)
        self._daily(); self._fivemin()
    def zone(self, d, a, b, cov=0.6):
        mods, o, c, lo, hi, v = self.days[d]; i = bisect_left(mods, a); j = bisect_left(mods, b)
        if j - i < (b - a) * cov: return None
        return max(hi[i:j]), min(lo[i:j]), i, j
    def _daily(self):
        self.rth = {}; hist = []
        for d in self.dates:
            if d.weekday() >= 5: continue
            z = self.zone(d, 570, 960)
            if z is None: continue
            mods, o, c, lo, hi, v = self.days[d]
            # Feiertags-Fake: flache Bars dominieren
            n_flat = sum(1 for k in range(z[2], z[3]) if hi[k] == lo[k])
            if n_flat > (z[3]-z[2]) * 0.5: continue
            self.rth[d] = dict(h=z[0], l=z[1], o=o[z[2]], c=c[z[3]-1], rng=z[0]-z[1]); hist.append(d)
        self.hist = hist; self.prev = {hist[i]: hist[i-1] for i in range(1, len(hist))}
        self.atr = {}; vol5 = {}
        for i in range(10, len(hist)):
            d = hist[i]; self.atr[d] = sum(self.rth[hist[i-k]]["rng"] for k in range(1, 11)) / 10
            vol5[d] = sum(self.rth[hist[i-k]]["rng"] for k in range(1, 6)) / 5
        self.reg = {}
        v5list = []
        for i in range(10, len(hist)):
            d = hist[i]; A = self.atr[d]; pd_ = hist[i-1]; r = {}
            r["vol5_pct"] = (sum(1 for x in v5list[-120:] if x < vol5[d]) / len(v5list[-120:])) if len(v5list) >= 20 else None
            v5list.append(vol5[d])
            # overnight: Vortag ab 18:00 + heute bis 09:29
            pm, po, pc, plo, phi, pv = self.days[pd_]; a = bisect_left(pm, 1080)
            mods, o, c, lo, hi, v = self.days[d]; b = bisect_left(mods, 570)
            # ggf. liegt zwischen pd_ und d ein Wochenende: dann Sonntag-Bars nicht beruecksichtigt (ok, konservativ)
            hs = phi[a:] + hi[:b]; ls = plo[a:] + lo[:b]
            if len(hs) > 300:
                r["on_atr"] = (max(hs) - min(ls)) / A; r["on_h"] = max(hs); r["on_l"] = min(ls)
            else: r["on_atr"] = None; r["on_h"] = None; r["on_l"] = None
            z = self.zone(d, 570, 600, 0.8)
            if z: r["or30_atr"] = (z[0]-z[1]) / A; r["or_h"] = z[0]; r["or_l"] = z[1]
            else: r["or30_atr"] = None; r["or_h"] = None; r["or_l"] = None
            r["gap_atr"] = (self.rth[d]["o"] - self.rth[pd_]["c"]) / A
            pr = self.rth[pd_]; r["prev_body"] = abs(pr["c"]-pr["o"]) / pr["rng"] if pr["rng"] > 0 else 0
            ppd = self.prev.get(pd_); r["prev_trend"] = (pr["c"] - self.rth[ppd]["c"]) / A if ppd else 0
            r["pdh"] = pr["h"]; r["pdl"] = pr["l"]; r["pdc"] = pr["c"]; r["atr"] = A
            self.reg[d] = r
    def _fivemin(self):
        """5-min-Kerzen je Tag: Listen (start_mod, o, h, l, c); nur vollstaendige Buckets (>=4 Bars)."""
        self.f5 = {}
        for d in self.dates:
            mods, o, c, lo, hi, v = self.days[d]; out = []; i = 0; n = len(mods)
            while i < n:
                s = mods[i] - mods[i] % 5; j = i
                while j < n and mods[j] < s + 5: j += 1
                if j - i >= 4: out.append((s, o[i], max(hi[i:j]), min(lo[i:j]), c[j-1]))
                i = j
            self.f5[d] = out
    def trend60(self, d, t):
        """Signierter Anteil (#up-#down)/12 der letzten 12 abgeschlossenen 5-min-Kerzen mit Start <= t-4."""
        f = self.f5[d]; starts = [x[0] for x in f] if not hasattr(self, "_st") or self._st[0] != d else self._st[1]
        self._st = (d, starts); k = bisect_right(starts, t - 4)
        sel = f[max(0, k-12):k]
        if len(sel) < 12: return None
        up = sum(1 for x in sel if x[4] > x[1]); dn = sum(1 for x in sel if x[4] < x[1]); return (up - dn) / 12
    def vwap_arrays(self, d):
        """Kumulative VWAP ab 09:30: liefert Funktion idx -> (vwap, sigma) fuer idx >= start."""
        mods, o, c, lo, hi, v = self.days[d]; a = bisect_left(mods, 570); cv = 0.0; cpv = 0.0; cppv = 0.0; out = {}
        for k in range(a, len(mods)):
            tp = (hi[k] + lo[k] + c[k]) / 3; w = v[k] if v[k] > 0 else 0.0
            cv += w; cpv += w * tp; cppv += w * tp * tp
            if cv > 0:
                vw = cpv / cv; var = max(cppv / cv - vw * vw, 0.0); out[k] = (vw, math.sqrt(var))
        return out

def simulate(mk, d, ei, dirn, entry, sl, tp, end=960):
    """Entry = Close Bar ei (Market). SL im Entry-Bar konservativ, TP erst ab Bar ei+1. SL vor TP. Ende: Close bei mods>=end."""
    mods, o, c, lo, hi, v = mk.days[d]; m = len(mods); sld = abs(entry - sl)
    if (dirn == "long" and lo[ei] <= sl) or (dirn == "short" and hi[ei] >= sl): return -sld, "SL", ei
    kk = ei + 1
    while kk < m and mods[kk] < end:
        if dirn == "long":
            if lo[kk] <= sl: return -sld, "SL", kk
            if hi[kk] >= tp: return abs(tp - entry), "TP", kk
        else:
            if hi[kk] >= sl: return -sld, "SL", kk
            if lo[kk] <= tp: return abs(tp - entry), "TP", kk
        kk += 1
    kk = min(kk, m - 1); res = (c[kk] - entry) if dirn == "long" else (entry - c[kk]); return res, "EOD", kk

def wr(rows):
    n = len(rows); return (sum(1 for r in rows if r["res"] > 0) / n * 100) if n else 0.0
def split(rows):
    return [r for r in rows if r["d"] < TEST_START], [r for r in rows if r["d"] >= TEST_START]
def stat_line(rows, mk):
    tr, te = split(rows)
    f = lambda x: f"N={len(x):4d} WR={wr(x):5.1f}% net={sum((r['res']-mk.cost)*mk.usd for r in x):+8.0f}" if x else "N=   0"
    return f"TRAIN {f(tr)} | TEST {f(te)}"
def write_csv(rows, mk, path):
    with open(path, "w", newline="") as f:
        w = csv.writer(f); w.writerow(["date", "dir", "entry_time", "entry", "sl", "tp", "result", "pnl_usd"])
        for r in sorted(rows, key=lambda r: (r["d"], r["t"])):
            w.writerow([r["d"].isoformat(), r["dir"], f"{r['t']//60:02d}:{r['t']%60:02d}", round(r["entry"], 2), round(r["sl"], 2),
                        round(r["tp"], 2), r["tag"], round((r["res"] - mk.cost) * mk.usd, 2)])
def years_pos(rows, mk):
    py = defaultdict(float)
    for r in rows: py[r["d"].year] += (r["res"] - mk.cost) * mk.usd
    return ", ".join(f"{y}:{'+' if py[y] > 0 else '-'}" for y in sorted(py))
