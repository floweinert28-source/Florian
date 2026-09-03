"""Runde 13m: Beweis, dass 26-33 %-Winrates ein Messartefakt enger Stops sind.

Aufbau: Impulskerze (1-min Range >= 3 x Tagesmedian, Body >= 60 %).
Entry am Open des Folgebars, Barrieren symmetrisch bei k x TYPISCHER Bar-Range
(Tagesmedian der 1-min-Ranges) - das ist der Massstab, an dem sich entscheidet,
ob eine Barriere ueberhaupt sauber messbar ist. Gehalten wird bis Tagesende.
Gemessen wird fuer jedes k:
  - FADE-Winrate (gegen die Kerze)
  - CONT-Winrate (mit der Kerze)
  - Summe beider Winrates. Bei sauberer Messung muss sie ~100 % ergeben.
  - Anteil "unentscheidbar": TP und SL liegen beide innerhalb desselben Bars,
    die konservative Regel (SL vor TP) bucht dann in BEIDEN Richtungen Verlust.

Ist die Summe deutlich unter 100 %, ist die niedrige Winrate kein Edge, sondern
die Folge zu enger Barrieren relativ zur Bar-Range.

Aufruf: python artifact_check.py [data_dir]
"""
import sys, statistics, datetime as dt
sys.path.insert(0, "/home/user/Florian/backtest")
from sweep_reclaim_backtest import load_days

KMULT = 3.0      # Impulskerze: Range >= 3 x Median
BODY_MIN = 0.6
BARRIERS = [0.5, 1.0, 2.0, 3.0, 5.0, 8.0]


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


def run(P, k):
    """Liefert (fade_wins, cont_wins, n, undecidable, offen)."""
    fw = cw = n = und = offen = 0
    for d in P:
        mods, o, c, lo, hi, nn, med = P[d]
        i = 1
        while i < nn - 2:
            R = hi[i] - lo[i]
            if R < KMULT*med or R <= 0 or abs(c[i]-o[i]) < BODY_MIN*R:
                i += 1; continue
            up = c[i] > o[i]
            entry = o[i+1]
            d_up = k*med        # Abstand nach oben wie nach unten
            up_lvl = entry + d_up
            dn_lvl = entry - d_up
            hit = None          # "up" / "dn" / "both" / None
            j = i+1
            while j < nn:
                tu = hi[j] >= up_lvl
                td = lo[j] <= dn_lvl
                if tu and td: hit = "both"; break
                if tu: hit = "up"; break
                if td: hit = "dn"; break
                j += 1
            n += 1
            if hit == "both":
                und += 1        # in beiden Richtungen als Verlust gebucht
            elif hit == "up":
                # Long/Continuation gewinnt bei Up-Kerze, sonst Fade
                if up: cw += 1
                else:  fw += 1
            elif hit == "dn":
                if up: fw += 1
                else:  cw += 1
            else:
                offen += 1      # keine Barriere bis Tagesende getroffen
            i = j + 1
    return fw, cw, n, und, offen


if __name__ == "__main__":
    DATA = sys.argv[1] if len(sys.argv) > 1 else "/home/user/Florian/backtest/data/nq"
    P = prep(DATA)
    print(f"{len(P)} Tage, Impulskerzen mit Range >= {KMULT} x Median\n")
    print(f"{'k (x Bar-Range)':>16} | {'FADE WR':>8} {'CONT WR':>8} | {'Summe':>6} | "
          f"{'unentscheidbar':>14} | {'offen':>6}")
    for k in BARRIERS:
        fw, cw, n, und, offen = run(P, k)
        if n == 0: continue
        f = fw/n*100; cc = cw/n*100
        print(f"{k:>16} | {f:>7.1f}% {cc:>7.1f}% | {f+cc:>5.1f}% | {und/n*100:>13.1f}% | "
              f"{offen/n*100:>5.1f}%")
