# Paket 001 · tokens

Schritte: 21 · Dateien: web/app.html, web/css/app.css, web/index.html, web/js/theme.js
Betroffene Tests laut Spezifikation: Akzeptanz 4.1 Nr. 1–3 (grep satoshi@, Canvas-Breiten 500/600/700, document.fonts weight "300 900"); Akzeptanz 4.2 Nr. 1–2 (grep font-size px); Akzeptanz 4.2 Nr. 2 und Nr. 5; Akzeptanz 4.2 Nr. 5 (Zeilenhöhen ganzzahlig); Akzeptanz 4.3 dashboard (Schatten-Ich-Widget-Labels 12 px, Kürzung nicht schlimmer, K13), day (Kennzahl-Labels 12 px); Akzeptanz 4.3 dashboard 1280 (Kalenderzellen ohne Überlauf); Akzeptanz 4.3 dashboard 390 (Beträge 11 px mit €, Tageszahl 11 px im 20-px-Kreis, Heute-Kreis sichtbar); Akzeptanz 4.3 settings_design (+240 € in Onest 600); Akzeptanz 4.3 settings_design (Theme-/Designkarten 13/600); Akzeptanz 4.3 sidebar, pop_konto (Menüeinträge 13 wie andere Menüs), dashboard (Kachel-Titel 13/500); Akzeptanz 4.4: grep -n "tbl th.r" web/css/app.css ohne Treffer; E1-Screenshots dashboard, settings_profil, prop (dunkel 1440); E1: Gewichtsmessung 4.1, Screenshots dashboard/settings_profil/prop dunkel 1440, web/e2e/settest2.js; E2: Atlas dunkel 1440+390, web/e2e/mobiletest.js, web/e2e/tlfittest.js, Kopfzeile 1024; E3: Atlas dunkel 1440/1024/390, Kalender 1280 und 390; E4: web/e2e/runall.sh, node --test web/tests/*.mjs; E5: Akzeptanz 4.1–4.5; Screenshot news (14:15 so breit wie 14:30), prop_bilanz (Pro Firma bündig); Screenshot prop: 111.262,00 $ in Onest; Screenshots trades, prop_bilanz, settings_konten, settings_logs, affiliate (Kopf Satoshi, Datum Onest); web/e2e/colorpickertest.js (prüfen); web/e2e/mobiletest.js; web/e2e/mobiletest.js (Handy-Tabelle ohne Überlauf); web/e2e/rptest.js; web/e2e/settest2.js:22 (Satoshi geladen); web/e2e/settest2.js:43–47 (prüfen); web/e2e/settest2.js:47 (Standardfarben zurücksetzen, prüfen)
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

## typografie-3.2.2f · Onest-Sammelregel neu fassen: Tabellenzellen standardmäßig Satoshi, nur td.r/td.c/.num und Wert-Selektoren in Onest

Gruppe typografie · Cluster tokens · Aufwand S · Befunde: typografie-11, typografie-12, bereich_einstellungen-30, bereich_konto-34, responsiv-33, bereich_statistik-17
Quelle: audit/spec/typografie.md Z. 225–225 · Dateien: web/css/app.css
Abhängig von: —

```text
| Z. 1800 **Onest-Sammelregel** | Selektorliste ersetzen durch: `.num, .tbl td.r, .tbl td.c, .tile .val, .kv b, .cal .p, .cal .d .n, .cal .w .p, .cal .d .pm, .cal .w .pm, .stat .v, .big-stat, .score-big, .streak-ring, .yc b, .yc small, .tracker-foot .score-n, .slider .sv, .chart text, .tile .head .n, .tile .gauge-stack .pill, .pills.col .pill, .pg-info, .strat-stats .v, .day-card .pnl, .day-card .stats .v, .detail-head .big, .tilt-stats .v, .ym-head span, .score-scale .lbls, .ticks, .stats-grid .v, .stat-tile .v, .prop-balance .val, .prop-bar .bl b, .fw-stats b, .fw-acc-v, .stc-col > b, .wl-single .lbl, .pfm-top span, .pg-facts dd > .pos, .pg-facts dd > .neg, .pg-facts dd > .neu, .fw-big, .rh-big, .streak .big, .bar-row .bl b { font-family: var(--font-num); }`<br>Entfernt: `.tbl td`, `.tile.spark-tile .val` (deckt `.tile .val` ab), `.pill`, `.tbl th.r`. | typografie-11, typografie-12, bereich_einstellungen-30, bereich_konto-34, responsiv-33, bereich_statistik-17 |
```

## typografie-3.2.2h · font-family: var(--font-display) aus Wert-Regeln löschen (Pflicht bei .prop-balance .val und .rh-big)

Gruppe typografie · Cluster tokens · Aufwand S · Befunde: typografie-11
Quelle: audit/spec/typografie.md Z. 227–228 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.2f

```text
| `font-family: var(--font-display)` in Wert-Regeln | **Pflicht** löschen in `.prop-balance .val` (2700) und `.rh-big` (2460), sonst schlagen sie die Onest-Regel. Zur Klarheit auch löschen in `.tile .val` (540), `.score-big` (577), `.day-card .head .pnl` (908), `.big-stat` (1203), `.fw-big` (1464), `.fw-stats b` (1456), `.tile.spark-tile .val` (1735). | typografie-11 |

```

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

## typografie-3.2.3f · --fs-12: 12.5 px → 12 (Hilfstext, Label, kompakt; Farbpaar-Betrag Onest 600; Handy-Tabelle 12)

Gruppe typografie · Cluster tokens · Aufwand L · Befunde: typografie-3, bereich_einstellungen-29
Quelle: audit/spec/typografie.md Z. 249–249 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
- 12.5 → 12 (Hilfstext, Label, kompakt): 503 `.card-sub`, 656 `.bar-row .bl`, 703 `.cal .wd`, 821 `.zone`, 883 `.sym-opt .nm`, 1183 `.nb-figure .cap`, 1294 `.heat-legend`, 1338 `.page-head .ph-note`, 1365 `.fd-pop .fd-pair .input, .fd-pop .fd-pair .fd-unit` (wie die 12-px-Bedienelemente im Filter, Z. 1362–1364), 1381 `.fd-l` (Zeilenhöhe 1.3 → Token), 1461 `.fw-rounds-empty`, 1463 `.fw-lbl`, 1468 `.fw-facts`, 1685 `.ycal-head span`, 1762 `.ym-head`, 1947 `.pair-card .pv i` (dazu 700 → 600 und `font-family: var(--font-num)`, bereich_einstellungen-29), 2190 `.rp-where`, 2210 `.rp-small`, 2258 `.rp-verse-ref`, 2288 `.rp-next`, 2295 `.rp-meta`, 2306 `.rp-content:has(.rp-breath) > .rp-guide`, 2406 `.sr-desc` (Zeilenhöhe 1.35 → Token), 2414 `.sr-num .sr-suf`, 2461 `.rh-sub`, 2493 `.rc-count`, 2613 `.prop-accsel > span`, 2622 `.pf-sub`, 2657 `.cpn-link`, 2668 `.aff-label`, 2705 `.prop-bar .bl`, 2873 `.ce-date`, 2886 `.mentor-note .mn-head`, 2919 `.mr-head b`, 2965 `.stc-l`, 2976 `.cal .d .pm` (`@container` ≤ 77 px), 3044 `.cal .w .pm` (Handy), **3056 `.tbl th, .tbl td` (Handy) → 12** (K12)
```

## typografie-3.2.3g · --fs-12: übrige 12-px-Regeln auf das Token

Gruppe typografie · Cluster tokens · Aufwand M · Befunde: typografie-3
Quelle: audit/spec/typografie.md Z. 250–251 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
- schon 12 → Token: übrige 12-px-Regeln (z. B. 143, 244, 281, 298, 518, 541, 593, 611, 623, 650, 691, 693, 730, 896, 1003, 1362–1364, 1465, 1479, 1490 span, 1663, 1664, 1674, 1885, 1923, 1964, 2317, 2470, 2489, 2642, 2656, 2670, 2906, 2918, 2994, 3029, 3032, 3081)

```

## typografie-3.2.3h · --fs-13: 12.5 px → 13 für Steuerelemente und Optionskarten (.design-card b, .theme-card b)

Gruppe typografie · Cluster tokens · Aufwand M · Befunde: typografie-3, bereich_einstellungen-28
Quelle: audit/spec/typografie.md Z. 252–254 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
**→ `--fs-13`**
- 12.5 → 13 (Steuerelemente): 236 `.sb-av`, 280 `.btn.sm`, 322 `.seg.pill button`, 581 `.swatch`, 930 `.topbar .actions .btn`, 1009 `.nb .sel-row`, 1038 `.nb .tags-row .tag-add`, 1057 `.nb .tags-row input`, 1124 `.nb-ytpop`, 1367 `.fd-pop .fd-foot .btn`, 1386 `.fd-seg button`, 1388 `.fd-tog button`, 1400 `.fd-chip`, 1407 `.fd-add`, 1497 `.fw-chips button`, 1508 `.tabs.sm button`, 1574 `.w-bar`, 1633 `.tpl-menu .item`, 1653 `.select.sm`, 1678 `.tracker-foot > .btn`, 1711 `.rep-foot .btn.primary`, 1965 `.cert-opts .seg.sm button`, 2308 `.rp-more summary`, 2543 `.seg.segc button`, 2610 `.select.sm.prop-fsel`, 2753 `.prop-tabs a` (schmal), 2864 `.coach-invite .input`, 3106 `.nw-v b`
- 12.5 → 13 (Optionskarten): 1825 `.design-card b`, 1837 `.theme-card b` (bereich_einstellungen-28)
```

## typografie-3.2.3i · --fs-13: 13.5 → 13 für Kachel-Titel, .set-head p und Konto-Menü (.sb-menu .item erbt 13 von .popover .item)

Gruppe typografie · Cluster tokens · Aufwand S · Befunde: bereich_dashboard-44, typografie-3, typografie-31
Quelle: audit/spec/typografie.md Z. 255–255 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
- 13.5 → 13: 517 `.tile .head` (bereich_dashboard-44, typografie-3), 1816 `.set-head p`, 254 `.sb-menu-row` (typografie-31); Z. 250 `.sb-menu .item`: `font-size: 13.5px;` **löschen** (erbt 13 von `.popover .item`, Z. 334) (typografie-31, K1)
```

## typografie-3.2.3l · --fs-13: übrige 13-px-Regeln auf das Token

Gruppe typografie · Cluster tokens · Aufwand L · Befunde: typografie-3
Quelle: audit/spec/typografie.md Z. 258–259 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
- schon 13 → Token: übrige 13-px-Regeln (z. B. 264, 302, 318, 324, 334, 360, 376, 420, 434, 479, 592, 637, 647, 651, 662, 720, 749, 765, 800, 893, 894, 898, 994, 1023, 1029, 1118, 1268, 1280, 1284, 1355, 1396, 1397, 1415, 1451, 1651, 1659, 1687, 1704, 1710, 1744, 1881, 1897, 1931, 1948, 1951, 2147, 2188, 2244, 2428, 2429, 2459, 2471, 2484, 2509, 2648, 2721, 2728, 2887, 2905, 2923, 3054, 3064, 3084, 3091, 3108)

```
