# Paket 024 · training

Schritte: 28 · Dateien: web/css/app.css, web/e2e/rptest.js, web/e2e/shadowtest.js, web/js/screens/mentor.js, web/js/screens/progress.js, web/js/screens/ruhepunkt.js, web/js/screens/shadow.js
Betroffene Tests laut Spezifikation: Akzeptanz 4.3 progress; Akzeptanz 4.3 ruhepunkt (document.querySelectorAll('h1').length === 1); Akzeptanz 4.3 ruhepunkt („Wo stehst du gerade?“ und Session-Titel 21/600); Akzeptanz 4.4: grep "h('h1'" in ruhepunkt.js ohne Treffer; e2e/coachtest.js:84, :96 (Coach-.mentor-note bleibt); e2e/mentortest.js; e2e/rptest.js:17; e2e/rptest.js:46; e2e/rptest.js:46 (siehe E1e); e2e/shadowtest.js:38, :41, :43 (prüfen „1 – 10 von … Verstößen“ bzw. „11 – “/„1 – “ mit Leerzeichen; nicht in E1 genannt, mitändern); web/e2e/fwtest.js:23–24 (Widget = Seite über costView); web/e2e/rptest.js; web/e2e/rptest.js:11; web/e2e/shadowtest.js; web/e2e/shadowtest.js:68, 69, 71, 74; web/e2e/shadowtest.js:68, 74 (Schritt R3); web/e2e/shadowtest.js:69, 71 (Schritt R3); web/e2e/streaktest.js
Baut auf Paketen auf: 1, 2, 4, 7

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .mentor-setup .ico svg] Das Ergebnis lautet `.mentor-setup .ico, .coach-join-head .ico { display: flex; justify-content: center; } .mentor-setup .ico svg { width: 34px; height: 34px; color: var(--faint); }` (abstaende-D8). Begründung: Die Einrichtungskarte weist auf eine noch nicht eingerichtete Funktion hin. Sie ist damit dieselbe Bauart wie ein Leerzustand (Symbol 34 px --faint, siehe zustaende Z1 und komponenten LEER). farbe erlaubt --faint ausdrücklich für leere oder inaktive Symbole. Das Ziel von farbe-C6, kein Grün am Symbol, ist damit ebenfalls erfüllt.
- ÄNDERN: Den Punkt zu Z. 2341 (`.mentor-setup .ico svg` → --text-2) streichen. Größe 34 px und Farbe --faint setzt abstaende-D8. Z. 2350 (.msg.user) und Z. 2356 (.msg.typing i → --muted) unverändert umsetzen.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .mentor-setup] mentor.js Z. 79 schreibt allein wording-S15.4-15.5 neu, und zwar so: `<div class="mentor-wrap"><section class="card mentor-setup"><span class="ico">${I.chat}</span><h2>Mentor-Chat einrichten</h2><p class="muted">Der Mentor läuft über deinen Journalyst-Server, damit der API-Schlüssel nie im Browser liegt. Trage unter Einstellungen → Server die Adresse und das Zugangstoken ein.</p><a class="btn" href="#/settings/mentor">Server einrichten</a></section></div>`. Die Zeile „Anleitung zum Server: server/README.md im Projekt.“ fällt ersatzlos weg, weil Pfade laut wording W11 nur unter Einstellungen → Server stehen. Damit entfallen auch der Klassenwechsel `small faint → small muted` aus farbe-C21 an dieser Zeile und der einzige Inline-Abstand in mentor.js (`style="margin-top:14px"`), den abstaende-MENTOR ersetzen wollte. Der Knopf wird ein neutrales `.btn`, denn er navigiert nur, und Grün bleibt „Trade loggen“ vorbehalten. Das CSS der Karte aus abstaende-D8 (`padding: var(--sp-10) var(--sp-6)`, Symbol mittig) gilt unverändert. mentortest.js:22 (`.mentor-setup h2`, `.mentor-setup a[href="#/settings/mentor"]`) bleibt grün.
- ÄNDERN: Z. 79 nicht selbst bearbeiten. Die Zeile „Anleitung zum Server“ streicht wording-S15.4-15.5 ersatzlos und setzt dabei auch die Knopfklasse `btn`. Z. 84 bleibt laut Spezifikation ohnehin. Z. 85 regelt der Anker .mentor-note. Von C21 bleibt damit keine eigene Änderung übrig, nur das Ergebnis prüfen.
- [konflikt: .mentor-note] .mentor-note steht künftig nur noch für die Coach-Notiz. Der KI-Hinweis im Mentor-Chat wird zu `.mentor-disclaimer`: mentor.js Z. 85 `<div class="mentor-disclaimer small">…</div>` (komponenten-S-mentor-a) und app.css Z. 2363 `.mentor-disclaimer { padding: 0 18px 12px; color: var(--muted); }` (komponenten-C31). Dazu kommen `.mentor` → `.mentor-chat` in Z. 2344/2364 und `card mentor` → `card mentor-chat` in Z. 81. Damit ist das Ziel von farbe-C21 (Hinweis in --muted statt --faint) erreicht, ohne Klasse `muted`. kilook-B3 läuft unverändert: Selektor `.mentor-notes > .mentor-note`, Fläche --surface-2, Rand --border, ::before gelöscht. Heute bekommt der KI-Hinweis wegen der gleichen Klasse die gelbe Notizfläche samt Streifen, weil Z. 2884/2885 nach Z. 2363 stehen. Beide Schritte beheben das, die Reihenfolge ist egal. coachtest.js:84/153 (`.coach-entry … .mentor-note`) bleibt gültig.
- ÄNDERN: Z. 85 nicht selbst ändern. komponenten-S-mentor-a setzt `class="mentor-disclaimer small"`, und die Farbe --muted kommt aus `.mentor-disclaimer` (komponenten-C31).

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: U.pnl] Die Regel aus kilook-A3 gilt überall: Ergebnisse laufen über U.pnl und tragen immer ein Vorzeichen, signed: false fällt weg (kilook-C9b Z. 166, kilook-C16 Z. 26). Disziplin-Kosten tragen ein Vorzeichen (farbe-C29). Break-even sieht in TradeLog und Tagesansicht gleich aus: `<span class="neu">${fmt.cur(t.pnl, { signed: true, r: t.r })}</span>`, offene Trades zeigen `U.statusPill('open')` (aufbau-C7c und C15a). Prop-Beträge bekommen { currency: a.currency } (siehe money). Im Notebook tragen alle P&L-Beträge die Klasse num: der Notizkopf (farbe-C24c), die Trade-Notiz in der Liste (zustaende-S-NB1) und ebenso die neue Tagesnotiz-Zeile aus aufbau-C10d. responsiv-3.10 und typografie-3.8h sind verträglich (Text von 3.8h siehe U.barRow).

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

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .rules-list li::marker] aufbau-C11b/C11c löschen die Karte „Aktuelle Regeln“ (progress.js:77, die einzige Stelle mit .rules-list) und die Regeln .rules-list und .rules-list li::marker (app.css 1273–1274). Damit gibt es keinen Listenmarker mehr, den man umfärben könnte. farbe-C2 sieht diesen Fall selbst vor („entfällt, falls Aufbau die Karte löscht“). Keine offene Nutzerfrage betrifft die Karte, und kein Test prüft sie.
- ÄNDERN: Nur die Zeile `.dstreak-steps b` umsetzen (600, .06em, Farben in Z. 1266/1267 bleiben). Die Zeile `.rules-list li::marker` entfällt, weil aufbau-C11c die Regel löscht.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .tilt-stats .v] Die Werte sind in beiden Spezifikationen gleich (32, ≤960 24, Handy 20). Die Tilt-Regeln schreibt einmal abstaende-D4, direkt mit Tokens: `.tilt-stats .v { font-size: var(--fv-32); font-weight: 700; letter-spacing: var(--ls-val); line-height: var(--lh-val); margin-top: 0; }` ohne font-family: var(--font-display) (Onest kommt über die Sammelregel). Bei ≤960 `.tilt-stats .v { font-size: var(--fv-24); }`. In den Handy-Zeilen `.tilt-stats .v { font-size: var(--fv-20); text-align: right; } .tilt-stats .v small { font-size: var(--fs-12); }`.
- ÄNDERN: Werte als Tokens schreiben: `.tilt-stats .v { font-size: var(--fv-32); font-weight: 700; letter-spacing: var(--ls-val); line-height: var(--lh-val); margin-top: 0; }` ohne font-family; bei ≤960 var(--fv-24); am Handy var(--fv-20), `.v small` var(--fs-12). Dazu `.tilt-stats .k { align-self: end; font-size: var(--fs-12); line-height: var(--lh-12); font-weight: 500; color: var(--muted); }` ohne text-transform und letter-spacing. Mit dem Löschen von `.v.cur` (Z. 1304 und in Z. 1307) auch die Klasse in progress.js:79 entfernen: `class="v cur ${U.cls(tp.afterStreakPnL)}"` → `class="v ${U.cls(tp.afterStreakPnL)}"`.
- [doppelt: .tilt-stats .v.cur] `.tilt-stats .v.cur` wird gelöscht, in Z. 1304 und in Z. 1307 (abstaende-D4). Alle drei Werte sind gleich groß (32/24/20) und stehen über Subgrid auf einer Linie. Die Klasse cur verschwindet auch aus progress.js:79. Die Token-Umstellung der Typografie für .v.cur entfällt.
- ÄNDERN: Werte als Tokens schreiben: `.tilt-stats .v { font-size: var(--fv-32); font-weight: 700; letter-spacing: var(--ls-val); line-height: var(--lh-val); margin-top: 0; }` ohne font-family; bei ≤960 var(--fv-24); am Handy var(--fv-20), `.v small` var(--fs-12). Dazu `.tilt-stats .k { align-self: end; font-size: var(--fs-12); line-height: var(--lh-12); font-weight: 500; color: var(--muted); }` ohne text-transform und letter-spacing. Mit dem Löschen von `.v.cur` (Z. 1304 und in Z. 1307) auch die Klasse in progress.js:79 entfernen: `class="v cur ${U.cls(tp.afterStreakPnL)}"` → `class="v ${U.cls(tp.afterStreakPnL)}"`.
- [doppelt: .tilt-stats .k] Endstand: `.tilt-stats .k { align-self: end; font-size: var(--fs-12); line-height: var(--lh-12); font-weight: 500; color: var(--muted); }` ohne Versalien und ohne Laufweite. Die Texte bleiben. abstaende-D4 schreibt die Regel; kilook-B6 hat dieselben Werte, nur ohne align-self (das braucht das Subgrid).
- ÜBERNIMMT kilook-B6: 12px/500/--muted ohne Versalien schreibt abstaende-D4 (mit Tokens und align-self: end).

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: U.tile] (1) Statistik → Tage (aufbau-C14d): Die Kacheln folgen der Farb- und Vorzeichenregel. „Gewinntage / Verlusttage“ wird nur bei > 0 gefärbt (`<span class="${ds.winDays ? 'pos' : ''}">…</span> / <span class="${ds.lossDays ? 'neg' : ''}">…</span>`, farbe-C30). „Ø Gewinntag“ wird `U.pnl(ds.avgWinDay)`, „Ø Verlusttag“ `U.pnl(ds.avgLossDay)`: Ergebnisse tragen ein Vorzeichen (kilook Z5b), avgLossDay ist negativ. Die Karte „P&L nach Wochentag“ entfällt mit aufbau-C14d und damit auch wording 10.3. (2) Statistik → Fehler: Kachel 1 behält das Vorzeichen `fmt.cur(mr.cost, { signed: true })`, die Klasse richtet sich nach dem Vorzeichen (neg/pos/neu). Die Beschriftung wechselt nach wording zwischen „Fehler haben gekostet“ und „Fehler haben eingebracht“. farbe K13 („Disziplin-Kosten überall mit Vorzeichen“, ausdrücklich auch für Statistik → Fehler) und kilook Z5b gehen vor; die Prüfzeile in wording (stats_mistakes.png) lautet dann „mit Minus“. (3) Affiliate: Die Kacheln behalten die Cent, kein moneyK (Begründung unter fmt.balance). Die Begriffe aus wording 13.3–13.7 bleiben, die Kachel „Creator“ entfällt (aufbau-C3). (4) Schatten-Ich, Kachel „Echt“: Fuß mit U.count. (5) Prop-Summe siehe summaryTiles, Monte Carlo siehe fmt.cur. Verträglich sind farbe-C27, wording 12.28, wording-S11.6-11.11 und wording-S15.10-15.15.
- ÄNDERN: `{ foot: `${U.count(p.n, 'Trade', 'Trades')} im Zeitraum` }`.

## abstaende-I3 · Schatten-Ich: Untertitel (Zeitraum) an der Karte „Regelverstöße“ streichen

Gruppe abstaende · Cluster training · Aufwand S · Befunde: bereich_training-25
Quelle: audit/spec/abstaende.md Z. 423–424 · Dateien: web/js/screens/shadow.js
Abhängig von: —

```text
| I3 | Z. 120 | in `U.card('Regelverstöße', …, { sub: esc(pd.label), info: … })` die Option `sub: esc(pd.label), ` streichen | bereich_training-25 |

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: U.card] (1) Statistik-Kurve: Platz und Titel folgen aufbau-C14b, also erste Karte in „Übersicht“, Titel „Kumulierter Netto-P&L“, h240, ohne Legende; über dem Inhalt stehen nur die Reiter. Der Inhalt folgt diagramme-G1/A-14: ein Punkt je Handelstag, kein fillDays. „Nur mit abgeschlossenen Trades“ ist durch die Leer-Prüfung am Anfang von tabSummary erfüllt (zustaende-S-ST2). zustaende-S-ST1 entfällt, fillDays löscht diagramme-G2. (2) Tagesansicht, Kennzahlenkarte: nur mit Trades, die Spark nur mit abgeschlossenen Trades (zustaende-S-DY2). Gewinner und Verlierer werden nur bei > 0 gefärbt, das setzt farbe-C20 einmal um. (3) Fortschritt: Die Karte heißt „Regeltreue“ (wording 8.6) und hat den Inhalt aus kilook-C18 („—“ ohne Grundlage, Ring nur mit Wert). Die Prüflisten (aufbau Prüfung Z. 750, README in kilook-C28) nennen „Regeltreue“. (4) „Aktuelle Regeln“ entfällt (siehe #/settings/regeln), die Tage-Tabelle steht in „Tage im Detail“ (siehe .tbl-wrap.inset). Verträglich sind aufbau-B8 (h2), abstaende-I3, komponenten-S-prop-c, wording-S10.1-10.7 und wording-S11.6-11.11.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .mentor-note] .mentor-note steht künftig nur noch für die Coach-Notiz. Der KI-Hinweis im Mentor-Chat wird zu `.mentor-disclaimer`: mentor.js Z. 85 `<div class="mentor-disclaimer small">…</div>` (komponenten-S-mentor-a) und app.css Z. 2363 `.mentor-disclaimer { padding: 0 18px 12px; color: var(--muted); }` (komponenten-C31). Dazu kommen `.mentor` → `.mentor-chat` in Z. 2344/2364 und `card mentor` → `card mentor-chat` in Z. 81. Damit ist das Ziel von farbe-C21 (Hinweis in --muted statt --faint) erreicht, ohne Klasse `muted`. kilook-B3 läuft unverändert: Selektor `.mentor-notes > .mentor-note`, Fläche --surface-2, Rand --border, ::before gelöscht. Heute bekommt der KI-Hinweis wegen der gleichen Klasse die gelbe Notizfläche samt Streifen, weil Z. 2884/2885 nach Z. 2363 stehen. Beide Schritte beheben das, die Reihenfolge ist egal. coachtest.js:84/153 (`.coach-entry … .mentor-note`) bleibt gültig.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .mentor-note] .mentor-note steht künftig nur noch für die Coach-Notiz. Der KI-Hinweis im Mentor-Chat wird zu `.mentor-disclaimer`: mentor.js Z. 85 `<div class="mentor-disclaimer small">…</div>` (komponenten-S-mentor-a) und app.css Z. 2363 `.mentor-disclaimer { padding: 0 18px 12px; color: var(--muted); }` (komponenten-C31). Dazu kommen `.mentor` → `.mentor-chat` in Z. 2344/2364 und `card mentor` → `card mentor-chat` in Z. 81. Damit ist das Ziel von farbe-C21 (Hinweis in --muted statt --faint) erreicht, ohne Klasse `muted`. kilook-B3 läuft unverändert: Selektor `.mentor-notes > .mentor-note`, Fläche --surface-2, Rand --border, ::before gelöscht. Heute bekommt der KI-Hinweis wegen der gleichen Klasse die gelbe Notizfläche samt Streifen, weil Z. 2884/2885 nach Z. 2363 stehen. Beide Schritte beheben das, die Reihenfolge ist egal. coachtest.js:84/153 (`.coach-entry … .mentor-note`) bleibt gültig.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .pg-nav] Der Seitenwähler im TradeLog (trades.js:48) wird in einem Durchgang geschrieben. „Trades pro Seite“ steht immer. Bei pages > 1: pg-sep, pg-info `{from}–{to} von {n} Trades` (Halbgeviertstrich ohne Leerzeichen, Schlüssel „{0}–{1} von {2} Trades“), grow, Seitenauswahl „von N Seiten“ und `.pg-nav` mit Knöpfen `class="btn nav"`. Bei pages ≤ 1 gibt es weder Seitenauswahl noch .pg-nav. Ohne aktiven Filter folgt `<span class="pg-sep"></span><span class="pg-info">${U.count(rows.length, 'Trade', 'Trades')}</span>`, mit aktivem Filter nichts weiter, weil die Zahl dann im Zähler „{x} von {y} Trades“ der Filterzeile steht (der nur bei aktivem Filter erscheint, zustaende-S-T2). Begründung: eine Information an genau einer Stelle (Aufbau-Grundsatz 1), Zähler nur über U.count (Wortwahl W9). Das Schatten-Ich (komponenten-S-shadow) folgt derselben Regel: .btn.nav, Seitenwahl nur bei mehreren Seiten, „1–10“.
- [konflikt: .pager] Eine Fassung für beide Seitenwähler, komponenten-S-trades-c übernimmt den TradeLog. In renderTable: const active = !!(f.q || f.symbol || f.setup || f.status || f.mistake); Zähler oben nur mit Filter: ${active ? `<span class="muted small tl-count">${rows.length} von ${U.count(list.length, 'Trade', 'Trades')}</span>` : ''}. Seitenwähler: „Trades pro Seite“ steht immer. Bei pages > 1 folgen <span class="pg-sep"></span><span class="pg-info">${from + 1}–${to} von ${U.count(rows.length, 'Trade', 'Trades')}</span><span class="grow"></span>, die Seitenauswahl „von ${pages} Seiten“ und .pg-nav mit zwei .btn.nav. Bei pages <= 1 folgt nur ohne aktiven Filter <span class="pg-sep"></span><span class="pg-info">${U.count(rows.length, 'Trade', 'Trades')}</span>, sonst nichts. Grund: Mit Filter zeigt der Zähler oben schon „x von y“; ein zweites „1–7 von 7 Trades“ unten wäre dieselbe Information zweimal (aufbau, Grundsatz 1). Bereichsstrich ohne Leerzeichen „1–10“ (komponenten WORTWAHL). Zähler über U.count (wording W9). Schatten-Ich gleich: bei einer Seite pg-info ${U.count(list.length, 'Verstoß', 'Verstöße')}, sonst „{0}–{1} von {2} Verstößen“. Teil 3 von zustaende-S-T2 (Box schrumpft) wartet weiter auf zustaende-37. typografie-3.2.3l (Z. 1744 Token) passt dazu.
- ÄNDERN: Bei pages <= 1: pg-sep + <span class="pg-info">${U.count(list.length, 'Verstoß', 'Verstöße')}</span> statt „1–n von n Verstößen“. Sonst wie spezifiziert (.btn.nav, Auswahl und Pfeile nur bei mehreren Seiten, „{0}–{1} von {2} Verstößen“).

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .trend] Beide Schritte ändern dieselben Zeilen in progress.js (20, 58, 59, 68, 69). aufbau-C11a trägt, die Leerzustände kommen aus zustaende-S-PR1. Endfassung: Z. 20 const arrow = (dir, tip = '') => dir > 0 ? `<span class="trend up" aria-label="steigend"${tip ? ` data-tip="${esc(tip)}"` : ''}>${I.arrowUp}</span>` : dir < 0 ? `<span class="trend down" aria-label="fallend"${tip ? ` data-tip="${esc(tip)}"` : ''}>${I.arrowDown}</span>` : ''; · Z. 58 pct löschen · Z. 59 const delta = cur.rate != null && prev && prev.rate != null ? Math.round((cur.rate - prev.rate) * 100) : 0; const rateDir = Math.sign(delta); Ohne Vorzeitraum gibt es keinen Pfeil, unter einem Prozentpunkt auch nicht; sonst stünde ein Pfeil neben zwei gleich gerundeten Werten. · Z. 68 <div class="big-stat"><span class="${doneN ? '' : 'muted'}">${doneN} / ${items.length}</span></div><div class="small muted">Schritte erledigt</div>. Das ist eine Angabe statt Prozent plus „x von 5“ (aufbau-Grundsatz „eine Information an einer Stelle“); die 0 bleibt eine Zahl und ist gedämpft wie in zustaende K6; kein Pfeil. · Z. 69 <span>${cur.rate == null ? '<span class="muted">—</span>' : fmt.pct(cur.rate)}</span>${arrow(rateDir, `${delta > 0 ? '+' : '−'}${Math.abs(delta)} ${Math.abs(delta) === 1 ? 'Prozentpunkt' : 'Prozentpunkte'} zum Vorzeitraum`)}. Der Tooltip nennt die Änderung, die der Pfeil anzeigt, statt „Vorzeitraum: 80 %“; das Minus ist U+2212. Neue Texte „Schritte erledigt“, „{0} Prozentpunkte zum Vorzeitraum“ und „{0} Prozentpunkt zum Vorzeitraum“ kommen in alle fünf Sprachdateien.
- ÜBERNIMMT zustaende-S-PR1: Z. 20, 59, 68 und 69 setzt aufbau-C11a in der Endfassung um; enthalten sind „—“ in .muted ohne Daten und .muted bei 0 erledigten Schritten. In zustaende.md anpassen: Prüfpunkt 18 (leer_progress) → „Heutiger Fortschritt“ = „0 / 5“ in --muted. Glossarzeile Z. 133 und K6 → Tooltip „{0} Prozentpunkte zum Vorzeitraum“ und „Heutiger Fortschritt“ als „{n} / 5“.
- [konflikt: .big-stat] `.big-stat` bleibt die Hero-Klasse und gilt nur noch im Fortschritt (Serie, Heutiger Fortschritt, % Regeln eingehalten). CSS wie in der Typografie geplant: `font-size: var(--fv-44); letter-spacing: var(--ls-hero); line-height: var(--lh-val);` ohne font-family, bei ≤960 var(--fv-32) (typografie-3.2.2h, fv44, fv32 unverändert). Das Challenge-Widget nutzt `.score-big` (32 px) statt `.big-stat` (siehe Anker widget:challenge). Der Payout-Vorschlag nutzt `.prop-sugg-val` auf --tile-val (aufbau-C12e). Grund: Die Aufbau-Regel sagt „.big-stat 44 px nur Fortschritt und Serie“; W5 hätte das Challenge-Widget ohne die Inline-Größe auf 44 px aufgeblasen. progress.js Z. 69 ändern aufbau-C11a (Pfeil mit Tooltip) und kilook-C18 („—“, Ring und ring-card nur mit Wert) gemeinsam in derselben Zeile; keiner überschreibt den anderen. Den Inhalt von Z. 68 und den Tooltip-Text des Pfeils entscheidet der Anker .trend.
- VERBINDLICH (Kreuzprüfung): progress.js auf diese Endfassung bringen. Der Schritt enthält zustaende-S-PR1; Z. 69 teilt er sich mit kilook-C18, beide stellen dieselbe Zeile her. Z. 20: `const arrow = (dir, tip = '') => dir > 0 ? `<span class="trend up" aria-label="steigend"${tip ? ` data-tip="${esc(tip)}"` : ''}>${I.arrowUp}</span>` : dir < 0 ? `<span class="trend down" aria-label="fallend"${tip ? ` data-tip="${esc(tip)}"` : ''}>${I.arrowDown}</span>` : '';`. Z. 57: `const pct = Math.round(doneN / items.length * 100);` löschen; doneN bleibt. Z. 59: `const delta = cur.rate != null && prev && prev.rate != null ? Math.round((cur.rate - prev.rate) * 100) : 0; const rateDir = Math.sign(delta);`. Ohne Vorzeitraum und unter einem Prozentpunkt gibt es keinen Pfeil. Z. 68, Karte „Heutiger Fortschritt“: `<div class="big-stat"><span class="${doneN ? '' : 'muted'}">${doneN} / ${items.length}</span></div><div class="small muted">Schritte erledigt</div>`. Dort gibt es keinen Pfeil, kein „Keine Daten“ und kein „x von y Schritten erledigt“. Z. 69 Endfassung: `${U.card('% Regeln eingehalten', `<div class="big-stat"><span>${cur.rate == null ? '<span class="muted">—</span>' : fmt.pct(cur.rate)}</span>${arrow(rateDir, `${delta > 0 ? '+' : '−'}${Math.abs(delta)} ${Math.abs(delta) === 1 ? 'Prozentpunkt' : 'Prozentpunkte'} zum Vorzeitraum`)}</div><div class="small muted">…unverändert…</div>${cur.rate == null ? '' : `<div class="ring-abs">${ringArc(cur.rate)}</div>`}`, { info: '…unverändert…', cls: cur.rate == null ? '' : 'ring-card' })}`. Das Minus ist U+2212. Die neuen Texte „Schritte erledigt“, „{0} Prozentpunkte zum Vorzeitraum“ und „{0} Prozentpunkt zum Vorzeitraum“ kommen in js/lang/{en,es,hi,pt,zh}.js. In zustaende.md anpassen: Prüfpunkt 18 (leer_progress) → „Heutiger Fortschritt“ = „0 / 5“ in --muted; Glossarzeile Z. 133 und K6 → Tooltip „{0} Prozentpunkte zum Vorzeitraum“ und „{n} / 5“.

## aufbau-C11b · Fortschritt: Checkliste mit „Regeln anlegen/bearbeiten“, Karte „Aktuelle Regeln“ weg

Gruppe aufbau · Cluster training · Aufwand S · Befunde: bereich_training-10, bereich_training-5, aufbau-10
Quelle: audit/spec/aufbau.md Z. 550–552 · Dateien: web/js/screens/progress.js
Abhängig von: —

```text
- Z. 73 Leerzustand der Checkliste: `<div class="dashed">Noch keine Regeln. Lege unter Einstellungen …</div>` → `<div class="dashed row between"><span>Noch keine Regeln.</span><a class="btn sm" href="#/settings/regeln">Regeln anlegen</a></div>`
- Z. 75 `trailing` der Tages-Checkliste: `<a class="btn sm" href="#/day/${todayKey}">Tag ansehen</a>` → `${rules.length ? '<a class="btn sm" href="#/settings/regeln">Regeln bearbeiten</a>' : ''}<a class="btn sm" href="#/day/${todayKey}">Tag ansehen</a>`
- Z. 77 Karte „Aktuelle Regeln“ ersatzlos löschen. `.prog-side` enthält danach „Disziplin pro Woche“ und „Dein Tilt-Profil“ (`cls: 'fill'` bleibt)
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: #/settings/regeln] Alle Wege zu den Regeln führen auf #/settings/regeln. Doppelt umgesetzte Stellen: Widget-Leertext → aufbau-C2a (zustaende-S-W5 siehe widget:regel_tracker), Tagesansicht day.js:18 → aufbau-C7c. Fortschritt: Die Karte „Aktuelle Regeln“ entfällt (aufbau-C11b). Die Regeln stehen schon als Tages-Checkliste daneben, und eine Information gehört an eine Stelle. Ihr Kopf-Knopf wandert in die Tages-Checkliste: `trailing: `<a class="btn sm" href="#/settings/regeln">${rules.length ? `${I.edit} Regeln bearbeiten` : `${I.plus} Regeln anlegen`}</a><a class="btn sm" href="#/day/${todayKey}">Tag ansehen</a>``. Der Leerzustand der Checkliste ist `<div class="dashed">Noch keine Regeln angelegt.</div>` ohne Knopf: zustaende verlangt für .dashed einen Satz ohne Knopf, für jede Aktion gibt es ein Bedienelement, und der Satz folgt dem Glossar. zustaende-S-PR3 Z. 78 (Wochen-Diagramm nur mit Daten) bleibt.
- ÄNDERN: Z. 73: Leerzustand wird `<div class="dashed">Noch keine Regeln angelegt.</div>`, ohne row between und ohne Knopf. Z. 75: trailing wie in der Entscheidung, ein Knopf für Anlegen/Bearbeiten mit I.plus bzw. I.edit plus „Tag ansehen“. Z. 77: Die Karte wird gelöscht wie spezifiziert; die dann ungenutzten .rules-list-Regeln in app.css mit löschen.
- [doppelt: .dashed] komponenten-S-dashboard-b setzt die leere Dashboard-Vorlage (dashboard.js:53) einmal um: `<div class="dashed dash-empty">…</div>` ohne Inline-Stil, CSS `.dash-empty { text-align: center; padding: var(--sp-8); }` (32 px aus der Abstandsskala, siehe komponenten-C36 unter .kpi-label). .dashed bleibt ein Satz ohne Knopf (Fortschritt siehe #/settings/regeln). typografie-3.2.3l stellt nur die Schriftgröße auf das Token um.

## aufbau-C11c · Fortschritt: Trading-Aktivität unter die Checkliste, Kommentare, .rules-list löschen

Gruppe aufbau · Cluster training · Aufwand S · Befunde: bereich_training-11, bereich_training-10
Quelle: audit/spec/aufbau.md Z. 553–556 · Dateien: web/js/screens/progress.js, web/css/app.css
Abhängig von: aufbau-C11b

```text
- Reihenfolge: Den Block `${U.card('Trading-Aktivität', …)}` (Z. 71, samt `trailing`) hinter das schließende `</div>` von `.grid.two.prog-split` und vor `Regeln im Detail` (Z. 82) setzen
- Kommentare Z. 1 und Z. 65 anpassen („rechts Disziplin und Tilt-Profil“, „darunter Trading-Aktivität und Regeln im Detail“)
- `web/css/app.css` Z. 1273–1274 (`.rules-list`, `.rules-list li::marker`) löschen

```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .rules-list li::marker] aufbau-C11b/C11c löschen die Karte „Aktuelle Regeln“ (progress.js:77, die einzige Stelle mit .rules-list) und die Regeln .rules-list und .rules-list li::marker (app.css 1273–1274). Damit gibt es keinen Listenmarker mehr, den man umfärben könnte. farbe-C2 sieht diesen Fall selbst vor („entfällt, falls Aufbau die Karte löscht“). Keine offene Nutzerfrage betrifft die Karte, und kein Test prüft sie.
- [konflikt: .rules-list] Die Karte „Aktuelle Regeln“ verschwindet aus dem Fortschritt (aufbau, eine Information an einer Stelle). Damit hat .rules-list keinen Nutzer mehr (einziger: progress.js:77), und aufbau-C11c löscht die Regeln Z. 1273–1274. typografie-3.2.3p setzt in Z. 1273 kein Token.
