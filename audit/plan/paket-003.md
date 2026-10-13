# Paket 003 · komponenten, tokens

Schritte: 36 · Dateien: web/README.md, web/app.html, web/css/app.css, web/e2e/motiontest.js, web/index.html, web/js/sample.js, web/js/ui.js
Betroffene Tests laut Spezifikation: Akzeptanz 4.1 Nr. 5 („Trade loggen“ fett, „Filter“ mit aktivem Filter nicht fetter); Akzeptanz 4.2 Nr. 6 (letter-spacing 0.66px an .nav-title, .popover .sec, .nb .sec-h, .sp-group, .caption; kein 0.99px); Akzeptanz 4.3 dashboard (Kachelwerte 24); Akzeptanz 4.3 notebook (Listentitel 14/600), prop („Copy NQ“ und „Aktive Konten“ gleich schwer); Akzeptanz 4.3 prop (Reiter 14/500); Akzeptanz 4.4: grep "a >= 10000" ohne Treffer; node --test web/tests/*.mjs; prüfen: e2e/settest2.js:22–26 („Klassisch“ lädt Inter/Roboto über Theme.loadFont); web/e2e/affiliatetest.js; web/e2e/coachtest.js; web/e2e/dptest.js:24 (.dp-day.today bleibt genau einmal); web/e2e/filtertest.js; web/e2e/headtest.js:61 (.set-nav 500, nicht betroffen); web/e2e/langtest.js:58; web/e2e/motiontest.js:8; web/e2e/motiontest.js:8 (Schritt bewegung-3.11c); web/e2e/proptest.js:55 (UI.fmt.cur, passt sich an); web/e2e/scorestatetest.js:20 (Symbol > 10 px, bleibt grün); web/e2e/switchtest.js:9
Baut auf Paketen auf: 1

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

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

## farbe-B4 · Gewählter Menüeintrag .popover .item[aria-checked] mit flachem Auswahlstil (inset-Rand)

Gruppe farbe · Cluster komponenten · Aufwand S · Befunde: bereich_notebook_news-16, barrierefreiheit-7
Quelle: audit/spec/farbe.md Z. 249–251 · Dateien: web/css/app.css
Abhängig von: —

```text
**B4 – Menüeinträge, Z. 337** — bereich_notebook_news-16, barrierefreiheit-7
`.popover .item[aria-checked="true"] { color: var(--accent); }` → `.popover .item[aria-checked="true"] { color: var(--text); background: color-mix(in srgb, var(--text) 10%, var(--surface)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--text) 22%, var(--border-2)); }`

```

## farbe-B5 · „Heute“ in Zeitraum-Kalender und Datumswählern neutral (--text, Ring --muted)

Gruppe farbe · Cluster komponenten · Aufwand S · Befunde: referenz-8, farbe_kontrast-24, bereich_notebook_news-16
Quelle: audit/spec/farbe.md Z. 252–257 · Dateien: web/css/app.css
Abhängig von: —

```text
**B5 – „Heute“ in Wählern** — referenz-8, farbe_kontrast-24, bereich_notebook_news-16
- Z. 363 `.rr-day.today { color: var(--accent); font-weight: 700; }` → `.rr-day.today { color: var(--text); font-weight: 700; }` (kein Ring)
- Z. 424 `.dp-day.today { color: var(--accent); font-weight: 700; box-shadow: inset 0 0 0 1px var(--accent-glow); }` → `.dp-day.today { color: var(--text); font-weight: 700; box-shadow: inset 0 0 0 1px var(--muted); }`
- Z. 431 `.dp-month.today { color: var(--accent); box-shadow: inset 0 0 0 1px var(--accent-glow); }` → `.dp-month.today { color: var(--text); box-shadow: inset 0 0 0 1px var(--muted); }`
- Z. 1026 `.datepick .dp.today { box-shadow: inset 0 0 0 1px var(--accent); }` → `box-shadow: inset 0 0 0 1px var(--muted);`

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

## farbe-B24 · Kennzahlen-Leiste .kstrip hell: Haarlinien an Kacheln, Schatten an der Leiste

Gruppe farbe · Cluster komponenten · Aufwand S · Befunde: farbe_kontrast-32
Quelle: audit/spec/farbe.md Z. 341–343 · Dateien: web/css/app.css
Abhängig von: —

```text
**B24 – Kennzahlen-Leiste hell, nach Z. 2603** — farbe_kontrast-32
`:root[data-theme="light"] .kstrip .tile { box-shadow: -1px 0 0 var(--border), 0 -1px 0 var(--border); }` und `:root[data-theme="light"] .grid.tiles.kstrip { box-shadow: 0 1px 2px rgba(0, 0, 0, .03), 0 6px 18px rgba(20, 30, 24, .06); }`

```

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

## typografie-3.2.4f · Listen-Titel explizit auf 600 (statt geerbtem Bold)

Gruppe typografie · Cluster komponenten · Aufwand S · Befunde: typografie-20, bereich_notebook_news-15
Quelle: audit/spec/typografie.md Z. 341–341 · Dateien: web/css/app.css
Abhängig von: —

```text
| Listen-Titel: `.nb .note-item b` (1001), `.fw-acc-n b` (1478), `.fw-rp-t b` (1490), `.sp-item b` (1611), `.rp-list .rp-li-main b` (2328), `.pfm-top b` (2640), `.prop-title b` (2692), `.prop-group-title b` (2715) | `font-weight: 600;` ergänzen (heute erbt `<b>` Bold 700) | typografie-20, bereich_notebook_news-15 |
```

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

## typografie-3.2.5a · Kachelwert .tile .val auf --fv-24/--ls-val/--lh-val ohne --font-display

Gruppe typografie · Cluster komponenten · Aufwand S · Befunde: typografie-3
Quelle: audit/spec/typografie.md Z. 353–357 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
#### 3.2.5 Komponenten

| Selektor (Z.) | vorher → nachher | Befund |
|---|---|---|
| `.tile .val` (540) | `font-family: var(--font-display); font-size: 25px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.1;` → `font-size: var(--fv-24); font-weight: 700; letter-spacing: var(--ls-val); line-height: var(--lh-val);` | typografie-3 |
```

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
