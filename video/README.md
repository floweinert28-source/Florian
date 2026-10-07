# Journalyst – Motion-Video zum Dashboard

Ein Remotion-Projekt, das in rund 79 Sekunden zeigt, wie Journalyst funktioniert. Das Bild ist die **echte Web-App**
(`web/` auf dem Branch `claude/trading-journal-app-cqdxfe`), im Browser aufgenommen und bedient: Dashboard, Trade loggen,
Statistiken mit Fehlerkosten, Fortschritt mit Checkliste, Schatten-Ich, Ruhepunkt, Mentor, Prop Firms. Remotion legt
Intro, Kamerafahrten, Cursor, Kapitelzeilen und Abspann darüber. 16:9, 1920 × 1080, 30 fps, ohne Ton (Autoplay auf der Website).
Das fertige Video liegt als `journalyst.mp4` daneben; `npm run render` schreibt eine neue Fassung nach `out/`.

## Ablauf

```bash
cd video
npm install
npm run fonts                                   # Satoshi und Onest nach public/fonts (nicht im Repository, Lizenz)

# 1) Web-App bereitstellen (Ordner web/ des Trading-Journal-Branches), Schriften unter /_fonts
#    z. B.: git archive origin/claude/trading-journal-app-cqdxfe web | tar -x -C /tmp/tj && mkdir -p /tmp/tj/web/_fonts
#    cp public/fonts/*.woff2 /tmp/tj/web/_fonts/   (Dateinamen satoshi-400.woff2 … onest-700.woff2)
#    (cd /tmp/tj/web && python3 -m http.server 8787 --bind 127.0.0.1)
python3 scripts/mentor-mock.py 8788 &           # kleiner Mentor-Server, damit der echte Chat antwortet

# 2) Aufnahme: CDP-Screencast (PNG je Neuzeichnung) plus Ereignis-Log mit Zeiten und Klickpunkten
NODE_PATH=$(npm root -g) node scripts/record.cjs /tmp/tj/web out/footage

# 3) Frames zu einem 30-fps-Video mit exakter Zeit, Ereignisse in die Komposition
python3 scripts/assemble.py out/footage public/footage.mp4
cp out/footage/events.json src/data/events.json

# 4) Vorschau und Render
npm run studio
npm run render                                   # out/journalyst.mp4
```

`remotion.config.ts` nutzt ein vorinstalliertes Chromium (`REMOTION_BROWSER` überschreibt den Pfad).
`node scripts/stills.mjs 200 600 1220` rendert einzelne Frames als PNG nach `out/stills/` zur Sichtkontrolle.

Die Aufnahme setzt die Systemzeit der Seite auf Mittwoch, 30.09.2026, damit die Beispieldaten einen vollen Monat
füllen; Sprache Deutsch, Euro. Der Mentor-Mock antwortet mit einem festen Text aus den Beispieldaten.

## Aufbau

```
src/Main.tsx            Kamera, Cursor, Kapitelzeilen, Bühne; Zeiten aus src/data/events.json
src/footage.ts          Zeitachse: Intro, Materialabschnitte (Tippen im Editor 1,45-fach), Ereignis → Frame
src/ui/FootageStage.tsx das aufgenommene Material in Abschnitten
src/ui/Camera.tsx       Kamerafahrten (nur translate und scale, Blickpunkt bleibt im Bild)
src/ui/Cursor.tsx       Cursor mit Bogen und Klick-Ring
src/scenes/             Intro und Abspann
src/motion.ts           Signatur-Kurve, drei Dauern, Ein- und Austritt
scripts/record.cjs      Aufnahme der echten App (Playwright)
scripts/assemble.py     Frames → public/footage.mp4
scripts/mentor-mock.py  Mentor-Server für die Aufnahme
```

Regeln für Bewegung: `.claude/skills/motion-rules` im Repo-Root.
