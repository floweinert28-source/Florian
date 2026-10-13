# Wortwahl und UX-Texte: Zielspezifikation

Gruppe „Wortwahl und UX-Texte“, 92 bestätigte Befunde aus `audit/spec-input/wording.json`. Stand des Codes: 13.10.2026 (letzte Änderung an `web/js` am 11.10., `aa9f1c6`; alle Zeilenangaben unten sind gegen diesen Stand geprüft).
Verbindlich sind `audit/BRIEF.md` und `web/README.md`. Diese Spezifikation fügt nichts Dekoratives hinzu, entfernt keine Funktion und ändert keine dokumentierte Nutzerentscheidung. Wo das nötig wäre, steht der Punkt in Abschnitt 6.

Abhängigkeiten zu anderen Gruppen (nicht doppelt umsetzen):
- `referenz-17` (Abstände) verlegt die Datumszeile der Tagesansicht in die Kopfreihe. Die Text- und Knopfänderungen aus Schritt 8 gelten dort, wo die Knöpfe nach `referenz-17` stehen.
- `bereich_prop-52` (Komponenten) bringt den App-Kalender auf `type="time"`-Felder. Das Anzeige-Overlay aus Schritt 4 ist dafür die Grundlage.
- `zustaende-3` (Zustände) baut die Feldprüfung mit `novalidate`. Das Overlay aus Schritt 4 lässt `required` und alle Ereignisse am nativen Feld unverändert.
- `zustaende-30` (Responsiv) setzt `tl-filters`/`tl-count` an die TradeLog-Filterzeile. Schritt 9 nutzt dieselben Klassen.
- `bereich_konto-29` (Aufbau) streicht die Kachel „Creator“ im Affiliate-Bereich. Die Kachel-Indizes in `affiliatetest.js` (Schritt 19) danach anpassen.
- Grüne Knöpfe außerhalb von „Trade loggen“ (Leerzustand Prop, Coach-Einrichten, Willkommen-Banner) regelt die Farbe-Spezifikation. Hier ändern sich nur ihre Texte. Ausnahme: „2FA aktivieren“ (wording-18) und der Fußknopf im Trade-Detail (bereich_trades_tag-22) werden hier neutral, weil der Befund es verlangt.

---

## 1. Zielzustand

### 1.1 Grundregeln

**W1 · Du-Form, aktiv, wahr.** Die App spricht den Nutzer mit „du“ an und spricht nie als „wir“. Keine Floskeln („Erlebnis“), keine rhetorischen Fragen in Titeln. Jeder Hilfetext beschreibt, was der Code wirklich tut.
- „So gehen wir mit deinen Daten um.“ → „Wer außer dir dein Journal sehen darf.“ (wording-17)
- „Passe dein Trading-Erlebnis an.“ → „Märkte, Break-even-Bereich, Geld-blind-Modus, Risiko und Warnungen.“ (wording-26)
- „Wird ausgelöst, wenn bis zum 1. des Monats mindestens 4 geschlossene Trades geloggt wurden.“ → „Am 2. jedes Monats eine Zusammenfassung des Vormonats, wenn du darin mindestens 4 Trades geschlossen hast.“ (wording-12)
- „Nach so vielen Verlusten hintereinander ist Pause.“ → „Nach so vielen Verlusten hintereinander ist für heute Schluss.“ (wording-41)
- „Nutzerkennung ist dein Benutzername aus dem Profil, aktuell: geraet-…“ → je nach Fall „Nutzerkennung: … (Benutzername aus dem Profil / E-Mail aus dem Profil / Gerätekennung)“ (bereich_einstellungen-46)

**W2 · Ein Begriff pro Sache, eine Bedeutung pro Begriff.** Es gilt das Glossar in 1.2. Neue Texte werden vor dem Einbau gegen das Glossar geprüft.

**W3 · Englisch nur als Fachwort oder Produktname.** Erlaubt: Trade, TradeLog, Dashboard, Notebook, News, Setup, Long/Short, Stop, Stop-Loss (nur als Regel- oder Feldname), Drawdown, Break-even, Edge, Monte Carlo, Score, Recap, Widget, Tag(s), Intraday, Coach, Mentor, Affiliate, Creator, P&L, R, MAE/MFE, CSV/JSON/PDF, Prop Firm(s), Prop Trading, Challenge, Funded und die Prop-Regelnamen in Firmensprache (Daily Loss, Profit Target, Consistency Rule, Max. Drawdown, Trailing, Payout, Split, Balance/Equity als Daily-Loss-Basis). Alles andere ist deutsch.
- „Reviewed / Unreviewed“ → „Nachbereitet: Alle · Ja · Nein“; „Multiday“ → „Mehrtägig“ (bereich_dashboard-31)
- „BALANCE“ → „Kontostand“ (wording-32); „Logs · Imports“ → „Verlauf · Importe“ (wording-60)
- „Daily Profit · Tag“ → „Tag · 11.10.2026“ (wording-45, bereich_dashboard-29); „Username anzeigen“ → „Benutzername anzeigen“
- „Equity: echt vs. Schatten-Ich“ → „Kumulierter Netto-P&L“ (wording-40); „Buttons“ → „Hauptknöpfe“ (wording-23)
- Das Zertifikat selbst bleibt englisch (README Z. 140). Englisch ist nur das Dokument, nicht seine Bedienung.

**W4 · Knöpfe tragen ein Verb.** Muster „Objekt + Verb im Infinitiv“. Nur Menü-Öffner dürfen ein Nomen sein („Filter“, „Zertifikat“, „Vorlage“).
- „+ Prop-Konto“ → „+ Prop-Konto anlegen“ (wording-34); „CSV“ → „CSV importieren“ (wording-49)
- „Standardfarben“ mit ×-Symbol → „Auf Standard zurücksetzen“ ohne Symbol (wording-24)
- „Aktuelles speichern“ → „Design speichern“ (wording-24)

**W5 · Verb-Familie (verbindlich).**

| Verb | Bedeutung | Beispiele nach der Umsetzung |
|---|---|---|
| loggen | nur einen Trade anlegen | „Trade loggen“ (Kopfknopf, Dialogtitel, Bestätigungsknopf, Tastenhinweis) |
| anlegen | neuer Datensatz | „Prop-Konto anlegen“, „Ordner anlegen“, „Vorlage anlegen“, „Tagesnotiz anlegen“, „Regeln anlegen“ |
| hinzufügen | etwas in eine bestehende Sammlung oder Ansicht stellen | „Widget hinzufügen“, „Tag hinzufügen“ (an Notiz) |
| importieren / exportieren | Datei hinein oder hinaus | „CSV importieren“, „Sicherung importieren“, „Sicherung exportieren“, „Als JSON exportieren“, „Aus JSON importieren“ |
| drucken | Druckdialog öffnen | „Als PDF drucken“ |
| einrichten | Verbindung zum Server herstellen | „Server einrichten“ (Mentor, Coach, News, Dashboard-Widget) |
| bearbeiten | Dialog mit mehreren Feldern | „Trade bearbeiten“, „Plan bearbeiten“, „Tags bearbeiten“ |
| ergänzen | Leerzustand: etwas zum ersten Mal eintragen | „Plan ergänzen“, „Profil ergänzen“ |
| machen / nachtragen | Check-in heute / Check-in für einen anderen Tag | „Check-in machen“, „Check-in nachtragen“ |
| erstellen | Datei oder Link erzeugen | „Tageszertifikat erstellen“, „Link zum Lesen erstellen“ |
| löschen / entfernen | Daten weg / aus Ansicht nehmen | „Alles löschen“ (Text: „Löscht alle Daten …“) |
| Zum/Zur + Bereich | Navigation aus einem Widget | „Zum TradeLog“ |

**W6 · Pro Bildschirm ein Bedienelement je Aktion und je Ziel.** Die Kopfreihe trägt die Hauptaktion, Karten wiederholen sie nicht.
- Tagesansicht: „Trade loggen“ und „Trade für diesen Tag“ → nur „Trade loggen“ (Kopfreihe, übernimmt das Datum des Tages). „Check-in“ im Kopf und „Check-in nachtragen“ in der Karte → nur der Kartenknopf (wording-5)
- Regel-Tracker: „Mehr anzeigen“ im Kopf und „Tages-Checkliste“ im Fuß führen beide nach `#/progress` → nur „Tages-Checkliste“ (wording-48)
- Trade-Detail: drei Knöpfe „Bearbeiten“ → „Plan bearbeiten“, „Tags bearbeiten“, „Trade bearbeiten“ (bereich_trades_tag-22)

**W7 · Imperativ in der Vollform.** In Hilfe-, Leer-, Fehler- und Einstellungstexten: „Trage“, „Lege“, „Prüfe“, „Versuche“. Die Kurzform („Trag“, „Leg“, „Prüf“) bleibt nur in den geführten Ruhepunkt-Texten (gesprochener Ton, z. B. ruhepunkt.js:452).
- „Prüf die Adresse unter Einstellungen → Mentor“ → „Prüfe deine Verbindung und die Adresse unter Einstellungen → Server.“ (bereich_notebook_news-46)
- „Leg fest, was für dich gilt.“ → „Lege fest, was für dich gilt.“ (Zeile wird für wording-38 ohnehin geändert)

**W8 · Schreibweise und Zeichen.**
- Satzschreibung mit großem Anfang in Titeln, Untertiteln, Reitern, Knöpfen, Feldnamen. „bestanden, geplatzt oder archiviert“ → „Bestanden, geplatzt oder archiviert“ (wording-37).
- Titel beginnen mit einem Wort, nie mit einem Zeichen: „% Regeln eingehalten“ → „Regeltreue“ (wording-43).
- Kartentitel enthalten keinen Doppelpunkt und kein „vs.“ (wording-40).
- Kein Gedankenstrich als Satzzeichen: „handelt wie du – nur ohne Regelbrüche.“ → „handelt wie du, hält sich aber an jede aktive Regel.“ (wording-38).
- Kein Ausrufezeichen: „Vorher exportieren!“ → „Exportiere vorher eine Sicherung.“ (wording-19).
- Ein fehlender Wert ist immer „—“ (Geviertstrich), nie „--“ (bereich_dashboard-17). „– R“ (Halbgeviertstrich) bleibt der Geld-blind-Platzhalter für Trades ohne Stop (README Z. 212, ui.js:111/113).
- Ellipse „…“ nur für laufende Vorgänge und Menüpunkte, die einen Dialog öffnen („Neue Vorlage …“). Suchfelder ohne Ellipse und ohne Doppelpunkt: „Trades durchsuchen“, „Widgets durchsuchen“, „Notizen durchsuchen“ (wording-51).
- Durchkopplung mit Bindestrich: „Netto-P&L“, „Support-Team-Zugriff“, „Mindest-Kontostand“.

**W9 · Zahlen und Einheiten.**
- Ergebnisse (P&L, Netto, Gewinn, Verlust) tragen immer ein Vorzeichen (+/−). Kontostände, Kontogrößen, Limits und Sätze nie (wording-7).
- Alle Beträge eines Prop-Kontos stehen in dessen Kontowährung, auf Karten, im Planer, in Tooltips und im Konto-Dialog (bereich_prop-5, bereich_prop-38, bereich_prop-46). Eine Summe über Konten mit verschiedenen Währungen wird je Währung gezeigt: „+11.262 $ · +1.054 €“.
- Kontogrößen erscheinen nie als Geldbetrag auf dem Grabstein, sondern höchstens als Kürzel „100K“ (bereich_prop-46).
- Zähler laufen über `U.count(n, Einzahl, Mehrzahl)`: „1 Trade“, „1 von 1 Trade“, „1 Gewinn“, „1 Notiz verschoben“ (zustaende-28, bereich_statistik-28).
- Ganze Zahlen ab 1.000 immer mit Tausendertrennzeichen über `fmt.int`: „1.000 Durchläufe“ (bereich_statistik-26, wording-29).
- Werte gleicher Art in einer Reihe haben dieselbe Stellenzahl: Kalender-Tageszellen und Wochensummen kompakt ohne Cent (bereich_dashboard-17), Affiliate-Kachelreihe ohne Cent (wording-53), Monte-Carlo-Kacheln ohne Cent (bereich_statistik-26).
- Datum und Uhrzeit erscheinen immer im Format der App-Sprache aus `fmt` (de: „11.10.2026“, „11.10.2026, 12:40“), auch in nativen Datumsfeldern, nie als ISO-Schlüssel „2026-09-04“ (wording-2, bereich_dashboard-28, bereich_prop-4).
- Uhrzeit-Gruppen gleich breit, Textform statt Zeichen: „vor 8“, „8–9“ … „19–20“, „ab 20“; Haltedauer „unter 5 min“ … „über 4 h“ (bereich_statistik-38).

**W10 · Verweise treffen den sichtbaren Namen genau.** „im Trade-Editor“ → „in „Plan & Bewertung““ bzw. „über „Trade bearbeiten““ (wording-61, bereich_trades_tag-47). „Einstellungen → Mentor“ → „Einstellungen → Server“ (wording-14).

**W11 · Keine Entwicklerbegriffe außerhalb von Einstellungen → Server.** Dateipfade, Umgebungsvariablen und Speichertechnik („server/README.md“, „COACH_SMTP_HOST“, „localStorage und IndexedDB“) stehen nur im Server-Bereich der Einstellungen (misc.js:156/157/160), sonst nirgends (bereich_training-35, bereich_konto-16, wording-20).

**W12 · Keine versteckten Funktionen im Text.** Blind-Replay wird nur erwähnt, wenn `App.on('replay')` wahr ist (wording-21). Die Taste 0 tut bei verstecktem Replay nichts (bereich_shell-32).

**W13 · Leerzustand und Links.** Titel „Noch keine …“, ein Satz mit dem nächsten Schritt, höchstens ein Knopf. Ein Link zu „mehr“ erscheint nur, wenn es etwas zu zeigen gibt (wording-48). Filterzeilen erscheinen nur, wenn es Trades zum Filtern gibt (bereich_trades_tag-35).

**W14 · Übersetzung.** Der deutsche Text ist der Wörterbuch-Schlüssel (`js/i18n.js`). Jede Textänderung zieht die Schlüssel in `js/lang/{en,es,hi,pt,zh}.js` mit (Regeln in 1.5).

### 1.2 Glossar (verbindlich)

| Sache | Stammform | nicht mehr verwenden | Ausnahmen / Hinweis | Befunde |
|---|---|---|---|---|
| Anteil der Gewinn-Trades | **Trefferquote**; steht die Tagesgröße daneben: **Trade-Trefferquote** | Win-Rate, Winrate, WR | englisches Zertifikat: „Win rate“ | wording-3, hierarchie-13, bereich_trades_tag-36, bereich_dashboard-32 |
| Anteil der Tage mit positivem Ergebnis | **Tages-Trefferquote** (ohne Ø) | Ø Tages-Win-Rate, Tages-Win-Rate, Anteil Gewinntage | „Ø Tages-Trefferquote (kumuliert)“ im Report bleibt, das ist ein echter Mittelwert (`avgDayWinRate`) | wording-3, bereich_statistik-10 |
| Ø Gewinn geteilt durch Ø Verlust | **Ø Gewinn/Verlust** (Trades), **Ø Tages-Gewinn/Verlust** (Tage) | Gewinn/Verlust pro Trade, Ø Trade-Gewinn/Verlust, Gewinn-Verlust-Verhältnis als Name | Radar-Achse heißt kurz „Gewinn/Verlust“ (Teil-Score); Erklärtexte: „Ø Gewinn geteilt durch Ø Verlust.“ | wording-9, bereich_statistik-10 |
| Netto-Ergebnis | **Netto-P&L** | Netto P&L, P&L allein als Spalte | „Netto“ als Präfix in Fließtext („Netto +893,04 €“) bleibt | wording-6, hierarchie-13, bereich_trades_tag-36 |
| aufsummierte Ergebniskurve | **Kumulierter Netto-P&L** | Kumulierter Tages-P&L, Equity | – | bereich_dashboard-32, wording-40 |
| Ergebnis je Trade | **Erwartungswert** (Diagrammtitel „Erwartungswert nach …“); Kachel **Erwartungswert pro Trade** | Trade-Erwartungswert, Ø pro Trade, Ø Netto-P&L pro Trade (als Statistik-Kachel) | Report-Kennzahl „Ø Netto-P&L pro Trade (kumuliert)“ bleibt (gespeicherte Vorlagen) | wording-8, bereich_statistik-16 |
| Statistik-Titel „Kennzahl + Merkmal“ (Setup, Symbol, Wochentag, Uhrzeit, Haltedauer, Marktphase, Volatilität, Emotion) | **„… nach …“** („Erwartungswert nach Setup“, „Netto-P&L nach Wochentag“) | „… je …“ in diesen Titeln | „Kosten je Fehler“ bleibt (Betrag pro Fehler-Tag, kein Befund) | bereich_statistik-16 |
| realisiertes R | Spalte **R**, Kachel **Ø R pro Trade** | RR, Ø realisiertes R-Multiple | – | bereich_trades_tag-36, bereich_statistik-10 |
| geplantes R | **Ø geplantes R pro Trade** | Ø geplantes R-Multiple | – | bereich_statistik-10 |
| Positionsgröße | **Kontrakte** | Stück, Stückzahl, Tagesvolumen (als Kachelname) | Kachel „Ø Kontrakte pro Tag“; Kennzahl „Volumen“ im Report bleibt | bereich_trades_tag-36, bereich_statistik-10 |
| Kurse | **Einstieg**, **Ausstieg** | Einstiegspreis, Ausstiegspreis | in Sätzen „Einstiegskurs“ erlaubt | bereich_trades_tag-36 |
| Zeitpunkte | **Eröffnet**, **Geschlossen** | Eröffnung, Schluss (als Feldname) | „ist für heute Schluss“ im Satz bleibt; CSV-Import siehe Abschnitt 2, K34 | bereich_trades_tag-36 |
| Checklisten-Regeln (Einstellungen → Regeln) | **Regeln**; Zähler **„3 von 5 abgehakt“**; Anteil **Regeltreue** | „eingehalten“ als Zähler, „% Regeln eingehalten“, „definiert“ | Leerzustand „Noch keine Regeln angelegt“ | wording-44, wording-43, bereich_trades_tag-37 |
| Schatten-Ich-Regeln | **Regelwerk**, Abweichung = **Verstoß / Verstöße** | Mein Regelwerk, Regelbruch/Regelbrüche (im Schatten-Ich) | „Regelbruch“ bleibt für die frei formulierten „Gebrochenen Regeln“ eines Trades (ruhepunkt.js:451–452, mentor.js:35) | wording-38, wording-39, wording-25 |
| Schatten-Regel „Verluste in Folge“ | **Schluss nach Verlustserie** | Stopp nach Verlusten in Folge | – | wording-41 |
| Verlustgrenze | Einstellung Trading: **Tagesverlustlimit**; Schatten-Regel: **Max. Tagesverlust**; Prop-Regel: **Daily Loss** | Tageslimit (für diese drei) | **Tageslimit** nur für das Nachrichtenkontingent des Mentors | wording-10 |
| Server für Mentor, Coach, News, Sprachnotizen | **Journalyst-Server**; Einstellungs-Reiter **Server** | Mentor-Server, eigener Server, Coach-Server, „derselbe wie für den Mentor“ | Route und Schlüssel bleiben `mentor` (`#/settings/mentor`, `S.settings.mentor`) | wording-14, bereich_training-35, bereich_notebook_news-45/-46, bereich_konto-16 |
| KI-Chat | **Mentor** | – | Einrichten-Titel „Mentor-Chat einrichten“ bleibt (mentortest.js:22) | aufbau-29 |
| Bereich der Gruppen | **Coach** | Coach Mode (in der Oberfläche) | „Coach Mode“ darf in README und Code-Kommentaren bleiben | bereich_konto-42 |
| menschliche Rolle im Coach-Bereich | bleibt **Mentor**, bis der Nutzer entscheidet (Abschnitt 6, F1) | – | – | aufbau-29 |
| Journal-Konto | **Konto** | Konto für den Benutzerzugang | Benutzerzugang heißt **Anmeldung** bzw. **Journal** | wording-17, wording-18 |
| Prop-Konto | **Prop-Konto** (immer mit Präfix in Knöpfen und Leerzuständen) | Konto anlegen (im Prop-Bereich) | Feld „Konto“ im Dialog bleibt (Kontext eindeutig) | wording-34, wording-35 |
| Navigationsgruppe Prop Firms + Coupon-Codes | **Prop Trading** | Konten | Einstellungen → Konten und Prop-Reiter „Konten“ bleiben | bereich_shell-33 |
| Kontostand eines Prop-Kontos | **Kontostand**, **Startkapital**, **Mindest-Kontostand** | Balance, Startbalance, Mindestbalance | Daily-Loss-Basis „Balance / Equity“ bleibt (Regelbegriff) | wording-32 |
| Puffer eines Prop-Kontos | **„reicht für 43 Stops“**, Tooltip **„je Stop“** | noch 43 Stop-Losses, je Stop-Loss | – | wording-33 |
| Prop-Regel Konsistenz | **Consistency Rule** | Consistency (allein) | – | wording-31 |
| Affiliate | **Provision** = Betrag, **Satz** bzw. **Provisionssatz** = Prozent, **Verdient** nur in der Creator-Ansicht, **Quelle** = Link/Code | Provision für den Prozentwert, Über | – | bereich_konto-30 |
| Notebook | **Papierkorb**, **Tagesnotiz anlegen**, **Ordner anlegen**, **Vorlage anlegen**, Block **Text**, **Aufklappbarer Abschnitt** | Kürzlich gelöscht, Tag loggen, Ordner hinzufügen, Vorlage hinzufügen, Absatz, Aufklappbare Liste | Menüpunkt „Neue Vorlage …“ bleibt | bereich_notebook_news-27/-28/-29 |
| Recaps | Oberbegriff **Recaps**, **Wochen-Recap**, **Monats-Recap** | Performance-Recap(s), Wöchentlicher/Monatlicher Performance-Recap | – | wording-11 |
| Sicherung | **Sicherung exportieren / importieren** | einspielen, Einspielen, eingespielt | – | wording-22 |
| Einstellungs-Reiter Protokoll | **Verlauf** mit Unterreitern **Importe** · **Änderungen** | Logs, Imports | Route `#/settings/logs` bleibt | wording-60 |
| Filter Dashboard | **Intraday / Mehrtägig**, **Nachbereitet**, Platzhalter **Von / Bis** | Multiday, Reviewed, Unreviewed, Min / Max (als Platzhalter) | Einheiten „Min. / Std. / Tage“ bleiben | bereich_dashboard-31 |
| Filter TradeLog | **Alle Fehler**, **Mit Fehler** | Fehler: alle, Nur mit Fehler | – | bereich_trades_tag-35 |
| Zertifikat-Menü | **Tag · Woche · Monat · Zeitraum** mit konkretem Zeitraum rechts | Daily/Weekly/Monthly Profit, Performance, Stats | Dokumenttitel bleiben englisch (`certdata.js`) | wording-45, bereich_dashboard-29 |
| Einstellungen Trading | Blocktitel **Märkte**; Schalter **Beträge als R zeigen** unter dem Blocktitel „Geld-blind-Modus“ | Was handelst du?, doppelter Titel „Geld-blind-Modus“ | Toast „Geld-blind-Modus an/aus“ bleibt | wording-27, wording-28, bereich_einstellungen-34 |
| Design-Bereich | **überall** bzw. **Hauptknöpfe** | Website (für die App), Buttons | „Website der Firma“ u. Ä. bleiben (fremde Seiten) | wording-23 |
| Seitenleiste ohne E-Mail | **Profil ergänzen** | Profil vervollständigen | – | bereich_shell-34 |

### 1.3 Formate im Detail

| Stelle | Format | Beispiel |
|---|---|---|
| Kalender-Tageszelle `.p` und Wochensumme `.p` (widgets.js:115/116) | `fmt.cur(v, { signed: true, compact: true })` | „−486 €“, „+2.069 €“ |
| Kalender-Kurzform `.pm` | unverändert ohne Leerzeichen (README Z. 190–192) | „−486€“, „+2,1k€“ |
| leerer Monat im Jahreskalender | `—` | „—“ |
| Dashboard-Kachel Netto-P&L, TradeLog-Kachel Netto-P&L | `U.pnl(v)` mit Vorzeichen | „+893,04 €“ |
| Prop-Karte P&L | `U.pnl(ev.pnl, '', { currency: a.currency })` | „+11.262 $“ |
| Affiliate-Kacheln | `fmt.cur(v, { money: true, compact: true, currency: AD.CURRENCY })` | „12.652 €“, „3.141 €“ |
| Monte-Carlo-Kacheln, Ruin-Schwelle | `fmt.cur(v, { compact: true })`, Läufe `fmt.int(n)` | „17.500 €“, „1.000 Durchläufe“ |
| Breach-Banner | Betrag in Kontowährung, Handelstag nur wenn abweichend, als `fmt.dateFull` | „Tagesverlust 6.255,78 $ überschreitet das Limit von 5.000,00 $ · 04.09.2026, 11:22“ |
| natives Datumsfeld (Maus) | Overlay mit `fmt.dateFull` / `fmt.dateTime` / Monatsname | „11.10.2026, 12:40“, leer: „Offen“ in `--faint` |
| Uhrzeit-Tabelle Statistik | Gruppenschlüssel + „ Uhr“ | „9–10 Uhr“, „ab 20 Uhr“ |
| Zähler | `U.count(n, one, many)` | „1 Trade“, „1.234 Trades“ |

### 1.4 Texte, die wörtlich gelten (Auswahl der neuen Kerntexte)

| Ort | Text |
|---|---|
| Einstellungen → Server, Untertitel | „Mentor, Coach, News und die Auswertung von Sprachnotizen laufen über deinen Journalyst-Server. Der API-Schlüssel bleibt dort und nie im Browser.“ |
| Mentor, nicht eingerichtet | „Der Mentor läuft über deinen Journalyst-Server, damit der API-Schlüssel nie im Browser liegt. Trage unter Einstellungen → Server die Adresse und das Zugangstoken ein.“ + Knopf „Server einrichten“ |
| Coach, nicht eingerichtet | Titel „Coach einrichten“; „Teile deine Notizen mit deinem Mentor oder betreue selbst eine Gruppe. Dafür trägst du einmal die Adresse und das Zugangstoken deines Journalyst-Servers unter Einstellungen → Server ein.“ + Knopf „Server einrichten“ |
| News-Banner | „**Beispielansicht.** Echte Termine kommen über deinen Journalyst-Server.“ + Knopf „Server einrichten“ |
| Server nicht erreichbar (Mentor, Coach, News) | „Der Journalyst-Server ist nicht erreichbar. Prüfe deine Verbindung und die Adresse unter Einstellungen → Server.“ |
| Token falsch (News) | „Zugangstoken fehlt oder ist falsch. Prüfe es unter Einstellungen → Server.“ |
| Coach-Mailhinweis | „Dein Journalyst-Server verschickt noch keine E-Mails. Die Adresse wird gespeichert, Mails kommen, sobald der Versand eingerichtet ist.“ |
| Profil-Fuß | „Deine Daten liegen nur in diesem Browser.“ / Zeile 2: „Tastenkürzel: **N** Trade loggen · **1–9** Bereich wechseln · **Esc** Dialog schließen“ |
| Alles löschen | „Löscht alle Daten in diesem Browser. Exportiere vorher eine Sicherung.“ |
| Schatten-Ich, Intro | „Dein Schatten-Ich handelt wie du, hält sich aber an jede aktive Regel.“ |
| Schatten-Ich-Kachel, Fuß | „Ohne Verstöße“ |

### 1.5 Übersetzung: Pflicht bei jeder Textänderung

1. Hatte der alte deutsche Text einen Eintrag in `js/lang/<code>.js`, wird der **Schlüssel umbenannt** (gleiche Zeile, neuer deutscher Schlüssel, Übersetzung an den neuen Sinn angepasst). Steht der alte Schlüssel danach nirgends mehr im Code (`grep -rnF "<alter Text>" web/js --include=*.js | grep -v js/lang`), wird er gelöscht.
2. Neue Texte in Etappe-1-Bereichen (README Z. 182–183: Navigation, Dashboard, TradeLog, Trade-Detail, Trade-Dialog, Kopfreihen, alle Einstellungen) bekommen in allen fünf Wörterbüchern einen neuen Eintrag. Neue Texte in noch nicht übersetzten Bereichen (z. B. Statistik-Diagrammtitel) bekommen keinen, außer der alte Text hatte einen (Regel 1).
3. Texte mit Zahlen oder Namen sind Muster mit `{0}`, `{1}` (z. B. `"{0} Trade": "{0} trade"`, `"reicht für {0} Stops": "enough for {0} stops"`). Für jede Einzahlform aus `U.count` ein eigenes Muster.
4. Englische Werte der wichtigsten neuen Schlüssel (es, hi, pt, zh analog zu den vorhandenen Übersetzungen desselben Begriffs, z. B. „Trefferquote“ → es „Tasa de acierto“ wie in es.js):

| de | en |
|---|---|
| Trefferquote / Trade-Trefferquote / Tages-Trefferquote | Win rate / Trade win rate / Daily win rate (vorhanden) |
| Ø Trefferquote | Avg win rate |
| Trefferquote mit / ohne Fehler | Win rate with / without mistakes |
| Ø Kontrakte pro Tag · Gehandelte Kontrakte pro Handelstag. | Avg contracts per day · Contracts traded per trading day. |
| Ø R pro Trade · Ø geplantes R pro Trade | Avg R per trade · Avg planned R per trade |
| Trades · Abgeschlossene Trades im Zeitraum. | Trades · Closed trades in the period. |
| Ø Gewinn geteilt durch Ø Verlust. | Avg win divided by avg loss. |
| Check-in machen · Tageszertifikat erstellen | Do check-in · Create daily certificate |
| Noch keine Regeln angelegt · {0} von {1} abgehakt | No rules yet · {0} of {1} checked |
| Intraday / Mehrtägig · Mehrtägig · Nachbereitet · Ja · Nein | Intraday / Multi-day · Multi-day · Reviewed · Yes · No |
| Alle Fehler · Mit Fehler · Trades durchsuchen · Widgets durchsuchen | All mistakes · With mistakes · Search trades · Search widgets |
| Plan bearbeiten · Tags bearbeiten · Kein MAE/MFE erfasst · Kontrakte × Punktwert | Edit plan · Edit tags · No MAE/MFE recorded · Contracts × point value |
| Zum TradeLog · Neuer Recap · Profil ergänzen · Prop Trading | Go to TradeLog · New recap · Complete profile · Prop trading |
| Server · Server einrichten (vorhanden) · Verlauf · Importe · Änderungen | Server · Set up server · History · Imports · Changes |
| Recaps · Wochen-Recap · Monats-Recap · Märkte · Beträge als R zeigen | Recaps · Weekly recap · Monthly recap · Markets · Show amounts as R |
| Sicherung importieren · Prop-Konto anlegen · Mindest-Kontostand · % des Startkapitals | Import backup · Create prop account · Minimum balance · % of starting capital |
| reicht für {0} Stops · reicht für 1 Stop · {0} Puffer / {1} je Stop | enough for {0} stops · enough for 1 stop · {0} buffer / {1} per stop |
| Consistency Rule verletzt · {0} Gewinn fehlen · Bestanden, geplatzt oder archiviert | Consistency rule violated · {0} profit missing · Passed, blown or archived |
| Beantragt am · Erhalten am · Als erhalten markieren | Requested on · Received on · Mark as received |
| Satz · Provisionssatz · Satz ändern · Satz von {0} ändern · Satz in % · Provisionssatz gespeichert | Rate · Commission rate · Change rate · Change rate of {0} · Rate in % · Commission rate saved |
| Papierkorb · Notiz verschoben · Ordner anlegen · Vorlage anlegen · Aufklappbarer Abschnitt | Trash · Note moved · Create folder · Create template · Collapsible section |
| Aus JSON importieren · Als JSON exportieren · Als PDF drucken · Link zum Lesen erstellen | Import from JSON · Export as JSON · Print as PDF · Create read-only link |
| Coach einrichten · Dein Name in Gruppen: · {0} von {1} offen · Daten ab {0} | Set up Coach · Your name in groups: · {0} of {1} open · Data from {0} |
| Zeitraum · Benutzername anzeigen | Period · Show username |
| Regelwerk · Ohne Verstöße · Schluss nach Verlustserie | Rule set · Without violations · Stop after losing streak |

5. Neue Etappe-1-Schlüssel zusätzlich in `e2e/i18n/<lang>/part-audit-wording.json` (neu, gleiche Form wie `part-1.json`) eintragen, damit `langtest.js` sie als deutsche Reste erkennt.

---

## 2. Konflikte und Entscheidungen

**K1 · Trefferquote statt Win-Rate** (wording-3, hierarchie-13, bereich_trades_tag-36, bereich_statistik-10, bereich_dashboard-32). hierarchie-13 will überall „Win-Rate“, wording-3 überall „Trefferquote“, bereich_trades_tag-36 „Trefferquote“ außer an der Radar-Achse. Entscheidung: **Trefferquote überall, auch an der Radar-Achse.** Gründe: Sie ist die Mehrheitsform (27 gegen 4 Fundstellen, inventar-wording 1.1), steht auf dem meistgesehenen Bildschirm (Dashboard-Kacheln), ist deutsch, und alle drei Schlüssel sind übersetzt (en.js:587/761/763). „Trefferquote“ (12 Zeichen) ist kürzer als die bestehende Achse „Gewinn/Verlust“ (14). Ein einziger Name schlägt die Ausnahme. Dafür wird `e2e/scorestatetest.js:10` von `/Win-Rate/` auf `/Trefferquote/` umgestellt.

**K2 · „Ø Gewinn/Verlust“ statt „Gewinn-Verlust-Verhältnis“** (wording-9 `vorschlag` gegen `vorschlag_fakten`, bereich_statistik-10, hierarchie-13). Die Prüfer widersprechen sich. Entscheidung: **„Ø Gewinn/Verlust“ (Trades) und „Ø Tages-Gewinn/Verlust“ (Tage) überall, ohne `short`.** Gründe: README Z. 99–100 legt den einzeiligen Kacheltitel „Ø Gewinn/Verlust“ fest, `mobiletest.js:73` prüft ihn, und der Schlüssel existiert (en.js:1382). „Gewinn-Verlust-Verhältnis“ (25 Zeichen) und „Tages-Gewinn-Verlust-Verhältnis“ (31) brechen in 170-px-Kacheln um. Das „Ø“ ist sachlich richtig, denn der Wert ist Ø Gewinn geteilt durch Ø Verlust. Der Einwand „liest sich wie ein Betrag“ ist durch den Wert ohne Währungszeichen und den Info-Text „Ø Gewinn geteilt durch Ø Verlust.“ ausgeräumt. Die Radar-Achse bleibt kurz „Gewinn/Verlust“, weil sie einen Teil-Score benennt.

**K3 · Tages-Trefferquote** (wording-3, bereich_statistik-10, hierarchie-13). Vorschläge: „Tages-Trefferquote“, „Tages-Win-Rate“, „Anteil Gewinntage“. Entscheidung: **„Tages-Trefferquote“**, weil das Dashboard dieselbe Größe schon so nennt (widgets.js:173) und K1 gilt.

**K4 · Datumsfelder: Anzeige-Overlay statt Feldknopf** (wording-2 `vorschlag`, zustaende-20 als Ergänzung, bereich_dashboard-28, komponenten-15). Der Feldknopf (natives Feld wird `type="hidden"`) verliert das Tippen, `required` und die Browser-Ereignisse. README Z. 307 und datepicker.js:4 legen fest: „Das native Feld bleibt zum Tippen“. Entscheidung: **Overlay aus zustaende-20.** Das native Feld bleibt, darüber liegt nur die formatierte Anzeige. Tippen schaltet das Overlay ab. Programmatisches Setzen (`tradeformtest.js:31`, `fillAccountForm`) aktualisiert die Anzeige über einen Setter. Touch behält das System-Feld.

**K5 · Leeres „Geschlossen“** (wording-62). „Offen“ (`vorschlag`) gegen „Noch offen“ (`vorschlag_fakten`). Entscheidung: **„Offen“**, der übersetzte Schlüssel (en.js:738) und dasselbe Wort wie die Pille im TradeLog. Auf Touch fehlt das Overlay, dort bleibt ein Hinweis im Label, aber als Satzteil statt Gleichung: „(leer lassen, solange offen)“.

**K6 · Zertifikat-Menü** (wording-45 gegen bereich_dashboard-29). wording-45 will „Tageszertifikat · Tag“, bereich_dashboard-29 „Tag · 11.10.2026“. Entscheidung: **links Tag / Woche / Monat / Zeitraum, rechts der konkrete Zeitraum** aus `D.period(k, ref).short`. Das Menü hängt am Knopf „Zertifikat“, „Tageszertifikat“ wäre doppelt, und die rechte Spalte sagt endlich etwas Neues. `KINDS.title` bleibt englisch (Kartentitel, Dateiname, certtest.js:45). Der Tooltip am Knopf der Tagesansicht heißt „Tageszertifikat erstellen“.

**K7 · Check-in und Zertifikat in der Tagesansicht** (wording-5 gegen bereich_trades_tag-37). Der Kopf-Knopf „Check-in“ entfällt (W6). Der Kartenknopf heißt **„Check-in machen“** (heute) bzw. **„Check-in nachtragen“** (andere Tage), denn ein Knopf braucht ein Verb. Den Zertifikat-Knopf nur mit Trades zu zeigen (`vorschlag_fakten` von bereich_trades_tag-37) wird nicht übernommen: `certtest.js:54` erwartet ihn an trade-freien Tagen, und der Zertifikat-Dialog fängt leere Tage ab.

**K8 · Ein Name für den Server, ein Knopf zum Einrichten** (wording-14, bereich_training-35, bereich_konto-16 „Coach-Server“, bereich_konto-42 „Server eintragen“, mentor.js „Zu den Einstellungen“). Entscheidung: **„Journalyst-Server“** und überall der Knopf **„Server einrichten“** (existiert in News und ist übersetzt, en.js:1487). „Coach-Server“ aus bereich_konto-16 würde einen vierten Namen einführen.

**K9 · Zeitpunkt für „→ Server“ und „Prüfe“** (bereich_notebook_news-46). Der Prüfer wollte „→ Mentor“ behalten, bis die Umbenennung beschlossen ist. Mit wording-14 ist sie beschlossen. Deshalb werden alle Fehlertexte jetzt auf „Einstellungen → Server“ und alle vier „Prüf“-Stellen gemeinsam auf „Prüfe“ umgestellt (coach.js:41, mentor.js:17, news.js:28, ruhepunkt.js:776).

**K10 · Verstöße statt Regelbrüche im Schatten-Ich** (wording-38 gegen wording-39). wording-39 schlug „Ohne Regelbrüche“ bzw. „Bei voller Regeltreue“ vor. Beides widerspricht wording-38, und „Regeltreue“ meint in der App die Checklisten-Regeln (Fortschritt, Score-Achse). Entscheidung: **„Ohne Verstöße“**, passend zur Kachel „Verstöße“ daneben. Kurz genug für eine Zeile bei 390 px.

**K11 · „Regelwerk“ ohne Possessiv, „Meine Designs“ bleibt** (wording-25). `vorschlag` „Regelwerk“ gegen `vorschlag_fakten` „Dein Regelwerk“ und „Gespeicherte Designs“. Entscheidung: **„Regelwerk“**. Ohne Possessiv gibt es keinen Perspektivwechsel, und es passt zum Widget-Knopf „Regelwerk festlegen“. „Meine Designs“ ist der Name aus dem Nutzerauftrag (README Z. 200, Aufgabe #69) und bleibt (Abschnitt 5).

**K12 · Privatsphäre-Schalter** (wording-17 „auf dein Journal“ gegen wording-25 „Ich-Form bei Einwilligung“). Entscheidung: **„Support-Team-Zugriff erlauben“** ohne Possessiv, wie die anderen Schaltertitel (Nomen). Text: „Ist das an, darf das Support-Team dein Journal einsehen, um dir zu helfen und Fehler zu finden.“ Das Entfernen des Schalters steht in Abschnitt 6 (F2).

**K13 · Geld-blind-Schalter** (wording-28 gegen bereich_einstellungen-34). Entscheidung: Schaltertitel **„Beträge als R zeigen“**, Text aus wording-28 („Zeigt R-Multiples statt Geldbeträgen (z. B. „+2,1 R“) und blendet den Kontostand aus. Trades ohne Stop zeigen „– R“.“). Der Hinweis auf „– R“ bleibt (README Z. 212). Die Strich-Behauptung aus wording-28 ist widerlegt (beide Stellen U+2013), ui.js bleibt unverändert.

**K14 · „Website“ oder „App“** (wording-23 gegen bereich_einstellungen-44, README Z. 202). Die Einstellung gilt auch für die Startseite. Entscheidung: **„Gilt sofort überall, auch auf der Startseite.“** Der Satz ist wahr und braucht weder „Website“ noch „App“.

**K15 · Recaps** (wording-11, wording-12). Beide Befunde ändern dieselben Zeilen misc.js:169–171. Zusammengeführt: Namen aus wording-11, Auslöser-Texte aus wording-12.

**K16 · Notebook-Dialogtitel** (bereich_notebook_news-28 `vorschlag` „Vorlage anlegen“ gegen `vorschlag_fakten` „Neue Vorlage“). Entscheidung: **„Vorlage anlegen“**, passend zu „Vorlage bearbeiten“ im selben Ausdruck und zu „Ordner anlegen“ (bereich_notebook_news-29).

**K17 · Filter „Nachbereitet“** (bereich_dashboard-31). `vorschlag` „Nachbereitet: Alle / Ja / Nein“ gegen `vorschlag_fakten` „Nachbereitung: Alle / Nachbereitet / Nicht nachbereitet“. Entscheidung: **„Nachbereitet“ mit „Alle · Ja · Nein“**. Das Segment passt in das 320 px breite Filterfenster, „Nicht nachbereitet“ nicht. Platzhalter **„Von“ / „Bis“** groß, weil „von“/„bis“ im englischen Wörterbuch „by“/„due“ bedeuten.

**K18 · Kopf-Link im Regel-Tracker** (wording-48). `vorschlag` streichen, `vorschlag_fakten` „Öffnen“. Entscheidung: **streichen**. Der Knopf „Tages-Checkliste“ im Fuß führt schon nach `#/progress` (W6). „Öffnen“ bleibt den Bereichs-Widgets ohne eigenen Knopf vorbehalten.

**K19 · Tilt-Text** (bereich_training-14). Der `vorschlag` empfiehlt im Mittelfall ein Tageslimit, obwohl Weiterhandeln dort Geld gebracht hat. `vorschlag_fakten` wiederholt die drei Zahlen, die direkt darüber stehen. Entscheidung: ein Satz ohne Zahlen und ohne falschen Rat: „Nach der Serie hast du Geld zurückgeholt, die meisten dieser Tage endeten trotzdem im Minus.“

**K20 · Coach-Gruppe** (bereich_konto-43). Teil 5 (PF-Fuß) bleibt unverändert, wie der Befund selbst vorschlägt: README Z. 169 nennt „Ø Gewinn/Verlust in R“ als Teil der Gruppen-Statistik. „Notizen von euch“ wird „Mentor-Notizen“ (wie coach.js:48). Entscheidet der Nutzer F1 mit Ja, wird daraus „Coach-Notizen“.

**K21 · Beispieldaten-Text** (wording-21). `vorschlag_fakten` streicht den Satz zu den Vorschlagsregeln, aber `sampletest.js:118` erwartet „Vorschlagsregeln“ und der Satz nennt eine echte Nebenwirkung. Entscheidung: **`vorschlag`** (Replay nur mit `App.on('replay')`, Vorschlagsregeln in einem kurzen Satz).

**K22 · Schrift-Beschreibungen** (bereich_einstellungen-45). Keine „Standard“-Pille (zusätzliches Element, BRIEF: nichts Dekoratives; das Erscheinungsbild markiert Graphit auch nicht). Trennzeichen „ · “ wie bei allen Metadaten. „Klassisch“ nutzt die Systemschrift (SF Pro, Inter, Segoe UI …), deshalb „Systemschrift · Zahlen in Roboto“ statt „SF Pro bzw. Inter“.

**K23 · Bestehen-Zeile der Prop-Karte** (wording-31 `vorschlag` gegen `vorschlag_fakten`). „in N Handelstagen“ bleibt (`proptest.js:103` und der Prüfer). Bleibt die Zeile leer, weil nur der Gewinn fehlt und der Ziel-Balken ihn schon zeigt, entfällt die Zeile ganz statt „nur Profit Target offen“ (keine zweite Formulierung desselben Zustands).

**K24 · Grabstein** (bereich_prop-46). Die Größe entfällt nur, wenn ein Kontoname da ist. Ohne Namen steht „100K“ wie bei `sizeName` (prop.js:45), nie als Geldbetrag.

**K25 · Schatten-Ich-Diagramm** (wording-40). Vorschlag „Kumulierter Netto-P&L: echt und Schatten-Ich“ enthält einen Doppelpunkt (W8) und bricht bei 390 px um. Entscheidung: **„Kumulierter Netto-P&L“**. Die Legende „Echt / Schatten-Ich“ direkt darunter trägt den Vergleich.

**K26 · MAE/MFE-Leerzustand** (wording-61 und bereich_trades_tag-47 ändern dieselbe Zeile trades.js:75). Zusammengeführt: Titel „Kein MAE/MFE erfasst“, Text mit Stop (ohne Stop entsteht kein R) und dem exakten Dialognamen, Knopf „Plan ergänzen“.

**K27 · Tastaturkürzel** (bereich_shell-32). Der Prüfer schrieb, `App.on` gebe es nicht. Nachgeprüft: `App.on` ist exportiert (app.js:44, `FEATURES, on,`). Also `App.on('replay')` direkt in app.html, keine neue Methode `feature()`.

**K28 · Markup der TradeLog-Filterzeile** (bereich_trades_tag-35 `vorschlag` `.tl-sel` gegen `vorschlag_fakten` `.row.tl-selects`, dazu zustaende-30 mit `tl-filters`/`tl-count`). Entscheidung: `tl-filters` (Zeile), `tl-search` (Suche), `tl-sel` (Hülle der Auswahlfelder, am Desktop `display: contents`), `tl-count` (Zähler). So greifen die Regeln aus zustaende-30 weiter, und am Handy scrollt nur die Auswahlreihe seitlich.

**K29 · Tagesansicht und referenz-17.** Verlegt referenz-17 Datum und Zertifikat-Knopf in die Kopfreihe, gelten die Änderungen aus Schritt 8 am neuen Ort: kein „Check-in“, kein „Trade für diesen Tag“, Tooltip „Tageszertifikat erstellen“.

**K30 · Befunde mit „berührt Vorgaben“, die trotzdem umgesetzt werden.** wording-5 erfüllt die Vorgabe „Grün nur für Gewinn und Trade loggen“ und entfernt keine Funktion (Datum wird über „Trade loggen“ vorbelegt, Check-in bleibt über die Karte). wording-8 ersetzt eine doppelte Kachel durch die fehlende Grundzahl „Trades“. Es bleiben 16 Kennzahlen (README Z. 109, core.test.mjs:100, sixtest.js:39). wording-17 und wording-18 werden nur im Wortlaut und in der Knopfklasse geändert, das Entfernen steht in Abschnitt 6.

**K31 · „Plan ergänzen“ und „Plan bearbeiten“.** Beide bleiben mit getrennter Bedeutung (W5): „ergänzen“ im Leerzustand, „bearbeiten“, wenn schon ein Plan da ist.

**K32 · Zähler mit eigener Logik** (zustaende-28). Stellen, die die Einzahl schon richtig bilden (widgets.js:115/132/166, app.js:391, progress.js:28, shadow.js:59), werden trotzdem auf `U.count` umgestellt, damit es eine Regel gibt.

**K33 · Monte Carlo** (bereich_statistik-26). Der Vorschlag mischt „Läufe“ und „Durchläufe“. Überall **„Durchläufe“**.

**K34 · CSV-Import bleibt außen vor.** Vorschau (app.js:567) und Feldnamen (core.js:440–450, „Eröffnung (Datum/Zeit)“, „Stückzahl“) gehören laut Prüfer von bereich_trades_tag-36 zusammen und sind nicht Teil der Befunde. Sie werden hier nicht geändert. Die grep-Prüfungen in Abschnitt 4 sind darauf zugeschnitten.

**K35 · Report-Kennzahlen.** Die Namen im Report-Widget (widgets.js:197–198) folgen den umbenannten Statistik-Kacheln (Ø Gewinn/Verlust, Ø R pro Trade, Ø geplantes R pro Trade, Ø Kontrakte pro Tag). Die Schlüssel (`avg_trade`, `payoff` …) bleiben, gespeicherte Vorlagen funktionieren weiter. „Ø Netto-P&L pro Trade (kumuliert)“ bleibt, weil sie kein Befund ist und als Report-Reihe gespeichert sein kann.

**K36 · Profil ergänzen statt zweite Zeile streichen** (bereich_shell-34 gegen ki_look-45). Der kürzere Text behält den getesteten Hinweis (`usercardtest.js:11`) mit dem kleinsten Eingriff.

**K37 · Affiliate-Begriffe** (bereich_konto-30 gegen wording-52). bereich_konto-30 trennt sauber: Provision = Betrag, Satz = Prozent, „Verdient“ nur aus Sicht des Creators. wording-52 ließe „Provision“ in Kundenliste und Dialog zweideutig.

---

## 3. Umsetzungsschritte

Reihenfolge: erst die gemeinsamen Helfer und die zentrale Namensquelle (Schritte 1–2), dann Komponenten mit CSS (3–4), dann die Einzelstellen je Datei (5–17), danach Wörterbücher, Tests, README (18–20). Zeilenangaben: Stand 13.10.2026. Bei jedem geänderten Text gilt 1.5. In Tabellenzellen steht `\|` für das Zeichen `|` (Markdown-Escaping), `\|\|` also für `||`. Wo „Z.“ steht, ist die Zeile im Code gemeint; nach früheren Schritten können sich Zeilen verschieben, maßgeblich ist der zitierte Text.

### Schritt 1 · `web/js/ui.js` (Helfer)

| # | Stelle | vorher → nachher | ids |
|---|---|---|---|
| 1.1 | nach `pnl` (Z. 165) neue Funktion | – → `const count = (n, one, many) => \`${fmt.int(n)} ${Math.abs(n) === 1 ? one : many}\`;` mit Kommentar „Zähler mit Einzahl/Mehrzahl“ | zustaende-28 |
| 1.2 | Export `root.UI = { … }` (Z. 464) | `… pnl, rText, …` → `… pnl, count, rText, …` | zustaende-28 |
| 1.3 | Icon-Objekt `I` (Z. 9 ff., nach `download`) | – → `printer: sv('<path d="M7 9V3h10v6"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M7 14h10v7H7z"/>'),` (gleicher Strichstil) | bereich_notebook_news-29 |
| 1.4 | Diagramm-Tooltips Z. 327 und Z. 335 | `${g.s.n} Trades · Win-Rate ${fmt.pct(g.s.winRate)}` → `${count(g.s.n, 'Trade', 'Trades')} · Trefferquote ${fmt.pct(g.s.winRate)}` | wording-3, zustaende-28 |
| 1.5 | Monte-Carlo-Ruin-Linie Z. 350 | `Ruin-Schwelle ${curShort(ruinY)}` → `Ruin-Schwelle ${fmt.cur(ruinY, { compact: true })}` (ergibt „17.500 €“) | bereich_statistik-26 |
| 1.6 | Disziplin-Balken Z. 360 | `(${p.n} Trades)` → `(${count(p.n, 'Trade', 'Trades')})` | zustaende-28 |
| 1.7 | Heatmap-Tooltip Z. 407 | `${a.n} Trades · …` → `${count(a.n, 'Trade', 'Trades')} · …` | zustaende-28 |

### Schritt 2 · `web/js/core.js` (zentrale Kennzahl-Namen)

| # | Stelle | vorher → nachher | ids |
|---|---|---|---|
| 2.1 | `SCORE_AXES` Z. 265 | `winRate: 'Win-Rate'` → `winRate: 'Trefferquote'` (übrige Achsen unverändert) | wording-3, bereich_dashboard-32 |
| 2.2 | `HOUR_BUCKETS` Z. 195 | `[…, '17–18', '18–20', 'ab 20']` → `['vor 8', '8–9', '9–10', '10–11', '11–12', '12–13', '13–14', '14–15', '15–16', '16–17', '17–18', '18–19', '19–20', 'ab 20']` | bereich_statistik-38 |
| 2.3 | `hourBucket` Z. 196 | `const hourBucket = h => h < 8 ? 'vor 8' : h < 18 ? \`${h}–${h + 1}\` : h < 20 ? '18–20' : 'ab 20';` → `const hourBucket = h => h < 8 ? 'vor 8' : h < 20 ? \`${h}–${h + 1}\` : 'ab 20';` | bereich_statistik-38 |
| 2.4 | `HOLD_BUCKETS`, `holdBucket` Z. 197–198 | `'< 5 min'` → `'unter 5 min'`, `'> 4 h'` → `'über 4 h'` (beide Zeilen) | bereich_statistik-38 |
| 2.5 | `stats16` Z. 316 (`expectancy`) | label `'Trade-Erwartungswert'` → `'Erwartungswert pro Trade'`; info `'Win-Rate × Ø Gewinn + Verlustrate × Ø Verlust.'` → `'Trefferquote × Ø Gewinn minus Verlustquote × Ø Verlust. Was ein Trade im Schnitt einbringt.'` (wörtlich wie widgets.js:177, Schlüssel vorhanden). Wert bleibt `s.tradeExpectancy` | wording-8, wording-3 |
| 2.6 | `stats16` Z. 317 (`avgTrade`) | ganze Zeile → `{ key: 'trades', label: 'Trades', type: 'int', v: s.n, info: 'Abgeschlossene Trades im Zeitraum.' },` | wording-8 |
| 2.7 | Z. 318 (`avgVolume`) | label `'Ø Tagesvolumen'` → `'Ø Kontrakte pro Tag'`; info `'Gehandelte Stückzahl pro Handelstag.'` → `'Gehandelte Kontrakte pro Handelstag.'` | bereich_statistik-10 |
| 2.8 | Z. 319 (`winRate`) | label `'Win-Rate'` → `'Trade-Trefferquote'` | wording-3 |
| 2.9 | Z. 320 (`dayPayoff`) | label bleibt `'Ø Tages-Gewinn/Verlust'`; info → `'Ø Gewinntag geteilt durch Ø Verlusttag.'` | wording-9, bereich_statistik-10 |
| 2.10 | Z. 323 (`dayWinRate`) | label `'Ø Tages-Win-Rate'` → `'Tages-Trefferquote'` | wording-3, hierarchie-13, bereich_statistik-10 |
| 2.11 | Z. 324 (`payoff`) | label `'Ø Trade-Gewinn/Verlust'` → `'Ø Gewinn/Verlust'`; info → `'Ø Gewinn geteilt durch Ø Verlust.'` | wording-9, hierarchie-13, bereich_statistik-10 |
| 2.12 | Z. 325 (`plannedR`) | label `'Ø geplantes R-Multiple'` → `'Ø geplantes R pro Trade'` | bereich_statistik-10 |
| 2.13 | Z. 329 (`realizedR`) | label `'Ø realisiertes R-Multiple'` → `'Ø R pro Trade'` (wie Edge-Check stats.js:72) | bereich_statistik-10 |
| 2.14 | `insights()` Z. 544–549 | neue lokale Hilfsfunktion in `insights()` direkt nach `const pct = …` (Z. 541): `const nT = n => n === 1 ? '1 Trade' : \`${n} Trades\`;`; in Z. 544 `${mr.mistakeN} Trades mit Fehler-Tags` → `${nT(mr.mistakeN)} mit Fehler-Tags`, Z. 546 `${best.s.n} Trades, Win-Rate ${pct(…)}` → `${nT(best.s.n)}, Trefferquote ${pct(…)}` und `${worst.s.n} Trades mit` → `${nT(worst.s.n)} mit`, Z. 548 `bei ${b.s.n} Trades` → `bei ${nT(b.s.n)}`, Z. 549 `${wd[0].s.n} Trades mit` → `${nT(wd[0].s.n)} mit` | wording-3, zustaende-28 |

### Schritt 3 · `web/css/app.css` (Komponenten-Regeln)

| # | Stelle | vorher → nachher | ids |
|---|---|---|---|
| 3.1 | Block `@media (pointer: fine)` Z. 391–394, ans Ende des Blocks | – → `.dp-wrap { position: relative; display: block; min-width: 0; }` · `.dp-wrap:not(.typing) > .input { color: transparent; }` · `.dp-display { position: absolute; left: 13px; right: 38px; top: 50%; transform: translateY(-50%); pointer-events: none; font: inherit; font-size: 13.5px; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }` · `.dp-display.empty { color: var(--faint); }` · `.dp-wrap.typing .dp-display { display: none; }` · `.dp-coarse { display: none; }` | wording-2, bereich_dashboard-28, wording-62 |
| 3.2 | nach Z. 405 (Teilstück-Regeln) | – → `.input.is-empty::-webkit-datetime-edit { color: var(--faint); }` (Leerzustand auf Touch, ohne Overlay) | wording-2 |
| 3.3 | Filterzeile in Datumspaaren `.fd-pair .input` (Z. 1396) | keine Änderung; das Overlay übernimmt `font-size` über `font: inherit` nicht aus `.input`, darum in 3.1 fest 13.5px. Für `.fd-pop .fd-pair .dp-display` ergänzen: `font-size: 12.5px; left: 11px;` | wording-2 |
| 3.4 | nach `.ce-head` (Z. 2872) | – → `.ce-edited { flex: 0 0 auto; white-space: nowrap; }` | bereich_konto-21 |
| 3.5 | Handy-Block `@media (max-width: 560px)` am Ende der Datei | – → `.ce-head { flex-direction: column; gap: 2px; }` | bereich_konto-21 |
| 3.6 | TradeLog-Filter (bei den TradeLog-Regeln, um Z. 1743) | – → `.tl-search { max-width: 260px; position: relative; }` · `.tl-sel { display: contents; }` | bereich_trades_tag-35 |
| 3.7 | Handy-Block `@media (max-width: 560px)` | – → `.tl-search { max-width: none; flex: 1 1 100%; }` · `.tl-sel { display: flex; gap: 8px; flex: 1 1 100%; flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; overscroll-behavior-x: contain; }` · `.tl-sel::-webkit-scrollbar { display: none; }` · `.tl-sel > * { flex: 0 0 auto; }` | bereich_trades_tag-35 |

### Schritt 4 · `web/js/datepicker.js` (Anzeige-Overlay für Datumsfelder)

Nur mit Maus (`fine()`). Touch bleibt beim System-Feld (README Z. 307).

| # | Stelle | Änderung | ids |
|---|---|---|---|
| 4.1 | neue Funktion `decorate(inp)` | Für `input.input` mit `TYPES[inp.type]` (date, datetime-local, month; `time` erst, wenn bereich_prop-52 es in `TYPES` aufnimmt) und nur einmal je Feld (`inp.dataset.dpDeco`): Feld in `<span class="dp-wrap">` hüllen, dahinter `<span class="dp-display" aria-hidden="true"></span>` einfügen. Das Feld behält `name`, `id`, `required`, `value` und alle Listener | wording-2, bereich_dashboard-28 |
| 4.2 | neue Funktion `sync(inp)` | Text der Anzeige: datetime-local → `root.UI.fmt.dateTime(new Date(v))`; date → `root.UI.fmt.dateFull(parse(v))` (lokal parsen, nicht `new Date(v)`, sonst Vortag westlich von UTC); month → `monthLabel(y, m)`. Leer: Text aus `inp.dataset.empty`, sonst „–“, und Klasse `empty`. Die Anzeige bekommt `no-i18n` nur, wenn ein Wert dasteht (der Leertext soll übersetzt werden) | wording-2, wording-62 |
| 4.3 | in `decorate` | `const d = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value'); Object.defineProperty(inp, 'value', { configurable: true, get() { return d.get.call(this); }, set(v) { d.set.call(this, v); sync(this); } });` sowie Listener `input` und `change` → `sync(inp)` | wording-2 |
| 4.4 | Tippen sichtbar | `keydown` am Feld mit Ziffer, Backspace, Delete, ArrowUp, ArrowDown → `wrap.classList.add('typing')`; `blur` → `remove('typing')` und `sync(inp)` | wording-2 |
| 4.5 | `init()` | vorhandene Felder einmal dekorieren (`document.querySelectorAll('input.input')`), danach `MutationObserver` auf `document.body` (`childList: true, subtree: true`), der neue Felder dekoriert. Nur wenn `fine()` | wording-2 |
| 4.6 | Touch-Leerzustand | in `init()` ein `input`-Listener (capture) auf `document`: bei `TYPES[e.target.type]` → `e.target.classList.toggle('is-empty', !e.target.value)`; einmal beim Dekorieren bzw. für alle Felder beim Start setzen | wording-2 |
| 4.7 | `type="week"` | bleibt nativ (Abschnitt 5) | bereich_dashboard-28 |

### Schritt 5 · `web/js/app.js` und `web/app.html` (Shell, Navigation, Trade-Dialog)

| # | Stelle | vorher → nachher | ids |
|---|---|---|---|
| 5.1 | app.js:18 Navigationsgruppe | `['Konten', [['prop', …], ['coupons', …]]]` → `['Prop Trading', [['prop', …], ['coupons', …]]]` (Einträge gleich; Schlüssel „Konten“ in js/lang **nicht** umbenennen, er wird weiter gebraucht) | bereich_shell-33 |
| 5.2 | app.js:229 Konto-Karte | `'<span>Profil vervollständigen</span>'` → `'<span>Profil ergänzen</span>'` | bereich_shell-34 |
| 5.3 | app.js:324 Aktion `new-trade` | `'new-trade'() { this.openTradeEditor(null); },` → `'new-trade'() { const k = this.state.route === 'day' ? (this.state.params[0] \|\| C.dayKey(new Date())) : null; if (k && k !== C.dayKey(new Date())) { const d = C.parseDayKey(k); d.setHours(9, 0, 0, 0); return this.openTradeEditor(null, { openedAt: d.toISOString() }); } this.openTradeEditor(null); },` | wording-5 |
| 5.4 | app.js:360 Feld Geschlossen | `<label for="f-close">Geschlossen <span class="faint">(leer = offen)</span></label><input class="input" type="datetime-local" id="f-close" …>` → `<label for="f-close">Geschlossen <span class="faint dp-coarse">(leer lassen, solange offen)</span></label><input class="input" type="datetime-local" id="f-close" data-empty="Offen" …>` | wording-62, wording-2 |
| 5.5 | app.js:368 Bestätigungsknopf | `${trade ? 'Speichern' : 'Trade speichern'}` → `${trade ? 'Speichern' : 'Trade loggen'}` | wording-63 |
| 5.6 | app.js:391 Symbol-Liste | `(o.n === 1 ? '1 Trade' : \`${o.n} Trades\`)` → `U.count(o.n, 'Trade', 'Trades')` | zustaende-28 |
| 5.7 | app.js:530 Session-Ende | `<div class="caption">Win-Rate</div>` → `<div class="caption">Trefferquote</div>` | wording-3, bereich_trades_tag-36 |
| 5.8 | app.js:567 und :574 (CSV) | `${preview.trades.length} Trades erkannt` → `${U.count(preview.trades.length, 'Trade', 'Trades')} erkannt`; Toast `${fresh.length} Trades importiert` → `${U.count(fresh.length, 'Trade', 'Trades')} importiert` | zustaende-28 |
| 5.9 | app.html:95–96 Tastatur | vor `if (map[e.key])` einfügen: `if (e.key === '0' && !App.on('replay')) return;` · `App.openTradeEditor(null)` → `App.actions['new-trade'].call(App)` | bereich_shell-32, wording-5 |

### Schritt 6 · `web/js/widgets.js` und `web/js/widgetpreviews.js`

| # | Stelle | vorher → nachher | ids |
|---|---|---|---|
| 6.1 | widgets.js:115 Kalender-Tageszelle | `.p`: `compact: Math.abs(e.pnl) >= 1000` → `compact: true`; `title="Winrate"` → `title="Trefferquote"`; `${e.n} Trade${e.n === 1 ? '' : 's'}` → `${U.count(e.n, 'Trade', 'Trades')}` | bereich_dashboard-17, wording-3, zustaende-28 |
| 6.2 | widgets.js:116 Wochensumme | `.p`: `compact: Math.abs(wk.pnl) >= 1000` → `compact: true` (`.pm` bleibt) | bereich_dashboard-17 |
| 6.3 | widgets.js:127 Jahreskalender leer | `<b class="muted">--</b>` → `<b class="muted">—</b>` | bereich_dashboard-17 |
| 6.4 | widgets.js:132 | `${a.n} Trade${a.n === 1 ? '' : 's'}` → `${U.count(a.n, 'Trade', 'Trades')}` | zustaende-28 |
| 6.5 | widgets.js:165 | `name: 'Netto P&L'` → `name: 'Netto-P&L'` | wording-6, hierarchie-13, bereich_dashboard-32 |
| 6.6 | widgets.js:166 | `U.pnl(d.s.total, '', { signed: false })` → `U.pnl(d.s.total)`; `${d.s.n} Trade${…}` → `U.count(d.s.n, 'Trade', 'Trades')` | wording-7, zustaende-28 |
| 6.7 | widgets.js:175 | `name: 'Gewinn/Verlust pro Trade', short: 'Ø Gewinn/Verlust'` → `name: 'Ø Gewinn/Verlust'` (ohne `short`); info → `'Ø Gewinn geteilt durch Ø Verlust. Der Balken zeigt das Verhältnis.'` | wording-9, bereich_dashboard-32 |
| 6.8 | widgets.js:197–198 Report-Namen | `'Ø Tages-Gewinn/Verlust (kumuliert)'` bleibt; `'Ø Trade-Gewinn/Verlust (kumuliert)'` → `'Ø Gewinn/Verlust (kumuliert)'`; `'Ø geplantes R-Multiple (kumuliert)'` → `'Ø geplantes R pro Trade (kumuliert)'`; `'Ø realisiertes R-Multiple (kumuliert)'` → `'Ø R pro Trade (kumuliert)'`; `'Ø Tagesvolumen (kumuliert)'` → `'Ø Kontrakte pro Tag (kumuliert)'` (Schlüssel unverändert) | wording-9, bereich_statistik-10 |
| 6.9 | widgets.js:226 Gesamt-Score | desc → `'Punktzahl von 0 bis 100 aus Trefferquote, Profit-Faktor, Gewinn/Verlust, Konsistenz, Regeltreue und Drawdown, als Netz-Diagramm.'`; info → `'Sechs Achsen von 0 bis 100: Trefferquote, Profit-Faktor, Gewinn/Verlust, Konsistenz, Regeltreue und Drawdown. Der Score ist der Mittelwert.'` | wording-9, wording-3 |
| 6.10 | widgets.js:228 | `name: 'Kumulierter Tages-P&L'` → `name: 'Kumulierter Netto-P&L'` | bereich_dashboard-32 |
| 6.11 | widgets.js:253 Info „Letzte Trades“ | `…; „Mehr anzeigen“ öffnet das TradeLog.` → `…; „Zum TradeLog“ öffnet die ganze Liste.` | wording-48 |
| 6.12 | widgets.js:257 | `<div class="more-row"><a class="more-link" href="#/trades">Mehr anzeigen</a></div>` → `${rows.length ? '<div class="more-row"><a class="more-link" href="#/trades">Zum TradeLog</a></div>' : ''}` | wording-48 |
| 6.13 | widgets.js:273 | `${list.length} Trades · ${days.length} Handelstage` → `${U.count(list.length, 'Trade', 'Trades')} · ${U.count(days.length, 'Handelstag', 'Handelstage')}` | zustaende-28 |
| 6.14 | widgets.js:285 Tracker-Tooltip | `${…} von ${rules.length} Regeln eingehalten` → `${…} von ${rules.length} Regeln abgehakt` | wording-44 |
| 6.15 | widgets.js:288 Regel-Tracker | Option `{ trailing: \`<a class="more-link" href="#/progress">Mehr anzeigen</a>\` }` ersatzlos streichen | wording-48 |
| 6.16 | widgets.js:323 / :331 desc | `'Schatten-Ich: was Regelbrüche dich im Zeitraum gekostet oder gebracht haben.'` → `'Schatten-Ich: was Verstöße dich im Zeitraum gekostet oder gebracht haben.'`; `'… was Regelbrüche gekostet haben, …'` → `'… was Verstöße gekostet haben, …'` | wording-38 |
| 6.17 | widgets.js:334 | `Leg fest, was für dich gilt. Dann rechnet dein Schatten-Ich, was Regelbrüche kosten.` → `Lege fest, was für dich gilt. Dann rechnet dein Schatten-Ich, was Verstöße kosten.` | wording-38 |
| 6.18 | widgets.js:344 / :348 | `${fmt.int(ready)} Trades bereit` → `${U.count(ready, 'Trade', 'Trades')} bereit`; `von ${fmt.int(st.n)} Trades` → `von ${U.count(st.n, 'Trade', 'Trades')}` | zustaende-28 |
| 6.19 | widgets.js:351 Prop-Widget desc/info | „Ampel, Balance und Puffer“ → „Ampel, Kontostand und Puffer“; „die Ampel, die Balance und …“ → „die Ampel, den Kontostand und …“ | wording-32 |
| 6.20 | widgets.js:354 Leerzustand | `Leg ein Konto an, dann siehst du hier Ampel, Balance und Puffer.` → `Lege ein Prop-Konto an, dann siehst du hier Ampel, Kontostand und Puffer.`; Knopftext `Konto anlegen` → `Prop-Konto anlegen` | wording-32, wording-34 |
| 6.21 | widgets.js:358 | `noch ${b.stops} Stop-Loss${b.stops === 1 ? '' : 'es'}` → `reicht für ${b.stops} Stop${b.stops === 1 ? '' : 's'}` | wording-33 |
| 6.22 | widgets.js:373 Mentor-Widget | `Der Mentor läuft über deinen eigenen Server.` → `Der Mentor läuft über deinen Journalyst-Server.` (Knopf und Ziel `#/mentor` bleiben, fwtest.js:46) | wording-14 |
| 6.23 | widgetpreviews.js:45 | `cap(…, 'Regelbrüche haben dich das gekostet')` → `cap(…, 'So viel haben dich Verstöße gekostet')` | wording-38 |
| 6.24 | widgetpreviews.js:52 | `'noch 7 Stop-Losses'`, `'noch 43 Stop-Losses'`, `'noch 2 Stop-Losses'` → `'reicht für 7 Stops'`, `'reicht für 43 Stops'`, `'reicht für 2 Stops'` | wording-33 |
| 6.25 | widgetpreviews.js:57 / :62 / :75 | `ttl('Netto P&L')` → `ttl('Netto-P&L')`; `ttl('Gewinn/Verlust pro Trade')` → `ttl('Ø Gewinn/Verlust')`; `ttl('Kumulierter Tages-P&L')` → `ttl('Kumulierter Netto-P&L')` | wording-6, wording-9, bereich_dashboard-32 |
| 6.26 | widgetpreviews.js:71 | `names = ['Win-Rate', …]` → `names = ['Trefferquote', …]` | wording-3 |
| 6.27 | widgetpreviews.js:90 / :104 | `tx(70, 85, 'Mehr anzeigen', …)` → `tx(70, 85, 'Zum TradeLog', …)`; in :104 `+ tx(132, 13, 'Mehr anzeigen', 4, P, { a: 'end', w: 600 })` streichen | wording-48 |

### Schritt 7 · `web/js/screens/dashboard.js` und `web/js/screens/dash-filter.js`

| # | Stelle | vorher → nachher | ids |
|---|---|---|---|
| 7.1 | dashboard.js:78 Widget-Suche | `placeholder="Widget suchen …"` → `placeholder="Widgets durchsuchen" aria-label="Widgets durchsuchen"` | wording-51 |
| 7.2 | dashboard.js:89 Hinweis-Punkt | `'Neuer Performance-Recap'` → `'Neuer Recap'` | wording-11 |
| 7.3 | dashboard.js:130 Willkommen-Banner | `${I.upload} CSV</button>` → `${I.upload} CSV importieren</button>` | wording-49 |
| 7.4 | dash-filter.js:104 `pair()` | `placeholder="${o.ph1 \|\| 'Min'}"` → `\|\| 'Von'`; `placeholder="${o.ph2 \|\| 'Max'}"` → `\|\| 'Bis'` | bereich_dashboard-31 |
| 7.5 | dash-filter.js:119 | `row('Intraday / Multiday', seg('span', f, [['', 'Alle'], ['intraday', 'Intraday'], ['multiday', 'Multiday']]))` → `row('Intraday / Mehrtägig', seg('span', f, [['', 'Alle'], ['intraday', 'Intraday'], ['multiday', 'Mehrtägig']]))` | bereich_dashboard-31 |
| 7.6 | dash-filter.js:120 | `row('Reviewed', seg('reviewed', f, [['', 'Alle'], ['yes', 'Reviewed'], ['no', 'Unreviewed']]), 'Bewertung oder Notiz vorhanden')` → `row('Nachbereitet', seg('reviewed', f, [['', 'Alle'], ['yes', 'Ja'], ['no', 'Nein']]), 'Bewertung oder Notiz vorhanden')` (Werte `yes`/`no` bleiben, filtertest.js:62) | bereich_dashboard-31 |

### Schritt 8 · `web/js/screens/day.js` und `web/js/screens/progress.js`

| # | Stelle | vorher → nachher | ids |
|---|---|---|---|
| 8.1 | day.js:12 Kopfzeile | Knopf `<button … data-action="check-in" …>${I.sparkle} ${d.checkIn ? 'Check-in bearbeiten' : 'Check-in'}</button>` und Knopf `<button … class="btn sm accent" data-action="new-trade-day" …>${I.plus} Trade für diesen Tag</button>` ersatzlos streichen. Am Zertifikat-Knopf `data-tip="Daily Profit Certificate"` → `data-tip="Tageszertifikat erstellen"`. Knopf bleibt immer sichtbar. Gilt am neuen Ort, falls referenz-17 vorher umgesetzt ist | wording-5, wording-45, bereich_trades_tag-37 |
| 8.2 | day.js:24 | Aktion `'new-trade-day'` streichen (übernommen von 5.3) | wording-5 |
| 8.3 | day.js:14 Tageskennzahlen | `<div class="k">Win-Rate</div>` → `<div class="k">Trefferquote</div>` | wording-3, bereich_trades_tag-36 |
| 8.4 | day.js:16 Check-in-Karte, Leerzustand | Knopftext `Check-in nachtragen` → `${isToday ? 'Check-in machen' : 'Check-in nachtragen'}`. Mit Check-in bleibt der Kartenknopf „Bearbeiten“ | wording-5, bereich_trades_tag-37 |
| 8.5 | day.js:18 Regeln des Tages | `… von ${rules.length} eingehalten` → `… von ${rules.length} abgehakt`; `U.empty('shield', 'Keine Regeln definiert', …)` → `U.empty('shield', 'Noch keine Regeln angelegt', …)` | wording-44, bereich_trades_tag-37 |
| 8.6 | progress.js:69 Kartentitel | `U.card('% Regeln eingehalten', …)` → `U.card('Regeltreue', …)`; `${cur.n} Tage mit Regel-Check im Zeitraum` → `${U.count(cur.n, 'Tag', 'Tage')} mit Regel-Check im Zeitraum` | wording-43, zustaende-28 |
| 8.7 | progress.js:77 | `U.empty('shield', 'Keine Regeln definiert', …)` → `U.empty('shield', 'Noch keine Regeln angelegt', …)` | bereich_trades_tag-37 |
| 8.8 | progress.js:79 Tilt-Text | `${tp.afterStreakPnL < 0 ? 'Weiterhandeln nach drei Verlusten hat dich bisher Geld gekostet. Ein hartes Tageslimit würde helfen.' : 'Nach Verlustserien hast du dich bisher gefangen. Bleib trotzdem wachsam.'}` → `${tp.afterStreakPnL < 0 ? 'Weiterhandeln nach drei Verlusten hat dich bisher Geld gekostet. Ein hartes Tageslimit würde helfen.' : tp.losing / tp.withStreak >= 0.6 ? 'Nach der Serie hast du Geld zurückgeholt, die meisten dieser Tage endeten trotzdem im Minus.' : 'Nach Verlustserien hast du dich bisher gefangen.'}` | bereich_training-14 |
| 8.9 | progress.js:28 Heatmap-Tooltip | `${a.n} Trade${a.n === 1 ? '' : 's'}` → `${U.count(a.n, 'Trade', 'Trades')}` | zustaende-28 |

### Schritt 9 · `web/js/screens/trades.js` (TradeLog und Trade-Detail)

| # | Stelle | vorher → nachher | ids |
|---|---|---|---|
| 9.1 | Z. 7 `COLS` | `['entryPrice', 'Einstiegspreis', 'r']` → `['entryPrice', 'Einstieg', 'r']`; `['exitPrice', 'Ausstiegspreis', 'r']` → `['exitPrice', 'Ausstieg', 'r']`; `['pnl', 'P&L', 'r']` → `['pnl', 'Netto-P&L', 'r']`; `['r', 'RR', 'r']` → `['r', 'R', 'r']` („Status“ bleibt) | bereich_trades_tag-36 |
| 9.2 | Z. 26 Netto-P&L-Kachel | `U.pnl(s.total, '', { signed: false })` → `U.pnl(s.total)`; `<span class="n">${s.n} Trades</span>` → `<span class="n">${U.count(s.n, 'Trade', 'Trades')}</span>` | wording-7, zustaende-28 |
| 9.3 | Z. 39 Filterzeile, Suche | `<div class="row" style="gap:8px"><div class="grow" style="max-width:260px;position:relative"><input … placeholder="Suchen: Symbol, Setup, Notiz …" aria-label="Suchen" …>` → `<div class="row tl-filters" style="gap:8px"><div class="grow tl-search"><input … placeholder="Trades durchsuchen" aria-label="Trades durchsuchen" title="Sucht in Symbol, Setup, Notizen, Fehler-Tags und Emotionen" …>` | wording-51, bereich_trades_tag-35 |
| 9.4 | Z. 40–44 Auswahlfelder | die vier `<select>` und den Zurücksetzen-Knopf in `<div class="tl-sel">…</div>` fassen; Zähler `<span class="muted small" style="margin-left:auto">` → `<span class="muted small tl-count">` | bereich_trades_tag-35 |
| 9.5 | Z. 43 Fehler-Filter | `<option value="">Fehler: alle</option>` → `<option value="">Alle Fehler</option>`; `>Nur mit Fehler<` → `>Mit Fehler<` | bereich_trades_tag-35 |
| 9.6 | Z. 44 Zähler | `${rows.length} von ${list.length} Trades` → `${rows.length} von ${U.count(list.length, 'Trade', 'Trades')}` | zustaende-28 |
| 9.7 | Z. 45 Leerzustand | `return filters + U.empty(…)` → `return (list.length ? filters : '') + U.empty(…)` (ohne Trades im Zeitraum keine Filterzeile; mit Trades und leerem Filterergebnis bleibt sie samt „Zurücksetzen“) | bereich_trades_tag-35 |
| 9.8 | Z. 48 Seitenwähler | `von ${rows.length} Trades` → `von ${U.count(rows.length, 'Trade', 'Trades')}` | zustaende-28 |
| 9.9 | Z. 54 Tageskarten | `<div class="k">Win-Rate</div>` → `<div class="k">Trefferquote</div>` | wording-3, bereich_trades_tag-36 |
| 9.10 | Z. 63 `jBtn` | `const jBtn = raw ? \`<button … data-action="trade-journal" data-id="${raw.id}">${I.edit} Bearbeiten</button>\` : '';` → `const jBtn = label => raw ? \`<button type="button" class="btn sm ghost" data-action="trade-journal" data-id="${raw.id}">${I.edit} ${label}</button>\` : '';` | bereich_trades_tag-22 |
| 9.11 | Z. 66 Brotkrumen-Zeile | nach dem Datums-Link einfügen: `<span class="grow"></span>` + Notebook-Knopf aus Z. 85 (unverändert, `btn sm ghost`) + `<button type="button" class="btn danger sm" data-action="delete-trade" data-id="${t.id}">${I.trash} Löschen</button>` + `<button type="button" class="btn sm" data-action="edit-trade" data-id="${t.id}">${I.edit} Trade bearbeiten</button>` (nicht `primary`) | bereich_trades_tag-22 |
| 9.12 | Z. 68 Detail-Raster | `['Eröffnung', …]` → `['Eröffnet', …]`; `['Schluss', …]` → `['Geschlossen', …]`; `['Stück × Punktwert', …]` → `['Kontrakte × Punktwert', …]` | bereich_trades_tag-36 |
| 9.13 | Z. 73 / Z. 76 | `trailing: … ? jBtn : ''` → `trailing: … ? jBtn('Plan bearbeiten') : ''`; `{ trailing: jBtn }` → `{ trailing: jBtn('Tags bearbeiten') }` | bereich_trades_tag-22 |
| 9.14 | Z. 75 MAE/MFE-Leerzustand | `U.empty('trend', 'Keine Exkursionsdaten', 'Trage MAE und MFE im Editor ein.')` → `U.empty('trend', 'Kein MAE/MFE erfasst', 'Trage unter „Plan & Bewertung“ den Stop sowie den tiefsten und besten Kurs während des Trades ein.', \`<button type="button" class="btn sm" data-action="trade-journal" data-id="${t.id}">Plan ergänzen</button>\`)` | bereich_trades_tag-47, wording-61 |
| 9.15 | Z. 84 Info Sprachjournal | `Auswertung über den Mentor-Server` → `Auswertung über deinen Journalyst-Server` | wording-14 |
| 9.16 | Z. 85–86 Fuß | `const foot = …` streichen, `${foot}` aus dem Rückgabewert in Z. 86 entfernen | bereich_trades_tag-22 |
| 9.17 | Z. 118 Dialogtitel | `<h2>Notiz sprechen oder tippen</h2>` → `<h2>Text-Notiz</h2>` | bereich_trades_tag-47 |

### Schritt 10 · `web/js/screens/stats.js`

| # | Stelle | vorher → nachher | ids |
|---|---|---|---|
| 10.1 | Z. 6 | nach `REG_V` ergänzen: `REG_VS = { low: 'Niedrig', normal: 'Normal', high: 'Hoch' }` | bereich_statistik-16 |
| 10.2 | Z. 26 Serien | `${sk.current} ${sk.kind === 'win' ? 'Gewinne' : 'Verluste'}` → `${sk.kind === 'win' ? U.count(sk.current, 'Gewinn', 'Gewinne') : U.count(sk.current, 'Verlust', 'Verluste')}` | bereich_statistik-28, zustaende-28 |
| 10.3 | Z. 31 | `U.card('P&L nach Wochentag', …)` → `U.card('Netto-P&L nach Wochentag', …)` | bereich_statistik-16 |
| 10.4 | Z. 32 Tagestabelle | `<th class="r">Win-Rate</th>` → `<th class="r">Trefferquote</th>` | wording-3 |
| 10.5 | Z. 34 `groupTable` | `<th class="r">Win-Rate</th><th class="r">Ø pro Trade</th>` → `<th class="r">Trefferquote</th><th class="r">Erwartungswert</th>` | wording-3, bereich_statistik-16 |
| 10.6 | Z. 39 | `'Erwartungswert je Setup'` → `'Erwartungswert nach Setup'`; info `'Ø Netto-P&L pro Trade je Setup.'` → `'Ø Netto-P&L pro Trade nach Setup.'`; `'Netto-P&L je Symbol'` → `'Netto-P&L nach Symbol'` | bereich_statistik-16 |
| 10.7 | Z. 45 | `'Ø pro Trade nach Wochentag'` → `'Erwartungswert nach Wochentag'`; `'Ø pro Trade nach Haltedauer'` → `'Erwartungswert nach Haltedauer'`; `groupTable(ta.hours, 'Uhrzeit')` → `groupTable(ta.hours.map(g => Object.assign({}, g, { label: g.key + ' Uhr' })), 'Uhrzeit')` | bereich_statistik-16, bereich_statistik-38 |
| 10.8 | Z. 51 Fehler-Kacheln | erste Kachel: `const mc0 = mr.cost < -C.EPS ? ['Fehler haben gekostet', 'neg', fmt.cur(-mr.cost)] : mr.cost > C.EPS ? ['Fehler haben eingebracht', 'pos', fmt.cur(mr.cost)] : ['Fehler haben gekostet', 'neu', fmt.cur(0)];` und `U.tile(mc0[0], \`<span class="${mc0[1]}">${mc0[2]}</span>\`, { info: … })` (Info unverändert); `{ n: \`${mr.compliantN} Trades\` }` → `{ n: U.count(mr.compliantN, 'Trade', 'Trades') }`; vierte Kachel `U.tile('Win-Rate mit / ohne Fehler', \`<span class="neg">…</span> <span class="muted">/</span> <span class="pos">…</span>\`)` → `U.tile('Trefferquote mit / ohne Fehler', \`${fmt.pct(mr.mistakeSummary.winRate, 1)} <span class="muted">/</span> ${fmt.pct(mr.compliantSummary.winRate, 1)}\`)` (keine Farbe, eine Stelle wie stats.js:21) | bereich_statistik-45, wording-3, zustaende-28 |
| 10.9 | Z. 52 Kosten je Fehler | `· WR ${fmt.pct(…)}` → `· Trefferquote ${fmt.pct(…)}` | wording-3 |
| 10.10 | Z. 56 `lab` | Einzelfall `REG_T[g.key] \|\| REG_V[g.key] \|\| g.key` → `REG_T[g.key] \|\| REG_VS[g.key] \|\| g.key` (Kombinationen behalten `REG_V`) | bereich_statistik-16 |
| 10.11 | Z. 58 | `${ra.coverage} von ${closed.length} Trades haben …` → `${ra.coverage} von ${U.count(closed.length, 'Trade', 'Trades')} haben …`; `'Ø pro Trade je Marktphase'` → `'Erwartungswert nach Marktphase'`; `'Ø pro Trade nach Volatilität'` → `'Erwartungswert nach Volatilität'` | bereich_statistik-16, zustaende-28 |
| 10.12 | Z. 72 Edge | `{ n: \`${e.n} Trades\` }` → `{ n: U.count(e.n, 'Trade', 'Trades') }`; `noch ${e.required - e.n} Trades` → `noch ${U.count(e.required - e.n, 'Trade', 'Trades')}` | zustaende-28 |
| 10.13 | Z. 79 Monte Carlo | `${mc.runs} Durchläufe à …` → `${fmt.int(mc.runs)} Durchläufe à …` | bereich_statistik-26, wording-29 |
| 10.14 | Z. 80 MC-Kacheln | `U.tile('Median-Drawdown', \`<span class="neg">${fmt.cur(-mc.dd.p50)}</span>\`, { foot: \`95 %: … · schlimmster …\` })` → `U.tile('Drawdown (Median)', \`<span class="neg">${fmt.cur(-mc.dd.p50, { compact: true })}</span>\`, { foot: \`In 95 % der Durchläufe unter ${fmt.cur(mc.dd.p95, { compact: true })} · schlimmster ${fmt.cur(mc.dd.worst, { compact: true })}\` })`; `U.tile('Endkapital (Median)', fmt.cur(mc.final.p50), { foot: \`5 %: … · 95 %: …\` })` → `U.tile('Endkapital (Median)', fmt.cur(mc.final.p50, { compact: true }), { foot: \`90 % der Durchläufe zwischen ${fmt.cur(mc.final.p5, { compact: true })} und ${fmt.cur(mc.final.p95, { compact: true })}\` })` | bereich_statistik-26 |
| 10.15 | Z. 81 | `{ sub: '25 von ' + mc.runs + ' Durchläufen' }` → `{ sub: '25 von ' + fmt.int(mc.runs) + ' Durchläufen' }` | bereich_statistik-26 |

### Schritt 11 · `web/js/shadow.js` und `web/js/screens/shadow.js`

| # | Stelle | vorher → nachher | ids |
|---|---|---|---|
| 11.1 | js/shadow.js:14 | `label: 'Stopp nach Verlusten in Folge'` → `label: 'Schluss nach Verlustserie'` (Regel-Schlüssel `lossStreak` bleibt; das aria-label „… : Verluste“ zieht mit) | wording-41 |
| 11.2 | screens/shadow.js:25 `costView` | `'Regelbrüche haben dich das gekostet'` → `'So viel haben dich Verstöße gekostet'`; `'Regelbrüche haben dir das gebracht'` → `'So viel haben dir Verstöße gebracht'` | wording-38 |
| 11.3 | screens/shadow.js:32 `DESC` | `dailyLoss: 'Ist das Tageslimit erreicht, ist für heute Schluss.'` → `'Ist der maximale Tagesverlust erreicht, ist für heute Schluss.'`; `lossStreak: 'Nach so vielen Verlusten hintereinander ist Pause.'` → `'Nach so vielen Verlusten hintereinander ist für heute Schluss.'` | wording-10, wording-41 |
| 11.4 | screens/shadow.js:58 Banner | `'Schalte oben mindestens eine Regel ein – dann rechnet dein Schatten-Ich, was Regelbrüche kosten.'` → `'Schalte oben mindestens eine Regel ein. Dann rechnet dein Schatten-Ich, was Verstöße kosten.'` | wording-38 |
| 11.5 | screens/shadow.js:59 | `${res.unknownRisk === 1 ? '1 Trade ohne Stop konnte' : \`${…} Trades ohne Stop konnten\`}` → `${U.count(res.unknownRisk, 'Trade', 'Trades')} ohne Stop ${res.unknownRisk === 1 ? 'konnte' : 'konnten'}` | zustaende-28 |
| 11.6 | screens/shadow.js:60 | `U.card('Mein Regelwerk', …, { info: 'Schalte ein, was für dich gilt. Dein Schatten-Ich hält sich daran – Änderungen gelten sofort.' })` → `U.card('Regelwerk', …, { info: 'Schalte ein, was für dich gilt. Dein Schatten-Ich hält sich daran, Änderungen gelten sofort.' })` | wording-25, wording-38 |
| 11.7 | screens/shadow.js:108 Intro | `Dein Schatten-Ich handelt wie du – nur ohne Regelbrüche.` → `Dein Schatten-Ich handelt wie du, hält sich aber an jede aktive Regel.` | wording-38 |
| 11.8 | screens/shadow.js:109 | `'Sobald Trades geschlossen sind, zeigt dir dein Schatten-Ich, was Regelbrüche kosten.'` → `'… was Verstöße kosten.'` | wording-38 |
| 11.9 | screens/shadow.js:112 Info | `'Schatten-Ich minus echt: Was Regelbrüche im Zeitraum unterm Strich bewirkt haben.'` → `'Schatten-Ich minus echt: was Verstöße im Zeitraum unterm Strich bewirkt haben.'` | wording-38 |
| 11.10 | screens/shadow.js:114 | `{ foot: 'Mit allen Regeln eingehalten' }` → `{ foot: 'Ohne Verstöße' }` | wording-39 |
| 11.11 | screens/shadow.js:118 | `U.card('Equity: echt vs. Schatten-Ich', …, { info: '… lässt Trades mit Regelbruch weg …' })` → `U.card('Kumulierter Netto-P&L', …, { info: '… lässt Trades mit Verstoß weg …' })` (Legende „Echt / Schatten-Ich“ bleibt) | wording-40, wording-38 |

### Schritt 12 · `web/js/screens/prop.js`, `web/js/screens/prop-friedhof.js`, `web/js/screens/coupons.js`

| # | Stelle | vorher → nachher | ids |
|---|---|---|---|
| 12.1 | prop.js:34–35 | `const curSym = () => …fmt.cur(0, { money: true })…` → `const curSym = c => fmt.moneyBlind() ? '' : fmt.cur(0, { money: true, currency: c }).replace(/[\d.,\s ]/g, '');` · `const unitLabel = (text) => { const s = curSym(); … }` → `const unitLabel = (text, c) => { const s = curSym(c); return s ? \`${text} (${s})\` : text; };` | bereich_prop-38 |
| 12.2 | prop.js:50 `detailOf` (dailyLoss) | `` `Tagesverlust ${money(a, b.loss)} erreicht das Limit ${money(a, b.limit)}${b.dayKey ? ` (Handelstag ${esc(b.dayKey)})` : ''}` `` → `` `Tagesverlust ${money(a, b.loss)} ${b.loss > b.limit + C.EPS ? 'überschreitet' : 'erreicht'} das Limit von ${money(a, b.limit)}${b.dayKey && b.at && b.dayKey !== C.dayKey(new Date(b.at)) ? ` · Handelstag ${fmt.dateFull(C.parseDayKey(b.dayKey))}` : ''}` `` | bereich_prop-4 |
| 12.3 | prop.js:68 | `fmtMoney: v => fmt.cur(v)` → `fmtMoney: v => money(a, v)` | bereich_prop-5 |
| 12.4 | prop.js:71–77 `planText(a, ev, plan, skipProfit)` | vierter Parameter `skipProfit`. Z. 75: Gewinn-Teil `Gewinn fehlt: ${fmt.cur(plan.missingProfit)}` → nur wenn `!skipProfit`: `${money(a, plan.missingProfit)} Gewinn fehlen`; `'Consistency verletzt'` → `'Consistency Rule verletzt'`; „in N Handelstag(en)“ bleibt. Z. 76: `return parts.join(' · ') \|\| '—';` → `return parts.join(' · ') \|\| (skipProfit ? '' : '—');` | wording-31, bereich_prop-5 |
| 12.5 | prop.js:79 `limText` | `r => … fmt.cur(r.value)` → `(r, c) => … fmt.cur(r.value, { currency: c })`; `ddText` reicht die Währung durch; Aufrufer im Preset-Raster übergeben `p.currency`; `lockAt` ebenso | bereich_prop-38 |
| 12.6 | prop.js:82 Leerzustand | Text `'Lege ein Konto aus einem Firmen-Preset an und ordne ihm Trades zu. Dann siehst du hier Balance, Puffer, Ampel und den Weg zum Payout.'` → `'Lege ein Prop-Konto an (Firma, Größe, Regeln) und ordne ihm Trades zu. Dann siehst du hier Kontostand, Puffer, Ampel und den Weg zum Payout.'`; Knopf `${I.plus} Konto anlegen` → `${I.plus} Prop-Konto anlegen` (Titel „Noch keine Prop-Konten“ bleibt, proptest.js:20) | wording-35, wording-34, wording-32 |
| 12.7 | prop.js:86–87 Kachel | Summe je Währung: `const byCur = new Map(); for (const a of active) { const c = a.currency \|\| ''; byCur.set(c, (byCur.get(c) \|\| 0) + evalOf(a).ev.pnl); }`; Wert `[...byCur].map(([c, v]) => U.pnl(v, '', c ? { currency: c } : {})).join(' <span class="muted">·</span> ')`; Titel `'P&L aktive Konten'` → `'P&L der aktiven Konten'` | bereich_prop-5, wording-36 |
| 12.8 | prop.js:98 Puffer | `` `noch ${b.stops} Stop-Loss${b.stops === 1 ? '' : 'es'}` `` → `` `reicht für ${b.stops} Stop${b.stops === 1 ? '' : 's'}` `` | wording-33 |
| 12.9 | prop.js:102 Karte | Caption `Balance` → `Kontostand`; `U.pnl(ev.pnl)` → `U.pnl(ev.pnl, '', { currency: a.currency })`; `${ev.n} Trades` → `${U.count(ev.n, 'Trade', 'Trades')}` | wording-32, bereich_prop-5, zustaende-28 |
| 12.10 | prop.js:104 Meta | `const pt = planText(a, ev, plan, !!(ev.target && a.phase !== 'funded'));` und die kv-Zeile „Bestehen“/„Nächster Payout“ nur, wenn `pt`; Tooltip `${fmt.cur(stopSize)} je Stop-Loss` → `${money(a, stopSize)} je Stop` | wording-31, bereich_prop-5, wording-33 |
| 12.11 | prop.js:123 | `sub: 'bestanden, geplatzt oder archiviert'` → `sub: 'Bestanden, geplatzt oder archiviert'` | wording-37 |
| 12.12 | prop.js:133 Trades zuordnen | `Ältere Trades ordnest du im Trade-Editor zu.` → `Ältere Trades ordnest du über „Trade bearbeiten“ zu.` | wording-61 |
| 12.13 | prop.js:143 `modeSel` | `[['abs', unitLabel('Betrag')], ['pct', '% der Startbalance']]` → `[['abs', unitLabel('Betrag', o.currency)], ['pct', '% des Startkapitals']]` | bereich_prop-38, wording-32 |
| 12.14 | prop.js:153 | `F('Mindestbalance', …)` → `F('Mindest-Kontostand', …)` | wording-32 |
| 12.15 | prop.js:191 / :216 / :217 | `<label for="pa-name">Konto (z. B. 50K)</label><input … id="pa-name" …>` → `<label for="pa-name">Konto</label><input … id="pa-name" placeholder="z. B. 50K" …>`; ebenso :217 (`pp-name`); :216 Firma bekommt `placeholder="z. B. Topstep"` | bereich_prop-53 |
| 12.16 | prop.js:194 Währungshinweis | `Balance, Limits und Puffer in Kontowährung. Trade-P&L bleibt in der Journal-Währung.` → `Kontostand, P&L, Limits und Puffer in Kontowährung. In Trade-Listen bleibt die Journal-Währung.` | bereich_prop-5, wording-32 |
| 12.17 | prop.js:194/:21x Währungswechsel | `#pa-cur` und `#pp-cur` bekommen `data-change="prop-cur"`. Neue Aktion `'prop-cur'(el) { const f = el.form; ['dl_mode', 'dd_mode', 'pt_mode'].forEach(n => { const o = f.querySelector(\`select[name="${n}"] option[value="abs"]\`); if (o) o.textContent = unitLabel('Betrag', el.value); }); }`; `fillAccountForm` ruft sie nach `set('currency', …)` auf | bereich_prop-38 |
| 12.18 | prop.js:198 | `<label for="pa-sb">Startbalance</label>` → `<label for="pa-sb">Startkapital</label>` | wording-32 |
| 12.19 | prop.js:203 / :225 `rulesFields`-Aufrufe | `{ tz: s.tz }` → `{ tz: s.tz, currency: s.currency }`; `{ fees: s.fees \|\| {}, disabled: ro }` → `{ fees: s.fees \|\| {}, disabled: ro, currency: s.currency }` | bereich_prop-38 |
| 12.20 | prop.js:242 Stop-Größe | Hinweis `Bestimmt „noch X Stop-Losses“.` → `Bestimmt, für wie viele Stops der Puffer reicht.` | wording-33 |
| 12.21 | prop.js:258 Pro Firma | Unterzeile → `${f.received > C.EPS ? \`${fmt.cur(f.spent)} Ausgaben · ${fmt.cur(f.received)} Payouts · ROI ${f.roi == null ? '—' : fmt.pct(f.roi, 0, true)}\` : \`${fmt.cur(f.spent)} Ausgaben · noch keine Payouts\`}` | bereich_prop-24 |
| 12.22 | prop.js:267 Payout-Zeile | `<button type="button" class="btn xs" data-action="prop-payout-received" data-id="${esc(p.id)}">Erhalten</button> ` → `<button type="button" class="btn ghost icon sm" data-action="prop-payout-received" data-id="${esc(p.id)}" aria-label="Als erhalten markieren" data-tip="Als erhalten markieren">${I.check}</button>` (Leerzeichen danach entfällt) | bereich_prop-20 |
| 12.23 | prop.js:268 und :286 Spaltenköpfe | `<th>Beantragt</th><th>Erhalten</th>` → `<th>Beantragt am</th><th>Erhalten am</th>` | bereich_prop-20 |
| 12.24 | prop.js:279 Planer-Banner | `(Mindest-Handelstage, Mindestgewinn oder Mindestbalance)` → `(Mindest-Handelstage, Mindestgewinn oder Mindest-Kontostand)` | wording-32 |
| 12.25 | prop.js:283 Bedingungen | Handelstage: offen → `${n} von ${o.minDays} <span class="warn">· noch ${plan.missingDays}</span>` (unverändert); erfüllt → `${n} <span class="muted">(mind. ${o.minDays})</span> <span class="pos">· erfüllt</span>`; ohne Vorgabe unverändert. Profit Target/Gewinn: `U.pnl(ev.pnl)` → `U.pnl(ev.pnl, '', { currency: a.currency })`, alle `fmt.cur(…)` → `money(a, …)`; erfüllt → `<span class="muted">(mind. ${money(a, o.minProfit)})</span> <span class="pos">· erfüllt</span>`, offen weiter mit „von“. kv `'Mindestbalance'` → `'Mindest-Kontostand'`, `fmt.balance(ev.balance)` → `fmt.balance(ev.balance, { currency: a.currency })`, gleiches Muster „(mind. …)“ wenn erfüllt | bereich_prop-31, bereich_prop-5, wording-32 |
| 12.26 | prop.js:284 Vorschlag | `fmt.cur(plan.suggestion.perDay)`, `fmt.cur(plan.suggestion.total)` → `money(a, …)` | bereich_prop-5 |
| 12.27 | prop.js:294 Kopfreihe | `<button type="button" class="btn" data-action="prop-account-new">${I.plus}<span class="hide-m">Prop-Konto</span></button>` → `<button type="button" class="btn" data-action="prop-account-new" aria-label="Prop-Konto anlegen">${I.plus}<span class="hide-m">Prop-Konto anlegen</span></button>` | wording-34 |
| 12.28 | prop-friedhof.js:56 | `` `${fmt.num(avgLife, 0)} Tage` `` → `U.count(Math.round(avgLife), 'Tag', 'Tage')` | zustaende-28 |
| 12.29 | prop-friedhof.js:136 Grabstein | `${t.size > 0 ? fmt.balance(t.size) : '—'}${t.market ? \` · ${marketLabel(t.market)}\` : ''}` → `${[!t.name && t.size > 0 ? \`${fmt.int(t.size / 1000)}K\` : '', t.market ? marketLabel(t.market) : ''].filter(Boolean).join(' · ') \|\| '—'}` | bereich_prop-46 |
| 12.30 | coupons.js:13 | `'Rabatt-Codes für Prop Firms erscheinen hier.'` → `'Coupon-Codes für Prop Firms erscheinen hier.'` | wording-55 |

### Schritt 13 · `web/js/screens/affiliate.js`

| # | Stelle | vorher → nachher | ids |
|---|---|---|---|
| 13.1 | nach Z. 16 | – → `const moneyK = v => fmt.cur(v, { money: true, compact: true, currency: AD.CURRENCY });` | wording-53 |
| 13.2 | Z. 57 Kacheln | `money(all.revenue)`, `money(all.earned)`, `money(all.open)` → `moneyK(…)` | wording-53 |
| 13.3 | Z. 58 Tabellenkopf | `<th class="r">Provision</th><th class="r">Verdient</th>` → `<th class="r">Satz</th><th class="r">Provision</th>`; am Knopf `.aff-pct`: `data-tip="Provision ändern"` → `data-tip="Satz ändern"`, `aria-label="Provision von ${…} ändern"` → `aria-label="Satz von ${…} ändern"` | bereich_konto-30 |
| 13.4 | Z. 59 Info | `'Verdient = Umsatz × Provision. Offen = Provisionen des laufenden Monats.'` → `'Provision = Umsatz × Satz. Offen = Provisionen des laufenden Monats.'` | bereich_konto-30 |
| 13.5 | Z. 65 Creator-Kacheln | `money(s.earned)`, `money(s.open)` → `moneyK(…)`; `U.tile('Provision', …)` → `U.tile('Provisionssatz', …)` | bereich_konto-30, wording-53 |
| 13.6 | Z. 67 Kundenliste | `<th class="ph-hide">Über</th>` → `<th class="ph-hide">Quelle</th>` (Spalte „Provision“ in € bleibt) | bereich_konto-30 |
| 13.7 | Z. 91 / 92 / 96 / 98 Dialog | `<h2>Provision</h2>` → `<h2>Provisionssatz</h2>`; Label `Provision in %` → `Satz in %`; Toast `'Bitte 0 bis 100 % angeben'` → `'Bitte einen Satz von 0 bis 100 % angeben'`; `'Provision gespeichert'` → `'Provisionssatz gespeichert'` | bereich_konto-30 |

### Schritt 14 · `web/js/screens/notebook.js` und `web/js/editor.js`

| # | Stelle | vorher → nachher | ids |
|---|---|---|---|
| 14.1 | notebook.js:52 | `${I.folder} Ordner hinzufügen` → `${I.folder} Ordner anlegen` | bereich_notebook_news-29 |
| 14.2 | notebook.js:57 | `<span class="grow">Kürzlich gelöscht</span>` → `<span class="grow">Papierkorb</span>` | bereich_notebook_news-27 |
| 14.3 | notebook.js:61 und :63 | `'Tag loggen'` → `'Tagesnotiz anlegen'` (Knopf und Leertext „Lege mit „…“ los.“) | bereich_notebook_news-27 |
| 14.4 | notebook.js:62 | `'Notizen antippen'` → `'Notizen auswählen'` | bereich_notebook_news-27 |
| 14.5 | notebook.js:74 •••-Menü | `${I.upload} Aus Datei laden` → `${I.upload} Aus JSON importieren`; `${I.download} Exportieren (JSON)` → `${I.download} Als JSON exportieren`; `${I.download} Als PDF herunterladen` → `${I.printer} Als PDF drucken`; Teilen-Tooltip `data-tip="Nur-Lese-Link erzeugen"` → `data-tip="Link zum Lesen erstellen"` | bereich_notebook_news-29 |
| 14.6 | notebook.js:116 Dialogtitel | `'Ordner hinzufügen'` → `'Ordner anlegen'` | bereich_notebook_news-29 |
| 14.7 | notebook.js:119 Dialogtitel | `${tpl ? 'Vorlage bearbeiten' : 'Vorlage hinzufügen'}` → `${tpl ? 'Vorlage bearbeiten' : 'Vorlage anlegen'}` | bereich_notebook_news-28 |
| 14.8 | notebook.js:141 / 142 / 149 / 162 | `` `${nb.selected.length} Notizen verschoben` `` → `` `${U.count(nb.selected.length, 'Notiz', 'Notizen')} verschoben` ``; ebenso `… löschen?` (142), `… endgültig löschen?` (149); Z. 162 `Alle ${n} Notizen darin werden …` → `${n === 1 ? 'Die Notiz darin wird' : \`Alle ${n} Notizen darin werden\`} mit gelöscht …` | zustaende-28 |
| 14.9 | notebook.js:143 | `U.toast('Verschoben', 'ok')` → `U.toast('Notiz verschoben', 'ok')` | bereich_notebook_news-27 |
| 14.10 | editor.js:117 „+“-Menü | `item('text', E.para, 'Absatz')` → `item('text', E.para, 'Text')`; `item('details', E.toggle, 'Aufklappbare Liste')` → `item('details', E.toggle, 'Aufklappbarer Abschnitt')` und aus der Spalte „Listen“ hinter `item('quote', E.quote, 'Zitat')` in „Grundbausteine“ verschieben | bereich_notebook_news-28 |
| 14.11 | editor.js:118 und :211 | `'Aufklappbare Liste'` → `'Aufklappbarer Abschnitt'` (BLOCKS Z. 107 bleibt) | bereich_notebook_news-28 |

### Schritt 15 · Server-Texte: `web/js/screens/news.js`, `web/js/screens/mentor.js`, `web/js/screens/coach.js`, `web/js/coach.js`, `web/js/voice.js`, `web/js/screens/ruhepunkt.js`

| # | Stelle | vorher → nachher | ids |
|---|---|---|---|
| 15.1 | news.js:28 | `'Der Server ist nicht erreichbar. Prüf die Adresse unter Einstellungen → Mentor.'` → `'Der Journalyst-Server ist nicht erreichbar. Prüfe deine Verbindung und die Adresse unter Einstellungen → Server.'` | bereich_notebook_news-46, wording-14 |
| 15.2 | news.js:29 | `'Zugangstoken fehlt oder ist falsch (Einstellungen → Mentor).'` → `'Zugangstoken fehlt oder ist falsch. Prüfe es unter Einstellungen → Server.'` | bereich_notebook_news-46, wording-14 |
| 15.3 | news.js:91 Banner | `<b>Beispielansicht.</b> Echte Termine kommen über deinen Journalyst-Server (derselbe wie für den Mentor). <span class="muted">Die Beispiele haben keine Prognose- oder Vorwerte.</span>` → `<b>Beispielansicht.</b> Echte Termine kommen über deinen Journalyst-Server.` (Knopf „Server einrichten“ bleibt; Präfix „Beispiel: “ in Z. 40 bleibt) | bereich_notebook_news-45, wording-14 |
| 15.4 | mentor.js:17 | `'Der Mentor-Server ist nicht erreichbar. Prüf die Adresse unter Einstellungen → Mentor und deine Verbindung.'` → Text aus 15.1 | wording-14, bereich_notebook_news-46 |
| 15.5 | mentor.js:79 | `<p class="muted">Der Mentor läuft über deinen eigenen Server, damit der API-Schlüssel nie im Browser landet. Trag unter Einstellungen → Mentor die Server-Adresse und das Zugangstoken ein.</p>` → `<p class="muted">Der Mentor läuft über deinen Journalyst-Server, damit der API-Schlüssel nie im Browser liegt. Trage unter Einstellungen → Server die Adresse und das Zugangstoken ein.</p>`; Knopf `Zu den Einstellungen` → `Server einrichten`; `<div class="small faint" style="margin-top:14px">Anleitung zum Server: <code>server/README.md</code> im Projekt.</div>` ersatzlos streichen (h2 bleibt) | bereich_training-35, wording-14 |
| 15.6 | coach.js (screens):22 | `<h2>Coach Mode einrichten</h2><p class="muted">Coach Mode läuft über denselben Server wie der Mentor-Chat. Trag unter Einstellungen → Mentor die Server-Adresse und das Zugangstoken ein; danach kannst du hier Gruppen anlegen oder einer Gruppe beitreten.</p>…${I.settings} Zu den Einstellungen` → `<h2>Coach einrichten</h2><p class="muted">Teile deine Notizen mit deinem Mentor oder betreue selbst eine Gruppe. Dafür trägst du einmal die Adresse und das Zugangstoken deines Journalyst-Servers unter Einstellungen → Server ein.</p>…${I.settings} Server einrichten` (href bleibt `#/settings/mentor`) | bereich_konto-42, bereich_training-35, wording-14 |
| 15.7 | coach.js:54 | `Was der Mentor sieht` → `Was dein Mentor sieht` (wie Fenstertitel :294) | bereich_konto-42 |
| 15.8 | coach.js:58 | `<span>Dein Name im Coach Mode:</span>` → `<span>Dein Name in Gruppen:</span>` | bereich_konto-42 |
| 15.9 | coach.js:74 Mailhinweis | `<div class="small warn coach-mailhint">Auf dem Server ist kein E-Mail-Versand eingerichtet (COACH_SMTP_HOST, siehe server/README.md). Die Adresse wird gespeichert, Mails gehen aber erst raus, wenn der Versand eingerichtet ist.</div>` → `<div class="small muted coach-mailhint">Dein Journalyst-Server verschickt noch keine E-Mails. Die Adresse wird gespeichert, Mails kommen, sobald der Versand eingerichtet ist.</div>` | bereich_konto-16 |
| 15.10 | coach.js:86 Aufgaben-Zelle | `<span>${r.open_tasks === 1 ? '1 offen' : \`${r.open_tasks} offen\`}</span><div class="sub">${\`von ${r.tasks}\`}</div>` → `<span>${r.open_tasks} von ${r.tasks} offen</span>` (Erledigt-Zweig unverändert) | bereich_konto-43 |
| 15.11 | coach.js:96 / :113 / :121 | `U.tile('Ø Winrate', …)` → `U.tile('Ø Trefferquote', …)`; `<th class="r">Winrate</th>` → `<th class="r">Trefferquote</th>`; Info `'Pro Schüler: Trades, Winrate, …'` → `'Pro Schüler: Trades, Trefferquote, …'` | wording-3 |
| 15.12 | coach.js:99 Journal-Kachel | `${gs.notes === 1 ? '1 Notiz von euch' : \`${gs.notes} Notizen von euch\`}` → `${U.count(gs.notes, 'Mentor-Notiz', 'Mentor-Notizen')}` (bei F1 = Ja: „Coach-Notiz/-Notizen“) | bereich_konto-43, zustaende-28 |
| 15.13 | coach.js:101 | `<span class="small muted">nur für Mentoren</span>` ersatzlos streichen (Info daneben sagt es) | bereich_konto-43 |
| 15.14 | coach.js:121 | `Kurz-Stats nur in R und Prozent${g && g.period_start ? \` · ab ${…}\` : ''}` → `${g && g.period_start ? \`Daten ab ${esc(fmt.dateFull(C.parseDayKey(g.period_start)))}\` : ''}` | bereich_konto-43 |
| 15.15 | coach.js:137 Journal-Eintrag | `<span class="small muted no-i18n">${esc(fmt.dateTime(e.updated_at))}</span>` → `${e.updated_at && C.dayKey(new Date(e.updated_at)) !== e.date_key ? \`<span class="small muted ce-edited"><span>bearbeitet</span> <span class="no-i18n">${esc(fmt.dateTime(e.updated_at))}</span></span>\` : ''}` | bereich_konto-21 |
| 15.16 | js/coach.js:41 | `'Der Server ist nicht erreichbar. Prüf die Adresse unter Einstellungen → Mentor und deine Verbindung.'` → Text aus 15.1 | wording-14, bereich_notebook_news-46 |
| 15.17 | voice.js:18 | `'Mentor-Server nicht eingerichtet'` → `'Journalyst-Server nicht eingerichtet'` | wording-14 |
| 15.18 | voice.js:72 | `Ohne Mentor-Server wird nur das Transkript gespeichert. Adresse unter Einstellungen → Mentor.` → `Ohne Journalyst-Server wird nur das Transkript gespeichert. Die Adresse trägst du unter Einstellungen → Server ein.` | wording-14 |
| 15.19 | voice.js:103 | `… richte den Mentor-Server ein.` → `… richte den Journalyst-Server ein.` | wording-14 |
| 15.20 | ruhepunkt.js:776 | `'Speichern hat nicht geklappt. Prüf deine Verbindung und versuch es noch einmal.'` → `'Speichern hat nicht geklappt. Prüfe deine Verbindung und versuche es noch einmal.'` | bereich_notebook_news-46 |
| 15.21 | Kommentare js/coach.js:1 und voice.js:2 | „Mentor-Server“ → „Journalyst-Server“ (nur Kommentar, damit die grep-Prüfung 4.1 auf 0 kommt) | wording-14 |

### Schritt 16 · `web/js/certificate.js`

| # | Stelle | vorher → nachher | ids |
|---|---|---|---|
| 16.1 | Z. 60 `menuHTML` | `[['day', 'Tag', day], ['week', 'Woche', day], ['month', 'Monat', …], ['stats', 'Stats', 'range']].map(([k, l, ref]) => \`<button … data-kind="${k}" data-ref="${ref}">${D.KINDS[k].title.replace(' Certificate', '')}<span class="muted small" style="margin-left:auto">${l}</span></button>\`)` → `[['day', 'Tag', day], ['week', 'Woche', day], ['month', 'Monat', …], ['stats', 'Zeitraum', 'range']].map(([k, l, ref]) => \`<button type="button" class="item" data-action="cert-open" data-kind="${k}" data-ref="${ref}">${l}<span class="muted small" style="margin-left:auto">${esc(D.period(k, resolveRef(k, ref)).short)}</span></button>\`)` (`resolveRef` ist eine Funktionsdeklaration in Z. 62 und damit verfügbar; `certdata.js` bleibt unverändert) | wording-45, bereich_dashboard-29 |
| 16.2 | Z. 85 | `` ` · ${fmt.int(m.n)} Trades` `` → `` ` · ${U.count(m.n, 'Trade', 'Trades')}` `` | zustaende-28 |
| 16.3 | Z. 87 | `toggle('user', 'Username anzeigen')` → `toggle('user', 'Benutzername anzeigen')` | bereich_dashboard-29 |
| 16.4 | Z. 76 Tagesfeld | keine Codeänderung, das Overlay aus Schritt 4 zeigt „11.10.2026“; die Zeile „Sonntag, 11. Oktober 2026“ bleibt | bereich_dashboard-28 |

### Schritt 17 · `web/js/screens/misc.js`, `web/js/theme.js`, `web/js/store.js` (Einstellungen)

| # | Stelle | vorher → nachher | ids |
|---|---|---|---|
| 17.1 | misc.js:8 Reiter | `['mentor', 'Mentor', 'chat']` → `['mentor', 'Server', 'chat']`; `['logs', 'Logs', 'clock']` → `['logs', 'Verlauf', 'clock']` (Schlüssel und Routen bleiben) | wording-14, wording-60 |
| 17.2 | misc.js:60 Privatsphäre | Untertitel `So gehen wir mit deinen Daten um.` → `Wer außer dir dein Journal sehen darf.`; Titel `Support-Team Zugriff auf mein Konto erlauben` → `Support-Team-Zugriff erlauben`; Text `Wenn aktiviert, kann das Support-Team auf dein Konto zugreifen, um dir besser zu helfen und Fehler zu finden.` → `Ist das an, darf das Support-Team dein Journal einsehen, um dir zu helfen und Fehler zu finden.` (Schalter und „Speichern“ bleiben bis F2) | wording-17, wording-25 |
| 17.3 | misc.js:62 2FA | Beschreibung `Zusätzliche Sicherheit für dein Konto über eine Authenticator-App (z. B. Google Authenticator, Authy).` → `Schützt die Anmeldung mit einer Authenticator-App (z. B. Google Authenticator, Authy). Verfügbar, sobald es Benutzerkonten gibt.`; Knopf `class="btn primary sm" data-action="twofa"` → `class="btn sm" data-action="twofa"` (Text und Dialog bleiben) | wording-18 |
| 17.4 | misc.js:65 Sicherung | `<b>Sicherung einspielen</b>` → `<b>Sicherung importieren</b>`; Hilfe `JSON-Datei aus einem Export. „Zusammenführen“ behält vorhandene Daten.` → `JSON-Datei aus einem Export. „Zusammenführen“ behält deine vorhandenen Daten, „Ersetzen“ überschreibt sie.` | wording-22 |
| 17.5 | misc.js:66 Beispieldaten | Hilfetext → `` `Rund 170 Trades über vier Monate (vor allem NQ und ES) mit Check-ins, Notizen, Sprachnotizen und Regeln, dazu vier Prop-Konten${App.on('replay') ? ' und Replay-Screenshots' : ''}. Schaltet im Schatten-Ich drei Vorschlagsregeln ein, wenn noch keine aktiv ist. Beim Entfernen bleiben deine eigenen Trades, Check-ins und Regeln erhalten.` `` (beide Fassungen als Schlüssel) | wording-21 |
| 17.6 | misc.js:68 | `Entfernt alle Daten aus diesem Browser. Vorher exportieren!` → `Löscht alle Daten in diesem Browser. Exportiere vorher eine Sicherung.` | wording-19 |
| 17.7 | misc.js:69 Fußzeile | ganze Zeile → `<div class="small faint">Deine Daten liegen nur in diesem Browser.${S.storageOK ? '' : ' <span class="neg">Speichern ist gerade nicht möglich (privates Fenster oder blockierte Website-Daten).</span>'}</div><div class="small faint">Tastenkürzel: <b>N</b> Trade loggen · <b>1–9</b> Bereich wechseln · <b>Esc</b> Dialog schließen</div>` | wording-20, bereich_shell-32 |
| 17.8 | misc.js:108 Meine Designs | `${I.plus} Aktuelles speichern` → `${I.plus} Design speichern` (Titel „Meine Designs“ bleibt) | wording-24 |
| 17.9 | misc.js:142 / 144 / 145 Design | `'Erscheinungsbild, Schrift und Farben. Wirkt sofort auf die ganze Website.'` → `'Erscheinungsbild, Schrift und Farben. Gilt sofort überall, auch auf der Startseite.'`; `Gilt für Text und Zahlen auf der ganzen Website.` → `Gilt für Text und Zahlen.`; `Buttons, aktive Einträge und Diagramme.` → `Hauptknöpfe, Schalter, Markierungen und Diagramme.` | wording-23 |
| 17.10 | misc.js:146 | `<button type="button" class="btn sm ghost" data-action="color-reset" style="margin-left:auto">${I.close} Standardfarben</button>` → `<button type="button" class="btn sm ghost" data-action="color-reset" style="margin-left:auto;color:var(--muted)">Auf Standard zurücksetzen</button>` | wording-24 |
| 17.11 | misc.js:154 Server-Kopf | `head('Mentor', 'Dein Trading-Psychologie-Mentor läuft über einen eigenen Server, damit der API-Schlüssel nie im Browser landet.')` → `head('Server', 'Mentor, Coach, News und die Auswertung von Sprachnotizen laufen über deinen Journalyst-Server. Der API-Schlüssel bleibt dort und nie im Browser.')` (Felder Z. 156–157 mit Pfaden und Platzhaltern bleiben, das ist der Server-Bereich, W11) | wording-14 |
| 17.12 | misc.js:161 „So funktioniert es“ | Absatz 3 je nach Fall: `const p = S.settings.profile \|\| {};` → Benutzername gesetzt: `Nutzerkennung: <b>${esc(p.username)}</b> (Benutzername aus dem Profil).`; nur E-Mail: `Nutzerkennung: <b>${esc(p.email)}</b> (E-Mail aus dem Profil). Lege im Profil einen Benutzernamen fest, um sie zu ändern.`; sonst: `Nutzerkennung: <b>${esc(S.userId())}</b> (Gerätekennung). Lege im Profil einen Benutzernamen fest, um sie zu ändern.` Absatz 4 `Derselbe Server trägt auch den <a href="#/coach">Coach Mode</a> (Gruppen, Journal-Ansicht und Notizen des Mentors). Dafür legt Journalyst einen eigenen geheimen Schlüssel an, der nur auf diesem Gerät liegt.` → `Für <a href="#/coach">Coach</a> legt Journalyst zusätzlich einen geheimen Schlüssel an, der nur auf diesem Gerät liegt.` (Absätze 1 und 2 bleiben; „Tageslimit“ dort = Nachrichtenkontingent, bleibt) | bereich_einstellungen-46, wording-14 |
| 17.13 | misc.js:169 Recaps | `<h3 …>Performance-Recaps</h3><div class="small muted">Zusammenfassungen deiner Performance. Sie erscheinen als Hinweis oben auf dem Dashboard.</div>` → `<h3 …>Recaps</h3><div class="small muted">Zusammenfassungen deiner Trades. Sie erscheinen als Hinweis oben auf dem Dashboard.</div>` | wording-11 |
| 17.14 | misc.js:170 | `switchRow('Wöchentlicher Performance-Recap', 'Jeden Montag eine Zusammenfassung deiner Trading-Performance der Vorwoche. Wird ausgelöst, wenn bis Sonntag mindestens 4 geschlossene Trades geloggt wurden.', …)` → `switchRow('Wochen-Recap', 'Jeden Montag eine Zusammenfassung der Vorwoche, wenn du darin mindestens 4 Trades geschlossen hast.', …)` | wording-11, wording-12 |
| 17.15 | misc.js:171 | `switchRow('Monatlicher Performance-Recap', 'Am 2. jedes Monats eine Zusammenfassung des Vormonats. Wird ausgelöst, wenn bis zum 1. des Monats mindestens 4 geschlossene Trades geloggt wurden.', …)` → `switchRow('Monats-Recap', 'Am 2. jedes Monats eine Zusammenfassung des Vormonats, wenn du darin mindestens 4 Trades geschlossen hast.', …)` | wording-11, wording-12 |
| 17.16 | misc.js:186 Konten | `Die Kontogröße bestimmt Tageslimit, Score-Drawdown und Monte Carlo.` → `Die Kontogröße bestimmt Tagesverlustlimit, Score-Drawdown und Monte Carlo.` | wording-10 |
| 17.17 | misc.js:192 | `head('Trading', 'Passe dein Trading-Erlebnis an.')` → `head('Trading', 'Märkte, Break-even-Bereich, Geld-blind-Modus, Risiko und Warnungen.')` | wording-26 |
| 17.18 | misc.js:193 | `<h3>Was handelst du?</h3>` → `<h3>Märkte</h3>` | wording-27 |
| 17.19 | misc.js:197 Geld-blind | `switchRow('Geld-blind-Modus', 'Blendet überall alle Geldbeträge aus und zeigt stattdessen R-Multiples (z. B. „+2,1 R“). Der Kontostand wird komplett ausgeblendet. Trades ohne Stop zeigen „– R“.', 'blind-toggle', …)` → `switchRow('Beträge als R zeigen', 'Zeigt R-Multiples statt Geldbeträgen (z. B. „+2,1 R“) und blendet den Kontostand aus. Trades ohne Stop zeigen „– R“.', 'blind-toggle', …)` (h3 „Geld-blind-Modus“ und Toast Z. 337 bleiben) | wording-28, bereich_einstellungen-34 |
| 17.20 | misc.js:199 | Label `Ruin-Schwelle Monte Carlo (% Drawdown)` → `Ruin-Schwelle für Monte Carlo (% Drawdown)`; Option `<option ${st.mcRuns === n ? 'selected' : ''}>${n}</option>` → `<option value="${n}" ${st.mcRuns === n ? 'selected' : ''}>${fmt.int(n)}</option>` (das `value` ist Pflicht, sonst speichert `Number('1.000')` den Wert 1, misc.js:335) | wording-29 |
| 17.21 | misc.js:200 Tilt-Warnungen | `… Revenge-Trades und erreichtem Tageslimit.` → `… Revenge-Trades und erreichtem Tagesverlustlimit.` | wording-10 |
| 17.22 | misc.js:207 Regeln | `'Deine Handelsregeln. Sie erscheinen im Trade-Editor, beim Session-Ende, im Fortschritt und im Regel-Tracker.'` → `'Deine Handelsregeln. Sie erscheinen in „Plan & Bewertung“ eines Trades, beim Session-Ende, im Fortschritt und im Regel-Tracker.'` | wording-61 |
| 17.23 | misc.js:250 Unterreiter | `[['imports', 'Imports'], ['verlauf', 'Verlauf']]` → `[['imports', 'Importe'], ['verlauf', 'Änderungen']]` | wording-60 |
| 17.24 | misc.js:255 | `<b>Noch keine Imports</b><span class="small">CSV-Importe und eingespielte Sicherungen erscheinen hier.</span>` → `<b>Noch keine Importe</b><span class="small">CSV-Importe und importierte Sicherungen erscheinen hier.</span>` | wording-60, wording-22 |
| 17.25 | misc.js:260 | `<b>Noch kein Verlauf</b>` → `<b>Noch keine Änderungen</b>` | wording-60 |
| 17.26 | misc.js:262 | `head('Logs', 'Import- und Änderungsverlauf deines Journals.')` → `head('Verlauf', 'Importe und Änderungen in deinem Journal.')` | wording-60 |
| 17.27 | misc.js:365 Sicherung-Dialog | Knopf `>Einspielen</button>` → `>Importieren</button>`; Toast `` `Sicherung eingespielt (${r.trades} Trades)` `` → `` `Sicherung importiert (${U.count(r.trades, 'Trade', 'Trades')})` `` | wording-22, zustaende-28 |
| 17.28 | theme.js:10–13 `FONTS.desc` | modern `'Standard: klar und modern, Zahlen in Onest'` → `'Satoshi · Zahlen in Onest'`; geschwungen `'Leicht und geschwungen, Zahlen in Onest'` → `'Quicksand · Zahlen in Onest'`; rund `'Weiche, runde Formen'` → `'Nunito · auch für Zahlen'`; klassisch `'Klar und neutral, Zahlen in Roboto'` → `'Systemschrift · Zahlen in Roboto'` | bereich_einstellungen-45 |
| 17.29 | store.js:371 Willkommensnotiz | `… eine Sicherung exportieren und wieder einspielen.` → `… eine Sicherung exportieren und wieder importieren.` (wirkt nur für neue Notizen) | wording-22 |
| 17.30 | store.js:134 / :281 Verlaufseinträge | `` `${e.file || ''} · ${e.count || 0} Trades` `` → `` `${e.file || ''} · ${U.count(e.count || 0, 'Trade', 'Trades')}` `` nur, wenn `root.UI` geladen ist, sonst wie bisher; ebenso :281 (`${g.trades.length} Trades`) | zustaende-28 |

### Schritt 18 · `web/js/lang/{en,es,hi,pt,zh}.js` und `web/e2e/i18n`

1. Für jede Zeile der Schritte 1–17 mit geändertem deutschem Text Regel 1.5 anwenden. Bekannte umzubenennende Schlüssel (Auswahl, Zeilen in en.js): „Win-Rate“ (767), „Winrate“, „Ø Winrate“, „Ø Tages-Win-Rate“, „Ø Trade-Gewinn/Verlust“, „Netto P&L“ (760), „Profil vervollständigen“ (927), „{0} von {1} eingehalten“ (358), „% Regeln eingehalten“ (501), „Mit allen Regeln eingehalten“ (548), „Equity: echt vs. Schatten-Ich“ (551), „Mein Regelwerk“, „Stopp nach Verlusten in Folge“ (+ „: Verluste“), „P&L aktive Konten“ (613), „Bestanden, geplatzt oder archiviert“ (938, klein → groß), „noch {0} Stop-Losses“, „noch 1 Stop-Loss“, „{0} Puffer / {1} je Stop-Loss“, „Coach Mode einrichten“, „Rabatt-Codes für Prop Firms erscheinen hier.“ (1381), „Kürzlich gelöscht“, „Aufklappbare Liste“, „Check-in nachtragen“, „Wochen-Recap“, „Neuer Performance-Recap“, „Trade speichern“ (entfällt), „Standardfarben“ (entfällt), „{0} Notiz von euch“ (1325), „{0} Notizen von euch“ (1326), „Kurz-Stats nur in R und Prozent · ab {0}“.
2. Neue Einzahl-Muster: „{0} Trade“, „{0} Tag“, „{0} Handelstag“, „{0} Notiz“, „{0} Gewinn“, „{0} Verlust“, „{0} Mentor-Notiz“ samt der zusammengesetzten Muster („{0} von {1} Trade“, „{0} – {1} von {2} Trade“, „{0} Trade · {1} Handelstag“ …).
3. Neue Etappe-1-Schlüssel zusätzlich nach `web/e2e/i18n/<lang>/part-audit-wording.json`.

### Schritt 19 · Tests anpassen (`web/e2e`, `web/tests`)

| Datei:Zeile | vorher → nachher | ids |
|---|---|---|
| e2e/scorestatetest.js:10 | `/Win-Rate/.test(sc.labels)` → `/Trefferquote/.test(sc.labels)` | wording-3 |
| e2e/usercardtest.js:11 | `'Trader / Profil vervollständigen'` → `'Trader / Profil ergänzen'` (auch Meldung) | bereich_shell-34 |
| e2e/rptest.js:9 | `'Übersicht,Journal,Training,Konten'` → `'Übersicht,Journal,Training,Prop Trading'` (auch Meldung) | bereich_shell-33 |
| e2e/settest.js:10 | `['logs', 'Logs']` → `['logs', 'Verlauf']` | wording-60 |
| e2e/mentortest.js:24 | `.includes('Mentor')` → `.includes('Server')` | wording-14 |
| e2e/coachtest.js:37 | `=== 'Coach Mode einrichten'` → `=== 'Coach einrichten'` | bereich_konto-42 |
| e2e/coachtest.js:135 | `taskCell === '1 offen von 2'` → `taskCell === '1 von 2 offen'` | bereich_konto-43 |
| e2e/coachlang.js:11/12 | Probe `I18N.t('Kurz-Stats nur in R und Prozent · ab 01.10.2026')` → `I18N.t('Daten ab 01.10.2026')`, Prüfung `!pat[2].startsWith('Kurz-Stats')` → `!pat[2].startsWith('Daten ab')` | bereich_konto-43 |
| e2e/coachlang.js:14 | `h2 !== 'Coach Mode einrichten'` → `h2 !== 'Coach einrichten'` | bereich_konto-42 |
| e2e/proptest.js:56 | `card.pnl.includes('€')` → `card.pnl.includes('$')`; `/noch \d+ Stop-Loss/` → `/reicht für \d+ Stop/`; `card.meta.includes('Bestehen')` → `card.meta.includes('Puffer') && !/Gewinn fehlt/.test(card.meta)`; Kommentar Z. 55 anpassen | bereich_prop-5, wording-33, wording-31 |
| e2e/proptest.js:57 | `` `noch ${ev.buffer.stops} Stop-Loss` `` → `` `reicht für ${ev.buffer.stops} Stop` `` | wording-33 |
| e2e/proptest.js:103 | `/in \d+ Handelstag\|Gewinn fehlt\|bereit\|Consistency/` → `/in \d+ Handelstag\|Gewinn fehlen\|bereit\|Consistency/` | wording-31 |
| e2e/proptest.js:116 | `'/ 150,00 € je Stop-Loss'` → Erwartung über `UI.fmt.cur(150, { currency: acc.currency })` + `' je Stop'` | bereich_prop-5, wording-33 |
| e2e/friedhoftest.js:122 | „Fix 3“: für das Konto ohne Größe und Namen genau `'Futures'` (bzw. Marktname) erwarten, nicht `startsWith('—')` | bereich_prop-46 |
| e2e/friedhoftest.js:129 | „Fix 4“: nur noch prüfen, dass im Geld-blind-Modus weder R-Wert noch €/$ in der Unterzeile steht (nicht `includes('ausgeblendet')`) | bereich_prop-46 |
| e2e/affiliatetest.js:20 | Toleranz Provisionen `< 0.01` → `< 1` (Kachel ohne Cent); bei bereich_konto-29 Indizes anpassen | wording-53 |
| e2e/affiliatetest.js:23 | `'Creator,Code,Kunden,Umsatz,Provision,Verdient,Offen,'` → `'Creator,Code,Kunden,Umsatz,Satz,Provision,Offen,'` | bereich_konto-30 |
| e2e/affiliatetest.js:46 | `'Verdient,Offen,Kunden,Provision'` → `'Verdient,Offen,Kunden,Provisionssatz'` | bereich_konto-30 |
| e2e/tradeformtest.js:52/54 | `'.card [data-action=trade-journal]'` → `'.card-head [data-action=trade-journal]'` (der neue Knopf im MAE-Leerzustand zählt nicht mit) | bereich_trades_tag-47, bereich_trades_tag-22 |
| e2e/dashtest.js:67 | Meldung „Mehr anzeigen“ → „Zum TradeLog“ (Prüfung auf `href="#/trades"` bleibt) | wording-48 |
| e2e/settest2.js:47 | Meldung „Standardfarben“ → „Auf Standard zurücksetzen“ (Selektor bleibt) | wording-24 |
| e2e/sampletest.js:118 | unverändert grün (Replay ist in der Suite freigeschaltet) | wording-21 |
| tests/core.test.mjs:100 | unverändert (16 Kennzahlen) | wording-8 |
| e2e/certtest.js:9/45/54 | unverändert (4 Einträge, Kartentitel englisch, Knopf in der Tagesansicht) | wording-45, bereich_dashboard-29 |

### Schritt 20 · `web/README.md`

| Zeile | vorher → nachher | ids |
|---|---|---|
| 39 | „(Trade-Ansicht → „Bearbeiten“ an „Plan vs. Ausführung“ oder „Tags & Notizen“ …)“ → „(Trade-Ansicht → „Plan bearbeiten“ bzw. „Tags bearbeiten“ …)“; Satz ergänzen: „„Trade bearbeiten“ und „Löschen“ stehen oben in der Zeile mit TradeLog und Datum.“ | bereich_trades_tag-22 |
| 65 | „Netto P&L“ → „Netto-P&L“ | wording-6 |
| 78 | „Intraday/Multiday, Reviewed“ → „Intraday/Mehrtägig, Nachbereitet“ | bereich_dashboard-31 |
| 84 | „(Ampel, Balance, Puffer …)“ → „(Ampel, Kontostand, Puffer …)“ | wording-32 |
| 99–100 | „`short`-Titel „Ø Gewinn/Verlust““ → „Kacheltitel „Ø Gewinn/Verlust““ | wording-9 |
| 108 | ergänzen: „„Trade loggen“ in der Kopfreihe übernimmt an anderen Tagen das Datum (09:00).“ | wording-5 |
| 116, 143, 156, 171 | „Einstellungen → Mentor“ → „Einstellungen → Server“; in 171 den Bereich „Mentor“ → „Server“ und „Logs (Imports und Verlauf)“ → „Verlauf (Importe und Änderungen)“ | wording-14, wording-60 |
| 151, 169, 190 | „Winrate“ → „Trefferquote“ | wording-3 |
| 216, 219, 224 | „Stopp nach Verlustserie“ → „Schluss nach Verlustserie“; „Equity echt vs. Schatten“ → „Kumulierter Netto-P&L (echt und Schatten-Ich)“; „„Mein Regelwerk““ → „„Regelwerk““ | wording-41, wording-40, wording-25 |
| 259 | „Puffer in Stop-Losses“ → „Puffer in Stops“ | wording-33 |
| 264 | „in der Gruppe Konten“ → „in der Gruppe Prop Trading“; „Rabatt-Codes“ → „Coupon-Codes“ | bereich_shell-33, wording-55 |
| 269–273 | „Provision in %, verdient“ → „Satz, Provision“; „Über“ → „Quelle“; „Provision = Umsatz × Prozent des Creators“ → „Provision = Umsatz × Satz des Creators“; „Provision“ (Creator-Kachel) → „Provisionssatz“ | bereich_konto-30 |
| 318 | „Tastatur: **N** neuer Trade, **1–6** Bereiche, **Esc** schließt Dialoge.“ → „Tastatur: **N** Trade loggen, **1–9** Bereiche, **Esc** schließt Dialoge. Die Taste 0 öffnet Blind-Replay nur, wenn es freigeschaltet ist.“ | wording-20, bereich_shell-32 |

---

## 4. Akzeptanzkriterien

### 4.1 Verbotene Formen (Ziel: 0 Treffer)

Aufruf im Ordner `web`, Bereich `js/*.js js/screens/*.js app.html`, ohne `js/lang/`. Die Zahl hinter jeder Zeile ist der Stand heute.

```bash
cd /home/user/Florian/web; J="js/*.js js/screens/*.js app.html"
z(){ n=$(grep -nE "$1" $J | grep -v '^js/lang/' | grep -vE "${2:-^$}" | wc -l); echo "$n (Ziel 0) | $1"; }
z "'Win-Rate'|>Win-Rate<|Win-Rate \\\$|Winrate|WR \\\$\\{"            # heute 16
z "Tages-Win-Rate"                                                    # heute 1
z "Netto P&L"                                                         # heute 2
z "Gewinn/Verlust pro Trade|Trade-Gewinn/Verlust"                     # heute 4
z "Kumulierter Tages-P&L|Equity: echt"                                # heute 3
z "Trade für diesen Tag|new-trade-day"                                # heute 2
z "Daily Profit Certificate\"|title.replace\\(' Certificate'|'Stats', 'range'|Username anzeigen"   # heute 3
z "Mentor-Server|deinen eigenen Server|einen eigenen Server|derselbe wie für den Mentor|denselben Server wie der Mentor-Chat"   # heute 12
z "Einstellungen → Mentor"                                            # heute 7
z "Prüf |versuch es"                                                  # heute 4
z "server/README.md im Projekt|COACH_SMTP_HOST|localStorage und IndexedDB"   # heute 2
z "Coach Mode einrichten|im Coach Mode|>Coach Mode<"                  # heute 3
z "Kürzlich gelöscht|Tag loggen|Notizen antippen|'Verschoben'"        # heute 5
z "Aus Datei laden|Exportieren \\(JSON\\)|Als PDF herunterladen|Ordner hinzufügen|Vorlage hinzufügen|Nur-Lese-Link erzeugen"   # heute 4
z "'Absatz'|Aufklappbare Liste"                                       # heute 3
z "'Multiday'|'Reviewed'|'Unreviewed'|Intraday / Multiday"            # heute 2
z "Stop-Loss\\\$\\{|Stop-Losses|je Stop-Loss" "^js/prop\\.js"         # heute 5
z "caption\">Balance<|Startbalance|Mindestbalance|Ampel, Balance|die Balance" "^js/(prop|propsim|propdata)\\.js"   # heute 8
z "Konto \\(z. B. 50K\\)|Gewinn fehlt:|Consistency verletzt|P&L aktive Konten|'bestanden, geplatzt"   # heute 6
z "Handelstag \\\$\\{esc\\(b.dayKey\\)\\}"                            # heute 1
z "Profil vervollständigen|\\['Konten', \\[\\['prop'"                 # heute 2
z "'Logs'|'Imports'|Noch keine Imports|Noch kein Verlauf"             # heute 5
z "'Neuer Performance-Recap'|>Performance-Recaps<|Wöchentlicher Performance|Monatlicher Performance"   # heute 4
z "ganzen Website|ganze Website|Buttons, aktive|Standardfarben</button>|Aktuelles speichern"   # heute 5
z "</b> neuer Trade|<b>1–6</b>|Sicherung einspielen|>Einspielen<|eingespielt|Vorher exportieren!"   # heute 5
z "im Trade-Editor|im Editor ein|Was handelst du\\?|Trading-Erlebnis"  # heute 5
z "erreichtem Tageslimit|bestimmt Tageslimit|Ist das Tageslimit"      # heute 3
z "Mein Regelwerk|Mit allen Regeln eingehalten|Stopp nach Verlusten|ist Pause\\.'"   # heute 4
z "Regelbr" "^js/screens/(ruhepunkt|mentor)\\.js|^js/shadow\\.js"      # heute 10
z " – nur ohne| – dann rechnet| – Änderungen"                         # heute 3
z "Trade speichern|leer = offen|Fehler: alle|Nur mit Fehler|Suchen: Symbol|Widget suchen …"   # heute 5
z "Mehr anzeigen</a>|\\} CSV</button>"                                # heute 3
z "von \\\$\\{rules.length\\} eingehalten|Keine Regeln definiert|% Regeln eingehalten|Bleib trotzdem wachsam"   # heute 4
z "'Rabatt-Codes für|Keine Exkursionsdaten|Notiz sprechen oder tippen" # heute 3
z "Einstiegspreis|Ausstiegspreis|\\['Eröffnung'|\\['Schluss'|Stück × Punktwert|\\['r', 'RR'"   # heute 4
z "Trade-Erwartungswert|label: 'Ø Netto-P&L pro Trade'|Ø Tagesvolumen|Ø geplantes R-Multiple|Ø realisiertes R-Multiple"   # heute 7
z "'Erwartungswert je Setup'|'Netto-P&L je Symbol'|je Marktphase'|'Ø pro Trade nach|'P&L nach Wochentag'|pro Trade je Setup"   # heute 4
z "Median-Drawdown|\\\$\\{mc.runs\\} Durchl|' \\+ mc.runs \\+ '|curShort\\(ruinY\\)"   # heute 4
z "'< 5 min'|'> 4 h'|'18–20'|Ruin-Schwelle Monte Carlo|Geld-blind-Modus', 'Blendet"   # heute 6
z "Nutzerkennung ist dein Benutzername|Standard: klar und modern|Weiche, runde Formen"   # heute 3
z "Kurz-Stats nur in R|nur für Mentoren</span>|Notizen von euch|Notiz von euch|'Ø Winrate'"   # heute 4
z "So gehen wir mit|Support-Team Zugriff|auf mein Konto|Zusätzliche Sicherheit für dein Konto|Replay-Screenshots mit zwei Sessions|btn primary sm\" data-action=\"twofa\""   # heute 3
z "Provision ändern|Provision in %|<th class=\"r\">Verdient<|>Über</th>"   # heute 3
z "\\\$\\{s.n\\} Trades|von \\\$\\{list.length\\} Trades|von \\\$\\{rows.length\\} Trades|\\\$\\{ev.n\\} Trades|signed: false"   # heute 6
z "Notizen verschoben|\\\$\\{nb.selected.length\\} Notizen"           # heute 3
```

### 4.2 Pflichtformen (Ziel: mindestens die genannte Zahl)

```bash
p(){ n=$(grep -nE "$1" $J | grep -v '^js/lang/' | wc -l); echo "$n (Ziel ≥ $2) | $1"; }
p "const count = \\(n, one, many\\)" 1
p "U\\.count\\(" 30
p "Journalyst-Server" 10
p "Einstellungen → Server" 7
p "'Trefferquote'|>Trefferquote<|Trefferquote \\\$" 12
p "Ø Gewinn/Verlust" 4
p "Prop-Konto anlegen" 3
p "aria-label=\"Prop-Konto anlegen\"" 1
p "App.on\\('replay'\\)" 3
p "data-empty=\"Offen\"" 1
p "dp-display" 1
p "<option value=\"\\\$\\{n\\}\" \\\$\\{st.mcRuns" 1
```

Zusätzlich: `grep -c '"Trefferquote"' web/js/lang/en.js` ≥ 1 und für jeden Schlüssel aus 1.5 Nr. 4 ein Treffer in allen fünf Wörterbüchern (`for l in en es hi pt zh; do grep -cF '"Profil ergänzen":' web/js/lang/$l.js; done` → je 1).

### 4.3 Prüfpunkte in Screenshots (neue Aufnahmen mit `audit/atlas.js`, dark und light, 1440 und 390)

| Aufnahme | Prüfpunkt | ids |
|---|---|---|
| day.png (heute) | genau ein grüner Knopf („Trade loggen“ in der Kopfreihe); kein „Check-in“, kein „Trade für diesen Tag“ im Kopf; Karte „Check-in“ mit Knopf „Check-in machen“; Regeln „0 von 5 abgehakt“ | wording-5, wording-44 |
| day.png an einem vergangenen Tag | „Trade loggen“ öffnet den Dialog mit diesem Datum, 09:00; Karte zeigt „Check-in nachtragen“ | wording-5 |
| dashboard.png | Kacheln „Netto-P&L +893,04 €“ (mit Vorzeichen), „Trade-Trefferquote“, „Tages-Trefferquote“, „Ø Gewinn/Verlust“; Radar-Achse „Trefferquote“; Kalender: alle Tagesbeträge ohne Cent; Konto-Karte „Profil ergänzen“ vollständig sichtbar (`.sb-who span` scrollWidth ≤ clientWidth, de und en); Navigationsgruppe „PROP TRADING“; „Zum TradeLog“ unter „Letzte Trades“; Regel-Tracker ohne Kopf-Link | wording-7, wording-3, wording-9, bereich_dashboard-17, bereich_shell-34, bereich_shell-33, wording-48 |
| leer_dashboard.png | Banner-Knopf „CSV importieren“; kein „Zum TradeLog“ unter „Noch keine Daten“ | wording-49, wording-48 |
| stats_summary.png / extra/statsdeep | 16 Kacheln, darunter „Erwartungswert pro Trade“ und „Trades“ (keine zwei Kacheln mit gleichem Wert); „Trade-Trefferquote“, „Tages-Trefferquote“ ohne Ø, „Ø Gewinn/Verlust“, „Ø Kontrakte pro Tag“, „Ø R pro Trade“; Serie „1 Gewinn“ bei Länge 1 | wording-8, wording-3, bereich_statistik-10, bereich_statistik-28 |
| stats_time.png, stats_regime.png, stats_setups.png | alle Titel „… nach …“; Uhrzeit-Achse 14 gleich breite Gruppen bis „19–20“, „ab 20“; Tabelle „9–10 Uhr“; Haltedauer „unter 5 min“, „über 4 h“; Vola-Balken „Niedrig/Normal/Hoch“ | bereich_statistik-16, bereich_statistik-38 |
| stats_mistakes.png | „Fehler haben gekostet 1.281,39 €“ in Verlustfarbe ohne Minus; „Trefferquote mit / ohne Fehler“ ohne Farbe | bereich_statistik-45 |
| stats_mc.png | „1.000 Durchläufe“, „25 von 1.000 Durchläufen“, „Ruin-Schwelle 17.500 €“; „Drawdown (Median)“ und „Endkapital (Median)“ ohne Cent, Fußzeilen ausgeschrieben | bereich_statistik-26 |
| trades.png (1440 und 390), leer_trades.png | Spalten „Einstieg“, „Ausstieg“, „Netto-P&L“, „R“; Tabelle bei 1280 px ohne seitliches Scrollen; Platzhalter „Trades durchsuchen“; „Alle Fehler“; am Handy Suche eine Zeile, Auswahlfelder eine wischbare Zeile; im leeren TradeLog keine Filterzeile | bereich_trades_tag-36, wording-51, bereich_trades_tag-35 |
| extra/zustaende/trades_ein_trade.png (neu aufnehmen) | „1 Trade“, „1 von 1 Trade“, „1 – 1 von 1 Trade“ | zustaende-28 |
| trade_detail.png | oben rechts „Notiz im Notebook“, „Löschen“, „Trade bearbeiten“ (neutral, nicht grün); Kartenknöpfe „Plan bearbeiten“ und „Tags bearbeiten“; kein Fuß; Raster „Eröffnet“, „Geschlossen“, „Kontrakte × Punktwert“; MAE-Leerzustand mit „Plan ergänzen“ | bereich_trades_tag-22, bereich_trades_tag-36, bereich_trades_tag-47 |
| modal_trade_loggen.png (en-US-Browser, App Deutsch) | „Eröffnet 11.10.2026, 12:40“; leeres „Geschlossen“ zeigt „Offen“ in `--faint`; Label ohne Klammer; Knopf „Trade loggen“. Tippen einer Ziffer zeigt das native Feld, nach Verlassen wieder das Overlay | wording-2, wording-62, wording-63 |
| modal_zertifikat.png | Tagesfeld „11.10.2026“; Zeile „Sonntag, 11. Oktober 2026“ bleibt | bereich_dashboard-28 |
| pop_zertifikat.png | „Tag 11.10.2026“, „Woche KW 41“, „Monat Okt. 2026“, „Zeitraum …“; kein Englisch; Dialog „Benutzername anzeigen“ | wording-45, bereich_dashboard-29 |
| pop_filter.png | „Intraday / Mehrtägig“, „Nachbereitet: Alle · Ja · Nein“, Platzhalter „Von“/„Bis“ | bereich_dashboard-31 |
| prop.png, extra/hicks-prop-1440-cockpit_breach.png, leer_prop.png | USD-Karte nur in $ („Kontostand 111.262 $“, „P&L +11.262 $“); Kachel „P&L der aktiven Konten“ je Währung; „reicht für 43 Stops“; Topstep ohne doppelte Gewinnzeile, „Consistency Rule verletzt“; Untertitel „Bestanden, …“; Breach-Banner ohne ISO-Datum, „überschreitet das Limit von“; Leerzustand „Prop-Konto anlegen“ (Kopf und Karte), Text ohne „Firmen-Preset“ | bereich_prop-5, wording-36, wording-33, wording-31, wording-37, bereich_prop-4, wording-34, wording-35, wording-32 |
| extra/hicks-prop-1440-modal_konto_edit_unten.png | USD-Konto zeigt „Betrag ($)“; Wechsel der Währung ändert die Optionen sofort; „% des Startkapitals“; Felder „Konto“ mit Platzhalter „z. B. 50K“ | bereich_prop-38, bereich_prop-53 |
| prop_bilanz (Planer, Payouts, Pro Firma) | „13 (mind. 2) · erfüllt“; Spalten „Beantragt am / Erhalten am“, Symbolknopf statt „Erhalten“; „… Ausgaben · noch keine Payouts“ ohne „ROI −100 %“ | bereich_prop-31, bereich_prop-20, bereich_prop-24 |
| prop_friedhof.png | „FTMO 100K“ mit Unterzeile „Forex / CFD“ (kein „100.000 €“) | bereich_prop-46 |
| shadow.png (1440 und 390) | Intro ohne Gedankenstrich; nur „Verstöße“, kein „Regelbrüche“; Kachel-Fuß „Ohne Verstöße“ einzeilig bei 390; Karte „Regelwerk“; Regel „Schluss nach Verlustserie“; Diagramm „Kumulierter Netto-P&L“ | wording-38, wording-39, wording-25, wording-41, wording-40 |
| progress (extra/fsm/progress_voll.png) | Kartentitel „Regeltreue“; Tilt-Text passt zur roten Quote | wording-43, bereich_training-14 |
| notebook (extra/nbnw/*) | „Papierkorb“ unten links; „Tagesnotiz anlegen“; „Notizen auswählen“; •••-Menü „Aus JSON importieren · Als JSON exportieren · Als PDF drucken“ mit Druckersymbol; „+“-Menü „Text“, „Aufklappbarer Abschnitt“ in „Grundbausteine“ | bereich_notebook_news-27/-28/-29 |
| news.png | Banner einzeilig bei 1440: „Beispielansicht. Echte Termine kommen über deinen Journalyst-Server.“; Termine weiter mit „Beispiel: “ | bereich_notebook_news-45 |
| mentor.png, coach.png | Einrichten-Text ohne Repo-Pfad, Knopf „Server einrichten“; Coach-Titel „Coach einrichten“ | bereich_training-35, bereich_konto-42 |
| extra/cca/coach-group-dark-1440.png, coach-journal-dark-390-b.png | kein „nur für Mentoren“; „Daten ab 01.10.2026“; „1 von 2 offen“ einzeilig; „1 Mentor-Notiz“; Journal-Eintrag zeigt „bearbeitet …“ nur, wenn später bearbeitet, Titel am Handy nicht gequetscht | bereich_konto-43, bereich_konto-21 |
| coach-hub (Mail ohne Server) | Mailhinweis grau, ohne Variablenname | bereich_konto-16 |
| affiliate.png, extra/cca/aff-creator-dark-1440.png | Kachelreihe ohne Cent; Spalten „Satz“, „Provision“; Creator-Kachel „Provisionssatz“; Kundenliste „Quelle“ | wording-53, bereich_konto-30 |
| settings_profil.png | „Wer außer dir dein Journal sehen darf.“, „Support-Team-Zugriff erlauben“; 2FA-Knopf neutral; „Sicherung importieren“; Beispieldaten ohne Replay; „Löscht alle Daten …“; Fuß in zwei Zeilen mit „1–9“ | wording-17, wording-18, wording-22, wording-21, wording-19, wording-20, bereich_shell-32 |
| settings_design.png | „Gilt sofort überall, auch auf der Startseite.“; Akzent „Hauptknöpfe, Schalter, Markierungen und Diagramme.“; „Auf Standard zurücksetzen“ ohne ×; „Design speichern“; Schriftkarten „Satoshi · Zahlen in Onest“ usw. | wording-23, wording-24, bereich_einstellungen-45 |
| settings_trading.png | Untertitel nennt die Blöcke; „Märkte“; Schalter „Beträge als R zeigen“ unter „Geld-blind-Modus“; Auswahl „500 · 1.000 · 2.000 · 5.000“, Speichern von 2.000 ergibt `Store.settings.mcRuns === 2000`; „Tagesverlustlimit“ in Tilt-Text | wording-26, wording-27, wording-28, bereich_einstellungen-34, wording-29, wording-10 |
| settings_benachrichtigungen.png | „Recaps“, „Wochen-Recap“, „Monats-Recap“ mit den neuen Auslöser-Sätzen | wording-11, wording-12 |
| settings_mentor.png | Reiter „Server“, Kopf „Server“; Nutzerkennung mit Herkunft; Absatz 4 kurz | wording-14, bereich_einstellungen-46 |
| settings_logs.png | Reiter „Verlauf“, Unterreiter „Importe · Änderungen“, Leerzustände „Noch keine Importe“ / „Noch keine Änderungen“ | wording-60 |
| settings_regeln.png | Untertitel „… in „Plan & Bewertung“ eines Trades …“ | wording-61 |
| coupons (Leerzustand per `PropData.COUPONS = []` in der Konsole) | „Coupon-Codes für Prop Firms erscheinen hier.“ | wording-55 |
| Tastatur | bei verstecktem Replay bleibt „0“ auf der Seite; „N“ in der Tagesansicht eines vergangenen Tags öffnet den Dialog mit 09:00 | bereich_shell-32, wording-5 |

### 4.4 Tests

Grün nach Schritt 19: `node --test web/tests/*.mjs` und `web/e2e/runall.sh` (mindestens scorestatetest, usercardtest, rptest, settest, settest2, mentortest, coachtest, coachlang, coachlang2, proptest, friedhoftest, affiliatetest, tradeformtest, dashtest, sampletest, certtest, filtertest, newstest, shadowtest, sixtest, mobiletest, langtest für alle fünf Sprachen, tlfittest).

### 4.5 Übersetzung

`node e2e/langtest.js en,es,zh,hi,pt` ohne „deutsche Reste“ in Dashboard, TradeLog, Trade-Detail, Trade-Dialog und allen Einstellungs-Reitern, nachdem `part-audit-wording.json` angelegt ist. In der englischen Oberfläche lauten die Platzhalter im Filter „From“/„To“ (nicht „by“/„due“).

---

## 5. Zurückgestellt

| id | Teil | Grund |
|---|---|---|
| bereich_dashboard-28 | Wochenfeld `type="week"` im Zertifikat-Dialog (certificate.js:77) und das Streichen der Zeile „Sonntag, 11. Oktober 2026“ | `datepicker.js` kennt keinen Wochentyp; ein eigener Wochen-Kalender wäre eine neue Komponente. Die Zusatzzeile nennt Wochentag bzw. Zeitraum und ist kein Doppel. Die Filter-Uhrzeiten (dash-filter.js:125–126) löst bereich_prop-52 (Komponenten) |
| bereich_dashboard-17 | Kurzform `.pm` mit Leerzeichen („−486 €“) | README Z. 190–192 legt die Kurzform ohne Leerzeichen für schmale Kalender-Kacheln fest |
| bereich_notebook_news-45 | Präfix „Beispiel: “ vor jedem Termin streichen | README Z. 119 verlangt eine klar markierte Beispielansicht; ohne Präfix wirken Termine nach dem Wegscrollen des Banners echt; `newstest.js:40` prüft das Präfix |
| bereich_trades_tag-37 | Zertifikat-Knopf nur an Tagen mit Trades | `certtest.js:54` erwartet ihn auch an trade-freien Tagen; der Dialog fängt leere Tage ab |
| bereich_konto-43 | Teil 5: Fuß der Kachel „Ø Profit-Faktor“ ändern | README Z. 169 nennt „Ø Gewinn/Verlust in R“ als Teil der Gruppen-Statistik; der Info-Text erklärt den Fuß |
| wording-25 | „Meine Designs“ → „Gespeicherte Designs“ | Feature-Name aus dem Nutzerauftrag (README Z. 200, Aufgabe #69); Ich-Form ist für eine eigene Sammlung üblich |
| wording-28 | „— R“ auf „– R“ korrigieren bzw. ui.js ändern | Befund widerlegt: misc.js:197 und ui.js:111/113 nutzen beide U+2013; README Z. 212 und `blindtest.js:35` |
| wording-36 | Nachkommastellen der Kachel | beruht auf einem Irrtum: Kachel und Karten folgen derselben Regel (`fmt.cur` ab 10.000 ohne Stellen, ui.js:122) |

---

## 6. Nutzer fragen

**F1 · aufbau-29: Soll der menschliche Coach in der Oberfläche „Coach“ heißen statt „Mentor“?**
Heute heißt im Coach-Bereich die betreuende Person „Mentor“ („Als Mentor“, „Mentor-Notizen“, Pille „Mentor“, „Notiz deines Mentors“ im Notebook), während „Mentor“ in der Navigation der KI-Chat ist. README Z. 145–170 legt die Rolle „Mentor“ fest, und der Prüfer von bereich_konto-41 hat die Umbenennung deshalb abgelehnt. Die Server-Mails (`server/coach.py`) sagen weiter „Mentor“.
Empfehlung: Ja, nur in der Oberfläche umbenennen (Texte in `js/screens/coach.js`, `js/coach.js`, Notebook-Notizblock; Rollenwerte `mentor`, API-Felder, CSS-Klassen und Route bleiben; `coachtest.js:42/84/96` und README Z. 145–170 anpassen). Dann werden aus Schritt 15 „Was dein Coach sieht“, „Mentor-Notizen“ → „Coach-Notizen“ und „mit deinem Mentor“ → „mit deinem Coach“. Die Server-Mails in einem eigenen Schritt angleichen.

**F2 · wording-17: Soll der Schalter „Support-Team-Zugriff erlauben“ samt „Speichern“ entfallen?**
Der Schalter wird nirgends ausgewertet (nur misc.js:60 liest `privacy.support`), es gibt kein Support-Team und kein Konto. README Z. 171 führt „Privatsphäre“ als Teil des Profils, `settest2.js:16` prüft `save-privacy`. Bis zur Entscheidung ändert Schritt 17.2 nur den Wortlaut.
Empfehlung: Ja. Der Block bleibt als reine Information: „Deine Daten liegen nur in diesem Browser. Mentor, Coach und Sprachnotizen schicken Auszüge an deinen Journalyst-Server, wenn du ihn einrichtest.“ Aktion `save-privacy` und die Prüfung in `settest2.js:16` entfallen, README Z. 171 bleibt sinngemäß („Privatsphäre“ als Information).

**F3 · wording-18: Sollen „2FA aktivieren“ und „Passwort zurücksetzen“ bis zu echten Benutzerkonten ausgeblendet werden?**
Beide öffnen nur einen Hinweis mit „Verstanden“. README Z. 171 führt 2FA im Profil, `settest2.js:17` prüft beide Dialoge. Schritt 17.3 macht den 2FA-Knopf neutral und den Text ehrlich, entfernt aber nichts.
Empfehlung: Ausblenden und durch eine graue Zeile ersetzen: „Anmeldung, Passwort und 2FA kommen mit Benutzerkonten.“ Ein Knopf ohne Funktion wirkt unfertig. Wenn der Nutzer die Platzhalter als sichtbare Ankündigung behalten will, bleibt es bei Schritt 17.3.
