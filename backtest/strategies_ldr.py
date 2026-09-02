"""STRATEGIE-KANDIDAT 1: NQ "London Down-Day Reclaim" (LDR)
Regeln (alle Zeiten New York):
 1. Vortag (RTH 09:30-16:00) Close-zu-Close <= -0.3 x ATR10 (Tagesrange-Durchschnitt der letzten 10 Handelstage).
 2. London-Range = Hoch/Tief 02:00-04:59.
 3. Ab 05:00: erster 1-min-Bar, der eine Range-Seite bricht (beide im selben Bar -> kein Trade). Sweep unten -> Long-Setup, oben -> Short.
 4. Reclaim: erster 1-min-Close zurueck innerhalb der Range binnen 120 min, dessen Kerzenkoerper >= BODY x Kerzenrange ist
    (Koerper des Reclaim-Bars). Entry = Close dieses Bars (Market).
 5. SL = Sweep-Extrem (tiefstes Tief / hoechstes Hoch seit Bruch) +/- 0.1 x Range-Breite. TP = Entry +/- TP_MULT x SL-Distanz.
 6. Auswertung bis 16:00 (Rest wird zum Close glattgestellt). Ein Trade pro Tag.
Aufruf: python strategies_ldr.py <data_dir> [body=0.75] [tp_mult=1.0] [out_csv]
"""
import csv, sys, math, datetime as dt
from bisect import bisect_left
from collections import defaultdict
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sweep_reclaim_backtest import load_days

PT = -0.3; COST = 0.75; USD = 20.0

def run(days, body_thr=0.75, tp_mult=1.0, buf=0.1, zs=120, ze=300, start_min=300, max_wait=120, end=960):
    dates = sorted(days)
    def zone(d, a, b, cov):
        mods, o, c, lo, hi = days[d]; i = bisect_left(mods, a); j = bisect_left(mods, b)
        if j - i < (b - a) * cov: return None
        return max(hi[i:j]), min(lo[i:j]), i, j
    rth = {}; hist = []
    for d in dates:
        if d.weekday() >= 5: continue
        z = zone(d, 570, 960, 0.6)
        if z:
            rth[d] = (z[0], z[1], days[d][2][z[3]-1]); hist.append(d)
    prev = {hist[i]: hist[i-1] for i in range(1, len(hist))}
    atr = {hist[i]: sum(rth[hist[i-k]][0]-rth[hist[i-k]][1] for k in range(1, 11))/10 for i in range(10, len(hist))}
    trades = []
    for d in dates:
        if d.weekday() >= 5 or d not in atr or d not in prev: continue
        pd_ = prev[d]
        if pd_ not in prev: continue
        prev_trend = (rth[pd_][2] - rth[prev[pd_]][2]) / atr[d]
        if prev_trend >= PT: continue
        z = zone(d, zs, ze, 0.87)
        if z is None: continue
        rh, rl, a, b = z; W = rh - rl
        if W <= 0: continue
        mods, o, c, lo, hi = days[d]; m = len(mods); j = bisect_left(mods, start_min); dirn = None
        while j < m and mods[j] < end:
            hh = hi[j] >= rh; hl = lo[j] <= rl
            if hh or hl:
                dirn = None if (hh and hl) else ("short" if hh else "long"); break
            j += 1
        if dirn is None: continue
        ext = hi[j] if dirn == "short" else lo[j]; k = j; ei = None
        while k < m and mods[k] - mods[j] <= max_wait and mods[k] < end:
            ext = max(ext, hi[k]) if dirn == "short" else min(ext, lo[k])
            if rl < c[k] < rh:
                body = abs(c[k]-o[k]) / (hi[k]-lo[k]) if hi[k] > lo[k] else 0
                if body >= body_thr: ei = k
                break   # erster Close in der Range entscheidet (kein Warten auf spaetere Kerze)
            k += 1
        if ei is None: continue
        entry = c[ei]; sl = ext + buf*W if dirn == "short" else ext - buf*W; sld = abs(entry - sl)
        if sld <= 0: continue
        tp = entry - tp_mult*sld if dirn == "short" else entry + tp_mult*sld; res = None; xt = None
        if (dirn == "long" and lo[ei] <= sl) or (dirn == "short" and hi[ei] >= sl): res, xt = -sld, mods[ei]
        kk = ei + 1
        while res is None and kk < m and mods[kk] < end:
            if dirn == "long":
                if lo[kk] <= sl: res = -sld; break
                if hi[kk] >= tp: res = tp_mult*sld; break
            else:
                if hi[kk] >= sl: res = -sld; break
                if lo[kk] <= tp: res = tp_mult*sld; break
            kk += 1
        if res is None:
            kk = min(kk, m-1); res = (c[kk]-entry) if dirn == "long" else (entry-c[kk]); tag = "EOD"
        else: tag = "TP" if res > 0 else "SL"
        xt = xt if xt is not None else mods[kk]
        trades.append(dict(date=d.isoformat(), dir=dirn, sweep_time=f"{mods[j]//60:02d}:{mods[j]%60:02d}",
                           entry_time=f"{mods[ei]//60:02d}:{mods[ei]%60:02d}", exit_time=f"{xt//60:02d}:{xt%60:02d}",
                           range_high=round(rh, 2), range_low=round(rl, 2), entry=round(entry, 2), sl=round(sl, 2), tp=round(tp, 2),
                           sl_pts=round(sld, 2), result=tag, pnl_pts=round(res, 2), pnl_usd_1nq=round((res - COST) * USD, 2),
                           prev_trend_atr=round(prev_trend, 2)))
    return trades

def summary(trades):
    n = len(trades); wins = sum(1 for t in trades if t["pnl_pts"] > 0)
    usd = [t["pnl_usd_1nq"] for t in trades]; mean = sum(usd)/n
    sd = math.sqrt(sum((x-mean)**2 for x in usd)/(n-1)); t = mean/(sd/math.sqrt(n))
    py = defaultdict(lambda: [0, 0, 0.0])
    for tr in trades:
        y = tr["date"][:4]; py[y][0] += 1; py[y][1] += tr["pnl_pts"] > 0; py[y][2] += tr["pnl_usd_1nq"]
    print(f"Trades {n} | WR {wins/n*100:.1f}% | Ø {mean:+.0f}$ (1 NQ) | t={t:.2f} | Netto {sum(usd):+,.0f}$ | Median SL {sorted(t_['sl_pts'] for t_ in trades)[n//2]:.1f} Pkt")
    for y in sorted(py): print(f"  {y}: {py[y][0]} Trades, WR {py[y][1]/py[y][0]*100:.0f}%, {py[y][2]:+,.0f}$")
    tr_ = [t_ for t_ in trades if t_["date"] < "2025"]; te = [t_ for t_ in trades if t_["date"] >= "2025"]
    print(f"  Train: {len(tr_)} Trades WR {sum(1 for t_ in tr_ if t_['pnl_pts']>0)/len(tr_)*100:.1f}% | Test: {len(te)} Trades WR {sum(1 for t_ in te if t_['pnl_pts']>0)/len(te)*100:.1f}%")

if __name__ == "__main__":
    days = load_days(sys.argv[1]); body = float(sys.argv[2]) if len(sys.argv) > 2 else 0.75
    tpm = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0; out = sys.argv[4] if len(sys.argv) > 4 else "ldr_trades.csv"
    trades = run(days, body, tpm)
    print(f"LDR body>={body} TP {tpm}R:"); summary(trades)
    with open(out, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(trades[0].keys())); w.writeheader(); w.writerows(trades)
