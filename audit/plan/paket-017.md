# Paket 017 · trades_tag

Schritte: 26 · Dateien: web/README.md, web/css/app.css, web/e2e/mobiletest.js, web/js/app.js, web/js/screens/day.js, web/js/screens/trades.js
Betroffene Tests laut Spezifikation: Akzeptanz 4.3 day; Akzeptanz 4.3 trades (Datumsspalte „08.10. 19:43“ in Onest); Akzeptanz 4.4: grep "<td>\${fmt.(date|time)" ohne Treffer; e2e/blindtest.js:23 (#f-dir); e2e/tradeformtest.js; web/e2e/certtest.js:54; web/e2e/certtest.js:54 (Zertifikat-Knopf in der Tagesansicht bleibt); web/e2e/mobiletest.js:31; web/e2e/tlfittest.js; web/e2e/tradeformtest.js (Handy 390×844 ohne Scrollen, muss grün bleiben); web/e2e/tradeformtest.js (muss grün bleiben); web/tests/inline-style.test.mjs (Zählung, Schritt R5)
Baut auf Paketen auf: 1, 2, 3, 4, 8

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## farbe-B17 · Long/Short-Schalter im Trade-Dialog flach getönt, Pfeilkreis ohne Glow

Gruppe farbe · Cluster trades_tag · Aufwand S · Befunde: bereich_trades_tag-12
Quelle: audit/spec/farbe.md Z. 304–308 · Dateien: web/css/app.css
Abhängig von: —

```text
**B17 – Long/Short-Schalter im Trade-Dialog** — bereich_trades_tag-12
- Kommentar Z. 841 „eine leuchtende Fläche gleitet“ → „eine flache, leicht getönte Fläche gleitet“
- Z. 853–854 (in `.dir-switch::before`, Z. 852 mit `transition` bleibt unverändert): `background: linear-gradient(90deg, color-mix(in srgb, var(--dir-c) 26%, var(--surface-2)), color-mix(in srgb, var(--dir-c) 7%, var(--surface-2)) 85%); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--dir-c) 42%, transparent), -6px 4px 18px -10px color-mix(in srgb, var(--dir-c) 60%, transparent);` → `background: color-mix(in srgb, var(--dir-c) 10%, var(--surface)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--dir-c) 22%, var(--border-2));`
- Z. 869 `.dir-opt[aria-pressed="true"] .bi { background: var(--oc); box-shadow: 0 0 10px color-mix(in srgb, var(--oc) 50%, transparent); }` → `box-shadow: none;` (Fläche `var(--oc)` bleibt)

```

## farbe-C12b · Check-in: sleepZone „fit“ und scaleColor auf --profit (Zwischenstufe aus --loss/--warn)

Gruppe farbe · Cluster trades_tag · Aufwand S · Befunde: farbe_kontrast-19, bereich_trades_tag-45
Quelle: audit/spec/farbe.md Z. 432–433 · Dateien: web/js/app.js
Abhängig von: —

```text
- Z. 497 `App.sleepZone`, Zweig fit: `color: 'var(--accent)'` → `'var(--profit)'`; Z. 501 `fit: { color: 'var(--accent)', … }` → `'var(--profit)'`
- Z. 511 `App.scaleColor`: `['var(--loss)', '#ff8c5c', 'var(--warn)', 'color-mix(in srgb, var(--accent) 70%, var(--warn))', 'var(--accent)']` → `['var(--loss)', 'color-mix(in srgb, var(--loss) 55%, var(--warn))', 'var(--warn)', 'color-mix(in srgb, var(--profit) 70%, var(--warn))', 'var(--profit)']`
```

## farbe-C12c · Session-Ende und Import: Hinweise .lbl-hint bzw. muted statt faint

Gruppe farbe · Cluster trades_tag · Aufwand S · Befunde: barrierefreiheit-25, farbe_kontrast-11, bereich_trades_tag-42
Quelle: audit/spec/farbe.md Z. 434–437 · Dateien: web/js/app.js
Abhängig von: farbe-B3a

```text
- Z. 533 `<span class="faint">(wird in die Tagesnotiz im Notebook geschrieben)</span>` → `<span class="lbl-hint">…</span>`
- Z. 560 `<div class="small faint" …>Exporte von Brokern …` → `class="small muted"`
- Z. 567 `'<span class="faint">offen</span>'` → `'<span class="muted">offen</span>'`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: App.openSessionEnd] kilook-C8c setzt app.js:530 einmal um: dreimal `<div class="kpi-label">` mit den Beschriftungen „Heute“, „Trades“, „Trefferquote“ (Wording-Glossar, nie „Win-Rate“). guard: true (P14b, Z. 529), die Checkbox .vh mit done (P14c, Z. 531) und der Hinweis .lbl-hint (farbe-C12c, Z. 533) betreffen andere Stellen und sind verträglich.

## farbe-C20 · Tagesansicht: Pille „Heute“ neutral, Zähler nur > 0 gefärbt, Score mit scoreText, Leertext muted, Knopf neutral

Gruppe farbe · Cluster trades_tag · Aufwand S · Befunde: farbe_kontrast-24, referenz-8, komponenten-8, bereich_trades_tag-25, farbe_kontrast-42, bereich_trades_tag-19, barrierefreiheit-25, bereich_trades_tag-21
Quelle: audit/spec/farbe.md Z. 474–479 · Dateien: web/js/screens/day.js
Abhängig von: farbe-B27a

```text
**C20 – `web/js/screens/day.js`** — farbe_kontrast-24, referenz-8, komponenten-8, bereich_trades_tag-25, farbe_kontrast-42, bereich_trades_tag-19, barrierefreiheit-25, bereich_trades_tag-21
- Z. 12 `U.pill('Heute', 'win')` → `U.pill('Heute', 'neutral')`
- Z. 14 `<span class="pos">${s.wins}</span> / <span class="neg">${s.losses}</span>` → `<span class="${s.wins ? 'pos' : ''}">${s.wins}</span> / <span class="${s.losses ? 'neg' : ''}">${s.losses}</span>`
- Z. 15 `<b style="color:${U.scoreColor(sc)}">${sc}</b>` → `<span style="color:${U.scoreText(sc)}">${sc}</span>`
- Z. 19 `<span class="faint">Noch leer.</span>` → `<span class="muted">Noch leer.</span>`; `class="btn sm primary" data-action="nb-day-note"` → `class="btn sm"`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .pos] Dieselbe Zählerfärbung steht wortgleich in mehreren Gruppen: Gewinner/Verlierer bzw. Gewinntage/Verlusttage nur bei > 0 als pos/neg, Tabellen-Zählspalten neutral. Betroffen sind day.js:14 (diagramme-M1, zustaende-S-DY2, farbe-C20), trades.js:54 (diagramme-M1, farbe-C31b) und stats.js:31/32 (diagramme-G3, farbe-C30). Sie wird einmal umgesetzt: diagramme-M1 für day.js:14 und trades.js:54, diagramme-G3 für stats.js:31/32, genau mit den dort genannten Werten. TradeLog-Regeln-Spalte trades.js:49: Klasse und Symbole nach farbe-C31a (Regel „✓ --muted, × --loss“). barrierefreiheit-C-trades-49 ergänzt nur die Namen: `<span class="rule-ic muted" role="img" aria-label="Alle Regeln eingehalten">${I.check}</span>` bzw. `<span class="rule-ic neg" role="img" aria-label="Gebrochen: ${esc(t.rulesBroken.join(', '))}" data-tip="${esc(t.rulesBroken.join(', '))}">${I.close}</span>`. Der row-link in der ersten Zelle bleibt wie in C-trades-49.
- [konflikt: U.card] (1) Statistik-Kurve: Platz und Titel folgen aufbau-C14b, also erste Karte in „Übersicht“, Titel „Kumulierter Netto-P&L“, h240, ohne Legende; über dem Inhalt stehen nur die Reiter. Der Inhalt folgt diagramme-G1/A-14: ein Punkt je Handelstag, kein fillDays. „Nur mit abgeschlossenen Trades“ ist durch die Leer-Prüfung am Anfang von tabSummary erfüllt (zustaende-S-ST2). zustaende-S-ST1 entfällt, fillDays löscht diagramme-G2. (2) Tagesansicht, Kennzahlenkarte: nur mit Trades, die Spark nur mit abgeschlossenen Trades (zustaende-S-DY2). Gewinner und Verlierer werden nur bei > 0 gefärbt, das setzt farbe-C20 einmal um. (3) Fortschritt: Die Karte heißt „Regeltreue“ (wording 8.6) und hat den Inhalt aus kilook-C18 („—“ ohne Grundlage, Ring nur mit Wert). Die Prüflisten (aufbau Prüfung Z. 750, README in kilook-C28) nennen „Regeltreue“. (4) „Aktuelle Regeln“ entfällt (siehe #/settings/regeln), die Tage-Tabelle steht in „Tage im Detail“ (siehe .tbl-wrap.inset). Verträglich sind aufbau-B8 (h2), abstaende-I3, komponenten-S-prop-c, wording-S10.1-10.7 und wording-S11.6-11.11.
- [konflikt: U.pill] „Heute“ in der Tagesansicht wird `U.pill('Heute', 'neutral')` (farbe-C20; BRIEF: Grün nur für Gewinn und „Trade loggen“). Weil die Datumszeile im Inhalt bleibt (siehe ctx.headLeft), setzt farbe-C20 das direkt in day.js:12 um; die Pille mit 'win' aus abstaende-E-day2 entfällt. Die übrigen Pillen sind verträglich: aufbau-C3 „Beispieldaten“ neutral, farbe-C16 „Ausgezahlt“ als .muted-Text, farbe-C17a und kilook-C21 Coach-Pillen neutral (U.pill ohne Art ist neutral), farbe-C22b „Aktiv“, farbe-C26a „geprüft“ und Status. responsiv-3.12c übernimmt die Statusart der Payout-Zeile.
- [konflikt: .btn.primary] (1) Gewicht: .btn.primary bekommt 700 (typografie-3.2.4b). Grundlage sind BRIEF („nur Werte und Hauptknöpfe 700“) und README Z. 209–210 („Hauptknöpfe („Trade loggen“, Speichern) fett“). Heute rendert 600 ohnehin als 700, sichtbar ändert sich also nichts. farbe-B2 und farbe-D3e nennen kein Gewicht mehr. (2) Rolle nach der Komponenten-Regel: .btn.primary steht nur im Dialog-Fuß, im Popover- bzw. Panel-Fuß (eine abschließende Aktion) und beim Absenden des Hauptformulars einer Seite. Auslöser, Leerzustand-, Banner- und Listen-Aktionen sowie Inline-Formulare in Karten und Widgets sind .btn bzw. .btn.sm. Grund: Das bleibt ruhig, egal wie N1 ausgeht; bei Variante B wäre jeder primary der lauteste Punkt der Seite und lauter als „Trade loggen“. Damit sind neutral: widgets.js:374 (Mentor-Frage im Widget) `btn`, coach.js:129/140/148 `btn sm`, notebook.js:67 „Wiederherstellen“ `btn sm`, prop.js:82 (Leerzustand) `btn sm`, prop.js:97 „Als bestanden markieren“ `btn sm`, prop.js:262/266 „Ausgabe/Payout erfassen“ `btn`, „Konto hinzufügen“ im Konten-Bereichskopf misc.js:186 `btn` (nicht sm, Seitenebene). (3) Doppelte Knopfänderungen führen die komponenten-S-Schritte aus. Die farbe-C-Schritte lassen ihre Knopf-Teile weg, ihre Farbteile bleiben. Ausnahme ist der Willkommen-Banner dashboard.js:130: farbe-C19c schreibt den ganzen Aufruf neu und übernimmt damit auch den Knopf. (4) README: farbe-D3e ersetzt Z. 203–208 sofort, aber ohne Aussehen und Gewicht von .btn.primary. komponenten-R1f setzt danach auf und zieht Z. 207–208 bzw. Z. 191 erst nach den Antworten N1/N2 nach, wie dort vorgesehen.
- VERBINDLICH (Kreuzprüfung): day.js. (1) Z. 12 `U.pill('Heute', 'win')` → `U.pill('Heute', 'neutral')`; die Pille bleibt in der Datumszeile (siehe abstaende-E-day2). (2) Z. 15, Trades-Tabelle: `<b style="color:${U.scoreColor(sc)}">${sc}</b>` → `<span style="color:${U.scoreText(sc)}">${sc}</span>`; U.scoreText kommt aus farbe-B27a. (3) Z. 19, Tagesnotiz: `<span class="faint">Noch leer.</span>` → `<span class="muted">Noch leer.</span>`. Folgendes entfällt: Z. 14 (Zähler Gewinner/Verlierer nur bei > 0 gefärbt) setzt diagramme-M1 mit denselben Werten um. Den Knopf „Tagesnotiz anlegen“ (`btn sm primary` → `btn sm`) übernimmt komponenten-S-day-d.

## farbe-C31a · TradeLog: Leerzustand „Trade loggen“ accent, Score über scoreText, Regeln-Symbol .rule-ic, „offen“ muted

Gruppe farbe · Cluster trades_tag · Aufwand M · Befunde: bereich_trades_tag-21, bereich_trades_tag-19, bereich_trades_tag-42, barrierefreiheit-25, farbe_kontrast-11
Quelle: audit/spec/farbe.md Z. 539–541 · Dateien: web/js/screens/trades.js
Abhängig von: farbe-B26, farbe-B27a

```text
**C31 – `web/js/screens/trades.js`** — bereich_trades_tag-21, bereich_trades_tag-19, bereich_trades_tag-42, barrierefreiheit-25, bereich_trades_tag-25, bereich_trades_tag-29, farbe_kontrast-11
- Z. 45 (Leerzustand) `class="btn sm primary" data-action="new-trade"` → `class="btn sm accent"`
- Z. 49 Score: `<b style="color:${U.scoreColor(sc)}">${sc}</b>` → `<span style="color:${U.scoreText(sc)}">${sc}</span>`; Regeln: `<span class="pos">${I.check.replace('<svg', '<svg style="width:14px;height:14px;display:inline"')}</span>` → `<span class="rule-ic muted">${I.check}</span>` und `<span class="neg" data-tip="…">${I.close.replace(…)}</span>` → `<span class="rule-ic neg" data-tip="…">${I.close}</span>`; `'<span class="faint">offen</span>'` → `'<span class="muted">offen</span>'` (die beiden „—“ bleiben `faint`)
```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .pos] Dieselbe Zählerfärbung steht wortgleich in mehreren Gruppen: Gewinner/Verlierer bzw. Gewinntage/Verlusttage nur bei > 0 als pos/neg, Tabellen-Zählspalten neutral. Betroffen sind day.js:14 (diagramme-M1, zustaende-S-DY2, farbe-C20), trades.js:54 (diagramme-M1, farbe-C31b) und stats.js:31/32 (diagramme-G3, farbe-C30). Sie wird einmal umgesetzt: diagramme-M1 für day.js:14 und trades.js:54, diagramme-G3 für stats.js:31/32, genau mit den dort genannten Werten. TradeLog-Regeln-Spalte trades.js:49: Klasse und Symbole nach farbe-C31a (Regel „✓ --muted, × --loss“). barrierefreiheit-C-trades-49 ergänzt nur die Namen: `<span class="rule-ic muted" role="img" aria-label="Alle Regeln eingehalten">${I.check}</span>` bzw. `<span class="rule-ic neg" role="img" aria-label="Gebrochen: ${esc(t.rulesBroken.join(', '))}" data-tip="${esc(t.rulesBroken.join(', '))}">${I.close}</span>`. Der row-link in der ersten Zelle bleibt wie in C-trades-49.
- [konflikt: .btn.accent] .btn.accent steht nur noch für „Trade loggen“ (App.newTradeButton `.btn.accent.tl` und der runde Handy-Knopf). Aktiver Dashboard-Filter: Klasse `is-on`. So steht es in zustaende-S-D2/-S-C7, kollisionsfrei und im gemeinsamen Ausgewählt-Stil. farbe-C19b/-B25 nennen denselben Zustand `.dh-context .btn.is-set`; das entfällt. Das aria-label „Filter ({0} aktiv)“ aus farbe-C19b bleibt. TradeLog-Leerzustand „Trade loggen“: neutral `btn sm` (komponenten-S-trades-b). Gründe: Die Kopfreihe trägt „Trade loggen“ schon, die Farbe-Spezifikation selbst verlangt „1 je Ansicht“, BRIEF spricht von dem einen Hauptknopf, und Leerzustand-Aktionen sind btn sm. „Trade für diesen Tag“ entfällt (wording-S8.1-8.2). Damit ist jedes .btn.accent ein Hauptknopf: `.btn.accent` font-weight 600 → 700 direkt, ohne eigene Regel `.btn.accent.tl`; die wäre eine wirkungslose Doppelregel. Der aktive Filter (is-on) bleibt 500 wie jeder Knopf, also nicht fetter.
- ÄNDERN: Der Z.-45-Teil (Leerzustand `btn sm accent`) entfällt; der Knopf wird `btn sm` (komponenten-S-trades-b). Score über scoreText, `.rule-ic` und „offen“ muted bleiben.

## farbe-C31b · Tageskarten-Zähler nur > 0 gefärbt; Verpasste Trades „Entgangen“/„Verlust vermieden“ ohne Vorzeichen und Farbe

Gruppe farbe · Cluster trades_tag · Aufwand S · Befunde: bereich_trades_tag-25, bereich_trades_tag-29
Quelle: audit/spec/farbe.md Z. 542–543 · Dateien: web/js/screens/trades.js
Abhängig von: —

```text
- Z. 54 Tageskarten: `<span class="pos">${d.wins}</span> / <span class="neg">${d.losses}</span>` → `<span class="${d.wins ? 'pos' : ''}">${d.wins}</span> / <span class="${d.losses ? 'neg' : ''}">${d.losses}</span>`
- Z. 59 Verpasste Trades: `<div class="caption">Entgangen</div><div class="score-big ${U.cls(total)}">${fmt.cur(total, { signed: true })}</div>` → `<div class="caption">${total >= 0 ? 'Entgangen' : 'Verlust vermieden'}</div><div class="score-big">${fmt.cur(Math.abs(total))}</div>`
```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .pos] Dieselbe Zählerfärbung steht wortgleich in mehreren Gruppen: Gewinner/Verlierer bzw. Gewinntage/Verlusttage nur bei > 0 als pos/neg, Tabellen-Zählspalten neutral. Betroffen sind day.js:14 (diagramme-M1, zustaende-S-DY2, farbe-C20), trades.js:54 (diagramme-M1, farbe-C31b) und stats.js:31/32 (diagramme-G3, farbe-C30). Sie wird einmal umgesetzt: diagramme-M1 für day.js:14 und trades.js:54, diagramme-G3 für stats.js:31/32, genau mit den dort genannten Werten. TradeLog-Regeln-Spalte trades.js:49: Klasse und Symbole nach farbe-C31a (Regel „✓ --muted, × --loss“). barrierefreiheit-C-trades-49 ergänzt nur die Namen: `<span class="rule-ic muted" role="img" aria-label="Alle Regeln eingehalten">${I.check}</span>` bzw. `<span class="rule-ic neg" role="img" aria-label="Gebrochen: ${esc(t.rulesBroken.join(', '))}" data-tip="${esc(t.rulesBroken.join(', '))}">${I.close}</span>`. Der row-link in der ersten Zelle bleibt wie in C-trades-49.
- [konflikt: trades.renderMissed] renderMissed folgt aufbau-C15c: Filter nach Zeitraum und Konto, zwei Leerzustände, accountId beim Speichern. Der Kartenkopf (Z. 59) wird einmal so umgesetzt: `<div><div class="kpi-label">${total >= 0 ? 'Entgangen' : 'Verlust vermieden'}</div><div class="score-big">${fmt.cur(Math.abs(total))}</div></div><div><div class="kpi-label">Wären Gewinner gewesen</div><div class="score-big">${wins} von ${m.length}</div></div>`. Der Inhalt (Beschriftungswechsel, ohne Vorzeichen und Farbe) kommt aus farbe-C31b (Farbregel „Verpasste Trades“), die Klasse aus aufbau-C15c. total und wins werden aus der gefilterten Liste m berechnet. Die Tabellenzellen derselben Zeile sind verträglich: komponenten-S-trades-e (Symbol/Richtung), responsiv-3.7 (Setup-Tooltip), typografie-3.8c (Datum num/dateRow).
- VERBINDLICH (Kreuzprüfung): trades.js, `renderMissed`, Kartenkopf (Z. 59). `<div class="caption">Entgangen</div><div class="score-big ${U.cls(total)}">${fmt.cur(total, { signed: true })}</div>` samt Nachbarblock → `<div><div class="kpi-label">${total >= 0 ? 'Entgangen' : 'Verlust vermieden'}</div><div class="score-big">${fmt.cur(Math.abs(total))}</div></div><div><div class="kpi-label">Wären Gewinner gewesen</div><div class="score-big">${wins} von ${m.length}</div></div>`. Der Wert hat kein Vorzeichen und keine Farbe. Die Klasse ist `.kpi-label` wie in aufbau-C15c, nicht `.caption` und nicht `.val-label`. total und wins werden aus der gefilterten Liste m von aufbau-C15c berechnet. Wer von farbe-C31b und aufbau-C15c zuletzt umsetzt, stellt diese Endfassung her. Folgendes entfällt: Z. 54 (Tageskarten-Zähler nur bei > 0 gefärbt), das diagramme-M1 mit denselben Werten umsetzt.

## farbe-C31c · Trade-Ansicht: Disziplin-Teilwerte, „Keine Fehler markiert“, Sprachnotiz muted, Knöpfe neutral

Gruppe farbe · Cluster trades_tag · Aufwand S · Befunde: bereich_trades_tag-19, bereich_trades_tag-21, farbe_kontrast-11
Quelle: audit/spec/farbe.md Z. 544–548 · Dateien: web/js/screens/trades.js
Abhängig von: farbe-A1, farbe-A2

```text
- Z. 74 Disziplin-Teilwerte: `c.f >= 0.99 ? 'var(--accent)' : c.f > 0 ? 'var(--warn)' : 'var(--loss)'` → `c.f >= 0.99 ? 'var(--text-2)' : c.f > 0 ? 'var(--warn-text)' : 'var(--loss)'`
- Z. 76 `class="pos small">Keine Fehler markiert` → `class="muted small"`
- Z. 83 `${v.transcript ? '' : 'faint'}` → `${v.transcript ? '' : 'muted'}`
- Z. 84 `class="btn sm primary" data-action="voice-open"` → `class="btn sm"`; Z. 85 `class="btn primary sm" data-action="edit-trade"` → `class="btn sm"`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .btn.primary] (1) Gewicht: .btn.primary bekommt 700 (typografie-3.2.4b). Grundlage sind BRIEF („nur Werte und Hauptknöpfe 700“) und README Z. 209–210 („Hauptknöpfe („Trade loggen“, Speichern) fett“). Heute rendert 600 ohnehin als 700, sichtbar ändert sich also nichts. farbe-B2 und farbe-D3e nennen kein Gewicht mehr. (2) Rolle nach der Komponenten-Regel: .btn.primary steht nur im Dialog-Fuß, im Popover- bzw. Panel-Fuß (eine abschließende Aktion) und beim Absenden des Hauptformulars einer Seite. Auslöser, Leerzustand-, Banner- und Listen-Aktionen sowie Inline-Formulare in Karten und Widgets sind .btn bzw. .btn.sm. Grund: Das bleibt ruhig, egal wie N1 ausgeht; bei Variante B wäre jeder primary der lauteste Punkt der Seite und lauter als „Trade loggen“. Damit sind neutral: widgets.js:374 (Mentor-Frage im Widget) `btn`, coach.js:129/140/148 `btn sm`, notebook.js:67 „Wiederherstellen“ `btn sm`, prop.js:82 (Leerzustand) `btn sm`, prop.js:97 „Als bestanden markieren“ `btn sm`, prop.js:262/266 „Ausgabe/Payout erfassen“ `btn`, „Konto hinzufügen“ im Konten-Bereichskopf misc.js:186 `btn` (nicht sm, Seitenebene). (3) Doppelte Knopfänderungen führen die komponenten-S-Schritte aus. Die farbe-C-Schritte lassen ihre Knopf-Teile weg, ihre Farbteile bleiben. Ausnahme ist der Willkommen-Banner dashboard.js:130: farbe-C19c schreibt den ganzen Aufruf neu und übernimmt damit auch den Knopf. (4) README: farbe-D3e ersetzt Z. 203–208 sofort, aber ohne Aussehen und Gewicht von .btn.primary. komponenten-R1f setzt danach auf und zieht Z. 207–208 bzw. Z. 191 erst nach den Antworten N1/N2 nach, wie dort vorgesehen.
- ÄNDERN: Die Knopf-Teile an Z. 84/85 entfallen (komponenten-S-trades-f). Disziplin-Teilwerte, „Keine Fehler markiert“ und Sprachnotiz muted bleiben.

## farbe-D3a · README Z. 43: Long/Short-Fläche „flach, leicht getönt“

Gruppe farbe · Cluster trades_tag · Aufwand S · Befunde: bereich_trades_tag-12
Quelle: audit/spec/farbe.md Z. 565–566 · Dateien: web/README.md
Abhängig von: farbe-B17

```text
**D3 – `web/README.md`**
- Z. 43: „eine leuchtende Fläche gleitet zur gewählten Seite“ → „eine flache, leicht getönte Fläche gleitet zur gewählten Seite“ — bereich_trades_tag-12
```

## typografie-3.7b · CSV-Vorschau: Datumszellen mit Klasse num

Gruppe typografie · Cluster trades_tag · Aufwand S · Befunde: typografie-12
Quelle: audit/spec/typografie.md Z. 416–417 · Dateien: web/js/app.js
Abhängig von: typografie-3.2.2f

```text
| Z. 567 (CSV-Vorschau) | `<td>${fmt.dateTime(d.open)}</td>` → `<td class="num">…`; `<td>${d.close ? fmt.dateTime(d.close) : '<span class="faint">offen</span>'}</td>` → `<td${d.close ? ' class="num"' : ''}>…` | typografie-12 |

```

## typografie-3.8a · Tagesansicht day.js: „Netto-P&L“ als .val-label, Zeitzelle num

Gruppe typografie · Cluster trades_tag · Aufwand S · Befunde: referenz-43, bereich_trades_tag-39, typografie-12
Quelle: audit/spec/typografie.md Z. 418–423 · Dateien: web/js/screens/day.js
Abhängig von: typografie-3.2.2c, typografie-3.2.2f

```text
### 3.8 `web/js/screens/*.js`

| Datei:Stelle | vorher → nachher | Befund |
|---|---|---|
| day.js:14 | `<div class="caption">Netto-P&L</div>` → `<div class="val-label">Netto-P&L</div>` | referenz-43, bereich_trades_tag-39 |
| day.js:15 | `<td>${fmt.time(t.open)}…</td>` → `<td class="num">${fmt.time(t.open)}…</td>` | typografie-12 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .kpi-label] Es gibt genau eine Klasse für Beschriftungen direkt über oder neben einem Wert: .kpi-label. Aufbau und KI-Look nutzen sie, KI-Look schließt .val-label und .tracker-cap ausdrücklich aus. Die Werte entsprechen der Typografie-Rolle „Wert-Beschriftung“. Die Klasse wird einmal hinter .caption (app.css:101) definiert, mit Tokens und ohne flex: `.kpi-label { font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 500; color: var(--text-2); } /* Beschriftung direkt über einem Wert, Satzschreibung; .caption bleibt für Abschnittslabels */`. Gründe gegen die flex-Fassung aus aufbau-A3a: Sie würde „P&L“ in `.prop-balance .r` (text-align: right) nach links ziehen. Das Info-Symbol bei „Heutiger Score“ sitzt als span.info inline wie in .tile .head. `.kpi-label.sm` wird nicht angelegt, kein Markup nutzt es (kein toter Code). Es gibt weder .val-label noch .tracker-cap. Jede Stelle setzt genau ein Schritt um: widgets.js:184/287 → aufbau-C2b (Z. 227 siehe .caption), app.js:530 → kilook-C8c, day.js:14 → kilook-C13, stats.js:45 → aufbau-C14e, trades.js:59 → aufbau-C15c, replay.js:83 → kilook-C17, prop.js:102 → kilook-C19b.
- ÄNDERN: Den Teil day.js:14 übernimmt kilook-C13 (.kpi-label statt .val-label). day.js:15 (Zeitzelle class="num") bleibt.

## typografie-3.8c · TradeLog und Verpasste Trades: fmt.dateRow mit num-Zellen, Wert-Beschriftungen als .val-label

Gruppe typografie · Cluster trades_tag · Aufwand S · Befunde: referenz-28, typografie-12, referenz-43
Quelle: audit/spec/typografie.md Z. 425–426 · Dateien: web/js/screens/trades.js
Abhängig von: typografie-3.4c, typografie-3.2.2c, typografie-3.2.2f

```text
| trades.js:49 | `<td>${fmt.dateFull(t.open)} <span class="muted">${fmt.time(t.open)}</span></td>` → `<td class="num">${fmt.dateRow(t.open)} <span class="muted">${fmt.time(t.open)}</span></td>`. Zelle „Geschlossen“: `<td>${t.close ? …` → `<td${t.close ? ' class="num"' : ''}>${t.close ? …`, darin `fmt.dateFull(t.close)` → `fmt.dateRow(t.close)` | referenz-28, typografie-12 (K21) |
| trades.js:59 | `<div class="caption">Entgangen</div>` und `<div class="caption">Wären Gewinner gewesen</div>` → `class="val-label"`; `<td>${fmt.dateFull(C.parseDayKey(x.date))}</td>` → `<td class="num">${fmt.dateRow(C.parseDayKey(x.date))}</td>` | referenz-43, typografie-12, referenz-28 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: trades.renderMissed] renderMissed folgt aufbau-C15c: Filter nach Zeitraum und Konto, zwei Leerzustände, accountId beim Speichern. Der Kartenkopf (Z. 59) wird einmal so umgesetzt: `<div><div class="kpi-label">${total >= 0 ? 'Entgangen' : 'Verlust vermieden'}</div><div class="score-big">${fmt.cur(Math.abs(total))}</div></div><div><div class="kpi-label">Wären Gewinner gewesen</div><div class="score-big">${wins} von ${m.length}</div></div>`. Der Inhalt (Beschriftungswechsel, ohne Vorzeichen und Farbe) kommt aus farbe-C31b (Farbregel „Verpasste Trades“), die Klasse aus aufbau-C15c. total und wins werden aus der gefilterten Liste m berechnet. Die Tabellenzellen derselben Zeile sind verträglich: komponenten-S-trades-e (Symbol/Richtung), responsiv-3.7 (Setup-Tooltip), typografie-3.8c (Datum num/dateRow).
- ÄNDERN: trades.js:59: Der Klassen-Teil (.val-label) entfällt, aufbau-C15c setzt dort .kpi-label. Datumszelle `<td class="num">${fmt.dateRow(…)}</td>` und trades.js:49 bleiben bei typografie-3.8c.

## abstaende-B16 · Kennzahlen-Raster: Handy-Einspaltigkeit (560er) löschen, .stat-Polster auf Skala, neu .stat-grid.detail (Trade-Ansicht), .detail-head .stars, 359er-Regel einspaltig

Gruppe abstaende · Cluster trades_tag · Aufwand M · Befunde: bereich_trades_tag-23, responsiv-44, abstaende_layout-31
Quelle: audit/spec/abstaende.md Z. 332–332 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
| B16 | `.stat-grid`/`.stat` (Z. 645, 646) | Z. 645 (`@media (max-width: 560px) { .stat-grid { grid-template-columns: 1fr; } .stat { border-right: 0 !important; } }`) löschen. Die zwei Spalten mit Rändern kommen dann aus dem 1100er-Block Z. 644. Z. 646 `.stat { padding: 16px 18px; … }` → `padding: var(--sp-4) var(--sp-5)`. Neu nach Z. 650, in dieser Reihenfolge: `.stat-grid.detail .stat { padding: var(--sp-3) var(--sp-5); } .stat-grid.detail .v { font-size: 16px; } .detail-head .stars { font-size: 13px; color: var(--text-2); letter-spacing: 1px; } @media (max-width: 560px) { .stat-grid.detail .stat { padding: var(--sp-3) var(--sp-4); } } @media (max-width: 359px) { .stat-grid { grid-template-columns: 1fr; } .stat-grid > .stat { border-right: 0; } }` (die Media-Regeln müssen hinter der Desktop-Regel stehen, gleiche Spezifität) | bereich_trades_tag-23, responsiv-44, abstaende_layout-31 |
```

## abstaende-B23 · Trade-Formular als 6-Spalten-Raster .tf-main (Desktop und Handy), .tf-row2/.tf-row3-Regeln ersetzen, .dir-switch ohne min-width, .tf-wide volle Breite

Gruppe abstaende · Cluster trades_tag · Aufwand M · Befunde: bereich_trades_tag-9, abstaende_layout-32
Quelle: audit/spec/abstaende.md Z. 339–339 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
| B23 | Trade-Formular Z. 836–840, 850, 872, 2979–2982 | Z. 836–840 ersetzen durch: `.tf-main { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: var(--sp-4); align-items: end; } .tf-main > .field { grid-column: span 2; } .tf-main > .tf-sym { grid-column: span 4; } .tf-main:has(#f-account) > .tf-sym { grid-column: span 2; } .tf-main > .tf-c3 { grid-column: span 3; }`. Z. 850 `.dir-switch`: `min-width: 210px;` streichen. Z. 872 → `.tf-main > .tf-wide { grid-column: 1 / -1; }`. Handy Z. 2979–2982 ersetzen durch `.tf-main { gap: var(--sp-3); } .tf-main > :is(.tf-sym, .tf-dir, .tf-dt, .field:has(#f-account)) { grid-column: 1 / -1; }` | bereich_trades_tag-9, abstaende_layout-32 |
```

## abstaende-H1 · Trade-Ansicht: Detailkarten .grid two → .grid detail-grid

Gruppe abstaende · Cluster trades_tag · Aufwand S · Befunde: bereich_trades_tag-3
Quelle: audit/spec/abstaende.md Z. 409–413 · Dateien: web/js/screens/trades.js
Abhängig von: abstaende-C1

```text
### web/js/screens/trades.js

| Nr. | Stelle | vorher → nachher | Befunde |
|---|---|---|---|
| H1 | Detail-Raster Z. 86 | `<div class="grid two">` → `<div class="grid detail-grid">` | bereich_trades_tag-3 |
```

## abstaende-H2 · Trade-Kennzahlen: Eintrag „Bewertung“ aus dem Raster, Sterne im Kopf, .stat-grid.detail ohne Inline-Stile

Gruppe abstaende · Cluster trades_tag · Aufwand M · Befunde: bereich_trades_tag-23, responsiv-44
Quelle: audit/spec/abstaende.md Z. 414–414 · Dateien: web/js/screens/trades.js
Abhängig von: abstaende-B16

```text
| H2 | Kennzahlen Z. 67–68 | Z. 68: Eintrag `['Bewertung', …]` aus dem Array entfernen. `<div class="stat-grid">` → `<div class="stat-grid detail">`. An `.stat` `style="padding:12px 20px"` und an `.v` `style="font-size:16px"` streichen. Z. 67 nach den Chips, vor `<div class="big">`: `${t.rating ? `<span class="stars" aria-label="Bewertung ${t.rating} von 5">${'★'.repeat(t.rating)}<span class="faint">${'★'.repeat(5 - t.rating)}</span></span>` : ''}` | bereich_trades_tag-23, responsiv-44 |
```

## abstaende-H3 · Weitere Inline-Abstände in trades.js (zusammen 20) nach 1.16 ersetzen

Gruppe abstaende · Cluster trades_tag · Aufwand M · Befunde: abstaende_layout-34
Quelle: audit/spec/abstaende.md Z. 415–416 · Dateien: web/js/screens/trades.js
Abhängig von: abstaende-A6

```text
| H3 | weitere Inline-Abstände (Z. 59 u. a., zusammen 20) | nach 1.16 ersetzen | abstaende_layout-34 |

```

## abstaende-E-day1 · Tagesansicht: Screen-Objekt mit head { range: false } und actions(ctx) (Zertifikat-Knopf)

Gruppe abstaende · Cluster trades_tag · Aufwand S · Befunde: referenz-17
Quelle: audit/spec/abstaende.md Z. 432–436 · Dateien: web/js/screens/day.js
Abhängig von: —

```text
### web/js/screens/day.js

| Nr. | Stelle | vorher → nachher | Befunde |
|---|---|---|---|
| E-day1 | Screen-Objekt nach `title` | `head: { range: false },` und `actions(ctx) { const key = ctx.params[0] \|\| C.dayKey(new Date()); return `<button type="button" class="btn" data-action="cert-open" data-kind="day" data-ref="${key}" data-tip="Daily Profit Certificate">${I.shield}<span class="hide-m">Zertifikat</span></button>`; },` | referenz-17 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: App.screens.day.head] head ist die Funktion aus aufbau-C7a: `range: false` und an anderen Tagen der tradeTip „Trade für {Datum} loggen“. Der Zertifikat-Knopf wandert über `actions(ctx)` rechts in die Kopfreihe (abstaende-E-day1), mit Symbol I.award wie auf Dashboard und Statistiken und mit dem data-tip „Tageszertifikat erstellen“ (wording-S8.1): `actions(ctx) { const key = ctx.params[0] || C.dayKey(new Date()); return `<button type="button" class="btn" data-action="cert-open" data-kind="day" data-ref="${key}" data-tip="Tageszertifikat erstellen">${I.award}<span class="hide-m">Zertifikat</span></button>`; }`. Die Klasse am Text-Span folgt den übrigen Kopfreihen-Knöpfen: heute hide-m, nach Barrierefreiheit Z4 vh-m. Aus der Datumszeile verschwindet der Zertifikat-Knopf. Begründung: Seitenaktionen stehen überall rechts in der Kopfreihe (Aufbau 1.3), auf Dashboard und Statistiken steht das Zertifikat schon dort, und die Datumszeile bleibt reine Navigation (referenz-17, geprüfte Fassung). certtest.js:54 findet `[data-action=cert-open][data-kind=day]` weiterhin. Ob die Datumsnavigation selbst in ctx.headLeft wandert (abstaende-E-day2), entscheidet der Anker ctx.headLeft. Diese Entscheidung gilt in beiden Fällen.
- ÄNDERN: `head: { range: false }` nicht anlegen, weil aufbau-C7a head als Funktion setzt. Nur actions(ctx) ergänzen, mit I.award statt I.shield und data-tip „Tageszertifikat erstellen“ statt „Daily Profit Certificate“.

## abstaende-E-day2 · Tagesansicht: Datumsnavigation als ctx.headLeft in die Kopfreihe, Kopfknöpfe Zertifikat/Check-in/„Trade für diesen Tag“ entfallen, .day-title in app.css

Gruppe abstaende · Cluster trades_tag · Aufwand M · Befunde: referenz-17
Quelle: audit/spec/abstaende.md Z. 437–437 · Dateien: web/js/screens/day.js, web/css/app.css
Abhängig von: abstaende-E-day1, abstaende-E3, abstaende-A6

```text
| E-day2 | `render()` Z. 12 und Z. 20 | Die Datumsnavigation wird Teil der Kopfreihe: `ctx.headLeft = `<div class="row s-2"><a class="btn round" href="#/day/${C.dayKey(prev)}" aria-label="Voriger Tag">${I.chevL}</a><a class="btn round" href="#/day/${C.dayKey(next)}" aria-label="Nächster Tag">${I.chevR}</a><h2 class="day-title">${fmt.weekdayLong(date)}</h2>${isToday ? U.pill('Heute', 'win') : `<a class="btn sm ghost" href="#/day/${C.dayKey(new Date())}">Heute</a>`}</div>`;` (das Konto steht davor, pageHead setzt `headLeft` nach dem Konto). Die Pillenfarbe entscheidet die Farb-Gruppe, Layout und Position stehen hier. Die Knöpfe „Zertifikat“, „Check-in“ und „Trade für diesen Tag“ aus Z. 12 entfallen. Z. 20 `return `${nav}${stats}…`` → `return `${stats}…``. CSS neu (app.css, Tagesansicht): `.day-title { font-size: 18px; margin-left: var(--sp-1); }`. Ergebnis: eine Kopfreihe, links Konto · ‹ › Datum (Heute), rechts Zertifikat · Session · „Trade loggen“. | referenz-17 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: ctx.headLeft] Tagesansicht: Die Datumszeile bleibt im Inhalt, ohne ctx.headLeft. aufbau K4 hat genau diese Variante verworfen, weil Datumstitel und Konto-Filter in einer Reihe vermischt würden, und sie hängt an F1 (komponenten-3/bereich_shell-8). Die Knöpfe „Check-in“ und „Trade für diesen Tag“ entfallen mit aufbau-C7b, „Zertifikat“ bleibt dort mit I.award, die Pille „Heute“ ist neutral (farbe-C20). Von abstaende-E-day2 bleibt nur der Inline-Stil des Datumstitels als Klasse: `<h2 class="day-title">` mit `.day-title { font-size: var(--fs-18); line-height: var(--lh-18); margin-left: var(--sp-1); }` (h2-Rolle 18/600, einzige Definition; .day-title in komponenten-C36 entfällt). Trade-Ansicht: Links steht der Rückweg per ctx.headLeft (aufbau-C15d). Die Seitenaktionen aus wording 9.11 kommen nicht in die Rückweg-Zeile, sondern als `actions(ctx)` rechts in die Kopfreihe; die Aufbau-Regel lautet „rechts Seitenaktionen → .dh-sep → Trade loggen“. Bei ctx.params[0]: Notiz-Knopf (`btn`, „Notiz öffnen“ bzw. „Notiz im Notebook“), `btn danger` „Löschen“, `btn` „Trade bearbeiten“ (Seitenebene = btn, nicht primary); ohne Trade-Datensatz ''. Ohne Parameter bleibt „CSV importieren“. pageHead (aufbau-B1), News (aufbau-C9a) und Affiliate (aufbau-C3) bleiben unverändert.
- [konflikt: U.pill] „Heute“ in der Tagesansicht wird `U.pill('Heute', 'neutral')` (farbe-C20; BRIEF: Grün nur für Gewinn und „Trade loggen“). Weil die Datumszeile im Inhalt bleibt (siehe ctx.headLeft), setzt farbe-C20 das direkt in day.js:12 um; die Pille mit 'win' aus abstaende-E-day2 entfällt. Die übrigen Pillen sind verträglich: aufbau-C3 „Beispieldaten“ neutral, farbe-C16 „Ausgezahlt“ als .muted-Text, farbe-C17a und kilook-C21 Coach-Pillen neutral (U.pill ohne Art ist neutral), farbe-C22b „Aktiv“, farbe-C26a „geprüft“ und Status. responsiv-3.12c übernimmt die Statusart der Payout-Zeile.
- [konflikt: App.pageHead] aufbau-B1 schreibt pageHead und newTradeButton neu und nimmt die Teile der anderen Schritte auf. Endzustand: `const sh = typeof screen.head === 'function' ? screen.head(ctx) : screen.head; const h = Object.assign({ range: true, account: true, session: true, trade: true, note: '', tradeTip: '' }, sh);`. In `left` steht `this.accountControl({ mobile: !h.range, iconM: !!h.range })` (responsiv-3.3a), danach wie heute `ctx.headLeft` und der Hinweis. In `right` steht `this.sessionControl()` ohne Argument (komponenten-A4); B1 lässt dort fälschlich noch `(true)` stehen. Vor dem return kommt `if (!left && !right) return '';`; das steht in B1 und abstaende-E1 gleich, also doppelt. abstaende-E-day2 setzt nur `ctx.headLeft` und passt ohne Änderung, weil pageHead headLeft nach dem Konto einsetzt. Mentor ohne Server nutzt die Funktionsform von head (siehe Anker screen.head).
- [konflikt: .day-title] Eine Regel in app.css (Tagesansicht): `.day-title { font-size: var(--fs-18); line-height: var(--lh-18); margin-left: var(--sp-1); }`, ohne Tokens 18px/4px. 20 px (komponenten-C36) gibt es auf der Typo-Skala nicht; die h2-Rolle ist 18/600. 6 px gibt es auf der Abstandsskala nicht, also 4. Das Markup kommt aus abstaende-E-day2 (Datumsnavigation als `ctx.headLeft` in der Kopfreihe) mit den Komponenten-Klassen: Pfeile `class="btn nav"` (`.btn.round` entfällt), `<h2 class="day-title">`, heute `U.pill('Heute', 'neutral')` (Farbe). An anderen Tagen steht der Link „Heute“ als `class="btn sm"` (ohne ghost) direkt nach dem Titel in der linken Gruppe. Die rechte Gruppe der Kopfreihe gehört Seitenaktionen, Session und „Trade loggen“ (aufbau). „Am Anfang der rechten Gruppe“ (S-day-a) bezog sich auf die alte Datumszeile, die E-day2 auflöst.
- ÜBERNIMMT komponenten-S-day-a: Die Klassenwechsel aus Z. 12 (`btn nav`, `day-title`, „Heute“ als `btn sm`) setzt abstaende-E-day2 beim Umbau in die Kopfreihe um. Die Platzierung am Anfang der rechten Gruppe entfällt.
- VERBINDLICH (Kreuzprüfung): Die Datumsnavigation bleibt im Inhalt. Es gibt kein `ctx.headLeft`, und Z. 20 bleibt `return `${nav}${stats}…``. In der nav-Zeile day.js:12 werden nur die Klassen umgestellt (enthält komponenten-S-day-a): Beide `class="btn round"` (Voriger/Nächster Tag) → `class="btn nav"`. `<h2 style="font-size:18px;margin-left:6px">` → `<h2 class="day-title">`. Der Link „Heute“ (nur an anderen Tagen, bleibt an seiner Stelle in der rechten Gruppe der Datumszeile) `class="btn sm ghost"` → `class="btn sm"`. CSS neu in app.css (Abschnitt Tagesansicht) als einzige Definition: `.day-title { font-size: var(--fs-18); line-height: var(--lh-18); margin-left: var(--sp-1); }`. Das Gewicht 600 kommt von h2; die Zeile `.day-title` aus komponenten-C36 entfällt. Nicht Teil dieses Schritts: Die Pille „Heute“ wird `U.pill('Heute', 'neutral')` (farbe-C20). Die Knöpfe „Check-in“, „Trade für diesen Tag“ und „Zertifikat“ verschwinden aus der Datumszeile (aufbau-C7b). Das Zertifikat kommt als `actions(ctx)` rechts in die Kopfreihe (abstaende-E-day1). Die Datumsvorbelegung von „Trade loggen“ regeln aufbau-C7a/B6. Voraussetzungen: `.btn.nav` aus komponenten-C07, Tokens aus typografie-3.2.1 und abstaende-A1.

## abstaende-E-day3 · Aktion new-trade-day entfernen, sobald grep sie nicht mehr findet

Gruppe abstaende · Cluster trades_tag · Aufwand S · Befunde: referenz-17
Quelle: audit/spec/abstaende.md Z. 438–438 · Dateien: web/js/screens/day.js
Abhängig von: abstaende-E-day2

```text
| E-day3 | `new-trade-day` (Z. 24) | bleibt, wird aber nicht mehr verwendet. Entfernen, sobald `grep -rn "new-trade-day" web/js` außer Z. 24 nichts mehr findet. | referenz-17 |
```

## abstaende-E-day4 · Inline-Abstände in day.js (10) nach 1.16 ersetzen

Gruppe abstaende · Cluster trades_tag · Aufwand M · Befunde: abstaende_layout-34
Quelle: audit/spec/abstaende.md Z. 439–440 · Dateien: web/js/screens/day.js
Abhängig von: abstaende-A6

```text
| E-day4 | Inline-Abstände (10) | nach 1.16 ersetzen | abstaende_layout-34 |

```

## abstaende-R1 · mobiletest: TradeLog-Abstand 18 → 16 (Wert und Text)

Gruppe abstaende · Cluster trades_tag · Aufwand S · Befunde: abstaende_layout-32
Quelle: audit/spec/abstaende.md Z. 516–520 · Dateien: web/e2e/mobiletest.js
Abhängig von: abstaende-C11

```text
### Tests

| Nr. | Datei | Änderung | Befunde |
|---|---|---|---|
| R1 | `web/e2e/mobiletest.js:31` | `g === 18` → `g === 16`, Text „18px Abstand“ → „16px Abstand“ | abstaende_layout-32 |
```

## abstaende-S4 · README Z. 93: TradeLog-Blöcke 16 px statt 18 px

Gruppe abstaende · Cluster trades_tag · Aufwand S · Befunde: abstaende_layout-32
Quelle: audit/spec/abstaende.md Z. 533–533 · Dateien: web/README.md
Abhängig von: abstaende-C11

```text
| S4 | Z. 93 | „TradeLog-Blöcke mit festem 18-px-Abstand“ → „TradeLog-Blöcke mit festem 16-px-Abstand (wie das Dashboard-Raster)“ | abstaende_layout-32 |
```

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: #f-dir] Der Verpasst-Dialog meldet fehlendes Symbol und fehlende Richtung genauso wie der Trade-Dialog: als Feldmeldung über U.fieldErrors, nicht als Toast. Gleiche Texte („Symbol fehlt“, „Long oder Short wählen“) und gleiches .need-Wackeln. Die Meldungen verschwinden über U.clearFieldError, das zustaende-S-A4 in 'set-dir' und in pick() von openSymbolMenu einbaut. Beide Stellen werden von beiden Dialogen benutzt, weil App.symbolField und App.dirField (komponenten-A5b) dieselben IDs liefern. Das Datum bleibt dort natives required und läuft über den globalen invalid-Listener. Für P12 gilt, was unter #trade-form steht.
- [reihenfolge: App.openTradeEditor] Alle Schritte ändern dieselbe Vorlage. Darum gilt eine feste Reihenfolge, und zwei Doppelungen werden zusammengelegt. (1) komponenten-A5b löst Symbol und Richtung in App.symbolField und App.dirField heraus. (2) abstaende-E2 entfernt die Wrapper. Die Klasse tf-dir gehört in App.dirField: <div class="field tf-dir">…</div>. Im Verpasst-Dialog wirkt sie nicht, denn die CSS-Regeln greifen nur unter .tf-main >. (3) wording-S5.4-5.5 setzt das Feld Geschlossen und übernimmt dabei farbe-C12a: <div class="field tf-c3 tf-dt"><label for="f-close">Geschlossen <span class="lbl-hint dp-coarse">(leer lassen, solange offen)</span></label><input class="input" type="datetime-local" id="f-close" name="closedAt" data-empty="Offen" value="…"></div>. Die Klasse ist lbl-hint statt faint, weil --faint nie für Wörter steht. Der Knopftext wird ${trade ? 'Speichern' : 'Trade loggen'}, die Klasse bleibt btn primary. Wie die Bestätigen-Knöpfe aussehen, ist Nutzerfrage komponenten-1 und wird hier nicht geändert. (4) barrierefreiheit-P12 (Restteil): Punktwert-(i) in .lbl-row innerhalb von <div class="field tf-c3"> und guard: true. (5) zustaende-S-A4: novalidate und Prüfung (siehe #trade-form). abstaende-E3, aufbau-B6 und wording-S5.3 sind unter App.actions['new-trade'] entschieden, wording-S5.9 unter app.html keydown.
- [konflikt: #f-symbol-btn] Fehler am Symbolknopf: Feldmeldung „Symbol fehlt“ über U.fieldErrors, aufgeräumt mit U.clearFieldError(btn) in pick() (siehe #trade-form). Die IDs f-symbol-btn, f-symbol und f-symbol-l bleiben in App.symbolField (komponenten-A5b) gleich, darum gilt das für Trade- und Verpasst-Dialog.

## abstaende-E2 · Trade-Formular-Markup: Wrapper .tf-row3/.tf-row2 entfernen, Felder direkte Kinder von .tf-main mit Klassen tf-dir, tf-c3, tf-dt

Gruppe abstaende · Cluster trades_tag · Aufwand M · Befunde: bereich_trades_tag-9
Quelle: audit/spec/abstaende.md Z. 384–384 · Dateien: web/js/app.js
Abhängig von: abstaende-B23

```text
| E2 | Trade-Formular Z. 353–365 | Wrapper `<div class="tf-row3">` und die beiden `<div class="tf-row2">` samt schließenden `</div>` entfernen. Alle Felder werden direkte Kinder von `.tf-main`. Klassen: Richtung `class="field tf-dir"`; Eröffnet und Geschlossen `class="field tf-c3 tf-dt"`; Punktwert und Gebühren `class="field tf-c3"`. Symbol behält `field tf-sym`, Prop-Konten `field tf-wide`. | bereich_trades_tag-9 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: App.openTradeEditor] Alle Schritte ändern dieselbe Vorlage. Darum gilt eine feste Reihenfolge, und zwei Doppelungen werden zusammengelegt. (1) komponenten-A5b löst Symbol und Richtung in App.symbolField und App.dirField heraus. (2) abstaende-E2 entfernt die Wrapper. Die Klasse tf-dir gehört in App.dirField: <div class="field tf-dir">…</div>. Im Verpasst-Dialog wirkt sie nicht, denn die CSS-Regeln greifen nur unter .tf-main >. (3) wording-S5.4-5.5 setzt das Feld Geschlossen und übernimmt dabei farbe-C12a: <div class="field tf-c3 tf-dt"><label for="f-close">Geschlossen <span class="lbl-hint dp-coarse">(leer lassen, solange offen)</span></label><input class="input" type="datetime-local" id="f-close" name="closedAt" data-empty="Offen" value="…"></div>. Die Klasse ist lbl-hint statt faint, weil --faint nie für Wörter steht. Der Knopftext wird ${trade ? 'Speichern' : 'Trade loggen'}, die Klasse bleibt btn primary. Wie die Bestätigen-Knöpfe aussehen, ist Nutzerfrage komponenten-1 und wird hier nicht geändert. (4) barrierefreiheit-P12 (Restteil): Punktwert-(i) in .lbl-row innerhalb von <div class="field tf-c3"> und guard: true. (5) zustaende-S-A4: novalidate und Prüfung (siehe #trade-form). abstaende-E3, aufbau-B6 und wording-S5.3 sind unter App.actions['new-trade'] entschieden, wording-S5.9 unter app.html keydown.
- ÄNDERN: Die Richtungsklasse wird in App.dirField gesetzt (<div class="field tf-dir">), nicht im Markup von openTradeEditor. Das Symbolfeld kommt mit class="field tf-sym" aus App.symbolField. Alles andere bleibt wie in E2: Wrapper weg, Eröffnet und Geschlossen tf-c3 tf-dt, Punktwert und Gebühren tf-c3, Prop-Konten tf-wide.

## komponenten-A8 · Gemeinsame Tages-Kennzahlen App.dayStatsHTML()

Gruppe komponenten · Cluster trades_tag · Aufwand S · Befunde: bereich_trades_tag-43
Quelle: audit/spec/komponenten.md Z. 577–579 · Dateien: web/js/app.js
Abhängig von: —

```text
**A8 – Gemeinsame Tages-Kennzahlen** (bereich_trades_tag-43)
Neu: `App.dayStatsHTML(s, o = {})` gibt `<div class="stats"${o.style ? ` style="${o.style}"` : ''}>…</div>` mit acht Feldern in dieser Reihenfolge zurück: Trades (`o.n ?? s.n`, dahinter ` <span class="muted small">(x offen)</span>`, wenn `o.open`), Brutto-P&L (`U.cls`, signiert), Gewinner / Verlierer (`pos`/`neg`), Gebühren, Win-Rate, Volumen (`fmt.num(…, 2)`), Profit-Faktor, Ø R (`fmt.r(s.avgR)` oder „—“). Ohne geschlossene Trades (`o.closed === 0`) zeigen Win-Rate, Profit-Faktor und Ø R „—“, wie heute in day.js:14.

```
