import json, glob, re, collections
by = collections.defaultdict(list)
for f in glob.glob('plan/entscheid-*.json'):
    c = int(re.findall(r'\d+', f)[-1]); r = json.load(open(f))
    for e in r.get('entscheidungen', []):
        for a in e.get('anpassungen') or []:
            by[a['nr']].append({'paket': c, 'anker': e['anker'], 'aktion': a['aktion'], 'ziel': a.get('ziel_nr', ''), 'anweisung': a['anweisung'], 'entscheidung': e['entscheidung'][:1500]})
multi = {n: v for n, v in by.items() if len({x['paket'] for x in v}) > 1}
mixed = {n: v for n, v in multi.items() if len({x['aktion'] for x in v}) > 1 or any(x['aktion'] == 'aendern' for x in v)}
print('Schritte mit Anpassungen', len(by), 'aus mehreren Paketen', len(multi), 'davon prüfenswert', len(mixed))
json.dump(mixed, open('plan/kreuz.json', 'w'), ensure_ascii=False, indent=1)
