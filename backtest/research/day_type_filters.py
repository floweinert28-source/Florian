"""Tagestyp-Filter fuer das 64%-Muster (Range 08:12-09:12, beide Seiten bis Tagesende gebrochen).
Frage: Welche VORAB bekannten Merkmale trennen Range-Tage (beide Seiten) von Trend-Tagen (nur eine Seite)?
Alle Merkmale sind zum Zeitpunkt 09:12 NY bekannt (kein Look-Ahead). Bewertung auf TRAIN, Pruefung auf TEST.
Zusaetzlich: Merkmale nach dem ersten Sweep (Richtung, Uhrzeit, Tiefe) -> bedingte Quote, dass die andere Seite noch kommt.
"""
import sys, datetime as dt
from bisect import bisect_left
from collections import defaultdict
sys.path.insert(0, "/home/user/Florian/backtest")
from sweep_reclaim_backtest import load_days

DATA = sys.argv[1] if len(sys.argv) > 1 else "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/data"
days = load_days(DATA)
dates = sorted(days)
RS, RE = 8*60+12, 9*60+12

def rng(d, a_min, b_min):
    mods, o, c, lo, hi = days[d]
    a = bisect_left(mods, a_min); b = bisect_left(mods, b_min)
    if b - a < (b_min - a_min) * 0.6: return None
    return max(hi[a:b]), min(lo[a:b]), a, b

rows = []
prev_rth = None; rth_hist = []
for idx, d in enumerate(dates):
    if d.weekday() >= 5: continue
    mods, o, c, lo, hi = days[d]
    r = rng(d, RS, RE)
    if r is None: continue
    rh, rl, a, b = r; W = rh - rl
    if W <= 0: continue
    # Vorab-Merkmale
    on = rng(d, 0, RS)  # 00:00-08:12 (Overnight ab Mitternacht)
    prev = dates[idx-1] if idx > 0 else None
    pd_ = rng(prev, 570, 960) if prev and prev.weekday() < 5 else None
    atr = sum(rth_hist[-10:]) / len(rth_hist[-10:]) if len(rth_hist) >= 5 else None
    # Ergebnis
    m = len(mods); j = b; hb = lb = False; first = None; first_t = None; first_depth = 0.0
    while j < m:
        if hi[j] >= rh and not hb:
            hb = True
            if first is None: first, first_t = "high", mods[j]
        if lo[j] <= rl and not lb:
            lb = True
            if first is None: first, first_t = "low", mods[j]
        if hb and lb: break
        j += 1
    both = hb and lb
    # Sweep-Tiefe binnen 30 min nach erstem Bruch
    if first is not None:
        k = bisect_left(mods, first_t); kk = k
        ext = hi[k] if first == "high" else lo[k]
        while kk < m and mods[kk] - first_t <= 30:
            ext = max(ext, hi[kk]) if first == "high" else min(ext, lo[kk]); kk += 1
        first_depth = ((ext - rh) if first == "high" else (rl - ext)) / W
    feat = {"day": d, "both": both, "first": first or "none", "first_t": first_t or 0, "first_depth": first_depth,
            "W_atr": (W / atr) if atr else None,
            "on_W": ((on[0]-on[1]) / W) if on else None,
            "pd_pos": ((c[b-1] - pd_[1]) / (pd_[0]-pd_[1])) if pd_ and pd_[0] > pd_[1] else None,
            "gap_pdc": None, "wd": d.weekday(), "range_pos_on": None}
    if on:
        onh, onl, _, _ = on
        feat["range_pos_on"] = ((rh + rl)/2 - onl) / (onh - onl) if onh > onl else None
        feat["on_broken_pre"] = None
    if pd_:
        pdh, pdl, _, _ = pd_
        feat["above_pdh"] = rh > pdh; feat["below_pdl"] = rl < pdl
    rows.append(feat)
    rr = rng(d, 570, 960)
    if rr: rth_hist.append(rr[0] - rr[1])

train = [r for r in rows if r["day"] < dt.date(2025,1,1)]; test = [r for r in rows if r["day"] >= dt.date(2025,1,1)]
def q(rs): return (sum(1 for r in rs if r["both"]) / len(rs) * 100) if rs else float('nan')
print(f"Basis: Train {q(train):.1f}% ({len(train)}) | Test {q(test):.1f}% ({len(test)})\n")

def bucket_report(name, key, edges):
    print(f"--- {name} ---")
    for lo_, hi_ in edges:
        tr = [r for r in train if r[key] is not None and lo_ <= r[key] < hi_]
        te = [r for r in test if r[key] is not None and lo_ <= r[key] < hi_]
        print(f"  {lo_:>5}..{hi_:<5}: Train {q(tr):5.1f}% ({len(tr):4d}) | Test {q(te):5.1f}% ({len(te):3d})")

bucket_report("Range-Breite / ATR10", "W_atr", [(0,0.1),(0.1,0.15),(0.15,0.2),(0.2,0.3),(0.3,9)])
bucket_report("Overnight-Range / Zonen-Range", "on_W", [(0,2),(2,3),(3,4),(4,6),(6,99)])
bucket_report("Position Close 09:11 in Vortages-RTH-Range", "pd_pos", [(-9,0),(0,0.25),(0.25,0.5),(0.5,0.75),(0.75,1),(1,9)])
bucket_report("Position Zonen-Mitte in Overnight-Range", "range_pos_on", [(-9,0),(0,0.25),(0.25,0.5),(0.5,0.75),(0.75,1),(1,9)])
print("--- Wochentag ---")
for wd, nm in enumerate(["Mo","Di","Mi","Do","Fr"]):
    tr = [r for r in train if r["wd"] == wd]; te = [r for r in test if r["wd"] == wd]
    print(f"  {nm}: Train {q(tr):.1f}% ({len(tr)}) | Test {q(te):.1f}% ({len(te)})")
print("--- Zone ueber PDH / unter PDL ---")
for key in ("above_pdh", "below_pdl"):
    for val in (True, False):
        tr = [r for r in train if r.get(key) is val]; te = [r for r in test if r.get(key) is val]
        print(f"  {key}={val}: Train {q(tr):.1f}% ({len(tr)}) | Test {q(te):.1f}% ({len(te)})")

print("\n=== Nach dem ersten Bruch: Quote, dass die andere Seite noch kommt ===")
def q2(rs): 
    rs = [r for r in rs if r["first"] != "none"]
    return (sum(1 for r in rs if r["both"]) / len(rs) * 100) if rs else float('nan'), len(rs)
print("--- Uhrzeit des ersten Bruchs ---")
for lo_, hi_ in [(552,570),(570,600),(600,660),(660,780),(780,960),(960,1440)]:
    tr = [r for r in train if lo_ <= r["first_t"] < hi_]; te = [r for r in test if lo_ <= r["first_t"] < hi_]
    a, n1 = q2(tr); bq, n2 = q2(te)
    print(f"  {lo_//60:02d}:{lo_%60:02d}-{hi_//60:02d}:{hi_%60:02d}: Train {a:5.1f}% ({n1:4d}) | Test {bq:5.1f}% ({n2:3d})")
print("--- Sweep-Tiefe in 30 min (Range-Breiten) ---")
for lo_, hi_ in [(0,0.1),(0.1,0.25),(0.25,0.5),(0.5,1),(1,2),(2,99)]:
    tr = [r for r in train if r["first"] != "none" and lo_ <= r["first_depth"] < hi_]
    te = [r for r in test if r["first"] != "none" and lo_ <= r["first_depth"] < hi_]
    a, n1 = q2(tr); bq, n2 = q2(te)
    print(f"  {lo_:>4}..{hi_:<4}: Train {a:5.1f}% ({n1:4d}) | Test {bq:5.1f}% ({n2:3d})")
print("--- Erste Richtung ---")
for f in ("high", "low"):
    tr = [r for r in train if r["first"] == f]; te = [r for r in test if r["first"] == f]
    a, n1 = q2(tr); bq, n2 = q2(te)
    print(f"  {f}: Train {a:.1f}% ({n1}) | Test {bq:.1f}% ({n2})")
