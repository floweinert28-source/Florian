"""Korrekter Null-Benchmark: Tage paarweise (Train mit Train, Test mit Test) zufaellig gepaart; Symbole von Tag A werden
bei gleicher Uhrzeit mit den Ergebnissen von Tag B kombiniert. Muster/Ergebnis entkoppelt, Uhrzeit-Marginals erhalten, kein Leak."""
import pickle, random, sys, datetime as dt
from array import array
D = pickle.load(open(sys.argv[1], 'rb')); G = D['G']; days = D['days']; n = len(G['mod']); random.seed(int(sys.argv[3]) if len(sys.argv) > 3 else 11)
dayidx = {}
for i in range(n): dayidx.setdefault(G['day'][i], {})[G['mod'][i]] = i
tr = [d for d in range(len(days)) if days[d] < dt.date(2025,1,1)]; te = [d for d in range(len(days)) if days[d] >= dt.date(2025,1,1)]
partner = {}
for grp in (tr, te):
    p = grp[:]; random.shuffle(p); partner.update(dict(zip(grp, p)))
for s in ('symA', 'symB', 'symC', 'symD', 'symE'):
    old = G[s]; new = array('b', old)
    for i in range(n):
        j = dayidx[partner[G['day'][i]]].get(G['mod'][i])
        new[i] = old[j] if j is not None else -1
    G[s] = new
pickle.dump(D, open(sys.argv[2], 'wb')); print('paired', len(partner))
