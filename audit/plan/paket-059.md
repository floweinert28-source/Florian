# Paket 059 · barrierefreiheit

Schritte: 10 · Dateien: web/css/app.css, web/css/landing.css, web/js/screens/progress.js, web/js/ui.js
Betroffene Tests laut Spezifikation: Sonde 13
Baut auf Paketen auf: 3

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## farbe-C11 · Landing: Hero-Überschrift in var(--text) statt #ededed

Gruppe farbe · Cluster barrierefreiheit · Aufwand S · Befunde: ki_look-2
Quelle: audit/spec/farbe.md Z. 428–429 · Dateien: web/css/landing.css
Abhängig von: —

```text
**C11 – `web/css/landing.css` Z. 14:** `.lp .hero h1 { …; color: #ededed; }` → `color: var(--text);` — ki_look-2

```

## aufbau-A4a · CSS für Kartentitel als h2 (.card-title letter-spacing/text-wrap)

Gruppe aufbau · Cluster barrierefreiheit · Aufwand S · Befunde: barrierefreiheit-41
Quelle: audit/spec/aufbau.md Z. 278–279 · Dateien: web/css/app.css
Abhängig von: —

```text
**A4 Überschriften-Treppe** · barrierefreiheit-41, typografie-7, typografie-8, hierarchie-33, bereich_konto-20, bereich_notebook_news-44, bereich_prop-7, typografie-18, typografie-32
- Z. 491 `.card-title { display: flex; …; font-size: 15px; }` → am Ende ergänzen `letter-spacing: normal; text-wrap: wrap;` (hebt Z. 90 für das neue `h2` auf)
```

## aufbau-B8 · U.card: Kartentitel als <h2 class="card-title">

Gruppe aufbau · Cluster barrierefreiheit · Aufwand S · Befunde: barrierefreiheit-41
Quelle: audit/spec/aufbau.md Z. 360–362 · Dateien: web/js/ui.js
Abhängig von: aufbau-A4a

```text
**B8 Kartentitel als Überschrift** (`web/js/ui.js` Z. 170, `card`) · barrierefreiheit-41
`<div class="card-title">…</div>` → `<h2 class="card-title">…</h2>` (CSS siehe A4). Die von Hand geschriebenen `div.card-title` (coach.js:101, replay.js:23) bleiben.

```

## diagramme-C7 · nameChart: role=img und aria-label (data-label oder Kartentitel) nach jedem Zeichnen

Gruppe diagramme · Cluster barrierefreiheit · Aufwand S · Befunde: barrierefreiheit-19
Quelle: audit/spec/diagramme.md Z. 395–403 · Dateien: web/js/ui.js
Abhängig von: —

```text
**C7 Name für Screenreader** (barrierefreiheit-19)
- Z. 232 in `drawCharts`: direkt nach `drawers[k] && drawers[k](el, data, W, H);` `nameChart(el);` aufrufen.
- neue Funktion nach `drawCharts`:
  ```js
  /* Name für Screenreader: data-label am .chart oder der Kartentitel (beim Zeichnen schon übersetzt); ohne Namen ausgeblendet */
  function nameChart(el) { const svg = el.querySelector('svg'); if (!svg) return; const card = el.closest('.card'), head = card && card.querySelector('.card-title'); const t = el.dataset.label || (head ? head.textContent.trim() : ''); if (t) { svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', t); } else svg.setAttribute('aria-hidden', 'true'); }
  ```
  `drawCharts` schreibt das SVG bei jeder Größenänderung neu, deshalb wird der Name nach jedem Zeichnen gesetzt. Zur Erweiterung durch bereich_statistik-33 siehe K21.

```

## diagramme-H2 · Heatmap-Container role=img aria-label „Trading-Aktivität“

Gruppe diagramme · Cluster barrierefreiheit · Aufwand S · Befunde: barrierefreiheit-19
Quelle: audit/spec/diagramme.md Z. 636–637 · Dateien: web/js/screens/progress.js
Abhängig von: —

```text
**H2 Heatmap-Name** (barrierefreiheit-19) Z. 29: `<div class="activity" data-keep-scroll …>` → `<div class="activity" role="img" aria-label="Trading-Aktivität" data-keep-scroll …>`

```

## barrierefreiheit-A2a · Globale Fokusregel und Shell-Fokusringe auf --focus (app.css Z. 95, 206, 235)

Gruppe barrierefreiheit · Cluster barrierefreiheit · Aufwand S · Befunde: farbe_kontrast-14
Quelle: audit/spec/barrierefreiheit.md Z. 258–264 · Dateien: web/css/app.css
Abhängig von: barrierefreiheit-A1

```text
**A2 Alle Fokusregeln auf `--focus`**

| Zeile | vorher | nachher | Befunde |
|---|---|---|---|
| 95 | `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }` | `… var(--focus) …` | farbe_kontrast-14 |
| 206 | `.theme-toggle button:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }` | `var(--focus)` | farbe_kontrast-14 |
| 235 | `.sb-user:focus-visible { outline: 2px solid var(--accent); … }` | `var(--focus)` | farbe_kontrast-14 |
```

## barrierefreiheit-A2b · Fokus an Eingabefeldern, Schalter, Datums- und Farbwähler neutral (Z. 293, 314–315, 437, 447, 451)

Gruppe barrierefreiheit · Cluster barrierefreiheit · Aufwand S · Befunde: farbe_kontrast-14, farbe_kontrast-13, barrierefreiheit-21
Quelle: audit/spec/barrierefreiheit.md Z. 265–269 · Dateien: web/css/app.css
Abhängig von: barrierefreiheit-A1

```text
| 293 | `.input:focus, .select:focus, textarea.input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }` | `{ outline: none; border-color: var(--text-2); box-shadow: none; }` | farbe_kontrast-14 |
| 314–315 | `.switch:focus-visible { outline: none; box-shadow: …accent-soft }` und `.switch[aria-checked="true"]:focus-visible {…}` | **beide Zeilen löschen** (der globale Ring greift, pillenförmig über `border-radius: 999px`) | farbe_kontrast-13, barrierefreiheit-21 |
| 437 | `.dp button:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }` | `var(--focus)` | farbe_kontrast-14 |
| 447 | `.cp-sv:focus-visible .cp-knob, .cp-hue:focus-visible .cp-knob { transform: …scale(1.15); box-shadow: 0 0 0 2.5px #fff, 0 0 0 5px var(--accent-soft), … }` | `.cp-sv:focus-visible, .cp-hue:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; } .cp-sv:focus-visible .cp-knob, .cp-hue:focus-visible .cp-knob { transform: translate(-50%, -50%) scale(1.15); }` (Knopf-Schatten aus Z. 445 bleibt) | farbe_kontrast-14 (gleiches Muster wie -13) |
| 451 | `.cp-hex:focus-within { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }` | `{ border-color: var(--text-2); box-shadow: none; }` | farbe_kontrast-14 |
```

## barrierefreiheit-A2c · Fokus an Schieberegler (Offset 6px), Richtungs- und Symbol-Option (Z. 814, 864, 885)

Gruppe barrierefreiheit · Cluster barrierefreiheit · Aufwand S · Befunde: barrierefreiheit-22, farbe_kontrast-14, barrierefreiheit-23
Quelle: audit/spec/barrierefreiheit.md Z. 270–272 · Dateien: web/css/app.css
Abhängig von: barrierefreiheit-A1

```text
| 814 | `.slider input[type=range]:focus-visible { box-shadow: 0 0 0 3px var(--accent-soft); }` | `{ outline: 2px solid var(--focus); outline-offset: 6px; box-shadow: none; }` (`outline: none` in Z. 811 bleibt für die Maus) | barrierefreiheit-22 |
| 864 | `.dir-opt:focus-visible { outline: 2px solid var(--dir-c); outline-offset: -2px; }` | `var(--focus)` | farbe_kontrast-14 |
| 885 | `.sym-opt:hover, .sym-opt:focus-visible { background: var(--surface-2); outline: none; }` | `.sym-opt:hover { background: var(--surface-2); } .sym-opt:focus-visible { background: var(--surface-2); outline: 2px solid var(--focus); outline-offset: -2px; }` | barrierefreiheit-23 |
```

## barrierefreiheit-A2d · Restliche Fokusregeln: Notiz-Details, Theme-Karte, Zahlenfeld, Prop/Coupon/Affiliate (Z. 1186–1187, 1842, 2411, 2516–2679); .rp bleibt unverändert

Gruppe barrierefreiheit · Cluster barrierefreiheit · Aufwand S · Befunde: bereich_notebook_news-35, farbe_kontrast-14
Quelle: audit/spec/barrierefreiheit.md Z. 273–278 · Dateien: web/css/app.css
Abhängig von: barrierefreiheit-A1

```text
| 1186–1187 | `.nb-details summary { …; outline: none; }` · `.nb-details summary:focus { color: var(--accent); }` | 1186 bleibt; 1187 → `.nb-details summary:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; border-radius: 4px; }` | bereich_notebook_news-35 |
| 1842 | `.theme-card:focus-visible { outline: none; } .theme-card:focus-visible .tc-prev { box-shadow: …, 0 0 0 5px var(--accent); }` | `.theme-card:focus-visible { outline-offset: 4px; border-radius: 16px; }` (Umriss um die ganze Karte, Z1.5) | farbe_kontrast-14 |
| 2411 | `.sr-num:focus-within { border-color: var(--accent); }` | `var(--text-2)` | farbe_kontrast-14 |
| 2516, 2592, 2620, 2653, 2675, 2679 | `outline: 2px solid var(--accent)` | `outline: 2px solid var(--focus)` (Offsets bleiben) | farbe_kontrast-14 |
| 2144, 2232, 2240 (`.rp`) | – | **unverändert** (Blind-Replay, Feature-Flag aus) | – |

```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .nb-details summary:focus] Z. 1187 wird genau einmal ersetzt, durch barrierefreiheit-A2d: `.nb-details summary:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; border-radius: 4px; }`. Damit fällt die grüne Fokus-Schrift weg, und der neutrale Fokusring gilt wie überall. Z. 1186 behält `outline: none`, die :focus-visible-Regel setzt sich darüber durch. Das Gewicht 600 kommt aus typografie-3.2.4e.
- [konflikt: .prop-sub a:focus-visible] Am Ende gibt es eine einzige Fokusregel: `.subtabs > button:focus-visible, .set-tabs > button:focus-visible, .prop-sub a:focus-visible { outline-offset: -2px; }` (aus komponenten-C20). Ring 2px var(--focus) aus der globalen Regel. Die alte Z. 2592 löscht komponenten-C19 vollständig. Grund: barrierefreiheit Z1 („nur der Versatz weicht ab“, −2px in Scroll-Leisten), kein Grün als Fokus (BRIEF).
- ÄNDERN: Z. 2592 aus der Tabelle nehmen. komponenten-C19/C20 ersetzen die Zeile, und die Farbe kommt aus der globalen :focus-visible-Regel. Die Zeilen 2516, 2620, 2653, 2675, 2679 und die übrigen A2d-Punkte bleiben.
- [konflikt: .prop-tabs a:focus-visible] `.tabs > button:focus-visible, .tabs > a:focus-visible, .prop-tabs a:focus-visible { outline-offset: -2px; }` aus komponenten-C19, ohne eigene Farbe. Der Ring kommt global (2px var(--focus) nach barrierefreiheit-A1). Gleiche Begründung wie bei .prop-sub a:focus-visible.
- ÄNDERN: Z. 2592 nicht anfassen (siehe .prop-sub a:focus-visible).

## barrierefreiheit-B1 · Klasse .vh-m (nur optisch versteckt am Handy) im 960-px-Block

Gruppe barrierefreiheit · Cluster barrierefreiheit · Aufwand S · Befunde: bereich_konto-11
Quelle: audit/spec/barrierefreiheit.md Z. 279–286 · Dateien: web/css/app.css
Abhängig von: —

```text
### Phase B – Komponenten

#### `web/css/app.css`

**B1 Nur-optisch-versteckt am Handy** (im Block `@media (max-width: 960px)` Z. 1062–1072, nach `.hide-m`)
- nachher: `.vh-m { position: absolute !important; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }`
- Befunde: bereich_konto-11

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .hide-m] Endzustand des Prop-Kopfknopfs (prop.js:294): `<button type="button" class="btn" data-action="prop-account-new">${I.plus}<span>Prop-Konto anlegen</span></button>`. Der Text steht auf allen Breiten, ohne hide-m oder vh-m und ohne aria-label. Grund für den Wortlaut: Das Wording-Glossar ist für Texte maßgeblich („Prop-Konto“ immer mit Präfix, Knopf = Objekt + Verb, „anlegen“ für neue Datensätze) und hat Vorrang vor „Konto anlegen“ aus Komponenten. Er ist derselbe wie im Leerzustand (prop.js:82) und in widgets.js:354. Grund für die Form: Barrierefreiheit und Komponenten wollen den Text auf allen Breiten sichtbar haben. Damit ist das aria-label überflüssig (Barrierefreiheit Z8: aria-label nur ohne sichtbaren Text). In Wording 4.2 entfällt die Pflichtprüfung `aria-label="Prop-Konto anlegen"` ≥ 1, die Prüfung `Prop-Konto anlegen` ≥ 3 bleibt. Die übrigen hide-m-Schritte (B1, Coach, Notebook „Teilen“) sind verträglich, B1 muss aber zuerst die Klasse .vh-m anlegen.
