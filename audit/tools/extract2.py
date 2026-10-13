import json,re,os,glob
d=json.load(open('audit/strings-de.json'))
known=set(d.keys())
files=['/home/user/Florian/web/js/app.js','/home/user/Florian/web/js/ui.js','/home/user/Florian/web/js/widgets.js']+sorted(glob.glob('/home/user/Florian/web/js/screens/*.js'))+['/home/user/Florian/web/js/coach.js','/home/user/Florian/web/js/certificate.js','/home/user/Florian/web/js/editor.js','/home/user/Florian/web/js/datepicker.js','/home/user/Florian/web/js/rangepicker.js','/home/user/Florian/web/js/colorpicker.js','/home/user/Florian/web/js/prop.js','/home/user/Florian/web/js/shadow.js','/home/user/Florian/web/js/replay.js','/home/user/Florian/web/js/voice.js','/home/user/Florian/web/js/core.js','/home/user/Florian/web/js/store.js','/home/user/Florian/web/js/widgetpreviews.js','/home/user/Florian/web/js/propsim.js','/home/user/Florian/web/app.html']
def strip_expr(s):
    # remove ${...} with nesting
    out=[];i=0;depth=0
    while i<len(s):
        if s.startswith('${',i): depth+=1;i+=2;out.append('§');continue
        if depth:
            if s[i]=='{': depth+=1
            elif s[i]=='}': depth-=1
            i+=1;continue
        out.append(s[i]);i+=1
    return ''.join(out)
def ok(s):
    s=s.strip()
    if len(s)<2: return False
    if not re.search(r'[A-Za-zÄÖÜäöüß]{2}',s): return False
    if re.fullmatch(r'[§\s·,.:;/()\-–—+%€$]*',s): return False
    if not (re.search(r'[ÄÖÜäöüß]',s) or re.search(r'[A-Z]',s)): return False
    if re.fullmatch(r'[A-Za-z0-9_\-\.]+',s) and not re.search(r'[ÄÖÜäöüß]',s) and not re.fullmatch(r'[A-ZÄÖÜ][a-zäöüß]+',s): return False
    if re.match(r'^(M|L|C|Q|A|Z|H|V)[\d\s.,\-]',s): return False  # svg path
    if re.fullmatch(r'[\d\s§.,:%\-]+',s): return False
    if s.startswith('data:') or 'http' in s: return False
    if re.search(r'\b(px|em|rem|var\(|rgba?\(|hsl)',s): return False
    return True
res={}
tpl=re.compile(r"`((?:[^`\\]|\\.)*)`",re.S)
sq=re.compile(r"'((?:[^'\\\n]|\\.)*)'")
dq=re.compile(r'"((?:[^"\\\n]|\\.)*)"')
for f in files:
    try: src=open(f,encoding='utf-8').read()
    except Exception as e: print('ERR',f,e); continue
    rel=os.path.relpath(f,'/home/user/Florian')
    # line index
    starts=[0]
    for i,ch in enumerate(src):
        if ch=='\n': starts.append(i+1)
    import bisect
    def lineof(pos): return bisect.bisect_right(starts,pos)
    def add(s,pos):
        s=s.replace('\\n',' ').strip()
        s=re.sub(r'\s+',' ',s)
        if ok(s): res.setdefault(s,[]).append(f'{rel}:{lineof(pos)}')
    if f.endswith('.html'):
        body=src
        for m in re.finditer(r'>([^<>]+)<',body): add(m.group(1),m.start())
        for m in re.finditer(r'(?:title|placeholder|aria-label|data-tip|alt|content)="([^"]*)"',body): add(m.group(1),m.start())
        continue
    for m in tpl.finditer(src):
        t=strip_expr(m.group(1))
        if '<' in t or '>' in t:
            for mm in re.finditer(r'>([^<>]+)<',t): add(mm.group(1),m.start())
            for mm in re.finditer(r'(?:title|placeholder|aria-label|data-tip|alt|data-label|label)="([^"]*)"',t): add(mm.group(1),m.start())
            # leading/trailing text outside tags
            head=t.split('<',1)[0]; add(head,m.start())
            tail=t.rsplit('>',1)[-1]; add(tail,m.start())
        else: add(t,m.start())
    # remove template contents before scanning quotes
    src2=tpl.sub(lambda m:'`'+' '*len(m.group(1))+'`',src)
    for pat in (sq,dq):
        for m in pat.finditer(src2):
            s=m.group(1)
            if '<' in s:
                for mm in re.finditer(r'>([^<>]+)<',s): add(mm.group(1),m.start())
                for mm in re.finditer(r'(?:title|placeholder|aria-label|data-tip)="([^"]*)"',s): add(mm.group(1),m.start())
            else: add(s,m.start())
new={k:v for k,v in res.items() if k not in known and k.replace('§','{0}') not in known}
print(len(res),'texts,',len(new),'new')
with open('audit/strings-code-new.txt','w') as fo:
    for k in sorted(new,key=lambda k:new[k][0]): fo.write(f'{new[k][0]}\t{k}\n')
with open('audit/strings-code-all.txt','w') as fo:
    for k,v in res.items(): fo.write(f'{v[0]}\t{k}\n')
