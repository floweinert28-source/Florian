# Paket 006 · komponenten

Schritte: 33 · Dateien: web/README.md, web/css/app.css, web/js/app.js, web/js/datepicker.js, web/js/screens/dash-filter.js, web/js/ui.js
Betroffene Tests laut Spezifikation: e2e/affiliatetest.js:16; e2e/calmnavtest.js:40–51 (.tabs[data-subnav] scrollLeft); e2e/certtest.js; e2e/colorpickertest.js; e2e/dashtest.js:25, :42 (.seg.mini); e2e/dashtest.js:72 (.tracker-foot); e2e/dptest.js; e2e/filtertest.js; e2e/filtertest.js (.fd-seg); e2e/filtertest.js:13–24 (.fd-chip/.fd-add); e2e/filtertest.js:9, :49, :56; e2e/friedhoftest.js:19–21; e2e/friedhoftest.js:20; e2e/fwtest.js; e2e/headtest.js:63–64; e2e/headtest.js:63–64 (.seg gewählt 500); e2e/langtest.js:33; e2e/langtest.js:33 (keine abgeschnittenen .seg-Tasten); e2e/mobiletest.js:26–27 (Handy-Wert, siehe E1h); e2e/mobiletest.js:29 (TradeLog .tabs button einreihig, flexWrap); e2e/motiontest.js:18, :57; e2e/proptest.js; e2e/proptest.js:19, :91, :95; e2e/rangetest.js; e2e/replaytest.js; e2e/sampletest.js:81; e2e/settest.js:22 (#be-from/#be-to; .input-unit fällt erst mit S-misc-e weg); e2e/shadowtest.js:53 (fill auf input[type=time]); e2e/sixtest.js:26–31; e2e/sixtest.js:39–40; e2e/sixtest.js:53–55 (.nb .tags-row .chip); e2e/sixtest.js:54–56 (#pop-nbtags .item[aria-checked]); e2e/tradeformtest.js:11 (#f-rating); e2e/tradeformtest.js:11, :30, :47 (#f-fees); e2e/tradeformtest.js:21–29 (#sym-menu .sym-opt); e2e/tradeformtest.js:30, :47 (#f-fees); e2e/voicetest.js; web/e2e/motiontest.js: „Kachel hebt sich beim Überfahren“ umkehren (Schritt zustaende-S-TE3)
Baut auf Paketen auf: 1, 2, 4, 5

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## komponenten-C09 · Einzelfälle der Knöpfe auf die Stufen zurückführen

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: komponenten-12
Quelle: audit/spec/komponenten.md Z. 248–255 · Dateien: web/css/app.css
Abhängig von: —

```text
**C09 – Einzelfälle der Knöpfe auf die Stufen zurückführen** (komponenten-12)
- Z. 1678 `.tracker-foot > .btn { flex: 0 0 auto; padding: 8px 12px; font-size: 12.5px; }` → `.tracker-foot > .btn { flex: 0 0 auto; }` (Markup wird `btn sm`, W6).
- Z. 1470 `.fw-go { … padding: 11px 16px; … }` → Angabe `padding` streichen.
- Z. 1492 `.btn.fw-reset { … padding: 11px 14px; font-weight: 600; }` → `padding` streichen, `font-weight: 500`.
- Z. 2576 `.voice-actions .btn.big { … }` löschen.
- Z. 2530 `.replay-decide .btn.big { padding: 13px 26px; font-size: 15px; border-radius: 14px; min-width: 132px; justify-content: center; }` → `.replay-decide .btn.big { min-width: 132px; justify-content: center; }`
- Filter-Fuß siehe C24.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .replay-decide .btn.big] komponenten-C09 gilt: Der Knopf nutzt die Standardstufe .btn (14px/500, Höhe md), die Regel lautet `.replay-decide .btn.big { min-width: 132px; justify-content: center; }`. Die 15-px-Angabe, die typografie-3.2.3s in ein Token umwandeln würde, entfällt ganz. Grund: eine Bauart je Rolle. Blind-Replay bleibt hinter dem Feature-Flag.
- [konflikt: .voice-actions .btn.big] komponenten-C09 gilt: Die Regel `.voice-actions .btn.big` wird gelöscht, „Aufnahme starten“ wird ein normaler .btn.primary der Stufe md. Damit gibt es nichts mehr in ein Token umzuwandeln.

## komponenten-C12 · Dropzone: Symbol 24 px, Padding 20/16, neutraler Hover

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: bereich_trades_tag-1
Quelle: audit/spec/komponenten.md Z. 265–269 · Dateien: web/css/app.css
Abhängig von: —

```text
**C12 – Dropzone** (bereich_trades_tag-1)
- Z. 749 `.dropzone { … padding: 22px; … }` → `padding: 20px 16px;`
- Z. 750 `.dropzone.over, .dropzone:hover { border-color: var(--accent); background: var(--accent-soft); color: var(--text); }` → `.dropzone.over, .dropzone:hover { border-color: var(--text-2); background: var(--surface-2); color: var(--text); }`
- Nach Z. 750 neu: `.dropzone > svg { width: 24px; height: 24px; display: block; margin: 0 auto 8px; color: var(--muted); }`

```

## komponenten-C13 · Einheit im Feld (.inp-cur 12 px vom Rand, 13px/500, .w160) und .input-unit entfernen

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: komponenten-17, komponenten-16, bereich_trades_tag-10, bereich_einstellungen-35
Quelle: audit/spec/komponenten.md Z. 270–278 · Dateien: web/css/app.css
Abhängig von: —

```text
**C13 – Einheit im Feld** (komponenten-17, komponenten-16, bereich_trades_tag-10, bereich_einstellungen-35)
- Z. 844 `.inp-cur .cur-sym { … font-weight: 600; font-size: 13.5px; … }` → `font-weight: 500; font-size: 13px;`
- Z. 846 `.inp-cur.pre .cur-sym { left: 14px; }` → `left: 12px;`
- Z. 847 `.inp-cur.pre .input { padding-left: calc(20px + var(--sl, 1) * 1ch); }` → `calc(18px + var(--sl, 1) * 1ch)`
- Z. 848 `.inp-cur.post .cur-sym { right: 40px; }` → `right: 12px;`
- Z. 849 `.inp-cur.post .input { padding-right: calc(46px + var(--sl, 1) * 1ch); }` → `calc(18px + var(--sl, 1) * 1ch)`
- Neu nach Z. 849: `.inp-cur.w160 { width: 160px; }`
- Z. 1880–1882 (`.input-unit`, `.input-unit span`, `.input-unit .input`) löschen.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .input-unit span] komponenten-C13 löscht .input-unit, .input-unit span und .input-unit .input (Z. 1880–1882), und zwar im selben Schritt wie komponenten-S-misc-e. Das entfernt die letzten Nutzer (misc.js:195/198). Weil die Regel wegfällt, setzt typografie-3.2.3l in Z. 1881 kein Token. zustaende-S-M1b spricht statt .input-unit span das .inp-cur-Gerüst an (Helfer beUnit, siehe Entscheidung zu #be-from).
- [konflikt: .inp-cur .cur-sym] Das Währungs- oder Prozentzeichen im Feld wird 13 px/500, nicht 14 px. Das Zeichen ist eine leise Einheit neben dem 14-px-Wert. komponenten hat die Rolle ausdrücklich festgelegt („Zeichen 13px/500 --muted, 12 px vom Rand“) und die Einrückung darauf gerechnet. Bei typografie war 13,5 → 14 nur die pauschale Umstellung. 13 liegt auf der Skala, 500 ist das Gewicht für Steuerelemente. Endstand Z. 845: `.inp-cur .cur-sym { position: absolute; top: 50%; transform: translateY(-50%); color: var(--muted); font-weight: 500; font-size: var(--fs-13); line-height: var(--lh-13); pointer-events: none; }`. Die übrigen C13-Werte (left/right 12, Einrückung calc(18px + var(--sl, 1) * 1ch), .w160, `.input-unit` weg) gelten unverändert.
- ÄNDERN: Statt `font-size: 13px` das Token schreiben: `font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 500;`.

## komponenten-C14a · Segment als Schiene: Grundregel .seg/.seg button, Hover, .seg.pill löschen

Gruppe komponenten · Cluster komponenten · Aufwand M · Befunde: komponenten-26, bewegung-25, komponenten-44
Quelle: audit/spec/komponenten.md Z. 279–286 · Dateien: web/css/app.css
Abhängig von: —

```text
**C14 – Segment als Schiene** (komponenten-26, bewegung-25, komponenten-44)
- Z. 317–318 ersetzen durch:
```css
.seg { display: inline-flex; flex-wrap: wrap; gap: 2px; padding: 3px; max-width: 100%; border-radius: 12px; border: 1px solid var(--border); background: var(--surface-2); }
.seg button { height: 34px; padding: 0 14px; border-radius: 9px; border: 1px solid transparent; background: none; color: var(--text-2); font-weight: 500; font-size: 13px; white-space: nowrap; cursor: pointer; transition: background var(--dur-1) var(--ease), color var(--dur-1) var(--ease), border-color var(--dur-1) var(--ease), box-shadow var(--dur-1) var(--ease); }
```
- Z. 319 `.seg button:hover { color: var(--text); background: var(--surface-2); }` → `.seg button:hover { color: var(--text); background: var(--surface-3); }`
- Z. 320, 321 bleiben. Z. 322 (`.seg.pill button`) löschen.
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .seg.pill button] `.seg.pill button` wird gelöscht (komponenten-C14a). Der Check-in wird über komponenten-A6 zur `.scale5`. Die Mindestgröße des Check-ins aus barrierefreiheit bleibt erhalten, sitzt aber am neuen Baustein: `.scale5:not(.rating) button { width: 36px; height: 36px; }` und im Block `@media (max-width: 560px)`: `.scale5:not(.rating) button { width: 44px; height: 44px; }`. Die Bewertungssterne (.scale5.rating) bleiben bei 32. Grund: eine Bauart je Rolle (komponenten K24) und die ausdrückliche Touch-Vorgabe Check-in 36/44 (barrierefreiheit Z5).
- [doppelt: .seg button] Beide wollen 13 px für die Segmenttasten. komponenten-C14a ersetzt Z. 318 vollständig und schreibt die Größe gleich als Token: `.seg button { height: 34px; padding: 0 14px; border-radius: 9px; border: 1px solid transparent; background: none; color: var(--text-2); font-weight: 500; font-size: var(--fs-13); line-height: var(--lh-13); white-space: nowrap; cursor: pointer; transition: …wie spezifiziert… }`. Tokenisiert typografie-3.2.3l Z. 318 vorher, ist das Ergebnis dasselbe.
- ÄNDERN: In der neuen Regel `.seg button` `font-size: var(--fs-13); line-height: var(--lh-13);` statt `font-size: 13px` schreiben. Den Rest wie spezifiziert.

## komponenten-C14b · Segment-Varianten angleichen (.seg.mini, .fd-seg) und toten Code löschen (.cert-opts .seg.sm, .seg.segc)

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: komponenten-26
Quelle: audit/spec/komponenten.md Z. 287–291 · Dateien: web/css/app.css
Abhängig von: komponenten-C14a

```text
- Z. 1584–1585 → `.seg.mini { padding: 2px; border-radius: 8px; flex-wrap: nowrap; }` und `.seg.mini button { height: 24px; padding: 0 7px; font-size: 11.5px; border-radius: 6px; }`
- Z. 1385 `.fd-seg { … gap 4 … background: var(--surface); … }` → `gap: 2px; background: var(--surface-2);`; Z. 1386 `.fd-seg button { … font-weight: 600; … }` → `font-weight: 500;`
- Z. 1965–1966 (`.cert-opts .seg.sm button`, `… small`) löschen.
- Z. 2542–2545 (`.seg.segc …`) löschen; in Z. 2754 den Teil `.seg.segc { max-width: 100%; } .seg.segc button { white-space: normal; line-height: 1.25; }` samt Kommentar streichen.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .seg.mini button] Größe 12 statt 11.5: `.seg.mini button { height: 24px; padding: 0 7px; font-size: var(--fs-12); line-height: var(--lh-12); border-radius: 6px; }`. Die übrigen C14b-Änderungen an `.seg.mini` (Schiene `padding: 2px; border-radius: 8px; flex-wrap: nowrap`), `.fd-seg`, `.cert-opts .seg.sm` und `.seg.segc` bleiben. 11.5 px gehört zu den verbotenen Größen der Typografie-Skala. C14b hätte den Wert sonst nach 3.2.3e wieder eingeführt. dashtest.js:25/42 zählt bzw. klickt nur und ist nicht betroffen.
- ÄNDERN: In der neuen Regel `.seg.mini button` `font-size: 11.5px` → `font-size: var(--fs-12); line-height: var(--lh-12)`. Höhe 24, Padding 0 7px und Radius 6 bleiben.
- [doppelt: .fd-seg button] Ergebnis `.fd-seg button { …; font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 500; … }`. Das Gewicht 600 → 500 setzt typografie-3.2.4d als Gewichts-Sweep für alle Filter-Bausteine (.fd-seg button, .fd-tog button, .fd-chip, .fd-add), die Größe typografie-3.2.3h. Von komponenten-C14b bleiben `.fd-seg { gap: 2px; background: var(--surface-2); }` und die Löschungen.
- ÄNDERN: Bei Z. 1386 `.fd-seg button` das Gewicht nicht ändern (typografie-3.2.4d). Nur `.fd-seg { gap: 2px; background: var(--surface-2); }` und die übrigen C14b-Punkte umsetzen.
- [konflikt: .seg.segc button] Toter Code (kein `segc` in js/ oder HTML): komponenten-C14b löscht Z. 2542–2545 und den Handy-Teil in Z. 2754. Nicht tokenisieren.
- [konflikt: .cert-opts .seg.sm button] komponenten-C14b löscht Z. 1965–1966. Das ist kein toter Code: certificate.js:73 rendert `.seg.sm` in `.cert-opts`. Die Format-Schalter erben danach aber die neue Segment-Grundregel aus C14a (34 px, 13 px, 500), und genau das ist gewollt (eine Bauart). Das <small> in den Tasten erbt 500. Nicht tokenisieren.
- ÄNDERN: Löschung wie spezifiziert, aber nicht als toten Code führen. Nach dem Löschen modal_zertifikat (1440 und 390) prüfen: Format-Schiene in einer Zeile, Tasten 34 px.

## komponenten-C15 · 1–5-Skala .scale5 (CSS) inkl. gemeinsamer Auswahlregel

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: komponenten-44
Quelle: audit/spec/komponenten.md Z. 292–303 · Dateien: web/css/app.css
Abhängig von: —

```text
**C15 – 1–5-Skala** (komponenten-44)
- Z. 323–325 (`.rating`, `.rating button`, `.rating button[aria-pressed]`) ersetzen durch:
```css
.scale5 { display: inline-flex; gap: 6px; }
.scale5 button { width: 32px; height: 32px; padding: 0; border-radius: 8px; border: 1px solid var(--border); background: var(--surface); color: var(--text-2); font-size: 13px; font-weight: 500; cursor: pointer; transition: background var(--dur-1) var(--ease), color var(--dur-1) var(--ease), border-color var(--dur-1) var(--ease); }
.scale5 button:hover { color: var(--text); background: var(--surface-2); }
.scale5.rating button { color: var(--muted); }
.rating button[aria-pressed="true"] { --lc: var(--warn); }
```
- In der gemeinsamen Auswahlregel (Z. 3125) `.rating button[aria-pressed="true"]` → `.scale5 button[aria-pressed="true"]`.
- Z. 1390 `.fd-tog.stars button { letter-spacing: -1px; font-size: 11px; color: var(--warn); }` → `letter-spacing` streichen.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .rating button] komponenten-C15 ersetzt die Grundregel .rating button (app.css:324) durch .scale5 button: 32×32, Radius 8, Rand --border, Fläche --surface, 500, --text-2, font-size: var(--fs-13); line-height: var(--lh-13). Dazu kommt .scale5.rating button { color: var(--muted); }. Damit sind barrierefreiheit-B9a (32 px) und farbe-B3a (Stern --faint → --muted) erfüllt. Der Gewählt-Zustand folgt der Radio-Semantik aus barrierefreiheit: aria-checked nur am gewählten Stern, Klasse .on kumulativ. Die Sternfarbe ist gelbe Schrift, also --warn-text (farbe): .scale5.rating button.on { --lc: var(--warn-text); }. Die Zeile .rating button[aria-pressed="true"] { --lc: var(--warn); } entfällt. In der gemeinsamen Auswahlregel (app.css:3125) stehen dafür .scale5.rating button.on und .scale5 button[aria-checked="true"]. Das muss deckungsgleich bleiben mit dem Anker .rating button[aria-pressed="true"] (Liste 16).
- ÄNDERN: .scale5 button mit font-size: var(--fs-13); line-height: var(--lh-13) statt 13px. Die Zeile .rating button[aria-pressed="true"] { --lc: var(--warn); } → .scale5.rating button.on { --lc: var(--warn-text); }. In der Auswahlregel Z. 3125 .scale5.rating button.on, .scale5 button[aria-checked="true"] statt .scale5 button[aria-pressed="true"].
- [konflikt: .rating] Eine Bauart `.scale5` für Check-in und Bewertung (komponenten), mit der ARIA-Struktur aus barrierefreiheit. Die Zustände hängen deshalb an `aria-checked` bzw. der Klasse `.on`, nicht mehr an `aria-pressed`. Gelbe Schrift ist `--warn-text` (Farbregel). MARKUP app.js: Z. 428 `<span class="lbl" id="f-rating-l">Bewertung</span><div class="scale5 rating" id="f-rating" role="radiogroup" aria-labelledby="f-rating-l">` mit Knöpfen `role="radio" class="${t.rating >= n ? 'on' : ''}" aria-checked="${t.rating === n}" aria-label="${n} von 5 Sternen"`; set-rating schaltet `.on` kumulativ und `aria-checked` nur am n-ten Stern (P13). Z. 513 `scale()` wird `<div class="scale5" role="radiogroup" aria-labelledby="${lid}" data-chips="${name}">` mit `role="radio" aria-checked aria-label="${n} – ${label}"`; seg-set setzt aria-checked (P14a). CSS app.css statt Z. 322–325: `.scale5 { display: inline-flex; gap: 6px; } .scale5 button { width: 32px; height: 32px; padding: 0; border-radius: 8px; border: 1px solid var(--border); background: var(--surface); color: var(--text-2); font-size: 13px; font-weight: 500; cursor: pointer; transition: … var(--dur-1) var(--ease); } .scale5 button:hover { color: var(--text); background: var(--surface-2); } .scale5.rating button { color: var(--muted); } .scale5.rating button.on { --lc: var(--warn-text); }`. Im Handy-Block (≤560px): `.scale5 button { width: 44px; height: 44px; }`, 5 × 44 + 4 × 6 = 244 px. In der gemeinsamen Auswahlregel (~Z. 3125) wird `.rating button[aria-pressed="true"]` zu `.scale5 button[aria-checked="true"], .scale5.rating button.on`; das gilt auch für barrierefreiheit-B9b, das diesen Selektor dann nicht mehr anfasst. Größe: Desktop einheitlich 32 px für beide Skalen, denn 32 ≥ 24 erfüllt WCAG 2.5.8 und eine Bauart hat eine Größe. Die 36 px aus barrierefreiheit stammen von der alten Pillenform, die komponenten löscht. Am Handy 44 px, wie barrierefreiheit es für Touch verlangt, für die ganze Bauart. barrierefreiheit-Test 19 (≥ 44 bei 390 px) bleibt gültig; Prüfpunkt 22 heißt dann „Check-in-Skala 32 px (Handy 44)“.
- ÄNDERN: `.scale5.rating button.on { --lc: var(--warn-text); }` statt `.rating button[aria-pressed="true"] { --lc: var(--warn); }`. In der gemeinsamen Auswahlregel `.scale5 button[aria-checked="true"], .scale5.rating button.on` statt `.scale5 button[aria-pressed="true"]`. Neu im Handy-Block (≤560px) `.scale5 button { width: 44px; height: 44px; }`. Übrige Werte und das Streichen von letter-spacing an `.fd-tog.stars button` bleiben.
- [konflikt: .rating button[aria-pressed="true"]] Den Selektor gibt es danach nicht mehr. Endzustand wie beim Anker .rating: `.scale5.rating button { color: var(--muted); }` und `.scale5.rating button.on { --lc: var(--warn-text); }`. Gelbe Schrift ist immer --warn-text (farbe). Im hellen Design hat --warn als Schrift zu wenig Kontrast. In der gemeinsamen Auswahlregel steht `.scale5 button[aria-checked="true"], .scale5.rating button.on`.
- ÄNDERN: `.scale5.rating button.on { --lc: var(--warn-text); }` statt `.rating button[aria-pressed="true"] { --lc: var(--warn); }`. In der gemeinsamen Auswahlregel `.scale5 button[aria-checked="true"], .scale5.rating button.on` statt `.scale5 button[aria-pressed="true"]`. Neu im Handy-Block (≤560px) `.scale5 button { width: 44px; height: 44px; }`. Übrige Werte und das Streichen von letter-spacing an `.fd-tog.stars button` bleiben.
- [reihenfolge: --lc] Keine Werte-Kollision: C23 entfernt --lc an den News-Wichtigkeits-Chips, C15 setzt --lc an den Bewertungssternen (Wert --warn-text, siehe Anker .rating). Die Umkehr der newstest-Prüfung (D2b) setzt die Code-Änderung C23 voraus.

## komponenten-C16 · Chips: wählbar 28 px, in Tabellen/Detailkopf 22 px, Filter- und Notebook-Chips angleichen

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: komponenten-36, komponenten-45
Quelle: audit/spec/komponenten.md Z. 304–311 · Dateien: web/css/app.css
Abhängig von: —

```text
**C16 – Chips** (komponenten-36, komponenten-45)
- Z. 628 `.chip.sel { cursor: pointer; … }` → zusätzlich `height: 28px; padding: 0 10px;`
- Z. 1879 `.chip.sel.big { … }` löschen.
- Nach Z. 632 neu: `.tbl .chip, .detail-head .chip { padding: 2px 9px; font-size: 11.5px; line-height: 16px; }` (22 px mit Rand).
- Z. 1400 `.fd-chip { … height: 30px; … border-radius: 8px; … font-size: 12.5px; font-weight: 600; … }` → `height: 28px; border-radius: 999px; font-size: 12px; font-weight: 500;`
- Z. 1407 `.fd-add { … height: 30px; … border-radius: 8px; … font-size: 12.5px; font-weight: 600; … }` → `height: 28px; border-radius: 999px; font-size: 12px; font-weight: 500;`
- Z. 992 `.nb .tagpill { … padding: 4px 10px; … font-weight: 600; … }` → `height: 28px; padding: 0 10px; … font-weight: 500;`; Z. 993 `.nb .tagpill b { color: var(--muted); font-weight: 600; }` → `font-size: 11px; font-weight: 500;`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .chip.sel.big] Die Regel .chip.sel.big wird gelöscht (komponenten-C16), und das Markup misc.js:193 wird „chip sel“ (komponenten-S-misc-e). Damit sind alle wählbaren Chips einheitlich 28 px hoch, 12px/500. Beides gehört in einen Schritt. typografie-3.2.3p setzt in Z. 1879 kein Token. Ob der Block „Was handelst du?“ bzw. „Märkte“ bleibt, entscheidet die offene Frage bereich_einstellungen-6. Die Löschung gilt in beiden Fällen.
- [konflikt: .fd-chip] .fd-chip ist ein Chip, keine Segment-Taste. Ergebnis: height: 28px; border-radius: 999px; font-size: var(--fs-12); line-height: var(--lh-12); font-weight: 500 (Padding, Rand und Farben wie bisher). Grund: Die Rollentabelle von typografie (Chip = --fs-12) und komponenten (Chips 12px/500) stimmen überein; 13 gilt für Segmente und Menüeinträge. So gleicht der Filter-Chip .chip und .nb .tagpill. Das Gewicht 500 setzen aufbau-A4f, komponenten-C16 und typografie-3.2.4d; komponenten-C16 übernimmt.
- ÄNDERN: Z. 1400 .fd-chip mit font-size: var(--fs-12); line-height: var(--lh-12) statt 12px. Höhe 28, Radius 999 und Gewicht 500 wie spezifiziert.
- [konflikt: .fd-add] Gleiche Entscheidung wie bei .fd-chip, weil der Hinzufügen-Chip neben den Chips steht und gleich hoch sein muss: height: 28px; border-radius: 999px; font-size: var(--fs-12); line-height: var(--lh-12); font-weight: 500. komponenten-C16 übernimmt. aufbau-A4f, typografie-3.2.3h und typografie-3.2.4d lassen .fd-add aus (Anpassungen wie bei .fd-chip).
- ÄNDERN: Z. 1407 .fd-add mit font-size: var(--fs-12); line-height: var(--lh-12) statt 12px. Rest wie spezifiziert.
- [doppelt: .nb .tagpill b] Eine Regel, komponenten-C16 übernimmt: .nb .tagpill b { color: var(--muted); font-family: var(--font-num); font-size: var(--fs-11); line-height: var(--lh-11); font-weight: 500; }. Größe 11 kommt aus komponenten, Onest aus typografie (Zähler sind Ziffern), beide wollen 500. typografie-3.2.4e behält nur .nb-details summary.
- ÄNDERN: Z. 993 → .nb .tagpill b { color: var(--muted); font-family: var(--font-num); font-size: var(--fs-11); line-height: var(--lh-11); font-weight: 500; }
- [doppelt: .nb .tagpill] Beide setzen 600 → 500, komponenten-C16 übernimmt mit der vollständigen Chip-Fassung: height: 28px; padding: 0 10px; font-size: var(--fs-12); line-height: var(--lh-12); font-weight: 500 (Rand, Fläche, Farbe, Lücke 6 bleiben). typografie-3.2.4e lässt die Zeile aus (Anpassung wie bei .nb .tagpill b).
- ÄNDERN: Z. 992 mit font-size: var(--fs-12); line-height: var(--lh-12) statt 12px. Höhe 28, Padding 0 10px und Gewicht 500 wie spezifiziert.

## komponenten-C17a · Native Häkchen (accent-color: var(--text)) und Quill-Checklisten neutral

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: komponenten-33
Quelle: audit/spec/komponenten.md Z. 312–316 · Dateien: web/css/app.css
Abhängig von: —

```text
**C17 – Häkchen und Abhak-Kästchen** (komponenten-33, bereich_konto-23, bereich_training-48)
- Z. 303 `.check input { accent-color: var(--accent); … }` → `accent-color: var(--text);`
- Z. 2731 `.prop-assign-row input { accent-color: var(--accent); … }` → `accent-color: var(--text);`
- Z. 2904 `.coach-radio input { … accent-color: var(--accent); }` → `accent-color: var(--text);`
- Z. 1143 `.ql-editor li[data-list=checked] > .ql-ui, .ql-editor li[data-list=unchecked] > .ql-ui { color: var(--accent); }` → `color: var(--text-2);`
```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .check input] Beide setzen `.check input { accent-color: var(--text); }`. komponenten-C17a übernimmt das, weil es auch `.prop-assign-row input`, `.coach-radio input` und die Quill-Checklisten im selben Zug neutralisiert.
- [doppelt: .coach-radio input] Das Ergebnis lautet `.coach-radio input { margin-top: 3px; accent-color: var(--text); }`. Gesetzt wird das von komponenten-C17a, das alle nativen Häkchen und Optionsfelder in einem Zug neutral stellt.
- [doppelt: .prop-assign-row input] Das Ergebnis lautet `.prop-assign-row input { accent-color: var(--text); width: 16px; height: 16px; }` (Z. 2731). Beide Schritte meinen dieselbe Änderung, komponenten-C17a übernimmt sie als Teil der gemeinsamen Häkchen-Regel.
- ÜBERNIMMT farbe-C8a: Identische Änderung. Sie wird in komponenten-C17a umgesetzt.
- [doppelt: .ql-editor li[data-list=checked] > .ql-ui] Z. 1143 ist eine gemeinsame Regel für checked und unchecked und wird `.ql-editor li[data-list=checked] > .ql-ui, .ql-editor li[data-list=unchecked] > .ql-ui { color: var(--text-2); }`. Das setzt komponenten-C17a. Der Wert ist in beiden Schritten gleich.
- [doppelt: .ql-editor li[data-list=unchecked] > .ql-ui] Es ist dieselbe Regel (Z. 1143) wie beim Anker `.ql-editor li[data-list=checked] > .ql-ui`: `color: var(--text-2)`, gesetzt von komponenten-C17a.

## komponenten-C19 · Reiter-Schiene für .tabs und .prop-tabs (außen 42, Einträge 34), alte Reiter-Regeln löschen

Gruppe komponenten · Cluster komponenten · Aufwand M · Befunde: referenz-23, bereich_statistik-6, komponenten-27
Quelle: audit/spec/komponenten.md Z. 334–348 · Dateien: web/css/app.css
Abhängig von: —

```text
**C19 – Reiter-Schiene** (referenz-23, bereich_statistik-6, komponenten-27)
- Z. 659–661 ersetzen durch:
```css
.tabs, .prop-tabs { display: inline-flex; gap: 2px; padding: 3px; max-width: 100%; border-radius: 12px; border: 1px solid var(--border); background: var(--surface); overflow-x: auto; scrollbar-width: none; overscroll-behavior-x: contain; }
.tabs::-webkit-scrollbar, .prop-tabs::-webkit-scrollbar { display: none; }
.tabs > button, .tabs > a, .prop-tabs a { display: inline-flex; align-items: center; height: 34px; padding: 0 12px; border: 1px solid transparent; border-radius: 9px; background: none; color: var(--text-2); font-size: 13.5px; font-weight: 500; text-decoration: none; white-space: nowrap; cursor: pointer; flex: 0 0 auto; transition: background var(--dur-1) var(--ease), color var(--dur-1) var(--ease), border-color var(--dur-1) var(--ease); }
.tabs > button:hover, .tabs > a:hover, .prop-tabs a:hover { color: var(--text); background: var(--surface-2); }
.tabs > button:focus-visible, .tabs > a:focus-visible, .prop-tabs a:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
```
- Z. 1508 `.tabs.sm button { … }` löschen.
- Z. 1511–1513 → `.tabs.scroll-x { overflow-x: auto; flex-wrap: nowrap; padding: 3px; margin: 0; }` (die zweite Regel mit `margin: -4px …` und der `::-webkit-scrollbar`-Regel entfallen, beides steht jetzt in der Grundregel).
- Z. 2588–2591 (`.prop-tabs`, `::-webkit-scrollbar`, `.prop-tabs a`, `:hover`) löschen; in Z. 2591 bleibt nur `.prop-sub a:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }` (wird in C20 erweitert).
- Z. 2753 (Handy, `.prop-tabs`): `.prop-tabs a { flex: 1 1 auto; text-align: center; padding: 8px 4px; font-size: 12.5px; }` → `.prop-tabs a { flex: 1 1 auto; justify-content: center; padding: 0 4px; font-size: 12.5px; }`
- Z. 3054 (Handy) `.tabs button { padding: 9px 14px; font-size: 13px; }` → `.tabs > button, .tabs > a { padding: 0 12px; font-size: 13px; }`; Z. 3052 `.tabs { flex-wrap: nowrap; overflow-x: auto; … }` bleibt.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .tabs button] Die Reiter-Schiene aus komponenten-C19 gilt, die Einträge aber in der Text-Skala: .tabs > button, .tabs > a, .prop-tabs a { …; font-size: var(--fs-14); line-height: var(--lh-14); font-weight: 500; … } statt 13.5px. 13.5 ist verboten, Reiter haben laut typografie 14 wie .btn. Auf dem Handy (Z. 3054): .tabs > button, .tabs > a { padding: 0 12px; font-size: var(--fs-13); line-height: var(--lh-13); }. Die Fokus-Zeile in C19 setzt nur outline-offset: -2px; Farbe und Stärke kommen aus der globalen :focus-visible-Regel, --accent als Fokusfarbe ist verboten. typografie-3.2.3m (Z. 660) und typografie-3.2.3l (Z. 3054) lassen die von C19 ersetzten Zeilen aus.
- ÄNDERN: In der Eintragsregel font-size: var(--fs-14); line-height: var(--lh-14) statt 13.5px. Handy-Regel Z. 3054 mit font-size: var(--fs-13); line-height: var(--lh-13). Fokus-Zeile → .tabs > button:focus-visible, .tabs > a:focus-visible, .prop-tabs a:focus-visible { outline-offset: -2px; }, ohne outline-Farbe.
- [konflikt: .prop-tabs a] Die Schiene aus komponenten-C19 ist die einzige Regel für `.tabs > button, .tabs > a, .prop-tabs a`, mit Skalenwerten statt 13.5/12.5 px: `display: inline-flex; align-items: center; height: 34px; padding: 0 12px; border: 1px solid transparent; border-radius: 9px; background: none; color: var(--text-2); font-size: var(--fs-14); line-height: var(--lh-14); font-weight: 500; …` (Rest wie C19). Fokus: `.tabs > button:focus-visible, .tabs > a:focus-visible, .prop-tabs a:focus-visible { outline-offset: -2px; }`, nur der Versatz. Farbe und Stärke kommen aus der globalen :focus-visible-Regel, nach barrierefreiheit-A1 var(--focus), nie --accent. Handy ≤560: `.prop-tabs a { flex: 1 1 auto; justify-content: center; padding: 0 4px; font-size: var(--fs-13); line-height: var(--lh-13); }`. Handy Z. 3054: `.tabs > button, .tabs > a { padding: 0 12px; font-size: var(--fs-13); line-height: var(--lh-13); }`. Gewählt über die gemeinsame Regel am Dateiende mit `.prop-tabs a[aria-current="page"]` (barrierefreiheit-B9b). Erst danach streichen prop.js 304/305 und affiliate.js 51 das aria-pressed (inkl. der Testanpassungen barrierefreiheit.md Z. 905–907). Grund: Reiter = 14/500 laut Typografie-Rollen, 12.5/13.5 sind verboten, Grün nie für Fokus (BRIEF, barrierefreiheit Z1).
- ÄNDERN: In der Grundregel `font-size: 13.5px` → `font-size: var(--fs-14); line-height: var(--lh-14);`. Die Fokusregel nur mit `outline-offset: -2px` (kein `outline: 2px solid var(--accent)`). Z. 2592 (`.prop-tabs a:focus-visible, .prop-sub a:focus-visible`) vollständig löschen, statt den .prop-sub-Teil stehen zu lassen (komponenten-C20 bringt ihn). Handy Z. 2753: `font-size: var(--fs-13); line-height: var(--lh-13);` statt 12.5px. Handy Z. 3054: `font-size: var(--fs-13); line-height: var(--lh-13);` statt 13px.
- [konflikt: .prop-sub a:focus-visible] Am Ende gibt es eine einzige Fokusregel: `.subtabs > button:focus-visible, .set-tabs > button:focus-visible, .prop-sub a:focus-visible { outline-offset: -2px; }` (aus komponenten-C20). Ring 2px var(--focus) aus der globalen Regel. Die alte Z. 2592 löscht komponenten-C19 vollständig. Grund: barrierefreiheit Z1 („nur der Versatz weicht ab“, −2px in Scroll-Leisten), kein Grün als Fokus (BRIEF).
- ÄNDERN: Z. 2591/2592 komplett löschen. Keine Zwischenregel `.prop-sub a:focus-visible { outline: 2px solid var(--accent) … }` stehen lassen.
- [konflikt: .prop-tabs a:focus-visible] `.tabs > button:focus-visible, .tabs > a:focus-visible, .prop-tabs a:focus-visible { outline-offset: -2px; }` aus komponenten-C19, ohne eigene Farbe. Der Ring kommt global (2px var(--focus) nach barrierefreiheit-A1). Gleiche Begründung wie bei .prop-sub a:focus-visible.
- ÄNDERN: In der Fokusregel `outline: 2px solid var(--accent);` streichen, nur `outline-offset: -2px;` setzen.
- [konflikt: .tabs.scroll-x] Statistik-Reiter in stats.js Z. 15, genau so: `<nav class="tabs scroll-x" data-subnav aria-label="Statistik-Bereiche">${TABS.map(([k, l]) => `<a href="#/stats/${k}"${tab === k ? ' aria-current="page"' : ''}>${l}</a>`).join('')}</nav>`. Das heißt: <nav> mit Namen, kein .btn, keine Inline-Farbe, kein aria-pressed, aria-current nur am gewählten Link. CSS: `.tabs.scroll-x { overflow-x: auto; flex-wrap: nowrap; padding: 3px; margin: 0; }` (C19). Ungewählt --text-2 und Hover --text kommen aus der Schienen-Regel `.tabs > a` (C19). Gewählt kommt aus der gemeinsamen Regel mit `.tabs a[aria-current="page"]` (B9b). Die Zusatzregel `.tabs a:not([aria-current="page"]) …` aus B9b ist überflüssig. Abstand zum Inhalt: Die Schiene hat jetzt einen sichtbaren Rand und kein Scroll-Polster mit Gegenrand mehr. Deshalb entfällt der −4px-Ausgleich in abstaende-C8. Grund: Schiene statt Rahmenknöpfe (komponenten), Navigation als <nav> mit aria-current (barrierefreiheit Z4), 12 px Reiter↔Inhalt (abstaende).
- [konflikt: .tabs.sm button] `.tabs.sm button` (Z. 1508) wird gelöscht (komponenten-C19). Der einzige Nutzer, widgets.js:257 „Letzte Trades / Offene Positionen“, wird über komponenten-W4 zu `.subtabs`. Es wird nichts tokenisiert.

## komponenten-C20 · Unterstrich-Reiter: gemeinsame Fassung für .subtabs (neu), .set-tabs, .prop-sub

Gruppe komponenten · Cluster komponenten · Aufwand M · Befunde: komponenten-27, referenz-23
Quelle: audit/spec/komponenten.md Z. 349–361 · Dateien: web/css/app.css
Abhängig von: komponenten-C19

```text
**C20 – Unterstrich-Reiter** (komponenten-27, referenz-23)
- Z. 1866–1869 (`.set-tabs …`) und Z. 2593–2598 (`.prop-sub …`) ersetzen durch eine gemeinsame Fassung:
```css
.subtabs, .set-tabs, .prop-sub { display: flex; gap: 22px; border-bottom: 1px solid var(--border); overflow-x: auto; scrollbar-width: none; }
.subtabs::-webkit-scrollbar, .set-tabs::-webkit-scrollbar, .prop-sub::-webkit-scrollbar { display: none; }
.subtabs > button, .set-tabs > button, .prop-sub a { position: relative; padding: 2px 1px 11px; border: 0; background: none; font-size: 13.5px; font-weight: 500; color: var(--muted); text-decoration: none; white-space: nowrap; cursor: pointer; transition: color var(--dur-1) var(--ease); }
.subtabs > button:hover, .set-tabs > button:hover, .prop-sub a:hover, .subtabs > button[aria-pressed="true"], .set-tabs > button[aria-pressed="true"], .prop-sub a[aria-pressed="true"] { color: var(--text); }
.subtabs > button::after, .set-tabs > button::after, .prop-sub a::after { content: ''; position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; border-radius: 2px; background: var(--text); transform: scaleX(0); transition: transform var(--dur-2) var(--ease); }
.subtabs > button[aria-pressed="true"]::after, .set-tabs > button[aria-pressed="true"]::after, .prop-sub a[aria-pressed="true"]::after { transform: scaleX(1); }
.subtabs > button:focus-visible, .set-tabs > button:focus-visible, .prop-sub a:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
```
- Die Regel `.prop-sub a:focus-visible` aus C19 entfällt damit.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .prop-sub a::after] komponenten-C20 setzt als einziger Schritt die gemeinsame Unterstrich-Fassung für .subtabs, .set-tabs und .prop-sub (Schrift und Linie --text, Gewicht 500, deckt farbe-B21 und zustaende-S-C9b ab). Abweichend von C20 gilt: (1) Die Linie ::after bekommt keine transition. Alle drei Leisten bauen beim Klick neu auf (content-tab, log-tab und recent-tab rufen rerender, .prop-sub navigiert; README Z. 357: die Leiste steht still), der Übergang würde also nie laufen (bewegung D3/K19). scaleX(0) und scaleX(1) bleiben. (2) Gewählt wird an Links über `.prop-sub a[aria-current="page"]` angezeigt, weil aria-pressed an <a> wegfällt (barrierefreiheit Z4 und C-prop-304-305). (3) Schrift var(--fs-14)/var(--lh-14) statt 13.5px (Typografie: Reiter 14). (4) Fokus `outline: 2px solid var(--focus); outline-offset: -2px` statt --accent (barrierefreiheit Z1; die Leiste hat overflow-x: auto). Die Antwort auf aufbau-16 (F2) muss nicht abgewartet werden. Bei Ja streicht aufbau die .prop-sub-Selektoren aus diesen Regeln.
- ÄNDERN: Z. 1866–1869 und Z. 2593–2598 durch genau diese Fassung ersetzen:
.subtabs, .set-tabs, .prop-sub { display: flex; gap: 22px; border-bottom: 1px solid var(--border); overflow-x: auto; scrollbar-width: none; }
.subtabs::-webkit-scrollbar, .set-tabs::-webkit-scrollbar, .prop-sub::-webkit-scrollbar { display: none; }
.subtabs > button, .set-tabs > button, .prop-sub a { position: relative; padding: 2px 1px 11px; border: 0; background: none; font-size: var(--fs-14); line-height: var(--lh-14); font-weight: 500; color: var(--muted); text-decoration: none; white-space: nowrap; cursor: pointer; transition: color var(--dur-1) var(--ease); }
.subtabs > button:hover, .set-tabs > button:hover, .prop-sub a:hover, .subtabs > button[aria-pressed="true"], .set-tabs > button[aria-pressed="true"], .prop-sub a[aria-current="page"] { color: var(--text); }
.subtabs > button::after, .set-tabs > button::after, .prop-sub a::after { content: ''; position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; border-radius: 2px; background: var(--text); transform: scaleX(0); }
.subtabs > button[aria-pressed="true"]::after, .set-tabs > button[aria-pressed="true"]::after, .prop-sub a[aria-current="page"]::after { transform: scaleX(1); }
.subtabs > button:focus-visible, .set-tabs > button:focus-visible, .prop-sub a:focus-visible { outline: 2px solid var(--focus); outline-offset: -2px; }
Die Regel .prop-sub a:focus-visible aus C19 entfällt wie vorgesehen. Tests friedhoftest.js:20, sampletest.js:81 und headtest.js:63–64 prüfen.
- ÜBERNIMMT zustaende-S-C9b: Z. 1867, 1869, 2595 und 2597 (500, --text statt Akzent) stecken in der gemeinsamen Fassung von C20. Die grep-Prüfung in zustaende.md Z. 908 bleibt gültig.
- [doppelt: .set-tabs button[aria-pressed="true"]] Dreimal dieselbe Änderung (gewählt: Schrift --text, Linie --text). komponenten-C20 übernimmt sie mit `.set-tabs > button[aria-pressed="true"]`; die Linie kommt über ::after statt border-bottom. Die Anpassungen für farbe-B21 (nur noch .prop-fsel.on) und zustaende-S-C9b (zusammen_mit C20) stehen beim Anker .prop-sub a::after.
- [konflikt: .prop-sub a[aria-pressed="true"]] Der gewählte Prop-Unterreiter wird nur über aria-current="page" markiert. Links tragen kein aria-pressed (barrierefreiheit Z4), und prop.js:305 setzt aria-current schon heute. komponenten-C20 schreibt die Selektoren gleich als `.prop-sub a[aria-current="page"]` und `.prop-sub a[aria-current="page"]::after`. barrierefreiheit-B9b ändert die .prop-sub-Zeilen nicht mehr.
- [reihenfolge: .prop-sub] Die drei Schritte vertragen sich. C20 lässt .prop-sub wischbar ohne Scrollbalken, A2 blendet die Ränder per Maske aus, 3.3d setzt fade-l/fade-r. C20 macht aber auch .set-tabs und das neue .subtabs zu wischbaren Leisten (overflow-x: auto, kein Balken). Darum gilt die Wischleisten-Regel von responsiv (28-px-Auslauf an jedem Rand, hinter dem es weitergeht) auch dort, und die Selektorlisten in A2 und 3.3d bekommen .subtabs und .set-tabs dazu. Die Antwort auf aufbau-16 muss nicht abgewartet werden. Bei Ja fällt .prop-sub aus beiden Listen.
- [konflikt: .set-tabs button] Die gemeinsame Unterstrich-Fassung aus komponenten-C20 ersetzt .set-tabs und .prop-sub. Schrift in der Text-Skala: font-size: var(--fs-14); line-height: var(--lh-14); font-weight: 500. 13.5px ist in der Skala verboten, und Reiter haben laut typografie 14. Gewicht 500 und Unterstrich in --text verlangen auch zustaende-S-C9b und typografie-3.2.4d, C20 übernimmt das. Die Fokus-Zeile in C20 setzt nur den Versatz, ohne eigene Farbe (--accent als Fokusfarbe ist laut barrierefreiheit verboten; Farbe und Stärke kommen aus der globalen :focus-visible-Regel). Den Selektor für .prop-sub a (aria-pressed oder aria-current) regelt der Anker .prop-sub a.
- ÄNDERN: In .subtabs > button, .set-tabs > button, .prop-sub a: font-size: var(--fs-14); line-height: var(--lh-14) statt font-size: 13.5px. Fokus-Zeile → .subtabs > button:focus-visible, .set-tabs > button:focus-visible, .prop-sub a:focus-visible { outline-offset: -2px; }, ohne outline-Farbe.
- ÜBERNIMMT zustaende-S-C9b: Alle vier Zeilen (1867, 1869, 2595, 2597) gehen in der Ersatzregel von C20 auf (500, Unterstrich und Auswahl in --text).
- [konflikt: .prop-sub a] komponenten-C20 trägt die Unterstrich-Reiter `.subtabs > button, .set-tabs > button, .prop-sub a` mit `font-size: var(--fs-14); line-height: var(--lh-14); font-weight: 500; color: var(--muted)`. Hover und gewählt in --text, Linie `::after` mit `background: var(--text)`. Gewählt bei Knöpfen `[aria-pressed="true"]`, bei den Prop-Links `.prop-sub a[aria-current="page"]` (für Farbe und `::after { transform: scaleX(1) }`), weil Links kein aria-pressed tragen (barrierefreiheit Z4). Fokus `outline-offset: -2px`, nur der Versatz. Die Farbe kommt global, nicht --accent. -2px statt 2px, weil die Leiste mit overflow-x: auto den äußeren Ring oben abschneiden würde (barrierefreiheit Z1). .set-tabs bleibt damit 14 px und wird nur 600 → 500. Grund: Typografie-Rolle Reiter 14/500, keine 13.5 px. Unterstrich in --text statt Grün (BRIEF).
- ÄNDERN: (1) `font-size: 13.5px` → `font-size: var(--fs-14); line-height: var(--lh-14);`. (2) In der Hover/Gewählt-Liste und in der `::after { transform: scaleX(1) }`-Regel `.prop-sub a[aria-pressed="true"]` → `.prop-sub a[aria-current="page"]`. Für .subtabs/.set-tabs-Knöpfe bleibt aria-pressed. (3) Fokusregel: `.subtabs > button:focus-visible, .set-tabs > button:focus-visible, .prop-sub a:focus-visible { outline-offset: -2px; }`, ohne outline-Farbe.
- ÜBERNIMMT zustaende-S-C9b: Vollständig in komponenten-C20 enthalten: .set-tabs/.prop-sub 500, gewählt --text, Linie var(--text). Nicht separat umsetzen.
- [konflikt: .prop-sub a:focus-visible] Am Ende gibt es eine einzige Fokusregel: `.subtabs > button:focus-visible, .set-tabs > button:focus-visible, .prop-sub a:focus-visible { outline-offset: -2px; }` (aus komponenten-C20). Ring 2px var(--focus) aus der globalen Regel. Die alte Z. 2592 löscht komponenten-C19 vollständig. Grund: barrierefreiheit Z1 („nur der Versatz weicht ab“, −2px in Scroll-Leisten), kein Grün als Fokus (BRIEF).
- ÄNDERN: Fokusregel nur `outline-offset: -2px` (siehe Anker .prop-sub a).

## komponenten-C21a · Menüeinträge: .popover .item (min. 36, 13px/500), gewählt neutral, Haken-Spalte .chk, .popover .sec

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: komponenten-35, komponenten-2
Quelle: audit/spec/komponenten.md Z. 362–366 · Dateien: web/css/app.css
Abhängig von: —

```text
**C21 – Menüeinträge** (komponenten-35, komponenten-2)
- Z. 334 `.popover .item { … padding: 9px 12px; … font-size: 13px; color: var(--text); }` → `min-height: 36px; padding: 0 10px; … font-size: 13px; font-weight: 500; color: var(--text);` (gap 10, Radius 8 bleiben).
- Z. 337 `.popover .item[aria-checked="true"] { color: var(--accent); }` → `.popover .item[aria-checked="true"] { color: var(--text); background: var(--surface-2); }`
- Z. 339 `.popover .item svg { width: 15px; height: 15px; }` → `.popover .item svg { width: 16px; height: 16px; flex: 0 0 auto; color: var(--muted); }`; neu danach: `.popover .item.danger svg { color: inherit; }`, `.popover .item .chk { width: 16px; flex: 0 0 auto; display: inline-flex; color: var(--text-2); }`, `.popover .item .chk svg { color: inherit; }`
- Z. 341 `.popover .sec { … padding: 8px 12px 4px; … }` → `padding: 8px 10px 4px;`
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .popover .item[aria-checked="true"]] Werte aus farbe-B4: `.popover .item[aria-checked="true"] { color: var(--text); background: color-mix(in srgb, var(--text) 10%, var(--surface)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--text) 22%, var(--border-2)); }`. Gründe: BRIEF verlangt für Gewähltes „leicht angehobene Fläche, feiner Rand“. Das ist derselbe flache Gewählt-Stil wie überall in der App (zustaende Z3, farbe AUSWAHL). `var(--surface-2)` aus komponenten-C21a ist genau die Hover-Fläche (`.popover .item:hover`), damit wäre Gewählt von Hover nicht zu unterscheiden. B6 (nur Fläche) hat keinen Rand. Der inset-Rand ist eine 1-px-Kante, kein Schein. Die Regel steht nach `:hover`, gewinnt also. S-A2 liefert nur die aria-checked-Werte und passt dazu.
- ÄNDERN: Den Punkt Z. 337 nicht umsetzen, das übernimmt farbe-B4. Alle übrigen Punkte (min-height 36, Padding, 500, Symbol 16 --muted, `.chk`-Spalte --text-2, `.sec`, `.sb-menu`, `.sym-opt`, `.fd-opts`) bleiben.

## farbe-B4 · Gewählter Menüeintrag .popover .item[aria-checked] mit flachem Auswahlstil (inset-Rand)

Gruppe farbe · Cluster komponenten · Aufwand S · Befunde: bereich_notebook_news-16, barrierefreiheit-7
Quelle: audit/spec/farbe.md Z. 249–251 · Dateien: web/css/app.css
Abhängig von: —

```text
**B4 – Menüeinträge, Z. 337** — bereich_notebook_news-16, barrierefreiheit-7
`.popover .item[aria-checked="true"] { color: var(--accent); }` → `.popover .item[aria-checked="true"] { color: var(--text); background: color-mix(in srgb, var(--text) 10%, var(--surface)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--text) 22%, var(--border-2)); }`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .popover .item[aria-checked="true"]] Werte aus farbe-B4: `.popover .item[aria-checked="true"] { color: var(--text); background: color-mix(in srgb, var(--text) 10%, var(--surface)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--text) 22%, var(--border-2)); }`. Gründe: BRIEF verlangt für Gewähltes „leicht angehobene Fläche, feiner Rand“. Das ist derselbe flache Gewählt-Stil wie überall in der App (zustaende Z3, farbe AUSWAHL). `var(--surface-2)` aus komponenten-C21a ist genau die Hover-Fläche (`.popover .item:hover`), damit wäre Gewählt von Hover nicht zu unterscheiden. B6 (nur Fläche) hat keinen Rand. Der inset-Rand ist eine 1-px-Kante, kein Schein. Die Regel steht nach `:hover`, gewinnt also. S-A2 liefert nur die aria-checked-Werte und passt dazu.

## komponenten-C21c · Symbol-Liste und Filter-Optionen auf Menümaß, gewählt neutral

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: komponenten-35, komponenten-2
Quelle: audit/spec/komponenten.md Z. 369–371 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 881 `.sym-opt { … gap: 12px; … padding: 9px 10px; … font-size: 13.5px; … }` → `gap: 10px; min-height: 36px; padding: 0 10px; font-size: 13px;`
- Z. 886 `.sym-opt[aria-selected="true"] { background: var(--accent-soft); color: var(--accent); }` → `.sym-opt[aria-selected="true"] { background: var(--surface-2); color: var(--text); }`
- Z. 1415 `.fd-opts .item { … gap: 8px; … padding: 8px 10px; … }` → `gap: 10px; min-height: 36px; padding: 0 10px; font-weight: 500;`; Z. 1417 `.fd-opts .item svg { width: 14px; height: 14px; }` → `width: 16px; height: 16px; color: var(--muted);`
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .sym-opt] Die Symbol-Liste ist ein Menü. Menüeintrag = 13 (typografie 1.5 „alle Popover gleich“, komponenten Menüs). Ergebnis `.sym-opt { …; gap: 10px; min-height: 36px; padding: 0 10px; font-size: var(--fs-13); line-height: var(--lh-13); … }`, nicht 14. Die Zuordnung von .sym-opt zu 14 in typografie-3.2.3m widerspricht der eigenen Rollentabelle.
- ÄNDERN: `font-size: 13px` als `font-size: var(--fs-13); line-height: var(--lh-13);` schreiben.

## komponenten-C22 · Schwebende Ebenen Radius 12, kein grüner Rand

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: komponenten-34
Quelle: audit/spec/komponenten.md Z. 374–377 · Dateien: web/css/app.css
Abhängig von: —

```text
**C22 – Schwebende Ebenen** (komponenten-34)
- Z. 406 `.popover.dp { … border-radius: var(--radius); … }` und Z. 439 `.popover.cp { … border-radius: var(--radius); … }` → `border-radius: 12px;`
- Z. 1124 `.nb-ytpop { … border: 1px solid var(--accent); border-radius: 10px; … }` → `border: 1px solid var(--border-2); border-radius: 12px;`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .nb-ytpop] Ergebnis `.nb-ytpop { …; border: 1px solid var(--border-2); border-radius: 12px; …; font-size: var(--fs-13); line-height: var(--lh-13); }`. Rand und Radius setzt komponenten-C22, die Größe typografie-3.2.3h.

## komponenten-C24 · Filter-Fuß wie Zeitraum-Fuß (CSS)

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: komponenten-21, komponenten-12
Quelle: audit/spec/komponenten.md Z. 388–397 · Dateien: web/css/app.css
Abhängig von: —

```text
**C24 – Filter-Fuß wie Zeitraum-Fuß** (komponenten-21, komponenten-12)
- Z. 1366–1371 (`.fd-pop .fd-foot`, `.fd-pop .fd-foot .btn`, `… .btn.ghost`, `… .btn.primary`, `… .fd-n`, `… .btn svg`) ersetzen durch:
```css
.fd-pop .fd-foot { align-items: center; gap: 12px; padding: 12px var(--sp-pad); border-radius: 0 0 11px 11px; }
.fd-foot .fd-n { font-size: 13px; color: var(--muted); min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.fd-btns { display: flex; gap: 8px; flex: 0 0 auto; }
```
- Z. 1419 (`.fd-foot .btn.primary { gap: 8px; }`) und Z. 1420 (`.fd-foot .fd-n { padding-left… border-left… }`) löschen.
- Z. 1424 (Handy-Regel für `.fd-foot .btn…`) löschen.

```

## komponenten-C25a · Kacheln: Hover nur Rand, .stat-tile übernimmt .tile-Maße (Padding, 13.5/500, 25px/700), Handy 22 px, heller Schatten

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: bereich_dashboard-11, bereich_statistik-8
Quelle: audit/spec/komponenten.md Z. 398–405 · Dateien: web/css/app.css
Abhängig von: —

```text
**C25 – Kacheln** (bereich_dashboard-11, bereich_statistik-8, diagramme-43, bereich_konto-28)
- Z. 515 `.tile { … transition: border-color var(--dur-2) var(--ease), transform var(--dur-2) var(--ease), box-shadow var(--dur-2) var(--ease); }` → `transition: border-color var(--dur-2) var(--ease);`
- Z. 516 → `.tile:hover, .stat-tile:hover { border-color: var(--border-2); }`
- Z. 636 `.stat-tile { … border-radius: 14px; padding: 16px 18px; … transition: … }` → `border-radius: var(--radius); padding: 12px 15px; … transition: border-color var(--dur-2) var(--ease);`
- Z. 637 `.stat-tile .k { … font-size: 13px; color: var(--text-2); }` → `font-size: 13.5px; font-weight: 500; color: var(--text-2);`
- Z. 639 `.stat-tile .v { … font-size: 24px; … letter-spacing: -0.01em; }` → `font-size: 25px; letter-spacing: -0.02em; line-height: 1.1;`
- Z. 1499 → `:root[data-theme="light"] .card, :root[data-theme="light"] .tile, :root[data-theme="light"] .stat-tile { … }`
- Handy (Z. 3037–3038): `.stat-tile { padding: 14px; }` löschen; `.stat-tile .v { font-size: 20px; }` → `font-size: 22px;`
```

**Hinweise aus der Abstimmung (verbindlich):**

- ÄNDERN: Z. 637 `.stat-tile .k`: nicht auf `font-size: 13.5px` setzen. Kachel-Titel bleibt 13 (`var(--fs-13)`/`var(--lh-13)` nach typografie), 500, `--text-2`, wie `.tile .head`. Die übrigen C25a-Punkte bleiben unberührt.
- [konflikt: .kstrip .tile:hover] Karten und Kacheln haben keinen Hover-Zustand mehr. In app.css werden ersatzlos gelöscht: Z. 486 `.card:hover`, Z. 516 `.tile:hover, .stat-tile:hover`, Z. 2603 `.kstrip .tile:hover`. Die `transition`-Deklaration an `.card` (Z. 485), `.tile` (Z. 515) und `.stat-tile` (Z. 636) fällt ganz weg, weil dort kein Zustand mehr Rand, Schatten oder Lage ändert (kilook Z11: keine wirkungslosen Deklarationen; bewegung D3). Erhalten bleiben: (i) erscheint beim Darüberfahren und bei :focus-within (Z. 496–498, BRIEF „Info-Symbole nur beim Darüberfahren“); `.cal .d:hover` nach bewegung-C1, weil Kalendertage klickbar sind; das Token `--lift-shadow` (landing.css:56). Grund: Der BRIEF verlangt „ruhig, nichts Dekoratives“, und Hover-Rückmeldung gehört nur an Bedienbares. bewegung K1/H3 sieht genau diesen Fall selbst vor: Streicht zustaende `.card:hover`, folgen die Kacheln. S-C5 streicht es. Test motiontest.js:52–53: Beim Überfahren bleiben transform none und border-color unverändert. bewegung-3.11a und zustaende-S-TE3 sind dieselbe Änderung und werden einmal umgesetzt. Die Entscheidung zu `.tile:hover`/`.stat-tile:hover` in konflikt-14 muss hiermit übereinstimmen.
- ÄNDERN: Die Teile zu Z. 515 (transition kürzen) und Z. 516 (`.tile:hover, .stat-tile:hover { border-color: var(--border-2); }`) entfallen. Z. 636 `.stat-tile` bekommt keine transition. Maße, Schrift und der helle Schatten für .stat-tile (Z. 1499) bleiben.
- [konflikt: .stat-tile .k] Ergebnis: .stat-tile .k { display: flex; align-items: center; gap: 6px; font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 500; color: var(--text-2); }. Die 13.5 px aus komponenten-C25a gelten nicht: Der Wert ist in der Skala verboten, und .tile .head wird ebenfalls 13 (typografie-3.2.3i, aufbau-A3b). Das Ziel von C25a, „gleiche Maße wie .tile“, bleibt damit erfüllt. Gewicht 500 setzen drei Schritte; komponenten-C25a übernimmt die ganze Zeile 637.
- ÄNDERN: Z. 637 → font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 500; color: var(--text-2); statt 13.5px. Die übrigen Punkte von C25a regeln die Anker .stat-tile und .stat-tile .v.
- [konflikt: .stat-tile .v] Endstand: `.stat-tile .v { font-size: var(--tile-val); font-weight: 700; letter-spacing: var(--ls-val); line-height: var(--lh-val); margin-top: auto; padding-top: var(--sp-2); }` ohne font-family. Das ergibt 24 am Desktop und 20 bei ≤960 und am Handy, beides über das Token. Neu ist `@container (max-width: 175px) { .stat-tile .v { font-size: var(--fv-20); } }`. Die Handy-Regel Z. 3038 entfällt. 25 bzw. 22 px (Komponenten) gibt es nicht: „.stat-tile = .tile“ wird über dasselbe Token erreicht. mobiletest.js:27 (`20px`) bleibt gültig. Den Schriftteil schreibt aufbau-A2, margin und padding schreibt abstaende-B15.
- ÄNDERN: Es bleibt nur: `.stat-tile` border-radius var(--radius), und im hellen Design derselbe Schatten wie .tile (Z. 1499 um `.stat-tile` ergänzen). Entfallen: Z. 515/516 (Hover und Transition → zustaende-S-C5); Z. 636 padding 12px 15px und transition (→ abstaende-B15 mit 16/20, zustaende-S-C5); Z. 639 25px, Laufweite und Zeilenhöhe (→ aufbau-A2 mit --tile-val); am Handy das Löschen von `.stat-tile { padding: 14px }` (→ abstaende-C7 mit var(--sp-4) var(--sp-3)) und die 22px (Zeile Z. 3038 wird gelöscht, aufbau-A2). Z. 637 entscheidet der Anker .stat-tile .k.
- [konflikt: .stat-tile] Endstand: `.stat-tile { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: var(--sp-4) var(--sp-5); display: flex; flex-direction: column; container-type: inline-size; min-width: 0; transition: border-color var(--dur-1) var(--ease); }`, ohne :hover (siehe .tile:hover). Am Handy (≤560) `.stat-tile { padding: var(--sp-4) var(--sp-3); }` (abstaende-C7). Im hellen Design derselbe Schatten wie .tile (komponenten-C25a). Grund: .tile bekommt durch abstaende-B7 dieselben 16/20 px; damit ist „.stat-tile = .tile“ (Komponenten) erfüllt, 12/15 px war nur der alte .tile-Wert. abstaende-B15 schreibt padding und flex, responsiv-B7 nur container-type, zustaende-S-C5 die Transition.
- ÄNDERN: Es bleibt nur: `.stat-tile` border-radius var(--radius), und im hellen Design derselbe Schatten wie .tile (Z. 1499 um `.stat-tile` ergänzen). Entfallen: Z. 515/516 (Hover und Transition → zustaende-S-C5); Z. 636 padding 12px 15px und transition (→ abstaende-B15 mit 16/20, zustaende-S-C5); Z. 639 25px, Laufweite und Zeilenhöhe (→ aufbau-A2 mit --tile-val); am Handy das Löschen von `.stat-tile { padding: 14px }` (→ abstaende-C7 mit var(--sp-4) var(--sp-3)) und die 22px (Zeile Z. 3038 wird gelöscht, aufbau-A2). Z. 637 entscheidet der Anker .stat-tile .k.
- [konflikt: .tile] Endstand: `.tile { …; padding: var(--sp-4) var(--sp-5); …; gap: var(--sp-2); …; transition: border-color var(--dur-1) var(--ease); }` (abstaende-B7 und zustaende-S-C5). Kacheln, Statistik-Kacheln und Karten reagieren beim Darüberfahren gar nicht: kein Anheben, kein Schatten, kein Randwechsel. Nur das (i) blendet ein (Z. 497 bleibt). Grund: Kacheln und Karten sind nicht klickbar. Ein Randwechsel täuscht Klickbarkeit vor und ist Bewegung ohne Bedeutung (BRIEF: ruhig, nichts Dekoratives). Die Bewegungs-Regel H3 („Kacheln folgen .card:hover“) bleibt erfüllt, weil zustaende-S-C5 auch .card:hover löscht. Die Rand-Variante aus Bewegung und Komponenten entfällt.
- ÄNDERN: Es bleibt nur: `.stat-tile` border-radius var(--radius), und im hellen Design derselbe Schatten wie .tile (Z. 1499 um `.stat-tile` ergänzen). Entfallen: Z. 515/516 (Hover und Transition → zustaende-S-C5); Z. 636 padding 12px 15px und transition (→ abstaende-B15 mit 16/20, zustaende-S-C5); Z. 639 25px, Laufweite und Zeilenhöhe (→ aufbau-A2 mit --tile-val); am Handy das Löschen von `.stat-tile { padding: 14px }` (→ abstaende-C7 mit var(--sp-4) var(--sp-3)) und die 22px (Zeile Z. 3038 wird gelöscht, aufbau-A2). Z. 637 entscheidet der Anker .stat-tile .k.
- [konflikt: .tile:hover] Z. 516 `.tile:hover, .stat-tile:hover { … }` wird ganz gelöscht (zustaende-S-C5), Begründung wie beim Anker .tile. Den Test passt bewegung-3.11a einmal an: Name „Kachel bleibt beim Überfahren ruhig“. Nach `p.hover('.tile >> nth=1')` prüft er `transform === 'none'` und dass `borderColor` gleich dem Wert vor dem Überfahren ist.
- ÄNDERN: Es bleibt nur: `.stat-tile` border-radius var(--radius), und im hellen Design derselbe Schatten wie .tile (Z. 1499 um `.stat-tile` ergänzen). Entfallen: Z. 515/516 (Hover und Transition → zustaende-S-C5); Z. 636 padding 12px 15px und transition (→ abstaende-B15 mit 16/20, zustaende-S-C5); Z. 639 25px, Laufweite und Zeilenhöhe (→ aufbau-A2 mit --tile-val); am Handy das Löschen von `.stat-tile { padding: 14px }` (→ abstaende-C7 mit var(--sp-4) var(--sp-3)) und die 22px (Zeile Z. 3038 wird gelöscht, aufbau-A2). Z. 637 entscheidet der Anker .stat-tile .k.
- [konflikt: .stat-tile:hover] Wie bei .tile:hover: Es gibt keinen Hover an .stat-tile (Z. 516 wird ganz gelöscht, zustaende-S-C5). Die Transition an .stat-tile lautet `border-color var(--dur-1) var(--ease)`, das (i) blendet weiter über Z. 497 ein.
- ÄNDERN: Es bleibt nur: `.stat-tile` border-radius var(--radius), und im hellen Design derselbe Schatten wie .tile (Z. 1499 um `.stat-tile` ergänzen). Entfallen: Z. 515/516 (Hover und Transition → zustaende-S-C5); Z. 636 padding 12px 15px und transition (→ abstaende-B15 mit 16/20, zustaende-S-C5); Z. 639 25px, Laufweite und Zeilenhöhe (→ aufbau-A2 mit --tile-val); am Handy das Löschen von `.stat-tile { padding: 14px }` (→ abstaende-C7 mit var(--sp-4) var(--sp-3)) und die 22px (Zeile Z. 3038 wird gelöscht, aufbau-A2). Z. 637 entscheidet der Anker .stat-tile .k.

## komponenten-C33a · Textlink-Baustein .tlink

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: bereich_konto-49
Quelle: audit/spec/komponenten.md Z. 465–470 · Dateien: web/css/app.css
Abhängig von: —

```text
**C33 – Textlinks** (bereich_konto-49)
- Nach Z. 89 (`a { … }`) neu:
```css
.tlink { color: var(--text-2); text-decoration: underline; text-decoration-color: var(--border-2); text-underline-offset: 3px; transition: color var(--dur-2) var(--ease), text-decoration-color var(--dur-2) var(--ease); }
.tlink:hover { color: var(--text); text-decoration-color: currentColor; }
```
```

## komponenten-U1 · Neue Symbole I.sort und I.checkSquare

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: bereich_notebook_news-34
Quelle: audit/spec/komponenten.md Z. 510–518 · Dateien: web/js/ui.js
Abhängig von: —

```text
### 3.2 web/js/ui.js

**U1 – Neue Symbole** (bereich_notebook_news-34)
In der Icon-Liste nach `arrowDown` (Z. 77):
```js
sort: sv('<path d="M7 4v16M4 7l3-3 3 3M17 20V4M14 17l3 3 3-3"/>'),
checkSquare: sv('<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>'),
```

```

## komponenten-U2 · Feldbeschriftung im Eingabe-Dialog als .lbl

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: komponenten-18
Quelle: audit/spec/komponenten.md Z. 519–521 · Dateien: web/js/ui.js
Abhängig von: komponenten-C05

```text
**U2 – Feldbeschriftung im Eingabe-Dialog** (komponenten-18)
Z. 453 (promptModal) `<label class="field"><span>${esc(o.label || 'Name')}</span>` → `<label class="field"><span class="lbl">${esc(o.label || 'Name')}</span>`

```

## komponenten-A5a · Gemeinsame Feld-Helfer App.unitField, App.curField, App.feeField

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: komponenten-17, bereich_einstellungen-35, bereich_trades_tag-11
Quelle: audit/spec/komponenten.md Z. 561–567 · Dateien: web/js/app.js
Abhängig von: komponenten-C13

```text
**A5 – Gemeinsame Feld-Helfer** (bereich_trades_tag-11, komponenten-17, bereich_einstellungen-35)
Bei `feeSym` (Z. 439):
```js
App.unitField = function (inputHtml, unit, cls = '') { const f = unit === '%' ? { sym: '%', side: 'post' } : feeSym(unit); return `<div class="inp-cur ${f.side}${cls ? ' ' + cls : ''}" style="--sl:${f.sym.length}">${inputHtml}<span class="cur-sym no-i18n" aria-hidden="true">${esc(f.sym)}</span></div>`; };
App.curField = function (o) { return App.unitField(`<input class="input" type="number" step="any"${o.min != null ? ` min="${o.min}"` : ''} id="${o.id}" name="${o.name}" value="${o.value == null ? '' : o.value}" inputmode="decimal">`, accCurrency(o.accountId)); };
App.feeField = function (t) { return App.curField({ name: 'fees', id: 'f-fees', value: t.fees || 0, accountId: t.accountId, min: 0 }); };
```
```

## komponenten-D1 · datepicker.js: Uhrzeit (type=time) im App-Wähler

Gruppe komponenten · Cluster komponenten · Aufwand M · Befunde: bereich_prop-52
Quelle: audit/spec/komponenten.md Z. 603–612 · Dateien: web/js/datepicker.js, web/css/app.css
Abhängig von: —

```text
### 3.5 web/js/datepicker.js, rangepicker.js, certificate.js, store.js, sample.js

**D1 – datepicker.js: Uhrzeit im App-Wähler** (bereich_prop-52)
- Z. 11 `const TYPES = { date: 1, 'datetime-local': 1, month: 1 };` → `{ date: 1, 'datetime-local': 1, month: 1, time: 1 }`
- `render()` (Z. 74–84): für `input.type === 'time'` nur `${timeHTML()}${foot}` rendern (kein Monatsraster), Popover-Breite 132 px (Klasse `time` am Popover, CSS `.popover.dp.time { width: 132px; }`). Fuß: „Löschen“ nur ohne `required`, „Fertig“.
- `timeHTML()` (Z. 65) und `setTime()` (Z. 118–119): bei `type=time` die Zeit aus `input.value.slice(0, 5)` lesen statt `slice(11, 16)` und mit `write(inp, `${pad(h)}:${pad(m)}`)` ohne Tagesteil schreiben.
- `open()` (Z. 176): bei `type=time` `view.mode = 'time'`, `focusKey` leer.
- CSS (app.css Z. 392–393): `.input[type="time"]` in beide Selektorlisten der Datumsfelder aufnehmen (eigenes Symbol rechts, nativer Indikator aus), Symbol: Uhr statt Kalender.
- Gilt für prop.js:149, shadow.js:38, dash-filter.js:125–126. Die 24-h-Darstellung im Feld liefert die Anzeige-Überlagerung aus wording-2 (zustaende-20).

```

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: DatePicker.TYPES] Beide Schritte bleiben. komponenten-D1 nimmt `time: 1` in TYPES auf und öffnet für Uhrzeitfelder den App-Wähler. Danach legt wording-S4.1-4.5 die Anzeige .dp-display über alle TYPES-Felder, auch time, wie in 4.1 vorgesehen. Damit die Anzeige bei Uhrzeitfeldern nicht leer bleibt, bekommt sync() einen Zweig für time: `root.UI.fmt.time(new Date(2000, 0, 1, +v.slice(0, 2), +v.slice(3, 5)))`. Das ist dieselbe Uhrzeitform wie bei datetime-local über fmt.dateTime, auf Deutsch „09:30“. Ist kein data-empty gesetzt, steht im leeren Feld „—“ (U+2014, Wording W8) statt „–“.

## komponenten-S-dash-filter · Filter-Popover: Fuß mit Trade-Zahl links, „Zurücksetzen“/„Anwenden“ rechts

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: komponenten-21
Quelle: audit/spec/komponenten.md Z. 642–648 · Dateien: web/js/screens/dash-filter.js
Abhängig von: komponenten-C24

```text
**S-dash-filter (dash-filter.js)** (komponenten-21)
Z. 141 `footHTML` →
```js
return `<span class="fd-n">${n === 1 ? '1 Trade' : fmt.int(n) + ' Trades'}</span><span class="fd-btns">${count(f) ? '<button type="button" class="btn sm ghost" data-action="dash-f-reset">Zurücksetzen</button>' : ''}<button type="button" class="btn sm primary" data-action="dash-f-apply">Anwenden</button></span>`;
```
Kopf mit × (Z. 145) bleibt.

```

## komponenten-R1a · README: Filter-Fuß (Trade-Zahl unten links)

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: komponenten-21
Quelle: audit/spec/komponenten.md Z. 743–746 · Dateien: web/README.md
Abhängig von: komponenten-S-dash-filter

```text
### 3.8 web/README.md

**R1** (komponenten-1, komponenten-21, bereich_einstellungen-2, bereich_einstellungen-11, komponenten-16, komponenten-27, zustaende-14, ki_look-11, bereich_notebook_news-32, bereich_notebook_news-20)
- Z. 80: „„Anwenden“ zeigt live die Zahl der Trades“ → „unten links steht live die Zahl der Trades“.
```

## komponenten-R1e · README: neuer Absatz „Bausteine“; Zahlenfelder global ohne Pfeile

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: komponenten-1, komponenten-27, zustaende-14, komponenten-16
Quelle: audit/spec/komponenten.md Z. 750–751 · Dateien: web/README.md
Abhängig von: komponenten-C02, komponenten-C07, komponenten-C19, komponenten-C20, komponenten-C21a

```text
- Nach Z. 210 neuer Absatz **Bausteine**: „Knöpfe: Auslöser (Anlegen, Öffnen, Starten) sind neutral, Anlegen mit Plus; `.btn.primary` nur im Fuß von Dialogen und Popovern und beim Absenden des Hauptformulars einer Seite; Leerzustände: Symbol, Titel, ein Satz, Aktion als `btn sm`. Reiter: Bereichs-Navigation als Schiene, Unteransichten und Reiter in Karten mit Unterstrich. Pfeile: ein Baustein `.btn.nav` (34 px). Menüs: gewählter Eintrag neutral grau hinterlegt, Haken nur in Listen mit Einzelwahl.“
- Z. 227: ergänzen „Gilt für alle Zahlenfelder der App.“
```

## komponenten-R1f · README nach Antwort auf N1/N2 nachziehen (Z. 191, 207–208)

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: komponenten-1, ki_look-11
Quelle: audit/spec/komponenten.md Z. 752–753 · Dateien: web/README.md
Abhängig von: —

```text
- Nach Antwort auf N1/N2 Z. 191 und Z. 207–208 nachziehen.

```

## aufbau-A2 · Kachelwerte auf --tile-val umstellen, Sondergrößen löschen

Gruppe aufbau · Cluster komponenten · Aufwand S · Befunde: typografie-6
Quelle: audit/spec/aufbau.md Z. 256–262 · Dateien: web/css/app.css
Abhängig von: aufbau-A1

```text
**A2 Kachelwerte auf das Token** · typografie-6
- Z. 540 `.tile .val { …; font-size: 25px; … }` → `font-size: var(--tile-val);`
- Z. 639 `.stat-tile .v { …; font-size: 24px; … }` → `font-size: var(--tile-val);`
- Z. 1735 `.tile.spark-tile .val { font-family: var(--font-display); font-size: 28px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.1; flex: 0 0 auto; … }` → `.tile.spark-tile .val { flex: 0 0 auto; display: flex; align-items: center; margin: 0; padding: 0; min-height: 0; }` (Schrift erbt von `.tile .val`)
- Löschen: Z. 2397 `.shadow-tiles .tile.shadow-main .val { font-size: 34px; }`, Z. 2446 (Handy 26px), Z. 2684 `.prop-tiles .tile .val { font-size: 24px; }`, Z. 2742 (20px), Z. 936 `.tile .val { font-size: 22px; }`, Z. 3027 `.tile .val { font-size: 21px; }`, Z. 3038 `.stat-tile .v { font-size: 20px; }`
- Bleiben: Z. 533 (Container ≤164px, 22px), Z. 2945 (`.coach-gs-tiles`, 21px), Z. 2700 (`.prop-balance .val`, 26px)

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .tile .val] Ein Rollen-Token für alle Kachelwerte, die Werte kommen aus der Typografie-Skala. In :root steht `--tile-val: var(--fv-24);`, im Block @media (max-width: 960px) `:root { --tile-val: var(--fv-20); }`; eine eigene 560er-Stufe gibt es nicht, das Handy erbt 20. Die Regel lautet `.tile .val { font-size: var(--tile-val); font-weight: 700; letter-spacing: var(--ls-val); line-height: var(--lh-val); }` ohne font-family (Onest kommt über die Sammelregel). In der Container-Notstufe (heute @container max-width 164px, die Schwelle legt der Anker „@container (max-width: 164px)“ fest) gilt `.tile .val { font-size: var(--fv-20); }`. Gelöscht werden Z. 936 (22px, ≤960) und Z. 3027 (21px, Handy). Die Skala gilt auch für die bisherigen „Bleiben“-Ausnahmen aus aufbau-A2: `.prop-balance .val` geht von 26 auf var(--fv-24), bei ≤960 von 22 auf var(--fv-20) (wie typografie-fv24/fv20). `.coach-gs-tiles .tile .val { font-size: 21px }` (Z. 2945) wird gelöscht und erbt --tile-val; schmale Coach-Kacheln fallen über die Container-Notstufe auf 20. Grund: 25, 22, 21 und 26 px liegen nicht auf der Werte-Skala (14/16/20/24/32/44), und die Typografie verbietet sie. Aufbau, Typografie und Responsiv sind sich bei 24 am Desktop und 20 am Handy einig. Streitig war nur der Tablet-Wert 22 (Aufbau). Dafür gibt es die Skalenstufe 20 „Kachelwert schmal, ≤960, Handy“.
- ÄNDERN: Schreibt alle Kachelwerte: Z. 540 `.tile .val { font-size: var(--tile-val); font-weight: 700; letter-spacing: var(--ls-val); line-height: var(--lh-val); }` ohne font-family. Z. 639 `.stat-tile .v` Schriftteil `font-size: var(--tile-val); font-weight: 700; letter-spacing: var(--ls-val); line-height: var(--lh-val);` ohne font-family (margin/padding macht abstaende-B15). Z. 1735 wie geplant. Löschliste wie geplant (2397, 2446, 2684, 2742, 936, 3027, 3038) plus Z. 2945 `.coach-gs-tiles .tile .val`. Die Liste „Bleiben“ entfällt: Z. 533 → var(--fv-20) (typografie-fv20), Z. 2700 `.prop-balance .val` → var(--fv-24) (typografie-fv24).
- ÜBERNIMMT typografie-3.2.5a: Gleiche Regel, aber `font-size: var(--tile-val)` statt var(--fv-24); aufbau-A2 schreibt sie.
- [doppelt: .tile.spark-tile .val] Endstand: `.tile.spark-tile .val { flex: 0 0 auto; display: flex; align-items: center; margin: 0; padding: 0; min-height: 0; }`. Schrift, Größe (--tile-val, also 24/20 statt 28), Gewicht, Laufweite und Zeilenhöhe erbt die Regel von .tile .val. Geschrieben wird sie einmal, von aufbau-A2. Dass typografie-3.2.2f den Selektor aus der Onest-Liste streicht, passt dazu (.tile .val deckt ihn ab).
- [konflikt: .stat-tile .v] Endstand: `.stat-tile .v { font-size: var(--tile-val); font-weight: 700; letter-spacing: var(--ls-val); line-height: var(--lh-val); margin-top: auto; padding-top: var(--sp-2); }` ohne font-family. Das ergibt 24 am Desktop und 20 bei ≤960 und am Handy, beides über das Token. Neu ist `@container (max-width: 175px) { .stat-tile .v { font-size: var(--fv-20); } }`. Die Handy-Regel Z. 3038 entfällt. 25 bzw. 22 px (Komponenten) gibt es nicht: „.stat-tile = .tile“ wird über dasselbe Token erreicht. mobiletest.js:27 (`20px`) bleibt gültig. Den Schriftteil schreibt aufbau-A2, margin und padding schreibt abstaende-B15.
- ÄNDERN: Schreibt alle Kachelwerte: Z. 540 `.tile .val { font-size: var(--tile-val); font-weight: 700; letter-spacing: var(--ls-val); line-height: var(--lh-val); }` ohne font-family. Z. 639 `.stat-tile .v` Schriftteil `font-size: var(--tile-val); font-weight: 700; letter-spacing: var(--ls-val); line-height: var(--lh-val);` ohne font-family (margin/padding macht abstaende-B15). Z. 1735 wie geplant. Löschliste wie geplant (2397, 2446, 2684, 2742, 936, 3027, 3038) plus Z. 2945 `.coach-gs-tiles .tile .val`. Die Liste „Bleiben“ entfällt: Z. 533 → var(--fv-20) (typografie-fv20), Z. 2700 `.prop-balance .val` → var(--fv-24) (typografie-fv24).
- [doppelt: .prop-tiles .tile .val] Z. 2684 (24px) und Z. 2742 (20px, im 960er-Block) werden gelöscht (aufbau-A2). Die Prop-Kacheln erben var(--tile-val), also 24 bzw. 20. Die Token-Umstellung der Typografie für beide Zeilen entfällt, das Ergebnis ist dasselbe.
- [konflikt: .shadow-tiles .tile.shadow-main .val] Z. 2397 (34px) und Z. 2446 (Handy 26px) werden gelöscht (aufbau-A2). Die Hauptkachel des Schatten-Ichs hat damit den normalen Kachelwert var(--tile-val), also 24 bzw. 20. Die Typografie wollte am Handy 24 als Token behalten; das entfällt. Es gibt eine Kachelwert-Größe je Stufe, die Hervorhebung trägt schon der Rand --border-2 (Z. 2396).

## aufbau-A3a · Neue Klasse .kpi-label und .kpi-label.sm

Gruppe aufbau · Cluster komponenten · Aufwand S · Befunde: typografie-4
Quelle: audit/spec/aufbau.md Z. 263–268 · Dateien: web/css/app.css
Abhängig von: —

```text
**A3 KPI-Beschriftung** · typografie-4
- Nach Z. 101 neu:
  ```css
  .kpi-label { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 500; line-height: 18px; color: var(--text-2); }
  .kpi-label.sm { font-size: 12px; color: var(--muted); }
  ```
```

## aufbau-A4f · Eyebrows, Labels und Steuerelemente im Filter-Fenster angleichen

Gruppe aufbau · Cluster komponenten · Aufwand S · Befunde: typografie-18
Quelle: audit/spec/aufbau.md Z. 292–295 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 341 `.popover .sec { …; font-weight: 700; }` → `font-weight: 600;`
- Z. 1355 `.fd-pop .fd-gh { padding: 9px 2px; font-size: 13px; }` → `.fd-pop .fd-gh { padding: 10px 2px 6px; font-family: var(--font); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); }` (Pfeil und Zähler bleiben)
- Z. 1360 `.fd-pop .fd-l { font-size: 11.5px; }` → `.fd-pop .fd-l { font-size: 12px; color: var(--muted); }` (600 erbt aus Z. 1381)
- Z. 1386 `.fd-seg button`, Z. 1388 `.fd-tog button`, Z. 1400 `.fd-chip`, Z. 1407 `.fd-add`: jeweils `font-weight: 600` → `font-weight: 500`
```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .fd-pop .fd-l] komponenten-C05 übernimmt und löscht `.fd-pop .fd-l` (Z. 1360). Die Filter-Beschriftung kommt in Popover und Panel allein aus `.fd-l`: `display: flex; align-items: baseline; gap: 8px; font-size: var(--fs-12); line-height: var(--lh-12); font-weight: 600; color: var(--muted);`. Das sind die Werte aus C05 in Token-Schreibweise; die Zeilenhöhe 1.3 wird zum Token wie in typografie-3.2.3f. aufbau-A4f wollte für das Popover dasselbe Ergebnis (12, `--muted`, 600 geerbt) als Zusatzregel. Eine Regel statt zwei ist sauberer.
- ÄNDERN: Den Punkt Z. 1360 `.fd-pop .fd-l { font-size: 12px; color: var(--muted); }` streichen, komponenten-C05 löscht die Regel und setzt `.fd-l` selbst auf 12/600/`--muted`. Die übrigen A4f-Punkte (`.popover .sec`, `.fd-pop .fd-gh`, Gewichte der Filter-Steuerelemente) bleiben.
- [konflikt: .fd-chip] .fd-chip ist ein Chip, keine Segment-Taste. Ergebnis: height: 28px; border-radius: 999px; font-size: var(--fs-12); line-height: var(--lh-12); font-weight: 500 (Padding, Rand und Farben wie bisher). Grund: Die Rollentabelle von typografie (Chip = --fs-12) und komponenten (Chips 12px/500) stimmen überein; 13 gilt für Segmente und Menüeinträge. So gleicht der Filter-Chip .chip und .nb .tagpill. Das Gewicht 500 setzen aufbau-A4f, komponenten-C16 und typografie-3.2.4d; komponenten-C16 übernimmt.
- ÄNDERN: .fd-chip (Z. 1400) und .fd-add (Z. 1407) aus der Gewichtsliste streichen, das übernimmt komponenten-C16. .fd-seg und .fd-tog sowie die übrigen Punkte bleiben.
- [konflikt: .fd-add] Gleiche Entscheidung wie bei .fd-chip, weil der Hinzufügen-Chip neben den Chips steht und gleich hoch sein muss: height: 28px; border-radius: 999px; font-size: var(--fs-12); line-height: var(--lh-12); font-weight: 500. komponenten-C16 übernimmt. aufbau-A4f, typografie-3.2.3h und typografie-3.2.4d lassen .fd-add aus (Anpassungen wie bei .fd-chip).
- ÄNDERN: .fd-add aus der Gewichtsliste streichen (komponenten-C16).
- [doppelt: .fd-seg button] Ergebnis `.fd-seg button { …; font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 500; … }`. Das Gewicht 600 → 500 setzt typografie-3.2.4d als Gewichts-Sweep für alle Filter-Bausteine (.fd-seg button, .fd-tog button, .fd-chip, .fd-add), die Größe typografie-3.2.3h. Von komponenten-C14b bleiben `.fd-seg { gap: 2px; background: var(--surface-2); }` und die Löschungen.
- ÄNDERN: Den Punkt Z. 1386/1388/1400/1407 (font-weight 600 → 500) nicht ausführen. Das macht typografie-3.2.4d. Die übrigen A4f-Punkte (.popover .sec, .fd-gh, .fd-l) bleiben.
- [doppelt: .fd-tog button] Wie bei .fd-seg button: 500 über typografie-3.2.4d, Größe var(--fs-13)/var(--lh-13) über typografie-3.2.3h. aufbau-A4f ändert das Gewicht nicht noch einmal.
- ÄNDERN: Gewichtspunkt Z. 1388 (und 1386/1400/1407) entfällt in A4f, typografie-3.2.4d übernimmt ihn.
- [konflikt: .fd-pop .fd-gh] Die Gruppenköpfe im Filter-Fenster („Trade“, „Zeit“ …) werden Eyebrows, wie `.popover .sec` in allen anderen Menüen (aufbau K11). Einheitlich heißt hier: `.fd-pop .fd-gh` kommt in die Eyebrow-Sammelregel von typografie-3.2.2b (var(--fs-11)/var(--lh-11), 600, Versal, .06em, 'case', --muted). Die Einzelregel Z. 1355 wird `.fd-pop .fd-gh { padding: 10px 2px 6px; font-family: var(--font); }`, Pfeil und Zähler bleiben. Die Sammelregel steht zwar früher in der Datei (Z. 101), gewinnt aber mit der Spezifität (0,2,0) gegen die Grundregel `.fd-gh` (Z. 1374, 15/600 --text). Nicht auf 13 px tokenisieren.
- ÄNDERN: Z. 1355 → `.fd-pop .fd-gh { padding: 10px 2px 6px; font-family: var(--font); }` und `.fd-pop .fd-gh` an die Selektorliste der Eyebrow-Sammelregel anhängen (typografie-3.2.2b, Z. 101). font-size, font-weight, text-transform, letter-spacing und color nicht einzeln setzen. Die übrigen Punkte (.popover .sec, .fd-pop .fd-l, Gewichte der Filter-Steuerelemente) berührt dieser Anker nicht.

## aufbau-B9 · Symbol I.award ergänzen

Gruppe aufbau · Cluster komponenten · Aufwand S · Befunde: bereich_dashboard-23
Quelle: audit/spec/aufbau.md Z. 363–365 · Dateien: web/js/ui.js
Abhängig von: —

```text
**B9 Symbol „award“** (`web/js/ui.js` nach Z. 72 `shield: …`) · bereich_dashboard-23
`award: sv('<circle cx="12" cy="8" r="6"/><path d="M15.48 12.89 17 22l-5-3-5 3 1.52-9.11"/>'),`

```

## zustaende-S-C2 · Knöpfe und Menüeinträge: kein Hover/Anheben auf Deaktiviertem, Deckkraft über --disabled-o, neutraler .btn.primary:disabled

Gruppe zustaende · Cluster komponenten · Aufwand S · Befunde: zustaende-35, komponenten-42
Quelle: audit/spec/zustaende.md Z. 242–259 · Dateien: web/css/app.css
Abhängig von: zustaende-S-C1

```text
#### Komponenten

**S-C2 Knöpfe: Hover und Deaktiviert** – zustaende-35, komponenten-42
- Z. 272 `.btn:hover {…}` → `.btn:hover:not(:disabled) {…}`
- Z. 273 `.btn:active {…}` → `.btn:active:not(:disabled) {…}`
- Z. 275 `.btn.primary:hover {…}` → `.btn.primary:hover:not(:disabled) {…}`
- Z. 277 `.btn.danger:hover {…}` → `.btn.danger:hover:not(:disabled) {…}`
- Z. 279 `.btn.ghost:hover {…}` → `.btn.ghost:hover:not(:disabled) {…}`
- Z. 286 `.btn:disabled { opacity: .5; cursor: not-allowed; }` → `.btn:disabled, .tpl-menu .item:disabled { opacity: var(--disabled-o); cursor: not-allowed; }` und direkt darunter neu `.btn.primary:disabled { background: var(--surface); border-color: var(--border-2); color: var(--text); box-shadow: none; }`
- Z. 427 `.dp-day:disabled, .dp-month:disabled { opacity: .35; cursor: not-allowed; background: none; }` → `{ opacity: var(--disabled-o); cursor: default; background: none; }`
- Z. 1089 `.nb-toolbar .tb:disabled { opacity: .35; cursor: default; background: none; color: inherit; }` → `{ opacity: var(--disabled-o); cursor: not-allowed; background: none; color: inherit; }`
- Z. 1583 `.w-bar .mv .btn:disabled { opacity: .3; }` löschen.
- Z. 1619 `.sp-item .btn:disabled:not(.added) {…}` löschen (Z. 1618 `.sp-item .btn.added { … opacity: 1 }` bleibt und gewinnt mit 0,3,0).
- Z. 1634 `.tpl-menu .item:disabled { opacity: .5; cursor: default; }` löschen (steckt jetzt in Z. 286).
- Z. 2221 `.rp-btn:disabled { opacity: .6; cursor: default; }` → `{ opacity: var(--disabled-o); cursor: not-allowed; }`
- Z. 2291 `.rp-chip.rp-chip-sm:disabled { opacity: .5; cursor: default; }` → `{ opacity: var(--disabled-o); cursor: not-allowed; }`
- Unverändert: Z. 1752 (Pager), 1019, 1722 (Blind-Replay).

```

## zustaende-S-C5 · Kacheln und Karten ohne Hover (kein Anheben, kein Schatten, kein Randwechsel)

Gruppe zustaende · Cluster komponenten · Aufwand S · Befunde: zustaende-34
Quelle: audit/spec/zustaende.md Z. 281–289 · Dateien: web/css/app.css
Abhängig von: —

```text
**S-C5 Kacheln und Karten ohne Hover** – zustaende-34
- Z. 485 `.card { …; transition: border-color var(--dur-2) var(--ease); }` → `transition: border-color var(--dur-1) var(--ease);`
- Z. 486 `.card:hover { border-color: var(--border-2); }` löschen.
- Z. 515 `.tile { …; transition: border-color var(--dur-2) var(--ease), transform var(--dur-2) var(--ease), box-shadow var(--dur-2) var(--ease); }` → `transition: border-color var(--dur-1) var(--ease);`
- Z. 516 `.tile:hover, .stat-tile:hover { … }` löschen.
- Z. 636 `.stat-tile { …; transition: border-color var(--dur-2) …, transform …, box-shadow … }` → `transition: border-color var(--dur-1) var(--ease);`
- Z. 2603 `.kstrip .tile:hover { … }` löschen (hob nur das Anheben auf; Z. 2602 hat dieselben Linien).
- Unverändert: `--lift-shadow` (Z. 48/59/69, genutzt von landing.css:56), Z. 497 (Info-Symbol), Z. 705 (`.cal .d:hover`).

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .kstrip .tile:hover] Karten und Kacheln haben keinen Hover-Zustand mehr. In app.css werden ersatzlos gelöscht: Z. 486 `.card:hover`, Z. 516 `.tile:hover, .stat-tile:hover`, Z. 2603 `.kstrip .tile:hover`. Die `transition`-Deklaration an `.card` (Z. 485), `.tile` (Z. 515) und `.stat-tile` (Z. 636) fällt ganz weg, weil dort kein Zustand mehr Rand, Schatten oder Lage ändert (kilook Z11: keine wirkungslosen Deklarationen; bewegung D3). Erhalten bleiben: (i) erscheint beim Darüberfahren und bei :focus-within (Z. 496–498, BRIEF „Info-Symbole nur beim Darüberfahren“); `.cal .d:hover` nach bewegung-C1, weil Kalendertage klickbar sind; das Token `--lift-shadow` (landing.css:56). Grund: Der BRIEF verlangt „ruhig, nichts Dekoratives“, und Hover-Rückmeldung gehört nur an Bedienbares. bewegung K1/H3 sieht genau diesen Fall selbst vor: Streicht zustaende `.card:hover`, folgen die Kacheln. S-C5 streicht es. Test motiontest.js:52–53: Beim Überfahren bleiben transform none und border-color unverändert. bewegung-3.11a und zustaende-S-TE3 sind dieselbe Änderung und werden einmal umgesetzt. Die Entscheidung zu `.tile:hover`/`.stat-tile:hover` in konflikt-14 muss hiermit übereinstimmen.
- ÜBERNIMMT bewegung-B5: B5 fällt als eigener Schritt weg. Es gibt keine Regel `.tile:hover, .stat-tile:hover { border-color: var(--border-2) }`. Das Löschen von Z. 516 und 2603 und das Streichen der Übergänge übernimmt S-C5.
- ÄNDERN: Z. 485 (.card), Z. 515 (.tile) und Z. 636 (.stat-tile): die transition-Deklaration ganz entfernen, statt sie auf `border-color var(--dur-1) var(--ease)` zu setzen. Die Löschungen Z. 486, 516 und 2603 bleiben wie spezifiziert, ebenso das padding aus abstaende-B1 in Z. 485.
- [konflikt: .stat-tile] Endstand: `.stat-tile { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: var(--sp-4) var(--sp-5); display: flex; flex-direction: column; container-type: inline-size; min-width: 0; transition: border-color var(--dur-1) var(--ease); }`, ohne :hover (siehe .tile:hover). Am Handy (≤560) `.stat-tile { padding: var(--sp-4) var(--sp-3); }` (abstaende-C7). Im hellen Design derselbe Schatten wie .tile (komponenten-C25a). Grund: .tile bekommt durch abstaende-B7 dieselben 16/20 px; damit ist „.stat-tile = .tile“ (Komponenten) erfüllt, 12/15 px war nur der alte .tile-Wert. abstaende-B15 schreibt padding und flex, responsiv-B7 nur container-type, zustaende-S-C5 die Transition.
- [konflikt: .tile] Endstand: `.tile { …; padding: var(--sp-4) var(--sp-5); …; gap: var(--sp-2); …; transition: border-color var(--dur-1) var(--ease); }` (abstaende-B7 und zustaende-S-C5). Kacheln, Statistik-Kacheln und Karten reagieren beim Darüberfahren gar nicht: kein Anheben, kein Schatten, kein Randwechsel. Nur das (i) blendet ein (Z. 497 bleibt). Grund: Kacheln und Karten sind nicht klickbar. Ein Randwechsel täuscht Klickbarkeit vor und ist Bewegung ohne Bedeutung (BRIEF: ruhig, nichts Dekoratives). Die Bewegungs-Regel H3 („Kacheln folgen .card:hover“) bleibt erfüllt, weil zustaende-S-C5 auch .card:hover löscht. Die Rand-Variante aus Bewegung und Komponenten entfällt.
- [konflikt: .tile:hover] Z. 516 `.tile:hover, .stat-tile:hover { … }` wird ganz gelöscht (zustaende-S-C5), Begründung wie beim Anker .tile. Den Test passt bewegung-3.11a einmal an: Name „Kachel bleibt beim Überfahren ruhig“. Nach `p.hover('.tile >> nth=1')` prüft er `transform === 'none'` und dass `borderColor` gleich dem Wert vor dem Überfahren ist.
- [konflikt: .stat-tile:hover] Wie bei .tile:hover: Es gibt keinen Hover an .stat-tile (Z. 516 wird ganz gelöscht, zustaende-S-C5). Die Transition an .stat-tile lautet `border-color var(--dur-1) var(--ease)`, das (i) blendet weiter über Z. 497 ein.

## zustaende-S-C6 · Toast nimmt Zeiger an (Anhalten beim Darüberfahren)

Gruppe zustaende · Cluster komponenten · Aufwand S · Befunde: zustaende-19, barrierefreiheit-20
Quelle: audit/spec/zustaende.md Z. 290–292 · Dateien: web/css/app.css
Abhängig von: —

```text
**S-C6 Toast** – zustaende-19, barrierefreiheit-20
Z. 898 `.toast { … }`: am Ende `pointer-events: auto;` ergänzen. Z. 897 `.toast-wrap` behält `pointer-events: none`.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .toast-wrap] Den Container legt zustaende-S-U6 an (siehe U.toast). zustaende-S-C6 setzt nur .toast { pointer-events: auto }, .toast-wrap behält pointer-events: none. Damit ist S-C6 verträglich und die Voraussetzung dafür, dass das Anhalten beim Darüberfahren in S-U6 funktioniert.

## zustaende-S-C7 · Aktiver Filter-Knopf .btn.is-on im gemeinsamen Ausgewählt-Stil, Zähler .cntb neutral

Gruppe zustaende · Cluster komponenten · Aufwand S · Befunde: bereich_dashboard-6
Quelle: audit/spec/zustaende.md Z. 293–297 · Dateien: web/css/app.css
Abhängig von: —

```text
**S-C7 Gemeinsamer Ausgewählt-Stil und Zähler** – bereich_dashboard-6
- Z. 3123–3126 (Selektorliste vor `{ color: var(--lc, var(--text)); … }`): nach `.sb-user.active` die Klasse `, .btn.is-on` ergänzen.
- Z. 1341 `.btn .cntb { … background: var(--text); color: var(--bg); font-size: 11px; font-weight: 700; }` → `background: color-mix(in srgb, var(--text) 16%, transparent); color: var(--text); font-size: 11px; font-weight: 600;`
- Z. 1421 `.fd-panel .cntb {…}`: dieselbe Änderung.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .btn .cntb] Das Gewicht 700 → 600 steht zweimal da (3.2.4l und S-C7). S-C7 übernimmt es zusammen mit der neutralen Farbe, 3.2.3d stellt die Größe auf das Token um. Endstand: `.btn .cntb { display: inline-grid; place-items: center; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 999px; background: color-mix(in srgb, var(--text) 16%, transparent); color: var(--text); font-size: var(--fs-11); line-height: var(--lh-11); font-weight: 600; }`. Ein Zähler ist ein Etikett, daher 600, ohne Grün. Prüfung zustaende 8 (kein `var(--bg)` in `.btn .cntb`) ist damit erfüllt.
- [doppelt: .fd-panel .cntb] Wie bei .btn .cntb: S-C7 setzt Fläche `color-mix(in srgb, var(--text) 16%, transparent)`, Schrift `var(--text)` und Gewicht 600, 3.2.3d stellt `font-size: var(--fs-11); line-height: var(--lh-11)` um. 3.2.4l ändert die Zeile nicht separat.
