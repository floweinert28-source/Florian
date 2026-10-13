# Paket 032 · konto, statistik

Schritte: 9 · Dateien: web/css/app.css, web/e2e/affiliatetest.js, web/e2e/calmnavtest.js, web/e2e/chartanimtest.js, web/e2e/coachtest.js, web/js/certificate.js, web/js/screens/coach.js, web/js/screens/coupons.js
Betroffene Tests laut Spezifikation: web/e2e/affiliatetest.js:15-16; web/e2e/calmnavtest.js:40; web/e2e/calmnavtest.js:44; web/e2e/calmnavtest.js:47-48; web/e2e/chartanimtest.js:35; web/e2e/coachtest.js:154; web/e2e/coachtest.js:178; web/e2e/coachtest.js:194 (bleibt grün); web/e2e/coachtest.js:80-81; web/e2e/coachtest.js:83; web/e2e/mobiletest.js:39-40 (bleibt grün)
Baut auf Paketen auf: 9, 16, 31

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## aufbau-D3b · Tests calmnavtest.js und chartanimtest.js anpassen

Gruppe aufbau · Cluster statistik · Aufwand S · Befunde: aufbau-19, bereich_statistik-5, hierarchie-45
Quelle: audit/spec/aufbau.md Z. 704–706 · Dateien: web/e2e/calmnavtest.js, web/e2e/chartanimtest.js
Abhängig von: aufbau-C14b, aufbau-C3

```text
- `calmnavtest.js:40`: still-Liste `['.tabs[data-subnav]', '.content > .card', '.page-head']` → `['.tabs[data-subnav]', '.page-head']`, Name ohne „Diagramm oben“; Z. 47–48 Scroll auf Reiter−300 → `scrollTo(0, 80)` auf `#/stats/summary`
- `calmnavtest.js:44`: `inPage('#/affiliate', '.page-head a[href="#/affiliate/creator"]', ['.page-head'], ['.content > :not(.page-head)'])`
- `chartanimtest.js:35`: Meldungstext an „Kurve in der Übersicht“ anpassen
```

## aufbau-C4a · Coach-Journal: Schreibfeld erst über „Notiz schreiben“

Gruppe aufbau · Cluster konto · Aufwand M · Befunde: bereich_konto-19
Quelle: audit/spec/aufbau.md Z. 441–448 · Dateien: web/js/screens/coach.js, web/css/app.css
Abhängig von: —

```text
#### `web/js/screens/coach.js`

**C4** · bereich_konto-19, bereich_konto-25, bereich_konto-40
- Z. 10 Startwerte von `st()`: `…, mail: null }` → `…, mail: null, open: {}, jlimit: 10 }`
- `entryHTML` Z. 140: Ist weder `s.open[e.id]` noch `(s.draft[e.id] || '').trim()` gesetzt, statt Textfeld und Senden ausgeben: `<div class="ce-write closed"><button type="button" class="btn sm ghost" data-action="coach-note-open" data-id="${esc(e.id)}">${I.chat} Notiz schreiben</button></div>`. Sonst wie bisher.
- CSS (`web/css/app.css`, bei den `.ce-*`-Regeln um Z. 2874): `.ce-write.closed { justify-content: flex-end; }`
- Neue Aktion: `'coach-note-open'(el) { st().open[el.dataset.id] = true; App.rerender(); requestAnimationFrame(() => { const t = document.querySelector(`textarea[data-input="coach-note-draft"][data-id="${CSS.escape(el.dataset.id)}"]`); if (t) t.focus(); }); },`
- `'coach-note-send'` (Z. 297): nach Erfolg zusätzlich `delete st().open[el.dataset.id];`
```

## aufbau-C4b · Coach-Journal: 10 Einträge, dann „Mehr anzeigen“

Gruppe aufbau · Cluster konto · Aufwand S · Befunde: bereich_konto-19
Quelle: audit/spec/aufbau.md Z. 449–450 · Dateien: web/js/screens/coach.js
Abhängig von: aufbau-C4a

```text
- `journal` Z. 155: `j.entries.map(…)` → `j.entries.slice(0, s.jlimit).map(…)`; darunter, wenn `j.entries.length > s.jlimit`: `<div class="aff-more"><button type="button" class="btn sm ghost" data-action="coach-more">Mehr anzeigen</button></div>`. Neue Aktion `'coach-more'() { st().jlimit += 10; App.rerender(); },`. Der Kopf zählt weiter alle Einträge.
- `mount` (Z. 233, nach `const entered = …`): `if (entered && v[0] === 'journal') { s.jlimit = 10; s.open = {}; }`
```

## aufbau-C4c · Coach: Journalkopf mit Unterzeile, Schüler-Karte zuerst, „Gruppe anlegen“, keine Kopfreihe

Gruppe aufbau · Cluster konto · Aufwand S · Befunde: bereich_konto-25, bereich_konto-40
Quelle: audit/spec/aufbau.md Z. 451–454 · Dateien: web/js/screens/coach.js
Abhängig von: aufbau-B1

```text
- Journalkopf Z. 157: `<div class="row">${back(…, 'Gruppe')}<h2 class="coach-title no-i18n">${esc(name)}</h2>${j ? `<span class="small muted">…</span>` : ''}</div>` → `<div class="row">${back(…, 'Gruppe')}<div><h2 class="coach-title no-i18n">${esc(name)}</h2>${j ? `<div class="small muted">…bisheriger Inhalt des span…</div>` : ''}</div></div>`
- `hub` Z. 52–54: beide Karten als Variablen `mentorCard`, `studentCard`. Bei `c.groups.length && !c.own.length && !c.coached.length` → `${studentCard}${mentorCard}`, sonst `${mentorCard}${studentCard}`. Knopf `${I.plus} Gruppe` → `${I.plus} Gruppe anlegen` (Klasse regelt die Komponenten-Spezifikation, bereich_konto-5).
- Z. 218 `head` bleibt (alles `false`), B1 sorgt dafür, dass keine Kopfreihe entsteht.

```

## aufbau-C5a · Coupon-Codes: kein Session-Knopf

Gruppe aufbau · Cluster konto · Aufwand S · Befunde: bereich_konto-37, responsiv-19, aufbau-6, ki_look-22
Quelle: audit/spec/aufbau.md Z. 455–458 · Dateien: web/js/screens/coupons.js
Abhängig von: —

```text
#### `web/js/screens/coupons.js`

**C5** · bereich_konto-37, responsiv-19, aufbau-6, ki_look-22
Z. 10 `head: { range: false, account: false },` → `head: { range: false, account: false, session: false }, /* „Session starten“ gibt es auf TradeLog, Tagesansicht, Fortschritt und Notebook */`
```

## aufbau-C5b · Coupon: Rabatt 13.5px --text-2, Code 600/.08em

Gruppe aufbau · Cluster konto · Aufwand S · Befunde: bereich_konto-48
Quelle: audit/spec/aufbau.md Z. 459–462 · Dateien: web/css/app.css
Abhängig von: —

```text
CSS (`web/css/app.css`) · bereich_konto-48:
- Z. 2648 `.cpn-off { font-size: 13px; color: var(--muted); }` → `.cpn-off { font-size: 13.5px; color: var(--text-2); }`
- Z. 2649 `.cpn-code { … font-weight: 700; … letter-spacing: .12em; … }` → `font-weight: 600; letter-spacing: .08em;`

```

## aufbau-D3a · Test affiliatetest.js anpassen

Gruppe aufbau · Cluster konto · Aufwand S · Befunde: hierarchie-45, bereich_konto-29
Quelle: audit/spec/aufbau.md Z. 702–703 · Dateien: web/e2e/affiliatetest.js
Abhängig von: aufbau-C3

```text
**D3 Tests anpassen** (`web/e2e/`)
- `affiliatetest.js:15–16`: `.aff-top .pill` → `.page-head .pill`, `.aff-top .prop-tabs a` → `.page-head .prop-tabs a`; erwartete Kennzahlen `Creator,Kunden,Umsatz,Provisionen,Offen` → `Kunden,Umsatz,Provisionen,Offen`, Indizes `tiles[0..3]` neu, Vergleich mit `exp.creators` entfällt
```

## aufbau-D3c · Test coachtest.js anpassen

Gruppe aufbau · Cluster konto · Aufwand S · Befunde: bereich_konto-19
Quelle: audit/spec/aufbau.md Z. 707–707 · Dateien: web/e2e/coachtest.js
Abhängig von: aufbau-C4a, aufbau-C4b

```text
- `coachtest.js:80–81`: `entries.length === Math.min(snap.entries, 10)`; Z. 83, 154, 178: vor dem Füllen `[data-action=coach-note-open]` am Eintrag klicken
```

## zustaende-S-Z1 · Zertifikat-Standardtag zentral: letzter Tag mit abgeschlossenem Trade ≤ heute

Gruppe zustaende · Cluster konto · Aufwand S · Befunde: bereich_dashboard-30
Quelle: audit/spec/zustaende.md Z. 507–511 · Dateien: web/js/certificate.js
Abhängig von: —

```text
### 3.6 `web/js/certificate.js`

**S-Z1 Standardtag** – bereich_dashboard-30
Z. 59 `const day = (ctx && ctx.day) || C.dayKey(new Date());` → `const today = C.dayKey(new Date()); const last = C.closedOnly(App.allTrades()).reduce((k, t) => t.dayKey > k && t.dayKey <= today ? t.dayKey : k, ''); const day = (ctx && ctx.day) || last || today;`

```
