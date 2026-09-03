"""HTF-FVG Research Library (pure Python).

Konventionen:
- Globaler 1-min-Stream ueber alle Tage (NY-Zeit), Index i.
- "live" Bar: Handelszeit (Mo-Fr 00:00-16:15, Mo-Fr >= 18:00, So >= 18:00) und Tag nicht komplett flat.
- HTF-Kerzen (15m/1h/4h) nur aus abgeschlossenen 1-min-Bars; Kerze gilt ab dem Index ihres letzten 1-min-Bars
  als abgeschlossen (confirm_idx). Ein FVG ist erst ab confirm_idx+1 handelbar.
- Simulation: Entry-Bar nur SL (kein TP); danach SL vor TP im selben Bar; Time-Stop 16:10 NY (Close).
- Kosten: NQ 0.75 Pkt (20 USD/Pkt), ES 0.4 Pkt (50 USD/Pkt).
"""
import csv
import datetime as dt
import os
import sys
from bisect import bisect_left, bisect_right
from collections import defaultdict

sys.path.insert(0, '/home/user/Florian/backtest')
from sweep_reclaim_backtest import load_days  # noqa: E402

SCRATCH = '/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad'
DATA = {'NQ': SCRATCH + '/data', 'ES': SCRATCH + '/data_es'}
COST_PTS = {'NQ': 0.75, 'ES': 0.4}
MULT = {'NQ': 20.0, 'ES': 50.0}
TRAIN_END = dt.date(2024, 12, 31)
SESSION_END_MOD = 16 * 60 + 10   # 16:10 NY Time-Stop
LAST_ENTRY_MOD = 15 * 60 + 40    # keine Entries nach 15:40
EVENING_MOD = 18 * 60


class Stream:
    pass


def build_stream(instr):
    days = load_days(DATA[instr])
    s = Stream()
    s.instr = instr
    s.o, s.h, s.l, s.c = [], [], [], []
    s.mod, s.date, s.absmin, s.live = [], [], [], []
    base = min(days).toordinal()
    for day in sorted(days):
        mods, opens, closes, lows, highs = days[day]
        wd = day.weekday()
        n = len(mods)
        flat = sum(1 for i in range(n) if highs[i] == lows[i])
        day_dead = (n - flat) < 60          # Feiertag / Wochenende
        dord = (day.toordinal() - base) * 1440
        for i in range(n):
            m = mods[i]
            if wd == 5:
                lv = False
            elif wd == 6:
                lv = m >= EVENING_MOD
            else:
                lv = (m < 16 * 60 + 15) or (m >= EVENING_MOD and wd != 4)
            if day_dead:
                lv = False
            s.o.append(opens[i]); s.h.append(highs[i]); s.l.append(lows[i]); s.c.append(closes[i])
            s.mod.append(m); s.date.append(day); s.absmin.append(dord + m); s.live.append(lv)
    s.n = len(s.o)
    # Session-Ende-Index je Bar: erster Bar j>=i mit mod>=16:10 am selben Tag, sonst naechster Tag
    s.sess_end = [0] * s.n
    nxt = s.n - 1
    for i in range(s.n - 1, -1, -1):
        if s.mod[i] >= SESSION_END_MOD and s.mod[i] < EVENING_MOD:
            # Kandidat: der ERSTE Bar >= 16:10 dieses Tages -> wir laufen rueckwaerts, also ueberschreiben
            nxt = i
        s.sess_end[i] = nxt
    return s


def build_candles(s, tf, offset=0, min_frac=0.5):
    """HTF-Kerzen aus Live-Bars. tf in Minuten, offset in Minuten (z.B. 4h ab 18:00 -> offset 18*60).
    Liefert Liste von Dicts: id, o,h,l,c, start_idx, end_idx (=confirm_idx), nbars."""
    candles = []
    cur = None
    for i in range(s.n):
        if not s.live[i]:
            continue
        cid = (s.absmin[i] - offset) // tf
        if cur is None or cid != cur['id']:
            if cur is not None:
                candles.append(cur)
            cur = {'id': cid, 'o': s.o[i], 'h': s.h[i], 'l': s.l[i], 'c': s.c[i],
                   'start_idx': i, 'end_idx': i, 'nbars': 1}
        else:
            if s.h[i] > cur['h']:
                cur['h'] = s.h[i]
            if s.l[i] < cur['l']:
                cur['l'] = s.l[i]
            cur['c'] = s.c[i]
            cur['end_idx'] = i
            cur['nbars'] += 1
    if cur is not None:
        candles.append(cur)
    min_bars = int(tf * min_frac)
    return [c for c in candles if c['nbars'] >= min_bars and c['h'] > c['l']]


def find_fvgs(candles, max_id_gap=3):
    """3-Kerzen-FVGs. Rueckgabe: Liste Dicts mit dir (+1 bull / -1 bear), bot, top, height,
    confirm_idx (letzter 1-min-Bar der 3. Kerze), imp_ext (Impuls-Extrem = Ziel 'next level'),
    c1_ext (Gegenextrem der 1. Kerze)."""
    out = []
    for k in range(2, len(candles)):
        c1, c2, c3 = candles[k - 2], candles[k - 1], candles[k]
        if c3['id'] - c1['id'] > max_id_gap:   # nicht ueber lange Luecken (Wochenende) hinweg
            continue
        if c3['l'] > c1['h']:
            out.append({'dir': +1, 'bot': c1['h'], 'top': c3['l'], 'height': c3['l'] - c1['h'],
                        'confirm_idx': c3['end_idx'], 'form_idx': c1['start_idx'],
                        'imp_ext': max(c2['h'], c3['h']), 'c1_ext': c1['l'],
                        'c2_range': c2['h'] - c2['l']})
        elif c3['h'] < c1['l']:
            out.append({'dir': -1, 'bot': c3['h'], 'top': c1['l'], 'height': c1['l'] - c3['h'],
                        'confirm_idx': c3['end_idx'], 'form_idx': c1['start_idx'],
                        'imp_ext': min(c2['l'], c3['l']), 'c1_ext': c1['h'],
                        'c2_range': c2['h'] - c2['l']})
    return out


def first_touch(s, f, max_age_bars):
    """Erster Live-Bar nach confirm_idx, der in das FVG hineinhandelt (bull: low <= top; bear: high >= bot).
    Liefert (touch_idx, through) oder None. through = Bar handelt im selben Bar durch das ganze Gap."""
    i0 = f['confirm_idx'] + 1
    i1 = min(s.n, i0 + max_age_bars)
    if f['dir'] > 0:
        top, bot = f['top'], f['bot']
        for i in range(i0, i1):
            if s.l[i] <= top:
                if not s.live[i]:
                    return None
                return i, s.l[i] < bot
    else:
        top, bot = f['top'], f['bot']
        for i in range(i0, i1):
            if s.h[i] >= bot:
                if not s.live[i]:
                    return None
                return i, s.h[i] > top
    return None


def simulate(s, direction, entry_idx, entry, sl, tp, exit_idx):
    """Konservativ. direction +1 long / -1 short. Entry-Bar: nur SL. Danach SL vor TP.
    exit_idx: Time-Stop-Bar (Exit zum Close), falls vorher nichts getroffen.
    Rueckgabe (result, pts, exit_i)."""
    if exit_idx >= s.n:
        exit_idx = s.n - 1
    i = entry_idx
    if direction > 0:
        if s.l[i] <= sl:
            return 'SL', sl - entry, i
        for j in range(i + 1, exit_idx + 1):
            if s.l[j] <= sl:
                return 'SL', sl - entry, j
            if s.h[j] >= tp:
                return 'TP', tp - entry, j
        return 'EOD', s.c[exit_idx] - entry, exit_idx
    else:
        if s.h[i] >= sl:
            return 'SL', entry - sl, i
        for j in range(i + 1, exit_idx + 1):
            if s.h[j] >= sl:
                return 'SL', entry - sl, j
            if s.l[j] <= tp:
                return 'TP', entry - tp, j
        return 'EOD', entry - s.c[exit_idx], exit_idx


def dedupe_overlaps(trades):
    """Nur eine Position gleichzeitig: chronologisch nach entry_idx, Trade nur wenn vorherige beendet."""
    trades.sort(key=lambda t: (t['entry_idx'], t['exit_idx']))
    out = []
    busy_until = -1
    for t in trades:
        if t['entry_idx'] > busy_until:
            out.append(t)
            busy_until = t['exit_idx']
    return out


def finalize(s, trades):
    cost = COST_PTS[s.instr]
    mult = MULT[s.instr]
    for t in trades:
        t['pnl_usd'] = (t['pts'] - cost) * mult
        t['date'] = s.date[t['entry_idx']]
        t['entry_time'] = '%02d:%02d' % (s.mod[t['entry_idx']] // 60, s.mod[t['entry_idx']] % 60)
        t['train'] = t['date'] <= TRAIN_END
    return trades


def summarize(trades, label=''):
    """Kennzahlen gesamt / train / test / pro Jahr."""
    def block(ts):
        n = len(ts)
        if n == 0:
            return {'n': 0, 'net': 0.0, 'wr': 0.0, 'rr': 0.0, 'be': 0.0, 'edge': 0.0, 'pf': 0.0}
        tp = sum(1 for t in ts if t['result'] == 'TP')
        sl = sum(1 for t in ts if t['result'] == 'SL')
        dec = tp + sl
        wr = tp / dec * 100 if dec else 0.0
        rr = sum(t['rr'] for t in ts) / n
        be = 100 / (1 + rr) if rr > 0 else 0.0
        net = sum(t['pnl_usd'] for t in ts)
        gp = sum(t['pnl_usd'] for t in ts if t['pnl_usd'] > 0)
        gl = -sum(t['pnl_usd'] for t in ts if t['pnl_usd'] < 0)
        return {'n': n, 'net': net, 'wr': wr, 'rr': rr, 'be': be, 'edge': wr - be,
                'pf': gp / gl if gl > 0 else 99.0}
    tr = [t for t in trades if t['train']]
    te = [t for t in trades if not t['train']]
    per_year = defaultdict(float)
    for t in trades:
        per_year[t['date'].year] += t['pnl_usd']
    years = {y: round(v) for y, v in sorted(per_year.items())}
    pos_years = sum(1 for v in per_year.values() if v > 0)
    return {'label': label, 'all': block(trades), 'train': block(tr), 'test': block(te),
            'years': years, 'pos_years': pos_years, 'nyears': len(per_year),
            'max_dd': max_drawdown(trades)}


def max_drawdown(trades):
    eq = 0.0
    peak = 0.0
    dd = 0.0
    for t in sorted(trades, key=lambda t: t['entry_idx']):
        eq += t['pnl_usd']
        if eq > peak:
            peak = eq
        if peak - eq > dd:
            dd = peak - eq
    return dd


def fmt(sm):
    a, tr, te = sm['all'], sm['train'], sm['test']
    return (f"{sm['label']:<40} N={a['n']:5d} WR={a['wr']:5.1f} RR={a['rr']:4.2f} BE={a['be']:5.1f} "
            f"edge={a['edge']:+5.1f} net={a['net']:+9.0f} | TRAIN n={tr['n']:4d} WR={tr['wr']:5.1f} net={tr['net']:+8.0f} "
            f"| TEST n={te['n']:4d} WR={te['wr']:5.1f} net={te['net']:+8.0f} | J+ {sm['pos_years']}/{sm['nyears']} "
            f"{sm['years']}")


def write_trades_csv(path, trades):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', newline='') as f:
        w = csv.writer(f)
        w.writerow(['date', 'dir', 'entry_time', 'entry', 'sl', 'tp', 'result', 'pnl_usd', 'tf', 'note'])
        for t in sorted(trades, key=lambda t: t['entry_idx']):
            w.writerow([t['date'].isoformat(), 'long' if t['dir'] > 0 else 'short', t['entry_time'],
                        round(t['entry'], 2), round(t['sl'], 2), round(t['tp'], 2), t['result'],
                        round(t['pnl_usd'], 2), t.get('tf', ''), t.get('note', '')])


def tod_bucket(mod):
    h = mod // 60
    if h < 2:
        return 'asia_00_02'
    if h < 5:
        return 'ldn_02_05'
    if h < 8:
        return 'pre_05_08'
    if mod < 9 * 60 + 30:
        return 'pre_08_0930'
    if h < 11:
        return 'ny_0930_11'
    if h < 13:
        return 'ny_11_13'
    if h < 16:
        return 'ny_13_16'
    return 'eve_18_24'


_STREAM_CACHE = {}


def get_stream(instr):
    if instr not in _STREAM_CACHE:
        _STREAM_CACHE[instr] = build_stream(instr)
    return _STREAM_CACHE[instr]
