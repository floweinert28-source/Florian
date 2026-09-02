"""Deskriptive Statistiken rund um 09:30 NY (Train/Test getrennt ausgewiesen)."""
import sys
from bisect import bisect_left
from collections import defaultdict
sys.path.insert(0, '/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/orb_open')
from common import *  # noqa

instr = sys.argv[1]
days = get_days(instr)
td = trading_days(days)
print(instr, 'Handelstage', len(td))


def pct(a, b):
    return f"{100*a/b:5.1f}% (n={b})" if b else 'n/a'


def bucket_stats(title, rows, key_fn, val_fn):
    """rows: liste; key_fn -> bucket; val_fn -> bool"""
    for split in ('TRAIN', 'TEST'):
        agg = defaultdict(lambda: [0, 0])
        for r in rows:
            if (r['date'] <= TRAIN_END) != (split == 'TRAIN'):
                continue
            k = key_fn(r)
            if k is None:
                continue
            agg[k][1] += 1
            if val_fn(r):
                agg[k][0] += 1
        print(f"  {title} [{split}]: " + ' | '.join(f"{k}: {pct(v[0], v[1])}" for k, v in sorted(agg.items())))


# ---------- Tagesdaten sammeln ----------
rows = []
for i, d in enumerate(td):
    bars = days[d]
    mods, o, c, l, h = bars
    a = bisect_left(mods, OPEN)
    b = bisect_left(mods, RTH_END)
    pc = prev_close(days, td, i)
    onr = overnight_range(days, td, i)
    if pc is None or onr is None:
        continue
    op = o[a]
    rth_h = max(h[a:b]); rth_l = min(l[a:b]); rth_c = c[b - 1]
    # ATR-Proxy: Mittel der RTH-Ranges der letzten 10 Tage
    rr = []
    for k in range(max(0, i - 10), i):
        bb = days[td[k]]
        aa = bisect_left(bb[0], OPEN); bbb = bisect_left(bb[0], RTH_END)
        rr.append(max(bb[4][aa:bbb]) - min(bb[3][aa:bbb]))
    atr = sum(rr) / len(rr) if rr else None
    if atr is None:
        continue
    r = {'date': d, 'open': op, 'pc': pc, 'gap': op - pc, 'atr': atr, 'on_h': onr[0], 'on_l': onr[1],
         'rth_h': rth_h, 'rth_l': rth_l, 'rth_c': rth_c, 'bars': bars, 'a': a, 'b': b}
    # Gap-Fill Zeitpunkt
    fill_t = None
    for j in range(a, b):
        if (r['gap'] > 0 and l[j] <= pc) or (r['gap'] < 0 and h[j] >= pc):
            fill_t = mods[j]; break
    r['fill_t'] = fill_t
    # Opening Ranges
    for dur in (5, 15, 30, 60):
        rh = max(h[a:a + dur]); rl = min(l[a:a + dur])
        r[f'or{dur}_h'] = rh; r[f'or{dur}_l'] = rl
        # erster Close ausserhalb nach der Range
        first = None; both = False
        for j in range(a + dur, b):
            if c[j] > rh:
                if first is None: first = ('up', mods[j], j)
                elif first[0] == 'down': both = True; break
            elif c[j] < rl:
                if first is None: first = ('down', mods[j], j)
                elif first[0] == 'up': both = True; break
        r[f'or{dur}_first'] = first
        r[f'or{dur}_both'] = both
        # Nach erstem Break: erreicht Kurs 1x Range-Weite weiter (Extension) bevor zurueck zur Range-Mitte?
        if first:
            w = rh - rl
            mid = (rh + rl) / 2
            ext = None
            for j in range(first[2] + 1, b):
                if first[0] == 'up':
                    if l[j] <= mid: ext = False; break
                    if h[j] >= rh + w: ext = True; break
                else:
                    if h[j] >= mid: ext = False; break
                    if l[j] <= rl - w: ext = True; break
            r[f'or{dur}_ext'] = ext
            # Close-Richtung stimmt mit Break ueberein?
            r[f'or{dur}_close_agree'] = (rth_c > c[first[2]]) if first[0] == 'up' else (rth_c < c[first[2]])
    # 09:30-10:00 Hoch/Tief = Tagesextrem?
    r['h30_is_day_high'] = r['or30_h'] >= rth_h
    r['l30_is_day_low'] = r['or30_l'] <= rth_l
    r['h15_is_day_high'] = r['or15_h'] >= rth_h
    r['l15_is_day_low'] = r['or15_l'] <= rth_l
    # Judas: Richtung der ersten 5/15 min (Close vs Open) vs Rest des Tages
    for dur in (5, 15):
        c0 = c[a + dur - 1]
        r[f'j{dur}_dir'] = 'up' if c0 > op else ('down' if c0 < op else None)
        r[f'j{dur}_rev'] = (rth_c < c0) if c0 > op else ((rth_c > c0) if c0 < op else None)
        # Wird das Extrem der ersten dur Minuten in der Gegenrichtung des Moves gehandelt (Judas-Swing = Move umgekehrt und Open durchbrochen)?
        rh = max(h[a:a + dur]); rl = min(l[a:a + dur])
        if c0 > op:
            r[f'j{dur}_open_retest'] = any(l[j] <= op for j in range(a + dur, b))
        elif c0 < op:
            r[f'j{dur}_open_retest'] = any(h[j] >= op for j in range(a + dur, b))
        else:
            r[f'j{dur}_open_retest'] = None
    # ON-Sweep in erster Stunde
    sw = None
    for j in range(a, a + 60):
        hh = h[j] >= onr[0]; hl = l[j] <= onr[1]
        if hh and hl: sw = 'both'; break
        if hh: sw = 'high'; break
        if hl: sw = 'low'; break
    r['on_sweep'] = sw
    if sw in ('high', 'low'):
        # Danach: schliesst der Tag zurueck innerhalb der ON-Range (Reversal) oder darueber (Continuation)?
        r['on_sweep_rev'] = (rth_c < onr[0]) if sw == 'high' else (rth_c > onr[1])
        # Erreicht der Kurs nach Sweep die ON-Mitte vor dem RTH-Ende?
        mid = (onr[0] + onr[1]) / 2
        r['on_sweep_mid'] = (rth_l <= mid) if sw == 'high' else (rth_h >= mid)
    # Open relativ zur ON-Range
    onw = onr[0] - onr[1]
    pos = (op - onr[1]) / onw if onw > 0 else None
    r['open_pos_on'] = pos
    rows.append(r)

print('Tage mit vollstaendigen Daten:', len(rows))

# ---------- GAP ----------
print('\n=== GAP (Open 09:30 vs Close 15:59 Vortag) ===')
def gap_bucket(r):
    g = r['gap'] / r['atr']
    ag = abs(g)
    if ag < 0.05: return '0 |gap|<0.05atr'
    if ag < 0.15: return '1 0.05-0.15'
    if ag < 0.30: return '2 0.15-0.30'
    if ag < 0.50: return '3 0.30-0.50'
    return '4 >0.50'
bucket_stats('Gap-Fill bis 16:00', [r for r in rows if r['gap'] != 0], gap_bucket, lambda r: r['fill_t'] is not None)
bucket_stats('Gap-Fill bis 10:30', [r for r in rows if r['gap'] != 0], gap_bucket, lambda r: r['fill_t'] is not None and r['fill_t'] < 630)
bucket_stats('Gap-Fill bis 12:00', [r for r in rows if r['gap'] != 0], gap_bucket, lambda r: r['fill_t'] is not None and r['fill_t'] < 720)
bucket_stats('Gap-Up: Close > Open (Gap-and-Go)', [r for r in rows if r['gap'] > 0], gap_bucket, lambda r: r['rth_c'] > r['open'])
bucket_stats('Gap-Down: Close < Open (Gap-and-Go)', [r for r in rows if r['gap'] < 0], gap_bucket, lambda r: r['rth_c'] < r['open'])
print('  Gap in Punkten: Median |gap| = ', sorted(abs(r['gap']) for r in rows)[len(rows)//2], ' Median ATR =', sorted(r['atr'] for r in rows)[len(rows)//2])

# ---------- ORB ----------
print('\n=== OPENING RANGE BREAKOUT ===')
for dur in (5, 15, 30, 60):
    sub = [r for r in rows if r.get(f'or{dur}_first')]
    print(f" OR{dur}: Break-Quote (irgendein Close ausserhalb bis 16:00): {pct(len(sub), len(rows))}")
    bucket_stats(f'OR{dur} beide Seiten gebrochen', sub, lambda r: 'all', lambda r: r[f'or{dur}_both'])
    bucket_stats(f'OR{dur} Extension 1xW vor Rueckkehr Mitte', sub, lambda r: 'all', lambda r: r[f'or{dur}_ext'] is True)
    bucket_stats(f'OR{dur} Extension 1xW (nach Break-Richtung)', sub, lambda r: r[f'or{dur}_first'][0], lambda r: r[f'or{dur}_ext'] is True)
    bucket_stats(f'OR{dur} Close stimmt mit Break-Richtung', sub, lambda r: 'all', lambda r: r[f'or{dur}_close_agree'])
    # Break-Zeitpunkt
    bucket_stats(f'OR{dur} Extension nach Break-Zeit', sub,
                 lambda r: 'a <10:00' if r[f'or{dur}_first'][1] < 600 else ('b 10-11' if r[f'or{dur}_first'][1] < 660 else 'c >11'),
                 lambda r: r[f'or{dur}_ext'] is True)
    # Range-Weite relativ ATR
    bucket_stats(f'OR{dur} Extension nach Range-Weite/ATR', sub,
                 lambda r: 'narrow' if (r[f'or{dur}_h'] - r[f'or{dur}_l']) / r['atr'] < 0.15 else ('mid' if (r[f'or{dur}_h'] - r[f'or{dur}_l']) / r['atr'] < 0.3 else 'wide'),
                 lambda r: r[f'or{dur}_ext'] is True)
    # Break in Gap-Richtung vs gegen Gap
    bucket_stats(f'OR{dur} Extension: Break mit/gegen Gap', [r for r in sub if abs(r['gap']) / r['atr'] > 0.1],
                 lambda r: 'mit Gap' if (r[f'or{dur}_first'][0] == 'up') == (r['gap'] > 0) else 'gegen Gap',
                 lambda r: r[f'or{dur}_ext'] is True)

# ---------- 09:30-10:00 Extrem ----------
print('\n=== 09:30-10:00 / 09:45 HOCH/TIEF = TAGES-EXTREM (RTH) ===')
bucket_stats('OR30 High = Tageshoch', rows, lambda r: 'all', lambda r: r['h30_is_day_high'])
bucket_stats('OR30 Low = Tagestief', rows, lambda r: 'all', lambda r: r['l30_is_day_low'])
bucket_stats('OR30 H oder L = Tagesextrem', rows, lambda r: 'all', lambda r: r['h30_is_day_high'] or r['l30_is_day_low'])
bucket_stats('OR15 H oder L = Tagesextrem', rows, lambda r: 'all', lambda r: r['h15_is_day_high'] or r['l15_is_day_low'])
bucket_stats('OR30 High = Tageshoch nach Gap', rows, lambda r: 'gap up' if r['gap'] / r['atr'] > 0.1 else ('gap down' if r['gap'] / r['atr'] < -0.1 else 'flat'), lambda r: r['h30_is_day_high'])
bucket_stats('OR30 Low = Tagestief nach Gap', rows, lambda r: 'gap up' if r['gap'] / r['atr'] > 0.1 else ('gap down' if r['gap'] / r['atr'] < -0.1 else 'flat'), lambda r: r['l30_is_day_low'])
# Nach Position in OR30 um 10:00 (Close bei 09:59 relativ zur OR30)
def pos30(r):
    bars = r['bars']; c = bars[2]; j = r['a'] + 29
    w = r['or30_h'] - r['or30_l']
    p = (c[j] - r['or30_l']) / w if w > 0 else 0.5
    return 'a unteres Drittel' if p < 0.33 else ('c oberes Drittel' if p > 0.67 else 'b Mitte')
bucket_stats('OR30 High = Tageshoch nach Close-Position 09:59', rows, pos30, lambda r: r['h30_is_day_high'])
bucket_stats('OR30 Low = Tagestief nach Close-Position 09:59', rows, pos30, lambda r: r['l30_is_day_low'])

# ---------- JUDAS ----------
print('\n=== JUDAS SWING ===')
for dur in (5, 15):
    sub = [r for r in rows if r[f'j{dur}_dir']]
    bucket_stats(f'Erste {dur}min Richtung wird bis 16:00 umgekehrt (Close < Close{dur})', sub, lambda r: r[f'j{dur}_dir'], lambda r: r[f'j{dur}_rev'])
    bucket_stats(f'Open-Preis wird nach {dur}min-Move wieder gehandelt', sub, lambda r: r[f'j{dur}_dir'], lambda r: r[f'j{dur}_open_retest'])

# ---------- ON SWEEP ----------
print('\n=== OVERNIGHT-RANGE SWEEP IN ERSTER STUNDE ===')
bucket_stats('Sweep-Typ', rows, lambda r: str(r['on_sweep']), lambda r: True)
sub = [r for r in rows if r['on_sweep'] in ('high', 'low')]
bucket_stats('Sweep -> RTH-Close zurueck in ON-Range', sub, lambda r: r['on_sweep'], lambda r: r['on_sweep_rev'])
bucket_stats('Sweep -> ON-Mitte erreicht bis 16:00', sub, lambda r: r['on_sweep'], lambda r: r['on_sweep_mid'])
bucket_stats('Sweep -> Close zurueck (nach ON-Weite/ATR)', sub, lambda r: 'narrowON' if (r['on_h'] - r['on_l']) / r['atr'] < 0.5 else ('midON' if (r['on_h'] - r['on_l']) / r['atr'] < 0.9 else 'wideON'), lambda r: r['on_sweep_rev'])
bucket_stats('Open-Position in ON-Range', rows, lambda r: None if r['open_pos_on'] is None else ('a unten <0.25' if r['open_pos_on'] < 0.25 else ('c oben >0.75' if r['open_pos_on'] > 0.75 else ('x ausserhalb' if r['open_pos_on'] > 1 or r['open_pos_on'] < 0 else 'b mitte'))), lambda r: True)
