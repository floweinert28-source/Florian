"""Gemeinsame Hilfsfunktionen fuer die Opening-Range-Forschung (09:30 NY).

Konservative Auswertung:
- Entry-Bar: nur SL wird gewertet (kein TP im Entry-Bar).
- Spaetere Bars: SL VOR TP.
- Limit-Fills nur durch spaeteren Bar (Touch = Fill).
- Time-Stop: Exit zum Close des Bars mit mod >= time_stop (erster solcher Bar).
- Kosten pro Roundtrip in Punkten abgezogen, PnL in USD mit 1 Kontrakt.
"""
import csv
import datetime as dt
import os
import sys
from bisect import bisect_left
from collections import defaultdict

sys.path.insert(0, '/home/user/Florian/backtest')
from sweep_reclaim_backtest import load_days  # noqa: E402

BASE = '/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/'
RES = BASE + 'research/orb_open/'
INSTR = {
    'NQ': {'dir': BASE + 'data', 'cost': 0.75, 'pv': 20.0},
    'ES': {'dir': BASE + 'data_es', 'cost': 0.4, 'pv': 50.0},
}
TRAIN_END = dt.date(2024, 12, 31)
OPEN = 570   # 09:30
RTH_END = 960  # 16:00

_cache = {}


def get_days(instr):
    if instr not in _cache:
        _cache[instr] = load_days(INSTR[instr]['dir'])
    return _cache[instr]


def trading_days(days):
    """Sortierte Liste der Tage mit Bar um 09:30 und mind. 300 RTH-Bars."""
    out = []
    for d in sorted(days):
        if d.weekday() >= 5:
            continue
        mods, o, c, l, h = days[d]
        a = bisect_left(mods, OPEN)
        if a < len(mods) and mods[a] == OPEN:
            b = bisect_left(mods, RTH_END)
            if b - a >= 300:
                # Feiertage / halbe Tage: Dukascopy fuellt flache Bars (H==L)
                flat = sum(1 for i in range(a, b) if h[i] == l[i])
                if flat < 30:
                    out.append(d)
    return out


def prev_close(days, tdays, i):
    """Close des letzten Bars vor 16:00 des vorherigen Handelstags."""
    if i == 0:
        return None
    d = tdays[i - 1]
    mods, o, c, l, h = days[d]
    b = bisect_left(mods, RTH_END)
    if b == 0:
        return None
    return c[b - 1]


def overnight_range(days, tdays, i):
    """Overnight-Range: 18:00 Vortag (Kalender) bis 09:29 heute. Liefert (hi, lo) oder None."""
    d = tdays[i]
    mods, o, c, l, h = days[d]
    a = bisect_left(mods, OPEN)
    his = h[:a]
    los = l[:a]
    pd = d - dt.timedelta(days=1)
    if pd in days:
        pm, po, pc, pl, ph = days[pd]
        k = bisect_left(pm, 18 * 60)
        his = ph[k:] + his
        los = pl[k:] + los
    if len(his) < 300:
        return None
    return max(his), min(los)


def range_hl(bars, t0, t1):
    """Hoch/Tief der Bars mit t0 <= mod < t1. Liefert (hi, lo, idx_a, idx_b) oder None."""
    mods, o, c, l, h = bars
    a = bisect_left(mods, t0)
    b = bisect_left(mods, t1)
    if b - a < (t1 - t0) * 0.8:
        return None
    return max(h[a:b]), min(l[a:b]), a, b


def simulate(bars, entry_idx, direction, entry, sl, tp, time_stop=RTH_END,
             entry_bar_sl=True):
    """Konservative Trade-Simulation. Liefert (result, exit_price, exit_idx).
    result in {'SL','TP','TS'}.  TS = Time-Stop zum Close.
    entry_bar_sl: im Entry-Bar SL pruefen (True fuer Market-Entries zum Close;
    fuer Limit-Fills ebenfalls True, da Bar-Reihenfolge unbekannt)."""
    mods, o, c, l, h = bars
    m = len(mods)
    j = entry_idx
    if entry_bar_sl:
        if direction == 'long' and l[j] <= sl:
            return 'SL', sl, j
        if direction == 'short' and h[j] >= sl:
            return 'SL', sl, j
    j += 1
    while j < m:
        if mods[j] >= time_stop:
            return 'TS', c[j], j
        if direction == 'long':
            if l[j] <= sl:
                return 'SL', sl, j
            if tp is not None and h[j] >= tp:
                return 'TP', tp, j
        else:
            if h[j] >= sl:
                return 'SL', sl, j
            if tp is not None and l[j] <= tp:
                return 'TP', tp, j
        j += 1
    return 'TS', c[m - 1], m - 1


def make_trade(instr, day, direction, bars, entry_idx, entry, sl, tp, time_stop=RTH_END,
               tag=''):
    res, px, xi = simulate(bars, entry_idx, direction, entry, sl, tp, time_stop)
    pts = (px - entry) if direction == 'long' else (entry - px)
    cfg = INSTR[instr]
    pnl = (pts - cfg['cost']) * cfg['pv']
    mods = bars[0]
    return {'date': day, 'dir': direction, 'entry_time': f"{mods[entry_idx]//60:02d}:{mods[entry_idx]%60:02d}",
            'entry': round(entry, 2), 'sl': round(sl, 2), 'tp': round(tp, 2) if tp is not None else '',
            'result': res, 'pnl_usd': round(pnl, 2), 'pts': pts,
            'sl_dist': abs(entry - sl), 'tp_dist': abs(tp - entry) if tp is not None else 0.0,
            'exit_time': f"{mods[xi]//60:02d}:{mods[xi]%60:02d}", 'tag': tag}


def summarize(trades, label='', verbose=True):
    n = len(trades)
    if n == 0:
        if verbose:
            print(f"{label}: keine Trades")
        return None
    wins = sum(1 for t in trades if t['pnl_usd'] > 0)
    tpn = sum(1 for t in trades if t['result'] == 'TP')
    sln = sum(1 for t in trades if t['result'] == 'SL')
    tsn = n - tpn - sln
    wr = wins / n * 100
    net = sum(t['pnl_usd'] for t in trades)
    train = [t for t in trades if t['date'] <= TRAIN_END]
    test = [t for t in trades if t['date'] > TRAIN_END]
    net_tr = sum(t['pnl_usd'] for t in train)
    net_te = sum(t['pnl_usd'] for t in test)
    py = defaultdict(float)
    for t in trades:
        py[t['date'].year] += t['pnl_usd']
    pos_years = sum(1 for v in py.values() if v > 0)
    avg_rr = sum(t['tp_dist'] / t['sl_dist'] for t in trades if t['sl_dist'] > 0 and t['tp_dist'] > 0)
    nrr = sum(1 for t in trades if t['sl_dist'] > 0 and t['tp_dist'] > 0)
    avg_rr = avg_rr / nrr if nrr else 0.0
    # Drawdown
    eq = 0.0
    peak = 0.0
    mdd = 0.0
    for t in sorted(trades, key=lambda t: (t['date'], t['entry_time'])):
        eq += t['pnl_usd']
        peak = max(peak, eq)
        mdd = min(mdd, eq - peak)
    weeks = max(1, (max(t['date'] for t in trades) - min(t['date'] for t in trades)).days / 7)
    surv = net_tr > 0 and net_te > 0 and pos_years >= 4 and n >= 300
    s = {'label': label, 'trades': n, 'wr': round(wr, 1), 'tp': tpn, 'sl': sln, 'ts': tsn,
         'avg_rr': round(avg_rr, 2), 'net': round(net), 'net_train': round(net_tr),
         'net_test': round(net_te), 'n_train': len(train), 'n_test': len(test),
         'pos_years': f"{pos_years}/{len(py)}",
         'per_year': ' '.join(f"{y}:{v:+.0f}" for y, v in sorted(py.items())),
         'mdd': round(mdd), 'tpw': round(n / weeks, 2), 'survivor': surv,
         'avg_pnl': round(net / n, 1)}
    if verbose:
        print(f"{label:<55} N={n:>5} WR={wr:5.1f}% (TP{tpn}/SL{sln}/TS{tsn}) RR={avg_rr:.2f} "
              f"net={net:+9.0f} train={net_tr:+8.0f} test={net_te:+8.0f} yrs={s['pos_years']} "
              f"avg={net/n:+.1f} mdd={mdd:.0f} {'SURV' if surv else ''}")
        print(f"      per year: {s['per_year']}")
    return s


def write_csv(trades, path):
    cols = ['date', 'dir', 'entry_time', 'entry', 'sl', 'tp', 'result', 'pnl_usd', 'exit_time', 'tag']
    with open(path, 'w', newline='') as f:
        w = csv.DictWriter(f, fieldnames=cols, extrasaction='ignore')
        w.writeheader()
        for t in trades:
            w.writerow(t)
