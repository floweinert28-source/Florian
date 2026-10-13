# Paket 007 · komponenten

Schritte: 14 · Dateien: web/css/app.css, web/e2e/motiontest.js, web/js/app.js, web/js/datepicker.js, web/js/rangepicker.js, web/js/ui.js
Betroffene Tests laut Spezifikation: web/e2e/calmnavtest.js:49 (scrollLeft der Reiter); web/e2e/dptest.js:63; web/e2e/langtest.js (.rr-m); web/e2e/motiontest.js:31 (animationName === 'pop-in' bleibt gültig); web/e2e/motiontest.js:52–53; web/e2e/motiontest.js:52–53 (Schritt bewegung-3.11a); web/e2e/rangetest.js:10-20 (mob: sichtbarer Monat); web/e2e/scrolltest.js (Scrollstände); web/e2e/tiptest.js (data-tip)
Baut auf Paketen auf: 6

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## responsiv-3.2c · U.chip mit optionalem data-tip

Gruppe responsiv · Cluster komponenten · Aufwand S · Befunde: zustaende-31
Quelle: audit/spec/responsiv.md Z. 416–416 · Dateien: web/js/ui.js
Abhängig von: responsiv-B5c

```text
- Z. 176 `const chip = (text, kind = '') => \`<span class="chip ${kind}">${esc(text)}</span>\`;` → `const chip = (text, kind = '', tip = '') => \`<span class="chip ${kind}"${tip ? \` data-tip="${esc(tip)}"\` : ''}>${esc(text)}</span>\`;` (zustaende-31)
```

## responsiv-3.3d · App.edgeFade für Wischleisten, Aufrufe in render() und im Resize-Listener

Gruppe responsiv · Cluster komponenten · Aufwand M · Befunde: bereich_statistik-47, responsiv-40, bereich_notebook_news-12
Quelle: audit/spec/responsiv.md Z. 441–453 · Dateien: web/js/app.js
Abhängig von: responsiv-A2

```text
- Neue Methode nach `revealActive` (Z. 116) (bereich_statistik-47, responsiv-40, bereich_notebook_news-12):
  ```js
  /* Wischleisten: am Rand, hinter dem es weitergeht, weich auslaufen (fade-l / fade-r); Listener einmal je Leiste */
  edgeFade(scope) {
    (scope || document).querySelectorAll('.tabs, .prop-tabs, .prop-sub, .set-nav, .nb-toolbar').forEach(el => {
      const f = () => { const max = el.scrollWidth - el.clientWidth; el.classList.toggle('fade-l', max > 1 && el.scrollLeft > 2); el.classList.toggle('fade-r', max > 1 && el.scrollLeft < max - 2); };
      if (!el._edgeFade) { el._edgeFade = f; el.addEventListener('scroll', f, { passive: true }); }
      f();
    });
  },
  ```
  Aufrufe: in `render()` nach Z. 107 (`window.scrollTo(…)`) `this.edgeFade(main);`; im Resize-Listener Z. 301 im Timeout zusätzlich `this.edgeFade(document.getElementById('main'));`.

```

## responsiv-3.4 · RangePicker: bei Vorgabe und nur einem sichtbaren Monat den aktuellen Monat zeigen (oneMonth, presetView, pick, setPreset, fit)

Gruppe responsiv · Cluster komponenten · Aufwand M · Befunde: bereich_dashboard-27
Quelle: audit/spec/responsiv.md Z. 454–466 · Dateien: web/js/rangepicker.js
Abhängig von: —

```text
### 3.4 web/js/rangepicker.js (bereich_dashboard-27)

- Nach Z. 27 neu:
  ```js
  /* nur ein Monat sichtbar (Handy, Titelzeile 961–1000px): bei einer Vorgabe den aktuellen Monat zeigen, sonst wie bisher Vormonat + aktueller */
  function oneMonth(box) { const m = box && box.querySelectorAll('.rr-m')[1]; return !!m && getComputedStyle(m).display === 'none'; }
  function presetView(box) { const now = new Date(); return oneMonth(box) ? { y: now.getFullYear(), m: now.getMonth() } : { y: now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear(), m: (now.getMonth() + 11) % 12 }; }
  ```
- Z. 59 `function pick(p) { …; const now = new Date(); st.view = { y: …, m: … }; }` → `function pick(p, box) { …; st.view = presetView(box); }`
- Z. 60 `function setPreset(box, p) { pick(p); refresh(box); }` → `function setPreset(box, p) { pick(p, box); refresh(box); }`
- Neu: `function fit(pop) { const box = pop.querySelector('[data-rr-root]'); if (!box || !st.preset) return; const v = presetView(box); if (v.y !== st.view.y || v.m !== st.view.m) { st.view = v; refresh(box); } }`
- Z. 96 `root.RangePicker = { html, value, init, setPreset };` → `{ html, value, init, setPreset, fit }`

```

## wording-S1.1-1.3 · ui.js: Helfer U.count anlegen und exportieren, Druckersymbol I.printer ergänzen (inkl. Reihenfolge- und Übersetzungshinweis Abschnitt 3)

Gruppe wording · Cluster komponenten · Aufwand S · Befunde: zustaende-28, bereich_notebook_news-29
Quelle: audit/spec/wording.md Z. 288–298 · Dateien: web/js/ui.js
Abhängig von: —

```text
## 3. Umsetzungsschritte

Reihenfolge: erst die gemeinsamen Helfer und die zentrale Namensquelle (Schritte 1–2), dann Komponenten mit CSS (3–4), dann die Einzelstellen je Datei (5–17), danach Wörterbücher, Tests, README (18–20). Zeilenangaben: Stand 13.10.2026. Bei jedem geänderten Text gilt 1.5. In Tabellenzellen steht `\|` für das Zeichen `|` (Markdown-Escaping), `\|\|` also für `||`. Wo „Z.“ steht, ist die Zeile im Code gemeint; nach früheren Schritten können sich Zeilen verschieben, maßgeblich ist der zitierte Text.

### Schritt 1 · `web/js/ui.js` (Helfer)

| # | Stelle | vorher → nachher | ids |
|---|---|---|---|
| 1.1 | nach `pnl` (Z. 165) neue Funktion | – → `const count = (n, one, many) => \`${fmt.int(n)} ${Math.abs(n) === 1 ? one : many}\`;` mit Kommentar „Zähler mit Einzahl/Mehrzahl“ | zustaende-28 |
| 1.2 | Export `root.UI = { … }` (Z. 464) | `… pnl, rText, …` → `… pnl, count, rText, …` | zustaende-28 |
| 1.3 | Icon-Objekt `I` (Z. 9 ff., nach `download`) | – → `printer: sv('<path d="M7 9V3h10v6"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M7 14h10v7H7z"/>'),` (gleicher Strichstil) | bereich_notebook_news-29 |
```

## wording-S3.1-3.3 · app.css: Regeln für Datumsfeld-Overlay (.dp-wrap, .dp-display, .dp-coarse), Touch-Leerzustand, Filter-Datumspaare

Gruppe wording · Cluster komponenten · Aufwand S · Befunde: wording-2, bereich_dashboard-28, wording-62
Quelle: audit/spec/wording.md Z. 323–329 · Dateien: web/css/app.css
Abhängig von: —

```text
### Schritt 3 · `web/css/app.css` (Komponenten-Regeln)

| # | Stelle | vorher → nachher | ids |
|---|---|---|---|
| 3.1 | Block `@media (pointer: fine)` Z. 391–394, ans Ende des Blocks | – → `.dp-wrap { position: relative; display: block; min-width: 0; }` · `.dp-wrap:not(.typing) > .input { color: transparent; }` · `.dp-display { position: absolute; left: 13px; right: 38px; top: 50%; transform: translateY(-50%); pointer-events: none; font: inherit; font-size: 13.5px; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }` · `.dp-display.empty { color: var(--faint); }` · `.dp-wrap.typing .dp-display { display: none; }` · `.dp-coarse { display: none; }` | wording-2, bereich_dashboard-28, wording-62 |
| 3.2 | nach Z. 405 (Teilstück-Regeln) | – → `.input.is-empty::-webkit-datetime-edit { color: var(--faint); }` (Leerzustand auf Touch, ohne Overlay) | wording-2 |
| 3.3 | Filterzeile in Datumspaaren `.fd-pair .input` (Z. 1396) | keine Änderung; das Overlay übernimmt `font-size` über `font: inherit` nicht aus `.input`, darum in 3.1 fest 13.5px. Für `.fd-pop .fd-pair .dp-display` ergänzen: `font-size: 12.5px; left: 11px;` | wording-2 |
```

## wording-S4.1-4.5 · datepicker.js: Anzeige-Overlay für native Datumsfelder mit Maus (decorate, sync, value-Setter, Tippen sichtbar, MutationObserver in init)

Gruppe wording · Cluster komponenten · Aufwand L · Befunde: wording-2, bereich_dashboard-28, wording-62
Quelle: audit/spec/wording.md Z. 335–345 · Dateien: web/js/datepicker.js
Abhängig von: wording-S3.1-3.3

```text
### Schritt 4 · `web/js/datepicker.js` (Anzeige-Overlay für Datumsfelder)

Nur mit Maus (`fine()`). Touch bleibt beim System-Feld (README Z. 307).

| # | Stelle | Änderung | ids |
|---|---|---|---|
| 4.1 | neue Funktion `decorate(inp)` | Für `input.input` mit `TYPES[inp.type]` (date, datetime-local, month; `time` erst, wenn bereich_prop-52 es in `TYPES` aufnimmt) und nur einmal je Feld (`inp.dataset.dpDeco`): Feld in `<span class="dp-wrap">` hüllen, dahinter `<span class="dp-display" aria-hidden="true"></span>` einfügen. Das Feld behält `name`, `id`, `required`, `value` und alle Listener | wording-2, bereich_dashboard-28 |
| 4.2 | neue Funktion `sync(inp)` | Text der Anzeige: datetime-local → `root.UI.fmt.dateTime(new Date(v))`; date → `root.UI.fmt.dateFull(parse(v))` (lokal parsen, nicht `new Date(v)`, sonst Vortag westlich von UTC); month → `monthLabel(y, m)`. Leer: Text aus `inp.dataset.empty`, sonst „–“, und Klasse `empty`. Die Anzeige bekommt `no-i18n` nur, wenn ein Wert dasteht (der Leertext soll übersetzt werden) | wording-2, wording-62 |
| 4.3 | in `decorate` | `const d = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value'); Object.defineProperty(inp, 'value', { configurable: true, get() { return d.get.call(this); }, set(v) { d.set.call(this, v); sync(this); } });` sowie Listener `input` und `change` → `sync(inp)` | wording-2 |
| 4.4 | Tippen sichtbar | `keydown` am Feld mit Ziffer, Backspace, Delete, ArrowUp, ArrowDown → `wrap.classList.add('typing')`; `blur` → `remove('typing')` und `sync(inp)` | wording-2 |
| 4.5 | `init()` | vorhandene Felder einmal dekorieren (`document.querySelectorAll('input.input')`), danach `MutationObserver` auf `document.body` (`childList: true, subtree: true`), der neue Felder dekoriert. Nur wenn `fine()` | wording-2 |
```

## wording-S4.6-4.7 · datepicker.js: Touch-Leerzustand .is-empty setzen; type=week bleibt nativ

Gruppe wording · Cluster komponenten · Aufwand S · Befunde: wording-2, bereich_dashboard-28
Quelle: audit/spec/wording.md Z. 346–348 · Dateien: web/js/datepicker.js
Abhängig von: wording-S3.1-3.3, wording-S4.1-4.5

```text
| 4.6 | Touch-Leerzustand | in `init()` ein `input`-Listener (capture) auf `document`: bei `TYPES[e.target.type]` → `e.target.classList.toggle('is-empty', !e.target.value)`; einmal beim Dekorieren bzw. für alle Felder beim Start setzen | wording-2 |
| 4.7 | `type="week"` | bleibt nativ (Abschnitt 5) | bereich_dashboard-28 |

```

## bewegung-B1 · Knöpfe: kein Anheben, kein Schein an .btn.primary, Druckdauer aus Token

Gruppe bewegung · Cluster komponenten · Aufwand S · Befunde: komponenten-13, bewegung-19, bewegung-20, bewegung-34
Quelle: audit/spec/bewegung.md Z. 167–174 · Dateien: web/css/app.css
Abhängig von: —

```text
### 3.2 `web/css/app.css` – Komponenten

**B1 Knöpfe** (komponenten-13, bewegung-19, bewegung-20, bewegung-34)
- Z. 269 `.btn { … transition: background var(--dur-1) var(--ease), border-color var(--dur-1) var(--ease), transform var(--dur-1) var(--ease), color var(--dur-1) var(--ease), box-shadow var(--dur-2) var(--ease); }` → `, box-shadow var(--dur-2) var(--ease)` streichen.
- Z. 272 `.btn:hover { background: var(--surface-2); border-color: var(--border-2); transform: translateY(-1px); }` → `.btn:hover { background: var(--surface-2); border-color: var(--border-2); }`
- Z. 273 `.btn:active { transform: scale(.97); transition-duration: 60ms; }` → `.btn:active { transform: scale(.97); transition-duration: calc(var(--dur-1) * .4); }`
- Z. 275 `.btn.primary:hover { …; box-shadow: 0 8px 20px -10px var(--accent-glow); }` → `box-shadow: …` streichen. Fläche und Rand laut Farbe-Spezifikation (referenz-6/komponenten-1). Kommt die nicht, bleibt `background: var(--accent-2); border-color: var(--accent-2);`.

```

## bewegung-B2 · Schalter: Übergangszeiten auf Tokens (Knopf 320 ms über calc)

Gruppe bewegung · Cluster komponenten · Aufwand S · Befunde: bewegung-34
Quelle: audit/spec/bewegung.md Z. 175–178 · Dateien: web/css/app.css
Abhängig von: —

```text
**B2 Schalter** (bewegung-34)
- Z. 306 `.switch { … transition: background-color .26s var(--ease), box-shadow .26s var(--ease); }` → `transition: background-color var(--dur-2) var(--ease), box-shadow var(--dur-2) var(--ease);`
- Z. 307 `.switch::after { … transition: transform .32s var(--sw-ease), width .18s var(--ease), background-color .26s var(--ease), box-shadow .26s var(--ease); }` → `transition: transform calc(var(--dur-2) * 4 / 3) var(--sw-ease), width var(--dur-1) var(--ease), background-color var(--dur-2) var(--ease), box-shadow var(--dur-2) var(--ease);`

```

## bewegung-B4a · Popover-Richtung über --pop-y/--pop-y-out, Keyframes pop-in/pop-out mit Custom Properties

Gruppe bewegung · Cluster komponenten · Aufwand M · Befunde: bewegung-27, bewegung-28
Quelle: audit/spec/bewegung.md Z. 185–191 · Dateien: web/css/app.css
Abhängig von: —

```text
**B4 Popover und Menüs: Richtung und Schließen** (bewegung-27, bewegung-28)
- Neu direkt nach Z. 328 (`.popover { … }`): `.popover, .sym-menu, .fd-pop { --pop-y: -4px; --pop-y-out: -4px; } /* unter dem Auslöser: vom Knopf herab */`
- Z. 248 (`.popover.up.open { transform-origin: bottom center; }`) davor neu: `.popover.up { --pop-y: 8px; --pop-y-out: 4px; } /* nach oben öffnend: steigt auf */`
- Keyframes Z. 2374–2375:
  - vorher `@keyframes pop-in { from { opacity: 0; transform: translateY(8px) scale(.985); } }` → nachher `@keyframes pop-in { from { opacity: 0; transform: translateY(var(--pop-y, 8px)) scale(.985); } }`
  - vorher `@keyframes pop-out { to { opacity: 0; transform: translateY(4px) scale(.99); } }` → nachher `@keyframes pop-out { to { opacity: 0; transform: translateY(var(--pop-y-out, 4px)) scale(.99); } }`
  - Dialoge (`.modal`) tragen kein `--pop-y` und bleiben bei 8 px / 4 px.
```

## bewegung-B5 · Kacheln: Hover nur Rand --border-2, .kstrip .tile:hover löschen

Gruppe bewegung · Cluster komponenten · Aufwand S · Befunde: bewegung-18, bereich_statistik-29, komponenten-13, referenz-24
Quelle: audit/spec/bewegung.md Z. 197–202 · Dateien: web/css/app.css
Abhängig von: —

```text
**B5 Kacheln** (bewegung-18, bereich_statistik-29, komponenten-13, referenz-24)
- Z. 515 `.tile { … transition: border-color var(--dur-2) var(--ease), transform var(--dur-2) var(--ease), box-shadow var(--dur-2) var(--ease); }` → `transition: border-color var(--dur-2) var(--ease);`
- Z. 636 `.stat-tile { … }` dieselbe Kürzung.
- Z. 516 → `.tile:hover, .stat-tile:hover { border-color: var(--border-2); }`
- Z. 2603 (`.kstrip .tile:hover { … }`) löschen (K3).

```

## bewegung-C1 · Kalendertage: kein Anheben, eigene Hover-Ränder für Gewinn- und Verlusttage

Gruppe bewegung · Cluster komponenten · Aufwand S · Befunde: bewegung-21, komponenten-13
Quelle: audit/spec/bewegung.md Z. 234–242 · Dateien: web/css/app.css
Abhängig von: —

```text
### 3.3 `web/css/app.css` – Einzelstellen

**C1 Kalendertage** (bewegung-21, komponenten-13)
- Z. 705 `.cal .d { … transition: border-color var(--dur-1) var(--ease), transform var(--dur-1) var(--ease); … }` → `transition: border-color var(--dur-1) var(--ease);`
- Z. 706 → `.cal .d:hover { border-color: var(--border-2); }`
- Nach Z. 711 (`.cal .d.loss { … }`) neu:
  `.cal .d.win:hover { border-color: color-mix(in srgb, var(--profit) 70%, var(--border)); }`
  `.cal .d.loss:hover { border-color: color-mix(in srgb, var(--loss) 75%, var(--border)); }`

```

## bewegung-C7c · Farbwähler-Punkte .cp-c: Auswahl-Ring in leiser Farbe statt Vergrößerung

Gruppe bewegung · Cluster komponenten · Aufwand S · Befunde: bereich_einstellungen-42
Quelle: audit/spec/bewegung.md Z. 285–286 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 459 `.cp-c { …; transition: transform var(--dur-1) var(--ease), box-shadow var(--dur-1) var(--ease); }` → `transition: box-shadow var(--dur-1) var(--ease);`
- Z. 460 → `.cp-c:hover { box-shadow: 0 0 0 2px var(--surface), 0 0 0 3.5px var(--border-2); }` (bleibt vor 461, damit die Auswahl beim Darüberfahren gewinnt).
```

## bewegung-3.11a · motiontest: „Kachel bleibt beim Überfahren stehen“ statt Anheben

Gruppe bewegung · Cluster komponenten · Aufwand S · Befunde: bereich_statistik-29
Quelle: audit/spec/bewegung.md Z. 343–344 · Dateien: web/e2e/motiontest.js
Abhängig von: bewegung-B5

```text
### 3.11 `web/e2e` (Tests an das neue Verhalten anpassen)
- **motiontest.js:52–53** (bereich_statistik-29): `ok('Kachel hebt sich beim Überfahren', … transform !== 'none')` → `ok('Kachel bleibt beim Überfahren stehen', await p.evaluate(() => getComputedStyle(document.querySelectorAll('.tile')[1]).transform === 'none'));`
```
