"""Session-Interaktionen: gemeinsame Basis.

Trading-Tag D (NY-Kalendertag, Mo-Fr) = Bars des Vortags ab 09:30 NY (t = mod-1440,
also negativ) + alle Bars von D (t = mod). Damit sind Vortags-RTH (PDH/PDL) und die
Asia-Session (18:00 Vortag .. 02:00 D) als zusammenhaengende Fenster verfuegbar.

Sessions in "Session-Minuten" t (NY):
  PDRTH  -870..-480   Vortag 09:30-16:00
  ASIA   -360..120    18:00-02:00
  LON     120..300    02:00-05:00
  PRE     300..570    05:00-09:30
  ON     -360..570    18:00-09:30 (Overnight gesamt)
  OPEN    570..600    09:30-10:00
  OPEN15  570..585    09:30-09:45
  AM      600..720    10:00-12:00
  LUNCH   720..810    12:00-13:30
  PM      810..960    13:30-16:00
  RTH     570..960    09:30-16:00

Kein Look-Ahead: Level werden nur aus Sessions gebildet, die VOR dem Sweep-Fenster
abgeschlossen sind. Alle Auswertungen arbeiten mit abgeschlossenen Bars.
"""

import datetime as dt
import os
import pickle
import sys
from bisect import bisect_left

sys.path.insert(0, "/home/user/Florian/backtest")
from sweep_reclaim_backtest import load_days  # noqa: E402

SCRATCH = "/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad"
DATA = {"NQ": SCRATCH + "/data", "ES": SCRATCH + "/data_es"}
COST_PTS = {"NQ": 0.75, "ES": 0.4}
USD_PER_PT = {"NQ": 20.0, "ES": 50.0}

TRAIN_END = dt.date(2024, 12, 31)
TEST_START = dt.date(2025, 1, 1)

SESS = {
    "PDRTH": (-870, -480),
    "ASIA": (-360, 120),
    "LON": (120, 300),
    "PRE": (300, 570),
    "ON": (-360, 570),
    "OPEN": (570, 600),
    "OPEN15": (570, 585),
    "AM": (600, 720),
    "LUNCH": (720, 810),
    "PM": (810, 960),
    "RTH": (570, 960),
}
MIN_COVERAGE = 0.87


def is_train(day):
    return day <= TRAIN_END


def build_tdays(instr):
    """Liefert dict: date -> (t, o, c, l, h) fuer Trading-Tage mit Live-Daten."""
    cache = os.path.join(DATA[instr], "tdays_cache.pkl")
    if os.path.exists(cache):
        with open(cache, "rb") as f:
            return pickle.load(f)
    days = load_days(DATA[instr])
    out = {}
    for day in sorted(days):
        if day.weekday() > 4:
            continue
        prev = day - dt.timedelta(days=1)
        if prev not in days:
            continue
        pm, po, pc, pl, ph = days[prev]
        m, o, c, l, h = days[day]
        a = bisect_left(pm, 570)
        t = [x - 1440 for x in pm[a:]] + list(m)
        oo = list(po[a:]) + list(o)
        cc = list(pc[a:]) + list(c)
        ll = list(pl[a:]) + list(l)
        hh = list(ph[a:]) + list(h)
        # Live-Bars (High != Low) statt Filler pruefen: RTH und Asia muessen live sein
        def live_frac(t0, t1):
            i0 = bisect_left(t, t0)
            i1 = bisect_left(t, t1)
            if i1 - i0 < (t1 - t0) * MIN_COVERAGE:
                return 0.0
            n_live = sum(1 for i in range(i0, i1) if hh[i] != ll[i])
            return n_live / (t1 - t0)
        if live_frac(570, 960) < 0.85:
            continue
        if live_frac(-360, 120) < 0.6:
            continue
        if live_frac(120, 570) < 0.85:
            continue
        # Flache Filler-Bars (16:15-18:00) liegen ausserhalb aller Fenster -> harmlos, bleiben drin
        out[day] = (t, oo, cc, ll, hh)
    with open(cache, "wb") as f:
        pickle.dump(out, f)
    return out


def levels_for_day(t, l, h):
    """dict name -> (H, L, idx_end) fuer jede Session (nur wenn Session abgedeckt)."""
    lv = {}
    for name, (s0, s1) in SESS.items():
        i0 = bisect_left(t, s0)
        i1 = bisect_left(t, s1)
        if i1 - i0 < (s1 - s0) * 0.6:
            continue
        lv[name] = (max(h[i0:i1]), min(l[i0:i1]), i1)
    return lv


def next_touch(vals, level, above):
    """nt[i] = kleinster j >= i mit vals[j] >= level (above) bzw. <= level. len = n+1, nt[n] = n."""
    n = len(vals)
    nt = [n] * (n + 1)
    nxt = n
    if above:
        for i in range(n - 1, -1, -1):
            if vals[i] >= level:
                nxt = i
            nt[i] = nxt
    else:
        for i in range(n - 1, -1, -1):
            if vals[i] <= level:
                nxt = i
            nt[i] = nxt
    return nt


def year_stats(trades):
    """trades: list of dict with 'day','pnl'. -> dict year -> (n, net)."""
    ys = {}
    for tr in trades:
        y = tr["day"].year
        n, net = ys.get(y, (0, 0.0))
        ys[y] = (n + 1, net + tr["pnl"])
    return ys


def max_drawdown(trades):
    peak = 0.0
    eq = 0.0
    mdd = 0.0
    for tr in sorted(trades, key=lambda x: (x["day"], x["entry_t"])):
        eq += tr["pnl"]
        peak = max(peak, eq)
        mdd = min(mdd, eq - peak)
    return mdd
