"""Direkte Regelpruefung einzelner Baum-Blaetter / Hypothesen: WR TRAIN(<2024), VAL(2024), TEST, jeweils alle Events + nicht-ueberlappend."""
import datetime as dt
from fm_lib import *
rows, feats = load("NQ")
def seg(rs):
    a = [r for r in rs if r["day"] < dt.date(2024,1,1)]; b = [r for r in rs if dt.date(2024,1,1) <= r["day"] < TEST0]; c = [r for r in rs if r["day"] >= TEST0]
    return a, b, c
def show(name, cond):
    sel = [r for r in rows if cond(r)]
    parts = []
    for lab, g in zip(("fit<24", "val24", "TEST"), seg(sel)):
        n = nonoverlap(g); parts.append(f"{lab} N={len(g):5d} WR={wr(g):5.1f} NO N={len(n):4d} WR={wr(n):5.1f} net={netto(n):+7.0f}")
    print(f"{name:55s} | " + " | ".join(parts), flush=True)
show("prev_body<=-1.28 & wd<=2", lambda r: r["prev_body"] <= -1.28 and r["wd"] <= 2)
show("prev_body<=-1.28", lambda r: r["prev_body"] <= -1.28)
show("prev_body<=-1.28 & wd<=2 & sld_atr>=0.1", lambda r: r["prev_body"] <= -1.28 and r["wd"] <= 2 and r["sld_atr"] >= 0.1)
show("prev_body<=-1.0 & wd<=2", lambda r: r["prev_body"] <= -1.0 and r["wd"] <= 2)
show("prev_body<=-1.28 & wd<=2 & long", lambda r: r["prev_body"] <= -1.28 and r["wd"] <= 2 and r["dir_long"] == 1)
show("prev_body<=-1.28 & wd<=2 & short", lambda r: r["prev_body"] <= -1.28 and r["wd"] <= 2 and r["dir_long"] == 0)
show("prev_body<=-1.28 & wd<=2 & is_rth", lambda r: r["prev_body"] <= -1.28 and r["wd"] <= 2 and r["is_rth"] == 1)
show("prev_body<=-1.28 & wd<=2 & !is_rth", lambda r: r["prev_body"] <= -1.28 and r["wd"] <= 2 and r["is_rth"] == 0)
show("prev_body>=+1.28 & wd<=2", lambda r: r["prev_body"] >= 1.28 and r["wd"] <= 2)
show("reclaim_body>=0.75", lambda r: r["reclaim_body"] >= 0.75)
show("reclaim_body>=0.75 & lt_LONDON & 05-09:30", lambda r: r["reclaim_body"] >= 0.75 and r["lt_LONDON"] and 5 <= r["hour"] < 9.5)
show("reclaim_body>=0.75 & prev_trend<-0.3 & lt_LONDON", lambda r: r["reclaim_body"] >= 0.75 and r["prev_trend"] < -0.3 and r["lt_LONDON"])
show("gap<=-1.254", lambda r: r["gap_atr"] <= -1.254)
show("dist_vwap>0.057 & sess_pos>0.76", lambda r: r["dist_vwap"] > 0.057 and r["sess_pos"] > 0.76)
show("sld_atr>=0.1", lambda r: r["sld_atr"] >= 0.1)
show("sld_atr>=0.1 & non-H1", lambda r: r["sld_atr"] >= 0.1 and r["lt"] != "H1")
show("sweep_no==1 & non-H1", lambda r: r["sweep_no"] == 1 and r["lt"] != "H1")
show("n_levels>=2", lambda r: r["n_levels"] >= 2)
show("n_levels>=3", lambda r: r["n_levels"] >= 3)
