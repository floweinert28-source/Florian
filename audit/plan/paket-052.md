# Paket 052 · diagramme

Schritte: 5 · Dateien: web/README.md, web/css/app.css, web/e2e/chartanimtest.js, web/js/ui.js
Betroffene Tests laut Spezifikation: web/e2e/chartanimtest.js:10–11; web/e2e/chartanimtest.js:10–11 (Schritt bewegung-3.11d)
Baut auf Paketen auf: 3, 51

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## bewegung-B8 · Score-Skala und Fortschritts-Ring auf --dur-4 --ease

Gruppe bewegung · Cluster diagramme · Aufwand S · Befunde: bewegung-1, bewegung-33
Quelle: audit/spec/bewegung.md Z. 212–215 · Dateien: web/css/app.css
Abhängig von: bewegung-A1

```text
**B8 Score-Skala und Ring** (bewegung-1, bewegung-33)
- Z. 568 `animation: score-run 1.3s cubic-bezier(.22, .9, .25, 1) .2s backwards;` → `animation: score-run var(--dur-4) var(--ease) calc(var(--stagger) * 2) backwards;`
- Z. 1317 `transition: stroke-dashoffset 1.1s cubic-bezier(.22, .61, .36, 1);` → `transition: stroke-dashoffset var(--dur-4) var(--ease);` Das `filter` in derselben Zeile regelt KI-Look/Diagramme (K23).

```

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
