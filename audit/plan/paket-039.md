# Paket 039 · trades_tag, komponenten, statistik

Schritte: 4 · Dateien: web/js/screens/day.js, web/js/screens/stats.js, web/js/screens/trades.js, web/js/ui.js
Betroffene Tests laut Spezifikation: web/e2e/mobiletest.js:34 (pad '9px 10px' → '9px 8px', Schritt responsiv-3.20a); web/e2e/tlfittest.js (Desktop unverändert)
Baut auf Paketen auf: 7, 15, 19, 38

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## responsiv-3.2b · Richtungs-Abzeichen: Text in span.bl (für Pfeil-only am Handy)

Gruppe responsiv · Cluster komponenten · Aufwand S · Befunde: responsiv-4, responsiv-7, bereich_trades_tag-5
Quelle: audit/spec/responsiv.md Z. 415–415 · Dateien: web/js/ui.js
Abhängig von: responsiv-A1

```text
- Z. 175 `badge`: `…</i>${dir > 0 ? 'LONG' : 'SHORT'}</span>` → `…</i><span class="bl">${dir > 0 ? 'LONG' : 'SHORT'}</span></span>` (responsiv-4, responsiv-7, bereich_trades_tag-5)
```

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: td.dir-cell] Symbol und Richtung stehen in zwei Zellen (td.sym + td.dir-cell) unter einem Kopf „Symbol“ mit colspan 2. Im TradeLog über COLS ['symbol', 'Symbol', '', 2] (aufbau-C15a), bei Verpassten Trades über das Markup (komponenten-S-trades-e); das Richtungs-Abzeichen bekommt span.bl (responsiv-3.2b). responsiv-3.7 baut auf der neuen Spaltenfolge auf: `PH = ['openedAt', 'symbol', 'pnl']`, die Schlüssel 'direction' und 'status' gibt es nicht mehr. td.dir-cell bekommt nie ph-hide (am Handy nur der Pfeil). Es gibt keine Status-Zelle mehr; ph-hide kommt an Geschlossen, Setup, Einstieg, Ausstieg, R, Regeln und Score. Die Datumszelle „Eröffnet“ bleibt bei typografie-3.8c (fmt.dateRow ist schon kurz), es gibt kein Paar aus ph-hide und ph-only.

## responsiv-3.9b · Statistik: Tage- und Gruppentabellen mit Kernspalten am Handy

Gruppe responsiv · Cluster statistik · Aufwand M · Befunde: responsiv-5, bereich_statistik-20
Quelle: audit/spec/responsiv.md Z. 500–502 · Dateien: web/js/screens/stats.js
Abhängig von: responsiv-A1, responsiv-3.2a

```text
- Z. 32 tabDays: `<table class="tbl compact">` → `<table class="tbl compact ph-fit">`; `th` und `td` von Gewinner, Verlierer, Brutto, Gebühren, Drawdown bekommen zusätzlich `ph-hide` (`class="r ph-hide"`, bei Gewinner/Verlierer `class="r pos ph-hide"` / `class="r neg ph-hide"`, Drawdown `class="r neg ph-hide"`); Tageszelle `<td>${fmt.weekdayLong(d.day)}</td>` → `<td><span class="ph-hide">${fmt.weekdayLong(d.day)}</span><span class="ph-only">${fmt.weekdayShort(d.day)}</span></td>`
- Z. 34 groupTable: `<table class="tbl compact">` → `<table class="tbl compact ph-fit">`; `th`/`td` von „Ø pro Trade“, „Ø R“, „Profit-Faktor“ → `class="r ph-hide"`; erste `td` → `<td class="ph-wrap">`.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: fmt.weekdayLong] Ein Formatierer und eine Zellform auf allen Breiten. Statistik → Tage zeigt das Datum überall als „Do., 08.10.“, über eine Jahresgrenze „Do., 08.10.25“. Es kommt aus fmt.weekdayDM(d, withYear) (typografie-3.4d), die Zelle steht in Onest (class="num"). Endzustand der Tageszelle in stats.js Z. 32: `<td class="num"><a class="row-link" href="#/day/${d.key}">${fmt.weekdayDM(d.day, multiYear)}</a></td>`, multiYear aus typografie-3.8e. Grund: Die Kurzform passt schon bei 390 px. Eine zweite Handy-Variante (ph-hide/ph-only) und ein zweiter Formatierer mit gleicher Ausgabe (fmt.weekdayShort) wären doppelt, und die Typografie-Regel legt die Tagestabelle auf „Do., 08.10.“ fest. Die übrigen Handy-Maßnahmen aus responsiv-3.9b bleiben: ph-fit, ph-hide an Gewinner, Verlierer, Brutto, Gebühren und Drawdown sowie die Änderungen an groupTable.
- ÄNDERN: Die Tageszelle nicht in `<span class="ph-hide">…</span><span class="ph-only">…</span>` aufteilen. Sie bleibt so, wie typografie-3.8e und barrierefreiheit-C-stats-32 sie setzen. Nur umsetzen: Klasse ph-fit an der Tabelle, ph-hide an th/td von Gewinner, Verlierer, Brutto, Gebühren und Drawdown sowie die groupTable-Änderungen (Z. 34).

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: trades.renderMissed] renderMissed folgt aufbau-C15c: Filter nach Zeitraum und Konto, zwei Leerzustände, accountId beim Speichern. Der Kartenkopf (Z. 59) wird einmal so umgesetzt: `<div><div class="kpi-label">${total >= 0 ? 'Entgangen' : 'Verlust vermieden'}</div><div class="score-big">${fmt.cur(Math.abs(total))}</div></div><div><div class="kpi-label">Wären Gewinner gewesen</div><div class="score-big">${wins} von ${m.length}</div></div>`. Der Inhalt (Beschriftungswechsel, ohne Vorzeichen und Farbe) kommt aus farbe-C31b (Farbregel „Verpasste Trades“), die Klasse aus aufbau-C15c. total und wins werden aus der gefilterten Liste m berechnet. Die Tabellenzellen derselben Zeile sind verträglich: komponenten-S-trades-e (Symbol/Richtung), responsiv-3.7 (Setup-Tooltip), typografie-3.8c (Datum num/dateRow).
- [reihenfolge: td.dir-cell] Symbol und Richtung stehen in zwei Zellen (td.sym + td.dir-cell) unter einem Kopf „Symbol“ mit colspan 2. Im TradeLog über COLS ['symbol', 'Symbol', '', 2] (aufbau-C15a), bei Verpassten Trades über das Markup (komponenten-S-trades-e); das Richtungs-Abzeichen bekommt span.bl (responsiv-3.2b). responsiv-3.7 baut auf der neuen Spaltenfolge auf: `PH = ['openedAt', 'symbol', 'pnl']`, die Schlüssel 'direction' und 'status' gibt es nicht mehr. td.dir-cell bekommt nie ph-hide (am Handy nur der Pfeil). Es gibt keine Status-Zelle mehr; ph-hide kommt an Geschlossen, Setup, Einstieg, Ausstieg, R, Regeln und Score. Die Datumszelle „Eröffnet“ bleibt bei typografie-3.8c (fmt.dateRow ist schon kurz), es gibt kein Paar aus ph-hide und ph-only.
- ÄNDERN: Teil Tabelle: `const PH = ['openedAt', 'symbol', 'pnl'];` th-Klasse über PH wie spezifiziert, der Symbol-Kopf mit colspan 2 bleibt sichtbar. td.sym und td.dir-cell ohne ph-hide. Die Status-Zelle entfällt (aufbau-C15a), „RR“ heißt „R“. Die Zelle „Eröffnet“ nicht ändern (typografie-3.8c). Setup-Chip-Tooltip (Z. 49, Z. 59) und `tbl ph-fit` bleiben.
- [doppelt: .tl-filters] wording-S9.3-9.7 setzt das Markup der Filterzeile einmal um: `row tl-filters` > `grow tl-search` + `tl-sel` (Selects und Zurücksetzen) + `muted small tl-count`, „Trades durchsuchen“, Zähler mit U.count, Filterzeile nur mit Trades. responsiv-3.7 setzt dieselben Klassen tl-filters und tl-count; dieser Teil entfällt dort. Das CSS aus responsiv-C2 bleibt (`.tl-filters .select { max-width: 200px; … }`, `.tl-count { margin-left: auto; white-space: nowrap; flex: 0 0 auto; }`). Es greift auch innerhalb von .tl-sel und muss stehen, bevor das Inline-`margin-left:auto` wegfällt.
- ÄNDERN: Den Teil Filterzeile (Z. 39 tl-filters, Z. 44 tl-count) setzt wording-S9.3-9.7 um; hier nicht noch einmal.
- [doppelt: .tl-count] Wie bei .tl-filters: Die Klasse tl-count setzt wording-S9.3-9.7, die Regel `.tl-count { margin-left: auto; white-space: nowrap; flex: 0 0 auto; }` kommt aus responsiv-C2. Der Zähler-Teil von responsiv-3.7 entfällt (Anpassung unter .tl-filters).
- [reihenfolge: U.chip] 3.2c erweitert U.chip um den Parameter tip, und 3.7 und 3.8 rufen ihn auf. Deshalb kommt 3.2c zuerst. S-T4 und 3.7 ändern dieselbe Stelle trades.js:59; die Endform ist x.setup ? U.chip(x.setup, 'setup', x.setup.length > 20 ? x.setup : '') : '<span class="faint">—</span>'. In trades.js:49 ergänzen sich die ph-hide-Klassen aus 3.7 und „—“ in .faint für Geschlossen und Ausstieg aus S-T4. typografie-3.8l (join(' ') im Friedhof) hängt davon nicht ab.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: U.chip] 3.2c erweitert U.chip um den Parameter tip, und 3.7 und 3.8 rufen ihn auf. Deshalb kommt 3.2c zuerst. S-T4 und 3.7 ändern dieselbe Stelle trades.js:59; die Endform ist x.setup ? U.chip(x.setup, 'setup', x.setup.length > 20 ? x.setup : '') : '<span class="faint">—</span>'. In trades.js:49 ergänzen sich die ph-hide-Klassen aus 3.7 und „—“ in .faint für Geschlossen und Ausstieg aus S-T4. typografie-3.8l (join(' ') im Friedhof) hängt davon nicht ab.
