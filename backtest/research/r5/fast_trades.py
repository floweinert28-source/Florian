"""Runde 13a: Kurze Haltedauern, 2-5 Trades/Tag.
Trigger (feuern mehrfach pro Tag), Exit = TP/SL +/- k x ATRbar (RR 1:1) plus Zeitstopp.
Trigger-Typen:
  BRK  N-Bar-Hoch/Tief-Breakout (Momentum), Entry am Close des Bruch-Bars
  FADE N-Bar-Hoch/Tief-Fade (Mean Reversion), Entry am Close
  STR  Stretch von der 20-Bar-Mitte >= s x ATRbar -> Fade
  CMP  Kompression (N-Bar-Range < c x ATRbar) -> Breakout in Richtung des Ausbruchs
  RNG  Range-Expansion-Bar (Range >= r x ATRbar) -> Fade der Kerze bzw. Continuation
Alle: Entry am Bar-Close (kein Look-Ahead), Entry-Bar nur SL, SL vor TP, ein Trade gleichzeitig,
Session-Fenster waehlbar, max Haltedauer H Minuten -> Exit zum Close.
Kosten: NQ 0.75 / ES 0.4 / YM 2.5 Pkt.
"""
import sys, math, datetime as dt, statistics
from bisect import bisect_left
from collections import defaultdict
sys.path.insert(0, "/home/user/Florian/backtest")
from sweep_reclaim_backtest import load_days

DATA = sys.argv[1]; COST = float(sys.argv[2]); USD = float(sys.argv[3]); TAG = sys.argv[4]
days = load_days(DATA); dates = sorted(d for d in days if d.weekday() < 5)
SESS = {"RTH": (570, 950), "MORN": (570, 720), "EU": (120, 480), "ALL": (120, 950)}

def prep(d):
    mods, o, c, lo, hi = days[d]
    n = len(mods)
    if n < 400: return None
    # ATR pro Bar: gleitender Median der letzten 30 Bar-Ranges
    atr = [0.0]*n; win = []
    for i in range(n):
        r = hi[i]-lo[i]
        win.append(r)
        if len(win) > 30: win.pop(0)
        atr[i] = statistics.median(win) if len(win) >= 10 else 0.0
    return mods, o, c, lo, hi, atr, n

def simulate(sigs, d, ks, H):
    """sigs: list (idx, dirn). Liefert dict k -> list of (win, r_used)."""
    mods, o, c, lo, hi, atr, n = P[d]
    out = {k: [] for k in ks}
    for k in ks:
        last_exit = -1
        for i, dirn in sigs:
            if i <= last_exit: continue
            a = atr[i]
            if a <= 0: continue
            dist = k * a
            entry = c[i]
            sl = entry - dist if dirn == 1 else entry + dist
            tp = entry + dist if dirn == 1 else entry - dist
            res = None
            # Entry zum Close von Bar i -> Bewertung erst ab Bar i+1 (Bar-Tief/-Hoch lag vor dem Entry)
            j = i + 1
            if True:
                while j < n and mods[j] - mods[i] <= H and mods[j] < 955:
                    if dirn == 1:
                        if lo[j] <= sl: res = -1; break
                        if hi[j] >= tp: res = 1; break
                    else:
                        if hi[j] >= sl: res = -1; break
                        if lo[j] <= tp: res = 1; break
                    j += 1
            if res is None:
                j = min(j, n-1)
                pts = (c[j]-entry) if dirn == 1 else (entry-c[j])
                res = 1 if pts > 0 else -1
                pnl = pts
            else:
                pnl = dist if res > 0 else -dist
            out[k].append((res > 0, (pnl - COST) * USD))
            last_exit = j
    return out

P = {}
for d in dates:
    p = prep(d)
    if p: P[d] = p
print(f"##### {TAG}: {len(P)} Tage #####", flush=True)

def gen_signals(d, kind, N, sess, extra=None):
    mods, o, c, lo, hi, atr, n = P[d]
    a0, a1 = SESS[sess]
    i0 = bisect_left(mods, a0); i1 = bisect_left(mods, a1)
    sigs = []
    for i in range(max(i0, N+1), i1):
        if atr[i] <= 0: continue
        if kind in ("BRK", "FADE"):
            hh = max(hi[i-N:i]); ll = min(lo[i-N:i])
            if c[i] > hh: sigs.append((i, 1 if kind == "BRK" else -1))
            elif c[i] < ll: sigs.append((i, -1 if kind == "BRK" else 1))
        elif kind == "STR":
            mid = (max(hi[i-N:i]) + min(lo[i-N:i])) / 2
            if c[i] - mid >= extra * atr[i]: sigs.append((i, -1))
            elif mid - c[i] >= extra * atr[i]: sigs.append((i, 1))
        elif kind == "CMP":
            rng = max(hi[i-N:i]) - min(lo[i-N:i])
            if rng <= extra * atr[i]:
                if c[i] > max(hi[i-N:i]): sigs.append((i, 1))
                elif c[i] < min(lo[i-N:i]): sigs.append((i, -1))
        elif kind in ("RNGF", "RNGC"):
            if hi[i]-lo[i] >= extra * atr[i] and abs(c[i]-o[i]) >= 0.5*(hi[i]-lo[i]):
                up = c[i] > o[i]
                if kind == "RNGF": sigs.append((i, -1 if up else 1))
                else: sigs.append((i, 1 if up else -1))
    return sigs

KS = [0.5, 1.0, 2.0]
HS = [15, 45, 120]
results = []
GRID = []
for sess in ("RTH", "MORN", "EU", "ALL"):
    for N in (5, 15, 30):
        GRID.append(("BRK", N, sess, None)); GRID.append(("FADE", N, sess, None))
    for s in (1.5, 3.0):
        GRID.append(("STR", 20, sess, s))
    for cthr in (1.0, 2.0):
        GRID.append(("CMP", 15, sess, cthr))
    for r in (3.0, 5.0):
        GRID.append(("RNGF", 1, sess, r)); GRID.append(("RNGC", 1, sess, r))

for kind, N, sess, extra in GRID:
    agg = {(k, H): [[], []] for k in KS for H in HS}   # [wins, usd] getrennt Train/Test unten
    per = {(k, H): [] for k in KS for H in HS}
    for d in P:
        sigs = gen_signals(d, kind, N, sess, extra)
        if not sigs: continue
        for H in HS:
            out = simulate(sigs, d, KS, H)
            for k in KS:
                for win, usd in out[k]:
                    per[(k, H)].append((d, win, usd))
    for (k, H), rows in per.items():
        n = len(rows)
        if n < 500: continue
        tpd = n / len(P)
        if not (1.5 <= tpd <= 6.0): continue
        tr = [r for r in rows if r[0] < dt.date(2025,1,1)]; te = [r for r in rows if r[0] >= dt.date(2025,1,1)]
        if len(tr) < 300 or len(te) < 150: continue
        wr = sum(r[1] for r in rows)/n*100
        wtr = sum(r[1] for r in tr)/len(tr)*100; wte = sum(r[1] for r in te)/len(te)*100
        net = sum(r[2] for r in rows)
        results.append((min(wtr, wte), wr, wtr, wte, n, tpd, net, f"{kind} N={N} {sess} extra={extra} k={k} H={H}"))
results.sort(reverse=True)
print(f"{TAG}: {len(results)} Kombis mit 1.5-6 Trades/Tag. Top 15 nach min(Train,Test)-WR:")
for mn, wr, wtr, wte, n, tpd, net, lab in results[:15]:
    print(f"  {lab:44s} N={n:5d} {tpd:.1f}/Tag WR {wr:.1f}% (Train {wtr:.1f} / Test {wte:.1f}) Netto {net:+,.0f}$")
if results:
    print(f"  Median-WR aller Kombis: {sorted(r[1] for r in results)[len(results)//2]:.1f}%")
