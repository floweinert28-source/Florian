"""Runde 15c: Eroeffnungs-Gap - Faden verliert, Mitgehen gewinnt. RR 1:1.

Fund der Verlierer-Jagd: "gap 0.3atr" liegt auf allen fuenf Instrumenten unter
den schlechtesten Zellen, wenn man gegen die Luecke handelt (38.9-44.8 %).
Die Gegenrichtung ist damit 55-61 %.

Signal: Roeffnungskurs 09:30 NY gegen den Schlusskurs des Vortages. Ist der
Abstand >= g x ATR10 (Tagesrange-Durchschnitt der letzten 10 Tage), wird in
Richtung der Luecke gehandelt.
Entry: Close des ersten RTH-Bars (09:30), damit das Gap zum Entry bereits
bekannt und der Bar abgeschlossen ist. Bewertung ab dem Folgebar.
Barrieren symmetrisch bei k x Tagesmedian der 1-min-Range -> RR exakt 1:1.
Auswertung bis 16:00, Rest zum Close.

Aufruf: python gap_verify.py <data_dir> <cost_pts> <usd_per_pt> <TAG>
"""
import sys, math, datetime as dt
from bisect import bisect_left
from collections import defaultdict

sys.path.insert(0, "/home/user/Florian/backtest/research/r5")
from worst_hunt import prep, SPLIT, RTH_OPEN, RTH_END


def run(P, g=0.3, k=3.0, follow=True, entry_off=0, cost=0.0, usd=1.0, end=RTH_END):
    """entry_off: Minuten nach 09:30, zu deren Bar-Close eingestiegen wird."""
    out = []
    for d, D in P.items():
        mods, o, c, lo, hi, n = D["mods"], D["o"], D["c"], D["lo"], D["hi"], D["n"]
        a = D["a"]
        if D["pdc"] is None or D["atr"] is None or a >= n or mods[a] != RTH_OPEN:
            continue
        gap = o[a] - D["pdc"]
        if abs(gap) < g*D["atr"]:
            continue
        i = bisect_left(mods, RTH_OPEN + entry_off)
        if i >= n or mods[i] != RTH_OPEN + entry_off:
            continue
        s = 1 if gap > 0 else -1
        dirn = s if follow else -s
        entry = c[i]
        dist = k*D["med"]
        up = entry + dist; dn = entry - dist
        r = None; j = i+1
        while j < n and mods[j] <= end:
            tu = hi[j] >= up; td = lo[j] <= dn
            if tu and td: r = 0; break
            if tu: r = 1; break
            if td: r = -1; break
            j += 1
        if r is None:
            j = min(j, n-1)
            r = 1 if c[j] > entry else -1
        if r == 0:
            won, pts = False, -dist
        else:
            won = (r == dirn); pts = dist if won else -dist
        out.append((d, won, (pts-cost)*usd, "gap up" if s > 0 else "gap down",
                    abs(gap)/D["atr"]))
    return out


def stats(rows):
    n = len(rows)
    if n == 0: return None
    wr = sum(1 for r in rows if r[1])/n*100
    net = sum(r[2] for r in rows); mean = net/n
    sd = math.sqrt(sum((r[2]-mean)**2 for r in rows)/(n-1)) if n > 1 else 1.0
    ntr = sum(1 for r in rows if r[0] < SPLIT)
    tr = sum(1 for r in rows if r[0] < SPLIT and r[1])/max(1, ntr)*100
    te = sum(1 for r in rows if r[0] >= SPLIT and r[1])/max(1, n-ntr)*100
    return n, wr, tr, te, net, mean, mean/((sd or 1.0)/math.sqrt(n))


if __name__ == "__main__":
    DATA = sys.argv[1]; COST = float(sys.argv[2]); USD = float(sys.argv[3]); TAG = sys.argv[4]
    P = prep(DATA)
    lastbars = defaultdict(int)
    for D in P.values(): lastbars[D["mods"][-1]//60] += 1
    print(f"### {TAG}: {len(P)} Tage ###")
    print("Letzter Bar des Tages (Stunde NY -> Anzahl Tage): "
          + ", ".join(f"{h}h:{v}" for h, v in sorted(lastbars.items())[-4:]))

    base = run(P, 0.3, 3.0, True, cost=COST, usd=USD)
    s = stats(base)
    print(f"\nBasis (Gap >= 0.3 ATR mitgehen, Barriere 3 x Bar-Range, Entry 09:30-Close):")
    print(f"  N={s[0]} WR={s[1]:.1f}% (Train {s[2]:.1f}/Test {s[3]:.1f}) "
          f"Netto {s[4]:+,.0f}$ pro Trade {s[5]:+.1f}$ t={s[6]:.2f}")
    by = defaultdict(list)
    for r in base: by[r[0].year].append(r)
    print("  Jahre: " + " | ".join(
        f"{y}: N={len(v):3d} WR={sum(1 for x in v if x[1])/len(v)*100:4.1f}%"
        for y, v in sorted(by.items())))

    print("\nGap-Schwelle x Barrierenweite (WR%/N):")
    ks = (1.0, 2.0, 3.0, 4.0, 6.0, 8.0)
    print(f"{'g(ATR)':>7}" + "".join(f"k={k}".rjust(14) for k in ks))
    for g in (0.1, 0.2, 0.3, 0.5, 0.75, 1.0):
        row = f"{g:>7}"
        for k in ks:
            s2 = stats(run(P, g, k, True, cost=COST, usd=USD))
            row += (f"{s2[1]:5.1f}%/{s2[0]:4d}" if s2 and s2[0] >= 80 else "     -").rjust(14)
        print(row, flush=True)

    print("\nRobustheit der Basiszelle:")
    for lbl, kw, cost in [
        ("Gegenrichtung (Gap faden)", dict(follow=False), COST),
        ("Entry 09:35-Close",         dict(entry_off=5), COST),
        ("Entry 09:45-Close",         dict(entry_off=15), COST),
        ("Entry 10:00-Close",         dict(entry_off=30), COST),
        ("Kosten x2",                 dict(), COST*2),
        ("Kosten x4",                 dict(), COST*4),
        ("Auswertung nur bis 12:00",  dict(end=720), COST),
    ]:
        s3 = stats(run(P, 0.3, 3.0, cost=cost, usd=USD, **{**dict(follow=True), **kw}))
        if s3:
            print(f"  {lbl:26s} N={s3[0]:5d} WR={s3[1]:5.1f}% "
                  f"(Train {s3[2]:4.1f}/Test {s3[3]:4.1f}) Netto {s3[4]:+9.0f}$ "
                  f"pro Trade {s3[5]:+7.1f}$")

    print("\nRichtungssplit (Basiszelle):")
    for dn in ("gap up", "gap down"):
        s4 = stats([r for r in base if r[3] == dn])
        if s4:
            print(f"  {dn:9s} N={s4[0]:5d} WR={s4[1]:5.1f}% "
                  f"(Train {s4[2]:4.1f}/Test {s4[3]:4.1f}) pro Trade {s4[5]:+7.1f}$")
