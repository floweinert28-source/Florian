# Paket 071 · wording, konto

Schritte: 6 · Dateien: web/README.md, web/e2e/coachlang.js, web/e2e/coachtest.js, web/e2e/dashtest.js, web/e2e/i18n/en/part-audit-wording.json, web/e2e/i18n/es/part-audit-wording.json, web/e2e/i18n/hi/part-audit-wording.json, web/e2e/i18n/pt/part-audit-wording.json, web/e2e/i18n/zh/part-audit-wording.json, web/e2e/mentortest.js, web/e2e/rptest.js, web/e2e/scorestatetest.js, web/e2e/settest.js, web/e2e/settest2.js, web/e2e/tradeformtest.js, web/e2e/usercardtest.js, web/js/lang/en.js, web/js/lang/es.js, web/js/lang/hi.js, web/js/lang/pt.js, web/js/lang/zh.js
Betroffene Tests laut Spezifikation: web/e2e/coachlang.js:11; web/e2e/coachlang.js:12; web/e2e/coachlang.js:14; web/e2e/coachtest.js:135; web/e2e/coachtest.js:37; web/e2e/dashtest.js:67; web/e2e/langtest.js; web/e2e/mentortest.js:24; web/e2e/rptest.js:9; web/e2e/scorestatetest.js:10; web/e2e/settest.js:10; web/e2e/settest2.js:47; web/e2e/tradeformtest.js:52; web/e2e/tradeformtest.js:54; web/e2e/usercardtest.js:11
Baut auf Paketen auf: 7, 14, 16, 19, 20, 26, 28, 31, 35, 44, 51, 69, 70

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## wording-S19-coach · Tests anpassen: coachtest, coachlang

Gruppe wording · Cluster konto · Aufwand S · Befunde: bereich_konto-42, bereich_konto-43
Quelle: audit/spec/wording.md Z. 626–629 · Dateien: web/e2e/coachtest.js, web/e2e/coachlang.js
Abhängig von: wording-S15.6-15.9, wording-S15.10-15.15, wording-S18.1

```text
| e2e/coachtest.js:37 | `=== 'Coach Mode einrichten'` → `=== 'Coach einrichten'` | bereich_konto-42 |
| e2e/coachtest.js:135 | `taskCell === '1 offen von 2'` → `taskCell === '1 von 2 offen'` | bereich_konto-43 |
| e2e/coachlang.js:11/12 | Probe `I18N.t('Kurz-Stats nur in R und Prozent · ab 01.10.2026')` → `I18N.t('Daten ab 01.10.2026')`, Prüfung `!pat[2].startsWith('Kurz-Stats')` → `!pat[2].startsWith('Daten ab')` | bereich_konto-43 |
| e2e/coachlang.js:14 | `h2 !== 'Coach Mode einrichten'` → `h2 !== 'Coach einrichten'` | bereich_konto-42 |
```

## wording-S18.2 · Wörterbücher: neue Einzahl-Muster und zusammengesetzte Zählmuster für U.count

Gruppe wording · Cluster wording · Aufwand M · Befunde: zustaende-28
Quelle: audit/spec/wording.md Z. 614–614 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/hi.js, web/js/lang/pt.js, web/js/lang/zh.js
Abhängig von: wording-S1.1-1.3, wording-S1.4-1.7, wording-S2.14, wording-S5.6-5.8, wording-S6.1-6.4, wording-S6.5-6.10, wording-S6.11-6.15, wording-S6.16-6.18, wording-S8.6-8.9, wording-S9.1-9.2, wording-S9.3-9.7, wording-S9.8-9.9, wording-S10.1-10.7, wording-S10.8-10.12, wording-S11.1-11.5, wording-S12.8-12.12, wording-S12.28-12.29, wording-S14.8-14.9, wording-S15.10-15.15, wording-S16.1-16.4, wording-S17.23-17.27, wording-S17.29-17.30

```text
2. Neue Einzahl-Muster: „{0} Trade“, „{0} Tag“, „{0} Handelstag“, „{0} Notiz“, „{0} Gewinn“, „{0} Verlust“, „{0} Mentor-Notiz“ samt der zusammengesetzten Muster („{0} von {1} Trade“, „{0} – {1} von {2} Trade“, „{0} Trade · {1} Handelstag“ …).
```

## wording-S18.3 · Neue Etappe-1-Schlüssel in e2e/i18n/<lang>/part-audit-wording.json eintragen

Gruppe wording · Cluster wording · Aufwand S · Befunde: —
Quelle: audit/spec/wording.md Z. 615–616 · Dateien: web/e2e/i18n/en/part-audit-wording.json, web/e2e/i18n/es/part-audit-wording.json, web/e2e/i18n/hi/part-audit-wording.json, web/e2e/i18n/pt/part-audit-wording.json, web/e2e/i18n/zh/part-audit-wording.json
Abhängig von: wording-S18.1, wording-S18.2

```text
3. Neue Etappe-1-Schlüssel zusätzlich nach `web/e2e/i18n/<lang>/part-audit-wording.json`.

```

## wording-S19-shell · Tests anpassen: scorestatetest, usercardtest, rptest, settest, mentortest

Gruppe wording · Cluster wording · Aufwand S · Befunde: wording-3, bereich_shell-34, bereich_shell-33, wording-60, wording-14
Quelle: audit/spec/wording.md Z. 617–625 · Dateien: web/e2e/scorestatetest.js, web/e2e/usercardtest.js, web/e2e/rptest.js, web/e2e/settest.js, web/e2e/mentortest.js
Abhängig von: wording-S2.1, wording-S5.1-5.2, wording-S17.1, wording-S17.11-17.12

```text
### Schritt 19 · Tests anpassen (`web/e2e`, `web/tests`)

| Datei:Zeile | vorher → nachher | ids |
|---|---|---|
| e2e/scorestatetest.js:10 | `/Win-Rate/.test(sc.labels)` → `/Trefferquote/.test(sc.labels)` | wording-3 |
| e2e/usercardtest.js:11 | `'Trader / Profil vervollständigen'` → `'Trader / Profil ergänzen'` (auch Meldung) | bereich_shell-34 |
| e2e/rptest.js:9 | `'Übersicht,Journal,Training,Konten'` → `'Übersicht,Journal,Training,Prop Trading'` (auch Meldung) | bereich_shell-33 |
| e2e/settest.js:10 | `['logs', 'Logs']` → `['logs', 'Verlauf']` | wording-60 |
| e2e/mentortest.js:24 | `.includes('Mentor')` → `.includes('Server')` | wording-14 |
```

## wording-S19-rest · Tests anpassen: tradeformtest, dashtest, settest2; sampletest, core.test, certtest bleiben unverändert

Gruppe wording · Cluster wording · Aufwand S · Befunde: bereich_trades_tag-47, bereich_trades_tag-22, wording-48, wording-24, wording-21, wording-8, wording-45, bereich_dashboard-29
Quelle: audit/spec/wording.md Z. 639–645 · Dateien: web/e2e/tradeformtest.js, web/e2e/dashtest.js, web/e2e/settest2.js
Abhängig von: wording-S9.10-9.16, wording-S6.11-6.15, wording-S17.8-17.10, wording-S17.4-17.7, wording-S2.5-2.13, wording-S16.1-16.4, wording-S8.1-8.2

```text
| e2e/tradeformtest.js:52/54 | `'.card [data-action=trade-journal]'` → `'.card-head [data-action=trade-journal]'` (der neue Knopf im MAE-Leerzustand zählt nicht mit) | bereich_trades_tag-47, bereich_trades_tag-22 |
| e2e/dashtest.js:67 | Meldung „Mehr anzeigen“ → „Zum TradeLog“ (Prüfung auf `href="#/trades"` bleibt) | wording-48 |
| e2e/settest2.js:47 | Meldung „Standardfarben“ → „Auf Standard zurücksetzen“ (Selektor bleibt) | wording-24 |
| e2e/sampletest.js:118 | unverändert grün (Replay ist in der Suite freigeschaltet) | wording-21 |
| tests/core.test.mjs:100 | unverändert (16 Kennzahlen) | wording-8 |
| e2e/certtest.js:9/45/54 | unverändert (4 Einträge, Kartentitel englisch, Knopf in der Tagesansicht) | wording-45, bereich_dashboard-29 |

```

## wording-S20 · web/README.md an neue Begriffe und Bedienung anpassen (Zeilen 39–318)

Gruppe wording · Cluster wording · Aufwand M · Befunde: bereich_trades_tag-22, wording-6, bereich_dashboard-31, wording-32, wording-9, wording-5, wording-14, wording-60, wording-3, wording-41, wording-40, wording-25, wording-33, bereich_shell-33, wording-55, bereich_konto-30, wording-20, bereich_shell-32
Quelle: audit/spec/wording.md Z. 646–663 · Dateien: web/README.md
Abhängig von: wording-S9.10-9.16, wording-S6.5-6.10, wording-S7.4-7.6, wording-S6.19-6.22, wording-S5.3, wording-S17.1, wording-S17.11-17.12, wording-S15.4-15.5, wording-S15.6-15.9, wording-S15.10-15.15, wording-S11.1-11.5, wording-S11.6-11.11, wording-S12.8-12.12, wording-S5.1-5.2, wording-S12.30, wording-S13.3-13.7, wording-S5.9, wording-S17.4-17.7

```text
### Schritt 20 · `web/README.md`

| Zeile | vorher → nachher | ids |
|---|---|---|
| 39 | „(Trade-Ansicht → „Bearbeiten“ an „Plan vs. Ausführung“ oder „Tags & Notizen“ …)“ → „(Trade-Ansicht → „Plan bearbeiten“ bzw. „Tags bearbeiten“ …)“; Satz ergänzen: „„Trade bearbeiten“ und „Löschen“ stehen oben in der Zeile mit TradeLog und Datum.“ | bereich_trades_tag-22 |
| 65 | „Netto P&L“ → „Netto-P&L“ | wording-6 |
| 78 | „Intraday/Multiday, Reviewed“ → „Intraday/Mehrtägig, Nachbereitet“ | bereich_dashboard-31 |
| 84 | „(Ampel, Balance, Puffer …)“ → „(Ampel, Kontostand, Puffer …)“ | wording-32 |
| 99–100 | „`short`-Titel „Ø Gewinn/Verlust““ → „Kacheltitel „Ø Gewinn/Verlust““ | wording-9 |
| 108 | ergänzen: „„Trade loggen“ in der Kopfreihe übernimmt an anderen Tagen das Datum (09:00).“ | wording-5 |
| 116, 143, 156, 171 | „Einstellungen → Mentor“ → „Einstellungen → Server“; in 171 den Bereich „Mentor“ → „Server“ und „Logs (Imports und Verlauf)“ → „Verlauf (Importe und Änderungen)“ | wording-14, wording-60 |
| 151, 169, 190 | „Winrate“ → „Trefferquote“ | wording-3 |
| 216, 219, 224 | „Stopp nach Verlustserie“ → „Schluss nach Verlustserie“; „Equity echt vs. Schatten“ → „Kumulierter Netto-P&L (echt und Schatten-Ich)“; „„Mein Regelwerk““ → „„Regelwerk““ | wording-41, wording-40, wording-25 |
| 259 | „Puffer in Stop-Losses“ → „Puffer in Stops“ | wording-33 |
| 264 | „in der Gruppe Konten“ → „in der Gruppe Prop Trading“; „Rabatt-Codes“ → „Coupon-Codes“ | bereich_shell-33, wording-55 |
| 269–273 | „Provision in %, verdient“ → „Satz, Provision“; „Über“ → „Quelle“; „Provision = Umsatz × Prozent des Creators“ → „Provision = Umsatz × Satz des Creators“; „Provision“ (Creator-Kachel) → „Provisionssatz“ | bereich_konto-30 |
| 318 | „Tastatur: **N** neuer Trade, **1–6** Bereiche, **Esc** schließt Dialoge.“ → „Tastatur: **N** Trade loggen, **1–9** Bereiche, **Esc** schließt Dialoge. Die Taste 0 öffnet Blind-Replay nur, wenn es freigeschaltet ist.“ | wording-20, bereich_shell-32 |

```
