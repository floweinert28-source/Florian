import json, sys, re, os
for k in sys.argv[1:]:
    md = open(f'spec/{k}.md').read().split('\n')
    s3 = next(i for i, l in enumerate(md, 1) if re.match(r'^## *3\b', l))
    s4 = next(i for i, l in enumerate(md, 1) if i > s3 and re.match(r'^## ', l))
    r = json.load(open(f'plan/extract-{k}.json'))
    cov = set()
    for s in r['schritte']: cov.update(range(s['von'], s['bis'] + 1))
    unc = [i for i in range(s3 + 1, s4) if i not in cov and md[i-1].strip() and not md[i-1].startswith('#') and md[i-1].strip() != '---']
    print(k, f'Abschnitt 3: {s3}-{s4}', 'unabgedeckte Inhaltszeilen:', len(unc), unc[:15])
