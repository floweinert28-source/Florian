"""Runde 15e: Wirtschaftlichkeit des Gap-Continuation-Effekts.

Erwartungswert je Trade = (2 x WR - 1) x Barrierendistanz - Kosten.
Unentscheidbare Faelle (TP und SL im selben Bar) werden ausgewiesen und als
50/50 gewertet, statt sie beiden Richtungen als Verlust anzulasten.

Aufruf: python gap_econ.py <data_dir> <cost_pts> <usd_per_pt> <TAG>
"""
import sys, math

sys.path.insert(0, "/home/user/Florian/backtest/research/r5")
from worst_hunt import prep, RTH_OPEN, RTH_END, SPLIT


def run(P, g, k, cost, usd):
    rows = []; und = 0
    for d, D in P.items():
        mods, o, c, lo, hi, n = D["mods"], D["o"], D["c"], D["lo"], D["hi"], D["n"]
        a = D["a"]
        if D["pdc"] is None or D["atr"] is None or a >= n or mods[a] != RTH_OPEN:
            continue
        gap = o[a] - D["pdc"]
        if abs(gap) < g*D["atr"]: continue
        s = 1 if gap > 0 else -1
        entry = c[a]; dist = k*D["med"]
        up = entry + dist; dn = entry - dist
        r = None; j = a+1
        while j < n and mods[j] <= RTH_END:
            tu = hi[j] >= up; td = lo[j] <= dn
            if tu and td: r = 0; break
            if tu: r = 1; break
            if td: r = -1; break
            j += 1
        if r is None:
            j = min(j, n-1); r = 1 if c[j] > entry else -1
        if r == 0:
            und += 1
            pnl = (0.0 - cost)*usd          # 50/50 -> Erwartungswert 0 minus Kosten
            won = None
        else:
            won = (r == s)
            pnl = ((dist if won else -dist) - cost)*usd
        rows.append((d, won, pnl, dist*usd))
    return rows, und


def summ(rows, und):
    n = len(rows)
    if n == 0: return None
    dec = [r for r in rows if r[1] is not None]
    wr = sum(1 for r in dec if r[1])/len(dec)*100 if dec else float("nan")
    net = sum(r[2] for r in rows); mean = net/n
    sd = math.sqrt(sum((r[2]-mean)**2 for r in rows)/(n-1)) if n > 1 else 1.0
    tr = [r for r in rows if r[0] < SPLIT]; te = [r for r in rows if r[0] >= SPLIT]
    risk = sum(r[3] for r in rows)/n
    return (n, und/n*100, wr, net, mean, mean/((sd or 1)/math.sqrt(n)),
            sum(r[2] for r in tr), sum(r[2] for r in te), risk)


if __name__ == "__main__":
    DATA = sys.argv[1]; COST = float(sys.argv[2]); USD = float(sys.argv[3]); TAG = sys.argv[4]
    P = prep(DATA)
    print(f"### {TAG} ### (Gap-Continuation, Entry 09:30-Close, RR 1:1)")
    print(f"{'g':>5} {'k':>5} {'N':>5} {'unent':>6} {'WR':>6} {'Risiko/Trade':>13} "
          f"{'$/Trade':>9} {'Netto':>10} {'Train':>10} {'Test':>10} {'t':>6}")
    for g in (0.2, 0.3, 0.5):
        for k in (2.0, 3.0, 4.0, 6.0):
            rows, und = run(P, g, k, COST, USD)
            s = summ(rows, und)
            if not s or s[0] < 100: continue
            print(f"{g:>5} {k:>5} {s[0]:>5} {s[1]:>5.1f}% {s[2]:>5.1f}% "
                  f"{s[8]:>12,.0f}$ {s[4]:>8.1f}$ {s[3]:>9,.0f}$ "
                  f"{s[6]:>9,.0f}$ {s[7]:>9,.0f}$ {s[5]:>6.2f}")
