# Paket 048 · diagramme, tokens, statistik

Schritte: 6 · Dateien: web/README.md, web/css/app.css, web/js/screens/stats.js, web/js/ui.js
Betroffene Tests laut Spezifikation: Akzeptanz grep 2: grep -c '^\.chart text {' web/css/app.css → 1; Akzeptanz grep 2: grep -n 'stroke-dasharray: 3' web/css/app.css → leer; Akzeptanz grep 4
Baut auf Paketen auf: 1, 6, 47

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## farbe-D3d · README nach Z. 201: abgedunkelte Signalfarben hell, forLight/inkFor, Report-Palette

Gruppe farbe · Cluster tokens · Aufwand S · Befunde: farbe_kontrast-1, farbe_kontrast-5, farbe_kontrast-7, farbe_kontrast-8, farbe_kontrast-15, farbe_kontrast-16, diagramme-44
Quelle: audit/spec/farbe.md Z. 569–569 · Dateien: web/README.md
Abhängig von: farbe-A2, farbe-A3c, farbe-C14b

```text
- nach Z. 201 neu: „Im hellen Design sind die Signalfarben abgedunkelt (Gewinn und Akzent `#077a41`, Verlust `#c62e2e`, Break-even `#5f4fcf`, Info `#1d6db5`, Warntext `#8f5f00`), damit Zahlen mindestens 4,5:1 erreichen; eigene Farben werden dafür automatisch abgedunkelt (`Theme.forLight`), die Schrift auf Farbflächen wählt `Theme.inkFor` nach dem höheren Kontrast. Report-Linien haben eine feste Palette (Blau, Magenta, Kupfer) ohne Grün.“ — farbe_kontrast-1, -5, -7, -8, -15, -16, diagramme-44
```

## aufbau-B10 · Balken-Tooltip (vbars) mit Summe bei Ø pro Trade

Gruppe aufbau · Cluster diagramme · Aufwand S · Befunde: bereich_statistik-13
Quelle: audit/spec/aufbau.md Z. 366–369 · Dateien: web/js/ui.js
Abhängig von: —

```text
**B10 Balken-Tooltip mit Summe** (`web/js/ui.js` Z. 327, `drawers.vbars`) · bereich_statistik-13
`data-tip="<b>…</b>: ${fmt.cur(v, { signed: true })}${perTrade ? ' pro Trade' : ''}<br>${g.s.n} Trades · Win-Rate …"` →
`data-tip="<b>…</b>: ${fmt.cur(v, { signed: true })}${perTrade ? ' pro Trade' : ''}<br>${perTrade ? `Summe ${fmt.cur(g.s.total, { signed: true })} · ` : ''}${g.s.n} Trades · Win-Rate …"`

```

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

## diagramme-A1 · Diagrammtext: eine .chart text-Definition, neu .chart text.bv und .chart text.lbl, alte Regel Z. 1647–1648 löschen (inkl. Abschnittskopf 3 und Reihenfolge)

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: typografie-29, diagramme-9, diagramme-25
Quelle: audit/spec/diagramme.md Z. 279–293 · Dateien: web/css/app.css
Abhängig von: —

```text
## 3. Umsetzungsschritte

Reihenfolge: Tokens und Basisstile → Skalen und Bausteine → Zeichner → Widgets und Seiten → Vorschaubilder → Übersetzungen → Tests → README. Für jeden Schritt sind die erledigten Befund-ids angegeben.

### 3.1 `web/css/app.css`

**A1 Diagrammtext, eine Definition** (typografie-29, diagramme-9, diagramme-25)
- Z. 683 `.chart text { fill: var(--muted); font-size: 11px; font-family: var(--font); }` → `.chart text { fill: var(--muted); font-size: 11px; font-variant-numeric: tabular-nums; }` Die Schrift Onest kommt aus der Sammelregel Z. 1800, `.chart text` steht dort schon.
- direkt darunter neu:
  ```css
  .chart text.bv { fill: var(--text-2); } /* Wert an der Säule */
  .chart text.lbl { paint-order: stroke; stroke: var(--surface); stroke-width: 3px; stroke-linejoin: round; } /* Beschriftung an Bezugslinien im Feld */
  ```
- Z. 1647–1648 (`/* Achsen-Text */` und `.chart text { fill: var(--text-2); font-size: 11.5px; }`) löschen.

```

## diagramme-A2 · Gitter und Nulllinie durchgezogen, crispEdges; Strichelung Z. 1323 löschen

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: diagramme-7
Quelle: audit/spec/diagramme.md Z. 294–298 · Dateien: web/css/app.css
Abhängig von: —

```text
**A2 Gitter und Nulllinie durchgezogen** (diagramme-7)
- Z. 684 → `.chart .grid line { stroke: var(--border); shape-rendering: crispEdges; }`
- Z. 685 → `.chart .zero { stroke: var(--border-2); shape-rendering: crispEdges; }`
- Z. 1323 (`.chart .grid line { stroke-dasharray: 3 4; }`) löschen.

```

## diagramme-A4 · Neue Legendenklasse .chart-legend; .legend.top/.legend.rep (Z. 1649–1651) löschen

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: diagramme-14, bereich_training-28
Quelle: audit/spec/diagramme.md Z. 305–315 · Dateien: web/css/app.css
Abhängig von: —

```text
**A4 Legende** (diagramme-14, bereich_training-28)
- nach Z. 692 neu:
  ```css
  /* Diagramm-Legende: oben links über dem Diagramm, nur bei zwei und mehr Reihen (.legend bleibt für Fieldset-Überschriften) */
  .chart-legend { display: flex; flex-wrap: wrap; gap: 6px 16px; margin: 0 0 8px; font-size: 12px; font-weight: 400; color: var(--text-2); }
  .chart-legend span { display: inline-flex; align-items: center; }
  .chart-legend i { display: inline-block; width: 8px; height: 8px; border-radius: 999px; margin-right: 6px; }
  .chart-legend i.dash { width: 14px; height: 0; border-radius: 0; background: none; border-top: 2px dashed var(--text-2); }
  ```
- Z. 1649–1651 (`.legend.top`, `.legend.rep i`, `.legend.rep`) löschen. Z. 691–692 bleiben unverändert.

```
