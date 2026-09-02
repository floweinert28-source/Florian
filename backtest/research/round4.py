"""Runde 4: (S) SMT-Divergenz NQ vs ES am Zonen-Sweep (ICT), (N) News-Bar-Erkennung 08:30/10:00 aus Range+Volumen,
(D) Multi-Tages-Kontext (Inside-Day, NR7, 3 gleiche Tage). Alles RR 1:1, Entry-Bar nur SL, SL vor TP, bis 16:00.
"""
import sys, math, datetime as dt, statistics
from bisect import bisect_left
from collections import defaultdict
sys.path.insert(0, "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r3")
from load_vol import load_days_vol
SP = "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad"
NQ = load_days_vol(SP + "/data"); ES = load_days_vol(SP + "/data_es")
COST = {"NQ": 0.75, "ES": 0.4}; USD = {"NQ": 20, "ES": 50}
def exec_trade(days, day, ei, dirn, entry, sl, tp, end=960):
    mods, o, c, lo, hi, v = days[day]; m = len(mods); sld = abs(entry-sl); tpd = abs(tp-entry); res = None
    if (dirn == "long" and lo[ei] <= sl) or (dirn == "short" and hi[ei] >= sl): res = -sld
    k = ei + 1
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
    return res
def report(tag, label, tr):
    n = len(tr)
    if n < 60: print(f"{tag} {label:52s} zu wenig ({n})"); return
    usd = [(r - COST[tag]) * USD[tag] for _, r in tr]; mean = sum(usd)/n
    sd = math.sqrt(sum((x-mean)**2 for x in usd)/(n-1)) or 1; t = mean/(sd/math.sqrt(n))
    wr = sum(1 for _, r in tr if r > 0)/n*100
    trn = [u for (d, _), u in zip(tr, usd) if d < dt.date(2025,1,1)]; tst = [u for (d, _), u in zip(tr, usd) if d >= dt.date(2025,1,1)]
    wtr = sum(1 for d, r in tr if d < dt.date(2025,1,1) and r > 0)/max(1,len(trn))*100
    wts = sum(1 for d, r in tr if d >= dt.date(2025,1,1) and r > 0)/max(1,len(tst))*100
    print(f"{tag} {label:52s} N={n:4d} WR={wr:5.1f}% (Train {wtr:4.1f}/Test {wts:4.1f}) t={t:5.2f} Train {sum(trn):+7.0f} Test {sum(tst):+7.0f}", flush=True)
def zone(days, d, a, b, cov=0.6):
    mods, o, c, lo, hi, v = days[d]; i = bisect_left(mods, a); j = bisect_left(mods, b)
    if j - i < (b - a) * cov: return None
    return max(hi[i:j]), min(lo[i:j]), i, j

# ---------- S: SMT-Divergenz ----------
def fam_S(zs, ze, mode="div", buf=0.1, trade_on="NQ"):
    """Sweep der Zone im Trade-Instrument; SMT = das andere Instrument hat seine Zonenseite NICHT gebrochen (bis zum Reclaim-Bar)."""
    A = NQ if trade_on == "NQ" else ES; B = ES if trade_on == "NQ" else NQ
    tr = []
    for d in sorted(set(A) & set(B)):
        if d.weekday() >= 5: continue
        za = zone(A, d, zs, ze); zb = zone(B, d, zs, ze)
        if za is None or zb is None: continue
        rh, rl, a, b = za; W = rh - rl; bh, bl, _, _ = zb
        if W <= 0: continue
        mods, o, c, lo, hi, v = A[d]; m = len(mods); j = b; dirn = None
        while j < m and mods[j] < 960:
            hh = hi[j] >= rh; hl = lo[j] <= rl
            if hh or hl:
                dirn = None if (hh and hl) else ("short" if hh else "long"); break
            j += 1
        if dirn is None: continue
        ext = hi[j] if dirn == "short" else lo[j]; k = j; ei = None
        while k < m and mods[k] - mods[j] <= 60:
            ext = max(ext, hi[k]) if dirn == "short" else min(ext, lo[k])
            if rl < c[k] < rh: ei = k; break
            k += 1
        if ei is None: continue
        # SMT-Check: B bis Minute mods[ei]
        mb, ob, cb, lob, hib, vb = B[d]; ib = bisect_left(mb, mods[b]); ie = bisect_left(mb, mods[ei]+1)
        if ie <= ib: continue
        b_broke = (max(hib[ib:ie]) >= bh) if dirn == "short" else (min(lob[ib:ie]) <= bl)
        if mode == "div" and b_broke: continue
        if mode == "conf" and not b_broke: continue
        entry = c[ei]; sl = ext + buf*W if dirn == "short" else ext - buf*W; sld = abs(entry-sl)
        if sld <= 0: continue
        tp = entry - sld if dirn == "short" else entry + sld
        tr.append((d, exec_trade(A, d, ei, dirn, entry, sl, tp)))
    return tr

# ---------- N: News-Bar 08:30 / 10:00 ----------
def fam_N(days, tag, t_news=510, k_range=3.0, mode="cont", wait=5):
    """News-Bar = Bar bei t_news mit Range >= k x Median-Range der letzten 60 Bars. mode 'cont': Entry in Richtung des
    News-Bars am Close des Bars t_news+wait, SL = Gegenseite des News-Bars, TP 1R. mode 'fade': gegen die Richtung."""
    tr = []
    for d in sorted(days):
        if d.weekday() >= 5: continue
        mods, o, c, lo, hi, v = days[d]; i = bisect_left(mods, t_news)
        if i >= len(mods) or mods[i] != t_news or i < 60: continue
        med = statistics.median(hi[k]-lo[k] for k in range(i-60, i) if hi[k] != lo[k]) if any(hi[k] != lo[k] for k in range(i-60, i)) else 0
        R = hi[i]-lo[i]
        if med <= 0 or R < k_range*med: continue
        up = c[i] > o[i]
        ei = i + wait
        if ei >= len(mods): continue
        entry = c[ei]
        if mode == "cont":
            dirn = "long" if up else "short"; sl = lo[i] if up else hi[i]
        else:
            dirn = "short" if up else "long"; sl = hi[i] if up else lo[i]
        sld = abs(entry - sl)
        if sld <= 0 or (dirn == "long" and entry <= sl) or (dirn == "short" and entry >= sl): continue
        tp = entry + sld if dirn == "long" else entry - sld
        tr.append((d, exec_trade(days, d, ei, dirn, entry, sl, tp)))
    return tr

# ---------- D: Multi-Tages-Kontext auf 08:12-Fade / Open-Breakout ----------
def fam_D(days, tag, ctx, setup="fade"):
    tr = []; hist = []  # (date, high, low, close)
    for d in sorted(days):
        if d.weekday() >= 5: continue
        z = zone(days, d, 570, 960)
        cur = None
        if z:
            mods, o, c, lo, hi, v = days[d]; cur = (d, z[0], z[1], c[z[3]-1])
        ok = False
        if len(hist) >= 7:
            (pd_, ph, pl, pc), (qd, qh, ql, qc) = hist[-1], hist[-2]
            rng7 = [h - l for _, h, l, _ in hist[-7:]]
            if ctx == "inside": ok = ph < qh and pl > ql
            elif ctx == "nr7": ok = (ph - pl) == min(rng7)
            elif ctx == "3up": ok = all(hist[-k][3] > hist[-k-1][3] for k in (1, 2, 3))
            elif ctx == "3down": ok = all(hist[-k][3] < hist[-k-1][3] for k in (1, 2, 3))
            elif ctx == "wide": ok = (ph - pl) == max(rng7)
        if cur: hist.append(cur)
        if not ok or cur is None: continue
        zz = zone(days, d, 492, 552)
        if zz is None: continue
        rh, rl, a, b = zz; W = rh - rl
        if W <= 0: continue
        mods, o, c, lo, hi, v = days[d]; m = len(mods); j = b; dirn = None
        while j < m and mods[j] < 960:
            hh = hi[j] >= rh; hl = lo[j] <= rl
            if hh or hl:
                dirn = None if (hh and hl) else ("short" if hh else "long"); break
            j += 1
        if dirn is None: continue
        if setup == "fade":
            entry = rh if dirn == "short" else rl; sl = entry + W if dirn == "short" else entry - W
            tp = entry - W if dirn == "short" else entry + W
        else:  # breakout continuation
            dirn = "long" if dirn == "short" else "short"
            entry = rh if dirn == "long" else rl; sl = rl if dirn == "long" else rh
            tp = entry + W if dirn == "long" else entry - W
        tr.append((d, exec_trade(days, d, j, dirn, entry, sl, tp)))
    return tr

print("##### Runde 4 #####")
for zs, ze, zn in ((492, 552, "Z812"), (120, 300, "LON"), (570, 600, "OPEN"), (300, 480, "PRE")):
    for inst in ("NQ", "ES"):
        report(inst, f"S SMT-Divergenz {zn} Reclaim 1R", fam_S(zs, ze, "div", trade_on=inst))
        report(inst, f"S SMT-Bestaetigt(beide brechen) {zn} 1R", fam_S(zs, ze, "conf", trade_on=inst))
for inst, days in (("NQ", NQ), ("ES", ES)):
    for t_news, nm in ((510, "08:30"), (600, "10:00"), (840, "14:00")):
        for kr in (3.0, 5.0):
            for mode in ("cont", "fade"):
                report(inst, f"N News {nm} Range>={kr}x {mode} (Entry +5min) 1R", fam_N(days, inst, t_news, kr, mode))
    for ctx in ("inside", "nr7", "3up", "3down", "wide"):
        for setup in ("fade", "break"):
            report(inst, f"D Kontext {ctx} -> 08:12 {setup} 1R", fam_D(days, inst, ctx, setup))
