# Paket 054 · zustaende, diagramme

Schritte: 13 · Dateien: web/README.md, web/css/app.css, web/e2e/chartanimtest.js, web/js/screens/dash-filter.js, web/js/ui.js, web/js/widgets.js
Betroffene Tests laut Spezifikation: Akzeptanz 4.3 leer_shadow, leer_progress; e2e/coachtest.js:50, :197 (.coach-wrap .empty b); e2e/dashtest.js:143; e2e/friedhoftest.js:22; e2e/proptest.js:20; web/e2e/chartanimtest.js:10–11; web/e2e/chartanimtest.js:10–11 (Schritt bewegung-3.11d); web/e2e/dashtest.js:67 (.recent-card .more-link mit Trades)
Baut auf Paketen auf: 2, 3, 9, 53

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## bewegung-C5 · Heatmaps: feiner Umriss statt Vergrößerung beim Darüberfahren

Gruppe bewegung · Cluster diagramme · Aufwand S · Befunde: bewegung-22
Quelle: audit/spec/bewegung.md Z. 261–265 · Dateien: web/css/app.css
Abhängig von: —

```text
**C5 Heatmaps** (bewegung-22)
- Z. 1293 `.activity i:hover { transform: scale(1.08); }` → `.activity i:hover { outline: 1px solid var(--text-2); outline-offset: 1px; }`
- Z. 1673 `.tracker i:hover { transform: scale(1.12); }` → `.tracker i:hover { outline: 1px solid var(--text-2); outline-offset: 1px; }`
- Z. 1772 `.ym-grid i:hover { transform: scale(1.15); }` → `.ym-grid i:hover { outline: 1px solid var(--text-2); outline-offset: 1px; }`

```

## bewegung-3.6 · ui.js enterAnim: Balken-Staffel aus --dur-2, Punkt-Verzögerung aus --dur-4/--dur-1

Gruppe bewegung · Cluster diagramme · Aufwand S · Befunde: bewegung-1
Quelle: audit/spec/bewegung.md Z. 318–322 · Dateien: web/js/ui.js
Abhängig von: bewegung-A1, bewegung-B6

```text
### 3.6 `web/js/ui.js` (bewegung-1)
- Z. 252 Kommentar `die Staffelung bleibt insgesamt unter 0,4 s` → `die Staffelung bleibt insgesamt bei höchstens --dur-2 (240 ms)`
- Z. 253 `const step = bars.length ? Math.min(14, 400 / bars.length) : 0;` → `const total = root.Motion && root.Motion.ms ? root.Motion.ms('--dur-2') : 240; const step = bars.length ? Math.min(14, total / bars.length) : 0;`
- Z. 257 `svg.style.setProperty('--dt-delay', hasLine ? '1.1s' : '.15s');` → `svg.style.setProperty('--dt-delay', hasLine ? 'calc(var(--dur-4) * .7)' : 'var(--dur-1)');`

```

## bewegung-3.11d · chartanimtest: frühe Messung nach 120 ms, Prüfung off > 0

Gruppe bewegung · Cluster diagramme · Aufwand S · Befunde: —
Quelle: audit/spec/bewegung.md Z. 347–348 · Dateien: web/e2e/chartanimtest.js
Abhängig von: bewegung-B6, bewegung-3.6

```text
- **chartanimtest.js:10** `await p.waitForTimeout(380)` → `await p.waitForTimeout(120)`. **Z. 11** `early.off > 100` → `early.off > 0`. Z. 12 (1500 ms) bleibt.

```

## bewegung-3.12c · README Z. 352: Balken-Staffel höchstens --dur-2, Einzug nach gut 0,7 s fertig

Gruppe bewegung · Cluster diagramme · Aufwand S · Befunde: —
Quelle: audit/spec/bewegung.md Z. 352–352 · Dateien: web/README.md
Abhängig von: bewegung-B6, bewegung-3.6

```text
- **Z. 352** `Staffelung \`--bd\` insgesamt unter 0,4 s` → `Staffelung \`--bd\` insgesamt höchstens \`--dur-2\``. Nach „Punkte springen zuletzt auf“ ergänzen: „; der ganze Einzug ist nach gut 0,7 s fertig“.
```

## farbe-B12 · Leerzustand: Symbolregel nur für direktes Kind (.empty > svg)

Gruppe farbe · Cluster zustaende · Aufwand S · Befunde: bereich_trades_tag-21
Quelle: audit/spec/farbe.md Z. 278–279 · Dateien: web/css/app.css
Abhängig von: —

```text
**B12 – Leerzustand, Z. 676:** `.empty svg { width: 34px; height: 34px; color: var(--faint); }` → `.empty > svg { … }` (Werte gleich; Symbole in Knöpfen des Leerzustands bleiben 16 px) — bereich_trades_tag-21

```

## farbe-B20 · Ladelinie .ld in --text-2 ohne drop-shadow

Gruppe farbe · Cluster zustaende · Aufwand S · Befunde: bewegung-44
Quelle: audit/spec/farbe.md Z. 319–322 · Dateien: web/css/app.css
Abhängig von: —

```text
**B20 – Ladelinie, Z. 1522 und 1527** — bewegung-44
- `.ld { …; color: var(--accent); … }` → `color: var(--text-2);`
- `.ld .ld-line { …; filter: drop-shadow(0 0 3px var(--accent-soft)); }` → `filter` streichen

```

## farbe-C14d · Letzte Trades: „Mehr anzeigen“ nur bei rows.length

Gruppe farbe · Cluster zustaende · Aufwand S · Befunde: referenz-9
Quelle: audit/spec/farbe.md Z. 445–445 · Dateien: web/js/widgets.js
Abhängig von: —

```text
- Z. 257 `${table}<div class="more-row"><a class="more-link" href="#/trades">Mehr anzeigen</a></div>` → `${table}${rows.length ? '<div class="more-row"><a class="more-link" href="#/trades">Mehr anzeigen</a></div>' : ''}`
```

## farbe-C18 · Dashboard-Filter: „Nichts gefunden“ in muted

Gruppe farbe · Cluster zustaende · Aufwand S · Befunde: barrierefreiheit-25, farbe_kontrast-11
Quelle: audit/spec/farbe.md Z. 467–468 · Dateien: web/js/screens/dash-filter.js
Abhängig von: —

```text
**C18 – `web/js/screens/dash-filter.js` Z. 95 und Z. 183:** `<div class="small faint" style="padding:8px 10px">Nichts gefunden` → `class="small muted"` — barrierefreiheit-25, farbe_kontrast-11

```

## farbe-D3g · README Z. 340: Ladelinie „helles Stück“

Gruppe farbe · Cluster zustaende · Aufwand S · Befunde: bewegung-44
Quelle: audit/spec/farbe.md Z. 572–574 · Dateien: web/README.md
Abhängig von: farbe-B20

```text
- Z. 340: „über die ein grünes Stück gleitet“ → „über die ein helles Stück gleitet“ — bewegung-44

---
```

## typografie-3.2.4h · Leer-Titel .empty b auf 600

Gruppe typografie · Cluster zustaende · Aufwand S · Befunde: bereich_training-33
Quelle: audit/spec/typografie.md Z. 343–343 · Dateien: web/css/app.css
Abhängig von: —

```text
| `.empty b` (677) | `font-weight: 600;` ergänzen | bereich_training-33 |
```

## abstaende-C13 · Lade-Skelett an Seitenebene und Seitenleiste angleichen: .boot-body, .boot-tiles, .boot-main, .boot-sb

Gruppe abstaende · Cluster zustaende · Aufwand S · Befunde: abstaende_layout-32, abstaende_layout-7
Quelle: audit/spec/abstaende.md Z. 362–363 · Dateien: web/css/app.css
Abhängig von: abstaende-A1, abstaende-D1

```text
| C13 | Skelett Z. 1540–1548 | `.boot-body` `padding: 22px var(--gutter) 60px; … gap: 18px;` → `padding: var(--sp-6) var(--gutter) 60px; … gap: var(--grid-gap);`. `.boot-tiles` und `.boot-main` `gap: 18px` → `var(--grid-gap)`. `.boot-sb` `padding: 6px 10px` → `padding: 22px 10px 6px` (die Leiste hat oben kein Polster mehr, D1). | abstaende_layout-32, abstaende_layout-7 |

```

## abstaende-G1 · Gesamt-Score-Leerzustand mit emptyBox(280) (gleiche Höhe in der Reihe)

Gruppe abstaende · Cluster zustaende · Aufwand S · Befunde: zustaende-9
Quelle: audit/spec/abstaende.md Z. 400–404 · Dateien: web/js/widgets.js
Abhängig von: —

```text
### web/js/widgets.js

| Nr. | Stelle | vorher → nachher | Befunde |
|---|---|---|---|
| G1 | Gesamt-Score Z. 227 | `if (d.empty) return card(e, emptyBox());` → `card(e, emptyBox(280))` | zustaende-9 |
```

## komponenten-C11 · Leerzustand: Symbol und Titel nur als direkte Kinder, Abstand zur Aktion

Gruppe komponenten · Cluster zustaende · Aufwand S · Befunde: zustaende-1, bereich_trades_tag-2, bereich_prop-42, bereich_training-31, zustaende-14
Quelle: audit/spec/komponenten.md Z. 260–264 · Dateien: web/css/app.css
Abhängig von: —

```text
**C11 – Leerzustand** (zustaende-1, bereich_trades_tag-2, bereich_prop-42, bereich_training-31, zustaende-14)
- Z. 676 `.empty svg { width: 34px; height: 34px; color: var(--faint); }` → `.empty > svg { width: 34px; height: 34px; color: var(--faint); }`
- Z. 677 `.empty b { color: var(--text); font-size: 15px; }` → `.empty > b { color: var(--text); font-size: 15px; }`
- Nach Z. 678 neu: `.empty > .btn, .empty > .row { margin-top: 8px; }`

```
