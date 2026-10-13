# Paket 044 · konto, responsiv, trades_tag

Schritte: 3 · Dateien: web/css/app.css, web/js/screens/coach.js, web/js/screens/trades.js
Betroffene Tests laut Spezifikation: web/e2e/coachlang.js:11; web/e2e/coachlang.js:12; web/e2e/coachtest.js:135
Baut auf Paketen auf: 7, 19, 31, 43

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## wording-S15.10-15.15 · Coach-Gruppe und Journal: „1 von 2 offen“, „Ø Trefferquote“, „Mentor-Notizen“, Pille „nur für Mentoren“ weg, „Daten ab …“, „bearbeitet …“ nur bei späterer Bearbeitung

Gruppe wording · Cluster konto · Aufwand M · Befunde: bereich_konto-43, wording-3, zustaende-28, bereich_konto-21
Quelle: audit/spec/wording.md Z. 554–559 · Dateien: web/js/screens/coach.js
Abhängig von: wording-S1.1-1.3, wording-S3.4, wording-S3.5

```text
| 15.10 | coach.js:86 Aufgaben-Zelle | `<span>${r.open_tasks === 1 ? '1 offen' : \`${r.open_tasks} offen\`}</span><div class="sub">${\`von ${r.tasks}\`}</div>` → `<span>${r.open_tasks} von ${r.tasks} offen</span>` (Erledigt-Zweig unverändert) | bereich_konto-43 |
| 15.11 | coach.js:96 / :113 / :121 | `U.tile('Ø Winrate', …)` → `U.tile('Ø Trefferquote', …)`; `<th class="r">Winrate</th>` → `<th class="r">Trefferquote</th>`; Info `'Pro Schüler: Trades, Winrate, …'` → `'Pro Schüler: Trades, Trefferquote, …'` | wording-3 |
| 15.12 | coach.js:99 Journal-Kachel | `${gs.notes === 1 ? '1 Notiz von euch' : \`${gs.notes} Notizen von euch\`}` → `${U.count(gs.notes, 'Mentor-Notiz', 'Mentor-Notizen')}` (bei F1 = Ja: „Coach-Notiz/-Notizen“) | bereich_konto-43, zustaende-28 |
| 15.13 | coach.js:101 | `<span class="small muted">nur für Mentoren</span>` ersatzlos streichen (Info daneben sagt es) | bereich_konto-43 |
| 15.14 | coach.js:121 | `Kurz-Stats nur in R und Prozent${g && g.period_start ? \` · ab ${…}\` : ''}` → `${g && g.period_start ? \`Daten ab ${esc(fmt.dateFull(C.parseDayKey(g.period_start)))}\` : ''}` | bereich_konto-43 |
| 15.15 | coach.js:137 Journal-Eintrag | `<span class="small muted no-i18n">${esc(fmt.dateTime(e.updated_at))}</span>` → `${e.updated_at && C.dayKey(new Date(e.updated_at)) !== e.date_key ? \`<span class="small muted ce-edited"><span>bearbeitet</span> <span class="no-i18n">${esc(fmt.dateTime(e.updated_at))}</span></span>\` : ''}` | bereich_konto-21 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: U.tile] (1) Statistik → Tage (aufbau-C14d): Die Kacheln folgen der Farb- und Vorzeichenregel. „Gewinntage / Verlusttage“ wird nur bei > 0 gefärbt (`<span class="${ds.winDays ? 'pos' : ''}">…</span> / <span class="${ds.lossDays ? 'neg' : ''}">…</span>`, farbe-C30). „Ø Gewinntag“ wird `U.pnl(ds.avgWinDay)`, „Ø Verlusttag“ `U.pnl(ds.avgLossDay)`: Ergebnisse tragen ein Vorzeichen (kilook Z5b), avgLossDay ist negativ. Die Karte „P&L nach Wochentag“ entfällt mit aufbau-C14d und damit auch wording 10.3. (2) Statistik → Fehler: Kachel 1 behält das Vorzeichen `fmt.cur(mr.cost, { signed: true })`, die Klasse richtet sich nach dem Vorzeichen (neg/pos/neu). Die Beschriftung wechselt nach wording zwischen „Fehler haben gekostet“ und „Fehler haben eingebracht“. farbe K13 („Disziplin-Kosten überall mit Vorzeichen“, ausdrücklich auch für Statistik → Fehler) und kilook Z5b gehen vor; die Prüfzeile in wording (stats_mistakes.png) lautet dann „mit Minus“. (3) Affiliate: Die Kacheln behalten die Cent, kein moneyK (Begründung unter fmt.balance). Die Begriffe aus wording 13.3–13.7 bleiben, die Kachel „Creator“ entfällt (aufbau-C3). (4) Schatten-Ich, Kachel „Echt“: Fuß mit U.count. (5) Prop-Summe siehe summaryTiles, Monte Carlo siehe fmt.cur. Verträglich sind farbe-C27, wording 12.28, wording-S11.6-11.11 und wording-S15.10-15.15.

## wording-S3.7 · app.css Handy (≤ 560px): Suche volle Breite, Auswahlfelder als wischbare Zeile

Gruppe wording · Cluster responsiv · Aufwand S · Befunde: bereich_trades_tag-35
Quelle: audit/spec/wording.md Z. 333–334 · Dateien: web/css/app.css
Abhängig von: —

```text
| 3.7 | Handy-Block `@media (max-width: 560px)` | – → `.tl-search { max-width: none; flex: 1 1 100%; }` · `.tl-sel { display: flex; gap: 8px; flex: 1 1 100%; flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; overscroll-behavior-x: contain; }` · `.tl-sel::-webkit-scrollbar { display: none; }` · `.tl-sel > * { flex: 0 0 auto; }` | bereich_trades_tag-35 |

```

## wording-S9.3-9.7 · TradeLog-Filterzeile: Klassen tl-filters/tl-search/tl-sel/tl-count, „Trades durchsuchen“, Fehler-Filter, Filterzeile nur mit Trades

Gruppe wording · Cluster trades_tag · Aufwand M · Befunde: wording-51, bereich_trades_tag-35, zustaende-28
Quelle: audit/spec/wording.md Z. 426–430 · Dateien: web/js/screens/trades.js
Abhängig von: wording-S1.1-1.3, wording-S3.6, wording-S3.7

```text
| 9.3 | Z. 39 Filterzeile, Suche | `<div class="row" style="gap:8px"><div class="grow" style="max-width:260px;position:relative"><input … placeholder="Suchen: Symbol, Setup, Notiz …" aria-label="Suchen" …>` → `<div class="row tl-filters" style="gap:8px"><div class="grow tl-search"><input … placeholder="Trades durchsuchen" aria-label="Trades durchsuchen" title="Sucht in Symbol, Setup, Notizen, Fehler-Tags und Emotionen" …>` | wording-51, bereich_trades_tag-35 |
| 9.4 | Z. 40–44 Auswahlfelder | die vier `<select>` und den Zurücksetzen-Knopf in `<div class="tl-sel">…</div>` fassen; Zähler `<span class="muted small" style="margin-left:auto">` → `<span class="muted small tl-count">` | bereich_trades_tag-35 |
| 9.5 | Z. 43 Fehler-Filter | `<option value="">Fehler: alle</option>` → `<option value="">Alle Fehler</option>`; `>Nur mit Fehler<` → `>Mit Fehler<` | bereich_trades_tag-35 |
| 9.6 | Z. 44 Zähler | `${rows.length} von ${list.length} Trades` → `${rows.length} von ${U.count(list.length, 'Trade', 'Trades')}` | zustaende-28 |
| 9.7 | Z. 45 Leerzustand | `return filters + U.empty(…)` → `return (list.length ? filters : '') + U.empty(…)` (ohne Trades im Zeitraum keine Filterzeile; mit Trades und leerem Filterergebnis bleibt sie samt „Zurücksetzen“) | bereich_trades_tag-35 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: U.empty] (1) Check-in-Leerzustände nutzen I.mood: kilook-C13 in day.js:16, kilook-C14 in stats.js:61. kilook-C25 löscht I.sparkle; der Satz „Z. 61 Symbol sparkle bleibt“ in zustaende-S-ST2 gilt deshalb nicht. (2) Den Knopftext im Check-in-Leerzustand der Tagesansicht setzt aufbau-C7c einmal: `${key < C.dayKey(new Date()) ? 'Check-in nachtragen' : 'Check-in machen'}`. Für künftige Tage passt „nachtragen“ nicht. (3) Schatten-Ich-Ranking (diagramme-I1): Ein leerer Hinweis ist nicht erlaubt (zustaende Z1: nie ''), also `U.empty('shield', 'Keine Regel aktiv', 'Schalte oben im Regelwerk mindestens eine Regel ein.')`. Ohne Verstoß gibt es keinen zweiten Leerzustand „Keine Verstöße“, der steht schon in der Nachbarkarte „Regelverstöße“. Es bleibt nur die Zeile „Ohne Verstöße: …“. (4) TradeLog-Liste: `return (list.length ? filters : '') + U.empty('tradelog', …)` mit Titel und Satz nach zustaende-S-T3. wording 9.7 und S-T3 ergänzen sich in derselben Zeile. (5) Regeln im Fortschritt: siehe #/settings/regeln. Verträglich sind aufbau-C15c, wording 9.14, 12.6, 12.30, zustaende-S-DY1 und noTrades aus S-ST2.
- [doppelt: .tl-filters] wording-S9.3-9.7 setzt das Markup der Filterzeile einmal um: `row tl-filters` > `grow tl-search` + `tl-sel` (Selects und Zurücksetzen) + `muted small tl-count`, „Trades durchsuchen“, Zähler mit U.count, Filterzeile nur mit Trades. responsiv-3.7 setzt dieselben Klassen tl-filters und tl-count; dieser Teil entfällt dort. Das CSS aus responsiv-C2 bleibt (`.tl-filters .select { max-width: 200px; … }`, `.tl-count { margin-left: auto; white-space: nowrap; flex: 0 0 auto; }`). Es greift auch innerhalb von .tl-sel und muss stehen, bevor das Inline-`margin-left:auto` wegfällt.
- [doppelt: .tl-count] Wie bei .tl-filters: Die Klasse tl-count setzt wording-S9.3-9.7, die Regel `.tl-count { margin-left: auto; white-space: nowrap; flex: 0 0 auto; }` kommt aus responsiv-C2. Der Zähler-Teil von responsiv-3.7 entfällt (Anpassung unter .tl-filters).
