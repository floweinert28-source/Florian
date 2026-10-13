import json, os
for g in json.load(open('spec-groups.json')) if os.path.exists('spec-groups.json') else []:
    k = g['key'] if isinstance(g, dict) else g
    inp = json.load(open(f'spec-input/{k}.json'))
    items = inp if isinstance(inp, list) else inp.get('befunde') or inp.get('items') or inp.get('findings')
    ids = {f['id'] for f in items}
    p = f'spec/{k}.result.json'
    if not os.path.exists(p): print(k, 'offen'); continue
    r = json.load(open(p)); got = set(r.get('ids_abgedeckt', []))
    zur = {z['id'] if isinstance(z, dict) else z for z in r.get('ids_zurueckgestellt', [])}
    print(f"{k}: {len(ids)} Befunde, abgedeckt {len(ids & got)}, nur zurückgestellt {len((ids - got) & zur)}, fehlend {sorted(ids - got - zur)}")
