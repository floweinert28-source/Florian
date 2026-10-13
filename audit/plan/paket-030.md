# Paket 030 · prop

Schritte: 6 · Dateien: web/README.md, web/css/app.css, web/js/screens/prop-friedhof.js
Betroffene Tests laut Spezifikation: —
Baut auf Paketen auf: —

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## bewegung-C6cd · Tote Übergänge im Prop-Bereich streichen (.prop-sub a::after, .prop-bar .track i)

Gruppe bewegung · Cluster prop · Aufwand S · Befunde: bewegung-40
Quelle: audit/spec/bewegung.md Z. 269–271 · Dateien: web/css/app.css
Abhängig von: —

```text
- c) Z. 2597 `.prop-sub a::after { …; transform: scaleX(0); transition: transform var(--dur-2) var(--ease); }` → nur `transition: …;` streichen. Entfällt, wenn aufbau-16 `.prop-sub` löscht (K19).
- d) Z. 2708 `.prop-bar .track i { …; transition: width var(--dur-3) var(--ease); }` → `transition: …;` streichen.

```

## bewegung-C10a · Grabstein-Drehung .pg-inner auf --ease (.75s bleibt)

Gruppe bewegung · Cluster prop · Aufwand S · Befunde: bewegung-33
Quelle: audit/spec/bewegung.md Z. 303–304 · Dateien: web/css/app.css
Abhängig von: —

```text
**C10 Grabstein und Kerzen** (bewegung-33, bereich_prop-50, bewegung-6)
- Z. 2773 `.pg-inner { … transition: transform .75s cubic-bezier(.3, .7, .2, 1); }` → `transition: transform .75s var(--ease);` (.75s bleibt, Ausnahme T1)
```

## bewegung-C10b · Kerzen (CSS): Flammen und Lichthöfe pausieren über .pg-base.off

Gruppe bewegung · Cluster prop · Aufwand S · Befunde: bereich_prop-50, bewegung-6
Quelle: audit/spec/bewegung.md Z. 305–306 · Dateien: web/css/app.css
Abhängig von: —

```text
- Nach Z. 2832 neu: `.pg-base.off .pg-candles .flame, .pg-base.off .pg-candles .halo { animation-play-state: paused; } /* außerhalb des Fensters ruhen die Flammen */`

```

## bewegung-3.9a · Friedhof: Kerzen-Definitionen einmal pro Seite (cluster als Objekt, .pg-defs in tabFriedhof)

Gruppe bewegung · Cluster prop · Aufwand M · Befunde: bereich_prop-50, bewegung-6
Quelle: audit/spec/bewegung.md Z. 333–337 · Dateien: web/js/screens/prop-friedhof.js
Abhängig von: —

```text
### 3.9 `web/js/screens/prop-friedhof.js` (bereich_prop-50, bewegung-6)
- **`cluster` Z. 105**: Rückgabe von String auf Objekt umstellen, ohne Definitionen im SVG:
  `const cluster = (cls, vw, list) => { const c = list.map((x, i) => candle(x, i, cls[0], vw)); return { svg: \`<svg class="pg-candles ${cls}" viewBox="0 0 ${vw} 80" aria-hidden="true" focusable="false"><g class="halos">${c.map(x => x.halo).join('')}</g>${c.map(x => x.wax).join('')}</svg>\`, defs: c.map(x => x.grad).join('') }; };`
- **Z. 159** `${CANDLES_L}${CANDLES_R}` → `${CANDLES_L.svg}${CANDLES_R.svg}`
- **`tabFriedhof` Z. 172** vor `<div class="grid prop-graves">` einmal einfügen: `<svg class="pg-defs" data-no-reveal width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute">${CANDLE_DEFS}<defs>${CANDLES_L.defs}${CANDLES_R.defs}</defs></svg>`. Wichtig: nicht `display:none`, sonst greifen die Verläufe nicht.
```

## bewegung-3.9b · Friedhof: IntersectionObserver setzt .off an .pg-base (mount/unmount)

Gruppe bewegung · Cluster prop · Aufwand M · Befunde: bereich_prop-50, bewegung-6
Quelle: audit/spec/bewegung.md Z. 338–339 · Dateien: web/js/screens/prop-friedhof.js
Abhängig von: bewegung-C10b

```text
- **Z. 175** `PS.register('friedhof', 'Friedhof', tabFriedhof);` → `let io = null; PS.register('friedhof', 'Friedhof', tabFriedhof, { mount(main) { if (io) io.disconnect(); io = null; if (!('IntersectionObserver' in window)) return; io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('off', !e.isIntersecting))); main.querySelectorAll('.pg-base').forEach(b => io.observe(b)); }, unmount() { if (io) { io.disconnect(); io = null; } } });` (`let io` gehört auf Modulebene über die Zeile).

```

## bewegung-3.12d · README Z. 260 (Friedhof): Flammen ruhen, solange der Sockel nicht im Bild ist

Gruppe bewegung · Cluster prop · Aufwand S · Befunde: —
Quelle: audit/spec/bewegung.md Z. 353–354 · Dateien: web/README.md
Abhängig von: bewegung-C10b, bewegung-3.9b

```text
- **Z. 260** (Friedhof) nach „weicher Flamme und Lichthof“ ergänzen: „(Flammen ruhen, solange der Sockel nicht im Bild ist)“.

```
