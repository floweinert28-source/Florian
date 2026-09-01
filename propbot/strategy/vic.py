"""VIC-Modell: mechanisierte Fassung der dokumentierten Regeln.

Quelle ist ``VIC-MODEL.md`` - 37 dokumentierte Gewinner und 24 Verlusttage.
Dieses Modul uebersetzt die dort belegten Regeln in Code. Wo eine Regel im
Journal diskretionaer blieb, steht hier eine ausdrueckliche Operationalisierung;
jede davon ist im Klassenkommentar als solche markiert, damit niemand die
Backtest-Zahlen fuer mehr haelt, als sie sind.

Umgesetzte Regeln (Nummern = Kapitel in VIC-MODEL.md):
- Kein Trade vor dem Opening-Range-Break; OR = 09:30-09:44 New York (§6.1).
- Setup-Wahl: unfilled 5m/15m-FVG seit NY-Open mit NY-VWAP darin =>
  Continuation, sonst Double Break - nie das jeweils andere (§5.3).
- Trigger-Reihenfolge Continuation: Retrace in die Zone -> Reclaim-Kerze
  (Close ueber Vorgaenger-High) -> NY-VWAP-Cross -> Alignment aller drei
  VWAPs (§6).
- Double Break nur mit Momentum vor dem Break und cleanem Close; ein Break
  um wenige Punkte zaehlt nicht (§5.2, T18).
- Bias: 1h-Struktur (HH/HL vs. LH/LL), Bruch nur per 15m-Body-Close (§7).
- Stop am Invalidierungspunkt, nie direkt auf einem VWAP (§8).
- Ziel: letztes 15m-Swing-Level, sonst 1:1-Fallback (ATH-Regel T31); Double
  Break mit kurzem Ziel (§9).
- Zeitfenster: Einstiege 09:45-11:15, flach um 12:00 New York (§11).
- FOMC-Tage komplett handelsfrei (Release 14:00 liegt hinter dem Fenster).
- Maximal 2 Signale je Tag; "ein Loss = Feierabend" bildet der Risk-Manager
  ueber ``max_losses_per_day=1`` ab (§10).

Bewusst NICHT umgesetzt (fehlende Daten oder zu diskretionaer):
Bookmap-Orderflow, Gegen-HTF-Trades mit Overextension-Begruendung (T9/T19),
Session-Level-Ziele (Asia/London/NYAM), PD-Magnet-Ausnahme, reclaim-Entry.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date

import numpy as np
import pandas as pd

from ..models import Side, Signal
from ..vic_levels import ET, berechne_vic_level
from .base import ArrayCache, SessionWindow, Strategy, StrategyParams

__all__ = ["Vic", "VicParams", "FOMC_TAGE"]

#: FOMC-Entscheidungstage (zweiter Sitzungstag) im Datenzeitraum. Das
#: Statement erscheint 14:00 New York - unser gesamtes Fenster liegt davor,
#: also ist der ganze Tag gesperrt (Nutzer-Regel: kein Trade vor FOMC).
FOMC_TAGE = frozenset(
    date(*d)
    for d in [
        (2021, 9, 22), (2021, 11, 3), (2021, 12, 15),
        (2022, 1, 26), (2022, 3, 16), (2022, 5, 4), (2022, 6, 15),
        (2022, 7, 27), (2022, 9, 21), (2022, 11, 2), (2022, 12, 14),
        (2023, 2, 1), (2023, 3, 22), (2023, 5, 3), (2023, 6, 14),
        (2023, 7, 26), (2023, 9, 20), (2023, 11, 1), (2023, 12, 13),
        (2024, 1, 31), (2024, 3, 20), (2024, 5, 1), (2024, 6, 12),
        (2024, 7, 31), (2024, 9, 18), (2024, 11, 7), (2024, 12, 18),
        (2025, 1, 29), (2025, 3, 19), (2025, 5, 7), (2025, 6, 18),
        (2025, 7, 30), (2025, 9, 17), (2025, 10, 29), (2025, 12, 10),
        (2026, 1, 28), (2026, 3, 18), (2026, 4, 29), (2026, 6, 17),
        (2026, 7, 29), (2026, 9, 16), (2026, 10, 28), (2026, 12, 9),
    ]
)

_COLUMNS = (
    "close", "vic_signal", "vic_stop", "vic_target", "vic_setup",
)


@dataclass(frozen=True, slots=True)
class VicParams(StrategyParams):
    """Operationalisierungen des VIC-Modells.

    Jeder Wert hier ist eine Uebersetzungsentscheidung, keine im Journal
    belegte Zahl - ausser wo ein Kommentar die Quelle nennt.
    """

    #: Abstand (in ATR), den der Preis nach FVG-Bildung erst gewinnen muss,
    #: bevor eine Rueckkehr als Retrace zaehlt - der Zonenrand IST bei
    #: Bildung der aktuelle Preis, ohne Trennung waere jede Zone sofort
    #: "beruehrt".
    trennung_atr: float = 0.5
    #: Wie viele 1m-Kerzen nach der ersten Zonenberuehrung der Trigger kommen darf.
    retrace_fenster: int = 20
    #: NY-VWAP-Cross muss innerhalb so vieler Kerzen vor dem Trigger liegen.
    cross_fenster: int = 5
    #: Double Break: Body der Breakkerze in Vielfachen des 1m-ATR ("starkes Momentum").
    momentum_atr: float = 0.8
    #: Double Break: Close muss im oberen/unteren Anteil der Kerzenspanne liegen.
    clean_close_anteil: float = 0.35
    #: Break unter so vielen ATR ueber/unter der OR-Kante gilt als schwach (T18).
    schwacher_break_atr: float = 0.5
    #: Einstieg nur innerhalb so vieler Kerzen nach dem Double-Break.
    db_fenster: int = 8
    #: Stop-Puffer hinter dem Invalidierungspunkt, in ATR.
    stop_puffer_atr: float = 0.25
    #: Mindestabstand des Stops zu jedem VWAP, in Punkten (L24: nie auf VWAP).
    vwap_stop_abstand: float = 3.0
    #: Ziel des Double Breaks als Vielfaches des Risikos ("TP schnell und kurz").
    db_reward: float = 1.2
    #: Continuation-Ziel muss mindestens dieses CRV liefern, sonst 1:1-Fallback.
    min_swing_reward: float = 0.8
    #: 15m-Kerzen, aus denen das Swing-Ziel gebaut wird.
    swing_fenster: int = 6
    #: Stop-Distanz-Grenzen in Punkten (Sizing-Realitaet MNQ bei 300 $).
    min_stop_punkte: float = 5.0
    max_stop_punkte: float = 100.0
    #: Fraktal-Breite der 1h-Pivots.
    pivot_k: int = 2
    max_signale_pro_tag: int = 2
    cooldown: int = 15
    allow_short: bool = True
    fomc_filter: bool = True


def _atr(frame: pd.DataFrame, laenge: int = 20) -> pd.Series:
    prev_close = frame["close"].shift(1)
    tr = pd.concat(
        [
            frame["high"] - frame["low"],
            (frame["high"] - prev_close).abs(),
            (frame["low"] - prev_close).abs(),
        ],
        axis=1,
    ).max(axis=1)
    return tr.rolling(laenge, min_periods=laenge).mean()


def _pivots(werte: np.ndarray, k: int, hoch: bool) -> list[int]:
    """Indizes bestaetigter Fraktal-Pivots (bestaetigt k Kerzen spaeter)."""
    treffer = []
    for i in range(k, len(werte) - k):
        fenster = werte[i - k : i + k + 1]
        if hoch and werte[i] == fenster.max() and (fenster < werte[i]).sum() >= 2 * k - 1:
            treffer.append(i)
        if not hoch and werte[i] == fenster.min() and (fenster > werte[i]).sum() >= 2 * k - 1:
            treffer.append(i)
    return treffer


class Vic(Strategy):
    """Continuation- und Double-Break-Setups des VIC-Modells."""

    name = "vic"

    def __init__(self, params: VicParams | None = None, session: SessionWindow | None = None) -> None:
        super().__init__(
            session
            or SessionWindow(
                start="09:45",
                end="12:00",
                weekdays=(0, 1, 2, 3, 4),
                blackouts=(),
                no_new_trades_after="11:15",
                flat_at="12:00",
                skip_friday_after=None,  # Nutzer: Freitag wird normal gehandelt.
                zeitzone=ET,
            )
        )
        self.p = params or VicParams()
        self._cache = ArrayCache()

    @property
    def warmup(self) -> int:
        return 1500  # genug fuer 1h-Pivots samt Bestaetigung

    # ------------------------------------------------------------ Vorbereitung
    def prepare(self, frame: pd.DataFrame) -> pd.DataFrame:
        p = self.p
        out = berechne_vic_level(frame)
        out["atr"] = _atr(out)

        et_index = out.index.tz_convert(ET)
        et_ns = et_index.asi8
        n = len(out)

        closes = out["close"].to_numpy(float)
        highs = out["high"].to_numpy(float)
        lows = out["low"].to_numpy(float)
        atr = out["atr"].to_numpy(float)
        ny = out["ny_vwap"].to_numpy(float)
        ov = out["ov_vwap"].to_numpy(float)
        pdv = out["pd_vwap"].to_numpy(float)
        or_high = out["or_high"].to_numpy(float)
        or_low = out["or_low"].to_numpy(float)
        or_locked = out["or_locked"].to_numpy(bool)
        minute = out["minute_et"].to_numpy(np.int64)
        rth_tag = out["rth_tag"].to_numpy(np.int64)

        # ---------------------------------------------- HTF-Bars (15m und 1h)
        et_frame = frame.tz_convert(ET) if frame.index.tz is not None else frame
        m15 = (
            et_frame[["open", "high", "low", "close"]]
            .resample("15min", label="right", closed="right")
            .agg({"open": "first", "high": "max", "low": "min", "close": "last"})
            .dropna()
        )
        h1 = (
            et_frame[["open", "high", "low", "close"]]
            .resample("60min", label="right", closed="right")
            .agg({"open": "first", "high": "max", "low": "min", "close": "last"})
            .dropna()
        )

        # 1h-Pivots -> Strukturzustand als Schrittfunktion ueber der Zeit.
        h1_high = h1["high"].to_numpy(float)
        h1_low = h1["low"].to_numpy(float)
        h1_zeit = h1.index.asi8
        ph_idx = _pivots(h1_high, p.pivot_k, hoch=True)
        pl_idx = _pivots(h1_low, p.pivot_k, hoch=False)

        ereignisse: list[tuple[int, str, float]] = []
        for i in ph_idx:
            bestaetigt = min(i + p.pivot_k, len(h1) - 1)
            ereignisse.append((h1_zeit[bestaetigt], "H", h1_high[i]))
        for i in pl_idx:
            bestaetigt = min(i + p.pivot_k, len(h1) - 1)
            ereignisse.append((h1_zeit[bestaetigt], "L", h1_low[i]))
        ereignisse.sort()

        ev_zeit = np.array([e[0] for e in ereignisse], dtype=np.int64)
        letzte_ph = np.full(len(ereignisse), np.nan)
        letzte_pl = np.full(len(ereignisse), np.nan)
        bull = np.zeros(len(ereignisse), dtype=bool)
        bear = np.zeros(len(ereignisse), dtype=bool)
        hs: list[float] = []
        ls: list[float] = []
        for j, (_, art, wert) in enumerate(ereignisse):
            (hs if art == "H" else ls).append(wert)
            letzte_ph[j] = hs[-1] if hs else np.nan
            letzte_pl[j] = ls[-1] if ls else np.nan
            bull[j] = len(hs) >= 2 and len(ls) >= 2 and hs[-1] > hs[-2] and ls[-1] > ls[-2]
            bear[j] = len(hs) >= 2 and len(ls) >= 2 and hs[-1] < hs[-2] and ls[-1] < ls[-2]

        pos = np.searchsorted(ev_zeit, et_ns, side="right") - 1
        gueltig = pos >= 0
        idx = np.clip(pos, 0, None)
        bar_ph = np.where(gueltig, letzte_ph[idx], np.nan) if len(ereignisse) else np.full(n, np.nan)
        bar_pl = np.where(gueltig, letzte_pl[idx], np.nan) if len(ereignisse) else np.full(n, np.nan)
        bar_bull = np.where(gueltig, bull[idx], False) if len(ereignisse) else np.zeros(n, bool)
        bar_bear = np.where(gueltig, bear[idx], False) if len(ereignisse) else np.zeros(n, bool)

        # Letzter abgeschlossener 15m-Close je 1m-Kerze (fuer Body-Close-Bruch).
        m15_zeit = m15.index.asi8
        m15_close = m15["close"].to_numpy(float)
        m15_high = m15["high"].to_numpy(float)
        m15_low = m15["low"].to_numpy(float)
        pos15 = np.searchsorted(m15_zeit, et_ns, side="right") - 1
        letzter15 = np.where(pos15 >= 0, m15_close[np.clip(pos15, 0, None)], np.nan)

        break_auf = letzter15 > bar_ph
        break_ab = letzter15 < bar_pl
        bias_long = ~bar_bear | break_auf
        bias_short = ~bar_bull | break_ab

        # Swing-Ziele: Extrem der letzten ``swing_fenster`` fertigen 15m-Kerzen.
        roll_hoch = pd.Series(m15_high).rolling(p.swing_fenster, min_periods=1).max().to_numpy()
        roll_tief = pd.Series(m15_low).rolling(p.swing_fenster, min_periods=1).min().to_numpy()
        swing_hoch = np.where(pos15 >= 0, roll_hoch[np.clip(pos15, 0, None)], np.nan)
        swing_tief = np.where(pos15 >= 0, roll_tief[np.clip(pos15, 0, None)], np.nan)

        # ------------------------------------------- FVG-Zonen je Handelstag
        # 5m- und 15m-FVGs, die seit 09:30 des Tages entstanden sind. Eine
        # Zone gilt als frisch ("unfilled"), bis der Preis sie erstmals
        # beruehrt - genau diese erste Beruehrung ist der handelbare Retrace
        # (L4: ein bereits getappter FVG ist nicht mehr valid).
        m5 = (
            et_frame[["high", "low", "close"]]
            .resample("5min", label="right", closed="right")
            .agg({"high": "max", "low": "min", "close": "last"})
            .dropna()
        )

        def _tages_fvgs(bars: pd.DataFrame) -> dict[int, list[tuple[int, float, float, int]]]:
            """je RTH-Tag: Liste (fertig_ns, lo, hi, richtung) ab 09:30."""
            b_zeit = bars.index.asi8
            b_high = bars["high"].to_numpy(float)
            b_low = bars["low"].to_numpy(float)
            b_min = np.asarray(bars.index.hour) * 60 + np.asarray(bars.index.minute)
            b_tag = np.array([d.toordinal() for d in bars.index.date], dtype=np.int64)
            resultat: dict[int, list[tuple[int, float, float, int]]] = {}
            for j in range(2, len(bars)):
                if b_tag[j] != b_tag[j - 2] or not (570 < b_min[j] <= 960):
                    continue
                if b_low[j] > b_high[j - 2]:  # bullisher FVG
                    resultat.setdefault(b_tag[j], []).append((b_zeit[j], b_high[j - 2], b_low[j], 1))
                if b_high[j] < b_low[j - 2]:  # bearisher FVG
                    resultat.setdefault(b_tag[j], []).append((b_zeit[j], b_high[j], b_low[j - 2], -1))
            return resultat

        fvg_pro_tag: dict[int, list[tuple[int, float, float, int]]] = {}
        for quelle in (_tages_fvgs(m5), _tages_fvgs(m15)):
            for tag, zonen in quelle.items():
                fvg_pro_tag.setdefault(tag, []).extend(zonen)

        # --------------------------------------- Tagesschleife: Signale bauen
        signal = np.zeros(n, dtype=np.int8)
        setup_art = np.zeros(n, dtype=np.int8)  # 1=Continuation, 2=Double Break
        stop_arr = np.full(n, np.nan)
        ziel_arr = np.full(n, np.nan)

        fomc_ordinal = {d.toordinal() for d in FOMC_TAGE}

        starts: list[int] = []
        i = 0
        while i < n:
            if rth_tag[i] >= 0 and (i == 0 or rth_tag[i] != rth_tag[i - 1]):
                starts.append(i)
            i += 1

        def _stop_ok(dist: float) -> bool:
            return p.min_stop_punkte <= dist <= p.max_stop_punkte

        def _vwap_ausweichen(stop: float, t: int, long: bool) -> float:
            for linie in (ny[t], ov[t], pdv[t]):
                if np.isfinite(linie) and abs(stop - linie) < p.vwap_stop_abstand:
                    stop = linie - p.vwap_stop_abstand if long else linie + p.vwap_stop_abstand
            return stop

        for start in starts:
            tag = rth_tag[start]
            if p.fomc_filter and tag in fomc_ordinal:
                continue
            zonen = list(fvg_pro_tag.get(tag, []))
            zonen_status: list[dict] = [
                {
                    "fertig": z[0], "lo": z[1], "hi": z[2], "richtung": z[3],
                    "getrennt": False, "beruehrt": -1, "tot": False,
                }
                for z in zonen
            ]
            break_up_bar = -1
            break_dn_bar = -1
            signale_heute = 0
            letzter_trigger = -10_000

            t = start
            while t < n and rth_tag[t] == tag:
                if minute[t] > 700:  # nach 11:40 keine neuen Berechnungen mehr
                    break
                if not or_locked[t] or np.isnan(atr[t]):
                    t += 1
                    continue

                # Starker OR-Break (Body-Close jenseits der Kante, T18-Regel).
                if break_up_bar < 0 and closes[t] > or_high[t] + p.schwacher_break_atr * atr[t]:
                    break_up_bar = t
                if break_dn_bar < 0 and closes[t] < or_low[t] - p.schwacher_break_atr * atr[t]:
                    break_dn_bar = t

                # Zonenpflege: Beruehrung und Invalidierung.
                aktive_long = None
                aktive_short = None
                for z in zonen_status:
                    if z["tot"] or et_ns[t] < z["fertig"]:
                        continue
                    if z["richtung"] == 1:
                        if closes[t] < z["lo"]:
                            z["tot"] = True
                            continue
                        if not z["getrennt"]:
                            if closes[t] >= z["hi"] + p.trennung_atr * atr[t]:
                                z["getrennt"] = True
                            continue
                        if z["beruehrt"] < 0 and lows[t] <= z["hi"]:
                            z["beruehrt"] = t
                        if z["beruehrt"] >= 0 and t - z["beruehrt"] > p.retrace_fenster:
                            z["tot"] = True  # getappt ohne Trigger -> verbraucht
                            continue
                        if np.isfinite(ny[t]) and z["lo"] <= ny[t] <= z["hi"]:
                            if z["beruehrt"] >= 0 and (aktive_long is None or z["beruehrt"] > aktive_long["beruehrt"]):
                                aktive_long = z
                    else:
                        if closes[t] > z["hi"]:
                            z["tot"] = True
                            continue
                        if not z["getrennt"]:
                            if closes[t] <= z["lo"] - p.trennung_atr * atr[t]:
                                z["getrennt"] = True
                            continue
                        if z["beruehrt"] < 0 and highs[t] >= z["lo"]:
                            z["beruehrt"] = t
                        if z["beruehrt"] >= 0 and t - z["beruehrt"] > p.retrace_fenster:
                            z["tot"] = True
                            continue
                        if np.isfinite(ny[t]) and z["lo"] <= ny[t] <= z["hi"]:
                            if z["beruehrt"] >= 0 and (aktive_short is None or z["beruehrt"] > aktive_short["beruehrt"]):
                                aktive_short = z

                # Gibt es heute ueberhaupt eine (noch lebende) Zone mit NY-VWAP
                # darin? Das entscheidet Continuation vs. Double Break (§5.3).
                zone_long_existiert = any(
                    not z["tot"] and z["getrennt"] and z["richtung"] == 1
                    and np.isfinite(ny[t]) and z["lo"] <= ny[t] <= z["hi"]
                    for z in zonen_status
                )
                zone_short_existiert = any(
                    not z["tot"] and z["getrennt"] and z["richtung"] == -1
                    and np.isfinite(ny[t]) and z["lo"] <= ny[t] <= z["hi"]
                    for z in zonen_status
                )

                im_fenster = 585 <= minute[t] <= 675
                frei = (
                    im_fenster
                    and signale_heute < p.max_signale_pro_tag
                    and t - letzter_trigger >= p.cooldown
                    and np.isfinite(ny[t]) and np.isfinite(ov[t]) and np.isfinite(pdv[t])
                )

                if frei:
                    align_long = closes[t] > ny[t] and closes[t] > ov[t] and closes[t] > pdv[t]
                    align_short = closes[t] < ny[t] and closes[t] < ov[t] and closes[t] < pdv[t]
                    # "NY VWAP tap": Docht beruehrt die Linie (T30/T31/T33),
                    # ein Close jenseits ist nicht noetig - der Reclaim-Close
                    # danach ist die Bestaetigung.
                    cross_auf = any(
                        lows[t - k] <= ny[t - k] for k in range(0, p.cross_fenster + 1)
                        if np.isfinite(ny[t - k])
                    )
                    cross_ab = any(
                        highs[t - k] >= ny[t - k] for k in range(0, p.cross_fenster + 1)
                        if np.isfinite(ny[t - k])
                    )

                    # ------------------------------------ Continuation (VIC)
                    if (
                        aktive_long is not None
                        and bias_long[t]
                        and break_up_bar >= 0
                        and align_long
                        and cross_auf
                        and closes[t] > highs[t - 1]
                    ):
                        t0 = aktive_long["beruehrt"]
                        basis = min(aktive_long["lo"], float(np.min(lows[t0 : t + 1])))
                        stop = _vwap_ausweichen(basis - p.stop_puffer_atr * atr[t], t, True)
                        dist = closes[t] - stop
                        if _stop_ok(dist):
                            ziel = swing_hoch[t]
                            if not np.isfinite(ziel) or ziel - closes[t] < p.min_swing_reward * dist:
                                ziel = closes[t] + dist  # 1:1-Fallback (T31)
                            signal[t] = 1
                            setup_art[t] = 1
                            stop_arr[t] = stop
                            ziel_arr[t] = ziel
                            aktive_long["tot"] = True
                            signale_heute += 1
                            letzter_trigger = t
                    elif (
                        p.allow_short
                        and aktive_short is not None
                        and bias_short[t]
                        and break_dn_bar >= 0
                        and align_short
                        and cross_ab
                        and closes[t] < lows[t - 1]
                    ):
                        t0 = aktive_short["beruehrt"]
                        basis = max(aktive_short["hi"], float(np.max(highs[t0 : t + 1])))
                        stop = _vwap_ausweichen(basis + p.stop_puffer_atr * atr[t], t, False)
                        dist = stop - closes[t]
                        if _stop_ok(dist):
                            ziel = swing_tief[t]
                            if not np.isfinite(ziel) or closes[t] - ziel < p.min_swing_reward * dist:
                                ziel = closes[t] - dist
                            signal[t] = -1
                            setup_art[t] = 1
                            stop_arr[t] = stop
                            ziel_arr[t] = ziel
                            aktive_short["tot"] = True
                            signale_heute += 1
                            letzter_trigger = t

                    # -------------------------------------- Double Break
                    elif (
                        not zone_long_existiert
                        and break_up_bar >= 0
                        and t - break_up_bar < p.db_fenster
                        and bias_long[t]
                        and align_long
                    ):
                        spanne = highs[t] - lows[t]
                        body = closes[t] - out["open"].to_numpy(float)[t]
                        clean = spanne > 0 and (highs[t] - closes[t]) <= p.clean_close_anteil * spanne
                        if body >= p.momentum_atr * atr[t] and clean:
                            basis = float(np.min(lows[max(start, t - 15) : t + 1]))
                            stop = _vwap_ausweichen(basis - p.stop_puffer_atr * atr[t], t, True)
                            dist = closes[t] - stop
                            if _stop_ok(dist):
                                signal[t] = 1
                                setup_art[t] = 2
                                stop_arr[t] = stop
                                ziel_arr[t] = closes[t] + p.db_reward * dist
                                signale_heute += 1
                                letzter_trigger = t
                    elif (
                        p.allow_short
                        and not zone_short_existiert
                        and break_dn_bar >= 0
                        and t - break_dn_bar < p.db_fenster
                        and bias_short[t]
                        and align_short
                    ):
                        spanne = highs[t] - lows[t]
                        body = out["open"].to_numpy(float)[t] - closes[t]
                        clean = spanne > 0 and (closes[t] - lows[t]) <= p.clean_close_anteil * spanne
                        if body >= p.momentum_atr * atr[t] and clean:
                            basis = float(np.max(highs[max(start, t - 15) : t + 1]))
                            stop = _vwap_ausweichen(basis + p.stop_puffer_atr * atr[t], t, False)
                            dist = stop - closes[t]
                            if _stop_ok(dist):
                                signal[t] = -1
                                setup_art[t] = 2
                                stop_arr[t] = stop
                                ziel_arr[t] = closes[t] - p.db_reward * dist
                                signale_heute += 1
                                letzter_trigger = t
                t += 1

        out["vic_signal"] = signal
        out["vic_setup"] = setup_art
        out["vic_stop"] = stop_arr
        out["vic_target"] = ziel_arr
        return out

    def params(self) -> dict[str, float | str]:
        return self.p.to_dict()

    # ----------------------------------------------------------------- Signal
    def signal(self, frame: pd.DataFrame, index: int) -> Signal | None:
        arrays = self._cache.arrays(frame, _COLUMNS)
        richtung = arrays["vic_signal"][index]
        if richtung == 0:
            return None
        side = Side.LONG if richtung > 0 else Side.SHORT
        return Signal(
            side=side,
            stop_price=float(arrays["vic_stop"][index]),
            target_price=float(arrays["vic_target"][index]),
            setup="vic_cont" if arrays["vic_setup"][index] == 1 else "vic_db",
        )
