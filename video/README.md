# Journalyst – Launch-Video

Launch-Video im Stil von „Numtera“ (ObiN Studio, https://www.youtube.com/watch?v=awUYikrGsKk), aber mit dem **echten**
Journalyst-Dashboard und in Journalyst-Grün. 1920 × 1080, 60 fps, 64 Sekunden, Englisch, ohne Ton.
Alle Schnitte liegen auf einem 120-BPM-Raster (alle 0,5 s), Musik in diesem Tempo passt also direkt darunter.

| Zeit | Szene |
| --- | --- |
| 0–8 s | Problem: „Same mistake, / Different day.“ getippt, verstreute Notizen und Tabellen, „Same loss… again?“, Flug durch das „o“ |
| 8–10 s | „Stop repeating mistakes.“ auf Weiß, grüne Linien zeichnen sich |
| 10–13 s | „Meet [J] Journalyst“: Buchstaben aus der Unschärfe, Logo springt dazwischen |
| 13–16 s | „The trading journal that trains your discipline.“ |
| 16–19,5 s | Dashboard schräg im Raum, die fünf Kennzahl-Kacheln heben sich, „Built for serious traders“ |
| 19,5–25 s | Trade loggen im echten Dialog: Symbol ES wählen, Einstieg, Ausstieg, Kontrakte tippen, „Save trade“ |
| 25–27,5 s | TradeLog: der neue Trade rutscht oben hinein, Fahrt bis zur Spalte „Rules“ |
| 27,5–33 s | Geteiltes Bild: „Recent trades“ links, rechts werden die drei aktiven Regeln abgehakt, „Discipline 100“ |
| 33–35 s | „Every broken rule has a { price }“ |
| 35–41 s | Shadow Self: Disziplin-Kosten zählen hoch, Kurven echt gegen Schatten-Ich zeichnen sich |
| 41–45 s | „Your Shadow Self shows you [ what discipline is worth ]“ |
| 45–48 s | Prop Firms schräg im Raum, das Topstep-Konto hebt sich |
| 48–54 s | „Every account. Every rule.“ / „Others count trades.“ / „We build traders.“ |
| 54–64 s | Logo, „The trading journal for discipline.“ getippt, „Start your journal“ |

## So entsteht es

Die App-Bilder sind keine Nachbauten: `scripts/capture.cjs` nimmt die echte Web-App mit dreifacher Auflösung auf, ganze
Seiten als JPEG und einzelne Teile freigestellt als PNG (Kacheln, der Dialog in neun Zuständen, Tabelle, Regeln, Karten).
Beim Tippen deckt Remotion die Zeichen aus dem jeweils nächsten echten Zustand einzeln auf.

```bash
cd video
npm install
npm run fonts                 # Satoshi und Onest nach public/fonts (nicht im Repository, Lizenz)

# Web-App bereitstellen (Ordner web/ des Branches claude/trading-journal-app-cqdxfe), Schriften unter /_fonts:
#   git archive origin/claude/trading-journal-app-cqdxfe web | tar -x -C /tmp/tj
#   mkdir -p /tmp/tj/web/_fonts && cp public/fonts/*.woff2 /tmp/tj/web/_fonts/
#   (cd /tmp/tj/web && python3 -m http.server 8787 --bind 127.0.0.1)
npm run capture               # Bilder nach public/cap/, Positionen nach src/data/cap.json

npm run stills -- 7.5s 21s    # einzelne Bilder nach out/stills/ zur Sichtkontrolle
npm run studio                # Vorschau
npm run render                # out/journalyst.mp4
```

Die Aufnahme setzt die Uhr der Seite auf Mittwoch, 30.09.2026, damit die Beispieldaten den Monat füllen, und loggt einen
ES-Trade (Long, 5.742,25 → 5.751,50, zwei Kontrakte, +$925.00). Einige deutsche Reste in der englischen Oberfläche
(„Offene Positionen (1)“, „Regelbrüche haben dich das gekostet“, „Offener Trade · Risiko … geplant“ und „Disziplin“ in der Vorschau des Dialogs) ersetzt sie nur
für die Aufnahme; in der App selbst fehlen diese Übersetzungen noch.

## Aufbau

```
src/Launch.tsx          Zeitplan aller Szenen und Übergänge (Schnitt, Überblendung, Unschärfe, Wischen)
src/scenes/Problem.tsx  0–8 s
src/scenes/Intro.tsx    Stop, Meet, Claim
src/scenes/Planes.tsx   Dashboard und Prop Firms schräg im Raum
src/scenes/LogTrade.tsx Trade loggen
src/scenes/Journal.tsx  TradeLog und Regelprüfung
src/scenes/Shadow.tsx   { price }, Shadow Self, [ what discipline is worth ]
src/scenes/Outro.tsx    Aussagen, Logo, getippter Satz, Aufruf
src/ui/Text.tsx         Schreibmaschine, Buchstaben und Wörter aus der Unschärfe, Textmaße
src/ui/Bg.tsx           weiche grüne Verläufe
src/anim.ts             Kurven, Feder, Kamera
src/theme.ts            Farben und Schrift
```

Bewegungsregeln: `.claude/skills/motion-rules` im Repo-Root.
