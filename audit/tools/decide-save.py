import json, sys
for fn in sys.argv[1:]:
    d = json.load(open(fn)); d = d.get('result', d)
    for x in d['results']:
        r = x['r'] or {}
        json.dump(r, open(f"plan/entscheid-{x['chunk']}.json", 'w'), ensure_ascii=False, indent=1)
        c = json.load(open(f"plan/konflikt-{x['chunk']}.json"))
        alle = {a['anker'] for a in c['anker']}
        got = {e['anker'] for e in r.get('entscheidungen', [])} | set(r.get('vertraeglich', []))
        arts = {}
        for e in r.get('entscheidungen', []): arts[e['art']] = arts.get(e['art'], 0) + 1
        print('Paket', x['chunk'], 'Entscheidungen', len(r.get('entscheidungen', [])), arts, 'verträglich', len(r.get('vertraeglich', [])), 'ohne Urteil', sorted(alle - got)[:8])
