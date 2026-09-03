"""Benannte Hypothesen aus dem Auftrag (reine Statistik, Train/Test getrennt):
 H1: London sweept Asia-Hoch -> geht NY (09:30-16:00) unter das Asia-Tief?
 H2: NY-Open (09:30-10:00) sweept Pre-Market-Tief/-Hoch -> Reversal-Quote (Gegenseite der PRE-Range bis 16:00,
     bzw. Rueckkehr in die Range / Close-Reclaim binnen 30 min)
 H3: Beide Seiten der London-Range in der NY-Session geholt? (und in Abhaengigkeit davon, welche Seite zuerst)
 H4: Asia-Range: beide Seiten bis 16:00 geholt?
"""
import sys
from bisect import bisect_left

sys.path.insert(0, "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/session_interactions")
from sessions import SESS, build_tdays, levels_for_day, next_touch, is_train  # noqa: E402


def pct(a, b):
    return f"{a/b*100:5.1f}% ({a}/{b})" if b else "n/a"


def main(instr):
    td = build_tdays(instr)
    c = {"H1": {}, "H2a": {}, "H2b": {}, "H2c": {}, "H3": {}, "H3b": {}, "H4": {}}
    for day in sorted(td):
        t, o, cl, l, h = td[day]
        lv = levels_for_day(t, l, h)
        if not all(k in lv for k in ("ASIA", "LON", "PRE", "RTH")):
            continue
        grp = "train" if is_train(day) else "test"
        i_lon0, i_lon1 = bisect_left(t, 120), bisect_left(t, 300)
        i_rth0, i_rth1 = bisect_left(t, 570), bisect_left(t, 960)
        i_op1 = bisect_left(t, 600)
        AH, AL, _ = lv["ASIA"]
        LH, LL, _ = lv["LON"]
        PH, PL, _ = lv["PRE"]
        # H1
        d = c["H1"].setdefault(grp, [0, 0, 0, 0])  # n_sweep, hit_low, n_nosweep, hit_low_nosweep
        lon_sweeps_ah = any(h[i] >= AH for i in range(i_lon0, i_lon1))
        lon_sweeps_al = any(l[i] <= AL for i in range(i_lon0, i_lon1))
        ny_under_al = any(l[i] <= AL for i in range(i_rth0, i_rth1))
        ny_over_ah = any(h[i] >= AH for i in range(i_rth0, i_rth1))
        if lon_sweeps_ah and not lon_sweeps_al:
            d[0] += 1; d[1] += ny_under_al
        elif not lon_sweeps_ah and not lon_sweeps_al:
            d[2] += 1; d[3] += ny_under_al
        # H4: Asia beide Seiten bis 16:00 (ab 02:00)
        d4 = c["H4"].setdefault(grp, [0, 0])
        both = any(h[i] >= AH for i in range(i_lon0, i_rth1)) and any(l[i] <= AL for i in range(i_lon0, i_rth1))
        d4[0] += 1; d4[1] += both
        # H2: Open sweept PRE-Tief (erster Bruch in 09:30-10:00; Vor-Bar-Close ueber PL)
        sw = None
        for i in range(i_rth0, i_op1):
            if l[i] <= PL and h[i] < PH and i > 0 and cl[i - 1] > PL:
                sw = i; break
            if h[i] >= PH:
                break
        if sw is not None:
            d = c["H2a"].setdefault(grp, [0, 0, 0, 0])  # n, PH bis 16:00, Reclaim(close>PL) binnen 30m, neues Tief unter Sweep-Extrem nach Reclaim
            d[0] += 1
            d[1] += any(h[i] >= PH for i in range(sw + 1, i_rth1))
            rec = None
            ext = l[sw]
            for i in range(sw, min(len(t), i_rth1)):
                if t[i] - t[sw] > 30: break
                ext = min(ext, l[i])
                if cl[i] > PL: rec = i; break
            d[2] += rec is not None
            if rec is not None:
                d[3] += any(l[i] < ext for i in range(rec + 1, i_rth1))
        sw = None
        for i in range(i_rth0, i_op1):
            if h[i] >= PH and l[i] > PL and i > 0 and cl[i - 1] < PH:
                sw = i; break
            if l[i] <= PL:
                break
        if sw is not None:
            d = c["H2b"].setdefault(grp, [0, 0, 0, 0])
            d[0] += 1
            d[1] += any(l[i] <= PL for i in range(sw + 1, i_rth1))
            rec = None
            ext = h[sw]
            for i in range(sw, min(len(t), i_rth1)):
                if t[i] - t[sw] > 30: break
                ext = max(ext, h[i])
                if cl[i] < PH: rec = i; break
            d[2] += rec is not None
            if rec is not None:
                d[3] += any(h[i] > ext for i in range(rec + 1, i_rth1))
        # H3: London-Range beide Seiten in RTH
        d = c["H3"].setdefault(grp, [0, 0, 0, 0, 0])  # n, both, first=H, first=L, none
        hi = next((i for i in range(i_rth0, i_rth1) if h[i] >= LH), None)
        lo = next((i for i in range(i_rth0, i_rth1) if l[i] <= LL), None)
        d[0] += 1
        d[1] += (hi is not None and lo is not None)
        if hi is None and lo is None: d[4] += 1
        elif lo is None or (hi is not None and hi < lo): d[2] += 1
        else: d[3] += 1
        # H3b: gegeben erste Seite in RTH gebrochen -> andere Seite bis 16:00?
        d = c["H3b"].setdefault(grp, [0, 0, 0, 0])  # firstH n, firstH->L hit, firstL n, firstL->H hit
        if hi is not None and (lo is None or hi < lo):
            d[0] += 1; d[1] += (lo is not None)
        elif lo is not None and (hi is None or lo < hi):
            d[2] += 1; d[3] += (hi is not None)
    print(f"==== {instr} ====")
    for grp in ("train", "test"):
        d = c["H1"][grp]
        print(f"H1 [{grp}] London sweept nur Asia-Hoch: NY unter Asia-Tief {pct(d[1], d[0])} | London beruehrt keine Asia-Seite: NY unter Asia-Tief {pct(d[3], d[2])}")
        d = c["H4"][grp]
        print(f"H4 [{grp}] Asia-Range beide Seiten bis 16:00 geholt: {pct(d[1], d[0])}")
        d = c["H2a"][grp]
        print(f"H2 [{grp}] Open sweept PRE-Tief (09:30-10:00): n={d[0]} -> PRE-Hoch bis 16:00 {pct(d[1], d[0])}; Reclaim binnen 30m {pct(d[2], d[0])}; nach Reclaim neues Tief unter Sweep-Extrem {pct(d[3], d[2])}")
        d = c["H2b"][grp]
        print(f"H2 [{grp}] Open sweept PRE-Hoch (09:30-10:00): n={d[0]} -> PRE-Tief bis 16:00 {pct(d[1], d[0])}; Reclaim binnen 30m {pct(d[2], d[0])}; nach Reclaim neues Hoch ueber Sweep-Extrem {pct(d[3], d[2])}")
        d = c["H3"][grp]
        print(f"H3 [{grp}] London-Range in RTH: beide Seiten {pct(d[1], d[0])}; zuerst Hoch {pct(d[2], d[0])}; zuerst Tief {pct(d[3], d[0])}; keine {pct(d[4], d[0])}")
        d = c["H3b"][grp]
        print(f"H3b[{grp}] zuerst Hoch gebrochen -> auch Tief bis 16:00 {pct(d[1], d[0])}; zuerst Tief -> auch Hoch {pct(d[3], d[2])}")


if __name__ == "__main__":
    main(sys.argv[1])
