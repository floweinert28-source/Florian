# Paket 002 · tokens

Schritte: 27 · Dateien: scratchpad/localfonts.js, web/README.md, web/app.html, web/css/app.css, web/css/landing.css, web/e2e/localfonts.js, web/e2e/motiontest.js, web/index.html, web/js/sample.js, web/js/ui.js
Betroffene Tests laut Spezifikation: Akzeptanz 4.1 Nr. 2–3; Akzeptanz 4.3 dashboard/stats_summary/trades (Kachelwerte 24); Akzeptanz 4.3 index.html (sieht aus wie vorher); Akzeptanz 4.3 ruhepunkt („Vor dem Trading“ 15/600); Akzeptanz 4.3 sidebar (Navigation 14/500); anpassen in kilook-C27: e2e/proptest.js:55 (Erwartung baut Balance über UI.fmt.cur); prüfen: e2e/friedhoftest.js:122 (Konto ohne Größe „—“); prüfen: e2e/settest2.js:22–26 („Klassisch“ lädt Inter/Roboto über Theme.loadFont); web/e2e/coachtest.js; web/e2e/headtest.js:60–64 (Navigation weiter 500); web/e2e/localfonts.js:5–6; web/e2e/mentortest.js; web/e2e/motiontest.js:8; web/e2e/motiontest.js:8 (Schritt bewegung-3.11c); web/e2e/newstest.js; web/e2e/replaytest.js; web/e2e/rptest.js; web/e2e/rptest.js (.rp-bigtime); web/e2e/settest2.js:22; web/e2e/shadowtest.js; web/e2e/streaktest.js; web/e2e/voicetest.js
Baut auf Paketen auf: 1

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## typografie-3.2.3n · --fs-14: 14.5 px → 14 (Navigation, Ruhepunkt-Texte, Notiz-/Chat-Text)

Gruppe typografie · Cluster tokens · Aufwand M · Befunde: typografie-31, typografie-3
Quelle: audit/spec/typografie.md Z. 262–262 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
- 14.5 → 14: Z. 169–172 `.nav a, .nav button` (typografie-31), 786 `.note-body` (1.65 bleibt), 2141 `.rp` (1.55 bleibt), 2198 `.rp-open > .rp-guide`, 2206 `ol.rp-visual` (1.6 bleibt), 2227 `.rp-sl-head .rp-l`, 2236 `.rp input…, .rp textarea`, 2249 `.rp-ampel strong`, 2266 `.rp-checks label`, 2349 `.msg` (1.55 bleibt), 2875 `.ce-body.ql-container`
```

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: .nav a] Alle fünf Schritte gelten und landen in einer Regel. Der Selektor heißt nur noch `.nav a` (kilook-C1a, `.nav` enthält laut app.js:210 keine `<button>`). Z. 169–173 danach: `gap: var(--sp-3)` (A9), `font-size: var(--fs-14); line-height: var(--lh-14)` (3.2.3n), `transition` ohne `, transform var(--dur-2) var(--ease)` (B3), dazu der Kommentar „Maße gemeinsam mit .boot-sb pflegen“ (S-C19). `.nav a:hover { background: var(--surface-2); color: var(--text); }`; kein `:active` und kein `.nav a.active:hover`. Folge fürs Skelett: Mit 14/20 statt 14,5 × 1,45 ist ein Eintrag 38 statt 39 px hoch (8 + 20 + 8 + 2 Rand), das Raster der Leiste also 41 statt 42 px (Dichte-Stufen: 34/32 px). Deshalb kommt S-C19 erst nach 3.2.3n und nimmt die Werte aus dem Anker `.boot-sb`. Die responsiv-Prüfung „Zeilenhöhe .nav a 39 px (± 1)“ ist mit 38 erfüllt, die Gewichtsregel (Navigation 500) bleibt.
- [konflikt: .nav button] `.nav button` fällt aus allen Selektorlisten (kilook-C1a; kein Element im Markup, grep app.js:210). A9, B3 und 3.2.3n setzen ihre Werte nur an `.nav a`. Wichtig: B3 schreibt Z. 176 laut Spezifikation als `.nav a:hover, .nav button:hover { … }`. Das würde den toten Selektor zurückbringen, egal in welcher Reihenfolge umgesetzt wird. Ergebnis: `.nav a:hover { background: var(--surface-2); color: var(--text); }`. Gilt ebenso für Z. 149/155 (Dichte), 175 (svg), 195/196 (sb-mini).
- ÄNDERN: Z. 169–172: `font-size: var(--fs-14); line-height: var(--lh-14)` an `.nav a` (Selektor ohne `.nav button`).
- [konflikt: .note-body] Die ungebundene Regel `.note-body { … }` (Z. 786) und `.note-body:focus` (Z. 787) werden gelöscht (kilook-C2). Ganz tot sind sie aber nicht: `.nb .note-body` (notebook.js:78, Papierkorb notebook.js:67) erbt heute 14,5 px und Zeilenhöhe 1.65, und Werkzeugleiste, `.nb-menu` und `.nb-ytpop` liegen darin. Die Schriftgröße kommt danach vom body (14 px nach typografie), das ist der typografie-Zielwert. Die Zeilenhöhe, die typografie ausdrücklich behält („1.65 bleibt“), wandert in die gebundene Regel Z. 1058: `.nb .note-body { padding: 0 8px 20px; line-height: 1.65; }`. Der Editor-Text ist nicht betroffen (`.ql-container.ql-snow` setzt `--nb-body`, `.ql-editor` 1.65). Hinweis zu den übrigen C2-Löschungen (Z. 779–783): Heute schlägt `.note-item span` (0,1,1) die Klasse `.pos`/`.neg` aus U.pnl. Nach dem Löschen steht das P&L in der Notizliste in Gewinn- oder Verlustfarbe wie überall in der App. Das ist gewollt, die Notizliste per Aufnahme prüfen.
- ÄNDERN: Punkt „786 .note-body“ streichen: Die Regel löscht kilook-C2, 14 px erbt die Notiz vom body.

## typografie-3.2.3p · --fs-14: übrige 14-px-Regeln auf das Token

Gruppe typografie · Cluster tokens · Aufwand M · Befunde: typografie-3
Quelle: audit/spec/typografie.md Z. 264–265 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
- schon 14 → Token: übrige 14-px-Regeln (z. B. 243, 1015, 1273, 1490 b, 1629, 1715, 1807, 1867, 1879, 1930, 2247, 2320, 2405, 2480, 2517, 2572, 2888, 2927)

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .chip.sel.big] Die Regel .chip.sel.big wird gelöscht (komponenten-C16), und das Markup misc.js:193 wird „chip sel“ (komponenten-S-misc-e). Damit sind alle wählbaren Chips einheitlich 28 px hoch, 12px/500. Beides gehört in einen Schritt. typografie-3.2.3p setzt in Z. 1879 kein Token. Ob der Block „Was handelst du?“ bzw. „Märkte“ bleibt, entscheidet die offene Frage bereich_einstellungen-6. Die Löschung gilt in beiden Fällen.
- ÄNDERN: Z. 1879 (.chip.sel.big) auslassen, die Regel wird gelöscht.
- [konflikt: .set-tabs button] Die gemeinsame Unterstrich-Fassung aus komponenten-C20 ersetzt .set-tabs und .prop-sub. Schrift in der Text-Skala: font-size: var(--fs-14); line-height: var(--lh-14); font-weight: 500. 13.5px ist in der Skala verboten, und Reiter haben laut typografie 14. Gewicht 500 und Unterstrich in --text verlangen auch zustaende-S-C9b und typografie-3.2.4d, C20 übernimmt das. Die Fokus-Zeile in C20 setzt nur den Versatz, ohne eigene Farbe (--accent als Fokusfarbe ist laut barrierefreiheit verboten; Farbe und Stärke kommen aus der globalen :focus-visible-Regel). Den Selektor für .prop-sub a (aria-pressed oder aria-current) regelt der Anker .prop-sub a.
- ÄNDERN: Z. 1867 (.set-tabs button) auslassen. Die Regel wird durch C20 ersetzt, die schon var(--fs-14) setzt.
- [konflikt: .rules-list] Die Karte „Aktuelle Regeln“ verschwindet aus dem Fortschritt (aufbau, eine Information an einer Stelle). Damit hat .rules-list keinen Nutzer mehr (einziger: progress.js:77), und aufbau-C11c löscht die Regeln Z. 1273–1274. typografie-3.2.3p setzt in Z. 1273 kein Token.
- ÄNDERN: Z. 1273 (.rules-list) auslassen, die Regel wird gelöscht.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .topbar h1] `.topbar h1` am Desktop: `font-size: var(--fs-21); line-height: var(--lh-21); font-weight: 600` (typografie-3.2.3y). Bei ≤960 px: `font-size: var(--fs-18); line-height: var(--lh-18)` statt 17 px (typografie-3.2.3t). nowrap, Ellipse und flex aus Z. 925 bleiben. Überholt sind damit „bis 960 px: 17px, unverändert“ (aufbau.md Z. 72) und „.topbar h1 17 px bleibt“ (responsiv K12). Beides steht nur in den Doku-Tabellen, kein Schritt setzt dort eine Größe. Kein Test prüft die Größe. Grund: 17 px steht auf der Verbotsliste der Skala. h1 am Handy liegt auf der h2-Stufe 18/600, wie Dialog- und Bereichstitel. aufbau-D3d misst nur die vertikale Mitte von .topbar h1 und hängt nicht von der Größe ab; zur Wartefrage siehe den nächsten Eintrag.
- [konflikt: .ce-title] .ce-title wird 18/600 (typografie-3.2.3t: var(--fs-18)/var(--lh-18)), der Eintragstext .ce-body 14 px (typografie 14.5 → 14). Die Editor-Überschriften im Coach-Eintrag kommen nur aus der Skala: h1 var(--fs-15), h2 und h3 var(--fs-14), alle 600 in --text. Abstand var(--sp-2) davor und var(--sp-1) danach, die erste Überschrift ohne Abstand oben. Die Zeilenhöhe 1.25 kommt aus der Editor-Regel der Typografie (kein --lh-N). Grund: 16 px liegt nicht in der Skala, 14.5 px ist verboten. Die Überschriften bleiben trotzdem kleiner als der Eintragstitel (aufbau Grundsatz 4). Der Abstand entspricht der Tagesnotiz-Vorschau .nv-h (8 px davor, zustaende-S-C18). Die Regeln stehen nach Z. 2876, also hinter zustaende-S-C17 (`.ql-snow .ql-editor h1–h3`, gleiche Spezifität 0,2,1, .ce-body trägt ql-snow), und gewinnen dadurch.

## typografie-3.2.3w · --fs-18: vorhandene 18-px-Regeln auf das Token (.ql-editor.ql-blank::before, .rp-x lh 1 bleibt)

Gruppe typografie · Cluster tokens · Aufwand S · Befunde: typografie-3
Quelle: audit/spec/typografie.md Z. 279–280 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
- schon 18 → Token: 1130 `.ql-editor.ql-blank::before`, 2331 `.rp-x` (lh 1 bleibt)

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .ql-editor.ql-blank::before] Der Platzhalter bekommt keine eigene Schriftgröße: `.ql-editor.ql-blank::before { color: var(--muted); font-style: normal; left: 20px; }` (farbe-C1d). Begründung: Der Platzhalter steht dort, wo der Text erscheint, und ahmt dessen Format nach (.ph-bold/.ph-italic). Der Notiztext hat var(--nb-body, 16px), die festen 18px wichen davon ab. Ohne font-size gibt es an dieser Regel nichts zu tokenisieren.
- ÄNDERN: Nur .rp-x (Z. 2331) auf --fs-18 umstellen (lh 1 bleibt). .ql-editor.ql-blank::before fällt aus der Liste.

## typografie-3.2.3y · --fs-21: .topbar h1 und .rp-verse (Zeilenhöhe 1.45 bleibt) auf das Token

Gruppe typografie · Cluster tokens · Aufwand S · Befunde: typografie-3
Quelle: audit/spec/typografie.md Z. 284–285 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
- schon 21 → Token: 215 `.topbar h1`, 2257 `.rp-verse` (Zeilenhöhe 1.45 bleibt, Ausnahme)

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .topbar h1] `.topbar h1` am Desktop: `font-size: var(--fs-21); line-height: var(--lh-21); font-weight: 600` (typografie-3.2.3y). Bei ≤960 px: `font-size: var(--fs-18); line-height: var(--lh-18)` statt 17 px (typografie-3.2.3t). nowrap, Ellipse und flex aus Z. 925 bleiben. Überholt sind damit „bis 960 px: 17px, unverändert“ (aufbau.md Z. 72) und „.topbar h1 17 px bleibt“ (responsiv K12). Beides steht nur in den Doku-Tabellen, kein Schritt setzt dort eine Größe. Kein Test prüft die Größe. Grund: 17 px steht auf der Verbotsliste der Skala. h1 am Handy liegt auf der h2-Stufe 18/600, wie Dialog- und Bereichstitel. aufbau-D3d misst nur die vertikale Mitte von .topbar h1 und hängt nicht von der Größe ab; zur Wartefrage siehe den nächsten Eintrag.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .tile .val] Ein Rollen-Token für alle Kachelwerte, die Werte kommen aus der Typografie-Skala. In :root steht `--tile-val: var(--fv-24);`, im Block @media (max-width: 960px) `:root { --tile-val: var(--fv-20); }`; eine eigene 560er-Stufe gibt es nicht, das Handy erbt 20. Die Regel lautet `.tile .val { font-size: var(--tile-val); font-weight: 700; letter-spacing: var(--ls-val); line-height: var(--lh-val); }` ohne font-family (Onest kommt über die Sammelregel). In der Container-Notstufe (heute @container max-width 164px, die Schwelle legt der Anker „@container (max-width: 164px)“ fest) gilt `.tile .val { font-size: var(--fv-20); }`. Gelöscht werden Z. 936 (22px, ≤960) und Z. 3027 (21px, Handy). Die Skala gilt auch für die bisherigen „Bleiben“-Ausnahmen aus aufbau-A2: `.prop-balance .val` geht von 26 auf var(--fv-24), bei ≤960 von 22 auf var(--fv-20) (wie typografie-fv24/fv20). `.coach-gs-tiles .tile .val { font-size: 21px }` (Z. 2945) wird gelöscht und erbt --tile-val; schmale Coach-Kacheln fallen über die Container-Notstufe auf 20. Grund: 25, 22, 21 und 26 px liegen nicht auf der Werte-Skala (14/16/20/24/32/44), und die Typografie verbietet sie. Aufbau, Typografie und Responsiv sind sich bei 24 am Desktop und 20 am Handy einig. Streitig war nur der Tablet-Wert 22 (Aufbau). Dafür gibt es die Skalenstufe 20 „Kachelwert schmal, ≤960, Handy“.
- ÄNDERN: Entfallen: Z. 540 `.tile .val` und Z. 639 `.stat-tile .v` (→ aufbau-A2 mit --tile-val), Z. 2397/2446 `.shadow-main` und Z. 2684 `.prop-tiles` (Regeln werden gelöscht), Z. 2945 `.coach-gs-tiles` (Regel wird gelöscht), Z. 1307 `.tilt-stats .v` ≤960 und `.v.cur` (→ abstaende-D4). Bleiben: .stat .v, .tracker-foot .score-n, .detail-head .sym/.big, .prop-balance .val (26 → var(--fv-24)), ol.rp-visual li::before, .streak-tile .val.
- [konflikt: .stat-tile .v] Endstand: `.stat-tile .v { font-size: var(--tile-val); font-weight: 700; letter-spacing: var(--ls-val); line-height: var(--lh-val); margin-top: auto; padding-top: var(--sp-2); }` ohne font-family. Das ergibt 24 am Desktop und 20 bei ≤960 und am Handy, beides über das Token. Neu ist `@container (max-width: 175px) { .stat-tile .v { font-size: var(--fv-20); } }`. Die Handy-Regel Z. 3038 entfällt. 25 bzw. 22 px (Komponenten) gibt es nicht: „.stat-tile = .tile“ wird über dasselbe Token erreicht. mobiletest.js:27 (`20px`) bleibt gültig. Den Schriftteil schreibt aufbau-A2, margin und padding schreibt abstaende-B15.
- ÄNDERN: Entfallen: Z. 540 `.tile .val` und Z. 639 `.stat-tile .v` (→ aufbau-A2 mit --tile-val), Z. 2397/2446 `.shadow-main` und Z. 2684 `.prop-tiles` (Regeln werden gelöscht), Z. 2945 `.coach-gs-tiles` (Regel wird gelöscht), Z. 1307 `.tilt-stats .v` ≤960 und `.v.cur` (→ abstaende-D4). Bleiben: .stat .v, .tracker-foot .score-n, .detail-head .sym/.big, .prop-balance .val (26 → var(--fv-24)), ol.rp-visual li::before, .streak-tile .val.
- [doppelt: .prop-tiles .tile .val] Z. 2684 (24px) und Z. 2742 (20px, im 960er-Block) werden gelöscht (aufbau-A2). Die Prop-Kacheln erben var(--tile-val), also 24 bzw. 20. Die Token-Umstellung der Typografie für beide Zeilen entfällt, das Ergebnis ist dasselbe.
- ÄNDERN: Entfallen: Z. 540 `.tile .val` und Z. 639 `.stat-tile .v` (→ aufbau-A2 mit --tile-val), Z. 2397/2446 `.shadow-main` und Z. 2684 `.prop-tiles` (Regeln werden gelöscht), Z. 2945 `.coach-gs-tiles` (Regel wird gelöscht), Z. 1307 `.tilt-stats .v` ≤960 und `.v.cur` (→ abstaende-D4). Bleiben: .stat .v, .tracker-foot .score-n, .detail-head .sym/.big, .prop-balance .val (26 → var(--fv-24)), ol.rp-visual li::before, .streak-tile .val.
- [konflikt: .shadow-tiles .tile.shadow-main .val] Z. 2397 (34px) und Z. 2446 (Handy 26px) werden gelöscht (aufbau-A2). Die Hauptkachel des Schatten-Ichs hat damit den normalen Kachelwert var(--tile-val), also 24 bzw. 20. Die Typografie wollte am Handy 24 als Token behalten; das entfällt. Es gibt eine Kachelwert-Größe je Stufe, die Hervorhebung trägt schon der Rand --border-2 (Z. 2396).
- ÄNDERN: Entfallen: Z. 540 `.tile .val` und Z. 639 `.stat-tile .v` (→ aufbau-A2 mit --tile-val), Z. 2397/2446 `.shadow-main` und Z. 2684 `.prop-tiles` (Regeln werden gelöscht), Z. 2945 `.coach-gs-tiles` (Regel wird gelöscht), Z. 1307 `.tilt-stats .v` ≤960 und `.v.cur` (→ abstaende-D4). Bleiben: .stat .v, .tracker-foot .score-n, .detail-head .sym/.big, .prop-balance .val (26 → var(--fv-24)), ol.rp-visual li::before, .streak-tile .val.
- [doppelt: .tilt-stats .v] Die Werte sind in beiden Spezifikationen gleich (32, ≤960 24, Handy 20). Die Tilt-Regeln schreibt einmal abstaende-D4, direkt mit Tokens: `.tilt-stats .v { font-size: var(--fv-32); font-weight: 700; letter-spacing: var(--ls-val); line-height: var(--lh-val); margin-top: 0; }` ohne font-family: var(--font-display) (Onest kommt über die Sammelregel). Bei ≤960 `.tilt-stats .v { font-size: var(--fv-24); }`. In den Handy-Zeilen `.tilt-stats .v { font-size: var(--fv-20); text-align: right; } .tilt-stats .v small { font-size: var(--fs-12); }`.
- ÄNDERN: Entfallen: Z. 540 `.tile .val` und Z. 639 `.stat-tile .v` (→ aufbau-A2 mit --tile-val), Z. 2397/2446 `.shadow-main` und Z. 2684 `.prop-tiles` (Regeln werden gelöscht), Z. 2945 `.coach-gs-tiles` (Regel wird gelöscht), Z. 1307 `.tilt-stats .v` ≤960 und `.v.cur` (→ abstaende-D4). Bleiben: .stat .v, .tracker-foot .score-n, .detail-head .sym/.big, .prop-balance .val (26 → var(--fv-24)), ol.rp-visual li::before, .streak-tile .val.
- [doppelt: .tilt-stats .v.cur] `.tilt-stats .v.cur` wird gelöscht, in Z. 1304 und in Z. 1307 (abstaende-D4). Alle drei Werte sind gleich groß (32/24/20) und stehen über Subgrid auf einer Linie. Die Klasse cur verschwindet auch aus progress.js:79. Die Token-Umstellung der Typografie für .v.cur entfällt.
- ÄNDERN: Entfallen: Z. 540 `.tile .val` und Z. 639 `.stat-tile .v` (→ aufbau-A2 mit --tile-val), Z. 2397/2446 `.shadow-main` und Z. 2684 `.prop-tiles` (Regeln werden gelöscht), Z. 2945 `.coach-gs-tiles` (Regel wird gelöscht), Z. 1307 `.tilt-stats .v` ≤960 und `.v.cur` (→ abstaende-D4). Bleiben: .stat .v, .tracker-foot .score-n, .detail-head .sym/.big, .prop-balance .val (26 → var(--fv-24)), ol.rp-visual li::before, .streak-tile .val.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .tilt-stats .v] Die Werte sind in beiden Spezifikationen gleich (32, ≤960 24, Handy 20). Die Tilt-Regeln schreibt einmal abstaende-D4, direkt mit Tokens: `.tilt-stats .v { font-size: var(--fv-32); font-weight: 700; letter-spacing: var(--ls-val); line-height: var(--lh-val); margin-top: 0; }` ohne font-family: var(--font-display) (Onest kommt über die Sammelregel). Bei ≤960 `.tilt-stats .v { font-size: var(--fv-24); }`. In den Handy-Zeilen `.tilt-stats .v { font-size: var(--fv-20); text-align: right; } .tilt-stats .v small { font-size: var(--fs-12); }`.
- ÄNDERN: Entfallen: Z. 1303 `.tilt-stats .v` und Z. 1304 `.tilt-stats .v.cur` (→ abstaende-D4). Rest bleibt (.score-big, .voice-time, .big-stat ≤960, .replay-big, .rh-big Handy, .rp-bigtime).
- [doppelt: .tilt-stats .v.cur] `.tilt-stats .v.cur` wird gelöscht, in Z. 1304 und in Z. 1307 (abstaende-D4). Alle drei Werte sind gleich groß (32/24/20) und stehen über Subgrid auf einer Linie. Die Klasse cur verschwindet auch aus progress.js:79. Die Token-Umstellung der Typografie für .v.cur entfällt.
- ÄNDERN: Entfallen: Z. 1303 `.tilt-stats .v` und Z. 1304 `.tilt-stats .v.cur` (→ abstaende-D4). Rest bleibt (.score-big, .voice-time, .big-stat ≤960, .replay-big, .rh-big Handy, .rp-bigtime).
- [konflikt: .big-stat] `.big-stat` bleibt die Hero-Klasse und gilt nur noch im Fortschritt (Serie, Heutiger Fortschritt, % Regeln eingehalten). CSS wie in der Typografie geplant: `font-size: var(--fv-44); letter-spacing: var(--ls-hero); line-height: var(--lh-val);` ohne font-family, bei ≤960 var(--fv-32) (typografie-3.2.2h, fv44, fv32 unverändert). Das Challenge-Widget nutzt `.score-big` (32 px) statt `.big-stat` (siehe Anker widget:challenge). Der Payout-Vorschlag nutzt `.prop-sugg-val` auf --tile-val (aufbau-C12e). Grund: Die Aufbau-Regel sagt „.big-stat 44 px nur Fortschritt und Serie“; W5 hätte das Challenge-Widget ohne die Inline-Größe auf 44 px aufgeblasen. progress.js Z. 69 ändern aufbau-C11a (Pfeil mit Tooltip) und kilook-C18 („—“, Ring und ring-card nur mit Wert) gemeinsam in derselben Zeile; keiner überschreibt den anderen. Den Inhalt von Z. 68 und den Tooltip-Text des Pfeils entscheidet der Anker .trend.

## typografie-3.2.3-fv44 · Werte-Skala --fv-44 (Hero: .streak .big, .fw-big, .rh-big, .big-stat)

Gruppe typografie · Cluster tokens · Aufwand S · Befunde: typografie-3
Quelle: audit/spec/typografie.md Z. 321–324 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
**→ `--fv-44`**
- 42 → 44: Z. 798 `.streak .big` (lh 1 bleibt) · 48 → 44: Z. 1464 `.fw-big` · 56 → 44: Z. 2460 `.rh-big`
- schon 44 → Token: 1203 `.big-stat`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .big-stat] `.big-stat` bleibt die Hero-Klasse und gilt nur noch im Fortschritt (Serie, Heutiger Fortschritt, % Regeln eingehalten). CSS wie in der Typografie geplant: `font-size: var(--fv-44); letter-spacing: var(--ls-hero); line-height: var(--lh-val);` ohne font-family, bei ≤960 var(--fv-32) (typografie-3.2.2h, fv44, fv32 unverändert). Das Challenge-Widget nutzt `.score-big` (32 px) statt `.big-stat` (siehe Anker widget:challenge). Der Payout-Vorschlag nutzt `.prop-sugg-val` auf --tile-val (aufbau-C12e). Grund: Die Aufbau-Regel sagt „.big-stat 44 px nur Fortschritt und Serie“; W5 hätte das Challenge-Widget ohne die Inline-Größe auf 44 px aufgeblasen. progress.js Z. 69 ändern aufbau-C11a (Pfeil mit Tooltip) und kilook-C18 („—“, Ring und ring-card nur mit Wert) gemeinsam in derselben Zeile; keiner überschreibt den anderen. Den Inhalt von Z. 68 und den Tooltip-Text des Pfeils entscheidet der Anker .trend.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .lp .step .k] Die Ablauf-Nummer wird eine ruhige Ziffer vor dem Titel statt eines Kickers: `.lp .step .k { font-family: var(--font-num); color: var(--muted); font-weight: 500; margin-right: 8px; }` (kilook-B8d), Markup `<b><span class="k">1</span>Session starten</b>` (kilook-C7d). Grund: Die BRIEF verlangt „nichts Dekoratives“, also keinen Versal-Kicker in --accent. 900 wäre für eine Ziffer in einem Titel mit 600 zu laut. Gewicht 900 bleibt nur für die Marke und .lp .hero h1.
- ÄNDERN: Nur `.lp .hero h1` font-weight 800 → 900 umsetzen. `.lp .step .k` nicht anfassen, das regelt kilook-B8d mit 500. In der Typografie-Regel „900 = Marke (…)“ den Eintrag .lp .step .k streichen.

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

**Hinweise aus der Abstimmung (verbindlich):**

- ÄNDERN: `--tile-val: var(--fv-24);` in :root; im 960er-Block `:root { --tile-val: var(--fv-20); }`; die 560er-Zeile `:root { --tile-val: 20px; }` entfällt (erbt 20).

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: fmt.balance] Für Bestände und Regelgrößen gibt es keine Ganzzahl-Regel. Geld hat immer 2 Nachkommastellen (zustaende-S-U1); typografie K24 und zustaende K14 haben „Balance und Limits ganzzahlig“ ausdrücklich verworfen, nur kilook will es. fmt.balance bleibt `fmt.cur(v, o)` ohne Vorzeichen und wird im Geld-blind-Modus ausgeblendet. Ohne Cent (compact) stehen Beträge nur im Kalender-Monatsraster (.p Tageszelle, Wochensumme), an Achsen (fmt.axisCur), in Kurzformen (.pm, curShort, curCompact) und bei Monte Carlo. Damit sind Kontostand, Limits, Ziel, Puffer, „… fehlen“, „heute noch … erlaubt“, Vorschlag und die Affiliate-Kacheln so genau wie P&L, und „X von Y“ ist auf beiden Seiten gleich genau. Die Grabstein-Unterzeile zeigt keinen Geldbetrag (wording-S12.28-12.29).
- ÄNDERN: Nur den Kommentar über fmt.balance präzisieren: `/* Kontostand und andere Bestände: ohne Vorzeichen; im Geld-blind-Modus komplett ausgeblendet */`. Kein `compact: true` als Standard.
- [doppelt: fmt.cur] zustaende-S-U1 setzt ui.js:122 einmal um: `const d = o.compact ? 0 : 2;`, mit Überlaufprüfung und notfalls @container 164 → 190 px. Kalender-Monatsraster mit compact: true (kilook-C9a). Das ist dieselbe Änderung wie 6.1/6.2 in wording-S6.1-6.4; wer zuerst umsetzt, macht sie, der andere überspringt. Monte Carlo ohne Cent setzt wording-S10.13-10.15 einmal um, ergänzt um das Startkapital aus kilook-C14. Prop und Affiliate bekommen kein compact (siehe fmt.balance und money). chartLabel aus barrierefreiheit-U6a nutzt das Standardformat.

## kilook-A3 · Regel-Kommentar über U.pnl (Ergebnisse immer mit Vorzeichen, kein signed: false)

Gruppe kilook · Cluster tokens · Aufwand S · Befunde: diagramme-35
Quelle: audit/spec/kilook.md Z. 394–397 · Dateien: web/js/ui.js
Abhängig von: —

```text
**A3 · web/js/ui.js:165 · Regel zu `U.pnl`** (diagramme-35)
- Direkt über `const pnl = …` einfügen:
  `/* Ergebnisse (P&L, Erwartungswert, Ø Gewinn/Verlust) immer mit Vorzeichen; Bestände laufen über fmt.balance ohne Vorzeichen. signed: false hier nicht übergeben. */`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: U.pnl] Die Regel aus kilook-A3 gilt überall: Ergebnisse laufen über U.pnl und tragen immer ein Vorzeichen, signed: false fällt weg (kilook-C9b Z. 166, kilook-C16 Z. 26). Disziplin-Kosten tragen ein Vorzeichen (farbe-C29). Break-even sieht in TradeLog und Tagesansicht gleich aus: `<span class="neu">${fmt.cur(t.pnl, { signed: true, r: t.r })}</span>`, offene Trades zeigen `U.statusPill('open')` (aufbau-C7c und C15a). Prop-Beträge bekommen { currency: a.currency } (siehe money). Im Notebook tragen alle P&L-Beträge die Klasse num: der Notizkopf (farbe-C24c), die Trade-Notiz in der Liste (zustaende-S-NB1) und ebenso die neue Tagesnotiz-Zeile aus aufbau-C10d. responsiv-3.10 und typografie-3.8h sind verträglich (Text von 3.8h siehe U.barRow).

## kilook-A5 · Google-Fonts-Link nur noch Onest (wght@400..800), Inter raus

Gruppe kilook · Cluster tokens · Aufwand S · Befunde: typografie-33
Quelle: audit/spec/kilook.md Z. 402–405 · Dateien: web/app.html, web/index.html
Abhängig von: —

```text
**A5 · web/app.html:11 und web/index.html:11 · Schriften** (typografie-33)
- vorher: `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap">`
- nachher: `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Onest:wght@400..800&display=swap">`

```

## kilook-A6 · Canvas-Schrift der Beispielbilder (sample.js) auf Onest

Gruppe kilook · Cluster tokens · Aufwand S · Befunde: typografie-33
Quelle: audit/spec/kilook.md Z. 406–408 · Dateien: web/js/sample.js
Abhängig von: —

```text
**A6 · web/js/sample.js:311, 321, 323, 324, 325 · Canvas-Schrift** (typografie-33)
- In allen fünf `g.font`-Zeilen `Inter, Roboto, sans-serif` → `Onest, sans-serif`.

```

## bewegung-A1 · Tokens --dur-4, --stagger und --ease-sym in :root ergänzen (--lift-shadow bleibt)

Gruppe bewegung · Cluster tokens · Aufwand S · Befunde: bewegung-1, bewegung-33, bewegung-34
Quelle: audit/spec/bewegung.md Z. 155–164 · Dateien: web/css/app.css
Abhängig von: —

```text
## 3. Umsetzungsschritte

### 3.1 `web/css/app.css` – Tokens und Skala

**A1 `:root` Z. 46–47** (bewegung-1, bewegung-33, bewegung-34)
- Vorher Z. 46: `--dur-1: 150ms; --dur-2: 240ms; --dur-3: 380ms;`
- Nachher: `--dur-1: 150ms; --dur-2: 240ms; --dur-3: 380ms; --dur-4: 640ms; /* nur Einzug von Diagrammen, Score, Ringen */ --stagger: 40ms;`
- Z. 47 am Ende vor dem Kommentar ergänzen: `--ease-sym: cubic-bezier(.45, 0, .55, 1); /* symmetrisch: Schleifen, Atemtakt */`
- `--lift-shadow` (Z. 48, 59, 69) **bleibt** (K2).

```

## bewegung-3.11c · motiontest: Prüfung von --dur-4 (640) und --stagger (40)

Gruppe bewegung · Cluster tokens · Aufwand S · Befunde: —
Quelle: audit/spec/bewegung.md Z. 346–346 · Dateien: web/e2e/motiontest.js
Abhängig von: bewegung-A1

```text
- **motiontest.js:8** ergänzen: `&& Motion.ms('--dur-4') === 640 && Motion.ms('--stagger') === 40`.
```
