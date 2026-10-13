# Paket 065 · barrierefreiheit, komponenten, notebook_news

Schritte: 4 · Dateien: web/js/app.js, web/js/editor.js, web/js/ui.js
Betroffene Tests laut Spezifikation: —
Baut auf Paketen auf: 63

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## barrierefreiheit-U4 · Live-Regionen: .toast-wrap role=status (toastWrap), #sr-live mit U.announce

Gruppe barrierefreiheit · Cluster barrierefreiheit · Aufwand S · Befunde: bewegung-32, barrierefreiheit-38
Quelle: audit/spec/barrierefreiheit.md Z. 464–473 · Dateien: web/js/ui.js
Abhängig von: —

```text
**U4 Live-Regionen** (Z. 444)
- vorher: `toast()` legt `.toast-wrap` beim ersten Toast an.
- nachher:
  ```js
  function toastWrap() { let w = document.querySelector('.toast-wrap'); if (!w) { w = document.createElement('div'); w.className = 'toast-wrap'; w.setAttribute('role', 'status'); w.setAttribute('aria-live', 'polite'); document.body.appendChild(w); } return w; }
  function toast(msg, kind = '') { const w = toastWrap(); /* … Rest wie bisher … */ }
  function announce(text) { let r = document.getElementById('sr-live'); if (!r) { r = document.createElement('div'); r.id = 'sr-live'; r.className = 'vh no-i18n'; r.setAttribute('role', 'status'); r.setAttribute('aria-live', 'polite'); document.body.appendChild(r); } r.textContent = ''; if (text) setTimeout(() => { r.textContent = text; }, 50); }
  ```
- Befunde: bewegung-32, barrierefreiheit-38

```

## barrierefreiheit-U7 · root.UI um toastWrap, announce, lightbox, requestClose ergänzen

Gruppe barrierefreiheit · Cluster komponenten · Aufwand S · Befunde: —
Quelle: audit/spec/barrierefreiheit.md Z. 516–518 · Dateien: web/js/ui.js
Abhängig von: barrierefreiheit-U3a, barrierefreiheit-U4, barrierefreiheit-U5

```text
**U7 Export** (Z. 464)
- `root.UI` um `toastWrap, announce, lightbox, requestClose` ergänzen.

```

## barrierefreiheit-C-editor-41-42 · Notizbild: Alt-Text aus Bildunterschrift, Doppelklick öffnet U.lightbox

Gruppe barrierefreiheit · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-35, barrierefreiheit-17
Quelle: audit/spec/barrierefreiheit.md Z. 734–737 · Dateien: web/js/editor.js
Abhängig von: barrierefreiheit-U5, barrierefreiheit-U7

```text
#### `web/js/editor.js`

- Z. 41 nach `cap.value = v.caption || '';`: `const altOf = () => cap.value || (root.I18N ? root.I18N.t('Bild in der Notiz') : 'Bild in der Notiz'); img.alt = altOf();`. Der input-Listener der Bildunterschrift wird zu `cap.addEventListener('input', () => { img.alt = altOf(); dirty(node); });`
- Z. 42: `img.addEventListener('dblclick', () => { const lb = …; document.body.appendChild(lb); });` → `img.addEventListener('dblclick', () => U.lightbox(img.src, img.alt));`
```

## barrierefreiheit-P1 · Fokus über Neuaufbau und Seitenwechsel halten (focusSnapshot, restoreFocus, popInit, #content tabindex=-1)

Gruppe barrierefreiheit · Cluster barrierefreiheit · Aufwand L · Befunde: barrierefreiheit-2, barrierefreiheit-31, bereich_dashboard-22, barrierefreiheit-26
Quelle: audit/spec/barrierefreiheit.md Z. 530–564 · Dateien: web/js/app.js
Abhängig von: barrierefreiheit-B2

```text
#### `web/js/app.js`

**P1 Fokus über Neuaufbau und Seitenwechsel** (`render`, Z. 76–110)

Neue Methoden im App-Objekt:
```js
focusSnapshot() {
  const a = document.activeElement; if (!a || a === document.body) return { body: true };
  const host = a.closest('#main') ? 'main' : a.closest('#sidebar') ? 'sidebar' : null; if (!host) return null;
  const sel = this.anchorKey(a) || (a.dataset && a.dataset.pop ? `[data-pop="${CSS.escape(a.dataset.pop)}"]` : null) || (a.matches('a[href]') ? `a[href="${CSS.escape(a.getAttribute('href'))}"]` : null) || (a.id && a.id !== 'content' ? '#' + CSS.escape(a.id) : null);
  let s = null, e = null; try { s = a.selectionStart; e = a.selectionEnd; } catch (_) { /* Feldtyp ohne Auswahl */ }
  return { host, sel, s, e };
},
restoreFocus(fs, routeChanged) {
  if (!fs || !this._rendered) return; const a = document.activeElement; if (a && a !== document.body) return; /* mount hat Vorrang */
  const content = document.getElementById('content');
  if (routeChanged) { if (content) content.focus({ preventScroll: true }); return; }
  if (fs.body) return;
  const box = document.getElementById(fs.host); const hits = box && fs.sel ? box.querySelectorAll(fs.sel) : [];
  const el = hits.length === 1 && hits[0].getClientRects().length && !hits[0].closest('[inert]') ? hits[0] : null;
  if (el) { el.focus({ preventScroll: true }); if (fs.s != null && el.setSelectionRange) try { el.setSelectionRange(fs.s, fs.e); } catch (_) { /* nicht unterstützt */ } }
  else if (content && fs.host === 'main') content.focus({ preventScroll: true });
},
popInit(scope) { scope.querySelectorAll('[data-pop]').forEach(b => { if (!b.hasAttribute('aria-expanded')) b.setAttribute('aria-expanded', 'false'); if (!b.hasAttribute('aria-controls')) b.setAttribute('aria-controls', 'pop-' + b.dataset.pop); }); },
```

In `render`:
- vor Z. 96: `const fs = this.focusSnapshot();`
- Z. 96: `id="content"` → `id="content" tabindex="-1"`
- nach Z. 97 (`translateNow`): `this.popInit(main);`
- Z. 106: nach `screen.mount(main, ctx)` erneut `this.popInit(main);` (Editor-Werkzeugleiste entsteht erst dort)
- nach Z. 109: `this.restoreFocus(fs, routeChanged); this._rendered = true;`

Befunde: barrierefreiheit-2, barrierefreiheit-31, bereich_dashboard-22, barrierefreiheit-26

```
