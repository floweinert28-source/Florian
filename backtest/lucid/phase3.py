"""Phase 3: Hypothesen auf Train testen, auf Validation tunen. Holdout bleibt zu.

Split (VOR dem ersten Backtest festgelegt):
  Train      2021-09 bis 2023-12
  Validation 2024-01 bis 2024-12
  Holdout    2025-01 bis 2026-08   <- wird hier NICHT angefasst

Getestet werden die drei Entry-Hypothesen, die die Vorauswahl in Phase 2
ueberstanden haben. Jede geprueffte Parameterkombination wird gezaehlt, damit
die Multiple-Testing-Korrektur ehrlich bleibt.

Aufruf: python phase3.py
"""
import sys, os, math, datetime as dt
from statistics import mean, stdev

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, "/home/user/Florian/backtest/research/r5")
sys.path.insert(0, "/home/user/Florian/backtest/research")

from strategies import gap_continuation, vwap_reclaim, split, summary
from worst_hunt import prep
from load_vol import load_days_vol
from mc import INSTR

TRAIN_END = dt.date(2024, 1, 1)
VAL_END = dt.date(2025, 1, 1)

# Zaehler fuer die Multiple-Testing-Korrektur
TRIALS = 0


def daily_returns(trades, instr, risk_usd=600.0):
    """Tagesrenditen in Dollar bei fester Risikogroesse (fuer Sharpe)."""
    iv = INSTR[instr]
    by = {}
    for d, r, stop in trades:
        micros = max(1, int(risk_usd / (stop * iv["micro_usd"])))
        pnl = r * stop * iv["micro_usd"] * micros - iv["cost"] * micros
        by[d] = by.get(d, 0.0) + pnl
    return by


def stats(trades, instr, risk_usd=600.0):
    if len(trades) < 30:
        return None
    n = len(trades)
    wr = sum(1 for _, r, _ in trades if r > 0)/n*100
    by = daily_returns(trades, instr, risk_usd)
    xs = list(by.values())
    if len(xs) < 20:
        return None
    m = mean(xs); s = stdev(xs) or 1e-9
    sharpe = m/s*math.sqrt(252)          # annualisiert, auf Tagesbasis
    return dict(n=n, days=len(xs), wr=wr, mean=m, sharpe=sharpe, total=sum(xs))


def line(lbl, s):
    if s is None:
        return f"  {lbl:38s}  zu wenig Daten"
    return (f"  {lbl:38s} N={s['n']:5d} WR={s['wr']:5.1f}% "
            f"{s['mean']:+7.1f}$/Tag Sharpe={s['sharpe']:+5.2f} "
            f"Summe {s['total']:+9.0f}$")


def deflated_sharpe(sr_observed, n_obs, n_trials, sr_variance):
    """Deflated Sharpe Ratio nach Bailey/Lopez de Prado (2014).

    Erwarteter Maximal-Sharpe unter der Nullhypothese bei n_trials Versuchen:
        E[max SR] ~ sqrt(V) * ((1-g)*z(1-1/N) + g*z(1-1/(N*e)))
    mit g = Euler-Mascheroni. DSR = Phi((SR - E[max SR]) * sqrt(n_obs-1)).
    Skew/Kurtosis werden hier auf Normalwerte gesetzt (konservativ genug fuer
    die Aussage, die wir treffen).
    """
    from math import sqrt, log, exp, erf
    if n_trials < 2 or sr_variance <= 0:
        return float("nan")
    g = 0.5772156649

    def z(p):                                   # Inverse Standardnormale
        # Acklam-Approximation
        a = [-39.69683028665376, 220.9460984245205, -275.9285104469687,
             138.3577518672690, -30.66479806614716, 2.506628277459239]
        b = [-54.47609879822406, 161.5858368580409, -155.6989798598866,
             66.80131188771972, -13.28068155288572]
        c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838,
             -2.549732539343734, 4.374664141464968, 2.938163982698783]
        d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996,
             3.754408661907416]
        pl, ph = 0.02425, 1-0.02425
        if p < pl:
            q = sqrt(-2*log(p))
            return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / \
                   ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1)
        if p > ph:
            q = sqrt(-2*log(1-p))
            return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / \
                    ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1)
        q = p-0.5; r = q*q
        return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q / \
               (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1)

    N = float(n_trials)
    e_max = math.sqrt(sr_variance) * ((1-g)*z(1-1/N) + g*z(1-1/(N*math.e)))
    stat = (sr_observed - e_max) * math.sqrt(max(1, n_obs-1))
    return 0.5*(1+erf(stat/math.sqrt(2))), e_max


if __name__ == "__main__":
    print("PHASE 3 — Train/Validation. Holdout (ab 2025-01-01) bleibt zu.\n")
    grids = []

    for instr in ("nq", "es"):
        print(f"##### {instr.upper()} #####")
        P = prep(f"/home/user/Florian/backtest/data/{instr}")
        days = load_days_vol(f"/home/user/Florian/backtest/data/{instr}")

        print(" H1  Gap-Continuation")
        for g in (0.2, 0.3, 0.5):
            for k in (2.0, 3.0, 4.0, 6.0):
                TRIALS += 1
                tr, va, ho = split(gap_continuation(P, g, k), TRAIN_END, VAL_END)
                st, sv = stats(tr, instr), stats(va, instr)
                grids.append((instr, "H1", f"g={g} k={k}", st, sv))
                print(line(f"g={g} k={k} Train", st))
                print(line(f"g={g} k={k} Val  ", sv))

        print(" H2  VWAP-3sigma-Reclaim")
        for ks in (2.5, 3.0, 3.5):
            for tf in (630, 660, 690):
                TRIALS += 1
                tr, va, ho = split(vwap_reclaim(days, ks, tf), TRAIN_END, VAL_END)
                st, sv = stats(tr, instr), stats(va, instr)
                grids.append((instr, "H2", f"sig={ks} ab={tf}", st, sv))
                print(line(f"sig={ks} ab {tf//60:02d}:{tf%60:02d} Train", st))
                print(line(f"sig={ks} ab {tf//60:02d}:{tf%60:02d} Val  ", sv))
        print()

    print(f"\nIn Phase 3 geprueft: {TRIALS} Parameterkombinationen")
    import pickle
    pickle.dump(grids, open(os.path.join(HERE, "phase3_grids.pkl"), "wb"))
