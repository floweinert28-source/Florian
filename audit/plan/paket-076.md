# Paket 076 · dashboard, trades_tag, training

Schritte: 5 · Dateien: web/css/app.css, web/e2e/dashtest.js, web/js/screens/dashboard.js, web/js/screens/mentor.js, web/js/screens/trades.js
Betroffene Tests laut Spezifikation: web/e2e/dashtest.js:34/39 (.btn.added, :not(.added), prüfen); web/e2e/dashtest.js:38, 49, 111; web/e2e/dashtest.js:38, 49, 111 (siehe farbe-D2a); web/e2e/tlfittest.js
Baut auf Paketen auf: 63, 75, 78

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## farbe-C3a · Widget-Bibliothek: Knopfgewicht entfernen, „Hinzugefügt“ grau ohne Fläche

Gruppe farbe · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-5
Quelle: audit/spec/farbe.md Z. 384–386 · Dateien: web/css/app.css
Abhängig von: —

```text
**C3 – `web/css/app.css` Dashboard (Widget-Bibliothek, Letzte Trades, Report)** — bereich_dashboard-5, bereich_dashboard-1, referenz-9
- Z. 1613 `.sp-item .btn { flex: 0 0 auto; font-weight: 600; }` → `.sp-item .btn { flex: 0 0 auto; }` (Kommentar zur Breite streichen)
- Z. 1618 `.sp-item .btn.added { color: var(--accent); border-color: var(--accent-soft); background: var(--accent-soft); opacity: 1; }` → `{ color: var(--muted); border-color: transparent; background: transparent; opacity: 1; }`
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .sp-item .btn.added] „Hinzufügen“ in der Widget-Bibliothek ist ein Listen-Auslöser je Eintrag, kein Panel-Fuß. Also neutral: `btn sm sp-add` (farbe-C19a). Mehrere primary in einem Panel widersprächen „1 je Dialog/Panel“. Komponenten wollte primary lassen; das entfällt. „Hinzugefügt“ wird --muted, transparent, ohne Fläche (farbe-C3a). Das Gewicht 600 an `.sp-item .btn` entfällt, beide Zustände sind 500 und der Knopf bleibt gleich breit. zustaende-S-C2 löscht Z. 1619; `.sp-item .btn.added` (Spezifität 0,3,0) behält opacity 1 und schlägt `.btn:disabled`. Verträglich. e2e: dashtest Z. 38/49/111 auf `.side-panel .sp-item .sp-add:not(.added)` umstellen, wie in der Farbe-Spezifikation (Testteil).

## farbe-C19a · Widget-Bibliothek: sp-add ohne primary

Gruppe farbe · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-5
Quelle: audit/spec/farbe.md Z. 469–470 · Dateien: web/js/screens/dashboard.js
Abhängig von: farbe-C3a

```text
**C19 – `web/js/screens/dashboard.js`** — bereich_dashboard-5, referenz-7, zustaende-7, bereich_dashboard-14
- Z. 63 `class="btn sm sp-add ${added ? 'added' : 'primary'}"` → `class="btn sm sp-add${added ? ' added' : ''}"`
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .sp-item .btn.added] „Hinzufügen“ in der Widget-Bibliothek ist ein Listen-Auslöser je Eintrag, kein Panel-Fuß. Also neutral: `btn sm sp-add` (farbe-C19a). Mehrere primary in einem Panel widersprächen „1 je Dialog/Panel“. Komponenten wollte primary lassen; das entfällt. „Hinzugefügt“ wird --muted, transparent, ohne Fläche (farbe-C3a). Das Gewicht 600 an `.sp-item .btn` entfällt, beide Zustände sind 500 und der Knopf bleibt gleich breit. zustaende-S-C2 löscht Z. 1619; `.sp-item .btn.added` (Spezifität 0,3,0) behält opacity 1 und schlägt `.btn:disabled`. Verträglich. e2e: dashtest Z. 38/49/111 auf `.side-panel .sp-item .sp-add:not(.added)` umstellen, wie in der Farbe-Spezifikation (Testteil).

## farbe-D2a · dashtest: Selektor .sp-item .btn.primary auf .sp-add:not(.added)

Gruppe farbe · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-5
Quelle: audit/spec/farbe.md Z. 561–562 · Dateien: web/e2e/dashtest.js
Abhängig von: farbe-C19a

```text
**D2 – Tests**
- `web/e2e/dashtest.js` Z. 38, 49, 111: `'.side-panel .sp-item .btn.primary'` → `'.side-panel .sp-item .sp-add:not(.added)'` — bereich_dashboard-5
```

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
