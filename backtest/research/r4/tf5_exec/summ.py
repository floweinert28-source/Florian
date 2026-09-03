import re,glob,sys
rows=[]
for f in sys.argv[2:]:
    for l in open(f):
        m=re.match(r'(.*?)\s+N=\s*(\d+) \(\s*([\d.]+)/wk\) \| TRAIN n=\s*(\d+) WR=\s*([\d.]+)% net=\s*([+-]?\d+) \| TEST n=\s*(\d+) WR=\s*([\d.]+)% net=\s*([+-]?\d+) \| yrs\+ (\S+)',l)
        if m: rows.append((m.group(1).strip(),int(m.group(2)),float(m.group(3)),float(m.group(5)),int(m.group(6)),float(m.group(8)),int(m.group(9)),m.group(10)))
minN=int(sys.argv[1]); print(len(rows),"rows")
def p(r): print(f"{r[0]:62s} N={r[1]:5d} {r[2]:4.1f}/wk WRtr={r[3]:5.1f} nettr={r[4]:+7d} WRte={r[5]:5.1f} nette={r[6]:+7d} {r[7]}")
print(f"--- N>={minN} by WR train top 25")
for r in sorted([r for r in rows if r[1]>=minN], key=lambda r:-r[3])[:25]: p(r)
print(f"--- N>={minN} by min(WRtr,WRte) top 12")
for r in sorted([r for r in rows if r[1]>=minN], key=lambda r:-min(r[3],r[5]))[:12]: p(r)
