# Paket 018 · trades_tag

Schritte: 9 · Dateien: web/css/app.css, web/js/app.js, web/js/screens/day.js, web/js/screens/trades.js
Betroffene Tests laut Spezifikation: e2e/tlfittest.js:13 (Ansicht days)
Baut auf Paketen auf: 6, 17

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## komponenten-A8 · Gemeinsame Tages-Kennzahlen App.dayStatsHTML()

Gruppe komponenten · Cluster trades_tag · Aufwand S · Befunde: bereich_trades_tag-43
Quelle: audit/spec/komponenten.md Z. 577–579 · Dateien: web/js/app.js
Abhängig von: —

```text
**A8 – Gemeinsame Tages-Kennzahlen** (bereich_trades_tag-43)
Neu: `App.dayStatsHTML(s, o = {})` gibt `<div class="stats"${o.style ? ` style="${o.style}"` : ''}>…</div>` mit acht Feldern in dieser Reihenfolge zurück: Trades (`o.n ?? s.n`, dahinter ` <span class="muted small">(x offen)</span>`, wenn `o.open`), Brutto-P&L (`U.cls`, signiert), Gewinner / Verlierer (`pos`/`neg`), Gebühren, Win-Rate, Volumen (`fmt.num(…, 2)`), Profit-Faktor, Ø R (`fmt.r(s.avgR)` oder „—“). Ohne geschlossene Trades (`o.closed === 0`) zeigen Win-Rate, Profit-Faktor und Ø R „—“, wie heute in day.js:14.

```

## komponenten-S-day-b · Tagesansicht: Kennzahlen aus App.dayStatsHTML

Gruppe komponenten · Cluster trades_tag · Aufwand S · Befunde: bereich_trades_tag-43
Quelle: audit/spec/komponenten.md Z. 659–659 · Dateien: web/js/screens/day.js
Abhängig von: komponenten-A8

```text
- Z. 14: die handgeschriebene `<div class="stats">…</div>` → `${App.dayStatsHTML(s, { n: trades.length, open: trades.length - closed.length, closed: closed.length })}` (innerhalb der bestehenden `.day-card`).
```

## komponenten-S-day-c · Tagesansicht Check-in: Werte flach in .day-card .stats statt Unterkarten

Gruppe komponenten · Cluster trades_tag · Aufwand S · Befunde: referenz-20
Quelle: audit/spec/komponenten.md Z. 660–660 · Dateien: web/js/screens/day.js
Abhängig von: —

```text
- Z. 16 (Check-in): das äußere `<div class="grid" style="grid-template-columns:repeat(3,1fr);gap:8px">` mit den drei `<div class="strat-stats" style="margin:0;grid-template-columns:1fr">…</div>` → `<div class="day-card"><div class="stats" style="grid-template-columns:repeat(3,1fr);margin-top:0">` + je Wert `<div><div class="k">${k}</div><div class="v"${col ? ` style="color:${col}"` : ''}>${v}</div></div>` + `</div></div>`.
```

## komponenten-S-trades-a · TradeLog: Trefferzähler nur bei aktivem Filter

Gruppe komponenten · Cluster trades_tag · Aufwand S · Befunde: bereich_trades_tag-34
Quelle: audit/spec/komponenten.md Z. 717–718 · Dateien: web/js/screens/trades.js
Abhängig von: —

```text
**S-trades (trades.js)** (bereich_trades_tag-11, bereich_trades_tag-34, zustaende-14, komponenten-25, bereich_trades_tag-43, bereich_trades_tag-30, komponenten-1)
- Z. 44: `<span class="muted small" style="margin-left:auto">${rows.length} von ${list.length} Trades</span>` nur ausgeben, wenn `f.q || f.symbol || f.setup || f.status || f.mistake`.
```

## komponenten-S-trades-d · Tageskarten: „Netto“ gedämpft, Kennzahlen aus App.dayStatsHTML

Gruppe komponenten · Cluster trades_tag · Aufwand S · Befunde: bereich_trades_tag-43
Quelle: audit/spec/komponenten.md Z. 721–721 · Dateien: web/js/screens/trades.js
Abhängig von: komponenten-A8

```text
- Z. 54 (Tageskarten): `<span class="pnl ${U.cls(d.pnl)}">Netto ${fmt.cur(d.pnl, { signed: true })}</span>` → `<span class="pnl"><span class="muted">Netto</span> <span class="${U.cls(d.pnl)}">${fmt.cur(d.pnl, { signed: true })}</span></span>`; die sieben handgeschriebenen Kennzahlen → `${App.dayStatsHTML(C.summary(d.trades), { style: 'margin-top:0' })}`.
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: C.summary] zustaende-S-T1 gilt für render() in trades.js. `const base = view === 'trades' ? filtered(list) : list; const s = C.summary(base);` und `W.data(Object.assign({}, ctx, { inRange: base }), App)`. Zähler in der Netto-Kachel `${s.n} abgeschlossen`, ohne „Gefiltert ·“-Präfix. Dazu der Info-Text aus S-T1 und der leere Wert als `.nodata.dash` („—“ + .vh „Noch keine Daten“). renderTable/renderDays/renderMissed bekommen weiter `list`. Grund: C.summary zählt nur abgeschlossene Trades. „{n} abgeschlossen“ ist deshalb wahr und unterscheidet sich vom „x von y Trades“ der Filterzeile, das auch offene Trades zählt. Der Filterzustand steht direkt darunter in der Filterzeile („x von y Trades“, „Zurücksetzen“). „Gefiltert · 1 Trades“ wäre außerdem grammatisch falsch und in schmalen Kacheln (961–1240 px) zu lang. komponenten-S-trades-d betrifft nur renderDays (C.summary(d.trades) für Tageskarten) und ist verträglich.

## komponenten-S-trades-e · Verpasste Trades: Symbol und Richtung in zwei Zellen unter einer Überschrift

Gruppe komponenten · Cluster trades_tag · Aufwand S · Befunde: bereich_trades_tag-30
Quelle: audit/spec/komponenten.md Z. 722–722 · Dateien: web/js/screens/trades.js
Abhängig von: —

```text
- Z. 59 (Verpasste Trades): `<th>Symbol</th>` → `<th colspan="2">Symbol</th>`; `<td class="sym">${esc(x.symbol)} ${U.badge(x.direction)}</td>` → `<td class="sym">${esc(x.symbol)}</td><td class="dir-cell">${U.badge(x.direction)}</td>`.
```

## komponenten-S-trades-f · Trade-Ansicht: „30 Sekunden aufnehmen“ und „Bearbeiten“ neutral

Gruppe komponenten · Cluster trades_tag · Aufwand S · Befunde: komponenten-1
Quelle: audit/spec/komponenten.md Z. 723–723 · Dateien: web/js/screens/trades.js
Abhängig von: —

```text
- Z. 84 „30 Sekunden aufnehmen“ `btn sm primary` → `btn sm`; Z. 85 „Bearbeiten“ `btn primary sm` → `btn sm`.
```

## komponenten-S-trades-g · Verpasst-Dialog mit den Bausteinen aus „Trade loggen“ (3er-Raster, Symbol, Richtung, Währungsfeld, R)

Gruppe komponenten · Cluster trades_tag · Aufwand M · Befunde: bereich_trades_tag-11
Quelle: audit/spec/komponenten.md Z. 724–724 · Dateien: web/js/screens/trades.js, web/css/app.css
Abhängig von: komponenten-A5a, komponenten-A5b

```text
- Verpasst-Dialog Z. 110: `<div class="form-grid">` → `<div class="form-grid cols3">` (CSS: `.form-grid.cols3 { grid-template-columns: repeat(3, minmax(0, 1fr)); } @media (max-width: 560px) { .form-grid.cols3 { grid-template-columns: 1fr; } }` nach app.css Z. 301). Reihenfolge: Datum | Symbol | Richtung, dann Setup | Hätte gebracht | R, dann „Warum nicht gehandelt?“ (`span2` → volle Breite). Symbol `<input class="input" id="m-symbol" name="symbol" required>` → `${App.symbolField('')}`; Richtung `${U.seg([[1,'Long'],[-1,'Short']], 1, 'set-dir')}<input type="hidden" name="direction" value="1">` → `${App.dirField(0)}` (keine Vorwahl). „Hätte gebracht (P&L)“ → „Hätte gebracht“ mit `App.curField({ name: 'pnl', id: 'm-pnl', value: '', accountId: S.defaultAccountId() })`; „R-Multiple“ → „R“. Am `U.modal(…)`-Aufruf des Dialogs die Option `{ onClose: () => App.closeSymbolMenu(), onMount: el => App.noLabelFocus(el) }` ergänzen (wie im Trade-Dialog), damit das Symbol-Menü mit dem Dialog schließt. Das versteckte Feld heißt weiter `name="symbol"` (`#f-symbol`), `save-missed` liest es unverändert.
```

## aufbau-B6 · Aktion new-trade auf der Tagesansicht mit Datum 09:00 vorbelegen

Gruppe aufbau · Cluster trades_tag · Aufwand S · Befunde: hierarchie-7
Quelle: audit/spec/aufbau.md Z. 347–355 · Dateien: web/js/app.js
Abhängig von: —

```text
**B6 `new-trade` mit Tag** (`web/js/app.js` Z. 324) · hierarchie-7
```js
'new-trade'() {
  const k = this.state.route === 'day' && this.state.params[0];
  if (k && k !== C.dayKey(new Date())) { const d = C.parseDayKey(k); if (!isNaN(d)) { d.setHours(9, 0, 0, 0); return this.openTradeEditor(null, { openedAt: d.toISOString() }); } }
  this.openTradeEditor(null);
},
```

```

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: App.openTradeEditor] Alle Schritte ändern dieselbe Vorlage. Darum gilt eine feste Reihenfolge, und zwei Doppelungen werden zusammengelegt. (1) komponenten-A5b löst Symbol und Richtung in App.symbolField und App.dirField heraus. (2) abstaende-E2 entfernt die Wrapper. Die Klasse tf-dir gehört in App.dirField: <div class="field tf-dir">…</div>. Im Verpasst-Dialog wirkt sie nicht, denn die CSS-Regeln greifen nur unter .tf-main >. (3) wording-S5.4-5.5 setzt das Feld Geschlossen und übernimmt dabei farbe-C12a: <div class="field tf-c3 tf-dt"><label for="f-close">Geschlossen <span class="lbl-hint dp-coarse">(leer lassen, solange offen)</span></label><input class="input" type="datetime-local" id="f-close" name="closedAt" data-empty="Offen" value="…"></div>. Die Klasse ist lbl-hint statt faint, weil --faint nie für Wörter steht. Der Knopftext wird ${trade ? 'Speichern' : 'Trade loggen'}, die Klasse bleibt btn primary. Wie die Bestätigen-Knöpfe aussehen, ist Nutzerfrage komponenten-1 und wird hier nicht geändert. (4) barrierefreiheit-P12 (Restteil): Punktwert-(i) in .lbl-row innerhalb von <div class="field tf-c3"> und guard: true. (5) zustaende-S-A4: novalidate und Prüfung (siehe #trade-form). abstaende-E3, aufbau-B6 und wording-S5.3 sind unter App.actions['new-trade'] entschieden, wording-S5.9 unter app.html keydown.
- [doppelt: App.actions['new-trade']] Drei Schritte machen dieselbe Änderung. aufbau-B6 übernimmt, weil nur er das ungültige Datum abfängt: 'new-trade'() { const k = this.state.route === 'day' && this.state.params[0]; if (k && k !== C.dayKey(new Date())) { const d = C.parseDayKey(k); if (!isNaN(d)) { d.setHours(9, 0, 0, 0); return this.openTradeEditor(null, { openedAt: d.toISOString() }); } } this.openTradeEditor(null); }. parseRoute setzt params immer als Array. Das Verhalten entspricht new-trade-day (day.js:24). wording-S5.9 nutzt nur diese Aktion (siehe app.html keydown).
- ÜBERNIMMT abstaende-E3: Wird von aufbau-B6 umgesetzt, keine eigene Änderung.
- ÜBERNIMMT wording-S5.3: Wird von aufbau-B6 umgesetzt, keine eigene Änderung.
- [doppelt: C.parseDayKey] E3 und B6 sind dieselbe Änderung, B6 übernimmt (siehe App.actions['new-trade']). barrierefreiheit-C-trades-59 nutzt C.parseDayKey nur für den Lösch-Namen der verpassten Trades und ist verträglich.
