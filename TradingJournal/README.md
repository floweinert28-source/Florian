# Trading Journal

Natives Trading-Journal für macOS, iPhone und iPad. SwiftUI, SwiftData mit iCloud-Sync,
Swift Charts, On-Device-Spracherkennung. Deutschsprachig, lokalisierbar aufgebaut.

## In Xcode starten

1. **Xcode 16 oder neuer** öffnen und `TradingJournal/TradingJournal.xcodeproj` laden.
2. Im Projekt-Navigator das Projekt anklicken → Target **TradingJournal** → **Signing & Capabilities**:
   - dein **Team** wählen,
   - die **Bundle-ID** `com.florian.TradingJournal` auf eine eigene ID ändern (z. B. `de.deinname.TradingJournal`),
   - unter **iCloud** den Container auf `iCloud.<deine Bundle-ID>` umstellen (in beiden Entitlements-Dateien
     `TradingJournal.entitlements` und `TradingJournalMac.entitlements` steht derselbe Container).
3. Oben das Ziel wählen: **My Mac**, ein iPhone- oder ein iPad-Simulator.
4. **⌘R**. Beim ersten Start werden automatisch Beispieldaten angelegt (rund 140 Trades über vier Monate).
   Sie lassen sich unter *Einstellungen → Daten → Beispieldaten* jederzeit entfernen.

**Ohne bezahltes Developer-Programm** (nur kostenlose Apple-ID): iCloud/CloudKit und Push sind dann nicht
verfügbar. Entferne in beiden Entitlements-Dateien die Schlüssel `aps-environment`,
`com.apple.developer.icloud-container-identifiers` und `com.apple.developer.icloud-services`.
Die App erkennt das und arbeitet rein lokal.

**Tests:** ⌘U führt die Kernlogik-Tests (`JournalCoreTests`, 43 Tests) und die App-Tests
(`TradingJournalTests`) aus. Das Paket lässt sich auch ohne Xcode testen:
`cd Packages/JournalCore && swift test`.

## Architektur

```
TradingJournal/
├── Packages/JournalCore/          Plattformunabhängige Analyse-Engine (Swift-Package, keine UI)
│   ├── Model/                     TradeRecord, TradePlan, MarketRegime, Drafts, AnalysisPeriod
│   ├── Analytics/                 Kennzahlen, Kapitalkurve, Zeitanalyse, Fehlerkosten, Disziplin,
│   │                              Tilt-Erkennung, Edge-Check, Monte Carlo, Regime- und Zustandsanalyse
│   ├── Import/                    CSV-Parser, Spaltenzuordnung, Zahlen-/Datumserkennung
│   └── SampleData/                Reproduzierbarer Beispieldatensatz
├── TradingJournal/                App (SwiftUI, MVVM)
│   ├── App/                       Einstieg, Navigation (Sidebar / Tabs), Menübefehle, AppModel
│   ├── Models/                    SwiftData-Modelle (CloudKit-tauglich) + JournalSnapshot
│   ├── DesignSystem/              Farben, Abstände, Typografie, Karten, Kacheln, Chips, Leerzustände
│   ├── Services/                  Einstellungen, Tilt-Monitor, Import, Beispieldaten, Audio, Speech, Sentiment
│   └── Features/                  Dashboard, Trades (+ Import), Analyse, Psychologie, Einstellungen
└── TradingJournalTests/           App-Tests (In-Memory-Datenbank)
```

**Prinzip:** Die App überführt ihre SwiftData-Objekte in Wertstrukturen (`TradeRecord`) und übergibt sie an
`JournalCore`. Die gesamte Rechenlogik ist dadurch ohne Datenbank und UI testbar – und lief bereits unter Linux
durch die Tests. Die Views sind schlank; Berechnungen liegen in `DashboardMetrics`, `JournalSnapshot`
und den Core-Funktionen. Rechenintensives (Monte Carlo) läuft im Hintergrund.

### Datenmodell (SwiftData, alle Beziehungen optional, alle Werte mit Standard – Voraussetzung für CloudKit)

| Modell | Inhalt |
| --- | --- |
| `Trade` | Symbol, Richtung, Menge, Punktwert, Kurse, Zeiten, Gebühren, Plan (Einstieg/Stop/Ziel/Grund), tatsächlicher Stop, MAE/MFE-Kurse, Notizen, Tags, gebrochene Regeln, Screenshots, Sprachnotizen |
| `Tag` | Name + Art (`setup`, `strategy`, `marketPhase`, `mistake`, `emotion`), frei anlegbar |
| `TradeAttachment` | Screenshot (externer Speicher) + Bildunterschrift |
| `VoiceNote` | Audio (externer Speicher), Dauer, Transkript, Stimmungswert |
| `DailyCheckIn` | Schlaf, Stress (1–5), Stimmung (1–5), Notiz je Tag |
| `MarketRegimeEntry` | Trend/Seitwärts × Volatilität je Tag, `source` (manuell/automatisch) für spätere Automatik |
| `MissedTrade` | Gesehenes Setup mit Plan, hypothetischem Ausstieg, Grund |
| `TradingRule` | Persönliche Regel, aktiv/inaktiv, Reihenfolge |

Konto-Größe, Währung und Tilt-Grenzen liegen in `UserDefaults` (`SettingsStore`).

### Design-System

Optik wie bei modernen Trading-Dashboards: dunkles Erscheinungsbild als Standard (Hell und System wählbar),
violetter Akzent, kräftiges Grün/Rot für Ergebnisse, flache Karten mit feiner Kontur, Sidebar mit Wortmarke.
Asset-Farben: `AccentColor`, `Profit`, `Loss`, `Warning`, `ScreenBackground`, `SidebarBackground`, `CardBackground`,
`CardBorder`, `ElevatedFill`. Bausteine: `Card`/`TitledCard`, `StatTile` mit Gauge (`DonutGauge`, `ArcGauge`,
`WinLossBars`), `ScoreRing`, `LabeledBar`, `RadarChartView` (Trader-Score), `CalendarHeatmapView`, `TagChip`,
`DirectionBadge`, `BannerView`, `EmptyStateView`, `FlowLayout`, `Screen`/`AdaptiveColumns`, `PeriodBar`.

**Dashboard-Aufbau:** Zeitraum-Filter · fünf KPI-Kacheln (Netto-P&L, Trade-Win-Rate, Profit-Faktor,
Tages-Win-Rate, Ø Gewinn/Verlust) mit Gauges · Trader-Score-Radar (Win-Rate, Profit-Faktor, Ø Gewinn/Verlust,
Erholung, Drawdown, Konsistenz) · kumulierte und tägliche Netto-P&L · Kalender-Heatmap mit Wochensummen und
Tagesjournal je Tag · Disziplin-Score und Fehlerkosten · letzte Trades als Tabelle. Trades sind auf Mac und iPad
eine sortierbare Tabelle mit Kennzahlen-Leiste, auf dem iPhone eine nach Tagen gruppierte Liste.

## Features

**Basis:** manuelle Erfassung (⌘N) mit Plan-vor-dem-Trade · CSV-Import mit Spaltenzuordnung, automatischem
Vorschlag, Zahlen-/Datumsformaten und Vorschau (⌘I) · Tags für Setup, Strategie, Marktphase, Fehler, Emotionen
(frei anlegbar, auch direkt im Formular) · Kennzahlen gesamt und je Setup/Strategie/Phase (Win-Rate, Ø Gewinn/Verlust,
Profit-Faktor, Expectancy, Ø R, Drawdown, Serien) · MAE/MFE mit Auswertung, wie viel der Bewegung mitgenommen
wurde · Screenshots per Drag & Drop, Foto oder Datei mit Bildunterschrift · Auswertung nach Wochentag, Uhrzeit
und Haltedauer.

**Erweitert:** Fehlerkosten in Währung, gesamt und je Fehlertyp (auch auf dem Dashboard für den Monat) ·
Tilt-Warnung nach jedem erfassten Trade (größere Position nach Verlust, viele Trades in kurzer Zeit,
Verlustserie, Revenge-Wiedereinstieg, Tagesverlust-Grenze), gewichtet mit der eigenen Historie
(„An 6 von 8 Tagen mit diesem Muster negativ“), als Banner und optional als Mitteilung · Plan vs. Ausführung
mit Abweichung in R und Disziplin-Score je Trade, Tag, Woche, Monat · Journal der verpassten Trades mit
hypothetischem Ergebnis und Gründen · Edge-Check mit 95 %-Konfidenzintervall (t-Verteilung), verständlicher
Erklärung, benötigter Stichprobe und rollierender Expectancy samt Warnung bei nachlassendem Edge ·
Tages-Check-in (Schlaf, Stress, Stimmung) mit Korrelation zum Tagesergebnis · Markt-Regime je Tag
(manuell, Automatik vorbereitet) und Matrix Setup × Regime · Sprachnotizen mit On-Device-Transkription
(Speech) und Stimmungsanalyse (NaturalLanguage) · Monte-Carlo-Bootstrap mit Drawdown-Bereich,
Endkapital-Perzentilen, Risk of Ruin und Beispielverläufen.

## Tastaturkürzel (Mac, iPad mit Tastatur)

| Kürzel | Aktion |
| --- | --- |
| ⌘N | Neuer Trade |
| ⌘I | CSV importieren |
| ⌘⇧M | Verpassten Trade erfassen |
| ⌘⇧D | Tages-Check-in |
| ⌘1 … ⌘5 | Übersicht, Trades, Analyse, Psychologie, Einstellungen |
| ⌘E | Trade bearbeiten (Detailansicht) |
| ⌘R | Monte-Carlo-Simulation starten |
| ⌘, | Einstellungen |

## Getroffene Annahmen

- Mindestversionen iOS 17 / macOS 14, Swift-6-Compiler mit Sprachmodus 5 für die App (SwiftUI/SwiftData-Kompatibilität);
  das Core-Paket ist im Swift-6-Sprachmodus geschrieben.
- Ergebnisse werden aus Kursen berechnet: `(Ausstieg − Einstieg) × Richtung × Menge × Punktwert − Gebühren`.
  Ein importiertes Netto-Ergebnis hat Vorrang. Das Risiko (für R-Multiples) stammt aus dem tatsächlichen Stop,
  sonst aus dem geplanten Stop.
- Ein Trade gilt als regelkonform, wenn er weder Fehler-Tags noch gebrochene Regeln trägt.
- Beispieldaten werden beim ersten Start nur angelegt, wenn die Datenbank leer ist. Auf einem zweiten Gerät
  kann es kurz bis zur iCloud-Synchronisation dauern; der Schalter in den Einstellungen entfernt Beispieldaten
  auf allen Geräten.
- Kontogröße und Währung sind Geräte-Einstellungen (kein Sync).

## Weiterführende Schritte

- Broker-APIs: `TradeDraft` ist die gemeinsame Schnittstelle – ein neuer Importer liefert einfach `[TradeDraft]`.
- Regime-Automatik: `MarketRegimeEntry.source = .automatic` ist vorbereitet; ein Service kann Tagesdaten einstufen.
- Weitere Sprachen: Übersetzungen in `Resources/Localizable.xcstrings` ergänzen.
