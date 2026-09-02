"""Generalisierter Fade-Scan: TP- und SL-Distanz frei in Range-Breiten.

Entry an der gebrochenen Linie (erster Hit nach Zonen-Ende).
- TP = tp_frac x Breite in Richtung Range-Inneres (1.0 = andere Seite).
- SL = sl_frac x Breite hinter der Linie.
- Konservativ: SL vor TP im selben Bar; beide Linien im selben Bar -> Skip.
- Auswertung bis Tagesende; EOD-Rest als R-Multiple.

Scannt ein Gitter aus Zonen x tp_frac x sl_frac und schreibt CSV.

Aufruf: python gen_fade_scan.py <data_dir> <zones> <tp_fracs> <sl_fracs> [out_csv]
  zones: "start:dur,start:dur,..." in Minuten, z.B. "380:15,324:15,492:60"
"""

import csv
import datetime as dt
import sys
from bisect import bisect_left
from collections import defaultdict

sys.path.insert(0, __import__("os").path.dirname(__import__("os").path.abspath(__file__)))
from sweep_reclaim_backtest import load_days, MIN_COVERAGE


def simulate(days, start, dur, tp_frac, sl_frac):
    end_min = start + dur
    n = tp = sl = eod = 0
    sum_r = 0.0
    per_year = defaultdict(lambda: [0, 0, 0.0])
    for day in sorted(days):
        mods, opens, closes, lows, highs = days[day]
        a = bisect_left(mods, start)
        b = bisect_left(mods, end_min)
        if b - a < dur * MIN_COVERAGE:
            continue
        rh = max(highs[a:b])
        rl = min(lows[a:b])
        width = rh - rl
        if width <= 0:
            continue
        m = len(mods)
        direction = None
        j = b
        while j < m:
            hh = highs[j] >= rh
            hl = lows[j] <= rl
            if hh or hl:
                direction = "skip" if (hh and hl) else ("short" if hh else "long")
                break
            j += 1
        if direction in (None, "skip"):
            continue
        if direction == "long":
            entry = rl
            tp_lvl = rl + tp_frac * width
            sl_lvl = rl - sl_frac * width
        else:
            entry = rh
            tp_lvl = rh - tp_frac * width
            sl_lvl = rh + sl_frac * width
        n += 1
        res = None
        while j < m:
            if direction == "long":
                if lows[j] <= sl_lvl:
                    res = "SL"; break
                if highs[j] >= tp_lvl:
                    res = "TP"; break
            else:
                if highs[j] >= sl_lvl:
                    res = "SL"; break
                if lows[j] <= tp_lvl:
                    res = "TP"; break
            j += 1
        y = day.year
        if res == "TP":
            r = tp_frac / sl_frac
            tp += 1
            per_year[y][0] += 1
        elif res == "SL":
            r = -1.0
            sl += 1
            per_year[y][1] += 1
        else:
            eod += 1
            last_close = closes[-1]
            pts = (last_close - entry) if direction == "long" else (entry - last_close)
            r = pts / (sl_frac * width)
        sum_r += r
        per_year[y][2] += r
    return n, tp, sl, eod, sum_r, per_year


def main():
    data_dir = sys.argv[1]
    zones = [tuple(int(v) for v in z.split(":")) for z in sys.argv[2].split(",")]
    tp_fracs = [float(x) for x in sys.argv[3].split(",")]
    sl_fracs = [float(x) for x in sys.argv[4].split(",")]
    out_csv = sys.argv[5] if len(sys.argv) > 5 else "gen_fade_scan.csv"

    days = load_days(data_dir)
    rows = []
    for start, dur in zones:
        for tf in tp_fracs:
            for sf in sl_fracs:
                n, tp, sl, eod, sum_r, per_year = simulate(days, start, dur, tf, sf)
                dec = tp + sl
                if dec < 300:
                    continue
                wr = tp / dec * 100
                be_wr = 1 / (1 + tf / sf) * 100
                yr = {y: (v[0] / (v[0] + v[1]) * 100, v[2])
                      for y, v in sorted(per_year.items()) if v[0] + v[1] > 20}
                worst_yr_r = min((v[1] for v in yr.values()), default=0)
                pos_years = sum(1 for v in yr.values() if v[1] > 0)
                rows.append({
                    "zone": f"{start//60:02d}:{start%60:02d}+{dur}m",
                    "tp_frac": tf, "sl_frac": sf, "rr": round(tf / sf, 3),
                    "trades": n, "tp": tp, "sl": sl, "eod": eod,
                    "winrate": round(wr, 1), "be_winrate": round(be_wr, 1),
                    "edge_pp": round(wr - be_wr, 1),
                    "sum_r": round(sum_r, 1),
                    "pos_years": f"{pos_years}/{len(yr)}",
                    "worst_year_r": round(worst_yr_r, 1),
                    "per_year": " ".join(f"{y}:{v[0]:.0f}%/{v[1]:+.0f}R"
                                         for y, v in yr.items()),
                })
    rows.sort(key=lambda r: -r["edge_pp"])
    with open(out_csv, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)

    print(f"{'Zone':>12} {'TP':>5} {'SL':>4} {'WR%':>6} {'BE%':>6} {'Edge':>5} "
          f"{'SumR':>7} {'Jahre+':>7} {'schl.Jahr':>9}")
    for r in rows[:30]:
        print(f"{r['zone']:>12} {r['tp_frac']:>5} {r['sl_frac']:>4} {r['winrate']:>6} "
              f"{r['be_winrate']:>6} {r['edge_pp']:>5} {r['sum_r']:>7} "
              f"{r['pos_years']:>7} {r['worst_year_r']:>9}")


if __name__ == "__main__":
    main()
