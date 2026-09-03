"""Sweep + Confirmation-Entry Backtester.

Ablauf pro Tag und Zone [start, start+dauer) NY-Zeit:
1. Range = Hoch/Tief der Zone.
2. Sweep: erster Bruch einer Range-Seite nach Zonen-Ende.
3. Confirmation-Entry (nur abgeschlossene Bars, kein Look-Ahead):
   - "mss":  Close bricht das letzte Swing-Hoch/-Tief (Fraktal k=2) der
             Sweep-Bewegung -> Entry zum Close des Bruch-Bars.
   - "ifvg": In der Sweep-Bewegung entstandenes FVG wird invertiert
             (Close jenseits der fernen Gap-Kante) -> Entry zum Close.
   - "ote":  Nach dem Sweep-Extrem eine Gegenbewegung von >= 0.5 Range-
             Breiten; dann Limit-Entry im 62%-Retrace dieser Bewegung
             (Fill nur, wenn ein SPAETERER Bar das Level handelt).
   - "close_in": Reclaim - erster Close zurueck in der Range (Basisvariante).
4. SL: Sweep-Extrem +/- Puffer (buffer_frac x Range-Breite).
5. TP: "r1"/"r2" (1x/2x SL-Distanz), "mid" (Range-Mitte), "other" (Gegenseite).
6. Konservativ: SL vor TP im selben Bar; im Entry-Bar zaehlt nur der SL.
   Auswertung bis Tagesende, max. ein Trade pro Tag.

Aufruf: python sweep_confirm_backtest.py <data_dir> <zones> <entries> <tps> [buffer] [out_csv]
  zones: "start:dur,..." (Minuten NY), entries/tps: Kommalisten
"""

import csv
import sys
from bisect import bisect_left
from collections import defaultdict

import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sweep_reclaim_backtest import load_days, MIN_COVERAGE

MAX_CONFIRM_MIN = 120   # Confirmation muss binnen 2h nach Sweep kommen


def find_entry(direction, mods, opens, closes, lows, highs, sweep_idx, rl, rh, mode, m):
    """Liefert (entry_idx, entry_price, extreme) oder None.
    extreme = Sweep-Extrem bis zum Entry."""
    width = rh - rl
    extreme = lows[sweep_idx] if direction == "long" else highs[sweep_idx]
    t0 = mods[sweep_idx]

    if mode == "close_in":
        j = sweep_idx
        while j < m and mods[j] - t0 <= MAX_CONFIRM_MIN:
            if direction == "long":
                extreme = min(extreme, lows[j])
                if rl < closes[j] < rh:
                    return j, closes[j], extreme
            else:
                extreme = max(extreme, highs[j])
                if rl < closes[j] < rh:
                    return j, closes[j], extreme
            j += 1
        return None

    if mode == "mss":
        # Swing-Punkte (Fraktal k=2) laufend fuehren; Bruch des letzten
        # gegenlaeufigen Swings nach dem Sweep = Entry.
        j = sweep_idx
        last_swing = None
        while j < m and mods[j] - t0 <= MAX_CONFIRM_MIN:
            if direction == "long":
                extreme = min(extreme, lows[j])
                k = j - 2
                if k >= 2 and highs[k] == max(highs[k-2:k+3]):
                    if lows[j] > extreme or True:
                        last_swing = highs[k]
                if last_swing is not None and closes[j] > last_swing:
                    return j, closes[j], extreme
            else:
                extreme = max(extreme, highs[j])
                k = j - 2
                if k >= 2 and lows[k] == min(lows[k-2:k+3]):
                    last_swing = lows[k]
                if last_swing is not None and closes[j] < last_swing:
                    return j, closes[j], extreme
            j += 1
        return None

    if mode == "ifvg":
        # FVGs der Sweep-Bewegung sammeln (3-Bar-Gap), Inversion = Close
        # jenseits der fernen Kante.
        gaps = []  # (low_edge, high_edge)
        j = sweep_idx
        while j < m and mods[j] - t0 <= MAX_CONFIRM_MIN:
            if direction == "long":
                extreme = min(extreme, lows[j])
                if j >= 2 and highs[j] < lows[j-2]:      # bearish FVG
                    gaps.append((highs[j], lows[j-2]))
                for lo, hi in gaps:
                    if closes[j] > hi:
                        return j, closes[j], extreme
            else:
                extreme = max(extreme, highs[j])
                if j >= 2 and lows[j] > highs[j-2]:      # bullish FVG
                    gaps.append((highs[j-2], lows[j]))
                for lo, hi in gaps:
                    if closes[j] < lo:
                        return j, closes[j], extreme
            j += 1
        return None

    if mode == "ote":
        # Erst Gegenbewegung >= 0.5 Breiten vom Extrem, dann Limit bei 62%
        # Retrace dieser Bewegung; Fill nur durch spaeteren Bar.
        j = sweep_idx
        leg_peak = None
        while j < m and mods[j] - t0 <= MAX_CONFIRM_MIN:
            if direction == "long":
                extreme = min(extreme, lows[j])
                if leg_peak is None or highs[j] > leg_peak:
                    leg_peak = highs[j]
                if leg_peak - extreme >= 0.5 * width:
                    level = leg_peak - 0.62 * (leg_peak - extreme)
                    k = j + 1
                    while k < m and mods[k] - t0 <= MAX_CONFIRM_MIN:
                        if lows[k] <= extreme:            # neues Tief: ungueltig
                            return None
                        if lows[k] <= level:
                            return k, level, extreme
                        k += 1
                    return None
            else:
                extreme = max(extreme, highs[j])
                if leg_peak is None or lows[j] < leg_peak:
                    leg_peak = lows[j]
                if extreme - leg_peak >= 0.5 * width:
                    level = leg_peak + 0.62 * (extreme - leg_peak)
                    k = j + 1
                    while k < m and mods[k] - t0 <= MAX_CONFIRM_MIN:
                        if highs[k] >= extreme:
                            return None
                        if highs[k] >= level:
                            return k, level, extreme
                        k += 1
                    return None
            j += 1
        return None

    raise ValueError(mode)


def simulate(days, start, dur, entry_mode, tp_mode, buffer_frac=0.1):
    end_min = start + dur
    trades = []
    for day in sorted(days):
        mods, opens, closes, lows, highs = days[day]
        a = bisect_left(mods, start)
        b = bisect_left(mods, end_min)
        if b - a < dur * MIN_COVERAGE:
            continue
        rh = max(highs[a:b])
        rl = min(lows[a:b])
        width = rh - rl
        if width <= 0:
            continue
        m = len(mods)
        direction = None
        j = b
        while j < m:
            hh = highs[j] >= rh
            hl = lows[j] <= rl
            if hh or hl:
                direction = "skip" if (hh and hl) else ("long" if hl else "short")
                break
            j += 1
        if direction in (None, "skip"):
            continue

        found = find_entry(direction, mods, opens, closes, lows, highs, j, rl, rh,
                           entry_mode, m)
        if found is None:
            continue
        entry_idx, entry, extreme = found

        buf = width * buffer_frac
        if direction == "long":
            sl = extreme - buf
            sl_dist = entry - sl
            if sl_dist <= 0:
                continue
            tp = {"r1": entry + sl_dist, "r2": entry + 2 * sl_dist,
                  "mid": (rh + rl) / 2, "other": rh}[tp_mode]
            if tp <= entry:
                continue
        else:
            sl = extreme + buf
            sl_dist = sl - entry
            if sl_dist <= 0:
                continue
            tp = {"r1": entry - sl_dist, "r2": entry - 2 * sl_dist,
                  "mid": (rh + rl) / 2, "other": rl}[tp_mode]
            if tp >= entry:
                continue

        tp_dist = abs(tp - entry)
        res = None
        # Entry-Bar: nur SL werten (konservativ)
        jj = entry_idx
        if direction == "long" and lows[jj] <= sl:
            res = "SL"
        elif direction == "short" and highs[jj] >= sl:
            res = "SL"
        else:
            jj += 1
        while res is None and jj < m:
            if direction == "long":
                if lows[jj] <= sl:
                    res = "SL"; break
                if highs[jj] >= tp:
                    res = "TP"; break
            else:
                if highs[jj] >= sl:
                    res = "SL"; break
                if lows[jj] <= tp:
                    res = "TP"; break
            jj += 1
        if res == "TP":
            r = tp_dist / sl_dist
        elif res == "SL":
            r = -1.0
        else:
            res = "EOD"
            pts = (closes[-1] - entry) if direction == "long" else (entry - closes[-1])
            r = pts / sl_dist
        trades.append({"day": day, "dir": direction, "result": res, "r": r,
                       "rr": tp_dist / sl_dist, "width": width,
                       "sl_pts": sl_dist, "tp_pts": tp_dist})
    return trades


def summarize(trades):
    n = len(trades)
    if n == 0:
        return None
    tp = sum(1 for t in trades if t["result"] == "TP")
    sl = sum(1 for t in trades if t["result"] == "SL")
    dec = tp + sl
    if dec == 0:
        return None
    wr = tp / dec * 100
    avg_rr = sum(t["rr"] for t in trades) / n
    be = 1 / (1 + avg_rr) * 100
    sum_r = sum(t["r"] for t in trades)
    per_year = defaultdict(float)
    for t in trades:
        per_year[t["day"].year] += t["r"]
    pos_years = sum(1 for v in per_year.values() if v > 0)
    return {"trades": n, "decided": dec, "winrate": round(wr, 1),
            "avg_rr": round(avg_rr, 2), "be_wr": round(be, 1),
            "edge_pp": round(wr - be, 1), "sum_r": round(sum_r, 1),
            "pos_years": f"{pos_years}/{len(per_year)}",
            "per_year": " ".join(f"{y}:{v:+.0f}R" for y, v in sorted(per_year.items()))}


def main():
    data_dir = sys.argv[1]
    zones = [tuple(int(v) for v in z.split(":")) for z in sys.argv[2].split(",")]
    entries = sys.argv[3].split(",")
    tps = sys.argv[4].split(",")
    buffer_frac = float(sys.argv[5]) if len(sys.argv) > 5 else 0.1
    out_csv = sys.argv[6] if len(sys.argv) > 6 else "sweep_confirm.csv"

    days = load_days(data_dir)
    rows = []
    for start, dur in zones:
        for em in entries:
            for tm in tps:
                s = summarize(simulate(days, start, dur, em, tm, buffer_frac))
                if s is None or s["decided"] < 200:
                    continue
                s.update({"zone": f"{start//60:02d}:{start%60:02d}+{dur}m",
                          "entry": em, "tp": tm})
                rows.append(s)
    rows.sort(key=lambda r: -r["sum_r"])
    if not rows:
        print("keine auswertbaren Kombis")
        return
    cols = ["zone", "entry", "tp", "trades", "winrate", "avg_rr", "be_wr",
            "edge_pp", "sum_r", "pos_years", "per_year"]
    with open(out_csv, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)
    print(f"{'Zone':>12} {'Entry':>9} {'TP':>6} {'N':>5} {'WR%':>6} {'RR':>5} "
          f"{'BE%':>6} {'Edge':>5} {'SumR':>7} {'J+':>4}")
    for r in rows[:30]:
        print(f"{r['zone']:>12} {r['entry']:>9} {r['tp']:>6} {r['trades']:>5} "
              f"{r['winrate']:>6} {r['avg_rr']:>5} {r['be_wr']:>6} "
              f"{r['edge_pp']:>5} {r['sum_r']:>7} {r['pos_years']:>4}")


if __name__ == "__main__":
    main()
