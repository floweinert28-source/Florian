# Journalyst – Video zum Dashboard

Ein ruhiges, minimales Video für die Website: die **echte** Journalyst-Web-App als Fenster auf hellgrauem Hintergrund,
fünf Szenen mit je einer kurzen Überschrift. Jede Szene zeigt erst das Ganze, fährt dann langsam auf einen Bereich und
wieder zurück. 1920 × 1080, 60 fps, rund 40 Sekunden, ohne Ton (Autoplay).

1. Dashboard: Kennzahlen und Equity-Kurve
2. Trade loggen: Klick auf „Log trade“, der ausgefüllte Dialog, Klick auf „Save trade“
3. TradeLog: der neue Trade steht oben und wird kurz markiert
4. Schatten-Ich: Disziplin-Kosten, echt gegen Schatten-Ich
5. Prop Firms: ein Konto mit Puffer und Fortschritt

Fertige Fassungen: `journalyst-en.mp4` (Englisch, US-Dollar; Standard, weil die Website international ist) und
`journalyst-de.mp4` (Deutsch, Euro).

## So entsteht es

Die Bilder sind keine Nachbauten, sondern Standbilder der App in doppelter Auflösung. Remotion bewegt nur noch die
Kamera, den Cursor und die Überschriften, deshalb läuft alles flüssig.

```bash
cd video
npm install
npm run fonts                 # Satoshi und Onest nach public/fonts (nicht im Repository, Lizenz)

# Web-App bereitstellen (Ordner web/ des Branches claude/trading-journal-app-cqdxfe), Schriften unter /_fonts:
#   git archive origin/claude/trading-journal-app-cqdxfe web | tar -x -C /tmp/tj
#   mkdir -p /tmp/tj/web/_fonts && cp public/fonts/*.woff2 /tmp/tj/web/_fonts/
#   (cd /tmp/tj/web && python3 -m http.server 8787 --bind 127.0.0.1)
npm run capture               # Standbilder nach public/shots/<sprache>/, Lage der Elemente nach src/data/shots-<sprache>.json

npm run studio                # Vorschau
npm run render                # out/journalyst-en.mp4
npm run render:de             # out/journalyst-de.mp4
```

`scripts/capture.cjs` setzt die Uhr der Seite auf Mittwoch, 30.09.2026, damit die Beispieldaten den Monat füllen, und
loggt einen ES-Trade (Long, 5.742,25 → 5.751,50, zwei Kontrakte). `node scripts/stills.mjs 450 890 1240` rendert einzelne
Frames nach `out/stills/` zur Sichtkontrolle.

## Aufbau

```
src/Main.tsx        Zeitplan, Fenster, Ebenen der Standbilder, Dialog, Cursor, Überschriften, Intro und Abspann
src/camera.ts       Kamera im Fenster: Bereich einpassen, weich zoomen (nur translate und scale)
src/anim.ts         Signatur-Kurve, Ein- und Austritt
src/copy.ts         Texte je Sprache
src/shots.ts        Standbilder und Lage der Elemente
src/ui/Cursor.tsx   Cursor mit leichtem Bogen und Klick
scripts/capture.cjs Standbilder der echten App
```

Bewegungsregeln: `.claude/skills/motion-rules` im Repo-Root.
