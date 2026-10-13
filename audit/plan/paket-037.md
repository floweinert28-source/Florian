# Paket 037 · responsiv, dashboard

Schritte: 9 · Dateien: web/README.md, web/css/app.css, web/e2e/mobiletest.js, web/e2e/rangetest.js
Betroffene Tests laut Spezifikation: e2e/mobiletest.js:16, :40, :50, :85 (.dash-head .tl); e2e/rangetest.js:18; web/e2e/dashtest.js:151; web/e2e/mobiletest.js:19-20 (müssen grün bleiben); web/e2e/mobiletest.js:72; web/e2e/mobiletest.js:72 (354 → 360, Schritt R2); web/e2e/settest.js:65 (kein Überlauf am Handy)
Baut auf Paketen auf: 2, 4, 9, 12, 32, 36

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## abstaende-S2 · README Z. 67: Dashboard-Raster 721–1240 zwei Spalten, darunter eine

Gruppe abstaende · Cluster dashboard · Aufwand S · Befunde: responsiv-10, responsiv-42
Quelle: audit/spec/abstaende.md Z. 531–531 · Dateien: web/README.md
Abhängig von: abstaende-C5, abstaende-C6

```text
| S2 | Z. 67 | „unten ein 3-Spalten-Raster“ → „unten ein 3-Spalten-Raster (721–1240 px zwei Spalten, darunter eine)“ | responsiv-10, responsiv-42 |
```

## abstaende-C7 · Handy-Block: ungerade letzte Kachel über volle Breite; .stat-tiles gap var(--sp-3); .stat-tile und .kstrip .tile padding var(--sp-4) var(--sp-3) (kstrip-Regel aus 960er- in 560er-Block)

Gruppe abstaende · Cluster responsiv · Aufwand S · Befunde: responsiv-31, abstaende_layout-31
Quelle: audit/spec/abstaende.md Z. 356–356 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
| C7 | Handy-Block Z. 3025–3038 | Nach Z. 3026: `.dash-top > .w:last-child:nth-child(odd), .dash-top > .add-slot:last-child:nth-child(odd) { grid-column: span 2; }`. Z. 3036 `.stat-tiles { …; gap: 10px; }` → `gap: var(--sp-3)`. Z. 3037 `.stat-tile { padding: 14px; }` → `padding: var(--sp-4) var(--sp-3)`. Z. 2739 (960er-Block Prop) `.kstrip .tile { padding: 14px 16px; }` → in den 560er-Block verschieben als `.kstrip .tile { padding: var(--sp-4) var(--sp-3); }` | responsiv-31, abstaende_layout-31 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .stat-tile] Endstand: `.stat-tile { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: var(--sp-4) var(--sp-5); display: flex; flex-direction: column; container-type: inline-size; min-width: 0; transition: border-color var(--dur-1) var(--ease); }`, ohne :hover (siehe .tile:hover). Am Handy (≤560) `.stat-tile { padding: var(--sp-4) var(--sp-3); }` (abstaende-C7). Im hellen Design derselbe Schatten wie .tile (komponenten-C25a). Grund: .tile bekommt durch abstaende-B7 dieselben 16/20 px; damit ist „.stat-tile = .tile“ (Komponenten) erfüllt, 12/15 px war nur der alte .tile-Wert. abstaende-B15 schreibt padding und flex, responsiv-B7 nur container-type, zustaende-S-C5 die Transition.
- [doppelt: .dash-top > :last-child:nth-child(odd) (Handy, gefunden in abstaende-C7 und responsiv-C1)] Beide Schritte fügen im 560er-Block nach Z. 3026 eine Regel ein, damit die ungerade letzte Kachel die volle Breite bekommt. Es wird nur eine geschrieben: `.dash-top > :last-child:nth-child(odd) { grid-column: 1 / -1; }` (responsiv-C1). Sie erfasst auch das Start-Skelett (.skel), dessen fünfte Kachel laut Responsiv-Spezifikation volle Breite hat. Die Fassung von abstaende-C7 gilt nur für .w und .add-slot und entfällt.
- ÄNDERN: Die Zeile `.dash-top > .w:last-child:nth-child(odd), .dash-top > .add-slot:last-child:nth-child(odd) { grid-column: span 2; }` entfällt (responsiv-C1). Der Rest bleibt: .stat-tiles gap var(--sp-3), .stat-tile padding var(--sp-4) var(--sp-3), .kstrip .tile aus dem 960er- in den 560er-Block.

## abstaende-D9 · Einstellungen am Handy (560er-Block): .set-item einspaltig, .set-block .form-grid einspaltig, .be-grid Einheit oben + Von|Bis, Einheitenfelder volle Breite

Gruppe abstaende · Cluster responsiv · Aufwand S · Befunde: bereich_einstellungen-13, bereich_einstellungen-27, bereich_einstellungen-25, responsiv-45
Quelle: audit/spec/abstaende.md Z. 376–376 · Dateien: web/css/app.css
Abhängig von: abstaende-B26, abstaende-B27

```text
| D9 | Einstellungen Handy (560er-Block) | Neu: `.set-item { grid-template-columns: 1fr; } .set-block .form-grid { grid-template-columns: 1fr; } .be-grid { grid-template-columns: 1fr 1fr; } .be-grid > .field:first-child { grid-column: 1 / -1; } .set-block .input-unit .input { width: 100%; }` | bereich_einstellungen-13, -27, -25, responsiv-45 |
```

## abstaende-D10 · Handy-Kartenhöhe „Letzte Trades“: calc(280px + 74px) → calc(280px + 80px)

Gruppe abstaende · Cluster responsiv · Aufwand S · Befunde: abstaende_layout-31
Quelle: audit/spec/abstaende.md Z. 377–378 · Dateien: web/css/app.css
Abhängig von: abstaende-B1, abstaende-B4

```text
| D10 | Mobile-Kartenhöhe „Letzte Trades“ Z. 1780 | `height: calc(280px + 74px)` → `height: calc(280px + 80px)` (Kopf 21,75 + 16 + Polster 40 + Rand 2). Kommentar bleibt. | abstaende_layout-31 (Folge) |

```

## abstaende-R2 · mobiletest: Kartenhöhe „Letzte Trades“ 354 → 360 (Wert und Text)

Gruppe abstaende · Cluster responsiv · Aufwand S · Befunde: abstaende_layout-31
Quelle: audit/spec/abstaende.md Z. 521–521 · Dateien: web/e2e/mobiletest.js
Abhängig von: abstaende-D10

```text
| R2 | `web/e2e/mobiletest.js:72` | `dd.cardH === 354` → `dd.cardH === 360`, Text „(354px)“ → „(360px)“ | abstaende_layout-31 (Folge) |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: .recent-card] Die Kartenhöhe am Handy ist fest (app.css:1780, nach abstaende-D10 360 px). Fußzeile weg (aufbau-C2a) und Unterstrich-Reiter statt Schiene (komponenten-W4) ändern aber den Platz für die Tabellenzeilen. abstaende-R2 (mobiletest.js:72) wird deshalb erst nach C2a und W4 angepasst und gemessen. Der Wert 360 bleibt, die Zeilengrenze wird mitgeprüft.
- ÄNDERN: Nach aufbau-C2a und komponenten-W4 laufen lassen. `dd.cardH === 360` und „(360px)“ wie spezifiziert. Ohne Fußzeile (≈30 px) passt etwa eine Zeile mehr. Misst mobiletest dann 7 sichtbare Zeilen, `dd.rows <= 6` → `dd.rows <= 7` setzen, sonst unverändert lassen.

## abstaende-S3 · README Z. 73: Handy-Kacheln (ungerade letzte voll, Tablet 3 + 2 ohne Karussell)

Gruppe abstaende · Cluster responsiv · Aufwand S · Befunde: responsiv-31, responsiv-42
Quelle: audit/spec/abstaende.md Z. 532–532 · Dateien: web/README.md
Abhängig von: abstaende-C6, abstaende-C7

```text
| S3 | Z. 73 | nach „Handy: Kacheln in zwei Spalten“ ergänzen: „(eine ungerade letzte Kachel über die volle Breite; Tablet 3 + 2 ohne Karussell)“ | responsiv-31, responsiv-42 |
```

## komponenten-C35 · Runder „Trade loggen“-Knopf am Handy mit neutralem Schatten

Gruppe komponenten · Cluster responsiv · Aufwand S · Befunde: responsiv-17
Quelle: audit/spec/komponenten.md Z. 478–488 · Dateien: web/css/app.css
Abhängig von: komponenten-C08

```text
**C35 – Runder „Trade loggen“-Knopf am Handy** (responsiv-17)
- Z. 3019 `.dash-head .tl { … background: var(--accent); color: var(--accent-ink); border-color: var(--accent); box-shadow: 0 14px 30px -8px var(--accent-glow), 0 6px 18px rgba(0, 0, 0, .35); }` → `background`, `color`, `border-color` und `box-shadow` streichen (Lage, 54×54, Radius bleiben).
- Z. 3020 (`.dash-head .tl:hover { background: var(--accent); }`) löschen.
- Ans Dateiende (hinter Z. 3144) neu:
```css
@media (max-width: 560px) {
  .dash-head .btn.accent.tl { width: 54px; height: 54px; box-shadow: inset 0 1px 0 rgba(255, 255, 255, .04), 0 6px 18px rgba(0, 0, 0, .35); }
  :root[data-theme="light"] .dash-head .btn.accent.tl { box-shadow: inset 0 1px 0 rgba(255, 255, 255, .7), 0 6px 16px rgba(0, 0, 0, .14); }
}
```

```

## komponenten-E1d · e2e rangetest.js: nur den sichtbaren Vormonat-Pfeil klicken

Gruppe komponenten · Cluster responsiv · Aufwand S · Befunde: responsiv-23
Quelle: audit/spec/komponenten.md Z. 760–760 · Dateien: web/e2e/rangetest.js
Abhängig von: komponenten-D2

```text
- rangetest.js:18: `'#pop-range [data-rr="prev"]'` → `'#pop-range [data-rr="prev"]:visible'`.
```

## aufbau-B2 · Handy: Kopfreihe nur mit rundem Knopf ohne Höhe

Gruppe aufbau · Cluster responsiv · Aufwand S · Befunde: bereich_konto-37, responsiv-19
Quelle: audit/spec/aufbau.md Z. 317–321 · Dateien: web/css/app.css
Abhängig von: aufbau-B1

```text
**B2 Kopfreihe am Handy ohne leeren Streifen** (`web/css/app.css`, Block ab Z. 2978, direkt nach Z. 3002 `.dash-head .dh-sep { display: none; }`) · bereich_konto-37, responsiv-19
```css
.page-head:not(:has(> .dh-context)):has(> .dh-tools > .tl:only-child) { min-height: 0; padding-bottom: 0; }
```

```
