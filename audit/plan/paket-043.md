# Paket 043 · responsiv

Schritte: 4 · Dateien: web/css/app.css, web/e2e/runall.sh, web/e2e/tablettest.js, web/js/screens/dash-filter.js
Betroffene Tests laut Spezifikation: web/e2e/filtertest.js:11; web/e2e/headtest.js:24-25 (Desktop unverändert); web/e2e/mobiletest.js:30-31 (TradeLog-Abstände 18px); web/e2e/scrollareatest.js:17-19; web/e2e/sidebartest.js (grün); web/e2e/tlfittest.js (unverändert grün)
Baut auf Paketen auf: 7, 16, 23, 31, 40, 41, 42

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: #fd-layer] close() vereint beide Fassungen: `function close(ret) { const u = ui(); const was = u.open; u.open = false; u.draft = null; u.pick = null; const pop = document.getElementById('fd-pop'); if (pop) { pop.removeAttribute('id'); pop.inert = true; const Mo = root.Motion; if (Mo && Mo.enabled) Mo.leave(pop, 'closing', '--dur-1', () => pop.remove()); else pop.remove(); } const b = document.querySelector('[data-action="dash-f-open"]'); if (b) { b.setAttribute('aria-expanded', 'false'); if (ret === true && was) b.focus({ preventScroll: true }); } }`. Die Funktion kehrt nicht vorzeitig zurück, denn aria-expanded muss immer zurückgesetzt werden. `l.innerHTML = ''` entfällt, weil es das Ausblenden abschneiden würde. `inert` verhindert, dass ein Tastendruck im ausblendenden Fenster 'dash-f-apply' mit u.draft = null auslöst; gegen Klicks schützt schon `.fd-pop.closing { pointer-events: none }`. Die übrigen Teile von 168-189 bleiben: hashchange mit `() => close()`, Escape und × mit `close(true)`, Fokus nach „Anwenden“, Tab-Falle auf #fd-layer mit `#fd-pop`-Selektoren (sie übergeht das ausblendende Fenster ohne ID). barrierefreiheit-158 ist unabhängig, weil refresh bei u.open = false abbricht. responsiv-3.5 ändert in place() nur die Handy-Breite (vw − 32) und den linken Rand (16 px) und ist ebenfalls unabhängig. Die bewegung-Prüfung „40 ms nach Escape .fd-pop.closing, nach 250 ms #fd-layer leer“ bleibt erfüllt.
- [konflikt: #fd-pop] Ein gemeinsames close() in dash-filter.js. Es blendet das Fenster aus (bewegung) und setzt aria-expanded, bei ×, Escape und Anwenden geht der Fokus zurück (barrierefreiheit): function close(ret) { const u = ui(); const was = u.open; u.open = false; u.draft = null; u.pick = null; const pop = document.getElementById('fd-pop'); if (pop) { pop.removeAttribute('id'); const Mo = root.Motion; if (Mo && Mo.enabled) Mo.leave(pop, 'closing', '--dur-1', () => pop.remove()); else pop.remove(); } const b = document.querySelector('[data-action="dash-f-open"]'); if (b) { b.setAttribute('aria-expanded', 'false'); if (ret === true && was) b.focus({ preventScroll: true }); } } Dazu wie bei barrierefreiheit: hashchange → () => close(), Escape → close(true), 'dash-f-close' → close(true), 'dash-f-apply' → close(); App.rerender(); danach Fokus auf den Filter-Knopf. Das Ausblenden setzt kein #fd-layer.innerHTML = '' mehr. .fd-pop.closing (pointer-events: none) aus dem CSS-Teil von bewegung verhindert Klicks ins ausblendende Fenster. Die Tab-Falle (#fd-pop …) sieht das Fenster ohne ID nicht mehr. aria-controls="fd-pop" (C-dashboard-124) und der 16-px-Rand am Handy in place() (responsiv-3.5) sind verträglich.

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
