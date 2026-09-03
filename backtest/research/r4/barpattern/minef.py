"""Zusatz-Alphabet F: Close-Position im Hoch/Tief der 20 Vorbars (Quartil) x Richtung (8 Symbole), L=3,4; K2/K3/PR3; Stunde/Session/Ganztag."""
import sys, pickle, datetime as dt, csv, math
D = pickle.load(open(sys.argv[1], 'rb')); G = D['G']; OUT = D['OUT']; days = D['days']; COST = float(sys.argv[3]); USD = float(sys.argv[4])
o, h, l, c, mod, day, elig = G['o'], G['h'], G['l'], G['c'], G['mod'], G['day'], G['elig']; n = len(mod)
is_train = [d < dt.date(2025, 1, 1) for d in days]
symF = [-1] * n
for i in range(20, n):
    if day[i] != day[i-20] or h[i] <= l[i]: continue
    hh = max(h[i-20:i]); ll = min(l[i-20:i]); w = hh - ll
    if w <= 0: continue
    q = min(3, max(0, int((c[i] - ll) / w * 4))); symF[i] = (1 if c[i] > o[i] else 0) * 4 + q
rows = []; NB = 16; total = 0
for L in (3, 4):
    base = 8; size = base**L * NB
    acc = {(bt, os_, tt): ([0]*size, [0]*size, [0]*size, [0.0]*size, [0.0]*size) for bt in (0, 1, 2) for os_ in ('K2', 'K3', 'PR3') for tt in (0, 1)}
    for i in range(L, n):
        if not elig[i]: continue
        code = 0; bad = False
        for j in range(L):
            s = symF[i-L+1+j]
            if s < 0: bad = True; break
            code = code*base + s
        if bad: continue
        m = mod[i]; keys = ((0, code*NB + m//60), (1, code*NB + (0 if m < 240 else 1 if m < 570 else 2 if m < 720 else 3)), (2, code*NB))
        tt = 0 if is_train[day[i]] else 1
        for os_ in ('K2', 'K3', 'PR3'):
            pl = OUT[os_][0][i]
            if pl != pl: continue
            ps = OUT[os_][1][i]
            for bt, key in keys:
                a = acc[(bt, os_, tt)]; a[0][key] += 1; a[3][key] += pl; a[4][key] += ps
                if pl > 0: a[1][key] += 1
                if ps > 0: a[2][key] += 1
    for bt in (0, 1, 2):
        for os_ in ('K2', 'K3', 'PR3'):
            tr = acc[(bt, os_, 0)]; te = acc[(bt, os_, 1)]
            for key in range(size):
                nt = tr[0][key]
                if nt < 400: continue
                ne = te[0][key]
                for dirn, wi, si in (('long', 1, 3), ('short', 2, 4)):
                    rows.append(dict(sym='symF', L=L, code=key//NB, bt=bt, bucket=key%NB, outset=os_, dir=dirn, n_train=nt, wr_train=tr[wi][key]/nt*100,
                                     net_train=(tr[si][key]-COST*nt)*USD, n_test=ne, wr_test=(te[wi][key]/ne*100 if ne else float('nan')), net_test=(te[si][key]-COST*ne)*USD))
with open(sys.argv[2] + '_cells.csv', 'w', newline='') as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)
print('symF Hypothesen:', len(rows))
