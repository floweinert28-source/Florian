# Paket 015 · statistik

Schritte: 37 · Dateien: web/css/app.css, web/e2e/scorestatetest.js, web/js/core.js, web/js/screens/stats.js, web/tests/core.test.mjs
Betroffene Tests laut Spezifikation: Akzeptanz 4.2 Nr. 3: grep style="font-size in stats.js ohne Treffer; Akzeptanz 4.3 stats_days; Akzeptanz 4.3 stats_edge (1440 und 390); Akzeptanz 4.3 stats_mistakes; Akzeptanz 4.3 stats_setups (erste Spalte Satoshi 600); Akzeptanz 4.3 stats_setups/time/regime (Profit-Faktor „0,00“); Akzeptanz 4.4: grep "WR \${" ohne Treffer; Akzeptanz grep 7; Akzeptanz grep 8, Sonde 19; e2e/chartanimtest.js:33–35; node --test web/tests/core.test.mjs; web/e2e/calmnavtest.js:40; web/e2e/calmnavtest.js:47-48; web/e2e/calmnavtest.js:51; web/e2e/chartanimtest.js:35; web/e2e/scorestatetest.js:22; web/e2e/scorestatetest.js:22 muss ohne Anpassung grün sein (Schritt zustaende-S-TE8); web/e2e/sixtest.js:39 (bleibt gültig); web/tests/core.test.mjs; web/tests/core.test.mjs: neue daySummary-Fälle (Schritt zustaende-S-TE1); web/tests/core.test.mjs:100 (bleibt gültig); web/tests/core.test.mjs:57; web/tests/core.test.mjs:57 (O6)
Baut auf Paketen auf: 1, 2, 4, 5, 6, 7, 9

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## typografie-3.2.2g · Zeilenname .tbl td.lbl auf 600 (direkt nach der Onest-Regel)

Gruppe typografie · Cluster statistik · Aufwand S · Befunde: bereich_statistik-18
Quelle: audit/spec/typografie.md Z. 226–226 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.2f

```text
| direkt nach Z. 1800 neu | `.tbl td.lbl { font-weight: 600; }` | bereich_statistik-18 |
```

## typografie-3.2.5d · Listenwert .bar-row .bl b 600 nowrap, gedämpfter Zusatz 400

Gruppe typografie · Cluster statistik · Aufwand S · Befunde: bereich_statistik-17
Quelle: audit/spec/typografie.md Z. 362–362 · Dateien: web/css/app.css
Abhängig von: —

```text
| `.bar-row .bl b`, neu nach Z. 656 | `.bar-row .bl b { font-weight: 600; white-space: nowrap; } .bar-row .bl b .muted { font-weight: 400; }` (Schrift über die Sammelregel) | bereich_statistik-17 |
```

## typografie-3.8d · stats.js statVal: Faktor über fmt.factor

Gruppe typografie · Cluster statistik · Aufwand S · Befunde: bereich_statistik-42
Quelle: audit/spec/typografie.md Z. 427–427 · Dateien: web/js/screens/stats.js
Abhängig von: typografie-3.4b

```text
| stats.js:21 (`statVal`) | `case 'factor': return v == null ? '∞' : fmt.num(v, 2);` → `case 'factor': return fmt.factor(v);` | bereich_statistik-42 |
```

## typografie-3.8e · Statistik → Tage: Datum „Do., 08.10.“ mit multiYear und Klasse num

Gruppe typografie · Cluster statistik · Aufwand S · Befunde: bereich_statistik-40
Quelle: audit/spec/typografie.md Z. 428–429 · Dateien: web/js/screens/stats.js
Abhängig von: typografie-3.4d, typografie-3.2.2f

```text
| stats.js:29 (`tabDays`, nach `const ds = …`) | neu: `const multiYear = new Date(days[0].day).getFullYear() !== new Date(days[days.length - 1].day).getFullYear();` | bereich_statistik-40 |
| stats.js:32 | `<td>${fmt.weekdayLong(d.day)}</td>` → `<td class="num">${fmt.weekdayDM(d.day, multiYear)}</td>` | bereich_statistik-40 (K16) |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: fmt.weekdayLong] Ein Formatierer und eine Zellform auf allen Breiten. Statistik → Tage zeigt das Datum überall als „Do., 08.10.“, über eine Jahresgrenze „Do., 08.10.25“. Es kommt aus fmt.weekdayDM(d, withYear) (typografie-3.4d), die Zelle steht in Onest (class="num"). Endzustand der Tageszelle in stats.js Z. 32: `<td class="num"><a class="row-link" href="#/day/${d.key}">${fmt.weekdayDM(d.day, multiYear)}</a></td>`, multiYear aus typografie-3.8e. Grund: Die Kurzform passt schon bei 390 px. Eine zweite Handy-Variante (ph-hide/ph-only) und ein zweiter Formatierer mit gleicher Ausgabe (fmt.weekdayShort) wären doppelt, und die Typografie-Regel legt die Tagestabelle auf „Do., 08.10.“ fest. Die übrigen Handy-Maßnahmen aus responsiv-3.9b bleiben: ph-fit, ph-hide an Gewinner, Verlierer, Brutto, Gebühren und Drawdown sowie die Änderungen an groupTable.

## typografie-3.8f · groupTable: erste Spalte als td.lbl statt <b>

Gruppe typografie · Cluster statistik · Aufwand S · Befunde: bereich_statistik-18
Quelle: audit/spec/typografie.md Z. 430–430 · Dateien: web/js/screens/stats.js
Abhängig von: typografie-3.2.2g

```text
| stats.js:34 (`groupTable`) | `<td><b>${esc(g.label \|\| g.key)}</b></td>` → `<td class="lbl">${esc(g.label \|\| g.key)}</td>` | bereich_statistik-18 |
```

## typografie-3.8g · Kachel „Win-Rate mit / ohne Fehler“ mit einer Nachkommastelle (K20)

Gruppe typografie · Cluster statistik · Aufwand S · Befunde: bereich_statistik-42
Quelle: audit/spec/typografie.md Z. 431–431 · Dateien: web/js/screens/stats.js
Abhängig von: —

```text
| stats.js:51 | `fmt.pct(mr.mistakeSummary.winRate)` → `fmt.pct(mr.mistakeSummary.winRate, 1)`, `fmt.pct(mr.compliantSummary.winRate)` → `fmt.pct(mr.compliantSummary.winRate, 1)` (Fuß „… aller Trades“ bleibt ohne Stelle) | bereich_statistik-42 (K20) |
```

## typografie-3.8h · „Kosten je Fehler“: Betrag über U.pnl, Zusatz gedämpft, „WR“ → „Win-Rate“

Gruppe typografie · Cluster statistik · Aufwand S · Befunde: bereich_statistik-17
Quelle: audit/spec/typografie.md Z. 432–432 · Dateien: web/js/screens/stats.js
Abhängig von: typografie-3.2.5d

```text
| stats.js:52 | Text an `U.barRow`: `` `${fmt.cur(it.total, { signed: true })} · ${it.n}× · WR ${fmt.pct(it.n ? it.wins / it.n : 0)}` `` → `` `${U.pnl(it.total)} <span class="muted">· ${it.n}× · ${fmt.pct(it.n ? it.wins / it.n : 0)} Win-Rate</span>` `` | bereich_statistik-17 |
```

## typografie-3.8i · Edge-Kachel: Spanne ohne Inline-Größe mit &nbsp;R (K22), Streuungsmaße zwei Stellen

Gruppe typografie · Cluster statistik · Aufwand S · Befunde: bereich_statistik-41, bereich_statistik-42
Quelle: audit/spec/typografie.md Z. 433–434 · Dateien: web/js/screens/stats.js
Abhängig von: —

```text
| stats.js:72 | `` `<span class="small" style="font-size:20px">${fmt.r(e.low)} bis ${fmt.r(e.high)}</span>` `` → `` `${fmt.r(e.low).replace(' R', '')} bis ${fmt.r(e.high).replace(' R', '&nbsp;R')}` `` | bereich_statistik-41 (K22) |
| stats.js:73 | `Standardabweichung ${fmt.num(e.sd, 2)} R · Standardfehler ${fmt.num(e.se, 3)} R` → `Standardabweichung ${fmt.dec(e.sd, 2)} R · Standardfehler ${fmt.dec(e.se, 2)} R` | bereich_statistik-42 |
```

## abstaende-B14 · .stat-tiles: gap 14px → var(--grid-gap)

Gruppe abstaende · Cluster statistik · Aufwand S · Befunde: abstaende_layout-32
Quelle: audit/spec/abstaende.md Z. 330–330 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
| B14 | `.stat-tiles` (Z. 635) | `gap: 14px` → `gap: var(--grid-gap)` | abstaende_layout-32 |
```

## abstaende-B15 · Statistik-Übersicht: .stat-tile padding var(--sp-4) var(--sp-5) als Flex-Spalte, .stat-tile .v unten bündig (margin-top auto, padding-top var(--sp-2))

Gruppe abstaende · Cluster statistik · Aufwand S · Befunde: bereich_dashboard-10, responsiv-36, abstaende_layout-31
Quelle: audit/spec/abstaende.md Z. 331–331 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
| B15 | `.stat-tile` (Z. 636), `.stat-tile .v` (Z. 639) | `.stat-tile`: `padding: 16px 18px` → `padding: var(--sp-4) var(--sp-5); display: flex; flex-direction: column;`. `.stat-tile .v`: `margin-top: 8px` → `margin-top: auto; padding-top: var(--sp-2);` | bereich_dashboard-10, responsiv-36, abstaende_layout-31 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .stat-tile .v] Endstand: `.stat-tile .v { font-size: var(--tile-val); font-weight: 700; letter-spacing: var(--ls-val); line-height: var(--lh-val); margin-top: auto; padding-top: var(--sp-2); }` ohne font-family. Das ergibt 24 am Desktop und 20 bei ≤960 und am Handy, beides über das Token. Neu ist `@container (max-width: 175px) { .stat-tile .v { font-size: var(--fv-20); } }`. Die Handy-Regel Z. 3038 entfällt. 25 bzw. 22 px (Komponenten) gibt es nicht: „.stat-tile = .tile“ wird über dasselbe Token erreicht. mobiletest.js:27 (`20px`) bleibt gültig. Den Schriftteil schreibt aufbau-A2, margin und padding schreibt abstaende-B15.
- [konflikt: .stat-tile] Endstand: `.stat-tile { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: var(--sp-4) var(--sp-5); display: flex; flex-direction: column; container-type: inline-size; min-width: 0; transition: border-color var(--dur-1) var(--ease); }`, ohne :hover (siehe .tile:hover). Am Handy (≤560) `.stat-tile { padding: var(--sp-4) var(--sp-3); }` (abstaende-C7). Im hellen Design derselbe Schatten wie .tile (komponenten-C25a). Grund: .tile bekommt durch abstaende-B7 dieselben 16/20 px; damit ist „.stat-tile = .tile“ (Komponenten) erfüllt, 12/15 px war nur der alte .tile-Wert. abstaende-B15 schreibt padding und flex, responsiv-B7 nur container-type, zustaende-S-C5 die Transition.

## abstaende-C8 · Statistik-Reiter 12 px über ihrem Inhalt (negativer Rand mit Scroll-Polster-Ausgleich)

Gruppe abstaende · Cluster statistik · Aufwand S · Befunde: abstaende_layout-19
Quelle: audit/spec/abstaende.md Z. 357–357 · Dateien: web/css/app.css
Abhängig von: abstaende-A4

```text
| C8 | Statistik-Reiter, neu nach Z. 1513 | `.content > .tabs.scroll-x[data-subnav] { margin-bottom: calc(var(--sp-3) - 4px - var(--content-gap)); }` | abstaende_layout-19 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- ÄNDERN: `.content > .tabs.scroll-x[data-subnav] { margin-bottom: calc(var(--sp-3) - var(--content-gap)); }` ohne „- 4px“. Nach komponenten-C19 ist die Außenkante der Schiene die sichtbare Kante, und das Scroll-Polster mit Gegenrand gibt es nicht mehr. Prüfen: 12 px von der Unterkante der Schiene bis zum Inhalt.

## abstaende-J1 · Statistik: Diagramme r-t und r-v chart h220 → h240

Gruppe abstaende · Cluster statistik · Aufwand S · Befunde: bereich_statistik-36
Quelle: audit/spec/abstaende.md Z. 425–429 · Dateien: web/js/screens/stats.js
Abhängig von: —

```text
### web/js/screens/stats.js

| Nr. | Stelle | vorher → nachher | Befunde |
|---|---|---|---|
| J1 | Z. 58 | beide `chart h220` (r-t, r-v) → `chart h240` | bereich_statistik-36 |
```

## abstaende-J2 · Statistik Emotion: Diagrammhöhe aus der Datenzahl (max(240, n · 34) px) statt h280

Gruppe abstaende · Cluster statistik · Aufwand S · Befunde: bereich_statistik-36
Quelle: audit/spec/abstaende.md Z. 430–431 · Dateien: web/js/screens/stats.js
Abhängig von: —

```text
| J2 | Z. 52 (Emotion) | `<div class="chart h280" data-chart="hbars" data-id="m-emo"></div>` → `<div class="chart" style="height:${Math.max(240, emo.length * 34)}px" data-chart="hbars" data-id="m-emo"></div>` (der Zeichner liest clientHeight, ui.js:232) | bereich_statistik-36 |

```

## komponenten-S-stats-b · Statistik: Tabellen inset, Tage in Karte „Alle Handelstage“

Gruppe komponenten · Cluster statistik · Aufwand S · Befunde: bereich_statistik-19
Quelle: audit/spec/komponenten.md Z. 714–716 · Dateien: web/js/screens/stats.js
Abhängig von: —

```text
- Z. 34 (`groupTable`): `<div class="tbl-wrap">` → `<div class="tbl-wrap inset">`.
- Z. 32 (Tage): `<div class="tbl-wrap"><table…>…</table></div>` → `${U.card('Alle Handelstage', '<div class="tbl-wrap inset"><table…>…</table></div>')}`.

```

## aufbau-C1 · stats16: Erwartungswert statt Doppelkachel, neue Kachel Trades, Reihenfolge in 4 Themenreihen

Gruppe aufbau · Cluster statistik · Aufwand S · Befunde: bereich_statistik-3, aufbau-20
Quelle: audit/spec/aufbau.md Z. 397–421 · Dateien: web/js/core.js
Abhängig von: —

```text
### C – Einzelstellen

#### `web/js/core.js`

**C1 Statistik-Kacheln** (`stats16`, Z. 312–330) · bereich_statistik-3, aufbau-20
Eintrag `expectancy` (Z. 316) löschen. Reihenfolge der `items`:
1. `netPnL`
2. `avgTrade` mit `label: 'Erwartungswert', info: 'Ø Netto-P&L pro Trade: Netto-P&L geteilt durch Anzahl der Trades.'`
3. `avgDay`
4. `pf`
5. `winRate`
6. `dayWinRate`
7. `payoff`
8. `dayPayoff`
9. `plannedR`
10. `realizedR`
11. `maxDayDD`
12. `avgDayDD`
13. neu `{ key: 'trades', label: 'Trades', type: 'int', v: s.n, info: 'Abgeschlossene Trades im Zeitraum.' }`
14. `days`
15. `avgVolume`
16. `hold`

Alle anderen Einträge bleiben wörtlich (Beschriftungen, die die Wording-Spezifikation ändert, gelten dort). `s.tradeExpectancy` (Z. 93) bleibt für das Dashboard-Widget.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: C.stats16] Die 16 Kacheln stehen in der Reihenfolge aus aufbau-C1 (4 Themenreihen). Auf Platz 2 steht der Eintrag expectancy, nicht avgTrade: `{ key: 'expectancy', label: 'Erwartungswert pro Trade', type: 'cur', v: s.tradeExpectancy, info: 'Trefferquote × Ø Gewinn minus Verlustquote × Ø Verlust. Was ein Trade im Schnitt einbringt.' }`. avgTrade wird gelöscht. Platz 13 ist die neue Kachel `{ key: 'trades', label: 'Trades', type: 'int', v: s.n, info: 'Abgeschlossene Trades im Zeitraum.' }`. Alle übrigen Beschriftungen und Infos kommen aus wording 2.7–2.13: Ø Kontrakte pro Tag, Trade-Trefferquote, Tages-Trefferquote, Ø Gewinn/Verlust, Ø geplantes R pro Trade, Ø R pro Trade und das Info zu „Ø Tages-Gewinn/Verlust“. Begründung: Name, Wert und Info sind dann gleich wie im Dashboard-Widget „Erwartungswert pro Trade“ (widgets.js:177, s.tradeExpectancy). Ein Begriff steht in der ganzen App für eine Zahl (Wortwahl W2), und der Info-Text ist schon übersetzt. Aufbau verweist für Beschriftungen selbst auf die Wortwahl-Gruppe. core.test.mjs:100 (16 Einträge, key days) und sixtest.js:39 bleiben grün.
- ÄNDERN: Platz 2 ist der Eintrag expectancy mit Label und Info aus wording 2.5 und `v: s.tradeExpectancy`. avgTrade löschen (nicht expectancy). Die übrige Reihenfolge und die neue Kachel trades auf Platz 13 bleiben.

## aufbau-C14a · Statistiken: kein Session-Knopf, Zertifikat-Symbol award

Gruppe aufbau · Cluster statistik · Aufwand S · Befunde: aufbau-6, ki_look-22, bereich_dashboard-23
Quelle: audit/spec/aufbau.md Z. 583–587 · Dateien: web/js/screens/stats.js
Abhängig von: aufbau-B9

```text
#### `web/js/screens/stats.js`

**C14** · aufbau-19, bereich_statistik-5, responsiv-37, bereich_statistik-12, bereich_statistik-13, bereich_statistik-43, aufbau-6, ki_look-22, bereich_dashboard-23, typografie-4
- `App.screens.stats` nach Z. 8 `title`: `head: { session: false },`
- Z. 9 `actions`: `${I.shield}` → `${I.award}`
```

## aufbau-C14b · Statistiken: Reiter zuerst, Kurve als Karte „Kumulierter Netto-P&L“ nur in der Übersicht

Gruppe aufbau · Cluster statistik · Aufwand M · Befunde: aufbau-19, bereich_statistik-5, responsiv-37
Quelle: audit/spec/aufbau.md Z. 588–597 · Dateien: web/js/screens/stats.js
Abhängig von: —

```text
- `render` Z. 12–17:
  ```js
  const days = C.dailyAggregation(list);
  if (tab === 'summary') { const chartDays = fillDays(days, App.range()); U.chartData['stats-top'] = { days: chartDays, bars: false, dots: chartDays.length <= 45 }; }
  const tabs = /* unverändert */;
  const body = /* unverändert */;
  return tabs + body;
  ```
  `const top = U.card('', …legend…)` löschen.
- `tabSummary` Z. 26: nach der Leer-Prüfung als erstes `${U.card('Kumulierter Netto-P&L', '<div class="chart h240" data-chart="pnl" data-id="stats-top"></div>')}`, dann die Kacheln. Die drei Karten:
```

## aufbau-C14c · tabSummary: Karten „Serien“, „Extreme“, „Drawdown & Risiko“; Karte „Haltedauer“ entfällt

Gruppe aufbau · Cluster statistik · Aufwand S · Befunde: bereich_statistik-12
Quelle: audit/spec/aufbau.md Z. 598–601 · Dateien: web/js/screens/stats.js
Abhängig von: —

```text
  - `U.card('Serien', U.kv('Aktuelle Serie', …) + U.kv('Längste Gewinnserie', sk.maxWin) + U.kv('Längste Verlustserie', sk.maxLoss))`
  - `U.card('Extreme', U.kv('Größter Gewinn', …) + U.kv('Größter Verlust', …) + U.kv('Bester Tag', …) + U.kv('Schlechtester Tag', …))` (Markup und `pos`/`neg` aus den bisherigen Zeilen)
  - `U.card('Drawdown & Risiko', …)` unverändert
  - Karte `'Haltedauer'` (Ø Gewinner, Ø Verlierer, Ø gesamt, Trades pro Tag) ersatzlos entfernen
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: U.kv] Die sechs Schritte ändern vier verschiedene Aufrufstellen. Sie überschneiden sich nur in prop.js Z. 104 (Kontokarte) und mittelbar in planText. Verbindlich für Z. 104, innerhalb des `${dead ? '' : …}` aus zustaende-S-P1: `${U.kv(plan.funded ? 'Nächster Payout' : 'Bis zum Bestehen', plan.hasCond && active ? `<a href="#/prop/bilanz" class="prop-plan-link" data-action="prop-plan-open" data-id="${a.id}">${planText(a, ev, plan)}</a>` : planText(a, ev, plan))}`. Die Zeile wird immer gezeigt, denn sie trägt den einzigen Link in den Planer. planText: Der Gewinn-Teil erscheint nur bei `plan.missingProfit > C.EPS && (plan.funded || !ev.target)`; aufbau-C12a und responsiv-3.12a meinen dasselbe. Sind alle Teile leer und fehlt nur noch Gewinn, liefert planText `<span class="muted">nur noch das Ziel</span>`, sonst '—', nie ''. Ein leerer Wert würde Zeile und Link verstecken, und '—' bedeutet laut Zustände Z2 „Wert fehlt“. Wortlaut und Währungsformat des Betrags entscheidet der Anker planText/money (konflikt-9). prop.js Z. 283 (abstaende-M6): eigene Zeile „Heute noch erlaubt“ als Regelgröße in Kontowährung `money(a, cons.allowedToday, { compact: true })` (KI-Look Z5a/Z5c). Damit entfällt der Teil „heute noch … erlaubt“ in kilook-C19c. Die Testanpassung proptest.js:102 prüft die Zeile „Heute noch erlaubt“ und bei verletzter Regel „verletzt“ in „Consistency Rule“, nicht mehr „heute noch“ in der Consistency-Zeile. stats.js tabSummary (aufbau-C14c) und notebook.js statsHTML (diagramme-L1, Zähler nur > 0 gefärbt, passt zu farbe-C30) sind unabhängig. stats.js tabDays: siehe Anker stats.tabDays. Hinweis: responsiv-B7 (.st-cards, dritte Karte bis 1100 px volle Breite) passt zu den drei Karten aus C14c; die dritte Karte ist dann „Drawdown & Risiko“.

## aufbau-C14e · Reiter Zeit: Beschriftungen als .kpi-label

Gruppe aufbau · Cluster statistik · Aufwand S · Befunde: typografie-4
Quelle: audit/spec/aufbau.md Z. 607–607 · Dateien: web/js/screens/stats.js
Abhängig von: aufbau-A3a

```text
- `tabTime` Z. 45: `<div class="caption">Gewinner</div>` / `<div class="caption">Verlierer</div>` → `<div class="kpi-label">…</div>`
```

## aufbau-C14f · Reiter Marktphase: Abdeckung nur bei Teilabdeckung als sub

Gruppe aufbau · Cluster statistik · Aufwand S · Befunde: bereich_statistik-43
Quelle: audit/spec/aufbau.md Z. 608–609 · Dateien: web/js/screens/stats.js
Abhängig von: —

```text
- `tabRegime` Z. 58: `<div class="muted small">${ra.coverage} von ${closed.length} Trades haben eine Marktphase.</div>` löschen. Erste Karte: `U.card('Ø pro Trade je Marktphase', …, ra.coverage < closed.length ? { sub: `Basis: ${ra.coverage} von ${closed.length} Trades` } : {})`. Zustand (Z. 67) und Monte Carlo (Z. 79) bleiben.

```

## diagramme-B1 · core.js: Uhrzeit-Fächer 1 h (18–19, 19–20), padGroups, timeAnalysis lückenlos

Gruppe diagramme · Cluster statistik · Aufwand M · Befunde: diagramme-12, bereich_statistik-15
Quelle: audit/spec/diagramme.md Z. 341–352 · Dateien: web/js/core.js
Abhängig von: —

```text
### 3.2 `web/js/core.js`

**B1 Uhrzeit-Fächer und leere Kategorien** (diagramme-12, Ergänzung bereich_statistik-15)
- Z. 194: in `HOUR_BUCKETS` den Eintrag `'18–20'` durch `'18–19', '19–20'` ersetzen.
- Z. 195 → ``const hourBucket = h => h < 8 ? 'vor 8' : h < 20 ? `${h}–${h + 1}` : 'ab 20';``
- nach Z. 197 neu:
  ```js
  /* geordnete Achsen lückenlos: leere Fächer zwischen erstem und letztem belegten (minHi: mindestens bis zu diesem Index, ab Index 0) */
  const padGroups = (gs, order, minHi = -1) => { if (!gs.length) return gs; const by = new Map(gs.map(g => [g.key, g])); const idx = gs.map(g => order.indexOf(g.key)); const lo = minHi >= 0 ? 0 : Math.min(...idx), hi = Math.max(minHi, ...idx); return order.slice(lo, hi + 1).map(k => by.get(k) || { key: k, trades: [], s: summary([]) }); };
  ```
- Z. 200–202 in `timeAnalysis`: `weekdays: padGroups(groupBy(…, WEEKDAYS), WEEKDAYS, 4)`, `hours: padGroups(groupBy(…, HOUR_BUCKETS), HOUR_BUCKETS)`, `holding: padGroups(groupBy(…, HOLD_BUCKETS), HOLD_BUCKETS)`. Die Argumente von groupBy bleiben, wie sie sind. `groupBy` und `regimeAnalysis` bleiben unverändert.

```

## diagramme-B2 · core.js: Monte-Carlo-Median je Schritt (mc.median)

Gruppe diagramme · Cluster statistik · Aufwand S · Befunde: diagramme-21
Quelle: audit/spec/diagramme.md Z. 353–357 · Dateien: web/js/core.js
Abhängig von: —

```text
**B2 Monte-Carlo-Median** (diagramme-21)
- in `monteCarlo` vor der Lauf-Schleife (Z. 236): `const steps = Array.from({ length: horizon + 1 }, () => new Float64Array(runs));`
- in der Lauf-Schleife: direkt nach `let e = start, …` `steps[0][r] = start;`, in der inneren Schleife nach `e += …` `steps[i + 1][r] = e;`
- im Rückgabeobjekt (Z. 244) ergänzen: `median: steps.map(a => percentile(a, .5))`. Der Zufallsgenerator bleibt unverändert, die Werte sind deterministisch.

```

## diagramme-G1 · Statistik-Kopfkarte: Titel „Kumulierter Netto-P&L“, nur Handelstage, nur mit abgeschlossenen Trades

Gruppe diagramme · Cluster statistik · Aufwand S · Befunde: diagramme-13, hierarchie-14, zustaende-5, bereich_statistik-48
Quelle: audit/spec/diagramme.md Z. 600–610 · Dateien: web/js/screens/stats.js
Abhängig von: —

```text
### 3.7 `web/js/screens/stats.js`

**G1 Kopfkarte** (diagramme-13, hierarchie-14, zustaende-5, bereich_statistik-48)

Z. 12–14 →
```js
const days = C.dailyAggregation(list);
let top = ''; if (closed.length) { const id = 'stats-top'; U.chartData[id] = { days, bars: false, dots: days.length <= 45 }; top = U.card('Kumulierter Netto-P&L', `<div class="chart h240" data-chart="pnl" data-id="${id}"></div>`); }
```
`const r = App.range();` entfällt. Verschiebt Aufbau/aufbau-19 die Karte in „Übersicht“, gilt dort derselbe Inhalt.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: stats-top] Endzustand von stats.js Z. 12–14 nach diagramme-G1: `const days = C.dailyAggregation(list); let top = ''; if (closed.length) { const id = 'stats-top'; U.chartData[id] = { days, bars: false, dots: days.length <= 45 }; top = U.card('Kumulierter Netto-P&L', `<div class="chart h240" data-chart="pnl" data-id="${id}"></div>`); }`. Die Karte hat einen Titel und keine Legende, zeigt einen Punkt je Handelstag (kein fillDays) und erscheint nur mit abgeschlossenen Trades. `const r = App.range()` entfällt. Grund: Diagramme A-14 und Aufbau („Karte „Kumulierter Netto-P&L“ (h240, ohne Legende)“). Das Ziel der Zustände-Gruppe, kein leeres Diagramm, ist in G1 schon enthalten. Verschiebt aufbau-19 die Karte in „Übersicht“, gilt dort derselbe Inhalt.
- ÜBERNIMMT zustaende-S-ST1: Die Prüfung auf closed.length steckt in diagramme-G1. Kein fillDays und kein leerer Kartentitel.
- [konflikt: fillDays] fillDays (stats.js Z. 20) wird gelöscht (diagramme-G2), sobald diagramme-G1 den einzigen Aufruf entfernt hat. Grund: Das Kopfdiagramm zeigt nur Handelstage (Diagramme A-14). zustaende-S-ST1 würde fillDays weiter aufrufen und entfällt.
- ÜBERNIMMT zustaende-S-ST1: Die Prüfung auf closed.length steckt in diagramme-G1. Kein fillDays und kein leerer Kartentitel.

## diagramme-G2 · stats.js: fillDays löschen

Gruppe diagramme · Cluster statistik · Aufwand S · Befunde: diagramme-13, hierarchie-14
Quelle: audit/spec/diagramme.md Z. 611–612 · Dateien: web/js/screens/stats.js
Abhängig von: diagramme-G1

```text
**G2** (diagramme-13, hierarchie-14) Z. 20 `function fillDays…` löschen.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: stats-top] Endzustand von stats.js Z. 12–14 nach diagramme-G1: `const days = C.dailyAggregation(list); let top = ''; if (closed.length) { const id = 'stats-top'; U.chartData[id] = { days, bars: false, dots: days.length <= 45 }; top = U.card('Kumulierter Netto-P&L', `<div class="chart h240" data-chart="pnl" data-id="${id}"></div>`); }`. Die Karte hat einen Titel und keine Legende, zeigt einen Punkt je Handelstag (kein fillDays) und erscheint nur mit abgeschlossenen Trades. `const r = App.range()` entfällt. Grund: Diagramme A-14 und Aufbau („Karte „Kumulierter Netto-P&L“ (h240, ohne Legende)“). Das Ziel der Zustände-Gruppe, kein leeres Diagramm, ist in G1 schon enthalten. Verschiebt aufbau-19 die Karte in „Übersicht“, gilt dort derselbe Inhalt.
- [konflikt: fillDays] fillDays (stats.js Z. 20) wird gelöscht (diagramme-G2), sobald diagramme-G1 den einzigen Aufruf entfernt hat. Grund: Das Kopfdiagramm zeigt nur Handelstage (Diagramme A-14). zustaende-S-ST1 würde fillDays weiter aufrufen und entfällt.

## diagramme-G3 · Zähler: Tabellenspalten Gewinner/Verlierer neutral, Gewinntage/Verlusttage nur bei > 0 gefärbt

Gruppe diagramme · Cluster statistik · Aufwand S · Befunde: hierarchie-50, bereich_notebook_news-18
Quelle: audit/spec/diagramme.md Z. 613–616 · Dateien: web/js/screens/stats.js
Abhängig von: —

```text
**G3 Zähler neutral bzw. nur > 0 gefärbt** (hierarchie-50, bereich_notebook_news-18/K24)
- Z. 32: `<td class="r pos">${d.wins}</td><td class="r neg">${d.losses}</td>` → `<td class="r">${d.wins}</td><td class="r">${d.losses}</td>`
- Z. 31: `<span class="pos">${ds.winDays}</span> / <span class="neg">${ds.lossDays}</span>` → `<span class="${ds.winDays ? 'pos' : ''}">${ds.winDays}</span> / <span class="${ds.lossDays ? 'neg' : ''}">${ds.lossDays}</span>`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .pos] Dieselbe Zählerfärbung steht wortgleich in mehreren Gruppen: Gewinner/Verlierer bzw. Gewinntage/Verlusttage nur bei > 0 als pos/neg, Tabellen-Zählspalten neutral. Betroffen sind day.js:14 (diagramme-M1, zustaende-S-DY2, farbe-C20), trades.js:54 (diagramme-M1, farbe-C31b) und stats.js:31/32 (diagramme-G3, farbe-C30). Sie wird einmal umgesetzt: diagramme-M1 für day.js:14 und trades.js:54, diagramme-G3 für stats.js:31/32, genau mit den dort genannten Werten. TradeLog-Regeln-Spalte trades.js:49: Klasse und Symbole nach farbe-C31a (Regel „✓ --muted, × --loss“). barrierefreiheit-C-trades-49 ergänzt nur die Namen: `<span class="rule-ic muted" role="img" aria-label="Alle Regeln eingehalten">${I.check}</span>` bzw. `<span class="rule-ic neg" role="img" aria-label="Gebrochen: ${esc(t.rulesBroken.join(', '))}" data-tip="${esc(t.rulesBroken.join(', '))}">${I.close}</span>`. Der row-link in der ersten Zelle bleibt wie in C-trades-49.
- [doppelt: .neg] Dieselben Schritte und dieselbe Entscheidung wie beim Anker .pos: Zähler einmal über diagramme-M1 (day.js:14, trades.js:54) und diagramme-G3 (stats.js:31/32). Das × in der Regeln-Spalte bekommt `rule-ic neg` (farbe-C31a) plus role="img" und aria-label „Gebrochen: …“ (barrierefreiheit-C-trades-49). Die Anpassungen stehen beim Anker .pos und werden nur einmal angewendet.

## diagramme-G4 · groupTable ohne leere Fächer

Gruppe diagramme · Cluster statistik · Aufwand S · Befunde: diagramme-12
Quelle: audit/spec/diagramme.md Z. 617–618 · Dateien: web/js/screens/stats.js
Abhängig von: diagramme-B1

```text
**G4** (diagramme-12) Z. 34 `groupTable`: `${groups.map(g => …` → `${groups.filter(g => g.s.n > 0).map(g => …`

```

## diagramme-G5 · Setups und Emotion nach Erwartungswert sortieren (byExp)

Gruppe diagramme · Cluster statistik · Aufwand S · Befunde: bereich_statistik-37
Quelle: audit/spec/diagramme.md Z. 619–625 · Dateien: web/js/screens/stats.js
Abhängig von: —

```text
**G5 Sortierung nach gezeigtem Wert** (bereich_statistik-37)
- vor `function tabSetups` neu: `const byExp = gs => gs.slice().sort((a, b) => (/^Ohne /.test(a.key) - /^Ohne /.test(b.key)) || b.s.expectancy - a.s.expectancy);`
- Z. 38 `{ groups: setups, metric: 'expectancy' }` → `{ groups: byExp(setups), metric: 'expectancy' }`
- Z. 49 `{ groups: emo, metric: 'expectancy' }` → `{ groups: byExp(emo), metric: 'expectancy' }`

Die Tabelle „Setups“ und `t-hold` (geordnete Fächer) bleiben unsortiert.

```

## diagramme-O6 · Unit-Test core.test.mjs:57: Länge und Endwert von mc.median

Gruppe diagramme · Cluster statistik · Aufwand S · Befunde: diagramme-21
Quelle: audit/spec/diagramme.md Z. 751–752 · Dateien: web/tests/core.test.mjs
Abhängig von: diagramme-B2

```text
- **O6** tests/core.test.mjs:57 (diagramme-21) ergänzen: `assert.equal(a.median.length, a.horizon + 1); assert.equal(a.median[a.horizon], a.final.p50);`

```

## zustaende-S-C15 · Zustand-Spalte: CSS-Klasse .is-none statt .empty

Gruppe zustaende · Cluster statistik · Aufwand S · Befunde: bereich_statistik-1, diagramme-5
Quelle: audit/spec/zustaende.md Z. 351–355 · Dateien: web/css/app.css
Abhängig von: —

```text
#### Einzelstellen

**S-C15 Zustand-Spalten** – bereich_statistik-1, diagramme-5
Z. 2969 `.stc-col.empty > b { color: var(--faint); }` → `.stc-col.is-none > b { color: var(--faint); }`

```

## zustaende-S-K1 · Tages-Payoff und Tages-Profit-Faktor: nur Verluste oder nichts → 0, nur Gewinne → null (∞)

Gruppe zustaende · Cluster statistik · Aufwand S · Befunde: zustaende-4
Quelle: audit/spec/zustaende.md Z. 454–460 · Dateien: web/js/core.js
Abhängig von: —

```text
### 3.3 `web/js/core.js`

**S-K1 Tages-Payoff und Tages-Profit-Faktor** – zustaende-4
- Z. 131 `dayPayoff: lossDays.length && winDays.length ? mean(winDays.map(d => d.pnl)) / -mean(lossDays.map(d => d.pnl)) : null,` → `dayPayoff: lossDays.length ? mean(winDays.map(d => d.pnl)) / -mean(lossDays.map(d => d.pnl)) : (winDays.length ? null : 0),`
- Z. 134 `dayPF: gl < 0 ? gp / -gl : null,` → `dayPF: gl < 0 ? gp / -gl : (gp > 0 ? null : 0),`
- Kein Umbau auf `Infinity` (siehe Abschnitt 5). `ui.js:143`, `stats.js:21`, Score und Widgets bleiben.

```

## zustaende-S-ST2 · Statistik: einheitliche Seiten-Leerzustände über noTrades() (leeres Journal mit CSV-Import)

Gruppe zustaende · Cluster statistik · Aufwand S · Befunde: bereich_statistik-46, wording-46
Quelle: audit/spec/zustaende.md Z. 612–625 · Dateien: web/js/screens/stats.js
Abhängig von: —

```text
**S-ST2 Einheitliche Leerzustände** – bereich_statistik-46, wording-46
Vor `tabSummary` neu:
```js
function noTrades(icon, title, hint = 'Ändere den Zeitraum oder logge Trades.') {
  return App.allTrades().length ? U.empty(icon, title, hint) : U.empty(icon, 'Noch keine Trades', 'Logge deinen ersten Trade oder importiere eine CSV-Datei.', `<button type="button" class="btn sm" data-action="import">${I.upload} CSV importieren</button>`);
}
```
- Z. 23 → `if (!closed.length) return noTrades('stats', 'Keine abgeschlossenen Trades im Zeitraum');`
- Z. 29 → `if (!days.length) return noTrades('day', 'Keine Handelstage im Zeitraum');`
- Z. 37 → `if (!closed.length) return noTrades('strategy', 'Keine abgeschlossenen Trades im Zeitraum');`
- Z. 42 → `if (!closed.length) return noTrades('clock', 'Keine abgeschlossenen Trades im Zeitraum');`
- Z. 48 → `if (!closed.length) return noTrades('warning', 'Keine abgeschlossenen Trades im Zeitraum');`
- Z. 61 Symbol `sparkle` bleibt.

```

## zustaende-S-ST3 · Statistik: Zustand-Spalte mit Klasse is-none statt empty

Gruppe zustaende · Cluster statistik · Aufwand S · Befunde: bereich_statistik-1, diagramme-5
Quelle: audit/spec/zustaende.md Z. 626–628 · Dateien: web/js/screens/stats.js
Abhängig von: zustaende-S-C15

```text
**S-ST3 Zustand-Spalte** – bereich_statistik-1, diagramme-5
Z. 64 `` `stc-col${g.n ? '' : ' empty'}` `` → `` `stc-col${g.n ? '' : ' is-none'}` ``.

```

## zustaende-S-ST4 · Edge-Check: Leerzustand ohne R, „Nötige Stichprobe“ ohne Schein-„erreicht“, Rollierender Edge erst ab Mindestzahl (Textzeile)

Gruppe zustaende · Cluster statistik · Aufwand S · Befunde: bereich_statistik-23, bereich_statistik-24
Quelle: audit/spec/zustaende.md Z. 629–633 · Dateien: web/js/screens/stats.js
Abhängig von: zustaende-S-ST2

```text
**S-ST4 Edge-Check** – bereich_statistik-23, bereich_statistik-24
- Z. 70 nach `const e = C.edge(list);`: `if (!e.n) return noTrades('trend', 'Keine Trades mit R im Zeitraum', 'Trage in der Trade-Ansicht unter „Plan & Bewertung“ einen Stop ein, dann wird das R-Multiple berechnet.');`
- Z. 72 Kachel „Nötige Stichprobe“: `foot: e.required && e.required > e.n ? `noch ${e.required - e.n} Trades` : 'erreicht'` → `foot: e.required == null ? '' : e.required > e.n ? `noch ${e.required - e.n} Trades` : 'erreicht'`
- Z. 73 Karte „Rollierender Edge“: Inhalt `<div class="chart h280" …></div>${e.deteriorating ? …Banner… : ''}` → `${e.rolling.length ? `<div class="chart h280" data-chart="rolling" data-id="edge"></div>${e.deteriorating ? …Banner unverändert… : ''}` : `<div class="muted small">Der gleitende Durchschnitt erscheint ab ${e.window} Trades mit R-Wert.</div>`}`; `info` und `sub` unverändert.

```

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: [data-subnav]] stats.js:15 wird zu `<nav class="tabs scroll-x" data-subnav aria-label="Statistik-Bereiche">${TABS.map(([k, l]) => `<a href="#/stats/${k}"${tab === k ? ' aria-current="page"' : ''}>${l}</a>`).join('')}</nav>`. Die Links haben keine Klasse btn und keine Inline-Farbe (Komponenten: kein .btn als Reiter, Schiene .tabs > a aus komponenten-C19). Statt aria-pressed tragen sie aria-current (Barrierefreiheit Z4: nie aria-pressed an Links), der Behälter wird nav mit aria-label. Der gewählte Reiter bekommt seinen Stil über `.tabs a[aria-current="page"]` in der gemeinsamen Liste (barrierefreiheit-B9b). Ohne .btn liefert .tabs > a schon --text-2 und beim Darüberfahren --text. Die beiden Zusatzregeln `.tabs a:not([aria-current="page"])` aus barrierefreiheit-B9b hätten also keine Wirkung und entfallen. calmnavtest.js:50 sucht den gewählten Reiter über [aria-current="page"], und App.revealActive (app.js:113) kennt aria-current schon.
- ÜBERNIMMT komponenten-S-stats-a: class="btn" und Inline-Farbe entfernt barrierefreiheit-C-stats-15 im selben Durchgang.
- ÄNDERN: Im Markup nach der Änderung `class="btn"` am <a> weglassen. Sonst wie spezifiziert, Test calmnavtest.js:50/51 auf [aria-current="page"] umstellen.
- [konflikt: .tabs.scroll-x] Statistik-Reiter in stats.js Z. 15, genau so: `<nav class="tabs scroll-x" data-subnav aria-label="Statistik-Bereiche">${TABS.map(([k, l]) => `<a href="#/stats/${k}"${tab === k ? ' aria-current="page"' : ''}>${l}</a>`).join('')}</nav>`. Das heißt: <nav> mit Namen, kein .btn, keine Inline-Farbe, kein aria-pressed, aria-current nur am gewählten Link. CSS: `.tabs.scroll-x { overflow-x: auto; flex-wrap: nowrap; padding: 3px; margin: 0; }` (C19). Ungewählt --text-2 und Hover --text kommen aus der Schienen-Regel `.tabs > a` (C19). Gewählt kommt aus der gemeinsamen Regel mit `.tabs a[aria-current="page"]` (B9b). Die Zusatzregel `.tabs a:not([aria-current="page"]) …` aus B9b ist überflüssig. Abstand zum Inhalt: Die Schiene hat jetzt einen sichtbaren Rand und kein Scroll-Polster mit Gegenrand mehr. Deshalb entfällt der −4px-Ausgleich in abstaende-C8. Grund: Schiene statt Rahmenknöpfe (komponenten), Navigation als <nav> mit aria-current (barrierefreiheit Z4), 12 px Reiter↔Inhalt (abstaende).
- ÄNDERN: Im nachher-Markup `class="btn"` am <a> weglassen (siehe Entscheidung). Sonst wie spezifiziert.
- ÜBERNIMMT komponenten-S-stats-a: Das Entfernen von .btn und der Inline-Farbe übernimmt barrierefreiheit-C-stats-15. Den Behälter behält es nicht als div mit aria-pressed, sondern als nav mit aria-current.

## barrierefreiheit-C-stats-32 · Wochentag-Tabelle: Link in der ersten Zelle

Gruppe barrierefreiheit · Cluster statistik · Aufwand S · Befunde: bereich_statistik-32, barrierefreiheit-4
Quelle: audit/spec/barrierefreiheit.md Z. 783–784 · Dateien: web/js/screens/stats.js
Abhängig von: barrierefreiheit-B7

```text
- **Z. 32:** `<td>${fmt.weekdayLong(d.day)}</td>` → `<td><a class="row-link" href="#/day/${d.key}">${fmt.weekdayLong(d.day)}</a></td>` (Befunde: bereich_statistik-32, barrierefreiheit-4)

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: fmt.weekdayLong] Ein Formatierer und eine Zellform auf allen Breiten. Statistik → Tage zeigt das Datum überall als „Do., 08.10.“, über eine Jahresgrenze „Do., 08.10.25“. Es kommt aus fmt.weekdayDM(d, withYear) (typografie-3.4d), die Zelle steht in Onest (class="num"). Endzustand der Tageszelle in stats.js Z. 32: `<td class="num"><a class="row-link" href="#/day/${d.key}">${fmt.weekdayDM(d.day, multiYear)}</a></td>`, multiYear aus typografie-3.8e. Grund: Die Kurzform passt schon bei 390 px. Eine zweite Handy-Variante (ph-hide/ph-only) und ein zweiter Formatierer mit gleicher Ausgabe (fmt.weekdayShort) wären doppelt, und die Typografie-Regel legt die Tagestabelle auf „Do., 08.10.“ fest. Die übrigen Handy-Maßnahmen aus responsiv-3.9b bleiben: ph-fit, ph-hide an Gewinner, Verlierer, Brutto, Gebühren und Drawdown sowie die Änderungen an groupTable.
- ÄNDERN: Den Link um den neuen Inhalt legen: `<td class="num"><a class="row-link" href="#/day/${d.key}">${fmt.weekdayDM(d.day, multiYear)}</a></td>`, nicht um fmt.weekdayLong.
