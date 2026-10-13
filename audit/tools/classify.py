import re,os,glob,bisect,json,collections
ROOT='/home/user/Florian'
files=[f'{ROOT}/web/js/app.js',f'{ROOT}/web/js/ui.js',f'{ROOT}/web/js/widgets.js']+sorted(glob.glob(f'{ROOT}/web/js/screens/*.js'))+[f'{ROOT}/web/js/coach.js',f'{ROOT}/web/js/certificate.js',f'{ROOT}/web/js/editor.js',f'{ROOT}/web/js/datepicker.js',f'{ROOT}/web/js/rangepicker.js',f'{ROOT}/web/js/colorpicker.js',f'{ROOT}/web/js/voice.js',f'{ROOT}/web/js/store.js',f'{ROOT}/web/js/core.js',f'{ROOT}/web/js/prop.js',f'{ROOT}/web/js/shadow.js',f'{ROOT}/web/js/propsim.js',f'{ROOT}/web/js/replay.js',f'{ROOT}/web/app.html']
def strip_expr(s):
    out=[];i=0;depth=0
    while i<len(s):
        if s.startswith('${',i): depth+=1;i+=2;out.append('§');continue
        if depth:
            if s[i]=='{': depth+=1
            elif s[i]=='}': depth-=1
            i+=1;continue
        out.append(s[i]);i+=1
    return ''.join(out)
def clean(s):
    s=re.sub(r'\s+',' ',s.replace('\\n',' ')).strip()
    return s
def textish(s):
    return bool(re.search(r'[A-Za-zÄÖÜäöüß]{2}',s)) and not re.fullmatch(r'[§\s·,.:;/()\-–—+%€$]*',s)
cat=collections.defaultdict(list)  # category -> list of (text, loc)
def add(c,s,loc):
    s=clean(s)
    if not s or not textish(s): return
    if s.startswith('M') and re.match(r'^M[\d.\- ]',s): return
    cat[c].append((s,loc))
for f in files:
    src=open(f,encoding='utf-8').read(); rel=os.path.relpath(f,ROOT)
    starts=[0]+[i+1 for i,ch in enumerate(src) if ch=='\n']
    L=lambda pos: f'{rel}:{bisect.bisect_right(starts,pos)}'
    # 1) UI helper calls on raw source
    for m in re.finditer(r"U\.empty\(\s*'[^']*'\s*,\s*'((?:[^'\\]|\\.)*)'\s*(?:,\s*'((?:[^'\\]|\\.)*)')?",src):
        add('leer-titel',m.group(1),L(m.start()));
        if m.group(2): add('leer-text',m.group(2),L(m.start()))
    for m in re.finditer(r"U\.empty\(\s*'[^']*'\s*,\s*`((?:[^`\\]|\\.)*)`\s*(?:,\s*`((?:[^`\\]|\\.)*)`)?",src):
        add('leer-titel',strip_expr(m.group(1)),L(m.start()))
        if m.group(2): add('leer-text',strip_expr(m.group(2) or ""),L(m.start()))
    for m in re.finditer(r"U\.toast\(\s*(?:'((?:[^'\\]|\\.)*)'|`((?:[^`\\]|\\.)*)`)\s*(?:,\s*'(\w+)')?",src):
        add('toast',(m.group(1) or strip_expr(m.group(2) or ""))+('  ['+m.group(3)+']' if m.group(3) else ''),L(m.start()))
    for m in re.finditer(r"U\.confirmModal\(\s*(?:'((?:[^'\\]|\\.)*)'|`((?:[^`\\]|\\.)*)`)\s*,\s*(?:'((?:[^'\\]|\\.)*)'|`((?:[^`\\]|\\.)*)`)?(?:[^)]*?ok:\s*'([^']*)')?",src):
        add('bestätigen',f"{m.group(1) or strip_expr(m.group(2) or '')} || {m.group(3) or strip_expr(m.group(4) or '')} || OK={m.group(5) or 'Standard'}",L(m.start()))
    for m in re.finditer(r"U\.(card|tile|kv)\(\s*(?:'((?:[^'\\]|\\.)*)'|`((?:[^`\\]|\\.)*)`)",src):
        add('karte/kachel/kv-'+m.group(1),m.group(2) or strip_expr(m.group(3) or ""),L(m.start()))
    for m in re.finditer(r"info:\s*(?:'((?:[^'\\]|\\.)*)'|`((?:[^`\\]|\\.)*)`)",src):
        add('info-tooltip',m.group(1) or strip_expr(m.group(2) or ""),L(m.start()))
    for m in re.finditer(r"U\.info\(\s*(?:'((?:[^'\\]|\\.)*)'|`((?:[^`\\]|\\.)*)`)",src):
        add('info-tooltip',m.group(1) or strip_expr(m.group(2) or ""),L(m.start()))
    for m in re.finditer(r"foot:\s*(?:'((?:[^'\\]|\\.)*)'|`((?:[^`\\]|\\.)*)`)",src):
        add('fußtext',m.group(1) or strip_expr(m.group(2) or ""),L(m.start()))
    for m in re.finditer(r"(?:^|[\s{,])title:\s*'((?:[^'\\]|\\.)*)'",src):
        add('seitentitel',m.group(1),L(m.start()))
    for m in re.finditer(r"\bhead\(\s*'((?:[^'\\]|\\.)*)'\s*,\s*(?:'((?:[^'\\]|\\.)*)'|`((?:[^`\\]|\\.)*)`)",src):
        add('einstellungen-kopf',m.group(1)+' || '+(m.group(2) or strip_expr(m.group(3) or '')),L(m.start()))
    for m in re.finditer(r"switchRow\(\s*'((?:[^'\\]|\\.)*)'\s*,\s*(?:'((?:[^'\\]|\\.)*)'|`((?:[^`\\]|\\.)*)`)",src):
        add('schalter',m.group(1)+' || '+(m.group(2) or strip_expr(m.group(3) or '')),L(m.start()))
    # 2) template HTML
    for m in re.finditer(r"`((?:[^`\\]|\\.)*)`",src,re.S):
        t=strip_expr(m.group(1)); loc=L(m.start())
        if '<' not in t: continue
        for mm in re.finditer(r'<button[^>]*>(.*?)</button>',t,re.S):
            inner=re.sub(r'<[^>]+>','',mm.group(1)); add('knopf',inner,loc)
        for mm in re.finditer(r'<a [^>]*class="[^"]*\bbtn\b[^"]*"[^>]*>(.*?)</a>',t,re.S):
            inner=re.sub(r'<[^>]+>','',mm.group(1)); add('knopf-link',inner,loc)
        for mm in re.finditer(r'<(h[1-4])[^>]*>(.*?)</\1>',t,re.S):
            inner=re.sub(r'<[^>]+>','',mm.group(2)); add('überschrift-'+mm.group(1),inner,loc)
        for mm in re.finditer(r'<th[^>]*>(.*?)</th>',t,re.S):
            add('tabellenkopf',re.sub(r'<[^>]+>','',mm.group(1)),loc)
        for mm in re.finditer(r'<label[^>]*>(.*?)</label>',t,re.S):
            add('feldname',re.sub(r'<[^>]+>','',mm.group(1)),loc)
        for mm in re.finditer(r'class="lbl"[^>]*>(.*?)</span>',t,re.S):
            add('feldname',re.sub(r'<[^>]+>','',mm.group(1)),loc)
        for mm in re.finditer(r'class="legend"[^>]*>(.*?)</div>',t,re.S):
            add('feldgruppe',re.sub(r'<[^>]+>','',mm.group(1)),loc)
        for mm in re.finditer(r'placeholder="([^"]*)"',t): add('platzhalter',mm.group(1),loc)
        for mm in re.finditer(r'(?<![\w-])title="([^"]*)"',t): add('title-attr',mm.group(1),loc)
        for mm in re.finditer(r'aria-label="([^"]*)"',t): add('aria-label',mm.group(1),loc)
        for mm in re.finditer(r'data-tip="([^"]*)"',t): add('data-tip',mm.group(1),loc)
        for mm in re.finditer(r'<option[^>]*>(.*?)</option>',t,re.S): add('option',re.sub(r'<[^>]+>','',mm.group(1)),loc)
        for mm in re.finditer(r'class="(?:sec|caption|nav-title|sym-cap|set-cap|k)"[^>]*>(.*?)</(?:div|span)>',t,re.S): add('abschnitt-label',re.sub(r'<[^>]+>','',mm.group(1)),loc)
        for mm in re.finditer(r'class="banner[^"]*"[^>]*>(.*?)</div></div>',t,re.S): add('banner',re.sub(r'<[^>]+>',' ',mm.group(1)),loc)
        for mm in re.finditer(r'class="(?:small )?(?:muted|faint)(?: small)?"[^>]*>(.*?)</(?:div|p|span)>',t,re.S): add('hilfstext',re.sub(r'<[^>]+>','',mm.group(1)),loc)
        for mm in re.finditer(r'<p[^>]*>(.*?)</p>',t,re.S): add('absatz',re.sub(r'<[^>]+>','',mm.group(1)),loc)
        for mm in re.finditer(r'<(?:b|strong)>(.*?)</(?:b|strong)>',t,re.S): add('fett',re.sub(r'<[^>]+>','',mm.group(1)),loc)
out={}
for c,items in cat.items():
    seen={}
    for s,loc in items:
        seen.setdefault(s,[]).append(loc)
    out[c]=seen
json.dump(out,open('audit/strings-classified.json','w'),ensure_ascii=False,indent=1)
for c in out: print(c,len(out[c]))
