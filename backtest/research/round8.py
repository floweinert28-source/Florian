"""Runde 8: Kandidat 'Sweep+Reclaim nach Down-Vortag mit starker Reclaim-Kerze' hart pruefen.
Nachbarn: prev_trend-Schwelle, body-Schwelle, Zonen (LON, PRE, 08:12, OPEN), Richtung (nur Long? nur Short?), Jahre, t, ES/YM."""
import sys, math, datetime as dt
from collections import defaultdict
sys.path.insert(0, "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r3")
import round7 as R
SP = "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad"

def stats(rows):
    n = len(rows)
    if n == 0: return "n=0"
    wr = sum(r["win"] for r in rows)/n*100; usd = [r["usd"] for r in rows]; mean = sum(usd)/n
    sd = math.sqrt(sum((x-mean)**2 for x in usd)/(n-1)) if n > 1 else 1; t = mean/(sd/math.sqrt(n)) if sd else 0
    return f"N={n:3d} WR={wr:5.1f}% t={t:5.2f} Netto {sum(usd):+7.0f}"

def evaluate(tag, rows, pt_thr, body_thr, dir_filter=None):
    sel = [r for r in rows if r["prev_trend"] < pt_thr and r["reclaim_body"] >= body_thr and (dir_filter is None or r["dir_long"] == dir_filter)]
    tr = [r for r in sel if r["day"] < dt.date(2025,1,1)]; te = [r for r in sel if r["day"] >= dt.date(2025,1,1)]
    py = defaultdict(lambda: [0, 0])
    for r in sel: py[r["day"].year][0] += 1; py[r["day"].year][1] += r["win"]
    yrs = " ".join(f"{y}:{v[1]/v[0]*100:.0f}%({v[0]})" for y, v in sorted(py.items()))
    print(f"{tag} pt<{pt_thr:+.1f} body>={body_thr:.2f} dir={dir_filter}: ALL {stats(sel)} | Train {stats(tr)} | Test {stats(te)} | {yrs}")

for inst, data, cost, usd in (("NQ", "/data", 0.75, 20), ("ES", "/data_es", 0.4, 50), ("YM", "/data_ym", 2.5, 5)):
    R.days = R.load_days_vol(SP + data); R.dates = sorted(R.days); R.COST = cost; R.USD = usd; R.TAG = inst
    R.rth = {}; R.hist = []
    for d in R.dates:
        if d.weekday() >= 5: continue
        z = R.zone(d, 570, 960)
        if z:
            mods, o, c, lo, hi, v = R.days[d]; R.rth[d] = (z[0], z[1], c[z[3]-1]); R.hist.append(d)
    R.prev = {R.hist[i]: R.hist[i-1] for i in range(1, len(R.hist))}
    R.atr = {R.hist[i]: sum(R.rth[R.hist[i-k]][0]-R.rth[R.hist[i-k]][1] for k in range(1, 11))/10 for i in range(10, len(R.hist))}
    print(f"\n##### {inst} #####")
    for zn, (zs, ze) in (("LON", (120, 300)), ("PRE", (300, 480)), ("Z812", (492, 552)), ("OPEN", (570, 600))):
        rows = R.build(zs, ze)
        if zn == "LON":
            for pt in (-0.3, -0.5, -0.7):
                for bt in (0.6, 0.7, 0.75, 0.8):
                    evaluate(f"{inst} {zn}", rows, pt, bt)
            evaluate(f"{inst} {zn}", rows, -0.5, 0.75, 1); evaluate(f"{inst} {zn}", rows, -0.5, 0.75, 0)
            evaluate(f"{inst} {zn} nur Vortag-Down", rows, -0.5, 0.0); evaluate(f"{inst} {zn} nur Body", rows, 99, 0.75)
            evaluate(f"{inst} {zn} Vortag-UP&Body", [dict(r, prev_trend=-r["prev_trend"]) for r in rows], -0.5, 0.75)
        else:
            evaluate(f"{inst} {zn}", rows, -0.5, 0.75); evaluate(f"{inst} {zn}", rows, -0.3, 0.7)
