import csv, glob, sys
files = sorted(glob.glob("tr_*.csv"))
hdr = f"{'A':>9} {'S1':>5} {'B':>9} {'S2':>5} {'nTr':>4} {'netTr':>7} {'WRtr':>5} {'RR':>5} {'$/tr':>5} {'t':>5} {'nTe':>4} {'netTe':>7} {'WRte':>5} {'J+':>4} {'MDD':>7}  per_year"
allrows = []
for fn in files:
    rows = list(csv.DictReader(open(fn)))
    for r in rows:
        r["file"] = fn
    allrows += rows
    both = [r for r in rows if float(r["net_train"]) > 0 and float(r["net_test"]) > 0]
    both.sort(key=lambda r: -float(r["t_train"]))
    print(f"\n=== {fn}: {len(rows)} combos, both-positive {len(both)}")
    print(hdr)
    for r in both[:12]:
        print(f"{r['A']:>9} {r['S1']:>5} {r['B']:>9} {r['S2end']:>5} {r['n_train']:>4} {r['net_train']:>7} "
              f"{r['wr_train']:>5} {r['rr_train']:>5} {r['net_per_trade_train']:>5} {r['t_train']:>5} {r['n_test']:>4} {r['net_test']:>7} "
              f"{r['wr_test']:>5} {r['pos_years']:>4} {r['mdd']:>7}  {r['per_year']}")
