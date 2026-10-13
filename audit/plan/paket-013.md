# Paket 013 · dashboard, komponenten

Schritte: 29 · Dateien: web/README.md, web/css/app.css, web/e2e/headtest.js, web/js/screens/dashboard.js, web/js/widgets.js
Betroffene Tests laut Spezifikation: e2e/dashtest.js; e2e/dashtest.js:106 (.tpl-row .star, .tpl-row.on .chk svg); e2e/dashtest.js:123; e2e/dashtest.js:123 (erwartet 4 Einträge im ···-Menü, danach 5 bei Nicht-Standard-Vorlage; nicht in E1 genannt); e2e/dashtest.js:22, :102 (#pop-tpl [data-action=dash-tpl-edit], erster Treffer); e2e/dashtest.js:72; e2e/dashtest.js:82; e2e/mobiletest.js:21, :85 (.cal .d .p/.pm); web/e2e/dashtest.js:67 (bleibt grün); web/e2e/dashtest.js:72 (bleibt grün); web/e2e/headtest.js; web/e2e/headtest.js (neuer Fall, Schritt R4); web/e2e/leaktest.js (muss grün bleiben); web/tests/inline-style.test.mjs (Zählung, Schritt R5)
Baut auf Paketen auf: 1, 2, 5, 6, 12

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .day-card .stats .k] Typografie gewinnt mit 12/400 `--muted` für kleine Kennzahl-Beschriftungen in dichten Rastern: `.day-card .stats .k { font-size: var(--fs-12); line-height: var(--lh-12); color: var(--muted); }`. Ein Gewicht wird nicht gesetzt, es bleibt 400 wie heute. Gründe: Die Gewichtsrollen gehören zur Typografie (400 = kleine Kennzahl-Beschriftung, abgestuft gegen den Kachel-Titel 13/500). Außerdem ist 500 breiter und verschärft die Kürzungen (typografie K13, „Disziplin-Kost…“). Die Größe 12 und die Farbe `--muted` sind in beiden Spezifikationen gleich.
- ÄNDERN: Die vier Raster-Punkte (`.strat-stats .k`, `.day-card .stats .k`, `.nb .stats-grid .k`, `.fw-stats > div > span`) streichen. Die Größe 12 setzt typografie-3.2.3e als Token, es kommt kein `font-weight: 500`, `--muted` ist schon gesetzt. Auch der Prüfschritt `.fw-stats { gap: 8px }` entfällt: Die Kürzung prüft typografie-Akzeptanz 4.3 (K13), das Raster ordnet abstaende-C3. Übrig bleibt nur der Punkt `.fw-lbl`, für den die Entscheidung zum Anker `.fw-lbl` gilt.
- [konflikt: .strat-stats .k] Wie bei `.day-card .stats .k`: `.strat-stats .k { font-size: var(--fs-12); line-height: var(--lh-12); color: var(--muted); }`, Gewicht 400 (nicht gesetzt). Typografie gewinnt (Rolle kleine Kennzahl-Beschriftung 12/400).
- ÄNDERN: Die vier Raster-Punkte (`.strat-stats .k`, `.day-card .stats .k`, `.nb .stats-grid .k`, `.fw-stats > div > span`) und den Prüfschritt `.fw-stats { gap: 8px }` streichen. Die Größe 12 als Token kommt aus typografie-3.2.3e, es kommt kein 500. Übrig bleibt nur der Punkt `.fw-lbl` (Entscheidung zum Anker `.fw-lbl`).
- [konflikt: .nb .stats-grid .k] Wie bei `.day-card .stats .k`: `.nb .stats-grid .k { font-size: var(--fs-12); line-height: var(--lh-12); color: var(--muted); }`, Gewicht 400. Gleiche Rolle wie die Kennzahl-Labels in der Tagesansicht, deshalb gleich gesetzt.
- ÄNDERN: Die vier Raster-Punkte (`.strat-stats .k`, `.day-card .stats .k`, `.nb .stats-grid .k`, `.fw-stats > div > span`) und den Prüfschritt `.fw-stats { gap: 8px }` streichen. Die Größe 12 als Token kommt aus typografie-3.2.3e, es kommt kein 500. Übrig bleibt nur der Punkt `.fw-lbl` (Entscheidung zum Anker `.fw-lbl`).
- [konflikt: .fw-stats > div > span] `.fw-stats > div > span { font-size: var(--fs-12); line-height: var(--lh-12); color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }`, Gewicht 400. Das entspricht typografie K13; 13/500 bzw. 12/500 wurden dort ausdrücklich abgelehnt, weil die Kürzung „Disziplin-Kost…“ sonst schlimmer wird. Das Raster selbst (zwei bzw. vier Spalten) regelt abstaende-C3, nicht A3c.
- ÄNDERN: Die vier Raster-Punkte (`.strat-stats .k`, `.day-card .stats .k`, `.nb .stats-grid .k`, `.fw-stats > div > span`) und den Prüfschritt `.fw-stats { gap: 8px }` streichen. Die Größe 12 als Token kommt aus typografie-3.2.3e, es kommt kein 500. Übrig bleibt nur der Punkt `.fw-lbl` (Entscheidung zum Anker `.fw-lbl`).
- [konflikt: .fw-stats] Endstand wie in abstaende-C3: `.fw-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--sp-3); margin-bottom: var(--sp-3); }`, `.card.fw-shadow { container-type: inline-size; } @container (min-width: 520px) { .fw-stats { grid-template-columns: repeat(4, minmax(0, 1fr)); } }`; die Handy-Regel Z. 3039 wird gelöscht. aufbau-A3c will bedingt `gap 10 → 8`; das entfällt. Grund: Mit zwei Spalten unter 520 px Kartenbreite haben die Beschriftungen doppelte Breite, das Abschneiden von „Disziplin-Kosten“ (Anlass der Bedingung) tritt nicht mehr auf. 8 px würde vom 12-px-Raster der Abstände-Spezifikation abweichen. mobiletest.js:24 (Handy 2 Spalten) bleibt grün. Schriftgrößen und -gewichte der Beschriftungen entscheiden die Anker .fw-stats > div > span und .fw-lbl.
- ÄNDERN: Die bedingte Änderung „.fw-stats gap 10px → 8px“ (Prüfung bei 1440/1024) entfällt. Die Schrift-Zeilen bleiben, wie es an den Ankern .fw-stats > div > span und .fw-lbl entschieden wird.
- [konflikt: .fw-lbl] Das Ergebnis lautet `.fw-lbl { font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 500; color: var(--text-2); }`. Begründung: .fw-lbl („Richtig eingeschätzt“, widgets.js:348) steht direkt über dem großen Wert .fw-big. Das ist die Rolle „Wert-Beschriftung 13/500 --text-2“ aus typografie 1.5 (verbindlich) und deckt sich mit .val-label. Die 12er-Liste in 3.2.3f ordnet .fw-lbl nur mechanisch ein.
- ÄNDERN: Z. 1463 mit Tokens schreiben: `.fw-lbl { font-size: var(--fs-13); line-height: var(--lh-13); color: var(--text-2); font-weight: 500; }`. Die übrigen Punkte wie spezifiziert.

## abstaende-C5 · Dashboard 961–1240 px: zwei Widget-Spalten (groß span 2); Score-Skala im Container ≤ 150 px nur erste/letzte Beschriftung

Gruppe abstaende · Cluster dashboard · Aufwand S · Befunde: responsiv-10
Quelle: audit/spec/abstaende.md Z. 354–354 · Dateien: web/css/app.css
Abhängig von: —

```text
| C5 | Dashboard 961–1240, neu nach Z. 1595 | `@media (min-width: 961px) and (max-width: 1240px) { .dash-main { grid-template-columns: repeat(2, minmax(0, 1fr)); } .w.sz-gross, .skel.sz-gross, .dash-main > .add-slot.gap.sz-gross { grid-column: span 2; } }`. Muss nach Z. 1593 stehen (gleiche Spezifität). Dazu nach Z. 576: `@container (max-width: 150px) { .score-scale .lbls span:not(:first-child):not(:last-child) { display: none; } }` | responsiv-10 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .dash-main] Zwei Spalten bei 961–1240 px kommen aus responsiv-B6a. Dessen Selektoren `.dash-main > .w.sz-gross`, `.dash-main > .skel.sz-gross` und `.dash-main > .add-slot.gap.sz-gross` stehen nach Z. 1593 und schlagen Z. 1442/1443/1565/1593. abstaende-C5 enthält dieselbe Regel und gibt sie ab; es behält nur die Container-Regel der Score-Skala. abstaende-C6 (721–960 px, mittel und groß volle Breite, !important wegen Z. 1778) gilt für einen anderen Bereich und bleibt. Ergebnis: ab 1241 px drei Spalten, 721–1240 px zwei (mittel und groß volle Breite), bis 720 px eine. abstaende-C2 (gap und Höhen mit --grid-gap) und dashtest.js:15 sind unabhängig.
- ÄNDERN: Nur `@container (max-width: 150px) { .score-scale .lbls span:not(:first-child):not(:last-child) { display: none; } }` nach Z. 576 umsetzen. Der Block 961–1240 px für .dash-main entfällt (doppelt zu responsiv-B6a).
- [doppelt: .dash-main > .add-slot.gap.sz-gross] Wie beim Anker .dash-main: span 2 bei 961–1240 px kommt nur aus responsiv-B6a (nach Z. 1593, gleiche Spezifität 0,4,0 wie Z. 1593, daher die Position). Der Teil aus abstaende-C5 entfällt. Volle Breite bei 721–960 px (`grid-column: 1 / -1 !important`) bleibt in abstaende-C6.

## abstaende-F1 · Dashboard: Routen-Sperre als erste Anweisung in place() (zweite Sicherung des Größen-Listeners, unmount() bleibt)

Gruppe abstaende · Cluster dashboard · Aufwand S · Befunde: bereich_prop-1, aufbau-2, bereich_statistik-34, abstaende_layout-4
Quelle: audit/spec/abstaende.md Z. 392–396 · Dateien: web/js/screens/dashboard.js
Abhängig von: —

```text
### web/js/screens/dashboard.js

| Nr. | Stelle | vorher → nachher | Befunde |
|---|---|---|---|
| F1 | `placeContext` → `place` (Z. 15) | erste Anweisung in `place = () => {`: `if (App.state.route !== 'dashboard') return;`. `unmount()` (Z. 138) bleibt. | bereich_prop-1, aufbau-2, bereich_statistik-34, abstaende_layout-4 |
```

## abstaende-F3 · Leere Dashboard-Vorlage: Inline-Stil → Klasse center, padding 32px

Gruppe abstaende · Cluster dashboard · Aufwand S · Befunde: abstaende_layout-34
Quelle: audit/spec/abstaende.md Z. 398–399 · Dateien: web/js/screens/dashboard.js
Abhängig von: —

```text
| F3 | Z. 54 (leere Vorlage) | `<div class="dashed" style="text-align:center;padding:30px">` → `<div class="dashed center" style="padding:32px">` (Skala) | abstaende_layout-34 |

```

## abstaende-G2 · Widgets prop_konten, ruhepunkt und mentor als flach: true markieren

Gruppe abstaende · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-24
Quelle: audit/spec/abstaende.md Z. 405–405 · Dateien: web/js/widgets.js
Abhängig von: abstaende-C2

```text
| G2 | Registry Z. 351, 361, 370 | in `prop_konten`, `ruhepunkt` und `mentor` nach `groesse: 'klein',` den Eintrag `flach: true,` ergänzen | bereich_dashboard-24 |
```

## abstaende-G3 · Schatten-Ich-Widget: Karte bekommt cls 'fw-shadow'

Gruppe abstaende · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-2
Quelle: audit/spec/abstaende.md Z. 406–406 · Dateien: web/js/widgets.js
Abhängig von: abstaende-C3

```text
| G3 | Schatten-Ich-Widget Z. 337 | `{ trailing: more('#/shadow') }` → `{ trailing: more('#/shadow'), cls: 'fw-shadow' }` | bereich_dashboard-2 |
```

## abstaende-G4 · 14 Inline-Abstände in widgets.js nach 1.16 ersetzen

Gruppe abstaende · Cluster dashboard · Aufwand M · Befunde: abstaende_layout-34
Quelle: audit/spec/abstaende.md Z. 407–408 · Dateien: web/js/widgets.js
Abhängig von: abstaende-A6

```text
| G4 | 14 Inline-Abstände | nach 1.16 ersetzen | abstaende_layout-34 |

```

## abstaende-R4 · headtest: neuer Fall Dashboard → Statistik → 800 → 1440, Kontext-Leiste in der Kopfreihe, #tb-tools leer

Gruppe abstaende · Cluster dashboard · Aufwand S · Befunde: bereich_statistik-34
Quelle: audit/spec/abstaende.md Z. 523–523 · Dateien: web/e2e/headtest.js
Abhängig von: abstaende-F1

```text
| R4 | `web/e2e/headtest.js` | neuer Fall: 1440 → #/dashboard → #/stats → Viewport 800 → 1440: `#content > .page-head .dh-context [data-pop=range]` vorhanden, `#tb-tools` leer | bereich_statistik-34 |
```

## komponenten-C23 · Vorlagen-Menü (CSS): neutral, Stern gedämpft, Untermenü als eingerückte Gruppe

Gruppe komponenten · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-47, komponenten-2, komponenten-34, komponenten-35
Quelle: audit/spec/komponenten.md Z. 378–387 · Dateien: web/css/app.css
Abhängig von: komponenten-C21a

```text
**C23 – Vorlagen-Menü** (bereich_dashboard-47, komponenten-2, komponenten-34, komponenten-35)
- Z. 1625 `.tpl-row .item.name { flex: 1 1 auto; padding: 8px 10px; }` → `.tpl-row .item.name { flex: 1 1 auto; }`
- Z. 1627 `.tpl-row .chk { width: 16px; display: inline-flex; color: var(--accent); flex: 0 0 auto; }` → `color: var(--text-2);`; Z. 1628 (`.tpl-row .chk svg`) löschen.
- Z. 1629 `.tpl-row .star { color: var(--warn); … }` → `color: var(--muted);`
- Z. 1631 `.tpl-row.on .item.name { color: var(--accent); font-weight: 600; }` → `.tpl-row.on { background: var(--surface-2); } .tpl-row.on .item.name { color: var(--text); }`
- Z. 1632 `.tpl-menu { margin: 2px 6px 8px 24px; padding: 4px; border: 1px solid var(--border); border-radius: 10px; background: var(--surface-2); }` → `.tpl-menu { margin: 2px 0 6px 26px; padding: 4px 0 0; border: 0; border-top: 1px solid var(--border); border-radius: 0; background: none; }`
- Z. 1633 `.tpl-menu .item { padding: 7px 10px; font-size: 12.5px; }` löschen.
- Neu nach Z. 1635: `.tpl-menu .item.danger:disabled { color: var(--text); }`
- Z. 1636 `.tpl-menu .star-i { … color: var(--warn); }` → `color: var(--muted);`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .tpl-menu .item] komponenten-C23 löscht `.tpl-menu .item { padding: 7px 10px; font-size: 12.5px; }`. Die Einträge erben Maß und Größe von `.popover .item` (Menüeintrag 13 = var(--fs-13), min. 36 px). Nicht tokenisieren.
- [doppelt: .tpl-row .chk] Beide setzen `.tpl-row .chk` auf `color: var(--text-2)`. komponenten-C23 übernimmt das und löscht dazu Z. 1628 (`.tpl-row .chk svg`, Symbolgröße kommt aus `.popover .item svg` 16 px). B6 entfällt (siehe Anker .popover .item[aria-checked="true"]).
- [konflikt: .tpl-row.on .item.name] Die aktive Vorlage bekommt denselben flachen Gewählt-Stil wie jeder gewählte Menüeintrag: `.tpl-row.on { background: color-mix(in srgb, var(--text) 10%, var(--surface)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--text) 22%, var(--border-2)); } .tpl-row.on .item.name { color: var(--text); }`. Kein eigenes font-weight, 500 kommt aus `.popover .item` (C21a); ein Gewählt-Zustand ändert das Gewicht nie. C23s `background: var(--surface-2)` ist gleich der Hover-Fläche `.tpl-row:hover`. B6 hätte gar keine Fläche. Beides reicht nicht für „angehobene Fläche, feiner Rand“ (BRIEF) und die Einheitlichkeit mit Konto-, Zeitraum- und Notebook-Menü.
- ÄNDERN: Z. 1631 → `.tpl-row.on { background: color-mix(in srgb, var(--text) 10%, var(--surface)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--text) 22%, var(--border-2)); } .tpl-row.on .item.name { color: var(--text); }` statt `.tpl-row.on { background: var(--surface-2); }`. Übrige Punkte (chk --text-2, svg-Regel löschen, Sterne --muted, `.tpl-menu` als eingerückte Gruppe) bleiben.

## komponenten-C26a · Kalender: Wochentage als Beschriftung, Tageszahl ohne Kreis, nur „heute“ gefüllt (--text/--bg)

Gruppe komponenten · Cluster dashboard · Aufwand S · Befunde: ki_look-11
Quelle: audit/spec/komponenten.md Z. 411–416 · Dateien: web/css/app.css
Abhängig von: —

```text
**C26 – Kalender** (ki_look-11, bereich_dashboard-45)
- Z. 703 → `.cal .wd { text-align: center; padding: 4px 4px 6px; font-size: 12px; font-weight: 500; color: var(--muted); border: 0; background: none; }`
- Z. 704 und Z. 1757 (`.cal .wd.wk`) löschen.
- Z. 708 `.cal .d .n { …; font-size: 11.5px; font-weight: 600; background: var(--surface-3); color: var(--text-2); }` → Lage und Größe behalten (absolute, top/right 6px, 24×24, Radius 999, grid), nur `font-size: 12px; font-weight: 500; background: none; color: var(--muted);`
- Z. 709 `.cal .d.today .n { background: var(--accent); color: var(--accent-ink); }` löschen; nach Z. 712 einfügen: `.cal .d:is(.win, .loss, .be) .n { color: var(--text-2); }` und danach `.cal .d.today .n { background: var(--text); color: var(--bg); font-weight: 600; }`
- Z. 731 `.cal.mini .d.today .n { color: var(--accent); }` → `.cal.mini .d.today .n { color: var(--text); font-weight: 600; } .cal.mini .d.today { border-color: var(--text-2); }`
```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .cal .d.today .n] „Heute“ im Dashboard-Kalender setzt nur komponenten-C26a. Es löscht Z. 709 und fügt nach Z. 712 `.cal .d:is(.win, .loss, .be) .n { color: var(--text-2); }` ein, danach `.cal .d.today .n { background: var(--text); color: var(--bg); font-weight: 600; }`. Die Heute-Regel muss nach der Handelstag-Regel stehen, sonst gewinnt bei gleicher Spezifität deren Farbe. Die Farben sind dieselben wie in farbe-B14, Grün gibt es nie für Heute. 600 hält die invertierte Ziffer lesbar und entspricht der Regel für invertierte Tage in Komponenten und Zustände. Heute ist keine Auswahl. Grundfarbe und Grundgewicht von .cal .d .n regelt die Entscheidung zum Anker .cal .d .n (konflikt-14).
- [doppelt: .cal.mini .d.today] Z. 731 ändert nur komponenten-C26a: `.cal.mini .d.today .n { color: var(--text); font-weight: 600; } .cal.mini .d.today { border-color: var(--text-2); }`. Das ist gleich wie farbe-B14 bis auf 600, das im Mini-Kalender neben dem Zellrand die Unterscheidung trägt, weil Heute dort keine Fläche hat. `.cal.mini .d .n` (Z. 730) steht nach der neuen Heute-Regel des großen Kalenders und hält background: none.
- [doppelt: .cal.mini .d.today .n] Wie beim Anker .cal.mini .d.today: komponenten-C26a setzt `.cal.mini .d.today .n { color: var(--text); font-weight: 600; }`, farbe-B14 lässt Z. 731 aus.
- [konflikt: .cal .d .n] Desktop (Z. 708), Endstand für alle Tage: `.cal .d .n { position: absolute; top: 6px; right: 6px; width: 24px; height: 24px; border-radius: 999px; display: grid; place-items: center; font-size: var(--fs-12); line-height: var(--lh-12); font-weight: 500; background: none; color: var(--text-2); }`; komponenten-C26a schreibt die Regel. Bei der Farbe gilt --text-2 (Farbe und Aufbau). Die Variante „--muted, nur an Handelstagen --text-2“ (Komponenten) entfällt. Grund: Tageszahlen sind Inhalt; --muted ist laut Farbe-Spezifikation Hinweisen, Platzhaltern und Achsen vorbehalten, und es ist eine Regel weniger. ≤960 (Z. 940): `width: 20px; height: 20px; font-size: var(--fs-11); line-height: var(--lh-11);`, top/right 3px bleiben; das schreibt typografie-3.2.3b (Barrierefreiheit hat dieselben Werte). Heute-Kreis und Mini-Kalender entscheiden die Anker .cal .d.today .n und .cal.mini .d.today .n.
- ÄNDERN: Z. 708 wie im Endstand: color var(--text-2) statt var(--muted), Größe als var(--fs-12)/var(--lh-12). Die neue Regel `.cal .d:is(.win, .loss, .be) .n { color: var(--text-2); }` entfällt, die Grundregel deckt das ab. Heute- und Mini-Regeln: siehe deren Anker.
- [konflikt: .cal .wd] Das Ergebnis lautet `.cal .wd { text-align: center; padding: 4px 4px 6px; font-size: var(--fs-12); line-height: var(--lh-12); font-weight: 500; color: var(--muted); border: 0; background: none; }`. Z. 704 und Z. 1757 (`.cal .wd.wk`) werden gelöscht. Die Wochentage werden zur Beschriftung ohne Kasten (komponenten-C26a, ki_look-11). Der Kasten ist reine Zierde und konkurriert mit den Tageskacheln, was „Nichts Dekoratives“ widerspricht. Das „Kasten bleibt“ in aufbau ist nicht begründet, und das README legt nichts fest. Größe 12, Gewicht 500 und Farbe --muted sind in allen drei Schritten gleich, die Größe steht als Token. Wenn typografie-3.2.3f Z. 703 vorher tokenisiert, schreibt C26a die Regel mit denselben Tokens neu.
- ÄNDERN: In der neuen Regel für Z. 703 `font-size: var(--fs-12); line-height: var(--lh-12);` statt `font-size: 12px` schreiben. Den Rest wie spezifiziert.

## komponenten-C26b · Heute-Ring in Rastern (Aktivität, Tracker, Jahresübersicht) und Jahreskalender-Kopf

Gruppe komponenten · Cluster dashboard · Aufwand S · Befunde: ki_look-11
Quelle: audit/spec/komponenten.md Z. 417–418 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 1292 `.activity i.today`, Z. 1672 `.tracker i.today`, Z. 1771 `.ym-grid i.today`: `box-shadow: 0 0 0 2px var(--accent)` → `box-shadow: 0 0 0 1.5px var(--text-2)`
- Z. 1685 `.ycal-head span { … }` → `.ycal-head span { text-align: center; padding: 0 2px 6px; font-size: 12px; font-weight: 500; color: var(--muted); border: 0; }`
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .tracker i.today] Die Heute-Markierung ist in allen Rastern gleich (Aktivität, Regel-Tracker, Jahres-Monatsraster): `box-shadow: 0 0 0 2px var(--text-2)`. Grund: farbe und diagramme (A5; diagramme Z. 219 übernimmt den Wert der Farb-Spezifikation) legen 2 px fest. Das ist auch die heutige Breite, nur die Farbe wechselt von Grün auf --text-2. 1,5 px rendern auf 1×-Bildschirmen unscharf. farbe-B23b setzt .tracker i.today, farbe-B23c setzt .ym-grid i.today. Für .activity i.today gilt derselbe Wert (Liste mit diagramme-A5/farbe-B23a).
- ÄNDERN: Der Punkt „Z. 1292 / 1672 / 1771: box-shadow 0 0 0 1.5px var(--text-2)“ entfällt; die Heute-Ringe setzen farbe-B23b/B23c (und für .activity der dortige Schritt), alle mit 0 0 0 2px var(--text-2). Der Punkt `.ycal-head span` (Z. 1685) bleibt. Der Grundsatz in komponenten Z. 99 („Ring 1,5 px“) gilt als 2 px.
- [doppelt: .ym-grid i.today] farbe-B23c übernimmt: `.ym-grid i.today { box-shadow: 0 0 0 2px var(--text-2); }`. Der Ring-Punkt von komponenten-C26b entfällt, die Anpassung steht beim Anker .tracker i.today.
- [konflikt: .activity i.today] Das Ergebnis lautet `.activity i.today { box-shadow: 0 0 0 2px var(--text-2); }`. Begründung: Die Farbregel „Raster 0 0 0 2px var(--text-2)“ und diagramme A-8 nennen beide 2 px. Ganze Pixel zeichnen auf 1×-Bildschirmen scharf, 1,5 px wird verwaschen. Der Ring hebt sich außerdem klar vom 1-px-Hover-Umriss ab (bewegung). Für die Einheitlichkeit der Raster gilt dieselbe Breite auch für .tracker i.today und .ym-grid i.today (diese Anker regelt konflikt-4). diagramme-A5 und farbe-B23a schreiben in Z. 1292 denselben Wert: Wer zuerst läuft, setzt ihn, der andere findet ihn schon vor. Die Heatmap-Stufen sind nicht Teil dieses Ankers (konflikt-5).
- ÄNDERN: In Z. 1292 (.activity i.today), 1672 (.tracker i.today) und 1771 (.ym-grid i.today) `box-shadow: 0 0 0 2px var(--text-2)` statt `1.5px` setzen. Den Teil `.ycal-head span` laut Anker .ycal-head span umsetzen (mit Tokens).
- [konflikt: .ycal-head span] Das Ergebnis lautet `.ycal-head span { text-align: center; padding: 0 2px 6px; font-size: var(--fs-12); line-height: var(--lh-12); font-weight: 500; color: var(--muted); border: 0; }`. Der Kopf des Jahreskalenders wird wie der Monatskalender eine Beschriftung ohne Kasten (gleiche Begründung wie beim Anker .cal .wd). Größe, Gewicht und Farbe stimmen in allen drei Schritten überein.
- ÄNDERN: In der neuen Regel für Z. 1685 `font-size: var(--fs-12); line-height: var(--lh-12);` statt `font-size: 12px` schreiben.

## komponenten-C26c · Kalender-Titel als Klasse .cal-title; Handy-Regel und Tagesbetrag 800 bleiben (N2)

Gruppe komponenten · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-45, ki_look-11
Quelle: audit/spec/komponenten.md Z. 419–421 · Dateien: web/css/app.css
Abhängig von: —

```text
- Nach Z. 732 (`.cal-nav`) neu: `.cal-nav .cal-title { font-size: 15px; min-width: 140px; text-align: center; }`
- Handy-Regel Z. 940 bleibt; Z. 721 (`.cal .d .p` 800) bleibt bis N2.

```

## komponenten-C28 · Kennzahl-Auswahl im Report-Widget ohne Farbstreifen (CSS)

Gruppe komponenten · Cluster dashboard · Aufwand S · Befunde: ki_look-35
Quelle: audit/spec/komponenten.md Z. 428–431 · Dateien: web/css/app.css
Abhängig von: —

```text
**C28 – Kennzahl-Auswahl im Report-Widget** (ki_look-35)
- Z. 1704 `.rep-sel { … border-left-width: 4px; … font-weight: 600; … }` → `border-left-width` streichen, `font-weight: 500`.
- Z. 1707 `.rep-sel.on { border-color: var(--accent); }` → `.rep-sel.on { border-color: var(--text-2); background: var(--surface-3); }`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .rep-sel.on] Die Regel lautet `.rep-sel.on { border-color: var(--text-2); background: var(--surface-3); }` (komponenten-C28). Begründung: .rep-sel ist ein Auswahlfeld mit geöffneter Liste. Sein Grundrand ist schon --border-2, die Fassung von farbe-C3c würde den Rand also nicht sichtbar ändern. --text-2 ist der Rand eines aktiven Felds (Barrierefreiheit Z1: Felder mit :focus haben Rand --text-2), neutral und ohne Grün. Den Streifen (border-left 4px) und das Gewicht 600 nimmt komponenten-C28 wie spezifiziert heraus.

## komponenten-C36 · Klassen statt Inline-Stil für Widgets und Tagesansicht (CSS)

Gruppe komponenten · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-45, bereich_trades_tag-38
Quelle: audit/spec/komponenten.md Z. 489–504 · Dateien: web/css/app.css
Abhängig von: —

```text
#### C. Einzelstellen

**C36 – Klassen statt Inline-Stil** (bereich_dashboard-45, bereich_trades_tag-38)
Neu (bei den jeweiligen Widget-Regeln):
```css
.score-row { gap: 16px; margin-top: 8px; align-items: center; }
.score-row .score-scale { margin: 0 8px 14px; }
.chal-head { margin-bottom: 6px; }
.chal-head .big-stat { font-size: 30px; margin: 0; }
.chal-foot { margin-top: 8px; }
.tracker-cap { font-size: 13px; font-weight: 500; color: var(--text-2); }
.tracker-score { gap: 12px; flex-wrap: nowrap; }
.dash-empty { text-align: center; padding: 32px; }
.day-title { font-size: 20px; margin-left: 6px; }
```

```

**Hinweise aus der Abstimmung (verbindlich):**

- ÄNDERN: Die Zeile `.chal-head .big-stat { font-size: 30px; margin: 0; }` entfällt. `.chal-head { margin-bottom: var(--sp-2); }` und `.chal-foot { margin-top: var(--sp-2); }` (Abstands-Skala statt 6/8 px). Die übrigen C36-Regeln bleiben.
- [konflikt: .day-title] Eine Regel in app.css (Tagesansicht): `.day-title { font-size: var(--fs-18); line-height: var(--lh-18); margin-left: var(--sp-1); }`, ohne Tokens 18px/4px. 20 px (komponenten-C36) gibt es auf der Typo-Skala nicht; die h2-Rolle ist 18/600. 6 px gibt es auf der Abstandsskala nicht, also 4. Das Markup kommt aus abstaende-E-day2 (Datumsnavigation als `ctx.headLeft` in der Kopfreihe) mit den Komponenten-Klassen: Pfeile `class="btn nav"` (`.btn.round` entfällt), `<h2 class="day-title">`, heute `U.pill('Heute', 'neutral')` (Farbe). An anderen Tagen steht der Link „Heute“ als `class="btn sm"` (ohne ghost) direkt nach dem Titel in der linken Gruppe. Die rechte Gruppe der Kopfreihe gehört Seitenaktionen, Session und „Trade loggen“ (aufbau). „Am Anfang der rechten Gruppe“ (S-day-a) bezog sich auf die alte Datumszeile, die E-day2 auflöst.
- ÄNDERN: Die Zeile `.day-title { font-size: 20px; margin-left: 6px; }` entfällt, die Regel legt abstaende-E-day2 an. Alle übrigen neuen Klassen bleiben.

## komponenten-W1 · Kalender-Navigation: .btn.nav und .cal-title

Gruppe komponenten · Cluster dashboard · Aufwand S · Befunde: komponenten-25, bereich_dashboard-45
Quelle: audit/spec/komponenten.md Z. 580–584 · Dateien: web/js/widgets.js
Abhängig von: komponenten-C07, komponenten-C26c

```text
### 3.4 web/js/widgets.js

**W1 – Kalender-Navigation** (komponenten-25, bereich_dashboard-45)
Z. 121 `calNav`: beide `class="btn round"` → `class="btn nav"`; `<h3 style="font-size:15px;min-width:140px;text-align:center">` → `<h3 class="cal-title">`.

```

## komponenten-W2 · Report-Auswahl ohne Farbstreifen, „Kennzahl“ neutral

Gruppe komponenten · Cluster dashboard · Aufwand S · Befunde: ki_look-35, komponenten-1
Quelle: audit/spec/komponenten.md Z. 585–587 · Dateien: web/js/widgets.js
Abhängig von: komponenten-C28

```text
**W2 – Report-Auswahl ohne Farbstreifen** (ki_look-35, komponenten-1)
Z. 223: am Knopf `.rep-sel` das Attribut `style="border-left-color:${esc(r.color)}"` entfernen. Am Knopf „Kennzahl“ (`class="btn primary sm …" data-action="dash-rep-pick" data-i="new"`) `primary` streichen.

```

## komponenten-W3 · Score-Reihe mit Klassen statt Inline-Stil

Gruppe komponenten · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-45
Quelle: audit/spec/komponenten.md Z. 588–590 · Dateien: web/js/widgets.js
Abhängig von: komponenten-C36

```text
**W3 – Score-Reihe** (bereich_dashboard-45)
Z. 227: `<div class="row" style="gap:16px;margin-top:8px;align-items:center">` → `<div class="row score-row">`; an `.score-scale` `style="margin:0 8px 14px;--p:${sc.overall}"` → `style="--p:${sc.overall}"`.

```

## komponenten-W4 · Umschalter „Letzte Trades / Offene Positionen“ als Unterstrich (.subtabs)

Gruppe komponenten · Cluster dashboard · Aufwand S · Befunde: komponenten-27, referenz-23
Quelle: audit/spec/komponenten.md Z. 591–593 · Dateien: web/js/widgets.js
Abhängig von: komponenten-C19, komponenten-C20

```text
**W4 – Karten-Umschalter als Unterstrich** (komponenten-27, referenz-23)
Z. 257: `<div class="tabs sm" style="margin-bottom:12px">` → `<div class="subtabs" style="margin-bottom:12px">`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: .recent-card] Die Kartenhöhe am Handy ist fest (app.css:1780, nach abstaende-D10 360 px). Fußzeile weg (aufbau-C2a) und Unterstrich-Reiter statt Schiene (komponenten-W4) ändern aber den Platz für die Tabellenzeilen. abstaende-R2 (mobiletest.js:72) wird deshalb erst nach C2a und W4 angepasst und gemessen. Der Wert 360 bleibt, die Zeilengrenze wird mitgeprüft.

## komponenten-W5 · Challenge-Widget mit Klassen statt Inline-Stil

Gruppe komponenten · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-45
Quelle: audit/spec/komponenten.md Z. 594–596 · Dateien: web/js/widgets.js
Abhängig von: komponenten-C36

```text
**W5 – Challenge** (bereich_dashboard-45)
Z. 273: `<div class="row between" style="margin-bottom:6px">` → `<div class="row between chal-head">`; `<div class="big-stat" style="font-size:30px;margin:0">` → `<div class="big-stat">`; beide `<div class="small muted" style="margin-top:8px">` → `<div class="small muted chal-foot">`.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .big-stat] `.big-stat` bleibt die Hero-Klasse und gilt nur noch im Fortschritt (Serie, Heutiger Fortschritt, % Regeln eingehalten). CSS wie in der Typografie geplant: `font-size: var(--fv-44); letter-spacing: var(--ls-hero); line-height: var(--lh-val);` ohne font-family, bei ≤960 var(--fv-32) (typografie-3.2.2h, fv44, fv32 unverändert). Das Challenge-Widget nutzt `.score-big` (32 px) statt `.big-stat` (siehe Anker widget:challenge). Der Payout-Vorschlag nutzt `.prop-sugg-val` auf --tile-val (aufbau-C12e). Grund: Die Aufbau-Regel sagt „.big-stat 44 px nur Fortschritt und Serie“; W5 hätte das Challenge-Widget ohne die Inline-Größe auf 44 px aufgeblasen. progress.js Z. 69 ändern aufbau-C11a (Pfeil mit Tooltip) und kilook-C18 („—“, Ring und ring-card nur mit Wert) gemeinsam in derselben Zeile; keiner überschreibt den anderen. Den Inhalt von Z. 68 und den Tooltip-Text des Pfeils entscheidet der Anker .trend.
- ÄNDERN: widgets.js:273: `<div class="big-stat" style="font-size:30px;margin:0">` → `<div class="score-big">` (nicht `big-stat`). chal-head und chal-foot wie geplant, kein style-Attribut mehr in der Zeile.
- ÜBERNIMMT typografie-3.5c: Klasse score-big setzt komponenten-W5, ohne `style="margin:0"` (.score-big hat keinen Außenabstand).
- [konflikt: widget:challenge] Endstand widgets.js:273: `<div class="row between chal-head"><div class="score-big"><span class="${U.cls(pnl)}">${fmt.cur(pnl, { signed: true })}</span></div>${status}</div>`; beide Fußzeilen werden `<div class="small muted chal-foot">`; kein style-Attribut. Im CSS (komponenten-C36) stehen `.chal-head { margin-bottom: var(--sp-2); }` und `.chal-foot { margin-top: var(--sp-2); }`; die Regel `.chal-head .big-stat { font-size: 30px; margin: 0; }` entfällt. Die 32 px kommen aus .score-big (typografie-fv32 setzt sie von 30 auf var(--fv-32)). Grund: 30 px ist in der Typografie-Skala verboten, die Komponenten-Regel verbietet Inline-Stil außer für dynamische Werte, und .big-stat (44 px) ist dem Fortschritt vorbehalten.
- ÄNDERN: widgets.js:273: `<div class="big-stat" style="font-size:30px;margin:0">` → `<div class="score-big">` (nicht `big-stat`). chal-head und chal-foot wie geplant, kein style-Attribut mehr in der Zeile.
- ÜBERNIMMT typografie-3.5c: Klasse score-big setzt komponenten-W5, ohne `style="margin:0"` (.score-big hat keinen Außenabstand).

## komponenten-W6 · Regel-Tracker mit Klassen, Knopf als btn sm

Gruppe komponenten · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-45, komponenten-12
Quelle: audit/spec/komponenten.md Z. 597–599 · Dateien: web/js/widgets.js
Abhängig von: komponenten-C36, komponenten-C09

```text
**W6 – Regel-Tracker** (bereich_dashboard-45, komponenten-12)
Z. 287: `<div class="caption" style="text-transform:none;letter-spacing:0;font-size:13px;font-weight:600;color:var(--text-2)">` → `<div class="tracker-cap">`; `<div class="row" style="gap:12px;flex-wrap:nowrap">` → `<div class="row tracker-score">`; `<a class="btn" href="#/progress">` → `<a class="btn sm" href="#/progress">`. Breite `style="width:…%"` bleibt.

```

## komponenten-W7 · Auslöser in Feature-Widgets neutral (Schatten-Ich, Prop, Ruhepunkt, Mentor)

Gruppe komponenten · Cluster dashboard · Aufwand S · Befunde: komponenten-1
Quelle: audit/spec/komponenten.md Z. 600–602 · Dateien: web/js/widgets.js
Abhängig von: —

```text
**W7 – Auslöser in Feature-Widgets neutral** (komponenten-1; deckt sich mit Gruppe Farbe bereich_dashboard-1, nur einmal umsetzen)
Z. 334 und Z. 354 `class="btn sm primary"` → `class="btn sm"`; Z. 365 `class="btn sm${key === 'vor' ? ' primary' : ''}"` → `class="btn sm"`; Z. 373 `class="btn sm primary"` → `class="btn sm"`; Z. 374 (Mentor-Widget, Inline-Formular) `class="btn primary"` → `class="btn"`.

```

## komponenten-S-dashboard-a · Vorlagen-Menü: Stift ins Untermenü („Bearbeiten“), „Als Standard festlegen“ nur bei Nicht-Standard

Gruppe komponenten · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-47
Quelle: audit/spec/komponenten.md Z. 649–651 · Dateien: web/js/screens/dashboard.js
Abhängig von: komponenten-C23

```text
**S-dashboard (dashboard.js)** (bereich_dashboard-47, komponenten-18, bereich_dashboard-45, komponenten-1)
- Z. 32: in `.tpl-row` den Knopf `data-action="dash-tpl-edit" … title="Bearbeiten"` (Stift) entfernen.
- Z. 33 (Untermenü) als ersten Eintrag einfügen: `<button type="button" class="item" data-action="dash-tpl-edit" data-id="${t.id}">${I.edit}<span>Bearbeiten</span></button>`. Den Eintrag `data-action="dash-tpl-default"` nur bei `!t.isDefault` ausgeben, Text immer „Als Standard festlegen“ (kein `disabled`, kein „Ist Standard“). Der obere Eintrag „Diese Vorlage bearbeiten“ (Z. 31) bleibt (e2e klickt `#pop-tpl [data-action="dash-tpl-edit"]`, erster Treffer).
```

## komponenten-S-dashboard-b · Leere Widget-Fläche als .dash-empty

Gruppe komponenten · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-45
Quelle: audit/spec/komponenten.md Z. 652–652 · Dateien: web/js/screens/dashboard.js
Abhängig von: komponenten-C36

```text
- Z. 53 `<div class="dashed" style="text-align:center;padding:30px">` → `<div class="dashed dash-empty">`
```

## komponenten-S-dashboard-c · „Beispieldaten laden“ neutral

Gruppe komponenten · Cluster dashboard · Aufwand S · Befunde: komponenten-1
Quelle: audit/spec/komponenten.md Z. 653–653 · Dateien: web/js/screens/dashboard.js
Abhängig von: —

```text
- Z. 130 „Beispieldaten laden“ `btn sm primary` → `btn sm`
```

## komponenten-S-dashboard-d · Dialog-Beschriftungen (Challenge, Neue Vorlage) als .lbl; Bibliothek/Bearbeitungsleiste bleiben primary

Gruppe komponenten · Cluster dashboard · Aufwand S · Befunde: komponenten-18
Quelle: audit/spec/komponenten.md Z. 654–656 · Dateien: web/js/screens/dashboard.js
Abhängig von: komponenten-C05

```text
- Z. 184 (Challenge-Dialog, viermal) und Z. 195 („Neue Vorlage“, „Name“): `<label class="field"><span>` → `<label class="field"><span class="lbl">`
- Z. 63 (`sp-add … primary`) und Z. 119 (Bearbeitungsleiste) bleiben.

```

## komponenten-R1d · README: Kalender – „heute“ einziger gefüllter Kreis, Wochentage ohne Kästen

Gruppe komponenten · Cluster dashboard · Aufwand S · Befunde: ki_look-11
Quelle: audit/spec/komponenten.md Z. 749–749 · Dateien: web/README.md
Abhängig von: komponenten-C26a

```text
- Z. 190: ergänzen „Heute ist der einzige gefüllte Kreis (Textfarbe), Wochentage ohne Kästen.“
```

## aufbau-A4g · Kalender-Wochentage und Tageszahl 12px/500

Gruppe aufbau · Cluster dashboard · Aufwand S · Befunde: typografie-32
Quelle: audit/spec/aufbau.md Z. 296–299 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 703 `.cal .wd { …; font-size: 12.5px; font-weight: 600; color: var(--text-2); … }` → `font-size: 12px; font-weight: 500; color: var(--muted);` (Rand, Radius, Fläche bleiben)
- Z. 708 `.cal .d .n { …; font-size: 11.5px; font-weight: 600; …; color: var(--text-2); }` → `font-size: 12px; font-weight: 500;` (Kreis und Fläche: Farbe-Spezifikation)
- Z. 1685 `.ycal-head span { …; font-size: 12.5px; color: var(--text-2); … }` → `font-size: 12px; font-weight: 500; color: var(--muted);`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .cal .d .n] Desktop (Z. 708), Endstand für alle Tage: `.cal .d .n { position: absolute; top: 6px; right: 6px; width: 24px; height: 24px; border-radius: 999px; display: grid; place-items: center; font-size: var(--fs-12); line-height: var(--lh-12); font-weight: 500; background: none; color: var(--text-2); }`; komponenten-C26a schreibt die Regel. Bei der Farbe gilt --text-2 (Farbe und Aufbau). Die Variante „--muted, nur an Handelstagen --text-2“ (Komponenten) entfällt. Grund: Tageszahlen sind Inhalt; --muted ist laut Farbe-Spezifikation Hinweisen, Platzhaltern und Achsen vorbehalten, und es ist eine Regel weniger. ≤960 (Z. 940): `width: 20px; height: 20px; font-size: var(--fs-11); line-height: var(--lh-11);`, top/right 3px bleiben; das schreibt typografie-3.2.3b (Barrierefreiheit hat dieselben Werte). Heute-Kreis und Mini-Kalender entscheiden die Anker .cal .d.today .n und .cal.mini .d.today .n.
- ÄNDERN: Teil Z. 708 `.cal .d .n` entfällt (komponenten-C26a). Z. 703 `.cal .wd` und Z. 1685 `.ycal-head span` laut Anker .cal .wd bzw. unverändert.
- [konflikt: .cal .wd] Das Ergebnis lautet `.cal .wd { text-align: center; padding: 4px 4px 6px; font-size: var(--fs-12); line-height: var(--lh-12); font-weight: 500; color: var(--muted); border: 0; background: none; }`. Z. 704 und Z. 1757 (`.cal .wd.wk`) werden gelöscht. Die Wochentage werden zur Beschriftung ohne Kasten (komponenten-C26a, ki_look-11). Der Kasten ist reine Zierde und konkurriert mit den Tageskacheln, was „Nichts Dekoratives“ widerspricht. Das „Kasten bleibt“ in aufbau ist nicht begründet, und das README legt nichts fest. Größe 12, Gewicht 500 und Farbe --muted sind in allen drei Schritten gleich, die Größe steht als Token. Wenn typografie-3.2.3f Z. 703 vorher tokenisiert, schreibt C26a die Regel mit denselben Tokens neu.
- ÄNDERN: Den Punkt zu Z. 703 (.cal .wd) streichen, die Regel schreibt komponenten-C26a. Z. 708 (.cal .d .n) regelt konflikt-14, Z. 1685 der Anker .ycal-head span.
- [konflikt: .ycal-head span] Das Ergebnis lautet `.ycal-head span { text-align: center; padding: 0 2px 6px; font-size: var(--fs-12); line-height: var(--lh-12); font-weight: 500; color: var(--muted); border: 0; }`. Der Kopf des Jahreskalenders wird wie der Monatskalender eine Beschriftung ohne Kasten (gleiche Begründung wie beim Anker .cal .wd). Größe, Gewicht und Farbe stimmen in allen drei Schritten überein.
- ÄNDERN: Den Punkt zu Z. 1685 (.ycal-head span) streichen, die Regel schreibt komponenten-C26b.

## aufbau-B13 · Bearbeitungsmodus flach: keine Kontur, Leiste ohne Rahmen, .w-name weg

Gruppe aufbau · Cluster dashboard · Aufwand S · Befunde: ki_look-13, aufbau-33
Quelle: audit/spec/aufbau.md Z. 384–389 · Dateien: web/css/app.css
Abhängig von: —

```text
**B13 Bearbeitungsmodus flach** (`web/css/app.css` Z. 1569–1579) · ki_look-13, aufbau-33
- Z. 1569 `.w.editing { outline: 1.5px dashed var(--border-2); outline-offset: 5px; border-radius: var(--radius); }` → `.w.editing { border-radius: var(--radius); }`
- Z. 1574 `.w-bar { …; padding: 4px 6px; margin-bottom: 8px; border-radius: 10px; border: 1px solid var(--border-2); background: var(--surface-2); … }` → `padding: 0; margin-bottom: 6px; border: 0; background: none;` (Rest bleibt)
- Z. 1579 `.w-bar .w-name { … }` löschen
- Drop-Markierung `.over-l`/`.over-r` (Z. 1572–1573) bleibt unverändert.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .w-bar] Die Leiste über jedem Widget ist flach: `.w-bar { display: flex; align-items: center; gap: 6px; padding: 0; margin-bottom: 6px; border: 0; background: none; }` (aufbau-B13). Das Markup kommt aus aufbau-C6b. `font-size: 12.5px` an .w-bar wird ersatzlos gestrichen und nicht tokenisiert: Ohne .w-name steht in der Leiste kein erbender Text mehr. .seg.mini und .btn.sm setzen eigene Größen, der Griff ist ein Symbol. Damit bleibt keine wirkungslose Deklaration stehen (kilook Z11).
- ÄNDERN: In Z. 1574 zusätzlich `font-size: 12.5px;` streichen. Die Regel lautet danach `.w-bar { display: flex; align-items: center; gap: 6px; padding: 0; margin-bottom: 6px; border: 0; background: none; }`.
- [doppelt: .w-bar .w-name] Die Regel `.w-bar .w-name { … }` (Z. 1579) wird genau einmal gelöscht, durch aufbau-B13.
- ÜBERNIMMT abstaende-C4: Das Löschen von Z. 1579 übernimmt aufbau-B13. Zum übrigen Teil von C4 siehe Anker .w.editing (entfällt).
- [konflikt: .w.editing] aufbau-B13 gilt: `.w.editing { border-radius: var(--radius); }`. Die Außenlinie entfällt, und die Karte wird nicht gestrichelt (keine Regel `.w.editing .w-body > :is(.card, .tile) { border-style: dashed … }`). Die Drop-Markierung .over-l/.over-r bleibt. Grund: BRIEF „ruhig, nichts Dekoratives“. Den Modus zeigen bereits die klebende Leiste „Bearbeitungsmodus · Standard“ und die Griff-/×-Leiste über jedem Widget. Die gestrichelte Karte wäre ein dritter Moduszeiger und sieht aus wie eine leere Ablagefläche. abstaendes Ziel „weniger Rahmen“ erfüllt B13 vollständig: Es bleibt ein Rahmen, nämlich die Karte selbst.

## aufbau-C2a · Widgets: „Alle Trades“ als Kopf-Link, Regel-Tracker ohne Fußlink, Regeln-Link korrigiert

Gruppe aufbau · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-33, aufbau-10, bereich_training-5
Quelle: audit/spec/aufbau.md Z. 422–427 · Dateien: web/js/widgets.js
Abhängig von: —

```text
#### `web/js/widgets.js`

**C2** · bereich_dashboard-33, aufbau-10, bereich_training-5, typografie-4
- Z. 253 Info von `letzte_trades`: „… „Mehr anzeigen“ öffnet das TradeLog.“ → „… „Alle Trades“ öffnet das TradeLog.“
- Z. 257: `…${table}<div class="more-row"><a class="more-link" href="#/trades">Mehr anzeigen</a></div>`, `{ info: e.info, cls: 'recent-card' }` → `…${table}`, `{ info: e.info, cls: 'recent-card', trailing: more('#/trades', 'Alle Trades') }` (`more` aus Z. 307 wird zur Renderzeit aufgerufen)
- Z. 288 Regel-Tracker: `{ trailing: `<a class="more-link" href="#/progress">Mehr anzeigen</a>` }` streichen (Knopf „Tages-Checkliste“ bleibt). Im Leertext `<a href="#/settings">` → `<a href="#/settings/regeln">`
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .more-row] Bindendes Ergebnis für „Letzte Trades & offene Positionen“ (widgets.js:253/257): keine Fußzeile mehr. Der Link sitzt nach dem einen App-Muster (aufbau) rechts im Kartenkopf, wie „Öffnen“ bei den Bereichs-Widgets. Z. 257 endet auf `…${table}` ohne `.more-row`, Optionen `{ info: e.info, cls: 'recent-card', trailing: d.all.length ? more('#/trades', 'Zum TradeLog') : '' }`. Beschriftung „Zum TradeLog“ (Wording-Glossar W5: „Zum/Zur + Bereich“ = Navigation aus einem Widget; Übersetzung „Go to TradeLog“ ist dort vorbereitet), also weder „Alle Trades“ noch „Mehr anzeigen“ (das bleibt fürs Nachladen reserviert). Info-Text Z. 253: „…; „Zum TradeLog“ öffnet die ganze Liste.“ Der Link erscheint nur, wenn das Widget überhaupt Trades hat (`d.all.length`). Das erfüllt W13 („mehr“-Link nur mit Inhalt) und zustaende-S-TE2 (leeres Dashboard ohne `.recent-card .more-link`). Der Kopf-Link springt aber nicht weg, wenn man auf „Offene Positionen“ ohne offene Position umschaltet (das täte die Bedingung rows.length). Regel-Tracker Z. 288 verliert den Kopf-Link (aufbau-C2a = wording 6.15, einmal umsetzen). Danach löscht aufbau-B12 `.more-row` (Z. 1658). Tests: dashtest.js:67 Meldung „Zum TradeLog“, die Prüfung `.recent-card .more-link` mit href `#/trades` bleibt. In dashtest.js:72 den Teil `&& await p.$eval('.w[data-typ="regel_tracker"] .card-head .more-link', …)` streichen, weil der Kopf-Link bewusst entfällt; die Prüfung `.tracker-foot a` → `#/progress` bleibt.
- ÄNDERN: Z. 257 trailing = `d.all.length ? more('#/trades', 'Zum TradeLog') : ''` (nicht 'Alle Trades', nicht unbedingt). Z. 253 Info-Text = „…; „Zum TradeLog“ öffnet die ganze Liste.“ (Wording). Regel-Tracker-Teil und Leertext-Link #/settings/regeln wie spezifiziert. Zusätzlich dashtest.js:72 die Kopf-Link-Prüfung des Regel-Trackers streichen (Rest der Zeile bleibt). Den neuen Text „Zum TradeLog“ und den Info-Satz in js/lang/{en,es,hi,pt,zh}.js eintragen (Werte aus wording).
- [reihenfolge: .recent-card] Die Kartenhöhe am Handy ist fest (app.css:1780, nach abstaende-D10 360 px). Fußzeile weg (aufbau-C2a) und Unterstrich-Reiter statt Schiene (komponenten-W4) ändern aber den Platz für die Tabellenzeilen. abstaende-R2 (mobiletest.js:72) wird deshalb erst nach C2a und W4 angepasst und gemessen. Der Wert 360 bleibt, die Zeilengrenze wird mitgeprüft.
- [konflikt: .more-link] CSS (aufbau-B12 übernimmt): .more-link { color: var(--text-2); font-weight: 500; font-size: var(--fs-13); line-height: var(--lh-13); text-decoration: none; } .more-link:hover { color: var(--text); }. Ohne Unterstrich beim Hover, wie in der aufbau-Regel („kein Grün, kein Unterstrich“): ruhiger, und gleich wie die übrigen Kopf-Bedienelemente. .more-row wird gelöscht. Touch-Höhe 44 px aus barrierefreiheit-B12e danach, unverändert. Letzte Trades (widgets.js:253/257): Der Link steht im Kartenkopf (aufbau-C2a, U.card trailing), nicht in einer Fußzeile, und heißt „Zum TradeLog“. Das ist laut wording W5 der feste Name für „Navigation aus Widget“ und sagt das Ziel; „Alle Trades“ und „Mehr anzeigen“ fallen weg, denn „Mehr anzeigen“ heißt laut aufbau nur Nachladen. Der Link erscheint nur mit Zeilen (wording W13, zustaende): { info: e.info, cls: 'recent-card', trailing: rows.length ? more('#/trades', 'Zum TradeLog') : '' }. Info-Satz: „Die zuletzt geschlossenen Trades des Kontos und alle noch offenen Positionen. So viele Zeilen, wie in die Karte passen; „Zum TradeLog“ öffnet die ganze Liste.“ Regel-Tracker: trailing ersatzlos streichen (aufbau-C2a = wording 6.15, aufbau übernimmt). Der Leertext-Link geht auf #/settings/regeln.
- ÄNDERN: Linktext „Zum TradeLog“ statt „Alle Trades“. trailing nur mit Zeilen: trailing: rows.length ? more('#/trades', 'Zum TradeLog') : ''. Info-Satz Z. 253 endet auf „; „Zum TradeLog“ öffnet die ganze Liste.“ Regel-Tracker-Teil (trailing streichen, Link #/settings/regeln) wie spezifiziert.
