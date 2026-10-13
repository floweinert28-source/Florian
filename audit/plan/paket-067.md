# Paket 067 · training, trades_tag, einstellungen

Schritte: 5 · Dateien: web/e2e/notechecktest.js, web/js/screens/day.js, web/js/screens/misc.js, web/js/screens/progress.js
Betroffene Tests laut Spezifikation: web/e2e/notechecktest.js:14
Baut auf Paketen auf: 6, 65

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## barrierefreiheit-C-day-18 · Tages-Regelliste als <button role="checkbox" aria-checked>

Gruppe barrierefreiheit · Cluster trades_tag · Aufwand S · Befunde: barrierefreiheit-15, bereich_trades_tag-41, bereich_training-20
Quelle: audit/spec/barrierefreiheit.md Z. 762–767 · Dateien: web/js/screens/day.js
Abhängig von: barrierefreiheit-B5, barrierefreiheit-P1

```text
- **Z. 18:**
  - vorher: `<div class="it toggle ${…}" data-action="day-rule" data-day="${key}" data-rule="${r.id}">…</div>`
  - nachher: `<button type="button" class="it toggle ${followed.includes(r.id) ? 'done' : ''}" role="checkbox" aria-checked="${followed.includes(r.id)}" data-action="day-rule" data-day="${key}" data-rule="${r.id}">…</button>`
  - Die Fokus-Rückgabe nach `App.rerender()` übernimmt P1.
  - Befunde: barrierefreiheit-15, bereich_trades_tag-41, bereich_training-20

```

## barrierefreiheit-C-progress-73 · Fortschritt: Tages-Checkliste als <button role="checkbox"> (wie day.js:18)

Gruppe barrierefreiheit · Cluster training · Aufwand S · Befunde: barrierefreiheit-15, bereich_training-20
Quelle: audit/spec/barrierefreiheit.md Z. 768–770 · Dateien: web/js/screens/progress.js
Abhängig von: barrierefreiheit-B5, barrierefreiheit-P1, barrierefreiheit-C-day-18

```text
#### `web/js/screens/progress.js`

- **Z. 73:** wie day.js:18, mit `rule.id` (Befunde: barrierefreiheit-15, bereich_training-20)
```

## barrierefreiheit-C-progress-75 · „Dein Tag“: Aktionszeilen als Knopf, Tagesnotiz als role=checkbox; Heatmap bleibt

Gruppe barrierefreiheit · Cluster training · Aufwand S · Befunde: bereich_training-20, barrierefreiheit-15
Quelle: audit/spec/barrierefreiheit.md Z. 771–776 · Dateien: web/js/screens/progress.js
Abhängig von: barrierefreiheit-B5, barrierefreiheit-P1

```text
- **Z. 75 („Dein Tag“):**
  - Zeilen mit `it.action` (ohne href) werden `<button type="button" class="it toggle ${it.done ? 'done' : ''}" data-action="${it.action}">`. Für `day-note-check` kommt zusätzlich `role="checkbox" aria-checked="${!!it.done}"` dazu.
  - Zeilen mit href bleiben `<a>`, Zeilen ohne beides bleiben `<div class="it">` (z. B. „Regeln abgehakt“).
  - Befunde: bereich_training-20, barrierefreiheit-15
- **Z. 28 (Heatmap):** bleibt (siehe Zurückgestellt).

```

## barrierefreiheit-E-notechecktest-14 · notechecktest.js:14: Tagesnotiz-Zeile ist BUTTON mit role=checkbox

Gruppe barrierefreiheit · Cluster training · Aufwand S · Befunde: bereich_training-20
Quelle: audit/spec/barrierefreiheit.md Z. 903–903 · Dateien: web/e2e/notechecktest.js
Abhängig von: barrierefreiheit-C-progress-75

```text
| notechecktest.js:14 | `x.tagName === 'DIV'` | `x.tagName === 'BUTTON'` und `x.getAttribute('role') === 'checkbox'` |
```

## barrierefreiheit-C-misc-15 · Einstellungen switchRow: stabile id je Aufbau, Name aus Label, Beschreibung per aria-describedby

Gruppe barrierefreiheit · Cluster einstellungen · Aufwand S · Befunde: barrierefreiheit-29
Quelle: audit/spec/barrierefreiheit.md Z. 834–842 · Dateien: web/js/screens/misc.js
Abhängig von: barrierefreiheit-B4, barrierefreiheit-P1

```text
#### `web/js/screens/misc.js`

- **Z. 15 `switchRow`** (barrierefreiheit-29):
  - oben im Modul: `let swN = 0;`, und als erste Zeile in `App.screens.settings.render` (Z. 19) `swN = 0;` (stabile ids je Aufbau, sonst findet P1 den Schalter nicht wieder)
  - nachher:
    ```js
    const switchRow = (title, text, action, on, extra = '') => { const id = 'sw' + (++swN); return `<div class="set-row"><button type="button" class="switch" role="switch" id="${id}" aria-checked="${!!on}" data-action="${action}" ${extra} aria-describedby="${id}-d"></button><div><label for="${id}" class="set-row-l"><b>${esc(title)}</b></label><div class="small muted" id="${id}-d">${text}</div></div></div>`; };
    ```
    Das bisherige `aria-label` entfällt, der Name kommt aus dem Label. Eindeutig auch bei mehrfach genutzten Aktionen (`notif-toggle`, `navdot-toggle`).
```
