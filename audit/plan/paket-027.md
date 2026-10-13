# Paket 027 · prop

Schritte: 34 · Dateien: web/css/app.css, web/e2e/proptest.js, web/js/screens/prop-friedhof.js, web/js/screens/prop.js
Betroffene Tests laut Spezifikation: Akzeptanz 4.3 prop_bilanz; Akzeptanz 4.3 prop_friedhof (keine Zeile endet mit „·“); Sonde 22; anpassen: e2e/proptest.js:55, :56, :101; :116 unverändert; e2e/proptest.js:79; e2e/sampletest.js:69; prüfen: e2e/friedhoftest.js:46 (flacher Grabstein); prüfen: e2e/friedhoftest.js:46, :73, :88–89, :122, :129; prüfen: e2e/proptest.js:94–102 (Payout-Planer Challenge/Funded); web/e2e/friedhoftest.js; web/e2e/friedhoftest.js:21; web/e2e/friedhoftest.js:47 (bleibt grün); web/e2e/friedhoftest.js:80 (Stein < 560 px, danach laufen lassen); web/e2e/proptest.js; web/e2e/proptest.js:102; web/e2e/proptest.js:102 („Consistency Rule“ bleibt); web/e2e/proptest.js:112 (zählt .prop-presets .pill.win === 1, muss angepasst werden, in D2 nicht genannt); web/e2e/proptest.js:130 (keine implizite Spalte am Handy); web/e2e/proptest.js:19; web/e2e/proptest.js:20/23/27/133 (data-action bleibt); web/e2e/proptest.js:91; web/e2e/proptest.js:95; web/e2e/proptest.js:98
Baut auf Paketen auf: 1, 2, 3, 4, 5, 6

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## farbe-C26a · Prop: Status „Aktiv“ neutral, „geprüft“-Pillen neutral

Gruppe farbe · Cluster prop · Aufwand S · Befunde: bereich_prop-35, komponenten-8, farbe_kontrast-26
Quelle: audit/spec/farbe.md Z. 512–514 · Dateien: web/js/screens/prop.js
Abhängig von: —

```text
**C26 – `web/js/screens/prop.js`** — bereich_prop-35, komponenten-8, farbe_kontrast-26, bereich_prop-16, zustaende-7, bereich_prop-25
- Z. 20 `STATUS_KIND = { active: 'open', … }` → `active: 'neutral'` („Beantragt“ Z. 267/286 bleibt `open`)
- Z. 81 `U.pill(`geprüft ${…}`, 'win')` → `U.pill(`geprüft ${…}`)`; Z. 236 `U.pill('geprüft', 'win')` → `U.pill('geprüft')`
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: U.pill] „Heute“ in der Tagesansicht wird `U.pill('Heute', 'neutral')` (farbe-C20; BRIEF: Grün nur für Gewinn und „Trade loggen“). Weil die Datumszeile im Inhalt bleibt (siehe ctx.headLeft), setzt farbe-C20 das direkt in day.js:12 um; die Pille mit 'win' aus abstaende-E-day2 entfällt. Die übrigen Pillen sind verträglich: aufbau-C3 „Beispieldaten“ neutral, farbe-C16 „Ausgezahlt“ als .muted-Text, farbe-C17a und kilook-C21 Coach-Pillen neutral (U.pill ohne Art ist neutral), farbe-C22b „Aktiv“, farbe-C26a „geprüft“ und Status. responsiv-3.12c übernimmt die Statusart der Payout-Zeile.

## farbe-C26b · Prop: Anlegen-/Erfassen-Öffner ohne primary, Banner „Ziel erreicht“ als ok

Gruppe farbe · Cluster prop · Aufwand S · Befunde: bereich_prop-16, zustaende-7
Quelle: audit/spec/farbe.md Z. 515–517 · Dateien: web/js/screens/prop.js
Abhängig von: farbe-B11

```text
- Z. 82 `class="btn primary" data-action="prop-account-new"` → `class="btn"`; Z. 244 `class="btn sm primary" data-action="prop-account-new"` → `class="btn sm"` (entfällt, falls die Aufbau-Gruppe den Knopf streicht)
- Z. 97 `U.banner('accent', 'Ziel erreicht', …)` → `U.banner('ok', 'Ziel erreicht', …)`
- Z. 251 `class="btn sm${e[kind] ? '' : ' primary'}"` → `class="btn sm"`
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .btn.primary] (1) Gewicht: .btn.primary bekommt 700 (typografie-3.2.4b). Grundlage sind BRIEF („nur Werte und Hauptknöpfe 700“) und README Z. 209–210 („Hauptknöpfe („Trade loggen“, Speichern) fett“). Heute rendert 600 ohnehin als 700, sichtbar ändert sich also nichts. farbe-B2 und farbe-D3e nennen kein Gewicht mehr. (2) Rolle nach der Komponenten-Regel: .btn.primary steht nur im Dialog-Fuß, im Popover- bzw. Panel-Fuß (eine abschließende Aktion) und beim Absenden des Hauptformulars einer Seite. Auslöser, Leerzustand-, Banner- und Listen-Aktionen sowie Inline-Formulare in Karten und Widgets sind .btn bzw. .btn.sm. Grund: Das bleibt ruhig, egal wie N1 ausgeht; bei Variante B wäre jeder primary der lauteste Punkt der Seite und lauter als „Trade loggen“. Damit sind neutral: widgets.js:374 (Mentor-Frage im Widget) `btn`, coach.js:129/140/148 `btn sm`, notebook.js:67 „Wiederherstellen“ `btn sm`, prop.js:82 (Leerzustand) `btn sm`, prop.js:97 „Als bestanden markieren“ `btn sm`, prop.js:262/266 „Ausgabe/Payout erfassen“ `btn`, „Konto hinzufügen“ im Konten-Bereichskopf misc.js:186 `btn` (nicht sm, Seitenebene). (3) Doppelte Knopfänderungen führen die komponenten-S-Schritte aus. Die farbe-C-Schritte lassen ihre Knopf-Teile weg, ihre Farbteile bleiben. Ausnahme ist der Willkommen-Banner dashboard.js:130: farbe-C19c schreibt den ganzen Aufruf neu und übernimmt damit auch den Knopf. (4) README: farbe-D3e ersetzt Z. 203–208 sofort, aber ohne Aussehen und Gewicht von .btn.primary. komponenten-R1f setzt danach auf und zieht Z. 207–208 bzw. Z. 191 erst nach den Antworten N1/N2 nach, wie dort vorgesehen.
- ÄNDERN: Die Knopf-Teile entfallen: Z. 82 macht komponenten-S-prop-a (`btn sm`, Leerzustand), Z. 244 fällt mit komponenten-S-prop-c weg, Z. 251 macht komponenten-S-prop-d. Den Banner „Ziel erreicht“ als `ok` setzt C26b weiterhin; der Knopf darin wird `btn sm` (S-prop-a).
- [doppelt: U.banner] Alle sechs Änderungen gelten; doppelt ist nur dashboard.js:130 (das sparkle-Symbol). Endstand: dashboard.js:130 `U.banner('info', 'Willkommen', …, { trailing: … }` mit „CSS importieren“ und zwei neutralen `btn sm`, ohne icon (farbe-C19c). shadow.js:58 ohne `icon: 'sparkle'` (kilook-C15). prop.js:97 `U.banner('ok', 'Ziel erreicht', …)` (farbe-C26b). prop.js:279/280 ohne den letzten info-Zweig und ohne warn (aufbau-C12e). Dazu eine Lücke: Der Erfolgs-Zweig `U.banner('accent', plan.funded ? 'Bereit für den Payout' : 'Challenge bestanden', …)` in Z. 279 wird `U.banner('ok', …)`. Grund: Die Farbe-Spezifikation benennt `.banner.accent` in `.banner.ok` um; ohne diese Änderung stünde das Banner ohne Stil da. coach.js:27 errorBox wie zustaende-S-CS1. Abnahme: `grep -rnE "banner\('accent'|icon: 'sparkle'" web/js` findet nichts mehr (I.sparkle wird gelöscht).

## farbe-C26c · Prop-Bilanz: Ausgaben- und Payout-Spalten neutral

Gruppe farbe · Cluster prop · Aufwand S · Befunde: bereich_prop-25
Quelle: audit/spec/farbe.md Z. 518–519 · Dateien: web/js/screens/prop.js
Abhängig von: —

```text
- Z. 263 `<td class="r neg">${fmt.cur(e.amount)}` → `<td class="r">`; Z. 267 und Z. 286 `<td class="r pos">${fmt.cur(p.net)}` → `<td class="r">`

```

## farbe-C27 · Friedhof: Kachel „Geplatzte Konten“ ohne tint neg

Gruppe farbe · Cluster prop · Aufwand S · Befunde: bereich_prop-44
Quelle: audit/spec/farbe.md Z. 520–521 · Dateien: web/js/screens/prop-friedhof.js
Abhängig von: —

```text
**C27 – `web/js/screens/prop-friedhof.js` Z. 56:** im ersten `U.tile('Geplatzte Konten', …)` `tint: 'neg'` streichen — bereich_prop-44

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: U.tile] (1) Statistik → Tage (aufbau-C14d): Die Kacheln folgen der Farb- und Vorzeichenregel. „Gewinntage / Verlusttage“ wird nur bei > 0 gefärbt (`<span class="${ds.winDays ? 'pos' : ''}">…</span> / <span class="${ds.lossDays ? 'neg' : ''}">…</span>`, farbe-C30). „Ø Gewinntag“ wird `U.pnl(ds.avgWinDay)`, „Ø Verlusttag“ `U.pnl(ds.avgLossDay)`: Ergebnisse tragen ein Vorzeichen (kilook Z5b), avgLossDay ist negativ. Die Karte „P&L nach Wochentag“ entfällt mit aufbau-C14d und damit auch wording 10.3. (2) Statistik → Fehler: Kachel 1 behält das Vorzeichen `fmt.cur(mr.cost, { signed: true })`, die Klasse richtet sich nach dem Vorzeichen (neg/pos/neu). Die Beschriftung wechselt nach wording zwischen „Fehler haben gekostet“ und „Fehler haben eingebracht“. farbe K13 („Disziplin-Kosten überall mit Vorzeichen“, ausdrücklich auch für Statistik → Fehler) und kilook Z5b gehen vor; die Prüfzeile in wording (stats_mistakes.png) lautet dann „mit Minus“. (3) Affiliate: Die Kacheln behalten die Cent, kein moneyK (Begründung unter fmt.balance). Die Begriffe aus wording 13.3–13.7 bleiben, die Kachel „Creator“ entfällt (aufbau-C3). (4) Schatten-Ich, Kachel „Echt“: Fuß mit U.count. (5) Prop-Summe siehe summaryTiles, Monte Carlo siehe fmt.cur. Verträglich sind farbe-C27, wording 12.28, wording-S11.6-11.11 und wording-S15.10-15.15.

## typografie-3.2.6a · Grabstein-Chips: nowrap und Trennpunkt „· “ (Umbruch nur vor dem Punkt)

Gruppe typografie · Cluster prop · Aufwand S · Befunde: bereich_prop-49
Quelle: audit/spec/typografie.md Z. 369–374 · Dateien: web/css/app.css
Abhängig von: —

```text
#### 3.2.6 Einzelstellen

| Selektor (Z.) | vorher → nachher | Befund |
|---|---|---|
| `.pg-facts dd.pg-tags .chip` (2814) | `white-space: nowrap;` ergänzen | bereich_prop-49 |
| `.pg-facts dd.pg-tags .chip + .chip::before` (2815) | `content: ' · ';` → `content: '· ';` | bereich_prop-49 |
```

## typografie-3.8k · Prop-Tabellen: Datumszellen mit Klasse num

Gruppe typografie · Cluster prop · Aufwand S · Befunde: typografie-12
Quelle: audit/spec/typografie.md Z. 436–436 · Dateien: web/js/screens/prop.js
Abhängig von: typografie-3.2.2f

```text
| prop.js:233, 263, 267 (2 Zellen), 286 (2 Zellen) | jede `<td>${fmt.dateFull(…)}</td>` bzw. `<td>${p.receivedAt ? fmt.dateFull(…) : '—'}</td>` → `<td class="num">…` | typografie-12 |
```

## typografie-3.8l · Friedhof: Chips mit join(' ') verbinden (K23)

Gruppe typografie · Cluster prop · Aufwand S · Befunde: bereich_prop-49
Quelle: audit/spec/typografie.md Z. 437–437 · Dateien: web/js/screens/prop-friedhof.js
Abhängig von: typografie-3.2.6a

```text
| prop-friedhof.js:151, 152 | `.map(… U.chip(…)).join('')` → `.join(' ')` | bereich_prop-49 (K23) |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: U.chip] 3.2c erweitert U.chip um den Parameter tip, und 3.7 und 3.8 rufen ihn auf. Deshalb kommt 3.2c zuerst. S-T4 und 3.7 ändern dieselbe Stelle trades.js:59; die Endform ist x.setup ? U.chip(x.setup, 'setup', x.setup.length > 20 ? x.setup : '') : '<span class="faint">—</span>'. In trades.js:49 ergänzen sich die ph-hide-Klassen aus 3.7 und „—“ in .faint für Geschlossen und Ausstieg aus S-T4. typografie-3.8l (join(' ') im Friedhof) hängt davon nicht ab.

## abstaende-B24 · Prop-Dialog: .prop-form löschen, .prop-h3 mit margin-top var(--sp-2)

Gruppe abstaende · Cluster prop · Aufwand S · Befunde: bereich_prop-36
Quelle: audit/spec/abstaende.md Z. 340–340 · Dateien: web/css/app.css
Abhängig von: abstaende-B22

```text
| B24 | `.prop-form`, `.prop-h3` (Z. 2717, 2718) | Z. 2717 löschen. Z. 2718 → `.prop-h3 { font-size: 14px; font-weight: 600; margin-top: var(--sp-2); }` | bereich_prop-36 |
```

## abstaende-B25 · Prop-Regeln: .prop-rules gap, .prop-rule padding, .prop-rule-f gap auf Skala

Gruppe abstaende · Cluster prop · Aufwand S · Befunde: abstaende_layout-1
Quelle: audit/spec/abstaende.md Z. 341–341 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
| B25 | `.prop-rules`, `.prop-rule`, `.prop-rule-f` (Z. 2719, 2720, 2722) | `.prop-rules` gap 10 → `var(--sp-3)`. `.prop-rule` `padding: 12px 14px` → `var(--sp-3) var(--sp-4)`. `.prop-rule-f` `gap: 10px 12px` → `gap: var(--sp-3)` | abstaende_layout-1 |
```

## abstaende-D6 · Prop-CSS: .prop-group gap 12, neu .prop-sec, Badge-Mindestbreite in .prop-assign-row, .prop-entry-foot (Handy Knopf breit), .prop-entry .field button löschen, Consistency-Label nowrap

Gruppe abstaende · Cluster prop · Aufwand M · Befunde: abstaende_layout-36, bereich_prop-41, bereich_prop-54, bereich_prop-29
Quelle: audit/spec/abstaende.md Z. 373–373 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
| D6 | Prop | Z. 2713 `.prop-group { gap: 10px }` → `gap: var(--sp-3)`. Neu nach Z. 2713: `.prop-sec { display: flex; flex-direction: column; gap: var(--sp-3); min-width: 0; } .prop-sec > .prop-group + .prop-group, .prop-sec > .prop-cards + .prop-group { margin-top: var(--sp-3); }`. Neu nach Z. 2732: `.prop-assign-row .badge { min-width: 80px; }`. Neu nach Z. 2681: `.prop-entry-foot { grid-column: 1 / -1; display: flex; justify-content: flex-end; }`, im 560er-Block `.prop-entry-foot .btn { flex: 1 1 auto; justify-content: center; }`. Z. 2725 `.prop-entry .field button { width: 100%; }` löschen. Neu nach Z. 2710: `.prop-conds .kv > span { white-space: nowrap; }` | abstaende_layout-36, bereich_prop-41, bereich_prop-54, bereich_prop-29 |
```

## abstaende-D7 · Grabstein-Rückseite: padding-inline var(--sp-8)

Gruppe abstaende · Cluster prop · Aufwand S · Befunde: bereich_prop-47
Quelle: audit/spec/abstaende.md Z. 374–374 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
| D7 | Grabstein-Rückseite Z. 2776 | `.pg-back { transform: rotateY(180deg); padding-top: 60px; padding-bottom: 104px; …}` → zusätzlich `padding-inline: var(--sp-8);` | bereich_prop-47 |
```

## abstaende-M1 · Prop-Übersicht: Kopf, Gruppen und Leerhinweis in <section class="prop-sec">

Gruppe abstaende · Cluster prop · Aufwand S · Befunde: abstaende_layout-36
Quelle: audit/spec/abstaende.md Z. 466–470 · Dateien: web/js/screens/prop.js
Abhängig von: abstaende-D6

```text
### web/js/screens/prop.js

| Nr. | Stelle | vorher → nachher | Befunde |
|---|---|---|---|
| M1 | Z. 125 | `return `${summaryTiles(list)}${head}${body}${none}${endedHtml}`;` → `return `${summaryTiles(list)}<section class="prop-sec">${head}${body}${none}</section>${endedHtml}`;` | abstaende_layout-36 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: summaryTiles] kilook-C19b setzt die Kachel „P&L je Währung“ einmal um (Code Z. 86–87, red-Zählung in derselben Schleife), mit dem Wording-Text: Titel „P&L der aktiven Konten“, Teile verbunden mit `' <span class="muted">·</span> '`, jeder Teil `U.pnl(v, '', c ? { currency: c } : {})` mit 2 Nachkommastellen, ohne aktive Konten `U.pnl(0)`. abstaende-M1 (section.prop-sec um head, body und none) ist davon unabhängig.

## abstaende-M2 · Prop-Konto-Dialog: Währungshinweis als eigene Rasterzeile (span2, #pa-cur-hint, aria-describedby), Notiz span4

Gruppe abstaende · Cluster prop · Aufwand S · Befunde: bereich_prop-37
Quelle: audit/spec/abstaende.md Z. 471–471 · Dateien: web/js/screens/prop.js
Abhängig von: abstaende-A8

```text
| M2 | Z. 194, 201 | Z. 194: `<span class="hint">…</span>` aus dem Währungsfeld nehmen und direkt hinter dem Feld als eigenes Rasterelement setzen: `<span class="hint span2" id="pa-cur-hint">Balance, Limits und Puffer in Kontowährung. Trade-P&L bleibt in der Journal-Währung.</span>`. Das Select bekommt `aria-describedby="pa-cur-hint"`. Z. 201: Notiz `class="field span2"` → `class="field span4"`. | bereich_prop-37 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: aria-describedby] U.fieldErrors darf vorhandene Beschreibungen nicht überschreiben und U.clearFieldError sie nicht löschen. Betroffen sind z. B. die Währungsauswahl im Prop-Konto-Dialog mit aria-describedby="pa-cur-hint" (abstaende-M2), deren required-Prüfung über den globalen invalid-Listener läuft. Die Fehler-ID wird angehängt, beim Aufräumen wird nur der Teil mit „-err“ entfernt. switchRow (C-misc-15, Suffix „-d“) und M2 bleiben unverändert. Den Wortlaut des Hinweises legt M2 nicht fest.
- ÄNDERN: M2 ändert nur den Aufbau: Hinweis als eigenes Rasterelement <span class="hint span2" id="pa-cur-hint">…</span> direkt hinter dem Währungsfeld, aria-describedby="pa-cur-hint" am Select, Notiz span4. Den Hinweistext nicht aus M2 nehmen. Es gilt der Text, den die Wortwahl für prop.js:194 festlegt (wording.md Z. 497, Schritt 12.16, bzw. die Konfliktentscheidung dazu gegen kilook).

## abstaende-M4 · Ausgabe/Payout erfassen: Absende-Knopf in .prop-entry-foot statt über &nbsp;-Label, Notiz span2

Gruppe abstaende · Cluster prop · Aufwand S · Befunde: bereich_prop-54
Quelle: audit/spec/abstaende.md Z. 473–473 · Dateien: web/js/screens/prop.js
Abhängig von: abstaende-D6

```text
| M4 | Z. 262, 266 | letztes Feld `<div class="field"><span class="lbl">&nbsp;</span><button type="submit" …>…</button></div>` → `<div class="prop-entry-foot"><button type="submit" class="btn primary">${I.plus} Ausgabe erfassen</button></div>` (Payout: „Payout erfassen“). Notiz in Z. 262 `class="field"` → `class="field span2"`. | bereich_prop-54 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .btn.primary] (1) Gewicht: .btn.primary bekommt 700 (typografie-3.2.4b). Grundlage sind BRIEF („nur Werte und Hauptknöpfe 700“) und README Z. 209–210 („Hauptknöpfe („Trade loggen“, Speichern) fett“). Heute rendert 600 ohnehin als 700, sichtbar ändert sich also nichts. farbe-B2 und farbe-D3e nennen kein Gewicht mehr. (2) Rolle nach der Komponenten-Regel: .btn.primary steht nur im Dialog-Fuß, im Popover- bzw. Panel-Fuß (eine abschließende Aktion) und beim Absenden des Hauptformulars einer Seite. Auslöser, Leerzustand-, Banner- und Listen-Aktionen sowie Inline-Formulare in Karten und Widgets sind .btn bzw. .btn.sm. Grund: Das bleibt ruhig, egal wie N1 ausgeht; bei Variante B wäre jeder primary der lauteste Punkt der Seite und lauter als „Trade loggen“. Damit sind neutral: widgets.js:374 (Mentor-Frage im Widget) `btn`, coach.js:129/140/148 `btn sm`, notebook.js:67 „Wiederherstellen“ `btn sm`, prop.js:82 (Leerzustand) `btn sm`, prop.js:97 „Als bestanden markieren“ `btn sm`, prop.js:262/266 „Ausgabe/Payout erfassen“ `btn`, „Konto hinzufügen“ im Konten-Bereichskopf misc.js:186 `btn` (nicht sm, Seitenebene). (3) Doppelte Knopfänderungen führen die komponenten-S-Schritte aus. Die farbe-C-Schritte lassen ihre Knopf-Teile weg, ihre Farbteile bleiben. Ausnahme ist der Willkommen-Banner dashboard.js:130: farbe-C19c schreibt den ganzen Aufruf neu und übernimmt damit auch den Knopf. (4) README: farbe-D3e ersetzt Z. 203–208 sofort, aber ohne Aussehen und Gewicht von .btn.primary. komponenten-R1f setzt danach auf und zieht Z. 207–208 bzw. Z. 191 erst nach den Antworten N1/N2 nach, wie dort vorgesehen.
- ÄNDERN: Den Absende-Knopf in `.prop-entry-foot` als `class="btn"` statt `btn primary` setzen (Inline-Formular in einer Karte, wie komponenten-S-prop-d). Der Rest bleibt.

## abstaende-M6 · Consistency-Zeile zweizeilig: Wert ohne „heute noch … erlaubt“ und title, eigene kv-Zeile „Heute noch erlaubt“, Karte cls prop-conds

Gruppe abstaende · Cluster prop · Aufwand S · Befunde: bereich_prop-29
Quelle: audit/spec/abstaende.md Z. 475–476 · Dateien: web/js/screens/prop.js
Abhängig von: abstaende-D6, abstaende-B17

```text
| M6 | Z. 283 | Die kv-Zeile „Consistency Rule“ bekommt den Wert `${cons.ok ? '<span class="pos">ok</span>' : '<span class="neg">verletzt</span>'} <span class="muted">· bester Tag ${cons.bestDayPct == null ? '—' : fmt.pct(cons.bestDayPct)} von max. ${fmt.num(cons.maxDayPct)} %</span>` (Teil „heute noch … erlaubt“ und das title-Attribut entfallen). Direkt danach, nur bei `cons && isFinite(cons.allowedToday)`: `U.kv('Heute noch erlaubt', fmt.cur(cons.allowedToday))`. Die Karte `conds` bekommt `{ cls: 'prop-conds' }`. | bereich_prop-29 |

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: U.kv] Die sechs Schritte ändern vier verschiedene Aufrufstellen. Sie überschneiden sich nur in prop.js Z. 104 (Kontokarte) und mittelbar in planText. Verbindlich für Z. 104, innerhalb des `${dead ? '' : …}` aus zustaende-S-P1: `${U.kv(plan.funded ? 'Nächster Payout' : 'Bis zum Bestehen', plan.hasCond && active ? `<a href="#/prop/bilanz" class="prop-plan-link" data-action="prop-plan-open" data-id="${a.id}">${planText(a, ev, plan)}</a>` : planText(a, ev, plan))}`. Die Zeile wird immer gezeigt, denn sie trägt den einzigen Link in den Planer. planText: Der Gewinn-Teil erscheint nur bei `plan.missingProfit > C.EPS && (plan.funded || !ev.target)`; aufbau-C12a und responsiv-3.12a meinen dasselbe. Sind alle Teile leer und fehlt nur noch Gewinn, liefert planText `<span class="muted">nur noch das Ziel</span>`, sonst '—', nie ''. Ein leerer Wert würde Zeile und Link verstecken, und '—' bedeutet laut Zustände Z2 „Wert fehlt“. Wortlaut und Währungsformat des Betrags entscheidet der Anker planText/money (konflikt-9). prop.js Z. 283 (abstaende-M6): eigene Zeile „Heute noch erlaubt“ als Regelgröße in Kontowährung `money(a, cons.allowedToday, { compact: true })` (KI-Look Z5a/Z5c). Damit entfällt der Teil „heute noch … erlaubt“ in kilook-C19c. Die Testanpassung proptest.js:102 prüft die Zeile „Heute noch erlaubt“ und bei verletzter Regel „verletzt“ in „Consistency Rule“, nicht mehr „heute noch“ in der Consistency-Zeile. stats.js tabSummary (aufbau-C14c) und notebook.js statsHTML (diagramme-L1, Zähler nur > 0 gefärbt, passt zu farbe-C30) sind unabhängig. stats.js tabDays: siehe Anker stats.tabDays. Hinweis: responsiv-B7 (.st-cards, dritte Karte bis 1100 px volle Breite) passt zu den drei Karten aus C14c; die dritte Karte ist dann „Drawdown & Risiko“.
- ÄNDERN: Neue Zeile als `U.kv('Heute noch erlaubt', money(a, cons.allowedToday, { compact: true }))` statt `fmt.cur(cons.allowedToday)`. Der Rest bleibt wie spezifiziert: Wert ohne title, Karte cls prop-conds.

## komponenten-S-prop-b · Prop-Regelfelder: Beschriftung als .lbl

Gruppe komponenten · Cluster prop · Aufwand S · Befunde: komponenten-18
Quelle: audit/spec/komponenten.md Z. 697–697 · Dateien: web/js/screens/prop.js
Abhängig von: komponenten-C05

```text
- Z. 146 `<label class="field"><span>${esc(lbl)}</span>` → `<label class="field"><span class="lbl">${esc(lbl)}</span>`.
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .prop-rule-f .field span] Die Regel wird gelöscht und nicht verkleinert. C05 löscht Z. 2723 `.prop-rule-f .field span`. S-prop-b stellt in prop.js `rulesFields` den Helfer `F` auf `<label class="field"><span class="lbl">…</span>` um. Die Beschriftung kommt dann aus `.field > .lbl`: 12/600 `--muted`, Token aus 3.2.3g. Das ist die app-weit einheitliche Feldbeschriftung und hat dieselbe Zielgröße 12, die 3.2.3e wollte. C05 und S-prop-b sollen im selben Durchgang landen, damit die Regelfelder nie ohne Beschriftungsstil dastehen.

## komponenten-S-prop-c · Karte „Deine Konten“ ohne Kopfknopf

Gruppe komponenten · Cluster prop · Aufwand S · Befunde: hierarchie-28
Quelle: audit/spec/komponenten.md Z. 698–698 · Dateien: web/js/screens/prop.js
Abhängig von: —

```text
- Z. 244: in `U.card('Deine Konten', accTable, { trailing: …, info: … })` die Option `trailing` streichen.
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: U.card] (1) Statistik-Kurve: Platz und Titel folgen aufbau-C14b, also erste Karte in „Übersicht“, Titel „Kumulierter Netto-P&L“, h240, ohne Legende; über dem Inhalt stehen nur die Reiter. Der Inhalt folgt diagramme-G1/A-14: ein Punkt je Handelstag, kein fillDays. „Nur mit abgeschlossenen Trades“ ist durch die Leer-Prüfung am Anfang von tabSummary erfüllt (zustaende-S-ST2). zustaende-S-ST1 entfällt, fillDays löscht diagramme-G2. (2) Tagesansicht, Kennzahlenkarte: nur mit Trades, die Spark nur mit abgeschlossenen Trades (zustaende-S-DY2). Gewinner und Verlierer werden nur bei > 0 gefärbt, das setzt farbe-C20 einmal um. (3) Fortschritt: Die Karte heißt „Regeltreue“ (wording 8.6) und hat den Inhalt aus kilook-C18 („—“ ohne Grundlage, Ring nur mit Wert). Die Prüflisten (aufbau Prüfung Z. 750, README in kilook-C28) nennen „Regeltreue“. (4) „Aktuelle Regeln“ entfällt (siehe #/settings/regeln), die Tage-Tabelle steht in „Tage im Detail“ (siehe .tbl-wrap.inset). Verträglich sind aufbau-B8 (h2), abstaende-I3, komponenten-S-prop-c, wording-S10.1-10.7 und wording-S11.6-11.11.

## komponenten-S-prop-d · Prop: Eintrag-Knöpfe und Inline-Absenden (Ausgabe/Payout erfassen) neutral

Gruppe komponenten · Cluster prop · Aufwand S · Befunde: komponenten-1, komponenten-30
Quelle: audit/spec/komponenten.md Z. 699–700 · Dateien: web/js/screens/prop.js
Abhängig von: —

```text
- Z. 251 `entryBtn`: `class="btn sm${e[kind] ? '' : ' primary'}"` → `class="btn sm"`.
- Z. 262 und Z. 266 (Absenden „Ausgabe erfassen“/„Payout erfassen“ im Inline-Formular) `class="btn primary"` → `class="btn"`.
```

## aufbau-A4e · Prop-Gruppentitel 13px/600 --text-2

Gruppe aufbau · Cluster prop · Aufwand S · Befunde: bereich_prop-7
Quelle: audit/spec/aufbau.md Z. 291–291 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 2715 `.prop-group-title b { font-family: var(--font-display); font-size: 15px; }` → `.prop-group-title b { font-size: 13px; font-weight: 600; color: var(--text-2); }`
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .prop-group-title b] `.prop-group-title b { font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 600; color: var(--text-2); }`: aufbau-A4e mit Typografie-Token, `font-family: var(--font-display)` entfällt. Grund: Der Gruppentitel steht unter „Aktive Konten“ (.prop-h 15/600) und über Karten, deren Titel ebenfalls 15/600 sind (.prop-title b). Eine Unterüberschrift darf nicht gleich groß sein wie die übergeordnete (aufbau Grundsatz 4 und K21; die aufbau-Prüfung Z. 751 erwartet 13px/600). 13/600 ist eine Stufe der Text-Skala, das Gewicht 600 deckt auch typografie-3.2.4f ab.
- ÄNDERN: Größe und Zeilenhöhe als Token schreiben: `font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 600; color: var(--text-2);`.

## aufbau-C12c · Prop-Übersicht: Überschrift nur zusammen mit den Filtern

Gruppe aufbau · Cluster prop · Aufwand S · Befunde: bereich_prop-7
Quelle: audit/spec/aufbau.md Z. 565–565 · Dateien: web/js/screens/prop.js
Abhängig von: —

```text
- Übersicht Z. 122: `const head = `<div class="prop-toolbar"><div class="prop-h">…</div>${filters}</div>`;` → `const head = filters ? `<div class="prop-toolbar"><div class="prop-h">${f.status ? 'Konten' : 'Aktive Konten'} <span class="pf-n">${main.length}</span></div>${filters}</div>` : '';`
```

## aufbau-C12d · Bilanz: Spalten „Firma“ und „Konto“ zu einer Spalte „Konto“

Gruppe aufbau · Cluster prop · Aufwand S · Befunde: bereich_prop-19
Quelle: audit/spec/aufbau.md Z. 566–567 · Dateien: web/js/screens/prop.js
Abhängig von: —

```text
- Bilanz Z. 263 `exRows`: die Zellen `<td>${esc(e.firm || (a ? a.firm : '') || '—')}</td><td>${a ? esc(accName(a)) : '—'}</td>` → eine Zelle `<td>${a ? `<b>${esc(a.firm || 'Eigene Firma')}</b> ${esc(sizeName(a))}` : esc(e.firm || '—')}</td>`. Z. 264 Kopf: `<th>Firma</th>` streichen (Datum · Typ · Konto · Betrag · Notiz)
- `poRows` (Z. 267): erste Zelle `${a ? esc(accName(a)) : esc(p.firm || '—')}` → `${a ? `<b>${esc(a.firm || 'Eigene Firma')}</b> ${esc(sizeName(a))}` : esc(p.firm || '—')}`
```

## aufbau-C12e · Payout-Planer: ohne Banner, Vorschlag auf --tile-val, Karten rahmenlos

Gruppe aufbau · Cluster prop · Aufwand M · Befunde: bereich_prop-28, bereich_prop-30
Quelle: audit/spec/aufbau.md Z. 568–574 · Dateien: web/js/screens/prop.js, web/css/app.css
Abhängig von: aufbau-A1

```text
- `payoutPlanner` Z. 279: letzter Zweig von `intro` `: plan.funded ? '' : U.banner('info', '', `Dieses Konto ist in der …`)` → `: ''`. Z. 280 `const warn = …` löschen, in Z. 287 `${sel}${intro}${warn}<div class="grid two">` → `${sel}${intro}<div class="grid two">`
- Z. 284 Vorschlag: `<div class="big-stat"><span>${fmt.cur(plan.suggestion.perDay)}</span></div>` → `<div class="prop-sugg-val">${fmt.cur(plan.suggestion.perDay)}</div>`; CSS: `.prop-sugg-val { font-family: var(--font-num); font-size: var(--tile-val); font-weight: 700; letter-spacing: -0.02em; line-height: 1.1; margin: 2px 0 6px; }`
- CSS Planer (`web/css/app.css` nach Z. 2627):
  ```css
  .prop-fold[data-fold="planer"] > .pf-body .card { background: none; border: 0; box-shadow: none; padding: 0; }
  .prop-fold[data-fold="planer"] > .pf-body > .grid.two + .card { border-top: 1px solid var(--border); padding-top: 16px; }
  ```
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .big-stat] `.big-stat` bleibt die Hero-Klasse und gilt nur noch im Fortschritt (Serie, Heutiger Fortschritt, % Regeln eingehalten). CSS wie in der Typografie geplant: `font-size: var(--fv-44); letter-spacing: var(--ls-hero); line-height: var(--lh-val);` ohne font-family, bei ≤960 var(--fv-32) (typografie-3.2.2h, fv44, fv32 unverändert). Das Challenge-Widget nutzt `.score-big` (32 px) statt `.big-stat` (siehe Anker widget:challenge). Der Payout-Vorschlag nutzt `.prop-sugg-val` auf --tile-val (aufbau-C12e). Grund: Die Aufbau-Regel sagt „.big-stat 44 px nur Fortschritt und Serie“; W5 hätte das Challenge-Widget ohne die Inline-Größe auf 44 px aufgeblasen. progress.js Z. 69 ändern aufbau-C11a (Pfeil mit Tooltip) und kilook-C18 („—“, Ring und ring-card nur mit Wert) gemeinsam in derselben Zeile; keiner überschreibt den anderen. Den Inhalt von Z. 68 und den Tooltip-Text des Pfeils entscheidet der Anker .trend.
- ÄNDERN: CSS mit Tokens: `.prop-sugg-val { font-family: var(--font-num); font-size: var(--tile-val); font-weight: 700; letter-spacing: var(--ls-val); line-height: var(--lh-val); margin: 2px 0 var(--sp-2); }`. Dazu siehe Anker U.banner (Erfolgs-Banner Z. 279 → 'ok').
- [doppelt: U.banner] Alle sechs Änderungen gelten; doppelt ist nur dashboard.js:130 (das sparkle-Symbol). Endstand: dashboard.js:130 `U.banner('info', 'Willkommen', …, { trailing: … }` mit „CSS importieren“ und zwei neutralen `btn sm`, ohne icon (farbe-C19c). shadow.js:58 ohne `icon: 'sparkle'` (kilook-C15). prop.js:97 `U.banner('ok', 'Ziel erreicht', …)` (farbe-C26b). prop.js:279/280 ohne den letzten info-Zweig und ohne warn (aufbau-C12e). Dazu eine Lücke: Der Erfolgs-Zweig `U.banner('accent', plan.funded ? 'Bereit für den Payout' : 'Challenge bestanden', …)` in Z. 279 wird `U.banner('ok', …)`. Grund: Die Farbe-Spezifikation benennt `.banner.accent` in `.banner.ok` um; ohne diese Änderung stünde das Banner ohne Stil da. coach.js:27 errorBox wie zustaende-S-CS1. Abnahme: `grep -rnE "banner\('accent'|icon: 'sparkle'" web/js` findet nichts mehr (I.sparkle wird gelöscht).
- ÄNDERN: Zusätzlich in payoutPlanner Z. 279 `U.banner('accent', plan.funded ? 'Bereit für den Payout' : 'Challenge bestanden', 'Alle Bedingungen sind erfüllt.')` → `U.banner('ok', …)` (gleicher Text). Rest wie geplant (letzter info-Zweig → '', warn weg, prop-sugg-val mit Tokens, Planer-Karten rahmenlos).

## aufbau-C12f · Prop Firms: kein Session-Knopf

Gruppe aufbau · Cluster prop · Aufwand S · Befunde: aufbau-6, ki_look-22
Quelle: audit/spec/aufbau.md Z. 575–576 · Dateien: web/js/screens/prop.js
Abhängig von: —

```text
- Z. 293 `head: { range: false, account: false },` → `head: { range: false, account: false, session: false },`

```

## aufbau-C13 · Friedhof: Muster-Satz als Textzeile statt Karte

Gruppe aufbau · Cluster prop · Aufwand S · Befunde: ki_look-41
Quelle: audit/spec/aufbau.md Z. 577–582 · Dateien: web/js/screens/prop-friedhof.js
Abhängig von: —

```text
#### `web/js/screens/prop-friedhof.js`

**C13** · ki_look-41
- Z. 172 `${tiles(g)}${patternsCard(g)}<div class="grid prop-graves">` → `${tiles(g)}${g.n < 2 ? '<p class="small muted prop-patterns-empty">Ab zwei Grabsteinen erscheinen hier Muster: Uhrzeit, Wochentag, Symbol, Setup, Verlustserie oder Emotion, wenn sie sich wiederholen.</p>' : patternsCard(g)}<div class="grid prop-graves">`
- `patternsCard` Z. 61: `${g.n < 2 ? 'Ab zwei …' : 'Kein wiederkehrendes Muster …'}` → nur `'Kein wiederkehrendes Muster: Uhrzeit, Symbol, Setup und Emotionen der Breaches unterscheiden sich.'`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .prop-patterns-empty] Es gilt die Fassung von aufbau-C13. In prop-friedhof.js:172 wird bei g.n < 2 die Karte „Muster“ durch die Textzeile `<p class="small muted prop-patterns-empty">Ab zwei Grabsteinen erscheinen hier Muster: Uhrzeit, Wochentag, Symbol, Setup, Verlustserie oder Emotion, wenn sie sich wiederholen.</p>` zwischen Kacheln und Grabsteinen ersetzt. patternsCard (Z. 61) zeigt dann nur noch „Kein wiederkehrendes Muster: …“. An der Kachel „Häufigste Regel“ kommt kein (i) dazu. Begründung: Der Satz erklärt den Abschnitt und nicht die Kachel „Häufigste Regel“. Ein (i) ist laut Brief nur beim Darüberfahren sichtbar und am Handy schlecht erreichbar. Klasse und Satz bleiben wörtlich, es gibt also keine neuen Übersetzungsschlüssel, und friedhoftest.js:47 bleibt unverändert grün. Beide Fassungen erfüllen Zustände Z10 („Friedhof < 2 ohne Muster-Karte“). Die Regel .prop-patterns-empty aus kilook-C5 (margin 0, line-height 1.5, max-width 560px) bleibt und passt.

## aufbau-D3f · Test proptest.js: Planer ohne Banner

Gruppe aufbau · Cluster prop · Aufwand S · Befunde: bereich_prop-28
Quelle: audit/spec/aufbau.md Z. 710–710 · Dateien: web/e2e/proptest.js
Abhängig von: aufbau-C12e

```text
- `proptest.js:98`: „Weg zum Bestehen“ → „Bedingungen zum Bestehen“; `proptest.js:102`: statt `plan.consistencyWarning` im Text `verletzt` bzw. `heute noch` in der Zeile „Consistency Rule“ prüfen
```

## diagramme-J1 · Prop-Puffer über Limit: „über dem Boden“ mit Boden-Tooltip

Gruppe diagramme · Cluster prop · Aufwand S · Befunde: diagramme-39
Quelle: audit/spec/diagramme.md Z. 657–665 · Dateien: web/js/screens/prop.js
Abhängig von: —

```text
### 3.10 `web/js/screens/prop.js`

**J1 Puffer über Limit** (diagramme-39)

Z. 93 `bar` →
```js
const bar = (lbl, x) => { if (!x) return ''; const over = x.limit > 0 && x.remaining > x.limit + C.EPS; const tip = over && x.floor != null ? ` data-tip="${esc(`${x.locked ? 'Boden fest bei' : 'Boden bei'} ${money(a, x.floor)}`)}"` : ''; return `<div class="prop-bar"><div class="bl"><span>${lbl} übrig</span><b${tip}>${money(a, x.remaining)} <span class="muted">${over ? 'über dem Boden' : `von ${money(a, x.limit)}`}</span></b></div><div class="track"><i style="width:${x.limit > 0 ? Math.min(100, x.remaining / x.limit * 100).toFixed(1) : 0}%;background:${x.limit > 0 ? col(x.remaining / x.limit) : 'var(--surface-3)'}"></i></div></div>`; };
```

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .prop-bar] Es gibt eine bar-Funktion (prop.js:93) auf Grundlage von diagramme-J1. Ist der Rest größer als das Limit, zeigt sie `${money(a, x.remaining)} <span class="muted">${x.locked ? 'über dem festen Boden' : 'über dem Boden'}</span>`. Am <b> steht nur bei x.floor != null ein data-tip „Boden fest bei {Betrag}“ bzw. „Boden bei {Betrag}“ (money(a, x.floor)). Sonst steht „{Rest} von {Limit}“. Der Balken ist bei Rest > Limit voll (min 100 %). Begründung: „über dem Boden“ sagt, was die Zahl bedeutet (Diagramme A-13). Der feste Boden bleibt wie in zustaende-S-P1 sichtbar, auch am Handy ohne Tooltip, und ohne das doppelte „Boden … · Boden fest“. Alle anderen Teile von zustaende-S-P1 bleiben: Ampel rot bei Verletzung, geplatzte Konten ohne Balken und Meta, Title gekappt. Die neuen Texte „über dem Boden“, „über dem festen Boden“, „Boden bei {0}“ und „Boden fest bei {0}“ kommen in alle fünf js/lang-Dateien.
- ÄNDERN: Bei over den gedämpften Text als `x.locked ? 'über dem festen Boden' : 'über dem Boden'` setzen. Tooltip, Balken und „von {Limit}“-Fall wie spezifiziert.

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

## barrierefreiheit-C-prop-304-305 · Prop-Reiter: aria-pressed an <a> streichen, aria-current bleibt

Gruppe barrierefreiheit · Cluster prop · Aufwand S · Befunde: barrierefreiheit-32
Quelle: audit/spec/barrierefreiheit.md Z. 861–862 · Dateien: web/js/screens/prop.js
Abhängig von: barrierefreiheit-B9b

```text
- **Z. 304 und 305:** `aria-pressed="${…}"` an den `<a>` streichen, `aria-current="page"` bleibt (Befund: barrierefreiheit-32)

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .prop-tabs a] Die Schiene aus komponenten-C19 ist die einzige Regel für `.tabs > button, .tabs > a, .prop-tabs a`, mit Skalenwerten statt 13.5/12.5 px: `display: inline-flex; align-items: center; height: 34px; padding: 0 12px; border: 1px solid transparent; border-radius: 9px; background: none; color: var(--text-2); font-size: var(--fs-14); line-height: var(--lh-14); font-weight: 500; …` (Rest wie C19). Fokus: `.tabs > button:focus-visible, .tabs > a:focus-visible, .prop-tabs a:focus-visible { outline-offset: -2px; }`, nur der Versatz. Farbe und Stärke kommen aus der globalen :focus-visible-Regel, nach barrierefreiheit-A1 var(--focus), nie --accent. Handy ≤560: `.prop-tabs a { flex: 1 1 auto; justify-content: center; padding: 0 4px; font-size: var(--fs-13); line-height: var(--lh-13); }`. Handy Z. 3054: `.tabs > button, .tabs > a { padding: 0 12px; font-size: var(--fs-13); line-height: var(--lh-13); }`. Gewählt über die gemeinsame Regel am Dateiende mit `.prop-tabs a[aria-current="page"]` (barrierefreiheit-B9b). Erst danach streichen prop.js 304/305 und affiliate.js 51 das aria-pressed (inkl. der Testanpassungen barrierefreiheit.md Z. 905–907). Grund: Reiter = 14/500 laut Typografie-Rollen, 12.5/13.5 sind verboten, Grün nie für Fokus (BRIEF, barrierefreiheit Z1).
- [konflikt: .prop-sub a] komponenten-C20 trägt die Unterstrich-Reiter `.subtabs > button, .set-tabs > button, .prop-sub a` mit `font-size: var(--fs-14); line-height: var(--lh-14); font-weight: 500; color: var(--muted)`. Hover und gewählt in --text, Linie `::after` mit `background: var(--text)`. Gewählt bei Knöpfen `[aria-pressed="true"]`, bei den Prop-Links `.prop-sub a[aria-current="page"]` (für Farbe und `::after { transform: scaleX(1) }`), weil Links kein aria-pressed tragen (barrierefreiheit Z4). Fokus `outline-offset: -2px`, nur der Versatz. Die Farbe kommt global, nicht --accent. -2px statt 2px, weil die Leiste mit overflow-x: auto den äußeren Ring oben abschneiden würde (barrierefreiheit Z1). .set-tabs bleibt damit 14 px und wird nur 600 → 500. Grund: Typografie-Rolle Reiter 14/500, keine 13.5 px. Unterstrich in --text statt Grün (BRIEF).

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

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: inert] P5 und 3.3c setzen beide #main inert; es gilt nur P5, siehe Anker App.renderSidebar. Der Grabstein-Schritt (inert an der verdeckten Seite .pg-back/.pg-front) betrifft andere Elemente und ist verträglich.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .prop-patterns-empty] Es gilt die Fassung von aufbau-C13. In prop-friedhof.js:172 wird bei g.n < 2 die Karte „Muster“ durch die Textzeile `<p class="small muted prop-patterns-empty">Ab zwei Grabsteinen erscheinen hier Muster: Uhrzeit, Wochentag, Symbol, Setup, Verlustserie oder Emotion, wenn sie sich wiederholen.</p>` zwischen Kacheln und Grabsteinen ersetzt. patternsCard (Z. 61) zeigt dann nur noch „Kein wiederkehrendes Muster: …“. An der Kachel „Häufigste Regel“ kommt kein (i) dazu. Begründung: Der Satz erklärt den Abschnitt und nicht die Kachel „Häufigste Regel“. Ein (i) ist laut Brief nur beim Darüberfahren sichtbar und am Handy schlecht erreichbar. Klasse und Satz bleiben wörtlich, es gibt also keine neuen Übersetzungsschlüssel, und friedhoftest.js:47 bleibt unverändert grün. Beide Fassungen erfüllen Zustände Z10 („Friedhof < 2 ohne Muster-Karte“). Die Regel .prop-patterns-empty aus kilook-C5 (margin 0, line-height 1.5, max-width 560px) bleibt und passt.

## kilook-C19a · Prop: Kopfkommentar aktualisieren (nur Friedhof, keine fünf Bereiche)

Gruppe kilook · Cluster prop · Aufwand S · Befunde: bereich_prop-51
Quelle: audit/spec/kilook.md Z. 661–663 · Dateien: web/js/screens/prop.js
Abhängig von: —

```text
**C19 · web/js/screens/prop.js** (diagramme-4, diagramme-32, ki_look-36, bereich_prop-51)
- **7–8** vorher „Weitere Ansichten (Friedhof, Vergleich, Simulation …) registrieren sich … Oben stehen nur fünf Bereiche; Finanzen und Analyse haben einen kleinen Umschalter … Die Adressen bleiben #/prop/<ansicht>“
  → nachher `/* Weitere Ansichten (Friedhof) registrieren sich aus eigenen Dateien über root.PropScreen.register. Die Adressen bleiben #/prop/<ansicht> */`
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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: U.pnl] Die Regel aus kilook-A3 gilt überall: Ergebnisse laufen über U.pnl und tragen immer ein Vorzeichen, signed: false fällt weg (kilook-C9b Z. 166, kilook-C16 Z. 26). Disziplin-Kosten tragen ein Vorzeichen (farbe-C29). Break-even sieht in TradeLog und Tagesansicht gleich aus: `<span class="neu">${fmt.cur(t.pnl, { signed: true, r: t.r })}</span>`, offene Trades zeigen `U.statusPill('open')` (aufbau-C7c und C15a). Prop-Beträge bekommen { currency: a.currency } (siehe money). Im Notebook tragen alle P&L-Beträge die Klasse num: der Notizkopf (farbe-C24c), die Trade-Notiz in der Liste (zustaende-S-NB1) und ebenso die neue Tagesnotiz-Zeile aus aufbau-C10d. responsiv-3.10 und typografie-3.8h sind verträglich (Text von 3.8h siehe U.barRow).
- [konflikt: money] Alles, was zu einem Prop-Konto gehört, steht in Kontowährung über money(a, …) bzw. U.pnl(…, { currency: a.currency }); darin sind kilook und wording einig. Beträge haben immer 2 Nachkommastellen, prop.js übergibt nirgends { compact: true } (siehe fmt.balance). Die Stop-Größe im Puffer-Tooltip steht in Kontowährung (wording 12.10): `${money(a, b.money)} Puffer${stopSize ? ` / ${money(a, stopSize)} je Stop` : ''}`. Puffer ÷ Stop-Größe wird ohne Umrechnung gerechnet; zwei verschiedene Währungszeichen würden eine Umrechnung vortäuschen. proptest.js:116 folgt wording-S19-prop. Zuständig je Stelle: Z. 50 (Breach) und Z. 68 (fmtMoney) → wording-S12.1-12.3 mit `v => money(a, v)`. Z. 75 → planText. Z. 86–87 → summaryTiles. Z. 102: Text „Kontostand“, U.pnl-Währung und U.count → wording 12.9, Klasse .kpi-label → kilook-C19b. Z. 104 → wording 12.10 plus Beschriftung aus responsiv-3.12a. Z. 194 (Hinweis) → kilook-C19b. Z. 283–284 (Planer) → wording-S12.24-12.26, einschließlich der Auszahlung `money(a, ev.pnl * num(a.profitSplit, 0))`. Z. 303 (Kommentar) → kilook-C19c.
- [konflikt: fmt.balance] Für Bestände und Regelgrößen gibt es keine Ganzzahl-Regel. Geld hat immer 2 Nachkommastellen (zustaende-S-U1); typografie K24 und zustaende K14 haben „Balance und Limits ganzzahlig“ ausdrücklich verworfen, nur kilook will es. fmt.balance bleibt `fmt.cur(v, o)` ohne Vorzeichen und wird im Geld-blind-Modus ausgeblendet. Ohne Cent (compact) stehen Beträge nur im Kalender-Monatsraster (.p Tageszelle, Wochensumme), an Achsen (fmt.axisCur), in Kurzformen (.pm, curShort, curCompact) und bei Monte Carlo. Damit sind Kontostand, Limits, Ziel, Puffer, „… fehlen“, „heute noch … erlaubt“, Vorschlag und die Affiliate-Kacheln so genau wie P&L, und „X von Y“ ist auf beiden Seiten gleich genau. Die Grabstein-Unterzeile zeigt keinen Geldbetrag (wording-S12.28-12.29).
- [doppelt: fmt.cur] zustaende-S-U1 setzt ui.js:122 einmal um: `const d = o.compact ? 0 : 2;`, mit Überlaufprüfung und notfalls @container 164 → 190 px. Kalender-Monatsraster mit compact: true (kilook-C9a). Das ist dieselbe Änderung wie 6.1/6.2 in wording-S6.1-6.4; wer zuerst umsetzt, macht sie, der andere überspringt. Monte Carlo ohne Cent setzt wording-S10.13-10.15 einmal um, ergänzt um das Startkapital aus kilook-C14. Prop und Affiliate bekommen kein compact (siehe fmt.balance und money). chartLabel aus barrierefreiheit-U6a nutzt das Standardformat.
- VERBINDLICH (Kreuzprüfung): Es bleibt nur prop.js Z. 303: Der Kommentar „Die fünf Bereiche stehen links in der Kopfreihe …“ → „Die drei Bereiche stehen links in der Kopfreihe …“. Alle Ersetzungen in Z. 283/284 entfallen. Die Kontowährung im Payout-Planer setzt wording-S12.24-12.26 um: U.pnl und fmt.balance mit `{ currency: a.currency }`, alle `fmt.cur(…)` → `money(a, …)`, einschließlich der Auszahlung `money(a, ev.pnl * num(a.profitSplit, 0))` und des Vorschlags in Z. 284. Das geschieht ohne `{ compact: true }`, weil Beträge in prop.js laut Anker money/fmt.balance immer 2 Nachkommastellen haben. „heute noch … erlaubt“ wird mit abstaende-M6 eine eigene Zeile „Heute noch erlaubt“.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: U.pnl] Die Regel aus kilook-A3 gilt überall: Ergebnisse laufen über U.pnl und tragen immer ein Vorzeichen, signed: false fällt weg (kilook-C9b Z. 166, kilook-C16 Z. 26). Disziplin-Kosten tragen ein Vorzeichen (farbe-C29). Break-even sieht in TradeLog und Tagesansicht gleich aus: `<span class="neu">${fmt.cur(t.pnl, { signed: true, r: t.r })}</span>`, offene Trades zeigen `U.statusPill('open')` (aufbau-C7c und C15a). Prop-Beträge bekommen { currency: a.currency } (siehe money). Im Notebook tragen alle P&L-Beträge die Klasse num: der Notizkopf (farbe-C24c), die Trade-Notiz in der Liste (zustaende-S-NB1) und ebenso die neue Tagesnotiz-Zeile aus aufbau-C10d. responsiv-3.10 und typografie-3.8h sind verträglich (Text von 3.8h siehe U.barRow).
- [konflikt: fmt.balance] Für Bestände und Regelgrößen gibt es keine Ganzzahl-Regel. Geld hat immer 2 Nachkommastellen (zustaende-S-U1); typografie K24 und zustaende K14 haben „Balance und Limits ganzzahlig“ ausdrücklich verworfen, nur kilook will es. fmt.balance bleibt `fmt.cur(v, o)` ohne Vorzeichen und wird im Geld-blind-Modus ausgeblendet. Ohne Cent (compact) stehen Beträge nur im Kalender-Monatsraster (.p Tageszelle, Wochensumme), an Achsen (fmt.axisCur), in Kurzformen (.pm, curShort, curCompact) und bei Monte Carlo. Damit sind Kontostand, Limits, Ziel, Puffer, „… fehlen“, „heute noch … erlaubt“, Vorschlag und die Affiliate-Kacheln so genau wie P&L, und „X von Y“ ist auf beiden Seiten gleich genau. Die Grabstein-Unterzeile zeigt keinen Geldbetrag (wording-S12.28-12.29).
- ÄNDERN: Z. 136 entfällt, die Unterzeile ersetzt wording-S12.28-12.29. Z. 32, 119–122, 146 und 149 bleiben.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: money] Alles, was zu einem Prop-Konto gehört, steht in Kontowährung über money(a, …) bzw. U.pnl(…, { currency: a.currency }); darin sind kilook und wording einig. Beträge haben immer 2 Nachkommastellen, prop.js übergibt nirgends { compact: true } (siehe fmt.balance). Die Stop-Größe im Puffer-Tooltip steht in Kontowährung (wording 12.10): `${money(a, b.money)} Puffer${stopSize ? ` / ${money(a, stopSize)} je Stop` : ''}`. Puffer ÷ Stop-Größe wird ohne Umrechnung gerechnet; zwei verschiedene Währungszeichen würden eine Umrechnung vortäuschen. proptest.js:116 folgt wording-S19-prop. Zuständig je Stelle: Z. 50 (Breach) und Z. 68 (fmtMoney) → wording-S12.1-12.3 mit `v => money(a, v)`. Z. 75 → planText. Z. 86–87 → summaryTiles. Z. 102: Text „Kontostand“, U.pnl-Währung und U.count → wording 12.9, Klasse .kpi-label → kilook-C19b. Z. 104 → wording 12.10 plus Beschriftung aus responsiv-3.12a. Z. 194 (Hinweis) → kilook-C19b. Z. 283–284 (Planer) → wording-S12.24-12.26, einschließlich der Auszahlung `money(a, ev.pnl * num(a.profitSplit, 0))`. Z. 303 (Kommentar) → kilook-C19c.
- ÄNDERN: Z. 56 und Z. 116 nach wording-S19-prop (Z. 116: `UI.fmt.cur(150, { currency: acc.currency })` + ' je Stop'). Z. 101: `fmtMoney: v => UI.fmt.cur(v, { currency: Store.propAccounts()[2].currency })` ohne compact. Z. 55 (fmt.balance) bleibt, das ist gleich fmt.cur.
