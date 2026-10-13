# Paket 038 · responsiv

Schritte: 2 · Dateien: web/css/app.css
Betroffene Tests laut Spezifikation: Akzeptanz 4.3 prop bei 1024 (vier Kacheln „+12.316,00 €“ passen); web/e2e/dashtest.js:151 (Handy zwei Spalten, kein Karussell); web/e2e/mobiletest.js:19-20 und 85-86 (Kachelraster, müssen grün bleiben); web/e2e/mobiletest.js:26–27 (.stat-tile .v bleibt 20px)
Baut auf Paketen auf: 1

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## typografie-3.2.3-fv20 · Werte-Skala --fv-20 (Kachelwerte in schmalen Containern, ≤960 px und am Handy)

Gruppe typografie · Cluster responsiv · Aufwand S · Befunde: typografie-3
Quelle: audit/spec/typografie.md Z. 300–304 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
**→ `--fv-20`**
- 22 → 20: Z. 533 `.tile .val` (`@container` ≤ 164 px), Z. 936 `.tile .val` (≤ 960), Z. 2741 `.prop-balance .val` (Handy)
- 21 → 20: Z. 3027 `.tile .val` (Handy)
- schon 20 → Token: 2742 `.prop-tiles .tile .val`, 3038 `.stat-tile .v`

```

## abstaende-C6 · Tablet: Karussell-Zeilen im 960er-Block löschen; 721–960 zwei Widget-Spalten; 561–1240 fünf Kacheln als 3 + 2; vier Kacheln (.dash-top, .grid.tiles) vier Spalten bei 1000–1240 und 800–960

Gruppe abstaende · Cluster responsiv · Aufwand L · Befunde: responsiv-42, responsiv-32
Quelle: audit/spec/abstaende.md Z. 355–355 · Dateien: web/css/app.css
Abhängig von: —

```text
| C6 | Tablet und Kacheln, 960er-Block Z. 1775–1776 | Beide Zeilen (Karussell) löschen. Direkt nach dem 960er-Block (nach Z. 1797) neu: `@media (min-width: 721px) and (max-width: 960px) { .dash-main, .dash-main.editing { grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: stretch; } .dash-main > .w.sz-mittel, .dash-main > .w.sz-gross, .dash-main.editing > .w.tall.sz-mittel, .dash-main.editing > .w.tall.sz-gross, .dash-main > .skel.sz-mittel, .dash-main > .skel.sz-gross, .dash-main > .add-slot.gap.sz-mittel, .dash-main > .add-slot.gap.sz-gross { grid-column: 1 / -1 !important; } }` (die `.editing > .w.tall`-Selektoren sind nötig, weil Z. 1778 mit 0,4,0 und `!important` sonst gewinnt). Danach: `@media (min-width: 561px) and (max-width: 1240px) { .dash-top:has(> :nth-child(5):last-child) { grid-template-columns: repeat(6, minmax(0, 1fr)); } .dash-top:has(> :nth-child(5):last-child) > * { grid-column: span 2; } .dash-top:has(> :nth-child(5):last-child) > :nth-child(n + 4) { grid-column: span 3; } }` und `@media (min-width: 1000px) and (max-width: 1240px), (min-width: 800px) and (max-width: 960px) { .dash-top:has(> :nth-child(4):last-child), .grid.tiles:has(> :nth-child(4):last-child) { grid-template-columns: repeat(4, minmax(0, 1fr)); } }` | responsiv-42, responsiv-32 |
```
