# Paket 074 · shell, komponenten

Schritte: 4 · Dateien: web/app.html, web/css/app.css
Betroffene Tests laut Spezifikation: —
Baut auf Paketen auf: 2, 5, 10, 60, 75, 76

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## abstaende-B13 · Verlaufskachel (TradeLog) auf die Wertlinie: .tile.spark-tile gap-Regel löschen, .spark-body flex-start + padding-top var(--sp-3), .chart margin-block -14px, Abfrage 190 → 180 mit margin-block 0

Gruppe abstaende · Cluster komponenten · Aufwand M · Befunde: bereich_dashboard-10
Quelle: audit/spec/abstaende.md Z. 329–329 · Dateien: web/css/app.css
Abhängig von: abstaende-B7, abstaende-B9

```text
| B13 | Verlaufskachel Z. 1733–1737 | Z. 1733 `.tile.spark-tile { gap: 2px; }` löschen. Z. 1734 → `.tile.spark-tile .spark-body { flex: 1; display: flex; align-items: flex-start; gap: 18px; min-height: 0; padding-top: var(--sp-3); }`. Z. 1736 um `margin-block: -14px;` ergänzen. Z. 1737 `@container (max-width: 190px)` → `180px`, darin `.tile.spark-tile .chart { flex: 0 0 auto; height: 48px; margin-block: 0; }` | bereich_dashboard-10 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .tile .body] abstaende-B9 und typografie-3.8b ergänzen sich. .tile .body bekommt align-items flex-start und padding-top var(--sp-3), und die Verlaufskachel im TradeLog bekommt `class="body spark-body"`. Damit erbt sie Trennlinie, Abstand und Ausrichtung aus der einen Regel .tile .body, und diese Regel bleibt die einzige Quelle dafür. In `.tile.spark-tile .spark-body` werden Linie (background-Verlauf) und padding-top deshalb nicht ein zweites Mal gesetzt. komponenten-C25b wollte padding-top 8px plus Linie, abstaende-B13 padding-top 12 plus flex-start. Begründung: Jeder Wert steht an einer Stelle, und Dashboard- und TradeLog-Kachel weichen nicht um 8 gegen 12 px voneinander ab. Die offene Frage ki_look-10/bereich_dashboard-41 (Linie weglassen) wirkt später automatisch auf beide Kachelarten, blockiert diese Schritte aber nicht.
- ÄNDERN: Z. 1734 wird zu `.tile.spark-tile .spark-body { gap: 18px; min-height: 0; }`. display, flex, align-items flex-start und padding-top var(--sp-3) liefert .tile .body (B9 + typografie-3.8b). Z. 1733 löschen, .chart margin-block -14px und die Abfrage 190 → 180 bleiben wie spezifiziert.
- [doppelt: .tile.spark-tile] Die Regel `.tile.spark-tile { gap: 2px; }` (Z. 1733) wird einmal gelöscht, durch abstaende-B13.
- [konflikt: .tile.spark-tile .spark-body] Endstand: `.tile.spark-tile .spark-body { flex: 1; display: flex; align-items: flex-start; flex-wrap: nowrap; gap: 18px; min-height: 0; padding-top: var(--sp-3); }` (abstaende-B13 plus nowrap aus typografie-3.2.5b). In trades.js:26 wird daraus `<div class="body spark-body">` (typografie-3.8b). So bekommt die Verlaufskachel Trennlinie und Abstand genau von `.tile .body`, ohne eigene linear-gradient-Kopie und ohne eigenes padding-top: 8px. Grund: Komponenten will „dieselbe Trennlinie wie alle Kacheln“, und über die Klasse ist das automatisch so. Streicht der Nutzer bei ki_look-10 die Linie für alle Kacheln, verschwindet sie hier ohne Sonderregel mit; diese Entscheidung wartet deshalb nicht auf die Frage. padding-top 12 (var(--sp-3)) ist der Wert von .tile .body laut abstaende-B9. 8 px würde die Wertlinie gegen die Nachbarkacheln versetzen.
- ÄNDERN: In die neue .spark-body-Regel zusätzlich `flex-wrap: nowrap;` aufnehmen (schützt vor der ≤960-Regel `.tile .body { flex-wrap: wrap }`, sobald .spark-body die Klasse body trägt). Alles andere wie geplant.

## zustaende-S-C19 · Start-Skelett Desktop in den Maßen der fertigen Seite (Kopfreihe 46, Kacheln 131, Karten 396, Seitenleiste, sb-mini)

Gruppe zustaende · Cluster shell · Aufwand M · Befunde: bereich_shell-4
Quelle: audit/spec/zustaende.md Z. 367–389 · Dateien: web/css/app.css
Abhängig von: —

```text
**S-C19 Start-Skelett, Desktop** – bereich_shell-4 (zusammen mit bereich_shell-3; danach bereich_shell-5 aus Spec Responsiv)
Z. 1541 (`.boot-head`), 1542 (`.boot-head .skel`), 1545 (`.boot-tiles .skel`), 1547 (`.boot-main .skel`) ändern, 1548–1552 (`.boot-sb …`) ersetzen; 1543 (`.boot-head .skel.tl`) und die Media-Queries 1553–1554 bleiben (bereich_shell-5 passt 1554 an). Zielregeln:
```css
.boot-head { display: flex; justify-content: flex-end; align-items: center; gap: 8px; min-height: 46px; }
.boot-head .skel { border: 0; border-radius: 9px; height: 42px; width: 40px; }
.boot-tiles .skel { height: 131px; }
.boot-main .skel { height: 396px; }
.boot-sb { display: flex; flex-direction: column; gap: 0; padding: 4px 16px 0; height: 100%; }
.boot-sb .skel { border: 0; border-radius: 6px; height: 14px; width: 62%; margin: 12.5px 0 15.5px; } /* 39-px-Zeile + 3 px wie .nav (Z. 164) – Maße gemeinsam mit .nav a pflegen */
.boot-sb .skel.l { height: 19px; width: 54%; margin: 0 0 4px; }
.boot-sb .skel.l2 { height: 12px; width: 60%; margin: 0 0 18px; }
.boot-sb .sep { display: block; flex: 0 0 auto; height: 1px; background: var(--border); margin: 0 -8px 14px; }
.boot-sb .skel.g { height: 10px; width: 34%; margin: 33px 0 7px; } /* 24-px-Titelzeile, 26 px Gruppenabstand */
.boot-sb .skel.g.first { margin-top: 7px; }
.boot-sb .skel.card { margin: auto 0 0; height: 59px; width: 100%; border-radius: 14px; }
html.sb-mini .boot-sb { padding: 4px 0 0; align-items: center; }
html.sb-mini .boot-sb .skel { width: 40px; }
html.sb-mini .boot-sb .skel.g { height: 1px; width: 40px; }
html.sb-mini .boot-sb .sep { margin: 0 0 14px; width: 40px; }
html.sb-mini .boot-sb .skel.card { width: 40px; height: 40px; border-radius: 50%; }
```
Die bisherige Regel Z. 1552 `html.sb-mini .boot-sb .skel { width: 24px; }` entfällt. An `.nav a` (Z. 169) den Kommentar „Maße gemeinsam mit .boot-sb pflegen“ setzen.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: .boot-head] Die Werte vertragen sich: Desktop Kopfreihe 46, Symbole 42, Kacheln 131, Karten 396; Handy 46, 40, 111, 339. S-C19 setzt das Desktop-Skelett und lässt die Media-Queries ausdrücklich für responsiv (bereich_shell-5) stehen. B11 passt danach Z. 1554 an und blendet .boot-top .skel.mb und .boot-head .skel.m global aus. 3.17 fügt diese beiden Platzhalter ins HTML ein. 3.17 darf nicht vor B11 landen: Sonst stehen am Desktop ein 128-px-Block in der Titelzeile und ein zusätzlicher Platzhalter in der Kopfreihe. Reihenfolge S-C19 → B11 → 3.17; B11 und 3.17 am besten in einem Commit.
- [reihenfolge: .nav a] Alle fünf Schritte gelten und landen in einer Regel. Der Selektor heißt nur noch `.nav a` (kilook-C1a, `.nav` enthält laut app.js:210 keine `<button>`). Z. 169–173 danach: `gap: var(--sp-3)` (A9), `font-size: var(--fs-14); line-height: var(--lh-14)` (3.2.3n), `transition` ohne `, transform var(--dur-2) var(--ease)` (B3), dazu der Kommentar „Maße gemeinsam mit .boot-sb pflegen“ (S-C19). `.nav a:hover { background: var(--surface-2); color: var(--text); }`; kein `:active` und kein `.nav a.active:hover`. Folge fürs Skelett: Mit 14/20 statt 14,5 × 1,45 ist ein Eintrag 38 statt 39 px hoch (8 + 20 + 8 + 2 Rand), das Raster der Leiste also 41 statt 42 px (Dichte-Stufen: 34/32 px). Deshalb kommt S-C19 erst nach 3.2.3n und nimmt die Werte aus dem Anker `.boot-sb`. Die responsiv-Prüfung „Zeilenhöhe .nav a 39 px (± 1)“ ist mit 38 erfüllt, die Gewichtsregel (Navigation 500) bleibt.
- ÄNDERN: Skelett-Raster der Leiste auf 38-px-Einträge + 3 px auslegen (41 px), nicht 39 + 3. Werte siehe Anker .boot-sb. Den Kommentar an `.nav a` wie geplant setzen.
- [konflikt: .boot-sb] Das Seitenleisten-Skelett gehört allein zu S-C19/S-H2. Der `.boot-sb`-Teil von C13 (`padding: 22px 10px 6px`) entfällt. Die übrigen C13-Teile (`.boot-body`, `.boot-tiles`, `.boot-main`) bleiben. S-C19 ist auf die heutige Leiste (oben 22 px Polster, Marke 4/18) gerechnet. Nach abstaende-D1 hat die Leiste oben kein Polster mehr, die Marke ist 72 px hoch, und die Linie liegt bei y = 71 über die volle Breite. Nach typografie-3.2.3n sind die Einträge 38 px hoch. Verbindlicher Endstand (ersetzt Z. 1548–1552):
`.boot-sb { display: flex; flex-direction: column; gap: 0; padding: 0 16px; height: 100%; }`
`.boot-sb .skel { border: 0; border-radius: 6px; height: 14px; width: var(--w, 62%); margin: 12px 0 15px; } /* 38-px-Zeile + 3 px wie .nav – Maße gemeinsam mit .nav a pflegen */`
`.boot-sb .skel.l { height: 19px; width: 54%; margin: 16px 0 6px; }`
`.boot-sb .skel.l2 { height: 12px; width: 60%; margin: 0 0 18px; }` (Linie bei y = 71)
`.boot-sb .sep { display: block; flex: 0 0 auto; height: 1px; background: var(--border); margin: 0 -30px 14px; }` (volle Breite wie `.sb-sep` aus D1)
`.boot-sb .skel.g { height: 10px; width: 34%; margin: 33px 0 7px; } .boot-sb .skel.g.first { margin-top: 7px; }`
`.boot-sb .skel.card { margin: auto 0 0; height: 59px; width: 100%; border-radius: 14px; }`
Dichte-Stufen wie die Leiste: `@media (min-width: 961px) and (max-height: 1060px) { .boot-sb .skel { margin: 10px 0 13px; } .boot-sb .skel.g { margin: 23px 0 5px; } }` und `@media (min-width: 961px) and (max-height: 940px) { .boot-sb .skel { margin: 9px 0 12px; } .boot-sb .skel.g { margin-top: 19px; } }`.
Eingeklappt (Einträge fest 40 px, Raster 43): `html.sb-mini .boot-sb { padding: 0; align-items: center; } html.sb-mini .boot-sb .skel { width: 40px; margin: 13px 0 16px; } html.sb-mini .boot-sb .skel.l { width: 30px; height: 30px; border-radius: 9px; margin: 21px 0 20px; } html.sb-mini .boot-sb .skel.l2 { display: none; } html.sb-mini .boot-sb .skel.g { height: 1px; width: 40px; } html.sb-mini .boot-sb .sep { align-self: stretch; width: auto; margin: 0 -10px 14px; } html.sb-mini .boot-sb .skel.card { width: 40px; height: 40px; border-radius: 50%; }`.
In S-H2 werden die Zeilenbreiten über `style="--w:52%"` gesetzt statt `style="width:52%"`. Ein Inline-`width` schlägt jede Klassenregel, sonst greift die eingeklappte Breite von 40 px nie (das gilt schon heute für die 24-px-Regel). Abnahme: Marke, Linie und erste Gruppe weichen bei 1440×1000 und 1440×900, voll und eingeklappt, höchstens ±2 px von der fertigen Leiste ab.
- ÄNDERN: `.boot-sb`-Block durch den Endstand aus dieser Entscheidung ersetzen: padding 0 16px, `.skel` margin 12px 0 15px mit width var(--w, 62%), `.skel.l` margin 16px 0 6px, `.skel.l2` margin 0 0 18px, `.sep` margin 0 -30px 14px, dazu die zwei Dichte-Stufen und die sb-mini-Regeln (mini: padding 0, .skel margin 13px 0 16px, .l 30×30 margin 21px 0 20px, .l2 none, .sep align-self stretch und margin 0 -10px 14px).
- [reihenfolge: .boot-tiles .skel] S-C19 (globale Regel, Desktop) und B11 (Block ≤ 960 px) ergänzen sich. Beide Zahlen sind aber gemessene Ist-Werte von heute und werden durch andere Gruppen ungültig. abstaende-B7/B9 machen die Dashboard-Kachel 131 → 144 px hoch. Mit typografie (Wert 25 → 24 px, Kopfzeile 18 px) werden es etwa 142 px. Am Handy kommen +4 (Körper-Polster 8 → 12) und +1 (gap) dazu, Kachelwert 21 → 20 und Kopf-Zeilenhöhe ziehen ab. Verbindlich: Beide Skelett-Höhen sind die gemessene Höhe der fertigen Dashboard-Kachel nach allen Kachel-Schritten, nicht 131 bzw. 111. Desktop gemessen bei 1440×900, Handy bei 390×844, Beispieldaten, dunkel. Prüfung zustaende 21 wird zu „Kacheln y = 158 / h = gemessen, Karten y = 158 + h + 16 / h = 396 (±2)“. Prüfung responsiv 13 vergleicht Kacheln und Karte mit der fertigen Seite (±2) statt mit festen 111/339. Ändert sich die Kachel durch die offene kilook-Frage ki_look-10 (Linie im Kachelkopf, N1), neu messen. Hinweis: Die Mittelstufe des Skeletts (≤ 1180 px, 3 Kacheln) bleibt laut S-C19 unverändert. Sie weicht von der fertigen Seite ab (5 Kacheln als 3+2) und wird nachgezogen, sobald das Kachelraster 561–1240 entschieden ist.
- ÄNDERN: `.boot-tiles .skel { height: <gemessen> }` statt 131 px: Höhe der fertigen Dashboard-Kachel bei 1440×900 nach abstaende-B7/B9 und den typografie-Werten. Prüfpunkt 21 entsprechend (Karten-y = 158 + Kachelhöhe + 16).
- [reihenfolge: .boot-head .skel] Die beiden Schritte ergänzen sich: S-C19 setzt die globale Regel, B11 überschreibt im Block ≤ 960 px. Die Symbol-Platzhalter haben die Maße der fertigen Knöpfe. Am Desktop sind das 42 × 42, weil komponenten-C08 `.btn.icon-only` (Vorlage, Zertifikat) auf 42 × 42 setzt. Also `.boot-head .skel { border: 0; border-radius: 9px; height: 42px; width: 42px; }` statt width 40; Kopfreihe min-height 46 bleibt (42 + 4). Am Handy bleiben die B11-Werte (40 × 40, Zeitraum 166 × 42) und werden nach komponenten-C08 und dem 40-px-Kontoknopf aus responsiv gegen die fertige Kopfreihe gemessen (±2).
- ÄNDERN: `.boot-head .skel { border: 0; border-radius: 9px; height: 42px; width: 42px; }` (Breite 42 statt 40, wie `.btn.icon-only` nach komponenten-C08).
- [reihenfolge: .boot-main .skel] Die Schritte ergänzen sich. Desktop 396 px (S-C19) ist richtig, denn `--card-h` bleibt 396 (abstaende). Am Handy ist die erste Karte height:auto. abstaende-B4 (Kartenkopf 14 → 16 px Abstand, Kopf mittig) und D10 ändern die fertige Höhe, daher gilt dort nicht die feste 339 aus B11, sondern die gemessene Höhe der ersten Dashboard-Karte bei 390×844 nach B4/D10 (erwartet etwa 341). Prüfung responsiv 13 vergleicht mit der fertigen Seite (±2).

## zustaende-S-H2 · app.html: Seitenleisten-Skelett mit Marke, Untertitel, Trennlinie, vier Gruppen und Konto-Karte

Gruppe zustaende · Cluster shell · Aufwand S · Befunde: bereich_shell-4
Quelle: audit/spec/zustaende.md Z. 588–598 · Dateien: web/app.html
Abhängig von: zustaende-S-C19

```text
**S-H2 Skelett der Seitenleiste** – bereich_shell-4
Z. 19, Inhalt von `.boot-sb` ersetzen durch:
```html
<span class="skel l"></span><span class="skel l2"></span><span class="sep"></span>
<span class="skel g first"></span><span class="skel" style="width:52%"></span><span class="skel" style="width:58%"></span><span class="skel" style="width:48%"></span>
<span class="skel g"></span><span class="skel" style="width:56%"></span><span class="skel" style="width:60%"></span><span class="skel" style="width:50%"></span><span class="skel" style="width:46%"></span>
<span class="skel g"></span><span class="skel" style="width:54%"></span><span class="skel" style="width:58%"></span><span class="skel" style="width:44%"></span>
<span class="skel g"></span><span class="skel" style="width:64%"></span><span class="skel" style="width:54%"></span>
<span class="skel card"></span>
```

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .boot-sb] Das Seitenleisten-Skelett gehört allein zu S-C19/S-H2. Der `.boot-sb`-Teil von C13 (`padding: 22px 10px 6px`) entfällt. Die übrigen C13-Teile (`.boot-body`, `.boot-tiles`, `.boot-main`) bleiben. S-C19 ist auf die heutige Leiste (oben 22 px Polster, Marke 4/18) gerechnet. Nach abstaende-D1 hat die Leiste oben kein Polster mehr, die Marke ist 72 px hoch, und die Linie liegt bei y = 71 über die volle Breite. Nach typografie-3.2.3n sind die Einträge 38 px hoch. Verbindlicher Endstand (ersetzt Z. 1548–1552):
`.boot-sb { display: flex; flex-direction: column; gap: 0; padding: 0 16px; height: 100%; }`
`.boot-sb .skel { border: 0; border-radius: 6px; height: 14px; width: var(--w, 62%); margin: 12px 0 15px; } /* 38-px-Zeile + 3 px wie .nav – Maße gemeinsam mit .nav a pflegen */`
`.boot-sb .skel.l { height: 19px; width: 54%; margin: 16px 0 6px; }`
`.boot-sb .skel.l2 { height: 12px; width: 60%; margin: 0 0 18px; }` (Linie bei y = 71)
`.boot-sb .sep { display: block; flex: 0 0 auto; height: 1px; background: var(--border); margin: 0 -30px 14px; }` (volle Breite wie `.sb-sep` aus D1)
`.boot-sb .skel.g { height: 10px; width: 34%; margin: 33px 0 7px; } .boot-sb .skel.g.first { margin-top: 7px; }`
`.boot-sb .skel.card { margin: auto 0 0; height: 59px; width: 100%; border-radius: 14px; }`
Dichte-Stufen wie die Leiste: `@media (min-width: 961px) and (max-height: 1060px) { .boot-sb .skel { margin: 10px 0 13px; } .boot-sb .skel.g { margin: 23px 0 5px; } }` und `@media (min-width: 961px) and (max-height: 940px) { .boot-sb .skel { margin: 9px 0 12px; } .boot-sb .skel.g { margin-top: 19px; } }`.
Eingeklappt (Einträge fest 40 px, Raster 43): `html.sb-mini .boot-sb { padding: 0; align-items: center; } html.sb-mini .boot-sb .skel { width: 40px; margin: 13px 0 16px; } html.sb-mini .boot-sb .skel.l { width: 30px; height: 30px; border-radius: 9px; margin: 21px 0 20px; } html.sb-mini .boot-sb .skel.l2 { display: none; } html.sb-mini .boot-sb .skel.g { height: 1px; width: 40px; } html.sb-mini .boot-sb .sep { align-self: stretch; width: auto; margin: 0 -10px 14px; } html.sb-mini .boot-sb .skel.card { width: 40px; height: 40px; border-radius: 50%; }`.
In S-H2 werden die Zeilenbreiten über `style="--w:52%"` gesetzt statt `style="width:52%"`. Ein Inline-`width` schlägt jede Klassenregel, sonst greift die eingeklappte Breite von 40 px nie (das gilt schon heute für die 24-px-Regel). Abnahme: Marke, Linie und erste Gruppe weichen bei 1440×1000 und 1440×900, voll und eingeklappt, höchstens ±2 px von der fertigen Leiste ab.
- ÄNDERN: In app.html Z. 19 jede Inline-Breite `style="width:NN%"` als `style="--w:NN%"` schreiben; Markup sonst wie spezifiziert.

## barrierefreiheit-H1 · Sprunglink „Zum Inhalt springen“ als erstes Kind von .shell

Gruppe barrierefreiheit · Cluster shell · Aufwand S · Befunde: barrierefreiheit-31, bereich_shell-14
Quelle: audit/spec/barrierefreiheit.md Z. 519–524 · Dateien: web/app.html
Abhängig von: barrierefreiheit-B2

```text
#### `web/app.html`

**H1 Sprunglink** (Z. 18, erstes Kind von `<div class="shell">`)
- nachher: `<a class="skip" href="#content" data-action="skip-content">Zum Inhalt springen</a>`
- Befunde: barrierefreiheit-31, bereich_shell-14

```

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: #content] P1 macht #content mit tabindex="-1" fokussierbar, P10 legt die Aktion skip-content an, H1 setzt den Sprunglink. Ohne P10 würde der Link mit href="#content" die Route wechseln, denn parseRoute fällt auf das Dashboard zurück. Ohne P1 bliebe c.focus() wirkungslos. Reihenfolge P1 → P10 → H1, oder alles in einem Commit. S-TE2 (dashtest) prüft nur Text in #content und hängt nicht davon ab.
