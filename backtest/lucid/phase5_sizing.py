"""Phase 5: Positionsgroesse. Fest vs. proportional zum Puffer bis zum Breach."""
import sys, os, datetime as dt
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from sim import Config
from mc import run_mc
from strategies import coinflip, to_daily

N = 5000
PRICE = {"flex": 136.0, "direct": 520.0}
DATES = [dt.date(2025,1,1)+dt.timedelta(days=i) for i in range(400)]

def pool(wp): return list(to_daily(coinflip(DATES,1,20.0,wp,7)).values())

print("Positionsgroesse: fest vs. an den Puffer gekoppelt "
      "(Risiko = min(Basis, 35 % des Abstands zum Breach-Level))\n")
print(f"{'WR':>4} {'Konto':7s}{'Basis':>7}{'Modus':>8}{'Policy':>7} | "
      f"{'0':>6}{'5':>6} | {'Netto':>8}{'EV':>8}")
for wp in (0.50, 0.54):
    for at in ("flex", "direct"):
        for risk in (600.0, 900.0):
            for mode in ("fixed", "buffer"):
                for pol in (("full",) if at == "direct" else ("full", "asap")):
                    r = run_mc(pool(wp), Config(at), "nq", risk, pol, n=N,
                               seed=11, size_mode=mode)
                    d = r["dist"]
                    print(f"{wp*100:4.0f} {at:7s}{risk:6.0f}${mode:>8}{pol:>7} | "
                          f"{d[0]*100:5.1f}%{d[5]*100:5.1f}% | "
                          f"{r['mean_net']:7.0f}${r['mean_net']-PRICE[at]:+7.0f}$")
    print()
