"""Loader mit Volumen (bisher ungenutzt): date -> (mods, o, c, lo, hi, vol)"""
import datetime as dt, glob, lzma, os, pickle, struct
from collections import defaultdict
from zoneinfo import ZoneInfo
NY = ZoneInfo("America/New_York"); UTC = ZoneInfo("UTC")
def load_days_vol(data_dir):
    cache = os.path.join(data_dir, "bars_cache_vol.pkl")
    if os.path.exists(cache):
        return pickle.load(open(cache, "rb"))
    by = defaultdict(lambda: ([], [], [], [], [], []))
    for path in sorted(glob.glob(os.path.join(data_dir, "*.bi5"))):
        d0 = dt.date.fromisoformat(os.path.basename(path)[:-4]); raw = open(path, "rb").read()
        if not raw: continue
        data = lzma.decompress(raw); base = dt.datetime(d0.year, d0.month, d0.day, tzinfo=UTC)
        for i in range(len(data) // 24):
            off, o, c, lo, hi, v = struct.unpack(">IIIIIf", data[i*24:(i+1)*24])
            ny = (base + dt.timedelta(seconds=off)).astimezone(NY); r = by[ny.date()]
            r[0].append(ny.hour*60+ny.minute); r[1].append(o/1000); r[2].append(c/1000); r[3].append(lo/1000); r[4].append(hi/1000); r[5].append(v)
    days = {}
    for d, cols in by.items():
        if not (dt.date(2021,9,1) <= d <= dt.date(2026,8,31)): continue
        order = sorted(range(len(cols[0])), key=lambda i: cols[0][i])
        days[d] = tuple([col[i] for i in order] for col in cols)
    pickle.dump(days, open(cache, "wb")); return days
