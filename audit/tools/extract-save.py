import json, sys
for fn in sys.argv[1:]:
    d = json.load(open(fn)); d = d.get('result', d)
    for x in d['results']:
        r = x['r'] or {}
        json.dump(r, open(f"plan/extract-{x['key']}.json", 'w'), ensure_ascii=False, indent=1)
        ids = {i for s in r.get('schritte', []) for i in s.get('befund_ids', [])}
        sp = json.load(open(f"spec/{x['key']}.result.json"))
        miss = set(sp.get('ids_abgedeckt', [])) - ids
        lines = sorted((s['von'], s['bis']) for s in r.get('schritte', []))
        print(x['key'], 'schritte', len(r.get('schritte', [])), 'ids', len(ids), 'fehlende ids', sorted(miss), 'zeilen', lines[0] if lines else None, lines[-1] if lines else None)
