# Paket 006 · komponenten, tokens

Schritte: 34 · Dateien: web/README.md, web/css/app.css, web/e2e/dashtest.js, web/js/app.js, web/js/datepicker.js, web/js/rangepicker.js, web/js/screens/dash-filter.js, web/js/ui.js
Betroffene Tests laut Spezifikation: Akzeptanz 4.3 settings_design (Theme-/Designkarten 13/600); e2e/dptest.js; e2e/filtertest.js; e2e/filtertest.js:9, :49, :56; e2e/mobiletest.js:26–27 (Handy-Wert, siehe E1h); e2e/motiontest.js:18, :57; e2e/notechecktest.js:12 (.checklist .it); e2e/proptest.js; e2e/shadowtest.js:53 (fill auf input[type=time]); e2e/sixtest.js:26–31; e2e/sixtest.js:39–40; e2e/tradeformtest.js:11, :30, :47 (#f-fees); web/e2e/dashtest.js:15; web/e2e/motiontest.js: „Kachel hebt sich beim Überfahren“ umkehren (Schritt zustaende-S-TE3); web/e2e/motiontest.js:49 (Toast „Hallo“ nach 2500 ms aus) bleibt gültig, nur prüfen
Baut auf Paketen auf: 1, 2, 4, 5

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## typografie-3.2.3h · --fs-13: 12.5 px → 13 für Steuerelemente und Optionskarten (.design-card b, .theme-card b)

Gruppe typografie · Cluster tokens · Aufwand M · Befunde: typografie-3, bereich_einstellungen-28
Quelle: audit/spec/typografie.md Z. 252–254 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
**→ `--fs-13`**
- 12.5 → 13 (Steuerelemente): 236 `.sb-av`, 280 `.btn.sm`, 322 `.seg.pill button`, 581 `.swatch`, 930 `.topbar .actions .btn`, 1009 `.nb .sel-row`, 1038 `.nb .tags-row .tag-add`, 1057 `.nb .tags-row input`, 1124 `.nb-ytpop`, 1367 `.fd-pop .fd-foot .btn`, 1386 `.fd-seg button`, 1388 `.fd-tog button`, 1400 `.fd-chip`, 1407 `.fd-add`, 1497 `.fw-chips button`, 1508 `.tabs.sm button`, 1574 `.w-bar`, 1633 `.tpl-menu .item`, 1653 `.select.sm`, 1678 `.tracker-foot > .btn`, 1711 `.rep-foot .btn.primary`, 1965 `.cert-opts .seg.sm button`, 2308 `.rp-more summary`, 2543 `.seg.segc button`, 2610 `.select.sm.prop-fsel`, 2753 `.prop-tabs a` (schmal), 2864 `.coach-invite .input`, 3106 `.nw-v b`
- 12.5 → 13 (Optionskarten): 1825 `.design-card b`, 1837 `.theme-card b` (bereich_einstellungen-28)
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .tracker-foot > .btn] `.tracker-foot > .btn { flex: 0 0 auto; }` nach komponenten-C09: padding und font-size entfallen. Das Markup wird btn sm (komponenten-W6) und bekommt 13 px über `.btn.sm` (--fs-13 aus typografie-3.2.3h). Diese Regel setzt keine eigene Schriftgröße mehr.
- [konflikt: .fd-pop .fd-foot .btn] komponenten-C24 löscht Z. 1367 (`.fd-pop .fd-foot .btn { …font-size: 12.5px }`). Die Fußknöpfe sind künftig `.btn.sm` und bekommen 13 px über Z. 280 (`.btn.sm`) aus demselben Typografie-Schritt.
- [konflikt: .fd-chip] .fd-chip ist ein Chip, keine Segment-Taste. Ergebnis: height: 28px; border-radius: 999px; font-size: var(--fs-12); line-height: var(--lh-12); font-weight: 500 (Padding, Rand und Farben wie bisher). Grund: Die Rollentabelle von typografie (Chip = --fs-12) und komponenten (Chips 12px/500) stimmen überein; 13 gilt für Segmente und Menüeinträge. So gleicht der Filter-Chip .chip und .nb .tagpill. Das Gewicht 500 setzen aufbau-A4f, komponenten-C16 und typografie-3.2.4d; komponenten-C16 übernimmt.
- [konflikt: .fd-add] Gleiche Entscheidung wie bei .fd-chip, weil der Hinzufügen-Chip neben den Chips steht und gleich hoch sein muss: height: 28px; border-radius: 999px; font-size: var(--fs-12); line-height: var(--lh-12); font-weight: 500. komponenten-C16 übernimmt. aufbau-A4f, typografie-3.2.3h und typografie-3.2.4d lassen .fd-add aus (Anpassungen wie bei .fd-chip).
- [konflikt: .w-bar] Die Leiste über jedem Widget ist flach: `.w-bar { display: flex; align-items: center; gap: 6px; padding: 0; margin-bottom: 6px; border: 0; background: none; }` (aufbau-B13). Das Markup kommt aus aufbau-C6b. `font-size: 12.5px` an .w-bar wird ersatzlos gestrichen und nicht tokenisiert: Ohne .w-name steht in der Leiste kein erbender Text mehr. .seg.mini und .btn.sm setzen eigene Größen, der Griff ist ein Symbol. Damit bleibt keine wirkungslose Deklaration stehen (kilook Z11).
- [konflikt: .prop-tabs a] Die Schiene aus komponenten-C19 ist die einzige Regel für `.tabs > button, .tabs > a, .prop-tabs a`, mit Skalenwerten statt 13.5/12.5 px: `display: inline-flex; align-items: center; height: 34px; padding: 0 12px; border: 1px solid transparent; border-radius: 9px; background: none; color: var(--text-2); font-size: var(--fs-14); line-height: var(--lh-14); font-weight: 500; …` (Rest wie C19). Fokus: `.tabs > button:focus-visible, .tabs > a:focus-visible, .prop-tabs a:focus-visible { outline-offset: -2px; }`, nur der Versatz. Farbe und Stärke kommen aus der globalen :focus-visible-Regel, nach barrierefreiheit-A1 var(--focus), nie --accent. Handy ≤560: `.prop-tabs a { flex: 1 1 auto; justify-content: center; padding: 0 4px; font-size: var(--fs-13); line-height: var(--lh-13); }`. Handy Z. 3054: `.tabs > button, .tabs > a { padding: 0 12px; font-size: var(--fs-13); line-height: var(--lh-13); }`. Gewählt über die gemeinsame Regel am Dateiende mit `.prop-tabs a[aria-current="page"]` (barrierefreiheit-B9b). Erst danach streichen prop.js 304/305 und affiliate.js 51 das aria-pressed (inkl. der Testanpassungen barrierefreiheit.md Z. 905–907). Grund: Reiter = 14/500 laut Typografie-Rollen, 12.5/13.5 sind verboten, Grün nie für Fokus (BRIEF, barrierefreiheit Z1).
- [konflikt: .tabs.sm button] `.tabs.sm button` (Z. 1508) wird gelöscht (komponenten-C19). Der einzige Nutzer, widgets.js:257 „Letzte Trades / Offene Positionen“, wird über komponenten-W4 zu `.subtabs`. Es wird nichts tokenisiert.
- [doppelt: .fd-seg button] Ergebnis `.fd-seg button { …; font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 500; … }`. Das Gewicht 600 → 500 setzt typografie-3.2.4d als Gewichts-Sweep für alle Filter-Bausteine (.fd-seg button, .fd-tog button, .fd-chip, .fd-add), die Größe typografie-3.2.3h. Von komponenten-C14b bleiben `.fd-seg { gap: 2px; background: var(--surface-2); }` und die Löschungen.
- [doppelt: .fd-tog button] Wie bei .fd-seg button: 500 über typografie-3.2.4d, Größe var(--fs-13)/var(--lh-13) über typografie-3.2.3h. aufbau-A4f ändert das Gewicht nicht noch einmal.
- [doppelt: .nb-ytpop] Ergebnis `.nb-ytpop { …; border: 1px solid var(--border-2); border-radius: 12px; …; font-size: var(--fs-13); line-height: var(--lh-13); }`. Rand und Radius setzt komponenten-C22, die Größe typografie-3.2.3h.
- [konflikt: .seg.pill button] `.seg.pill button` wird gelöscht (komponenten-C14a). Der Check-in wird über komponenten-A6 zur `.scale5`. Die Mindestgröße des Check-ins aus barrierefreiheit bleibt erhalten, sitzt aber am neuen Baustein: `.scale5:not(.rating) button { width: 36px; height: 36px; }` und im Block `@media (max-width: 560px)`: `.scale5:not(.rating) button { width: 44px; height: 44px; }`. Die Bewertungssterne (.scale5.rating) bleiben bei 32. Grund: eine Bauart je Rolle (komponenten K24) und die ausdrückliche Touch-Vorgabe Check-in 36/44 (barrierefreiheit Z5).
- [konflikt: .select.sm] Ergebnis `.select.sm { padding: 7px 28px 7px 10px; font-size: var(--fs-13); line-height: var(--lh-13); border-radius: 9px; width: auto; }`. Das ergibt genau 34 px (18 + 14 + 2), die sm-Stufe. Auf Touch bleibt `@media (pointer: coarse) { .select.sm { padding-top: 10px; padding-bottom: 10px; } }`, das ergibt 40 px. Die neue `.input.sm` aus komponenten-C03 nutzt ebenfalls die Skala statt 12.5 px: `.input.sm { height: 34px; padding: 0 10px; font-size: var(--fs-13); line-height: var(--lh-13); border-radius: 9px; }`. Grund: 12.5 px ist in der Typografie-Skala verboten, sm-Felder = 13 wie .btn.sm.
- [konflikt: .seg.segc button] Toter Code (kein `segc` in js/ oder HTML): komponenten-C14b löscht Z. 2542–2545 und den Handy-Teil in Z. 2754. Nicht tokenisieren.
- [konflikt: .cert-opts .seg.sm button] komponenten-C14b löscht Z. 1965–1966. Das ist kein toter Code: certificate.js:73 rendert `.seg.sm` in `.cert-opts`. Die Format-Schalter erben danach aber die neue Segment-Grundregel aus C14a (34 px, 13 px, 500), und genau das ist gewollt (eine Bauart). Das <small> in den Tasten erbt 500. Nicht tokenisieren.
- [konflikt: .rep-foot .btn.primary] Z. 1711 wird ersatzlos gelöscht. Es gibt weder eine umbenannte Regel `.rep-foot .rep-add { font-size: 12.5px; }` noch eine tokenisierte Variante. Der Knopf ist nach farbe (widgets.js:223) `btn sm rep-add` und hat über .btn.sm bereits var(--fs-13). Eine eigene Größe wäre wirkungslos bzw. mit 12.5 px skalenwidrig.
- [konflikt: .nb .tags-row input] Toter Code (.tags-row enthält kein input, notebook.js:77): kilook-C2 löscht Z. 1057 und 1059. Nicht tokenisieren.
- [konflikt: .tpl-menu .item] komponenten-C23 löscht `.tpl-menu .item { padding: 7px 10px; font-size: 12.5px; }`. Die Einträge erben Maß und Größe von `.popover .item` (Menüeintrag 13 = var(--fs-13), min. 36 px). Nicht tokenisieren.
- VERBINDLICH (Kreuzprüfung): web/css/app.css, 12.5 → `font-size: var(--fs-13); line-height: var(--lh-13)`:
Steuerelemente: Z. 236 `.sb-av`, 280 `.btn.sm`, 581 `.swatch`, 930 `.topbar .actions .btn`, 1009 `.nb .sel-row`, 1038 `.nb .tags-row .tag-add`, 1124 `.nb-ytpop`, 1386 `.fd-seg button`, 1388 `.fd-tog button`, 1497 `.fw-chips button`, 1653 `.select.sm`, 2308 `.rp-more summary`, 2610 `.select.sm.prop-fsel`, 2864 `.coach-invite .input`, 3106 `.nw-v b`.
Optionskarten: Z. 1825 `.design-card b`, 1837 `.theme-card b`.
Aus der Liste gestrichen, nichts tokenisieren: 322 `.seg.pill button` (komponenten-C14a löscht; .scale5 aus C15 schreibt 13 gleich als Token), 1057 `.nb .tags-row input` (kilook-C2 löscht), 1367 `.fd-pop .fd-foot .btn` (komponenten-C24 löscht; die Fußknöpfe werden .btn.sm), 1400 `.fd-chip` und 1407 `.fd-add` (Chips 12/500 über komponenten-C16), 1508 `.tabs.sm button` (komponenten-C19 löscht), 1574 `.w-bar` (aufbau-B13 streicht die Größe ersatzlos), 1633 `.tpl-menu .item` (komponenten-C23 löscht), 1678 `.tracker-foot > .btn` (komponenten-C09: nur noch flex, 13 über .btn.sm), 1711 `.rep-foot .btn.primary` (farbe-C3c löscht), 1965 `.cert-opts .seg.sm button` und 2543 `.seg.segc button` (komponenten-C14b löscht), 2753 `.prop-tabs a` schmal (komponenten-C19 schreibt var(--fs-13)).

## komponenten-C25a · Kacheln: Hover nur Rand, .stat-tile übernimmt .tile-Maße (Padding, 13.5/500, 25px/700), Handy 22 px, heller Schatten

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: bereich_dashboard-11, bereich_statistik-8
Quelle: audit/spec/komponenten.md Z. 398–405 · Dateien: web/css/app.css
Abhängig von: —

```text
**C25 – Kacheln** (bereich_dashboard-11, bereich_statistik-8, diagramme-43, bereich_konto-28)
- Z. 515 `.tile { … transition: border-color var(--dur-2) var(--ease), transform var(--dur-2) var(--ease), box-shadow var(--dur-2) var(--ease); }` → `transition: border-color var(--dur-2) var(--ease);`
- Z. 516 → `.tile:hover, .stat-tile:hover { border-color: var(--border-2); }`
- Z. 636 `.stat-tile { … border-radius: 14px; padding: 16px 18px; … transition: … }` → `border-radius: var(--radius); padding: 12px 15px; … transition: border-color var(--dur-2) var(--ease);`
- Z. 637 `.stat-tile .k { … font-size: 13px; color: var(--text-2); }` → `font-size: 13.5px; font-weight: 500; color: var(--text-2);`
- Z. 639 `.stat-tile .v { … font-size: 24px; … letter-spacing: -0.01em; }` → `font-size: 25px; letter-spacing: -0.02em; line-height: 1.1;`
- Z. 1499 → `:root[data-theme="light"] .card, :root[data-theme="light"] .tile, :root[data-theme="light"] .stat-tile { … }`
- Handy (Z. 3037–3038): `.stat-tile { padding: 14px; }` löschen; `.stat-tile .v { font-size: 20px; }` → `font-size: 22px;`
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .kstrip .tile:hover] Karten und Kacheln haben keinen Hover-Zustand mehr. In app.css werden ersatzlos gelöscht: Z. 486 `.card:hover`, Z. 516 `.tile:hover, .stat-tile:hover`, Z. 2603 `.kstrip .tile:hover`. Die `transition`-Deklaration an `.card` (Z. 485), `.tile` (Z. 515) und `.stat-tile` (Z. 636) fällt ganz weg, weil dort kein Zustand mehr Rand, Schatten oder Lage ändert (kilook Z11: keine wirkungslosen Deklarationen; bewegung D3). Erhalten bleiben: (i) erscheint beim Darüberfahren und bei :focus-within (Z. 496–498, BRIEF „Info-Symbole nur beim Darüberfahren“); `.cal .d:hover` nach bewegung-C1, weil Kalendertage klickbar sind; das Token `--lift-shadow` (landing.css:56). Grund: Der BRIEF verlangt „ruhig, nichts Dekoratives“, und Hover-Rückmeldung gehört nur an Bedienbares. bewegung K1/H3 sieht genau diesen Fall selbst vor: Streicht zustaende `.card:hover`, folgen die Kacheln. S-C5 streicht es. Test motiontest.js:52–53: Beim Überfahren bleiben transform none und border-color unverändert. bewegung-3.11a und zustaende-S-TE3 sind dieselbe Änderung und werden einmal umgesetzt. Die Entscheidung zu `.tile:hover`/`.stat-tile:hover` in konflikt-14 muss hiermit übereinstimmen.
- [konflikt: .stat-tile .k] Ergebnis: .stat-tile .k { display: flex; align-items: center; gap: 6px; font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 500; color: var(--text-2); }. Die 13.5 px aus komponenten-C25a gelten nicht: Der Wert ist in der Skala verboten, und .tile .head wird ebenfalls 13 (typografie-3.2.3i, aufbau-A3b). Das Ziel von C25a, „gleiche Maße wie .tile“, bleibt damit erfüllt. Gewicht 500 setzen drei Schritte; komponenten-C25a übernimmt die ganze Zeile 637.
- [konflikt: .stat-tile .v] Endstand: `.stat-tile .v { font-size: var(--tile-val); font-weight: 700; letter-spacing: var(--ls-val); line-height: var(--lh-val); margin-top: auto; padding-top: var(--sp-2); }` ohne font-family. Das ergibt 24 am Desktop und 20 bei ≤960 und am Handy, beides über das Token. Neu ist `@container (max-width: 175px) { .stat-tile .v { font-size: var(--fv-20); } }`. Die Handy-Regel Z. 3038 entfällt. 25 bzw. 22 px (Komponenten) gibt es nicht: „.stat-tile = .tile“ wird über dasselbe Token erreicht. mobiletest.js:27 (`20px`) bleibt gültig. Den Schriftteil schreibt aufbau-A2, margin und padding schreibt abstaende-B15.
- [konflikt: .stat-tile] Endstand: `.stat-tile { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: var(--sp-4) var(--sp-5); display: flex; flex-direction: column; container-type: inline-size; min-width: 0; transition: border-color var(--dur-1) var(--ease); }`, ohne :hover (siehe .tile:hover). Am Handy (≤560) `.stat-tile { padding: var(--sp-4) var(--sp-3); }` (abstaende-C7). Im hellen Design derselbe Schatten wie .tile (komponenten-C25a). Grund: .tile bekommt durch abstaende-B7 dieselben 16/20 px; damit ist „.stat-tile = .tile“ (Komponenten) erfüllt, 12/15 px war nur der alte .tile-Wert. abstaende-B15 schreibt padding und flex, responsiv-B7 nur container-type, zustaende-S-C5 die Transition.
- [konflikt: .tile] Endstand: `.tile { …; padding: var(--sp-4) var(--sp-5); …; gap: var(--sp-2); …; transition: border-color var(--dur-1) var(--ease); }` (abstaende-B7 und zustaende-S-C5). Kacheln, Statistik-Kacheln und Karten reagieren beim Darüberfahren gar nicht: kein Anheben, kein Schatten, kein Randwechsel. Nur das (i) blendet ein (Z. 497 bleibt). Grund: Kacheln und Karten sind nicht klickbar. Ein Randwechsel täuscht Klickbarkeit vor und ist Bewegung ohne Bedeutung (BRIEF: ruhig, nichts Dekoratives). Die Bewegungs-Regel H3 („Kacheln folgen .card:hover“) bleibt erfüllt, weil zustaende-S-C5 auch .card:hover löscht. Die Rand-Variante aus Bewegung und Komponenten entfällt.
- [konflikt: .tile:hover] Z. 516 `.tile:hover, .stat-tile:hover { … }` wird ganz gelöscht (zustaende-S-C5), Begründung wie beim Anker .tile. Den Test passt bewegung-3.11a einmal an: Name „Kachel bleibt beim Überfahren ruhig“. Nach `p.hover('.tile >> nth=1')` prüft er `transform === 'none'` und dass `borderColor` gleich dem Wert vor dem Überfahren ist.
- [konflikt: .stat-tile:hover] Wie bei .tile:hover: Es gibt keinen Hover an .stat-tile (Z. 516 wird ganz gelöscht, zustaende-S-C5). Die Transition an .stat-tile lautet `border-color var(--dur-1) var(--ease)`, das (i) blendet weiter über Z. 497 ein.
- VERBINDLICH (Kreuzprüfung): web/css/app.css – nur noch:
1) Z. 636 `.stat-tile`: `border-radius: 14px` → `border-radius: var(--radius);`. Padding und transition dieser Regel hier NICHT ändern.
2) Z. 637 als ganze Zeile → `.stat-tile .k { display: flex; align-items: center; gap: 6px; font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 500; color: var(--text-2); }` (Kachel-Titel 13/500 wie `.tile .head`; typografie-3.2.3l und 3.2.4l lassen Z. 637 aus).
3) Z. 1499 → `:root[data-theme="light"] .card, :root[data-theme="light"] .tile, :root[data-theme="light"] .stat-tile { … }` (derselbe Schatten wie .tile).
Entfallen, weil anderswo genau einmal umgesetzt: Z. 515/516 Transition und Hover von .tile/.stat-tile → zustaende-S-C5 (Hover-Regeln ersatzlos gelöscht); Transition in Z. 636 → zustaende-S-C5; Padding Z. 636 → abstaende-B15 (`var(--sp-4) var(--sp-5)`, Flex-Spalte); Z. 639 `.stat-tile .v` → aufbau-A2 (Schrift über --tile-val) und abstaende-B15 (margin-top auto, padding-top var(--sp-2)); Handy Z. 3037 → abstaende-C7 (`padding: var(--sp-4) var(--sp-3)`); Handy Z. 3038 → aufbau-A2 (Zeile gelöscht). Keine 13.5, 25 oder 22 px.

## komponenten-C33a · Textlink-Baustein .tlink

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: bereich_konto-49
Quelle: audit/spec/komponenten.md Z. 465–470 · Dateien: web/css/app.css
Abhängig von: —

```text
**C33 – Textlinks** (bereich_konto-49)
- Nach Z. 89 (`a { … }`) neu:
```css
.tlink { color: var(--text-2); text-decoration: underline; text-decoration-color: var(--border-2); text-underline-offset: 3px; transition: color var(--dur-2) var(--ease), text-decoration-color var(--dur-2) var(--ease); }
.tlink:hover { color: var(--text); text-decoration-color: currentColor; }
```
```

## komponenten-U1 · Neue Symbole I.sort und I.checkSquare

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: bereich_notebook_news-34
Quelle: audit/spec/komponenten.md Z. 510–518 · Dateien: web/js/ui.js
Abhängig von: —

```text
### 3.2 web/js/ui.js

**U1 – Neue Symbole** (bereich_notebook_news-34)
In der Icon-Liste nach `arrowDown` (Z. 77):
```js
sort: sv('<path d="M7 4v16M4 7l3-3 3 3M17 20V4M14 17l3 3 3-3"/>'),
checkSquare: sv('<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>'),
```

```

## komponenten-U2 · Feldbeschriftung im Eingabe-Dialog als .lbl

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: komponenten-18
Quelle: audit/spec/komponenten.md Z. 519–521 · Dateien: web/js/ui.js
Abhängig von: komponenten-C05

```text
**U2 – Feldbeschriftung im Eingabe-Dialog** (komponenten-18)
Z. 453 (promptModal) `<label class="field"><span>${esc(o.label || 'Name')}</span>` → `<label class="field"><span class="lbl">${esc(o.label || 'Name')}</span>`

```

## komponenten-A5a · Gemeinsame Feld-Helfer App.unitField, App.curField, App.feeField

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: komponenten-17, bereich_einstellungen-35, bereich_trades_tag-11
Quelle: audit/spec/komponenten.md Z. 561–567 · Dateien: web/js/app.js
Abhängig von: komponenten-C13

```text
**A5 – Gemeinsame Feld-Helfer** (bereich_trades_tag-11, komponenten-17, bereich_einstellungen-35)
Bei `feeSym` (Z. 439):
```js
App.unitField = function (inputHtml, unit, cls = '') { const f = unit === '%' ? { sym: '%', side: 'post' } : feeSym(unit); return `<div class="inp-cur ${f.side}${cls ? ' ' + cls : ''}" style="--sl:${f.sym.length}">${inputHtml}<span class="cur-sym no-i18n" aria-hidden="true">${esc(f.sym)}</span></div>`; };
App.curField = function (o) { return App.unitField(`<input class="input" type="number" step="any"${o.min != null ? ` min="${o.min}"` : ''} id="${o.id}" name="${o.name}" value="${o.value == null ? '' : o.value}" inputmode="decimal">`, accCurrency(o.accountId)); };
App.feeField = function (t) { return App.curField({ name: 'fees', id: 'f-fees', value: t.fees || 0, accountId: t.accountId, min: 0 }); };
```
```

## komponenten-D1 · datepicker.js: Uhrzeit (type=time) im App-Wähler

Gruppe komponenten · Cluster komponenten · Aufwand M · Befunde: bereich_prop-52
Quelle: audit/spec/komponenten.md Z. 603–612 · Dateien: web/js/datepicker.js, web/css/app.css
Abhängig von: —

```text
### 3.5 web/js/datepicker.js, rangepicker.js, certificate.js, store.js, sample.js

**D1 – datepicker.js: Uhrzeit im App-Wähler** (bereich_prop-52)
- Z. 11 `const TYPES = { date: 1, 'datetime-local': 1, month: 1 };` → `{ date: 1, 'datetime-local': 1, month: 1, time: 1 }`
- `render()` (Z. 74–84): für `input.type === 'time'` nur `${timeHTML()}${foot}` rendern (kein Monatsraster), Popover-Breite 132 px (Klasse `time` am Popover, CSS `.popover.dp.time { width: 132px; }`). Fuß: „Löschen“ nur ohne `required`, „Fertig“.
- `timeHTML()` (Z. 65) und `setTime()` (Z. 118–119): bei `type=time` die Zeit aus `input.value.slice(0, 5)` lesen statt `slice(11, 16)` und mit `write(inp, `${pad(h)}:${pad(m)}`)` ohne Tagesteil schreiben.
- `open()` (Z. 176): bei `type=time` `view.mode = 'time'`, `focusKey` leer.
- CSS (app.css Z. 392–393): `.input[type="time"]` in beide Selektorlisten der Datumsfelder aufnehmen (eigenes Symbol rechts, nativer Indikator aus), Symbol: Uhr statt Kalender.
- Gilt für prop.js:149, shadow.js:38, dash-filter.js:125–126. Die 24-h-Darstellung im Feld liefert die Anzeige-Überlagerung aus wording-2 (zustaende-20).

```

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: DatePicker.TYPES] Beide Schritte bleiben. komponenten-D1 nimmt `time: 1` in TYPES auf und öffnet für Uhrzeitfelder den App-Wähler. Danach legt wording-S4.1-4.5 die Anzeige .dp-display über alle TYPES-Felder, auch time, wie in 4.1 vorgesehen. Damit die Anzeige bei Uhrzeitfeldern nicht leer bleibt, bekommt sync() einen Zweig für time: `root.UI.fmt.time(new Date(2000, 0, 1, +v.slice(0, 2), +v.slice(3, 5)))`. Das ist dieselbe Uhrzeitform wie bei datetime-local über fmt.dateTime, auf Deutsch „09:30“. Ist kein data-empty gesetzt, steht im leeren Feld „—“ (U+2014, Wording W8) statt „–“.

## komponenten-S-dash-filter · Filter-Popover: Fuß mit Trade-Zahl links, „Zurücksetzen“/„Anwenden“ rechts

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: komponenten-21
Quelle: audit/spec/komponenten.md Z. 642–648 · Dateien: web/js/screens/dash-filter.js
Abhängig von: komponenten-C24

```text
**S-dash-filter (dash-filter.js)** (komponenten-21)
Z. 141 `footHTML` →
```js
return `<span class="fd-n">${n === 1 ? '1 Trade' : fmt.int(n) + ' Trades'}</span><span class="fd-btns">${count(f) ? '<button type="button" class="btn sm ghost" data-action="dash-f-reset">Zurücksetzen</button>' : ''}<button type="button" class="btn sm primary" data-action="dash-f-apply">Anwenden</button></span>`;
```
Kopf mit × (Z. 145) bleibt.

```

## komponenten-R1a · README: Filter-Fuß (Trade-Zahl unten links)

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: komponenten-21
Quelle: audit/spec/komponenten.md Z. 743–746 · Dateien: web/README.md
Abhängig von: komponenten-S-dash-filter

```text
### 3.8 web/README.md

**R1** (komponenten-1, komponenten-21, bereich_einstellungen-2, bereich_einstellungen-11, komponenten-16, komponenten-27, zustaende-14, ki_look-11, bereich_notebook_news-32, bereich_notebook_news-20)
- Z. 80: „„Anwenden“ zeigt live die Zahl der Trades“ → „unten links steht live die Zahl der Trades“.
```

## komponenten-R1e · README: neuer Absatz „Bausteine“; Zahlenfelder global ohne Pfeile

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: komponenten-1, komponenten-27, zustaende-14, komponenten-16
Quelle: audit/spec/komponenten.md Z. 750–751 · Dateien: web/README.md
Abhängig von: komponenten-C02, komponenten-C07, komponenten-C19, komponenten-C20, komponenten-C21a

```text
- Nach Z. 210 neuer Absatz **Bausteine**: „Knöpfe: Auslöser (Anlegen, Öffnen, Starten) sind neutral, Anlegen mit Plus; `.btn.primary` nur im Fuß von Dialogen und Popovern und beim Absenden des Hauptformulars einer Seite; Leerzustände: Symbol, Titel, ein Satz, Aktion als `btn sm`. Reiter: Bereichs-Navigation als Schiene, Unteransichten und Reiter in Karten mit Unterstrich. Pfeile: ein Baustein `.btn.nav` (34 px). Menüs: gewählter Eintrag neutral grau hinterlegt, Haken nur in Listen mit Einzelwahl.“
- Z. 227: ergänzen „Gilt für alle Zahlenfelder der App.“
```

## aufbau-A2 · Kachelwerte auf --tile-val umstellen, Sondergrößen löschen

Gruppe aufbau · Cluster komponenten · Aufwand S · Befunde: typografie-6
Quelle: audit/spec/aufbau.md Z. 256–262 · Dateien: web/css/app.css
Abhängig von: aufbau-A1

```text
**A2 Kachelwerte auf das Token** · typografie-6
- Z. 540 `.tile .val { …; font-size: 25px; … }` → `font-size: var(--tile-val);`
- Z. 639 `.stat-tile .v { …; font-size: 24px; … }` → `font-size: var(--tile-val);`
- Z. 1735 `.tile.spark-tile .val { font-family: var(--font-display); font-size: 28px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.1; flex: 0 0 auto; … }` → `.tile.spark-tile .val { flex: 0 0 auto; display: flex; align-items: center; margin: 0; padding: 0; min-height: 0; }` (Schrift erbt von `.tile .val`)
- Löschen: Z. 2397 `.shadow-tiles .tile.shadow-main .val { font-size: 34px; }`, Z. 2446 (Handy 26px), Z. 2684 `.prop-tiles .tile .val { font-size: 24px; }`, Z. 2742 (20px), Z. 936 `.tile .val { font-size: 22px; }`, Z. 3027 `.tile .val { font-size: 21px; }`, Z. 3038 `.stat-tile .v { font-size: 20px; }`
- Bleiben: Z. 533 (Container ≤164px, 22px), Z. 2945 (`.coach-gs-tiles`, 21px), Z. 2700 (`.prop-balance .val`, 26px)

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .tile .val] Ein Rollen-Token für alle Kachelwerte, die Werte kommen aus der Typografie-Skala. In :root steht `--tile-val: var(--fv-24);`, im Block @media (max-width: 960px) `:root { --tile-val: var(--fv-20); }`; eine eigene 560er-Stufe gibt es nicht, das Handy erbt 20. Die Regel lautet `.tile .val { font-size: var(--tile-val); font-weight: 700; letter-spacing: var(--ls-val); line-height: var(--lh-val); }` ohne font-family (Onest kommt über die Sammelregel). In der Container-Notstufe (heute @container max-width 164px, die Schwelle legt der Anker „@container (max-width: 164px)“ fest) gilt `.tile .val { font-size: var(--fv-20); }`. Gelöscht werden Z. 936 (22px, ≤960) und Z. 3027 (21px, Handy). Die Skala gilt auch für die bisherigen „Bleiben“-Ausnahmen aus aufbau-A2: `.prop-balance .val` geht von 26 auf var(--fv-24), bei ≤960 von 22 auf var(--fv-20) (wie typografie-fv24/fv20). `.coach-gs-tiles .tile .val { font-size: 21px }` (Z. 2945) wird gelöscht und erbt --tile-val; schmale Coach-Kacheln fallen über die Container-Notstufe auf 20. Grund: 25, 22, 21 und 26 px liegen nicht auf der Werte-Skala (14/16/20/24/32/44), und die Typografie verbietet sie. Aufbau, Typografie und Responsiv sind sich bei 24 am Desktop und 20 am Handy einig. Streitig war nur der Tablet-Wert 22 (Aufbau). Dafür gibt es die Skalenstufe 20 „Kachelwert schmal, ≤960, Handy“.
- ÄNDERN: Schreibt alle Kachelwerte: Z. 540 `.tile .val { font-size: var(--tile-val); font-weight: 700; letter-spacing: var(--ls-val); line-height: var(--lh-val); }` ohne font-family. Z. 639 `.stat-tile .v` Schriftteil `font-size: var(--tile-val); font-weight: 700; letter-spacing: var(--ls-val); line-height: var(--lh-val);` ohne font-family (margin/padding macht abstaende-B15). Z. 1735 wie geplant. Löschliste wie geplant (2397, 2446, 2684, 2742, 936, 3027, 3038) plus Z. 2945 `.coach-gs-tiles .tile .val`. Die Liste „Bleiben“ entfällt: Z. 533 → var(--fv-20) (typografie-fv20), Z. 2700 `.prop-balance .val` → var(--fv-24) (typografie-fv24).
- ÜBERNIMMT typografie-3.2.5a: Gleiche Regel, aber `font-size: var(--tile-val)` statt var(--fv-24); aufbau-A2 schreibt sie.
- [doppelt: .tile.spark-tile .val] Endstand: `.tile.spark-tile .val { flex: 0 0 auto; display: flex; align-items: center; margin: 0; padding: 0; min-height: 0; }`. Schrift, Größe (--tile-val, also 24/20 statt 28), Gewicht, Laufweite und Zeilenhöhe erbt die Regel von .tile .val. Geschrieben wird sie einmal, von aufbau-A2. Dass typografie-3.2.2f den Selektor aus der Onest-Liste streicht, passt dazu (.tile .val deckt ihn ab).
- [konflikt: .stat-tile .v] Endstand: `.stat-tile .v { font-size: var(--tile-val); font-weight: 700; letter-spacing: var(--ls-val); line-height: var(--lh-val); margin-top: auto; padding-top: var(--sp-2); }` ohne font-family. Das ergibt 24 am Desktop und 20 bei ≤960 und am Handy, beides über das Token. Neu ist `@container (max-width: 175px) { .stat-tile .v { font-size: var(--fv-20); } }`. Die Handy-Regel Z. 3038 entfällt. 25 bzw. 22 px (Komponenten) gibt es nicht: „.stat-tile = .tile“ wird über dasselbe Token erreicht. mobiletest.js:27 (`20px`) bleibt gültig. Den Schriftteil schreibt aufbau-A2, margin und padding schreibt abstaende-B15.
- ÄNDERN: Schreibt alle Kachelwerte: Z. 540 `.tile .val { font-size: var(--tile-val); font-weight: 700; letter-spacing: var(--ls-val); line-height: var(--lh-val); }` ohne font-family. Z. 639 `.stat-tile .v` Schriftteil `font-size: var(--tile-val); font-weight: 700; letter-spacing: var(--ls-val); line-height: var(--lh-val);` ohne font-family (margin/padding macht abstaende-B15). Z. 1735 wie geplant. Löschliste wie geplant (2397, 2446, 2684, 2742, 936, 3027, 3038) plus Z. 2945 `.coach-gs-tiles .tile .val`. Die Liste „Bleiben“ entfällt: Z. 533 → var(--fv-20) (typografie-fv20), Z. 2700 `.prop-balance .val` → var(--fv-24) (typografie-fv24).
- [doppelt: .prop-tiles .tile .val] Z. 2684 (24px) und Z. 2742 (20px, im 960er-Block) werden gelöscht (aufbau-A2). Die Prop-Kacheln erben var(--tile-val), also 24 bzw. 20. Die Token-Umstellung der Typografie für beide Zeilen entfällt, das Ergebnis ist dasselbe.
- [konflikt: .shadow-tiles .tile.shadow-main .val] Z. 2397 (34px) und Z. 2446 (Handy 26px) werden gelöscht (aufbau-A2). Die Hauptkachel des Schatten-Ichs hat damit den normalen Kachelwert var(--tile-val), also 24 bzw. 20. Die Typografie wollte am Handy 24 als Token behalten; das entfällt. Es gibt eine Kachelwert-Größe je Stufe, die Hervorhebung trägt schon der Rand --border-2 (Z. 2396).

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

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .fd-pop .fd-l] komponenten-C05 übernimmt und löscht `.fd-pop .fd-l` (Z. 1360). Die Filter-Beschriftung kommt in Popover und Panel allein aus `.fd-l`: `display: flex; align-items: baseline; gap: 8px; font-size: var(--fs-12); line-height: var(--lh-12); font-weight: 600; color: var(--muted);`. Das sind die Werte aus C05 in Token-Schreibweise; die Zeilenhöhe 1.3 wird zum Token wie in typografie-3.2.3f. aufbau-A4f wollte für das Popover dasselbe Ergebnis (12, `--muted`, 600 geerbt) als Zusatzregel. Eine Regel statt zwei ist sauberer.
- [doppelt: .popover .sec] Die Typografie der Abschnittsköpfe in Menüs kommt nur aus der Eyebrow-Sammelregel in typografie-3.2.2b (11/600/.06em/Versal/'case'/--muted). Die Einzelregel .popover .sec behält nur den Innenabstand `padding: 8px 10px 4px` (komponenten-C21a). Der gleiche Rollenkopf im Filter-Fenster (.fd-pop .fd-gh) wird in die Sammelregel aufgenommen, statt dieselben Werte in aufbau-A4f ein zweites Mal zu schreiben.
- [konflikt: .fd-chip] .fd-chip ist ein Chip, keine Segment-Taste. Ergebnis: height: 28px; border-radius: 999px; font-size: var(--fs-12); line-height: var(--lh-12); font-weight: 500 (Padding, Rand und Farben wie bisher). Grund: Die Rollentabelle von typografie (Chip = --fs-12) und komponenten (Chips 12px/500) stimmen überein; 13 gilt für Segmente und Menüeinträge. So gleicht der Filter-Chip .chip und .nb .tagpill. Das Gewicht 500 setzen aufbau-A4f, komponenten-C16 und typografie-3.2.4d; komponenten-C16 übernimmt.
- [konflikt: .fd-add] Gleiche Entscheidung wie bei .fd-chip, weil der Hinzufügen-Chip neben den Chips steht und gleich hoch sein muss: height: 28px; border-radius: 999px; font-size: var(--fs-12); line-height: var(--lh-12); font-weight: 500. komponenten-C16 übernimmt. aufbau-A4f, typografie-3.2.3h und typografie-3.2.4d lassen .fd-add aus (Anpassungen wie bei .fd-chip).
- [doppelt: .fd-seg button] Ergebnis `.fd-seg button { …; font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 500; … }`. Das Gewicht 600 → 500 setzt typografie-3.2.4d als Gewichts-Sweep für alle Filter-Bausteine (.fd-seg button, .fd-tog button, .fd-chip, .fd-add), die Größe typografie-3.2.3h. Von komponenten-C14b bleiben `.fd-seg { gap: 2px; background: var(--surface-2); }` und die Löschungen.
- [doppelt: .fd-tog button] Wie bei .fd-seg button: 500 über typografie-3.2.4d, Größe var(--fs-13)/var(--lh-13) über typografie-3.2.3h. aufbau-A4f ändert das Gewicht nicht noch einmal.
- [konflikt: .fd-pop .fd-gh] Die Gruppenköpfe im Filter-Fenster („Trade“, „Zeit“ …) werden Eyebrows, wie `.popover .sec` in allen anderen Menüen (aufbau K11). Einheitlich heißt hier: `.fd-pop .fd-gh` kommt in die Eyebrow-Sammelregel von typografie-3.2.2b (var(--fs-11)/var(--lh-11), 600, Versal, .06em, 'case', --muted). Die Einzelregel Z. 1355 wird `.fd-pop .fd-gh { padding: 10px 2px 6px; font-family: var(--font); }`, Pfeil und Zähler bleiben. Die Sammelregel steht zwar früher in der Datei (Z. 101), gewinnt aber mit der Spezifität (0,2,0) gegen die Grundregel `.fd-gh` (Z. 1374, 15/600 --text). Nicht auf 13 px tokenisieren.
- VERBINDLICH (Kreuzprüfung): Es bleibt nur der Gruppenkopf im Filter-Fenster. (1) Z. 1355 `.fd-pop .fd-gh { padding: 9px 2px; font-size: 13px; }` → `.fd-pop .fd-gh { padding: 10px 2px 6px; font-family: var(--font); }`. Pfeil und Zähler bleiben. (2) `.fd-pop .fd-gh` an die Selektorliste der Eyebrow-Sammelregel aus typografie-3.2.2b (Z. 101) anhängen. Größe var(--fs-11)/var(--lh-11), 600, Versalien, .06em, 'case' und --muted kommen nur von dort; mit Spezifität 0,2,0 schlägt sie die Grundregel `.fd-gh` (Z. 1374). Nicht auf 13 px tokenisieren. Umsetzen nach typografie-3.2.2b. Folgendes entfällt: `.popover .sec` 700 → 600 (setzt die Sammelregel; die Einzelregel behält nur den Innenabstand aus komponenten-C21a). `.fd-pop .fd-l` (komponenten-C05 löscht die Regel, `.fd-l` wird 12/600/--muted). Das Gewicht 500 für `.fd-seg button` und `.fd-tog button` setzt typografie-3.2.4d, das für `.fd-chip` und `.fd-add` komponenten-C16.

## aufbau-B9 · Symbol I.award ergänzen

Gruppe aufbau · Cluster komponenten · Aufwand S · Befunde: bereich_dashboard-23
Quelle: audit/spec/aufbau.md Z. 363–365 · Dateien: web/js/ui.js
Abhängig von: —

```text
**B9 Symbol „award“** (`web/js/ui.js` nach Z. 72 `shield: …`) · bereich_dashboard-23
`award: sv('<circle cx="12" cy="8" r="6"/><path d="M15.48 12.89 17 22l-5-3-5 3 1.52-9.11"/>'),`

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .kstrip .tile:hover] Karten und Kacheln haben keinen Hover-Zustand mehr. In app.css werden ersatzlos gelöscht: Z. 486 `.card:hover`, Z. 516 `.tile:hover, .stat-tile:hover`, Z. 2603 `.kstrip .tile:hover`. Die `transition`-Deklaration an `.card` (Z. 485), `.tile` (Z. 515) und `.stat-tile` (Z. 636) fällt ganz weg, weil dort kein Zustand mehr Rand, Schatten oder Lage ändert (kilook Z11: keine wirkungslosen Deklarationen; bewegung D3). Erhalten bleiben: (i) erscheint beim Darüberfahren und bei :focus-within (Z. 496–498, BRIEF „Info-Symbole nur beim Darüberfahren“); `.cal .d:hover` nach bewegung-C1, weil Kalendertage klickbar sind; das Token `--lift-shadow` (landing.css:56). Grund: Der BRIEF verlangt „ruhig, nichts Dekoratives“, und Hover-Rückmeldung gehört nur an Bedienbares. bewegung K1/H3 sieht genau diesen Fall selbst vor: Streicht zustaende `.card:hover`, folgen die Kacheln. S-C5 streicht es. Test motiontest.js:52–53: Beim Überfahren bleiben transform none und border-color unverändert. bewegung-3.11a und zustaende-S-TE3 sind dieselbe Änderung und werden einmal umgesetzt. Die Entscheidung zu `.tile:hover`/`.stat-tile:hover` in konflikt-14 muss hiermit übereinstimmen.
- ÜBERNIMMT bewegung-B5: B5 fällt als eigener Schritt weg. Es gibt keine Regel `.tile:hover, .stat-tile:hover { border-color: var(--border-2) }`. Das Löschen von Z. 516 und 2603 und das Streichen der Übergänge übernimmt S-C5.
- ÄNDERN: Z. 485 (.card), Z. 515 (.tile) und Z. 636 (.stat-tile): die transition-Deklaration ganz entfernen, statt sie auf `border-color var(--dur-1) var(--ease)` zu setzen. Die Löschungen Z. 486, 516 und 2603 bleiben wie spezifiziert, ebenso das padding aus abstaende-B1 in Z. 485.
- [konflikt: .stat-tile] Endstand: `.stat-tile { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: var(--sp-4) var(--sp-5); display: flex; flex-direction: column; container-type: inline-size; min-width: 0; transition: border-color var(--dur-1) var(--ease); }`, ohne :hover (siehe .tile:hover). Am Handy (≤560) `.stat-tile { padding: var(--sp-4) var(--sp-3); }` (abstaende-C7). Im hellen Design derselbe Schatten wie .tile (komponenten-C25a). Grund: .tile bekommt durch abstaende-B7 dieselben 16/20 px; damit ist „.stat-tile = .tile“ (Komponenten) erfüllt, 12/15 px war nur der alte .tile-Wert. abstaende-B15 schreibt padding und flex, responsiv-B7 nur container-type, zustaende-S-C5 die Transition.
- [konflikt: .tile] Endstand: `.tile { …; padding: var(--sp-4) var(--sp-5); …; gap: var(--sp-2); …; transition: border-color var(--dur-1) var(--ease); }` (abstaende-B7 und zustaende-S-C5). Kacheln, Statistik-Kacheln und Karten reagieren beim Darüberfahren gar nicht: kein Anheben, kein Schatten, kein Randwechsel. Nur das (i) blendet ein (Z. 497 bleibt). Grund: Kacheln und Karten sind nicht klickbar. Ein Randwechsel täuscht Klickbarkeit vor und ist Bewegung ohne Bedeutung (BRIEF: ruhig, nichts Dekoratives). Die Bewegungs-Regel H3 („Kacheln folgen .card:hover“) bleibt erfüllt, weil zustaende-S-C5 auch .card:hover löscht. Die Rand-Variante aus Bewegung und Komponenten entfällt.
- [konflikt: .tile:hover] Z. 516 `.tile:hover, .stat-tile:hover { … }` wird ganz gelöscht (zustaende-S-C5), Begründung wie beim Anker .tile. Den Test passt bewegung-3.11a einmal an: Name „Kachel bleibt beim Überfahren ruhig“. Nach `p.hover('.tile >> nth=1')` prüft er `transform === 'none'` und dass `borderColor` gleich dem Wert vor dem Überfahren ist.
- [konflikt: .stat-tile:hover] Wie bei .tile:hover: Es gibt keinen Hover an .stat-tile (Z. 516 wird ganz gelöscht, zustaende-S-C5). Die Transition an .stat-tile lautet `border-color var(--dur-1) var(--ease)`, das (i) blendet weiter über Z. 497 ein.

## zustaende-S-C6 · Toast nimmt Zeiger an (Anhalten beim Darüberfahren)

Gruppe zustaende · Cluster komponenten · Aufwand S · Befunde: zustaende-19, barrierefreiheit-20
Quelle: audit/spec/zustaende.md Z. 290–292 · Dateien: web/css/app.css
Abhängig von: —

```text
**S-C6 Toast** – zustaende-19, barrierefreiheit-20
Z. 898 `.toast { … }`: am Ende `pointer-events: auto;` ergänzen. Z. 897 `.toast-wrap` behält `pointer-events: none`.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .toast-wrap] Den Container legt zustaende-S-U6 an (siehe U.toast). zustaende-S-C6 setzt nur .toast { pointer-events: auto }, .toast-wrap behält pointer-events: none. Damit ist S-C6 verträglich und die Voraussetzung dafür, dass das Anhalten beim Darüberfahren in S-U6 funktioniert.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .btn .cntb] Das Gewicht 700 → 600 steht zweimal da (3.2.4l und S-C7). S-C7 übernimmt es zusammen mit der neutralen Farbe, 3.2.3d stellt die Größe auf das Token um. Endstand: `.btn .cntb { display: inline-grid; place-items: center; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 999px; background: color-mix(in srgb, var(--text) 16%, transparent); color: var(--text); font-size: var(--fs-11); line-height: var(--lh-11); font-weight: 600; }`. Ein Zähler ist ein Etikett, daher 600, ohne Grün. Prüfung zustaende 8 (kein `var(--bg)` in `.btn .cntb`) ist damit erfüllt.
- [doppelt: .fd-panel .cntb] Wie bei .btn .cntb: S-C7 setzt Fläche `color-mix(in srgb, var(--text) 16%, transparent)`, Schrift `var(--text)` und Gewicht 600, 3.2.3d stellt `font-size: var(--fs-11); line-height: var(--lh-11)` um. 3.2.4l ändert die Zeile nicht separat.

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
- [konflikt: --accent] Affiliate-Balken (affiliate.js Z. 47): neutral nach diagramme-K1, also `<path class="br">` mit fill var(--text-2) und fill-opacity .45. Das gilt auch gegen farbe-C16 (--profit). Gründe: Provisionen sind immer ≥ 0, Grün trüge keine Unterscheidung. Die Farbe-Regel selbst sagt „Spalten mit einheitlichem Vorzeichen neutral“, und diagramme A-8 nennt Provisionen ausdrücklich neutral. Fokusring: barrierefreiheit-A2a (--focus = Textfarbe) gilt. Der README-Satz in farbe-D3e wird unter Anker .btn.primary angepasst. Die übrigen Schritte ändern verschiedene Stellen und sind untereinander verträglich. Ihre Einzelkonflikte stehen unter eigenen Ankern (.popover .item[aria-checked], .activity/.tracker/.heat-legend, .dp-day.today/.rr-day.today, .set-tabs/.prop-sub).

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

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .badge] Beide setzen die Größe des LONG/SHORT-Abzeichens von 10.5 auf 11 px. Endzustand Z. 618: `font-size: var(--fs-11); font-weight: 600; letter-spacing: .04em; font-family: var(--font); line-height: 1;`. Die Größe setzt typografie-3.2.3c als Token, barrierefreiheit-B8 nur Laufweite und Schriftfamilie. Die offene Farbfrage bereich_trades_tag-17 (Farbe) bleibt davon unberührt.
- ÄNDERN: Nur `letter-spacing: .06em` → `.04em` ändern und `font-family: var(--font)` ergänzen. Die Größe setzt typografie-3.2.3c (`var(--fs-11)`).

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
- [konflikt: .seg.pill button] `.seg.pill button` wird gelöscht (komponenten-C14a). Der Check-in wird über komponenten-A6 zur `.scale5`. Die Mindestgröße des Check-ins aus barrierefreiheit bleibt erhalten, sitzt aber am neuen Baustein: `.scale5:not(.rating) button { width: 36px; height: 36px; }` und im Block `@media (max-width: 560px)`: `.scale5:not(.rating) button { width: 44px; height: 44px; }`. Die Bewertungssterne (.scale5.rating) bleiben bei 32. Grund: eine Bauart je Rolle (komponenten K24) und die ausdrückliche Touch-Vorgabe Check-in 36/44 (barrierefreiheit Z5).
- [konflikt: .rating] Eine Bauart `.scale5` für Check-in und Bewertung (komponenten), mit der ARIA-Struktur aus barrierefreiheit. Die Zustände hängen deshalb an `aria-checked` bzw. der Klasse `.on`, nicht mehr an `aria-pressed`. Gelbe Schrift ist `--warn-text` (Farbregel). MARKUP app.js: Z. 428 `<span class="lbl" id="f-rating-l">Bewertung</span><div class="scale5 rating" id="f-rating" role="radiogroup" aria-labelledby="f-rating-l">` mit Knöpfen `role="radio" class="${t.rating >= n ? 'on' : ''}" aria-checked="${t.rating === n}" aria-label="${n} von 5 Sternen"`; set-rating schaltet `.on` kumulativ und `aria-checked` nur am n-ten Stern (P13). Z. 513 `scale()` wird `<div class="scale5" role="radiogroup" aria-labelledby="${lid}" data-chips="${name}">` mit `role="radio" aria-checked aria-label="${n} – ${label}"`; seg-set setzt aria-checked (P14a). CSS app.css statt Z. 322–325: `.scale5 { display: inline-flex; gap: 6px; } .scale5 button { width: 32px; height: 32px; padding: 0; border-radius: 8px; border: 1px solid var(--border); background: var(--surface); color: var(--text-2); font-size: 13px; font-weight: 500; cursor: pointer; transition: … var(--dur-1) var(--ease); } .scale5 button:hover { color: var(--text); background: var(--surface-2); } .scale5.rating button { color: var(--muted); } .scale5.rating button.on { --lc: var(--warn-text); }`. Im Handy-Block (≤560px): `.scale5 button { width: 44px; height: 44px; }`, 5 × 44 + 4 × 6 = 244 px. In der gemeinsamen Auswahlregel (~Z. 3125) wird `.rating button[aria-pressed="true"]` zu `.scale5 button[aria-checked="true"], .scale5.rating button.on`; das gilt auch für barrierefreiheit-B9b, das diesen Selektor dann nicht mehr anfasst. Größe: Desktop einheitlich 32 px für beide Skalen, denn 32 ≥ 24 erfüllt WCAG 2.5.8 und eine Bauart hat eine Größe. Die 36 px aus barrierefreiheit stammen von der alten Pillenform, die komponenten löscht. Am Handy 44 px, wie barrierefreiheit es für Touch verlangt, für die ganze Bauart. barrierefreiheit-Test 19 (≥ 44 bei 390 px) bleibt gültig; Prüfpunkt 22 heißt dann „Check-in-Skala 32 px (Handy 44)“.
- [konflikt: .rating button[aria-pressed="true"]] Den Selektor gibt es danach nicht mehr. Endzustand wie beim Anker .rating: `.scale5.rating button { color: var(--muted); }` und `.scale5.rating button.on { --lc: var(--warn-text); }`. Gelbe Schrift ist immer --warn-text (farbe). Im hellen Design hat --warn als Schrift zu wenig Kontrast. In der gemeinsamen Auswahlregel steht `.scale5 button[aria-checked="true"], .scale5.rating button.on`.
- VERBINDLICH (Kreuzprüfung): Es bleibt nur Z. 320: `.seg button[aria-pressed="true"] { font-weight: 500; }` → `.seg button[aria-pressed="true"], .seg button[aria-checked="true"] { font-weight: 500; }`. Folgendes entfällt: Z. 322 (`.seg.pill button` min. 36 px) und die `.seg.pill`-Regel im ≤560-Block, denn komponenten-C14a löscht `.seg.pill`, und der Check-in läuft als `.scale5`. Z. 324 (32 px) und Z. 325 (Gewählt-Farbe) übernimmt komponenten-C15: `.scale5 button` 32×32, `.scale5.rating button { color: var(--muted); }`, `.scale5.rating button.on { --lc: var(--warn-text); }`, im ≤560-Block `.scale5 button { width: 44px; height: 44px; }` für Check-in und Sterne. Keine Zusatzregel `.scale5:not(.rating) button { 36px }`. Prüfpunkt 22 der Barrierefreiheit heißt dann „Check-in-Skala 32 px (Handy 44)“; Test 19 (≥ 44 bei 390 px) bleibt.

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
- [konflikt: .prop-sub a[aria-pressed="true"]] Der gewählte Prop-Unterreiter wird nur über aria-current="page" markiert. Links tragen kein aria-pressed (barrierefreiheit Z4), und prop.js:305 setzt aria-current schon heute. komponenten-C20 schreibt die Selektoren gleich als `.prop-sub a[aria-current="page"]` und `.prop-sub a[aria-current="page"]::after`. barrierefreiheit-B9b ändert die .prop-sub-Zeilen nicht mehr.
- [konflikt: .tabs.scroll-x] Statistik-Reiter in stats.js Z. 15, genau so: `<nav class="tabs scroll-x" data-subnav aria-label="Statistik-Bereiche">${TABS.map(([k, l]) => `<a href="#/stats/${k}"${tab === k ? ' aria-current="page"' : ''}>${l}</a>`).join('')}</nav>`. Das heißt: <nav> mit Namen, kein .btn, keine Inline-Farbe, kein aria-pressed, aria-current nur am gewählten Link. CSS: `.tabs.scroll-x { overflow-x: auto; flex-wrap: nowrap; padding: 3px; margin: 0; }` (C19). Ungewählt --text-2 und Hover --text kommen aus der Schienen-Regel `.tabs > a` (C19). Gewählt kommt aus der gemeinsamen Regel mit `.tabs a[aria-current="page"]` (B9b). Die Zusatzregel `.tabs a:not([aria-current="page"]) …` aus B9b ist überflüssig. Abstand zum Inhalt: Die Schiene hat jetzt einen sichtbaren Rand und kein Scroll-Polster mit Gegenrand mehr. Deshalb entfällt der −4px-Ausgleich in abstaende-C8. Grund: Schiene statt Rahmenknöpfe (komponenten), Navigation als <nav> mit aria-current (barrierefreiheit Z4), 12 px Reiter↔Inhalt (abstaende).
- VERBINDLICH (Kreuzprüfung): In der gemeinsamen Gewählt-Regel app.css Z. 3125–3128 drei Änderungen: (a) `.tabs a[aria-pressed="true"]` → `.tabs a[aria-current="page"]`; (b) `.prop-tabs a[aria-pressed="true"]` → `.prop-tabs a[aria-current="page"]` (prop.js:304 setzt aria-current schon); (c) `.seg button[aria-checked="true"]` ergänzen. Den Eintrag `.rating button[aria-pressed="true"]` nicht anfassen und kein `.rating button.on` einsetzen. komponenten-C15 ersetzt ihn durch `.scale5 button[aria-checked="true"], .scale5.rating button.on`. Folgendes entfällt: Z. 2596/2598 `.prop-sub a[aria-pressed="true"]`, weil komponenten-C20 die `.prop-sub`-Selektoren direkt mit `[aria-current="page"]` schreibt. Ebenso die Zusatzregeln `.tabs a:not([aria-current="page"]) { color: var(--text-2); }` und `…:hover { color: var(--text); }` nach Z. 1513, denn ungewählt --text-2 und Hover --text liefert `.tabs > a` aus komponenten-C19. Umsetzen nach komponenten-C15, C19 und C20. Das Markup der Statistik-Reiter macht barrierefreiheit-C-stats-15.

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
