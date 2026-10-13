# Paket 029 · prop

Schritte: 26 · Dateien: web/css/app.css, web/e2e/friedhoftest.js, web/e2e/proptest.js, web/js/screens/prop-friedhof.js, web/js/screens/prop.js
Betroffene Tests laut Spezifikation: anpassen in kilook-C27: e2e/proptest.js:55–56, :101; anpassen: e2e/proptest.js:55, :56, :101; :116 unverändert; prüfen: e2e/friedhoftest.js:46 (flacher Grabstein); prüfen: e2e/friedhoftest.js:46, :73, :88–89, :122, :129; prüfen: e2e/proptest.js:116 („/ 150,00 € je Stop-Loss“ bleibt), :122–125 (Geld-blind); prüfen: e2e/proptest.js:94–102 (Payout-Planer Challenge/Funded); prüfen: e2e/sampletest.js:60 (Cockpit-Karten); web/e2e/friedhoftest.js:122; web/e2e/friedhoftest.js:129; web/e2e/friedhoftest.js:21; web/e2e/friedhoftest.js:47; web/e2e/friedhoftest.js:47 (Schritt zustaende-S-TE7); web/e2e/proptest.js:103; web/e2e/proptest.js:103 (Regex „Gewinn fehlt“ → „fehlen“, Schritt responsiv-3.20b); web/e2e/proptest.js:103, :116, :125 (.prop-meta); web/e2e/proptest.js:116; web/e2e/proptest.js:19; web/e2e/proptest.js:55; web/e2e/proptest.js:56; web/e2e/proptest.js:57; web/e2e/proptest.js:91; web/e2e/proptest.js:95; web/e2e/proptest.js:98
Baut auf Paketen auf: 2, 6, 7

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## zustaende-S-F1 · Friedhof: Muster-Karte erst ab zwei Grabsteinen, Hinweis als Info an „Häufigste Regel“

Gruppe zustaende · Cluster prop · Aufwand S · Befunde: bereich_prop-45
Quelle: audit/spec/zustaende.md Z. 735–741 · Dateien: web/js/screens/prop-friedhof.js
Abhängig von: —

```text
### 3.15 `web/js/screens/prop-friedhof.js`

**S-F1 Muster erst ab zwei Grabsteinen** – bereich_prop-45
- Z. 172 `${tiles(g)}${patternsCard(g)}` → `${tiles(g)}${g.n >= 2 ? patternsCard(g) : ''}`
- Z. 61: den Zweig `g.n < 2 ? 'Ab zwei Grabsteinen …' :` entfernen, nur „Kein wiederkehrendes Muster …“ bleibt.
- Z. 56 Kachel „Häufigste Regel“: Optionen `{ foot: … }` → `{ foot: …, info: g.n < 2 ? 'Ab zwei Grabsteinen erscheinen Muster: Uhrzeit, Wochentag, Symbol, Setup, Verlustserie oder Emotion, wenn sie sich wiederholen.' : undefined }`

```

## zustaende-S-TE7 · Test friedhoftest.js:47: bei einem Grabstein keine Muster-Karte, Info an „Häufigste Regel“

Gruppe zustaende · Cluster prop · Aufwand S · Befunde: bereich_prop-45
Quelle: audit/spec/zustaende.md Z. 883–883 · Dateien: web/e2e/friedhoftest.js
Abhängig von: zustaende-S-F1

```text
- `e2e/friedhoftest.js:47`: bei einem Grabstein weder `.prop-patterns` noch `.prop-patterns-empty`; das Info der Kachel „Häufigste Regel“ enthält „Ab zwei Grabsteinen“.
```

## barrierefreiheit-C-prop-233-267 · Prop-Listen: eindeutige Namen (Konto, Preset, Ausgabe, Payout)

Gruppe barrierefreiheit · Cluster prop · Aufwand S · Befunde: barrierefreiheit-35
Quelle: audit/spec/barrierefreiheit.md Z. 854–859 · Dateien: web/js/screens/prop.js
Abhängig von: —

```text
#### `web/js/screens/prop.js`

- **Z. 233:** `aria-label="Bearbeiten"` / `"Löschen"` → `Konto „${esc(accName(a))}“ bearbeiten` / `Konto „${esc(accName(a))}“ löschen` (Befund: barrierefreiheit-35)
- **Z. 237:** `Bearbeiten` / `Löschen` / `Ansehen` / `Kopieren` → `` Preset „${esc(`${p.firm} ${p.name}`)}“ bearbeiten `` / `… löschen` / `… ansehen` / `… kopieren` (Befund: barrierefreiheit-35)
- **Z. 263:** `aria-label="Löschen"` → `aria-label="Ausgabe vom ${fmt.dateFull(e.date)} löschen"` (Befund: barrierefreiheit-35)
- **Z. 267:** `aria-label="Löschen"` → `aria-label="Payout vom ${fmt.dateFull(p.requestedAt)} löschen"` (Befund: barrierefreiheit-35)
```

## barrierefreiheit-C-prop-294 · „+ Prop-Konto“ auf allen Breiten mit Text (hide-m entfernen)

Gruppe barrierefreiheit · Cluster prop · Aufwand S · Befunde: bereich_prop-11
Quelle: audit/spec/barrierefreiheit.md Z. 860–860 · Dateien: web/js/screens/prop.js
Abhängig von: —

```text
- **Z. 294:** `${I.plus}<span class="hide-m">Prop-Konto</span>` → `${I.plus}<span>Prop-Konto</span>` (Beschriftung auf allen Breiten; den Wortlaut regelt die Gruppe Wortwahl) (Befund: bereich_prop-11)
```

## barrierefreiheit-C-prop-304-305 · Prop-Reiter: aria-pressed an <a> streichen, aria-current bleibt

Gruppe barrierefreiheit · Cluster prop · Aufwand S · Befunde: barrierefreiheit-32
Quelle: audit/spec/barrierefreiheit.md Z. 861–862 · Dateien: web/js/screens/prop.js
Abhängig von: barrierefreiheit-B9b

```text
- **Z. 304 und 305:** `aria-pressed="${…}"` an den `<a>` streichen, `aria-current="page"` bleibt (Befund: barrierefreiheit-32)

```

## barrierefreiheit-C-prop-friedhof-132-166 · Grabstein: verdeckte Seite inert, Fokus auf Umdrehen-Knopf bei Tastatur

Gruppe barrierefreiheit · Cluster prop · Aufwand S · Befunde: bereich_prop-48
Quelle: audit/spec/barrierefreiheit.md Z. 863–872 · Dateien: web/js/screens/prop-friedhof.js
Abhängig von: —

```text
#### `web/js/screens/prop-friedhof.js` (bereich_prop-48)

- **Z. 132:** ` title="Umdrehen"` an `.pg-stone` streichen
- **Z. 142:** `<div class="pg-face pg-back" aria-hidden="true">` → `<div class="pg-face pg-back" aria-hidden="true" inert>`
- **Z. 166:** ersetzen durch
  ```js
  const front = stone.querySelector('.pg-front'), back = stone.querySelector('.pg-back'); front.inert = on; back.inert = !on; front.setAttribute('aria-hidden', String(on)); back.setAttribute('aria-hidden', String(!on)); if (e && e.detail === 0) { const t = (on ? back : front).querySelector('.pg-turn'); if (t) t.focus({ preventScroll: true }); }
  ```
  Klicks auf inerte Knoten landen beim Vorfahren `.pg-stone`, das Umdrehen per Klick bleibt.

```

## kilook-C5 · Prop-CSS: veraltete Kommentare, .prop-unv/.prop-highlights/Gravur-Variablen/wirkungslose text-shadow/.prop-grave-kv löschen

Gruppe kilook · Cluster prop · Aufwand M · Befunde: bereich_prop-51
Quelle: audit/spec/kilook.md Z. 557–578 · Dateien: web/css/app.css
Abhängig von: —

```text
**C5 · web/css/app.css · Prop-Reste** (bereich_prop-51)
- **Kommentare:**
  - **2585** im Kommentar „…, Trade-Zuordnung, Rechner (Klassen mit Präfix prop-)“ → „…, Trade-Zuordnung (Klassen mit Präfix prop-)“
  - **2587** → `/* Prop Firms: drei Bereiche als Schiene links in der Kopfreihe, Unteransichten (Bilanz, Friedhof) als Reiter mit Unterstrich */`
  - **2683** `/* Rechner: Eingaben links, Ergebnis rechts */` → `/* Kennzahlen-Leiste: Wertgröße */`
  - **2760** „Prop Firms, Phase 3: Konto-Friedhof (Grabsteine, Muster) und Challenge vs. Funded (Vergleichstabelle)“ → „Prop Firms, Phase 3: Konto-Friedhof (Grabsteine, Muster)“
  - **2766–2768** die beiden Kommentare → ein Kommentar `/* Friedhof: jede Breach-Karte ist ein flacher Grabstein in den Flächenfarben der App, auf einem Sockel mit Kerzen */`
- **2734–2735** `/* Rechner */` und `.prop-unv { … }` löschen.
- **2763–2765** nur die `.prop-highlights…`-Teile aus den Selektorlisten streichen; übrig bleiben:
  - `.prop-patterns { … }`
  - `.prop-patterns li::marker { … }`
  - `.prop-patterns-empty { … }`
- **2770** in `.prop-grave { … }` die Eigenschaften `--eng-hi: …; --eng-lo: …; --grain: url(…);` streichen. Die übrigen Deklarationen bleiben.
- **2779** `--eng-hi: transparent; --eng-lo: transparent;` streichen. Der Kommentar wird „flach: Flächenfarben der App“.
- **Wirkungslose `text-shadow` streichen:**
  - **2793** `.pg-rip`: `text-shadow: 0 1px 0 var(--eng-hi), 0 -1px 0 var(--eng-lo);`
  - **2795** `.prop-grave-head b`: dasselbe
  - **2799** `.pg-dates`: `text-shadow: 0 -1px 0 var(--eng-lo);`
  - **2805** `.pg-cause b`: dasselbe wie 2793
- **2839** `:root[data-theme="light"] .prop-grave-kv { … }` löschen.
- **2842–2844** `.prop-grave .kv`, `.prop-grave .kv > b`, `.prop-grave-trade` löschen. Im Block bleibt `.pg-stone { margin: 0 22px; }`.

```

## kilook-C19a · Prop: Kopfkommentar aktualisieren (nur Friedhof, keine fünf Bereiche)

Gruppe kilook · Cluster prop · Aufwand S · Befunde: bereich_prop-51
Quelle: audit/spec/kilook.md Z. 661–663 · Dateien: web/js/screens/prop.js
Abhängig von: —

```text
**C19 · web/js/screens/prop.js** (diagramme-4, diagramme-32, ki_look-36, bereich_prop-51)
- **7–8** vorher „Weitere Ansichten (Friedhof, Vergleich, Simulation …) registrieren sich … Oben stehen nur fünf Bereiche; Finanzen und Analyse haben einen kleinen Umschalter … Die Adressen bleiben #/prop/<ansicht>“
  → nachher `/* Weitere Ansichten (Friedhof) registrieren sich aus eigenen Dateien über root.PropScreen.register. Die Adressen bleiben #/prop/<ansicht> */`
```

## kilook-C19b · Prop-Übersicht: Kontobeträge in Kontowährung, Regelgrößen ganzzahlig, P&L-Summe je Währung, Balance/P&L als .kpi-label, Konto-Dialog-Hinweis

Gruppe kilook · Cluster prop · Aufwand M · Befunde: diagramme-4, diagramme-32, ki_look-36
Quelle: audit/spec/kilook.md Z. 664–681 · Dateien: web/js/screens/prop.js
Abhängig von: kilook-A4

```text
- **68** `fmtMoney: v => fmt.cur(v)` → `fmtMoney: v => money(a, v, { compact: true })`. Betrifft die Consistency-Warnung („heute mehr als …“).
- **75** `Gewinn fehlt: ${fmt.cur(plan.missingProfit)}` → `Gewinn fehlt: ${money(a, plan.missingProfit, { compact: true })}`
- **86–87** `summaryTiles`: Summe je Währung.
  ```js
  const active = list.filter(a => a.status === 'active'); const byCur = new Map(); let red = 0;
  for (const a of active) { const { ev } = evalOf(a); const c = a.currency || ''; byCur.set(c, (byCur.get(c) || 0) + ev.pnl); if (ev.buffer.ampel === 'rot' || ev.status === 'breached') red++; }
  /* P&L je Kontowährung: eine Währung = eine Zahl, mehrere = „+11.262,00 $ · +1.053,85 €“ */
  const pnlText = byCur.size ? [...byCur].map(([c, v]) => U.pnl(v, '', c ? { currency: c } : {})).join(' · ') : U.pnl(0);
  ```
  In Z. 87 `U.tile('P&L aktive Konten', U.pnl(pnl), …)` → `U.tile('P&L aktive Konten', pnlText, …)`.
- **93** `money(a, x.remaining)` → `money(a, x.remaining, { compact: true })`; `money(a, x.limit)` → `money(a, x.limit, { compact: true })`
- **94** `money(a, ev.target.remaining)` → `money(a, ev.target.remaining, { compact: true })`
- **102**
  - beide `<div class="caption">` (Balance, P&L) → `<div class="kpi-label">`
  - `U.pnl(ev.pnl)` → `U.pnl(ev.pnl, '', { currency: a.currency })`
  - `fmt.balance(…, { currency: a.currency })` bleibt (A2 macht es ganzzahlig)
- **104** im Puffer-Tooltip `money(a, b.money)` → `money(a, b.money, { compact: true })`. `fmt.cur(stopSize)` **bleibt** (R6).
- **194** Hinweis `Balance, Limits und Puffer in Kontowährung. Trade-P&L bleibt in der Journal-Währung.` → `Balance, P&L, Limits und Puffer des Kontos in Kontowährung. Trade-Listen zeigen die Journal-Währung.`
```

## kilook-C19c · Payout-Planer in Kontowährung (Regelgrößen ganzzahlig, Auszahlung mit Cent); Kommentar „drei Bereiche“

Gruppe kilook · Cluster prop · Aufwand M · Befunde: diagramme-4, diagramme-32, bereich_prop-51
Quelle: audit/spec/kilook.md Z. 682–694 · Dateien: web/js/screens/prop.js
Abhängig von: —

```text
- **283** (Payout-Planer, Karte „Bedingungen“):
  - `U.pnl(ev.pnl)` → `U.pnl(ev.pnl, '', { currency: a.currency })`
  - `von ${fmt.cur(o.minProfit)}` → `von ${money(a, o.minProfit, { compact: true })}`
  - `${fmt.cur(missP)} fehlen` → `${money(a, missP, { compact: true })} fehlen`
  - `fmt.balance(ev.balance)` → `fmt.balance(ev.balance, { currency: a.currency })`
  - `von ${fmt.cur(o.minBalance)}` → `von ${money(a, o.minBalance, { compact: true })}`
  - `${fmt.cur(missB)} fehlen` → `${money(a, missB, { compact: true })} fehlen`
  - `heute noch ${fmt.cur(cons.allowedToday)} erlaubt` → `heute noch ${money(a, cons.allowedToday, { compact: true })} erlaubt`
  - `fmt.cur(ev.pnl * num(a.profitSplit, 0))` → `money(a, ev.pnl * num(a.profitSplit, 0))` (Auszahlung, mit Cent)
- **284** `fmt.cur(plan.suggestion.perDay)` → `money(a, plan.suggestion.perDay, { compact: true })`; `fmt.cur(plan.suggestion.total)` → `money(a, plan.suggestion.total, { compact: true })`
- **286** (Payouts dieses Kontos) **unverändert**, Journal-Währung wie erfasst.
- **303** Kommentar „Die fünf Bereiche stehen links in der Kopfreihe …“ → „Die drei Bereiche stehen links in der Kopfreihe …“

```

## kilook-C20 · Friedhof: tote Helfer (kv, when, tradeHtml) löschen, Grabstein-Beträge in Kontowährung

Gruppe kilook · Cluster prop · Aufwand S · Befunde: diagramme-4, bereich_prop-51
Quelle: audit/spec/kilook.md Z. 695–701 · Dateien: web/js/screens/prop-friedhof.js
Abhängig von: —

```text
**C20 · web/js/screens/prop-friedhof.js** (diagramme-4, bereich_prop-51)
- **32** `const kv = (k, v) => …;` löschen.
- **119–122** `const when = …;` und `const tradeHtml = …;` löschen. `whenShort` (123) und `WEEKDAY_LONG` bleiben.
- **136** `fmt.balance(t.size)` → `fmt.balance(t.size, { currency: acc && acc.currency })`. Ersetzt wording/bereich_prop-46 die Unterzeile, entfällt dieser Teil.
- **146** `U.pnl(t.result)` → `U.pnl(t.result, '', { currency: acc && acc.currency })`
- **149** `U.pnl(c.pnl, '', { r: trade.r })` → `U.pnl(c.pnl, '', { r: trade.r, currency: acc && acc.currency })`

```

## kilook-C27 · e2e/proptest.js an Kontowährung und Genauigkeit anpassen

Gruppe kilook · Cluster prop · Aufwand S · Befunde: diagramme-4, diagramme-32
Quelle: audit/spec/kilook.md Z. 745–750 · Dateien: web/e2e/proptest.js
Abhängig von: kilook-A2, kilook-C19b

```text
**C27 · web/e2e/proptest.js** (diagramme-4, diagramme-32)
- **55** `UI.fmt.cur(b, { currency: Store.propAccounts()[0].currency })` → `UI.fmt.balance(b, { currency: Store.propAccounts()[0].currency })`. Der Kommentar wird `/* Balance und P&L in Kontowährung (USD) */`.
- **56** `card.pnl.includes('€')` → `card.pnl.includes('$')`
- **101** in `Prop.payoutPlan(…, { …, fmtMoney: v => UI.fmt.cur(v) })` → `fmtMoney: v => UI.fmt.cur(v, { currency: Store.propAccounts()[2].currency, compact: true })`
- **116** („/ 150,00 € je Stop-Loss“) **unverändert**.

```

## responsiv-C3 · Prop-Karte: Zeilen ohne Umbruch, Wert rechtsbündig

Gruppe responsiv · Cluster prop · Aufwand S · Befunde: bereich_prop-10
Quelle: audit/spec/responsiv.md Z. 392–395 · Dateien: web/css/app.css
Abhängig von: —

```text
**C3 Prop-Karte** (bereich_prop-10)
- Z. 2709 `.prop-meta .kv { padding: 6px 0; flex-wrap: wrap; }` → `.prop-meta .kv { padding: 6px 0; flex-wrap: nowrap; } .prop-meta .kv > span { flex: 0 0 auto; }`
- Z. 2710 `.prop-meta .kv b { text-align: right; }` → `.prop-meta .kv > b { min-width: 0; margin-left: auto; text-align: right; }`

```

## responsiv-3.12a · Prop-Karte: „Bis zum Bestehen“, Betrag ohne Dopplung in Kontowährung (planText)

Gruppe responsiv · Cluster prop · Aufwand S · Befunde: bereich_prop-10
Quelle: audit/spec/responsiv.md Z. 514–517 · Dateien: web/js/screens/prop.js
Abhängig von: responsiv-C3

```text
### 3.12 web/js/screens/prop.js (bereich_prop-21, responsiv-6, bereich_prop-22, bereich_prop-10)

- Z. 75 planText: `if (plan.missingProfit > C.EPS) parts.push(\`Gewinn fehlt: ${fmt.cur(plan.missingProfit)}\`);` → `if (plan.missingProfit > C.EPS && !(ev.target && a.phase !== 'funded')) parts.push(\`${money(a, plan.missingProfit)} fehlen\`); /* mit Ziel-Balken nennt der Balken den Betrag schon */`
- Z. 104 `U.kv(plan.funded ? 'Nächster Payout' : 'Bestehen', …)` → `U.kv(plan.funded ? 'Nächster Payout' : 'Bis zum Bestehen', …)`
```

## responsiv-3.20b · proptest: Regex „Gewinn fehlt“ → „fehlen“

Gruppe responsiv · Cluster prop · Aufwand S · Befunde: —
Quelle: audit/spec/responsiv.md Z. 571–571 · Dateien: web/e2e/proptest.js
Abhängig von: responsiv-3.12a

```text
- `proptest.js:103`: Regex `/in \d+ Handelstag|Gewinn fehlt|bereit|Consistency/` → `/in \d+ Handelstag|fehlen|bereit|Consistency/`.
```

## wording-S12.1-12.3 · Prop: Währungssymbol je Konto (curSym/unitLabel), Breach-Banner ohne ISO-Datum mit „überschreitet“, fmtMoney in Kontowährung

Gruppe wording · Cluster prop · Aufwand M · Befunde: bereich_prop-38, bereich_prop-4, bereich_prop-5
Quelle: audit/spec/wording.md Z. 478–484 · Dateien: web/js/screens/prop.js
Abhängig von: —

```text
### Schritt 12 · `web/js/screens/prop.js`, `web/js/screens/prop-friedhof.js`, `web/js/screens/coupons.js`

| # | Stelle | vorher → nachher | ids |
|---|---|---|---|
| 12.1 | prop.js:34–35 | `const curSym = () => …fmt.cur(0, { money: true })…` → `const curSym = c => fmt.moneyBlind() ? '' : fmt.cur(0, { money: true, currency: c }).replace(/[\d.,\s ]/g, '');` · `const unitLabel = (text) => { const s = curSym(); … }` → `const unitLabel = (text, c) => { const s = curSym(c); return s ? \`${text} (${s})\` : text; };` | bereich_prop-38 |
| 12.2 | prop.js:50 `detailOf` (dailyLoss) | `` `Tagesverlust ${money(a, b.loss)} erreicht das Limit ${money(a, b.limit)}${b.dayKey ? ` (Handelstag ${esc(b.dayKey)})` : ''}` `` → `` `Tagesverlust ${money(a, b.loss)} ${b.loss > b.limit + C.EPS ? 'überschreitet' : 'erreicht'} das Limit von ${money(a, b.limit)}${b.dayKey && b.at && b.dayKey !== C.dayKey(new Date(b.at)) ? ` · Handelstag ${fmt.dateFull(C.parseDayKey(b.dayKey))}` : ''}` `` | bereich_prop-4 |
| 12.3 | prop.js:68 | `fmtMoney: v => fmt.cur(v)` → `fmtMoney: v => money(a, v)` | bereich_prop-5 |
```

## wording-S12.4-12.5 · Prop: planText mit skipProfit, „{0} Gewinn fehlen“, „Consistency Rule verletzt“; limText/ddText/lockAt in Kontowährung

Gruppe wording · Cluster prop · Aufwand M · Befunde: wording-31, bereich_prop-5, bereich_prop-38
Quelle: audit/spec/wording.md Z. 485–486 · Dateien: web/js/screens/prop.js
Abhängig von: —

```text
| 12.4 | prop.js:71–77 `planText(a, ev, plan, skipProfit)` | vierter Parameter `skipProfit`. Z. 75: Gewinn-Teil `Gewinn fehlt: ${fmt.cur(plan.missingProfit)}` → nur wenn `!skipProfit`: `${money(a, plan.missingProfit)} Gewinn fehlen`; `'Consistency verletzt'` → `'Consistency Rule verletzt'`; „in N Handelstag(en)“ bleibt. Z. 76: `return parts.join(' · ') \|\| '—';` → `return parts.join(' · ') \|\| (skipProfit ? '' : '—');` | wording-31, bereich_prop-5 |
| 12.5 | prop.js:79 `limText` | `r => … fmt.cur(r.value)` → `(r, c) => … fmt.cur(r.value, { currency: c })`; `ddText` reicht die Währung durch; Aufrufer im Preset-Raster übergeben `p.currency`; `lockAt` ebenso | bereich_prop-38 |
```

## wording-S12.6-12.7 · Prop: Leerzustand „Prop-Konto anlegen“ ohne Firmen-Preset, Kachel „P&L der aktiven Konten“ je Währung

Gruppe wording · Cluster prop · Aufwand M · Befunde: wording-35, wording-34, wording-32, bereich_prop-5, wording-36
Quelle: audit/spec/wording.md Z. 487–488 · Dateien: web/js/screens/prop.js
Abhängig von: —

```text
| 12.6 | prop.js:82 Leerzustand | Text `'Lege ein Konto aus einem Firmen-Preset an und ordne ihm Trades zu. Dann siehst du hier Balance, Puffer, Ampel und den Weg zum Payout.'` → `'Lege ein Prop-Konto an (Firma, Größe, Regeln) und ordne ihm Trades zu. Dann siehst du hier Kontostand, Puffer, Ampel und den Weg zum Payout.'`; Knopf `${I.plus} Konto anlegen` → `${I.plus} Prop-Konto anlegen` (Titel „Noch keine Prop-Konten“ bleibt, proptest.js:20) | wording-35, wording-34, wording-32 |
| 12.7 | prop.js:86–87 Kachel | Summe je Währung: `const byCur = new Map(); for (const a of active) { const c = a.currency \|\| ''; byCur.set(c, (byCur.get(c) \|\| 0) + evalOf(a).ev.pnl); }`; Wert `[...byCur].map(([c, v]) => U.pnl(v, '', c ? { currency: c } : {})).join(' <span class="muted">·</span> ')`; Titel `'P&L aktive Konten'` → `'P&L der aktiven Konten'` | bereich_prop-5, wording-36 |
```

## wording-S12.8-12.12 · Prop-Karte: „reicht für N Stops“, „Kontostand“, P&L in Kontowährung, Bestehen-Zeile nur wenn nicht leer, Tooltip „je Stop“, Archiv-Untertitel, Verweis „Trade bearbeiten“

Gruppe wording · Cluster prop · Aufwand M · Befunde: wording-33, wording-32, bereich_prop-5, zustaende-28, wording-31, wording-37, wording-61
Quelle: audit/spec/wording.md Z. 489–493 · Dateien: web/js/screens/prop.js
Abhängig von: wording-S1.1-1.3, wording-S12.4-12.5

```text
| 12.8 | prop.js:98 Puffer | `` `noch ${b.stops} Stop-Loss${b.stops === 1 ? '' : 'es'}` `` → `` `reicht für ${b.stops} Stop${b.stops === 1 ? '' : 's'}` `` | wording-33 |
| 12.9 | prop.js:102 Karte | Caption `Balance` → `Kontostand`; `U.pnl(ev.pnl)` → `U.pnl(ev.pnl, '', { currency: a.currency })`; `${ev.n} Trades` → `${U.count(ev.n, 'Trade', 'Trades')}` | wording-32, bereich_prop-5, zustaende-28 |
| 12.10 | prop.js:104 Meta | `const pt = planText(a, ev, plan, !!(ev.target && a.phase !== 'funded'));` und die kv-Zeile „Bestehen“/„Nächster Payout“ nur, wenn `pt`; Tooltip `${fmt.cur(stopSize)} je Stop-Loss` → `${money(a, stopSize)} je Stop` | wording-31, bereich_prop-5, wording-33 |
| 12.11 | prop.js:123 | `sub: 'bestanden, geplatzt oder archiviert'` → `sub: 'Bestanden, geplatzt oder archiviert'` | wording-37 |
| 12.12 | prop.js:133 Trades zuordnen | `Ältere Trades ordnest du im Trade-Editor zu.` → `Ältere Trades ordnest du über „Trade bearbeiten“ zu.` | wording-61 |
```

## wording-S12.13-12.16 · Prop-Konto-Dialog: Betrag-Option mit Kontowährung, „% des Startkapitals“, „Mindest-Kontostand“, Platzhalter „z. B. 50K“/„z. B. Topstep“, Währungshinweis

Gruppe wording · Cluster prop · Aufwand S · Befunde: bereich_prop-38, wording-32, bereich_prop-53, bereich_prop-5
Quelle: audit/spec/wording.md Z. 494–497 · Dateien: web/js/screens/prop.js
Abhängig von: wording-S12.1-12.3

```text
| 12.13 | prop.js:143 `modeSel` | `[['abs', unitLabel('Betrag')], ['pct', '% der Startbalance']]` → `[['abs', unitLabel('Betrag', o.currency)], ['pct', '% des Startkapitals']]` | bereich_prop-38, wording-32 |
| 12.14 | prop.js:153 | `F('Mindestbalance', …)` → `F('Mindest-Kontostand', …)` | wording-32 |
| 12.15 | prop.js:191 / :216 / :217 | `<label for="pa-name">Konto (z. B. 50K)</label><input … id="pa-name" …>` → `<label for="pa-name">Konto</label><input … id="pa-name" placeholder="z. B. 50K" …>`; ebenso :217 (`pp-name`); :216 Firma bekommt `placeholder="z. B. Topstep"` | bereich_prop-53 |
| 12.16 | prop.js:194 Währungshinweis | `Balance, Limits und Puffer in Kontowährung. Trade-P&L bleibt in der Journal-Währung.` → `Kontostand, P&L, Limits und Puffer in Kontowährung. In Trade-Listen bleibt die Journal-Währung.` | bereich_prop-5, wording-32 |
```

## wording-S12.17-12.20 · Prop-Konto-Dialog: Aktion prop-cur beim Währungswechsel, „Startkapital“, Währung an rulesFields, Stop-Größe-Hinweis

Gruppe wording · Cluster prop · Aufwand M · Befunde: bereich_prop-38, wording-32, wording-33
Quelle: audit/spec/wording.md Z. 498–501 · Dateien: web/js/screens/prop.js
Abhängig von: wording-S12.1-12.3, wording-S12.13-12.16

```text
| 12.17 | prop.js:194/:21x Währungswechsel | `#pa-cur` und `#pp-cur` bekommen `data-change="prop-cur"`. Neue Aktion `'prop-cur'(el) { const f = el.form; ['dl_mode', 'dd_mode', 'pt_mode'].forEach(n => { const o = f.querySelector(\`select[name="${n}"] option[value="abs"]\`); if (o) o.textContent = unitLabel('Betrag', el.value); }); }`; `fillAccountForm` ruft sie nach `set('currency', …)` auf | bereich_prop-38 |
| 12.18 | prop.js:198 | `<label for="pa-sb">Startbalance</label>` → `<label for="pa-sb">Startkapital</label>` | wording-32 |
| 12.19 | prop.js:203 / :225 `rulesFields`-Aufrufe | `{ tz: s.tz }` → `{ tz: s.tz, currency: s.currency }`; `{ fees: s.fees \|\| {}, disabled: ro }` → `{ fees: s.fees \|\| {}, disabled: ro, currency: s.currency }` | bereich_prop-38 |
| 12.20 | prop.js:242 Stop-Größe | Hinweis `Bestimmt „noch X Stop-Losses“.` → `Bestimmt, für wie viele Stops der Puffer reicht.` | wording-33 |
```

## wording-S12.21-12.23 · Prop-Bilanz: Pro Firma ohne ROI bei fehlenden Payouts, Symbolknopf „Als erhalten markieren“, Spalten „Beantragt am“/„Erhalten am“

Gruppe wording · Cluster prop · Aufwand S · Befunde: bereich_prop-24, bereich_prop-20
Quelle: audit/spec/wording.md Z. 502–504 · Dateien: web/js/screens/prop.js
Abhängig von: —

```text
| 12.21 | prop.js:258 Pro Firma | Unterzeile → `${f.received > C.EPS ? \`${fmt.cur(f.spent)} Ausgaben · ${fmt.cur(f.received)} Payouts · ROI ${f.roi == null ? '—' : fmt.pct(f.roi, 0, true)}\` : \`${fmt.cur(f.spent)} Ausgaben · noch keine Payouts\`}` | bereich_prop-24 |
| 12.22 | prop.js:267 Payout-Zeile | `<button type="button" class="btn xs" data-action="prop-payout-received" data-id="${esc(p.id)}">Erhalten</button> ` → `<button type="button" class="btn ghost icon sm" data-action="prop-payout-received" data-id="${esc(p.id)}" aria-label="Als erhalten markieren" data-tip="Als erhalten markieren">${I.check}</button>` (Leerzeichen danach entfällt) | bereich_prop-20 |
| 12.23 | prop.js:268 und :286 Spaltenköpfe | `<th>Beantragt</th><th>Erhalten</th>` → `<th>Beantragt am</th><th>Erhalten am</th>` | bereich_prop-20 |
```

## wording-S12.24-12.26 · Prop-Planer: „Mindest-Kontostand“, Bedingungen „(mind. …) · erfüllt“, alle Beträge in Kontowährung

Gruppe wording · Cluster prop · Aufwand M · Befunde: wording-32, bereich_prop-31, bereich_prop-5
Quelle: audit/spec/wording.md Z. 505–507 · Dateien: web/js/screens/prop.js
Abhängig von: —

```text
| 12.24 | prop.js:279 Planer-Banner | `(Mindest-Handelstage, Mindestgewinn oder Mindestbalance)` → `(Mindest-Handelstage, Mindestgewinn oder Mindest-Kontostand)` | wording-32 |
| 12.25 | prop.js:283 Bedingungen | Handelstage: offen → `${n} von ${o.minDays} <span class="warn">· noch ${plan.missingDays}</span>` (unverändert); erfüllt → `${n} <span class="muted">(mind. ${o.minDays})</span> <span class="pos">· erfüllt</span>`; ohne Vorgabe unverändert. Profit Target/Gewinn: `U.pnl(ev.pnl)` → `U.pnl(ev.pnl, '', { currency: a.currency })`, alle `fmt.cur(…)` → `money(a, …)`; erfüllt → `<span class="muted">(mind. ${money(a, o.minProfit)})</span> <span class="pos">· erfüllt</span>`, offen weiter mit „von“. kv `'Mindestbalance'` → `'Mindest-Kontostand'`, `fmt.balance(ev.balance)` → `fmt.balance(ev.balance, { currency: a.currency })`, gleiches Muster „(mind. …)“ wenn erfüllt | bereich_prop-31, bereich_prop-5, wording-32 |
| 12.26 | prop.js:284 Vorschlag | `fmt.cur(plan.suggestion.perDay)`, `fmt.cur(plan.suggestion.total)` → `money(a, …)` | bereich_prop-5 |
```

## wording-S12.27 · Prop-Kopfreihe: Knopf „Prop-Konto anlegen“ mit aria-label

Gruppe wording · Cluster prop · Aufwand S · Befunde: wording-34
Quelle: audit/spec/wording.md Z. 508–508 · Dateien: web/js/screens/prop.js
Abhängig von: —

```text
| 12.27 | prop.js:294 Kopfreihe | `<button type="button" class="btn" data-action="prop-account-new">${I.plus}<span class="hide-m">Prop-Konto</span></button>` → `<button type="button" class="btn" data-action="prop-account-new" aria-label="Prop-Konto anlegen">${I.plus}<span class="hide-m">Prop-Konto anlegen</span></button>` | wording-34 |
```

## wording-S12.28-12.29 · Friedhof: Lebensdauer über U.count, Grabstein-Unterzeile ohne Geldbetrag („100K“ nur ohne Namen)

Gruppe wording · Cluster prop · Aufwand S · Befunde: zustaende-28, bereich_prop-46
Quelle: audit/spec/wording.md Z. 509–510 · Dateien: web/js/screens/prop-friedhof.js
Abhängig von: wording-S1.1-1.3

```text
| 12.28 | prop-friedhof.js:56 | `` `${fmt.num(avgLife, 0)} Tage` `` → `U.count(Math.round(avgLife), 'Tag', 'Tage')` | zustaende-28 |
| 12.29 | prop-friedhof.js:136 Grabstein | `${t.size > 0 ? fmt.balance(t.size) : '—'}${t.market ? \` · ${marketLabel(t.market)}\` : ''}` → `${[!t.name && t.size > 0 ? \`${fmt.int(t.size / 1000)}K\` : '', t.market ? marketLabel(t.market) : ''].filter(Boolean).join(' · ') \|\| '—'}` | bereich_prop-46 |
```

## wording-S19-prop · Tests anpassen: proptest, friedhoftest

Gruppe wording · Cluster prop · Aufwand S · Befunde: bereich_prop-5, wording-33, wording-31, bereich_prop-46
Quelle: audit/spec/wording.md Z. 630–635 · Dateien: web/e2e/proptest.js, web/e2e/friedhoftest.js
Abhängig von: wording-S12.4-12.5, wording-S12.8-12.12, wording-S12.28-12.29

```text
| e2e/proptest.js:56 | `card.pnl.includes('€')` → `card.pnl.includes('$')`; `/noch \d+ Stop-Loss/` → `/reicht für \d+ Stop/`; `card.meta.includes('Bestehen')` → `card.meta.includes('Puffer') && !/Gewinn fehlt/.test(card.meta)`; Kommentar Z. 55 anpassen | bereich_prop-5, wording-33, wording-31 |
| e2e/proptest.js:57 | `` `noch ${ev.buffer.stops} Stop-Loss` `` → `` `reicht für ${ev.buffer.stops} Stop` `` | wording-33 |
| e2e/proptest.js:103 | `/in \d+ Handelstag\|Gewinn fehlt\|bereit\|Consistency/` → `/in \d+ Handelstag\|Gewinn fehlen\|bereit\|Consistency/` | wording-31 |
| e2e/proptest.js:116 | `'/ 150,00 € je Stop-Loss'` → Erwartung über `UI.fmt.cur(150, { currency: acc.currency })` + `' je Stop'` | bereich_prop-5, wording-33 |
| e2e/friedhoftest.js:122 | „Fix 3“: für das Konto ohne Größe und Namen genau `'Futures'` (bzw. Marktname) erwarten, nicht `startsWith('—')` | bereich_prop-46 |
| e2e/friedhoftest.js:129 | „Fix 4“: nur noch prüfen, dass im Geld-blind-Modus weder R-Wert noch €/$ in der Unterzeile steht (nicht `includes('ausgeblendet')`) | bereich_prop-46 |
```
