# Paket 063 · komponenten, notebook_news, konto, barrierefreiheit

Schritte: 6 · Dateien: web/css/app.css, web/js/screens/coach.js, web/js/screens/notebook.js, web/js/ui.js
Betroffene Tests laut Spezifikation: —
Baut auf Paketen auf: 62

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## barrierefreiheit-C-notebook-74-teilen · Notebook „Teilen“: .hide-m → .vh-m

Gruppe barrierefreiheit · Cluster notebook_news · Aufwand S · Befunde: bereich_konto-11
Quelle: audit/spec/barrierefreiheit.md Z. 800–801 · Dateien: web/js/screens/notebook.js
Abhängig von: barrierefreiheit-B1

```text
  - `<span class="hide-m">Teilen</span>` → `<span class="vh-m">Teilen</span>` (Befund: bereich_konto-11, gleiches Muster)

```

## barrierefreiheit-C-coach-42-157 · Coach: .hide-m → .vh-m (Namen am Handy behalten)

Gruppe barrierefreiheit · Cluster konto · Aufwand S · Befunde: bereich_konto-11
Quelle: audit/spec/barrierefreiheit.md Z. 789–791 · Dateien: web/js/screens/coach.js
Abhängig von: barrierefreiheit-B1

```text
#### `web/js/screens/coach.js`

- **Z. 42, 121 (2×), 157:** `<span class="hide-m">…</span>` → `<span class="vh-m">…</span>` (Befund: bereich_konto-11)
```

## barrierefreiheit-B2 · Sprunglink-Stil .skip und programmatische Fokusflächen ohne Ring (#content, .modal, .lightbox)

Gruppe barrierefreiheit · Cluster barrierefreiheit · Aufwand S · Befunde: barrierefreiheit-31, bereich_shell-14, barrierefreiheit-2, barrierefreiheit-1, barrierefreiheit-8, barrierefreiheit-17
Quelle: audit/spec/barrierefreiheit.md Z. 287–295 · Dateien: web/css/app.css
Abhängig von: —

```text
**B2 Sprunglink und programmatische Fokusflächen** (nach `.vh`, Z. 1330)
- nachher:
  ```css
  .skip { position: fixed; left: 16px; top: -48px; z-index: 200; padding: 8px 12px; border-radius: 10px; background: var(--surface-2); border: 1px solid var(--border-2); color: var(--text); font-size: 13.5px; font-weight: 500; }
  .skip:focus { top: 12px; }
  #content:focus, .modal:focus, .lightbox:focus { outline: none; }
  ```
- Befunde: barrierefreiheit-31, bereich_shell-14, barrierefreiheit-2, barrierefreiheit-1, barrierefreiheit-8, barrierefreiheit-17

```

## barrierefreiheit-U3a · Dialog-Gerüst: Selbstfokus, .shell inert, aria-labelledby, Fokus-Rückgabe (restoreAfterModal), guard/requestClose

Gruppe barrierefreiheit · Cluster komponenten · Aufwand L · Befunde: barrierefreiheit-1, barrierefreiheit-8, barrierefreiheit-9, barrierefreiheit-10, barrierefreiheit-11, bereich_prop-39
Quelle: audit/spec/barrierefreiheit.md Z. 413–454 · Dateien: web/js/ui.js
Abhängig von: barrierefreiheit-B2

```text
**U3 Dialog-Gerüst** (Z. 428–449)

`modal()` ersetzen:
```js
const modals = []; let modalSeq = 0;
function modal(html, o = {}) {
  const act = document.activeElement; const ret = act && act !== document.body ? act : null;
  const retKey = ret && root.App && root.App.anchorKey ? root.App.anchorKey(ret) : null;
  const bg = document.createElement('div'); bg.className = 'modal-bg';
  bg.innerHTML = `<div class="modal ${o.cls || ''}" role="dialog" aria-modal="true" tabindex="-1">${html}</div>`;
  document.body.appendChild(bg); const dlg = bg.firstElementChild; const entry = { bg, o, ret, retKey }; modals.push(entry);
  document.body.style.overflow = 'hidden'; const sh = document.querySelector('.shell'); if (sh) sh.inert = true;
  const h = dlg.querySelector('.modal-head h2'); if (h) { h.id = h.id || 'mh-' + (++modalSeq); dlg.setAttribute('aria-labelledby', h.id); }
  bg.addEventListener('mousedown', e => { if (e.target === bg && !o.locked) requestClose(); });
  if (o.onMount) o.onMount(dlg);
  if (o.guard) { const form = dlg.querySelector('form'); const snap = () => form ? JSON.stringify([[...new FormData(form)].filter(([, v]) => typeof v === 'string'), [...form.querySelectorAll('[aria-pressed]')].map(b => b.getAttribute('aria-pressed'))]) : ''; const start = snap(); entry.dirty = () => snap() !== start; }
  /* Anfangsfokus: [data-autofocus] oder der Dialog selbst; nie das ×, nie automatisch ein Feld (o.noFocus ist damit Standard) */
  setTimeout(() => { if (!dlg.isConnected || dlg.contains(document.activeElement)) return; (dlg.querySelector('[data-autofocus]') || dlg).focus({ preventScroll: true }); }, 30);
  return dlg;
}
```

`closeModal()` am Ende ergänzen und `restoreAfterModal()` neu:
```js
  if (!modals.length) { document.body.style.overflow = ''; const sh = document.querySelector('.shell'); if (sh) sh.inert = false; }
  const x0 = m[0]; if (x0) setTimeout(() => restoreAfterModal(x0), 0); /* nach dem synchronen App.rerender() */
}
function restoreAfterModal(x0) {
  const top = modals[modals.length - 1]; const a = document.activeElement;
  if (a && a !== document.body && !a.closest('.modal-bg.out')) return; /* jemand hat den Fokus schon gesetzt (Seitenwechsel, Mentor-Eingabe) */
  const ok = e => e && e.isConnected && e.getClientRects().length > 0 && !e.closest('[inert], .modal-bg.out');
  let el = ok(x0.ret) ? x0.ret : null;
  if (!el && !top && x0.retKey) { const hits = document.querySelectorAll('#main ' + x0.retKey + ', #sidebar ' + x0.retKey); if (hits.length === 1 && ok(hits[0])) el = hits[0]; }
  if (!el) el = top ? top.bg.firstElementChild : document.getElementById('content');
  if (el) el.focus({ preventScroll: true });
}
function requestClose() {
  const top = modals[modals.length - 1]; if (!top) return;
  if (top.o.guard && top.dirty && top.dirty()) { confirmModal('Änderungen verwerfen?', 'Deine Eingaben in diesem Fenster gehen verloren.', { ok: 'Verwerfen', danger: true }).then(ok => { if (ok) closeModal(); }); return; }
  closeModal();
}
```
```

## barrierefreiheit-U3b · Bestätigung und Download: data-autofocus auf sicherer Wahl bzw. „Fertig“

Gruppe barrierefreiheit · Cluster komponenten · Aufwand S · Befunde: komponenten-43, barrierefreiheit-1, barrierefreiheit-8
Quelle: audit/spec/barrierefreiheit.md Z. 455–463 · Dateien: web/js/ui.js
Abhängig von: barrierefreiheit-U3a

```text

`confirmModal` (Z. 447):
- Fuß-„Abbrechen“ → `<button type="button" class="btn" data-close${o.danger ? ' data-autofocus' : ''}>Abbrechen</button>`
- Bestätigung → `<button type="button" class="btn …" data-confirm${o.danger ? '' : ' data-autofocus'}>`

`downloadText` (Z. 458): Fertig → `<button type="button" class="btn primary" data-close data-autofocus>Fertig</button>`.

Befunde: barrierefreiheit-1, barrierefreiheit-8, barrierefreiheit-9, barrierefreiheit-10, barrierefreiheit-11, bereich_prop-39, komponenten-43

```

## barrierefreiheit-U5 · Gemeinsame Bildansicht U.lightbox (role=dialog, Fokus, Escape, Fokus-Rückgabe)

Gruppe barrierefreiheit · Cluster komponenten · Aufwand S · Befunde: barrierefreiheit-17, bereich_trades_tag-41, bereich_notebook_news-35
Quelle: audit/spec/barrierefreiheit.md Z. 474–487 · Dateien: web/js/ui.js
Abhängig von: barrierefreiheit-B2

```text
**U5 Bildansicht** (neu, nach `downloadText`)
```js
function lightbox(src, alt) {
  const back = document.activeElement; const lb = document.createElement('div');
  lb.className = 'lightbox'; lb.tabIndex = -1; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', alt || 'Screenshot');
  lb.innerHTML = `<img src="${esc(src)}" alt="${esc(alt || '')}">`;
  const close = () => { lb.remove(); if (back && back.isConnected) back.focus({ preventScroll: true }); };
  lb.addEventListener('click', close);
  lb.addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); } });
  document.body.appendChild(lb); lb.focus({ preventScroll: true }); return lb;
}
```
Befunde: barrierefreiheit-17, bereich_trades_tag-41, bereich_notebook_news-35

```
