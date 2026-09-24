# Trading Journal (Web-App)

Ein Trading-Journal im Browser, im Aufbau und Look von TradeZella und TradePath: schwarzer Grund,
Neongrün als Akzent, Seitenleiste mit Dashboard, TradeLog, Tagesansicht, Statistiken, Journal,
Bibliothek, Strategien, Fortschritt, Coach, Zen-Modus und Einstellungen.

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
- **Dashboard**: Netto-P&L, Profit-Faktor, Trade- und Tages-Win-Rate mit Halbkreis-Anzeigen,
  Ø Gewinn/Verlust, täglicher und kumulierter P&L, Journal-Score als Radar (Win-Rate, Profit-Faktor,
  Gewinn/Verlust, Konsistenz, Regeltreue, Drawdown), Disziplin und Fehlerkosten, Strategie-Performance,
  Monatskalender mit Wochensummen, letzte Trades, Tilt-Warnungen. Widgets per „Layout“ ein- und ausblendbar.
- **TradeLog**: sortierbare Tabelle, Filter, Tageskarten mit Mini-Chart, verpasste Trades.
- **Tagesansicht**: Kennzahlen des Tages, Trades, Check-in, Regeln abhaken, Marktphase, Tagesjournal.
- **Statistiken**: 16 Kennzahlen, Tage, Setups/Symbole/Strategien, Wochentag/Uhrzeit/Haltedauer,
  Fehlerkosten und Emotionen, Marktphase, Zustand (Schlaf, Stress, Stimmung vs. Ergebnis),
  Edge-Check mit 95-%-Intervall und rollierendem Schnitt, Monte Carlo mit Ruin-Wahrscheinlichkeit.
- **Journal** mit Ordnern, **Bibliothek** mit Filterkacheln, **Strategien** mit Kennzahlen,
  **Fortschritt** mit Serie, Tages-Checkliste, Regeltreue, Aktivitäts-Heatmap und Tilt-Profil,
  **Coach** mit regelbasierten Einsichten, **Zen-Modus** ohne Kontostand.
- **Sessions**: „Session starten“ mit Check-in, „Session beenden“ mit Regel-Check, Marktphase und Reflexion.
- **Einstellungen**: Konten, Regeln, Tags, Limits, Export/Import als JSON (optional mit Anhängen), Beispieldaten.

## Aufbau

```
web/
  index.html            Startseite
  app.html              App
  css/app.css           Design-Tokens (dunkel/hell) und alle Komponenten
  css/landing.css       Startseite
  js/core.js            Analytik ohne DOM (auch in Node nutzbar)
  js/sample.js          Beispieldaten (deterministisch)
  js/store.js           Speicher (localStorage, IndexedDB), Export/Import
  js/ui.js              Formatierung, Symbole, Bausteine, SVG-Diagramme, Dialoge
  js/app.js             Router, Seitenleiste, Kopfzeile, Trade-Editor, Session, CSV-Import
  js/screens/*.js       Die einzelnen Seiten
  tests/core.test.mjs   Tests für die Analytik
```

Tests:

```bash
node --test web/tests/core.test.mjs
```

Tastatur: **N** neuer Trade, **1–8** Bereiche, **Esc** schließt Dialoge.
