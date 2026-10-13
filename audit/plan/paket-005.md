# Paket 005 · komponenten

Schritte: 34 · Dateien: web/README.md, web/css/app.css, web/e2e/mobiletest.js, web/js/app.js, web/js/datepicker.js, web/js/screens/dash-filter.js, web/js/ui.js
Betroffene Tests laut Spezifikation: e2e/affiliatetest.js:16; e2e/affiliatetest.js:19, :45; e2e/calmnavtest.js:40–51 (.tabs[data-subnav] scrollLeft); e2e/certtest.js; e2e/colorpickertest.js; e2e/dashtest.js:25, :42 (.seg.mini); e2e/dashtest.js:72 (.tracker-foot); e2e/dptest.js; e2e/filtertest.js; e2e/filtertest.js (.fd-seg); e2e/filtertest.js:13–24 (.fd-chip/.fd-add); e2e/filtertest.js:9, :49, :56; e2e/friedhoftest.js:19–21; e2e/friedhoftest.js:20; e2e/fwtest.js; e2e/headtest.js:63–64; e2e/headtest.js:63–64 (.seg gewählt 500); e2e/langtest.js:33; e2e/langtest.js:33 (keine abgeschnittenen .seg-Tasten); e2e/mobiletest.js:26–27 (Handy-Wert, siehe E1h); e2e/mobiletest.js:27; e2e/mobiletest.js:29 (TradeLog .tabs button einreihig, flexWrap); e2e/motiontest.js:18, :57; e2e/proptest.js; e2e/proptest.js:19, :91, :95; e2e/rangetest.js; e2e/rangetest.js (.rr-nav); e2e/replaytest.js; e2e/sampletest.js:81; e2e/settest.js:22 (#be-from/#be-to; .input-unit fällt erst mit S-misc-e weg); e2e/shadowtest.js:37–46 (Seitenwahl); e2e/shadowtest.js:53 (fill auf input[type=time]); e2e/sixtest.js:26–31; e2e/sixtest.js:39–40; e2e/sixtest.js:53–55 (.nb .tags-row .chip); e2e/sixtest.js:54–56 (#pop-nbtags .item[aria-checked]); e2e/tlfittest.js; e2e/tlfittest.js:8–9 (Pager sichtbar); e2e/tradeformtest.js:11; e2e/tradeformtest.js:11 (#f-rating); e2e/tradeformtest.js:11, :30, :47 (#f-fees); e2e/tradeformtest.js:21–29 (#sym-menu .sym-opt); e2e/tradeformtest.js:30, :47 (#f-fees); e2e/voicetest.js
Baut auf Paketen auf: 2, 4

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## komponenten-C05 · Eine Feld-Beschriftung (CSS-Teil; JS-Teil in U2, D3, S-prop-b, S-dashboard-d)

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: komponenten-18
Quelle: audit/spec/komponenten.md Z. 213–219 · Dateien: web/css/app.css
Abhängig von: —

```text
**C05 – Eine Feld-Beschriftung** (komponenten-18)
- Z. 1381 `.fd-l { … font-size: 12.5px; font-weight: 600; color: var(--text-2); … }` → `font-size: 12px; font-weight: 600; color: var(--muted);`
- Z. 1360 `.fd-pop .fd-l { font-size: 11.5px; }` löschen.
- Z. 1964 `.cert-opts .lbl { display: block; font-size: 12px; font-weight: 600; color: var(--text-2); margin-bottom: 6px; }` → `.cert-opts .lbl { display: block; margin-bottom: 6px; }`
- Z. 2723 `.prop-rule-f .field span { … }` löschen.
(JS-Teil in U2, D3, P2.)

```

## komponenten-C06 · Hauptknopf ohne Schein beim Darüberfahren (Füllfarbe erst nach N1)

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: komponenten-1
Quelle: audit/spec/komponenten.md Z. 220–225 · Dateien: web/css/app.css
Abhängig von: —

```text
#### B. Komponenten

**C06 – Hauptknopf ohne Schein** (komponenten-1)
Z. 275 `.btn.primary:hover { background: var(--accent-2); border-color: var(--accent-2); box-shadow: 0 8px 20px -10px var(--accent-glow); }` → `.btn.primary:hover { background: var(--accent-2); border-color: var(--accent-2); box-shadow: none; }`
(Die Füllfarbe Z. 274 erst nach Antwort auf N1 ändern.)

```

## komponenten-C07 · Ein Pfeilknopf .btn.nav (34×34), .rr-nav 32×32, Seitenwahl-Pfeile ohne Verbund

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: komponenten-25, bereich_dashboard-26, komponenten-12
Quelle: audit/spec/komponenten.md Z. 226–233 · Dateien: web/css/app.css
Abhängig von: —

```text
**C07 – Ein Pfeilknopf** (komponenten-25, bereich_dashboard-26, komponenten-12)
- Z. 284–285 `.btn.round { … }` und `.btn.round.accent { … }` ersetzen durch:
```css
.btn.nav { width: 34px; height: 34px; padding: 0; border-radius: 9px; justify-content: center; flex: 0 0 auto; }
```
- Z. 352 `.rr-nav { width: 30px; height: 30px; …}` → `width: 32px; height: 32px;` (Rest bleibt).
- Z. 1749–1753 (`.pager .pg-nav { …border…overflow… }`, `.pager .pg-nav button {…}`, `button + button`, `:hover`, `:disabled`) ersetzen durch `.pager .pg-nav { display: inline-flex; gap: 4px; }`. Z. 1754 `.pager .pg-nav svg` löschen (16 px kommt aus `.btn svg`).

```

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

## komponenten-C21c · Symbol-Liste und Filter-Optionen auf Menümaß, gewählt neutral

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: komponenten-35, komponenten-2
Quelle: audit/spec/komponenten.md Z. 369–371 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 881 `.sym-opt { … gap: 12px; … padding: 9px 10px; … font-size: 13.5px; … }` → `gap: 10px; min-height: 36px; padding: 0 10px; font-size: 13px;`
- Z. 886 `.sym-opt[aria-selected="true"] { background: var(--accent-soft); color: var(--accent); }` → `.sym-opt[aria-selected="true"] { background: var(--surface-2); color: var(--text); }`
- Z. 1415 `.fd-opts .item { … gap: 8px; … padding: 8px 10px; … }` → `gap: 10px; min-height: 36px; padding: 0 10px; font-weight: 500;`; Z. 1417 `.fd-opts .item svg { width: 14px; height: 14px; }` → `width: 16px; height: 16px; color: var(--muted);`
```

## komponenten-C22 · Schwebende Ebenen Radius 12, kein grüner Rand

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: komponenten-34
Quelle: audit/spec/komponenten.md Z. 374–377 · Dateien: web/css/app.css
Abhängig von: —

```text
**C22 – Schwebende Ebenen** (komponenten-34)
- Z. 406 `.popover.dp { … border-radius: var(--radius); … }` und Z. 439 `.popover.cp { … border-radius: var(--radius); … }` → `border-radius: 12px;`
- Z. 1124 `.nb-ytpop { … border: 1px solid var(--accent); border-radius: 10px; … }` → `border: 1px solid var(--border-2); border-radius: 12px;`

```

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

## komponenten-C25b · Spark-Kachel: Trennlinie unter dem Titel, Wert aus .tile .val

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: diagramme-43
Quelle: audit/spec/komponenten.md Z. 406–406 · Dateien: web/css/app.css
Abhängig von: —

```text
- Spark-Kachel: Z. 1733 `.tile.spark-tile { gap: 2px; }` löschen. Z. 1734 `.tile.spark-tile .spark-body { … }` ergänzen um `padding-top: 8px; background: linear-gradient(90deg, var(--border), var(--border) 22%, transparent 48%) top left / 100% 1px no-repeat;`. Z. 1735 `.tile.spark-tile .val { font-family…; font-size: 28px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.1; flex…}` → `.tile.spark-tile .val { flex: 0 0 auto; display: flex; align-items: center; margin: 0; padding: 0; min-height: 0; }` (Größe, Schrift, Gewicht kommen aus `.tile .val`).
```

## komponenten-C25c · Kennzahlen-Leisten im hellen Design nur Haarlinien; Hinweise (--lift-shadow bleibt, Werte aus Typografie/Abstände gelten auch für .stat-tile)

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: bereich_konto-28, bereich_dashboard-11, bereich_statistik-8
Quelle: audit/spec/komponenten.md Z. 407–410 · Dateien: web/css/app.css
Abhängig von: —

```text
- Nach Z. 2603 neu: `:root[data-theme="light"] .kstrip .tile, :root[data-theme="light"] .kstrip .tile:hover { box-shadow: -1px 0 0 var(--border), 0 -1px 0 var(--border); }`
- `--lift-shadow` (Z. 48, 59, 69) bleibt (landing.css:56).
- Wenn die Typografie- oder Abstände-Spezifikation `.tile .head`, `.tile .val` oder das Kachel-Padding ändert, gelten deren Werte gleichermaßen für `.stat-tile .k`, `.stat-tile .v` und `.stat-tile`.

```

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

## komponenten-A6 · Check-in und Bewertung als .scale5 (Markup)

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: komponenten-44
Quelle: audit/spec/komponenten.md Z. 570–573 · Dateien: web/js/app.js
Abhängig von: komponenten-C14a, komponenten-C15

```text
**A6 – Check-in und Bewertung als 1–5-Skala** (komponenten-44)
- Z. 513 `<div class="seg pill" data-chips="${name}">` → `<div class="scale5" data-chips="${name}">` (Aktion `seg-set` bleibt).
- Z. 428 `<div class="rating" id="f-rating">` → `<div class="scale5 rating" id="f-rating">`

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

## komponenten-E1h · e2e mobiletest.js: Handy-Kachelwert 22px

Gruppe komponenten · Cluster komponenten · Aufwand S · Befunde: bereich_statistik-8
Quelle: audit/spec/komponenten.md Z. 764–766 · Dateien: web/e2e/mobiletest.js
Abhängig von: komponenten-C25a

```text
- mobiletest.js:27: Erwartung `st.v === '20px'` → `st.v === '22px'`.

---
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

## aufbau-A3b · Kachel- und Statistik-Titel 13px/500

Gruppe aufbau · Cluster komponenten · Aufwand S · Befunde: typografie-4
Quelle: audit/spec/aufbau.md Z. 269–271 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 517 `.tile .head { … font-size: 13.5px; … }` → `font-size: 13px;`
- Z. 637 `.stat-tile .k { …; font-size: 13px; color: var(--text-2); }` → zusätzlich `font-weight: 500;`
- Z. 647 `.stat .k { … }` → zusätzlich `font-weight: 500;`
```
