"""LDR-Regel (Down-Vortag pt<-0.3, London 02-05, body>=0.75, first-close-decides) mit Signal-TF 1/5/15 und Body 0.6/0.75, wait/first."""
import sys
sys.path.insert(0, "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r4/tf5_exec")
from engine import *
n = 0
for tag in ("NQ", "ES", "YM"):
    mk = Market(tag)
    def pt(d):
        pd_ = mk.prev[d]; ppc = mk.rth[mk.prev[pd_]][2] if pd_ in mk.prev else mk.rth[pd_][2]; return (mk.rth[pd_][2]-ppc)/mk.atr[d]
    for name in ("London 02-05", "Asia 18-02", "Pre 05-0930", "Open 0930-1000"):
        for tf in (1, 5, 15):
            for body in (0.6, 0.75):
                for fo in (True, False):
                    rows = [r for r in run_zone(mk, name, tf, body, max_wait=120, first_only=fo) if pt(r["day"]) < -0.3]; n += 1
                    print(fmt(f"{tag} {name} pt<-0.3 tf{tf} b{body} {'first' if fo else 'wait'}", rows), flush=True)
                    rows2 = [r for r in rows if r["dir"] == "long"]
                    print(fmt(f"{tag} {name} pt<-0.3 tf{tf} b{body} {'first' if fo else 'wait'} LONG only", rows2), flush=True); n += 1
print("VARIANTS", n)
