# Paket 068 · wording, barrierefreiheit, einstellungen

Schritte: 34 · Dateien: web/js/app.js, web/js/coach.js, web/js/lang/en.js, web/js/lang/es.js, web/js/lang/hi.js, web/js/lang/pt.js, web/js/lang/zh.js, web/js/screens/coach.js, web/js/screens/misc.js, web/js/screens/news.js, web/js/screens/notebook.js, web/js/screens/progress.js, web/js/screens/prop.js, web/js/widgets.js
Betroffene Tests laut Spezifikation: Akzeptanz grep 7; e2e/coachlang.js; e2e/coachlang2.js; e2e/coachtest.js:204–206; e2e/langtest.js; web/e2e/coachlang2.js; web/e2e/langtest.js; web/e2e/motiontest.js:62-66; web/e2e/sidebartest.js:44-45; web/e2e/usercardtest.js:55-58
Baut auf Paketen auf: 9, 10, 12, 13, 14, 15, 17, 18, 19, 21, 22, 24, 25, 27, 30, 32, 34, 45, 48, 49, 51, 54, 57, 64, 67

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: misc.profil] aufbau-C8c und farbe-C22b ändern in profil() verschiedene Teilstrings (Z. 41/54 Zeitzone, Z. 62 2FA-Knopf, Z. 68 Titel, Z. 69 Fußzeile) und vertragen sich. Z. 69 schreiben aber wording-S17.4-17.7 (17.7) und kilook-C24 als ganze Zeile neu, beide noch mit class="small faint". Für die Endfassung jeder Fußzeile in profil() gilt verbindlich: class="small muted", denn Fußnoten sind --muted und --faint ist nie für Wörter. Wo Tasten genannt werden, steht „1–9“. Welcher Wortlaut gilt (wording zweizeilig oder kilook ohne Tastatur-Teil), entscheidet diese Liste nicht.
- ÄNDERN: Z. 69 nachher mit class="small muted" statt "small faint". Der Text bleibt wie spezifiziert.
- [konflikt: switchRow] switchRow bekommt die Fassung aus barrierefreiheit-C-misc-15: id je Aufbau über swN, <label for> mit .set-row-l, aria-describedby, kein aria-label. Die Signatur (title, text, action, on, extra) bleibt, deshalb laufen alle Aufrufer unverändert weiter, und C-misc-15 kommt zuerst. GELD-BLIND: Der Schalter heißt „Beträge als R zeigen“, Text aus wording-S17.19. Blocktitel „Geld-blind-Modus“ und Toast bleiben. Grund: Wording hat die Texthoheit (K13). Der Name sagt, was passiert (R statt Geld, Kontostand weg). Außerdem heißt im Zertifikat schon ein anderer Schalter „Beträge ausblenden (nur % bzw. R)“ (certificate.js:74), und ein Name für zwei Funktionen verletzt W2. TRADING: Markup aus komponenten-S-misc-e (Einheit im Feld, Tilt-Schalter, kein Speichern-Knopf). Labels: „Tagesverlustlimit“ und „Ruin-Schwelle für Monte Carlo (Drawdown)“, bei beiden steht „%“ im Feld. „für Monte Carlo“ kommt aus wording-29, die Einheit wandert laut komponenten ins Feld. Tilt-Schaltertext: „Warnt auf dem Dashboard bei Verlustserien, Größenerhöhung nach Verlust, Revenge-Trades und erreichtem Tagesverlustlimit.“ Wrapper class="mt-3" statt style="margin-top:14px". Durchläufe-Optionen mit value und fmt.int (wording 17.20). Der Hinweis aus aufbau-C8b steht als letztes Kind des .field hinter dem .inp-cur-Wrapper: „Prozent der Kontogröße. Gilt für Tilt-Warnungen und die automatischen Regeln im Fortschritt.“ Er trägt die Bezugsgröße, die mit „(% vom Konto)“ aus dem Label fällt. BENACHRICHTIGUNGEN, Endmarkup aus abstaende-L4, wording-S17.13-17.15 und aufbau-C8d: <div class="set-block"><h3>Recaps</h3><div class="set-desc">Zusammenfassungen deiner Trades. Sie erscheinen als Hinweis oben auf dem Dashboard.</div><div class="stack s-4">${switchRow('Wochen-Recap', 'Jeden Montag eine Zusammenfassung der Vorwoche, wenn du darin mindestens 4 Trades geschlossen hast.', 'notif-toggle', n.weekly === true, 'data-key="weekly"')}${switchRow('Monats-Recap', 'Am 2. jedes Monats eine Zusammenfassung des Vormonats, wenn du darin mindestens 4 Trades geschlossen hast.', 'notif-toggle', n.monthly === true, 'data-key="monthly"')}</div></div><div class="set-block"><h3>Hinweis-Punkte in der Seitenleiste</h3><div class="set-desc">(Satz unverändert)</div><div class="stack s-4">${switchRow('Hinweis-Punkte anzeigen', 'Alle Punkte auf einmal ein- oder ausschalten.', 'navdot-toggle', nd.on, 'data-key="on"')}<div class="set-sub"${nd.on ? '' : ' aria-disabled="true"'}>${App.NAV_DOT_AREAS.map(([k, label, desc]) => switchRow(label, desc, 'navdot-toggle', nd[k] !== false, `data-key="${k}"${nd.on ? '' : ' disabled'}`)).join('')}</div></div></div>. PROFIL: Block „Bedienung“ mit Schalter „Tastenkürzel“ (kilook-C24) direkt vor „Daten und Sicherung“. WCAG 2.1.4 verlangt abschaltbare Ein-Zeichen-Kürzel. Die Fußzeile wird einzeilig mit dem Text aus wording-17.7 und der Klasse aus farbe-C22. Die zweite Kürzel-Zeile aus wording-17.7 entfällt, weil der Schalter sie trägt; Esc wirkt immer. Neue Schalter-Aktionen setzen nur aria-checked, ohne Neuaufbau (zustaende Z9). Der Notebook-Schalter aus komponenten-S-misc-g bleibt wie spezifiziert, weil Notebook-To-dos laut zustaende das Durchstreichen behalten.
- ÄNDERN: Aktion ohne Neuaufbau: 'shortcuts-toggle'(el) { const on = S.settings.shortcuts === false; S.setSetting('shortcuts', on); el.setAttribute('aria-checked', String(on)); }. Fußzeile nicht mit „Speicherort: … (localStorage und IndexedDB)“, sondern <div class="small muted">Deine Daten liegen nur in diesem Browser.${S.storageOK ? '' : ' <span class="neg">Speichern ist gerade nicht möglich (privates Fenster oder blockierte Website-Daten).</span>'}</div>. Einfügeort bleibt vor „Daten und Sicherung“. Wird aufbau-25 („Sicherheit und Daten“) angenommen, bleibt „Bedienung“ im Profil direkt nach dem Block „Ruhepunkt“.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: App.renderSidebar] (1) Die Zeile desk/mini wird einmal vor const item verschoben, durch P5 (A1 verlangt dasselbe). (2) Endform des Navigationslinks: `<a href="#/${key}" class="${cur === key ? 'active' : ''}"${cur === key ? ' aria-current="page"' : ''}${mini ? ` aria-label="${label}" data-tip="${label}" data-tip-side="right"` : ''} data-action="nav-close">`. Kein title, auch eingeklappt nicht. Grund: komponenten verlangt „keine System-Tooltip-Dubletten“; App-Tooltip rechts und aria-label decken Maus und Screenreader ab. (3) Schublade: inert setzt nur P5 (sb.inert = mob && !open; main.inert = mob && open), und zwar vor jedem focus(). Die Fokuslogik steht nach dem Muster von 3.3c (wasOpen/hadFocus am Anfang) in renderSidebar. Nur so gibt jeder Schließweg den Fokus zurück: ×, Scrim, Escape (bind-Handler), nav-close auf dieselbe Route und Breitenwechsel. responsiv-Prüfpunkt 11 verlangt „Escape → Fokus auf .menu-btn“; P6 (Logik nur in den Aktionen) deckt das nicht ab. Beim Öffnen geht der Fokus auf „Menü schließen“ (.sb-toggle), wie in barrierefreiheit Z2 und bereich_shell-15, und nicht auf den aktiven Eintrag. Gründe: Es ist das erste Element der Schublade, Tab läuft danach von oben durch die Navigation, und der Screenreader nennt sofort den Weg zum Schließen. Prüfpunkt 11 (aktives Element liegt in #sidebar) bleibt erfüllt. Beim Schließen geht der Fokus an .menu-btn, aber nur wenn er in der Schublade war und der Knopf sichtbar ist.
- ÄNDERN: Erste Zeile wie spezifiziert: const wasOpen = sb.classList.contains('open'); const hadFocus = sb.contains(document.activeElement); Keine eigene main.inert-Zeile, die setzt P5. Direkt nach den inert-Zeilen von P5: if (!desk && open && !wasOpen) sb.querySelector('.sb-toggle')?.focus({ preventScroll: true }); else if (!open && wasOpen && hadFocus) { const b = document.querySelector('.menu-btn'); if (b && b.getClientRects().length) b.focus({ preventScroll: true }); } In responsiv.md 1.10 und in den regeln „Fokus auf den aktiven Eintrag“ → „Fokus auf „Menü schließen““.
- [doppelt: .menu-btn] P6 und 3.3c lösen dieselbe Aufgabe: Fokus beim Öffnen und Schließen der Schublade. Umgesetzt wird sie einmal in renderSidebar über responsiv-3.3c, in der Fassung des Ankers App.renderSidebar; das Ziel beim Öffnen (.sb-toggle) kommt aus P6. Die Aktionen sidebar() und scrim() sowie der Handy-Zweig von 'sb-toggle' bleiben unverändert. Eine Methode closeSidebar() gibt es nicht. Verträglich sind P8 (aria-controls="sidebar" am Menüknopf), B12a (unsichtbare 44-px-Fläche per ::after im ≤960-Block) und C10 (Selektoren .topbar .menu-btn). Es gibt nur einen .menu-btn, document.querySelector('.menu-btn') trifft also weiter den Knopf der Titelzeile.
- ÜBERNIMMT barrierefreiheit-P6: Entfällt als eigener Schritt: kein Fokus-Aufruf in sidebar(), kein closeSidebar(), scrim() und sb-toggle bleiben unverändert. Fokus auf „Menü schließen“ beim Öffnen und Rückgabe an .menu-btn (auch bei Escape) setzt 3.3c in renderSidebar um.
- [doppelt: #main] main.inert wird nur einmal gesetzt, durch P5 (mob && open). 3.3c hat dafür keine eigene Zeile. Festlegung und Anweisungen stehen im Anker App.renderSidebar. P1 ist verträglich: restoreFocus überspringt Treffer in [inert], und renderSidebar läuft in render() vor restoreFocus. Beim Seitenwechsel aus der Schublade ist #main dadurch schon wieder bedienbar, bevor der Fokus auf #content geht.
- [doppelt: inert] P5 und 3.3c setzen beide #main inert; es gilt nur P5, siehe Anker App.renderSidebar. Der Grabstein-Schritt (inert an der verdeckten Seite .pg-back/.pg-front) betrifft andere Elemente und ist verträglich.
- [reihenfolge: #sidebar] Inhaltlich verträglich. P5 macht die Gruppen zu div role="group", H2 macht das äußere Element zu <nav aria-label="Hauptnavigation">. H2 darf nicht vor P5 landen, sonst gibt es vorübergehend verschachtelte nav-Landmarken (am besten in einem Commit). P5 ruft this.popInit(sb) auf, das P1 anlegt, also kommt P1 zuerst. Für 3.3c gilt die Fassung aus dem Anker App.renderSidebar.

## farbe-C25 · Fortschritt: Info-Text „desto kräftiger das Feld“

Gruppe farbe · Cluster wording · Aufwand S · Befunde: bereich_training-8
Quelle: audit/spec/farbe.md Z. 510–511 · Dateien: web/js/screens/progress.js
Abhängig von: —

```text
**C25 – `web/js/screens/progress.js` Z. 71:** Info `… Je mehr Trades, desto kräftiger das Grün. …` → `… Je mehr Trades, desto kräftiger das Feld. …` — bereich_training-8

```

## farbe-D1 · Sprachdateien: neue und geänderte Texte in en/es/hi/pt/zh

Gruppe farbe · Cluster wording · Aufwand M · Befunde: bereich_training-3, bereich_notebook_news-17, bereich_trades_tag-29, bereich_konto-4, referenz-7, bereich_einstellungen-18, bereich_einstellungen-17, bereich_einstellungen-37, bereich_training-8, bereich_notebook_news-21, farbe_kontrast-26
Quelle: audit/spec/farbe.md Z. 557–560 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/hi.js, web/js/lang/pt.js, web/js/lang/zh.js
Abhängig von: farbe-A3b, farbe-C17b, farbe-C19b, farbe-C19c, farbe-C22b, farbe-C22c, farbe-C24c, farbe-C25, farbe-C29, farbe-C31b, farbe-C32

```text
### D. Texte, Tests, Dokumentation

**D1 – `web/js/lang/{en,es,hi,pt,zh}.js`:** für jeden Text aus 1.10 den Schlüssel anlegen bzw. den alten ersetzen (geänderte ganze Sätze: misc.js:234, misc.js:145-Hinweis, progress.js:71; neue Wörter: „Effekt“, „Tagesansicht öffnen“, „Verlust vermieden“, „{0} neue Einträge“, „Filter ({0} aktiv)“, „Blau / Gelb“, „Neutral / Rot“, „Designfarben“, „Grau“, „Warnung“, „Info“, „Farbe {0}“; vorhandene Schlüssel „Gewinn“, „Verlust“, „Break-even“, „Aktiv“, „CSV importieren“ prüfen). Englisch zum Beispiel: „Effect“, „Open day view“, „Loss avoided“, „{0} new entries“, „Filter ({0} active)“, „Blue / Yellow“, „Neutral / Red“, „Theme colors“. — betrifft bereich_training-3, bereich_notebook_news-17, bereich_trades_tag-29, bereich_konto-4, referenz-7, bereich_einstellungen-18, bereich_einstellungen-17, bereich_einstellungen-37, bereich_training-8, bereich_notebook_news-21, farbe_kontrast-26

```

## abstaende-K4 · Papierkorb-Liste: 'Gelöscht ' → 'Gelöscht am '

Gruppe abstaende · Cluster wording · Aufwand S · Befunde: bereich_notebook_news-25
Quelle: audit/spec/abstaende.md Z. 448–448 · Dateien: web/js/screens/notebook.js
Abhängig von: —

```text
| K4 | Z. 60 (Liste) | `'Gelöscht ' + fmt.dateTime(n.deletedAt)` → `'Gelöscht am ' + fmt.dateTime(n.deletedAt)` | bereich_notebook_news-25 |
```

## abstaende-M3 · Warnschwellen-Labels kürzen: „Gelb unter (% übrig)“, „Rot unter (% übrig)“

Gruppe abstaende · Cluster wording · Aufwand S · Befunde: bereich_prop-33
Quelle: audit/spec/abstaende.md Z. 472–472 · Dateien: web/js/screens/prop.js
Abhängig von: —

```text
| M3 | Z. 240, 241 | Label „Gelb, wenn weniger als … % des Limits übrig“ → „Gelb unter (% übrig)“, „Rot, wenn weniger als … % übrig“ → „Rot unter (% übrig)“ | bereich_prop-33 |
```

## abstaende-Q1 · Sprachschlüssel „{0} Trades im Zeitraum“ und „{0} Trade im Zeitraum“ in en/es/zh/hi/pt

Gruppe abstaende · Cluster wording · Aufwand S · Befunde: bereich_training-25
Quelle: audit/spec/abstaende.md Z. 506–510 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/zh.js, web/js/lang/hi.js, web/js/lang/pt.js
Abhängig von: abstaende-I2

```text
### web/js/lang/*.js (en, es, zh, hi, pt)

| Nr. | Neue bzw. geänderte Schlüssel | Befunde |
|---|---|---|
| Q1 | „{0} Trades im Zeitraum“, „{0} Trade im Zeitraum“ | bereich_training-25 |
```

## abstaende-Q2 · Sprachschlüssel „Bewertung {0} von 5“

Gruppe abstaende · Cluster wording · Aufwand S · Befunde: bereich_trades_tag-23
Quelle: audit/spec/abstaende.md Z. 511–511 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/zh.js, web/js/lang/hi.js, web/js/lang/pt.js
Abhängig von: abstaende-H2

```text
| Q2 | „Bewertung {0} von 5“ | bereich_trades_tag-23 |
```

## abstaende-Q3 · Sprachschlüssel „Gelöscht am {0}“, „Wird am {0} endgültig entfernt“; alte „Gelöscht: {0}“, „Wird endgültig entfernt am {0}“ entfernen

Gruppe abstaende · Cluster wording · Aufwand S · Befunde: bereich_notebook_news-25
Quelle: audit/spec/abstaende.md Z. 512–512 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/zh.js, web/js/lang/hi.js, web/js/lang/pt.js
Abhängig von: abstaende-K3, abstaende-K4

```text
| Q3 | „Gelöscht am {0}“, „Wird am {0} endgültig entfernt“. Alte Schlüssel „Gelöscht: {0}“ und „Wird endgültig entfernt am {0}“ entfernen. | bereich_notebook_news-25 |
```

## abstaende-Q4 · Sprachschlüssel „Gelb unter (% übrig)“, „Rot unter (% übrig)“; alte zwei Schlüssel entfernen

Gruppe abstaende · Cluster wording · Aufwand S · Befunde: bereich_prop-33
Quelle: audit/spec/abstaende.md Z. 513–513 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/zh.js, web/js/lang/hi.js, web/js/lang/pt.js
Abhängig von: abstaende-M3

```text
| Q4 | „Gelb unter (% übrig)“, „Rot unter (% übrig)“. Die alten zwei Schlüssel entfernen. | bereich_prop-33 |
```

## abstaende-Q5 · Sprachschlüssel „Heute noch erlaubt“ und ggf. „bester Tag {0} von max. {1} %“

Gruppe abstaende · Cluster wording · Aufwand S · Befunde: bereich_prop-29
Quelle: audit/spec/abstaende.md Z. 514–515 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/zh.js, web/js/lang/hi.js, web/js/lang/pt.js
Abhängig von: abstaende-M6

```text
| Q5 | „Heute noch erlaubt“, „bester Tag {0} von max. {1} %“ (falls der Wert als Muster übersetzt wird) | bereich_prop-29 |

```

## komponenten-S-coach-c · Coach: Wortwahl „Einladungslink erneuern“ / „Link erneuern“

Gruppe komponenten · Cluster wording · Aufwand S · Befunde: bereich_konto-45
Quelle: audit/spec/komponenten.md Z. 633–633 · Dateien: web/js/screens/coach.js
Abhängig von: —

```text
- Wortwahl: Z. 115 „Neuen Einladungslink erzeugen“ → „Einladungslink erneuern“; Z. 284 Titel → „Einladungslink erneuern?“, `ok: 'Erneuern'`; Z. 285 Toast → „Einladungslink erneuert“; Z. 265 „Neuen Link erzeugen“ → „Link erneuern“; Z. 349 Toast → „Co-Coach-Link erneuert“.
```

## komponenten-L1a · Übersetzungen: Verpasst-Dialog, „Konto anlegen“, Coach-Einladungslink

Gruppe komponenten · Cluster wording · Aufwand S · Befunde: bereich_trades_tag-11, hierarchie-28, bereich_konto-45
Quelle: audit/spec/komponenten.md Z. 727–733 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/zh.js, web/js/lang/hi.js, web/js/lang/pt.js
Abhängig von: komponenten-S-trades-g, komponenten-S-prop-f, komponenten-S-coach-c

```text
### 3.7 web/js/lang/*.js

**L1 – Übersetzungen** (alle Befunde mit Wortwahl: bereich_trades_tag-11, hierarchie-47, hierarchie-28, bereich_konto-45, bereich_einstellungen-35, bereich_einstellungen-40, bereich_statistik-19, bereich_trades_tag-43, bereich_trades_tag-34, bereich_notebook_news-20, bereich_dashboard-47)
Neue/umbenannte Schlüssel in en, es, zh, hi, pt (englischer Wert zur Orientierung, die anderen Sprachen sinngemäß):
- „Hätte gebracht“ → „Would have made“
- „Konto anlegen“ (falls nicht vorhanden) → „Add account“
- „Einladungslink erneuern“ → „Renew invite link“; „Einladungslink erneuern?“ → „Renew invite link?“; „Erneuern“ → „Renew“; „Link erneuern“ → „Renew link“; „Einladungslink erneuert“ → „Invite link renewed“; „Co-Coach-Link erneuert“ → „Co-coach link renewed“
```

## komponenten-L1b · Übersetzungen: „Profil ergänzen“ (Schlüssel umbenennen), Trading-Labels, Logs

Gruppe komponenten · Cluster wording · Aufwand S · Befunde: hierarchie-47, bereich_einstellungen-35, bereich_einstellungen-40
Quelle: audit/spec/komponenten.md Z. 734–736 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/zh.js, web/js/lang/hi.js, web/js/lang/pt.js
Abhängig von: komponenten-A2, komponenten-S-misc-e, komponenten-S-misc-i

```text
- Schlüssel „Profil vervollständigen“ umbenennen in „Profil ergänzen“ (en „Complete profile“, es/pt „Completar perfil“, hi/zh Wert unverändert)
- „Tagesverlustlimit“ → „Daily loss limit“; „Ruin-Schwelle (Drawdown)“ → „Ruin threshold (drawdown)“
- „Verlauf durchsuchen“ → „Search history“; „Keine Einträge gefunden“ → „No entries found“; „Noch kein Verlauf“ → „No history yet“ (falls fehlt); „CSV-Importe und eingespielte Sicherungen erscheinen hier.“ → „CSV imports and restored backups appear here.“
```

## komponenten-L1c · Übersetzungen: „Alle Handelstage“, „Netto“, Seitenwahl-Schlüssel ohne Leerzeichen

Gruppe komponenten · Cluster wording · Aufwand S · Befunde: bereich_statistik-19, bereich_trades_tag-43, bereich_trades_tag-34
Quelle: audit/spec/komponenten.md Z. 737–738 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/zh.js, web/js/lang/hi.js, web/js/lang/pt.js
Abhängig von: komponenten-S-stats-b, komponenten-S-trades-d, komponenten-S-trades-c, komponenten-S-shadow

```text
- „Alle Handelstage“ → „All trading days“; „Netto“ → „Net“
- Schlüssel „{0} – {1} von {2} Trades“ → „{0}–{1} von {2} Trades“ (en „{0}–{1} of {2} trades“), „{0} – {1} von {2} Verstößen“ → „{0}–{1} von {2} Verstößen“ (Zielwerte ebenfalls ohne Leerzeichen um den Strich)
```

## komponenten-L1d · Übersetzungen: Tag-Suche, Vorlagen-Menü; Ruhepunkt/Teilen nur bei vorhandenen Einträgen

Gruppe komponenten · Cluster wording · Aufwand S · Befunde: bereich_notebook_news-20, bereich_dashboard-47
Quelle: audit/spec/komponenten.md Z. 739–742 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/zh.js, web/js/lang/hi.js, web/js/lang/pt.js
Abhängig von: komponenten-S-notebook-c, komponenten-S-dashboard-a

```text
- „Tags suchen“ → „Search tags“; „„{0}“ als Tag anlegen“ → „Create tag “{0}”“ (nur, weil „Neuen Tag anlegen“ dort schon übersetzt ist)
- „Bearbeiten“, „Als Standard festlegen“ (falls fehlen) → „Edit“, „Set as default“
- Ruhepunkt- und Teilen-Texte nur, wenn der Bereich dort Einträge hat (heute nicht).

```

## aufbau-C8b · Trading: Schalter „Beträge ausblenden“, Hinweis unter Tagesverlustlimit

Gruppe aufbau · Cluster wording · Aufwand S · Befunde: typografie-8, aufbau-8
Quelle: audit/spec/aufbau.md Z. 489–490 · Dateien: web/js/screens/misc.js
Abhängig von: —

```text
- `trading()` Z. 197: `switchRow('Geld-blind-Modus', …)` → `switchRow('Beträge ausblenden', …)`; `<h3>Geld-blind-Modus</h3>` bleibt.
- `trading()` Z. 199, Feld `se-loss`: nach dem `<input … id="se-loss" …>` ergänzen: `<span class="hint">Für Tilt-Warnungen und die automatischen Regeln im Fortschritt.</span>`
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: switchRow] switchRow bekommt die Fassung aus barrierefreiheit-C-misc-15: id je Aufbau über swN, <label for> mit .set-row-l, aria-describedby, kein aria-label. Die Signatur (title, text, action, on, extra) bleibt, deshalb laufen alle Aufrufer unverändert weiter, und C-misc-15 kommt zuerst. GELD-BLIND: Der Schalter heißt „Beträge als R zeigen“, Text aus wording-S17.19. Blocktitel „Geld-blind-Modus“ und Toast bleiben. Grund: Wording hat die Texthoheit (K13). Der Name sagt, was passiert (R statt Geld, Kontostand weg). Außerdem heißt im Zertifikat schon ein anderer Schalter „Beträge ausblenden (nur % bzw. R)“ (certificate.js:74), und ein Name für zwei Funktionen verletzt W2. TRADING: Markup aus komponenten-S-misc-e (Einheit im Feld, Tilt-Schalter, kein Speichern-Knopf). Labels: „Tagesverlustlimit“ und „Ruin-Schwelle für Monte Carlo (Drawdown)“, bei beiden steht „%“ im Feld. „für Monte Carlo“ kommt aus wording-29, die Einheit wandert laut komponenten ins Feld. Tilt-Schaltertext: „Warnt auf dem Dashboard bei Verlustserien, Größenerhöhung nach Verlust, Revenge-Trades und erreichtem Tagesverlustlimit.“ Wrapper class="mt-3" statt style="margin-top:14px". Durchläufe-Optionen mit value und fmt.int (wording 17.20). Der Hinweis aus aufbau-C8b steht als letztes Kind des .field hinter dem .inp-cur-Wrapper: „Prozent der Kontogröße. Gilt für Tilt-Warnungen und die automatischen Regeln im Fortschritt.“ Er trägt die Bezugsgröße, die mit „(% vom Konto)“ aus dem Label fällt. BENACHRICHTIGUNGEN, Endmarkup aus abstaende-L4, wording-S17.13-17.15 und aufbau-C8d: <div class="set-block"><h3>Recaps</h3><div class="set-desc">Zusammenfassungen deiner Trades. Sie erscheinen als Hinweis oben auf dem Dashboard.</div><div class="stack s-4">${switchRow('Wochen-Recap', 'Jeden Montag eine Zusammenfassung der Vorwoche, wenn du darin mindestens 4 Trades geschlossen hast.', 'notif-toggle', n.weekly === true, 'data-key="weekly"')}${switchRow('Monats-Recap', 'Am 2. jedes Monats eine Zusammenfassung des Vormonats, wenn du darin mindestens 4 Trades geschlossen hast.', 'notif-toggle', n.monthly === true, 'data-key="monthly"')}</div></div><div class="set-block"><h3>Hinweis-Punkte in der Seitenleiste</h3><div class="set-desc">(Satz unverändert)</div><div class="stack s-4">${switchRow('Hinweis-Punkte anzeigen', 'Alle Punkte auf einmal ein- oder ausschalten.', 'navdot-toggle', nd.on, 'data-key="on"')}<div class="set-sub"${nd.on ? '' : ' aria-disabled="true"'}>${App.NAV_DOT_AREAS.map(([k, label, desc]) => switchRow(label, desc, 'navdot-toggle', nd[k] !== false, `data-key="${k}"${nd.on ? '' : ' disabled'}`)).join('')}</div></div></div>. PROFIL: Block „Bedienung“ mit Schalter „Tastenkürzel“ (kilook-C24) direkt vor „Daten und Sicherung“. WCAG 2.1.4 verlangt abschaltbare Ein-Zeichen-Kürzel. Die Fußzeile wird einzeilig mit dem Text aus wording-17.7 und der Klasse aus farbe-C22. Die zweite Kürzel-Zeile aus wording-17.7 entfällt, weil der Schalter sie trägt; Esc wirkt immer. Neue Schalter-Aktionen setzen nur aria-checked, ohne Neuaufbau (zustaende Z9). Der Notebook-Schalter aus komponenten-S-misc-g bleibt wie spezifiziert, weil Notebook-To-dos laut zustaende das Durchstreichen behalten.
- ÄNDERN: Teil 1 (Schaltertitel „Beträge ausblenden“) entfällt. wording-S17.19-17.21 setzt den Titel „Beträge als R zeigen“. Die Übersetzungszeile „Beträge ausblenden | Hide amounts“ (aufbau.md:678) nicht anlegen. Teil 2 erst nach komponenten-S-misc-e umsetzen: im Feld se-loss hinter (nicht in) den App.unitField-Wrapper <span class="hint">Prozent der Kontogröße. Gilt für Tilt-Warnungen und die automatischen Regeln im Fortschritt.</span> setzen. Schlüssel in js/lang/{en,es,hi,pt,zh}.js anlegen (en: „Percent of account size. Used for tilt warnings and the automatic rules in Progress.“).

## aufbau-C8e · Regeln: neuer Untertitel mit Link aufs Regelwerk

Gruppe aufbau · Cluster wording · Aufwand S · Befunde: aufbau-8
Quelle: audit/spec/aufbau.md Z. 495–495 · Dateien: web/js/screens/misc.js
Abhängig von: —

```text
- `regeln()` Z. 207 Untertitel → Text aus 1.9 (der `<a href="#/shadow">` wird von `head()` als HTML ausgegeben)
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: misc.regeln] Untertitel in regeln() Z. 207, verbindlich: `Deine Regeln zum Abhaken. Sie erscheinen in „Plan & Bewertung“ eines Trades, beim Session-Ende, im Fortschritt und im Regel-Tracker. Messbare Grenzen wie „Max. Trades pro Tag“ stellst du im <a class="tlink" href="#/shadow">Regelwerk des Schatten-Ichs</a> ein.` Grund: aufbau trennt Checkliste und Regelwerk (Glossar), und wording W10 verlangt den sichtbaren Namen „Plan & Bewertung“ (app.js:416) statt „Trade-Editor“. Ein Link im Fließtext ist .tlink (komponenten C33); ein nacktes <a> erbt die Farbe ohne Unterstreichung (app.css:89) und wäre nicht als Link erkennbar. head() gibt den Untertitel schon als HTML aus. farbe-C22b (Knopf „Hinzufügen“ in Z. 207 → btn sm) ist davon unabhängig.
- ÄNDERN: Den Untertitel genau wie oben schreiben (mit „in „Plan & Bewertung“ eines Trades“ und class="tlink" am Link). Für die drei Textknoten Sprachschlüssel in en/es/pt/hi/zh anlegen (Satz bis „im“, „Regelwerk des Schatten-Ichs“, „ein.“) und den alten Schlüssel „Deine Handelsregeln. Sie erscheinen im Trade-Editor, …“ löschen.
- ÜBERNIMMT wording-S17.22: Der Verweis auf „Plan & Bewertung“ steckt im neuen Untertitel von aufbau-C8e. Kein eigener Text und kein eigener Sprachschlüssel.

## aufbau-D1a · Sprachdateien: Schlüssel Statistiken

Gruppe aufbau · Cluster wording · Aufwand S · Befunde: bereich_statistik-3, aufbau-20, bereich_statistik-5, bereich_statistik-12, bereich_statistik-13, bereich_statistik-43
Quelle: audit/spec/aufbau.md Z. 637–650 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/hi.js, web/js/lang/pt.js, web/js/lang/zh.js
Abhängig von: aufbau-C1, aufbau-C14b, aufbau-C14c, aufbau-C14d, aufbau-C14f

```text
### D – Übersetzungen, README, Tests

**D1 Sprachdateien** (`web/js/lang/{en,es,hi,pt,zh}.js`, Format `"deutsch": "Übersetzung"`). Neue Schlüssel mit englischer Vorgabe; die anderen vier Sprachen werden sinngemäß übersetzt:

| Deutsch | Englisch |
|---|---|
| Erwartungswert | Expectancy |
| Ø Netto-P&L pro Trade: Netto-P&L geteilt durch Anzahl der Trades. | Avg net P&L per trade: net P&L divided by the number of trades. |
| Trades | Trades |
| Abgeschlossene Trades im Zeitraum. | Closed trades in the period. |
| Extreme | Extremes |
| Kumulierter Netto-P&L | Cumulative net P&L |
| Tage im Detail | Days in detail |
| Basis: {0} von {1} Trades | Based on {0} of {1} trades |
```

## aufbau-D1b · Sprachdateien: Schlüssel Tagesansicht und TradeLog

Gruppe aufbau · Cluster wording · Aufwand S · Befunde: hierarchie-7, hierarchie-15, hierarchie-16, bereich_trades_tag-18, bereich_trades_tag-33, bereich_trades_tag-27
Quelle: audit/spec/aufbau.md Z. 651–657 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/hi.js, web/js/lang/pt.js, web/js/lang/zh.js
Abhängig von: aufbau-C7a, aufbau-C7c, aufbau-C15a, aufbau-C15b, aufbau-C15c

```text
| Trade für {0} loggen | Log trade for {0} |
| Check-in machen | Do check-in |
| Setup · Fehler | Setup · Mistakes |
| Einstieg / Ausstieg / R | Entry / Exit / R (vorhandene Schlüssel prüfen) |
| Gefiltert · {0} Trades | Filtered · {0} trades |
| Keine verpassten Trades im Zeitraum | No missed trades in this period |
| Ändere den Zeitraum oder das Konto. | Change the period or the account. |
```

## aufbau-D1c · Sprachdateien: Schlüssel Dashboard

Gruppe aufbau · Cluster wording · Aufwand S · Befunde: bereich_dashboard-33, bereich_dashboard-23, ki_look-13
Quelle: audit/spec/aufbau.md Z. 658–662 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/hi.js, web/js/lang/pt.js, web/js/lang/zh.js
Abhängig von: aufbau-C2a, aufbau-C6a, aufbau-C6b

```text
| Alle Trades | All trades |
| „Alle Trades“ öffnet das TradeLog (geänderter Info-Text, ganzer Satz) | … “All trades” opens the TradeLog. |
| Vorlage: {0} | Template: {0} |
| {0} verschieben | Move {0} |
| {0} entfernen | Remove {0} |
```

## aufbau-D1d · Sprachdateien: Schlüssel Fortschritt

Gruppe aufbau · Cluster wording · Aufwand S · Befunde: hierarchie-20, bereich_training-22, bereich_training-5
Quelle: audit/spec/aufbau.md Z. 663–665 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/hi.js, web/js/lang/pt.js, web/js/lang/zh.js
Abhängig von: aufbau-C11a, aufbau-C11b

```text
| Schritte erledigt | steps done |
| {0} Prozentpunkte zum Vorzeitraum | {0} percentage points vs. previous period |
| Noch keine Regeln. | No rules yet. |
```

## aufbau-D1e · Sprachdateien: Schlüssel Notebook

Gruppe aufbau · Cluster wording · Aufwand S · Befunde: bereich_notebook_news-6, bereich_notebook_news-7, bereich_notebook_news-10, bereich_notebook_news-9
Quelle: audit/spec/aufbau.md Z. 666–675 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/hi.js, web/js/lang/pt.js, web/js/lang/zh.js
Abhängig von: aufbau-C10a, aufbau-C10b, aufbau-C10c, aufbau-C10e

```text
| Tagesnotiz öffnen | Open daily note |
| Tagesnotiz für heute öffnen oder anlegen | Open or create today’s daily note |
| Erstellt {0} | Created {0} |
| · Bearbeitet {0} | · Edited {0} |
| Trade vom {0} | Trade from {0} |
| Datum ändern | Change date |
| Suche in allen Ordnern | Search in all folders |
| Zu den Ordnern | To folders |
| Tag-Filter aufheben | Clear tag filter |
| Bearbeitet: {0} – {1} | Edited: {0} – {1} |
```

## aufbau-D1f · Sprachdateien: Schlüssel Coach, Prop, Einstellungen; alte Schlüssel dürfen bleiben

Gruppe aufbau · Cluster wording · Aufwand S · Befunde: bereich_konto-40, hierarchie-4, typografie-8, aufbau-8, hierarchie-33
Quelle: audit/spec/aufbau.md Z. 676–684 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/hi.js, web/js/lang/pt.js, web/js/lang/zh.js
Abhängig von: aufbau-C4c, aufbau-C12a, aufbau-C8b, aufbau-C8c, aufbau-C8e

```text
| Gruppe anlegen | Create group |
| nur noch das Ziel | only the target left |
| Beträge ausblenden | Hide amounts |
| Für Tilt-Warnungen und die automatischen Regeln im Fortschritt. | Used for tilt warnings and the automatic rules in Progress. |
| neuer Regeln-Untertitel (1.9) | Your rules to check off. They appear in the trade editor, at session end, in Progress and in the rule tracker. Set measurable limits like “Max trades per day” in the Shadow Self ruleset. |
| Alle Daten löschen | Delete all data |

Nicht mehr gebrauchte Schlüssel („Trade-Erwartungswert“, „{0} von {1} Schritten erledigt“, „Trade für diesen Tag“, „Tag loggen“) dürfen bleiben.

```

## diagramme-E8a · Widget-Name kum_pnl → „Kumulierter Netto-P&L“

Gruppe diagramme · Cluster wording · Aufwand S · Befunde: diagramme-13
Quelle: audit/spec/diagramme.md Z. 588–589 · Dateien: web/js/widgets.js
Abhängig von: —

```text
**E8 Widget-Registry: Namen, Texte, Legenden, Serienfarben**
- Z. 228 (diagramme-13): `name: 'Kumulierter Tages-P&L'` → `name: 'Kumulierter Netto-P&L'`.
```

## diagramme-E8c · Info perf_uhrzeit/perf_haltedauer: „Break-even-Trades liegen auf der Nulllinie.“

Gruppe diagramme · Cluster wording · Aufwand S · Befunde: bereich_dashboard-36
Quelle: audit/spec/diagramme.md Z. 594–594 · Dateien: web/js/widgets.js
Abhängig von: —

```text
- Z. 232 und Z. 241 (bereich_dashboard-36): im `info` den Satz `Blau sind Break-even-Trades.` → `Break-even-Trades liegen auf der Nulllinie.`
```

## diagramme-E8d · taeglich_kumuliert: desc und info (Linie statt Fläche)

Gruppe diagramme · Cluster wording · Aufwand S · Befunde: diagramme-18
Quelle: audit/spec/diagramme.md Z. 595–595 · Dateien: web/js/widgets.js
Abhängig von: —

```text
- Z. 251 (diagramme-18): `desc` → `'Säulen für den Tages-P&L und eine Linie für den kumulierten P&L in einem Diagramm.'`, `info` → `'Säulen: Netto-Ergebnis je Handelstag. Linie: kumuliertes Ergebnis im Zeitraum.'`
```

## diagramme-H3 · Info Trading-Aktivität: „desto kräftiger das Kästchen“

Gruppe diagramme · Cluster wording · Aufwand S · Befunde: farbe_kontrast-21
Quelle: audit/spec/diagramme.md Z. 638–639 · Dateien: web/js/screens/progress.js
Abhängig von: —

```text
**H3 Info-Text** (farbe_kontrast-21) Z. 71: `Je mehr Trades, desto kräftiger das Grün.` → `Je mehr Trades, desto kräftiger das Kästchen.`

```

## diagramme-3.14a · Sprachdateien: ersetzte Info-/Beschreibungssätze (Trefferquote-Verlauf, Uhrzeit, Haltedauer, Täglich & kumuliert, Trading-Aktivität)

Gruppe diagramme · Cluster wording · Aufwand M · Befunde: bereich_dashboard-36, diagramme-6, diagramme-18, farbe_kontrast-21
Quelle: audit/spec/diagramme.md Z. 713–724 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/pt.js, web/js/lang/hi.js, web/js/lang/zh.js
Abhängig von: diagramme-E8b, diagramme-E8c, diagramme-E8d, diagramme-H3

```text
### 3.14 `web/js/lang/{en,es,pt,hi,zh}.js`

Je Datei den alten deutschen Schlüssel durch den neuen ersetzen (sonst fällt der Text auf Deutsch zurück). Neue Schlüssel ergänzen. Englische Werte sind verbindlich, die übrigen Sprachen sinngemäß:

| Schlüssel (de) | en |
|---|---|
| Laufende Werte bis zum jeweiligen Handelstag: oben Ø Gewinn und Ø Verlust, unten die Trefferquote. | Running values up to each trading day: avg win and avg loss on top, win rate below. |
| Jeder Punkt ist ein geschlossener Trade: waagerecht die Uhrzeit (Einstieg oder Ausstieg, wählbar über das Zahnrad), senkrecht das Netto-Ergebnis. Break-even-Trades liegen auf der Nulllinie. | … Break-even trades sit on the zero line. (Rest wie bisher) |
| Jeder Punkt ist ein geschlossener Trade: waagerecht die Haltedauer (logarithmisch), senkrecht das Netto-Ergebnis. Break-even-Trades liegen auf der Nulllinie. | … Break-even trades sit on the zero line. |
| Säulen für den Tages-P&L und eine Linie für den kumulierten P&L in einem Diagramm. | Bars for daily P&L and a line for cumulative P&L in one chart. |
| Säulen: Netto-Ergebnis je Handelstag. Linie: kumuliertes Ergebnis im Zeitraum. | Bars: net result per trading day. Line: cumulative result in the period. |
| Ein Kästchen pro Tag, bis zu ein Jahr zurück. Je mehr Trades, desto kräftiger das Kästchen. Ziehen oder Pfeile zum Verschieben, Klick öffnet die Tagesansicht. | One box per day, up to a year back. The more trades, the stronger the box. Drag or use the arrows to scroll; click to open the day view. |
```

## diagramme-3.14b · Sprachdateien: neue Beschriftungen (Startkapital, Median, Ruin, Zeiteinheiten, Verstöße, Boden, Trade-Details)

Gruppe diagramme · Cluster wording · Aufwand M · Befunde: diagramme-15, diagramme-21, bereich_statistik-44, bereich_dashboard-35, diagramme-12, bereich_training-30, diagramme-39, bereich_notebook_news-18
Quelle: audit/spec/diagramme.md Z. 725–741 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/pt.js, web/js/lang/hi.js, web/js/lang/zh.js
Abhängig von: diagramme-C11, diagramme-C16, diagramme-C17, diagramme-E6, diagramme-I1, diagramme-J1, diagramme-L1

```text
| Startkapital {0} | Starting capital {0} |
| Median {0} | Median {0} |
| Ruin-Schwelle {0} | Ruin threshold {0} |
| Ruin ab {0} | Ruin from {0} |
| 1 T / 3 T / 1 W | 1 d / 3 d / 1 wk |
| {0} s | {0} s |
| Keine Trades | (vorhanden) |
| Ohne Verstöße: {0} | No violations: {0} |
| Keine Verstöße | No violations |
| Im Zeitraum wurde keine Regel gebrochen. | No rule was broken in this period. |
| über dem Boden | above the floor |
| Boden bei {0} | Floor at {0} |
| Boden fest bei {0} | Floor locked at {0} |
| Trade-Details | Trade details |
| Einstieg → Ausstieg | Entry → Exit |
| R-Multiple | R multiple |

```

## diagramme-3.14c · Sprachdateien: alte Schlüssel entfernen („Kumulierter Tages-P&L“, alte Satzfassungen en.js:48, 534, 868–871)

Gruppe diagramme · Cluster wording · Aufwand S · Befunde: diagramme-13, bereich_dashboard-36, diagramme-6, diagramme-18, farbe_kontrast-21
Quelle: audit/spec/diagramme.md Z. 742–743 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/pt.js, web/js/lang/hi.js, web/js/lang/zh.js
Abhängig von: diagramme-3.14a, diagramme-E8a, diagramme-F3

```text
Den Schlüssel „Kumulierter Tages-P&L“ (en.js:772) und die alten Fassungen der ersetzten Sätze (en.js:48, 534, 868–871) entfernen. „Kumulierter Netto-P&L“ existiert schon (en.js:372).

```

## zustaende-S-CO2 · Coach-Health: HTTP-Wortlaut „Der Server antwortet mit Fehler {0}.“

Gruppe zustaende · Cluster wording · Aufwand S · Befunde: zustaende-18
Quelle: audit/spec/zustaende.md Z. 604–606 · Dateien: web/js/coach.js
Abhängig von: —

```text
**S-CO2 HTTP-Wortlaut** – zustaende-18
Z. 43 `` `Server antwortet mit ${r.status}` `` → `` `Der Server antwortet mit Fehler ${r.status}.` ``. Z. 41 bleibt.

```

## zustaende-S-NW3 · News: Offline-Wortlaut mit „und deine Verbindung“

Gruppe zustaende · Cluster wording · Aufwand S · Befunde: zustaende-18
Quelle: audit/spec/zustaende.md Z. 807–809 · Dateien: web/js/screens/news.js
Abhängig von: —

```text
**S-NW3 Offline-Wortlaut** – zustaende-18
Z. 28 `'Der Server ist nicht erreichbar. Prüf die Adresse unter Einstellungen → Mentor.'` → `'Der Server ist nicht erreichbar. Prüf die Adresse unter Einstellungen → Mentor und deine Verbindung.'`

```
