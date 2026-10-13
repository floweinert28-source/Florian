# Paket 053 · zustaende

Schritte: 7 · Dateien: web/README.md, web/css/app.css, web/js/screens/dash-filter.js, web/js/widgets.js
Betroffene Tests laut Spezifikation: Akzeptanz 4.3 leer_shadow, leer_progress; e2e/coachtest.js:50, :197 (.coach-wrap .empty b); e2e/dashtest.js:143; e2e/friedhoftest.js:22; e2e/proptest.js:20
Baut auf Paketen auf: 2, 10

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## farbe-B20 · Ladelinie .ld in --text-2 ohne drop-shadow

Gruppe farbe · Cluster zustaende · Aufwand S · Befunde: bewegung-44
Quelle: audit/spec/farbe.md Z. 319–322 · Dateien: web/css/app.css
Abhängig von: —

```text
**B20 – Ladelinie, Z. 1522 und 1527** — bewegung-44
- `.ld { …; color: var(--accent); … }` → `color: var(--text-2);`
- `.ld .ld-line { …; filter: drop-shadow(0 0 3px var(--accent-soft)); }` → `filter` streichen

```

## farbe-C18 · Dashboard-Filter: „Nichts gefunden“ in muted

Gruppe farbe · Cluster zustaende · Aufwand S · Befunde: barrierefreiheit-25, farbe_kontrast-11
Quelle: audit/spec/farbe.md Z. 467–468 · Dateien: web/js/screens/dash-filter.js
Abhängig von: —

```text
**C18 – `web/js/screens/dash-filter.js` Z. 95 und Z. 183:** `<div class="small faint" style="padding:8px 10px">Nichts gefunden` → `class="small muted"` — barrierefreiheit-25, farbe_kontrast-11

```

## farbe-D3g · README Z. 340: Ladelinie „helles Stück“

Gruppe farbe · Cluster zustaende · Aufwand S · Befunde: bewegung-44
Quelle: audit/spec/farbe.md Z. 572–574 · Dateien: web/README.md
Abhängig von: farbe-B20

```text
- Z. 340: „über die ein grünes Stück gleitet“ → „über die ein helles Stück gleitet“ — bewegung-44

---
```

## typografie-3.2.4h · Leer-Titel .empty b auf 600

Gruppe typografie · Cluster zustaende · Aufwand S · Befunde: bereich_training-33
Quelle: audit/spec/typografie.md Z. 343–343 · Dateien: web/css/app.css
Abhängig von: —

```text
| `.empty b` (677) | `font-weight: 600;` ergänzen | bereich_training-33 |
```

## abstaende-C13 · Lade-Skelett an Seitenebene und Seitenleiste angleichen: .boot-body, .boot-tiles, .boot-main, .boot-sb

Gruppe abstaende · Cluster zustaende · Aufwand S · Befunde: abstaende_layout-32, abstaende_layout-7
Quelle: audit/spec/abstaende.md Z. 362–363 · Dateien: web/css/app.css
Abhängig von: abstaende-A1, abstaende-D1

```text
| C13 | Skelett Z. 1540–1548 | `.boot-body` `padding: 22px var(--gutter) 60px; … gap: 18px;` → `padding: var(--sp-6) var(--gutter) 60px; … gap: var(--grid-gap);`. `.boot-tiles` und `.boot-main` `gap: 18px` → `var(--grid-gap)`. `.boot-sb` `padding: 6px 10px` → `padding: 22px 10px 6px` (die Leiste hat oben kein Polster mehr, D1). | abstaende_layout-32, abstaende_layout-7 |

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .boot-sb] Das Seitenleisten-Skelett gehört allein zu S-C19/S-H2. Der `.boot-sb`-Teil von C13 (`padding: 22px 10px 6px`) entfällt. Die übrigen C13-Teile (`.boot-body`, `.boot-tiles`, `.boot-main`) bleiben. S-C19 ist auf die heutige Leiste (oben 22 px Polster, Marke 4/18) gerechnet. Nach abstaende-D1 hat die Leiste oben kein Polster mehr, die Marke ist 72 px hoch, und die Linie liegt bei y = 71 über die volle Breite. Nach typografie-3.2.3n sind die Einträge 38 px hoch. Verbindlicher Endstand (ersetzt Z. 1548–1552):
`.boot-sb { display: flex; flex-direction: column; gap: 0; padding: 0 16px; height: 100%; }`
`.boot-sb .skel { border: 0; border-radius: 6px; height: 14px; width: var(--w, 62%); margin: 12px 0 15px; } /* 38-px-Zeile + 3 px wie .nav – Maße gemeinsam mit .nav a pflegen */`
`.boot-sb .skel.l { height: 19px; width: 54%; margin: 16px 0 6px; }`
`.boot-sb .skel.l2 { height: 12px; width: 60%; margin: 0 0 18px; }` (Linie bei y = 71)
`.boot-sb .sep { display: block; flex: 0 0 auto; height: 1px; background: var(--border); margin: 0 -30px 14px; }` (volle Breite wie `.sb-sep` aus D1)
`.boot-sb .skel.g { height: 10px; width: 34%; margin: 33px 0 7px; } .boot-sb .skel.g.first { margin-top: 7px; }`
`.boot-sb .skel.card { margin: auto 0 0; height: 59px; width: 100%; border-radius: 14px; }`
Dichte-Stufen wie die Leiste: `@media (min-width: 961px) and (max-height: 1060px) { .boot-sb .skel { margin: 10px 0 13px; } .boot-sb .skel.g { margin: 23px 0 5px; } }` und `@media (min-width: 961px) and (max-height: 940px) { .boot-sb .skel { margin: 9px 0 12px; } .boot-sb .skel.g { margin-top: 19px; } }`.
Eingeklappt (Einträge fest 40 px, Raster 43): `html.sb-mini .boot-sb { padding: 0; align-items: center; } html.sb-mini .boot-sb .skel { width: 40px; margin: 13px 0 16px; } html.sb-mini .boot-sb .skel.l { width: 30px; height: 30px; border-radius: 9px; margin: 21px 0 20px; } html.sb-mini .boot-sb .skel.l2 { display: none; } html.sb-mini .boot-sb .skel.g { height: 1px; width: 40px; } html.sb-mini .boot-sb .sep { align-self: stretch; width: auto; margin: 0 -10px 14px; } html.sb-mini .boot-sb .skel.card { width: 40px; height: 40px; border-radius: 50%; }`.
In S-H2 werden die Zeilenbreiten über `style="--w:52%"` gesetzt statt `style="width:52%"`. Ein Inline-`width` schlägt jede Klassenregel, sonst greift die eingeklappte Breite von 40 px nie (das gilt schon heute für die 24-px-Regel). Abnahme: Marke, Linie und erste Gruppe weichen bei 1440×1000 und 1440×900, voll und eingeklappt, höchstens ±2 px von der fertigen Leiste ab.
- ÄNDERN: Nur `.boot-body` (padding var(--sp-6) var(--gutter) 60px, gap var(--grid-gap)), `.boot-tiles` und `.boot-main` (gap var(--grid-gap)) umsetzen. Den Teil `.boot-sb` `padding: 22px 10px 6px` weglassen, `.boot-sb` schreibt S-C19 neu.

## abstaende-G1 · Gesamt-Score-Leerzustand mit emptyBox(280) (gleiche Höhe in der Reihe)

Gruppe abstaende · Cluster zustaende · Aufwand S · Befunde: zustaende-9
Quelle: audit/spec/abstaende.md Z. 400–404 · Dateien: web/js/widgets.js
Abhängig von: —

```text
### web/js/widgets.js

| Nr. | Stelle | vorher → nachher | Befunde |
|---|---|---|---|
| G1 | Gesamt-Score Z. 227 | `if (d.empty) return card(e, emptyBox());` → `card(e, emptyBox(280))` | zustaende-9 |
```

## komponenten-C11 · Leerzustand: Symbol und Titel nur als direkte Kinder, Abstand zur Aktion

Gruppe komponenten · Cluster zustaende · Aufwand S · Befunde: zustaende-1, bereich_trades_tag-2, bereich_prop-42, bereich_training-31, zustaende-14
Quelle: audit/spec/komponenten.md Z. 260–264 · Dateien: web/css/app.css
Abhängig von: —

```text
**C11 – Leerzustand** (zustaende-1, bereich_trades_tag-2, bereich_prop-42, bereich_training-31, zustaende-14)
- Z. 676 `.empty svg { width: 34px; height: 34px; color: var(--faint); }` → `.empty > svg { width: 34px; height: 34px; color: var(--faint); }`
- Z. 677 `.empty b { color: var(--text); font-size: 15px; }` → `.empty > b { color: var(--text); font-size: 15px; }`
- Nach Z. 678 neu: `.empty > .btn, .empty > .row { margin-top: 8px; }`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .empty > svg] Z. 676 wird einmal geändert, durch komponenten-C11: `.empty > svg { width: 34px; height: 34px; color: var(--faint); }`, dazu `.empty > b { color: var(--text); font-size: 15px; }` und neu `.empty > .btn, .empty > .row { margin-top: 8px; }`. Die Werte sind gleich wie in farbe-B12, und Symbole in Knöpfen des Leerzustands bleiben 16 px.
- ÜBERNIMMT farbe-B12: Dieselbe Änderung an Z. 676 macht komponenten-C11.
- [doppelt: .empty svg] Wie beim Anker .empty > svg: komponenten-C11 ersetzt `.empty svg` (Z. 676) durch `.empty > svg` mit unveränderten Werten. farbe-B12 entfällt.
- ÜBERNIMMT farbe-B12: Dieselbe Änderung an Z. 676 macht komponenten-C11.
