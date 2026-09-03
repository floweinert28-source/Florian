"""LucidDirect 50K (Instant Funded) - Monte Carlo.
Regeln (09/2026): Start 50.000; MLL 2.000 EOD-trailing (Trail = hoechste EOD-Balance - 2.000, gelockt bei 50.100 sobald
Balance >= 52.100); DLL 1.200 soft (Tag endet, kein Kontoverlust); Konsistenz 20 %: bester Tag im Zyklus <= 20 % des
Zyklus-Gewinns; Profit-Ziel Zyklus 1: 3.000, danach 2.500; Payout = min(Cap, Zyklus-Gewinn), Cap 2.000 (Payouts 1-3) /
2.500 (4-5), min 500; 90 % an Trader; max 5 Payouts. Zyklus-Gewinn = Balance - Balance nach letztem Payout (Start: 50.000).
Tages-P&L: 1 Trade/Tag (+R*RR oder -R, minus Kosten), optional n Trades mit DLL-Stopp.
"""
import random, sys, math

def sim_direct(day_fn, fee, max_days=300, rng=random, withdraw="max"):
    bal = 50000.0; peak = 50000.0; mll = 48000.0; locked = False
    cycle_base = 50000.0; best_day = 0.0; n_pay = 0; payouts = 0.0; days = 0
    while days < max_days and n_pay < 5:
        days += 1
        trades = day_fn(rng, dict(bal=bal, mll=mll, cycle_profit=bal-cycle_base, best=best_day, n_pay=n_pay))
        # DLL 1.200 soft: Tag stoppt, wenn Tagesverlust <= -1.200
        s = 0.0
        for x in trades:
            s += x
            if s <= -1200: break
        dp = s; bal += dp
        if bal <= mll: return dict(payouts=payouts, days=days, n_pay=n_pay, breached=True)
        if not locked:
            peak = max(peak, bal); mll = max(mll, peak - 2000)
            if bal >= 52100: mll = 50100; locked = True
        best_day = max(best_day, dp)
        goal = 3000.0 if n_pay == 0 else 2500.0
        cp = bal - cycle_base
        if cp >= goal and best_day <= 0.2 * cp:
            cap = 2000.0 if n_pay < 3 else 2500.0
            w = min(cap, cp) if withdraw == "max" else max(500.0, min(cap, cp) * withdraw)
            if w >= 500:
                payouts += 0.9 * w; bal -= w; n_pay += 1; cycle_base = bal; best_day = 0.0
    return dict(payouts=payouts, days=days, n_pay=n_pay, breached=False)

def fixed(n, risk, rr=1.0, p=0.5, cost=15.0):
    def fn(rng, st):
        return [(risk * rr if rng.random() < p else -risk) - cost for _ in range(n)]
    return fn

def summarize(label, res, fee):
    n = len(res); e = sum(r["payouts"] for r in res) / n
    any_ = sum(1 for r in res if r["payouts"] > 0) / n * 100
    npay = sum(r["n_pay"] for r in res) / n
    p5 = sum(1 for r in res if r["n_pay"] >= 5) / n * 100
    med = sorted(r["days"] for r in res)[n // 2]
    print(f"{label:46s} >=1 Payout {any_:5.1f}% | Ø Payouts {npay:.2f} (5x {p5:4.1f}%) | E[$] {e:6.0f} | ROI@{fee:.0f}$ {(e-fee)/fee*100:+5.0f}% | Median Tage {med}")

if __name__ == "__main__":
    random.seed(3); N = int(sys.argv[1]) if len(sys.argv) > 1 else 20000
    for fee in (312.0, 520.0):
        print(f"\n########## LucidDirect 50K, Preis {fee}$ ##########")
        print("--- 1 Trade/Tag, RR 1:1, p=50% (Fair Value) ---")
        for risk in (300, 400, 500, 600, 800, 1000, 1200):
            summarize(f"Risiko {risk}$", [sim_direct(fixed(1, risk), fee) for _ in range(N)], fee)
        print("--- RR-Varianten bei Fair Value, Risiko 600$ ---")
        for rr, p in ((0.5, 2/3), (0.75, 1/1.75), (1.0, 0.5), (1.5, 0.4), (2.0, 1/3)):
            summarize(f"RR1:{rr} p={p:.3f}", [sim_direct(fixed(1, 600, rr, p), fee) for _ in range(N)], fee)
        print("--- Edge-Sensitivitaet, Risiko 600$, RR1:1 ---")
        for p in (0.45, 0.47, 0.5, 0.53, 0.55, 0.6):
            summarize(f"p={p}", [sim_direct(fixed(1, 600, 1.0, p), fee) for _ in range(N)], fee)
        print("--- 2 Trades/Tag a 300$ ---")
        summarize("2x300$ p=0.5", [sim_direct(fixed(2, 300), fee) for _ in range(N)], fee)
        print("--- Teil-Auszahlung statt Maximum (Risiko 600$, p=0.5) ---")
        for w in (0.5, 0.75):
            summarize(f"Auszahlung {int(w*100)}% des Erlaubten", [sim_direct(fixed(1, 600), fee, withdraw=w) for _ in range(N)], fee)
