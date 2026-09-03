"""Phase 4: Holdout oeffnen, Monte Carlo, Kernmetriken.

WICHTIGER VORBEHALT: Der Zeitraum ab 2025-01-01 diente in frueheren Runden
dieser Sitzung bereits als Test-Haelfte und wurde dort rund 30 Mal angesehen.
Er ist damit KEIN unberuehrtes Holdout mehr. Die Zahlen sind entsprechend
optimistisch zu lesen. Wirklich unberuehrt ist nur EURUSD (laedt noch).
"""
import sys, os, datetime as dt
from statistics import median

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, "/home/user/Florian/backtest/research/r5")
sys.path.insert(0, "/home/user/Florian/backtest/research")

from sim import Config
from mc import run_mc
from strategies import gap_continuation, vwap_reclaim, coinflip, split, to_daily
from worst_hunt import prep
from load_vol import load_days_vol

N = 5000
VAL_END = dt.date(2025, 1, 1)
PRICE = {"flex": 136.0, "direct": 520.0}


def pool_of(trades):
    return list(to_daily(trades).values())


def report(name, day_pool, instr, wr_note=""):
    print(f"\n{'='*96}")
    print(f"{name}   {wr_note}")
    print(f"{'='*96}")
    print(f"{'Konto':7s} {'Risiko':>7s} {'Policy':6s} |"
          f"{'0':>6}{'1':>6}{'2':>6}{'3':>6}{'4':>6}{'5':>6} | "
          f"{'P5':>6} {'Netto':>8} {'EV':>8} | {'0>1':>6}{'1>2':>6}{'2>3':>6}"
          f"{'3>4':>6}{'4>5':>6} | {'T1':>5}{'T5':>5} {'Tier':>5} {'Cons':>5}")
    rows = []
    for at in ("flex", "direct"):
        for risk in (300.0, 600.0, 900.0):
            for pol in ("full", "asap"):
                if at == "direct" and pol == "asap":
                    continue          # bei Direct identisch, Goal > Cap
                r = run_mc(day_pool, Config(at), instr, risk, pol, n=N, seed=11)
                d, c = r["dist"], r["cond"]
                ev = r["mean_net"] - PRICE[at]
                rows.append((at, risk, pol, r, ev))
                print(f"{at:7s} {risk:6.0f}$ {pol:6s} |" +
                      "".join(f"{d[k]*100:6.1f}" for k in range(6)) +
                      f" | {r['p_all']*100:5.1f}% {r['mean_net']:7.0f}$ "
                      f"{ev:+7.0f}$ | " +
                      "".join(f"{c[f'{k}->{k+1}']*100:5.0f}%" for k in range(5)) +
                      f" | {str(r['median_days_p1'] or '-'):>5}"
                      f"{str(r['median_days_p5'] or '-'):>5}"
                      f" {r['mean_tier_drops']:5.1f}"
                      f" {r['mean_consistency_blocks']:5.1f}")
    best = max(rows, key=lambda x: x[4])
    print(f"\n  Beste Zelle: {best[0]} {best[1]:.0f}$ {best[2]} -> EV {best[4]:+.0f}$ "
          f"pro gekauftem Konto")
    return rows


if __name__ == "__main__":
    print("PHASE 4 — Holdout ab 2025-01-01. "
          "Vorbehalt: in frueheren Runden bereits als Test-Haelfte gesehen.")

    # --- Referenz: Null-Modell bei exakt 50 %
    dates = [dt.date(2025,1,1)+dt.timedelta(days=i) for i in range(420)]
    report("REFERENZ  Null-Modell, kein Edge", 
           pool_of(coinflip(dates, 1, 20.0, 0.50, 7)), "nq",
           "exakt 50 % Trefferquote, RR 1:1, Stop 20 Pkt")

    for instr in ("nq", "es"):
        P = prep(f"/home/user/Florian/backtest/data/{instr}")
        days = load_days_vol(f"/home/user/Florian/backtest/data/{instr}")

        _, _, ho = split(gap_continuation(P, 0.3, 4.0), dt.date(2024,1,1), VAL_END)
        wr = sum(1 for _, r, _ in ho if r > 0)/max(1, len(ho))*100
        report(f"H1  Gap-Continuation {instr.upper()} (g=0.3, k=4)",
               pool_of(ho), instr, f"Holdout N={len(ho)} WR={wr:.1f}%")

        _, _, ho = split(vwap_reclaim(days, 3.0, 660), dt.date(2024,1,1), VAL_END)
        wr = sum(1 for _, r, _ in ho if r > 0)/max(1, len(ho))*100
        report(f"H2  VWAP-3sigma-Reclaim {instr.upper()} (3.0 sigma, ab 11:00)",
               pool_of(ho), instr, f"Holdout N={len(ho)} WR={wr:.1f}%")
