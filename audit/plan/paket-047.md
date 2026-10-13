# Paket 047 · diagramme, prop

Schritte: 8 · Dateien: web/css/app.css, web/js/screens/prop.js, web/js/ui.js
Betroffene Tests laut Spezifikation: Akzeptanz grep 2: grep -n 'stroke-dasharray: 3' web/css/app.css → leer; Akzeptanz grep 4; Sonde 14; Sonde 15 (Balken innerhalb der Gitterlinien)
Baut auf Paketen auf: 1

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

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
- [konflikt: .legend.rep] diagramme-A4 löscht .legend.top/.legend.rep (Z. 1649–1651) und legt .chart-legend an. diagramme-E8f stellt das Report-Widget im selben Schritt um. typografie-3.2.3l setzt in Z. 1651 kein Token. Die neue Legende steht gleich in der Text-Skala (Legende 12/16): font-size: var(--fs-12); line-height: var(--lh-12).
- VERBINDLICH (Kreuzprüfung): app.css, nach Z. 692 neu: `/* Diagramm-Legende: oben links über dem Diagramm, nur bei zwei und mehr Reihen (.legend bleibt für Fieldset-Überschriften) */ .chart-legend { display: flex; flex-wrap: wrap; gap: 6px 16px; margin: 0 0 8px; font-size: var(--fs-12); line-height: var(--lh-12); font-weight: 400; color: var(--text-2); } .chart-legend span { display: inline-flex; align-items: center; } .chart-legend i { display: inline-block; width: 8px; height: 8px; border-radius: 999px; margin-right: 6px; } .chart-legend i.dash { width: 14px; height: 0; border-radius: 0; background: none; border-top: 2px dashed var(--text-2); }`. Z. 1649–1651 (`.legend.top`, `.legend.rep i`, `.legend.rep`) löschen, aber erst im selben Lieferschritt wie die Umstellung der letzten Verwender. Das sind diagramme-E8f (widgets.js:299, legend rep), diagramme-E8e (widgets.js:262, legend top) und diagramme-I2 (shadow.js:118, legend top). Danach liefert `grep -rn "legend top\|legend rep\|\.legend\.top\|\.legend\.rep" web/js web/css` keine Treffer. Z. 691–692 (`.legend`, `.legend i`) bleiben für die Fieldset-Überschriften; deren `font-size: 12px` macht typografie-3.2.3g zum Token. Umsetzen nach typografie-3.2.1.

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

## diagramme-C1 · niceTicks mit rundem Bereich (floor/ceil auf Schritt)

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: diagramme-8, bereich_konto-55
Quelle: audit/spec/diagramme.md Z. 358–366 · Dateien: web/js/ui.js
Abhängig von: —

```text
### 3.3 `web/js/ui.js` – Skalen und Bausteine

**C1 `niceTicks` mit rundem Bereich** (diagramme-8, bereich_konto-55)
- Z. 189 → in der Funktion nach der Schrittwahl `s`:
  ```js
  const lo = Math.floor(min / s + 1e-9) * s, hi = Math.ceil(max / s - 1e-9) * s, k = Math.round((hi - lo) / s); const t = []; for (let i = 0; i <= k; i++) t.push(+(lo + i * s).toFixed(6)); return t;
  ```
  Das ersetzt die bisherige Schleife `for (let v = Math.ceil(min / s) * s; v <= max + 1e-9; v += s)`. Alle Aufrufer (ui.js:264, 291, 302, 325, 333, 340, 348; widgets.js:59, 77, 89, 99; affiliate.js:43) nehmen schon `Math.min/Math.max` mit den Daten und brauchen keine Änderung.

```

## diagramme-C3 · axisLeft ohne Überlappung (14px), Kommentar durchgezogene Haarlinien

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: diagramme-8, diagramme-7
Quelle: audit/spec/diagramme.md Z. 369–375 · Dateien: web/js/ui.js
Abhängig von: —

```text
**C3 `axisLeft` ohne Überlappung, Kommentar** (diagramme-8, diagramme-7)
- Z. 228 Kommentar `gestrichelte Gitterlinien` → `durchgezogene Haarlinien`.
- Z. 230 →
  ```js
  const axisLeft = (ticks, yf, ml, W, mr, fmtFn) => { let last = Infinity; return `<g class="grid">${ticks.map(t => { const y = yf(t), show = Math.abs(last - y) >= 14; if (show) last = y; return `<line x1="${ml}" x2="${W - mr}" y1="${y}" y2="${y}"/>${show ? `<text x="${ml - 8}" y="${y + 3.5}" text-anchor="end">${fmtFn(t)}</text>` : ''}`; }).join('')}</g>`; };
  ```

```

## diagramme-C4 · Neuer Baustein xLabels für waagerechte Achsen ohne Überlappung

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: bereich_dashboard-35, diagramme-9
Quelle: audit/spec/diagramme.md Z. 376–381 · Dateien: web/js/ui.js
Abhängig von: —

```text
**C4 Waagerechte Beschriftung ohne Überlappung** (bereich_dashboard-35, diagramme-9). Neu nach Z. 230:
```js
/* waagerechte Achse: Beschriftung nur, wenn sie die vorige nicht berührt; am Rand nach innen geschoben, nie gedreht */
const xLabels = (items, x0, x1, y) => { let right = -Infinity; return items.map(({ x, label }) => { const s = String(label), w = s.length * 6.2 + 4, cx = Math.min(x1 - w / 2, Math.max(x0 + w / 2, x)); if (cx - w / 2 < right + 10) return ''; right = cx + w / 2; return `<text x="${cx.toFixed(1)}" y="${y}" text-anchor="middle">${esc(s)}</text>`; }).join(''); };
```

```

## diagramme-C5 · Balken-Pfade vbarPath/hbarPath, Export in root.UI (inkl. xLabels, fitRadars)

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: diagramme-11
Quelle: audit/spec/diagramme.md Z. 382–390 · Dateien: web/js/ui.js
Abhängig von: diagramme-C4

```text
**C5 Balken-Pfade** (diagramme-11). Neu nach C4:
```js
/* Balken: an der Nulllinie gerade, nur das Wertende gerundet (Radius höchstens 3 px, halbe Breite bzw. Länge) */
const vbarPath = (x, w, yz, yv, r = 3) => { const f = n => +n.toFixed(2), h = Math.abs(yv - yz), rr = Math.min(r, w / 2, h); if (rr < 0.5) return `M${f(x)},${f(yz)}V${f(yv)}H${f(x + w)}V${f(yz)}Z`; const up = yv < yz, s = up ? 1 : 0, d = up ? rr : -rr; return `M${f(x)},${f(yz)}V${f(yv + d)}A${f(rr)},${f(rr)} 0 0 ${s} ${f(x + rr)},${f(yv)}H${f(x + w - rr)}A${f(rr)},${f(rr)} 0 0 ${s} ${f(x + w)},${f(yv + d)}V${f(yz)}Z`; };
const hbarPath = (y, h, xz, xv, r = 3) => { const f = n => +n.toFixed(2), w = Math.abs(xv - xz), rr = Math.min(r, h / 2, w); if (rr < 0.5) return `M${f(xz)},${f(y)}H${f(xv)}V${f(y + h)}H${f(xz)}Z`; const right = xv > xz, s = right ? 1 : 0, d = right ? -rr : rr; return `M${f(xz)},${f(y)}H${f(xv + d)}A${f(rr)},${f(rr)} 0 0 ${s} ${f(xv)},${f(y + rr)}V${f(y + h - rr)}A${f(rr)},${f(rr)} 0 0 ${s} ${f(xv + d)},${f(y + h)}H${f(xz)}Z`; };
```
- Z. 464 `root.UI = { … }` um `vbarPath, hbarPath, xLabels, fitRadars` ergänzen.
- Aufrufmuster: `<path class="br${neg ? ' dn' : ''}" d="${vbarPath(x, bw, yNull, yWert)}" fill="…" fill-opacity="…" data-tip="…"/>`. Die Mindestlänge (A-10) wird vorher an `yWert` bzw. `xWert` geklemmt.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: root.UI] Alle Schritte ergänzen verschiedene Namen im selben Export-Objekt, ohne Überschneidung. Endstand ergänzt: toastWrap, announce, lightbox, requestClose, vbarPath, hbarPath, xLabels, fitRadars, scoreText, count, chartEmpty, chartEmptyHTML, fieldErrors, clearFieldError, clearFieldErrors. barrierefreiheit-U7 exportiert toastWrap, darum muss die Funktion vorher aus zustaende-S-U6 da sein (sonst ReferenceError beim Laden von ui.js). Jeder Export kommt erst mit seiner Funktion.
