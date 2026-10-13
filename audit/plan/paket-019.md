# Paket 019 · trades_tag

Schritte: 13 · Dateien: web/README.md, web/css/app.css, web/js/app.js, web/js/screens/day.js, web/js/screens/trades.js
Betroffene Tests laut Spezifikation: e2e/blindtest.js:23 (#f-dir); e2e/chartanimtest.js:28; e2e/tlfittest.js:13 (Ansicht days); e2e/tlfittest.js:8–9 (Pager sichtbar); e2e/tradeformtest.js
Baut auf Paketen auf: 5, 13, 18

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## abstaende-S7 · README Z. 108: Tagesansicht mit Datum ‹ › in der Kopfreihe, „Trade loggen“ übernimmt das Datum

Gruppe abstaende · Cluster trades_tag · Aufwand S · Befunde: referenz-17
Quelle: audit/spec/abstaende.md Z. 536–539 · Dateien: web/README.md
Abhängig von: abstaende-E3, abstaende-E-day2

```text
| S7 | Z. 108 | Tagesansicht: „Datum mit ‹ › in der Kopfreihe; „Trade loggen“ übernimmt das Datum des angezeigten Tages“ | referenz-17 |

---

```

## komponenten-A5b · Symbol- und Richtungsfeld aus openTradeEditor herauslösen (App.symbolField, App.dirField)

Gruppe komponenten · Cluster trades_tag · Aufwand M · Befunde: bereich_trades_tag-11
Quelle: audit/spec/komponenten.md Z. 568–569 · Dateien: web/js/app.js
Abhängig von: —

```text
Zusätzlich die Markup-Teile für Symbol und Richtung aus `openTradeEditor` (Z. 350, 351) herauslösen: `App.symbolField(sym)` liefert das bisherige `<div class="field tf-sym">…</div>` (IDs `f-symbol-btn`, `f-symbol`, `f-symbol-l` bleiben), `App.dirField(dir)` das bisherige `<div class="field">…<div class="dir-switch" id="f-dir" …>…</div><input type="hidden" name="direction" …></div>`. `openTradeEditor` ruft beide auf. Die Symbolwahl (Z. 395–410) greift auf `#f-mult` schon abgesichert zu (`if (mi && …)`, Z. 399); im Verpasst-Dialog gibt es kein `#f-mult`, das bleibt so. `set-dir` (Z. 471) und `updateTradePreview` arbeiten ohne `#trade-form` weiter (früher Ausstieg), nichts zu ändern.

```

## komponenten-A8 · Gemeinsame Tages-Kennzahlen App.dayStatsHTML()

Gruppe komponenten · Cluster trades_tag · Aufwand S · Befunde: bereich_trades_tag-43
Quelle: audit/spec/komponenten.md Z. 577–579 · Dateien: web/js/app.js
Abhängig von: —

```text
**A8 – Gemeinsame Tages-Kennzahlen** (bereich_trades_tag-43)
Neu: `App.dayStatsHTML(s, o = {})` gibt `<div class="stats"${o.style ? ` style="${o.style}"` : ''}>…</div>` mit acht Feldern in dieser Reihenfolge zurück: Trades (`o.n ?? s.n`, dahinter ` <span class="muted small">(x offen)</span>`, wenn `o.open`), Brutto-P&L (`U.cls`, signiert), Gewinner / Verlierer (`pos`/`neg`), Gebühren, Win-Rate, Volumen (`fmt.num(…, 2)`), Profit-Faktor, Ø R (`fmt.r(s.avgR)` oder „—“). Ohne geschlossene Trades (`o.closed === 0`) zeigen Win-Rate, Profit-Faktor und Ø R „—“, wie heute in day.js:14.

```

## komponenten-S-day-a · Tagesansicht-Kopf: .btn.nav, .day-title, „Heute“ als btn sm

Gruppe komponenten · Cluster trades_tag · Aufwand S · Befunde: komponenten-25, bereich_trades_tag-38
Quelle: audit/spec/komponenten.md Z. 657–658 · Dateien: web/js/screens/day.js
Abhängig von: komponenten-C07, komponenten-C36

```text
**S-day (day.js)** (komponenten-25, bereich_trades_tag-38, referenz-20, bereich_trades_tag-43, zustaende-14)
- Z. 12: beide `class="btn round"` → `class="btn nav"`; `<h2 style="font-size:18px;margin-left:6px">` → `<h2 class="day-title">`; Link „Heute“ (nur an anderen Tagen) `class="btn sm ghost"` → `class="btn sm"`, Platz bleibt am Anfang der rechten Gruppe. Die Pille „Heute“ regelt Gruppe Farbe (komponenten-8).
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

## komponenten-S-trades-c · TradeLog-Seitenwahl: .btn.nav, Auswahl/Pfeile nur bei mehreren Seiten, „1–10“

Gruppe komponenten · Cluster trades_tag · Aufwand S · Befunde: bereich_trades_tag-34, komponenten-25
Quelle: audit/spec/komponenten.md Z. 720–720 · Dateien: web/js/screens/trades.js
Abhängig von: komponenten-C07

```text
- Z. 48 (Seitenwahl): das zweite `<label class="pg-l">` (Seitenauswahl, „von n Seite(n)“) und `<span class="pg-nav">` nur bei `pages > 1`; Knöpfe in `.pg-nav` `class="btn nav"`; `${from + 1} – ${…}` → `${from + 1}–${…}` (Schlüssel „{0}–{1} von {2} Trades“). „Trades pro Seite“ und `.pg-info` bleiben immer.
```

## komponenten-S-trades-d · Tageskarten: „Netto“ gedämpft, Kennzahlen aus App.dayStatsHTML

Gruppe komponenten · Cluster trades_tag · Aufwand S · Befunde: bereich_trades_tag-43
Quelle: audit/spec/komponenten.md Z. 721–721 · Dateien: web/js/screens/trades.js
Abhängig von: komponenten-A8

```text
- Z. 54 (Tageskarten): `<span class="pnl ${U.cls(d.pnl)}">Netto ${fmt.cur(d.pnl, { signed: true })}</span>` → `<span class="pnl"><span class="muted">Netto</span> <span class="${U.cls(d.pnl)}">${fmt.cur(d.pnl, { signed: true })}</span></span>`; die sieben handgeschriebenen Kennzahlen → `${App.dayStatsHTML(C.summary(d.trades), { style: 'margin-top:0' })}`.
```

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
