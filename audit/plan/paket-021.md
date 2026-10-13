# Paket 021 · notebook_news

Schritte: 28 · Dateien: web/README.md, web/css/app.css, web/e2e/newstest.js, web/js/editor.js, web/js/screens/news.js, web/js/screens/notebook.js, web/js/store.js
Betroffene Tests laut Spezifikation: Akzeptanz 4.3 notebook (Tag-Pillen 500); Akzeptanz 4.3 notebook („Netto-P&L“ 500, Betrag 700 Onest); Akzeptanz 4.3 notebook_notiz (Editor-h2 zweizeilig ohne Lücke); Akzeptanz 4.3 notebook_notiz (Notiztitel 32/600); Akzeptanz 4.3 notebook_notiz (Toolbar „Text“ und „16“ 13/500, „16“ in Onest); e2e/headtest.js:62–64 (.nb .folder.active); e2e/nbsel.js:12–17; e2e/sixtest.js:52–57; web/e2e/figtest.js; web/e2e/mobiletest.js:53-55 (sucht .note-head > .row; auf .note-bar umstellen, rowH-Grenze prüfen); web/e2e/nbsel.js (prüfen); web/e2e/nbsel.js:34 (.sel.on bleibt); web/e2e/newstest.js:67; web/e2e/newstest.js:67 (siehe farbe-D2b); web/tests/core.test.mjs; web/tests/inline-style.test.mjs (Zählung, Schritt R5); web/tests/sample.test.mjs
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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .nb .tagpop .item.k-setup[aria-checked="true"]] komponenten-C29b gilt: Z. 1043–1046 (farbige `.sec.k-*` und `.item.k-*[aria-checked]`) werden ersatzlos gelöscht. Die Gruppenköpfe nutzen danach die normale `.popover .sec` (--muted). Gewählte Tags sehen aus wie jeder gewählte Menüeintrag (`.popover .item[aria-checked="true"]`, farbe-B4), denn `.tagpop` ist ein `.popover`. Begründung: Der grüne Setup-Kopf (B6) verstößt gegen BRIEF (Grün nur Gewinn und „Trade loggen“). Rot oder violett gefärbte gewählte Einträge im Menü wären eine bunte Markierung der Auswahl. Die Kategorie ist durch die Gruppenüberschrift klar. Die Tag-Chips in der Notiz (`.tagpill.k-*`) bleiben unberührt. Die neue Regel `.nb .tagpop .item[aria-checked="true"] { color: var(--text); }` aus C29b wäre wirkungslos (kilook Z11) und entfällt.
- ÄNDERN: Den Punkt Z. 1044 (`.sec.k-setup` --muted / `.item.k-setup` --text) nicht umsetzen, komponenten-C29b löscht die Zeilen. Übrige Punkte von C1b siehe Anker .nb .tagpop .chk und .nb .save-state.saving.
- [konflikt: .nb .tagpop .sec.k-setup] Wie beim Anker .nb .tagpop .item.k-setup[aria-checked="true"]: Die Regel wird gelöscht (komponenten-C29b). Der Kopf „Setups“ steht neutral in `.popover .sec` (--muted). Weder Grün (B6) noch eine eigene --muted-Regel (farbe-C1b) ist nötig.
- ÄNDERN: Den Punkt Z. 1044 (`.sec.k-setup` --muted / `.item.k-setup` --text) nicht umsetzen, komponenten-C29b löscht die Zeilen. Übrige Punkte von C1b siehe Anker .nb .tagpop .chk und .nb .save-state.saving.
- [konflikt: .nb .tagpop .chk] Haken haben in allen Einzelwahl-Listen dieselbe Farbe: `--text-2`, 16 px (komponenten-C21d, wie `.popover .item .chk` aus C21a und `.tpl-row .chk`). Das `currentColor` aus farbe-C1b würde nach dem Neutralisieren der Einträge `--text` ergeben und von den anderen Menüs abweichen. Endzustand: `.nb .tagpop .chk { width: 16px; height: 16px; display: inline-grid; place-items: center; color: var(--text-2); }`, Z. 1053 gelöscht.
- ÄNDERN: Den Punkt Z. 1052 (`.nb .tagpop .chk` → currentColor) nicht umsetzen, das übernimmt komponenten-C21d (--text-2, 16 px).
- [konflikt: .save-state] Ein Baustein für den Speicherstand, überall gleich. CSS: Z. 1030 `.nb .save-state` → `.save-state { font-size: var(--fs-12); line-height: var(--lh-12); color: var(--muted); margin-left: auto; white-space: nowrap; }`, solange die Typo-Tokens fehlen, 12px. Z. 1031 `.nb .save-state.saving` wird ersatzlos gelöscht. „Wird gespeichert …“ ist keine Warnung, --warn steht nur für Warnungen (zustaende Z5, farbe-Grundregel). Druck Z. 1193 `.nb .save-state` → `.save-state`. Neu: `.set-head .save-state { align-self: center; }`, Größe und Farbe aus der allgemeinen Regel. JS: misc.js `head()` setzt in jeden Einstellungen-Kopf `<span class="save-state" aria-live="polite"></span>${trailing}` (S-misc-a). Kein zweiter Span mit `id="set-save"` im Trading-Kopf. Angezeigt wird ausschließlich über `App.savedHint()` (A7), auch in Trading. Dauer 2000 ms (statt 1,5 s), weil der Hinweis im Kopf weit weg vom geänderten Feld steht. Notebook: Text „Wird gespeichert …“ (S-NB3); die Klasse `saving` hat keine Regel mehr und wird nicht mehr gesetzt (kein toter Code). Wie Trading sonst speichert (`save-trading-auto` gegen `data-change="save-trading"` aus komponenten-S-misc-e), entscheidet der Anker des Trading-Formulars.
- ÄNDERN: Den Punkt Z. 1031 (`.nb .save-state.saving` → --warn-text) nicht umsetzen, die Regel wird gelöscht (komponenten-C37a).
- [konflikt: .nb .save-state.saving] Die Regel wird gelöscht, kein Gelb (zustaende). Weder farbe-C1b (`--warn-text`) noch eine Umbenennung in `.save-state.saving` (C37a). „Wird gespeichert …“ ist ein laufender Vorgang, keine Warnung. Siehe Anker .save-state.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .nb-ytpop] Ergebnis `.nb-ytpop { …; border: 1px solid var(--border-2); border-radius: 12px; …; font-size: var(--fs-13); line-height: var(--lh-13); }`. Rand und Radius setzt komponenten-C22, die Größe typografie-3.2.3h.
- [konflikt: .ed-pop .item .chk] Wie bei den Notebook-Tags: Haken in `--text-2`, 16 px (komponenten-C21d), einheitlich mit allen Menü-Haken. Endzustand: `.ed-pop .item .chk { display: none; width: 16px; height: 16px; color: var(--text-2); }`. Kein Grün, damit ist auch das Ziel von farbe-C1c erfüllt.
- VERBINDLICH (Kreuzprüfung): app.css. (1) Z. 1090 `.nb-toolbar .tb[aria-pressed="true"] { background: var(--accent-soft); color: var(--accent); border-color: var(--accent-soft); }` → `{ background: var(--surface-3); color: var(--text); border-color: var(--border-2); }`. (2) Z. 1109 `.ed-palette .c { …; border: 1px solid rgba(255,255,255,.12); … }` → `border: 1px solid var(--border-2);`. (3) Z. 1120 `.nb-menu .row-item.on, .nb-menu .row-item:hover { background: var(--accent-soft); color: var(--accent); }` → `{ background: var(--surface-2); color: var(--text); }`. (4) Z. 1123 (`.nb-menu .grid-em button.on`, `.nb-menu .grid-em button:hover`) `{ background: var(--accent-soft); }` → `{ background: var(--surface-2); }`. Folgendes entfällt: Z. 1103 `.ed-pop .item .chk`, denn komponenten-C21d setzt `display: none; width: 16px; height: 16px; color: var(--text-2);` wie bei allen Menü-Haken. Ebenso Z. 1124 `.nb-ytpop`, denn komponenten-C22 setzt `border: 1px solid var(--border-2); border-radius: 12px`.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .ql-editor.ql-blank::before] Der Platzhalter bekommt keine eigene Schriftgröße: `.ql-editor.ql-blank::before { color: var(--muted); font-style: normal; left: 20px; }` (farbe-C1d). Begründung: Der Platzhalter steht dort, wo der Text erscheint, und ahmt dessen Format nach (.ph-bold/.ph-italic). Der Notiztext hat var(--nb-body, 16px), die festen 18px wichen davon ab. Ohne font-size gibt es an dieser Regel nichts zu tokenisieren.
- [doppelt: .ql-editor li[data-list=checked] > .ql-ui] Z. 1143 ist eine gemeinsame Regel für checked und unchecked und wird `.ql-editor li[data-list=checked] > .ql-ui, .ql-editor li[data-list=unchecked] > .ql-ui { color: var(--text-2); }`. Das setzt komponenten-C17a. Der Wert ist in beiden Schritten gleich.
- ÄNDERN: Den Punkt zu Z. 1143 (`.ql-ui` → --text-2) streichen, das übernimmt komponenten-C17a. Platzhalter, Zitat, Code, Links (.ql-editor a, .nb-tweet a) und Tooltip-Links wie spezifiziert.
- [doppelt: .ql-editor li[data-list=unchecked] > .ql-ui] Es ist dieselbe Regel (Z. 1143) wie beim Anker `.ql-editor li[data-list=checked] > .ql-ui`: `color: var(--text-2)`, gesetzt von komponenten-C17a.
- ÄNDERN: Den Punkt zu Z. 1143 streichen, das übernimmt komponenten-C17a (dieselbe Anweisung wie beim checked-Anker, nur einmal ausführen).

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

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .nb-details summary:focus] Z. 1187 wird genau einmal ersetzt, durch barrierefreiheit-A2d: `.nb-details summary:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; border-radius: 4px; }`. Damit fällt die grüne Fokus-Schrift weg, und der neutrale Fokusring gilt wie überall. Z. 1186 behält `outline: none`, die :focus-visible-Regel setzt sich darüber durch. Das Gewicht 600 kommt aus typografie-3.2.4e.
- ÄNDERN: Den Punkt Z. 1187 (Löschen von `.nb-details summary:focus`) nicht umsetzen, das erledigt barrierefreiheit-A2d. Z. 1163, 1165 und 1177 bleiben.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: --lc] Keine Werte-Kollision: C23 entfernt --lc an den News-Wichtigkeits-Chips, C15 setzt --lc an den Bewertungssternen (Wert --warn-text, siehe Anker .rating). Die Umkehr der newstest-Prüfung (D2b) setzt die Code-Änderung C23 voraus.

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

## farbe-C24c · Notizkopf: P&L-Zeile mit .pnl-line/.lbl-pnl, Links ohne accent, „Tagesansicht öffnen“

Gruppe farbe · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-17, bereich_notebook_news-3
Quelle: audit/spec/farbe.md Z. 508–509 · Dateien: web/js/screens/notebook.js
Abhängig von: farbe-C1b

```text
- Z. 76: `<div style="margin-top:4px;font-weight:700;color:var(--text)">Netto-P&L ${U.pnl(pnl, '', …)}` → `<div class="pnl-line"><span class="lbl-pnl">Netto-P&L</span> ${U.pnl(pnl, 'num', …)}` (übrige Argumente unverändert); bei den Links „Trade öffnen“ und „Tagesansicht“ `class="accent"` entfernen; Text „Tagesansicht“ → „Tagesansicht öffnen“

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: U.pnl] Die Regel aus kilook-A3 gilt überall: Ergebnisse laufen über U.pnl und tragen immer ein Vorzeichen, signed: false fällt weg (kilook-C9b Z. 166, kilook-C16 Z. 26). Disziplin-Kosten tragen ein Vorzeichen (farbe-C29). Break-even sieht in TradeLog und Tagesansicht gleich aus: `<span class="neu">${fmt.cur(t.pnl, { signed: true, r: t.r })}</span>`, offene Trades zeigen `U.statusPill('open')` (aufbau-C7c und C15a). Prop-Beträge bekommen { currency: a.currency } (siehe money). Im Notebook tragen alle P&L-Beträge die Klasse num: der Notizkopf (farbe-C24c), die Trade-Notiz in der Liste (zustaende-S-NB1) und ebenso die neue Tagesnotiz-Zeile aus aufbau-C10d. responsiv-3.10 und typografie-3.8h sind verträglich (Text von 3.8h siehe U.barRow).

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

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: --lc] Keine Werte-Kollision: C23 entfernt --lc an den News-Wichtigkeits-Chips, C15 setzt --lc an den Bewertungssternen (Wert --warn-text, siehe Anker .rating). Die Umkehr der newstest-Prüfung (D2b) setzt die Code-Änderung C23 voraus.

## farbe-D3b · README Z. 113: Wichtigkeits-Chips neutral

Gruppe farbe · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-42
Quelle: audit/spec/farbe.md Z. 567–567 · Dateien: web/README.md
Abhängig von: farbe-C23

```text
- Z. 113 nach „Feiertage mit Kalender-Symbol)“ ergänzen: „; die gewählten Wichtigkeits-Chips im Filter sind neutral wie alle Filter-Chips“ — bereich_notebook_news-42
```

## typografie-3.2.3j · Notebook-Toolbar: „Text“-Label und Größenanzeige auf 13/500, .sz in Onest

Gruppe typografie · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-14
Quelle: audit/spec/typografie.md Z. 256–256 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
- 15 → 13: Z. 1085 `.nb-toolbar .tb.turn .lbl` → `font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 500;`; Z. 1086 `.nb-toolbar .tb .lbl` löschen; Z. 1093 `.nb-toolbar .sz`: `font-size: 15px; font-weight: 700;` → `font-family: var(--font-num); font-size: var(--fs-13); font-weight: 500;` (bereich_notebook_news-14)
```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .nb-toolbar .tb .lbl] Dieselbe Änderung zweimal. typografie-3.2.3j übernimmt, weil sie Tokens und Zeilenhöhe mitbringt: Z. 1086 `.nb-toolbar .tb .lbl` löschen (`.lbl` gibt es nur im Umwandeln-Knopf, editor.js:118). Z. 1085 wird `.nb-toolbar .tb.turn .lbl { font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 500; }`.
- [doppelt: .nb-toolbar .tb.turn .lbl] Wie beim Anker .nb-toolbar .tb .lbl: typografie-3.2.3j übernimmt. Endstand: `.nb-toolbar .tb.turn .lbl { font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 500; }`, Z. 1086 gelöscht.

## typografie-3.2.3z · Notiz-Titel .nb .note-title 34/700 → 32/600, lh 1.2 (Stufen 26/24 bleiben)

Gruppe typografie · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-15
Quelle: audit/spec/typografie.md Z. 286–288 · Dateien: web/css/app.css
Abhängig von: —

```text
**Notiz-Titel (Text, eigene Stufe)**
- Z. 1014 `.nb .note-title`: `font-size: 34px; font-weight: 700` → `font-size: 32px; font-weight: 600; line-height: 1.2` (letter-spacing −0.02em bleibt). Z. 1069 (26 px) und 3012 (24 px) bleiben. (bereich_notebook_news-15, K14)

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .nb .note-title] Der Notiz-Titel bleibt in den Stufen der Typografie: 32/600, Zeilenhöhe 1.2, −0.02em (typografie-3.2.3z, Z. 1014), 26 px bis 960 px, 24 px am Handy. Die 28 px aus abstaende-D2 (3) entfallen: 28 ist in der Skala verboten, und Typografie-Abnahme 2 erlaubt für .nb .note-title nur 32/26/24. Für die schmale Notizspalte gilt stattdessen die vorhandene 26-px-Stufe auch im Notebook-Container unter 1000 px (Liste plus Notiz oder eine Spalte, Notiz 426–725 px breit). In der Dreispalten-Ansicht bleibt der Titel bei 32 px (1440 px mit offener Seitenleiste: Container ≥ 1160, Abnahme notebook_notiz 32/600 unberührt). Teil (3) von D2 entfällt laut Anker .nb.no-left.

## typografie-3.2.4e · Notebook: Tag-Pillen 500 (Zähler Onest 500), .nb-details summary 600

Gruppe typografie · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-15
Quelle: audit/spec/typografie.md Z. 338–340 · Dateien: web/css/app.css
Abhängig von: —

```text
| `.nb .tagpill` (992) | 600 → 500 | bereich_notebook_news-15 |
| `.nb .tagpill b` (993) | `{ color: var(--muted); font-weight: 600; }` → `{ color: var(--muted); font-weight: 500; font-family: var(--font-num); }` | bereich_notebook_news-15 |
| `.nb-details summary` (1186) | 700 → 600 | bereich_notebook_news-15 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .nb .tagpill b] Eine Regel, komponenten-C16 übernimmt: .nb .tagpill b { color: var(--muted); font-family: var(--font-num); font-size: var(--fs-11); line-height: var(--lh-11); font-weight: 500; }. Größe 11 kommt aus komponenten, Onest aus typografie (Zähler sind Ziffern), beide wollen 500. typografie-3.2.4e behält nur .nb-details summary.
- ÄNDERN: Die Teile .nb .tagpill (Z. 992) und .nb .tagpill b (Z. 993) entfallen; komponenten-C16 übernimmt sie, mit Onest für den Zähler. Nur .nb-details summary 700 → 600 bleibt.
- [doppelt: .nb .tagpill] Beide setzen 600 → 500, komponenten-C16 übernimmt mit der vollständigen Chip-Fassung: height: 28px; padding: 0 10px; font-size: var(--fs-12); line-height: var(--lh-12); font-weight: 500 (Rand, Fläche, Farbe, Lücke 6 bleiben). typografie-3.2.4e lässt die Zeile aus (Anpassung wie bei .nb .tagpill b).
- ÄNDERN: .nb .tagpill (Z. 992) nicht ändern, das übernimmt komponenten-C16.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .nb.no-left] Die Notebook-Spalten ab 961 px regelt allein responsiv-B8, und zwar nach Inhaltsbreite (Container nbc). Ab 1160 px gilt 236/300/Rest (.nb.no-left 300/Rest wie heute), bei 1000–1159 px 210/260/Rest bzw. .nb.no-left 260/Rest, bei 700–999 px Liste 260 plus Notiz (Ordner über „Zurück“), unter 700 px eine Spalte. Grund: Die Fensterbreite trifft die Lage nicht, weil eine offene oder eingeklappte Seitenleiste rund 150 px verschiebt. B8 erreicht bei 961–1180 px die Notizspalte von etwa 470 px, die abstaende mit 240 px und eingeklappten Ordnern wollte, ohne einen zweiten Mechanismus. Daher gibt es keine 240 px für .nb.no-left, kein Einklappen per matchMedia und keinen README-Satz „961–1180 px: Ordner zunächst eingeklappt“. README Z. 120 schreibt responsiv 3.19.
- ÄNDERN: Teil (3) entfällt ganz: weder `.nb.no-left { grid-template-columns: 240px minmax(0, 1fr); }` noch `@media (min-width: 961px) and (max-width: 1180px) { .nb .note-title { font-size: 28px; } }`. Z. 1061 ersetzt responsiv-B8. Die Teile (1), (2) und (4)–(7) bleiben, zu (8) siehe Anker .nb .note-head .row [data-action="nb-share"].
- [konflikt: .nb .note-title] Der Notiz-Titel bleibt in den Stufen der Typografie: 32/600, Zeilenhöhe 1.2, −0.02em (typografie-3.2.3z, Z. 1014), 26 px bis 960 px, 24 px am Handy. Die 28 px aus abstaende-D2 (3) entfallen: 28 ist in der Skala verboten, und Typografie-Abnahme 2 erlaubt für .nb .note-title nur 32/26/24. Für die schmale Notizspalte gilt stattdessen die vorhandene 26-px-Stufe auch im Notebook-Container unter 1000 px (Liste plus Notiz oder eine Spalte, Notiz 426–725 px breit). In der Dreispalten-Ansicht bleibt der Titel bei 32 px (1440 px mit offener Seitenleiste: Container ≥ 1160, Abnahme notebook_notiz 32/600 unberührt). Teil (3) von D2 entfällt laut Anker .nb.no-left.
- [konflikt: .nb .note-head .row [data-action="nb-share"]] Die Handy-Regel `display: none` für „Teilen“ (app.css Z. 3009) wird ersatzlos gestrichen (responsiv-C7). Der Knopf bekommt ph-hide, der neue •••-Eintrag ph-only. abstaende-D2 (8) benennt die Regel deshalb nicht auf `.nb .note-bar [data-action="nb-share"]` um. Das •••-Menü liegt in derselben Reihe (notebook.js:74), und die umbenannte Regel würde am Handy auch den neuen Menüeintrag „Teilen“ verstecken.
- ÄNDERN: In Teil (8) die Umbenennung `.nb .note-head .row [data-action="nb-share"]` → `.nb .note-bar [data-action="nb-share"]` streichen; die Regel löscht responsiv-C7. Die übrigen Umbenennungen in (8) und das neue `.nb .note-bar { padding-inline: 14px; }` bleiben.

## abstaende-D3 · Mentor-Notizen in der Notiz auf der Textkante 28 px

Gruppe abstaende · Cluster notebook_news · Aufwand S · Befunde: bereich_konto-18
Quelle: audit/spec/abstaende.md Z. 370–370 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
| D3 | Mentor-Notizen Z. 2882 | `.mentor-notes.in-note { margin: 8px 0 16px; …}` → `margin: var(--sp-2) 28px var(--sp-4);` | bereich_konto-18 |
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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .note-title] Im Code passen die drei Schritte zusammen:
- K3 baut den Papierkorb-Kopf mit `<h2 class="note-title">` innerhalb von `.nb`. Dort greift `.nb .note-title` (Z. 1014) und nicht die ungebundene Regel, die C2 löscht. `h2` hat über Z. 90 margin 0.
- `.nb .note-title:focus` (Z. 1028) bleibt.
- responsiv-A3 schließt `.note-title` über die Klasse am Titelfeld aus, die Klasse bleibt im Markup.

Einziger Widerspruch ist ein Wert: Die abstaende-Prüfung 14 erwartet „Titel 34 px“, typografie setzt den Notiz-Titel auf 32/600 (≤ 960: 26, ≤ 560: 24). Verbindlich: Der Papierkorb-Titel ist so groß wie der Titel einer offenen Notiz, also 32 px am Desktop.
- ÄNDERN: Markup wie spezifiziert. In der zugehörigen Prüfung 14 „Titel 34 px“ durch „Titel gleich groß wie der Titel einer offenen Notiz (32 px nach typografie)“ ersetzen.

## abstaende-K5 · 14 Inline-Abstände in notebook.js nach 1.16 ersetzen (z. B. col-body padding-top als Klasse)

Gruppe abstaende · Cluster notebook_news · Aufwand M · Befunde: abstaende_layout-34
Quelle: audit/spec/abstaende.md Z. 449–450 · Dateien: web/js/screens/notebook.js, web/css/app.css
Abhängig von: abstaende-A6

```text
| K5 | 14 Inline-Abstände | nach 1.16 ersetzen (z. B. `col-body` `style="padding-top:6px"` → Klasse mit `padding-top: var(--sp-2)`) | abstaende_layout-34 |

```

## komponenten-C21d · Haken in Notebook-Tags und Editor-Menüs 16 px in --text-2

Gruppe komponenten · Cluster notebook_news · Aufwand S · Befunde: komponenten-2
Quelle: audit/spec/komponenten.md Z. 372–373 · Dateien: web/css/app.css
Abhängig von: —

```text
- Notebook-Tags und Editor: Z. 1052 `.nb .tagpop .chk { width: 14px; height: 14px; … color: var(--accent); }` → `width: 16px; height: 16px; … color: var(--text-2);`; Z. 1053 (`.nb .tagpop .chk svg`) löschen. Z. 1103 `.ed-pop .item .chk { display: none; width: 14px; height: 14px; color: var(--accent); }` → `width: 16px; height: 16px; color: var(--text-2);` (display bleibt).

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .nb .tagpop .chk] Haken haben in allen Einzelwahl-Listen dieselbe Farbe: `--text-2`, 16 px (komponenten-C21d, wie `.popover .item .chk` aus C21a und `.tpl-row .chk`). Das `currentColor` aus farbe-C1b würde nach dem Neutralisieren der Einträge `--text` ergeben und von den anderen Menüs abweichen. Endzustand: `.nb .tagpop .chk { width: 16px; height: 16px; display: inline-grid; place-items: center; color: var(--text-2); }`, Z. 1053 gelöscht.
- [konflikt: .ed-pop .item .chk] Wie bei den Notebook-Tags: Haken in `--text-2`, 16 px (komponenten-C21d), einheitlich mit allen Menü-Haken. Endzustand: `.ed-pop .item .chk { display: none; width: 16px; height: 16px; color: var(--text-2); }`. Kein Grün, damit ist auch das Ziel von farbe-C1c erfüllt.

## komponenten-C29a · Notebook-Ordner: gerader Farbbalken als ::before, Namen bündig

Gruppe komponenten · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-32
Quelle: audit/spec/komponenten.md Z. 432–434 · Dateien: web/css/app.css
Abhängig von: —

```text
**C29 – Notebook: Ordner und Tag-Menü** (bereich_notebook_news-32, bereich_notebook_news-20, komponenten-2)
- Z. 978 `.nb .folder { … padding: 8px 8px 8px 10px; … border: 1px solid transparent; border-left: 3px solid var(--fc, transparent); … }` → `padding: 8px 8px 8px 12px;` und die Deklaration `border-left: 3px solid var(--fc, transparent);` streichen.
- Neu nach Z. 978: `.nb .folder::before { content: ''; position: absolute; left: 0; top: 8px; bottom: 8px; width: 3px; border-radius: 2px; background: var(--fc, transparent); }`
```

## komponenten-C29b · Notebook-Tag-Menü (CSS): eine Spalte, 280 px, Suchfeld, keine farbigen Köpfe

Gruppe komponenten · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-20, komponenten-2
Quelle: audit/spec/komponenten.md Z. 435–441 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 1041 `.nb .tagpop { min-width: 220px; width: max-content; max-width: min(720px, calc(100vw - 48px)); }` → `.nb .tagpop { width: 280px; max-width: calc(100vw - 32px); }`
- Z. 1042 `.nb .tagcols { display: flex; gap: 4px; align-items: flex-start; }` → `.nb .tagcols { display: flex; flex-direction: column; gap: 0; max-height: 360px; overflow-y: auto; overscroll-behavior: contain; }`
- Z. 1043–1045 (farbige `.sec.k-*`/`.item.k-*[aria-checked]`) und Z. 1046 löschen; neu: `.nb .tagpop .item[aria-checked="true"] { color: var(--text); }`
- Z. 1050 `.nb .tagcol { min-width: 150px; max-height: 340px; overflow-y: auto; … }` → `.nb .tagcol { min-width: 0; }`
- Z. 1051 (Regel ≤760 px) löschen.
- Neu: `.nb .tagpop-q { padding: 4px 4px 6px; } .nb .tagpop-q .input { height: 34px; padding: 0 10px; font-size: 13px; }`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .nb .tagpop .item.k-setup[aria-checked="true"]] komponenten-C29b gilt: Z. 1043–1046 (farbige `.sec.k-*` und `.item.k-*[aria-checked]`) werden ersatzlos gelöscht. Die Gruppenköpfe nutzen danach die normale `.popover .sec` (--muted). Gewählte Tags sehen aus wie jeder gewählte Menüeintrag (`.popover .item[aria-checked="true"]`, farbe-B4), denn `.tagpop` ist ein `.popover`. Begründung: Der grüne Setup-Kopf (B6) verstößt gegen BRIEF (Grün nur Gewinn und „Trade loggen“). Rot oder violett gefärbte gewählte Einträge im Menü wären eine bunte Markierung der Auswahl. Die Kategorie ist durch die Gruppenüberschrift klar. Die Tag-Chips in der Notiz (`.tagpill.k-*`) bleiben unberührt. Die neue Regel `.nb .tagpop .item[aria-checked="true"] { color: var(--text); }` aus C29b wäre wirkungslos (kilook Z11) und entfällt.
- ÄNDERN: Z. 1043–1046 ersatzlos löschen, ohne die neue Regel `.nb .tagpop .item[aria-checked="true"] { color: var(--text); }`; `.popover .item[aria-checked="true"]` (farbe-B4) setzt Schrift, Fläche und Rand. Übrige Punkte (280 px, eine Spalte, Suchfeld, `.tagcol`, Handy-Regel löschen) bleiben.
- [konflikt: .nb .tagpop .sec.k-setup] Wie beim Anker .nb .tagpop .item.k-setup[aria-checked="true"]: Die Regel wird gelöscht (komponenten-C29b). Der Kopf „Setups“ steht neutral in `.popover .sec` (--muted). Weder Grün (B6) noch eine eigene --muted-Regel (farbe-C1b) ist nötig.

## komponenten-C30 · Ordner-Dialog (CSS): Plus-Farbkreis .swatch.add, gleichmäßige Abstände

Gruppe komponenten · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-31
Quelle: audit/spec/komponenten.md Z. 442–452 · Dateien: web/css/app.css
Abhängig von: —

```text
**C30 – Ordner-Dialog** (bereich_notebook_news-31)
Nach den `.swatch`-Regeln (Z. 580–584; `.swatch` ist die Pille mit 18-px-Farbkreis, die der Ordner-Dialog schon nutzt) einfügen:
```css
.swatch.add { position: relative; }
.swatch.add i { border: 1px dashed var(--border-2); display: grid; place-items: center; color: var(--text-2); }
.swatch.add i svg { width: 12px; height: 12px; }
.swatch.add input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
form[data-action="nb-folder-save"] .stack { gap: 16px; }
form[data-action="nb-folder-save"] .modal-foot { margin-top: 20px; padding-top: 14px; }
```

```

## komponenten-D4 · store.js: „Daily Journal“ nicht grün, einmalige Umfärbung

Gruppe komponenten · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-31
Quelle: audit/spec/komponenten.md Z. 622–624 · Dateien: web/js/store.js
Abhängig von: —

```text
**D4 – store.js: Daily Journal nicht grün** (bereich_notebook_news-31)
Z. 56 `['daily', 'Daily Journal', '#34f58a']` → `['daily', 'Daily Journal', '#9aa3a0']`. Beim Laden (dort, wo Standardordner ergänzt werden) einmalig: Ordner mit `id === 'daily'`, `isDefault` und Farbe `#34f58a` (ohne Groß-/Kleinschreibung) bekommen `#9aa3a0`.

```
