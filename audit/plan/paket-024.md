# Paket 024 · notebook_news

Schritte: 10 · Dateien: web/css/app.css, web/e2e/newstest.js, web/js/editor.js, web/js/screens/news.js, web/js/screens/notebook.js
Betroffene Tests laut Spezifikation: neue Suite web/e2e/tablettest.js; prüfen: e2e/newstest.js:53, :93 (.nw-next-t b, .nw-next .caption); prüfen: e2e/newstest.js:93 (.nw-next .caption); web/e2e/figtest.js, figdel.js, imgtest.js, undotest.js (.nb-toolbar); web/e2e/mobiletest.js:51-55 (Handy unverändert); web/e2e/mobiletest.js:55 (Werkzeugleiste eine Zeile, seitlich wischbar); web/e2e/nbsel.js, figtest.js, figdel.js, imgtest.js, undotest.js, tiptest.js, scrolltest.js (Spalten .col.left/.col.mid); web/e2e/newstest.js:52
Baut auf Paketen auf: 7, 23

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## barrierefreiheit-C-news-49 · News-Wichtigkeitsbalken role=img mit aria-label wie title

Gruppe barrierefreiheit · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-47
Quelle: audit/spec/barrierefreiheit.md Z. 884–887 · Dateien: web/js/screens/news.js
Abhängig von: —

```text
#### `web/js/screens/news.js`

- **Z. 49:** an beiden Varianten von `.nw-imp` `role="img"` und `aria-label` mit demselben Text wie `title` ergänzen („Hohe/Mittlere/Niedrige Wichtigkeit“, „Feiertag“) (Befund: bereich_notebook_news-47)

```

## barrierefreiheit-E-newstest-52 · newstest.js:52: vergangene Termine über --muted-Farbe statt Deckkraft prüfen

Gruppe barrierefreiheit · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-47
Quelle: audit/spec/barrierefreiheit.md Z. 904–904 · Dateien: web/e2e/newstest.js
Abhängig von: barrierefreiheit-B13

```text
| newstest.js:52 | `getComputedStyle(r).opacity < 0.7` | `r.classList.contains('past') && getComputedStyle(r.querySelector('.nw-title')).color === (() => { const s = document.createElement('span'); s.className = 'muted'; document.body.appendChild(s); const c = getComputedStyle(s).color; s.remove(); return c; })()` |
```

## kilook-B7 · News-Hero: Glockenkachel-CSS löschen, Countdown am Handy in eigener Zeile

Gruppe kilook · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-41
Quelle: audit/spec/kilook.md Z. 464–467 · Dateien: web/css/app.css
Abhängig von: —

```text
**B7 · web/css/app.css · News-Hero** (bereich_notebook_news-41)
- **3071–3072** `.nw-next-ico { … }` und `.nw-next-ico svg { … }` löschen.
- **3119** im Block `@media (max-width: 640px)` an die Regel `.nw-next-when { … }` `flex-basis: 100%;` anhängen. Der Countdown bricht damit am Handy immer in eine eigene zweite Zeile.

```

## kilook-C2 · Notebook-CSS: .journal/.note-*-Reste und tags-row-Regeln löschen, Umwandeln-Label 13px/500

Gruppe kilook · Cluster notebook_news · Aufwand M · Befunde: bereich_notebook_news-36
Quelle: audit/spec/kilook.md Z. 524–534 · Dateien: web/css/app.css
Abhängig von: —

```text
**C2 · web/css/app.css · Notebook-Reste** (bereich_notebook_news-36)
- **769** Kommentar `/* ---------- Journal ---------- */` → `/* ---------- Notebook-Ordner ---------- */`
- **770–774** `.journal …` (5 Regeln) löschen.
- **775–778** `.folder …` **bleiben**.
- **779–787** löschen: `.note-item`, `:hover`, `.active`, `b`, `span`, `.note-title`, `.note-title:focus`, `.note-body`, `.note-body:focus`.
- **788** `@media (max-width: 960px) { .journal … }` löschen.
- **1028** `.nb .note-title:focus { outline: none; }` **bleibt**.
- **1057** `.nb .tags-row input { max-width: 190px; … }` und **1059** `.nb .tags-row input { max-width: none; }` löschen.
- **1085–1086** vorher `.nb-toolbar .tb.turn .lbl { font-size: 15px; }` und `.nb-toolbar .tb .lbl { font-size: 13px; font-weight: 600; }`
  → nachher eine Regel `.nb-toolbar .tb.turn .lbl { font-size: 13px; font-weight: 500; }`. Werte aus typografie/bereich_notebook_news-14. `.lbl` gibt es nur im Umwandeln-Knopf (editor.js:118).

```

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
