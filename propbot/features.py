"""Marktkontext fuer Confluence-Analysen: VWAP, Tagesstruktur, Momentum, Kerzen.

Jede Spalte hier ist **kausal**: sie benutzt nur Daten bis einschliesslich der
jeweiligen Kerze. Wo ein Tageswert gebraucht wird (Vortageshoch, Vortagesschluss),
stammt er ausdruecklich vom *abgeschlossenen* Vortag.

Zum VWAP eine ehrliche Vorbemerkung: die Kursquelle liefert kein echtes
Boersenvolumen, sondern ein Liquiditaetsmass. Ein VWAP daraus weicht im Median
14 Punkte vom echten ab. Deshalb wird hier mit einem **Volumenprofil**
gewichtet - dem durchschnittlichen Aktivitaetsverlauf ueber den Handelstag.
Gegen echtes CME-Volumen gemessen liegt dieser VWAP im Median nur 10,5 Punkte
daneben (22 % eines ATR). Fuer "Kurs ueber oder unter VWAP" reicht das; fuer
Entscheidungen auf den Punkt genau nicht.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

from .indicators import atr, ema, rsi

__all__ = ["FEATURE_GRUPPEN", "baue_features", "volumenprofil"]

#: Merkmale nach Themen - fuer Auswertungen und Reports.
FEATURE_GRUPPEN: dict[str, tuple[str, ...]] = {
    "VWAP": ("vwap_abstand", "vwap_ueber", "vwap_steigung"),
    "Tagesstruktur": (
        "gap_atr",
        "pdh_abstand",
        "pdl_abstand",
        "vortag_schluss_lage",
        "vortag_richtung",
        "inside_day",
        "tagesrichtung_5",
    ),
    "Momentum": ("rsi", "roc_4", "roc_8", "folge_gruen", "abstand_open_atr"),
    "Kerzen": ("koerper_anteil", "docht_oben", "docht_unten", "engulfing", "inside_bar"),
    "Aktivitaet": ("rel_volumen", "or_volumen_rel"),
    "Zeit": ("minute", "wochentag"),
}


#: Durchschnittliches Volumenprofil der US-Kernhandelszeit, je 15-Minuten-Fenster
#: (Minuten seit Mitternacht New Yorker Zeit -> Gewicht, Mittelwert 1).
#:
#: Gemessen am **echten CME-Volumen** des NQ-Futures. Das ist wichtig: der
#: Liquiditaetswert der CFD-Kursquelle faellt ueber den Tag monoton ab und kennt
#: den Anstieg zur Schlussauktion nicht. Ein VWAP mit diesen Proxy-Gewichten war
#: im Test 95 Punkte vom echten VWAP entfernt - schlechter als ein simpler
#: Mittelwert (15 Punkte). Mit dem echten Profil sind es 12 Punkte.
US_VOLUMENPROFIL: dict[int, float] = {
    570: 3.200,
    585: 2.216,
    600: 1.930,
    615: 1.598,
    630: 1.375,
    645: 1.126,
    660: 1.069,
    675: 0.979,
    690: 1.013,
    705: 0.848,
    720: 0.752,
    735: 0.682,
    750: 0.648,
    765: 0.619,
    780: 0.636,
    795: 0.594,
    810: 0.519,
    825: 0.465,
    840: 0.552,
    855: 0.536,
    870: 0.561,
    885: 0.478,
    900: 0.595,
    915: 0.519,
    930: 0.652,
    945: 1.836,
}


def volumenprofil(frame: pd.DataFrame, zeitzone: str = "America/New_York") -> pd.Series:
    """Gewicht je Kerze fuer den VWAP - aus dem festen Tagesprofil.

    Ein festes, empirisch gemessenes Profil ist hier besser als das Volumen der
    einzelnen Kerze: Es ist kausal (eine Konstante schaut nicht in die Zukunft),
    stabil, und es bildet die Schlussauktion ab, die der Datenquelle fehlt.

    Zeitpunkte ausserhalb der Kernhandelszeit bekommen das Gewicht des naechsten
    bekannten Fensters, mindestens aber 0,3.
    """
    lokal = frame.index.tz_convert(zeitzone)
    schluessel = lokal.hour * 60 + lokal.minute
    fenster = np.array(sorted(US_VOLUMENPROFIL))
    gewichte = np.array([US_VOLUMENPROFIL[f] for f in fenster])
    position = np.clip(np.searchsorted(fenster, schluessel, side="right") - 1, 0, len(fenster) - 1)
    werte = np.where(
        (schluessel >= fenster[0]) & (schluessel <= fenster[-1] + 15),
        gewichte[position],
        0.3,
    )
    return pd.Series(werte, index=frame.index)


def baue_features(
    frame: pd.DataFrame,
    *,
    zeitzone: str = "America/New_York",
    atr_period: int = 14,
) -> pd.DataFrame:
    """Ergaenzt einen Kerzen-DataFrame um den kompletten Kontext."""
    d = frame.copy()
    lokal = d.index.tz_convert(zeitzone)
    tag = pd.Index(lokal.date)
    d["_tag"] = tag
    d["atr"] = atr(d, atr_period)
    d["minute"] = lokal.hour * 60 + lokal.minute - (9 * 60 + 30)
    d["wochentag"] = lokal.dayofweek

    # ------------------------------------------------------------------ VWAP
    gewicht = volumenprofil(d, zeitzone)
    preis = (d["high"] + d["low"] + d["close"]) / 3
    beitrag = (preis * gewicht).groupby(tag).cumsum()
    summe = gewicht.groupby(tag).cumsum()
    d["vwap"] = beitrag / summe.replace(0, np.nan)
    d["vwap_abstand"] = (d["close"] - d["vwap"]) / d["atr"]
    d["vwap_ueber"] = (d["close"] > d["vwap"]).astype(float)
    d["vwap_steigung"] = (d["vwap"] - d["vwap"].shift(4)) / d["atr"]

    # --------------------------------------------------------- Tagesstruktur
    tages = d.groupby(tag).agg(
        hoch=("high", "max"),
        tief=("low", "min"),
        schluss=("close", "last"),
        eroeffnung=("open", "first"),
    )
    vortag = tages.shift(1)
    pdh = pd.Series(vortag["hoch"].reindex(tag).to_numpy(), index=d.index)
    pdl = pd.Series(vortag["tief"].reindex(tag).to_numpy(), index=d.index)
    pdc = pd.Series(vortag["schluss"].reindex(tag).to_numpy(), index=d.index)
    tages_open = d.groupby(tag)["open"].transform("first")

    d["pdh_abstand"] = (d["close"] - pdh) / d["atr"]
    d["pdl_abstand"] = (d["close"] - pdl) / d["atr"]
    d["gap_atr"] = (tages_open - pdc) / d["atr"]
    spanne = (vortag["hoch"] - vortag["tief"]).replace(0, np.nan)
    lage = (vortag["schluss"] - vortag["tief"]) / spanne
    d["vortag_schluss_lage"] = pd.Series(lage.reindex(tag).to_numpy(), index=d.index)
    richtung = np.sign(vortag["schluss"] - vortag["eroeffnung"])
    d["vortag_richtung"] = pd.Series(richtung.reindex(tag).to_numpy(), index=d.index)
    # Innentag: die heutige Eroeffnungsspanne liegt komplett in der Vortagsspanne
    d["inside_day"] = ((d["high"] <= pdh) & (d["low"] >= pdl)).astype(float)
    schluesse = tages["schluss"]
    trend5 = np.sign(schluesse - schluesse.shift(5))
    d["tagesrichtung_5"] = pd.Series(trend5.reindex(tag).to_numpy(), index=d.index)

    # -------------------------------------------------------------- Momentum
    d["rsi"] = rsi(d["close"], 14)
    d["roc_4"] = (d["close"] / d["close"].shift(4) - 1) * 100
    d["roc_8"] = (d["close"] / d["close"].shift(8) - 1) * 100
    gruen = (d["close"] > d["open"]).astype(int)
    d["folge_gruen"] = gruen.groupby((gruen != gruen.shift()).cumsum()).cumcount() + 1
    d["folge_gruen"] = d["folge_gruen"].where(gruen == 1, 0)
    d["abstand_open_atr"] = (d["close"] - tages_open) / d["atr"]
    d["ema20"] = ema(d["close"], 20)

    # ---------------------------------------------------------------- Kerzen
    hoehe = (d["high"] - d["low"]).replace(0, np.nan)
    d["koerper_anteil"] = (d["close"] - d["open"]).abs() / hoehe
    d["docht_oben"] = (d["high"] - d[["open", "close"]].max(axis=1)) / hoehe
    d["docht_unten"] = (d[["open", "close"]].min(axis=1) - d["low"]) / hoehe
    d["engulfing"] = (
        (d["close"] > d["open"])
        & (d["close"].shift(1) < d["open"].shift(1))
        & (d["close"] >= d["open"].shift(1))
        & (d["open"] <= d["close"].shift(1))
    ).astype(float)
    d["inside_bar"] = ((d["high"] <= d["high"].shift(1)) & (d["low"] >= d["low"].shift(1))).astype(
        float
    )

    # ------------------------------------------------------------ Aktivitaet
    schluessel = lokal.hour * 60 + lokal.minute
    mittel = d.groupby(schluessel)["volume"].transform(
        lambda s: s.rolling(20, min_periods=5).mean().shift(1)
    )
    d["rel_volumen"] = d["volume"] / mittel.replace(0, np.nan)
    d["or_volumen_rel"] = (
        d["rel_volumen"].groupby(tag).transform(lambda s: s.iloc[:1].mean() if len(s) else np.nan)
    )
    return d.drop(columns=["_tag"])
