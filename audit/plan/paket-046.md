# Paket 046 · diagramme, prop

Schritte: 5 · Dateien: web/css/app.css, web/js/screens/prop.js
Betroffene Tests laut Spezifikation: Akzeptanz grep 2: grep -c '^\.chart text {' web/css/app.css → 1; Akzeptanz grep 2: grep -n 'stroke-dasharray: 3' web/css/app.css → leer; Akzeptanz grep 4
Baut auf Paketen auf: 1

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: .legend] Alle vier Schritte bleiben, sie ergänzen sich. Ergebnis in app.css: (a) Neue Regel `.chart-legend` aus A4 in Token-Schreibweise: `.chart-legend { display: flex; flex-wrap: wrap; gap: 6px 16px; margin: 0 0 8px; font-size: var(--fs-12); line-height: var(--lh-12); font-weight: 400; color: var(--text-2); }`. Laut Typografie ist Legendentext --fs-12. `span`, `i` und `i.dash` übernimmt A4 unverändert. Die Regeln `.legend.top`, `.legend.rep` und `.legend.rep i` (Z. 1649–1651) werden gelöscht; ob der 13-px-Token-Lauf vorher darüberging, spielt keine Rolle. (b) `.legend` und `.legend i` (Z. 691–692) bleiben für die Fieldset-Überschriften erhalten. 3.2.3g ersetzt dort nur `font-size: 12px` durch `font-size: var(--fs-12); line-height: var(--lh-12)`. Das passt zu „Z. 691–692 bleiben unverändert“ in A4. (c) prop.js `tabBilanz`, Endstand: `const chart = U.card('Ausgaben vs. Payouts', `${bs.series.length ? `<div class="chart-legend"><span><i style="background:var(--loss)"></i>Ausgaben kumuliert</span><span><i style="background:var(--profit)"></i>Payouts kumuliert</span></div>` : ''}<div class="chart h280" data-chart="lines" data-id="prop-balance"></div>`, { info: … })`. Z. 271 setzt S-P2 wie spezifiziert um (Raster nur bei `ex.length || po.length`). J2 ändert Klasse und Position, danach ergänzt S-P2 nur die Bedingung. Die offene Frage diagramme-40/bereich_prop-23 betrifft Zeitachse und Treppe, nicht die Legende, deshalb wird nicht gewartet.
- ÄNDERN: In der neuen Regel `.chart-legend` `font-size: 12px;` → `font-size: var(--fs-12); line-height: var(--lh-12);`. Alles andere bleibt wie in der Spezifikation (Löschen von Z. 1649–1651, Z. 691–692 bleiben).
- [konflikt: .legend.rep] diagramme-A4 löscht .legend.top/.legend.rep (Z. 1649–1651) und legt .chart-legend an. diagramme-E8f stellt das Report-Widget im selben Schritt um. typografie-3.2.3l setzt in Z. 1651 kein Token. Die neue Legende steht gleich in der Text-Skala (Legende 12/16): font-size: var(--fs-12); line-height: var(--lh-12).
- ÄNDERN: .chart-legend { …; font-size: var(--fs-12); line-height: var(--lh-12); … } statt font-size: 12px. Die Löschung von .legend.rep nur zusammen mit E8f ausliefern.

## diagramme-J2 · Prop „Ausgaben vs. Payouts“: .chart-legend vor dem Diagramm

Gruppe diagramme · Cluster prop · Aufwand S · Befunde: diagramme-14
Quelle: audit/spec/diagramme.md Z. 666–667 · Dateien: web/js/screens/prop.js
Abhängig von: diagramme-A4

```text
**J2 Legende** (diagramme-14) Z. 257: die `<div class="legend">…</div>` hinter dem `.chart` → `<div class="chart-legend">…</div>` vor dem `.chart` (Inhalt gleich).

```

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: .legend] Alle vier Schritte bleiben, sie ergänzen sich. Ergebnis in app.css: (a) Neue Regel `.chart-legend` aus A4 in Token-Schreibweise: `.chart-legend { display: flex; flex-wrap: wrap; gap: 6px 16px; margin: 0 0 8px; font-size: var(--fs-12); line-height: var(--lh-12); font-weight: 400; color: var(--text-2); }`. Laut Typografie ist Legendentext --fs-12. `span`, `i` und `i.dash` übernimmt A4 unverändert. Die Regeln `.legend.top`, `.legend.rep` und `.legend.rep i` (Z. 1649–1651) werden gelöscht; ob der 13-px-Token-Lauf vorher darüberging, spielt keine Rolle. (b) `.legend` und `.legend i` (Z. 691–692) bleiben für die Fieldset-Überschriften erhalten. 3.2.3g ersetzt dort nur `font-size: 12px` durch `font-size: var(--fs-12); line-height: var(--lh-12)`. Das passt zu „Z. 691–692 bleiben unverändert“ in A4. (c) prop.js `tabBilanz`, Endstand: `const chart = U.card('Ausgaben vs. Payouts', `${bs.series.length ? `<div class="chart-legend"><span><i style="background:var(--loss)"></i>Ausgaben kumuliert</span><span><i style="background:var(--profit)"></i>Payouts kumuliert</span></div>` : ''}<div class="chart h280" data-chart="lines" data-id="prop-balance"></div>`, { info: … })`. Z. 271 setzt S-P2 wie spezifiziert um (Raster nur bei `ex.length || po.length`). J2 ändert Klasse und Position, danach ergänzt S-P2 nur die Bedingung. Die offene Frage diagramme-40/bereich_prop-23 betrifft Zeitachse und Treppe, nicht die Legende, deshalb wird nicht gewartet.

## zustaende-S-P2 · Prop-Bilanz ohne Buchungen: „—“ statt „erreicht“, kein Diagramm, keine „Pro Firma“, Legende nur mit Daten

Gruppe zustaende · Cluster prop · Aufwand S · Befunde: bereich_prop-14, bereich_prop-15
Quelle: audit/spec/zustaende.md Z. 724–730 · Dateien: web/js/screens/prop.js
Abhängig von: —

```text
**S-P2 Bilanz ohne Buchungen** – bereich_prop-14, bereich_prop-15
- In `tabBilanz` vor `const tiles` (Z. 256) neu: `const none = bs.spent <= C.EPS;`
- Kachel „Bis Break-even“: Wert `bs.toBreakEven > C.EPS ? <neg> : '<span class="pos">erreicht</span>'` → `none ? '—' : bs.toBreakEven > C.EPS ? <neg wie bisher> : '<span class="pos">erreicht</span>'`; Fuß `bs.toBreakEven > C.EPS ? 'fehlende Payouts (netto)' : 'Payouts decken alle Ausgaben'` → `none ? 'noch keine Ausgaben' : (wie bisher)`.
- Kachel „Kosten je Bestehen“: `bs.costPerPassed == null ? '—' : fmt.cur(bs.costPerPassed)` → `bs.costPerPassed == null || none ? '—' : fmt.cur(bs.costPerPassed)`. Fuß unverändert.
- Z. 257 Legende `<div class="legend">…</div>` nur bei `bs.series.length`.
- Z. 271 `${tiles}<div class="grid main-side">${chart}${byFirm}</div>${expenses}…` → `${tiles}${ex.length || po.length ? `<div class="grid main-side">${chart}${byFirm}</div>` : ''}${expenses}${payouts}${planer}`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: .legend] Alle vier Schritte bleiben, sie ergänzen sich. Ergebnis in app.css: (a) Neue Regel `.chart-legend` aus A4 in Token-Schreibweise: `.chart-legend { display: flex; flex-wrap: wrap; gap: 6px 16px; margin: 0 0 8px; font-size: var(--fs-12); line-height: var(--lh-12); font-weight: 400; color: var(--text-2); }`. Laut Typografie ist Legendentext --fs-12. `span`, `i` und `i.dash` übernimmt A4 unverändert. Die Regeln `.legend.top`, `.legend.rep` und `.legend.rep i` (Z. 1649–1651) werden gelöscht; ob der 13-px-Token-Lauf vorher darüberging, spielt keine Rolle. (b) `.legend` und `.legend i` (Z. 691–692) bleiben für die Fieldset-Überschriften erhalten. 3.2.3g ersetzt dort nur `font-size: 12px` durch `font-size: var(--fs-12); line-height: var(--lh-12)`. Das passt zu „Z. 691–692 bleiben unverändert“ in A4. (c) prop.js `tabBilanz`, Endstand: `const chart = U.card('Ausgaben vs. Payouts', `${bs.series.length ? `<div class="chart-legend"><span><i style="background:var(--loss)"></i>Ausgaben kumuliert</span><span><i style="background:var(--profit)"></i>Payouts kumuliert</span></div>` : ''}<div class="chart h280" data-chart="lines" data-id="prop-balance"></div>`, { info: … })`. Z. 271 setzt S-P2 wie spezifiziert um (Raster nur bei `ex.length || po.length`). J2 ändert Klasse und Position, danach ergänzt S-P2 nur die Bedingung. Die offene Frage diagramme-40/bereich_prop-23 betrifft Zeitachse und Treppe, nicht die Legende, deshalb wird nicht gewartet.
- ÄNDERN: Die Bedingung „Legende nur bei bs.series.length“ gilt für die `<div class="chart-legend">…</div>`, die J2 vor `.chart` gesetzt hat. Die alte `<div class="legend">` hinter dem Diagramm nicht wiederherstellen. Endstand siehe Entscheidung (c).
