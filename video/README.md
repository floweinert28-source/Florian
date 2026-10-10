# Journalyst – Launch-Video

Launch-Video im Stil von „Numtera“ (ObiN Studio, https://www.youtube.com/watch?v=awUYikrGsKk), in Journalyst-Grün.
1920 × 1080 (`journalyst.mp4`) und hochkant 1080 × 1920 fürs Handy (`journalyst-vertical.mp4`), 60 fps, 47,5 Sekunden, Englisch.
Beide Fassungen kommen aus denselben Szenen; jede Szene liest das Format (`src/format.ts`) und ordnet sich danach an. Ton: nur Sound-Effekte (Tippen, Klicks, leises Antippen, Häkchen-Töne,
Übergänge), komplett synthetisch erzeugt (`scripts/sound.py`), ohne fremde Samples, also ohne Lizenz nutzbar, auch auf
Social Media. Ein eigener Beat (120 BPM, A-Moll) ist im Skript vorhanden, aber ausgeschaltet (`WITH_MUSIC = False`).

Die App-Szenen sind vereinfachte Karten im Design der App (dunkles Erscheinungsbild: Farben, Rundungen, Symbole,
Abzeichen, Diagramme, Satoshi für Text, Onest für Zahlen). Alle Zahlen, Kurven, Trades und Regeln kommen aus der echten App.
Alle Hintergründe sind dunkel wie die App (#060807). Damit die Flächen nicht leer wirken, liegen darauf leise Ebenen,
die sich nur langsam bewegen: grüne Lichtflecken, ein feines Raster, eine schwache Kurslinie und Filmkorn (`public/noise.png`).
Der Produkt-Teil ist ein durchgehender Ablauf ohne harte Schnitte: Eine Fläche wird vom Knopf „+ Log trade“ zum Formular,
dann zur neuen Zeile im TradeLog und schließlich zur Karte bei der Regelprüfung.

| Zeit | Szene |
| --- | --- |
| 0–6,5 s | „Same mistake, / Different day.“ getippt, markiert und gelöscht, an derselben Stelle „Same loss… again?“, Flug durch das „o“ |
| 6,5–8,5 s | „Stop repeating mistakes.“ |
| 8,5–11,5 s | „Meet Journalyst“ (das Icon-Logo ist entfernt, ein neues folgt) |
| 11,5–14 s | „The trading journal that trains your discipline.“ |
| 14–18 s | Dashboard schräg im Raum, Net P&L, Overall score und Cumulative P&L ragen kurz heraus, dann wird es flach |
| 18–21,7 s | Klick auf „+ Log trade“, das Formular wächst aus dem Knopf, ES, Long, Einstieg, Ausstieg, Kontrakte, „Save trade“ |
| 21,7–24,8 s | Das Formular schrumpft zur neuen Zeile im TradeLog |
| 24,8–29 s | Die Zeile wird zur Karte, rechts werden die drei aktiven Regeln abgehakt, „Discipline 100“ |
| 29–31,5 s | „Every broken rule has a price.“ |
| 31,5–35,5 s | Shadow Self: Disziplin-Kosten zählen hoch, echt gegen Schatten-Ich, der Abstand als Preis |
| 35,5–38,5 s | „Your Shadow Self shows you what discipline is worth.“ |
| 38,5–42,5 s | „Others count trades.“ / „We build traders.“ |
| 42,5–47,5 s | Endkarte: Wortmarke JOURNALYST, „The trading journal for discipline.“, Knopf „Start your journal“ |

## Video 2: nach der Vorlage „LangEase“

Zweites Launch-Video mit Aufbau und Bewegungen der Vorlage https://youtu.be/SgmuplXU2iY, im selben dunklen
Journalyst-Design und mit echten Werten aus der App: `journalyst-2.mp4` (quer) und `journalyst-2-vertical.mp4` (hochkant),
60 fps, 34,4 Sekunden. Nur Sound-Effekte (`scripts/sound2.py`), keine Musik. Code in `src/v2/`.

| Zeit | Szene | Entspricht in der Vorlage |
| --- | --- | --- |
| 0–3 s | „Turn trades“ → „into discipline“ → „Every trade“, Wörter aus der Unschärfe | „Turn Books“ → „Audio“ → „Any language“ |
| 3–5,1 s | Glas-Ordner „Trades · Import CSV“ springt auf, „instantly“, die Hand klickt, Flug in den Ordner | Ordner, Hand, Zoom hinein |
| 5,1–7 s | „Just drop and go.“ Wort für Wort, vier Handys mit der App fliegen aus den Ecken | „Just drop and go“, vier iPhones |
| 7–9,3 s | „Trades. Rules. Stats.“ → „All in one journal.“ | „Books. Audio. Video“ → „All In One Platform“ |
| 9,3–12,8 s | Flug ins Handy, der Balken „Discipline score“ läuft von 72 auf 100, die drei Regeln leuchten auf | Fortschritt 70/100 → 100/100 |
| 12,8–14,6 s | Balken wird zum Kreis, Häkchen, „Plan followed.“, Konfetti | „Done“ mit Häkchen und Konfetti |
| 14,6–18,3 s | Kreis wird zur Karte des ES-Trades, die anderen Trades gleiten herein, TradeLog schräg, die Hand zeigt auf den Trade | Kreis → Karten → Bibliothek |
| 18,3–21 s | Die Karte teilt sich in vier Kacheln (Net P&L, Trefferquote, Score, Shadow Self), „Know your edge.“ | „Multiple Languages“ |
| 21–25,6 s | TradeLog als Liste, Klick auf „Create certificate“, der Knopf wird zum Häkchen-Abzeichen | „Distribute To Youtube“ → Stern |
| 25,6–29 s | Das Abzeichen hüpft über „Log.“ „Review.“ „Improve.“ | „Translate. Dub. Distribute“ |
| 29–34,4 s | Wortmarke JOURNALYST, darunter getippt „The trading journal for discipline.“ | Logo und Adresse |

## Video 3: nach der Vorlage „Outbidd“

Drittes Launch-Video mit Aufbau und Bewegungen der Vorlage https://youtu.be/otlWhoTRUsw, im dunklen Journalyst-Design
und mit echten Werten aus der App: `journalyst-3.mp4` (quer) und `journalyst-3-vertical.mp4` (hochkant), 60 fps, 62,5 Sekunden.
Nur Sound-Effekte (`scripts/sound3.py`), keine Musik. Code in `src/v3/`.

| Zeit | Szene | Entspricht in der Vorlage |
| --- | --- | --- |
| 0–2 s | „What if“ zwischen wachsenden grünen Rauten, Flug in die mittlere, sie wird zur Leit-Raute | „What if“, lila Rauten |
| 2–6,4 s | „You could follow“, Wisch, „your trading plan“, die Raute fliegt ans Satzende, Ringe | „You could pick / the right contractor“ |
| 6,4–7,5 s | „Every time?“ mit Verlauf und Leuchten | „Everytime?“ |
| 7,5–11,1 s | „No more spreadsheets“ getippt, Hinweis-Karten springen auf; „And scattered notes.“, Klick auf „Done“ | „No more Dropbox links / And buried emails“ |
| 11,1–15 s | „All your trades“ → „All in one place“, Dashboard gleitet herein, Flug in die Tagesbalken | „All your projects / All in one place“, Karte |
| 15–17 s | Kalender September mit den echten Tagesergebnissen, Hinweis am 29., Klick „Review day“ | Karte mit Pin, Klick |
| 17–20,8 s | Tagesansicht 29. September, „Forget“ / „messy spreadsheets“ → „forgotten lessons“, Journal-Karte hebt sich | „Forget / fragmented files / missed calls“ |
| 20,8–24,5 s | „All“ + Trades, Rules, Notebook, Statistics, Shadow Self, Blind Replay mit grüner Markierung, Flug durch die Raute | „All“ + Budgeting, Documents … |
| 24,5–27,6 s | „See the patterns you miss.“ | „Get the answers you need“ |
| 27,6–40,6 s | „Build your trading plan“: Regel „Never move the stop“ tippen, 3D-Wechsel, Setup „Opening Range Breakout“ suchen und hinzufügen, Review mit Häkchen, „Save plan“ | „Send out to bid“, Schritte 2–4 |
| 40,6–48 s | Seitenleiste, „Shadow Self“ → „September 2026 · Active“, „Review your month in minutes / not hours.“, Schalter Shadow Self, Disziplin-Kosten zählen | Seitenleiste → Bids Overview |
| 48–52,9 s | Shadow Self zählt hoch, Trade-Prüfung des DAX-Trades, Discipline zählt bis 80 | Zahlen laufen, Bid Breakdown |
| 52,9–57,4 s | „Your plan.“ → „Your rules.“, drei Aktions-Menüs kreisen, Klicks | „Your process / Your control“ |
| 57,4–62,5 s | „The way journaling should be“ mit Raute, dann die Wortmarke JOURNALYST | „The way bidding should be“, Logo |

## So entsteht es

```bash
cd video
npm install
npm run fonts                 # Satoshi und Onest nach public/fonts (nicht im Repository, Lizenz)

# Werte aus der Web-App holen (Ordner web/ des Branches claude/trading-journal-app-cqdxfe):
#   git archive origin/claude/trading-journal-app-cqdxfe web | tar -x -C /tmp/tj
#   (cd /tmp/tj/web && python3 -m http.server 8787 --bind 127.0.0.1)
npm run capture               # schreibt src/data/app.json
python3 scripts/sound.py      # Effekte nach public/audio/sound.wav (braucht numpy und scipy)

npm run stills -- 7.5s 21s    # einzelne Bilder nach out/stills/ zur Sichtkontrolle (hochkant: COMP=JournalystVertical)
npm run studio                # Vorschau
npm run render                # out/journalyst.mp4 (quer)
npm run render:vertical       # out/journalyst-vertical.mp4 (hochkant, Reels/TikTok/Shorts)

npm run sound2                # Effekte für Video 2 nach public/audio/sound2.wav
npm run render2               # out/journalyst-2.mp4 (Video 2, quer)
npm run render2:vertical      # out/journalyst-2-vertical.mp4 (Video 2, hochkant)

npm run sound3                # Effekte für Video 3 nach public/audio/sound3.wav
npm run render3               # out/journalyst-3.mp4 (Video 3, quer)
npm run render3:vertical      # out/journalyst-3-vertical.mp4 (Video 3, hochkant)
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
src/ui/Bg.tsx            dunkle Hintergründe: Lichtflecken, Raster, Kurslinie, Filmkorn
src/anim.ts              Kurven, Feder, Kamera
src/theme.ts             Farben und Schrift
src/format.ts            quer oder hochkant
scripts/sound.py         Effekte (Beat optional), Zeitpunkte passend zu den Animationen
src/v2/Launch2.tsx       Video 2: Zeitplan; Hook, Phones, Score, Edge, Finale sind die Abschnitte
src/ui/Hand.tsx          Zeigehand mit Klick; src/ui/Confetti.tsx Konfetti; src/ui/Phone.tsx Handys mit App-Bildschirmen
scripts/sound2.py        Effekte für Video 2
src/v3/Launch3.tsx       Video 3: Zeitplan; Open, Chaos, Overview, List, Plan, Review, Outro; Bausteine in src/v3/Parts.tsx
scripts/sound3.py        Effekte für Video 3
```

Bewegungsregeln: `.claude/skills/motion-rules` im Repo-Root.
