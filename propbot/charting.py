"""Kerzencharts rendern und lesbar machen.

Der Zweck ist ungewoehnlich: diese Bilder sind nicht fuer einen Menschen
gedacht, sondern dafuer, dass das Modell den Chart *anschauen* kann statt nur
Zahlenkolonnen zu rechnen. Daraus folgen ein paar Entwurfsentscheidungen, die
in einer normalen Charting-Bibliothek keinen Sinn ergaeben:

* **Hoechstens ~160 Kerzen je Feld.** Darueber verschmelzen die Koerper und das
  Bild wird unlesbar - fuer ein Auge wie fuers Modell. Wer mehr sehen will,
  nimmt einen groesseren Zeitrahmen, nicht mehr Kerzen.
* **Jedes Bild kommt mit einer Zahlentafel.** Aus einem Bild laesst sich nicht
  messen. Struktur kommt aus dem Bild, Werte aus der Tabelle; beide beschreiben
  exakt denselben Ausschnitt.
* **Wenige, kraeftige Linien.** VWAP, Vortageshoch/-tief, Eroeffnungsspanne.
  Mehr Indikatoren machen das Bild schlechter lesbar, nicht besser.

Die Zeitachse ist durchnummeriert statt echt-zeitlich: sonst reisst jede
Handelspause Luecken ins Bild.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
import pandas as pd  # noqa: E402

__all__ = [
    "ChartAusschnitt",
    "TIMEFRAMES",
    "folge",
    "volumen_ist_echt",
    "male_chart",
    "schneide",
    "zahlentafel",
    "zeitprofil",
]

#: Zeitrahmen, die die Kommandozeile kennt - auf Pandas-Regeln abgebildet.
TIMEFRAMES: dict[str, str] = {
    "1m": "1min",
    "2m": "2min",
    "3m": "3min",
    "5m": "5min",
    "15m": "15min",
    "30m": "30min",
    "1h": "1h",
    "4h": "4h",
    "1d": "1D",
}

MAX_KERZEN = 160

_GRUEN = "#26a69a"
_ROT = "#ef5350"


@dataclass(frozen=True, slots=True)
class ChartAusschnitt:
    """Ein fertig aufbereiteter Ausschnitt: Kerzen plus Kontext."""

    kerzen: pd.DataFrame
    timeframe: str
    zeitzone: str
    vwap: pd.Series | None = None
    vortag_hoch: float | None = None
    vortag_tief: float | None = None
    #: Falsch, wenn das Volumen ein Tick-Zaehler ist - dann ist die Linie ein
    #: kumulativer Durchschnittskurs und ausdruecklich *kein* VWAP.
    vwap_echt: bool = False


def _aggregiere(frame: pd.DataFrame, regel: str) -> pd.DataFrame:
    kerzen = frame.resample(regel).agg(
        {"open": "first", "high": "max", "low": "min", "close": "last", "volume": "sum"}
    )
    return kerzen.dropna(subset=["open", "high", "low", "close"])


#: Ab dieser relativen Streuung gilt eine Volumenreihe als echtes Volumen.
#: Echtes CME-Volumen schwankt innerhalb einer Sitzung um Faktor 50-100 zwischen
#: ruhigen Minuten und Nachrichtenzeiten; der Variationskoeffizient liegt weit
#: ueber 1. Der Tick-Zaehler von Dukascopy kommt auf 0.32 - er gewichtet
#: praktisch nicht und macht aus dem VWAP einen simplen Durchschnittskurs.
ECHTES_VOLUMEN_CV = 0.8


def volumen_ist_echt(volumen: pd.Series) -> bool:
    """Prueft, ob eine Volumenreihe stark genug streut, um zu gewichten.

    Ein Tick-Zaehler sieht aus wie Volumen, wirkt aber nicht wie eines. Mit ihm
    gerechnet weicht der "VWAP" nur um wenige Prozent der Tagesspanne vom
    ungewichteten Mittel ab - die Linie heisst dann VWAP, ist aber keiner.
    """
    gueltig = volumen[volumen > 0]
    if len(gueltig) < 10 or gueltig.mean() <= 0:
        return False
    return float(gueltig.std() / gueltig.mean()) >= ECHTES_VOLUMEN_CV


def _vwap(kerzen: pd.DataFrame, tag: pd.Index) -> pd.Series:
    """Kumulativer Durchschnittskurs, mit Volumen gewichtet sofern vorhanden."""
    typisch = (kerzen["high"] + kerzen["low"] + kerzen["close"]) / 3.0
    volumen = kerzen["volume"].where(kerzen["volume"] > 0, np.nan)
    volumen = volumen.fillna(volumen.median() if volumen.notna().any() else 1.0)
    gewichtet = (typisch * volumen).groupby(tag).cumsum()
    summe = volumen.groupby(tag).cumsum()
    return gewichtet / summe


def schneide(
    frame: pd.DataFrame,
    *,
    timeframe: str,
    datum: str | None = None,
    von: str | None = None,
    bis: str | None = None,
    start: str | pd.Timestamp | None = None,
    ende: str | pd.Timestamp | None = None,
    zeitzone: str = "America/New_York",
    max_kerzen: int = MAX_KERZEN,
) -> ChartAusschnitt:
    """Schneidet den gewuenschten Ausschnitt zu und rechnet den Kontext dazu.

    ``datum`` waehlt einen Kalendertag. ``start``/``ende`` waehlen stattdessen
    ein absolutes Zeitfenster - noetig fuer Sitzungen, die ueber Mitternacht
    laufen, etwa die asiatische.
    """
    if timeframe not in TIMEFRAMES:
        raise ValueError(f"Unbekannter Zeitrahmen {timeframe!r}. Bekannt: {', '.join(TIMEFRAMES)}")
    if datum is not None and (start is not None or ende is not None):
        raise ValueError("Entweder 'datum' oder 'start'/'ende' - nicht beides.")

    lokal = frame.tz_convert(zeitzone)
    vortag_hoch = vortag_tief = None
    if start is not None or ende is not None:
        if start is not None:
            lokal = lokal[lokal.index >= pd.Timestamp(start).tz_localize(zeitzone)]
        if ende is not None:
            lokal = lokal[lokal.index < pd.Timestamp(ende).tz_localize(zeitzone)]
        if lokal.empty:
            raise ValueError(f"Keine Daten zwischen {start} und {ende}.")
    if datum is not None:
        ziel = pd.Timestamp(datum).date()
        tage = pd.Index(lokal.index.date)
        vorher = lokal[tage < ziel]
        if len(vorher):
            letzter = pd.Index(vorher.index.date).max()
            vortag = vorher[pd.Index(vorher.index.date) == letzter]
            vortag_hoch = float(vortag["high"].max())
            vortag_tief = float(vortag["low"].min())
        lokal = lokal[tage == ziel]
        if lokal.empty:
            raise ValueError(f"Keine Daten fuer {datum} - Feiertag, Wochenende oder ausserhalb.")

    fenster_modus = start is not None or ende is not None
    kerzen = _aggregiere(lokal, TIMEFRAMES[timeframe])
    if von is not None:
        kerzen = kerzen[kerzen.index.time >= pd.Timestamp(von).time()]
    if bis is not None:
        kerzen = kerzen[kerzen.index.time < pd.Timestamp(bis).time()]
    if kerzen.empty:
        raise ValueError("Der Ausschnitt enthaelt keine Kerzen.")
    if len(kerzen) > max_kerzen:
        kerzen = kerzen.iloc[-max_kerzen:]

    # Der VWAP setzt normalerweise je Handelstag zurueck. Bei einem absoluten
    # Fenster waere das falsch: die asiatische Sitzung laeuft ueber Mitternacht
    # New Yorker Zeit, und ein Sprung mittendrin gehoert keiner Sitzung an.
    if fenster_modus:
        tag = pd.Index(np.zeros(len(kerzen), dtype=int))
    else:
        tag = pd.Index(kerzen.index.date)
    return ChartAusschnitt(
        kerzen=kerzen,
        timeframe=timeframe,
        zeitzone=zeitzone,
        vwap=_vwap(kerzen, tag),
        vwap_echt=volumen_ist_echt(kerzen["volume"]),
        vortag_hoch=vortag_hoch,
        vortag_tief=vortag_tief,
    )


def _male_feld(ax, a: ChartAusschnitt, titel: str, marken: list[str] | None) -> None:
    k = a.kerzen
    n = len(k)
    breite = 0.62 if n <= 90 else (0.5 if n <= 130 else 0.4)
    o = k["open"].to_numpy()
    h = k["high"].to_numpy()
    tief = k["low"].to_numpy()
    c = k["close"].to_numpy()
    spanne = float(h.max() - tief.min())
    minimum = max(spanne * 0.0015, 1e-9)  # Doji bleibt sichtbar

    for i in range(n):
        farbe = _GRUEN if c[i] >= o[i] else _ROT
        ax.plot([i, i], [tief[i], h[i]], color=farbe, linewidth=0.9, zorder=2)
        unten = min(o[i], c[i])
        ax.add_patch(
            plt.Rectangle(
                (i - breite / 2, unten),
                breite,
                max(abs(c[i] - o[i]), minimum),
                facecolor=farbe,
                edgecolor=farbe,
                linewidth=0.4,
                zorder=3,
            )
        )

    if a.vwap is not None and len(a.vwap) == n:
        name = "VWAP" if a.vwap_echt else "Ø Kurs (kein VWAP: Volumen ist Proxy)"
        ax.plot(range(n), a.vwap.to_numpy(), color="#5b6bbf", linewidth=1.3, zorder=4, label=name)
    for wert, name, farbe in (
        (a.vortag_hoch, "PDH", "#f39c12"),
        (a.vortag_tief, "PDL", "#8e44ad"),
    ):
        if wert is not None and tief.min() <= wert <= h.max():
            ax.axhline(wert, color=farbe, linewidth=1.0, linestyle="--", zorder=1, label=name)

    zeiten = k.index
    for marke in marken or []:
        ziel = pd.Timestamp(marke).time()
        treffer = np.flatnonzero(zeiten.time >= ziel)
        if len(treffer):
            ax.axvline(treffer[0], color="#444", linewidth=1.0, linestyle=":", zorder=1)
            ax.text(treffer[0], h.max(), f" {marke}", fontsize=8, color="#444", va="top", zorder=5)

    ax.set_title(titel, fontsize=11)
    schritt = max(1, n // 9)
    ax.set_xticks(range(0, n, schritt))
    ax.set_xticklabels([f"{t:%H:%M}" for t in zeiten[::schritt]], fontsize=8)
    ax.set_xlim(-1, n)
    ax.grid(alpha=0.22, linewidth=0.5)
    ax.tick_params(labelsize=8)
    if ax.get_legend_handles_labels()[0]:
        ax.legend(fontsize=7, loc="upper left", framealpha=0.85)


def folge(
    frame: pd.DataFrame,
    *,
    timeframe: str,
    start: str | pd.Timestamp,
    ende: str | pd.Timestamp,
    zeitzone: str = "America/New_York",
    max_kerzen: int = MAX_KERZEN,
) -> list[ChartAusschnitt]:
    """Teilt ein langes Fenster in aufeinanderfolgende, lesbare Ausschnitte.

    Eine Sitzung von neun Stunden hat auf dem Minutenchart 540 Kerzen. In ein
    Feld gezeichnet ist das ein Farbbrei. Statt den Zeitrahmen zu vergroessern -
    was die Frage veraendern wuerde - wird das Fenster in Abschnitte zerlegt,
    die einzeln lesbar sind und zusammen den ganzen Zeitraum abdecken.
    """
    ganz = schneide(
        frame,
        timeframe=timeframe,
        start=start,
        ende=ende,
        zeitzone=zeitzone,
        max_kerzen=10**9,
    )
    kerzen = ganz.kerzen
    anzahl = max(1, -(-len(kerzen) // max_kerzen))  # aufrunden
    grenzen = np.array_split(np.arange(len(kerzen)), anzahl)

    teile: list[ChartAusschnitt] = []
    for stueck in grenzen:
        if not len(stueck):
            continue
        teil = kerzen.iloc[stueck[0] : stueck[-1] + 1]
        teile.append(
            ChartAusschnitt(
                kerzen=teil,
                timeframe=timeframe,
                zeitzone=zeitzone,
                vwap=ganz.vwap.iloc[stueck[0] : stueck[-1] + 1] if ganz.vwap is not None else None,
                vwap_echt=ganz.vwap_echt,
                vortag_hoch=ganz.vortag_hoch,
                vortag_tief=ganz.vortag_tief,
            )
        )
    return teile


def male_chart(
    ausschnitte: list[ChartAusschnitt],
    ziel: str | Path,
    *,
    titel: str = "",
    marken: list[str] | None = None,
    spalten: int | None = None,
) -> Path:
    """Malt die Ausschnitte in eine PNG-Datei, bei Bedarf als Gitter."""
    if not ausschnitte:
        raise ValueError("Ohne Ausschnitt laesst sich nichts malen.")
    anzahl = len(ausschnitte)
    spalten = spalten or (anzahl if anzahl <= 3 else 2)
    zeilen = -(-anzahl // spalten)
    fig, achsen = plt.subplots(
        zeilen, spalten, figsize=(7.0 * spalten, 6.0 * zeilen), squeeze=False
    )
    flach = achsen.ravel()
    for ax, a in zip(flach, ausschnitte):
        zeitraum = (
            f"{a.kerzen.index[0]:%d.%m %H:%M}-{a.kerzen.index[-1]:%H:%M}"
            if anzahl > 1
            else f"({len(a.kerzen)} Kerzen)"
        )
        _male_feld(ax, a, f"{titel} {a.timeframe} {zeitraum}".strip(), marken)
    for ax in flach[anzahl:]:
        ax.axis("off")
    plt.tight_layout()
    ziel = Path(ziel)
    plt.savefig(ziel, dpi=100, facecolor="white")
    plt.close(fig)
    return ziel


def zahlentafel(a: ChartAusschnitt, *, zeilen: int = 14) -> str:
    """Die Zahlen zum Bild - aus einem Chart laesst sich nicht messen."""
    k = a.kerzen
    spanne = k["high"] - k["low"]
    koerper = (k["close"] - k["open"]).abs()
    hoch_bei = k["high"].idxmax()
    tief_bei = k["low"].idxmin()

    text = [
        f"Zeitrahmen {a.timeframe}, {len(k)} Kerzen, "
        f"{k.index[0]:%Y-%m-%d %H:%M} bis {k.index[-1]:%H:%M} ({a.zeitzone})",
        f"  Eroeffnung {k['open'].iloc[0]:,.2f}   Schluss {k['close'].iloc[-1]:,.2f}   "
        f"Veraenderung {k['close'].iloc[-1] - k['open'].iloc[0]:+,.2f}",
        f"  Hoch {k['high'].max():,.2f} um {hoch_bei:%H:%M}   "
        f"Tief {k['low'].min():,.2f} um {tief_bei:%H:%M}   "
        f"Tagesspanne {k['high'].max() - k['low'].min():,.2f}",
        f"  Kerzenspanne: Median {spanne.median():,.2f}  Mittel {spanne.mean():,.2f}  "
        f"groesste {spanne.max():,.2f}   Koerper/Spanne {(koerper / spanne).mean():.0%}",
    ]
    if a.vortag_hoch is not None:
        text.append(f"  Vortag: Hoch {a.vortag_hoch:,.2f}  Tief {a.vortag_tief:,.2f}")

    text.append("")
    text.append(f"  {'Zeit':>6} {'Open':>10} {'High':>10} {'Low':>10} {'Close':>10} {'Δ':>8}")
    schritt = max(1, len(k) // zeilen)
    for zeit, r in k.iloc[::schritt].iterrows():
        text.append(
            f"  {zeit:%H:%M} {r['open']:>10,.2f} {r['high']:>10,.2f} "
            f"{r['low']:>10,.2f} {r['close']:>10,.2f} {r['close'] - r['open']:>+8,.2f}"
        )
    return "\n".join(text)


def zeitprofil(
    frame: pd.DataFrame,
    *,
    zeitzone: str = "America/New_York",
    takt: int = 30,
) -> pd.DataFrame:
    """Was zu welcher Uhrzeit passiert - ueber alle Tage des Datensatzes.

    Beantwortet Fragen wie "was passiert ab 10:00": mittlere Spanne, Richtung,
    Anteil steigender Kerzen und Fortsetzungsneigung je Zeitfenster.
    """
    lokal = frame.tz_convert(zeitzone)
    minute = lokal.index.hour * 60 + lokal.index.minute
    block = (minute // takt) * takt
    d = lokal.assign(
        block=block,
        spanne=lokal["high"] - lokal["low"],
        richtung=lokal["close"] - lokal["open"],
        tag=pd.Index(lokal.index.date),
    )
    g = d.groupby("block")
    profil = pd.DataFrame(
        {
            "kerzen": g.size(),
            "spanne_median": g["spanne"].median(),
            "spanne_mittel": g["spanne"].mean(),
            "richtung_mittel": g["richtung"].mean(),
            "anteil_gruen": g["richtung"].apply(lambda s: float((s > 0).mean())),
            "vola_anteil": g["spanne"].mean() / d["spanne"].mean(),
        }
    )
    profil.index = [f"{b // 60:02d}:{b % 60:02d}" for b in profil.index]
    profil.index.name = "zeit"
    return profil
