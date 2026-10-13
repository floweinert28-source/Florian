# Paket 047 · diagramme

Schritte: 4 · Dateien: web/css/app.css, web/js/ui.js, web/js/widgets.js
Betroffene Tests laut Spezifikation: 4.6: gespeicherter Report mit alten Standardfarben zeigt neue, eigene Farbe bleibt; web/e2e/dashtest.js:81–100 (Report-Panel, prüfen)
Baut auf Paketen auf: —

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## farbe-B13 · Diagramm-Achsen: eine .chart text-Regel in --muted, Doppelregel Z. 1647–1648 löschen

Gruppe farbe · Cluster diagramme · Aufwand S · Befunde: diagramme-37
Quelle: audit/spec/farbe.md Z. 280–283 · Dateien: web/css/app.css
Abhängig von: —

```text
**B13 – Diagramm-Achsen** — diagramme-37
- Z. 683 `.chart text { fill: var(--muted); font-size: 11px; font-family: var(--font); }` → `.chart text { fill: var(--muted); font-size: 11px; font-variant-numeric: tabular-nums; }` (Schrift setzt die Sammelregel Z. 1800)
- Z. 1647–1648 Kommentar `/* Achsen-Text */` und `.chart text { fill: var(--text-2); font-size: 11.5px; }` löschen

```

## farbe-B15 · Ungenutzte Gewinn-Heatmap .heat: l1 neutral, l2–l4 auf --profit

Gruppe farbe · Cluster diagramme · Aufwand S · Befunde: farbe_kontrast-20
Quelle: audit/spec/farbe.md Z. 294–297 · Dateien: web/css/app.css
Abhängig von: —

```text
**B15 – Gewinn-Heatmap (ungenutzt), Z. 737–740** — farbe_kontrast-20
- `.heat i.l1 { background: color-mix(in srgb, var(--accent) 30%, var(--surface-3)); }` → `.heat i.l1 { background: color-mix(in srgb, var(--text) 18%, var(--surface-3)); }` (l1 = nur Check-in/Notiz)
- `.heat i.l2/.l3/.l4`: `var(--accent)` → `var(--profit)` (Prozente bleiben)

```

## farbe-B27b · ui.js: Monte-Carlo-Pfade und Drawdown-Histogramm neutral, Ruin-Bereich --loss .9

Gruppe farbe · Cluster diagramme · Aufwand S · Befunde: bereich_statistik-25
Quelle: audit/spec/farbe.md Z. 351–353 · Dateien: web/js/ui.js
Abhängig von: —

```text
- Z. 350 (Monte-Carlo-Pfade) `stroke="var(--accent)" stroke-opacity=".3"` → `stroke="var(--text-2)" stroke-opacity=".22"`
- Z. 354 (Drawdown-Histogramm) `fill="var(--${b.lo >= mc.ruinPct ? 'loss' : 'accent'})" fill-opacity="${b.lo >= mc.ruinPct ? 1 : .75}"` → `fill="var(--${b.lo >= mc.ruinPct ? 'loss' : 'text-2'})" fill-opacity="${b.lo >= mc.ruinPct ? .9 : .45}"`

```

## farbe-C14b · Report: neue Palette REPORT_COLORS und Umschreiben alter Standardfarben in reportConfig

Gruppe farbe · Cluster diagramme · Aufwand M · Befunde: diagramme-44, bereich_dashboard-38
Quelle: audit/spec/farbe.md Z. 442–443 · Dateien: web/js/widgets.js
Abhängig von: —

```text
- Z. 211 `const REPORT_COLORS = ['#3d6bff', '#f5a53a', '#4fd1a5'];` → `const REPORT_COLORS = ['#4a6fe3', '#b4549f', '#c0702f'];`
- Z. 216 (`reportConfig`): an die bestehende Kette nach `.map(...)` anhängen: `.map(o => { const OLD = { '#3d6bff': '#4a6fe3', '#f5a53a': '#b4549f', '#4fd1a5': '#c0702f' }; const n = OLD[String(o.color).toLowerCase()]; return n ? Object.assign({}, o, { color: n }) : o; })` (eigene Farben bleiben)
```
