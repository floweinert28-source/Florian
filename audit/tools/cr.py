import sys
def lum(h):
    h=h.lstrip('#'); 
    if len(h)==3: h=''.join(c*2 for c in h)
    r,g,b=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    f=lambda v: v/12.92 if v<=0.03928 else ((v+0.055)/1.055)**2.4
    return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b)
def cr(a,b):
    la,lb=lum(a),lum(b); 
    if la<lb: la,lb=lb,la
    return (la+0.05)/(lb+0.05)
V={
 'graphit':{'--bg':'#0e0d0b','--surface':'#1a1917','--surface-2':'#22211f','--surface-3':'#2b2a26','--border':'#262522','--border-2':'#34322e','--field':'#121110','--text':'#f2f0ec','--text-2':'#bcb8b1','--muted':'#8a867f','--faint':'#4f4c47','--profit':'#34f58a','--loss':'#ff5c5c','--be':'#8b7cf6','--warn':'#f5b93a'},
 'hell':{'--bg':'#f5f7f5','--surface':'#ffffff','--surface-2':'#f3f5f3','--surface-3':'#e9ede9','--border':'#e1e6e2','--border-2':'#cfd6d1','--field':'#ffffff','--text':'#0d130f','--text-2':'#3d463f','--muted':'#6a746d','--faint':'#b0b8b2','--profit':'#0fb862','--loss':'#e03e3e','--be':'#6b5bd6','--warn':'#d99a12'},
 'schwarz':{"--bg":"#000000","--surface":"#0b0d0c","--surface-2":"#121513","--surface-3":"#191d1a","--border":"#1f2622","--border-2":"#2b332e","--field":"#0b0d0c","--text":"#f2f5f3","--text-2":"#b4bdb7","--muted":"#7d877f","--faint":"#4d564f","--profit":"#34f58a","--loss":"#ff5c5c","--be":"#8b7cf6","--warn":"#f5b93a"},
 'eigen-hell':{"--bg":"#e8e4dc","--surface":"#f9f7f5","--surface-2":"#f1eee9","--surface-3":"#dfdbd3","--border":"#d8d4cd","--border-2":"#c5c2bb","--field":"#f9f7f5","--text":"#0d130f","--text-2":"#3d463f","--muted":"#6a746d","--faint":"#b0b8b2","--profit":"#0fb862","--loss":"#e03e3e","--be":"#6b5bd6","--warn":"#d99a12"},
 'eigen-mittel':{"--bg":"#3a4a5a","--surface":"#445362","--surface-2":"#4b5968","--surface-3":"#52606e","--border":"#485766","--border-2":"#54626f","--field":"#3d4d5c","--text":"#f2f0ec","--text-2":"#bcb8b1","--muted":"#8a867f","--faint":"#4f4c47","--profit":"#34f58a","--loss":"#ff5c5c","--be":"#8b7cf6","--warn":"#f5b93a"},
 'eigen-satt':{"--bg":"#2a1f3d","--surface":"#352a47","--surface-2":"#3c324d","--surface-3":"#443a54","--border":"#392f4b","--border-2":"#463c56","--field":"#2d2240","--text":"#f2f0ec","--text-2":"#bcb8b1","--muted":"#8a867f","--faint":"#4f4c47","--profit":"#34f58a","--loss":"#ff5c5c","--be":"#8b7cf6","--warn":"#f5b93a"},
}
for n,v in V.items():
    s=v['--surface']
    print(f"== {n}")
    print('  text-2/surf %.2f  muted/surf %.2f muted/s2 %.2f muted/s3 %.2f muted/bg %.2f faint/surf %.2f faint/field %.2f' % (cr(v['--text-2'],s),cr(v['--muted'],s),cr(v['--muted'],v['--surface-2']),cr(v['--muted'],v['--surface-3']),cr(v['--muted'],v['--bg']),cr(v['--faint'],s),cr(v['--faint'],v['--field'])))
    print('  border/surf %.2f border-2/surf %.2f border/bg %.2f surf/bg %.2f s2/surf %.2f s3/surf %.2f field/surf %.2f border/s2 %.2f' % (cr(v['--border'],s),cr(v['--border-2'],s),cr(v['--border'],v['--bg']),cr(s,v['--bg']),cr(v['--surface-2'],s),cr(v['--surface-3'],s),cr(v['--field'],s),cr(v['--border'],v['--surface-2'])))
    print('  profit/surf %.2f loss/surf %.2f be/surf %.2f warn/surf %.2f' % (cr(v['--profit'],s),cr(v['--loss'],s),cr(v['--be'],s),cr(v['--warn'],s)))
