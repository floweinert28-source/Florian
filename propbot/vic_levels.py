"""Die drei VWAPs und die Opening Range des VIC-Modells.

Rechnet exakt nach, was das TradingView-Skript ``indicators/vic_model.pine``
zeichnet - nicht, was ein Lehrbuch unter diesen Namen verstehen wuerde. Der
Nutzer hat die Semantik ausdruecklich als beabsichtigt bestaetigt:

**NY VWAP**
    Verankert am NY-Open (09:30 New York), existiert nur waehrend der
    RTH-Session 09:30-16:00, ausserhalb NaN.

**Overnight VWAP**
    Verankert am Beginn des Futures-Handelstages (18:00 New York am Vorabend)
    und laeuft ohne Reset durch die komplette RTH-Session - faktisch ein
    Ganztages-VWAP, kein reiner Nacht-Wert.

**PD NY VWAP**
    Verankert am NY-Open des *Vortags* und akkumuliert seitdem weiter. Der
    Anker rollt erst beim NY-Close (16:00) auf die gerade beendete Session.
    Waehrend der heutigen RTH ist das also ein laufender ~31-Stunden-VWAP.
    Deshalb driftet die Linie intraday - das ist Absicht, kein Fehler.

**Opening Range**
    High/Low der Kerzen 09:30:00-09:44:59 New York, ab 09:45 eingefroren.

Alle Gewichte sind hlc3 x Volumen wie im Pine-Skript. Zur Ehrlichkeit: unser
Volumen ist das Dukascopy-Tick-Volumen, ein Proxy - die frueher gemessene
Abweichung der Gewichtung liegt bei wenigen Punkten je Session. Fuer Regeln,
die auf Beruehrung/Bruch dieser Linien reagieren, ist das Rauschen, das man
kennen muss, aber kein Showstopper.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

__all__ = ["berechne_vic_level", "ET"]

ET = "America/New_York"

#: Beginn des Futures-Handelstages in New Yorker Zeit (CME: 18:00 ET).
_HANDELSTAG_START_STUNDE = 18

#: RTH-Fenster in Minuten seit Mitternacht ET.
_RTH_START = 9 * 60 + 30
_RTH_ENDE = 16 * 60
_OR_ENDE = 9 * 60 + 45


def berechne_vic_level(frame: pd.DataFrame) -> pd.DataFrame:
    """Haengt die VIC-Spalten an eine Kopie des M1-Datensatzes.

    Neue Spalten: ``ny_vwap``, ``ov_vwap``, ``pd_vwap``, ``or_high``,
    ``or_low``, ``or_locked``, ``minute_et``, ``rth_tag`` (Session-Datum als
    Ordinalzahl, ausserhalb der RTH -1).
    """
    if frame.index.tz is None:
        raise ValueError("Index muss zeitzonenbewusst sein (UTC erwartet).")

    out = frame.copy()
    et_index = out.index.tz_convert(ET)
    minute_et = np.asarray(et_index.hour, dtype=np.int64) * 60 + np.asarray(
        et_index.minute, dtype=np.int64
    )
    out["minute_et"] = minute_et

    typisch = (out["high"] + out["low"] + out["close"]) / 3.0
    volumen = out["volume"].to_numpy(dtype=float)
    # Kerzen ohne Volumen duerfen den VWAP nicht verschieben, sollen ihn aber
    # auch nicht auf NaN reissen: Gewicht 0.
    volumen = np.where(np.isfinite(volumen) & (volumen > 0), volumen, 0.0)
    pv = typisch.to_numpy(dtype=float) * volumen

    cum_pv = np.concatenate(([0.0], np.cumsum(pv)))
    cum_v = np.concatenate(([0.0], np.cumsum(volumen)))

    in_rth = (minute_et >= _RTH_START) & (minute_et < _RTH_ENDE)
    et_datum = np.asarray(et_index.date)
    n = len(out)

    # Session-Kennung: Ordinalzahl des ET-Datums, nur innerhalb der RTH.
    tag_ordinal = np.array([d.toordinal() for d in et_datum], dtype=np.int64)
    rth_tag = np.where(in_rth, tag_ordinal, -1)
    out["rth_tag"] = rth_tag

    # ------------------------------------------------------------- NY VWAP
    ny = np.full(n, np.nan)
    session_starts: list[int] = []  # Index der ersten RTH-Kerze je Tag
    session_enden: list[int] = []  # Index der ersten Kerze NACH der Session
    i = 0
    while i < n:
        if in_rth[i] and (i == 0 or not in_rth[i - 1] or tag_ordinal[i] != tag_ordinal[i - 1]):
            start = i
            j = i
            while j < n and in_rth[j] and tag_ordinal[j] == tag_ordinal[start]:
                j += 1
            session_starts.append(start)
            session_enden.append(j)
            seg_pv = cum_pv[start + 1 : j + 1] - cum_pv[start]
            seg_v = cum_v[start + 1 : j + 1] - cum_v[start]
            with np.errstate(invalid="ignore", divide="ignore"):
                ny[start:j] = np.where(seg_v > 0, seg_pv / seg_v, np.nan)
            i = j
        else:
            i += 1
    out["ny_vwap"] = ny

    # ------------------------------------------------- Overnight (Handelstag)
    # Handelstag-Kennung: ET-Zeit plus (24 - 18) Stunden, dann Datum.
    handelstag = np.array(
        [d.toordinal() for d in (et_index + pd.Timedelta(hours=24 - _HANDELSTAG_START_STUNDE)).date],
        dtype=np.int64,
    )
    ov = np.full(n, np.nan)
    grenzen = np.flatnonzero(np.diff(handelstag)) + 1
    grenzen = np.concatenate(([0], grenzen, [n]))
    for a, b in zip(grenzen[:-1], grenzen[1:]):
        seg_pv = cum_pv[a + 1 : b + 1] - cum_pv[a]
        seg_v = cum_v[a + 1 : b + 1] - cum_v[a]
        with np.errstate(invalid="ignore", divide="ignore"):
            ov[a:b] = np.where(seg_v > 0, seg_pv / seg_v, np.nan)
    out["ov_vwap"] = ov

    # ----------------------------------------------------------- PD NY VWAP
    # Anker je Kerze: NY-Open der letzten Session, deren Close (Sessionende)
    # bereits vergangen ist. Rollt also exakt wie im Pine-Skript um 16:00.
    pd_vwap = np.full(n, np.nan)
    if session_enden:
        enden_arr = np.array(session_enden)
        starts_arr = np.array(session_starts)
        positionen = np.arange(n)
        # Fuer Kerze t: Anzahl Sessions, deren Ende <= t liegt.
        k = np.searchsorted(enden_arr, positionen, side="right")
        gueltig = k > 0
        anker = np.where(gueltig, starts_arr[np.clip(k - 1, 0, None)], 0)
        seg_pv = cum_pv[positionen + 1] - cum_pv[anker]
        seg_v = cum_v[positionen + 1] - cum_v[anker]
        with np.errstate(invalid="ignore", divide="ignore"):
            werte = np.where(seg_v > 0, seg_pv / seg_v, np.nan)
        pd_vwap = np.where(gueltig, werte, np.nan)
    out["pd_vwap"] = pd_vwap

    # -------------------------------------------------------- Opening Range
    or_high = np.full(n, np.nan)
    or_low = np.full(n, np.nan)
    or_locked = np.zeros(n, dtype=bool)
    in_or = in_rth & (minute_et < _OR_ENDE)
    highs = out["high"].to_numpy(dtype=float)
    lows = out["low"].to_numpy(dtype=float)
    for start, ende in zip(session_starts, session_enden):
        h = np.nan
        l = np.nan
        fertig = False
        for t in range(start, ende):
            if in_or[t] and not fertig:
                h = highs[t] if np.isnan(h) else max(h, highs[t])
                l = lows[t] if np.isnan(l) else min(l, lows[t])
            elif not np.isnan(h):
                fertig = True
            or_high[t] = h
            or_low[t] = l
            or_locked[t] = fertig
    out["or_high"] = or_high
    out["or_low"] = or_low
    out["or_locked"] = or_locked
    return out
