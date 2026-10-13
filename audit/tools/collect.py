"""Sammelt alle Finder-Ergebnisse aus den Workflow-Journalen, entfernt wörtliche Duplikate und schreibt Prüf-Stapel."""
import json, re, os, sys
WF = '/root/.claude/projects/-home-user-Florian/3d79e81c-3967-55f9-a53a-e07cf04bcd94/subagents/workflows/'
RUNS = ['wf_5f282099-cf0', 'wf_f95063d3-650', 'wf_eeae7910-b26']
SKIP = set(sys.argv[2].split(',')) if len(sys.argv) > 2 and sys.argv[2] else set()  # bereits geprüfte Finder auslassen
ONLY = set(sys.argv[3].split(',')) if len(sys.argv) > 3 and sys.argv[3] else set()
AU = os.path.dirname(os.path.abspath(__file__))
SIZE = int(sys.argv[1]) if len(sys.argv) > 1 else 20
found, coverage = {}, {}
for w in RUNS:
    st = {}
    for l in open(WF + w + '/journal.jsonl', encoding='utf-8'):
        e = json.loads(l)
        if e['type'] == 'started': st[e['agentId']] = e.get('label', '')
        if e['type'] == 'result' and isinstance(e.get('result'), dict) and 'findings' in e['result']:
            key = st.get(e['agentId'], '').replace('finden:', '').replace(' (opus)', '')
            if key in SKIP or (ONLY and key not in ONLY): continue
            found[key] = e['result']
raw = []
for key, r in found.items():
    coverage[key] = {'geprueft': r.get('geprueft', []), 'hinweise': r.get('hinweise', '')}
    for i, f in enumerate(r.get('findings', [])):
        f = dict(f); f['id'] = f'{key}-{i + 1}'; f['quelle'] = key; raw.append(f)
norm = lambda s: re.sub(r'\s+', ' ', re.sub(r'[^a-zäöüß0-9 ]', ' ', (s or '').lower())).strip()
seen, uniq = set(), []
for f in raw:
    k = norm(f.get('bereich')) + '|' + norm(f.get('titel'))
    if k in seen: continue
    seen.add(k); uniq.append(f)
def area(f):
    a = norm(f.get('bereich')).split(' ')[0] if f.get('bereich') else 'global'
    a = re.split(r'[/_]', a)[0] or 'global'
    M = {'modal': 'dialoge', 'dialog': 'dialoge', 'bestätigungs': 'dialoge', 'pop': 'menues', 'menu': 'menues', 'menüs': 'menues', 'popover': 'menues', 'leer': 'leerzustaende',
         'statistik': 'stats', 'einstellungen': 'settings', 'trade': 'trades', 'verpassten': 'trades', 'start': 'startseite', 'handy': 'responsiv', 'mobile': 'responsiv',
         'titelzeile': 'shell', 'kopfreihen': 'shell', 'seitenleiste': 'shell', 'konto': 'shell', 'alle': 'global', 'diagramme': 'global', 'panel': 'dashboard'}
    return M.get(a, a)
groups = {}
for f in uniq: groups.setdefault(area(f), []).append(f)
PREFIX = sys.argv[4] if len(sys.argv) > 4 else 'batch'
for d in os.listdir(AU + '/batches'):
    if d.startswith(PREFIX + '-'): os.remove(AU + '/batches/' + d)
batches, n = [], 0
for a, lst in sorted(groups.items(), key=lambda x: -len(x[1])):
    lst.sort(key=lambda f: (f.get('kategorie', ''), f.get('titel', '')))
    for i in range(0, len(lst), SIZE):
        n += 1; part = lst[i:i + SIZE]; fn = f'{AU}/batches/{PREFIX}-{n:03d}.json'
        json.dump(part, open(fn, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        batches.append({'n': PREFIX + '-' + str(n), 'area': a, 'file': fn, 'count': len(part)})
json.dump({'found_keys': sorted(found), 'raw_n': len(raw), 'uniq_n': len(uniq), 'batches': batches, 'coverage': coverage}, open(AU + f'/collect-{PREFIX}.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
json.dump(uniq, open(AU + f'/findings-raw-{PREFIX}.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('Finder:', len(found), sorted(found)); print('roh', len(raw), 'eindeutig', len(uniq), 'Stapel', len(batches))
print({a: len(l) for a, l in sorted(groups.items(), key=lambda x: -len(x[1]))})
