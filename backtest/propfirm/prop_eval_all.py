"""Alle bisherigen Strategien durch die Prop-Firm-Linse (Lucid 50K Flex/Daily).
Sizing: Micros (2 $/Pkt NQ), max 40; Kontrakte = min(40, floor(1850 / (SL_pts*2))); Trades mit 1 Micro > 2.000 $ Risiko werden ausgelassen.
Tages-P&L = Summe der Trades des Tages (nach Kosten 0.75 Pkt je Micro-Roundtrip... Kosten: 1.5 $/Micro (Komm.) + Spread 0.5 Pkt*2$ = ~2.5 $/Micro).
Bootstrap: Sim-Tag = zufaelliger Handelstag aus der Strategie-Historie (nur Tage mit Trade).
"""
import sys, random, datetime as dt
from bisect import bisect_left
from collections import defaultdict
sys.path.insert(0, "/home/user/Florian/backtest"); sys.path.insert(0, "/home/user/Florian/backtest/propfirm")
from sweep_reclaim_backtest import load_days
from sweep_confirm_backtest import simulate as sc_simulate
from lucid_mc2 import sim
from lucid_flex_mc import summarize

DATA = "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/data"
days = load_days(DATA); dates = sorted(days)
USD_MICRO = 2.0; COST_MICRO = 2.5; TARGET_RISK = 1850.0; MAX_MICRO = 40

def size(sl_pts):
    if sl_pts <= 0: return 0
    n = int(TARGET_RISK // (sl_pts * USD_MICRO))
    n = min(MAX_MICRO, n)
    if n < 1: return 0
    return n

def to_daily(trades):
    """trades: list of (day, pts, sl_pts) -> dict day -> pnl_usd"""
    daily = defaultdict(float)
    for d, pts, sl in trades:
        n = size(sl)
        if n == 0: continue
        daily[d] += pts * USD_MICRO * n - COST_MICRO * n
    return daily

def rng_of(d, a_min, b_min, cov=0.6):
    mods, o, c, lo, hi = days[d]
    a = bisect_left(mods, a_min); b = bisect_left(mods, b_min)
    if b - a < (b_min - a_min) * cov: return None
    return max(hi[a:b]), min(lo[a:b]), a, b

# ---- Strategie 1: Zone-Fade an der Linie ----
def zone_fade(zs, ze, sl_mult, tp_mode="other", end=960, day_filter=None):
    out = []
    rth_hist = []
    for d in dates:
        if d.weekday() >= 5: continue
        r = rng_of(d, zs, ze); rr = rng_of(d, 570, 960)
        atr = sum(rth_hist[-10:]) / len(rth_hist[-10:]) if len(rth_hist) >= 5 else None
        if rr: rth_hist.append(rr[0]-rr[1])
        if r is None: continue
        rh, rl, a, b = r; W = rh - rl
        if W <= 0: continue
        if day_filter is not None:
            on = rng_of(d, 0, zs)
            if not day_filter(d, W, atr, on): continue
        mods, o, c, lo, hi = days[d]; m = len(mods); j = b; dirn = None
        while j < m and mods[j] < end:
            hh = hi[j] >= rh; hl = lo[j] <= rl
            if hh or hl:
                dirn = None if (hh and hl) else ("short" if hh else "long"); break
            j += 1
        if dirn is None: continue
        entry = rh if dirn == "short" else rl
        sl = entry + sl_mult*W if dirn == "short" else entry - sl_mult*W
        tp = (rl if dirn == "short" else rh) if tp_mode == "other" else (entry - tp_mode*W if dirn == "short" else entry + tp_mode*W)
        sld = sl_mult*W; tpd = abs(tp-entry); res = None
        if (dirn == "long" and lo[j] <= sl) or (dirn == "short" and hi[j] >= sl): res = -sld
        k = j + 1
        while res is None and k < m and mods[k] < end:
            if dirn == "long":
                if lo[k] <= sl: res = -sld; break
                if hi[k] >= tp: res = tpd; break
            else:
                if hi[k] >= sl: res = -sld; break
                if lo[k] <= tp: res = tpd; break
            k += 1
        if res is None:
            k = min(k, m-1); res = (c[k]-entry) if dirn == "long" else (entry-c[k])
        out.append((d, res, sld))
    return out

# ---- Strategie 2: London-Range Sweep + Reclaim TP 1R ----
def london_reclaim(rs=120, re=300, buf=0.1, tp_mult=1.0, max_wait=120, end_min=970):
    out = []
    for d in dates:
        if d.weekday() >= 5: continue
        r = rng_of(d, rs, re, 0.87)
        if r is None: continue
        rh, rl, a, b = r; W = rh - rl
        if W <= 0: continue
        mods, o, c, lo, hi = days[d]; m = len(mods); j = b; dirn = None
        while j < m and mods[j] < end_min:
            hh = hi[j] >= rh; hl = lo[j] <= rl
            if hh or hl:
                dirn = None if (hh and hl) else ("long" if hl else "short"); break
            j += 1
        if dirn is None: continue
        ext = lo[j] if dirn == "long" else hi[j]; t0 = mods[j]; ei = None
        while j < m and mods[j] - t0 <= max_wait and mods[j] < end_min:
            ext = min(ext, lo[j]) if dirn == "long" else max(ext, hi[j])
            if rl < c[j] < rh: ei = j; break
            j += 1
        if ei is None: continue
        entry = c[ei]; sl = ext - buf*W if dirn == "long" else ext + buf*W; sld = abs(entry - sl)
        if sld <= 0: continue
        tp = entry + tp_mult*sld if dirn == "long" else entry - tp_mult*sld; res = None
        if (dirn == "long" and lo[ei] <= sl) or (dirn == "short" and hi[ei] >= sl): res = -sld
        k = ei + 1
        while res is None and k < m and mods[k] < end_min:
            if dirn == "long":
                if lo[k] <= sl: res = -sld; break
                if hi[k] >= tp: res = tp_mult*sld; break
            else:
                if hi[k] >= sl: res = -sld; break
                if lo[k] <= tp: res = tp_mult*sld; break
            k += 1
        if res is None:
            k = min(k, m-1); res = (c[k]-entry) if dirn == "long" else (entry-c[k])
        out.append((d, res, sld))
    return out

# ---- Strategie 3: Gap-Fade + OR15 ----
def gap_fade(gap_thr=0.3, or_len=15, exit_min=720):
    def is_td(d):
        mods, o, c, lo, hi = days[d]
        if d.weekday() >= 5: return False
        a = bisect_left(mods, 570); b = bisect_left(mods, 960)
        if b - a < 300: return False
        return sum(1 for i in range(a, b) if hi[i] == lo[i]) < 30
    tdays = [d for d in dates if is_td(d)]
    rr_ = {}
    for d in tdays:
        mods, o, c, lo, hi = days[d]; a = bisect_left(mods, 570); b = bisect_left(mods, 960); rr_[d] = max(hi[a:b]) - min(lo[a:b])
    out = []
    for idx in range(11, len(tdays)):
        d = tdays[idx]; prev = tdays[idx-1]; atr = sum(rr_[tdays[idx-k]] for k in range(1, 11)) / 10
        pm, po, pc, plo, phi = days[prev]; pb = bisect_left(pm, 959)
        if pb >= len(pm) or pm[pb] != 959: continue
        prev_close = pc[pb]; mods, o, c, lo, hi = days[d]; a = bisect_left(mods, 570)
        if a >= len(mods) or mods[a] != 570: continue
        gap = o[a] - prev_close
        if abs(gap) < gap_thr * atr: continue
        b = bisect_left(mods, 570 + or_len); orh = max(hi[a:b]); orl = min(lo[a:b])
        dirn = "short" if gap > 0 else "long"; m = len(mods); j = b; ei = None
        while j < m and mods[j] < exit_min:
            if dirn == "short" and c[j] < orl: ei = j; break
            if dirn == "long" and c[j] > orh: ei = j; break
            j += 1
        if ei is None: continue
        entry = c[ei]; sl = orh if dirn == "short" else orl; tp = prev_close
        if (dirn == "short" and tp >= entry) or (dirn == "long" and tp <= entry): continue
        sld = abs(entry - sl); res = None
        if (dirn == "long" and lo[ei] <= sl) or (dirn == "short" and hi[ei] >= sl): res = -sld
        k = ei + 1
        while res is None and k < m and mods[k] < exit_min:
            if dirn == "long":
                if lo[k] <= sl: res = -sld; break
                if hi[k] >= tp: res = tp - entry; break
            else:
                if hi[k] >= sl: res = -sld; break
                if lo[k] <= tp: res = entry - tp; break
            k += 1
        if res is None:
            k = min(k, m-1); res = (c[k]-entry) if dirn == "long" else (entry-c[k])
        out.append((d, res, sld))
    return out

def sc(start, dur, em, tm):
    return [(t["day"], t["r"] * t["sl_pts"], t["sl_pts"]) for t in sc_simulate(days, start, dur, em, tm, 0.1)]

STRATS = {
  "Zone 08:12-09:12 Fade, TP Gegenseite, SL 1W (RR1:1)": lambda: zone_fade(492, 552, 1.0),
  "Zone 08:12-09:12 Fade, TP Gegenseite, SL 1.5W": lambda: zone_fade(492, 552, 1.5),
  "Zone 08:12-09:12 Fade, TP Mitte, SL 1W (RR1:0.5)": lambda: zone_fade(492, 552, 1.0, 0.5),
  "Zone 06:20-06:35 Fade, TP Gegenseite, SL 1.05W (RR1:0.95)": lambda: zone_fade(380, 395, 1.0/0.95),
  "Midday 11:12 Fade, TP 0.25W, SL 1W (RR1:0.25)": lambda: zone_fade(672, 687, 1.0, 0.25),
  "Zone 05:24-05:39 Fade RR1:1": lambda: zone_fade(324, 339, 1.0),
  "Kompressions-Fade 08:12 (ON/W>=3), RR1:1": lambda: zone_fade(492, 552, 1.0, "other", 960, lambda d, W, atr, on: on is not None and (on[0]-on[1])/W >= 3),
  "London 02-05 Sweep+Reclaim TP 1R": lambda: london_reclaim(),
  "London 02-05 Sweep+Reclaim TP 1.5R": lambda: london_reclaim(tp_mult=1.5),
  "Gap>=0.3ATR + OR15 Fade -> PDC": lambda: gap_fade(),
  "OTE 05:24 TP mid": lambda: sc(324, 15, "ote", "mid"),
  "OTE 08:12 TP mid": lambda: sc(492, 60, "ote", "mid"),
  "iFVG 11:12 TP mid": lambda: sc(672, 15, "ifvg", "mid"),
  "MSS 06:20 TP r1": lambda: sc(380, 15, "mss", "r1"),
}

if __name__ == "__main__":
  random.seed(5); N = int(sys.argv[1]) if len(sys.argv) > 1 else 15000
  print(f"{'Strategie':58s} {'Tage':>5} {'Ø$/Tag':>7} {'WR%':>5} {'ØRisk$':>7} | Flex: Pass / >=1Pay / E[$] / ROI | Daily: >=1Pay / E[$] / ROI")
  rows = []
  for name, fn in STRATS.items():
      trades = fn()
      daily = to_daily(trades)
      if len(daily) < 100:
          print(f"{name:58s} zu wenig Tage ({len(daily)})"); continue
      vals = list(daily.values()); wr = sum(1 for v in vals if v > 0) / len(vals) * 100
      risks = [size(sl) * sl * USD_MICRO for _, _, sl in trades if size(sl) > 0]
      avg_risk = sum(risks) / len(risks)
      def day_fn(rng, st, vals=vals): return [rng.choice(vals)]
      fee = 136.0
      resF = [sim(day_fn, fee, "flex", "eod") for _ in range(N)]
      resD = [sim(day_fn, fee, "daily", "intraday") for _ in range(N)]
      def agg(res):
          n = len(res); return (sum(1 for r in res if r["passed"])/n*100, sum(1 for r in res if r["payouts"] > 0)/n*100, sum(r["payouts"] for r in res)/n)
      pF, aF, eF = agg(resF); pD, aD, eD = agg(resD)
      rows.append((name, len(vals), sum(vals)/len(vals), wr, avg_risk, pF, aF, eF, (eF-fee)/fee*100, aD, eD, (eD-fee)/fee*100))
      r = rows[-1]
      print(f"{r[0]:58s} {r[1]:5d} {r[2]:+7.0f} {r[3]:5.1f} {r[4]:7.0f} | {r[5]:4.1f}% / {r[6]:4.1f}% / {r[7]:5.0f}$ / {r[8]:+5.0f}% | {r[9]:4.1f}% / {r[10]:5.0f}$ / {r[11]:+5.0f}%", flush=True)
  print("\n=== Ranking nach Flex-ROI ===")
  for r in sorted(rows, key=lambda x: -x[8]):
      print(f"  {r[8]:+5.0f}% Flex | {r[11]:+5.0f}% Daily | {r[0]}")
