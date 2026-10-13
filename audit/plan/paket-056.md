# Paket 056 · zustaende, dashboard

Schritte: 5 · Dateien: web/css/app.css, web/js/screens/trades.js, web/js/widgets.js
Betroffene Tests laut Spezifikation: web/e2e/dashtest.js:143–144 (Schritt zustaende-S-TE2); web/e2e/dashtest.js:143–144: kein .recent-card .more-link (Schritt zustaende-S-TE2)
Baut auf Paketen auf: 14, 19

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## komponenten-S-trades-h · Verpasst-Dialog: Prüfung „Symbol fehlt“ / „Long oder Short wählen“ vor dem Speichern

Gruppe komponenten · Cluster zustaende · Aufwand S · Befunde: bereich_trades_tag-11
Quelle: audit/spec/komponenten.md Z. 725–726 · Dateien: web/js/screens/trades.js
Abhängig von: komponenten-S-trades-g

```text
- Z. 112 (`save-missed`) vor dem Speichern: `if (!fd.get('symbol')) return U.toast('Symbol fehlt', 'err'); if (!fd.get('direction')) { const sw = form.querySelector('#f-dir'); sw.classList.remove('need'); void sw.offsetWidth; sw.classList.add('need'); return U.toast('Long oder Short wählen', 'err'); }` und `direction: Number(fd.get('direction'))`.

```

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
