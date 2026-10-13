# Paket 046 · tokens, diagramme, notebook_news

Schritte: 4 · Dateien: web/css/app.css
Betroffene Tests laut Spezifikation: Akzeptanz 4.2 Nr. 1–2 (grep font-size px); Akzeptanz 4.3 news; Akzeptanz grep 2: grep -c '^\.chart text {' web/css/app.css → 1; Screenshot news (14:15 so breit wie 14:30), prop_bilanz (Pro Firma bündig); web/e2e/newstest.js
Baut auf Paketen auf: 1

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## diagramme-A1 · Diagrammtext: eine .chart text-Definition, neu .chart text.bv und .chart text.lbl, alte Regel Z. 1647–1648 löschen (inkl. Abschnittskopf 3 und Reihenfolge)

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: typografie-29, diagramme-9, diagramme-25
Quelle: audit/spec/diagramme.md Z. 279–293 · Dateien: web/css/app.css
Abhängig von: —

```text
## 3. Umsetzungsschritte

Reihenfolge: Tokens und Basisstile → Skalen und Bausteine → Zeichner → Widgets und Seiten → Vorschaubilder → Übersetzungen → Tests → README. Für jeden Schritt sind die erledigten Befund-ids angegeben.

### 3.1 `web/css/app.css`

**A1 Diagrammtext, eine Definition** (typografie-29, diagramme-9, diagramme-25)
- Z. 683 `.chart text { fill: var(--muted); font-size: 11px; font-family: var(--font); }` → `.chart text { fill: var(--muted); font-size: 11px; font-variant-numeric: tabular-nums; }` Die Schrift Onest kommt aus der Sammelregel Z. 1800, `.chart text` steht dort schon.
- direkt darunter neu:
  ```css
  .chart text.bv { fill: var(--text-2); } /* Wert an der Säule */
  .chart text.lbl { paint-order: stroke; stroke: var(--surface); stroke-width: 3px; stroke-linejoin: round; } /* Beschriftung an Bezugslinien im Feld */
  ```
- Z. 1647–1648 (`/* Achsen-Text */` und `.chart text { fill: var(--text-2); font-size: 11.5px; }`) löschen.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .chart text] Es gibt eine Regel: `.chart text { fill: var(--muted); font-size: var(--fs-11); font-variant-numeric: tabular-nums; }`, ohne line-height (SVG). Dazu kommen `.chart text.bv` und `.chart text.lbl` aus diagramme-A1; Z. 1647–1648 werden gelöscht. Die Schrift Onest kommt aus der Sammelregel. diagramme-A1 führt das aus. farbe-B13 ist eine Teilmenge davon. tabular-nums steht nur hier, nicht zusätzlich in der Sammelregel von 3.2.2e. Der 11,5-px-Eintrag in 3.2.3c betrifft die gelöschte Zeile. 3.2.3d setzt anschließend `11px` → `var(--fs-11)`.
- ÜBERNIMMT farbe-B13: Z. 683 ersetzen und Z. 1647–1648 löschen nur einmal, über diagramme-A1.
- [konflikt: --muted] (1) Der Akzent-Hinweis in Einstellungen → Design (misc.js Z. 145) lautet „„Trade loggen“, Schalter, aktive Einträge und Diagramme.“ (farbe-C22c). Die wording-Fassung „Hauptknöpfe, Schalter, Markierungen und Diagramme.“ wäre nach dem neutralen .btn.primary falsch und widerspräche W1 („Hilfetexte sagen, was der Code tut“). (2) „Auf Standard zurücksetzen“-Knöpfe sind einheitlich `.btn.ghost.sm`, ohne Inline-Farbe und ohne eigene --muted-Variante (Komponenten: „keine weiteren Varianten“, kein Inline-Stil; abstaende-L6/-L8 entfernen die Inline-Farbe bereits). Die Farbe ist die von .btn.ghost (--text-2, Hover --text). Das gilt für color-reset, be-reset, die Notebook-Einstellungen und tags-reset. (3) Die --muted-Werte (farbe-A1/A2) und ihre Nutzung in barrierefreiheit-B13 und diagramme-A1 sind verträglich.

## typografie-3.2.2e · tabular-nums-Sammelregel für Listenwerte und laufende Zahlen

Gruppe typografie · Cluster tokens · Aufwand S · Befunde: typografie-21, bereich_notebook_news-48, bereich_notebook_news-14
Quelle: audit/spec/typografie.md Z. 224–224 · Dateien: web/css/app.css
Abhängig von: —

```text
| Z. 94, nach `.tbl td { font-variant-numeric: tabular-nums; }` | neu: `.kv b, .bar-row .bl b, .chart text, .pfm-top span, .fw-acc-v, .pg-info, .day-card .stats .v, .nw-next-when b, .nw-time, .nw-v b, .nb-toolbar .sz { font-variant-numeric: tabular-nums; }` | typografie-21, bereich_notebook_news-48, bereich_notebook_news-14 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .chart text] Es gibt eine Regel: `.chart text { fill: var(--muted); font-size: var(--fs-11); font-variant-numeric: tabular-nums; }`, ohne line-height (SVG). Dazu kommen `.chart text.bv` und `.chart text.lbl` aus diagramme-A1; Z. 1647–1648 werden gelöscht. Die Schrift Onest kommt aus der Sammelregel. diagramme-A1 führt das aus. farbe-B13 ist eine Teilmenge davon. tabular-nums steht nur hier, nicht zusätzlich in der Sammelregel von 3.2.2e. Der 11,5-px-Eintrag in 3.2.3c betrifft die gelöschte Zeile. 3.2.3d setzt anschließend `11px` → `var(--fs-11)`.
- ÄNDERN: `.chart text` nicht in die tabular-nums-Sammelregel aufnehmen; die Eigenschaft steht in der .chart-text-Regel aus diagramme-A1.
- [konflikt: .pg-info] komponenten will `.pg-info` immer, zustaende will es bei einer Seite nur ohne aktiven Filter. zustaende gilt (aufbau Grundsatz 1: eine Information an einer Stelle). Bei aktivem Filter steht „{x} von {y} Trades“ schon in der Filterzeile.

Verbindlicher Endstand trades.js:
- Z. 44: Zähler nur bei aktivem Filter (`active = !!(f.q || f.symbol || f.setup || f.status || f.mistake)`).
- Z. 48: „Trades pro Seite“ steht immer.
- Bei `pages > 1` kommen dazu: `pg-sep`, `<span class="pg-info">${from + 1}–${to} von ${n} Trades</span>`, `grow`, die Seitenwahl mit „von N Seiten“ und `.pg-nav` mit zwei `<button type="button" class="btn nav">`.
- Bei `pages <= 1`: ohne Filter `pg-sep` + `<span class="pg-info">{n} Trade(s)</span>`, mit Filter nichts weiter.

Bereichsangabe immer ohne Leerzeichen „1–10“ (komponenten-Wortwahl). Das „{from} – {to}“ in S-T2 zitiert nur den Ist-Text.

Gleiches Format in shadow.js:73 („1–10 von {n} Verstößen“). Dazu shadowtest.js:38 auf `1–10 von ${n2} Verstößen` und Z. 41 auf `startsWith('11–')` anpassen. Neue Schlüssel „{0}–{1} von {2} Trades/Verstößen“ in allen fünf js/lang-Dateien.

tabular-nums für `.pg-info` (3.2.2e) gilt unverändert. Weil die Pfeile einzelne `.btn.nav` werden (komponenten ersetzt Z. 1749–1753), folgt `:disabled` der globalen Regel (`--disabled-o`); die Sonderfarbe `--faint` für die Pager-Pfeile entfällt.

## typografie-3.2.3d · --fs-11: übrige 11-px-Regeln auf das Token

Gruppe typografie · Cluster tokens · Aufwand M · Befunde: typografie-3
Quelle: audit/spec/typografie.md Z. 243–244 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
- schon 11 → Token: alle übrigen 11-px-Regeln (z. B. 186, 358, 419, 539, 576, 683, 722, 726, 728, 816, 981, 1022, 1341, 1382, 1421, 1643, 1688, 2354, 2993, 3030, 3085, 3087, 3100)

```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .chart text] Es gibt eine Regel: `.chart text { fill: var(--muted); font-size: var(--fs-11); font-variant-numeric: tabular-nums; }`, ohne line-height (SVG). Dazu kommen `.chart text.bv` und `.chart text.lbl` aus diagramme-A1; Z. 1647–1648 werden gelöscht. Die Schrift Onest kommt aus der Sammelregel. diagramme-A1 führt das aus. farbe-B13 ist eine Teilmenge davon. tabular-nums steht nur hier, nicht zusätzlich in der Sammelregel von 3.2.2e. Der 11,5-px-Eintrag in 3.2.3c betrifft die gelöschte Zeile. 3.2.3d setzt anschließend `11px` → `var(--fs-11)`.
- [konflikt: .nav .badge-n] Z. 186 `.nav .badge-n { … }` wird gelöscht. Toter Code: `badge-n` kommt in web/js und web/app.html nicht vor (kilook Z11, Prüfung kilook 11). Die Umstellung von 11 px auf das Token entfällt für diese Zeile.
- ÄNDERN: Z. 186 aus der Liste der 11-px-Regeln streichen (Regel wird von kilook-C1a gelöscht).
- [doppelt: .btn .cntb] Das Gewicht 700 → 600 steht zweimal da (3.2.4l und S-C7). S-C7 übernimmt es zusammen mit der neutralen Farbe, 3.2.3d stellt die Größe auf das Token um. Endstand: `.btn .cntb { display: inline-grid; place-items: center; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 999px; background: color-mix(in srgb, var(--text) 16%, transparent); color: var(--text); font-size: var(--fs-11); line-height: var(--lh-11); font-weight: 600; }`. Ein Zähler ist ein Etikett, daher 600, ohne Grün. Prüfung zustaende 8 (kein `var(--bg)` in `.btn .cntb`) ist damit erfüllt.
- [doppelt: .fd-panel .cntb] Wie bei .btn .cntb: S-C7 setzt Fläche `color-mix(in srgb, var(--text) 16%, transparent)`, Schrift `var(--text)` und Gewicht 600, 3.2.3d stellt `font-size: var(--fs-11); line-height: var(--lh-11)` um. 3.2.4l ändert die Zeile nicht separat.
- [konflikt: .nw-n] Die Zähler-Pille im News-Tageskopf entfällt (aufbau Grundsatz 1, Prüfung aufbau 727/756). news.js Z. 81 ohne `<span class="nw-n">`, Regel Z. 3087 gelöscht. Die 11-px-Token-Umstellung entfällt für diese Zeile.
- ÄNDERN: Z. 3087 `.nw-n` aus der Liste streichen (Regel wird von aufbau-C9b gelöscht).

## typografie-3.2.6b · News-Ziffern: tabular-nums kommt aus der Sammelregel (nur prüfen, keine Einzeländerung)

Gruppe typografie · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-48
Quelle: audit/spec/typografie.md Z. 375–376 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.2e

```text
| `.nw-next-when b` (3077), `.nw-time` (3091), `.nw-v b` (3106) | `tabular-nums` kommt aus der Sammelregel 3.2.2 (keine Einzeländerung nötig) | bereich_notebook_news-48 |

```
