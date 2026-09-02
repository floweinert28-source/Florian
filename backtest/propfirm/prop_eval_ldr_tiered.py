"""Gestufte Groesse: strenge LDR-Tage (Body>=0.85 & Vortag<-0.3) mit Risiko R_hi, uebrige LDR-Tage (Body>=0.75, kein Filter) mit R_lo.
Direct- und Flex-Regeln, Kalendertage-Bootstrap."""
import sys, csv, random
sys.path.insert(0, "/home/user/Florian/backtest/propfirm"); sys.path.insert(0, "/home/user/Florian/backtest")
from lucid_direct_mc import sim_direct
from lucid_mc2 import sim
import prop_eval_all as P
random.seed(7); N = 12000
SP = "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad"
loose = {r["date"]: (float(r["pnl_pts"]), float(r["sl_pts"])) for r in csv.DictReader(open(SP + "/ldr_tier_nofilter.csv"))}
strict = {r["date"]: (float(r["pnl_pts"]), float(r["sl_pts"])) for r in csv.DictReader(open(SP + "/ldr_tier_strict.csv"))}
all_days = sorted(set(d for d, _, _ in P.zone_fade(492, 552, 1.0)) | set(loose))
def series(r_hi, r_lo):
    out = []
    for d in all_days:
        ds = d.isoformat() if hasattr(d, "isoformat") else d
        v = 0.0
        if ds in strict:
            P.TARGET_RISK = r_hi; pts, sld = strict[ds]; n = P.size(sld); v = pts * P.USD_MICRO * n - P.COST_MICRO * n if n else 0
        elif ds in loose and r_lo > 0:
            P.TARGET_RISK = r_lo; pts, sld = loose[ds]; n = P.size(sld); v = pts * P.USD_MICRO * n - P.COST_MICRO * n if n else 0
        out.append(v)
    return out
def run(label, vals):
    for model in ("direct", "flex"):
        fee = 312.0 if model == "direct" else 136.0
        def day_fn(rng, st): return [rng.choice(vals)]
        res = [sim_direct(day_fn, fee) for _ in range(N)] if model == "direct" else [sim(day_fn, fee, "flex", "eod") for _ in range(N)]
        e = sum(r["payouts"] for r in res)/N; anyp = sum(1 for r in res if r["payouts"] > 0)/N*100; npay = sum(r.get("n_pay", 0) for r in res)/N
        med = sorted(r["days"] for r in res)[N//2]
        print(f"{label:40s} {model:6s} | >=1 Payout {anyp:5.1f}% | Ø Payouts {npay:.2f} | E[$] {e:6.0f} | ROI {(e-fee)/fee*100:+5.0f}% | Median Tage {med}", flush=True)
for r_hi, r_lo in ((600, 300), (900, 300), (1200, 300), (1200, 600), (600, 0), (1850, 600)):
    run(f"strict {r_hi}$ / loose {r_lo}$", series(r_hi, r_lo))
