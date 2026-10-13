# Paket 004 · komponenten

Schritte: 29 · Dateien: web/README.md, web/css/app.css, web/js/ui.js
Betroffene Tests laut Spezifikation: Akzeptanz 4.1 Nr. 5 („Trade loggen“ fett, „Filter“ mit aktivem Filter nicht fetter); Akzeptanz 4.2 Nr. 6 (letter-spacing 0.66px an .nav-title, .popover .sec, .nb .sec-h, .sp-group, .caption; kein 0.99px); Akzeptanz 4.3 notebook (Listentitel 14/600), prop („Copy NQ“ und „Aktive Konten“ gleich schwer); Akzeptanz 4.3 prop (Reiter 14/500); Akzeptanz 4.4: grep "a >= 10000" ohne Treffer; node --test web/tests/*.mjs; web/e2e/affiliatetest.js; web/e2e/coachtest.js; web/e2e/filtertest.js; web/e2e/headtest.js:61 (.set-nav 500, nicht betroffen); web/e2e/langtest.js:58; web/e2e/proptest.js:55 (UI.fmt.cur, passt sich an); web/e2e/scorestatetest.js:20 (Symbol > 10 px, bleibt grün); web/e2e/switchtest.js:9
Baut auf Paketen auf: 1

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## farbe-B1 · Hilfsklasse .warn auf --warn-text

Gruppe farbe · Cluster komponenten · Aufwand S · Befunde: farbe_kontrast-6, bereich_konto-3
Quelle: audit/spec/farbe.md Z. 228–231 · Dateien: web/css/app.css
Abhängig von: farbe-A1, farbe-A2

```text
### B. Komponenten (`web/css/app.css`, dann `web/js/ui.js`)

**B1 – Hilfsklassen, Z. 100:** `.warn { color: var(--warn); }` → `.warn { color: var(--warn-text); }` (`.accent` bleibt; nach C-Schritten nur noch von `.dp-link.accent` genutzt) — farbe_kontrast-6, bereich_konto-3

```

## farbe-B2 · .btn.primary global neutral angehoben (Fläche, Hover) und Trennstrich .fd-foot .fd-n auf currentColor

Gruppe farbe · Cluster komponenten · Aufwand S · Befunde: referenz-6, bereich_notebook_news-2, bereich_einstellungen-9, bereich_prop-16, bereich_trades_tag-21, bereich_dashboard-1, bereich_training-36, bereich_konto-3, barrierefreiheit-7
Quelle: audit/spec/farbe.md Z. 232–236 · Dateien: web/css/app.css
Abhängig von: —

```text
**B2 – Knöpfe, Z. 274–275** — referenz-6, bereich_notebook_news-2, bereich_einstellungen-9, bereich_prop-16, bereich_trades_tag-21, bereich_dashboard-1, bereich_training-36, bereich_konto-3, barrierefreiheit-7
- `.btn.primary { background: var(--accent); border-color: var(--accent); color: var(--accent-ink); font-weight: 600; }` → `.btn.primary { background: var(--surface-3); border-color: var(--border-2); color: var(--text); font-weight: 600; }`
- `.btn.primary:hover { background: var(--accent-2); border-color: var(--accent-2); box-shadow: 0 8px 20px -10px var(--accent-glow); }` → `.btn.primary:hover { background: color-mix(in srgb, var(--text) 8%, var(--surface-3)); border-color: color-mix(in srgb, var(--text) 18%, var(--border-2)); box-shadow: none; }`
- Folgeänderung Z. 1420 `.fd-foot .fd-n { … border-left: 1px solid color-mix(in srgb, var(--accent-ink) 30%, transparent); … }` → `border-left: 1px solid color-mix(in srgb, currentColor 30%, transparent);` (Trennstrich im neutralen „Anwenden“ bleibt sichtbar)

```

## farbe-B3a · Formfelder: Platzhalter und .field .hint in --muted, neue .lbl-hint, Häkchen neutral, Bewertung --muted/--warn-text

Gruppe farbe · Cluster komponenten · Aufwand S · Befunde: farbe_kontrast-10, farbe_kontrast-11, typografie-10, bereich_prop-34, barrierefreiheit-25, bereich_trades_tag-42, bereich_prop-40, farbe_kontrast-6, bereich_notebook_news-26
Quelle: audit/spec/farbe.md Z. 237–243 · Dateien: web/css/app.css
Abhängig von: farbe-A1, farbe-A2

```text
**B3 – Eingaben und Hinweise** — farbe_kontrast-10, farbe_kontrast-11, typografie-10, bereich_prop-34, barrierefreiheit-25, bereich_trades_tag-42, bereich_prop-40, farbe_kontrast-6, bereich_notebook_news-26
- Z. 294 `.input::placeholder { color: var(--faint); }` → `color: var(--muted);`
- Z. 299 `.field .hint { font-size: 11.5px; color: var(--faint); }` → `color: var(--muted);` (Größe unverändert, siehe K26)
- nach Z. 298 neu: `.field > label .lbl-hint { color: var(--muted); font-weight: 500; }`
- Z. 303 `.check input { accent-color: var(--accent); … }` → `accent-color: var(--text);`
- Z. 324 `.rating button { … color: var(--faint); … }` → `color: var(--muted);`
- Z. 325 `.rating button[aria-pressed="true"] { --lc: var(--warn); }` → `--lc: var(--warn-text);`
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .rating button] komponenten-C15 ersetzt die Grundregel .rating button (app.css:324) durch .scale5 button: 32×32, Radius 8, Rand --border, Fläche --surface, 500, --text-2, font-size: var(--fs-13); line-height: var(--lh-13). Dazu kommt .scale5.rating button { color: var(--muted); }. Damit sind barrierefreiheit-B9a (32 px) und farbe-B3a (Stern --faint → --muted) erfüllt. Der Gewählt-Zustand folgt der Radio-Semantik aus barrierefreiheit: aria-checked nur am gewählten Stern, Klasse .on kumulativ. Die Sternfarbe ist gelbe Schrift, also --warn-text (farbe): .scale5.rating button.on { --lc: var(--warn-text); }. Die Zeile .rating button[aria-pressed="true"] { --lc: var(--warn); } entfällt. In der gemeinsamen Auswahlregel (app.css:3125) stehen dafür .scale5.rating button.on und .scale5 button[aria-checked="true"]. Das muss deckungsgleich bleiben mit dem Anker .rating button[aria-pressed="true"] (Liste 16).
- ÄNDERN: Die Punkte Z. 324/325 entfallen hier: --muted steht in .scale5.rating button, --warn-text in .scale5.rating button.on (komponenten-C15). Die übrigen Punkte von B3a bleiben.
- [konflikt: .rating] Eine Bauart `.scale5` für Check-in und Bewertung (komponenten), mit der ARIA-Struktur aus barrierefreiheit. Die Zustände hängen deshalb an `aria-checked` bzw. der Klasse `.on`, nicht mehr an `aria-pressed`. Gelbe Schrift ist `--warn-text` (Farbregel). MARKUP app.js: Z. 428 `<span class="lbl" id="f-rating-l">Bewertung</span><div class="scale5 rating" id="f-rating" role="radiogroup" aria-labelledby="f-rating-l">` mit Knöpfen `role="radio" class="${t.rating >= n ? 'on' : ''}" aria-checked="${t.rating === n}" aria-label="${n} von 5 Sternen"`; set-rating schaltet `.on` kumulativ und `aria-checked` nur am n-ten Stern (P13). Z. 513 `scale()` wird `<div class="scale5" role="radiogroup" aria-labelledby="${lid}" data-chips="${name}">` mit `role="radio" aria-checked aria-label="${n} – ${label}"`; seg-set setzt aria-checked (P14a). CSS app.css statt Z. 322–325: `.scale5 { display: inline-flex; gap: 6px; } .scale5 button { width: 32px; height: 32px; padding: 0; border-radius: 8px; border: 1px solid var(--border); background: var(--surface); color: var(--text-2); font-size: 13px; font-weight: 500; cursor: pointer; transition: … var(--dur-1) var(--ease); } .scale5 button:hover { color: var(--text); background: var(--surface-2); } .scale5.rating button { color: var(--muted); } .scale5.rating button.on { --lc: var(--warn-text); }`. Im Handy-Block (≤560px): `.scale5 button { width: 44px; height: 44px; }`, 5 × 44 + 4 × 6 = 244 px. In der gemeinsamen Auswahlregel (~Z. 3125) wird `.rating button[aria-pressed="true"]` zu `.scale5 button[aria-checked="true"], .scale5.rating button.on`; das gilt auch für barrierefreiheit-B9b, das diesen Selektor dann nicht mehr anfasst. Größe: Desktop einheitlich 32 px für beide Skalen, denn 32 ≥ 24 erfüllt WCAG 2.5.8 und eine Bauart hat eine Größe. Die 36 px aus barrierefreiheit stammen von der alten Pillenform, die komponenten löscht. Am Handy 44 px, wie barrierefreiheit es für Touch verlangt, für die ganze Bauart. barrierefreiheit-Test 19 (≥ 44 bei 390 px) bleibt gültig; Prüfpunkt 22 heißt dann „Check-in-Skala 32 px (Handy 44)“.
- ÄNDERN: Die Punkte Z. 324/325 (`.rating`) entfallen. Ungewählt `--muted` und gewählt `--warn-text` setzt komponenten-C15 an `.scale5.rating`.
- [konflikt: .rating button[aria-pressed="true"]] Den Selektor gibt es danach nicht mehr. Endzustand wie beim Anker .rating: `.scale5.rating button { color: var(--muted); }` und `.scale5.rating button.on { --lc: var(--warn-text); }`. Gelbe Schrift ist immer --warn-text (farbe). Im hellen Design hat --warn als Schrift zu wenig Kontrast. In der gemeinsamen Auswahlregel steht `.scale5 button[aria-checked="true"], .scale5.rating button.on`.
- ÄNDERN: Die Punkte Z. 324/325 (`.rating`) entfallen. Ungewählt `--muted` und gewählt `--warn-text` setzt komponenten-C15 an `.scale5.rating`.
- [doppelt: .check input] Beide setzen `.check input { accent-color: var(--text); }`. komponenten-C17a übernimmt das, weil es auch `.prop-assign-row input`, `.coach-radio input` und die Quill-Checklisten im selben Zug neutralisiert.
- ÄNDERN: Den Punkt Z. 303 (`.check input` accent-color) nicht umsetzen, das übernimmt komponenten-C17a mit demselben Wert. Platzhalter, `.field .hint` und `.lbl-hint` bleiben.
- [konflikt: .field .hint] Am Anker selbst verträglich: Farbe `--muted` (farbe-B3a), Größe `var(--fs-12)`/`var(--lh-12)` (typografie), die neuen Fehlerregeln von S-C3 stehen danach. Ein Widerspruch steckt in S-C3: `:is(.input, .select)[aria-invalid="true"]:focus { box-shadow: 0 0 0 3px var(--loss-soft); }` ist ein Schein-Ring. Das verbieten barrierefreiheit Z1.3 (Felder im Fokus: Rand, `box-shadow: none`; Fehler: Rand --loss) und BRIEF (kein Schein). Endzustand: `:is(.input, .select)[aria-invalid="true"]:focus { border-color: var(--loss); box-shadow: none; }`. `.field-err` bekommt Token-Zeilenhöhe statt 1.35 (typografie: 1.26–1.49 werden ersetzt): `.field-err { font-size: var(--fs-12); line-height: var(--lh-12); color: var(--loss); }`.

## farbe-B3b · Weitere Hinweistexte von --faint auf --muted (Symbol wählen, Filter-Hinweis, Prop-Regel, Zustand-Spalten)

Gruppe farbe · Cluster komponenten · Aufwand S · Befunde: typografie-10, bereich_prop-34, farbe_kontrast-11, farbe_kontrast-10
Quelle: audit/spec/farbe.md Z. 244–248 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 876 `.sym-btn.sym-none .sym-v { color: var(--faint); … }` → `color: var(--muted);` („Symbol wählen“ ist die einzige Beschriftung)
- Z. 1382 `.fd-hint { … color: var(--faint); }` → `color: var(--muted);`
- Z. 2724 `.prop-rule .hint { font-size: 11.5px; color: var(--faint); }` → `color: var(--muted);`
- Z. 2966 `.stc-l small { … color: var(--faint); }` → `color: var(--muted);`

```

## farbe-B6 · Kartensymbol .card-ico ohne Fläche, --muted, 16 px

Gruppe farbe · Cluster komponenten · Aufwand S · Befunde: bereich_statistik-27, ki_look-39
Quelle: audit/spec/farbe.md Z. 258–262 · Dateien: web/css/app.css
Abhängig von: —

```text
**B6 – Kartensymbol, Z. 500–502** — bereich_statistik-27, ki_look-39
- Kommentar Z. 500 → `/* kleines Symbol vor dem Kartentitel (U.card mit icon), neutral, ohne Fläche */`
- Z. 501 → `.card-ico { flex: 0 0 auto; display: grid; place-items: center; color: var(--muted); }`
- Z. 502 `.card-ico svg { width: 15px; height: 15px; }` → `width: 16px; height: 16px;`

```

## farbe-B7 · Pillen: .pill.win auf --profit/--profit-soft, .pill.warn auf --warn-text

Gruppe farbe · Cluster komponenten · Aufwand S · Befunde: farbe_kontrast-20, komponenten-8, farbe_kontrast-26, bereich_trades_tag-20, bereich_konto-3, farbe_kontrast-6
Quelle: audit/spec/farbe.md Z. 263–266 · Dateien: web/css/app.css
Abhängig von: farbe-A1, farbe-A2

```text
**B7 – Pillen, Z. 546 und 549** — farbe_kontrast-20, komponenten-8, farbe_kontrast-26, bereich_trades_tag-20, bereich_konto-3, farbe_kontrast-6
- `.pill.win { background: var(--accent-soft); color: var(--accent); }` → `.pill.win { background: var(--profit-soft); color: var(--profit); }`
- `.pill.warn { background: var(--warn-soft); color: var(--warn); }` → `color: var(--warn-text);`

```

## farbe-B8 · Score-Skala: Verläufe von --accent auf --profit

Gruppe farbe · Cluster komponenten · Aufwand S · Befunde: farbe_kontrast-19
Quelle: audit/spec/farbe.md Z. 267–268 · Dateien: web/css/app.css
Abhängig von: —

```text
**B8 – Score-Skala, Z. 571–572:** in beiden `linear-gradient(…)` jeweils `var(--accent)` → `var(--profit)` — farbe_kontrast-19

```

## farbe-B9 · Regel-Chip .chip.rule Schrift --warn-text

Gruppe farbe · Cluster komponenten · Aufwand S · Befunde: farbe_kontrast-6
Quelle: audit/spec/farbe.md Z. 269–270 · Dateien: web/css/app.css
Abhängig von: farbe-A1, farbe-A2

```text
**B9 – Regel-Chip, Z. 627:** `.chip.rule { background: var(--warn-soft); color: var(--warn); }` → `color: var(--warn-text);` — farbe_kontrast-6

```

## farbe-B10 · Schlüssel-Wert-Zeilen: Selektor .kv > span:first-child

Gruppe farbe · Cluster komponenten · Aufwand S · Befunde: typografie-2, bereich_prop-9, bereich_statistik-2
Quelle: audit/spec/farbe.md Z. 271–272 · Dateien: web/css/app.css
Abhängig von: —

```text
**B10 – Schlüssel-Wert-Zeilen, Z. 653:** `.kv span { color: var(--muted); }` → `.kv > span:first-child { color: var(--muted); }` — typografie-2, bereich_prop-9, bereich_statistik-2

```

## farbe-B11 · Banner: Info-Symbol --text-2, .banner.accent wird .banner.ok mit --profit/--profit-soft

Gruppe farbe · Cluster komponenten · Aufwand S · Befunde: zustaende-7, bereich_dashboard-14, farbe_kontrast-8
Quelle: audit/spec/farbe.md Z. 273–277 · Dateien: web/css/app.css
Abhängig von: farbe-A1, farbe-A2

```text
**B11 – Banner, Z. 669–671** — zustaende-7, bereich_dashboard-14, farbe_kontrast-8
- `.banner.info svg { color: var(--accent); }` → `.banner.info svg { color: var(--text-2); }`
- `.banner.accent { border-color: var(--accent); background: var(--accent-soft); }` → `.banner.ok { border-color: color-mix(in srgb, var(--profit) 45%, var(--border)); background: var(--profit-soft); color: var(--text); }`
- `.banner.accent svg { color: var(--accent); }` → `.banner.ok svg { color: var(--profit); }`

```

## farbe-B16 · Schieberegler (Schlaf): Spur --text-2, Knopf --text ohne Glow, Wert linksbündig

Gruppe farbe · Cluster komponenten · Aufwand S · Befunde: bereich_trades_tag-45
Quelle: audit/spec/farbe.md Z. 298–303 · Dateien: web/css/app.css
Abhängig von: —

```text
**B16 – Schieberegler, Z. 811–815** — bereich_trades_tag-45
- Z. 811 in `background: linear-gradient(90deg, var(--accent) var(--p, 50%), var(--surface-3) var(--p, 50%))` → `linear-gradient(90deg, var(--text-2) var(--p, 50%), var(--surface-3) var(--p, 50%))`
- Z. 812 `… background: var(--accent); border: 4px solid var(--surface); box-shadow: 0 0 0 1.5px var(--accent), 0 0 14px -2px var(--accent-glow); …` → `background: var(--text); border: 4px solid var(--surface); box-shadow: 0 0 0 1.5px var(--border-2);`
- Z. 813 `… background: var(--accent); … box-shadow: 0 0 0 1.5px var(--accent); …` → `background: var(--text); box-shadow: 0 0 0 1.5px var(--border-2);`
- Z. 815 `.slider .sv { min-width: 58px; text-align: right; … }` → `text-align: left;` (Breite 58 px und `.ticks` Z. 816 bleiben)

```

## farbe-B18 · Helle Abdunklungen für Dialog, Handy-Menü und Seitenpanel

Gruppe farbe · Cluster komponenten · Aufwand S · Befunde: farbe_kontrast-33
Quelle: audit/spec/farbe.md Z. 309–313 · Dateien: web/css/app.css
Abhängig von: —

```text
**B18 – Abdunklungen im hellen Design** — farbe_kontrast-33
- nach Z. 824 neu: `:root[data-theme="light"] .modal-bg { background: rgba(13, 19, 15, .32); }`
- in der Media-Query nach Z. 921 neu: `:root[data-theme="light"] .scrim { background: rgba(13, 19, 15, .28); }`
- nach Z. 1597 neu: `:root[data-theme="light"] .panel-bg { background: rgba(13, 19, 15, .24); }`

```

## farbe-B19 · Filter-Popover: Sterne --warn-text, .fd-chip.setup löschen, .fd-add neutral

Gruppe farbe · Cluster komponenten · Aufwand S · Befunde: komponenten-31, farbe_kontrast-6
Quelle: audit/spec/farbe.md Z. 314–318 · Dateien: web/css/app.css
Abhängig von: farbe-A1, farbe-A2

```text
**B19 – Filter-Popover** — komponenten-31, farbe_kontrast-6
- Z. 1390 `.fd-tog.stars button { …; color: var(--warn); }` → `color: var(--warn-text);`; Z. 1391 `--lc: var(--warn)` → `--lc: var(--warn-text)`
- Z. 1401 `.fd-chip.setup { border-color: color-mix(in srgb, var(--accent) 45%, transparent); }` ersatzlos löschen
- Z. 1408 `.fd-add:hover, .fd-add.on { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }` → `{ border-color: var(--muted); color: var(--text); background: var(--surface-2); }`

```

## farbe-B21 · Unterstrich-Reiter (.prop-sub, .set-tabs) und Prop-Filter .prop-fsel.on neutral

Gruppe farbe · Cluster komponenten · Aufwand S · Befunde: bereich_prop-43
Quelle: audit/spec/farbe.md Z. 323–327 · Dateien: web/css/app.css
Abhängig von: —

```text
**B21 – Unterstrich-Reiter und Prop-Filter** — bereich_prop-43
- Z. 2597 `.prop-sub a::after { …; background: var(--accent); … }` → `background: var(--text);`
- Z. 1869 `.set-tabs button[aria-pressed="true"] { color: var(--accent); border-bottom-color: var(--accent); }` → `{ color: var(--text); border-bottom-color: var(--text); }`
- Z. 2611 `.select.prop-fsel.on { border-color: var(--accent); color: var(--accent); }` → `{ border-color: var(--border-2); color: var(--text); background-color: var(--surface-2); }`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .prop-sub a::after] komponenten-C20 setzt als einziger Schritt die gemeinsame Unterstrich-Fassung für .subtabs, .set-tabs und .prop-sub (Schrift und Linie --text, Gewicht 500, deckt farbe-B21 und zustaende-S-C9b ab). Abweichend von C20 gilt: (1) Die Linie ::after bekommt keine transition. Alle drei Leisten bauen beim Klick neu auf (content-tab, log-tab und recent-tab rufen rerender, .prop-sub navigiert; README Z. 357: die Leiste steht still), der Übergang würde also nie laufen (bewegung D3/K19). scaleX(0) und scaleX(1) bleiben. (2) Gewählt wird an Links über `.prop-sub a[aria-current="page"]` angezeigt, weil aria-pressed an <a> wegfällt (barrierefreiheit Z4 und C-prop-304-305). (3) Schrift var(--fs-14)/var(--lh-14) statt 13.5px (Typografie: Reiter 14). (4) Fokus `outline: 2px solid var(--focus); outline-offset: -2px` statt --accent (barrierefreiheit Z1; die Leiste hat overflow-x: auto). Die Antwort auf aufbau-16 (F2) muss nicht abgewartet werden. Bei Ja streicht aufbau die .prop-sub-Selektoren aus diesen Regeln.
- ÄNDERN: Nur Z. 2611 `.select.prop-fsel.on` umsetzen. Z. 2597 (.prop-sub a::after) und Z. 1869 (.set-tabs gewählt) übernimmt komponenten-C20.
- [doppelt: .set-tabs button[aria-pressed="true"]] Dreimal dieselbe Änderung (gewählt: Schrift --text, Linie --text). komponenten-C20 übernimmt sie mit `.set-tabs > button[aria-pressed="true"]`; die Linie kommt über ::after statt border-bottom. Die Anpassungen für farbe-B21 (nur noch .prop-fsel.on) und zustaende-S-C9b (zusammen_mit C20) stehen beim Anker .prop-sub a::after.

## farbe-B24 · Kennzahlen-Leiste .kstrip hell: Haarlinien an Kacheln, Schatten an der Leiste

Gruppe farbe · Cluster komponenten · Aufwand S · Befunde: farbe_kontrast-32
Quelle: audit/spec/farbe.md Z. 341–343 · Dateien: web/css/app.css
Abhängig von: —

```text
**B24 – Kennzahlen-Leiste hell, nach Z. 2603** — farbe_kontrast-32
`:root[data-theme="light"] .kstrip .tile { box-shadow: -1px 0 0 var(--border), 0 -1px 0 var(--border); }` und `:root[data-theme="light"] .grid.tiles.kstrip { box-shadow: 0 1px 2px rgba(0, 0, 0, .03), 0 6px 18px rgba(20, 30, 24, .06); }`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: :root[data-theme="light"] .kstrip .tile] farbe-B24 übernimmt und legt an der Stelle der gelöschten Z. 2603 an: `:root[data-theme="light"] .kstrip .tile { box-shadow: -1px 0 0 var(--border), 0 -1px 0 var(--border); }` und `:root[data-theme="light"] .grid.tiles.kstrip { box-shadow: 0 1px 2px rgba(0, 0, 0, .03), 0 6px 18px rgba(20, 30, 24, .06); }`. Ein `:hover`-Selektor ist nicht nötig. Die Spezifität 0,4,0 schlägt die helle Kachel-Regel Z. 1499 (0,3,0) und jede Hover-Regel, und Kacheln haben ohnehin keinen Hover mehr. Grund: Die Leiste ist selbst eine Karte (Fläche, Rand, Radius) und bekommt im hellen Design denselben weichen Schatten wie .card. Innen gibt es nur Haarlinien (Ziel von farbe HELL und komponenten).
- ÜBERNIMMT komponenten-C25c: Die Regel aus Z. 407 legt farbe-B24 an, ohne den Selektor `:root[data-theme="light"] .kstrip .tile:hover`. Die Hinweise aus Z. 408–409 gelten weiter: --lift-shadow bleibt, und .stat-tile übernimmt die .tile-Werte aus Typografie und Abstände.

## farbe-B25 · Gemeinsamen flachen Auswahlstil um .dh-context .btn.is-set erweitern

Gruppe farbe · Cluster komponenten · Aufwand S · Befunde: referenz-7
Quelle: audit/spec/farbe.md Z. 344–345 · Dateien: web/css/app.css
Abhängig von: —

```text
**B25 – Gemeinsamer Auswahlstil, Z. 3125–3128:** die Selektorliste (endet mit `.sb-user.active {`) um `.dh-context .btn.is-set` ergänzen — referenz-7

```

## farbe-B26 · Neue Regel .tbl .rule-ic für Regeln-Symbol in Tabellen

Gruppe farbe · Cluster komponenten · Aufwand S · Befunde: bereich_trades_tag-19
Quelle: audit/spec/farbe.md Z. 346–347 · Dateien: web/css/app.css
Abhängig von: —

```text
**B26 – Regeln-Symbol in Tabellen, neu (z. B. nach Z. 615):** `.tbl .rule-ic { display: inline-flex; vertical-align: middle; } .tbl .rule-ic svg { width: 14px; height: 14px; }` — bereich_trades_tag-19

```

## farbe-B27a · ui.js: Ring und scoreColor auf --profit, neue Funktion scoreText exportieren

Gruppe farbe · Cluster komponenten · Aufwand S · Befunde: farbe_kontrast-19, bereich_trades_tag-19, farbe_kontrast-6
Quelle: audit/spec/farbe.md Z. 348–350 · Dateien: web/js/ui.js
Abhängig von: farbe-A1, farbe-A2

```text
**B27 – `web/js/ui.js`** — farbe_kontrast-19, bereich_trades_tag-19, farbe_kontrast-6, bereich_statistik-25
- Z. 184 in `ring`: `… : 'var(--accent)'` → `'var(--profit)'`
- Z. 185 `const scoreColor = s => s < 50 ? 'var(--loss)' : s < 75 ? 'var(--warn)' : 'var(--accent)';` → `… : 'var(--profit)';` und darunter neu `const scoreText = s => s < 50 ? 'var(--loss)' : s < 75 ? 'var(--warn-text)' : 'var(--text)';` (in `root.UI`, Z. 464, mit exportieren)
```

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: root.UI] Alle Schritte ergänzen verschiedene Namen im selben Export-Objekt, ohne Überschneidung. Endstand ergänzt: toastWrap, announce, lightbox, requestClose, vbarPath, hbarPath, xLabels, fitRadars, scoreText, count, chartEmpty, chartEmptyHTML, fieldErrors, clearFieldError, clearFieldErrors. barrierefreiheit-U7 exportiert toastWrap, darum muss die Funktion vorher aus zustaende-S-U6 da sein (sonst ReferenceError beim Laden von ui.js). Jeder Export kommt erst mit seiner Funktion.

## farbe-D3e · README Z. 203–208: Absatz „Grün nur für Gewinn und „Trade loggen““ ersetzen

Gruppe farbe · Cluster komponenten · Aufwand S · Befunde: referenz-6, bereich_dashboard-1, komponenten-8, farbe_kontrast-8, farbe_kontrast-24, bereich_prop-40, farbe_kontrast-11
Quelle: audit/spec/farbe.md Z. 570–570 · Dateien: web/README.md
Abhängig von: farbe-B2, farbe-B25

```text
- Z. 203–208 ersetzen durch den Absatz: „**Grün nur für Gewinn und „Trade loggen“:** Grün (`--profit`, `--accent`) steht für Gewinn und Positives (Beträge, Pille „Gewinn“, Gewinntage, Kurven, „Ziel erreicht“, bestandene Konten, Regeltreue im Regel-Tracker, Score ab 75 in Ring und Skala), für „Trade loggen“ (`.btn.accent`, der einzige Knopf mit Licht), für Schalter, den kleinen Balken am aktiven Eintrag, die Hinweis-Punkte und den Fokusring. Bestätigende Knöpfe in Formularen und Dialogen (`.btn.primary`: Speichern, Anwenden, Senden) sind neutral: angehobene Fläche, feiner Rand, Gewicht 600. Was öffnet, anlegt, hinzufügt oder navigiert, ist ein normaler Knopf. Ausgewählte Reiter, Segmente, Chips, Karten, Menüeinträge und der aktive Filter-Knopf sind flach und ruhig: eine leicht angehobene Fläche mit feinem Rand, ohne Licht, Verlauf oder Schein (ein gemeinsamer Stil am Ende von `css/app.css`). `--lc` setzt eine bewusste Farbe nur dort, wo sie etwas bedeutet (Gewinn/Verlust, Long/Short, Bewertung, Fehler-/Emotions-Chips): Schrift in der Farbe, Fläche leicht getönt, Rand leise gefärbt. Neutral sind außerdem Setup-Chips und die Kategorie Setups, Avatare, die gewählte Notiz, Häkchen und Optionsfelder, „Heute“ (im Kalender ein Kreis in Schriftfarbe, in Datumswählern ein feiner Ring), Status-Pillen (Heute, Aktiv, geprüft, Neu), Links wie „Mehr anzeigen“, die Aktivitäts-Heatmap im Fortschritt, der Zähler im Filter-Knopf und die News-Karte. Info-Blau (`--info`) nur für den Status „offen“ und die Kalender-Ansichten Trefferquote/Trades; Info-Banner tragen ein neutrales Symbol. Lesbarer Text steht mindestens in `--muted` (≥ 4,5:1), `--faint` nur für Striche, Linien und leere Symbole. Gelber Text nutzt `--warn-text`.“ — referenz-6, bereich_dashboard-1, komponenten-8, farbe_kontrast-8, farbe_kontrast-24, bereich_prop-40, farbe_kontrast-11
```

## typografie-3.2.2b · Eyebrow-Sammelregel (11/600/.06em, 'case', --muted) und Typo-Angaben aus den Einzelregeln entfernen

Gruppe typografie · Cluster komponenten · Aufwand M · Befunde: typografie-17, bereich_shell-22, bereich_notebook_news-15
Quelle: audit/spec/typografie.md Z. 220–221 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
| Z. 101, `.caption` → **Eyebrow-Sammelregel** | `.caption { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; }` → `.caption, .nav-title, .popover .sec, .cp-sec, .sym-cap, .nb .sec-h, .nb-menu .head, .sp-group { font-size: var(--fs-11); line-height: var(--lh-11); font-weight: 600; letter-spacing: .06em; text-transform: uppercase; font-feature-settings: 'case'; color: var(--muted); }` | typografie-17, bereich_shell-22, bereich_notebook_news-15 |
| Einzelregeln der Eyebrows | aus `.nav-title` (Z. 167), `.popover .sec` (341), `.cp-sec` (456), `.sym-cap` (880), `.nb .sec-h` (975), `.nb-menu .head` (1117), `.sp-group` (1605) jeweils `font-size`, `font-weight`, `letter-spacing`, `text-transform` und `color` **entfernen**. Innenabstand, Rand, `display`, `cursor` usw. bleiben. `html.sb-mini .nav-title` (168) bleibt. | typografie-17, bereich_shell-22 |
```

## typografie-3.2.2c · Neue Klasse .val-label (13/500, --text-2) für Wert-Beschriftungen

Gruppe typografie · Cluster komponenten · Aufwand S · Befunde: referenz-43, bereich_dashboard-44
Quelle: audit/spec/typografie.md Z. 222–222 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
| nach Z. 101 neu: Wert-Beschriftung | `.val-label { font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 500; color: var(--text-2); }` | referenz-43, bereich_dashboard-44 |
```

## typografie-3.2.4b · Knöpfe: .btn.primary 700, .btn.accent 500 (aktiver Filter nicht fetter), neu .btn.accent.tl 700 (K8)

Gruppe typografie · Cluster komponenten · Aufwand S · Befunde: typografie-1, typografie-19
Quelle: audit/spec/typografie.md Z. 331–333 · Dateien: web/css/app.css
Abhängig von: typografie-3.1

```text
| `.btn.primary` (274) | 600 → 700 | typografie-1 |
| `.btn.accent` (3137) | `font-weight: 600` → `font-weight: 500` | typografie-1, typografie-19 (K8) |
| neu nach Z. 3144 | `.btn.accent.tl { font-weight: 700; }` („Trade loggen“, app.js:253) | typografie-1 |
```

## typografie-3.2.4d · Steuerelemente 600 → 500 (Reiter, Filter-Bausteine, Datumsknöpfe, Toast, .more-link) und .datepick .dp in Onest

Gruppe typografie · Cluster komponenten · Aufwand S · Befunde: typografie-19, bereich_konto-33, bereich_notebook_news-15
Quelle: audit/spec/typografie.md Z. 336–337 · Dateien: web/css/app.css
Abhängig von: —

```text
| `.prop-tabs a` (2590), `.prop-sub a` (2595), `.set-tabs button` (1867), `.fd-seg button` (1386), `.fd-tog button` (1388), `.fd-chip` (1400), `.fd-add` (1407), `.dp-month` (429), `.dp-link` (434), `.nb .datebtn` (1015), `.datepick .dp` (1023), `.add-slot` (1586), `.toast` (898), `.more-link` (1659) | 600 → 500 | typografie-19, bereich_konto-33, bereich_notebook_news-15 |
| `.datepick .dp` (1023) | zusätzlich `font-family: var(--font-num);` (wie `.dp-day`, Z. 420) | bereich_notebook_news-15 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .fd-chip] .fd-chip ist ein Chip, keine Segment-Taste. Ergebnis: height: 28px; border-radius: 999px; font-size: var(--fs-12); line-height: var(--lh-12); font-weight: 500 (Padding, Rand und Farben wie bisher). Grund: Die Rollentabelle von typografie (Chip = --fs-12) und komponenten (Chips 12px/500) stimmen überein; 13 gilt für Segmente und Menüeinträge. So gleicht der Filter-Chip .chip und .nb .tagpill. Das Gewicht 500 setzen aufbau-A4f, komponenten-C16 und typografie-3.2.4d; komponenten-C16 übernimmt.
- ÄNDERN: .fd-chip (Z. 1400) und .fd-add (Z. 1407) aus der Liste 600 → 500 streichen, das übernimmt komponenten-C16.
- [konflikt: .fd-add] Gleiche Entscheidung wie bei .fd-chip, weil der Hinzufügen-Chip neben den Chips steht und gleich hoch sein muss: height: 28px; border-radius: 999px; font-size: var(--fs-12); line-height: var(--lh-12); font-weight: 500. komponenten-C16 übernimmt. aufbau-A4f, typografie-3.2.3h und typografie-3.2.4d lassen .fd-add aus (Anpassungen wie bei .fd-chip).
- ÄNDERN: .fd-add (Z. 1407) aus der Liste 600 → 500 streichen.
- [konflikt: .set-tabs button] Die gemeinsame Unterstrich-Fassung aus komponenten-C20 ersetzt .set-tabs und .prop-sub. Schrift in der Text-Skala: font-size: var(--fs-14); line-height: var(--lh-14); font-weight: 500. 13.5px ist in der Skala verboten, und Reiter haben laut typografie 14. Gewicht 500 und Unterstrich in --text verlangen auch zustaende-S-C9b und typografie-3.2.4d, C20 übernimmt das. Die Fokus-Zeile in C20 setzt nur den Versatz, ohne eigene Farbe (--accent als Fokusfarbe ist laut barrierefreiheit verboten; Farbe und Stärke kommen aus der globalen :focus-visible-Regel). Den Selektor für .prop-sub a (aria-pressed oder aria-current) regelt der Anker .prop-sub a.
- ÄNDERN: .set-tabs button (Z. 1867) und .prop-sub a (Z. 2595) aus der Liste streichen, das übernimmt komponenten-C20.
- [konflikt: .more-link] CSS (aufbau-B12 übernimmt): .more-link { color: var(--text-2); font-weight: 500; font-size: var(--fs-13); line-height: var(--lh-13); text-decoration: none; } .more-link:hover { color: var(--text); }. Ohne Unterstrich beim Hover, wie in der aufbau-Regel („kein Grün, kein Unterstrich“): ruhiger, und gleich wie die übrigen Kopf-Bedienelemente. .more-row wird gelöscht. Touch-Höhe 44 px aus barrierefreiheit-B12e danach, unverändert. Letzte Trades (widgets.js:253/257): Der Link steht im Kartenkopf (aufbau-C2a, U.card trailing), nicht in einer Fußzeile, und heißt „Zum TradeLog“. Das ist laut wording W5 der feste Name für „Navigation aus Widget“ und sagt das Ziel; „Alle Trades“ und „Mehr anzeigen“ fallen weg, denn „Mehr anzeigen“ heißt laut aufbau nur Nachladen. Der Link erscheint nur mit Zeilen (wording W13, zustaende): { info: e.info, cls: 'recent-card', trailing: rows.length ? more('#/trades', 'Zum TradeLog') : '' }. Info-Satz: „Die zuletzt geschlossenen Trades des Kontos und alle noch offenen Positionen. So viele Zeilen, wie in die Karte passen; „Zum TradeLog“ öffnet die ganze Liste.“ Regel-Tracker: trailing ersatzlos streichen (aufbau-C2a = wording 6.15, aufbau übernimmt). Der Leertext-Link geht auf #/settings/regeln.
- ÄNDERN: .more-link (Z. 1659) aus der Liste 600 → 500 streichen, das übernimmt aufbau-B12.
- [konflikt: .prop-tabs a] Die Schiene aus komponenten-C19 ist die einzige Regel für `.tabs > button, .tabs > a, .prop-tabs a`, mit Skalenwerten statt 13.5/12.5 px: `display: inline-flex; align-items: center; height: 34px; padding: 0 12px; border: 1px solid transparent; border-radius: 9px; background: none; color: var(--text-2); font-size: var(--fs-14); line-height: var(--lh-14); font-weight: 500; …` (Rest wie C19). Fokus: `.tabs > button:focus-visible, .tabs > a:focus-visible, .prop-tabs a:focus-visible { outline-offset: -2px; }`, nur der Versatz. Farbe und Stärke kommen aus der globalen :focus-visible-Regel, nach barrierefreiheit-A1 var(--focus), nie --accent. Handy ≤560: `.prop-tabs a { flex: 1 1 auto; justify-content: center; padding: 0 4px; font-size: var(--fs-13); line-height: var(--lh-13); }`. Handy Z. 3054: `.tabs > button, .tabs > a { padding: 0 12px; font-size: var(--fs-13); line-height: var(--lh-13); }`. Gewählt über die gemeinsame Regel am Dateiende mit `.prop-tabs a[aria-current="page"]` (barrierefreiheit-B9b). Erst danach streichen prop.js 304/305 und affiliate.js 51 das aria-pressed (inkl. der Testanpassungen barrierefreiheit.md Z. 905–907). Grund: Reiter = 14/500 laut Typografie-Rollen, 12.5/13.5 sind verboten, Grün nie für Fokus (BRIEF, barrierefreiheit Z1).
- ÄNDERN: `.prop-tabs a` (Z. 2590) nicht anfassen. 500 steht in der Schienen-Regel von komponenten-C19.
- [konflikt: .prop-sub a] komponenten-C20 trägt die Unterstrich-Reiter `.subtabs > button, .set-tabs > button, .prop-sub a` mit `font-size: var(--fs-14); line-height: var(--lh-14); font-weight: 500; color: var(--muted)`. Hover und gewählt in --text, Linie `::after` mit `background: var(--text)`. Gewählt bei Knöpfen `[aria-pressed="true"]`, bei den Prop-Links `.prop-sub a[aria-current="page"]` (für Farbe und `::after { transform: scaleX(1) }`), weil Links kein aria-pressed tragen (barrierefreiheit Z4). Fokus `outline-offset: -2px`, nur der Versatz. Die Farbe kommt global, nicht --accent. -2px statt 2px, weil die Leiste mit overflow-x: auto den äußeren Ring oben abschneiden würde (barrierefreiheit Z1). .set-tabs bleibt damit 14 px und wird nur 600 → 500. Grund: Typografie-Rolle Reiter 14/500, keine 13.5 px. Unterstrich in --text statt Grün (BRIEF).
- ÄNDERN: `.prop-sub a` (Z. 2595) und `.set-tabs button` (Z. 1867) nicht einzeln anfassen. komponenten-C20 setzt 500.
- [doppelt: .fd-seg button] Ergebnis `.fd-seg button { …; font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 500; … }`. Das Gewicht 600 → 500 setzt typografie-3.2.4d als Gewichts-Sweep für alle Filter-Bausteine (.fd-seg button, .fd-tog button, .fd-chip, .fd-add), die Größe typografie-3.2.3h. Von komponenten-C14b bleiben `.fd-seg { gap: 2px; background: var(--surface-2); }` und die Löschungen.
- [doppelt: .fd-tog button] Wie bei .fd-seg button: 500 über typografie-3.2.4d, Größe var(--fs-13)/var(--lh-13) über typografie-3.2.3h. aufbau-A4f ändert das Gewicht nicht noch einmal.

## typografie-3.2.4f · Listen-Titel explizit auf 600 (statt geerbtem Bold)

Gruppe typografie · Cluster komponenten · Aufwand S · Befunde: typografie-20, bereich_notebook_news-15
Quelle: audit/spec/typografie.md Z. 341–341 · Dateien: web/css/app.css
Abhängig von: —

```text
| Listen-Titel: `.nb .note-item b` (1001), `.fw-acc-n b` (1478), `.fw-rp-t b` (1490), `.sp-item b` (1611), `.rp-list .rp-li-main b` (2328), `.pfm-top b` (2640), `.prop-title b` (2692), `.prop-group-title b` (2715) | `font-weight: 600;` ergänzen (heute erbt `<b>` Bold 700) | typografie-20, bereich_notebook_news-15 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .prop-group-title b] `.prop-group-title b { font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 600; color: var(--text-2); }`: aufbau-A4e mit Typografie-Token, `font-family: var(--font-display)` entfällt. Grund: Der Gruppentitel steht unter „Aktive Konten“ (.prop-h 15/600) und über Karten, deren Titel ebenfalls 15/600 sind (.prop-title b). Eine Unterüberschrift darf nicht gleich groß sein wie die übergeordnete (aufbau Grundsatz 4 und K21; die aufbau-Prüfung Z. 751 erwartet 13px/600). 13/600 ist eine Stufe der Text-Skala, das Gewicht 600 deckt auch typografie-3.2.4f ab.
- ÄNDERN: .prop-group-title b (2715) aus der Liste der Listen-Titel streichen, weil aufbau-A4e das Gewicht 600 setzt. Die übrigen sieben Selektoren bleiben.

## typografie-3.2.4i · Zeilenkennung in Tabellen 700 → 600 (.tbl .sym inkl. Coach-Schülernamen, .aff-name)

Gruppe typografie · Cluster komponenten · Aufwand S · Befunde: typografie-20, bereich_konto-33
Quelle: audit/spec/typografie.md Z. 344–345 · Dateien: web/css/app.css
Abhängig von: —

```text
| `.tbl .sym` (602) | 700 → 600 (gilt auch für die Schülernamen in `.coach-tbl`) | typografie-20, bereich_konto-33 |
| `.aff-name` (2677) | 700 → 600 | bereich_konto-33 |
```

## typografie-3.2.4l · Kachel-Titel .stat-tile .k/.stat .k auf 500, Zähler .cntb 700 → 600

Gruppe typografie · Cluster komponenten · Aufwand S · Befunde: typografie-3
Quelle: audit/spec/typografie.md Z. 348–349 · Dateien: web/css/app.css
Abhängig von: —

```text
| `.stat-tile .k` (637), `.stat .k` (647) | `font-weight: 500;` ergänzen (Rolle Kachel-Titel) | typografie-3 |
| Zähler `.btn .cntb` (1341), `.fd-panel .cntb` (1421) | 700 → 600 | typografie-3 (Rolle Zähler) |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .stat-tile .k] Ergebnis: .stat-tile .k { display: flex; align-items: center; gap: 6px; font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 500; color: var(--text-2); }. Die 13.5 px aus komponenten-C25a gelten nicht: Der Wert ist in der Skala verboten, und .tile .head wird ebenfalls 13 (typografie-3.2.3i, aufbau-A3b). Das Ziel von C25a, „gleiche Maße wie .tile“, bleibt damit erfüllt. Gewicht 500 setzen drei Schritte; komponenten-C25a übernimmt die ganze Zeile 637.
- ÄNDERN: .stat-tile .k (Z. 637) streichen, das übernimmt komponenten-C25a. .stat .k und .cntb bleiben.
- [doppelt: .stat .k] Ergebnis: .stat .k { display: flex; align-items: center; gap: 6px; font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 500; color: var(--text-2); }. Das Gewicht 500 setzt typografie-3.2.4l, das Token typografie-3.2.3l. Die gleiche Zeile in aufbau-A3b entfällt.
- [doppelt: .btn .cntb] Das Gewicht 700 → 600 steht zweimal da (3.2.4l und S-C7). S-C7 übernimmt es zusammen mit der neutralen Farbe, 3.2.3d stellt die Größe auf das Token um. Endstand: `.btn .cntb { display: inline-grid; place-items: center; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 999px; background: color-mix(in srgb, var(--text) 16%, transparent); color: var(--text); font-size: var(--fs-11); line-height: var(--lh-11); font-weight: 600; }`. Ein Zähler ist ein Etikett, daher 600, ohne Grün. Prüfung zustaende 8 (kein `var(--bg)` in `.btn .cntb`) ist damit erfüllt.
- ÄNDERN: Nur `.stat-tile .k`/`.stat .k` → 500 umsetzen; den Teil „Zähler .cntb 700 → 600“ übernimmt zustaende-S-C7.
- [doppelt: .fd-panel .cntb] Wie bei .btn .cntb: S-C7 setzt Fläche `color-mix(in srgb, var(--text) 16%, transparent)`, Schrift `var(--text)` und Gewicht 600, 3.2.3d stellt `font-size: var(--fs-11); line-height: var(--lh-11)` um. 3.2.4l ändert die Zeile nicht separat.
- ÄNDERN: Z. 1421 nicht anfassen; Gewicht 600 setzt zustaende-S-C7.

## typografie-3.4a · fmt.cur: immer zwei Nachkommastellen (Sonderfall ≥ 10.000 entfällt)

Gruppe typografie · Cluster komponenten · Aufwand S · Befunde: typografie-14
Quelle: audit/spec/typografie.md Z. 383–387 · Dateien: web/js/ui.js
Abhängig von: —

```text
### 3.4 `web/js/ui.js`

| Stelle | vorher → nachher | Befund |
|---|---|---|
| Z. 122 `fmt.cur` | `const d = o.compact ? 0 : (a >= 10000 ? 0 : 2);` → `const d = o.compact ? 0 : 2;` | typografie-14 |
```

## typografie-3.4b · fmt.factor: immer zwei Stellen (∞ bleibt)

Gruppe typografie · Cluster komponenten · Aufwand S · Befunde: bereich_statistik-42
Quelle: audit/spec/typografie.md Z. 388–388 · Dateien: web/js/ui.js
Abhängig von: —

```text
| Z. 143 `fmt.factor` | `factor(v) { return v == null ? '∞' : fmt.num(v, 2); },` → `factor(v) { return v == null ? '∞' : new Intl.NumberFormat(LOC(), { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v); },` | bereich_statistik-42 |
```

## typografie-3.4c · Neuer Helfer fmt.dateRow (laufendes Jahr ohne Jahr)

Gruppe typografie · Cluster komponenten · Aufwand S · Befunde: referenz-28
Quelle: audit/spec/typografie.md Z. 389–389 · Dateien: web/js/ui.js
Abhängig von: —

```text
| nach Z. 147 (`dateDM`) neu | `dateRow(d) { if (!d) return '—'; const x = new Date(d); return x.getFullYear() === new Date().getFullYear() ? fmt.dateDM(x) : fmt.dateShort(x); }, /* Trade-Listen: im laufenden Jahr ohne Jahr */` | referenz-28 |
```
