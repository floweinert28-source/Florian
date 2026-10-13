import json, sys, os
# argv: workflow output file(s); writes hicks-in/pruefung-<key>.json merging roles
for fn in sys.argv[1:]:
    d = json.load(open(fn)); d = d.get("result", d)
    for x in d['results']:
        p = f"hicks-in/pruefung-{x['key']}.json"
        cur = json.load(open(p)) if os.path.exists(p) else {}
        cur[x['role']] = x['r']
        json.dump(cur, open(p, 'w'), ensure_ascii=False, indent=1)
        print(x['key'], x['role'], len(x['r'].get('urteile', [])))
