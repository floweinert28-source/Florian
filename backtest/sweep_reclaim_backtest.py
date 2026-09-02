"""Sweep-Reclaim-Strategie: Entry erst NACH dem Sweep.

Regeln pro Tag und Zone [start, start+dauer) NY-Zeit:
- Range = Hoch/Tief der Zone.
- Nach Zonen-Ende: Preis bricht eine Linie (Sweep beginnt).
- Entry erst, wenn ein 1-min-Bar wieder INNERHALB der Range schliesst
  (Reclaim). Entry zum Schlusskurs dieses Bars.
- SL: hinter dem Sweep-Extrem (tiefster/hoechster Punkt des Sweeps)
  + Puffer (Anteil der Range-Breite).
- TP-Varianten: "other" = andere Zonenseite, "mid" = Range-Mitte,
  "r1"/"r2" = 1x/2x SL-Distanz vom Entry.
- Konservativ: SL vor TP im selben Bar; Auswertung bis Tagesende.
- Ein Trade pro Tag (erster Sweep+Reclaim).

Aufruf: python sweep_reclaim_backtest.py <data_dir> <start_min> <dur_min> <tp_mode> [buffer_frac] [max_sweep_min]
"""

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
MIN_COVERAGE = 0.87

START_DAY = dt.date(2021, 9, 1)
END_DAY = dt.date(2026, 8, 31)


def load_days(data_dir):
    cache = os.path.join(data_dir, "bars_cache_ohlc.pkl")
    if os.path.exists(cache):
        with open(cache, "rb") as f:
            return pickle.load(f)
    by_day = defaultdict(lambda: ([], [], [], [], []))  # mod, o, c, low, high
    for path in sorted(glob.glob(os.path.join(data_dir, "*.bi5"))):
        gmt_date = dt.date.fromisoformat(os.path.basename(path)[:-4])
        with open(path, "rb") as f:
            raw = f.read()
        if not raw:
            continue
        data = lzma.decompress(raw)
        base = dt.datetime(gmt_date.year, gmt_date.month, gmt_date.day, tzinfo=UTC)
        for i in range(len(data) // 24):
            off, o, c, low, high, _v = struct.unpack(
                ">IIIIIf", data[i * 24:(i + 1) * 24])
            ny = (base + dt.timedelta(seconds=off)).astimezone(NY)
            d = by_day[ny.date()]
            d[0].append(ny.hour * 60 + ny.minute)
            d[1].append(o / PRICE_SCALE)
            d[2].append(c / PRICE_SCALE)
            d[3].append(low / PRICE_SCALE)
            d[4].append(high / PRICE_SCALE)
    days = {}
    for day, cols in by_day.items():
        if not (START_DAY <= day <= END_DAY):
            continue
        order = sorted(range(len(cols[0])), key=lambda i: cols[0][i])
        days[day] = tuple([col[i] for i in order] for col in cols)
    with open(cache, "wb") as f:
        pickle.dump(days, f)
    return days


def run(days, start, dur, tp_mode, buffer_frac=0.1, max_sweep_min=None):
    """Simuliert die Strategie. Liefert Liste von Trade-Dicts."""
    end_min = start + dur
    trades = []
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

        # Phase 1: Sweep finden
        direction = None
        j = b
        while j < m:
            hh = highs[j] >= rh
            hl = lows[j] <= rl
            if hh or hl:
                if hh and hl:
                    direction = "skip"
                else:
                    direction = "long" if hl else "short"  # Sweep unten -> Long
                sweep_start = j
                break
            j += 1
        if direction in (None, "skip"):
            continue

        # Phase 2: Reclaim finden (Close wieder in der Range), Sweep-Extrem tracken
        extreme = lows[sweep_start] if direction == "long" else highs[sweep_start]
        entry_idx = None
        j = sweep_start
        while j < m:
            if direction == "long":
                extreme = min(extreme, lows[j])
                if rl < closes[j] < rh:
                    entry_idx = j
                    break
            else:
                extreme = max(extreme, highs[j])
                if rl < closes[j] < rh:
                    entry_idx = j
                    break
            if max_sweep_min is not None and mods[j] - mods[sweep_start] > max_sweep_min:
                break
            j += 1
        if entry_idx is None:
            continue

        entry = closes[entry_idx]
        buf = width * buffer_frac
        if direction == "long":
            sl = extreme - buf
            sl_dist = entry - sl
            if sl_dist <= 0:
                continue
            tp = {"other": rh, "mid": (rh + rl) / 2,
                  "r1": entry + sl_dist, "r2": entry + 2 * sl_dist}[tp_mode]
            if tp <= entry:
                continue
        else:
            sl = extreme + buf
            sl_dist = sl - entry
            if sl_dist <= 0:
                continue
            tp = {"other": rl, "mid": (rh + rl) / 2,
                  "r1": entry - sl_dist, "r2": entry - 2 * sl_dist}[tp_mode]
            if tp >= entry:
                continue

        tp_dist = abs(tp - entry)
        result = None
        for j in range(entry_idx + 1, m):
            if direction == "long":
                if lows[j] <= sl:
                    result = "SL"; break
                if highs[j] >= tp:
                    result = "TP"; break
            else:
                if highs[j] >= sl:
                    result = "SL"; break
                if lows[j] <= tp:
                    result = "TP"; break
        if result is None:
            last_close = closes[-1]
            pts = (last_close - entry) if direction == "long" else (entry - last_close)
            result = "EOD"
            r_mult = pts / sl_dist
        else:
            r_mult = (tp_dist / sl_dist) if result == "TP" else -1.0

        trades.append({"day": day, "dir": direction, "result": result,
                       "r": r_mult, "rr": tp_dist / sl_dist,
                       "width": width, "sl_dist": sl_dist})
    return trades


def summarize(trades, label=""):
    n = len(trades)
    if n == 0:
        print(f"{label}: keine Trades")
        return
    tp = sum(1 for t in trades if t["result"] == "TP")
    sl = sum(1 for t in trades if t["result"] == "SL")
    eod = n - tp - sl
    dec = tp + sl
    wr = tp / dec * 100 if dec else 0
    total_r = sum(t["r"] for t in trades)
    avg_rr = sum(t["rr"] for t in trades) / n
    per_year = defaultdict(lambda: [0, 0, 0.0])
    for t in trades:
        y = t["day"].year
        per_year[y][2] += t["r"]
        if t["result"] == "TP":
            per_year[y][0] += 1
        elif t["result"] == "SL":
            per_year[y][1] += 1
    years = " | ".join(
        f"{y}:{v[0]/(v[0]+v[1])*100:.0f}%/{v[2]:+.0f}R" for y, v in sorted(per_year.items())
        if v[0] + v[1] > 0)
    print(f"{label}: {n} Trades, WR {wr:.1f}% (TP {tp}/SL {sl}/EOD {eod}), "
          f"Ø-RR 1:{avg_rr:.2f}, Summe {total_r:+.0f}R")
    print(f"   pro Jahr (WR/R): {years}")


if __name__ == "__main__":
    data_dir = sys.argv[1]
    start = int(sys.argv[2])
    dur = int(sys.argv[3])
    tp_mode = sys.argv[4]
    buffer_frac = float(sys.argv[5]) if len(sys.argv) > 5 else 0.1
    max_sweep = int(sys.argv[6]) if len(sys.argv) > 6 else None

    days = load_days(data_dir)
    trades = run(days, start, dur, tp_mode, buffer_frac, max_sweep)
    label = f"{start//60:02d}:{start%60:02d}+{dur}m TP={tp_mode} buf={buffer_frac}"
    summarize(trades, label)
