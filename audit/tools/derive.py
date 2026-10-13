def h2r(h):
    h=h.lstrip('#'); return [int(h[i:i+2],16) for i in (0,2,4)]
def r2h(c): return '#'+''.join('%02x'%round(min(255,max(0,v))) for v in c)
def shade(h,f):
    c=h2r(h); return r2h([v*(1+f) if f<0 else v+(255-v)*f for v in c])
def lum(h):
    r,g,b=[v/255 for v in h2r(h)]
    f=lambda v: v/12.92 if v<=0.03928 else ((v+0.055)/1.055)**2.4
    return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b)
def cr(a,b):
    la,lb=lum(a),lum(b)
    if la<lb: la,lb=lb,la
    return (la+0.05)/(lb+0.05)
def surfaces(b):
    if lum(b)>0.32: return {'--bg':b,'--bg-2':shade(b,-0.03),'--surface':shade(b,0.72),'--surface-2':shade(b,0.38),'--surface-3':shade(b,-0.04),'--border':shade(b,-0.07),'--border-2':shade(b,-0.15),'--field':shade(b,0.72)}
    return {'--bg':b,'--bg-2':shade(b,0.025),'--surface':shade(b,0.05),'--surface-2':shade(b,0.085),'--surface-3':shade(b,0.12),'--border':shade(b,0.07),'--border-2':shade(b,0.13),'--field':shade(b,0.015)}
for b in ['#3a4a5a','#2a1f3d','#e8e4dc','#1d2433','#7a8a9a','#a0a0a0','#5a5a5a']:
    print(b,'lum %.3f'%lum(b), 'light' if lum(b)>0.32 else 'dark')
# proposal: clamp + derive
def clampBase(b):
    x=b; i=0
    if lum(b)>0.32:
        while lum(x)<0.72 and i<20: x=shade(x,0.12); i+=1
    else:
        while lum(x)>0.012 and i<20: x=shade(x,-0.12); i+=1
    return x
def toward(b, ref, target, light):
    for k in range(0,101):
        f=k/100
        c=shade(b,-f) if light else shade(b,f)
        if cr(c,ref)>=target: return c
    return '#000000' if light else '#ffffff'
for b in ['#3a4a5a','#2a1f3d','#e8e4dc','#1d2433','#7a8a9a','#5a5a5a','#c8c0b0']:
    cb=clampBase(b); s=surfaces(cb); light=lum(cb)>0.32
    t=toward(cb,s['--surface-2'],14 if not light else 15,light); t2=toward(cb,s['--surface-2'],8,light); m=toward(cb,s['--surface-3'],4.6,light); fa=toward(cb,s['--surface'],2.3,light)
    print(f"{b} -> {cb} lum {lum(cb):.3f} surf {s['--surface']} text {t} text2 {t2} muted {m} faint {fa}")
    print('    muted/s2 %.2f muted/s3 %.2f muted/bg %.2f faint/surf %.2f loss/surf %.2f be/surf %.2f profit/surf %.2f' % (cr(m,s['--surface-2']),cr(m,s['--surface-3']),cr(m,s['--bg']),cr(fa,s['--surface']),cr('#ff5c5c' if not light else '#e03e3e',s['--surface']),cr('#8b7cf6' if not light else '#6b5bd6',s['--surface']),cr('#34f58a' if not light else '#0fb862',s['--surface'])))
    # border proposal
    if light: bo=shade(cb,-0.10); bo2=shade(cb,-0.19)
    else: bo=shade(cb,0.10); bo2=shade(cb,0.17)
    print('    border old/surf %.2f new %s /surf %.2f /s2 %.2f ; border-2 old %.2f new %s %.2f' % (cr(s['--border'],s['--surface']),bo,cr(bo,s['--surface']),cr(bo,s['--surface-2']),cr(s['--border-2'],s['--surface']),bo2,cr(bo2,s['--surface'])))
