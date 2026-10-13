# Paket 020 · trades_tag, komponenten

Schritte: 9 · Dateien: web/css/app.css, web/js/app.js, web/js/screens/day.js, web/js/screens/trades.js
Betroffene Tests laut Spezifikation: Akzeptanz 4.1 Nr. 5 („Trade loggen“ fett, „Filter“ mit aktivem Filter nicht fetter); web/e2e/tradeformtest.js:24/26/28 (müssen grün bleiben); web/e2e/tradeformtest.js:52; web/e2e/tradeformtest.js:54
Baut auf Paketen auf: 1, 7, 13, 19

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## typografie-3.2.4b · Knöpfe: .btn.primary 700, .btn.accent 500 (aktiver Filter nicht fetter), neu .btn.accent.tl 700 (K8)

Gruppe typografie · Cluster komponenten · Aufwand S · Befunde: typografie-1, typografie-19
Quelle: audit/spec/typografie.md Z. 331–333 · Dateien: web/css/app.css
Abhängig von: typografie-3.1

```text
| `.btn.primary` (274) | 600 → 700 | typografie-1 |
| `.btn.accent` (3137) | `font-weight: 600` → `font-weight: 500` | typografie-1, typografie-19 (K8) |
| neu nach Z. 3144 | `.btn.accent.tl { font-weight: 700; }` („Trade loggen“, app.js:253) | typografie-1 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .btn.primary] (1) Gewicht: .btn.primary bekommt 700 (typografie-3.2.4b). Grundlage sind BRIEF („nur Werte und Hauptknöpfe 700“) und README Z. 209–210 („Hauptknöpfe („Trade loggen“, Speichern) fett“). Heute rendert 600 ohnehin als 700, sichtbar ändert sich also nichts. farbe-B2 und farbe-D3e nennen kein Gewicht mehr. (2) Rolle nach der Komponenten-Regel: .btn.primary steht nur im Dialog-Fuß, im Popover- bzw. Panel-Fuß (eine abschließende Aktion) und beim Absenden des Hauptformulars einer Seite. Auslöser, Leerzustand-, Banner- und Listen-Aktionen sowie Inline-Formulare in Karten und Widgets sind .btn bzw. .btn.sm. Grund: Das bleibt ruhig, egal wie N1 ausgeht; bei Variante B wäre jeder primary der lauteste Punkt der Seite und lauter als „Trade loggen“. Damit sind neutral: widgets.js:374 (Mentor-Frage im Widget) `btn`, coach.js:129/140/148 `btn sm`, notebook.js:67 „Wiederherstellen“ `btn sm`, prop.js:82 (Leerzustand) `btn sm`, prop.js:97 „Als bestanden markieren“ `btn sm`, prop.js:262/266 „Ausgabe/Payout erfassen“ `btn`, „Konto hinzufügen“ im Konten-Bereichskopf misc.js:186 `btn` (nicht sm, Seitenebene). (3) Doppelte Knopfänderungen führen die komponenten-S-Schritte aus. Die farbe-C-Schritte lassen ihre Knopf-Teile weg, ihre Farbteile bleiben. Ausnahme ist der Willkommen-Banner dashboard.js:130: farbe-C19c schreibt den ganzen Aufruf neu und übernimmt damit auch den Knopf. (4) README: farbe-D3e ersetzt Z. 203–208 sofort, aber ohne Aussehen und Gewicht von .btn.primary. komponenten-R1f setzt danach auf und zieht Z. 207–208 bzw. Z. 191 erst nach den Antworten N1/N2 nach, wie dort vorgesehen.
- [konflikt: .btn.accent] .btn.accent steht nur noch für „Trade loggen“ (App.newTradeButton `.btn.accent.tl` und der runde Handy-Knopf). Aktiver Dashboard-Filter: Klasse `is-on`. So steht es in zustaende-S-D2/-S-C7, kollisionsfrei und im gemeinsamen Ausgewählt-Stil. farbe-C19b/-B25 nennen denselben Zustand `.dh-context .btn.is-set`; das entfällt. Das aria-label „Filter ({0} aktiv)“ aus farbe-C19b bleibt. TradeLog-Leerzustand „Trade loggen“: neutral `btn sm` (komponenten-S-trades-b). Gründe: Die Kopfreihe trägt „Trade loggen“ schon, die Farbe-Spezifikation selbst verlangt „1 je Ansicht“, BRIEF spricht von dem einen Hauptknopf, und Leerzustand-Aktionen sind btn sm. „Trade für diesen Tag“ entfällt (wording-S8.1-8.2). Damit ist jedes .btn.accent ein Hauptknopf: `.btn.accent` font-weight 600 → 700 direkt, ohne eigene Regel `.btn.accent.tl`; die wäre eine wirkungslose Doppelregel. Der aktive Filter (is-on) bleibt 500 wie jeder Knopf, also nicht fetter.
- ÄNDERN: `.btn.accent` (Z. 3137) font-weight 600 → 700 statt → 500. Die neue Regel `.btn.accent.tl { font-weight: 700; }` entfällt. Unverändert bleiben .btn.primary 700, .rp-btn 500, .rp-btn.rp-primary 700 und die Liste 600 → 500.

## wording-S8.3-8.5 · Tagesansicht-Karten: „Trefferquote“, „Check-in machen“/„Check-in nachtragen“, „abgehakt“, „Noch keine Regeln angelegt“

Gruppe wording · Cluster trades_tag · Aufwand S · Befunde: wording-3, bereich_trades_tag-36, wording-5, bereich_trades_tag-37, wording-44
Quelle: audit/spec/wording.md Z. 412–414 · Dateien: web/js/screens/day.js
Abhängig von: —

```text
| 8.3 | day.js:14 Tageskennzahlen | `<div class="k">Win-Rate</div>` → `<div class="k">Trefferquote</div>` | wording-3, bereich_trades_tag-36 |
| 8.4 | day.js:16 Check-in-Karte, Leerzustand | Knopftext `Check-in nachtragen` → `${isToday ? 'Check-in machen' : 'Check-in nachtragen'}`. Mit Check-in bleibt der Kartenknopf „Bearbeiten“ | wording-5, bereich_trades_tag-37 |
| 8.5 | day.js:18 Regeln des Tages | `… von ${rules.length} eingehalten` → `… von ${rules.length} abgehakt`; `U.empty('shield', 'Keine Regeln definiert', …)` → `U.empty('shield', 'Noch keine Regeln angelegt', …)` | wording-44, bereich_trades_tag-37 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: U.empty] (1) Check-in-Leerzustände nutzen I.mood: kilook-C13 in day.js:16, kilook-C14 in stats.js:61. kilook-C25 löscht I.sparkle; der Satz „Z. 61 Symbol sparkle bleibt“ in zustaende-S-ST2 gilt deshalb nicht. (2) Den Knopftext im Check-in-Leerzustand der Tagesansicht setzt aufbau-C7c einmal: `${key < C.dayKey(new Date()) ? 'Check-in nachtragen' : 'Check-in machen'}`. Für künftige Tage passt „nachtragen“ nicht. (3) Schatten-Ich-Ranking (diagramme-I1): Ein leerer Hinweis ist nicht erlaubt (zustaende Z1: nie ''), also `U.empty('shield', 'Keine Regel aktiv', 'Schalte oben im Regelwerk mindestens eine Regel ein.')`. Ohne Verstoß gibt es keinen zweiten Leerzustand „Keine Verstöße“, der steht schon in der Nachbarkarte „Regelverstöße“. Es bleibt nur die Zeile „Ohne Verstöße: …“. (4) TradeLog-Liste: `return (list.length ? filters : '') + U.empty('tradelog', …)` mit Titel und Satz nach zustaende-S-T3. wording 9.7 und S-T3 ergänzen sich in derselben Zeile. (5) Regeln im Fortschritt: siehe #/settings/regeln. Verträglich sind aufbau-C15c, wording 9.14, 12.6, 12.30, zustaende-S-DY1 und noTrades aus S-ST2.
- ÄNDERN: 8.4 entfällt, den Knopftext setzt aufbau-C7c mit der Bedingung key < heute. 8.3 und 8.5 bleiben.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: U.empty] (1) Check-in-Leerzustände nutzen I.mood: kilook-C13 in day.js:16, kilook-C14 in stats.js:61. kilook-C25 löscht I.sparkle; der Satz „Z. 61 Symbol sparkle bleibt“ in zustaende-S-ST2 gilt deshalb nicht. (2) Den Knopftext im Check-in-Leerzustand der Tagesansicht setzt aufbau-C7c einmal: `${key < C.dayKey(new Date()) ? 'Check-in nachtragen' : 'Check-in machen'}`. Für künftige Tage passt „nachtragen“ nicht. (3) Schatten-Ich-Ranking (diagramme-I1): Ein leerer Hinweis ist nicht erlaubt (zustaende Z1: nie ''), also `U.empty('shield', 'Keine Regel aktiv', 'Schalte oben im Regelwerk mindestens eine Regel ein.')`. Ohne Verstoß gibt es keinen zweiten Leerzustand „Keine Verstöße“, der steht schon in der Nachbarkarte „Regelverstöße“. Es bleibt nur die Zeile „Ohne Verstöße: …“. (4) TradeLog-Liste: `return (list.length ? filters : '') + U.empty('tradelog', …)` mit Titel und Satz nach zustaende-S-T3. wording 9.7 und S-T3 ergänzen sich in derselben Zeile. (5) Regeln im Fortschritt: siehe #/settings/regeln. Verträglich sind aufbau-C15c, wording 9.14, 12.6, 12.30, zustaende-S-DY1 und noTrades aus S-ST2.
- [konflikt: ctx.headLeft] Tagesansicht: Die Datumszeile bleibt im Inhalt, ohne ctx.headLeft. aufbau K4 hat genau diese Variante verworfen, weil Datumstitel und Konto-Filter in einer Reihe vermischt würden, und sie hängt an F1 (komponenten-3/bereich_shell-8). Die Knöpfe „Check-in“ und „Trade für diesen Tag“ entfallen mit aufbau-C7b, „Zertifikat“ bleibt dort mit I.award, die Pille „Heute“ ist neutral (farbe-C20). Von abstaende-E-day2 bleibt nur der Inline-Stil des Datumstitels als Klasse: `<h2 class="day-title">` mit `.day-title { font-size: var(--fs-18); line-height: var(--lh-18); margin-left: var(--sp-1); }` (h2-Rolle 18/600, einzige Definition; .day-title in komponenten-C36 entfällt). Trade-Ansicht: Links steht der Rückweg per ctx.headLeft (aufbau-C15d). Die Seitenaktionen aus wording 9.11 kommen nicht in die Rückweg-Zeile, sondern als `actions(ctx)` rechts in die Kopfreihe; die Aufbau-Regel lautet „rechts Seitenaktionen → .dh-sep → Trade loggen“. Bei ctx.params[0]: Notiz-Knopf (`btn`, „Notiz öffnen“ bzw. „Notiz im Notebook“), `btn danger` „Löschen“, `btn` „Trade bearbeiten“ (Seitenebene = btn, nicht primary); ohne Trade-Datensatz ''. Ohne Parameter bleibt „CSV importieren“. pageHead (aufbau-B1), News (aufbau-C9a) und Affiliate (aufbau-C3) bleiben unverändert.
- ÄNDERN: 9.11: Die Knöpfe kommen nicht in die Rückweg-Zeile (die wandert mit aufbau-C15d in ctx.headLeft), sondern in `App.screens.trades.actions(ctx)`. Bei ctx.params[0] über `S.getTrade(id)` und `S.tradeNote(id)`: `<a class="btn" href="#/notebook/${tn.id}">${I.journal} Notiz öffnen</a>` bzw. `<button type="button" class="btn" data-action="nb-trade-note" data-id="${id}">${I.journal} Notiz im Notebook</button>`, dann `<button type="button" class="btn danger" data-action="delete-trade" data-id="${id}">${I.trash} Löschen</button>` und `<button type="button" class="btn" data-action="edit-trade" data-id="${id}">${I.edit} Trade bearbeiten</button>`, ohne `<span class="grow">`. 9.10 und 9.12–9.16 bleiben.

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
