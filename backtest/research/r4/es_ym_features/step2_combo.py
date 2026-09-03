"""Schritt 2: Feature-Selektionen (Quartile/Haelften/Binaer) einzeln und paarweise auf TRAIN ranken, TEST daneben.
Zaehlt alle probierten Varianten. Pro Zone und gepoolt ueber alle Zonen."""
import sys, pickle, itertools
sys.path.insert(0, "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/r4/es_ym_features")
import fw
TAG = sys.argv[1]; MIN_TR = int(sys.argv[2]) if len(sys.argv) > 2 else 150
allrows = pickle.load(open(f"rows_{TAG}.pkl", "rb"))
variants = 0
def sels(tr):
    """Alle Einzel-Selektionen: Quartile, Haelften, Terzile-Extreme, Binaer-Werte."""
    out = []
    for f in fw.feat_names(tr):
        vals = sorted(r[f] for r in tr); n = len(vals)
        uv = sorted(set(vals))
        if len(uv) <= 4:
            for u in uv: out.append((f, u, u + 1e-9, f"{f}=={u:.2g}"))
            continue
        q = lambda p: vals[min(n-1, int(n*p))]
        cuts = [(-1e9, q(.25), "Q1"), (q(.25), q(.5), "Q2"), (q(.5), q(.75), "Q3"), (q(.75), 1e9, "Q4"),
                (-1e9, q(.5), "H1"), (q(.5), 1e9, "H2"), (-1e9, q(1/3), "T1"), (q(2/3), 1e9, "T3"), (q(.25), q(.75), "MID")]
        for lo_, hi_, nm in cuts: out.append((f, lo_, hi_, f"{f} {nm}[{lo_:.2f},{hi_:.2f})"))
    return out
def run(name, rows):
    global variants
    tr, te = fw.split(rows)
    if len(tr) < MIN_TR: return
    print(f"\n##### {name}: Train {fw.stats(tr)} | Test {fw.stats(te)} | {len(rows)/fw.weeks(rows):.1f}/Woche", flush=True)
    S = sels(tr); singles = []
    for f, lo_, hi_, nm in S:
        g = [r for r in tr if lo_ <= r[f] < hi_]; variants += 1
        if len(g) < MIN_TR: continue
        gt = [r for r in te if lo_ <= r[f] < hi_]
        singles.append((fw.wr(g), fw.wr(gt), len(g), len(gt), nm, (f, lo_, hi_)))
    singles.sort(key=lambda x: -x[0])
    print("  Top Einzel (Train WR / Test WR, Ntr/Nte):")
    for s in singles[:8]: print(f"    {s[0]:5.1f} / {s[1]:5.1f}  ({s[2]}/{s[3]})  {s[4]}")
    # Paare: nur aus den Top-25 Einzel-Selektionen (verschiedene Features)
    top = singles[:25]; pairs = []
    for a, b in itertools.combinations(top, 2):
        if a[5][0] == b[5][0]: continue
        (fa, la, ha), (fb, lb, hb) = a[5], b[5]; variants += 1
        g = [r for r in tr if la <= r[fa] < ha and lb <= r[fb] < hb]
        if len(g) < MIN_TR: continue
        gt = [r for r in te if la <= r[fa] < ha and lb <= r[fb] < hb]
        pairs.append((fw.wr(g), fw.wr(gt), len(g), len(gt), a[4] + " & " + b[4], (a[5], b[5])))
    pairs.sort(key=lambda x: -x[0])
    print("  Top Paare:")
    for s in pairs[:10]: print(f"    {s[0]:5.1f} / {s[1]:5.1f}  ({s[2]}/{s[3]})  {s[4]}")
    return singles, pairs
res = {}
for kind, rows in allrows.items():
    if rows: res[kind] = run(f"{TAG} {kind}", rows)
pooled = [r for rows in allrows.values() for r in rows]
res["pooled"] = run(f"{TAG} POOLED alle Zonen", pooled)
print(f"\nVarianten gezaehlt: {variants}")
pickle.dump(res, open(f"combo_{TAG}.pkl", "wb"))
