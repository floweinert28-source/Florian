"""Backtest: 8:12-9:12 NY Range Reversal.

Regeln:
- Range = hoechstes Hoch / tiefstes Tief zwischen 08:12 und 09:12 New-York-Zeit.
- Danach bis zum Tagesende (NY-Kalendertag) beobachten:
  - WIN:  erst wird die eine Seite der Range gebrochen, danach auch die andere.
  - LOSS: keine Seite oder nur eine Seite wird bis zum neuen Tag gebrochen.

Daten: Dukascopy 1-Minuten-Bid-Candles (USATECHIDXUSD = Nasdaq 100 CFD),
eine .bi5-Datei pro GMT-Tag (LZMA, 24-Byte-Records:
offset_sec, open, close, low, high als int * 1000, volume als float32).

Aufruf: python range_reversal_backtest.py <data_dir> [out_csv]
"""

import csv
import datetime as dt
import lzma
import struct
import sys
from collections import defaultdict
from zoneinfo import ZoneInfo

NY = ZoneInfo("America/New_York")
UTC = ZoneInfo("UTC")

RANGE_START_MIN = 8 * 60 + 12   # 08:12 NY
RANGE_END_MIN = 9 * 60 + 12     # 09:12 NY (exklusiv)
MIN_RANGE_BARS = 55             # Tage mit Datenluecken in der Range ueberspringen
PRICE_SCALE = 1000.0


def load_day_file(path, gmt_date):
    """Liefert Liste von (utc_datetime, high, low) fuer eine Tagesdatei."""
    with open(path, "rb") as f:
        raw = f.read()
    if not raw:
        return []
    data = lzma.decompress(raw)
    base = dt.datetime(gmt_date.year, gmt_date.month, gmt_date.day, tzinfo=UTC)
    bars = []
    for i in range(len(data) // 24):
        off, _o, _c, low, high, _vol = struct.unpack(">IIIIIf", data[i * 24:(i + 1) * 24])
        bars.append((base + dt.timedelta(seconds=off), high / PRICE_SCALE, low / PRICE_SCALE))
    return bars


def main():
    data_dir = sys.argv[1] if len(sys.argv) > 1 else "data"
    out_csv = sys.argv[2] if len(sys.argv) > 2 else "results.csv"

    import glob
    import os

    by_ny_day = defaultdict(list)
    for path in sorted(glob.glob(os.path.join(data_dir, "*.bi5"))):
        gmt_date = dt.date.fromisoformat(os.path.basename(path)[:-4])
        for ts, high, low in load_day_file(path, gmt_date):
            ny = ts.astimezone(NY)
            by_ny_day[ny.date()].append((ny, high, low))

    start_day = dt.date(2021, 9, 1)
    end_day = dt.date(2026, 8, 31)

    rows = []
    for day in sorted(by_ny_day):
        if not (start_day <= day <= end_day):
            continue
        bars = sorted(by_ny_day[day])
        range_bars = [b for b in bars if RANGE_START_MIN <= b[0].hour * 60 + b[0].minute < RANGE_END_MIN]
        if len(range_bars) < MIN_RANGE_BARS:
            continue  # Wochenende / Feiertag / Datenluecke
        range_high = max(b[1] for b in range_bars)
        range_low = min(b[2] for b in range_bars)

        post_bars = [b for b in bars if b[0].hour * 60 + b[0].minute >= RANGE_END_MIN]

        first_break = None      # "high" / "low"
        first_break_time = None
        high_broken = False
        low_broken = False
        second_break_time = None
        for ts, high, low in post_bars:
            hb = high > range_high
            lb = low < range_low
            if first_break is None and (hb or lb):
                first_break = "high" if hb else "low"  # bei Doppelbruch im selben Bar: high
                first_break_time = ts
            if hb and not high_broken:
                high_broken = True
                if low_broken and second_break_time is None:
                    second_break_time = ts
            if lb and not low_broken:
                low_broken = True
                if high_broken and second_break_time is None:
                    second_break_time = ts
            if high_broken and low_broken:
                break

        win = high_broken and low_broken
        rows.append({
            "date": day.isoformat(),
            "range_high": f"{range_high:.3f}",
            "range_low": f"{range_low:.3f}",
            "range_size": f"{range_high - range_low:.3f}",
            "first_break": first_break or "none",
            "first_break_time_ny": first_break_time.strftime("%H:%M") if first_break_time else "",
            "second_break_time_ny": second_break_time.strftime("%H:%M") if second_break_time else "",
            "high_broken": int(high_broken),
            "low_broken": int(low_broken),
            "result": "WIN" if win else "LOSS",
        })

    with open(out_csv, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)

    total = len(rows)
    wins = sum(1 for r in rows if r["result"] == "WIN")
    no_break = sum(1 for r in rows if r["first_break"] == "none")
    one_side = total - wins - no_break
    first_high = sum(1 for r in rows if r["first_break"] == "high")
    first_low = sum(1 for r in rows if r["first_break"] == "low")
    win_after_high = sum(1 for r in rows if r["first_break"] == "high" and r["result"] == "WIN")
    win_after_low = sum(1 for r in rows if r["first_break"] == "low" and r["result"] == "WIN")

    print(f"Zeitraum: {rows[0]['date']} bis {rows[-1]['date']}")
    print(f"Handelstage:            {total}")
    print(f"WINS  (beide Seiten):   {wins}  ({wins / total * 100:.1f}%)")
    print(f"LOSS  gesamt:           {total - wins}  ({(total - wins) / total * 100:.1f}%)")
    print(f"  - nur eine Seite:     {one_side}  ({one_side / total * 100:.1f}%)")
    print(f"  - keine Seite:        {no_break}  ({no_break / total * 100:.1f}%)")
    print()
    print(f"Erster Bruch HIGH:      {first_high}  -> davon WIN: {win_after_high}"
          f" ({win_after_high / first_high * 100:.1f}%)" if first_high else "Erster Bruch HIGH: 0")
    print(f"Erster Bruch LOW:       {first_low}  -> davon WIN: {win_after_low}"
          f" ({win_after_low / first_low * 100:.1f}%)" if first_low else "Erster Bruch LOW: 0")
    print()
    print("Pro Jahr:")
    per_year = defaultdict(lambda: [0, 0])
    for r in rows:
        y = r["date"][:4]
        per_year[y][0] += 1
        if r["result"] == "WIN":
            per_year[y][1] += 1
    for y in sorted(per_year):
        n, w = per_year[y]
        print(f"  {y}: {w}/{n} Wins ({w / n * 100:.1f}%)")


if __name__ == "__main__":
    main()
