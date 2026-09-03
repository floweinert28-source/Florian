"""Runde 14: Rueckkehr zum VWAP als Ziel, aber mit echtem RR 1:1.

Korrektur zu Runde 3: dort war "TP am VWAP" mit dem engen Stop am Sweep-Extrem
kombiniert. Der Abstand zum VWAP ist aber weit, der Stop war eng -> faktisch
RR 1:2 bis 1:3, daher die 27-45 % Trefferquote. Das war nicht die Strategie.

Hier: TP = VWAP (Wert zum Entry-Zeitpunkt, eingefroren), SL exakt spiegelbildlich
im gleichen Abstand -> RR 1:1, Breakeven 50 %.

Aufbau:
  VWAP volumengewichtet, verankert am RTH-Open (09:30 NY) oder am Sessionstart.
  Baender bei k x Sigma (volumengewichtete Standardabweichung des Typical Price).
  Trigger:
    "reclaim" - Vorbar handelt jenseits des Bandes, aktueller Bar schliesst
                zurueck ins Band -> Entry zum Close (Bewertung ab Folgebar).
    "touch"   - Bar beruehrt das Band -> Limit-Entry am Bandlevel
                (Entry-Bar zaehlt konservativ nur den SL).
  Auswertung bis 16:00 NY, Rest zum Close.
  Konservativ: SL vor TP im selben Bar.

Aufruf: python vwap_return_1to1.py <data_dir> <cost_pts> <usd_per_pt> <TAG>
"""
import sys, math, datetime as dt
from bisect import bisect_left

sys.path.insert(0, "/home/user/Florian/backtest/research")
from load_vol import load_days_vol

RTH_OPEN, RTH_END = 570, 960
SPLIT = dt.date(2025, 1, 1)


def vwap_series(mods, o, c, lo, hi, v, anchor_min):
    """Laufender VWAP und Sigma ab anchor_min. Liefert Listen gleicher Laenge."""
    n = len(mods)
    vw = [None]*n; sg = [None]*n
    pv = vv = pv2 = 0.0
    for i in range(n):
        if mods[i] < anchor_min:
            continue
        tp = (hi[i] + lo[i] + c[i]) / 3.0
        pv += tp*v[i]; vv += v[i]; pv2 += tp*tp*v[i]
        if vv > 0:
            w = pv/vv
            vw[i] = w
            sg[i] = math.sqrt(max(0.0, pv2/vv - w*w))
    return vw, sg


def exec_trade(mods, o, c, lo, hi, ei, dirn, entry, sl, tp, entry_bar_counts, end=RTH_END):
    """Liefert Ergebnis in Punkten. entry_bar_counts=False -> Bewertung ab ei+1."""
    n = len(mods)
    sld = abs(entry - sl); tpd = abs(tp - entry)
    res = None
    if entry_bar_counts:
        # Limit-Entry: im Entry-Bar zaehlt konservativ nur der SL
        if (dirn == "long" and lo[ei] <= sl) or (dirn == "short" and hi[ei] >= sl):
            res = -sld
    k = ei + 1
    while res is None and k < n and mods[k] < end:
        if dirn == "long":
            if lo[k] <= sl: res = -sld; break
            if hi[k] >= tp: res = tpd; break
        else:
            if hi[k] >= sl: res = -sld; break
            if lo[k] <= tp: res = tpd; break
        k += 1
    if res is None:
        k = min(k, n-1)
        res = (c[k] - entry) if dirn == "long" else (entry - c[k])
    return res


def run(days, dates, k_sig, t_from, trigger, anchor, one_per_day, min_dist_sig=0.0):
    trades = []
    for d in dates:
        if d.weekday() >= 5: continue
        mods, o, c, lo, hi, v = days[d]
        n = len(mods)
        a = bisect_left(mods, RTH_OPEN)
        if n - a < 300 or a >= n or mods[a] != RTH_OPEN:
            continue
        anchor_min = RTH_OPEN if anchor == "rth" else mods[0]
        vw, sg = vwap_series(mods, o, c, lo, hi, v, anchor_min)
        j = a + 30
        while j < n and mods[j] < RTH_END:
            if mods[j] < t_from or vw[j] is None or sg[j] is None or sg[j] <= 0:
                j += 1; continue
            w = vw[j]; s = sg[j]
            up = w + k_sig*s; dn = w - k_sig*s
            dirn = entry = ei = None
            if trigger == "reclaim":
                if vw[j-1] is not None and hi[j-1] >= up and c[j-1] >= up and c[j] < up:
                    dirn, entry, ei = "short", c[j], j
                elif vw[j-1] is not None and lo[j-1] <= dn and c[j-1] <= dn and c[j] > dn:
                    dirn, entry, ei = "long", c[j], j
            else:  # touch: Limit am Bandlevel
                if hi[j] >= up and o[j] < up:
                    dirn, entry, ei = "short", up, j
                elif lo[j] <= dn and o[j] > dn:
                    dirn, entry, ei = "long", dn, j
            if dirn is None:
                j += 1; continue
            dist = abs(entry - w)
            if dist <= 0 or dist < min_dist_sig*s:
                j += 1; continue
            tp = w                                   # Ziel: VWAP
            sl = entry + dist if dirn == "short" else entry - dist   # RR 1:1
            res = exec_trade(mods, o, c, lo, hi, ei, dirn, entry, sl, tp,
                             entry_bar_counts=(trigger == "touch"))
            trades.append((d, res, dist, dirn))
            if one_per_day:
                break
            j += 20                                  # Sperre nach einem Trade
            continue
        # while
    return trades


def report(tag, label, tr, cost, usd, minn=80):
    n = len(tr)
    if n < minn:
        return None
    pnl = [(t[1] - cost)*usd for t in tr]
    mean = sum(pnl)/n
    sd = math.sqrt(sum((x-mean)**2 for x in pnl)/(n-1)) or 1.0
    t = mean/(sd/math.sqrt(n))
    wr = sum(1 for t in tr if t[1] > 0)/n*100
    ntr = sum(1 for t in tr if t[0] < SPLIT)
    wtr = sum(1 for t in tr if t[0] < SPLIT and t[1] > 0)/max(1, ntr)*100
    wts = sum(1 for t in tr if t[0] >= SPLIT and t[1] > 0)/max(1, n-ntr)*100
    net = sum(pnl)
    avg_dist = sum(t[2] for t in tr)/n
    print(f"{tag} {label:52s} N={n:5d} WR={wr:5.1f}% (Train {wtr:4.1f}/Test {wts:4.1f}) "
          f"t={t:5.2f} Netto {net:+9.0f}$ pro Trade {mean:+7.1f}$ Dist {avg_dist:5.1f}",
          flush=True)
    return (label, n, wr, wtr, wts, t, net, mean)


if __name__ == "__main__":
    DATA = sys.argv[1]; COST = float(sys.argv[2]); USD = float(sys.argv[3]); TAG = sys.argv[4]
    days = load_days_vol(DATA); dates = sorted(days)
    print(f"{TAG}: {len(dates)} Tage", flush=True)
    rows = []
    for anchor in ("rth", "session"):
        for trigger in ("reclaim", "touch"):
            for k_sig in (1.0, 1.5, 2.0, 2.5, 3.0):
                for t_from in (600, 630, 660):
                    for opd in (True, False):
                        lbl = (f"{anchor} {trigger} k={k_sig} ab {t_from//60:02d}:{t_from%60:02d} "
                               f"{'1/Tag' if opd else 'mehrfach'}")
                        r = report(TAG, lbl, run(days, dates, k_sig, t_from, trigger,
                                                 anchor, opd), COST, USD)
                        if r: rows.append(r)
    if rows:
        rows.sort(key=lambda x: -min(x[3], x[4]))
        print(f"\n{TAG} Top 10 nach min(Train,Test)-WR:")
        for lbl, n, wr, wtr, wts, t, net, mean in rows[:10]:
            print(f"  {lbl:52s} N={n:5d} WR={wr:5.1f}% ({wtr:4.1f}/{wts:4.1f}) "
                  f"Netto {net:+9.0f}$")
        print(f"  Median-WR ueber {len(rows)} Varianten: "
              f"{sorted(x[2] for x in rows)[len(rows)//2]:.1f}%")
