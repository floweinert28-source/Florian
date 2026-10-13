# Paket 014 · dashboard, shell

Schritte: 26 · Dateien: web/css/app.css, web/js/screens/dash-filter.js, web/js/screens/dashboard.js, web/js/widgetpreviews.js, web/js/widgets.js
Betroffene Tests laut Spezifikation: prüfen: e2e/dashtest.js:23, :110; web/e2e/dashtest.js; web/e2e/dashtest.js (Bearbeitungsmodus); web/e2e/dashtest.js:67; web/e2e/filtertest.js, web/e2e/headtest.js (data-action bleibt, prüfen); web/e2e/langtest.js (aria-label); web/e2e/mobiletest.js:20 (Kacheln zwei Spalten); web/e2e/mobiletest.js:33 (Gewinn/Verlust-Kachel); web/e2e/mobiletest.js:72; web/e2e/mobiletest.js:72 (Letzte Trades)
Baut auf Paketen auf: 6, 7, 12, 13

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## farbe-C19b · Filter-Knopf: Klasse is-set statt accent, aria-label „Filter ({0} aktiv)“

Gruppe farbe · Cluster shell · Aufwand S · Befunde: referenz-7
Quelle: audit/spec/farbe.md Z. 471–471 · Dateien: web/js/screens/dashboard.js
Abhängig von: farbe-B25

```text
- Z. 124 `<button type="button" class="btn ${fN ? 'accent' : ''}" data-action="dash-f-open" aria-label="Filter">` → `<button type="button" class="btn${fN ? ' is-set' : ''}" data-action="dash-f-open" aria-label="${fN ? `Filter (${fN} aktiv)` : 'Filter'}">` (Zähler `.cntb` unverändert)
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .btn.accent] .btn.accent steht nur noch für „Trade loggen“ (App.newTradeButton `.btn.accent.tl` und der runde Handy-Knopf). Aktiver Dashboard-Filter: Klasse `is-on`. So steht es in zustaende-S-D2/-S-C7, kollisionsfrei und im gemeinsamen Ausgewählt-Stil. farbe-C19b/-B25 nennen denselben Zustand `.dh-context .btn.is-set`; das entfällt. Das aria-label „Filter ({0} aktiv)“ aus farbe-C19b bleibt. TradeLog-Leerzustand „Trade loggen“: neutral `btn sm` (komponenten-S-trades-b). Gründe: Die Kopfreihe trägt „Trade loggen“ schon, die Farbe-Spezifikation selbst verlangt „1 je Ansicht“, BRIEF spricht von dem einen Hauptknopf, und Leerzustand-Aktionen sind btn sm. „Trade für diesen Tag“ entfällt (wording-S8.1-8.2). Damit ist jedes .btn.accent ein Hauptknopf: `.btn.accent` font-weight 600 → 700 direkt, ohne eigene Regel `.btn.accent.tl`; die wäre eine wirkungslose Doppelregel. Der aktive Filter (is-on) bleibt 500 wie jeder Knopf, also nicht fetter.
- ÄNDERN: Klasse `is-on` statt `is-set` verwenden; die Klasse setzt zustaende-S-D2. Hier nur das aria-label „Filter ({0} aktiv)“ bzw. „Filter“ ergänzen, mit Übersetzungen.

## barrierefreiheit-C-widgets-36 · Serien-Pillen (streakPills) mit role=img, aria-label und Tooltip

Gruppe barrierefreiheit · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-40
Quelle: audit/spec/barrierefreiheit.md Z. 719–723 · Dateien: web/js/widgets.js
Abhängig von: —

```text
#### `web/js/widgets.js`

| Zeile | vorher | nachher | Befunde |
|---|---|---|---|
| 36 `streakPills` | `<span class="pills col">` | `` const u = root.I18N ? root.I18N.t(unit) : unit; const lab = (root.I18N ? root.I18N.t('Längste Verlustserie: {0} · Längste Gewinnserie: {1}', [`${maxL} ${u}`, `${maxW} ${u}`]) : `Längste Verlustserie: ${maxL} ${u} · Längste Gewinnserie: ${maxW} ${u}`); `` und `<span class="pills col" role="img" aria-label="${esc(lab)}" data-tip="${esc(lab)}">` | bereich_dashboard-40 |
```

## barrierefreiheit-C-widgets-170-174 · Trefferquote-Pillen (Trades und Tage) mit role=img, aria-label und Tooltip

Gruppe barrierefreiheit · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-40
Quelle: audit/spec/barrierefreiheit.md Z. 727–728 · Dateien: web/js/widgets.js
Abhängig von: —

```text
| 170 Trade-Trefferquote | `<span class="pills">` | `<span class="pills" role="img" aria-label="${s.wins} Gewinner · ${s.be} Break-even · ${s.losses} Verlierer" data-tip="${s.wins} Gewinner · ${s.be} Break-even · ${s.losses} Verlierer">` | bereich_dashboard-40 |
| 174 Tages-Trefferquote | `<span class="pills">` | ebenso mit `${ds.winDays} Gewinntage · ${be} Break-even-Tage · ${ds.lossDays} Verlusttage` | bereich_dashboard-40 |
```

## barrierefreiheit-C-widgets-256 · Widget „Letzte Trades“: Link in der ersten Zelle

Gruppe barrierefreiheit · Cluster dashboard · Aufwand S · Befunde: zustaende-36, barrierefreiheit-4
Quelle: audit/spec/barrierefreiheit.md Z. 731–731 · Dateien: web/js/widgets.js
Abhängig von: barrierefreiheit-B7

```text
| 256 Letzte Trades | `<td>${fmt.dateFull(…)}</td>` | `<td><a class="row-link" href="#/trades/${t.id}">${fmt.dateFull(tab === 'open' ? t.open : t.close)}</a></td>` | zustaende-36, barrierefreiheit-4 |
```

## barrierefreiheit-C-widgets-374 · Mentor-Widget: Eingabe „Frage an den Mentor“ benennen

Gruppe barrierefreiheit · Cluster dashboard · Aufwand S · Befunde: barrierefreiheit-37
Quelle: audit/spec/barrierefreiheit.md Z. 732–733 · Dateien: web/js/widgets.js
Abhängig von: —

```text
| 374 Mentor-Widget | `<textarea class="input" name="q" …>` | zusätzlich `aria-label="Frage an den Mentor"` | barrierefreiheit-37 |

```

## barrierefreiheit-C-dashboard-30-32 · Vorlagen-Menü: aktive Vorlage aria-current="true"

Gruppe barrierefreiheit · Cluster dashboard · Aufwand S · Befunde: barrierefreiheit-26
Quelle: audit/spec/barrierefreiheit.md Z. 802–804 · Dateien: web/js/screens/dashboard.js
Abhängig von: barrierefreiheit-B6

```text
#### `web/js/screens/dashboard.js`

- **Z. 30–32 (Vorlagen-Menü):** am Knopf `item name` der aktiven Vorlage `aria-current="true"` ergänzen (Befund: barrierefreiheit-26)
```

## barrierefreiheit-C-dashboard-78 · Widget-Suche „Widget suchen“ benennen

Gruppe barrierefreiheit · Cluster dashboard · Aufwand S · Befunde: barrierefreiheit-37
Quelle: audit/spec/barrierefreiheit.md Z. 806–806 · Dateien: web/js/screens/dashboard.js
Abhängig von: —

```text
- **Z. 78:** Widget-Suche bekommt zusätzlich `aria-label="Widget suchen"` (Befund: barrierefreiheit-37)
```

## barrierefreiheit-C-dashboard-124 · Filter-Knopf: aria-expanded und aria-controls="fd-pop"

Gruppe barrierefreiheit · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-22, barrierefreiheit-5
Quelle: audit/spec/barrierefreiheit.md Z. 807–807 · Dateien: web/js/screens/dashboard.js
Abhängig von: —

```text
- **Z. 124 Filter-Knopf:** zusätzlich `aria-expanded="false" aria-controls="fd-pop"` (Befunde: bereich_dashboard-22, barrierefreiheit-5)
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: #fd-pop] Ein gemeinsames close() in dash-filter.js. Es blendet das Fenster aus (bewegung) und setzt aria-expanded, bei ×, Escape und Anwenden geht der Fokus zurück (barrierefreiheit): function close(ret) { const u = ui(); const was = u.open; u.open = false; u.draft = null; u.pick = null; const pop = document.getElementById('fd-pop'); if (pop) { pop.removeAttribute('id'); const Mo = root.Motion; if (Mo && Mo.enabled) Mo.leave(pop, 'closing', '--dur-1', () => pop.remove()); else pop.remove(); } const b = document.querySelector('[data-action="dash-f-open"]'); if (b) { b.setAttribute('aria-expanded', 'false'); if (ret === true && was) b.focus({ preventScroll: true }); } } Dazu wie bei barrierefreiheit: hashchange → () => close(), Escape → close(true), 'dash-f-close' → close(true), 'dash-f-apply' → close(); App.rerender(); danach Fokus auf den Filter-Knopf. Das Ausblenden setzt kein #fd-layer.innerHTML = '' mehr. .fd-pop.closing (pointer-events: none) aus dem CSS-Teil von bewegung verhindert Klicks ins ausblendende Fenster. Die Tab-Falle (#fd-pop …) sieht das Fenster ohne ID nicht mehr. aria-controls="fd-pop" (C-dashboard-124) und der 16-px-Rand am Handy in place() (responsiv-3.5) sind verträglich.

## barrierefreiheit-C-dashboard-154 · Ziehgriff per Pfeiltasten verschieben (bindDnD), Fokus auf neuen Griff

Gruppe barrierefreiheit · Cluster dashboard · Aufwand S · Befunde: barrierefreiheit-48
Quelle: audit/spec/barrierefreiheit.md Z. 808–813 · Dateien: web/js/screens/dashboard.js
Abhängig von: —

```text
- **Z. 154 (`bindDnD`)** nach den mousedown/mouseup-Listenern:
  ```js
  h.addEventListener('keydown', ev => { const d = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[ev.key]; if (!d) return; ev.preventDefault(); const b = w.querySelector(`.mv [data-dir="${d}"]`); if (!b || b.disabled) return; const area = w.dataset.area, to = Number(w.dataset.idx) + d; b.click(); const nh = main.querySelector(`.w[data-area="${area}"][data-idx="${to}"] .handle`); if (nh) nh.focus({ preventScroll: true }); });
  ```
  `click()` löst `dash-move` auch auf den am Desktop ausgeblendeten `.mv`-Knöpfen aus (Befund: barrierefreiheit-48).

```

## barrierefreiheit-C-dashboard-41 · Ziehgriff: aria-keyshortcuts für Pfeiltasten

Gruppe barrierefreiheit · Cluster dashboard · Aufwand S · Befunde: barrierefreiheit-48
Quelle: audit/spec/barrierefreiheit.md Z. 805–805 · Dateien: web/js/screens/dashboard.js
Abhängig von: barrierefreiheit-C-dashboard-154

```text
- **Z. 41 Ziehgriff:** `aria-label="Verschieben"` → `aria-label="Verschieben" aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown"` (Befund: barrierefreiheit-48)
```

**Hinweise aus der Abstimmung (verbindlich):**

- ÄNDERN: Am Ziehgriff nur `aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown"` ergänzen. Das aria-label bleibt das aus aufbau-C6b (Widget „{Name}“ verschieben) und wird nicht auf „Verschieben“ zurückgesetzt.

## barrierefreiheit-C-dash-filter-95-121 · Filter-Fenster: Suchfeld-, Umschalter- und Sterne-Namen

Gruppe barrierefreiheit · Cluster dashboard · Aufwand S · Befunde: barrierefreiheit-37, barrierefreiheit-13
Quelle: audit/spec/barrierefreiheit.md Z. 814–818 · Dateien: web/js/screens/dash-filter.js
Abhängig von: —

```text
#### `web/js/screens/dash-filter.js` (barrierefreiheit-5, bereich_dashboard-22, barrierefreiheit-13, barrierefreiheit-37)

- **Z. 95:** `<input class="input" id="fd-q" placeholder="Suchen …" …>` → zusätzlich `aria-label="${PICK_LABEL[key]} suchen"`
- **Z. 103 `toggles`:** `opts.map(([v, l]) => …${l}</button>)` → `` opts.map(([v, l, a]) => `<button … ${a ? `aria-label="${a}" ` : ''}…>${l}</button>`) ``
- **Z. 121:** `[n, '★'.repeat(n)]` → `` [n, '★'.repeat(n), n === 1 ? '1 Stern' : `${n} Sterne`] ``
```

## barrierefreiheit-C-dash-filter-158 · Filter-Fenster: Fokus beim Umschalten halten (refresh)

Gruppe barrierefreiheit · Cluster dashboard · Aufwand S · Befunde: barrierefreiheit-5, bereich_dashboard-22
Quelle: audit/spec/barrierefreiheit.md Z. 819–821 · Dateien: web/js/screens/dash-filter.js
Abhängig von: —

```text
- **Z. 158–165 `refresh`:**
  - vor `body.innerHTML = …`: `const fa = document.activeElement; const fk = fa && l.contains(fa) ? App.anchorKey(fa) : null; const fkey = fa && fa.dataset ? fa.dataset.key : null;`
  - am Ende: `` if (!focusQ && fk) { const t = l.querySelector(fk) || (fkey ? l.querySelector(`[data-action="dash-f-pick"][data-key="${fkey}"]`) : null); if (t) t.focus({ preventScroll: true }); } ``
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: #fd-layer] close() vereint beide Fassungen: `function close(ret) { const u = ui(); const was = u.open; u.open = false; u.draft = null; u.pick = null; const pop = document.getElementById('fd-pop'); if (pop) { pop.removeAttribute('id'); pop.inert = true; const Mo = root.Motion; if (Mo && Mo.enabled) Mo.leave(pop, 'closing', '--dur-1', () => pop.remove()); else pop.remove(); } const b = document.querySelector('[data-action="dash-f-open"]'); if (b) { b.setAttribute('aria-expanded', 'false'); if (ret === true && was) b.focus({ preventScroll: true }); } }`. Die Funktion kehrt nicht vorzeitig zurück, denn aria-expanded muss immer zurückgesetzt werden. `l.innerHTML = ''` entfällt, weil es das Ausblenden abschneiden würde. `inert` verhindert, dass ein Tastendruck im ausblendenden Fenster 'dash-f-apply' mit u.draft = null auslöst; gegen Klicks schützt schon `.fd-pop.closing { pointer-events: none }`. Die übrigen Teile von 168-189 bleiben: hashchange mit `() => close()`, Escape und × mit `close(true)`, Fokus nach „Anwenden“, Tab-Falle auf #fd-layer mit `#fd-pop`-Selektoren (sie übergeht das ausblendende Fenster ohne ID). barrierefreiheit-158 ist unabhängig, weil refresh bei u.open = false abbricht. responsiv-3.5 ändert in place() nur die Handy-Breite (vw − 32) und den linken Rand (16 px) und ist ebenfalls unabhängig. Die bewegung-Prüfung „40 ms nach Escape .fd-pop.closing, nach 250 ms #fd-layer leer“ bleibt erfüllt.

## barrierefreiheit-C-dash-filter-168-189 · Filter-Fenster: Fokus beim Öffnen, Tab-Falle, Rücksprung nur nach ×/Escape/Anwenden, hashchange gekapselt

Gruppe barrierefreiheit · Cluster dashboard · Aufwand M · Befunde: barrierefreiheit-5, bereich_dashboard-22
Quelle: audit/spec/barrierefreiheit.md Z. 822–833 · Dateien: web/js/screens/dash-filter.js
Abhängig von: barrierefreiheit-C-dashboard-124

```text
- **Z. 168 `open`** nach `place();`:
  ```js
  const b = document.querySelector('[data-action="dash-f-open"]'); if (b) b.setAttribute('aria-expanded', 'true');
  const l = layer(); if (!l._trap) { l._trap = true; l.addEventListener('keydown', e => { if (e.key !== 'Tab') return; const f = [...l.querySelectorAll('#fd-pop button:not([disabled]), #fd-pop input, #fd-pop select')].filter(x => x.getClientRects().length); if (!f.length) return; const i = f.indexOf(document.activeElement); if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); } }); }
  const g = document.querySelector('#fd-pop .fd-gh'); if (g) g.focus({ preventScroll: true });
  ```
- **Z. 169 `close`:** `function close(ret) { const u = ui(); const was = u.open; u.open = false; u.draft = null; u.pick = null; const l = document.getElementById('fd-layer'); if (l) l.innerHTML = ''; const b = document.querySelector('[data-action="dash-f-open"]'); if (b) { b.setAttribute('aria-expanded', 'false'); if (ret === true && was) b.focus({ preventScroll: true }); } }`
- **Z. 170:** `window.addEventListener('hashchange', close);` → `window.addEventListener('hashchange', () => close());` (das Event-Objekt darf nicht als `ret` ankommen)
- **Z. 174 Escape:** `else close();` → `else close(true);`
- **Z. 178:** `'dash-f-close'() { close(); }` → `'dash-f-close'() { close(true); }`
- **Z. 189 `dash-f-apply`:** nach `App.rerender();` ergänzen: `document.querySelector('[data-action="dash-f-open"]')?.focus({ preventScroll: true });`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: #fd-layer] close() vereint beide Fassungen: `function close(ret) { const u = ui(); const was = u.open; u.open = false; u.draft = null; u.pick = null; const pop = document.getElementById('fd-pop'); if (pop) { pop.removeAttribute('id'); pop.inert = true; const Mo = root.Motion; if (Mo && Mo.enabled) Mo.leave(pop, 'closing', '--dur-1', () => pop.remove()); else pop.remove(); } const b = document.querySelector('[data-action="dash-f-open"]'); if (b) { b.setAttribute('aria-expanded', 'false'); if (ret === true && was) b.focus({ preventScroll: true }); } }`. Die Funktion kehrt nicht vorzeitig zurück, denn aria-expanded muss immer zurückgesetzt werden. `l.innerHTML = ''` entfällt, weil es das Ausblenden abschneiden würde. `inert` verhindert, dass ein Tastendruck im ausblendenden Fenster 'dash-f-apply' mit u.draft = null auslöst; gegen Klicks schützt schon `.fd-pop.closing { pointer-events: none }`. Die übrigen Teile von 168-189 bleiben: hashchange mit `() => close()`, Escape und × mit `close(true)`, Fokus nach „Anwenden“, Tab-Falle auf #fd-layer mit `#fd-pop`-Selektoren (sie übergeht das ausblendende Fenster ohne ID). barrierefreiheit-158 ist unabhängig, weil refresh bei u.open = false abbricht. responsiv-3.5 ändert in place() nur die Handy-Breite (vw − 32) und den linken Rand (16 px) und ist ebenfalls unabhängig. Die bewegung-Prüfung „40 ms nach Escape .fd-pop.closing, nach 250 ms #fd-layer leer“ bleibt erfüllt.
- [konflikt: #fd-pop] Ein gemeinsames close() in dash-filter.js. Es blendet das Fenster aus (bewegung) und setzt aria-expanded, bei ×, Escape und Anwenden geht der Fokus zurück (barrierefreiheit): function close(ret) { const u = ui(); const was = u.open; u.open = false; u.draft = null; u.pick = null; const pop = document.getElementById('fd-pop'); if (pop) { pop.removeAttribute('id'); const Mo = root.Motion; if (Mo && Mo.enabled) Mo.leave(pop, 'closing', '--dur-1', () => pop.remove()); else pop.remove(); } const b = document.querySelector('[data-action="dash-f-open"]'); if (b) { b.setAttribute('aria-expanded', 'false'); if (ret === true && was) b.focus({ preventScroll: true }); } } Dazu wie bei barrierefreiheit: hashchange → () => close(), Escape → close(true), 'dash-f-close' → close(true), 'dash-f-apply' → close(); App.rerender(); danach Fokus auf den Filter-Knopf. Das Ausblenden setzt kein #fd-layer.innerHTML = '' mehr. .fd-pop.closing (pointer-events: none) aus dem CSS-Teil von bewegung verhindert Klicks ins ausblendende Fenster. Die Tab-Falle (#fd-pop …) sieht das Fenster ohne ID nicht mehr. aria-controls="fd-pop" (C-dashboard-124) und der 16-px-Rand am Handy in place() (responsiv-3.5) sind verträglich.
- ÜBERNIMMT bewegung-3.8b: Das Ausblenden mit ID-Entfernung steckt im gemeinsamen close(). Prüfung 6 der Bewegung (40 ms nach Escape existiert .fd-pop.closing, nach 250 ms ist #fd-layer leer) bleibt gültig.
- VERBINDLICH (Kreuzprüfung): dash-filter.js. Der Schritt enthält bewegung-3.8b; das CSS `.fd-pop.closing { animation: pop-out …; pointer-events: none; }` aus bewegung-B4c muss vorher stehen. (1) Z. 168 `open()` nach `place();` ergänzen: `const b = document.querySelector('[data-action="dash-f-open"]'); if (b) b.setAttribute('aria-expanded', 'true'); const l = layer(); if (!l._trap) { l._trap = true; l.addEventListener('keydown', e => { if (e.key !== 'Tab') return; const f = [...l.querySelectorAll('#fd-pop button:not([disabled]), #fd-pop input, #fd-pop select')].filter(x => x.getClientRects().length); if (!f.length) return; const i = f.indexOf(document.activeElement); if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); } }); } const g = document.querySelector('#fd-pop .fd-gh'); if (g) g.focus({ preventScroll: true });`. (2) Z. 169 → `function close(ret) { const u = ui(); const was = u.open; u.open = false; u.draft = null; u.pick = null; const pop = document.getElementById('fd-pop'); if (pop) { pop.removeAttribute('id'); pop.inert = true; const Mo = root.Motion; if (Mo && Mo.enabled) Mo.leave(pop, 'closing', '--dur-1', () => pop.remove()); else pop.remove(); } const b = document.querySelector('[data-action="dash-f-open"]'); if (b) { b.setAttribute('aria-expanded', 'false'); if (ret === true && was) b.focus({ preventScroll: true }); } }`. Hier gibt es kein `#fd-layer.innerHTML = ''`, weil es das Ausblenden abschneiden würde. Es gibt auch kein vorzeitiges return, weil aria-expanded immer zurückgesetzt werden muss. (3) Z. 170 `window.addEventListener('hashchange', close);` → `window.addEventListener('hashchange', () => close());`. (4) Z. 174 Escape: `else close();` → `else close(true);`. (5) Z. 178 `'dash-f-close'() { close(); }` → `'dash-f-close'() { close(true); }`. (6) Z. 189 `dash-f-apply`: nach `App.rerender();` ergänzen `document.querySelector('[data-action="dash-f-open"]')?.focus({ preventScroll: true });`. Der Klick neben das Fenster (pointerdown) ruft weiter `close()` ohne Fokus-Rücksprung. Verträglich sind barrierefreiheit-C-dash-filter-158, C-dashboard-124 (aria-controls) und responsiv-3.5 (place). Prüfen: bewegung-Prüfpunkt 6 (40 ms nach Escape gibt es `#fd-layer .fd-pop.closing`, nach 250 ms ist `#fd-layer` leer). Nach ×, Escape und Anwenden liegt der Fokus auf dem Filter-Knopf, und aria-expanded wechselt true/false.

## kilook-C10 · Widget-Vorschaubild „Dein Score“ in Satzschreibung

Gruppe kilook · Cluster dashboard · Aufwand S · Befunde: ki_look-36
Quelle: audit/spec/kilook.md Z. 613–615 · Dateien: web/js/widgetpreviews.js
Abhängig von: —

```text
**C10 · web/js/widgetpreviews.js:73 · Vorschaubild Score** (ki_look-36; die Vorschauen zeigen das echte Widget, README:75)
- `tx(8, 54, 'DEIN SCORE', 3.8, F, { w: 600, ls: .3 })` → `tx(8, 54, 'Dein Score', 5.2, T2)`

```

## kilook-C12 · Dashboard: Bearbeiten-Leiste ohne Pulspunkt mit „·“, Willkommen-Banner ohne icon: 'sparkle'

Gruppe kilook · Cluster dashboard · Aufwand S · Befunde: ki_look-12, ki_look-17
Quelle: audit/spec/kilook.md Z. 620–624 · Dateien: web/js/screens/dashboard.js
Abhängig von: —

```text
**C12 · web/js/screens/dashboard.js** (ki_look-12, ki_look-17)
- **119** vorher `<div class="edit-bar"><div class="row"><span class="dot-live"></span><b>Bearbeitungsmodus</b><span class="muted">–</span><span>${esc(tpl.name)}</span></div>`
  → nachher `<div class="edit-bar"><div class="row"><b>Bearbeitungsmodus</b><span class="muted">·</span><span>${esc(tpl.name)}</span></div>`. Der Rest der Zeile bleibt, „Speichern“ bleibt `btn primary`.
- **130** im `U.banner(…, 'Willkommen', …, { icon: 'sparkle', trailing: … })` den Teil `icon: 'sparkle', ` streichen.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: U.banner] Alle sechs Änderungen gelten; doppelt ist nur dashboard.js:130 (das sparkle-Symbol). Endstand: dashboard.js:130 `U.banner('info', 'Willkommen', …, { trailing: … }` mit „CSS importieren“ und zwei neutralen `btn sm`, ohne icon (farbe-C19c). shadow.js:58 ohne `icon: 'sparkle'` (kilook-C15). prop.js:97 `U.banner('ok', 'Ziel erreicht', …)` (farbe-C26b). prop.js:279/280 ohne den letzten info-Zweig und ohne warn (aufbau-C12e). Dazu eine Lücke: Der Erfolgs-Zweig `U.banner('accent', plan.funded ? 'Bereit für den Payout' : 'Challenge bestanden', …)` in Z. 279 wird `U.banner('ok', …)`. Grund: Die Farbe-Spezifikation benennt `.banner.accent` in `.banner.ok` um; ohne diese Änderung stünde das Banner ohne Stil da. coach.js:27 errorBox wie zustaende-S-CS1. Abnahme: `grep -rnE "banner\('accent'|icon: 'sparkle'" web/js` findet nichts mehr (I.sparkle wird gelöscht).
- ÄNDERN: Der Teil Z. 130 (icon: 'sparkle' streichen) entfällt, farbe-C19c schreibt die ganze Zeile neu. Z. 119 (Bearbeitungsleiste mit „·“) bleibt bei kilook-C12.
- [doppelt: .edit-bar] Das CSS setzt einmal bewegung-C4 um: `.edit-bar { …; border: 1px solid var(--border-2); background: var(--surface-2); box-shadow: var(--shadow); }`, sticky und alles Übrige bleiben. `.dot-live` (Z. 1568) und `@keyframes pulse` (Z. 1115, sonst unbenutzt) werden gelöscht. dashboard.js:119 ändert einmal kilook-C12: `<div class="edit-bar"><div class="row"><b>Bearbeitungsmodus</b><span class="muted">·</span><span>${esc(tpl.name)}</span></div>…`. Der Trenner wird „·“ statt „–“: Bewegung hat das Zeichen ausdrücklich der Wortwahl überlassen, laut Wortwahl W8 ist kein Gedankenstrich als Satzzeichen erlaubt, und kilook Z12 nennt „Bearbeitungsmodus · Standard“. „Speichern“ bleibt btn primary. dashtest.js:23/110 prüft nur „Standard“ bzw. „Scalping“ und bleibt grün.
- ÜBERNIMMT bewegung-3.7a: Das Entfernen von `<span class="dot-live"></span>` in dashboard.js:119 macht kilook-C12 zusammen mit dem Trenner „·“ (nicht „–“).
- [doppelt: .dot-live] Wie bei .edit-bar: Die CSS-Regel .dot-live und @keyframes pulse löscht bewegung-C4, das Element in dashboard.js:119 entfernt kilook-C12 (dabei „·“ als Trenner). Danach findet `grep -rn "dot-live\|keyframes pulse " web/css web/js` nichts mehr; streak-pulse* bleiben.
- ÜBERNIMMT bewegung-3.7a: Das Entfernen von `<span class="dot-live"></span>` in dashboard.js:119 macht kilook-C12 zusammen mit dem Trenner „·“ (nicht „–“).

## responsiv-B5b · Letzte Trades: Symbol mit Ellipse (.sym-t, 7.5em)

Gruppe responsiv · Cluster dashboard · Aufwand S · Befunde: zustaende-32
Quelle: audit/spec/responsiv.md Z. 288–288 · Dateien: web/css/app.css
Abhängig von: —

```text
- Nach Z. 610 neu: `.recent-wrap td.sym .sym-t { display: inline-block; max-width: 7.5em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; vertical-align: bottom; }`
```

## responsiv-C1 · Handy-Dashboard: ungerade letzte Kachel volle Breite, Kachelwerte 20 px, Spark ohne 28 px, Bearbeitungsleiste 40×40

Gruppe responsiv · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-25, typografie-28, responsiv-41
Quelle: audit/spec/responsiv.md Z. 381–388 · Dateien: web/css/app.css
Abhängig von: —

```text
#### C – Einzelstellen

**C1 Handy-Dashboard** (bereich_dashboard-25, typografie-28, responsiv-41)
- Im Block ≤ 560 px nach Z. 3026: `.dash-top > :last-child:nth-child(odd) { grid-column: 1 / -1; }`
- Z. 3027 `.tile .val { font-size: 21px; }` → `.tile .val { font-size: 20px; }`
- Z. 1735 `.tile.spark-tile .val { …; font-size: 28px; … }` → `font-size: 28px;` streichen (Rest der Regel bleibt).
- Im Block ≤ 560 px neu: `.dash-top .w-bar .w-name { display: none; } .dash-top .w-bar { justify-content: space-between; } .w-bar .mv .btn, .w-bar .rm { width: 40px; height: 40px; padding: 0; justify-content: center; }`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .tile .val] Ein Rollen-Token für alle Kachelwerte, die Werte kommen aus der Typografie-Skala. In :root steht `--tile-val: var(--fv-24);`, im Block @media (max-width: 960px) `:root { --tile-val: var(--fv-20); }`; eine eigene 560er-Stufe gibt es nicht, das Handy erbt 20. Die Regel lautet `.tile .val { font-size: var(--tile-val); font-weight: 700; letter-spacing: var(--ls-val); line-height: var(--lh-val); }` ohne font-family (Onest kommt über die Sammelregel). In der Container-Notstufe (heute @container max-width 164px, die Schwelle legt der Anker „@container (max-width: 164px)“ fest) gilt `.tile .val { font-size: var(--fv-20); }`. Gelöscht werden Z. 936 (22px, ≤960) und Z. 3027 (21px, Handy). Die Skala gilt auch für die bisherigen „Bleiben“-Ausnahmen aus aufbau-A2: `.prop-balance .val` geht von 26 auf var(--fv-24), bei ≤960 von 22 auf var(--fv-20) (wie typografie-fv24/fv20). `.coach-gs-tiles .tile .val { font-size: 21px }` (Z. 2945) wird gelöscht und erbt --tile-val; schmale Coach-Kacheln fallen über die Container-Notstufe auf 20. Grund: 25, 22, 21 und 26 px liegen nicht auf der Werte-Skala (14/16/20/24/32/44), und die Typografie verbietet sie. Aufbau, Typografie und Responsiv sind sich bei 24 am Desktop und 20 am Handy einig. Streitig war nur der Tablet-Wert 22 (Aufbau). Dafür gibt es die Skalenstufe 20 „Kachelwert schmal, ≤960, Handy“.
- [doppelt: .tile.spark-tile .val] Endstand: `.tile.spark-tile .val { flex: 0 0 auto; display: flex; align-items: center; margin: 0; padding: 0; min-height: 0; }`. Schrift, Größe (--tile-val, also 24/20 statt 28), Gewicht, Laufweite und Zeilenhöhe erbt die Regel von .tile .val. Geschrieben wird sie einmal, von aufbau-A2. Dass typografie-3.2.2f den Selektor aus der Onest-Liste streicht, passt dazu (.tile .val deckt ihn ab).
- [doppelt: .dash-top > :last-child:nth-child(odd) (Handy, gefunden in abstaende-C7 und responsiv-C1)] Beide Schritte fügen im 560er-Block nach Z. 3026 eine Regel ein, damit die ungerade letzte Kachel die volle Breite bekommt. Es wird nur eine geschrieben: `.dash-top > :last-child:nth-child(odd) { grid-column: 1 / -1; }` (responsiv-C1). Sie erfasst auch das Start-Skelett (.skel), dessen fünfte Kachel laut Responsiv-Spezifikation volle Breite hat. Die Fassung von abstaende-C7 gilt nur für .w und .add-slot und entfällt.
- VERBINDLICH (Kreuzprüfung): web/css/app.css, Block `@media (max-width: 560px)`:
1) Nach Z. 3026: `.dash-top > :last-child:nth-child(odd) { grid-column: 1 / -1; }` (einzige Regel dafür; die Variante aus abstaende-C7 entfällt).
2) Neu: `.dash-top .w-bar { justify-content: space-between; } .w-bar .mv .btn, .w-bar .rm { width: 40px; height: 40px; padding: 0; justify-content: center; }`.
Nicht in diesem Schritt: Z. 3027 `.tile .val { font-size: 21px }` (aufbau-A2 löscht die Zeile, 20 px kommen über --tile-val ab ≤ 960), das Streichen von 28px in Z. 1735 (aufbau-A2 schreibt `.tile.spark-tile .val` ohne Schriftteil neu) und `.dash-top .w-bar .w-name { display: none; }` (es gibt kein .w-name mehr; aufbau-C6b ersetzt es durch `<span class="grow" aria-hidden="true"></span>`). Prüfpunkt responsiv.md Z. 591: statt „.w-name display none“ prüfen, dass kein `.w-name` im DOM steht; Pfeile und × bei 390 px je 40×40.

## responsiv-3.16 · Letzte Trades: Symbol in span.sym-t mit title

Gruppe responsiv · Cluster dashboard · Aufwand S · Befunde: zustaende-32
Quelle: audit/spec/responsiv.md Z. 541–544 · Dateien: web/js/widgets.js
Abhängig von: responsiv-B5b

```text
### 3.16 web/js/widgets.js:256 (zustaende-32)

- `<td class="sym">${esc(t.symbol)}</td>` → `<td class="sym"><span class="sym-t" title="${esc(t.symbol)}">${esc(t.symbol)}</span></td>`

```

## wording-S6.1-6.4 · Kalender-Widgets: Tages- und Wochenbeträge kompakt ohne Cent, leerer Monat „—“, „Trefferquote“-Tooltip, Zähler über U.count

Gruppe wording · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-17, wording-3, zustaende-28
Quelle: audit/spec/wording.md Z. 363–370 · Dateien: web/js/widgets.js
Abhängig von: wording-S1.1-1.3

```text
### Schritt 6 · `web/js/widgets.js` und `web/js/widgetpreviews.js`

| # | Stelle | vorher → nachher | ids |
|---|---|---|---|
| 6.1 | widgets.js:115 Kalender-Tageszelle | `.p`: `compact: Math.abs(e.pnl) >= 1000` → `compact: true`; `title="Winrate"` → `title="Trefferquote"`; `${e.n} Trade${e.n === 1 ? '' : 's'}` → `${U.count(e.n, 'Trade', 'Trades')}` | bereich_dashboard-17, wording-3, zustaende-28 |
| 6.2 | widgets.js:116 Wochensumme | `.p`: `compact: Math.abs(wk.pnl) >= 1000` → `compact: true` (`.pm` bleibt) | bereich_dashboard-17 |
| 6.3 | widgets.js:127 Jahreskalender leer | `<b class="muted">--</b>` → `<b class="muted">—</b>` | bereich_dashboard-17 |
| 6.4 | widgets.js:132 | `${a.n} Trade${a.n === 1 ? '' : 's'}` → `${U.count(a.n, 'Trade', 'Trades')}` | zustaende-28 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: calendarHTML] widgets.js:115 und :116 bekommen `compact: true` für Tages- und Wochenbetrag, in beiden Schritten gleich. wording-S6.1–6.4 setzt das zusammen mit dem title „Trefferquote“, U.count und „—“ für den leeren Monat um. Die Prüfungen aus kilook-C9a übernimmt der Wortwahl-Schritt: mobiletest.js:66 (.cal .w .p/.pm) und .cal .p ohne Cent.
- ÜBERNIMMT kilook-C9a: Gleiche Änderung an Z. 115/116. Die Prüfungen (mobiletest.js:66, .cal .p ohne /,\d\d\s?[€$]/) laufen im Wortwahl-Schritt.

## wording-S6.5-6.10 · Kennzahl-Widgets: „Netto-P&L“ mit Vorzeichen, „Ø Gewinn/Verlust“ ohne short, Report-Namen, Score-Texte, „Kumulierter Netto-P&L“

Gruppe wording · Cluster dashboard · Aufwand M · Befunde: wording-6, hierarchie-13, bereich_dashboard-32, wording-7, zustaende-28, wording-9, bereich_statistik-10, wording-3
Quelle: audit/spec/wording.md Z. 371–376 · Dateien: web/js/widgets.js
Abhängig von: wording-S1.1-1.3

```text
| 6.5 | widgets.js:165 | `name: 'Netto P&L'` → `name: 'Netto-P&L'` | wording-6, hierarchie-13, bereich_dashboard-32 |
| 6.6 | widgets.js:166 | `U.pnl(d.s.total, '', { signed: false })` → `U.pnl(d.s.total)`; `${d.s.n} Trade${…}` → `U.count(d.s.n, 'Trade', 'Trades')` | wording-7, zustaende-28 |
| 6.7 | widgets.js:175 | `name: 'Gewinn/Verlust pro Trade', short: 'Ø Gewinn/Verlust'` → `name: 'Ø Gewinn/Verlust'` (ohne `short`); info → `'Ø Gewinn geteilt durch Ø Verlust. Der Balken zeigt das Verhältnis.'` | wording-9, bereich_dashboard-32 |
| 6.8 | widgets.js:197–198 Report-Namen | `'Ø Tages-Gewinn/Verlust (kumuliert)'` bleibt; `'Ø Trade-Gewinn/Verlust (kumuliert)'` → `'Ø Gewinn/Verlust (kumuliert)'`; `'Ø geplantes R-Multiple (kumuliert)'` → `'Ø geplantes R pro Trade (kumuliert)'`; `'Ø realisiertes R-Multiple (kumuliert)'` → `'Ø R pro Trade (kumuliert)'`; `'Ø Tagesvolumen (kumuliert)'` → `'Ø Kontrakte pro Tag (kumuliert)'` (Schlüssel unverändert) | wording-9, bereich_statistik-10 |
| 6.9 | widgets.js:226 Gesamt-Score | desc → `'Punktzahl von 0 bis 100 aus Trefferquote, Profit-Faktor, Gewinn/Verlust, Konsistenz, Regeltreue und Drawdown, als Netz-Diagramm.'`; info → `'Sechs Achsen von 0 bis 100: Trefferquote, Profit-Faktor, Gewinn/Verlust, Konsistenz, Regeltreue und Drawdown. Der Score ist der Mittelwert.'` | wording-9, wording-3 |
| 6.10 | widgets.js:228 | `name: 'Kumulierter Tages-P&L'` → `name: 'Kumulierter Netto-P&L'` | bereich_dashboard-32 |
```

## wording-S6.11-6.15 · Letzte Trades: „Zum TradeLog“ nur mit Zeilen; Challenge-Zähler; Regel-Tracker „abgehakt“ und ohne Kopf-Link

Gruppe wording · Cluster dashboard · Aufwand S · Befunde: wording-48, zustaende-28, wording-44
Quelle: audit/spec/wording.md Z. 377–381 · Dateien: web/js/widgets.js
Abhängig von: wording-S1.1-1.3

```text
| 6.11 | widgets.js:253 Info „Letzte Trades“ | `…; „Mehr anzeigen“ öffnet das TradeLog.` → `…; „Zum TradeLog“ öffnet die ganze Liste.` | wording-48 |
| 6.12 | widgets.js:257 | `<div class="more-row"><a class="more-link" href="#/trades">Mehr anzeigen</a></div>` → `${rows.length ? '<div class="more-row"><a class="more-link" href="#/trades">Zum TradeLog</a></div>' : ''}` | wording-48 |
| 6.13 | widgets.js:273 | `${list.length} Trades · ${days.length} Handelstage` → `${U.count(list.length, 'Trade', 'Trades')} · ${U.count(days.length, 'Handelstag', 'Handelstage')}` | zustaende-28 |
| 6.14 | widgets.js:285 Tracker-Tooltip | `${…} von ${rules.length} Regeln eingehalten` → `${…} von ${rules.length} Regeln abgehakt` | wording-44 |
| 6.15 | widgets.js:288 Regel-Tracker | Option `{ trailing: \`<a class="more-link" href="#/progress">Mehr anzeigen</a>\` }` ersatzlos streichen | wording-48 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .more-row] Bindendes Ergebnis für „Letzte Trades & offene Positionen“ (widgets.js:253/257): keine Fußzeile mehr. Der Link sitzt nach dem einen App-Muster (aufbau) rechts im Kartenkopf, wie „Öffnen“ bei den Bereichs-Widgets. Z. 257 endet auf `…${table}` ohne `.more-row`, Optionen `{ info: e.info, cls: 'recent-card', trailing: d.all.length ? more('#/trades', 'Zum TradeLog') : '' }`. Beschriftung „Zum TradeLog“ (Wording-Glossar W5: „Zum/Zur + Bereich“ = Navigation aus einem Widget; Übersetzung „Go to TradeLog“ ist dort vorbereitet), also weder „Alle Trades“ noch „Mehr anzeigen“ (das bleibt fürs Nachladen reserviert). Info-Text Z. 253: „…; „Zum TradeLog“ öffnet die ganze Liste.“ Der Link erscheint nur, wenn das Widget überhaupt Trades hat (`d.all.length`). Das erfüllt W13 („mehr“-Link nur mit Inhalt) und zustaende-S-TE2 (leeres Dashboard ohne `.recent-card .more-link`). Der Kopf-Link springt aber nicht weg, wenn man auf „Offene Positionen“ ohne offene Position umschaltet (das täte die Bedingung rows.length). Regel-Tracker Z. 288 verliert den Kopf-Link (aufbau-C2a = wording 6.15, einmal umsetzen). Danach löscht aufbau-B12 `.more-row` (Z. 1658). Tests: dashtest.js:67 Meldung „Zum TradeLog“, die Prüfung `.recent-card .more-link` mit href `#/trades` bleibt. In dashtest.js:72 den Teil `&& await p.$eval('.w[data-typ="regel_tracker"] .card-head .more-link', …)` streichen, weil der Kopf-Link bewusst entfällt; die Prüfung `.tracker-foot a` → `#/progress` bleibt.
- [konflikt: .more-link] CSS (aufbau-B12 übernimmt): .more-link { color: var(--text-2); font-weight: 500; font-size: var(--fs-13); line-height: var(--lh-13); text-decoration: none; } .more-link:hover { color: var(--text); }. Ohne Unterstrich beim Hover, wie in der aufbau-Regel („kein Grün, kein Unterstrich“): ruhiger, und gleich wie die übrigen Kopf-Bedienelemente. .more-row wird gelöscht. Touch-Höhe 44 px aus barrierefreiheit-B12e danach, unverändert. Letzte Trades (widgets.js:253/257): Der Link steht im Kartenkopf (aufbau-C2a, U.card trailing), nicht in einer Fußzeile, und heißt „Zum TradeLog“. Das ist laut wording W5 der feste Name für „Navigation aus Widget“ und sagt das Ziel; „Alle Trades“ und „Mehr anzeigen“ fallen weg, denn „Mehr anzeigen“ heißt laut aufbau nur Nachladen. Der Link erscheint nur mit Zeilen (wording W13, zustaende): { info: e.info, cls: 'recent-card', trailing: rows.length ? more('#/trades', 'Zum TradeLog') : '' }. Info-Satz: „Die zuletzt geschlossenen Trades des Kontos und alle noch offenen Positionen. So viele Zeilen, wie in die Karte passen; „Zum TradeLog“ öffnet die ganze Liste.“ Regel-Tracker: trailing ersatzlos streichen (aufbau-C2a = wording 6.15, aufbau übernimmt). Der Leertext-Link geht auf #/settings/regeln.
- VERBINDLICH (Kreuzprüfung): web/js/widgets.js, nur noch:
6.13 (Z. 273): `${list.length} Trades · ${days.length} Handelstage` → `${U.count(list.length, 'Trade', 'Trades')} · ${U.count(days.length, 'Handelstag', 'Handelstage')}` (nach wording-S1.1-1.3).
6.14 (Z. 285, Tracker-Tooltip): `… von ${rules.length} Regeln eingehalten` → `… von ${rules.length} Regeln abgehakt` (Schlüssel „{0} von {1} Regeln abgehakt“).
Entfallen hier, weil aufbau-C2a sie mit dem Wording-Text umsetzt: 6.11 (Info-Satz „…; „Zum TradeLog“ öffnet die ganze Liste.“), 6.12 („Zum TradeLog“ als Kopf-Link über U.card trailing statt .more-row, nur mit Inhalt) und 6.15 (Kopf-Link des Regel-Trackers streichen). Die Schlüssel „Zum TradeLog“ (en „Go to TradeLog“) und der neue Info-Satz bleiben im Wörterbuch-Schritt der Wortwahl.

## wording-S6.23-6.27 · Widget-Vorschaubilder an die neuen Texte angleichen

Gruppe wording · Cluster dashboard · Aufwand S · Befunde: wording-38, wording-33, wording-6, wording-9, bereich_dashboard-32, wording-3, wording-48
Quelle: audit/spec/wording.md Z. 389–394 · Dateien: web/js/widgetpreviews.js
Abhängig von: —

```text
| 6.23 | widgetpreviews.js:45 | `cap(…, 'Regelbrüche haben dich das gekostet')` → `cap(…, 'So viel haben dich Verstöße gekostet')` | wording-38 |
| 6.24 | widgetpreviews.js:52 | `'noch 7 Stop-Losses'`, `'noch 43 Stop-Losses'`, `'noch 2 Stop-Losses'` → `'reicht für 7 Stops'`, `'reicht für 43 Stops'`, `'reicht für 2 Stops'` | wording-33 |
| 6.25 | widgetpreviews.js:57 / :62 / :75 | `ttl('Netto P&L')` → `ttl('Netto-P&L')`; `ttl('Gewinn/Verlust pro Trade')` → `ttl('Ø Gewinn/Verlust')`; `ttl('Kumulierter Tages-P&L')` → `ttl('Kumulierter Netto-P&L')` | wording-6, wording-9, bereich_dashboard-32 |
| 6.26 | widgetpreviews.js:71 | `names = ['Win-Rate', …]` → `names = ['Trefferquote', …]` | wording-3 |
| 6.27 | widgetpreviews.js:90 / :104 | `tx(70, 85, 'Mehr anzeigen', …)` → `tx(70, 85, 'Zum TradeLog', …)`; in :104 `+ tx(132, 13, 'Mehr anzeigen', 4, P, { a: 'end', w: 600 })` streichen | wording-48 |

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .more-row] Bindendes Ergebnis für „Letzte Trades & offene Positionen“ (widgets.js:253/257): keine Fußzeile mehr. Der Link sitzt nach dem einen App-Muster (aufbau) rechts im Kartenkopf, wie „Öffnen“ bei den Bereichs-Widgets. Z. 257 endet auf `…${table}` ohne `.more-row`, Optionen `{ info: e.info, cls: 'recent-card', trailing: d.all.length ? more('#/trades', 'Zum TradeLog') : '' }`. Beschriftung „Zum TradeLog“ (Wording-Glossar W5: „Zum/Zur + Bereich“ = Navigation aus einem Widget; Übersetzung „Go to TradeLog“ ist dort vorbereitet), also weder „Alle Trades“ noch „Mehr anzeigen“ (das bleibt fürs Nachladen reserviert). Info-Text Z. 253: „…; „Zum TradeLog“ öffnet die ganze Liste.“ Der Link erscheint nur, wenn das Widget überhaupt Trades hat (`d.all.length`). Das erfüllt W13 („mehr“-Link nur mit Inhalt) und zustaende-S-TE2 (leeres Dashboard ohne `.recent-card .more-link`). Der Kopf-Link springt aber nicht weg, wenn man auf „Offene Positionen“ ohne offene Position umschaltet (das täte die Bedingung rows.length). Regel-Tracker Z. 288 verliert den Kopf-Link (aufbau-C2a = wording 6.15, einmal umsetzen). Danach löscht aufbau-B12 `.more-row` (Z. 1658). Tests: dashtest.js:67 Meldung „Zum TradeLog“, die Prüfung `.recent-card .more-link` mit href `#/trades` bleibt. In dashtest.js:72 den Teil `&& await p.$eval('.w[data-typ="regel_tracker"] .card-head .more-link', …)` streichen, weil der Kopf-Link bewusst entfällt; die Prüfung `.tracker-foot a` → `#/progress` bleibt.
- ÄNDERN: 6.27 widgetpreviews.js:90: „Zum TradeLog“ nicht unten mittig (tx(70, 85, …)), sondern im Kopf wie bisher beim Regel-Tracker: `tx(132, 13, 'Zum TradeLog', 4, T2, { a: 'end', w: 500 })`, neutral statt P (Grün). Der Teil zu :104 (Regel-Tracker-Link streichen) bleibt.

## bewegung-B4c · Filter-Fenster (CSS): Schließ-Animation .fd-pop.closing

Gruppe bewegung · Cluster dashboard · Aufwand S · Befunde: bewegung-27, bewegung-28
Quelle: audit/spec/bewegung.md Z. 195–196 · Dateien: web/css/app.css
Abhängig von: bewegung-B4a

```text
- Nach Z. 1345 (`.fd-pop { … }`) neu: `.fd-pop.closing { animation: pop-out var(--dur-1) var(--ease-in) forwards; pointer-events: none; }`. Der `transform-origin` von `.fd-pop` bleibt als Grundwert `top left`, JS setzt ihn je Lage (C-Schritt dash-filter).

```

## bewegung-B9 · Seitenpanel „Widget hinzufügen“ (CSS): Abdunkler ein-/ausblenden, Panel gleitet hinaus

Gruppe bewegung · Cluster dashboard · Aufwand S · Befunde: bewegung-26
Quelle: audit/spec/bewegung.md Z. 216–222 · Dateien: web/css/app.css
Abhängig von: —

```text
**B9 Seitenpanel „Widget hinzufügen“** (bewegung-26)
- Z. 1597 `.panel-bg { … }` um `animation: fade-in var(--dur-2) var(--ease) backwards;` ergänzen.
- Direkt danach neu: `.panel-bg.settled { animation: none; }` und **danach** `.panel-bg.out { animation: fade-out var(--dur-1) var(--ease-in) forwards; pointer-events: none; }`
- Nach Z. 1600 (`.side-panel.settled { animation: none; }`) neu (muss danach stehen):
  `.side-panel.out { animation: slide-out var(--dur-1) var(--ease-in) forwards; pointer-events: none; }`
  `@keyframes slide-out { to { transform: translateX(30px); opacity: 0; } }`

```

## bewegung-3.7b · Seitenpanel (JS): neuer Abdunkler .settled in keepPanel, Ausblenden in 'dash-add-close' mit Doppel-Schutz

Gruppe bewegung · Cluster dashboard · Aufwand M · Befunde: bewegung-26
Quelle: audit/spec/bewegung.md Z. 325–327 · Dateien: web/js/screens/dashboard.js
Abhängig von: bewegung-B9

```text
- **keepPanel Z. 67–69** (bewegung-26): direkt nach `fn();` (vor der Prüfung `if (!old || …) return;`) ergänzen: `const nbg = document.querySelector('.panel-bg'); if (old && nbg) nbg.classList.add('settled');`
- **Z. 208 `'dash-add-close'`** (bewegung-26) → `'dash-add-close'() { const s = st(), p = document.querySelector('.side-panel'), bg = document.querySelector('.panel-bg'), Mo = root.Motion; if (p && p.classList.contains('out')) return; const done = () => { s.panel = null; s.slot = null; App.rerender(); }; if (p && Mo && Mo.enabled) { if (bg) bg.classList.add('out'); Mo.leave(p, 'out', '--dur-1', done); } else done(); },`

```

## bewegung-3.8a · Filter-Fenster place(): transform-origin je Lage (Titelzeile rechts, sonst links)

Gruppe bewegung · Cluster dashboard · Aufwand S · Befunde: bewegung-28
Quelle: audit/spec/bewegung.md Z. 328–329 · Dateien: web/js/screens/dash-filter.js
Abhängig von: bewegung-B4a

```text
### 3.8 `web/js/screens/dash-filter.js` (bewegung-27, bewegung-28)
- **`place()` Z. 150–155**: nach `Object.assign(pop.style, { … })` ergänzen: `pop.style.transformOrigin = inTop && !phone ? 'top right' : 'top left';`
```
