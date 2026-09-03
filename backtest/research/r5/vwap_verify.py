"""Runde 14b: Der k=3.0-Bereich der VWAP-Rueckkehr (RR 1:1) unter der Lupe.

Prueft die auf NQ auffaellige Zelle (Band bei 3 Sigma, ab 11:00, Reclaim-Entry)
auf: Jahresstabilitaet, Parameter-Nachbarschaft, Richtungssplit, Kostensensitivitaet
und Ausfuehrungsannahme.

Aufruf: python vwap_verify.py <data_dir> <cost_pts> <usd_per_pt> <TAG>
"""
import sys, math, datetime as dt
from collections import defaultdict

sys.path.insert(0, "/home/user/Florian/backtest/research/r5")
sys.path.insert(0, "/home/user/Florian/backtest/research")
from vwap_return_1to1 import run, SPLIT
from load_vol import load_days_vol


def stats(tr, cost, usd):
    n = len(tr)
    if n == 0: return None
    pnl = [(t[1] - cost)*usd for t in tr]
    mean = sum(pnl)/n
    sd = math.sqrt(sum((x-mean)**2 for x in pnl)/(n-1)) if n > 1 else 1.0
    wr = sum(1 for t in tr if t[1] > 0)/n*100
    return n, wr, sum(pnl), mean, mean/((sd or 1.0)/math.sqrt(n))


def per_year(tr, cost, usd):
    by = defaultdict(list)
    for t in tr:
        by[t[0].year].append(t)
    out = []
    for y in sorted(by):
        s = stats(by[y], cost, usd)
        out.append(f"{y}: N={s[0]:3d} WR={s[1]:4.1f}% {s[2]:+8.0f}$")
    return out


if __name__ == "__main__":
    DATA = sys.argv[1]; COST = float(sys.argv[2]); USD = float(sys.argv[3]); TAG = sys.argv[4]
    days = load_days_vol(DATA); dates = sorted(days)
    print(f"### {TAG}: {len(dates)} Tage ###\n")

    base = dict(k_sig=3.0, t_from=660, trigger="reclaim", anchor="session", one_per_day=False)
    tr = run(days, dates, **base)
    s = stats(tr, COST, USD)
    print(f"Basiszelle (Session-VWAP, 3.0 Sigma, ab 11:00, Reclaim, mehrfach):")
    print(f"  N={s[0]} WR={s[1]:.1f}% Netto {s[2]:+,.0f}$ pro Trade {s[3]:+.1f}$ t={s[4]:.2f}")
    print("  Jahre: " + " | ".join(per_year(tr, COST, USD)))

    print("\nParameter-Nachbarschaft (Sigma x Startzeit, WR%/N/Netto):")
    print(f"{'':>8}" + "".join(f"{t//60:02d}:{t%60:02d}".rjust(22) for t in (630, 645, 660, 675, 690)))
    for k in (2.5, 2.75, 3.0, 3.25, 3.5):
        row = f"{k:>8}"
        for t in (630, 645, 660, 675, 690):
            p = dict(base); p["k_sig"] = k; p["t_from"] = t
            s2 = stats(run(days, dates, **p), COST, USD)
            row += (f"{s2[1]:5.1f}%/{s2[0]:4d}/{s2[2]:+8.0f}" if s2 and s2[0] >= 40
                    else "        -  ").rjust(22)
        print(row, flush=True)

    print("\nRobustheit der Basiszelle:")
    for lbl, kw, cost in [
        ("Entry am Bandlevel (touch)", dict(base, trigger="touch"), COST),
        ("RTH-Anker statt Session",    dict(base, anchor="rth"), COST),
        ("max 1 Trade/Tag",            dict(base, one_per_day=True), COST),
        ("Kosten x2",                  dict(base), COST*2),
        ("Kosten x4",                  dict(base), COST*4),
        ("Mindestabstand 0.5 Sigma",   dict(base, min_dist_sig=0.5), COST),
    ]:
        s3 = stats(run(days, dates, **kw), cost, USD)
        if s3:
            print(f"  {lbl:30s} N={s3[0]:5d} WR={s3[1]:5.1f}% Netto {s3[2]:+9.0f}$ "
                  f"pro Trade {s3[3]:+7.1f}$")

    print("\nRichtungssplit:")
    for dn in ("long", "short"):
        s4 = stats([t for t in tr if t[3] == dn], COST, USD)
        if s4:
            print(f"  {dn:6s} N={s4[0]:5d} WR={s4[1]:5.1f}% Netto {s4[2]:+9.0f}$ "
                  f"pro Trade {s4[3]:+7.1f}$")
