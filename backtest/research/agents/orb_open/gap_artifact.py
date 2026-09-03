"""Artefakt-Check: Ist das 09:30-Bar-Open eine verlaessliche Referenz?
Vergleicht Gap-Vorzeichen (Open vs Vortagesclose) mit Close-Richtung relativ zu
verschiedenen Referenzpreisen (Open 09:30, Close 09:30, Close 09:34)."""
import sys
from bisect import bisect_left
from collections import defaultdict
sys.path.insert(0, '/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/orb_open')
from common import *  # noqa

for instr in ('NQ', 'ES'):
    days = get_days(instr)
    td = trading_days(days)
    print('\n====', instr)
    stats = defaultdict(lambda: [0, 0])
    diffs = []
    for i, d in enumerate(td):
        mods, o, c, l, h = days[d]
        a = bisect_left(mods, OPEN); b = bisect_left(mods, RTH_END)
        pc = prev_close(days, td, i)
        if pc is None or i < 10:
            continue
        # ATR
        rr = []
        for k in range(i - 10, i):
            bb = days[td[k]]; aa = bisect_left(bb[0], OPEN); bbb = bisect_left(bb[0], RTH_END)
            rr.append(max(bb[4][aa:bbb]) - min(bb[3][aa:bbb]))
        atr = sum(rr) / len(rr)
        refs = {'open0930': o[a], 'close0930': c[a], 'close0934': c[a + 4], 'close0929': c[a - 1]}
        diffs.append((o[a] - c[a - 1], o[a] - c[a], atr))
        rc = c[b - 1]
        for refname, ref in refs.items():
            gap = ref - pc
            ag = abs(gap) / atr
            bkt = 'tiny<0.05' if ag < 0.05 else ('small<0.15' if ag < 0.15 else ('mid<0.3' if ag < 0.3 else 'big'))
            if gap == 0:
                continue
            # Zielgroesse: Close am Tagesende gegen die Gap-Richtung relativ zur Referenz
            rev = (rc < ref) if gap > 0 else (rc > ref)
            # Zusaetzlich: Close 10:30 gegen die Gap-Richtung relativ zur Referenz
            j = bisect_left(mods, 630)
            rev1030 = (c[j] < ref) if gap > 0 else (c[j] > ref)
            key = (refname, bkt, 'train' if d <= TRAIN_END else 'test')
            stats[key][1] += 1
            stats[key][0] += rev
            key2 = (refname + '@1030', bkt, 'train' if d <= TRAIN_END else 'test')
            stats[key2][1] += 1
            stats[key2][0] += rev1030
    for k in sorted(stats):
        v = stats[k]
        print(f"  {k[0]:<16} {k[1]:<11} {k[2]:<5} Close gegen Gap-Richtung: {100*v[0]/v[1]:5.1f}% (n={v[1]})")
    # Wie stark weicht Open 09:30 vom Close 09:29 ab?
    import statistics
    print('  |open0930 - close0929| median:', statistics.median(abs(x[0]) for x in diffs), ' vs |open0930-close0930| median', statistics.median(abs(x[1]) for x in diffs))
