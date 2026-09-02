"""Attribution einer Trade-CSV: Richtung, Ergebnis-Typ, Tageszeit, Jahr, t-Statistik."""
import csv
import math
import sys
from collections import defaultdict


def analyze(path):
    rows = list(csv.DictReader(open(path)))
    for r in rows:
        r['pnl'] = float(r['pnl_usd'])
    n = len(rows)
    tot = sum(r['pnl'] for r in rows)
    mean = tot / n
    sd = math.sqrt(sum((r['pnl'] - mean) ** 2 for r in rows) / (n - 1))
    print(f'{path.split("/")[-1]}: N={n} net={tot:+.0f} mean={mean:+.0f} sd={sd:.0f} t={mean/(sd/math.sqrt(n)):.2f}')

    def grp(key, name):
        d = defaultdict(lambda: [0, 0.0, 0])
        for r in rows:
            k = key(r)
            d[k][0] += 1
            d[k][1] += r['pnl']
            d[k][2] += r['result'] == 'TP'
        print('   ' + name + ': ' + ' | '.join(f'{k}: n={v[0]} net={v[1]:+.0f} wr={v[2]/v[0]*100:.0f}%' for k, v in sorted(d.items())))
    grp(lambda r: r['dir'], 'dir')
    grp(lambda r: r['result'], 'result')
    grp(lambda r: (r['date'][:4], r['dir']), 'year x dir')

    def tod(r):
        h = int(r['entry_time'][:2])
        return '18-24' if h >= 18 else ('00-05' if h < 5 else ('05-09' if h < 9 else ('09-12' if h < 12 else '12-16')))
    grp(tod, 'tod')
    grp(lambda r: r['date'][:7] >= '2025-01', 'test?')
    # Kalenderquartale positiv
    q = defaultdict(float)
    for r in rows:
        q[r['date'][:4] + 'Q' + str((int(r['date'][5:7]) - 1) // 3 + 1)] += r['pnl']
    pos = sum(1 for v in q.values() if v > 0)
    print(f'   Quartale positiv: {pos}/{len(q)}  ' + ' '.join(f'{k}:{v:+.0f}' for k, v in sorted(q.items())))


for p in sys.argv[1:]:
    analyze(p)
