"""Fade-Trade-Backtest: Zone 06:20-06:35 NY (15-min-Range).

Setup:
- Range = Hoch/Tief zwischen 06:20 und 06:35 NY-Zeit.
- Nach Range-Ende: erster Hit einer Linie loest den Trade aus (Limit an der Linie):
  - Hit Zonen-Tief  -> LONG  @ range_low,  TP = range_high, SL = range_low  - width/0.95
  - Hit Zonen-Hoch  -> SHORT @ range_high, TP = range_low,  SL = range_high + width/0.95
- RR = 1 : 0.95 (TP-Distanz = Range-Breite, SL-Distanz = Breite/0.95).
- Risiko >= 300 USD pro Trade: NQ E-mini (20 USD/Punkt), Kontrakte aufgerundet.
- Ein Trade pro Tag. Weder TP noch SL bis Tagesende (NY) -> Exit zum letzten Kurs.
- Konservativ: trifft ein 1-min-Bar TP und SL gleichzeitig, zaehlt der SL.

Aufruf: python fade_trade_backtest.py <data_dir> [out_csv]
"""

import csv
import datetime as dt
import glob
import lzma
import math
import os
import struct
import sys
from collections import defaultdict
from zoneinfo import ZoneInfo

NY = ZoneInfo("America/New_York")
UTC = ZoneInfo("UTC")
PRICE_SCALE = 1000.0

RANGE_START_MIN = 6 * 60 + 20   # 06:20 NY
RANGE_END_MIN = 6 * 60 + 35     # 06:35 NY (exklusiv)
MIN_RANGE_BARS = 13
RR = 0.95                        # Reward = 0.95 x Risk
RISK_USD = 300.0
USD_PER_POINT = 20.0             # NQ E-mini


def load_all(data_dir):
    bars = []
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
            ts = base + dt.timedelta(seconds=off)
            ny = ts.astimezone(NY)
            bars.append((ny, o / PRICE_SCALE, c / PRICE_SCALE,
                         low / PRICE_SCALE, high / PRICE_SCALE))
    bars.sort(key=lambda b: b[0])
    return bars


def main():
    data_dir = sys.argv[1] if len(sys.argv) > 1 else "data"
    out_csv = sys.argv[2] if len(sys.argv) > 2 else "fade_trades.csv"

    by_day = defaultdict(list)
    for b in load_all(data_dir):
        by_day[b[0].date()].append(b)

    start_day = dt.date(2021, 9, 1)
    end_day = dt.date(2026, 8, 31)

    trades = []
    for day in sorted(by_day):
        if not (start_day <= day <= end_day):
            continue
        day_bars = by_day[day]
        rng = [b for b in day_bars
               if RANGE_START_MIN <= b[0].hour * 60 + b[0].minute < RANGE_END_MIN]
        if len(rng) < MIN_RANGE_BARS:
            continue
        rh = max(b[4] for b in rng)
        rl = min(b[3] for b in rng)
        width = rh - rl
        if width <= 0:
            continue
        sl_dist = width / RR

        post = [b for b in day_bars if b[0].hour * 60 + b[0].minute >= RANGE_END_MIN]

        direction = None
        entry_time = None
        for ny, o, c, low, high, idx in [(b[0], b[1], b[2], b[3], b[4], i)
                                         for i, b in enumerate(post)]:
            hit_high = high >= rh
            hit_low = low <= rl
            if hit_high or hit_low:
                # Bei Beruehrung beider Linien im selben Bar: konservativ Skip
                if hit_high and hit_low:
                    direction = "skip"
                else:
                    direction = "short" if hit_high else "long"
                entry_time = ny
                entry_idx = idx
                break
        if direction is None:
            trades.append({"date": day.isoformat(), "dir": "none", "result": "NO_TRADE",
                           "entry_time": "", "exit_time": "", "pnl_usd": 0.0,
                           "contracts": 0, "range_pts": round(width, 2)})
            continue
        if direction == "skip":
            trades.append({"date": day.isoformat(), "dir": "both", "result": "SKIP_AMBIGUOUS",
                           "entry_time": entry_time.strftime("%H:%M"), "exit_time": "",
                           "pnl_usd": 0.0, "contracts": 0, "range_pts": round(width, 2)})
            continue

        if direction == "long":
            entry, tp, sl = rl, rh, rl - sl_dist
        else:
            entry, tp, sl = rh, rl, rh + sl_dist

        contracts = max(1, math.ceil(RISK_USD / (sl_dist * USD_PER_POINT)))
        risk_usd = contracts * sl_dist * USD_PER_POINT
        reward_usd = contracts * width * USD_PER_POINT

        result = None
        exit_time = None
        pnl = None
        for b in post[entry_idx:]:
            ny, o, c, low, high = b
            if direction == "long":
                hit_sl = low <= sl
                hit_tp = high >= tp
            else:
                hit_sl = high >= sl
                hit_tp = low <= tp
            if hit_sl:                      # konservativ: SL vor TP
                result, pnl, exit_time = "SL", -risk_usd, ny
                break
            if hit_tp:
                result, pnl, exit_time = "TP", reward_usd, ny
                break
        if result is None:
            last = post[-1]
            close = last[2]
            pts = (close - entry) if direction == "long" else (entry - close)
            result, pnl, exit_time = "EOD", pts * USD_PER_POINT * contracts, last[0]

        trades.append({"date": day.isoformat(), "dir": direction, "result": result,
                       "entry_time": entry_time.strftime("%H:%M"),
                       "exit_time": exit_time.strftime("%H:%M"),
                       "pnl_usd": round(pnl, 2), "contracts": contracts,
                       "range_pts": round(width, 2)})

    with open(out_csv, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(trades[0].keys()))
        w.writeheader()
        w.writerows(trades)

    executed = [t for t in trades if t["result"] in ("TP", "SL", "EOD")]
    tp = sum(1 for t in executed if t["result"] == "TP")
    sl = sum(1 for t in executed if t["result"] == "SL")
    eod = sum(1 for t in executed if t["result"] == "EOD")
    no_trade = sum(1 for t in trades if t["result"] == "NO_TRADE")
    skipped = sum(1 for t in trades if t["result"] == "SKIP_AMBIGUOUS")
    total_pnl = sum(t["pnl_usd"] for t in executed)
    eod_pnl = sum(t["pnl_usd"] for t in executed if t["result"] == "EOD")

    equity = 0.0
    peak = 0.0
    max_dd = 0.0
    for t in executed:
        equity += t["pnl_usd"]
        peak = max(peak, equity)
        max_dd = max(max_dd, peak - equity)

    longs = [t for t in executed if t["dir"] == "long"]
    shorts = [t for t in executed if t["dir"] == "short"]

    def wr(ts):
        d = [t for t in ts if t["result"] in ("TP", "SL")]
        return (sum(1 for t in d if t["result"] == "TP") / len(d) * 100) if d else 0.0

    print(f"Zeitraum: {trades[0]['date']} bis {trades[-1]['date']}")
    print(f"Tage mit Range:      {len(trades)}")
    print(f"Trades ausgefuehrt:  {len(executed)}  (kein Hit: {no_trade}, "
          f"beide Linien im selben Bar uebersprungen: {skipped})")
    print(f"  TP:  {tp}  ({tp / len(executed) * 100:.1f}%)")
    print(f"  SL:  {sl}  ({sl / len(executed) * 100:.1f}%)")
    print(f"  EOD: {eod}  ({eod / len(executed) * 100:.1f}%)  (PnL daraus: {eod_pnl:+.0f} USD)")
    print(f"Win-Rate (nur TP/SL): {wr(executed):.1f}%  | Long: {wr(longs):.1f}% "
          f"({len(longs)}) | Short: {wr(shorts):.1f}% ({len(shorts)})")
    print(f"\nGesamt-PnL:  {total_pnl:+,.0f} USD")
    print(f"Ø pro Trade: {total_pnl / len(executed):+,.0f} USD")
    print(f"Max Drawdown: {max_dd:,.0f} USD")
    print("\nPro Jahr:")
    per_year = defaultdict(lambda: [0, 0, 0.0])
    for t in executed:
        y = t["date"][:4]
        per_year[y][0] += 1
        if t["result"] == "TP":
            per_year[y][1] += 1
        per_year[y][2] += t["pnl_usd"]
    for y in sorted(per_year):
        n, w_, p = per_year[y]
        print(f"  {y}: {n} Trades, TP-Quote {w_ / n * 100:.1f}%, PnL {p:+,.0f} USD")


if __name__ == "__main__":
    main()
