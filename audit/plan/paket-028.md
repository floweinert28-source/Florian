# Paket 028 · prop

Schritte: 35 · Dateien: web/css/app.css, web/e2e/proptest.js, web/js/screens/prop-friedhof.js, web/js/screens/prop.js
Betroffene Tests laut Spezifikation: Akzeptanz 4.3 prop; Akzeptanz 4.3 prop_bilanz; Akzeptanz 4.3 prop_friedhof (keine Zeile endet mit „·“); Sonde 22; e2e/proptest.js:19; e2e/proptest.js:79; e2e/sampletest.js:69; e2e/sampletest.js:69, :73; web/e2e/friedhoftest.js; web/e2e/friedhoftest.js:47 (bleibt grün); web/e2e/friedhoftest.js:80 (Stein < 560 px, danach laufen lassen); web/e2e/proptest.js; web/e2e/proptest.js:102; web/e2e/proptest.js:102 („Consistency Rule“ bleibt); web/e2e/proptest.js:112 (zählt .prop-presets .pill.win === 1, muss angepasst werden, in D2 nicht genannt); web/e2e/proptest.js:130 (keine implizite Spalte am Handy); web/e2e/proptest.js:20/23/27/133 (data-action bleibt); web/e2e/proptest.js:55-56 (Kontowährung bleibt); web/e2e/proptest.js:95 (bleibt grün); web/e2e/proptest.js:98
Baut auf Paketen auf: 1, 2, 3, 4, 5, 9

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## farbe-C8a · Prop: Trade-Zuordnung mit neutralen Häkchen

Gruppe farbe · Cluster prop · Aufwand S · Befunde: bereich_prop-40
Quelle: audit/spec/farbe.md Z. 413–414 · Dateien: web/css/app.css
Abhängig von: —

```text
**C8 – `web/css/app.css` Prop und Affiliate** — bereich_prop-40, bereich_konto-6
- Z. 2731 `.prop-assign-row input { accent-color: var(--accent); … }` → `accent-color: var(--text);`
```

## farbe-C26a · Prop: Status „Aktiv“ neutral, „geprüft“-Pillen neutral

Gruppe farbe · Cluster prop · Aufwand S · Befunde: bereich_prop-35, komponenten-8, farbe_kontrast-26
Quelle: audit/spec/farbe.md Z. 512–514 · Dateien: web/js/screens/prop.js
Abhängig von: —

```text
**C26 – `web/js/screens/prop.js`** — bereich_prop-35, komponenten-8, farbe_kontrast-26, bereich_prop-16, zustaende-7, bereich_prop-25
- Z. 20 `STATUS_KIND = { active: 'open', … }` → `active: 'neutral'` („Beantragt“ Z. 267/286 bleibt `open`)
- Z. 81 `U.pill(`geprüft ${…}`, 'win')` → `U.pill(`geprüft ${…}`)`; Z. 236 `U.pill('geprüft', 'win')` → `U.pill('geprüft')`
```

## farbe-C26b · Prop: Anlegen-/Erfassen-Öffner ohne primary, Banner „Ziel erreicht“ als ok

Gruppe farbe · Cluster prop · Aufwand S · Befunde: bereich_prop-16, zustaende-7
Quelle: audit/spec/farbe.md Z. 515–517 · Dateien: web/js/screens/prop.js
Abhängig von: farbe-B11

```text
- Z. 82 `class="btn primary" data-action="prop-account-new"` → `class="btn"`; Z. 244 `class="btn sm primary" data-action="prop-account-new"` → `class="btn sm"` (entfällt, falls die Aufbau-Gruppe den Knopf streicht)
- Z. 97 `U.banner('accent', 'Ziel erreicht', …)` → `U.banner('ok', 'Ziel erreicht', …)`
- Z. 251 `class="btn sm${e[kind] ? '' : ' primary'}"` → `class="btn sm"`
```

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

## typografie-3.8j · Prop-Kontokarte: „Balance“/„P&L“ als .val-label

Gruppe typografie · Cluster prop · Aufwand S · Befunde: referenz-43
Quelle: audit/spec/typografie.md Z. 435–435 · Dateien: web/js/screens/prop.js
Abhängig von: typografie-3.2.2c

```text
| prop.js:102 | `<div class="caption">Balance</div>` und `<div class="caption">P&L</div>` → `class="val-label"` | referenz-43 |
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

## abstaende-M2 · Prop-Konto-Dialog: Währungshinweis als eigene Rasterzeile (span2, #pa-cur-hint, aria-describedby), Notiz span4

Gruppe abstaende · Cluster prop · Aufwand S · Befunde: bereich_prop-37
Quelle: audit/spec/abstaende.md Z. 471–471 · Dateien: web/js/screens/prop.js
Abhängig von: abstaende-A8

```text
| M2 | Z. 194, 201 | Z. 194: `<span class="hint">…</span>` aus dem Währungsfeld nehmen und direkt hinter dem Feld als eigenes Rasterelement setzen: `<span class="hint span2" id="pa-cur-hint">Balance, Limits und Puffer in Kontowährung. Trade-P&L bleibt in der Journal-Währung.</span>`. Das Select bekommt `aria-describedby="pa-cur-hint"`. Z. 201: Notiz `class="field span2"` → `class="field span4"`. | bereich_prop-37 |
```

## abstaende-M4 · Ausgabe/Payout erfassen: Absende-Knopf in .prop-entry-foot statt über &nbsp;-Label, Notiz span2

Gruppe abstaende · Cluster prop · Aufwand S · Befunde: bereich_prop-54
Quelle: audit/spec/abstaende.md Z. 473–473 · Dateien: web/js/screens/prop.js
Abhängig von: abstaende-D6

```text
| M4 | Z. 262, 266 | letztes Feld `<div class="field"><span class="lbl">&nbsp;</span><button type="submit" …>…</button></div>` → `<div class="prop-entry-foot"><button type="submit" class="btn primary">${I.plus} Ausgabe erfassen</button></div>` (Payout: „Payout erfassen“). Notiz in Z. 262 `class="field"` → `class="field span2"`. | bereich_prop-54 |
```

## abstaende-M5 · Prop-Bilanz-Tabellen als .tbl-wrap.inset

Gruppe abstaende · Cluster prop · Aufwand S · Befunde: abstaende_layout-13
Quelle: audit/spec/abstaende.md Z. 474–474 · Dateien: web/js/screens/prop.js
Abhängig von: abstaende-B21

```text
| M5 | Z. 264, 268 | `<div class="tbl-wrap">` → `<div class="tbl-wrap inset">` | abstaende_layout-13 |
```

## abstaende-M6 · Consistency-Zeile zweizeilig: Wert ohne „heute noch … erlaubt“ und title, eigene kv-Zeile „Heute noch erlaubt“, Karte cls prop-conds

Gruppe abstaende · Cluster prop · Aufwand S · Befunde: bereich_prop-29
Quelle: audit/spec/abstaende.md Z. 475–476 · Dateien: web/js/screens/prop.js
Abhängig von: abstaende-D6, abstaende-B17

```text
| M6 | Z. 283 | Die kv-Zeile „Consistency Rule“ bekommt den Wert `${cons.ok ? '<span class="pos">ok</span>' : '<span class="neg">verletzt</span>'} <span class="muted">· bester Tag ${cons.bestDayPct == null ? '—' : fmt.pct(cons.bestDayPct)} von max. ${fmt.num(cons.maxDayPct)} %</span>` (Teil „heute noch … erlaubt“ und das title-Attribut entfallen). Direkt danach, nur bei `cons && isFinite(cons.allowedToday)`: `U.kv('Heute noch erlaubt', fmt.cur(cons.allowedToday))`. Die Karte `conds` bekommt `{ cls: 'prop-conds' }`. | bereich_prop-29 |

```

## komponenten-S-prop-b · Prop-Regelfelder: Beschriftung als .lbl

Gruppe komponenten · Cluster prop · Aufwand S · Befunde: komponenten-18
Quelle: audit/spec/komponenten.md Z. 697–697 · Dateien: web/js/screens/prop.js
Abhängig von: komponenten-C05

```text
- Z. 146 `<label class="field"><span>${esc(lbl)}</span>` → `<label class="field"><span class="lbl">${esc(lbl)}</span>`.
```

## komponenten-S-prop-c · Karte „Deine Konten“ ohne Kopfknopf

Gruppe komponenten · Cluster prop · Aufwand S · Befunde: hierarchie-28
Quelle: audit/spec/komponenten.md Z. 698–698 · Dateien: web/js/screens/prop.js
Abhängig von: —

```text
- Z. 244: in `U.card('Deine Konten', accTable, { trailing: …, info: … })` die Option `trailing` streichen.
```

## komponenten-S-prop-d · Prop: Eintrag-Knöpfe und Inline-Absenden (Ausgabe/Payout erfassen) neutral

Gruppe komponenten · Cluster prop · Aufwand S · Befunde: komponenten-1, komponenten-30
Quelle: audit/spec/komponenten.md Z. 699–700 · Dateien: web/js/screens/prop.js
Abhängig von: —

```text
- Z. 251 `entryBtn`: `class="btn sm${e[kind] ? '' : ' primary'}"` → `class="btn sm"`.
- Z. 262 und Z. 266 (Absenden „Ausgabe erfassen“/„Payout erfassen“ im Inline-Formular) `class="btn primary"` → `class="btn"`.
```

## komponenten-S-prop-e · Prop-Bilanz: Tabellen als tbl-wrap inset

Gruppe komponenten · Cluster prop · Aufwand S · Befunde: bereich_prop-18
Quelle: audit/spec/komponenten.md Z. 701–701 · Dateien: web/js/screens/prop.js
Abhängig von: —

```text
- Z. 264 und Z. 268 `<div class="tbl-wrap">` → `<div class="tbl-wrap inset">`.
```

## komponenten-S-prop-f · Prop-Kopfknopf „+ Konto anlegen“ mit Text auch am Handy

Gruppe komponenten · Cluster prop · Aufwand S · Befunde: hierarchie-28, responsiv-46
Quelle: audit/spec/komponenten.md Z. 702–703 · Dateien: web/js/screens/prop.js
Abhängig von: komponenten-C08

```text
- Z. 294 `${I.plus}<span class="hide-m">Prop-Konto</span>` → `${I.plus}<span>Konto anlegen</span>`.

```

## aufbau-A4e · Prop-Gruppentitel 13px/600 --text-2

Gruppe aufbau · Cluster prop · Aufwand S · Befunde: bereich_prop-7
Quelle: audit/spec/aufbau.md Z. 291–291 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 2715 `.prop-group-title b { font-family: var(--font-display); font-size: 15px; }` → `.prop-group-title b { font-size: 13px; font-weight: 600; color: var(--text-2); }`
```

## aufbau-C12a · Prop-Karte: „Gewinn fehlt“ nur bei Funded oder ohne Ziel-Balken

Gruppe aufbau · Cluster prop · Aufwand S · Befunde: hierarchie-4
Quelle: audit/spec/aufbau.md Z. 557–560 · Dateien: web/js/screens/prop.js
Abhängig von: —

```text
#### `web/js/screens/prop.js`

**C12** · hierarchie-4, bereich_prop-7, bereich_prop-19, bereich_prop-28, bereich_prop-30, bereich_prop-32, aufbau-6, ki_look-22
- `planText` Z. 75: `if (plan.missingProfit > C.EPS) parts.push(…)` → `if (plan.missingProfit > C.EPS && (plan.funded || !ev.target)) parts.push(…)`; Rückgabe `return parts.join(' · ') || '—';` → `return parts.join(' · ') || (plan.missingProfit > C.EPS ? '<span class="muted">nur noch das Ziel</span>' : '—');`
```

## aufbau-C12b · Prop-Karte: Wert verlinkt in den Payout-Planer des Kontos

Gruppe aufbau · Cluster prop · Aufwand M · Befunde: bereich_prop-32
Quelle: audit/spec/aufbau.md Z. 561–564 · Dateien: web/js/screens/prop.js, web/css/app.css
Abhängig von: —

```text
- Kontokarte Z. 104: Wert von `U.kv(plan.funded ? 'Nächster Payout' : 'Bestehen', planText(a, ev, plan))` → `plan.hasCond && active ? `<a href="#/prop/bilanz" class="prop-plan-link" data-action="prop-plan-open" data-id="${a.id}">${planText(a, ev, plan)}</a>` : planText(a, ev, plan)`
- Neue Aktion: `'prop-plan-open'(el) { const s = st(); s.payoutAccount = el.dataset.id; (s.fold || (s.fold = {})).planer = true; s.scrollPlaner = true; location.hash = '#/prop/bilanz'; },`
- `mount` Z. 309 → `mount(main) { const fn = MOUNTS[st().tab]; if (fn) fn(main); const s = st(); if (s.scrollPlaner) { s.scrollPlaner = false; const f = main.querySelector('[data-fold="planer"]'); if (f) requestAnimationFrame(() => window.scrollTo({ top: Math.max(0, f.getBoundingClientRect().top + window.scrollY - document.querySelector('.topbar').offsetHeight - 16) })); } },`
- CSS (`web/css/app.css` nach Z. 2701): `.prop-plan-link { color: inherit; text-decoration: underline; text-decoration-color: var(--border-2); text-underline-offset: 3px; } .prop-plan-link:hover { text-decoration-color: currentColor; }`
```

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

## zustaende-S-P2 · Prop-Bilanz ohne Buchungen: „—“ statt „erreicht“, kein Diagramm, keine „Pro Firma“, Legende nur mit Daten

Gruppe zustaende · Cluster prop · Aufwand S · Befunde: bereich_prop-14, bereich_prop-15
Quelle: audit/spec/zustaende.md Z. 724–730 · Dateien: web/js/screens/prop.js
Abhängig von: —

```text
**S-P2 Bilanz ohne Buchungen** – bereich_prop-14, bereich_prop-15
- In `tabBilanz` vor `const tiles` (Z. 256) neu: `const none = bs.spent <= C.EPS;`
- Kachel „Bis Break-even“: Wert `bs.toBreakEven > C.EPS ? <neg> : '<span class="pos">erreicht</span>'` → `none ? '—' : bs.toBreakEven > C.EPS ? <neg wie bisher> : '<span class="pos">erreicht</span>'`; Fuß `bs.toBreakEven > C.EPS ? 'fehlende Payouts (netto)' : 'Payouts decken alle Ausgaben'` → `none ? 'noch keine Ausgaben' : (wie bisher)`.
- Kachel „Kosten je Bestehen“: `bs.costPerPassed == null ? '—' : fmt.cur(bs.costPerPassed)` → `bs.costPerPassed == null || none ? '—' : fmt.cur(bs.costPerPassed)`. Fuß unverändert.
- Z. 257 Legende `<div class="legend">…</div>` nur bei `bs.series.length`.
- Z. 271 `${tiles}<div class="grid main-side">${chart}${byFirm}</div>${expenses}…` → `${tiles}${ex.length || po.length ? `<div class="grid main-side">${chart}${byFirm}</div>` : ''}${expenses}${payouts}${planer}`

```

## zustaende-S-P3 · #/prop/payout: Bilanz mit offenem Planer, Adresse auf #/prop/bilanz umschreiben, Planer unter die Titelzeile scrollen

Gruppe zustaende · Cluster prop · Aufwand S · Befunde: bereich_prop-27
Quelle: audit/spec/zustaende.md Z. 731–734 · Dateien: web/js/screens/prop.js
Abhängig von: —

```text
**S-P3 `#/prop/payout`** – bereich_prop-27
- Z. 299 `if (key === 'payout') { key = 'bilanz'; (s.fold || (s.fold = {})).planer = true; }` → `if (key === 'payout') { key = 'bilanz'; (s.fold || (s.fold = {})).planer = true; s.scrollTo = 'planer'; try { history.replaceState(null, '', '#/prop/bilanz'); } catch (e) { } }`
- Z. 309 `mount(main)` am Anfang: `if (st().scrollTo === 'planer') { st().scrollTo = null; requestAnimationFrame(() => { const d = main.querySelector('[data-fold="planer"]'); const tb = main.querySelector('.topbar'); if (d) window.scrollTo({ top: d.getBoundingClientRect().top + window.scrollY - (tb ? tb.offsetHeight : 0) - 16 }); }); }`

```
