"""(c) Session-Range-Sweep INS HTF-FVG hinein -> Reversal-Trade.

Pro Tag und Session-Range [start, start+dur) (NY):
- Range = Hoch/Tief der Live-Bars in der Zone (>= 87% Abdeckung).
- Sweep = erster Bar nach Zonen-Ende, der eine Range-Linie bricht (beide Linien im selben Bar -> Skip),
  Suche bis 16:10 desselben Session-Tages (bzw. fuer Abend-Ranges bis 16:10 des Folgetages).
- FVG-Bedingung ('fvg'): Der Sweep-Bar-Extrem (Low bei Sweep unten) liegt INNERHALB eines aktiven
  gegenlaeufigen HTF-FVG (bull-FVG fuer Long): bestaetigt vor dem Sweep-Bar, Alter <= max_age,
  vorher noch nicht komplett gefuellt (kein frueherer Bar mit low < bot), bot <= sweep_low <= top.
  Variante 'fvg_touch': FVG-Zone ueberlappt mit [sweep_low, rl] (Sweep reicht bis ins FVG hinein).
  Baseline ('none'): ohne FVG-Bedingung (zum Vergleich).
- Entry: 'reclaim' = erster 1-min-Close wieder innerhalb der Range (max 120 min nach Sweep), Entry = Close.
         'mss' = Bruch des letzten 1-min-Swing-Hochs (Fraktal k=2) der Sweep-Bewegung per Close (max 120 min).
- SL = min(Sweep-Extrem, FVG-bot) - 0.1*Range-Breite; TP: other / mid / r1 / r2.
- Entry-Bar: nur SL; SL vor TP; Time-Stop 16:10; ein Trade pro Tag und Session.
Aufruf: python3 c_sweep_fvg.py NQ|ES
"""
import sys
import time
from bisect import bisect_left
from collections import defaultdict

sys.path.insert(0, '/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/htf_fvg')
from fvg_lib import (get_stream, build_candles, find_fvgs, simulate, finalize, summarize, fmt,
                     write_trades_csv, SESSION_END_MOD, EVENING_MOD)

OUT = '/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/htf_fvg'
TFS = {'15m': (15, 0, 1440), '1h': (60, 0, 2 * 1440), '4h': (240, 18 * 60, 5 * 1440)}
SESSIONS = {'0812_60': (8 * 60 + 12, 60), '0620_15': (6 * 60 + 20, 15), 'asia_2000_240': (20 * 60, 240),
            'ldn_0200_180': (2 * 60, 180), 'ny_0930_30': (9 * 60 + 30, 30)}
MAX_CONFIRM = 120


def prep_fvgs(s, tfname):
    tf, off, max_age = TFS[tfname]
    fvgs = find_fvgs(build_candles(s, tf, off))
    # fill_idx: erster Bar nach Bestaetigung, der das Gap komplett durchhandelt
    for f in fvgs:
        f['fill_idx'] = None
        i1 = min(s.n, f['confirm_idx'] + 1 + max_age)
        if f['dir'] > 0:
            for i in range(f['confirm_idx'] + 1, i1):
                if s.l[i] < f['bot']:
                    f['fill_idx'] = i
                    break
        else:
            for i in range(f['confirm_idx'] + 1, i1):
                if s.h[i] > f['top']:
                    f['fill_idx'] = i
                    break
    fvgs.sort(key=lambda f: f['confirm_idx'])
    keys = [f['confirm_idx'] for f in fvgs]
    return fvgs, keys, max_age


def active_fvg(fvgs, keys, max_age, idx, direction, lo, hi, mode):
    """Aktives FVG passender Richtung, dessen Zone [bot, top] das Intervall [lo, hi] schneidet (fvg_touch)
    bzw. lo (Sweep-Extrem) enthaelt (fvg)."""
    a = bisect_left(keys, idx - max_age)
    b = bisect_left(keys, idx)
    best = None
    for k in range(a, b):
        f = fvgs[k]
        if f['dir'] != direction:
            continue
        if f['fill_idx'] is not None and f['fill_idx'] < idx:
            continue
        if mode == 'fvg':
            ok = f['bot'] <= lo <= f['top'] if direction > 0 else f['bot'] <= hi <= f['top']
        else:
            ok = f['bot'] <= hi and f['top'] >= lo
        if ok and (best is None or f['confirm_idx'] > best['confirm_idx']):
            best = f
    return best


def run(s, sess, fvgpack, cond, entry_mode, tp_mode, buf_frac=0.1):
    start, dur = SESSIONS[sess]
    fvgs, keys, max_age = fvgpack if fvgpack else (None, None, None)
    trades = []
    # Tages-Startindizes
    day_start = {}
    for i in range(s.n):
        d = s.date[i]
        if d not in day_start:
            day_start[d] = i
    for d, i0 in day_start.items():
        base = s.absmin[i0] - s.mod[i0]
        a = bisect_left(s.absmin, base + start, i0)
        b = bisect_left(s.absmin, base + start + dur, i0)
        live_bars = [i for i in range(a, b) if s.live[i]]
        if len(live_bars) < dur * 0.87:
            continue
        rh = max(s.h[i] for i in live_bars)
        rl = min(s.l[i] for i in live_bars)
        width = rh - rl
        if width <= 0:
            continue
        end_idx = s.sess_end[b] if b < s.n else s.n - 1
        # Sweep suchen
        direction = None
        j = b
        while j <= end_idx:
            if not s.live[j]:
                j += 1
                continue
            hh = s.h[j] >= rh
            hl = s.l[j] <= rl
            if hh or hl:
                direction = 0 if (hh and hl) else (+1 if hl else -1)
                break
            j += 1
        if not direction:
            continue
        sweep_idx = j
        f = None
        if cond != 'none':
            f = active_fvg(fvgs, keys, max_age, sweep_idx, direction,
                           s.l[sweep_idx] if direction > 0 else rh,
                           rl if direction > 0 else s.h[sweep_idx], cond)
            if f is None:
                continue
        # Entry
        extreme = s.l[sweep_idx] if direction > 0 else s.h[sweep_idx]
        entry_idx = None
        swing = None
        k = sweep_idx
        while k <= end_idx and s.mod[k] != SESSION_END_MOD and k - sweep_idx <= MAX_CONFIRM:
            if direction > 0:
                extreme = min(extreme, s.l[k])
            else:
                extreme = max(extreme, s.h[k])
            if entry_mode == 'reclaim':
                if rl < s.c[k] < rh:
                    entry_idx = k
                    break
            else:
                q = k - 2
                if q > sweep_idx:
                    if direction > 0 and s.h[q] == max(s.h[q - 2:q + 3]):
                        swing = s.h[q]
                    if direction < 0 and s.l[q] == min(s.l[q - 2:q + 3]):
                        swing = s.l[q]
                if swing is not None and ((direction > 0 and s.c[k] > swing) or (direction < 0 and s.c[k] < swing)):
                    entry_idx = k
                    break
            k += 1
        if entry_idx is None:
            continue
        entry = s.c[entry_idx]
        buf = buf_frac * width
        if direction > 0:
            sl = min(extreme, f['bot'] if f else extreme) - buf
            sl_dist = entry - sl
            if sl_dist <= 0:
                continue
            tp = {'other': rh, 'mid': (rh + rl) / 2, 'r1': entry + sl_dist, 'r2': entry + 2 * sl_dist}[tp_mode]
            if tp <= entry:
                continue
        else:
            sl = max(extreme, f['top'] if f else extreme) + buf
            sl_dist = sl - entry
            if sl_dist <= 0:
                continue
            tp = {'other': rl, 'mid': (rh + rl) / 2, 'r1': entry - sl_dist, 'r2': entry - 2 * sl_dist}[tp_mode]
            if tp >= entry:
                continue
        tp_dist = abs(tp - entry)
        res, pts, ex = simulate(s, direction, entry_idx, entry, sl, tp, s.sess_end[entry_idx])
        trades.append({'dir': direction, 'entry_idx': entry_idx, 'exit_idx': ex, 'entry': entry, 'sl': sl,
                       'tp': tp, 'result': res, 'pts': pts, 'rr': tp_dist / sl_dist, 'tf': '',
                       'note': f'{sess}/{cond}/{entry_mode}/{tp_mode}'})
    return finalize(s, trades)


def main():
    instr = sys.argv[1]
    t0 = time.time()
    s = get_stream(instr)
    packs = {tf: prep_fvgs(s, tf) for tf in TFS}
    print(f'{instr}: FVGs ' + ', '.join(f'{tf}:{len(p[0])}' for tf, p in packs.items()) + f' ({time.time()-t0:.0f}s)')
    rows = []
    for sess in SESSIONS:
        for entry_mode in ['reclaim', 'mss']:
            for tp_mode in ['other', 'mid', 'r1', 'r2']:
                for cond, tf in [('none', None), ('fvg', '15m'), ('fvg', '1h'), ('fvg', '4h'),
                                 ('fvg_touch', '1h'), ('fvg_touch', '4h')]:
                    tr = run(s, sess, packs[tf] if tf else None, cond, entry_mode, tp_mode)
                    label = f'{instr} {sess} {entry_mode} {tp_mode} {cond}{"-" + tf if tf else ""}'
                    sm = summarize(tr, label)
                    rows.append((sm, tr))
                    print(fmt(sm))
    print('\n### Train-Auswahl (Train net>0, n_train>=150), dann Test-Check')
    sel = [(sm, tr) for sm, tr in rows if sm['train']['net'] > 0 and sm['train']['n'] >= 150]
    sel.sort(key=lambda x: -x[0]['train']['net'])
    for sm, tr in sel:
        print(fmt(sm))
        surv = sm['test']['net'] > 0 and sm['pos_years'] >= 4 and sm['all']['n'] >= 300
        if surv:
            fn = OUT + '/trades_c_' + sm['label'].replace(' ', '_') + '.csv'
            write_trades_csv(fn, tr)
            print('   SURVIVOR -> ' + fn)
    print('done %.0fs' % (time.time() - t0))


if __name__ == '__main__':
    main()
