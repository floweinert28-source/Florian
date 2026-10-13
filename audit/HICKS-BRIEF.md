# Zusatz-Audit: „Jeder Screen will genau eine Sache“ (Hick's Law)

Auftrag des Nutzers (wörtlich übernommen):

KERNAUSSAGE: „Every screen in your app should want exactly one thing from the user.“ Jeder Bildschirm soll genau eine Sache vom Nutzer wollen.
Vorbilder: Spotify will, dass du Play drückst; Netflix, dass du die nächste Folge startest; Tinder, dass du weiterwischst.
Grundlage ist Hick's Law (W. E. Hick, 1952): Je mehr Auswahlmöglichkeiten, desto länger dauert die Entscheidung. Diese Reibung kostet Nutzer.

DIE 5 REGELN
1. Jeder Screen hat genau eine klare Hauptaktion.
2. Der Hauptknopf sieht wichtiger aus als alles drumherum (Farbe, Größe, Füllung).
3. Erweiterte Optionen sind versteckt, bis man sie braucht (z. B. hinter „Mehr Optionen“).
4. Nie zwei Knöpfe, die gleich wichtig aussehen. Der zweite ist sekundär (nur Umrandung oder Text).
5. Was gerade nicht relevant ist, wird nicht gezeigt (z. B. bei leeren Listen keine Filter, kein Sortieren, kein Löschen, sondern nur der eine Knopf, der weiterhilft).

Beispiele: Playlist: viele gleich große Knöpfe → ein großer „Play“-Knopf. „New post“: „Publish“ von grau zu auffällig. „Export video“: Technik-Einstellungen hinter „More options“, nur „Export“ bleibt. Preisseite: „Start free trial“ gefüllt, „Book a demo“ nur umrandet. Leerer Dateiordner: Edit/Share/Rename/Delete weg, nur „Upload a file“.

AUFGABE: Jeden Screen und jeden Dialog von Journalyst gegen die 5 Regeln prüfen. Pro Screen beantworten:
- Was ist hier die EINE Hauptaktion?
- Ist sie optisch klar die wichtigste?
- Welche Knöpfe konkurrieren gleichwertig mit ihr?
- Welche Optionen könnten versteckt werden, bis man sie braucht?
- Was wird gezeigt, obwohl es gerade nicht relevant ist (vor allem bei leeren Zuständen ohne Trades)?
Dann konkrete Änderungen vorschlagen, sortiert nach Wirkung. (Umsetzung erst nach Zustimmung des Nutzers.)

BESONDERS PRÜFEN:
- Dashboard: Ist „Trade loggen“ die klare Hauptaktion, oder konkurrieren Zeitraum, Konto und andere Knöpfe gleichwertig damit?
- TradeLog leer: Nur „CSV importieren“ / „Trade loggen“ zeigen statt Filter, Sortierung, Spalten.
- „Trade loggen“-Dialog: Pflichtfelder (Symbol, Richtung, Einstieg, Ausstieg, Kontrakte) sichtbar, Zusatzfelder (Stop, Ziel, Setup, Notizen, Screenshots) hinter „Mehr Optionen“. „Speichern“ primär, „Abbrechen“ sekundär.
- Alle Dialoge und Modals: genau ein gefüllter Hauptknopf, der Rest sekundär.
- Schatten-Ich, Blind-Replay, Notebook, Coach, Zertifikat: Was soll der Nutzer dort als Erstes tun, und ist genau das hervorgehoben?
- Leere Zustände überall: ein Satz Erklärung und ein Knopf, nicht mehr.

WICHTIG: Das Design (dunkles Erscheinungsbild, Farben, Schriften, Rundungen, Symbole) bleibt wie es ist. Es geht nur um Hierarchie, Reduktion und Reihenfolge, nicht um neues Styling. Keine Funktionen entfernen, nur besser ordnen oder verstecken.

## Hierarchie-Stufen, die es im Design schon gibt (für Vorschläge verwenden, nichts Neues erfinden)
- Primär: der eine hervorgehobene Knopf – „Trade loggen“ (`.btn.accent`: Kartenfläche mit grün getöntem Verlaufsrand und grüner Schrift, app.css:3137) oder der gefüllte `.btn.primary` (einziger wirklich gefüllter Knopf, app.css:274), z. B. Speichern in Dialogen. (Korrigiert nach Faktenprüfung: `.btn.accent` ist NICHT gefüllt.)
- Sekundär: umrandeter Knopf `.btn` (Rahmen, keine Füllung).
- Tertiär: `.btn.ghost` (nur Text/Symbol, kein Rahmen) oder Textlink.
- Symbol-Knöpfe `.btn.icon-only` für Werkzeuge; Menüs/Popover für selten gebrauchte Optionen; Abschnitt „Mehr Optionen“ (aufklappbar) für Zusatzfelder.

## Material
Wie im Haupt-Audit (siehe BRIEF.md im selben Ordner): Screenshots unter `shots/<theme>-<breite>/` und `shots/extra-*/`, Code unter /home/user/Florian/web. Zusätzlich: `shots/extra-dark-1440/replay.png`, `replay_karte.png`, `csv_import.png` (Blind-Replay ist über ein Feature-Flag versteckt, wird aber mitgeprüft).

## Form der Vorschläge
Jeder Vorschlag: welcher Screen und Zustand, welche Regel (1–5), was genau passiert (welcher Knopf wird primär, welcher sekundär/tertiär, was wandert in ein Menü/„Mehr Optionen“, was wird in welchem Zustand ausgeblendet und wo bleibt es erreichbar), Wirkung (1 = groß, 2 = mittel, 3 = klein), Aufwand (S/M/L), Beleg (Screenshot, datei:zeile). Keine Styling-Änderungen, keine entfernten Funktionen.
