"""Regel-Scanner fuer Opening-Range-Muster (09:30 NY). Alle Familien.

Aufruf: python3 scan.py <NQ|ES> <family> [out_prefix]
Familien: orb, retest, fade, judas, gap, onsweep, pos30
Ausgabe: Tabelle je Variante (Train/Test getrennt), sortiert nach Train-Netto.
Auswahl-Kriterium (vorab festgelegt): pro Familie Top-Varianten nach Train-Netto,
Train-N >= 200. Test wird nur ausgewiesen, nie zur Auswahl benutzt.
"""
import sys
from bisect import bisect_left
sys.path.insert(0, '/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/research/orb_open')
from common import *  # noqa

instr = None
info = []


def setup(_instr):
    global instr, info
    instr = _instr
    days = get_days(instr)
    td = trading_days(days)
    info = []
    _build_info(days, td)


def _build_info(days, td):
  for i, d in enumerate(td):
      bars = days[d]
      mods, o, c, l, h = bars
      a = bisect_left(mods, OPEN)
      b = bisect_left(mods, RTH_END)
      pc = prev_close(days, td, i)
      onr = overnight_range(days, td, i)
      rr = []
      for k in range(max(0, i - 10), i):
          bb = days[td[k]]
          aa = bisect_left(bb[0], OPEN); bbb = bisect_left(bb[0], RTH_END)
          rr.append(max(bb[4][aa:bbb]) - min(bb[3][aa:bbb]))
      if not rr or pc is None or onr is None:
          continue
      info.append({'date': d, 'bars': bars, 'a': a, 'b': b, 'pc': pc, 'on_h': onr[0], 'on_l': onr[1],
                   'atr': sum(rr) / len(rr)})


def idx_at(mods, t):
    return bisect_left(mods, t)


def tp_from(entry, direction, mode, w, sl_dist, rh, rl, pc=None):
    """TP-Preis. mode: ('w', k) = k Range-Weiten vom Entry, ('r', k) = k x SL-Dist,
    'mid', 'other', 'none', 'pc' (Vortagesclose)"""
    if mode == 'none':
        return None
    if mode == 'mid':
        return (rh + rl) / 2
    if mode == 'other':
        return rl if direction == 'short' else rh
    if mode == 'pc':
        return pc
    kind, k = mode
    dist = k * w if kind == 'w' else k * sl_dist
    return entry + dist if direction == 'long' else entry - dist


def valid(direction, entry, sl, tp):
    if direction == 'long':
        return sl < entry and (tp is None or tp > entry)
    return sl > entry and (tp is None or tp < entry)


# ---------------------------------------------------------------------------
def fam_orb(cfg):
    """ORB-Breakout: erster Close ausserhalb der OR nach Range-Ende, bis latest.
    SL: 'mid' | 'other' | ('w', k) k Weiten vom Entry gegen die Richtung | 'edge' (Range-Kante)
    """
    dur, sl_mode, tp_mode, latest, ts = cfg['dur'], cfg['sl'], cfg['tp'], cfg['latest'], cfg['ts']
    trades = []
    for r in info:
        bars = r['bars']; mods, o, c, l, h = bars; a = r['a']
        rh = max(h[a:a + dur]); rl = min(l[a:a + dur]); w = rh - rl
        if w <= 0:
            continue
        if cfg.get('minw') and w / r['atr'] < cfg['minw']:
            continue
        if cfg.get('maxw') and w / r['atr'] > cfg['maxw']:
            continue
        j = a + dur
        while j < len(mods) and mods[j] < latest:
            if c[j] > rh:
                direction = 'long'; break
            if c[j] < rl:
                direction = 'short'; break
            j += 1
        else:
            continue
        if j >= len(mods) or mods[j] >= latest:
            continue
        entry = c[j]
        if cfg.get('gapfilter'):
            g = r['bars'][1][a] - r['pc']
            if cfg['gapfilter'] == 'with' and ((g > 0) != (direction == 'long')):
                continue
            if cfg['gapfilter'] == 'against' and ((g > 0) == (direction == 'long')):
                continue
        if sl_mode == 'mid':
            sl = (rh + rl) / 2
        elif sl_mode == 'other':
            sl = rl if direction == 'long' else rh
        elif sl_mode == 'edge':
            sl = rh if direction == 'long' else rl
        else:
            sl = entry - sl_mode[1] * w if direction == 'long' else entry + sl_mode[1] * w
        sl_dist = abs(entry - sl)
        if sl_dist <= 0:
            continue
        tp = tp_from(entry, direction, tp_mode, w, sl_dist, rh, rl)
        if not valid(direction, entry, sl, tp):
            continue
        trades.append(make_trade(instr, r['date'], direction, bars, j, entry, sl, tp, ts, tag=f"OR{dur}"))
    return trades


def fam_retest(cfg):
    """ORB-Retest: nach erstem Close ausserhalb -> Limit an der Range-Kante (+/- offset*W),
    Fill nur durch spaeteren Bar (Touch). Ungueltig, wenn vorher SL-Level gehandelt wird oder
    Fill nicht bis 'fill_by' erfolgt. SL: 'mid'|'other'|('w',k) von Kante. TP: ('w',k) von Kante."""
    dur, latest, ts = cfg['dur'], cfg['latest'], cfg['ts']
    trades = []
    for r in info:
        bars = r['bars']; mods, o, c, l, h = bars; a = r['a']
        rh = max(h[a:a + dur]); rl = min(l[a:a + dur]); w = rh - rl
        if w <= 0:
            continue
        j = a + dur
        while j < len(mods) and mods[j] < latest:
            if c[j] > rh:
                direction = 'long'; break
            if c[j] < rl:
                direction = 'short'; break
            j += 1
        else:
            continue
        if j >= len(mods) or mods[j] >= latest:
            continue
        edge = rh if direction == 'long' else rl
        off = cfg.get('off', 0.0) * w
        level = edge + off if direction == 'long' else edge - off
        if cfg['sl'] == 'mid':
            sl = (rh + rl) / 2
        elif cfg['sl'] == 'other':
            sl = rl if direction == 'long' else rh
        else:
            sl = level - cfg['sl'][1] * w if direction == 'long' else level + cfg['sl'][1] * w
        sl_dist = abs(level - sl)
        tp = tp_from(level, direction, cfg['tp'], w, sl_dist, rh, rl)
        if not valid(direction, level, sl, tp):
            continue
        # Fill suchen
        k = j + 1
        fill = None
        while k < len(mods) and mods[k] < cfg['fill_by']:
            if direction == 'long' and l[k] <= level:
                fill = k; break
            if direction == 'short' and h[k] >= level:
                fill = k; break
            k += 1
        if fill is None:
            continue
        trades.append(make_trade(instr, r['date'], direction, bars, fill, level, sl, tp, ts, tag=f"RT{dur}"))
    return trades


def fam_fade(cfg):
    """ORB-Fade/Reclaim: nach Range-Ende erster Bruch (High>=rh / Low<=rl; beide im Bar -> Skip),
    dann erster Close zurueck INNERHALB der Range (binnen max_min Minuten) -> Entry Close.
    SL: Sweep-Extrem +/- buf*W. TP: 'mid' | 'other' | ('r',k)."""
    dur, latest, ts = cfg['dur'], cfg['latest'], cfg['ts']
    trades = []
    for r in info:
        bars = r['bars']; mods, o, c, l, h = bars; a = r['a']
        rh = max(h[a:a + dur]); rl = min(l[a:a + dur]); w = rh - rl
        if w <= 0:
            continue
        m = len(mods)
        j = a + dur
        direction = None
        while j < m and mods[j] < latest:
            hh = h[j] >= rh; hl = l[j] <= rl
            if hh or hl:
                direction = 'skip' if (hh and hl) else ('short' if hh else 'long')
                break
            j += 1
        if direction in (None, 'skip'):
            continue
        if cfg.get('min_pen') and (abs((h[j] if direction == 'short' else l[j]) - (rh if direction == 'short' else rl)) < cfg['min_pen'] * w):
            # Mindest-Penetration im ersten Sweep-Bar nicht erreicht -> weiter tracken bis Extrem tief genug
            pass
        t0 = mods[j]
        ext = h[j] if direction == 'short' else l[j]
        k = j
        entry_idx = None
        while k < m and mods[k] - t0 <= cfg['max_min']:
            ext = max(ext, h[k]) if direction == 'short' else min(ext, l[k])
            if rl < c[k] < rh:
                # Penetrationsfilter (Sweep muss mind. min_pen*W tief sein)
                pen = (ext - rh) if direction == 'short' else (rl - ext)
                if cfg.get('min_pen') and pen < cfg['min_pen'] * w:
                    break
                entry_idx = k
                break
            k += 1
        if entry_idx is None:
            continue
        entry = c[entry_idx]
        sl = ext + cfg['buf'] * w if direction == 'short' else ext - cfg['buf'] * w
        sl_dist = abs(entry - sl)
        tp = tp_from(entry, direction, cfg['tp'], w, sl_dist, rh, rl)
        if not valid(direction, entry, sl, tp):
            continue
        trades.append(make_trade(instr, r['date'], direction, bars, entry_idx, entry, sl, tp, ts, tag=f"FD{dur}"))
    return trades


def fam_judas(cfg):
    """Judas-Swing: erste 'dur' Minuten (Close[a+dur-1] vs Open 09:30). Dann Entry, wenn ein Bar
    (bis latest) auf der Gegenseite des Open schliesst (Close < Open bei Up-Move => Short).
    Optional: 'minmove' = Mindest-Move der ersten dur Minuten in ATR (Extrem vs Open).
    SL: Extrem der ersten dur Minuten +/- buf*ATR | ('r' fix). TP: ('r',k) | ('atr',k) | 'pc' | 'on_other'."""
    dur, latest, ts = cfg['dur'], cfg['latest'], cfg['ts']
    trades = []
    for r in info:
        bars = r['bars']; mods, o, c, l, h = bars; a = r['a']; atr = r['atr']
        op = o[a]
        c0 = c[a + dur - 1]
        if c0 == op:
            continue
        up = c0 > op
        hi = max(h[a:a + dur]); lo = min(l[a:a + dur])
        move = (hi - op) if up else (op - lo)
        if move < cfg.get('minmove', 0) * atr:
            continue
        direction = 'short' if up else 'long'
        j = a + dur
        entry_idx = None
        while j < len(mods) and mods[j] < latest:
            if up and c[j] < op:
                entry_idx = j; break
            if (not up) and c[j] > op:
                entry_idx = j; break
            j += 1
        if entry_idx is None:
            continue
        entry = c[entry_idx]
        # Extrem bis zum Entry aktualisieren
        ext = max(h[a:entry_idx + 1]) if up else min(l[a:entry_idx + 1])
        sl = ext + cfg['buf'] * atr if direction == 'short' else ext - cfg['buf'] * atr
        sl_dist = abs(entry - sl)
        if sl_dist <= 0:
            continue
        tpm = cfg['tp']
        if tpm == 'pc':
            tp = r['pc']
        elif tpm == 'on_other':
            tp = r['on_l'] if direction == 'short' else r['on_h']
        elif tpm[0] == 'atr':
            tp = entry - tpm[1] * atr if direction == 'short' else entry + tpm[1] * atr
        elif tpm[0] == 'r':
            tp = entry - tpm[1] * sl_dist if direction == 'short' else entry + tpm[1] * sl_dist
        else:
            tp = None
        if not valid(direction, entry, sl, tp):
            continue
        trades.append(make_trade(instr, r['date'], direction, bars, entry_idx, entry, sl, tp, ts, tag=f"JD{dur}"))
    return trades


def fam_gap(cfg):
    """Gap-Fade: |gap|/ATR in [gmin, gmax). Entry Close des Bars 'entry_bar' (0 = 09:30-Bar-Close).
    Richtung: zum Vortagesclose. TP = Vortagesclose (oder Anteil frac des Restgaps).
    SL = Entry +/- k * |gap| (k = 'slk') oder ATR-Anteil ('slatr'). Time-Stop ts.
    'go' = True: Gap-and-Go (Richtung mit Gap), TP = ('atr',k)."""
    trades = []
    for r in info:
        bars = r['bars']; mods, o, c, l, h = bars; a = r['a']; atr = r['atr']
        gap = o[a] - r['pc']
        g = abs(gap) / atr
        if not (cfg['gmin'] <= g < cfg['gmax']):
            continue
        ei = a + cfg['entry_bar']
        entry = c[ei]
        if cfg.get('go'):
            direction = 'long' if gap > 0 else 'short'
        else:
            direction = 'short' if gap > 0 else 'long'
        # Restgap beim Entry
        rest = (entry - r['pc']) if direction == 'short' else (r['pc'] - entry)
        if rest <= cfg.get('minrest', 0) * atr:
            continue
        if cfg.get('go'):
            tp = entry + cfg['tp'][1] * atr if direction == 'long' else entry - cfg['tp'][1] * atr
            sl = entry - cfg['slatr'] * atr if direction == 'long' else entry + cfg['slatr'] * atr
        else:
            frac = cfg.get('frac', 1.0)
            tp = entry - frac * rest if direction == 'short' else entry + frac * rest
            if 'slk' in cfg:
                sd = cfg['slk'] * abs(gap)
            else:
                sd = cfg['slatr'] * atr
            sl = entry + sd if direction == 'short' else entry - sd
        if not valid(direction, entry, sl, tp):
            continue
        trades.append(make_trade(instr, r['date'], direction, bars, ei, entry, sl, tp, cfg['ts'], tag='GAP'))
    return trades


def fam_onsweep(cfg):
    """ON-Range-Sweep in [09:30, latest): erster Bar mit High>=ON_H oder Low<=ON_L (beide -> Skip).
    Dann erster Close zurueck innerhalb der ON-Range binnen max_min -> Entry.
    SL = Sweep-Extrem +/- buf*ATR. TP: 'mid' (ON-Mitte) | 'other' | ('r',k) | ('atr',k)."""
    trades = []
    for r in info:
        bars = r['bars']; mods, o, c, l, h = bars; a = r['a']; atr = r['atr']
        onh, onl = r['on_h'], r['on_l']
        w = onh - onl
        if w <= 0:
            continue
        if cfg.get('minw') and w / atr < cfg['minw']:
            continue
        m = len(mods)
        j = a
        direction = None
        while j < m and mods[j] < cfg['latest']:
            hh = h[j] >= onh; hl = l[j] <= onl
            if hh or hl:
                direction = 'skip' if (hh and hl) else ('short' if hh else 'long')
                break
            j += 1
        if direction in (None, 'skip'):
            continue
        t0 = mods[j]
        ext = h[j] if direction == 'short' else l[j]
        k = j
        entry_idx = None
        while k < m and mods[k] - t0 <= cfg['max_min']:
            ext = max(ext, h[k]) if direction == 'short' else min(ext, l[k])
            if onl < c[k] < onh:
                entry_idx = k; break
            k += 1
        if entry_idx is None:
            continue
        entry = c[entry_idx]
        sl = ext + cfg['buf'] * atr if direction == 'short' else ext - cfg['buf'] * atr
        sl_dist = abs(entry - sl)
        tpm = cfg['tp']
        if tpm == 'mid':
            tp = (onh + onl) / 2
        elif tpm == 'other':
            tp = onl if direction == 'short' else onh
        elif tpm[0] == 'r':
            tp = entry - tpm[1] * sl_dist if direction == 'short' else entry + tpm[1] * sl_dist
        else:
            tp = entry - tpm[1] * atr if direction == 'short' else entry + tpm[1] * atr
        if not valid(direction, entry, sl, tp):
            continue
        trades.append(make_trade(instr, r['date'], direction, bars, entry_idx, entry, sl, tp, cfg['ts'], tag='ONS'))
    return trades


def fam_pos30(cfg):
    """OR30-Positionsregel: Close des 09:59-Bars (bzw. dur-1) in oberem Anteil (>thr) der OR ->
    Long mit TP = OR-High (+ext*W), SL = OR-Mitte / OR-Low / Entry - k*W. Analog Short unten."""
    dur = cfg['dur']
    trades = []
    for r in info:
        bars = r['bars']; mods, o, c, l, h = bars; a = r['a']
        rh = max(h[a:a + dur]); rl = min(l[a:a + dur]); w = rh - rl
        if w <= 0:
            continue
        ei = a + dur - 1
        p = (c[ei] - rl) / w
        if p > cfg['thr']:
            direction = 'long'
        elif p < 1 - cfg['thr']:
            direction = 'short'
        else:
            continue
        entry = c[ei]
        if direction == 'long':
            tp = rh + cfg['ext'] * w
            sl = {'mid': (rh + rl) / 2, 'other': rl}.get(cfg['sl'], None)
            if sl is None:
                sl = entry - cfg['sl'][1] * w
        else:
            tp = rl - cfg['ext'] * w
            sl = {'mid': (rh + rl) / 2, 'other': rh}.get(cfg['sl'], None)
            if sl is None:
                sl = entry + cfg['sl'][1] * w
        if not valid(direction, entry, sl, tp):
            continue
        trades.append(make_trade(instr, r['date'], direction, bars, ei, entry, sl, tp, cfg['ts'], tag=f"P{dur}"))
    return trades


def fam_onbreak(cfg):
    """ON-Range-Breakout (Continuation): erster Close ausserhalb der ON-Range in [09:30, latest).
    SL = ON-Kante -/+ buf*ATR (zurueck in die Range) | 'mid'. TP: none | ('atr',k) | ('r',k)."""
    trades = []
    for r in info:
        bars = r['bars']; mods, o, c, l, h = bars; a = r['a']; atr = r['atr']
        onh, onl = r['on_h'], r['on_l']
        if onh - onl <= 0:
            continue
        j = a
        direction = None
        while j < len(mods) and mods[j] < cfg['latest']:
            if c[j] > onh:
                direction = 'long'; break
            if c[j] < onl:
                direction = 'short'; break
            j += 1
        if direction is None:
            continue
        entry = c[j]
        if cfg['sl'] == 'mid':
            sl = (onh + onl) / 2
        else:
            sl = onh - cfg['sl'][1] * atr if direction == 'long' else onl + cfg['sl'][1] * atr
        sl_dist = abs(entry - sl)
        if sl_dist <= 0:
            continue
        tpm = cfg['tp']
        if tpm == 'none':
            tp = None
        elif tpm[0] == 'atr':
            tp = entry + tpm[1] * atr if direction == 'long' else entry - tpm[1] * atr
        else:
            tp = entry + tpm[1] * sl_dist if direction == 'long' else entry - tpm[1] * sl_dist
        if not valid(direction, entry, sl, tp):
            continue
        trades.append(make_trade(instr, r['date'], direction, bars, j, entry, sl, tp, cfg['ts'], tag='ONB'))
    return trades


def fam_gapconf(cfg):
    """Gap (|gap|/ATR in [gmin,gmax)) + OR5-Bestaetigung. mode 'fade': Entry beim ersten Close
    jenseits der OR5-Kante in Richtung Gap-Fill (bis latest), TP = Vortagesclose, SL = andere OR5-Kante
    (+buf*ATR). mode 'go': Entry beim ersten Close jenseits der OR5-Kante in Gap-Richtung,
    TP = ('atr',k), SL = andere OR5-Kante."""
    trades = []
    for r in info:
        bars = r['bars']; mods, o, c, l, h = bars; a = r['a']; atr = r['atr']
        gap = o[a] - r['pc']
        g = abs(gap) / atr
        if not (cfg['gmin'] <= g < cfg['gmax']):
            continue
        dur = cfg.get('dur', 5)
        rh = max(h[a:a + dur]); rl = min(l[a:a + dur])
        if cfg['mode'] == 'fade':
            direction = 'short' if gap > 0 else 'long'
        else:
            direction = 'long' if gap > 0 else 'short'
        j = a + dur
        entry_idx = None
        while j < len(mods) and mods[j] < cfg['latest']:
            if direction == 'long' and c[j] > rh:
                entry_idx = j; break
            if direction == 'short' and c[j] < rl:
                entry_idx = j; break
            j += 1
        if entry_idx is None:
            continue
        entry = c[entry_idx]
        sl = (rl - cfg['buf'] * atr) if direction == 'long' else (rh + cfg['buf'] * atr)
        sl_dist = abs(entry - sl)
        if cfg['mode'] == 'fade':
            tp = r['pc']
        else:
            tp = entry + cfg['tp'][1] * atr if direction == 'long' else entry - cfg['tp'][1] * atr
        if not valid(direction, entry, sl, tp):
            continue
        trades.append(make_trade(instr, r['date'], direction, bars, entry_idx, entry, sl, tp, cfg['ts'], tag='GC'))
    return trades


# ---------------------------------------------------------------------------
def configs(family):
    out = []
    if family == 'orb':
        for dur in (5, 15, 30):
            latest = {5: 600, 15: 630, 30: 690}[dur]
            for sl in ('mid', 'other', 'edge', ('w', 0.5), ('w', 1.0)):
                for tp in (('w', 0.5), ('w', 1.0), ('w', 2.0), ('r', 1), ('r', 2), 'none'):
                    for ts in (720, 960):
                        out.append({'dur': dur, 'sl': sl, 'tp': tp, 'latest': latest, 'ts': ts})
        # Gap-Filter-Varianten fuer Basis
        for dur in (5, 15, 30):
            latest = {5: 600, 15: 630, 30: 690}[dur]
            for gf in ('with', 'against'):
                for tp in (('w', 1.0), 'none'):
                    out.append({'dur': dur, 'sl': 'mid', 'tp': tp, 'latest': latest, 'ts': 960, 'gapfilter': gf})
    elif family == 'retest':
        for dur in (5, 15, 30):
            latest = {5: 600, 15: 630, 30: 690}[dur]
            for off in (0.0, 0.1):
                for sl in ('mid', 'other', ('w', 0.5)):
                    for tp in (('w', 0.5), ('w', 1.0), ('w', 2.0), ('r', 1), ('r', 2)):
                        for ts in (720, 960):
                            out.append({'dur': dur, 'off': off, 'sl': sl, 'tp': tp, 'latest': latest,
                                        'fill_by': latest + 60, 'ts': ts})
    elif family == 'fade':
        for dur in (5, 15, 30):
            latest = {5: 630, 15: 660, 30: 720}[dur]
            for buf in (0.0, 0.1, 0.25):
                for tp in ('mid', 'other', ('r', 1), ('r', 2)):
                    for mm in (30, 90):
                        for mp in (0.0, 0.2):
                            for ts in (960,):
                                out.append({'dur': dur, 'latest': latest, 'buf': buf, 'tp': tp, 'max_min': mm,
                                            'min_pen': mp, 'ts': ts})
    elif family == 'judas':
        for dur in (5, 15, 30):
            for latest in (630, 690):
                for buf in (0.0, 0.05):
                    for tp in (('r', 1), ('r', 2), ('atr', 0.25), ('atr', 0.5), 'pc', 'on_other'):
                        for mm in (0.0, 0.1):
                            for ts in (720, 960):
                                out.append({'dur': dur, 'latest': latest, 'buf': buf, 'tp': tp, 'minmove': mm, 'ts': ts})
    elif family == 'gap':
        for (gmin, gmax) in ((0.05, 0.15), (0.15, 0.3), (0.3, 0.5), (0.05, 0.3), (0.1, 0.4), (0.5, 9)):
            for eb in (0, 4):
                for sl in (('slk', 1.0), ('slk', 1.5), ('slk', 2.0), ('slatr', 0.25), ('slatr', 0.5)):
                    for frac in (1.0, 0.5):
                        for ts in (630, 720, 960):
                            cfg = {'gmin': gmin, 'gmax': gmax, 'entry_bar': eb, 'frac': frac, 'ts': ts, sl[0]: sl[1]}
                            out.append(cfg)
        # Gap-and-Go bei grossen Gaps
        for (gmin, gmax) in ((0.3, 9), (0.5, 9)):
            for eb in (0, 4, 14):
                for slatr in (0.25, 0.5):
                    for tpk in (0.25, 0.5, 1.0):
                        for ts in (720, 960):
                            out.append({'gmin': gmin, 'gmax': gmax, 'entry_bar': eb, 'go': True, 'slatr': slatr,
                                        'tp': ('atr', tpk), 'ts': ts})
    elif family == 'onsweep':
        for latest in (600, 630, 690):
            for buf in (0.0, 0.05, 0.1):
                for tp in ('mid', 'other', ('r', 1), ('r', 2), ('atr', 0.25)):
                    for mm in (30, 90):
                        for minw in (0.0, 0.5):
                            for ts in (720, 960):
                                out.append({'latest': latest, 'buf': buf, 'tp': tp, 'max_min': mm, 'minw': minw, 'ts': ts})
    elif family == 'onbreak':
        for latest in (600, 630, 690):
            for sl in ('mid', ('atr', 0.1), ('atr', 0.25), ('atr', 0.5)):
                for tp in ('none', ('atr', 0.5), ('atr', 1.0), ('r', 2)):
                    for ts in (720, 960):
                        out.append({'latest': latest, 'sl': sl, 'tp': tp, 'ts': ts})
    elif family == 'gapconf':
        for (gmin, gmax) in ((0.1, 0.4), (0.15, 0.5), (0.3, 9), (0.5, 9)):
            for dur in (5, 15):
                for latest in (615, 645):
                    for buf in (0.0, 0.1):
                        for ts in (720, 960):
                            out.append({'gmin': gmin, 'gmax': gmax, 'dur': dur, 'latest': latest, 'buf': buf, 'mode': 'fade', 'ts': ts})
                            for tpk in (0.5, 1.0):
                                out.append({'gmin': gmin, 'gmax': gmax, 'dur': dur, 'latest': latest, 'buf': buf, 'mode': 'go', 'tp': ('atr', tpk), 'ts': ts})
    elif family == 'orbnarrow':
        for dur in (15, 30):
            latest = {15: 630, 30: 690}[dur]
            for maxw in (0.2, 0.3, 0.4):
                for sl in ('other', ('w', 1.0)):
                    for tp in ('none', ('w', 1.0), ('w', 2.0)):
                        out.append({'dur': dur, 'sl': sl, 'tp': tp, 'latest': latest, 'ts': 960, 'maxw': maxw})
    elif family == 'pos30':
        for dur in (15, 30, 60):
            for thr in (0.67, 0.8, 0.9):
                for ext in (0.0, 0.1, 0.25, 0.5):
                    for sl in ('mid', 'other', ('w', 0.25), ('w', 0.5)):
                        for ts in (720, 960):
                            out.append({'dur': dur, 'thr': thr, 'ext': ext, 'sl': sl, 'ts': ts})
    return out


FAMS = {'orb': fam_orb, 'retest': fam_retest, 'fade': fam_fade, 'judas': fam_judas, 'gap': fam_gap,
        'onsweep': fam_onsweep, 'pos30': fam_pos30, 'onbreak': fam_onbreak, 'gapconf': fam_gapconf,
        'orbnarrow': fam_orb}

if __name__ == '__main__':
  instr_arg = sys.argv[1]
  family = sys.argv[2]
  prefix = sys.argv[3] if len(sys.argv) > 3 else f"{instr_arg}_{family}"
  setup(instr_arg)
  fn = FAMS[family]
  cfgs = configs(family)
  print(f"{instr} {family}: {len(cfgs)} Varianten, {len(info)} Tage")
  rows = []
  all_trades = {}
  for i, cfg in enumerate(cfgs):
      tr = fn(cfg)
      s = summarize(tr, label=str(cfg), verbose=False)
      if s is None or s['n_train'] < 200:
          continue
      s['cfg'] = cfg
      rows.append(s)
      all_trades[str(cfg)] = tr
  rows.sort(key=lambda s: -s['net_train'])
  print(f"{'#':>3} {'N':>5} {'WR':>5} {'RR':>4} {'train':>8} {'test':>8} {'net':>8} {'yrs':>4} {'avg':>6} {'tpw':>4} cfg")
  for k, s in enumerate(rows[:40]):
      print(f"{k:>3} {s['trades']:>5} {s['wr']:>5} {s['avg_rr']:>4} {s['net_train']:>8} {s['net_test']:>8} {s['net']:>8} "
            f"{s['pos_years']:>4} {s['avg_pnl']:>6} {s['tpw']:>4} {'S' if s['survivor'] else ' '} {s['cfg']}")
  print('... schlechteste 5:')
  for s in rows[-5:]:
      print(f"    {s['trades']:>5} {s['wr']:>5} {s['avg_rr']:>4} {s['net_train']:>8} {s['net_test']:>8} {s['pos_years']:>4} {s['cfg']}")
  nsurv = sum(1 for s in rows if s['survivor'])
  print(f"Varianten ausgewertet: {len(rows)}, davon formale Survivor (train>0, test>0, >=4 Jahre, >=300 Trades): {nsurv}")
  # Top-3 nach Train speichern
  for k, s in enumerate(rows[:3]):
      write_csv(all_trades[str(s['cfg'])], RES + f"trades_{prefix}_top{k}.csv")
      print(f"top{k} -> trades_{prefix}_top{k}.csv | per year: {s['per_year']} | mdd {s['mdd']}")
