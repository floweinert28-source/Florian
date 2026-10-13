# Paket 013 · dashboard, komponenten

Schritte: 7 · Dateien: web/css/app.css, web/e2e/dashtest.js, web/e2e/leaktest.js, web/js/screens/dashboard.js, web/js/widgets.js
Betroffene Tests laut Spezifikation: web/e2e/dashtest.js:143–144 (Schritt zustaende-S-TE2); web/e2e/dashtest.js:67 (bleibt grün); web/e2e/leaktest.js (unverändert)
Baut auf Paketen auf: 1, 6, 12

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## aufbau-B12 · Ein Muster für „mehr dazu“: .more-link neutral, .more-row löschen

Gruppe aufbau · Cluster komponenten · Aufwand S · Befunde: bereich_dashboard-33
Quelle: audit/spec/aufbau.md Z. 379–383 · Dateien: web/css/app.css
Abhängig von: aufbau-C2a

```text
**B12 Ein Muster für „mehr dazu“** (`web/css/app.css` Z. 1658–1660) · bereich_dashboard-33
- Z. 1658 `.more-row { … }` löschen (nach C2 unbenutzt; mit `grep -rn more-row web/` prüfen)
- Z. 1659 `.more-link { color: var(--accent); font-weight: 600; font-size: 13px; text-decoration: none; }` → `.more-link { color: var(--text-2); font-weight: 500; font-size: 13px; text-decoration: none; }`
- Z. 1660 `.more-link:hover { text-decoration: underline; }` → `.more-link:hover { color: var(--text); }`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .more-row] Bindendes Ergebnis für „Letzte Trades & offene Positionen“ (widgets.js:253/257): keine Fußzeile mehr. Der Link sitzt nach dem einen App-Muster (aufbau) rechts im Kartenkopf, wie „Öffnen“ bei den Bereichs-Widgets. Z. 257 endet auf `…${table}` ohne `.more-row`, Optionen `{ info: e.info, cls: 'recent-card', trailing: d.all.length ? more('#/trades', 'Zum TradeLog') : '' }`. Beschriftung „Zum TradeLog“ (Wording-Glossar W5: „Zum/Zur + Bereich“ = Navigation aus einem Widget; Übersetzung „Go to TradeLog“ ist dort vorbereitet), also weder „Alle Trades“ noch „Mehr anzeigen“ (das bleibt fürs Nachladen reserviert). Info-Text Z. 253: „…; „Zum TradeLog“ öffnet die ganze Liste.“ Der Link erscheint nur, wenn das Widget überhaupt Trades hat (`d.all.length`). Das erfüllt W13 („mehr“-Link nur mit Inhalt) und zustaende-S-TE2 (leeres Dashboard ohne `.recent-card .more-link`). Der Kopf-Link springt aber nicht weg, wenn man auf „Offene Positionen“ ohne offene Position umschaltet (das täte die Bedingung rows.length). Regel-Tracker Z. 288 verliert den Kopf-Link (aufbau-C2a = wording 6.15, einmal umsetzen). Danach löscht aufbau-B12 `.more-row` (Z. 1658). Tests: dashtest.js:67 Meldung „Zum TradeLog“, die Prüfung `.recent-card .more-link` mit href `#/trades` bleibt. In dashtest.js:72 den Teil `&& await p.$eval('.w[data-typ="regel_tracker"] .card-head .more-link', …)` streichen, weil der Kopf-Link bewusst entfällt; die Prüfung `.tracker-foot a` → `#/progress` bleibt.
- [konflikt: .more-link:hover] app.css:1659–1660 nach aufbau-B12: `.more-link { color: var(--text-2); font-weight: 500; font-size: 13px; text-decoration: none; }` und `.more-link:hover { color: var(--text); }`, ohne Unterstreichung. Z. 1659 ist in beiden Specs identisch. farbe-C3b wollte beim Hover zusätzlich `text-decoration: underline; text-underline-offset: 3px`. Der Kopf-Link ist ein Navigations-Steuerelement wie Reiter und Navigation. Seine Hover-Rückmeldung läuft nur über die Textfarbe (aufbau „kein Grün/Unterstrich“, bewegung H1). Unterstrichen sind nur Fließtext-Links (.tlink). Das 13-px-Token regelt typografie-3.2.3l.
- [konflikt: .more-link] CSS (aufbau-B12 übernimmt): .more-link { color: var(--text-2); font-weight: 500; font-size: var(--fs-13); line-height: var(--lh-13); text-decoration: none; } .more-link:hover { color: var(--text); }. Ohne Unterstrich beim Hover, wie in der aufbau-Regel („kein Grün, kein Unterstrich“): ruhiger, und gleich wie die übrigen Kopf-Bedienelemente. .more-row wird gelöscht. Touch-Höhe 44 px aus barrierefreiheit-B12e danach, unverändert. Letzte Trades (widgets.js:253/257): Der Link steht im Kartenkopf (aufbau-C2a, U.card trailing), nicht in einer Fußzeile, und heißt „Zum TradeLog“. Das ist laut wording W5 der feste Name für „Navigation aus Widget“ und sagt das Ziel; „Alle Trades“ und „Mehr anzeigen“ fallen weg, denn „Mehr anzeigen“ heißt laut aufbau nur Nachladen. Der Link erscheint nur mit Zeilen (wording W13, zustaende): { info: e.info, cls: 'recent-card', trailing: rows.length ? more('#/trades', 'Zum TradeLog') : '' }. Info-Satz: „Die zuletzt geschlossenen Trades des Kontos und alle noch offenen Positionen. So viele Zeilen, wie in die Karte passen; „Zum TradeLog“ öffnet die ganze Liste.“ Regel-Tracker: trailing ersatzlos streichen (aufbau-C2a = wording 6.15, aufbau übernimmt). Der Leertext-Link geht auf #/settings/regeln.
- ÄNDERN: font-size: var(--fs-13); line-height: var(--lh-13) statt 13px. Sonst wie spezifiziert, Hover nur color: var(--text). .more-row erst nach aufbau-C2a löschen (grep -rn more-row web/ leer).
- ÜBERNIMMT farbe-C3b: Gleiche Farbe und gleiches Gewicht, ohne Hover-Unterstrich und text-underline-offset.

## aufbau-C6a · Dashboard: Vorlagen-Tooltip mit Namen, Zertifikat-Symbol award

Gruppe aufbau · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-23
Quelle: audit/spec/aufbau.md Z. 463–467 · Dateien: web/js/screens/dashboard.js
Abhängig von: aufbau-B9

```text
#### `web/js/screens/dashboard.js`

**C6** · bereich_dashboard-23, ki_look-13, aufbau-33
- Z. 125 Vorlagen-Knopf: `title="Vorlage"` → `title="Vorlage: ${esc(tpl.name)}"` (Position und Form bleiben, README:64)
- Z. 125 Zertifikat-Knopf: `${I.shield}` → `${I.award}`
```

## aufbau-C6b · Dashboard bearbeiten: Leiste ohne Namen, aria mit Widget-Namen

Gruppe aufbau · Cluster dashboard · Aufwand S · Befunde: ki_look-13, aufbau-33
Quelle: audit/spec/aufbau.md Z. 468–469 · Dateien: web/js/screens/dashboard.js
Abhängig von: aufbau-B13

```text
- `wrap` Z. 41: `<span class="w-name">${esc(e.name || inst.typ)}</span>` → `<span class="grow" aria-hidden="true"></span>`; am Griff `aria-label="Verschieben"` → `aria-label="${esc(e.name || inst.typ)} verschieben"`; am × `aria-label="Widget entfernen"` → `aria-label="${esc(e.name || inst.typ)} entfernen"`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .w-name] aufbau-C6b gilt. dashboard.js wrap() Z. 41: `<span class="w-name">…</span>` → `<span class="grow" aria-hidden="true"></span>`. Kein .vh-Name in der Leiste. Der Widget-Name steht stattdessen im Namen der Steuerelemente, nach dem app-weiten Muster `<Objekt> „<Name>“ <Verb>` (barrierefreiheit Z4/Glossar): Griff `aria-label="Widget „${esc(e.name || inst.typ)}“ verschieben"`, × `aria-label="Widget „${esc(e.name || inst.typ)}“ entfernen"`, übersetzt über die Muster 'Widget „{0}“ verschieben' und 'Widget „{0}“ entfernen' in js/lang/{en,es,hi,pt,zh}.js. Grund: Ein loses .vh-Wort in der Leiste hängt an keinem Steuerelement. Ein Name im Steuerelement sagt dem Screenreader, welches Widget verschoben oder entfernt wird, und folgt der Namensregel der ganzen App statt der Kurzform „{0} verschieben“.
- ÄNDERN: Wie spezifiziert, aber mit den aria-labels `Widget „${name}“ verschieben` und `Widget „${name}“ entfernen` (name = esc(e.name || inst.typ)), nicht „{0} verschieben“/„{0} entfernen“. Im Glossar (aufbau.md Z. 164) und in den Sprachdateien heißen die Muster 'Widget „{0}“ verschieben' und 'Widget „{0}“ entfernen'. Prüfpunkt Z. 757: Griff-aria „Widget „Netto-P&L“ verschieben“ (genauer Name aus W.CATALOG).
- [doppelt: .grow] Ein leerer Füller `<span class="grow" aria-hidden="true"></span>` aus aufbau-C6b. Die globale Klasse .grow (app.css Z. 130) bleibt unverändert. Die Begründung steht beim Anker .w-name.
- [konflikt: .w-bar] Die Leiste über jedem Widget ist flach: `.w-bar { display: flex; align-items: center; gap: 6px; padding: 0; margin-bottom: 6px; border: 0; background: none; }` (aufbau-B13). Das Markup kommt aus aufbau-C6b. `font-size: 12.5px` an .w-bar wird ersatzlos gestrichen und nicht tokenisiert: Ohne .w-name steht in der Leiste kein erbender Text mehr. .seg.mini und .btn.sm setzen eigene Größen, der Griff ist ein Symbol. Damit bleibt keine wirkungslose Deklaration stehen (kilook Z11).

## aufbau-D3i · Unveränderte Tests bestätigen (dashtest.js, leaktest.js)

Gruppe aufbau · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-33
Quelle: audit/spec/aufbau.md Z. 713–715 · Dateien: web/e2e/dashtest.js, web/e2e/leaktest.js
Abhängig von: aufbau-C2a, aufbau-B12

```text
- `dashtest.js:67` bleibt grün (`.recent-card .more-link` mit `href="#/trades"`); Z. 72 bleibt
- neu `leaktest.js` bleibt unverändert (nur F1 würde ihn ändern)

```

## zustaende-S-W1 · Widgets: Leerlage je Render (EMPTY/EMPTY_T, gesetzt in makeData)

Gruppe zustaende · Cluster dashboard · Aufwand S · Befunde: wording-46, bereich_dashboard-13
Quelle: audit/spec/zustaende.md Z. 461–470 · Dateien: web/js/widgets.js
Abhängig von: —

```text
### 3.4 `web/js/widgets.js`

**S-W1 Leerlage je Render** – wording-46, bereich_dashboard-13
Nach Z. 9 (`const NO_DATA = …`) neu:
```js
let EMPTY = 'range'; /* 'none' = Konto ohne Trade, 'filter' = Dashboard-Filter ohne Treffer, 'range' = Zeitraum leer; gesetzt in makeData */
const EMPTY_T = { none: 'Noch keine Trades', filter: 'Keine Trades passen zum Filter', range: 'Keine abgeschlossenen Trades im Zeitraum' };
```
In `makeData` (Z. 12) als erste Zeile: `EMPTY = !(ctx.raw || ctx.all || []).length ? 'none' : ctx.filtered ? 'filter' : 'range';`

```

## zustaende-S-D1 · Dashboard reicht raw und filtered im ctx an die Widgets

Gruppe zustaende · Cluster dashboard · Aufwand S · Befunde: wording-46, bereich_dashboard-13
Quelle: audit/spec/zustaende.md Z. 493–497 · Dateien: web/js/screens/dashboard.js
Abhängig von: zustaende-S-W1

```text
### 3.5 `web/js/screens/dashboard.js`

**S-D1 Leerlage durchreichen** – wording-46, bereich_dashboard-13
Z. 118 `if (fN) ctx = Object.assign({}, ctx, { all: applyFilter(ctx.all, f), inRange: applyFilter(ctx.inRange, f) });` → `if (fN) ctx = Object.assign({}, ctx, { raw: rawAll, filtered: true, all: applyFilter(ctx.all, f), inRange: applyFilter(ctx.inRange, f) });`

```

## zustaende-S-D2 · Dashboard-Filter-Knopf: Klasse is-on statt accent

Gruppe zustaende · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-6
Quelle: audit/spec/zustaende.md Z. 498–500 · Dateien: web/js/screens/dashboard.js
Abhängig von: zustaende-S-C7

```text
**S-D2 Filter-Knopf neutral** – bereich_dashboard-6
Z. 124 `class="btn ${fN ? 'accent' : ''}"` → `class="btn${fN ? ' is-on' : ''}"`.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .btn.accent] .btn.accent steht nur noch für „Trade loggen“ (App.newTradeButton `.btn.accent.tl` und der runde Handy-Knopf). Aktiver Dashboard-Filter: Klasse `is-on`. So steht es in zustaende-S-D2/-S-C7, kollisionsfrei und im gemeinsamen Ausgewählt-Stil. farbe-C19b/-B25 nennen denselben Zustand `.dh-context .btn.is-set`; das entfällt. Das aria-label „Filter ({0} aktiv)“ aus farbe-C19b bleibt. TradeLog-Leerzustand „Trade loggen“: neutral `btn sm` (komponenten-S-trades-b). Gründe: Die Kopfreihe trägt „Trade loggen“ schon, die Farbe-Spezifikation selbst verlangt „1 je Ansicht“, BRIEF spricht von dem einen Hauptknopf, und Leerzustand-Aktionen sind btn sm. „Trade für diesen Tag“ entfällt (wording-S8.1-8.2). Damit ist jedes .btn.accent ein Hauptknopf: `.btn.accent` font-weight 600 → 700 direkt, ohne eigene Regel `.btn.accent.tl`; die wäre eine wirkungslose Doppelregel. Der aktive Filter (is-on) bleibt 500 wie jeder Knopf, also nicht fetter.
