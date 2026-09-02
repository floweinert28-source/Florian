"""LDR-Strategie (NQ London Down-Day Reclaim) durch die Prop-Linse: Direct (600$ Risiko) und Flex (1.850$), allein und
kombiniert mit einem Fair-Value-Fueller (08:12-Fade RR 1:1 an Tagen ohne LDR-Setup). Bootstrap ueber Kalendertage (Tage ohne Trade = 0)."""
import sys, csv, random, datetime as dt
sys.path.insert(0, "/home/user/Florian/backtest/propfirm"); sys.path.insert(0, "/home/user/Florian/backtest")
from lucid_direct_mc import sim_direct
from lucid_mc2 import sim
import prop_eval_all as P
random.seed(42); N = 15000
ldr = list(csv.DictReader(open(sys.argv[1])))
ldr_pts = {r["date"]: (float(r["pnl_pts"]), float(r["sl_pts"])) for r in ldr}
fill = P.zone_fade(492, 552, 1.0)   # (day, pts, sld) alle Tage
fill_map = {d.isoformat(): (pts, sld) for d, pts, sld in fill}
all_days = sorted(set(fill_map) | set(ldr_pts))
def daily_series(risk, use_ldr=True, use_fill=False):
    P.TARGET_RISK = risk; out = []
    for d in all_days:
        v = 0.0
        if use_ldr and d in ldr_pts:
            pts, sld = ldr_pts[d]; n = P.size(sld); v += pts * P.USD_MICRO * n - P.COST_MICRO * n if n else 0
        elif use_fill and d in fill_map:
            pts, sld = fill_map[d]; n = P.size(sld); v += pts * P.USD_MICRO * n - P.COST_MICRO * n if n else 0
        out.append(v)
    return out
def stats(label, vals, model):
    fee = 312.0 if model == "direct" else 136.0
    def day_fn(rng, st): return [rng.choice(vals)]
    res = [sim_direct(day_fn, fee) for _ in range(N)] if model == "direct" else [sim(day_fn, fee, "flex", "eod") for _ in range(N)]
    e = sum(r["payouts"] for r in res)/N; anyp = sum(1 for r in res if r["payouts"] > 0)/N*100
    npay = sum(r.get("n_pay", 0) for r in res)/N; days = sorted(r["days"] for r in res)[N//2]
    nz = sum(1 for v in vals if v != 0); mean_day = sum(vals)/len(vals)
    print(f"{label:58s} {model:6s} | Ø$/Kalendertag {mean_day:+6.0f} (Trade-Tage {nz}/{len(vals)}) | >=1 Payout {anyp:5.1f}% | Ø Payouts {npay:.2f} | E[$] {e:6.0f} | ROI {(e-fee)/fee*100:+5.0f}% | Median Tage {days}")
for model, risk in (("direct", 600), ("flex", 1850)):
    stats("LDR allein (Tage ohne Setup = 0)", daily_series(risk, True, False), model)
    stats("LDR + 08:12-Fade-Fueller an anderen Tagen", daily_series(risk, True, True), model)
    stats("nur 08:12-Fade (Referenz)", daily_series(risk, False, True), model)
# Nur Trade-Tage (LDR): wie oft Payout, wenn man NUR an LDR-Tagen handelt (Kalender egal)
P.TARGET_RISK = 600
vals = [pts * P.USD_MICRO * P.size(sld) - P.COST_MICRO * P.size(sld) for pts, sld in ldr_pts.values() if P.size(sld)]
stats("LDR nur Trade-Tage (Zeit egal)", vals, "direct")
