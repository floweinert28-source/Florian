"""Phase 4b: Unsicherheit der Trefferquote durchrechnen.

Phase 4 bootstrappt aus dem Holdout-Pool und friert damit die STICHPROBEN-
Trefferquote ein. Bei N=85 bis 146 Trades hat diese Quote aber eine
Standardabweichung von 4 bis 5 Prozentpunkten - und das System reagiert darauf
extrem empfindlich (3 pp mehr Trefferquote verdoppeln die Zyklus-Ueberlebensrate).

Hier wird deshalb je Monte-Carlo-Lauf zuerst die WAHRE Trefferquote aus ihrer
Posterior-Verteilung gezogen (Beta(Gewinne+1, Verluste+1)) und dann damit
simuliert. Ergebnis ist die Vorhersageverteilung statt einer Punktschaetzung.

Vorbehalt: Die Beta-Posterior erfasst nur den Stichprobenfehler. Der
Selektionsbias (die Strategie wurde aus vielen Kandidaten ausgewaehlt) macht
die wahre Quote systematisch NIEDRIGER als die Stichprobe. Die Zahlen hier
sind also immer noch die optimistische Seite.
"""
import sys, os, random, datetime as dt
from collections import Counter
from statistics import median

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, "/home/user/Florian/backtest/research/r5")
sys.path.insert(0, "/home/user/Florian/backtest/research")

from sim import Config
from mc import run_one, INSTR
from strategies import gap_continuation, vwap_reclaim, split, to_daily
from worst_hunt import prep
from load_vol import load_days_vol

N_RUNS = 5000
VAL_END = dt.date(2025, 1, 1)
PRICE = {"flex": 136.0, "direct": 520.0}
DATES = [dt.date(2025, 1, 1) + dt.timedelta(days=i) for i in range(400)]


def pool_at(p, stop_pts, rng):
    """Tagespool mit exakt der Quote p (1 Trade/Tag)."""
    total = 400
    n_win = int(round(p*total))
    out = [1.0]*n_win + [-1.0]*(total-n_win)
    rng.shuffle(out)
    return [[(r, stop_pts)] for r in out]


def run_uncertain(wins, losses, stop_pts, cfg, instr, risk, pol, n=N_RUNS, seed=5):
    """Je Lauf zuerst p ~ Beta(wins+1, losses+1) ziehen, dann simulieren."""
    rng = random.Random(seed)
    res = []
    ps = []
    for _ in range(n):
        p = rng.betavariate(wins+1, losses+1)
        ps.append(p)
        pool = pool_at(p, stop_pts, rng)
        res.append(run_one(pool, cfg, instr, risk, pol, rng))
    dist = Counter(r["payouts"] for r in res)
    nf = float(n)
    return dict(dist={k: dist.get(k, 0)/nf for k in range(6)},
                p_all=dist.get(5, 0)/nf,
                mean_net=sum(r["net"] for r in res)/nf,
                p_zero=dist.get(0, 0)/nf,
                p_lo=sorted(ps)[int(0.025*n)], p_hi=sorted(ps)[int(0.975*n)])


def fixed_vs_uncertain(name, trades, instr):
    n = len(trades)
    wins = sum(1 for _, r, _ in trades if r > 0)
    losses = n - wins
    stop = median([s for _, _, s in trades])
    wr = wins/n*100
    print(f"\n{'='*92}\n{name}")
    print(f"Holdout: N={n}, Trefferquote {wr:.1f}%, "
          f"medianer Stop {stop:.1f} Punkte")
    print(f"{'Konto':7s}{'Risiko':>8s}{'Policy':>7s} | "
          f"{'P5 fest':>9}{'P5 mit Unsicherheit':>21} | "
          f"{'EV fest':>9}{'EV mit Unsicherheit':>21}")
    from mc import run_mc
    day_pool = list(to_daily(trades).values())
    for at in ("flex", "direct"):
        for risk in (300.0, 600.0):
            pol = "full"
            cfg = Config(at)
            a = run_mc(day_pool, cfg, instr, risk, pol, n=N_RUNS, seed=11)
            b = run_uncertain(wins, losses, stop, cfg, instr, risk, pol)
            print(f"{at:7s}{risk:7.0f}${pol:>7s} | "
                  f"{a['p_all']*100:8.1f}%{b['p_all']*100:20.1f}% | "
                  f"{a['mean_net']-PRICE[at]:+8.0f}${b['mean_net']-PRICE[at]:+20.0f}$")
    print(f"  95 %-Intervall der wahren Trefferquote: "
          f"{b['p_lo']*100:.1f}% bis {b['p_hi']*100:.1f}%")


if __name__ == "__main__":
    print("PHASE 4b — Vorhersageverteilung statt Punktschaetzung\n")
    for instr in ("nq", "es"):
        P = prep(f"/home/user/Florian/backtest/data/{instr}")
        days = load_days_vol(f"/home/user/Florian/backtest/data/{instr}")
        _, _, ho = split(gap_continuation(P, 0.3, 4.0), dt.date(2024,1,1), VAL_END)
        fixed_vs_uncertain(f"H1 Gap-Continuation {instr.upper()}", ho, instr)
        _, _, ho = split(vwap_reclaim(days, 3.0, 660), dt.date(2024,1,1), VAL_END)
        fixed_vs_uncertain(f"H2 VWAP-Reclaim {instr.upper()}", ho, instr)
