"""Führt Prüfurteile (fakten/vorgaben) mit den Befund-Stapeln zusammen: findings-kept.json, findings-dropped.json, merge-status."""
import json, os, glob, sys
AU = os.path.dirname(os.path.abspath(__file__)); WF = '/root/.claude/projects/-home-user-Florian/3d79e81c-3967-55f9-a53a-e07cf04bcd94/subagents/workflows/'
runs = [l.strip() for l in open(AU + '/verify-runids.txt') if l.strip()]
verd = {}
for w in runs:
    p = WF + w + '/journal.jsonl'
    if not os.path.exists(p): continue
    st = {}
    for l in open(p, encoding='utf-8'):
        e = json.loads(l)
        if e['type'] == 'started': st[e['agentId']] = e.get('label', '')
        if e['type'] == 'result' and isinstance(e.get('result'), dict) and 'urteile' in e['result']:
            lab = st.get(e['agentId'], '').replace(' (opus)', ''); role, bn = lab.split(':', 1)
            verd.setdefault(bn, {})[role] = {u['id']: u for u in e['result']['urteile']}
kept, dropped, missing = [], [], []
for fn in sorted(glob.glob(AU + '/batches/*.json')):
    bn = os.path.basename(fn)[:-5]; bn = bn.rsplit('-', 1)[0] + '-' + str(int(bn.rsplit('-', 1)[1]))
    v = verd.get(bn, {})
    if 'fakten' not in v or 'vorgaben' not in v: missing.append(bn); continue
    for f in json.load(open(fn, encoding='utf-8')):
        a, c = v['fakten'].get(f['id']), v['vorgaben'].get(f['id'])
        g = dict(f); g['fakten'] = (a or {}).get('anmerkung', 'kein Urteil'); g['vorgaben'] = (c or {}).get('anmerkung', 'kein Urteil')
        g['duplikat_von'] = (a or {}).get('duplikat_von', '') or ''
        g['schwere'] = (a or {}).get('schwere') or (c or {}).get('schwere') or f.get('schwere')
        if c and c.get('vorschlag_neu'): g['vorschlag'] = c['vorschlag_neu']
        elif a and a.get('vorschlag_neu'): g['vorschlag'] = a['vorschlag_neu']
        if a and a.get('vorschlag_neu') and c and c.get('vorschlag_neu'): g['vorschlag_fakten'] = a['vorschlag_neu']
        ok = bool(a and a.get('bestaetigt') and not g['duplikat_von'] and c and c.get('bestaetigt'))
        (kept if ok else dropped).append(g)
# Duplikate: ihre Zusatzhinweise an den Ziel-Befund hängen, damit nichts verloren geht
byid = {f['id']: f for f in kept}
for d in dropped:
    t = byid.get(d.get('duplikat_von'))
    if t is not None:
        t.setdefault('ergaenzungen', []).append({'von': d['id'], 'titel': d.get('titel', ''), 'hinweis': d.get('fakten', ''), 'vorschlag': d.get('vorschlag', '')})
json.dump(kept, open(AU + '/findings-kept.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
json.dump(dropped, open(AU + '/findings-dropped.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'Stapel mit Urteil: {len(verd)} | fehlen: {len(missing)} {missing[:12]} | bestätigt {len(kept)} | verworfen {len(dropped)}')
