# Paket 080 · wording

Schritte: 1 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/hi.js, web/js/lang/pt.js, web/js/lang/zh.js
Betroffene Tests laut Spezifikation: web/e2e/langtest.js
Baut auf Paketen auf: 9, 16, 17, 19, 24, 27, 31, 33, 34, 37, 41, 50, 58, 79

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## wording-S18.1 · Wörterbücher: geänderte Schlüssel nach Regel 1.5 umbenennen bzw. löschen (Schritte 1–17)

Gruppe wording · Cluster wording · Aufwand L · Befunde: wording-3, wording-9, wording-6, bereich_shell-34, wording-44, wording-43, wording-39, wording-40, wording-25, wording-41, wording-36, wording-37, wording-33, bereich_konto-42, wording-55, bereich_notebook_news-27, bereich_notebook_news-28, wording-5, wording-11, wording-63, wording-24, bereich_konto-43
Quelle: audit/spec/wording.md Z. 611–613 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/hi.js, web/js/lang/pt.js, web/js/lang/zh.js
Abhängig von: wording-S1.1-1.3, wording-S1.4-1.7, wording-S2.1, wording-S2.2-2.4, wording-S2.5-2.13, wording-S2.14, wording-S5.1-5.2, wording-S5.4-5.5, wording-S5.6-5.8, wording-S6.1-6.4, wording-S6.5-6.10, wording-S6.11-6.15, wording-S6.16-6.18, wording-S6.19-6.22, wording-S7.1-7.3, wording-S7.4-7.6, wording-S8.1-8.2, wording-S8.3-8.5, wording-S8.6-8.9, wording-S9.1-9.2, wording-S9.3-9.7, wording-S9.8-9.9, wording-S9.10-9.16, wording-S9.17, wording-S10.1-10.7, wording-S10.8-10.12, wording-S10.13-10.15, wording-S11.1-11.5, wording-S11.6-11.11, wording-S12.1-12.3, wording-S12.4-12.5, wording-S12.6-12.7, wording-S12.8-12.12, wording-S12.13-12.16, wording-S12.17-12.20, wording-S12.21-12.23, wording-S12.24-12.26, wording-S12.27, wording-S12.28-12.29, wording-S12.30, wording-S13.3-13.7, wording-S14.1-14.7, wording-S14.8-14.9, wording-S14.10-14.11, wording-S15.1-15.3, wording-S15.4-15.5, wording-S15.6-15.9, wording-S15.10-15.15, wording-S15.16-15.21, wording-S16.1-16.4, wording-S17.1, wording-S17.2-17.3, wording-S17.4-17.7, wording-S17.8-17.10, wording-S17.11-17.12, wording-S17.13-17.15, wording-S17.16-17.18, wording-S17.19-17.21, wording-S17.22, wording-S17.23-17.27, wording-S17.28, wording-S17.29-17.30

```text
### Schritt 18 · `web/js/lang/{en,es,hi,pt,zh}.js` und `web/e2e/i18n`

1. Für jede Zeile der Schritte 1–17 mit geändertem deutschem Text Regel 1.5 anwenden. Bekannte umzubenennende Schlüssel (Auswahl, Zeilen in en.js): „Win-Rate“ (767), „Winrate“, „Ø Winrate“, „Ø Tages-Win-Rate“, „Ø Trade-Gewinn/Verlust“, „Netto P&L“ (760), „Profil vervollständigen“ (927), „{0} von {1} eingehalten“ (358), „% Regeln eingehalten“ (501), „Mit allen Regeln eingehalten“ (548), „Equity: echt vs. Schatten-Ich“ (551), „Mein Regelwerk“, „Stopp nach Verlusten in Folge“ (+ „: Verluste“), „P&L aktive Konten“ (613), „Bestanden, geplatzt oder archiviert“ (938, klein → groß), „noch {0} Stop-Losses“, „noch 1 Stop-Loss“, „{0} Puffer / {1} je Stop-Loss“, „Coach Mode einrichten“, „Rabatt-Codes für Prop Firms erscheinen hier.“ (1381), „Kürzlich gelöscht“, „Aufklappbare Liste“, „Check-in nachtragen“, „Wochen-Recap“, „Neuer Performance-Recap“, „Trade speichern“ (entfällt), „Standardfarben“ (entfällt), „{0} Notiz von euch“ (1325), „{0} Notizen von euch“ (1326), „Kurz-Stats nur in R und Prozent · ab {0}“.
```
