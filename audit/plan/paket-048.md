# Paket 048 · diagramme, konto, responsiv

Schritte: 10 · Dateien: web/js/app.js, web/js/screens/affiliate.js, web/js/ui.js
Betroffene Tests laut Spezifikation: Akzeptanz grep 12, Sonde 15; Akzeptanz grep 5; Sonde 15, 18, 19; web/e2e/affiliatetest.js:25 (O4); web/e2e/chartanimtest.js:23 (Sparkline) prüfen
Baut auf Paketen auf: 15, 38, 46, 47

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## diagramme-K1 · Affiliate-Balken neutral --text-2 .45 als Pfad-Balken

Gruppe diagramme · Cluster konto · Aufwand S · Befunde: bereich_konto-7, diagramme-11, bereich_konto-55
Quelle: audit/spec/diagramme.md Z. 668–673 · Dateien: web/js/screens/affiliate.js
Abhängig von: diagramme-C1, diagramme-C5

```text
### 3.11 `web/js/screens/affiliate.js`

**K1 Neutrale Balken** (bereich_konto-7, diagramme-11; bereich_konto-55 über C1)

Z. 47: `<rect … height="${Math.max(m.v > 0 ? 2 : 0, y(0) - y(m.v))…}" rx="4" fill="var(--accent)" fill-opacity=".85" data-tip="…">` → `<path class="br" d="${U.vbarPath(x(i) - bw / 2, bw, y(0), m.v > 0 ? Math.min(y(m.v), y(0) - 2) : y(0))}" fill="var(--text-2)" fill-opacity=".45" data-tip="…unverändert…"></path>`. Das gilt für beide Ansichten. Kein Hover-Stil (K22).

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: --text-2] Affiliate-Balken (affiliate.js:47) neutral nach diagramme-K1: `<path class="br" d="${U.vbarPath(x(i) - bw / 2, bw, y(0), m.v > 0 ? Math.min(y(m.v), y(0) - 2) : y(0))}" fill="var(--text-2)" fill-opacity=".45" data-tip="…unverändert…"></path>`, in beiden Ansichten, ohne Hover-Stil. farbe-C16 wollte `fill="var(--profit)"`. Grund: Grün nur für Gewinn/positiv (BRIEF). Die Balken zeigen Beträge ohne Vorzeichen, in der Betreiber-Ansicht sind Provisionen Kosten, Grün wäre dort falsch. Mengenbalken sind app-weit --text-2 .45 (diagramme A-8). Die Zeile „Affiliate-Balken --profit“ in farbe 1.9 gilt damit nicht. Die übrigen --text-2-Stellen dieses Ankers (barrierefreiheit-A2b Fokusrand, diagramme-A1 text.bv, E5 PV.line, E8b Trefferquote-Reihe) nutzen nur das Token und sind verträglich. zustaende-S-C9c ist über die .lang-card-Anker erledigt.
- [konflikt: --accent] Affiliate-Balken (affiliate.js Z. 47): neutral nach diagramme-K1, also `<path class="br">` mit fill var(--text-2) und fill-opacity .45. Das gilt auch gegen farbe-C16 (--profit). Gründe: Provisionen sind immer ≥ 0, Grün trüge keine Unterscheidung. Die Farbe-Regel selbst sagt „Spalten mit einheitlichem Vorzeichen neutral“, und diagramme A-8 nennt Provisionen ausdrücklich neutral. Fokusring: barrierefreiheit-A2a (--focus = Textfarbe) gilt. Der README-Satz in farbe-D3e wird unter Anker .btn.primary angepasst. Die übrigen Schritte ändern verschiedene Stellen und sind untereinander verträglich. Ihre Einzelkonflikte stehen unter eigenen Ankern (.popover .item[aria-checked], .activity/.tracker/.heat-legend, .dp-day.today/.rr-day.today, .set-tabs/.prop-sub).

## diagramme-D1 · app.js: fitRadars im Resize-Timeout aufrufen

Gruppe diagramme · Cluster responsiv · Aufwand S · Befunde: responsiv-11
Quelle: audit/spec/diagramme.md Z. 536–539 · Dateien: web/js/app.js
Abhängig von: diagramme-C5, diagramme-C19

```text
### 3.5 `web/js/app.js`

**D1** (responsiv-11) Z. 301: im Resize-Timeout `U.drawCharts(document.getElementById('main'))` → `{ U.drawCharts(document.getElementById('main')); U.fitRadars(); }`.

```

## diagramme-C8 · hoverLine mit Bandskala (Parameter band)

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: diagramme-18
Quelle: audit/spec/diagramme.md Z. 404–407 · Dateien: web/js/ui.js
Abhängig von: —

```text
**C8 `hoverLine` mit Bandskala** (diagramme-18)
- Z. 234 Signatur → `function hoverLine(el, svg, pts, xf, yf, tipFn, color, band)`.
- Z. 235 in `show`: `const i = band ? C.clamp(Math.floor((cx - r.left) / r.width * pts.length), 0, pts.length - 1) : C.clamp(Math.round((cx - r.left) / r.width * (pts.length - 1)), 0, pts.length - 1);`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: hoverLine] C8 führt den achten Parameter band ein, C9 übergibt showBars als band. Deshalb kommt C8 zuerst. C11 nutzt den vorhandenen siebten Parameter color als Funktion (i => colOf(pts[i].v)) und ist verträglich. U6b berührt hoverLine nicht: Die Trefferflächen haben fill="transparent" und die Klasse tip-hit, nicht .hit.

## diagramme-C9 · drawers.pnl: Bandskala bei Säulen, keine Gradienten, Pfad-Balken .55, flache Flächen nur ohne Säulen

Gruppe diagramme · Cluster diagramme · Aufwand M · Befunde: diagramme-18, diagramme-17, diagramme-11
Quelle: audit/spec/diagramme.md Z. 408–420 · Dateien: web/js/ui.js
Abhängig von: diagramme-C5, diagramme-C8

```text
### 3.4 `web/js/ui.js` – Zeichner

**C9 `drawers.pnl`** (diagramme-18, diagramme-17, diagramme-11)
- Z. 267 → `const x = showBars ? (i => ml + (i + 0.5) * iw / n) : (i => n === 1 ? ml + iw / 2 : ml + i / (n - 1) * iw);`
- Z. 271 `const gp = gid(), gn = gid(), cp = gid(), cn = gid();` → `const cp = gid(), cn = gid();`
- Z. 275–276: beide `<linearGradient>` löschen. Die `clipPath` in Z. 277 bleiben.
- Z. 280: `<rect … rx="2" class="br…" …/>` →
  ```js
  `<path class="br${p.pnl >= 0 ? '' : ' dn'}" d="${vbarPath(x(i) - bw / 2, bw, y(0), p.pnl >= 0 ? Math.min(y(p.pnl), y(0) - 1.5) : Math.max(y(p.pnl), y(0) + 1.5))}" fill="var(--${p.pnl >= 0 ? 'profit' : 'loss'})" fill-opacity=".55"/>`
  ```
- Z. 281 → ``${showBars ? '' : `<path class="ar" d="${area}" fill="var(--profit)" fill-opacity=".12" clip-path="url(#${cp})"/><path class="ar" d="${area}" fill="var(--loss)" fill-opacity=".16" clip-path="url(#${cn})"/>`}``
- Z. 286: an `hoverLine(…)` als letztes Argument `, showBars` anhängen.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: hoverLine] C8 führt den achten Parameter band ein, C9 übergibt showBars als band. Deshalb kommt C8 zuerst. C11 nutzt den vorhandenen siebten Parameter color als Funktion (i => colOf(pts[i].v)) und ist verträglich. U6b berührt hoverLine nicht: Die Trefferflächen haben fill="transparent" und die Klasse tip-hit, nicht .hit.

## diagramme-C10 · drawers.equity: Gradient durch flache Fläche ersetzen

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: diagramme-17
Quelle: audit/spec/diagramme.md Z. 421–425 · Dateien: web/js/ui.js
Abhängig von: —

```text
**C10 `drawers.equity`** (diagramme-17; ungenutzt, nur der Einheitlichkeit halber)
- Z. 295: `<defs><linearGradient …></defs>` löschen.
- den Flächenpfad `fill="url(#${g})"` → `fill="${col}" fill-opacity="${last >= 0 ? .12 : .16}"`
- `const g = gid()` in Z. 293 streichen.

```

## diagramme-C11 · drawers.line (Kontostand): weich, zweifarbig an Startkapital, Bezugslinie 4 3 mit Beschriftung

Gruppe diagramme · Cluster diagramme · Aufwand M · Befunde: diagramme-15, bereich_dashboard-37, bereich_dashboard-39, diagramme-16
Quelle: audit/spec/diagramme.md Z. 426–439 · Dateien: web/js/ui.js
Abhängig von: diagramme-A1

```text
**C11 `drawers.line` (Kontostand)** (diagramme-15, bereich_dashboard-37, bereich_dashboard-39, diagramme-16)
- Z. 305: Zweig für `n > 1` → `smooth(pts.map((p, i) => [x(i), y(p.v)]))`. Der Zweig für `n === 1` bleibt.
- Z. 306 → `const last = pts[n - 1].v; const colOf = v => base == null ? (d.color || 'var(--text)') : v >= base ? 'var(--profit)' : 'var(--loss)'; const yb = base != null ? y(base) : null; const cp = gid(), cn = gid();` (`xt` wird nicht benutzt und entfällt.)
- Z. 307–311 SVG-Inhalt:
  ```js
  `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${base != null ? `<defs><clipPath id="${cp}"><rect x="0" y="0" width="${W}" height="${Math.max(0, yb)}"/></clipPath><clipPath id="${cn}"><rect x="0" y="${yb}" width="${W}" height="${Math.max(0, H - yb)}"/></clipPath></defs>` : ''}${axisLeft(ticks, y, ml, W, mr, fmt.axisCur)}
   ${base != null ? `<line x1="${ml}" x2="${W - mr}" y1="${yb}" y2="${yb}" stroke="var(--muted)" stroke-width="1" stroke-dasharray="4 3"/>${(() => { const right = Math.abs(y(last) - yb) > 20, ty = yb - 6 < mt + 10 ? yb + 14 : yb - 6; return `<text class="lbl" x="${right ? W - mr : ml + 4}" y="${ty}" text-anchor="${right ? 'end' : 'start'}">Startkapital ${fmt.axisCur(base)}</text>`; })()}` : ''}
   ${base != null ? `<path d="${line}" fill="none" stroke="var(--profit)" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" clip-path="url(#${cp})"/><path d="${line}" fill="none" stroke="var(--loss)" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" clip-path="url(#${cn})"/>` : `<path d="${line}" fill="none" stroke="${colOf(last)}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>`}
   <circle cx="${x(n - 1)}" cy="${y(last)}" r="4" fill="${colOf(last)}" stroke="var(--surface)" stroke-width="2"/>
   ${dateAxis(n, x, i => pts[i].date, ml, W, mr, H)}
   <g class="hover"><line y1="${mt}" y2="${H - mb}" stroke="var(--text-2)" stroke-opacity=".5"/><circle r="4.5" stroke="var(--surface)" stroke-width="2"/></g><rect class="hit" x="${ml}" y="0" width="${iw}" height="${H}" fill="transparent"/></svg>`
  ```
- Z. 312: `hoverLine(…)` um das Argument `i => colOf(pts[i].v)` für `color` ergänzen.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: hoverLine] C8 führt den achten Parameter band ein, C9 übergibt showBars als band. Deshalb kommt C8 zuerst. C11 nutzt den vorhandenen siebten Parameter color als Funktion (i => colOf(pts[i].v)) und ist verträglich. U6b berührt hoverLine nicht: Die Trefferflächen haben fill="transparent" und die Klasse tip-hit, nicht .hit.

## diagramme-C12 · drawers.spark: Fläche bis Nulllinie, zweifarbig per clipPath, Nulllinie

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: bereich_notebook_news-19, diagramme-17
Quelle: audit/spec/diagramme.md Z. 440–451 · Dateien: web/js/ui.js
Abhängig von: —

```text
**C12 `drawers.spark`** (bereich_notebook_news-19, diagramme-17)

Z. 316–319 ersetzen. Der Rumpf nach der Leer-Prüfung:
```js
const pts = [0, ...vals]; const mn = Math.min(0, ...pts), mx = Math.max(0, ...pts);
const x = i => 4 + i / (pts.length - 1) * (W - 8), y = v => 6 + (mx - v) / (mx - mn || 1) * (H - 12);
const last = pts[pts.length - 1], col = last >= 0 ? 'var(--profit)' : 'var(--loss)', y0 = y(0), cp = gid(), cn = gid();
const line = smooth(pts.map((v, i) => [x(i), y(v)])), area = `${line} L${x(pts.length - 1)},${y0} L${x(0)},${y0} Z`;
el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs><clipPath id="${cp}"><rect x="0" y="0" width="${W}" height="${y0}"/></clipPath><clipPath id="${cn}"><rect x="0" y="${y0}" width="${W}" height="${Math.max(0, H - y0)}"/></clipPath></defs><line class="zero" x1="4" x2="${W - 4}" y1="${y0}" y2="${y0}"/><path d="${area}" fill="var(--profit)" fill-opacity=".12" clip-path="url(#${cp})"/><path d="${area}" fill="var(--loss)" fill-opacity=".16" clip-path="url(#${cn})"/><path d="${line}" fill="none" stroke="var(--profit)" stroke-width="2" clip-path="url(#${cp})"/><path d="${line}" fill="none" stroke="var(--loss)" stroke-width="2" clip-path="url(#${cn})"/><circle cx="${x(pts.length - 1)}" cy="${y(last)}" r="3" fill="${col}"/></svg>`;
```
Wirkt auf notebook.js:106, day.js:14, trades.js:26 und trades.js:54.

```

## diagramme-C13 · drawers.vbars: Achse links fmt.axisCur, Pfad-Balken .85, Kategorien ausdünnen, leere Fächer

Gruppe diagramme · Cluster diagramme · Aufwand M · Befunde: diagramme-9, typografie-29, hierarchie-50, bereich_statistik-35, diagramme-11, diagramme-12
Quelle: audit/spec/diagramme.md Z. 452–467 · Dateien: web/js/ui.js
Abhängig von: diagramme-C5, diagramme-B1

```text
**C13 `drawers.vbars`** (diagramme-9, typografie-29, hierarchie-50 Achse, bereich_statistik-35, diagramme-11, diagramme-12)

Z. 323–327 ersetzen. Der Rumpf nach der Leer-Prüfung:
```js
const perTrade = d.metric === 'expectancy'; const vals = groups.map(g => g.s.n ? (perTrade ? g.s.expectancy : g.s.total) : 0);
const ticks = niceTicks(Math.min(0, ...vals), Math.max(0, ...vals), 3); const y0 = Math.min(ticks[0], ...vals, 0), y1 = Math.max(ticks[ticks.length - 1], ...vals, 0);
const ml = axisWidth(ticks.map(fmt.axisCur)), mr = 12, mt = 12, mb = 26;
const y = v => mt + (y1 - v) / (y1 - y0 || 1) * (H - mt - mb); const gap = (W - ml - mr) / groups.length, bw = Math.min(44, gap * 0.62);
const name = g => String(g.label || g.key); const step = Math.max(1, Math.ceil((Math.max(...groups.map(g => name(g).length)) * 6.6 + 8) / gap));
el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${axisLeft(ticks, y, ml, W, mr, fmt.axisCur)}<line class="zero" x1="${ml}" x2="${W - mr}" y1="${y(0)}" y2="${y(0)}"/>${groups.map((g, i) => { const v = vals[i], cx = ml + i * gap + gap / 2;
  const lab = i % step === 0 ? `<text x="${cx}" y="${H - 7}" text-anchor="middle"${g.s.n ? '' : ' style="fill:var(--faint)"'}>${esc(name(g))}</text>` : '';
  if (!g.s.n) return `<rect x="${ml + i * gap}" y="${mt}" width="${gap}" height="${H - mt - mb}" fill="transparent" data-tip="<b>${esc(name(g))}</b>: Keine Trades"></rect>${lab}`;
  return `<path class="br${v >= 0 ? '' : ' dn'}" d="${vbarPath(cx - bw / 2, bw, y(0), v >= 0 ? Math.min(y(v), y(0) - 2) : Math.max(y(v), y(0) + 2))}" fill="var(--${v >= 0 ? 'profit' : 'loss'})" fill-opacity=".85" data-tip="…bisheriger Text unverändert…"></path>${lab}`; }).join('')}</svg>`;
```
Der Tooltip-Text bleibt wörtlich wie bisher. „Win-Rate“ darin ändert Wording/wording-3.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: U.drawers.vbars] Die beiden Schritte sind verträglich, wenn die Reihenfolge feststeht. diagramme-C13 ersetzt den Rumpf von drawers.vbars und übernimmt den Tooltip-Text wörtlich. Danach setzt wording-S1.4 im neuen Rumpf `${count(g.s.n, 'Trade', 'Trades')} · Trefferquote ${fmt.pct(g.s.winRate)}`. Der Tooltip für leere Fächer, „<b>{Name}</b>: Keine Trades“, aus C13 bleibt.
- [konflikt: --faint] Es gilt die app-weite Farbregel: --faint nie für Wörter oder Zahlen (farbe Z. 49; Platzhalter und Leertexte in --muted mit mindestens 4,5:1). (a) Leeres Datumsfeld: Das Overlay „Offen“ und der Touch-Leerzustand stehen in --muted statt --faint, gleich wie .input::placeholder und .lbl-hint. (b) Diagramm-Fach ohne Trades: Die Beschriftung bleibt in --muted wie alle Kategorienamen. Leer erkennt man am fehlenden Balken und am Tooltip „<b>{Name}</b>: Keine Trades“. Gleiches gilt sinngemäß für diagramme-C14 (hbars: !g.s.n ? 'muted' statt 'faint'). (c) barrierefreiheit-B3 bleibt unverändert: Das (i)-Symbol darf --faint sein (leeres/inaktives Symbol); in der Prüfliste der Farbe heißt der Selektor nach B3 button.info statt span.info. (d) zustaende-S-DP entfällt (siehe DatePicker.init). Gleich mit Typografie: Das Overlay bekommt keine eigenen verbotenen Größen 13.5/12.5 px, sondern die Größe seines Feldes.
- ÄNDERN: In der Beschriftung leerer Fächer das Inline-Attribut style="fill:var(--faint)" weglassen: const lab = i % step === 0 ? `<text x="${cx}" y="${H - 7}" text-anchor="middle">${esc(name(g))}</text>` : ''; (erbt --muted von der .chart-text-Regel). Trefferfeld und Tooltip „Keine Trades“ bleiben. Für diagramme-C14 entsprechend 'muted' statt 'faint'.

## diagramme-C15 · drawers.rolling: linke Achse fmt.r, keine Fläche, Linie --text, Mittelwert-Label .lbl

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: diagramme-9, farbe_kontrast-37, diagramme-17
Quelle: audit/spec/diagramme.md Z. 482–492 · Dateien: web/js/ui.js
Abhängig von: diagramme-A1

```text
**C15 `drawers.rolling`** (diagramme-9, farbe_kontrast-37, Rolling-Teil von diagramme-17)
- Z. 339: `const ml = 8, mr = 56, mt = 16, mb = 26;` aus der Leerzweig-Zeile herausnehmen und **nach** der Tick-Berechnung (Z. 340) als `const ml = axisWidth(ticks.map(t => fmt.r(t))), mr = 12, mt = 16, mb = 26;` setzen. Die Funktion `x` steht danach.
- Z. 342:
  - `<defs>…linearGradient…</defs>` löschen
  - `<g class="grid">…W - mr + 8…</g>` → `${axisLeft(ticks, y, ml, W, mr, t => fmt.r(t))}`
  - Mittelwert-Text → `<text class="lbl" x="${W - mr - 4}" y="${y(e.mean) - 5}" text-anchor="end">Gesamt ${fmt.r(e.mean)}</text>`
  - Flächenpfad `<path d="${line} L…Z" fill="url(#${g})"/>` löschen
  - Linie `stroke="var(--accent)"` → `stroke="var(--text)"`
  - Hover-Kreis `fill="var(--accent)"` → `fill="var(--text)"`
- `const g = gid()` in Z. 341 streichen. Die Mittelwert-Linie in `--profit`/`--loss` bleibt.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: --accent] Affiliate-Balken (affiliate.js Z. 47): neutral nach diagramme-K1, also `<path class="br">` mit fill var(--text-2) und fill-opacity .45. Das gilt auch gegen farbe-C16 (--profit). Gründe: Provisionen sind immer ≥ 0, Grün trüge keine Unterscheidung. Die Farbe-Regel selbst sagt „Spalten mit einheitlichem Vorzeichen neutral“, und diagramme A-8 nennt Provisionen ausdrücklich neutral. Fokusring: barrierefreiheit-A2a (--focus = Textfarbe) gilt. Der README-Satz in farbe-D3e wird unter Anker .btn.primary angepasst. Die übrigen Schritte ändern verschiedene Stellen und sind untereinander verträglich. Ihre Einzelkonflikte stehen unter eigenen Ankern (.popover .item[aria-checked], .activity/.tracker/.heat-legend, .dp-day.today/.rr-day.today, .set-tabs/.prop-sub).

## diagramme-C16 · drawers.mc: linke Achse fmt.axisCur, Median-Linie mit Label, Ruin-Schwelle voller Betrag, Achse „0 · 25 · 50 Trades“

Gruppe diagramme · Cluster diagramme · Aufwand M · Befunde: diagramme-9, typografie-29, bereich_statistik-44, diagramme-21
Quelle: audit/spec/diagramme.md Z. 493–505 · Dateien: web/js/ui.js
Abhängig von: diagramme-B2, diagramme-A1

```text
**C16 `drawers.mc`** (diagramme-9, typografie-29, bereich_statistik-44, diagramme-21)
- Z. 347: `const ml = 8, mr = 58, mt = 12, mb = 26;` aus der Leerzweig-Zeile streichen.
- Z. 348: in `niceTicks(Math.min(...all, ruinY), Math.max(...all), 4)` den Median einbeziehen: `Math.min(...all, ...mc.median, ruinY)` und `Math.max(...all, ...mc.median)`. Dasselbe gilt für `y0`/`y1`. Danach `const ml = axisWidth(ticks.map(fmt.axisCur)), mr = 12, mt = 12, mb = 26;` setzen.
- Z. 350:
  - `<g class="grid">…curShort(t)…</g>` → `${axisLeft(ticks, y, ml, W, mr, fmt.axisCur)}`
  - Ruin-Text → `<text class="lbl" x="${ml + 2}" y="${y(ruinY) - 5}" style="fill:var(--loss)">Ruin-Schwelle ${fmt.axisCur(ruinY)}</text>`
  - nach den Pfad-Polylines neu:
    ```js
    `<polyline fill="none" stroke="var(--text)" stroke-width="2" stroke-linejoin="round" points="${mc.median.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')}"/><text class="lbl" x="${x(mc.horizon) - 4}" y="${y(mc.median[mc.horizon]) - 6}" text-anchor="end" style="fill:var(--text-2)">Median ${fmt.axisCur(mc.median[mc.horizon])}</text>`
    ```
  - Achsentext ``${i} Trades`` → ``${i === mc.horizon ? `${i} Trades` : i}``
- Pfadfarbe laut Farbe/bereich_statistik-25: `stroke="var(--text-2)" stroke-opacity=".22"`. Wird sie nicht dort umgesetzt, dann hier.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: U.drawers.mc] Die Ruin-Beschriftung setzt nur diagramme-C16: `<text class="lbl" x="${ml + 2}" y="${y(ruinY) - 5}" style="fill:var(--loss)">Ruin-Schwelle ${fmt.axisCur(ruinY)}</text>`. fmt.axisCur ist fmt.cur(v, { compact: true }) und ergibt dasselbe „17.500 €“ wie wording 1.5. Im Geld-blind-Modus folgt die Beschriftung außerdem der Achse. Die Pfadfarbe (--text-2, Deckkraft .22) setzt farbe-B27b, C16 setzt sie nicht noch einmal (C16 Z. 504 ist ohnehin nur bedingt formuliert).
- ÄNDERN: Den Punkt Z. 504 (Pfadfarbe --text-2, .22) nicht umsetzen, das erledigt farbe-B27b. Die übrigen Punkte bleiben.
