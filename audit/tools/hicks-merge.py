import json, glob, os, sys
H = 'hicks-in'
ORDER = ['shell','dashboard','trades','trade_dialog','day','stats','notebook_news','training','prop','replay','konto','settings']
screens, hints, korr, missing = [], {}, [], []
for key in ORDER:
    a = json.load(open(f'{H}/analyse-{key}.json'))
    hints[key] = a.get('hinweise', '')
    p = json.load(open(f'{H}/pruefung-{key}.json')) if os.path.exists(f'{H}/pruefung-{key}.json') else {}
    fak, vor = p.get('fakten') or {}, p.get('vorgaben') or {}
    if not fak: missing.append(key + ':fakten')
    if not vor: missing.append(key + ':vorgaben')
    F = {u['id']: u for u in fak.get('urteile', [])}
    V = {u['id']: u for u in vor.get('urteile', [])}
    k = ' | '.join(x for x in [fak.get('screen_korrekturen', ''), vor.get('screen_korrekturen', '')] if x)
    korr.append({'gruppe': key, 'text': k})
    for s in a['screens']:
        out = {x: s.get(x) for x in ['sid','gruppe','screen','zustand','hauptaktion','optisch_klar','begruendung','konkurrenten','verstecken','irrelevant']}
        vs = []
        for v in s['vorschlaege']:
            f, c = F.get(v['id']), V.get(v['id'])
            keep = bool(f and f.get('bestaetigt') and c and c.get('bestaetigt'))
            vs.append({'id': v['id'], 'bestaetigt': keep, 'titel': v['titel'], 'regel': v['regel'],
                       'wirkung': (f and f.get('wirkung')) or (c and c.get('wirkung')) or v['wirkung'],
                       'aufwand': v.get('aufwand', ''),
                       'beschreibung': (c and c.get('beschreibung_neu')) or (f and f.get('beschreibung_neu')) or v['beschreibung'],
                       'beleg': v.get('beleg', ''),
                       'fakten': (f.get('anmerkung', '') if f else 'kein Urteil'),
                       'vorgaben': (c.get('anmerkung', '') if c else 'kein Urteil')})
        out['vorschlaege'] = vs
        screens.append(out)
kept = sum(v['bestaetigt'] for s in screens for v in s['vorschlaege'])
tot = sum(len(s['vorschlaege']) for s in screens)
json.dump({'screens': screens, 'korrekturen': korr, 'hinweise': hints}, open('hicks-payload.json', 'w'), ensure_ascii=False, indent=1)
print(f'screens={len(screens)} vorschlaege={tot} bestaetigt={kept} verworfen={tot-kept} fehlend={missing}')
