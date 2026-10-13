# Paket 002 · tokens

Schritte: 23 · Dateien: scratchpad/localfonts.js, web/README.md, web/css/app.css, web/css/landing.css, web/e2e/localfonts.js
Betroffene Tests laut Spezifikation: Akzeptanz 4.1 Nr. 2–3; Akzeptanz 4.2 Nr. 2 und Nr. 5; Akzeptanz 4.3 Kopfzeile 1024 (Knöpfe 14 px ohne Umbruch); Akzeptanz 4.3 dashboard/stats_summary/trades (Kachelwerte 24); Akzeptanz 4.3 index.html (sieht aus wie vorher); Akzeptanz 4.3 ruhepunkt („Vor dem Trading“ 15/600); Akzeptanz 4.3 shadow/leer_shadow/leer_progress (Intro und Leer-Titel 15/600); Akzeptanz 4.3 sidebar (Navigation 14/500); web/e2e/coachtest.js; web/e2e/headtest.js (Kopfreihe Handy); web/e2e/headtest.js:60–64 (Navigation weiter 500); web/e2e/langtest.js:33 (Überlauf .btn, .tabs button, .seg button); web/e2e/localfonts.js:5–6; web/e2e/mentortest.js; web/e2e/newstest.js; web/e2e/replaytest.js; web/e2e/rptest.js; web/e2e/rptest.js (.rp-bigtime); web/e2e/settest2.js:22; web/e2e/shadowtest.js; web/e2e/streaktest.js; web/e2e/voicetest.js
Baut auf Paketen auf: 1

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## typografie-3.2.3l · --fs-13: übrige 13-px-Regeln auf das Token

Gruppe typografie · Cluster tokens · Aufwand L · Befunde: typografie-3
Quelle: audit/spec/typografie.md Z. 258–259 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
- schon 13 → Token: übrige 13-px-Regeln (z. B. 264, 302, 318, 324, 334, 360, 376, 420, 434, 479, 592, 637, 647, 651, 662, 720, 749, 765, 800, 893, 894, 898, 994, 1023, 1029, 1118, 1268, 1280, 1284, 1355, 1396, 1397, 1415, 1451, 1651, 1659, 1687, 1704, 1710, 1744, 1881, 1897, 1931, 1948, 1951, 2147, 2188, 2244, 2428, 2429, 2459, 2471, 2484, 2509, 2648, 2721, 2728, 2887, 2905, 2923, 3054, 3064, 3084, 3091, 3108)

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .input-unit span] komponenten-C13 löscht .input-unit, .input-unit span und .input-unit .input (Z. 1880–1882), und zwar im selben Schritt wie komponenten-S-misc-e. Das entfernt die letzten Nutzer (misc.js:195/198). Weil die Regel wegfällt, setzt typografie-3.2.3l in Z. 1881 kein Token. zustaende-S-M1b spricht statt .input-unit span das .inp-cur-Gerüst an (Helfer beUnit, siehe Entscheidung zu #be-from).
- ÄNDERN: Z. 1881 (.input-unit span) auslassen, die Regel wird gelöscht.
- [konflikt: .more-link] CSS (aufbau-B12 übernimmt): .more-link { color: var(--text-2); font-weight: 500; font-size: var(--fs-13); line-height: var(--lh-13); text-decoration: none; } .more-link:hover { color: var(--text); }. Ohne Unterstrich beim Hover, wie in der aufbau-Regel („kein Grün, kein Unterstrich“): ruhiger, und gleich wie die übrigen Kopf-Bedienelemente. .more-row wird gelöscht. Touch-Höhe 44 px aus barrierefreiheit-B12e danach, unverändert. Letzte Trades (widgets.js:253/257): Der Link steht im Kartenkopf (aufbau-C2a, U.card trailing), nicht in einer Fußzeile, und heißt „Zum TradeLog“. Das ist laut wording W5 der feste Name für „Navigation aus Widget“ und sagt das Ziel; „Alle Trades“ und „Mehr anzeigen“ fallen weg, denn „Mehr anzeigen“ heißt laut aufbau nur Nachladen. Der Link erscheint nur mit Zeilen (wording W13, zustaende): { info: e.info, cls: 'recent-card', trailing: rows.length ? more('#/trades', 'Zum TradeLog') : '' }. Info-Satz: „Die zuletzt geschlossenen Trades des Kontos und alle noch offenen Positionen. So viele Zeilen, wie in die Karte passen; „Zum TradeLog“ öffnet die ganze Liste.“ Regel-Tracker: trailing ersatzlos streichen (aufbau-C2a = wording 6.15, aufbau übernimmt). Der Leertext-Link geht auf #/settings/regeln.
- ÄNDERN: Z. 1659 (.more-link) auslassen, aufbau-B12 setzt das Token.
- [konflikt: .pager] Eine Fassung für beide Seitenwähler, komponenten-S-trades-c übernimmt den TradeLog. In renderTable: const active = !!(f.q || f.symbol || f.setup || f.status || f.mistake); Zähler oben nur mit Filter: ${active ? `<span class="muted small tl-count">${rows.length} von ${U.count(list.length, 'Trade', 'Trades')}</span>` : ''}. Seitenwähler: „Trades pro Seite“ steht immer. Bei pages > 1 folgen <span class="pg-sep"></span><span class="pg-info">${from + 1}–${to} von ${U.count(rows.length, 'Trade', 'Trades')}</span><span class="grow"></span>, die Seitenauswahl „von ${pages} Seiten“ und .pg-nav mit zwei .btn.nav. Bei pages <= 1 folgt nur ohne aktiven Filter <span class="pg-sep"></span><span class="pg-info">${U.count(rows.length, 'Trade', 'Trades')}</span>, sonst nichts. Grund: Mit Filter zeigt der Zähler oben schon „x von y“; ein zweites „1–7 von 7 Trades“ unten wäre dieselbe Information zweimal (aufbau, Grundsatz 1). Bereichsstrich ohne Leerzeichen „1–10“ (komponenten WORTWAHL). Zähler über U.count (wording W9). Schatten-Ich gleich: bei einer Seite pg-info ${U.count(list.length, 'Verstoß', 'Verstöße')}, sonst „{0}–{1} von {2} Verstößen“. Teil 3 von zustaende-S-T2 (Box schrumpft) wartet weiter auf zustaende-37. typografie-3.2.3l (Z. 1744 Token) passt dazu.
- [konflikt: .rating button] komponenten-C15 ersetzt die Grundregel .rating button (app.css:324) durch .scale5 button: 32×32, Radius 8, Rand --border, Fläche --surface, 500, --text-2, font-size: var(--fs-13); line-height: var(--lh-13). Dazu kommt .scale5.rating button { color: var(--muted); }. Damit sind barrierefreiheit-B9a (32 px) und farbe-B3a (Stern --faint → --muted) erfüllt. Der Gewählt-Zustand folgt der Radio-Semantik aus barrierefreiheit: aria-checked nur am gewählten Stern, Klasse .on kumulativ. Die Sternfarbe ist gelbe Schrift, also --warn-text (farbe): .scale5.rating button.on { --lc: var(--warn-text); }. Die Zeile .rating button[aria-pressed="true"] { --lc: var(--warn); } entfällt. In der gemeinsamen Auswahlregel (app.css:3125) stehen dafür .scale5.rating button.on und .scale5 button[aria-checked="true"]. Das muss deckungsgleich bleiben mit dem Anker .rating button[aria-pressed="true"] (Liste 16).
- ÄNDERN: Z. 324 (.rating button) auslassen, die Regel wird durch .scale5 button mit Token ersetzt.
- [konflikt: .stat-tile .k] Ergebnis: .stat-tile .k { display: flex; align-items: center; gap: 6px; font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 500; color: var(--text-2); }. Die 13.5 px aus komponenten-C25a gelten nicht: Der Wert ist in der Skala verboten, und .tile .head wird ebenfalls 13 (typografie-3.2.3i, aufbau-A3b). Das Ziel von C25a, „gleiche Maße wie .tile“, bleibt damit erfüllt. Gewicht 500 setzen drei Schritte; komponenten-C25a übernimmt die ganze Zeile 637.
- ÄNDERN: Z. 637 auslassen, komponenten-C25a setzt das Token.
- [doppelt: .stat .k] Ergebnis: .stat .k { display: flex; align-items: center; gap: 6px; font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 500; color: var(--text-2); }. Das Gewicht 500 setzt typografie-3.2.4l, das Token typografie-3.2.3l. Die gleiche Zeile in aufbau-A3b entfällt.
- [doppelt: .rp-switch] kilook-C4 und komponenten-C34a löschen genau dasselbe: die fünf .rp-switch-Regeln (Z. 2147–2151) und den Teil „.rp-switch input, .rp-switch input::after, “ in Z. 2333. kilook-C4 übernimmt (toter Code). typografie-3.2.3l setzt in Z. 2147 kein Token.
- ÄNDERN: Z. 2147 (.rp-switch) auslassen, die Regel wird gelöscht.
- [konflikt: .legend.rep] diagramme-A4 löscht .legend.top/.legend.rep (Z. 1649–1651) und legt .chart-legend an. diagramme-E8f stellt das Report-Widget im selben Schritt um. typografie-3.2.3l setzt in Z. 1651 kein Token. Die neue Legende steht gleich in der Text-Skala (Legende 12/16): font-size: var(--fs-12); line-height: var(--lh-12).
- ÄNDERN: Z. 1651 (.legend.rep) auslassen, die Regel wird gelöscht.
- [konflikt: .fd-pair .input] .fd-pair .input bekommt das Token aus typografie-3.2.3l. Im Filter-Fenster wirkt .fd-pop .fd-pair .input mit var(--fs-12) (typografie-3.2.3f). Das neue Datums-Overlay .dp-display aus wording-S3.1-3.3 nimmt dieselben Stufen wie sein Feld statt 13.5/12.5 px, denn beide Werte sind in der Skala verboten und das Overlay muss deckungsgleich mit dem Feldtext sein: .dp-display { …; font-size: var(--fs-14); line-height: var(--lh-14); } (wie .input nach typografie-3.2.3m) und .fd-pop .fd-pair .dp-display { font-size: var(--fs-12); line-height: var(--lh-12); left: 11px; }. Der leere Zustand („Offen“) steht in Platzhalterfarbe --muted statt --faint, weil --faint laut farbe nie für Wörter gilt und Platzhalter laut farbe-B3a --muted sind: .dp-display.empty { color: var(--muted); } und .input.is-empty::-webkit-datetime-edit { color: var(--muted); }. Die Platzhalter „Von“/„Bis“ und die Filtertexte aus wording-S7.4-7.6 bleiben.
- [konflikt: .tabs button] Die Reiter-Schiene aus komponenten-C19 gilt, die Einträge aber in der Text-Skala: .tabs > button, .tabs > a, .prop-tabs a { …; font-size: var(--fs-14); line-height: var(--lh-14); font-weight: 500; … } statt 13.5px. 13.5 ist verboten, Reiter haben laut typografie 14 wie .btn. Auf dem Handy (Z. 3054): .tabs > button, .tabs > a { padding: 0 12px; font-size: var(--fs-13); line-height: var(--lh-13); }. Die Fokus-Zeile in C19 setzt nur outline-offset: -2px; Farbe und Stärke kommen aus der globalen :focus-visible-Regel, --accent als Fokusfarbe ist verboten. typografie-3.2.3m (Z. 660) und typografie-3.2.3l (Z. 3054) lassen die von C19 ersetzten Zeilen aus.
- ÄNDERN: Z. 3054 (.tabs button, Handy) auslassen, C19 ersetzt die Regel mit Token.
- [konflikt: .nw-loading] Beim Laden zeigt News ein Skelett statt Ring und Text (BRIEF: Skelett, kein Ladesymbol). zustaende-S-C13 ersetzt .nw-loading durch .nw-skel, zustaende-S-NW2 stellt news.js:87 im selben Schritt um. typografie-3.2.3l setzt in Z. 3108 kein Token. Die Abstände des Skeletts folgen der Liste, damit nach dem Laden nichts springt: .nw-skel { display: flex; flex-direction: column; gap: var(--sp-4); } (wie .nw-list, Raster 16 laut abstaende), .coach-skel { …; gap: var(--sp-2); }.
- ÄNDERN: Z. 3108 (.nw-loading) auslassen, die Regel wird ersetzt.
- [konflikt: .fd-pop .fd-gh] Die Gruppenköpfe im Filter-Fenster („Trade“, „Zeit“ …) werden Eyebrows, wie `.popover .sec` in allen anderen Menüen (aufbau K11). Einheitlich heißt hier: `.fd-pop .fd-gh` kommt in die Eyebrow-Sammelregel von typografie-3.2.2b (var(--fs-11)/var(--lh-11), 600, Versal, .06em, 'case', --muted). Die Einzelregel Z. 1355 wird `.fd-pop .fd-gh { padding: 10px 2px 6px; font-family: var(--font); }`, Pfeil und Zähler bleiben. Die Sammelregel steht zwar früher in der Datei (Z. 101), gewinnt aber mit der Spezifität (0,2,0) gegen die Grundregel `.fd-gh` (Z. 1374, 15/600 --text). Nicht auf 13 px tokenisieren.
- ÄNDERN: Z. 1355 (`.fd-pop .fd-gh`) aus der Liste der 13-px-Regeln streichen, sie wird Eyebrow (Sammelregel 11 px).
- [konflikt: .nw-dh] Das Ergebnis lautet `.nw-dh { …; font-size: var(--fs-14); line-height: var(--lh-14); font-weight: 600; … }`. Der Rest der Regel bleibt. Begründung: Der News-Tageskopf ist ein Listen-Titel (14/600). Die Zeilen darunter (.nw-row) gehen laut typografie 3.2.3m auf 14, und eine Überschrift ist nie kleiner als ihr Inhalt (aufbau, Grundsatz 4).
- ÄNDERN: Z. 3084 (`.nw-dh`) aus der Liste der 13-px-Regeln streichen. aufbau-A4d setzt --fs-14.
- [konflikt: .cpn-off] Das Ergebnis lautet `.cpn-off { font-size: var(--fs-13); line-height: var(--lh-13); color: var(--text-2); }`. Begründung: 13,5 px ist laut typografie verboten, und die Rabattzeile hat die Rolle „Beschreibung“ (13). Die gewünschte Hervorhebung leistet die Farbe --text-2 statt --muted.
- [doppelt: .seg button] Beide wollen 13 px für die Segmenttasten. komponenten-C14a ersetzt Z. 318 vollständig und schreibt die Größe gleich als Token: `.seg button { height: 34px; padding: 0 14px; border-radius: 9px; border: 1px solid transparent; background: none; color: var(--text-2); font-weight: 500; font-size: var(--fs-13); line-height: var(--lh-13); white-space: nowrap; cursor: pointer; transition: …wie spezifiziert… }`. Tokenisiert typografie-3.2.3l Z. 318 vorher, ist das Ergebnis dasselbe.

## typografie-3.2.3m · --fs-14: 13.5 px → 14 (Knopf, Eingabe, Reiter, Listen-Titel u. a.; .coach-nrow b entfällt später über 3.2.4 Zeilentitel)

Gruppe typografie · Cluster tokens · Aufwand L · Befunde: typografie-3
Quelle: audit/spec/typografie.md Z. 260–261 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
**→ `--fs-14`**
- 13.5 → 14: Z. 267–270 `.btn`, 289–291 `.input, .select, textarea.input` (Zeilenhöhe von `textarea.input` 1.5 bleibt), 429 `.dp-month`, 450 `.cp-hex`, 660 `.tabs button`, 845 `.inp-cur .cur-sym`, 862 `.dir-opt`, 881 `.sym-opt`, 978 `.nb .folder`, 1001 `.nb .note-item b`, 1478 `.fw-acc-n b`, 1586 `.add-slot`, 1611 `.sp-item b`, 1720 `.rep-it`, 2203 `.rp-guide` (1.7 bleibt), 2214 `.rp-btn`, 2224 `.rp-l`, 2261 `dl.rp-summary dt`, 2294 `.rp-breath .rp-hint`, 2328 `.rp-list .rp-li-main b`, 2359 `.mentor-err`, 2412 `.sr-num .input`, 2590 `.prop-tabs a`, 2595 `.prop-sub a`, 2640 `.pfm-top b`, 2763 `.prop-patterns, .prop-highlights` (1.45 → Token), 2921 `.mr-text` (1.5 bleibt), 2949 `.coach-nrow b`, 2953 `.coach-co-what`, 3088 `.nw-row`
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .tabs button] Die Reiter-Schiene aus komponenten-C19 gilt, die Einträge aber in der Text-Skala: .tabs > button, .tabs > a, .prop-tabs a { …; font-size: var(--fs-14); line-height: var(--lh-14); font-weight: 500; … } statt 13.5px. 13.5 ist verboten, Reiter haben laut typografie 14 wie .btn. Auf dem Handy (Z. 3054): .tabs > button, .tabs > a { padding: 0 12px; font-size: var(--fs-13); line-height: var(--lh-13); }. Die Fokus-Zeile in C19 setzt nur outline-offset: -2px; Farbe und Stärke kommen aus der globalen :focus-visible-Regel, --accent als Fokusfarbe ist verboten. typografie-3.2.3m (Z. 660) und typografie-3.2.3l (Z. 3054) lassen die von C19 ersetzten Zeilen aus.
- ÄNDERN: Z. 660 (.tabs button) auslassen, C19 ersetzt die Regel mit Token.
- [konflikt: .prop-tabs a] Die Schiene aus komponenten-C19 ist die einzige Regel für `.tabs > button, .tabs > a, .prop-tabs a`, mit Skalenwerten statt 13.5/12.5 px: `display: inline-flex; align-items: center; height: 34px; padding: 0 12px; border: 1px solid transparent; border-radius: 9px; background: none; color: var(--text-2); font-size: var(--fs-14); line-height: var(--lh-14); font-weight: 500; …` (Rest wie C19). Fokus: `.tabs > button:focus-visible, .tabs > a:focus-visible, .prop-tabs a:focus-visible { outline-offset: -2px; }`, nur der Versatz. Farbe und Stärke kommen aus der globalen :focus-visible-Regel, nach barrierefreiheit-A1 var(--focus), nie --accent. Handy ≤560: `.prop-tabs a { flex: 1 1 auto; justify-content: center; padding: 0 4px; font-size: var(--fs-13); line-height: var(--lh-13); }`. Handy Z. 3054: `.tabs > button, .tabs > a { padding: 0 12px; font-size: var(--fs-13); line-height: var(--lh-13); }`. Gewählt über die gemeinsame Regel am Dateiende mit `.prop-tabs a[aria-current="page"]` (barrierefreiheit-B9b). Erst danach streichen prop.js 304/305 und affiliate.js 51 das aria-pressed (inkl. der Testanpassungen barrierefreiheit.md Z. 905–907). Grund: Reiter = 14/500 laut Typografie-Rollen, 12.5/13.5 sind verboten, Grün nie für Fokus (BRIEF, barrierefreiheit Z1).
- ÄNDERN: `.tabs button` (Z. 660) und `.prop-tabs a` (Z. 2590) nicht einzeln anfassen. Die Zeilen ersetzt komponenten-C19, und die Größe var(--fs-14)/var(--lh-14) steht dort in der gemeinsamen Regel.
- [konflikt: .prop-sub a] komponenten-C20 trägt die Unterstrich-Reiter `.subtabs > button, .set-tabs > button, .prop-sub a` mit `font-size: var(--fs-14); line-height: var(--lh-14); font-weight: 500; color: var(--muted)`. Hover und gewählt in --text, Linie `::after` mit `background: var(--text)`. Gewählt bei Knöpfen `[aria-pressed="true"]`, bei den Prop-Links `.prop-sub a[aria-current="page"]` (für Farbe und `::after { transform: scaleX(1) }`), weil Links kein aria-pressed tragen (barrierefreiheit Z4). Fokus `outline-offset: -2px`, nur der Versatz. Die Farbe kommt global, nicht --accent. -2px statt 2px, weil die Leiste mit overflow-x: auto den äußeren Ring oben abschneiden würde (barrierefreiheit Z1). .set-tabs bleibt damit 14 px und wird nur 600 → 500. Grund: Typografie-Rolle Reiter 14/500, keine 13.5 px. Unterstrich in --text statt Grün (BRIEF).
- ÄNDERN: `.prop-sub a` (Z. 2595) nicht einzeln anfassen. Die Größe steht in der gemeinsamen Regel von komponenten-C20.
- [konflikt: .sym-opt] Die Symbol-Liste ist ein Menü. Menüeintrag = 13 (typografie 1.5 „alle Popover gleich“, komponenten Menüs). Ergebnis `.sym-opt { …; gap: 10px; min-height: 36px; padding: 0 10px; font-size: var(--fs-13); line-height: var(--lh-13); … }`, nicht 14. Die Zuordnung von .sym-opt zu 14 in typografie-3.2.3m widerspricht der eigenen Rollentabelle.
- ÄNDERN: `.sym-opt` (Z. 881) nicht auf --fs-14 setzen. Die Größe 13 (Token) setzt komponenten-C21c.
- [konflikt: .inp-cur .cur-sym] Das Währungs- oder Prozentzeichen im Feld wird 13 px/500, nicht 14 px. Das Zeichen ist eine leise Einheit neben dem 14-px-Wert. komponenten hat die Rolle ausdrücklich festgelegt („Zeichen 13px/500 --muted, 12 px vom Rand“) und die Einrückung darauf gerechnet. Bei typografie war 13,5 → 14 nur die pauschale Umstellung. 13 liegt auf der Skala, 500 ist das Gewicht für Steuerelemente. Endstand Z. 845: `.inp-cur .cur-sym { position: absolute; top: 50%; transform: translateY(-50%); color: var(--muted); font-weight: 500; font-size: var(--fs-13); line-height: var(--lh-13); pointer-events: none; }`. Die übrigen C13-Werte (left/right 12, Einrückung calc(18px + var(--sl, 1) * 1ch), .w160, `.input-unit` weg) gelten unverändert.
- ÄNDERN: „845 `.inp-cur .cur-sym`“ aus der Liste 13,5 → 14 streichen; die Zeile bekommt `var(--fs-13)`/`var(--lh-13)` mit komponenten-C13.

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

## typografie-3.2.3s · --fs-15: übrige 15-px-Regeln auf das Token (dazu 600 bei .empty b, .rp-sub, .shadow-intro b, .prop-title b, .prop-group-title b)

Gruppe typografie · Cluster tokens · Aufwand M · Befunde: typografie-3
Quelle: audit/spec/typografie.md Z. 271–272 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
- schon 15 → Token: 491 `.card-title`, 677 `.empty b` (dazu 600), 890, 907, 1374, 1502, 2209 `.rp-sub` (700 → 600), 2395 `.shadow-intro b` (dazu 600), 2530, 2537, 2576, 2607, 2621, 2647, 2692 (dazu 600), 2715 (dazu 600), 3075

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .replay-decide .btn.big] komponenten-C09 gilt: Der Knopf nutzt die Standardstufe .btn (14px/500, Höhe md), die Regel lautet `.replay-decide .btn.big { min-width: 132px; justify-content: center; }`. Die 15-px-Angabe, die typografie-3.2.3s in ein Token umwandeln würde, entfällt ganz. Grund: eine Bauart je Rolle. Blind-Replay bleibt hinter dem Feature-Flag.
- ÄNDERN: Z. 2530 (.replay-decide .btn.big) aus der Liste „schon 15 → Token“ streichen.
- [konflikt: .voice-actions .btn.big] komponenten-C09 gilt: Die Regel `.voice-actions .btn.big` wird gelöscht, „Aufnahme starten“ wird ein normaler .btn.primary der Stufe md. Damit gibt es nichts mehr in ein Token umzuwandeln.
- ÄNDERN: Z. 2576 (.voice-actions .btn.big) aus der Liste „schon 15 → Token“ streichen.
- [konflikt: .prop-group-title b] `.prop-group-title b { font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 600; color: var(--text-2); }`: aufbau-A4e mit Typografie-Token, `font-family: var(--font-display)` entfällt. Grund: Der Gruppentitel steht unter „Aktive Konten“ (.prop-h 15/600) und über Karten, deren Titel ebenfalls 15/600 sind (.prop-title b). Eine Unterüberschrift darf nicht gleich groß sein wie die übergeordnete (aufbau Grundsatz 4 und K21; die aufbau-Prüfung Z. 751 erwartet 13px/600). 13/600 ist eine Stufe der Text-Skala, das Gewicht 600 deckt auch typografie-3.2.4f ab.
- ÄNDERN: Z. 2715 (.prop-group-title b) aus „schon 15 → Token (dazu 600)“ streichen.

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
