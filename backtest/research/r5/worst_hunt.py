"""Runde 15: Jagd auf strukturell verlierende Strategien (RR 1:1, saubere Barrieren).

Ziel: eine Strategie finden, die dauerhaft deutlich unter 50 % liegt - denn die
Umkehrung waere dann der Edge. Damit das kein Messartefakt wird (siehe
artifact_check.py), sind alle Barrieren mindestens 2 x die typische Bar-Range;
der Anteil intrabar-unentscheidbarer Faelle wird mitgemessen und ausgewiesen.

Aufbau:
  Entry zum Close des Signalbars, Bewertung ab dem Folgebar (kein Look-Ahead).
  Barrieren symmetrisch bei k x KAUSALEM Median der 1-min-Range -> RR exakt 1:1.
  Kausal heisst: Mittel der Tagesmediane der letzten 5 abgeschlossenen Tage.
  (Der Tagesmedian des laufenden Tages waere Look-Ahead - er enthaelt Bars,
   die zum Entry-Zeitpunkt noch nicht existieren.)
  Beide Richtungen werden aus demselben Durchlauf abgeleitet: entweder die obere
  oder die untere Barriere faellt zuerst. Auswertung bis Ende des Zeitfensters,
  Rest zum Close.

15 Signalfamilien x Parametervarianten x 5 Tagesfenster x 4 Barrierenweiten.

Aufruf: python worst_hunt.py <data_dir> <TAG> [min_n]
"""
import sys, math, statistics, datetime as dt
from bisect import bisect_left
from collections import defaultdict

sys.path.insert(0, "/home/user/Florian/backtest/research")
from load_vol import load_days_vol

SPLIT = dt.date(2025, 1, 1)
RTH_OPEN, RTH_END = 570, 960
WINDOWS = {"ALL": (0, 1439), "EU": (180, 570), "MORN": (570, 720),
           "PM": (720, 960), "RTH": (570, 960)}
BARRIERS = [2.0, 3.0, 4.0, 6.0]
MAX_EV_PER_DAY = 20


# ---------------------------------------------------------------- Vorbereitung
def prep(data_dir):
    days = load_days_vol(data_dir)
    P = {}
    prev_close = None
    prev_hl = None
    hist_range = []
    hist_med = []
    for d in sorted(days):
        mods, o, c, lo, hi, v = days[d]
        n = len(mods)
        if d.weekday() >= 5 or n < 400:
            continue
        rngs = [hi[i]-lo[i] for i in range(n) if hi[i] > lo[i]]
        med = statistics.median(rngs) if rngs else 1.0
        a = bisect_left(mods, RTH_OPEN)
        atr = sum(hist_range[-10:])/len(hist_range[-10:]) if len(hist_range) >= 5 else None
        med_c = sum(hist_med[-5:])/len(hist_med[-5:]) if len(hist_med) >= 3 else None
        if med_c is not None:
            P[d] = dict(mods=mods, o=o, c=c, lo=lo, hi=hi, v=v, n=n, med=med_c, a=a,
                        pdc=prev_close, pdhl=prev_hl, atr=atr)
        prev_close = c[-1]
        prev_hl = (max(hi), min(lo))
        hist_range.append(max(hi) - min(lo))
        hist_med.append(med)
    return P


# ------------------------------------------------------------------- Signale
# Jede Funktion liefert Events (bar_index, sign). sign = "natuerliche" Richtung.
def sig_bigbar(D, k=3.0, body=0.6):
    ev = []
    for i in range(1, D["n"]-1):
        R = D["hi"][i] - D["lo"][i]
        if R >= k*D["med"] and R > 0 and abs(D["c"][i]-D["o"][i]) >= body*R:
            ev.append((i, 1 if D["c"][i] > D["o"][i] else -1))
    return ev


def sig_nconsec(D, N=4):
    ev = []
    run = 0; last = 0
    for i in range(D["n"]):
        s = 1 if D["c"][i] > D["o"][i] else (-1 if D["c"][i] < D["o"][i] else 0)
        run = run + 1 if s == last and s != 0 else (1 if s != 0 else 0)
        last = s
        if run >= N:
            ev.append((i, s)); run = 0
    return ev


def sig_orb(D, dur=15):
    a = D["a"]
    if a >= D["n"] or D["mods"][a] != RTH_OPEN: return []
    b = bisect_left(D["mods"], RTH_OPEN+dur)
    if b - a < dur*0.6: return []
    rh = max(D["hi"][a:b]); rl = min(D["lo"][a:b])
    for j in range(b, D["n"]):
        if D["hi"][j] >= rh: return [(j, 1)]
        if D["lo"][j] <= rl: return [(j, -1)]
    return []


def sig_pdhl(D):
    if D["pdhl"] is None: return []
    ph, pl = D["pdhl"]; ev = []
    donev = set()
    for j in range(D["n"]):
        if "h" not in donev and D["hi"][j] >= ph: ev.append((j, 1)); donev.add("h")
        if "l" not in donev and D["lo"][j] <= pl: ev.append((j, -1)); donev.add("l")
        if len(donev) == 2: break
    return ev


def sig_onhl(D):
    a = D["a"]
    if a >= D["n"] or D["mods"][a] != RTH_OPEN or a < 60: return []
    oh = max(D["hi"][:a]); ol = min(D["lo"][:a]); ev = []; donev = set()
    for j in range(a, D["n"]):
        if "h" not in donev and D["hi"][j] >= oh: ev.append((j, 1)); donev.add("h")
        if "l" not in donev and D["lo"][j] <= ol: ev.append((j, -1)); donev.add("l")
        if len(donev) == 2: break
    return ev


def sig_gap(D, minfrac=0.3):
    a = D["a"]
    if D["pdc"] is None or a >= D["n"] or D["mods"][a] != RTH_OPEN: return []
    g = D["o"][a] - D["pdc"]
    if D["atr"] and abs(g) >= minfrac*D["atr"]:
        return [(a, 1 if g > 0 else -1)]
    return []


def sig_round(D, step=None):
    step = step or max(1.0, round(D["med"]*20, 0))
    ev = []; last_lvl = None
    for i in range(1, D["n"]):
        lvl = round(D["c"][i]/step)*step
        if abs(D["c"][i]-lvl) <= D["med"]*0.5 and lvl != last_lvl:
            ev.append((i, 1 if D["c"][i] > D["c"][i-1] else -1)); last_lvl = lvl
        if len(ev) >= MAX_EV_PER_DAY: break
    return ev


def sig_momo(D, look=30):
    ev = []
    for i in range(look, D["n"], 10):
        r = D["c"][i] - D["c"][i-look]
        if abs(r) >= 3*D["med"]:
            ev.append((i, 1 if r > 0 else -1))
        if len(ev) >= MAX_EV_PER_DAY: break
    return ev


def sig_bodyedge(D, tol=0.15):
    """Tap der Body-Kante einer Kerze mit Docht; sign = Fade-Richtung."""
    ev = []
    for i in range(1, D["n"]-3):
        R = D["hi"][i]-D["lo"][i]
        if R <= 0 or R < D["med"]: continue
        bt = max(D["o"][i], D["c"][i]); bb = min(D["o"][i], D["c"][i])
        up_w = (D["hi"][i]-bt)/R; dn_w = (bb-D["lo"][i])/R
        for j in range(i+1, min(i+30, D["n"])):
            if up_w > tol and D["hi"][j] >= bt and D["hi"][j-1] < bt:
                ev.append((j, -1)); break
            if dn_w > tol and D["lo"][j] <= bb and D["lo"][j-1] > bb:
                ev.append((j, 1)); break
        if len(ev) >= MAX_EV_PER_DAY: break
    return ev


def sig_volspike(D, k=4.0):
    ev = []
    for i in range(60, D["n"]-1):
        w = D["v"][i-60:i]
        m = statistics.median(w) if w else 0
        if m > 0 and D["v"][i] >= k*m:
            ev.append((i, 1 if D["c"][i] > D["o"][i] else -1))
        if len(ev) >= MAX_EV_PER_DAY: break
    return ev


def sig_inside(D):
    ev = []
    for i in range(1, D["n"]-2):
        if D["hi"][i] <= D["hi"][i-1] and D["lo"][i] >= D["lo"][i-1]:
            for j in range(i+1, min(i+10, D["n"])):
                if D["hi"][j] > D["hi"][i-1]: ev.append((j, 1)); break
                if D["lo"][j] < D["lo"][i-1]: ev.append((j, -1)); break
        if len(ev) >= MAX_EV_PER_DAY: break
    return ev


def sig_timeofday(D, step=15):
    ev = []
    for t in range(RTH_OPEN, RTH_END, step):
        i = bisect_left(D["mods"], t)
        if i < D["n"] and D["mods"][i] == t: ev.append((i, 1))
    return ev


def sig_firstmove(D):
    a = D["a"]
    if a >= D["n"] or D["mods"][a] != RTH_OPEN: return []
    j = bisect_left(D["mods"], 600)
    if j >= D["n"]: return []
    mv = D["c"][j] - D["o"][a]
    return [(j, -1 if mv > 0 else 1)] if abs(mv) > D["med"] else []


def sig_newhigh(D, t_from=630):
    a = D["a"]
    if a >= D["n"]: return []
    ev = []; run_h = -1e18; run_l = 1e18
    for j in range(a, D["n"]):
        if D["mods"][j] >= RTH_END: break
        nh = D["hi"][j] > run_h; nl = D["lo"][j] < run_l
        run_h = max(run_h, D["hi"][j]); run_l = min(run_l, D["lo"][j])
        if D["mods"][j] < t_from: continue
        if nh and not nl: ev.append((j, 1))
        elif nl and not nh: ev.append((j, -1))
        if len(ev) >= MAX_EV_PER_DAY: break
    return ev


def sig_rangeexp(D, mult=1.0):
    a = D["a"]
    if D["atr"] is None or a >= D["n"]: return []
    for j in range(a, D["n"]):
        if max(D["hi"][a:j+1]) - min(D["lo"][a:j+1]) >= mult*D["atr"]:
            up = D["c"][j] > D["o"][a]
            return [(j, 1 if up else -1)]
    return []


def sig_revbar(D, k=3.0):
    """Grosse Kerze, danach Gegenkerze -> sign = Richtung der Gegenkerze."""
    ev = []
    for i in range(1, D["n"]-1):
        R = D["hi"][i-1]-D["lo"][i-1]
        if R < k*D["med"]: continue
        s0 = 1 if D["c"][i-1] > D["o"][i-1] else -1
        s1 = 1 if D["c"][i] > D["o"][i] else -1
        if s1 == -s0: ev.append((i, s1))
        if len(ev) >= MAX_EV_PER_DAY: break
    return ev


SIGNALS = [
    ("bigbar k2",    lambda D: sig_bigbar(D, 2.0)),
    ("bigbar k3",    lambda D: sig_bigbar(D, 3.0)),
    ("bigbar k5",    lambda D: sig_bigbar(D, 5.0)),
    ("nconsec 3",    lambda D: sig_nconsec(D, 3)),
    ("nconsec 5",    lambda D: sig_nconsec(D, 5)),
    ("nconsec 7",    lambda D: sig_nconsec(D, 7)),
    ("orb 15",       lambda D: sig_orb(D, 15)),
    ("orb 30",       lambda D: sig_orb(D, 30)),
    ("pdhl",         sig_pdhl),
    ("onhl",         sig_onhl),
    ("gap 0.3atr",   lambda D: sig_gap(D, 0.3)),
    ("round",        sig_round),
    ("momo 30",      lambda D: sig_momo(D, 30)),
    ("momo 60",      lambda D: sig_momo(D, 60)),
    ("bodyedge",     sig_bodyedge),
    ("volspike",     lambda D: sig_volspike(D, 4.0)),
    ("insidebar",    sig_inside),
    ("timeofday",    sig_timeofday),
    ("firstmove",    sig_firstmove),
    ("newhigh 10:30", lambda D: sig_newhigh(D, 630)),
    ("rangeexp 1atr", lambda D: sig_rangeexp(D, 1.0)),
    ("revbar k3",    lambda D: sig_revbar(D, 3.0)),
]


# ------------------------------------------------------------------- Engine
def evaluate(D, events, k, t0, t1):
    """Liefert Liste (day_date, outcome, sign). outcome: +1 obere Barriere zuerst,
    -1 untere zuerst, 0 unentscheidbar (beide im selben Bar)."""
    out = []
    mods, c, lo, hi, n = D["mods"], D["c"], D["lo"], D["hi"], D["n"]
    d = k*D["med"]
    for i, s in events:
        if not (t0 <= mods[i] <= t1): continue
        entry = c[i]
        up = entry + d; dn = entry - d
        r = None
        j = i+1
        while j < n and mods[j] <= t1:
            tu = hi[j] >= up; td = lo[j] <= dn
            if tu and td: r = 0; break
            if tu: r = 1; break
            if td: r = -1; break
            j += 1
        if r is None:
            j = min(j, n-1)
            r = 1 if c[j] > entry else -1
        out.append((r, s))
    return out


def cell_stats(rows_by_day):
    """rows_by_day: dict date -> list[(outcome, sign)]"""
    n = und = 0
    with_w = agn_w = 0
    tr_n = tr_w = te_n = te_w = 0
    yr = defaultdict(lambda: [0, 0])
    for d, rows in rows_by_day.items():
        for r, s in rows:
            n += 1
            if r == 0:
                und += 1
                continue
            if r == s: with_w += 1
            else: agn_w += 1
            hit_with = (r == s)
            if d < SPLIT:
                tr_n += 1; tr_w += hit_with
            else:
                te_n += 1; te_w += hit_with
            y = yr[d.year]; y[0] += 1; y[1] += hit_with
    dec = n - und
    if dec == 0: return None
    return dict(n=n, dec=dec, und=und/n*100,
                wr_with=with_w/dec*100, wr_against=agn_w/dec*100,
                tr=tr_w/tr_n*100 if tr_n else float("nan"),
                te=te_w/te_n*100 if te_n else float("nan"),
                years={y: (v[1]/v[0]*100 if v[0] else float("nan"), v[0])
                       for y, v in yr.items()})


if __name__ == "__main__":
    DATA = sys.argv[1]; TAG = sys.argv[2]
    MIN_N = int(sys.argv[3]) if len(sys.argv) > 3 else 300
    P = prep(DATA)
    print(f"### {TAG}: {len(P)} Tage ###", flush=True)

    # Events je Signal einmal erzeugen
    ev_cache = {}
    for name, fn in SIGNALS:
        ev_cache[name] = {d: fn(D) for d, D in P.items()}

    cells = []
    for name, _ in SIGNALS:
        evs = ev_cache[name]
        for wn, (t0, t1) in WINDOWS.items():
            for k in BARRIERS:
                rows = {}
                for d, D in P.items():
                    e = evs[d]
                    if e: rows[d] = evaluate(D, e, k, t0, t1)
                st = cell_stats(rows)
                if st is None or st["dec"] < MIN_N: continue
                cells.append((name, wn, k, st))
        print(f"  {name} fertig", flush=True)

    # Nach der schlechteren der beiden Richtungen sortieren
    cells.sort(key=lambda x: min(x[3]["wr_with"], x[3]["wr_against"]))
    print(f"\n{TAG}: {len(cells)} Zellen mit N >= {MIN_N}. Die 20 schlechtesten "
          f"(schlechtere Richtung):")
    print(f"{'Signal':>16} {'Fenster':>6} {'k':>4} {'N':>6} {'unent':>6} "
          f"{'mit':>6} {'gegen':>6} {'Train':>6} {'Test':>6}")
    for name, wn, k, st in cells[:20]:
        worse_is_with = st["wr_with"] <= st["wr_against"]
        tr = st["tr"] if worse_is_with else 100-st["tr"]
        te = st["te"] if worse_is_with else 100-st["te"]
        print(f"{name:>16} {wn:>6} {k:>4} {st['dec']:>6} {st['und']:>5.1f}% "
              f"{st['wr_with']:>5.1f}% {st['wr_against']:>5.1f}% {tr:>5.1f}% {te:>5.1f}%")

    print(f"\n{TAG}: Verteilung der schlechteren Richtung ueber {len(cells)} Zellen:")
    ws = sorted(min(x[3]["wr_with"], x[3]["wr_against"]) for x in cells)
    for q, lab in [(0, "Minimum"), (len(ws)//20, "5. Perzentil"),
                   (len(ws)//4, "25. Perzentil"), (len(ws)//2, "Median")]:
        print(f"  {lab:16s} {ws[q]:.1f}%")
