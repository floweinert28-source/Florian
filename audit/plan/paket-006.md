# Paket 006 · komponenten

Schritte: 37 · Dateien: web/README.md, web/css/app.css, web/css/landing.css, web/e2e/dashtest.js, web/e2e/motiontest.js, web/js/app.js, web/js/datepicker.js, web/js/rangepicker.js, web/js/ui.js
Betroffene Tests laut Spezifikation: e2e/notechecktest.js:12 (.checklist .it); prüfen: e2e/coachtest.js (mit Server); prüfen: e2e/usercardtest.js (Konto-Menü); web/e2e/affiliatetest.js; web/e2e/calmnavtest.js:49 (scrollbarWidth der .tabs, muss grün bleiben); web/e2e/dashtest.js:15; web/e2e/friedhoftest.js; web/e2e/motiontest.js; web/e2e/motiontest.js: „Kachel hebt sich beim Überfahren“ umkehren (Schritt zustaende-S-TE3); web/e2e/motiontest.js:49 (Toast „Hallo“ nach 2500 ms aus) bleibt gültig, nur prüfen; web/e2e/proptest.js; web/e2e/settest.js, web/e2e/settest2.js (.set-nav, muss grün bleiben)
Baut auf Paketen auf: 2

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## aufbau-A3c · Beschriftungen dichter Raster 12px/500 --muted, .fw-lbl 13/500

Gruppe aufbau · Cluster komponenten · Aufwand S · Befunde: typografie-4
Quelle: audit/spec/aufbau.md Z. 272–277 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 793 `.strat-stats .k { font-size: 11px; color: var(--muted); }` → `font-size: 12px; font-weight: 500; color: var(--muted);`
- Z. 910 `.day-card .stats .k { font-size: 11px; … }` → `font-size: 12px; font-weight: 500; color: var(--muted);`
- Z. 1035 `.nb .stats-grid .k { font-size: 11px; … }` → `font-size: 12px; font-weight: 500; color: var(--muted);`
- Z. 1455 `.fw-stats > div > span { font-size: 11.5px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }` → `font-size: 12px; font-weight: 500;` (Rest bleibt). Danach bei 1440 und 1024 px prüfen: Wird „Disziplin-Kosten“ stärker abgeschnitten als heute, dann Z. 1453 `.fw-stats { … gap: 10px; … }` → `gap: 8px;`
- Z. 1463 `.fw-lbl { font-size: 12.5px; color: var(--text-2); font-weight: 600; }` → `font-size: 13px; color: var(--text-2); font-weight: 500;`

```

## aufbau-A4f · Eyebrows, Labels und Steuerelemente im Filter-Fenster angleichen

Gruppe aufbau · Cluster komponenten · Aufwand S · Befunde: typografie-18
Quelle: audit/spec/aufbau.md Z. 292–295 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 341 `.popover .sec { …; font-weight: 700; }` → `font-weight: 600;`
- Z. 1355 `.fd-pop .fd-gh { padding: 9px 2px; font-size: 13px; }` → `.fd-pop .fd-gh { padding: 10px 2px 6px; font-family: var(--font); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); }` (Pfeil und Zähler bleiben)
- Z. 1360 `.fd-pop .fd-l { font-size: 11.5px; }` → `.fd-pop .fd-l { font-size: 12px; color: var(--muted); }` (600 erbt aus Z. 1381)
- Z. 1386 `.fd-seg button`, Z. 1388 `.fd-tog button`, Z. 1400 `.fd-chip`, Z. 1407 `.fd-add`: jeweils `font-weight: 600` → `font-weight: 500`
```

## aufbau-B9 · Symbol I.award ergänzen

Gruppe aufbau · Cluster komponenten · Aufwand S · Befunde: bereich_dashboard-23
Quelle: audit/spec/aufbau.md Z. 363–365 · Dateien: web/js/ui.js
Abhängig von: —

```text
**B9 Symbol „award“** (`web/js/ui.js` nach Z. 72 `shield: …`) · bereich_dashboard-23
`award: sv('<circle cx="12" cy="8" r="6"/><path d="M15.48 12.89 17 22l-5-3-5 3 1.52-9.11"/>'),`

```

## aufbau-B11 · Kachelleisten mit 4 bzw. 6 Kacheln (kstrip, ab 961 px)

Gruppe aufbau · Cluster komponenten · Aufwand S · Befunde: bereich_konto-29, bereich_statistik-13
Quelle: audit/spec/aufbau.md Z. 370–378 · Dateien: web/css/app.css
Abhängig von: —

```text
**B11 Kachelleisten mit 4 und 6 Kacheln** (`web/css/app.css` nach Z. 2604) · bereich_konto-29, bereich_statistik-13
```css
@media (min-width: 961px) {
  .grid.tiles.kstrip:has(> .tile:nth-child(4):last-child) { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .grid.tiles.kstrip:has(> .tile:nth-child(6):last-child) { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
```
Bis 960 px gilt weiter Z. 2738 (`1fr 1fr`).

```

## diagramme-A8a · Beträge in Balkenzeilen: .bar-row .bl > b Onest/tabular-nums, Zusatz .muted 400

Gruppe diagramme · Cluster komponenten · Aufwand S · Befunde: bereich_training-30
Quelle: audit/spec/diagramme.md Z. 334–335 · Dateien: web/css/app.css
Abhängig von: —

```text
**A8 Beträge in Balkenzeilen** (bereich_training-30)
- nach Z. 658 (`.bar-row .track i`) neu: `.bar-row .bl > b { font-family: var(--font-num); font-variant-numeric: tabular-nums; } .bar-row .bl > b .muted { font-weight: 400; }`
```

## zustaende-S-C2 · Knöpfe und Menüeinträge: kein Hover/Anheben auf Deaktiviertem, Deckkraft über --disabled-o, neutraler .btn.primary:disabled

Gruppe zustaende · Cluster komponenten · Aufwand S · Befunde: zustaende-35, komponenten-42
Quelle: audit/spec/zustaende.md Z. 242–259 · Dateien: web/css/app.css
Abhängig von: zustaende-S-C1

```text
#### Komponenten

**S-C2 Knöpfe: Hover und Deaktiviert** – zustaende-35, komponenten-42
- Z. 272 `.btn:hover {…}` → `.btn:hover:not(:disabled) {…}`
- Z. 273 `.btn:active {…}` → `.btn:active:not(:disabled) {…}`
- Z. 275 `.btn.primary:hover {…}` → `.btn.primary:hover:not(:disabled) {…}`
- Z. 277 `.btn.danger:hover {…}` → `.btn.danger:hover:not(:disabled) {…}`
- Z. 279 `.btn.ghost:hover {…}` → `.btn.ghost:hover:not(:disabled) {…}`
- Z. 286 `.btn:disabled { opacity: .5; cursor: not-allowed; }` → `.btn:disabled, .tpl-menu .item:disabled { opacity: var(--disabled-o); cursor: not-allowed; }` und direkt darunter neu `.btn.primary:disabled { background: var(--surface); border-color: var(--border-2); color: var(--text); box-shadow: none; }`
- Z. 427 `.dp-day:disabled, .dp-month:disabled { opacity: .35; cursor: not-allowed; background: none; }` → `{ opacity: var(--disabled-o); cursor: default; background: none; }`
- Z. 1089 `.nb-toolbar .tb:disabled { opacity: .35; cursor: default; background: none; color: inherit; }` → `{ opacity: var(--disabled-o); cursor: not-allowed; background: none; color: inherit; }`
- Z. 1583 `.w-bar .mv .btn:disabled { opacity: .3; }` löschen.
- Z. 1619 `.sp-item .btn:disabled:not(.added) {…}` löschen (Z. 1618 `.sp-item .btn.added { … opacity: 1 }` bleibt und gewinnt mit 0,3,0).
- Z. 1634 `.tpl-menu .item:disabled { opacity: .5; cursor: default; }` löschen (steckt jetzt in Z. 286).
- Z. 2221 `.rp-btn:disabled { opacity: .6; cursor: default; }` → `{ opacity: var(--disabled-o); cursor: not-allowed; }`
- Z. 2291 `.rp-chip.rp-chip-sm:disabled { opacity: .5; cursor: default; }` → `{ opacity: var(--disabled-o); cursor: not-allowed; }`
- Unverändert: Z. 1752 (Pager), 1019, 1722 (Blind-Replay).

```

## zustaende-S-C5 · Kacheln und Karten ohne Hover (kein Anheben, kein Schatten, kein Randwechsel)

Gruppe zustaende · Cluster komponenten · Aufwand S · Befunde: zustaende-34
Quelle: audit/spec/zustaende.md Z. 281–289 · Dateien: web/css/app.css
Abhängig von: —

```text
**S-C5 Kacheln und Karten ohne Hover** – zustaende-34
- Z. 485 `.card { …; transition: border-color var(--dur-2) var(--ease); }` → `transition: border-color var(--dur-1) var(--ease);`
- Z. 486 `.card:hover { border-color: var(--border-2); }` löschen.
- Z. 515 `.tile { …; transition: border-color var(--dur-2) var(--ease), transform var(--dur-2) var(--ease), box-shadow var(--dur-2) var(--ease); }` → `transition: border-color var(--dur-1) var(--ease);`
- Z. 516 `.tile:hover, .stat-tile:hover { … }` löschen.
- Z. 636 `.stat-tile { …; transition: border-color var(--dur-2) …, transform …, box-shadow … }` → `transition: border-color var(--dur-1) var(--ease);`
- Z. 2603 `.kstrip .tile:hover { … }` löschen (hob nur das Anheben auf; Z. 2602 hat dieselben Linien).
- Unverändert: `--lift-shadow` (Z. 48/59/69, genutzt von landing.css:56), Z. 497 (Info-Symbol), Z. 705 (`.cal .d:hover`).

```

## zustaende-S-C6 · Toast nimmt Zeiger an (Anhalten beim Darüberfahren)

Gruppe zustaende · Cluster komponenten · Aufwand S · Befunde: zustaende-19, barrierefreiheit-20
Quelle: audit/spec/zustaende.md Z. 290–292 · Dateien: web/css/app.css
Abhängig von: —

```text
**S-C6 Toast** – zustaende-19, barrierefreiheit-20
Z. 898 `.toast { … }`: am Ende `pointer-events: auto;` ergänzen. Z. 897 `.toast-wrap` behält `pointer-events: none`.

```

## zustaende-S-C7 · Aktiver Filter-Knopf .btn.is-on im gemeinsamen Ausgewählt-Stil, Zähler .cntb neutral

Gruppe zustaende · Cluster komponenten · Aufwand S · Befunde: bereich_dashboard-6
Quelle: audit/spec/zustaende.md Z. 293–297 · Dateien: web/css/app.css
Abhängig von: —

```text
**S-C7 Gemeinsamer Ausgewählt-Stil und Zähler** – bereich_dashboard-6
- Z. 3123–3126 (Selektorliste vor `{ color: var(--lc, var(--text)); … }`): nach `.sb-user.active` die Klasse `, .btn.is-on` ergänzen.
- Z. 1341 `.btn .cntb { … background: var(--text); color: var(--bg); font-size: 11px; font-weight: 700; }` → `background: color-mix(in srgb, var(--text) 16%, transparent); color: var(--text); font-size: 11px; font-weight: 600;`
- Z. 1421 `.fd-panel .cntb {…}`: dieselbe Änderung.

```

## zustaende-S-C8 · Zeitraum-Kalender, Datumswähler und Notebook-Kalender ohne Grün (Band grau, invertierte Kacheln, Heute unterstrichen)

Gruppe zustaende · Cluster komponenten · Aufwand M · Befunde: farbe_kontrast-23, bereich_dashboard-7, komponenten-7
Quelle: audit/spec/zustaende.md Z. 298–318 · Dateien: web/css/app.css
Abhängig von: —

```text
**S-C8 Zeitraum-Kalender, Datumswähler, Notebook-Kalender ohne Grün** – farbe_kontrast-23 (mit bereich_dashboard-7, komponenten-7)
```css
/* 363 */ .rr-day.today { color: var(--text); font-weight: 600; text-decoration: underline; text-decoration-thickness: 1.5px; text-underline-offset: 4px; text-decoration-color: var(--muted); }
/* neu nach 363 */ .rr-day.start.today, .rr-day.end.today { text-decoration-color: currentColor; }
/* 366 */ … { …; background: var(--surface-3); }            /* statt var(--accent-soft) */
/* 372 */ .rr-day.start::after, .rr-day.end::after { …; background: var(--text); }   /* statt var(--accent) */
/* 373 */ .rr-day.pv-end::after, button.rr-day.in:hover::after { …; background: var(--surface-3); box-shadow: inset 0 0 0 1.5px var(--muted); }
/* 374 */ .rr-day.start, .rr-day.end { color: var(--bg); font-weight: 600; }
/* 423 */ .dp-day.in { background: var(--surface-3); color: var(--text); }
/* 424 */ .dp-day.today { color: var(--text); font-weight: 600; box-shadow: none; text-decoration: underline; text-decoration-thickness: 1.5px; text-underline-offset: 4px; text-decoration-color: var(--muted); }
/* 425 */ .dp-day.edge { box-shadow: inset 0 0 0 1.5px var(--muted); }
/* 426 */ .dp-day.sel { background: var(--text); color: var(--bg); font-weight: 600; box-shadow: none; }
/* neu nach 426 */ .dp-day.sel.today { text-decoration-color: currentColor; }
/* 431 */ .dp-month.today { color: var(--text); box-shadow: none; text-decoration: underline; text-decoration-thickness: 1.5px; text-underline-offset: 4px; text-decoration-color: var(--muted); }
/* 432 */ .dp-month.sel { background: var(--text); color: var(--bg); box-shadow: none; }
/* 436 */ .dp-link.accent { color: var(--text); }
/* 481 */ .dp-t.sel { background: var(--text); color: var(--bg); font-weight: 600; }
/* 1026 */ .datepick .dp.today { box-shadow: none; text-decoration: underline; text-decoration-thickness: 1.5px; text-underline-offset: 4px; text-decoration-color: var(--muted); }
```
Z. 337 (`.popover .item[aria-checked="true"]`) nicht hier, das regelt komponenten-2. Z. 437 (Fokusrahmen) bleibt.

```

## zustaende-S-C9b · Reiter .set-tabs und Unterreiter .prop-sub: Gewicht 500, Unterstrich in --text statt Akzent

Gruppe zustaende · Cluster komponenten · Aufwand S · Befunde: farbe_kontrast-4
Quelle: audit/spec/zustaende.md Z. 323–326 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 1867 `.set-tabs button { … font-weight: 600; … }` → `font-weight: 500`
- Z. 1869 `.set-tabs button[aria-pressed="true"] { color: var(--accent); border-bottom-color: var(--accent); }` → `{ color: var(--text); border-bottom-color: var(--text); }`
- Z. 2595 `.prop-sub a { … font-weight: 600; … }` → `font-weight: 500`
- Z. 2597 `.prop-sub a::after { …; background: var(--accent); … }` → `background: var(--text);`
```

## zustaende-S-C10 · Checkliste: erledigt ohne Durchstreichen, Text --text-2

Gruppe zustaende · Cluster komponenten · Aufwand S · Befunde: zustaende-12
Quelle: audit/spec/zustaende.md Z. 330–332 · Dateien: web/css/app.css
Abhängig von: —

```text
**S-C10 Checkliste ohne Durchstreichen** – zustaende-12
Z. 805 `.checklist .it.done span { color: var(--muted); text-decoration: line-through; }` → `.checklist .it.done span { color: var(--text-2); }`. Z. 1144 und 2928 bleiben.

```

## zustaende-S-U6 · Toast: ein Container als Live-Region (toastWrap/U.toast.init), Längenformel für die Dauer, Anhalten beim Darüberfahren

Gruppe zustaende · Cluster komponenten · Aufwand S · Befunde: zustaende-19, barrierefreiheit-20, bewegung-30
Quelle: audit/spec/zustaende.md Z. 438–453 · Dateien: web/js/ui.js
Abhängig von: zustaende-S-C6

```text
**S-U6 Toast** – zustaende-19, barrierefreiheit-20 (mit bewegung-30)
Z. 444 `function toast(…) {…}` ersetzen:
```js
function toastWrap() { let w = document.querySelector('.toast-wrap'); if (!w) { w = document.createElement('div'); w.className = 'toast-wrap'; w.setAttribute('role', 'status'); w.setAttribute('aria-live', 'polite'); document.body.appendChild(w); } return w; }
function toast(msg, kind = '') {
  const w = toastWrap(); const t = document.createElement('div'); t.className = `toast ${kind}`; t.textContent = msg; w.appendChild(t);
  const ms = Math.min(7000, Math.max(kind === 'err' ? 4500 : 2400, 1200 + String(msg).length * 55)); let tm;
  const leave = () => { const Mo = root.Motion; if (Mo && Mo.enabled) Mo.leave(t, 'out', '--dur-2', () => t.remove()); else t.remove(); };
  const arm = d => { clearTimeout(tm); tm = setTimeout(leave, d); };
  t.addEventListener('mouseenter', () => { clearTimeout(tm); t.classList.remove('out'); });
  t.addEventListener('mouseleave', () => arm(1500));
  arm(ms);
}
toast.init = toastWrap;
```

```

## zustaende-S-DP · Leeres Datumsfeld in --faint (nur Fallback, falls wording-2 nicht umgesetzt ist)

Gruppe zustaende · Cluster komponenten · Aufwand S · Befunde: komponenten-15
Quelle: audit/spec/zustaende.md Z. 865–869 · Dateien: web/js/datepicker.js, web/js/app.js, web/css/app.css
Abhängig von: —

```text
### 3.22 `web/js/datepicker.js` (nur falls wording-2 nicht umgesetzt ist)

**S-DP Leeres Datumsfeld** – komponenten-15
Wird durch wording-2 / zustaende-20 (Spec Wortwahl) erledigt. Ist das bei Umsetzung dieser Spec nicht der Fall: app.js:360 `class="input"` → `class="input${t.closedAt ? '' : ' is-empty'}"`; in `DatePicker.init()` ein Listener `document.addEventListener('input', e => { if (e.target.matches && e.target.matches('input.input[type="date"], input.input[type="datetime-local"], input.input[type="month"]')) e.target.classList.toggle('is-empty', !e.target.value); }, true);` (dasselbe für `change`); CSS nach app.css:294: `.input.is-empty, .input.is-empty::-webkit-datetime-edit { color: var(--faint); }`.

```

## zustaende-S-TE3 · Test motiontest.js: „Kachel bleibt beim Überfahren ruhig“ (transform none)

Gruppe zustaende · Cluster komponenten · Aufwand S · Befunde: zustaende-34
Quelle: audit/spec/zustaende.md Z. 879–879 · Dateien: web/e2e/motiontest.js
Abhängig von: zustaende-S-C5

```text
- `e2e/motiontest.js`: „Kachel hebt sich beim Überfahren“ → „Kachel bleibt beim Überfahren ruhig“ mit Erwartung `transform === 'none'`.
```

## zustaende-S-R1 · README Z. 77: Zeitraum-Kalender ohne grüne Auswahl beschreiben

Gruppe zustaende · Cluster komponenten · Aufwand S · Befunde: —
Quelle: audit/spec/zustaende.md Z. 886–888 · Dateien: web/README.md
Abhängig von: zustaende-S-C8

```text
### 3.25 `web/README.md` – S-R

- Z. 77: „Start und Ende als Kachel in der Akzentfarbe“ → „Start und Ende als Kachel in der Schriftfarbe (invertiert), Band neutral (`--surface-3`), heute unterstrichen; keine grüne Auswahl“.
```

## barrierefreiheit-B3 · Info-Symbol-CSS auf button.info, Touch-Fläche 24 px über ::before, Zeile .lbl-row

Gruppe barrierefreiheit · Cluster komponenten · Aufwand S · Befunde: barrierefreiheit-18, bereich_statistik-31, bereich_dashboard-21
Quelle: audit/spec/barrierefreiheit.md Z. 296–302 · Dateien: web/css/app.css
Abhängig von: —

```text
**B3 Info-Symbol als Knopf** (Z. 492–499, 638, 648)
- In allen Selektoren `span.info` → `button.info` (Z. 492, 493, 494, 496, 497, 498, 499, 638, 648). **Nicht** `.info` allein (`.banner.info` Z. 668).
- Z. 492 ergänzen: `padding: 0; border: 0; background: none; font: inherit; line-height: 0; border-radius: 50%;`
- Neu nach Z. 499: `@media (hover: none) { button.info { position: relative; } button.info::before { content: ''; position: absolute; inset: -5px -5px -5px -3px; } }` (Ziel 24 px, sichtbar 14 px, Farbe bleibt `--faint`).
- Neu: `.field > .lbl-row { display: flex; align-items: center; gap: 2px; } .field > .lbl-row > label { font-size: 12px; font-weight: 600; color: var(--muted); }`
- Befunde: barrierefreiheit-18, bereich_statistik-31, bereich_dashboard-21

```

## barrierefreiheit-B4 · Schalter-Trefferfläche 52 × 38 (.switch::before) und klickbares Zeilenlabel .set-row-l

Gruppe barrierefreiheit · Cluster komponenten · Aufwand S · Befunde: barrierefreiheit-29
Quelle: audit/spec/barrierefreiheit.md Z. 303–307 · Dateien: web/css/app.css
Abhängig von: —

```text
**B4 Schalter-Trefferfläche** (nach Z. 316)
- nachher: `.switch::before { content: ''; position: absolute; inset: -9px -8px; }` (52 × 38; `::after` ist der Knopf und bleibt frei)
- Neu bei Z. 1863–1865: `.set-row-l { display: block; cursor: pointer; }`
- Befunde: barrierefreiheit-29 (und responsiv-26 über die Ergänzung)

```

## barrierefreiheit-B5 · Checklisten-CSS für Knopf-Zeilen und Fokus bei versteckter Checkbox

Gruppe barrierefreiheit · Cluster komponenten · Aufwand S · Befunde: barrierefreiheit-15, bereich_trades_tag-41, bereich_training-20, barrierefreiheit-14
Quelle: audit/spec/barrierefreiheit.md Z. 308–316 · Dateien: web/css/app.css
Abhängig von: barrierefreiheit-A1

```text
**B5 Checklisten** (nach Z. 806)
- nachher:
  ```css
  .checklist button.it { width: 100%; margin: 0; border: 0; text-align: left; cursor: pointer; }
  .checklist .it.toggle:has(input:focus-visible) { outline: 2px solid var(--focus); outline-offset: 2px; }
  ```
  Ohne `background` und ohne `font`, damit Fläche (Z. 800) und Größe (13 px) bleiben.
- Befunde: barrierefreiheit-15, bereich_trades_tag-41, bereich_training-20, barrierefreiheit-14

```

## komponenten-C18 · Checklisten-Zeilen flach mit Haarlinie, nicht durchgestrichen

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: bereich_trades_tag-13, referenz-20
Quelle: audit/spec/komponenten.md Z. 327–333 · Dateien: web/css/app.css
Abhängig von: barrierefreiheit-B5

```text
**C18 – Checklisten-Zeilen flach, nicht durchgestrichen** (bereich_trades_tag-13, referenz-20)
- Z. 799 `.checklist { … gap: 6px; }` → `gap: 0;`
- Z. 800 `.checklist .it { … padding: 9px 10px; border-radius: 9px; background: var(--surface-2); … }` → `padding: 10px 0; border-radius: 0; background: none; border-bottom: 1px solid var(--border);`
- Neu nach Z. 800: `.checklist .it:last-child { border-bottom: 0; }` und `.checklist .it.toggle:hover .box { border-color: var(--text-2); }`
- Z. 805 `.checklist .it.done span { color: var(--muted); text-decoration: line-through; }` ersatzlos löschen.
(Wirkt bewusst auch in Fortschritt und Session-Dialogen.)

```

## barrierefreiheit-B6 · Gewählter Menüeintrag flach statt grün (Popover, Notebook-Setup-Tag, Vorlagen-Menü)

Gruppe barrierefreiheit · Cluster komponenten · Aufwand S · Befunde: barrierefreiheit-26
Quelle: audit/spec/barrierefreiheit.md Z. 317–325 · Dateien: web/css/app.css
Abhängig von: —

```text
**B6 Gewählter Menüeintrag flach statt grün**
- Z. 337 vorher: `.popover .item[aria-checked="true"] { color: var(--accent); }`
- nachher: `.popover .item[aria-checked="true"] { color: var(--text); background: color-mix(in srgb, var(--text) 10%, var(--surface)); }`
- Z. 1044 vorher: `.nb .tagpop .sec.k-setup, .nb .tagpop .item.k-setup[aria-checked="true"] { color: var(--accent); }`
- nachher: `.nb .tagpop .sec.k-setup { color: var(--accent); }`. Der gewählte Setup-Tag ist neutral (README: Setup neutral). 1045–1047 bleiben (Fehler und Emotion tragen Bedeutung).
- Z. 1627 `.tpl-row .chk { … color: var(--accent); … }` → `color: var(--text-2);`
- Z. 1631 `.tpl-row.on .item.name { color: var(--accent); font-weight: 600; }` → `{ color: var(--text); font-weight: 500; }`
- Befunde: barrierefreiheit-26

```

## barrierefreiheit-B7 · Tabellen-CSS: Sortierknopf .th-sort mit 12-px-Chevron, Zeilen-Fokus :focus-within, Scrollbox-Fokus

Gruppe barrierefreiheit · Cluster komponenten · Aufwand S · Befunde: barrierefreiheit-33, zustaende-36, typografie-30, barrierefreiheit-4, bereich_konto-12, bereich_statistik-32, bereich_training-20, barrierefreiheit-50
Quelle: audit/spec/barrierefreiheit.md Z. 326–338 · Dateien: web/css/app.css
Abhängig von: barrierefreiheit-A1

```text
**B7 Tabellen: Sortierknopf, Zeilen-Fokus, Scrollbox**
- Z. 596 vorher: `.tbl th .dir { font-size: 10px; margin-left: 4px; color: var(--text-2); }`
- nachher:
  ```css
  .tbl th .dir { display: inline-flex; margin-left: 4px; color: var(--text-2); }
  .tbl th .dir svg { width: 12px; height: 12px; }
  .tbl th .dir.up svg { transform: rotate(180deg); }
  .th-sort { display: inline-flex; align-items: center; padding: 0; margin: 0; border: 0; background: none; font: inherit; color: inherit; cursor: pointer; border-radius: 4px; }
  ```
- Nach Z. 600: `.tbl tbody tr.link:focus-within td { background: var(--surface-2); } .tbl .row-link:focus-visible { border-radius: 4px; }`
- Nach Z. 1740: `.tbl-scroll:focus-visible { outline-offset: -2px; }`
- Befunde: barrierefreiheit-33, zustaende-36, typografie-30, barrierefreiheit-4, bereich_konto-12, bereich_statistik-32, bereich_training-20, barrierefreiheit-50

```

## barrierefreiheit-B8 · LONG/SHORT-Abzeichen 11 px / 600 / .04em / Satoshi

Gruppe barrierefreiheit · Cluster komponenten · Aufwand S · Befunde: typografie-30
Quelle: audit/spec/barrierefreiheit.md Z. 339–343 · Dateien: web/css/app.css
Abhängig von: —

```text
**B8 LONG/SHORT-Abzeichen** (Z. 618)
- vorher: `font-size: 10.5px; font-weight: 600; letter-spacing: .06em;`
- nachher: `font-size: 11px; font-weight: 600; letter-spacing: .04em; font-family: var(--font);`. Die Mindestbreite 80 px (Z. 607) reicht weiter.
- Befunde: typografie-30

```

## barrierefreiheit-B9a · Bewertungssterne 32 px mit Klasse .on, .seg mit aria-checked, Check-in-Skala min. 36 px (Handy 44 px)

Gruppe barrierefreiheit · Cluster komponenten · Aufwand S · Befunde: barrierefreiheit-12, barrierefreiheit-13
Quelle: audit/spec/barrierefreiheit.md Z. 344–349 · Dateien: web/css/app.css
Abhängig von: —

```text
**B9 Bewertung, Check-in-Skala, gemeinsamer Gewählt-Stil, Reiter**
- Z. 324: `.rating button { width: 26px; height: 26px; …}` → `width: 32px; height: 32px;`
- Z. 325: `.rating button[aria-pressed="true"] { --lc: var(--warn); }` → `.rating button.on { --lc: var(--warn); }`
- Z. 320: `.seg button[aria-pressed="true"]` → `.seg button[aria-pressed="true"], .seg button[aria-checked="true"]`
- Z. 322: `.seg.pill button { border-radius: 999px; padding: 6px 12px; font-size: 12.5px; }` → zusätzlich `min-width: 36px; min-height: 36px;`
- Im Block `@media (max-width: 560px)` ab Z. 2978: `.seg.pill button { min-width: 44px; min-height: 44px; }`
```

## barrierefreiheit-B9b · Gemeinsamer Gewählt-Stil (Z. 3125–3128), .prop-sub und Statistik-Reiter auf aria-current="page"

Gruppe barrierefreiheit · Cluster komponenten · Aufwand S · Befunde: barrierefreiheit-12, barrierefreiheit-13, barrierefreiheit-32, bereich_statistik-7
Quelle: audit/spec/barrierefreiheit.md Z. 350–358 · Dateien: web/css/app.css
Abhängig von: barrierefreiheit-B9a

```text
- Gemeinsame Liste Z. 3125–3128:
  - `.rating button[aria-pressed="true"]` → `.rating button.on`
  - `.seg button[aria-checked="true"]` ergänzen
  - `.tabs a[aria-pressed="true"]` → `.tabs a[aria-current="page"]`
  - `.prop-tabs a[aria-pressed="true"]` → `.prop-tabs a[aria-current="page"]`
- Z. 2596 / 2598: `.prop-sub a[aria-pressed="true"]` → `.prop-sub a[aria-current="page"]`
- Nach Z. 1513 (Statistik-Reiter ohne Inline-Farbe): `.tabs a:not([aria-current="page"]) { color: var(--text-2); } .tabs a:not([aria-current="page"]):hover { color: var(--text); }`
- Befunde: barrierefreiheit-12, barrierefreiheit-13, barrierefreiheit-32, bereich_statistik-7

```

## barrierefreiheit-B10 · Dropzone-Fokus und Screenshot-Knopf .shot-open

Gruppe barrierefreiheit · Cluster komponenten · Aufwand S · Befunde: barrierefreiheit-16, barrierefreiheit-17, bereich_trades_tag-41
Quelle: audit/spec/barrierefreiheit.md Z. 359–367 · Dateien: web/css/app.css
Abhängig von: —

```text
**B10 Dropzone und Screenshot-Knopf** (nach Z. 750 bzw. 754)
- nachher:
  ```css
  .dropzone:focus-visible { outline-offset: 3px; }
  .shot-open { display: block; width: 100%; height: 100%; padding: 0; border: 0; background: none; cursor: zoom-in; }
  .shot-open:focus-visible { outline-offset: -2px; }
  ```
- Befunde: barrierefreiheit-16, barrierefreiheit-17, bereich_trades_tag-41

```

## barrierefreiheit-U1 · U.info rendert <button type="button" class="info"> mit aria-label

Gruppe barrierefreiheit · Cluster komponenten · Aufwand S · Befunde: barrierefreiheit-18, bereich_statistik-31, bereich_dashboard-21
Quelle: audit/spec/barrierefreiheit.md Z. 397–403 · Dateien: web/js/ui.js
Abhängig von: barrierefreiheit-B3

```text
#### `web/js/ui.js`

**U1 Info-Symbol** (Z. 169)
- vorher: `` const info = text => text ? `<span class="info" data-tip="${esc(text)}">${I.info}</span>` : ''; ``
- nachher: `` const info = text => text ? `<button type="button" class="info" data-tip="${esc(text)}" aria-label="${esc(String(text).replace(/<[^>]*>/g, ''))}">${I.info}</button>` : ''; ``
- Befunde: barrierefreiheit-18, bereich_statistik-31, bereich_dashboard-21

```

## barrierefreiheit-U2 · Tooltip auch bei Tastaturfokus (bindTips: focusin/focusout, nur :focus-visible)

Gruppe barrierefreiheit · Cluster komponenten · Aufwand S · Befunde: barrierefreiheit-18, bereich_statistik-31, bereich_dashboard-21
Quelle: audit/spec/barrierefreiheit.md Z. 404–412 · Dateien: web/js/ui.js
Abhängig von: barrierefreiheit-U1

```text
**U2 Tooltip bei Tastaturfokus** (`bindTips`, nach Z. 424)
- nachher:
  ```js
  document.addEventListener('focusin', e => { const t = e.target; if (!t.matches || !t.matches('button.info[data-tip]') || !t.matches(':focus-visible')) return; const r = t.getBoundingClientRect(); tipFor = t; tipShowAt(r.left + r.width / 2, r.top, t.dataset.tip); });
  document.addEventListener('focusout', e => { if (tipFor && e.target === tipFor) tipHide(); });
  ```
  Nur bei `:focus-visible` (kein Doppel-Tooltip nach Mausklick). Nur das eigene Element blendet aus (Maus-Tooltips bleiben unberührt).
- Befunde: barrierefreiheit-18, bereich_statistik-31, bereich_dashboard-21

```

## barrierefreiheit-P4 · Doppel-Schluss verhindern: [data-close] ignoriert ausblendende Dialoge (.modal-bg.out)

Gruppe barrierefreiheit · Cluster komponenten · Aufwand S · Befunde: barrierefreiheit-11
Quelle: audit/spec/barrierefreiheit.md Z. 591–595 · Dateien: web/js/app.js
Abhängig von: —

```text
**P4 Doppel-Schluss verhindern** (Klick-Handler Z. 280)
- vorher: `if (closeEl) { if (closeEl.isConnected) U.closeModal(); return; }`
- nachher: `if (closeEl) { if (closeEl.isConnected && !closeEl.closest('.modal-bg.out')) U.closeModal(); return; }`
- Befunde: barrierefreiheit-11 (Voraussetzung, K26)

```

## barrierefreiheit-C-rangepicker · Zeitraum-Kalender: wandernder tabindex (st.fk), Pfeil-/Bildtasten, Fokus nach Klick halten (Z. 717: Hinweis .shell-Grid/Sprunglink)

Gruppe barrierefreiheit · Cluster komponenten · Aufwand M · Befunde: barrierefreiheit-42
Quelle: audit/spec/barrierefreiheit.md Z. 688–718 · Dateien: web/js/rangepicker.js
Abhängig von: —

```text
### Phase C – Einzelstellen

#### `web/js/rangepicker.js` (barrierefreiheit-42)

- Z. 21: `const st = { from: '', to: '', view: { y: 0, m: 0 }, preset: null };` → zusätzlich `fk: ''` (Fokus-Tag JJJJ-MM-TT).
- Neu vor `monthHTML`:
  ```js
  const visible = k => { const d = parse(k); return !!d && d >= new Date(st.view.y, st.view.m, 1) && d <= new Date(st.view.y, st.view.m + 2, 0); };
  function ensureFk() { if (visible(st.fk)) return; const t = keyOf(new Date()); st.fk = visible(st.from) ? st.from : visible(t) ? t : keyOf(new Date(st.view.y, st.view.m, 1)); }
  ```
- `reset` (Z. 25) und `pick` (Z. 59): am Ende `st.fk = st.from || '';`
- `inner` (Z. 45): als erste Zeile `ensureFk();`
- Z. 41 Tag-Knopf: `tabindex="${k === st.fk ? '0' : '-1'}"` ergänzen.
- Klick-Handler (Z. 71–83):
  - direkt nach `const a = b.dataset.rr;`: `const had = box.contains(document.activeElement);`
  - im Zweig `day`: `st.fk = k;`
  - nach `refresh(box);`: `` if (had) { const t = a === 'day' || a === 'clear' ? box.querySelector('.rr-day[tabindex="0"]') : [...box.querySelectorAll(`[data-rr="${a}"]`)].find(x => x.getClientRects().length); if (t) t.focus({ preventScroll: true }); } ``
- In `init` neu:
  ```js
  document.addEventListener('keydown', e => {
    const d = e.target.closest && e.target.closest('.rr-day[data-k]'); if (!d) return; const box = d.closest('[data-rr-root]'); if (!box) return;
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key], mon = { PageUp: -1, PageDown: 1 }[e.key]; if (!step && !mon) return; e.preventDefault();
    const cur = parse(d.dataset.k); if (step) cur.setDate(cur.getDate() + step); else cur.setMonth(cur.getMonth() + mon); st.fk = keyOf(cur);
    const left = new Date(st.view.y, st.view.m, 1); if (cur < left) st.view = { y: cur.getFullYear(), m: cur.getMonth() }; else if (!visible(st.fk)) { const v = new Date(cur.getFullYear(), cur.getMonth() - 1, 1); st.view = { y: v.getFullYear(), m: v.getMonth() }; }
    refresh(box); let t = box.querySelector(`.rr-day[data-k="${st.fk}"]`);
    if (t && !t.getClientRects().length) { st.view = { y: cur.getFullYear(), m: cur.getMonth() }; refresh(box); t = box.querySelector(`.rr-day[data-k="${st.fk}"]`); } /* nur ein Monat sichtbar (Handy, 961–1000 px) */
    if (t) t.focus({ preventScroll: true });
  });
  ```
  `.shell` ist ein Grid; der Sprunglink (`position: fixed`) nimmt dort keine Zelle ein (geprüft: keine `.shell > …`-Regeln).

```

## barrierefreiheit-E-dashtest-15 · dashtest.js:15 auf button.info umstellen

Gruppe barrierefreiheit · Cluster komponenten · Aufwand S · Befunde: barrierefreiheit-18
Quelle: audit/spec/barrierefreiheit.md Z. 896–902 · Dateien: web/e2e/dashtest.js
Abhängig von: barrierefreiheit-U1

```text
### Phase E – Tests und README

#### `web/e2e/*.js`

| Datei:Zeile | vorher | nachher |
|---|---|---|
| dashtest.js:15 | `'.dash-top span.info, .dash-main span.info'` | `'.dash-top button.info, .dash-main button.info'` |
```

## kilook-B1 · I.coach als Doktorhut statt Funkelform

Gruppe kilook · Cluster komponenten · Aufwand S · Befunde: bereich_shell-28, ki_look-17
Quelle: audit/spec/kilook.md Z. 409–415 · Dateien: web/js/ui.js
Abhängig von: —

```text
### Phase B · Komponenten

**B1 · web/js/ui.js:22 · `I.coach`** (bereich_shell-28, ki_look-17)
- vorher: `coach: sv('<path d="M12 3l1.8 4.6L18 9.5l-4.2 1.9L12 16l-1.8-4.6L6 9.5l4.2-1.9z"/><path d="M19 15l.8 2 …"/>'),`
- nachher: `coach: sv('<path d="M2 9.5L12 5l10 4.5L12 14z"/><path d="M6 11.5V16c0 1.4 2.7 3 6 3s6-1.6 6-3v-4.5"/><path d="M22 9.5V15"/>'),`
- Der Schlüssel bleibt. Damit gilt die Änderung automatisch in app.js:231 (Konto-Menü) und coach.js:22, :112, :172, :188.

```

## kilook-B8b · Startseite: große Knöpfe 15px in Satzschreibung

Gruppe kilook · Cluster komponenten · Aufwand S · Befunde: ki_look-44
Quelle: audit/spec/kilook.md Z. 470–471 · Dateien: web/css/landing.css
Abhängig von: —

```text
- **18** vorher `.lp .btn.big { padding: 16px 30px; font-size: 16px; border-radius: 16px; text-transform: uppercase; letter-spacing: .04em; }`
  → nachher `.lp .btn.big { padding: 16px 30px; font-size: 15px; border-radius: 16px; }`
```

## responsiv-A2 · Wischleisten: 28-px-Auslauf per Maske (fade-l/fade-r) und .set-nav ohne Scrollbalken

Gruppe responsiv · Cluster komponenten · Aufwand S · Befunde: bereich_statistik-47, responsiv-40, bereich_notebook_news-12
Quelle: audit/spec/responsiv.md Z. 227–237 · Dateien: web/css/app.css
Abhängig von: —

```text
**A2 Wischleisten-Auslauf** (bereich_statistik-47, responsiv-40, bereich_notebook_news-12; die allgemeine Regel gilt auch für `.set-nav`, ändert dort aber nicht den Aufbau, siehe 6)
- Nach Z. 1513 global ergänzen:
  ```css
  /* Wischleisten: an dem Rand, hinter dem es weitergeht, weich auslaufen (App.edgeFade setzt fade-l / fade-r) */
  :is(.tabs, .prop-tabs, .prop-sub, .set-nav).fade-r { -webkit-mask-image: linear-gradient(90deg, #000 calc(100% - 28px), transparent); mask-image: linear-gradient(90deg, #000 calc(100% - 28px), transparent); }
  :is(.tabs, .prop-tabs, .prop-sub, .set-nav).fade-l { -webkit-mask-image: linear-gradient(90deg, transparent, #000 28px); mask-image: linear-gradient(90deg, transparent, #000 28px); }
  :is(.tabs, .prop-tabs, .prop-sub, .set-nav).fade-l.fade-r { -webkit-mask-image: linear-gradient(90deg, transparent, #000 28px, #000 calc(100% - 28px), transparent); mask-image: linear-gradient(90deg, transparent, #000 28px, #000 calc(100% - 28px), transparent); }
  ```
- `.nb-toolbar` bekommt keine Maske (siehe B10).
- Z. 1896 (`.set-nav { …; scrollbar-width: thin; }`) → `scrollbar-width: none;` und direkt danach `.set-nav::-webkit-scrollbar { display: none; }` (Wischleisten-Regel, README Z. 361).

```

## responsiv-B5c · Setup-Chip in Tabellen max. 150 px mit Ellipse

Gruppe responsiv · Cluster komponenten · Aufwand S · Befunde: zustaende-31
Quelle: audit/spec/responsiv.md Z. 289–289 · Dateien: web/css/app.css
Abhängig von: —

```text
- Nach Z. 624 neu: `.tbl .chip.setup { display: inline-block; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; vertical-align: middle; }`
```

## responsiv-B6d · Kennzahlen-Leisten: Kachelwert 20 px bei Kacheln ≤ 200 px (Container-Abfrage)

Gruppe responsiv · Cluster komponenten · Aufwand S · Befunde: bereich_prop-13
Quelle: audit/spec/responsiv.md Z. 313–314 · Dateien: web/css/app.css
Abhängig von: —

```text
- Nach Z. 2745 (Ende des Prop-Blocks, nach `.prop-tiles .tile .val` Z. 2684) neu: `@container (max-width: 200px) { .kstrip .tile .val { font-size: 20px; } }`

```

## responsiv-C5 · Formular-Raster .grid.two läuft nie über den Container

Gruppe responsiv · Cluster komponenten · Aufwand S · Befunde: bereich_konto-35
Quelle: audit/spec/responsiv.md Z. 400–402 · Dateien: web/css/app.css
Abhängig von: —

```text
**C5 Formular-Raster** (bereich_konto-35)
- Z. 508 `.grid.two { grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); }` → `.grid.two { grid-template-columns: repeat(auto-fit, minmax(min(340px, 100%), 1fr)); }`

```
