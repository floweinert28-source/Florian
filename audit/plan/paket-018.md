# Paket 018 · trades_tag

Schritte: 9 · Dateien: web/css/app.css, web/js/app.js, web/js/screens/day.js, web/js/screens/trades.js
Betroffene Tests laut Spezifikation: e2e/tlfittest.js:13 (Ansicht days); e2e/tlfittest.js:8–9 (Pager sichtbar)
Baut auf Paketen auf: 4, 6, 7, 17

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .pg-nav] Der Seitenwähler im TradeLog (trades.js:48) wird in einem Durchgang geschrieben. „Trades pro Seite“ steht immer. Bei pages > 1: pg-sep, pg-info `{from}–{to} von {n} Trades` (Halbgeviertstrich ohne Leerzeichen, Schlüssel „{0}–{1} von {2} Trades“), grow, Seitenauswahl „von N Seiten“ und `.pg-nav` mit Knöpfen `class="btn nav"`. Bei pages ≤ 1 gibt es weder Seitenauswahl noch .pg-nav. Ohne aktiven Filter folgt `<span class="pg-sep"></span><span class="pg-info">${U.count(rows.length, 'Trade', 'Trades')}</span>`, mit aktivem Filter nichts weiter, weil die Zahl dann im Zähler „{x} von {y} Trades“ der Filterzeile steht (der nur bei aktivem Filter erscheint, zustaende-S-T2). Begründung: eine Information an genau einer Stelle (Aufbau-Grundsatz 1), Zähler nur über U.count (Wortwahl W9). Das Schatten-Ich (komponenten-S-shadow) folgt derselben Regel: .btn.nav, Seitenwahl nur bei mehreren Seiten, „1–10“.
- [konflikt: .pager] Eine Fassung für beide Seitenwähler, komponenten-S-trades-c übernimmt den TradeLog. In renderTable: const active = !!(f.q || f.symbol || f.setup || f.status || f.mistake); Zähler oben nur mit Filter: ${active ? `<span class="muted small tl-count">${rows.length} von ${U.count(list.length, 'Trade', 'Trades')}</span>` : ''}. Seitenwähler: „Trades pro Seite“ steht immer. Bei pages > 1 folgen <span class="pg-sep"></span><span class="pg-info">${from + 1}–${to} von ${U.count(rows.length, 'Trade', 'Trades')}</span><span class="grow"></span>, die Seitenauswahl „von ${pages} Seiten“ und .pg-nav mit zwei .btn.nav. Bei pages <= 1 folgt nur ohne aktiven Filter <span class="pg-sep"></span><span class="pg-info">${U.count(rows.length, 'Trade', 'Trades')}</span>, sonst nichts. Grund: Mit Filter zeigt der Zähler oben schon „x von y“; ein zweites „1–7 von 7 Trades“ unten wäre dieselbe Information zweimal (aufbau, Grundsatz 1). Bereichsstrich ohne Leerzeichen „1–10“ (komponenten WORTWAHL). Zähler über U.count (wording W9). Schatten-Ich gleich: bei einer Seite pg-info ${U.count(list.length, 'Verstoß', 'Verstöße')}, sonst „{0}–{1} von {2} Verstößen“. Teil 3 von zustaende-S-T2 (Box schrumpft) wartet weiter auf zustaende-37. typografie-3.2.3l (Z. 1744 Token) passt dazu.
- ÜBERNIMMT zustaende-S-T2: Die Teile 1 und 2 (Zähler nur mit Filter, reduzierter Seitenwähler bei einer Seite) gehen in komponenten-S-trades-c auf. „Trade${…'s'}“ wird dort durch U.count ersetzt. Teil 3 bleibt offen bis zustaende-37.
- [konflikt: .pg-info] komponenten will `.pg-info` immer, zustaende will es bei einer Seite nur ohne aktiven Filter. zustaende gilt (aufbau Grundsatz 1: eine Information an einer Stelle). Bei aktivem Filter steht „{x} von {y} Trades“ schon in der Filterzeile.

Verbindlicher Endstand trades.js:
- Z. 44: Zähler nur bei aktivem Filter (`active = !!(f.q || f.symbol || f.setup || f.status || f.mistake)`).
- Z. 48: „Trades pro Seite“ steht immer.
- Bei `pages > 1` kommen dazu: `pg-sep`, `<span class="pg-info">${from + 1}–${to} von ${n} Trades</span>`, `grow`, die Seitenwahl mit „von N Seiten“ und `.pg-nav` mit zwei `<button type="button" class="btn nav">`.
- Bei `pages <= 1`: ohne Filter `pg-sep` + `<span class="pg-info">{n} Trade(s)</span>`, mit Filter nichts weiter.

Bereichsangabe immer ohne Leerzeichen „1–10“ (komponenten-Wortwahl). Das „{from} – {to}“ in S-T2 zitiert nur den Ist-Text.

Gleiches Format in shadow.js:73 („1–10 von {n} Verstößen“). Dazu shadowtest.js:38 auf `1–10 von ${n2} Verstößen` und Z. 41 auf `startsWith('11–')` anpassen. Neue Schlüssel „{0}–{1} von {2} Trades/Verstößen“ in allen fünf js/lang-Dateien.

tabular-nums für `.pg-info` (3.2.2e) gilt unverändert. Weil die Pfeile einzelne `.btn.nav` werden (komponenten ersetzt Z. 1749–1753), folgt `:disabled` der globalen Regel (`--disabled-o`); die Sonderfarbe `--faint` für die Pager-Pfeile entfällt.
- VERBINDLICH (Kreuzprüfung): web/js/screens/trades.js, renderTable – einzige Fassung von Trefferzähler und Seitenwähler im TradeLog (übernimmt zustaende-S-T2 Teil 1 und 2). Nach komponenten-C07 (.btn.nav).
1) Nach `const f = App.state.tradeFilter;`: `const active = !!(f.q || f.symbol || f.setup || f.status || f.mistake);`. Die Bedingung des Zurücksetzen-Knopfs in Z. 44 liest ebenfalls `active`.
2) Z. 44: Zähler nur bei aktivem Filter: `${active ? `<span class="muted small tl-count">${rows.length} von ${U.count(list.length, 'Trade', 'Trades')}</span>` : ''}`. Klasse tl-count und U.count kommen aus wording-S9.3-9.7, die Bedingung aus komponenten-S-trades-a; steht sie dort schon inline, auf `active` umstellen und nicht doppelt umschließen.
3) Z. 48 `pager`: „Trades pro Seite“ (Label mit Auswahl) steht immer. Bei `pages > 1` folgen `<span class="pg-sep"></span><span class="pg-info">${from + 1}–${Math.min(rows.length, from + pg.size)} von ${U.count(rows.length, 'Trade', 'Trades')}</span><span class="grow"></span>`, die Seitenauswahl `<label class="pg-l">…<span>von ${pages} Seiten</span></label>` und `<span class="pg-nav">` mit zwei `<button type="button" class="btn nav" …>` (Vorherige/Nächste Seite, disabled wie bisher). Bei `pages <= 1`: ohne aktiven Filter nur `<span class="pg-sep"></span><span class="pg-info">${U.count(rows.length, 'Trade', 'Trades')}</span>`, mit aktivem Filter nichts weiter (die Zahl steht dann im Zähler der Filterzeile). Bereich immer mit Halbgeviertstrich ohne Leerzeichen („1–10“).
4) Schlüssel „{0}–{1} von {2} Trades“ (en „{0}–{1} of {2} trades“) in allen fünf js/lang-Dateien.
Das Schatten-Ich (shadow.js:73) folgt demselben Muster, umgesetzt in komponenten-S-shadow: bei einer Seite `U.count(list.length, 'Verstoß', 'Verstöße')`, sonst „{0}–{1} von {2} Verstößen“; dort auch shadowtest.js:38 → `1–10 von ${n2} Verstößen` und Z. 41 → `startsWith('11–')`. `:disabled` der Pfeile folgt der globalen Regel (--disabled-o), tabular-nums für .pg-info (typografie-3.2.2e) bleibt. Teil 3 aus zustaende-S-T2 (Box schrumpft) wartet weiter auf zustaende-37.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: trades.renderMissed] renderMissed folgt aufbau-C15c: Filter nach Zeitraum und Konto, zwei Leerzustände, accountId beim Speichern. Der Kartenkopf (Z. 59) wird einmal so umgesetzt: `<div><div class="kpi-label">${total >= 0 ? 'Entgangen' : 'Verlust vermieden'}</div><div class="score-big">${fmt.cur(Math.abs(total))}</div></div><div><div class="kpi-label">Wären Gewinner gewesen</div><div class="score-big">${wins} von ${m.length}</div></div>`. Der Inhalt (Beschriftungswechsel, ohne Vorzeichen und Farbe) kommt aus farbe-C31b (Farbregel „Verpasste Trades“), die Klasse aus aufbau-C15c. total und wins werden aus der gefilterten Liste m berechnet. Die Tabellenzellen derselben Zeile sind verträglich: komponenten-S-trades-e (Symbol/Richtung), responsiv-3.7 (Setup-Tooltip), typografie-3.8c (Datum num/dateRow).
- [reihenfolge: td.dir-cell] Symbol und Richtung stehen in zwei Zellen (td.sym + td.dir-cell) unter einem Kopf „Symbol“ mit colspan 2. Im TradeLog über COLS ['symbol', 'Symbol', '', 2] (aufbau-C15a), bei Verpassten Trades über das Markup (komponenten-S-trades-e); das Richtungs-Abzeichen bekommt span.bl (responsiv-3.2b). responsiv-3.7 baut auf der neuen Spaltenfolge auf: `PH = ['openedAt', 'symbol', 'pnl']`, die Schlüssel 'direction' und 'status' gibt es nicht mehr. td.dir-cell bekommt nie ph-hide (am Handy nur der Pfeil). Es gibt keine Status-Zelle mehr; ph-hide kommt an Geschlossen, Setup, Einstieg, Ausstieg, R, Regeln und Score. Die Datumszelle „Eröffnet“ bleibt bei typografie-3.8c (fmt.dateRow ist schon kurz), es gibt kein Paar aus ph-hide und ph-only.

## komponenten-S-trades-f · Trade-Ansicht: „30 Sekunden aufnehmen“ und „Bearbeiten“ neutral

Gruppe komponenten · Cluster trades_tag · Aufwand S · Befunde: komponenten-1
Quelle: audit/spec/komponenten.md Z. 723–723 · Dateien: web/js/screens/trades.js
Abhängig von: —

```text
- Z. 84 „30 Sekunden aufnehmen“ `btn sm primary` → `btn sm`; Z. 85 „Bearbeiten“ `btn primary sm` → `btn sm`.
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .btn.primary] (1) Gewicht: .btn.primary bekommt 700 (typografie-3.2.4b). Grundlage sind BRIEF („nur Werte und Hauptknöpfe 700“) und README Z. 209–210 („Hauptknöpfe („Trade loggen“, Speichern) fett“). Heute rendert 600 ohnehin als 700, sichtbar ändert sich also nichts. farbe-B2 und farbe-D3e nennen kein Gewicht mehr. (2) Rolle nach der Komponenten-Regel: .btn.primary steht nur im Dialog-Fuß, im Popover- bzw. Panel-Fuß (eine abschließende Aktion) und beim Absenden des Hauptformulars einer Seite. Auslöser, Leerzustand-, Banner- und Listen-Aktionen sowie Inline-Formulare in Karten und Widgets sind .btn bzw. .btn.sm. Grund: Das bleibt ruhig, egal wie N1 ausgeht; bei Variante B wäre jeder primary der lauteste Punkt der Seite und lauter als „Trade loggen“. Damit sind neutral: widgets.js:374 (Mentor-Frage im Widget) `btn`, coach.js:129/140/148 `btn sm`, notebook.js:67 „Wiederherstellen“ `btn sm`, prop.js:82 (Leerzustand) `btn sm`, prop.js:97 „Als bestanden markieren“ `btn sm`, prop.js:262/266 „Ausgabe/Payout erfassen“ `btn`, „Konto hinzufügen“ im Konten-Bereichskopf misc.js:186 `btn` (nicht sm, Seitenebene). (3) Doppelte Knopfänderungen führen die komponenten-S-Schritte aus. Die farbe-C-Schritte lassen ihre Knopf-Teile weg, ihre Farbteile bleiben. Ausnahme ist der Willkommen-Banner dashboard.js:130: farbe-C19c schreibt den ganzen Aufruf neu und übernimmt damit auch den Knopf. (4) README: farbe-D3e ersetzt Z. 203–208 sofort, aber ohne Aussehen und Gewicht von .btn.primary. komponenten-R1f setzt danach auf und zieht Z. 207–208 bzw. Z. 191 erst nach den Antworten N1/N2 nach, wie dort vorgesehen.

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
