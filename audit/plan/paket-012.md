# Paket 012 · dashboard

Schritte: 35 · Dateien: web/README.md, web/css/app.css, web/e2e/dashtest.js, web/e2e/headtest.js, web/js/screens/dashboard.js, web/js/widgetpreviews.js, web/js/widgets.js
Betroffene Tests laut Spezifikation: Akzeptanz 4.2 Nr. 3: grep style="font-size in widgets.js ohne Treffer; Akzeptanz 4.3 dashboard (Wert einzeilig, Fuß „−4,2 % · 01.10.2026“); Akzeptanz 4.3 panel_widget_hinzufuegen (keine Überlappung); Akzeptanz 4.4: grep "<td>\${fmt.(date|time)" ohne Treffer; Akzeptanz 4.4: grep class="caption" nur Abschnittsköpfe; Akzeptanz 4.4: grep small.sub ohne Treffer; e2e/dashtest.js; e2e/dashtest.js:106 (.tpl-row .star, .tpl-row.on .chk svg); e2e/dashtest.js:123; e2e/mobiletest.js:21, :85 (.cal .d .p/.pm); web/e2e/dashtest.js:34/39 (.btn.added, :not(.added), prüfen); web/e2e/dashtest.js:38, 49, 111; web/e2e/dashtest.js:38, 49, 111 (siehe farbe-D2a); web/e2e/dashtest.js:72 (Tracker-Raster, prüfen); web/e2e/dashtest.js:82/89 ([data-i="new"] bleibt); web/e2e/headtest.js; web/e2e/headtest.js (neuer Fall, Schritt R4); web/e2e/leaktest.js (muss grün bleiben); web/e2e/mobiletest.js:21/85 (Kalender, prüfen); web/e2e/mobiletest.js:23-24 (Handy zwei Spalten, muss grün bleiben); web/e2e/scorestatetest.js; web/tests/inline-style.test.mjs (Zählung, Schritt R5)
Baut auf Paketen auf: 1, 2, 3, 5

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

## farbe-B23b · Regel-Tracker gedämpft grün (18/32/50/70 %), Heute-Ring --text-2, eigene Legende .heat-legend.right

Gruppe farbe · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-38, farbe_kontrast-24
Quelle: audit/spec/farbe.md Z. 336–338 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 1668–1671 `.tracker i.l1 … l4` (25/45/70/100 %) → `color-mix(in srgb, var(--accent) 18%, var(--surface-2))`, `32%`, `50%`, `70%` (`border: 0` bleibt)
- Z. 1672 `.tracker i.today { box-shadow: 0 0 0 2px var(--accent); }` → `var(--text-2)`
- nach Z. 1675 neu: `.heat-legend.right i.l1 { background: color-mix(in srgb, var(--accent) 18%, var(--surface-2)); } .heat-legend.right i.l2 { background: color-mix(in srgb, var(--accent) 32%, var(--surface-2)); } .heat-legend.right i.l3 { background: color-mix(in srgb, var(--accent) 50%, var(--surface-2)); } .heat-legend.right i.l4 { background: color-mix(in srgb, var(--accent) 70%, var(--surface-2)); }`
```

## farbe-B23c · Jahres-Monatsraster: Heute-Ring --text-2

Gruppe farbe · Cluster dashboard · Aufwand S · Befunde: referenz-8
Quelle: audit/spec/farbe.md Z. 339–340 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 1771 `.ym-grid i.today { box-shadow: 0 0 0 2px var(--accent); }` → `var(--text-2)`

```

## farbe-C3a · Widget-Bibliothek: Knopfgewicht entfernen, „Hinzugefügt“ grau ohne Fläche

Gruppe farbe · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-5
Quelle: audit/spec/farbe.md Z. 384–386 · Dateien: web/css/app.css
Abhängig von: —

```text
**C3 – `web/css/app.css` Dashboard (Widget-Bibliothek, Letzte Trades, Report)** — bereich_dashboard-5, bereich_dashboard-1, referenz-9
- Z. 1613 `.sp-item .btn { flex: 0 0 auto; font-weight: 600; }` → `.sp-item .btn { flex: 0 0 auto; }` (Kommentar zur Breite streichen)
- Z. 1618 `.sp-item .btn.added { color: var(--accent); border-color: var(--accent-soft); background: var(--accent-soft); opacity: 1; }` → `{ color: var(--muted); border-color: transparent; background: transparent; opacity: 1; }`
```

## farbe-C3b · „Mehr anzeigen“-Link neutral (--text-2, 500, Hover --text)

Gruppe farbe · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-1
Quelle: audit/spec/farbe.md Z. 387–388 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 1659 `.more-link { color: var(--accent); font-weight: 600; font-size: 13px; text-decoration: none; }` → `.more-link { color: var(--text-2); font-weight: 500; font-size: 13px; text-decoration: none; }`
- Z. 1660 `.more-link:hover { text-decoration: underline; }` → `.more-link:hover { color: var(--text); text-decoration: underline; text-underline-offset: 3px; }`
```

## farbe-C3c · Report-Panel: gewählte Zeile flach, Zurücksetzen --text-2, Schriftgröße über .rep-add

Gruppe farbe · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-1
Quelle: audit/spec/farbe.md Z. 389–392 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 1707 `.rep-sel.on { border-color: var(--accent); }` → `.rep-sel.on { border-color: var(--border-2); background: var(--surface-3); }`
- Z. 1710 `.rep-foot .rep-reset { color: var(--accent); … }` → `color: var(--text-2);`
- Z. 1711 `.rep-foot .btn.primary { font-size: 12.5px; }` → `.rep-foot .rep-add { font-size: 12.5px; }`

```

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

## farbe-C15 · Widget-Vorschauen: Report-Farben angleichen, Disziplin-Kosten mit Minus

Gruppe farbe · Cluster dashboard · Aufwand S · Befunde: diagramme-44, bereich_training-3
Quelle: audit/spec/farbe.md Z. 448–451 · Dateien: web/js/widgetpreviews.js
Abhängig von: —

```text
**C15 – `web/js/widgetpreviews.js`** — diagramme-44, bereich_training-3
- Z. 7 `BLUE = '#3d6bff'` → `'#4a6fe3'`, `ORANGE = '#f5a53a'` → `'#b4549f'`
- Z. 45 `big(8, 47, '2.170,41 €', L, 14)` → `big(8, 47, '−2.170,41 €', L, 14)`

```

## farbe-C19a · Widget-Bibliothek: sp-add ohne primary

Gruppe farbe · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-5
Quelle: audit/spec/farbe.md Z. 469–470 · Dateien: web/js/screens/dashboard.js
Abhängig von: farbe-C3a

```text
**C19 – `web/js/screens/dashboard.js`** — bereich_dashboard-5, referenz-7, zustaende-7, bereich_dashboard-14
- Z. 63 `class="btn sm sp-add ${added ? 'added' : 'primary'}"` → `class="btn sm sp-add${added ? ' added' : ''}"`
```

## farbe-C19c · Willkommen-Banner: info ohne sparkle, Knöpfe neutral, „CSV importieren“

Gruppe farbe · Cluster dashboard · Aufwand S · Befunde: zustaende-7, bereich_dashboard-14
Quelle: audit/spec/farbe.md Z. 472–473 · Dateien: web/js/screens/dashboard.js
Abhängig von: farbe-B11

```text
- Z. 130 `U.banner('accent', 'Willkommen', '…', { icon: 'sparkle', trailing: `<button … class="btn sm" data-action="import">${I.upload} CSV</button><button … class="btn sm primary" data-action="install-sample">Beispieldaten laden</button>` })` → `U.banner('info', 'Willkommen', '…', { trailing: `<button type="button" class="btn sm" data-action="import">${I.upload} CSV importieren</button><button type="button" class="btn sm" data-action="install-sample">Beispieldaten laden</button>` })` (ohne `icon`, Standard ist `info`; `data-action` bleiben)

```

## farbe-D2a · dashtest: Selektor .sp-item .btn.primary auf .sp-add:not(.added)

Gruppe farbe · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-5
Quelle: audit/spec/farbe.md Z. 561–562 · Dateien: web/e2e/dashtest.js
Abhängig von: farbe-C19a

```text
**D2 – Tests**
- `web/e2e/dashtest.js` Z. 38, 49, 111: `'.side-panel .sp-item .btn.primary'` → `'.side-panel .sp-item .sp-add:not(.added)'` — bereich_dashboard-5
```

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

## typografie-3.5c · Challenge-Widget: Inline-Größe 30px ersetzen durch Klasse score-big (K27)

Gruppe typografie · Cluster dashboard · Aufwand S · Befunde: typografie-3
Quelle: audit/spec/typografie.md Z. 399–399 · Dateien: web/js/widgets.js
Abhängig von: typografie-3.2.3-fv32

```text
| Z. 273 (Challenge) | `<div class="big-stat" style="font-size:30px;margin:0">` → `<div class="score-big" style="margin:0">` | typografie-3 (K27) |
```

## typografie-3.5d · Regel-Tracker: „Heutiger Score“ als .val-label; „Dein Score“ (Z. 227) bleibt bis zur Nutzerantwort

Gruppe typografie · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-44, typografie-17, referenz-43
Quelle: audit/spec/typografie.md Z. 400–402 · Dateien: web/js/widgets.js
Abhängig von: typografie-3.2.2c

```text
| Z. 287 (Regel-Tracker) | `<div class="caption" style="text-transform:none;letter-spacing:0;font-size:13px;font-weight:600;color:var(--text-2)">Heutiger Score ${U.info(…)}</div>` → `<div class="val-label">Heutiger Score ${U.info(…)}</div>` | bereich_dashboard-44, typografie-17, referenz-43 |
| Z. 227 („Dein Score“) | **nicht ändern**, bis der Nutzer entschieden hat (6.1) | referenz-43 |

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

## abstaende-C3 · Schatten-Ich-Widget: .fw-stats zwei Spalten, ab 520 px Container (.card.fw-shadow) vier; Ellipse in .fw-stats b weg; Handy-Regel löschen

Gruppe abstaende · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-2
Quelle: audit/spec/abstaende.md Z. 352–352 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
| C3 | Schatten-Ich-Widget Z. 1453, 1456, 3039 | Z. 1453 `.fw-stats { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-bottom: 12px; }` → `.fw-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--sp-3); margin-bottom: var(--sp-3); }`. Neu dahinter: `.card.fw-shadow { container-type: inline-size; } @container (min-width: 520px) { .fw-stats { grid-template-columns: repeat(4, minmax(0, 1fr)); } }`. Z. 1456 `.fw-stats b`: `overflow: hidden; text-overflow: ellipsis;` streichen (`white-space: nowrap` bleibt). Z. 3039 (Handy-Regel) löschen. | bereich_dashboard-2 |
```

## abstaende-C4 · Bearbeitungsmodus: gestrichelte Karte statt Außenlinie (.w.editing), .w-bar .w-name löschen

Gruppe abstaende · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-8
Quelle: audit/spec/abstaende.md Z. 353–353 · Dateien: web/css/app.css
Abhängig von: —

```text
| C4 | Bearbeitungsmodus Z. 1569, 1579 | Z. 1569 `.w.editing { outline: 1.5px dashed var(--border-2); outline-offset: 5px; border-radius: var(--radius); }` → `.w.editing { border-radius: var(--radius); } .w.editing .w-body > :is(.card, .tile) { border-style: dashed; border-color: var(--border-2); }`. Z. 1579 `.w-bar .w-name { … }` löschen. | bereich_dashboard-8 |
```

## abstaende-C5 · Dashboard 961–1240 px: zwei Widget-Spalten (groß span 2); Score-Skala im Container ≤ 150 px nur erste/letzte Beschriftung

Gruppe abstaende · Cluster dashboard · Aufwand S · Befunde: responsiv-10
Quelle: audit/spec/abstaende.md Z. 354–354 · Dateien: web/css/app.css
Abhängig von: —

```text
| C5 | Dashboard 961–1240, neu nach Z. 1595 | `@media (min-width: 961px) and (max-width: 1240px) { .dash-main { grid-template-columns: repeat(2, minmax(0, 1fr)); } .w.sz-gross, .skel.sz-gross, .dash-main > .add-slot.gap.sz-gross { grid-column: span 2; } }`. Muss nach Z. 1593 stehen (gleiche Spezifität). Dazu nach Z. 576: `@container (max-width: 150px) { .score-scale .lbls span:not(:first-child):not(:last-child) { display: none; } }` | responsiv-10 |
```

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

## abstaende-F2 · Bearbeitungsleiste: Widget-Name nur für Screenreader (.vh) plus .grow statt .w-name

Gruppe abstaende · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-8
Quelle: audit/spec/abstaende.md Z. 397–397 · Dateien: web/js/screens/dashboard.js
Abhängig von: abstaende-C4

```text
| F2 | `wrap()` Z. 41 | `<span class="w-name">${esc(e.name || inst.typ)}</span>` → `<span class="vh">${esc(e.name || inst.typ)}</span><span class="grow"></span>` | bereich_dashboard-8 |
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

## komponenten-C26b · Heute-Ring in Rastern (Aktivität, Tracker, Jahresübersicht) und Jahreskalender-Kopf

Gruppe komponenten · Cluster dashboard · Aufwand S · Befunde: ki_look-11
Quelle: audit/spec/komponenten.md Z. 417–418 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 1292 `.activity i.today`, Z. 1672 `.tracker i.today`, Z. 1771 `.ym-grid i.today`: `box-shadow: 0 0 0 2px var(--accent)` → `box-shadow: 0 0 0 1.5px var(--text-2)`
- Z. 1685 `.ycal-head span { … }` → `.ycal-head span { text-align: center; padding: 0 2px 6px; font-size: 12px; font-weight: 500; color: var(--muted); border: 0; }`
```
