# Paket 049 · diagramme, prop

Schritte: 5 · Dateien: web/js/screens/prop.js, web/js/ui.js
Betroffene Tests laut Spezifikation: Akzeptanz grep 4; Sonde 14; Sonde 15 (Balken innerhalb der Gitterlinien)
Baut auf Paketen auf: 48

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## diagramme-J2 · Prop „Ausgaben vs. Payouts“: .chart-legend vor dem Diagramm

Gruppe diagramme · Cluster prop · Aufwand S · Befunde: diagramme-14
Quelle: audit/spec/diagramme.md Z. 666–667 · Dateien: web/js/screens/prop.js
Abhängig von: diagramme-A4

```text
**J2 Legende** (diagramme-14) Z. 257: die `<div class="legend">…</div>` hinter dem `.chart` → `<div class="chart-legend">…</div>` vor dem `.chart` (Inhalt gleich).

```

## diagramme-C1 · niceTicks mit rundem Bereich (floor/ceil auf Schritt)

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: diagramme-8, bereich_konto-55
Quelle: audit/spec/diagramme.md Z. 358–366 · Dateien: web/js/ui.js
Abhängig von: —

```text
### 3.3 `web/js/ui.js` – Skalen und Bausteine

**C1 `niceTicks` mit rundem Bereich** (diagramme-8, bereich_konto-55)
- Z. 189 → in der Funktion nach der Schrittwahl `s`:
  ```js
  const lo = Math.floor(min / s + 1e-9) * s, hi = Math.ceil(max / s - 1e-9) * s, k = Math.round((hi - lo) / s); const t = []; for (let i = 0; i <= k; i++) t.push(+(lo + i * s).toFixed(6)); return t;
  ```
  Das ersetzt die bisherige Schleife `for (let v = Math.ceil(min / s) * s; v <= max + 1e-9; v += s)`. Alle Aufrufer (ui.js:264, 291, 302, 325, 333, 340, 348; widgets.js:59, 77, 89, 99; affiliate.js:43) nehmen schon `Math.min/Math.max` mit den Daten und brauchen keine Änderung.

```

## diagramme-C3 · axisLeft ohne Überlappung (14px), Kommentar durchgezogene Haarlinien

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: diagramme-8, diagramme-7
Quelle: audit/spec/diagramme.md Z. 369–375 · Dateien: web/js/ui.js
Abhängig von: —

```text
**C3 `axisLeft` ohne Überlappung, Kommentar** (diagramme-8, diagramme-7)
- Z. 228 Kommentar `gestrichelte Gitterlinien` → `durchgezogene Haarlinien`.
- Z. 230 →
  ```js
  const axisLeft = (ticks, yf, ml, W, mr, fmtFn) => { let last = Infinity; return `<g class="grid">${ticks.map(t => { const y = yf(t), show = Math.abs(last - y) >= 14; if (show) last = y; return `<line x1="${ml}" x2="${W - mr}" y1="${y}" y2="${y}"/>${show ? `<text x="${ml - 8}" y="${y + 3.5}" text-anchor="end">${fmtFn(t)}</text>` : ''}`; }).join('')}</g>`; };
  ```

```

## diagramme-C4 · Neuer Baustein xLabels für waagerechte Achsen ohne Überlappung

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: bereich_dashboard-35, diagramme-9
Quelle: audit/spec/diagramme.md Z. 376–381 · Dateien: web/js/ui.js
Abhängig von: —

```text
**C4 Waagerechte Beschriftung ohne Überlappung** (bereich_dashboard-35, diagramme-9). Neu nach Z. 230:
```js
/* waagerechte Achse: Beschriftung nur, wenn sie die vorige nicht berührt; am Rand nach innen geschoben, nie gedreht */
const xLabels = (items, x0, x1, y) => { let right = -Infinity; return items.map(({ x, label }) => { const s = String(label), w = s.length * 6.2 + 4, cx = Math.min(x1 - w / 2, Math.max(x0 + w / 2, x)); if (cx - w / 2 < right + 10) return ''; right = cx + w / 2; return `<text x="${cx.toFixed(1)}" y="${y}" text-anchor="middle">${esc(s)}</text>`; }).join(''); };
```

```

## diagramme-C5 · Balken-Pfade vbarPath/hbarPath, Export in root.UI (inkl. xLabels, fitRadars)

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: diagramme-11
Quelle: audit/spec/diagramme.md Z. 382–390 · Dateien: web/js/ui.js
Abhängig von: diagramme-C4

```text
**C5 Balken-Pfade** (diagramme-11). Neu nach C4:
```js
/* Balken: an der Nulllinie gerade, nur das Wertende gerundet (Radius höchstens 3 px, halbe Breite bzw. Länge) */
const vbarPath = (x, w, yz, yv, r = 3) => { const f = n => +n.toFixed(2), h = Math.abs(yv - yz), rr = Math.min(r, w / 2, h); if (rr < 0.5) return `M${f(x)},${f(yz)}V${f(yv)}H${f(x + w)}V${f(yz)}Z`; const up = yv < yz, s = up ? 1 : 0, d = up ? rr : -rr; return `M${f(x)},${f(yz)}V${f(yv + d)}A${f(rr)},${f(rr)} 0 0 ${s} ${f(x + rr)},${f(yv)}H${f(x + w - rr)}A${f(rr)},${f(rr)} 0 0 ${s} ${f(x + w)},${f(yv + d)}V${f(yz)}Z`; };
const hbarPath = (y, h, xz, xv, r = 3) => { const f = n => +n.toFixed(2), w = Math.abs(xv - xz), rr = Math.min(r, h / 2, w); if (rr < 0.5) return `M${f(xz)},${f(y)}H${f(xv)}V${f(y + h)}H${f(xz)}Z`; const right = xv > xz, s = right ? 1 : 0, d = right ? -rr : rr; return `M${f(xz)},${f(y)}H${f(xv + d)}A${f(rr)},${f(rr)} 0 0 ${s} ${f(xv)},${f(y + rr)}V${f(y + h - rr)}A${f(rr)},${f(rr)} 0 0 ${s} ${f(xv + d)},${f(y + h)}H${f(xz)}Z`; };
```
- Z. 464 `root.UI = { … }` um `vbarPath, hbarPath, xLabels, fitRadars` ergänzen.
- Aufrufmuster: `<path class="br${neg ? ' dn' : ''}" d="${vbarPath(x, bw, yNull, yWert)}" fill="…" fill-opacity="…" data-tip="…"/>`. Die Mindestlänge (A-10) wird vorher an `yWert` bzw. `xWert` geklemmt.

```
