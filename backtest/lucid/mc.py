"""Monte Carlo: Wie viele Payouts schafft ein Lucid 50K Konto?

Gebootstrappt wird auf TAGES-Ebene (ganze Handelstage werden mit Zuruecklegen
gezogen), damit die Korrelation der Trades innerhalb eines Tages erhalten bleibt.

Positionsgroesse: Micros, damit die Scaling-Tiers sauber abbildbar sind
(1 Mini = 10 Micros). Kontrakte = risk_usd / (Stop-Punkte x Micro-Punktwert),
gedeckelt durch die Tier.

Ausgabe je Lauf: erreichte Payouts, Tage bis zu jedem Payout, Tier-Ruecksetzer,
durch Consistency blockierte Payout-Gelegenheiten.
"""
import sys, os, random
from collections import Counter, defaultdict
from statistics import median

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sim import Config, Account


# Punktwert je MICRO-Kontrakt und Kosten je Micro-Round-Turn (Kommission + Slippage)
INSTR = {
    "nq":   dict(micro_usd=2.0,   cost=1.70),   # MNQ 2 $/Pkt, 1.20 Komm + 1 Tick 0.50
    "es":   dict(micro_usd=5.0,   cost=2.45),   # MES 5 $/Pkt, 1.20 + 1 Tick 1.25
    "ym":   dict(micro_usd=0.5,   cost=1.70),   # MYM 0.50 $/Pkt
    "gold": dict(micro_usd=10.0,  cost=2.20),   # MGC 10 $/Pkt
    "cl":   dict(micro_usd=100.0, cost=2.20),   # MCL 100 $/Pkt
}


def day_pnl(day_trades, micros, micro_usd, cost):
    """Tagesergebnis in Dollar fuer eine gegebene Kontraktzahl."""
    gross = sum(r * stop * micro_usd * micros for r, stop in day_trades)
    return gross - cost * micros * len(day_trades)


def size_micros(day_trades, risk_usd, micro_usd, tier_minis, min_micros=1):
    """Kontrakte aus dem Risikobudget, gedeckelt durch die Scaling-Tier."""
    stop = day_trades[0][1] if day_trades else 0.0
    if stop <= 0:
        return min_micros
    want = int(risk_usd / (stop * micro_usd))
    return max(min_micros, min(want, tier_minis * 10))


def run_one(day_pool, cfg, instr, risk_usd, payout_policy, rng,
            max_days=500, size_mode="fixed"):
    """Ein Konto-Leben. Liefert dict mit Kennzahlen."""
    iv = INSTR[instr]
    acc = Account(cfg)
    days_at_payout = []
    consistency_blocks = 0
    goal_reached_days = 0

    for _ in range(max_days):
        if acc.dead or len(acc.payouts) >= cfg.max_payouts:
            break
        dt_ = rng.choice(day_pool)
        tier = acc.tier_minis()

        risk = risk_usd
        if size_mode == "buffer":
            # Risiko proportional zum Abstand bis zum Breach-Level, gedeckelt
            buf = acc.balance - acc.breach_level
            risk = max(150.0, min(risk_usd, 0.35 * buf))

        micros = size_micros(dt_, risk, iv["micro_usd"], tier)
        pnl = day_pnl(dt_, micros, iv["micro_usd"], iv["cost"])
        acc.close_day(pnl)
        if acc.dead:
            break

        ok, amount, why = acc.payout_ready()
        if not ok and "Consistency" in why:
            consistency_blocks += 1
        if not ok and cfg.account_type == "direct" and "Profit Goal" not in why:
            pass
        if ok:
            goal_reached_days += 1
            cap = (cfg.flex_payout_cap if cfg.account_type == "flex"
                   else cfg.direct_caps[len(acc.payouts)])
            take = (payout_policy == "asap") or (amount >= cap - 1e-9)
            if take:
                acc.take_payout()
                days_at_payout.append(acc.days)

    return dict(payouts=len(acc.payouts),
                gross=sum(acc.payouts),
                net=acc.net_to_trader(),
                dead=acc.dead,
                days=acc.days,
                days_at_payout=days_at_payout,
                tier_drops=acc.tier_drops,
                consistency_blocks=consistency_blocks,
                final_balance=acc.balance)


def run_mc(day_pool, cfg, instr, risk_usd, payout_policy, n=5000, seed=1,
           max_days=500, size_mode="fixed"):
    rng = random.Random(seed)
    res = [run_one(day_pool, cfg, instr, risk_usd, payout_policy, rng,
                   max_days, size_mode) for _ in range(n)]
    dist = Counter(r["payouts"] for r in res)
    n_f = float(n)
    out = dict(
        n=n,
        dist={k: dist.get(k, 0)/n_f for k in range(cfg.max_payouts+1)},
        p_all=dist.get(cfg.max_payouts, 0)/n_f,
        mean_payouts=sum(r["payouts"] for r in res)/n_f,
        mean_net=sum(r["net"] for r in res)/n_f,
        p_dead=sum(1 for r in res if r["dead"])/n_f,
        mean_tier_drops=sum(r["tier_drops"] for r in res)/n_f,
        mean_consistency_blocks=sum(r["consistency_blocks"] for r in res)/n_f,
    )
    # bedingte Uebergangswahrscheinlichkeiten
    cond = {}
    for k in range(cfg.max_payouts):
        base = sum(1 for r in res if r["payouts"] >= k)
        nxt = sum(1 for r in res if r["payouts"] >= k+1)
        cond[f"{k}->{k+1}"] = nxt/base if base else float("nan")
    out["cond"] = cond
    # Median-Tage bis Payout 1 und bis Payout 5
    d1 = [r["days_at_payout"][0] for r in res if r["days_at_payout"]]
    d5 = [r["days_at_payout"][cfg.max_payouts-1] for r in res
          if len(r["days_at_payout"]) >= cfg.max_payouts]
    out["median_days_p1"] = median(d1) if d1 else None
    out["median_days_p5"] = median(d5) if d5 else None
    return out


def fmt(label, r, price):
    d = r["dist"]
    ev = r["mean_net"] - price
    line = (f"{label:34s} " + " ".join(f"{d[k]*100:5.1f}" for k in sorted(d))
            + f" | P5={r['p_all']*100:4.1f}% Netto {r['mean_net']:7.0f}$ "
              f"EV {ev:+7.0f}$")
    return line
