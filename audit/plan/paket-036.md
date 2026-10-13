# Paket 036 · responsiv

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .tile .val] Ein Rollen-Token für alle Kachelwerte, die Werte kommen aus der Typografie-Skala. In :root steht `--tile-val: var(--fv-24);`, im Block @media (max-width: 960px) `:root { --tile-val: var(--fv-20); }`; eine eigene 560er-Stufe gibt es nicht, das Handy erbt 20. Die Regel lautet `.tile .val { font-size: var(--tile-val); font-weight: 700; letter-spacing: var(--ls-val); line-height: var(--lh-val); }` ohne font-family (Onest kommt über die Sammelregel). In der Container-Notstufe (heute @container max-width 164px, die Schwelle legt der Anker „@container (max-width: 164px)“ fest) gilt `.tile .val { font-size: var(--fv-20); }`. Gelöscht werden Z. 936 (22px, ≤960) und Z. 3027 (21px, Handy). Die Skala gilt auch für die bisherigen „Bleiben“-Ausnahmen aus aufbau-A2: `.prop-balance .val` geht von 26 auf var(--fv-24), bei ≤960 von 22 auf var(--fv-20) (wie typografie-fv24/fv20). `.coach-gs-tiles .tile .val { font-size: 21px }` (Z. 2945) wird gelöscht und erbt --tile-val; schmale Coach-Kacheln fallen über die Container-Notstufe auf 20. Grund: 25, 22, 21 und 26 px liegen nicht auf der Werte-Skala (14/16/20/24/32/44), und die Typografie verbietet sie. Aufbau, Typografie und Responsiv sind sich bei 24 am Desktop und 20 am Handy einig. Streitig war nur der Tablet-Wert 22 (Aufbau). Dafür gibt es die Skalenstufe 20 „Kachelwert schmal, ≤960, Handy“.
- ÄNDERN: Entfallen: Z. 936 und Z. 3027 `.tile .val`, Z. 2742 `.prop-tiles .tile .val`, Z. 3038 `.stat-tile .v` (die Zeilen werden gelöscht, die 20 px kommen aus --tile-val). Bleiben: Z. 533 Container-Notstufe `.tile .val` → var(--fv-20), Z. 2741 `.prop-balance .val` → var(--fv-20).
- [konflikt: .stat-tile .v] Endstand: `.stat-tile .v { font-size: var(--tile-val); font-weight: 700; letter-spacing: var(--ls-val); line-height: var(--lh-val); margin-top: auto; padding-top: var(--sp-2); }` ohne font-family. Das ergibt 24 am Desktop und 20 bei ≤960 und am Handy, beides über das Token. Neu ist `@container (max-width: 175px) { .stat-tile .v { font-size: var(--fv-20); } }`. Die Handy-Regel Z. 3038 entfällt. 25 bzw. 22 px (Komponenten) gibt es nicht: „.stat-tile = .tile“ wird über dasselbe Token erreicht. mobiletest.js:27 (`20px`) bleibt gültig. Den Schriftteil schreibt aufbau-A2, margin und padding schreibt abstaende-B15.
- ÄNDERN: Entfallen: Z. 936 und Z. 3027 `.tile .val`, Z. 2742 `.prop-tiles .tile .val`, Z. 3038 `.stat-tile .v` (die Zeilen werden gelöscht, die 20 px kommen aus --tile-val). Bleiben: Z. 533 Container-Notstufe `.tile .val` → var(--fv-20), Z. 2741 `.prop-balance .val` → var(--fv-20).
- [doppelt: .prop-tiles .tile .val] Z. 2684 (24px) und Z. 2742 (20px, im 960er-Block) werden gelöscht (aufbau-A2). Die Prop-Kacheln erben var(--tile-val), also 24 bzw. 20. Die Token-Umstellung der Typografie für beide Zeilen entfällt, das Ergebnis ist dasselbe.
- ÄNDERN: Entfallen: Z. 936 und Z. 3027 `.tile .val`, Z. 2742 `.prop-tiles .tile .val`, Z. 3038 `.stat-tile .v` (die Zeilen werden gelöscht, die 20 px kommen aus --tile-val). Bleiben: Z. 533 Container-Notstufe `.tile .val` → var(--fv-20), Z. 2741 `.prop-balance .val` → var(--fv-20).

## abstaende-C6 · Tablet: Karussell-Zeilen im 960er-Block löschen; 721–960 zwei Widget-Spalten; 561–1240 fünf Kacheln als 3 + 2; vier Kacheln (.dash-top, .grid.tiles) vier Spalten bei 1000–1240 und 800–960

Gruppe abstaende · Cluster responsiv · Aufwand L · Befunde: responsiv-42, responsiv-32
Quelle: audit/spec/abstaende.md Z. 355–355 · Dateien: web/css/app.css
Abhängig von: —

```text
| C6 | Tablet und Kacheln, 960er-Block Z. 1775–1776 | Beide Zeilen (Karussell) löschen. Direkt nach dem 960er-Block (nach Z. 1797) neu: `@media (min-width: 721px) and (max-width: 960px) { .dash-main, .dash-main.editing { grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: stretch; } .dash-main > .w.sz-mittel, .dash-main > .w.sz-gross, .dash-main.editing > .w.tall.sz-mittel, .dash-main.editing > .w.tall.sz-gross, .dash-main > .skel.sz-mittel, .dash-main > .skel.sz-gross, .dash-main > .add-slot.gap.sz-mittel, .dash-main > .add-slot.gap.sz-gross { grid-column: 1 / -1 !important; } }` (die `.editing > .w.tall`-Selektoren sind nötig, weil Z. 1778 mit 0,4,0 und `!important` sonst gewinnt). Danach: `@media (min-width: 561px) and (max-width: 1240px) { .dash-top:has(> :nth-child(5):last-child) { grid-template-columns: repeat(6, minmax(0, 1fr)); } .dash-top:has(> :nth-child(5):last-child) > * { grid-column: span 2; } .dash-top:has(> :nth-child(5):last-child) > :nth-child(n + 4) { grid-column: span 3; } }` und `@media (min-width: 1000px) and (max-width: 1240px), (min-width: 800px) and (max-width: 960px) { .dash-top:has(> :nth-child(4):last-child), .grid.tiles:has(> :nth-child(4):last-child) { grid-template-columns: repeat(4, minmax(0, 1fr)); } }` | responsiv-42, responsiv-32 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .dash-top] Das Kachelraster folgt dem Anker .grid.tiles.kstrip (Block in responsiv-B6a): vier Kacheln ab 721 px in einer Reihe, darunter 2 × 2; fünf Kacheln 561–1240 px als 3 + 2, ab 1241 px in einer Reihe; Handy zwei Spalten. abstaende-C6 behält zwei Teile: die Karussell-Zeilen Z. 1775–1776 löschen und den Block 721–960 px für .dash-main. Seine Kachelblöcke entfallen, sie stehen im Block von B6a. abstaende-C2 (gap var(--grid-gap)) und barrierefreiheit-E-dashtest-15 (Testselektor button.info) sind unabhängig davon.
- ÄNDERN: Es bleiben: Z. 1775–1776 (Karussell) löschen und `@media (min-width: 721px) and (max-width: 960px) { .dash-main, .dash-main.editing { … } … }` wie spezifiziert. Es entfallen: der Block 561–1240 px für fünf Kacheln und der Block (1000–1240, 800–960) für vier Kacheln; beide stecken im Block von responsiv-B6a (vier Kacheln ab 721 px).
- [doppelt: .dash-main] Zwei Spalten bei 961–1240 px kommen aus responsiv-B6a. Dessen Selektoren `.dash-main > .w.sz-gross`, `.dash-main > .skel.sz-gross` und `.dash-main > .add-slot.gap.sz-gross` stehen nach Z. 1593 und schlagen Z. 1442/1443/1565/1593. abstaende-C5 enthält dieselbe Regel und gibt sie ab; es behält nur die Container-Regel der Score-Skala. abstaende-C6 (721–960 px, mittel und groß volle Breite, !important wegen Z. 1778) gilt für einen anderen Bereich und bleibt. Ergebnis: ab 1241 px drei Spalten, 721–1240 px zwei (mittel und groß volle Breite), bis 720 px eine. abstaende-C2 (gap und Höhen mit --grid-gap) und dashtest.js:15 sind unabhängig.
- [doppelt: .dash-main > .add-slot.gap.sz-gross] Wie beim Anker .dash-main: span 2 bei 961–1240 px kommt nur aus responsiv-B6a (nach Z. 1593, gleiche Spezifität 0,4,0 wie Z. 1593, daher die Position). Der Teil aus abstaende-C5 entfällt. Volle Breite bei 721–960 px (`grid-column: 1 / -1 !important`) bleibt in abstaende-C6.
- [konflikt: .kstrip] Siehe Anker .grid.tiles.kstrip: Leisten mit vier Kacheln stehen ab 721 px in einer Reihe (die .grid.tiles-Regel aus C6 gilt auch für Leisten, jetzt ab 721 statt 1000/800); fünf Kacheln stehen 561–1240 px als 3 + 2, sechs ab 561 px als 3 × 2. Z. 2738 (`1fr 1fr`) gilt danach nur noch für andere Kachelzahlen und am Handy. Beide Schritte geben ihre Kachelregeln an responsiv-B6a ab (Anweisungen dort).
