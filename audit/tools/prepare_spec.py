"""Nach dem Prüfen: findings-verified.json, kept-index.txt, spec-input/<gruppe>.json und Gruppenliste für spec.js."""
import json, os, re, sys
AU = os.path.dirname(os.path.abspath(__file__))
kept = json.load(open(AU + '/findings-kept.json', encoding='utf-8'))
extra = json.load(open(AU + '/findings-gap.json', encoding='utf-8')) if os.path.exists(AU + '/findings-gap.json') else []
allk = kept + extra
allk.sort(key=lambda f: (f.get('schwere') or 3, f.get('bereich', '')))
json.dump(allk, open(AU + '/findings-verified.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
with open(AU + '/kept-index.txt', 'w', encoding='utf-8') as fh:
    for f in allk: fh.write(f"{f['id']} [{f.get('bereich','')}/{f.get('kategorie','')}/S{f.get('schwere')}] {f.get('titel','')}\n")
G = [('typografie', 'Typografie', ['typografie']), ('abstaende', 'Abstände und Layout', ['abstaende', 'layout']), ('komponenten', 'Komponenten', ['komponenten']),
     ('farbe', 'Farbe und Kontrast', ['farbe', 'kontrast']), ('wording', 'Wortwahl und UX-Texte', ['wording']), ('zustaende', 'Zustände und Randfälle', ['zustaende']),
     ('responsiv', 'Responsiv (Handy, Tablet)', ['responsiv']), ('bewegung', 'Bewegung und Übergänge', ['bewegung']), ('barrierefreiheit', 'Barrierefreiheit und Bedienung', ['barrierefreiheit']),
     ('diagramme', 'Diagramme und Kennzahlen', ['diagramme']), ('aufbau', 'Aufbau, Informationsarchitektur und Hierarchie', ['aufbau', 'hierarchie']), ('kilook', 'KI-Look und Sonstiges', ['ki-look', 'ki_look', 'sonstiges'])]
cat = lambda f: re.sub(r'[^a-z_-]', '', (f.get('kategorie') or 'sonstiges').lower().split('/')[0].split(',')[0].strip())
groups = []
used = set()
for key, titel, cats in G:
    part = [f for f in allk if cat(f) in cats]
    used.update(f['id'] for f in part)
    groups.append([key, titel, part])
rest = [f for f in allk if f['id'] not in used]
groups[-1][2] += rest
for key, titel, part in groups:
    json.dump(part, open(f'{AU}/spec-input/{key}.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
gl = [{'key': k, 'titel': t, 'count': len(p)} for k, t, p in groups]
json.dump(gl, open(AU + '/spec-groups.json', 'w', encoding='utf-8'), ensure_ascii=False)
print('bestätigt gesamt', len(allk), '(davon Lücken', len(extra), ') | Rest in kilook:', len(rest))
print(json.dumps(gl, ensure_ascii=False))
