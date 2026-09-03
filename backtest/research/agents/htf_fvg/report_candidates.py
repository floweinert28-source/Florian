"""Kennzahlen je Kandidaten-CSV (fuer den Abschlussbericht)."""
import csv
import math
import sys
from collections import defaultdict

WEEKS = (5 * 52)  # 2021-09 .. 2026-08 = 5 Jahre


def metrics(path):
    rows = list(csv.DictReader(open(path)))
    rows.sort(key=lambda r: (r['date'], r['entry_time']))
    n = len(rows)
    pnl = [float(r['pnl_usd']) for r in rows]
    tp = sum(1 for r in rows if r['result'] == 'TP')
    sl = sum(1 for r in rows if r['result'] == 'SL')
    wr = tp / (tp + sl) * 100
    rr = sum(abs(float(r['tp']) - float(r['entry'])) / abs(float(r['sl']) - float(r['entry'])) for r in rows) / n
    train = sum(p for r, p in zip(rows, pnl) if r['date'] < '2025-01-01')
    test = sum(p for r, p in zip(rows, pnl) if r['date'] >= '2025-01-01')
    ntrain = sum(1 for r in rows if r['date'] < '2025-01-01')
    per_year = defaultdict(float)
    for r, p in zip(rows, pnl):
        per_year[r['date'][:4]] += p
    eq = peak = dd = 0.0
    for p in pnl:
        eq += p
        peak = max(peak, eq)
        dd = max(dd, peak - eq)
    mean = sum(pnl) / n
    sd = math.sqrt(sum((p - mean) ** 2 for p in pnl) / (n - 1))
    ypos = sum(1 for v in per_year.values() if v > 0)
    print(path.split('/')[-1])
    print(f'  N={n} (train {ntrain}, test {n-ntrain})  WR={wr:.1f}%  avgRR={rr:.2f}  net={sum(pnl):+.0f}  train={train:+.0f}  test={test:+.0f}')
    print(f'  maxDD={dd:.0f}  trades/week={n/WEEKS:.2f}  mean/trade={mean:+.0f}  t={mean/(sd/math.sqrt(n)):.2f}  years+={ypos}/{len(per_year)}')
    print('  per_year: ' + ', '.join(f'{y}:{v:+.0f}' for y, v in sorted(per_year.items())))


for p in sys.argv[1:]:
    metrics(p)
