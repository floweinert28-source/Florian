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
