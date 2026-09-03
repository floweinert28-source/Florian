"""Null-Modell: Wie viele Payouts traegt die Kontostruktur OHNE jeden Edge?

Das ist die Referenz fuer alles Weitere. Eine Strategie muss diese Zahlen
schlagen, sonst ist sie wertlos.
"""
import sys, os, datetime as dt
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sim import Config
from mc import run_mc
from strategies import coinflip, to_daily

N = 5000
PRICE = {"flex": 136.0, "direct": 520.0}
DATES = [dt.date(2024, 1, 1) + dt.timedelta(days=i) for i in range(600)]


def pool(win_prob, stop_pts=20.0, n_per_day=1, seed=7):
    tr = coinflip(DATES, n_per_day, stop_pts, win_prob, seed)
    return list(to_daily(tr).values())


if __name__ == "__main__":
    print("Null-Modell, NQ-Micros, 1 Trade/Tag, RR 1:1, Stop 20 Punkte "
          f"(= 40 $/Micro), {N} Laeufe je Zelle\n")
    hdr = ("Kontotyp/Risiko/Policy          " +
           "  0     1     2     3     4     5 " +
           "| P5      Netto     EV")
    for wp in (0.48, 0.50, 0.52, 0.54, 0.56):
        print(f"===== Trefferquote {wp:.0%} =====")
        print(hdr)
        for at in ("flex", "direct"):
            for risk in (300.0, 600.0, 900.0):
                for pol in ("full", "asap"):
                    cfg = Config(at)
                    r = run_mc(pool(wp), cfg, "nq", risk, pol, n=N, seed=11)
                    d = r["dist"]
                    lbl = f"{at:6s} {risk:4.0f}$ {pol:4s}"
                    c = r["cond"]
                    print(f"{lbl:32s}" +
                          " ".join(f"{d[k]*100:5.1f}" for k in range(6)) +
                          f" | {r['p_all']*100:4.1f}% {r['mean_net']:8.0f}$ "
                          f"{r['mean_net']-PRICE[at]:+7.0f}$ | "
                          f"0>1 {c['0->1']*100:4.1f}% 1>2 {c['1->2']*100:4.1f}%")
        print()
