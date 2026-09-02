"""Dukascopy 1-min-Candles (BID) fuer ein Instrument laden.

Aufruf: python3 download_dukascopy.py <INSTRUMENT> <ZIELORDNER>
  z.B.  python3 download_dukascopy.py LIGHTCMDUSD backtest/data/cl
        python3 download_dukascopy.py EURUSD      backtest/data/6e
Kann jederzeit abgebrochen und neu gestartet werden (laedt nur fehlende Tage).
"""

import datetime as dt
import os
import sys
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor

INSTR = sys.argv[1]
OUT = sys.argv[2]
os.makedirs(OUT, exist_ok=True)

start = dt.date(2021, 8, 31)
end = dt.date(2026, 8, 31)

days = []
d = start
while d <= end:
    if d.weekday() != 5:
        days.append(d)
    d += dt.timedelta(days=1)


def url_for(d):
    return (f"https://datafeed.dukascopy.com/datafeed/{INSTR}/"
            f"{d.year}/{d.month-1:02d}/{d.day:02d}/BID_candles_min_1.bi5")


def missing_days():
    return [d for d in days if not os.path.exists(os.path.join(OUT, f"{d.isoformat()}.bi5"))]


def fetch(d, retries=1):
    for _ in range(retries):
        try:
            with urllib.request.urlopen(url_for(d), timeout=30) as r:
                data = r.read()
            with open(os.path.join(OUT, f"{d.isoformat()}.bi5"), "wb") as f:
                f.write(data)
            return True
        except Exception:
            pass
    return False


# Pass 1: parallel, bis das Rate-Limit zuschlaegt
todo = missing_days()
print(f"{INSTR}: {len(todo)} Tage fehlen, Pass 1 (parallel)...", flush=True)
with ThreadPoolExecutor(max_workers=12) as ex:
    list(ex.map(fetch, todo))
print(f"{INSTR}: nach Pass 1 fehlen {len(missing_days())}", flush=True)

# Weitere Paesse: sequenziell mit Backoff
for p in range(2, 30):
    todo = missing_days()
    if not todo:
        break
    print(f"{INSTR}: Pass {p}, {len(todo)} Tage...", flush=True)
    for i, d in enumerate(todo):
        delay = 2.0
        for attempt in range(6):
            if fetch(d):
                break
            time.sleep(delay)
            delay *= 2
        time.sleep(0.35)
        if (i + 1) % 100 == 0:
            print(f"  {INSTR}: {i+1}/{len(todo)}", flush=True)

rest = missing_days()
print(f"{INSTR}: FERTIG, dauerhaft fehlend: {len(rest)}", flush=True)
for d in rest[:20]:
    print(" ", d)
