# Paket 044 · responsiv, komponenten, trades_tag

Schritte: 4 · Dateien: web/css/app.css, web/js/app.js
Betroffene Tests laut Spezifikation: neue Suite web/e2e/tablettest.js (Schritt responsiv-3.20c); web/e2e/affiliatetest.js (.kstrip); web/e2e/dashtest.js; web/e2e/fwtest.js; web/e2e/gaptest.js; web/e2e/headtest.js:19-32 (Menüs im Bild); web/e2e/mobiletest.js:74-76; web/e2e/rangetest.js (mob: ein Monat); web/e2e/shadowtest.js:37-41 (Verstöße seitenweise); web/e2e/tlfittest.js (1440×900, 1280×720, 1100×800 unverändert grün); web/e2e/tlfittest.js (muss grün bleiben); web/e2e/tlfittest.js (nur Desktop, muss grün bleiben); web/e2e/usercardtest.js:21, :58 (#pop-user)
Baut auf Paketen auf: 7, 43

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

## responsiv-B6c · TradeLog-Tabellenbox am Desktop mindestens 256 px hoch

Gruppe responsiv · Cluster trades_tag · Aufwand S · Befunde: responsiv-2
Quelle: audit/spec/responsiv.md Z. 312–312 · Dateien: web/css/app.css
Abhängig von: responsiv-B6a

```text
- Im Block `@media (min-width: 961px)` (Z. 957–970) nach Z. 968 ergänzen: `.tl-fit > .tbl-wrap.paged { min-height: 256px; } /* mind. drei Zeilen; sonst scrollt die Seite */`
```
