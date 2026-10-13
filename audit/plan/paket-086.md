# Paket 086 · notebook_news, einstellungen, barrierefreiheit, training

Schritte: 5 · Dateien: web/js/app.js, web/js/editor.js, web/js/screens/mentor.js, web/js/screens/misc.js, web/js/screens/notebook.js
Betroffene Tests laut Spezifikation: —
Baut auf Paketen auf: 11, 80, 81, 84

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

## barrierefreiheit-P10 · Aktion skip-content und Live-Regionen beim Start (bind) anlegen

Gruppe barrierefreiheit · Cluster barrierefreiheit · Aufwand S · Befunde: barrierefreiheit-31, bewegung-32, barrierefreiheit-38
Quelle: audit/spec/barrierefreiheit.md Z. 635–639 · Dateien: web/js/app.js
Abhängig von: barrierefreiheit-U4, barrierefreiheit-U7, barrierefreiheit-H1, barrierefreiheit-P1

```text
**P10 Sprunglink-Aktion und frühe Regionen**
- In `App.actions` (nach Z. 313): `'skip-content'() { const c = document.getElementById('content'); if (c) c.focus(); },`
- In `bind()` am Anfang: `U.toastWrap(); U.announce('');`
- Befunde: barrierefreiheit-31, bewegung-32, barrierefreiheit-38

```

## barrierefreiheit-C-mentor-83-111 · Mentor: role=log, Eingabe-Name, Ansagen über U.announce

Gruppe barrierefreiheit · Cluster training · Aufwand S · Befunde: barrierefreiheit-38, barrierefreiheit-37
Quelle: audit/spec/barrierefreiheit.md Z. 877–883 · Dateien: web/js/screens/mentor.js
Abhängig von: barrierefreiheit-U4, barrierefreiheit-U7, barrierefreiheit-P10

```text
#### `web/js/screens/mentor.js` (barrierefreiheit-38, barrierefreiheit-37)

- **Z. 83:** `<div class="mentor-log" id="mentor-log">` → zusätzlich `role="log"`
- **Z. 84:** Eingabe bekommt zusätzlich `aria-label="Nachricht an den Mentor"`
- **Z. 108:** nach `App.rerender();`: `U.announce(root.I18N ? root.I18N.t('Mentor schreibt …') : 'Mentor schreibt …');`
- **Z. 111:** nach dem Push der Antwort: `U.announce('Mentor: ' + String(r.reply || '').slice(0, 500));`

```
