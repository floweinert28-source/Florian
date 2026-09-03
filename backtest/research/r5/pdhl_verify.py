"""Runde 15b: Bruch des Vortageshochs/-tiefs, Continuation, RR 1:1.

Auffaelligste Zelle der Verlierer-Jagd: Das Faden eines Vortages-Level-Bruchs
verliert; die Gegenrichtung (mitgehen) gewinnt. Hier mit Dollars, Jahren,
Parameter-Nachbarschaft und Ausfuehrungsvarianten geprueft.

Signal: erster Bar, dessen Hoch das Vortageshoch erreicht (-> Long) bzw. dessen
Tief das Vortagestief erreicht (-> Short). Entry zum Close dieses Bars,
Bewertung ab dem Folgebar. Barrieren symmetrisch bei k x Tagesmedian der
1-min-Range -> RR exakt 1:1. Max. ein Long- und ein Short-Event pro Tag.

Aufruf: python pdhl_verify.py <data_dir> <cost_pts> <usd_per_pt> <TAG>
"""
import sys, math, datetime as dt
from collections import defaultdict

sys.path.insert(0, "/home/user/Florian/backtest/research/r5")
from worst_hunt import prep, sig_pdhl, WINDOWS, SPLIT


def run(P, k, t0, t1, follow=True, entry_mode="close", cost=0.0, usd=1.0):
    """Liefert Liste (date, gewonnen, pnl_usd, dirn)."""
    out = []
    for d, D in P.items():
        mods, o, c, lo, hi, n = D["mods"], D["o"], D["c"], D["lo"], D["hi"], D["n"]
        dist = k*D["med"]
        for i, s in sig_pdhl(D):
            if not (t0 <= mods[i] <= t1): continue
            dirn = s if follow else -s
            entry = c[i]
            up = entry + dist; dn = entry - dist
            r = None; j = i+1
            while j < n and mods[j] <= t1:
                tu = hi[j] >= up; td = lo[j] <= dn
                if tu and td: r = 0; break          # unentscheidbar -> Verlust
                if tu: r = 1; break
                if td: r = -1; break
                j += 1
            if r is None:
                j = min(j, n-1)
                r = 1 if c[j] > entry else -1
            if r == 0:
                won, pts = False, -dist
            else:
                won = (r == dirn)
                pts = dist if won else -dist
            out.append((d, won, (pts-cost)*usd, "long" if dirn > 0 else "short"))
    return out


def stats(rows):
    n = len(rows)
    if n == 0: return None
    wr = sum(1 for r in rows if r[1])/n*100
    net = sum(r[2] for r in rows)
    mean = net/n
    sd = math.sqrt(sum((r[2]-mean)**2 for r in rows)/(n-1)) if n > 1 else 1.0
    ntr = sum(1 for r in rows if r[0] < SPLIT)
    tr = sum(1 for r in rows if r[0] < SPLIT and r[1])/max(1, ntr)*100
    te = sum(1 for r in rows if r[0] >= SPLIT and r[1])/max(1, n-ntr)*100
    return n, wr, tr, te, net, mean, mean/((sd or 1.0)/math.sqrt(n))


if __name__ == "__main__":
    DATA = sys.argv[1]; COST = float(sys.argv[2]); USD = float(sys.argv[3]); TAG = sys.argv[4]
    P = prep(DATA)
    print(f"### {TAG}: {len(P)} Tage ###\n")
    t0, t1 = WINDOWS["RTH"]

    base = run(P, 6.0, t0, t1, True, cost=COST, usd=USD)
    s = stats(base)
    print(f"Basis (Vortages-Level-Bruch mitgehen, k=6, RTH):")
    print(f"  N={s[0]} WR={s[1]:.1f}% (Train {s[2]:.1f}/Test {s[3]:.1f}) "
          f"Netto {s[4]:+,.0f}$ pro Trade {s[5]:+.1f}$ t={s[6]:.2f}")
    by = defaultdict(list)
    for r in base: by[r[0].year].append(r)
    print("  Jahre: " + " | ".join(
        f"{y}: N={len(v):3d} WR={sum(1 for x in v if x[1])/len(v)*100:4.1f}% "
        f"{sum(x[2] for x in v):+8.0f}$" for y, v in sorted(by.items())))

    print("\nParameter-Nachbarschaft (Barriere x Fenster):")
    hdr = "".join(w.rjust(24) for w in ("EU", "MORN", "PM", "RTH"))
    print(f"{'k':>5}{hdr}")
    for k in (2.0, 3.0, 4.0, 6.0, 8.0, 12.0):
        row = f"{k:>5}"
        for wn in ("EU", "MORN", "PM", "RTH"):
            a, b = WINDOWS[wn]
            s2 = stats(run(P, k, a, b, True, cost=COST, usd=USD))
            row += (f"{s2[1]:5.1f}%/{s2[0]:4d}/{s2[4]:+9.0f}" if s2 and s2[0] >= 100
                    else "           -").rjust(24)
        print(row, flush=True)

    print("\nRobustheit der Basiszelle:")
    for lbl, kw, cost in [
        ("Gegenrichtung (faden)", dict(k=6.0, follow=False), COST),
        ("Kosten x2",             dict(k=6.0, follow=True), COST*2),
        ("Kosten x4",             dict(k=6.0, follow=True), COST*4),
    ]:
        s3 = stats(run(P, t0=t0, t1=t1, cost=cost, usd=USD, **kw))
        if s3:
            print(f"  {lbl:24s} N={s3[0]:5d} WR={s3[1]:5.1f}% "
                  f"(Train {s3[2]:4.1f}/Test {s3[3]:4.1f}) Netto {s3[4]:+9.0f}$ "
                  f"pro Trade {s3[5]:+7.1f}$")

    print("\nRichtungssplit (Basiszelle):")
    for dn in ("long", "short"):
        s4 = stats([r for r in base if r[3] == dn])
        if s4:
            print(f"  {dn:6s} N={s4[0]:5d} WR={s4[1]:5.1f}% "
                  f"(Train {s4[2]:4.1f}/Test {s4[3]:4.1f}) pro Trade {s4[5]:+7.1f}$")
