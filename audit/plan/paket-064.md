# Paket 064 · trades_tag, shell, komponenten

Schritte: 4 · Dateien: web/app.html, web/e2e/dptest.js, web/js/app.js
Betroffene Tests laut Spezifikation: web/e2e/dptest.js:92
Baut auf Paketen auf: 6, 61, 63

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## barrierefreiheit-H1 · Sprunglink „Zum Inhalt springen“ als erstes Kind von .shell

Gruppe barrierefreiheit · Cluster shell · Aufwand S · Befunde: barrierefreiheit-31, bereich_shell-14
Quelle: audit/spec/barrierefreiheit.md Z. 519–524 · Dateien: web/app.html
Abhängig von: barrierefreiheit-B2

```text
#### `web/app.html`

**H1 Sprunglink** (Z. 18, erstes Kind von `<div class="shell">`)
- nachher: `<a class="skip" href="#content" data-action="skip-content">Zum Inhalt springen</a>`
- Befunde: barrierefreiheit-31, bereich_shell-14

```

## barrierefreiheit-P12 · Trade-Dialog: novalidate, eigene Pflichtfeld-Prüfung mit aria-invalid und Fokus, Punktwert-(i) aus dem Label, guard

Gruppe barrierefreiheit · Cluster trades_tag · Aufwand M · Befunde: wording-1, barrierefreiheit-11, barrierefreiheit-18, bereich_statistik-31
Quelle: audit/spec/barrierefreiheit.md Z. 645–663 · Dateien: web/js/app.js
Abhängig von: barrierefreiheit-B3, barrierefreiheit-B11, barrierefreiheit-U1, barrierefreiheit-U3a, barrierefreiheit-P4

```text
**P12 Trade-Dialog** (Z. 348–373, 398–400, 475–479)
- Z. 348: `<form id="trade-form" class="tf" data-action="save-trade" …>` → `<form id="trade-form" class="tf" novalidate data-action="save-trade" …>` (`required` an 354, 356, 359 bleibt als Semantik)
- Z. 363 vorher: `<div class="field"><label for="f-mult">Punktwert ${U.info('…')}</label><input …>`
  nachher: `<div class="field"><div class="lbl-row"><label for="f-mult">Punktwert</label>${U.info('…')}</div><input …>`
- Z. 369: Optionen um `guard: true` ergänzen. Im `onMount` ergänzen: `el.addEventListener('input', e => { if (e.target.removeAttribute) e.target.removeAttribute('aria-invalid'); });`
- Z. 398 (`pick`) nach `btn.classList.remove('sym-none');`: `btn.removeAttribute('aria-invalid');`
- Z. 476 (`save-trade`) Prüfung ersetzen:
  ```js
  const t = App.readTradeForm(form);
  const bad = (sel, msg) => { const f = form.querySelector(sel); if (f) { f.setAttribute('aria-invalid', 'true'); f.focus(); } return U.toast(msg, 'err'); };
  if (!t.symbol) return bad('#f-symbol-btn', 'Symbol fehlt');
  if ('direction' in t && !t.direction) { const sw = form.querySelector('#f-dir'); if (sw) { sw.classList.remove('need'); void sw.offsetWidth; sw.classList.add('need'); sw.querySelector('button')?.focus(); } return U.toast('Long oder Short wählen', 'err'); }
  if (t.entryPrice == null) return bad('#f-entry', 'Einstieg fehlt');
  if (!(t.quantity > 0)) return bad('#f-qty', 'Kontrakte fehlen');
  if (!form.querySelector('#f-open').value) return bad('#f-open', 'Eröffnet fehlt'); /* roh prüfen: readTradeForm setzt leer still auf „jetzt“ */
  if (t.closedAt && t.exitPrice == null) return bad('#f-exit', 'Ausstieg fehlt');
  ```
- Befunde: wording-1, barrierefreiheit-11, barrierefreiheit-18, bereich_statistik-31

```

## barrierefreiheit-E-dptest-92 · dptest.js:92: zweites Escape zeigt „Änderungen verwerfen?“, dann [data-confirm]

Gruppe barrierefreiheit · Cluster komponenten · Aufwand S · Befunde: barrierefreiheit-11
Quelle: audit/spec/barrierefreiheit.md Z. 908–908 · Dateien: web/e2e/dptest.js
Abhängig von: barrierefreiheit-U3a, barrierefreiheit-U3b, barrierefreiheit-P4, barrierefreiheit-P12

```text
| dptest.js:92 | „Zweites Escape schließt den Dialog“ | Das Feld wurde geändert (Z. 70–80). Zweites Escape zeigt „Änderungen verwerfen?“, dann Klick auf `[data-confirm]`, danach `!document.querySelector('.modal-bg')` |
```

## barrierefreiheit-P14b · Rückfrage (guard: true) für Session starten, Check-in, Session beenden

Gruppe barrierefreiheit · Cluster trades_tag · Aufwand S · Befunde: barrierefreiheit-11
Quelle: audit/spec/barrierefreiheit.md Z. 676–678 · Dateien: web/js/app.js
Abhängig von: barrierefreiheit-U3a, barrierefreiheit-P4

```text
- Z. 490 (`openSessionStart`): `U.modal(`…`)` → `U.modal(`…`, { guard: true })`
- Z. 524 (`openCheckIn`): `{ cls: 'narrow' }` → `{ cls: 'narrow', guard: true }`
- Z. 529 (`openSessionEnd`): `{ guard: true }` ergänzen
```
