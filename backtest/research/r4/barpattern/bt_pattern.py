"""Stufe 3: Sauberer Strategie-Backtest eines Bar-Musters direkt auf Rohdaten (unabhaengig von prep/mine).
Regeln: Muster = Folge von L Symbolen (Alphabet) auf abgeschlossenen tf-min-Bars i-L+1..i; Entry = Open des naechsten Bars (Market);
SL/TP = k x ATR20 (Mittel der Ranges der 20 Bars vor dem letzten Musterbar) oder Musterrange; Entry-Bar nur SL; SL vor TP; Exit 16:00 Close.
Nur ein offener Trade gleichzeitig. Entry-Zeit im Fenster [t0, t1).
Aufruf als Modul: run(days, spec) -> trades; spec = dict(sym, L, codes=set, t0, t1, outset, dir, tf)"""
import sys, csv, math, datetime as dt
from collections import defaultdict
sys.path.insert(0, '/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r3')
from load_vol import load_days_vol

def symbols(bo, bh, bl, bc, k, atr):
    r = bh[k] - bl[k]
    if r <= 0 or atr <= 0 or k < 1: return None
    body = abs(bc[k] - bo[k]) / r
    dr = 2 if bc[k] > bo[k] else (0 if bc[k] < bo[k] else 1)
    bcl = 0 if body < 0.33 else (1 if body < 0.67 else 2)
    rr = r / atr; rcl = 0 if rr < 0.6 else (1 if rr < 1.4 else 2)
    cp = (bc[k] - bl[k]) / r; cpq = min(3, int(cp * 4))
    hh = bh[k] > bh[k-1]; ll = bl[k] < bl[k-1]
    return dict(symA=dr*3 + bcl, symB=dr*3 + rcl, symC=cpq, symD=(1 if dr == 2 else 0)*4 + hh*2 + ll, symE=dr*9 + bcl*3 + rcl)
BASE = dict(symA=9, symB=9, symC=4, symD=8, symE=27)

def run(days, spec, cost, usd, end=960):
    sym, L, codes, t0, t1, outset, dirn, tf = spec['sym'], spec['L'], spec['codes'], spec['t0'], spec['t1'], spec['outset'], spec['dir'], spec.get('tf', 1)
    base = BASE[sym]; trades = []
    for d in sorted(days):
        mods, o, c, lo, hi, v = days[d]; m = len(mods)
        if d.weekday() >= 5 or m < 1000: continue
        if sum(1 for k in range(m) if hi[k] == lo[k]) > 0.2 * m: continue
        if tf > 1:
            bm, bo, bh, bl, bc, aidx = [], [], [], [], [], []; k = 0
            while k + tf <= m:
                if mods[k] % tf == 0 and mods[k+tf-1] == mods[k] + tf - 1:
                    bm.append(mods[k]); bo.append(o[k]); bc.append(c[k+tf-1]); bh.append(max(hi[k:k+tf])); bl.append(min(lo[k:k+tf])); aidx.append(k); k += tf
                else: k += 1
        else:
            bm, bo, bh, bl, bc, aidx = mods, o, hi, lo, c, list(range(m))
        nb = len(bm); busy_until = -1   # 1-min-Index, bis zu dem ein Trade offen ist
        symcache = {}
        for k in range(20, nb - 1):
            if bm[k+1] != bm[k] + tf or not (t0 <= bm[k+1] < t1) or bm[k] - bm[k-4] != 4*tf: continue
            if aidx[k+1] <= busy_until: continue
            atr = sum(bh[j]-bl[j] for j in range(k-20, k)) / 20
            code = 0; ok = True
            for j in range(L):
                kj = k-L+1+j
                if kj not in symcache:
                    a_ = sum(bh[q]-bl[q] for q in range(kj-20, kj)) / 20 if kj >= 20 else 0
                    symcache[kj] = symbols(bo, bh, bl, bc, kj, a_)
                s = symcache[kj]
                if s is None: ok = False; break
                code = code * base + s[sym]
            if not ok or code not in codes: continue
            if outset[0] == 'K': D = float(outset[1:]) * atr
            else: Lr = int(outset[2:]); D = max(bh[k-Lr+1:k+1]) - min(bl[k-Lr+1:k+1])
            if D < 1.0: continue
            e1 = aidx[k+1]; entry = o[e1]
            sl = entry - D if dirn == 'long' else entry + D; tp = entry + D if dirn == 'long' else entry - D
            res = None; xt = None
            if (dirn == 'long' and lo[e1] <= sl) or (dirn == 'short' and hi[e1] >= sl): res, kk = -D, e1
            else:
                kk = e1 + 1
                while kk < m and mods[kk] < end:
                    if dirn == 'long':
                        if lo[kk] <= sl: res = -D; break
                        if hi[kk] >= tp: res = D; break
                    else:
                        if hi[kk] >= sl: res = -D; break
                        if lo[kk] <= tp: res = D; break
                    kk += 1
            if res is None:
                kk = min(kk, m-1); res = (c[kk]-entry) if dirn == 'long' else (entry-c[kk]); tag = 'EOD'
            else: tag = 'TP' if res > 0 else 'SL'
            busy_until = kk
            trades.append(dict(date=d.isoformat(), dir=dirn, entry_time=f"{mods[e1]//60:02d}:{mods[e1]%60:02d}", entry=round(entry, 2),
                               sl=round(sl, 2), tp=round(tp, 2), result=tag, pnl_usd=round((res - cost) * usd, 2),
                               exit_time=f"{mods[kk]//60:02d}:{mods[kk]%60:02d}", pnl_pts=round(res, 2), code=code))
    return trades

def summary(trades, label=''):
    def st(ts):
        n = len(ts)
        if n == 0: return 'n=0'
        w = sum(1 for t in ts if t['pnl_pts'] > 0); usd = [t['pnl_usd'] for t in ts]; mean = sum(usd)/n
        sd = math.sqrt(sum((x-mean)**2 for x in usd)/(n-1)) if n > 1 else 1; tstat = mean/(sd/math.sqrt(n)) if sd else 0
        return f"N={n:4d} WR={w/n*100:5.1f}% Netto={sum(usd):+9.0f}$ t={tstat:5.2f}"
    tr = [t for t in trades if t['date'] < '2025']; te = [t for t in trades if t['date'] >= '2025']
    py = defaultdict(list)
    for t in trades: py[t['date'][:4]].append(t)
    yrs = ' '.join(f"{y}:{sum(1 for t in py[y] if t['pnl_pts']>0)/len(py[y])*100:.0f}%/{sum(t['pnl_usd'] for t in py[y]):+.0f}$" for y in sorted(py))
    wk = len(trades) / (5*52.14)
    print(f"{label} TRAIN {st(tr)} | TEST {st(te)} | {wk:.1f}/Woche | {yrs}")
    return tr, te

if __name__ == '__main__':
    pass
