"""PDH/PDL / Vortages-Close / Midnight-Open: Turtle-Soup-Logik.
Level L (PDH, PDL, PDC=Vortages-RTH-Close, MO=00:00-Open). Sweep = echte Kreuzung (Vor-Bar-Close diesseits, Bar handelt jenseits)
in Fenster F (09:30-11:00 / 09:30-12:00 / 02:00-05:00 / 07:00-09:30). Entry-Varianten:
  "reclaim": erster Close zurueck diesseits des Levels (max 60 min) -> Entry Close, SL = Sweep-Extrem -/+ 0.1*ATR10, TP = r1/r2 oder Gegenlevel (PDL bei PDH-Sweep).
  "limit":   Limit direkt am Level beim Sweep (Fill = Touch), SL 0.5*ATR10, TP 1R.
Premium/Discount-Filter: Longs nur wenn Sweep-Level unter 50% der Vortages-Range... (Variante "pd").
Kosten/USD per Argument. Train <2025 / Test >=2025. Nur Handelstage mit RTH-Daten.
"""
import sys, datetime as dt, math
from bisect import bisect_left
from collections import defaultdict
sys.path.insert(0, "/home/user/Florian/backtest")
from sweep_reclaim_backtest import load_days
DATA = sys.argv[1]; COST = float(sys.argv[2]); USD = float(sys.argv[3])
days = load_days(DATA); dates = sorted(days)

def rth(d):
    mods, o, c, lo, hi = days[d]
    a = bisect_left(mods, 570); b = bisect_left(mods, 960)
    if b - a < 300: return None
    flat = sum(1 for i in range(a, b) if hi[i] == lo[i])
    if flat > 30: return None
    return max(hi[a:b]), min(lo[a:b]), c[b-1]

tdays = [d for d in dates if d.weekday() < 5 and rth(d)]
info = {d: rth(d) for d in tdays}
atr = {}
for i, d in enumerate(tdays):
    if i >= 10: atr[d] = sum(info[tdays[i-k]][0]-info[tdays[i-k]][1] for k in range(1, 11))/10

def run(level_name, win, entry_mode, tp_mode, pd_filter=False):
    trades = []
    for i in range(11, len(tdays)):
        d = tdays[i]; prev = tdays[i-1]
        pdh, pdl, pdc = info[prev]; A = atr[d]
        mods, o, c, lo, hi = days[d]; m = len(mods)
        a0 = bisect_left(mods, 0)
        mo = o[a0] if a0 < m and mods[a0] == 0 else None
        L = {"PDH": pdh, "PDL": pdl, "PDC": pdc, "MO": mo}[level_name]
        if L is None: continue
        wa, wb = win
        j = bisect_left(mods, wa); dirn = None
        while j < m and mods[j] < wb:
            if j == 0: j += 1; continue
            # Sweep nach oben ueber L -> Short; nach unten unter L -> Long
            if c[j-1] < L <= hi[j]: dirn = "short"; break
            if c[j-1] > L >= lo[j]: dirn = "long"; break
            j += 1
        if dirn is None: continue
        if pd_filter:
            mid = (pdh + pdl) / 2
            if dirn == "long" and L > mid: continue
            if dirn == "short" and L < mid: continue
        ext = hi[j] if dirn == "short" else lo[j]
        if entry_mode == "reclaim":
            k = j; ei = None
            while k < m and mods[k] - mods[j] <= 60:
                ext = max(ext, hi[k]) if dirn == "short" else min(ext, lo[k])
                if (dirn == "short" and c[k] < L) or (dirn == "long" and c[k] > L): ei = k; break
                k += 1
            if ei is None: continue
            entry = c[ei]; sl = ext + 0.1*A if dirn == "short" else ext - 0.1*A
        else:
            ei = j; entry = L; sl = L + 0.5*A if dirn == "short" else L - 0.5*A
        sld = abs(entry - sl)
        if sld <= 0: continue
        if tp_mode == "r1": tp = entry - sld if dirn == "short" else entry + sld
        elif tp_mode == "r2": tp = entry - 2*sld if dirn == "short" else entry + 2*sld
        else:  # opposite level
            tp = pdl if dirn == "short" else pdh
            if (dirn == "short" and tp >= entry) or (dirn == "long" and tp <= entry): continue
        tpd = abs(tp - entry); res = None
        if (dirn == "long" and lo[ei] <= sl) or (dirn == "short" and hi[ei] >= sl): res = -sld
        k = ei + 1
        while res is None and k < m and mods[k] < 960:
            if dirn == "long":
                if lo[k] <= sl: res = -sld; break
                if hi[k] >= tp: res = tpd; break
            else:
                if hi[k] >= sl: res = -sld; break
                if lo[k] <= tp: res = tpd; break
            k += 1
        if res is None:
            k = min(k, m-1); res = (c[k]-entry) if dirn == "long" else (entry-c[k])
        trades.append(dict(day=d, usd=(res-COST)*USD, rr=tpd/sld))
    return trades

def line(label, trades):
    n = len(trades)
    if n < 150: return
    xs = [t["usd"] for t in trades]; mean = sum(xs)/n
    sd = math.sqrt(sum((x-mean)**2 for x in xs)/(n-1)) or 1; t = mean/(sd/math.sqrt(n))
    tr = sum(t_["usd"] for t_ in trades if t_["day"] < dt.date(2025,1,1)); te = sum(t_["usd"] for t_ in trades if t_["day"] >= dt.date(2025,1,1))
    py = defaultdict(float)
    for t_ in trades: py[t_["day"].year] += t_["usd"]
    pos = sum(1 for v in py.values() if v > 0)
    wr = sum(1 for x in xs if x > 0)/n*100
    flag = "  <-- Train&Test>0" if tr > 0 and te > 0 else ""
    print(f"{label}: N={n} WR={wr:.1f}% Ø{mean:+.0f}$ t={t:.2f} | Train {tr:+,.0f} | Test {te:+,.0f} | J+ {pos}/{len(py)}{flag}")

wins = {"0930-1100": (570, 660), "0930-1200": (570, 720), "0200-0500": (120, 300), "0700-0930": (420, 570), "1300-1600": (780, 960)}
cnt = 0
for lvl in ("PDH", "PDL", "PDC", "MO"):
    for wn, w in wins.items():
        for em in ("reclaim", "limit"):
            for tm in ("r1", "r2", "opp"):
                for pdf in (False, True):
                    cnt += 1
                    line(f"{lvl:3s} {wn} {em:7s} {tm:3s} pd={int(pdf)}", run(lvl, w, em, tm, pdf))
print(f"\n{cnt} Kombinationen getestet (nur N>=150 gezeigt)")
