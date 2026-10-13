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
if os.path.exists('plan/kreuz-final.json'):
    for k in json.load(open('plan/kreuz-final.json')).get('schritte', []):
        n = k['nr']
        if n not in steps: continue
        steps[n]['notizen'] = [x for x in steps[n]['notizen'] if not x.startswith(('ENTFÄLLT', 'ÄNDERN'))]
        if k['aktion'] == 'entfaellt': steps[n]['status'] = 'entfaellt'; steps[n]['notizen'].append(f"ENTFÄLLT (Kreuzprüfung {k.get('ziel_nr','')}): {k['anweisung']}")
        else: steps[n]['status'] = 'offen'; steps[n]['notizen'].append(f"VERBINDLICH (Kreuzprüfung): {k['anweisung']}")
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
BUD = 40
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

# ---- Paket-Dateien, Wellen, PLAN.md ----
specs = {}
def spec_lines(g, a, b):
    if g not in specs: specs[g] = open(f'spec/{g}.md').read().split('\n')
    return '\n'.join(specs[g][a-1:b])
pnr = {n: p['nr'] for p in pakete for n in p['schritte']}
for p in pakete:
    deps = sorted({pnr[a] for (a, b) in edges if b in p['schritte'] and a in pnr and pnr[a] != p['nr']})
    p['haengt_ab'] = deps
    L = [f"# Paket {p['nr']:03d} · {', '.join(p['cluster'])}", '',
         f"Schritte: {len(p['schritte'])} · Dateien: {', '.join(p['dateien']) or '—'}",
         f"Betroffene Tests laut Spezifikation: {'; '.join(p['tests']) or '—'}",
         f"Baut auf Paketen auf: {', '.join(map(str, deps)) or '—'}", '',
         'Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.', '']
    for n in p['schritte']:
        s = steps[n]
        L += [f"## {n} · {s['titel']}", '',
              f"Gruppe {s['gruppe']} · Cluster {s['cluster']} · Aufwand {s.get('aufwand') or '?'} · Befunde: {', '.join(s.get('befund_ids') or []) or '—'}",
              f"Quelle: audit/spec/{s['gruppe']}.md Z. {s['von']}–{s['bis']} · Dateien: {', '.join(s.get('dateien') or [])}",
              f"Abhängig von: {', '.join(s.get('abhaengig') or []) or '—'}", '', '```text', spec_lines(s['gruppe'], s['von'], s['bis']), '```', '']
        if s['notizen']:
            L += ['**Hinweise aus der Abstimmung (verbindlich):**', ''] + [f'- {x}' for x in s['notizen']] + ['']
    open(f"plan/paket-{p['nr']:03d}.md", 'w').write('\n'.join(L))
# Wellen: höchstens K Pakete, nur wenn alle Abhängigkeiten in früheren Wellen
K = 4; done = set(); waves = []; rest = [p['nr'] for p in pakete]
while rest:
    w = []
    for n in rest:
        P = pakete[n-1]
        if all(d in done for d in P['haengt_ab']) and len(w) < K:
            # nicht zwei Pakete desselben Clusters mit gemeinsamen JS-Dateien parallel
            js = {f for f in P['dateien'] if f.endswith('.js')}
            if any(js & {f for f in pakete[m-1]['dateien'] if f.endswith('.js')} for m in w): continue
            w.append(n)
        if len(w) >= K: break
    if not w: w = [rest[0]]
    waves.append(w); done |= set(w); rest = [n for n in rest if n not in w]
json.dump({'pakete': pakete, 'wellen': waves}, open('plan/wellen.json', 'w'), ensure_ascii=False, indent=1)
print('Wellen', len(waves), [len(w) for w in waves][:40])

# ---- PLAN.md (Übersicht für den Nutzer und die Sitzung) ----
fragen = []
for k in ['farbe', 'typografie', 'abstaende', 'komponenten', 'aufbau', 'diagramme', 'zustaende', 'barrierefreiheit', 'kilook', 'responsiv', 'wording', 'bewegung']:
    r = json.load(open(f'spec/{k}.result.json'))
    for q in r.get('nutzer_fragen') or []:
        if isinstance(q, dict): fragen.append((k, q.get('id', ''), q.get('frage', ''), q.get('empfehlung', '')))
        else: fragen.append((k, '', str(q), ''))
nd = sum(len(json.load(open(f)).get('entscheidungen', [])) for f in glob.glob('plan/entscheid-*.json'))
L = ['# Umsetzungsplan Design-Audit', '',
     f"{len(steps)} Schritte aus 12 Zielspezifikationen (audit/spec/*.md) · {nd} Entscheidungen zu Überschneidungen (plan/entscheid-*.json) · "
     f"{len(active)} aktiv, {sum(s['status'] == 'entfaellt' for s in steps.values())} entfallen (doppelt oder überstimmt), {sum(bool(s.get('wartet')) for s in steps.values())} warten auf eine Nutzerfrage · {len(pakete)} Pakete in {len(waves)} Wellen.", '',
     'Ablauf je Paket: Umsetzer in eigener Arbeitskopie (git-Worktree) → strenger Prüfer → Zusammenführen in den Hauptzweig mit vollem Testlauf (alle Suiten) → Push. Pakete einer Welle laufen parallel.', '',
     '## Pakete', '', '| Paket | Cluster | Schritte | Baut auf | Dateien |', '|---|---|---|---|---|']
for p in pakete:
    L.append(f"| {p['nr']:03d} | {', '.join(p['cluster'])} | {len(p['schritte'])} | {', '.join(f'{x:03d}' for x in p['haengt_ab']) or '—'} | {', '.join(f.replace('web/', '') for f in p['dateien'][:6])}{' …' if len(p['dateien']) > 6 else ''} |")
L += ['', '## Wellen', ''] + [f"- Welle {i}: {', '.join(f'{n:03d}' for n in w)}" for i, w in enumerate(waves, 1)]
L += ['', '## Fragen an dich (werden bis zur Antwort nicht umgesetzt)', '']
for k, i, q, e in fragen: L.append(f"- **{k}{' · ' + i if i else ''}:** {q}" + (f" Empfehlung: {e}" if e else ''))
L += ['', '## Entfallene Schritte', ''] + [f"- {n}: {next((x for x in steps[n]['notizen'] if x.startswith('ENTFÄLLT')), '')[:300]}" for n in sorted(n for n, s in steps.items() if s['status'] == 'entfaellt')]
L += ['', '## Wartende Schritte', ''] + [f"- {n}: wartet auf {s['wartet']}" for n, s in sorted(steps.items()) if s.get('wartet')]
open('PLAN.md', 'w').write('\n'.join(L))
print('PLAN.md', len(fragen), 'Fragen')
