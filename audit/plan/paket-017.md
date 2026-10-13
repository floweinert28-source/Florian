# Paket 017 · statistik

Schritte: 13 · Dateien: web/css/app.css, web/e2e/scorestatetest.js, web/js/core.js, web/js/screens/stats.js, web/js/ui.js, web/tests/core.test.mjs
Betroffene Tests laut Spezifikation: web/e2e/calmnavtest.js:51; web/e2e/filtertest.js; web/e2e/mobiletest.js:26-27 (.stat-tile .v 20px, zwei Spalten); web/e2e/scorestatetest.js:22; web/tests/core.test.mjs
Baut auf Paketen auf: 2, 6, 7, 16

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## zustaende-S-TE1 · Test core.test.mjs: daySummary mit Verlusttag, Gewinntag, nur Break-even-Tagen

Gruppe zustaende · Cluster statistik · Aufwand S · Befunde: zustaende-4
Quelle: audit/spec/zustaende.md Z. 875–877 · Dateien: web/tests/core.test.mjs
Abhängig von: zustaende-S-K1

```text
### 3.24 Tests – S-TE

- `web/tests/core.test.mjs`: neu `daySummary` mit einem Verlusttag → `dayPayoff === 0` und `dayPF === 0`; mit einem Gewinntag → `dayPayoff === null` und `dayPF === null`; mit nur Break-even-Tagen → `dayPayoff === 0` und `dayPF === 0`.
```

## zustaende-S-TE8 · Test scorestatetest.js:22 („Karte flach“) muss ohne Anpassung grün sein

Gruppe zustaende · Cluster statistik · Aufwand S · Befunde: bereich_statistik-1, diagramme-5
Quelle: audit/spec/zustaende.md Z. 884–885 · Dateien: web/e2e/scorestatetest.js
Abhängig von: zustaende-S-C15, zustaende-S-ST3

```text
- `e2e/scorestatetest.js:22` („Karte flach“, Höhe < 150 px) muss danach ohne Anpassung grün sein.

```

## barrierefreiheit-C-stats-15 · Statistik-Reiter als <nav aria-label="Statistik-Bereiche"> mit aria-current, ohne Inline-Farbe

Gruppe barrierefreiheit · Cluster statistik · Aufwand S · Befunde: bereich_statistik-7, barrierefreiheit-32
Quelle: audit/spec/barrierefreiheit.md Z. 777–782 · Dateien: web/js/screens/stats.js
Abhängig von: barrierefreiheit-B9b

```text
#### `web/js/screens/stats.js`

- **Z. 15:**
  - vorher: `` <div class="tabs scroll-x" data-subnav>${TABS.map(([k, l]) => `<a class="btn" href="#/stats/${k}" aria-pressed="${tab === k}" style="${tab === k ? '' : 'color:var(--text-2)'}">${l}</a>`)…}</div> ``
  - nachher: `` <nav class="tabs scroll-x" data-subnav aria-label="Statistik-Bereiche">${TABS.map(([k, l]) => `<a class="btn" href="#/stats/${k}"${tab === k ? ' aria-current="page"' : ''}>${l}</a>`).join('')}</nav> ``
  - Befunde: bereich_statistik-7, barrierefreiheit-32
```

## barrierefreiheit-C-stats-32 · Wochentag-Tabelle: Link in der ersten Zelle

Gruppe barrierefreiheit · Cluster statistik · Aufwand S · Befunde: bereich_statistik-32, barrierefreiheit-4
Quelle: audit/spec/barrierefreiheit.md Z. 783–784 · Dateien: web/js/screens/stats.js
Abhängig von: barrierefreiheit-B7

```text
- **Z. 32:** `<td>${fmt.weekdayLong(d.day)}</td>` → `<td><a class="row-link" href="#/day/${d.key}">${fmt.weekdayLong(d.day)}</a></td>` (Befunde: bereich_statistik-32, barrierefreiheit-4)

```

## kilook-C14 · Statistik: Gewinner/Verlierer als .kpi-label, Check-in-Leerzustand mit I.mood, Monte Carlo ganzzahlig

Gruppe kilook · Cluster statistik · Aufwand S · Befunde: ki_look-17, ki_look-36, diagramme-32
Quelle: audit/spec/kilook.md Z. 630–641 · Dateien: web/js/screens/stats.js
Abhängig von: kilook-A4

```text
**C14 · web/js/screens/stats.js** (ki_look-17, ki_look-36, diagramme-32)
- **45** `<div class="caption">Gewinner</div>` und `<div class="caption">Verlierer</div>` → `class="kpi-label"`
- **61** `U.empty('sparkle', 'Keine Check-ins im Zeitraum', …)` → `U.empty('mood', 'Keine Check-ins im Zeitraum', …)`
- **79–80** (Monte Carlo) jedes `fmt.cur(x)` → `fmt.cur(x, { compact: true })`:
  - `mc.start`
  - `-mc.dd.p50`
  - `-mc.dd.p95`
  - `-mc.dd.worst`
  - `mc.final.p50`
  - `mc.final.p5`
  - `mc.final.p95`

```

## responsiv-B7 · Statistik-Übersicht: 4 Spalten bis 761 px, Werte unten bündig, Kartenreihe st-cards

Gruppe responsiv · Cluster statistik · Aufwand M · Befunde: bereich_statistik-21
Quelle: audit/spec/responsiv.md Z. 315–326 · Dateien: web/css/app.css
Abhängig von: —

```text
**B7 Statistik-Übersicht** (bereich_statistik-21)
- Z. 636 `.stat-tile { … min-width: 0; transition: … }` → zusätzlich `display: flex; flex-direction: column; container-type: inline-size;`
- Z. 639 `.stat-tile .v { …; margin-top: 8px; … }` → `margin-top: auto; padding-top: 8px;`
- Z. 640 `@media (max-width: 1100px) { .stat-tiles { … repeat(2 … } }` → `@media (max-width: 760px) { … }` (Inhalt gleich).
- Nach Z. 641 neu:
  ```css
  @container (max-width: 175px) { .stat-tile .v { font-size: 20px; } }
  .grid.three.st-cards { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  @media (max-width: 1100px) { .grid.three.st-cards { grid-template-columns: repeat(2, minmax(0, 1fr)); } .grid.three.st-cards > :nth-child(3) { grid-column: 1 / -1; } }
  @media (max-width: 560px) { .grid.three.st-cards { grid-template-columns: minmax(0, 1fr); } }
  ```

```

## responsiv-3.2a · fmt.weekdayShort neu („Do., 08.10.“)

Gruppe responsiv · Cluster statistik · Aufwand S · Befunde: responsiv-5, bereich_statistik-20
Quelle: audit/spec/responsiv.md Z. 412–414 · Dateien: web/js/ui.js
Abhängig von: —

```text
### 3.2 web/js/ui.js

- Z. 147 nach `dateDM(d) { … },` neu: `weekdayShort(d) { return new Date(d).toLocaleDateString(LOC(), { weekday: 'short', day: '2-digit', month: '2-digit' }); }, /* „Do., 08.10.“ (Tabellen am Handy) */` (responsiv-5, bereich_statistik-20)
```

## responsiv-3.9a · Statistik: Kartenreihe bekommt Klasse st-cards

Gruppe responsiv · Cluster statistik · Aufwand S · Befunde: bereich_statistik-21
Quelle: audit/spec/responsiv.md Z. 497–499 · Dateien: web/js/screens/stats.js
Abhängig von: responsiv-B7

```text
### 3.9 web/js/screens/stats.js (responsiv-5, bereich_statistik-20, bereich_statistik-21)

- Z. 26 `<div class="grid three">` → `<div class="grid three st-cards">`
```

## wording-S2.2-2.4 · core.js: Uhrzeit-Gruppen gleich breit bis „19–20“, Haltedauer „unter 5 min“/„über 4 h“

Gruppe wording · Cluster statistik · Aufwand S · Befunde: bereich_statistik-38
Quelle: audit/spec/wording.md Z. 309–311 · Dateien: web/js/core.js
Abhängig von: —

```text
| 2.2 | `HOUR_BUCKETS` Z. 195 | `[…, '17–18', '18–20', 'ab 20']` → `['vor 8', '8–9', '9–10', '10–11', '11–12', '12–13', '13–14', '14–15', '15–16', '16–17', '17–18', '18–19', '19–20', 'ab 20']` | bereich_statistik-38 |
| 2.3 | `hourBucket` Z. 196 | `const hourBucket = h => h < 8 ? 'vor 8' : h < 18 ? \`${h}–${h + 1}\` : h < 20 ? '18–20' : 'ab 20';` → `const hourBucket = h => h < 8 ? 'vor 8' : h < 20 ? \`${h}–${h + 1}\` : 'ab 20';` | bereich_statistik-38 |
| 2.4 | `HOLD_BUCKETS`, `holdBucket` Z. 197–198 | `'< 5 min'` → `'unter 5 min'`, `'> 4 h'` → `'über 4 h'` (beide Zeilen) | bereich_statistik-38 |
```

## wording-S2.5-2.13 · core.js stats16: „Erwartungswert pro Trade“, neue Kachel „Trades“ statt Ø pro Trade, Trefferquoten, Ø Gewinn/Verlust, R- und Kontrakt-Namen

Gruppe wording · Cluster statistik · Aufwand M · Befunde: wording-8, wording-3, wording-9, hierarchie-13, bereich_statistik-10
Quelle: audit/spec/wording.md Z. 312–320 · Dateien: web/js/core.js
Abhängig von: —

```text
| 2.5 | `stats16` Z. 316 (`expectancy`) | label `'Trade-Erwartungswert'` → `'Erwartungswert pro Trade'`; info `'Win-Rate × Ø Gewinn + Verlustrate × Ø Verlust.'` → `'Trefferquote × Ø Gewinn minus Verlustquote × Ø Verlust. Was ein Trade im Schnitt einbringt.'` (wörtlich wie widgets.js:177, Schlüssel vorhanden). Wert bleibt `s.tradeExpectancy` | wording-8, wording-3 |
| 2.6 | `stats16` Z. 317 (`avgTrade`) | ganze Zeile → `{ key: 'trades', label: 'Trades', type: 'int', v: s.n, info: 'Abgeschlossene Trades im Zeitraum.' },` | wording-8 |
| 2.7 | Z. 318 (`avgVolume`) | label `'Ø Tagesvolumen'` → `'Ø Kontrakte pro Tag'`; info `'Gehandelte Stückzahl pro Handelstag.'` → `'Gehandelte Kontrakte pro Handelstag.'` | bereich_statistik-10 |
| 2.8 | Z. 319 (`winRate`) | label `'Win-Rate'` → `'Trade-Trefferquote'` | wording-3 |
| 2.9 | Z. 320 (`dayPayoff`) | label bleibt `'Ø Tages-Gewinn/Verlust'`; info → `'Ø Gewinntag geteilt durch Ø Verlusttag.'` | wording-9, bereich_statistik-10 |
| 2.10 | Z. 323 (`dayWinRate`) | label `'Ø Tages-Win-Rate'` → `'Tages-Trefferquote'` | wording-3, hierarchie-13, bereich_statistik-10 |
| 2.11 | Z. 324 (`payoff`) | label `'Ø Trade-Gewinn/Verlust'` → `'Ø Gewinn/Verlust'`; info → `'Ø Gewinn geteilt durch Ø Verlust.'` | wording-9, hierarchie-13, bereich_statistik-10 |
| 2.12 | Z. 325 (`plannedR`) | label `'Ø geplantes R-Multiple'` → `'Ø geplantes R pro Trade'` | bereich_statistik-10 |
| 2.13 | Z. 329 (`realizedR`) | label `'Ø realisiertes R-Multiple'` → `'Ø R pro Trade'` (wie Edge-Check stats.js:72) | bereich_statistik-10 |
```

## wording-S10.1-10.7 · Statistik: REG_VS, Serien-Einzahl, Titel „… nach …“, Spalten „Trefferquote“/„Erwartungswert“, Uhrzeit-Tabelle mit „ Uhr“

Gruppe wording · Cluster statistik · Aufwand M · Befunde: bereich_statistik-16, bereich_statistik-28, zustaende-28, wording-3, bereich_statistik-38
Quelle: audit/spec/wording.md Z. 442–452 · Dateien: web/js/screens/stats.js
Abhängig von: wording-S1.1-1.3, wording-S2.2-2.4

```text
### Schritt 10 · `web/js/screens/stats.js`

| # | Stelle | vorher → nachher | ids |
|---|---|---|---|
| 10.1 | Z. 6 | nach `REG_V` ergänzen: `REG_VS = { low: 'Niedrig', normal: 'Normal', high: 'Hoch' }` | bereich_statistik-16 |
| 10.2 | Z. 26 Serien | `${sk.current} ${sk.kind === 'win' ? 'Gewinne' : 'Verluste'}` → `${sk.kind === 'win' ? U.count(sk.current, 'Gewinn', 'Gewinne') : U.count(sk.current, 'Verlust', 'Verluste')}` | bereich_statistik-28, zustaende-28 |
| 10.3 | Z. 31 | `U.card('P&L nach Wochentag', …)` → `U.card('Netto-P&L nach Wochentag', …)` | bereich_statistik-16 |
| 10.4 | Z. 32 Tagestabelle | `<th class="r">Win-Rate</th>` → `<th class="r">Trefferquote</th>` | wording-3 |
| 10.5 | Z. 34 `groupTable` | `<th class="r">Win-Rate</th><th class="r">Ø pro Trade</th>` → `<th class="r">Trefferquote</th><th class="r">Erwartungswert</th>` | wording-3, bereich_statistik-16 |
| 10.6 | Z. 39 | `'Erwartungswert je Setup'` → `'Erwartungswert nach Setup'`; info `'Ø Netto-P&L pro Trade je Setup.'` → `'Ø Netto-P&L pro Trade nach Setup.'`; `'Netto-P&L je Symbol'` → `'Netto-P&L nach Symbol'` | bereich_statistik-16 |
| 10.7 | Z. 45 | `'Ø pro Trade nach Wochentag'` → `'Erwartungswert nach Wochentag'`; `'Ø pro Trade nach Haltedauer'` → `'Erwartungswert nach Haltedauer'`; `groupTable(ta.hours, 'Uhrzeit')` → `groupTable(ta.hours.map(g => Object.assign({}, g, { label: g.key + ' Uhr' })), 'Uhrzeit')` | bereich_statistik-16, bereich_statistik-38 |
```

## wording-S10.8-10.12 · Statistik: Fehler-Kacheln (Kosten in Verlustfarbe ohne Minus, Trefferquote mit/ohne Fehler ohne Farbe), Regime-Titel und Einzel-Labels, Edge-Zähler

Gruppe wording · Cluster statistik · Aufwand M · Befunde: bereich_statistik-45, wording-3, zustaende-28, bereich_statistik-16
Quelle: audit/spec/wording.md Z. 453–457 · Dateien: web/js/screens/stats.js
Abhängig von: wording-S1.1-1.3, wording-S10.1-10.7

```text
| 10.8 | Z. 51 Fehler-Kacheln | erste Kachel: `const mc0 = mr.cost < -C.EPS ? ['Fehler haben gekostet', 'neg', fmt.cur(-mr.cost)] : mr.cost > C.EPS ? ['Fehler haben eingebracht', 'pos', fmt.cur(mr.cost)] : ['Fehler haben gekostet', 'neu', fmt.cur(0)];` und `U.tile(mc0[0], \`<span class="${mc0[1]}">${mc0[2]}</span>\`, { info: … })` (Info unverändert); `{ n: \`${mr.compliantN} Trades\` }` → `{ n: U.count(mr.compliantN, 'Trade', 'Trades') }`; vierte Kachel `U.tile('Win-Rate mit / ohne Fehler', \`<span class="neg">…</span> <span class="muted">/</span> <span class="pos">…</span>\`)` → `U.tile('Trefferquote mit / ohne Fehler', \`${fmt.pct(mr.mistakeSummary.winRate, 1)} <span class="muted">/</span> ${fmt.pct(mr.compliantSummary.winRate, 1)}\`)` (keine Farbe, eine Stelle wie stats.js:21) | bereich_statistik-45, wording-3, zustaende-28 |
| 10.9 | Z. 52 Kosten je Fehler | `· WR ${fmt.pct(…)}` → `· Trefferquote ${fmt.pct(…)}` | wording-3 |
| 10.10 | Z. 56 `lab` | Einzelfall `REG_T[g.key] \|\| REG_V[g.key] \|\| g.key` → `REG_T[g.key] \|\| REG_VS[g.key] \|\| g.key` (Kombinationen behalten `REG_V`) | bereich_statistik-16 |
| 10.11 | Z. 58 | `${ra.coverage} von ${closed.length} Trades haben …` → `${ra.coverage} von ${U.count(closed.length, 'Trade', 'Trades')} haben …`; `'Ø pro Trade je Marktphase'` → `'Erwartungswert nach Marktphase'`; `'Ø pro Trade nach Volatilität'` → `'Erwartungswert nach Volatilität'` | bereich_statistik-16, zustaende-28 |
| 10.12 | Z. 72 Edge | `{ n: \`${e.n} Trades\` }` → `{ n: U.count(e.n, 'Trade', 'Trades') }`; `noch ${e.required - e.n} Trades` → `noch ${U.count(e.required - e.n, 'Trade', 'Trades')}` | zustaende-28 |
```

## wording-S10.13-10.15 · Monte Carlo: Durchläufe mit fmt.int, Kacheln kompakt ohne Cent, ausgeschriebene Fußzeilen

Gruppe wording · Cluster statistik · Aufwand S · Befunde: bereich_statistik-26, wording-29
Quelle: audit/spec/wording.md Z. 458–461 · Dateien: web/js/screens/stats.js
Abhängig von: —

```text
| 10.13 | Z. 79 Monte Carlo | `${mc.runs} Durchläufe à …` → `${fmt.int(mc.runs)} Durchläufe à …` | bereich_statistik-26, wording-29 |
| 10.14 | Z. 80 MC-Kacheln | `U.tile('Median-Drawdown', \`<span class="neg">${fmt.cur(-mc.dd.p50)}</span>\`, { foot: \`95 %: … · schlimmster …\` })` → `U.tile('Drawdown (Median)', \`<span class="neg">${fmt.cur(-mc.dd.p50, { compact: true })}</span>\`, { foot: \`In 95 % der Durchläufe unter ${fmt.cur(mc.dd.p95, { compact: true })} · schlimmster ${fmt.cur(mc.dd.worst, { compact: true })}\` })`; `U.tile('Endkapital (Median)', fmt.cur(mc.final.p50), { foot: \`5 %: … · 95 %: …\` })` → `U.tile('Endkapital (Median)', fmt.cur(mc.final.p50, { compact: true }), { foot: \`90 % der Durchläufe zwischen ${fmt.cur(mc.final.p5, { compact: true })} und ${fmt.cur(mc.final.p95, { compact: true })}\` })` | bereich_statistik-26 |
| 10.15 | Z. 81 | `{ sub: '25 von ' + mc.runs + ' Durchläufen' }` → `{ sub: '25 von ' + fmt.int(mc.runs) + ' Durchläufen' }` | bereich_statistik-26 |

```
