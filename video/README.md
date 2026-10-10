# Journalyst – Launch-Video

Launch-Video im Stil von „Numtera“ (ObiN Studio, https://www.youtube.com/watch?v=awUYikrGsKk), in Journalyst-Grün.
1920 × 1080, 60 fps, 47,5 Sekunden, Englisch, ohne Ton. Die Schnitte liegen grob auf einem 120-BPM-Raster.

Die App-Szenen sind vereinfachte Karten im Design der App (dunkles Erscheinungsbild: Farben, Rundungen, Symbole,
Abzeichen, Diagramme, Satoshi für Text, Onest für Zahlen). Alle Zahlen, Kurven, Trades und Regeln kommen aus der echten App.
Der Produkt-Teil ist ein durchgehender Ablauf ohne harte Schnitte: Eine Fläche wird vom Knopf „+ Log trade“ zum Formular,
dann zur neuen Zeile im TradeLog und schließlich zur Karte bei der Regelprüfung.

| Zeit | Szene |
| --- | --- |
| 0–6,5 s | „Same mistake, / Different day.“ getippt, markiert und gelöscht, an derselben Stelle „Same loss… again?“, Flug durch das „o“ |
| 6,5–8,5 s | „Stop repeating mistakes.“ |
| 8,5–11,5 s | „Meet [J] Journalyst“ |
| 11,5–14 s | „The trading journal that trains your discipline.“ |
| 14–18 s | Dashboard schräg im Raum, Net P&L, Overall score und Cumulative P&L ragen kurz heraus, dann wird es flach |
| 18–21,7 s | Klick auf „+ Log trade“, das Formular wächst aus dem Knopf, ES, Long, Einstieg, Ausstieg, Kontrakte, „Save trade“ |
| 21,7–24,8 s | Das Formular schrumpft zur neuen Zeile im TradeLog |
| 24,8–29 s | Die Zeile wird zur Karte, rechts werden die drei aktiven Regeln abgehakt, „Discipline 100“ |
| 29–31,5 s | „Every broken rule has a price.“ |
| 31,5–35,5 s | Shadow Self: Disziplin-Kosten zählen hoch, echt gegen Schatten-Ich, der Abstand als Preis |
| 35,5–38,5 s | „Your Shadow Self shows you what discipline is worth.“ |
| 38,5–42,5 s | „Others count trades.“ / „We build traders.“ |
| 42,5–47,5 s | Endkarte: Logo, „The trading journal for discipline.“, Knopf „Start your journal“ |

## So entsteht es

```bash
cd video
npm install
npm run fonts                 # Satoshi und Onest nach public/fonts (nicht im Repository, Lizenz)

# Werte aus der Web-App holen (Ordner web/ des Branches claude/trading-journal-app-cqdxfe):
#   git archive origin/claude/trading-journal-app-cqdxfe web | tar -x -C /tmp/tj
#   (cd /tmp/tj/web && python3 -m http.server 8787 --bind 127.0.0.1)
npm run capture               # schreibt src/data/app.json

npm run stills -- 7.5s 21s    # einzelne Bilder nach out/stills/ zur Sichtkontrolle
npm run studio                # Vorschau
npm run render                # out/journalyst.mp4
```

Die Aufnahme setzt die Uhr der App auf Mittwoch, 30.09.2026, damit die Beispieldaten den Monat füllen, und loggt einen
ES-Trade (Long, 5.742,25 → 5.751,50, zwei Kontrakte, +$925.00). Der Dialog der App hat keine Felder für Stop, Ziel und
Setup; die gibt das Skript unsichtbar mit, damit R, Setup und „Discipline 100“ stimmen.

## Aufbau

```
src/Launch.tsx           Zeitplan aller Szenen und Übergänge (Schnitt, Überblendung, Unschärfe, Wischen)
src/app.ts               Werte aus src/data/app.json für die Karten
src/scenes/Problem.tsx   0–6,5 s
src/scenes/Intro.tsx     Stop, Meet, Claim
src/scenes/Product.tsx   durchgehender Ablauf Dashboard → Log trade → TradeLog → Regeln, dazu Shadow Self
src/scenes/Shadow.tsx    „price“ und „what discipline is worth“
src/scenes/Outro.tsx     zwei Aussagen und die Endkarte
src/ui/Kit.tsx           Bausteine im App-Design: Farben, Symbole, Kacheln, Abzeichen, Gauge, Ring, Radar, Kurven
src/ui/Text.tsx          Schreibmaschine, Buchstaben und Wörter aus der Unschärfe, Textmaße
src/ui/Bg.tsx            weiche grüne Verläufe
src/anim.ts              Kurven, Feder, Kamera
src/theme.ts             Farben und Schrift
```

Bewegungsregeln: `.claude/skills/motion-rules` im Repo-Root.
