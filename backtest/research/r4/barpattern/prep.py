"""Stufe 1: Diskretisierung jeder 1-min-Kerze + Vorwaerts-Ergebnis eines 1:1-Trades (Entry = Open des naechsten Bars).
Kein Look-Ahead: Muster nur aus abgeschlossenen Bars i-L+1..i; ATR20 aus Bars i-20..i-1; Entry-Bar i+1: nur SL geprueft;
danach SL vor TP im selben Bar; offen bis 16:00 -> Close des letzten Bars < 16:00.
Ausgabe: pickle mit globalen Arrays (alle Bars) + Ergebnis-Arrays fuer 5 SL/TP-Definitionen.
Aufruf: python prep.py <data_dir> <out.pkl> [tf=1]"""
import sys, os, pickle, datetime as dt
from array import array
sys.path.insert(0, '/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r3')
from load_vol import load_days_vol

def prep(data_dir, tf=1, end=960, last_entry=900):
    days = load_days_vol(data_dir); dates = sorted(days)
    G = dict(day=array('h'), mod=array('h'), o=array('d'), h=array('d'), l=array('d'), c=array('d'),
             symA=array('b'), symB=array('b'), symC=array('b'), symD=array('b'), symE=array('b'), elig=array('b'),
             atr=array('f'))
    OUT = {k: (array('f'), array('f')) for k in ('K1', 'K2', 'K3', 'PR3', 'PR4')}   # (pnl_long, pnl_short) in Punkten, nan = kein Trade
    NAN = float('nan'); daylist = []
    for di, d in enumerate(dates):
        mods, o, c, lo, hi, v = days[d]; m = len(mods)
        if d.weekday() >= 5 or m < 1000: continue
        flat = sum(1 for k in range(m) if hi[k] == lo[k])
        if flat > 0.2 * m: continue
        if tf > 1:
            am, ao, ah, al, ac, aidx = [], [], [], [], [], []
            k = 0
            while k + tf <= m:
                if mods[k] % tf == 0 and mods[k+tf-1] == mods[k] + tf - 1:
                    am.append(mods[k]); ao.append(o[k]); ac.append(c[k+tf-1]); ah.append(max(hi[k:k+tf])); al.append(min(lo[k:k+tf])); aidx.append(k); k += tf
                else: k += 1
            bm, bo, bh, bl, bc = am, ao, ah, al, ac; nb = len(bm)
        else:
            bm, bo, bh, bl, bc = mods, o, hi, lo, c; nb = m; aidx = list(range(m))
        daylist.append(d); dix = len(daylist) - 1
        rng = [bh[k] - bl[k] for k in range(nb)]
        for k in range(nb):
            r = rng[k]
            G['day'].append(dix); G['mod'].append(bm[k]); G['o'].append(bo[k]); G['h'].append(bh[k]); G['l'].append(bl[k]); G['c'].append(bc[k])
            atr = sum(rng[k-20:k]) / 20 if k >= 20 else 0.0
            G['atr'].append(atr)
            if r <= 0 or atr <= 0 or k < 1:
                for s in ('symA', 'symB', 'symC', 'symD', 'symE'): G[s].append(-1)
                G['elig'].append(0); continue
            body = abs(bc[k] - bo[k]) / r
            dr = 2 if bc[k] > bo[k] else (0 if bc[k] < bo[k] else 1)
            bcl = 0 if body < 0.33 else (1 if body < 0.67 else 2)
            rr = r / atr; rcl = 0 if rr < 0.6 else (1 if rr < 1.4 else 2)
            cp = (bc[k] - bl[k]) / r; cpq = min(3, int(cp * 4))
            hh = bh[k] > bh[k-1]; ll = bl[k] < bl[k-1]
            G['symA'].append(dr*3 + bcl); G['symB'].append(dr*3 + rcl); G['symC'].append(cpq)
            G['symD'].append((1 if dr == 2 else 0)*4 + hh*2 + ll); G['symE'].append(dr*9 + bcl*3 + rcl)
            e = (k + 1 < nb and bm[k+1] == bm[k] + tf and bm[k+1] < last_entry and k >= 20 and bm[k] - bm[k-4] == 4*tf)
            G['elig'].append(1 if e else 0)
        for k in range(nb):
            base = len(G['mod']) - nb + k
            if not G['elig'][base]:
                for key in OUT: OUT[key][0].append(NAN); OUT[key][1].append(NAN)
                continue
            e1 = aidx[k+1]; entry = o[e1]; atr = G['atr'][base]
            Ds = {'K1': atr, 'K2': 2*atr, 'K3': 3*atr,
                  'PR3': max(bh[k-2:k+1]) - min(bl[k-2:k+1]), 'PR4': max(bh[k-3:k+1]) - min(bl[k-3:k+1])}
            for key, D in Ds.items():
                if D < 1.0: OUT[key][0].append(NAN); OUT[key][1].append(NAN); continue
                up = entry + D; dn = entry - D
                # Entry-Bar: nur SL wertbar. long verliert wenn lo<=dn; short verliert wenn hi>=up.
                pl = -D if lo[e1] <= dn else None; ps = -D if hi[e1] >= up else None
                if pl is None or ps is None:
                    kk = e1 + 1; hit = 0
                    while kk < m and mods[kk] < end:
                        a = lo[kk] <= dn; b = hi[kk] >= up
                        if a or b: hit = (1 if a else 0) + (2 if b else 0); break
                        kk += 1
                    if hit == 0:
                        kk = min(kk, m-1); diff = c[kk] - entry
                        if abs(diff) >= D: diff = (D if diff > 0 else -D) * 0.999
                        sl_, ss_ = diff, -diff
                    elif hit == 1: sl_, ss_ = -D, D
                    elif hit == 2: sl_, ss_ = D, -D
                    else: sl_, ss_ = -D, -D            # beide Seiten im selben Bar: SL zuerst -> beide verlieren
                    if pl is None: pl = sl_
                    if ps is None: ps = ss_
                OUT[key][0].append(pl); OUT[key][1].append(ps)
    pickle.dump(dict(G=G, OUT=OUT, days=daylist, tf=tf), open(sys.argv[2], 'wb'))
    print('bars', len(G['mod']), 'elig', sum(G['elig']), 'days', len(daylist))

if __name__ == '__main__':
    prep(sys.argv[1], int(sys.argv[3]) if len(sys.argv) > 3 else 1)
