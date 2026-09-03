"""Erweiterung: (1) 'bold' Strategie mit Kontozustand (1 Trade/Tag, Risiko = Abstand zum MLL - Marge, RR variabel),
(2) LucidDaily-Regeln (Payout jederzeit ueber 52.100, MLL intraday-trailing), (3) mehr Simulationen, (4) Gebuehr 81.60 vs 136."""
import random, sys
sys.path.insert(0, ".")
from lucid_flex_mc import summarize

def sim(day_fn, fee, model="flex", breach="eod", max_days=250, rng=random):
    bal = 50000.0; peak = 50000.0; mll = 48000.0; locked = False; dps = []; days = 0; passed = False
    while days < max_days:
        days += 1
        trades = day_fn(rng, dict(bal=bal, mll=mll, stage="eval", total=bal-50000, best=max(dps) if dps else 0))
        if breach == "intraday":
            b = bal; hit = False
            for x in trades:
                b += x
                if b <= mll: hit = True; break
            if hit: return dict(payouts=0.0, days=days, passed=False, n_pay=0)
        dp = sum(trades); bal += dp; dps.append(dp)
        if bal <= mll: return dict(payouts=0.0, days=days, passed=False, n_pay=0)
        if not locked:
            peak = max(peak, bal); mll = max(mll, peak - 2000)
            if bal >= 52100: mll = 50100; locked = True
        total = bal - 50000
        if total >= 3000 and max(dps) <= 0.5 * total: passed = True; break
    if not passed: return dict(payouts=0.0, days=days, passed=False, n_pay=0)
    bal = 50000.0; peak = 50000.0; mll = 48000.0; locked = False; prof = 0; pay = 0.0; npay = 0; fd = 0
    fbreach = "intraday" if model == "daily" else breach
    while fd < max_days and npay < 5:
        fd += 1
        trades = day_fn(rng, dict(bal=bal, mll=mll, stage="funded", total=bal-50000, best=0))
        if fbreach == "intraday":
            b = bal; hit = False
            for x in trades:
                b += x
                if b <= mll: hit = True; break
            if hit: break
        dp = sum(trades); bal += dp
        if bal <= mll: break
        if not locked:
            peak = max(peak, bal); mll = max(mll, peak - 2000)
            if bal >= 52100: mll = 50100; locked = True
        if model == "flex":
            if dp >= 150: prof += 1
            if prof >= 5 and bal > 52100:
                p = min(2000.0, 0.5 * (bal - 50000))
                if p >= 500: pay += 0.9 * p; bal -= p; npay += 1; prof = 0
        else:  # daily: jederzeit alles ueber 52.100 abheben (min 500)
            if bal - 52100 >= 500:
                p = bal - 52100; pay += 0.9 * p; bal -= p; npay += 1
    return dict(payouts=pay, days=days + fd, passed=True, n_pay=npay)

def bold(rr=1.0, p=0.5, cost=15.0, margin=100.0, cap=None):
    """1 Trade/Tag: Risiko = Abstand Balance->MLL - Marge (max cap). Im Eval: Gewinnziel so, dass Konsistenz haelt."""
    def fn(rng, st):
        risk = st["bal"] - st["mll"] - margin
        if cap: risk = min(risk, cap)
        if risk < 100: risk = 100
        return [(risk * rr if rng.random() < p else -risk) - cost]
    return fn

def fixed(n, risk, rr=1.0, p=0.5, cost=15.0):
    def fn(rng, st):
        return [(risk * rr if rng.random() < p else -risk) - cost for _ in range(n)]
    return fn

if __name__ == "__main__":
    random.seed(11); N = int(sys.argv[1]) if len(sys.argv) > 1 else 20000
    for fee in (136.0, 81.6):
        print(f"\n########## Eval-Gebuehr {fee}$ ##########")
        print("=== FLEX, Null-Edge, 1 Trade/Tag fest ===")
        for risk in (1000, 1500, 1900):
            summarize(f"Flex fest {risk}$ RR1:1", [sim(fixed(1, risk), fee, "flex") for _ in range(N)], fee)
        print("=== FLEX, Null-Edge, BOLD (Risiko = Abstand zum MLL) ===")
        for rr in (1.0, 1.5, 2.0):
            summarize(f"Flex bold RR1:{rr}", [sim(bold(rr), fee, "flex") for _ in range(N)], fee)
        summarize("Flex bold RR1:1 cap 1500$", [sim(bold(1.0, cap=1500), fee, "flex") for _ in range(N)], fee)
        print("=== DAILY-Regeln (Payout jederzeit ueber 52.100, MLL intraday), Null-Edge ===")
        for risk in (1000, 1500):
            summarize(f"Daily fest {risk}$ RR1:1", [sim(fixed(1, risk), fee, "daily", "intraday") for _ in range(N)], fee)
        for rr in (1.0, 2.0):
            summarize(f"Daily bold RR1:{rr}", [sim(bold(rr), fee, "daily", "intraday") for _ in range(N)], fee)
        print("=== Edge-Sensitivitaet (Flex bold RR1:1) ===")
        for p in (0.45, 0.48, 0.50, 0.52, 0.55):
            summarize(f"Flex bold RR1:1 p={p}", [sim(bold(1.0, p=p), fee, "flex") for _ in range(N)], fee)
