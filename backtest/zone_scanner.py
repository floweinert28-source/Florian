"""Zonen-Scanner: Sucht 60-Minuten-Range-Fenster (NY-Zeit) mit maximaler
"erst eine Seite, dann die andere"-Quote und schneller Aufloesung.

Fuer jedes Kandidaten-Fenster (Startzeit ueber den ganzen Tag) wird pro Tag
die Range (Hoch/Tief) gebildet und danach geprueft, ob beide Seiten
gebrochen werden - innerhalb 1h, 2h und 4h nach Range-Ende (echte Zeit,
nicht bis Tagesende).

Aufruf: python zone_scanner.py <data_dir> [step_minutes] [out_csv]
"""

import csv
import datetime as dt
import glob
import lzma
import os
import statistics
import struct
import sys
from bisect import bisect_left
from collections import defaultdict
from zoneinfo import ZoneInfo

NY = ZoneInfo("America/New_York")
UTC = ZoneInfo("UTC")
PRICE_SCALE = 1000.0
DURATION = 60          # Range-Laenge in Minuten
MIN_RANGE_BARS = 55
HORIZONS = (60, 120, 240)  # Minuten nach Range-Ende


def load_all(data_dir):
    times, highs, lows = [], [], []
    for path in sorted(glob.glob(os.path.join(data_dir, "*.bi5"))):
        gmt_date = dt.date.fromisoformat(os.path.basename(path)[:-4])
        with open(path, "rb") as f:
            raw = f.read()
        if not raw:
            continue
        data = lzma.decompress(raw)
        base = int(dt.datetime(gmt_date.year, gmt_date.month, gmt_date.day,
                               tzinfo=UTC).timestamp()) // 60
        for i in range(len(data) // 24):
            off, _o, _c, low, high, _v = struct.unpack(
                ">IIIIIf", data[i * 24:(i + 1) * 24])
            times.append(base + off // 60)
            highs.append(high / PRICE_SCALE)
            lows.append(low / PRICE_SCALE)
    order = sorted(range(len(times)), key=lambda i: times[i])
    times = [times[i] for i in order]
    highs = [highs[i] for i in order]
    lows = [lows[i] for i in order]
    return times, highs, lows


def build_day_index(times):
    """NY-Tag -> Liste (minute_of_day, globaler Index)."""
    by_day = defaultdict(list)
    for idx, t in enumerate(times):
        ny = dt.datetime.fromtimestamp(t * 60, tz=UTC).astimezone(NY)
        by_day[ny.date()].append((ny.hour * 60 + ny.minute, idx))
    return by_day


def scan_window(start_min, times, highs, lows, by_day):
    n = 0
    wins = {h: 0 for h in HORIZONS}
    resolve_times = []
    range_sizes = []
    for day, entries in by_day.items():
        mods = [m for m, _ in entries]
        a = bisect_left(mods, start_min)
        b = bisect_left(mods, start_min + DURATION)
        if b - a < MIN_RANGE_BARS:
            continue
        i0 = entries[a][1]
        i1 = entries[b - 1][1]
        rh = max(highs[i0:i1 + 1])
        rl = min(lows[i0:i1 + 1])
        n += 1
        range_sizes.append(rh - rl)
        end_t = times[i1] + 1
        hb = lb = False
        done_at = None
        j = i1 + 1
        max_h = HORIZONS[-1]
        while j < len(times) and times[j] - end_t < max_h:
            if not hb and highs[j] > rh:
                hb = True
            if not lb and lows[j] < rl:
                lb = True
            if hb and lb:
                done_at = times[j] - end_t
                break
            j += 1
        if done_at is not None:
            resolve_times.append(done_at)
            for h in HORIZONS:
                if done_at < h:
                    wins[h] += 1
    med = statistics.median(resolve_times) if resolve_times else None
    return n, wins, med, statistics.median(range_sizes) if range_sizes else 0


def main():
    data_dir = sys.argv[1] if len(sys.argv) > 1 else "data"
    step = int(sys.argv[2]) if len(sys.argv) > 2 else 10
    out_csv = sys.argv[3] if len(sys.argv) > 3 else "zones.csv"

    print("Lade Daten...", flush=True)
    times, highs, lows = load_all(data_dir)
    print(f"{len(times)} Bars geladen. Baue Tagesindex...", flush=True)
    by_day = build_day_index(times)
    print(f"{len(by_day)} Tage. Scanne Fenster...", flush=True)

    starts = list(range(0, 23 * 60 + 1, step))
    if 8 * 60 + 12 not in starts:
        starts.append(8 * 60 + 12)  # Referenzfenster 08:12
    starts.sort()

    rows = []
    for k, s in enumerate(starts):
        n, wins, med, med_range = scan_window(s, times, highs, lows, by_day)
        if n < 200:
            continue
        rows.append({
            "start_ny": f"{s // 60:02d}:{s % 60:02d}",
            "end_ny": f"{(s + DURATION) // 60:02d}:{(s + DURATION) % 60:02d}",
            "days": n,
            "win_1h_pct": round(wins[60] / n * 100, 1),
            "win_2h_pct": round(wins[120] / n * 100, 1),
            "win_4h_pct": round(wins[240] / n * 100, 1),
            "median_resolve_min": med,
            "median_range_pts": round(med_range, 1),
        })
        if (k + 1) % 20 == 0:
            print(f"  {k + 1}/{len(starts)} Fenster...", flush=True)

    rows.sort(key=lambda r: -r["win_4h_pct"])
    with open(out_csv, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)

    print(f"\nTop 15 Fenster (sortiert nach Win innerhalb 4h), {DURATION}min Range:")
    print(f"{'Start':>6} {'Ende':>6} {'Tage':>5} {'1h%':>6} {'2h%':>6} {'4h%':>6} {'MedMin':>7} {'MedRange':>9}")
    for r in rows[:15]:
        print(f"{r['start_ny']:>6} {r['end_ny']:>6} {r['days']:>5} "
              f"{r['win_1h_pct']:>6} {r['win_2h_pct']:>6} {r['win_4h_pct']:>6} "
              f"{r['median_resolve_min']:>7} {r['median_range_pts']:>9}")
    ref = [r for r in rows if r["start_ny"] == "08:12"]
    if ref:
        r = ref[0]
        print(f"\nReferenz 08:12-09:12: 1h {r['win_1h_pct']}% | 2h {r['win_2h_pct']}% "
              f"| 4h {r['win_4h_pct']}% | Median {r['median_resolve_min']}min")


if __name__ == "__main__":
    main()
