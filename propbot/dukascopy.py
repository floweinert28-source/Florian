"""Historische Kursdaten von Dukascopy laden.

Dukascopy stellt fertige Minutenkerzen oeffentlich bereit - je Handelstag eine
LZMA-gepackte Datei mit 1.440 Kerzen (rund 17 KB). Fuenf Jahre eines Symbols
sind damit etwa 1.300 Dateien und 25 MB, statt mehrerer Gigabyte Tickdaten.

Dateiformat (je Kerze 24 Byte, Big Endian):

    uint32  Sekunden seit 00:00 UTC des Tages
    int32   Open, Close, Low, High  (ganzzahlig, geteilt durch 10**digits)
    float32 Volumen

Wichtige Einschraenkung, die im Report auch so benannt gehoert: Dukascopy
liefert **CFD-Kurse auf den Nasdaq-100**, nicht den CME-Future NQ selbst. Der
CFD wird aus dem Future gepreist und laeuft praktisch deckungsgleich, aber er
kennt keine Kontraktrollen und hat eigene Handelszeiten am Rand. Fuer
Strategieentwicklung ist das eine brauchbare Grundlage, fuer die letzte
Feinabstimmung der Ausfuehrung nicht - dafuer braucht es Daten des eigenen
Brokers. :func:`propbot.validate.compare_sources` prueft die Abweichung
gegen echte NQ-Futuresdaten.
"""

from __future__ import annotations

import lzma
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

import numpy as np
import pandas as pd

__all__ = ["SYMBOLE", "lade_kerzen", "tagesdatei"]

_BASIS = "https://datafeed.dukascopy.com/datafeed"
_KOPF = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64)"}
_SATZ = np.dtype(
    [("t", ">u4"), ("o", ">i4"), ("c", ">i4"), ("l", ">i4"), ("h", ">i4"), ("v", ">f4")]
)

#: Symbolname -> (Dukascopy-Kuerzel, Nachkommastellen)
SYMBOLE: dict[str, tuple[str, int]] = {
    "NQ": ("USATECHIDXUSD", 3),
    "NAS100": ("USATECHIDXUSD", 3),
    "ES": ("USA500IDXUSD", 3),
    "SPX500": ("USA500IDXUSD", 3),
    "YM": ("USA30IDXUSD", 3),
    "GER40": ("DEUIDXEUR", 3),
    "EURUSD": ("EURUSD", 5),
    "GBPUSD": ("GBPUSD", 5),
    "XAUUSD": ("XAUUSD", 3),
}


def tagesdatei(kuerzel: str, tag: date, seite: str = "BID") -> str:
    """Pfad einer Tagesdatei. Achtung: Dukascopy zaehlt Monate ab 0."""
    return f"{kuerzel}/{tag.year}/{tag.month - 1:02d}/{tag.day:02d}/{seite}_candles_min_1.bi5"


def _hole(pfad: str, versuche: int = 5, timeout: int = 60) -> bytes | None:
    """Laedt eine Datei mit Wiederholungen - die Verbindung bricht oft ab."""
    for versuch in range(versuche):
        try:
            request = urllib.request.Request(f"{_BASIS}/{pfad}", headers=_KOPF)
            with urllib.request.urlopen(request, timeout=timeout) as antwort:
                return antwort.read()
        except urllib.error.HTTPError as fehler:
            if fehler.code in (404, 410):
                return None  # Tag ohne Daten (Wochenende, Feiertag)
            if versuch == versuche - 1:
                return None
        except Exception:
            if versuch == versuche - 1:
                return None
        _warte(versuch)
    return None


def _warte(versuch: int) -> None:
    import time

    time.sleep(min(8.0, 1.0 * 2**versuch))


def _entpacke(roh: bytes, tag: date, teiler: float) -> pd.DataFrame | None:
    """Macht aus einer .bi5-Datei einen DataFrame mit Minutenkerzen."""
    if not roh:
        return None
    try:
        daten = lzma.decompress(roh, format=lzma.FORMAT_AUTO)
    except lzma.LZMAError:
        return None
    if not daten or len(daten) % _SATZ.itemsize:
        return None

    satz = np.frombuffer(daten, dtype=_SATZ)
    satz = satz[satz["o"] > 0]  # Minuten ohne Handel sind mit 0 gefuellt
    if not len(satz):
        return None

    beginn = datetime(tag.year, tag.month, tag.day, tzinfo=timezone.utc)
    frame = pd.DataFrame(
        {
            "open": satz["o"] / teiler,
            "high": satz["h"] / teiler,
            "low": satz["l"] / teiler,
            "close": satz["c"] / teiler,
            "volume": satz["v"].astype(float),
        },
        index=pd.DatetimeIndex(
            [beginn + timedelta(seconds=int(wert)) for wert in satz["t"]], name="time"
        ),
    )
    return frame


def lade_kerzen(
    symbol: str,
    start: date,
    ende: date,
    *,
    cache: str | Path = "data/dukascopy",
    arbeiter: int = 8,
    fortschritt: bool = True,
) -> pd.DataFrame:
    """Laedt Minutenkerzen fuer einen Zeitraum und legt sie im Cache ab.

    Der Cache ist entscheidend: ein zweiter Lauf braucht keine einzige
    Netzverbindung mehr, und abgebrochene Downloads lassen sich fortsetzen.
    """
    if symbol not in SYMBOLE:
        raise ValueError(f"Unbekanntes Symbol {symbol!r}. Bekannt: {', '.join(SYMBOLE)}")
    kuerzel, stellen = SYMBOLE[symbol]
    teiler = float(10**stellen)
    ordner = Path(cache) / kuerzel
    ordner.mkdir(parents=True, exist_ok=True)

    tage = [start + timedelta(days=i) for i in range((ende - start).days + 1)]
    tage = [tag for tag in tage if tag.weekday() != 5]  # Samstag: nie Daten

    def arbeite(tag: date) -> tuple[date, pd.DataFrame | None]:
        ziel = ordner / f"{tag:%Y-%m-%d}.bi5"
        if ziel.exists():
            return tag, _entpacke(ziel.read_bytes(), tag, teiler)
        roh = _hole(tagesdatei(kuerzel, tag))
        if roh is None:
            ziel.with_suffix(".leer").touch()
            return tag, None
        ziel.write_bytes(roh)
        return tag, _entpacke(roh, tag, teiler)

    offen = [tag for tag in tage if not (ordner / f"{tag:%Y-%m-%d}.leer").exists()]
    teile: list[pd.DataFrame] = []
    fehlend = 0
    with ThreadPoolExecutor(max_workers=arbeiter) as pool:
        for nummer, (tag, frame) in enumerate(pool.map(arbeite, offen), start=1):
            if frame is None or frame.empty:
                fehlend += 1
            else:
                teile.append(frame)
            if fortschritt and nummer % 100 == 0:
                print(
                    f"  {nummer:>5}/{len(offen)} Tage geladen, "
                    f"{fehlend} ohne Daten, {sum(len(t) for t in teile):,} Kerzen",
                    flush=True,
                )

    if not teile:
        raise RuntimeError(
            f"Keine Daten fuer {symbol} zwischen {start} und {ende} - "
            f"Netzverbindung oder Symbolname pruefen."
        )
    alles = pd.concat(teile).sort_index()
    alles = alles[~alles.index.duplicated(keep="last")]
    if fortschritt:
        print(
            f"  fertig: {len(alles):,} Minutenkerzen von {alles.index[0]:%Y-%m-%d} "
            f"bis {alles.index[-1]:%Y-%m-%d} ({fehlend} Tage ohne Daten)"
        )
    return alles
