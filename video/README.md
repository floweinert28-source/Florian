# Journalyst – Dashboard-Motion-Video

Launch-Video für das Journalyst-Dashboard, gebaut mit [Remotion](https://remotion.dev) (TypeScript).
1920×1080, 60 fps, ca. 25 s. Mit `--scale=2` wird in 4K gerendert.

## Befehle

```bash
npm install
npm run studio          # Vorschau im Browser
npm run typecheck
npm run render          # out/dashboard.mp4  (H.264, CRF 14, 4K)
npm run render:prores   # out/dashboard-prores4444.mov  (ProRes 4444, 4K)
```

Einzelne Stills für die Kontrolle:

```bash
node scripts/stills.mjs S3-EquityCurve:0,90,289 --scale=0.5   # → stills/
```

## Compositions

| ID | Szene | Dauer |
|---|---|---|
| `Journalyst` | Gesamtes Video | 1485 f |
| `S1-Intro` | Das App-Fenster erscheint, das Raster baut sich gestaffelt auf | 210 f |
| `S2-KPIs` | Die Kennzahlen zählen hoch (Net P&L, Win rate, Profit factor, Avg R, Max DD) | 230 f |
| `S3-EquityCurve` | Die Linie zeichnet sich (`evolvePath`), danach blendet die Fläche ein | 290 f |
| `S4-Trades` | Die Trade-Zeilen gleiten mit Win/Loss-Badges herein | 230 f |
| `S5-Calendar` | Die P&L-Heatmap füllt sich Tag für Tag | 225 f |
| `S6-Outro` | Zoom-out aufs ganze Produkt, danach der Schriftzug „JOURNALYST“ | 300 f |

Die Szenen gehen nahtlos ineinander über. Jede Szene startet an der Kameraposition, an der die vorige endet.

## Aufbau

- `src/theme.ts` – Design-Tokens aus `journalyst-design-motion.md` (Farben, Radien, Layout-Maße)
- `src/data.ts` – deterministische Demo-Daten (Seed 9697): 111 Trades, 57,7 % Winrate, Drawdown Mitte August
- `src/motion.ts` – die einzigen Easings: `Easing.bezier(0.16, 1, 0.3, 1)` und eine Spring mit `damping: 200`
- `src/camera.ts` – Kamera-Ausschnitte je Szene; jede Szene zoomt zusätzlich langsam von 1.0 auf 1.04
- `src/components/` – Dashboard-Bausteine (Seitenleiste, Kennzahlen, Equity, Trades, Kalender)
- `src/scenes/Scenes.tsx` – die sechs Szenen

## Schriften

Satoshi gibt es nicht bei Google Fonts. Für den Text wird deshalb Manrope verwendet, für Zahlen Onest (mit `tnum`, also Ziffern fester Breite).
Beide liegen lokal in `public/fonts/`, damit der Render keine Netzwerkverbindung braucht.
Wenn du Satoshi als `.woff2` hast, lege die Datei dort ab und tausche in `src/theme.ts` die Familie aus.
