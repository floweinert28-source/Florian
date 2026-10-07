# Journalyst – Motion-Video zum Dashboard

Ein Remotion-Projekt, das in rund 63 Sekunden zeigt, wie das Journalyst-Dashboard funktioniert:
Intro, Dashboard-Aufbau, Trade loggen, Statistiken, Fortschritt, Schatten-Ich, Ruhepunkt und Mentor, Prop Firms, Abspann.
16:9, 1920 × 1080, 30 fps, ohne Ton (für Autoplay auf der Website).

Die Zahlen sind die echten Beispieldaten der Web-App (`web/js/sample.js`, gerechnet mit `web/js/core.js`) und liegen in
`src/data/journal.json`. Farben, Schrift (Satoshi, Onest) und Aufbau folgen `web/css/app.css`.

## Starten

```bash
cd video
npm install
npm run fonts          # lädt Satoshi und Onest nach public/fonts (nicht im Repository, Lizenz)
npm run studio         # Vorschau im Remotion Studio
npm run render         # out/journalyst.mp4
```

Ohne Internet im Browser: `remotion.config.ts` nutzt ein vorinstalliertes Chromium (`REMOTION_BROWSER` überschreibt den Pfad).
`node scripts/stills.mjs 230 640 1180` rendert einzelne Frames als PNG nach `out/stills/` zur Sichtkontrolle.

## Aufbau

```
src/Main.tsx            Timeline mit Labels (L), Kamera, Cursor, Bauchbinden, Bühne
src/motion.ts           Signatur-Kurve, drei Dauern, Ein- und Austritt, Zählen
src/theme.ts            Design-Tokens der App
src/data.ts             Kennzahlen aus journal.json
src/ui/                 Shell (Seitenleiste, Kopf), Karten, Kacheln, Diagramme, Cursor, Kamera
src/scenes/             Eine Datei je Kapitel
```

Regeln für Bewegung: `.claude/skills/motion-rules` im Repo-Root (nur transform und opacity, Eintritt von unten,
Zahlen zählen nach dem Landen, Kamera fährt in 800 ms, Schleifen mit Sinus).
