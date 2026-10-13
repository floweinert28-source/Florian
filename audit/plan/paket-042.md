# Paket 042 · responsiv, komponenten, trades_tag

Schritte: 4 · Dateien: web/css/app.css, web/js/app.js
Betroffene Tests laut Spezifikation: neue Suite web/e2e/tablettest.js (Schritt responsiv-3.20c); web/e2e/affiliatetest.js (.kstrip); web/e2e/dashtest.js; web/e2e/fwtest.js; web/e2e/gaptest.js; web/e2e/headtest.js:19-32 (Menüs im Bild); web/e2e/mobiletest.js:74-76; web/e2e/rangetest.js (mob: ein Monat); web/e2e/shadowtest.js:37-41 (Verstöße seitenweise); web/e2e/tlfittest.js (1440×900, 1280×720, 1100×800 unverändert grün); web/e2e/tlfittest.js (muss grün bleiben); web/e2e/tlfittest.js (nur Desktop, muss grün bleiben); web/e2e/usercardtest.js:21, :58 (#pop-user)
Baut auf Paketen auf: 7, 41

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## responsiv-3.3b · App.fitPopover: RangePicker.fit-Aufruf und 16-px-Randabstand am Handy

Gruppe responsiv · Cluster komponenten · Aufwand S · Befunde: bereich_dashboard-27, responsiv-24
Quelle: audit/spec/responsiv.md Z. 430–431 · Dateien: web/js/app.js
Abhängig von: responsiv-3.4, responsiv-B4

```text
- Z. 161 `fitPopover(pop)`: als erste Zeile `if (pop.id === 'pop-range' && root.RangePicker && root.RangePicker.fit) root.RangePicker.fit(pop); /* ein sichtbarer Monat: bei einer Vorgabe den aktuellen zeigen */` (bereich_dashboard-27)
- Z. 169: `const over = r.right - (right - 8); … Math.max(0, r.left - left - 8)` → davor `const m = window.innerWidth <= 560 ? 16 : 8; /* Handy: 16px Abstand wie der Seitenrand */` und beide `8` durch `m` ersetzen (responsiv-24).
```

## responsiv-B5d · Unter 961 px keine eigene Scrollbox für TradeLog/Verstöße

Gruppe responsiv · Cluster responsiv · Aufwand S · Befunde: responsiv-3
Quelle: audit/spec/responsiv.md Z. 290–291 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 1754 `@media (max-width: 960px) { .pager { … } .pager .pg-sep { display: none; } }` → in diesem Block ergänzen: `.tbl-wrap.paged .tbl-scroll { max-height: none; overscroll-behavior: auto; } /* unter 961px keine Scrollbox in der scrollenden Seite */` (steht nach Z. 1740 und gewinnt).

```

## responsiv-B6a · Kachelreihen ab 961 px (4 in einer Reihe, 5 als 3 + 2 bis 1240 px) und Dashboard-Raster zweispaltig 961–1240 px

Gruppe responsiv · Cluster responsiv · Aufwand M · Befunde: abstaende_layout-15, abstaende_layout-16, bereich_prop-13, bereich_trades_tag-32
Quelle: audit/spec/responsiv.md Z. 292–310 · Dateien: web/css/app.css
Abhängig von: —

```text
**B6 Kachelreihen und Dashboard-Raster** (abstaende_layout-15, abstaende_layout-16, bereich_prop-13, bereich_trades_tag-32, responsiv-2)
- Z. 1773 `@media (max-width: 1240px) { .dash-top { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); } }` ersetzen durch:
  ```css
  /* Kachelreihen ab 961px: bis vier Kacheln in einer Reihe (Dashboard: Grundregel repeat(--n)) */
  @media (min-width: 961px) {
    .grid.tiles.kstrip:has(> :nth-child(4):last-child) { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .grid.tiles.kstrip:has(> :nth-child(5):last-child) { grid-template-columns: repeat(5, minmax(0, 1fr)); }
    .tl-fit > .grid.tiles { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  }
  /* 961–1240px: fünf Kacheln als 3 + 2, Dashboard-Raster mit zwei Spalten */
  @media (min-width: 961px) and (max-width: 1240px) {
    .dash-top:has(> :nth-child(5):last-child), .grid.tiles.kstrip:has(> :nth-child(5):last-child) { grid-template-columns: repeat(6, minmax(0, 1fr)); }
    .dash-top:has(> :nth-child(5):last-child) > *, .grid.tiles.kstrip:has(> :nth-child(5):last-child) > * { grid-column: span 2; }
    .dash-top:has(> :nth-child(5):last-child) > :nth-child(n + 4), .grid.tiles.kstrip:has(> :nth-child(5):last-child) > :nth-child(n + 4) { grid-column: span 3; }
    .dash-main { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .dash-main > .w.sz-gross, .dash-main > .skel.sz-gross, .dash-main > .add-slot.gap.sz-gross { grid-column: span 2; }
  }
  ```
  (Steht nach Z. 1593, gewinnt gegen `.add-slot.gap.sz-gross`.)
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .grid.tiles.kstrip] Eine Regelgruppe für alle Kachelreihen. responsiv-B6a setzt sie an die Stelle von Z. 1773, also nach Z. 1593, damit gleich spezifische Regeln gewinnen: `@media (min-width: 721px) { .dash-top:has(> :nth-child(4):last-child), .grid.tiles:has(> :nth-child(4):last-child) { grid-template-columns: repeat(4, minmax(0, 1fr)); } } @media (max-width: 720px) { .dash-top:has(> :nth-child(4):last-child), .grid.tiles:has(> :nth-child(4):last-child) { grid-template-columns: repeat(2, minmax(0, 1fr)); } } @media (min-width: 561px) { .grid.tiles.kstrip:has(> :nth-child(6):last-child) { grid-template-columns: repeat(3, minmax(0, 1fr)); } } @media (min-width: 1241px) { .grid.tiles.kstrip:has(> :nth-child(5):last-child) { grid-template-columns: repeat(5, minmax(0, 1fr)); } } @media (min-width: 561px) and (max-width: 1240px) { .dash-top:has(> :nth-child(5):last-child), .grid.tiles.kstrip:has(> :nth-child(5):last-child) { grid-template-columns: repeat(6, minmax(0, 1fr)); } .dash-top:has(> :nth-child(5):last-child) > *, .grid.tiles.kstrip:has(> :nth-child(5):last-child) > * { grid-column: span 2; } .dash-top:has(> :nth-child(5):last-child) > :nth-child(n + 4), .grid.tiles.kstrip:has(> :nth-child(5):last-child) > :nth-child(n + 4) { grid-column: span 3; } } @media (min-width: 961px) { .tl-fit > .grid.tiles { grid-template-columns: repeat(4, minmax(0, 1fr)); } } @media (min-width: 961px) and (max-width: 1240px) { .dash-main { grid-template-columns: repeat(2, minmax(0, 1fr)); } .dash-main > .w.sz-gross, .dash-main > .skel.sz-gross, .dash-main > .add-slot.gap.sz-gross { grid-column: span 2; } }`. Begründung: abstaende-C6 (vier Kacheln nur 1000–1240 und 800–960) widerspricht responsiv-B6a und aufbau-B11 (vier Kacheln ab 961) bei 961–999 und 800–960. Responsiv K7 belegt, dass 156–186 px breite Kacheln mit den vorhandenen Container-Abfragen funktionieren. Bei 721 px ist eine Kachel so breit wie bei 961 px mit offener Seitenleiste (≈160 px). 720 ist ein vorhandener Grenzwert, es entstehen keine neuen Grenzen bei 800 oder 1000 (Responsiv-Stufen). Fünf Kacheln stehen von 561 bis 1240 px einheitlich als 3 + 2, auf dem Dashboard und in den Leisten; Leisten standen unter 961 px bisher als 2 + 2 + 1. Sechs Kacheln (Statistik → Tage, aufbau-C14d) stehen ab 561 px als 3 × 2. Am Handy (≤ 560 px) bleiben zwei Spalten mit voller letzter Kachel bei ungerader Zahl (Z. 2738/2740, abstaende-C7); die Spezifität der neuen Regeln (0,4,0 bis 0,6,0) schlägt Z. 2601, 2738, 2740 und den ≤960-Block. responsiv-B6b (TradeLog ≤960 als 2 × 2) wirkt damit nur noch bis 720 px. Die Prüfungen „#/affiliate 1024 px: 4 Kacheln gleiche Oberkante“ (aufbau) und „768 × 1024 ohne seitliches Scrollen“ (abstaende) bleiben erfüllt.
- ÄNDERN: Z. 1773 durch genau den Block aus der Entscheidung ersetzen, einschließlich der .dash-main-Regeln für 961–1240 px und der 6er-Regel ab 561 px. Die Ergänzungen B6b, B6c und B6d bleiben unverändert.
- ÜBERNIMMT aufbau-B11: Die 4er-Regel ist doppelt. Die 6er-Regel steht im Block von responsiv-B6a und gilt ab 561 px statt ab 961 px. Kein eigener Block nach Z. 2604.
- [konflikt: .dash-top] Das Kachelraster folgt dem Anker .grid.tiles.kstrip (Block in responsiv-B6a): vier Kacheln ab 721 px in einer Reihe, darunter 2 × 2; fünf Kacheln 561–1240 px als 3 + 2, ab 1241 px in einer Reihe; Handy zwei Spalten. abstaende-C6 behält zwei Teile: die Karussell-Zeilen Z. 1775–1776 löschen und den Block 721–960 px für .dash-main. Seine Kachelblöcke entfallen, sie stehen im Block von B6a. abstaende-C2 (gap var(--grid-gap)) und barrierefreiheit-E-dashtest-15 (Testselektor button.info) sind unabhängig davon.
- [doppelt: .dash-main] Zwei Spalten bei 961–1240 px kommen aus responsiv-B6a. Dessen Selektoren `.dash-main > .w.sz-gross`, `.dash-main > .skel.sz-gross` und `.dash-main > .add-slot.gap.sz-gross` stehen nach Z. 1593 und schlagen Z. 1442/1443/1565/1593. abstaende-C5 enthält dieselbe Regel und gibt sie ab; es behält nur die Container-Regel der Score-Skala. abstaende-C6 (721–960 px, mittel und groß volle Breite, !important wegen Z. 1778) gilt für einen anderen Bereich und bleibt. Ergebnis: ab 1241 px drei Spalten, 721–1240 px zwei (mittel und groß volle Breite), bis 720 px eine. abstaende-C2 (gap und Höhen mit --grid-gap) und dashtest.js:15 sind unabhängig.
- [doppelt: .dash-main > .add-slot.gap.sz-gross] Wie beim Anker .dash-main: span 2 bei 961–1240 px kommt nur aus responsiv-B6a (nach Z. 1593, gleiche Spezifität 0,4,0 wie Z. 1593, daher die Position). Der Teil aus abstaende-C5 entfällt. Volle Breite bei 721–960 px (`grid-column: 1 / -1 !important`) bleibt in abstaende-C6.

## responsiv-B6c · TradeLog-Tabellenbox am Desktop mindestens 256 px hoch

Gruppe responsiv · Cluster trades_tag · Aufwand S · Befunde: responsiv-2
Quelle: audit/spec/responsiv.md Z. 312–312 · Dateien: web/css/app.css
Abhängig von: responsiv-B6a

```text
- Im Block `@media (min-width: 961px)` (Z. 957–970) nach Z. 968 ergänzen: `.tl-fit > .tbl-wrap.paged { min-height: 256px; } /* mind. drei Zeilen; sonst scrollt die Seite */`
```
