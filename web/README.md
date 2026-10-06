# Journalyst (Web-App)

Journalyst ist ein Trading-Journal im Browser, im Aufbau und Look von TradeZella und TradePath: schwarzer Grund,
Neongrün als Akzent, Seitenleiste mit Dashboard, TradeLog, Tagesansicht, Statistiken, Journal,
Fortschritt und Einstellungen.

Alle Daten bleiben im Browser (localStorage für Daten, IndexedDB für Bilder und Audio).
Es gibt keinen Server und keine Anmeldung.

## Starten

Am einfachsten: `web/app.html` im Browser öffnen (Doppelklick). Die Startseite ist `web/index.html`.

Sauberer über einen kleinen lokalen Server, damit Drag & Drop und Audio in allen Browsern funktionieren:

```bash
cd web
python3 -m http.server 8080
# dann http://localhost:8080/app.html öffnen
```

Beim ersten Start werden Beispieldaten geladen (rund 170 Trades über vier Monate). Sie sind als
Beispiele markiert und lassen sich unter **Einstellungen → Profil → Daten und Sicherung** mit einem Klick entfernen.

## Veröffentlichen

Der Workflow `.github/workflows/pages.yml` veröffentlicht den Ordner `web/` bei jedem Push auf
GitHub Pages. Dafür einmalig im Repository unter **Settings → Pages → Source** die Option
**GitHub Actions** wählen. Die Adresse steht danach im Workflow-Lauf.

## Was die App kann

- **Trade loggen**: Symbol, Richtung, Zeiten, Kurse, Stückzahl, Punktwert, Gebühren, Plan
  (Einstieg, Stop, Ziel, Begründung), MAE/MFE, Setup, Strategie, Bewertung, Fehler-Tags,
  Emotionen, gebrochene Regeln, Notizen. Screenshots per Drag & Drop, Datei oder Einfügen.
  Sprachnotizen mit Transkription (wenn der Browser das erlaubt) oder als Text, mit Stimmungsanalyse.
- **CSV-Import** mit automatischer Spaltenerkennung (deutsche und englische Zahlen- und
  Datumsformate), anpassbarer Zuordnung, Vorschau und Duplikat-Schutz.
- **Seitenleiste**: unter dem Logo „Trading Journal App“, eine Trennlinie, dann die Navigation (keine Begrüßung).
  Im eingeklappten Modus nur Symbole (quadratische Knöpfe). Auf niedrigen Bildschirmen etwas dichter.
  Aktiver Eintrag (Ecken 12px): Akzentfarbe links, läuft nach rechts ins Dunkle aus, sehr feiner Rand und
  ein schmaler, leicht leuchtender Balken links am Rand der Leiste. Rand nur dezent, links leicht grün.
  **Hinweis-Punkte** (kleiner runder Punkt, farblich wie der Lichtbalken am aktiven Eintrag) neben Bereichen, in denen etwas wartet (Grund im Tooltip): Dashboard (neuer Recap), TradeLog (offene
  Positionen), Tagesansicht (Check-in fehlt, Mo–Fr), Notebook (heute gehandelt, keine Tagesnotiz), Fortschritt (heute gehandelt,
  Regeln nicht abgehakt), Prop Firms (aktives Konto auf Rot oder verletzt). Ein- und ausschalten, gesamt oder je Bereich, unter
  Einstellungen → Benachrichtigungen. Weitere Bereiche melden sich mit `App.navDot(key, fn)` an.
  Wochen- und Monats-Recap oben auf dem Dashboard sind standardmäßig aus (einmalige Umstellung auch für bestehende Daten
  und Importe über `settings.recapsOffV1`); einschalten unter Einstellungen → Benachrichtigungen.
  Unten die **Konto-Karte** (Profilbild oder Initialen, Name, E-Mail): Klick öffnet ein Menü mit Profil, Einstellungen,
  Benachrichtigungen, Sprache und dem Hell/Dunkel-Schalter; eingeklappt nur das Profilbild, Menü rechts daneben.
- **Dashboard** (Aufbau nach TradeZella): oberer Bereich mit bis zu 5 Kennzahl-Kacheln (Netto P&L,
  Kontostand, Trade- und Tages-Trefferquote, Profit-Faktor, Ø Gewinn/Verlust, Erwartungswert, Tages-,
  Trade- und kombinierte Serie, maximaler und durchschnittlicher Drawdown), unten ein 3-Spalten-Raster
  mit Diagrammen, Kalendern und Listen (Gesamt-Score-Radar, kumulierter P&L, Trefferquote-Verlauf,
  Performance nach Uhrzeit und Haltedauer, P&L pro Tag, täglich & kumuliert, letzte Trades, Kalender,
  Mini-, erweiterter und Jahreskalender, Kontostand, Drawdown-Verlauf, Challenge, Regel-Tracker, Report).
  Jedes Widget hat ein (i) mit Erklärung. **Vorlagen**: mehrere Dashboards anlegen, umbenennen,
  duplizieren, als Standard festlegen, löschen. **Bearbeitungsmodus** mit Drag & Drop, Entfernen,
  Größe (klein/mittel/groß) und Widget-Bibliothek mit Suche. Handy: Kacheln wischbar, Pfeile statt Drag & Drop.
  Beim Bearbeiten bleibt ein entferntes Widget als Lücke stehen (neue Widgets füllen sie, Drag & Drop tauscht hinein);
  erst „Speichern“ schließt die Lücken. Die Bibliothek zeigt zu jedem Widget ein eigenes Vorschaubild (`js/widgetpreviews.js`).
  **Zeitraum**: Voreinstellungen plus „Benutzerdefiniert“ mit zwei Monatskalendern nebeneinander (Handy: einer), erster Klick
  Start, zweiter Klick Ende (`js/rangepicker.js`); die Vorgaben links (Heute, Diese Woche … Gesamt) werden nur markiert und im Kalender gezeigt, übernommen wird erst mit „Anwenden“; beim Überfahren zeigt nur der Tag unter der Maus einen Rahmen, außerhalb des Kalenders verschwindet die Vorschau. **Filter** als Seitenleiste (`js/screens/dash-filter.js`), in Gruppen
  Trade (Symbol per „+“ mit Suche, Long/Short, Gewinn/Verlust/Break-even, offen/geschlossen, Intraday/Multiday, Reviewed,
  Bewertung), Zeit (Wochentag, Monat, Entry- und Exit-Uhrzeit, Haltedauer in Min/Std/Tagen), Werte (Entry-/Exit-Preis,
  R-Multiple, Positionsgröße, Volumen) und Tags (Setups, Fehler, Emotionen); „Anwenden“ zeigt live die Zahl der Trades.
  **Bereiche der App als Widgets** (eigene Gruppe „Bereiche der App“ in der Bibliothek, gleiche Rechnung wie auf den
  Seiten): Kacheln Disziplin-Kosten (Schatten-Ich im Dashboard-Zeitraum), Blind-Replay (richtig eingeschätzt, letzte 20)
  und Prop-Konten (aktiv, Ampel-Zählung); Karten Schatten-Ich (Kosten, echt, Schatten-Ich, Verstöße, Kurven), Blind-Replay
  (große Zahl, Runden, „Session starten“ öffnet direkt die erste Karte), Prop-Konten (Ampel, Balance, Puffer je aktivem
  Konto), Ruhepunkt (heute vor/nach dem Trading, Start mit einem Klick, Akut-Reset) und Mentor (Frage oder Vorschlag landet
  im Eingabefeld des Mentors; ohne Server ein Einrichten-Hinweis). Die fünf Karten hängt eine einmalige Migration
  (`dashboardsVersion` 4) ans Ende des Standard-Dashboards; Entferntes bleibt entfernt.
  Neue Widgets: ein Eintrag in `js/widgets.js` (Registry mit Typ, Name, Beschreibung, Bereich, Standardgröße, Info-Text).
- **TradeLog**: sortierbare Tabelle, Filter, Tageskarten mit Mini-Chart, verpasste Trades.
- **Tagesansicht**: Kennzahlen des Tages, Trades, Check-in, Regeln abhaken, Marktphase, Tagesjournal.
- **Statistiken**: 16 Kennzahlen, Tage, Setups/Symbole, Wochentag/Uhrzeit/Haltedauer,
  Fehlerkosten und Emotionen, Marktphase, Zustand (Schlaf, Stress, Stimmung vs. Ergebnis),
  Edge-Check mit 95-%-Intervall und rollierendem Schnitt, Monte Carlo mit Ruin-Wahrscheinlichkeit.
- **Notebook**: drei Spalten (Ordner und Tags, Notizliste, Notiz); Notizen gelten für alles, darum ohne Zeitraum und Konto, die Suche steht in der Kopfreihe. Standardordner Trade Notes,
  Daily Journal und Session Recap, eigene Ordner mit Farbe und Standard-Vorlage. Notiz-Kopf mit
  Datumswahl, großem Titel, Erstellt- und Bearbeitet-Zeit. Schlanker Rich-Text-Editor (Quill 2,
  Inhalte als JSON) nach TradePath-Vorbild: „+“ (Bausteine, Listen, Vorlagen), Absatzformat,
  Schriftgröße, Fett/Kursiv/Unterstrichen/Durchgestrichen, Schriftfarbe mit Farbraster, Bild
  (Datei oder Adresse), Textmarker. „/“ öffnet Befehle, „:“ die Emoji-Auswahl, Bilder per Einfügen
  oder Drag & Drop mit Unterschrift. Tags, Vorlagen, Suche über alle Notizen, Filter, Papierkorb
  (30 Tage), Teilen per Link, Export/Import, Autosave. Notizen zu Handelstagen und Trades zeigen
  Netto-P&L und eine aufklappbare Statistik.
- **Fortschritt** mit Serie, Tages-Checkliste, Regeltreue, Aktivitäts-Heatmap und Tilt-Profil.
- **Sessions**: „Session starten“ mit Check-in, „Session beenden“ mit Regel-Check, Marktphase und Reflexion.
- **Zertifikat-Karten** (Dashboard → „Zertifikat“, Tagesansicht, Statistiken): Certificate of Daily/Weekly/Monthly Profit und Certificate of Performance, bewusst schlicht (Titel, für wen, Ergebnis, Zeitraum, drei Kennzahlen, Unterschriften), in drei Designs nach Canva-Vorlagen: Navy (Lichtstreifen, Farbverlauf-Titel, Rahmenecken), Aurora (zentriert, Ergebnis in einer Farbpille, rosa-lila Lichtflecken) und Hell; mit Live-Vorschau, Quadrat/Story/Querformat, Beträge ausblenden, PNG-Export in doppelter Auflösung, Kopieren und Teilen.
- **Ruhepunkt**: geführte Sessions vor und nach dem Trading plus Akut-Reset (Abläufe und Texte aus `docs/ruhepunkt.html`). Jede Session wird als Eintrag mit Nutzerkennung gespeichert; „Christlicher Impuls“ ist eine gespeicherte Einstellung.
  Beim Betreten schweben 15 Kirschblütenblätter langsam schräg durch den Ruhepunkt-Bereich (nur dort, Klicks gehen durch, bei reduzierter Bewegung keine Blätter); danach treiben weiche Farbflächen in Blau, Rosa und Violett hinter den Inhalten.
- **Mentor**: Chat mit dem Trading-Psychologie-Mentor über den eigenen Server in `server/` (System-Prompt `docs/mentor-systemprompt.md`, Journal-Kontext aus den letzten 20 Trades und dem heutigen Ruhepunkt-Check-in, Verlauf pro Nutzer, Tageslimit). Adresse und Zugangstoken unter Einstellungen → Mentor.
  In der Kopfreihe steht nur das Konto: es bestimmt, aus welchem Konto der Mentor die letzten 20 Trades sieht; der Zeitraum hat keinen Einfluss.
- **Einstellungen** in Bereichen: Profil (Angaben, Profilbild als kleines JPEG, Privatsphäre, 2FA, Daten und Sicherung), Design (Hell/Dunkel, vier Schriftarten: Standard „Modern“ (Text in Satoshi, Zahlen in Onest), „Geschwungen“ (Quicksand, Zahlen in Onest), „Rund“ und „Klassisch“, Akzent-, Gewinn-, Verlust- und Break-even-Farbe), Benachrichtigungen, Abo, Konten, Trading, Regeln, Notebook, Mentor, Inhalte (Kategorien und Tags), Logs (Imports und Verlauf).
- **Schrift**: Text in **Satoshi** (Fontshare, Indian Type Foundry), Zahlen in **Onest** (Google Fonts). Beide sind geometrisch
  mit ähnlicher x-Höhe, deshalb passen Text und Zahlen nebeneinander. Satoshi steht unter der ITF Free Font License: freie
  Nutzung auch kommerziell, Selbst-Hosting auf der eigenen Website erlaubt, Weitergabe der Schriftdateien nicht. Darum liegen
  keine Satoshi-Dateien in diesem öffentlichen Repository; `app.html` lädt sie über die Fontshare-API (feste Schnitte 400, 500,
  700, 900; Gewicht 600 nimmt Bold). Ohne Netz fällt der Text auf Onest zurück. Frühere Standardschrift „Geschwungen“
  (Quicksand) bleibt unter Einstellungen → Design wählbar; wer sie als Standard hatte, wurde einmalig auf „Modern“ umgestellt.
- **Sprachen** (Einstellungen → Sprache): Deutsch, Englisch, Spanisch, Chinesisch (vereinfacht), Hindi und
  Portugiesisch (Brasilien), die fünf meistgesprochenen Sprachen der Welt neben Deutsch. Zahlen, Beträge, Daten und der Kalender
  folgen dem Format der Sprache. **Standard für neue Nutzer: Englisch und US-Dollar**; wer schon Daten im Browser hat,
  behält Deutsch und Euro (oder was gespeichert ist). Währungen (Einstellungen → Profil, je Konto und je Prop-Konto):
  USD, EUR, CNY, INR, BRL, GBP, CHF, mit Namen und Zeichen in der gewählten Sprache. Übersetzt wird in Etappen: Etappe 1 umfasst Navigation, Dashboard, TradeLog mit Trade-Detail
  und Trade-Editor, Kopfreihen und alle Einstellungen; die übrigen Bereiche bleiben bis zu ihrer Etappe deutsch.
  So funktioniert es: Der Code bleibt deutsch, `js/i18n.js` ersetzt beim Anzeigen sichtbare Texte, Platzhalter, Titel und
  Screenreader-Texte aus dem Wörterbuch der Sprache (`js/lang/<code>.js`, deutscher Text → Übersetzung, `{0}` für Zahlen,
  Beträge und Namen). Eigene Inhalte (Notizen, Eingabefelder) werden nie verändert, gespeicherte Daten bleiben unverändert.
- **Farben**: Akzentfarbe sowie Gewinn- und Verlustfarbe frei wählbar (Vorlagen oder eigene Farbe), dunkel oder hell.
  Die Wahl gilt für die ganze Website inklusive Startseite.
- **Geld-blind-Modus** (Einstellungen → Trading): blendet überall alle Geldbeträge aus und zeigt R-Multiples.
  Trades zeigen ihr exaktes R, ohne Stop „– R“; Summen werden über eine R-Einheit umgerechnet (Median des Risikos
  deiner Trades mit Stop oder ein fester Wert). Der Kontostand wird komplett ausgeblendet, das Zertifikat erzwingt
  „Beträge ausblenden“. Zentral in `js/ui.js` (`fmt.cur` mit Option `{ r }`), alle Anzeigen laufen darüber.
- **Schatten-Ich** (Taste 9): zeigt, wie das Konto aussähe, wenn du deine eigenen Regeln zu 100 % eingehalten
  hättest. Regelwerk mit max. Trades pro Tag, max. Tagesverlust, Stopp nach Verlustserie, max. Risiko pro Trade,
  Handelszeiten, erlaubten Setups und Cooldown nach Verlust. Die Berechnung in `js/shadow.js` geht alle Trades
  chronologisch durch, Tageslimits gelten für das Schatten-Konto, zu große Trades werden herunterskaliert.
  Equity echt vs. Schatten, Disziplin-Kosten je Woche/Monat/gesamt (ehrlich auch, wenn ein Regelbruch Geld
  gebracht hat), Verstoßliste, Regel-Ranking und eine teilbare Bildkarte. Tests: `web/tests/shadow.test.mjs`.
  „Mein Regelwerk“ ist eine schlichte Liste: links die Regel, rechts der Schalter; die Eingaben erscheinen nur bei
  eingeschalteten Regeln, die Einheit steht im Feld, die Erklärung im (i). Ohne aktive Regel steht der Hinweis mit
  „Vorschlag übernehmen“ unter den Schaltern, damit beim ersten Einschalten nichts darüber verrutscht.
- **Blind-Replay** (Taste 0): Trainingsmodus mit deinen alten Trades. Nur Trades mit einem „Screenshot vor Entry“
  (eigenes Feld in der Trade-Ansicht) kommen vor. Zehn Karten je Session: Chart, Instrument, Uhrzeit, Setup
  optional, dann „Nehmen“ oder „Skippen“ mit Sicherheit 1–3, Auflösung mit Ergebnis in R. Richtig heißt Gewinner
  genommen oder Verlierer geskippt. Karteikasten mit drei Fächern (`js/replay.js`): falsch eingeschätzte Trades
  kommen öfter wieder. Die Übersicht ist bewusst knapp: eine große Zahl „Richtig eingeschätzt“ (x von y Trades), daneben
  die Runden als kleine Säulen (nur die letzte grün, Wert beim Überfahren) und „Session starten“; darunter drei Fakten
  (Letzte 20 mit Pfeil, Runden, Zum Üben) und zwei schlanke Listen „Treffer je Setup“ und „Treffer je Gefühl“
  (Unsicher/Eher sicher/Sicher) in einer Farbe. Ohne Daten erklärt die Startkarte in drei Schritten, worum es geht. In der Session stehen
  Zähler („Trade 1 von 10“), Fortschritt, Setup-Schalter und Abbrechen im Kopf der Karte, Sicherheit und
  „Skippen“/„Nehmen“ in einer Reihe. Die Sicherheit ist eine Signal-Anzeige: drei ansteigende Balken (Bernstein → Grün)
  mit dem Wort daneben, Vorschau beim Überfahren; ein Klick ändert nur die Anzeige. Der Zeitraum spielt hier keine Rolle
  und fehlt in der Kopfreihe.
- **Prop Firms** (eigener Bereich, fünf Bereiche links in der Kopfreihe: Übersicht · Konten · Rechner · Finanzen ·
  Analyse; Finanzen mit den Reitern Bilanz und Payout, Analyse mit Simulation, Friedhof und Challenge vs. Funded. Die
  Adressen bleiben `#/prop/<ansicht>` (z. B. `#/prop/bilanz`), `#/prop/finanzen` und `#/prop/analyse` öffnen die zuletzt
  benutzte Ansicht. Kennzahlen stehen als ruhige Leiste in einer Karte; Filter der Übersicht sind drei Auswahlfelder;
  bestandene, geplatzte und archivierte Konten liegen eingeklappt unter „Abgeschlossen“; Firmen-Presets, Ampel und
  Stop-Größe sowie Instrumente sind aufklappbar; die Eingabeformulare für Ausgaben und Payouts öffnen sich über den
  Knopf im Kartenkopf. Journal-Zeitraum und -Konto fehlen in der Kopfreihe, weil Prop-Konten eigene Trades haben):
  Firmen-Presets (Beispiele sind als unverifiziert markiert, eigene Firmen mit
  eigenen Regeln möglich), Prop-Konten mit Regel-Snapshot (Preset-Änderungen ändern bestehende Konten nicht), Trades
  lassen sich einem oder mehreren Prop-Konten zuordnen (Copy-Trading). Regel-Engine in `js/prop.js`: Daily Loss
  (Betrag oder %, Reset-Uhrzeit und Zeitzone), Max Drawdown statisch, intraday trailing, Tagesende-trailing und
  trailing mit Lock, Profit Target, Mindest-Handelstage, max. Kontrakte/Lots, Consistency Rule, verbleibender Puffer
  und Ampel. Cockpit mit allen Konten, echte Prop-Bilanz (Ausgaben gegen Payouts, ROI, Kosten pro bestandenem Konto,
  Bestehensquote), Puffer in Stop-Losses, Positionsgrößenrechner mit editierbaren Instrument-Spezifikationen,
  Payout-Planer mit Consistency-Warnung, Konto-Friedhof mit Musteranalyse und Challenge vs. Funded (`js/screens/prop-friedhof.js`), Monte-Carlo-Simulation
  der Bestehens-Wahrscheinlichkeit im Web Worker (`js/propworker.js`, Rechenkern `js/propsim.js`; ohne Worker, etwa unter
  `file://`, synchron im Hauptthread), Firmen-Matcher (Sortierung nach Bestehensquote mit den eigenen Tagen, keine Bewertung der Firmen) und
  Erwartungswert der Challenge (Tab Simulation, `js/screens/prop-sim.js`). Phasenwechsel eines Kontos werden mit Datum
  gespeichert; Trades zählen zur Phase, in der sie geschlossen wurden. Alle Preset-Werte (Regeln, Gebühren, Payout-Bedingungen, Instrumente) sind
  unverifiziert und in `web/PROP-PRESETS.md` zum Prüfen aufgelistet. Tests: `web/tests/prop.test.mjs`,
  `web/tests/propsim.test.mjs`.

## Aufbau

```
web/
  index.html            Startseite
  app.html              App
  css/app.css           Design-Tokens (dunkel/hell) und alle Komponenten
  css/landing.css       Startseite
  js/theme.js           Farben (Akzent, Gewinn, Verlust) für App und Startseite
  js/core.js            Analytik ohne DOM (auch in Node nutzbar)
  js/sample.js          Beispieldaten (deterministisch)
  js/store.js           Speicher (localStorage, IndexedDB), Export/Import
  js/ui.js              Formatierung, Symbole, Bausteine, SVG-Diagramme, Dialoge
  js/i18n.js            Sprachen: übersetzt die Oberfläche beim Anzeigen, Gebietsschema für Zahlen und Daten
  js/lang/*.js          Wörterbücher (en, es, zh, hi, pt)
  js/editor.js          Notiz-Editor (Quill 2): Toolbar, Blots, Slash-Befehle, Emojis, Bilder
  vendor/quill/         Quill 2.0.3 (BSD-3-Clause)
  js/app.js             Router, Seitenleiste, Kopfzeile und Kopfreihe unter dem Titel, Trade-Editor, Session, CSV-Import
  js/datepicker.js      Kalender im App-Design für Datumsfelder (Datum, Datum mit Uhrzeit, Monat), auf Touch-Geräten bleibt der System-Kalender
  js/screens/*.js       Die einzelnen Seiten
  tests/core.test.mjs   Tests für die Analytik
```

Tests:

```bash
node --test web/tests/core.test.mjs
```

Tastatur: **N** neuer Trade, **1–6** Bereiche, **Esc** schließt Dialoge.

Neuaufbau ohne Springen: `App.rerender()` baut die Seite nach jeder Eingabe neu auf und hält dabei die Stelle – das Fenster
und jeden gescrollten Bereich darin (Notizliste, Spalten, Tabellen, Listen in Seitenleisten). Bis Screenshots geladen sind,
behält die Seite ihre alte Höhe; wird sie danach kürzer, bleibt unten so viel Luft, wie das Fenster gerade braucht. Das
angeklickte Element (Schalter, Knopf, Auswahlfeld) bleibt an seinem Platz unter der Maus: Ändert die Aktion etwas darüber,
gleicht der Scrollstand das aus (`App.noteAnchor` / `keepAnchor`, nur im normalen Seitenfluss, nicht in Dialogen, Menüs und
eigenen Scrollbereichen). Nur ein Seitenwechsel, eine neue Replay-Karte oder eine andere Dashboard-Vorlage beginnt oben.

## Bewegung und Übergänge

Alle Animationen laufen über eine gemeinsame Skala in `css/app.css` (`--dur-1` 150 ms, `--dur-2` 240 ms, `--dur-3` 380 ms, `--ease`).
`js/motion.js` blendet Karten und Abschnitte beim Reinscrollen ein (einmalig, gestaffelt), kapselt den Seitenwechsel in eine
View Transition und blendet Dialoge, Popover und Toasts aus, bevor sie entfernt werden. Animiert werden nur `transform` und `opacity`.
**Laden** hat eine gemeinsame Bildsprache: `U.loader('sm'|''|'lg')` zeichnet eine kleine Kurslinie, über die ein grünes Stück
gleitet (App-Start mit Logo, Auswertung von Sprachnotizen, Prop-Simulation); `U.spin()` ist ein feiner Ring für Knöpfe
(„Wird erstellt …“); Platzhalter (`.skel`) bekommen einen weichen Glanz, der darüberwandert, statt zu blinken.
Bei „weniger Bewegung“ im System (`prefers-reduced-motion`) ist alles aus. Abschalten: die drei Dauer-Variablen auf `0ms` setzen
oder `js/motion.js` nicht einbinden; ohne das Skript bleibt alles sofort sichtbar.
