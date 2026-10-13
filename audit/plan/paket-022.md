# Paket 022 · notebook_news

Schritte: 28 · Dateien: web/README.md, web/css/app.css, web/e2e/newstest.js, web/js/editor.js, web/js/screens/news.js, web/js/screens/notebook.js
Betroffene Tests laut Spezifikation: Akzeptanz 4.3 news; Akzeptanz 4.3 notebook (Tag-Pillen 500); Akzeptanz 4.3 notebook („Netto-P&L“ 500, Betrag 700 Onest); Akzeptanz 4.3 notebook_notiz (Editor-h2 zweizeilig ohne Lücke); Akzeptanz 4.3 notebook_notiz (Notiztitel 32/600); Akzeptanz 4.3 notebook_notiz (Toolbar „Text“ und „16“ 13/500, „16“ in Onest); Akzeptanz 4.4: grep -n "\.journal" web/css/app.css ohne Treffer; web/e2e/figtest.js; web/e2e/imgtest.js:5 ([data-action=nb-new] greift weiter); web/e2e/mobiletest.js:53-55 (sucht .note-head > .row; auf .note-bar umstellen, rowH-Grenze prüfen); web/e2e/nbsel.js (prüfen); web/e2e/nbsel.js:34 (.sel.on bleibt); web/e2e/newstest.js; web/e2e/newstest.js:67; web/e2e/newstest.js:67 (siehe farbe-D2b); web/tests/inline-style.test.mjs (Zählung, Schritt R5)
Baut auf Paketen auf: 1, 2

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## farbe-C1a · Notebook-Liste: Auswahl-Kästchen, gewählte Notiz und gedrückter Kopf-Knopf neutral

Gruppe farbe · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-16
Quelle: audit/spec/farbe.md Z. 354–359 · Dateien: web/css/app.css
Abhängig von: —

```text
### C. Einzelstellen

**C1 – `web/css/app.css` Notebook und Editor** — bereich_notebook_news-16, bereich_notebook_news-26, ki_look-34, bereich_notebook_news-21, bereich_notebook_news-17, bereich_notebook_news-3, farbe_kontrast-6
- Z. 1007 `.nb .note-item .sel.on { background: var(--accent); border-color: var(--accent); color: var(--accent-ink); }` → `{ background: var(--text); border-color: var(--text); color: var(--bg); }`
- Z. 1008 `.nb .note-item.selected { background: var(--accent-soft); border-color: var(--accent-soft); }` → `{ background: var(--surface-3); border-color: var(--border-2); }`
- Z. 1012 `.nb .col-head .btn[aria-pressed="true"] { color: var(--accent); background: var(--accent-soft); }` → `{ color: var(--text); background: var(--surface-3); border-color: var(--border-2); }`
```

## farbe-C1b · Notizkopf (.pnl-line, .lbl-pnl, Links), Speicherstatus --warn-text, Tag-Menü ohne Grün

Gruppe farbe · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-17, bereich_notebook_news-3, farbe_kontrast-6, bereich_notebook_news-16
Quelle: audit/spec/farbe.md Z. 360–363 · Dateien: web/css/app.css
Abhängig von: farbe-A1, farbe-A2

```text
- nach Z. 1029 (`.nb .meta`) neu: `.nb .meta .pnl-line { margin-top: 4px; } .nb .meta .lbl-pnl { font-weight: 500; color: var(--text-2); } .nb .meta a { color: var(--text-2); text-decoration: underline; text-decoration-color: var(--border-2); text-underline-offset: 2px; } .nb .meta a:hover { color: var(--text); }`
- Z. 1031 `.nb .save-state.saving { color: var(--warn); }` → `var(--warn-text)`
- Z. 1044 `.nb .tagpop .sec.k-setup, .nb .tagpop .item.k-setup[aria-checked="true"] { color: var(--accent); }` → `.nb .tagpop .sec.k-setup { color: var(--muted); } .nb .tagpop .item.k-setup[aria-checked="true"] { color: var(--text); }`
- Z. 1052 `.nb .tagpop .chk { …; color: var(--accent); }` → `color: currentColor;`
```

## farbe-C1c · Editor-Werkzeuge: Toolbar gedrückt, Haken im Editor-Popover, Palettenrand, Notebook-Menü und YouTube-Popover neutral

Gruppe farbe · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-16, bereich_notebook_news-21
Quelle: audit/spec/farbe.md Z. 364–369 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 1090 `.nb-toolbar .tb[aria-pressed="true"] { background: var(--accent-soft); color: var(--accent); border-color: var(--accent-soft); }` → `{ background: var(--surface-3); color: var(--text); border-color: var(--border-2); }`
- Z. 1103 `.ed-pop .item .chk { …; color: var(--accent); }` → `color: var(--text);`
- Z. 1109 `.ed-palette .c { …; border: 1px solid rgba(255,255,255,.12); … }` → `border: 1px solid var(--border-2);`
- Z. 1120 `.nb-menu .row-item.on, .nb-menu .row-item:hover { background: var(--accent-soft); color: var(--accent); }` → `{ background: var(--surface-2); color: var(--text); }`
- Z. 1123 `… { background: var(--accent-soft); }` → `{ background: var(--surface-2); }`
- Z. 1124 `.nb-ytpop { …; border: 1px solid var(--accent); … }` → `border: 1px solid var(--border-2);`
```

## farbe-C1d · Quill-Editor: Platzhalter --muted ohne 18 px, Zitat, Code, Links (auch .nb-tweet a), Checklisten-Haken und Tooltip-Links neutral

Gruppe farbe · Cluster notebook_news · Aufwand M · Befunde: bereich_notebook_news-26, ki_look-34, bereich_notebook_news-16
Quelle: audit/spec/farbe.md Z. 370–375 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 1130 `.ql-editor.ql-blank::before { color: var(--faint); font-style: normal; left: 20px; font-size: 18px; }` → `{ color: var(--muted); font-style: normal; left: 20px; }`
- Z. 1137 `.ql-editor blockquote { border-left: 3px solid var(--accent); … }` → `.ql-snow .ql-editor blockquote, .ql-editor blockquote { border-left: 2px solid var(--border-2); margin: 8px 0; padding-left: 14px; color: var(--text-2); }`
- Z. 1139 `.ql-editor code { background: var(--surface-3); color: var(--accent); … }` → Selektor `.ql-snow .ql-editor code, .ql-editor code` und `color: var(--text);`
- Z. 1140 `.ql-editor a { color: var(--accent); }` → `.ql-editor a { color: var(--text); text-decoration: underline; text-decoration-color: var(--border-2); text-underline-offset: 2px; }`; ebenso Z. 1190 `.nb-tweet a { color: var(--accent); … }` → `color: var(--text); text-decoration: underline; text-decoration-color: var(--border-2); text-underline-offset: 2px;` (`word-break` bleibt)
- Z. 1143 `… > .ql-ui { color: var(--accent); }` → `color: var(--text-2);`
- Z. 1148 und Z. 1154 (Quill-Tooltip-Links) `color: var(--accent)` → `color: var(--text)`
```

## farbe-C1e · Bilder in Notizen (Griff, Rahmen, Größenleiste) neutral, grüner Fokus im aufklappbaren Abschnitt löschen

Gruppe farbe · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-16
Quelle: audit/spec/farbe.md Z. 376–380 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 1163 `.nb-figure .rs::before { …; background: var(--accent); … }` → `background: var(--text);`
- Z. 1165 `… { outline: 2px solid var(--accent); … }` → `outline: 2px solid var(--text-2);`
- Z. 1177 `.nb-figure .fig-bar button[aria-pressed="true"] { background: var(--accent-soft); color: var(--accent); }` → `{ background: var(--surface-3); color: var(--text); }`
- Z. 1187 `.nb-details summary:focus { color: var(--accent); }` löschen (Fokusring: bereich_notebook_news-35, andere Gruppe)

```

## farbe-C10 · News: mittlerer Wichtigkeits-Balken auf --imp-mid

Gruppe farbe · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-42
Quelle: audit/spec/farbe.md Z. 426–427 · Dateien: web/css/app.css
Abhängig von: farbe-A1, farbe-A2

```text
**C10 – `web/css/app.css` News, Z. 3096:** `.nw-imp.l2 i:nth-child(-n+2) { background: var(--warn); }` → `{ background: var(--imp-mid); }` — bereich_notebook_news-42

```

## farbe-C23 · News: IMP_COL löschen, Wichtigkeits-Chips ohne --lc

Gruppe farbe · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-42, farbe_kontrast-6
Quelle: audit/spec/farbe.md Z. 500–501 · Dateien: web/js/screens/news.js
Abhängig von: —

```text
**C23 – `web/js/screens/news.js` Z. 76–77:** Konstante `IMP_COL` löschen und in `chip` den Teil `${key === 'impact' ? ` style="--lc:${IMP_COL[v]}"` : ''}` entfernen — bereich_notebook_news-42, farbe_kontrast-6

```

## farbe-C24a · Notebook: Leertexte muted, active nicht im Auswahlmodus

Gruppe farbe · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-26, barrierefreiheit-25, bereich_notebook_news-16
Quelle: audit/spec/farbe.md Z. 502–505 · Dateien: web/js/screens/notebook.js
Abhängig von: —

```text
**C24 – `web/js/screens/notebook.js`** — bereich_notebook_news-26, barrierefreiheit-25, bereich_notebook_news-16, bereich_notebook_news-2, bereich_notebook_news-17, bereich_notebook_news-3
- Z. 34 `<span class="small faint">Noch keine Tags</span>` → `class="small muted"`
- Z. 54 `<div class="small faint" style="padding:4px 10px">Noch keine eigenen Ordner` → `class="small muted"`
- Z. 60 `class="note-item ${cur && cur.id === n.id ? 'active' : ''} …"` → `class="note-item ${!nb.selectMode && cur && cur.id === n.id ? 'active' : ''} …"`
```

## farbe-C24b · Notebook: „Neue Notiz“-Knöpfe neutral

Gruppe farbe · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-2
Quelle: audit/spec/farbe.md Z. 506–507 · Dateien: web/js/screens/notebook.js
Abhängig von: —

```text
- Z. 61 `class="btn sm primary grow" data-action="nb-new"` → `class="btn sm grow"`
- Z. 66 `class="btn sm primary" data-action="nb-new"` → `class="btn sm"` (Z. 47 „Anwenden“, 67 „Wiederherstellen“, 116/119/160 „Speichern“, 170 „Öffnen“ bleiben `primary` und werden über B2 neutral)
```

## farbe-C24c · Notizkopf: P&L-Zeile mit .pnl-line/.lbl-pnl, Links ohne accent, „Tagesansicht öffnen“

Gruppe farbe · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-17, bereich_notebook_news-3
Quelle: audit/spec/farbe.md Z. 508–509 · Dateien: web/js/screens/notebook.js
Abhängig von: farbe-C1b

```text
- Z. 76: `<div style="margin-top:4px;font-weight:700;color:var(--text)">Netto-P&L ${U.pnl(pnl, '', …)}` → `<div class="pnl-line"><span class="lbl-pnl">Netto-P&L</span> ${U.pnl(pnl, 'num', …)}` (übrige Argumente unverändert); bei den Links „Trade öffnen“ und „Tagesansicht“ `class="accent"` entfernen; Text „Tagesansicht“ → „Tagesansicht öffnen“

```

## farbe-C32 · Editor-Farbpalette: Abschnitt „Designfarben“ mit Token-Farben, „Eigene Farben“ nur bei Bedarf, aria-labels

Gruppe farbe · Cluster notebook_news · Aufwand M · Befunde: bereich_notebook_news-21
Quelle: audit/spec/farbe.md Z. 549–556 · Dateien: web/js/editor.js
Abhängig von: farbe-A1, farbe-A2

```text
**C32 – `web/js/editor.js` (Farbpalette, Z. 106–112)** — bereich_notebook_news-21
- Neue Konstante nach Z. 106: `const THEME_COLORS = [['var(--muted)', 'Grau'], ['var(--profit)', 'Gewinn'], ['var(--loss)', 'Verlust'], ['var(--warn-text)', 'Warnung'], ['var(--be)', 'Break-even'], ['var(--info)', 'Info']];`
- `palette(kind, custom)` (Z. 112) umbauen:
  - Abschnitt „Eigene Farben“ (Überschrift und Reihe) nur ausgeben, wenn `custom.length`; jeder eigene Kreis `aria-label="Farbe ${esc(c)}"`.
  - davor neuer Abschnitt `<div class="sec">Designfarben</div><div class="row-c">…</div>` mit einem Kreis je `THEME_COLORS`: für `kind === 'color'` `data-value="${v}"` und `style="background:${v}"`, für `kind === 'background'` `data-value="color-mix(in srgb, ${v} 22%, transparent)"` und gleicher `style`; `aria-label` und `data-tip` = Name. Die Grau-Farbe (`var(--muted)`) entfällt beim Textmarker.
  - den „+“-Kreis (`label.c.add`) ans Ende dieser Reihe „Designfarben“ setzen.
  - Kreise des Rasters „Standardfarben“ bekommen `aria-label="Farbe ${c}"`. Raster, „Farbe entfernen“ und das Speichern als Wert bleiben unverändert (alte Hex-Werte bleiben gültig).

```

## farbe-D2b · newstest: Prüfung auf neutrale Wichtigkeits-Chips (kein --lc) umdrehen

Gruppe farbe · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-42
Quelle: audit/spec/farbe.md Z. 563–564 · Dateien: web/e2e/newstest.js
Abhängig von: farbe-C23

```text
- `web/e2e/newstest.js` Z. 67: Prüfung umdrehen, neuer Text „Gewählte Wichtigkeit-Chips sind neutral“, Bedingung `(await p.$eval('[data-action=news-f][data-value=high]', b => b.style.getPropertyValue('--lc'))) === ''` — bereich_notebook_news-42

```

## farbe-D3b · README Z. 113: Wichtigkeits-Chips neutral

Gruppe farbe · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-42
Quelle: audit/spec/farbe.md Z. 567–567 · Dateien: web/README.md
Abhängig von: farbe-C23

```text
- Z. 113 nach „Feiertage mit Kalender-Symbol)“ ergänzen: „; die gewählten Wichtigkeits-Chips im Filter sind neutral wie alle Filter-Chips“ — bereich_notebook_news-42
```

## typografie-3.2.2d · Toten .journal-Code löschen (Z. 770–774 und .journal-Teil in Z. 788)

Gruppe typografie · Cluster notebook_news · Aufwand S · Befunde: typografie-17
Quelle: audit/spec/typografie.md Z. 223–223 · Dateien: web/css/app.css
Abhängig von: —

```text
| Z. 770–774 und der `.journal`-Teil in Z. 788 | löschen (toter Code, kein `class="journal"` in `js/`) | typografie-17 |
```

## typografie-3.2.3j · Notebook-Toolbar: „Text“-Label und Größenanzeige auf 13/500, .sz in Onest

Gruppe typografie · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-14
Quelle: audit/spec/typografie.md Z. 256–256 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
- 15 → 13: Z. 1085 `.nb-toolbar .tb.turn .lbl` → `font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 500;`; Z. 1086 `.nb-toolbar .tb .lbl` löschen; Z. 1093 `.nb-toolbar .sz`: `font-size: 15px; font-weight: 700;` → `font-family: var(--font-num); font-size: var(--fs-13); font-weight: 500;` (bereich_notebook_news-14)
```

## typografie-3.2.3z · Notiz-Titel .nb .note-title 34/700 → 32/600, lh 1.2 (Stufen 26/24 bleiben)

Gruppe typografie · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-15
Quelle: audit/spec/typografie.md Z. 286–288 · Dateien: web/css/app.css
Abhängig von: —

```text
**Notiz-Titel (Text, eigene Stufe)**
- Z. 1014 `.nb .note-title`: `font-size: 34px; font-weight: 700` → `font-size: 32px; font-weight: 600; line-height: 1.2` (letter-spacing −0.02em bleibt). Z. 1069 (26 px) und 3012 (24 px) bleiben. (bereich_notebook_news-15, K14)

```

## typografie-3.2.4e · Notebook: Tag-Pillen 500 (Zähler Onest 500), .nb-details summary 600

Gruppe typografie · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-15
Quelle: audit/spec/typografie.md Z. 338–340 · Dateien: web/css/app.css
Abhängig von: —

```text
| `.nb .tagpill` (992) | 600 → 500 | bereich_notebook_news-15 |
| `.nb .tagpill b` (993) | `{ color: var(--muted); font-weight: 600; }` → `{ color: var(--muted); font-weight: 500; font-family: var(--font-num); }` | bereich_notebook_news-15 |
| `.nb-details summary` (1186) | 700 → 600 | bereich_notebook_news-15 |
```

## typografie-3.2.5g · Editor-Überschriften .ql-editor h1–h3 line-height 1.25

Gruppe typografie · Cluster notebook_news · Aufwand S · Befunde: typografie-23
Quelle: audit/spec/typografie.md Z. 366–366 · Dateien: web/css/app.css
Abhängig von: —

```text
| Editor-Überschriften, neu nach Z. 1135 | `.ql-editor h1, .ql-editor h2, .ql-editor h3 { line-height: 1.25; }` (Ränder 1133–1135 bleiben) | typografie-23 |
```

## typografie-3.2.5h · Notebook-P&L-Zeile: neue Regel .nb .nb-pnl (500, --text-2), Betrag 700 Onest

Gruppe typografie · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-15
Quelle: audit/spec/typografie.md Z. 367–368 · Dateien: web/css/app.css
Abhängig von: —

```text
| Notebook-P&L, neu nach Z. 1029 | `.nb .nb-pnl { margin-top: 4px; font-weight: 500; color: var(--text-2); } .nb .nb-pnl > .pos, .nb .nb-pnl > .neg, .nb .nb-pnl > .neu { font-weight: 700; font-family: var(--font-num); }` | bereich_notebook_news-15 |

```

## typografie-3.2.6b · News-Ziffern: tabular-nums kommt aus der Sammelregel (nur prüfen, keine Einzeländerung)

Gruppe typografie · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-48
Quelle: audit/spec/typografie.md Z. 375–376 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.2e

```text
| `.nw-next-when b` (3077), `.nw-time` (3091), `.nw-v b` (3106) | `tabular-nums` kommt aus der Sammelregel 3.2.2 (keine Einzeländerung nötig) | bereich_notebook_news-48 |

```

## typografie-3.8n · Notebook: Inline-Stil der P&L-Zeile durch Klasse nb-pnl ersetzen

Gruppe typografie · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-15
Quelle: audit/spec/typografie.md Z. 439–439 · Dateien: web/js/screens/notebook.js
Abhängig von: typografie-3.2.5h

```text
| notebook.js:76 | `<div style="margin-top:4px;font-weight:700;color:var(--text)">Netto-P&L …` → `<div class="nb-pnl">Netto-P&L …`; in beiden `<span class="muted small" style="font-weight:500">` das `style="font-weight:500"` streichen | bereich_notebook_news-15 |
```

## abstaende-D2 · Notebook-CSS: Notizkopf-Polster, neuer Spaltenkopf .nb .note-bar (Datumsknopf bündig), Ordnerspalte 240 px + Titel 28 px bei 961–1180, Werkzeugleiste ohne Unterrand, .ql-editor oben 16, Druck- und Handy-Selektoren auf .note-bar

Gruppe abstaende · Cluster notebook_news · Aufwand L · Befunde: bereich_notebook_news-23, abstaende_layout-28, bereich_notebook_news-22, responsiv-13
Quelle: audit/spec/abstaende.md Z. 369–369 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
| D2 | Notebook Z. 1013, 1015–1019, 1061, 1068, 1079, 1128, 1136, 1193, 3005–3014 | (1) Z. 1013 `.nb .note-head { padding: 22px 28px 10px; …}` → `padding: var(--sp-4) 28px 10px`. (2) Neu nach Z. 1013: `.nb .note-bar { justify-content: space-between; flex-wrap: nowrap; padding: 12px 28px 10px; } .nb .note-bar .datebtn { padding-block: 6px; } @media (min-width: 961px) { .nb .note-bar .datebtn { margin-left: -11px; } }`. (3) Z. 1061: `.nb.no-left { grid-template-columns: 260px minmax(0, 1fr); }` → `240px minmax(0, 1fr)`, dazu `@media (min-width: 961px) and (max-width: 1180px) { .nb .note-title { font-size: 28px; } }`. (4) Im 960er-Block nach Z. 1068: `.nb .note-bar { padding-inline: 16px; }`. (5) Z. 1079 `.nb-toolbar` `margin: 0 -8px 10px` → `margin: 0 -8px 0`, Z. 3014 `margin: 0 -8px 8px` → `margin: 0 -8px 0`. (6) Z. 1128 `.ql-editor { padding: 14px 20px 60px; …}` → `padding: var(--sp-4) 20px 60px`. Neu nach Z. 1136: `.ql-editor > :first-child { margin-top: 0; }`. (7) Druck Z. 1193 `.nb .note-head .row .btn` → `.nb .note-bar .btn`. (8) Handy Z. 3006–3009: `.nb .note-head > .row, .nb .note-head > .row > .row` → `.nb .note-bar, .nb .note-bar > .row`. `.nb .note-head > .row > .row:first-child` → `.nb .note-bar > .row:first-child`. `.nb .note-head .popwrap:has(> .datebtn)` → `.nb .note-bar .popwrap:has(> .datebtn)`. `.nb .note-head .row [data-action="nb-share"]` → `.nb .note-bar [data-action="nb-share"]`. Neu im 560er-Block: `.nb .note-bar { padding-inline: 14px; }` | bereich_notebook_news-23, abstaende_layout-28, bereich_notebook_news-22, responsiv-13 |
```

## abstaende-D3 · Mentor-Notizen in der Notiz auf der Textkante 28 px

Gruppe abstaende · Cluster notebook_news · Aufwand S · Befunde: bereich_konto-18
Quelle: audit/spec/abstaende.md Z. 370–370 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
| D3 | Mentor-Notizen Z. 2882 | `.mentor-notes.in-note { margin: 8px 0 16px; …}` → `margin: var(--sp-2) 28px var(--sp-4);` | bereich_konto-18 |
```

## abstaende-K1 · Notebook: leftOpen bei 961–1180 px zunächst false (Ordnerspalte eingeklappt)

Gruppe abstaende · Cluster notebook_news · Aufwand S · Befunde: responsiv-13
Quelle: audit/spec/abstaende.md Z. 441–445 · Dateien: web/js/screens/notebook.js
Abhängig von: —

```text
### web/js/screens/notebook.js

| Nr. | Stelle | vorher → nachher | Befunde |
|---|---|---|---|
| K1 | Z. 6 | `leftOpen: true` → `leftOpen: !(window.matchMedia && matchMedia('(min-width: 961px) and (max-width: 1180px)').matches)` | responsiv-13 |
```

## abstaende-K2 · Normale Notiz: erste Zeile aus .note-head als eigener Spaltenkopf .col-head.note-bar, inneres row → row s-2

Gruppe abstaende · Cluster notebook_news · Aufwand M · Befunde: bereich_notebook_news-23, abstaende_layout-28
Quelle: audit/spec/abstaende.md Z. 446–446 · Dateien: web/js/screens/notebook.js
Abhängig von: abstaende-D2, abstaende-A6

```text
| K2 | Z. 72–74 (normale Notiz) | Die erste Zeile `<div class="row" style="justify-content:space-between;flex-wrap:nowrap">…</div>` aus `.note-head` herausnehmen. Sie wird direkt nach `<div class="col right">` zu `<div class="col-head note-bar">…</div>`, Inhalt unverändert, Inline-Stil weg. Das innere `<div class="row" style="gap:6px;flex-wrap:nowrap">` → `<div class="row s-2">`. `.note-head` enthält danach Titel, Meta und Tags. | bereich_notebook_news-23, abstaende_layout-28 |
```

## abstaende-K3 · Notiz im Papierkorb: gleicher Kopf wie normale Notiz (.note-bar mit Zurück, Wiederherstellen btn sm, Endgültig löschen btn sm danger; Titel, Meta-Zeilen)

Gruppe abstaende · Cluster notebook_news · Aufwand M · Befunde: bereich_notebook_news-25
Quelle: audit/spec/abstaende.md Z. 447–447 · Dateien: web/js/screens/notebook.js
Abhängig von: abstaende-K2, abstaende-D2

```text
| K3 | Z. 67 (Notiz im Papierkorb) | → `<div class="col right"><div class="col-head note-bar"><button type="button" class="btn ghost icon sm back" data-action="nb-view" data-value="list" aria-label="Zurück">${I.back}</button><span class="grow"></span><button type="button" class="btn sm" data-action="nb-trash-restore" data-id="${cur.id}">Wiederherstellen</button><button type="button" class="btn sm danger" data-action="nb-trash-purge" data-id="${cur.id}">Endgültig löschen</button></div><div class="note-head"><h2 class="note-title">${esc(cur.title \|\| 'Ohne Titel')}</h2><div class="meta"><div>Gelöscht am ${fmt.dateTime(cur.deletedAt)}</div><div>Wird am ${fmt.dateFull(new Date(new Date(cur.deletedAt).getTime() + 30 * 86400000))} endgültig entfernt</div></div></div><div class="note-body nb-share-view">…unverändert…</div></div>` | bereich_notebook_news-25 |
```

## abstaende-K5 · 14 Inline-Abstände in notebook.js nach 1.16 ersetzen (z. B. col-body padding-top als Klasse)

Gruppe abstaende · Cluster notebook_news · Aufwand M · Befunde: abstaende_layout-34
Quelle: audit/spec/abstaende.md Z. 449–450 · Dateien: web/js/screens/notebook.js, web/css/app.css
Abhängig von: abstaende-A6

```text
| K5 | 14 Inline-Abstände | nach 1.16 ersetzen (z. B. `col-body` `style="padding-top:6px"` → Klasse mit `padding-top: var(--sp-2)`) | abstaende_layout-34 |

```

## abstaende-S6 · README Z. 120: Notebook 961–1180 px Ordner zunächst eingeklappt

Gruppe abstaende · Cluster notebook_news · Aufwand S · Befunde: responsiv-13
Quelle: audit/spec/abstaende.md Z. 535–535 · Dateien: web/README.md
Abhängig von: abstaende-K1

```text
| S6 | Z. 120 | nach „drei Spalten (Ordner und Tags, Notizliste, Notiz)“ ergänzen: „(961–1180 px: Ordner zunächst eingeklappt)“ | responsiv-13 |
```
