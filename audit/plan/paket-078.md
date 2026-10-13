# Paket 078 · zustaende

Schritte: 2 · Dateien: web/app.html, web/css/app.css
Betroffene Tests laut Spezifikation: web/e2e/loadtest.js:10-11; web/e2e/loadtest.js:10-11 (Skelett: 5 Kacheln, 3 Karten, topH ≥ 60)
Baut auf Paketen auf: 5, 39, 77

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## responsiv-B11 · Skelett am Handy: Maße der fertigen Seite (Titelzeile, Kopfreihe, 5 Kacheln, Karte)

Gruppe responsiv · Cluster zustaende · Aufwand M · Befunde: bereich_shell-5
Quelle: audit/spec/responsiv.md Z. 372–380 · Dateien: web/css/app.css
Abhängig von: —

```text
**B11 Skelett am Handy** (bereich_shell-5)
- Nach Z. 1539 global: `.boot-top .skel.mb, .boot-head .skel.m { display: none; }`
- Z. 1554 (Block ≤ 960 px) ersetzen:
  - `.boot-top { padding: 12px 16px; }` → `.boot-top { min-height: 60px; padding: 10px 16px; }`
  - `.boot-top .skel:not(.t):not(.av) { display: none; }` → `.boot-top .skel:not(.t):not(.av):not(.mb) { display: none; } .boot-top .skel.mb { display: block; width: 20px; height: 20px; border-radius: 6px; margin-right: 7px; } .boot-top .skel.av { width: 34px; height: 34px; }` (Titel-Platzhalter bei x = 16 + 20 + 7 + 8 = 51 wie der echte Titel nach A4)
  - `.boot-head { display: none; }` → `.boot-head { display: flex; justify-content: flex-start; min-height: 46px; } .boot-head .skel { width: 40px; height: 40px; } .boot-head .skel.tl { order: -1; width: 166px; height: 42px; margin-left: 0; } .boot-head .skel.m { display: block; }`
  - `.boot-tiles .skel { height: 96px; }` → `.boot-tiles .skel { height: 111px; } .boot-tiles .skel:nth-child(n + 4) { display: block; } .boot-tiles .skel:nth-child(5) { grid-column: 1 / -1; }`
  - `.boot-main .skel { height: 260px; }` → `.boot-main .skel { height: 339px; }`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: .boot-tiles .skel] S-C19 (globale Regel, Desktop) und B11 (Block ≤ 960 px) ergänzen sich. Beide Zahlen sind aber gemessene Ist-Werte von heute und werden durch andere Gruppen ungültig. abstaende-B7/B9 machen die Dashboard-Kachel 131 → 144 px hoch. Mit typografie (Wert 25 → 24 px, Kopfzeile 18 px) werden es etwa 142 px. Am Handy kommen +4 (Körper-Polster 8 → 12) und +1 (gap) dazu, Kachelwert 21 → 20 und Kopf-Zeilenhöhe ziehen ab. Verbindlich: Beide Skelett-Höhen sind die gemessene Höhe der fertigen Dashboard-Kachel nach allen Kachel-Schritten, nicht 131 bzw. 111. Desktop gemessen bei 1440×900, Handy bei 390×844, Beispieldaten, dunkel. Prüfung zustaende 21 wird zu „Kacheln y = 158 / h = gemessen, Karten y = 158 + h + 16 / h = 396 (±2)“. Prüfung responsiv 13 vergleicht Kacheln und Karte mit der fertigen Seite (±2) statt mit festen 111/339. Ändert sich die Kachel durch die offene kilook-Frage ki_look-10 (Linie im Kachelkopf, N1), neu messen. Hinweis: Die Mittelstufe des Skeletts (≤ 1180 px, 3 Kacheln) bleibt laut S-C19 unverändert. Sie weicht von der fertigen Seite ab (5 Kacheln als 3+2) und wird nachgezogen, sobald das Kachelraster 561–1240 entschieden ist.
- ÄNDERN: `.boot-tiles .skel { height: <gemessen> }` statt 111 px: Höhe der fertigen Kachel bei 390×844 nach abstaende-B7/B9 und Kachelwert 20 px. Rest von B11 (nth-child(n + 4) sichtbar, fünfte volle Breite) unverändert. Prüfung 13 gegen die fertige Seite ±2.
- [reihenfolge: .boot-head .skel] Die beiden Schritte ergänzen sich: S-C19 setzt die globale Regel, B11 überschreibt im Block ≤ 960 px. Die Symbol-Platzhalter haben die Maße der fertigen Knöpfe. Am Desktop sind das 42 × 42, weil komponenten-C08 `.btn.icon-only` (Vorlage, Zertifikat) auf 42 × 42 setzt. Also `.boot-head .skel { border: 0; border-radius: 9px; height: 42px; width: 42px; }` statt width 40; Kopfreihe min-height 46 bleibt (42 + 4). Am Handy bleiben die B11-Werte (40 × 40, Zeitraum 166 × 42) und werden nach komponenten-C08 und dem 40-px-Kontoknopf aus responsiv gegen die fertige Kopfreihe gemessen (±2).
- [reihenfolge: .boot-main .skel] Die Schritte ergänzen sich. Desktop 396 px (S-C19) ist richtig, denn `--card-h` bleibt 396 (abstaende). Am Handy ist die erste Karte height:auto. abstaende-B4 (Kartenkopf 14 → 16 px Abstand, Kopf mittig) und D10 ändern die fertige Höhe, daher gilt dort nicht die feste 339 aus B11, sondern die gemessene Höhe der ersten Dashboard-Karte bei 390×844 nach B4/D10 (erwartet etwa 341). Prüfung responsiv 13 vergleicht mit der fertigen Seite (±2).
- ÄNDERN: `.boot-main .skel { height: <gemessen> }` statt 339 px: Höhe der ersten fertigen Dashboard-Karte bei 390×844 nach abstaende-B4 und abstaende-D10.

## responsiv-3.17 · Skelett im HTML: Platzhalter für Menüknopf (skel mb) und viertes Kopfreihen-Symbol (skel m)

Gruppe responsiv · Cluster zustaende · Aufwand S · Befunde: bereich_shell-5
Quelle: audit/spec/responsiv.md Z. 545–549 · Dateien: web/app.html
Abhängig von: responsiv-B11

```text
### 3.17 web/app.html:21 (bereich_shell-5)

- `<div class="boot-top"><span class="skel t"></span>…` → `<div class="boot-top"><span class="skel mb"></span><span class="skel t"></span>…`
- `<div class="boot-head"><span class="skel"></span><span class="skel"></span><span class="skel tl"></span></div>` → `…<span class="skel tl"></span><span class="skel m"></span></div>`

```
