"""Fade-Trade Variante 2: Zone 06:20-06:35 NY, TP verdoppelt + Breakeven-Regel.

Setup wie Variante 1 (Entry an der Linie beim ersten Hit, SL = Breite/0.95
hinter der Linie, Risiko >= 300 USD, NQ 20 USD/Punkt), aber:
- TP = 2 Range-Breiten vom Entry (RR = 1 : 1.9).
- Erreicht der Preis die andere Zonenseite (den alten TP, 1 Breite),
  wird der SL auf Breakeven (Entry) gezogen.
- Ausgaenge: SL (-1R), BE (0), TP (+1.9R), EOD (Restwert am Tagesende).
- Konservativ pro 1-min-Bar: Stop wird vor TP/Trigger geprueft.

Aufruf: python fade_trade_be_backtest.py <data_dir> [out_csv]
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

RANGE_START_MIN = 6 * 60 + 20
RANGE_END_MIN = 6 * 60 + 35
MIN_RANGE_BARS = 13
RR_SL = 0.95            # SL-Distanz = Breite / 0.95
TP_MULT = 2.0           # TP-Distanz = 2 x Breite
RISK_USD = 300.0
USD_PER_POINT = 20.0


def load_all(data_dir):
    by_day = defaultdict(list)
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
            by_day[ny.date()].append((ny, o / PRICE_SCALE, c / PRICE_SCALE,
                                      low / PRICE_SCALE, high / PRICE_SCALE))
    return by_day


def main():
    data_dir = sys.argv[1] if len(sys.argv) > 1 else "data"
    out_csv = sys.argv[2] if len(sys.argv) > 2 else "fade_trades_be.csv"

    by_day = load_all(data_dir)
    start_day = dt.date(2021, 9, 1)
    end_day = dt.date(2026, 8, 31)

    trades = []
    for day in sorted(by_day):
        if not (start_day <= day <= end_day):
            continue
        bars = sorted(by_day[day])
        rng = [b for b in bars
               if RANGE_START_MIN <= b[0].hour * 60 + b[0].minute < RANGE_END_MIN]
        if len(rng) < MIN_RANGE_BARS:
            continue
        rh = max(b[4] for b in rng)
        rl = min(b[3] for b in rng)
        width = rh - rl
        if width <= 0:
            continue
        sl_dist = width / RR_SL

        post = [b for b in bars if b[0].hour * 60 + b[0].minute >= RANGE_END_MIN]

        direction = None
        for i, b in enumerate(post):
            hh = b[4] >= rh
            hl = b[3] <= rl
            if hh or hl:
                direction = "skip" if (hh and hl) else ("short" if hh else "long")
                ei, et = i, b[0]
                break
        if direction in (None, "skip"):
            continue

        if direction == "long":
            entry = rl
            sl = rl - sl_dist
            be_trigger = rh                      # alte TP-Linie
            tp = rl + TP_MULT * width
        else:
            entry = rh
            sl = rh + sl_dist
            be_trigger = rl
            tp = rh - TP_MULT * width

        contracts = max(1, math.ceil(RISK_USD / (sl_dist * USD_PER_POINT)))
        risk_usd = contracts * sl_dist * USD_PER_POINT
        reward_usd = contracts * TP_MULT * width * USD_PER_POINT

        be_active = False
        result = None
        for b in post[ei:]:
            ny, o, c, low, high = b
            if direction == "long":
                hit_stop = low <= (entry if be_active else sl)
                hit_trigger = high >= be_trigger
                hit_tp = high >= tp
            else:
                hit_stop = high >= (entry if be_active else sl)
                hit_trigger = low <= be_trigger
                hit_tp = low <= tp
            if hit_stop:                          # konservativ: Stop zuerst
                if be_active:
                    result, pnl, xt = "BE", 0.0, ny
                else:
                    result, pnl, xt = "SL", -risk_usd, ny
                break
            if hit_tp:
                result, pnl, xt = "TP", reward_usd, ny
                break
            if hit_trigger:
                be_active = True
        if result is None:
            last = post[-1]
            pts = (last[2] - entry) if direction == "long" else (entry - last[2])
            result, pnl, xt = "EOD", pts * USD_PER_POINT * contracts, last[0]
            if be_active and pnl < 0:
                pnl = 0.0                        # BE-Stop haette vorher gegriffen

        trades.append({"date": day.isoformat(), "dir": direction, "result": result,
                       "entry_time": et.strftime("%H:%M"),
                       "exit_time": xt.strftime("%H:%M"),
                       "pnl_usd": round(pnl, 2), "contracts": contracts,
                       "range_pts": round(width, 2)})

    with open(out_csv, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(trades[0].keys()))
        w.writeheader()
        w.writerows(trades)

    n = len(trades)
    cnt = {r: sum(1 for t in trades if t["result"] == r) for r in ("TP", "SL", "BE", "EOD")}
    total = sum(t["pnl_usd"] for t in trades)
    eod_pnl = sum(t["pnl_usd"] for t in trades if t["result"] == "EOD")

    equity = peak = max_dd = 0.0
    for t in trades:
        equity += t["pnl_usd"]
        peak = max(peak, equity)
        max_dd = max(max_dd, peak - equity)

    print(f"Zeitraum: {trades[0]['date']} bis {trades[-1]['date']}")
    print(f"Trades: {n}")
    for r in ("TP", "SL", "BE", "EOD"):
        extra = f"  (PnL daraus: {eod_pnl:+,.0f} USD)" if r == "EOD" else ""
        print(f"  {r}: {cnt[r]}  ({cnt[r] / n * 100:.1f}%){extra}")
    print(f"\nGesamt-PnL:  {total:+,.0f} USD")
    print(f"Ø pro Trade: {total / n:+,.0f} USD")
    print(f"Max Drawdown: {max_dd:,.0f} USD")
    print("\nPro Jahr:")
    per_year = defaultdict(lambda: [0, 0.0])
    for t in trades:
        per_year[t["date"][:4]][0] += 1
        per_year[t["date"][:4]][1] += t["pnl_usd"]
    for y in sorted(per_year):
        c, p = per_year[y]
        print(f"  {y}: {c} Trades, PnL {p:+,.0f} USD")


if __name__ == "__main__":
    main()
