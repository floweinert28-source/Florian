"""Zonen-Followup: (a) Reclaim-Kerzengroesse (Range/ATR10) Quartile, (b) Down-/Up-Vortag-Filter (prev_trend) auf tf1/5/15,
(c) Wick-Rejection: Sweep und Reclaim in DERSELBEN Signal-Kerze, (d) Sweep-Tiefe-Filter, (e) Buffer-Varianten. Nur ohne 'multi'."""
import sys, time
sys.path.insert(0, "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r4/tf5_exec")
from engine import *
import engine
mk = Market(sys.argv[1]); n = 0; t0 = time.time()
def enrich(rows, name, tf):
    for r in rows:
        d = r["day"]; mods, o, c, lo, hi, v = mk.days[d]; ei = bisect_left(mods, int(r["entry_time"][:2])*60+int(r["entry_time"][3:]))
        bars, bar_of = mk.tfbars(d, tf); b = bars[bar_of[ei]]
        r["ksize"] = (b[3]-b[4])/mk.atr[d]
        pd_ = mk.prev[d]; ppc = mk.rth[mk.prev[pd_]][2] if pd_ in mk.prev else mk.rth[pd_][2]
        r["pt"] = (mk.rth[pd_][2]-ppc)/mk.atr[d]
        st = int(r["sweep_time"][:2])*60+int(r["sweep_time"][3:]); r["same"] = (st // tf) == (mods[ei] // tf)
        r["sld_atr"] = r["sld"]/mk.atr[d]
    return rows
for name in ZONES:
    for tf in (1, 5, 15):
        rows = enrich(run_zone(mk, name, tf, 0.6, max_wait=180), name, tf); n += 1
        tag = f"{mk.tag} {name} tf{tf} b0.6"
        print(fmt(tag + " ALL", rows))
        vals = sorted(r["ksize"] for r in rows)
        if len(vals) > 40:
            q1, q3 = vals[len(vals)//4], vals[3*len(vals)//4]
            print(fmt(tag + f" ksize<Q1({q1:.2f})", [r for r in rows if r["ksize"] < q1])); n += 1
            print(fmt(tag + f" ksize>Q3({q3:.2f})", [r for r in rows if r["ksize"] >= q3])); n += 1
        print(fmt(tag + " pt<-0.3", [r for r in rows if r["pt"] < -0.3])); n += 1
        print(fmt(tag + " pt>0.3", [r for r in rows if r["pt"] > 0.3])); n += 1
        print(fmt(tag + " pt<-0.3 long", [r for r in rows if r["pt"] < -0.3 and r["dir"] == "long"])); n += 1
        print(fmt(tag + " pt>0.3 short", [r for r in rows if r["pt"] > 0.3 and r["dir"] == "short"])); n += 1
        if tf > 1:
            print(fmt(tag + " same-candle wick", [r for r in rows if r["same"]])); n += 1
            print(fmt(tag + " later candle", [r for r in rows if not r["same"]])); n += 1
        s = sorted(r["sld_atr"] for r in rows)
        if len(s) > 40:
            med = s[len(s)//2]
            print(fmt(tag + f" sld<med({med:.2f}ATR)", [r for r in rows if r["sld_atr"] < med])); n += 1
            print(fmt(tag + f" sld>=med", [r for r in rows if r["sld_atr"] >= med])); n += 1
        print(fmt(tag + " long", [r for r in rows if r["dir"] == "long"])); n += 1
        print(fmt(tag + " short", [r for r in rows if r["dir"] == "short"])); n += 1
        sys.stdout.flush()
    for tf in (5, 15):
        for buf in (0.0, 0.25):
            print(fmt(f"{mk.tag} {name} tf{tf} b0.6 buf{buf}", run_zone(mk, name, tf, 0.6, max_wait=180, buf=buf))); n += 1
        print(fmt(f"{mk.tag} {name} tf{tf} b0.6 bufATR0.05", run_zone(mk, name, tf, 0.6, max_wait=180, buf=0.05, buf_mode="ATR"))); n += 1
print(f"VARIANTS {n} time {time.time()-t0:.0f}s")
