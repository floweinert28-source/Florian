# Paket 002 · tokens

Schritte: 27 · Dateien: scratchpad/localfonts.js, web/README.md, web/css/app.css, web/css/landing.css, web/e2e/localfonts.js, web/js/ui.js
Betroffene Tests laut Spezifikation: Akzeptanz 4.1 Nr. 2–3; Akzeptanz 4.3 Kopfzeile 1024 (Knöpfe 14 px ohne Umbruch); Akzeptanz 4.3 dashboard/stats_summary/trades (Kachelwerte 24); Akzeptanz 4.3 index.html (sieht aus wie vorher); Akzeptanz 4.3 ruhepunkt („Vor dem Trading“ 15/600); Akzeptanz 4.3 shadow/leer_shadow/leer_progress (Intro und Leer-Titel 15/600); Akzeptanz 4.3 sidebar (Navigation 14/500); anpassen in kilook-C27: e2e/proptest.js:55 (Erwartung baut Balance über UI.fmt.cur); prüfen: e2e/friedhoftest.js:122 (Konto ohne Größe „—“); prüfen: e2e/mobiletest.js (Kacheln bei Zeitraum „Gesamt“ mit P&L ≥ 10.000 bei 1024/390 px ohne Überlauf); web/e2e/coachtest.js; web/e2e/headtest.js (Kopfreihe Handy); web/e2e/headtest.js:60–64 (Navigation weiter 500); web/e2e/langtest.js:33 (Überlauf .btn, .tabs button, .seg button); web/e2e/localfonts.js:5–6; web/e2e/mentortest.js; web/e2e/newstest.js; web/e2e/replaytest.js; web/e2e/rptest.js; web/e2e/rptest.js (.rp-bigtime); web/e2e/settest2.js:22; web/e2e/shadowtest.js; web/e2e/streaktest.js; web/e2e/voicetest.js
Baut auf Paketen auf: 1

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## typografie-3.2.3m · --fs-14: 13.5 px → 14 (Knopf, Eingabe, Reiter, Listen-Titel u. a.; .coach-nrow b entfällt später über 3.2.4 Zeilentitel)

Gruppe typografie · Cluster tokens · Aufwand L · Befunde: typografie-3
Quelle: audit/spec/typografie.md Z. 260–261 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
**→ `--fs-14`**
- 13.5 → 14: Z. 267–270 `.btn`, 289–291 `.input, .select, textarea.input` (Zeilenhöhe von `textarea.input` 1.5 bleibt), 429 `.dp-month`, 450 `.cp-hex`, 660 `.tabs button`, 845 `.inp-cur .cur-sym`, 862 `.dir-opt`, 881 `.sym-opt`, 978 `.nb .folder`, 1001 `.nb .note-item b`, 1478 `.fw-acc-n b`, 1586 `.add-slot`, 1611 `.sp-item b`, 1720 `.rep-it`, 2203 `.rp-guide` (1.7 bleibt), 2214 `.rp-btn`, 2224 `.rp-l`, 2261 `dl.rp-summary dt`, 2294 `.rp-breath .rp-hint`, 2328 `.rp-list .rp-li-main b`, 2359 `.mentor-err`, 2412 `.sr-num .input`, 2590 `.prop-tabs a`, 2595 `.prop-sub a`, 2640 `.pfm-top b`, 2763 `.prop-patterns, .prop-highlights` (1.45 → Token), 2921 `.mr-text` (1.5 bleibt), 2949 `.coach-nrow b`, 2953 `.coach-co-what`, 3088 `.nw-row`
```

## typografie-3.2.3n · --fs-14: 14.5 px → 14 (Navigation, Ruhepunkt-Texte, Notiz-/Chat-Text)

Gruppe typografie · Cluster tokens · Aufwand M · Befunde: typografie-31, typografie-3
Quelle: audit/spec/typografie.md Z. 262–262 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
- 14.5 → 14: Z. 169–172 `.nav a, .nav button` (typografie-31), 786 `.note-body` (1.65 bleibt), 2141 `.rp` (1.55 bleibt), 2198 `.rp-open > .rp-guide`, 2206 `ol.rp-visual` (1.6 bleibt), 2227 `.rp-sl-head .rp-l`, 2236 `.rp input…, .rp textarea`, 2249 `.rp-ampel strong`, 2266 `.rp-checks label`, 2349 `.msg` (1.55 bleibt), 2875 `.ce-body.ql-container`
```

## typografie-3.2.3p · --fs-14: übrige 14-px-Regeln auf das Token

Gruppe typografie · Cluster tokens · Aufwand M · Befunde: typografie-3
Quelle: audit/spec/typografie.md Z. 264–265 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
- schon 14 → Token: übrige 14-px-Regeln (z. B. 243, 1015, 1273, 1490 b, 1629, 1715, 1807, 1867, 1879, 1930, 2247, 2320, 2405, 2480, 2517, 2572, 2888, 2927)

```

## typografie-3.2.3q · --fs-15/600: Titel von 14.5/16/18 px auf 15 (u. a. .rp-callout h3, .rp-choice .rp-name, .fw-empty b)

Gruppe typografie · Cluster tokens · Aufwand S · Befunde: typografie-3, bereich_training-46
Quelle: audit/spec/typografie.md Z. 266–269 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
**→ `--fs-15`**
- 14.5 → 15/600: Z. 356 `.rr-m-title`, 409 `.dp-title`, 473 `.dp-tval`, 1348 `.fd-pop .sp-head h2`
- 16 → 15/600: Z. 1450 `.fw-empty b`, Z. 2187 `.rp-choice .rp-name` (700 → 600, bereich_training-46)
- 18 → 15/600: Z. 2253 `.rp-callout h3` (700 → 600, K4), Z. 2477 `.rh-empty .card-title`
```

## typografie-3.2.3s · --fs-15: übrige 15-px-Regeln auf das Token (dazu 600 bei .empty b, .rp-sub, .shadow-intro b, .prop-title b, .prop-group-title b)

Gruppe typografie · Cluster tokens · Aufwand M · Befunde: typografie-3
Quelle: audit/spec/typografie.md Z. 271–272 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
- schon 15 → Token: 491 `.card-title`, 677 `.empty b` (dazu 600), 890, 907, 1374, 1502, 2209 `.rp-sub` (700 → 600), 2395 `.shadow-intro b` (dazu 600), 2530, 2537, 2576, 2607, 2621, 2647, 2692 (dazu 600), 2715 (dazu 600), 3075

```

## typografie-3.2.3t · --fs-18: h2-Titel von 17/19/20 px auf 18 (Dialog, Seitenpanel, Coach/Mentor-Einrichtung, Handy-h1)

Gruppe typografie · Cluster tokens · Aufwand S · Befunde: typografie-3, bereich_training-46
Quelle: audit/spec/typografie.md Z. 273–276 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
**→ `--fs-18`**
- 17 → 18: Z. 925 `.topbar h1` (Handy), Z. 2874 `.ce-title`
- 19 → 18: Z. 831 `.modal-head h2`, Z. 1602 `.side-panel .sp-head h2`, Z. 2293 `.rp-breath .rp-phase` (700 → 600, bereich_training-46)
- 20 → 18: Z. 2342 `.mentor-setup h2`, Z. 2852 `.coach-title`, Z. 2894 `.coach-join-head h2`
```

## typografie-3.2.3w · --fs-18: vorhandene 18-px-Regeln auf das Token (.ql-editor.ql-blank::before, .rp-x lh 1 bleibt)

Gruppe typografie · Cluster tokens · Aufwand S · Befunde: typografie-3
Quelle: audit/spec/typografie.md Z. 279–280 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
- schon 18 → Token: 1130 `.ql-editor.ql-blank::before`, 2331 `.rp-x` (lh 1 bleibt)

```

## typografie-3.2.3y · --fs-21: .topbar h1 und .rp-verse (Zeilenhöhe 1.45 bleibt) auf das Token

Gruppe typografie · Cluster tokens · Aufwand S · Befunde: typografie-3
Quelle: audit/spec/typografie.md Z. 284–285 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
- schon 21 → Token: 215 `.topbar h1`, 2257 `.rp-verse` (Zeilenhöhe 1.45 bleibt, Ausnahme)

```

## typografie-3.2.3-fv14 · Werte-Skala --fv-14 (Leisten- und Listenwerte, .stc-col > b im 300-px-Container)

Gruppe typografie · Cluster tokens · Aufwand S · Befunde: typografie-3
Quelle: audit/spec/typografie.md Z. 289–293 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
**→ `--fv-14`**
- Z. 1036 `.nb .stats-grid .v` 13.5 → 14
- Z. 2970 `.stc-col > b` in `@container (max-width: 300px)` 14.5 → 14 (K11)
- schon 14 → Token: 794 `.strat-stats .v`, 911 `.day-card .stats .v`, 1480 `.fw-acc-v`, 2641 `.pfm-top span`

```

## typografie-3.2.3-fv16 · Werte-Skala --fv-16 (Widget-Kleinwerte, Schieberegler, News-Countdown)

Gruppe typografie · Cluster tokens · Aufwand M · Befunde: typografie-3
Quelle: audit/spec/typografie.md Z. 294–299 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
**→ `--fv-16`**
- 17 → 16: Z. 2233 `.rp-range-val` (lh 1 bleibt), Z. 3077 `.nw-next-when b`
- 18 → 16: Z. 815 `.slider .sv`, 2533 `.replay-verdict`, 2701 `.prop-balance .val.sm`
- 19 → 16: Z. 1506 `.streak-ring` · 20 → 16: Z. 2500 `.replay-meta .sym`
- schon 16 → Token: 908 `.day-card .head .pnl`, 1456 `.fw-stats b`, 1690 `.yc.year b`, 2967 `.stc-col > b`

```

## typografie-3.2.3-fv24 · Werte-Skala --fv-24 (Kachelwert, Prop-Saldo, Trade-Detail-Kopf, Schatten-Ich, Coach)

Gruppe typografie · Cluster tokens · Aufwand M · Befunde: typografie-3
Quelle: audit/spec/typografie.md Z. 305–314 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
**→ `--fv-24`**
- 25 → 24: Z. 540 `.tile .val`
- 22 → 24: Z. 649 `.stat .v`, Z. 1679 `.tracker-foot .score-n`
- 21 → 24: Z. 2945 `.coach-gs-tiles .tile .val`
- 26 → 24: Z. 747 `.detail-head .sym`, 748 `.detail-head .big`, 2446 `.shadow-tiles .tile.shadow-main .val` (Handy), 2700 `.prop-balance .val`, 2208 `ol.rp-visual li::before` (lh 1 bleibt)
- 34 → 24: Z. 2397 `.shadow-tiles .tile.shadow-main .val`
- 30 → 24: Z. 1307 `.tilt-stats .v` (≤ 960); `.v.cur` dort bleibt 24 → Token
- Z. 1735 `.tile.spark-tile .val`: siehe 3.2.5 (erbt `.tile .val`)
- schon 24 → Token: 639 `.stat-tile .v` (Laufweite −0.01em → `--ls-val`), 1644 `.streak-tile .val` (Container), 2684 `.prop-tiles .tile .val`

```

## typografie-3.2.3-fv32 · Werte-Skala --fv-32 (.score-big, Tilt-Werte, Sprach-Timer, Replay)

Gruppe typografie · Cluster tokens · Aufwand S · Befunde: typografie-3
Quelle: audit/spec/typografie.md Z. 315–320 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
**→ `--fv-32`**
- 30 → 32: Z. 577 `.score-big`, Z. 2571 `.voice-time`
- 34 → 32: Z. 1297 `.big-stat` (≤ 960), Z. 2540 `.replay-big`
- 40 → 32: Z. 1303 `.tilt-stats .v` · 46 → 32: Z. 2551 `.rh-big` (Handy)
- schon 32 → Token: 1304 `.tilt-stats .v.cur`, 2303 `.rp-bigtime` (lh 1 bleibt)

```

## typografie-3.2.3-fv44 · Werte-Skala --fv-44 (Hero: .streak .big, .fw-big, .rh-big, .big-stat)

Gruppe typografie · Cluster tokens · Aufwand S · Befunde: typografie-3
Quelle: audit/spec/typografie.md Z. 321–324 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
**→ `--fv-44`**
- 42 → 44: Z. 798 `.streak .big` (lh 1 bleibt) · 48 → 44: Z. 1464 `.fw-big` · 56 → 44: Z. 2460 `.rh-big`
- schon 44 → Token: 1203 `.big-stat`

```

## typografie-3.3 · Startseite landing.css: Hero-Titel und Schritt-Nummern 800 → 900

Gruppe typografie · Cluster tokens · Aufwand S · Befunde: typografie-1
Quelle: audit/spec/typografie.md Z. 377–382 · Dateien: web/css/landing.css
Abhängig von: typografie-3.1

```text
### 3.3 `web/css/landing.css`

| Stelle | vorher → nachher | Befund |
|---|---|---|
| Z. 14 `.lp .hero h1`, Z. 43 `.lp .step .k` | `font-weight: 800` → `font-weight: 900` (sieht aus wie heute, weil 800 bisher als 900 gerendert wurde) | typografie-1 |

```

## typografie-3.9 · Test-Helfer localfonts.js: Satoshi als variable Schrift 300–900 einbinden (Datei nicht ins Repository)

Gruppe typografie · Cluster tokens · Aufwand S · Befunde: typografie-1
Quelle: audit/spec/typografie.md Z. 447–452 · Dateien: web/e2e/localfonts.js, scratchpad/localfonts.js
Abhängig von: —

```text
### 3.9 Test-Helfer für lokale Schriften

| Datei | Änderung | Befund |
|---|---|---|
| `web/e2e/localfonts.js` Z. 5–6 und `scratchpad/localfonts.js` | `const sat = [[400,'Regular'],[500,'Medium'],[700,'Bold'],[900,'Black']].map(…)` → `const sat = "@font-face{font-family:'Satoshi';src:url('https://cdn.fontshare.com/local/Satoshi-Variable.woff2') format('woff2');font-weight:300 900;font-style:normal;font-display:swap}";` und den Kommentar auf „variable Schrift 300–900“ ändern. `Satoshi-Variable.woff2` liegt schon in `scratchpad/fonts-local/`. Nicht ins Repository legen (Lizenz, README Z. 173–175). | typografie-1 |

```

## abstaende-A1 · Abstands-Token in :root nach --gutter einfügen (--sp-1 … --sp-10, --content-gap, --grid-gap, --pad-card, --w-chat/--w-news/--w-read/--w-single); Abschnitt-3-Vorspann mit Reihenfolge und Prüfablauf

Gruppe abstaende · Cluster tokens · Aufwand S · Befunde: abstaende_layout-1
Quelle: audit/spec/abstaende.md Z. 293–303 · Dateien: web/css/app.css
Abhängig von: —

```text
## 3. Umsetzungsschritte

Reihenfolge: A Token und Basis → B Komponenten → C Raster und Seitenlayout → D Einzelstellen in CSS → E–O JavaScript → P Startseite → Q Übersetzungen → R Tests → S README. Innerhalb von app.css erst A, dann B, C, D. Nach jedem Block: `bash web/e2e/runall.sh` und Sichtprüfung der Seiten in Abschnitt 4. Am Ende von app.css stehen danach die Hilfsklassen (A6).

### web/css/app.css

**A – Token und Basis**

| Nr. | Stelle | vorher → nachher | Befunde |
|---|---|---|---|
| A1 | `:root`, nach `--gutter: 24px;` (Z. 52) | Token aus 1.1 einfügen (`--sp-1` … `--sp-10`, `--content-gap`, `--grid-gap`, `--pad-card`, `--w-chat`, `--w-news`, `--w-read`, `--w-single`). | abstaende_layout-1 |
```

## abstaende-A2 · .row: gap 10px → var(--sp-2)

Gruppe abstaende · Cluster tokens · Aufwand S · Befunde: abstaende_layout-1, abstaende_layout-34
Quelle: audit/spec/abstaende.md Z. 304–304 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
| A2 | `.row` (Z. 127) | `gap: 10px` → `gap: var(--sp-2)` | abstaende_layout-1, -34 |
```

## abstaende-A3 · .stack: gap 10px → var(--sp-3)

Gruppe abstaende · Cluster tokens · Aufwand S · Befunde: abstaende_layout-1, abstaende_layout-34
Quelle: audit/spec/abstaende.md Z. 305–305 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
| A3 | `.stack` (Z. 129) | `gap: 10px` → `gap: var(--sp-3)` | abstaende_layout-1, -34 |
```

## abstaende-A6 · Hilfsklassen der Abstandsskala am Dateiende anfügen (.s-*, .mt-*, .mb-*, .ml-auto) mit Kommentar

Gruppe abstaende · Cluster tokens · Aufwand S · Befunde: abstaende_layout-34
Quelle: audit/spec/abstaende.md Z. 308–308 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
| A6 | Ende der Datei (nach Z. 3144) | Hilfsklassen aus 1.16 anfügen (`.s-*`, `.mt-*`, `.mb-*`, `.ml-auto`). Kommentar: „Hilfsklassen der Abstandsskala; stehen am Ende, damit sie Komponenten-Abstände überschreiben“. | abstaende_layout-34 |
```

## abstaende-S1 · README: neuer Abschnitt „Abstände“ nach „Bewegung und Übergänge“ (Skala, Zuordnung, Container, Breiten, Ausnahmen, Inline-Regel, Wertlinie)

Gruppe abstaende · Cluster tokens · Aufwand M · Befunde: abstaende_layout-1, abstaende_layout-34
Quelle: audit/spec/abstaende.md Z. 526–530 · Dateien: web/README.md
Abhängig von: abstaende-A1, abstaende-A6

```text
### web/README.md

| Nr. | Stelle | Änderung | Befunde |
|---|---|---|---|
| S1 | neuer Abschnitt „Abstände“ nach „Bewegung und Übergänge“ | Skala (1.1), Zuordnung (Tabelle 1.2), Container (Tabelle 1.3), Breiten (1.11), Ausnahmen (1.12), Regel „keine Inline-Abstände in JS-Vorlagen außer berechneten Werten; Hilfsklassen `.s-n`, `.mt-n`, `.mb-n`“, Wertlinie der Kacheln (1.6) | abstaende_layout-1, -34 |
```

## aufbau-A1 · Token --tile-val anlegen (24/22/20 px)

Gruppe aufbau · Cluster tokens · Aufwand S · Befunde: typografie-6, bereich_prop-30
Quelle: audit/spec/aufbau.md Z. 245–255 · Dateien: web/css/app.css
Abhängig von: —

```text
## 3. Umsetzungsschritte

Reihenfolge: **A** Tokens und Skalen → **B** Komponenten → **C** Einzelstellen → **D** Übersetzungen, README, Tests. Zeilennummern beziehen sich auf HEAD `677b630`; wenn andere Spezifikationen vorher Zeilen verschieben, gelten die genannten Selektoren und Funktionen.

### A – Tokens und Skalen (`web/css/app.css`)

**A1 Token für Kachelwerte** · typografie-6, bereich_prop-30
- `:root` (nach Z. 51 `--page-head-h`): neu `--tile-val: 24px;`
- Im Block `@media (max-width: 960px)` (ab Z. 916): neu `:root { --tile-val: 22px; }`
- Im Block `@media (max-width: 560px)` (ab Z. 2978): neu `:root { --tile-val: 20px; }`

```

## zustaende-S-C1 · Token --disabled-o: .4 in :root anlegen

Gruppe zustaende · Cluster tokens · Aufwand S · Befunde: zustaende-35
Quelle: audit/spec/zustaende.md Z. 231–241 · Dateien: web/css/app.css
Abhängig von: —

```text
## 3. Umsetzungsschritte

Reihenfolge: erst app.css (Tokens → Komponenten → Einzelstellen), dann `ui.js` (Formatierung und Bausteine), dann die übrigen Dateien. Jeder Schritt nennt die Befund-ids.

### 3.1 `web/css/app.css`

#### Tokens

**S-C1 Token Deaktiviert** – zustaende-35
In `:root` nach Z. 47 (`--ease: …`) neu: `--disabled-o: .4;` (gilt für alle Designs).

```

## barrierefreiheit-A1 · Token --focus in :root anlegen (inkl. Einleitung Abschnitt 3)

Gruppe barrierefreiheit · Cluster tokens · Aufwand S · Befunde: farbe_kontrast-14
Quelle: audit/spec/barrierefreiheit.md Z. 245–257 · Dateien: web/css/app.css
Abhängig von: —

```text
## 3. Umsetzungsschritte

Reihenfolge: **A Tokens → B Komponenten → C Einzelstellen → D Wörterbücher → E Tests und README.** Innerhalb jeder Phase nach Datei. Zeilen = aktueller Stand.

### Phase A – Tokens

#### `web/css/app.css`

**A1 Token `--focus`** (`:root`, nach Z. 28 `--accent-glow`)
- vorher: –
- nachher: `--focus: var(--text); /* Tastatur-Fokus: neutral, in jedem Design ≥ 3:1 (gilt auch hell, weil --text je Design gesetzt ist) */`
- Befunde: farbe_kontrast-14

```

## kilook-A1 · fmt.cur ohne Größenschwelle (Cent auch ab 10.000); Bereich enthält die Reihenfolge-Vorbemerkung von Abschnitt 3

Gruppe kilook · Cluster tokens · Aufwand S · Befunde: diagramme-32
Quelle: audit/spec/kilook.md Z. 366–380 · Dateien: web/js/ui.js
Abhängig von: —

```text
## 3. Umsetzungsschritte

**Reihenfolge:**
1. Phase A: Skalen und Tokens
2. Phase B: Komponenten
3. Phase C: Einzelstellen, nach Datei

Innerhalb einer Phase stehen die Schritte nach Datei sortiert. C25 (sparkle löschen) muss nach C12–C15 kommen.

### Phase A · Skalen und Tokens

**A1 · web/js/ui.js:122 · `fmt.cur` – Genauigkeit** (diagramme-32)
- vorher: `const a = Math.abs(v); const d = o.compact ? 0 : (a >= 10000 ? 0 : 2);`
- nachher: `const a = Math.abs(v); const d = o.compact ? 0 : 2;`

```

## kilook-A2 · fmt.balance: Bestände ganzzahlig (compact: true als Standard)

Gruppe kilook · Cluster tokens · Aufwand S · Befunde: diagramme-32
Quelle: audit/spec/kilook.md Z. 381–393 · Dateien: web/js/ui.js
Abhängig von: —

```text
**A2 · web/js/ui.js:117–118 · `fmt.balance` – Bestände ganzzahlig** (diagramme-32)
- vorher:
  ```js
  /* Kontostand: im Geld-blind-Modus komplett ausgeblendet */
  balance(v, o = {}) { return blind.on ? (…) : fmt.cur(v, o); },
  ```
- nachher:
  ```js
  /* Kontostand und andere Bestände: ganzzahlig, ohne Vorzeichen; im Geld-blind-Modus komplett ausgeblendet */
  balance(v, o = {}) { return blind.on ? (…) : fmt.cur(v, Object.assign({ compact: true }, o)); },
  ```
- Wirkt auf widgets.js:168 (Kontostand-Kachel), widgets.js:358 (Prop-Widget), prop.js:102, prop.js:283 und prop-friedhof.js:136.

```

## kilook-A3 · Regel-Kommentar über U.pnl (Ergebnisse immer mit Vorzeichen, kein signed: false)

Gruppe kilook · Cluster tokens · Aufwand S · Befunde: diagramme-35
Quelle: audit/spec/kilook.md Z. 394–397 · Dateien: web/js/ui.js
Abhängig von: —

```text
**A3 · web/js/ui.js:165 · Regel zu `U.pnl`** (diagramme-35)
- Direkt über `const pnl = …` einfügen:
  `/* Ergebnisse (P&L, Erwartungswert, Ø Gewinn/Verlust) immer mit Vorzeichen; Bestände laufen über fmt.balance ohne Vorzeichen. signed: false hier nicht übergeben. */`

```

## kilook-A4 · Neue Typo-Rolle .kpi-label hinter .caption

Gruppe kilook · Cluster tokens · Aufwand S · Befunde: ki_look-36
Quelle: audit/spec/kilook.md Z. 398–401 · Dateien: web/css/app.css
Abhängig von: —

```text
**A4 · web/css/app.css:101 · neue Rolle `.kpi-label`** (ki_look-36)
- Hinter die Zeile mit `.caption { … }` einfügen:
  `.kpi-label { font-size: 13px; line-height: 18px; font-weight: 500; color: var(--text-2); } /* Beschriftung direkt über einem Wert, Satzschreibung; .caption bleibt für Abschnittslabels */`

```
