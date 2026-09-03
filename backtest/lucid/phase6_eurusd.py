"""Phase 6: Sauberer Out-of-Sample-Test auf EURUSD.

EURUSD ist das einzige Instrument, das in dieser gesamten Untersuchung nie
angefasst wurde - kein Scan, kein Gitter, kein Blick. Damit ist es der einzige
echte Out-of-Sample-Test, der uns noch bleibt.

Getestet werden die beiden Kandidaten mit FESTEN Parametern, so wie sie aus
Phase 3 und 4 hervorgegangen sind. Keine Anpassung, keine Auswahl, zwei
Vorhersagen:
    H1  Gap-Continuation, g=0.3, k=4
    H2  VWAP-Reclaim, 3.0 Sigma, ab 11:00
Zum Vergleich laeuft zusaetzlich das volle Gitter, damit man sieht, ob der
Instrument-Durchschnitt bei 50 % liegt.

Aufruf: python phase6_eurusd.py
"""
import sys, os, math, datetime as dt
from statistics import mean, stdev

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, "/home/user/Florian/backtest/research/r5")
sys.path.insert(0, "/home/user/Florian/backtest/research")

from strategies import gap_continuation, vwap_reclaim
from worst_hunt import prep
from load_vol import load_days_vol

DATA = "/home/user/Florian/backtest/data/6e"


def wr_ci(wins, n):
    """Wilson-Intervall, 95 %."""
    if n == 0: return (float("nan"),)*3
    p = wins/n; z = 1.96
    d = 1 + z*z/n
    c = (p + z*z/(2*n))/d
    h = z*math.sqrt(p*(1-p)/n + z*z/(4*n*n))/d
    return p*100, (c-h)*100, (c+h)*100


def report(label, trades):
    n = len(trades)
    if n < 30:
        print(f"  {label:34s} zu wenig Trades ({n})"); return None
    wins = sum(1 for _, r, _ in trades if r > 0)
    p, lo, hi = wr_ci(wins, n)
    days = len(set(d for d, _, _ in trades))
    # zweiseitiger Binomialtest gegen 50 %
    se = math.sqrt(0.25/n)
    z = (wins/n - 0.5)/se
    print(f"  {label:34s} N={n:5d} ({n/max(1,days):.2f}/Tag) "
          f"WR={p:5.1f}% [{lo:4.1f}–{hi:4.1f}] z={z:+5.2f}")
    return p


if __name__ == "__main__":
    print("PHASE 6 — EURUSD, unberuehrt. Zwei Vorhersagen mit festen Parametern.\n")
    P = prep(DATA)
    days = load_days_vol(DATA)
    print(f"{len(P)} Handelstage\n")

    print("Die beiden Kandidaten (Parameter aus Phase 3/4, hier NICHT angepasst):")
    report("H1 Gap g=0.3 k=4", gap_continuation(P, 0.3, 4.0))
    report("H2 VWAP 3.0 sigma ab 11:00", vwap_reclaim(days, 3.0, 660))

    print("\nVolles Gitter zum Vergleich (nur Kontext, keine Auswahl):")
    ws = []
    for g in (0.2, 0.3, 0.5):
        for k in (2.0, 3.0, 4.0, 6.0):
            w = report(f"Gap g={g} k={k}", gap_continuation(P, g, k))
            if w: ws.append(w)
    for ks in (2.5, 3.0, 3.5):
        for tf in (630, 660, 690):
            w = report(f"VWAP {ks} sigma ab {tf//60:02d}:{tf%60:02d}",
                       vwap_reclaim(days, ks, tf))
            if w: ws.append(w)
    if ws:
        print(f"\n  Median ueber {len(ws)} Zellen: {sorted(ws)[len(ws)//2]:.1f}%  "
              f"Mittel: {mean(ws):.1f}%  Spanne: {min(ws):.1f}–{max(ws):.1f}%")
