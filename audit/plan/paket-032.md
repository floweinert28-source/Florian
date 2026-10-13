# Paket 032 · einstellungen

Schritte: 26 · Dateien: web/css/app.css, web/js/screens/misc.js, web/js/theme.js
Betroffene Tests laut Spezifikation: Akzeptanz 4.3 settings_design; Akzeptanz 4.3 settings_design (Sprachkarte 14/600); Akzeptanz 4.3 settings_logs; Akzeptanz 4.3 settings_profil („Alles löschen“ bleibt rot), settings_benachrichtigungen/coach (Schalter-Titel 14/500 gleich); Akzeptanz 4.3 settings_profil („Daten und Sicherung“ 15/600); Akzeptanz 4.3 settings_profil („Profil“ 18/600 kleiner als „Einstellungen“ 21/600); Akzeptanz 4.3 settings_profil/settings_trading/settings_sprache (≤ 68ch, „Entfernen“ rechts); Akzeptanz 4.3 settings_sprache; web/e2e/coachtest.js; web/e2e/colorpickertest.js (prüfen); web/e2e/colorpickertest.js:102 (.design-grid, prüfen); web/e2e/colorpickertest.js:67/71 (is-new bleibt); web/e2e/langtest.js; web/e2e/langtest.js:33 (.lang-card ohne Überlauf); web/e2e/sampletest.js:118 (Text bleibt unverändert); web/e2e/settest.js:26 (be-reset bleibt); web/e2e/settest.js:65; web/e2e/settest2.js; web/e2e/settest2.js (Euro in einer Zeile); web/e2e/settest2.js:43–47 (prüfen); web/e2e/settest2.js:46 (6 .pair-card, bleibt); web/e2e/switchtest.js:11 (Text .lang-cur bleibt); web/tests/inline-style.test.mjs (Zählung, Schritt R5)
Baut auf Paketen auf: 1, 2

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## farbe-A3b · theme.js: Farbpaare „Blau / Gelb“ (#3b82f6) und „Neutral / Rot“ in PRESETS_PAIR

Gruppe farbe · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-18, bereich_einstellungen-17
Quelle: audit/spec/farbe.md Z. 221–221 · Dateien: web/js/theme.js
Abhängig von: —

```text
- Z. 19 `PRESETS_PAIR`: `['Violett / Gelb', '#8b7cf6', '#facc15']` → `['Blau / Gelb', '#3b82f6', '#facc15']`; `['Weiß / Rot', '#f2f5f3', '#ff5c5c']` → `['Neutral / Rot', '#f2f5f3', '#ff5c5c']`. Gespeicherte Farben bleiben, keine Migration. — bereich_einstellungen-18, bereich_einstellungen-17
```

## farbe-C4 · Einstellungen: Karte „Eigenes“ sichtbarer Rand, Sprach-Karten Hover und Währung neutral

Gruppe farbe · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-47, bereich_einstellungen-8
Quelle: audit/spec/farbe.md Z. 393–397 · Dateien: web/css/app.css
Abhängig von: —

```text
**C4 – `web/css/app.css` Einstellungen** — bereich_einstellungen-47, bereich_einstellungen-8
- Z. 1853 `.theme-card.t-custom.is-new .tc-prev { …; outline: 1.5px dashed var(--border-2); …; color: var(--muted); }` → `outline: 1.5px dashed color-mix(in srgb, var(--text) 22%, transparent); … color: var(--text-2);`
- Z. 1921 `.lang-card:hover { border-color: var(--accent); }` → `border-color: var(--text-2);`
- Z. 1926 `.lang-card[aria-pressed="true"] .lang-cur { color: var(--accent); background: transparent; box-shadow: inset 0 0 0 1px var(--accent); }` → `{ color: var(--text-2); background: var(--surface-3); box-shadow: none; }`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .lang-card:hover] Beide setzen app.css:1921 `.lang-card:hover { border-color: var(--text-2); }`. Das passt zu anderen Optionskarten (.pair-card Hover-Rand --text-2). farbe-C4 setzt es um. Auf gewählten Karten bleibt der Rand aus der gemeinsamen Gewählt-Regel (Z. 3127, steht später).
- ÜBERNIMMT zustaende-S-C9c: Z. 1921 wird nicht separat geändert, farbe-C4 setzt denselben Wert.
- [konflikt: .lang-card[aria-pressed="true"] .lang-cur] app.css:1926 nach farbe-C4: `.lang-card[aria-pressed="true"] .lang-cur { color: var(--text-2); background: var(--surface-3); box-shadow: none; }`. Das Währungskürzel bleibt in beiden Zuständen dieselbe gefüllte Pille, gewählt wird nur die Schrift heller (--muted → --text-2). Die Auswahl zeigt die Karte selbst über den flachen Gewählt-Stil (Z. 3127). zustaende-S-C9c wollte im gewählten Zustand auf eine Umriss-Pille wechseln (transparent + Ring --border-2). Das wäre ein zusätzlicher Formwechsel und brächte keine Deutlichkeit: Im Dunklen liegt --border-2 (#34322e) auf der gewählten Kartenfläche (color-mix 10 % ≈ #302f2c) praktisch unsichtbar. Ruhiger und ohne Grün ist farbe-C4. switchtest.js:11 bleibt gültig.

## farbe-C22a · Kategorien: Setups-Farbe --text-2

Gruppe farbe · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-37
Quelle: audit/spec/farbe.md Z. 485–486 · Dateien: web/js/screens/misc.js
Abhängig von: —

```text
**C22 – `web/js/screens/misc.js`** — bereich_einstellungen-37, bereich_einstellungen-9, barrierefreiheit-25, farbe_kontrast-26, komponenten-8, bereich_einstellungen-17, referenz-6
- Z. 10 `setups: { label: 'Setups', color: 'var(--accent)', cls: 'setup' }` → `color: 'var(--text-2)'`
```

## farbe-C22b · Einstellungen: Neben-Knöpfe ohne primary, Speicherort muted, Pille „Aktiv“, Kategorien-Satz

Gruppe farbe · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-9, barrierefreiheit-25, farbe_kontrast-26, komponenten-8, bereich_einstellungen-37, referenz-6
Quelle: audit/spec/farbe.md Z. 487–492 · Dateien: web/js/screens/misc.js
Abhängig von: —

```text
- Z. 62 `class="btn primary sm" data-action="twofa"` → `class="btn sm"`
- Z. 69 `class="small faint">Speicherort:` → `class="small muted"`
- Z. 186 `U.pill('aktiv', 'win')` → `U.pill('Aktiv')`; `class="btn sm primary" data-action="edit-account"` → `class="btn sm"`
- Z. 207 `class="btn sm primary">${I.plus} Hinzufügen` → `class="btn sm"`
- Z. 234 Satz `Die Farben folgen deinen Akzent-, Verlust- und Break-even-Farben.` → `Setups sind neutral, Fehler stehen in der Verlustfarbe, Emotionen in der Break-even-Farbe.`
- Z. 238 `class="btn sm primary" data-action="tag-new"` → `class="btn sm"`
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: misc.profil] aufbau-C8c und farbe-C22b ändern in profil() verschiedene Teilstrings (Z. 41/54 Zeitzone, Z. 62 2FA-Knopf, Z. 68 Titel, Z. 69 Fußzeile) und vertragen sich. Z. 69 schreiben aber wording-S17.4-17.7 (17.7) und kilook-C24 als ganze Zeile neu, beide noch mit class="small faint". Für die Endfassung jeder Fußzeile in profil() gilt verbindlich: class="small muted", denn Fußnoten sind --muted und --faint ist nie für Wörter. Wo Tasten genannt werden, steht „1–9“. Welcher Wortlaut gilt (wording zweizeilig oder kilook ohne Tastatur-Teil), entscheidet diese Liste nicht.
- ÄNDERN: Den Z.-69-Punkt auf die Endfassung der Fußzeile anwenden: Jedes `<div class="small faint">` der Profil-Fußzeile wird `<div class="small muted">`, auch wenn wording-S17.4-17.7 oder kilook-C24 die Zeile schon neu geschrieben haben. Der Suchtext `class="small faint">Speicherort:` ist dafür nicht maßgeblich. Die übrigen Punkte (Z. 10, 62, 186, 207, 234, 238, 95) bleiben unverändert.
- [konflikt: misc.regeln] Untertitel in regeln() Z. 207, verbindlich: `Deine Regeln zum Abhaken. Sie erscheinen in „Plan & Bewertung“ eines Trades, beim Session-Ende, im Fortschritt und im Regel-Tracker. Messbare Grenzen wie „Max. Trades pro Tag“ stellst du im <a class="tlink" href="#/shadow">Regelwerk des Schatten-Ichs</a> ein.` Grund: aufbau trennt Checkliste und Regelwerk (Glossar), und wording W10 verlangt den sichtbaren Namen „Plan & Bewertung“ (app.js:416) statt „Trade-Editor“. Ein Link im Fließtext ist .tlink (komponenten C33); ein nacktes <a> erbt die Farbe ohne Unterstreichung (app.css:89) und wäre nicht als Link erkennbar. head() gibt den Untertitel schon als HTML aus. farbe-C22b (Knopf „Hinzufügen“ in Z. 207 → btn sm) ist davon unabhängig.

## farbe-C22c · Design-Seite: Vorschauen mit Anzeigefarbe (forLight), Paar-Schrift inkFor, Gewählt-Vergleich mit Rohwerten, Akzent-Hinweis

Gruppe farbe · Cluster einstellungen · Aufwand M · Befunde: bereich_einstellungen-17
Quelle: audit/spec/farbe.md Z. 493–499 · Dateien: web/js/screens/misc.js
Abhängig von: farbe-A3a, farbe-A3c

```text
- Z. 95 (`App.refreshSavedColors`) `T.DEFAULTS[st.theme === 'light' ? 'light' : 'dark'].accent` → `T.DEFAULTS.dark.accent`
- Z. 90–93 `savedDots`: `style="--c:${c}"` → `style="--c:${S.settings.theme === 'light' ? root.Theme.forLight(c) : c}"`
- In `design()` (Z. 129 ff.) am Anfang ergänzen: `const pv = c => st.theme === 'light' ? T.forLight(c) : c; const raw = k => (col[k] || T.DEFAULTS.dark[k]).toLowerCase();`
- Z. 134 Paare: `aria-pressed="${cur.profit.toLowerCase() === p && cur.loss.toLowerCase() === l}"` → `aria-pressed="${raw('profit') === p && raw('loss') === l}"`; `<i style="background:${p}">` → `<i style="background:${pv(p)};color:${T.inkFor(pv(p))}">`; `<i style="background:${l}">` → `<i style="background:${pv(l)};color:${T.inkFor(pv(l))}">` (app.css:1947 `color:#04140a` bleibt als Rückfall)
- Z. 141 `picker`: `<i style="background:${val}">` → `<i style="background:${pv(val)}">`
- Z. 145 Akzentpunkte: `aria-pressed="${cur.accent.toLowerCase() === c}"` → `aria-pressed="${raw('accent') === c}"`, `style="--c:${c}"` → `style="--c:${pv(c)}"`; Aufruf `savedDots(cur.accent, …)` → `savedDots(raw('accent'), …)`; Hinweis „Buttons, aktive Einträge und Diagramme.“ → „„Trade loggen“, Schalter, aktive Einträge und Diagramme.“

```

## typografie-3.2.3o · Sprachkarte .lang-card b 16 → 14/600 (K5)

Gruppe typografie · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-28
Quelle: audit/spec/typografie.md Z. 263–263 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
- 16 → 14: Z. 1922 `.lang-card b` → `font-size: var(--fs-14); font-weight: 600;` (bereich_einstellungen-28, K5)
```

## typografie-3.2.3r · Einstellungs-Blocktitel .set-block h3 14/700 → 15/600 (margin-bottom 10px bleibt)

Gruppe typografie · Cluster einstellungen · Aufwand S · Befunde: referenz-35
Quelle: audit/spec/typografie.md Z. 270–270 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
- 14 → 15/600: Z. 1818 `.set-block h3` → `.set-block h3 { font-size: var(--fs-15); line-height: var(--lh-15); font-weight: 600; margin-bottom: 10px; }` (referenz-35)
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .set-block h3] Ergebnis: .set-block h3 { font-size: var(--fs-15); line-height: var(--lh-15); font-weight: 600; margin-bottom: var(--sp-4); } dazu .set-block h3:has(+ .set-desc) { margin-bottom: var(--sp-1); } aus abstaende-B26. Größe und Gewicht 15/600 setzen aufbau-A4b und typografie-3.2.3r beide; typografie übernimmt, mit Tokens. Den Abstand bestimmt abstaende („Titel↔Inhalt 16“), nicht die 10px, die typografie stehen lassen wollte.
- ÄNDERN: Nur font-size: var(--fs-15); line-height: var(--lh-15); font-weight: 600 setzen. margin-bottom kommt aus abstaende-B26 (var(--sp-4)), also kein „margin-bottom: 10px“ schreiben.

## typografie-3.2.3u · Einstellungs-Bereichstitel .set-head h2 24/700 → 18/600 (K2)

Gruppe typografie · Cluster einstellungen · Aufwand S · Befunde: referenz-32
Quelle: audit/spec/typografie.md Z. 277–277 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
- 24 → 18: Z. 1815 `.set-head h2 { font-size: 24px; font-weight: 700; letter-spacing: -0.01em; }` → `{ font-size: var(--fs-18); line-height: var(--lh-18); font-weight: 600; letter-spacing: -0.01em; }` (referenz-32, K2)
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .set-head h2] typografie-3.2.3u gewinnt: `.set-head h2 { font-size: var(--fs-18); line-height: var(--lh-18); font-weight: 600; letter-spacing: -0.01em; }`. Es gibt keine eigene Stufe ≤960 px, also keine 16 px. Gründe: h2 für Bereich, Dialog und Panel ist app-weit 18/600, auch am Handy (Dialog- und Panel-Titel bleiben dort ebenfalls 18). 16 liegt nicht auf der Text-Skala. Überschriften behalten −0.01em aus `h1–h4`. Zeilenhöhen stehen nie in px. Gewicht 600 und Größe 18 sind in beiden Spezifikationen gleich, abweichend waren nur Laufweite, px-Zeilenhöhe und die Handy-Stufe.

## typografie-3.2.4j · Optionskarten .font-card b und .pair-card b auf 600

Gruppe typografie · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-28
Quelle: audit/spec/typografie.md Z. 346–346 · Dateien: web/css/app.css
Abhängig von: —

```text
| `.font-card b` (1931), `.pair-card b` (1948) | `font-weight: 600;` ergänzen | bereich_einstellungen-28 |
```

## typografie-3.2.4k · Zeilentitel in Einstellungen und Coach: neue Regel 14/500 ohne Farbe, Einzelregel .coach-nrow b 13.5px löschen (K7)

Gruppe typografie · Cluster einstellungen · Aufwand S · Befunde: referenz-35, bereich_einstellungen-28, bereich_konto-33, typografie-20
Quelle: audit/spec/typografie.md Z. 347–347 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
| Zeilentitel, neu nach Z. 1865 | `.set-row b, .set-block .row.between > div > b, .set-block .check b, .coach-nrow b { font-size: var(--fs-14); line-height: var(--lh-14); font-weight: 500; }` (**ohne** Farbe). Z. 2949 `.coach-nrow b { font-size: 13.5px; }` löschen. | referenz-35, bereich_einstellungen-28, bereich_konto-33, typografie-20 (K7) |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .set-row b] typografie-3.2.4k gewinnt, ergänzt um den Profilbild-Titel aus A4b. Nach Z. 1865 kommt neu: `.set-row b, .set-block .row.between > div > b, .set-block .check b, .set-block .avatar-row b, .coach-nrow b { font-size: var(--fs-14); line-height: var(--lh-14); font-weight: 500; }`, **ohne Farbe**. `.set-row b { display: block; margin-bottom: 2px; }` bleibt, Z. 2949 `.coach-nrow b { font-size: 13.5px; }` wird gelöscht. Gründe: A4b setzt `color: var(--text)` auf `.set-body .row.between > div > b` (Spezifität 0,3,1). Das würde „Alles löschen“ (`<b class="neg">`, misc.js:68) von Rot auf Textfarbe setzen. Außerdem fehlt bei A4b `.coach-nrow b`. Aus A4b wird `.avatar-row b` („Profilbild“, misc.js:47, liegt in `form.set-block`) übernommen, weil es dieselbe Rolle „Zeilentitel einer Option“ hat.
- ÄNDERN: Die Selektorliste der neuen Regel um `.set-block .avatar-row b` ergänzen: `.set-row b, .set-block .row.between > div > b, .set-block .check b, .set-block .avatar-row b, .coach-nrow b { font-size: var(--fs-14); line-height: var(--lh-14); font-weight: 500; }`. Weiter ohne Farbe, Z. 2949 löschen wie spezifiziert.

## typografie-3.2.5f · Einstellungen: Beschreibungen max. 68ch und Knopf rechts halten (flex: 1 1 320px)

Gruppe typografie · Cluster einstellungen · Aufwand S · Befunde: typografie-9, referenz-35
Quelle: audit/spec/typografie.md Z. 364–365 · Dateien: web/css/app.css
Abhängig von: —

```text
| Beschreibungsbreite, neu nach Z. 1818 | `.set-head p, .set-block .small { max-width: 68ch; }` | typografie-9 |
| Knopf rechts halten, neu nach Z. 1818 | `.set-block .row.between > div:first-child { flex: 1 1 320px; min-width: 0; }` | referenz-35 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .set-head p] typografie-3.2.3i übernimmt die Größe: `.set-head p { margin-top: 4px; font-size: var(--fs-13); line-height: var(--lh-13); }`. typografie-3.2.5f ist verträglich und fügt die neue Regel `.set-head p, .set-block .small { max-width: 68ch; }` hinzu. aufbau-A4b setzt dieselbe Größe 13 ohne Token und entfällt hier.

## typografie-3.8p · Einstellungen → Sprache: Inline-max-width 640px entfernen

Gruppe typografie · Cluster einstellungen · Aufwand S · Befunde: typografie-9
Quelle: audit/spec/typografie.md Z. 441–441 · Dateien: web/js/screens/misc.js
Abhängig von: typografie-3.2.5f

```text
| misc.js:33 | `style="margin-top:14px;max-width:640px"` → `style="margin-top:14px"` | typografie-9 |
```

## typografie-3.8q · Einstellungen → Logs: Zeitzellen num

Gruppe typografie · Cluster einstellungen · Aufwand S · Befunde: typografie-12
Quelle: audit/spec/typografie.md Z. 442–442 · Dateien: web/js/screens/misc.js
Abhängig von: typografie-3.2.2f

```text
| misc.js:255, 260 (Logs) | `<td>${when(x.at)}</td>` / `<td>${when(l.at)}</td>` → `<td class="num">…` | typografie-12 |
```

## abstaende-B26 · Einstellungsblöcke: .set-body (gap, container-type), .set-block, h3, .set-head-row auf Skala; neu .set-desc, .set-item, .set-block .form-grid, .set-block .set-field, .set-addrow

Gruppe abstaende · Cluster einstellungen · Aufwand L · Befunde: bereich_einstellungen-31, bereich_einstellungen-27, bereich_einstellungen-26, bereich_einstellungen-13, abstaende_layout-23, abstaende_layout-34, abstaende_layout-21
Quelle: audit/spec/abstaende.md Z. 342–342 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
| B26 | Einstellungsblöcke Z. 1813, 1817, 1818, 1820 | `.set-body` gap 22 → `var(--content-gap)`, dazu `container-type: inline-size;`. `.set-block` `padding: 18px 20px` → `padding: var(--pad-card)`. `.set-block h3` `margin-bottom: 10px` → `margin-bottom: var(--sp-4)`. `.set-head-row` `margin-bottom: 4px` → `margin-bottom: var(--sp-4)`. Neu nach Z. 1821: `.set-block h3:has(+ .set-desc), .set-head-row:has(+ .set-desc) { margin-bottom: var(--sp-1); } .set-desc { font-size: 12px; color: var(--muted); max-width: 68ch; margin: 0 0 var(--sp-4); } .set-desc:last-child { margin-bottom: 0; } .set-item { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: var(--sp-4); align-items: center; padding: var(--sp-4) 0; border-top: 1px solid var(--border); } .set-item:first-child { padding-top: 0; border-top: 0; } .set-block .form-grid { max-width: 560px; grid-template-columns: repeat(2, minmax(0, 1fr)); } .set-block .set-field { max-width: 560px; } .set-addrow { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: var(--sp-3); margin-top: var(--sp-4); }` | bereich_einstellungen-31, -27, -26, -13, abstaende_layout-23, -34, -21 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .set-block h3] Ergebnis: .set-block h3 { font-size: var(--fs-15); line-height: var(--lh-15); font-weight: 600; margin-bottom: var(--sp-4); } dazu .set-block h3:has(+ .set-desc) { margin-bottom: var(--sp-1); } aus abstaende-B26. Größe und Gewicht 15/600 setzen aufbau-A4b und typografie-3.2.3r beide; typografie übernimmt, mit Tokens. Den Abstand bestimmt abstaende („Titel↔Inhalt 16“), nicht die 10px, die typografie stehen lassen wollte.

## abstaende-B27 · Break-even-Raster .be-grid neu (auto 160px 160px, align-items start)

Gruppe abstaende · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-25, responsiv-45
Quelle: audit/spec/abstaende.md Z. 343–343 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
| B27 | Break-even, neu nach `.input-unit .input` (Z. 1882) | `.be-grid { display: grid; grid-template-columns: auto 160px 160px; gap: var(--sp-3) var(--sp-4); align-items: start; justify-content: start; }` | bereich_einstellungen-25, responsiv-45 |
```

## abstaende-C9 · Auswahlkarten-Raster der Einstellungen vereinheitlichen: eigene Spalten/Lücken/max-width streichen, gap var(--sp-3), 4 bzw. 3 Spalten, Container ≤ 720 px zwei Spalten

Gruppe abstaende · Cluster einstellungen · Aufwand M · Befunde: abstaende_layout-21, bereich_einstellungen-24
Quelle: audit/spec/abstaende.md Z. 358–358 · Dateien: web/css/app.css
Abhängig von: abstaende-B26

```text
| C9 | Auswahlkarten-Raster Z. 1822, 1834, 1835, 1919, 1927, 1944 | Die eigenen `grid-template-columns`/`gap`/`max-width` in `.design-grid` (1822), `.theme-grid` (1834), `.lang-grid` (1919), `.font-grid` (1927) und `.pair-grid` (1944) streichen, ebenso die Media-Regel 1835. Neu nach 1821: `.theme-grid, .font-grid, .design-grid, .pair-grid, .lang-grid { display: grid; gap: var(--sp-3); } .theme-grid, .font-grid, .design-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } .pair-grid, .lang-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }`. Neu nach Z. 1949 (hinter den `.pair-card`-Regeln, sonst gewinnt deren Polster): `@container (max-width: 720px) { .theme-grid, .font-grid, .design-grid, .pair-grid, .lang-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .pair-card .pv i { padding: 7px 4px; } }` (Container ist `.set-body`, B26). | abstaende_layout-21, bereich_einstellungen-24 |
```

## abstaende-C10 · .settings: gap 28px → var(--sp-8), im 960er-Block 14px → var(--sp-4)

Gruppe abstaende · Cluster einstellungen · Aufwand S · Befunde: abstaende_layout-32
Quelle: audit/spec/abstaende.md Z. 359–359 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
| C10 | Einstellungen Z. 1805, 1895 | `.settings` `gap: 28px` → `gap: var(--sp-8)`. Im 960er-Block `.settings { …; gap: 14px; }` → `gap: var(--sp-4)` | abstaende_layout-32 |
```

## abstaende-L1 · Profil: form-grid ohne Inline-max-width (zweispaltig über .set-block .form-grid)

Gruppe abstaende · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-27
Quelle: audit/spec/abstaende.md Z. 451–455 · Dateien: web/js/screens/misc.js
Abhängig von: abstaende-B26

```text
### web/js/screens/misc.js (Einstellungen)

| Nr. | Stelle | vorher → nachher | Befunde |
|---|---|---|---|
| L1 | Profil Z. 48 | `<div class="form-grid" style="max-width:720px">` → `<div class="form-grid">` (2 Spalten über B26) | bereich_einstellungen-27 |
```

## abstaende-L2 · Beschreibungen unter Blocktiteln als <div class="set-desc"> (auch Meine Designs ohne dynamischen Rand)

Gruppe abstaende · Cluster einstellungen · Aufwand M · Befunde: bereich_einstellungen-31, abstaende_layout-34
Quelle: audit/spec/abstaende.md Z. 456–456 · Dateien: web/js/screens/misc.js
Abhängig von: abstaende-B26

```text
| L2 | Beschreibungen Z. 60, 62, 109, 144, 145, 146, 194 | jedes `<div class="small muted" style="margin-bottom:…">` direkt unter einem Blocktitel → `<div class="set-desc">`. In Z. 109 (Meine Designs) die dynamische `margin-bottom:${list.length ? 14 : 0}px` streichen, den leeren Fall regelt `:last-child`. | bereich_einstellungen-31, abstaende_layout-34 |
```

## abstaende-L3 · Daten und Sicherung: Zeilen als .set-item, Trenner weg, „Entfernen“ neutral, „Alles löschen“ ohne .neg

Gruppe abstaende · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-13, abstaende_layout-23
Quelle: audit/spec/abstaende.md Z. 457–457 · Dateien: web/js/screens/misc.js
Abhängig von: abstaende-B26

```text
| L3 | Daten und Sicherung Z. 63–68 | Z. 63 `<div class="stack" style="gap:12px">` → `<div>`. Z. 64, 65, 66, 68: `<div class="row between" style="gap:12px">` → `<div class="set-item">`. Z. 67 `<div class="divider"></div>` streichen. Z. 66: Knopf „Entfernen“ `btn sm danger` → `btn sm`. Z. 68: `<b class="neg">Alles löschen</b>` → `<b>Alles löschen</b>` (der Knopf bleibt `btn sm danger`). Text in Z. 66 bleibt. | bereich_einstellungen-13, abstaende_layout-23 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: b.neg] Z. 68 (Daten und Sicherung) bekommt den Zeilentitel `<b>Alle Daten löschen</b>` ohne Klasse neg, also in --text als Zeilentitel 14/500. Der Knopf bleibt `btn sm danger` mit „Alles löschen“. Grund: Rot steht nur für Verlust, Fehler und die Gefahr-Aktion (farbe), und die Gefahr trägt hier der Knopf. Mit dem neuen Titel sagen Titel und Knopf außerdem nicht zweimal dasselbe (aufbau). Das <b>-Element ändert nur aufbau-C8c (Text und Klasse, dazu der Sprachschlüssel „Alle Daten löschen“ aus aufbau Z. 681 in allen fünf Sprachdateien). abstaende-L3 baut nur die Zeilen um. Die Typografie-Abnahme „„Alles löschen“ bleibt rot“ (typografie.md Z. 80/500) ist damit überholt. Die Entscheidung hängt nicht von aufbau-25 ab (Verschieben nach „Sicherheit und Daten“).
- ÄNDERN: In Z. 68 nur `<div class="row between" style="gap:12px">` → `<div class="set-item">` ändern. `<b class="neg">Alles löschen</b>` bleibt unberührt, das setzt aufbau-C8c auf `<b>Alle Daten löschen</b>`. Die übrigen Punkte von L3 bleiben unverändert (Z. 63/64/65/66, Trenner Z. 67 weg, „Entfernen“ als btn sm, Knopf „Alles löschen“ bleibt btn sm danger).

## abstaende-L4 · Benachrichtigungen: Blöcke als set-block mit h3, .set-desc und stack s-4

Gruppe abstaende · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-31
Quelle: audit/spec/abstaende.md Z. 458–458 · Dateien: web/js/screens/misc.js
Abhängig von: abstaende-B26, abstaende-A6

```text
| L4 | Benachrichtigungen Z. 168–177 | je Block: `<div class="set-block"><h3>Performance-Recaps</h3><div class="set-desc">…</div><div class="stack s-4">${switchRow…}…</div></div>`. Das `<h3 style="margin-bottom:4px">`, der Wrapper `<div>` und `set-block stack style="gap:18px"` entfallen. Für „Hinweis-Punkte in der Seitenleiste“ ebenso. | bereich_einstellungen-31 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- ÄNDERN: Benachrichtigungen gleich im Endmarkup aus der Entscheidung bauen: je Block set-block > h3 > div.set-desc > div.stack.s-4. .set-sub ist das letzte Kind im stack des Blocks „Hinweis-Punkte“, direkt hinter dem Hauptschalter.

## abstaende-L5 · Mentor-Einstellungen: set-block stack s-4, Felder .set-field, Hinweise mt-2

Gruppe abstaende · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-27
Quelle: audit/spec/abstaende.md Z. 459–459 · Dateien: web/js/screens/misc.js
Abhängig von: abstaende-B26, abstaende-A6

```text
| L5 | Mentor Z. 155–157 | `<form … class="set-block stack" style="gap:14px">` → `class="set-block stack s-4"`. Die beiden `.field` bekommen `class="field set-field"`. Die Inline-`margin-top` der Hinweise darunter → `mt-2`. | bereich_einstellungen-27 |
```

## abstaende-L6 · Trading-Block: stack s-6, chips s-2, Break-even mit Zurücksetzen in .set-head-row und Feldern in .be-grid, Feld .set-field mt-3, Häkchen .check.top (neue Regel in app.css)

Gruppe abstaende · Cluster einstellungen · Aufwand M · Befunde: bereich_einstellungen-25, bereich_einstellungen-27, responsiv-45
Quelle: audit/spec/abstaende.md Z. 460–460 · Dateien: web/js/screens/misc.js, web/css/app.css
Abhängig von: abstaende-B26, abstaende-B27, abstaende-A6

```text
| L6 | Trading Z. 192–201 | Z. 192 `class="stack" style="gap:22px"` → `class="stack s-6"`. Z. 193 `class="chips" style="gap:8px"` → `class="chips s-2"`. Z. 194: `<h3>Break-even-Bereich</h3>` → `<div class="set-head-row"><h3>Break-even-Bereich</h3><button type="button" class="btn sm ghost" data-action="be-reset">Auf Standard zurücksetzen</button></div>`, Beschreibung als `set-desc`. Z. 195 `<div class="row" style="gap:16px;align-items:flex-end">` → `<div class="be-grid">`. Z. 196 (alter Zurücksetzen-Knopf mit Inline-Farbe) löschen. Z. 198 `<div class="field" style="max-width:300px;margin-top:12px">` → `<div class="field set-field mt-3">`. Z. 199 `<div class="form-grid" style="max-width:560px">` → `<div class="form-grid">`. Z. 200 `style="margin-top:12px;align-items:flex-start"` → Klasse `mt-3`, `align-items:flex-start` in eine Regel `.set-block .check.top { align-items: flex-start; }` (app.css) und Klasse `top`. | bereich_einstellungen-25, -27, responsiv-45 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- ÄNDERN: Z. 200: Die Tilt-Checkbox wird durch komponenten-S-misc-e zum Schalter. Klasse „top“ und die neue Regel .set-block .check.top entfallen. mt-3 sitzt am Wrapper-div des Schalters.

## abstaende-L7 · Regeln: Hinzufügen-Formular als .set-addrow, Feld ohne grow, Knopf neutral (btn), stack s-1

Gruppe abstaende · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-26
Quelle: audit/spec/abstaende.md Z. 461–461 · Dateien: web/js/screens/misc.js
Abhängig von: abstaende-B26, abstaende-A6

```text
| L7 | Regeln Z. 207 | `<form data-action="add-rule" class="row" style="margin-top:14px"><input class="input grow" …>…<button … class="btn sm primary">` → `<form data-action="add-rule" class="set-addrow"><input class="input" …>…<button … class="btn">` (Attribute, Platzhalter und Knopfinhalt bleiben; `grow` am Feld und `sm primary` am Knopf entfallen: neutral und so hoch wie das Feld). `stack style="gap:4px"` → `stack s-1`. | bereich_einstellungen-26 |
```

## abstaende-L8 · Notebook-Einstellungen: .set-block.nb-settings, stack s-4, Zurücksetzen ohne Inline-Farbe, Vorschau als .field mit .lbl

Gruppe abstaende · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-12
Quelle: audit/spec/abstaende.md Z. 462–462 · Dateien: web/js/screens/misc.js
Abhängig von: abstaende-B26, abstaende-A6

```text
| L8 | Notebook Z. 214–223 | Z. 214 `class="nb-settings"` → `class="set-block nb-settings"`. Z. 215 `class="stack" style="gap:14px"` → `class="stack s-4"`. Z. 221 am Knopf „Auf Standard zurücksetzen“ `style="color:var(--muted)"` streichen. Z. 223 `<div><div class="lbl" style="font-size:13px;font-weight:600;color:var(--text-2);margin-bottom:8px">Vorschau</div><div class="nb-preview" …>` → `<div class="field"><span class="lbl">Vorschau</span><div class="nb-preview" …>` | bereich_einstellungen-12 |
```

## abstaende-L9 · Sprache: Hinweis <p class="small muted mt-4"> statt Inline-Rand/-Breite

Gruppe abstaende · Cluster einstellungen · Aufwand S · Befunde: abstaende_layout-34
Quelle: audit/spec/abstaende.md Z. 463–463 · Dateien: web/js/screens/misc.js
Abhängig von: abstaende-A6

```text
| L9 | Sprache Z. 33 | `<p class="small muted" style="margin-top:14px;max-width:640px">` → `<p class="small muted mt-4">` | abstaende_layout-34 |
```
