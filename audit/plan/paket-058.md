# Paket 058 · zustaende, konto, prop

Schritte: 4 · Dateien: web/css/app.css, web/js/screens/coach.js, web/js/screens/prop.js, web/js/ui.js
Betroffene Tests laut Spezifikation: —
Baut auf Paketen auf: 57

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## zustaende-S-CS2 · Coach: Skelett beim Laden statt Kurslinie

Gruppe zustaende · Cluster konto · Aufwand S · Befunde: zustaende-17
Quelle: audit/spec/zustaende.md Z. 815–817 · Dateien: web/js/screens/coach.js
Abhängig von: zustaende-S-C13

```text
**S-CS2 Skelett beim Laden** – zustaende-17
Z. 28 → `const loading = () => `<div class="coach-skel" role="status" aria-label="Wird geladen">${'<div class="skel"></div>'.repeat(5)}</div>`;` (wirkt in Z. 111, 153, 167, 184).

```

## zustaende-S-C14 · Speicherstand: Notebook 12 px ohne Gelb, neue Regel .set-head .save-state

Gruppe zustaende · Cluster zustaende · Aufwand S · Befunde: bereich_notebook_news-24, komponenten-5
Quelle: audit/spec/zustaende.md Z. 346–350 · Dateien: web/css/app.css
Abhängig von: —

```text
**S-C14 Speicherstand** – bereich_notebook_news-24, komponenten-5
- Z. 1030 `.nb .save-state { font-size: 11.5px; … }` → `font-size: 12px`
- Z. 1031 `.nb .save-state.saving { color: var(--warn); }` löschen.
- Nach Z. 1816 neu: `.set-head .save-state { font-size: 12px; color: var(--muted); align-self: center; min-height: 1em; }`

```

## zustaende-S-U1 · Geldbeträge immer mit zwei Nachkommastellen (fmt.cur ohne 10.000-Schwelle), Überlauf prüfen

Gruppe zustaende · Cluster zustaende · Aufwand M · Befunde: zustaende-23, wording-30, bereich_prop-6
Quelle: audit/spec/zustaende.md Z. 390–394 · Dateien: web/js/ui.js, web/css/app.css
Abhängig von: —

```text
### 3.2 `web/js/ui.js`

**S-U1 Geldbeträge immer mit zwei Stellen** – zustaende-23 (und Stellenteil von wording-30, bereich_prop-6)
Z. 122 `const a = Math.abs(v); const d = o.compact ? 0 : (a >= 10000 ? 0 : 2);` → `const a = Math.abs(v); const d = o.compact ? 0 : 2;`. Danach Dashboard-Kacheln, TradeLog-Kacheln, Affiliate-KPI-Streifen, Prop-Konto-Karten und Zertifikat (Quadrat und Story) bei 1024 und 390 px prüfen. Läuft ein Wert über, in app.css:533 die Container-Schwelle `@container (max-width: 164px)` → `190px` anheben. Nicht wieder Stellen abschneiden.

```

## zustaende-S-P1 · Prop-Konto-Karte: Ampel Rot bei Verletzung, tote Konten ohne Balken/Meta, Balken ohne „von“ bei Rest > Limit, Tooltip gekappt

Gruppe zustaende · Cluster prop · Aufwand M · Befunde: bereich_prop-2, bereich_prop-3, bereich_prop-6, wording-30
Quelle: audit/spec/zustaende.md Z. 710–723 · Dateien: web/js/screens/prop.js
Abhängig von: zustaende-S-U1

```text
### 3.14 `web/js/screens/prop.js`

**S-P1 Konto-Karte** – bereich_prop-2, bereich_prop-3, bereich_prop-6, wording-30
- Z. 90 `const ampel = active ? b.ampel : 'aus';` → `const dead = ev.status === 'breached' || a.status === 'breached'; const ampel = !active ? 'aus' : ev.status === 'breached' ? 'rot' : b.ampel;`
- Z. 93 `bar` ersetzen:
```js
const bar = (lbl, x) => { if (!x) return ''; const over = x.limit > 0 && x.remaining > x.limit + C.EPS;
  const val = over ? `${money(a, x.remaining)}${x.locked ? ' <span class="muted">· Boden fest</span>' : ''}` : `${money(a, x.remaining)} <span class="muted">von ${money(a, x.limit)}</span>`;
  return `<div class="prop-bar"><div class="bl"><span>${lbl} übrig</span><b>${val}</b></div><div class="track"><i style="width:${x.limit > 0 ? Math.min(100, x.remaining / x.limit * 100).toFixed(1) : 0}%;background:${x.limit > 0 ? col(x.remaining / x.limit) : 'var(--surface-3)'}"></i></div></div>`; };
```
- Z. 100 Title `title="Ampel ${AMPEL[ampel]}${b.ratio != null ? ` · ${fmt.pct(b.ratio)} des Limits übrig` : ''}"` → `title="Ampel ${AMPEL[ampel]}${ev.status === 'breached' && active ? ' · Regel verletzt' : b.ratio != null ? ` · ${fmt.pct(Math.min(1, b.ratio))} des Limits übrig` : ''}"`
- Z. 103 `<div class="prop-bars">…</div>` → `${dead ? '' : `<div class="prop-bars">…</div>`}`
- Z. 104 `<div class="prop-meta">…</div>` → `${dead ? '' : `<div class="prop-meta">…</div>`}`

```
