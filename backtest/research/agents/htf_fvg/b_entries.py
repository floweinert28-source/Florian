"""(b)+(d) HTF-FVG Entry-Grid.

Entry-Modi (bull-FVG => Long; bear spiegelbildlich):
  limit_top : Limit an der nahen Kante (top). Fill = erster spaeterer Live-Bar mit low <= top (Touch-Bar).
  limit_ce  : Limit am 50%-Level des FVG. Fill = erster Live-Bar mit low <= ce (nach Bestaetigung).
  close_back: Touch-Bar (low<=top) schliesst IM/UNTER dem FVG (close<=top); Entry zum Close des ersten
              spaeteren Bars, der wieder > top schliesst (max 60 min nach Touch), solange kein low < bot-buf.
  mss       : Nach dem Touch: erster 1-min-Swing-High (Fraktal k=2), der nach dem Touch-Bar entsteht;
              Entry zum Close des Bars, der > diesen Swing-High schliesst (max 90 min), solange kein low < bot-buf.
  ifvg_limit: Inversion: 1-min-Close < bot (bull-FVG wird bearish). Danach Limit-SHORT an bot (Retest von unten),
              Fill = spaeterer Bar mit high >= bot (max 240 min nach Inversion). SL = top + buf. Spiegelbildlich.
  ifvg_close: wie ifvg_limit, aber Entry erst wenn nach dem Retest-Touch ein Bar wieder < bot schliesst.
SL = bot - buf (buf = buf_frac * height). TP: r1 / r2 / imp (Impuls-Extrem der FVG-Kerzen 2/3).
Time-Stop 16:10 NY (Close). Max eine Position gleichzeitig. Kosten abgezogen.
Aufruf: python3 b_entries.py NQ|ES [tf-liste]
"""
import sys
import time
from collections import defaultdict

sys.path.insert(0, '/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/htf_fvg')
from fvg_lib import (get_stream, build_candles, find_fvgs, first_touch, simulate, dedupe_overlaps,
                     finalize, summarize, fmt, write_trades_csv, tod_bucket, LAST_ENTRY_MOD, EVENING_MOD,
                     SESSION_END_MOD)

OUT = '/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/htf_fvg'
import os
OFF4H = int(os.environ.get('OFF4H', 18 * 60))
SUFFIX = os.environ.get('SUFFIX', '')
PLACEBO = float(os.environ.get('PLACEBO', '0'))   # Zone um PLACEBO*height vom Preis weg verschieben (Kontrolle)
TFS = {'15m': (15, 0, 1440), '1h': (60, 0, 2 * 1440), '4h': (240, OFF4H, 5 * 1440), '2h': (120, 0, 3 * 1440)}


def entry_allowed(s, i):
    m = s.mod[i]
    return s.live[i] and (m <= LAST_ENTRY_MOD or m >= EVENING_MOD)


def gen_trades(s, fvgs, touches, mode, tp_mode, buf_frac, min_h_bp, tfname):
    trades = []
    for f, ft in zip(fvgs, touches):
        if f['height'] / f['top'] * 1e4 < min_h_bp:
            continue
        d = f['dir']
        top, bot, h = f['top'], f['bot'], f['height']
        buf = buf_frac * h
        near = top if d > 0 else bot          # nahe Kante
        far = bot if d > 0 else top           # ferne Kante
        entry_idx = entry = None
        tdir = d
        if mode in ('limit_top', 'limit_ce', 'close_back', 'mss'):
            if ft is None:
                continue
            ti, through = ft
            if mode == 'limit_top':
                entry_idx, entry = ti, near
            elif mode == 'limit_ce':
                ce = (top + bot) / 2
                # ab Touch-Bar suchen (Touch-Bar selbst kann CE bereits handeln)
                lim = min(s.n, f['confirm_idx'] + 1 + TFS[tfname][2])
                for j in range(ti, lim):
                    if (d > 0 and s.l[j] <= ce) or (d < 0 and s.h[j] >= ce):
                        entry_idx, entry = j, ce
                        break
                    if (d > 0 and s.l[j] < bot - buf) or (d < 0 and s.h[j] > top + buf):
                        break
            elif mode == 'close_back':
                if d > 0 and s.c[ti] > top:
                    continue
                if d < 0 and s.c[ti] < bot:
                    continue
                for j in range(ti + 1, min(s.n, ti + 61)):
                    if (d > 0 and s.l[j] < far - buf) or (d < 0 and s.h[j] > far + buf):
                        break
                    if (d > 0 and s.c[j] > top) or (d < 0 and s.c[j] < bot):
                        entry_idx, entry = j, s.c[j]
                        break
            elif mode == 'mss':
                swing = None
                for j in range(ti + 1, min(s.n, ti + 91)):
                    if (d > 0 and s.l[j] < far - buf) or (d < 0 and s.h[j] > far + buf):
                        break
                    k = j - 2
                    if k > ti:
                        if d > 0 and s.h[k] == max(s.h[k - 2:k + 3]):
                            swing = s.h[k]
                        if d < 0 and s.l[k] == min(s.l[k - 2:k + 3]):
                            swing = s.l[k]
                    if swing is not None and ((d > 0 and s.c[j] > swing) or (d < 0 and s.c[j] < swing)):
                        entry_idx, entry = j, s.c[j]
                        break
            if entry_idx is None or not entry_allowed(s, entry_idx):
                continue
            sl = far - buf if d > 0 else far + buf
        else:
            # Inversion: erster 1-min-Close jenseits der fernen Kante (innerhalb max_age)
            lim = min(s.n, f['confirm_idx'] + 1 + TFS[tfname][2])
            inv = None
            for j in range(f['confirm_idx'] + 1, lim):
                if (d > 0 and s.c[j] < bot) or (d < 0 and s.c[j] > top):
                    inv = j
                    break
            if inv is None or not s.live[inv]:
                continue
            tdir = -d
            level = far                        # Retest-Level = ehemalige ferne Kante
            touch = None
            for j in range(inv + 1, min(s.n, inv + 241)):
                if (tdir < 0 and s.h[j] >= level) or (tdir > 0 and s.l[j] <= level):
                    touch = j
                    break
                # Retest ungueltig, wenn Preis vorher weit weglaeuft? nein - nur Zeitlimit
            if touch is None:
                continue
            if mode == 'ifvg_limit':
                entry_idx, entry = touch, level
            else:
                for j in range(touch + 1, min(s.n, touch + 61)):
                    if (tdir < 0 and s.h[j] > near + buf) or (tdir > 0 and s.l[j] < near - buf):
                        break
                    if (tdir < 0 and s.c[j] < level) or (tdir > 0 and s.c[j] > level):
                        entry_idx, entry = j, s.c[j]
                        break
            if entry_idx is None or not entry_allowed(s, entry_idx):
                continue
            sl = near + buf if tdir < 0 else near - buf
        sl_dist = (entry - sl) if tdir > 0 else (sl - entry)
        if sl_dist <= 0:
            continue
        if tp_mode == 'r1':
            tp = entry + tdir * sl_dist
        elif tp_mode == 'r2':
            tp = entry + tdir * 2 * sl_dist
        elif tp_mode == 'r3':
            tp = entry + tdir * 3 * sl_dist
        elif tp_mode == 'imp':
            if mode.startswith('ifvg'):
                tp = f['c1_ext']
            else:
                tp = f['imp_ext']
        else:
            raise ValueError(tp_mode)
        tp_dist = (tp - entry) * tdir
        if tp_dist <= 0.25 * sl_dist:
            continue
        res, pts, ex = simulate(s, tdir, entry_idx, entry, sl, tp, s.sess_end[entry_idx])
        trades.append({'dir': tdir, 'entry_idx': entry_idx, 'exit_idx': ex, 'entry': entry, 'sl': sl,
                       'tp': tp, 'result': res, 'pts': pts, 'rr': tp_dist / sl_dist, 'tf': tfname,
                       'note': mode + '/' + tp_mode, 'tod': tod_bucket(s.mod[entry_idx])})
    return finalize(s, dedupe_overlaps(trades))


def main():
    instr = sys.argv[1]
    tfs = sys.argv[2].split(',') if len(sys.argv) > 2 else ['15m', '1h', '4h']
    t0 = time.time()
    s = get_stream(instr)
    rows = []
    for tfname in tfs:
        tf, off, max_age = TFS[tfname]
        fvgs = find_fvgs(build_candles(s, tf, off))
        if PLACEBO:
            for f in fvgs:
                sh = -f['dir'] * PLACEBO * f['height']
                f['bot'] += sh; f['top'] += sh; f['imp_ext'] += sh; f['c1_ext'] += sh
        touches = [first_touch(s, f, max_age) for f in fvgs]
        from fvg_lib import TRAIN_END
        hs = sorted(f['height'] / f['top'] * 1e4 for f in fvgs if s.date[f['confirm_idx']] <= TRAIN_END)
        med = hs[len(hs) // 2]   # Median NUR aus Train-FVGs
        print(f'{instr} {tfname}: {len(fvgs)} FVGs, median height {med:.1f}bp  ({time.time()-t0:.0f}s)')
        for mode in ['limit_top', 'limit_ce', 'close_back', 'mss', 'ifvg_limit', 'ifvg_close']:
            for tp_mode in ['r1', 'r2', 'imp']:
                for buf_frac in [0.1, 0.5]:
                    for min_h in [0.0, med]:
                        trades = gen_trades(s, fvgs, touches, mode, tp_mode, buf_frac, min_h, tfname)
                        label = f'{instr} {tfname} {mode} {tp_mode} buf{buf_frac} minh{min_h:.0f}'
                        sm = summarize(trades, label)
                        rows.append((sm, trades))
                        print(fmt(sm))
                        # Tageszeit-Aufschluesselung (nur Train-Zahlen, zur Auswahl)
                        by = defaultdict(list)
                        for t in trades:
                            by[t['tod']].append(t)
                        line = '    TOD(train net/n): ' + ' '.join(
                            f"{k}:{sum(t['pnl_usd'] for t in v if t['train']):+.0f}/{sum(1 for t in v if t['train'])}"
                            for k, v in sorted(by.items()))
                        print(line)
    # Auswahl NUR nach Train: Train-Netto > 0, Train-Trades >= 200, Edge >= 3pp
    print('\n### Train-Auswahl (Train net>0, n_train>=200, edge_train>=3pp), dann Test-Check')
    sel = [(sm, tr) for sm, tr in rows if sm['train']['net'] > 0 and sm['train']['n'] >= 200
           and sm['train']['edge'] >= 3.0]
    sel.sort(key=lambda x: -x[0]['train']['net'])
    for sm, tr in sel:
        print(fmt(sm))
        surv = sm['train']['net'] > 0 and sm['test']['net'] > 0 and sm['pos_years'] >= 4 and sm['all']['n'] >= 300
        if surv:
            fn = OUT + '/trades_' + sm['label'].replace(' ', '_').replace('.', 'p') + SUFFIX + '.csv'
            write_trades_csv(fn, tr)
            print('   SURVIVOR -> ' + fn)
    print('done %.0fs' % (time.time() - t0))


if __name__ == '__main__':
    main()
