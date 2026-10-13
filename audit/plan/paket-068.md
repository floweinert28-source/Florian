# Paket 068 · dashboard, barrierefreiheit, shell

Schritte: 4 · Dateien: web/js/app.js, web/js/widgets.js
Betroffene Tests laut Spezifikation: —
Baut auf Paketen auf: 6, 63, 65, 66

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## barrierefreiheit-P3 · Globaler Tastatur-Handler: Escape (requestClose, Menü-Rücksprung, closeSidebar), Enter/Leertaste auf role=button/checkbox, Pfeiltasten in Radiogruppen

Gruppe barrierefreiheit · Cluster barrierefreiheit · Aufwand M · Befunde: barrierefreiheit-3, barrierefreiheit-16, barrierefreiheit-12, barrierefreiheit-13, barrierefreiheit-26, barrierefreiheit-11, bereich_shell-12, barrierefreiheit-27, bereich_shell-15
Quelle: audit/spec/barrierefreiheit.md Z. 573–590 · Dateien: web/js/app.js
Abhängig von: barrierefreiheit-U3a, barrierefreiheit-U7, barrierefreiheit-P6

```text
**P3 Tastatur global** (Z. 285, ersetzt den Escape-Handler)
```js
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const op = document.querySelector('.popover.open:not(.closing)'); const trg = op && document.querySelector(`[data-pop="${CSS.escape(op.id.slice(4))}"]`); const back = !!(op && op.contains(document.activeElement));
    U.requestClose(); this.closePopovers(); if (back && trg) trg.focus({ preventScroll: true });
    if (this.state.sidebarOpen) this.closeSidebar();
    return;
  }
  /* Enter/Leertaste auf eigenen Knöpfen (div mit role=button/checkbox) wie ein Klick */
  if ((e.key === 'Enter' || e.key === ' ') && !e.repeat && !e.defaultPrevented) { const t = e.target; if (t && t.matches && t.matches('[role="button"], [role="checkbox"]') && !t.matches('button, a[href], input, select, textarea, summary, [contenteditable="true"]')) { e.preventDefault(); t.click(); return; } }
  /* Pfeiltasten in Auswahlgruppen: Fokus weiter; gewählt wird mit Enter/Leertaste */
  const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
  if (step && e.target.matches && e.target.matches('[role="radio"]')) { const g = e.target.closest('[role="radiogroup"]'); if (!g) return; const all = [...g.querySelectorAll('[role="radio"]:not([disabled])')]; const i = all.indexOf(e.target); if (i < 0) return; e.preventDefault(); all[(i + step + all.length) % all.length].focus(); }
});
```
Der Handler reagiert nur auf das Element selbst (`e.target`), nicht auf Knöpfe darin, etwa das Ordner-Menü im Notebook. Befunde: barrierefreiheit-3, barrierefreiheit-16, barrierefreiheit-12, barrierefreiheit-13, barrierefreiheit-26, barrierefreiheit-11, bereich_shell-12, barrierefreiheit-27, bereich_shell-15

```

## barrierefreiheit-P11 · Zeitraum- und Konto-Menü als Radiogruppen (role=radiogroup/radio)

Gruppe barrierefreiheit · Cluster shell · Aufwand S · Befunde: barrierefreiheit-26
Quelle: audit/spec/barrierefreiheit.md Z. 640–644 · Dateien: web/js/app.js
Abhängig von: barrierefreiheit-P3, barrierefreiheit-B6

```text
**P11 Zeitraum- und Konto-Menü** (Z. 239, 244)
- Z. 239: `<div class="rr-presets">` → `<div class="rr-presets" role="radiogroup" aria-label="Zeitraum">`. Jeder Eintrag bekommt zusätzlich `role="radio"`.
- Z. 244: die `.item`-Knöpfe (Alle Konten und die Konten) in `<div role="radiogroup" aria-label="Konto">…</div>` fassen, jeder mit `role="radio"`. `<hr>` und „Konten verwalten“ stehen danach außerhalb.
- Befunde: barrierefreiheit-26

```

## barrierefreiheit-C-widgets-115 · Kalendertag mit zugänglichem Namen (Datum · Betrag · Trades)

Gruppe barrierefreiheit · Cluster dashboard · Aufwand S · Befunde: barrierefreiheit-3
Quelle: audit/spec/barrierefreiheit.md Z. 726–726 · Dateien: web/js/widgets.js
Abhängig von: barrierefreiheit-P3

```text
| 115 Kalendertag | `role="button" tabindex="0"` ohne Name | zusätzlich `` aria-label="${esc(e ? `${fmt.dateFull(c.date)} · ${fmt.cur(e.pnl, { signed: true })} · ${e.n === 1 ? '1 Trade' : e.n + ' Trades'}` : fmt.dateFull(c.date))}" `` | barrierefreiheit-3 |
```

## barrierefreiheit-C-widgets-222-234 · Kennzahl-Suche benennen, Uhrzeit-Menü als Radiogruppe

Gruppe barrierefreiheit · Cluster dashboard · Aufwand S · Befunde: barrierefreiheit-37, barrierefreiheit-26
Quelle: audit/spec/barrierefreiheit.md Z. 729–730 · Dateien: web/js/widgets.js
Abhängig von: barrierefreiheit-P3

```text
| 222 Kennzahl-Suche | `<input class="input" id="rep-q" placeholder="Suchen" …>` | zusätzlich `aria-label="Kennzahl suchen"` | barrierefreiheit-37 |
| 234 Uhrzeit-Menü | `<div class="popover" id="pop-uhrzeit">` mit Einträgen `aria-checked` | `<div class="popover" id="pop-uhrzeit" role="radiogroup" aria-label="Uhrzeit">`, Einträge zusätzlich `role="radio"` | barrierefreiheit-26 |
```
