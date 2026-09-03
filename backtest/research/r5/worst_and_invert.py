"""Runde 13l: Die schlechtesten Zellen suchen und umdrehen.

Scannt Impulskerzen-Fades (RNGF) und -Continuations (RNGC) ueber Tageszeit-
Fenster, Impulsschwelle (extra) und Barrierenweite (k), sammelt alle Zellen mit
N >= MINN bei RR 1:1 und zeigt die schlechtesten. Fuer jede schlechteste Zelle
wird zusaetzlich die exakte Gegenrichtung simuliert.

Ergebnis der Untersuchung: Die 26-33 %-Zellen sind NICHT invertierbar, weil die
Gegenrichtung ebenfalls ~33 % ergibt -> siehe artifact_check.py.

Aufruf: python worst_and_invert.py [data_dir]
"""
import sys, statistics, datetime as dt
sys.path.insert(0, "/home/user/Florian/backtest")
from sweep_reclaim_backtest import load_days

COST, USD = 0.75, 20.0
BODY_MIN = 0.6
MAX_HOLD = 30
MINN = 600
WINDOWS = {"ALL": (0, 950), "MORN": (570, 720), "RTH": (570, 950), "EU": (180, 570)}
EXTRAS = [2.0, 3.0, 5.0]
KS = [1.0, 2.0, 3.0]


def prep(DATA):
    days = load_days(DATA); P = {}
    for d in sorted(days):
        if d.weekday() >= 5: continue
        mods, o, c, lo, hi = days[d]
        n = len(mods)
        if n < 400: continue
        med = statistics.median([hi[i]-lo[i] for i in range(n) if hi[i] > lo[i]] or [1])
        P[d] = (mods, o, c, lo, hi, n, med)
    return P


def sim(P, extra, k, t0, t1, fade):
    rows = []
    for d in P:
        mods, o, c, lo, hi, n, med = P[d]
        i = 1
        while i < n - 2:
            if not (t0 <= mods[i] <= t1): i += 1; continue
            R = hi[i] - lo[i]
            if R < extra*med or R <= 0 or abs(c[i]-o[i]) < BODY_MIN*R:
                i += 1; continue
            up = c[i] > o[i]
            dirn = (-1 if up else 1) if fade else (1 if up else -1)
            entry = o[i+1]
            tp = entry + dirn*k*R
            sl = entry - dirn*k*R
            res = None; pnl = None; j = i+1
            while j < n and mods[j] - mods[i+1] <= MAX_HOLD:
                if dirn == 1:
                    if lo[j] <= sl: res, pnl = -1, -(entry-sl); break
                    if hi[j] >= tp: res, pnl = 1, tp-entry; break
                else:
                    if hi[j] >= sl: res, pnl = -1, -(sl-entry); break
                    if lo[j] <= tp: res, pnl = 1, entry-tp; break
                j += 1
            if res is None:
                j = min(j, n-1); pnl = dirn*(c[j]-entry); res = 1 if pnl > 0 else -1
            rows.append((d, res > 0, (pnl-COST)*USD))
            i = j + 1
    return rows


def stats(rows):
    n = len(rows)
    if n == 0: return None
    w = sum(1 for r in rows if r[1])
    tr = [r for r in rows if r[0] < dt.date(2025, 1, 1)]
    te = [r for r in rows if r[0] >= dt.date(2025, 1, 1)]
    f = lambda s: (sum(1 for r in s if r[1])/len(s)*100) if s else float("nan")
    return n, w/n*100, f(tr), f(te), sum(r[2] for r in rows)


if __name__ == "__main__":
    DATA = sys.argv[1] if len(sys.argv) > 1 else "/home/user/Florian/backtest/data/nq"
    P = prep(DATA)
    print(f"{len(P)} Tage")
    cells = []
    for wn, (t0, t1) in WINDOWS.items():
        for extra in EXTRAS:
            for k in KS:
                for fade in (True, False):
                    s = stats(sim(P, extra, k, t0, t1, fade))
                    if s and s[0] >= MINN:
                        cells.append((("RNGF" if fade else "RNGC"), wn, extra, k, s))
    cells.sort(key=lambda x: x[4][1])
    print(f"\n{len(cells)} Zellen mit N >= {MINN}. Die 5 schlechtesten:")
    for tag, wn, extra, k, s in cells[:5]:
        n, wr, trw, tew, net = s
        print(f"  {tag} extra={extra} k={k} {wn:5s} N={n:6d} WR {wr:5.1f}% "
              f"(Train {trw:.1f} / Test {tew:.1f}) {net:+,.0f}$")
        inv = stats(sim(P, extra, k, t0 := WINDOWS[wn][0], WINDOWS[wn][1], not (tag == "RNGF")))
        if inv:
            print(f"      -> invertiert: N={inv[0]:6d} WR {inv[1]:5.1f}%  {inv[4]:+,.0f}$")
