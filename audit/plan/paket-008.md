# Paket 008 · shell, tokens

Schritte: 4 · Dateien: web/css/app.css
Betroffene Tests laut Spezifikation: Akzeptanz 4.1 Nr. 6 (font-weight 800 nur noch Kalender); web/e2e/certtest.js; web/e2e/headtest.js:60–64 (Gewicht 500 der aktiven Einträge bleibt); web/e2e/mobiletest.js:31 (18 → 16, Schritt R1); web/e2e/mobiletest.js:85-86 (.content padding-bottom 60px muss bleiben)
Baut auf Paketen auf: 1, 2

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .set-nav a.active] Der aktive Eintrag im Einstellungs-Menü sieht aus wie der aktive Eintrag der Seitenleiste, damit es ein Muster für „aktive Navigation“ gibt. Die Regeln lauten: `.set-nav a { … border: 1px solid transparent; }`, `.set-nav a:hover { background: color-mix(in srgb, var(--text) 5%, transparent); color: var(--text); }` und `.set-nav a.active { background: var(--surface-2); border-color: var(--border); color: var(--text); font-weight: 500; }` (dunkel, wie .nav a.active). Für hell gilt `:root[data-theme="light"] .nav a.active, :root[data-theme="light"] .set-nav a.active { background: var(--surface); border-color: var(--border-2); }`. Statt eines inset-Schattens gibt es einen echten Rand. Weil der Grundrand transparent ist, springt nichts, wie bei .nav a. Das Darüberfahren bleibt schwächer als der aktive Zustand, weil das Menü keinen Leistenbalken hat. Das Gewicht 500 bleibt (headtest.js:60–64).
- ÄNDERN: Z. 1810: kein inset-Schatten und keine Änderung an der dunklen Regel (das macht zustaende-S-C9a). Die helle Regel für .set-nav a.active mit `background: var(--surface); border-color: var(--border-2)` als zweiten Selektor in die neue Regel `:root[data-theme="light"] .nav a.active` schreiben.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: .content] Die beiden Schritte ändern verschiedene Regeln: abstaende-A4 die Grundregel Z. 230, responsiv-A4 den ≤960-Block (Z. 934) und den ≤560-Block (Z. 2998). Bis 960 px bleiben oben 16 px. Damit es eine Abstands-Skala gibt, schreibt responsiv-A4 seine neuen Werte mit den Token aus abstaende-A1: .topbar Z. 212–213 `top: 0; padding: calc(var(--sp-3) + env(safe-area-inset-top, 0px)) var(--gutter) var(--sp-3);`. Z. 924 `.topbar { padding: calc(10px + env(safe-area-inset-top, 0px)) max(var(--sp-4), env(safe-area-inset-right, 0px)) 10px max(var(--sp-4), env(safe-area-inset-left, 0px)); min-height: 60px; gap: 8px; flex-wrap: nowrap; }`; die 10 px bleiben, weil die Titelzeile fest 60 px hoch ist. Z. 934 `.content { padding: var(--sp-4) max(var(--gutter), env(safe-area-inset-right, 0px)) 60px max(var(--gutter), env(safe-area-inset-left, 0px)); --gutter: var(--sp-4); }`. Unverändert bleiben Z. 2998 (`calc(104px + env(safe-area-inset-bottom, 0px))`, Platz für den runden Knopf), `.topbar .menu-btn { margin-left: -9px; }` (negativer Ausgleich ist erlaubt) und Z. 3019 (Anker .dash-head .tl, konflikt-10).

## abstaende-C11 · Abschnitts- und Raster-Wrapper auf Token: .aff (+ .aff > .aff-top), .nw-wrap, .nw-list, .cpn-grid, .coach-entries, .shadow-rules, .nb, .content > .tl-fit (18 → 16)

Gruppe abstaende · Cluster tokens · Aufwand M · Befunde: abstaende_layout-32
Quelle: audit/spec/abstaende.md Z. 360–360 · Dateien: web/css/app.css
Abhängig von: abstaende-A1, abstaende-A4

```text
| C11 | Abschnitts-Wrapper | `.aff` (Z. 2662) `gap: 16px` → `gap: var(--content-gap)`. Neu: `.aff > .aff-top { margin-bottom: calc(var(--sp-3) - var(--content-gap)); }`. `.nw-wrap` (Z. 3063) → `display: flex; flex-direction: column; gap: var(--content-gap); max-width: var(--w-news);`. `.nw-list` (Z. 3082) gap 14 → `var(--grid-gap)`. `.cpn-grid` (Z. 2644) gap 14 → `var(--grid-gap)`. `.coach-entries` (Z. 2869) gap 14 → `var(--grid-gap)`. `.shadow-rules` (Z. 2400) gap 10 → `var(--sp-3)`. `.nb` (Z. 954) gap 14 → `var(--grid-gap)`. `.content > .tl-fit` (Z. 955) gap 18 → `var(--grid-gap)`, Kommentar: „Kacheln, Reiter, Filter und Tabelle als eine Fläche wie das Dashboard“. | abstaende_layout-32 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: .nb] Die Schritte vertragen sich: C11 setzt .nb gap von 14 auf var(--grid-gap) (16 px), B8 legt die Spaltenbreiten fest. B8 hat seine Messwerte aber mit gap 14 gerechnet; sie verschieben sich um 2 px je Lücke. 1440×900: 236/300/592 (statt 596). 1366×768: 210/260/584 (statt 588). 1024 mit offener Seitenleiste, Liste plus Notiz: 260/468 (statt 470), mit eingeklappter Seitenleiste 620 (statt 622). Die Notizspalte bleibt ≥ 440 px, die Grenzen 1160/1000/700 bleiben.
