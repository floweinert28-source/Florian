#!/usr/bin/env python3
"""Rollender Ablauf der Umsetzung: Status je Paket in plan/lauf.json.
   sched.py init | ready [max] | set <nr…> <status> [notiz] | show
   Status: offen → laeuft → geprueft → gemerged (oder: problem)"""
import json, sys, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
W = json.load(open('plan/wellen.json'))
P = {p['nr']: p for p in W['pakete']}
F = 'plan/lauf.json'
st = json.load(open(F)) if os.path.exists(F) else {}
cmd = sys.argv[1] if len(sys.argv) > 1 else 'show'
if cmd == 'init':
    st = {str(n): {'status': 'offen', 'notiz': ''} for n in P}; json.dump(st, open(F, 'w'), indent=1); print('init', len(st))
elif cmd == 'ready':
    mx = int(sys.argv[2]) if len(sys.argv) > 2 else 99
    running = sum(1 for v in st.values() if v['status'] == 'laeuft')
    out = []
    for n in sorted(P):
        if st[str(n)]['status'] != 'offen': continue
        if all(st[str(d)]['status'] == 'gemerged' for d in P[n]['haengt_ab']): out.append(n)
    print(' '.join(map(str, out[:max(0, mx - running)])))
elif cmd == 'set':
    *nrs, s = sys.argv[2:] if len(sys.argv) < 5 or not sys.argv[-1].startswith('#') else sys.argv[2:-1]
    note = sys.argv[-1][1:] if sys.argv[-1].startswith('#') else ''
    for n in nrs: st[str(int(n))]['status'] = s; st[str(int(n))]['notiz'] = note or st[str(int(n))]['notiz']
    json.dump(st, open(F, 'w'), indent=1); print('ok', nrs, s)
else:
    from collections import Counter
    print(dict(Counter(v['status'] for v in st.values())))
    for n in sorted(P):
        v = st[str(n)]
        if v['status'] not in ('offen', 'gemerged') or v['notiz']: print(f"{n:03d} {v['status']} {v['notiz']}")
