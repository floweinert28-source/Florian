# Paket 062 · barrierefreiheit, komponenten, notebook_news

Schritte: 4 · Dateien: web/js/app.js, web/js/editor.js, web/js/ui.js
Betroffene Tests laut Spezifikation: —
Baut auf Paketen auf: 7, 60

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

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: U.toast] zustaende-S-U6 übernimmt toastWrap() und toast() ganz. Der Container hat role=status und aria-live=polite. Dauer: min(7000, max(err ? 4500 : 2400, 1200 + Länge·55)) ms. Beim Darüberfahren hält der Toast an, nach dem Verlassen bleibt er noch 1500 ms. Ausgeblendet wird über Motion.leave mit '--dur-2', passend zu .toast.out. barrierefreiheit-U4 legt nur noch announce() mit #sr-live an, denn sein toastWrap ist Wort für Wort derselbe. Es gibt nur einen Namen: U.toastWrap (Export über barrierefreiheit-U7). Die Zeile toast.init = toastWrap entfällt. Beim Start wird genau einmal U.toastWrap() aufgerufen (barrierefreiheit-P10). Wo zustaende-S-A1 U.toast.init() vorsieht, steht U.toastWrap(); die Zusammenführung von P10 und S-A1 in App.bind regelt konflikt-1. Formularfehler laufen nicht über Toasts (P12 und komponenten-S-trades-h, siehe #trade-form und #f-dir). wording-S14.8-14.9 ruft U.toast unverändert auf.
- ÄNDERN: Nur announce(text) mit #sr-live (class "vh no-i18n", role=status, aria-live=polite) anlegen. toastWrap() und der Umbau von toast() entfallen, beides liefert zustaende-S-U6.
- [doppelt: toastWrap] Zwei identische Fassungen von toastWrap(). zustaende-S-U6 übernimmt, U4 legt nur announce() an. Einziger öffentlicher Name ist U.toastWrap, kein toast.init (Einzelheiten unter U.toast).
- [doppelt: .toast-wrap] Den Container legt zustaende-S-U6 an (siehe U.toast). zustaende-S-C6 setzt nur .toast { pointer-events: auto }, .toast-wrap behält pointer-events: none. Damit ist S-C6 verträglich und die Voraussetzung dafür, dass das Anhalten beim Darüberfahren in S-U6 funktioniert.

## barrierefreiheit-U7 · root.UI um toastWrap, announce, lightbox, requestClose ergänzen

Gruppe barrierefreiheit · Cluster komponenten · Aufwand S · Befunde: —
Quelle: audit/spec/barrierefreiheit.md Z. 516–518 · Dateien: web/js/ui.js
Abhängig von: barrierefreiheit-U3a, barrierefreiheit-U4, barrierefreiheit-U5

```text
**U7 Export** (Z. 464)
- `root.UI` um `toastWrap, announce, lightbox, requestClose` ergänzen.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: root.UI] Alle Schritte ergänzen verschiedene Namen im selben Export-Objekt, ohne Überschneidung. Endstand ergänzt: toastWrap, announce, lightbox, requestClose, vbarPath, hbarPath, xLabels, fitRadars, scoreText, count, chartEmpty, chartEmptyHTML, fieldErrors, clearFieldError, clearFieldErrors. barrierefreiheit-U7 exportiert toastWrap, darum muss die Funktion vorher aus zustaende-S-U6 da sein (sonst ReferenceError beim Laden von ui.js). Jeder Export kommt erst mit seiner Funktion.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: #main] main.inert wird nur einmal gesetzt, durch P5 (mob && open). 3.3c hat dafür keine eigene Zeile. Festlegung und Anweisungen stehen im Anker App.renderSidebar. P1 ist verträglich: restoreFocus überspringt Treffer in [inert], und renderSidebar läuft in render() vor restoreFocus. Beim Seitenwechsel aus der Schublade ist #main dadurch schon wieder bedienbar, bevor der Fokus auf #content geht.
- [reihenfolge: #sidebar] Inhaltlich verträglich. P5 macht die Gruppen zu div role="group", H2 macht das äußere Element zu <nav aria-label="Hauptnavigation">. H2 darf nicht vor P5 landen, sonst gibt es vorübergehend verschachtelte nav-Landmarken (am besten in einem Commit). P5 ruft this.popInit(sb) auf, das P1 anlegt, also kommt P1 zuerst. Für 3.3c gilt die Fassung aus dem Anker App.renderSidebar.
- [reihenfolge: #content] P1 macht #content mit tabindex="-1" fokussierbar, P10 legt die Aktion skip-content an, H1 setzt den Sprunglink. Ohne P10 würde der Link mit href="#content" die Route wechseln, denn parseRoute fällt auf das Dashboard zurück. Ohne P1 bliebe c.focus() wirkungslos. Reihenfolge P1 → P10 → H1, oder alles in einem Commit. S-TE2 (dashtest) prüft nur Text in #content und hängt nicht davon ab.
