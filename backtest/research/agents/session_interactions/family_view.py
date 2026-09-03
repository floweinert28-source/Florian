"""Zeigt fuer feste Kombos die Ergebnisse ueber alle Varianten-Dateien und beide Instrumente."""
import csv, glob

KEYS = [
    ("OPEN.H", "AM", "ON.H", "16:00"), ("OPEN.H", "AM", "ON.H", "12:00"), ("OPEN15.H", "AM", "ON.H", "16:00"),
    ("OPEN.L", "AM", "ON.L", "16:00"), ("OPEN15.L", "AM", "ON.L", "16:00"),
    ("OPEN.L", "AM", "PDRTH.L", "16:00"), ("OPEN15.L", "AM", "PDRTH.L", "16:00"),
    ("OPEN.H", "AM", "PDRTH.H", "16:00"), ("OPEN15.H", "AM", "PDRTH.H", "16:00"),
    ("PRE.L", "RTH", "PDRTH.L", "16:00"), ("PRE.H", "RTH", "PDRTH.H", "16:00"),
    ("LON.L", "RTH", "PDRTH.L", "16:00"), ("LON.H", "RTH", "PDRTH.H", "16:00"),
    ("ASIA.L", "LON", "PDRTH.L", "16:00"), ("ASIA.H", "LON", "PDRTH.H", "16:00"),
    ("LON.L", "PRE", "LON.H", "16:00"), ("LON.H", "PRE", "LON.L", "16:00"),
    ("LON.L", "PRE", "PDRTH.H", "16:00"), ("LON.H", "PRE", "PDRTH.L", "16:00"),
    ("LON.L", "PRE", "ASIA.H", "16:00"), ("LON.H", "PRE", "ASIA.L", "16:00"),
]
rows = []
for fn in sorted(glob.glob("tr_*.csv")):
    for r in csv.DictReader(open(fn)):
        r["file"] = fn.replace("tr_", "").replace(".csv", "")
        rows.append(r)
for k in KEYS:
    print(f"\n### {k[0]} in {k[1]} -> {k[2]} bis {k[3]}")
    sel = [r for r in rows if (r["A"], r["S1"], r["B"], r["S2end"]) == k]
    sel.sort(key=lambda r: r["file"])
    for r in sel:
        print(f"  {r['file']:>28} nTr {r['n_train']:>4} netTr {r['net_train']:>7} WR {r['wr_train']:>5} RR {r['rr_train']:>5} t {r['t_train']:>5} | "
              f"nTe {r['n_test']:>4} netTe {r['net_test']:>7} WR {r['wr_test']:>5} | J+ {r['pos_years']} MDD {r['mdd']:>7} | {r['per_year']}")
