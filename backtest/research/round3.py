"""Runde 3: neue Dimensionen, alle mit RR 1:1 (TP = SL-Distanz), Auswertung bis 16:00, Entry-Bar nur SL, SL vor TP.
Familien:
 V  Sweep einer Zone + Volumen-Klimax (Sweep-Bar-Volumen >= k x Median der letzten 60 Bars) -> Reclaim-Entry
 W  VWAP-Band-Fade: Preis >= VWAP + k*sigma (RTH ab 10:00) und 1-min-Close zurueck unter Band -> Short (spiegelbildlich Long); SL = Extrem + buf
 X  Extension-Fade: Abstand vom RTH-Open >= k*ATR10 (Tages-ATR) nach 10:30 -> Reclaim-Entry gegen die Bewegung
 C  Close-Muster: 15:00-15:30-Range-Sweep + Reclaim -> TP 1R bis 16:00
 F  Trendtag-Filter fuer 08:12-Fade: nur wenn Range 09:30-10:00 < 0.5 x Zonen-Range... (Varianten)
"""
import sys, math, datetime as dt, statistics
from bisect import bisect_left
from collections import defaultdict
sys.path.insert(0, "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r3")
from load_vol import load_days_vol
DATA = sys.argv[1]; COST = float(sys.argv[2]); USD = float(sys.argv[3]); TAG = sys.argv[4]
days = load_days_vol(DATA); dates = sorted(days)

def exec_trade(day, ei, dirn, entry, sl, tp, end=960):
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
    return res, sld

def line(label, trades):
    n = len(trades)
    if n < 80: return None
    usd = [(r - COST) * USD for r, s in trades]
    xs = [(d, u) for (d, (r, s)), u in zip(trades_days[label], usd)] if False else None
    return None

results = []
def report(label, tr):  # tr: list of (day, res_pts, sld)
    n = len(tr)
    if n < 80: return
    usd = [(r - COST) * USD for _, r, _ in tr]; mean = sum(usd)/n
    sd = math.sqrt(sum((x-mean)**2 for x in usd)/(n-1)) or 1; t = mean/(sd/math.sqrt(n))
    wr = sum(1 for _, r, _ in tr if r > 0)/n*100
    trn = sum(u for (d, _, _), u in zip(tr, usd) if d < dt.date(2025,1,1)); tst = sum(u for (d, _, _), u in zip(tr, usd) if d >= dt.date(2025,1,1))
    ntr = sum(1 for d, _, _ in tr if d < dt.date(2025,1,1))
    wtr = sum(1 for d, r, _ in tr if d < dt.date(2025,1,1) and r > 0)/max(1,ntr)*100
    wts = sum(1 for d, r, _ in tr if d >= dt.date(2025,1,1) and r > 0)/max(1,n-ntr)*100
    results.append((label, n, wr, wtr, wts, t, trn, tst))
    print(f"{TAG} {label:48s} N={n:4d} WR={wr:5.1f}% (Train {wtr:4.1f}/Test {wts:4.1f}) t={t:5.2f} Train {trn:+7.0f} Test {tst:+7.0f}", flush=True)

def zone(d, a, b, cov=0.6):
    mods, o, c, lo, hi, v = days[d]; i = bisect_left(mods, a); j = bisect_left(mods, b)
    if j - i < (b - a) * cov: return None
    return max(hi[i:j]), min(lo[i:j]), i, j

# ---------- V: Sweep + Volumen-Klimax ----------
def fam_V(zs, ze, kvol, buf=0.1, need_climax=True):
    tr = []
    for d in dates:
        if d.weekday() >= 5: continue
        z = zone(d, zs, ze)
        if z is None: continue
        rh, rl, a, b = z; W = rh - rl
        if W <= 0: continue
        mods, o, c, lo, hi, v = days[d]; m = len(mods); j = b; dirn = None
        while j < m and mods[j] < 960:
            hh = hi[j] >= rh; hl = lo[j] <= rl
            if hh or hl:
                dirn = None if (hh and hl) else ("short" if hh else "long"); break
            j += 1
        if dirn is None: continue
        medv = statistics.median(v[max(0, j-60):j]) if j > 10 else 0
        climax = medv > 0 and v[j] >= kvol * medv
        if need_climax != climax: continue
        ext = hi[j] if dirn == "short" else lo[j]; k = j; ei = None
        while k < m and mods[k] - mods[j] <= 60:
            ext = max(ext, hi[k]) if dirn == "short" else min(ext, lo[k])
            if rl < c[k] < rh: ei = k; break
            k += 1
        if ei is None: continue
        entry = c[ei]; sl = ext + buf*W if dirn == "short" else ext - buf*W; sld = abs(entry-sl)
        if sld <= 0: continue
        tp = entry - sld if dirn == "short" else entry + sld
        r, s = exec_trade(d, ei, dirn, entry, sl, tp); tr.append((d, r, s))
    return tr

# ---------- W: VWAP-Band-Fade ----------
def fam_W(k_sig, t_from=600, buf_frac=0.25, tp_mode="r1"):
    tr = []
    for d in dates:
        if d.weekday() >= 5: continue
        mods, o, c, lo, hi, v = days[d]; m = len(mods); a = bisect_left(mods, 570)
        if m - a < 300 or a >= m or mods[a] != 570: continue
        pv = 0.0; vv = 0.0; pv2 = 0.0; taken = False; j = a
        while j < m and mods[j] < 960:
            tp_ = (hi[j]+lo[j]+c[j])/3; pv += tp_*v[j]; vv += v[j]; pv2 += tp_*tp_*v[j]
            if vv > 0 and mods[j] >= t_from and not taken and j > a + 30:
                vwap = pv/vv; sig = math.sqrt(max(0.0, pv2/vv - vwap*vwap))
                if sig <= 0: j += 1; continue
                up = vwap + k_sig*sig; dn = vwap - k_sig*sig
                # Bedingung: vorheriger Bar ueber Band, dieser Bar schliesst darunter (Rueckkehr)
                if j > a and hi[j-1] >= up and c[j] < up and c[j-1] >= up:
                    ext = max(hi[j-1], hi[j]); entry = c[j]; sl = ext + buf_frac*sig; sld = sl-entry
                    if sld > 0:
                        tp = entry - sld if tp_mode == "r1" else vwap
                        if tp < entry:
                            r, s = exec_trade(d, j, "short", entry, sl, tp); tr.append((d, r, s)); taken = True
                elif j > a and lo[j-1] <= dn and c[j] > dn and c[j-1] <= dn:
                    ext = min(lo[j-1], lo[j]); entry = c[j]; sl = ext - buf_frac*sig; sld = entry-sl
                    if sld > 0:
                        tp = entry + sld if tp_mode == "r1" else vwap
                        if tp > entry:
                            r, s = exec_trade(d, j, "long", entry, sl, tp); tr.append((d, r, s)); taken = True
            j += 1
    return tr

# ---------- X: Extension-Fade vom RTH-Open ----------
def fam_X(k_atr, t_from=630, buf=0.1):
    tr = []; hist = []
    for d in dates:
        if d.weekday() >= 5: continue
        z = zone(d, 570, 960, 0.6)
        atr = sum(hist[-10:])/len(hist[-10:]) if len(hist) >= 5 else None
        if z: hist.append(z[0]-z[1])
        if z is None or atr is None: continue
        mods, o, c, lo, hi, v = days[d]; m = len(mods); a = bisect_left(mods, 570)
        if a >= m or mods[a] != 570: continue
        op = o[a]; j = a; dirn = None
        while j < m and mods[j] < 900:
            if mods[j] >= t_from:
                if hi[j] - op >= k_atr*atr: dirn = "short"; break
                if op - lo[j] >= k_atr*atr: dirn = "long"; break
            j += 1
        if dirn is None: continue
        # Reclaim: Close wieder innerhalb des Extension-Levels (zurueck unter op + k*atr)
        lvl = op + k_atr*atr if dirn == "short" else op - k_atr*atr
        ext = hi[j] if dirn == "short" else lo[j]; k = j; ei = None
        while k < m and mods[k] - mods[j] <= 60 and mods[k] < 930:
            ext = max(ext, hi[k]) if dirn == "short" else min(ext, lo[k])
            if (dirn == "short" and c[k] < lvl) or (dirn == "long" and c[k] > lvl): ei = k; break
            k += 1
        if ei is None: continue
        entry = c[ei]; sl = ext + buf*atr if dirn == "short" else ext - buf*atr; sld = abs(entry-sl)
        if sld <= 0: continue
        tp = entry - sld if dirn == "short" else entry + sld
        r, s = exec_trade(d, ei, dirn, entry, sl, tp); tr.append((d, r, s))
    return tr

# ---------- C: Close-Session Sweep ----------
def fam_C(zs=900, ze=930, buf=0.1):
    tr = []
    for d in dates:
        if d.weekday() >= 5: continue
        z = zone(d, zs, ze, 0.8)
        if z is None: continue
        rh, rl, a, b = z; W = rh - rl
        if W <= 0: continue
        mods, o, c, lo, hi, v = days[d]; m = len(mods); j = b; dirn = None
        while j < m and mods[j] < 958:
            hh = hi[j] >= rh; hl = lo[j] <= rl
            if hh or hl:
                dirn = None if (hh and hl) else ("short" if hh else "long"); break
            j += 1
        if dirn is None: continue
        ext = hi[j] if dirn == "short" else lo[j]; k = j; ei = None
        while k < m and mods[k] < 958:
            ext = max(ext, hi[k]) if dirn == "short" else min(ext, lo[k])
            if rl < c[k] < rh: ei = k; break
            k += 1
        if ei is None: continue
        entry = c[ei]; sl = ext + buf*W if dirn == "short" else ext - buf*W; sld = abs(entry-sl)
        if sld <= 0: continue
        tp = entry - sld if dirn == "short" else entry + sld
        r, s = exec_trade(d, ei, dirn, entry, sl, tp, 960); tr.append((d, r, s))
    return tr

print(f"##### {TAG}: Runde 3 #####")
for zs, ze, zn in ((492, 552, "Z812"), (120, 300, "LON"), (570, 600, "OPEN"), (324, 339, "Z0524")):
    for kv in (2.0, 3.0):
        report(f"V {zn} Sweep+Vol>={kv}x Reclaim 1R", fam_V(zs, ze, kv, need_climax=True))
    report(f"V {zn} Sweep OHNE Klimax(<2x) Reclaim 1R", fam_V(zs, ze, 2.0, need_climax=False))
for ks in (1.5, 2.0, 2.5, 3.0):
    report(f"W VWAP {ks}sig Rueckkehr, SL Extrem+0.25sig, TP 1R", fam_W(ks))
    report(f"W VWAP {ks}sig Rueckkehr, TP VWAP", fam_W(ks, tp_mode="vwap"))
for ka in (0.75, 1.0, 1.25, 1.5):
    report(f"X Extension {ka}xATR vom Open, Reclaim 1R", fam_X(ka))
report("C Close-Sweep 15:00-15:30 Reclaim 1R", fam_C())
report("C Close-Sweep 14:30-15:00 Reclaim 1R", fam_C(870, 900))
print(f"\n{TAG}: {len(results)} Varianten. Top nach Train-WR bei RR 1:1:")
for r in sorted(results, key=lambda x: -x[3])[:8]:
    print(f"   {r[0]:48s} N={r[1]} WR {r[2]:.1f} (Train {r[3]:.1f} / Test {r[4]:.1f}) t={r[5]:.2f}")
