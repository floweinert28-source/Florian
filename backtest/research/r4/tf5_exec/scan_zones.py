"""Grid: alle Session-Zonen x Signal-TF (1/5/15) x Body-Schwelle x multi (Re-Sweeps erlaubt) x max_wait. Ein Instrument."""
import sys, time
sys.path.insert(0, "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r4/tf5_exec")
from engine import *
mk = Market(sys.argv[1]); n = 0; t0 = time.time()
for name in ZONES:
    for tf in (1, 5, 15):
        for multi in (False, True):
            for body in (0.0, 0.6, 0.75):
                for wait in (60, 180):
                    rows = run_zone(mk, name, tf, body, max_wait=wait, multi=multi); n += 1
                    print(fmt(f"{mk.tag} {name} tf{tf} b{body} w{wait} {'multi' if multi else 'single'}", rows), flush=True)
print(f"VARIANTS {n} time {time.time()-t0:.0f}s")
