"""Null-Benchmark: Ergebnisse innerhalb Tag x Stunde zufaellig unter den Bars permutiert -> Muster/Ergebnis-Bezug zerstoert,
Tages-/Stunden-Marginals bleiben. Danach mine.py auf dem permutierten pkl."""
import pickle, random, sys
from array import array
D = pickle.load(open(sys.argv[1], 'rb')); G = D['G']; OUT = D['OUT']; n = len(G['mod']); random.seed(7)
groups = {}
for i in range(n):
    if G['elig'][i]: groups.setdefault((G['day'][i], G['mod'][i] // 60), []).append(i)
new = {k: (array('f', OUT[k][0]), array('f', OUT[k][1])) for k in OUT}
for idxs in groups.values():
    perm = idxs[:]; random.shuffle(perm)
    for a, b in zip(idxs, perm):
        for k in OUT:
            new[k][0][a] = OUT[k][0][b]; new[k][1][a] = OUT[k][1][b]
D['OUT'] = new; pickle.dump(D, open(sys.argv[2], 'wb')); print('shuffled', len(groups), 'Gruppen')
