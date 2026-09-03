"""Sweep-Ereignisse je Level (ereignisgesteuert, sortierte Level-Liste). Ausgabe: events_<INST>_<SET>.pkl
Event: lid, ltype, side (+1 Hoch-Level, -1 Tief-Level), L, isw (erster Bar jenseits), irc (erster Close zurueck innerhalb), ext (Extrem),
nbeyond (Anzahl Closes jenseits), ifcb (erster Close jenseits oder -1), seq (wievielter Sweep dieses Levels), prev_irc, prev_ext, prev_isw.
Level-Sets: 'sess' = PD/ASIA/LON/PRE/OR30/AM-Ranges; 'piv10'/'piv30' = 1-min-Swing-Pivots mit k Bars links/rechts.
Sweep-Bedingung: c[i-1] < L <= hi[i] (Hoch) bzw. c[i-1] > L >= lo[i] (Tief). Reclaim: erster Close wieder innerhalb, binnen MAXW Bars,
sonst Level geloescht (Breakout erfolgreich). Level aktiv ab Bestaetigung bis Session-Ende, max. 6 Sweeps."""
import sys, pickle, time
from bisect import bisect_left, bisect_right, insort
from common import *
MAXW = 60; MAXSEQ = 6; ARM = 2.0  # Re-Arm: Close muss nach Reclaim >= ARM x ATR60 vom Level entfernt sein

def gen(S, lset):
    n = S.n; o, c, lo, hi = S.o, S.c, S.lo, S.hi
    # Level-Erzeugung: Liste (confirm_idx, price, side, ltype, expire_idx)
    levels = []
    if lset == "sess":
        for d, dd in S.sess.items():
            for nm, (h, l, ci) in dd.items():
                e = S.send[ci]
                levels.append((ci, h, 1, nm, e)); levels.append((ci, l, -1, nm, e))
    else:
        k = int(lset[3:]); PH, PL = pivots(S, k)
        for i, p, ci in PH: levels.append((ci, p, 1, "PH", S.send[ci]))
        for i, p, ci in PL: levels.append((ci, p, -1, "PL", S.send[ci]))
    levels.sort(); li = 0; L_ = len(levels)
    # aktive Levels je Seite: sortierte Preisliste + parallele id-Liste
    actp = {1: [], -1: []}; actid = {1: [], -1: []}
    meta = {}  # lid -> dict
    prog = {}  # lid -> [isw, ext, nbeyond, ifcb]
    events = []; hist = {}  # lid -> letztes Event
    wait = {}  # lid -> Level wartet auf Re-Arm
    expire = defaultdict(list)  # expire_idx -> [lid]
    def add(lid, side, p):
        j = bisect_left(actp[side], p); actp[side].insert(j, p); actid[side].insert(j, lid)
    def rem(lid, side, p):
        j = bisect_left(actp[side], p)
        while j < len(actp[side]) and actp[side][j] == p:
            if actid[side][j] == lid: del actp[side][j]; del actid[side][j]; return
            j += 1
    for i in range(1, n):
        # ablaufende Levels (Session-Ende erreicht am Vorbar)
        if i - 1 in expire:
            for lid in expire.pop(i - 1):
                m = meta.pop(lid, None)
                if m is None: continue
                if lid in prog: prog.pop(lid)
                elif lid in wait: wait.pop(lid)
                else: rem(lid, m["side"], m["L"])
        # neue Levels aktivieren
        while li < L_ and levels[li][0] <= i - 1:
            ci, p, side, nm, e = levels[li]; li += 1
            if e <= i: continue
            lid = li; meta[lid] = dict(side=side, L=p, ltype=nm, seq=0, ci=ci); add(lid, side, p); expire[e].append(lid)
        pc = c[i - 1]
        if wait:
            arm = ARM * S.atr[i - 1]; rd = []
            for lid in wait:
                m = meta[lid]
                if (m["side"] == 1 and pc <= m["L"] - arm) or (m["side"] == -1 and pc >= m["L"] + arm): rd.append(lid)
            for lid in rd: wait.pop(lid); m = meta[lid]; add(lid, m["side"], m["L"])
        # Sweeps Hoch-Levels: pc < L <= hi[i]
        a = bisect_right(actp[1], pc); b = bisect_right(actp[1], hi[i])
        if b > a:
            ids = actid[1][a:b]; del actp[1][a:b]; del actid[1][a:b]
            for lid in ids: prog[lid] = [i, hi[i], 0, -1]
        a = bisect_left(actp[-1], lo[i]); b = bisect_left(actp[-1], pc)
        if b > a:
            ids = actid[-1][a:b]; del actp[-1][a:b]; del actid[-1][a:b]
            for lid in ids: prog[lid] = [i, lo[i], 0, -1]
        if not prog: continue
        done = []
        for lid, st in prog.items():
            m = meta[lid]; side = m["side"]; L = m["L"]
            if side == 1:
                if hi[i] > st[1]: st[1] = hi[i]
                back = c[i] < L
            else:
                if lo[i] < st[1]: st[1] = lo[i]
                back = c[i] > L
            if not back:
                st[2] += 1
                if st[3] < 0: st[3] = i
                if i - st[0] >= MAXW: done.append((lid, False))
                continue
            done.append((lid, True))
            m["seq"] += 1; pv = hist.get(lid)
            ev = dict(lid=lid, ltype=m["ltype"], side=side, L=L, isw=st[0], irc=i, ext=st[1], nbeyond=st[2], ifcb=st[3], seq=m["seq"],
                      ci=m["ci"], prev_irc=pv["irc"] if pv else -1, prev_ext=pv["ext"] if pv else None, prev_isw=pv["isw"] if pv else -1)
            events.append(ev); hist[lid] = ev
        for lid, ok in done:
            prog.pop(lid); m = meta[lid]
            if ok and m["seq"] < MAXSEQ: wait[lid] = 1
            else: meta.pop(lid)
    return events

if __name__ == "__main__":
    inst, lset = sys.argv[1], sys.argv[2]; t0 = time.time()
    S = Series(inst); ev = gen(S, lset)
    pickle.dump(ev, open(f"events_{inst}_{lset}.pkl", "wb"))
    print(inst, lset, "events", len(ev), "seq>=2:", sum(1 for e in ev if e["seq"] >= 2), f"{time.time()-t0:.0f}s")
    from collections import Counter
    print(Counter(e["ltype"] for e in ev).most_common()); print(Counter(e["seq"] for e in ev))
