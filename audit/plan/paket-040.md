# Paket 040 · training, notebook_news

Schritte: 6 · Dateien: web/css/app.css, web/js/screens/mentor.js, web/js/screens/notebook.js, web/js/screens/progress.js, web/js/screens/shadow.js
Betroffene Tests laut Spezifikation: web/e2e/mentortest.js:41; web/e2e/mobiletest.js:53-54; web/e2e/mobiletest.js:53-54 (Teilen versteckt, Kopfzeile eine Reihe); web/e2e/nbsel.js; web/e2e/sampletest.js:105; web/e2e/shadowtest.js:28, :56, :62 (Tabelleninhalt)
Baut auf Paketen auf: 23, 26, 38

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## responsiv-3.13 · Notebook: Teilen am Handy im •••-Menü, Ordner-Ansicht öffnet linke Spalte, nb-share schließt Menüs

Gruppe responsiv · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-1, bereich_notebook_news-11
Quelle: audit/spec/responsiv.md Z. 524–530 · Dateien: web/js/screens/notebook.js
Abhängig von: responsiv-A1, responsiv-B8

```text
### 3.13 web/js/screens/notebook.js (bereich_notebook_news-1, bereich_notebook_news-11)

- Z. 74 Kopfzeile: `<button type="button" class="btn ghost sm" data-action="nb-share" …>` → `class="btn ghost sm ph-hide"` (Rest gleich).
- Z. 74 •••-Menü: nach `<button type="button" class="item" data-action="nb-duplicate" …>${I.copy} Duplizieren</button>` einfügen: `<button type="button" class="item ph-only" data-action="nb-share" data-id="${cur.id}">${I.external} Teilen</button>`
- Z. 130 `'nb-view'(el) { st().view = el.dataset.value; App.rerender(); }` → `'nb-view'(el) { const nb = st(); nb.view = el.dataset.value; if (nb.view === 'folders') nb.leftOpen = true; /* sonst wird die Ordner-Spalte gar nicht gerendert */ App.rerender(); }`
- Z. 170 `'nb-share'(el) { flush(); …` → `'nb-share'(el) { App.closePopovers(); flush(); …`

```

## responsiv-C7 · Notebook „Teilen“: alte Handy-Ausblendregel streichen, Kommentar anpassen

Gruppe responsiv · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-11
Quelle: audit/spec/responsiv.md Z. 406–408 · Dateien: web/css/app.css
Abhängig von: responsiv-A1, responsiv-3.13

```text
**C7 Notebook „Teilen“** (bereich_notebook_news-11)
- Z. 3009 `.nb .note-head .row [data-action="nb-share"] { display: none; }` ersatzlos streichen (übernimmt `ph-hide` am Knopf, siehe 3.13). Kommentar Z. 3004 „Teilen steckt auf dem Handy nicht in der Reihe“ → „Teilen steht am Handy im •••-Menü“.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .nb .note-head .row [data-action="nb-share"]] Die Handy-Regel `display: none` für „Teilen“ (app.css Z. 3009) wird ersatzlos gestrichen (responsiv-C7). Der Knopf bekommt ph-hide, der neue •••-Eintrag ph-only. abstaende-D2 (8) benennt die Regel deshalb nicht auf `.nb .note-bar [data-action="nb-share"]` um. Das •••-Menü liegt in derselben Reihe (notebook.js:74), und die umbenannte Regel würde am Handy auch den neuen Menüeintrag „Teilen“ verstecken.

## responsiv-3.10 · Fortschritt: Regeln im Detail mit Kernspalten und Handy-Unterzeile „{0}× gebrochen · Kosten“

Gruppe responsiv · Cluster training · Aufwand S · Befunde: bereich_training-24, responsiv-8
Quelle: audit/spec/responsiv.md Z. 503–508 · Dateien: web/js/screens/progress.js
Abhängig von: responsiv-A1

```text
### 3.10 web/js/screens/progress.js:82 (bereich_training-24, responsiv-8)

- `<table class="tbl compact">` → `<table class="tbl compact ph-fit">`
- `<th class="r">Gebrochen (Trades)</th><th class="r">Kosten</th>` → `class="r ph-hide"` an beiden; die zugehörigen `td` ebenso.
- Regel-Zelle: `<td style="white-space:normal">${esc(x.rule.text)}</td>` → `<td style="white-space:normal">${esc(x.rule.text)}${x.brokenN ? \`<div class="sub ph-only"><span>${x.brokenN}× gebrochen</span> · ${U.pnl(x.brokenCost)}</div>\` : ''}</td>`

```

## responsiv-3.11 · Schatten-Ich: Verstöße-Tabelle mit Kernspalten, Unterzeile Datum · Symbol

Gruppe responsiv · Cluster training · Aufwand S · Befunde: bereich_training-27
Quelle: audit/spec/responsiv.md Z. 509–513 · Dateien: web/js/screens/shadow.js
Abhängig von: responsiv-A1

```text
### 3.11 web/js/screens/shadow.js (bereich_training-27)

- Z. 68 `row`: Datum-`td` → `<td class="ph-hide">`; `<td class="sym">` → `<td class="sym ph-hide">`; Regel-`td` → `<td class="ph-wrap">${esc(v.label)}…<div class="sub ph-only">${fmt.dateDM(v.date)} ${fmt.time(v.date)} · ${esc(v.symbol)}</div></td>`; Echt- und Schatten-`td` → `class="r ph-hide"`; letzte Spalte bleibt.
- Z. 71 `<table class="tbl compact shadow-tbl">` → `<table class="tbl compact shadow-tbl ph-fit">`; `th` Datum, Symbol → `class="ph-hide"`, Echt, Schatten → `class="r ph-hide"`.

```

## responsiv-C8 · Schatten-Ich-Tabelle: prüfen, dass .tbl.ph-fit die Mindestbreite der .shadow-tbl schlägt (keine eigene Regel)

Gruppe responsiv · Cluster training · Aufwand S · Befunde: bereich_training-27
Quelle: audit/spec/responsiv.md Z. 409–411 · Dateien: web/css/app.css
Abhängig von: responsiv-A1, responsiv-3.11

```text
**C8 Schatten-Ich-Tabelle** (bereich_training-27)
- Keine eigene CSS-Regel nötig: `.tbl.ph-fit { min-width: 0 }` (A1, Spezifität 0,2,0) schlägt `.shadow-tbl { min-width: 560px/520px }` (Z. 2437, 2448).

```

## responsiv-3.15 · Mentor: Löschen-Knopf am Handy nur Symbol, kurzer Platzhalter auf Touch

Gruppe responsiv · Cluster training · Aufwand S · Befunde: bereich_training-38
Quelle: audit/spec/responsiv.md Z. 536–540 · Dateien: web/js/screens/mentor.js
Abhängig von: responsiv-A1, responsiv-C6

```text
### 3.15 web/js/screens/mentor.js (bereich_training-38)

- Z. 82: `<button type="button" class="btn sm ghost" data-action="mentor-clear" …>${I.trash} Verlauf löschen</button>` → `<button type="button" class="btn sm ghost" data-action="mentor-clear" aria-label="Verlauf löschen" …>${I.trash}<span class="ph-hide">Verlauf löschen</span></button>`
- Z. 84 Platzhalter: `'Schreib dem Mentor … (Enter sendet, Shift+Enter neue Zeile)'` → `(matchMedia('(hover: hover) and (pointer: fine)').matches ? 'Schreib dem Mentor … (Enter sendet, Shift+Enter neue Zeile)' : 'Schreib dem Mentor …')`

```
