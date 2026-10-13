# Paket 014 · dashboard, komponenten

Schritte: 36 · Dateien: web/css/app.css, web/e2e/dashtest.js, web/e2e/leaktest.js, web/js/screens/dash-filter.js, web/js/screens/dashboard.js, web/js/widgetpreviews.js, web/js/widgets.js
Betroffene Tests laut Spezifikation: prüfen: e2e/dashtest.js:23, :110; prüfen: e2e/dashtest.js:23, :59, :110 (.edit-bar mit Vorlagenname); prüfen: e2e/scorestatetest.js (Score-Karte); web/e2e/dashtest.js; web/e2e/dashtest.js (Bearbeitungsmodus); web/e2e/dashtest.js:143–144 (Schritt zustaende-S-TE2); web/e2e/dashtest.js:67; web/e2e/dashtest.js:67 (bleibt grün); web/e2e/leaktest.js (unverändert); web/e2e/mobiletest.js:20 (Kacheln zwei Spalten); web/e2e/mobiletest.js:33 (Gewinn/Verlust-Kachel); web/e2e/mobiletest.js:72; web/e2e/mobiletest.js:72 (Letzte Trades)
Baut auf Paketen auf: 2, 5, 6, 7, 13

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## aufbau-B12 · Ein Muster für „mehr dazu“: .more-link neutral, .more-row löschen

Gruppe aufbau · Cluster komponenten · Aufwand S · Befunde: bereich_dashboard-33
Quelle: audit/spec/aufbau.md Z. 379–383 · Dateien: web/css/app.css
Abhängig von: aufbau-C2a

```text
**B12 Ein Muster für „mehr dazu“** (`web/css/app.css` Z. 1658–1660) · bereich_dashboard-33
- Z. 1658 `.more-row { … }` löschen (nach C2 unbenutzt; mit `grep -rn more-row web/` prüfen)
- Z. 1659 `.more-link { color: var(--accent); font-weight: 600; font-size: 13px; text-decoration: none; }` → `.more-link { color: var(--text-2); font-weight: 500; font-size: 13px; text-decoration: none; }`
- Z. 1660 `.more-link:hover { text-decoration: underline; }` → `.more-link:hover { color: var(--text); }`

```

## aufbau-C2b · Widgets: Beschriftungen über Werten als .kpi-label

Gruppe aufbau · Cluster dashboard · Aufwand S · Befunde: typografie-4
Quelle: audit/spec/aufbau.md Z. 428–431 · Dateien: web/js/widgets.js
Abhängig von: aufbau-A3a

```text
- Z. 184 `<div class="caption">${label}</div>` → `<div class="kpi-label">${label}</div>`
- Z. 227 `<div class="caption">Dein Score</div>` → `<div class="kpi-label">Dein Score</div>`
- Z. 287 `<div class="caption" style="text-transform:none;letter-spacing:0;font-size:13px;font-weight:600;color:var(--text-2)">Heutiger Score …` → `<div class="kpi-label">Heutiger Score …`

```

## aufbau-C6a · Dashboard: Vorlagen-Tooltip mit Namen, Zertifikat-Symbol award

Gruppe aufbau · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-23
Quelle: audit/spec/aufbau.md Z. 463–467 · Dateien: web/js/screens/dashboard.js
Abhängig von: aufbau-B9

```text
#### `web/js/screens/dashboard.js`

**C6** · bereich_dashboard-23, ki_look-13, aufbau-33
- Z. 125 Vorlagen-Knopf: `title="Vorlage"` → `title="Vorlage: ${esc(tpl.name)}"` (Position und Form bleiben, README:64)
- Z. 125 Zertifikat-Knopf: `${I.shield}` → `${I.award}`
```

## aufbau-C6b · Dashboard bearbeiten: Leiste ohne Namen, aria mit Widget-Namen

Gruppe aufbau · Cluster dashboard · Aufwand S · Befunde: ki_look-13, aufbau-33
Quelle: audit/spec/aufbau.md Z. 468–469 · Dateien: web/js/screens/dashboard.js
Abhängig von: aufbau-B13

```text
- `wrap` Z. 41: `<span class="w-name">${esc(e.name || inst.typ)}</span>` → `<span class="grow" aria-hidden="true"></span>`; am Griff `aria-label="Verschieben"` → `aria-label="${esc(e.name || inst.typ)} verschieben"`; am × `aria-label="Widget entfernen"` → `aria-label="${esc(e.name || inst.typ)} entfernen"`

```

## aufbau-D3i · Unveränderte Tests bestätigen (dashtest.js, leaktest.js)

Gruppe aufbau · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-33
Quelle: audit/spec/aufbau.md Z. 713–715 · Dateien: web/e2e/dashtest.js, web/e2e/leaktest.js
Abhängig von: aufbau-C2a, aufbau-B12

```text
- `dashtest.js:67` bleibt grün (`.recent-card .more-link` mit `href="#/trades"`); Z. 72 bleibt
- neu `leaktest.js` bleibt unverändert (nur F1 würde ihn ändern)

```

## zustaende-S-W1 · Widgets: Leerlage je Render (EMPTY/EMPTY_T, gesetzt in makeData)

Gruppe zustaende · Cluster dashboard · Aufwand S · Befunde: wording-46, bereich_dashboard-13
Quelle: audit/spec/zustaende.md Z. 461–470 · Dateien: web/js/widgets.js
Abhängig von: —

```text
### 3.4 `web/js/widgets.js`

**S-W1 Leerlage je Render** – wording-46, bereich_dashboard-13
Nach Z. 9 (`const NO_DATA = …`) neu:
```js
let EMPTY = 'range'; /* 'none' = Konto ohne Trade, 'filter' = Dashboard-Filter ohne Treffer, 'range' = Zeitraum leer; gesetzt in makeData */
const EMPTY_T = { none: 'Noch keine Trades', filter: 'Keine Trades passen zum Filter', range: 'Keine abgeschlossenen Trades im Zeitraum' };
```
In `makeData` (Z. 12) als erste Zeile: `EMPTY = !(ctx.raw || ctx.all || []).length ? 'none' : ctx.filtered ? 'filter' : 'range';`

```

## zustaende-S-W5 · Regel-Tracker-Widget: Link auf #/settings/regeln

Gruppe zustaende · Cluster dashboard · Aufwand S · Befunde: zustaende-2
Quelle: audit/spec/zustaende.md Z. 483–485 · Dateien: web/js/widgets.js
Abhängig von: —

```text
**S-W5 Regel-Tracker-Link** – zustaende-2
Z. 288 `<a href="#/settings">Regeln in den Einstellungen anlegen</a>` → `<a href="#/settings/regeln">Regeln in den Einstellungen anlegen</a>`

```

## zustaende-S-D1 · Dashboard reicht raw und filtered im ctx an die Widgets

Gruppe zustaende · Cluster dashboard · Aufwand S · Befunde: wording-46, bereich_dashboard-13
Quelle: audit/spec/zustaende.md Z. 493–497 · Dateien: web/js/screens/dashboard.js
Abhängig von: zustaende-S-W1

```text
### 3.5 `web/js/screens/dashboard.js`

**S-D1 Leerlage durchreichen** – wording-46, bereich_dashboard-13
Z. 118 `if (fN) ctx = Object.assign({}, ctx, { all: applyFilter(ctx.all, f), inRange: applyFilter(ctx.inRange, f) });` → `if (fN) ctx = Object.assign({}, ctx, { raw: rawAll, filtered: true, all: applyFilter(ctx.all, f), inRange: applyFilter(ctx.inRange, f) });`

```

## zustaende-S-D2 · Dashboard-Filter-Knopf: Klasse is-on statt accent

Gruppe zustaende · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-6
Quelle: audit/spec/zustaende.md Z. 498–500 · Dateien: web/js/screens/dashboard.js
Abhängig von: zustaende-S-C7

```text
**S-D2 Filter-Knopf neutral** – bereich_dashboard-6
Z. 124 `class="btn ${fN ? 'accent' : ''}"` → `class="btn${fN ? ' is-on' : ''}"`.

```

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

## kilook-B2 · Bearbeiten-Leiste neutral (surface-2, border-2), .dot-live und @keyframes pulse löschen

Gruppe kilook · Cluster dashboard · Aufwand S · Befunde: ki_look-12
Quelle: audit/spec/kilook.md Z. 416–420 · Dateien: web/css/app.css
Abhängig von: —

```text
**B2 · web/css/app.css · Bearbeiten-Leiste** (ki_look-12)
- **Z. 1567** `.edit-bar`: `border: 1px solid var(--accent); background: color-mix(in srgb, var(--accent) 10%, var(--surface));` → `border: 1px solid var(--border-2); background: var(--surface-2);`. `position: sticky`, `box-shadow: var(--shadow)` und alles Übrige bleiben.
- **Z. 1568** `.dot-live { … animation: pulse 1.6s infinite; }` löschen.
- **Z. 1115** `@keyframes pulse { … }` löschen. Die Keyframes `streak-pulse` und `streak-pulse-3` sind eigene und bleiben.

```

## kilook-C9b · Dashboard-Widgets: Netto-P&L mit Vorzeichen; Serien, „Dein Score“, „Heutiger Score“ als .kpi-label

Gruppe kilook · Cluster dashboard · Aufwand S · Befunde: diagramme-35, ki_look-36
Quelle: audit/spec/kilook.md Z. 608–612 · Dateien: web/js/widgets.js
Abhängig von: kilook-A4

```text
- **166** `U.pnl(d.s.total, '', { signed: false })` → `U.pnl(d.s.total)`
- **184** `<div class="caption">${label}</div>` → `<div class="kpi-label">${label}</div>`
- **227** `<div class="caption">Dein Score</div>` → `<div class="kpi-label">Dein Score</div>`
- **287** `<div class="caption" style="text-transform:none;letter-spacing:0;font-size:13px;font-weight:600;color:var(--text-2)">Heutiger Score …` → `<div class="kpi-label">Heutiger Score …`

```

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

## bewegung-C4 · Bearbeiten-Leiste neutral (--border-2, --surface-2), .dot-live und @keyframes pulse löschen (CSS)

Gruppe bewegung · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-9, bewegung-37
Quelle: audit/spec/bewegung.md Z. 256–260 · Dateien: web/css/app.css
Abhängig von: —

```text
**C4 Bearbeiten-Leiste** (bereich_dashboard-9, bewegung-37; erledigt ki_look-12 mit)
- Z. 1567 `.edit-bar { … border: 1px solid var(--accent); background: color-mix(in srgb, var(--accent) 10%, var(--surface)); box-shadow: var(--shadow); }` → `… border: 1px solid var(--border-2); background: var(--surface-2); box-shadow: var(--shadow); }`
- Z. 1568 (`.dot-live { … }`) löschen.
- Z. 1115 (`@keyframes pulse { … }`) löschen (sonst nirgends benutzt; `streak-pulse*` sind eigene Keyframes).

```

## bewegung-3.7a · Dashboard: Punkt .dot-live aus der Bearbeiten-Leiste entfernen (Trennzeichen bleibt)

Gruppe bewegung · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-9, bewegung-37
Quelle: audit/spec/bewegung.md Z. 323–324 · Dateien: web/js/screens/dashboard.js
Abhängig von: bewegung-C4

```text
### 3.7 `web/js/screens/dashboard.js`
- **Z. 119** (bereich_dashboard-9, bewegung-37): `<div class="row"><span class="dot-live"></span><b>Bearbeitungsmodus</b>` → `<div class="row"><b>Bearbeitungsmodus</b>`. Der Rest bleibt, auch „–“ (K11).
```
