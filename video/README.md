# Journalyst – Launch-Video

Launch-Video im Stil von „Numtera“ (ObiN Studio, https://www.youtube.com/watch?v=awUYikrGsKk), in Journalyst-Grün.
1920 × 1080, 60 fps, 45,5 Sekunden, Englisch, ohne Ton. Alle Schnitte liegen auf einem 120-BPM-Raster (alle 0,5 s),
Musik in diesem Tempo passt also direkt darunter.

Die App-Szenen sind eigene, helle Karten im Stil des Videos (angelehnt an das helle Erscheinungsbild der App, Satoshi und
Onest). Alle Zahlen, Kurven, Trades und Regeln darin kommen aber aus der echten App.

| Zeit | Szene |
| --- | --- |
| 0–6,5 s | „Same mistake, / Different day.“ getippt, markiert und gelöscht, an derselben Stelle „Same loss… again?“, Flug durch das „o“ |
| 6,5–8,5 s | „Stop repeating mistakes.“ auf Weiß, grüne Linien zeichnen sich |
| 8,5–11,5 s | „Meet [J] Journalyst“: Buchstaben aus der Unschärfe, Logo springt dazwischen |
| 11,5–14 s | „The trading journal that trains your discipline.“ |
| 14–16,5 s | Dashboard schräg im Raum, Net P&L, Profit factor und die Equity-Karte ragen kurz heraus |
| 16,5–19,5 s | Trade loggen: ES, Long, Einstieg, Ausstieg, Kontrakte, +$925.00, „Save trade“ |
| 19,5–21,5 s | TradeLog: der neue Trade rutscht oben hinein |
| 21,5–24,5 s | Links der Trade, rechts werden die drei aktiven Regeln abgehakt, „Discipline 100“ |
| 24,5–26,5 s | „Every broken rule has a { price }“ |
| 26,5–30 s | Shadow Self: Disziplin-Kosten zählen hoch, echt gegen Schatten-Ich, der Abstand als Preis |
| 30–33 s | „Your Shadow Self shows you [ what discipline is worth ]“ |
| 33–45,5 s | „Others count trades.“ / „We build traders.“ / Logo / „The trading journal for discipline.“ / „Start your journal“ |

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
src/scenes/Product.tsx   Dashboard, Trade loggen, TradeLog, Regeln, Shadow Self
src/scenes/Shadow.tsx    { price } und [ what discipline is worth ]
src/scenes/Outro.tsx     Aussagen, Logo, getippter Satz, Aufruf
src/ui/Kit.tsx           Karten, Felder, Diagramme, Häkchen
src/ui/Text.tsx          Schreibmaschine, Buchstaben und Wörter aus der Unschärfe, Textmaße
src/ui/Bg.tsx            weiche grüne Verläufe
src/anim.ts              Kurven, Feder, Kamera
src/theme.ts             Farben und Schrift
```

Bewegungsregeln: `.claude/skills/motion-rules` im Repo-Root.
