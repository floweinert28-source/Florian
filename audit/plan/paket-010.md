# Paket 010 · shell

Schritte: 13 · Dateien: web/app.html, web/css/app.css, web/index.html, web/js/app.js, web/js/screens/dashboard.js
Betroffene Tests laut Spezifikation: prüfen: e2e/sidebartest.js; prüfen: e2e/sidebartest.js:44, e2e/motiontest.js:62–66 (.menu-btn); prüfen: e2e/usercardtest.js:12; prüfen: e2e/usercardtest.js:21–28 (#pop-user .theme-toggle); web/e2e/headtest.js:11-31, :69 (Konto oben rechts, Handy-Kopfreihe ≤ 80 px); web/e2e/headtest.js:30-31 (1000 px: Konto nur Symbol); web/e2e/headtest.js:69; web/e2e/mobiletest.js:18; web/e2e/mobiletest.js:18 (Kopfreihe); web/e2e/mobiletest.js:59-60; web/e2e/mobiletest.js:59-60 (Schublade); web/e2e/motiontest.js:38-39; web/e2e/motiontest.js:62-66 (Schublade öffnen/schließen); web/e2e/proptest.js:19 (kein Zeitraum/Konto); web/e2e/scrolltest.js:8; web/e2e/sidebartest.js (1440×1000 grün); web/e2e/sidebartest.js:44-45 (Handy: nichts ragt rechts über die Schublade); web/e2e/sixtest.js:10, :36 (Mentor-Kopfreihe nur mit Konto); web/e2e/usercardtest.js:21 (Konto-Menü relativ zur Karte); web/e2e/usercardtest.js:55-58 (Handy: Karte nach Scrollen klickbar)
Baut auf Paketen auf: —

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## barrierefreiheit-H2 · Seitenleiste als <nav aria-label="Hauptnavigation"> statt <aside>

Gruppe barrierefreiheit · Cluster shell · Aufwand S · Befunde: bereich_shell-14, barrierefreiheit-49
Quelle: audit/spec/barrierefreiheit.md Z. 525–529 · Dateien: web/app.html
Abhängig von: —

```text
**H2 Landmarke** (Z. 19)
- vorher: `<aside class="sidebar" id="sidebar" aria-label="Navigation">…</aside>`
- nachher: `<nav class="sidebar" id="sidebar" aria-label="Hauptnavigation">…</nav>`
- Befunde: bereich_shell-14, barrierefreiheit-49

```

## barrierefreiheit-P8 · Titelzeile: Menüknopf aria-controls, Avatar aria-label „Profil“, Initialen aria-hidden

Gruppe barrierefreiheit · Cluster shell · Aufwand S · Befunde: barrierefreiheit-40, bereich_shell-15
Quelle: audit/spec/barrierefreiheit.md Z. 625–629 · Dateien: web/js/app.js
Abhängig von: —

```text
**P8 Titelzeile** (`topbar` Z. 265–266)
- Menüknopf: `aria-label="Menü"` → `aria-label="Menü" aria-controls="sidebar"`
- Avatar: `<a class="avatar" href="#/settings/profil" title="Profil">` → `… aria-label="Profil" title="Profil">`. Die Initialen werden zu `<span aria-hidden="true">${esc(initials)}</span>`.
- Befunde: barrierefreiheit-40, bereich_shell-15

```

## barrierefreiheit-P9 · Session-Knopf: Name „Session beenden“, Zeit als Beschreibung (aria-describedby)

Gruppe barrierefreiheit · Cluster shell · Aufwand S · Befunde: barrierefreiheit-39
Quelle: audit/spec/barrierefreiheit.md Z. 630–634 · Dateien: web/js/app.js
Abhängig von: —

```text
**P9 Session-Knopf** (`sessionControl` Z. 249)
- vorher: `<button type="button" class="btn" data-action="end-session" title="Session beenden">`
- nachher: `<button type="button" class="btn" data-action="end-session" aria-label="Session beenden" aria-describedby="session-timer" title="Session beenden">`
- Befunde: barrierefreiheit-39

```

## kilook-C1b · Hell/Dunkel-Schalter: Grundwert margin 0, Sonderregeln und .menu-btn-Reste löschen

Gruppe kilook · Cluster shell · Aufwand S · Befunde: bereich_shell-35
Quelle: audit/spec/kilook.md Z. 515–523 · Dateien: web/css/app.css
Abhängig von: —

```text
- **199** `.theme-toggle { … align-self: flex-start; … margin: 10px 16px 0; … }` → `align-self: flex-start;` streichen, `margin: 10px 16px 0;` → `margin: 0;`
- **Löschen:**
  - **207** `html.sb-mini .theme-toggle { flex-direction: column; align-self: center; margin: 10px 0 0; }`
  - **208** `html.sb-mini[data-theme="light"] .theme-toggle::before { transform: translateY(22px); }`
  - **225–228** `.menu-btn svg path { … }` und die drei `:nth-child`-Regeln
  - **241** der verwaiste Kommentar `/* helles Design: Balken und Punkte … */`
  - **255** `.sb-menu .theme-toggle, html.sb-mini .sb-menu .theme-toggle { margin: 0; flex-direction: row; align-self: auto; }` (jetzt Grundwert)
  - **256** `html.sb-mini[data-theme="light"] .sb-menu .theme-toggle::before { transform: translateX(26px); }` (übernimmt 201)

```

## kilook-C7b · Startseite: Schriftzug Journalyst ohne <em>

Gruppe kilook · Cluster shell · Aufwand S · Befunde: bereich_shell-35
Quelle: audit/spec/kilook.md Z. 586–586 · Dateien: web/index.html
Abhängig von: —

```text
- **22** `<span>Journal<em>yst</em></span>` → `<span>Journalyst</span>`
```

## kilook-C8a · Seitenleiste (app.js): Schriftzug Journalyst ohne <em>

Gruppe kilook · Cluster shell · Aufwand S · Befunde: bereich_shell-35
Quelle: audit/spec/kilook.md Z. 600–601 · Dateien: web/js/app.js
Abhängig von: —

```text
**C8 · web/js/app.js** (bereich_shell-35, barrierefreiheit-43, ki_look-36)
- **210** `<span class="name no-i18n">Journal<em>yst</em></span>` → `<span class="name no-i18n">Journalyst</span>`
```

## kilook-C1a · Shell-CSS: .nav button aus Selektoren, tote Regeln (.nav-sec, .brand em, .sidebar hr, .badge-n) löschen

Gruppe kilook · Cluster shell · Aufwand M · Befunde: bereich_shell-35
Quelle: audit/spec/kilook.md Z. 497–514 · Dateien: web/css/app.css
Abhängig von: kilook-C7b, kilook-C8a

```text
### Phase C · Einzelstellen, nach Datei

**C1 · web/css/app.css · Shell-Reste** (bereich_shell-35; erst nach C7/C8 Teil „Schriftzug“, weil Z. 159 sonst „yst“ kursiv macht)
- **Aus den Selektorlisten nur den `.nav button`-Teil streichen:**
  - **149** `.nav a, .nav button { padding-top: 6px; padding-bottom: 6px; }` → `.nav a { … }`
  - **155** wie 149
  - **169** `.nav a, .nav button {` → `.nav a {`
  - **175** `.nav a svg, .nav button svg` → `.nav a svg`
  - **176** `.nav a:hover, .nav button:hover` → `.nav a:hover`
  - **177** `.nav a:active, .nav button:active` → `.nav a:active`
  - **195** `html.sb-mini .nav a, html.sb-mini .nav button {` → `html.sb-mini .nav a {`
  - **196** `html.sb-mini .nav a span, html.sb-mini .nav button span` → `html.sb-mini .nav a span`
- **Löschen:**
  - **152** `.nav.nav-sec { margin-top: 8px; }` (in `@media … max-height: 1060px`)
  - **159** `.brand em { font-style: normal; color: inherit; }`
  - **163** `.sidebar hr { … }`
  - **165** `.nav.nav-sec { margin-top: 12px; }`
  - **186** `.nav .badge-n { … }`
```

## responsiv-B1 · Seitenleiste Desktop: Dichte-Blöcke hinter die Grundregeln, klebende Konto-Karte

Gruppe responsiv · Cluster shell · Aufwand M · Befunde: responsiv-14, bereich_shell-16
Quelle: audit/spec/responsiv.md Z. 254–260 · Dateien: web/css/app.css
Abhängig von: —

```text
#### B – Komponenten

**B1 Seitenleiste Desktop: Dichte und klebende Konto-Karte** (responsiv-14, bereich_shell-16)
- Z. 146–157 (Kommentar „niedrige Fenster …“ und beide Blöcke `@media (min-width: 961px) and (max-height: 1060px)` / `(max-height: 940px)`) unverändert ausschneiden und direkt nach Z. 187 (`.sidebar .spacer { flex: 1; }`) einfügen, vor „Seitenleiste eingeklappt“.
- Z. 139 `padding: 22px 14px 18px;` → `padding: 22px 14px 0;`
- Z. 232 `.sb-userwrap { margin-top: 10px; flex: 0 0 auto; }` → `.sb-userwrap { position: sticky; bottom: 0; z-index: 1; flex: 0 0 auto; margin-top: 2px; padding: 8px 0 18px; background: var(--bg-2); } /* Konto-Karte bleibt sichtbar, die Navigation scrollt darunter */`

```

## responsiv-B2 · Schublade ≤ 960 px: Safe Area, visibility nach Animation, Schließen-Knopf 40×40, Dichte bei niedriger Höhe

Gruppe responsiv · Cluster shell · Aufwand M · Befunde: bereich_shell-16, responsiv-15, barrierefreiheit-30, bereich_shell-31
Quelle: audit/spec/responsiv.md Z. 261–268 · Dateien: web/css/app.css
Abhängig von: responsiv-B1

```text
**B2 Schublade (≤ 960 px)** (bereich_shell-16, responsiv-15, barrierefreiheit-30, bereich_shell-31)
- Z. 918 `.sidebar { position: fixed; …; transform: translateX(-102%); transition: transform var(--dur-2) var(--ease); …}` → in derselben Regel ergänzen bzw. ändern: `padding: calc(22px + env(safe-area-inset-top, 0px)) 14px 0 calc(14px + env(safe-area-inset-left, 0px)); visibility: hidden; transition: transform var(--dur-2) var(--ease), visibility 0s linear var(--dur-2);`
- Z. 920 `.sidebar.open { transform: none; }` → `.sidebar.open { transform: none; visibility: visible; transition: transform var(--dur-2) var(--ease), visibility 0s; }`
- Im selben Block neu: `.sidebar .sb-userwrap { padding-bottom: calc(18px + env(safe-area-inset-bottom, 0px)); }` und `.brand .sb-toggle { width: 40px; height: 40px; margin-right: -6px; }`
- Direkt nach dem Block (nach Z. 944) neu:
  `@media (max-width: 960px) and (max-height: 940px) { .sidebar .nav.nav-group + .nav.nav-group { margin-top: 16px; } .sidebar .brand { padding-bottom: 14px; } }`
  Die Innenabstände der Einträge (`.nav a` 8 px oben/unten) bleiben.

```

## responsiv-B3 · Konto-Knopf: Name max. 180 px, Handy-Symbolknopf über .acc-iconm

Gruppe responsiv · Cluster shell · Aufwand S · Befunde: bereich_dashboard-4, responsiv-1, zustaende-29
Quelle: audit/spec/responsiv.md Z. 269–275 · Dateien: web/css/app.css
Abhängig von: —

```text
**B3 Konto-Knopf** (bereich_dashboard-4, responsiv-1, zustaende-29)
- Nach Z. 1332 global: `[data-pop="account"] > span { max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }`
- Im Block ≤ 560 px neu:
  `.acc-iconm > [data-pop="account"] { width: 40px; padding-left: 0; padding-right: 0; }`
  `.acc-iconm > [data-pop="account"] > span { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }`
  `.acc-iconm > [data-pop="account"] .caret { display: none; }`

```

## responsiv-3.3a · Konto-Knopf: Sichtbarkeit bei mehr als einem Konto, Option iconM, aria-label (accountControl, pageHead)

Gruppe responsiv · Cluster shell · Aufwand S · Befunde: bereich_dashboard-4, responsiv-1
Quelle: audit/spec/responsiv.md Z. 419–429 · Dateien: web/js/app.js
Abhängig von: responsiv-B3

```text
### 3.3 web/js/app.js

- Z. 243–244 `accountControl(o = {})` (bereich_dashboard-4, responsiv-1):
  vorher `return \`<div class="popwrap${o.mobile ? '' : ' hide-m'}"><button type="button" class="btn" data-pop="account" title="Konto: ${esc(accName)}">…`
  nachher
  ```js
  const show = o.mobile || accounts.length > 1; /* unter 961px nur, wenn es etwas zu wechseln gibt oder die Seite keinen Zeitraum hat */
  return `<div class="popwrap${show ? '' : ' hide-m'}${o.iconM ? ' acc-iconm' : ''}"><button type="button" class="btn" data-pop="account" title="Konto: ${esc(accName)}" aria-label="Konto: ${esc(accName)}">…`
  ```
  Kommentar Z. 241 anpassen: „o.mobile: auch bei nur einem Konto unter 961px zeigen; o.iconM: am Handy nur als Symbol“.
- Z. 259 `pageHead`: `this.accountControl({ mobile: !h.range })` → `this.accountControl({ mobile: !h.range, iconM: !!h.range })`
```

## responsiv-3.6 · Dashboard: Konto-Knopf mit iconM

Gruppe responsiv · Cluster shell · Aufwand S · Befunde: bereich_dashboard-4
Quelle: audit/spec/responsiv.md Z. 473–476 · Dateien: web/js/screens/dashboard.js
Abhängig von: responsiv-3.3a, responsiv-B3

```text
### 3.6 web/js/screens/dashboard.js (bereich_dashboard-4)

- Z. 124 `${App.accountControl()}` → `${App.accountControl({ iconM: true })}`

```

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
