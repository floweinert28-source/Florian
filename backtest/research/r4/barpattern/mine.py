"""Stufe 2: Muster-Enumeration. Fuer jeden Mustertyp x Zeitfenster x SL-Definition x Richtung: N, WR, Netto in TRAIN und TEST.
Alle Zellen werden gespeichert (fuer Multiple-Testing-Zaehlung); Ranking NUR nach TRAIN.
Aufruf: python mine.py <prep.pkl> <out_prefix> [cost_pts] [usd_per_pt] [min_n]"""
import sys, pickle, math, datetime as dt, csv, time
from multiprocessing import Pool
PT_TYPES = [('symA', 3, 9), ('symA', 4, 9), ('symB', 3, 9), ('symB', 4, 9), ('symC', 3, 4), ('symC', 4, 4), ('symC', 5, 4),
            ('symD', 3, 8), ('symD', 4, 8), ('symE', 3, 27)]
OUTSETS = ('K1', 'K2', 'K3', 'PR3', 'PR4')
NB = 16   # Zeit-Buckets: 0..14 Stunde, Session-Buckets werden separat kodiert (bucket-type 1: 0..3)
D = None

def init(path):
    global D
    D = pickle.load(open(path, 'rb'))

def run_type(args):
    sym, L, base = args
    G = D['G']; OUT = D['OUT']; days = D['days']
    S = G[sym]; elig = G['elig']; mod = G['mod']; day = G['day']
    is_train = [d < dt.date(2025, 1, 1) for d in days]
    ncode = base ** L; size = ncode * NB
    # Akkumulatoren: [bucket_type][outset][train/test] -> Listen n, wl, ws, sL, sS
    acc = {}
    for bt in (0, 1, 2):
        for os_ in OUTSETS:
            for tt in (0, 1):
                acc[(bt, os_, tt)] = ([0]*size, [0]*size, [0]*size, [0.0]*size, [0.0]*size)
    outs = [(os_, OUT[os_][0], OUT[os_][1]) for os_ in OUTSETS]
    n = len(S); mult = [base**(L-1-j) for j in range(L)]
    for i in range(L-1, n):
        if not elig[i]: continue
        code = 0; bad = False
        for j in range(L):
            s = S[i-L+1+j]
            if s < 0: bad = True; break
            code += s * mult[j]
        if bad: continue
        m = mod[i]; hour = m // 60; sess = 0 if m < 240 else (1 if m < 570 else (2 if m < 720 else 3))
        tt = 0 if is_train[day[i]] else 1
        k0 = code * NB + hour; k1 = code * NB + sess; k2 = code * NB
        for os_, PL, PS in outs:
            pl = PL[i]
            if pl != pl: continue
            ps = PS[i]
            for bt, key in ((0, k0), (1, k1), (2, k2)):
                a = acc[(bt, os_, tt)]
                a[0][key] += 1; a[3][key] += pl; a[4][key] += ps
                if pl > 0: a[1][key] += 1
                if ps > 0: a[2][key] += 1
    # Zellen extrahieren (nur n_train >= min_n)
    rows = []
    for bt in (0, 1, 2):
        for os_ in OUTSETS:
            tr = acc[(bt, os_, 0)]; te = acc[(bt, os_, 1)]
            for key in range(size):
                nt = tr[0][key]
                if nt < MIN_N: continue
                code, b = divmod(key, NB)
                ne = te[0][key]
                for dirn, wi, si in (('long', 1, 3), ('short', 2, 4)):
                    rows.append(dict(sym=sym, L=L, code=code, bt=bt, bucket=b, outset=os_, dir=dirn,
                                     n_train=nt, wr_train=tr[wi][key]/nt*100, net_train=(tr[si][key] - COST*nt)*USD,
                                     n_test=ne, wr_test=(te[wi][key]/ne*100 if ne else float('nan')), net_test=(te[si][key] - COST*ne)*USD))
    return rows

if __name__ == '__main__':
    path, prefix = sys.argv[1], sys.argv[2]
    COST = float(sys.argv[3]) if len(sys.argv) > 3 else 0.75; USD = float(sys.argv[4]) if len(sys.argv) > 4 else 20.0
    MIN_N = int(sys.argv[5]) if len(sys.argv) > 5 else 400
    t0 = time.time()
    with Pool(2, initializer=init, initargs=(path,)) as pool:
        res = pool.map(run_type, PT_TYPES)
    rows = [r for rr in res for r in rr]
    with open(prefix + '_cells.csv', 'w', newline='') as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)
    print('Zellen (Hypothesen) mit n_train >=', MIN_N, ':', len(rows), f'({time.time()-t0:.0f}s)')
    for bt, nm in ((0, 'Stunde'), (1, 'Session'), (2, 'Ganztag')):
        sub = [r for r in rows if r['bt'] == bt]
        print(f'  Bucket-Typ {nm}: {len(sub)} Hypothesen')
    rows.sort(key=lambda r: -r['wr_train'])
    print('\nTop 25 nach TRAIN-WR (dann TEST):')
    print(f"{'typ':7s} {'L':>1s} {'code':>6s} {'bt':>2s} {'b':>2s} {'set':>4s} {'dir':>5s} {'Ntr':>5s} {'WRtr':>6s} {'NetTr':>9s} {'Nte':>5s} {'WRte':>6s} {'NetTe':>9s}")
    for r in rows[:25]:
        print(f"{r['sym']:7s} {r['L']:1d} {r['code']:6d} {r['bt']:2d} {r['bucket']:2d} {r['outset']:>4s} {r['dir']:>5s} {r['n_train']:5d} {r['wr_train']:6.1f} {r['net_train']:9.0f} {r['n_test']:5d} {r['wr_test']:6.1f} {r['net_test']:9.0f}")
