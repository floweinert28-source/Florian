# Paket 008 · shell

Schritte: 4 · Dateien: web/css/app.css, web/js/screens/dashboard.js
Betroffene Tests laut Spezifikation: Akzeptanz 4.1 Nr. 6 (font-weight 800 nur noch Kalender); web/e2e/certtest.js; web/e2e/filtertest.js, web/e2e/headtest.js (data-action bleibt, prüfen); web/e2e/headtest.js:60–64 (Gewicht 500 der aktiven Einträge bleibt); web/e2e/langtest.js (aria-label); web/e2e/mobiletest.js:85-86 (.content padding-bottom 60px muss bleiben)
Baut auf Paketen auf: 1, 2, 3

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## farbe-B22 · Aktive Navigationseinträge: helle Seitenleiste mit --surface/--border-2, Einstellungs-Menü mit inset-Rand

Gruppe farbe · Cluster shell · Aufwand S · Befunde: bereich_shell-18, bereich_einstellungen-16, farbe_kontrast-40
Quelle: audit/spec/farbe.md Z. 328–331 · Dateien: web/css/app.css
Abhängig von: —

```text
**B22 – Aktive Navigationseinträge** — bereich_shell-18, bereich_einstellungen-16, farbe_kontrast-40 (Symptom)
- nach Z. 179 neu: `:root[data-theme="light"] .nav a.active { background: var(--surface); border-color: var(--border-2); }`
- Z. 1810 `.set-nav a.active { background: var(--surface-2); color: var(--text); font-weight: 500; }` → `.set-nav a.active { background: var(--surface-2); box-shadow: inset 0 0 0 1px var(--border-2); color: var(--text); font-weight: 500; }`, darunter neu `:root[data-theme="light"] .set-nav a.active { background: var(--surface); }`

```

## farbe-C19b · Filter-Knopf: Klasse is-set statt accent, aria-label „Filter ({0} aktiv)“

Gruppe farbe · Cluster shell · Aufwand S · Befunde: referenz-7
Quelle: audit/spec/farbe.md Z. 471–471 · Dateien: web/js/screens/dashboard.js
Abhängig von: farbe-B25

```text
- Z. 124 `<button type="button" class="btn ${fN ? 'accent' : ''}" data-action="dash-f-open" aria-label="Filter">` → `<button type="button" class="btn${fN ? ' is-set' : ''}" data-action="dash-f-open" aria-label="${fN ? `Filter (${fN} aktiv)` : 'Filter'}">` (Zähler `.cntb` unverändert)
```

## typografie-3.2.4a · Marke 800 → 900 (.brand, Zertifikat .cert-brand .name)

Gruppe typografie · Cluster shell · Aufwand S · Befunde: typografie-1
Quelle: audit/spec/typografie.md Z. 325–330 · Dateien: web/css/app.css
Abhängig von: typografie-3.1

```text
#### 3.2.4 Gewichte

| Selektor (Z.) | vorher → nachher | Befund |
|---|---|---|
| `.brand` (140) | 800 → 900 | typografie-1 |
| `.cert[data-theme="app"] .cert-brand .name` (2048) | 800 → 900 | typografie-1 |
```

## abstaende-A4 · .content auf Token (padding-top var(--sp-6), gap var(--content-gap)); neu: Kopfreihe 16 px über negativen Rand, .page-head:empty ausblenden, Dashboard-Lücke 16 über --content-gap

Gruppe abstaende · Cluster shell · Aufwand M · Befunde: abstaende_layout-32, bereich_notebook_news-5, abstaende_layout-4, hierarchie-8
Quelle: audit/spec/abstaende.md Z. 306–306 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
| A4 | `.content` (Z. 230) | `padding: 22px var(--gutter) 60px; … gap: 18px;` → `padding: var(--sp-6) var(--gutter) 60px; … gap: var(--content-gap);`. Direkt danach neu: `.content > .page-head { flex-shrink: 0; margin-bottom: calc(var(--sp-4) - var(--content-gap)); }`, `.page-head:empty { display: none; }` und `.content:has(> .dash-top, > .dash-main) { --content-gap: var(--grid-gap); }` | abstaende_layout-32, bereich_notebook_news-5, abstaende_layout-4, hierarchie-8 |
```
