# Paket 018 · trades_tag

Schritte: 28 · Dateien: web/README.md, web/css/app.css, web/e2e/mobiletest.js, web/js/app.js, web/js/screens/day.js, web/js/screens/trades.js
Betroffene Tests laut Spezifikation: Akzeptanz 4.3 day; Akzeptanz 4.3 trades (893,04 € gleich groß wie 1,43; leer_trades y ≈ 220); Akzeptanz 4.3 trades (Datumsspalte „08.10. 19:43“ in Onest); Akzeptanz 4.4: grep "<td>\${fmt.(date|time)" ohne Treffer; Akzeptanz 4.4: grep class="caption"; web/e2e/certtest.js:54; web/e2e/certtest.js:54 (Zertifikat-Knopf in der Tagesansicht bleibt); web/e2e/mobiletest.js:31; web/e2e/tlfittest.js; web/e2e/tradeformtest.js (Handy 390×844 ohne Scrollen, muss grün bleiben); web/e2e/tradeformtest.js (muss grün bleiben); web/tests/inline-style.test.mjs (Zählung, Schritt R5)
Baut auf Paketen auf: 1, 2, 3, 4, 9

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## farbe-B17 · Long/Short-Schalter im Trade-Dialog flach getönt, Pfeilkreis ohne Glow

Gruppe farbe · Cluster trades_tag · Aufwand S · Befunde: bereich_trades_tag-12
Quelle: audit/spec/farbe.md Z. 304–308 · Dateien: web/css/app.css
Abhängig von: —

```text
**B17 – Long/Short-Schalter im Trade-Dialog** — bereich_trades_tag-12
- Kommentar Z. 841 „eine leuchtende Fläche gleitet“ → „eine flache, leicht getönte Fläche gleitet“
- Z. 853–854 (in `.dir-switch::before`, Z. 852 mit `transition` bleibt unverändert): `background: linear-gradient(90deg, color-mix(in srgb, var(--dir-c) 26%, var(--surface-2)), color-mix(in srgb, var(--dir-c) 7%, var(--surface-2)) 85%); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--dir-c) 42%, transparent), -6px 4px 18px -10px color-mix(in srgb, var(--dir-c) 60%, transparent);` → `background: color-mix(in srgb, var(--dir-c) 10%, var(--surface)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--dir-c) 22%, var(--border-2));`
- Z. 869 `.dir-opt[aria-pressed="true"] .bi { background: var(--oc); box-shadow: 0 0 10px color-mix(in srgb, var(--oc) 50%, transparent); }` → `box-shadow: none;` (Fläche `var(--oc)` bleibt)

```

## farbe-C12a · Trade-Dialog: Hinweis „(leer = offen)“ als .lbl-hint

Gruppe farbe · Cluster trades_tag · Aufwand S · Befunde: barrierefreiheit-25, typografie-10, bereich_trades_tag-42
Quelle: audit/spec/farbe.md Z. 430–431 · Dateien: web/js/app.js
Abhängig von: farbe-B3a

```text
**C12 – `web/js/app.js`** — barrierefreiheit-25, bereich_trades_tag-42, typografie-10, farbe_kontrast-19, bereich_trades_tag-45, farbe_kontrast-11
- Z. 360 `<span class="faint">(leer = offen)</span>` → `<span class="lbl-hint">(leer = offen)</span>`
```

## farbe-C12b · Check-in: sleepZone „fit“ und scaleColor auf --profit (Zwischenstufe aus --loss/--warn)

Gruppe farbe · Cluster trades_tag · Aufwand S · Befunde: farbe_kontrast-19, bereich_trades_tag-45
Quelle: audit/spec/farbe.md Z. 432–433 · Dateien: web/js/app.js
Abhängig von: —

```text
- Z. 497 `App.sleepZone`, Zweig fit: `color: 'var(--accent)'` → `'var(--profit)'`; Z. 501 `fit: { color: 'var(--accent)', … }` → `'var(--profit)'`
- Z. 511 `App.scaleColor`: `['var(--loss)', '#ff8c5c', 'var(--warn)', 'color-mix(in srgb, var(--accent) 70%, var(--warn))', 'var(--accent)']` → `['var(--loss)', 'color-mix(in srgb, var(--loss) 55%, var(--warn))', 'var(--warn)', 'color-mix(in srgb, var(--profit) 70%, var(--warn))', 'var(--profit)']`
```

## farbe-C12c · Session-Ende und Import: Hinweise .lbl-hint bzw. muted statt faint

Gruppe farbe · Cluster trades_tag · Aufwand S · Befunde: barrierefreiheit-25, farbe_kontrast-11, bereich_trades_tag-42
Quelle: audit/spec/farbe.md Z. 434–437 · Dateien: web/js/app.js
Abhängig von: farbe-B3a

```text
- Z. 533 `<span class="faint">(wird in die Tagesnotiz im Notebook geschrieben)</span>` → `<span class="lbl-hint">…</span>`
- Z. 560 `<div class="small faint" …>Exporte von Brokern …` → `class="small muted"`
- Z. 567 `'<span class="faint">offen</span>'` → `'<span class="muted">offen</span>'`

```

## farbe-C20 · Tagesansicht: Pille „Heute“ neutral, Zähler nur > 0 gefärbt, Score mit scoreText, Leertext muted, Knopf neutral

Gruppe farbe · Cluster trades_tag · Aufwand S · Befunde: farbe_kontrast-24, referenz-8, komponenten-8, bereich_trades_tag-25, farbe_kontrast-42, bereich_trades_tag-19, barrierefreiheit-25, bereich_trades_tag-21
Quelle: audit/spec/farbe.md Z. 474–479 · Dateien: web/js/screens/day.js
Abhängig von: farbe-B27a

```text
**C20 – `web/js/screens/day.js`** — farbe_kontrast-24, referenz-8, komponenten-8, bereich_trades_tag-25, farbe_kontrast-42, bereich_trades_tag-19, barrierefreiheit-25, bereich_trades_tag-21
- Z. 12 `U.pill('Heute', 'win')` → `U.pill('Heute', 'neutral')`
- Z. 14 `<span class="pos">${s.wins}</span> / <span class="neg">${s.losses}</span>` → `<span class="${s.wins ? 'pos' : ''}">${s.wins}</span> / <span class="${s.losses ? 'neg' : ''}">${s.losses}</span>`
- Z. 15 `<b style="color:${U.scoreColor(sc)}">${sc}</b>` → `<span style="color:${U.scoreText(sc)}">${sc}</span>`
- Z. 19 `<span class="faint">Noch leer.</span>` → `<span class="muted">Noch leer.</span>`; `class="btn sm primary" data-action="nb-day-note"` → `class="btn sm"`

```

## farbe-C31a · TradeLog: Leerzustand „Trade loggen“ accent, Score über scoreText, Regeln-Symbol .rule-ic, „offen“ muted

Gruppe farbe · Cluster trades_tag · Aufwand M · Befunde: bereich_trades_tag-21, bereich_trades_tag-19, bereich_trades_tag-42, barrierefreiheit-25, farbe_kontrast-11
Quelle: audit/spec/farbe.md Z. 539–541 · Dateien: web/js/screens/trades.js
Abhängig von: farbe-B26, farbe-B27a

```text
**C31 – `web/js/screens/trades.js`** — bereich_trades_tag-21, bereich_trades_tag-19, bereich_trades_tag-42, barrierefreiheit-25, bereich_trades_tag-25, bereich_trades_tag-29, farbe_kontrast-11
- Z. 45 (Leerzustand) `class="btn sm primary" data-action="new-trade"` → `class="btn sm accent"`
- Z. 49 Score: `<b style="color:${U.scoreColor(sc)}">${sc}</b>` → `<span style="color:${U.scoreText(sc)}">${sc}</span>`; Regeln: `<span class="pos">${I.check.replace('<svg', '<svg style="width:14px;height:14px;display:inline"')}</span>` → `<span class="rule-ic muted">${I.check}</span>` und `<span class="neg" data-tip="…">${I.close.replace(…)}</span>` → `<span class="rule-ic neg" data-tip="…">${I.close}</span>`; `'<span class="faint">offen</span>'` → `'<span class="muted">offen</span>'` (die beiden „—“ bleiben `faint`)
```

## farbe-C31b · Tageskarten-Zähler nur > 0 gefärbt; Verpasste Trades „Entgangen“/„Verlust vermieden“ ohne Vorzeichen und Farbe

Gruppe farbe · Cluster trades_tag · Aufwand S · Befunde: bereich_trades_tag-25, bereich_trades_tag-29
Quelle: audit/spec/farbe.md Z. 542–543 · Dateien: web/js/screens/trades.js
Abhängig von: —

```text
- Z. 54 Tageskarten: `<span class="pos">${d.wins}</span> / <span class="neg">${d.losses}</span>` → `<span class="${d.wins ? 'pos' : ''}">${d.wins}</span> / <span class="${d.losses ? 'neg' : ''}">${d.losses}</span>`
- Z. 59 Verpasste Trades: `<div class="caption">Entgangen</div><div class="score-big ${U.cls(total)}">${fmt.cur(total, { signed: true })}</div>` → `<div class="caption">${total >= 0 ? 'Entgangen' : 'Verlust vermieden'}</div><div class="score-big">${fmt.cur(Math.abs(total))}</div>`
```

## farbe-C31c · Trade-Ansicht: Disziplin-Teilwerte, „Keine Fehler markiert“, Sprachnotiz muted, Knöpfe neutral

Gruppe farbe · Cluster trades_tag · Aufwand S · Befunde: bereich_trades_tag-19, bereich_trades_tag-21, farbe_kontrast-11
Quelle: audit/spec/farbe.md Z. 544–548 · Dateien: web/js/screens/trades.js
Abhängig von: farbe-A1, farbe-A2

```text
- Z. 74 Disziplin-Teilwerte: `c.f >= 0.99 ? 'var(--accent)' : c.f > 0 ? 'var(--warn)' : 'var(--loss)'` → `c.f >= 0.99 ? 'var(--text-2)' : c.f > 0 ? 'var(--warn-text)' : 'var(--loss)'`
- Z. 76 `class="pos small">Keine Fehler markiert` → `class="muted small"`
- Z. 83 `${v.transcript ? '' : 'faint'}` → `${v.transcript ? '' : 'muted'}`
- Z. 84 `class="btn sm primary" data-action="voice-open"` → `class="btn sm"`; Z. 85 `class="btn primary sm" data-action="edit-trade"` → `class="btn sm"`

```

## farbe-D3a · README Z. 43: Long/Short-Fläche „flach, leicht getönt“

Gruppe farbe · Cluster trades_tag · Aufwand S · Befunde: bereich_trades_tag-12
Quelle: audit/spec/farbe.md Z. 565–566 · Dateien: web/README.md
Abhängig von: farbe-B17

```text
**D3 – `web/README.md`**
- Z. 43: „eine leuchtende Fläche gleitet zur gewählten Seite“ → „eine flache, leicht getönte Fläche gleitet zur gewählten Seite“ — bereich_trades_tag-12
```

## typografie-3.2.5b · Spark-Kachel: gap-Regel löschen, .spark-body nowrap, Typo-Dubletten in .tile.spark-tile .val löschen (K26)

Gruppe typografie · Cluster trades_tag · Aufwand S · Befunde: bereich_trades_tag-31
Quelle: audit/spec/typografie.md Z. 358–360 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.5a

```text
| `.tile.spark-tile` (1733) | Regel `{ gap: 2px; }` löschen | bereich_trades_tag-31 (K26) |
| `.tile.spark-tile .spark-body` (1734) | `flex-wrap: nowrap;` ergänzen | bereich_trades_tag-31 |
| `.tile.spark-tile .val` (1735) | `font-family`, `font-size: 28px`, `font-weight`, `letter-spacing`, `line-height` löschen. Es bleibt `{ flex: 0 0 auto; display: flex; align-items: center; margin: 0; padding: 0; min-height: 0; }` | bereich_trades_tag-31 |
```

## typografie-3.7a · Session beenden: Beschriftungen „Heute/Trades/Win-Rate“ als .val-label

Gruppe typografie · Cluster trades_tag · Aufwand S · Befunde: referenz-43
Quelle: audit/spec/typografie.md Z. 411–415 · Dateien: web/js/app.js
Abhängig von: typografie-3.2.2c

```text
### 3.7 `web/js/app.js`

| Stelle | vorher → nachher | Befund |
|---|---|---|
| Z. 530 (Session beenden) | dreimal `<div class="caption">` („Heute“, „Trades“, „Win-Rate“) → `<div class="val-label">` | referenz-43 |
```

## typografie-3.7b · CSV-Vorschau: Datumszellen mit Klasse num

Gruppe typografie · Cluster trades_tag · Aufwand S · Befunde: typografie-12
Quelle: audit/spec/typografie.md Z. 416–417 · Dateien: web/js/app.js
Abhängig von: typografie-3.2.2f

```text
| Z. 567 (CSV-Vorschau) | `<td>${fmt.dateTime(d.open)}</td>` → `<td class="num">…`; `<td>${d.close ? fmt.dateTime(d.close) : '<span class="faint">offen</span>'}</td>` → `<td${d.close ? ' class="num"' : ''}>…` | typografie-12 |

```

## typografie-3.8a · Tagesansicht day.js: „Netto-P&L“ als .val-label, Zeitzelle num

Gruppe typografie · Cluster trades_tag · Aufwand S · Befunde: referenz-43, bereich_trades_tag-39, typografie-12
Quelle: audit/spec/typografie.md Z. 418–423 · Dateien: web/js/screens/day.js
Abhängig von: typografie-3.2.2c, typografie-3.2.2f

```text
### 3.8 `web/js/screens/*.js`

| Datei:Stelle | vorher → nachher | Befund |
|---|---|---|
| day.js:14 | `<div class="caption">Netto-P&L</div>` → `<div class="val-label">Netto-P&L</div>` | referenz-43, bereich_trades_tag-39 |
| day.js:15 | `<td>${fmt.time(t.open)}…</td>` → `<td class="num">${fmt.time(t.open)}…</td>` | typografie-12 |
```

## typografie-3.8b · TradeLog-Spark-Kachel: spark-body bekommt Klasse body

Gruppe typografie · Cluster trades_tag · Aufwand S · Befunde: bereich_trades_tag-31
Quelle: audit/spec/typografie.md Z. 424–424 · Dateien: web/js/screens/trades.js
Abhängig von: typografie-3.2.5b

```text
| trades.js:26 | `<div class="spark-body">` → `<div class="body spark-body">` | bereich_trades_tag-31 |
```

## typografie-3.8c · TradeLog und Verpasste Trades: fmt.dateRow mit num-Zellen, Wert-Beschriftungen als .val-label

Gruppe typografie · Cluster trades_tag · Aufwand S · Befunde: referenz-28, typografie-12, referenz-43
Quelle: audit/spec/typografie.md Z. 425–426 · Dateien: web/js/screens/trades.js
Abhängig von: typografie-3.4c, typografie-3.2.2c, typografie-3.2.2f

```text
| trades.js:49 | `<td>${fmt.dateFull(t.open)} <span class="muted">${fmt.time(t.open)}</span></td>` → `<td class="num">${fmt.dateRow(t.open)} <span class="muted">${fmt.time(t.open)}</span></td>`. Zelle „Geschlossen“: `<td>${t.close ? …` → `<td${t.close ? ' class="num"' : ''}>${t.close ? …`, darin `fmt.dateFull(t.close)` → `fmt.dateRow(t.close)` | referenz-28, typografie-12 (K21) |
| trades.js:59 | `<div class="caption">Entgangen</div>` und `<div class="caption">Wären Gewinner gewesen</div>` → `class="val-label"`; `<td>${fmt.dateFull(C.parseDayKey(x.date))}</td>` → `<td class="num">${fmt.dateRow(C.parseDayKey(x.date))}</td>` | referenz-43, typografie-12, referenz-28 |
```

## abstaende-B16 · Kennzahlen-Raster: Handy-Einspaltigkeit (560er) löschen, .stat-Polster auf Skala, neu .stat-grid.detail (Trade-Ansicht), .detail-head .stars, 359er-Regel einspaltig

Gruppe abstaende · Cluster trades_tag · Aufwand M · Befunde: bereich_trades_tag-23, responsiv-44, abstaende_layout-31
Quelle: audit/spec/abstaende.md Z. 332–332 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
| B16 | `.stat-grid`/`.stat` (Z. 645, 646) | Z. 645 (`@media (max-width: 560px) { .stat-grid { grid-template-columns: 1fr; } .stat { border-right: 0 !important; } }`) löschen. Die zwei Spalten mit Rändern kommen dann aus dem 1100er-Block Z. 644. Z. 646 `.stat { padding: 16px 18px; … }` → `padding: var(--sp-4) var(--sp-5)`. Neu nach Z. 650, in dieser Reihenfolge: `.stat-grid.detail .stat { padding: var(--sp-3) var(--sp-5); } .stat-grid.detail .v { font-size: 16px; } .detail-head .stars { font-size: 13px; color: var(--text-2); letter-spacing: 1px; } @media (max-width: 560px) { .stat-grid.detail .stat { padding: var(--sp-3) var(--sp-4); } } @media (max-width: 359px) { .stat-grid { grid-template-columns: 1fr; } .stat-grid > .stat { border-right: 0; } }` (die Media-Regeln müssen hinter der Desktop-Regel stehen, gleiche Spezifität) | bereich_trades_tag-23, responsiv-44, abstaende_layout-31 |
```

## abstaende-B23 · Trade-Formular als 6-Spalten-Raster .tf-main (Desktop und Handy), .tf-row2/.tf-row3-Regeln ersetzen, .dir-switch ohne min-width, .tf-wide volle Breite

Gruppe abstaende · Cluster trades_tag · Aufwand M · Befunde: bereich_trades_tag-9, abstaende_layout-32
Quelle: audit/spec/abstaende.md Z. 339–339 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
| B23 | Trade-Formular Z. 836–840, 850, 872, 2979–2982 | Z. 836–840 ersetzen durch: `.tf-main { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: var(--sp-4); align-items: end; } .tf-main > .field { grid-column: span 2; } .tf-main > .tf-sym { grid-column: span 4; } .tf-main:has(#f-account) > .tf-sym { grid-column: span 2; } .tf-main > .tf-c3 { grid-column: span 3; }`. Z. 850 `.dir-switch`: `min-width: 210px;` streichen. Z. 872 → `.tf-main > .tf-wide { grid-column: 1 / -1; }`. Handy Z. 2979–2982 ersetzen durch `.tf-main { gap: var(--sp-3); } .tf-main > :is(.tf-sym, .tf-dir, .tf-dt, .field:has(#f-account)) { grid-column: 1 / -1; }` | bereich_trades_tag-9, abstaende_layout-32 |
```

## abstaende-E2 · Trade-Formular-Markup: Wrapper .tf-row3/.tf-row2 entfernen, Felder direkte Kinder von .tf-main mit Klassen tf-dir, tf-c3, tf-dt

Gruppe abstaende · Cluster trades_tag · Aufwand M · Befunde: bereich_trades_tag-9
Quelle: audit/spec/abstaende.md Z. 384–384 · Dateien: web/js/app.js
Abhängig von: abstaende-B23

```text
| E2 | Trade-Formular Z. 353–365 | Wrapper `<div class="tf-row3">` und die beiden `<div class="tf-row2">` samt schließenden `</div>` entfernen. Alle Felder werden direkte Kinder von `.tf-main`. Klassen: Richtung `class="field tf-dir"`; Eröffnet und Geschlossen `class="field tf-c3 tf-dt"`; Punktwert und Gebühren `class="field tf-c3"`. Symbol behält `field tf-sym`, Prop-Konten `field tf-wide`. | bereich_trades_tag-9 |
```

## abstaende-E3 · Aktion 'new-trade' übernimmt in der Tagesansicht das Datum des angezeigten Tages (wie new-trade-day)

Gruppe abstaende · Cluster trades_tag · Aufwand S · Befunde: referenz-17
Quelle: audit/spec/abstaende.md Z. 385–385 · Dateien: web/js/app.js
Abhängig von: —

```text
| E3 | `'new-trade'()` (Z. 324) | → `'new-trade'() { const r = this.state.route, d = this.state.params && this.state.params[0]; if (r === 'day' && d && d !== C.dayKey(new Date())) { const x = C.parseDayKey(d); x.setHours(9, 0, 0, 0); return this.openTradeEditor(null, { openedAt: x.toISOString() }); } this.openTradeEditor(null); }` (wie `new-trade-day` in day.js:24) | referenz-17 |
```

## abstaende-H1 · Trade-Ansicht: Detailkarten .grid two → .grid detail-grid

Gruppe abstaende · Cluster trades_tag · Aufwand S · Befunde: bereich_trades_tag-3
Quelle: audit/spec/abstaende.md Z. 409–413 · Dateien: web/js/screens/trades.js
Abhängig von: abstaende-C1

```text
### web/js/screens/trades.js

| Nr. | Stelle | vorher → nachher | Befunde |
|---|---|---|---|
| H1 | Detail-Raster Z. 86 | `<div class="grid two">` → `<div class="grid detail-grid">` | bereich_trades_tag-3 |
```

## abstaende-H2 · Trade-Kennzahlen: Eintrag „Bewertung“ aus dem Raster, Sterne im Kopf, .stat-grid.detail ohne Inline-Stile

Gruppe abstaende · Cluster trades_tag · Aufwand M · Befunde: bereich_trades_tag-23, responsiv-44
Quelle: audit/spec/abstaende.md Z. 414–414 · Dateien: web/js/screens/trades.js
Abhängig von: abstaende-B16

```text
| H2 | Kennzahlen Z. 67–68 | Z. 68: Eintrag `['Bewertung', …]` aus dem Array entfernen. `<div class="stat-grid">` → `<div class="stat-grid detail">`. An `.stat` `style="padding:12px 20px"` und an `.v` `style="font-size:16px"` streichen. Z. 67 nach den Chips, vor `<div class="big">`: `${t.rating ? `<span class="stars" aria-label="Bewertung ${t.rating} von 5">${'★'.repeat(t.rating)}<span class="faint">${'★'.repeat(5 - t.rating)}</span></span>` : ''}` | bereich_trades_tag-23, responsiv-44 |
```

## abstaende-H3 · Weitere Inline-Abstände in trades.js (zusammen 20) nach 1.16 ersetzen

Gruppe abstaende · Cluster trades_tag · Aufwand M · Befunde: abstaende_layout-34
Quelle: audit/spec/abstaende.md Z. 415–416 · Dateien: web/js/screens/trades.js
Abhängig von: abstaende-A6

```text
| H3 | weitere Inline-Abstände (Z. 59 u. a., zusammen 20) | nach 1.16 ersetzen | abstaende_layout-34 |

```

## abstaende-E-day1 · Tagesansicht: Screen-Objekt mit head { range: false } und actions(ctx) (Zertifikat-Knopf)

Gruppe abstaende · Cluster trades_tag · Aufwand S · Befunde: referenz-17
Quelle: audit/spec/abstaende.md Z. 432–436 · Dateien: web/js/screens/day.js
Abhängig von: —

```text
### web/js/screens/day.js

| Nr. | Stelle | vorher → nachher | Befunde |
|---|---|---|---|
| E-day1 | Screen-Objekt nach `title` | `head: { range: false },` und `actions(ctx) { const key = ctx.params[0] \|\| C.dayKey(new Date()); return `<button type="button" class="btn" data-action="cert-open" data-kind="day" data-ref="${key}" data-tip="Daily Profit Certificate">${I.shield}<span class="hide-m">Zertifikat</span></button>`; },` | referenz-17 |
```

## abstaende-E-day2 · Tagesansicht: Datumsnavigation als ctx.headLeft in die Kopfreihe, Kopfknöpfe Zertifikat/Check-in/„Trade für diesen Tag“ entfallen, .day-title in app.css

Gruppe abstaende · Cluster trades_tag · Aufwand M · Befunde: referenz-17
Quelle: audit/spec/abstaende.md Z. 437–437 · Dateien: web/js/screens/day.js, web/css/app.css
Abhängig von: abstaende-E-day1, abstaende-E3, abstaende-A6

```text
| E-day2 | `render()` Z. 12 und Z. 20 | Die Datumsnavigation wird Teil der Kopfreihe: `ctx.headLeft = `<div class="row s-2"><a class="btn round" href="#/day/${C.dayKey(prev)}" aria-label="Voriger Tag">${I.chevL}</a><a class="btn round" href="#/day/${C.dayKey(next)}" aria-label="Nächster Tag">${I.chevR}</a><h2 class="day-title">${fmt.weekdayLong(date)}</h2>${isToday ? U.pill('Heute', 'win') : `<a class="btn sm ghost" href="#/day/${C.dayKey(new Date())}">Heute</a>`}</div>`;` (das Konto steht davor, pageHead setzt `headLeft` nach dem Konto). Die Pillenfarbe entscheidet die Farb-Gruppe, Layout und Position stehen hier. Die Knöpfe „Zertifikat“, „Check-in“ und „Trade für diesen Tag“ aus Z. 12 entfallen. Z. 20 `return `${nav}${stats}…`` → `return `${stats}…``. CSS neu (app.css, Tagesansicht): `.day-title { font-size: 18px; margin-left: var(--sp-1); }`. Ergebnis: eine Kopfreihe, links Konto · ‹ › Datum (Heute), rechts Zertifikat · Session · „Trade loggen“. | referenz-17 |
```

## abstaende-E-day3 · Aktion new-trade-day entfernen, sobald grep sie nicht mehr findet

Gruppe abstaende · Cluster trades_tag · Aufwand S · Befunde: referenz-17
Quelle: audit/spec/abstaende.md Z. 438–438 · Dateien: web/js/screens/day.js
Abhängig von: abstaende-E-day2

```text
| E-day3 | `new-trade-day` (Z. 24) | bleibt, wird aber nicht mehr verwendet. Entfernen, sobald `grep -rn "new-trade-day" web/js` außer Z. 24 nichts mehr findet. | referenz-17 |
```

## abstaende-E-day4 · Inline-Abstände in day.js (10) nach 1.16 ersetzen

Gruppe abstaende · Cluster trades_tag · Aufwand M · Befunde: abstaende_layout-34
Quelle: audit/spec/abstaende.md Z. 439–440 · Dateien: web/js/screens/day.js
Abhängig von: abstaende-A6

```text
| E-day4 | Inline-Abstände (10) | nach 1.16 ersetzen | abstaende_layout-34 |

```

## abstaende-R1 · mobiletest: TradeLog-Abstand 18 → 16 (Wert und Text)

Gruppe abstaende · Cluster trades_tag · Aufwand S · Befunde: abstaende_layout-32
Quelle: audit/spec/abstaende.md Z. 516–520 · Dateien: web/e2e/mobiletest.js
Abhängig von: abstaende-C11

```text
### Tests

| Nr. | Datei | Änderung | Befunde |
|---|---|---|---|
| R1 | `web/e2e/mobiletest.js:31` | `g === 18` → `g === 16`, Text „18px Abstand“ → „16px Abstand“ | abstaende_layout-32 |
```

## abstaende-S4 · README Z. 93: TradeLog-Blöcke 16 px statt 18 px

Gruppe abstaende · Cluster trades_tag · Aufwand S · Befunde: abstaende_layout-32
Quelle: audit/spec/abstaende.md Z. 533–533 · Dateien: web/README.md
Abhängig von: abstaende-C11

```text
| S4 | Z. 93 | „TradeLog-Blöcke mit festem 18-px-Abstand“ → „TradeLog-Blöcke mit festem 16-px-Abstand (wie das Dashboard-Raster)“ | abstaende_layout-32 |
```
