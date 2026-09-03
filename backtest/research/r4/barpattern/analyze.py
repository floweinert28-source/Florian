"""Auswertung der Zellen: Train/Test-Korrelation, Top-Listen nach WR und nach unterer Konfidenzgrenze, Doppel-Survivor."""
import sys, csv, math
rows = [r for r in csv.DictReader(open(sys.argv[1]))]
for r in rows:
    for k in ('L','code','bt','bucket','n_train','n_test'): r[k] = int(r[k])
    for k in ('wr_train','net_train','wr_test','net_test'): r[k] = float(r[k])
print('Hypothesen gesamt:', len(rows))
def corr(sub):
    n=len(sub); mx=sum(r['wr_train'] for r in sub)/n; my=sum(r['wr_test'] for r in sub)/n
    sxy=sum((r['wr_train']-mx)*(r['wr_test']-my) for r in sub); sx=math.sqrt(sum((r['wr_train']-mx)**2 for r in sub)); sy=math.sqrt(sum((r['wr_test']-my)**2 for r in sub))
    return sxy/(sx*sy) if sx and sy else float('nan')
sub=[r for r in rows if r['n_test']>=100]
print(f"Korrelation WR_train vs WR_test (n_test>=100, {len(sub)} Zellen): r = {corr(sub):.3f}")
for bt in (0,1,2):
    s2=[r for r in sub if r['bt']==bt]
    if s2: print(f"   bt={bt}: r = {corr(s2):.3f} ({len(s2)})")
def show(lst, title):
    print('\n'+title)
    print(f"{'typ':6s} {'L':>1s} {'code':>6s} {'bt':>2s} {'b':>2s} {'set':>4s} {'dir':>5s} {'Ntr':>5s} {'WRtr':>6s} {'NetTr':>8s} {'Nte':>5s} {'WRte':>6s} {'NetTe':>8s}")
    for r in lst:
        print(f"{r['sym']:6s} {r['L']:1d} {r['code']:6d} {r['bt']:2d} {r['bucket']:2d} {r['outset']:>4s} {r['dir']:>5s} {r['n_train']:5d} {r['wr_train']:6.1f} {r['net_train']:8.0f} {r['n_test']:5d} {r['wr_test']:6.1f} {r['net_test']:8.0f}")
    if lst: print(f"   Mittel WR_test der Liste: {sum(r['wr_test'] for r in lst)/len(lst):.1f}%  | Anteil Test>=55%: {sum(1 for r in lst if r['wr_test']>=55)}/{len(lst)}")
for mn in (400, 800, 1500, 3000):
    s3=sorted([r for r in rows if r['n_train']>=mn], key=lambda r:-r['wr_train'])
    show(s3[:20], f"Top 20 TRAIN-WR bei n_train>={mn} ({len(s3)} Hypothesen)")
for r in rows: r['lcb']=r['wr_train']-2*math.sqrt(r['wr_train']*(100-r['wr_train'])/r['n_train'])
show(sorted(rows,key=lambda r:-r['lcb'])[:20], "Top 20 nach unterer Konfidenzgrenze (WR - 2 SD)")
both=[r for r in rows if r['wr_train']>=57 and r['wr_test']>=57 and r['n_test']>=150]
show(sorted(both,key=lambda r:-(r['n_train']+r['n_test']))[:30], f"Zellen mit WR_train>=57 UND WR_test>=57 (n_test>=150): {len(both)} (post-hoc Auswahl!)")
