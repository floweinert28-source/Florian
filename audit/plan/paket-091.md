# Paket 091 · wording

Schritte: 8 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/hi.js, web/js/lang/pt.js, web/js/lang/zh.js, web/js/screens/misc.js, web/js/store.js, web/js/theme.js
Betroffene Tests laut Spezifikation: web/e2e/langtest.js; web/e2e/settest.js:10
Baut auf Paketen auf: 12, 22, 25, 31, 35, 39, 42, 43, 47, 52, 61, 69, 90

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## wording-S17.1 · Einstellungs-Reiter „Server“ und „Verlauf“ (Schlüssel und Routen bleiben)

Gruppe wording · Cluster wording · Aufwand S · Befunde: wording-14, wording-60
Quelle: audit/spec/wording.md Z. 576–580 · Dateien: web/js/screens/misc.js
Abhängig von: —

```text
### Schritt 17 · `web/js/screens/misc.js`, `web/js/theme.js`, `web/js/store.js` (Einstellungen)

| # | Stelle | vorher → nachher | ids |
|---|---|---|---|
| 17.1 | misc.js:8 Reiter | `['mentor', 'Mentor', 'chat']` → `['mentor', 'Server', 'chat']`; `['logs', 'Logs', 'clock']` → `['logs', 'Verlauf', 'clock']` (Schlüssel und Routen bleiben) | wording-14, wording-60 |
```

## wording-S17.13-17.15 · Benachrichtigungen: „Recaps“, „Wochen-Recap“, „Monats-Recap“ mit neuen Auslöser-Sätzen

Gruppe wording · Cluster wording · Aufwand S · Befunde: wording-11, wording-12
Quelle: audit/spec/wording.md Z. 592–594 · Dateien: web/js/screens/misc.js
Abhängig von: —

```text
| 17.13 | misc.js:169 Recaps | `<h3 …>Performance-Recaps</h3><div class="small muted">Zusammenfassungen deiner Performance. Sie erscheinen als Hinweis oben auf dem Dashboard.</div>` → `<h3 …>Recaps</h3><div class="small muted">Zusammenfassungen deiner Trades. Sie erscheinen als Hinweis oben auf dem Dashboard.</div>` | wording-11 |
| 17.14 | misc.js:170 | `switchRow('Wöchentlicher Performance-Recap', 'Jeden Montag eine Zusammenfassung deiner Trading-Performance der Vorwoche. Wird ausgelöst, wenn bis Sonntag mindestens 4 geschlossene Trades geloggt wurden.', …)` → `switchRow('Wochen-Recap', 'Jeden Montag eine Zusammenfassung der Vorwoche, wenn du darin mindestens 4 Trades geschlossen hast.', …)` | wording-11, wording-12 |
| 17.15 | misc.js:171 | `switchRow('Monatlicher Performance-Recap', 'Am 2. jedes Monats eine Zusammenfassung des Vormonats. Wird ausgelöst, wenn bis zum 1. des Monats mindestens 4 geschlossene Trades geloggt wurden.', …)` → `switchRow('Monats-Recap', 'Am 2. jedes Monats eine Zusammenfassung des Vormonats, wenn du darin mindestens 4 Trades geschlossen hast.', …)` | wording-11, wording-12 |
```

## wording-S17.16-17.18 · Konten/Trading: „Tagesverlustlimit“, Trading-Untertitel nennt die Blöcke, Blocktitel „Märkte“

Gruppe wording · Cluster wording · Aufwand S · Befunde: wording-10, wording-26, wording-27
Quelle: audit/spec/wording.md Z. 595–597 · Dateien: web/js/screens/misc.js
Abhängig von: —

```text
| 17.16 | misc.js:186 Konten | `Die Kontogröße bestimmt Tageslimit, Score-Drawdown und Monte Carlo.` → `Die Kontogröße bestimmt Tagesverlustlimit, Score-Drawdown und Monte Carlo.` | wording-10 |
| 17.17 | misc.js:192 | `head('Trading', 'Passe dein Trading-Erlebnis an.')` → `head('Trading', 'Märkte, Break-even-Bereich, Geld-blind-Modus, Risiko und Warnungen.')` | wording-26 |
| 17.18 | misc.js:193 | `<h3>Was handelst du?</h3>` → `<h3>Märkte</h3>` | wording-27 |
```

## wording-S17.22 · Regeln-Untertitel verweist auf „Plan & Bewertung“

Gruppe wording · Cluster wording · Aufwand S · Befunde: wording-61
Quelle: audit/spec/wording.md Z. 601–601 · Dateien: web/js/screens/misc.js
Abhängig von: —

```text
| 17.22 | misc.js:207 Regeln | `'Deine Handelsregeln. Sie erscheinen im Trade-Editor, beim Session-Ende, im Fortschritt und im Regel-Tracker.'` → `'Deine Handelsregeln. Sie erscheinen in „Plan & Bewertung“ eines Trades, beim Session-Ende, im Fortschritt und im Regel-Tracker.'` | wording-61 |
```

## wording-S17.23-17.27 · Verlauf-Reiter: Unterreiter „Importe · Änderungen“, Leerzustände, Kopf; Sicherung-Dialog „Importieren“ mit Zähler

Gruppe wording · Cluster wording · Aufwand S · Befunde: wording-60, wording-22, zustaende-28
Quelle: audit/spec/wording.md Z. 602–606 · Dateien: web/js/screens/misc.js
Abhängig von: wording-S1.1-1.3

```text
| 17.23 | misc.js:250 Unterreiter | `[['imports', 'Imports'], ['verlauf', 'Verlauf']]` → `[['imports', 'Importe'], ['verlauf', 'Änderungen']]` | wording-60 |
| 17.24 | misc.js:255 | `<b>Noch keine Imports</b><span class="small">CSV-Importe und eingespielte Sicherungen erscheinen hier.</span>` → `<b>Noch keine Importe</b><span class="small">CSV-Importe und importierte Sicherungen erscheinen hier.</span>` | wording-60, wording-22 |
| 17.25 | misc.js:260 | `<b>Noch kein Verlauf</b>` → `<b>Noch keine Änderungen</b>` | wording-60 |
| 17.26 | misc.js:262 | `head('Logs', 'Import- und Änderungsverlauf deines Journals.')` → `head('Verlauf', 'Importe und Änderungen in deinem Journal.')` | wording-60 |
| 17.27 | misc.js:365 Sicherung-Dialog | Knopf `>Einspielen</button>` → `>Importieren</button>`; Toast `` `Sicherung eingespielt (${r.trades} Trades)` `` → `` `Sicherung importiert (${U.count(r.trades, 'Trade', 'Trades')})` `` | wording-22, zustaende-28 |
```

## wording-S17.28 · Schrift-Beschreibungen in FONTS.desc

Gruppe wording · Cluster wording · Aufwand S · Befunde: bereich_einstellungen-45
Quelle: audit/spec/wording.md Z. 607–607 · Dateien: web/js/theme.js
Abhängig von: —

```text
| 17.28 | theme.js:10–13 `FONTS.desc` | modern `'Standard: klar und modern, Zahlen in Onest'` → `'Satoshi · Zahlen in Onest'`; geschwungen `'Leicht und geschwungen, Zahlen in Onest'` → `'Quicksand · Zahlen in Onest'`; rund `'Weiche, runde Formen'` → `'Nunito · auch für Zahlen'`; klassisch `'Klar und neutral, Zahlen in Roboto'` → `'Systemschrift · Zahlen in Roboto'` | bereich_einstellungen-45 |
```

## wording-S17.29-17.30 · store.js: Willkommensnotiz „importieren“, Verlaufseinträge mit U.count (wenn root.UI geladen)

Gruppe wording · Cluster wording · Aufwand S · Befunde: wording-22, zustaende-28
Quelle: audit/spec/wording.md Z. 608–610 · Dateien: web/js/store.js
Abhängig von: wording-S1.1-1.3

```text
| 17.29 | store.js:371 Willkommensnotiz | `… eine Sicherung exportieren und wieder einspielen.` → `… eine Sicherung exportieren und wieder importieren.` (wirkt nur für neue Notizen) | wording-22 |
| 17.30 | store.js:134 / :281 Verlaufseinträge | `` `${e.file || ''} · ${e.count || 0} Trades` `` → `` `${e.file || ''} · ${U.count(e.count || 0, 'Trade', 'Trades')}` `` nur, wenn `root.UI` geladen ist, sonst wie bisher; ebenso :281 (`${g.trades.length} Trades`) | zustaende-28 |

```

## wording-S18.1 · Wörterbücher: geänderte Schlüssel nach Regel 1.5 umbenennen bzw. löschen (Schritte 1–17)

Gruppe wording · Cluster wording · Aufwand L · Befunde: wording-3, wording-9, wording-6, bereich_shell-34, wording-44, wording-43, wording-39, wording-40, wording-25, wording-41, wording-36, wording-37, wording-33, bereich_konto-42, wording-55, bereich_notebook_news-27, bereich_notebook_news-28, wording-5, wording-11, wording-63, wording-24, bereich_konto-43
Quelle: audit/spec/wording.md Z. 611–613 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/hi.js, web/js/lang/pt.js, web/js/lang/zh.js
Abhängig von: wording-S1.1-1.3, wording-S1.4-1.7, wording-S2.1, wording-S2.2-2.4, wording-S2.5-2.13, wording-S2.14, wording-S5.1-5.2, wording-S5.4-5.5, wording-S5.6-5.8, wording-S6.1-6.4, wording-S6.5-6.10, wording-S6.11-6.15, wording-S6.16-6.18, wording-S6.19-6.22, wording-S7.1-7.3, wording-S7.4-7.6, wording-S8.1-8.2, wording-S8.3-8.5, wording-S8.6-8.9, wording-S9.1-9.2, wording-S9.3-9.7, wording-S9.8-9.9, wording-S9.10-9.16, wording-S9.17, wording-S10.1-10.7, wording-S10.8-10.12, wording-S10.13-10.15, wording-S11.1-11.5, wording-S11.6-11.11, wording-S12.1-12.3, wording-S12.4-12.5, wording-S12.6-12.7, wording-S12.8-12.12, wording-S12.13-12.16, wording-S12.17-12.20, wording-S12.21-12.23, wording-S12.24-12.26, wording-S12.27, wording-S12.28-12.29, wording-S12.30, wording-S13.3-13.7, wording-S14.1-14.7, wording-S14.8-14.9, wording-S14.10-14.11, wording-S15.1-15.3, wording-S15.4-15.5, wording-S15.6-15.9, wording-S15.10-15.15, wording-S15.16-15.21, wording-S16.1-16.4, wording-S17.1, wording-S17.2-17.3, wording-S17.4-17.7, wording-S17.8-17.10, wording-S17.11-17.12, wording-S17.13-17.15, wording-S17.16-17.18, wording-S17.19-17.21, wording-S17.22, wording-S17.23-17.27, wording-S17.28, wording-S17.29-17.30

```text
### Schritt 18 · `web/js/lang/{en,es,hi,pt,zh}.js` und `web/e2e/i18n`

1. Für jede Zeile der Schritte 1–17 mit geändertem deutschem Text Regel 1.5 anwenden. Bekannte umzubenennende Schlüssel (Auswahl, Zeilen in en.js): „Win-Rate“ (767), „Winrate“, „Ø Winrate“, „Ø Tages-Win-Rate“, „Ø Trade-Gewinn/Verlust“, „Netto P&L“ (760), „Profil vervollständigen“ (927), „{0} von {1} eingehalten“ (358), „% Regeln eingehalten“ (501), „Mit allen Regeln eingehalten“ (548), „Equity: echt vs. Schatten-Ich“ (551), „Mein Regelwerk“, „Stopp nach Verlusten in Folge“ (+ „: Verluste“), „P&L aktive Konten“ (613), „Bestanden, geplatzt oder archiviert“ (938, klein → groß), „noch {0} Stop-Losses“, „noch 1 Stop-Loss“, „{0} Puffer / {1} je Stop-Loss“, „Coach Mode einrichten“, „Rabatt-Codes für Prop Firms erscheinen hier.“ (1381), „Kürzlich gelöscht“, „Aufklappbare Liste“, „Check-in nachtragen“, „Wochen-Recap“, „Neuer Performance-Recap“, „Trade speichern“ (entfällt), „Standardfarben“ (entfällt), „{0} Notiz von euch“ (1325), „{0} Notizen von euch“ (1326), „Kurz-Stats nur in R und Prozent · ab {0}“.
```
