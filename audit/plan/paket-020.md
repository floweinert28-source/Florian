# Paket 020 · trades_tag, shell

Schritte: 34 · Dateien: web/README.md, web/app.html, web/css/app.css, web/e2e/sampletest.js, web/js/app.js, web/js/screens/day.js, web/js/screens/trades.js
Betroffene Tests laut Spezifikation: web/e2e/mentortest.js:21 (bleibt grün); web/e2e/rptest.js:10 (bleibt grün); web/e2e/sampletest.js:39-40
Baut auf Paketen auf: 2, 5, 6, 9, 19

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

## aufbau-C7b · Tagesansicht: Datumszeile ohne Check-in- und Tagestrade-Knopf, Zertifikat award

Gruppe aufbau · Cluster trades_tag · Aufwand S · Befunde: hierarchie-15, hierarchie-7, responsiv-22, bereich_dashboard-23
Quelle: audit/spec/aufbau.md Z. 478–478 · Dateien: web/js/screens/day.js
Abhängig von: aufbau-B6, aufbau-B9

```text
- Z. 12 `nav`: den Knopf `data-action="check-in"` (`Check-in` / `Check-in bearbeiten`) und den Knopf `data-action="new-trade-day"` (`Trade für diesen Tag`) entfernen. `${I.shield} Zertifikat` → `${I.award} Zertifikat`.
```

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

## aufbau-C15b · TradeLog: Kacheln folgen Suche und Filter („Gefiltert · {0} Trades“)

Gruppe aufbau · Cluster trades_tag · Aufwand S · Befunde: bereich_trades_tag-33
Quelle: audit/spec/aufbau.md Z. 617–617 · Dateien: web/js/screens/trades.js
Abhängig von: —

```text
- `render` Z. 23–26: nach `const list = ctx.inRange;` → `const shown = view === 'trades' ? filtered(list) : list; const s = C.summary(shown);`; Z. 24 `W.data(ctx, App)` → `W.data(Object.assign({}, ctx, { inRange: shown }), App)`; Netto-Kachel `${s.n} Trades` → `${shown.length < list.length ? `Gefiltert · ${s.n} Trades` : `${s.n} Trades`}`
```

## aufbau-C15c · Verpasste Trades folgen Zeitraum und Konto, Leerzustand, .kpi-label

Gruppe aufbau · Cluster trades_tag · Aufwand M · Befunde: bereich_trades_tag-27, typografie-4
Quelle: audit/spec/aufbau.md Z. 618–625 · Dateien: web/js/screens/trades.js
Abhängig von: aufbau-A3a

```text
- `renderMissed` Z. 57:
  ```js
  const r = App.range(); const acc = S.settings.accountId; const all = S.data.missed;
  const m = all.filter(x => (!r.from || (x.date >= C.dayKey(r.from) && x.date <= C.dayKey(r.to))) && (!x.accountId || !acc || acc === 'all' || x.accountId === acc)).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  if (!m.length) return all.length ? U.empty('eye', 'Keine verpassten Trades im Zeitraum', 'Ändere den Zeitraum oder das Konto.') : U.empty('eye', 'Keine verpassten Trades notiert', 'Setups, die du gesehen, aber nicht gehandelt hast. So erkennst du, ob Zögern dich Geld kostet.');
  ```
  Z. 59: `<div class="caption">Entgangen</div>`, `<div class="caption">Wären Gewinner gewesen</div>` → `class="kpi-label"`
- `'save-missed'` (Z. 112): ins gespeicherte Objekt `accountId: S.defaultAccountId()` aufnehmen
```

## aufbau-C15d · Trade-Ansicht: Kopfreihe nur mit Rückweg und Trade loggen

Gruppe aufbau · Cluster trades_tag · Aufwand S · Befunde: bereich_trades_tag-16
Quelle: audit/spec/aufbau.md Z. 626–628 · Dateien: web/js/screens/trades.js
Abhängig von: aufbau-B1

```text
- `App.screens.trades` neu: `head: ctx => ctx.params[0] ? { range: false, account: false, session: false } : {},`
- `renderDetail` Z. 66: Die Zeile `<div class="row"><a class="btn ghost sm" href="#/trades">${I.back} TradeLog</a><span class="muted small">·</span><a … href="#/day/${t.dayKey}">${I.day} ${fmt.dateFull(t.open)}</a></div>` aus `head` entfernen. Stattdessen `ctx.headLeft = `<a class="btn ghost sm" href="#/trades">${I.back} TradeLog</a><span class="muted small">·</span><a class="btn ghost sm" href="#/day/${t.dayKey}">${I.day} ${fmt.dateFull(t.open)}</a>`;` setzen (render läuft vor pageHead, app.js:90)

```

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

## zustaende-S-A6 · CSV-Import-Vorschau: „offen“ in .muted, fehlende Werte als „—“ in .faint

Gruppe zustaende · Cluster trades_tag · Aufwand S · Befunde: zustaende-24
Quelle: audit/spec/zustaende.md Z. 574–576 · Dateien: web/js/app.js
Abhängig von: —

```text
**S-A6 CSV-Vorschau Platzhalter** – zustaende-24
Z. 567: `'<span class="faint">offen</span>'` → `'<span class="muted">offen</span>'`; Ausstieg `: '—'` → `: '<span class="faint">—</span>'`; Netto-P&L `: '—'` → `: '<span class="faint">—</span>'`.

```

## zustaende-S-T2 · TradeLog: Zähler „{x} von {y} Trades“ nur bei aktivem Filter, Seitenwähler bei einer Seite reduziert

Gruppe zustaende · Cluster trades_tag · Aufwand S · Befunde: zustaende-37
Quelle: audit/spec/zustaende.md Z. 642–647 · Dateien: web/js/screens/trades.js
Abhängig von: —

```text
**S-T2 Zähler und Seitenwähler** – zustaende-37 (Teile 1 und 2)
- In `renderTable` nach `const f = App.state.tradeFilter;` neu: `const active = !!(f.q || f.symbol || f.setup || f.status || f.mistake);`
- Z. 44 `<span class="muted small" style="margin-left:auto">${rows.length} von ${list.length} Trades</span>` → `${active ? `<span class="muted small" style="margin-left:auto">${rows.length} von ${list.length} Trades</span>` : ''}`
- Z. 48 `pager`: nach dem Label „Trades pro Seite“ bei `pages > 1` alles wie bisher (`pg-sep`, `pg-info` „{from} – {to} von {n} Trades“, `grow`, Seitenwahl mit „von N Seiten“, `pg-nav`). Bei `pages <= 1`: `${active ? '' : `<span class="pg-sep"></span><span class="pg-info">${rows.length} Trade${rows.length === 1 ? '' : 's'}</span>`}` und sonst nichts. „Trades pro Seite“ steht immer.
- Teil 3 (Box schrumpft) siehe Abschnitt 6.

```

## zustaende-S-T3 · TradeLog: Leerzustand der Liste nach Lage (leeres Journal / Zeitraum / Filter)

Gruppe zustaende · Cluster trades_tag · Aufwand S · Befunde: wording-46
Quelle: audit/spec/zustaende.md Z. 648–650 · Dateien: web/js/screens/trades.js
Abhängig von: —

```text
**S-T3 Leerzustand der Liste** – wording-46
Z. 45 Titel `list.length ? 'Keine Trades passen zum Filter' : 'Keine Trades im Zeitraum'` → `list.length ? 'Keine Trades passen zum Filter' : App.allTrades().length ? 'Keine Trades im Zeitraum' : 'Noch keine Trades'`; Satz `list.length ? 'Ändere die Filter oder den Zeitraum.' : 'Logge einen Trade oder importiere eine CSV-Datei.'` → `list.length ? 'Ändere die Filter oder den Zeitraum.' : App.allTrades().length ? 'Ändere den Zeitraum oder logge Trades.' : 'Logge deinen ersten Trade oder importiere eine CSV-Datei.'`. Knöpfe unverändert.

```

## zustaende-S-T4 · TradeLog-Tabelle: fehlende Werte (Geschlossen, Ausstieg, Setup) als „—“ in .faint

Gruppe zustaende · Cluster trades_tag · Aufwand S · Befunde: zustaende-24
Quelle: audit/spec/zustaende.md Z. 651–654 · Dateien: web/js/screens/trades.js
Abhängig von: —

```text
**S-T4 Platzhalter in der Tabelle** – zustaende-24
- Z. 49 Spalte Geschlossen `'<span class="faint">offen</span>'` → `'<span class="faint">—</span>'`; Ausstieg `t.exitPrice != null ? fmt.price(t.exitPrice) : '—'` → `… : '<span class="faint">—</span>'`.
- Z. 59 Setup `x.setup ? U.chip(x.setup, 'setup') : '—'` → `… : '<span class="faint">—</span>'`.

```

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

## zustaende-S-DY1 · Tagesansicht ungültige Adresse: Satz und Weg „Zum heutigen Tag“

Gruppe zustaende · Cluster trades_tag · Aufwand S · Befunde: bereich_trades_tag-44
Quelle: audit/spec/zustaende.md Z. 662–666 · Dateien: web/js/screens/day.js
Abhängig von: —

```text
### 3.12 `web/js/screens/day.js`

**S-DY1 Ungültige Adresse** – bereich_trades_tag-44
Z. 9 `U.empty('day', 'Ungültiges Datum', '')` → `U.empty('day', 'Ungültiges Datum', 'Die Adresse enthält kein gültiges Datum.', '<a class="btn sm" href="#/day">Zum heutigen Tag</a>')`

```

## zustaende-S-DY2 · Tagesansicht: Kennzahlen-Karte nur mit Trades, Spark nur mit abgeschlossenen, Null ohne Grün/Rot

Gruppe zustaende · Cluster trades_tag · Aufwand S · Befunde: hierarchie-18, zustaende-25
Quelle: audit/spec/zustaende.md Z. 667–669 · Dateien: web/js/screens/day.js
Abhängig von: —

```text
**S-DY2 Kennzahlen-Karte nur mit Trades** – hierarchie-18 (mit zustaende-25)
Z. 14: `const stats = U.card('', …);` → `const stats = trades.length ? U.card('', …) : '';`. In der Karte die Spark-Zelle `<div class="grow chart h80" data-chart="spark" data-id="${id}" style="min-width:160px"></div>` nur bei `closed.length` ausgeben, sonst `''`. Gewinner/Verlierer `<span class="pos">${s.wins}</span> / <span class="neg">${s.losses}</span>` → `<span class="${s.wins ? 'pos' : ''}">${s.wins}</span> / <span class="${s.losses ? 'neg' : ''}">${s.losses}</span>`. Kein zusätzlicher Knopf im Leerzustand der Trade-Karte.

```

## zustaende-S-DY3 · Tagesansicht: Regel-Link auf #/settings/regeln

Gruppe zustaende · Cluster trades_tag · Aufwand S · Befunde: zustaende-2
Quelle: audit/spec/zustaende.md Z. 670–672 · Dateien: web/js/screens/day.js
Abhängig von: —

```text
**S-DY3 Regel-Link** – zustaende-2
Z. 18 `<a class="btn sm" href="#/settings">Regeln anlegen</a>` → `href="#/settings/regeln"`.

```

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

## barrierefreiheit-C-day-15 · Tagesansicht-Zeile: Link in der ersten Zelle

Gruppe barrierefreiheit · Cluster trades_tag · Aufwand S · Befunde: barrierefreiheit-4, zustaende-36
Quelle: audit/spec/barrierefreiheit.md Z. 759–761 · Dateien: web/js/screens/day.js
Abhängig von: barrierefreiheit-B7

```text
#### `web/js/screens/day.js`

- **Z. 15:** erste Zelle `<td>${fmt.time(t.open)}${…}</td>` → `` <td><a class="row-link" href="#/trades/${t.id}">${fmt.time(t.open)}${t.close ? ` – ${fmt.time(t.close)}` : ''}</a></td> `` (Befunde: barrierefreiheit-4, zustaende-36)
```

## kilook-C8c · Session-Ende-Dialog: Heute/Trades/Win-Rate als .kpi-label

Gruppe kilook · Cluster trades_tag · Aufwand S · Befunde: ki_look-36
Quelle: audit/spec/kilook.md Z. 603–604 · Dateien: web/js/app.js
Abhängig von: kilook-A4

```text
- **530** (Session-Ende) dreimal `<div class="caption">` → `<div class="kpi-label">` (Heute, Trades, Win-Rate).

```

## kilook-C13 · Tagesansicht: Check-in mit I.mood (Knopf und Leerzustand), Netto-P&L als .kpi-label

Gruppe kilook · Cluster trades_tag · Aufwand S · Befunde: ki_look-17, ki_look-36
Quelle: audit/spec/kilook.md Z. 625–629 · Dateien: web/js/screens/day.js
Abhängig von: kilook-A4

```text
**C13 · web/js/screens/day.js** (ki_look-17, ki_look-36)
- **12** `${I.sparkle} ${d.checkIn ? 'Check-in bearbeiten' : 'Check-in'}` → `${I.mood} ${d.checkIn ? 'Check-in bearbeiten' : 'Check-in'}`
- **14** `<div class="caption">Netto-P&L</div>` → `<div class="kpi-label">Netto-P&L</div>`
- **16** `U.empty('sparkle', 'Kein Check-in', …)` → `U.empty('mood', 'Kein Check-in', …)`

```

## kilook-C16 · TradeLog: Netto-P&L mit Vorzeichen, Verpasste-Trades-Labels als .kpi-label

Gruppe kilook · Cluster trades_tag · Aufwand S · Befunde: diagramme-35, ki_look-36
Quelle: audit/spec/kilook.md Z. 645–649 · Dateien: web/js/screens/trades.js
Abhängig von: kilook-A4

```text
**C16 · web/js/screens/trades.js** (diagramme-35, ki_look-36)
- **26** `U.pnl(s.total, '', { signed: false })` → `U.pnl(s.total)`
- **59** `<div class="caption">Entgangen</div>` und `<div class="caption">Wären Gewinner gewesen</div>` → `class="kpi-label"`
- **76** bleibt `.caption`.

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

## wording-S3.6 · app.css: TradeLog-Filter am Desktop (.tl-search, .tl-sel display: contents)

Gruppe wording · Cluster trades_tag · Aufwand S · Befunde: bereich_trades_tag-35
Quelle: audit/spec/wording.md Z. 332–332 · Dateien: web/css/app.css
Abhängig von: —

```text
| 3.6 | TradeLog-Filter (bei den TradeLog-Regeln, um Z. 1743) | – → `.tl-search { max-width: 260px; position: relative; }` · `.tl-sel { display: contents; }` | bereich_trades_tag-35 |
```
