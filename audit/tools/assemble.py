import json, glob, collections, heapq, re, os
d = json.load(open('plan/steps.json'))
steps = {s['nr']: dict(s) for s in d['steps']}
ORDER = ['tokens', 'komponenten', 'shell', 'aufbau', 'dashboard', 'statistik', 'trades_tag', 'notebook_news', 'training', 'prop', 'konto', 'einstellungen', 'responsiv', 'diagramme', 'zustaende', 'barrierefreiheit', 'wording', 'bewegung']
GORDER = ['farbe', 'typografie', 'abstaende', 'komponenten', 'aufbau', 'diagramme', 'zustaende', 'barrierefreiheit', 'kilook', 'responsiv', 'wording', 'bewegung']
for s in steps.values(): s.setdefault('notizen', []); s['status'] = 'offen'
edges = set()
for s in steps.values():
    for a in s.get('abhaengig') or []:
        if a in steps: edges.add((a, s['nr']))
decs, warten = [], []
for f in sorted(glob.glob('plan/entscheid-*.json'), key=lambda p: int(re.findall(r'\d+', p)[-1])):
    r = json.load(open(f))
    for e in r.get('entscheidungen', []):
        decs.append(e)
        for n in e.get('nrs', []):
            if n in steps: steps[n]['notizen'].append(f"[{e['art']}: {e['anker']}] {e['entscheidung']}")
        if e.get('wartet_auf_frage'):
            warten.append(e)
            for n in e.get('nrs', []):
                if n in steps: steps[n]['wartet'] = e['wartet_auf_frage']
        for a in e.get('anpassungen') or []:
            n = a['nr']
            if n not in steps: continue
            if a['aktion'] in ('entfaellt', 'zusammen_mit'):
                steps[n]['status'] = 'entfaellt'; steps[n]['notizen'].append(f"ENTFÄLLT ({a['aktion']} {a.get('ziel_nr','')}): {a['anweisung']}")
                z = a.get('ziel_nr')
                if z in steps: steps[z]['notizen'].append(f"ÜBERNIMMT {n}: {a['anweisung']}")
            else:
                steps[n]['notizen'].append(f"ÄNDERN: {a['anweisung']}")
        for p in e.get('reihenfolge') or []:
            if p['vor'] in steps and p['nach'] in steps: edges.add((p['vor'], p['nach']))
active = {n: s for n, s in steps.items() if s['status'] != 'entfaellt' and not s.get('wartet')}
# Kahn mit Priorität (Cluster, Gruppe, Zeile)
pri = lambda n: (ORDER.index(steps[n]['cluster']), GORDER.index(steps[n]['gruppe']), steps[n]['von'])
indeg = collections.Counter(); succ = collections.defaultdict(list)
for a, b in edges:
    if a in active and b in active: indeg[b] += 1; succ[a].append(b)
heap = [(pri(n), n) for n in active if indeg[n] == 0]; heapq.heapify(heap); out = []
while heap:
    _, n = heapq.heappop(heap); out.append(n)
    for m in succ[n]:
        indeg[m] -= 1
        if indeg[m] == 0: heapq.heappush(heap, (pri(m), m))
cyc = [n for n in active if n not in out]
out += sorted(cyc, key=pri)
W = {'S': 1, 'M': 2.5, 'L': 5}
pk, cur, cw, ccl = [], [], 0, None
BUD = 14
for n in out:
    s = steps[n]; w = W.get(s.get('aufwand') or 'S', 1)
    if cur and (cw + w > BUD or (s['cluster'] != ccl and cw >= 5)):
        pk.append(cur); cur, cw = [], 0
    cur.append(n); cw += w; ccl = s['cluster']
if cur: pk.append(cur)
pakete = []
for i, p in enumerate(pk, 1):
    cl = collections.Counter(steps[n]['cluster'] for n in p).most_common()
    pakete.append({'nr': i, 'cluster': [c for c, _ in cl], 'schritte': p, 'dateien': sorted({f for n in p for f in steps[n].get('dateien') or []}), 'tests': sorted({t for n in p for t in steps[n].get('tests') or []})})
json.dump({'pakete': pakete, 'steps': steps, 'entfallen': [n for n, s in steps.items() if s['status'] == 'entfaellt'], 'wartet': {n: s['wartet'] for n, s in steps.items() if s.get('wartet')}, 'zyklen': cyc}, open('plan/pakete.json', 'w'), ensure_ascii=False, indent=1)
print('Schritte', len(steps), 'aktiv', len(active), 'entfallen', sum(s['status'] == 'entfaellt' for s in steps.values()), 'wartet', sum(bool(s.get('wartet')) for s in steps.values()), 'Kanten', len(edges), 'Zyklen', len(cyc), 'Pakete', len(pakete))
print([ (p['nr'], p['cluster'][0], len(p['schritte'])) for p in pakete])
