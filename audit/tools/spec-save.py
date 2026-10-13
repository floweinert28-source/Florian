import json, sys
for fn in sys.argv[1:]:
    d = json.load(open(fn)); d = d.get('result', d)
    for x in d['results']:
        r = x['r'] or {}
        json.dump(r, open(f"spec/{x['key']}.result.json", 'w'), ensure_ascii=False, indent=1)
        print(x['key'], 'ids', len(r.get('ids_abgedeckt', [])), 'konflikte', len(r.get('konflikte', [])), 'keys', list(r.keys()))
