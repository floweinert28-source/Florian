"""Monte-Carlo-Simulation: Lucid Trading 50K LucidFlex - ROI pro Eval.

Regeln (Stand 09/2026, aus Lucid-Hilfe/Reviews):
- Eval: Start 50.000, Ziel >= 53.000, Max Loss Limit 2.000 EOD-trailing (Trail = hoechste EOD-Balance - 2.000,
  gelockt bei 50.100 sobald Balance 52.100 ueberschreitet). Konsistenz: bester Tag <= 50% des Gesamtgewinns.
- Funded: Start 50.000, gleiches MLL. Payout wenn Balance > 52.100 UND 5 profitable Tage (>= 150 $) im Zyklus.
  Payout = min(2.000, 50% x (Balance - 50.000)); Trader erhaelt 90%. Max 5 Payouts (dann Live-Review -> hier Ende).
- Kosten: Eval-Gebuehr (Parameter), keine Aktivierung. Breach-Variante: "eod" (nur EOD-Balance zaehlt) oder
  "intraday" (realisierte Balance nach jedem Trade zaehlt) - konservativ beides ausweisen.

Tages-P&L-Modelle:
  A) Null-Edge: n Trades/Tag, jeder +R (Gewinn) oder -R (Verlust) mit p, minus Kosten; optional Tagesstopp bei +T/-L.
  B) Bootstrap echter Tages-P&L (CSV mit Spalte pnl_usd pro Trade, 1 Kontrakt) x Kontrakte.
"""
import random, math, sys, csv
from collections import defaultdict

def run_account(day_pnl_fn, eval_fee, breach="eod", max_days=250, rng=random):
    """Simuliert Eval + Funded. Liefert dict mit payouts_usd (an Trader), days, passed, breached_at."""
    # --- Eval ---
    bal = 50000.0; peak_eod = 50000.0; mll = 48000.0; locked = False
    day_profits = []; days = 0; passed = False
    while days < max_days:
        days += 1
        pnl_trades = day_pnl_fn(rng)
        # intraday breach check (realisiert)
        if breach == "intraday":
            b = bal; hit = False
            for x in pnl_trades:
                b += x
                if b <= mll: hit = True; break
            if hit: return dict(payouts=0.0, days=days, passed=False, stage="eval")
        dp = sum(pnl_trades); bal += dp; day_profits.append(dp)
        if bal <= mll: return dict(payouts=0.0, days=days, passed=False, stage="eval")
        if not locked:
            peak_eod = max(peak_eod, bal); mll = max(mll, peak_eod - 2000)
            if bal >= 52100: mll = 50100; locked = True
        total = bal - 50000
        if total >= 3000 and max(day_profits) <= 0.5 * total:
            passed = True; break
    if not passed: return dict(payouts=0.0, days=days, passed=False, stage="eval_timeout")
    # --- Funded ---
    bal = 50000.0; peak_eod = 50000.0; mll = 48000.0; locked = False
    prof_days = 0; payouts = 0.0; n_pay = 0; fdays = 0
    while fdays < max_days and n_pay < 5:
        fdays += 1
        pnl_trades = day_pnl_fn(rng)
        if breach == "intraday":
            b = bal; hit = False
            for x in pnl_trades:
                b += x
                if b <= mll: hit = True; break
            if hit: break
        dp = sum(pnl_trades); bal += dp
        if bal <= mll: break
        if not locked:
            peak_eod = max(peak_eod, bal); mll = max(mll, peak_eod - 2000)
            if bal >= 52100: mll = 50100; locked = True
        if dp >= 150: prof_days += 1
        if prof_days >= 5 and bal > 52100:
            p = min(2000.0, 0.5 * (bal - 50000)); 
            if p >= 500:
                payouts += 0.9 * p; bal -= p; n_pay += 1; prof_days = 0
    return dict(payouts=payouts, days=days + fdays, passed=True, stage="funded", n_pay=n_pay)

def summarize(label, results, fee):
    n = len(results)
    pay = [r["payouts"] for r in results]
    passed = sum(1 for r in results if r["passed"]) / n
    any_pay = sum(1 for r in results if r["payouts"] > 0) / n
    exp_pay = sum(pay) / n
    roi = (exp_pay - fee) / fee
    npay = sum(r.get("n_pay", 0) for r in results) / n
    days = sorted(r["days"] for r in results)[n // 2]
    p5 = sum(1 for r in results if r.get("n_pay", 0) >= 5) / n
    print(f"{label:52s} Pass {passed*100:5.1f}% | >=1 Payout {any_pay*100:5.1f}% | Ø Payouts {npay:.2f} (5x: {p5*100:4.1f}%) | E[Auszahlung] {exp_pay:7.0f}$ | ROI {roi*100:+6.0f}% | Median Tage {days}")

def zero_edge_day(n_trades, risk, rr=1.0, p=0.5, cost=15.0, day_stop_loss=None, day_target=None):
    def fn(rng):
        out = []; s = 0.0
        for _ in range(n_trades):
            x = (risk * rr if rng.random() < p else -risk) - cost
            out.append(x); s += x
            if day_stop_loss is not None and s <= -day_stop_loss: break
            if day_target is not None and s >= day_target: break
        return out
    return fn

if __name__ == "__main__":
    random.seed(7)
    N = int(sys.argv[1]) if len(sys.argv) > 1 else 5000
    FEE = float(sys.argv[2]) if len(sys.argv) > 2 else 136.0
    print(f"Lucid 50K Flex, Eval-Gebuehr {FEE}$, {N} Simulationen je Konfiguration\n")
    print("=== A) NULL-EDGE (RR 1:1, p=50%, Kosten 15$/Trade) - Breach nur EOD ===")
    for n_tr in (1, 2, 4):
        for risk in (250, 500, 1000, 1500):
            res = [run_account(zero_edge_day(n_tr, risk), FEE, "eod") for _ in range(N)]
            summarize(f"{n_tr} Trade/Tag, Risiko {risk}$", res, FEE)
    print("\n=== A2) NULL-EDGE mit Tagesstopp (-1.000$) und Tagesziel (+1.000$), 4 Trades/Tag ===")
    for risk in (500, 1000):
        res = [run_account(zero_edge_day(4, risk, day_stop_loss=1000, day_target=1000), FEE, "eod") for _ in range(N)]
        summarize(f"Risiko {risk}$, Stop -1k / Ziel +1k", res, FEE)
    print("\n=== A3) NULL-EDGE, Breach INTRADAY (konservativ) ===")
    for risk in (500, 1000, 1500):
        res = [run_account(zero_edge_day(2, risk), FEE, "intraday") for _ in range(N)]
        summarize(f"2 Trades/Tag, Risiko {risk}$", res, FEE)
    print("\n=== A4) Leicht NEGATIVER Edge (p=47%, wie Fade nach Slippage) ===")
    for risk in (500, 1000, 1500):
        res = [run_account(zero_edge_day(2, risk, p=0.47), FEE, "eod") for _ in range(N)]
        summarize(f"2 Trades/Tag, Risiko {risk}$", res, FEE)
    print("\n=== A5) Leicht POSITIVER Edge (p=53%) ===")
    for risk in (500, 1000, 1500):
        res = [run_account(zero_edge_day(2, risk, p=0.53), FEE, "eod") for _ in range(N)]
        summarize(f"2 Trades/Tag, Risiko {risk}$", res, FEE)
