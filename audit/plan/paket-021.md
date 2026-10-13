# Paket 021 · trades_tag, shell

Schritte: 12 · Dateien: web/app.html, web/css/app.css, web/js/app.js, web/js/screens/day.js, web/js/screens/trades.js
Betroffene Tests laut Spezifikation: web/e2e/tradeformtest.js:24/26/28 (müssen grün bleiben); web/e2e/tradeformtest.js:52; web/e2e/tradeformtest.js:54
Baut auf Paketen auf: 7

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## wording-S5.3 · app.js: Aktion new-trade übernimmt in der Tagesansicht das Datum des Tages (09:00)

Gruppe wording · Cluster trades_tag · Aufwand S · Befunde: wording-5
Quelle: audit/spec/wording.md Z. 355–355 · Dateien: web/js/app.js
Abhängig von: —

```text
| 5.3 | app.js:324 Aktion `new-trade` | `'new-trade'() { this.openTradeEditor(null); },` → `'new-trade'() { const k = this.state.route === 'day' ? (this.state.params[0] \|\| C.dayKey(new Date())) : null; if (k && k !== C.dayKey(new Date())) { const d = C.parseDayKey(k); d.setHours(9, 0, 0, 0); return this.openTradeEditor(null, { openedAt: d.toISOString() }); } this.openTradeEditor(null); },` | wording-5 |
```

## wording-S5.9 · app.html Tastatur: Taste 0 nur mit Replay, N über App.actions['new-trade']

Gruppe wording · Cluster shell · Aufwand S · Befunde: bereich_shell-32, wording-5
Quelle: audit/spec/wording.md Z. 361–362 · Dateien: web/app.html
Abhängig von: wording-S5.3

```text
| 5.9 | app.html:95–96 Tastatur | vor `if (map[e.key])` einfügen: `if (e.key === '0' && !App.on('replay')) return;` · `App.openTradeEditor(null)` → `App.actions['new-trade'].call(App)` | bereich_shell-32, wording-5 |

```

## wording-S5.4-5.5 · Trade-Dialog: „Geschlossen“ mit Leertext „Offen“ und Touch-Hinweis, Bestätigungsknopf „Trade loggen“

Gruppe wording · Cluster trades_tag · Aufwand S · Befunde: wording-62, wording-2, wording-63
Quelle: audit/spec/wording.md Z. 356–357 · Dateien: web/js/app.js
Abhängig von: wording-S3.1-3.3, wording-S4.1-4.5

```text
| 5.4 | app.js:360 Feld Geschlossen | `<label for="f-close">Geschlossen <span class="faint">(leer = offen)</span></label><input class="input" type="datetime-local" id="f-close" …>` → `<label for="f-close">Geschlossen <span class="faint dp-coarse">(leer lassen, solange offen)</span></label><input class="input" type="datetime-local" id="f-close" data-empty="Offen" …>` | wording-62, wording-2 |
| 5.5 | app.js:368 Bestätigungsknopf | `${trade ? 'Speichern' : 'Trade speichern'}` → `${trade ? 'Speichern' : 'Trade loggen'}` | wording-63 |
```

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

## wording-S8.3-8.5 · Tagesansicht-Karten: „Trefferquote“, „Check-in machen“/„Check-in nachtragen“, „abgehakt“, „Noch keine Regeln angelegt“

Gruppe wording · Cluster trades_tag · Aufwand S · Befunde: wording-3, bereich_trades_tag-36, wording-5, bereich_trades_tag-37, wording-44
Quelle: audit/spec/wording.md Z. 412–414 · Dateien: web/js/screens/day.js
Abhängig von: —

```text
| 8.3 | day.js:14 Tageskennzahlen | `<div class="k">Win-Rate</div>` → `<div class="k">Trefferquote</div>` | wording-3, bereich_trades_tag-36 |
| 8.4 | day.js:16 Check-in-Karte, Leerzustand | Knopftext `Check-in nachtragen` → `${isToday ? 'Check-in machen' : 'Check-in nachtragen'}`. Mit Check-in bleibt der Kartenknopf „Bearbeiten“ | wording-5, bereich_trades_tag-37 |
| 8.5 | day.js:18 Regeln des Tages | `… von ${rules.length} eingehalten` → `… von ${rules.length} abgehakt`; `U.empty('shield', 'Keine Regeln definiert', …)` → `U.empty('shield', 'Noch keine Regeln angelegt', …)` | wording-44, bereich_trades_tag-37 |
```

## wording-S9.1-9.2 · TradeLog: Spalten „Einstieg“, „Ausstieg“, „Netto-P&L“, „R“; Netto-P&L-Kachel mit Vorzeichen und U.count

Gruppe wording · Cluster trades_tag · Aufwand S · Befunde: bereich_trades_tag-36, wording-7, zustaende-28
Quelle: audit/spec/wording.md Z. 420–425 · Dateien: web/js/screens/trades.js
Abhängig von: wording-S1.1-1.3

```text
### Schritt 9 · `web/js/screens/trades.js` (TradeLog und Trade-Detail)

| # | Stelle | vorher → nachher | ids |
|---|---|---|---|
| 9.1 | Z. 7 `COLS` | `['entryPrice', 'Einstiegspreis', 'r']` → `['entryPrice', 'Einstieg', 'r']`; `['exitPrice', 'Ausstiegspreis', 'r']` → `['exitPrice', 'Ausstieg', 'r']`; `['pnl', 'P&L', 'r']` → `['pnl', 'Netto-P&L', 'r']`; `['r', 'RR', 'r']` → `['r', 'R', 'r']` („Status“ bleibt) | bereich_trades_tag-36 |
| 9.2 | Z. 26 Netto-P&L-Kachel | `U.pnl(s.total, '', { signed: false })` → `U.pnl(s.total)`; `<span class="n">${s.n} Trades</span>` → `<span class="n">${U.count(s.n, 'Trade', 'Trades')}</span>` | wording-7, zustaende-28 |
```

## wording-S9.10-9.16 · Trade-Detail: „Plan bearbeiten“/„Tags bearbeiten“, „Löschen“ und „Trade bearbeiten“ (neutral) in die Brotkrumen-Zeile, Fuß streichen, Raster-Namen, MAE/MFE-Leerzustand, Journalyst-Server

Gruppe wording · Cluster trades_tag · Aufwand M · Befunde: bereich_trades_tag-22, bereich_trades_tag-36, bereich_trades_tag-47, wording-61, wording-14
Quelle: audit/spec/wording.md Z. 433–439 · Dateien: web/js/screens/trades.js
Abhängig von: —

```text
| 9.10 | Z. 63 `jBtn` | `const jBtn = raw ? \`<button … data-action="trade-journal" data-id="${raw.id}">${I.edit} Bearbeiten</button>\` : '';` → `const jBtn = label => raw ? \`<button type="button" class="btn sm ghost" data-action="trade-journal" data-id="${raw.id}">${I.edit} ${label}</button>\` : '';` | bereich_trades_tag-22 |
| 9.11 | Z. 66 Brotkrumen-Zeile | nach dem Datums-Link einfügen: `<span class="grow"></span>` + Notebook-Knopf aus Z. 85 (unverändert, `btn sm ghost`) + `<button type="button" class="btn danger sm" data-action="delete-trade" data-id="${t.id}">${I.trash} Löschen</button>` + `<button type="button" class="btn sm" data-action="edit-trade" data-id="${t.id}">${I.edit} Trade bearbeiten</button>` (nicht `primary`) | bereich_trades_tag-22 |
| 9.12 | Z. 68 Detail-Raster | `['Eröffnung', …]` → `['Eröffnet', …]`; `['Schluss', …]` → `['Geschlossen', …]`; `['Stück × Punktwert', …]` → `['Kontrakte × Punktwert', …]` | bereich_trades_tag-36 |
| 9.13 | Z. 73 / Z. 76 | `trailing: … ? jBtn : ''` → `trailing: … ? jBtn('Plan bearbeiten') : ''`; `{ trailing: jBtn }` → `{ trailing: jBtn('Tags bearbeiten') }` | bereich_trades_tag-22 |
| 9.14 | Z. 75 MAE/MFE-Leerzustand | `U.empty('trend', 'Keine Exkursionsdaten', 'Trage MAE und MFE im Editor ein.')` → `U.empty('trend', 'Kein MAE/MFE erfasst', 'Trage unter „Plan & Bewertung“ den Stop sowie den tiefsten und besten Kurs während des Trades ein.', \`<button type="button" class="btn sm" data-action="trade-journal" data-id="${t.id}">Plan ergänzen</button>\`)` | bereich_trades_tag-47, wording-61 |
| 9.15 | Z. 84 Info Sprachjournal | `Auswertung über den Mentor-Server` → `Auswertung über deinen Journalyst-Server` | wording-14 |
| 9.16 | Z. 85–86 Fuß | `const foot = …` streichen, `${foot}` aus dem Rückgabewert in Z. 86 entfernen | bereich_trades_tag-22 |
```

## bewegung-B4b · Symbol-Liste (CSS): Ursprung top left, .sym-menu.up und .sym-menu.closing

Gruppe bewegung · Cluster trades_tag · Aufwand S · Befunde: bewegung-27, bewegung-28
Quelle: audit/spec/bewegung.md Z. 192–194 · Dateien: web/css/app.css
Abhängig von: bewegung-B4a

```text
- Z. 879 `.sym-menu { … animation: pop-in var(--dur-1) var(--ease) backwards; }`: um `transform-origin: top left;` ergänzen. Direkt danach neu:
  `.sym-menu.up { --pop-y: 8px; --pop-y-out: 4px; transform-origin: bottom left; }`
  `.sym-menu.closing { animation: pop-out var(--dur-1) var(--ease-in) forwards; pointer-events: none; }`
```

## bewegung-C2 · Screenshots im Trade: kein Zoom, Rand-Hover auf .shots .shot, zoom-in-Cursor

Gruppe bewegung · Cluster trades_tag · Aufwand S · Befunde: bereich_trades_tag-49, bewegung-42
Quelle: audit/spec/bewegung.md Z. 243–249 · Dateien: web/css/app.css
Abhängig von: —

```text
**C2 Screenshots** (bereich_trades_tag-49, bewegung-42)
- Z. 753 `.shot img { … transition: transform var(--dur-3) var(--ease), opacity var(--dur-3) var(--ease); }` → `transition: opacity var(--dur-3) var(--ease);`
- Z. 754 `.shot:hover img { transform: scale(1.03); }` ersetzen durch:
  `.shots .shot { transition: border-color var(--dur-1) var(--ease); }`
  `.shots .shot:hover { border-color: var(--border-2); }`
  `.shot img[data-action="lightbox"] { cursor: zoom-in; }`

```

## bewegung-C3 · Long/Short-Schalter: Zeiten auf Tokens (Wackeln 320 ms über calc)

Gruppe bewegung · Cluster trades_tag · Aufwand S · Befunde: bewegung-34
Quelle: audit/spec/bewegung.md Z. 250–255 · Dateien: web/css/app.css
Abhängig von: —

```text
**C3 Long/Short-Schalter** (bewegung-34)
- Z. 850 `transition: --dir-c 140ms linear;` → `transition: --dir-c var(--dur-1) linear;`
- Z. 852 `transition: transform 260ms var(--ease-io);` → `transition: transform var(--dur-2) var(--ease-io);`
- Z. 858 `transition: opacity 160ms var(--ease);` → `transition: opacity var(--dur-1) var(--ease);`
- Z. 860 `animation: dir-need 320ms var(--ease-io);` → `animation: dir-need calc(var(--dur-2) * 4 / 3) var(--ease-io);`

```

## bewegung-3.5b · App.closeSymbolMenu: Symbol-Liste blendet über M.leave aus, ID sofort entfernen

Gruppe bewegung · Cluster trades_tag · Aufwand S · Befunde: bewegung-27
Quelle: audit/spec/bewegung.md Z. 315–315 · Dateien: web/js/app.js
Abhängig von: bewegung-B4b

```text
- **Z. 387 `App.closeSymbolMenu`** (bewegung-27): `if (m) { if (m._off) m._off(); m.remove(); }` → `if (m) { if (m._off) m._off(); m.removeAttribute('id'); M.leave(m, 'closing', '--dur-1', () => m.remove()); }`. Die ID wird sofort entfernt, damit `openSymbolMenu` (Z. 389) während des Ausblendens ein neues Menü öffnet und tradeformtest.js:24/26/28 grün bleiben. `M.leave` ruft ohne Bewegung sofort `done()` auf.
```

## bewegung-3.5c · App.openSymbolMenu place(): Klasse .up je Öffnungsrichtung setzen

Gruppe bewegung · Cluster trades_tag · Aufwand S · Befunde: bewegung-28
Quelle: audit/spec/bewegung.md Z. 316–317 · Dateien: web/js/app.js
Abhängig von: bewegung-B4b

```text
- **Z. 395 `place()` in `openSymbolMenu`** (bewegung-28): am Ende der Pfeilfunktion `m.classList.toggle('up', up);` ergänzen. Das ändert nur Custom Properties und Ursprung, es gibt keinen Neustart (K13).

```
