# Paket 045 · responsiv

Schritte: 4 · Dateien: web/css/app.css, web/e2e/runall.sh, web/e2e/tablettest.js, web/js/screens/dash-filter.js
Betroffene Tests laut Spezifikation: web/e2e/filtertest.js:11; web/e2e/headtest.js:24-25 (Desktop unverändert); web/e2e/mobiletest.js:30-31 (TradeLog-Abstände 18px); web/e2e/scrollareatest.js:17-19; web/e2e/sidebartest.js (grün); web/e2e/tlfittest.js (unverändert grün)
Baut auf Paketen auf: 6, 7, 10, 17, 24, 33, 42, 43, 44

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## responsiv-B6b · TradeLog-Kacheln unter 961 px als 2 × 2

Gruppe responsiv · Cluster responsiv · Aufwand S · Befunde: bereich_trades_tag-32
Quelle: audit/spec/responsiv.md Z. 311–311 · Dateien: web/css/app.css
Abhängig von: —

```text
- Im Block `@media (max-width: 960px)` (Z. 1774 ff.) ergänzen: `.tl-fit > .grid.tiles { grid-template-columns: repeat(2, minmax(0, 1fr)); }`
```

## responsiv-3.5 · Dashboard-Filterfenster am Handy mit 16 px Rand

Gruppe responsiv · Cluster responsiv · Aufwand S · Befunde: responsiv-24, bereich_dashboard-27
Quelle: audit/spec/responsiv.md Z. 467–472 · Dateien: web/js/screens/dash-filter.js
Abhängig von: —

```text
### 3.5 web/js/screens/dash-filter.js (responsiv-24, bereich_dashboard-27)

- Z. 148 Kommentar „auf dem Handy volle Breite mit 8px Rand“ → „mit 16px Rand (Seitenrand)“.
- Z. 153 `const w = phone ? vw - 16 : …` → `phone ? vw - 32 : …`
- Z. 154 `const left = phone ? 8 : …` → `phone ? 16 : …`

```

## responsiv-3.20c · Neue Suite tablettest.js (1024 × 768, Abschnitt 4 B) in runall.sh; tlfittest unverändert grün

Gruppe responsiv · Cluster responsiv · Aufwand M · Befunde: —
Quelle: audit/spec/responsiv.md Z. 572–573 · Dateien: web/e2e/tablettest.js, web/e2e/runall.sh
Abhängig von: responsiv-B1, responsiv-B6a, responsiv-B6c, responsiv-B7, responsiv-B8, responsiv-A2, responsiv-3.3d, responsiv-3.9a, responsiv-3.13, responsiv-C4, responsiv-3.14

```text
- `tlfittest.js`: unverändert lassen (muss grün bleiben); neue Suite `tablettest.js` für 1024 × 768 (Abschnitt 4, B) und in `runall.sh` eintragen.

```

## wording-S3.5 · app.css Handy (≤ 560px): .ce-head untereinander

Gruppe wording · Cluster responsiv · Aufwand S · Befunde: bereich_konto-21
Quelle: audit/spec/wording.md Z. 331–331 · Dateien: web/css/app.css
Abhängig von: —

```text
| 3.5 | Handy-Block `@media (max-width: 560px)` am Ende der Datei | – → `.ce-head { flex-direction: column; gap: 2px; }` | bereich_konto-21 |
```
