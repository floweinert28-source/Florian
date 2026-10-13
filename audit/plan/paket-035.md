# Paket 035 · einstellungen, aufbau

Schritte: 19 · Dateien: web/README.md, web/css/app.css, web/e2e/settest.js, web/js/screens/misc.js
Betroffene Tests laut Spezifikation: web/e2e/mentortest.js:24; web/e2e/settest.js:36; web/e2e/settest2.js:47
Baut auf Paketen auf: 27, 28, 29, 30, 34

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## aufbau-D2c · README: Einstellungen, Prop, Coupon-Codes, Affiliate, Coach

Gruppe aufbau · Cluster aufbau · Aufwand S · Befunde: bereich_einstellungen-3, bereich_einstellungen-36, bereich_prop-32, bereich_prop-28, bereich_konto-37, hierarchie-45, bereich_konto-29, bereich_konto-25, bereich_konto-19
Quelle: audit/spec/aufbau.md Z. 694–698 · Dateien: web/README.md
Abhängig von: aufbau-C8a, aufbau-C8f, aufbau-C12b, aufbau-C12e, aufbau-C5a, aufbau-C3, aufbau-C4a, aufbau-C4b, aufbau-C4c

```text
- Einstellungen (Z. 171): „ohne Kopfreihe (Zeitraum, Konto, Session und Trade loggen wirken hier nicht)“; Inhalte „Tags und Kategorien“
- Z. 260 Prop: „Payout-Planer (Consistency als Zeile in den Bedingungen); der Wert „Nächster Payout“/„Bestehen“ in der Kontokarte öffnet den Planer dieses Kontos“
- Z. 264 Coupon-Codes: „Kopfreihe nur mit „Trade loggen““
- Affiliate (Z. 267 ff.): „Kopfreihe: links Umschalter (Creator-Ansicht dazu die Auswahl), rechts die Marke „Beispieldaten“; kein Trade loggen, keine Session. Kennzahlen Kunden, Umsatz, Provisionen, Offen“
- Coach: „ohne Kopfreihe; Journal zeigt 10 Einträge, dann „Mehr anzeigen“; Notiz über „Notiz schreiben““
```

## aufbau-D3h · Test settest.js: Reiter „Kategorien“ zuerst anklicken

Gruppe aufbau · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-36
Quelle: audit/spec/aufbau.md Z. 712–712 · Dateien: web/e2e/settest.js
Abhängig von: aufbau-C8f

```text
- `settest.js:36`: zuerst `[data-action="content-tab"][data-value="kategorien"]` klicken, dann 3 Zeilen prüfen; Z. 37 klickt danach „tags“ (bleibt)
```

## zustaende-S-C9a · Einstellungen-Unternavigation: gewählter Eintrag Fläche --surface mit Rand, Hover 5 %, Gewicht 500

Gruppe zustaende · Cluster einstellungen · Aufwand S · Befunde: farbe_kontrast-4
Quelle: audit/spec/zustaende.md Z. 319–322 · Dateien: web/css/app.css
Abhängig von: —

```text
**S-C9 Reiter, Unter-Navigation, Sprachkarte** – farbe_kontrast-4, farbe_kontrast-25
- Z. 1807 `.set-nav a { … }`: `border: 1px solid transparent;` ergänzen.
- Z. 1809 `.set-nav a:hover { background: var(--surface-2); color: var(--text); }` → `{ background: color-mix(in srgb, var(--text) 5%, transparent); color: var(--text); }`
- Z. 1810 `.set-nav a.active { background: var(--surface-2); … }` → `.set-nav a.active { background: var(--surface); border-color: var(--border); color: var(--text); font-weight: 500; }`
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .set-nav a.active] Der aktive Eintrag im Einstellungs-Menü sieht aus wie der aktive Eintrag der Seitenleiste, damit es ein Muster für „aktive Navigation“ gibt. Die Regeln lauten: `.set-nav a { … border: 1px solid transparent; }`, `.set-nav a:hover { background: color-mix(in srgb, var(--text) 5%, transparent); color: var(--text); }` und `.set-nav a.active { background: var(--surface-2); border-color: var(--border); color: var(--text); font-weight: 500; }` (dunkel, wie .nav a.active). Für hell gilt `:root[data-theme="light"] .nav a.active, :root[data-theme="light"] .set-nav a.active { background: var(--surface); border-color: var(--border-2); }`. Statt eines inset-Schattens gibt es einen echten Rand. Weil der Grundrand transparent ist, springt nichts, wie bei .nav a. Das Darüberfahren bleibt schwächer als der aktive Zustand, weil das Menü keinen Leistenbalken hat. Das Gewicht 500 bleibt (headtest.js:60–64).
- ÄNDERN: Z. 1810 aktiv `background: var(--surface-2)` statt `var(--surface)`, Rand var(--border). Transparenter Grundrand (Z. 1807) und Hover 5 % (Z. 1809) wie spezifiziert.

## zustaende-S-M1a · Einstellungen: Schalter Christlicher Impuls, Audio behalten, Geld-blind ohne Neuaufbau

Gruppe zustaende · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-1
Quelle: audit/spec/zustaende.md Z. 742–747 · Dateien: web/js/screens/misc.js
Abhängig von: —

```text
### 3.16 `web/js/screens/misc.js`

**S-M1 Schalter ohne Neuaufbau** – bereich_einstellungen-1
- Z. 282 → `'faith-toggle'(el) { const on = S.settings.christlicherImpuls === false; S.setSetting('christlicherImpuls', on); el.setAttribute('aria-checked', String(on)); },`
- Z. 336 → `'voice-audio-toggle'(el) { const on = S.settings.voiceKeepAudio === false; S.setSetting('voiceKeepAudio', on); el.setAttribute('aria-checked', String(on)); },`
- Z. 337 → `'blind-toggle'(el) { const on = !S.settings.moneyBlind; S.setSetting('moneyBlind', on); fmt.setMoneyBlind(on, App.rUnit()); el.setAttribute('aria-checked', String(on)); U.toast(on ? 'Geld-blind-Modus an' : 'Geld-blind-Modus aus', 'ok'); },`
```

## zustaende-S-M3 · Regel löschen mit Rückfrage

Gruppe zustaende · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-39
Quelle: audit/spec/zustaende.md Z. 771–773 · Dateien: web/js/screens/misc.js
Abhängig von: —

```text
**S-M3 Regeln löschen mit Rückfrage** – bereich_einstellungen-39
Z. 341 → `async 'delete-rule'(el) { const r = S.data.rules.find(x => x.id === el.dataset.id); if (!r) return; if (await U.confirmModal('Regel löschen?', `„${esc(r.text)}“ wird gelöscht. Zum Pausieren reicht der Schalter.`, { ok: 'Löschen', danger: true })) { S.deleteRule(r.id); rerender(); } },`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: U.confirmModal] Die Schnittstelle bleibt gleich: confirmModal(title, text, {ok, danger}) gibt ein Promise<boolean> zurück. U3a baut nur das Dialog-Gerüst um, U3b ergänzt data-autofocus (bei danger auf „Abbrechen“, sonst auf der Bestätigung). Alle fünf Aufrufe aus zustaende passen damit zusammen: Titel enden auf „?“, OK-Knopf „Löschen“/„Verwerfen“ mit danger (Z8). Es gibt eine echte Abhängigkeit: S-A5 öffnet die Rückfrage ÜBER dem Check-in-Dialog. Ohne P4 löst „Abbrechen“ bzw. × der Rückfrage zuerst den eigenen Listener aus (closeModal, Motion.leave lässt den Knopf noch im DOM). Danach greift der globale [data-close]-Handler (app.js:280) und schließt zusätzlich den Check-in-Dialog. Deshalb kommt P4 vor S-A5. S-A5 schließt nach „Löschen“ den Check-in-Dialog weiter direkt mit U.closeModal() und nicht über requestClose. So löst der guard aus P14b keine zweite Rückfrage „Änderungen verwerfen?“ aus. Der Fokus nach dem Schließen passt: In S-RP1 setzt .then(go) den Fokus als Microtask, bevor restoreAfterModal per setTimeout(0) läuft. restoreAfterModal sieht den gesetzten Fokus und tut nichts.

## zustaende-S-M4 · Tags zurücksetzen: Knopf aus der Filterleiste unter die Tabelle, eindeutige Rückfrage

Gruppe zustaende · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-38
Quelle: audit/spec/zustaende.md Z. 774–778 · Dateien: web/js/screens/misc.js
Abhängig von: —

```text
**S-M4 Tags zurücksetzen** – bereich_einstellungen-38
- Z. 238: `<button type="button" class="btn sm" data-action="tags-reset">Zurücksetzen</button>` aus der Filterleiste entfernen.
- Im Tags-Zweig direkt nach dem schließenden `</div>` von `.tbl-wrap` einfügen: `<div class="row" style="margin-top:10px"><button type="button" class="btn ghost sm" data-action="tags-reset" style="color:var(--muted)">Tags auf Standard zurücksetzen</button></div>`
- Z. 354 `U.confirmModal('Tags zurücksetzen', …, { ok: 'Zurücksetzen', danger: true })` → `U.confirmModal('Tags auf Standard zurücksetzen?', 'Alle Tags werden auf die Standardliste zurückgesetzt. Beschreibungen gehen verloren, Trades bleiben unverändert.', { ok: 'Auf Standard zurücksetzen', danger: true })`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: U.confirmModal] Die Schnittstelle bleibt gleich: confirmModal(title, text, {ok, danger}) gibt ein Promise<boolean> zurück. U3a baut nur das Dialog-Gerüst um, U3b ergänzt data-autofocus (bei danger auf „Abbrechen“, sonst auf der Bestätigung). Alle fünf Aufrufe aus zustaende passen damit zusammen: Titel enden auf „?“, OK-Knopf „Löschen“/„Verwerfen“ mit danger (Z8). Es gibt eine echte Abhängigkeit: S-A5 öffnet die Rückfrage ÜBER dem Check-in-Dialog. Ohne P4 löst „Abbrechen“ bzw. × der Rückfrage zuerst den eigenen Listener aus (closeModal, Motion.leave lässt den Knopf noch im DOM). Danach greift der globale [data-close]-Handler (app.js:280) und schließt zusätzlich den Check-in-Dialog. Deshalb kommt P4 vor S-A5. S-A5 schließt nach „Löschen“ den Check-in-Dialog weiter direkt mit U.closeModal() und nicht über requestClose. So löst der guard aus P14b keine zweite Rückfrage „Änderungen verwerfen?“ aus. Der Fokus nach dem Schließen passt: In S-RP1 setzt .then(go) den Fokus als Microtask, bevor restoreAfterModal per setTimeout(0) läuft. restoreAfterModal sieht den gesetzten Fokus und tut nichts.

## zustaende-S-M5 · Design-Einstellungen: Standardfarben gelten ohne eigene Farbe als gewählt (auch im hellen Design)

Gruppe zustaende · Cluster einstellungen · Aufwand S · Befunde: farbe_kontrast-17
Quelle: audit/spec/zustaende.md Z. 779–783 · Dateien: web/js/screens/misc.js
Abhängig von: —

```text
**S-M5 Standardfarben gelten als gewählt** – farbe_kontrast-17
- Z. 130 am Ende: `const isDef = k => !col[k];`
- Z. 145 Akzent-Punkte `aria-pressed="${cur.accent.toLowerCase() === c}"` → `aria-pressed="${isDef('accent') ? c === T.DEFAULTS.dark.accent : cur.accent.toLowerCase() === c}"`
- Z. 134 Paare `aria-pressed="${cur.profit.toLowerCase() === p && cur.loss.toLowerCase() === l}"` → `aria-pressed="${isDef('profit') && isDef('loss') ? (p === T.DEFAULTS.dark.profit && l === T.DEFAULTS.dark.loss) : (cur.profit.toLowerCase() === p && cur.loss.toLowerCase() === l)}"`

```

## zustaende-S-M6 · Profil-Zeitzone: Browser-Zeitzone ergänzen und wählen, UTC immer in der Liste

Gruppe zustaende · Cluster einstellungen · Aufwand S · Befunde: referenz-36
Quelle: audit/spec/zustaende.md Z. 784–786 · Dateien: web/js/screens/misc.js
Abhängig von: —

```text
**S-M6 Zeitzone** – referenz-36
Z. 54 `timezones().map(…)` → `(() => { const tzs = timezones(); if (!tzs.includes('UTC')) tzs.push('UTC'); if (tz && !tzs.includes(tz)) tzs.unshift(tz); return tzs; })().map(…)` (Auswahl weiter über `z === tz`).

```

## barrierefreiheit-B12c · Lösch-× an Farbpunkten und Designs nach außen auf 24 px (.dot-x::before, .cp-x bleibt)

Gruppe barrierefreiheit · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-43, barrierefreiheit-46
Quelle: audit/spec/barrierefreiheit.md Z. 379–379 · Dateien: web/css/app.css
Abhängig von: —

```text
| nach Z. 467 (Lösch-× an Farben und Designs) | 16 × 16 | `.dot-x::before { content: ''; position: absolute; top: -6px; right: -6px; bottom: -2px; left: -2px; border-radius: 50%; }` (24 × 24 nach außen; `.cp-x` bleibt) | bereich_einstellungen-43, barrierefreiheit-46 |
```

## barrierefreiheit-C-misc-21 · Einstellungs-Menü: aria-current="page" am aktiven Bereich

Gruppe barrierefreiheit · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-21, barrierefreiheit-32
Quelle: audit/spec/barrierefreiheit.md Z. 843–843 · Dateien: web/js/screens/misc.js
Abhängig von: —

```text
- **Z. 21:** im Link `${sec === s[0] ? ' aria-current="page"' : ''}` ergänzen (Befunde: bereich_einstellungen-21, barrierefreiheit-32)
```

## barrierefreiheit-C-misc-93-145 · Farbpunkte benennen („Eigene Farbe {0}“, „Farbe {0} löschen“), Gruppe „Akzentfarbe“

Gruppe barrierefreiheit · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-20, barrierefreiheit-36
Quelle: audit/spec/barrierefreiheit.md Z. 844–845 · Dateien: web/js/screens/misc.js
Abhängig von: —

```text
- **Z. 93:** Punkt `aria-label="Eigene Farbe ${c}"`, × `aria-label="Farbe ${c} löschen"` (statt „Farbe löschen“) (Befunde: bereich_einstellungen-20, barrierefreiheit-36)
- **Z. 145:** `<div class="dots">` → `<div class="dots" role="group" aria-label="Akzentfarbe">`, jeder Preset-Punkt `aria-label="${n}"` (data-tip bleibt) (Befunde: bereich_einstellungen-20, barrierefreiheit-36)
```

## barrierefreiheit-C-misc-186-207 · Konten- und Regel-Liste: eindeutige Namen (Konto/Regel „{0}“ …)

Gruppe barrierefreiheit · Cluster einstellungen · Aufwand S · Befunde: barrierefreiheit-35, bereich_einstellungen-21
Quelle: audit/spec/barrierefreiheit.md Z. 846–847 · Dateien: web/js/screens/misc.js
Abhängig von: —

```text
- **Z. 186:** `aria-label="Bearbeiten"` → `aria-label="Konto „${esc(a.name)}“ bearbeiten"`, `aria-label="Löschen"` → `aria-label="Konto „${esc(a.name)}“ löschen"` (Befunde: barrierefreiheit-35, bereich_einstellungen-21)
- **Z. 207:** Schalter `aria-label="Aktiv"` → `aria-label="Regel „${esc(r.text)}“ aktiv"`, Papierkorb `aria-label="Löschen"` → `aria-label="Regel „${esc(r.text)}“ löschen"` (Befunde: barrierefreiheit-35, bereich_einstellungen-21)
```

## barrierefreiheit-C-misc-238-259 · Tags, Importe, Log: Suchfeld- und Listen-Namen

Gruppe barrierefreiheit · Cluster einstellungen · Aufwand S · Befunde: barrierefreiheit-37, barrierefreiheit-35, bereich_einstellungen-21
Quelle: audit/spec/barrierefreiheit.md Z. 848–851 · Dateien: web/js/screens/misc.js
Abhängig von: —

```text
- **Z. 238:** Tag-Suche bekommt zusätzlich `aria-label="Tags suchen"` (Befund: barrierefreiheit-37)
- **Z. 239:** `Tag „${esc(r.n)}“ bearbeiten` / `Tag „${esc(r.n)}“ löschen` (Befunde: barrierefreiheit-35, bereich_einstellungen-21)
- **Z. 255:** `aria-label="Eintrag entfernen"` → `aria-label="Import ${esc(x.file || when(x.at))} entfernen"` (Befund: bereich_einstellungen-21)
- **Z. 259:** Log-Suche bekommt zusätzlich `aria-label="Log-Typ suchen"` (Befund: barrierefreiheit-37)
```

## wording-S17.4-17.7 · Profil-Daten: „Sicherung importieren“, Beispieldaten-Text mit Replay nur bei App.on('replay'), „Löscht alle Daten …“, zweizeiliger Fuß mit Tastenkürzeln

Gruppe wording · Cluster einstellungen · Aufwand S · Befunde: wording-22, wording-21, wording-19, wording-20, bereich_shell-32
Quelle: audit/spec/wording.md Z. 583–586 · Dateien: web/js/screens/misc.js
Abhängig von: —

```text
| 17.4 | misc.js:65 Sicherung | `<b>Sicherung einspielen</b>` → `<b>Sicherung importieren</b>`; Hilfe `JSON-Datei aus einem Export. „Zusammenführen“ behält vorhandene Daten.` → `JSON-Datei aus einem Export. „Zusammenführen“ behält deine vorhandenen Daten, „Ersetzen“ überschreibt sie.` | wording-22 |
| 17.5 | misc.js:66 Beispieldaten | Hilfetext → `` `Rund 170 Trades über vier Monate (vor allem NQ und ES) mit Check-ins, Notizen, Sprachnotizen und Regeln, dazu vier Prop-Konten${App.on('replay') ? ' und Replay-Screenshots' : ''}. Schaltet im Schatten-Ich drei Vorschlagsregeln ein, wenn noch keine aktiv ist. Beim Entfernen bleiben deine eigenen Trades, Check-ins und Regeln erhalten.` `` (beide Fassungen als Schlüssel) | wording-21 |
| 17.6 | misc.js:68 | `Entfernt alle Daten aus diesem Browser. Vorher exportieren!` → `Löscht alle Daten in diesem Browser. Exportiere vorher eine Sicherung.` | wording-19 |
| 17.7 | misc.js:69 Fußzeile | ganze Zeile → `<div class="small faint">Deine Daten liegen nur in diesem Browser.${S.storageOK ? '' : ' <span class="neg">Speichern ist gerade nicht möglich (privates Fenster oder blockierte Website-Daten).</span>'}</div><div class="small faint">Tastenkürzel: <b>N</b> Trade loggen · <b>1–9</b> Bereich wechseln · <b>Esc</b> Dialog schließen</div>` | wording-20, bereich_shell-32 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: misc.profil] aufbau-C8c und farbe-C22b ändern in profil() verschiedene Teilstrings (Z. 41/54 Zeitzone, Z. 62 2FA-Knopf, Z. 68 Titel, Z. 69 Fußzeile) und vertragen sich. Z. 69 schreiben aber wording-S17.4-17.7 (17.7) und kilook-C24 als ganze Zeile neu, beide noch mit class="small faint". Für die Endfassung jeder Fußzeile in profil() gilt verbindlich: class="small muted", denn Fußnoten sind --muted und --faint ist nie für Wörter. Wo Tasten genannt werden, steht „1–9“. Welcher Wortlaut gilt (wording zweizeilig oder kilook ohne Tastatur-Teil), entscheidet diese Liste nicht.
- ÄNDERN: 17.7: Beide neuen Fußzeilen-`<div>` bekommen class="small muted" statt "small faint". Der Text bleibt wie spezifiziert.
- [doppelt: App.on] B7 und S5.9 sind unter „app.html keydown“ entschieden (B7 übernimmt). wording-S17.4-17.7 liest App.on('replay') nur für den Beispieldaten-Text (17.5) und ist damit verträglich. Die Fußzeile (17.7) gegen kilook-C24 wird in der Konfliktliste zu switchRow/.set-block entschieden, nicht hier.
- ÄNDERN: 17.7: nur die erste Zeile umsetzen, Text wie dort, Klasse small muted statt small faint. Die zweite Zeile „Tastenkürzel: N … · Esc Dialog schließen“ und ihr Schlüssel entfallen, weil kilook-C24 den Schalter „Tastenkürzel“ bringt. 17.4–17.6 unverändert.

## wording-S17.8-17.10 · Design-Reiter: „Design speichern“, Texte ohne „Website“/„Buttons“, Reset-Knopf „Auf Standard zurücksetzen“ ohne Symbol

Gruppe wording · Cluster einstellungen · Aufwand S · Befunde: wording-24, wording-23
Quelle: audit/spec/wording.md Z. 587–589 · Dateien: web/js/screens/misc.js
Abhängig von: —

```text
| 17.8 | misc.js:108 Meine Designs | `${I.plus} Aktuelles speichern` → `${I.plus} Design speichern` (Titel „Meine Designs“ bleibt) | wording-24 |
| 17.9 | misc.js:142 / 144 / 145 Design | `'Erscheinungsbild, Schrift und Farben. Wirkt sofort auf die ganze Website.'` → `'Erscheinungsbild, Schrift und Farben. Gilt sofort überall, auch auf der Startseite.'`; `Gilt für Text und Zahlen auf der ganzen Website.` → `Gilt für Text und Zahlen.`; `Buttons, aktive Einträge und Diagramme.` → `Hauptknöpfe, Schalter, Markierungen und Diagramme.` | wording-23 |
| 17.10 | misc.js:146 | `<button type="button" class="btn sm ghost" data-action="color-reset" style="margin-left:auto">${I.close} Standardfarben</button>` → `<button type="button" class="btn sm ghost" data-action="color-reset" style="margin-left:auto;color:var(--muted)">Auf Standard zurücksetzen</button>` | wording-24 |
```

## wording-S17.11-17.12 · Server-Reiter: Kopf „Server“ mit neuem Untertitel, Nutzerkennung mit Herkunft, Absatz 4 gekürzt

Gruppe wording · Cluster einstellungen · Aufwand M · Befunde: wording-14, bereich_einstellungen-46
Quelle: audit/spec/wording.md Z. 590–591 · Dateien: web/js/screens/misc.js
Abhängig von: —

```text
| 17.11 | misc.js:154 Server-Kopf | `head('Mentor', 'Dein Trading-Psychologie-Mentor läuft über einen eigenen Server, damit der API-Schlüssel nie im Browser landet.')` → `head('Server', 'Mentor, Coach, News und die Auswertung von Sprachnotizen laufen über deinen Journalyst-Server. Der API-Schlüssel bleibt dort und nie im Browser.')` (Felder Z. 156–157 mit Pfaden und Platzhaltern bleiben, das ist der Server-Bereich, W11) | wording-14 |
| 17.12 | misc.js:161 „So funktioniert es“ | Absatz 3 je nach Fall: `const p = S.settings.profile \|\| {};` → Benutzername gesetzt: `Nutzerkennung: <b>${esc(p.username)}</b> (Benutzername aus dem Profil).`; nur E-Mail: `Nutzerkennung: <b>${esc(p.email)}</b> (E-Mail aus dem Profil). Lege im Profil einen Benutzernamen fest, um sie zu ändern.`; sonst: `Nutzerkennung: <b>${esc(S.userId())}</b> (Gerätekennung). Lege im Profil einen Benutzernamen fest, um sie zu ändern.` Absatz 4 `Derselbe Server trägt auch den <a href="#/coach">Coach Mode</a> (Gruppen, Journal-Ansicht und Notizen des Mentors). Dafür legt Journalyst einen eigenen geheimen Schlüssel an, der nur auf diesem Gerät liegt.` → `Für <a href="#/coach">Coach</a> legt Journalyst zusätzlich einen geheimen Schlüssel an, der nur auf diesem Gerät liegt.` (Absätze 1 und 2 bleiben; „Tageslimit“ dort = Nachrichtenkontingent, bleibt) | bereich_einstellungen-46, wording-14 |
```

## wording-S17.19-17.21 · Trading: Schalter „Beträge als R zeigen“, Monte-Carlo-Durchläufe mit fmt.int und value-Attribut, „Tagesverlustlimit“ im Tilt-Text

Gruppe wording · Cluster einstellungen · Aufwand S · Befunde: wording-28, bereich_einstellungen-34, wording-29, wording-10
Quelle: audit/spec/wording.md Z. 598–600 · Dateien: web/js/screens/misc.js
Abhängig von: —

```text
| 17.19 | misc.js:197 Geld-blind | `switchRow('Geld-blind-Modus', 'Blendet überall alle Geldbeträge aus und zeigt stattdessen R-Multiples (z. B. „+2,1 R“). Der Kontostand wird komplett ausgeblendet. Trades ohne Stop zeigen „– R“.', 'blind-toggle', …)` → `switchRow('Beträge als R zeigen', 'Zeigt R-Multiples statt Geldbeträgen (z. B. „+2,1 R“) und blendet den Kontostand aus. Trades ohne Stop zeigen „– R“.', 'blind-toggle', …)` (h3 „Geld-blind-Modus“ und Toast Z. 337 bleiben) | wording-28, bereich_einstellungen-34 |
| 17.20 | misc.js:199 | Label `Ruin-Schwelle Monte Carlo (% Drawdown)` → `Ruin-Schwelle für Monte Carlo (% Drawdown)`; Option `<option ${st.mcRuns === n ? 'selected' : ''}>${n}</option>` → `<option value="${n}" ${st.mcRuns === n ? 'selected' : ''}>${fmt.int(n)}</option>` (das `value` ist Pflicht, sonst speichert `Number('1.000')` den Wert 1, misc.js:335) | wording-29 |
| 17.21 | misc.js:200 Tilt-Warnungen | `… Revenge-Trades und erreichtem Tageslimit.` → `… Revenge-Trades und erreichtem Tagesverlustlimit.` | wording-10 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: switchRow] switchRow bekommt die Fassung aus barrierefreiheit-C-misc-15: id je Aufbau über swN, <label for> mit .set-row-l, aria-describedby, kein aria-label. Die Signatur (title, text, action, on, extra) bleibt, deshalb laufen alle Aufrufer unverändert weiter, und C-misc-15 kommt zuerst. GELD-BLIND: Der Schalter heißt „Beträge als R zeigen“, Text aus wording-S17.19. Blocktitel „Geld-blind-Modus“ und Toast bleiben. Grund: Wording hat die Texthoheit (K13). Der Name sagt, was passiert (R statt Geld, Kontostand weg). Außerdem heißt im Zertifikat schon ein anderer Schalter „Beträge ausblenden (nur % bzw. R)“ (certificate.js:74), und ein Name für zwei Funktionen verletzt W2. TRADING: Markup aus komponenten-S-misc-e (Einheit im Feld, Tilt-Schalter, kein Speichern-Knopf). Labels: „Tagesverlustlimit“ und „Ruin-Schwelle für Monte Carlo (Drawdown)“, bei beiden steht „%“ im Feld. „für Monte Carlo“ kommt aus wording-29, die Einheit wandert laut komponenten ins Feld. Tilt-Schaltertext: „Warnt auf dem Dashboard bei Verlustserien, Größenerhöhung nach Verlust, Revenge-Trades und erreichtem Tagesverlustlimit.“ Wrapper class="mt-3" statt style="margin-top:14px". Durchläufe-Optionen mit value und fmt.int (wording 17.20). Der Hinweis aus aufbau-C8b steht als letztes Kind des .field hinter dem .inp-cur-Wrapper: „Prozent der Kontogröße. Gilt für Tilt-Warnungen und die automatischen Regeln im Fortschritt.“ Er trägt die Bezugsgröße, die mit „(% vom Konto)“ aus dem Label fällt. BENACHRICHTIGUNGEN, Endmarkup aus abstaende-L4, wording-S17.13-17.15 und aufbau-C8d: <div class="set-block"><h3>Recaps</h3><div class="set-desc">Zusammenfassungen deiner Trades. Sie erscheinen als Hinweis oben auf dem Dashboard.</div><div class="stack s-4">${switchRow('Wochen-Recap', 'Jeden Montag eine Zusammenfassung der Vorwoche, wenn du darin mindestens 4 Trades geschlossen hast.', 'notif-toggle', n.weekly === true, 'data-key="weekly"')}${switchRow('Monats-Recap', 'Am 2. jedes Monats eine Zusammenfassung des Vormonats, wenn du darin mindestens 4 Trades geschlossen hast.', 'notif-toggle', n.monthly === true, 'data-key="monthly"')}</div></div><div class="set-block"><h3>Hinweis-Punkte in der Seitenleiste</h3><div class="set-desc">(Satz unverändert)</div><div class="stack s-4">${switchRow('Hinweis-Punkte anzeigen', 'Alle Punkte auf einmal ein- oder ausschalten.', 'navdot-toggle', nd.on, 'data-key="on"')}<div class="set-sub"${nd.on ? '' : ' aria-disabled="true"'}>${App.NAV_DOT_AREAS.map(([k, label, desc]) => switchRow(label, desc, 'navdot-toggle', nd[k] !== false, `data-key="${k}"${nd.on ? '' : ' disabled'}`)).join('')}</div></div></div>. PROFIL: Block „Bedienung“ mit Schalter „Tastenkürzel“ (kilook-C24) direkt vor „Daten und Sicherung“. WCAG 2.1.4 verlangt abschaltbare Ein-Zeichen-Kürzel. Die Fußzeile wird einzeilig mit dem Text aus wording-17.7 und der Klasse aus farbe-C22. Die zweite Kürzel-Zeile aus wording-17.7 entfällt, weil der Schalter sie trägt; Esc wirkt immer. Neue Schalter-Aktionen setzen nur aria-checked, ohne Neuaufbau (zustaende Z9). Der Notebook-Schalter aus komponenten-S-misc-g bleibt wie spezifiziert, weil Notebook-To-dos laut zustaende das Durchstreichen behalten.
- ÄNDERN: 17.19 unverändert, übernimmt den Schaltertitel. 17.20: Label → „Ruin-Schwelle für Monte Carlo (Drawdown)“ ohne „%“, denn das „%“ steht nach komponenten-S-misc-e im Feld (en „Monte Carlo ruin threshold (drawdown)“). Option mit value und fmt.int bleibt. 17.21: Der Satz gehört in den neuen Tilt-Schalter aus komponenten-S-misc-e, weil die alte Checkbox entfällt. Wortlaut: „… Revenge-Trades und erreichtem Tagesverlustlimit.“

## bewegung-C7a · Design- und Theme-Karten: kein Anheben, Plus-Symbol ohne Vergrößerung

Gruppe bewegung · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-42
Quelle: audit/spec/bewegung.md Z. 272–278 · Dateien: web/css/app.css
Abhängig von: —

```text
**C7 Einstellungen → Design und Farbwähler** (bereich_einstellungen-42; Selektoren statt Zeilen, K21)
- `.dc-prev` (Z. 1827): `transition: box-shadow var(--dur-1) var(--ease), transform var(--dur-1) var(--ease);` → `transition: box-shadow var(--dur-1) var(--ease);`
- `.design-card:hover .dc-prev { transform: translateY(-1px); }` (Z. 1829) löschen.
- `.tc-prev` (Z. 1839): wie `.dc-prev` kürzen.
- `.theme-card:hover .tc-prev { transform: translateY(-1px); }` (Z. 1840) löschen.
- Z. 1854 `.theme-card.t-custom.is-new .tc-prev > svg { …; transition: transform var(--dur-1) var(--ease), color var(--dur-1) var(--ease); }` → `transition: color var(--dur-1) var(--ease);`
- Z. 1855 → `.theme-card.t-custom.is-new:hover .tc-prev > svg { color: var(--text); }`
```

## bewegung-C7b · Akzentpunkte und Farbpaar-Karten: Ring bzw. Rand statt Vergrößerung

Gruppe bewegung · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-42
Quelle: audit/spec/bewegung.md Z. 279–284 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 1935 `.dot { …; transition: transform var(--dur-1) var(--ease); }` → `transition: box-shadow var(--dur-1) var(--ease), border-color var(--dur-1) var(--ease), color var(--dur-1) var(--ease);`
- Z. 1936 → `.dot:hover { box-shadow: 0 0 0 1px var(--text-2); }` (bleibt **vor** der Auswahlregel).
- Z. 1937 → `.dot[aria-pressed="true"] { box-shadow: 0 0 0 2px var(--text); }` (`transform: scale(1.08)` streichen).
- Nach Z. 1942 (`.dot.custom { … }`) neu: `.dot.custom:hover { border-color: var(--text-2); color: var(--text); }`
- Z. 1945 `.pair-card { …; transition: border-color var(--dur-1) var(--ease), transform var(--dur-2) var(--ease); }` → `transition: border-color var(--dur-1) var(--ease);`
- Z. 1949 → `.pair-card:hover { border-color: var(--text-2); }`
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .dot[aria-pressed="true"]] Die Regel lautet `.dot[aria-pressed="true"] { box-shadow: 0 0 0 1.5px var(--text); }`, ohne transform. Weil die Skalierung auch beim Darüberfahren entfällt, braucht es kein `transform: none`. Begründung: Die Ringstärke 1,5 px ist dieselbe wie bei den gewählten Theme- und Design-Karten aus komponenten-C27 (0 0 0 2px var(--surface), 0 0 0 3.5px var(--text)) und bei den Heute-Ringen. Damit hat die Auswahl auf der ganzen Design-Seite eine Ringstärke. Den Abstand bildet der 3-px-Rand des Punkts in --surface. Der Hover-Ring (1px --text-2) bleibt klar schwächer. Die übrigen Teile von bewegung-C7b (transition, .dot:hover, .dot.custom:hover, .pair-card) bleiben unverändert.
- ÄNDERN: Z. 1937 wird zu `.dot[aria-pressed="true"] { box-shadow: 0 0 0 1.5px var(--text); }` statt 2px. Rest wie spezifiziert.
