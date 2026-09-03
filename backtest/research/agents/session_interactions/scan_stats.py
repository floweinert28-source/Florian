"""Statistik-Scan: Sweep von Level A in Session S1 -> Trefferquote von Level B bis S2-Ende.

Fuer jeden Trading-Tag:
  - Level (H/L) aller Sessions.
  - Sweep von A in S1: erster Bar in S1 mit high >= A (Hoch) bzw. low <= A (Tief).
    Skip, wenn dieser Bar auch die andere Seite von A's Session-Range trifft.
  - cond 'intact': A wurde zwischen Ende der A-Session und Start von S1 nicht beruehrt.
  - Treffer B: erster Bar NACH dem Sweep-Bar (j > sweep_idx) mit Touch von B, vor S2-Ende.
    Trifft der Sweep-Bar selbst B -> Skip (Reihenfolge im Bar unbekannt).
  - Basisrate: P(B im Fenster [S1-Start, S2-Ende) getroffen) ueber alle gueltigen Tage.
Aufruf: python3 scan_stats.py NQ|ES [out_csv]
"""

import csv
import math
import sys
from bisect import bisect_left

sys.path.insert(0, "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/session_interactions")
from sessions import SESS, build_tdays, levels_for_day, next_touch, is_train  # noqa: E402

SWEEP_SESS = ["LON", "PRE", "OPEN", "AM", "LUNCH", "PM", "RTH"]
LEVEL_SESS = ["PDRTH", "ASIA", "LON", "PRE", "ON", "OPEN", "OPEN15", "AM", "LUNCH"]
S2_ENDS = [300, 570, 600, 720, 960]


def s2_ends_for(s1):
    e = SESS[s1][1]
    return sorted({x for x in S2_ENDS if x >= e})


def main():
    instr = sys.argv[1]
    out_csv = sys.argv[2] if len(sys.argv) > 2 else f"stats_{instr}.csv"
    tdays = build_tdays(instr)
    print(instr, "trading days:", len(tdays))
    tdays_c = {day: tdays[day][2] for day in tdays}

    # Pro Tag vorbereiten
    prepared = []  # (day, t, lv, nt) nt: (sess,side)->next_touch array
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
        idx = {tt: bisect_left(t, tt) for tt in set(S2_ENDS) | {SESS[s][0] for s in SWEEP_SESS} | {SESS[s][1] for s in SWEEP_SESS}}
        prepared.append((day, t, lv, nt, idx))
    print("prepared")

    rows = []
    for s1 in SWEEP_SESS:
        s1_start, s1_end = SESS[s1]
        lvl_ok = [n for n in LEVEL_SESS if SESS[n][1] <= s1_start]
        for a_sess in lvl_ok:
            for a_side in ("H", "L"):
                for b_sess in lvl_ok:
                    for b_side in ("H", "L"):
                        if (a_sess, a_side) == (b_sess, b_side):
                            continue
                        for s2_end in s2_ends_for(s1):
                            # Zaehler: cond -> [n_sweeps, hits] getrennt train/test; base -> [n_days, hits]
                            cnt = {("any", True): [0, 0], ("any", False): [0, 0],
                                   ("intact", True): [0, 0], ("intact", False): [0, 0]}
                            base = {True: [0, 0], False: [0, 0]}
                            for day, t, lv, nt, idx in prepared:
                                if a_sess not in lv or b_sess not in lv:
                                    continue
                                tr = is_train(day)
                                i_s1 = idx[s1_start]
                                i_e1 = idx[s1_end]
                                i_e2 = idx[s2_end]
                                ntB = nt[(b_sess, b_side)]
                                # Basisrate
                                base[tr][0] += 1
                                if ntB[i_s1] < i_e2:
                                    base[tr][1] += 1
                                ntA = nt[(a_sess, a_side)]
                                sw = ntA[i_s1]
                                if sw >= i_e1:
                                    continue
                                # Echter Sweep = Kreuzung (Vor-Bar schliesst diesseits von A)
                                if sw <= i_s1 or sw == 0:
                                    continue
                                Aval = lv[a_sess][0] if a_side == "H" else lv[a_sess][1]
                                cprev = tdays_c[day][sw - 1]
                                if (a_side == "H" and cprev >= Aval) or (a_side == "L" and cprev <= Aval):
                                    continue
                                # Sweep-Bar trifft auch andere Seite von A's Range -> Skip
                                other = nt[(a_sess, "L" if a_side == "H" else "H")]
                                if other[sw] == sw:
                                    continue
                                # Sweep-Bar trifft B selbst -> Skip
                                if ntB[sw] == sw:
                                    continue
                                hit = ntB[sw + 1] < i_e2
                                intact = ntA[lv[a_sess][2]] >= i_s1
                                cnt[("any", tr)][0] += 1
                                cnt[("any", tr)][1] += hit
                                if intact:
                                    cnt[("intact", tr)][0] += 1
                                    cnt[("intact", tr)][1] += hit
                            for cond in ("any", "intact"):
                                ntr, htr = cnt[(cond, True)]
                                nte, hte = cnt[(cond, False)]
                                if ntr < 100:
                                    continue
                                btr = base[True][1] / base[True][0] if base[True][0] else 0
                                bte = base[False][1] / base[False][0] if base[False][0] else 0
                                ptr = htr / ntr
                                pte = hte / nte if nte else 0
                                se = math.sqrt(max(btr * (1 - btr), 1e-9) / ntr)
                                rows.append({
                                    "A": f"{a_sess}.{a_side}", "S1": s1, "B": f"{b_sess}.{b_side}",
                                    "S2end": f"{s2_end//60:02d}:{s2_end%60:02d}", "cond": cond,
                                    "days_train": base[True][0], "sweeps_train": ntr,
                                    "hit_train": round(ptr * 100, 1), "base_train": round(btr * 100, 1),
                                    "lift_train": round((ptr - btr) * 100, 1),
                                    "z_train": round((ptr - btr) / se, 2),
                                    "sweeps_test": nte, "hit_test": round(pte * 100, 1),
                                    "base_test": round(bte * 100, 1), "lift_test": round((pte - bte) * 100, 1),
                                    "freq_train": round(ntr / base[True][0], 2),
                                })
    rows.sort(key=lambda r: -abs(r["z_train"]))
    with open(out_csv, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)
    print("combos:", len(rows))
    print(f"{'A':>9} {'S1':>5} {'B':>9} {'S2':>5} {'cond':>6} {'nTr':>5} {'hitTr':>6} {'baseTr':>6} {'z':>6} {'nTe':>5} {'hitTe':>6} {'baseTe':>6} {'freq':>5}")
    for r in rows[:60]:
        print(f"{r['A']:>9} {r['S1']:>5} {r['B']:>9} {r['S2end']:>5} {r['cond']:>6} {r['sweeps_train']:>5} "
              f"{r['hit_train']:>6} {r['base_train']:>6} {r['z_train']:>6} {r['sweeps_test']:>5} "
              f"{r['hit_test']:>6} {r['base_test']:>6} {r['freq_train']:>5}")


if __name__ == "__main__":
    main()
