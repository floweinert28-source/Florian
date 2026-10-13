# Paket 007 · komponenten

Schritte: 30 · Dateien: web/README.md, web/css/app.css, web/css/landing.css, web/e2e/dashtest.js, web/js/app.js, web/js/datepicker.js, web/js/rangepicker.js, web/js/ui.js
Betroffene Tests laut Spezifikation: e2e/notechecktest.js:12 (.checklist .it); prüfen: e2e/coachtest.js (mit Server); prüfen: e2e/usercardtest.js (Konto-Menü); web/e2e/affiliatetest.js; web/e2e/calmnavtest.js:49 (scrollLeft der Reiter); web/e2e/calmnavtest.js:49 (scrollbarWidth der .tabs, muss grün bleiben); web/e2e/dashtest.js:15; web/e2e/dptest.js:63; web/e2e/friedhoftest.js; web/e2e/langtest.js (.rr-m); web/e2e/motiontest.js:49 (Toast „Hallo“ nach 2500 ms aus) bleibt gültig, nur prüfen; web/e2e/proptest.js; web/e2e/rangetest.js:10-20 (mob: sichtbarer Monat); web/e2e/scrolltest.js (Scrollstände); web/e2e/settest.js, web/e2e/settest2.js (.set-nav, muss grün bleiben); web/e2e/tiptest.js (data-tip)
Baut auf Paketen auf: 1, 3, 6

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .rr-day.today] „Heute“ wird in allen Wählern einheitlich nach zustaende-S-C8 unterstrichen statt umrandet: `.rr-day.today { color: var(--text); font-weight: 600; text-decoration: underline; text-decoration-thickness: 1.5px; text-underline-offset: 4px; text-decoration-color: var(--muted); }`, dazu `.rr-day.start.today, .rr-day.end.today { text-decoration-color: currentColor; }`. Gründe: (1) Eine Markierung für Zeitraum-Kalender, Datumswähler, Monatswahl und Notebook-Kalender. farbe-B5 gibt .rr-day keinen Ring, den anderen schon. (2) S-C8 nutzt den Ring inset 1.5px --muted bereits für Vorschau und Kante (.rr-day.pv-end, .dp-day.edge). Ein Heute-Ring inset 1px --muted wäre davon kaum zu unterscheiden. (3) Im .rr-day verdeckt das Band (::before) einen Ring seitlich. (4) 600 statt 700: Kalenderknöpfe stehen auf 500, 700 ist nur für Werte. 600 entspricht dem Heute-Kreis im Dashboard-Kalender (komponenten K6). Ohne Grün, ohne Ring.
- [konflikt: .dp-day.today] Nach zustaende-S-C8 (Begründung beim Anker .rr-day.today): `.dp-day.today { color: var(--text); font-weight: 600; box-shadow: none; text-decoration: underline; text-decoration-thickness: 1.5px; text-underline-offset: 4px; text-decoration-color: var(--muted); }` und `.dp-day.sel.today { text-decoration-color: currentColor; }`. Nicht farbe-B5 (`box-shadow: inset 0 0 0 1px var(--muted)`, 700). dptest.js:24 (.dp-day.today genau einmal) bleibt gültig.
- [konflikt: .dp-month.today] Nach zustaende-S-C8, mit derselben Stärke wie die anderen Heute-Markierungen: `.dp-month.today { color: var(--text); font-weight: 600; box-shadow: none; text-decoration: underline; text-decoration-thickness: 1.5px; text-underline-offset: 4px; text-decoration-color: var(--muted); }` sowie neu `.dp-month.sel.today { text-decoration-color: currentColor; }`. Nach S-C8s eigener Regel bekommt eine invertierte Auswahl eine Unterstreichung in currentColor; S-C8 hat das hier nicht ausgeschrieben. Nicht farbe-B5 (Ring --muted).
- ÄNDERN: In Z. 431 zusätzlich `font-weight: 600;`. Nach Z. 432 neu `.dp-month.sel.today { text-decoration-color: currentColor; }`.
- [konflikt: .datepick .dp.today] Notebook-Kalender wie die anderen Wähler nach zustaende-S-C8: `.datepick .dp.today { font-weight: 600; box-shadow: none; text-decoration: underline; text-decoration-thickness: 1.5px; text-underline-offset: 4px; text-decoration-color: var(--muted); }` sowie neu `.datepick .dp.sel.today { text-decoration-color: currentColor; }`, weil .datepick .dp.sel (Z. 1027) bereits invertiert ist (--text/--bg). 600, weil typografie-3.2.4d die Grundschrift von .datepick .dp auf 500 setzt und Heute überall 600 ist. Nicht farbe-B5 (Ring --muted).
- ÄNDERN: In Z. 1026 zusätzlich `font-weight: 600;`. Nach Z. 1027 neu `.datepick .dp.sel.today { text-decoration-color: currentColor; }`.

## zustaende-S-C10 · Checkliste: erledigt ohne Durchstreichen, Text --text-2

Gruppe zustaende · Cluster komponenten · Aufwand S · Befunde: zustaende-12
Quelle: audit/spec/zustaende.md Z. 330–332 · Dateien: web/css/app.css
Abhängig von: —

```text
**S-C10 Checkliste ohne Durchstreichen** – zustaende-12
Z. 805 `.checklist .it.done span { color: var(--muted); text-decoration: line-through; }` → `.checklist .it.done span { color: var(--text-2); }`. Z. 1144 und 2928 bleiben.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .checklist .it.done span] Ergebnis: `.checklist .it.done span { color: var(--text-2); }`, ohne Durchstreichen (zustaende-S-C10). Die Regel wird nicht ersatzlos gelöscht. Grund: Erledigte Punkte treten leise zurück, offene stehen in --text vorn. Das ist eine ruhige Rangfolge ohne Durchstreichen und passt zu „Quill-Checklisten --text-2“ in komponenten. Den Zustand trägt weiterhin die gefüllte Box.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: U.toast] zustaende-S-U6 übernimmt toastWrap() und toast() ganz. Der Container hat role=status und aria-live=polite. Dauer: min(7000, max(err ? 4500 : 2400, 1200 + Länge·55)) ms. Beim Darüberfahren hält der Toast an, nach dem Verlassen bleibt er noch 1500 ms. Ausgeblendet wird über Motion.leave mit '--dur-2', passend zu .toast.out. barrierefreiheit-U4 legt nur noch announce() mit #sr-live an, denn sein toastWrap ist Wort für Wort derselbe. Es gibt nur einen Namen: U.toastWrap (Export über barrierefreiheit-U7). Die Zeile toast.init = toastWrap entfällt. Beim Start wird genau einmal U.toastWrap() aufgerufen (barrierefreiheit-P10). Wo zustaende-S-A1 U.toast.init() vorsieht, steht U.toastWrap(); die Zusammenführung von P10 und S-A1 in App.bind regelt konflikt-1. Formularfehler laufen nicht über Toasts (P12 und komponenten-S-trades-h, siehe #trade-form und #f-dir). wording-S14.8-14.9 ruft U.toast unverändert auf.
- ÄNDERN: Die Zeile toast.init = toastWrap; streichen. Der Start-Aufruf heißt U.toastWrap(), exportiert über root.UI (barrierefreiheit-U7). Alles andere bleibt wie spezifiziert.
- [doppelt: toastWrap] Zwei identische Fassungen von toastWrap(). zustaende-S-U6 übernimmt, U4 legt nur announce() an. Einziger öffentlicher Name ist U.toastWrap, kein toast.init (Einzelheiten unter U.toast).
- [doppelt: .toast-wrap] Den Container legt zustaende-S-U6 an (siehe U.toast). zustaende-S-C6 setzt nur .toast { pointer-events: auto }, .toast-wrap behält pointer-events: none. Damit ist S-C6 verträglich und die Voraussetzung dafür, dass das Anhalten beim Darüberfahren in S-U6 funktioniert.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: --faint] Es gilt die app-weite Farbregel: --faint nie für Wörter oder Zahlen (farbe Z. 49; Platzhalter und Leertexte in --muted mit mindestens 4,5:1). (a) Leeres Datumsfeld: Das Overlay „Offen“ und der Touch-Leerzustand stehen in --muted statt --faint, gleich wie .input::placeholder und .lbl-hint. (b) Diagramm-Fach ohne Trades: Die Beschriftung bleibt in --muted wie alle Kategorienamen. Leer erkennt man am fehlenden Balken und am Tooltip „<b>{Name}</b>: Keine Trades“. Gleiches gilt sinngemäß für diagramme-C14 (hbars: !g.s.n ? 'muted' statt 'faint'). (c) barrierefreiheit-B3 bleibt unverändert: Das (i)-Symbol darf --faint sein (leeres/inaktives Symbol); in der Prüfliste der Farbe heißt der Selektor nach B3 button.info statt span.info. (d) zustaende-S-DP entfällt (siehe DatePicker.init). Gleich mit Typografie: Das Overlay bekommt keine eigenen verbotenen Größen 13.5/12.5 px, sondern die Größe seines Feldes.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .checklist .it.done span] Ergebnis: `.checklist .it.done span { color: var(--text-2); }`, ohne Durchstreichen (zustaende-S-C10). Die Regel wird nicht ersatzlos gelöscht. Grund: Erledigte Punkte treten leise zurück, offene stehen in --text vorn. Das ist eine ruhige Rangfolge ohne Durchstreichen und passt zu „Quill-Checklisten --text-2“ in komponenten. Den Zustand trägt weiterhin die gefüllte Box.
- ÄNDERN: Den Punkt „Z. 805 … ersatzlos löschen“ nicht ausführen. Z. 805 setzt zustaende-S-C10 (`color: var(--text-2)`, kein line-through). Die übrigen C18-Punkte bleiben.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .tbl th .dir] Der Sortierpfeil wird ein Chevron-SVG mit 12 × 12 px (barrierefreiheit-B7): `.tbl th .dir { display: inline-flex; margin-left: 4px; color: var(--text-2); }` ohne font-size, dazu `.tbl th .dir svg { width: 12px; height: 12px; }` und `.tbl th .dir.up svg { transform: rotate(180deg); }`. ▲/▼ werden durch I.chev im Knopf .th-sort ersetzt, und .dir kommt nur in trades.js vor. Die Schriftgröße 11 px aus typografie-3.2.3b wäre deshalb ein toter Wert (Kilook Z11: kein toter Code).

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .rating button] komponenten-C15 ersetzt die Grundregel .rating button (app.css:324) durch .scale5 button: 32×32, Radius 8, Rand --border, Fläche --surface, 500, --text-2, font-size: var(--fs-13); line-height: var(--lh-13). Dazu kommt .scale5.rating button { color: var(--muted); }. Damit sind barrierefreiheit-B9a (32 px) und farbe-B3a (Stern --faint → --muted) erfüllt. Der Gewählt-Zustand folgt der Radio-Semantik aus barrierefreiheit: aria-checked nur am gewählten Stern, Klasse .on kumulativ. Die Sternfarbe ist gelbe Schrift, also --warn-text (farbe): .scale5.rating button.on { --lc: var(--warn-text); }. Die Zeile .rating button[aria-pressed="true"] { --lc: var(--warn); } entfällt. In der gemeinsamen Auswahlregel (app.css:3125) stehen dafür .scale5.rating button.on und .scale5 button[aria-checked="true"]. Das muss deckungsgleich bleiben mit dem Anker .rating button[aria-pressed="true"] (Liste 16).
- ÄNDERN: Z. 324 (32 px) entfällt, das übernimmt komponenten-C15. Z. 325 wird nicht .rating button.on { --lc: var(--warn) }, sondern .scale5.rating button.on { --lc: var(--warn-text); } (in C15). Die übrigen Punkte von B9a (.seg aria-checked, .seg.pill-Größen) regeln die Anker .seg.pill button und .rating button[aria-pressed="true"].
- [konflikt: .seg.pill button] `.seg.pill button` wird gelöscht (komponenten-C14a). Der Check-in wird über komponenten-A6 zur `.scale5`. Die Mindestgröße des Check-ins aus barrierefreiheit bleibt erhalten, sitzt aber am neuen Baustein: `.scale5:not(.rating) button { width: 36px; height: 36px; }` und im Block `@media (max-width: 560px)`: `.scale5:not(.rating) button { width: 44px; height: 44px; }`. Die Bewertungssterne (.scale5.rating) bleiben bei 32. Grund: eine Bauart je Rolle (komponenten K24) und die ausdrückliche Touch-Vorgabe Check-in 36/44 (barrierefreiheit Z5).
- ÄNDERN: Die Punkte zu `.seg.pill button` (Z. 322 min-width/min-height 36 und Handy 44) nicht an .seg.pill setzen. Stattdessen nach komponenten-C15 `.scale5:not(.rating) button { width: 36px; height: 36px; }` anlegen und im ≤560-Block `.scale5:not(.rating) button { width: 44px; height: 44px; }`. Falls der Check-in als radiogroup mit aria-checked umgesetzt wird, gehört der Gewählt-Selektor an `.scale5 button[aria-checked="true"]`.
- [konflikt: .rating] Eine Bauart `.scale5` für Check-in und Bewertung (komponenten), mit der ARIA-Struktur aus barrierefreiheit. Die Zustände hängen deshalb an `aria-checked` bzw. der Klasse `.on`, nicht mehr an `aria-pressed`. Gelbe Schrift ist `--warn-text` (Farbregel). MARKUP app.js: Z. 428 `<span class="lbl" id="f-rating-l">Bewertung</span><div class="scale5 rating" id="f-rating" role="radiogroup" aria-labelledby="f-rating-l">` mit Knöpfen `role="radio" class="${t.rating >= n ? 'on' : ''}" aria-checked="${t.rating === n}" aria-label="${n} von 5 Sternen"`; set-rating schaltet `.on` kumulativ und `aria-checked` nur am n-ten Stern (P13). Z. 513 `scale()` wird `<div class="scale5" role="radiogroup" aria-labelledby="${lid}" data-chips="${name}">` mit `role="radio" aria-checked aria-label="${n} – ${label}"`; seg-set setzt aria-checked (P14a). CSS app.css statt Z. 322–325: `.scale5 { display: inline-flex; gap: 6px; } .scale5 button { width: 32px; height: 32px; padding: 0; border-radius: 8px; border: 1px solid var(--border); background: var(--surface); color: var(--text-2); font-size: 13px; font-weight: 500; cursor: pointer; transition: … var(--dur-1) var(--ease); } .scale5 button:hover { color: var(--text); background: var(--surface-2); } .scale5.rating button { color: var(--muted); } .scale5.rating button.on { --lc: var(--warn-text); }`. Im Handy-Block (≤560px): `.scale5 button { width: 44px; height: 44px; }`, 5 × 44 + 4 × 6 = 244 px. In der gemeinsamen Auswahlregel (~Z. 3125) wird `.rating button[aria-pressed="true"]` zu `.scale5 button[aria-checked="true"], .scale5.rating button.on`; das gilt auch für barrierefreiheit-B9b, das diesen Selektor dann nicht mehr anfasst. Größe: Desktop einheitlich 32 px für beide Skalen, denn 32 ≥ 24 erfüllt WCAG 2.5.8 und eine Bauart hat eine Größe. Die 36 px aus barrierefreiheit stammen von der alten Pillenform, die komponenten löscht. Am Handy 44 px, wie barrierefreiheit es für Touch verlangt, für die ganze Bauart. barrierefreiheit-Test 19 (≥ 44 bei 390 px) bleibt gültig; Prüfpunkt 22 heißt dann „Check-in-Skala 32 px (Handy 44)“.
- ÄNDERN: Es entfallen die Punkte zu Z. 322 (`.seg.pill` min 36), Z. 324 (32 px), Z. 325 (`.rating button.on`) und die `.seg.pill`-Regel im Handy-Block. Das übernimmt komponenten-C15 mit `.scale5` (Desktop 32, Handy 44); `.seg.pill` wird gelöscht. Es bleibt nur Z. 320: `.seg button[aria-checked="true"]` ergänzen.
- [konflikt: .rating button[aria-pressed="true"]] Den Selektor gibt es danach nicht mehr. Endzustand wie beim Anker .rating: `.scale5.rating button { color: var(--muted); }` und `.scale5.rating button.on { --lc: var(--warn-text); }`. Gelbe Schrift ist immer --warn-text (farbe). Im hellen Design hat --warn als Schrift zu wenig Kontrast. In der gemeinsamen Auswahlregel steht `.scale5 button[aria-checked="true"], .scale5.rating button.on`.
- ÄNDERN: Es entfallen die Punkte zu Z. 322 (`.seg.pill` min 36), Z. 324 (32 px), Z. 325 (`.rating button.on`) und die `.seg.pill`-Regel im Handy-Block. Das übernimmt komponenten-C15 mit `.scale5` (Desktop 32, Handy 44); `.seg.pill` wird gelöscht. Es bleibt nur Z. 320: `.seg button[aria-checked="true"]` ergänzen.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: [data-subnav]] stats.js:15 wird zu `<nav class="tabs scroll-x" data-subnav aria-label="Statistik-Bereiche">${TABS.map(([k, l]) => `<a href="#/stats/${k}"${tab === k ? ' aria-current="page"' : ''}>${l}</a>`).join('')}</nav>`. Die Links haben keine Klasse btn und keine Inline-Farbe (Komponenten: kein .btn als Reiter, Schiene .tabs > a aus komponenten-C19). Statt aria-pressed tragen sie aria-current (Barrierefreiheit Z4: nie aria-pressed an Links), der Behälter wird nav mit aria-label. Der gewählte Reiter bekommt seinen Stil über `.tabs a[aria-current="page"]` in der gemeinsamen Liste (barrierefreiheit-B9b). Ohne .btn liefert .tabs > a schon --text-2 und beim Darüberfahren --text. Die beiden Zusatzregeln `.tabs a:not([aria-current="page"])` aus barrierefreiheit-B9b hätten also keine Wirkung und entfallen. calmnavtest.js:50 sucht den gewählten Reiter über [aria-current="page"], und App.revealActive (app.js:113) kennt aria-current schon.
- ÄNDERN: Die beiden Regeln `.tabs a:not([aria-current="page"]) { color: var(--text-2); }` und `…:hover { color: var(--text); }` nach Z. 1513 nicht anlegen. Die Änderungen an der gemeinsamen Gewählt-Liste und an .prop-sub bleiben.
- [konflikt: .prop-sub a[aria-pressed="true"]] Der gewählte Prop-Unterreiter wird nur über aria-current="page" markiert. Links tragen kein aria-pressed (barrierefreiheit Z4), und prop.js:305 setzt aria-current schon heute. komponenten-C20 schreibt die Selektoren gleich als `.prop-sub a[aria-current="page"]` und `.prop-sub a[aria-current="page"]::after`. barrierefreiheit-B9b ändert die .prop-sub-Zeilen nicht mehr.
- ÄNDERN: Der Punkt „Z. 2596 / 2598: .prop-sub a[aria-pressed="true"] → .prop-sub a[aria-current="page"]“ entfällt, das erledigt komponenten-C20. Es bleiben: die gemeinsame Liste Z. 3125–3128 (.rating button.on, .seg button[aria-checked], .tabs a und .prop-tabs a auf aria-current) und `.tabs a:not([aria-current="page"])` nach Z. 1513.
- [konflikt: .tabs.scroll-x] Statistik-Reiter in stats.js Z. 15, genau so: `<nav class="tabs scroll-x" data-subnav aria-label="Statistik-Bereiche">${TABS.map(([k, l]) => `<a href="#/stats/${k}"${tab === k ? ' aria-current="page"' : ''}>${l}</a>`).join('')}</nav>`. Das heißt: <nav> mit Namen, kein .btn, keine Inline-Farbe, kein aria-pressed, aria-current nur am gewählten Link. CSS: `.tabs.scroll-x { overflow-x: auto; flex-wrap: nowrap; padding: 3px; margin: 0; }` (C19). Ungewählt --text-2 und Hover --text kommen aus der Schienen-Regel `.tabs > a` (C19). Gewählt kommt aus der gemeinsamen Regel mit `.tabs a[aria-current="page"]` (B9b). Die Zusatzregel `.tabs a:not([aria-current="page"]) …` aus B9b ist überflüssig. Abstand zum Inhalt: Die Schiene hat jetzt einen sichtbaren Rand und kein Scroll-Polster mit Gegenrand mehr. Deshalb entfällt der −4px-Ausgleich in abstaende-C8. Grund: Schiene statt Rahmenknöpfe (komponenten), Navigation als <nav> mit aria-current (barrierefreiheit Z4), 12 px Reiter↔Inhalt (abstaende).
- ÄNDERN: (1) Die neue Regel nach Z. 1513 (`.tabs a:not([aria-current="page"]) { color: var(--text-2); } … :hover { color: var(--text); }`) nicht anlegen. komponenten-C19 deckt das über `.tabs > a`/`.tabs > a:hover` ab. (2) Den Punkt „Z. 2596/2598 .prop-sub a[aria-pressed] → [aria-current]“ nicht separat ausführen. komponenten-C20 schreibt die .prop-sub-Selektoren direkt mit aria-current. Die Änderungen der gemeinsamen Liste (Z. 3125–3128) bleiben.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: data-tip] Konflikt nur bei hbars: diagramme-C14 setzt data-tip an den sichtbaren Balken, an gekürzte Beschriftungen und an ein eigenes Leer-Rechteck. barrierefreiheit-U6b verlangt dagegen eine transparente Trefferfläche über der ganzen Zeile, Beschriftung eingeschlossen. Es gilt U6b, auch im Umbau C14. Dieselbe Bauart haben die dbars in widgets.js (C-widgets-84-93), und so hat jede Zeile genau ein Tooltip-Ziel. Für vbars und hbars gibt es einen gemeinsamen Baustein in ui.js, damit beide gleich lauten. B10 (Summe bei Ø pro Trade) gilt damit auch für „Erwartungswert je Setup“ (hbars mit metric expectancy): const groupTip = (g, v, perTrade) => { const b = `<b>${esc(String(g.label || g.key))}</b>: `; return !g.s.n ? b + 'Keine Trades' : `${b}${fmt.cur(v, { signed: true })}${perTrade ? ' pro Trade' : ''}<br>${perTrade ? `Summe ${fmt.cur(g.s.total, { signed: true })} · ` : ''}${g.s.n} Trades · Win-Rate ${fmt.pct(g.s.winRate)}`; }; Zähler und Begriff ändert danach wording-S1.4-1.7 an dieser einen Stelle. Endstand hbars: Die Beschriftung hat kein eigenes data-tip, denn der volle Name steht fett im Zeilen-Tooltip, und die Fläche darüber würde sie ohnehin verdecken. Eine leere Zeile zeigt nur die Beschriftung in --faint. Der Balken <path class="br"> trägt kein data-tip. Vor </svg> folgt je Zeile <rect class="tip-hit" x="0" y="${mt + i * rowH}" width="${W - mr}" height="${rowH}" fill="transparent" data-tip="${groupTip(g, vals[i], perTrade)}"></rect>. Verträglich ohne Änderung sind U1 (Info-Knopf), responsiv-3.2c (Chip mit tip), komponenten-A1 (Seitenleiste, siehe Anker App.renderSidebar) und C-widgets-84-93; zum Trendpfeil siehe Anker .trend. Die neue „Summe …“-Zeile kommt als Muster in alle fünf Sprachdateien.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: U.confirmModal] Die Schnittstelle bleibt gleich: confirmModal(title, text, {ok, danger}) gibt ein Promise<boolean> zurück. U3a baut nur das Dialog-Gerüst um, U3b ergänzt data-autofocus (bei danger auf „Abbrechen“, sonst auf der Bestätigung). Alle fünf Aufrufe aus zustaende passen damit zusammen: Titel enden auf „?“, OK-Knopf „Löschen“/„Verwerfen“ mit danger (Z8). Es gibt eine echte Abhängigkeit: S-A5 öffnet die Rückfrage ÜBER dem Check-in-Dialog. Ohne P4 löst „Abbrechen“ bzw. × der Rückfrage zuerst den eigenen Listener aus (closeModal, Motion.leave lässt den Knopf noch im DOM). Danach greift der globale [data-close]-Handler (app.js:280) und schließt zusätzlich den Check-in-Dialog. Deshalb kommt P4 vor S-A5. S-A5 schließt nach „Löschen“ den Check-in-Dialog weiter direkt mit U.closeModal() und nicht über requestClose. So löst der guard aus P14b keine zweite Rückfrage „Änderungen verwerfen?“ aus. Der Fokus nach dem Schließen passt: In S-RP1 setzt .then(go) den Fokus als Microtask, bevor restoreAfterModal per setTimeout(0) läuft. restoreAfterModal sieht den gesetzten Fokus und tut nichts.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .dash-top] Das Kachelraster folgt dem Anker .grid.tiles.kstrip (Block in responsiv-B6a): vier Kacheln ab 721 px in einer Reihe, darunter 2 × 2; fünf Kacheln 561–1240 px als 3 + 2, ab 1241 px in einer Reihe; Handy zwei Spalten. abstaende-C6 behält zwei Teile: die Karussell-Zeilen Z. 1775–1776 löschen und den Block 721–960 px für .dash-main. Seine Kachelblöcke entfallen, sie stehen im Block von B6a. abstaende-C2 (gap var(--grid-gap)) und barrierefreiheit-E-dashtest-15 (Testselektor button.info) sind unabhängig davon.
- [doppelt: .dash-main] Zwei Spalten bei 961–1240 px kommen aus responsiv-B6a. Dessen Selektoren `.dash-main > .w.sz-gross`, `.dash-main > .skel.sz-gross` und `.dash-main > .add-slot.gap.sz-gross` stehen nach Z. 1593 und schlagen Z. 1442/1443/1565/1593. abstaende-C5 enthält dieselbe Regel und gibt sie ab; es behält nur die Container-Regel der Score-Skala. abstaende-C6 (721–960 px, mittel und groß volle Breite, !important wegen Z. 1778) gilt für einen anderen Bereich und bleibt. Ergebnis: ab 1241 px drei Spalten, 721–1240 px zwei (mittel und groß volle Breite), bis 720 px eine. abstaende-C2 (gap und Höhen mit --grid-gap) und dashtest.js:15 sind unabhängig.

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
- ÄNDERN: 3.1: .dp-display.empty { color: var(--muted); } statt var(--faint). .dp-display font-size: var(--fs-14) statt 13.5px (die Typografie hebt .input auf 14). Zusätzlich .fd-pair .dp-display { font-size: var(--fs-13); }. 3.2: .input.is-empty::-webkit-datetime-edit { color: var(--muted); } statt var(--faint). 3.3: .fd-pop .fd-pair .dp-display { font-size: var(--fs-12); left: 11px; } statt 12.5px. Der Rest von 3.1–3.3 bleibt.
- [konflikt: .input.is-empty::-webkit-datetime-edit] Die Regel gibt es einmal, in wording-S3.2, mit color: var(--muted) statt var(--faint). Der Touch-Leerzustand ist ein Platzhalter und braucht mindestens 4,5:1 (Entscheidung und Anweisung unter --faint). Die Doppelung aus zustaende-S-DP entfällt (siehe DatePicker.init).
- [konflikt: .fd-pair .input] .fd-pair .input bekommt das Token aus typografie-3.2.3l. Im Filter-Fenster wirkt .fd-pop .fd-pair .input mit var(--fs-12) (typografie-3.2.3f). Das neue Datums-Overlay .dp-display aus wording-S3.1-3.3 nimmt dieselben Stufen wie sein Feld statt 13.5/12.5 px, denn beide Werte sind in der Skala verboten und das Overlay muss deckungsgleich mit dem Feldtext sein: .dp-display { …; font-size: var(--fs-14); line-height: var(--lh-14); } (wie .input nach typografie-3.2.3m) und .fd-pop .fd-pair .dp-display { font-size: var(--fs-12); line-height: var(--lh-12); left: 11px; }. Der leere Zustand („Offen“) steht in Platzhalterfarbe --muted statt --faint, weil --faint laut farbe nie für Wörter gilt und Platzhalter laut farbe-B3a --muted sind: .dp-display.empty { color: var(--muted); } und .input.is-empty::-webkit-datetime-edit { color: var(--muted); }. Die Platzhalter „Von“/„Bis“ und die Filtertexte aus wording-S7.4-7.6 bleiben.
- ÄNDERN: 3.1: .dp-display mit font-size: var(--fs-14); line-height: var(--lh-14) statt 13.5px. .dp-display.empty { color: var(--muted); }. 3.2: .input.is-empty::-webkit-datetime-edit { color: var(--muted); }. 3.3: .fd-pop .fd-pair .dp-display { font-size: var(--fs-12); line-height: var(--lh-12); left: 11px; } statt 12.5px.

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
