# Trading Journal (Web-App)

Ein Trading-Journal im Browser, im Aufbau und Look von TradeZella und TradePath: schwarzer Grund,
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
Beispiele markiert und lassen sich unter **Einstellungen → Daten** mit einem Klick entfernen.

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
- **Dashboard** (Aufbau nach TradeZella): oberer Bereich mit bis zu 5 Kennzahl-Kacheln (Netto P&L,
  Kontostand, Trade- und Tages-Trefferquote, Profit-Faktor, Ø Gewinn/Verlust, Erwartungswert, Tages-,
  Trade- und kombinierte Serie, maximaler und durchschnittlicher Drawdown), unten ein 3-Spalten-Raster
  mit Diagrammen, Kalendern und Listen (Gesamt-Score-Radar, kumulierter P&L, Trefferquote-Verlauf,
  Performance nach Uhrzeit und Haltedauer, P&L pro Tag, täglich & kumuliert, letzte Trades, Kalender,
  Mini-, erweiterter und Jahreskalender, Kontostand, Drawdown-Verlauf, Challenge, Regel-Tracker, Report).
  Jedes Widget hat ein (i) mit Erklärung. **Vorlagen**: mehrere Dashboards anlegen, umbenennen,
  duplizieren, als Standard festlegen, löschen. **Bearbeitungsmodus** mit Drag & Drop, Entfernen,
  Größe (klein/mittel/groß) und Widget-Bibliothek mit Suche. Handy: Kacheln wischbar, Pfeile statt Drag & Drop.
  Neue Widgets: ein Eintrag in `js/widgets.js` (Registry mit Typ, Name, Beschreibung, Bereich, Standardgröße, Info-Text).
- **TradeLog**: sortierbare Tabelle, Filter, Tageskarten mit Mini-Chart, verpasste Trades.
- **Tagesansicht**: Kennzahlen des Tages, Trades, Check-in, Regeln abhaken, Marktphase, Tagesjournal.
- **Statistiken**: 16 Kennzahlen, Tage, Setups/Symbole, Wochentag/Uhrzeit/Haltedauer,
  Fehlerkosten und Emotionen, Marktphase, Zustand (Schlaf, Stress, Stimmung vs. Ergebnis),
  Edge-Check mit 95-%-Intervall und rollierendem Schnitt, Monte Carlo mit Ruin-Wahrscheinlichkeit.
- **Notebook**: drei Spalten (Ordner und Tags, Notizliste, Notiz). Standardordner Trade Notes,
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
- **Einstellungen**: Konten, Regeln, Tags, Limits, Export/Import als JSON (optional mit Anhängen), Beispieldaten.
- **Farben**: Akzentfarbe sowie Gewinn- und Verlustfarbe frei wählbar (Vorlagen oder eigene Farbe), dunkel oder hell.
  Die Wahl gilt für die ganze Website inklusive Startseite.

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
  js/editor.js          Notiz-Editor (Quill 2): Toolbar, Blots, Slash-Befehle, Emojis, Bilder
  vendor/quill/         Quill 2.0.3 (BSD-3-Clause)
  js/app.js             Router, Seitenleiste, Kopfzeile, Trade-Editor, Session, CSV-Import
  js/screens/*.js       Die einzelnen Seiten
  tests/core.test.mjs   Tests für die Analytik
```

Tests:

```bash
node --test web/tests/core.test.mjs
```

Tastatur: **N** neuer Trade, **1–6** Bereiche, **Esc** schließt Dialoge.
