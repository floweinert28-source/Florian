# Paket 011 · dashboard

Schritte: 17 · Dateien: web/README.md, web/css/app.css, web/js/screens/dashboard.js, web/js/widgetpreviews.js, web/js/widgets.js
Betroffene Tests laut Spezifikation: Akzeptanz 4.3 dashboard (Wert einzeilig, Fuß „−4,2 % · 01.10.2026“); Akzeptanz 4.3 panel_widget_hinzufuegen (keine Überlappung); Akzeptanz 4.4: grep "<td>\${fmt.(date|time)" ohne Treffer; Akzeptanz 4.4: grep small.sub ohne Treffer; web/e2e/dashtest.js:72 (Tracker-Raster, prüfen); web/e2e/dashtest.js:82/89 ([data-i="new"] bleibt); web/e2e/mobiletest.js:21/85 (Kalender, prüfen); web/e2e/mobiletest.js:23-24 (Handy zwei Spalten, muss grün bleiben)
Baut auf Paketen auf: 1, 2, 3

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## farbe-B14 · Kalender und Jahresübersicht: Heute-Kreis neutral, Tageszahl ohne Kreis, Rot 18 %, Auswahl --text-2, Kleintext --text-2, helle 10-%-Tönung, Mini-Kalender

Gruppe farbe · Cluster dashboard · Aufwand M · Befunde: bereich_dashboard-16, farbe_kontrast-24, referenz-8, farbe_kontrast-12, bereich_dashboard-3, diagramme-45
Quelle: audit/spec/farbe.md Z. 284–293 · Dateien: web/css/app.css
Abhängig von: —

```text
**B14 – Kalender, Z. 708–731 und Jahresübersicht Z. 1693–1694** — bereich_dashboard-16, farbe_kontrast-24, referenz-8, farbe_kontrast-12, bereich_dashboard-3, diagramme-45
- Z. 708 `.cal .d .n { …; background: var(--surface-3); color: var(--text-2); }` → `background: none; color: var(--text-2);` (Position, 24×24, Radius, Größe und Gewicht bleiben)
- Z. 709 `.cal .d.today .n { background: var(--accent); color: var(--accent-ink); }` → `.cal .d.today .n { background: var(--text); color: var(--bg); }`
- Z. 711 `.cal .d.loss { background: color-mix(in srgb, var(--loss) 23%, var(--surface)); … }` → `18%` (Rand 52 % bleibt); ebenso Z. 1694 `.yc.loss` `23%` → `18%`
- Z. 713 `.cal .d.sel { box-shadow: 0 0 0 2px var(--accent); }` → `box-shadow: 0 0 0 2px var(--text-2);`
- nach Z. 722 neu: `.cal .d:is(.win, .loss, .be) :is(.c, .wr) { color: var(--text-2); }`
- nach Z. 722 neu (hell): `:root[data-theme="light"] .cal .d.win, :root[data-theme="light"] .yc.win { background: color-mix(in srgb, var(--profit) 10%, var(--surface)); border-color: color-mix(in srgb, var(--profit) 35%, var(--border)); }` und `:root[data-theme="light"] .cal .d.loss, :root[data-theme="light"] .yc.loss { background: color-mix(in srgb, var(--loss) 10%, var(--surface)); border-color: color-mix(in srgb, var(--loss) 35%, var(--border)); }`
- Z. 711 Kommentar → `/* dunkel: Rot etwas kräftiger als Grün (18 % zu 16 %), hell beide 10 % */`
- Z. 731 `.cal.mini .d.today .n { color: var(--accent); }` → `.cal.mini .d.today { border-color: var(--text-2); } .cal.mini .d.today .n { color: var(--text); }`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .cal .d.today .n] „Heute“ im Dashboard-Kalender setzt nur komponenten-C26a. Es löscht Z. 709 und fügt nach Z. 712 `.cal .d:is(.win, .loss, .be) .n { color: var(--text-2); }` ein, danach `.cal .d.today .n { background: var(--text); color: var(--bg); font-weight: 600; }`. Die Heute-Regel muss nach der Handelstag-Regel stehen, sonst gewinnt bei gleicher Spezifität deren Farbe. Die Farben sind dieselben wie in farbe-B14, Grün gibt es nie für Heute. 600 hält die invertierte Ziffer lesbar und entspricht der Regel für invertierte Tage in Komponenten und Zustände. Heute ist keine Auswahl. Grundfarbe und Grundgewicht von .cal .d .n regelt die Entscheidung zum Anker .cal .d .n (konflikt-14).
- [doppelt: .cal.mini .d.today] Z. 731 ändert nur komponenten-C26a: `.cal.mini .d.today .n { color: var(--text); font-weight: 600; } .cal.mini .d.today { border-color: var(--text-2); }`. Das ist gleich wie farbe-B14 bis auf 600, das im Mini-Kalender neben dem Zellrand die Unterscheidung trägt, weil Heute dort keine Fläche hat. `.cal.mini .d .n` (Z. 730) steht nach der neuen Heute-Regel des großen Kalenders und hält background: none.
- [doppelt: .cal.mini .d.today .n] Wie beim Anker .cal.mini .d.today: komponenten-C26a setzt `.cal.mini .d.today .n { color: var(--text); font-weight: 600; }`, farbe-B14 lässt Z. 731 aus.
- [konflikt: .cal .d .n] Desktop (Z. 708), Endstand für alle Tage: `.cal .d .n { position: absolute; top: 6px; right: 6px; width: 24px; height: 24px; border-radius: 999px; display: grid; place-items: center; font-size: var(--fs-12); line-height: var(--lh-12); font-weight: 500; background: none; color: var(--text-2); }`; komponenten-C26a schreibt die Regel. Bei der Farbe gilt --text-2 (Farbe und Aufbau). Die Variante „--muted, nur an Handelstagen --text-2“ (Komponenten) entfällt. Grund: Tageszahlen sind Inhalt; --muted ist laut Farbe-Spezifikation Hinweisen, Platzhaltern und Achsen vorbehalten, und es ist eine Regel weniger. ≤960 (Z. 940): `width: 20px; height: 20px; font-size: var(--fs-11); line-height: var(--lh-11);`, top/right 3px bleiben; das schreibt typografie-3.2.3b (Barrierefreiheit hat dieselben Werte). Heute-Kreis und Mini-Kalender entscheiden die Anker .cal .d.today .n und .cal.mini .d.today .n.
- VERBINDLICH (Kreuzprüfung): app.css, Kalender. (1) Z. 711 `.cal .d.loss { background: color-mix(in srgb, var(--loss) 23%, var(--surface)); … }` → `18%`; der Rand mit 52 % bleibt. Der Kommentar in Z. 711 wird `/* dunkel: Rot etwas kräftiger als Grün (18 % zu 16 %), hell beide 10 % */`. (2) Z. 1694 `.yc.loss` `23%` → `18%`. (3) Z. 713 `.cal .d.sel { box-shadow: 0 0 0 2px var(--accent); }` → `box-shadow: 0 0 0 2px var(--text-2);`. (4) Nach Z. 722 neu: `.cal .d:is(.win, .loss, .be) :is(.c, .wr) { color: var(--text-2); }`. (5) Nach Z. 722 neu (hell): `:root[data-theme="light"] .cal .d.win, :root[data-theme="light"] .yc.win { background: color-mix(in srgb, var(--profit) 10%, var(--surface)); border-color: color-mix(in srgb, var(--profit) 35%, var(--border)); }` und `:root[data-theme="light"] .cal .d.loss, :root[data-theme="light"] .yc.loss { background: color-mix(in srgb, var(--loss) 10%, var(--surface)); border-color: color-mix(in srgb, var(--loss) 35%, var(--border)); }`. Folgendes entfällt, weil komponenten-C26a es schreibt: Z. 708 `.cal .d .n` (background none, color --text-2, var(--fs-12), 500). Z. 709, der Heute-Kreis: `.cal .d.today .n { background: var(--text); color: var(--bg); font-weight: 600; }` hinter der Handelstag-Regel. Z. 731, der Mini-Kalender: `.cal.mini .d.today .n { color: var(--text); font-weight: 600; } .cal.mini .d.today { border-color: var(--text-2); }`.

## farbe-B23b · Regel-Tracker gedämpft grün (18/32/50/70 %), Heute-Ring --text-2, eigene Legende .heat-legend.right

Gruppe farbe · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-38, farbe_kontrast-24
Quelle: audit/spec/farbe.md Z. 336–338 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 1668–1671 `.tracker i.l1 … l4` (25/45/70/100 %) → `color-mix(in srgb, var(--accent) 18%, var(--surface-2))`, `32%`, `50%`, `70%` (`border: 0` bleibt)
- Z. 1672 `.tracker i.today { box-shadow: 0 0 0 2px var(--accent); }` → `var(--text-2)`
- nach Z. 1675 neu: `.heat-legend.right i.l1 { background: color-mix(in srgb, var(--accent) 18%, var(--surface-2)); } .heat-legend.right i.l2 { background: color-mix(in srgb, var(--accent) 32%, var(--surface-2)); } .heat-legend.right i.l3 { background: color-mix(in srgb, var(--accent) 50%, var(--surface-2)); } .heat-legend.right i.l4 { background: color-mix(in srgb, var(--accent) 70%, var(--surface-2)); }`
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .tracker i.l1] Zellen und Legende des Regel-Trackers nutzen dieselben Selektoren (diagramme-A6, eine Quelle). Die Prozente kommen aus der Farb-Spezifikation; diagramme K12 überlässt sie ihr ausdrücklich. Grün bleibt, weil Regeltreue positiv ist (BRIEF), aber gedämpft statt als volle --accent-Fläche (ruhige Diagramme). Ergebnis in Z. 1668–1671: `.tracker i.l1, .heat-legend.right i.l1 { background: color-mix(in srgb, var(--accent) 18%, var(--surface-2)); border: 0; }`, ebenso l2 mit 32 %, l3 mit 50 % und l4 mit `color-mix(in srgb, var(--accent) 70%, var(--surface-2))`. Nach Z. 1675 kommen keine zusätzlichen .heat-legend.right-Regeln. Die Legende der Aktivität (ohne .right) bleibt neutral, die Spezifität 0,3,1 trennt beide.
- ÄNDERN: Nur `.tracker i.today { box-shadow: 0 0 0 2px var(--text-2); }` (Z. 1672) umsetzen. Z. 1668–1671 und die neuen `.heat-legend.right i.l1–l4`-Regeln nach Z. 1675 übernimmt diagramme-A6 mit denselben Werten 18/32/50/70 %.
- [konflikt: .tracker i.l2] Wie beim Anker .tracker i.l1: gemeinsamer Selektor `.tracker i.l2, .heat-legend.right i.l2` aus diagramme-A6, Wert `color-mix(in srgb, var(--accent) 32%, var(--surface-2))`, border: 0. Die Anpassungen stehen dort.
- [konflikt: .tracker i.l3] Wie beim Anker .tracker i.l1: gemeinsamer Selektor `.tracker i.l3, .heat-legend.right i.l3` aus diagramme-A6, Wert `color-mix(in srgb, var(--accent) 50%, var(--surface-2))`, border: 0. Die Anpassungen stehen dort.
- [konflikt: .tracker i.l4] Wie beim Anker .tracker i.l1: gemeinsamer Selektor `.tracker i.l4, .heat-legend.right i.l4` aus diagramme-A6, Wert `color-mix(in srgb, var(--accent) 70%, var(--surface-2))` statt `var(--accent)`, border: 0. Die Anpassungen stehen dort.
- [doppelt: .heat-legend.right i.l1] Die Legende hängt am Zellen-Selektor von diagramme-A6 (18 %). Die eigene Legenden-Regel aus farbe-B23b entfällt. Die Anpassungen stehen beim Anker .tracker i.l1.
- [doppelt: .heat-legend.right i.l2] Die Legende hängt am Zellen-Selektor von diagramme-A6 (32 %). Die eigene Legenden-Regel aus farbe-B23b entfällt. Die Anpassungen stehen beim Anker .tracker i.l1.
- [doppelt: .heat-legend.right i.l3] Die Legende hängt am Zellen-Selektor von diagramme-A6 (50 %). Die eigene Legenden-Regel aus farbe-B23b entfällt. Die Anpassungen stehen beim Anker .tracker i.l1.
- [doppelt: .heat-legend.right i.l4] Die Legende hängt am Zellen-Selektor von diagramme-A6 (70 %). Die eigene Legenden-Regel aus farbe-B23b entfällt. Die Anpassungen stehen beim Anker .tracker i.l1.
- [konflikt: .tracker i.today] Die Heute-Markierung ist in allen Rastern gleich (Aktivität, Regel-Tracker, Jahres-Monatsraster): `box-shadow: 0 0 0 2px var(--text-2)`. Grund: farbe und diagramme (A5; diagramme Z. 219 übernimmt den Wert der Farb-Spezifikation) legen 2 px fest. Das ist auch die heutige Breite, nur die Farbe wechselt von Grün auf --text-2. 1,5 px rendern auf 1×-Bildschirmen unscharf. farbe-B23b setzt .tracker i.today, farbe-B23c setzt .ym-grid i.today. Für .activity i.today gilt derselbe Wert (Liste mit diagramme-A5/farbe-B23a).

## farbe-B23c · Jahres-Monatsraster: Heute-Ring --text-2

Gruppe farbe · Cluster dashboard · Aufwand S · Befunde: referenz-8
Quelle: audit/spec/farbe.md Z. 339–340 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 1771 `.ym-grid i.today { box-shadow: 0 0 0 2px var(--accent); }` → `var(--text-2)`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .ym-grid i.today] farbe-B23c übernimmt: `.ym-grid i.today { box-shadow: 0 0 0 2px var(--text-2); }`. Der Ring-Punkt von komponenten-C26b entfällt, die Anpassung steht beim Anker .tracker i.today.

## farbe-C3c · Report-Panel: gewählte Zeile flach, Zurücksetzen --text-2, Schriftgröße über .rep-add

Gruppe farbe · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-1
Quelle: audit/spec/farbe.md Z. 389–392 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 1707 `.rep-sel.on { border-color: var(--accent); }` → `.rep-sel.on { border-color: var(--border-2); background: var(--surface-3); }`
- Z. 1710 `.rep-foot .rep-reset { color: var(--accent); … }` → `color: var(--text-2);`
- Z. 1711 `.rep-foot .btn.primary { font-size: 12.5px; }` → `.rep-foot .rep-add { font-size: 12.5px; }`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .rep-sel.on] Die Regel lautet `.rep-sel.on { border-color: var(--text-2); background: var(--surface-3); }` (komponenten-C28). Begründung: .rep-sel ist ein Auswahlfeld mit geöffneter Liste. Sein Grundrand ist schon --border-2, die Fassung von farbe-C3c würde den Rand also nicht sichtbar ändern. --text-2 ist der Rand eines aktiven Felds (Barrierefreiheit Z1: Felder mit :focus haben Rand --text-2), neutral und ohne Grün. Den Streifen (border-left 4px) und das Gewicht 600 nimmt komponenten-C28 wie spezifiziert heraus.
- [konflikt: .rep-foot .btn.primary] Z. 1711 wird ersatzlos gelöscht. Es gibt weder eine umbenannte Regel `.rep-foot .rep-add { font-size: 12.5px; }` noch eine tokenisierte Variante. Der Knopf ist nach farbe (widgets.js:223) `btn sm rep-add` und hat über .btn.sm bereits var(--fs-13). Eine eigene Größe wäre wirkungslos bzw. mit 12.5 px skalenwidrig.
- VERBINDLICH (Kreuzprüfung): app.css. (1) Z. 1710 `.rep-foot .rep-reset { color: var(--accent); … }` → `color: var(--text-2);`. (2) Z. 1711 `.rep-foot .btn.primary { font-size: 12.5px; }` ersatzlos löschen. Es gibt keine Umbenennung zu `.rep-foot .rep-add` und keine Token-Variante; der Knopf `btn sm rep-add` hat über `.btn.sm` schon var(--fs-13). Damit hat auch der Listeneintrag „1711 .rep-foot .btn.primary“ in typografie-3.2.3h nichts mehr zu tun. Folgendes entfällt: Z. 1707 `.rep-sel.on`, weil komponenten-C28 sie als `border-color: var(--text-2); background: var(--surface-3);` schreibt.

## farbe-C14a · Widget Ø Gewinn/Verlust: Farbe über U.cls, gemeinsames Kompakt-Kriterium

Gruppe farbe · Cluster dashboard · Aufwand S · Befunde: zustaende-26
Quelle: audit/spec/farbe.md Z. 440–441 · Dateien: web/js/widgets.js
Abhängig von: —

```text
**C14 – `web/js/widgets.js`** — zustaende-26, diagramme-44, bereich_dashboard-38, bereich_dashboard-1, referenz-9
- Z. 176 (Kachel Ø Gewinn/Verlust): `<span class="pos">${fmt.cur(s.avgWin, { compact: s.avgWin >= 1000 })}</span><span class="neg">${fmt.cur(s.avgLoss, { compact: -s.avgLoss >= 1000 })}</span>` → vor dem `return` `const cmp = Math.max(s.avgWin, -s.avgLoss) >= 1000;`, dann `<span class="${U.cls(s.avgWin)}">${fmt.cur(s.avgWin, { compact: cmp })}</span><span class="${U.cls(s.avgLoss)}">${fmt.cur(s.avgLoss, { compact: cmp })}</span>`
```

## farbe-C14c · Report-Panel: „Hinzufügen“-Knopf ohne primary, Klasse rep-add

Gruppe farbe · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-1
Quelle: audit/spec/farbe.md Z. 444–444 · Dateien: web/js/widgets.js
Abhängig von: farbe-C3c

```text
- Z. 223 `class="btn primary sm ${st.pick === 'new' ? 'on' : ''}"` → `class="btn sm rep-add ${st.pick === 'new' ? 'on' : ''}"`
```

## farbe-C14e · Feature-Widgets (Schatten-Ich, Blind-Replay, Prop, Ruhepunkt, Mentor-Link): primary entfernen, Mentor-Fragen bleibt primary

Gruppe farbe · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-1
Quelle: audit/spec/farbe.md Z. 446–447 · Dateien: web/js/widgets.js
Abhängig von: —

```text
- Z. 334 `class="btn sm primary" href="#/shadow"` → `class="btn sm"`; Z. 343 `class="btn primary fw-go"` → `class="btn fw-go"` (Blind-Replay, Feature-Flag bleibt); Z. 354 `class="btn sm primary"` → `class="btn sm"`; Z. 365 `class="btn sm${key === 'vor' ? ' primary' : ''}"` → `class="btn sm"`; Z. 373 `class="btn sm primary"` → `class="btn sm"`. Z. 374 (Formular „Fragen“) bleibt `btn primary` (siehe K4).

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .btn.primary] (1) Gewicht: .btn.primary bekommt 700 (typografie-3.2.4b). Grundlage sind BRIEF („nur Werte und Hauptknöpfe 700“) und README Z. 209–210 („Hauptknöpfe („Trade loggen“, Speichern) fett“). Heute rendert 600 ohnehin als 700, sichtbar ändert sich also nichts. farbe-B2 und farbe-D3e nennen kein Gewicht mehr. (2) Rolle nach der Komponenten-Regel: .btn.primary steht nur im Dialog-Fuß, im Popover- bzw. Panel-Fuß (eine abschließende Aktion) und beim Absenden des Hauptformulars einer Seite. Auslöser, Leerzustand-, Banner- und Listen-Aktionen sowie Inline-Formulare in Karten und Widgets sind .btn bzw. .btn.sm. Grund: Das bleibt ruhig, egal wie N1 ausgeht; bei Variante B wäre jeder primary der lauteste Punkt der Seite und lauter als „Trade loggen“. Damit sind neutral: widgets.js:374 (Mentor-Frage im Widget) `btn`, coach.js:129/140/148 `btn sm`, notebook.js:67 „Wiederherstellen“ `btn sm`, prop.js:82 (Leerzustand) `btn sm`, prop.js:97 „Als bestanden markieren“ `btn sm`, prop.js:262/266 „Ausgabe/Payout erfassen“ `btn`, „Konto hinzufügen“ im Konten-Bereichskopf misc.js:186 `btn` (nicht sm, Seitenebene). (3) Doppelte Knopfänderungen führen die komponenten-S-Schritte aus. Die farbe-C-Schritte lassen ihre Knopf-Teile weg, ihre Farbteile bleiben. Ausnahme ist der Willkommen-Banner dashboard.js:130: farbe-C19c schreibt den ganzen Aufruf neu und übernimmt damit auch den Knopf. (4) README: farbe-D3e ersetzt Z. 203–208 sofort, aber ohne Aussehen und Gewicht von .btn.primary. komponenten-R1f setzt danach auf und zieht Z. 207–208 bzw. Z. 191 erst nach den Antworten N1/N2 nach, wie dort vorgesehen.
- ÄNDERN: Die Knopf-Teile an Z. 334, 354, 365 und 373 entfallen (führt komponenten-W7 aus). Z. 374 wird `btn` (W7) und bleibt nicht primary. Nur Z. 343 (`fw-go`, Blind-Replay, entschieden unter Anker .fw-go) bleibt in diesem Schritt.

## farbe-C15 · Widget-Vorschauen: Report-Farben angleichen, Disziplin-Kosten mit Minus

Gruppe farbe · Cluster dashboard · Aufwand S · Befunde: diagramme-44, bereich_training-3
Quelle: audit/spec/farbe.md Z. 448–451 · Dateien: web/js/widgetpreviews.js
Abhängig von: —

```text
**C15 – `web/js/widgetpreviews.js`** — diagramme-44, bereich_training-3
- Z. 7 `BLUE = '#3d6bff'` → `'#4a6fe3'`, `ORANGE = '#f5a53a'` → `'#b4549f'`
- Z. 45 `big(8, 47, '2.170,41 €', L, 14)` → `big(8, 47, '−2.170,41 €', L, 14)`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: widgetpreviews.BLUE] Report-Standardpalette in der ganzen App: ['#2f80d0', '#b4549f', '#c0702f'] (Blau, Magenta, Kupfer), nach Diagramme K13. Beide Sätze bestehen den dataviz-Validator, aber #4a6fe3 liegt im hellen Design nur ΔE 6,0 von --be (#5f4fcf) entfernt, und Break-even muss von jeder Serie unterscheidbar bleiben. Echtes Widget und Vorschau nutzen dieselben Werte. widgets.js Z. 211 (REPORT_COLORS und REPORT_OLD-Umschreibung #3d6bff→#2f80d0, #f5a53a→#b4549f, #4fd1a5→#c0702f) setzt nur diagramme-E7 um. widgetpreviews.js Z. 7 (`BLUE = '#2f80d0'`, `MAGENTA = '#b4549f'`, ORANGE wird umbenannt) setzt nur diagramme-F2 um. Die Farbe-Regel „Report-Serien #4a6fe3 …“ und die Paletten-Prüfung in farbe.md Z. 593 gelten mit "#2f80d0,#b4549f,#c0702f".
- ÄNDERN: Nur Z. 45 umsetzen (`'2.170,41 €'` → `'−2.170,41 €'`). Z. 7 (BLUE/ORANGE) entfällt, das übernimmt diagramme-F2 mit #2f80d0/#b4549f und der Umbenennung in MAGENTA.
- [konflikt: widgetpreviews.ORANGE] Wie beim Anker widgetpreviews.BLUE: Nur diagramme-F2 ändert Z. 7. ORANGE heißt danach MAGENTA = '#b4549f', alle Verwendungen werden mitgezogen. Der Wert ist in beiden Spezifikationen gleich, also gibt es nur einen Schritt dafür.
- ÄNDERN: Nur Z. 45 umsetzen (`'2.170,41 €'` → `'−2.170,41 €'`). Z. 7 (BLUE/ORANGE) entfällt, das übernimmt diagramme-F2 mit #2f80d0/#b4549f und der Umbenennung in MAGENTA.

## farbe-C19c · Willkommen-Banner: info ohne sparkle, Knöpfe neutral, „CSV importieren“

Gruppe farbe · Cluster dashboard · Aufwand S · Befunde: zustaende-7, bereich_dashboard-14
Quelle: audit/spec/farbe.md Z. 472–473 · Dateien: web/js/screens/dashboard.js
Abhängig von: farbe-B11

```text
- Z. 130 `U.banner('accent', 'Willkommen', '…', { icon: 'sparkle', trailing: `<button … class="btn sm" data-action="import">${I.upload} CSV</button><button … class="btn sm primary" data-action="install-sample">Beispieldaten laden</button>` })` → `U.banner('info', 'Willkommen', '…', { trailing: `<button type="button" class="btn sm" data-action="import">${I.upload} CSV importieren</button><button type="button" class="btn sm" data-action="install-sample">Beispieldaten laden</button>` })` (ohne `icon`, Standard ist `info`; `data-action` bleiben)

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .btn.primary] (1) Gewicht: .btn.primary bekommt 700 (typografie-3.2.4b). Grundlage sind BRIEF („nur Werte und Hauptknöpfe 700“) und README Z. 209–210 („Hauptknöpfe („Trade loggen“, Speichern) fett“). Heute rendert 600 ohnehin als 700, sichtbar ändert sich also nichts. farbe-B2 und farbe-D3e nennen kein Gewicht mehr. (2) Rolle nach der Komponenten-Regel: .btn.primary steht nur im Dialog-Fuß, im Popover- bzw. Panel-Fuß (eine abschließende Aktion) und beim Absenden des Hauptformulars einer Seite. Auslöser, Leerzustand-, Banner- und Listen-Aktionen sowie Inline-Formulare in Karten und Widgets sind .btn bzw. .btn.sm. Grund: Das bleibt ruhig, egal wie N1 ausgeht; bei Variante B wäre jeder primary der lauteste Punkt der Seite und lauter als „Trade loggen“. Damit sind neutral: widgets.js:374 (Mentor-Frage im Widget) `btn`, coach.js:129/140/148 `btn sm`, notebook.js:67 „Wiederherstellen“ `btn sm`, prop.js:82 (Leerzustand) `btn sm`, prop.js:97 „Als bestanden markieren“ `btn sm`, prop.js:262/266 „Ausgabe/Payout erfassen“ `btn`, „Konto hinzufügen“ im Konten-Bereichskopf misc.js:186 `btn` (nicht sm, Seitenebene). (3) Doppelte Knopfänderungen führen die komponenten-S-Schritte aus. Die farbe-C-Schritte lassen ihre Knopf-Teile weg, ihre Farbteile bleiben. Ausnahme ist der Willkommen-Banner dashboard.js:130: farbe-C19c schreibt den ganzen Aufruf neu und übernimmt damit auch den Knopf. (4) README: farbe-D3e ersetzt Z. 203–208 sofort, aber ohne Aussehen und Gewicht von .btn.primary. komponenten-R1f setzt danach auf und zieht Z. 207–208 bzw. Z. 191 erst nach den Antworten N1/N2 nach, wie dort vorgesehen.
- ÜBERNIMMT komponenten-S-dashboard-c: Der Knopf „Beispieldaten laden“ als `btn sm` ist Teil des neu geschriebenen Banner-Aufrufs in farbe-C19c. Entfällt C19c, hier nur `btn sm primary` → `btn sm`.
- [doppelt: U.banner] Alle sechs Änderungen gelten; doppelt ist nur dashboard.js:130 (das sparkle-Symbol). Endstand: dashboard.js:130 `U.banner('info', 'Willkommen', …, { trailing: … }` mit „CSS importieren“ und zwei neutralen `btn sm`, ohne icon (farbe-C19c). shadow.js:58 ohne `icon: 'sparkle'` (kilook-C15). prop.js:97 `U.banner('ok', 'Ziel erreicht', …)` (farbe-C26b). prop.js:279/280 ohne den letzten info-Zweig und ohne warn (aufbau-C12e). Dazu eine Lücke: Der Erfolgs-Zweig `U.banner('accent', plan.funded ? 'Bereit für den Payout' : 'Challenge bestanden', …)` in Z. 279 wird `U.banner('ok', …)`. Grund: Die Farbe-Spezifikation benennt `.banner.accent` in `.banner.ok` um; ohne diese Änderung stünde das Banner ohne Stil da. coach.js:27 errorBox wie zustaende-S-CS1. Abnahme: `grep -rnE "banner\('accent'|icon: 'sparkle'" web/js` findet nichts mehr (I.sparkle wird gelöscht).
- ÄNDERN: Unverändert umsetzen; übernimmt auch das Streichen von icon: 'sparkle' aus kilook-C12 (Z. 130).

## farbe-D3c · README Z. 188–189: Kalender-Tönung 18/16 % dunkel, 10 % hell, Kleintext --text-2

Gruppe farbe · Cluster dashboard · Aufwand S · Befunde: farbe_kontrast-12, diagramme-45, bereich_dashboard-3
Quelle: audit/spec/farbe.md Z. 568–568 · Dateien: web/README.md
Abhängig von: farbe-B14

```text
- Z. 188–189 → „Rote Flächen (Verlusttage im Kalender und in der Jahresübersicht, Fläche unter der Kurve im Minus) sind im dunklen Design etwas kräftiger getönt als grüne (18 % zu 16 %), damit sie auf dem dunklen Grund gleich stark wirken; im hellen Design sind beide gleich (10 %, Rand 35 %). Kleintext auf getönten Kacheln steht in `--text-2`.“ — farbe_kontrast-12, diagramme-45, bereich_dashboard-3
```

## typografie-3.2.3k · @container (max-width: 272px): .stc-col > b 13.5 → 13 (nur verkleinern, K11)

Gruppe typografie · Cluster dashboard · Aufwand S · Befunde: typografie-3
Quelle: audit/spec/typografie.md Z. 257–257 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
- `@container (max-width: 272px)` Z. 2971 `.stc-col > b` 13.5 → 13 (K11)
```

## typografie-3.5a · Drawdown-Widgets: Prozent aus dem Wert in die Fußzeile (Maximal und Durchschnitt)

Gruppe typografie · Cluster dashboard · Aufwand S · Befunde: diagramme-42
Quelle: audit/spec/typografie.md Z. 392–397 · Dateien: web/js/widgets.js
Abhängig von: —

```text
### 3.5 `web/js/widgets.js`

| Stelle | vorher → nachher | Befund |
|---|---|---|
| Z. 186 (Maximaler Drawdown) | Wert `` `<span class="neg">${fmt.cur(dd.max)}</span><small class="neg sub">${pctText(dd.maxPct)}</small>` `` → `` `<span class="neg">${fmt.cur(dd.max)}</span>` ``; foot `dd.maxAt ? fmt.dateFull(dd.maxAt) : 'Kein Drawdown'` → `` dd.maxAt ? `<span class="neg">${pctText(dd.maxPct)}</span> · ${fmt.dateFull(dd.maxAt)}` : 'Kein Drawdown' `` | diagramme-42 |
| Z. 188 (Ø Drawdown) | Wert → `` `<span class="neg">${fmt.cur(dd.avg)}</span>` ``; foot → `` `<span class="neg">${pctText(dd.avgPct)}</span> · Aktuell: <span class="${U.cls(dd.current)}">${fmt.cur(dd.current)}</span>` `` (Datum entfällt, damit der Fuß einzeilig bleibt) | diagramme-42 |
```

## typografie-3.2.5c · Regel .tile .val small.sub löschen (nach Umbau des Drawdown-Widgets)

Gruppe typografie · Cluster dashboard · Aufwand S · Befunde: diagramme-42
Quelle: audit/spec/typografie.md Z. 361–361 · Dateien: web/css/app.css
Abhängig von: typografie-3.5a

```text
| `.tile .val small.sub` (1501) | Regel löschen (nur im Drawdown-Widget benutzt, das in 3.5 umgebaut wird) | diagramme-42 |
```

## typografie-3.5b · Letzte Trades: Datumszelle mit fmt.dateRow und Klasse num

Gruppe typografie · Cluster dashboard · Aufwand S · Befunde: referenz-28, typografie-12
Quelle: audit/spec/typografie.md Z. 398–398 · Dateien: web/js/widgets.js
Abhängig von: typografie-3.4c, typografie-3.2.2f

```text
| Z. 256 (Letzte Trades) | `<td>${fmt.dateFull(tab === 'open' ? t.open : t.close)}</td>` → `<td class="num">${fmt.dateRow(tab === 'open' ? t.open : t.close)}</td>` | referenz-28, typografie-12 |
```

## typografie-3.6 · Widget-Vorschaubilder der Drawdown-Widgets: Prozent im Fuß, x-Positionen prüfen

Gruppe typografie · Cluster dashboard · Aufwand S · Befunde: diagramme-42
Quelle: audit/spec/typografie.md Z. 403–410 · Dateien: web/js/widgetpreviews.js
Abhängig von: typografie-3.5a

```text
### 3.6 `web/js/widgetpreviews.js`

| Stelle | vorher → nachher | Befund |
|---|---|---|
| Z. 67 `max_drawdown` | `… + num(96, 47, '−15,5 %', 5, L, { w: 600 }) + cap(8, 65, '28.08.2026')` → `… + num(8, 65, '−15,5 %', 5, L, { w: 600 }) + cap(31, 65, '· 28.08.2026')` | diagramme-42 |
| Z. 68 `avg_drawdown` | `… + num(96, 47, '−3,0 %', 5, L, { w: 600 }) + tx(8, 65, 'Aktuell (01.10.2026):', 4.6, T2) + num(62, 65, '−758,76 €', 4.6, L, { w: 600 })` → `… + num(8, 65, '−3,0 %', 4.6, L, { w: 600 }) + tx(26, 65, '· Aktuell:', 4.6, T2) + num(49, 65, '−758,76 €', 4.6, L, { w: 600 })` | diagramme-42 |
| Kontrolle | x-Positionen in `panel_widget_hinzufuegen` prüfen: kein Überlappen, Abstand ≈ 2 Einheiten | – |

```

## abstaende-C2 · Dashboard-Raster: .dash-top/.dash-main gap var(--grid-gap), Rasterhöhen mit --grid-gap, flache Bereichskarten wachsen mit (.w.flat), Leerzustand oben, .btn.fw-reset margin-top

Gruppe abstaende · Cluster dashboard · Aufwand M · Befunde: abstaende_layout-32, bereich_dashboard-24
Quelle: audit/spec/abstaende.md Z. 351–351 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
| C2 | Dashboard Z. 1426–1433 | `.dash-top` und `.dash-main` `gap: 18px` → `gap: var(--grid-gap)`. Z. 1429 `calc(var(--card-h) * 2 + 18px)` → `calc(var(--card-h) * 2 + var(--grid-gap))`. Z. 1433 `+ 18px + 96px` → `+ var(--grid-gap) + 96px`. Z. 1594 ebenso. Z. 1430 → `.dash-main > .w.flat { height: auto; align-self: stretch; }`. Neu nach Z. 1449: `.dash-main > .w.flat .fw-empty { justify-content: flex-start; }`. Z. 1492 `.btn.fw-reset { margin-top: auto; …` → `margin-top: var(--sp-3);` | abstaende_layout-32, bereich_dashboard-24 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .dash-top] Das Kachelraster folgt dem Anker .grid.tiles.kstrip (Block in responsiv-B6a): vier Kacheln ab 721 px in einer Reihe, darunter 2 × 2; fünf Kacheln 561–1240 px als 3 + 2, ab 1241 px in einer Reihe; Handy zwei Spalten. abstaende-C6 behält zwei Teile: die Karussell-Zeilen Z. 1775–1776 löschen und den Block 721–960 px für .dash-main. Seine Kachelblöcke entfallen, sie stehen im Block von B6a. abstaende-C2 (gap var(--grid-gap)) und barrierefreiheit-E-dashtest-15 (Testselektor button.info) sind unabhängig davon.
- [doppelt: .dash-main] Zwei Spalten bei 961–1240 px kommen aus responsiv-B6a. Dessen Selektoren `.dash-main > .w.sz-gross`, `.dash-main > .skel.sz-gross` und `.dash-main > .add-slot.gap.sz-gross` stehen nach Z. 1593 und schlagen Z. 1442/1443/1565/1593. abstaende-C5 enthält dieselbe Regel und gibt sie ab; es behält nur die Container-Regel der Score-Skala. abstaende-C6 (721–960 px, mittel und groß volle Breite, !important wegen Z. 1778) gilt für einen anderen Bereich und bleibt. Ergebnis: ab 1241 px drei Spalten, 721–1240 px zwei (mittel und groß volle Breite), bis 720 px eine. abstaende-C2 (gap und Höhen mit --grid-gap) und dashtest.js:15 sind unabhängig.

## abstaende-C3 · Schatten-Ich-Widget: .fw-stats zwei Spalten, ab 520 px Container (.card.fw-shadow) vier; Ellipse in .fw-stats b weg; Handy-Regel löschen

Gruppe abstaende · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-2
Quelle: audit/spec/abstaende.md Z. 352–352 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
| C3 | Schatten-Ich-Widget Z. 1453, 1456, 3039 | Z. 1453 `.fw-stats { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-bottom: 12px; }` → `.fw-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--sp-3); margin-bottom: var(--sp-3); }`. Neu dahinter: `.card.fw-shadow { container-type: inline-size; } @container (min-width: 520px) { .fw-stats { grid-template-columns: repeat(4, minmax(0, 1fr)); } }`. Z. 1456 `.fw-stats b`: `overflow: hidden; text-overflow: ellipsis;` streichen (`white-space: nowrap` bleibt). Z. 3039 (Handy-Regel) löschen. | bereich_dashboard-2 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .fw-stats] Endstand wie in abstaende-C3: `.fw-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--sp-3); margin-bottom: var(--sp-3); }`, `.card.fw-shadow { container-type: inline-size; } @container (min-width: 520px) { .fw-stats { grid-template-columns: repeat(4, minmax(0, 1fr)); } }`; die Handy-Regel Z. 3039 wird gelöscht. aufbau-A3c will bedingt `gap 10 → 8`; das entfällt. Grund: Mit zwei Spalten unter 520 px Kartenbreite haben die Beschriftungen doppelte Breite, das Abschneiden von „Disziplin-Kosten“ (Anlass der Bedingung) tritt nicht mehr auf. 8 px würde vom 12-px-Raster der Abstände-Spezifikation abweichen. mobiletest.js:24 (Handy 2 Spalten) bleibt grün. Schriftgrößen und -gewichte der Beschriftungen entscheiden die Anker .fw-stats > div > span und .fw-lbl.
