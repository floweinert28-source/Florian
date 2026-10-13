# Paket 053 · diagramme, training

Schritte: 34 · Dateien: web/README.md, web/css/app.css, web/e2e/dashtest.js, web/e2e/shadowtest.js, web/js/screens/shadow.js, web/js/ui.js, web/js/widgetpreviews.js, web/js/widgets.js
Betroffene Tests laut Spezifikation: Akzeptanz grep 10; Akzeptanz grep 12; Akzeptanz grep 3, 6; Akzeptanz grep 4; Akzeptanz grep 4, Sonde 17; Akzeptanz grep 5; Akzeptanz grep 6; Akzeptanz grep 6, Sonde 17; Akzeptanz grep 7; Sonde 21; neu (Abschnitt 4): .cal .p ohne /,\d\d\s?[€$]/; prüfen: e2e/mobiletest.js:66 (.cal .w .p/.pm); web/e2e/chartanimtest.js:10–11 (Schritt bewegung-3.11d); web/e2e/dashtest.js:69; web/e2e/dashtest.js:69 (O1); web/e2e/dashtest.js:92; web/e2e/dashtest.js:95; web/e2e/shadowtest.js:30; web/e2e/shadowtest.js:30 (O5); web/e2e/shadowtest.js:57
Baut auf Paketen auf: 3, 7, 26, 48, 49, 50, 52

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## diagramme-I2 · Schatten-Ich-Diagramm: Serien wie E8g, .chart-legend mit Strich-Symbol

Gruppe diagramme · Cluster training · Aufwand S · Befunde: bereich_training-28, diagramme-14
Quelle: audit/spec/diagramme.md Z. 653–656 · Dateien: web/js/screens/shadow.js
Abhängig von: diagramme-A4, diagramme-E1

```text
**I2 Diagramm und Legende** (bereich_training-28, diagramme-14)
- Z. 117 `series` wie E8 (Z. 336).
- Z. 118: `<div class="legend top">…</div>` → `<div class="chart-legend"><span><i style="background:var(--text)"></i>Echt</span><span><i class="dash"></i>Schatten-Ich</span></div>`

```

## diagramme-O5 · Tests shadowtest.js:30 (zwei Pfade, einer gestrichelt) und :57 (Ranking inkl. Ohne-Verstöße-Zeile)

Gruppe diagramme · Cluster training · Aufwand S · Befunde: bereich_training-28, bereich_training-30
Quelle: audit/spec/diagramme.md Z. 750–750 · Dateien: web/e2e/shadowtest.js
Abhängig von: diagramme-E1, diagramme-I1, diagramme-I2

```text
- **O5** shadowtest.js:30 (bereich_training-28) → `path` gleich 2 und `path[stroke-dasharray]` gleich 1. shadowtest.js:57 (bereich_training-30) → `const clean = await p.$eval('.shadow-clean', e => e.textContent.replace(/^[^:]*:/, '').split(',').filter(s => s.trim()).length).catch(() => 0); ok('Ranking jetzt drei Regeln', (await p.$$('.shadow-rank .bar-row')).length + clean === 3);`
```

## diagramme-P4 · README Schatten-Ich (Z. 219): Kurven-Darstellung und Ranking

Gruppe diagramme · Cluster training · Aufwand S · Befunde: bereich_training-28, bereich_training-30
Quelle: audit/spec/diagramme.md Z. 770–770 · Dateien: web/README.md
Abhängig von: diagramme-I1, diagramme-I2

```text
- **P4** Z. 219: „Equity echt vs. Schatten“ → „Kurven: echt als volle Linie in Textfarbe, Schatten-Ich gestrichelt grau“. Ranking: „Regeln ohne Verstoß als eine Zeile“.
```

## diagramme-E2 · drawers.scatter: Beschriftung waagerecht über xLabels, mb 30, Break-even --be statt --info

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: bereich_dashboard-35, diagramme-19, bereich_dashboard-36, diagramme-20
Quelle: audit/spec/diagramme.md Z. 557–562 · Dateien: web/js/widgets.js
Abhängig von: diagramme-C4, diagramme-C5

```text
**E2 Punktdiagramm** (bereich_dashboard-35, Ergänzung diagramme-19, bereich_dashboard-36, Ergänzung diagramme-20)
- Z. 74 Kommentar `Beschriftungen unten schräg` → `Beschriftungen unten waagerecht`.
- Z. 78 `mb = 50` → `mb = 30`.
- Z. 83 → `${U.xLabels(xt.map(t => ({ x: x(t.v), label: t.label })), ml, W - mr, H - 8)}`
- Z. 84 `'info'` → `'be'`.

```

## diagramme-E3 · drawers.dbars: Säulen je Tag als Pfad-Balken

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: diagramme-11
Quelle: audit/spec/diagramme.md Z. 563–564 · Dateien: web/js/widgets.js
Abhängig von: diagramme-C5

```text
**E3 Säulen je Tag** (diagramme-11) Z. 93: `<rect …rx="2" class="br…" … fill-opacity=".85" data-tip="…">` → `<path class="br${p.pnl >= 0 ? '' : ' dn'}" d="${U.vbarPath(x(i) - bw / 2, bw, y(0), p.pnl >= 0 ? Math.min(y(p.pnl), y(0) - 1.5) : Math.max(y(p.pnl), y(0) + 1.5))}" fill="…unverändert…" fill-opacity=".85" data-tip="…unverändert…"></path>`.

```

## diagramme-E4 · drawers.dd (Drawdown): weich über U.smooth, flache Verlustfläche .16

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: bereich_dashboard-39, diagramme-16, diagramme-17
Quelle: audit/spec/diagramme.md Z. 565–568 · Dateien: web/js/widgets.js
Abhängig von: —

```text
**E4 Drawdown** (bereich_dashboard-39, diagramme-16, diagramme-17)
- Z. 102 Zweig für `n > 1` → `U.smooth(pts.map((p, i) => [x(i), y(p.dd)]))`.
- Z. 103: `<defs>…</defs>` löschen. Die Fläche `fill="url(#${g})"` → `fill="var(--loss)" fill-opacity=".16"`. `const g = gid()` in Z. 101 streichen.

```

## diagramme-E5 · Fallback-Vorschauen PV.scatter ohne Strichelung, PV.line ohne --be

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: diagramme-7, bereich_dashboard-36
Quelle: audit/spec/diagramme.md Z. 569–572 · Dateien: web/js/widgets.js
Abhängig von: —

```text
**E5 Fallback-Vorschauen** (diagramme-7, bereich_dashboard-36)
- Z. 149 `PV.scatter`: `stroke-dasharray="3 3"` streichen.
- Z. 148 `PV.line`: dritte Linie `stroke="var(--be)"` → `stroke="var(--text-2)"`. `--be` ist nie Serienfarbe (A-8).

```

## diagramme-E6 · Achsenstriche Uhrzeit (runde Schritte) und Haltedauer (HOLD_TICKS mit Rückfall)

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: bereich_dashboard-35
Quelle: audit/spec/diagramme.md Z. 573–583 · Dateien: web/js/widgets.js
Abhängig von: diagramme-E2

```text
**E6 Achsenstriche Uhrzeit/Haltedauer** (bereich_dashboard-35)
- Z. 238 `const k = 9; const ticks = Array.from(…)` →
  ```js
  const st = [15, 30, 60, 120, 180, 240, 360].find(s => Math.floor(x1 / s) - Math.ceil(x0 / s) + 1 <= 6) || 360; const ticks = []; for (let m = Math.ceil(x0 / st) * st; m <= x1; m += st) ticks.push({ v: m, label: hhmm(m) });
  ```
- Z. 246 `const k = 11; const ticks = Array.from(…)` →
  ```js
  let ticks = HOLD_TICKS.map(([m, l]) => ({ v: Math.log10(m * 60 + 1), label: l })).filter(t => t.v >= x0 && t.v <= x1); if (ticks.length < 2) ticks = [x0, (x0 + x1) / 2, x1].map(v => { const min = (10 ** v - 1) / 60; return { v, label: min < 1 ? `${Math.round(min * 60)} s` : fmt.dur(min) }; });
  ```
  Der Tooltip (Z. 244) behält `durLabel`.

```

## diagramme-E7 · Report-Standardfarben Blau/Magenta/Kupfer, alte Standardwerte beim Lesen ersetzen

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: farbe_kontrast-38
Quelle: audit/spec/diagramme.md Z. 584–587 · Dateien: web/js/widgets.js
Abhängig von: —

```text
**E7 Report-Farben** (farbe_kontrast-38)
- Z. 211 → `const REPORT_COLORS = ['#2f80d0', '#b4549f', '#c0702f']; /* Blau, Magenta, Kupfer: weder Gewinn, Verlust, Break-even noch Warnung; dataviz-Validator hell und dunkel bestanden */ const REPORT_OLD = { '#3d6bff': '#2f80d0', '#f5a53a': '#b4549f', '#4fd1a5': '#c0702f' };`
- Z. 216 nach dem bestehenden `.map(…)`, vor `.filter(…)`, einfügen: `.map(x => { const nc = REPORT_OLD[String(x.color).toLowerCase()]; return nc ? Object.assign({}, x, { color: nc }) : x; })`

```

## diagramme-E8b · verlauf_trefferquote: neuer Info-Text, Trefferquote --text-2, .chart-legend über dem Diagramm

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: bereich_dashboard-36, diagramme-6, diagramme-14
Quelle: audit/spec/diagramme.md Z. 590–593 · Dateien: web/js/widgets.js
Abhängig von: diagramme-A4, diagramme-E1

```text
- Z. 230–231 (bereich_dashboard-36, diagramme-6, diagramme-14):
  - `info` → `'Laufende Werte bis zum jeweiligen Handelstag: oben Ø Gewinn und Ø Verlust, unten die Trefferquote.'`
  - Serie winRate `color: 'var(--be)'` → `color: 'var(--text-2)'`
  - Kartenrumpf → `<div class="chart-legend"><span><i style="background:var(--profit)"></i>Ø Gewinn</span><span><i style="background:var(--loss)"></i>Ø Verlust</span><span><i style="background:var(--text-2)"></i>Trefferquote</span></div><div class="chart h280" data-chart="lines" data-id="dash-verlauf"></div>`
```

## diagramme-E8e · Kontostand-Widget: Legende (legend top) löschen

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: diagramme-15, diagramme-14
Quelle: audit/spec/diagramme.md Z. 596–596 · Dateien: web/js/widgets.js
Abhängig von: diagramme-C11

```text
- Z. 262 (diagramme-15, diagramme-14): `<div class="legend top">…</div>` vor dem `.chart` löschen.
```

## diagramme-E8f · Report-Widget: .chart-legend vor dem Diagramm statt legend rep

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: diagramme-14
Quelle: audit/spec/diagramme.md Z. 597–597 · Dateien: web/js/widgets.js
Abhängig von: diagramme-A4

```text
- Z. 299 (diagramme-14): ``${panel}<div class="chart h280" …></div><div class="legend rep">${…}</div>`` → ``${panel}<div class="chart-legend">${series.map(s => `<span><i style="background:${s.color}"></i>${esc(s.label)}</span>`).join('')}</div><div class="chart h280" data-chart="lines" data-id="dash-report"></div>``
```

## diagramme-E8g · Schatten-Ich-Widget: Serien Echt --text, Schatten-Ich --text-2 gestrichelt 5 4

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: bereich_training-28, farbe_kontrast-35
Quelle: audit/spec/diagramme.md Z. 598–599 · Dateien: web/js/widgets.js
Abhängig von: diagramme-E1

```text
- Z. 336 (bereich_training-28, Ergänzung farbe_kontrast-35): `series` → `[{ key: 'real', label: 'Echt', unit: 'cur', color: 'var(--text)' }, { key: 'shadow', label: 'Schatten-Ich', unit: 'cur', color: 'var(--text-2)', dash: '5 4' }]`

```

## diagramme-F1 · Vorschauen: Gitter ohne Strichelung

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: diagramme-7
Quelle: audit/spec/diagramme.md Z. 690–692 · Dateien: web/js/widgetpreviews.js
Abhängig von: —

```text
### 3.13 `web/js/widgetpreviews.js` (Vorschauen = Miniaturen der echten Widgets, README Z. 75)

- **F1** (diagramme-7) Z. 18 `grid`: `line(x1, y, x2, y, G, .5, '2 2')` → `line(x1, y, x2, y, G, .5)`.
```

## diagramme-F2 · Vorschauen: BLUE/ORANGE → #2f80d0/#b4549f, ORANGE in MAGENTA umbenennen

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: farbe_kontrast-38
Quelle: audit/spec/diagramme.md Z. 693–693 · Dateien: web/js/widgetpreviews.js
Abhängig von: diagramme-E7

```text
- **F2** (farbe_kontrast-38) Z. 7 `BLUE = '#3d6bff', ORANGE = '#f5a53a'` → `BLUE = '#2f80d0', ORANGE = '#b4549f'`. Der Name `ORANGE` wird zu `MAGENTA`, alle Verwendungen mitziehen.
```

## diagramme-F3 · Vorschau kum_pnl: Titel „Kumulierter Netto-P&L“, flache Fläche statt Verlauf

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: diagramme-13, diagramme-17
Quelle: audit/spec/diagramme.md Z. 694–696 · Dateien: web/js/widgetpreviews.js
Abhängig von: —

```text
- **F3** (diagramme-13, diagramme-17) Z. 74–75 `kum_pnl`:
  - `ttl('Kumulierter Tages-P&L')` → `ttl('Kumulierter Netto-P&L')`
  - Verlauf `pvkg` → flache Fläche über `area(pts, 70, P, .12)`, die `<defs>` entfallen
```

## diagramme-F4 · Vorschau verlauf_trefferquote: Legende oben links, zwei Spuren, keine rechte Achse

Gruppe diagramme · Cluster diagramme · Aufwand M · Befunde: bereich_dashboard-36, diagramme-6, diagramme-14
Quelle: audit/spec/diagramme.md Z. 697–700 · Dateien: web/js/widgetpreviews.js
Abhängig von: —

```text
- **F4** (bereich_dashboard-36, diagramme-6, diagramme-14) Z. 76–77 `verlauf_trefferquote`:
  - Legende oben links unter dem Titel (y ≈ 22) mit `[[P,'Ø Gewinn'],[L,'Ø Verlust'],[T2,'Trefferquote']]`
  - darunter zwei Spuren: oben y 28–52 (Ø Gewinn P, Ø Verlust L; € links), unten y 58–72 (Trefferquote in T2; % links)
  - keine Beschriftung bei x = 134 (keine rechte Achse); `B` kommt nicht mehr vor
```

## diagramme-F5 · Vorschau taeglich_kumuliert: Fläche streichen

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: diagramme-18
Quelle: audit/spec/diagramme.md Z. 701–701 · Dateien: web/js/widgetpreviews.js
Abhängig von: —

```text
- **F5** (diagramme-18) Z. 85 `taeglich_kumuliert`: `+ area(pts, 58, P, .18)` streichen.
```

## diagramme-F6 · Vorschau kontostand: keine Legende, Startkapital-Linie gestrichelt mit Beschriftung

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: diagramme-15
Quelle: audit/spec/diagramme.md Z. 702–705 · Dateien: web/js/widgetpreviews.js
Abhängig von: —

```text
- **F6** (diagramme-15) Z. 94 `kontostand`:
  - `legend(…)` streichen
  - `line(28, 70, 134, 70, L, .9)` → `line(28, 70, 134, 70, F, .6, '2 1.5')` plus `tx(132, 67, 'Startkapital', 3.4, F, { a: 'end' })`
  - Linie bleibt `P`
```

## diagramme-F7 · Vorschau drawdown_verlauf: Fläche .16

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: diagramme-17
Quelle: audit/spec/diagramme.md Z. 706–706 · Dateien: web/js/widgetpreviews.js
Abhängig von: —

```text
- **F7** (diagramme-17) Z. 96 `drawdown_verlauf`: `area(pts, 22, L, .28)` → `area(pts, 22, L, .16)`.
```

## diagramme-F8 · Vorschau report: zwei Spuren mit linken Achsen, Legende oben links, keine rechte Achse

Gruppe diagramme · Cluster diagramme · Aufwand M · Befunde: diagramme-6, diagramme-14, farbe_kontrast-38
Quelle: audit/spec/diagramme.md Z. 707–710 · Dateien: web/js/widgetpreviews.js
Abhängig von: diagramme-F2

```text
- **F8** (diagramme-6, diagramme-14, farbe_kontrast-38) Z. 106–107 `report`:
  - keine rechte Achse (`yl([...], [...], 134)` streichen)
  - Spur oben „Trefferquote“ (BLUE) mit %-Achse links, Spur unten „Ø Gewinn“ (MAGENTA) mit €-Achse links
  - Legende oben links unter der Kopfzeile
```

## diagramme-F9 · Vorschauen Haltedauer und Uhrzeit: runde Achsenbeschriftungen

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: bereich_dashboard-35
Quelle: audit/spec/diagramme.md Z. 711–712 · Dateien: web/js/widgetpreviews.js
Abhängig von: —

```text
- **F9** (bereich_dashboard-35) Haltedauer-Vorschau: `lab` → `['1 min', '', '5 min', '', '15 min', '', '1 h', '', '4 h']` (leere Einträge ohne Text). Uhrzeit-Vorschau: `xl(['09:30','11:00','12:30','14:00','15:30'], …)` → `xl(['10:00','12:00','14:00','16:00'], [44, 74, 104, 130])`.

```

## diagramme-O1 · Test dashtest.js:69: Uhrzeit-Achse waagerecht mit vollen Zeiten (inkl. Hinweis: geänderte Dateien in den Scratchpad kopieren)

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: bereich_dashboard-35
Quelle: audit/spec/diagramme.md Z. 744–746 · Dateien: web/e2e/dashtest.js
Abhängig von: diagramme-E2, diagramme-E6

```text
### 3.15 Tests (`web/e2e/`; danach die geänderten Dateien in den Scratchpad kopieren, weil `runall.sh` dort läuft)

- **O1** dashtest.js:69 (bereich_dashboard-35) → `ok('Uhrzeit-Achse waagerecht mit vollen Zeiten', await p.$eval('.w[data-typ="perf_uhrzeit"] .chart svg', svg => { const all = [...svg.querySelectorAll('text')]; const t = all.filter(x => /^\d{2}:\d{2}$/.test(x.textContent)); return t.length >= 2 && t.every(x => /:(00|15|30|45)$/.test(x.textContent)) && !all.some(x => (x.getAttribute('transform') || '').includes('rotate(')); }));`
```

## diagramme-O2 · Test dashtest.js:92: Report-Balken über .chart .br

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: diagramme-11
Quelle: audit/spec/diagramme.md Z. 747–747 · Dateien: web/e2e/dashtest.js
Abhängig von: diagramme-E1

```text
- **O2** dashtest.js:92 (diagramme-11): `.chart rect[rx="2"]` → `.chart .br`.
```

## diagramme-O3 · Test dashtest.js:95: „Report: zwei Spuren“, keine Achsenbeschriftung rechts

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: diagramme-6
Quelle: audit/spec/diagramme.md Z. 748–748 · Dateien: web/e2e/dashtest.js
Abhängig von: diagramme-E1

```text
- **O3** dashtest.js:95 (diagramme-6): Name → `'Report: zwei Spuren'`, Prüfung ergänzen um `svg.querySelectorAll('.grid').length >= 2 && ![...svg.querySelectorAll('.grid text')].some(x => +x.getAttribute('x') > svg.viewBox.baseVal.width / 2)`.
```

## diagramme-P3 · README Farben/Achsen (Z. 187–195): Achsen, Gitter, Flächen, Balken, Legenden, Report-Farben

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: typografie-29, diagramme-9, diagramme-8, diagramme-7, diagramme-17, diagramme-11, diagramme-14, farbe_kontrast-38
Quelle: audit/spec/diagramme.md Z. 763–769 · Dateien: web/README.md
Abhängig von: —

```text
- **P3** Z. 187–195 (Farben/Achsen) ergänzen:
  - „Werteachsen links mit vollen Beträgen (`fmt.axisCur`, im Geld-blind-Modus R), Bereich auf runde Striche erweitert, keine gedrehten oder überlappenden Beschriftungen“
  - „Gitter durchgezogen, gestrichelt nur Bezugslinien und die Schatten-Ich-Linie“
  - „Flächen flach zwischen Linie und Nulllinie (Gewinn 12 %, Verlust 16 %)“
  - „Balken an der Nulllinie gerade, am Wertende 3 px rund“
  - „Legenden oben links (`.chart-legend`), nur bei zwei und mehr Reihen“
  - „Report-Standardfarben Blau/Magenta/Kupfer“
```

## diagramme-P5 · README Kurven (Z. 345–348): Kontostand/Drawdown weich, Spuren statt rechter Achse

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: bereich_dashboard-39, diagramme-16, diagramme-6
Quelle: audit/spec/diagramme.md Z. 771–771 · Dateien: web/README.md
Abhängig von: diagramme-E1, diagramme-E4, diagramme-C11

```text
- **P5** Z. 345–348 (Kurven): „auch Kontostand- und Drawdown-Verlauf. Mehrere Einheiten (Trefferquote-Verlauf, Report) stehen als Spuren übereinander, jede mit eigener Achse links, es gibt keine rechte Achse.“
```

## barrierefreiheit-U6a · Diagramme: Textalternative chartLabel und role=img in drawCharts

Gruppe barrierefreiheit · Cluster diagramme · Aufwand M · Befunde: bereich_statistik-33
Quelle: audit/spec/barrierefreiheit.md Z. 488–508 · Dateien: web/js/ui.js
Abhängig von: —

```text
**U6 Diagramme: Textalternative und Trefferflächen**

Vor `drawCharts` (Z. 231) neu:
```js
const tr = (s, v) => root.I18N ? root.I18N.t(s, v) : s.replace(/\{(\d+)\}/g, (_, i) => v[i]);
function chartLabel(k, d) {
  if (!d) return '';
  if (k === 'vbars' || k === 'hbars') { const per = d.metric === 'expectancy'; return (d.groups || []).map(g => { const v = fmt.cur(per ? g.s.expectancy : g.s.total, { signed: true }); return `${g.label || g.key}: ${per ? tr('{0} pro Trade', [v]) : v}`; }).join(', '); }
  if (k === 'pnl' && d.days && d.days.length) { let c = 0, lo = 0; d.days.forEach(x => { c += x.pnl; lo = Math.min(lo, c); }); return tr('Kumulierter Netto-P&L: Endstand {0}, tiefster Stand {1}', [fmt.cur(c, { signed: true }), fmt.cur(lo, { signed: true })]); }
  if (k === 'rolling' && d.edge && d.edge.rolling && d.edge.rolling.length) return tr('Rollierender Edge: Gesamtschnitt {0} aus {1} Trades', [fmt.r(d.edge.mean), d.edge.n]);
  if ((k === 'mc' || k === 'hist') && d.mc) return tr('Monte-Carlo-Simulation: Ruin-Wahrscheinlichkeit {0}, Median-Drawdown {1}', [fmt.pct(d.mc.ruin, 1), fmt.cur(-d.mc.dd.p50)]);
  return '';
}
```

In `drawCharts` (Z. 232) nach `drawers[k] && drawers[k](el, data, W, H);`:
```js
const svg = el.querySelector('svg'); const lab = svg && chartLabel(k, data); if (lab) { svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', lab); }
```
`fmt.cur` beachtet den Geld-blind-Modus.

```

## barrierefreiheit-U6b · Balken-Tooltips über transparente .tip-hit-Flächen über den Balken (vbars, hbars)

Gruppe barrierefreiheit · Cluster diagramme · Aufwand S · Befunde: diagramme-46
Quelle: audit/spec/barrierefreiheit.md Z. 509–515 · Dateien: web/js/ui.js
Abhängig von: —

```text
`vbars` (Z. 327): `data-tip="…"` vom sichtbaren `<rect>` entfernen. Vor `</svg>` eine zweite Schleife mit **demselben** Tooltip-Text:
`` ${groups.map((g, i) => `<rect class="tip-hit" x="${ml + i * gap}" y="${mt}" width="${gap}" height="${H - mt - mb}" fill="transparent" data-tip="…bisheriger Text mit vals[i]…"></rect>`).join('')} ``

`hbars` (Z. 335): ebenso, je Zeile `<rect class="tip-hit" x="0" y="${mt + i * rowH}" width="${W - mr}" height="${rowH}" fill="transparent" data-tip="…">` (schließt die Beschriftung links ein).

Befunde: bereich_statistik-33, diagramme-46

```

## barrierefreiheit-C-widgets-84-93 · Streupunkte-Strich 16 px, dbars-Tooltips über .tip-hit-Flächen

Gruppe barrierefreiheit · Cluster diagramme · Aufwand S · Befunde: diagramme-46
Quelle: audit/spec/barrierefreiheit.md Z. 724–725 · Dateien: web/js/widgets.js
Abhängig von: —

```text
| 84 Streupunkte | `stroke-width="7"` | `stroke-width="16"` (r 2.6 bleibt) | diagramme-46 |
| 93 `dbars` | `data-tip` am Balken | `data-tip` vom Balken entfernen. Vor `${U.dateAxis(…)}` je Tag `<rect class="tip-hit" x="${(x(i) - gap / 2).toFixed(1)}" y="${mt}" width="${gap.toFixed(1)}" height="${ih.toFixed(1)}" fill="transparent" data-tip="…bisheriger Text…"></rect>` | diagramme-46 |
```

## kilook-C9a · Kalender-Monatsraster: Tages- und Wochenbeträge immer compact (ohne Cent)

Gruppe kilook · Cluster diagramme · Aufwand S · Befunde: diagramme-31
Quelle: audit/spec/kilook.md Z. 605–607 · Dateien: web/js/widgets.js
Abhängig von: —

```text
**C9 · web/js/widgets.js** (diagramme-31, diagramme-35, ki_look-36)
- **115** `fmt.cur(e.pnl, { signed: true, compact: Math.abs(e.pnl) >= 1000 })` → `fmt.cur(e.pnl, { signed: true, compact: true })`
- **116** `fmt.cur(wk.pnl, { signed: true, compact: Math.abs(wk.pnl) >= 1000 })` → `fmt.cur(wk.pnl, { signed: true, compact: true })`
```

## wording-S1.4-1.7 · ui.js Diagramm-Tooltips: Zähler über U.count, „Trefferquote“, Ruin-Schwelle kompakt

Gruppe wording · Cluster diagramme · Aufwand S · Befunde: wording-3, zustaende-28, bereich_statistik-26
Quelle: audit/spec/wording.md Z. 299–303 · Dateien: web/js/ui.js
Abhängig von: wording-S1.1-1.3

```text
| 1.4 | Diagramm-Tooltips Z. 327 und Z. 335 | `${g.s.n} Trades · Win-Rate ${fmt.pct(g.s.winRate)}` → `${count(g.s.n, 'Trade', 'Trades')} · Trefferquote ${fmt.pct(g.s.winRate)}` | wording-3, zustaende-28 |
| 1.5 | Monte-Carlo-Ruin-Linie Z. 350 | `Ruin-Schwelle ${curShort(ruinY)}` → `Ruin-Schwelle ${fmt.cur(ruinY, { compact: true })}` (ergibt „17.500 €“) | bereich_statistik-26 |
| 1.6 | Disziplin-Balken Z. 360 | `(${p.n} Trades)` → `(${count(p.n, 'Trade', 'Trades')})` | zustaende-28 |
| 1.7 | Heatmap-Tooltip Z. 407 | `${a.n} Trades · …` → `${count(a.n, 'Trade', 'Trades')} · …` | zustaende-28 |

```

## bewegung-B6 · Diagramm-Einzug (CSS) auf --dur-4/--dur-3/--dur-2 und --ease, Budget 740 ms

Gruppe bewegung · Cluster diagramme · Aufwand M · Befunde: bewegung-1, bewegung-33
Quelle: audit/spec/bewegung.md Z. 203–209 · Dateien: web/css/app.css
Abhängig von: bewegung-A1

```text
**B6 Diagramm-Einzug** (bewegung-1, bewegung-33)
- Z. 106 und Z. 111 `animation: ch-draw 1.25s cubic-bezier(.3, .7, .2, 1) .05s forwards;` → `animation: ch-draw var(--dur-4) var(--ease) forwards;`
- Z. 107 und Z. 112 `animation: ch-fade 1s ease .35s both;` → `animation: ch-fade var(--dur-3) var(--ease) calc(var(--dur-4) - var(--dur-3)) both;`
- Z. 108 `animation: ch-grow .75s cubic-bezier(.2, .7, .2, 1) calc(.1s + var(--bd, 0ms)) both;` → `animation: ch-grow var(--dur-3) var(--ease) var(--bd, 0ms) both;`
- Z. 110 `animation: ch-pop .45s cubic-bezier(.2, .8, .2, 1) var(--dt-delay, 1.1s) both;` → `animation: ch-pop var(--dur-2) var(--ease) var(--dt-delay, var(--dur-1)) both;`
- Kommentar Z. 103–104 ergänzen: „Einzug endet nach höchstens 740 ms (--dur-4 + Verzögerung)“.

```

## bewegung-B8 · Score-Skala und Fortschritts-Ring auf --dur-4 --ease

Gruppe bewegung · Cluster diagramme · Aufwand S · Befunde: bewegung-1, bewegung-33
Quelle: audit/spec/bewegung.md Z. 212–215 · Dateien: web/css/app.css
Abhängig von: bewegung-A1

```text
**B8 Score-Skala und Ring** (bewegung-1, bewegung-33)
- Z. 568 `animation: score-run 1.3s cubic-bezier(.22, .9, .25, 1) .2s backwards;` → `animation: score-run var(--dur-4) var(--ease) calc(var(--stagger) * 2) backwards;`
- Z. 1317 `transition: stroke-dashoffset 1.1s cubic-bezier(.22, .61, .36, 1);` → `transition: stroke-dashoffset var(--dur-4) var(--ease);` Das `filter` in derselben Zeile regelt KI-Look/Diagramme (K23).

```
