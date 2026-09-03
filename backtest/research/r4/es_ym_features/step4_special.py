"""Schritt 4: (A) Runde-Level-Sweep+Reclaim (YM 100/50, ES 25/10) als eigenes Basis-Setup, mehrere Trades/Tag, nicht ueberlappend.
(B) ES/YM Cash-Open-Gap-Fade / Gap-and-Go bei 1:1. (C) Drei-Wege-Cross-Asset-Status (NQ & drittes Instrument) je Zone."""
import sys, time, pickle
from bisect import bisect_left, bisect_right
sys.path.insert(0, "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r4/es_ym_features")
import fw
TAG = sys.argv[1]; OTHER = "YM" if TAG == "ES" else "ES"
I = fw.Inst(TAG); NQ = fw.Inst("NQ"); O = fw.Inst(OTHER); variants = 0

def level_trades(I, step, start=fw.RTH_S, end=fw.RTH_E, buf_atr=0.05, max_wait=60, min_depth_atr=0.0, fresh=30):
    """Sweep eines runden Levels (Vielfaches von step) mit Reclaim-Close binnen max_wait. Level = naechstes Vielfaches unter/ueber
    dem Vor-Close. fresh: Level darf in den letzten 'fresh' Bars nicht beruehrt worden sein. Kein Look-Ahead; kein Overlap."""
    rows = []
    for d in I.dates:
        if not I.tradable(d): continue
        mods, o, c, lo, hi, v = I.days[d]; m = len(mods); A = I.atr[d]; k = bisect_left(mods, start); busy_until = -1
        while k < m and mods[k] < end:
            if hi[k] <= lo[k] or k == 0 or k <= busy_until: k += 1; continue
            pc = c[k-1]; Lb = (pc // step) * step; La = Lb + step; cand = None
            if lo[k] <= Lb < pc: cand = ("long", Lb)
            elif hi[k] >= La > pc: cand = ("short", La)
            if cand is None: k += 1; continue
            dirn, L = cand
            # fresh: Level in den letzten 'fresh' Bars nicht beruehrt
            touched = any((lo[q] <= L <= hi[q]) for q in range(max(0, k-fresh), k))
            if touched: k += 1; continue
            ext = lo[k] if dirn == "long" else hi[k]; ei = None; q = k
            while q < m and mods[q] - mods[k] <= max_wait and mods[q] < end:
                ext = min(ext, lo[q]) if dirn == "long" else max(ext, hi[q])
                if hi[q] > lo[q] and ((dirn == "long" and c[q] > L) or (dirn == "short" and c[q] < L)): ei = q; break
                q += 1
            if ei is None: k = q + 1; continue
            depth = (L - ext) if dirn == "long" else (ext - L)
            if depth < min_depth_atr * A: k = ei + 1; continue
            entry = c[ei]; sl = ext - buf_atr*A if dirn == "long" else ext + buf_atr*A; sld = abs(entry - sl)
            tp = entry + sld if dirn == "long" else entry - sld; res = None; tag = None
            if (dirn == "long" and lo[ei] <= sl) or (dirn == "short" and hi[ei] >= sl): res = -sld; tag = "SL"; kk = ei
            else:
                kk = ei + 1
                while kk < m and mods[kk] < end:
                    if dirn == "long":
                        if lo[kk] <= sl: res = -sld; tag = "SL"; break
                        if hi[kk] >= tp: res = sld; tag = "TP"; break
                    else:
                        if hi[kk] >= sl: res = -sld; tag = "SL"; break
                        if lo[kk] <= tp: res = sld; tag = "TP"; break
                    kk += 1
                if res is None: kk = min(kk, m-1); res = (c[kk]-entry) if dirn == "long" else (entry-c[kk]); tag = "EOD"
            rows.append(dict(day=d, win=res > 0, usd=(res-I.cost)*I.usd, dirn=dirn, tag=tag, entry_t=mods[ei], entry=entry, sl=sl, tp=tp,
                             depth_atr=depth/A, sld_atr=sld/A, dur=float(mods[ei]-mods[k]), hour=mods[ei]/60,
                             body=abs(c[ei]-o[ei])/(hi[ei]-lo[ei]), level=L))
            busy_until = kk; k = kk + 1
    return rows

def report(name, rows):
    global variants; variants += 1; tr, te = fw.split(rows)
    print(f"  {name:48s} Train {fw.stats(tr)} | Test {fw.stats(te)} | {len(rows)/fw.weeks(rows) if rows else 0:.1f}/Wo", flush=True)
    return rows

print(f"##### (A) {TAG} Runde-Level-Sweep+Reclaim (1:1) #####")
steps = (100.0, 50.0, 25.0) if TAG == "YM" else (25.0, 10.0, 5.0)
best = None
for step in steps:
    for start, end, lab in ((fw.RTH_S, fw.RTH_E, "RTH"), (240, fw.RTH_S, "Pre 04-09:30"), (fw.RTH_S, 690, "09:30-11:30")):
        rows = report(f"step {step:g} {lab} buf.05A wait60 fresh30", level_trades(I, step, start, end))
        if best is None or (rows and fw.wr(fw.split(rows)[0]) > fw.wr(fw.split(best)[0])): best = rows
    report(f"step {step:g} RTH buf.1A wait30 fresh60", level_trades(I, step, buf_atr=0.1, max_wait=30, fresh=60))
    report(f"step {step:g} RTH buf.05A wait60 fresh30 depth>=0.05A", level_trades(I, step, min_depth_atr=0.05))
    report(f"step {step:g} RTH buf.02A wait60 fresh120", level_trades(I, step, buf_atr=0.02, fresh=120))
rows = level_trades(I, steps[0])
if rows:
    for f in ("depth_atr", "sld_atr", "dur", "hour", "body"):
        tr, te = fw.split(rows); vals = sorted(r[f] for r in tr); qs = [vals[int(len(vals)*q)] for q in (0.25, 0.5, 0.75)]
        parts = []
        for lo_, hi_ in ((-1e9, qs[0]), (qs[0], qs[1]), (qs[1], qs[2]), (qs[2], 1e9)):
            g = [r for r in tr if lo_ <= r[f] < hi_]; gt = [r for r in te if lo_ <= r[f] < hi_]; variants += 1
            parts.append(f"{fw.wr(g):4.0f}/{fw.wr(gt):4.0f}({len(g)})")
        print(f"    {f:10s} " + " | ".join(parts))
    for dn in ("long", "short"): report(f"  step {steps[0]:g} RTH dir={dn}", [r for r in rows if r["dirn"] == dn])
    fw.write_csv(rows, f"levels_{TAG}_step{steps[0]:g}.csv")

print(f"\n##### (B) {TAG} Cash-Open-Gap (1:1) #####")
def gap_trades(I, gmin, gmax, mode="fade", sl_mult=1.0, wait_bars=1):
    rows = []
    for d in I.dates:
        if not I.tradable(d): continue
        mods, o, c, lo, hi, v = I.days[d]; m = len(mods); A = I.atr[d]; pdc = I.rth[I.prev[d]][2]; op = I.rth[d][3]
        gap = (op - pdc) / A
        if not (gmin <= abs(gap) < gmax): continue
        i0 = bisect_left(mods, fw.RTH_S); ei = None; cnt = 0
        for k in range(i0, m):
            if hi[k] > lo[k]: cnt += 1
            if cnt >= wait_bars: ei = k; break
        if ei is None or mods[ei] >= fw.RTH_S + 15: continue
        dirn = ("short" if gap > 0 else "long") if mode == "fade" else ("long" if gap > 0 else "short")
        entry = c[ei]; sld = abs(gap) * A * sl_mult
        sl = entry - sld if dirn == "long" else entry + sld; tp = entry + sld if dirn == "long" else entry - sld; res = None; tag = None
        if (dirn == "long" and lo[ei] <= sl) or (dirn == "short" and hi[ei] >= sl): res = -sld; tag = "SL"; kk = ei
        else:
            kk = ei + 1
            while kk < m and mods[kk] < fw.RTH_E:
                if dirn == "long":
                    if lo[kk] <= sl: res = -sld; tag = "SL"; break
                    if hi[kk] >= tp: res = sld; tag = "TP"; break
                else:
                    if hi[kk] >= sl: res = -sld; tag = "SL"; break
                    if lo[kk] <= tp: res = sld; tag = "TP"; break
                kk += 1
            if res is None: kk = min(kk, m-1); res = (c[kk]-entry) if dirn == "long" else (entry-c[kk]); tag = "EOD"
        rows.append(dict(day=d, win=res > 0, usd=(res-I.cost)*I.usd, dirn=dirn, tag=tag, entry_t=mods[ei], entry=entry, sl=sl, tp=tp))
    return rows
for mode in ("fade", "go"):
    for gmin, gmax in ((0.1, 0.3), (0.3, 0.6), (0.6, 9), (0.1, 9)):
        for slm in (0.5, 1.0):
            for wb in (1, 5):
                report(f"gap-{mode} |gap| in [{gmin},{gmax})A SL={slm}xgap nach {wb} Bar", gap_trades(I, gmin, gmax, mode, slm, wb))

print(f"\n##### (C) {TAG} Drei-Wege-Cross-Asset je Zone (Status NQ & {OTHER} zur Entry-Minute) #####")
allrows = pickle.load(open(f"rows_{TAG}.pkl", "rb"))
for kind, rows in allrows.items():
    if not rows: continue
    for r in rows:
        st = fw.nq_status(O, r["day"], kind, r["dirn"], r["entry_t"] - 1, r["entry_t"])  # sweep_min unbekannt -> nur swept/back nutzen
        r["o_swept"] = st["nq_swept"]; r["o_back"] = st["nq_back"]
    tr, te = fw.split(rows)
    print(f"  {kind:10s} basis {fw.wr(tr):5.1f}/{fw.wr(te):5.1f} ({len(tr)}/{len(te)})")
    for lab, sel in (("beide gesweept", lambda r: r["nq_swept"] == 1 and r["o_swept"] == 1), ("keiner gesweept (nur eigenes)", lambda r: r["nq_swept"] == 0 and r["o_swept"] == 0),
                     ("beide gesweept+zurueck", lambda r: r["nq_back"] == 1 and r["o_back"] == 1), ("beide gesweept, beide noch draussen", lambda r: r["nq_back"] == 0 and r["o_back"] == 0),
                     ("NQ gesweept, andere nicht", lambda r: r["nq_swept"] == 1 and r["o_swept"] == 0), ("andere gesweept, NQ nicht", lambda r: r["nq_swept"] == 0 and r["o_swept"] == 1)):
        g = [r for r in tr if sel(r)]; gt = [r for r in te if sel(r)]; variants += 1
        print(f"      {lab:38s} {fw.wr(g):5.1f}/{fw.wr(gt):5.1f} ({len(g)}/{len(gt)})")
print("Varianten:", variants)
