# Paket 055 · zustaende, dashboard, einstellungen

Schritte: 5 · Dateien: web/css/app.css, web/js/screens/misc.js, web/js/widgets.js
Betroffene Tests laut Spezifikation: web/e2e/dashtest.js:143–144 (Schritt zustaende-S-TE2); web/e2e/dashtest.js:143–144: kein .recent-card .more-link (Schritt zustaende-S-TE2)
Baut auf Paketen auf: 12, 13, 53

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## komponenten-S-misc-i · Logs: Papierkorb neutral, Leerzustände statt leerer Tabellen, Suche „Verlauf durchsuchen“

Gruppe komponenten · Cluster einstellungen · Aufwand M · Befunde: bereich_einstellungen-40
Quelle: audit/spec/komponenten.md Z. 679–679 · Dateien: web/js/screens/misc.js
Abhängig von: komponenten-C11

```text
- Logs (bereich_einstellungen-40): Z. 255 am Import-Papierkorb `style="color:var(--loss)"` entfernen. Wenn `imps.length === 0`: statt Tabelle `<div class="tbl-wrap"><div class="empty" style="min-height:140px">${I.upload}<b>Noch keine Imports</b><span class="small">CSV-Importe und eingespielte Sicherungen erscheinen hier.</span></div></div>`. Z. 260: wenn `(S.data.logs || []).length === 0` dasselbe Muster mit `${I.clock}`, „Noch kein Verlauf“ und dem bisherigen Untertext; liefern nur Suche/Filter keine Treffer, bleibt die Tabelle und die Leerzeile sagt „Keine Einträge gefunden“. Z. 259 Platzhalter „Typ suchen“ → „Verlauf durchsuchen“.
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .empty] Leerzustände entstehen nur über U.empty bzw. U.chartEmpty, ohne Inline-Stile; das ist die Komponenten-Regel und Leerzustand A der Gruppe Zustände. Im Reiter Verlauf (Importe/Änderungen) zeigt ein leerer Reiter deshalb U.empty wie der TradeLog (min-height 180 aus .empty). Ein handgeschriebenes `.empty` mit `min-height:140px` in einer `.tbl-wrap`-Hülle entfällt. Der Knopf in komponenten-S-trades-b ist neutral (siehe .btn.accent). zustaende-S-C4 ergänzt nur Stile und ist verträglich.
- ÄNDERN: Leerzweige als `${U.empty('upload', 'Noch keine Importe', 'CSV-Importe und importierte Sicherungen erscheinen hier.')}` bzw. `${U.empty('clock', 'Noch keine Änderungen', <bisheriger Satz>)}` direkt statt der Tabelle. Keine `.tbl-wrap`-Hülle, kein `style="min-height:140px"`; die Texte kommen aus wording-S17.23-17.27. Ohne jeden Eintrag fehlt im Reiter Änderungen auch die Such-/Filterzeile. Nur wenn Suche oder Filter nichts findet, bleibt die Tabelle mit der Zeile „Keine Einträge gefunden“. Papierkorb ohne Inline-Farbe und Platzhalter „Verlauf durchsuchen“ wie spezifiziert.
- [doppelt: .tbl-wrap] `.tbl-wrap inset` an prop.js Z. 264/268 setzt abstaende-M5 (Eigentümer der inset-Regel); komponenten-S-prop-e ist identisch. Logs: siehe Anker .empty. „Tags auf Standard zurücksetzen“ steht unter der Tabelle, ohne Inline-Stile: Abstand über die Hilfsklasse `mt-3` (12 px, Abstandsskala; 10 px liegt nicht auf der Skala), Farbe von `.btn.ghost` (siehe Anker --muted).

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
- ÜBERNIMMT barrierefreiheit-B11: `.input[aria-invalid="true"] { border-color: var(--loss); }` ist in der ersten Regel von zustaende-S-C3 enthalten, nicht doppelt anlegen.
- [doppelt: --loss] Feldfehler werden einmal definiert, in zustaende-S-C3; das schließt `.input[aria-invalid="true"]` aus barrierefreiheit-B11 ein. Ohne Ring: Die Fokus-Regel für ungültige Felder hält nur den roten Rand. barrierefreiheit Z1 verbietet box-shadow-Ringe, und BRIEF will keinen Schein. Endzustand: `.field.invalid :is(.input, .select, .sym-btn, .dir-switch), .input[aria-invalid="true"], .select[aria-invalid="true"] { border-color: var(--loss); } :is(.input, .select)[aria-invalid="true"]:focus { border-color: var(--loss); } .field-err { font-size: var(--fs-12); line-height: var(--lh-12); color: var(--loss); }`. Damit ist auch der --loss-soft-Ring aus dem Anker --loss-soft erledigt.
- ÜBERNIMMT barrierefreiheit-B11: `.input[aria-invalid="true"] { border-color: var(--loss); }` steht in der Selektorliste von S-C3.
- [konflikt: --loss-soft] Einziger Konflikt ist der 3-px-Ring in --loss-soft am fokussierten ungültigen Feld (zustaende-S-C3); er entfällt, entschieden unter Anker --loss. Die Tokenwerte (farbe-A2 hell .10, farbe-A3c theme.js .10/.14) und die Mentor-Fehlerzeile ohne --loss-soft (zustaende-S-C12) sind verträglich.
- [konflikt: .field .hint] Am Anker selbst verträglich: Farbe `--muted` (farbe-B3a), Größe `var(--fs-12)`/`var(--lh-12)` (typografie), die neuen Fehlerregeln von S-C3 stehen danach. Ein Widerspruch steckt in S-C3: `:is(.input, .select)[aria-invalid="true"]:focus { box-shadow: 0 0 0 3px var(--loss-soft); }` ist ein Schein-Ring. Das verbieten barrierefreiheit Z1.3 (Felder im Fokus: Rand, `box-shadow: none`; Fehler: Rand --loss) und BRIEF (kein Schein). Endzustand: `:is(.input, .select)[aria-invalid="true"]:focus { border-color: var(--loss); box-shadow: none; }`. `.field-err` bekommt Token-Zeilenhöhe statt 1.35 (typografie: 1.26–1.49 werden ersetzt): `.field-err { font-size: var(--fs-12); line-height: var(--lh-12); color: var(--loss); }`.
- VERBINDLICH (Kreuzprüfung): web/css/app.css, nach Z. 299 (`.field .hint`, also nach der Fokusregel Z. 293) neu:
`.field.invalid :is(.input, .select, .sym-btn, .dir-switch), .input[aria-invalid="true"], .select[aria-invalid="true"] { border-color: var(--loss); }`
`:is(.input, .select)[aria-invalid="true"]:focus { border-color: var(--loss); box-shadow: none; }`
`.field-err { font-size: var(--fs-12); line-height: var(--lh-12); color: var(--loss); }`
Kein --loss-soft-Ring. Diese Regeln decken barrierefreiheit-B11 (`.input[aria-invalid="true"]`) vollständig mit ab; dort keine zweite Regel.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .empty] Leerzustände entstehen nur über U.empty bzw. U.chartEmpty, ohne Inline-Stile; das ist die Komponenten-Regel und Leerzustand A der Gruppe Zustände. Im Reiter Verlauf (Importe/Änderungen) zeigt ein leerer Reiter deshalb U.empty wie der TradeLog (min-height 180 aus .empty). Ein handgeschriebenes `.empty` mit `min-height:140px` in einer `.tbl-wrap`-Hülle entfällt. Der Knopf in komponenten-S-trades-b ist neutral (siehe .btn.accent). zustaende-S-C4 ergänzt nur Stile und ist verträglich.
- [doppelt: .empty b] Endzustand: `.empty > b { color: var(--text); font-size: var(--fs-15); line-height: var(--lh-15); font-weight: 600; }`. komponenten-C11 setzt den Kind-Selektor (`.empty > b`, `.empty > svg`). typografie-3.2.3s setzt Token und 600 in einem Zug. typografie-3.2.4h und der Z.-677-Teil von zustaende-S-C4 wären dieselbe 600.
- ÄNDERN: Der Teil zu Z. 677 (`.empty b … font-weight: 600`) entfällt. Die neuen Regeln (.empty.chart-empty, .chart > .empty.chart-empty, .chart-empty svg/.ce-t/.small, .w-body > .card > .empty, .tile .nodata.dash) bleiben.
- [konflikt: .tile .nodata] typografie-3.2.3s gibt `.tile .nodata` font-size var(--fs-15) und line-height var(--lh-15); --lh-15 ist das einheitenlose Verhältnis 20/15. `.tile .nodata.dash` aus zustaende-S-C4 erbt die Wertgröße (font-size: inherit, 24 px) und bekäme damit eine 32-px-Zeile statt 26,4. Kacheln mit „—“ würden höher als ihre Nachbarn, entgegen „Werte je Reihe ±1 px“. Deshalb erbt .nodata.dash auch die Zeilenhöhe.
- ÄNDERN: In der neuen Regel `.tile .nodata.dash { … }` zusätzlich `line-height: inherit;` setzen.

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
- [konflikt: .more-link] CSS (aufbau-B12 übernimmt): .more-link { color: var(--text-2); font-weight: 500; font-size: var(--fs-13); line-height: var(--lh-13); text-decoration: none; } .more-link:hover { color: var(--text); }. Ohne Unterstrich beim Hover, wie in der aufbau-Regel („kein Grün, kein Unterstrich“): ruhiger, und gleich wie die übrigen Kopf-Bedienelemente. .more-row wird gelöscht. Touch-Höhe 44 px aus barrierefreiheit-B12e danach, unverändert. Letzte Trades (widgets.js:253/257): Der Link steht im Kartenkopf (aufbau-C2a, U.card trailing), nicht in einer Fußzeile, und heißt „Zum TradeLog“. Das ist laut wording W5 der feste Name für „Navigation aus Widget“ und sagt das Ziel; „Alle Trades“ und „Mehr anzeigen“ fallen weg, denn „Mehr anzeigen“ heißt laut aufbau nur Nachladen. Der Link erscheint nur mit Zeilen (wording W13, zustaende): { info: e.info, cls: 'recent-card', trailing: rows.length ? more('#/trades', 'Zum TradeLog') : '' }. Info-Satz: „Die zuletzt geschlossenen Trades des Kontos und alle noch offenen Positionen. So viele Zeilen, wie in die Karte passen; „Zum TradeLog“ öffnet die ganze Liste.“ Regel-Tracker: trailing ersatzlos streichen (aufbau-C2a = wording 6.15, aufbau übernimmt). Der Leertext-Link geht auf #/settings/regeln.
- VERBINDLICH (Kreuzprüfung): web/js/widgets.js, nur Z. 256 (Leerzweig „Letzte Trades“), nach zustaende-S-W1 und S-C4: `<div class="empty recent-wrap" style="min-height:160px">${I.tradelog}<b>${tab === 'open' ? 'Keine offenen Positionen' : NO_DATA}</b></div>` → `<div class="empty chart-empty recent-wrap" style="min-height:160px">${I.tradelog}<span class="ce-t">${tab === 'open' ? 'Keine offenen Positionen' : EMPTY === 'none' ? 'Noch keine Trades' : EMPTY === 'filter' ? 'Keine Trades passen zum Filter' : 'Noch keine abgeschlossenen Trades'}</span></div>`. Der Teil zu Z. 257 („Mehr anzeigen“ nur mit Zeilen) entfällt: aufbau-C2a ersetzt die Fußzeile .more-row durch den Kopf-Link „Zum TradeLog“ (U.card trailing, nur mit Inhalt), aufbau-B12 löscht .more-row.
