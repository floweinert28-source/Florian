# Paket 050 · training, diagramme

Schritte: 2 · Dateien: web/README.md, web/js/widgets.js
Betroffene Tests laut Spezifikation: web/e2e/dashtest.js:92 (O2); web/e2e/dashtest.js:95 (O3); web/e2e/shadowtest.js:30 (O5)
Baut auf Paketen auf: 25, 47, 49

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## diagramme-P2 · README Fortschritt (Z. 129/136): Heatmap neutral, Ring 64px, Wochen-Säulen

Gruppe diagramme · Cluster training · Aufwand S · Befunde: farbe_kontrast-21, bereich_training-7, bereich_training-15, responsiv-34, diagramme-25
Quelle: audit/spec/diagramme.md Z. 759–762 · Dateien: web/README.md
Abhängig von: diagramme-A5, diagramme-H1, diagramme-C18

```text
- **P2** Z. 129/136 (Fortschritt):
  - „Aktivitäts-Heatmap in neutralen Stufen (viele Trades sind keine Bewertung)“
  - „Regeltreue-Ring 64 px in der Score-Farbe, ohne Schein, ohne Bogen bei 0“
  - „Disziplin pro Woche: Score über jeder Säule; bei wenig Platz kurze Daten und nur jede zweite (dritte, vierte) Woche beschriftet, die jüngste immer“
```

## diagramme-E1 · drawers.lines: je Einheit eine Spur übereinander, linke Achsen, Pfad-Balken, gestrichelte Reihen

Gruppe diagramme · Cluster diagramme · Aufwand L · Befunde: diagramme-6, bereich_training-28, diagramme-11, bereich_statistik-35
Quelle: audit/spec/diagramme.md Z. 540–556 · Dateien: web/js/widgets.js
Abhängig von: diagramme-C5

```text
### 3.6 `web/js/widgets.js`

**E1 Mehrlinien-Zeichner als Spuren** (diagramme-6, bereich_training-28, diagramme-11, bereich_statistik-35)
- Z. 54 Kommentar → `/* Mehrere Linien oder Balken; je Einheit eine Spur übereinander (nie zwei y-Achsen auf einer Fläche) */`
- Z. 57–61 ersetzen durch:
  ```js
  const units = [...new Set(series.map(s => s.unit))].slice(0, 3); const SHARE = [[1], [.62, .38], [.5, .25, .25]][units.length - 1]; const GAP = 14, mt = 12, mb = 30, ih = H - mt - mb - GAP * (units.length - 1);
  const lane = {}; let top = mt;
  units.forEach((u, ui) => { const h = ih * SHARE[ui]; const vals = series.filter(s => s.unit === u).flatMap(s => pts.map(p => p.v[s.key]).concat(s.type === 'bar' ? [0] : [])).filter(v => v != null && isFinite(v)); if (!vals.length) vals.push(0); const lo = Math.min(...vals), hi = Math.max(...vals); const ticks = U.niceTicks(lo, hi === lo ? lo + 1 : hi, h < 100 ? 3 : 5); lane[u] = { top, h, ticks, y0: Math.min(ticks[0], lo), y1: Math.max(ticks[ticks.length - 1], hi) }; top += h + GAP; });
  const ml = Math.max(...units.map(u => U.axisWidth(lane[u].ticks.map(t => unitFmt(u, t, true))))), mr = 12; const iw = W - ml - mr;
  const n = pts.length; const x = i => n === 1 ? ml + iw / 2 : ml + i / (n - 1) * iw; const y = (u, v) => { const L = lane[u]; return L.top + (L.y1 - v) / (L.y1 - L.y0 || 1) * L.h; };
  ```
- Z. 66 den Ausdruck `${U.axisLeft(scale[u0].ticks, …)}` hinter `<svg …>` und die ganze Z. 67 (rechte Achse) ersetzen durch `${units.map(u => U.axisLeft(lane[u].ticks, v => y(u, v), ml, W, mr, v => unitFmt(u, v, true)) + (series.some(s => s.unit === u && s.type === 'bar') && lane[u].y0 < 0 && lane[u].y1 > 0 ? `<line class="zero" x1="${ml}" x2="${W - mr}" y1="${y(u, 0)}" y2="${y(u, 0)}"/>` : '')).join('')}`
- Z. 68 Balken: `scale[s.unit]` → `lane[s.unit]`. `<rect … rx="2" class="br…" fill-opacity=".8"/>` → `<path class="br${v >= 0 ? '' : ' dn'}" d="${U.vbarPath(x(i) - bw * bars.length / 2 + bi * bw, bw, zero, v >= 0 ? Math.min(yy, zero - 1) : Math.max(yy, zero + 1))}" fill="${s.color}" fill-opacity=".85"/>`
- Z. 69 Linie: nach `stroke-linecap="round"` `${s.dash ? ` stroke-dasharray="${s.dash}"` : ''}` einfügen. Punkte nur bei `dots && !s.dash`.
- Z. 72 `bindHover` bleibt.

```
