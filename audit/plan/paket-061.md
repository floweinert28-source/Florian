# Paket 061 · zustaende

Schritte: 7 · Dateien: web/README.md, web/app.html, web/css/app.css, web/js/app.js, web/js/screens/progress.js
Betroffene Tests laut Spezifikation: prüfen: e2e/headtest.js:55–57 (Ring kann ohne .arc sein); web/e2e/loadtest.js:10-11; web/e2e/loadtest.js:10-11 (Skelett: 5 Kacheln, 3 Karten, topH ≥ 60)
Baut auf Paketen auf: 2, 6, 9, 33, 56, 57, 58, 60

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## zustaende-S-A4 · Trade-Formular: novalidate, eigene Prüfung mit Feldmeldungen statt Toasts, Meldung weg bei Richtungs- und Symbolwahl

Gruppe zustaende · Cluster zustaende · Aufwand M · Befunde: zustaende-3, barrierefreiheit-6
Quelle: audit/spec/zustaende.md Z. 553–569 · Dateien: web/js/app.js
Abhängig von: zustaende-S-U5, zustaende-S-C3, zustaende-S-A1

```text
**S-A4 Trade-Formular prüfen** – zustaende-3, barrierefreiheit-6
- Z. 348 `<form id="trade-form" class="tf" data-action="save-trade" …>` → `<form id="trade-form" class="tf" data-action="save-trade" novalidate …>`. `required` an f-entry, f-qty, f-open bleibt (Semantik).
- Z. 476 Prüfkette ersetzen durch:
```js
const t = App.readTradeForm(form); const errs = []; const q = s => form.querySelector(s);
if (!t.symbol) errs.push({ el: q('#f-symbol-btn'), msg: 'Symbol wählen' });
if ('direction' in t && !t.direction) { errs.push({ el: q('#f-dir .dir-opt'), msg: 'Long oder Short wählen' }); const sw = q('#f-dir'); if (sw) { sw.classList.remove('need'); void sw.offsetWidth; sw.classList.add('need'); } }
if (t.entryPrice == null) errs.push({ el: q('#f-entry'), msg: 'Einstieg eintragen' });
if (!(Number(form.elements.quantity.value) > 0)) errs.push({ el: q('#f-qty'), msg: 'Kontrakte eintragen' });
if (!form.elements.openedAt.value) errs.push({ el: q('#f-open'), msg: 'Datum eintragen' });
if (t.closedAt && t.exitPrice == null) errs.push({ el: q('#f-exit'), msg: 'Ausstieg eintragen oder Geschlossen leeren' });
if (errs.length) { U.fieldErrors(form, errs); return; }
```
Die Meldung „Long oder Short wählen“ hängt am `.field` der Richtung (`q('#f-dir .dir-opt').closest('.field')`). Die Fußzeilen-Vorschau (Z. 469) und `.dir-switch.need` bleiben. Der Toast „Trade gespeichert“ bleibt.
- Z. 471 `'set-dir'`: am Ende `U.clearFieldError(f.querySelector('#f-dir .dir-opt'));` ergänzen (die Meldung hängt am ersten Richtungsknopf, auch wenn „Short“ geklickt wird).
- Z. 398 (Symbolwahl in `openSymbolMenu`): nach dem Setzen von `#f-symbol` `U.clearFieldError(btn);` ergänzen.

```

## zustaende-S-R4 · README Z. 338–340: Start-Skelett mit Design und Leiste, Skelette für News/Coach, Regeln für U.spin/U.loader

Gruppe zustaende · Cluster zustaende · Aufwand S · Befunde: —
Quelle: audit/spec/zustaende.md Z. 891–891 · Dateien: web/README.md
Abhängig von: zustaende-S-H1, zustaende-S-NW2, zustaende-S-CS2, zustaende-S-CS3

```text
- Z. 338–340: ergänzen „Design (hell/dunkel) und eingeklappte Leiste stehen schon im Skelett (Theme im `<head>` von `app.html`). Bereiche, die Daten nachladen (News, Coach), zeigen ein Skelett aus `.skel`; `U.spin()` nur in Knöpfen neben Text, `U.loader()` nur mit sichtbarem Text daneben.“
```

## zustaende-S-R5 · README: neuer Abschnitt „Zustände“ nach „Bewegung und Übergänge“

Gruppe zustaende · Cluster zustaende · Aufwand S · Befunde: —
Quelle: audit/spec/zustaende.md Z. 892–893 · Dateien: web/README.md
Abhängig von: zustaende-S-C1, zustaende-S-C4, zustaende-S-A1, zustaende-S-U6

```text
- Neuer Absatz nach „Bewegung und Übergänge“, Überschrift „Zustände“: vier Leerzustand-Stufen (Z1), „—“ für fehlende Werte, Feldfehler am Feld statt Toast, Toast-Dauer und Live-Region, Rückfrage vor endgültigem Löschen, Deaktiviert `--disabled-o`, Hover nur auf Bedienbarem.

```

## barrierefreiheit-B11 · Fehlerzustand .input[aria-invalid="true"] mit Rand --loss

Gruppe barrierefreiheit · Cluster zustaende · Aufwand S · Befunde: wording-1
Quelle: audit/spec/barrierefreiheit.md Z. 368–371 · Dateien: web/css/app.css
Abhängig von: —

```text
**B11 Fehlerzustand Feld** (nach Z. 293)
- nachher: `.input[aria-invalid="true"] { border-color: var(--loss); }`
- Befunde: wording-1

```

## kilook-C18 · „% Regeln eingehalten“ ohne Grundlage: „—“, kein Ring/ring-card; Bogen nur bei rate > 0

Gruppe kilook · Cluster zustaende · Aufwand S · Befunde: ki_look-6
Quelle: audit/spec/kilook.md Z. 653–660 · Dateien: web/js/screens/progress.js
Abhängig von: —

```text
**C18 · web/js/screens/progress.js** (ki_look-6)
- **6** `ringArc`: den zweiten Kreis `<circle class="arc" … />` in `` ${rate > 0 ? `<circle class="arc" … />` : ''} `` einschließen. Der `.track`-Kreis bleibt immer. `size = 116, lw = 9` bleibt (N2).
- **69** vorher
  `` ${U.card('% Regeln eingehalten', `<div class="big-stat"><span>${cur.rate == null ? '0 %' : fmt.pct(cur.rate)}</span>${arrow(rateDir)}</div><div class="small muted">…</div><div class="ring-abs">${ringArc(cur.rate)}</div>`, { info: '…', cls: 'ring-card' })} ``
  → nachher
  `` ${U.card('% Regeln eingehalten', `<div class="big-stat"><span>${cur.rate == null ? '<span class="muted">—</span>' : fmt.pct(cur.rate)}</span>${arrow(rateDir)}</div><div class="small muted">…unverändert…</div>${cur.rate == null ? '' : `<div class="ring-abs">${ringArc(cur.rate)}</div>`}`, { info: '…unverändert…', cls: cur.rate == null ? '' : 'ring-card' })} ``
  `rateDir` ist bei `null` schon 0, der Pfeil entfällt damit von selbst.

```

## responsiv-B11 · Skelett am Handy: Maße der fertigen Seite (Titelzeile, Kopfreihe, 5 Kacheln, Karte)

Gruppe responsiv · Cluster zustaende · Aufwand M · Befunde: bereich_shell-5
Quelle: audit/spec/responsiv.md Z. 372–380 · Dateien: web/css/app.css
Abhängig von: —

```text
**B11 Skelett am Handy** (bereich_shell-5)
- Nach Z. 1539 global: `.boot-top .skel.mb, .boot-head .skel.m { display: none; }`
- Z. 1554 (Block ≤ 960 px) ersetzen:
  - `.boot-top { padding: 12px 16px; }` → `.boot-top { min-height: 60px; padding: 10px 16px; }`
  - `.boot-top .skel:not(.t):not(.av) { display: none; }` → `.boot-top .skel:not(.t):not(.av):not(.mb) { display: none; } .boot-top .skel.mb { display: block; width: 20px; height: 20px; border-radius: 6px; margin-right: 7px; } .boot-top .skel.av { width: 34px; height: 34px; }` (Titel-Platzhalter bei x = 16 + 20 + 7 + 8 = 51 wie der echte Titel nach A4)
  - `.boot-head { display: none; }` → `.boot-head { display: flex; justify-content: flex-start; min-height: 46px; } .boot-head .skel { width: 40px; height: 40px; } .boot-head .skel.tl { order: -1; width: 166px; height: 42px; margin-left: 0; } .boot-head .skel.m { display: block; }`
  - `.boot-tiles .skel { height: 96px; }` → `.boot-tiles .skel { height: 111px; } .boot-tiles .skel:nth-child(n + 4) { display: block; } .boot-tiles .skel:nth-child(5) { grid-column: 1 / -1; }`
  - `.boot-main .skel { height: 260px; }` → `.boot-main .skel { height: 339px; }`

```

## responsiv-3.17 · Skelett im HTML: Platzhalter für Menüknopf (skel mb) und viertes Kopfreihen-Symbol (skel m)

Gruppe responsiv · Cluster zustaende · Aufwand S · Befunde: bereich_shell-5
Quelle: audit/spec/responsiv.md Z. 545–549 · Dateien: web/app.html
Abhängig von: responsiv-B11

```text
### 3.17 web/app.html:21 (bereich_shell-5)

- `<div class="boot-top"><span class="skel t"></span>…` → `<div class="boot-top"><span class="skel mb"></span><span class="skel t"></span>…`
- `<div class="boot-head"><span class="skel"></span><span class="skel"></span><span class="skel tl"></span></div>` → `…<span class="skel tl"></span><span class="skel m"></span></div>`

```
