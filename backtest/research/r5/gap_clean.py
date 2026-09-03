"""Runde 15d: Entscheidender Test fuer den Gap-Fund.

Die auffaelligen 40-46 % der Gap-Fade-Seite stammen aus Zellen mit engen
Barrieren. Dort liegen TP und SL oft im selben Bar; solche Faelle werden
konservativ in BEIDEN Richtungen als Verlust gebucht, wodurch beide Seiten
gedrueckt werden (vgl. artifact_check.py).

Dieser Test misst fuer jede Barrierenweite beide Richtungen UND den Anteil
unentscheidbarer Faelle. Ist die Summe beider Richtungen ~100 % und liegen
beide bei ~50 %, ist der Fund erledigt.

Volatilitaet kausal (Mittel der Tagesmediane der letzten 5 Tage).

Aufruf: python gap_clean.py <data_dir> <TAG>
"""
import sys
from bisect import bisect_left

sys.path.insert(0, "/home/user/Florian/backtest/research/r5")
from worst_hunt import prep, RTH_OPEN, RTH_END, SPLIT


def measure(P, g, k):
    foll = agst = und = n = 0
    tr_n = tr_f = te_n = te_f = 0
    for d, D in P.items():
        mods, o, c, lo, hi, nn = D["mods"], D["o"], D["c"], D["lo"], D["hi"], D["n"]
        a = D["a"]
        if D["pdc"] is None or D["atr"] is None or a >= nn or mods[a] != RTH_OPEN:
            continue
        gap = o[a] - D["pdc"]
        if abs(gap) < g*D["atr"]:
            continue
        s = 1 if gap > 0 else -1
        entry = c[a]; dist = k*D["med"]
        up = entry + dist; dn = entry - dist
        r = None; j = a+1
        while j < nn and mods[j] <= RTH_END:
            tu = hi[j] >= up; td = lo[j] <= dn
            if tu and td: r = 0; break
            if tu: r = 1; break
            if td: r = -1; break
            j += 1
        if r is None:
            j = min(j, nn-1)
            r = 1 if c[j] > entry else -1
        n += 1
        if r == 0:
            und += 1; continue
        hit = (r == s)
        if hit: foll += 1
        else: agst += 1
        if d < SPLIT: tr_n += 1; tr_f += hit
        else: te_n += 1; te_f += hit
    if n == 0: return None
    dec = n - und
    if dec == 0: return None
    return dict(n=n, dec=dec, und=und/n*100, foll=foll/dec*100, agst=agst/dec*100,
                tr=tr_f/tr_n*100 if tr_n else float("nan"),
                te=te_f/te_n*100 if te_n else float("nan"))


if __name__ == "__main__":
    DATA = sys.argv[1]; TAG = sys.argv[2]
    P = prep(DATA)
    print(f"### {TAG}: {len(P)} Tage, Gap >= 0.3 ATR ###")
    print(f"{'Barriere':>9} {'N':>5} {'unent.':>7} {'mitgehen':>9} {'faden':>7} "
          f"{'Summe':>7} {'Train':>7} {'Test':>7}")
    for k in (1.0, 2.0, 3.0, 4.0, 6.0, 8.0, 12.0):
        m = measure(P, 0.3, k)
        if not m: continue
        print(f"{k:>9} {m['dec']:>5} {m['und']:>6.1f}% {m['foll']:>8.1f}% "
              f"{m['agst']:>6.1f}% {m['foll']+m['agst']:>6.1f}% "
              f"{m['tr']:>6.1f}% {m['te']:>6.1f}%")
