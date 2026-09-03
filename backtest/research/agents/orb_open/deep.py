"""Deep-Dive fuer einen Kandidaten: python3 deep.py <NQ|ES> <family> "<cfg-dict>" <csv_name>"""
import sys
import ast
import math
from collections import defaultdict
sys.path.insert(0, '/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/orb_open')
from common import *  # noqa
import scan

instr, family, cfg_s, csv_name = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
cfg = ast.literal_eval(cfg_s)
scan.setup(instr)
trades = scan.FAMS[family](cfg)
trades.sort(key=lambda t: (t['date'], t['entry_time']))
write_csv(trades, RES + csv_name)
s = summarize(trades, label=f"{instr} {family} {cfg}")
n = len(trades)
pn = [t['pnl_usd'] for t in trades]
mean = sum(pn) / n
sd = math.sqrt(sum((x - mean) ** 2 for x in pn) / (n - 1))
print(f"  t-Stat (Mittel/SE): {mean / (sd / math.sqrt(n)):.2f}   Mittel {mean:.1f} USD  SD {sd:.0f}")
for split, sub in (('TRAIN', [t for t in trades if t['date'] <= TRAIN_END]), ('TEST', [t for t in trades if t['date'] > TRAIN_END])):
    m = len(sub); mu = sum(t['pnl_usd'] for t in sub) / m
    sdv = math.sqrt(sum((t['pnl_usd'] - mu) ** 2 for t in sub) / (m - 1))
    tp = sum(1 for t in sub if t['result'] == 'TP'); sl = sum(1 for t in sub if t['result'] == 'SL'); ts = m - tp - sl
    wr = sum(1 for t in sub if t['pnl_usd'] > 0) / m * 100
    print(f"  {split}: N={m} WR={wr:.1f}% mean={mu:.1f} t={mu / (sdv / math.sqrt(m)):.2f}  TP/SL/TS={tp}/{sl}/{ts}  "
          f"TS-PnL={sum(t['pnl_usd'] for t in sub if t['result'] == 'TS'):.0f}")
# Ausreisser
srt = sorted(pn, reverse=True)
for k in (5, 10, 20):
    print(f"  ohne Top-{k} Gewinner: net={sum(pn) - sum(srt[:k]):.0f}  (Top-{k} Summe {sum(srt[:k]):.0f})")
print(f"  groesster Gewinn {srt[0]:.0f}, groesster Verlust {srt[-1]:.0f}, Median {sorted(pn)[n//2]:.0f}")
# Richtung
for d in ('long', 'short'):
    sub = [t for t in trades if t['dir'] == d]
    if sub:
        tr = sum(t['pnl_usd'] for t in sub if t['date'] <= TRAIN_END); te = sum(t['pnl_usd'] for t in sub if t['date'] > TRAIN_END)
        print(f"  {d}: N={len(sub)} WR={sum(1 for t in sub if t['pnl_usd'] > 0) / len(sub) * 100:.1f}% net={sum(t['pnl_usd'] for t in sub):.0f} train={tr:.0f} test={te:.0f}")
# Slippage-Sensitivitaet
cfgi = INSTR[instr]
for extra in (0.5, 1.0, 2.0):
    adj = [t['pnl_usd'] - extra * cfgi['pv'] for t in trades]
    tr = sum(a for a, t in zip(adj, trades) if t['date'] <= TRAIN_END); te = sum(a for a, t in zip(adj, trades) if t['date'] > TRAIN_END)
    print(f"  +{extra} Pkt Slippage/RT: net={sum(adj):.0f} train={tr:.0f} test={te:.0f}")
# Monate
pm = defaultdict(float)
for t in trades:
    pm[(t['date'].year, t['date'].month)] += t['pnl_usd']
print(f"  Monate positiv: {sum(1 for v in pm.values() if v > 0)}/{len(pm)}")
# Halbjahre
ph = defaultdict(float)
for t in trades:
    ph[(t['date'].year, 1 if t['date'].month <= 6 else 2)] += t['pnl_usd']
print("  Halbjahre: " + ' '.join(f"{y}H{hh}:{v:+.0f}" for (y, hh), v in sorted(ph.items())))
# Entry-Zeit-Verteilung / Exit-Zeit
et = defaultdict(lambda: [0, 0.0])
for t in trades:
    hh = t['entry_time'][:2]
    et[hh][0] += 1; et[hh][1] += t['pnl_usd']
print("  nach Entry-Stunde: " + ' '.join(f"{k}h:n={v[0]},{v[1]:+.0f}" for k, v in sorted(et.items())))
# SL-Distanz
sld = sorted(t['sl_dist'] for t in trades)
print(f"  SL-Distanz Median {sld[n//2]:.1f} Pkt, TP-Distanz Median {sorted(t['tp_dist'] for t in trades)[n//2]:.1f} Pkt")
