# Paket 055 · zustaende, dashboard, trades_tag

Schritte: 5 · Dateien: web/css/app.css, web/js/screens/trades.js, web/js/widgets.js
Betroffene Tests laut Spezifikation: web/e2e/dashtest.js:143–144 (Schritt zustaende-S-TE2); web/e2e/dashtest.js:143–144: kein .recent-card .more-link (Schritt zustaende-S-TE2)
Baut auf Paketen auf: 13, 14

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## zustaende-S-C3 · Feldfehler-Stile: .field.invalid, aria-invalid-Rand, .field-err

Gruppe zustaende · Cluster zustaende · Aufwand S · Befunde: zustaende-3, barrierefreiheit-6
Quelle: audit/spec/zustaende.md Z. 260–267 · Dateien: web/css/app.css
Abhängig von: —

```text
**S-C3 Feldfehler** – zustaende-3, barrierefreiheit-6
Nach Z. 299 (`.field .hint`) neu:
```css
.field.invalid :is(.input, .select, .sym-btn, .dir-switch), .input[aria-invalid="true"], .select[aria-invalid="true"] { border-color: var(--loss); }
:is(.input, .select)[aria-invalid="true"]:focus { border-color: var(--loss); box-shadow: 0 0 0 3px var(--loss-soft); }
.field-err { font-size: 12px; line-height: 1.35; color: var(--loss); }
```

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .input[aria-invalid="true"]] Ein Regelsatz für Feldfehler aus zustaende-S-C3, nach `.field .hint` (Z. 299), also nach der Fokusregel Z. 293. Er deckt barrierefreiheit-B11 vollständig ab, plus .select, .sym-btn und .dir-switch. Eine Änderung: Ein fehlerhaftes Feld bekommt im Fokus keinen Ring. `:is(.input, .select)[aria-invalid="true"]:focus { border-color: var(--loss); box-shadow: none; }` statt `box-shadow: 0 0 0 3px var(--loss-soft)`. Grund: barrierefreiheit Z1 (Felder im Fokus nur mit Rand, box-shadow none, box-shadow-Ringe verboten) und BRIEF (kein Schein). Die Fokusregel selbst bleibt nötig, sonst überstimmt `textarea.input:focus` (0,2,1) aus barrierefreiheit-A2b das `.input[aria-invalid="true"]` (0,2,0). `.field-err` folgt der Typografie-Skala: `font-size: var(--fs-12); line-height: var(--lh-12); color: var(--loss);` (12/16; Zeilenhöhen 1.26–1.49 werden laut typografie ersetzt; ohne Tokens 12px/16px).
- ÄNDERN: Zeile 2 → `:is(.input, .select)[aria-invalid="true"]:focus { border-color: var(--loss); box-shadow: none; }`. Zeile 3 → `.field-err { font-size: var(--fs-12); line-height: var(--lh-12); color: var(--loss); }`. Zeile 1 unverändert.
- ÜBERNIMMT barrierefreiheit-B11: `.input[aria-invalid="true"] { border-color: var(--loss); }` ist in der ersten Regel von zustaende-S-C3 enthalten, nicht doppelt anlegen.
- [konflikt: .field .hint] Am Anker selbst verträglich: Farbe `--muted` (farbe-B3a), Größe `var(--fs-12)`/`var(--lh-12)` (typografie), die neuen Fehlerregeln von S-C3 stehen danach. Ein Widerspruch steckt in S-C3: `:is(.input, .select)[aria-invalid="true"]:focus { box-shadow: 0 0 0 3px var(--loss-soft); }` ist ein Schein-Ring. Das verbieten barrierefreiheit Z1.3 (Felder im Fokus: Rand, `box-shadow: none`; Fehler: Rand --loss) und BRIEF (kein Schein). Endzustand: `:is(.input, .select)[aria-invalid="true"]:focus { border-color: var(--loss); box-shadow: none; }`. `.field-err` bekommt Token-Zeilenhöhe statt 1.35 (typografie: 1.26–1.49 werden ersetzt): `.field-err { font-size: var(--fs-12); line-height: var(--lh-12); color: var(--loss); }`.
- ÄNDERN: Zweite Regel → `:is(.input, .select)[aria-invalid="true"]:focus { border-color: var(--loss); box-shadow: none; }`; `.field-err { font-size: var(--fs-12); line-height: var(--lh-12); color: var(--loss); }`. Die Doppelung `.input[aria-invalid="true"]` mit barrierefreiheit-B11 wird unter dessen Anker entschieden.

## zustaende-S-C4 · Leerzustand-Stile: .empty b 600, .empty.chart-empty, Karten-Füllung im Widget, .tile .nodata.dash

Gruppe zustaende · Cluster zustaende · Aufwand S · Befunde: bereich_training-19, diagramme-38, bereich_dashboard-13, wording-47
Quelle: audit/spec/zustaende.md Z. 268–280 · Dateien: web/css/app.css
Abhängig von: —

```text
**S-C4 Leerzustände** – bereich_training-19, diagramme-38, bereich_dashboard-13, wording-47
- Z. 677 `.empty b { color: var(--text); font-size: 15px; }` → `.empty b { color: var(--text); font-size: 15px; font-weight: 600; }`
- Nach Z. 678 neu:
```css
.empty.chart-empty { min-height: 0; padding: 16px; gap: 6px; }
.chart > .empty.chart-empty { height: 100%; }
.chart-empty svg { width: 24px; height: 24px; }
.chart-empty .ce-t { font-size: 13px; font-weight: 500; color: var(--text-2); }
.chart-empty .small { font-size: 12px; color: var(--muted); }
```
- Nach Z. 1447 (`.w-body > .card > .chart`) neu: `.w-body > .card > .empty { flex: 1 1 auto; }` (Leerfläche füllt die Karte, Symbol in allen Karten einer Reihe auf gleicher Höhe; die Inline-`min-height` von `emptyBox` bleibt Untergrenze und schlägt `.empty.chart-empty { min-height: 0 }`).
- Nach Z. 1502 (`.tile .nodata {…}`, bleibt) neu: `.tile .nodata.dash { font-family: inherit; font-size: inherit; font-weight: 500; letter-spacing: inherit; color: var(--muted); }`

```

## zustaende-S-W2 · Kachelwert ohne Daten: „—“ mit .vh-Text (noData → .nodata.dash)

Gruppe zustaende · Cluster dashboard · Aufwand S · Befunde: wording-47, bereich_dashboard-13
Quelle: audit/spec/zustaende.md Z. 471–474 · Dateien: web/js/widgets.js
Abhängig von: zustaende-S-C4

```text
**S-W2 Kachelwert „—“** – wording-47, bereich_dashboard-13
Z. 31 `const noData = () => `<span class="nodata">${NO_DATA}</span>`;` → `const noData = () => `<span class="nodata dash"><span aria-hidden="true">—</span><span class="vh">${NO_DATA}</span></span>`;`
Z. 324–328 (Textmeldungen „Keine Regel aktiv“ usw. mit `class="nodata"`) bleiben.

```

## zustaende-S-W4 · Letzte Trades: Leertitel nach Lage, „Mehr anzeigen“ nur mit Zeilen

Gruppe zustaende · Cluster dashboard · Aufwand S · Befunde: zustaende-8, bereich_dashboard-13
Quelle: audit/spec/zustaende.md Z. 479–482 · Dateien: web/js/widgets.js
Abhängig von: zustaende-S-W1, zustaende-S-C4

```text
**S-W4 Letzte Trades** – zustaende-8, bereich_dashboard-13
- Z. 256 Leerzweig `<div class="empty recent-wrap" style="min-height:160px">${I.tradelog}<b>${tab === 'open' ? 'Keine offenen Positionen' : NO_DATA}</b></div>` → `<div class="empty chart-empty recent-wrap" style="min-height:160px">${I.tradelog}<span class="ce-t">${tab === 'open' ? 'Keine offenen Positionen' : EMPTY === 'none' ? 'Noch keine Trades' : EMPTY === 'filter' ? 'Keine Trades passen zum Filter' : 'Noch keine abgeschlossenen Trades'}</span></div>`
- Z. 257 `…${table}<div class="more-row"><a class="more-link" href="#/trades">Mehr anzeigen</a></div>`` → `…${table}${rows.length ? '<div class="more-row"><a class="more-link" href="#/trades">Mehr anzeigen</a></div>' : ''}``

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .more-row] Bindendes Ergebnis für „Letzte Trades & offene Positionen“ (widgets.js:253/257): keine Fußzeile mehr. Der Link sitzt nach dem einen App-Muster (aufbau) rechts im Kartenkopf, wie „Öffnen“ bei den Bereichs-Widgets. Z. 257 endet auf `…${table}` ohne `.more-row`, Optionen `{ info: e.info, cls: 'recent-card', trailing: d.all.length ? more('#/trades', 'Zum TradeLog') : '' }`. Beschriftung „Zum TradeLog“ (Wording-Glossar W5: „Zum/Zur + Bereich“ = Navigation aus einem Widget; Übersetzung „Go to TradeLog“ ist dort vorbereitet), also weder „Alle Trades“ noch „Mehr anzeigen“ (das bleibt fürs Nachladen reserviert). Info-Text Z. 253: „…; „Zum TradeLog“ öffnet die ganze Liste.“ Der Link erscheint nur, wenn das Widget überhaupt Trades hat (`d.all.length`). Das erfüllt W13 („mehr“-Link nur mit Inhalt) und zustaende-S-TE2 (leeres Dashboard ohne `.recent-card .more-link`). Der Kopf-Link springt aber nicht weg, wenn man auf „Offene Positionen“ ohne offene Position umschaltet (das täte die Bedingung rows.length). Regel-Tracker Z. 288 verliert den Kopf-Link (aufbau-C2a = wording 6.15, einmal umsetzen). Danach löscht aufbau-B12 `.more-row` (Z. 1658). Tests: dashtest.js:67 Meldung „Zum TradeLog“, die Prüfung `.recent-card .more-link` mit href `#/trades` bleibt. In dashtest.js:72 den Teil `&& await p.$eval('.w[data-typ="regel_tracker"] .card-head .more-link', …)` streichen, weil der Kopf-Link bewusst entfällt; die Prüfung `.tracker-foot a` → `#/progress` bleibt.
- ÄNDERN: Nur Z. 256 (Leerzweig mit .empty.chart-empty und den Leertiteln) umsetzen. Der Z.-257-Teil (.more-row nur mit Zeilen) entfällt, das übernimmt aufbau-C2a.
- [konflikt: .more-link] CSS (aufbau-B12 übernimmt): .more-link { color: var(--text-2); font-weight: 500; font-size: var(--fs-13); line-height: var(--lh-13); text-decoration: none; } .more-link:hover { color: var(--text); }. Ohne Unterstrich beim Hover, wie in der aufbau-Regel („kein Grün, kein Unterstrich“): ruhiger, und gleich wie die übrigen Kopf-Bedienelemente. .more-row wird gelöscht. Touch-Höhe 44 px aus barrierefreiheit-B12e danach, unverändert. Letzte Trades (widgets.js:253/257): Der Link steht im Kartenkopf (aufbau-C2a, U.card trailing), nicht in einer Fußzeile, und heißt „Zum TradeLog“. Das ist laut wording W5 der feste Name für „Navigation aus Widget“ und sagt das Ziel; „Alle Trades“ und „Mehr anzeigen“ fallen weg, denn „Mehr anzeigen“ heißt laut aufbau nur Nachladen. Der Link erscheint nur mit Zeilen (wording W13, zustaende): { info: e.info, cls: 'recent-card', trailing: rows.length ? more('#/trades', 'Zum TradeLog') : '' }. Info-Satz: „Die zuletzt geschlossenen Trades des Kontos und alle noch offenen Positionen. So viele Zeilen, wie in die Karte passen; „Zum TradeLog“ öffnet die ganze Liste.“ Regel-Tracker: trailing ersatzlos streichen (aufbau-C2a = wording 6.15, aufbau übernimmt). Der Leertext-Link geht auf #/settings/regeln.
- ÄNDERN: Der Teil zu Z. 257 entfällt, die Bedingung rows.length steckt im Kopf-Link von aufbau-C2a. Der Teil zu Z. 256 (Leertitel nach Lage, .empty.chart-empty) bleibt.

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
