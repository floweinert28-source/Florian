"""Sanity-Check der Engine gegen bekannte NQ-Zahlen (London 02-05 Sweep+Reclaim ~54 %; LDR-Filter prev_trend<-0.3 & body>=0.75 ~69 %)."""
import sys
sys.path.insert(0, "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r4/es_ym_features")
import fw
NQ = fw.Inst("NQ"); rows = fw.build(NQ, "london")
tr, te = fw.split(rows); print("NQ london base:", fw.stats(tr), "|", fw.stats(te), "| all", fw.stats(rows))
sel = [r for r in rows if r["prev_trend"] < -0.3 and r["reclaim_body"] >= 0.75]
tr, te = fw.split(sel); print("NQ LDR-Filter :", fw.stats(tr), "|", fw.stats(te), "| all", fw.stats(sel))
sel = [r for r in rows if r["reclaim_body"] >= 0.75]
tr, te = fw.split(sel); print("NQ body>=0.75 :", fw.stats(tr), "|", fw.stats(te), "| all", fw.stats(sel))
