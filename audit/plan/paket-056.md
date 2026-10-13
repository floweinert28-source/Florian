# Paket 056 · zustaende, trades_tag, notebook_news

Schritte: 4 · Dateien: web/css/app.css, web/js/screens/news.js, web/js/screens/trades.js
Betroffene Tests laut Spezifikation: —
Baut auf Paketen auf: 2, 55

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## zustaende-S-T1 · TradeLog-Kacheln folgen Suche und Filter, Zähler „{n} abgeschlossen“, leerer Wert „—“

Gruppe zustaende · Cluster trades_tag · Aufwand M · Befunde: zustaende-27, wording-47
Quelle: audit/spec/zustaende.md Z. 634–641 · Dateien: web/js/screens/trades.js
Abhängig von: zustaende-S-C4

```text
### 3.11 `web/js/screens/trades.js`

**S-T1 Kacheln folgen dem Filter** – zustaende-27
- Z. 23 `const view = …; const list = ctx.inRange; const s = C.summary(list);` → `const view = …; const list = ctx.inRange; const base = view === 'trades' ? filtered(list) : list; const s = C.summary(base);`
- Z. 24 `const d = W.data(ctx, App);` → `const d = W.data(Object.assign({}, ctx, { inRange: base }), App);`
- Z. 26 Info-Text → `'Summe aller abgeschlossenen Trades im Zeitraum, bei aktiver Suche oder aktivem Filter nur der gefilterten. Daneben der Verlauf je Handelstag.'`; `${s.n} Trades` → `${s.n} abgeschlossen`; `'<span class="nodata">Noch keine Daten</span>'` → `'<span class="nodata dash"><span aria-hidden="true">—</span><span class="vh">Noch keine Daten</span></span>'` (wording-47).
- `renderTable`, `renderDays`, `renderMissed` bekommen weiter `list`.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: C.summary] zustaende-S-T1 gilt für render() in trades.js. `const base = view === 'trades' ? filtered(list) : list; const s = C.summary(base);` und `W.data(Object.assign({}, ctx, { inRange: base }), App)`. Zähler in der Netto-Kachel `${s.n} abgeschlossen`, ohne „Gefiltert ·“-Präfix. Dazu der Info-Text aus S-T1 und der leere Wert als `.nodata.dash` („—“ + .vh „Noch keine Daten“). renderTable/renderDays/renderMissed bekommen weiter `list`. Grund: C.summary zählt nur abgeschlossene Trades. „{n} abgeschlossen“ ist deshalb wahr und unterscheidet sich vom „x von y Trades“ der Filterzeile, das auch offene Trades zählt. Der Filterzustand steht direkt darunter in der Filterzeile („x von y Trades“, „Zurücksetzen“). „Gefiltert · 1 Trades“ wäre außerdem grammatisch falsch und in schmalen Kacheln (961–1240 px) zu lang. komponenten-S-trades-d betrifft nur renderDays (C.summary(d.trades) für Tageskarten) und ist verträglich.
- ÜBERNIMMT aufbau-C15b: Nicht separat umsetzen. Die Filter-Logik und den Zähler setzt zustaende-S-T1. Glossarzeilen aufbau.md Z. 160 und Z. 655 („Gefiltert · {0} Trades“) entfallen. Prüfpunkt Z. 744 wird zu: Suche „NQ“, `.spark-tile .n` lautet „{n} abgeschlossen“, und der Netto-Wert ist die Summe der sichtbaren geschlossenen Trades.
- [doppelt: W.data] Ein Aufruf `W.data(Object.assign({}, ctx, { inRange: base }), App)` aus zustaende-S-T1 (siehe C.summary).
- ÜBERNIMMT aufbau-C15b: W.data-Änderung übernimmt zustaende-S-T1.

## zustaende-S-C12 · Mentor-Fehlerzeile .mentor-err in Warn-Optik statt Rot

Gruppe zustaende · Cluster zustaende · Aufwand S · Befunde: zustaende-18
Quelle: audit/spec/zustaende.md Z. 338–340 · Dateien: web/css/app.css
Abhängig von: —

```text
**S-C12 Mentor-Fehlerzeile in Warn-Optik** – zustaende-18
Z. 2359 `.mentor-err { …; background: var(--loss-soft); color: var(--loss); … }` → `background: var(--warn-soft); border: 1px solid var(--warn); color: var(--text);`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: --loss-soft] Einziger Konflikt ist der 3-px-Ring in --loss-soft am fokussierten ungültigen Feld (zustaende-S-C3); er entfällt, entschieden unter Anker --loss. Die Tokenwerte (farbe-A2 hell .10, farbe-A3c theme.js .10/.14) und die Mentor-Fehlerzeile ohne --loss-soft (zustaende-S-C12) sind verträglich.

## zustaende-S-C13 · Laden: tote .spin-Regel löschen, .coach-loading/.nw-loading durch Skelett-Stile .coach-skel/.nw-skel ersetzen

Gruppe zustaende · Cluster zustaende · Aufwand S · Befunde: zustaende-17, bereich_notebook_news-38, bewegung-13
Quelle: audit/spec/zustaende.md Z. 341–345 · Dateien: web/css/app.css
Abhängig von: —

```text
**S-C13 Laden: Skelette statt Ring/Kurslinie** – zustaende-17, bereich_notebook_news-38, bewegung-13
- Z. 1559 `.spin { animation-duration: 2.4s; }` löschen.
- Z. 2856 `.coach-loading {…}` → `.coach-skel { display: flex; flex-direction: column; gap: 8px; } .coach-skel .skel { height: 40px; border-radius: 10px; }`
- Z. 3108 `.nw-loading {…}` → `.nw-skel { display: flex; flex-direction: column; gap: 14px; } .nw-skel .skel { border-radius: 14px; }`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .spin] Z. 1559 wird ersetzt, nicht gelöscht. Im reduced-motion-Block steht dann `.spin { animation: spin-turn 2.4s linear infinite !important; }` (bewegung-B11). Begründung: Bewegungs-Regel R1 sagt „alles aus, nur .spin dreht, 2,4 s“. Der Ring steht laut Zustände Z5 nur noch in Knöpfen neben „Wird … …“ und zeigt, dass gerade gearbeitet wird. Die heutige Regel ist tot, weil `* { animation: none !important }` sie schlägt. B11 macht sie wirksam, statt sie zu streichen. Die Skelett-Teile von zustaende-S-C13 (.coach-skel, .nw-skel) bleiben.
- [konflikt: .nw-loading] Beim Laden zeigt News ein Skelett statt Ring und Text (BRIEF: Skelett, kein Ladesymbol). zustaende-S-C13 ersetzt .nw-loading durch .nw-skel, zustaende-S-NW2 stellt news.js:87 im selben Schritt um. typografie-3.2.3l setzt in Z. 3108 kein Token. Die Abstände des Skeletts folgen der Liste, damit nach dem Laden nichts springt: .nw-skel { display: flex; flex-direction: column; gap: var(--sp-4); } (wie .nw-list, Raster 16 laut abstaende), .coach-skel { …; gap: var(--sp-2); }.
- VERBINDLICH (Kreuzprüfung): web/css/app.css:
- Z. 1559 `.spin { animation-duration: 2.4s; }` hier NICHT löschen; bewegung-B11 ersetzt sie im reduced-motion-Block durch `.spin { animation: spin-turn 2.4s linear infinite !important; }`.
- Z. 2856 `.coach-loading {…}` → `.coach-skel { display: flex; flex-direction: column; gap: var(--sp-2); } .coach-skel .skel { height: 40px; border-radius: 10px; }`.
- Z. 3108 `.nw-loading {…}` → `.nw-skel { display: flex; flex-direction: column; gap: var(--sp-4); } .nw-skel .skel { border-radius: 14px; }` (Abstand wie .nw-list, damit nach dem Laden nichts springt).
news.js:87 stellt zustaende-S-NW2 im selben Durchgang auf das Skelett um. typografie-3.2.3l setzt in Z. 3108 kein Token.

## zustaende-S-NW2 · News: Skelett beim Laden statt Ring/Text

Gruppe zustaende · Cluster notebook_news · Aufwand S · Befunde: zustaende-17, bereich_notebook_news-38
Quelle: audit/spec/zustaende.md Z. 804–806 · Dateien: web/js/screens/news.js
Abhängig von: zustaende-S-C13

```text
**S-NW2 Skelett beim Laden** – zustaende-17, bereich_notebook_news-38
Z. 87 → `else if (ok && !s.events) body = `<div class="nw-skel" role="status" aria-label="Termine werden geladen"><div class="skel" style="height:78px"></div>${[2, 2, 1].map(n => `<div class="skel" style="height:${44 + n * 44}px"></div>`).join('')}</div>`;`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .nw-loading] Beim Laden zeigt News ein Skelett statt Ring und Text (BRIEF: Skelett, kein Ladesymbol). zustaende-S-C13 ersetzt .nw-loading durch .nw-skel, zustaende-S-NW2 stellt news.js:87 im selben Schritt um. typografie-3.2.3l setzt in Z. 3108 kein Token. Die Abstände des Skeletts folgen der Liste, damit nach dem Laden nichts springt: .nw-skel { display: flex; flex-direction: column; gap: var(--sp-4); } (wie .nw-list, Raster 16 laut abstaende), .coach-skel { …; gap: var(--sp-2); }.
