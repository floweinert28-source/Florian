"""Trade-Scan ueber alle Session-Paare (A in S1 gesweept -> TP = B, Zeit-Exit S2-Ende).

Typen:
  cont: B liegt in Sweep-Richtung jenseits von A (Continuation).
        Entry 'close': erster Bar (ab Sweep-Bar, binnen CONFIRM min) mit Close jenseits A -> Entry am Close.
        Entry 'retest': nach Breakout-Close Limit bei A; Fill nur durch SPAETEREN Bar (Touch=Fill),
                        Cancel wenn vorher B getroffen oder CONFIRM min verstrichen.
        SL 'swing': Extrem der letzten 10 Bars bis Entry-Bar +/- Puffer (0.1 x A-Range-Breite)
        SL 'mid':   Mitte der A-Session-Range;  SL 'other': andere Seite der A-Range
        SL 'frac':  Entry -/+ 0.5 x A-Range-Breite
  rev:  B liegt gegen die Sweep-Richtung (Reversal).
        Entry 'close': erster Bar (ab Sweep-Bar, binnen CONFIRM) mit Close zurueck diesseits A (Reclaim).
        SL: Sweep-Extrem bis Entry +/- Puffer (0.1 x A-Range-Breite)  ('swing' Label)
Konservativ: Entry-Bar nur SL; danach SL vor TP im selben Bar. Sweep-Bar trifft beide A-Seiten -> Skip.
Kosten pro Roundtrip abgezogen. Zeit-Exit am Close des letzten Bars vor S2-Ende.

Aufruf: python3 scan_trades.py INSTR cont|rev close|retest swing|mid|other|frac CONFIRM_MIN out_csv [min_train]
"""

import csv
import sys
from bisect import bisect_left

sys.path.insert(0, "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/session_interactions")
from sessions import (SESS, COST_PTS, USD_PER_PT, build_tdays, levels_for_day,  # noqa: E402
                      next_touch, is_train)

SWEEP_SESS = ["LON", "PRE", "OPEN", "AM", "LUNCH", "PM", "RTH"]
LEVEL_SESS = ["PDRTH", "ASIA", "LON", "PRE", "ON", "OPEN", "OPEN15", "AM", "LUNCH"]
S2_ENDS = [300, 570, 600, 720, 960]
BUF_FRAC = 0.1
SWING_BARS = 10


def prepare(tdays):
    prepared = []
    for day in sorted(tdays):
        t, o, c, l, h = tdays[day]
        lv = levels_for_day(t, l, h)
        nt = {}
        for name in LEVEL_SESS:
            if name not in lv:
                continue
            H, L, _ = lv[name]
            nt[(name, "H")] = next_touch(h, H, True)
            nt[(name, "L")] = next_touch(l, L, False)
        times = set(S2_ENDS) | {SESS[s][0] for s in SWEEP_SESS} | {SESS[s][1] for s in SWEEP_SESS}
        idx = {tt: bisect_left(t, tt) for tt in times}
        prepared.append((day, t, o, c, l, h, lv, nt, idx))
    return prepared


def simulate_day(dayrec, ttype, entry_mode, sl_mode, confirm, a_sess, a_side, b_sess, b_side,
                 s1, s2_end):
    """Liefert Trade-Dict oder None."""
    day, t, o, c, l, h, lv, nt, idx = dayrec
    if a_sess not in lv or b_sess not in lv:
        return None
    s1_start, s1_end = SESS[s1]
    i_s1, i_e1, i_e2 = idx[s1_start], idx[s1_end], idx[s2_end]
    ntA = nt[(a_sess, a_side)]
    sw = ntA[i_s1]
    if sw >= i_e1:
        return None
    AH0, AL0, _ = lv[a_sess]
    A0 = AH0 if a_side == "H" else AL0
    # Echter Sweep = Kreuzung: Vor-Bar schliesst diesseits von A, Sweep-Bar nicht erster S1-Bar
    if sw <= i_s1 or sw == 0:
        return None
    if (a_side == "H" and c[sw - 1] >= A0) or (a_side == "L" and c[sw - 1] <= A0):
        return None
    other = nt[(a_sess, "L" if a_side == "H" else "H")]
    if other[sw] == sw:
        return None
    ntB = nt[(b_sess, b_side)]
    if ntB[sw] == sw:
        return None
    AH, AL, _ = lv[a_sess]
    A = AH if a_side == "H" else AL
    B = lv[b_sess][0] if b_side == "H" else lv[b_sess][1]
    width = AH - AL
    if width <= 0:
        return None
    buf = BUF_FRAC * width
    n = len(t)
    t_sw = t[sw]
    # Richtung
    if ttype == "cont":
        direction = "long" if a_side == "H" else "short"
        if (direction == "long" and B <= A) or (direction == "short" and B >= A):
            return None
    else:
        direction = "short" if a_side == "H" else "long"
        if (direction == "long" and B <= A) or (direction == "short" and B >= A):
            return None

    # Entry finden
    entry_idx = None
    entry = None
    extreme = h[sw] if a_side == "H" else l[sw]
    j = sw
    last = min(i_e2 - 1, n - 1)
    while j <= last and t[j] - t_sw <= confirm:
        if a_side == "H":
            extreme = max(extreme, h[j])
        else:
            extreme = min(extreme, l[j])
        if ttype == "cont":
            ok = c[j] > A if direction == "long" else c[j] < A
        else:
            ok = c[j] < A if direction == "short" else c[j] > A
        if ok:
            entry_idx, entry = j, c[j]
            break
        j += 1
    if entry_idx is None:
        return None
    if ttype == "cont" and entry_mode == "retest":
        # Limit bei A, Fill durch spaeteren Bar; Cancel wenn B vorher getroffen oder Zeit um
        k = entry_idx + 1
        filled = None
        while k <= last and t[k] - t_sw <= confirm:
            if direction == "long":
                if h[k] >= B:
                    return None
                if l[k] <= A:
                    filled = k; break
            else:
                if l[k] <= B:
                    return None
                if h[k] >= A:
                    filled = k; break
            k += 1
        if filled is None:
            return None
        entry_idx, entry = filled, A
    if entry_idx >= last:
        return None

    # SL
    if ttype == "rev":
        sl = extreme + buf if direction == "short" else extreme - buf
    elif sl_mode == "swing":
        k0 = max(0, entry_idx - SWING_BARS + 1)
        sl = (min(l[k0:entry_idx + 1]) - buf) if direction == "long" else (max(h[k0:entry_idx + 1]) + buf)
    elif sl_mode == "mid":
        sl = (AH + AL) / 2
    elif sl_mode == "other":
        sl = AL - buf if direction == "long" else AH + buf
    elif sl_mode == "frac":
        sl = entry - 0.5 * width if direction == "long" else entry + 0.5 * width
    else:
        raise ValueError(sl_mode)
    tp = B
    if direction == "long":
        sl_dist, tp_dist = entry - sl, tp - entry
    else:
        sl_dist, tp_dist = sl - entry, entry - tp
    if sl_dist <= 0 or tp_dist <= 0:
        return None

    # Auswertung: Entry-Bar nur SL
    res = None
    j = entry_idx
    if entry_mode == "close" or ttype == "rev":
        if (direction == "long" and l[j] <= sl) or (direction == "short" and h[j] >= sl):
            res = "SL"
    else:
        # Limit-Fill-Bar: Bar hat A gehandelt; SL konservativ werten, TP nicht
        if (direction == "long" and l[j] <= sl) or (direction == "short" and h[j] >= sl):
            res = "SL"
    j += 1
    while res is None and j <= last:
        if direction == "long":
            if l[j] <= sl:
                res = "SL"; break
            if h[j] >= tp:
                res = "TP"; break
        else:
            if h[j] >= sl:
                res = "SL"; break
            if l[j] <= tp:
                res = "TP"; break
        j += 1
    if res == "TP":
        pts = tp_dist
    elif res == "SL":
        pts = -sl_dist
    else:
        res = "TIME"
        pts = (c[last] - entry) if direction == "long" else (entry - c[last])
    return {"day": day, "dir": direction, "entry_t": t[entry_idx], "entry": entry, "sl": sl, "tp": tp,
            "result": res, "pts": pts, "rr": tp_dist / sl_dist}


def summarize_combo(trades, instr):
    cost = COST_PTS[instr]
    upp = USD_PER_PT[instr]
    tr = [x for x in trades if is_train(x["day"])]
    te = [x for x in trades if not is_train(x["day"])]
    def agg(ts):
        n = len(ts)
        if n == 0:
            return 0, 0.0, 0.0, 0.0
        net = sum((x["pts"] - cost) * upp for x in ts)
        wins = sum(1 for x in ts if x["result"] == "TP")
        dec = sum(1 for x in ts if x["result"] in ("TP", "SL"))
        wr = wins / dec * 100 if dec else 0.0
        rr = sum(x["rr"] for x in ts) / n
        return n, net, wr, rr
    ntr, net_tr, wr_tr, rr_tr = agg(tr)
    nte, net_te, wr_te, rr_te = agg(te)
    years = {}
    for x in trades:
        years[x["day"].year] = years.get(x["day"].year, 0.0) + (x["pts"] - cost) * upp
    pos = sum(1 for v in years.values() if v > 0)
    # t-Statistik des mittleren Trade-PnL (Train)
    tstat = 0.0
    if ntr > 1:
        p = [(x["pts"] - cost) * upp for x in tr]
        mu = sum(p) / ntr
        var = sum((v - mu) ** 2 for v in p) / (ntr - 1)
        tstat = mu / (var ** 0.5 / ntr ** 0.5) if var > 0 else 0.0
    mdd = 0.0
    if trades:
        from sessions import max_drawdown
        mdd = max_drawdown([{"day": x["day"], "entry_t": x["entry_t"], "pnl": (x["pts"] - cost) * upp} for x in trades])
    return {"n_train": ntr, "net_train": round(net_tr), "wr_train": round(wr_tr, 1), "rr_train": round(rr_tr, 2),
            "net_per_trade_train": round(net_tr / ntr) if ntr else 0, "t_train": round(tstat, 2),
            "n_test": nte, "net_test": round(net_te), "wr_test": round(wr_te, 1), "rr_test": round(rr_te, 2),
            "pos_years": f"{pos}/{len(years)}", "mdd": round(mdd),
            "per_year": " ".join(f"{y}:{v:+.0f}" for y, v in sorted(years.items()))}


def main():
    instr, ttype, entry_mode, sl_mode = sys.argv[1:5]
    confirm = int(sys.argv[5])
    out_csv = sys.argv[6]
    min_train = int(sys.argv[7]) if len(sys.argv) > 7 else 150
    tdays = build_tdays(instr)
    prepared = prepare(tdays)
    rows = []
    for s1 in SWEEP_SESS:
        s1_start, s1_end = SESS[s1]
        lvl_ok = [nm for nm in LEVEL_SESS if SESS[nm][1] <= s1_start]
        for a_sess in lvl_ok:
            for a_side in ("H", "L"):
                for b_sess in lvl_ok:
                    for b_side in ("H", "L"):
                        if (a_sess, a_side) == (b_sess, b_side):
                            continue
                        if ttype == "cont" and a_side != b_side:
                            continue
                        if ttype == "rev" and a_side == b_side:
                            continue
                        for s2_end in sorted({x for x in S2_ENDS if x >= s1_end}):
                            trades = []
                            for rec in prepared:
                                tr = simulate_day(rec, ttype, entry_mode, sl_mode, confirm,
                                                  a_sess, a_side, b_sess, b_side, s1, s2_end)
                                if tr is not None:
                                    trades.append(tr)
                            s = summarize_combo(trades, instr)
                            if s["n_train"] < min_train:
                                continue
                            s.update({"A": f"{a_sess}.{a_side}", "S1": s1, "B": f"{b_sess}.{b_side}",
                                      "S2end": f"{s2_end//60:02d}:{s2_end%60:02d}",
                                      "type": ttype, "entry": entry_mode, "sl": sl_mode, "confirm": confirm})
                            rows.append(s)
    rows.sort(key=lambda r: -r["net_per_trade_train"])
    cols = ["A", "S1", "B", "S2end", "type", "entry", "sl", "confirm", "n_train", "net_train", "wr_train",
            "rr_train", "net_per_trade_train", "t_train", "n_test", "net_test", "wr_test", "rr_test",
            "pos_years", "mdd", "per_year"]
    with open(out_csv, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        w.writerows(rows)
    print(f"{instr} {ttype} {entry_mode} {sl_mode} confirm={confirm}: {len(rows)} combos; "
          f"train-positive: {sum(1 for r in rows if r['net_train'] > 0)}; "
          f"both-positive: {sum(1 for r in rows if r['net_train'] > 0 and r['net_test'] > 0)}")
    print(f"{'A':>9} {'S1':>5} {'B':>9} {'S2':>5} {'nTr':>4} {'netTr':>7} {'WRtr':>5} {'RR':>5} {'$/tr':>5} {'t':>5} {'nTe':>4} {'netTe':>7} {'WRte':>5} {'J+':>4} {'MDD':>7}  per_year")
    for r in rows[:25]:
        print(f"{r['A']:>9} {r['S1']:>5} {r['B']:>9} {r['S2end']:>5} {r['n_train']:>4} {r['net_train']:>7} "
              f"{r['wr_train']:>5} {r['rr_train']:>5} {r['net_per_trade_train']:>5} {r['t_train']:>5} {r['n_test']:>4} {r['net_test']:>7} "
              f"{r['wr_test']:>5} {r['pos_years']:>4} {r['mdd']:>7}  {r['per_year']}")


if __name__ == "__main__":
    main()
