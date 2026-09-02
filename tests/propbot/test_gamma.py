"""Tests der Gamma-Auswertung (ohne Netzzugriff)."""

from __future__ import annotations

import pytest

from propbot.gamma import rechne_gamma


def kette(kurs: float, optionen: list[tuple[str, float, float, float]]) -> dict:
    """Baut eine CBOE-aehnliche Kette: (Typ, Strike, Gamma, Open Interest)."""
    return {
        "data": {
            "current_price": kurs,
            "options": [
                {
                    "option": f"NDX260918{typ}{int(strike * 1000):08d}",
                    "gamma": gamma,
                    "open_interest": oi,
                }
                for typ, strike, gamma, oi in optionen
            ],
        }
    }


def test_calls_und_puts_wirken_gegeneinander() -> None:
    nur_calls = rechne_gamma(kette(20_000, [("C", 20_000, 0.001, 1000)]))
    nur_puts = rechne_gamma(kette(20_000, [("P", 20_000, 0.001, 1000)]))

    assert nur_calls.netto_gamma > 0 and nur_calls.regime == "positiv"
    assert nur_puts.netto_gamma < 0 and nur_puts.regime == "negativ"
    assert nur_calls.netto_gamma == pytest.approx(-nur_puts.netto_gamma)


def test_weit_entfernte_strikes_fliegen_raus() -> None:
    profil = rechne_gamma(
        kette(20_000, [("C", 20_000, 0.001, 1000), ("C", 40_000, 0.001, 99_999)]),
        max_abstand=0.15,
    )

    assert list(profil.je_strike) == [20_000.0], "Strike bei +100 % gehoert nicht dazu"


def test_optionen_ohne_open_interest_zaehlen_nicht() -> None:
    profil = rechne_gamma(kette(20_000, [("C", 20_000, 0.001, 0)]))

    assert profil.netto_gamma == 0
    assert profil.je_strike == {}


def test_flip_liegt_zwischen_puts_und_calls() -> None:
    profil = rechne_gamma(
        kette(
            20_000,
            [("P", 19_000, 0.001, 5000), ("P", 19_500, 0.001, 5000), ("C", 20_500, 0.002, 8000)],
        )
    )

    assert profil.flip_kurs is not None
    assert 19_000 <= profil.flip_kurs <= 20_500


def test_groesste_strikes_sind_sortiert() -> None:
    profil = rechne_gamma(kette(20_000, [("C", 20_100, 0.001, 1000), ("C", 20_200, 0.005, 4000)]))
    groesste = profil.groesste_strikes(2)

    assert groesste[0][0] == 20_200
    assert abs(groesste[0][1]) > abs(groesste[1][1])


def test_kette_ohne_kurs_fliegt_auf() -> None:
    with pytest.raises(ValueError, match="Kurs"):
        rechne_gamma({"data": {"options": []}})


def test_bericht_nennt_regime_und_deutung() -> None:
    text = rechne_gamma(kette(20_000, [("C", 20_000, 0.001, 1000)])).describe()

    assert "Gamma-Profil" in text and "Netto-Gamma" in text
    assert "verzoegert" in text, "die Verzoegerung gehoert in den Bericht"
