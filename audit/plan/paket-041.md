# Paket 041 · trades_tag, komponenten, statistik

Schritte: 4 · Dateien: web/js/screens/day.js, web/js/screens/stats.js, web/js/screens/trades.js, web/js/ui.js
Betroffene Tests laut Spezifikation: web/e2e/mobiletest.js:34 (pad '9px 10px' → '9px 8px', Schritt responsiv-3.20a); web/e2e/tlfittest.js (Desktop unverändert)
Baut auf Paketen auf: 6, 7, 17, 20, 40

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## responsiv-3.2b · Richtungs-Abzeichen: Text in span.bl (für Pfeil-only am Handy)

Gruppe responsiv · Cluster komponenten · Aufwand S · Befunde: responsiv-4, responsiv-7, bereich_trades_tag-5
Quelle: audit/spec/responsiv.md Z. 415–415 · Dateien: web/js/ui.js
Abhängig von: responsiv-A1

```text
- Z. 175 `badge`: `…</i>${dir > 0 ? 'LONG' : 'SHORT'}</span>` → `…</i><span class="bl">${dir > 0 ? 'LONG' : 'SHORT'}</span></span>` (responsiv-4, responsiv-7, bereich_trades_tag-5)
```

## responsiv-3.9b · Statistik: Tage- und Gruppentabellen mit Kernspalten am Handy

Gruppe responsiv · Cluster statistik · Aufwand M · Befunde: responsiv-5, bereich_statistik-20
Quelle: audit/spec/responsiv.md Z. 500–502 · Dateien: web/js/screens/stats.js
Abhängig von: responsiv-A1, responsiv-3.2a

```text
- Z. 32 tabDays: `<table class="tbl compact">` → `<table class="tbl compact ph-fit">`; `th` und `td` von Gewinner, Verlierer, Brutto, Gebühren, Drawdown bekommen zusätzlich `ph-hide` (`class="r ph-hide"`, bei Gewinner/Verlierer `class="r pos ph-hide"` / `class="r neg ph-hide"`, Drawdown `class="r neg ph-hide"`); Tageszelle `<td>${fmt.weekdayLong(d.day)}</td>` → `<td><span class="ph-hide">${fmt.weekdayLong(d.day)}</span><span class="ph-only">${fmt.weekdayShort(d.day)}</span></td>`
- Z. 34 groupTable: `<table class="tbl compact">` → `<table class="tbl compact ph-fit">`; `th`/`td` von „Ø pro Trade“, „Ø R“, „Profit-Faktor“ → `class="r ph-hide"`; erste `td` → `<td class="ph-wrap">`.

```

## responsiv-3.7 · TradeLog: Kernspalten am Handy (PH), Filterzeile tl-filters/tl-count, Setup-Chip mit Tooltip

Gruppe responsiv · Cluster trades_tag · Aufwand M · Befunde: responsiv-4, bereich_trades_tag-5, zustaende-30, zustaende-31, responsiv-3
Quelle: audit/spec/responsiv.md Z. 477–489 · Dateien: web/js/screens/trades.js
Abhängig von: responsiv-A1, responsiv-C2, responsiv-3.2b, responsiv-3.2c, responsiv-B5c

```text
### 3.7 web/js/screens/trades.js (responsiv-4, bereich_trades_tag-5, zustaende-30, zustaende-31, responsiv-3)

- Nach Z. 8 neu: `const PH = ['openedAt', 'symbol', 'direction', 'pnl']; /* am Handy sichtbare Spalten */`
- Z. 39 `<div class="row" style="gap:8px">` → `<div class="row tl-filters" style="gap:8px">`
- Z. 44 `<span class="muted small" style="margin-left:auto">` → `<span class="muted small tl-count">`
- Z. 46 `th`: `class="sortable ${al || ''}"` → `class="sortable ${al || ''}${PH.includes(k) ? '' : ' ph-hide'}"`
- Z. 49 Zeilen:
  - `<td>${fmt.dateFull(t.open)} <span class="muted">${fmt.time(t.open)}</span></td>` → `<td><span class="ph-hide">${fmt.dateFull(t.open)}</span><span class="ph-only">${fmt.dateDM(t.open)}</span> <span class="muted">${fmt.time(t.open)}</span></td>`
  - Status-`td` → `<td class="ph-hide">`, Geschlossen-`td` → `<td class="ph-hide">`, Einstieg/Ausstieg/RR/Regeln/Score-`td` → `class="r ph-hide"`, Setup-`td` → `<td class="ph-hide">`
  - `U.chip(t.setup, 'setup')` → `U.chip(t.setup, 'setup', t.setup.length > 20 ? t.setup : '')`
- Z. 50 `<table class="tbl">` → `<table class="tbl ph-fit">`
- Z. 59 (Verpasste Trades) `U.chip(x.setup, 'setup')` → `U.chip(x.setup, 'setup', x.setup.length > 20 ? x.setup : '')`

```

## responsiv-3.8 · Trades des Tages: Kernspalten am Handy, day-tbl statt Inline-Mindestbreite

Gruppe responsiv · Cluster trades_tag · Aufwand S · Befunde: responsiv-7, bereich_trades_tag-5, zustaende-31
Quelle: audit/spec/responsiv.md Z. 490–496 · Dateien: web/js/screens/day.js
Abhängig von: responsiv-A1, responsiv-B5a, responsiv-3.2b, responsiv-3.2c

```text
### 3.8 web/js/screens/day.js:15 (responsiv-7, bereich_trades_tag-5, zustaende-31)

- `<table class="tbl compact" style="min-width:560px">` → `<table class="tbl compact day-tbl ph-fit">`
- Kopf: `<th>Setup</th><th>Status</th>` → `<th class="ph-hide">Setup</th><th class="ph-hide">Status</th>`; `<th class="r">R</th><th class="r">Score</th>` → `<th class="r ph-hide">R</th><th class="r ph-hide">Score</th>`
- Zeit: `${t.close ? \` – ${fmt.time(t.close)}\` : ''}` → `${t.close ? \`<span class="ph-hide"> – ${fmt.time(t.close)}</span>\` : ''}`
- Setup-`td` → `<td class="ph-hide">`, Chip mit `U.chip(t.setup, 'setup', t.setup.length > 20 ? t.setup : '')`; Status-`td` → `<td class="ph-hide">`; R- und Score-`td` → `class="r ph-hide"`.

```
