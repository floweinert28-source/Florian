"""Zonen-Suche fuer den Fade-Trade mit RR 1:1.

Trade-Regeln pro Kandidaten-Zone [start, start+dauer) NY-Zeit:
- Range = Hoch/Tief der Zone.
- Erster Hit einer Linie nach Zonen-Ende -> Entry an der Linie
  (Long am Tief, Short am Hoch), TP = andere Seite (1 Breite),
  SL = 1 Breite hinter der Linie (RR 1:1).
- Konservativ: SL vor TP im selben Bar; Bar trifft beide Linien -> Skip.
- Auswertung bis Tagesende (NY). Win-Rate = TP / (TP + SL).

Aufruf: python fade_zone_search.py <data_dir> <starts> <durations> [out_csv]
  starts:    z.B. "0-1380:6" (Minuten ab Mitternacht NY, Schrittweite)
             oder Kommaliste "372,378,384"
  durations: Kommaliste in Minuten, z.B. "15,30,45,60,75,90,105,120"
"""

import csv
import datetime as dt
import glob
import lzma
import os
import pickle
import struct
import sys
from bisect import bisect_left
from collections import defaultdict
from zoneinfo import ZoneInfo

NY = ZoneInfo("America/New_York")
UTC = ZoneInfo("UTC")
PRICE_SCALE = 1000.0
MIN_COVERAGE = 0.87     # Anteil der Zonen-Minuten, die Daten haben muessen
MIN_DAYS = 800

START_DAY = dt.date(2021, 9, 1)
END_DAY = dt.date(2026, 8, 31)


def load_days(data_dir):
    cache = os.path.join(data_dir, "bars_cache.pkl")
    if os.path.exists(cache):
        with open(cache, "rb") as f:
            return pickle.load(f)
    by_day = defaultdict(lambda: ([], [], []))  # mods, highs, lows
    for path in sorted(glob.glob(os.path.join(data_dir, "*.bi5"))):
        gmt_date = dt.date.fromisoformat(os.path.basename(path)[:-4])
        with open(path, "rb") as f:
            raw = f.read()
        if not raw:
            continue
        data = lzma.decompress(raw)
        base = dt.datetime(gmt_date.year, gmt_date.month, gmt_date.day, tzinfo=UTC)
        for i in range(len(data) // 24):
            off, _o, _c, low, high, _v = struct.unpack(
                ">IIIIIf", data[i * 24:(i + 1) * 24])
            ny = (base + dt.timedelta(seconds=off)).astimezone(NY)
            d = by_day[ny.date()]
            d[0].append(ny.hour * 60 + ny.minute)
            d[1].append(high / PRICE_SCALE)
            d[2].append(low / PRICE_SCALE)
    days = {}
    for day, (mods, highs, lows) in by_day.items():
        if not (START_DAY <= day <= END_DAY):
            continue
        order = sorted(range(len(mods)), key=lambda i: mods[i])
        days[day] = ([mods[i] for i in order],
                     [highs[i] for i in order],
                     [lows[i] for i in order])
    with open(cache, "wb") as f:
        pickle.dump(days, f)
    return days


def simulate(days, start, dur):
    """Liefert (n, tp, sl, per_year{jahr: [tp, sl]})."""
    n = tp = sl = 0
    per_year = defaultdict(lambda: [0, 0])
    end_min = start + dur
    for day, (mods, highs, lows) in days.items():
        a = bisect_left(mods, start)
        b = bisect_left(mods, end_min)
        if b - a < dur * MIN_COVERAGE:
            continue
        rh = max(highs[a:b])
        rl = min(lows[a:b])
        width = rh - rl
        if width <= 0:
            continue
        n += 1
        direction = None
        m = len(mods)
        j = b
        while j < m:
            hh = highs[j] >= rh
            hl = lows[j] <= rl
            if hh or hl:
                if hh and hl:
                    direction = "skip"
                else:
                    direction = "short" if hh else "long"
                break
            j += 1
        if direction in (None, "skip"):
            continue
        if direction == "long":
            tp_lvl, sl_lvl = rh, rl - width
        else:
            tp_lvl, sl_lvl = rl, rh + width
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
        if res == "TP":
            tp += 1
            per_year[day.year][0] += 1
        elif res == "SL":
            sl += 1
            per_year[day.year][1] += 1
    return n, tp, sl, per_year


def parse_starts(spec):
    if ":" in spec:
        rng, step = spec.split(":")
        lo, hi = rng.split("-")
        return list(range(int(lo), int(hi) + 1, int(step)))
    return [int(x) for x in spec.split(",")]


def fmt(m):
    return f"{m // 60:02d}:{m % 60:02d}"


def main():
    data_dir = sys.argv[1]
    starts = parse_starts(sys.argv[2])
    durations = [int(x) for x in sys.argv[3].split(",")]
    out_csv = sys.argv[4] if len(sys.argv) > 4 else "fade_zone_search.csv"

    print("Lade Daten...", flush=True)
    days = load_days(data_dir)
    print(f"{len(days)} Tage. Teste {len(starts) * len(durations)} Zonen...", flush=True)

    rows = []
    total = len(starts) * len(durations)
    k = 0
    for dur in durations:
        for s in starts:
            k += 1
            if s + dur > 1440:
                continue
            n, tp, sl, per_year = simulate(days, s, dur)
            decided = tp + sl
            if n < MIN_DAYS or decided < n * 0.5:
                continue
            wr = tp / decided * 100
            yr_wrs = {y: (v[0] / (v[0] + v[1]) * 100 if v[0] + v[1] > 20 else None)
                      for y, v in per_year.items()}
            valid = [v for v in yr_wrs.values() if v is not None]
            rows.append({
                "start": fmt(s), "end": fmt(s + dur), "dur": dur,
                "days": n, "trades": decided, "tp": tp, "sl": sl,
                "winrate": round(wr, 1),
                "worst_year": round(min(valid), 1) if valid else "",
                "best_year": round(max(valid), 1) if valid else "",
                "per_year": " ".join(f"{y}:{v:.0f}" for y, v in sorted(yr_wrs.items())
                                     if v is not None),
            })
            if k % 200 == 0:
                print(f"  {k}/{total}...", flush=True)

    rows.sort(key=lambda r: -r["winrate"])
    with open(out_csv, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)

    print(f"\nTop 25 Zonen nach Win-Rate (RR 1:1, Fade an der Linie):")
    print(f"{'Zone':>13} {'Dauer':>6} {'Trades':>7} {'WR%':>6} {'schlechtestes J.':>17}")
    for r in rows[:25]:
        print(f"{r['start']}-{r['end']:>5} {r['dur']:>5}m {r['trades']:>7} "
              f"{r['winrate']:>6} {str(r['worst_year']):>17}")


if __name__ == "__main__":
    main()
