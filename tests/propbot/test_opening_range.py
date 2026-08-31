"""Tests des Opening-Range-Breakouts."""

from __future__ import annotations

import numpy as np
import pandas as pd
import pytest

from propbot.engine import check_no_lookahead
from propbot.models import Side
from propbot.strategy import OpeningRange, OpeningRangeParams, SessionWindow


def tag(datum: str, kerzen: list[tuple[float, float, float, float]], minuten: int = 15):
    """Baut einen Handelstag ab 09:30 New York.

    Der Startpunkt wird in New Yorker Ortszeit gesetzt und erst dann nach UTC
    umgerechnet - sonst laege der Tag im Sommer eine Stunde daneben. Genau
    dieser Fehler ist beim Schreiben dieser Tests zuerst passiert.
    """
    start = pd.Timestamp(f"{datum} 09:30", tz="America/New_York").tz_convert("UTC")
    index = [start + pd.Timedelta(minutes=minuten * i) for i in range(len(kerzen))]
    return pd.DataFrame(kerzen, columns=["open", "high", "low", "close"], index=index)


def markt(tage: list[pd.DataFrame]) -> pd.DataFrame:
    frame = pd.concat(tage)
    frame["volume"] = 1.0
    frame.index.name = "time"
    return frame


def ruhiger_tag(datum: str, basis: float = 15_000.0) -> pd.DataFrame:
    """Ein Tag ohne Ausbruch - dient als Vorlauf fuer den ATR.

    Die Kerzenspanne von 60 Punkten ist bewusst realistisch gewaehlt: mit
    winzigen Vorlaufkerzen waere der ATR so klein, dass der Spannenfilter
    (max_range_atr) jeden spaeteren Ausbruch aussortiert.
    """
    kerzen = [(basis, basis + 30, basis - 30, basis) for _ in range(26)]
    return tag(datum, kerzen)


def vorlauf(anzahl: int = 60) -> list[pd.DataFrame]:
    tage = pd.bdate_range("2023-01-02", periods=anzahl)
    return [ruhiger_tag(f"{t:%Y-%m-%d}") for t in tage]


def test_parameter_werden_geprueft() -> None:
    with pytest.raises(ValueError):
        OpeningRangeParams(range_minutes=0)
    with pytest.raises(ValueError):
        OpeningRangeParams(stop_mode="wuerfeln")
    with pytest.raises(ValueError):
        OpeningRangeParams(min_range_atr=3.0, max_range_atr=1.0)
    with pytest.raises(ValueError):
        OpeningRangeParams(max_signals_per_day=0)


def test_spanne_kommt_nur_aus_den_ersten_minuten() -> None:
    ausbruch = tag(
        "2023-03-28",
        [(15_000, 15_050, 14_950, 15_000)]  # 09:30-09:45: Spanne 14.950 - 15.050
        + [(15_000, 15_100, 14_990, 15_090)]  # 09:45: Ausbruch nach oben
        + [(15_090, 15_100, 15_080, 15_090) for _ in range(24)],
    )
    strategie = OpeningRange()
    daten = strategie.prepare(markt(vorlauf() + [ausbruch]))
    letzter_tag = daten[daten.index.date == pd.Timestamp("2023-03-28").date()]

    assert letzter_tag["or_high"].iloc[1] == pytest.approx(15_050)
    assert letzter_tag["or_low"].iloc[1] == pytest.approx(14_950)
    assert not letzter_tag["long_signal"].iloc[0], "waehrend der Spanne gibt es kein Signal"
    assert letzter_tag["long_signal"].iloc[1], "die Kerze danach bricht aus"


def test_stop_liegt_an_der_gegenseite_der_spanne() -> None:
    ausbruch = tag(
        "2023-03-28",
        [(15_000, 15_050, 14_950, 15_000)]
        + [(15_000, 15_100, 14_990, 15_090)]
        + [(15_090, 15_100, 15_080, 15_090) for _ in range(24)],
    )
    strategie = OpeningRange()
    daten = strategie.prepare(markt(vorlauf() + [ausbruch]))
    index = int(np.flatnonzero(daten["long_signal"].to_numpy())[0])
    signal = strategie.signal(daten, index)

    assert signal is not None and signal.side is Side.LONG
    assert signal.stop_price == pytest.approx(14_950, abs=1.0), "Stop = Tief der Spanne"
    einstieg = float(daten["close"].iloc[index])
    assert signal.reward_ratio(einstieg) == pytest.approx(2.0, abs=0.01)


def test_nur_ein_signal_je_tag() -> None:
    kerzen = [(15_000, 15_050, 14_950, 15_000)]
    for i in range(25):  # abwechselnd ueber und unter der Spanne
        preis = 15_100 if i % 2 == 0 else 14_900
        kerzen.append((preis, preis + 20, preis - 20, preis))
    daten = OpeningRange().prepare(markt(vorlauf() + [tag("2023-03-28", kerzen)]))
    letzter = daten[daten.index.date == pd.Timestamp("2023-03-28").date()]

    assert int(letzter["long_signal"].sum() + letzter["short_signal"].sum()) == 1


def test_zwei_signale_wenn_erlaubt() -> None:
    kerzen = [(15_000, 15_050, 14_950, 15_000)]
    for i in range(25):
        preis = 15_100 if i % 2 == 0 else 14_900
        kerzen.append((preis, preis + 20, preis - 20, preis))
    strategie = OpeningRange(OpeningRangeParams(max_signals_per_day=2))
    daten = strategie.prepare(markt(vorlauf() + [tag("2023-03-28", kerzen)]))
    letzter = daten[daten.index.date == pd.Timestamp("2023-03-28").date()]

    assert int(letzter["long_signal"].sum() + letzter["short_signal"].sum()) == 2


def test_shorts_lassen_sich_abschalten() -> None:
    kerzen = [(15_000, 15_050, 14_950, 15_000)] + [
        (14_900, 14_910, 14_800, 14_850) for _ in range(25)
    ]
    daten = OpeningRange(OpeningRangeParams(allow_short=False)).prepare(
        markt(vorlauf() + [tag("2023-03-28", kerzen)])
    )

    assert int(daten["short_signal"].sum()) == 0


def test_zu_breite_spanne_wird_uebersprungen() -> None:
    """Eine Spanne von vielen ATR bedeutet Chaos, keine Gelegenheit.

    Der Kurs steigt hier klar ueber das Hoch der Eroeffnungsspanne - gehandelt
    wird trotzdem nicht, weil die Spanne selbst zu breit ist.
    """
    kerzen = [(15_000, 16_000, 14_000, 15_000)]  # 2.000 Punkte Eroeffnungsspanne
    for i in range(25):  # danach normale Kerzen, die ueber das Hoch laufen
        basis = 15_600 + i * 40
        kerzen.append((basis, basis + 60, basis - 60, basis + 50))
    daten = OpeningRange(OpeningRangeParams(max_range_atr=1.0)).prepare(
        markt(vorlauf() + [tag("2023-03-28", kerzen)])
    )
    letzter = daten[daten.index.date == pd.Timestamp("2023-03-28").date()]

    assert (letzter["close"] > letzter["or_high"]).any(), "der Kurs bricht aus"
    assert int(letzter["long_signal"].sum()) == 0, "die Spanne war trotzdem zu breit"


def test_nach_der_deadline_kein_einstieg() -> None:
    kerzen = [(15_000, 15_050, 14_950, 15_000)] + [
        (15_000, 15_010, 14_990, 15_000) for _ in range(20)
    ]
    kerzen.append((15_000, 15_200, 14_990, 15_150))  # spaeter Ausbruch
    kerzen += [(15_150, 15_160, 15_140, 15_150) for _ in range(4)]
    strategie = OpeningRange(OpeningRangeParams(entry_deadline_minutes=60))
    daten = strategie.prepare(markt(vorlauf() + [tag("2023-03-28", kerzen)]))
    letzter = daten[daten.index.date == pd.Timestamp("2023-03-28").date()]

    assert int(letzter["long_signal"].sum()) == 0


def test_stop_modi_unterscheiden_sich() -> None:
    ausbruch = tag(
        "2023-03-28",
        [(15_000, 15_050, 14_950, 15_000)]
        + [(15_000, 15_100, 14_990, 15_090)]
        + [(15_090, 15_100, 15_080, 15_090) for _ in range(24)],
    )
    daten_roh = markt(vorlauf() + [ausbruch])
    abstaende = {}
    for modus in ("range", "fraction", "atr"):
        strategie = OpeningRange(
            OpeningRangeParams(
                stop_mode=modus, stop_fraction=0.5, min_stop_atr=0.1, max_stop_atr=20
            )
        )
        daten = strategie.prepare(daten_roh)
        index = int(np.flatnonzero(daten["long_signal"].to_numpy())[0])
        signal = strategie.signal(daten, index)
        abstaende[modus] = float(daten["close"].iloc[index]) - signal.stop_price

    assert abstaende["range"] > abstaende["fraction"] > 0
    assert abstaende["atr"] > 0


def test_kein_blick_in_die_zukunft_auf_echten_daten() -> None:
    from propbot.data import synthetic_market

    frame = synthetic_market(bars=4000, seed=17, timeframe_minutes=15)
    strategie = OpeningRange(session=SessionWindow.us_futures_rth())

    assert check_no_lookahead(strategie, frame, samples=15) == []


def test_kontext_enthaelt_spannenbreite() -> None:
    ausbruch = tag(
        "2023-03-28",
        [(15_000, 15_050, 14_950, 15_000)]
        + [(15_000, 15_100, 14_990, 15_090)]
        + [(15_090, 15_100, 15_080, 15_090) for _ in range(24)],
    )
    strategie = OpeningRange()
    daten = strategie.prepare(markt(vorlauf() + [ausbruch]))
    index = int(np.flatnonzero(daten["long_signal"].to_numpy())[0])

    kontext = strategie.context(daten, index)
    signal = strategie.signal(daten, index)

    assert "or_bucket" in kontext and "minute_bucket" in kontext
    assert signal.context["or_width"] == pytest.approx(100.0)
