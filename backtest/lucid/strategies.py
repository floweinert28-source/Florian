"""Trade-Generatoren fuer die Lucid-Payout-Studie.

Jede Strategie liefert eine Liste von Trades:
    (datum, r_multiple, stop_punkte)
r_multiple ist das Ergebnis in Vielfachen des Stop-Abstands VOR Kosten
(+1 = Ziel erreicht, -1 = Stop, dazwischen = Tagesschluss-Ausstieg).
Kosten werden erst im Kontosimulator abgezogen, weil sie von der
Kontraktzahl abhaengen.

Alle Generatoren halten die in diesem Projekt etablierten Regeln ein:
  - Entscheidungen nur aus abgeschlossenen Bars
  - Entry zum Bar-Close -> Bewertung ab dem Folgebar
  - Stop vor Ziel im selben Bar (konservativ)
  - Volatilitaetsmasse kausal (nur abgeschlossene Vortage)
"""
import sys, os, random, datetime as dt
from bisect import bisect_left

sys.path.insert(0, "/home/user/Florian/backtest/research/r5")
sys.path.insert(0, "/home/user/Florian/backtest/research")
from worst_hunt import prep, RTH_OPEN, RTH_END
from load_vol import load_days_vol

import math


# --------------------------------------------------------------- S1: Gap
def gap_continuation(P, g=0.3, k=3.0):
    """Eroeffnungsluecke >= g x ATR10 -> in Luecken-Richtung. RR 1:1.
    Entry Close 09:30-Bar, Barrieren k x kausaler Bar-Range."""
    out = []
    for d, D in sorted(P.items()):
        mods, o, c, lo, hi, n = D["mods"], D["o"], D["c"], D["lo"], D["hi"], D["n"]
        a = D["a"]
        if D["pdc"] is None or D["atr"] is None or a >= n or mods[a] != RTH_OPEN:
            continue
        gap = o[a] - D["pdc"]
        if abs(gap) < g*D["atr"]:
            continue
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
            j = min(j, n-1)
            out.append((d, s*(c[j]-entry)/dist, dist)); continue
        if r == 0:
            out.append((d, -1.0, dist))            # unentscheidbar -> konservativ
        else:
            out.append((d, 1.0 if r == s else -1.0, dist))
    return out


# -------------------------------------------------------------- S2: VWAP
def vwap_reclaim(days, k_sig=3.0, t_from=660):
    """Session-VWAP, Band bei k Sigma, Reclaim-Close zurueck ins Band ->
    Gegenbewegung Richtung VWAP. TP = VWAP, SL spiegelbildlich -> RR 1:1."""
    out = []
    for d in sorted(days):
        if d.weekday() >= 5: continue
        mods, o, c, lo, hi, v = days[d]
        n = len(mods); a = bisect_left(mods, RTH_OPEN)
        if n - a < 300 or a >= n or mods[a] != RTH_OPEN: continue
        pv = vv = pv2 = 0.0
        vw = [None]*n; sg = [None]*n
        for i in range(n):
            tp = (hi[i]+lo[i]+c[i])/3.0
            pv += tp*v[i]; vv += v[i]; pv2 += tp*tp*v[i]
            if vv > 0:
                w = pv/vv; vw[i] = w
                sg[i] = math.sqrt(max(0.0, pv2/vv - w*w))
        j = a + 30
        while j < n and mods[j] < RTH_END:
            if mods[j] < t_from or vw[j] is None or not sg[j] or sg[j] <= 0:
                j += 1; continue
            w, s = vw[j], sg[j]
            up, dn = w + k_sig*s, w - k_sig*s
            dirn = entry = None
            if vw[j-1] is not None and hi[j-1] >= up and c[j-1] >= up and c[j] < up:
                dirn, entry = -1, c[j]
            elif vw[j-1] is not None and lo[j-1] <= dn and c[j-1] <= dn and c[j] > dn:
                dirn, entry = 1, c[j]
            if dirn is None:
                j += 1; continue
            dist = abs(entry - w)
            if dist <= 0:
                j += 1; continue
            tp = w
            sl = entry + dist if dirn < 0 else entry - dist
            r = None; jj = j+1
            while jj < n and mods[jj] < RTH_END:
                if dirn > 0:
                    if lo[jj] <= sl: r = -1.0; break
                    if hi[jj] >= tp: r = 1.0; break
                else:
                    if hi[jj] >= sl: r = -1.0; break
                    if lo[jj] <= tp: r = 1.0; break
                jj += 1
            if r is None:
                jj = min(jj, n-1)
                r = dirn*(c[jj]-entry)/dist
            out.append((d, r, dist))
            j = jj + 20
        # while
    return out


# ------------------------------------------------------- S4: Null-Modell
def coinflip(dates, n_per_day=1, stop_pts=20.0, win_prob=0.5, seed=0):
    """Referenz ohne jeden Edge: RR 1:1, EXAKT die angeforderte Trefferquote.

    Wichtig: Ein per Zufallsziehung erzeugter Pool weicht bei N=600 um rund
    2 Prozentpunkte ab, und das System reagiert darauf extrem empfindlich
    (siehe diag3.py). Deshalb wird die Gewinnzahl exakt gesetzt und nur die
    Reihenfolge gemischt.
    """
    rng = random.Random(seed)
    total = len(dates) * n_per_day
    n_win = int(round(win_prob * total))
    outcomes = [1.0]*n_win + [-1.0]*(total - n_win)
    rng.shuffle(outcomes)
    out = []
    i = 0
    for d in dates:
        for _ in range(n_per_day):
            out.append((d, outcomes[i], stop_pts)); i += 1
    return out


# ------------------------------------------------------------- Werkzeug
def to_daily(trades):
    """Fasst Trades zu Tagen zusammen: date -> Liste[(r, stop_pts)]"""
    by = {}
    for d, r, s in trades:
        by.setdefault(d, []).append((r, s))
    return by


def split(trades, train_end=dt.date(2024, 1, 1), val_end=dt.date(2025, 1, 1)):
    tr = [t for t in trades if t[0] < train_end]
    va = [t for t in trades if train_end <= t[0] < val_end]
    ho = [t for t in trades if t[0] >= val_end]
    return tr, va, ho


def summary(trades, label=""):
    n = len(trades)
    if n == 0: return f"{label}: keine Trades"
    wins = sum(1 for _, r, _ in trades if r > 0)
    avg_r = sum(r for _, r, _ in trades)/n
    days = len(set(d for d, _, _ in trades))
    return (f"{label}: N={n} an {days} Tagen ({n/max(1,days):.2f}/Tag) "
            f"WR={wins/n*100:.1f}% mittleres R={avg_r:+.3f}")
