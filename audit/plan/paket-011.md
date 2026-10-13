# Paket 011 · aufbau, shell

Schritte: 10 · Dateien: web/css/app.css, web/css/landing.css, web/index.html, web/js/app.js, web/js/screens/dashboard.js
Betroffene Tests laut Spezifikation: prüfen: e2e/motiontest.js:72–74 (6 × .feat-card.rv, sichtbar nach Scrollen); prüfen: e2e/motiontest.js:72–74 (weiter 6 × .feat-card); web/e2e/coachtest.js (muss grün bleiben); web/e2e/headtest.js:69; web/e2e/mobiletest.js:18; web/e2e/mobiletest.js:39-40 (bleibt grün)
Baut auf Paketen auf: 2, 9, 10

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## aufbau-B1 · pageHead: leere Kopfreihe nicht rendern, newTradeButton mit Tooltip, head als Funktion

Gruppe aufbau · Cluster shell · Aufwand M · Befunde: bereich_einstellungen-3, responsiv-18, ki_look-22, bereich_konto-25, responsiv-19, bereich_trades_tag-16, hierarchie-7, hierarchie-19
Quelle: audit/spec/aufbau.md Z. 300–316 · Dateien: web/js/app.js
Abhängig von: —

```text
### B – Komponenten

**B1 `pageHead` und `newTradeButton`** (`web/js/app.js` Z. 253–262) · bereich_einstellungen-3, responsiv-18, ki_look-22, bereich_konto-25, responsiv-19, bereich_trades_tag-16, hierarchie-7, hierarchie-19
```js
newTradeButton(tip) { return `<button type="button" class="btn accent tl" data-action="new-trade"${tip ? ` data-tip="${esc(tip)}"` : ''}>${I.plus}<span>Trade loggen</span></button>`; },
pageHead(screen, ctx) {
  const sh = typeof screen.head === 'function' ? screen.head(ctx) : screen.head;
  const h = Object.assign({ range: true, account: true, session: true, trade: true, note: '', tradeTip: '' }, sh);
  const own = screen.actions ? screen.actions(ctx) : '';
  const left = /* unverändert */;
  const right = `${own}${h.session ? this.sessionControl(true) : ''}${h.trade ? `${own || h.session ? '<span class="dh-sep" aria-hidden="true"></span>' : ''}${this.newTradeButton(h.tradeTip)}` : ''}`;
  if (!left && !right) return ''; /* keine leere Kopfreihe (Einstellungen, Coach) */
  return /* unverändert */;
},
```
Kommentar über `pageHead` ergänzen: „screen.head darf eine Funktion von ctx sein (Trade-Ansicht, Tagesansicht)“. Das Dashboard ruft `App.newTradeButton()` ohne Argument auf und bleibt unverändert.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: App.pageHead] aufbau-B1 schreibt pageHead und newTradeButton neu und nimmt die Teile der anderen Schritte auf. Endzustand: `const sh = typeof screen.head === 'function' ? screen.head(ctx) : screen.head; const h = Object.assign({ range: true, account: true, session: true, trade: true, note: '', tradeTip: '' }, sh);`. In `left` steht `this.accountControl({ mobile: !h.range, iconM: !!h.range })` (responsiv-3.3a), danach wie heute `ctx.headLeft` und der Hinweis. In `right` steht `this.sessionControl()` ohne Argument (komponenten-A4); B1 lässt dort fälschlich noch `(true)` stehen. Vor dem return kommt `if (!left && !right) return '';`; das steht in B1 und abstaende-E1 gleich, also doppelt. abstaende-E-day2 setzt nur `ctx.headLeft` und passt ohne Änderung, weil pageHead headLeft nach dem Konto einsetzt. Mentor ohne Server nutzt die Funktionsform von head (siehe Anker screen.head).
- ÜBERNIMMT abstaende-E1: Der frühe Rücksprung `if (!left && !right) return '';` ist in aufbau-B1 enthalten.
- ÄNDERN: In `left` `this.accountControl({ mobile: !h.range, iconM: !!h.range })` statt „unverändert“, in `right` `this.sessionControl()` ohne Argument statt `this.sessionControl(true)`. Der Kommentar nennt zusätzlich den Mentor als Seite, deren head eine Funktion ist.
- [konflikt: App.sessionControl] Die Signatur aus komponenten-A4 gilt: Parameter `iconOnly` entfällt. Damit gibt es eine Bauart, die ab 1181 px Text zeigt und darunter nur das Symbol (`.lbl-wide`); `hide-m` blendete den ganzen Knopf am Handy aus. Endzustand: Zweig mit Session `<button type="button" class="btn" data-action="end-session" aria-label="Session beenden" aria-describedby="session-timer" title="Session beenden">${I.stop}<span id="session-timer">…</span></button>` (P9). Zweig ohne Session `<button type="button" class="btn" data-action="start-session" title="Session starten" aria-label="Session starten">${I.play}<span class="lbl-wide">Session starten</span></button>` (A4). Der Aufruf in pageHead lautet `this.sessionControl()` (aufbau-B1 entsprechend ändern, siehe App.pageHead). P9 und A4 berühren verschiedene Zweige und ergänzen sich.
- ÄNDERN: In `right` `this.sessionControl()` ohne Argument (Signatur aus komponenten-A4).
- [konflikt: screen.head] Ein Mechanismus für bedingte Kopfreihen: `screen.head` darf eine Funktion von ctx sein (aufbau-B1, auch für Trade-Ansicht und Tagesansicht). Ein Getter würde zwar auch funktionieren, wäre aber eine zweite Schreibweise für dasselbe. Mentor: `head() { return configured() ? { range: false, session: false, trade: false, note: 'Der Mentor sieht die letzten 20 Trades dieses Kontos.' } : { range: false, account: false, session: false, trade: false }; }`. Ohne Server bleiben left und right leer, pageHead liefert '' (B1).

## responsiv-3.6 · Dashboard: Konto-Knopf mit iconM

Gruppe responsiv · Cluster shell · Aufwand S · Befunde: bereich_dashboard-4
Quelle: audit/spec/responsiv.md Z. 473–476 · Dateien: web/js/screens/dashboard.js
Abhängig von: responsiv-3.3a, responsiv-B3

```text
### 3.6 web/js/screens/dashboard.js (bereich_dashboard-4)

- Z. 124 `${App.accountControl()}` → `${App.accountControl({ iconM: true })}`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: App.accountControl] Die Schritte ergänzen sich. Einzige Doppelung: Der Link „Konten verwalten“ → `#/settings/konten` steht in aufbau-B5 und in zustaende-S-A2, umgesetzt wird er in S-A2. Endzustand app.js:243–244: `const show = o.mobile || accounts.length > 1`; Wrapper `popwrap${show ? '' : ' hide-m'}${o.iconM ? ' acc-iconm' : ''}` (3.3a). Der Auslöser bekommt zusätzlich `aria-label="Konto: ${esc(accName)}"`; der Name endet mit dem sichtbaren Wort, damit ist WCAG 2.5.3 erfüllt. Im Popover umschließt `<div role="radiogroup" aria-label="Konto">` die Einträge „Alle Konten“ (nur bei mehr als einem Konto) und die Konten, jeder davon `role="radio"` (P11). aria-checked: für „Alle Konten“ `!acc || acc === 'all'`, für ein Konto `acc === a.id || ((!acc || acc === 'all') && accounts.length === 1)` (S-A2). So ist in jeder Lage genau ein Radio gewählt, denn „Alle Konten“ wird bei einem einzigen Konto nicht gerendert. Vor dem Namen steht `<span class="chk">${on ? I.check : ''}</span>`, `on` ist derselbe Ausdruck wie aria-checked (A3). Der Betrag bekommt `title="Kontogröße"`. Danach folgen außerhalb der Gruppe `<hr>` und `<a class="item" href="#/settings/konten">${I.settings} Konten verwalten</a>`. Das Dashboard ruft `App.accountControl({ iconM: true })` auf (3.6). Den pageHead-Teil von 3.3a regelt der Anker App.pageHead.

## bewegung-B3 · Navigation: kein Versatz beim Darüberfahren, kein :active

Gruppe bewegung · Cluster shell · Aufwand S · Befunde: bewegung-17, bereich_shell-19, komponenten-13
Quelle: audit/spec/bewegung.md Z. 179–184 · Dateien: web/css/app.css
Abhängig von: —

```text
**B3 Navigation** (bewegung-17, bereich_shell-19, komponenten-13)
- Z. 172: `, transform var(--dur-2) var(--ease)` aus der `transition` streichen.
- Z. 176 → `.nav a:hover, .nav button:hover { background: var(--surface-2); color: var(--text); }`
- Z. 177 (`.nav a:active, .nav button:active { … }`) löschen.
- Z. 182 (`.nav a.active:hover { transform: none; }`) löschen.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: .nav a] Alle fünf Schritte gelten und landen in einer Regel. Der Selektor heißt nur noch `.nav a` (kilook-C1a, `.nav` enthält laut app.js:210 keine `<button>`). Z. 169–173 danach: `gap: var(--sp-3)` (A9), `font-size: var(--fs-14); line-height: var(--lh-14)` (3.2.3n), `transition` ohne `, transform var(--dur-2) var(--ease)` (B3), dazu der Kommentar „Maße gemeinsam mit .boot-sb pflegen“ (S-C19). `.nav a:hover { background: var(--surface-2); color: var(--text); }`; kein `:active` und kein `.nav a.active:hover`. Folge fürs Skelett: Mit 14/20 statt 14,5 × 1,45 ist ein Eintrag 38 statt 39 px hoch (8 + 20 + 8 + 2 Rand), das Raster der Leiste also 41 statt 42 px (Dichte-Stufen: 34/32 px). Deshalb kommt S-C19 erst nach 3.2.3n und nimmt die Werte aus dem Anker `.boot-sb`. Die responsiv-Prüfung „Zeilenhöhe .nav a 39 px (± 1)“ ist mit 38 erfüllt, die Gewichtsregel (Navigation 500) bleibt.
- [konflikt: .nav button] `.nav button` fällt aus allen Selektorlisten (kilook-C1a; kein Element im Markup, grep app.js:210). A9, B3 und 3.2.3n setzen ihre Werte nur an `.nav a`. Wichtig: B3 schreibt Z. 176 laut Spezifikation als `.nav a:hover, .nav button:hover { … }`. Das würde den toten Selektor zurückbringen, egal in welcher Reihenfolge umgesetzt wird. Ergebnis: `.nav a:hover { background: var(--surface-2); color: var(--text); }`. Gilt ebenso für Z. 149/155 (Dichte), 175 (svg), 195/196 (sb-mini).
- ÄNDERN: Z. 176 als `.nav a:hover { background: var(--surface-2); color: var(--text); }` schreiben, ohne `.nav button:hover`. Transition-Änderung Z. 172 an `.nav a`.
- [konflikt: .nav a:hover] Endstand: `.nav a:hover { background: var(--surface-2); color: var(--text); }` – Werte von B3 (kein Versatz), Selektor von C1a. B3 darf `.nav button:hover` nicht wieder einfügen (siehe Anker .nav button).
- ÄNDERN: Z. 176 nur als `.nav a:hover { background: var(--surface-2); color: var(--text); }` schreiben.
- [konflikt: .nav a:active] Z. 177 wird ganz gelöscht (bewegung H2: Navigation, Karten und Zellen haben keinen Druckzustand; BRIEF „ruhig“). Ein bloß verengtes `.nav a:active { transform: translateX(2px) scale(.98); }` (C1a) bleibt nicht stehen. Z. 182 `.nav a.active:hover { transform: none; }` wird mit B3 ebenfalls gelöscht.

## abstaende-C12 · Breiten: .mentor-wrap stabil 800 (width 100%), .coach-wrap volle Breite mit Varianten .read (920) und .narrow (800 mittig) statt .wide; Kopfreihe an Mentor- und News-Kante binden

Gruppe abstaende · Cluster aufbau · Aufwand M · Befunde: bereich_konto-24, hierarchie-38, zustaende-15
Quelle: audit/spec/abstaende.md Z. 361–361 · Dateien: web/css/app.css
Abhängig von: abstaende-A1, abstaende-A4

```text
| C12 | Breiten Z. 2339, 2849, 2850 | `.mentor-wrap { max-width: 800px; margin: 0 auto; }` → `.mentor-wrap { width: 100%; max-width: var(--w-chat); margin-inline: auto; }`. `.coach-wrap { max-width: 920px; margin: 0 auto; width: 100%; …; gap: 16px; }` → `.coach-wrap { width: 100%; display: flex; flex-direction: column; gap: var(--content-gap); }`. Z. 2850 `.coach-wrap.wide` ersetzen durch `.coach-wrap.read { max-width: var(--w-read); } .coach-wrap.narrow { max-width: var(--w-chat); margin-inline: auto; }`. Neu nach Z. 1338: `.content:has(> .mentor-wrap) > .page-head { width: 100%; max-width: var(--w-chat); margin-inline: auto; } .content:has(> .nw-wrap) > .page-head { width: 100%; max-width: var(--w-news); }` | bereich_konto-24, hierarchie-38, zustaende-15 |
```

## kilook-B8a · Startseite: CSS der Ankündigungsleiste löschen

Gruppe kilook · Cluster aufbau · Aufwand S · Befunde: ki_look-44
Quelle: audit/spec/kilook.md Z. 468–469 · Dateien: web/css/landing.css
Abhängig von: —

```text
**B8 · web/css/landing.css · Startseite** (ki_look-42, ki_look-43, ki_look-44)
- **3** `.lp .ribbon { … }` löschen.
```

## kilook-B8c · Startseiten-Demo: Fensterleiste/Ampelpunkte löschen, aktiver Eintrag neutral

Gruppe kilook · Cluster aufbau · Aufwand S · Befunde: ki_look-43
Quelle: audit/spec/kilook.md Z. 472–474 · Dateien: web/css/landing.css
Abhängig von: —

```text
- **21–23** löschen (die drei Regeln `.lp .shot .frame .bar`, `.lp .shot .frame .bar i`, Ampelfarben `#ff5f57/#febc2e/#28c840`).
- **27** vorher `.lp .demo .side div.on { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }`
  → nachher `.lp .demo .side div.on { border-color: var(--border); color: var(--text); background: var(--surface-2); }`
```

## kilook-B8d · Startseite: Funktionen als 2-spaltige Liste, Ablauf ohne Karten, Ziffer statt Kicker (CSS)

Gruppe kilook · Cluster aufbau · Aufwand M · Befunde: ki_look-42
Quelle: audit/spec/kilook.md Z. 475–488 · Dateien: web/css/landing.css
Abhängig von: —

```text
- **35** vorher `.lp .feats { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 14px; }`
  → nachher `.lp .feats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 48px; }`
- **36** vorher `.lp .feat-card { border: 1px solid var(--border); border-radius: 16px; padding: 20px; background: var(--surface); }`
  → nachher `.lp .feat-card { border-top: 1px solid var(--border); padding: 20px 0; }`
- **37–38** `.lp .feat-card .ico { … }` und `.lp .feat-card .ico svg { … }` löschen.
- **39** vorher `.lp .feat-card b { display: block; font-family: var(--font-display); font-size: 16px; margin-bottom: 6px; }`
  → nachher `.lp .feat-card b, .lp .step b { display: block; font-family: var(--font-display); font-size: 16px; font-weight: 600; margin-bottom: 6px; }`
- **41** in `.lp .steps { … }` `gap: 14px` → `gap: 0 48px`.
- **42** vorher `.lp .step { padding: 22px; border-radius: 16px; background: var(--surface-2); border: 1px solid var(--border); }`
  → nachher `.lp .step { padding: 20px 0 0; border-top: 1px solid var(--border); }`
- **43** vorher `.lp .step .k { font-family: var(--font-display); color: var(--accent); font-weight: 800; font-size: 13px; letter-spacing: .1em; margin-bottom: 8px; }`
  → nachher `.lp .step .k { font-family: var(--font-num); color: var(--muted); font-weight: 500; margin-right: 8px; }`
- **44** `.lp .step p { color: var(--text-2); font-size: 14px; margin-top: 6px; }` → `.lp .step p { color: var(--text-2); font-size: 14px; }`
- **47** im Block `@media (max-width: 900px) { … }` ergänzen: `.lp .feats { grid-template-columns: 1fr; }`
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .lp .step .k] Die Ablauf-Nummer wird eine ruhige Ziffer vor dem Titel statt eines Kickers: `.lp .step .k { font-family: var(--font-num); color: var(--muted); font-weight: 500; margin-right: 8px; }` (kilook-B8d), Markup `<b><span class="k">1</span>Session starten</b>` (kilook-C7d). Grund: Die BRIEF verlangt „nichts Dekoratives“, also keinen Versal-Kicker in --accent. 900 wäre für eine Ziffer in einem Titel mit 600 zu laut. Gewicht 900 bleibt nur für die Marke und .lp .hero h1.

## kilook-C7a · Startseite: Ankündigungsleiste aus dem HTML löschen

Gruppe kilook · Cluster aufbau · Aufwand S · Befunde: ki_look-44
Quelle: audit/spec/kilook.md Z. 584–585 · Dateien: web/index.html
Abhängig von: kilook-B8a

```text
**C7 · web/index.html · Startseite** (ki_look-42, ki_look-43, ki_look-44, bereich_shell-35; Z. 11 siehe A5)
- **20** `<div class="ribbon">Neu: Session-Check-in …</div>` löschen.
```

## kilook-C7c · Startseiten-Demo: ohne Fensterleiste, Einträge in App-Reihenfolge, „Trade-Trefferquote“, monotone Kurve

Gruppe kilook · Cluster aufbau · Aufwand M · Befunde: ki_look-43
Quelle: audit/spec/kilook.md Z. 587–595 · Dateien: web/index.html
Abhängig von: kilook-B8c

```text
- **34** `<div class="shot"><div class="frame"><div class="bar"><i></i><i></i><i></i></div><div class="demo">` → `<div class="shot"><div class="frame"><div class="demo">`
- **35** Inhalt von `.side` → `<div class="on">Dashboard</div><div>Statistiken</div><div>Fortschritt</div><div>TradeLog</div><div>Tagesansicht</div><div>Notebook</div><div>News</div>`
- **37** „Netto-P&L“ bleibt (K14).
- **39** `<span>Trade-Win-Rate</span>` → `<span>Trade-Trefferquote</span>`
- **41** beide `d`-Attribute ersetzen:
  - Fläche: `M0,110 C46.7,103.2 93.3,96.3 140,92 C186.7,87.7 233.3,89.3 280,84 C326.7,78.7 373.3,62.2 420,55 C473.3,46.8 526.7,45.1 580,40 C653.3,32.9 726.7,25.5 800,18 L800,130 L0,130 Z`
  - Linie: derselbe Pfad ohne ` L800,130 L0,130 Z`

  Nachgerechnet mit dem d3-Verfahren monotoneX durch dieselben sechs Punkte. Die Kurve steigt überall, statt bei x≈580 einzusacken.
```

## kilook-C7d · Startseite: Symbole aus den Funktionen, „Trefferquote, Profit-Faktor …“, Ablauf mit Ziffer statt „SCHRITT n“

Gruppe kilook · Cluster aufbau · Aufwand S · Befunde: ki_look-42, ki_look-43
Quelle: audit/spec/kilook.md Z. 596–599 · Dateien: web/index.html
Abhängig von: kilook-B8d

```text
- **48–53** in jeder `.feat-card` das `<div class="ico"><svg …>…</svg></div>` löschen. `class="feat-card"`, `<b>` und `<p>` bleiben, damit es weiter 6 `.feat-card` sind.
- **49** „Win-Rate, Profit-Faktor, Erwartungswert …“ → „Trefferquote, Profit-Faktor, Erwartungswert …“
- **57–59** jeweils `<div class="k">SCHRITT 1</div><b>Session starten</b>` → `<b><span class="k">1</span>Session starten</b>`, ebenso für 2 („Trades loggen“) und 3 („Auswerten“).

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .lp .step .k] Die Ablauf-Nummer wird eine ruhige Ziffer vor dem Titel statt eines Kickers: `.lp .step .k { font-family: var(--font-num); color: var(--muted); font-weight: 500; margin-right: 8px; }` (kilook-B8d), Markup `<b><span class="k">1</span>Session starten</b>` (kilook-C7d). Grund: Die BRIEF verlangt „nichts Dekoratives“, also keinen Versal-Kicker in --accent. 900 wäre für eine Ziffer in einem Titel mit 600 zu laut. Gewicht 900 bleibt nur für die Marke und .lp .hero h1.
