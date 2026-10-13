# Paket 005 · komponenten, tokens

Schritte: 34 · Dateien: web/README.md, web/css/app.css, web/css/landing.css, web/index.html, web/js/app.js, web/js/ui.js
Betroffene Tests laut Spezifikation: e2e/certtest.js; e2e/coachtest.js (Coach-Felder .input.sm neben btn sm, 4.2); e2e/dptest.js; e2e/filtertest.js; e2e/rangetest.js (.rr-nav); e2e/shadowtest.js (Regelwerk .sr-num/.sr-step); e2e/shadowtest.js:37–46 (Seitenwahl); e2e/shadowtest.js:37–46 und e2e/tlfittest.js (Seitenwahl mit .select.sm); e2e/tlfittest.js:8–9 (Pager sichtbar); e2e/tradeformtest.js (Zahlenfelder im Trade-Dialog); web/e2e/dashtest.js:19 (muss grün bleiben); web/e2e/mobiletest.js:34 (Handy-Ausnahme bleibt); web/e2e/tlfittest.js (muss grün bleiben); web/e2e/tradeformtest.js:63 (Fußzeile/Handy, muss grün bleiben); web/tests/inline-style.test.mjs (Zählung, Schritt R5)
Baut auf Paketen auf: 1, 2, 4

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## typografie-3.10 · README nachziehen: variable Satoshi, Kalender-Kurzform mit €, Typo-, Skalen- und Zahlenregeln

Gruppe typografie · Cluster tokens · Aufwand S · Befunde: typografie-1, responsiv-33, typografie-3, typografie-11, typografie-12, typografie-14, referenz-28, referenz-43, bereich_statistik-42
Quelle: audit/spec/typografie.md Z. 453–460 · Dateien: web/README.md
Abhängig von: typografie-3.1, typografie-3.2.1, typografie-3.2.2c, typografie-3.2.2f, typografie-3.2.3b, typografie-3.4a, typografie-3.4b, typografie-3.4c

```text
### 3.10 `web/README.md`

| Stelle | vorher → nachher | Befund |
|---|---|---|
| Z. 175–176 | „(feste Schnitte 400, 500, 700, 900; Gewicht 600 nimmt Bold)“ → „(variable Schrift mit Gewichtsachse 300–900; 500, 600 und 700 sind echte Stufen, die Marke steht auf 900)“ | typografie-1 |
| Z. 91 | „Kalender mit kurzer Tageszahl („+2,1k“, „−486“, …“ → „Kalender mit kurzer Tageszahl samt Währungszeichen („+2,1k€“, „−486€“, …“ | responsiv-33 |
| Z. 209–210, nach „… fett.“ ergänzen | „Etiketten (Pillen, Abzeichen, Zähler) und Listenwerte 600, die Marke 900. Satoshi für Wörter, Onest für alles, was überwiegend aus Ziffern besteht; Tabellenzellen sind Text, Zahlenzellen tragen `r`, `c` oder `num`. **Schriftgrößen** nur über Tokens in `css/app.css`: Text `--fs-11/12/13/14/15/18/21` mit Zeilenhöhen `--lh-*` (als Verhältnis, 16/16/18/20/20/24/28 px), Werte `--fv-14/16/20/24/32/44` (Onest 700, Zeilenhöhe 1.1); `--fs-10` nur in Container-Notstufen. Wert-Beschriftungen über großen Zahlen normal geschrieben (`.val-label`), Versalien nur für Abschnitts-Labels. **Zahlen:** Beträge immer mit zwei Nachkommastellen (ohne nur bewusst über `compact`, dann für beide Werte eines Paares), Profit-Faktor zwei Stellen, Win-Rate in Kacheln eine Stelle, in Tabellen keine; Datum in Trade-Listen ohne Jahr im laufenden Jahr (`fmt.dateRow`).“ | typografie-3, -11, -12, -14, referenz-28, -43, bereich_statistik-42 |

```

## typografie-3.4d · Neuer Helfer fmt.weekdayDM („Do., 08.10.“)

Gruppe typografie · Cluster komponenten · Aufwand S · Befunde: bereich_statistik-40
Quelle: audit/spec/typografie.md Z. 390–391 · Dateien: web/js/ui.js
Abhängig von: —

```text
| nach Z. 158 (`weekdayLong`) neu | `weekdayDM(d, withYear) { return new Date(d).toLocaleDateString(LOC(), Object.assign({ weekday: 'short', day: '2-digit', month: '2-digit' }, withYear ? { year: '2-digit' } : {})); }, /* Tagestabelle: „Do., 08.10.“ */` | bereich_statistik-40 |

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: fmt.weekdayLong] Ein Formatierer und eine Zellform auf allen Breiten. Statistik → Tage zeigt das Datum überall als „Do., 08.10.“, über eine Jahresgrenze „Do., 08.10.25“. Es kommt aus fmt.weekdayDM(d, withYear) (typografie-3.4d), die Zelle steht in Onest (class="num"). Endzustand der Tageszelle in stats.js Z. 32: `<td class="num"><a class="row-link" href="#/day/${d.key}">${fmt.weekdayDM(d.day, multiYear)}</a></td>`, multiYear aus typografie-3.8e. Grund: Die Kurzform passt schon bei 390 px. Eine zweite Handy-Variante (ph-hide/ph-only) und ein zweiter Formatierer mit gleicher Ausgabe (fmt.weekdayShort) wären doppelt, und die Typografie-Regel legt die Tagestabelle auf „Do., 08.10.“ fest. Die übrigen Handy-Maßnahmen aus responsiv-3.9b bleiben: ph-fit, ph-hide an Gewinner, Verlierer, Brutto, Gebühren und Drawdown sowie die Änderungen an groupTable.
- ÜBERNIMMT responsiv-3.2a: fmt.weekdayShort nicht anlegen. Dieselbe Ausgabe liefert fmt.weekdayDM(d) aus typografie-3.4d. In den Regeln und Texten von Responsiv „fmt.weekdayShort“ durch „fmt.weekdayDM“ ersetzen.

## abstaende-A7 · .field: gap 6px → var(--sp-2)

Gruppe abstaende · Cluster komponenten · Aufwand S · Befunde: abstaende_layout-1
Quelle: audit/spec/abstaende.md Z. 309–309 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
| A7 | `.field` (Z. 297) | `gap: 6px` → `gap: var(--sp-2)` | abstaende_layout-1 |
```

## abstaende-A8 · .form-grid: gap → var(--sp-4); neue Hilfsklasse .form-grid .span4 (ab 961 px vier Spuren, darunter volle Zeile)

Gruppe abstaende · Cluster komponenten · Aufwand S · Befunde: abstaende_layout-32, bereich_prop-37
Quelle: audit/spec/abstaende.md Z. 310–310 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
| A8 | `.form-grid` (Z. 300) | `gap: 12px 14px` → `gap: var(--sp-4)`. Neu nach Z. 301: `.form-grid .span4 { grid-column: 1 / -1; } @media (min-width: 961px) { .form-grid .span4 { grid-column: span 4; } }` | abstaende_layout-32, bereich_prop-37 |
```

## abstaende-B1 · .card: padding var(--pad-card) und --pad-x: var(--pad-card)

Gruppe abstaende · Cluster komponenten · Aufwand S · Befunde: abstaende_layout-31, abstaende_layout-12
Quelle: audit/spec/abstaende.md Z. 313–317 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
**B – Komponenten**

| Nr. | Stelle | vorher → nachher | Befunde |
|---|---|---|---|
| B1 | `.card` (Z. 485) | `padding: 18px 20px` → `--pad-x: var(--pad-card); padding: var(--pad-card);` | abstaende_layout-31, abstaende_layout-12 |
```

## abstaende-B2 · .card.tight löschen (im JS unbenutzt)

Gruppe abstaende · Cluster komponenten · Aufwand S · Befunde: abstaende_layout-31
Quelle: audit/spec/abstaende.md Z. 318–318 · Dateien: web/css/app.css
Abhängig von: —

```text
| B2 | `.card.tight` (Z. 487) | Regel löschen (im JS unbenutzt) | abstaende_layout-31 |
```

## abstaende-B3 · .card.flush: zusätzlich --pad-x: 0px

Gruppe abstaende · Cluster komponenten · Aufwand S · Befunde: abstaende_layout-12
Quelle: audit/spec/abstaende.md Z. 319–319 · Dateien: web/css/app.css
Abhängig von: abstaende-B1

```text
| B3 | `.card.flush` (Z. 488) | `padding: 0; overflow: hidden;` → `--pad-x: 0px; padding: 0; overflow: hidden;` | abstaende_layout-12 |
```

## abstaende-B4 · Kartenkopf: .card-head margin-bottom var(--sp-4); Titel und Knopfreihe auf einer Mittellinie (:not(:has(.card-sub)) center, .card-head > .row margin-block -7px)

Gruppe abstaende · Cluster komponenten · Aufwand S · Befunde: abstaende_layout-11, komponenten-22, bereich_konto-26
Quelle: audit/spec/abstaende.md Z. 320–320 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
| B4 | `.card-head` (Z. 490) | `margin-bottom: 14px` → `margin-bottom: var(--sp-4)`. Neu dahinter: `.card-head:not(:has(.card-sub)) { align-items: center; } .card-head > .row { margin-block: -7px; }` | abstaende_layout-11, komponenten-22, bereich_konto-26 |
```

## abstaende-B5 · .card-sub: margin-top 3px → var(--sp-1)

Gruppe abstaende · Cluster komponenten · Aufwand S · Befunde: abstaende_layout-1
Quelle: audit/spec/abstaende.md Z. 321–321 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
| B5 | `.card-sub` (Z. 503) | `margin-top: 3px` → `margin-top: var(--sp-1)` | abstaende_layout-1 |
```

## abstaende-B6 · Trenner auch in Einstellungsblöcken sichtbar: .card .divider → :is(.card, .set-block) .divider

Gruppe abstaende · Cluster komponenten · Aufwand S · Befunde: abstaende_layout-23
Quelle: audit/spec/abstaende.md Z. 322–322 · Dateien: web/css/app.css
Abhängig von: —

```text
| B6 | `.card .divider` (Z. 504) | Selektor → `:is(.card, .set-block) .divider` (der Trenner in Einstellungsblöcken war unsichtbar) | abstaende_layout-23 |
```

## abstaende-B7 · .tile: padding var(--sp-4) var(--sp-5), gap var(--sp-2)

Gruppe abstaende · Cluster komponenten · Aufwand S · Befunde: abstaende_layout-31, bereich_dashboard-42
Quelle: audit/spec/abstaende.md Z. 323–323 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
| B7 | `.tile` (Z. 515) | `padding: 12px 15px 12px; … gap: 7px;` → `padding: var(--sp-4) var(--sp-5); … gap: var(--sp-2);` | abstaende_layout-31, bereich_dashboard-42 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .tile] Endstand: `.tile { …; padding: var(--sp-4) var(--sp-5); …; gap: var(--sp-2); …; transition: border-color var(--dur-1) var(--ease); }` (abstaende-B7 und zustaende-S-C5). Kacheln, Statistik-Kacheln und Karten reagieren beim Darüberfahren gar nicht: kein Anheben, kein Schatten, kein Randwechsel. Nur das (i) blendet ein (Z. 497 bleibt). Grund: Kacheln und Karten sind nicht klickbar. Ein Randwechsel täuscht Klickbarkeit vor und ist Bewegung ohne Bedeutung (BRIEF: ruhig, nichts Dekoratives). Die Bewegungs-Regel H3 („Kacheln folgen .card:hover“) bleibt erfüllt, weil zustaende-S-C5 auch .card:hover löscht. Die Rand-Variante aus Bewegung und Komponenten entfällt.

## abstaende-B8 · Kachel-Container-Abfrage 220px → 210px

Gruppe abstaende · Cluster komponenten · Aufwand S · Befunde: bereich_dashboard-42
Quelle: audit/spec/abstaende.md Z. 324–324 · Dateien: web/css/app.css
Abhängig von: abstaende-B7

```text
| B8 | `@container (max-width: 220px)` (Z. 523) | `220px` → `210px` | bereich_dashboard-42 |
```

## abstaende-B9 · Wertlinie: .tile .body align-items flex-start, padding-top var(--sp-3)

Gruppe abstaende · Cluster komponenten · Aufwand S · Befunde: bereich_dashboard-10, hierarchie-10, bereich_konto-27, bereich_prop-12, bereich_training-25, bereich_statistik-9, responsiv-36
Quelle: audit/spec/abstaende.md Z. 325–325 · Dateien: web/css/app.css
Abhängig von: abstaende-A1, abstaende-B7

```text
| B9 | `.tile .body` (Z. 524) | `align-items: center; … padding-top: 8px;` → `align-items: flex-start; … padding-top: var(--sp-3);` (flex: 1, gap und background bleiben) | bereich_dashboard-10, hierarchie-10, bereich_konto-27, bereich_prop-12, bereich_training-25, bereich_statistik-9, responsiv-36 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .tile .body] abstaende-B9 und typografie-3.8b ergänzen sich. .tile .body bekommt align-items flex-start und padding-top var(--sp-3), und die Verlaufskachel im TradeLog bekommt `class="body spark-body"`. Damit erbt sie Trennlinie, Abstand und Ausrichtung aus der einen Regel .tile .body, und diese Regel bleibt die einzige Quelle dafür. In `.tile.spark-tile .spark-body` werden Linie (background-Verlauf) und padding-top deshalb nicht ein zweites Mal gesetzt. komponenten-C25b wollte padding-top 8px plus Linie, abstaende-B13 padding-top 12 plus flex-start. Begründung: Jeder Wert steht an einer Stelle, und Dashboard- und TradeLog-Kachel weichen nicht um 8 gegen 12 px voneinander ab. Die offene Frage ki_look-10/bereich_dashboard-41 (Linie weglassen) wirkt später automatisch auf beide Kachelarten, blockiert diese Schritte aber nicht.

## abstaende-B10 · Kachel-Diagramm im Fluss nur so hoch wie die Wertzeile: .tile.side .gauge margin-block -14px, .tile.side .body padding-bottom var(--sp-2), Kommentar neu

Gruppe abstaende · Cluster komponenten · Aufwand S · Befunde: bereich_dashboard-10, hierarchie-10, bereich_konto-27, bereich_prop-12, bereich_training-25, bereich_statistik-9, responsiv-36
Quelle: audit/spec/abstaende.md Z. 326–326 · Dateien: web/css/app.css
Abhängig von: abstaende-B9

```text
| B10 | Kommentar Z. 527 und `.tile.side .gauge` (Z. 528) | Kommentar → „Kacheln mit kleinem Diagramm: der Wert steht oben wie in allen Kacheln; das Diagramm belegt nur die Wertzeile (negativer Rand) und bleibt mittig zur Zahl“. Regel → `.tile.side .gauge { margin-right: var(--sp-3); margin-block: -14px; } .tile.side .body { padding-bottom: var(--sp-2); }` | wie B9 |
```

## abstaende-B11 · Kachel-Container-Abfragen 178 → 168 und 164 → 154; 150er-Abfrage bleibt und erhält .tile.side .gauge:has(> .gauge-stack) margin-block -3px

Gruppe abstaende · Cluster komponenten · Aufwand S · Befunde: bereich_dashboard-42, bereich_dashboard-10, hierarchie-10, bereich_konto-27, bereich_prop-12, bereich_training-25, bereich_statistik-9, responsiv-36
Quelle: audit/spec/abstaende.md Z. 327–327 · Dateien: web/css/app.css
Abhängig von: abstaende-B7, abstaende-B10

```text
| B11 | Container-Abfragen Z. 532, 533 | `178px` → `168px`, `164px` → `154px`. Z. 534 (`150px`) bleibt; dort zusätzlich `.tile.side .gauge:has(> .gauge-stack) { margin-block: -3px; }` ergänzen. | bereich_dashboard-42, wie B9 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: @container (max-width: 164px)] Die Schwelle geht von 164 auf 154 (abstaende-B11). Begründung: Mit abstaende-B7 hat die Kachel seitlich 20 statt 15 px Polster. Container-Abfragen messen die Inhaltsbreite, also muss jede Abfrage um 10 px mitwandern (178 → 168, 164 → 154), sonst greifen die Notstufen bei gleicher Kachelbreite früher. Die Überlaufprüfung aus zustaende-S-U1 (Beträge immer mit zwei Nachkommastellen) läuft erst danach bei 1024 und 390 px. Nur wenn ein Wert überläuft, wird die 154er-Schwelle angehoben, höchstens auf 180px. Das entspricht den 190px aus S-U1 vor der Polster-Änderung. Stellen werden nicht abgeschnitten. Die Schriftgröße innerhalb der Abfrage entscheiden die Anker .tile .val/--fv-*, nicht dieser.

## abstaende-B12 · Container-Abfrage 250px → 240px (Serien-/Pillen-Kachel)

Gruppe abstaende · Cluster komponenten · Aufwand S · Befunde: bereich_dashboard-42
Quelle: audit/spec/abstaende.md Z. 328–328 · Dateien: web/css/app.css
Abhängig von: abstaende-B7

```text
| B12 | `@container (max-width: 250px)` (Z. 1644) | `250px` → `240px` | bereich_dashboard-42 |
```

## abstaende-B17 · .kv b: zusätzlich text-align: right (global)

Gruppe abstaende · Cluster komponenten · Aufwand S · Befunde: bereich_prop-29
Quelle: audit/spec/abstaende.md Z. 333–333 · Dateien: web/css/app.css
Abhängig von: —

```text
| B17 | `.kv b` (Z. 654) | `font-weight: 600;` → `font-weight: 600; text-align: right;` | bereich_prop-29 |
```

## abstaende-B18 · .bar-row: gap var(--sp-1), padding var(--sp-2) 0

Gruppe abstaende · Cluster komponenten · Aufwand S · Befunde: abstaende_layout-1
Quelle: audit/spec/abstaende.md Z. 334–334 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
| B18 | `.bar-row` (Z. 655) | `gap: 5px; padding: 7px 0;` → `gap: var(--sp-1); padding: var(--sp-2) 0;` | abstaende_layout-1 |
```

## abstaende-B19 · .banner: padding var(--sp-3) var(--sp-4)

Gruppe abstaende · Cluster komponenten · Aufwand S · Befunde: abstaende_layout-31
Quelle: audit/spec/abstaende.md Z. 335–335 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
| B19 | `.banner` (Z. 662) | `padding: 14px 16px` → `padding: var(--sp-3) var(--sp-4)` | abstaende_layout-31 |
```

## abstaende-B20 · Tabellenzellen: .tbl th/td var(--sp-3) var(--sp-4), .tbl.compact var(--sp-2) var(--sp-3); Ausnahmen TradeLog und Handy bleiben

Gruppe abstaende · Cluster komponenten · Aufwand S · Befunde: abstaende_layout-1
Quelle: audit/spec/abstaende.md Z. 336–336 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
| B20 | Tabellen Z. 593, 597, 612 | `.tbl th` `padding: 13px 14px` → `var(--sp-3) var(--sp-4)`. `.tbl td` `12px 14px` → `var(--sp-3) var(--sp-4)`. `.tbl.compact td, .tbl.compact th` `9px 12px` → `var(--sp-2) var(--sp-3)`. Ausnahmen 1743 (TradeLog), 2990–2994 und 3056 (Handy) bleiben. | abstaende_layout-1 |
```

## abstaende-B21 · Tabellen in Karten bis an den Kartenrand: .tbl-wrap.inset mit --pad-x-Ausgleich, .pf-body als Karte, Pager-Polster, Handy-Regeln löschen, .tbl.wrap th

Gruppe abstaende · Cluster komponenten · Aufwand M · Befunde: abstaende_layout-12, bereich_trades_tag-3
Quelle: audit/spec/abstaende.md Z. 337–337 · Dateien: web/css/app.css
Abhängig von: abstaende-B1, abstaende-B3

```text
| B21 | Tabellen in Karten, neu nach Z. 615 | `:is(.card, .pf-body) .tbl-wrap.inset { margin-inline: calc(-1 * var(--pad-x)); }` `:is(.card, .pf-body) .tbl-wrap.inset .tbl :is(th, td):first-child { padding-left: var(--pad-x); }` `:is(.card, .pf-body) .tbl-wrap.inset .tbl :is(th, td):last-child { padding-right: var(--pad-x); }`. Der aufklappbare Prop-Abschnitt ist eine Karte ohne `.card`: Z. 2627 `.pf-body { padding: 4px 20px 20px; …; gap: 14px; }` → `.pf-body { --pad-x: var(--pad-card); padding: var(--sp-1) var(--pad-card) var(--pad-card); …; gap: var(--sp-4); }`. Z. 2440 `.tbl-wrap.inset .pager { padding: 12px 0 0; … }` → `padding: var(--sp-3) var(--pad-x, 0) 0;`. Handy-Regeln Z. 3033–3034 löschen. Neu nach Z. 615: `.tbl.wrap th { white-space: normal; }` | abstaende_layout-12, bereich_trades_tag-3 |
```

## abstaende-B22 · Dialoge: .modal padding var(--sp-6), neu .modal > form als Flex-Spalte (gap var(--sp-4)), .modal-foot gap var(--sp-2) + padding-top var(--sp-4), 960er-Polster var(--sp-5) var(--sp-4)

Gruppe abstaende · Cluster komponenten · Aufwand M · Befunde: bereich_prop-36, komponenten-20, bereich_konto-47
Quelle: audit/spec/abstaende.md Z. 338–338 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
| B22 | `.modal` (Z. 827), `.modal-foot` (Z. 832) | `.modal`: `padding: 22px 24px` → `padding: var(--sp-6)`. Neu nach Z. 829: `.modal > form { display: flex; flex-direction: column; gap: var(--sp-4); min-width: 0; }`. `.modal-foot`: `gap: 10px; … padding-top: 6px;` → `gap: var(--sp-2); … padding-top: var(--sp-4);`. Im 960er-Block Z. 942 `.modal { padding: 18px 16px; }` → `.modal { padding: var(--sp-5) var(--sp-4); }` | bereich_prop-36, komponenten-20, bereich_konto-47 |
```

## abstaende-B28 · Container-Innenabstände auf Skala: .cpn, .aff-ticket, .coach-entry, .nw-next, .rp-choice, .shadow-rule, .coach-invite, .prop-entry

Gruppe abstaende · Cluster komponenten · Aufwand M · Befunde: abstaende_layout-31
Quelle: audit/spec/abstaende.md Z. 344–345 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
| B28 | weitere Container | `.cpn` (Z. 2645) `gap: 5px; padding: 18px 20px` → `gap: var(--sp-1); padding: var(--pad-card)`. `.aff-ticket` (Z. 2667), `.coach-entry` (Z. 2870), `.nw-next` (Z. 3070), `.rp-choice` (Z. 2156) `padding: 16px 18px` → `padding: var(--sp-4) var(--sp-5)`. `.shadow-rule` (Z. 2401) `padding: 14px 16px` → `var(--sp-3) var(--sp-4)`. `.coach-invite` (Z. 2863) `padding: 12px 14px` → `var(--sp-3) var(--sp-4)`. `.prop-entry` (Z. 2681) `padding: 14px; margin-bottom: 14px` → `padding: var(--sp-4); margin-bottom: var(--sp-4)` | abstaende_layout-31 |

```

## abstaende-C1 · .grid gap var(--grid-gap); neu .grid.detail-grid (zwei Spalten, unter 1280 px eine)

Gruppe abstaende · Cluster komponenten · Aufwand S · Befunde: abstaende_layout-32, bereich_trades_tag-3
Quelle: audit/spec/abstaende.md Z. 346–350 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
**C – Raster und Seitenlayout**

| Nr. | Stelle | vorher → nachher | Befunde |
|---|---|---|---|
| C1 | `.grid` (Z. 505) | `gap: 18px` → `gap: var(--grid-gap)`. Neu nach Z. 512: `.grid.detail-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } @media (max-width: 1279px) { .grid.detail-grid { grid-template-columns: 1fr; } }` | abstaende_layout-32, bereich_trades_tag-3 |
```

## abstaende-E4 · Inline-Abstände in app.js (9) durch Hilfsklassen ersetzen; CSV-Import-Labels als .field.inline (neue Regel nach .field)

Gruppe abstaende · Cluster komponenten · Aufwand M · Befunde: abstaende_layout-34
Quelle: audit/spec/abstaende.md Z. 386–387 · Dateien: web/js/app.js, web/css/app.css
Abhängig von: abstaende-A6, abstaende-A7

```text
| E4 | Inline-Abstände (9 Stück) | nach 1.16 ersetzen: `margin-left:auto` → `ml-auto`, `gap:18px` → `s-4`, `margin-top:6px`/`8px` → `mt-2`. CSV-Import (Z. 564): die drei `<label class="field" style="flex-direction:row;align-items:center;gap:6px">` → `<label class="field inline">`, dazu in app.css nach `.field` (A7) `.field.inline { flex-direction: row; align-items: center; }` (gap 8 aus `.field`). | abstaende_layout-34 |

```

## abstaende-UI · ui.js: keine Strukturänderung (U.tile bleibt), einen Inline-Abstand nach 1.16 ersetzen

Gruppe abstaende · Cluster komponenten · Aufwand S · Befunde: abstaende_layout-34
Quelle: audit/spec/abstaende.md Z. 388–391 · Dateien: web/js/ui.js
Abhängig von: abstaende-A6

```text
### web/js/ui.js

Keine Strukturänderung. Die Kachel-Ausrichtung ist reines CSS. U.tile (Z. 171) bleibt, weil Variante H aus hierarchie-10 nicht umgesetzt wird. Ein Inline-Stil (nach 1.16).

```

## abstaende-P1-P3 · Startseite: Demo-Fenster-Klasse .shot → .lp-shot in index.html (Markup und Reveal-Selektor) und landing.css; app.css-.shot bleibt

Gruppe abstaende · Cluster komponenten · Aufwand S · Befunde: ki_look-3
Quelle: audit/spec/abstaende.md Z. 498–505 · Dateien: web/index.html, web/css/landing.css
Abhängig von: —

```text
### web/index.html, web/css/landing.css

| Nr. | Stelle | vorher → nachher | Befunde |
|---|---|---|---|
| P1 | index.html Z. 34 | `<div class="shot">` → `<div class="lp-shot">` | ki_look-3 |
| P2 | index.html Z. 67 | `'.shot, section.feat, section.steps'` → `'.lp-shot, section.feat, section.steps'` | ki_look-3 |
| P3 | landing.css Z. 19–23, 59–60 | jedes `.lp .shot` → `.lp .lp-shot`. app.css:752–756 (`.shot` für Trade-Screenshots) bleibt. | ki_look-3 |

```

## komponenten-C01 · Symbole in Knöpfen schrumpfen nicht (inkl. Einleitung Abschnitt 3)

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: bereich_notebook_news-37
Quelle: audit/spec/komponenten.md Z. 187–197 · Dateien: web/css/app.css
Abhängig von: —

```text
## 3. Umsetzungsschritte

Reihenfolge: erst app.css (Grundlagen → Komponenten → Einzelstellen), dann JS-Dateien (Helfer in ui.js/app.js zuerst, dann Bildschirme), dann Sprachdateien, README, e2e. Jeder Schritt nennt die erledigten Befund-ids.

### 3.1 web/css/app.css

#### A. Grundlagen und Skalen

**C01 – Symbole in Knöpfen schrumpfen nicht** (bereich_notebook_news-37)
Z. 271 `.btn svg { width: 16px; height: 16px; }` → `.btn svg { width: 16px; height: 16px; flex: 0 0 auto; }`

```

## komponenten-C02 · Zahlenfelder ohne Browser-Pfeile, global

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: komponenten-16, bereich_trades_tag-10
Quelle: audit/spec/komponenten.md Z. 198–205 · Dateien: web/css/app.css
Abhängig von: —

```text
**C02 – Zahlenfelder ohne Browser-Pfeile, global** (komponenten-16, bereich_trades_tag-10)
Nach Z. 294 (`.input::placeholder`) einfügen, ohne Klassenbindung:
```css
input[type=number] { -moz-appearance: textfield; appearance: textfield; }
input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
```
Danach streichen: in Z. 1093 nur `-moz-appearance: textfield;`; die ganzen Zeilen 1094, 2238, 2239, 2416 (`.sr-num .input { -moz-appearance… }`) und 2418. Kommentar Z. 2415 und `.sr-step` bleiben.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: input[type=number]] Die globale Regel gegen Browser-Pfeile legt allein komponenten-C02 an, nach Z. 294: `input[type=number] { -moz-appearance: textfield; appearance: textfield; }` plus `::-webkit-inner/outer-spin-button { -webkit-appearance: none; margin: 0; }`. abstaende-O1 baut darauf auf und setzt nur den affiliate.js-Teil um, also Untertitel und Feld in `.stack`.

## komponenten-C03 · sm-Stufe 34 px für Felder (.input.sm neu, .select.sm angleichen)

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: bereich_konto-9, komponenten-14
Quelle: audit/spec/komponenten.md Z. 206–209 · Dateien: web/css/app.css
Abhängig von: —

```text
**C03 – sm-Stufe 34 px für Felder** (bereich_konto-9, komponenten-14)
Nach Z. 296 (`.select {…}`) einfügen: `.input.sm { height: 34px; padding: 0 10px; font-size: 12.5px; border-radius: 9px; }`
Z. 1653 `.select.sm { … padding: 6px 28px 6px 10px; … }` → `padding: 7px 28px 7px 10px;` (ergibt 34,1 px; übrige Angaben bleiben). `.rep-type` (Z. 1708, eigene Höhe 36) bleibt.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .select.sm] Ergebnis `.select.sm { padding: 7px 28px 7px 10px; font-size: var(--fs-13); line-height: var(--lh-13); border-radius: 9px; width: auto; }`. Das ergibt genau 34 px (18 + 14 + 2), die sm-Stufe. Auf Touch bleibt `@media (pointer: coarse) { .select.sm { padding-top: 10px; padding-bottom: 10px; } }`, das ergibt 40 px. Die neue `.input.sm` aus komponenten-C03 nutzt ebenfalls die Skala statt 12.5 px: `.input.sm { height: 34px; padding: 0 10px; font-size: var(--fs-13); line-height: var(--lh-13); border-radius: 9px; }`. Grund: 12.5 px ist in der Typografie-Skala verboten, sm-Felder = 13 wie .btn.sm.
- ÄNDERN: In der neuen Regel `.input.sm` `font-size: 12.5px` → `font-size: var(--fs-13); line-height: var(--lh-13);`. `.select.sm` nur das Padding auf 7px 28px 7px 10px ändern. Die Größe setzt typografie-3.2.3h, die Höhe danach mit 34 px prüfen.

## komponenten-C04 · Datums- und Zeitfelder so hoch wie Textfelder

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: komponenten-14
Quelle: audit/spec/komponenten.md Z. 210–212 · Dateien: web/css/app.css
Abhängig von: —

```text
**C04 – Datums- und Zeitfelder so hoch wie Textfelder** (komponenten-14)
Bei den `::-webkit-datetime-edit`-Regeln (um Z. 392–405) ergänzen: `.input::-webkit-datetime-edit-fields-wrapper { padding: 0; }`

```

## komponenten-C05 · Eine Feld-Beschriftung (CSS-Teil; JS-Teil in U2, D3, S-prop-b, S-dashboard-d)

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: komponenten-18
Quelle: audit/spec/komponenten.md Z. 213–219 · Dateien: web/css/app.css
Abhängig von: —

```text
**C05 – Eine Feld-Beschriftung** (komponenten-18)
- Z. 1381 `.fd-l { … font-size: 12.5px; font-weight: 600; color: var(--text-2); … }` → `font-size: 12px; font-weight: 600; color: var(--muted);`
- Z. 1360 `.fd-pop .fd-l { font-size: 11.5px; }` löschen.
- Z. 1964 `.cert-opts .lbl { display: block; font-size: 12px; font-weight: 600; color: var(--text-2); margin-bottom: 6px; }` → `.cert-opts .lbl { display: block; margin-bottom: 6px; }`
- Z. 2723 `.prop-rule-f .field span { … }` löschen.
(JS-Teil in U2, D3, P2.)

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .cert-opts .lbl] C05 gewinnt: `.cert-opts .lbl { display: block; margin-bottom: 6px; }`. Größe, Gewicht und Farbe kommen allein aus `.field > .lbl` (Z. 298, das Zertifikat-Label steht als `<span class="lbl">` direkt in `.field`, certificate.js:85). Dort ergibt sich 12/600 `--muted`, durch 3.2.3g als `var(--fs-12)`/`var(--lh-12)`. Grund: Die App soll genau eine Feldbeschriftung haben, ohne Sonderfarbe `--text-2`. Damit gibt es in Z. 1964 keine Schriftgröße mehr, die 3.2.3g auf ein Token umstellen könnte.
- [konflikt: .prop-rule-f .field span] Die Regel wird gelöscht und nicht verkleinert. C05 löscht Z. 2723 `.prop-rule-f .field span`. S-prop-b stellt in prop.js `rulesFields` den Helfer `F` auf `<label class="field"><span class="lbl">…</span>` um. Die Beschriftung kommt dann aus `.field > .lbl`: 12/600 `--muted`, Token aus 3.2.3g. Das ist die app-weit einheitliche Feldbeschriftung und hat dieselbe Zielgröße 12, die 3.2.3e wollte. C05 und S-prop-b sollen im selben Durchgang landen, damit die Regelfelder nie ohne Beschriftungsstil dastehen.
- [doppelt: .fd-pop .fd-l] komponenten-C05 übernimmt und löscht `.fd-pop .fd-l` (Z. 1360). Die Filter-Beschriftung kommt in Popover und Panel allein aus `.fd-l`: `display: flex; align-items: baseline; gap: 8px; font-size: var(--fs-12); line-height: var(--lh-12); font-weight: 600; color: var(--muted);`. Das sind die Werte aus C05 in Token-Schreibweise; die Zeilenhöhe 1.3 wird zum Token wie in typografie-3.2.3f. aufbau-A4f wollte für das Popover dasselbe Ergebnis (12, `--muted`, 600 geerbt) als Zusatzregel. Eine Regel statt zwei ist sauberer.
- [doppelt: .fd-l] Das Ergebnis lautet `.fd-l { display: flex; align-items: baseline; gap: 8px; font-size: var(--fs-12); line-height: var(--lh-12); font-weight: 600; color: var(--muted); }`. Größe und Zeilenhöhe setzt typografie-3.2.3f (12.5 → var(--fs-12), 1.3 → var(--lh-12)), die Farbe setzt komponenten-C05. So überschreibt kein wörtliches `12px` das Token.
- ÄNDERN: In Z. 1381 nur `color: var(--text-2)` → `color: var(--muted)` ändern, 600 bleibt. font-size nicht als `12px` schreiben, das Token kommt aus typografie-3.2.3f. Die Punkte zu Z. 1360, 1964 und 2723 berührt dieser Anker nicht (konflikt-7).

## komponenten-C06 · Hauptknopf ohne Schein beim Darüberfahren (Füllfarbe erst nach N1)

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: komponenten-1
Quelle: audit/spec/komponenten.md Z. 220–225 · Dateien: web/css/app.css
Abhängig von: —

```text
#### B. Komponenten

**C06 – Hauptknopf ohne Schein** (komponenten-1)
Z. 275 `.btn.primary:hover { background: var(--accent-2); border-color: var(--accent-2); box-shadow: 0 8px 20px -10px var(--accent-glow); }` → `.btn.primary:hover { background: var(--accent-2); border-color: var(--accent-2); box-shadow: none; }`
(Die Füllfarbe Z. 274 erst nach Antwort auf N1 ändern.)

```

## komponenten-C07 · Ein Pfeilknopf .btn.nav (34×34), .rr-nav 32×32, Seitenwahl-Pfeile ohne Verbund

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: komponenten-25, bereich_dashboard-26, komponenten-12
Quelle: audit/spec/komponenten.md Z. 226–233 · Dateien: web/css/app.css
Abhängig von: —

```text
**C07 – Ein Pfeilknopf** (komponenten-25, bereich_dashboard-26, komponenten-12)
- Z. 284–285 `.btn.round { … }` und `.btn.round.accent { … }` ersetzen durch:
```css
.btn.nav { width: 34px; height: 34px; padding: 0; border-radius: 9px; justify-content: center; flex: 0 0 auto; }
```
- Z. 352 `.rr-nav { width: 30px; height: 30px; …}` → `width: 32px; height: 32px;` (Rest bleibt).
- Z. 1749–1753 (`.pager .pg-nav { …border…overflow… }`, `.pager .pg-nav button {…}`, `button + button`, `:hover`, `:disabled`) ersetzen durch `.pager .pg-nav { display: inline-flex; gap: 4px; }`. Z. 1754 `.pager .pg-nav svg` löschen (16 px kommt aus `.btn svg`).

```
