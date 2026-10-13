# Paket 025 · training

Schritte: 37 · Dateien: web/README.md, web/css/app.css, web/e2e/rptest.js, web/e2e/shadowtest.js, web/js/screens/mentor.js, web/js/screens/progress.js, web/js/screens/ruhepunkt.js, web/js/screens/shadow.js
Betroffene Tests laut Spezifikation: Akzeptanz 4.3 progress; Akzeptanz 4.3 ruhepunkt (document.querySelectorAll('h1').length === 1); Akzeptanz 4.3 ruhepunkt („Wo stehst du gerade?“ und Session-Titel 21/600); Akzeptanz 4.4: grep "h('h1'" in ruhepunkt.js ohne Treffer; e2e/coachtest.js:84, :96 (Coach-.mentor-note bleibt); e2e/mentortest.js; e2e/rptest.js:17; e2e/rptest.js:46; e2e/rptest.js:46 (siehe E1e); e2e/shadowtest.js:38, :41, :43 (prüfen „1 – 10 von … Verstößen“ bzw. „11 – “/„1 – “ mit Leerzeichen; nicht in E1 genannt, mitändern); web/e2e/fwtest.js:23–24 (Widget = Seite über costView); web/e2e/mentortest.js:44–45; web/e2e/rptest.js; web/e2e/rptest.js (.rp-nav .rp-primary bleibt); web/e2e/rptest.js:11; web/e2e/rptest.js:51 (.rp-timer .rp-btn), :18–63 (.rp-nav .rp-primary bleibt); web/e2e/shadowtest.js; web/e2e/shadowtest.js:68, 69, 71, 74; web/e2e/shadowtest.js:68, 74 (Schritt R3); web/e2e/shadowtest.js:69, 71 (Schritt R3); web/e2e/streaktest.js; web/tests/inline-style.test.mjs (Zählung, Schritt R5)
Baut auf Paketen auf: 1, 2, 5

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## farbe-B23a · Aktivitäts-Heatmap (Fortschritt) neutral in fünf Stufen, Heute-Ring --text-2

Gruppe farbe · Cluster training · Aufwand S · Befunde: bereich_training-8, farbe_kontrast-24, referenz-8
Quelle: audit/spec/farbe.md Z. 332–335 · Dateien: web/css/app.css
Abhängig von: —

```text
**B23 – Heatmaps, Tracker, Jahresraster** — bereich_training-8, bereich_dashboard-38, farbe_kontrast-24, referenz-8
- Z. 1287–1291 ersetzen (nur noch Aktivität und ihre Legende):
  `.activity i.l1, .heat-legend:not(.right) i.l1 { background: color-mix(in srgb, var(--text) 8%, var(--surface-2)); border-color: transparent; }`, ebenso `l2` 16 %, `l3` 28 %, `l4` 42 %, `l5` 58 %
- Z. 1292 `.activity i.today { box-shadow: 0 0 0 2px var(--accent); }` → `var(--text-2)`
```

## farbe-C2 · Fortschritt: Listenmarker „Aktuelle Regeln“ neutral (entfällt, falls Aufbau die Karte löscht)

Gruppe farbe · Cluster training · Aufwand S · Befunde: farbe_kontrast-22
Quelle: audit/spec/farbe.md Z. 381–383 · Dateien: web/css/app.css
Abhängig von: —

```text
**C2 – `web/css/app.css` Fortschritt, Z. 1274** (entfällt, wenn die Aufbau-Gruppe die Karte „Aktuelle Regeln“ löscht) — farbe_kontrast-22
`.rules-list li::marker { color: var(--accent); font-weight: 700; }` → `.rules-list li::marker { color: var(--muted); font-weight: 500; font-family: var(--font-num); }`

```

## farbe-C5 · Ruhepunkt: --rp-dawn = --info, Hauptknopf .rp-primary neutral wie .btn.primary

Gruppe farbe · Cluster training · Aufwand S · Befunde: farbe_kontrast-8, bereich_training-44
Quelle: audit/spec/farbe.md Z. 398–403 · Dateien: web/css/app.css
Abhängig von: —

```text
**C5 – `web/css/app.css` Ruhepunkt** — farbe_kontrast-8, bereich_training-44
- Z. 2141 in `.rp { … }`: `--rp-dawn: #5cb8ff;` → `--rp-dawn: var(--info);`
- Z. 2142: aus `html[data-theme="light"] .rp, :root[data-theme="light"] .rp { --rp-dawn: #2a6fb8; --rp-brick: #c73a3a; --rp-on-phase: #ffffff; }` den Eintrag `--rp-dawn: #2a6fb8;` streichen
- Z. 2217 `.rp-btn.rp-primary { background: var(--phase); border-color: var(--phase); color: var(--rp-on-phase); }` → `.rp-btn.rp-primary { background: var(--surface-3); border-color: var(--border-2); color: var(--text); }`
- Z. 2218 `.rp-btn.rp-primary:hover { filter: brightness(1.08); }` → `.rp-btn.rp-primary:hover { background: color-mix(in srgb, var(--text) 8%, var(--surface-3)); border-color: color-mix(in srgb, var(--text) 18%, var(--border-2)); }`

```

## farbe-C6 · Mentor: Einrichtungs-Symbol, eigene Nachricht und Tipp-Punkte neutral

Gruppe farbe · Cluster training · Aufwand S · Befunde: bereich_konto-6, bereich_training-36
Quelle: audit/spec/farbe.md Z. 404–408 · Dateien: web/css/app.css
Abhängig von: —

```text
**C6 – `web/css/app.css` Mentor** — bereich_konto-6, bereich_training-36
- Z. 2341 `.mentor-setup .ico svg { …; color: var(--accent); }` → `color: var(--text-2);`
- Z. 2350 `.msg.user { align-self: flex-end; background: var(--accent-soft); border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent); border-bottom-right-radius: 4px; }` → `.msg.user { align-self: flex-end; background: var(--surface-3); border: 1px solid var(--border-2); border-bottom-right-radius: 4px; }`
- Z. 2356 `.msg.typing i { …; background: var(--accent); … }` → `background: var(--muted);`

```

## farbe-C7 · Schatten-Ich: eingeschaltete Regel neutral angehoben statt grün getönt

Gruppe farbe · Cluster training · Aufwand S · Befunde: bereich_training-4
Quelle: audit/spec/farbe.md Z. 409–412 · Dateien: web/css/app.css
Abhängig von: —

```text
**C7 – `web/css/app.css` Schatten-Ich, Z. 2399 und 2402** — bereich_training-4
- Kommentar „an = leicht getönt“ → „an = leicht angehoben, neutral“
- `.shadow-rule.on { border-color: color-mix(in srgb, var(--accent) 30%, var(--border)); background: color-mix(in srgb, var(--accent) 5%, var(--surface-2)); }` → `.shadow-rule.on { border-color: var(--border-2); background: color-mix(in srgb, var(--text) 3%, var(--surface-2)); }`

```

## farbe-C21 · Mentor-Seite: Hinweise muted, „Zu den Einstellungen“ normaler Knopf

Gruppe farbe · Cluster training · Aufwand S · Befunde: barrierefreiheit-25, farbe_kontrast-11, bereich_training-36
Quelle: audit/spec/farbe.md Z. 480–484 · Dateien: web/js/screens/mentor.js
Abhängig von: —

```text
**C21 – `web/js/screens/mentor.js`** — barrierefreiheit-25, farbe_kontrast-11, bereich_training-36
- Z. 79 `class="small faint" style="margin-top:14px">Anleitung zum Server:` → `class="small muted"`; `class="btn primary" href="#/settings/mentor">Zu den Einstellungen` → `class="btn"`
- Z. 84 Senden `btn primary icon` bleibt (Formular-Absenden, jetzt neutral)
- Z. 85 `class="mentor-note small faint"` → `class="mentor-note small muted"`

```

## farbe-C28 · Ruhepunkt: Schließen und Bühnen-Knöpfe ohne Hauptknopf-Stil

Gruppe farbe · Cluster training · Aufwand S · Befunde: bereich_training-44
Quelle: audit/spec/farbe.md Z. 522–526 · Dateien: web/js/screens/ruhepunkt.js
Abhängig von: —

```text
**C28 – `web/js/screens/ruhepunkt.js`** — bereich_training-44
- Z. 155 `class="btn primary" data-close>Schließen` → `class="btn"`
- Z. 232 `class: 'rp-btn rp-primary'` (Atmung „Starten“) → `class: 'rp-btn'`
- Z. 366 `class: 'rp-btn rp-primary'` (Countdown) → `class: 'rp-btn'` (Z. 737 Navigation und Z. 791 Mentor bleiben `rp-primary`)

```

## farbe-C29 · Schatten-Ich: Kosten mit Vorzeichen (costView, Tabelle), Spaltenkopf „Effekt“

Gruppe farbe · Cluster training · Aufwand M · Befunde: bereich_training-3
Quelle: audit/spec/farbe.md Z. 527–532 · Dateien: web/js/screens/shadow.js
Abhängig von: —

```text
**C29 – `web/js/screens/shadow.js`** — bereich_training-3
- Kommentar Z. 24 → `/* Kosten-Darstellung: Wirkung auf das Konto mit Vorzeichen (wie Tabelle, Ranking und Statistik → Fehler) */`
- Z. 25 `costView`: Zweig `cost > C.EPS`: `text: fmt.cur(cost)` → `text: fmt.cur(-cost, { signed: true })` (Klasse `neg` bleibt); Zweig `cost < -C.EPS`: `text: fmt.cur(-cost)` → `text: fmt.cur(-cost, { signed: true })` (Klasse `pos` bleibt); Null-Zweig unverändert
- Z. 69 `${U.pnl(v.cost, '', costR)}` → `${U.pnl(-v.cost, '', costR.r == null ? {} : { r: -costR.r })}`
- Z. 71 `<th class="r">Kosten</th>` → `<th class="r">Effekt</th>`

```

## farbe-D3f · README Z. 224: Regelwerk-Kachel „leicht angehoben (neutral, feiner Rand)“

Gruppe farbe · Cluster training · Aufwand S · Befunde: bereich_training-4
Quelle: audit/spec/farbe.md Z. 571–571 · Dateien: web/README.md
Abhängig von: farbe-C7

```text
- Z. 224: „eingeschaltet ist sie leicht getönt“ → „eingeschaltet ist sie leicht angehoben (neutral, feiner Rand)“ — bereich_training-4
```

## typografie-3.2.3v · Ruhepunkt-Bühnentitel am Handy: .rp-q 22 und .rp-title 21 → --fs-18 (K3)

Gruppe typografie · Cluster training · Aufwand S · Befunde: typografie-3, bereich_training-46
Quelle: audit/spec/typografie.md Z. 278–278 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
- Handy Z. 2334: `.rp-q { font-size: 22px; }` → `var(--fs-18)`, `.rp-title { font-size: 21px; }` → `var(--fs-18)` (K3)
```

## typografie-3.2.3x · Ruhepunkt-Bühnentitel .rp-q (26/700) und .rp-title (24/700) → 21/600 mit --lh-21 (K3)

Gruppe typografie · Cluster training · Aufwand S · Befunde: bereich_training-46
Quelle: audit/spec/typografie.md Z. 281–283 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
**→ `--fs-21`**
- Z. 2153 `.rp-q`: `font-weight: 700; font-size: 26px; line-height: 1.2` → `font-weight: 600; font-size: var(--fs-21); line-height: var(--lh-21)` (bereich_training-46, K3)
- Z. 2194 `.rp-title`: `font-weight: 700; font-size: 24px; line-height: 1.25` → `font-weight: 600; font-size: var(--fs-21); line-height: var(--lh-21)` (bereich_training-46, K3)
```

## typografie-3.2.4c · Ruhepunkt-Knöpfe: .rp-btn 500, .rp-btn.rp-primary 700

Gruppe typografie · Cluster training · Aufwand S · Befunde: typografie-19
Quelle: audit/spec/typografie.md Z. 334–335 · Dateien: web/css/app.css
Abhängig von: —

```text
| `.rp-btn` (2214) | 600 → 500 | typografie-19 |
| `.rp-btn.rp-primary` (2217) | `font-weight: 700;` ergänzen | typografie-19 |
```

## typografie-3.2.4g · Schatten-Ich-Intro .shadow-intro b auf 600

Gruppe typografie · Cluster training · Aufwand S · Befunde: typografie-20, bereich_training-33
Quelle: audit/spec/typografie.md Z. 342–342 · Dateien: web/css/app.css
Abhängig von: —

```text
| `.shadow-intro b` (2395) | `font-weight: 600;` ergänzen | typografie-20, bereich_training-33 |
```

## typografie-3.2.4m · Serie-Stufenwort 600/.06em (Farben bleiben) und Regel-Ziffern gedämpft 500 Onest (K19)

Gruppe typografie · Cluster training · Aufwand S · Befunde: bereich_training-21
Quelle: audit/spec/typografie.md Z. 350–352 · Dateien: web/css/app.css
Abhängig von: —

```text
| `.dstreak-steps b` (1265) | `font-weight: 700; letter-spacing: .08em` → `font-weight: 600; letter-spacing: .06em` (Farbe und Z. 1266/1267 bleiben) | bereich_training-21 (K19) |
| `.rules-list li::marker` (1274) | `{ color: var(--accent); font-weight: 700; }` → `{ color: var(--muted); font-weight: 500; font-family: var(--font-num); }` | bereich_training-21 |

```

## typografie-3.8m · Schatten-Ich-Verstöße: Datumszelle num

Gruppe typografie · Cluster training · Aufwand S · Befunde: typografie-12
Quelle: audit/spec/typografie.md Z. 438–438 · Dateien: web/js/screens/shadow.js
Abhängig von: typografie-3.2.2f

```text
| shadow.js:69 | `<td>${fmt.dateTime(v.date)}</td>` → `<td class="num">…` | typografie-12 |
```

## typografie-3.8o · Ruhepunkt-Startfrage .rp-q als h2 statt h1

Gruppe typografie · Cluster training · Aufwand S · Befunde: bereich_training-46
Quelle: audit/spec/typografie.md Z. 440–440 · Dateien: web/js/screens/ruhepunkt.js
Abhängig von: typografie-3.2.3x

```text
| ruhepunkt.js:707 | `h('h1', { class: 'rp-q', tabindex: '-1' }, …)` → `h('h2', { class: 'rp-q', tabindex: '-1' }, …)` | bereich_training-46 |
```

## abstaende-D4 · Tilt-Profil: .tilt-wrap gap, .tilt-stats als Subgrid (Werte auf einer Linie), Labels 12/500 --muted, Werte 32/24, .v.cur löschen; Handy Zeilen „Label | Wert“ (20 px)

Gruppe abstaende · Cluster training · Aufwand M · Befunde: abstaende_layout-27, responsiv-35
Quelle: audit/spec/abstaende.md Z. 371–371 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
| D4 | Tilt-Profil Z. 1300–1307 | Z. 1300 `.tilt-wrap` `gap: 18px` → `gap: var(--sp-4)`. Z. 1301 → `.tilt-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); grid-template-rows: auto auto; column-gap: var(--sp-3); row-gap: var(--sp-2); flex: 1; align-content: center; } .tilt-stats > div { display: grid; grid-row: span 2; grid-template-rows: subgrid; }`. Z. 1302 → `.tilt-stats .k { align-self: end; font-size: 12px; font-weight: 500; line-height: 16px; color: var(--muted); }`. Z. 1303: `font-size: 40px` → `32px`, `margin-top: 8px` → `0`. Z. 1304 (`.v.cur`) löschen. Z. 1307 → `@media (max-width: 960px) { .tilt-stats .v { font-size: 24px; } }`. Neu im 560er-Block: `.tilt-stats { grid-template-columns: 1fr; grid-template-rows: none; row-gap: 0; } .tilt-stats > div { display: flex; grid-row: auto; justify-content: space-between; align-items: baseline; gap: var(--sp-3); padding: var(--sp-3) 0; border-bottom: 1px solid var(--border); } .tilt-stats > div:last-child { border-bottom: 0; } .tilt-stats .v { font-size: 20px; text-align: right; } .tilt-stats .v small { font-size: 12px; }` | abstaende_layout-27, responsiv-35 |
```

## abstaende-D5 · Ruhepunkt „Dein Plan für heute“: durchgehende Zeilenlinien (dl.rp-summary gap 0, dd padding-left var(--sp-6))

Gruppe abstaende · Cluster training · Aufwand S · Befunde: bereich_training-47
Quelle: audit/spec/abstaende.md Z. 372–372 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
| D5 | Ruhepunkt Z. 2260, 2262 | `dl.rp-summary` `gap: 0 24px` → `gap: 0`. `dl.rp-summary dd` zusätzlich `padding-left: var(--sp-6);` | bereich_training-47 |
```

## abstaende-I1 · Schatten-Ich: Zeitraum-Label aus dem Kachelkopf streichen

Gruppe abstaende · Cluster training · Aufwand S · Befunde: bereich_training-25, responsiv-36
Quelle: audit/spec/abstaende.md Z. 417–421 · Dateien: web/js/screens/shadow.js
Abhängig von: —

```text
### web/js/screens/shadow.js

| Nr. | Stelle | vorher → nachher | Befunde |
|---|---|---|---|
| I1 | Z. 112 | `<span class="n">${esc(range.label)}</span>` streichen | bereich_training-25, responsiv-36 |
```

## abstaende-I2 · Schatten-Ich: Trade-Zahl als Fußzeile „{0} Trades im Zeitraum“ statt Kopfzusatz

Gruppe abstaende · Cluster training · Aufwand S · Befunde: bereich_training-25
Quelle: audit/spec/abstaende.md Z. 422–422 · Dateien: web/js/screens/shadow.js
Abhängig von: —

```text
| I2 | Z. 113 | `{ n: `${p.n} Trade${p.n === 1 ? '' : 's'}` }` → `{ foot: `${p.n} Trade${p.n === 1 ? '' : 's'} im Zeitraum` }` | bereich_training-25 |
```

## abstaende-I3 · Schatten-Ich: Untertitel (Zeitraum) an der Karte „Regelverstöße“ streichen

Gruppe abstaende · Cluster training · Aufwand S · Befunde: bereich_training-25
Quelle: audit/spec/abstaende.md Z. 423–424 · Dateien: web/js/screens/shadow.js
Abhängig von: —

```text
| I3 | Z. 120 | in `U.card('Regelverstöße', …, { sub: esc(pd.label), info: … })` die Option `sub: esc(pd.label), ` streichen | bereich_training-25 |

```

## abstaende-MENTOR · mentor.js: keine Strukturänderung (Breiten in C12, Symbol in D8), einen Inline-Abstand nach 1.16 ersetzen

Gruppe abstaende · Cluster training · Aufwand S · Befunde: abstaende_layout-34
Quelle: audit/spec/abstaende.md Z. 494–497 · Dateien: web/js/screens/mentor.js
Abhängig von: abstaende-A6

```text
### web/js/screens/mentor.js

Keine Strukturänderung (Breiten in C12, Symbol in D8). Ein Inline-Abstand nach 1.16.

```

## abstaende-R3 · shadowtest: Zeitraum aus [data-pop=range] span, Trade-Zahl aus .tile:nth-child(2) .foot

Gruppe abstaende · Cluster training · Aufwand S · Befunde: bereich_training-25
Quelle: audit/spec/abstaende.md Z. 522–522 · Dateien: web/e2e/shadowtest.js
Abhängig von: abstaende-I1, abstaende-I2

```text
| R3 | `web/e2e/shadowtest.js:68, 69, 71, 74` | Zeitraum nicht mehr aus `.shadow-main .head .n`, sondern aus `[data-pop=range] span`. Trade-Zahl aus `.tile:nth-child(2) .foot` (parseInt) statt `.tile:nth-child(2) .head .n` | bereich_training-25 |
```

## komponenten-C17c · Ruhepunkt „Bewusst abschalten“: eigene 20-px-Box statt nativer Checkbox (CSS)

Gruppe komponenten · Cluster training · Aufwand S · Befunde: bereich_training-48
Quelle: audit/spec/komponenten.md Z. 319–326 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 2268 `.rp-checks input { width: 20px; height: 20px; accent-color: var(--phase); flex: none; margin: 0; }` ersetzen durch:
```css
.rp-checks .rp-box { width: 20px; height: 20px; border-radius: 6px; border: 1.5px solid var(--border-2); display: grid; place-items: center; flex: none; color: transparent; transition: background var(--dur-1) var(--ease), border-color var(--dur-1) var(--ease); }
.rp-checks .rp-box svg { width: 13px; height: 13px; }
.rp-checks input:checked + .rp-box { background: var(--phase); border-color: var(--phase); color: var(--rp-on-phase); }
.rp-checks input:focus-visible + .rp-box { outline: 2px solid var(--phase); outline-offset: 3px; }
```

```

## komponenten-C31 · Mentor-Chat (CSS): .mentor → .mentor-chat, KI-Hinweis .mentor-disclaimer

Gruppe komponenten · Cluster training · Aufwand S · Befunde: bereich_training-2, bereich_training-1
Quelle: audit/spec/komponenten.md Z. 453–458 · Dateien: web/css/app.css
Abhängig von: —

```text
**C31 – Mentor-Chat** (bereich_training-2, bereich_training-1)
- Z. 2344 `.mentor { display: flex; … }` → `.mentor-chat { display: flex; … }` (Werte bleiben).
- Z. 2364 (im @media-Block) `.mentor { height: …; min-height: 400px; }` → `.mentor-chat { … }`
- Z. 2363 `.mentor-note { padding: 0 18px 12px; }` → `.mentor-disclaimer { padding: 0 18px 12px; color: var(--muted); }`
- Coach-Regeln Z. 2884–2889 und Z. 2916 bleiben unverändert.

```

## komponenten-C34a · Ruhepunkt: tote .rp-switch-Regeln löschen

Gruppe komponenten · Cluster training · Aufwand S · Befunde: bewegung-41
Quelle: audit/spec/komponenten.md Z. 473–474 · Dateien: web/css/app.css
Abhängig von: —

```text
**C34 – Ruhepunkt** (bewegung-41, bereich_training-41)
- Z. 2147–2151 (alle `.rp-switch`-Regeln) löschen; in Z. 2333 aus der Selektorliste `.rp-switch input, .rp-switch input::after, ` streichen.
```

## komponenten-C34b · Ruhepunkt-Rhythmusleiste ohne Abschneiden (min-width: max-content)

Gruppe komponenten · Cluster training · Aufwand S · Befunde: bereich_training-41
Quelle: audit/spec/komponenten.md Z. 475–477 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 2280 `.rp-seq-i { position: relative; min-width: 0; … }` → `min-width: max-content;`
- Z. 2334 (Handy) den Teil `.rp-seq-i b { white-space: normal; }` streichen. Die Ellipse in Z. 2283 bleibt als Netz.

```

## komponenten-S-mentor-a · Mentor-Chat: .mentor-chat, .mentor-disclaimer, Neu-laden mit I.refresh

Gruppe komponenten · Cluster training · Aufwand S · Befunde: bereich_training-2, bereich_training-1, bereich_training-37
Quelle: audit/spec/komponenten.md Z. 663–666 · Dateien: web/js/screens/mentor.js
Abhängig von: komponenten-C31

```text
**S-mentor (mentor.js)** (bereich_training-2, bereich_training-1, bereich_training-37, komponenten-1)
- Z. 81 `<section class="card mentor">` → `<section class="card mentor-chat">`
- Z. 82 `${I.clock}` → `${I.refresh}` (aria-label und data-tip bleiben).
- Z. 85 `class="mentor-note small faint"` → `class="mentor-disclaimer small"`
```

## komponenten-S-mentor-b · Mentor: Link zu Einstellungen neutral, „Senden“ bleibt primary

Gruppe komponenten · Cluster training · Aufwand S · Befunde: komponenten-1
Quelle: audit/spec/komponenten.md Z. 667–668 · Dateien: web/js/screens/mentor.js
Abhängig von: —

```text
- Z. 79 `<a class="btn primary" href="#/settings/mentor">` → `<a class="btn" …>`. Z. 84 (Senden) bleibt primary.

```

## komponenten-S-progress · Fortschritt: Aktivitäts-Pfeile als .btn.nav

Gruppe komponenten · Cluster training · Aufwand S · Befunde: komponenten-25
Quelle: audit/spec/komponenten.md Z. 691–693 · Dateien: web/js/screens/progress.js
Abhängig von: komponenten-C07

```text
**S-progress (progress.js)** (komponenten-25)
Z. 71: beide `class="btn round"` (act-scroll) → `class="btn nav"`.

```

## komponenten-S-ruhepunkt-a · Ruhepunkt-Rhythmus: Kurzlabels „Einatmen/Nachziehen/Ausatmen“ in der Leiste

Gruppe komponenten · Cluster training · Aufwand S · Befunde: bereich_training-41
Quelle: audit/spec/komponenten.md Z. 704–706 · Dateien: web/js/screens/ruhepunkt.js
Abhängig von: komponenten-C34b

```text
**S-ruhepunkt (ruhepunkt.js)** (bereich_training-41, bereich_training-48)
- Z. 55–58 (`P.seufzer`): `short` ergänzen: `{ label: 'Durch die Nase einatmen', short: 'Einatmen', … }`, `{ label: 'Kurz nachziehen', short: 'Nachziehen', … }`, `{ label: 'Lang durch den Mund ausatmen', short: 'Ausatmen', … }`.
- Z. 248 `h('b', null, p.label)` → `h('b', null, p.short || p.label)`.
```

## komponenten-S-ruhepunkt-b · „Bewusst abschalten“: versteckte Checkbox plus eigene .rp-box

Gruppe komponenten · Cluster training · Aufwand S · Befunde: bereich_training-48
Quelle: audit/spec/komponenten.md Z. 707–708 · Dateien: web/js/screens/ruhepunkt.js
Abhängig von: komponenten-C17c

```text
- Z. 606–609: `var cb = h('input', { type: 'checkbox' });` → `var cb = h('input', { type: 'checkbox', class: 'vh' }); var box = h('span', { class: 'rp-box', 'aria-hidden': 'true' }); box.innerHTML = I.check;` und `return h('label', null, cb, h('span', null, it[1]));` → `return h('label', null, cb, box, h('span', null, it[1]));` (`checked`-Vorbelegung und Listener bleiben).

```

## komponenten-S-shadow · Schatten-Ich-Seitenwahl: .btn.nav, nur bei mehreren Seiten, „1–10“

Gruppe komponenten · Cluster training · Aufwand S · Befunde: komponenten-25, bereich_trades_tag-34
Quelle: audit/spec/komponenten.md Z. 709–711 · Dateien: web/js/screens/shadow.js
Abhängig von: komponenten-C07

```text
**S-shadow (shadow.js)** (komponenten-25, bereich_trades_tag-34)
Z. 73 (Seitenwahl): Knöpfe in `.pg-nav` bekommen `class="btn nav"`; Seitenauswahl und `.pg-nav` nur bei mehr als einer Seite; `${from + 1} – ${…}` → `${from + 1}–${…}` (Schlüssel „{0}–{1} von {2} Verstößen“). Z. 109 bleibt `btn sm`.

```

## komponenten-E1e · e2e rptest.js: Abhak-Zeile über das Label klicken

Gruppe komponenten · Cluster training · Aufwand S · Befunde: bereich_training-48
Quelle: audit/spec/komponenten.md Z. 761–761 · Dateien: web/e2e/rptest.js
Abhängig von: komponenten-S-ruhepunkt-b

```text
- rptest.js:46: `p.click('.rp-checks input')` → `p.click('.rp-checks label')`.
```

## aufbau-C11a · Fortschritt: Pfeil mit Tooltip in Prozentpunkten, „0 / 5 Schritte erledigt“

Gruppe aufbau · Cluster training · Aufwand S · Befunde: bereich_training-22, hierarchie-20
Quelle: audit/spec/aufbau.md Z. 543–549 · Dateien: web/js/screens/progress.js
Abhängig von: —

```text
#### `web/js/screens/progress.js`

**C11** · bereich_training-10, bereich_training-5, bereich_training-11, hierarchie-20, bereich_training-22, aufbau-10
- Z. 20 `const arrow = (dir) => …` → `const arrow = (dir, tip) => dir > 0 ? `<span class="trend up" aria-label="steigend"${tip ? ` data-tip="${esc(tip)}"` : ''}>${I.arrowUp}</span>` : dir < 0 ? `<span class="trend down" aria-label="fallend"${tip ? ` data-tip="${esc(tip)}"` : ''}>${I.arrowDown}</span>` : '';`
- Z. 59 `const rateDir = …` → `const delta = cur.rate != null && prev && prev.rate != null ? Math.round((cur.rate - prev.rate) * 100) : 0; const rateDir = Math.sign(delta);` (ohne Vorzeitraum kein Pfeil)
- Z. 68 Heutiger Fortschritt: `<div class="big-stat"><span>${doneN ? pct + ' %' : 'Keine Daten'}</span>${arrow(doneN >= 4 ? 1 : 0)}</div><div class="small muted">${doneN} von ${items.length} Schritten erledigt</div>` → `<div class="big-stat"><span>${doneN} / ${items.length}</span></div><div class="small muted">Schritte erledigt</div>`; `pct` (Z. 58) löschen
- Z. 69: `${arrow(rateDir)}` → `${arrow(rateDir, `${delta > 0 ? '+' : ''}${delta} Prozentpunkte zum Vorzeitraum`)}`
```

## aufbau-C11b · Fortschritt: Checkliste mit „Regeln anlegen/bearbeiten“, Karte „Aktuelle Regeln“ weg

Gruppe aufbau · Cluster training · Aufwand S · Befunde: bereich_training-10, bereich_training-5, aufbau-10
Quelle: audit/spec/aufbau.md Z. 550–552 · Dateien: web/js/screens/progress.js
Abhängig von: —

```text
- Z. 73 Leerzustand der Checkliste: `<div class="dashed">Noch keine Regeln. Lege unter Einstellungen …</div>` → `<div class="dashed row between"><span>Noch keine Regeln.</span><a class="btn sm" href="#/settings/regeln">Regeln anlegen</a></div>`
- Z. 75 `trailing` der Tages-Checkliste: `<a class="btn sm" href="#/day/${todayKey}">Tag ansehen</a>` → `${rules.length ? '<a class="btn sm" href="#/settings/regeln">Regeln bearbeiten</a>' : ''}<a class="btn sm" href="#/day/${todayKey}">Tag ansehen</a>`
- Z. 77 Karte „Aktuelle Regeln“ ersatzlos löschen. `.prog-side` enthält danach „Disziplin pro Woche“ und „Dein Tilt-Profil“ (`cls: 'fill'` bleibt)
```

## aufbau-C11c · Fortschritt: Trading-Aktivität unter die Checkliste, Kommentare, .rules-list löschen

Gruppe aufbau · Cluster training · Aufwand S · Befunde: bereich_training-11, bereich_training-10
Quelle: audit/spec/aufbau.md Z. 553–556 · Dateien: web/js/screens/progress.js, web/css/app.css
Abhängig von: aufbau-C11b

```text
- Reihenfolge: Den Block `${U.card('Trading-Aktivität', …)}` (Z. 71, samt `trailing`) hinter das schließende `</div>` von `.grid.two.prog-split` und vor `Regeln im Detail` (Z. 82) setzen
- Kommentare Z. 1 und Z. 65 anpassen („rechts Disziplin und Tilt-Profil“, „darunter Trading-Aktivität und Regeln im Detail“)
- `web/css/app.css` Z. 1273–1274 (`.rules-list`, `.rules-list li::marker`) löschen

```
