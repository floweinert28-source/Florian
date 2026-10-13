# Paket 045 · diagramme, statistik

Schritte: 7 · Dateien: web/css/app.css, web/js/core.js, web/js/screens/stats.js, web/js/ui.js
Betroffene Tests laut Spezifikation: —
Baut auf Paketen auf: —

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## farbe-B13 · Diagramm-Achsen: eine .chart text-Regel in --muted, Doppelregel Z. 1647–1648 löschen

Gruppe farbe · Cluster diagramme · Aufwand S · Befunde: diagramme-37
Quelle: audit/spec/farbe.md Z. 280–283 · Dateien: web/css/app.css
Abhängig von: —

```text
**B13 – Diagramm-Achsen** — diagramme-37
- Z. 683 `.chart text { fill: var(--muted); font-size: 11px; font-family: var(--font); }` → `.chart text { fill: var(--muted); font-size: 11px; font-variant-numeric: tabular-nums; }` (Schrift setzt die Sammelregel Z. 1800)
- Z. 1647–1648 Kommentar `/* Achsen-Text */` und `.chart text { fill: var(--text-2); font-size: 11.5px; }` löschen

```

## farbe-B15 · Ungenutzte Gewinn-Heatmap .heat: l1 neutral, l2–l4 auf --profit

Gruppe farbe · Cluster diagramme · Aufwand S · Befunde: farbe_kontrast-20
Quelle: audit/spec/farbe.md Z. 294–297 · Dateien: web/css/app.css
Abhängig von: —

```text
**B15 – Gewinn-Heatmap (ungenutzt), Z. 737–740** — farbe_kontrast-20
- `.heat i.l1 { background: color-mix(in srgb, var(--accent) 30%, var(--surface-3)); }` → `.heat i.l1 { background: color-mix(in srgb, var(--text) 18%, var(--surface-3)); }` (l1 = nur Check-in/Notiz)
- `.heat i.l2/.l3/.l4`: `var(--accent)` → `var(--profit)` (Prozente bleiben)

```

## farbe-B27b · ui.js: Monte-Carlo-Pfade und Drawdown-Histogramm neutral, Ruin-Bereich --loss .9

Gruppe farbe · Cluster diagramme · Aufwand S · Befunde: bereich_statistik-25
Quelle: audit/spec/farbe.md Z. 351–353 · Dateien: web/js/ui.js
Abhängig von: —

```text
- Z. 350 (Monte-Carlo-Pfade) `stroke="var(--accent)" stroke-opacity=".3"` → `stroke="var(--text-2)" stroke-opacity=".22"`
- Z. 354 (Drawdown-Histogramm) `fill="var(--${b.lo >= mc.ruinPct ? 'loss' : 'accent'})" fill-opacity="${b.lo >= mc.ruinPct ? 1 : .75}"` → `fill="var(--${b.lo >= mc.ruinPct ? 'loss' : 'text-2'})" fill-opacity="${b.lo >= mc.ruinPct ? .9 : .45}"`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: U.drawers.mc] Die Ruin-Beschriftung setzt nur diagramme-C16: `<text class="lbl" x="${ml + 2}" y="${y(ruinY) - 5}" style="fill:var(--loss)">Ruin-Schwelle ${fmt.axisCur(ruinY)}</text>`. fmt.axisCur ist fmt.cur(v, { compact: true }) und ergibt dasselbe „17.500 €“ wie wording 1.5. Im Geld-blind-Modus folgt die Beschriftung außerdem der Achse. Die Pfadfarbe (--text-2, Deckkraft .22) setzt farbe-B27b, C16 setzt sie nicht noch einmal (C16 Z. 504 ist ohnehin nur bedingt formuliert).

## aufbau-B10 · Balken-Tooltip (vbars) mit Summe bei Ø pro Trade

Gruppe aufbau · Cluster diagramme · Aufwand S · Befunde: bereich_statistik-13
Quelle: audit/spec/aufbau.md Z. 366–369 · Dateien: web/js/ui.js
Abhängig von: —

```text
**B10 Balken-Tooltip mit Summe** (`web/js/ui.js` Z. 327, `drawers.vbars`) · bereich_statistik-13
`data-tip="<b>…</b>: ${fmt.cur(v, { signed: true })}${perTrade ? ' pro Trade' : ''}<br>${g.s.n} Trades · Win-Rate …"` →
`data-tip="<b>…</b>: ${fmt.cur(v, { signed: true })}${perTrade ? ' pro Trade' : ''}<br>${perTrade ? `Summe ${fmt.cur(g.s.total, { signed: true })} · ` : ''}${g.s.n} Trades · Win-Rate …"`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: data-tip] Konflikt nur bei hbars: diagramme-C14 setzt data-tip an den sichtbaren Balken, an gekürzte Beschriftungen und an ein eigenes Leer-Rechteck. barrierefreiheit-U6b verlangt dagegen eine transparente Trefferfläche über der ganzen Zeile, Beschriftung eingeschlossen. Es gilt U6b, auch im Umbau C14. Dieselbe Bauart haben die dbars in widgets.js (C-widgets-84-93), und so hat jede Zeile genau ein Tooltip-Ziel. Für vbars und hbars gibt es einen gemeinsamen Baustein in ui.js, damit beide gleich lauten. B10 (Summe bei Ø pro Trade) gilt damit auch für „Erwartungswert je Setup“ (hbars mit metric expectancy): const groupTip = (g, v, perTrade) => { const b = `<b>${esc(String(g.label || g.key))}</b>: `; return !g.s.n ? b + 'Keine Trades' : `${b}${fmt.cur(v, { signed: true })}${perTrade ? ' pro Trade' : ''}<br>${perTrade ? `Summe ${fmt.cur(g.s.total, { signed: true })} · ` : ''}${g.s.n} Trades · Win-Rate ${fmt.pct(g.s.winRate)}`; }; Zähler und Begriff ändert danach wording-S1.4-1.7 an dieser einen Stelle. Endstand hbars: Die Beschriftung hat kein eigenes data-tip, denn der volle Name steht fett im Zeilen-Tooltip, und die Fläche darüber würde sie ohnehin verdecken. Eine leere Zeile zeigt nur die Beschriftung in --faint. Der Balken <path class="br"> trägt kein data-tip. Vor </svg> folgt je Zeile <rect class="tip-hit" x="0" y="${mt + i * rowH}" width="${W - mr}" height="${rowH}" fill="transparent" data-tip="${groupTip(g, vals[i], perTrade)}"></rect>. Verträglich ohne Änderung sind U1 (Info-Knopf), responsiv-3.2c (Chip mit tip), komponenten-A1 (Seitenleiste, siehe Anker App.renderSidebar) und C-widgets-84-93; zum Trendpfeil siehe Anker .trend. Die neue „Summe …“-Zeile kommt als Muster in alle fünf Sprachdateien.
- [reihenfolge: drawers.vbars] Verträglich, aber in fester Reihenfolge. B10 ergänzt den Tooltip um die Summe. U6b übernimmt diesen Text danach in groupTip (siehe Anker data-tip) und verschiebt ihn vom sichtbaren Balken auf eine transparente Trefferfläche je Fach: x = ml + i * gap mit dem jeweils gültigen ml, y = mt, Breite gap, Höhe H − mt − mb. zustaende-S-U4b betrifft nur den Leerzweig (chartEmpty(el); return;) und bleibt unverändert. Für den vbars-Umbau diagramme-C13 aus der anderen Konfliktliste gilt dieselbe Platzierung: kein data-tip am <path class="br">, kein eigenes Leer-Rechteck, Trefferflächen aus der U6b-Schleife (groupTip liefert für leere Fächer „<b>Name</b>: Keine Trades“).

## aufbau-C14d · Reiter Tage: Kennzahl-Leiste mit 6 Kacheln, Karte „Tage im Detail“, Wochentag-Balken weg

Gruppe aufbau · Cluster statistik · Aufwand M · Befunde: bereich_statistik-13
Quelle: audit/spec/aufbau.md Z. 602–606 · Dateien: web/js/screens/stats.js
Abhängig von: aufbau-B10, aufbau-B11

```text
- `tabDays` Z. 30–32: `idw` und `U.chartData['stats-wd']` entfernen. `<div class="grid two">${U.card('P&L nach Wochentag', …)}${U.card('Tage im Überblick', …)}</div>` →
  ```js
  `<div class="grid tiles kstrip">${U.tile('Handelstage', fmt.int(ds.days))}${U.tile('Gewinntage / Verlusttage', `<span class="pos">${ds.winDays}</span> / <span class="neg">${ds.lossDays}</span>`)}${U.tile('Ø Gewinntag', `<span class="pos">${fmt.cur(ds.avgWinDay)}</span>`)}${U.tile('Ø Verlusttag', `<span class="neg">${fmt.cur(ds.avgLossDay)}</span>`)}${U.tile('Tages-Profit-Faktor', fmt.factor(ds.dayPF))}${U.tile('Ø Trades pro Tag', fmt.num(ds.avgTrades, 1))}</div>`
  ```
  Tabelle `<div class="tbl-wrap">…</div>` → `U.card('Tage im Detail', '<div class="tbl-wrap inset">…</div>')`
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: stats.tabDays] aufbau-C14d ersetzt die Karte „Tage im Überblick“ (U.kv) durch eine Kennzahl-Leiste. farbe-C30 Z. 31 würde eine gelöschte Zeile ändern. Die Farbregeln gehen deshalb in die Leiste: Zähler in X/Y nur bei > 0 gefärbt, Ø-Werte über U.cls, also 0 neutral statt grüner oder roter 0,00. Ergebnis: `<div class="grid tiles kstrip">${U.tile('Handelstage', fmt.int(ds.days))}${U.tile('Gewinntage / Verlusttage', `<span class="${ds.winDays ? 'pos' : ''}">${ds.winDays}</span> / <span class="${ds.lossDays ? 'neg' : ''}">${ds.lossDays}</span>`)}${U.tile('Ø Gewinntag', `<span class="${U.cls(ds.avgWinDay)}">${fmt.cur(ds.avgWinDay)}</span>`)}${U.tile('Ø Verlusttag', `<span class="${U.cls(ds.avgLossDay)}">${fmt.cur(ds.avgLossDay)}</span>`)}${U.tile('Tages-Profit-Faktor', fmt.factor(ds.dayPF))}${U.tile('Ø Trades pro Tag', fmt.num(ds.avgTrades, 1))}</div>`. Vorzeichen, Format und Beschriftungen der Kacheln regelt der Anker U.tile (konflikt-9). farbe-C30 Z. 32 (Gewinner- und Verlierer-Spalten neutral, fehlender Drawdown als „—“ in faint) gilt für die Tabelle in der neuen Karte „Tage im Detail“. Raster der 6er-Leiste: Anker .grid.tiles.kstrip.
- ÄNDERN: Leiste mit den Klassen aus der Entscheidung bauen: Zähler nur bei > 0 pos/neg, Ø Gewinntag/Ø Verlusttag mit U.cls(v). Karte „Tage im Detail“ und Wegfall des Wochentag-Diagramms wie spezifiziert.
- [konflikt: .grid.tiles.kstrip] Eine Regelgruppe für alle Kachelreihen. responsiv-B6a setzt sie an die Stelle von Z. 1773, also nach Z. 1593, damit gleich spezifische Regeln gewinnen: `@media (min-width: 721px) { .dash-top:has(> :nth-child(4):last-child), .grid.tiles:has(> :nth-child(4):last-child) { grid-template-columns: repeat(4, minmax(0, 1fr)); } } @media (max-width: 720px) { .dash-top:has(> :nth-child(4):last-child), .grid.tiles:has(> :nth-child(4):last-child) { grid-template-columns: repeat(2, minmax(0, 1fr)); } } @media (min-width: 561px) { .grid.tiles.kstrip:has(> :nth-child(6):last-child) { grid-template-columns: repeat(3, minmax(0, 1fr)); } } @media (min-width: 1241px) { .grid.tiles.kstrip:has(> :nth-child(5):last-child) { grid-template-columns: repeat(5, minmax(0, 1fr)); } } @media (min-width: 561px) and (max-width: 1240px) { .dash-top:has(> :nth-child(5):last-child), .grid.tiles.kstrip:has(> :nth-child(5):last-child) { grid-template-columns: repeat(6, minmax(0, 1fr)); } .dash-top:has(> :nth-child(5):last-child) > *, .grid.tiles.kstrip:has(> :nth-child(5):last-child) > * { grid-column: span 2; } .dash-top:has(> :nth-child(5):last-child) > :nth-child(n + 4), .grid.tiles.kstrip:has(> :nth-child(5):last-child) > :nth-child(n + 4) { grid-column: span 3; } } @media (min-width: 961px) { .tl-fit > .grid.tiles { grid-template-columns: repeat(4, minmax(0, 1fr)); } } @media (min-width: 961px) and (max-width: 1240px) { .dash-main { grid-template-columns: repeat(2, minmax(0, 1fr)); } .dash-main > .w.sz-gross, .dash-main > .skel.sz-gross, .dash-main > .add-slot.gap.sz-gross { grid-column: span 2; } }`. Begründung: abstaende-C6 (vier Kacheln nur 1000–1240 und 800–960) widerspricht responsiv-B6a und aufbau-B11 (vier Kacheln ab 961) bei 961–999 und 800–960. Responsiv K7 belegt, dass 156–186 px breite Kacheln mit den vorhandenen Container-Abfragen funktionieren. Bei 721 px ist eine Kachel so breit wie bei 961 px mit offener Seitenleiste (≈160 px). 720 ist ein vorhandener Grenzwert, es entstehen keine neuen Grenzen bei 800 oder 1000 (Responsiv-Stufen). Fünf Kacheln stehen von 561 bis 1240 px einheitlich als 3 + 2, auf dem Dashboard und in den Leisten; Leisten standen unter 961 px bisher als 2 + 2 + 1. Sechs Kacheln (Statistik → Tage, aufbau-C14d) stehen ab 561 px als 3 × 2. Am Handy (≤ 560 px) bleiben zwei Spalten mit voller letzter Kachel bei ungerader Zahl (Z. 2738/2740, abstaende-C7); die Spezifität der neuen Regeln (0,4,0 bis 0,6,0) schlägt Z. 2601, 2738, 2740 und den ≤960-Block. responsiv-B6b (TradeLog ≤960 als 2 × 2) wirkt damit nur noch bis 720 px. Die Prüfungen „#/affiliate 1024 px: 4 Kacheln gleiche Oberkante“ (aufbau) und „768 × 1024 ohne seitliches Scrollen“ (abstaende) bleiben erfüllt.

## farbe-C30 · Statistik: Legendenpunkt --profit, statVal rSigned, Zähler neutral bzw. nur > 0, Tages-DD-Strich faint

Gruppe farbe · Cluster statistik · Aufwand S · Befunde: farbe_kontrast-20, farbe_kontrast-42, bereich_statistik-39, typografie-2
Quelle: audit/spec/farbe.md Z. 533–538 · Dateien: web/js/screens/stats.js
Abhängig von: —

```text
**C30 – `web/js/screens/stats.js`** — farbe_kontrast-20, farbe_kontrast-42, bereich_statistik-39, typografie-2
- Z. 14 Legendenpunkt `<i style="background:var(--accent)">` → `var(--profit)`
- Z. 21 in `statVal` ergänzen: `case 'rSigned': return U.rText(v);`
- Z. 31 `U.kv('Gewinntage / Verlusttage', `<span class="pos">${ds.winDays}</span> / <span class="neg">${ds.lossDays}</span>`)` → `<span class="${ds.winDays ? 'pos' : ''}">${ds.winDays}</span> / <span class="${ds.lossDays ? 'neg' : ''}">${ds.lossDays}</span>`
- Z. 32 `<td class="r pos">${d.wins}</td><td class="r neg">${d.losses}</td>` → `<td class="r">${d.wins}</td><td class="r">${d.losses}</td>`; `<td class="r neg">${d.intradayDD ? fmt.cur(-d.intradayDD) : '—'}</td>` → `${d.intradayDD ? `<td class="r neg">${fmt.cur(-d.intradayDD)}</td>` : '<td class="r faint">—</td>'}`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .pos] Dieselbe Zählerfärbung steht wortgleich in mehreren Gruppen: Gewinner/Verlierer bzw. Gewinntage/Verlusttage nur bei > 0 als pos/neg, Tabellen-Zählspalten neutral. Betroffen sind day.js:14 (diagramme-M1, zustaende-S-DY2, farbe-C20), trades.js:54 (diagramme-M1, farbe-C31b) und stats.js:31/32 (diagramme-G3, farbe-C30). Sie wird einmal umgesetzt: diagramme-M1 für day.js:14 und trades.js:54, diagramme-G3 für stats.js:31/32, genau mit den dort genannten Werten. TradeLog-Regeln-Spalte trades.js:49: Klasse und Symbole nach farbe-C31a (Regel „✓ --muted, × --loss“). barrierefreiheit-C-trades-49 ergänzt nur die Namen: `<span class="rule-ic muted" role="img" aria-label="Alle Regeln eingehalten">${I.check}</span>` bzw. `<span class="rule-ic neg" role="img" aria-label="Gebrochen: ${esc(t.rulesBroken.join(', '))}" data-tip="${esc(t.rulesBroken.join(', '))}">${I.close}</span>`. Der row-link in der ersten Zelle bleibt wie in C-trades-49.
- ÄNDERN: Z. 31 und der wins/losses-Teil von Z. 32 entfallen, das übernimmt diagramme-G3. Der intradayDD-Teil von Z. 32 (neg bzw. „—“ faint) und die übrigen Punkte bleiben.
- [konflikt: U.kv] Die sechs Schritte ändern vier verschiedene Aufrufstellen. Sie überschneiden sich nur in prop.js Z. 104 (Kontokarte) und mittelbar in planText. Verbindlich für Z. 104, innerhalb des `${dead ? '' : …}` aus zustaende-S-P1: `${U.kv(plan.funded ? 'Nächster Payout' : 'Bis zum Bestehen', plan.hasCond && active ? `<a href="#/prop/bilanz" class="prop-plan-link" data-action="prop-plan-open" data-id="${a.id}">${planText(a, ev, plan)}</a>` : planText(a, ev, plan))}`. Die Zeile wird immer gezeigt, denn sie trägt den einzigen Link in den Planer. planText: Der Gewinn-Teil erscheint nur bei `plan.missingProfit > C.EPS && (plan.funded || !ev.target)`; aufbau-C12a und responsiv-3.12a meinen dasselbe. Sind alle Teile leer und fehlt nur noch Gewinn, liefert planText `<span class="muted">nur noch das Ziel</span>`, sonst '—', nie ''. Ein leerer Wert würde Zeile und Link verstecken, und '—' bedeutet laut Zustände Z2 „Wert fehlt“. Wortlaut und Währungsformat des Betrags entscheidet der Anker planText/money (konflikt-9). prop.js Z. 283 (abstaende-M6): eigene Zeile „Heute noch erlaubt“ als Regelgröße in Kontowährung `money(a, cons.allowedToday, { compact: true })` (KI-Look Z5a/Z5c). Damit entfällt der Teil „heute noch … erlaubt“ in kilook-C19c. Die Testanpassung proptest.js:102 prüft die Zeile „Heute noch erlaubt“ und bei verletzter Regel „verletzt“ in „Consistency Rule“, nicht mehr „heute noch“ in der Consistency-Zeile. stats.js tabSummary (aufbau-C14c) und notebook.js statsHTML (diagramme-L1, Zähler nur > 0 gefärbt, passt zu farbe-C30) sind unabhängig. stats.js tabDays: siehe Anker stats.tabDays. Hinweis: responsiv-B7 (.st-cards, dritte Karte bis 1100 px volle Breite) passt zu den drei Karten aus C14c; die dritte Karte ist dann „Drawdown & Risiko“.
- [konflikt: stats.tabDays] aufbau-C14d ersetzt die Karte „Tage im Überblick“ (U.kv) durch eine Kennzahl-Leiste. farbe-C30 Z. 31 würde eine gelöschte Zeile ändern. Die Farbregeln gehen deshalb in die Leiste: Zähler in X/Y nur bei > 0 gefärbt, Ø-Werte über U.cls, also 0 neutral statt grüner oder roter 0,00. Ergebnis: `<div class="grid tiles kstrip">${U.tile('Handelstage', fmt.int(ds.days))}${U.tile('Gewinntage / Verlusttage', `<span class="${ds.winDays ? 'pos' : ''}">${ds.winDays}</span> / <span class="${ds.lossDays ? 'neg' : ''}">${ds.lossDays}</span>`)}${U.tile('Ø Gewinntag', `<span class="${U.cls(ds.avgWinDay)}">${fmt.cur(ds.avgWinDay)}</span>`)}${U.tile('Ø Verlusttag', `<span class="${U.cls(ds.avgLossDay)}">${fmt.cur(ds.avgLossDay)}</span>`)}${U.tile('Tages-Profit-Faktor', fmt.factor(ds.dayPF))}${U.tile('Ø Trades pro Tag', fmt.num(ds.avgTrades, 1))}</div>`. Vorzeichen, Format und Beschriftungen der Kacheln regelt der Anker U.tile (konflikt-9). farbe-C30 Z. 32 (Gewinner- und Verlierer-Spalten neutral, fehlender Drawdown als „—“ in faint) gilt für die Tabelle in der neuen Karte „Tage im Detail“. Raster der 6er-Leiste: Anker .grid.tiles.kstrip.
- ÄNDERN: Z. 31 entfällt, steckt in aufbau-C14d. Z. 14 (Legendenpunkt) entfällt, weil aufbau-C14b die Karte samt Legende löscht. Z. 21 (statVal rSigned) bleibt. Z. 32 bleibt und wird nach aufbau-C14d in der Tabelle der Karte „Tage im Detail“ umgesetzt.

## farbe-C13 · core.js: realisiertes R als Typ rSigned (gefärbt)

Gruppe farbe · Cluster statistik · Aufwand S · Befunde: farbe_kontrast-42
Quelle: audit/spec/farbe.md Z. 438–439 · Dateien: web/js/core.js
Abhängig von: farbe-C30

```text
**C13 – `web/js/core.js` Z. 329:** `{ key: 'realizedR', …, type: 'r', … }` → `type: 'rSigned'` (plannedR bleibt `'r'`) — farbe_kontrast-42

```
