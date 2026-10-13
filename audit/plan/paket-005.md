# Paket 005 · komponenten

Schritte: 14 · Dateien: web/css/app.css
Betroffene Tests laut Spezifikation: e2e/affiliatetest.js:16; e2e/calmnavtest.js:40–51 (.tabs[data-subnav] scrollLeft); e2e/certtest.js; e2e/colorpickertest.js; e2e/dashtest.js:25, :42 (.seg.mini); e2e/dptest.js; e2e/filtertest.js; e2e/filtertest.js (.fd-seg); e2e/filtertest.js:13–24 (.fd-chip/.fd-add); e2e/filtertest.js:9, :49, :56; e2e/friedhoftest.js:19–21; e2e/friedhoftest.js:20; e2e/headtest.js:63–64; e2e/headtest.js:63–64 (.seg gewählt 500); e2e/langtest.js:33; e2e/langtest.js:33 (keine abgeschnittenen .seg-Tasten); e2e/mobiletest.js:29 (TradeLog .tabs button einreihig, flexWrap); e2e/proptest.js:19, :91, :95; e2e/rangetest.js; e2e/sampletest.js:81; e2e/settest.js:22 (#be-from/#be-to; .input-unit fällt erst mit S-misc-e weg); e2e/sixtest.js:26–31; e2e/sixtest.js:53–55 (.nb .tags-row .chip); e2e/sixtest.js:54–56 (#pop-nbtags .item[aria-checked]); e2e/tradeformtest.js:11 (#f-rating); e2e/tradeformtest.js:21–29 (#sym-menu .sym-opt); e2e/tradeformtest.js:30, :47 (#f-fees)
Baut auf Paketen auf: 1

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

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
- [doppelt: .fd-seg button] Ergebnis `.fd-seg button { …; font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 500; … }`. Das Gewicht 600 → 500 setzt typografie-3.2.4d als Gewichts-Sweep für alle Filter-Bausteine (.fd-seg button, .fd-tog button, .fd-chip, .fd-add), die Größe typografie-3.2.3h. Von komponenten-C14b bleiben `.fd-seg { gap: 2px; background: var(--surface-2); }` und die Löschungen.
- [konflikt: .seg.segc button] Toter Code (kein `segc` in js/ oder HTML): komponenten-C14b löscht Z. 2542–2545 und den Handy-Teil in Z. 2754. Nicht tokenisieren.
- [konflikt: .cert-opts .seg.sm button] komponenten-C14b löscht Z. 1965–1966. Das ist kein toter Code: certificate.js:73 rendert `.seg.sm` in `.cert-opts`. Die Format-Schalter erben danach aber die neue Segment-Grundregel aus C14a (34 px, 13 px, 500), und genau das ist gewollt (eine Bauart). Das <small> in den Tasten erbt 500. Nicht tokenisieren.
- VERBINDLICH (Kreuzprüfung): web/css/app.css, nach komponenten-C14a:
1) Z. 1584–1585 → `.seg.mini { padding: 2px; border-radius: 8px; flex-wrap: nowrap; }` und `.seg.mini button { height: 24px; padding: 0 7px; font-size: var(--fs-12); line-height: var(--lh-12); border-radius: 6px; }` (12 statt 11.5 px; derselbe Endwert, den typografie-3.2.3e für Z. 1585 setzt – wer später läuft, findet ihn vor).
2) Z. 1385 `.fd-seg { … }`: `gap: 2px; background: var(--surface-2);` statt gap 4 / --surface. Z. 1386 `.fd-seg button` in diesem Schritt NICHT anfassen: Gewicht 600 → 500 setzt typografie-3.2.4d, Größe var(--fs-13)/var(--lh-13) typografie-3.2.3h.
3) Z. 1965–1966 (`.cert-opts .seg.sm button`, `.cert-opts .seg.sm button small`) löschen. Das ist kein toter Code (certificate.js:73 rendert `.seg.sm` in `.cert-opts`): Die Format-Schalter erben danach bewusst die Segment-Grundregel aus C14a (34 px, 13 px, 500), das `<small>` erbt 500. Nichts tokenisieren. Danach modal_zertifikat bei 1440 und 390 prüfen: Format-Schiene in einer Zeile, Tasten 34 px hoch.
4) Z. 2542–2545 (`.seg.segc …`, toter Code) löschen; in Z. 2754 den Teil `.seg.segc { max-width: 100%; } .seg.segc button { white-space: normal; line-height: 1.25; }` samt Kommentar streichen.
dashtest.js:25/42 ist nicht betroffen.

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
- [konflikt: .rating] Eine Bauart `.scale5` für Check-in und Bewertung (komponenten), mit der ARIA-Struktur aus barrierefreiheit. Die Zustände hängen deshalb an `aria-checked` bzw. der Klasse `.on`, nicht mehr an `aria-pressed`. Gelbe Schrift ist `--warn-text` (Farbregel). MARKUP app.js: Z. 428 `<span class="lbl" id="f-rating-l">Bewertung</span><div class="scale5 rating" id="f-rating" role="radiogroup" aria-labelledby="f-rating-l">` mit Knöpfen `role="radio" class="${t.rating >= n ? 'on' : ''}" aria-checked="${t.rating === n}" aria-label="${n} von 5 Sternen"`; set-rating schaltet `.on` kumulativ und `aria-checked` nur am n-ten Stern (P13). Z. 513 `scale()` wird `<div class="scale5" role="radiogroup" aria-labelledby="${lid}" data-chips="${name}">` mit `role="radio" aria-checked aria-label="${n} – ${label}"`; seg-set setzt aria-checked (P14a). CSS app.css statt Z. 322–325: `.scale5 { display: inline-flex; gap: 6px; } .scale5 button { width: 32px; height: 32px; padding: 0; border-radius: 8px; border: 1px solid var(--border); background: var(--surface); color: var(--text-2); font-size: 13px; font-weight: 500; cursor: pointer; transition: … var(--dur-1) var(--ease); } .scale5 button:hover { color: var(--text); background: var(--surface-2); } .scale5.rating button { color: var(--muted); } .scale5.rating button.on { --lc: var(--warn-text); }`. Im Handy-Block (≤560px): `.scale5 button { width: 44px; height: 44px; }`, 5 × 44 + 4 × 6 = 244 px. In der gemeinsamen Auswahlregel (~Z. 3125) wird `.rating button[aria-pressed="true"]` zu `.scale5 button[aria-checked="true"], .scale5.rating button.on`; das gilt auch für barrierefreiheit-B9b, das diesen Selektor dann nicht mehr anfasst. Größe: Desktop einheitlich 32 px für beide Skalen, denn 32 ≥ 24 erfüllt WCAG 2.5.8 und eine Bauart hat eine Größe. Die 36 px aus barrierefreiheit stammen von der alten Pillenform, die komponenten löscht. Am Handy 44 px, wie barrierefreiheit es für Touch verlangt, für die ganze Bauart. barrierefreiheit-Test 19 (≥ 44 bei 390 px) bleibt gültig; Prüfpunkt 22 heißt dann „Check-in-Skala 32 px (Handy 44)“.
- [konflikt: .rating button[aria-pressed="true"]] Den Selektor gibt es danach nicht mehr. Endzustand wie beim Anker .rating: `.scale5.rating button { color: var(--muted); }` und `.scale5.rating button.on { --lc: var(--warn-text); }`. Gelbe Schrift ist immer --warn-text (farbe). Im hellen Design hat --warn als Schrift zu wenig Kontrast. In der gemeinsamen Auswahlregel steht `.scale5 button[aria-checked="true"], .scale5.rating button.on`.
- [reihenfolge: --lc] Keine Werte-Kollision: C23 entfernt --lc an den News-Wichtigkeits-Chips, C15 setzt --lc an den Bewertungssternen (Wert --warn-text, siehe Anker .rating). Die Umkehr der newstest-Prüfung (D2b) setzt die Code-Änderung C23 voraus.
- VERBINDLICH (Kreuzprüfung): web/css/app.css. Z. 323–325 (`.rating`, `.rating button`, `.rating button[aria-pressed="true"]`) ersetzen durch:
`.scale5 { display: inline-flex; gap: 6px; }`
`.scale5 button { width: 32px; height: 32px; padding: 0; border-radius: 8px; border: 1px solid var(--border); background: var(--surface); color: var(--text-2); font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 500; cursor: pointer; transition: background var(--dur-1) var(--ease), color var(--dur-1) var(--ease), border-color var(--dur-1) var(--ease); }`
`.scale5 button:hover { color: var(--text); background: var(--surface-2); }`
`.scale5.rating button { color: var(--muted); }`
`.scale5.rating button.on { --lc: var(--warn-text); }`
Im Block `@media (max-width: 560px)` neu: `.scale5 button { width: 44px; height: 44px; }` (gilt für Check-in und Bewertung; 5 × 44 + 4 × 6 = 244 px). Keine Regeln `.scale5:not(.rating) button` mit 36 px.
In der gemeinsamen Auswahlregel (~Z. 3125) `.rating button[aria-pressed="true"]` → `.scale5 button[aria-checked="true"], .scale5.rating button.on` (barrierefreiheit-B9b fasst diesen Selektor danach nicht mehr an).
Z. 1390 `.fd-tog.stars button { letter-spacing: -1px; font-size: 11px; color: var(--warn); }` → `letter-spacing` streichen.
Markup nicht hier: barrierefreiheit-P13 setzt Z. 428 `class="scale5 rating"` (radiogroup/radio, .on kumulativ, aria-checked nur am n-ten Stern), barrierefreiheit-P14a Z. 513 `class="scale5"`; beide nach diesem Schritt, komponenten-A6 entfällt. typografie-3.2.3l (Z. 324) und typografie-3.2.3h (Z. 322) lassen die Zeilen aus. Prüfpunkt barrierefreiheit „Check-in-Skala 36 px (Handy 44)“ lautet danach „Check-in-Skala 32 px (Handy 44)“; der Test ≥ 44 px bei 390 px bleibt.

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
- [konflikt: .prop-tabs a] Die Schiene aus komponenten-C19 ist die einzige Regel für `.tabs > button, .tabs > a, .prop-tabs a`, mit Skalenwerten statt 13.5/12.5 px: `display: inline-flex; align-items: center; height: 34px; padding: 0 12px; border: 1px solid transparent; border-radius: 9px; background: none; color: var(--text-2); font-size: var(--fs-14); line-height: var(--lh-14); font-weight: 500; …` (Rest wie C19). Fokus: `.tabs > button:focus-visible, .tabs > a:focus-visible, .prop-tabs a:focus-visible { outline-offset: -2px; }`, nur der Versatz. Farbe und Stärke kommen aus der globalen :focus-visible-Regel, nach barrierefreiheit-A1 var(--focus), nie --accent. Handy ≤560: `.prop-tabs a { flex: 1 1 auto; justify-content: center; padding: 0 4px; font-size: var(--fs-13); line-height: var(--lh-13); }`. Handy Z. 3054: `.tabs > button, .tabs > a { padding: 0 12px; font-size: var(--fs-13); line-height: var(--lh-13); }`. Gewählt über die gemeinsame Regel am Dateiende mit `.prop-tabs a[aria-current="page"]` (barrierefreiheit-B9b). Erst danach streichen prop.js 304/305 und affiliate.js 51 das aria-pressed (inkl. der Testanpassungen barrierefreiheit.md Z. 905–907). Grund: Reiter = 14/500 laut Typografie-Rollen, 12.5/13.5 sind verboten, Grün nie für Fokus (BRIEF, barrierefreiheit Z1).
- [konflikt: .prop-sub a:focus-visible] Am Ende gibt es eine einzige Fokusregel: `.subtabs > button:focus-visible, .set-tabs > button:focus-visible, .prop-sub a:focus-visible { outline-offset: -2px; }` (aus komponenten-C20). Ring 2px var(--focus) aus der globalen Regel. Die alte Z. 2592 löscht komponenten-C19 vollständig. Grund: barrierefreiheit Z1 („nur der Versatz weicht ab“, −2px in Scroll-Leisten), kein Grün als Fokus (BRIEF).
- [konflikt: .prop-tabs a:focus-visible] `.tabs > button:focus-visible, .tabs > a:focus-visible, .prop-tabs a:focus-visible { outline-offset: -2px; }` aus komponenten-C19, ohne eigene Farbe. Der Ring kommt global (2px var(--focus) nach barrierefreiheit-A1). Gleiche Begründung wie bei .prop-sub a:focus-visible.
- [konflikt: .tabs.scroll-x] Statistik-Reiter in stats.js Z. 15, genau so: `<nav class="tabs scroll-x" data-subnav aria-label="Statistik-Bereiche">${TABS.map(([k, l]) => `<a href="#/stats/${k}"${tab === k ? ' aria-current="page"' : ''}>${l}</a>`).join('')}</nav>`. Das heißt: <nav> mit Namen, kein .btn, keine Inline-Farbe, kein aria-pressed, aria-current nur am gewählten Link. CSS: `.tabs.scroll-x { overflow-x: auto; flex-wrap: nowrap; padding: 3px; margin: 0; }` (C19). Ungewählt --text-2 und Hover --text kommen aus der Schienen-Regel `.tabs > a` (C19). Gewählt kommt aus der gemeinsamen Regel mit `.tabs a[aria-current="page"]` (B9b). Die Zusatzregel `.tabs a:not([aria-current="page"]) …` aus B9b ist überflüssig. Abstand zum Inhalt: Die Schiene hat jetzt einen sichtbaren Rand und kein Scroll-Polster mit Gegenrand mehr. Deshalb entfällt der −4px-Ausgleich in abstaende-C8. Grund: Schiene statt Rahmenknöpfe (komponenten), Navigation als <nav> mit aria-current (barrierefreiheit Z4), 12 px Reiter↔Inhalt (abstaende).
- [konflikt: .tabs.sm button] `.tabs.sm button` (Z. 1508) wird gelöscht (komponenten-C19). Der einzige Nutzer, widgets.js:257 „Letzte Trades / Offene Positionen“, wird über komponenten-W4 zu `.subtabs`. Es wird nichts tokenisiert.
- VERBINDLICH (Kreuzprüfung): web/css/app.css.
1) Z. 659–661 ersetzen durch:
`.tabs, .prop-tabs { display: inline-flex; gap: 2px; padding: 3px; max-width: 100%; border-radius: 12px; border: 1px solid var(--border); background: var(--surface); overflow-x: auto; scrollbar-width: none; overscroll-behavior-x: contain; }`
`.tabs::-webkit-scrollbar, .prop-tabs::-webkit-scrollbar { display: none; }`
`.tabs > button, .tabs > a, .prop-tabs a { display: inline-flex; align-items: center; height: 34px; padding: 0 12px; border: 1px solid transparent; border-radius: 9px; background: none; color: var(--text-2); font-size: var(--fs-14); line-height: var(--lh-14); font-weight: 500; text-decoration: none; white-space: nowrap; cursor: pointer; flex: 0 0 auto; transition: background var(--dur-1) var(--ease), color var(--dur-1) var(--ease), border-color var(--dur-1) var(--ease); }`
`.tabs > button:hover, .tabs > a:hover, .prop-tabs a:hover { color: var(--text); background: var(--surface-2); }`
`.tabs > button:focus-visible, .tabs > a:focus-visible, .prop-tabs a:focus-visible { outline-offset: -2px; }` (nur der Versatz; Farbe und Stärke aus der globalen :focus-visible-Regel, nach barrierefreiheit-A1 var(--focus), nie --accent).
2) Z. 1508 `.tabs.sm button { … }` löschen (einziger Nutzer widgets.js:257 wird über komponenten-W4 zu .subtabs).
3) Z. 1511–1513 → `.tabs.scroll-x { overflow-x: auto; flex-wrap: nowrap; padding: 3px; margin: 0; }` (die zweite Regel mit margin -4px und die ::-webkit-scrollbar-Regel entfallen).
4) Z. 2588–2592 vollständig löschen (`.prop-tabs`, `::-webkit-scrollbar`, `.prop-tabs a`, `:hover` und die Fokusregel `.prop-tabs a:focus-visible, .prop-sub a:focus-visible`). Keine Zwischenregel `.prop-sub a:focus-visible` stehen lassen; die einzige Fokusregel für .prop-sub bringt komponenten-C20.
5) Handy Z. 2753 → `.prop-tabs a { flex: 1 1 auto; justify-content: center; padding: 0 4px; font-size: var(--fs-13); line-height: var(--lh-13); }`.
6) Handy Z. 3054 `.tabs button { padding: 9px 14px; font-size: 13px; }` → `.tabs > button, .tabs > a { padding: 0 12px; font-size: var(--fs-13); line-height: var(--lh-13); }`; Z. 3052 bleibt.
Gewählt-Zustand nicht hier: gemeinsame Auswahlregel am Dateiende mit `.prop-tabs a[aria-current="page"]` (barrierefreiheit-B9b). typografie-3.2.3h (Z. 1508, 2753), 3.2.3l (Z. 3054), 3.2.3m (Z. 660, 2590) und 3.2.4d (Z. 2590) lassen diese Zeilen aus.

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
- ÜBERNIMMT zustaende-S-C9b: Z. 1867, 1869, 2595 und 2597 (500, --text statt Akzent) stecken in der gemeinsamen Fassung von C20. Die grep-Prüfung in zustaende.md Z. 908 bleibt gültig.
- [doppelt: .set-tabs button[aria-pressed="true"]] Dreimal dieselbe Änderung (gewählt: Schrift --text, Linie --text). komponenten-C20 übernimmt sie mit `.set-tabs > button[aria-pressed="true"]`; die Linie kommt über ::after statt border-bottom. Die Anpassungen für farbe-B21 (nur noch .prop-fsel.on) und zustaende-S-C9b (zusammen_mit C20) stehen beim Anker .prop-sub a::after.
- [konflikt: .prop-sub a[aria-pressed="true"]] Der gewählte Prop-Unterreiter wird nur über aria-current="page" markiert. Links tragen kein aria-pressed (barrierefreiheit Z4), und prop.js:305 setzt aria-current schon heute. komponenten-C20 schreibt die Selektoren gleich als `.prop-sub a[aria-current="page"]` und `.prop-sub a[aria-current="page"]::after`. barrierefreiheit-B9b ändert die .prop-sub-Zeilen nicht mehr.
- [reihenfolge: .prop-sub] Die drei Schritte vertragen sich. C20 lässt .prop-sub wischbar ohne Scrollbalken, A2 blendet die Ränder per Maske aus, 3.3d setzt fade-l/fade-r. C20 macht aber auch .set-tabs und das neue .subtabs zu wischbaren Leisten (overflow-x: auto, kein Balken). Darum gilt die Wischleisten-Regel von responsiv (28-px-Auslauf an jedem Rand, hinter dem es weitergeht) auch dort, und die Selektorlisten in A2 und 3.3d bekommen .subtabs und .set-tabs dazu. Die Antwort auf aufbau-16 muss nicht abgewartet werden. Bei Ja fällt .prop-sub aus beiden Listen.
- [konflikt: .set-tabs button] Die gemeinsame Unterstrich-Fassung aus komponenten-C20 ersetzt .set-tabs und .prop-sub. Schrift in der Text-Skala: font-size: var(--fs-14); line-height: var(--lh-14); font-weight: 500. 13.5px ist in der Skala verboten, und Reiter haben laut typografie 14. Gewicht 500 und Unterstrich in --text verlangen auch zustaende-S-C9b und typografie-3.2.4d, C20 übernimmt das. Die Fokus-Zeile in C20 setzt nur den Versatz, ohne eigene Farbe (--accent als Fokusfarbe ist laut barrierefreiheit verboten; Farbe und Stärke kommen aus der globalen :focus-visible-Regel). Den Selektor für .prop-sub a (aria-pressed oder aria-current) regelt der Anker .prop-sub a.
- ÜBERNIMMT zustaende-S-C9b: Alle vier Zeilen (1867, 1869, 2595, 2597) gehen in der Ersatzregel von C20 auf (500, Unterstrich und Auswahl in --text).
- [konflikt: .prop-sub a] komponenten-C20 trägt die Unterstrich-Reiter `.subtabs > button, .set-tabs > button, .prop-sub a` mit `font-size: var(--fs-14); line-height: var(--lh-14); font-weight: 500; color: var(--muted)`. Hover und gewählt in --text, Linie `::after` mit `background: var(--text)`. Gewählt bei Knöpfen `[aria-pressed="true"]`, bei den Prop-Links `.prop-sub a[aria-current="page"]` (für Farbe und `::after { transform: scaleX(1) }`), weil Links kein aria-pressed tragen (barrierefreiheit Z4). Fokus `outline-offset: -2px`, nur der Versatz. Die Farbe kommt global, nicht --accent. -2px statt 2px, weil die Leiste mit overflow-x: auto den äußeren Ring oben abschneiden würde (barrierefreiheit Z1). .set-tabs bleibt damit 14 px und wird nur 600 → 500. Grund: Typografie-Rolle Reiter 14/500, keine 13.5 px. Unterstrich in --text statt Grün (BRIEF).
- ÜBERNIMMT zustaende-S-C9b: Vollständig in komponenten-C20 enthalten: .set-tabs/.prop-sub 500, gewählt --text, Linie var(--text). Nicht separat umsetzen.
- [konflikt: .prop-sub a:focus-visible] Am Ende gibt es eine einzige Fokusregel: `.subtabs > button:focus-visible, .set-tabs > button:focus-visible, .prop-sub a:focus-visible { outline-offset: -2px; }` (aus komponenten-C20). Ring 2px var(--focus) aus der globalen Regel. Die alte Z. 2592 löscht komponenten-C19 vollständig. Grund: barrierefreiheit Z1 („nur der Versatz weicht ab“, −2px in Scroll-Leisten), kein Grün als Fokus (BRIEF).
- VERBINDLICH (Kreuzprüfung): web/css/app.css, nach komponenten-C19. Z. 1866–1869 (`.set-tabs …`) und Z. 2593–2598 (`.prop-sub …`) ersetzen durch genau diese Fassung:
`.subtabs, .set-tabs, .prop-sub { display: flex; gap: 22px; border-bottom: 1px solid var(--border); overflow-x: auto; scrollbar-width: none; }`
`.subtabs::-webkit-scrollbar, .set-tabs::-webkit-scrollbar, .prop-sub::-webkit-scrollbar { display: none; }`
`.subtabs > button, .set-tabs > button, .prop-sub a { position: relative; padding: 2px 1px 11px; border: 0; background: none; font-size: var(--fs-14); line-height: var(--lh-14); font-weight: 500; color: var(--muted); text-decoration: none; white-space: nowrap; cursor: pointer; transition: color var(--dur-1) var(--ease); }`
`.subtabs > button:hover, .set-tabs > button:hover, .prop-sub a:hover, .subtabs > button[aria-pressed="true"], .set-tabs > button[aria-pressed="true"], .prop-sub a[aria-current="page"] { color: var(--text); }`
`.subtabs > button::after, .set-tabs > button::after, .prop-sub a::after { content: ''; position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; border-radius: 2px; background: var(--text); transform: scaleX(0); }` (ohne transition: alle drei Leisten bauen beim Klick neu auf bzw. navigieren, der Übergang liefe nie)
`.subtabs > button[aria-pressed="true"]::after, .set-tabs > button[aria-pressed="true"]::after, .prop-sub a[aria-current="page"]::after { transform: scaleX(1); }`
`.subtabs > button:focus-visible, .set-tabs > button:focus-visible, .prop-sub a:focus-visible { outline-offset: -2px; }` (nur der Versatz; Ring 2px var(--focus) aus der globalen Regel; -2px, weil overflow-x: auto einen äußeren Ring abschneiden würde).
Knöpfe (.subtabs/.set-tabs) bleiben bei aria-pressed; die Prop-Links tragen aria-current="page" bereits (prop.js:305). Eine .prop-sub-Fokusregel aus C19 gibt es nicht mehr. typografie-3.2.3m (Z. 2595) und 3.2.4d (Z. 1867, 2595) lassen diese Zeilen aus. Danach friedhoftest.js:20, sampletest.js:81 und headtest.js:63–64 prüfen. Wird aufbau-16 (F2) mit Ja beantwortet, streicht aufbau später die .prop-sub-Selektoren; darauf wird nicht gewartet.

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

- [doppelt: .popover .sec] Die Typografie der Abschnittsköpfe in Menüs kommt nur aus der Eyebrow-Sammelregel in typografie-3.2.2b (11/600/.06em/Versal/'case'/--muted). Die Einzelregel .popover .sec behält nur den Innenabstand `padding: 8px 10px 4px` (komponenten-C21a). Der gleiche Rollenkopf im Filter-Fenster (.fd-pop .fd-gh) wird in die Sammelregel aufgenommen, statt dieselben Werte in aufbau-A4f ein zweites Mal zu schreiben.
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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .fd-foot .fd-n] komponenten-C24 gilt, zusammen mit komponenten-S-dash-filter (footHTML) im selben Zug. Die Trade-Zahl steht links als Meta außerhalb des Knopfs (13 px, --muted, Ellipse); Z. 1419/1420 werden gelöscht. Einen Trennstrich im Knopf gibt es damit nicht mehr, farbe-B2s Umstellung auf currentColor ist gegenstandslos.
- [konflikt: .fd-pop .fd-foot .btn] komponenten-C24 löscht Z. 1367 (`.fd-pop .fd-foot .btn { …font-size: 12.5px }`). Die Fußknöpfe sind künftig `.btn.sm` und bekommen 13 px über Z. 280 (`.btn.sm`) aus demselben Typografie-Schritt.
