import json,re,sys,os,glob
d=json.load(open('audit/strings-de.json'))
known=set(d.keys())
files=['/home/user/Florian/web/js/app.js','/home/user/Florian/web/js/ui.js','/home/user/Florian/web/js/widgets.js']+sorted(glob.glob('/home/user/Florian/web/js/screens/*.js'))+['/home/user/Florian/web/js/coach.js','/home/user/Florian/web/js/certificate.js','/home/user/Florian/web/js/editor.js','/home/user/Florian/web/js/datepicker.js','/home/user/Florian/web/js/rangepicker.js','/home/user/Florian/web/js/colorpicker.js','/home/user/Florian/web/js/prop.js','/home/user/Florian/web/js/shadow.js','/home/user/Florian/web/js/replay.js','/home/user/Florian/web/js/voice.js','/home/user/Florian/web/js/core.js','/home/user/Florian/web/js/store.js','/home/user/Florian/web/js/i18n.js','/home/user/Florian/web/js/theme.js','/home/user/Florian/web/app.html']
# capture quoted strings
pat=re.compile(r"'((?:[^'\\]|\\.)*)'|\"((?:[^\"\\]|\\.)*)\"|`((?:[^`\\]|\\.)*)`")
out=[]
for f in files:
    try: src=open(f,encoding='utf-8').read()
    except Exception as e: print('ERR',f,e); continue
    for ln,line in enumerate(src.split('\n'),1):
        if line.strip().startswith('//'): continue
        for m in pat.finditer(line):
            s=m.group(1) or m.group(2) or m.group(3) or ''
            if not s: continue
            # candidate: has letters, has uppercase or umlaut or space
            if not re.search(r'[A-Za-zÄÖÜäöüß]',s): continue
            if not (re.search(r'[ÄÖÜäöüß]',s) or (re.search(r'[A-Z]',s) and ' ' in s) or re.match(r'^[A-ZÄÖÜ][a-zäöüß]{2,}$',s)): continue
            # skip code-ish
            if re.search(r'[<>{};=()$\[\]]',s) and not re.search(r'\$\{',s): continue
            if re.match(r'^[a-z\-]+$',s): continue
            if re.match(r'^[#.]',s): continue
            if 'http' in s: continue
            if re.match(r'^[A-Z_]+$',s) and len(s)<40 and not ' ' in s: continue
            out.append((os.path.relpath(f,'/home/user/Florian'),ln,s))
new=[(f,ln,s) for f,ln,s in out if s not in known]
print(len(out),'candidates,',len(new),'not in strings-de.json')
with open('audit/strings-code-new.txt','w') as fo:
    for f,ln,s in new: fo.write(f'{f}:{ln}\t{s}\n')
with open('audit/strings-code-all.txt','w') as fo:
    for f,ln,s in out: fo.write(f'{f}:{ln}\t{s}\n')
