# Paket 072 · bewegung, diagramme

Schritte: 6 · Dateien: web/README.md, web/css/app.css, web/css/landing.css, web/e2e/affiliatetest.js, web/e2e/headtest.js, web/js/ui.js
Betroffene Tests laut Spezifikation: prüfen: e2e/motiontest.js:72–74; web/e2e/affiliatetest.js:25; web/e2e/chartanimtest.js; web/e2e/headtest.js:48; web/e2e/headtest.js:48 (O4); web/e2e/headtest.js:52 (rect.br, in der Spezifikation nicht genannt, prüfen); web/e2e/headtest.js:52 nutzt ebenfalls rect.br (in der Spezifikation nicht genannt, prüfen); web/e2e/mobiletest.js:37 (Bottom-Sheet-Lage); web/e2e/motiontest.js:43-47, :58 (Desktop pop-in, reduzierte Bewegung)
Baut auf Paketen auf: 47, 51

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## diagramme-A3 · Einzug-Selektoren rect.br → .br, neu text.bv nach dem Wachsen (Zeiten aus Bewegung B6)

Gruppe diagramme · Cluster bewegung · Aufwand S · Befunde: diagramme-11, diagramme-25, bewegung-2
Quelle: audit/spec/diagramme.md Z. 299–304 · Dateien: web/css/app.css
Abhängig von: —

```text
**A3 Einzug: Selektoren für Pfad-Balken und Werte** (diagramme-11, diagramme-25; Zeiten aus Bewegung B6, siehe K20)
- Z. 108 Selektor `.chart svg.enter rect.br` → `.chart svg.enter .br`. Die Deklarationen bleiben, deren Werte setzt Bewegung B6.
- Z. 109 `.chart svg.enter rect.br.dn` → `.chart svg.enter .br.dn`.
- nach Z. 112 neu: `.chart svg.enter text.bv { animation: ch-fade var(--dur-2) var(--ease) var(--dur-3) both; } /* Wert erscheint nach dem Wachsen der Säule */`
- Rückfall, falls Bewegung B6 nicht umgesetzt wird: Z. 107 und 112 `ch-fade 1s ease .35s both` → `ch-fade .45s ease .55s both` (bewegung-2).

```

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: .chart svg.enter rect.br] Beide Schritte ändern dieselben Zeilen (app.css Z. 108/109) und ergänzen sich, wie in diagramme K20 abgestimmt: Selektoren aus diagramme, Zeiten aus bewegung. Ergebnis: `.chart svg.enter .br { transform-box: fill-box; transform-origin: 50% 100%; animation: ch-grow var(--dur-3) var(--ease) var(--bd, 0ms) both; }`, `.chart svg.enter .br.dn { transform-origin: 50% 0; }` und neu `.chart svg.enter text.bv { animation: ch-fade var(--dur-2) var(--ease) var(--dur-3) both; }`. Erst B6, dann A3. A3 nur zusammen mit diagramme-C6 umsetzen, sonst bekommen Pfad-Balken in enterAnim zusätzlich `.ar`, und `path.ar` (0,3,2) schlägt `.br` (0,3,1).
- ÄNDERN: Der Rückfall in Z. 303 (`ch-fade .45s ease .55s both`) entfällt, weil B6 umgesetzt wird. In Z. 108/109 nur die Selektoren ändern. Die Tests headtest.js:48, :49 und :53 stellen alle von `rect.br` auf `.br` um; diagramme O4 nennt nur :48.
- [doppelt: .chart svg.enter path.ar] Den Wert setzt bewegung-B6: `animation: ch-fade var(--dur-3) var(--ease) calc(var(--dur-4) - var(--dur-3)) both;`. Die Fläche läuft von 260 bis 640 ms und endet mit der Linie. Der Rückfall `.45s ease .55s` aus diagramme-A3 (Z. 303) entfällt, siehe die Anpassung beim Anker .chart svg.enter rect.br.
- [doppelt: .chart svg.enter polygon.ar] Wie path.ar: bewegung-B6 setzt `animation: ch-fade var(--dur-3) var(--ease) calc(var(--dur-4) - var(--dur-3)) both;`. Der Rückfall aus diagramme-A3 entfällt (Anpassung beim Anker .chart svg.enter rect.br).

## diagramme-C6 · Einzug: Pfad-Balken nicht zeichnen, gestrichelte Linien einblenden, Staffel auf .br

Gruppe diagramme · Cluster bewegung · Aufwand S · Befunde: diagramme-11, bereich_training-28
Quelle: audit/spec/diagramme.md Z. 391–394 · Dateien: web/js/ui.js
Abhängig von: diagramme-A3

```text
**C6 Einzug für Pfad-Balken und gestrichelte Linien** (diagramme-11, bereich_training-28)
- Z. 249: in der Schleife über `path, polyline, polygon` die Abbruchbedingung um `|| el.classList.contains('br')` ergänzen. Direkt danach einfügen: `if (el.hasAttribute('stroke-dasharray')) { el.classList.add('ar'); return; } /* gestrichelte Linien blenden ein; ch-draw würde ihr Strichmuster überschreiben */`
- Z. 253: nur `svg.querySelectorAll('rect.br')` → `svg.querySelectorAll('.br')`. Den Rest der Zeile regelt Bewegung 3.6 (K20).

```

## diagramme-O4 · Tests headtest.js:48 und affiliatetest.js:25 auf .br umstellen

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: diagramme-11
Quelle: audit/spec/diagramme.md Z. 749–749 · Dateien: web/e2e/headtest.js, web/e2e/affiliatetest.js
Abhängig von: diagramme-A3, diagramme-C6, diagramme-K1

```text
- **O4** headtest.js:48 (diagramme-11): `.chart svg.enter rect.br` → `.chart svg.enter .br`. affiliatetest.js:25: `.chart[data-chart=affbars] rect` → `.chart[data-chart=affbars] .br`.
```

## diagramme-P6 · README Einzug (Z. 350–352): gestrichelte Linien blenden ein, Werte nach dem Wachsen

Gruppe diagramme · Cluster bewegung · Aufwand S · Befunde: bereich_training-28, diagramme-25
Quelle: audit/spec/diagramme.md Z. 772–773 · Dateien: web/README.md
Abhängig von: diagramme-A3, diagramme-C6

```text
- **P6** Z. 350–352 (Einzug): „gestrichelte Linien blenden ein; Werte über Säulen erscheinen nach dem Wachsen“.

```

## kilook-B8e · Startseite: Hover-Effekte der Funktions-/Ablauf-Einträge löschen, Bewegungs-Kommentar

Gruppe kilook · Cluster bewegung · Aufwand S · Befunde: ki_look-42
Quelle: audit/spec/kilook.md Z. 489–496 · Dateien: web/css/landing.css
Abhängig von: —

```text
- **49** Kommentar → `/* Bewegung auf der Startseite: Hero blendet beim Laden ein (reines CSS, ohne JS sichtbar) */`
- **55–58** löschen:
  - `.lp .feat-card, .lp .step { transition … }`
  - `… :hover { transform … }`
  - `.lp .feat-card .ico { transition … }`
  - `.lp .feat-card:hover .ico { … }`
- 59–60 (`.lp .shot .frame` Hover) bleiben.

```

## responsiv-B9 · Bottom-Sheet am Handy: sheet-in/sheet-out

Gruppe responsiv · Cluster bewegung · Aufwand S · Befunde: bewegung-29
Quelle: audit/spec/responsiv.md Z. 349–355 · Dateien: web/css/app.css
Abhängig von: —

```text
**B9 Bottom-Sheet** (bewegung-29)
- Nach Z. 2375 neu: `@keyframes sheet-in { from { transform: translateY(100%); } }` und `@keyframes sheet-out { to { transform: translateY(100%); } }`
- Im Block ≤ 560 px nach Z. 3059 neu:
  `.modal { animation: sheet-in var(--dur-3) var(--ease) backwards; }`
  `.modal-bg.out { animation-duration: var(--dur-2); }`
  `.modal-bg.out .modal { animation: sheet-out var(--dur-2) var(--ease-in) forwards; }`

```
