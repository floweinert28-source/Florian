"""(a) Reaktions-Statistik: erster Eintritt in ein HTF-FVG -> Reversal um X*Gap-Hoehe vor Durchbruch?

Definitionen (bull-FVG, bear spiegelbildlich):
- Touch = erster Live-Bar nach Bestaetigung mit low <= top.
- 'through' = Touch-Bar handelt im selben Bar bereits unter bot (Gap komplett durchhandelt).
- Danach ab Touch-Bar+1: Reversal-Ziel top + X*height erreicht (high >= Ziel) VOR low < bot -> 'rev'
  sonst 'breach'; Zeitlimit horizon_bars -> 'timeout'.
- Konservativ: im selben Bar zaehlt breach vor rev.
Aufruf: python3 a_reaction_stats.py NQ|ES
"""
import sys
import time
from collections import defaultdict

sys.path.insert(0, '/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/htf_fvg')
from fvg_lib import get_stream, build_candles, find_fvgs, first_touch, tod_bucket, TRAIN_END

instr = sys.argv[1]
t0 = time.time()
s = get_stream(instr)
print(instr, 'bars', s.n, 'live', sum(s.live), 'build %.1fs' % (time.time() - t0))

TFS = [('15m', 15, 0, 1440), ('1h', 60, 0, 2 * 1440), ('4h', 240, 18 * 60, 5 * 1440)]
XS = [0.5, 1.0, 2.0]
HORIZON = 480


def stat_line(name, d):
    tot = d['touches']
    if tot == 0:
        return f'{name:<28} n=0'
    parts = []
    for x in XS:
        r, b = d['rev', x], d['breach', x]
        cond = r / (r + b) * 100 if r + b else 0
        parts.append(f"X={x}: rev{r/tot*100:3.0f}%/br{b/tot*100:3.0f}% cond={cond:3.0f}%(fair {100/(1+x):3.0f}%)")
    return f"{name:<16} n={tot:5d} through={d['through']/tot*100:3.0f}% " + ' | '.join(parts)


for tfname, tf, off, max_age in TFS:
    cands = build_candles(s, tf, off)
    fvgs = find_fvgs(cands)
    print(f'\n=== {instr} {tfname}: candles={len(cands)} fvgs={len(fvgs)} '
          f'(bull {sum(1 for f in fvgs if f["dir"] > 0)})')
    rel_h = sorted(f['height'] / f['top'] * 1e4 for f in fvgs)
    print('  height (bp of price) p25/p50/p75:', [round(rel_h[int(len(rel_h) * q)], 1) for q in (0.25, 0.5, 0.75)])
    groups = defaultdict(lambda: defaultdict(int))
    touched = 0
    for f in fvgs:
        ft = first_touch(s, f, max_age)
        if ft is None:
            continue
        ti, through = ft
        touched += 1
        keys = ['ALL', 'train' if s.date[ti] <= TRAIN_END else 'test',
                'tod:' + tod_bucket(s.mod[ti]),
                'size:' + ('small' if f['height'] / f['top'] * 1e4 < rel_h[len(rel_h) // 2] else 'large'),
                'age:' + ('<2h' if ti - f['confirm_idx'] < 120 else ('<8h' if ti - f['confirm_idx'] < 480 else '>8h'))]
        for k in keys:
            groups[k]['touches'] += 1
        if through:
            for k in keys:
                groups[k]['through'] += 1
            continue
        d = f['dir']
        top, bot, h = f['top'], f['bot'], f['height']
        end = min(s.n - 1, ti + HORIZON)
        res = {}
        for x in XS:
            res[x] = 'timeout'
        pending = set(XS)
        for j in range(ti + 1, end + 1):
            if d > 0:
                if s.l[j] < bot:
                    for x in pending:
                        res[x] = 'breach'
                    pending = set()
                    break
                for x in list(pending):
                    if s.h[j] >= top + x * h:
                        res[x] = 'rev'
                        pending.discard(x)
            else:
                if s.h[j] > top:
                    for x in pending:
                        res[x] = 'breach'
                    pending = set()
                    break
                for x in list(pending):
                    if s.l[j] <= bot - x * h:
                        res[x] = 'rev'
                        pending.discard(x)
            if not pending:
                break
        for k in keys:
            for x in XS:
                groups[k][res[x], x] += 1
    print(f'  touched within {max_age//1440}d: {touched}/{len(fvgs)}')
    for k in sorted(groups):
        print('  ' + stat_line(k, groups[k]))
print('done %.1fs' % (time.time() - t0))
