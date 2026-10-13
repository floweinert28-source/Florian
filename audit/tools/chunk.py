import json, collections
d = json.load(open('plan/steps.json'))
steps = {s['nr']: s for s in d['steps']}
ov = d['overlap']
# Graph: Anker verbunden, wenn sie einen Schritt teilen
step2a = collections.defaultdict(set)
for a, nrs in ov.items():
    for n in nrs: step2a[n].add(a)
adj = collections.defaultdict(set)
for n, As in step2a.items():
    for a in As: adj[a] |= As - {a}
MAX = 34
seen, chunks = set(), []
order = sorted(ov, key=lambda a: -len(ov[a]))
for a0 in order:
    if a0 in seen: continue
    cur, queue = [], [a0]
    while queue and len(cur) < MAX:
        a = queue.pop(0)
        if a in seen: continue
        seen.add(a); cur.append(a)
        queue += sorted(adj[a] - seen, key=lambda x: -len(ov[x]))
    chunks.append(cur)
# kleine Pakete zusammenlegen
chunks.sort(key=len)
merged = []
for c in chunks:
    if merged and len(merged[-1]) + len(c) <= MAX and len(c) < 12: merged[-1] += c
    else: merged.append(c)
for i, c in enumerate(merged, 1):
    out = {'anker': [{'anker': a, 'schritte': [{k: steps[n].get(k) for k in ['nr', 'gruppe', 'titel', 'von', 'bis', 'cluster', 'dateien']} for n in ov[a]]} for a in c]}
    json.dump(out, open(f'plan/konflikt-{i}.json', 'w'), ensure_ascii=False, indent=1)
print(len(merged), 'Pakete', [len(c) for c in merged], 'Summe', sum(map(len, merged)), 'von', len(ov))
# Regeln
with open('plan/regeln.md', 'w') as f:
    f.write('# Zielzustand aller Themengruppen (kompakt, aus den Spezifikationen)\n\n')
    for k in ['farbe', 'typografie', 'abstaende', 'komponenten', 'aufbau', 'diagramme', 'zustaende', 'barrierefreiheit', 'wording', 'responsiv', 'bewegung', 'kilook']:
        r = json.load(open(f'plan/extract-{k}.json'))
        f.write(f'## {k}\n\n{r["regeln"]}\n\n')
import os; print('regeln.md', os.path.getsize('plan/regeln.md'))
