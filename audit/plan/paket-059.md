# Paket 059 · zustaende, dashboard, diagramme

Schritte: 6 · Dateien: web/e2e/dashtest.js, web/js/ui.js, web/js/widgets.js
Betroffene Tests laut Spezifikation: web/e2e/dashtest.js:143–144; web/e2e/dashtest.js:143–144 (Schritt zustaende-S-TE2)
Baut auf Paketen auf: 14, 56

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## zustaende-S-U2 · Kurse: ab 10 genau zwei Nachkommastellen (fmt.price)

Gruppe zustaende · Cluster zustaende · Aufwand S · Befunde: zustaende-22, typografie-13
Quelle: audit/spec/zustaende.md Z. 395–397 · Dateien: web/js/ui.js
Abhängig von: —

```text
**S-U2 Kurse** – zustaende-22 (mit typografie-13)
Z. 142 `minimumFractionDigits: a < 10 ? 4 : a < 1000 ? 2 : 1` → `minimumFractionDigits: a < 10 ? 4 : 2`. `maximumFractionDigits` bleibt `a < 10 ? 5 : 2`.

```

## zustaende-S-U3 · fmt.dur: Sekunden unter einer Minute („45 s“)

Gruppe zustaende · Cluster zustaende · Aufwand S · Befunde: zustaende-39
Quelle: audit/spec/zustaende.md Z. 398–400 · Dateien: web/js/ui.js
Abhängig von: —

```text
**S-U3 Dauer mit Sekunden** – zustaende-39
Z. 157 `dur(min)`: direkt nach der null-Prüfung `if (min < 1) return `${Math.round(min * 60)} s`;` einfügen. Rest bleibt („12 min“, „1 h 5 min“, „2 T“).

```

## zustaende-S-W6 · Haltedauer-Widget: Achse mit genau einer Einheit (durLabel), Tooltip über fmt.dur

Gruppe zustaende · Cluster diagramme · Aufwand S · Befunde: zustaende-39
Quelle: audit/spec/zustaende.md Z. 486–492 · Dateien: web/js/widgets.js
Abhängig von: zustaende-S-U3

```text
**S-W6 Haltedauer** – zustaende-39
- Z. 38 `durLabel` ersetzen (nur noch Achse):
```js
const durLabel = min => { const sec = Math.round(min * 60); if (sec < 60) return `${sec} s`; if (min < 60) return `${Math.round(min)} min`; const h = min / 60; if (h < 24) return `${fmt.dec(h, h < 10 ? 1 : 0).replace(/[.,]0$/, '')} h`; return `${Math.round(h / 24)} T`; };
```
- Z. 244 Tooltip `${durLabel(t.holdingMin)}` → `${fmt.dur(t.holdingMin)}`

```

## zustaende-S-U4a · Baustein U.chartEmpty / U.chartEmptyHTML anlegen und in root.UI exportieren

Gruppe zustaende · Cluster zustaende · Aufwand S · Befunde: diagramme-38
Quelle: audit/spec/zustaende.md Z. 401–407 · Dateien: web/js/ui.js
Abhängig von: zustaende-S-C4

```text
**S-U4 Karten-/Diagramm-Leerzustand** – diagramme-38
Nach Z. 178 (`const empty = …`) neu:
```js
const chartEmptyHTML = (title = 'Noch keine Daten', hint = '', icon = 'stats') => `<div class="empty chart-empty">${I[icon] || ''}<span class="ce-t">${esc(title)}</span>${hint ? `<span class="small">${esc(hint)}</span>` : ''}</div>`;
const chartEmpty = (el, title, hint) => { el.innerHTML = chartEmptyHTML(title, hint); };
```
`chartEmpty` und `chartEmptyHTML` in `root.UI` (Z. 464) exportieren. Leerzweige der Zeichner:
```

## zustaende-S-W3 · emptyBox nur mit Titel nach Leerlage; chartEmpty delegiert an U.chartEmpty

Gruppe zustaende · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-13, wording-46, diagramme-38
Quelle: audit/spec/zustaende.md Z. 475–478 · Dateien: web/js/widgets.js
Abhängig von: zustaende-S-W1, zustaende-S-U4a, zustaende-S-C4

```text
**S-W3 emptyBox und chartEmpty** – bereich_dashboard-13, wording-46, diagramme-38
- Z. 32 → `const emptyBox = (h = 220) => `<div class="empty chart-empty" style="min-height:${h}px">${I.stats}<span class="ce-t">${EMPTY_T[EMPTY]}</span></div>`;`
- Z. 44 → `const chartEmpty = el => U.chartEmpty(el);`

```

## zustaende-S-TE2 · Test dashtest.js:143–144: leeres Dashboard mit „—“-Kacheln, Karten-Titel „Noch keine Trades“, ohne „Mehr anzeigen“

Gruppe zustaende · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-13, wording-46, wording-47, zustaende-8
Quelle: audit/spec/zustaende.md Z. 878–878 · Dateien: web/e2e/dashtest.js
Abhängig von: zustaende-S-W1, zustaende-S-W2, zustaende-S-W3, zustaende-S-W4, zustaende-S-D1

```text
- `e2e/dashtest.js:143–144` ersetzen: im leeren Zustand mindestens 5 `.dash-top .tile .nodata.dash` mit `textContent` „—Noch keine Daten“; mindestens 3 `.chart-empty .ce-t` mit „Noch keine Trades“; `#content` enthält nicht „ändere den Zeitraum“; kein `.recent-card .more-link`.
```
