# Paket 070 · wording, einstellungen

Schritte: 7 · Dateien: web/e2e/navdottest.js, web/js/lang/en.js, web/js/lang/es.js, web/js/lang/hi.js, web/js/lang/pt.js, web/js/lang/zh.js, web/js/screens/misc.js, web/js/store.js, web/js/theme.js
Betroffene Tests laut Spezifikation: web/e2e/langtest.js; web/e2e/navdottest.js:37
Baut auf Paketen auf: 7, 14, 16, 19, 20, 23, 26, 28, 31, 34, 35, 44, 51, 64, 69

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## aufbau-C8d · Benachrichtigungen: Unterschalter eingerückt und bei aus deaktiviert

Gruppe aufbau · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-33
Quelle: audit/spec/aufbau.md Z. 494–494 · Dateien: web/js/screens/misc.js
Abhängig von: aufbau-B14

```text
- Benachrichtigungen Z. 176: `${nd.on ? App.NAV_DOT_AREAS.map(…).join('') : ''}` → `<div class="set-sub"${nd.on ? '' : ' aria-disabled="true"'}>${App.NAV_DOT_AREAS.map(([k, label, desc]) => switchRow(label, desc, 'navdot-toggle', nd[k] !== false, `data-key="${k}"${nd.on ? '' : ' disabled'}`)).join('')}</div>`
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: switchRow] switchRow bekommt die Fassung aus barrierefreiheit-C-misc-15: id je Aufbau über swN, <label for> mit .set-row-l, aria-describedby, kein aria-label. Die Signatur (title, text, action, on, extra) bleibt, deshalb laufen alle Aufrufer unverändert weiter, und C-misc-15 kommt zuerst. GELD-BLIND: Der Schalter heißt „Beträge als R zeigen“, Text aus wording-S17.19. Blocktitel „Geld-blind-Modus“ und Toast bleiben. Grund: Wording hat die Texthoheit (K13). Der Name sagt, was passiert (R statt Geld, Kontostand weg). Außerdem heißt im Zertifikat schon ein anderer Schalter „Beträge ausblenden (nur % bzw. R)“ (certificate.js:74), und ein Name für zwei Funktionen verletzt W2. TRADING: Markup aus komponenten-S-misc-e (Einheit im Feld, Tilt-Schalter, kein Speichern-Knopf). Labels: „Tagesverlustlimit“ und „Ruin-Schwelle für Monte Carlo (Drawdown)“, bei beiden steht „%“ im Feld. „für Monte Carlo“ kommt aus wording-29, die Einheit wandert laut komponenten ins Feld. Tilt-Schaltertext: „Warnt auf dem Dashboard bei Verlustserien, Größenerhöhung nach Verlust, Revenge-Trades und erreichtem Tagesverlustlimit.“ Wrapper class="mt-3" statt style="margin-top:14px". Durchläufe-Optionen mit value und fmt.int (wording 17.20). Der Hinweis aus aufbau-C8b steht als letztes Kind des .field hinter dem .inp-cur-Wrapper: „Prozent der Kontogröße. Gilt für Tilt-Warnungen und die automatischen Regeln im Fortschritt.“ Er trägt die Bezugsgröße, die mit „(% vom Konto)“ aus dem Label fällt. BENACHRICHTIGUNGEN, Endmarkup aus abstaende-L4, wording-S17.13-17.15 und aufbau-C8d: <div class="set-block"><h3>Recaps</h3><div class="set-desc">Zusammenfassungen deiner Trades. Sie erscheinen als Hinweis oben auf dem Dashboard.</div><div class="stack s-4">${switchRow('Wochen-Recap', 'Jeden Montag eine Zusammenfassung der Vorwoche, wenn du darin mindestens 4 Trades geschlossen hast.', 'notif-toggle', n.weekly === true, 'data-key="weekly"')}${switchRow('Monats-Recap', 'Am 2. jedes Monats eine Zusammenfassung des Vormonats, wenn du darin mindestens 4 Trades geschlossen hast.', 'notif-toggle', n.monthly === true, 'data-key="monthly"')}</div></div><div class="set-block"><h3>Hinweis-Punkte in der Seitenleiste</h3><div class="set-desc">(Satz unverändert)</div><div class="stack s-4">${switchRow('Hinweis-Punkte anzeigen', 'Alle Punkte auf einmal ein- oder ausschalten.', 'navdot-toggle', nd.on, 'data-key="on"')}<div class="set-sub"${nd.on ? '' : ' aria-disabled="true"'}>${App.NAV_DOT_AREAS.map(([k, label, desc]) => switchRow(label, desc, 'navdot-toggle', nd[k] !== false, `data-key="${k}"${nd.on ? '' : ' disabled'}`)).join('')}</div></div></div>. PROFIL: Block „Bedienung“ mit Schalter „Tastenkürzel“ (kilook-C24) direkt vor „Daten und Sicherung“. WCAG 2.1.4 verlangt abschaltbare Ein-Zeichen-Kürzel. Die Fußzeile wird einzeilig mit dem Text aus wording-17.7 und der Klasse aus farbe-C22. Die zweite Kürzel-Zeile aus wording-17.7 entfällt, weil der Schalter sie trägt; Esc wirkt immer. Neue Schalter-Aktionen setzen nur aria-checked, ohne Neuaufbau (zustaende Z9). Der Notebook-Schalter aus komponenten-S-misc-g bleibt wie spezifiziert, weil Notebook-To-dos laut zustaende das Durchstreichen behalten.
- ÄNDERN: div.set-sub (Bedingung und disabled wie spezifiziert) als letztes Kind in das div.stack.s-4 aus abstaende-L4 setzen, nicht als Geschwister der Blocküberschrift.

## aufbau-D3e · Test navdottest.js: Unterschalter deaktiviert statt ausgeblendet

Gruppe aufbau · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-33
Quelle: audit/spec/aufbau.md Z. 709–709 · Dateien: web/e2e/navdottest.js
Abhängig von: aufbau-C8d

```text
- `navdottest.js:37`: bei Hauptschalter aus 8 `[data-action=navdot-toggle]`, davon 7 `disabled`, keine `.nav-dot` in `#sidebar`
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
