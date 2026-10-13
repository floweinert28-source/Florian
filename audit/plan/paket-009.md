# Paket 009 · shell

Schritte: 28 · Dateien: web/README.md, web/app.html, web/css/app.css, web/e2e/coachtest.js, web/e2e/navdottest.js, web/e2e/sidebartest.js, web/e2e/usercardtest.js, web/index.html, web/js/app.js, web/js/screens/dashboard.js, web/js/ui.js
Betroffene Tests laut Spezifikation: e2e/coachtest.js:30, :94, :98, :127; e2e/coachtest.js:38; e2e/coachtest.js:94, :98, :127; e2e/headtest.js:11 (Vorlage icon-only); e2e/langtest.js:30 (title-Attribute); e2e/mobiletest.js:16, :50; e2e/mobiletest.js:50; e2e/motiontest.js:62–66; e2e/navdottest.js:8, :53; e2e/shadowtest.js:16; e2e/sidebartest.js; e2e/sidebartest.js:27; e2e/sidebartest.js:44; e2e/sixtest.js:12; e2e/sixtest.js:12, :36; e2e/tiptest.js; e2e/usercardtest.js; e2e/usercardtest.js:11; e2e/usercardtest.js:55; e2e/voicetest.js:21; prüfen: e2e/sidebartest.js; prüfen: e2e/sidebartest.js:44, e2e/motiontest.js:62–66 (.menu-btn); prüfen: e2e/usercardtest.js:12; prüfen: e2e/usercardtest.js:21–28 (#pop-user .theme-toggle); web/e2e/headtest.js:11-31, :69 (Konto oben rechts, Handy-Kopfreihe ≤ 80 px); web/e2e/headtest.js:30-31 (1000 px: Konto nur Symbol); web/e2e/headtest.js:69; web/e2e/mobiletest.js:18; web/e2e/mobiletest.js:18 (Kopfreihe); web/e2e/mobiletest.js:39-40 (bleibt grün); web/e2e/mobiletest.js:59-60; web/e2e/motiontest.js:38-39; web/e2e/motiontest.js:62-66 (Schublade öffnen/schließen); web/e2e/proptest.js:19 (kein Zeitraum/Konto); web/e2e/scrolltest.js:8; web/e2e/sidebartest.js; web/e2e/sidebartest.js:44-45 (Handy: nichts ragt rechts über die Schublade); web/e2e/sixtest.js:10, :36 (Mentor-Kopfreihe nur mit Konto); web/e2e/tlfittest.js (muss grün bleiben); web/e2e/usercardtest.js (müssen grün bleiben); web/e2e/usercardtest.js:55-58 (Handy: Karte nach Scrollen klickbar)
Baut auf Paketen auf: 1, 2, 5

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: .nav a] Alle fünf Schritte gelten und landen in einer Regel. Der Selektor heißt nur noch `.nav a` (kilook-C1a, `.nav` enthält laut app.js:210 keine `<button>`). Z. 169–173 danach: `gap: var(--sp-3)` (A9), `font-size: var(--fs-14); line-height: var(--lh-14)` (3.2.3n), `transition` ohne `, transform var(--dur-2) var(--ease)` (B3), dazu der Kommentar „Maße gemeinsam mit .boot-sb pflegen“ (S-C19). `.nav a:hover { background: var(--surface-2); color: var(--text); }`; kein `:active` und kein `.nav a.active:hover`. Folge fürs Skelett: Mit 14/20 statt 14,5 × 1,45 ist ein Eintrag 38 statt 39 px hoch (8 + 20 + 8 + 2 Rand), das Raster der Leiste also 41 statt 42 px (Dichte-Stufen: 34/32 px). Deshalb kommt S-C19 erst nach 3.2.3n und nimmt die Werte aus dem Anker `.boot-sb`. Die responsiv-Prüfung „Zeilenhöhe .nav a 39 px (± 1)“ ist mit 38 erfüllt, die Gewichtsregel (Navigation 500) bleibt.
- [konflikt: .nav button] `.nav button` fällt aus allen Selektorlisten (kilook-C1a; kein Element im Markup, grep app.js:210). A9, B3 und 3.2.3n setzen ihre Werte nur an `.nav a`. Wichtig: B3 schreibt Z. 176 laut Spezifikation als `.nav a:hover, .nav button:hover { … }`. Das würde den toten Selektor zurückbringen, egal in welcher Reihenfolge umgesetzt wird. Ergebnis: `.nav a:hover { background: var(--surface-2); color: var(--text); }`. Gilt ebenso für Z. 149/155 (Dichte), 175 (svg), 195/196 (sb-mini).
- ÄNDERN: `gap: var(--sp-3)` an `.nav a` (Selektor ohne `.nav button`).

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

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .sidebar .spacer] Beide verschieben die zwei Dichte-@media-Blöcke (Z. 146–157 samt Kommentar) hinter `.sidebar .spacer { flex: 1; }` (Z. 187). Das passiert einmal über abstaende-D1 (1), dabei wird `.brand { padding-bottom: 14px; }` aus dem 1060er-Block gestrichen (die Marke hat nach D1 kein unteres Polster mehr). Polster und Konto-Karte regelt der Anker .sb-userwrap.
- ÜBERNIMMT responsiv-B1: Verschieben über abstaende-D1 (1). B1 wird insgesamt nicht separat umgesetzt (siehe .sb-userwrap). Die B1-Tests (sidebartest 1440×1000, usercardtest:21, mobiletest:59–60) laufen bei D1 mit.
- [konflikt: .sb-userwrap] Ein Modell für Desktop und Schublade: Die Leiste hat unten kein Polster, die 18 px trägt die klebende Konto-Karte. Desktop (D1 mit Änderung): `.sidebar { …; padding: 0 14px 0; }`. Oben 0 kommt aus D1, weil .brand jetzt min-height var(--topbar-h) hat; unten 0 aus B1. Z. 232 `.sb-userwrap { margin-top: 10px; flex: 0 0 auto; }` → `.sidebar .sb-userwrap { position: sticky; bottom: 0; z-index: 1; flex: 0 0 auto; margin-top: 2px; padding: 8px 0 18px; background: var(--bg-2); } /* Konto-Karte bleibt sichtbar, die Navigation scrollt darunter */`. Der Selektor mit .sidebar ist Pflicht: Das Element ist zugleich .popwrap, und `.popwrap { position: relative }` (Z. 328) steht später. B1s bloßes `.sb-userwrap { position: sticky }` hätte nicht gewirkt. Kein negatives bottom und kein negativer Rand wie in der D1-Fassung, weil die Schublade (responsiv-B2) unten ebenfalls 0 Polster setzt und die Karte dort sonst 18 px unter den Rand rutschte. Ergebnis wie von D1 gemessen: Die Karte endet bei innerHeight − 18, darüber 10 px Luft (2 + 8). Die D1-Teile (3) .brand, (4) .sb-sep, (5) mini-.brand bleiben unverändert.
- ÜBERNIMMT responsiv-B1: Unteres Polster 0 und klebende Konto-Karte sind in abstaende-D1 (geändert) enthalten, nicht separat umsetzen.
- [konflikt: .sidebar .sb-userwrap] Die Schublade ≤ 960 px (responsiv-B2) übernimmt das D1-Modell. In der Regel Z. 918: `padding: env(safe-area-inset-top, 0px) 14px 0 calc(14px + env(safe-area-inset-left, 0px));` statt `calc(22px + env(...)) …`. Nach D1 ist die Marke überall so hoch wie die Titelzeile (min-height var(--topbar-h), Inhalt mittig). 22 px zusätzlich ergäben oben 94 statt 72 px, also einen anderen Kopf als am Desktop. Safe Area bleibt berücksichtigt. `.sidebar .sb-userwrap { padding-bottom: calc(18px + env(safe-area-inset-bottom, 0px)); }` bleibt und passt zu „unten 0“. Im neuen Block `@media (max-width: 960px) and (max-height: 940px)` steht nur `.sidebar .nav.nav-group + .nav.nav-group { margin-top: 16px; }`. `.sidebar .brand { padding-bottom: 14px; }` entfällt: Die Marke hat nach D1 kein unteres Polster, und D1 streicht dieselbe Zeile im Desktop-Dichteblock. visibility-Übergänge bleiben wie spezifiziert.
- [konflikt: .sidebar] D1 und B1 verschieben beide die Dichte-Blöcke und machen die Konto-Karte klebend, aber nach verschiedenen Modellen (D1: .sidebar unten 18 px Polster, Karte mit bottom: -18px und negativem Rand; B1: oben 22 px Polster, unten 0, Karte mit bottom: 0). Festlegung: (a) Die Dichte-Blöcke verschiebt D1 einmal hinter .sidebar .spacer und streicht dabei .brand { padding-bottom: 14px; }, weil die Marke eine feste Höhe hat. (b) Oben gilt D1: .sidebar ohne Polster oben, .brand { min-height: var(--topbar-h); padding: 0 0 0 16px; }, Linie .sb-sep bei y = 71 über die volle Breite, ausgeklappt und eingeklappt, html.sb-mini .brand wie D1 (5). (c) Unten gilt das Modell von B1 bzw. responsiv-K3: .sidebar { padding: 0 14px 0; }. Der Abstand unten steckt in der Karte: .sidebar .sb-userwrap { position: sticky; bottom: 0; z-index: 1; flex: 0 0 auto; margin-top: 2px; padding: 8px 0 18px; background: var(--bg-2); }. Den Selektor mit .sidebar braucht es wie in D1, sonst gewinnt .popwrap { position: relative } aus Z. 328. bottom: -18px und negativer Rand entfallen: Ohne Polster unten scheint unter der Karte keine Navigation durch (responsiv-Prüfpunkt 11), und .sb-user endet trotzdem bei innerHeight − 18 (abstaende-Messung). (d) Für die Schublade ≤ 960 px gilt B2: oben calc(22px + inset-top), unten 0, Karte unten calc(18px + inset-bottom). Die Ausrichtung der Marke an der 72-px-Titelzeile gilt dort nicht, die Schublade behält ihre bisherige Marke. H2 (nav statt aside) ändert keine Selektoren und ist verträglich. Dieselbe Festlegung gilt für die Anker .sb-userwrap, .sidebar .sb-userwrap und .sidebar .spacer der anderen Konfliktliste.
- ÜBERNIMMT responsiv-B1: Dichte-Blöcke verschieben und klebende Konto-Karte setzt D1 in der festgelegten Form um. Der Selektor heißt .sidebar .sb-userwrap, .sidebar hat oben 0 statt 22 (Marke so hoch wie die Titelzeile), und die Zeile .brand { padding-bottom: 14px; } im Dichte-Block entfällt.
- VERBINDLICH (Kreuzprüfung): app.css, Seitenleiste (enthält responsiv-B1, das nicht separat umgesetzt wird). (1) Die beiden @media-Blöcke Z. 146–157 samt Kommentar unverändert direkt hinter `.sidebar .spacer { flex: 1; }` (Z. 187) und vor „Seitenleiste eingeklappt“ verschieben. Dabei die Zeile `.brand { padding-bottom: 14px; }` streichen. (2) `.sidebar` `padding: 22px 14px 18px` → `padding: 0 14px 0`. (3) `.brand` `padding: 4px 0 18px 16px` → `min-height: var(--topbar-h); padding: 0 0 0 16px`. (4) `.sidebar .sb-sep` `margin: 0 8px 14px` → `margin: -5px -14px 14px` (−5 gleicht den gap 4 aus, die Linie liegt bei y = 71 über die volle Breite). Neu: `html.sb-mini .sidebar .sb-sep { margin: -5px -10px 14px; }`. (5) Z. 192 `html.sb-mini .brand { …; padding: 0 0 18px; … }` → `padding: 0; min-height: var(--topbar-h); justify-content: center;`. (6) Z. 232 `.sb-userwrap { margin-top: 10px; flex: 0 0 auto; }` → `.sidebar .sb-userwrap { position: sticky; bottom: 0; z-index: 1; flex: 0 0 auto; margin-top: 2px; padding: 8px 0 18px; background: var(--bg-2); } /* Konto-Karte bleibt sichtbar, die Navigation scrollt darunter */`. Kein `bottom: -18px` und kein negativer Rand. Der Selektor mit `.sidebar` ist Pflicht, weil `.popwrap { position: relative }` (Z. 328) später steht. Die Schublade ≤960 px (Polster mit Safe Area, Marke ohne Titelzeilen-Höhe) regelt responsiv-B2; das kommt danach. Prüfen bei 1440×1000, 1366×768 und 1280×720: `elementFromPoint(sidebar.left + 40, innerHeight − 4)` liegt in `.sb-userwrap`, und `.sb-user` endet bei innerHeight − 18. sidebartest.js, usercardtest.js (inkl. :21 und :55–58) und mobiletest.js:59–60 müssen grün sein.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .menu-btn] P6 und 3.3c lösen dieselbe Aufgabe: Fokus beim Öffnen und Schließen der Schublade. Umgesetzt wird sie einmal in renderSidebar über responsiv-3.3c, in der Fassung des Ankers App.renderSidebar; das Ziel beim Öffnen (.sb-toggle) kommt aus P6. Die Aktionen sidebar() und scrim() sowie der Handy-Zweig von 'sb-toggle' bleiben unverändert. Eine Methode closeSidebar() gibt es nicht. Verträglich sind P8 (aria-controls="sidebar" am Menüknopf), B12a (unsichtbare 44-px-Fläche per ::after im ≤960-Block) und C10 (Selektoren .topbar .menu-btn). Es gibt nur einen .menu-btn, document.querySelector('.menu-btn') trifft also weiter den Knopf der Titelzeile.

## komponenten-C21b · Konto-Menü unten (.sb-menu): Einträge erben die Menügröße

Gruppe komponenten · Cluster shell · Aufwand S · Befunde: komponenten-35
Quelle: audit/spec/komponenten.md Z. 367–368 · Dateien: web/css/app.css
Abhängig von: komponenten-C21a

```text
- Z. 250 `.sb-menu .item { font-size: 13.5px; color: var(--text-2); } .sb-menu .item:hover { color: var(--text); }` löschen (Z. 251 `.on` bleibt).
- Z. 253 `.sb-menu-row { … padding: 4px 6px 4px 12px; font-size: 13.5px; … }` → `padding: 4px 6px 4px 10px; font-size: 13px;`
```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .sb-menu .item] komponenten-C21b übernimmt und löscht Z. 250 vollständig (`.sb-menu .item { font-size: 13.5px; color: var(--text-2); }` und `.sb-menu .item:hover { color: var(--text); }`). `.sb-menu .item.on` (Z. 251) bleibt. Die Einträge im Konto-Menü erben dann alles von `.popover .item`: min. 36 px, Padding 0 10px, 13/500, `--text` (nach C21a; Token aus typografie-3.2.3l). Das ist dieselbe Menügröße wie in allen anderen Popovern (typografie K1). Das Löschen nur von `font-size` in 3.2.3i ist darin enthalten.
- [doppelt: .sb-menu-row] Diese Regel gehört komplett zu komponenten-C21b. Endstand: `.sb-menu-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 4px 6px 4px 10px; font-size: var(--fs-13); line-height: var(--lh-13); color: var(--text-2); }`. Der Innenabstand links ist 10 wie bei `.popover .item`. Die Größe 13 steht als Token. typografie-3.2.3i fasst die Regel nicht an.
- ÄNDERN: In Z. 253/254 `.sb-menu-row` `font-size: 13px` → `font-size: var(--fs-13); line-height: var(--lh-13)`. Padding `4px 6px 4px 10px` wie spezifiziert, Z. 250 ganz löschen.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: App.userCard] Drei Schritte legen dieselbe Namenslogik an (aufbau: App.userName(), komponenten: App.userInfo… nein App.displayName(), zustaende: App.userInfo()). Es gibt genau eine Quelle: App.userInfo() aus zustaende-S-A3. Sie gibt { name, initials, sub, avatarId } zurück, also alles, was userCard und topbar brauchen; die beiden anderen Fassungen liefern weniger (A2 kein sub). Sie steht im App-Objekt vor userCard. App.userName() und App.displayName() werden nicht angelegt und auch in README, regeln.md und Kommentaren nicht genannt; dort heißt es App.userInfo(). Den Text „Profil ergänzen“ setzt nur wording-S5.1-5.2 Teil 5.2 um, und zwar einmal: app.js:229, usercardtest.js:11 und die Umbenennung des Sprachschlüssels. Ebenfalls umzusetzen und verträglich: aufbau-B4 (Reihenfolge und Markierung .on im Konto-Menü), barrierefreiheit-P7 (kein role=menu/menuitem, .sb-av mit aria-hidden, Signatur userCard(theme, coachWhy, mini)) und komponenten-A1 (cdot bekommt data-tip statt title, aria-label bleibt). Endform der Hilfsfunktion: const link = (href, icon, label, extra = '', on = false) => `<a class="item${on ? ' on' : ''}" href="${href}" data-action="nav-close">${I[icon]}<span>${label}</span>${extra}</a>`; Die Attribute am Knopf .sb-user regelt der Anker .sb-user.
- [konflikt: .sb-user] An .sb-user steht kein title, auch eingeklappt nicht. Der App-Tooltip (#tip rechts, komponenten-U3) ersetzt ihn, sonst erscheinen zwei Tooltips. Eingeklappt braucht der Knopf aber einen Namen, weil .sb-who dann ausgeblendet ist; das aria-label aus P7 bleibt deshalb. Endform: <button type="button" class="sb-user${cur === 'settings' || cur === 'coach' || cur === 'affiliate' ? ' active' : ''}" data-pop="user"${mini ? ' aria-label="Konto und Einstellungen" data-tip="Konto und Einstellungen" data-tip-side="right"' : ''}>. aria-expanded und aria-controls setzt popInit (P1/P5); kein aria-haspopup. Das ist dasselbe Muster wie bei den eingeklappten Navigationslinks (Anker App.renderSidebar). data-tip-side braucht komponenten-U3 in bindTips.
- ÄNDERN: Den Punkt Z. 227 (.sb-user) setzt barrierefreiheit-P7 in der festgelegten Endform um; A1 fügt dort nichts weiter hinzu. Die anderen Punkte von A1 regelt der Anker App.renderSidebar.
- [konflikt: App.renderSidebar] (1) Die Zeile desk/mini wird einmal vor const item verschoben, durch P5 (A1 verlangt dasselbe). (2) Endform des Navigationslinks: `<a href="#/${key}" class="${cur === key ? 'active' : ''}"${cur === key ? ' aria-current="page"' : ''}${mini ? ` aria-label="${label}" data-tip="${label}" data-tip-side="right"` : ''} data-action="nav-close">`. Kein title, auch eingeklappt nicht. Grund: komponenten verlangt „keine System-Tooltip-Dubletten“; App-Tooltip rechts und aria-label decken Maus und Screenreader ab. (3) Schublade: inert setzt nur P5 (sb.inert = mob && !open; main.inert = mob && open), und zwar vor jedem focus(). Die Fokuslogik steht nach dem Muster von 3.3c (wasOpen/hadFocus am Anfang) in renderSidebar. Nur so gibt jeder Schließweg den Fokus zurück: ×, Scrim, Escape (bind-Handler), nav-close auf dieselbe Route und Breitenwechsel. responsiv-Prüfpunkt 11 verlangt „Escape → Fokus auf .menu-btn“; P6 (Logik nur in den Aktionen) deckt das nicht ab. Beim Öffnen geht der Fokus auf „Menü schließen“ (.sb-toggle), wie in barrierefreiheit Z2 und bereich_shell-15, und nicht auf den aktiven Eintrag. Gründe: Es ist das erste Element der Schublade, Tab läuft danach von oben durch die Navigation, und der Screenreader nennt sofort den Weg zum Schließen. Prüfpunkt 11 (aktives Element liegt in #sidebar) bleibt erfüllt. Beim Schließen geht der Fokus an .menu-btn, aber nur wenn er in der Schublade war und der Knopf sichtbar ist.
- ÄNDERN: Die Zeile desk/mini verschiebt P5, nicht doppelt verschieben. Z. 207 nach Endform: aria-current aus P5 und die Mini-Attribute aus A1 in einem Ausdruck, ohne title. Punkte (Z. 206/225 data-tip), Einklapp-Knopf (data-tip, eingeklappt mit data-tip-side) und Handy-× ohne title bleiben wie spezifiziert.
- [konflikt: data-tip] Konflikt nur bei hbars: diagramme-C14 setzt data-tip an den sichtbaren Balken, an gekürzte Beschriftungen und an ein eigenes Leer-Rechteck. barrierefreiheit-U6b verlangt dagegen eine transparente Trefferfläche über der ganzen Zeile, Beschriftung eingeschlossen. Es gilt U6b, auch im Umbau C14. Dieselbe Bauart haben die dbars in widgets.js (C-widgets-84-93), und so hat jede Zeile genau ein Tooltip-Ziel. Für vbars und hbars gibt es einen gemeinsamen Baustein in ui.js, damit beide gleich lauten. B10 (Summe bei Ø pro Trade) gilt damit auch für „Erwartungswert je Setup“ (hbars mit metric expectancy): const groupTip = (g, v, perTrade) => { const b = `<b>${esc(String(g.label || g.key))}</b>: `; return !g.s.n ? b + 'Keine Trades' : `${b}${fmt.cur(v, { signed: true })}${perTrade ? ' pro Trade' : ''}<br>${perTrade ? `Summe ${fmt.cur(g.s.total, { signed: true })} · ` : ''}${g.s.n} Trades · Win-Rate ${fmt.pct(g.s.winRate)}`; }; Zähler und Begriff ändert danach wording-S1.4-1.7 an dieser einen Stelle. Endstand hbars: Die Beschriftung hat kein eigenes data-tip, denn der volle Name steht fett im Zeilen-Tooltip, und die Fläche darüber würde sie ohnehin verdecken. Eine leere Zeile zeigt nur die Beschriftung in --faint. Der Balken <path class="br"> trägt kein data-tip. Vor </svg> folgt je Zeile <rect class="tip-hit" x="0" y="${mt + i * rowH}" width="${W - mr}" height="${rowH}" fill="transparent" data-tip="${groupTip(g, vals[i], perTrade)}"></rect>. Verträglich ohne Änderung sind U1 (Info-Knopf), responsiv-3.2c (Chip mit tip), komponenten-A1 (Seitenleiste, siehe Anker App.renderSidebar) und C-widgets-84-93; zum Trendpfeil siehe Anker .trend. Die neue „Summe …“-Zeile kommt als Muster in alle fünf Sprachdateien.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: App.pageHead] aufbau-B1 schreibt pageHead und newTradeButton neu und nimmt die Teile der anderen Schritte auf. Endzustand: `const sh = typeof screen.head === 'function' ? screen.head(ctx) : screen.head; const h = Object.assign({ range: true, account: true, session: true, trade: true, note: '', tradeTip: '' }, sh);`. In `left` steht `this.accountControl({ mobile: !h.range, iconM: !!h.range })` (responsiv-3.3a), danach wie heute `ctx.headLeft` und der Hinweis. In `right` steht `this.sessionControl()` ohne Argument (komponenten-A4); B1 lässt dort fälschlich noch `(true)` stehen. Vor dem return kommt `if (!left && !right) return '';`; das steht in B1 und abstaende-E1 gleich, also doppelt. abstaende-E-day2 setzt nur `ctx.headLeft` und passt ohne Änderung, weil pageHead headLeft nach dem Konto einsetzt. Mentor ohne Server nutzt die Funktionsform von head (siehe Anker screen.head).
- ÄNDERN: Nur sessionControl ändern (Parameter weg, `.lbl-wide`, CSS). Den Aufruf in pageHead (Z. 260) stellt aufbau-B1 auf `this.sessionControl()` um.
- [konflikt: App.sessionControl] Die Signatur aus komponenten-A4 gilt: Parameter `iconOnly` entfällt. Damit gibt es eine Bauart, die ab 1181 px Text zeigt und darunter nur das Symbol (`.lbl-wide`); `hide-m` blendete den ganzen Knopf am Handy aus. Endzustand: Zweig mit Session `<button type="button" class="btn" data-action="end-session" aria-label="Session beenden" aria-describedby="session-timer" title="Session beenden">${I.stop}<span id="session-timer">…</span></button>` (P9). Zweig ohne Session `<button type="button" class="btn" data-action="start-session" title="Session starten" aria-label="Session starten">${I.play}<span class="lbl-wide">Session starten</span></button>` (A4). Der Aufruf in pageHead lautet `this.sessionControl()` (aufbau-B1 entsprechend ändern, siehe App.pageHead). P9 und A4 berühren verschiedene Zweige und ergänzen sich.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: App.userCard] Drei Schritte legen dieselbe Namenslogik an (aufbau: App.userName(), komponenten: App.userInfo… nein App.displayName(), zustaende: App.userInfo()). Es gibt genau eine Quelle: App.userInfo() aus zustaende-S-A3. Sie gibt { name, initials, sub, avatarId } zurück, also alles, was userCard und topbar brauchen; die beiden anderen Fassungen liefern weniger (A2 kein sub). Sie steht im App-Objekt vor userCard. App.userName() und App.displayName() werden nicht angelegt und auch in README, regeln.md und Kommentaren nicht genannt; dort heißt es App.userInfo(). Den Text „Profil ergänzen“ setzt nur wording-S5.1-5.2 Teil 5.2 um, und zwar einmal: app.js:229, usercardtest.js:11 und die Umbenennung des Sprachschlüssels. Ebenfalls umzusetzen und verträglich: aufbau-B4 (Reihenfolge und Markierung .on im Konto-Menü), barrierefreiheit-P7 (kein role=menu/menuitem, .sb-av mit aria-hidden, Signatur userCard(theme, coachWhy, mini)) und komponenten-A1 (cdot bekommt data-tip statt title, aria-label bleibt). Endform der Hilfsfunktion: const link = (href, icon, label, extra = '', on = false) => `<a class="item${on ? ' on' : ''}" href="${href}" data-action="nav-close">${I[icon]}<span>${label}</span>${extra}</a>`; Die Attribute am Knopf .sb-user regelt der Anker .sb-user.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: App.accountControl] Die Schritte ergänzen sich. Einzige Doppelung: Der Link „Konten verwalten“ → `#/settings/konten` steht in aufbau-B5 und in zustaende-S-A2, umgesetzt wird er in S-A2. Endzustand app.js:243–244: `const show = o.mobile || accounts.length > 1`; Wrapper `popwrap${show ? '' : ' hide-m'}${o.iconM ? ' acc-iconm' : ''}` (3.3a). Der Auslöser bekommt zusätzlich `aria-label="Konto: ${esc(accName)}"`; der Name endet mit dem sichtbaren Wort, damit ist WCAG 2.5.3 erfüllt. Im Popover umschließt `<div role="radiogroup" aria-label="Konto">` die Einträge „Alle Konten“ (nur bei mehr als einem Konto) und die Konten, jeder davon `role="radio"` (P11). aria-checked: für „Alle Konten“ `!acc || acc === 'all'`, für ein Konto `acc === a.id || ((!acc || acc === 'all') && accounts.length === 1)` (S-A2). So ist in jeder Lage genau ein Radio gewählt, denn „Alle Konten“ wird bei einem einzigen Konto nicht gerendert. Vor dem Namen steht `<span class="chk">${on ? I.check : ''}</span>`, `on` ist derselbe Ausdruck wie aria-checked (A3). Der Betrag bekommt `title="Kontogröße"`. Danach folgen außerhalb der Gruppe `<hr>` und `<a class="item" href="#/settings/konten">${I.settings} Konten verwalten</a>`. Das Dashboard ruft `App.accountControl({ iconM: true })` auf (3.6). Den pageHead-Teil von 3.3a regelt der Anker App.pageHead.
- ÜBERNIMMT aufbau-B5: Die href-Änderung `#/settings` → `#/settings/konten` ist in zustaende-S-A2 enthalten. Nicht doppelt umsetzen.
- [doppelt: #/settings/konten] Beide Schritte ändern dieselbe Stelle gleich (app.js:244, `href="#/settings"` → `href="#/settings/konten"`). zustaende-S-A2 übernimmt das, weil es dieselbe Zeile ohnehin umschreibt (siehe Anker App.accountControl).
- ÜBERNIMMT aufbau-B5: Die href-Änderung `#/settings` → `#/settings/konten` ist in zustaende-S-A2 enthalten. Nicht doppelt umsetzen.
- [konflikt: .popover .item[aria-checked="true"]] Werte aus farbe-B4: `.popover .item[aria-checked="true"] { color: var(--text); background: color-mix(in srgb, var(--text) 10%, var(--surface)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--text) 22%, var(--border-2)); }`. Gründe: BRIEF verlangt für Gewähltes „leicht angehobene Fläche, feiner Rand“. Das ist derselbe flache Gewählt-Stil wie überall in der App (zustaende Z3, farbe AUSWAHL). `var(--surface-2)` aus komponenten-C21a ist genau die Hover-Fläche (`.popover .item:hover`), damit wäre Gewählt von Hover nicht zu unterscheiden. B6 (nur Fläche) hat keinen Rand. Der inset-Rand ist eine 1-px-Kante, kein Schein. Die Regel steht nach `:hover`, gewinnt also. S-A2 liefert nur die aria-checked-Werte und passt dazu.

## komponenten-A3 · Konto-Menü der Kopfreihe mit Haken-Spalte

Gruppe komponenten · Cluster shell · Aufwand S · Befunde: komponenten-2
Quelle: audit/spec/komponenten.md Z. 553–555 · Dateien: web/js/app.js
Abhängig von: komponenten-C21a

```text
**A3 – Konto-Menü mit Haken-Spalte** (komponenten-2)
In `accountControl` (Z. 244) jedem `.item` (auch „Alle Konten“) vor dem Namen `<span class="chk">${checked ? I.check : ''}</span>` voranstellen (`checked` = derselbe Ausdruck wie `aria-checked`). Der Eintrag „Konten verwalten“ behält sein Zahnrad, es steht in derselben 16-px-Spalte.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: App.accountControl] Die Schritte ergänzen sich. Einzige Doppelung: Der Link „Konten verwalten“ → `#/settings/konten` steht in aufbau-B5 und in zustaende-S-A2, umgesetzt wird er in S-A2. Endzustand app.js:243–244: `const show = o.mobile || accounts.length > 1`; Wrapper `popwrap${show ? '' : ' hide-m'}${o.iconM ? ' acc-iconm' : ''}` (3.3a). Der Auslöser bekommt zusätzlich `aria-label="Konto: ${esc(accName)}"`; der Name endet mit dem sichtbaren Wort, damit ist WCAG 2.5.3 erfüllt. Im Popover umschließt `<div role="radiogroup" aria-label="Konto">` die Einträge „Alle Konten“ (nur bei mehr als einem Konto) und die Konten, jeder davon `role="radio"` (P11). aria-checked: für „Alle Konten“ `!acc || acc === 'all'`, für ein Konto `acc === a.id || ((!acc || acc === 'all') && accounts.length === 1)` (S-A2). So ist in jeder Lage genau ein Radio gewählt, denn „Alle Konten“ wird bei einem einzigen Konto nicht gerendert. Vor dem Namen steht `<span class="chk">${on ? I.check : ''}</span>`, `on` ist derselbe Ausdruck wie aria-checked (A3). Der Betrag bekommt `title="Kontogröße"`. Danach folgen außerhalb der Gruppe `<hr>` und `<a class="item" href="#/settings/konten">${I.settings} Konten verwalten</a>`. Das Dashboard ruft `App.accountControl({ iconM: true })` auf (3.6). Den pageHead-Teil von 3.3a regelt der Anker App.pageHead.
- ÄNDERN: Für `checked` gilt der neue aria-checked-Ausdruck aus zustaende-S-A2, nicht der heutige. `.chk` steht im role=radio-Knopf vor dem Namen. „Konten verwalten“ bleibt außerhalb der Radiogruppe.

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

## barrierefreiheit-H2 · Seitenleiste als <nav aria-label="Hauptnavigation"> statt <aside>

Gruppe barrierefreiheit · Cluster shell · Aufwand S · Befunde: bereich_shell-14, barrierefreiheit-49
Quelle: audit/spec/barrierefreiheit.md Z. 525–529 · Dateien: web/app.html
Abhängig von: —

```text
**H2 Landmarke** (Z. 19)
- vorher: `<aside class="sidebar" id="sidebar" aria-label="Navigation">…</aside>`
- nachher: `<nav class="sidebar" id="sidebar" aria-label="Hauptnavigation">…</nav>`
- Befunde: bereich_shell-14, barrierefreiheit-49

```

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: #sidebar] Inhaltlich verträglich. P5 macht die Gruppen zu div role="group", H2 macht das äußere Element zu <nav aria-label="Hauptnavigation">. H2 darf nicht vor P5 landen, sonst gibt es vorübergehend verschachtelte nav-Landmarken (am besten in einem Commit). P5 ruft this.popInit(sb) auf, das P1 anlegt, also kommt P1 zuerst. Für 3.3c gilt die Fassung aus dem Anker App.renderSidebar.
- [konflikt: .sidebar] D1 und B1 verschieben beide die Dichte-Blöcke und machen die Konto-Karte klebend, aber nach verschiedenen Modellen (D1: .sidebar unten 18 px Polster, Karte mit bottom: -18px und negativem Rand; B1: oben 22 px Polster, unten 0, Karte mit bottom: 0). Festlegung: (a) Die Dichte-Blöcke verschiebt D1 einmal hinter .sidebar .spacer und streicht dabei .brand { padding-bottom: 14px; }, weil die Marke eine feste Höhe hat. (b) Oben gilt D1: .sidebar ohne Polster oben, .brand { min-height: var(--topbar-h); padding: 0 0 0 16px; }, Linie .sb-sep bei y = 71 über die volle Breite, ausgeklappt und eingeklappt, html.sb-mini .brand wie D1 (5). (c) Unten gilt das Modell von B1 bzw. responsiv-K3: .sidebar { padding: 0 14px 0; }. Der Abstand unten steckt in der Karte: .sidebar .sb-userwrap { position: sticky; bottom: 0; z-index: 1; flex: 0 0 auto; margin-top: 2px; padding: 8px 0 18px; background: var(--bg-2); }. Den Selektor mit .sidebar braucht es wie in D1, sonst gewinnt .popwrap { position: relative } aus Z. 328. bottom: -18px und negativer Rand entfallen: Ohne Polster unten scheint unter der Karte keine Navigation durch (responsiv-Prüfpunkt 11), und .sb-user endet trotzdem bei innerHeight − 18 (abstaende-Messung). (d) Für die Schublade ≤ 960 px gilt B2: oben calc(22px + inset-top), unten 0, Karte unten calc(18px + inset-bottom). Die Ausrichtung der Marke an der 72-px-Titelzeile gilt dort nicht, die Schublade behält ihre bisherige Marke. H2 (nav statt aside) ändert keine Selektoren und ist verträglich. Dieselbe Festlegung gilt für die Anker .sb-userwrap, .sidebar .sb-userwrap und .sidebar .spacer der anderen Konfliktliste.

## barrierefreiheit-P9 · Session-Knopf: Name „Session beenden“, Zeit als Beschreibung (aria-describedby)

Gruppe barrierefreiheit · Cluster shell · Aufwand S · Befunde: barrierefreiheit-39
Quelle: audit/spec/barrierefreiheit.md Z. 630–634 · Dateien: web/js/app.js
Abhängig von: —

```text
**P9 Session-Knopf** (`sessionControl` Z. 249)
- vorher: `<button type="button" class="btn" data-action="end-session" title="Session beenden">`
- nachher: `<button type="button" class="btn" data-action="end-session" aria-label="Session beenden" aria-describedby="session-timer" title="Session beenden">`
- Befunde: barrierefreiheit-39

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: App.sessionControl] Die Signatur aus komponenten-A4 gilt: Parameter `iconOnly` entfällt. Damit gibt es eine Bauart, die ab 1181 px Text zeigt und darunter nur das Symbol (`.lbl-wide`); `hide-m` blendete den ganzen Knopf am Handy aus. Endzustand: Zweig mit Session `<button type="button" class="btn" data-action="end-session" aria-label="Session beenden" aria-describedby="session-timer" title="Session beenden">${I.stop}<span id="session-timer">…</span></button>` (P9). Zweig ohne Session `<button type="button" class="btn" data-action="start-session" title="Session starten" aria-label="Session starten">${I.play}<span class="lbl-wide">Session starten</span></button>` (A4). Der Aufruf in pageHead lautet `this.sessionControl()` (aufbau-B1 entsprechend ändern, siehe App.pageHead). P9 und A4 berühren verschiedene Zweige und ergänzen sich.

## kilook-C1b · Hell/Dunkel-Schalter: Grundwert margin 0, Sonderregeln und .menu-btn-Reste löschen

Gruppe kilook · Cluster shell · Aufwand S · Befunde: bereich_shell-35
Quelle: audit/spec/kilook.md Z. 515–523 · Dateien: web/css/app.css
Abhängig von: —

```text
- **199** `.theme-toggle { … align-self: flex-start; … margin: 10px 16px 0; … }` → `align-self: flex-start;` streichen, `margin: 10px 16px 0;` → `margin: 0;`
- **Löschen:**
  - **207** `html.sb-mini .theme-toggle { flex-direction: column; align-self: center; margin: 10px 0 0; }`
  - **208** `html.sb-mini[data-theme="light"] .theme-toggle::before { transform: translateY(22px); }`
  - **225–228** `.menu-btn svg path { … }` und die drei `:nth-child`-Regeln
  - **241** der verwaiste Kommentar `/* helles Design: Balken und Punkte … */`
  - **255** `.sb-menu .theme-toggle, html.sb-mini .sb-menu .theme-toggle { margin: 0; flex-direction: row; align-self: auto; }` (jetzt Grundwert)
  - **256** `html.sb-mini[data-theme="light"] .sb-menu .theme-toggle::before { transform: translateX(26px); }` (übernimmt 201)

```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .theme-toggle] Z. 207–208 werden genau einmal gelöscht, durch kilook-C1b, zusammen mit Z. 199 (margin 0, ohne align-self), 255, 256 und den .menu-btn-Resten. Der Schalter steht nur in #pop-user (.sb-menu), und nach kilook-C1b ist die Grundregel die einzige. Die unsichtbare Trefferfläche 26 × 34 aus barrierefreiheit-B12b kommt deshalb an die Grundregel: Z. 202 `.theme-toggle button { …; position: relative; }` und neu `.theme-toggle button::after { content: ''; position: absolute; inset: -6px 0; }`. Optik und translateX bleiben, und die Knöpfe überlappen sich nicht. Die offene Frage bereich_shell-30 betrifft nur eine sichtbare Vergrößerung. Die unsichtbare Fläche passt zu beiden Antworten, deshalb hängt diese Entscheidung nicht von ihr ab.
- [doppelt: html.sb-mini .theme-toggle] Wie beim Anker .theme-toggle: Z. 207 (`html.sb-mini .theme-toggle { … }`) löscht nur kilook-C1b.
- [doppelt: html.sb-mini[data-theme="light"] .theme-toggle::before] Wie beim Anker .theme-toggle: Z. 208 löscht nur kilook-C1b. Die Verschiebung im hellen Design übernimmt danach Z. 201 (`:root[data-theme="light"] .theme-toggle::before { transform: translateX(26px); … }`).

## barrierefreiheit-B12b · Hell/Dunkel-Trefferfläche 26 × 34 und toten sb-mini-Code (Z. 207–208) löschen

Gruppe barrierefreiheit · Cluster shell · Aufwand S · Befunde: barrierefreiheit-28, bereich_shell-30
Quelle: audit/spec/barrierefreiheit.md Z. 377–378 · Dateien: web/css/app.css
Abhängig von: —

```text
| nach Z. 206 (Hell/Dunkel) | 26 × 22 | `.sb-menu .theme-toggle button { position: relative; } .sb-menu .theme-toggle button::after { content: ''; position: absolute; inset: -6px 0; }` (26 × 34, Optik und `translateX` bleiben) | barrierefreiheit-28, bereich_shell-30 |
| Z. 207–208 | `html.sb-mini .theme-toggle {flex-direction: column …}` · `html.sb-mini[data-theme="light"] .theme-toggle::before { transform: translateY(22px); }` | **löschen** (der Schalter steht nur noch im Konto-Menü, `app.js:232`; Z. 255–256 überschreiben beide) | bereich_shell-30 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .theme-toggle] Z. 207–208 werden genau einmal gelöscht, durch kilook-C1b, zusammen mit Z. 199 (margin 0, ohne align-self), 255, 256 und den .menu-btn-Resten. Der Schalter steht nur in #pop-user (.sb-menu), und nach kilook-C1b ist die Grundregel die einzige. Die unsichtbare Trefferfläche 26 × 34 aus barrierefreiheit-B12b kommt deshalb an die Grundregel: Z. 202 `.theme-toggle button { …; position: relative; }` und neu `.theme-toggle button::after { content: ''; position: absolute; inset: -6px 0; }`. Optik und translateX bleiben, und die Knöpfe überlappen sich nicht. Die offene Frage bereich_shell-30 betrifft nur eine sichtbare Vergrößerung. Die unsichtbare Fläche passt zu beiden Antworten, deshalb hängt diese Entscheidung nicht von ihr ab.
- ÄNDERN: Den Punkt Z. 207–208 (Löschen) nicht umsetzen, das erledigt kilook-C1b. Die Trefferfläche ohne .sb-menu-Präfix: `position: relative` in die Regel Z. 202 `.theme-toggle button` aufnehmen und direkt danach neu `.theme-toggle button::after { content: ''; position: absolute; inset: -6px 0; }`.
- [doppelt: html.sb-mini .theme-toggle] Wie beim Anker .theme-toggle: Z. 207 (`html.sb-mini .theme-toggle { … }`) löscht nur kilook-C1b.
- ÄNDERN: Den Punkt Z. 207–208 (Löschen) nicht umsetzen, das erledigt kilook-C1b. Die Trefferfläche ohne .sb-menu-Präfix: `position: relative` in die Regel Z. 202 `.theme-toggle button` aufnehmen und direkt danach neu `.theme-toggle button::after { content: ''; position: absolute; inset: -6px 0; }`.
- [doppelt: html.sb-mini[data-theme="light"] .theme-toggle::before] Wie beim Anker .theme-toggle: Z. 208 löscht nur kilook-C1b. Die Verschiebung im hellen Design übernimmt danach Z. 201 (`:root[data-theme="light"] .theme-toggle::before { transform: translateX(26px); … }`).
- ÄNDERN: Den Punkt Z. 207–208 (Löschen) nicht umsetzen, das erledigt kilook-C1b. Die Trefferfläche ohne .sb-menu-Präfix: `position: relative` in die Regel Z. 202 `.theme-toggle button` aufnehmen und direkt danach neu `.theme-toggle button::after { content: ''; position: absolute; inset: -6px 0; }`.

## kilook-C7b · Startseite: Schriftzug Journalyst ohne <em>

Gruppe kilook · Cluster shell · Aufwand S · Befunde: bereich_shell-35
Quelle: audit/spec/kilook.md Z. 586–586 · Dateien: web/index.html
Abhängig von: —

```text
- **22** `<span>Journal<em>yst</em></span>` → `<span>Journalyst</span>`
```

## kilook-C8a · Seitenleiste (app.js): Schriftzug Journalyst ohne <em>

Gruppe kilook · Cluster shell · Aufwand S · Befunde: bereich_shell-35
Quelle: audit/spec/kilook.md Z. 600–601 · Dateien: web/js/app.js
Abhängig von: —

```text
**C8 · web/js/app.js** (bereich_shell-35, barrierefreiheit-43, ki_look-36)
- **210** `<span class="name no-i18n">Journal<em>yst</em></span>` → `<span class="name no-i18n">Journalyst</span>`
```

## kilook-C1a · Shell-CSS: .nav button aus Selektoren, tote Regeln (.nav-sec, .brand em, .sidebar hr, .badge-n) löschen

Gruppe kilook · Cluster shell · Aufwand M · Befunde: bereich_shell-35
Quelle: audit/spec/kilook.md Z. 497–514 · Dateien: web/css/app.css
Abhängig von: kilook-C7b, kilook-C8a

```text
### Phase C · Einzelstellen, nach Datei

**C1 · web/css/app.css · Shell-Reste** (bereich_shell-35; erst nach C7/C8 Teil „Schriftzug“, weil Z. 159 sonst „yst“ kursiv macht)
- **Aus den Selektorlisten nur den `.nav button`-Teil streichen:**
  - **149** `.nav a, .nav button { padding-top: 6px; padding-bottom: 6px; }` → `.nav a { … }`
  - **155** wie 149
  - **169** `.nav a, .nav button {` → `.nav a {`
  - **175** `.nav a svg, .nav button svg` → `.nav a svg`
  - **176** `.nav a:hover, .nav button:hover` → `.nav a:hover`
  - **177** `.nav a:active, .nav button:active` → `.nav a:active`
  - **195** `html.sb-mini .nav a, html.sb-mini .nav button {` → `html.sb-mini .nav a {`
  - **196** `html.sb-mini .nav a span, html.sb-mini .nav button span` → `html.sb-mini .nav a span`
- **Löschen:**
  - **152** `.nav.nav-sec { margin-top: 8px; }` (in `@media … max-height: 1060px`)
  - **159** `.brand em { font-style: normal; color: inherit; }`
  - **163** `.sidebar hr { … }`
  - **165** `.nav.nav-sec { margin-top: 12px; }`
  - **186** `.nav .badge-n { … }`
```

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: .nav a] Alle fünf Schritte gelten und landen in einer Regel. Der Selektor heißt nur noch `.nav a` (kilook-C1a, `.nav` enthält laut app.js:210 keine `<button>`). Z. 169–173 danach: `gap: var(--sp-3)` (A9), `font-size: var(--fs-14); line-height: var(--lh-14)` (3.2.3n), `transition` ohne `, transform var(--dur-2) var(--ease)` (B3), dazu der Kommentar „Maße gemeinsam mit .boot-sb pflegen“ (S-C19). `.nav a:hover { background: var(--surface-2); color: var(--text); }`; kein `:active` und kein `.nav a.active:hover`. Folge fürs Skelett: Mit 14/20 statt 14,5 × 1,45 ist ein Eintrag 38 statt 39 px hoch (8 + 20 + 8 + 2 Rand), das Raster der Leiste also 41 statt 42 px (Dichte-Stufen: 34/32 px). Deshalb kommt S-C19 erst nach 3.2.3n und nimmt die Werte aus dem Anker `.boot-sb`. Die responsiv-Prüfung „Zeilenhöhe .nav a 39 px (± 1)“ ist mit 38 erfüllt, die Gewichtsregel (Navigation 500) bleibt.
- [konflikt: .nav button] `.nav button` fällt aus allen Selektorlisten (kilook-C1a; kein Element im Markup, grep app.js:210). A9, B3 und 3.2.3n setzen ihre Werte nur an `.nav a`. Wichtig: B3 schreibt Z. 176 laut Spezifikation als `.nav a:hover, .nav button:hover { … }`. Das würde den toten Selektor zurückbringen, egal in welcher Reihenfolge umgesetzt wird. Ergebnis: `.nav a:hover { background: var(--surface-2); color: var(--text); }`. Gilt ebenso für Z. 149/155 (Dichte), 175 (svg), 195/196 (sb-mini).
- [konflikt: .nav a:hover] Endstand: `.nav a:hover { background: var(--surface-2); color: var(--text); }` – Werte von B3 (kein Versatz), Selektor von C1a. B3 darf `.nav button:hover` nicht wieder einfügen (siehe Anker .nav button).
- [konflikt: .nav a:active] Z. 177 wird ganz gelöscht (bewegung H2: Navigation, Karten und Zellen haben keinen Druckzustand; BRIEF „ruhig“). Ein bloß verengtes `.nav a:active { transform: translateX(2px) scale(.98); }` (C1a) bleibt nicht stehen. Z. 182 `.nav a.active:hover { transform: none; }` wird mit B3 ebenfalls gelöscht.
- ÄNDERN: Den Punkt „177 `.nav a:active, .nav button:active` → `.nav a:active`“ streichen; die Zeile löscht bewegung-B3 komplett.
- [konflikt: .nav .badge-n] Z. 186 `.nav .badge-n { … }` wird gelöscht. Toter Code: `badge-n` kommt in web/js und web/app.html nicht vor (kilook Z11, Prüfung kilook 11). Die Umstellung von 11 px auf das Token entfällt für diese Zeile.

## responsiv-B2 · Schublade ≤ 960 px: Safe Area, visibility nach Animation, Schließen-Knopf 40×40, Dichte bei niedriger Höhe

Gruppe responsiv · Cluster shell · Aufwand M · Befunde: bereich_shell-16, responsiv-15, barrierefreiheit-30, bereich_shell-31
Quelle: audit/spec/responsiv.md Z. 261–268 · Dateien: web/css/app.css
Abhängig von: responsiv-B1

```text
**B2 Schublade (≤ 960 px)** (bereich_shell-16, responsiv-15, barrierefreiheit-30, bereich_shell-31)
- Z. 918 `.sidebar { position: fixed; …; transform: translateX(-102%); transition: transform var(--dur-2) var(--ease); …}` → in derselben Regel ergänzen bzw. ändern: `padding: calc(22px + env(safe-area-inset-top, 0px)) 14px 0 calc(14px + env(safe-area-inset-left, 0px)); visibility: hidden; transition: transform var(--dur-2) var(--ease), visibility 0s linear var(--dur-2);`
- Z. 920 `.sidebar.open { transform: none; }` → `.sidebar.open { transform: none; visibility: visible; transition: transform var(--dur-2) var(--ease), visibility 0s; }`
- Im selben Block neu: `.sidebar .sb-userwrap { padding-bottom: calc(18px + env(safe-area-inset-bottom, 0px)); }` und `.brand .sb-toggle { width: 40px; height: 40px; margin-right: -6px; }`
- Direkt nach dem Block (nach Z. 944) neu:
  `@media (max-width: 960px) and (max-height: 940px) { .sidebar .nav.nav-group + .nav.nav-group { margin-top: 16px; } .sidebar .brand { padding-bottom: 14px; } }`
  Die Innenabstände der Einträge (`.nav a` 8 px oben/unten) bleiben.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .sidebar .sb-userwrap] Die Schublade ≤ 960 px (responsiv-B2) übernimmt das D1-Modell. In der Regel Z. 918: `padding: env(safe-area-inset-top, 0px) 14px 0 calc(14px + env(safe-area-inset-left, 0px));` statt `calc(22px + env(...)) …`. Nach D1 ist die Marke überall so hoch wie die Titelzeile (min-height var(--topbar-h), Inhalt mittig). 22 px zusätzlich ergäben oben 94 statt 72 px, also einen anderen Kopf als am Desktop. Safe Area bleibt berücksichtigt. `.sidebar .sb-userwrap { padding-bottom: calc(18px + env(safe-area-inset-bottom, 0px)); }` bleibt und passt zu „unten 0“. Im neuen Block `@media (max-width: 960px) and (max-height: 940px)` steht nur `.sidebar .nav.nav-group + .nav.nav-group { margin-top: 16px; }`. `.sidebar .brand { padding-bottom: 14px; }` entfällt: Die Marke hat nach D1 kein unteres Polster, und D1 streicht dieselbe Zeile im Desktop-Dichteblock. visibility-Übergänge bleiben wie spezifiziert.
- [konflikt: .brand .sb-toggle] Die Trefferfläche des Schubladen-× wird unsichtbar vergrößert (barrierefreiheit-B12a): im ≤960-Block `.brand .sb-toggle { position: relative; } .brand .sb-toggle::after { content: ''; position: absolute; inset: -7px; }`, gesamt 44 px. Sichtbar bleibt der Knopf 30×30, so wie Menüknopf (36) und Avatar (34) ebenfalls nur per ::after auf 44 px wachsen (barrierefreiheit Z5: „Schubladen-× 44“ unsichtbar). responsiv-B2 `.brand .sb-toggle { width: 40px; height: 40px; margin-right: -6px; }` entfällt. Das Ziel ist dasselbe, aber B2 ändert die Optik nur am Handy, und zusammen mit ::after ergäbe es 54 px. Die 7 px liegen im 14-px-Seitenpolster der Leiste, overflow-x: hidden schneidet nichts ab.
- [konflikt: .sidebar] D1 und B1 verschieben beide die Dichte-Blöcke und machen die Konto-Karte klebend, aber nach verschiedenen Modellen (D1: .sidebar unten 18 px Polster, Karte mit bottom: -18px und negativem Rand; B1: oben 22 px Polster, unten 0, Karte mit bottom: 0). Festlegung: (a) Die Dichte-Blöcke verschiebt D1 einmal hinter .sidebar .spacer und streicht dabei .brand { padding-bottom: 14px; }, weil die Marke eine feste Höhe hat. (b) Oben gilt D1: .sidebar ohne Polster oben, .brand { min-height: var(--topbar-h); padding: 0 0 0 16px; }, Linie .sb-sep bei y = 71 über die volle Breite, ausgeklappt und eingeklappt, html.sb-mini .brand wie D1 (5). (c) Unten gilt das Modell von B1 bzw. responsiv-K3: .sidebar { padding: 0 14px 0; }. Der Abstand unten steckt in der Karte: .sidebar .sb-userwrap { position: sticky; bottom: 0; z-index: 1; flex: 0 0 auto; margin-top: 2px; padding: 8px 0 18px; background: var(--bg-2); }. Den Selektor mit .sidebar braucht es wie in D1, sonst gewinnt .popwrap { position: relative } aus Z. 328. bottom: -18px und negativer Rand entfallen: Ohne Polster unten scheint unter der Karte keine Navigation durch (responsiv-Prüfpunkt 11), und .sb-user endet trotzdem bei innerHeight − 18 (abstaende-Messung). (d) Für die Schublade ≤ 960 px gilt B2: oben calc(22px + inset-top), unten 0, Karte unten calc(18px + inset-bottom). Die Ausrichtung der Marke an der 72-px-Titelzeile gilt dort nicht, die Schublade behält ihre bisherige Marke. H2 (nav statt aside) ändert keine Selektoren und ist verträglich. Dieselbe Festlegung gilt für die Anker .sb-userwrap, .sidebar .sb-userwrap und .sidebar .spacer der anderen Konfliktliste.
- VERBINDLICH (Kreuzprüfung): web/css/app.css, Block `@media (max-width: 960px)`, nach abstaende-D1 (dessen Marke mit min-height var(--topbar-h), die .sb-sep über volle Breite und die klebende Konto-Karte `.sidebar .sb-userwrap` gelten auch in der Schublade):
1) Z. 918 `.sidebar { … }`: ergänzen bzw. ändern `padding: env(safe-area-inset-top, 0px) 14px 0 calc(14px + env(safe-area-inset-left, 0px)); visibility: hidden; transition: transform var(--dur-2) var(--ease), visibility 0s linear var(--dur-2);`.
2) Z. 920 → `.sidebar.open { transform: none; visibility: visible; transition: transform var(--dur-2) var(--ease), visibility 0s; }`.
3) Im selben Block neu: `.sidebar .sb-userwrap { padding-bottom: calc(18px + env(safe-area-inset-bottom, 0px)); }`.
4) KEINE Regel `.brand .sb-toggle { width: 40px; height: 40px; margin-right: -6px; }`: Die 44-px-Trefferfläche des Schubladen-× kommt unsichtbar über ::after aus barrierefreiheit-B12a (sichtbar bleiben 30×30). Keine eigene Marken-Regel für die Schublade.
5) Direkt nach dem Block (nach Z. 944) neu: `@media (max-width: 960px) and (max-height: 940px) { .sidebar .nav.nav-group + .nav.nav-group { margin-top: 16px; } }` – ohne `.sidebar .brand { padding-bottom: 14px; }`. Die Innenabstände der Einträge (.nav a 8 px oben/unten) bleiben.
Prüfen: sidebartest.js:44–45, usercardtest.js:55–58, motiontest.js:62–66, mobiletest.js:59–60; mobile_menue (390): Linie unter der Marke über volle Breite, Konto-Karte unten mit Safe Area.

## responsiv-B3 · Konto-Knopf: Name max. 180 px, Handy-Symbolknopf über .acc-iconm

Gruppe responsiv · Cluster shell · Aufwand S · Befunde: bereich_dashboard-4, responsiv-1, zustaende-29
Quelle: audit/spec/responsiv.md Z. 269–275 · Dateien: web/css/app.css
Abhängig von: —

```text
**B3 Konto-Knopf** (bereich_dashboard-4, responsiv-1, zustaende-29)
- Nach Z. 1332 global: `[data-pop="account"] > span { max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }`
- Im Block ≤ 560 px neu:
  `.acc-iconm > [data-pop="account"] { width: 40px; padding-left: 0; padding-right: 0; }`
  `.acc-iconm > [data-pop="account"] > span { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }`
  `.acc-iconm > [data-pop="account"] .caret { display: none; }`

```

## responsiv-3.3a · Konto-Knopf: Sichtbarkeit bei mehr als einem Konto, Option iconM, aria-label (accountControl, pageHead)

Gruppe responsiv · Cluster shell · Aufwand S · Befunde: bereich_dashboard-4, responsiv-1
Quelle: audit/spec/responsiv.md Z. 419–429 · Dateien: web/js/app.js
Abhängig von: responsiv-B3

```text
### 3.3 web/js/app.js

- Z. 243–244 `accountControl(o = {})` (bereich_dashboard-4, responsiv-1):
  vorher `return \`<div class="popwrap${o.mobile ? '' : ' hide-m'}"><button type="button" class="btn" data-pop="account" title="Konto: ${esc(accName)}">…`
  nachher
  ```js
  const show = o.mobile || accounts.length > 1; /* unter 961px nur, wenn es etwas zu wechseln gibt oder die Seite keinen Zeitraum hat */
  return `<div class="popwrap${show ? '' : ' hide-m'}${o.iconM ? ' acc-iconm' : ''}"><button type="button" class="btn" data-pop="account" title="Konto: ${esc(accName)}" aria-label="Konto: ${esc(accName)}">…`
  ```
  Kommentar Z. 241 anpassen: „o.mobile: auch bei nur einem Konto unter 961px zeigen; o.iconM: am Handy nur als Symbol“.
- Z. 259 `pageHead`: `this.accountControl({ mobile: !h.range })` → `this.accountControl({ mobile: !h.range, iconM: !!h.range })`
```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: App.accountControl] Die Schritte ergänzen sich. Einzige Doppelung: Der Link „Konten verwalten“ → `#/settings/konten` steht in aufbau-B5 und in zustaende-S-A2, umgesetzt wird er in S-A2. Endzustand app.js:243–244: `const show = o.mobile || accounts.length > 1`; Wrapper `popwrap${show ? '' : ' hide-m'}${o.iconM ? ' acc-iconm' : ''}` (3.3a). Der Auslöser bekommt zusätzlich `aria-label="Konto: ${esc(accName)}"`; der Name endet mit dem sichtbaren Wort, damit ist WCAG 2.5.3 erfüllt. Im Popover umschließt `<div role="radiogroup" aria-label="Konto">` die Einträge „Alle Konten“ (nur bei mehr als einem Konto) und die Konten, jeder davon `role="radio"` (P11). aria-checked: für „Alle Konten“ `!acc || acc === 'all'`, für ein Konto `acc === a.id || ((!acc || acc === 'all') && accounts.length === 1)` (S-A2). So ist in jeder Lage genau ein Radio gewählt, denn „Alle Konten“ wird bei einem einzigen Konto nicht gerendert. Vor dem Namen steht `<span class="chk">${on ? I.check : ''}</span>`, `on` ist derselbe Ausdruck wie aria-checked (A3). Der Betrag bekommt `title="Kontogröße"`. Danach folgen außerhalb der Gruppe `<hr>` und `<a class="item" href="#/settings/konten">${I.settings} Konten verwalten</a>`. Das Dashboard ruft `App.accountControl({ iconM: true })` auf (3.6). Den pageHead-Teil von 3.3a regelt der Anker App.pageHead.
- [konflikt: App.pageHead] aufbau-B1 schreibt pageHead und newTradeButton neu und nimmt die Teile der anderen Schritte auf. Endzustand: `const sh = typeof screen.head === 'function' ? screen.head(ctx) : screen.head; const h = Object.assign({ range: true, account: true, session: true, trade: true, note: '', tradeTip: '' }, sh);`. In `left` steht `this.accountControl({ mobile: !h.range, iconM: !!h.range })` (responsiv-3.3a), danach wie heute `ctx.headLeft` und der Hinweis. In `right` steht `this.sessionControl()` ohne Argument (komponenten-A4); B1 lässt dort fälschlich noch `(true)` stehen. Vor dem return kommt `if (!left && !right) return '';`; das steht in B1 und abstaende-E1 gleich, also doppelt. abstaende-E-day2 setzt nur `ctx.headLeft` und passt ohne Änderung, weil pageHead headLeft nach dem Konto einsetzt. Mentor ohne Server nutzt die Funktionsform von head (siehe Anker screen.head).
- ÄNDERN: Nur accountControl ändern (Z. 243–244). Den pageHead-Punkt (Z. 259, iconM) setzt aufbau-B1 um.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: ctx.headLeft] Tagesansicht: Die Datumszeile bleibt im Inhalt, ohne ctx.headLeft. aufbau K4 hat genau diese Variante verworfen, weil Datumstitel und Konto-Filter in einer Reihe vermischt würden, und sie hängt an F1 (komponenten-3/bereich_shell-8). Die Knöpfe „Check-in“ und „Trade für diesen Tag“ entfallen mit aufbau-C7b, „Zertifikat“ bleibt dort mit I.award, die Pille „Heute“ ist neutral (farbe-C20). Von abstaende-E-day2 bleibt nur der Inline-Stil des Datumstitels als Klasse: `<h2 class="day-title">` mit `.day-title { font-size: var(--fs-18); line-height: var(--lh-18); margin-left: var(--sp-1); }` (h2-Rolle 18/600, einzige Definition; .day-title in komponenten-C36 entfällt). Trade-Ansicht: Links steht der Rückweg per ctx.headLeft (aufbau-C15d). Die Seitenaktionen aus wording 9.11 kommen nicht in die Rückweg-Zeile, sondern als `actions(ctx)` rechts in die Kopfreihe; die Aufbau-Regel lautet „rechts Seitenaktionen → .dh-sep → Trade loggen“. Bei ctx.params[0]: Notiz-Knopf (`btn`, „Notiz öffnen“ bzw. „Notiz im Notebook“), `btn danger` „Löschen“, `btn` „Trade bearbeiten“ (Seitenebene = btn, nicht primary); ohne Trade-Datensatz ''. Ohne Parameter bleibt „CSV importieren“. pageHead (aufbau-B1), News (aufbau-C9a) und Affiliate (aufbau-C3) bleiben unverändert.
- [konflikt: App.pageHead] aufbau-B1 schreibt pageHead und newTradeButton neu und nimmt die Teile der anderen Schritte auf. Endzustand: `const sh = typeof screen.head === 'function' ? screen.head(ctx) : screen.head; const h = Object.assign({ range: true, account: true, session: true, trade: true, note: '', tradeTip: '' }, sh);`. In `left` steht `this.accountControl({ mobile: !h.range, iconM: !!h.range })` (responsiv-3.3a), danach wie heute `ctx.headLeft` und der Hinweis. In `right` steht `this.sessionControl()` ohne Argument (komponenten-A4); B1 lässt dort fälschlich noch `(true)` stehen. Vor dem return kommt `if (!left && !right) return '';`; das steht in B1 und abstaende-E1 gleich, also doppelt. abstaende-E-day2 setzt nur `ctx.headLeft` und passt ohne Änderung, weil pageHead headLeft nach dem Konto einsetzt. Mentor ohne Server nutzt die Funktionsform von head (siehe Anker screen.head).
- ÜBERNIMMT abstaende-E1: Der frühe Rücksprung `if (!left && !right) return '';` ist in aufbau-B1 enthalten.
- ÄNDERN: In `left` `this.accountControl({ mobile: !h.range, iconM: !!h.range })` statt „unverändert“, in `right` `this.sessionControl()` ohne Argument statt `this.sessionControl(true)`. Der Kommentar nennt zusätzlich den Mentor als Seite, deren head eine Funktion ist.
- [konflikt: App.sessionControl] Die Signatur aus komponenten-A4 gilt: Parameter `iconOnly` entfällt. Damit gibt es eine Bauart, die ab 1181 px Text zeigt und darunter nur das Symbol (`.lbl-wide`); `hide-m` blendete den ganzen Knopf am Handy aus. Endzustand: Zweig mit Session `<button type="button" class="btn" data-action="end-session" aria-label="Session beenden" aria-describedby="session-timer" title="Session beenden">${I.stop}<span id="session-timer">…</span></button>` (P9). Zweig ohne Session `<button type="button" class="btn" data-action="start-session" title="Session starten" aria-label="Session starten">${I.play}<span class="lbl-wide">Session starten</span></button>` (A4). Der Aufruf in pageHead lautet `this.sessionControl()` (aufbau-B1 entsprechend ändern, siehe App.pageHead). P9 und A4 berühren verschiedene Zweige und ergänzen sich.
- ÄNDERN: In `right` `this.sessionControl()` ohne Argument (Signatur aus komponenten-A4).
- [konflikt: screen.head] Ein Mechanismus für bedingte Kopfreihen: `screen.head` darf eine Funktion von ctx sein (aufbau-B1, auch für Trade-Ansicht und Tagesansicht). Ein Getter würde zwar auch funktionieren, wäre aber eine zweite Schreibweise für dasselbe. Mentor: `head() { return configured() ? { range: false, session: false, trade: false, note: 'Der Mentor sieht die letzten 20 Trades dieses Kontos.' } : { range: false, account: false, session: false, trade: false }; }`. Ohne Server bleiben left und right leer, pageHead liefert '' (B1).

## responsiv-3.6 · Dashboard: Konto-Knopf mit iconM

Gruppe responsiv · Cluster shell · Aufwand S · Befunde: bereich_dashboard-4
Quelle: audit/spec/responsiv.md Z. 473–476 · Dateien: web/js/screens/dashboard.js
Abhängig von: responsiv-3.3a, responsiv-B3

```text
### 3.6 web/js/screens/dashboard.js (bereich_dashboard-4)

- Z. 124 `${App.accountControl()}` → `${App.accountControl({ iconM: true })}`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: App.accountControl] Die Schritte ergänzen sich. Einzige Doppelung: Der Link „Konten verwalten“ → `#/settings/konten` steht in aufbau-B5 und in zustaende-S-A2, umgesetzt wird er in S-A2. Endzustand app.js:243–244: `const show = o.mobile || accounts.length > 1`; Wrapper `popwrap${show ? '' : ' hide-m'}${o.iconM ? ' acc-iconm' : ''}` (3.3a). Der Auslöser bekommt zusätzlich `aria-label="Konto: ${esc(accName)}"`; der Name endet mit dem sichtbaren Wort, damit ist WCAG 2.5.3 erfüllt. Im Popover umschließt `<div role="radiogroup" aria-label="Konto">` die Einträge „Alle Konten“ (nur bei mehr als einem Konto) und die Konten, jeder davon `role="radio"` (P11). aria-checked: für „Alle Konten“ `!acc || acc === 'all'`, für ein Konto `acc === a.id || ((!acc || acc === 'all') && accounts.length === 1)` (S-A2). So ist in jeder Lage genau ein Radio gewählt, denn „Alle Konten“ wird bei einem einzigen Konto nicht gerendert. Vor dem Namen steht `<span class="chk">${on ? I.check : ''}</span>`, `on` ist derselbe Ausdruck wie aria-checked (A3). Der Betrag bekommt `title="Kontogröße"`. Danach folgen außerhalb der Gruppe `<hr>` und `<a class="item" href="#/settings/konten">${I.settings} Konten verwalten</a>`. Das Dashboard ruft `App.accountControl({ iconM: true })` auf (3.6). Den pageHead-Teil von 3.3a regelt der Anker App.pageHead.
