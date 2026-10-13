# Paket 036 · einstellungen, tokens

Schritte: 23 · Dateien: web/README.md, web/css/app.css, web/e2e/settest.js, web/e2e/settest2.js, web/js/app.js, web/js/screens/misc.js, web/tests/inline-style.test.mjs
Betroffene Tests laut Spezifikation: e2e/colorpickertest.js:27–92; e2e/settest.js:22; e2e/settest.js:22 (siehe E1a); e2e/settest.js:31; e2e/settest.js:31 (siehe E1a); e2e/settest2.js:16 (siehe E1b); e2e/settest2.js:31–38; e2e/settest2.js:9–13 (siehe E1b); e2e/settest2.js:9–16; e2e/sixtest.js:63, :67 (Avatar über form[data-action=save-profile] input[type=file]); e2e/switchtest.js; web/e2e/navdottest.js:37; web/e2e/settest.js:36; web/tests/inline-style.test.mjs (neu)
Baut auf Paketen auf: 4, 5, 9, 12, 18, 22, 25, 31, 34, 35

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## abstaende-R5 · Neuer Unit-Test web/tests/inline-style.test.mjs: zählt Inline-Abstände in JS-Vorlagen, Obergrenze = Stand nach Umstellung (≤ 35)

Gruppe abstaende · Cluster tokens · Aufwand S · Befunde: abstaende_layout-34
Quelle: audit/spec/abstaende.md Z. 524–525 · Dateien: web/tests/inline-style.test.mjs
Abhängig von: abstaende-E4, abstaende-UI, abstaende-F3, abstaende-G4, abstaende-H2, abstaende-H3, abstaende-E-day2, abstaende-E-day4, abstaende-K2, abstaende-K5, abstaende-L2, abstaende-L4, abstaende-L5, abstaende-L6, abstaende-L7, abstaende-L8, abstaende-L9, abstaende-L10, abstaende-N5, abstaende-MENTOR

```text
| R5 | neu `web/tests/inline-style.test.mjs` (node --test) | zählt `style="[^"]*(margin\|gap\|padding)` in `web/js/screens/*.js`, `web/js/app.js`, `web/js/widgets.js`, `web/js/ui.js`. Schlägt fehl, wenn die Zahl über dem Stand nach der Umstellung liegt (höchstens 35, genauen Wert eintragen). | abstaende_layout-34 |

```

## komponenten-C27 · Auswahl in Einstellungen → Design ohne Schlagschatten und Skalierung

Gruppe komponenten · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-19
Quelle: audit/spec/komponenten.md Z. 422–427 · Dateien: web/css/app.css
Abhängig von: —

```text
**C27 – Auswahl in Einstellungen → Design** (bereich_einstellungen-19)
- Z. 1830 → `.design-card[aria-pressed="true"] .dc-prev { box-shadow: inset 0 0 0 1px var(--dd), 0 0 0 2px var(--surface), 0 0 0 3.5px var(--text); }`
- Z. 1841 → `.theme-card[aria-pressed="true"] .tc-prev { box-shadow: inset 0 0 0 1px var(--cb), 0 0 0 2px var(--surface), 0 0 0 3.5px var(--text); }`
- Z. 1937 `.dot[aria-pressed="true"] { box-shadow: 0 0 0 2px var(--text); transform: scale(1.08); }` → `.dot[aria-pressed="true"] { box-shadow: 0 0 0 1.5px var(--text); transform: none; }`
- Z. 461 (`.cp-c`) und Fokusring Z. 1842 bleiben.

```

## komponenten-C37a · „Gespeichert“-Hinweis: .save-state allgemein und im Bereichskopf

Gruppe komponenten · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-2
Quelle: audit/spec/komponenten.md Z. 505–507 · Dateien: web/css/app.css
Abhängig von: —

```text
**C37 – Einstellungen** (bereich_einstellungen-2, komponenten-30)
- Z. 1030 `.nb .save-state { … }` → `.save-state { font-size: 11.5px; color: var(--muted); margin-left: auto; white-space: nowrap; }`; Z. 1031 `.nb .save-state.saving` → `.save-state.saving`; Z. 1193 (Druck) `.nb .save-state` → `.save-state`.
- Neu nach Z. 1816: `.set-head .save-state { align-self: center; font-size: 12px; }`
```

## komponenten-C37b · Inline-Anlegen-Zeile .add-row

Gruppe komponenten · Cluster einstellungen · Aufwand S · Befunde: komponenten-30
Quelle: audit/spec/komponenten.md Z. 508–509 · Dateien: web/css/app.css
Abhängig von: —

```text
- Nach Z. 128 (`.row`) neu: `.add-row { flex-wrap: nowrap; }`

```

## komponenten-A7 · Helfer App.savedHint() für „Gespeichert“ (1,5 s)

Gruppe komponenten · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-2
Quelle: audit/spec/komponenten.md Z. 574–576 · Dateien: web/js/app.js
Abhängig von: komponenten-C37a

```text
**A7 – Gespeichert-Hinweis** (bereich_einstellungen-2)
Neu: `App.savedHint = function () { const s = document.querySelector('.set-head .save-state'); if (!s) return; s.textContent = 'Gespeichert'; clearTimeout(App._svT); App._svT = setTimeout(() => { s.textContent = ''; }, 1500); };`

```

## komponenten-S-misc-a · Einstellungen-Kopf mit .save-state

Gruppe komponenten · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-2
Quelle: audit/spec/komponenten.md Z. 669–670 · Dateien: web/js/screens/misc.js
Abhängig von: komponenten-C37a

```text
**S-misc (misc.js, Einstellungen)** (bereich_einstellungen-11, bereich_einstellungen-2, komponenten-30, komponenten-17, bereich_einstellungen-35, komponenten-36, bereich_einstellungen-40, komponenten-1, komponenten-27)
- Z. 14 `head`: `${trailing}` → `<span class="save-state" aria-live="polite"></span>${trailing}`
```

## komponenten-S-misc-b · Profil speichert sofort (change), kein „Speichern“-Knopf

Gruppe komponenten · Cluster einstellungen · Aufwand M · Befunde: bereich_einstellungen-2
Quelle: audit/spec/komponenten.md Z. 671–671 · Dateien: web/js/screens/misc.js
Abhängig von: komponenten-S-misc-a, komponenten-A7

```text
- Profil, Z. 46: `<form data-action="save-profile" class="set-block stack" …>` → `<form data-action="save-profile" data-change="save-profile" class="set-block stack" …>`. Z. 58: den Knopf `Speichern` entfernen, „Passwort zurücksetzen“ bleibt allein in der Reihe. Handler `save-profile` (Z. 276): `U.toast(…)` und `rerender()` entfernen, stattdessen `App.savedHint()`; `rerender()` nur, wenn sich `currency` geändert hat. Das Avatar-Feld behält sein eigenes `data-change="avatar-file"` (wird über `closest` zuerst gefunden).
```

## komponenten-S-misc-c · Privatsphäre als Schalter (privacy-toggle); „2FA aktivieren“ neutral

Gruppe komponenten · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-11, bereich_einstellungen-2, komponenten-1
Quelle: audit/spec/komponenten.md Z. 672–673 · Dateien: web/js/screens/misc.js
Abhängig von: komponenten-S-misc-a, komponenten-A7

```text
- Privatsphäre, Z. 60: `<form data-action="save-privacy">…</form>` (Checkbox + „Speichern“) → `${switchRow('Support-Team Zugriff auf mein Konto erlauben', 'Wenn aktiviert, kann das Support-Team auf dein Konto zugreifen, um dir besser zu helfen und Fehler zu finden.', 'privacy-toggle', priv.support)}` (h3 und Untertitel bleiben). Neue Aktion: `'privacy-toggle'(el) { const on = !(S.settings.privacy || {}).support; S.setSetting('privacy', Object.assign({}, S.settings.privacy, { support: on })); el.setAttribute('aria-checked', String(on)); App.savedHint(); }`. Handler `save-privacy` (Z. 283) löschen.
- Z. 62 „2FA aktivieren“ `btn primary sm` → `btn sm`.
```

## komponenten-S-misc-d · Konten: „Konto hinzufügen“ als btn

Gruppe komponenten · Cluster einstellungen · Aufwand S · Befunde: komponenten-30
Quelle: audit/spec/komponenten.md Z. 674–674 · Dateien: web/js/screens/misc.js
Abhängig von: —

```text
- Konten, Z. 186: „Konto hinzufügen“ `class="btn sm primary"` → `class="btn"`.
```

## komponenten-S-misc-e · Einstellungen → Trading: sofort speichern, Einheiten im Feld (App.unitField), Tilt-Schalter, neue Labels

Gruppe komponenten · Cluster einstellungen · Aufwand L · Befunde: bereich_einstellungen-2, bereich_einstellungen-11, komponenten-17, bereich_einstellungen-35, komponenten-36
Quelle: audit/spec/komponenten.md Z. 675–675 · Dateien: web/js/screens/misc.js
Abhängig von: komponenten-S-misc-a, komponenten-A7, komponenten-A5a, komponenten-C13, komponenten-C16

```text
- Trading, Z. 192: `<form data-action="save-trading" …>` → zusätzlich `data-change="save-trading"`. Z. 193 `class="chip sel big"` → `class="chip sel"`. Z. 195: Segment „Einheit“ `['abs', cur]` → `['abs', fmt.curSym(cur)]`; Von/Bis: `<div class="input-unit"><span>${unit}</span><input class="input" … id="be-from" …></div>` → ``${App.unitField(`<input class="input" type="number" step="0.01" max="0" id="be-from" name="from" value="${be.from}" inputmode="decimal">`, unit, 'w160')}`` (inneres Markup als Template-String mit Backticks, damit `${be.from}` eingesetzt wird), „Bis“ entsprechend mit `min="0" id="be-to" name="to" value="${be.to}"`. Z. 198 („1 R entspricht“): das bisherige `<input …id="se-runit"…>` unverändert in ``App.unitField(`…`, cur, 'w160')`` setzen. Z. 199: Labels „Tagesverlustlimit (% vom Konto)“ → „Tagesverlustlimit“, „Ruin-Schwelle Monte Carlo (% Drawdown)“ → „Ruin-Schwelle (Drawdown)“; beide bisherigen `<input …>` (Namen `dailyLossLimitPct`, `ruinDrawdownPct` bleiben) in ``App.unitField(`…`, '%')`` (Rasterbreite, kein `w160`). Z. 200 (Tilt-Checkbox) → `<div style="margin-top:14px">${switchRow('Tilt-Warnungen', 'Warnt auf dem Dashboard bei Verlustserien, Größenerhöhung nach Verlust, Revenge-Trades und erreichtem Tageslimit.', 'tilt-toggle', st.tiltWarnings)}</div>`. Z. 201 (`Speichern`) entfernen. Neue Aktion: `'tilt-toggle'(el) { const on = !S.settings.tiltWarnings; S.setSetting('tiltWarnings', on); el.setAttribute('aria-checked', String(on)); App.savedHint(); }`. Handler `save-trading` (Z. 335): `st.tiltWarnings = fd.get('tiltWarnings') === 'on';` streichen, `U.toast` und `rerender()` → `App.savedHint()` (`C.setBreakEven` bleibt).
```

## komponenten-S-misc-f · Regeln: Inline-Anlegen in einer Zeile (.add-row), Knopf btn

Gruppe komponenten · Cluster einstellungen · Aufwand S · Befunde: komponenten-30
Quelle: audit/spec/komponenten.md Z. 676–676 · Dateien: web/js/screens/misc.js
Abhängig von: komponenten-C37b

```text
- Regeln, Z. 207: `<form data-action="add-rule" class="row" style="margin-top:14px">` → `<form data-action="add-rule" class="row add-row" style="margin-top:14px">`; Knopf `btn sm primary` → `btn`.
```

## komponenten-S-misc-g · Einstellungen → Notebook: sofort speichern, „Erledigte Punkte durchstreichen“ als Schalter

Gruppe komponenten · Cluster einstellungen · Aufwand M · Befunde: bereich_einstellungen-2, bereich_einstellungen-11
Quelle: audit/spec/komponenten.md Z. 677–677 · Dateien: web/js/screens/misc.js
Abhängig von: komponenten-S-misc-a, komponenten-A7

```text
- Notebook, Z. 214: `<form data-action="save-notebook" …>` → zusätzlich `data-change="save-notebook"`. Z. 220 (Checkbox „Erledigte Punkte durchstreichen“) → `${switchRow('Erledigte Punkte durchstreichen', 'Abgehakte Einträge in To-do-Listen werden durchgestrichen.', 'nb-strike-toggle', nb.strike)}`. Z. 221: Knopf `Speichern` entfernen, „Auf Standard zurücksetzen“ bleibt. Neue Aktion: `'nb-strike-toggle'(el) { const nb = Object.assign({}, NB_DEFAULT, S.settings.notebook || {}); nb.strike = !nb.strike; S.setSetting('notebook', nb); root.Theme.apply(S.settings); el.setAttribute('aria-checked', String(nb.strike)); const pc = document.querySelector('#nb-preview .pv-check'); if (pc) pc.classList.toggle('strike', nb.strike); App.savedHint(); }`. `nb-preview` (Z. 343): den Teil mit `[name=strike]` löschen und am Ende `App.actions['save-notebook'](form)` aufrufen. `save-notebook` (Z. 344): `strike: fd.get('strike') === 'on'` → `strike: Object.assign({}, NB_DEFAULT, S.settings.notebook || {}).strike`; `U.toast` und `rerender()` → `App.savedHint()`.
```

## komponenten-S-misc-h · Inhalte: „Tag hinzufügen“ neutral

Gruppe komponenten · Cluster einstellungen · Aufwand S · Befunde: komponenten-30, komponenten-1
Quelle: audit/spec/komponenten.md Z. 678–678 · Dateien: web/js/screens/misc.js
Abhängig von: —

```text
- Inhalte, Z. 238: „Tag hinzufügen“ `btn sm primary` → `btn sm`.
```

## komponenten-S-misc-j · Einstellungen: .set-tabs-Markup und Mentor-Formular bleiben (nur prüfen)

Gruppe komponenten · Cluster einstellungen · Aufwand S · Befunde: komponenten-27
Quelle: audit/spec/komponenten.md Z. 680–682 · Dateien: web/js/screens/misc.js
Abhängig von: komponenten-C20

```text
- Z. 231 und 250 (`.set-tabs`) bleiben im Markup; das Aussehen kommt aus C20.
- Mentor (Z. 154–158) bleibt Formular mit „Speichern“.

```

## komponenten-R1c · README: Einstellungen speichern sofort, Ja/Nein als Schalter

Gruppe komponenten · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-2, bereich_einstellungen-11
Quelle: audit/spec/komponenten.md Z. 748–748 · Dateien: web/README.md
Abhängig von: komponenten-S-misc-b, komponenten-S-misc-c, komponenten-S-misc-e, komponenten-S-misc-g

```text
- Z. 171 (Einstellungen): ergänzen „Alle Einstellungen außer Mentor speichern sofort; „Gespeichert“ erscheint kurz neben dem Bereichstitel. Ja/Nein-Optionen sind Schalter.“
```

## komponenten-E1a · e2e settest.js: Trading per Tab statt Submit, Notebook ohne Speichern-Klick

Gruppe komponenten · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-2, bereich_einstellungen-11
Quelle: audit/spec/komponenten.md Z. 754–757 · Dateien: web/e2e/settest.js
Abhängig von: komponenten-S-misc-e, komponenten-S-misc-g

```text
### 3.9 web/e2e

**E1 – Tests an geänderte Bedienung anpassen** (bereich_einstellungen-2, bereich_einstellungen-11, bereich_notebook_news-20, responsiv-23, bereich_training-48, bereich_shell-20, hierarchie-47, bereich_statistik-8)
- settest.js:22: statt Klick auf `form[data-action="save-trading"] button[type=submit]` → `await p.press('#be-to', 'Tab')`; settest.js:31: Klick auf den Notebook-Speichern-Knopf entfernen (`selectOption` löst `change` aus).
```

## komponenten-E1b · e2e settest2.js: Profil per Tab, Privatsphäre über Schalter

Gruppe komponenten · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-2, bereich_einstellungen-11
Quelle: audit/spec/komponenten.md Z. 758–758 · Dateien: web/e2e/settest2.js
Abhängig von: komponenten-S-misc-b, komponenten-S-misc-c

```text
- settest2.js:9–16: nach dem letzten `fill` `await p.press('#pf-addr', 'Tab')`; Privatsphäre: `await p.click('[data-action="privacy-toggle"]')`, gleiche Prüfung `Store.settings.privacy.support === true`.
```

## aufbau-A4b · Überschriften-Treppe Einstellungen (.set-head, .set-block h3, Optionstitel)

Gruppe aufbau · Cluster einstellungen · Aufwand S · Befunde: typografie-7, typografie-8, hierarchie-33
Quelle: audit/spec/aufbau.md Z. 280–284 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 1815 `.set-head h2 { font-size: 24px; font-weight: 700; letter-spacing: -0.01em; }` → `.set-head h2 { font-size: 18px; font-weight: 600; line-height: 24px; letter-spacing: 0; }`
- Im 960-Block (ab Z. 916) neu: `.set-head h2 { font-size: 16px; line-height: 22px; }`
- Z. 1816 `.set-head p { margin-top: 4px; font-size: 13.5px; }` → `font-size: 13px;`
- Z. 1818 `.set-block h3 { font-size: 14px; font-weight: 700; margin-bottom: 10px; }` → `font-size: 15px; font-weight: 600; margin-bottom: 10px;`
- Z. 1865 `.set-row b { display: block; margin-bottom: 2px; }` → `display: block; margin-bottom: 2px; font-size: 14px; font-weight: 500; color: var(--text);`, danach neu: `.set-body .check b, .set-body .row.between > div > b, .set-body .avatar-row b { font-size: 14px; font-weight: 500; color: var(--text); }`
```

## aufbau-B14 · CSS für eingerückte Unterschalter (.set-sub)

Gruppe aufbau · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-33
Quelle: audit/spec/aufbau.md Z. 390–396 · Dateien: web/css/app.css
Abhängig von: —

```text
**B14 Unterschalter eingerückt** (`web/css/app.css` nach Z. 1865) · bereich_einstellungen-33
```css
.set-sub { margin-left: 50px; display: flex; flex-direction: column; gap: 12px; padding-top: 14px; border-top: 1px solid var(--border); }
.set-sub[aria-disabled="true"] { opacity: .5; }
.switch:disabled { cursor: default; }
```

```

## aufbau-C8a · Einstellungen ohne Kopfreihe (head alles false)

Gruppe aufbau · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-3, responsiv-18, ki_look-22, aufbau-6, hierarchie-19
Quelle: audit/spec/aufbau.md Z. 485–488 · Dateien: web/js/screens/misc.js
Abhängig von: aufbau-B1

```text
#### `web/js/screens/misc.js` (Einstellungen)

**C8** · bereich_einstellungen-3, responsiv-18, ki_look-22, aufbau-6, hierarchie-19, typografie-8, hierarchie-33, bereich_einstellungen-33, bereich_einstellungen-5, aufbau-8, aufbau-21, bereich_einstellungen-36
- `App.screens.settings` nach Z. 18 `title`: `head: { range: false, account: false, session: false, trade: false }, /* Einstellungen sind keine Journal-Ansicht: keine Kopfreihe */`
```

## aufbau-C8c · Profil: „Alle Daten löschen“ neutral, „1–9 Bereiche“, Zeitzone des Systems

Gruppe aufbau · Cluster einstellungen · Aufwand S · Befunde: hierarchie-33, aufbau-21, bereich_einstellungen-5
Quelle: audit/spec/aufbau.md Z. 491–493 · Dateien: web/js/screens/misc.js
Abhängig von: —

```text
- `profil()` Z. 68 `<b class="neg">Alles löschen</b>` → `<b>Alle Daten löschen</b>`
- `profil()` Z. 69 `<b>1–6</b> Bereiche` → `<b>1–9</b> Bereiche`
- `timezones()` Z. 41: vor dem `return list;` → `const sys = Intl.DateTimeFormat().resolvedOptions().timeZone; if (sys && !list.includes(sys)) list = [sys, ...list];` (wie prop.js:147). `profil()` Z. 54: `const zones = timezones(); if (tz && !zones.includes(tz)) zones.unshift(tz);` und `zones.map(…)` statt `timezones().map(…)`
```

## aufbau-C8d · Benachrichtigungen: Unterschalter eingerückt und bei aus deaktiviert

Gruppe aufbau · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-33
Quelle: audit/spec/aufbau.md Z. 494–494 · Dateien: web/js/screens/misc.js
Abhängig von: aufbau-B14

```text
- Benachrichtigungen Z. 176: `${nd.on ? App.NAV_DOT_AREAS.map(…).join('') : ''}` → `<div class="set-sub"${nd.on ? '' : ' aria-disabled="true"'}>${App.NAV_DOT_AREAS.map(([k, label, desc]) => switchRow(label, desc, 'navdot-toggle', nd[k] !== false, `data-key="${k}"${nd.on ? '' : ' disabled'}`)).join('')}</div>`
```

## aufbau-C8f · Inhalte: Standard-Reiter „Tags“, Reihenfolge Tags · Kategorien

Gruppe aufbau · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-36
Quelle: audit/spec/aufbau.md Z. 496–497 · Dateien: web/js/screens/misc.js
Abhängig von: —

```text
- `ui()` Z. 13 `contentTab: 'kategorien'` → `contentTab: 'tags'`; `inhalte()` Z. 231 Reiterfolge `[['kategorien', 'Kategorien'], ['tags', 'Tags']]` → `[['tags', 'Tags'], ['kategorien', 'Kategorien']]`

```
