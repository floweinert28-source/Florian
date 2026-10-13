import json, glob, re, collections
steps = []
for f in sorted(glob.glob('plan/extract-*.json')):
    k = f.split('extract-')[1][:-5]
    for s in json.load(open(f))['schritte']:
        s = dict(s); s['gruppe'] = k; steps.append(s)
def norm(a):
    a = a.strip().replace('&gt;', '>').replace('&lt;', '<').replace('&amp;', '&')
    a = re.sub(r'\s+', ' ', a)
    return a
GENERIC = {':root', 'web/css/app.css'}
by = collections.defaultdict(list)
for s in steps:
    for a in set(map(norm, s.get('anker', []))):
        if a in GENERIC or a.startswith('t:'): continue
        by[a].append(s['nr'])
ov = {a: v for a, v in by.items() if len({n.split('-')[0] for n in v}) > 1}
print('Schritte', len(steps), 'Anker', len(by), 'Überschneidende Anker', len(ov))
cl = collections.Counter(s['cluster'] for s in steps); print(cl.most_common())
top = sorted(ov.items(), key=lambda x: -len(x[1]))[:25]
for a, v in top: print(len(v), a, v[:8])
json.dump({'steps': steps, 'overlap': ov}, open('plan/steps.json', 'w'), ensure_ascii=False, indent=1)
