# Paket 023 · notebook_news

Schritte: 6 · Dateien: web/css/app.css, web/js/editor.js, web/js/screens/news.js, web/js/screens/notebook.js
Betroffene Tests laut Spezifikation: neue Suite web/e2e/tablettest.js; prüfen: e2e/newstest.js:93 (.nw-next .caption); web/e2e/figtest.js, figdel.js, imgtest.js, undotest.js (.nb-toolbar); web/e2e/mobiletest.js:51-55 (Handy unverändert); web/e2e/mobiletest.js:55 (Werkzeugleiste eine Zeile, seitlich wischbar); web/e2e/nbsel.js, figtest.js, figdel.js, imgtest.js, undotest.js, tiptest.js, scrolltest.js (Spalten .col.left/.col.mid)
Baut auf Paketen auf: 7, 8, 21

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## kilook-C22 · News-Hero-Markup ohne Glocke

Gruppe kilook · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-41
Quelle: audit/spec/kilook.md Z. 706–708 · Dateien: web/js/screens/news.js
Abhängig von: —

```text
**C22 · web/js/screens/news.js:83** (bereich_notebook_news-41)
- `<div class="nw-next"><span class="nw-next-ico">${I.bell}</span><div class="grow">` → `<div class="nw-next"><div class="grow">`. `<div class="caption">Nächste wichtige News</div>` bleibt.

```

## responsiv-B8 · Notebook-Spalten nach Inhaltsbreite (Container nbc, Grenzen 1160/1000/700 px)

Gruppe responsiv · Cluster notebook_news · Aufwand M · Befunde: bereich_notebook_news-1
Quelle: audit/spec/responsiv.md Z. 327–348 · Dateien: web/css/app.css
Abhängig von: —

```text
**B8 Notebook-Spalten** (bereich_notebook_news-1)
- Z. 1061 `@media (max-width: 1180px) { .nb { grid-template-columns: 210px 260px minmax(0, 1fr); } .nb.no-left { … } }` ersetzen durch:
  ```css
  /* Spalten nach Inhaltsbreite (nicht Fensterbreite): Seitenleiste offen oder eingeklappt zählt mit */
  @media (min-width: 961px) { .content:has(> .nb) { container: nbc / inline-size; } }
  @container nbc (max-width: 1159px) { .nb { grid-template-columns: 210px 260px minmax(0, 1fr); } .nb.no-left { grid-template-columns: 260px minmax(0, 1fr); } }
  @container nbc (max-width: 999px) {
    .nb, .nb.no-left { grid-template-columns: 260px minmax(0, 1fr); }
    .nb > .col.left, .nb[data-view="folders"] > .col.mid { display: none; }
    .nb[data-view="folders"] > .col.left { display: flex; }
    .nb .col.mid .back { display: inline-flex; }
    .nb .collapse-left, .nb .col.mid [data-action="nb-left-toggle"] { display: none; }
  }
  @container nbc (max-width: 699px) {
    .nb, .nb.no-left { grid-template-columns: minmax(0, 1fr); }
    .nb > .col { display: none; }
    .nb[data-view="folders"] > .col.left, .nb[data-view="list"] > .col.mid, .nb[data-view="note"] > .col.right { display: flex; }
    .nb .back { display: inline-flex; }
  }
  ```
  Z. 1062–1072 (≤ 960 px) bleiben unverändert.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .nb.no-left] Die Notebook-Spalten ab 961 px regelt allein responsiv-B8, und zwar nach Inhaltsbreite (Container nbc). Ab 1160 px gilt 236/300/Rest (.nb.no-left 300/Rest wie heute), bei 1000–1159 px 210/260/Rest bzw. .nb.no-left 260/Rest, bei 700–999 px Liste 260 plus Notiz (Ordner über „Zurück“), unter 700 px eine Spalte. Grund: Die Fensterbreite trifft die Lage nicht, weil eine offene oder eingeklappte Seitenleiste rund 150 px verschiebt. B8 erreicht bei 961–1180 px die Notizspalte von etwa 470 px, die abstaende mit 240 px und eingeklappten Ordnern wollte, ohne einen zweiten Mechanismus. Daher gibt es keine 240 px für .nb.no-left, kein Einklappen per matchMedia und keinen README-Satz „961–1180 px: Ordner zunächst eingeklappt“. README Z. 120 schreibt responsiv 3.19.
- [konflikt: .nb .note-title] Der Notiz-Titel bleibt in den Stufen der Typografie: 32/600, Zeilenhöhe 1.2, −0.02em (typografie-3.2.3z, Z. 1014), 26 px bis 960 px, 24 px am Handy. Die 28 px aus abstaende-D2 (3) entfallen: 28 ist in der Skala verboten, und Typografie-Abnahme 2 erlaubt für .nb .note-title nur 32/26/24. Für die schmale Notizspalte gilt stattdessen die vorhandene 26-px-Stufe auch im Notebook-Container unter 1000 px (Liste plus Notiz oder eine Spalte, Notiz 426–725 px breit). In der Dreispalten-Ansicht bleibt der Titel bei 32 px (1440 px mit offener Seitenleiste: Container ≥ 1160, Abnahme notebook_notiz 32/600 unberührt). Teil (3) von D2 entfällt laut Anker .nb.no-left.
- ÄNDERN: Im Block `@container nbc (max-width: 999px) { … }` zusätzlich `.nb .note-title { font-size: 26px; }` eintragen.
- [reihenfolge: .nb] Die Schritte vertragen sich: C11 setzt .nb gap von 14 auf var(--grid-gap) (16 px), B8 legt die Spaltenbreiten fest. B8 hat seine Messwerte aber mit gap 14 gerechnet; sie verschieben sich um 2 px je Lücke. 1440×900: 236/300/592 (statt 596). 1366×768: 210/260/584 (statt 588). 1024 mit offener Seitenleiste, Liste plus Notiz: 260/468 (statt 470), mit eingeklappter Seitenleiste 620 (statt 622). Die Notizspalte bleibt ≥ 440 px, die Grenzen 1160/1000/700 bleiben.
- ÄNDERN: Die Abnahme (responsiv.md Abschnitt 4, Notebook) und die neue Suite tablettest.js mit gap 16 messen: Notiz 592 / 584 / 468 / 620 px (± 2).

## responsiv-B10 · Editor-Werkzeugleiste am Handy: umsortieren, Trenner weg, klebender Verlauf statt Maske

Gruppe responsiv · Cluster notebook_news · Aufwand M · Befunde: bereich_notebook_news-12, responsiv-40
Quelle: audit/spec/responsiv.md Z. 356–371 · Dateien: web/css/app.css
Abhängig von: —

```text
**B10 Editor-Werkzeugleiste am Handy** (bereich_notebook_news-12, responsiv-40)
- Im Block ≤ 560 px direkt nach Z. 3015 neu:
  ```css
  /* Formatierung zuerst; Rückgängig, Wiederholen und Schriftgröße am Ende der wischbaren Zeile (nichts fällt weg) */
  .nb-toolbar { gap: 4px; }
  .nb-toolbar > .sep { display: none; }
  .nb-toolbar > [data-ed="bold"], .nb-toolbar > [data-ed="italic"], .nb-toolbar > [data-ed="underline"], .nb-toolbar > [data-ed="strike"] { order: -1; }
  .nb-toolbar > .size, .nb-toolbar > [data-ed="undo"], .nb-toolbar > [data-ed="redo"] { order: 1; }
  .nb-toolbar .tb.turn { min-width: 84px; }
  /* Auslauf als klebender Verlauf statt Maske: die Leiste enthält Menüs, eine Maske würde sie abschneiden */
  .nb-toolbar::before, .nb-toolbar::after { content: ''; position: sticky; z-index: 1; flex: 0 0 28px; align-self: stretch; pointer-events: none; visibility: hidden; }
  .nb-toolbar::before { order: -2; left: 0; margin-right: -28px; background: linear-gradient(270deg, transparent, var(--surface)); }
  .nb-toolbar::after { order: 2; right: 0; margin-left: -28px; background: linear-gradient(90deg, transparent, var(--surface)); }
  .nb-toolbar.fade-l::before, .nb-toolbar.fade-r::after { visibility: visible; }
  ```

```

## wording-S14.1-14.7 · Notebook: „Ordner anlegen“, „Papierkorb“, „Tagesnotiz anlegen“, „Notizen auswählen“, •••-Menü (JSON, Drucken mit Druckersymbol, Link zum Lesen), Dialogtitel

Gruppe wording · Cluster notebook_news · Aufwand M · Befunde: bereich_notebook_news-29, bereich_notebook_news-27, bereich_notebook_news-28
Quelle: audit/spec/wording.md Z. 525–535 · Dateien: web/js/screens/notebook.js
Abhängig von: wording-S1.1-1.3

```text
### Schritt 14 · `web/js/screens/notebook.js` und `web/js/editor.js`

| # | Stelle | vorher → nachher | ids |
|---|---|---|---|
| 14.1 | notebook.js:52 | `${I.folder} Ordner hinzufügen` → `${I.folder} Ordner anlegen` | bereich_notebook_news-29 |
| 14.2 | notebook.js:57 | `<span class="grow">Kürzlich gelöscht</span>` → `<span class="grow">Papierkorb</span>` | bereich_notebook_news-27 |
| 14.3 | notebook.js:61 und :63 | `'Tag loggen'` → `'Tagesnotiz anlegen'` (Knopf und Leertext „Lege mit „…“ los.“) | bereich_notebook_news-27 |
| 14.4 | notebook.js:62 | `'Notizen antippen'` → `'Notizen auswählen'` | bereich_notebook_news-27 |
| 14.5 | notebook.js:74 •••-Menü | `${I.upload} Aus Datei laden` → `${I.upload} Aus JSON importieren`; `${I.download} Exportieren (JSON)` → `${I.download} Als JSON exportieren`; `${I.download} Als PDF herunterladen` → `${I.printer} Als PDF drucken`; Teilen-Tooltip `data-tip="Nur-Lese-Link erzeugen"` → `data-tip="Link zum Lesen erstellen"` | bereich_notebook_news-29 |
| 14.6 | notebook.js:116 Dialogtitel | `'Ordner hinzufügen'` → `'Ordner anlegen'` | bereich_notebook_news-29 |
| 14.7 | notebook.js:119 Dialogtitel | `${tpl ? 'Vorlage bearbeiten' : 'Vorlage hinzufügen'}` → `${tpl ? 'Vorlage bearbeiten' : 'Vorlage anlegen'}` | bereich_notebook_news-28 |
```

## wording-S14.10-14.11 · Editor-„+“-Menü: Block „Text“, „Aufklappbarer Abschnitt“ nach „Grundbausteine“ verschieben

Gruppe wording · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-28
Quelle: audit/spec/wording.md Z. 538–540 · Dateien: web/js/editor.js
Abhängig von: —

```text
| 14.10 | editor.js:117 „+“-Menü | `item('text', E.para, 'Absatz')` → `item('text', E.para, 'Text')`; `item('details', E.toggle, 'Aufklappbare Liste')` → `item('details', E.toggle, 'Aufklappbarer Abschnitt')` und aus der Spalte „Listen“ hinter `item('quote', E.quote, 'Zitat')` in „Grundbausteine“ verschieben | bereich_notebook_news-28 |
| 14.11 | editor.js:118 und :211 | `'Aufklappbare Liste'` → `'Aufklappbarer Abschnitt'` (BLOCKS Z. 107 bleibt) | bereich_notebook_news-28 |

```

## bewegung-C7d · Notebook-Palette: Rand statt Vergrößerung, eigene Hover-Regel für den Plus-Knopf

Gruppe bewegung · Cluster notebook_news · Aufwand S · Befunde: bereich_einstellungen-42
Quelle: audit/spec/bewegung.md Z. 287–290 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 1109 `.ed-palette .c { … }` um `transition: border-color var(--dur-1) var(--ease);` ergänzen.
- Z. 1110 → `.ed-palette .c:hover { border-color: var(--text-2); }`
- Nach Z. 1111 (`.ed-palette .c.add { … }`) neu: `.ed-palette .c.add:hover { border-color: var(--text-2); color: var(--text); }`

```
