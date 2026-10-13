# Paket 007 · komponenten

Schritte: 20 · Dateien: web/css/app.css, web/css/landing.css, web/e2e/motiontest.js, web/js/app.js, web/js/datepicker.js, web/js/rangepicker.js, web/js/ui.js
Betroffene Tests laut Spezifikation: prüfen: e2e/coachtest.js (mit Server); prüfen: e2e/usercardtest.js (Konto-Menü); web/e2e/affiliatetest.js; web/e2e/calmnavtest.js:49 (scrollLeft der Reiter); web/e2e/calmnavtest.js:49 (scrollbarWidth der .tabs, muss grün bleiben); web/e2e/dptest.js:63; web/e2e/friedhoftest.js; web/e2e/langtest.js (.rr-m); web/e2e/motiontest.js:31 (animationName === 'pop-in' bleibt gültig); web/e2e/motiontest.js:52–53; web/e2e/proptest.js; web/e2e/rangetest.js:10-20 (mob: sichtbarer Monat); web/e2e/scrolltest.js (Scrollstände); web/e2e/settest.js, web/e2e/settest2.js (.set-nav, muss grün bleiben); web/e2e/tiptest.js (data-tip)
Baut auf Paketen auf: 1, 2, 5, 6

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: .prop-sub] Die drei Schritte vertragen sich. C20 lässt .prop-sub wischbar ohne Scrollbalken, A2 blendet die Ränder per Maske aus, 3.3d setzt fade-l/fade-r. C20 macht aber auch .set-tabs und das neue .subtabs zu wischbaren Leisten (overflow-x: auto, kein Balken). Darum gilt die Wischleisten-Regel von responsiv (28-px-Auslauf an jedem Rand, hinter dem es weitergeht) auch dort, und die Selektorlisten in A2 und 3.3d bekommen .subtabs und .set-tabs dazu. Die Antwort auf aufbau-16 muss nicht abgewartet werden. Bei Ja fällt .prop-sub aus beiden Listen.
- ÄNDERN: In allen drei Masken-Regeln `:is(.tabs, .prop-tabs, .prop-sub, .set-nav)` → `:is(.tabs, .prop-tabs, .prop-sub, .subtabs, .set-tabs, .set-nav)`. Der Rest bleibt unverändert, auch .set-nav ohne Scrollbalken.

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

## responsiv-3.2c · U.chip mit optionalem data-tip

Gruppe responsiv · Cluster komponenten · Aufwand S · Befunde: zustaende-31
Quelle: audit/spec/responsiv.md Z. 416–416 · Dateien: web/js/ui.js
Abhängig von: responsiv-B5c

```text
- Z. 176 `const chip = (text, kind = '') => \`<span class="chip ${kind}">${esc(text)}</span>\`;` → `const chip = (text, kind = '', tip = '') => \`<span class="chip ${kind}"${tip ? \` data-tip="${esc(tip)}"\` : ''}>${esc(text)}</span>\`;` (zustaende-31)
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: data-tip] Konflikt nur bei hbars: diagramme-C14 setzt data-tip an den sichtbaren Balken, an gekürzte Beschriftungen und an ein eigenes Leer-Rechteck. barrierefreiheit-U6b verlangt dagegen eine transparente Trefferfläche über der ganzen Zeile, Beschriftung eingeschlossen. Es gilt U6b, auch im Umbau C14. Dieselbe Bauart haben die dbars in widgets.js (C-widgets-84-93), und so hat jede Zeile genau ein Tooltip-Ziel. Für vbars und hbars gibt es einen gemeinsamen Baustein in ui.js, damit beide gleich lauten. B10 (Summe bei Ø pro Trade) gilt damit auch für „Erwartungswert je Setup“ (hbars mit metric expectancy): const groupTip = (g, v, perTrade) => { const b = `<b>${esc(String(g.label || g.key))}</b>: `; return !g.s.n ? b + 'Keine Trades' : `${b}${fmt.cur(v, { signed: true })}${perTrade ? ' pro Trade' : ''}<br>${perTrade ? `Summe ${fmt.cur(g.s.total, { signed: true })} · ` : ''}${g.s.n} Trades · Win-Rate ${fmt.pct(g.s.winRate)}`; }; Zähler und Begriff ändert danach wording-S1.4-1.7 an dieser einen Stelle. Endstand hbars: Die Beschriftung hat kein eigenes data-tip, denn der volle Name steht fett im Zeilen-Tooltip, und die Fläche darüber würde sie ohnehin verdecken. Eine leere Zeile zeigt nur die Beschriftung in --faint. Der Balken <path class="br"> trägt kein data-tip. Vor </svg> folgt je Zeile <rect class="tip-hit" x="0" y="${mt + i * rowH}" width="${W - mr}" height="${rowH}" fill="transparent" data-tip="${groupTip(g, vals[i], perTrade)}"></rect>. Verträglich ohne Änderung sind U1 (Info-Knopf), responsiv-3.2c (Chip mit tip), komponenten-A1 (Seitenleiste, siehe Anker App.renderSidebar) und C-widgets-84-93; zum Trendpfeil siehe Anker .trend. Die neue „Summe …“-Zeile kommt als Muster in alle fünf Sprachdateien.
- [reihenfolge: U.chip] 3.2c erweitert U.chip um den Parameter tip, und 3.7 und 3.8 rufen ihn auf. Deshalb kommt 3.2c zuerst. S-T4 und 3.7 ändern dieselbe Stelle trades.js:59; die Endform ist x.setup ? U.chip(x.setup, 'setup', x.setup.length > 20 ? x.setup : '') : '<span class="faint">—</span>'. In trades.js:49 ergänzen sich die ph-hide-Klassen aus 3.7 und „—“ in .faint für Geschlossen und Ausstieg aus S-T4. typografie-3.8l (join(' ') im Friedhof) hängt davon nicht ab.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: .prop-sub] Die drei Schritte vertragen sich. C20 lässt .prop-sub wischbar ohne Scrollbalken, A2 blendet die Ränder per Maske aus, 3.3d setzt fade-l/fade-r. C20 macht aber auch .set-tabs und das neue .subtabs zu wischbaren Leisten (overflow-x: auto, kein Balken). Darum gilt die Wischleisten-Regel von responsiv (28-px-Auslauf an jedem Rand, hinter dem es weitergeht) auch dort, und die Selektorlisten in A2 und 3.3d bekommen .subtabs und .set-tabs dazu. Die Antwort auf aufbau-16 muss nicht abgewartet werden. Bei Ja fällt .prop-sub aus beiden Listen.
- ÄNDERN: In App.edgeFade `querySelectorAll('.tabs, .prop-tabs, .prop-sub, .subtabs, .set-tabs, .set-nav, .nb-toolbar')`. Aufrufe in render() und im Resize-Listener bleiben unverändert.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: RangePicker.oneMonth] Beide lösen dasselbe Problem (nur ein Monat sichtbar). responsiv-3.4 übernimmt. Die Erkennung am Layout (`oneMonth(box)`: zweites `.rr-m` hat `display: none`) dupliziert keine CSS-Grenzwerte. `fit(pop)` korrigiert die Ansicht beim Öffnen (über responsiv-3.3b), auch nach Größenänderung. Bei Vorgaben steht der aktuelle Monat. D2s „Monat des Zeitraumendes“ wäre bei „Dieses Jahr“ (`to` = 31.12.) im Oktober der leere Dezember; alle Vorgaben enthalten heute, der aktuelle Monat stimmt also immer. Eigene Zeiträume zeigen in beiden Fassungen den Startmonat. Den Prüfpunkt aus komponenten (pop_zeitraum dark-390: aktueller Monat) erfüllt 3.4.
- [konflikt: RangePicker.pick] Wie beim Anker RangePicker.oneMonth: `pick(p, box)` setzt `st.view = presetView(box)` (responsiv-3.4). D2 entfällt.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: root.UI] Alle Schritte ergänzen verschiedene Namen im selben Export-Objekt, ohne Überschneidung. Endstand ergänzt: toastWrap, announce, lightbox, requestClose, vbarPath, hbarPath, xLabels, fitRadars, scoreText, count, chartEmpty, chartEmptyHTML, fieldErrors, clearFieldError, clearFieldErrors. barrierefreiheit-U7 exportiert toastWrap, darum muss die Funktion vorher aus zustaende-S-U6 da sein (sonst ReferenceError beim Laden von ui.js). Jeder Export kommt erst mit seiner Funktion.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: --faint] Es gilt die app-weite Farbregel: --faint nie für Wörter oder Zahlen (farbe Z. 49; Platzhalter und Leertexte in --muted mit mindestens 4,5:1). (a) Leeres Datumsfeld: Das Overlay „Offen“ und der Touch-Leerzustand stehen in --muted statt --faint, gleich wie .input::placeholder und .lbl-hint. (b) Diagramm-Fach ohne Trades: Die Beschriftung bleibt in --muted wie alle Kategorienamen. Leer erkennt man am fehlenden Balken und am Tooltip „<b>{Name}</b>: Keine Trades“. Gleiches gilt sinngemäß für diagramme-C14 (hbars: !g.s.n ? 'muted' statt 'faint'). (c) barrierefreiheit-B3 bleibt unverändert: Das (i)-Symbol darf --faint sein (leeres/inaktives Symbol); in der Prüfliste der Farbe heißt der Selektor nach B3 button.info statt span.info. (d) zustaende-S-DP entfällt (siehe DatePicker.init). Gleich mit Typografie: Das Overlay bekommt keine eigenen verbotenen Größen 13.5/12.5 px, sondern die Größe seines Feldes.
- [konflikt: .input.is-empty::-webkit-datetime-edit] Die Regel gibt es einmal, in wording-S3.2, mit color: var(--muted) statt var(--faint). Der Touch-Leerzustand ist ein Platzhalter und braucht mindestens 4,5:1 (Entscheidung und Anweisung unter --faint). Die Doppelung aus zustaende-S-DP entfällt (siehe DatePicker.init).
- [konflikt: .fd-pair .input] .fd-pair .input bekommt das Token aus typografie-3.2.3l. Im Filter-Fenster wirkt .fd-pop .fd-pair .input mit var(--fs-12) (typografie-3.2.3f). Das neue Datums-Overlay .dp-display aus wording-S3.1-3.3 nimmt dieselben Stufen wie sein Feld statt 13.5/12.5 px, denn beide Werte sind in der Skala verboten und das Overlay muss deckungsgleich mit dem Feldtext sein: .dp-display { …; font-size: var(--fs-14); line-height: var(--lh-14); } (wie .input nach typografie-3.2.3m) und .fd-pop .fd-pair .dp-display { font-size: var(--fs-12); line-height: var(--lh-12); left: 11px; }. Der leere Zustand („Offen“) steht in Platzhalterfarbe --muted statt --faint, weil --faint laut farbe nie für Wörter gilt und Platzhalter laut farbe-B3a --muted sind: .dp-display.empty { color: var(--muted); } und .input.is-empty::-webkit-datetime-edit { color: var(--muted); }. Die Platzhalter „Von“/„Bis“ und die Filtertexte aus wording-S7.4-7.6 bleiben.
- VERBINDLICH (Kreuzprüfung): web/css/app.css.
3.1 am Ende des Blocks `@media (pointer: fine)` (Z. 391–394): `.dp-wrap { position: relative; display: block; min-width: 0; }` · `.dp-wrap:not(.typing) > .input { color: transparent; }` · `.dp-display { position: absolute; left: 13px; right: 38px; top: 50%; transform: translateY(-50%); pointer-events: none; font: inherit; font-size: var(--fs-14); line-height: var(--lh-14); color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }` · `.dp-display.empty { color: var(--muted); }` · `.dp-wrap.typing .dp-display { display: none; }` · `.dp-coarse { display: none; }`.
3.2 nach Z. 405: `.input.is-empty::-webkit-datetime-edit { color: var(--muted); }`.
3.3 Datumspaare im Filter, im selben (pointer: fine)-Block: `.fd-pair .dp-display { left: 11px; font-size: var(--fs-13); line-height: var(--lh-13); }` und `.fd-pop .fd-pair .dp-display { font-size: var(--fs-12); line-height: var(--lh-12); }`. `.fd-pair .input` (Z. 1396) selbst nicht ändern (Token aus typografie-3.2.3l, im Popover var(--fs-12) aus typografie-3.2.3f). Das Overlay hat damit immer die Größe seines Feldes; 13.5/12.5 px gibt es nicht.
Prüfen: Datumspaar im Filter-Fenster und im Filter-Panel – Overlay deckungsgleich mit dem Feldtext, beide Felder gleich breit.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: DatePicker.TYPES] Beide Schritte bleiben. komponenten-D1 nimmt `time: 1` in TYPES auf und öffnet für Uhrzeitfelder den App-Wähler. Danach legt wording-S4.1-4.5 die Anzeige .dp-display über alle TYPES-Felder, auch time, wie in 4.1 vorgesehen. Damit die Anzeige bei Uhrzeitfeldern nicht leer bleibt, bekommt sync() einen Zweig für time: `root.UI.fmt.time(new Date(2000, 0, 1, +v.slice(0, 2), +v.slice(3, 5)))`. Das ist dieselbe Uhrzeitform wie bei datetime-local über fmt.dateTime, auf Deutsch „09:30“. Ist kein data-empty gesetzt, steht im leeren Feld „—“ (U+2014, Wording W8) statt „–“.
- ÄNDERN: 4.2 sync(): Zweig `time → root.UI.fmt.time(new Date(2000, 0, 1, +v.slice(0, 2), +v.slice(3, 5)))` ergänzen. Rückfall für den Leertext „—“ (U+2014) statt „–“. 4.1 dekoriert time-Felder, weil TYPES.time nach komponenten-D1 gesetzt ist.
- [doppelt: DatePicker.init] wording-S4.1-4.7 übernimmt den Leerzustand der Datumsfelder. zustaende-S-DP ist laut eigener Spezifikation nur ein Ersatz für den Fall, dass wording-2 fehlt, und entfällt. Eine Lücke wird geschlossen: Laut 4.5 läuft der MutationObserver nur bei fine(). Auf Touch bekämen später eingefügte Felder (Trade-Dialog, #f-close) dann beim Öffnen nicht .is-empty. Der Observer läuft darum auf allen Geräten: Bei neuen input.input mit TYPES[type] setzt er immer is-empty (= !value), das Overlay (decorate) baut er nur bei fine(). Damit braucht es kein Sonder-is-empty in app.js.

## wording-S4.6-4.7 · datepicker.js: Touch-Leerzustand .is-empty setzen; type=week bleibt nativ

Gruppe wording · Cluster komponenten · Aufwand S · Befunde: wording-2, bereich_dashboard-28
Quelle: audit/spec/wording.md Z. 346–348 · Dateien: web/js/datepicker.js
Abhängig von: wording-S3.1-3.3, wording-S4.1-4.5

```text
| 4.6 | Touch-Leerzustand | in `init()` ein `input`-Listener (capture) auf `document`: bei `TYPES[e.target.type]` → `e.target.classList.toggle('is-empty', !e.target.value)`; einmal beim Dekorieren bzw. für alle Felder beim Start setzen | wording-2 |
| 4.7 | `type="week"` | bleibt nativ (Abschnitt 5) | bereich_dashboard-28 |

```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: DatePicker.init] wording-S4.1-4.7 übernimmt den Leerzustand der Datumsfelder. zustaende-S-DP ist laut eigener Spezifikation nur ein Ersatz für den Fall, dass wording-2 fehlt, und entfällt. Eine Lücke wird geschlossen: Laut 4.5 läuft der MutationObserver nur bei fine(). Auf Touch bekämen später eingefügte Felder (Trade-Dialog, #f-close) dann beim Öffnen nicht .is-empty. Der Observer läuft darum auf allen Geräten: Bei neuen input.input mit TYPES[type] setzt er immer is-empty (= !value), das Overlay (decorate) baut er nur bei fine(). Damit braucht es kein Sonder-is-empty in app.js.
- ÄNDERN: Den Anfangszustand is-empty (= !value) für alle input.input mit TYPES[type] beim Start und für jedes später eingefügte Feld setzen. Dazu läuft der MutationObserver aus 4.5 auf allen Geräten, ruft aber decorate() nur bei fine() auf. Der input-Listener (capture) bleibt wie in 4.6. type=week bleibt nativ.
- [doppelt: .input.is-empty] wording-S4.6-4.7 übernimmt mit der Ergänzung unter DatePicker.init (Anfangszustand auch für später eingefügte Felder auf Touch). zustaende-S-DP entfällt.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .btn.primary:hover] Der Schein beim Darüberfahren entfällt sofort. bewegung-B1 führt das aus: `box-shadow` aus Z. 275 und aus der Übergangsliste von .btn (Z. 269) streichen; Fläche und Rand bis zur Antwort auf N1 var(--accent-2). komponenten-C06 ist dieselbe Änderung. zustaende-S-C2 ändert danach nur den Selektor auf `.btn.primary:hover:not(:disabled)` und ergänzt `.btn.primary:disabled`. Die Hover-Fläche nach der Antwort auf N1 steht unter Anker .btn.primary (Füllung).
- ÜBERNIMMT komponenten-C06: Glow-Entfernung an .btn.primary:hover nur einmal über bewegung-B1. Die Füllfarbe kommt nach N1 aus der Füllungs-Entscheidung.
- [reihenfolge: .btn:hover] Inhaltlich verträglich, aber beide ändern dieselben Zeilen (Z. 272 .btn:hover, Z. 273 .btn:active, Z. 275 .btn.primary:hover). Zuerst bewegung-B1 (Deklarationen: kein translateY, Druckdauer calc(var(--dur-1) * .4), kein box-shadow), danach zustaende-S-C2 (nur Selektoren mit `:not(:disabled)`). Das gilt ebenso für .btn:active.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .btn.primary:hover] Der Schein beim Darüberfahren entfällt sofort. bewegung-B1 führt das aus: `box-shadow` aus Z. 275 und aus der Übergangsliste von .btn (Z. 269) streichen; Fläche und Rand bis zur Antwort auf N1 var(--accent-2). komponenten-C06 ist dieselbe Änderung. zustaende-S-C2 ändert danach nur den Selektor auf `.btn.primary:hover:not(:disabled)` und ergänzt `.btn.primary:disabled`. Die Hover-Fläche nach der Antwort auf N1 steht unter Anker .btn.primary (Füllung).
- [reihenfolge: .btn:hover] Inhaltlich verträglich, aber beide ändern dieselben Zeilen (Z. 272 .btn:hover, Z. 273 .btn:active, Z. 275 .btn.primary:hover). Zuerst bewegung-B1 (Deklarationen: kein translateY, Druckdauer calc(var(--dur-1) * .4), kein box-shadow), danach zustaende-S-C2 (nur Selektoren mit `:not(:disabled)`). Das gilt ebenso für .btn:active.
- [konflikt: .pager .pg-nav button:disabled] komponenten-C07 gilt. Der Seitenwähler hat keinen Verbund mehr (`.pager .pg-nav { display: inline-flex; gap: 4px; }`), die Pfeile sind `.btn.nav`, die Pager-Regeln Z. 1749–1754 werden gelöscht. Deaktivierte Pfeile folgen damit `.btn:disabled` (opacity var(--disabled-o), cursor not-allowed) wie alle Knöpfe. zustaende behielt die Ausnahme nur farblich (--faint), weil „eine gemeinsame Knopfgruppe fleckig würde“. Diese Gruppe gibt es nach C07 nicht mehr.
- ÄNDERN: Die Ausnahme „Unverändert: Z. 1752 (Pager)“ und der Zielwert „Pager-Pfeile nur --faint“ entfallen; am Pager nichts ändern, die Regeln löscht komponenten-C07. Prüfungen, die --faint an Pager-Pfeilen erwarten, auf opacity var(--disabled-o) umstellen.
- [konflikt: .sp-item .btn.added] „Hinzufügen“ in der Widget-Bibliothek ist ein Listen-Auslöser je Eintrag, kein Panel-Fuß. Also neutral: `btn sm sp-add` (farbe-C19a). Mehrere primary in einem Panel widersprächen „1 je Dialog/Panel“. Komponenten wollte primary lassen; das entfällt. „Hinzugefügt“ wird --muted, transparent, ohne Fläche (farbe-C3a). Das Gewicht 600 an `.sp-item .btn` entfällt, beide Zustände sind 500 und der Knopf bleibt gleich breit. zustaende-S-C2 löscht Z. 1619; `.sp-item .btn.added` (Spezifität 0,3,0) behält opacity 1 und schlägt `.btn:disabled`. Verträglich. e2e: dashtest Z. 38/49/111 auf `.side-panel .sp-item .sp-add:not(.added)` umstellen, wie in der Farbe-Spezifikation (Testteil).

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

**Hinweise aus der Abstimmung (verbindlich):**

- ÜBERNIMMT zustaende-S-TE3: Dieselbe Testanpassung in motiontest.js:52–53; bewegung-3.11a setzt sie einmal um (Name und Prüfung siehe dort).
- [konflikt: .tile:hover] Z. 516 `.tile:hover, .stat-tile:hover { … }` wird ganz gelöscht (zustaende-S-C5), Begründung wie beim Anker .tile. Den Test passt bewegung-3.11a einmal an: Name „Kachel bleibt beim Überfahren ruhig“. Nach `p.hover('.tile >> nth=1')` prüft er `transform === 'none'` und dass `borderColor` gleich dem Wert vor dem Überfahren ist.
- ÄNDERN: motiontest.js:52–53: borderColor von `.tile` (Index 1) vor dem Hover lesen; nach dem Hover `ok('Kachel bleibt beim Überfahren ruhig', cs.transform === 'none' && cs.borderColor === vorher)`.
