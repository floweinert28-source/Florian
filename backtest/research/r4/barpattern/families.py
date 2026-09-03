"""Benannte Muster-Familien (Vereinigungen von Codes) mit grossem N und wenigen Hypothesen. Nutzt prep-Arrays.
Aufruf: python families.py <prep.pkl> <label> <cost> <usd>"""
import sys, pickle, datetime as dt, math
D = pickle.load(open(sys.argv[1], 'rb')); G = D['G']; OUT = D['OUT']; days = D['days']; label = sys.argv[2]
COST = float(sys.argv[3]); USD = float(sys.argv[4])
is_train = [d < dt.date(2025, 1, 1) for d in days]
o, h, l, c, atr, mod, day, elig = G['o'], G['h'], G['l'], G['c'], G['atr'], G['mod'], G['day'], G['elig']
n = len(mod)
def up(i): return c[i] > o[i]
def dn(i): return c[i] < o[i]
def rng(i): return h[i] - l[i]
def body(i): return abs(c[i] - o[i]) / rng(i) if rng(i) > 0 else 0
def cp(i): return (c[i] - l[i]) / rng(i) if rng(i) > 0 else 0.5
FAM = {
 'up3': lambda i: up(i) and up(i-1) and up(i-2),
 'up4': lambda i: up(i) and up(i-1) and up(i-2) and up(i-3),
 'up5': lambda i: all(up(i-j) for j in range(5)),
 'dn3': lambda i: dn(i) and dn(i-1) and dn(i-2),
 'dn4': lambda i: dn(i) and dn(i-1) and dn(i-2) and dn(i-3),
 'dn5': lambda i: all(dn(i-j) for j in range(5)),
 'up3_bigbody': lambda i: all(up(i-j) and body(i-j) >= 0.67 for j in range(3)),
 'dn3_bigbody': lambda i: all(dn(i-j) and body(i-j) >= 0.67 for j in range(3)),
 'up3_bigrange': lambda i: all(up(i-j) and rng(i-j) >= 1.4*atr[i] for j in range(3)),
 'dn3_bigrange': lambda i: all(dn(i-j) and rng(i-j) >= 1.4*atr[i] for j in range(3)),
 'dn3_then_up': lambda i: up(i) and dn(i-1) and dn(i-2) and dn(i-3),
 'up3_then_dn': lambda i: dn(i) and up(i-1) and up(i-2) and up(i-3),
 'bigbar_up': lambda i: up(i) and rng(i) >= 2.5*atr[i] and body(i) >= 0.6,
 'bigbar_dn': lambda i: dn(i) and rng(i) >= 2.5*atr[i] and body(i) >= 0.6,
 'hammer': lambda i: rng(i) >= 1.5*atr[i] and cp(i) >= 0.75 and body(i) <= 0.4 and l[i] < min(l[i-1], l[i-2], l[i-3]),
 'shooter': lambda i: rng(i) >= 1.5*atr[i] and cp(i) <= 0.25 and body(i) <= 0.4 and h[i] > max(h[i-1], h[i-2], h[i-3]),
 'engulf_up': lambda i: dn(i-1) and up(i) and c[i] > o[i-1] and o[i] <= c[i-1] and rng(i) >= atr[i],
 'engulf_dn': lambda i: up(i-1) and dn(i) and c[i] < o[i-1] and o[i] >= c[i-1] and rng(i) >= atr[i],
 'inside_after_big': lambda i: rng(i-1) >= 2*atr[i] and h[i] <= h[i-1] and l[i] >= l[i-1],
 'outside_up': lambda i: h[i] > h[i-1] and l[i] < l[i-1] and up(i) and cp(i) >= 0.75,
 'outside_dn': lambda i: h[i] > h[i-1] and l[i] < l[i-1] and dn(i) and cp(i) <= 0.25,
 'contract3': lambda i: h[i] < h[i-1] < h[i-2] and l[i] > l[i-1] > l[i-2],
 'closehigh3': lambda i: all(cp(i-j) >= 0.75 for j in range(3)),
 'closelow3': lambda i: all(cp(i-j) <= 0.25 for j in range(3)),
 'hh3': lambda i: h[i] > h[i-1] > h[i-2] and l[i] > l[i-1] > l[i-2],
 'll3': lambda i: h[i] < h[i-1] < h[i-2] and l[i] < l[i-1] < l[i-2],
 'doji_after_up3': lambda i: body(i) <= 0.15 and up(i-1) and up(i-2) and up(i-3),
 'doji_after_dn3': lambda i: body(i) <= 0.15 and dn(i-1) and dn(i-2) and dn(i-3),
}
OUTSETS = ('K1', 'K2', 'K3', 'PR3', 'PR4')
def bucket(m): return 0 if m < 240 else (1 if m < 570 else (2 if m < 720 else 3))
acc = {}
for i in range(5, n):
    if not elig[i] or rng(i) <= 0 or atr[i] <= 0: continue
    m = mod[i]; b = bucket(m); tt = 0 if is_train[day[i]] else 1
    hits = [f for f, fn in FAM.items() if fn(i)]
    if not hits: continue
    for f in hits:
        for os_ in OUTSETS:
            pl = OUT[os_][0][i]
            if pl != pl: continue
            ps = OUT[os_][1][i]
            for bb in (b, 9):
                a = acc.setdefault((f, os_, bb, tt), [0, 0, 0, 0.0, 0.0])
                a[0] += 1; a[3] += pl; a[4] += ps
                if pl > 0: a[1] += 1
                if ps > 0: a[2] += 1
rows = []
for (f, os_, bb, tt), a in acc.items():
    if tt != 0 or a[0] < 300: continue
    te = acc.get((f, os_, bb, 1), [0, 0, 0, 0.0, 0.0])
    for dirn, wi, si in (('long', 1, 3), ('short', 2, 4)):
        rows.append((f, os_, bb, dirn, a[0], a[wi]/a[0]*100, (a[si]-COST*a[0])*USD, te[0], (te[wi]/te[0]*100 if te[0] else float('nan')), (te[si]-COST*te[0])*USD))
rows.sort(key=lambda r: -r[5])
print(f'{label}: {len(rows)} Familien-Hypothesen (N_train>=300). Top 30 nach TRAIN-WR:')
for r in rows[:30]:
    print(f"{r[0]:16s} {r[1]:>4s} b={r[2]} {r[3]:>5s} Ntr={r[4]:5d} WRtr={r[5]:5.1f} Net={r[6]:8.0f} | Nte={r[7]:5d} WRte={r[8]:5.1f} Net={r[9]:8.0f}")
print(f"Mittel WR_test Top30: {sum(r[8] for r in rows[:30] if r[8]==r[8])/30:.1f}")
