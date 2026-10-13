# Paket 037 · einstellungen, aufbau

Schritte: 23 · Dateien: web/README.md, web/css/app.css, web/e2e/navdottest.js, web/e2e/settest.js, web/js/screens/misc.js
Betroffene Tests laut Spezifikation: web/e2e/mentortest.js:24; web/e2e/navdottest.js:37; web/e2e/settest.js:26 bleibt (be-reset setzt C.setBreakEven), nur prüfen; web/e2e/settest.js:36; web/e2e/settest2.js:47
Baut auf Paketen auf: 28, 31, 32, 36

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

## aufbau-D3e · Test navdottest.js: Unterschalter deaktiviert statt ausgeblendet

Gruppe aufbau · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-33
Quelle: audit/spec/aufbau.md Z. 709–709 · Dateien: web/e2e/navdottest.js
Abhängig von: aufbau-C8d

```text
- `navdottest.js:37`: bei Hauptschalter aus 8 `[data-action=navdot-toggle]`, davon 7 `disabled`, keine `.nav-dot` in `#sidebar`
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

## zustaende-S-C9c · Sprachkarte: Hover --text-2, Sprach-Chip neutral mit Ring --border-2

Gruppe zustaende · Cluster einstellungen · Aufwand S · Befunde: farbe_kontrast-25
Quelle: audit/spec/zustaende.md Z. 327–329 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 1921 `.lang-card:hover { border-color: var(--accent); }` → `{ border-color: var(--text-2); }`
- Z. 1926 `.lang-card[aria-pressed="true"] .lang-cur { color: var(--accent); background: transparent; box-shadow: inset 0 0 0 1px var(--accent); }` → `{ color: var(--text-2); background: transparent; box-shadow: inset 0 0 0 1px var(--border-2); }`

```

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

## zustaende-S-M1b · Einstellungen: Break-even-Segment und -Zurücksetzen sofort wirksam (C.setBreakEven) ohne Neuaufbau

Gruppe zustaende · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-1
Quelle: audit/spec/zustaende.md Z. 748–761 · Dateien: web/js/screens/misc.js
Abhängig von: —

```text
- Z. 333 → 
```js
'be-mode'(el) { const form = el.closest('form'); const be = Object.assign({}, S.settings.beOffset || {}, { mode: el.dataset.value }); if (form) { be.from = Math.min(0, Number(form.querySelector('#be-from').value) || 0); be.to = Math.max(0, Number(form.querySelector('#be-to').value) || 0); }
  S.setSetting('beOffset', be); C.setBreakEven(be); el.parentElement.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === el)));
  el.closest('.set-block').querySelectorAll('.input-unit span').forEach(s => { s.textContent = be.mode === 'pct' ? '%' : S.currency(); }); },
```
- Z. 334 →
```js
'be-reset'(el) { const be = { mode: 'abs', from: 0, to: 0 }; S.setSetting('beOffset', be); C.setBreakEven(be); const b = el.closest('.set-block');
  b.querySelector('#be-from').value = '0'; b.querySelector('#be-to').value = '0'; b.querySelectorAll('[data-action="be-mode"]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.value === 'abs')));
  b.querySelectorAll('.input-unit span').forEach(s => { s.textContent = S.currency(); }); },
```
Kein eigener `App.glideSwitch`-Aufruf (läuft über app.js:282).

```

## zustaende-S-M3 · Regel löschen mit Rückfrage

Gruppe zustaende · Cluster einstellungen · Aufwand S · Befunde: bereich_einstellungen-39
Quelle: audit/spec/zustaende.md Z. 771–773 · Dateien: web/js/screens/misc.js
Abhängig von: —

```text
**S-M3 Regeln löschen mit Rückfrage** – bereich_einstellungen-39
Z. 341 → `async 'delete-rule'(el) { const r = S.data.rules.find(x => x.id === el.dataset.id); if (!r) return; if (await U.confirmModal('Regel löschen?', `„${esc(r.text)}“ wird gelöscht. Zum Pausieren reicht der Schalter.`, { ok: 'Löschen', danger: true })) { S.deleteRule(r.id); rerender(); } },`

```

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

## wording-S17.2-17.3 · Profil: Privatsphäre-Texte („Support-Team-Zugriff erlauben“), 2FA-Text ehrlich, 2FA-Knopf neutral

Gruppe wording · Cluster einstellungen · Aufwand S · Befunde: wording-17, wording-25, wording-18
Quelle: audit/spec/wording.md Z. 581–582 · Dateien: web/js/screens/misc.js
Abhängig von: —

```text
| 17.2 | misc.js:60 Privatsphäre | Untertitel `So gehen wir mit deinen Daten um.` → `Wer außer dir dein Journal sehen darf.`; Titel `Support-Team Zugriff auf mein Konto erlauben` → `Support-Team-Zugriff erlauben`; Text `Wenn aktiviert, kann das Support-Team auf dein Konto zugreifen, um dir besser zu helfen und Fehler zu finden.` → `Ist das an, darf das Support-Team dein Journal einsehen, um dir zu helfen und Fehler zu finden.` (Schalter und „Speichern“ bleiben bis F2) | wording-17, wording-25 |
| 17.3 | misc.js:62 2FA | Beschreibung `Zusätzliche Sicherheit für dein Konto über eine Authenticator-App (z. B. Google Authenticator, Authy).` → `Schützt die Anmeldung mit einer Authenticator-App (z. B. Google Authenticator, Authy). Verfügbar, sobald es Benutzerkonten gibt.`; Knopf `class="btn primary sm" data-action="twofa"` → `class="btn sm" data-action="twofa"` (Text und Dialog bleiben) | wording-18 |
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
