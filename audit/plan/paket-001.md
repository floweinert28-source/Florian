# Paket 001 · tokens

Schritte: 21 · Dateien: web/README.md, web/app.html, web/css/app.css, web/index.html, web/js/theme.js
Betroffene Tests laut Spezifikation: Akzeptanz 4.1 Nr. 1–3 (grep satoshi@, Canvas-Breiten 500/600/700, document.fonts weight "300 900"); Akzeptanz 4.2 Nr. 1–2 (grep font-size px); Akzeptanz 4.2 Nr. 5 (Zeilenhöhen ganzzahlig); Akzeptanz 4.3 dashboard (Schatten-Ich-Widget-Labels 12 px, Kürzung nicht schlimmer, K13), day (Kennzahl-Labels 12 px); Akzeptanz 4.3 dashboard 1280 (Kalenderzellen ohne Überlauf); Akzeptanz 4.3 dashboard 390 (Beträge 11 px mit €, Tageszahl 11 px im 20-px-Kreis, Heute-Kreis sichtbar); Akzeptanz 4.3 settings_design (+240 € in Onest 600); Akzeptanz 4.3 settings_design (Theme-/Designkarten 13/600); Akzeptanz 4.3 sidebar, pop_konto (Menüeinträge 13 wie andere Menüs), dashboard (Kachel-Titel 13/500); Akzeptanz 4.4: grep -n "tbl th.r" web/css/app.css ohne Treffer; E1-Screenshots dashboard, settings_profil, prop (dunkel 1440); E1: Gewichtsmessung 4.1, Screenshots dashboard/settings_profil/prop dunkel 1440, web/e2e/settest2.js; E2: Atlas dunkel 1440+390, web/e2e/mobiletest.js, web/e2e/tlfittest.js, Kopfzeile 1024; E3: Atlas dunkel 1440/1024/390, Kalender 1280 und 390; E4: web/e2e/runall.sh, node --test web/tests/*.mjs; E5: Akzeptanz 4.1–4.5; Screenshot news (14:15 so breit wie 14:30), prop_bilanz (Pro Firma bündig); Screenshot prop: 111.262,00 $ in Onest; Screenshots trades, prop_bilanz, settings_konten, settings_logs, affiliate (Kopf Satoshi, Datum Onest); web/e2e/colorpickertest.js (prüfen); web/e2e/mobiletest.js; web/e2e/mobiletest.js (Handy-Tabelle ohne Überlauf); web/e2e/rptest.js; web/e2e/settest2.js:22 (Satoshi geladen); web/e2e/settest2.js:43–47 (prüfen); web/e2e/settest2.js:47 (Standardfarben zurücksetzen, prüfen)
Baut auf Paketen auf: —

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## farbe-A1 · Dunkle Tokens in :root: --muted anheben, --profit-soft, --be/--be-soft, --warn-text und --imp-mid neu

Gruppe farbe · Cluster tokens · Aufwand S · Befunde: farbe_kontrast-9, farbe_kontrast-20, komponenten-8, farbe_kontrast-7, farbe_kontrast-6, bereich_notebook_news-42
Quelle: audit/spec/farbe.md Z. 200–211 · Dateien: web/css/app.css
Abhängig von: —

```text
## 3. Umsetzungsschritte

Reihenfolge: A Tokens/Skalen → B Komponenten → C Einzelstellen → D Texte, Tests, Doku. Innerhalb einer Datei von oben nach unten. Zeilennummern beziehen sich auf den aktuellen Stand; nach Einfügungen verschieben sich spätere Zeilen, deshalb ist jeder Schritt zusätzlich über Selektor bzw. Funktionsnamen eindeutig.

### A. Tokens und Skalen

**A1 – `web/css/app.css` `:root` (dunkel)**
- Z. 22 `--muted: #8a867f;` → `--muted: #948f88;` — farbe_kontrast-9
- nach Z. 30 (`--profit`) neu: `--profit-soft: rgba(52, 245, 138, 0.12);` — farbe_kontrast-20, komponenten-8
- Z. 33 `--be: #8b7cf6;` → `--be: #9a8cf8;`; Z. 34 `--be-soft: rgba(139, 124, 246, 0.16);` → `--be-soft: rgba(154, 140, 248, 0.16);` — farbe_kontrast-7
- nach Z. 36 (`--warn-soft`) neu: `--warn-text: var(--warn);` und `--imp-mid: var(--warn);` — farbe_kontrast-6, bereich_notebook_news-42

```

## farbe-A2 · Helle Token-Blöcke (Media-Query und data-theme=light) identisch abdunkeln und ergänzen

Gruppe farbe · Cluster tokens · Aufwand S · Befunde: farbe_kontrast-1, bereich_dashboard-3, barrierefreiheit-7, barrierefreiheit-24, bereich_konto-3, bereich_notebook_news-3, bereich_trades_tag-20, farbe_kontrast-5, farbe_kontrast-6, farbe_kontrast-7, farbe_kontrast-8, farbe_kontrast-9, farbe_kontrast-40, bereich_shell-17, bereich_notebook_news-42
Quelle: audit/spec/farbe.md Z. 212–218 · Dateien: web/css/app.css
Abhängig von: —

```text
**A2 – `web/css/app.css` helle Blöcke (Z. 57–62 im `@media (prefers-color-scheme: light)`-Block und Z. 67–72 in `:root[data-theme="light"]`, beide identisch ändern)**
- Z. 59/68: `--muted: #6a746d;` → `--muted: #5f6862;`
- Z. 60/70: `--accent: #0fb862; --accent-2: #0a9a52; --accent-ink: #ffffff; --accent-soft: rgba(15, 184, 98, 0.12); --accent-glow: rgba(15, 184, 98, 0.22);` → `--accent: #077a41; --accent-2: #06663a; --accent-ink: #ffffff; --accent-soft: rgba(7, 122, 65, 0.10); --accent-glow: rgba(7, 122, 65, 0.20);`
- Z. 61/71: `--profit: #0fb862; --loss: #e03e3e; --loss-soft: rgba(224, 62, 62, 0.12); --be: #6b5bd6; --be-soft: rgba(107, 91, 214, 0.14);` → `--profit: #077a41; --profit-soft: rgba(7, 122, 65, 0.10); --loss: #c62e2e; --loss-soft: rgba(198, 46, 46, 0.10); --be: #5f4fcf; --be-soft: rgba(95, 79, 207, 0.14);`
- Z. 62/72: `--warn: #d99a12; --warn-soft: rgba(217, 154, 18, 0.14); --info: #2b8fe0;` → `--warn: #d99a12; --warn-soft: rgba(217, 154, 18, 0.14); --warn-text: #8f5f00; --imp-mid: #b8820c; --info: #1d6db5;`
- Erledigt: farbe_kontrast-1, bereich_dashboard-3, barrierefreiheit-7, barrierefreiheit-24, bereich_konto-3, bereich_notebook_news-3, bereich_trades_tag-20, farbe_kontrast-5, farbe_kontrast-6, farbe_kontrast-7, farbe_kontrast-8, farbe_kontrast-9, farbe_kontrast-40 (Teil `--muted`), bereich_shell-17, bereich_notebook_news-42 (Teil Balken)

```

## farbe-A3a · theme.js: DEFAULTS auf neue Standardfarben (dunkel be #9a8cf8, hell #077a41/#c62e2e/#5f4fcf)

Gruppe farbe · Cluster tokens · Aufwand S · Befunde: farbe_kontrast-1, bereich_dashboard-3, farbe_kontrast-5, farbe_kontrast-7
Quelle: audit/spec/farbe.md Z. 219–220 · Dateien: web/js/theme.js
Abhängig von: farbe-A1, farbe-A2

```text
**A3 – `web/js/theme.js`**
- Z. 4 `DEFAULTS` → `{ dark: { accent: '#34f58a', profit: '#34f58a', loss: '#ff5c5c', be: '#9a8cf8' }, light: { accent: '#077a41', profit: '#077a41', loss: '#c62e2e', be: '#5f4fcf' } }` (wirkt automatisch auf misc.js:95/100/130 und certificate.js:10) — farbe_kontrast-1, bereich_dashboard-3, farbe_kontrast-5, farbe_kontrast-7
```

## farbe-A3c · theme.js: forLight (0,18, 8-%-Schritte), ratio/inkFor neu, apply mit hellen Soft-Werten und --profit-soft, Export

Gruppe farbe · Cluster tokens · Aufwand M · Befunde: farbe_kontrast-16, farbe_kontrast-15, bereich_konto-3, bereich_notebook_news-3, farbe_kontrast-20, bereich_einstellungen-17
Quelle: audit/spec/farbe.md Z. 222–227 · Dateien: web/js/theme.js
Abhängig von: farbe-A1, farbe-A2

```text
- Z. 26 `forLight` → `const forLight = h => { let x = h; let i = 0; while (lum(x) > 0.18 && i++ < 24) x = shade(x, -0.08); return x; };` — farbe_kontrast-16
- direkt danach neu: `const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };` und `const inkFor = h => ratio(h, '#ffffff') >= ratio(h, '#04140a') ? '#ffffff' : '#04140a';` — farbe_kontrast-15
- Z. 45 in `apply`: `set('--accent-soft', acc && rgba(acc, 0.13));` → `set('--accent-soft', acc && rgba(acc, light ? 0.10 : 0.13));`; `set('--accent-ink', acc && (lum(acc) > 0.4 ? '#04140a' : '#ffffff'));` → `set('--accent-ink', acc && inkFor(acc));` — farbe_kontrast-15, bereich_konto-3, bereich_notebook_news-3
- Z. 47: `set('--loss-soft', l && rgba(l, 0.14));` → `set('--loss-soft', l && rgba(l, light ? 0.10 : 0.14)); set('--profit-soft', p && rgba(p, light ? 0.10 : 0.12));` — farbe_kontrast-20
- Z. 53 Export ergänzen: `…, surfaces, isLightBase, forLight, inkFor };` — bereich_einstellungen-17

```

## farbe-D3d · README nach Z. 201: abgedunkelte Signalfarben hell, forLight/inkFor, Report-Palette

Gruppe farbe · Cluster tokens · Aufwand S · Befunde: farbe_kontrast-1, farbe_kontrast-5, farbe_kontrast-7, farbe_kontrast-8, farbe_kontrast-15, farbe_kontrast-16, diagramme-44
Quelle: audit/spec/farbe.md Z. 569–569 · Dateien: web/README.md
Abhängig von: farbe-A2, farbe-A3c, farbe-C14b

```text
- nach Z. 201 neu: „Im hellen Design sind die Signalfarben abgedunkelt (Gewinn und Akzent `#077a41`, Verlust `#c62e2e`, Break-even `#5f4fcf`, Info `#1d6db5`, Warntext `#8f5f00`), damit Zahlen mindestens 4,5:1 erreichen; eigene Farben werden dafür automatisch abgedunkelt (`Theme.forLight`), die Schrift auf Farbflächen wählt `Theme.inkFor` nach dem höheren Kontrast. Report-Linien haben eine feste Palette (Blau, Magenta, Kupfer) ohne Grün.“ — farbe_kontrast-1, -5, -7, -8, -15, -16, diagramme-44
```

## typografie-3.0 · Etappenplan E1–E5 und Zwischenprüfungen (Reihenfolge der übrigen Schritte, keine eigene Codeänderung)

Gruppe typografie · Cluster tokens · Aufwand S · Befunde: —
Quelle: audit/spec/typografie.md Z. 188–199 · Dateien: 
Abhängig von: —

```text
## 3. Umsetzungsschritte

### 3.0 Reihenfolge und Zwischenprüfungen

| Etappe | Inhalt | Nach der Etappe |
|---|---|---|
| E1 | 3.1 Schrift laden, 3.2.1 Tokens, 3.2.4 Gewichte, 3.3, 3.9 | Gewichtsmessung (4.1), Screenshots dashboard, settings_profil, prop (dunkel 1440), `settest2` |
| E2 | 3.2.2 Sammelregeln, 3.2.3 Text-Skala (`--fs-*`) | Atlas dunkel 1440 + 390, `mobiletest`, `tlfittest`, Kopfzeile bei 1024 |
| E3 | 3.2.3 Werte-Skala (`--fv-*`), 3.2.5 Komponenten | Atlas dunkel 1440/1024/390, Kalender bei 1280 und 390 |
| E4 | 3.2.6 Einzelstellen, 3.4–3.8 JS | alle e2e-Läufe (`web/e2e/runall.sh`), `node --test web/tests/*.mjs` |
| E5 | 3.10 README, Abschluss-Zensus | Akzeptanz 4.1–4.5 |

```

## typografie-3.1 · Satoshi als variable Schrift laden (satoshi@1) in app.html und index.html

Gruppe typografie · Cluster tokens · Aufwand S · Befunde: typografie-1
Quelle: audit/spec/typografie.md Z. 200–205 · Dateien: web/app.html, web/index.html
Abhängig von: —

```text
### 3.1 `web/app.html` und `web/index.html`

| Stelle | vorher → nachher | Befund |
|---|---|---|
| app.html:13 und index.html:13 | `https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap` → `https://api.fontshare.com/v2/css?f[]=satoshi@1&display=swap` | typografie-1 |

```

## typografie-3.2.1 · Größen-, Zeilenhöhen- und Laufweiten-Tokens in :root anlegen, body auf --fs-14/--lh-14

Gruppe typografie · Cluster tokens · Aufwand S · Befunde: typografie-3
Quelle: audit/spec/typografie.md Z. 206–214 · Dateien: web/css/app.css
Abhängig von: —

```text
### 3.2 `web/css/app.css`

#### 3.2.1 Tokens und Grundschrift

| Stelle | Änderung | Befund |
|---|---|---|
| `:root`, direkt nach `--font-num` (Z. 41) | einfügen:<br>`--fs-10: 10px; /* nur @container-Notstufen */`<br>`--fs-11: 11px; --lh-11: calc(16 / 11);`<br>`--fs-12: 12px; --lh-12: calc(16 / 12);`<br>`--fs-13: 13px; --lh-13: calc(18 / 13);`<br>`--fs-14: 14px; --lh-14: calc(20 / 14);`<br>`--fs-15: 15px; --lh-15: calc(20 / 15);`<br>`--fs-18: 18px; --lh-18: calc(24 / 18);`<br>`--fs-21: 21px; --lh-21: calc(28 / 21);`<br>`--fv-14: 14px; --fv-16: 16px; --fv-20: 20px; --fv-24: 24px; --fv-32: 32px; --fv-44: 44px;`<br>`--lh-val: 1.1; --ls-val: -0.02em; --ls-hero: -0.03em;` | typografie-3 |
| `body` (Z. 84–85) | `font-size: 14px; line-height: 1.45;` → `font-size: var(--fs-14); line-height: var(--lh-14);` | typografie-3 |

```

## typografie-3.2.2a · Sammelregel .small auf --fs-12/--lh-12

Gruppe typografie · Cluster tokens · Aufwand S · Befunde: typografie-3
Quelle: audit/spec/typografie.md Z. 215–219 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
#### 3.2.2 Sammelregeln

| Stelle | vorher → nachher | Befund |
|---|---|---|
| Z. 101, `.small` | `.small { font-size: 12px; }` → `.small { font-size: var(--fs-12); line-height: var(--lh-12); }` | typografie-3 |
```

## typografie-3.2.2e · tabular-nums-Sammelregel für Listenwerte und laufende Zahlen

Gruppe typografie · Cluster tokens · Aufwand S · Befunde: typografie-21, bereich_notebook_news-48, bereich_notebook_news-14
Quelle: audit/spec/typografie.md Z. 224–224 · Dateien: web/css/app.css
Abhängig von: —

```text
| Z. 94, nach `.tbl td { font-variant-numeric: tabular-nums; }` | neu: `.kv b, .bar-row .bl b, .chart text, .pfm-top span, .fw-acc-v, .pg-info, .day-card .stats .v, .nw-next-when b, .nw-time, .nw-v b, .nb-toolbar .sz { font-variant-numeric: tabular-nums; }` | typografie-21, bereich_notebook_news-48, bereich_notebook_news-14 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .pg-info] komponenten will `.pg-info` immer, zustaende will es bei einer Seite nur ohne aktiven Filter. zustaende gilt (aufbau Grundsatz 1: eine Information an einer Stelle). Bei aktivem Filter steht „{x} von {y} Trades“ schon in der Filterzeile.

Verbindlicher Endstand trades.js:
- Z. 44: Zähler nur bei aktivem Filter (`active = !!(f.q || f.symbol || f.setup || f.status || f.mistake)`).
- Z. 48: „Trades pro Seite“ steht immer.
- Bei `pages > 1` kommen dazu: `pg-sep`, `<span class="pg-info">${from + 1}–${to} von ${n} Trades</span>`, `grow`, die Seitenwahl mit „von N Seiten“ und `.pg-nav` mit zwei `<button type="button" class="btn nav">`.
- Bei `pages <= 1`: ohne Filter `pg-sep` + `<span class="pg-info">{n} Trade(s)</span>`, mit Filter nichts weiter.

Bereichsangabe immer ohne Leerzeichen „1–10“ (komponenten-Wortwahl). Das „{from} – {to}“ in S-T2 zitiert nur den Ist-Text.

Gleiches Format in shadow.js:73 („1–10 von {n} Verstößen“). Dazu shadowtest.js:38 auf `1–10 von ${n2} Verstößen` und Z. 41 auf `startsWith('11–')` anpassen. Neue Schlüssel „{0}–{1} von {2} Trades/Verstößen“ in allen fünf js/lang-Dateien.

tabular-nums für `.pg-info` (3.2.2e) gilt unverändert. Weil die Pfeile einzelne `.btn.nav` werden (komponenten ersetzt Z. 1749–1753), folgt `:disabled` der globalen Regel (`--disabled-o`); die Sonderfarbe `--faint` für die Pager-Pfeile entfällt.

## typografie-3.2.2f · Onest-Sammelregel neu fassen: Tabellenzellen standardmäßig Satoshi, nur td.r/td.c/.num und Wert-Selektoren in Onest

Gruppe typografie · Cluster tokens · Aufwand S · Befunde: typografie-11, typografie-12, bereich_einstellungen-30, bereich_konto-34, responsiv-33, bereich_statistik-17
Quelle: audit/spec/typografie.md Z. 225–225 · Dateien: web/css/app.css
Abhängig von: —

```text
| Z. 1800 **Onest-Sammelregel** | Selektorliste ersetzen durch: `.num, .tbl td.r, .tbl td.c, .tile .val, .kv b, .cal .p, .cal .d .n, .cal .w .p, .cal .d .pm, .cal .w .pm, .stat .v, .big-stat, .score-big, .streak-ring, .yc b, .yc small, .tracker-foot .score-n, .slider .sv, .chart text, .tile .head .n, .tile .gauge-stack .pill, .pills.col .pill, .pg-info, .strat-stats .v, .day-card .pnl, .day-card .stats .v, .detail-head .big, .tilt-stats .v, .ym-head span, .score-scale .lbls, .ticks, .stats-grid .v, .stat-tile .v, .prop-balance .val, .prop-bar .bl b, .fw-stats b, .fw-acc-v, .stc-col > b, .wl-single .lbl, .pfm-top span, .pg-facts dd > .pos, .pg-facts dd > .neg, .pg-facts dd > .neu, .fw-big, .rh-big, .streak .big, .bar-row .bl b { font-family: var(--font-num); }`<br>Entfernt: `.tbl td`, `.tile.spark-tile .val` (deckt `.tile .val` ab), `.pill`, `.tbl th.r`. | typografie-11, typografie-12, bereich_einstellungen-30, bereich_konto-34, responsiv-33, bereich_statistik-17 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .tile.spark-tile .val] Endstand: `.tile.spark-tile .val { flex: 0 0 auto; display: flex; align-items: center; margin: 0; padding: 0; min-height: 0; }`. Schrift, Größe (--tile-val, also 24/20 statt 28), Gewicht, Laufweite und Zeilenhöhe erbt die Regel von .tile .val. Geschrieben wird sie einmal, von aufbau-A2. Dass typografie-3.2.2f den Selektor aus der Onest-Liste streicht, passt dazu (.tile .val deckt ihn ab).
- [konflikt: .cal .d .pm] Kurzbetrag am Handy (Z. 3042): `font-weight: 700; font-size: 10.5px; letter-spacing: -.02em;` in Onest (über die Sammelregel), der Rest der Regel bleibt (barrierefreiheit-B14). Gemessen bei 390 px in Onest 700: Das Feld ist 39,7 px breit. „+12,3k€“ braucht bei 10,5/−.02em 37,5 px, bei 11/−.01em 40,2 px und würde abgeschnitten (overflow hidden); „−486€“ 34,0 bzw. 35,5 px. 10,5 ist damit die größte Stufe ohne Abschneiden und liegt deutlich über heute 9,5. Sie kommt als dokumentierte Ausnahme in die Typografie-Ausnahmenliste (wie --fs-10 für Container-Notstufen). Die Onest-Liste schreibt einmal typografie-3.2.2f (enthält .cal .d .pm und .cal .w .pm). Die Container-Stufe ≤77 px (Z. 2976, 12.5 → 12) bleibt bei typografie-3.2.3f.
- [konflikt: .cal .w .pm] Wochenbetrag am Handy (Z. 3044): `display: block; font-weight: 700; font-size: var(--fs-12); line-height: var(--lh-12);` in Onest (typografie-3.2.3f: 12.5 → 12, Onest über 3.2.2f). Barrierefreiheit wollte 12,5 nur gegen eine Verkleinerung auf 11 verteidigen. 12 ist eine Skalenstufe, liegt nur 0,5 px darunter und passt sicher in die Wochenspalte.
- [doppelt: --font-num] Beträge in Balkenzeilen bekommen Onest über die Sammelregel (typografie-3.2.2f, `.bar-row .bl b`), tabular-nums über typografie-3.2.2e und `.bar-row .bl b { font-weight: 600; white-space: nowrap; } .bar-row .bl b .muted { font-weight: 400; }` über typografie-3.2.5d. diagramme-A8a steckt darin vollständig und entfällt. Gewicht 600 (Typografie-Rolle „Listenwert“, wie .kv b), nicht 700 wie in diagramme A-13 notiert. Schriftgewichte gehören der Typografie-Spezifikation, und beide Listenwert-Arten sollen gleich aussehen.

## typografie-3.2.2h · font-family: var(--font-display) aus Wert-Regeln löschen (Pflicht bei .prop-balance .val und .rh-big)

Gruppe typografie · Cluster tokens · Aufwand S · Befunde: typografie-11
Quelle: audit/spec/typografie.md Z. 227–228 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.2f

```text
| `font-family: var(--font-display)` in Wert-Regeln | **Pflicht** löschen in `.prop-balance .val` (2700) und `.rh-big` (2460), sonst schlagen sie die Onest-Regel. Zur Klarheit auch löschen in `.tile .val` (540), `.score-big` (577), `.day-card .head .pnl` (908), `.big-stat` (1203), `.fw-big` (1464), `.fw-stats b` (1456), `.tile.spark-tile .val` (1735). | typografie-11 |

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .tile .val] Ein Rollen-Token für alle Kachelwerte, die Werte kommen aus der Typografie-Skala. In :root steht `--tile-val: var(--fv-24);`, im Block @media (max-width: 960px) `:root { --tile-val: var(--fv-20); }`; eine eigene 560er-Stufe gibt es nicht, das Handy erbt 20. Die Regel lautet `.tile .val { font-size: var(--tile-val); font-weight: 700; letter-spacing: var(--ls-val); line-height: var(--lh-val); }` ohne font-family (Onest kommt über die Sammelregel). In der Container-Notstufe (heute @container max-width 164px, die Schwelle legt der Anker „@container (max-width: 164px)“ fest) gilt `.tile .val { font-size: var(--fv-20); }`. Gelöscht werden Z. 936 (22px, ≤960) und Z. 3027 (21px, Handy). Die Skala gilt auch für die bisherigen „Bleiben“-Ausnahmen aus aufbau-A2: `.prop-balance .val` geht von 26 auf var(--fv-24), bei ≤960 von 22 auf var(--fv-20) (wie typografie-fv24/fv20). `.coach-gs-tiles .tile .val { font-size: 21px }` (Z. 2945) wird gelöscht und erbt --tile-val; schmale Coach-Kacheln fallen über die Container-Notstufe auf 20. Grund: 25, 22, 21 und 26 px liegen nicht auf der Werte-Skala (14/16/20/24/32/44), und die Typografie verbietet sie. Aufbau, Typografie und Responsiv sind sich bei 24 am Desktop und 20 am Handy einig. Streitig war nur der Tablet-Wert 22 (Aufbau). Dafür gibt es die Skalenstufe 20 „Kachelwert schmal, ≤960, Handy“.
- ÄNDERN: Entfallen: `.tile .val` (540) und `.tile.spark-tile .val` (1735), aufbau-A2 schreibt beide ohne font-family. Rest bleibt (Pflicht: .prop-balance .val und .rh-big; dazu .score-big, .day-card .head .pnl, .big-stat, .fw-big, .fw-stats b).
- [doppelt: .tile.spark-tile .val] Endstand: `.tile.spark-tile .val { flex: 0 0 auto; display: flex; align-items: center; margin: 0; padding: 0; min-height: 0; }`. Schrift, Größe (--tile-val, also 24/20 statt 28), Gewicht, Laufweite und Zeilenhöhe erbt die Regel von .tile .val. Geschrieben wird sie einmal, von aufbau-A2. Dass typografie-3.2.2f den Selektor aus der Onest-Liste streicht, passt dazu (.tile .val deckt ihn ab).
- ÄNDERN: Entfallen: `.tile .val` (540) und `.tile.spark-tile .val` (1735), aufbau-A2 schreibt beide ohne font-family. Rest bleibt (Pflicht: .prop-balance .val und .rh-big; dazu .score-big, .day-card .head .pnl, .big-stat, .fw-big, .fw-stats b).
- [konflikt: .big-stat] `.big-stat` bleibt die Hero-Klasse und gilt nur noch im Fortschritt (Serie, Heutiger Fortschritt, % Regeln eingehalten). CSS wie in der Typografie geplant: `font-size: var(--fv-44); letter-spacing: var(--ls-hero); line-height: var(--lh-val);` ohne font-family, bei ≤960 var(--fv-32) (typografie-3.2.2h, fv44, fv32 unverändert). Das Challenge-Widget nutzt `.score-big` (32 px) statt `.big-stat` (siehe Anker widget:challenge). Der Payout-Vorschlag nutzt `.prop-sugg-val` auf --tile-val (aufbau-C12e). Grund: Die Aufbau-Regel sagt „.big-stat 44 px nur Fortschritt und Serie“; W5 hätte das Challenge-Widget ohne die Inline-Größe auf 44 px aufgeblasen. progress.js Z. 69 ändern aufbau-C11a (Pfeil mit Tooltip) und kilook-C18 („—“, Ring und ring-card nur mit Wert) gemeinsam in derselben Zeile; keiner überschreibt den anderen. Den Inhalt von Z. 68 und den Tooltip-Text des Pfeils entscheidet der Anker .trend.

## typografie-3.2.3a · Skala-Schreibweise (3.2.3) und --fs-10 nur in @container-Notstufen

Gruppe typografie · Cluster tokens · Aufwand S · Befunde: typografie-3
Quelle: audit/spec/typografie.md Z. 229–237 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
#### 3.2.3 Skala-Zuordnung (Größe)

Schreibweise: Text `font-size: <alt>` → `font-size: var(--fs-N); line-height: var(--lh-N);` (Ausnahmen der Zeilenhöhe nach 1.6). Werte `font-size: <alt>` → `font-size: var(--fv-N); line-height: var(--lh-val);` und bei 20–32 px `letter-spacing: var(--ls-val)`, bei 44 px `var(--ls-hero)`.
**Regeln, deren Größe schon auf der Skala liegt (11/12/13/14/15/18/21 bzw. 14/16/20/24/32/44), bekommen ebenfalls das Token.** Sichtbar ändert sich dort nur die Zeilenhöhe. Alles unten gehört zu typografie-3, sofern keine andere id steht.

**→ `--fs-10` (nur in `@container`)**
- Z. 533 `.tile.side .gauge-stack .pill` 10.5 → 10 (K10)
- Z. 2977 `.cal .d .c` 10 → Token (K10)

```

## typografie-3.2.3b · --fs-11: 9.5/10 px → 11 (Handy-Kalender, Sortierpfeil, Ring, News, Tageszahl im 20-px-Kreis)

Gruppe typografie · Cluster tokens · Aufwand M · Befunde: typografie-3, responsiv-33
Quelle: audit/spec/typografie.md Z. 238–240 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
**→ `--fs-11`**
- 9.5 → 11: Z. 3042 `.cal .d .pm` (Handy), zusätzlich `letter-spacing: -.03em` → `-.01em`, Rest der Regel bleibt (responsiv-33)
- 10 → 11: Z. 596 `.tbl th .dir`, Z. 699 `.ring .n small`, Z. 1793 `.cal .w .t` (≤ 960), Z. 3105 `.nw-v small`; Z. 940 `.cal .d .n` (≤ 960) zusätzlich `width: 18px; height: 18px` → `width: 20px; height: 20px` (`top`/`right` 3px bleiben, Heute-Kreis Z. 709 bleibt intakt) (responsiv-33)
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .tbl th .dir] Der Sortierpfeil wird ein Chevron-SVG mit 12 × 12 px (barrierefreiheit-B7): `.tbl th .dir { display: inline-flex; margin-left: 4px; color: var(--text-2); }` ohne font-size, dazu `.tbl th .dir svg { width: 12px; height: 12px; }` und `.tbl th .dir.up svg { transform: rotate(180deg); }`. ▲/▼ werden durch I.chev im Knopf .th-sort ersetzt, und .dir kommt nur in trades.js vor. Die Schriftgröße 11 px aus typografie-3.2.3b wäre deshalb ein toter Wert (Kilook Z11: kein toter Code).
- ÄNDERN: In der Liste „10 → 11“ den Eintrag Z. 596 `.tbl th .dir` streichen. Die übrigen Stellen bleiben: .cal .d .pm am Handy, .ring .n small, .cal .w .t, .nw-v small und .cal .d .n bis 960 px, letzteres vorbehaltlich der Entscheidung zu .cal .d .n.
- [konflikt: .cal .d .pm] Kurzbetrag am Handy (Z. 3042): `font-weight: 700; font-size: 10.5px; letter-spacing: -.02em;` in Onest (über die Sammelregel), der Rest der Regel bleibt (barrierefreiheit-B14). Gemessen bei 390 px in Onest 700: Das Feld ist 39,7 px breit. „+12,3k€“ braucht bei 10,5/−.02em 37,5 px, bei 11/−.01em 40,2 px und würde abgeschnitten (overflow hidden); „−486€“ 34,0 bzw. 35,5 px. 10,5 ist damit die größte Stufe ohne Abschneiden und liegt deutlich über heute 9,5. Sie kommt als dokumentierte Ausnahme in die Typografie-Ausnahmenliste (wie --fs-10 für Container-Notstufen). Die Onest-Liste schreibt einmal typografie-3.2.2f (enthält .cal .d .pm und .cal .w .pm). Die Container-Stufe ≤77 px (Z. 2976, 12.5 → 12) bleibt bei typografie-3.2.3f.
- ÄNDERN: Eintrag Z. 3042 `.cal .d .pm` (9.5 → 11, −.01em) entfällt; barrierefreiheit-B14 setzt 10.5px/−.02em. In die Ausnahmenliste (1.11) „Handy-Kalender-Kurzbetrag .cal .d .pm 10,5 px (gemessen, 11 px wird abgeschnitten)“ aufnehmen; Zensus-Prüfung (Z. 479) und Abnahme Z. 488 entsprechend auf „Kalender-Beträge 10,5 px mit €“ ändern. Z. 940 `.cal .d .n` bleibt bei diesem Schritt (siehe Anker .cal .d .n).
- [konflikt: .cal .d .n] Desktop (Z. 708), Endstand für alle Tage: `.cal .d .n { position: absolute; top: 6px; right: 6px; width: 24px; height: 24px; border-radius: 999px; display: grid; place-items: center; font-size: var(--fs-12); line-height: var(--lh-12); font-weight: 500; background: none; color: var(--text-2); }`; komponenten-C26a schreibt die Regel. Bei der Farbe gilt --text-2 (Farbe und Aufbau). Die Variante „--muted, nur an Handelstagen --text-2“ (Komponenten) entfällt. Grund: Tageszahlen sind Inhalt; --muted ist laut Farbe-Spezifikation Hinweisen, Platzhaltern und Achsen vorbehalten, und es ist eine Regel weniger. ≤960 (Z. 940): `width: 20px; height: 20px; font-size: var(--fs-11); line-height: var(--lh-11);`, top/right 3px bleiben; das schreibt typografie-3.2.3b (Barrierefreiheit hat dieselben Werte). Heute-Kreis und Mini-Kalender entscheiden die Anker .cal .d.today .n und .cal.mini .d.today .n.

## typografie-3.2.3c · --fs-11: 10.5/11.5 px → 11 (Abzeichen, Pillen, Atemsegmente, .pf-n, .chart text)

Gruppe typografie · Cluster tokens · Aufwand M · Befunde: typografie-3, bereich_training-46
Quelle: audit/spec/typografie.md Z. 241–242 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
- 10.5 → 11: Z. 618 `.badge`, Z. 718 `.cal .d .c .wr`, Z. 941 `.cal .p, .cal .d .p` (≤ 960), Z. 2284 `.rp-seq-i small` (bereich_training-46), Z. 2632 `.prop-presets td .sub .pill`, Z. 2920 `.mr-head .pill`
- 11.5 → 11: Z. 1605 `.sp-group` (über die Sammelregel), Z. 2292 `.rp-breath .rp-seg` (dazu 700 → 600, Laufweite .1em bleibt) (bereich_training-46), Z. 2608 `.pf-n` (dazu 700 → 600), Z. 1648 `.chart text` (keine Zeilenhöhe, SVG)
```

## typografie-3.2.3d · --fs-11: übrige 11-px-Regeln auf das Token

Gruppe typografie · Cluster tokens · Aufwand M · Befunde: typografie-3
Quelle: audit/spec/typografie.md Z. 243–244 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
- schon 11 → Token: alle übrigen 11-px-Regeln (z. B. 186, 358, 419, 539, 576, 683, 722, 726, 728, 816, 981, 1022, 1341, 1382, 1421, 1643, 1688, 2354, 2993, 3030, 3085, 3087, 3100)

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .nav .badge-n] Z. 186 `.nav .badge-n { … }` wird gelöscht. Toter Code: `badge-n` kommt in web/js und web/app.html nicht vor (kilook Z11, Prüfung kilook 11). Die Umstellung von 11 px auf das Token entfällt für diese Zeile.
- ÄNDERN: Z. 186 aus der Liste der 11-px-Regeln streichen (Regel wird von kilook-C1a gelöscht).
- [doppelt: .btn .cntb] Das Gewicht 700 → 600 steht zweimal da (3.2.4l und S-C7). S-C7 übernimmt es zusammen mit der neutralen Farbe, 3.2.3d stellt die Größe auf das Token um. Endstand: `.btn .cntb { display: inline-grid; place-items: center; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 999px; background: color-mix(in srgb, var(--text) 16%, transparent); color: var(--text); font-size: var(--fs-11); line-height: var(--lh-11); font-weight: 600; }`. Ein Zähler ist ein Etikett, daher 600, ohne Grün. Prüfung zustaende 8 (kein `var(--bg)` in `.btn .cntb`) ist damit erfüllt.
- [doppelt: .fd-panel .cntb] Wie bei .btn .cntb: S-C7 setzt Fläche `color-mix(in srgb, var(--text) 16%, transparent)`, Schrift `var(--text)` und Gewicht 600, 3.2.3d stellt `font-size: var(--fs-11); line-height: var(--lh-11)` um. 3.2.4l ändert die Zeile nicht separat.
- [konflikt: .nw-n] Die Zähler-Pille im News-Tageskopf entfällt (aufbau Grundsatz 1, Prüfung aufbau 727/756). news.js Z. 81 ohne `<span class="nw-n">`, Regel Z. 3087 gelöscht. Die 11-px-Token-Umstellung entfällt für diese Zeile.
- ÄNDERN: Z. 3087 `.nw-n` aus der Liste streichen (Regel wird von aufbau-C9b gelöscht).

## typografie-3.2.3e · --fs-12: 11/11.5 px → 12 (kleine Kennzahl-Beschriftungen, Hilfstexte, Pille) und .wl-single .lbl bereinigen

Gruppe typografie · Cluster tokens · Aufwand M · Befunde: typografie-3, bereich_trades_tag-39, bereich_training-46, bereich_notebook_news-15, bereich_einstellungen-28, bereich_dashboard-44
Quelle: audit/spec/typografie.md Z. 245–248 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
**→ `--fs-12`**
- 11 → 12: Z. 910 `.day-card .stats .k`, Z. 793 `.strat-stats .k` (bereich_trades_tag-39); Z. 1035 `.nb .stats-grid .k` (gleiche Rolle); Z. 2234 `.rp-scale-ends` (bereich_training-46)
- 11.5 → 12: Z. 299 `.field .hint`, 545 `.pill`, 708 `.cal .d .n`, 724 `.cal .w .t`, 1002 `.nb .note-item .d`, 1030 `.nb .save-state`, 1078 `.ed-pop .ed-hint` (Zeilenhöhe 1.4 → Token), 1175 `.nb-figure .fig-bar button` (dazu 700 → 500, bereich_notebook_news-15), 1360 `.fd-pop .fd-l`, 1455 `.fw-stats > div > span` (K13), 1585 `.seg.mini button`, 1932 `.font-card small` (bereich_einstellungen-28), 2289 `.rp-tempo`, 2290 `.rp-chip.rp-chip-sm`, 2467 `.rh-rounds-l`, 2579 `.voice-sug .k`, 2634 `.prop-acc-tbl td .sub, .prop-presets td .sub`, 2723 `.prop-rule-f .field span`, 2724 `.prop-rule .hint`, 2966 `.stc-l small`, 3078 `.nw-next-when small`
- Z. 553 `.wl-single .lbl`: nur `font-size: 11.5px;` löschen (wird von Z. 556 überschrieben), `white-space: nowrap` bleibt. Z. 556 (12/700) → Token.
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .prop-rule-f .field span] Die Regel wird gelöscht und nicht verkleinert. C05 löscht Z. 2723 `.prop-rule-f .field span`. S-prop-b stellt in prop.js `rulesFields` den Helfer `F` auf `<label class="field"><span class="lbl">…</span>` um. Die Beschriftung kommt dann aus `.field > .lbl`: 12/600 `--muted`, Token aus 3.2.3g. Das ist die app-weit einheitliche Feldbeschriftung und hat dieselbe Zielgröße 12, die 3.2.3e wollte. C05 und S-prop-b sollen im selben Durchgang landen, damit die Regelfelder nie ohne Beschriftungsstil dastehen.
- ÄNDERN: Z. 2723 `.prop-rule-f .field span` aus der Liste „11.5 → 12“ streichen, komponenten-C05 löscht die Regel.
- [doppelt: .fd-pop .fd-l] komponenten-C05 übernimmt und löscht `.fd-pop .fd-l` (Z. 1360). Die Filter-Beschriftung kommt in Popover und Panel allein aus `.fd-l`: `display: flex; align-items: baseline; gap: 8px; font-size: var(--fs-12); line-height: var(--lh-12); font-weight: 600; color: var(--muted);`. Das sind die Werte aus C05 in Token-Schreibweise; die Zeilenhöhe 1.3 wird zum Token wie in typografie-3.2.3f. aufbau-A4f wollte für das Popover dasselbe Ergebnis (12, `--muted`, 600 geerbt) als Zusatzregel. Eine Regel statt zwei ist sauberer.
- ÄNDERN: Z. 1360 `.fd-pop .fd-l` aus der Liste „11.5 → 12“ streichen, die Regel entfällt durch komponenten-C05.
- [konflikt: .day-card .stats .k] Typografie gewinnt mit 12/400 `--muted` für kleine Kennzahl-Beschriftungen in dichten Rastern: `.day-card .stats .k { font-size: var(--fs-12); line-height: var(--lh-12); color: var(--muted); }`. Ein Gewicht wird nicht gesetzt, es bleibt 400 wie heute. Gründe: Die Gewichtsrollen gehören zur Typografie (400 = kleine Kennzahl-Beschriftung, abgestuft gegen den Kachel-Titel 13/500). Außerdem ist 500 breiter und verschärft die Kürzungen (typografie K13, „Disziplin-Kost…“). Die Größe 12 und die Farbe `--muted` sind in beiden Spezifikationen gleich.
- [konflikt: .strat-stats .k] Wie bei `.day-card .stats .k`: `.strat-stats .k { font-size: var(--fs-12); line-height: var(--lh-12); color: var(--muted); }`, Gewicht 400 (nicht gesetzt). Typografie gewinnt (Rolle kleine Kennzahl-Beschriftung 12/400).
- [konflikt: .nb .stats-grid .k] Wie bei `.day-card .stats .k`: `.nb .stats-grid .k { font-size: var(--fs-12); line-height: var(--lh-12); color: var(--muted); }`, Gewicht 400. Gleiche Rolle wie die Kennzahl-Labels in der Tagesansicht, deshalb gleich gesetzt.
- [konflikt: .fw-stats > div > span] `.fw-stats > div > span { font-size: var(--fs-12); line-height: var(--lh-12); color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }`, Gewicht 400. Das entspricht typografie K13; 13/500 bzw. 12/500 wurden dort ausdrücklich abgelehnt, weil die Kürzung „Disziplin-Kost…“ sonst schlimmer wird. Das Raster selbst (zwei bzw. vier Spalten) regelt abstaende-C3, nicht A3c.
- [konflikt: .seg.mini button] Größe 12 statt 11.5: `.seg.mini button { height: 24px; padding: 0 7px; font-size: var(--fs-12); line-height: var(--lh-12); border-radius: 6px; }`. Die übrigen C14b-Änderungen an `.seg.mini` (Schiene `padding: 2px; border-radius: 8px; flex-wrap: nowrap`), `.fd-seg`, `.cert-opts .seg.sm` und `.seg.segc` bleiben. 11.5 px gehört zu den verbotenen Größen der Typografie-Skala. C14b hätte den Wert sonst nach 3.2.3e wieder eingeführt. dashtest.js:25/42 zählt bzw. klickt nur und ist nicht betroffen.
- [konflikt: .cal .d .n] Desktop (Z. 708), Endstand für alle Tage: `.cal .d .n { position: absolute; top: 6px; right: 6px; width: 24px; height: 24px; border-radius: 999px; display: grid; place-items: center; font-size: var(--fs-12); line-height: var(--lh-12); font-weight: 500; background: none; color: var(--text-2); }`; komponenten-C26a schreibt die Regel. Bei der Farbe gilt --text-2 (Farbe und Aufbau). Die Variante „--muted, nur an Handelstagen --text-2“ (Komponenten) entfällt. Grund: Tageszahlen sind Inhalt; --muted ist laut Farbe-Spezifikation Hinweisen, Platzhaltern und Achsen vorbehalten, und es ist eine Regel weniger. ≤960 (Z. 940): `width: 20px; height: 20px; font-size: var(--fs-11); line-height: var(--lh-11);`, top/right 3px bleiben; das schreibt typografie-3.2.3b (Barrierefreiheit hat dieselben Werte). Heute-Kreis und Mini-Kalender entscheiden die Anker .cal .d.today .n und .cal.mini .d.today .n.
- ÄNDERN: Eintrag 708 `.cal .d .n` (11.5 → 12) entfällt, komponenten-C26a schreibt ihn direkt mit var(--fs-12)/var(--lh-12). Rest bleibt.
- [konflikt: .save-state] Ein Baustein für den Speicherstand, überall gleich. CSS: Z. 1030 `.nb .save-state` → `.save-state { font-size: var(--fs-12); line-height: var(--lh-12); color: var(--muted); margin-left: auto; white-space: nowrap; }`, solange die Typo-Tokens fehlen, 12px. Z. 1031 `.nb .save-state.saving` wird ersatzlos gelöscht. „Wird gespeichert …“ ist keine Warnung, --warn steht nur für Warnungen (zustaende Z5, farbe-Grundregel). Druck Z. 1193 `.nb .save-state` → `.save-state`. Neu: `.set-head .save-state { align-self: center; }`, Größe und Farbe aus der allgemeinen Regel. JS: misc.js `head()` setzt in jeden Einstellungen-Kopf `<span class="save-state" aria-live="polite"></span>${trailing}` (S-misc-a). Kein zweiter Span mit `id="set-save"` im Trading-Kopf. Angezeigt wird ausschließlich über `App.savedHint()` (A7), auch in Trading. Dauer 2000 ms (statt 1,5 s), weil der Hinweis im Kopf weit weg vom geänderten Feld steht. Notebook: Text „Wird gespeichert …“ (S-NB3); die Klasse `saving` hat keine Regel mehr und wird nicht mehr gesetzt (kein toter Code). Wie Trading sonst speichert (`save-trading-auto` gegen `data-change="save-trading"` aus komponenten-S-misc-e), entscheidet der Anker des Trading-Formulars.
- ÄNDERN: Der Punkt „1030 `.nb .save-state`“ gilt für die von komponenten-C37a verallgemeinerte Regel `.save-state` (Endzustand `var(--fs-12)`/`var(--lh-12)`). Wer zuletzt umsetzt, stellt diesen Endzustand her.
- [doppelt: .nb .save-state] Alle drei wollen die Notebook-Statuszeile in 12 px. Der Selektor wird zu `.save-state` verallgemeinert (komponenten-C37a), mit `font-size: var(--fs-12); line-height: var(--lh-12)`. Siehe Anker .save-state.
- [konflikt: .field .hint] Am Anker selbst verträglich: Farbe `--muted` (farbe-B3a), Größe `var(--fs-12)`/`var(--lh-12)` (typografie), die neuen Fehlerregeln von S-C3 stehen danach. Ein Widerspruch steckt in S-C3: `:is(.input, .select)[aria-invalid="true"]:focus { box-shadow: 0 0 0 3px var(--loss-soft); }` ist ein Schein-Ring. Das verbieten barrierefreiheit Z1.3 (Felder im Fokus: Rand, `box-shadow: none`; Fehler: Rand --loss) und BRIEF (kein Schein). Endzustand: `:is(.input, .select)[aria-invalid="true"]:focus { border-color: var(--loss); box-shadow: none; }`. `.field-err` bekommt Token-Zeilenhöhe statt 1.35 (typografie: 1.26–1.49 werden ersetzt): `.field-err { font-size: var(--fs-12); line-height: var(--lh-12); color: var(--loss); }`.

## typografie-3.2.3f · --fs-12: 12.5 px → 12 (Hilfstext, Label, kompakt; Farbpaar-Betrag Onest 600; Handy-Tabelle 12)

Gruppe typografie · Cluster tokens · Aufwand L · Befunde: typografie-3, bereich_einstellungen-29
Quelle: audit/spec/typografie.md Z. 249–249 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
- 12.5 → 12 (Hilfstext, Label, kompakt): 503 `.card-sub`, 656 `.bar-row .bl`, 703 `.cal .wd`, 821 `.zone`, 883 `.sym-opt .nm`, 1183 `.nb-figure .cap`, 1294 `.heat-legend`, 1338 `.page-head .ph-note`, 1365 `.fd-pop .fd-pair .input, .fd-pop .fd-pair .fd-unit` (wie die 12-px-Bedienelemente im Filter, Z. 1362–1364), 1381 `.fd-l` (Zeilenhöhe 1.3 → Token), 1461 `.fw-rounds-empty`, 1463 `.fw-lbl`, 1468 `.fw-facts`, 1685 `.ycal-head span`, 1762 `.ym-head`, 1947 `.pair-card .pv i` (dazu 700 → 600 und `font-family: var(--font-num)`, bereich_einstellungen-29), 2190 `.rp-where`, 2210 `.rp-small`, 2258 `.rp-verse-ref`, 2288 `.rp-next`, 2295 `.rp-meta`, 2306 `.rp-content:has(.rp-breath) > .rp-guide`, 2406 `.sr-desc` (Zeilenhöhe 1.35 → Token), 2414 `.sr-num .sr-suf`, 2461 `.rh-sub`, 2493 `.rc-count`, 2613 `.prop-accsel > span`, 2622 `.pf-sub`, 2657 `.cpn-link`, 2668 `.aff-label`, 2705 `.prop-bar .bl`, 2873 `.ce-date`, 2886 `.mentor-note .mn-head`, 2919 `.mr-head b`, 2965 `.stc-l`, 2976 `.cal .d .pm` (`@container` ≤ 77 px), 3044 `.cal .w .pm` (Handy), **3056 `.tbl th, .tbl td` (Handy) → 12** (K12)
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .cal .d .pm] Kurzbetrag am Handy (Z. 3042): `font-weight: 700; font-size: 10.5px; letter-spacing: -.02em;` in Onest (über die Sammelregel), der Rest der Regel bleibt (barrierefreiheit-B14). Gemessen bei 390 px in Onest 700: Das Feld ist 39,7 px breit. „+12,3k€“ braucht bei 10,5/−.02em 37,5 px, bei 11/−.01em 40,2 px und würde abgeschnitten (overflow hidden); „−486€“ 34,0 bzw. 35,5 px. 10,5 ist damit die größte Stufe ohne Abschneiden und liegt deutlich über heute 9,5. Sie kommt als dokumentierte Ausnahme in die Typografie-Ausnahmenliste (wie --fs-10 für Container-Notstufen). Die Onest-Liste schreibt einmal typografie-3.2.2f (enthält .cal .d .pm und .cal .w .pm). Die Container-Stufe ≤77 px (Z. 2976, 12.5 → 12) bleibt bei typografie-3.2.3f.
- [konflikt: .cal .w .pm] Wochenbetrag am Handy (Z. 3044): `display: block; font-weight: 700; font-size: var(--fs-12); line-height: var(--lh-12);` in Onest (typografie-3.2.3f: 12.5 → 12, Onest über 3.2.2f). Barrierefreiheit wollte 12,5 nur gegen eine Verkleinerung auf 11 verteidigen. 12 ist eine Skalenstufe, liegt nur 0,5 px darunter und passt sicher in die Wochenspalte.
- [konflikt: .cal .wd] Das Ergebnis lautet `.cal .wd { text-align: center; padding: 4px 4px 6px; font-size: var(--fs-12); line-height: var(--lh-12); font-weight: 500; color: var(--muted); border: 0; background: none; }`. Z. 704 und Z. 1757 (`.cal .wd.wk`) werden gelöscht. Die Wochentage werden zur Beschriftung ohne Kasten (komponenten-C26a, ki_look-11). Der Kasten ist reine Zierde und konkurriert mit den Tageskacheln, was „Nichts Dekoratives“ widerspricht. Das „Kasten bleibt“ in aufbau ist nicht begründet, und das README legt nichts fest. Größe 12, Gewicht 500 und Farbe --muted sind in allen drei Schritten gleich, die Größe steht als Token. Wenn typografie-3.2.3f Z. 703 vorher tokenisiert, schreibt C26a die Regel mit denselben Tokens neu.
- [konflikt: .ycal-head span] Das Ergebnis lautet `.ycal-head span { text-align: center; padding: 0 2px 6px; font-size: var(--fs-12); line-height: var(--lh-12); font-weight: 500; color: var(--muted); border: 0; }`. Der Kopf des Jahreskalenders wird wie der Monatskalender eine Beschriftung ohne Kasten (gleiche Begründung wie beim Anker .cal .wd). Größe, Gewicht und Farbe stimmen in allen drei Schritten überein.
- [konflikt: .cpn-link] Das Ergebnis lautet `.cpn-link { align-self: flex-start; display: inline-flex; align-items: center; gap: 4px; margin-top: auto; padding-top: var(--sp-1); font-size: var(--fs-12); line-height: var(--lh-12); color: var(--text-2); text-decoration: none; transition: color var(--dur-2) var(--ease); }`. Z. 2658/2659 bleiben. Begründung: 12,5 px ist laut typografie verboten, und der Fußlink ist Hilfstext der Stufe 12. Für das Polster gilt die Skala (abstaende: Abstände nur als var(--sp-n)). Zusammen mit `.cpn { gap: var(--sp-1) }` (abstaende-B28) bleibt der Mindestabstand zur Notiz bei etwa 8 px, wie heute (5 + 4). Die transition bleibt so, wie sie in der Datei steht.
- [konflikt: .fw-lbl] Das Ergebnis lautet `.fw-lbl { font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 500; color: var(--text-2); }`. Begründung: .fw-lbl („Richtig eingeschätzt“, widgets.js:348) steht direkt über dem großen Wert .fw-big. Das ist die Rolle „Wert-Beschriftung 13/500 --text-2“ aus typografie 1.5 (verbindlich) und deckt sich mit .val-label. Die 12er-Liste in 3.2.3f ordnet .fw-lbl nur mechanisch ein.
- ÄNDERN: `1463 .fw-lbl` aus der Liste „12.5 → 12“ streichen. aufbau-A3c schreibt die Regel mit --fs-13.
- [doppelt: .fd-l] Das Ergebnis lautet `.fd-l { display: flex; align-items: baseline; gap: 8px; font-size: var(--fs-12); line-height: var(--lh-12); font-weight: 600; color: var(--muted); }`. Größe und Zeilenhöhe setzt typografie-3.2.3f (12.5 → var(--fs-12), 1.3 → var(--lh-12)), die Farbe setzt komponenten-C05. So überschreibt kein wörtliches `12px` das Token.

## typografie-3.2.3g · --fs-12: übrige 12-px-Regeln auf das Token

Gruppe typografie · Cluster tokens · Aufwand M · Befunde: typografie-3
Quelle: audit/spec/typografie.md Z. 250–251 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
- schon 12 → Token: übrige 12-px-Regeln (z. B. 143, 244, 281, 298, 518, 541, 593, 611, 623, 650, 691, 693, 730, 896, 1003, 1362–1364, 1465, 1479, 1490 span, 1663, 1664, 1674, 1885, 1923, 1964, 2317, 2470, 2489, 2642, 2656, 2670, 2906, 2918, 2994, 3029, 3032, 3081)

```

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: .legend] Alle vier Schritte bleiben, sie ergänzen sich. Ergebnis in app.css: (a) Neue Regel `.chart-legend` aus A4 in Token-Schreibweise: `.chart-legend { display: flex; flex-wrap: wrap; gap: 6px 16px; margin: 0 0 8px; font-size: var(--fs-12); line-height: var(--lh-12); font-weight: 400; color: var(--text-2); }`. Laut Typografie ist Legendentext --fs-12. `span`, `i` und `i.dash` übernimmt A4 unverändert. Die Regeln `.legend.top`, `.legend.rep` und `.legend.rep i` (Z. 1649–1651) werden gelöscht; ob der 13-px-Token-Lauf vorher darüberging, spielt keine Rolle. (b) `.legend` und `.legend i` (Z. 691–692) bleiben für die Fieldset-Überschriften erhalten. 3.2.3g ersetzt dort nur `font-size: 12px` durch `font-size: var(--fs-12); line-height: var(--lh-12)`. Das passt zu „Z. 691–692 bleiben unverändert“ in A4. (c) prop.js `tabBilanz`, Endstand: `const chart = U.card('Ausgaben vs. Payouts', `${bs.series.length ? `<div class="chart-legend"><span><i style="background:var(--loss)"></i>Ausgaben kumuliert</span><span><i style="background:var(--profit)"></i>Payouts kumuliert</span></div>` : ''}<div class="chart h280" data-chart="lines" data-id="prop-balance"></div>`, { info: … })`. Z. 271 setzt S-P2 wie spezifiziert um (Raster nur bei `ex.length || po.length`). J2 ändert Klasse und Position, danach ergänzt S-P2 nur die Bedingung. Die offene Frage diagramme-40/bereich_prop-23 betrifft Zeitachse und Treppe, nicht die Legende, deshalb wird nicht gewartet.
- [doppelt: .tile .head] typografie-3.2.3i übernimmt die Kachel-Titel: `.tile .head { …; font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 500; color: var(--text-2); }` (13.5 → 13). Die Handy-Regel ≤560 (Z. 3029) `font-size: 12px` → `var(--fs-12); line-height: var(--lh-12)` übernimmt 3.2.3g; das ist verträglich. Gewicht 500 für `.stat-tile .k` und `.stat .k` setzt typografie-3.2.4l. Damit ist aufbau-A3b in allen drei Punkten doppelt. Einheitlich gilt: Kachel-Titel überall 13/500 `--text-2`, auch `.stat-tile .k`. 13.5 px ist laut Typografie-Skala verboten.
- [reihenfolge: .fd-pop .fd-tog button] Beide bleiben. 3.2.3g setzt in der Grundregel Z. 1363 `font-size: 12px` → `font-size: var(--fs-12); line-height: var(--lh-12)`. B12d ergänzt den Touch-Block `@media (pointer: coarse)` danach im Quelltext (nach Z. 1365) und setzt die Schrift dort ebenfalls als Token: `.fd-pop .fd-tog button { height: 40px; font-size: var(--fs-13); line-height: var(--lh-13); }`. Grund: Sonst gilt auf Touch 13 px mit der 16-px-Zeilenhöhe aus der Grundregel, und 13px stünde als Rohwert außerhalb der Skala. Die Höhe 40 px bleibt.
- [reihenfolge: .fd-pop .fd-seg button] Wie bei `.fd-pop .fd-tog button`. Grundregel Z. 1362: `font-size: var(--fs-12); line-height: var(--lh-12)` (3.2.3g). Touch-Block von B12d: `.fd-pop .fd-seg button { padding: 10px 12px; font-size: var(--fs-13); line-height: var(--lh-13); }`, im Quelltext nach den Grundregeln.
- [konflikt: .cert-opts .lbl] C05 gewinnt: `.cert-opts .lbl { display: block; margin-bottom: 6px; }`. Größe, Gewicht und Farbe kommen allein aus `.field > .lbl` (Z. 298, das Zertifikat-Label steht als `<span class="lbl">` direkt in `.field`, certificate.js:85). Dort ergibt sich 12/600 `--muted`, durch 3.2.3g als `var(--fs-12)`/`var(--lh-12)`. Grund: Die App soll genau eine Feldbeschriftung haben, ohne Sonderfarbe `--text-2`. Damit gibt es in Z. 1964 keine Schriftgröße mehr, die 3.2.3g auf ein Token umstellen könnte.
- ÄNDERN: Z. 1964 `.cert-opts .lbl` nicht auf das Token umstellen, C05 entfernt dort `font-size`, `font-weight` und `color`. Die Grundregel Z. 298 `.field > label, .field > .lbl` wie geplant auf das Token umstellen.
- [konflikt: .rp-foot .rp-btn.rp-quiet] aufbau-C16 gewinnt inhaltlich: Der Krisenhilfe-Link „Hilfe und Beratung“ ist keine graue 12-px-Fußnote, er soll als Link erkennbar und lesbar sein (bereich_training-50). Die Größe steht aber als Token: `.rp-foot .rp-btn.rp-quiet { font-size: var(--fs-13); line-height: var(--lh-13); color: var(--text-2); text-decoration: underline; text-underline-offset: 3px; padding-left: 0; }` und `.rp-foot .rp-btn.rp-quiet:hover { color: var(--text); }`. Dazu `.rp-foot { … justify-content: flex-start; … }` (am Handy bleibt Z. 2334 zentriert) und `.rp-dlg a` wie in C16. 13 liegt auf der Skala (kleines Steuerelement). rptest.js:11 prüft nur den Text und ist nicht betroffen.
- ÄNDERN: Z. 2317 `.rp-foot .rp-btn.rp-quiet` aus dem 12-px-Token-Lauf herausnehmen. Die Regel wird durch aufbau-C16 zu 13 px (Token).

## typografie-3.2.3h · --fs-13: 12.5 px → 13 für Steuerelemente und Optionskarten (.design-card b, .theme-card b)

Gruppe typografie · Cluster tokens · Aufwand M · Befunde: typografie-3, bereich_einstellungen-28
Quelle: audit/spec/typografie.md Z. 252–254 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
**→ `--fs-13`**
- 12.5 → 13 (Steuerelemente): 236 `.sb-av`, 280 `.btn.sm`, 322 `.seg.pill button`, 581 `.swatch`, 930 `.topbar .actions .btn`, 1009 `.nb .sel-row`, 1038 `.nb .tags-row .tag-add`, 1057 `.nb .tags-row input`, 1124 `.nb-ytpop`, 1367 `.fd-pop .fd-foot .btn`, 1386 `.fd-seg button`, 1388 `.fd-tog button`, 1400 `.fd-chip`, 1407 `.fd-add`, 1497 `.fw-chips button`, 1508 `.tabs.sm button`, 1574 `.w-bar`, 1633 `.tpl-menu .item`, 1653 `.select.sm`, 1678 `.tracker-foot > .btn`, 1711 `.rep-foot .btn.primary`, 1965 `.cert-opts .seg.sm button`, 2308 `.rp-more summary`, 2543 `.seg.segc button`, 2610 `.select.sm.prop-fsel`, 2753 `.prop-tabs a` (schmal), 2864 `.coach-invite .input`, 3106 `.nw-v b`
- 12.5 → 13 (Optionskarten): 1825 `.design-card b`, 1837 `.theme-card b` (bereich_einstellungen-28)
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .fd-chip] .fd-chip ist ein Chip, keine Segment-Taste. Ergebnis: height: 28px; border-radius: 999px; font-size: var(--fs-12); line-height: var(--lh-12); font-weight: 500 (Padding, Rand und Farben wie bisher). Grund: Die Rollentabelle von typografie (Chip = --fs-12) und komponenten (Chips 12px/500) stimmen überein; 13 gilt für Segmente und Menüeinträge. So gleicht der Filter-Chip .chip und .nb .tagpill. Das Gewicht 500 setzen aufbau-A4f, komponenten-C16 und typografie-3.2.4d; komponenten-C16 übernimmt.
- ÄNDERN: .fd-chip (Z. 1400) und .fd-add (Z. 1407) aus der 13-px-Liste streichen. Beide bekommen --fs-12 über komponenten-C16.
- [konflikt: .fd-add] Gleiche Entscheidung wie bei .fd-chip, weil der Hinzufügen-Chip neben den Chips steht und gleich hoch sein muss: height: 28px; border-radius: 999px; font-size: var(--fs-12); line-height: var(--lh-12); font-weight: 500. komponenten-C16 übernimmt. aufbau-A4f, typografie-3.2.3h und typografie-3.2.4d lassen .fd-add aus (Anpassungen wie bei .fd-chip).
- ÄNDERN: .fd-add (Z. 1407) aus der 13-px-Liste streichen.
- [konflikt: .w-bar] Die Leiste über jedem Widget ist flach: `.w-bar { display: flex; align-items: center; gap: 6px; padding: 0; margin-bottom: 6px; border: 0; background: none; }` (aufbau-B13). Das Markup kommt aus aufbau-C6b. `font-size: 12.5px` an .w-bar wird ersatzlos gestrichen und nicht tokenisiert: Ohne .w-name steht in der Leiste kein erbender Text mehr. .seg.mini und .btn.sm setzen eigene Größen, der Griff ist ein Symbol. Damit bleibt keine wirkungslose Deklaration stehen (kilook Z11).
- ÄNDERN: `.w-bar` (Z. 1574) aus der Liste nehmen. Die Größe entfällt über aufbau-B13.
- [konflikt: .prop-tabs a] Die Schiene aus komponenten-C19 ist die einzige Regel für `.tabs > button, .tabs > a, .prop-tabs a`, mit Skalenwerten statt 13.5/12.5 px: `display: inline-flex; align-items: center; height: 34px; padding: 0 12px; border: 1px solid transparent; border-radius: 9px; background: none; color: var(--text-2); font-size: var(--fs-14); line-height: var(--lh-14); font-weight: 500; …` (Rest wie C19). Fokus: `.tabs > button:focus-visible, .tabs > a:focus-visible, .prop-tabs a:focus-visible { outline-offset: -2px; }`, nur der Versatz. Farbe und Stärke kommen aus der globalen :focus-visible-Regel, nach barrierefreiheit-A1 var(--focus), nie --accent. Handy ≤560: `.prop-tabs a { flex: 1 1 auto; justify-content: center; padding: 0 4px; font-size: var(--fs-13); line-height: var(--lh-13); }`. Handy Z. 3054: `.tabs > button, .tabs > a { padding: 0 12px; font-size: var(--fs-13); line-height: var(--lh-13); }`. Gewählt über die gemeinsame Regel am Dateiende mit `.prop-tabs a[aria-current="page"]` (barrierefreiheit-B9b). Erst danach streichen prop.js 304/305 und affiliate.js 51 das aria-pressed (inkl. der Testanpassungen barrierefreiheit.md Z. 905–907). Grund: Reiter = 14/500 laut Typografie-Rollen, 12.5/13.5 sind verboten, Grün nie für Fokus (BRIEF, barrierefreiheit Z1).
- ÄNDERN: `.prop-tabs a` schmal (Z. 2753) nicht einzeln anfassen. komponenten-C19 schreibt die Handy-Regel mit var(--fs-13)/var(--lh-13).
- [konflikt: .tabs.sm button] `.tabs.sm button` (Z. 1508) wird gelöscht (komponenten-C19). Der einzige Nutzer, widgets.js:257 „Letzte Trades / Offene Positionen“, wird über komponenten-W4 zu `.subtabs`. Es wird nichts tokenisiert.
- ÄNDERN: `.tabs.sm button` (Z. 1508) aus der Liste nehmen. Die Regel entfällt über komponenten-C19.
- [doppelt: .fd-seg button] Ergebnis `.fd-seg button { …; font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 500; … }`. Das Gewicht 600 → 500 setzt typografie-3.2.4d als Gewichts-Sweep für alle Filter-Bausteine (.fd-seg button, .fd-tog button, .fd-chip, .fd-add), die Größe typografie-3.2.3h. Von komponenten-C14b bleiben `.fd-seg { gap: 2px; background: var(--surface-2); }` und die Löschungen.
- [doppelt: .fd-tog button] Wie bei .fd-seg button: 500 über typografie-3.2.4d, Größe var(--fs-13)/var(--lh-13) über typografie-3.2.3h. aufbau-A4f ändert das Gewicht nicht noch einmal.
- [doppelt: .nb-ytpop] Ergebnis `.nb-ytpop { …; border: 1px solid var(--border-2); border-radius: 12px; …; font-size: var(--fs-13); line-height: var(--lh-13); }`. Rand und Radius setzt komponenten-C22, die Größe typografie-3.2.3h.
- [konflikt: .seg.pill button] `.seg.pill button` wird gelöscht (komponenten-C14a). Der Check-in wird über komponenten-A6 zur `.scale5`. Die Mindestgröße des Check-ins aus barrierefreiheit bleibt erhalten, sitzt aber am neuen Baustein: `.scale5:not(.rating) button { width: 36px; height: 36px; }` und im Block `@media (max-width: 560px)`: `.scale5:not(.rating) button { width: 44px; height: 44px; }`. Die Bewertungssterne (.scale5.rating) bleiben bei 32. Grund: eine Bauart je Rolle (komponenten K24) und die ausdrückliche Touch-Vorgabe Check-in 36/44 (barrierefreiheit Z5).
- ÄNDERN: `.seg.pill button` (Z. 322) aus der Liste nehmen, weil die Regel entfällt. Die neue `.scale5 button`-Regel (komponenten-C15) schreibt ihre 13 px gleich als `font-size: var(--fs-13); line-height: var(--lh-13);`.
- [konflikt: .select.sm] Ergebnis `.select.sm { padding: 7px 28px 7px 10px; font-size: var(--fs-13); line-height: var(--lh-13); border-radius: 9px; width: auto; }`. Das ergibt genau 34 px (18 + 14 + 2), die sm-Stufe. Auf Touch bleibt `@media (pointer: coarse) { .select.sm { padding-top: 10px; padding-bottom: 10px; } }`, das ergibt 40 px. Die neue `.input.sm` aus komponenten-C03 nutzt ebenfalls die Skala statt 12.5 px: `.input.sm { height: 34px; padding: 0 10px; font-size: var(--fs-13); line-height: var(--lh-13); border-radius: 9px; }`. Grund: 12.5 px ist in der Typografie-Skala verboten, sm-Felder = 13 wie .btn.sm.
- [konflikt: .seg.segc button] Toter Code (kein `segc` in js/ oder HTML): komponenten-C14b löscht Z. 2542–2545 und den Handy-Teil in Z. 2754. Nicht tokenisieren.
- ÄNDERN: `.seg.segc button` (Z. 2543) aus der Liste nehmen, weil die Regel gelöscht wird.
- [konflikt: .cert-opts .seg.sm button] komponenten-C14b löscht Z. 1965–1966. Das ist kein toter Code: certificate.js:73 rendert `.seg.sm` in `.cert-opts`. Die Format-Schalter erben danach aber die neue Segment-Grundregel aus C14a (34 px, 13 px, 500), und genau das ist gewollt (eine Bauart). Das <small> in den Tasten erbt 500. Nicht tokenisieren.
- ÄNDERN: `.cert-opts .seg.sm button` (Z. 1965) aus der Liste nehmen, weil die Regel gelöscht wird.
- [konflikt: .rep-foot .btn.primary] Z. 1711 wird ersatzlos gelöscht. Es gibt weder eine umbenannte Regel `.rep-foot .rep-add { font-size: 12.5px; }` noch eine tokenisierte Variante. Der Knopf ist nach farbe (widgets.js:223) `btn sm rep-add` und hat über .btn.sm bereits var(--fs-13). Eine eigene Größe wäre wirkungslos bzw. mit 12.5 px skalenwidrig.
- ÄNDERN: `.rep-foot .btn.primary` (Z. 1711) aus der Liste nehmen, weil die Regel entfällt.
- [konflikt: .nb .tags-row input] Toter Code (.tags-row enthält kein input, notebook.js:77): kilook-C2 löscht Z. 1057 und 1059. Nicht tokenisieren.
- ÄNDERN: `.nb .tags-row input` (Z. 1057) aus der Liste nehmen, weil die Regel gelöscht wird.
- [konflikt: .tpl-menu .item] komponenten-C23 löscht `.tpl-menu .item { padding: 7px 10px; font-size: 12.5px; }`. Die Einträge erben Maß und Größe von `.popover .item` (Menüeintrag 13 = var(--fs-13), min. 36 px). Nicht tokenisieren.
- ÄNDERN: `.tpl-menu .item` (Z. 1633) aus der Liste nehmen, weil die Regel gelöscht wird.

## typografie-3.2.3i · --fs-13: 13.5 → 13 für Kachel-Titel, .set-head p und Konto-Menü (.sb-menu .item erbt 13 von .popover .item)

Gruppe typografie · Cluster tokens · Aufwand S · Befunde: bereich_dashboard-44, typografie-3, typografie-31
Quelle: audit/spec/typografie.md Z. 255–255 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
- 13.5 → 13: 517 `.tile .head` (bereich_dashboard-44, typografie-3), 1816 `.set-head p`, 254 `.sb-menu-row` (typografie-31); Z. 250 `.sb-menu .item`: `font-size: 13.5px;` **löschen** (erbt 13 von `.popover .item`, Z. 334) (typografie-31, K1)
```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .tile .head] typografie-3.2.3i übernimmt die Kachel-Titel: `.tile .head { …; font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 500; color: var(--text-2); }` (13.5 → 13). Die Handy-Regel ≤560 (Z. 3029) `font-size: 12px` → `var(--fs-12); line-height: var(--lh-12)` übernimmt 3.2.3g; das ist verträglich. Gewicht 500 für `.stat-tile .k` und `.stat .k` setzt typografie-3.2.4l. Damit ist aufbau-A3b in allen drei Punkten doppelt. Einheitlich gilt: Kachel-Titel überall 13/500 `--text-2`, auch `.stat-tile .k`. 13.5 px ist laut Typografie-Skala verboten.
- [doppelt: .set-head p] typografie-3.2.3i übernimmt die Größe: `.set-head p { margin-top: 4px; font-size: var(--fs-13); line-height: var(--lh-13); }`. typografie-3.2.5f ist verträglich und fügt die neue Regel `.set-head p, .set-block .small { max-width: 68ch; }` hinzu. aufbau-A4b setzt dieselbe Größe 13 ohne Token und entfällt hier.
- [doppelt: .sb-menu .item] komponenten-C21b übernimmt und löscht Z. 250 vollständig (`.sb-menu .item { font-size: 13.5px; color: var(--text-2); }` und `.sb-menu .item:hover { color: var(--text); }`). `.sb-menu .item.on` (Z. 251) bleibt. Die Einträge im Konto-Menü erben dann alles von `.popover .item`: min. 36 px, Padding 0 10px, 13/500, `--text` (nach C21a; Token aus typografie-3.2.3l). Das ist dieselbe Menügröße wie in allen anderen Popovern (typografie K1). Das Löschen nur von `font-size` in 3.2.3i ist darin enthalten.
- ÄNDERN: Die Teile Konto-Menü streichen: weder Z. 250 `.sb-menu .item` (C21b löscht die ganze Regel) noch Z. 254 `.sb-menu-row` (C21b übernimmt die Regel mit Token) anfassen. `.tile .head` und `.set-head p` bleiben in 3.2.3i.
- [doppelt: .sb-menu-row] Diese Regel gehört komplett zu komponenten-C21b. Endstand: `.sb-menu-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 4px 6px 4px 10px; font-size: var(--fs-13); line-height: var(--lh-13); color: var(--text-2); }`. Der Innenabstand links ist 10 wie bei `.popover .item`. Die Größe 13 steht als Token. typografie-3.2.3i fasst die Regel nicht an.
- ÄNDERN: Die Teile Konto-Menü streichen: weder Z. 250 `.sb-menu .item` noch Z. 254 `.sb-menu-row` anfassen, beide macht komponenten-C21b.
