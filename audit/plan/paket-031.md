# Paket 031 · konto, dashboard

Schritte: 21 · Dateien: web/css/app.css, web/e2e/affiliatetest.js, web/e2e/coachtest.js, web/js/certificate.js, web/js/coach.js, web/js/screens/affiliate.js, web/js/screens/coach.js, web/js/screens/dashboard.js
Betroffene Tests laut Spezifikation: prüfen: PNG-Export pixelgleich (6 Paare, Abschnitt 4); prüfen: e2e/certtest.js, web/tests/cert.test.mjs; prüfen: e2e/certtest.js:17 (-webkit-text-fill-color: var(--c-acc) bleibt), :24; prüfen: e2e/coachtest.js:84 (.pill-Text „Mentor“); prüfen: e2e/coachtest.js:84, :96, :153 (.mentor-note, .pill, .mn-head b, .mn-text); prüfen: e2e/mentortest.js (KI-Hinweis .mentor-note, app.css:2363 unverändert); web/e2e/affiliatetest.js:16; web/e2e/affiliatetest.js:20; web/e2e/affiliatetest.js:23; web/e2e/affiliatetest.js:46; web/e2e/coachlang.js:14; web/e2e/coachtest.js (Server nötig); web/e2e/coachtest.js:169–170; web/e2e/coachtest.js:169–170 (Schritt zustaende-S-TE5); web/e2e/coachtest.js:37
Baut auf Paketen auf: 6, 7, 30

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## zustaende-S-D3 · Dashboard: Zertifikat-Menü ohne festen Tag aufrufen

Gruppe zustaende · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-30
Quelle: audit/spec/zustaende.md Z. 501–503 · Dateien: web/js/screens/dashboard.js
Abhängig von: zustaende-S-Z1

```text
**S-D3 Zertifikat-Menü** – bereich_dashboard-30
Z. 125 `root.Certificate.menuHTML({ day: todayKey })` → `root.Certificate.menuHTML({})`.

```

## zustaende-S-Z2 · Zertifikat: Menü schließen, bevor der Dialog öffnet

Gruppe zustaende · Cluster konto · Aufwand S · Befunde: bereich_dashboard-30
Quelle: audit/spec/zustaende.md Z. 512–514 · Dateien: web/js/certificate.js
Abhängig von: —

```text
**S-Z2 Menü schließen** – bereich_dashboard-30
Z. 115 `'cert-open'(el) { open(el.dataset.kind, el.dataset.ref); }` → `'cert-open'(el) { App.closePopovers(); open(el.dataset.kind, el.dataset.ref); }`

```

## zustaende-S-CO1 · Coach-Abgleich: Neuzeichnen im finally von runSync (Status verschwindet nach jedem Abgleich)

Gruppe zustaende · Cluster konto · Aufwand S · Befunde: bereich_konto-14
Quelle: audit/spec/zustaende.md Z. 599–603 · Dateien: web/js/coach.js
Abhängig von: —

```text
### 3.9 `web/js/coach.js`

**S-CO1 Status nach jedem Abgleich** – bereich_konto-14
In `runSync` (Z. 153–165): vor `try` `let fresh = [];`; im `try` `const fresh = takeNotes(…)…` → `fresh = takeNotes(…)…`; `if (fresh.length) { announce(fresh); refreshView(); }` → `if (fresh.length) announce(fresh);`; im `finally` nach `state.syncing = false;` ergänzen: `if (fresh.length || App.state.route === 'coach') refreshView();`. screens/coach.js:207 bleibt.

```

## zustaende-S-CS1 · Coach: Fehlerbanner in Warn-Optik mit „Erneut versuchen“ im trailing

Gruppe zustaende · Cluster konto · Aufwand S · Befunde: zustaende-18
Quelle: audit/spec/zustaende.md Z. 810–814 · Dateien: web/js/screens/coach.js
Abhängig von: —

```text
### 3.18 `web/js/screens/coach.js`

**S-CS1 Fehlerbanner** – zustaende-18
Z. 27 → `function errorBox(msg, retry) { return U.banner('warn', '', esc(msg), retry ? { trailing: `<button type="button" class="btn sm" data-action="${retry}">${I.refresh} Erneut versuchen</button>` } : {}); }`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: U.banner] Alle sechs Änderungen gelten; doppelt ist nur dashboard.js:130 (das sparkle-Symbol). Endstand: dashboard.js:130 `U.banner('info', 'Willkommen', …, { trailing: … }` mit „CSS importieren“ und zwei neutralen `btn sm`, ohne icon (farbe-C19c). shadow.js:58 ohne `icon: 'sparkle'` (kilook-C15). prop.js:97 `U.banner('ok', 'Ziel erreicht', …)` (farbe-C26b). prop.js:279/280 ohne den letzten info-Zweig und ohne warn (aufbau-C12e). Dazu eine Lücke: Der Erfolgs-Zweig `U.banner('accent', plan.funded ? 'Bereit für den Payout' : 'Challenge bestanden', …)` in Z. 279 wird `U.banner('ok', …)`. Grund: Die Farbe-Spezifikation benennt `.banner.accent` in `.banner.ok` um; ohne diese Änderung stünde das Banner ohne Stil da. coach.js:27 errorBox wie zustaende-S-CS1. Abnahme: `grep -rnE "banner\('accent'|icon: 'sparkle'" web/js` findet nichts mehr (I.sparkle wird gelöscht).

## zustaende-S-CS3 · Coach-Fuß: sichtbarer Text „Wird geladen …“ neben der Hintergrund-Ladeanzeige

Gruppe zustaende · Cluster konto · Aufwand S · Befunde: bewegung-13
Quelle: audit/spec/zustaende.md Z. 818–820 · Dateien: web/js/screens/coach.js
Abhängig von: —

```text
**S-CS3 Text neben der Hintergrund-Ladeanzeige** – bewegung-13
Z. 58 `${s.loading ? U.loader('sm', 'Lädt') : ''}` → `${s.loading ? `<span class="ld-row">${U.loader('sm', 'Lädt')}<span class="muted" aria-hidden="true">Wird geladen …</span></span>` : ''}`

```

## zustaende-S-CS4 · Coach-Benachrichtigungen: E-Mail-Schalter speichert sofort, ohne Adresse Toast und Fokus, Knopf „Adresse speichern“

Gruppe zustaende · Cluster konto · Aufwand S · Befunde: bereich_konto-15
Quelle: audit/spec/zustaende.md Z. 821–832 · Dateien: web/js/screens/coach.js
Abhängig von: —

```text
**S-CS4 E-Mail-Schalter speichert sofort** – bereich_konto-15
- Z. 364 →
```js
async 'coach-mail-toggle'(el) { const f = el.closest('form'); const email = String(new FormData(f).get('email') || '').trim(); const on = el.getAttribute('aria-checked') !== 'true';
  if (on && !email) { f.querySelector('input[name=email]').focus(); return U.toast('Trage zuerst eine E-Mail-Adresse ein', 'err'); }
  el.setAttribute('aria-checked', String(on));
  try { const r = await Co.saveNotify(email, on); st().mail = r.mail; U.toast(on ? (r.mail ? 'E-Mail-Benachrichtigung an' : 'Gespeichert. Der Server verschickt noch keine Mails.') : 'E-Mail-Benachrichtigung aus', 'ok'); App.rerender(); }
  catch (e) { el.setAttribute('aria-checked', String(!on)); fail(e); } },
```
- Z. 367 `'Bitte eine E-Mail-Adresse eintragen'` → `'Trage zuerst eine E-Mail-Adresse ein'`.
- Z. 77 Knopf `Speichern` → `Adresse speichern` (Handler `coach-notify-save` bleibt).

```

## zustaende-S-CS5 · Coach: leere Gruppe ohne Zeitraum-Umschalter, Leertext nennt den Einladungslink

Gruppe zustaende · Cluster konto · Aufwand S · Befunde: bereich_konto-44
Quelle: audit/spec/zustaende.md Z. 833–836 · Dateien: web/js/screens/coach.js
Abhängig von: —

```text
**S-CS5 Leere Gruppe** – bereich_konto-44
- Z. 121 `<div class="row between coach-ctl">…</div>` nur ausgeben, wenn nicht `rows && !rows.length` (während des Ladens, `rows === null`, bleibt er).
- Z. 112 Besitzer-Text → „Schick den Einladungslink oben an deine Schüler. Wer beitritt, erscheint hier mit Kurz-Stats.“ Kein zusätzlicher Knopf.

```

## zustaende-S-TE5 · Test coachtest.js:169–170: nur E-Mail-Schalter klicken, Toast „E-Mail-Benachrichtigung an“

Gruppe zustaende · Cluster konto · Aufwand S · Befunde: bereich_konto-15
Quelle: audit/spec/zustaende.md Z. 881–881 · Dateien: web/e2e/coachtest.js
Abhängig von: zustaende-S-CS4

```text
- `e2e/coachtest.js:169–170`: nach dem Ausfüllen nur `[data-action=coach-mail-toggle]` klicken (kein Submit), dann Toast „E-Mail-Benachrichtigung an“ prüfen.
```

## barrierefreiheit-C-coach-87 · Coach-Schülerliste: Name als Link .row-link

Gruppe barrierefreiheit · Cluster konto · Aufwand S · Befunde: bereich_konto-12, barrierefreiheit-4
Quelle: audit/spec/barrierefreiheit.md Z. 792–793 · Dateien: web/js/screens/coach.js
Abhängig von: barrierefreiheit-B7

```text
- **Z. 87:** `<span class="sym no-i18n">${esc(r.name)}</span>` → `<a class="sym no-i18n row-link" href="#/coach/g/${esc(encodeURIComponent(gid))}/s/${esc(encodeURIComponent(r.user_id))}">${esc(r.name)}</a>` (Befunde: bereich_konto-12, barrierefreiheit-4)

```

## barrierefreiheit-C-affiliate-51 · Affiliate-Reiter: aria-pressed an <a> streichen

Gruppe barrierefreiheit · Cluster konto · Aufwand S · Befunde: barrierefreiheit-32
Quelle: audit/spec/barrierefreiheit.md Z. 873–876 · Dateien: web/js/screens/affiliate.js
Abhängig von: barrierefreiheit-B9b

```text
#### `web/js/screens/affiliate.js`

- **Z. 51:** `aria-pressed="${view === k}"` an den `<a>` streichen (Befund: barrierefreiheit-32)

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .prop-tabs a] Die Schiene aus komponenten-C19 ist die einzige Regel für `.tabs > button, .tabs > a, .prop-tabs a`, mit Skalenwerten statt 13.5/12.5 px: `display: inline-flex; align-items: center; height: 34px; padding: 0 12px; border: 1px solid transparent; border-radius: 9px; background: none; color: var(--text-2); font-size: var(--fs-14); line-height: var(--lh-14); font-weight: 500; …` (Rest wie C19). Fokus: `.tabs > button:focus-visible, .tabs > a:focus-visible, .prop-tabs a:focus-visible { outline-offset: -2px; }`, nur der Versatz. Farbe und Stärke kommen aus der globalen :focus-visible-Regel, nach barrierefreiheit-A1 var(--focus), nie --accent. Handy ≤560: `.prop-tabs a { flex: 1 1 auto; justify-content: center; padding: 0 4px; font-size: var(--fs-13); line-height: var(--lh-13); }`. Handy Z. 3054: `.tabs > button, .tabs > a { padding: 0 12px; font-size: var(--fs-13); line-height: var(--lh-13); }`. Gewählt über die gemeinsame Regel am Dateiende mit `.prop-tabs a[aria-current="page"]` (barrierefreiheit-B9b). Erst danach streichen prop.js 304/305 und affiliate.js 51 das aria-pressed (inkl. der Testanpassungen barrierefreiheit.md Z. 905–907). Grund: Reiter = 14/500 laut Typografie-Rollen, 12.5/13.5 sind verboten, Grün nie für Fokus (BRIEF, barrierefreiheit Z1).

## kilook-B3 · Mentor-Notiz im Coach Mode neutral ohne Streifen, Selektor .mentor-notes > .mentor-note, Trennlinien durchgezogen

Gruppe kilook · Cluster konto · Aufwand M · Befunde: bereich_konto-17, ki_look-33
Quelle: audit/spec/kilook.md Z. 421–435 · Dateien: web/css/app.css
Abhängig von: —

```text
**B3 · web/css/app.css:2880–2916 · Mentor-Notiz** (bereich_konto-17, ki_look-33)
- **2880** Kommentar → `/* Mentor-Notiz (Coach): neutrale Fläche mit feinem Rand und Kopfzeile (Pille „Mentor“, Name, Zeit); gilt nur innerhalb von .mentor-notes */`
- **2882** `.mentor-notes.in-note { …; border-top: 1px dashed var(--border-2); }` → `border-top: 1px solid var(--border);`
- **2884** vorher `.mentor-note { position: relative; padding: 10px 12px 10px 16px; border-radius: 10px; background: color-mix(in srgb, var(--warn) 6%, var(--surface-2)); border: 1px solid color-mix(in srgb, var(--warn) 28%, var(--border)); }`
  → nachher `.mentor-notes > .mentor-note { padding: 10px 12px; border-radius: 10px; background: var(--surface-2); border: 1px solid var(--border); }`
- **2885** `.mentor-note::before { … }` löschen.
- **2886–2889** den Selektor-Anfang `.mentor-note` → `.mentor-notes > .mentor-note`:
  - `… .mn-head`
  - `… .mn-head b`
  - `… .mn-text`
  - `… .mn-edit`
- **2914** `.mn-thread { …; border-top: 1px dashed color-mix(in srgb, var(--warn) 22%, var(--border)); }` → `border-top: 1px solid var(--border);`
- **2916** `.mn-reply.mentor { background: color-mix(in srgb, var(--warn) 5%, transparent); }` → `.mn-reply.mentor { background: color-mix(in srgb, var(--text) 4%, transparent); }`
- **2363** `.mentor-note { padding: 0 18px 12px; }` (KI-Hinweis im Mentor-Chat) **unverändert**.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .mentor-note] .mentor-note steht künftig nur noch für die Coach-Notiz. Der KI-Hinweis im Mentor-Chat wird zu `.mentor-disclaimer`: mentor.js Z. 85 `<div class="mentor-disclaimer small">…</div>` (komponenten-S-mentor-a) und app.css Z. 2363 `.mentor-disclaimer { padding: 0 18px 12px; color: var(--muted); }` (komponenten-C31). Dazu kommen `.mentor` → `.mentor-chat` in Z. 2344/2364 und `card mentor` → `card mentor-chat` in Z. 81. Damit ist das Ziel von farbe-C21 (Hinweis in --muted statt --faint) erreicht, ohne Klasse `muted`. kilook-B3 läuft unverändert: Selektor `.mentor-notes > .mentor-note`, Fläche --surface-2, Rand --border, ::before gelöscht. Heute bekommt der KI-Hinweis wegen der gleichen Klasse die gelbe Notizfläche samt Streifen, weil Z. 2884/2885 nach Z. 2363 stehen. Beide Schritte beheben das, die Reihenfolge ist egal. coachtest.js:84/153 (`.coach-entry … .mentor-note`) bleibt gültig.
- ÄNDERN: Den letzten Punkt („2363 `.mentor-note { padding: 0 18px 12px; }` unverändert“) streichen: komponenten-C31 benennt diese Regel in `.mentor-disclaimer` um. Alle anderen Punkte wie spezifiziert.

## kilook-C11 · Zertifikat-Markup: Schriftzug ohne <em>, .issue .line löschen

Gruppe kilook · Cluster konto · Aufwand S · Befunde: ki_look-31, bereich_shell-35
Quelle: audit/spec/kilook.md Z. 616–619 · Dateien: web/js/certificate.js
Abhängig von: —

```text
**C11 · web/js/certificate.js** (ki_look-31, bereich_shell-35)
- **33** `<span class="name">Journal<em>yst</em></span>` → `<span class="name">Journalyst</span>`
- **39–40** in beiden `.issue` das `<div class="line"></div>` löschen.

```

## kilook-C3 · Zertifikat-CSS: tote Navy/Hell-Variablen, Verlaufstext, Kurslinie entfernen

Gruppe kilook · Cluster konto · Aufwand M · Befunde: ki_look-31
Quelle: audit/spec/kilook.md Z. 535–552 · Dateien: web/css/app.css
Abhängig von: kilook-C11

```text
**C3 · web/css/app.css · Zertifikat-Grundregeln** (ki_look-31; zusammen mit C11)
- **1973–1974** im Kommentar „…, feiner Kartenrahmen und im Hintergrund die Kurslinie aus der Ladeanzeige.“ → „…, feiner Kartenrahmen.“
- **1977** in `.cert { … }` `--c-line: rgba(208, 215, 255, .6);` streichen.
- **1978** die ganze Zeile löschen (`--c-glow`, `--c-glow2`, `--c-bar`, `--c-band`, `--c-band2`).
- **1979** die ganze Zeile löschen (`--g1`, `--g2`, `--gn1`, `--gn2`).
- **1993–1995** die drei Kommentarzeilen (zweimal Kurslinie, „Rahmenecken (nur Navy und Hell)“) löschen.
- **1997** `/* ---------- Navy und Hell ---------- */` → `/* ---------- Grundregeln (Aufbau und Formate) ---------- */`
- **2000** `.cert-brand { …; color: var(--g1); … }` → `color: var(--c-text);`
- **2002–2003** in `.cert-title .ct-big` die ganze zweite Zeile `background: linear-gradient(…); -webkit-background-clip: text; background-clip: text; color: transparent; -webkit-text-fill-color: transparent;` löschen. Die Regel endet mit `white-space: nowrap; }`.
- **2010** vorher `.cert-value span { display: inline-block; padding-bottom: .04em; background: linear-gradient(…); -webkit-background-clip: text; background-clip: text; color: transparent; -webkit-text-fill-color: transparent; }`
  → nachher `.cert-value span { display: inline-block; padding-bottom: .04em; }`. `display: inline-block` bleibt, sonst verliert die Ergebnis-Pille Innenabstand und Rundung.
- **2011** `.cert[data-sign="neg"] .cert-value span { background-image: … }` löschen.
- **2022** `.cert-foot .issue .line { … }` löschen.
- **2049** `.cert[data-theme="app"] .cert-brand .name em { … }` löschen (nach C11).
- **2052** in `.cert[data-theme="app"] .cert-title .ct-big` `background: none;` und `-webkit-text-fill-color: var(--c-text);` streichen. `color: var(--c-text)` bleibt.
- **2059** `-webkit-text-fill-color: var(--c-acc)` **bleibt**, weil e2e/certtest.js:17 es prüft.
- **2077** `.cert[data-theme="app"] .cert-foot .issue .line { display: none; }` löschen.

```

## kilook-C21 · Coach: Pillen „Mentor“ und „1 Antwort“ neutral statt warn

Gruppe kilook · Cluster konto · Aufwand S · Befunde: bereich_konto-17, ki_look-33
Quelle: audit/spec/kilook.md Z. 702–705 · Dateien: web/js/screens/coach.js
Abhängig von: —

```text
**C21 · web/js/screens/coach.js** (bereich_konto-17, ki_look-33)
- **35, 128, 243** `U.pill('Mentor', 'warn')` → `U.pill('Mentor', 'neutral')`. Den Pillentext legt spec/wording.md fest (aufbau-29).
- **87** in `U.pill(r.new_replies === 1 ? '1 Antwort' : …, 'warn')` → `'neutral'`.

```

## responsiv-C4 · Coach-Tabelle ≤ 1180 px: tb-hide und engere Zellen

Gruppe responsiv · Cluster konto · Aufwand S · Befunde: bereich_konto-13
Quelle: audit/spec/responsiv.md Z. 396–399 · Dateien: web/css/app.css
Abhängig von: —

```text
**C4 Coach-Tabelle** (bereich_konto-13)
- Nach Z. 2867 neu:
  `@media (max-width: 1180px) { .coach-tbl .tb-hide { display: none; } .tbl.coach-tbl th, .tbl.coach-tbl td { padding-left: 8px; padding-right: 8px; } }`

```

## wording-S3.4 · app.css: .ce-edited für den Bearbeitet-Vermerk im Coach-Journal

Gruppe wording · Cluster konto · Aufwand S · Befunde: bereich_konto-21
Quelle: audit/spec/wording.md Z. 330–330 · Dateien: web/css/app.css
Abhängig von: —

```text
| 3.4 | nach `.ce-head` (Z. 2872) | – → `.ce-edited { flex: 0 0 auto; white-space: nowrap; }` | bereich_konto-21 |
```

## wording-S13.1-13.2 · Affiliate: Kachelreihe kompakt ohne Cent (moneyK)

Gruppe wording · Cluster konto · Aufwand S · Befunde: wording-53
Quelle: audit/spec/wording.md Z. 513–518 · Dateien: web/js/screens/affiliate.js
Abhängig von: —

```text
### Schritt 13 · `web/js/screens/affiliate.js`

| # | Stelle | vorher → nachher | ids |
|---|---|---|---|
| 13.1 | nach Z. 16 | – → `const moneyK = v => fmt.cur(v, { money: true, compact: true, currency: AD.CURRENCY });` | wording-53 |
| 13.2 | Z. 57 Kacheln | `money(all.revenue)`, `money(all.earned)`, `money(all.open)` → `moneyK(…)` | wording-53 |
```

## wording-S13.3-13.7 · Affiliate-Begriffe: „Satz“/„Provisionssatz“ = Prozent, „Provision“ = Betrag, „Quelle“, Dialog und Toasts

Gruppe wording · Cluster konto · Aufwand S · Befunde: bereich_konto-30, wording-53
Quelle: audit/spec/wording.md Z. 519–524 · Dateien: web/js/screens/affiliate.js
Abhängig von: wording-S13.1-13.2

```text
| 13.3 | Z. 58 Tabellenkopf | `<th class="r">Provision</th><th class="r">Verdient</th>` → `<th class="r">Satz</th><th class="r">Provision</th>`; am Knopf `.aff-pct`: `data-tip="Provision ändern"` → `data-tip="Satz ändern"`, `aria-label="Provision von ${…} ändern"` → `aria-label="Satz von ${…} ändern"` | bereich_konto-30 |
| 13.4 | Z. 59 Info | `'Verdient = Umsatz × Provision. Offen = Provisionen des laufenden Monats.'` → `'Provision = Umsatz × Satz. Offen = Provisionen des laufenden Monats.'` | bereich_konto-30 |
| 13.5 | Z. 65 Creator-Kacheln | `money(s.earned)`, `money(s.open)` → `moneyK(…)`; `U.tile('Provision', …)` → `U.tile('Provisionssatz', …)` | bereich_konto-30, wording-53 |
| 13.6 | Z. 67 Kundenliste | `<th class="ph-hide">Über</th>` → `<th class="ph-hide">Quelle</th>` (Spalte „Provision“ in € bleibt) | bereich_konto-30 |
| 13.7 | Z. 91 / 92 / 96 / 98 Dialog | `<h2>Provision</h2>` → `<h2>Provisionssatz</h2>`; Label `Provision in %` → `Satz in %`; Toast `'Bitte 0 bis 100 % angeben'` → `'Bitte einen Satz von 0 bis 100 % angeben'`; `'Provision gespeichert'` → `'Provisionssatz gespeichert'` | bereich_konto-30 |

```

## wording-S15.6-15.9 · Coach: „Coach einrichten“ + „Server einrichten“, „Was dein Mentor sieht“, „Dein Name in Gruppen:“, Mailhinweis grau ohne Variablen

Gruppe wording · Cluster konto · Aufwand S · Befunde: bereich_konto-42, bereich_training-35, wording-14, bereich_konto-16
Quelle: audit/spec/wording.md Z. 550–553 · Dateien: web/js/screens/coach.js
Abhängig von: —

```text
| 15.6 | coach.js (screens):22 | `<h2>Coach Mode einrichten</h2><p class="muted">Coach Mode läuft über denselben Server wie der Mentor-Chat. Trag unter Einstellungen → Mentor die Server-Adresse und das Zugangstoken ein; danach kannst du hier Gruppen anlegen oder einer Gruppe beitreten.</p>…${I.settings} Zu den Einstellungen` → `<h2>Coach einrichten</h2><p class="muted">Teile deine Notizen mit deinem Mentor oder betreue selbst eine Gruppe. Dafür trägst du einmal die Adresse und das Zugangstoken deines Journalyst-Servers unter Einstellungen → Server ein.</p>…${I.settings} Server einrichten` (href bleibt `#/settings/mentor`) | bereich_konto-42, bereich_training-35, wording-14 |
| 15.7 | coach.js:54 | `Was der Mentor sieht` → `Was dein Mentor sieht` (wie Fenstertitel :294) | bereich_konto-42 |
| 15.8 | coach.js:58 | `<span>Dein Name im Coach Mode:</span>` → `<span>Dein Name in Gruppen:</span>` | bereich_konto-42 |
| 15.9 | coach.js:74 Mailhinweis | `<div class="small warn coach-mailhint">Auf dem Server ist kein E-Mail-Versand eingerichtet (COACH_SMTP_HOST, siehe server/README.md). Die Adresse wird gespeichert, Mails gehen aber erst raus, wenn der Versand eingerichtet ist.</div>` → `<div class="small muted coach-mailhint">Dein Journalyst-Server verschickt noch keine E-Mails. Die Adresse wird gespeichert, Mails kommen, sobald der Versand eingerichtet ist.</div>` | bereich_konto-16 |
```

## wording-S16.1-16.4 · Zertifikat-Menü: Tag · Woche · Monat · Zeitraum mit konkretem Zeitraum rechts, Zähler, „Benutzername anzeigen“

Gruppe wording · Cluster konto · Aufwand S · Befunde: wording-45, bereich_dashboard-29, zustaende-28, bereich_dashboard-28
Quelle: audit/spec/wording.md Z. 567–575 · Dateien: web/js/certificate.js
Abhängig von: wording-S1.1-1.3, wording-S4.1-4.5

```text
### Schritt 16 · `web/js/certificate.js`

| # | Stelle | vorher → nachher | ids |
|---|---|---|---|
| 16.1 | Z. 60 `menuHTML` | `[['day', 'Tag', day], ['week', 'Woche', day], ['month', 'Monat', …], ['stats', 'Stats', 'range']].map(([k, l, ref]) => \`<button … data-kind="${k}" data-ref="${ref}">${D.KINDS[k].title.replace(' Certificate', '')}<span class="muted small" style="margin-left:auto">${l}</span></button>\`)` → `[['day', 'Tag', day], ['week', 'Woche', day], ['month', 'Monat', …], ['stats', 'Zeitraum', 'range']].map(([k, l, ref]) => \`<button type="button" class="item" data-action="cert-open" data-kind="${k}" data-ref="${ref}">${l}<span class="muted small" style="margin-left:auto">${esc(D.period(k, resolveRef(k, ref)).short)}</span></button>\`)` (`resolveRef` ist eine Funktionsdeklaration in Z. 62 und damit verfügbar; `certdata.js` bleibt unverändert) | wording-45, bereich_dashboard-29 |
| 16.2 | Z. 85 | `` ` · ${fmt.int(m.n)} Trades` `` → `` ` · ${U.count(m.n, 'Trade', 'Trades')}` `` | zustaende-28 |
| 16.3 | Z. 87 | `toggle('user', 'Username anzeigen')` → `toggle('user', 'Benutzername anzeigen')` | bereich_dashboard-29 |
| 16.4 | Z. 76 Tagesfeld | keine Codeänderung, das Overlay aus Schritt 4 zeigt „11.10.2026“; die Zeile „Sonntag, 11. Oktober 2026“ bleibt | bereich_dashboard-28 |

```

## wording-S19-affiliate · Tests anpassen: affiliatetest

Gruppe wording · Cluster konto · Aufwand S · Befunde: wording-53, bereich_konto-30
Quelle: audit/spec/wording.md Z. 636–638 · Dateien: web/e2e/affiliatetest.js
Abhängig von: wording-S13.1-13.2, wording-S13.3-13.7

```text
| e2e/affiliatetest.js:20 | Toleranz Provisionen `< 0.01` → `< 1` (Kachel ohne Cent); bei bereich_konto-29 Indizes anpassen | wording-53 |
| e2e/affiliatetest.js:23 | `'Creator,Code,Kunden,Umsatz,Provision,Verdient,Offen,'` → `'Creator,Code,Kunden,Umsatz,Satz,Provision,Offen,'` | bereich_konto-30 |
| e2e/affiliatetest.js:46 | `'Verdient,Offen,Kunden,Provision'` → `'Verdient,Offen,Kunden,Provisionssatz'` | bereich_konto-30 |
```
