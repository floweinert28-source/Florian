# Paket 075 · trades_tag, training, responsiv

Schritte: 3 · Dateien: web/e2e/mobiletest.js, web/js/screens/mentor.js, web/js/screens/trades.js
Betroffene Tests laut Spezifikation: web/e2e/mobiletest.js; web/e2e/tlfittest.js
Baut auf Paketen auf: 7, 10, 14, 23, 38, 39, 40, 41, 62, 68, 72, 74, 76

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## typografie-3.8b · TradeLog-Spark-Kachel: spark-body bekommt Klasse body

Gruppe typografie · Cluster trades_tag · Aufwand S · Befunde: bereich_trades_tag-31
Quelle: audit/spec/typografie.md Z. 424–424 · Dateien: web/js/screens/trades.js
Abhängig von: typografie-3.2.5b

```text
| trades.js:26 | `<div class="spark-body">` → `<div class="body spark-body">` | bereich_trades_tag-31 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .tile .body] abstaende-B9 und typografie-3.8b ergänzen sich. .tile .body bekommt align-items flex-start und padding-top var(--sp-3), und die Verlaufskachel im TradeLog bekommt `class="body spark-body"`. Damit erbt sie Trennlinie, Abstand und Ausrichtung aus der einen Regel .tile .body, und diese Regel bleibt die einzige Quelle dafür. In `.tile.spark-tile .spark-body` werden Linie (background-Verlauf) und padding-top deshalb nicht ein zweites Mal gesetzt. komponenten-C25b wollte padding-top 8px plus Linie, abstaende-B13 padding-top 12 plus flex-start. Begründung: Jeder Wert steht an einer Stelle, und Dashboard- und TradeLog-Kachel weichen nicht um 8 gegen 12 px voneinander ab. Die offene Frage ki_look-10/bereich_dashboard-41 (Linie weglassen) wirkt später automatisch auf beide Kachelarten, blockiert diese Schritte aber nicht.

## barrierefreiheit-C-mentor-83-111 · Mentor: role=log, Eingabe-Name, Ansagen über U.announce

Gruppe barrierefreiheit · Cluster training · Aufwand S · Befunde: barrierefreiheit-38, barrierefreiheit-37
Quelle: audit/spec/barrierefreiheit.md Z. 877–883 · Dateien: web/js/screens/mentor.js
Abhängig von: barrierefreiheit-U4, barrierefreiheit-U7, barrierefreiheit-P10

```text
#### `web/js/screens/mentor.js` (barrierefreiheit-38, barrierefreiheit-37)

- **Z. 83:** `<div class="mentor-log" id="mentor-log">` → zusätzlich `role="log"`
- **Z. 84:** Eingabe bekommt zusätzlich `aria-label="Nachricht an den Mentor"`
- **Z. 108:** nach `App.rerender();`: `U.announce(root.I18N ? root.I18N.t('Mentor schreibt …') : 'Mentor schreibt …');`
- **Z. 111:** nach dem Push der Antwort: `U.announce('Mentor: ' + String(r.reply || '').slice(0, 500));`

```

## responsiv-3.20a · mobiletest anpassen (Zellabstand 9px 8px, Kernspalten-Prüfung) und um Handy-Kriterien aus Abschnitt 4 A erweitern

Gruppe responsiv · Cluster responsiv · Aufwand L · Befunde: —
Quelle: audit/spec/responsiv.md Z. 567–570 · Dateien: web/e2e/mobiletest.js
Abhängig von: responsiv-A1, responsiv-A3, responsiv-A4, responsiv-B2, responsiv-B3, responsiv-B4, responsiv-B9, responsiv-B10, responsiv-B11, responsiv-C1, responsiv-3.3a, responsiv-3.3c, responsiv-3.3d, responsiv-3.7, responsiv-3.13, responsiv-3.15, responsiv-3.17

```text
### 3.20 web/e2e/*.js

- `mobiletest.js:34`: `tabs.pad === '9px 10px'` → `'9px 8px'`; Text „Tabellenzellen kompakt ohne Umbruch“ → „Tabelle mit Kernspalten, P&L im Bild“ und zusätzlich prüfen: `.tl-fit .tbl-scroll` `scrollWidth <= clientWidth + 1` und die letzte sichtbare `td` endet ≤ 374 px.
- `mobiletest.js`: neue Prüfungen aus Abschnitt 4 (A-Handy) ergänzen.
```
