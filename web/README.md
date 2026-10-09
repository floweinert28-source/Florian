# Journalyst (Web-App)

Journalyst ist ein Trading-Journal im Browser, im Aufbau und Look von TradeZella und TradePath: warmes Graphit (dunkle, leicht warme Grautöne mit sanftem Licht von oben links),
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
- **Seitenleiste**: oben der Schriftzug JOURNALYST ohne Logo-Zeichen (ein neues Logo folgt), darunter „Trading Journal App“, eine Trennlinie, dann die Navigation (keine Begrüßung). Der aktive Eintrag ist eine Pille, in die von links Licht in der Akzentfarbe fällt und nach rechts ins Dunkle ausläuft; ihr Rand leuchtet links (unten etwas stärker) und geht nach rechts in Grau über, dazu ein weicher Schein und ein leuchtender Balken am Rand.
  Im eingeklappten Modus nur Symbole (quadratische Knöpfe). Auf niedrigen Bildschirmen etwas dichter.
  Aktiver Eintrag (Ecken 12px): Akzentfarbe links, läuft nach rechts ins Dunkle aus, sehr feiner Rand und
  ein schmaler, leicht leuchtender Balken links am Rand der Leiste. Rand nur dezent, links leicht grün.
  **Hinweis-Punkte** (kleiner runder Punkt, farblich wie der Lichtbalken am aktiven Eintrag) neben Bereichen, in denen etwas wartet (Grund im Tooltip): Dashboard (neuer Recap), TradeLog (offene
  Positionen), Tagesansicht (Check-in fehlt, Mo–Fr), Notebook (heute gehandelt, keine Tagesnotiz), Fortschritt (heute gehandelt,
  Regeln nicht abgehakt), Prop Firms (aktives Konto auf Rot oder verletzt). Ein- und ausschalten, gesamt oder je Bereich, unter
  Einstellungen → Benachrichtigungen. Weitere Bereiche melden sich mit `App.navDot(key, fn)` an.
  Wochen- und Monats-Recap oben auf dem Dashboard sind standardmäßig aus (einmalige Umstellung auch für bestehende Daten
  und Importe über `settings.recapsOffV1`); einschalten unter Einstellungen → Benachrichtigungen.
  Unten die **Konto-Karte** (Profilbild oder Initialen, Name, E-Mail): Klick öffnet ein Menü mit Profil, Coach, Einstellungen,
  Benachrichtigungen, Sprache und dem Hell/Dunkel-Schalter; eingeklappt nur das Profilbild, Menü rechts daneben.
- **Dashboard** (Aufbau nach TradeZella): oberer Bereich mit bis zu 5 Kennzahl-Kacheln (Netto P&L,
  Kontostand, Trade- und Tages-Trefferquote, Profit-Faktor, Ø Gewinn/Verlust, Erwartungswert, Tages-,
  Trade- und kombinierte Serie, maximaler und durchschnittlicher Drawdown), unten ein 3-Spalten-Raster
  mit Diagrammen, Kalendern und Listen (Gesamt-Score-Radar, kumulierter P&L, Trefferquote-Verlauf,
  Performance nach Uhrzeit und Haltedauer, P&L pro Tag, täglich & kumuliert, letzte Trades, Kalender,
  Mini-, erweiterter und Jahreskalender, Kontostand, Drawdown-Verlauf, Challenge, Regel-Tracker, Report).
  Jedes Widget hat ein (i) mit Erklärung. **Vorlagen**: mehrere Dashboards anlegen, umbenennen,
  duplizieren, als Standard festlegen, löschen. **Bearbeitungsmodus** mit Drag & Drop, Entfernen,
  Größe (klein/mittel/groß) und Widget-Bibliothek mit Suche. Handy: Kacheln in zwei Spalten, Pfeile statt Drag & Drop.
  Beim Bearbeiten bleibt ein entferntes Widget als Lücke stehen (neue Widgets füllen sie, Drag & Drop tauscht hinein);
  erst „Speichern“ schließt die Lücken. Die Bibliothek zeigt zu jedem Widget ein eigenes Vorschaubild (`js/widgetpreviews.js`).
  **Zeitraum**: Voreinstellungen plus „Benutzerdefiniert“ mit zwei Monatskalendern nebeneinander (Handy: einer), erster Klick
  Start, zweiter Klick Ende (`js/rangepicker.js`); die Vorgaben links (Heute, Diese Woche … Gesamt) werden nur markiert und im Kalender gezeigt, übernommen wird erst mit „Anwenden“; der gewählte Zeitraum erscheint als schmales, an Wochen- und Monatsrändern rundes Band, Start und Ende als Kachel in der Akzentfarbe; beim Überfahren zeigt nur der Tag unter der Maus einen Rahmen, außerhalb des Kalenders verschwindet die Vorschau. **Filter** als Fenster direkt unter dem Filter-Knopf wie Zeitraum, Konto und Vorlage (`js/screens/dash-filter.js`; kompakt wie die anderen Menüs: 320px breit, höchstens 460px hoch mit scrollendem Inhalt, kleiner Kopf ohne Untertitel, Bereiche ohne eigene Kästen, nur feine Trennlinien; auf dem Handy volle Breite; Klick daneben, Escape oder ein zweiter Klick auf den Knopf schließen es), in Gruppen
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
- **Handy** (bis 560px, Regeln am Ende von `css/app.css`): Kopfreihe als eine umbrechende Werkzeugleiste, „Trade loggen“ als
  runder Knopf unten rechts (Inhalt bekommt unten Platz, Toasts rutschen darüber), Dashboard-Kacheln und Statistik-Kennzahlen
  in zwei Spalten, Kalender mit kurzer Tageszahl („+2,1k“, „−486“, eigene Klasse `.pm`; die Vollform `.p` bleibt für große
  Bildschirme), Reiter in einer Reihe (seitlich scrollbar statt umbrechen), Tabellen kompakt ohne Zeilenumbruch, Dialoge als
  Bottom-Sheet; TradeLog-Blöcke mit festem 18-px-Abstand. Kacheln: das Info-Symbol bleibt neben dem Titel, auch wenn der
  umbricht (eigene Spalte), und in engen Kacheln (Container unter 220px) rutscht der Gewinn/Verlust-Balken mit voller Breite
  unter den Wert, die Beträge bleiben in einer Zeile. Notebook: Suche, Filter und Session-Knopf in einer Reihe; in der
  Notiz-Ansicht Kopfzeile in einer Reihe (Zurück, Datum, Speicherstand, Menü; „Teilen“ nur ab 561px), die Werkzeugleiste
  des Editors als eine seitlich wischbare Zeile und kein runder Knopf über dem Text. Dashboard-Details: Jahreskalender
  wischbar ohne sichtbare Scroll-Leiste, Wochen-Summen im Kalender in Kurzform, „Letzte Trades“ so hoch wie eine Diagramm-Karte
  (Kopf + 280px-Diagramm, feste flex-basis) und zeigt die Zeilen, die hineinpassen, mit enger Tabelle, Kacheltitel in einer Zeile (kleinere Schrift, `short`-Titel „Ø
  Gewinn/Verlust“), Menüs (Vorlagen, Sortierung) bleiben im Bild (`fitPopover` schiebt links verankerte Menüs nach links,
  Grenze ist der sichtbare Bereich), Widget-Bibliothek mit Vorschau, Text und Knopf untereinander. Ab 961px bleibt alles wie gehabt; der Handy-Test `mobiletest` prüft dazu
  alle Routen auf seitlichen Überlauf.
- **TradeLog**: sortierbare Tabelle, Filter, Tageskarten mit Mini-Chart, verpasste Trades. Auf dem Desktop füllt die Liste genau
  das Fenster (wie das Notebook): Kacheln, Reiter und Filter oben, die Tabelle nimmt den Rest und scrollt in ihrer Box, der
  Seitenwähler bleibt unten sichtbar; die Seite selbst scrollt nicht. Trade-Detail und Handy scrollen wie gewohnt.
- **Tagesansicht**: Kennzahlen des Tages, Trades, Check-in, Regeln abhaken, Marktphase, Tagesjournal.
- **Statistiken**: 16 Kennzahlen, Tage, Setups/Symbole, Wochentag/Uhrzeit/Haltedauer,
  Fehlerkosten und Emotionen, Marktphase, Zustand (Schlaf, Stress, Stimmung vs. Ergebnis: je Karte drei ruhige Spalten in Skalen-Reihenfolge mit Bereich und Ø Tages-PZustand (Schlaf, Stress, Stimmung vs. Ergebnis: je Karte drei Spalten in Skalen-Reihenfolge mit kleiner Säule an gemeinsamer Nulllinie, Betrag groß, Tage und Anteil im Plus),L, Tage und Anteil im Plus im Tooltip),
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
- **Fortschritt** mit Serie, Tages-Checkliste, Regeltreue, Aktivitäts-Heatmap und Tilt-Profil. Die Serie hat drei Stufen (Werktage in Folge):
  ab 1 „Angefangen“ (Flamme gedämpft, ganz leichtes Flackern), ab 5 „Im Flow“ (Flamme und Zahl in Akzent mit Schein, leichtes Flackern), ab 20 (≈ ein Monat) „Unaufhaltsam“ als Effekt:
  Flamme in Gold-Grün mit aufsteigenden Funken und Sternchen, Zahl mit wanderndem Schimmer, leuchtende Stufenbalken, wanderndes
  Nordlicht und atmender Rand in der Karte (alles CSS, bei „Bewegung reduzieren“ still). Die Flamme steht frei neben der Zahl
  (kein Kasten), darunter drei Etappen-Punkte auf einer feinen Linie (1 · 5 · 20) mit Stufenwort; die nächste Schwelle und was
  zählt (Werktage mit Trades, Check-in oder Notiz) stehen im Tooltip bzw. im Info-Punkt, kein Satz in der Karte.
  Aufbau: links die Tages-Checkliste, rechts untereinander Aktuelle Regeln, Disziplin pro Woche und Tilt-Profil, zusammen so hoch
  wie die Checkliste (das Tilt-Profil füllt den Rest). Bei wenig Platz zeigt „Disziplin pro Woche“ kurze Daten (03.08.).
  In „Dein Tag“ hakt ein Klick auf „Tagesnotiz geschrieben“ den Punkt ab oder löst ihn wieder (`days[heute].noteDone`, kein Sprung
  ins Notebook); eine Notiz von heute im Notebook hakt ihn automatisch ab. Der Hinweis-Punkt am Notebook verschwindet dann ebenfalls.
- **Sessions**: „Session starten“ mit Check-in, „Session beenden“ mit Regel-Check, Marktphase und Reflexion.
- **Zertifikat-Karten** (Dashboard → „Zertifikat“, Tagesansicht, Statistiken): Certificate of Daily/Weekly/Monthly Profit und Certificate of Performance, bewusst schlicht (Titel, für wen, Ergebnis, Zeitraum, drei Kennzahlen, Unterschriften), in einem Design im Look der App (`data-theme="app"`): warmes Graphit wie die App, Schriftzug JOURNALYST oben links, zentriert, Ergebnis als Pille mit Licht von links und leuchtendem Rand wie der aktive Eintrag der Seitenleiste (grün, bei Verlust rot), Kennzahlen als Kachelstreifen, feiner Kartenrahmen und unten die Kurslinie aus der Ladeanzeige, die auf der Linie über der Fußzeile steht (bei Verlust fallend); Schrift wie in der App (Text in Satoshi über `--font`, Ergebnis, Kennzahlen und Ausstellungsdaten in der Zahlenschrift Onest über `--font-num`); mit Live-Vorschau, Quadrat/Story/Querformat, Beträge ausblenden, PNG-Export in doppelter Auflösung, Kopieren und Teilen.
- **Ruhepunkt**: geführte Sessions vor und nach dem Trading plus Akut-Reset (Abläufe und Texte aus `docs/ruhepunkt.html`). Jede Session wird als Eintrag mit Nutzerkennung gespeichert; „Christlicher Impuls“ ist eine gespeicherte Einstellung, umschaltbar nur in den Einstellungen (unten im Ruhepunkt steht nur noch „Hilfe und Beratung“).
  Beim Betreten schweben 15 Kirschblütenblätter langsam schräg durch den Ruhepunkt-Bereich (nur dort, Klicks gehen durch, bei reduzierter Bewegung keine Blätter); danach treiben weiche Farbflächen in Blau, Rosa und Violett hinter den Inhalten.
- **Mentor**: Chat mit dem Trading-Psychologie-Mentor über den eigenen Server in `server/` (System-Prompt `docs/mentor-systemprompt.md`, Journal-Kontext aus den letzten 20 Trades und dem heutigen Ruhepunkt-Check-in, Verlauf pro Nutzer, Tageslimit). Adresse und Zugangstoken unter Einstellungen → Mentor.
  In der Kopfreihe steht nur das Konto: es bestimmt, aus welchem Konto der Mentor die letzten 20 Trades sieht; der Zeitraum hat keinen Einfluss.
- **Coach Mode** (Konto-Menü unten links → Coach; ein Punkt am Profilbild zeigt neue Aufgaben): ein Trading-Mentor sieht die Journal-Einträge und Kurz-Stats seiner
  Schüler und schreibt Feedback direkt an den Eintrag. Gruppe mit einseitiger Sicht: der Mentor sieht alle Schüler, jeder
  Schüler nur sich selbst. Der Mentor erstellt eine Gruppe und kopiert den Einladungslink (`#/coach/join/<token>`); der
  Schüler sieht vor dem Beitritt die Sichtbarkeits-Liste (Journal-Einträge, Kurz-Stats, Mentor-Notizen, Bilder: ja;
  einzelne Trades, Playbooks, Kontostand, private Notizen: nein), wählt Namen und „nur ab heute“ oder „auch ältere“ und
  bestätigt. Geteilt werden nur Notebook-Notizen ohne Trade-Notizen und Tages-Summen in R und Prozent (`js/coach.js`,
  `snapshot()`), nie einzelne Trades oder Beträge. Mentor-Dashboard je Gruppe (Woche/Monat/Gesamt): Trades, Winrate,
  Profit-Faktor (R), Ø Gewinn/Verlust in R, Max. Drawdown in %, letzter Eintrag, neue Einträge; Klick öffnet das Journal
  (nur lesen) mit Mentor-Notizen (Badge „Mentor“, Name, Zeit; bearbeiten/löschen nur der Mentor). Beim Schüler erscheint
  die Notiz im Notebook unter dem Eintrag plus Hinweis-Punkt am Notebook. Verlassen jederzeit: der Server löscht die
  Daten des Schülers, seine Kopie der Notizen bleibt. Identität ist ein geheimer Schlüssel je Installation
  (`Store.data.coach.key`, Kopfzeile `X-Coach-Key`), Server-Adresse und Zugangstoken kommen aus Einstellungen → Mentor.
  Server: `server/coach.py` (SQLite-Migrationen, Rechte-Trennung), Tests `server/tests/test_coach.py`; Oberfläche
  `js/screens/coach.js`. Nicht enthalten (bewusst): Gruppen-Chat, Trade-Einsicht, Bearbeiten von Schüler-Einträgen,
  Bezahlung, Ranglisten.
  Phase 2 und 3: **Antworten** auf Mentor-Notizen als kleiner Verlauf (Schüler im Notebook, Mentoren in der
  Journal-Ansicht; eigene Antworten löschbar; neue Antworten als „1 Antwort“ in der Schüler-Tabelle).
  **Benachrichtigungen**: Toast und Hinweis-Punkt, auf Wunsch Mitteilung des Browsers (solange Journalyst in einem Tab
  offen ist) und E-Mail über den Server (Adresse und Einwilligung in der Coach-Übersicht, höchstens 20 Mails am Tag;
  ohne SMTP-Zugang auf dem Server ein Hinweis). Der Abgleich läuft alle 2 Minuten und nach jeder Änderung.
  **Co-Coaches**: eigener Link (`#/coach/cojoin/<token>`), gleiche Sicht und Rechte beim Schreiben wie der Mentor;
  umbenennen, Links und schließen nur der Besitzer; Schüler sehen alle Mentoren und bekommen einen Hinweis, wenn einer
  dazukommt; Schüler einer Gruppe können dort nicht Co-Coach werden. **Aufgaben** vom Mentor an einen Schüler oder an
  alle (Text, optional Fälligkeit); der Schüler hakt sie in der Coach-Übersicht ab, der Mentor sieht den Stand.
  **Gruppen-Statistik** (nur Mentoren): aktive Schüler, Trades, Ø Winrate, Ø Profit-Faktor, Ø Gewinn/Verlust in R,
  Ø Max. Drawdown, Journal-Einträge, Notizen und offene Aufgaben im Zeitraum; Durchschnitte, keine Rangliste.
- **Einstellungen** in Bereichen: Profil (Angaben, Profilbild als kleines JPEG, Privatsphäre, 2FA, Daten und Sicherung), Design (Erscheinungsbild: Graphit (Standard, warmes dunkles Grau), Schwarz (tiefschwarz) oder Weiß (hell); der Schalter im Konto-Menü wechselt Dunkel/Hell und behält die gewählte dunkle Variante; vier Schriftarten: Standard „Modern“ (Text in Satoshi, Zahlen in Onest), „Geschwungen“ (Quicksand, Zahlen in Onest), „Rund“ und „Klassisch“, Akzent-, Gewinn-, Verlust- und Break-even-Farbe), Benachrichtigungen, Abo, Konten, Trading, Regeln, Notebook, Mentor, Inhalte (Kategorien und Tags), Logs (Imports und Verlauf).
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
  Equity echt vs. Schatten, Disziplin-Kosten im Zeitraum (ehrlich auch, wenn ein Regelbruch Geld gebracht hat),
  Verstoßliste (10 je Seite, umblättern wie im TradeLog) und Regel-Ranking. Tests: `web/tests/shadow.test.mjs`.
  Zeitraum: nur der gemeinsame Zeitraum oben in der Kopfreihe (Heute bis Gesamt oder eigene Tage, wie auf allen
  Seiten); gerechnet wird immer über alle Trades, damit Serien und Pausen über die Grenze hinweg stimmen, gezeigt
  wird, was im Zeitraum geschlossen wurde. Die Kopfreihe hat hier kein „Trade loggen“ und kein „Session starten“.
  „Mein Regelwerk“: jede Regel ist eine ruhige Kachel mit Namen, kurzer Erklärung und Schalter (zwei bis drei Spalten, auf dem Handy eine); eingeschaltet ist sie leicht getönt, die Eingaben erscheinen darunter. Schalter in der ganzen App: schlanke Spur (36×20), kleiner Knopf, aus = grau, an = Akzentfarbe mit weißem Knopf; der Knopf gleitet mit leichtem Nachfedern und streckt sich beim Drücken, auch wenn die Seite danach neu aufgebaut wird (`App.glideSwitch`); die Eingaben erscheinen nur bei
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
- **Prop Firms** (eigener Bereich, für den Einstieg auf drei Bereiche links in der Kopfreihe reduziert: Übersicht ·
  Auswertung · Konten; Auswertung mit den Reitern Bilanz und Friedhof, der Payout-Planer ist ein aufklappbarer
  Abschnitt in der Bilanz. Rechner, Simulation und Challenge vs. Funded sind entfallen (wenig genutzt); `#/prop/rechner` führt zur
  Übersicht, Simulation und Vergleich zur Bilanz, `#/prop/payout` zur Bilanz mit offenem Payout-Planer. Die Adressen bleiben `#/prop/<ansicht>` (z. B.
  `#/prop/bilanz`); `#/prop/auswertung` und die alten `#/prop/finanzen` und `#/prop/analyse` öffnen die zuletzt benutzte Ansicht. Ruhig gehalten: Kennzahlen als Leiste ohne Fußtexte;
  Konto-Karten zeigen nur Balken für Regeln, die es gibt (Ziel nur in der Challenge), Status nur wenn nicht aktiv,
  Puffer-Details im Tooltip; Filter erst ab fünf Konten; Presets-Tabelle mit Größe, Drawdown, Ziel und Gebühr (Rest unter
  „Ansehen“). Bestandene, geplatzte und archivierte Konten liegen eingeklappt
  unter „Abgeschlossen“; eigene Presets sowie Ampel und Stop-Größe sind aufklappbar; die Eingabeformulare
  für Ausgaben und Payouts öffnen sich über den
  Knopf im Kartenkopf. Journal-Zeitraum und -Konto fehlen in der Kopfreihe, weil Prop-Konten eigene Trades haben):
  eigene Presets (Regeln je Firma und Kontogröße; die früher eingebauten Firmen-Presets erscheinen nicht mehr, weil ihre
  Werte ungeprüft sind und sich laufend ändern – `PropData.PRESETS` dient nur noch den Beispieldaten und Altkonten ohne
  eigene Payout-Bedingungen; der Konto-Dialog zeigt die Preset-Auswahl nur, wenn es eigene Presets gibt), Prop-Konten mit Regel-Snapshot (Preset-Änderungen ändern bestehende Konten nicht), Trades
  lassen sich einem oder mehreren Prop-Konten zuordnen (Copy-Trading). Regel-Engine in `js/prop.js`: Daily Loss
  (Betrag oder %, Reset-Uhrzeit und Zeitzone), Max Drawdown statisch, intraday trailing, Tagesende-trailing und
  trailing mit Lock, Profit Target, Mindest-Handelstage, max. Kontrakte/Lots, Consistency Rule, verbleibender Puffer
  und Ampel. Cockpit mit allen Konten, echte Prop-Bilanz (Ausgaben gegen Payouts, ROI, Kosten pro bestandenem Konto,
  Bestehensquote), Puffer in Stop-Losses,
  Payout-Planer mit Consistency-Warnung, Konto-Friedhof mit Musteranalyse (jedes geplatzte Konto als zweiseitiger Grabstein – vorne nur das Wesentliche (Firma, Konto, Phase, * Start / † Breach, gelebte Tage, Todesursache), per Klick oder „Umdrehen“ dreht er sich um und zeigt hinten eine ruhige Liste (Ergebnis, Trade, Wann, Trade-P&L, Serie davor, Emotion, Fehler) plus die Notiz als Inschrift und den Trade-Link; flacher, ruhiger Stein in den Flächenfarben der App (Silhouette mit Kuppel und eingekerbten Schultern, etwas dunklere Schrifttafel in derselben Form, ohne Struktur, Licht und Riss; Breite folgt der Karte), „R · I · P“, Lebensdaten * Start / † Breach, Todesursache; flacher Sockel in zwei Stufen, darauf (ganz auf der oberen Stufe) zwei Haufen hoher Stumpenkerzen – jede eine zusammenhängende, beleuchtete Wachsform mit geschmolzenem, an den Ecken gerundetem Rand, Läufen und kleiner Pfütze, die nie über die Sockelkante hinausreicht (Läufe an den Seiten sind Teil der Kontur und liegen eng an der Kante an, alle Läufe beginnen genau am Rand mit einem kleinen Überlauf und enden in einem Tropfen), flüssigem Wachs im Krater, weicher Flamme und Lichthof; ein warmer Schein fällt auf den Stein; `js/screens/prop-friedhof.js`, Rechenkern `js/propsim.js`). Phasenwechsel eines Kontos werden mit Datum
  gespeichert; Trades zählen zur Phase, in der sie geschlossen wurden. Alle Preset-Werte (Regeln, Gebühren, Payout-Bedingungen, Instrumente) sind
  unverifiziert und in `web/PROP-PRESETS.md` zum Prüfen aufgelistet. Tests: `web/tests/prop.test.mjs`,
  `web/tests/propsim.test.mjs`.
- **Coupon-Codes** (eigener Bereich in der Gruppe Konten, direkt unter Prop Firms, `js/screens/coupons.js`): Rabatt-Codes für
  Prop Firms aus der Liste `COUPONS` in `js/propdata.js`, je Firma eine Kachel mit Rabatt, Code als gestricheltes Ticket (Klick
  kopiert ihn, Rahmen kurz grün, Toast), Notiz und Link zur Website; Platzhalter tragen die Marke „Beispiel“.
- **Affiliate** (im Konto-Menü unten links unter Coach, nicht in der Navigation, `js/screens/affiliate.js`): für Trading-Content-Creator
  mit eigenem Link und Code. Zwei Ansichten: **Alle Creator** (`#/affiliate`, für dich als Betreiber) mit Kennzahlen (Creator,
  Kunden, Umsatz, Provisionen, Offen), Tabelle je Creator (Code, Kunden, Umsatz, Provision in %, verdient, offen) und Balken
  „Provisionen je Monat“; **Creator-Ansicht** (`#/affiliate/creator`) mit Link und Code zum Kopieren, Verdient, Offen, Kunden
  (davon über Link/Code), Provision, „Verdient je Monat“ und Kundenliste (Datum, Plan, Über, Umsatz, Provision, Status, je 10
  mehr). Provision = Umsatz × Prozent des Creators; die Prozente lassen sich je Creator ändern (Stift in der Tabelle, gespeichert
  in `settings.affiliate.pct`). Offen = Provisionen des laufenden Monats, ältere gelten als ausgezahlt. **Nur Oberfläche:** alle
  Zahlen sind Beispieldaten aus `js/affiliatedata.js` (Marke „Beispieldaten“); Planpreise (29/249 €) und Link-Adresse sind
  Platzhalter, unverifiziert. Echte Daten brauchen später eine Quelle (Zahlungsanbieter/Server). Am Handy blendet die Tabelle
  Nebenspalten aus, damit nichts seitlich scrollt.

## Aufbau

```
web/
  index.html            Startseite
  app.html              App
  css/app.css           Design-Tokens (dunkel/hell) und alle Komponenten
  css/landing.css       Startseite
  js/theme.js           Farben (Akzent, Gewinn, Verlust) für App und Startseite
  js/scroll.js          Weiches, schweres Scrollen: das Rad setzt ein Ziel, die Seite gleitet mit Trägheit nach
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
`js/motion.js` blendet Karten und Abschnitte beim Reinscrollen ein (einmalig, gestaffelt; nur was beim Öffnen unter dem Fenster
liegt), kapselt den Seitenwechsel in eine View Transition und blendet Dialoge, Popover und Toasts aus, bevor sie entfernt werden.
Animiert werden nur `transform` und `opacity`. **Seitenwechsel ohne Rütteln:** alte und neue Seite werden echt überblendet (gleiche
Dauer `--dur-2` und Kurve, die Deckkraft ergibt zusammen immer 1, nichts wird kurz dunkler); Seitenleiste und Kopfzeile stehen still
(nur während des Wechsels, Klasse `vt-on` auf `<html>`, eigene Namen `jy-sidebar`/`jy-topbar` ohne Animation); was sichtbar ist,
steht sofort da (kein Einzug Karte für Karte); das Dashboard zeigt kein Skelett mehr vorab.
**Laden** hat eine gemeinsame Bildsprache: `U.loader('sm'|''|'lg')` zeichnet eine kleine Kurslinie, über die ein grünes Stück
gleitet (App-Start ohne Logo-Zeichen, Auswertung von Sprachnotizen); `U.spin()` ist ein feiner Ring für Knöpfe
(„Wird erstellt …“); Platzhalter (`.skel`) bekommen einen weichen Glanz, der darüberwandert, statt zu blinken.
Bei „weniger Bewegung“ im System (`prefers-reduced-motion`) ist alles aus. Abschalten: die drei Dauer-Variablen auf `0ms` setzen
oder `js/motion.js` nicht einbinden; ohne das Skript bleibt alles sofort sichtbar.

**Kurven:** `UI.smooth` legt eine weiche, monotone Kurve durch die Punkte (wie d3 `curveMonotoneX`). Sie schwingt zwischen zwei
Punkten nie über den höheren oder unter den tieferen hinaus, darum wird z. B. der kumulierte P&L in Statistiken oben nicht abgeschnitten.

**Diagramm-Einzug und Seitenwechsel:** beim echten Seitenwechsel zeichnen sich alle Diagramme (`UI.enterCharts`, allgemein für jeden
Zeichner): Linien von links nach rechts, Flächen und Balken blenden ein, Punkte springen zuletzt auf; beim Neuaufbau nach Eingaben,
bei Fenstergröße und bei „Bewegung reduzieren“ nicht. Wechselt nur ein Parameter derselben Seite (Tag vor/zurück, Statistik-Reiter),
gibt es keine Überblendung der Seite und keinen gestaffelten Einzug. Kopfreihe und Unter-Navigation (Elemente mit `data-subnav`:
Einstellungs-Menü, Statistik-Reiter, Prop-Unterreiter, Affiliate-Umschalter) bleiben stehen; nur der Teil darunter blendet kurz ein
(`.content.swap`, nur Deckkraft ab 0,35 – kein Aufblitzen, keine Verschiebung, keine Schnappschüsse). Ohne `data-subnav` blendet
alles außer der Kopfreihe.

`js/scroll.js` macht das Scrollen der ganzen App weich und „schwer“ wie auf edlen Websites: das Mausrad setzt nur ein Ziel,
die Seite gleitet mit Trägheit hinterher (Anteil 0,075 des Restwegs pro Bild; kleiner = träger). Nur das Fenster wird so bewegt –
Bereiche mit eigenem Scrollen (Notiz-Spalten, Tabellen, Menüs, Dialoge), Tastatur, Scrollbalken und Touch bleiben nativ. Bei
„Bewegung reduzieren“, auf Touch-Geräten und bei offenem Dialog passiert nichts; programmatisches Scrollen (Seitenwechsel,
Scrollstand halten) bricht die Bewegung ab. Ohne das Skript scrollt alles wie gewohnt.
