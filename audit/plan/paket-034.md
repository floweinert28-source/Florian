# Paket 034 · einstellungen, tokens

Schritte: 16 · Dateien: web/css/app.css, web/e2e/settest2.js, web/js/app.js, web/js/screens/misc.js, web/tests/inline-style.test.mjs
Betroffene Tests laut Spezifikation: e2e/colorpickertest.js:27–92; e2e/settest2.js:31–38; e2e/settest2.js:9–13 (siehe E1b); e2e/settest2.js:9–16; e2e/sixtest.js:63, :67 (Avatar über form[data-action=save-profile] input[type=file]); web/e2e/settest.js:36; web/tests/inline-style.test.mjs (neu)
Baut auf Paketen auf: 2, 5, 6, 11, 13, 17, 21, 29, 32, 33

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .dot[aria-pressed="true"]] Die Regel lautet `.dot[aria-pressed="true"] { box-shadow: 0 0 0 1.5px var(--text); }`, ohne transform. Weil die Skalierung auch beim Darüberfahren entfällt, braucht es kein `transform: none`. Begründung: Die Ringstärke 1,5 px ist dieselbe wie bei den gewählten Theme- und Design-Karten aus komponenten-C27 (0 0 0 2px var(--surface), 0 0 0 3.5px var(--text)) und bei den Heute-Ringen. Damit hat die Auswahl auf der ganzen Design-Seite eine Ringstärke. Den Abstand bildet der 3-px-Rand des Punkts in --surface. Der Hover-Ring (1px --text-2) bleibt klar schwächer. Die übrigen Teile von bewegung-C7b (transition, .dot:hover, .dot.custom:hover, .pair-card) bleiben unverändert.
- ÄNDERN: Der Teil zu Z. 1937 entfällt, bewegung-C7b setzt ihn mit 1,5 px um. Z. 1830 und Z. 1841 (Design- und Theme-Karte) bleiben wie spezifiziert.

## komponenten-C37a · „Gespeichert“-Hinweis: .save-state allgemein und im Bereichskopf

Gruppe komponenten · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-2
Quelle: audit/spec/komponenten.md Z. 505–507 · Dateien: web/css/app.css
Abhängig von: —

```text
**C37 – Einstellungen** (bereich_einstellungen-2, komponenten-30)
- Z. 1030 `.nb .save-state { … }` → `.save-state { font-size: 11.5px; color: var(--muted); margin-left: auto; white-space: nowrap; }`; Z. 1031 `.nb .save-state.saving` → `.save-state.saving`; Z. 1193 (Druck) `.nb .save-state` → `.save-state`.
- Neu nach Z. 1816: `.set-head .save-state { align-self: center; font-size: 12px; }`
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .save-state] Ein Baustein für den Speicherstand, überall gleich. CSS: Z. 1030 `.nb .save-state` → `.save-state { font-size: var(--fs-12); line-height: var(--lh-12); color: var(--muted); margin-left: auto; white-space: nowrap; }`, solange die Typo-Tokens fehlen, 12px. Z. 1031 `.nb .save-state.saving` wird ersatzlos gelöscht. „Wird gespeichert …“ ist keine Warnung, --warn steht nur für Warnungen (zustaende Z5, farbe-Grundregel). Druck Z. 1193 `.nb .save-state` → `.save-state`. Neu: `.set-head .save-state { align-self: center; }`, Größe und Farbe aus der allgemeinen Regel. JS: misc.js `head()` setzt in jeden Einstellungen-Kopf `<span class="save-state" aria-live="polite"></span>${trailing}` (S-misc-a). Kein zweiter Span mit `id="set-save"` im Trading-Kopf. Angezeigt wird ausschließlich über `App.savedHint()` (A7), auch in Trading. Dauer 2000 ms (statt 1,5 s), weil der Hinweis im Kopf weit weg vom geänderten Feld steht. Notebook: Text „Wird gespeichert …“ (S-NB3); die Klasse `saving` hat keine Regel mehr und wird nicht mehr gesetzt (kein toter Code). Wie Trading sonst speichert (`save-trading-auto` gegen `data-change="save-trading"` aus komponenten-S-misc-e), entscheidet der Anker des Trading-Formulars.
- ÄNDERN: Endzustand: `.save-state { font-size: var(--fs-12); line-height: var(--lh-12); color: var(--muted); margin-left: auto; white-space: nowrap; }` (12 statt 11.5 px). `.nb .save-state.saving` nicht in `.save-state.saving` umbenennen, sondern löschen. Druckregel `.save-state`. Neu nur `.set-head .save-state { align-self: center; }` ohne eigene Schriftgröße.
- ÜBERNIMMT zustaende-S-C14: Alle drei Punkte (12 px, `.saving` ohne Gelb löschen, `.set-head .save-state`) stecken im Endzustand von komponenten-C37a.
- [doppelt: .set-head .save-state] Beide Gruppen legen die Regel neu an. Endzustand `.set-head .save-state { align-self: center; }`, 12 px und --muted kommen aus der allgemeinen `.save-state`-Regel. Umsetzung in komponenten-C37a; S-C14 läuft mit. A7 nutzt den Selektor mit 2000 ms. Einzelheiten beim Anker .save-state.
- ÜBERNIMMT zustaende-S-C14: Alle drei Punkte (12 px, `.saving` ohne Gelb löschen, `.set-head .save-state`) stecken im Endzustand von komponenten-C37a.
- [doppelt: .nb .save-state] Alle drei wollen die Notebook-Statuszeile in 12 px. Der Selektor wird zu `.save-state` verallgemeinert (komponenten-C37a), mit `font-size: var(--fs-12); line-height: var(--lh-12)`. Siehe Anker .save-state.
- [konflikt: .nb .save-state.saving] Die Regel wird gelöscht, kein Gelb (zustaende). Weder farbe-C1b (`--warn-text`) noch eine Umbenennung in `.save-state.saving` (C37a). „Wird gespeichert …“ ist ein laufender Vorgang, keine Warnung. Siehe Anker .save-state.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .set-head] Jeder Einstellungs-Kopf hat genau einen „Gespeichert“-Hinweis. head() rendert immer `<span class="save-state" aria-live="polite"></span>` vor trailing (komponenten-S-misc-a). Gefüllt wird er nur über App.savedHint() (komponenten-A7) und steht 2000 ms. Die 2 s kommen aus zustaende Z9: Der Hinweis steht oben rechts, weit vom geänderten Feld, und 1,5 s reichen dort nicht zum Lesen. Trading speichert bei change über die eine Aktion save-trading: Das Formular trägt data-action und data-change="save-trading", Enter läuft in denselben Handler. Der Handler beginnt mit `if (!form.checkValidity()) { form.reportValidity(); return; }` (aus zustaende-S-M2), damit Werte außerhalb von min/max nicht gespeichert werden; die Meldung kommt über den globalen invalid-Listener. Danach speichern, C.setBreakEven, App.savedHint(), ohne Toast und ohne rerender. Es gibt keinen zweiten Span, keine id set-save, keine Aktion save-trading-auto und kein readTrading. Ob Profil und Notebook auch sofort speichern, entscheidet nicht dieser Anker. Wo sofort gespeichert wird, gilt derselbe Hinweis.
- ÄNDERN: In App.savedHint setTimeout auf 2000 statt 1500 setzen und den Titel auf „Gespeichert“ 2 s ändern.
- [konflikt: .save-state] Ein Baustein für den Speicherstand, überall gleich. CSS: Z. 1030 `.nb .save-state` → `.save-state { font-size: var(--fs-12); line-height: var(--lh-12); color: var(--muted); margin-left: auto; white-space: nowrap; }`, solange die Typo-Tokens fehlen, 12px. Z. 1031 `.nb .save-state.saving` wird ersatzlos gelöscht. „Wird gespeichert …“ ist keine Warnung, --warn steht nur für Warnungen (zustaende Z5, farbe-Grundregel). Druck Z. 1193 `.nb .save-state` → `.save-state`. Neu: `.set-head .save-state { align-self: center; }`, Größe und Farbe aus der allgemeinen Regel. JS: misc.js `head()` setzt in jeden Einstellungen-Kopf `<span class="save-state" aria-live="polite"></span>${trailing}` (S-misc-a). Kein zweiter Span mit `id="set-save"` im Trading-Kopf. Angezeigt wird ausschließlich über `App.savedHint()` (A7), auch in Trading. Dauer 2000 ms (statt 1,5 s), weil der Hinweis im Kopf weit weg vom geänderten Feld steht. Notebook: Text „Wird gespeichert …“ (S-NB3); die Klasse `saving` hat keine Regel mehr und wird nicht mehr gesetzt (kein toter Code). Wie Trading sonst speichert (`save-trading-auto` gegen `data-change="save-trading"` aus komponenten-S-misc-e), entscheidet der Anker des Trading-Formulars.
- ÄNDERN: `App.savedHint` mit Timeout 2000 statt 1500 ms. Sonst wie spezifiziert (sucht `.set-head .save-state`).
- [doppelt: .set-head .save-state] Beide Gruppen legen die Regel neu an. Endzustand `.set-head .save-state { align-self: center; }`, 12 px und --muted kommen aus der allgemeinen `.save-state`-Regel. Umsetzung in komponenten-C37a; S-C14 läuft mit. A7 nutzt den Selektor mit 2000 ms. Einzelheiten beim Anker .save-state.

## komponenten-S-misc-a · Einstellungen-Kopf mit .save-state

Gruppe komponenten · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-2
Quelle: audit/spec/komponenten.md Z. 669–670 · Dateien: web/js/screens/misc.js
Abhängig von: komponenten-C37a

```text
**S-misc (misc.js, Einstellungen)** (bereich_einstellungen-11, bereich_einstellungen-2, komponenten-30, komponenten-17, bereich_einstellungen-35, komponenten-36, bereich_einstellungen-40, komponenten-1, komponenten-27)
- Z. 14 `head`: `${trailing}` → `<span class="save-state" aria-live="polite"></span>${trailing}`
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .set-head] Jeder Einstellungs-Kopf hat genau einen „Gespeichert“-Hinweis. head() rendert immer `<span class="save-state" aria-live="polite"></span>` vor trailing (komponenten-S-misc-a). Gefüllt wird er nur über App.savedHint() (komponenten-A7) und steht 2000 ms. Die 2 s kommen aus zustaende Z9: Der Hinweis steht oben rechts, weit vom geänderten Feld, und 1,5 s reichen dort nicht zum Lesen. Trading speichert bei change über die eine Aktion save-trading: Das Formular trägt data-action und data-change="save-trading", Enter läuft in denselben Handler. Der Handler beginnt mit `if (!form.checkValidity()) { form.reportValidity(); return; }` (aus zustaende-S-M2), damit Werte außerhalb von min/max nicht gespeichert werden; die Meldung kommt über den globalen invalid-Listener. Danach speichern, C.setBreakEven, App.savedHint(), ohne Toast und ohne rerender. Es gibt keinen zweiten Span, keine id set-save, keine Aktion save-trading-auto und kein readTrading. Ob Profil und Notebook auch sofort speichern, entscheidet nicht dieser Anker. Wo sofort gespeichert wird, gilt derselbe Hinweis.
- [konflikt: .save-state] Ein Baustein für den Speicherstand, überall gleich. CSS: Z. 1030 `.nb .save-state` → `.save-state { font-size: var(--fs-12); line-height: var(--lh-12); color: var(--muted); margin-left: auto; white-space: nowrap; }`, solange die Typo-Tokens fehlen, 12px. Z. 1031 `.nb .save-state.saving` wird ersatzlos gelöscht. „Wird gespeichert …“ ist keine Warnung, --warn steht nur für Warnungen (zustaende Z5, farbe-Grundregel). Druck Z. 1193 `.nb .save-state` → `.save-state`. Neu: `.set-head .save-state { align-self: center; }`, Größe und Farbe aus der allgemeinen Regel. JS: misc.js `head()` setzt in jeden Einstellungen-Kopf `<span class="save-state" aria-live="polite"></span>${trailing}` (S-misc-a). Kein zweiter Span mit `id="set-save"` im Trading-Kopf. Angezeigt wird ausschließlich über `App.savedHint()` (A7), auch in Trading. Dauer 2000 ms (statt 1,5 s), weil der Hinweis im Kopf weit weg vom geänderten Feld steht. Notebook: Text „Wird gespeichert …“ (S-NB3); die Klasse `saving` hat keine Regel mehr und wird nicht mehr gesetzt (kein toter Code). Wie Trading sonst speichert (`save-trading-auto` gegen `data-change="save-trading"` aus komponenten-S-misc-e), entscheidet der Anker des Trading-Formulars.

## komponenten-S-misc-b · Profil speichert sofort (change), kein „Speichern“-Knopf

Gruppe komponenten · Cluster einstellungen · Aufwand M · Befunde: bereich_einstellungen-2
Quelle: audit/spec/komponenten.md Z. 671–671 · Dateien: web/js/screens/misc.js
Abhängig von: komponenten-S-misc-a, komponenten-A7

```text
- Profil, Z. 46: `<form data-action="save-profile" class="set-block stack" …>` → `<form data-action="save-profile" data-change="save-profile" class="set-block stack" …>`. Z. 58: den Knopf `Speichern` entfernen, „Passwort zurücksetzen“ bleibt allein in der Reihe. Handler `save-profile` (Z. 276): `U.toast(…)` und `rerender()` entfernen, stattdessen `App.savedHint()`; `rerender()` nur, wenn sich `currency` geändert hat. Das Avatar-Feld behält sein eigenes `data-change="avatar-file"` (wird über `closest` zuerst gefunden).
```

## komponenten-S-misc-d · Konten: „Konto hinzufügen“ als btn

Gruppe komponenten · Cluster einstellungen · Aufwand S · Befunde: komponenten-30
Quelle: audit/spec/komponenten.md Z. 674–674 · Dateien: web/js/screens/misc.js
Abhängig von: —

```text
- Konten, Z. 186: „Konto hinzufügen“ `class="btn sm primary"` → `class="btn"`.
```

## komponenten-S-misc-f · Regeln: Inline-Anlegen in einer Zeile (.add-row), Knopf btn

Gruppe komponenten · Cluster einstellungen · Aufwand S · Befunde: komponenten-30
Quelle: audit/spec/komponenten.md Z. 676–676 · Dateien: web/js/screens/misc.js
Abhängig von: komponenten-C37b

```text
- Regeln, Z. 207: `<form data-action="add-rule" class="row" style="margin-top:14px">` → `<form data-action="add-rule" class="row add-row" style="margin-top:14px">`; Knopf `btn sm primary` → `btn`.
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

## komponenten-E1b · e2e settest2.js: Profil per Tab, Privatsphäre über Schalter

Gruppe komponenten · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-2, bereich_einstellungen-11
Quelle: audit/spec/komponenten.md Z. 758–758 · Dateien: web/e2e/settest2.js
Abhängig von: komponenten-S-misc-b, komponenten-S-misc-c

```text
- settest2.js:9–16: nach dem letzten `fill` `await p.press('#pf-addr', 'Tab')`; Privatsphäre: `await p.click('[data-action="privacy-toggle"]')`, gleiche Prüfung `Store.settings.privacy.support === true`.
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

**Hinweise aus der Abstimmung (verbindlich):**

- ÄNDERN: Werte auf Tokens: .set-sub { margin-left: 50px; display: flex; flex-direction: column; gap: var(--sp-3); padding-top: var(--sp-4); border-top: 1px solid var(--border); } .set-sub[aria-disabled="true"] { opacity: var(--disabled-o); } .switch:disabled { cursor: not-allowed; }. 50px = Schalter 36 + Lücke der .set-row 14; das ist Ausrichtung, kein Abstand.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: b.neg] Z. 68 (Daten und Sicherung) bekommt den Zeilentitel `<b>Alle Daten löschen</b>` ohne Klasse neg, also in --text als Zeilentitel 14/500. Der Knopf bleibt `btn sm danger` mit „Alles löschen“. Grund: Rot steht nur für Verlust, Fehler und die Gefahr-Aktion (farbe), und die Gefahr trägt hier der Knopf. Mit dem neuen Titel sagen Titel und Knopf außerdem nicht zweimal dasselbe (aufbau). Das <b>-Element ändert nur aufbau-C8c (Text und Klasse, dazu der Sprachschlüssel „Alle Daten löschen“ aus aufbau Z. 681 in allen fünf Sprachdateien). abstaende-L3 baut nur die Zeilen um. Die Typografie-Abnahme „„Alles löschen“ bleibt rot“ (typografie.md Z. 80/500) ist damit überholt. Die Entscheidung hängt nicht von aufbau-25 ab (Verschieben nach „Sicherheit und Daten“).
- [konflikt: misc.profil] aufbau-C8c und farbe-C22b ändern in profil() verschiedene Teilstrings (Z. 41/54 Zeitzone, Z. 62 2FA-Knopf, Z. 68 Titel, Z. 69 Fußzeile) und vertragen sich. Z. 69 schreiben aber wording-S17.4-17.7 (17.7) und kilook-C24 als ganze Zeile neu, beide noch mit class="small faint". Für die Endfassung jeder Fußzeile in profil() gilt verbindlich: class="small muted", denn Fußnoten sind --muted und --faint ist nie für Wörter. Wo Tasten genannt werden, steht „1–9“. Welcher Wortlaut gilt (wording zweizeilig oder kilook ohne Tastatur-Teil), entscheidet diese Liste nicht.
- ÄNDERN: Den Z.-69-Punkt (`<b>1–6</b> Bereiche` → `<b>1–9</b> Bereiche`) nur ausführen, solange die alte Fußzeile noch steht. Nach wording-S17.4-17.7 oder kilook-C24 ist er erledigt (dort steht 1–9 oder kein Tastatur-Teil mehr). Den Z.-68-Punkt siehe Anker b.neg. Die Zeitzone (Z. 41/54) bleibt wie spezifiziert.

## aufbau-C8f · Inhalte: Standard-Reiter „Tags“, Reihenfolge Tags · Kategorien

Gruppe aufbau · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-36
Quelle: audit/spec/aufbau.md Z. 496–497 · Dateien: web/js/screens/misc.js
Abhängig von: —

```text
- `ui()` Z. 13 `contentTab: 'kategorien'` → `contentTab: 'tags'`; `inhalte()` Z. 231 Reiterfolge `[['kategorien', 'Kategorien'], ['tags', 'Tags']]` → `[['tags', 'Tags'], ['kategorien', 'Kategorien']]`

```
