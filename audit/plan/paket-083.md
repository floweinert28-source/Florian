# Paket 083 · responsiv

Schritte: 1 · Dateien: web/e2e/mobiletest.js
Betroffene Tests laut Spezifikation: web/e2e/mobiletest.js
Baut auf Paketen auf: 8, 12, 16, 27, 44, 45, 46, 47, 66, 76, 82

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## responsiv-3.20a · mobiletest anpassen (Zellabstand 9px 8px, Kernspalten-Prüfung) und um Handy-Kriterien aus Abschnitt 4 A erweitern

Gruppe responsiv · Cluster responsiv · Aufwand L · Befunde: —
Quelle: audit/spec/responsiv.md Z. 567–570 · Dateien: web/e2e/mobiletest.js
Abhängig von: responsiv-A1, responsiv-A3, responsiv-A4, responsiv-B2, responsiv-B3, responsiv-B4, responsiv-B9, responsiv-B10, responsiv-B11, responsiv-C1, responsiv-3.3a, responsiv-3.3c, responsiv-3.3d, responsiv-3.7, responsiv-3.13, responsiv-3.15, responsiv-3.17

```text
### 3.20 web/e2e/*.js

- `mobiletest.js:34`: `tabs.pad === '9px 10px'` → `'9px 8px'`; Text „Tabellenzellen kompakt ohne Umbruch“ → „Tabelle mit Kernspalten, P&L im Bild“ und zusätzlich prüfen: `.tl-fit .tbl-scroll` `scrollWidth <= clientWidth + 1` und die letzte sichtbare `td` endet ≤ 374 px.
- `mobiletest.js`: neue Prüfungen aus Abschnitt 4 (A-Handy) ergänzen.
```
