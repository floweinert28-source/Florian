# Paket 068 · barrierefreiheit, notebook_news, einstellungen

Schritte: 6 · Dateien: web/README.md, web/app.html, web/e2e/affiliatetest.js, web/e2e/calmnavtest.js, web/e2e/friedhoftest.js, web/e2e/proptest.js, web/js/editor.js, web/js/screens/misc.js, web/js/screens/notebook.js
Betroffene Tests laut Spezifikation: neu (Abschnitt 4, Verhalten): Taste 0 ohne FEATURES.replay ändert location.hash nicht; shortcuts=false sperrt N und 1–9, Esc wirkt weiter; prüfen: e2e/rptest.js:10 (Taste 7), e2e/mentortest.js:21 (Taste 8); web/e2e/affiliatetest.js:16; web/e2e/calmnavtest.js:51; web/e2e/friedhoftest.js:21; web/e2e/proptest.js:19; web/e2e/proptest.js:91; web/e2e/proptest.js:95
Baut auf Paketen auf: 2, 6, 14, 15, 27, 31, 61, 63, 66

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## barrierefreiheit-C-editor-118-164 · „Umwandeln in“-Menü als Radiogruppe

Gruppe barrierefreiheit · Cluster notebook_news · Aufwand S · Befunde: barrierefreiheit-26
Quelle: audit/spec/barrierefreiheit.md Z. 739–741 · Dateien: web/js/editor.js
Abhängig von: barrierefreiheit-P1, barrierefreiheit-P3

```text
- Z. 118: `id="pop-${p}turn"` → `id="pop-${p}turn" role="radiogroup" aria-label="Umwandeln in"`. In Z. 164 in der forEach-Schleife zusätzlich `b.setAttribute('role', 'radio');`
- Befunde: bereich_notebook_news-35, barrierefreiheit-36, barrierefreiheit-17, barrierefreiheit-26

```

## barrierefreiheit-C-notebook-28-74 · Notebook-Menüs: Tags role=checkbox, Sortieren und In Ordner verschieben als Radiogruppen

Gruppe barrierefreiheit · Cluster notebook_news · Aufwand S · Befunde: barrierefreiheit-26
Quelle: audit/spec/barrierefreiheit.md Z. 794–799 · Dateien: web/js/screens/notebook.js
Abhängig von: barrierefreiheit-P3

```text
#### `web/js/screens/notebook.js`

- **Z. 28:** Tag-Einträge bekommen zusätzlich `role="checkbox"` (Befund: barrierefreiheit-26)
- **Z. 61:** `<div class="popover" id="pop-nbsort">` → `… role="radiogroup" aria-label="Sortieren">`, Einträge `role="radio"` (Befund: barrierefreiheit-26)
- **Z. 74:**
  - Die Ordner-Einträge unter „In Ordner verschieben“ in `<div role="radiogroup" aria-label="In Ordner verschieben">…</div>` fassen, Einträge `role="radio"` (Befund: barrierefreiheit-26)
```

## barrierefreiheit-C-misc-365 · Sicherung: Dropzone role=button tabindex=0, Textfeld „Sicherung als Text einfügen“

Gruppe barrierefreiheit · Cluster einstellungen · Aufwand S · Befunde: barrierefreiheit-16, barrierefreiheit-37
Quelle: audit/spec/barrierefreiheit.md Z. 852–853 · Dateien: web/js/screens/misc.js
Abhängig von: barrierefreiheit-B10, barrierefreiheit-P3

```text
- **Z. 365:** `<div class="dropzone" id="bk-drop">` → zusätzlich `role="button" tabindex="0"`; `<textarea class="input mono" id="bk-text" …>` → zusätzlich `aria-label="Sicherung als Text einfügen"` (Befunde: barrierefreiheit-16, barrierefreiheit-37)

```

## barrierefreiheit-E-aria-current · Tests auf aria-current="page" umstellen (proptest, friedhoftest, affiliatetest, calmnavtest)

Gruppe barrierefreiheit · Cluster barrierefreiheit · Aufwand S · Befunde: barrierefreiheit-32, bereich_statistik-7
Quelle: audit/spec/barrierefreiheit.md Z. 905–907 · Dateien: web/e2e/proptest.js, web/e2e/friedhoftest.js, web/e2e/affiliatetest.js, web/e2e/calmnavtest.js
Abhängig von: barrierefreiheit-C-prop-304-305, barrierefreiheit-C-affiliate-51, barrierefreiheit-C-stats-15

```text
| proptest.js:19, 91, 95 · friedhoftest.js:21 | `.prop-tabs a[aria-pressed=true]` | `.prop-tabs a[aria-current=page]` |
| affiliatetest.js:16 | `x.getAttribute('aria-pressed')`, Soll `Alle Creator:true,…` | `x.getAttribute('aria-current')`, Soll `'Alle Creator:page,Creator-Ansicht:null'` |
| calmnavtest.js:51 | `t.querySelector('[aria-pressed="true"]')` | `t.querySelector('[aria-current="page"]')` |
```

## barrierefreiheit-E-README · README: Tastatur-Zeile (Z. 318) erweitern, Absatz Fokusführung unter „Neuaufbau ohne Springen“

Gruppe barrierefreiheit · Cluster barrierefreiheit · Aufwand S · Befunde: —
Quelle: audit/spec/barrierefreiheit.md Z. 912–916 · Dateien: web/README.md
Abhängig von: barrierefreiheit-A1, barrierefreiheit-P1, barrierefreiheit-P3, barrierefreiheit-U3a, barrierefreiheit-C-rangepicker, barrierefreiheit-C-dashboard-154

```text
#### `web/README.md`

- Z. 318: „Tastatur: **N** neuer Trade, **1–6** Bereiche, **Esc** schließt Dialoge“ → „Tastatur: **N** neuer Trade, **1–6** Bereiche, **Esc** schließt Dialoge (Formular-Dialoge mit geänderten Eingaben fragen „Änderungen verwerfen?“), **Tab** am Seitenanfang: „Zum Inhalt springen“, **Pfeiltasten** in Auswahlgruppen, im Zeitraum-Kalender und am Ziehgriff.“
- Neuer Absatz unter „Neuaufbau ohne Springen“: Fokus bleibt beim Neuaufbau auf demselben Element (`App.focusSnapshot`/`restoreFocus`), Seitenwechsel setzt ihn auf `#content`, Dialoge fokussieren sich selbst und geben ihn zurück, Fokusring neutral `--focus`.

```

## kilook-C6 · Tastenkürzel abschaltbar (settings.shortcuts), „0“ nur bei App.on('replay')

Gruppe kilook · Cluster barrierefreiheit · Aufwand S · Befunde: barrierefreiheit-43
Quelle: audit/spec/kilook.md Z. 579–583 · Dateien: web/app.html
Abhängig von: —

```text
**C6 · web/app.html:93–96 · Tastenkürzel** (barrierefreiheit-43)
- Erste Zeile im keydown-Listener: `if (window.Store && Store.settings && Store.settings.shortcuts === false) return;`
- **95** vorher `const map = { '1': 'dashboard', …, '9': 'shadow', '0': 'replay' };`
  → nachher `const map = { '1': 'dashboard', '2': 'trades', '3': 'day', '4': 'stats', '5': 'notebook', '6': 'progress', '7': 'ruhepunkt', '8': 'mentor', '9': 'shadow' }; if (App.on('replay')) map['0'] = 'replay';`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: app.html keydown] Ein gemeinsamer Tasten-Listener. kilook-C6 ändert dieselbe Stelle unter dem Ankernamen „app.html keydown-Listener“ und wird deshalb hier mitentschieden. Endstand: erste Zeile if (window.Store && Store.settings && Store.settings.shortcuts === false) return; (kilook-C6), dann die bestehenden Prüfungen (Modifier, Eingabefelder, .modal-bg), dann const map = { '1': 'dashboard', '2': 'trades', '3': 'day', '4': 'stats', '5': 'notebook', '6': 'progress', '7': 'ruhepunkt', '8': 'mentor', '9': 'shadow', '0': 'replay' }; if (map[e.key]) { if (App.on(map[e.key])) location.hash = '#/' + map[e.key]; } else if (e.key === 'n' || e.key === 'N') { App.actions['new-trade'].call(App); } (aufbau-B7). Grund: Die allgemeine Prüfung App.on(map[key]) deckt Taste 0 ab und dazu jeden Bereich, der über jy_features ausgeschaltet ist. Das entspricht parseRoute, das solche Bereiche aufs Dashboard umleitet. Eine Sonderregel nur für '0' braucht es dann nicht mehr.
- ÄNDERN: Nur die erste Zeile mit dem settings.shortcuts-Schalter einfügen. Die Map bleibt mit '0': 'replay', ihr Umbau mit if (App.on('replay')) map['0'] = 'replay' entfällt (die Prüfung macht aufbau-B7). Prüfpunkt 20 Teil 1 („grep '0': 'replay' → 0“) wird ersetzt: Taste 0 ohne freigeschaltetes Replay lässt location.hash unverändert, mit jy_features {"replay":true} führt sie zu #/replay.
