# Journalyst – Motion-Video zum Dashboard

Ein Remotion-Projekt, das in rund 79 Sekunden zeigt, wie Journalyst funktioniert. Das Bild ist die **echte Web-App**
(`web/` auf dem Branch `claude/trading-journal-app-cqdxfe`), im Browser aufgenommen und bedient: Dashboard, Trade loggen,
Statistiken mit Fehlerkosten, Fortschritt mit Checkliste, Schatten-Ich, Ruhepunkt, Mentor, Prop Firms. Remotion legt
Intro, Kamerafahrten, Cursor, Kapitelzeilen und Abspann darüber. 16:9, 1920 × 1080, 30 fps, ohne Ton (Autoplay auf der Website).
Zwei Fassungen liegen fertig daneben: `journalyst-en.mp4` (App auf Englisch, US-Dollar, englische Kapitelzeilen) und
`journalyst-de.mp4` (Deutsch, Euro). `npm run render` und `npm run render:de` schreiben neue Fassungen nach `out/`.

## Ablauf

```bash
cd video
npm install
npm run fonts                                   # Satoshi und Onest nach public/fonts (nicht im Repository, Lizenz)

# 1) Web-App bereitstellen (Ordner web/ des Trading-Journal-Branches), Schriften unter /_fonts
#    z. B.: git archive origin/claude/trading-journal-app-cqdxfe web | tar -x -C /tmp/tj && mkdir -p /tmp/tj/web/_fonts
#    cp public/fonts/*.woff2 /tmp/tj/web/_fonts/   (Dateinamen satoshi-400.woff2 … onest-700.woff2)
#    (cd /tmp/tj/web && python3 -m http.server 8787 --bind 127.0.0.1)
python3 scripts/mentor-mock.py 8788 en &        # kleiner Mentor-Server (en|de), damit der echte Chat antwortet

# 2) Aufnahme: CDP-Screencast (PNG je Neuzeichnung) plus Ereignis-Log mit Zeiten und Klickpunkten
#    LANG_UI=en|de wählt Sprache und Währung der App (und die Texte im Editor und Mentor-Chat)
LANG_UI=en NODE_PATH=$(npm root -g) node scripts/record.cjs /tmp/tj/web out/footage-en

# 3) Frames zu einem 30-fps-Video mit exakter Zeit, Ereignisse in die Komposition
python3 scripts/assemble.py out/footage-en public/footage-en.mp4
cp out/footage-en/events.json src/data/events-en.json          # für Deutsch: footage-de, events-de

# 4) Vorschau und Render
npm run studio                                   # REMOTION_LANG=de für die deutsche Fassung (npm run studio:de)
npm run render                                   # out/journalyst-en.mp4; npm run render:de → out/journalyst-de.mp4
```

`remotion.config.ts` nutzt ein vorinstalliertes Chromium (`REMOTION_BROWSER` überschreibt den Pfad).
`node scripts/stills.mjs 200 600 1220` rendert einzelne Frames als PNG nach `out/stills/` zur Sichtkontrolle.

Die Aufnahme setzt die Systemzeit der Seite auf Mittwoch, 30.09.2026, damit die Beispieldaten einen vollen Monat
füllen. Der Mentor-Mock antwortet mit einem festen Text aus den Beispieldaten. In der englischen App sind einige Stellen
noch deutsch (Mentor-Kopf und Eingabefeld, „Offene Positionen“, automatische Regeln); das ist der Stand der App, nicht des Videos.

## Aufbau

```
src/Main.tsx            Kamera, Cursor, Kapitelzeilen, Bühne; Zeiten aus src/data/events-<sprache>.json
src/footage.ts          Sprache (REMOTION_LANG), Zeitachse: Intro, Materialabschnitte (Tippen 1,45-fach), Ereignis → Frame
src/copy.ts             Texte je Sprache: Kapitelzeilen, Claim, Untertitel, Einladung
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
