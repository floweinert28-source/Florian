# Paket 057 · zustaende, trades_tag, notebook_news

Schritte: 4 · Dateien: web/css/app.css, web/js/screens/news.js, web/js/screens/trades.js
Betroffene Tests laut Spezifikation: —
Baut auf Paketen auf: 56

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

## zustaende-S-C12 · Mentor-Fehlerzeile .mentor-err in Warn-Optik statt Rot

Gruppe zustaende · Cluster zustaende · Aufwand S · Befunde: zustaende-18
Quelle: audit/spec/zustaende.md Z. 338–340 · Dateien: web/css/app.css
Abhängig von: —

```text
**S-C12 Mentor-Fehlerzeile in Warn-Optik** – zustaende-18
Z. 2359 `.mentor-err { …; background: var(--loss-soft); color: var(--loss); … }` → `background: var(--warn-soft); border: 1px solid var(--warn); color: var(--text);`

```

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

## zustaende-S-NW2 · News: Skelett beim Laden statt Ring/Text

Gruppe zustaende · Cluster notebook_news · Aufwand S · Befunde: zustaende-17, bereich_notebook_news-38
Quelle: audit/spec/zustaende.md Z. 804–806 · Dateien: web/js/screens/news.js
Abhängig von: zustaende-S-C13

```text
**S-NW2 Skelett beim Laden** – zustaende-17, bereich_notebook_news-38
Z. 87 → `else if (ok && !s.events) body = `<div class="nw-skel" role="status" aria-label="Termine werden geladen"><div class="skel" style="height:78px"></div>${[2, 2, 1].map(n => `<div class="skel" style="height:${44 + n * 44}px"></div>`).join('')}</div>`;`

```
