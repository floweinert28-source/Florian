# Paket 019 · trades_tag, shell

Schritte: 29 · Dateien: web/README.md, web/app.html, web/css/app.css, web/e2e/sampletest.js, web/js/app.js, web/js/screens/day.js, web/js/screens/trades.js
Betroffene Tests laut Spezifikation: web/e2e/mentortest.js:21 (bleibt grün); web/e2e/rptest.js:10 (bleibt grün); web/e2e/sampletest.js:39-40
Baut auf Paketen auf: 6, 7, 9, 17, 18

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## aufbau-B7 · Tastatur: Bereichstaste nur bei freigeschaltetem Bereich, N über Aktion new-trade

Gruppe aufbau · Cluster shell · Aufwand S · Befunde: aufbau-21, hierarchie-7
Quelle: audit/spec/aufbau.md Z. 356–359 · Dateien: web/app.html
Abhängig von: aufbau-B6

```text
**B7 Tastatur** (`web/app.html` Z. 95–96) · aufbau-21, hierarchie-7
`if (map[e.key]) { location.hash = '#/' + map[e.key]; } else if (e.key === 'n' || e.key === 'N') { App.openTradeEditor(null); }` →
`if (map[e.key]) { if (App.on(map[e.key])) location.hash = '#/' + map[e.key]; } else if (e.key === 'n' || e.key === 'N') { App.actions['new-trade'].call(App); }`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: app.html keydown] Ein gemeinsamer Tasten-Listener. kilook-C6 ändert dieselbe Stelle unter dem Ankernamen „app.html keydown-Listener“ und wird deshalb hier mitentschieden. Endstand: erste Zeile if (window.Store && Store.settings && Store.settings.shortcuts === false) return; (kilook-C6), dann die bestehenden Prüfungen (Modifier, Eingabefelder, .modal-bg), dann const map = { '1': 'dashboard', '2': 'trades', '3': 'day', '4': 'stats', '5': 'notebook', '6': 'progress', '7': 'ruhepunkt', '8': 'mentor', '9': 'shadow', '0': 'replay' }; if (map[e.key]) { if (App.on(map[e.key])) location.hash = '#/' + map[e.key]; } else if (e.key === 'n' || e.key === 'N') { App.actions['new-trade'].call(App); } (aufbau-B7). Grund: Die allgemeine Prüfung App.on(map[key]) deckt Taste 0 ab und dazu jeden Bereich, der über jy_features ausgeschaltet ist. Das entspricht parseRoute, das solche Bereiche aufs Dashboard umleitet. Eine Sonderregel nur für '0' braucht es dann nicht mehr.
- ÜBERNIMMT wording-S5.9: Beide Teile (Taste 0 nur mit Replay, N über App.actions['new-trade']) setzt aufbau-B7 um. Die eigene Zeile if (e.key === '0' && !App.on('replay')) return; entfällt.
- [doppelt: App.on] B7 und S5.9 sind unter „app.html keydown“ entschieden (B7 übernimmt). wording-S17.4-17.7 liest App.on('replay') nur für den Beispieldaten-Text (17.5) und ist damit verträglich. Die Fußzeile (17.7) gegen kilook-C24 wird in der Konfliktliste zu switchRow/.set-block entschieden, nicht hier.

## aufbau-D2d · README: Tastenkürzel und Start-Skelett

Gruppe aufbau · Cluster shell · Aufwand S · Befunde: aufbau-21, aufbau-7
Quelle: audit/spec/aufbau.md Z. 699–701 · Dateien: web/README.md
Abhängig von: aufbau-B7, aufbau-B3

```text
- Z. 318: „**N** Trade loggen, **1–9** Bereiche (0 = Blind-Replay, nur wenn freigeschaltet)“
- Z. 339 Skelett: „mit Werkzeugen und Avatar“ → „mit Werkzeugen (Avatar nur am Handy)“

```

## aufbau-C7a · Tagesansicht: head-Funktion ohne Zeitraum, Tooltip „Trade für {0} loggen“

Gruppe aufbau · Cluster trades_tag · Aufwand S · Befunde: aufbau-5, hierarchie-19, hierarchie-7, responsiv-22
Quelle: audit/spec/aufbau.md Z. 470–477 · Dateien: web/js/screens/day.js
Abhängig von: aufbau-B1

```text
#### `web/js/screens/day.js`

**C7** · aufbau-5, responsiv-22, hierarchie-19, hierarchie-7, hierarchie-15, hierarchie-16, bereich_trades_tag-18, aufbau-10, bereich_training-5, bereich_dashboard-23
- `App.screens.day` nach `title` neu:
  ```js
  /* der Tag kommt aus der Adresse; der Zeitraum wirkt hier nicht (ctx.all). „Trade loggen“ legt an anderen Tagen den Trade auf diesen Tag */
  head: ctx => { const k = ctx.params[0]; const d = k ? C.parseDayKey(k) : null; return { range: false, tradeTip: k && k !== C.dayKey(new Date()) && !isNaN(d) ? `Trade für ${fmt.dateFull(d)} loggen` : '' }; },
  ```
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: App.screens.day.head] head ist die Funktion aus aufbau-C7a: `range: false` und an anderen Tagen der tradeTip „Trade für {Datum} loggen“. Der Zertifikat-Knopf wandert über `actions(ctx)` rechts in die Kopfreihe (abstaende-E-day1), mit Symbol I.award wie auf Dashboard und Statistiken und mit dem data-tip „Tageszertifikat erstellen“ (wording-S8.1): `actions(ctx) { const key = ctx.params[0] || C.dayKey(new Date()); return `<button type="button" class="btn" data-action="cert-open" data-kind="day" data-ref="${key}" data-tip="Tageszertifikat erstellen">${I.award}<span class="hide-m">Zertifikat</span></button>`; }`. Die Klasse am Text-Span folgt den übrigen Kopfreihen-Knöpfen: heute hide-m, nach Barrierefreiheit Z4 vh-m. Aus der Datumszeile verschwindet der Zertifikat-Knopf. Begründung: Seitenaktionen stehen überall rechts in der Kopfreihe (Aufbau 1.3), auf Dashboard und Statistiken steht das Zertifikat schon dort, und die Datumszeile bleibt reine Navigation (referenz-17, geprüfte Fassung). certtest.js:54 findet `[data-action=cert-open][data-kind=day]` weiterhin. Ob die Datumsnavigation selbst in ctx.headLeft wandert (abstaende-E-day2), entscheidet der Anker ctx.headLeft. Diese Entscheidung gilt in beiden Fällen.

## aufbau-C7b · Tagesansicht: Datumszeile ohne Check-in- und Tagestrade-Knopf, Zertifikat award

Gruppe aufbau · Cluster trades_tag · Aufwand S · Befunde: hierarchie-15, hierarchie-7, responsiv-22, bereich_dashboard-23
Quelle: audit/spec/aufbau.md Z. 478–478 · Dateien: web/js/screens/day.js
Abhängig von: aufbau-B6, aufbau-B9

```text
- Z. 12 `nav`: den Knopf `data-action="check-in"` (`Check-in` / `Check-in bearbeiten`) und den Knopf `data-action="new-trade-day"` (`Trade für diesen Tag`) entfernen. `${I.shield} Zertifikat` → `${I.award} Zertifikat`.
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: App.screens.day.head] head ist die Funktion aus aufbau-C7a: `range: false` und an anderen Tagen der tradeTip „Trade für {Datum} loggen“. Der Zertifikat-Knopf wandert über `actions(ctx)` rechts in die Kopfreihe (abstaende-E-day1), mit Symbol I.award wie auf Dashboard und Statistiken und mit dem data-tip „Tageszertifikat erstellen“ (wording-S8.1): `actions(ctx) { const key = ctx.params[0] || C.dayKey(new Date()); return `<button type="button" class="btn" data-action="cert-open" data-kind="day" data-ref="${key}" data-tip="Tageszertifikat erstellen">${I.award}<span class="hide-m">Zertifikat</span></button>`; }`. Die Klasse am Text-Span folgt den übrigen Kopfreihen-Knöpfen: heute hide-m, nach Barrierefreiheit Z4 vh-m. Aus der Datumszeile verschwindet der Zertifikat-Knopf. Begründung: Seitenaktionen stehen überall rechts in der Kopfreihe (Aufbau 1.3), auf Dashboard und Statistiken steht das Zertifikat schon dort, und die Datumszeile bleibt reine Navigation (referenz-17, geprüfte Fassung). certtest.js:54 findet `[data-action=cert-open][data-kind=day]` weiterhin. Ob die Datumsnavigation selbst in ctx.headLeft wandert (abstaende-E-day2), entscheidet der Anker ctx.headLeft. Diese Entscheidung gilt in beiden Fällen.
- ÄNDERN: In day.js:12 den Zertifikat-Knopf aus der Datumszeile ganz entfernen, statt nur I.shield gegen I.award zu tauschen. Das Entfernen von Check-in- und „Trade für diesen Tag“-Knopf bleibt.
- [konflikt: ctx.headLeft] Tagesansicht: Die Datumszeile bleibt im Inhalt, ohne ctx.headLeft. aufbau K4 hat genau diese Variante verworfen, weil Datumstitel und Konto-Filter in einer Reihe vermischt würden, und sie hängt an F1 (komponenten-3/bereich_shell-8). Die Knöpfe „Check-in“ und „Trade für diesen Tag“ entfallen mit aufbau-C7b, „Zertifikat“ bleibt dort mit I.award, die Pille „Heute“ ist neutral (farbe-C20). Von abstaende-E-day2 bleibt nur der Inline-Stil des Datumstitels als Klasse: `<h2 class="day-title">` mit `.day-title { font-size: var(--fs-18); line-height: var(--lh-18); margin-left: var(--sp-1); }` (h2-Rolle 18/600, einzige Definition; .day-title in komponenten-C36 entfällt). Trade-Ansicht: Links steht der Rückweg per ctx.headLeft (aufbau-C15d). Die Seitenaktionen aus wording 9.11 kommen nicht in die Rückweg-Zeile, sondern als `actions(ctx)` rechts in die Kopfreihe; die Aufbau-Regel lautet „rechts Seitenaktionen → .dh-sep → Trade loggen“. Bei ctx.params[0]: Notiz-Knopf (`btn`, „Notiz öffnen“ bzw. „Notiz im Notebook“), `btn danger` „Löschen“, `btn` „Trade bearbeiten“ (Seitenebene = btn, nicht primary); ohne Trade-Datensatz ''. Ohne Parameter bleibt „CSV importieren“. pageHead (aufbau-B1), News (aufbau-C9a) und Affiliate (aufbau-C3) bleiben unverändert.

## aufbau-C7c · Tagesansicht: Tabelle ohne Status-Spalte, Check-in-Text, Regeln-Link, alte Aktion löschen, Breitenprüfung

Gruppe aufbau · Cluster trades_tag · Aufwand M · Befunde: hierarchie-16, bereich_trades_tag-18, hierarchie-15, aufbau-10, bereich_training-5, hierarchie-7
Quelle: audit/spec/aufbau.md Z. 479–484 · Dateien: web/js/screens/day.js
Abhängig von: aufbau-C7b

```text
- Z. 15 Tabelle: Kopf `<th>Zeit</th><th colspan="2">Symbol</th><th>Setup</th><th>Status</th><th class="r">Netto-P&L</th>…` → `<th>Zeit</th><th colspan="2">Symbol</th><th>Setup · Fehler</th><th class="r">Netto-P&L</th><th class="r">R</th><th class="r">Score</th>`. Zelle `<td>${U.statusPill(t.status)}</td>` entfernen. P&L-Zelle `${t.closed ? U.pnl(t.pnl, '', { r: t.r }) : '—'}` → `${!t.closed ? U.statusPill('open') : t.status === 'be' ? `<span class="neu">${fmt.cur(t.pnl, { signed: true, r: t.r })}</span>` : U.pnl(t.pnl, '', { r: t.r })}`
- Z. 16 Leerzustand der Check-in-Karte: Knopftext `Check-in nachtragen` → `${key < C.dayKey(new Date()) ? 'Check-in nachtragen' : 'Check-in machen'}`
- Z. 18 `<a class="btn sm" href="#/settings">Regeln anlegen</a>` → `href="#/settings/regeln"`
- Z. 24 Aktion `'new-trade-day'` löschen (kein Test nutzt sie)
- Danach bei 1440 px prüfen: Tabelle ohne waagerechtes Scrollen (R und Score sichtbar). Sonst `style="min-width:560px"` → `min-width:520px`.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: U.empty] (1) Check-in-Leerzustände nutzen I.mood: kilook-C13 in day.js:16, kilook-C14 in stats.js:61. kilook-C25 löscht I.sparkle; der Satz „Z. 61 Symbol sparkle bleibt“ in zustaende-S-ST2 gilt deshalb nicht. (2) Den Knopftext im Check-in-Leerzustand der Tagesansicht setzt aufbau-C7c einmal: `${key < C.dayKey(new Date()) ? 'Check-in nachtragen' : 'Check-in machen'}`. Für künftige Tage passt „nachtragen“ nicht. (3) Schatten-Ich-Ranking (diagramme-I1): Ein leerer Hinweis ist nicht erlaubt (zustaende Z1: nie ''), also `U.empty('shield', 'Keine Regel aktiv', 'Schalte oben im Regelwerk mindestens eine Regel ein.')`. Ohne Verstoß gibt es keinen zweiten Leerzustand „Keine Verstöße“, der steht schon in der Nachbarkarte „Regelverstöße“. Es bleibt nur die Zeile „Ohne Verstöße: …“. (4) TradeLog-Liste: `return (list.length ? filters : '') + U.empty('tradelog', …)` mit Titel und Satz nach zustaende-S-T3. wording 9.7 und S-T3 ergänzen sich in derselben Zeile. (5) Regeln im Fortschritt: siehe #/settings/regeln. Verträglich sind aufbau-C15c, wording 9.14, 12.6, 12.30, zustaende-S-DY1 und noTrades aus S-ST2.
- [konflikt: U.pnl] Die Regel aus kilook-A3 gilt überall: Ergebnisse laufen über U.pnl und tragen immer ein Vorzeichen, signed: false fällt weg (kilook-C9b Z. 166, kilook-C16 Z. 26). Disziplin-Kosten tragen ein Vorzeichen (farbe-C29). Break-even sieht in TradeLog und Tagesansicht gleich aus: `<span class="neu">${fmt.cur(t.pnl, { signed: true, r: t.r })}</span>`, offene Trades zeigen `U.statusPill('open')` (aufbau-C7c und C15a). Prop-Beträge bekommen { currency: a.currency } (siehe money). Im Notebook tragen alle P&L-Beträge die Klasse num: der Notizkopf (farbe-C24c), die Trade-Notiz in der Liste (zustaende-S-NB1) und ebenso die neue Tagesnotiz-Zeile aus aufbau-C10d. responsiv-3.10 und typografie-3.8h sind verträglich (Text von 3.8h siehe U.barRow).
- [konflikt: #/settings/regeln] Alle Wege zu den Regeln führen auf #/settings/regeln. Doppelt umgesetzte Stellen: Widget-Leertext → aufbau-C2a (zustaende-S-W5 siehe widget:regel_tracker), Tagesansicht day.js:18 → aufbau-C7c. Fortschritt: Die Karte „Aktuelle Regeln“ entfällt (aufbau-C11b). Die Regeln stehen schon als Tages-Checkliste daneben, und eine Information gehört an eine Stelle. Ihr Kopf-Knopf wandert in die Tages-Checkliste: `trailing: `<a class="btn sm" href="#/settings/regeln">${rules.length ? `${I.edit} Regeln bearbeiten` : `${I.plus} Regeln anlegen`}</a><a class="btn sm" href="#/day/${todayKey}">Tag ansehen</a>``. Der Leerzustand der Checkliste ist `<div class="dashed">Noch keine Regeln angelegt.</div>` ohne Knopf: zustaende verlangt für .dashed einen Satz ohne Knopf, für jede Aktion gibt es ein Bedienelement, und der Satz folgt dem Glossar. zustaende-S-PR3 Z. 78 (Wochen-Diagramm nur mit Daten) bleibt.
- ÜBERNIMMT zustaende-S-DY3: Gleicher Link `#/settings/regeln` in day.js:18, wird nur einmal umgesetzt.

## aufbau-C15a · TradeLog-Tabelle: neue Spaltenfolge, Richtung neben Symbol, ohne Status

Gruppe aufbau · Cluster trades_tag · Aufwand M · Befunde: bereich_trades_tag-18
Quelle: audit/spec/aufbau.md Z. 610–616 · Dateien: web/js/screens/trades.js
Abhängig von: —

```text
#### `web/js/screens/trades.js`

**C15** · bereich_trades_tag-18, bereich_trades_tag-33, bereich_trades_tag-27, bereich_trades_tag-16, typografie-4
- Z. 7 `COLS` → `[['openedAt', 'Eröffnet'], ['close', 'Geschlossen'], ['symbol', 'Symbol', '', 2], ['setup', 'Setup'], ['entryPrice', 'Einstieg', 'r'], ['exitPrice', 'Ausstieg', 'r'], ['pnl', 'P&L', 'r'], ['r', 'R', 'r'], ['rules', 'Regeln', 'r'], ['score', 'Score', 'r']]`
- Z. 46 `th`: `COLS.map(([k, l, al]) => `<th class="sortable ${al || ''}" …>`)` → `COLS.map(([k, l, al, span]) => `<th ${span ? `colspan="${span}" ` : ''}class="sortable ${al || ''}" …>`)`
- `sorted` Z. 14: im `val`-Ausdruck vor `t[key] == null` ergänzen: `key === 'symbol' ? `${t.symbol}|${t.direction > 0 ? 'L' : 'S'}` : `; den Zweig `key === 'status' ? …` löschen
- Z. 49 Zellen in dieser Reihenfolge: Eröffnet | Geschlossen (unverändert) | `<td class="sym">${esc(t.symbol)}</td><td class="dir-cell">${U.badge(t.direction)}</td>` | Setup | Einstieg | Ausstieg | P&L | R | Regeln | Score. `<td>${U.statusPill(t.status)}</td>` und `<td>${U.badge(t.direction)}</td>` entfallen. P&L-Zelle: `${!t.closed ? U.statusPill('open') : t.status === 'be' ? `<span class="neu">${fmt.cur(t.pnl, { signed: true, r: t.r })}</span>` : U.pnl(t.pnl, '', { r: t.r })}`. R-Zelle bei `t.status === 'be'`: `<span class="neu">${t.r != null ? fmt.r(t.r) : '—'}</span>`, sonst `U.rText(t.r)`
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: U.pnl] Die Regel aus kilook-A3 gilt überall: Ergebnisse laufen über U.pnl und tragen immer ein Vorzeichen, signed: false fällt weg (kilook-C9b Z. 166, kilook-C16 Z. 26). Disziplin-Kosten tragen ein Vorzeichen (farbe-C29). Break-even sieht in TradeLog und Tagesansicht gleich aus: `<span class="neu">${fmt.cur(t.pnl, { signed: true, r: t.r })}</span>`, offene Trades zeigen `U.statusPill('open')` (aufbau-C7c und C15a). Prop-Beträge bekommen { currency: a.currency } (siehe money). Im Notebook tragen alle P&L-Beträge die Klasse num: der Notizkopf (farbe-C24c), die Trade-Notiz in der Liste (zustaende-S-NB1) und ebenso die neue Tagesnotiz-Zeile aus aufbau-C10d. responsiv-3.10 und typografie-3.8h sind verträglich (Text von 3.8h siehe U.barRow).
- [reihenfolge: td.dir-cell] Symbol und Richtung stehen in zwei Zellen (td.sym + td.dir-cell) unter einem Kopf „Symbol“ mit colspan 2. Im TradeLog über COLS ['symbol', 'Symbol', '', 2] (aufbau-C15a), bei Verpassten Trades über das Markup (komponenten-S-trades-e); das Richtungs-Abzeichen bekommt span.bl (responsiv-3.2b). responsiv-3.7 baut auf der neuen Spaltenfolge auf: `PH = ['openedAt', 'symbol', 'pnl']`, die Schlüssel 'direction' und 'status' gibt es nicht mehr. td.dir-cell bekommt nie ph-hide (am Handy nur der Pfeil). Es gibt keine Status-Zelle mehr; ph-hide kommt an Geschlossen, Setup, Einstieg, Ausstieg, R, Regeln und Score. Die Datumszelle „Eröffnet“ bleibt bei typografie-3.8c (fmt.dateRow ist schon kurz), es gibt kein Paar aus ph-hide und ph-only.

## aufbau-C15d · Trade-Ansicht: Kopfreihe nur mit Rückweg und Trade loggen

Gruppe aufbau · Cluster trades_tag · Aufwand S · Befunde: bereich_trades_tag-16
Quelle: audit/spec/aufbau.md Z. 626–628 · Dateien: web/js/screens/trades.js
Abhängig von: aufbau-B1

```text
- `App.screens.trades` neu: `head: ctx => ctx.params[0] ? { range: false, account: false, session: false } : {},`
- `renderDetail` Z. 66: Die Zeile `<div class="row"><a class="btn ghost sm" href="#/trades">${I.back} TradeLog</a><span class="muted small">·</span><a … href="#/day/${t.dayKey}">${I.day} ${fmt.dateFull(t.open)}</a></div>` aus `head` entfernen. Stattdessen `ctx.headLeft = `<a class="btn ghost sm" href="#/trades">${I.back} TradeLog</a><span class="muted small">·</span><a class="btn ghost sm" href="#/day/${t.dayKey}">${I.day} ${fmt.dateFull(t.open)}</a>`;` setzen (render läuft vor pageHead, app.js:90)

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: ctx.headLeft] Tagesansicht: Die Datumszeile bleibt im Inhalt, ohne ctx.headLeft. aufbau K4 hat genau diese Variante verworfen, weil Datumstitel und Konto-Filter in einer Reihe vermischt würden, und sie hängt an F1 (komponenten-3/bereich_shell-8). Die Knöpfe „Check-in“ und „Trade für diesen Tag“ entfallen mit aufbau-C7b, „Zertifikat“ bleibt dort mit I.award, die Pille „Heute“ ist neutral (farbe-C20). Von abstaende-E-day2 bleibt nur der Inline-Stil des Datumstitels als Klasse: `<h2 class="day-title">` mit `.day-title { font-size: var(--fs-18); line-height: var(--lh-18); margin-left: var(--sp-1); }` (h2-Rolle 18/600, einzige Definition; .day-title in komponenten-C36 entfällt). Trade-Ansicht: Links steht der Rückweg per ctx.headLeft (aufbau-C15d). Die Seitenaktionen aus wording 9.11 kommen nicht in die Rückweg-Zeile, sondern als `actions(ctx)` rechts in die Kopfreihe; die Aufbau-Regel lautet „rechts Seitenaktionen → .dh-sep → Trade loggen“. Bei ctx.params[0]: Notiz-Knopf (`btn`, „Notiz öffnen“ bzw. „Notiz im Notebook“), `btn danger` „Löschen“, `btn` „Trade bearbeiten“ (Seitenebene = btn, nicht primary); ohne Trade-Datensatz ''. Ohne Parameter bleibt „CSV importieren“. pageHead (aufbau-B1), News (aufbau-C9a) und Affiliate (aufbau-C3) bleiben unverändert.

## aufbau-D3g · Test sampletest.js: Ergebnis über P&L-Farbe statt Status-Pille

Gruppe aufbau · Cluster trades_tag · Aufwand S · Befunde: bereich_trades_tag-18, hierarchie-16
Quelle: audit/spec/aufbau.md Z. 711–711 · Dateien: web/e2e/sampletest.js
Abhängig von: aufbau-C15a, aufbau-C7c

```text
- `sampletest.js:39–40`: geschlossene Zeilen über `td.r .pos, td.r .neg, td.r .neu` statt `.pill.win/.loss/.be`; offene über `.pill.open`
```

## diagramme-M1 · Zähler Gewinner/Verlierer in Tagesansicht und TradeLog nur bei > 0 gefärbt

Gruppe diagramme · Cluster trades_tag · Aufwand S · Befunde: bereich_notebook_news-18
Quelle: audit/spec/diagramme.md Z. 686–689 · Dateien: web/js/screens/day.js, web/js/screens/trades.js
Abhängig von: —

```text
**M1 Zähler** (bereich_notebook_news-18)
- day.js:14: `<span class="pos">${s.wins}</span> / <span class="neg">${s.losses}</span>` → `<span class="${s.wins ? 'pos' : ''}">${s.wins}</span> / <span class="${s.losses ? 'neg' : ''}">${s.losses}</span>`
- trades.js:54: dasselbe mit `d.wins` / `d.losses`.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .pos] Dieselbe Zählerfärbung steht wortgleich in mehreren Gruppen: Gewinner/Verlierer bzw. Gewinntage/Verlusttage nur bei > 0 als pos/neg, Tabellen-Zählspalten neutral. Betroffen sind day.js:14 (diagramme-M1, zustaende-S-DY2, farbe-C20), trades.js:54 (diagramme-M1, farbe-C31b) und stats.js:31/32 (diagramme-G3, farbe-C30). Sie wird einmal umgesetzt: diagramme-M1 für day.js:14 und trades.js:54, diagramme-G3 für stats.js:31/32, genau mit den dort genannten Werten. TradeLog-Regeln-Spalte trades.js:49: Klasse und Symbole nach farbe-C31a (Regel „✓ --muted, × --loss“). barrierefreiheit-C-trades-49 ergänzt nur die Namen: `<span class="rule-ic muted" role="img" aria-label="Alle Regeln eingehalten">${I.check}</span>` bzw. `<span class="rule-ic neg" role="img" aria-label="Gebrochen: ${esc(t.rulesBroken.join(', '))}" data-tip="${esc(t.rulesBroken.join(', '))}">${I.close}</span>`. Der row-link in der ersten Zelle bleibt wie in C-trades-49.
- [doppelt: .neg] Dieselben Schritte und dieselbe Entscheidung wie beim Anker .pos: Zähler einmal über diagramme-M1 (day.js:14, trades.js:54) und diagramme-G3 (stats.js:31/32). Das × in der Regeln-Spalte bekommt `rule-ic neg` (farbe-C31a) plus role="img" und aria-label „Gebrochen: …“ (barrierefreiheit-C-trades-49). Die Anpassungen stehen beim Anker .pos und werden nur einmal angewendet.

## zustaende-S-C18 · Tagesnotiz-Vorschau: Stile .nv und .nv-h

Gruppe zustaende · Cluster trades_tag · Aufwand S · Befunde: bereich_trades_tag-48
Quelle: audit/spec/zustaende.md Z. 364–366 · Dateien: web/css/app.css
Abhängig von: —

```text
**S-C18 Tagesnotiz-Vorschau** – bereich_trades_tag-48
Nach den Tagesansicht-/Notebook-Regeln (z. B. nach Z. 1144) neu: `.nv > div { margin: 0; } .nv-h { font-weight: 600; color: var(--text); margin-top: 8px; } .nv-h:first-child { margin-top: 0; }`

```

## zustaende-S-A5 · Check-in-Dialog: Knopf „Löschen“ mit Rückfrage „Check-in löschen?“

Gruppe zustaende · Cluster trades_tag · Aufwand S · Befunde: bereich_trades_tag-28
Quelle: audit/spec/zustaende.md Z. 570–573 · Dateien: web/js/app.js
Abhängig von: —

```text
**S-A5 Check-in löschen** – bereich_trades_tag-28
- Z. 524 (Check-in-Dialog) Knopftext `>Entfernen</button>` (an `data-action="delete-checkin"`) → `>Löschen</button>`.
- Z. 551 → `async 'delete-checkin'(el) { if (!await U.confirmModal('Check-in löschen?', 'Die Angaben dieses Check-ins werden gelöscht.', { ok: 'Löschen', danger: true })) return; const d = S.day(el.dataset.day); if (d) { delete d.checkIn; S.save(); } U.closeModal(); App.rerender(); },`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: U.confirmModal] Die Schnittstelle bleibt gleich: confirmModal(title, text, {ok, danger}) gibt ein Promise<boolean> zurück. U3a baut nur das Dialog-Gerüst um, U3b ergänzt data-autofocus (bei danger auf „Abbrechen“, sonst auf der Bestätigung). Alle fünf Aufrufe aus zustaende passen damit zusammen: Titel enden auf „?“, OK-Knopf „Löschen“/„Verwerfen“ mit danger (Z8). Es gibt eine echte Abhängigkeit: S-A5 öffnet die Rückfrage ÜBER dem Check-in-Dialog. Ohne P4 löst „Abbrechen“ bzw. × der Rückfrage zuerst den eigenen Listener aus (closeModal, Motion.leave lässt den Knopf noch im DOM). Danach greift der globale [data-close]-Handler (app.js:280) und schließt zusätzlich den Check-in-Dialog. Deshalb kommt P4 vor S-A5. S-A5 schließt nach „Löschen“ den Check-in-Dialog weiter direkt mit U.closeModal() und nicht über requestClose. So löst der guard aus P14b keine zweite Rückfrage „Änderungen verwerfen?“ aus. Der Fokus nach dem Schließen passt: In S-RP1 setzt .then(go) den Fokus als Microtask, bevor restoreAfterModal per setTimeout(0) läuft. restoreAfterModal sieht den gesetzten Fokus und tut nichts.

## zustaende-S-A6 · CSV-Import-Vorschau: „offen“ in .muted, fehlende Werte als „—“ in .faint

Gruppe zustaende · Cluster trades_tag · Aufwand S · Befunde: zustaende-24
Quelle: audit/spec/zustaende.md Z. 574–576 · Dateien: web/js/app.js
Abhängig von: —

```text
**S-A6 CSV-Vorschau Platzhalter** – zustaende-24
Z. 567: `'<span class="faint">offen</span>'` → `'<span class="muted">offen</span>'`; Ausstieg `: '—'` → `: '<span class="faint">—</span>'`; Netto-P&L `: '—'` → `: '<span class="faint">—</span>'`.

```

## zustaende-S-T3 · TradeLog: Leerzustand der Liste nach Lage (leeres Journal / Zeitraum / Filter)

Gruppe zustaende · Cluster trades_tag · Aufwand S · Befunde: wording-46
Quelle: audit/spec/zustaende.md Z. 648–650 · Dateien: web/js/screens/trades.js
Abhängig von: —

```text
**S-T3 Leerzustand der Liste** – wording-46
Z. 45 Titel `list.length ? 'Keine Trades passen zum Filter' : 'Keine Trades im Zeitraum'` → `list.length ? 'Keine Trades passen zum Filter' : App.allTrades().length ? 'Keine Trades im Zeitraum' : 'Noch keine Trades'`; Satz `list.length ? 'Ändere die Filter oder den Zeitraum.' : 'Logge einen Trade oder importiere eine CSV-Datei.'` → `list.length ? 'Ändere die Filter oder den Zeitraum.' : App.allTrades().length ? 'Ändere den Zeitraum oder logge Trades.' : 'Logge deinen ersten Trade oder importiere eine CSV-Datei.'`. Knöpfe unverändert.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: U.empty] (1) Check-in-Leerzustände nutzen I.mood: kilook-C13 in day.js:16, kilook-C14 in stats.js:61. kilook-C25 löscht I.sparkle; der Satz „Z. 61 Symbol sparkle bleibt“ in zustaende-S-ST2 gilt deshalb nicht. (2) Den Knopftext im Check-in-Leerzustand der Tagesansicht setzt aufbau-C7c einmal: `${key < C.dayKey(new Date()) ? 'Check-in nachtragen' : 'Check-in machen'}`. Für künftige Tage passt „nachtragen“ nicht. (3) Schatten-Ich-Ranking (diagramme-I1): Ein leerer Hinweis ist nicht erlaubt (zustaende Z1: nie ''), also `U.empty('shield', 'Keine Regel aktiv', 'Schalte oben im Regelwerk mindestens eine Regel ein.')`. Ohne Verstoß gibt es keinen zweiten Leerzustand „Keine Verstöße“, der steht schon in der Nachbarkarte „Regelverstöße“. Es bleibt nur die Zeile „Ohne Verstöße: …“. (4) TradeLog-Liste: `return (list.length ? filters : '') + U.empty('tradelog', …)` mit Titel und Satz nach zustaende-S-T3. wording 9.7 und S-T3 ergänzen sich in derselben Zeile. (5) Regeln im Fortschritt: siehe #/settings/regeln. Verträglich sind aufbau-C15c, wording 9.14, 12.6, 12.30, zustaende-S-DY1 und noTrades aus S-ST2.

## zustaende-S-T4 · TradeLog-Tabelle: fehlende Werte (Geschlossen, Ausstieg, Setup) als „—“ in .faint

Gruppe zustaende · Cluster trades_tag · Aufwand S · Befunde: zustaende-24
Quelle: audit/spec/zustaende.md Z. 651–654 · Dateien: web/js/screens/trades.js
Abhängig von: —

```text
**S-T4 Platzhalter in der Tabelle** – zustaende-24
- Z. 49 Spalte Geschlossen `'<span class="faint">offen</span>'` → `'<span class="faint">—</span>'`; Ausstieg `t.exitPrice != null ? fmt.price(t.exitPrice) : '—'` → `… : '<span class="faint">—</span>'`.
- Z. 59 Setup `x.setup ? U.chip(x.setup, 'setup') : '—'` → `… : '<span class="faint">—</span>'`.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: U.chip] 3.2c erweitert U.chip um den Parameter tip, und 3.7 und 3.8 rufen ihn auf. Deshalb kommt 3.2c zuerst. S-T4 und 3.7 ändern dieselbe Stelle trades.js:59; die Endform ist x.setup ? U.chip(x.setup, 'setup', x.setup.length > 20 ? x.setup : '') : '<span class="faint">—</span>'. In trades.js:49 ergänzen sich die ph-hide-Klassen aus 3.7 und „—“ in .faint für Geschlossen und Ausstieg aus S-T4. typografie-3.8l (join(' ') im Friedhof) hängt davon nicht ab.

## zustaende-S-T5 · Löschen mit Rückfrage: verpasster Trade, Screenshot vor Entry, Screenshot, Sprachnotiz

Gruppe zustaende · Cluster trades_tag · Aufwand S · Befunde: bereich_trades_tag-28
Quelle: audit/spec/zustaende.md Z. 655–661 · Dateien: web/js/screens/trades.js
Abhängig von: —

```text
**S-T5 Löschen mit Rückfrage** – bereich_trades_tag-28
Jeweils `async` machen und als erste Zeile die Rückfrage:
- Z. 113 `'delete-missed'` → `async 'delete-missed'(el) { if (!await U.confirmModal('Verpassten Trade löschen?', 'Der Eintrag wird dauerhaft entfernt.', { ok: 'Löschen', danger: true })) return; S.deleteMissed(el.dataset.id); App.rerender(); },`
- Z. 114 `'delete-pre-shot'`: `if (!await U.confirmModal('Screenshot vor Entry löschen?', 'Das Bild wird dauerhaft entfernt.', { ok: 'Löschen', danger: true })) return;`
- Z. 115 `'delete-shot'`: `if (!await U.confirmModal('Screenshot löschen?', 'Das Bild wird dauerhaft entfernt.', { ok: 'Löschen', danger: true })) return;`
- Z. 117 `'delete-voice'`: `if (!await U.confirmModal('Sprachnotiz löschen?', 'Aufnahme und Transkript werden dauerhaft entfernt.', { ok: 'Löschen', danger: true })) return;`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: U.confirmModal] Die Schnittstelle bleibt gleich: confirmModal(title, text, {ok, danger}) gibt ein Promise<boolean> zurück. U3a baut nur das Dialog-Gerüst um, U3b ergänzt data-autofocus (bei danger auf „Abbrechen“, sonst auf der Bestätigung). Alle fünf Aufrufe aus zustaende passen damit zusammen: Titel enden auf „?“, OK-Knopf „Löschen“/„Verwerfen“ mit danger (Z8). Es gibt eine echte Abhängigkeit: S-A5 öffnet die Rückfrage ÜBER dem Check-in-Dialog. Ohne P4 löst „Abbrechen“ bzw. × der Rückfrage zuerst den eigenen Listener aus (closeModal, Motion.leave lässt den Knopf noch im DOM). Danach greift der globale [data-close]-Handler (app.js:280) und schließt zusätzlich den Check-in-Dialog. Deshalb kommt P4 vor S-A5. S-A5 schließt nach „Löschen“ den Check-in-Dialog weiter direkt mit U.closeModal() und nicht über requestClose. So löst der guard aus P14b keine zweite Rückfrage „Änderungen verwerfen?“ aus. Der Fokus nach dem Schließen passt: In S-RP1 setzt .then(go) den Fokus als Microtask, bevor restoreAfterModal per setTimeout(0) läuft. restoreAfterModal sieht den gesetzten Fokus und tut nichts.

## zustaende-S-DY1 · Tagesansicht ungültige Adresse: Satz und Weg „Zum heutigen Tag“

Gruppe zustaende · Cluster trades_tag · Aufwand S · Befunde: bereich_trades_tag-44
Quelle: audit/spec/zustaende.md Z. 662–666 · Dateien: web/js/screens/day.js
Abhängig von: —

```text
### 3.12 `web/js/screens/day.js`

**S-DY1 Ungültige Adresse** – bereich_trades_tag-44
Z. 9 `U.empty('day', 'Ungültiges Datum', '')` → `U.empty('day', 'Ungültiges Datum', 'Die Adresse enthält kein gültiges Datum.', '<a class="btn sm" href="#/day">Zum heutigen Tag</a>')`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: U.empty] (1) Check-in-Leerzustände nutzen I.mood: kilook-C13 in day.js:16, kilook-C14 in stats.js:61. kilook-C25 löscht I.sparkle; der Satz „Z. 61 Symbol sparkle bleibt“ in zustaende-S-ST2 gilt deshalb nicht. (2) Den Knopftext im Check-in-Leerzustand der Tagesansicht setzt aufbau-C7c einmal: `${key < C.dayKey(new Date()) ? 'Check-in nachtragen' : 'Check-in machen'}`. Für künftige Tage passt „nachtragen“ nicht. (3) Schatten-Ich-Ranking (diagramme-I1): Ein leerer Hinweis ist nicht erlaubt (zustaende Z1: nie ''), also `U.empty('shield', 'Keine Regel aktiv', 'Schalte oben im Regelwerk mindestens eine Regel ein.')`. Ohne Verstoß gibt es keinen zweiten Leerzustand „Keine Verstöße“, der steht schon in der Nachbarkarte „Regelverstöße“. Es bleibt nur die Zeile „Ohne Verstöße: …“. (4) TradeLog-Liste: `return (list.length ? filters : '') + U.empty('tradelog', …)` mit Titel und Satz nach zustaende-S-T3. wording 9.7 und S-T3 ergänzen sich in derselben Zeile. (5) Regeln im Fortschritt: siehe #/settings/regeln. Verträglich sind aufbau-C15c, wording 9.14, 12.6, 12.30, zustaende-S-DY1 und noTrades aus S-ST2.

## zustaende-S-DY2 · Tagesansicht: Kennzahlen-Karte nur mit Trades, Spark nur mit abgeschlossenen, Null ohne Grün/Rot

Gruppe zustaende · Cluster trades_tag · Aufwand S · Befunde: hierarchie-18, zustaende-25
Quelle: audit/spec/zustaende.md Z. 667–669 · Dateien: web/js/screens/day.js
Abhängig von: —

```text
**S-DY2 Kennzahlen-Karte nur mit Trades** – hierarchie-18 (mit zustaende-25)
Z. 14: `const stats = U.card('', …);` → `const stats = trades.length ? U.card('', …) : '';`. In der Karte die Spark-Zelle `<div class="grow chart h80" data-chart="spark" data-id="${id}" style="min-width:160px"></div>` nur bei `closed.length` ausgeben, sonst `''`. Gewinner/Verlierer `<span class="pos">${s.wins}</span> / <span class="neg">${s.losses}</span>` → `<span class="${s.wins ? 'pos' : ''}">${s.wins}</span> / <span class="${s.losses ? 'neg' : ''}">${s.losses}</span>`. Kein zusätzlicher Knopf im Leerzustand der Trade-Karte.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .pos] Dieselbe Zählerfärbung steht wortgleich in mehreren Gruppen: Gewinner/Verlierer bzw. Gewinntage/Verlusttage nur bei > 0 als pos/neg, Tabellen-Zählspalten neutral. Betroffen sind day.js:14 (diagramme-M1, zustaende-S-DY2, farbe-C20), trades.js:54 (diagramme-M1, farbe-C31b) und stats.js:31/32 (diagramme-G3, farbe-C30). Sie wird einmal umgesetzt: diagramme-M1 für day.js:14 und trades.js:54, diagramme-G3 für stats.js:31/32, genau mit den dort genannten Werten. TradeLog-Regeln-Spalte trades.js:49: Klasse und Symbole nach farbe-C31a (Regel „✓ --muted, × --loss“). barrierefreiheit-C-trades-49 ergänzt nur die Namen: `<span class="rule-ic muted" role="img" aria-label="Alle Regeln eingehalten">${I.check}</span>` bzw. `<span class="rule-ic neg" role="img" aria-label="Gebrochen: ${esc(t.rulesBroken.join(', '))}" data-tip="${esc(t.rulesBroken.join(', '))}">${I.close}</span>`. Der row-link in der ersten Zelle bleibt wie in C-trades-49.
- [doppelt: .neg] Dieselben Schritte und dieselbe Entscheidung wie beim Anker .pos: Zähler einmal über diagramme-M1 (day.js:14, trades.js:54) und diagramme-G3 (stats.js:31/32). Das × in der Regeln-Spalte bekommt `rule-ic neg` (farbe-C31a) plus role="img" und aria-label „Gebrochen: …“ (barrierefreiheit-C-trades-49). Die Anpassungen stehen beim Anker .pos und werden nur einmal angewendet.
- [konflikt: U.card] (1) Statistik-Kurve: Platz und Titel folgen aufbau-C14b, also erste Karte in „Übersicht“, Titel „Kumulierter Netto-P&L“, h240, ohne Legende; über dem Inhalt stehen nur die Reiter. Der Inhalt folgt diagramme-G1/A-14: ein Punkt je Handelstag, kein fillDays. „Nur mit abgeschlossenen Trades“ ist durch die Leer-Prüfung am Anfang von tabSummary erfüllt (zustaende-S-ST2). zustaende-S-ST1 entfällt, fillDays löscht diagramme-G2. (2) Tagesansicht, Kennzahlenkarte: nur mit Trades, die Spark nur mit abgeschlossenen Trades (zustaende-S-DY2). Gewinner und Verlierer werden nur bei > 0 gefärbt, das setzt farbe-C20 einmal um. (3) Fortschritt: Die Karte heißt „Regeltreue“ (wording 8.6) und hat den Inhalt aus kilook-C18 („—“ ohne Grundlage, Ring nur mit Wert). Die Prüflisten (aufbau Prüfung Z. 750, README in kilook-C28) nennen „Regeltreue“. (4) „Aktuelle Regeln“ entfällt (siehe #/settings/regeln), die Tage-Tabelle steht in „Tage im Detail“ (siehe .tbl-wrap.inset). Verträglich sind aufbau-B8 (h2), abstaende-I3, komponenten-S-prop-c, wording-S10.1-10.7 und wording-S11.6-11.11.
- VERBINDLICH (Kreuzprüfung): web/js/screens/day.js Z. 14: `const stats = U.card('', …);` → `const stats = trades.length ? U.card('', …) : '';`. In der Karte die Spark-Zelle `<div class="grow chart h80" data-chart="spark" data-id="${id}" style="min-width:160px"></div>` nur bei `closed.length` ausgeben, sonst ''. Kein zusätzlicher Knopf im Leerzustand der Trade-Karte. Die Färbung Gewinner/Verlierer nur bei > 0 hier NICHT umsetzen; sie wird an anderer Stelle genau einmal umgesetzt (diagramme-M1 bzw. farbe-C20 mit identischem Ergebnis).

## zustaende-S-DY4 · Tagesnotiz-Vorschau mit Überschriften als eigene Zeilen (notePreview)

Gruppe zustaende · Cluster trades_tag · Aufwand M · Befunde: bereich_trades_tag-48
Quelle: audit/spec/zustaende.md Z. 673–694 · Dateien: web/js/screens/day.js
Abhängig von: zustaende-S-C18

```text
**S-DY4 Notiz-Vorschau mit Überschriften** – bereich_trades_tag-48
Oben im Modul neu:
```js
function notePreview(content, max = 320) {
  const lines = []; let buf = '';
  for (const op of (content && content.ops) || []) {
    if (typeof op.insert !== 'string') continue; /* Bilder und andere Einbettungen auslassen */
    const parts = op.insert.split('\n');
    parts.forEach((p, i) => { buf += p; if (i < parts.length - 1) { lines.push({ t: buf.trim(), h: !!(op.attributes && op.attributes.header) }); buf = ''; } });
  }
  if (buf.trim()) lines.push({ t: buf.trim(), h: false });
  let n = 0; const out = [];
  for (const l of lines.filter(x => x.t)) {
    if (n >= max) { out[out.length - 1] = out[out.length - 1].replace(/<\/div>$/, ' …</div>'); break; }
    const cut = n + l.t.length > max; const s = cut ? l.t.slice(0, max - n) + ' …' : l.t; n += l.t.length;
    out.push(`<div${l.h ? ' class="nv-h"' : ''}>${esc(s)}</div>`); if (cut) break;
  }
  return out.join('');
}
```
Z. 19: `const preview = dn ? S.deltaText(dn.content).trim().slice(0, 320) : '';` → `const preview = dn ? notePreview(dn.content) : '';` und `<div style="white-space:pre-wrap">${preview ? esc(preview) + (… ' …' …) : '<span class="faint">Noch leer.</span>'}</div>` → `<div class="nv">${preview || '<span class="faint">Noch leer.</span>'}</div>`.

```

## barrierefreiheit-P14c · Regel-Checkliste in „Session beenden“: Checkbox .vh statt .hidden, done vorbelegt

Gruppe barrierefreiheit · Cluster trades_tag · Aufwand S · Befunde: barrierefreiheit-14
Quelle: audit/spec/barrierefreiheit.md Z. 679–682 · Dateien: web/js/app.js
Abhängig von: barrierefreiheit-B5

```text
- Z. 531 vorher: `<label class="it toggle"><input type="checkbox" name="rule" value="${r.id}" ${…'checked'…} class="hidden">`
  nachher: `<label class="it toggle${followed.includes(r.id) ? ' done' : ''}"><input type="checkbox" name="rule" value="${r.id}" ${followed.includes(r.id) ? 'checked' : ''} class="vh">` (der change-Listener Z. 553 hält `done` danach aktuell)
- Befunde: barrierefreiheit-12, barrierefreiheit-14, barrierefreiheit-11

```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: App.openSessionEnd] kilook-C8c setzt app.js:530 einmal um: dreimal `<div class="kpi-label">` mit den Beschriftungen „Heute“, „Trades“, „Trefferquote“ (Wording-Glossar, nie „Win-Rate“). guard: true (P14b, Z. 529), die Checkbox .vh mit done (P14c, Z. 531) und der Hinweis .lbl-hint (farbe-C12c, Z. 533) betreffen andere Stellen und sind verträglich.

## barrierefreiheit-C-trades-46 · TradeLog-Sortierköpfe mit Knopf .th-sort, aria-sort und Chevron

Gruppe barrierefreiheit · Cluster trades_tag · Aufwand S · Befunde: barrierefreiheit-33, zustaende-36, typografie-30
Quelle: audit/spec/barrierefreiheit.md Z. 742–747 · Dateien: web/js/screens/trades.js
Abhängig von: barrierefreiheit-B7

```text
#### `web/js/screens/trades.js`

- **Z. 46 Sortierköpfe**
  - vorher: `` <th class="sortable ${al || ''}" data-action="trade-sort" data-key="${k}">${l}${key === k ? `<span class="dir">${dir > 0 ? '▲' : '▼'}</span>` : ''}</th> ``
  - nachher: `` <th class="sortable ${al || ''}" data-action="trade-sort" data-key="${k}"${key === k ? ` aria-sort="${dir > 0 ? 'ascending' : 'descending'}"` : ''}><button type="button" class="th-sort" data-action="trade-sort" data-key="${k}">${l}${key === k ? `<span class="dir${dir > 0 ? ' up' : ''}" aria-hidden="true">${I.chev}</span>` : ''}</button></th> ``
  - Befunde: barrierefreiheit-33, zustaende-36, typografie-30
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .tbl th .dir] Der Sortierpfeil wird ein Chevron-SVG mit 12 × 12 px (barrierefreiheit-B7): `.tbl th .dir { display: inline-flex; margin-left: 4px; color: var(--text-2); }` ohne font-size, dazu `.tbl th .dir svg { width: 12px; height: 12px; }` und `.tbl th .dir.up svg { transform: rotate(180deg); }`. ▲/▼ werden durch I.chev im Knopf .th-sort ersetzt, und .dir kommt nur in trades.js vor. Die Schriftgröße 11 px aus typografie-3.2.3b wäre deshalb ein toter Wert (Kilook Z11: kein toter Code).

## barrierefreiheit-C-trades-49 · TradeLog-Zeile: Link in der ersten Zelle, Regeln-Spalte als role=img

Gruppe barrierefreiheit · Cluster trades_tag · Aufwand S · Befunde: barrierefreiheit-4, zustaende-36, barrierefreiheit-34
Quelle: audit/spec/barrierefreiheit.md Z. 748–751 · Dateien: web/js/screens/trades.js
Abhängig von: barrierefreiheit-B7

```text
- **Z. 49 Zeile**
  - erste Zelle: `<td>${fmt.dateFull(t.open)} <span class="muted">${fmt.time(t.open)}</span></td>` → `<td><a class="row-link" href="#/trades/${t.id}">${fmt.dateFull(t.open)} <span class="muted">${fmt.time(t.open)}</span></a></td>`
  - Regeln-Zelle: `<span class="neg" data-tip="…">` → `<span class="neg" role="img" aria-label="Gebrochen: ${esc(t.rulesBroken.join(', '))}" data-tip="…">` und `<span class="pos">` → `<span class="pos" role="img" aria-label="Alle Regeln eingehalten">`
  - Befunde: barrierefreiheit-4, zustaende-36, barrierefreiheit-34
```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .pos] Dieselbe Zählerfärbung steht wortgleich in mehreren Gruppen: Gewinner/Verlierer bzw. Gewinntage/Verlusttage nur bei > 0 als pos/neg, Tabellen-Zählspalten neutral. Betroffen sind day.js:14 (diagramme-M1, zustaende-S-DY2, farbe-C20), trades.js:54 (diagramme-M1, farbe-C31b) und stats.js:31/32 (diagramme-G3, farbe-C30). Sie wird einmal umgesetzt: diagramme-M1 für day.js:14 und trades.js:54, diagramme-G3 für stats.js:31/32, genau mit den dort genannten Werten. TradeLog-Regeln-Spalte trades.js:49: Klasse und Symbole nach farbe-C31a (Regel „✓ --muted, × --loss“). barrierefreiheit-C-trades-49 ergänzt nur die Namen: `<span class="rule-ic muted" role="img" aria-label="Alle Regeln eingehalten">${I.check}</span>` bzw. `<span class="rule-ic neg" role="img" aria-label="Gebrochen: ${esc(t.rulesBroken.join(', '))}" data-tip="${esc(t.rulesBroken.join(', '))}">${I.close}</span>`. Der row-link in der ersten Zelle bleibt wie in C-trades-49.
- ÄNDERN: In der Regeln-Zelle die Klassen und Symbole aus farbe-C31a übernehmen (`rule-ic muted` für ✓, `rule-ic neg` für ×, ohne Inline-Größe am SVG). Nur role="img" und aria-label ergänzen, nicht class="pos" setzen. Erste Zelle mit a.row-link wie spezifiziert.
- [doppelt: .neg] Dieselben Schritte und dieselbe Entscheidung wie beim Anker .pos: Zähler einmal über diagramme-M1 (day.js:14, trades.js:54) und diagramme-G3 (stats.js:31/32). Das × in der Regeln-Spalte bekommt `rule-ic neg` (farbe-C31a) plus role="img" und aria-label „Gebrochen: …“ (barrierefreiheit-C-trades-49). Die Anpassungen stehen beim Anker .pos und werden nur einmal angewendet.

## barrierefreiheit-C-trades-50 · TradeLog-Scrollbox als benannte Region „Trades“

Gruppe barrierefreiheit · Cluster trades_tag · Aufwand S · Befunde: barrierefreiheit-50
Quelle: audit/spec/barrierefreiheit.md Z. 752–752 · Dateien: web/js/screens/trades.js
Abhängig von: barrierefreiheit-B7

```text
- **Z. 50:** `<div class="tbl-scroll">` → `<div class="tbl-scroll" tabindex="0" role="region" aria-label="Trades">` (Befund: barrierefreiheit-50)
```

## barrierefreiheit-C-trades-59 · Verpasste Trades: eindeutiger Lösch-Name

Gruppe barrierefreiheit · Cluster trades_tag · Aufwand S · Befunde: barrierefreiheit-35
Quelle: audit/spec/barrierefreiheit.md Z. 753–753 · Dateien: web/js/screens/trades.js
Abhängig von: —

```text
- **Z. 59:** `aria-label="Löschen"` → `aria-label="Verpassten Trade ${esc(x.symbol)} vom ${fmt.dateFull(C.parseDayKey(x.date))} löschen"` (Befund: barrierefreiheit-35)
```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: C.parseDayKey] E3 und B6 sind dieselbe Änderung, B6 übernimmt (siehe App.actions['new-trade']). barrierefreiheit-C-trades-59 nutzt C.parseDayKey nur für den Lösch-Namen der verpassten Trades und ist verträglich.

## barrierefreiheit-C-day-15 · Tagesansicht-Zeile: Link in der ersten Zelle

Gruppe barrierefreiheit · Cluster trades_tag · Aufwand S · Befunde: barrierefreiheit-4, zustaende-36
Quelle: audit/spec/barrierefreiheit.md Z. 759–761 · Dateien: web/js/screens/day.js
Abhängig von: barrierefreiheit-B7

```text
#### `web/js/screens/day.js`

- **Z. 15:** erste Zelle `<td>${fmt.time(t.open)}${…}</td>` → `` <td><a class="row-link" href="#/trades/${t.id}">${fmt.time(t.open)}${t.close ? ` – ${fmt.time(t.close)}` : ''}</a></td> `` (Befunde: barrierefreiheit-4, zustaende-36)
```

## responsiv-B5a · Trades des Tages: Mindestbreite als Klasse .tbl.day-tbl

Gruppe responsiv · Cluster trades_tag · Aufwand S · Befunde: responsiv-7
Quelle: audit/spec/responsiv.md Z. 286–287 · Dateien: web/css/app.css
Abhängig von: —

```text
**B5 Tabellen** (zustaende-31, zustaende-32, responsiv-7, responsiv-3)
- Nach Z. 615 neu: `.tbl.day-tbl { min-width: 560px; } /* Trades des Tages: früher Inline-Stil in day.js */`
```

## responsiv-C2 · TradeLog-Filterzeile: Auswahlfelder max. 200 px, Zähler bricht nicht allein um

Gruppe responsiv · Cluster trades_tag · Aufwand S · Befunde: zustaende-30
Quelle: audit/spec/responsiv.md Z. 389–391 · Dateien: web/css/app.css
Abhängig von: —

```text
**C2 TradeLog-Filterzeile** (zustaende-30)
- Nach Z. 1743 neu: `.tl-filters .select { max-width: 200px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; } .tl-count { margin-left: auto; white-space: nowrap; flex: 0 0 auto; }`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .tl-filters] wording-S9.3-9.7 setzt das Markup der Filterzeile einmal um: `row tl-filters` > `grow tl-search` + `tl-sel` (Selects und Zurücksetzen) + `muted small tl-count`, „Trades durchsuchen“, Zähler mit U.count, Filterzeile nur mit Trades. responsiv-3.7 setzt dieselben Klassen tl-filters und tl-count; dieser Teil entfällt dort. Das CSS aus responsiv-C2 bleibt (`.tl-filters .select { max-width: 200px; … }`, `.tl-count { margin-left: auto; white-space: nowrap; flex: 0 0 auto; }`). Es greift auch innerhalb von .tl-sel und muss stehen, bevor das Inline-`margin-left:auto` wegfällt.
- [doppelt: .tl-count] Wie bei .tl-filters: Die Klasse tl-count setzt wording-S9.3-9.7, die Regel `.tl-count { margin-left: auto; white-space: nowrap; flex: 0 0 auto; }` kommt aus responsiv-C2. Der Zähler-Teil von responsiv-3.7 entfällt (Anpassung unter .tl-filters).

## wording-S3.6 · app.css: TradeLog-Filter am Desktop (.tl-search, .tl-sel display: contents)

Gruppe wording · Cluster trades_tag · Aufwand S · Befunde: bereich_trades_tag-35
Quelle: audit/spec/wording.md Z. 332–332 · Dateien: web/css/app.css
Abhängig von: —

```text
| 3.6 | TradeLog-Filter (bei den TradeLog-Regeln, um Z. 1743) | – → `.tl-search { max-width: 260px; position: relative; }` · `.tl-sel { display: contents; }` | bereich_trades_tag-35 |
```

## wording-S5.4-5.5 · Trade-Dialog: „Geschlossen“ mit Leertext „Offen“ und Touch-Hinweis, Bestätigungsknopf „Trade loggen“

Gruppe wording · Cluster trades_tag · Aufwand S · Befunde: wording-62, wording-2, wording-63
Quelle: audit/spec/wording.md Z. 356–357 · Dateien: web/js/app.js
Abhängig von: wording-S3.1-3.3, wording-S4.1-4.5

```text
| 5.4 | app.js:360 Feld Geschlossen | `<label for="f-close">Geschlossen <span class="faint">(leer = offen)</span></label><input class="input" type="datetime-local" id="f-close" …>` → `<label for="f-close">Geschlossen <span class="faint dp-coarse">(leer lassen, solange offen)</span></label><input class="input" type="datetime-local" id="f-close" data-empty="Offen" …>` | wording-62, wording-2 |
| 5.5 | app.js:368 Bestätigungsknopf | `${trade ? 'Speichern' : 'Trade speichern'}` → `${trade ? 'Speichern' : 'Trade loggen'}` | wording-63 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: App.openTradeEditor] Alle Schritte ändern dieselbe Vorlage. Darum gilt eine feste Reihenfolge, und zwei Doppelungen werden zusammengelegt. (1) komponenten-A5b löst Symbol und Richtung in App.symbolField und App.dirField heraus. (2) abstaende-E2 entfernt die Wrapper. Die Klasse tf-dir gehört in App.dirField: <div class="field tf-dir">…</div>. Im Verpasst-Dialog wirkt sie nicht, denn die CSS-Regeln greifen nur unter .tf-main >. (3) wording-S5.4-5.5 setzt das Feld Geschlossen und übernimmt dabei farbe-C12a: <div class="field tf-c3 tf-dt"><label for="f-close">Geschlossen <span class="lbl-hint dp-coarse">(leer lassen, solange offen)</span></label><input class="input" type="datetime-local" id="f-close" name="closedAt" data-empty="Offen" value="…"></div>. Die Klasse ist lbl-hint statt faint, weil --faint nie für Wörter steht. Der Knopftext wird ${trade ? 'Speichern' : 'Trade loggen'}, die Klasse bleibt btn primary. Wie die Bestätigen-Knöpfe aussehen, ist Nutzerfrage komponenten-1 und wird hier nicht geändert. (4) barrierefreiheit-P12 (Restteil): Punktwert-(i) in .lbl-row innerhalb von <div class="field tf-c3"> und guard: true. (5) zustaende-S-A4: novalidate und Prüfung (siehe #trade-form). abstaende-E3, aufbau-B6 und wording-S5.3 sind unter App.actions['new-trade'] entschieden, wording-S5.9 unter app.html keydown.
- ÜBERNIMMT farbe-C12a: Der Wechsel faint → lbl-hint geschieht in wording-S5.4. Ergebnis: <span class="lbl-hint dp-coarse">(leer lassen, solange offen)</span>.
- ÄNDERN: In 5.4 bekommt der Span die Klasse "lbl-hint dp-coarse" (statt "faint dp-coarse"). Text und data-empty="Offen" bleiben wie in der Spezifikation. In 5.5 ändert sich nur der Text ('Trade loggen'), die Klasse bleibt btn primary.
- [doppelt: #f-close] Das Feld bekommt data-empty="Offen" (wording-S5.4, Markup unter App.openTradeEditor). Ohne Wert zeigt das Overlay „Offen“ in --muted, auf Touch setzt DatePicker den Anfangszustand is-empty. zustaende-S-DP (class="input is-empty" in app.js) entfällt.

## wording-S8.1-8.2 · Tagesansicht-Kopf: „Check-in“ und „Trade für diesen Tag“ streichen, Aktion new-trade-day entfernen, Tooltip „Tageszertifikat erstellen“

Gruppe wording · Cluster trades_tag · Aufwand S · Befunde: wording-5, wording-45, bereich_trades_tag-37
Quelle: audit/spec/wording.md Z. 406–411 · Dateien: web/js/screens/day.js
Abhängig von: wording-S5.3

```text
### Schritt 8 · `web/js/screens/day.js` und `web/js/screens/progress.js`

| # | Stelle | vorher → nachher | ids |
|---|---|---|---|
| 8.1 | day.js:12 Kopfzeile | Knopf `<button … data-action="check-in" …>${I.sparkle} ${d.checkIn ? 'Check-in bearbeiten' : 'Check-in'}</button>` und Knopf `<button … class="btn sm accent" data-action="new-trade-day" …>${I.plus} Trade für diesen Tag</button>` ersatzlos streichen. Am Zertifikat-Knopf `data-tip="Daily Profit Certificate"` → `data-tip="Tageszertifikat erstellen"`. Knopf bleibt immer sichtbar. Gilt am neuen Ort, falls referenz-17 vorher umgesetzt ist | wording-5, wording-45, bereich_trades_tag-37 |
| 8.2 | day.js:24 | Aktion `'new-trade-day'` streichen (übernommen von 5.3) | wording-5 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .btn.accent] .btn.accent steht nur noch für „Trade loggen“ (App.newTradeButton `.btn.accent.tl` und der runde Handy-Knopf). Aktiver Dashboard-Filter: Klasse `is-on`. So steht es in zustaende-S-D2/-S-C7, kollisionsfrei und im gemeinsamen Ausgewählt-Stil. farbe-C19b/-B25 nennen denselben Zustand `.dh-context .btn.is-set`; das entfällt. Das aria-label „Filter ({0} aktiv)“ aus farbe-C19b bleibt. TradeLog-Leerzustand „Trade loggen“: neutral `btn sm` (komponenten-S-trades-b). Gründe: Die Kopfreihe trägt „Trade loggen“ schon, die Farbe-Spezifikation selbst verlangt „1 je Ansicht“, BRIEF spricht von dem einen Hauptknopf, und Leerzustand-Aktionen sind btn sm. „Trade für diesen Tag“ entfällt (wording-S8.1-8.2). Damit ist jedes .btn.accent ein Hauptknopf: `.btn.accent` font-weight 600 → 700 direkt, ohne eigene Regel `.btn.accent.tl`; die wäre eine wirkungslose Doppelregel. Der aktive Filter (is-on) bleibt 500 wie jeder Knopf, also nicht fetter.
