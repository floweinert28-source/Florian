# Paket 009 · shell, tokens

Schritte: 27 · Dateien: web/README.md, web/app.html, web/css/app.css, web/e2e/coachtest.js, web/e2e/headtest.js, web/e2e/navdottest.js, web/e2e/sidebartest.js, web/e2e/sixtest.js, web/e2e/usercardtest.js, web/js/app.js, web/js/ui.js
Betroffene Tests laut Spezifikation: e2e/coachtest.js:30, :94, :98, :127; e2e/coachtest.js:38; e2e/coachtest.js:94, :98, :127; e2e/headtest.js:11 (Vorlage icon-only); e2e/langtest.js:30 (title-Attribute); e2e/mobiletest.js:16, :50; e2e/mobiletest.js:50; e2e/motiontest.js:62–66; e2e/navdottest.js:8, :53; e2e/shadowtest.js:16; e2e/sidebartest.js; e2e/sidebartest.js:27; e2e/sidebartest.js:44; e2e/sixtest.js:12; e2e/sixtest.js:12, :36; e2e/tiptest.js; e2e/usercardtest.js; e2e/usercardtest.js:11; e2e/usercardtest.js:11 (siehe E1g); e2e/usercardtest.js:55; e2e/voicetest.js:21; web/e2e/headtest.js:11; web/e2e/mobiletest.js:31 (18 → 16, Schritt R1); web/e2e/mobiletest.js:39-40 (bleibt grün); web/e2e/sidebartest.js; web/e2e/sixtest.js:11; web/e2e/tlfittest.js (muss grün bleiben); web/e2e/usercardtest.js (müssen grün bleiben)
Baut auf Paketen auf: 2, 5, 8

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## abstaende-C11 · Abschnitts- und Raster-Wrapper auf Token: .aff (+ .aff > .aff-top), .nw-wrap, .nw-list, .cpn-grid, .coach-entries, .shadow-rules, .nb, .content > .tl-fit (18 → 16)

Gruppe abstaende · Cluster tokens · Aufwand M · Befunde: abstaende_layout-32
Quelle: audit/spec/abstaende.md Z. 360–360 · Dateien: web/css/app.css
Abhängig von: abstaende-A1, abstaende-A4

```text
| C11 | Abschnitts-Wrapper | `.aff` (Z. 2662) `gap: 16px` → `gap: var(--content-gap)`. Neu: `.aff > .aff-top { margin-bottom: calc(var(--sp-3) - var(--content-gap)); }`. `.nw-wrap` (Z. 3063) → `display: flex; flex-direction: column; gap: var(--content-gap); max-width: var(--w-news);`. `.nw-list` (Z. 3082) gap 14 → `var(--grid-gap)`. `.cpn-grid` (Z. 2644) gap 14 → `var(--grid-gap)`. `.coach-entries` (Z. 2869) gap 14 → `var(--grid-gap)`. `.shadow-rules` (Z. 2400) gap 10 → `var(--sp-3)`. `.nb` (Z. 954) gap 14 → `var(--grid-gap)`. `.content > .tl-fit` (Z. 955) gap 18 → `var(--grid-gap)`, Kommentar: „Kacheln, Reiter, Filter und Tabelle als eine Fläche wie das Dashboard“. | abstaende_layout-32 |
```

## abstaende-A5 · Fenster-Layouts Notebook/TradeLog: padding-bottom 22px → var(--sp-6)

Gruppe abstaende · Cluster shell · Aufwand S · Befunde: abstaende_layout-32
Quelle: audit/spec/abstaende.md Z. 307–307 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
| A5 | Fenster-Layouts Z. 959 und Z. 964 | `padding-bottom: 22px` → `padding-bottom: var(--sp-6)` (beide) | abstaende_layout-32 |
```

## abstaende-A9 · .nav a, .nav button: gap 14px → var(--sp-3)

Gruppe abstaende · Cluster shell · Aufwand S · Befunde: abstaende_layout-1
Quelle: audit/spec/abstaende.md Z. 311–312 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
| A9 | `.nav a, .nav button` (Z. 170) | `gap: 14px` → `gap: var(--sp-3)` | abstaende_layout-1 |

```

## abstaende-D1 · Seitenleiste: Dichte-@media hinter .sidebar .spacer verschieben, .sidebar ohne Polster oben, .brand so hoch wie die Titelzeile, Trennlinie .sb-sep bei y = 71 über volle Breite (auch mini), Konto-Karte .sb-userwrap sticky

Gruppe abstaende · Cluster shell · Aufwand L · Befunde: bereich_shell-2, abstaende_layout-7
Quelle: audit/spec/abstaende.md Z. 364–368 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
**D – Einzelstellen**

| Nr. | Stelle | vorher → nachher | Befunde |
|---|---|---|---|
| D1 | Seitenleiste Z. 137–157, 192, 232 | (1) Die beiden @media-Blöcke Z. 146–157 samt Kommentar unverändert hinter `.sidebar .spacer { flex: 1; }` (Z. 187) verschieben und dabei die Zeile `.brand { padding-bottom: 14px; }` streichen. (2) `.sidebar` `padding: 22px 14px 18px` → `padding: 0 14px 18px`. (3) `.brand` `padding: 4px 0 18px 16px` → `min-height: var(--topbar-h); padding: 0 0 0 16px`. (4) `.sidebar .sb-sep` `margin: 0 8px 14px` → `margin: -5px -14px 14px` (−5 gleicht den gap 4 der Leiste aus, Linie bei y = 71), neu `html.sb-mini .sidebar .sb-sep { margin: -5px -10px 14px; }`. (5) Z. 192 `html.sb-mini .brand { …; padding: 0 0 18px; … }` → `padding: 0; min-height: var(--topbar-h); justify-content: center;`. (6) Z. 232 `.sb-userwrap { margin-top: 10px; flex: 0 0 auto; }` → `.sidebar .sb-userwrap { position: sticky; bottom: -18px; z-index: 1; flex: 0 0 auto; margin: 2px 0 -18px; padding: 8px 0 18px; background: var(--bg-2); }`. Der Selektor braucht `.sidebar`, weil `.popwrap { position: relative }` (Z. 328) später steht. `bottom: -18px` und der negative Rand gleichen das Leistenpolster aus. Gemessen: Karte bei innerHeight − 18. | bereich_shell-2, abstaende_layout-7 |
```

## abstaende-E1 · App.pageHead: leere Kopfreihe nicht rendern (return '' wenn links und rechts leer)

Gruppe abstaende · Cluster shell · Aufwand S · Befunde: abstaende_layout-4, hierarchie-8
Quelle: audit/spec/abstaende.md Z. 379–383 · Dateien: web/js/app.js
Abhängig von: —

```text
### web/js/app.js

| Nr. | Stelle | vorher → nachher | Befunde |
|---|---|---|---|
| E1 | `pageHead` (Z. 256–262) | vor dem `return`: `if (!left && !right) return '';` | abstaende_layout-4, hierarchie-8 |
```

## abstaende-S5 · README Z. 51: Seitenleiste (Konto-Karte immer sichtbar, Linie auf Titelzeilen-Linie)

Gruppe abstaende · Cluster shell · Aufwand S · Befunde: bereich_shell-2, abstaende_layout-7
Quelle: audit/spec/abstaende.md Z. 534–534 · Dateien: web/README.md
Abhängig von: abstaende-D1

```text
| S5 | Z. 51 | „Auf niedrigen Bildschirmen etwas dichter.“ → „Auf niedrigen Bildschirmen etwas dichter; die Konto-Karte bleibt unten immer sichtbar. Die Linie unter dem Schriftzug liegt auf der Linie der Titelzeile.“ | bereich_shell-2, abstaende_layout-7 |
```

## komponenten-C08 · Kopfreihe 42 px (Knöpfe, .btn.icon-only, Filter am Handy) und Session-Label ab 1181 px

Gruppe komponenten · Cluster shell · Aufwand M · Befunde: komponenten-11, bereich_dashboard-26, referenz-5
Quelle: audit/spec/komponenten.md Z. 234–247 · Dateien: web/css/app.css
Abhängig von: —

```text
**C08 – Kopfreihe 42 px** (komponenten-11, bereich_dashboard-26, referenz-5)
- Nach Z. 1327 (`.dash-head .dh-sep`) einfügen:
```css
.dash-head > .row > .btn, .dash-head > .row > .popwrap > .btn { height: 42px; }
.dash-head > .row > .btn.icon, .dash-head > .row > .popwrap > .btn.icon { min-width: 42px; padding: 0 12px; }
```
- Z. 1328 `.btn.icon-only { width: 40px; padding-left: 0; padding-right: 0; justify-content: center; }` → `.btn.icon-only { width: 42px; height: 42px; padding: 0; justify-content: center; }`
- Nach Z. 1330 (`.vh`) für „Session starten“ einfügen:
```css
@media (max-width: 1180px) { .btn > .lbl-wide { display: none; } .btn:has(> .lbl-wide) { width: 42px; padding-left: 0; padding-right: 0; } }
```
- Im Block `@media (max-width: 560px)` am Dateiende ergänzen: `.dash-head [data-action="dash-f-open"] { height: 42px; min-width: 42px; padding: 0 12px; }`
(Der runde Knopf am Handy wird in C35 mit höherer Spezifität auf 54 px gesetzt.)

```

## komponenten-C10 · Menü-Knopf nur am Handy

Gruppe komponenten · Cluster shell · Aufwand S · Befunde: abstaende_layout-3, aufbau-1, bereich_shell-1
Quelle: audit/spec/komponenten.md Z. 256–259 · Dateien: web/css/app.css
Abhängig von: —

```text
**C10 – Menü-Knopf nur am Handy** (abstaende_layout-3, aufbau-1, bereich_shell-1)
- Z. 224 `.menu-btn { display: none; }` → `.topbar .menu-btn { display: none; }`
- Z. 923 (im Block `@media (max-width: 960px)`) `.menu-btn { display: inline-flex; }` → `.topbar .menu-btn { display: inline-flex; }`

```

## komponenten-C21b · Konto-Menü unten (.sb-menu): Einträge erben die Menügröße

Gruppe komponenten · Cluster shell · Aufwand S · Befunde: komponenten-35
Quelle: audit/spec/komponenten.md Z. 367–368 · Dateien: web/css/app.css
Abhängig von: komponenten-C21a

```text
- Z. 250 `.sb-menu .item { font-size: 13.5px; color: var(--text-2); } .sb-menu .item:hover { color: var(--text); }` löschen (Z. 251 `.on` bleibt).
- Z. 253 `.sb-menu-row { … padding: 4px 6px 4px 12px; font-size: 13.5px; … }` → `padding: 4px 6px 4px 10px; font-size: 13px;`
```

## komponenten-U3 · App-Tooltip rechts neben einem Element (data-tip-side="right")

Gruppe komponenten · Cluster shell · Aufwand S · Befunde: bereich_shell-20
Quelle: audit/spec/komponenten.md Z. 522–528 · Dateien: web/js/ui.js
Abhängig von: —

```text
**U3 – Tooltip rechts neben einem Element** (bereich_shell-20)
In `bindTips` (Z. 420), in `move` direkt nach `tipFor = t;` einfügen:
```js
if (t.dataset.tipSide === 'right') { const r = t.getBoundingClientRect(), tip = tipEl(); tip.innerHTML = t.dataset.tip; tip.classList.add('on'); tip.style.left = (r.right + 8) + 'px'; tip.style.top = Math.max(8, r.top + r.height / 2 - tip.offsetHeight / 2) + 'px'; return; }
```
danach wie bisher `tipShowAt(...)`.

```

## komponenten-A1 · Seitenleiste ohne doppelte System-Tooltips; eingeklappt App-Tooltip rechts

Gruppe komponenten · Cluster shell · Aufwand M · Befunde: bereich_shell-20
Quelle: audit/spec/komponenten.md Z. 529–537 · Dateien: web/js/app.js
Abhängig von: komponenten-U3

```text
### 3.3 web/js/app.js

**A1 – Seitenleiste ohne doppelte System-Tooltips** (bereich_shell-20)
- Die Zeile mit `const desk = …; const mini = …; document.documentElement.classList.toggle('sb-mini', mini);` (Z. 209) vor `const item` (Z. 207) ziehen.
- Z. 207 in `item`: `title="${label}"` → `${mini ? ` aria-label="${label}" data-tip="${label}" data-tip-side="right"` : ''}`
- Z. 206 (`dot`) und Z. 225 (`cdot`): `title="${esc(w)}"` bzw. `title="${esc(coachWhy)}"` → `data-tip="${esc(w)}"` bzw. `data-tip="${esc(coachWhy)}"`; `aria-label` bleibt.
- Z. 210 Einklapp-Knopf: `title="${mini ? 'Ausklappen' : 'Einklappen'}"` → `data-tip="${mini ? 'Ausklappen' : 'Einklappen'}"${mini ? ' data-tip-side="right"' : ''}`; beim Handy-Schließen-Knopf `title="Schließen"` streichen.
- Z. 227 `.sb-user`: `title="Konto und Einstellungen"` streichen; nur im Mini-Modus ` data-tip="Konto und Einstellungen" data-tip-side="right"` setzen.

```

## komponenten-A2 · Ein Anzeigename App.displayName() für Avatar und Konto-Karte; „Profil ergänzen“

Gruppe komponenten · Cluster shell · Aufwand S · Befunde: bereich_konto-54, hierarchie-47
Quelle: audit/spec/komponenten.md Z. 538–552 · Dateien: web/js/app.js
Abhängig von: —

```text
**A2 – Ein Anzeigename** (bereich_konto-54, hierarchie-47)
- Neue Methode in `App`:
```js
displayName() {
  const st = S.settings, pr = st.profile || {};
  const full = [pr.firstName, pr.lastName].map(x => String(x || '').trim()).filter(Boolean).join(' ');
  const user = String(pr.username || '').trim().replace(/^@/, '');
  const name = full || user || (st.name && st.name !== 'Trader' ? String(st.name).trim() : '') || 'Trader';
  return { name, user, initials: name.split(/\s+/).map(x => x[0]).join('').slice(0, 2).toUpperCase() };
},
```
- `userCard` (Z. 220–223): `full`, `user`, `name`, `initials` aus `this.displayName()` holen.
- `topbar` (Z. 264): `const initials = (S.settings.name || 'T')…` → `const initials = this.displayName().initials;`
- Z. 229: `'<span>Profil vervollständigen</span>'` → `'<span>Profil ergänzen</span>'`

```

## komponenten-A3 · Konto-Menü der Kopfreihe mit Haken-Spalte

Gruppe komponenten · Cluster shell · Aufwand S · Befunde: komponenten-2
Quelle: audit/spec/komponenten.md Z. 553–555 · Dateien: web/js/app.js
Abhängig von: komponenten-C21a

```text
**A3 – Konto-Menü mit Haken-Spalte** (komponenten-2)
In `accountControl` (Z. 244) jedem `.item` (auch „Alle Konten“) vor dem Namen `<span class="chk">${checked ? I.check : ''}</span>` voranstellen (`checked` = derselbe Ausdruck wie `aria-checked`). Der Eintrag „Konten verwalten“ behält sein Zahnrad, es steht in derselben 16-px-Spalte.

```

## komponenten-A4 · „Session starten“ mit Text ab 1181 px (sessionControl ohne iconOnly)

Gruppe komponenten · Cluster shell · Aufwand S · Befunde: referenz-5
Quelle: audit/spec/komponenten.md Z. 556–560 · Dateien: web/js/app.js
Abhängig von: komponenten-C08

```text
**A4 – „Session starten“ mit Text ab 1181 px** (referenz-5)
`sessionControl` (Z. 248–251): Parameter `iconOnly` entfällt; der Zweig ohne Session liefert immer
`<button type="button" class="btn" data-action="start-session" title="Session starten" aria-label="Session starten">${I.play}<span class="lbl-wide">Session starten</span></button>`.
Z. 260 `this.sessionControl(true)` → `this.sessionControl()`. Der laufende Zweig („Beenden“ mit Timer) bleibt.

```

## komponenten-E1f · e2e: Hinweis-Punkte über aria-label statt title prüfen

Gruppe komponenten · Cluster shell · Aufwand S · Befunde: bereich_shell-20
Quelle: audit/spec/komponenten.md Z. 762–762 · Dateien: web/e2e/navdottest.js, web/e2e/coachtest.js, web/e2e/sidebartest.js
Abhängig von: komponenten-A1

```text
- navdottest.js:8 und :53, coachtest.js:94, :98, :127, sidebartest.js:27: `.title` bzw. `getAttribute('title')` an `.nav-dot`/`.sb-av-dot` → `getAttribute('aria-label')`.
```

## komponenten-E1g · e2e usercardtest.js: „Profil ergänzen“

Gruppe komponenten · Cluster shell · Aufwand S · Befunde: hierarchie-47
Quelle: audit/spec/komponenten.md Z. 763–763 · Dateien: web/e2e/usercardtest.js
Abhängig von: komponenten-A2

```text
- usercardtest.js:11: `'Trader / Profil vervollständigen'` → `'Trader / Profil ergänzen'`.
```

## aufbau-B1 · pageHead: leere Kopfreihe nicht rendern, newTradeButton mit Tooltip, head als Funktion

Gruppe aufbau · Cluster shell · Aufwand M · Befunde: bereich_einstellungen-3, responsiv-18, ki_look-22, bereich_konto-25, responsiv-19, bereich_trades_tag-16, hierarchie-7, hierarchie-19
Quelle: audit/spec/aufbau.md Z. 300–316 · Dateien: web/js/app.js
Abhängig von: —

```text
### B – Komponenten

**B1 `pageHead` und `newTradeButton`** (`web/js/app.js` Z. 253–262) · bereich_einstellungen-3, responsiv-18, ki_look-22, bereich_konto-25, responsiv-19, bereich_trades_tag-16, hierarchie-7, hierarchie-19
```js
newTradeButton(tip) { return `<button type="button" class="btn accent tl" data-action="new-trade"${tip ? ` data-tip="${esc(tip)}"` : ''}>${I.plus}<span>Trade loggen</span></button>`; },
pageHead(screen, ctx) {
  const sh = typeof screen.head === 'function' ? screen.head(ctx) : screen.head;
  const h = Object.assign({ range: true, account: true, session: true, trade: true, note: '', tradeTip: '' }, sh);
  const own = screen.actions ? screen.actions(ctx) : '';
  const left = /* unverändert */;
  const right = `${own}${h.session ? this.sessionControl(true) : ''}${h.trade ? `${own || h.session ? '<span class="dh-sep" aria-hidden="true"></span>' : ''}${this.newTradeButton(h.tradeTip)}` : ''}`;
  if (!left && !right) return ''; /* keine leere Kopfreihe (Einstellungen, Coach) */
  return /* unverändert */;
},
```
Kommentar über `pageHead` ergänzen: „screen.head darf eine Funktion von ctx sein (Trade-Ansicht, Tagesansicht)“. Das Dashboard ruft `App.newTradeButton()` ohne Argument auf und bleibt unverändert.

```

## aufbau-B3 · Avatar nur bis 960 px, Initialen aus App.userName()

Gruppe aufbau · Cluster shell · Aufwand M · Befunde: aufbau-7, bereich_shell-11
Quelle: audit/spec/aufbau.md Z. 322–328 · Dateien: web/js/app.js, web/css/app.css
Abhängig von: —

```text
**B3 Avatar nur am Handy, gleiche Initialen** · aufbau-7, bereich_shell-11
- `web/js/app.js`, `userCard` Z. 219–223: Die Namenslogik (`full`, `user`, `name`, `initials`) wird zu einer neuen Methode `userName() { …; return { name, initials, sub }; }` im App-Objekt. `userCard` ruft sie auf.
- `topbar` Z. 264: `const initials = (S.settings.name || 'T')…` → `const { initials } = this.userName();`
- `web/css/app.css` nach Z. 264 neu: `@media (min-width: 961px) { .topbar .avatar, .boot-top .skel.av { display: none; } }`
- Z. 221 Kommentar „richtet sich am rechten Rand der Titelzeile (Avatar) aus“ → „… am rechten Rand der Titelzeile aus“
- Bedingt: Nach dem Ausblenden bei 1100 px Breite messen, ob Zeitraum, Konto und Filter **mit** Beschriftung in `#tb-tools` in eine Reihe passen (`.tb-tools` Höhe ≤ 40 px). Wenn ja, Z. 1332 `@media (min-width: 961px) and (max-width: 1180px)` → `(max-width: 1100px)`. Wenn nein, bleibt 1180.

```

## aufbau-B4 · Konto-Menü: neue Reihenfolge und Markierung

Gruppe aufbau · Cluster shell · Aufwand S · Befunde: bereich_shell-27
Quelle: audit/spec/aufbau.md Z. 329–343 · Dateien: web/js/app.js
Abhängig von: —

```text
**B4 Konto-Menü** (`web/js/app.js` Z. 226–232) · bereich_shell-27
```js
const sp = cur === 'settings' ? (this.state.params[0] || 'profil') : null;
/* Popover-Inhalt: */
link('#/settings/profil', 'account', 'Profil', '', sp === 'profil')
+ link('#/settings', 'settings', 'Einstellungen', '', !!sp && !['profil', 'benachrichtigungen', 'sprache'].includes(sp))
+ link('#/settings/benachrichtigungen', 'bell', 'Benachrichtigungen', '', sp === 'benachrichtigungen')
+ link('#/settings/sprache', 'globe', 'Sprache', '', sp === 'sprache')
+ '<div class="sb-menu-sep"></div>'
+ link('#/coach', 'coach', 'Coach', cdot, cur === 'coach')
+ link('#/affiliate', 'affiliate', 'Affiliate', '', cur === 'affiliate')
+ '<div class="sb-menu-sep"></div>' + /* Zeile „Design“ mit Hell/Dunkel unverändert */
```
Kommentar Z. 216–218 auf die neue Reihenfolge anpassen.

```

## aufbau-B5 · „Konten verwalten“ auf #/settings/konten

Gruppe aufbau · Cluster shell · Aufwand S · Befunde: aufbau-10, bereich_dashboard-33, bereich_training-5
Quelle: audit/spec/aufbau.md Z. 344–346 · Dateien: web/js/app.js
Abhängig von: —

```text
**B5 Konten-Link** (`web/js/app.js` Z. 244, `accountControl`) · aufbau-10, bereich_dashboard-33, bereich_training-5
`<a class="item" href="#/settings">${I.settings} Konten verwalten</a>` → `href="#/settings/konten"`

```

## aufbau-D3d · Tests headtest.js und sixtest.js: Bezug ohne Avatar

Gruppe aufbau · Cluster shell · Aufwand S · Befunde: aufbau-7, bereich_shell-11
Quelle: audit/spec/aufbau.md Z. 708–708 · Dateien: web/e2e/headtest.js, web/e2e/sixtest.js
Abhängig von: aufbau-B3

```text
- `headtest.js:11` und `sixtest.js:11`: Bezug `.topbar .avatar` → rechter Rand von `.topbar .actions` (`r.right <= actionsRight + 1`) und vertikale Mitte von `.topbar h1`
```

## zustaende-S-C19 · Start-Skelett Desktop in den Maßen der fertigen Seite (Kopfreihe 46, Kacheln 131, Karten 396, Seitenleiste, sb-mini)

Gruppe zustaende · Cluster shell · Aufwand M · Befunde: bereich_shell-4
Quelle: audit/spec/zustaende.md Z. 367–389 · Dateien: web/css/app.css
Abhängig von: —

```text
**S-C19 Start-Skelett, Desktop** – bereich_shell-4 (zusammen mit bereich_shell-3; danach bereich_shell-5 aus Spec Responsiv)
Z. 1541 (`.boot-head`), 1542 (`.boot-head .skel`), 1545 (`.boot-tiles .skel`), 1547 (`.boot-main .skel`) ändern, 1548–1552 (`.boot-sb …`) ersetzen; 1543 (`.boot-head .skel.tl`) und die Media-Queries 1553–1554 bleiben (bereich_shell-5 passt 1554 an). Zielregeln:
```css
.boot-head { display: flex; justify-content: flex-end; align-items: center; gap: 8px; min-height: 46px; }
.boot-head .skel { border: 0; border-radius: 9px; height: 42px; width: 40px; }
.boot-tiles .skel { height: 131px; }
.boot-main .skel { height: 396px; }
.boot-sb { display: flex; flex-direction: column; gap: 0; padding: 4px 16px 0; height: 100%; }
.boot-sb .skel { border: 0; border-radius: 6px; height: 14px; width: 62%; margin: 12.5px 0 15.5px; } /* 39-px-Zeile + 3 px wie .nav (Z. 164) – Maße gemeinsam mit .nav a pflegen */
.boot-sb .skel.l { height: 19px; width: 54%; margin: 0 0 4px; }
.boot-sb .skel.l2 { height: 12px; width: 60%; margin: 0 0 18px; }
.boot-sb .sep { display: block; flex: 0 0 auto; height: 1px; background: var(--border); margin: 0 -8px 14px; }
.boot-sb .skel.g { height: 10px; width: 34%; margin: 33px 0 7px; } /* 24-px-Titelzeile, 26 px Gruppenabstand */
.boot-sb .skel.g.first { margin-top: 7px; }
.boot-sb .skel.card { margin: auto 0 0; height: 59px; width: 100%; border-radius: 14px; }
html.sb-mini .boot-sb { padding: 4px 0 0; align-items: center; }
html.sb-mini .boot-sb .skel { width: 40px; }
html.sb-mini .boot-sb .skel.g { height: 1px; width: 40px; }
html.sb-mini .boot-sb .sep { margin: 0 0 14px; width: 40px; }
html.sb-mini .boot-sb .skel.card { width: 40px; height: 40px; border-radius: 50%; }
```
Die bisherige Regel Z. 1552 `html.sb-mini .boot-sb .skel { width: 24px; }` entfällt. An `.nav a` (Z. 169) den Kommentar „Maße gemeinsam mit .boot-sb pflegen“ setzen.

```

## zustaende-S-A2 · Konto-Menü: aktuelle Wahl immer markiert, title „Kontogröße“, Link #/settings/konten

Gruppe zustaende · Cluster shell · Aufwand S · Befunde: bereich_dashboard-34, zustaende-2
Quelle: audit/spec/zustaende.md Z. 532–539 · Dateien: web/js/app.js
Abhängig von: —

```text
**S-A2 Konto-Menü** – bereich_dashboard-34, zustaende-2
Z. 244:
- „Alle Konten“: `aria-checked="${acc === 'all'}"` → `aria-checked="${!acc || acc === 'all'}"`
- je Konto: `aria-checked="${acc === a.id}"` → `aria-checked="${acc === a.id || ((!acc || acc === 'all') && accounts.length === 1)}"`
- Betrag: `<span class="muted small" style="margin-left:auto">` → `<span class="muted small" style="margin-left:auto" title="Kontogröße">`
- `<a class="item" href="#/settings">${I.settings} Konten verwalten</a>` → `href="#/settings/konten"`
- Haken links: über komponenten-2.

```

## zustaende-S-A3 · App.userInfo(): eine Namens-/Initialenquelle für Avatar oben und Konto-Karte

Gruppe zustaende · Cluster shell · Aufwand S · Befunde: bereich_shell-10
Quelle: audit/spec/zustaende.md Z. 540–552 · Dateien: web/js/app.js
Abhängig von: —

```text
**S-A3 Gemeinsame Namenslogik** – bereich_shell-10
Neue Methode im App-Objekt vor `userCard` (Z. 218):
```js
userInfo() {
  const st = S.settings, pr = st.profile || {};
  const full = [pr.firstName, pr.lastName].map(x => String(x || '').trim()).filter(Boolean).join(' '); const user = String(pr.username || '').trim().replace(/^@/, '');
  const name = full || user || (st.name && st.name !== 'Trader' ? String(st.name).trim() : '') || 'Trader';
  const mail = String(pr.email || '').trim();
  return { name, initials: name.split(/\s+/).map(x => x[0]).join('').slice(0, 2).toUpperCase(), sub: mail || (user ? '@' + user : ''), avatarId: st.avatarId || '' };
},
```
`userCard` (Z. 219–223): `name`, `sub`, `initials` aus `const u = this.userInfo();` beziehen (Rest unverändert). `topbar` Z. 264 `const initials = (S.settings.name || 'T').split(…)…;` → `const initials = this.userInfo().initials;`

```

## zustaende-S-H1 · app.html: Theme und sb-mini im <head> vor dem ersten Zeichnen setzen

Gruppe zustaende · Cluster shell · Aufwand S · Befunde: bereich_shell-3
Quelle: audit/spec/zustaende.md Z. 577–587 · Dateien: web/app.html
Abhängig von: —

```text
### 3.8 `web/app.html`

**S-H1 Design und Leiste vor dem ersten Zeichnen** – bereich_shell-3
- Z. 23 `<script src="js/theme.js"></script>` (Ende von body) entfernen.
- Nach Z. 15 (`<link rel="stylesheet" href="css/app.css">`) einfügen:
```html
<script src="js/theme.js"></script>
<script>(function () { try { var raw = localStorage.getItem('trading-journal-web-v1'); var s = raw ? (JSON.parse(raw).settings || {}) : {}; Theme.apply(s); if (s.sidebarMini && matchMedia('(min-width: 961px)').matches) document.documentElement.classList.add('sb-mini'); } catch (e) { } })();</script>
```
(ein Parsen; `Theme.apply(Store.settings)` in Z. 89 und app.js:209 bleiben).

```

## zustaende-S-H2 · app.html: Seitenleisten-Skelett mit Marke, Untertitel, Trennlinie, vier Gruppen und Konto-Karte

Gruppe zustaende · Cluster shell · Aufwand S · Befunde: bereich_shell-4
Quelle: audit/spec/zustaende.md Z. 588–598 · Dateien: web/app.html
Abhängig von: zustaende-S-C19

```text
**S-H2 Skelett der Seitenleiste** – bereich_shell-4
Z. 19, Inhalt von `.boot-sb` ersetzen durch:
```html
<span class="skel l"></span><span class="skel l2"></span><span class="sep"></span>
<span class="skel g first"></span><span class="skel" style="width:52%"></span><span class="skel" style="width:58%"></span><span class="skel" style="width:48%"></span>
<span class="skel g"></span><span class="skel" style="width:56%"></span><span class="skel" style="width:60%"></span><span class="skel" style="width:50%"></span><span class="skel" style="width:46%"></span>
<span class="skel g"></span><span class="skel" style="width:54%"></span><span class="skel" style="width:58%"></span><span class="skel" style="width:44%"></span>
<span class="skel g"></span><span class="skel" style="width:64%"></span><span class="skel" style="width:54%"></span>
<span class="skel card"></span>
```

```

## barrierefreiheit-B12b · Hell/Dunkel-Trefferfläche 26 × 34 und toten sb-mini-Code (Z. 207–208) löschen

Gruppe barrierefreiheit · Cluster shell · Aufwand S · Befunde: barrierefreiheit-28, bereich_shell-30
Quelle: audit/spec/barrierefreiheit.md Z. 377–378 · Dateien: web/css/app.css
Abhängig von: —

```text
| nach Z. 206 (Hell/Dunkel) | 26 × 22 | `.sb-menu .theme-toggle button { position: relative; } .sb-menu .theme-toggle button::after { content: ''; position: absolute; inset: -6px 0; }` (26 × 34, Optik und `translateX` bleiben) | barrierefreiheit-28, bereich_shell-30 |
| Z. 207–208 | `html.sb-mini .theme-toggle {flex-direction: column …}` · `html.sb-mini[data-theme="light"] .theme-toggle::before { transform: translateY(22px); }` | **löschen** (der Schalter steht nur noch im Konto-Menü, `app.js:232`; Z. 255–256 überschreiben beide) | bereich_shell-30 |
```
