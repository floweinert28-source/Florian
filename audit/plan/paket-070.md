# Paket 070 · wording

Schritte: 24 · Dateien: web/README.md, web/js/app.js, web/js/coach.js, web/js/core.js, web/js/lang/en.js, web/js/lang/es.js, web/js/lang/hi.js, web/js/lang/pt.js, web/js/lang/zh.js, web/js/screens/coupons.js, web/js/screens/dash-filter.js, web/js/screens/dashboard.js, web/js/screens/mentor.js, web/js/screens/misc.js, web/js/screens/news.js, web/js/screens/notebook.js, web/js/screens/prop.js, web/js/screens/ruhepunkt.js, web/js/screens/shadow.js, web/js/screens/trades.js, web/js/shadow.js, web/js/voice.js, web/js/widgets.js
Betroffene Tests laut Spezifikation: prüfen: e2e/langtest.js; web/e2e/langtest.js (Übersetzung); web/e2e/scorestatetest.js:10; web/e2e/settest.js:10
Baut auf Paketen auf: 2, 7, 9, 27, 28, 31, 32, 40, 41, 68, 69

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## zustaende-S-MT2 · Mentor: einheitlicher Offline- und HTTP-Wortlaut

Gruppe zustaende · Cluster wording · Aufwand S · Befunde: zustaende-18
Quelle: audit/spec/zustaende.md Z. 842–845 · Dateien: web/js/screens/mentor.js
Abhängig von: —

```text
**S-MT2 Wortlaut** – zustaende-18
- Z. 17 `'Der Mentor-Server ist nicht erreichbar. …'` → `'Der Server ist nicht erreichbar. Prüf die Adresse unter Einstellungen → Mentor und deine Verbindung.'`
- Z. 127 `'Server antwortet mit ' + r.status` → `'Der Server antwortet mit Fehler ' + r.status + '.'`

```

## zustaende-S-NB3 · Notebook-Speicherstand „Wird gespeichert …“

Gruppe zustaende · Cluster wording · Aufwand S · Befunde: bereich_notebook_news-24
Quelle: audit/spec/zustaende.md Z. 855–857 · Dateien: web/js/screens/notebook.js
Abhängig von: zustaende-S-C14

```text
**S-NB3 Speicherstand** – bereich_notebook_news-24
Z. 100 `'Speichert…'` → `'Wird gespeichert …'`. Die Klasse `saving` darf bleiben (hat keine Farbe mehr).

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .save-state] Ein Baustein für den Speicherstand, überall gleich. CSS: Z. 1030 `.nb .save-state` → `.save-state { font-size: var(--fs-12); line-height: var(--lh-12); color: var(--muted); margin-left: auto; white-space: nowrap; }`, solange die Typo-Tokens fehlen, 12px. Z. 1031 `.nb .save-state.saving` wird ersatzlos gelöscht. „Wird gespeichert …“ ist keine Warnung, --warn steht nur für Warnungen (zustaende Z5, farbe-Grundregel). Druck Z. 1193 `.nb .save-state` → `.save-state`. Neu: `.set-head .save-state { align-self: center; }`, Größe und Farbe aus der allgemeinen Regel. JS: misc.js `head()` setzt in jeden Einstellungen-Kopf `<span class="save-state" aria-live="polite"></span>${trailing}` (S-misc-a). Kein zweiter Span mit `id="set-save"` im Trading-Kopf. Angezeigt wird ausschließlich über `App.savedHint()` (A7), auch in Trading. Dauer 2000 ms (statt 1,5 s), weil der Hinweis im Kopf weit weg vom geänderten Feld steht. Notebook: Text „Wird gespeichert …“ (S-NB3); die Klasse `saving` hat keine Regel mehr und wird nicht mehr gesetzt (kein toter Code). Wie Trading sonst speichert (`save-trading-auto` gegen `data-change="save-trading"` aus komponenten-S-misc-e), entscheidet der Anker des Trading-Formulars.
- ÄNDERN: Zusätzlich in `setSaveState` (notebook.js:100) `el.classList.toggle('saving', s === 'saving')` streichen: Die CSS-Regel entfällt, die Klasse hätte keine Wirkung mehr.

## zustaende-S-L · Sprachdateien en/es/hi/pt/zh: alle neuen Schlüssel ergänzen, alte kleingeschriebene Countdown-Schlüssel entfernen

Gruppe zustaende · Cluster wording · Aufwand L · Befunde: —
Quelle: audit/spec/zustaende.md Z. 870–874 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/hi.js, web/js/lang/pt.js, web/js/lang/zh.js
Abhängig von: —

```text
### 3.23 `web/js/lang/{en,es,hi,pt,zh}.js` – S-L

Neue Schlüssel (deutsch → englisch; es/pt/hi/zh sinngemäß in derselben Form, Platzhalter beibehalten):
„Noch keine Trades“ → „No trades yet“; „Logge deinen ersten Trade oder importiere eine CSV-Datei.“ → „Log your first trade or import a CSV file.“; „Keine abgeschlossenen Trades im Zeitraum“ → „No closed trades in this period“; „Ändere den Zeitraum oder logge Trades.“ → „Change the period or log trades.“; „Keine Trades im Zeitraum“ → „No trades in this period“; „Keine Handelstage im Zeitraum“ → „No trading days in this period“; „Keine Trades passen zum Filter“ → „No trades match the filter“; „Ändere die Filter oder den Zeitraum.“ → „Change the filters or the period.“; „Noch keine abgeschlossenen Trades“ → „No closed trades yet“; „Noch keine abgeschlossenen Trades.“ → „No closed trades yet.“; „Noch keine Daten“ → „No data yet“; „Noch keine Wochen“ → „No weeks yet“; „Zu wenig Trades“ → „Not enough trades“; „Mindestens {0} Trades mit R-Wert nötig“ → „At least {0} trades with an R value needed“; „Der gleitende Durchschnitt erscheint ab {0} Trades mit R-Wert.“ → „The rolling average appears after {0} trades with an R value.“; „Keine Trades mit R im Zeitraum“ → „No trades with R in this period“; „Trage in der Trade-Ansicht unter „Plan & Bewertung“ einen Stop ein, dann wird das R-Multiple berechnet.“ → „Enter a stop under “Plan & review” in the trade view to calculate the R multiple.“; „Noch keine Regeln angelegt.“ → „No rules yet.“; „Regeln anlegen“ → „Add rules“; „Vorzeitraum: {0}“ → „Previous period: {0}“; „Symbol wählen“, „Long oder Short wählen“ (falls fehlend) → „Choose a symbol“, „Choose long or short“; „Einstieg eintragen“ → „Enter the entry“; „Kontrakte eintragen“ → „Enter the contracts“; „Datum eintragen“ → „Enter the date“; „Ausstieg eintragen oder Geschlossen leeren“ → „Enter the exit or clear Closed“; „Pflichtfeld“ → „Required“; „Mindestens {0}“ → „At least {0}“; „Höchstens {0}“ → „At most {0}“; „Gültige E-Mail-Adresse eintragen“ → „Enter a valid email address“; „Ungültiger Wert“ → „Invalid value“; „In {0} Min.“ → „In {0} min“; „In {0} Std. {1} Min.“ → „In {0} h {1} min“; „In {0} Std.“ → „In {0} h“; „In {0} Tagen“ → „In {0} days“ (alte kleingeschriebene Schlüssel „jetzt“, „morgen“, „in {0} …“ entfernen, wenn grep keine weitere Nutzung findet); „Wird gespeichert …“ → „Saving …“; „Wird geladen …“ → „Loading …“; „{0} abgeschlossen“ → „{0} closed“; „Summe aller abgeschlossenen Trades im Zeitraum, bei aktiver Suche oder aktivem Filter nur der gefilterten. Daneben der Verlauf je Handelstag.“ → „Sum of all closed trades in the period; with an active search or filter, only the filtered ones. Next to it, the curve per trading day.“; „Ungültiges Datum“ → „Invalid date“; „Die Adresse enthält kein gültiges Datum.“ → „The address does not contain a valid date.“; „Zum heutigen Tag“ → „Go to today“; „Verpassten Trade löschen?“ → „Delete missed trade?“; „Der Eintrag wird dauerhaft entfernt.“ → „The entry will be removed permanently.“; „Screenshot löschen?“ → „Delete screenshot?“; „Screenshot vor Entry löschen?“ → „Delete pre-entry screenshot?“; „Das Bild wird dauerhaft entfernt.“ → „The image will be removed permanently.“; „Sprachnotiz löschen?“ → „Delete voice note?“; „Aufnahme und Transkript werden dauerhaft entfernt.“ → „The recording and transcript will be removed permanently.“; „Check-in löschen?“ → „Delete check-in?“; „Die Angaben dieses Check-ins werden gelöscht.“ → „This check-in’s entries will be deleted.“; „Regel löschen?“ → „Delete rule?“; „„{0}“ wird gelöscht. Zum Pausieren reicht der Schalter.“ → „“{0}” will be deleted. To pause it, use the switch.“; „Session verwerfen?“ → „Discard session?“; „Deine Eingaben aus dieser Session gehen verloren.“ → „Your entries from this session will be lost.“; „Verwerfen“ → „Discard“; „Tags auf Standard zurücksetzen“ → „Reset tags to default“; „Tags auf Standard zurücksetzen?“ → „Reset tags to default?“; „Adresse speichern“ → „Save address“; „Trage zuerst eine E-Mail-Adresse ein“ → „Enter an email address first“; „E-Mail-Benachrichtigung aus“ → „Email notifications off“; „Schick den Einladungslink oben an deine Schüler. Wer beitritt, erscheint hier mit Kurz-Stats.“ → „Send the invite link above to your students. Anyone who joins appears here with quick stats.“; „Boden fest“ → „floor locked“; „Ab zwei Grabsteinen erscheinen Muster: Uhrzeit, Wochentag, Symbol, Setup, Verlustserie oder Emotion, wenn sie sich wiederholen.“ → „From two tombstones on, patterns appear: time, weekday, symbol, setup, losing streak or emotion, when they repeat.“; „{0} T“ → „{0} d“; „{0} s“ → „{0} s“. Prop-Bilanz-Texte („noch keine Ausgaben“) sind wie der Rest der Bilanz noch nicht übersetzt und brauchen keinen Schlüssel.

```

## kilook-C26 · Wörterbücher en/es/pt/zh/hi: neue Schlüssel (Bedienung, Tastenkürzel …), alte Tastatur-Schlüssel löschen

Gruppe kilook · Cluster wording · Aufwand S · Befunde: barrierefreiheit-43, diagramme-4
Quelle: audit/spec/kilook.md Z. 727–744 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/pt.js, web/js/lang/zh.js, web/js/lang/hi.js
Abhängig von: kilook-C24

```text
**C26 · web/js/lang/{en,es,pt,zh,hi}.js · neue und geänderte Schlüssel** (barrierefreiheit-43, diagramme-4)

| Deutsch | en | es | pt | zh | hi |
|---|---|---|---|---|---|
| `Bedienung` | Controls | Controles | Controles | 操作 | नियंत्रण |
| `Tastenkürzel` | Keyboard shortcuts | Atajos de teclado | Atalhos de teclado | 键盘快捷键 | कीबोर्ड शॉर्टकट |
| `Trade loggen ·` | Log trade · | Registrar trade · | Registrar trade · | 记录交易 · | ट्रेड दर्ज करें · |
| `Bereich wechseln` | switch section | cambiar sección | trocar seção | 切换区域 | सेक्शन बदलें |
| `Speicherort: dieser Browser (localStorage und IndexedDB).` | Storage: this browser (localStorage and IndexedDB). | Almacenamiento: este navegador (localStorage e IndexedDB). | Armazenamento: este navegador (localStorage e IndexedDB). | 存储位置：此浏览器（localStorage 和 IndexedDB）。 | स्टोरेज: यह ब्राउज़र (localStorage और IndexedDB)। |

- Die nicht mehr benutzten Schlüssel löschen:
  - `"Speicherort: dieser Browser (localStorage und IndexedDB). Tastatur:"`
  - `"neuer Trade ·"`
  - `"Bereiche ·"`
  - `"schließt Dialoge."`
  Vorher mit `grep -rn` prüfen, dass kein anderer Text sie braucht.
- Der Prop-Hinweis (prop.js:194) hat in den Wörterbüchern noch keinen Schlüssel (Prop ist nicht in Etappe 1). Nichts eintragen.

```

## kilook-C28 · README: Tastatur, Mentor-Notiz, Fortschritt, Kalender, Schrift, Geldformat, Prop-Währung

Gruppe kilook · Cluster wording · Aufwand S · Befunde: barrierefreiheit-43, bereich_konto-17, ki_look-33, ki_look-6, diagramme-31, typografie-33, diagramme-32, diagramme-35, diagramme-4
Quelle: audit/spec/kilook.md Z. 751–762 · Dateien: web/README.md
Abhängig von: kilook-A1, kilook-A2, kilook-A5, kilook-B3, kilook-B4, kilook-C6, kilook-C9a, kilook-C18, kilook-C19b, kilook-C19c, kilook-C20, kilook-C24

```text
**C28 · web/README.md · Dokumentation** (alle umgesetzten Befunde)
- **318** `Tastatur: **N** neuer Trade, **1–6** Bereiche, **Esc** schließt Dialoge.`
  → `Tastatur: **N** Trade loggen, **1–9** Bereiche (0 = Blind-Replay, nur wenn freigeschaltet), **Esc** schließt Dialoge. Die Einzeltasten lassen sich unter Einstellungen → Profil → Bedienung abschalten.`
- **153** hinter „(Badge „Mentor“, Name, Zeit; …)“ ergänzen: „Notiz als neutrale Fläche mit feinem Rand, ohne Farbstreifen“.
- **129** (Fortschritt) ergänzen: „„% Regeln eingehalten“ zeigt ohne Regeln oder Regel-Check „—“ und keinen Ring; der Ring leuchtet nicht.“
- **190** (Kalender-Kacheln) ergänzen: „Im Monatsraster stehen Tages- und Wochenbeträge ohne Cent; die Cent zeigt die Tagesansicht.“
- **172** (Schrift) ergänzen: „`app.html` und die Startseite laden von Google nur Onest; Inter und Roboto lädt `Theme.loadFont` nur für „Klassisch“.“
- **211** (Geld-blind-Modus, Absatz zu `fmt.cur`) ergänzen: „Genauigkeit nach Bedeutung: Ergebnisse, Gebühren und Payouts immer mit Cent und Ergebnisse mit Vorzeichen; Bestände (`fmt.balance`), Limits, Ziele, Puffer und Monte Carlo ganzzahlig. Keine Größenschwelle.“
- **241 ff.** (Prop Firms) ergänzen: „Alles, was zu einem Konto gehört (Balance, P&L, Limits, Puffer, Payout-Planer, Grabstein), steht in der Kontowährung; Bilanz und Payout-Liste in der Journal-Währung; die Kachel „P&L aktive Konten“ summiert je Währung.“

---

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: fmt.balance] Für Bestände und Regelgrößen gibt es keine Ganzzahl-Regel. Geld hat immer 2 Nachkommastellen (zustaende-S-U1); typografie K24 und zustaende K14 haben „Balance und Limits ganzzahlig“ ausdrücklich verworfen, nur kilook will es. fmt.balance bleibt `fmt.cur(v, o)` ohne Vorzeichen und wird im Geld-blind-Modus ausgeblendet. Ohne Cent (compact) stehen Beträge nur im Kalender-Monatsraster (.p Tageszelle, Wochensumme), an Achsen (fmt.axisCur), in Kurzformen (.pm, curShort, curCompact) und bei Monte Carlo. Damit sind Kontostand, Limits, Ziel, Puffer, „… fehlen“, „heute noch … erlaubt“, Vorschlag und die Affiliate-Kacheln so genau wie P&L, und „X von Y“ ist auf beiden Seiten gleich genau. Die Grabstein-Unterzeile zeigt keinen Geldbetrag (wording-S12.28-12.29).
- ÄNDERN: README Z. 211: „Geldbeträge immer mit Cent, Ergebnisse mit Vorzeichen, Bestände ohne; ohne Cent nur im Kalender-Monatsraster, an Achsen, in Kurzformen und bei Monte Carlo. Keine Größenschwelle.“ Z. 241 ff.: „Kontostand“ statt „Balance“ und „P&L der aktiven Konten“. Z. 129: „Regeltreue“ statt „% Regeln eingehalten“. Die übrigen Punkte bleiben.

## responsiv-3.18 · Sprachdateien: neue Texte eintragen, Prop-Kartenwert auf Englisch prüfen

Gruppe responsiv · Cluster wording · Aufwand M · Befunde: bereich_prop-10, bereich_training-24, responsiv-6, bereich_notebook_news-11, bereich_dashboard-4, bereich_training-38
Quelle: audit/spec/responsiv.md Z. 550–553 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/zh.js, web/js/lang/hi.js, web/js/lang/pt.js, web/js/screens/prop.js
Abhängig von: responsiv-3.3a, responsiv-3.10, responsiv-3.12a, responsiv-3.12c, responsiv-3.13, responsiv-3.15

```text
### 3.18 web/js/lang/{en,es,zh,hi,pt}.js

Neue Einträge (Muster wie vorhanden): „Bis zum Bestehen“ (en „To pass“), „{0} fehlen“ (en „{0} to go“), „{0}× gebrochen“ (en „Broken {0}×“), „Beantragt {0}“ (en „Requested {0}“), „Schreib dem Mentor …“ (en „Write to your mentor …“). „Teilen“, „Konto: {0}“, „Verlauf löschen“ prüfen und fehlende Einträge ergänzen. Der Wert der Prop-Karte ist ein einziger Textknoten („in 3 Handelstagen · 1.946,15 $ fehlen“): auf Englisch umschalten und prüfen, dass er vollständig übersetzt wird; fehlt ein Muster für die Kombination, die Teile in planText je in ein eigenes `<span>` setzen.

```

## wording-S2.1 · core.js: Radar-Achse in SCORE_AXES „Win-Rate“ → „Trefferquote“

Gruppe wording · Cluster wording · Aufwand S · Befunde: wording-3, bereich_dashboard-32
Quelle: audit/spec/wording.md Z. 304–308 · Dateien: web/js/core.js
Abhängig von: —

```text
### Schritt 2 · `web/js/core.js` (zentrale Kennzahl-Namen)

| # | Stelle | vorher → nachher | ids |
|---|---|---|---|
| 2.1 | `SCORE_AXES` Z. 265 | `winRate: 'Win-Rate'` → `winRate: 'Trefferquote'` (übrige Achsen unverändert) | wording-3, bereich_dashboard-32 |
```

## wording-S2.14 · core.js insights(): Einzahl „1 Trade“ und „Trefferquote“ in den Insight-Sätzen

Gruppe wording · Cluster wording · Aufwand S · Befunde: wording-3, zustaende-28
Quelle: audit/spec/wording.md Z. 321–322 · Dateien: web/js/core.js
Abhängig von: —

```text
| 2.14 | `insights()` Z. 544–549 | neue lokale Hilfsfunktion in `insights()` direkt nach `const pct = …` (Z. 541): `const nT = n => n === 1 ? '1 Trade' : \`${n} Trades\`;`; in Z. 544 `${mr.mistakeN} Trades mit Fehler-Tags` → `${nT(mr.mistakeN)} mit Fehler-Tags`, Z. 546 `${best.s.n} Trades, Win-Rate ${pct(…)}` → `${nT(best.s.n)}, Trefferquote ${pct(…)}` und `${worst.s.n} Trades mit` → `${nT(worst.s.n)} mit`, Z. 548 `bei ${b.s.n} Trades` → `bei ${nT(b.s.n)}`, Z. 549 `${wd[0].s.n} Trades mit` → `${nT(wd[0].s.n)} mit` | wording-3, zustaende-28 |

```

## wording-S5.6-5.8 · app.js: Zähler über U.count (Symbol-Liste, CSV-Import) und „Trefferquote“ im Session-Ende

Gruppe wording · Cluster wording · Aufwand S · Befunde: zustaende-28, wording-3, bereich_trades_tag-36
Quelle: audit/spec/wording.md Z. 358–360 · Dateien: web/js/app.js
Abhängig von: wording-S1.1-1.3

```text
| 5.6 | app.js:391 Symbol-Liste | `(o.n === 1 ? '1 Trade' : \`${o.n} Trades\`)` → `U.count(o.n, 'Trade', 'Trades')` | zustaende-28 |
| 5.7 | app.js:530 Session-Ende | `<div class="caption">Win-Rate</div>` → `<div class="caption">Trefferquote</div>` | wording-3, bereich_trades_tag-36 |
| 5.8 | app.js:567 und :574 (CSV) | `${preview.trades.length} Trades erkannt` → `${U.count(preview.trades.length, 'Trade', 'Trades')} erkannt`; Toast `${fresh.length} Trades importiert` → `${U.count(fresh.length, 'Trade', 'Trades')} importiert` | zustaende-28 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: App.openSessionEnd] kilook-C8c setzt app.js:530 einmal um: dreimal `<div class="kpi-label">` mit den Beschriftungen „Heute“, „Trades“, „Trefferquote“ (Wording-Glossar, nie „Win-Rate“). guard: true (P14b, Z. 529), die Checkbox .vh mit done (P14c, Z. 531) und der Hinweis .lbl-hint (farbe-C12c, Z. 533) betreffen andere Stellen und sind verträglich.
- ÄNDERN: 5.7 ändert nur den Text „Win-Rate“ → „Trefferquote“ in dem `<div class="kpi-label">`, das kilook-C8c setzt, und nicht die Klasse zurück auf .caption. 5.6 und 5.8 bleiben.

## wording-S6.16-6.18 · Disziplin-Kosten-, Schatten-Ich- und Blind-Replay-Widget: „Verstöße“, „Lege fest“, Zähler

Gruppe wording · Cluster wording · Aufwand S · Befunde: wording-38, zustaende-28
Quelle: audit/spec/wording.md Z. 382–384 · Dateien: web/js/widgets.js
Abhängig von: wording-S1.1-1.3

```text
| 6.16 | widgets.js:323 / :331 desc | `'Schatten-Ich: was Regelbrüche dich im Zeitraum gekostet oder gebracht haben.'` → `'Schatten-Ich: was Verstöße dich im Zeitraum gekostet oder gebracht haben.'`; `'… was Regelbrüche gekostet haben, …'` → `'… was Verstöße gekostet haben, …'` | wording-38 |
| 6.17 | widgets.js:334 | `Leg fest, was für dich gilt. Dann rechnet dein Schatten-Ich, was Regelbrüche kosten.` → `Lege fest, was für dich gilt. Dann rechnet dein Schatten-Ich, was Verstöße kosten.` | wording-38 |
| 6.18 | widgets.js:344 / :348 | `${fmt.int(ready)} Trades bereit` → `${U.count(ready, 'Trade', 'Trades')} bereit`; `von ${fmt.int(st.n)} Trades` → `von ${U.count(st.n, 'Trade', 'Trades')}` | zustaende-28 |
```

## wording-S6.19-6.22 · Prop-Konten- und Mentor-Widget: „Kontostand“, „Prop-Konto anlegen“, „reicht für N Stops“, „Journalyst-Server“

Gruppe wording · Cluster wording · Aufwand S · Befunde: wording-32, wording-34, wording-33, wording-14
Quelle: audit/spec/wording.md Z. 385–388 · Dateien: web/js/widgets.js
Abhängig von: —

```text
| 6.19 | widgets.js:351 Prop-Widget desc/info | „Ampel, Balance und Puffer“ → „Ampel, Kontostand und Puffer“; „die Ampel, die Balance und …“ → „die Ampel, den Kontostand und …“ | wording-32 |
| 6.20 | widgets.js:354 Leerzustand | `Leg ein Konto an, dann siehst du hier Ampel, Balance und Puffer.` → `Lege ein Prop-Konto an, dann siehst du hier Ampel, Kontostand und Puffer.`; Knopftext `Konto anlegen` → `Prop-Konto anlegen` | wording-32, wording-34 |
| 6.21 | widgets.js:358 | `noch ${b.stops} Stop-Loss${b.stops === 1 ? '' : 'es'}` → `reicht für ${b.stops} Stop${b.stops === 1 ? '' : 's'}` | wording-33 |
| 6.22 | widgets.js:373 Mentor-Widget | `Der Mentor läuft über deinen eigenen Server.` → `Der Mentor läuft über deinen Journalyst-Server.` (Knopf und Ziel `#/mentor` bleiben, fwtest.js:46) | wording-14 |
```

## wording-S7.1-7.3 · Dashboard: Widget-Suche „Widgets durchsuchen“ mit aria-label, „Neuer Recap“, Banner-Knopf „CSV importieren“

Gruppe wording · Cluster wording · Aufwand S · Befunde: wording-51, wording-11, wording-49
Quelle: audit/spec/wording.md Z. 395–401 · Dateien: web/js/screens/dashboard.js
Abhängig von: —

```text
### Schritt 7 · `web/js/screens/dashboard.js` und `web/js/screens/dash-filter.js`

| # | Stelle | vorher → nachher | ids |
|---|---|---|---|
| 7.1 | dashboard.js:78 Widget-Suche | `placeholder="Widget suchen …"` → `placeholder="Widgets durchsuchen" aria-label="Widgets durchsuchen"` | wording-51 |
| 7.2 | dashboard.js:89 Hinweis-Punkt | `'Neuer Performance-Recap'` → `'Neuer Recap'` | wording-11 |
| 7.3 | dashboard.js:130 Willkommen-Banner | `${I.upload} CSV</button>` → `${I.upload} CSV importieren</button>` | wording-49 |
```

## wording-S7.4-7.6 · Dashboard-Filter: Platzhalter „Von“/„Bis“, „Intraday / Mehrtägig“, „Nachbereitet: Alle · Ja · Nein“

Gruppe wording · Cluster wording · Aufwand S · Befunde: bereich_dashboard-31
Quelle: audit/spec/wording.md Z. 402–405 · Dateien: web/js/screens/dash-filter.js
Abhängig von: —

```text
| 7.4 | dash-filter.js:104 `pair()` | `placeholder="${o.ph1 \|\| 'Min'}"` → `\|\| 'Von'`; `placeholder="${o.ph2 \|\| 'Max'}"` → `\|\| 'Bis'` | bereich_dashboard-31 |
| 7.5 | dash-filter.js:119 | `row('Intraday / Multiday', seg('span', f, [['', 'Alle'], ['intraday', 'Intraday'], ['multiday', 'Multiday']]))` → `row('Intraday / Mehrtägig', seg('span', f, [['', 'Alle'], ['intraday', 'Intraday'], ['multiday', 'Mehrtägig']]))` | bereich_dashboard-31 |
| 7.6 | dash-filter.js:120 | `row('Reviewed', seg('reviewed', f, [['', 'Alle'], ['yes', 'Reviewed'], ['no', 'Unreviewed']]), 'Bewertung oder Notiz vorhanden')` → `row('Nachbereitet', seg('reviewed', f, [['', 'Alle'], ['yes', 'Ja'], ['no', 'Nein']]), 'Bewertung oder Notiz vorhanden')` (Werte `yes`/`no` bleiben, filtertest.js:62) | bereich_dashboard-31 |

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .fd-pair .input] .fd-pair .input bekommt das Token aus typografie-3.2.3l. Im Filter-Fenster wirkt .fd-pop .fd-pair .input mit var(--fs-12) (typografie-3.2.3f). Das neue Datums-Overlay .dp-display aus wording-S3.1-3.3 nimmt dieselben Stufen wie sein Feld statt 13.5/12.5 px, denn beide Werte sind in der Skala verboten und das Overlay muss deckungsgleich mit dem Feldtext sein: .dp-display { …; font-size: var(--fs-14); line-height: var(--lh-14); } (wie .input nach typografie-3.2.3m) und .fd-pop .fd-pair .dp-display { font-size: var(--fs-12); line-height: var(--lh-12); left: 11px; }. Der leere Zustand („Offen“) steht in Platzhalterfarbe --muted statt --faint, weil --faint laut farbe nie für Wörter gilt und Platzhalter laut farbe-B3a --muted sind: .dp-display.empty { color: var(--muted); } und .input.is-empty::-webkit-datetime-edit { color: var(--muted); }. Die Platzhalter „Von“/„Bis“ und die Filtertexte aus wording-S7.4-7.6 bleiben.

## wording-S9.8-9.9 · TradeLog: Seitenwähler-Zähler über U.count, „Trefferquote“ in den Tageskarten

Gruppe wording · Cluster wording · Aufwand S · Befunde: zustaende-28, wording-3, bereich_trades_tag-36
Quelle: audit/spec/wording.md Z. 431–432 · Dateien: web/js/screens/trades.js
Abhängig von: wording-S1.1-1.3

```text
| 9.8 | Z. 48 Seitenwähler | `von ${rows.length} Trades` → `von ${U.count(rows.length, 'Trade', 'Trades')}` | zustaende-28 |
| 9.9 | Z. 54 Tageskarten | `<div class="k">Win-Rate</div>` → `<div class="k">Trefferquote</div>` | wording-3, bereich_trades_tag-36 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- ÄNDERN: 9.8: Muster ohne Leerzeichen um den Strich, „{0}–{1} von {2} Trades“; U.count wie geplant. Umgesetzt wird es in komponenten-S-trades-c. 9.9 unverändert.

## wording-S9.17 · Dialogtitel „Text-Notiz“ statt „Notiz sprechen oder tippen“

Gruppe wording · Cluster wording · Aufwand S · Befunde: bereich_trades_tag-47
Quelle: audit/spec/wording.md Z. 440–441 · Dateien: web/js/screens/trades.js
Abhängig von: —

```text
| 9.17 | Z. 118 Dialogtitel | `<h2>Notiz sprechen oder tippen</h2>` → `<h2>Text-Notiz</h2>` | bereich_trades_tag-47 |

```

## wording-S11.1-11.5 · Schatten-Ich: Regel „Schluss nach Verlustserie“, Kosten-Texte mit „Verstöße“, DESC-Texte, Banner ohne Gedankenstrich, Zähler

Gruppe wording · Cluster wording · Aufwand S · Befunde: wording-41, wording-38, wording-10, zustaende-28
Quelle: audit/spec/wording.md Z. 462–470 · Dateien: web/js/shadow.js, web/js/screens/shadow.js
Abhängig von: wording-S1.1-1.3

```text
### Schritt 11 · `web/js/shadow.js` und `web/js/screens/shadow.js`

| # | Stelle | vorher → nachher | ids |
|---|---|---|---|
| 11.1 | js/shadow.js:14 | `label: 'Stopp nach Verlusten in Folge'` → `label: 'Schluss nach Verlustserie'` (Regel-Schlüssel `lossStreak` bleibt; das aria-label „… : Verluste“ zieht mit) | wording-41 |
| 11.2 | screens/shadow.js:25 `costView` | `'Regelbrüche haben dich das gekostet'` → `'So viel haben dich Verstöße gekostet'`; `'Regelbrüche haben dir das gebracht'` → `'So viel haben dir Verstöße gebracht'` | wording-38 |
| 11.3 | screens/shadow.js:32 `DESC` | `dailyLoss: 'Ist das Tageslimit erreicht, ist für heute Schluss.'` → `'Ist der maximale Tagesverlust erreicht, ist für heute Schluss.'`; `lossStreak: 'Nach so vielen Verlusten hintereinander ist Pause.'` → `'Nach so vielen Verlusten hintereinander ist für heute Schluss.'` | wording-10, wording-41 |
| 11.4 | screens/shadow.js:58 Banner | `'Schalte oben mindestens eine Regel ein – dann rechnet dein Schatten-Ich, was Regelbrüche kosten.'` → `'Schalte oben mindestens eine Regel ein. Dann rechnet dein Schatten-Ich, was Verstöße kosten.'` | wording-38 |
| 11.5 | screens/shadow.js:59 | `${res.unknownRisk === 1 ? '1 Trade ohne Stop konnte' : \`${…} Trades ohne Stop konnten\`}` → `${U.count(res.unknownRisk, 'Trade', 'Trades')} ohne Stop ${res.unknownRisk === 1 ? 'konnte' : 'konnten'}` | zustaende-28 |
```

## wording-S11.6-11.11 · Schatten-Ich-Karten: „Regelwerk“, Intro, Info-Texte, Kachel-Fuß „Ohne Verstöße“, Diagramm „Kumulierter Netto-P&L“

Gruppe wording · Cluster wording · Aufwand S · Befunde: wording-25, wording-38, wording-39, wording-40
Quelle: audit/spec/wording.md Z. 471–477 · Dateien: web/js/screens/shadow.js
Abhängig von: —

```text
| 11.6 | screens/shadow.js:60 | `U.card('Mein Regelwerk', …, { info: 'Schalte ein, was für dich gilt. Dein Schatten-Ich hält sich daran – Änderungen gelten sofort.' })` → `U.card('Regelwerk', …, { info: 'Schalte ein, was für dich gilt. Dein Schatten-Ich hält sich daran, Änderungen gelten sofort.' })` | wording-25, wording-38 |
| 11.7 | screens/shadow.js:108 Intro | `Dein Schatten-Ich handelt wie du – nur ohne Regelbrüche.` → `Dein Schatten-Ich handelt wie du, hält sich aber an jede aktive Regel.` | wording-38 |
| 11.8 | screens/shadow.js:109 | `'Sobald Trades geschlossen sind, zeigt dir dein Schatten-Ich, was Regelbrüche kosten.'` → `'… was Verstöße kosten.'` | wording-38 |
| 11.9 | screens/shadow.js:112 Info | `'Schatten-Ich minus echt: Was Regelbrüche im Zeitraum unterm Strich bewirkt haben.'` → `'Schatten-Ich minus echt: was Verstöße im Zeitraum unterm Strich bewirkt haben.'` | wording-38 |
| 11.10 | screens/shadow.js:114 | `{ foot: 'Mit allen Regeln eingehalten' }` → `{ foot: 'Ohne Verstöße' }` | wording-39 |
| 11.11 | screens/shadow.js:118 | `U.card('Equity: echt vs. Schatten-Ich', …, { info: '… lässt Trades mit Regelbruch weg …' })` → `U.card('Kumulierter Netto-P&L', …, { info: '… lässt Trades mit Verstoß weg …' })` (Legende „Echt / Schatten-Ich“ bleibt) | wording-40, wording-38 |

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: U.tile] (1) Statistik → Tage (aufbau-C14d): Die Kacheln folgen der Farb- und Vorzeichenregel. „Gewinntage / Verlusttage“ wird nur bei > 0 gefärbt (`<span class="${ds.winDays ? 'pos' : ''}">…</span> / <span class="${ds.lossDays ? 'neg' : ''}">…</span>`, farbe-C30). „Ø Gewinntag“ wird `U.pnl(ds.avgWinDay)`, „Ø Verlusttag“ `U.pnl(ds.avgLossDay)`: Ergebnisse tragen ein Vorzeichen (kilook Z5b), avgLossDay ist negativ. Die Karte „P&L nach Wochentag“ entfällt mit aufbau-C14d und damit auch wording 10.3. (2) Statistik → Fehler: Kachel 1 behält das Vorzeichen `fmt.cur(mr.cost, { signed: true })`, die Klasse richtet sich nach dem Vorzeichen (neg/pos/neu). Die Beschriftung wechselt nach wording zwischen „Fehler haben gekostet“ und „Fehler haben eingebracht“. farbe K13 („Disziplin-Kosten überall mit Vorzeichen“, ausdrücklich auch für Statistik → Fehler) und kilook Z5b gehen vor; die Prüfzeile in wording (stats_mistakes.png) lautet dann „mit Minus“. (3) Affiliate: Die Kacheln behalten die Cent, kein moneyK (Begründung unter fmt.balance). Die Begriffe aus wording 13.3–13.7 bleiben, die Kachel „Creator“ entfällt (aufbau-C3). (4) Schatten-Ich, Kachel „Echt“: Fuß mit U.count. (5) Prop-Summe siehe summaryTiles, Monte Carlo siehe fmt.cur. Verträglich sind farbe-C27, wording 12.28, wording-S11.6-11.11 und wording-S15.10-15.15.
- [konflikt: U.card] (1) Statistik-Kurve: Platz und Titel folgen aufbau-C14b, also erste Karte in „Übersicht“, Titel „Kumulierter Netto-P&L“, h240, ohne Legende; über dem Inhalt stehen nur die Reiter. Der Inhalt folgt diagramme-G1/A-14: ein Punkt je Handelstag, kein fillDays. „Nur mit abgeschlossenen Trades“ ist durch die Leer-Prüfung am Anfang von tabSummary erfüllt (zustaende-S-ST2). zustaende-S-ST1 entfällt, fillDays löscht diagramme-G2. (2) Tagesansicht, Kennzahlenkarte: nur mit Trades, die Spark nur mit abgeschlossenen Trades (zustaende-S-DY2). Gewinner und Verlierer werden nur bei > 0 gefärbt, das setzt farbe-C20 einmal um. (3) Fortschritt: Die Karte heißt „Regeltreue“ (wording 8.6) und hat den Inhalt aus kilook-C18 („—“ ohne Grundlage, Ring nur mit Wert). Die Prüflisten (aufbau Prüfung Z. 750, README in kilook-C28) nennen „Regeltreue“. (4) „Aktuelle Regeln“ entfällt (siehe #/settings/regeln), die Tage-Tabelle steht in „Tage im Detail“ (siehe .tbl-wrap.inset). Verträglich sind aufbau-B8 (h2), abstaende-I3, komponenten-S-prop-c, wording-S10.1-10.7 und wording-S11.6-11.11.

## wording-S12.30 · Coupons-Leerzustand „Coupon-Codes für Prop Firms erscheinen hier.“

Gruppe wording · Cluster wording · Aufwand S · Befunde: wording-55
Quelle: audit/spec/wording.md Z. 511–512 · Dateien: web/js/screens/coupons.js
Abhängig von: —

```text
| 12.30 | coupons.js:13 | `'Rabatt-Codes für Prop Firms erscheinen hier.'` → `'Coupon-Codes für Prop Firms erscheinen hier.'` | wording-55 |

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: U.empty] (1) Check-in-Leerzustände nutzen I.mood: kilook-C13 in day.js:16, kilook-C14 in stats.js:61. kilook-C25 löscht I.sparkle; der Satz „Z. 61 Symbol sparkle bleibt“ in zustaende-S-ST2 gilt deshalb nicht. (2) Den Knopftext im Check-in-Leerzustand der Tagesansicht setzt aufbau-C7c einmal: `${key < C.dayKey(new Date()) ? 'Check-in nachtragen' : 'Check-in machen'}`. Für künftige Tage passt „nachtragen“ nicht. (3) Schatten-Ich-Ranking (diagramme-I1): Ein leerer Hinweis ist nicht erlaubt (zustaende Z1: nie ''), also `U.empty('shield', 'Keine Regel aktiv', 'Schalte oben im Regelwerk mindestens eine Regel ein.')`. Ohne Verstoß gibt es keinen zweiten Leerzustand „Keine Verstöße“, der steht schon in der Nachbarkarte „Regelverstöße“. Es bleibt nur die Zeile „Ohne Verstöße: …“. (4) TradeLog-Liste: `return (list.length ? filters : '') + U.empty('tradelog', …)` mit Titel und Satz nach zustaende-S-T3. wording 9.7 und S-T3 ergänzen sich in derselben Zeile. (5) Regeln im Fortschritt: siehe #/settings/regeln. Verträglich sind aufbau-C15c, wording 9.14, 12.6, 12.30, zustaende-S-DY1 und noTrades aus S-ST2.

## wording-S14.8-14.9 · Notebook: Zähler über U.count, Toast „Notiz verschoben“

Gruppe wording · Cluster wording · Aufwand S · Befunde: zustaende-28, bereich_notebook_news-27
Quelle: audit/spec/wording.md Z. 536–537 · Dateien: web/js/screens/notebook.js
Abhängig von: wording-S1.1-1.3

```text
| 14.8 | notebook.js:141 / 142 / 149 / 162 | `` `${nb.selected.length} Notizen verschoben` `` → `` `${U.count(nb.selected.length, 'Notiz', 'Notizen')} verschoben` ``; ebenso `… löschen?` (142), `… endgültig löschen?` (149); Z. 162 `Alle ${n} Notizen darin werden …` → `${n === 1 ? 'Die Notiz darin wird' : \`Alle ${n} Notizen darin werden\`} mit gelöscht …` | zustaende-28 |
| 14.9 | notebook.js:143 | `U.toast('Verschoben', 'ok')` → `U.toast('Notiz verschoben', 'ok')` | bereich_notebook_news-27 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: U.toast] zustaende-S-U6 übernimmt toastWrap() und toast() ganz. Der Container hat role=status und aria-live=polite. Dauer: min(7000, max(err ? 4500 : 2400, 1200 + Länge·55)) ms. Beim Darüberfahren hält der Toast an, nach dem Verlassen bleibt er noch 1500 ms. Ausgeblendet wird über Motion.leave mit '--dur-2', passend zu .toast.out. barrierefreiheit-U4 legt nur noch announce() mit #sr-live an, denn sein toastWrap ist Wort für Wort derselbe. Es gibt nur einen Namen: U.toastWrap (Export über barrierefreiheit-U7). Die Zeile toast.init = toastWrap entfällt. Beim Start wird genau einmal U.toastWrap() aufgerufen (barrierefreiheit-P10). Wo zustaende-S-A1 U.toast.init() vorsieht, steht U.toastWrap(); die Zusammenführung von P10 und S-A1 in App.bind regelt konflikt-1. Formularfehler laufen nicht über Toasts (P12 und komponenten-S-trades-h, siehe #trade-form und #f-dir). wording-S14.8-14.9 ruft U.toast unverändert auf.

## wording-S15.1-15.3 · News: Fehlertexte auf „Journalyst-Server“ und „Einstellungen → Server“, Banner gekürzt

Gruppe wording · Cluster wording · Aufwand S · Befunde: bereich_notebook_news-46, wording-14, bereich_notebook_news-45
Quelle: audit/spec/wording.md Z. 541–547 · Dateien: web/js/screens/news.js
Abhängig von: —

```text
### Schritt 15 · Server-Texte: `web/js/screens/news.js`, `web/js/screens/mentor.js`, `web/js/screens/coach.js`, `web/js/coach.js`, `web/js/voice.js`, `web/js/screens/ruhepunkt.js`

| # | Stelle | vorher → nachher | ids |
|---|---|---|---|
| 15.1 | news.js:28 | `'Der Server ist nicht erreichbar. Prüf die Adresse unter Einstellungen → Mentor.'` → `'Der Journalyst-Server ist nicht erreichbar. Prüfe deine Verbindung und die Adresse unter Einstellungen → Server.'` | bereich_notebook_news-46, wording-14 |
| 15.2 | news.js:29 | `'Zugangstoken fehlt oder ist falsch (Einstellungen → Mentor).'` → `'Zugangstoken fehlt oder ist falsch. Prüfe es unter Einstellungen → Server.'` | bereich_notebook_news-46, wording-14 |
| 15.3 | news.js:91 Banner | `<b>Beispielansicht.</b> Echte Termine kommen über deinen Journalyst-Server (derselbe wie für den Mentor). <span class="muted">Die Beispiele haben keine Prognose- oder Vorwerte.</span>` → `<b>Beispielansicht.</b> Echte Termine kommen über deinen Journalyst-Server.` (Knopf „Server einrichten“ bleibt; Präfix „Beispiel: “ in Z. 40 bleibt) | bereich_notebook_news-45, wording-14 |
```

## wording-S15.4-15.5 · Mentor: Fehler- und Einrichten-Text, Knopf „Server einrichten“, Repo-Pfad streichen

Gruppe wording · Cluster wording · Aufwand S · Befunde: wording-14, bereich_notebook_news-46, bereich_training-35
Quelle: audit/spec/wording.md Z. 548–549 · Dateien: web/js/screens/mentor.js
Abhängig von: —

```text
| 15.4 | mentor.js:17 | `'Der Mentor-Server ist nicht erreichbar. Prüf die Adresse unter Einstellungen → Mentor und deine Verbindung.'` → Text aus 15.1 | wording-14, bereich_notebook_news-46 |
| 15.5 | mentor.js:79 | `<p class="muted">Der Mentor läuft über deinen eigenen Server, damit der API-Schlüssel nie im Browser landet. Trag unter Einstellungen → Mentor die Server-Adresse und das Zugangstoken ein.</p>` → `<p class="muted">Der Mentor läuft über deinen Journalyst-Server, damit der API-Schlüssel nie im Browser liegt. Trage unter Einstellungen → Server die Adresse und das Zugangstoken ein.</p>`; Knopf `Zu den Einstellungen` → `Server einrichten`; `<div class="small faint" style="margin-top:14px">Anleitung zum Server: <code>server/README.md</code> im Projekt.</div>` ersatzlos streichen (h2 bleibt) | bereich_training-35, wording-14 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .mentor-setup] mentor.js Z. 79 schreibt allein wording-S15.4-15.5 neu, und zwar so: `<div class="mentor-wrap"><section class="card mentor-setup"><span class="ico">${I.chat}</span><h2>Mentor-Chat einrichten</h2><p class="muted">Der Mentor läuft über deinen Journalyst-Server, damit der API-Schlüssel nie im Browser liegt. Trage unter Einstellungen → Server die Adresse und das Zugangstoken ein.</p><a class="btn" href="#/settings/mentor">Server einrichten</a></section></div>`. Die Zeile „Anleitung zum Server: server/README.md im Projekt.“ fällt ersatzlos weg, weil Pfade laut wording W11 nur unter Einstellungen → Server stehen. Damit entfallen auch der Klassenwechsel `small faint → small muted` aus farbe-C21 an dieser Zeile und der einzige Inline-Abstand in mentor.js (`style="margin-top:14px"`), den abstaende-MENTOR ersetzen wollte. Der Knopf wird ein neutrales `.btn`, denn er navigiert nur, und Grün bleibt „Trade loggen“ vorbehalten. Das CSS der Karte aus abstaende-D8 (`padding: var(--sp-10) var(--sp-6)`, Symbol mittig) gilt unverändert. mentortest.js:22 (`.mentor-setup h2`, `.mentor-setup a[href="#/settings/mentor"]`) bleibt grün.
- ÄNDERN: Beim Umschreiben von mentor.js Z. 79 zusätzlich `class="btn primary"` → `class="btn"` setzen (übernommen aus farbe-C21). Text, Knopfbeschriftung „Server einrichten“ und das Streichen der Anleitungszeile wie spezifiziert.

## wording-S15.16-15.21 · Server-Texte in js/coach.js, voice.js, ruhepunkt.js: „Journalyst-Server“, „Prüfe“/„versuche“, Kommentare

Gruppe wording · Cluster wording · Aufwand S · Befunde: wording-14, bereich_notebook_news-46
Quelle: audit/spec/wording.md Z. 560–566 · Dateien: web/js/coach.js, web/js/voice.js, web/js/screens/ruhepunkt.js
Abhängig von: —

```text
| 15.16 | js/coach.js:41 | `'Der Server ist nicht erreichbar. Prüf die Adresse unter Einstellungen → Mentor und deine Verbindung.'` → Text aus 15.1 | wording-14, bereich_notebook_news-46 |
| 15.17 | voice.js:18 | `'Mentor-Server nicht eingerichtet'` → `'Journalyst-Server nicht eingerichtet'` | wording-14 |
| 15.18 | voice.js:72 | `Ohne Mentor-Server wird nur das Transkript gespeichert. Adresse unter Einstellungen → Mentor.` → `Ohne Journalyst-Server wird nur das Transkript gespeichert. Die Adresse trägst du unter Einstellungen → Server ein.` | wording-14 |
| 15.19 | voice.js:103 | `… richte den Mentor-Server ein.` → `… richte den Journalyst-Server ein.` | wording-14 |
| 15.20 | ruhepunkt.js:776 | `'Speichern hat nicht geklappt. Prüf deine Verbindung und versuch es noch einmal.'` → `'Speichern hat nicht geklappt. Prüfe deine Verbindung und versuche es noch einmal.'` | bereich_notebook_news-46 |
| 15.21 | Kommentare js/coach.js:1 und voice.js:2 | „Mentor-Server“ → „Journalyst-Server“ (nur Kommentar, damit die grep-Prüfung 4.1 auf 0 kommt) | wording-14 |

```

## wording-S17.1 · Einstellungs-Reiter „Server“ und „Verlauf“ (Schlüssel und Routen bleiben)

Gruppe wording · Cluster wording · Aufwand S · Befunde: wording-14, wording-60
Quelle: audit/spec/wording.md Z. 576–580 · Dateien: web/js/screens/misc.js
Abhängig von: —

```text
### Schritt 17 · `web/js/screens/misc.js`, `web/js/theme.js`, `web/js/store.js` (Einstellungen)

| # | Stelle | vorher → nachher | ids |
|---|---|---|---|
| 17.1 | misc.js:8 Reiter | `['mentor', 'Mentor', 'chat']` → `['mentor', 'Server', 'chat']`; `['logs', 'Logs', 'clock']` → `['logs', 'Verlauf', 'clock']` (Schlüssel und Routen bleiben) | wording-14, wording-60 |
```

## wording-S17.13-17.15 · Benachrichtigungen: „Recaps“, „Wochen-Recap“, „Monats-Recap“ mit neuen Auslöser-Sätzen

Gruppe wording · Cluster wording · Aufwand S · Befunde: wording-11, wording-12
Quelle: audit/spec/wording.md Z. 592–594 · Dateien: web/js/screens/misc.js
Abhängig von: —

```text
| 17.13 | misc.js:169 Recaps | `<h3 …>Performance-Recaps</h3><div class="small muted">Zusammenfassungen deiner Performance. Sie erscheinen als Hinweis oben auf dem Dashboard.</div>` → `<h3 …>Recaps</h3><div class="small muted">Zusammenfassungen deiner Trades. Sie erscheinen als Hinweis oben auf dem Dashboard.</div>` | wording-11 |
| 17.14 | misc.js:170 | `switchRow('Wöchentlicher Performance-Recap', 'Jeden Montag eine Zusammenfassung deiner Trading-Performance der Vorwoche. Wird ausgelöst, wenn bis Sonntag mindestens 4 geschlossene Trades geloggt wurden.', …)` → `switchRow('Wochen-Recap', 'Jeden Montag eine Zusammenfassung der Vorwoche, wenn du darin mindestens 4 Trades geschlossen hast.', …)` | wording-11, wording-12 |
| 17.15 | misc.js:171 | `switchRow('Monatlicher Performance-Recap', 'Am 2. jedes Monats eine Zusammenfassung des Vormonats. Wird ausgelöst, wenn bis zum 1. des Monats mindestens 4 geschlossene Trades geloggt wurden.', …)` → `switchRow('Monats-Recap', 'Am 2. jedes Monats eine Zusammenfassung des Vormonats, wenn du darin mindestens 4 Trades geschlossen hast.', …)` | wording-11, wording-12 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: switchRow] switchRow bekommt die Fassung aus barrierefreiheit-C-misc-15: id je Aufbau über swN, <label for> mit .set-row-l, aria-describedby, kein aria-label. Die Signatur (title, text, action, on, extra) bleibt, deshalb laufen alle Aufrufer unverändert weiter, und C-misc-15 kommt zuerst. GELD-BLIND: Der Schalter heißt „Beträge als R zeigen“, Text aus wording-S17.19. Blocktitel „Geld-blind-Modus“ und Toast bleiben. Grund: Wording hat die Texthoheit (K13). Der Name sagt, was passiert (R statt Geld, Kontostand weg). Außerdem heißt im Zertifikat schon ein anderer Schalter „Beträge ausblenden (nur % bzw. R)“ (certificate.js:74), und ein Name für zwei Funktionen verletzt W2. TRADING: Markup aus komponenten-S-misc-e (Einheit im Feld, Tilt-Schalter, kein Speichern-Knopf). Labels: „Tagesverlustlimit“ und „Ruin-Schwelle für Monte Carlo (Drawdown)“, bei beiden steht „%“ im Feld. „für Monte Carlo“ kommt aus wording-29, die Einheit wandert laut komponenten ins Feld. Tilt-Schaltertext: „Warnt auf dem Dashboard bei Verlustserien, Größenerhöhung nach Verlust, Revenge-Trades und erreichtem Tagesverlustlimit.“ Wrapper class="mt-3" statt style="margin-top:14px". Durchläufe-Optionen mit value und fmt.int (wording 17.20). Der Hinweis aus aufbau-C8b steht als letztes Kind des .field hinter dem .inp-cur-Wrapper: „Prozent der Kontogröße. Gilt für Tilt-Warnungen und die automatischen Regeln im Fortschritt.“ Er trägt die Bezugsgröße, die mit „(% vom Konto)“ aus dem Label fällt. BENACHRICHTIGUNGEN, Endmarkup aus abstaende-L4, wording-S17.13-17.15 und aufbau-C8d: <div class="set-block"><h3>Recaps</h3><div class="set-desc">Zusammenfassungen deiner Trades. Sie erscheinen als Hinweis oben auf dem Dashboard.</div><div class="stack s-4">${switchRow('Wochen-Recap', 'Jeden Montag eine Zusammenfassung der Vorwoche, wenn du darin mindestens 4 Trades geschlossen hast.', 'notif-toggle', n.weekly === true, 'data-key="weekly"')}${switchRow('Monats-Recap', 'Am 2. jedes Monats eine Zusammenfassung des Vormonats, wenn du darin mindestens 4 Trades geschlossen hast.', 'notif-toggle', n.monthly === true, 'data-key="monthly"')}</div></div><div class="set-block"><h3>Hinweis-Punkte in der Seitenleiste</h3><div class="set-desc">(Satz unverändert)</div><div class="stack s-4">${switchRow('Hinweis-Punkte anzeigen', 'Alle Punkte auf einmal ein- oder ausschalten.', 'navdot-toggle', nd.on, 'data-key="on"')}<div class="set-sub"${nd.on ? '' : ' aria-disabled="true"'}>${App.NAV_DOT_AREAS.map(([k, label, desc]) => switchRow(label, desc, 'navdot-toggle', nd[k] !== false, `data-key="${k}"${nd.on ? '' : ' disabled'}`)).join('')}</div></div></div>. PROFIL: Block „Bedienung“ mit Schalter „Tastenkürzel“ (kilook-C24) direkt vor „Daten und Sicherung“. WCAG 2.1.4 verlangt abschaltbare Ein-Zeichen-Kürzel. Die Fußzeile wird einzeilig mit dem Text aus wording-17.7 und der Klasse aus farbe-C22. Die zweite Kürzel-Zeile aus wording-17.7 entfällt, weil der Schalter sie trägt; Esc wirkt immer. Neue Schalter-Aktionen setzen nur aria-checked, ohne Neuaufbau (zustaende Z9). Der Notebook-Schalter aus komponenten-S-misc-g bleibt wie spezifiziert, weil Notebook-To-dos laut zustaende das Durchstreichen behalten.
