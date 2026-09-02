"""Tests der Kommandozeile - jeder Befehl muss ohne Absturz durchlaufen."""

from __future__ import annotations

import re

import pytest

from propbot.cli import build_parser, main


def test_hilfe_wird_angezeigt(capsys) -> None:
    with pytest.raises(SystemExit) as exit_info:
        main(["--help"])

    assert exit_info.value.code == 0
    assert "Prop-Firm-Trading-Bot" in capsys.readouterr().out


def test_math_bericht(capsys) -> None:
    assert main(["math", "--win-rate", "0.45", "--reward-ratio", "2.0"]) == 0

    ausgabe = capsys.readouterr().out
    assert "Payout" in ausgabe and "Fazit" in ausgabe


def test_backtest_laeuft_und_meldet(capsys) -> None:
    code = main(["backtest", "--bars", "3000", "--seed", "5", "--no-adaptive"])

    assert code in (0, 1)
    assert "Backtest" in capsys.readouterr().out


def test_eigene_kontoregeln_werden_uebernommen(capsys) -> None:
    main(["--balance", "25000", "--target", "1500", "--drawdown", "1000", "math"])

    ausgabe = capsys.readouterr().out
    assert "25,000" in ausgabe and "1,500" in ausgabe


def test_lessons_geben_empfehlungen(capsys) -> None:
    assert main(["lessons", "--bars", "3000", "--seed", "7"]) == 0

    assert "Empfehlungen" in capsys.readouterr().out


def test_backtest_schreibt_ins_journal(tmp_path, capsys) -> None:
    pfad = str(tmp_path / "journal.db")
    main(["--journal-path", pfad, "backtest", "--bars", "3000", "--journal"])
    capsys.readouterr()

    assert main(["--journal-path", pfad, "journal"]) == 0
    assert "Laeufe" in capsys.readouterr().out


def test_montecarlo_laeuft(capsys) -> None:
    assert main(["montecarlo", "--bars", "4000", "--seed", "3", "--runs", "200"]) in (0, 1)

    ausgabe = capsys.readouterr().out
    assert "Monte-Carlo" in ausgabe or "zu wenig" in ausgabe


def test_montecarlo_stichprobe_endet_nicht_beim_payout(capsys) -> None:
    """Die Stichprobe darf nicht aus einem Lauf unter den echten Regeln kommen.

    Ein solcher Lauf bricht beim Payout ab. Simuliert man daraus die
    Payout-Wahrscheinlichkeit, beantwortet man die Frage mit Daten, die per
    Konstruktion einen Payout enthalten - das Ergebnis ist zirkulaer und viel
    zu optimistisch. Deshalb muss die Grundlage mehr Trades haben als der
    Backtest unter den echten Regeln liefert.
    """
    argumente = ["--bars", "12000", "--seed", "5"]
    assert main(["backtest", *argumente]) in (0, 1)
    backtest = capsys.readouterr().out

    assert main(["montecarlo", *argumente, "--runs", "200"]) in (0, 1)
    montecarlo = capsys.readouterr().out

    treffer = re.search(r"Trades:\s+(\d+) in", backtest)
    grundlage = re.search(r"Grundlage: (\d+) Trades", montecarlo)
    if treffer is None or grundlage is None:
        pytest.skip("Zu wenige Trades fuer den Vergleich")

    assert "ueber den ganzen Datensatz" in montecarlo
    assert int(grundlage.group(1)) >= int(treffer.group(1))


def test_bericht_kann_gespeichert_werden(tmp_path, capsys) -> None:
    ziel = tmp_path / "bericht.txt"
    main(["math", "--out", str(ziel)])

    assert ziel.exists() and "Konto" in ziel.read_text(encoding="utf-8")


def test_unbekannte_konfiguration_meldet_sich(capsys) -> None:
    assert main(["--config", "/gibt/es/nicht.json", "math"]) == 2


def test_parser_kennt_alle_befehle() -> None:
    parser = build_parser()
    aktionen = [action for action in parser._actions if action.dest == "command"]

    assert set(aktionen[0].choices) == {
        "math",
        "backtest",
        "montecarlo",
        "walkforward",
        "lessons",
        "paper",
        "live",
        "journal",
        "fetch",
        "validate",
        "chart",
        "zeitprofil",
    }
