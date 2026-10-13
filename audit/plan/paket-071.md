# Paket 071 · barrierefreiheit, einstellungen

Schritte: 6 · Dateien: web/README.md, web/app.html, web/e2e/affiliatetest.js, web/e2e/calmnavtest.js, web/e2e/friedhoftest.js, web/e2e/proptest.js, web/js/app.js, web/js/screens/misc.js
Betroffene Tests laut Spezifikation: neu (Abschnitt 4, Verhalten): Taste 0 ohne FEATURES.replay ändert location.hash nicht; shortcuts=false sperrt N und 1–9, Esc wirkt weiter; prüfen: e2e/rptest.js:10 (Taste 7), e2e/mentortest.js:21 (Taste 8); web/e2e/affiliatetest.js:16; web/e2e/calmnavtest.js:51; web/e2e/friedhoftest.js:21; web/e2e/motiontest.js:62-66; web/e2e/proptest.js:19; web/e2e/proptest.js:91; web/e2e/proptest.js:95; web/e2e/sidebartest.js:44-45; web/e2e/usercardtest.js:55-58
Baut auf Paketen auf: 2, 6, 10, 14, 17, 29, 33, 63, 65, 68

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## barrierefreiheit-E-aria-current · Tests auf aria-current="page" umstellen (proptest, friedhoftest, affiliatetest, calmnavtest)

Gruppe barrierefreiheit · Cluster barrierefreiheit · Aufwand S · Befunde: barrierefreiheit-32, bereich_statistik-7
Quelle: audit/spec/barrierefreiheit.md Z. 905–907 · Dateien: web/e2e/proptest.js, web/e2e/friedhoftest.js, web/e2e/affiliatetest.js, web/e2e/calmnavtest.js
Abhängig von: barrierefreiheit-C-prop-304-305, barrierefreiheit-C-affiliate-51, barrierefreiheit-C-stats-15

```text
| proptest.js:19, 91, 95 · friedhoftest.js:21 | `.prop-tabs a[aria-pressed=true]` | `.prop-tabs a[aria-current=page]` |
| affiliatetest.js:16 | `x.getAttribute('aria-pressed')`, Soll `Alle Creator:true,…` | `x.getAttribute('aria-current')`, Soll `'Alle Creator:page,Creator-Ansicht:null'` |
| calmnavtest.js:51 | `t.querySelector('[aria-pressed="true"]')` | `t.querySelector('[aria-current="page"]')` |
```

## barrierefreiheit-E-README · README: Tastatur-Zeile (Z. 318) erweitern, Absatz Fokusführung unter „Neuaufbau ohne Springen“

Gruppe barrierefreiheit · Cluster barrierefreiheit · Aufwand S · Befunde: —
Quelle: audit/spec/barrierefreiheit.md Z. 912–916 · Dateien: web/README.md
Abhängig von: barrierefreiheit-A1, barrierefreiheit-P1, barrierefreiheit-P3, barrierefreiheit-U3a, barrierefreiheit-C-rangepicker, barrierefreiheit-C-dashboard-154

```text
#### `web/README.md`

- Z. 318: „Tastatur: **N** neuer Trade, **1–6** Bereiche, **Esc** schließt Dialoge“ → „Tastatur: **N** neuer Trade, **1–6** Bereiche, **Esc** schließt Dialoge (Formular-Dialoge mit geänderten Eingaben fragen „Änderungen verwerfen?“), **Tab** am Seitenanfang: „Zum Inhalt springen“, **Pfeiltasten** in Auswahlgruppen, im Zeitraum-Kalender und am Ziehgriff.“
- Neuer Absatz unter „Neuaufbau ohne Springen“: Fokus bleibt beim Neuaufbau auf demselben Element (`App.focusSnapshot`/`restoreFocus`), Seitenwechsel setzt ihn auf `#content`, Dialoge fokussieren sich selbst und geben ihn zurück, Fokusring neutral `--focus`.

```

## kilook-C6 · Tastenkürzel abschaltbar (settings.shortcuts), „0“ nur bei App.on('replay')

Gruppe kilook · Cluster barrierefreiheit · Aufwand S · Befunde: barrierefreiheit-43
Quelle: audit/spec/kilook.md Z. 579–583 · Dateien: web/app.html
Abhängig von: —

```text
**C6 · web/app.html:93–96 · Tastenkürzel** (barrierefreiheit-43)
- Erste Zeile im keydown-Listener: `if (window.Store && Store.settings && Store.settings.shortcuts === false) return;`
- **95** vorher `const map = { '1': 'dashboard', …, '9': 'shadow', '0': 'replay' };`
  → nachher `const map = { '1': 'dashboard', '2': 'trades', '3': 'day', '4': 'stats', '5': 'notebook', '6': 'progress', '7': 'ruhepunkt', '8': 'mentor', '9': 'shadow' }; if (App.on('replay')) map['0'] = 'replay';`

```

## kilook-C24 · Einstellungen → Profil: Block „Bedienung“ mit Schalter „Tastenkürzel“, Fußzeile ohne Tastatur-Teil, Aktion 'shortcuts-toggle'

Gruppe kilook · Cluster einstellungen · Aufwand S · Befunde: barrierefreiheit-43
Quelle: audit/spec/kilook.md Z. 715–722 · Dateien: web/js/screens/misc.js
Abhängig von: kilook-C6

```text
**C24 · web/js/screens/misc.js** (barrierefreiheit-43)
- Vor Z. 63 (`<div class="set-block"><h3>Daten und Sicherung</h3>`) einfügen:
  `<div class="set-block"><h3>Bedienung</h3>${switchRow('Tastenkürzel', '<b>N</b> Trade loggen · <b>1–9</b> Bereich wechseln', 'shortcuts-toggle', st.shortcuts !== false)}</div>`
- **69** vorher `<div class="small faint">Speicherort: dieser Browser (localStorage und IndexedDB). ${S.storageOK ? '' : '<span class="neg">Achtung: …</span>'} Tastatur: <b>N</b> neuer Trade · <b>1–6</b> Bereiche · <b>Esc</b> schließt Dialoge.</div>`
  → nachher `<div class="small faint">Speicherort: dieser Browser (localStorage und IndexedDB).${S.storageOK ? '' : ' <span class="neg">Achtung: Speichern ist derzeit nicht möglich (privates Fenster oder blockierte Website-Daten).</span>'}</div>`
- In `Object.assign(App.actions, { … })` hinter `'faith-toggle'() { … },` (Z. 282) einfügen:
  `'shortcuts-toggle'() { S.setSetting('shortcuts', !(S.settings.shortcuts !== false)); rerender(); },`

```

## kilook-C8b · Knopf „Trade loggen“ mit aria-keyshortcuts="N"

Gruppe kilook · Cluster barrierefreiheit · Aufwand S · Befunde: barrierefreiheit-43
Quelle: audit/spec/kilook.md Z. 602–602 · Dateien: web/js/app.js
Abhängig von: —

```text
- **253** `newTradeButton()`: `<button type="button" class="btn accent tl" data-action="new-trade">` → `<button type="button" class="btn accent tl" data-action="new-trade" aria-keyshortcuts="N">`
```

## responsiv-3.3c · Schublade: Fokus beim Öffnen/Schließen und #main inert (renderSidebar)

Gruppe responsiv · Cluster barrierefreiheit · Aufwand M · Befunde: barrierefreiheit-30
Quelle: audit/spec/responsiv.md Z. 432–440 · Dateien: web/js/app.js
Abhängig von: responsiv-B2

```text
- `renderSidebar()` Z. 200–214 (barrierefreiheit-30):
  - erste Zeile ergänzen: `const wasOpen = sb.classList.contains('open'); const hadFocus = sb.contains(document.activeElement);` (vor dem `innerHTML`-Austausch, `sb` zuerst holen)
  - nach Z. 213 neu:
    ```js
    /* Schublade: offen fängt sie den Fokus, der Inhalt dahinter ist inert; geschlossen kehrt der Fokus an den Menüknopf zurück */
    const main = document.getElementById('main'); if (main) main.inert = open && !desk;
    if (open && !wasOpen && !desk) { const a = sb.querySelector('.nav a.active') || sb.querySelector('.nav a'); if (a) a.focus(); }
    else if (!open && wasOpen && hadFocus) { const b = document.querySelector('.menu-btn'); if (b) b.focus(); }
    ```
```
