# Abstände und Layout – Zielspezifikation

Gruppe „Abstände und Layout“, 77 bestätigte Befunde (`spec-input/abstaende.json`).
Codestand: Commit `677b630` (13.10.2026). Zeilenangaben beziehen sich auf diesen Stand. Nach den ersten Änderungen verschieben sie sich, dann gilt der genannte Selektor bzw. Text.

Bereits erledigt und nur noch abzusichern: Der Größen-Listener des Dashboards wird seit Commit `aa9f1c6` beim Verlassen abgehängt (`unmount()` in `dashboard.js:138`, Suite `e2e/leaktest.js`). Das betrifft bereich_prop-1, aufbau-2 und bereich_statistik-34 (Schritt J1).

Eigene Messungen für diese Spezifikation (Playwright, Beispieldaten, CSS-Änderungen direkt im Stylesheet nachgebaut, Skripte in `scratchpad/abst-spec/`):
- `tiles3.js`: Wertlinie der Kacheln, Varianten B/E/F bei 1440, 1024 und 390. Die gewählte Variante F ist unten beschrieben.
- `sidebar.js`: Seitenleiste bei 1440×1000, 1440×900, 1366×768 und 1280×720, voll und eingeklappt.
- `modal.js`: Trade-Dialog mit Formular-Abständen und 6-Spalten-Raster bei 1440 und 390.

---

## 1. Zielzustand

### 1.1 Abstandsskala (verbindlich)

Alle Abstände (gap, padding, margin) kommen aus einer 4-px-Skala. Sie steht als Token in `:root` (app.css, direkt nach `--gutter`):

```css
/* Abstände: eine 4-px-Skala für alle Lücken und Innenabstände (Ausnahmen siehe README „Abstände“) */
--sp-1: 4px; --sp-2: 8px; --sp-3: 12px; --sp-4: 16px; --sp-5: 20px; --sp-6: 24px; --sp-8: 32px; --sp-10: 40px;
--content-gap: var(--sp-6);   /* Abstand zwischen Abschnitten einer Seite */
--grid-gap: var(--sp-4);      /* Abstand zwischen Karten und Kacheln in einem Raster */
--pad-card: var(--sp-5);      /* Innenabstand von Karten, Einstellungsblöcken, Coupons */
/* Breiten für Lese- und Einzelansichten */
--w-chat: 800px;   /* Mentor-Chat, Einrichten-Karten */
--w-news: 1040px;  /* News-Liste */
--w-read: 920px;   /* Coach-Journal (Lesespalte) */
--w-single: 680px; /* Beitritts-Karten (Coach) */
```

Regeln:
1. Neue oder geänderte Abstände in CSS schreiben `var(--sp-n)` bzw. die semantischen Token, keine nackten px-Werte.
2. Erlaubt außerhalb der Skala sind nur: 1–3 px für Haarlinien, Rahmenausgleich und Schienen-Innenränder (verschachtelte Radien), negative Ausgleichswerte, die eine Skalenlücke herstellen (z. B. `calc(var(--sp-3) - var(--content-gap))`), und die dokumentierten Ausnahmen in 1.12.
3. Innenmaße von Steuerelementen (Knöpfe, Eingabefelder, Segmente, Reiter, Chips, Pillen, Abzeichen, Menüeinträge, Popover) legt die Komponenten-Spezifikation fest. Ihre Werte müssen ebenfalls aus dieser Skala kommen. Diese Spezifikation ändert davon nur `.nav a` (gap) und `.field` (gap).

### 1.2 Zuordnung: welcher Abstand wofür

| Situation | Wert | Token |
|---|---|---|
| Titel ↔ Untertitel (`.card-sub`, `.set-desc` unter Blocktitel) | 4 | `--sp-1` |
| Label ↔ Feld (`.field`) | 8 | `--sp-2` |
| Elemente nebeneinander in einer Reihe (`.row`, Knopfgruppen, `.modal-foot`) | 8 | `--sp-2` |
| Kachel: Kopf ↔ Körper | 8 | `--sp-2` |
| Listenzeilen (`.kv`, `.bar-row`) vertikal | 8 | `--sp-2` |
| Symbol ↔ Text in der Seitenleiste (`.nav a`) | 12 | `--sp-3` |
| Gestapelte Elemente in einem Block (`.stack`) | 12 | `--sp-3` |
| Kachel: Trennlinie ↔ Wert (`.tile .body` oben) | 12 | `--sp-3` |
| Zeilen- und Auswahlkarten untereinander/nebeneinander (`.shadow-rules`, Auswahlkarten-Raster, `.prop-rules`, `.prop-group`) | 12 | `--sp-3` |
| Unterformular in einem Kasten (`.prop-rule-f`) | 12 | `--sp-3` |
| Reiterleiste ↔ zugehöriger Inhalt (Statistik-Reiter, Affiliate-Umschalter) | 12 sichtbar | `--sp-3` |
| Titel oder Untertitel ↔ Inhalt (`.card-head`, `.set-block h3`, `.set-desc`, `.set-head-row`) | 16 | `--sp-4` |
| Kopfreihe ↔ Inhalt (`.content > .page-head`) | 16 | `--sp-4` |
| Karten und Kacheln in einem Raster (`.grid`, `.dash-top`, `.dash-main`, `.stat-tiles`, `.nb`, `.cpn-grid`, `.nw-list`, `.coach-entries`) | 16 | `--grid-gap` |
| Formularspalten und -zeilen (`.form-grid`, `.tf-main`) | 16 | `--sp-4` |
| Dialog: Kopf ↔ Inhalt ↔ Fuß, Fußlinie ↔ Knöpfe | 16 | `--sp-4` |
| Abschnitte einer Seite (`.content`, `.aff`, `.nw-wrap`, `.coach-wrap`, `.set-body`) | 24 | `--content-gap` |
| Dashboard und TradeLog: Kacheln, Reiter, Filter, Raster bilden eine Fläche | 16 | `--grid-gap` |
| Seitenrand | 24 (bis 960 px: 16) | `--gutter` |
| Einstellungen: Navigation ↔ Inhalt | 32 (bis 960 px: 16) | `--sp-8` |

### 1.3 Innenabstände der Container

| Container | Innenabstand | Textkante ab Außenrand |
|---|---|---|
| Karte `.card`, Einstellungsblock `.set-block`, Coupon `.cpn` | 20 rundum (`--pad-card`) | 21 |
| Kachel `.tile`, `.stat-tile`, `.stat`, `.kstrip .tile` | 16 oben/unten, 20 seitlich | 21 |
| Kachel am Handy (≤ 560 px): `.tile`, `.stat-tile`, `.kstrip .tile` | 16 oben/unten, 12 seitlich (wie heute bei `.tile`, Begründung README: Titel samt Info-Symbol passen in eine Zeile) | 13 |
| Mittlere Karten `.aff-ticket`, `.coach-entry`, `.nw-next`, `.rp-choice` | 16 oben/unten, 20 seitlich | 21 |
| Zeilenkarten und Hinweise `.banner`, `.shadow-rule`, `.nw-banner`, `.coach-invite`, `.prop-rule` | 12 oben/unten, 16 seitlich | 17 |
| Formular-Kasten `.prop-entry` | 16 rundum | 17 |
| Dialog `.modal` | 24 rundum; bis 960 px 20 oben/unten, 16 seitlich | 25 |
| Seite `.content` | 24 oben, `--gutter` seitlich, 60 unten | – |

`.card.tight` wird gelöscht (im JS nirgends benutzt). `.card.flush` bleibt bei 0.

Folge: Kachel-, Karten-, Tabellen- und Einstellungstexte einer Spalte beginnen auf derselben Kante (Dashboard 1440: x = 256 + 21 = 277 für „Netto P&L“ und „Gesamt-Score“).

### 1.4 Seitenebene

- `.content`: `gap: var(--content-gap)` (24), `padding-top: var(--sp-6)` (24).
- Kopfreihe: `.content > .page-head { flex-shrink: 0; margin-bottom: calc(var(--sp-4) - var(--content-gap)); }`. Damit liegt zwischen Kopfreihe und erstem Inhalt immer 16 px, auf jeder Seite. Die Kopfreihe staucht sich in den Fenster-Layouts (Notebook, TradeLog) nicht mehr. `--page-head-h` bleibt 64 px: 24 + 44 + 16 = 22 + 44 + 18, die Summe bleibt gleich.
- Dashboard: `.content:has(> .dash-top, > .dash-main) { --content-gap: var(--grid-gap); }`. Kopfreihe, Kacheln und Widget-Raster haben dann überall 16 px Abstand. Die Kopfreihe bekommt dort automatisch margin-bottom 0.
- TradeLog: `.content > .tl-fit { gap: var(--grid-gap); }` (16). Kacheln, Reiter, Filter und Tabelle bilden eine Fläche.
- Eine Kopfreihe ohne Inhalt wird nicht gerendert: `App.pageHead` gibt `''` zurück, wenn links und rechts leer sind. Zur Absicherung gilt `.page-head:empty { display: none; }`.
- Statistik-Reiter stehen 12 px über ihrem Inhalt und 24 px unter der Diagrammkarte: `.content > .tabs.scroll-x[data-subnav] { margin-bottom: calc(var(--sp-3) - 4px - var(--content-gap)); }` (die 4 px gleichen das Scroll-Polster der Leiste aus).
- Affiliate-Umschalter: `.aff { gap: var(--content-gap); }`, `.aff > .aff-top { margin-bottom: calc(var(--sp-3) - var(--content-gap)); }`.
- Ein Abschnittstitel steht näher an seinem Inhalt als am Block davor. Beispiel Prop-Übersicht: Kennzahlen → 24 → „Aktive Konten“ → 12 → Gruppen. Mehrere Gruppen stehen 24 px auseinander.

### 1.5 Raster

- `.grid`: `gap: var(--grid-gap)` (16). Höhen von zwei Rasterzeilen: `calc(var(--card-h) * 2 + var(--grid-gap))`.
- Dashboard unten (`.dash-main`): ab 1241 px drei Spalten, 721–1240 px zwei Spalten (Größe „groß“ belegt zwei, „mittel“ zwei), bis 720 px eine Spalte.
- Dashboard-Kacheln (`.dash-top`): ab 1241 px nebeneinander (`--n`), 561–1240 px bei genau 5 Kacheln ein 6-Spalten-Raster mit 3 + 2 (oben je 2 Spuren, unten je 3), bei genau 4 Kacheln vier Spalten (1000–1240 und 800–960 px). Am Handy zwei Spalten, eine ungerade letzte Kachel geht über die volle Breite. Kein seitliches Karussell mehr.
- Kachel-Raster `.grid.tiles` mit genau 4 Kacheln: vier Spalten bei 1000–1240 px und 800–960 px (TradeLog, Schatten-Ich, Prop-Übersicht, Friedhof).
- Trade-Ansicht: Detailkarten immer zwei Spalten (`.grid.detail-grid`), unter 1280 px eine.
- Auswahlkarten in den Einstellungen bilden je Block ein Raster über die volle Blockbreite, mit gemeinsamer Lücke 12 px. Die Spaltenzahl richtet sich nach der Anzahl, damit keine halb leere Zeile entsteht: Erscheinungsbild, Schriftart und Meine Designs 4 Spalten, Farbpaare und Sprachen 3 Spalten. Ist `.set-body` schmaler als 720 px (Container-Abfrage), sind es 2 Spalten. Weil alle Raster dieselbe Lücke haben, fallen die Kanten der 4er- und 3er-Raster an den Außenrändern zusammen, und kein Raster endet mitten im Block.

### 1.6 Kacheln: eine Wertlinie je Reihe

Regel: In jeder Kachelreihe stehen alle Werte auf derselben Höhe, direkt unter Kopf und Trennlinie. Fußzeile, Gewinn/Verlust-Balken und Zusatzinfos hängen darunter. Kleine Diagramme (Halbkreis, Donut, Verlauf) stehen weiter mittig auf Höhe der Wert-Schrift. Das ist die Nutzerentscheidung „Kachel-Diagramme auf Höhe des Werts, etwas nach links“, geprüft von `dashtest.js:19`.

Mechanik (gemessen mit `tiles3.js`, Variante F):
- `.tile { padding: var(--sp-4) var(--sp-5); gap: var(--sp-2); }`
- `.tile .body { align-items: flex-start; padding-top: var(--sp-3); }` (der Rest der Regel bleibt)
- `.tile.side .gauge { margin-right: var(--sp-3); margin-block: -14px; }` – das 54–56 px hohe Diagramm belegt im Fluss nur die Höhe der Wertzeile und bleibt mittig zur Zahl.
- `.tile.side .body { padding-bottom: var(--sp-2); }` – Platz für die untere Hälfte des Diagramms, wenn die Reihe nicht höher ist.
- Container ≤ 150 px (Halbkreis ohne Pillen, ≈ 30 px hoch): `.tile.side .gauge:has(> .gauge-stack) { margin-block: -3px; }`
- Verlaufskachel im TradeLog: `.tile.spark-tile .spark-body { align-items: flex-start; padding-top: var(--sp-3); }`, `.tile.spark-tile .chart { margin-block: -14px; }`, im Container ≤ 180 px `margin-block: 0`.
- Die Container-Abfragen der Kachel wandern um die 10 px weniger Innenbreite mit: 220 → 210, 178 → 168, 164 → 154, 250 → 240, 190 → 180. Die Abfrage 150 bleibt, weil die Handy-Kachel seitlich bei 12 px bleibt und sonst die Pillen am Handy wieder erscheinen würden.

Messwerte Variante F (Wert-Oberkante relativ zur Kachel, dC = Abstand der Mitten Wert/Diagramm, gR = Abstand Diagramm zum rechten Kachelrand):

| Seite, Breite | heute | danach |
|---|---|---|
| Dashboard 1440 | 59 / 69 / 69 / 69 / 48 | 53 × 5, dC ≤ 0,8, gR 33 |
| Dashboard 1024 | 51 / 62 / 62 / 69 / 48 | 53 × 5 |
| Dashboard 390 | 49 / 60 / 65 / 65 / 49 | 54 × 5, dC ≤ 1,5 |
| TradeLog 1440 | 53 / 62 / 62 / 62 | 53 × 4, Kachel 116 → 101 px hoch, Diagramm 7–9 px über dem Rand |
| Schatten-Ich 1440 | 48 / 63 / 53 / 53 | 53 × 4 |
| Prop-Bilanz, Affiliate, Statistik-Fehler 1440 | 47/55 · 57/47 · 58/48 | jeweils eine Linie |

Dashboard-Kacheln werden durch Polster 16 statt 12 um 8 px höher (131 → ≈ 144 px). Das ist gewollt, die Handy-Kachel hat schon 16 oben/unten.

Statistik-Übersicht (`.stat-tile`, keine Fußzeilen): Werte stehen unten bündig, auch wenn ein Titel umbricht: `.stat-tile { display: flex; flex-direction: column; }`, `.stat-tile .v { margin-top: auto; padding-top: var(--sp-2); }`.

Umbrechende Kacheltitel am Handy (Statistik „Fehler“, „Edge“, „Monte Carlo“) verschieben den Wert weiter. Das löst die Wortwahl (kürzere Titel), nicht das Layout. Keine Ellipse an Kacheltiteln (README Z. 93).

### 1.7 Kartenkopf

Titel und Knöpfe rechts stehen auf einer Mittellinie. Der Kopf bleibt so hoch wie der Titel (21,75 px), damit nebeneinanderliegende Karten ihre Titel und ihren Inhalt auf derselben Höhe haben:

```css
.card-head { …; align-items: flex-start; margin-bottom: var(--sp-4); }
.card-head:not(:has(.card-sub)) { align-items: center; }
.card-head > .row { margin-block: -7px; }
```

Karten mit Untertitel bleiben oben ausgerichtet. `.card-sub { margin-top: var(--sp-1); }`.

### 1.8 Tabellen in Karten

Eine Tabelle in einer Karte (`.tbl-wrap.inset`) läuft bis an die Kartenränder. Ihre erste und letzte Spalte beginnen bzw. enden auf der Textkante der Karte, Zeilenlinien und Hover gehen über die volle Kartenbreite. Mechanik: `.card { --pad-x: var(--pad-card); }`, `.card.flush { --pad-x: 0px; }`, dazu Ausgleich am Wrapper und an der ersten/letzten Zelle (Schritt C6). Tabellen in Karten haben nie einen eigenen Rahmen (`tbl-wrap inset`, auch in Prop-Bilanz).

Zellen: `.tbl th`, `.tbl td` 12 px oben/unten, 16 px seitlich; `.tbl.compact` 8 px / 12 px. Kopf und Zelle sind gleich hoch. Ausnahmen in 1.12.

### 1.9 Dialoge

- `.modal`: Innenabstand 24 (bis 960 px: 20/16), `gap: var(--sp-4)`.
- Jedes `<form>`, das direktes Kind von `.modal` ist, verhält sich wie `.modal` selbst: `.modal > form { display: flex; flex-direction: column; gap: var(--sp-4); min-width: 0; }`. Das gilt für alle 18 Formular-Dialoge, auch für den Prompt-Dialog (`form.stack`).
- `.modal-foot`: Linie mit 16 px Abstand darüber (gap) und 16 px darunter (`padding-top: var(--sp-4)`), Knöpfe mit 8 px Abstand.
- Abschnittstitel in Dialogen (`.prop-h3`): 8 px zusätzlich nach oben (24 über dem Titel, 16 darunter).

Gemessen (Trade loggen, 1440): Kopf → erstes Feld 0 → 16 px, letztes Feld → Fußlinie 0 → 16 px, Dialoghöhe 500 → 554 px. Am Handy (390×844) 633 px, passt ohne Scrollen.

### 1.10 Formulare

- `.field { gap: var(--sp-2); }` (Label ↔ Feld 8).
- `.form-grid { gap: var(--sp-4); }` (Zeilen und Spalten 16). Neue Hilfsklasse `.form-grid .span4` für „vier Spuren ab 961 px, darunter volle Zeile“.
- Ein Absende-Knopf steht nie über einem leeren Label (`&nbsp;`). Er steht in einer eigenen Fußzeile `.prop-entry-foot` über die volle Breite, rechtsbündig.
- Trade-Dialog: ein 6-Spalten-Raster (`.tf-main`). Symbol 4 Spuren, Richtung 2, mit Kontofeld Symbol 2, Richtung 2, Konto 2. Einstieg, Ausstieg und Kontrakte je 2. Eröffnet, Geschlossen, Punktwert und Gebühren je 3. Prop-Konten über die volle Breite. Alle Spaltenkanten laufen durch. Am Handy (≤ 560) stehen Symbol, Richtung, Konto, Eröffnet und Geschlossen über die volle Breite, Einstieg/Ausstieg/Kontrakte nebeneinander, Punktwert/Gebühren nebeneinander, Lücke 12.
- Einstellungen: Formular-Raster in Blöcken höchstens 560 px breit und zweispaltig (`.set-block .form-grid`), am Handy einspaltig. Einzelfelder höchstens 560 px (`.set-field`). Zahlenfelder mit Einheit behalten 160 px, am Handy die volle Breite.
- Einstellungsblöcke: `h3` → 16 → Inhalt. Mit Beschreibung: `h3` → 4 → `.set-desc` → 16 → Inhalt. Eine Beschreibung ist immer `<div class="set-desc">`, nie `small muted` mit Inline-Abstand.
- Aktionszeilen in Einstellungen (`.set-item`): Text links, Knöpfe rechts in einem Raster `minmax(0, 1fr) auto`. Zeilen sind durch eine Linie getrennt und haben 16 px Polster. Am Handy steht der Knopf unter dem Text.

### 1.11 Breiten

| Ansicht | Breite | Ausrichtung | Kopfreihe |
|---|---|---|---|
| Arbeitsseiten (Dashboard, Statistik, TradeLog, Prop, Coupons, Affiliate, Coach-Übersicht, Coach-Gruppe) | volle Inhaltsbreite | links | volle Breite |
| News | `--w-news` (1040) | links | auf 1040 begrenzt, „Trade loggen“ endet an der Listenkante |
| Mentor-Chat | `--w-chat` (800), stabil (`width: 100%`) | mittig | auf 800 begrenzt und mittig, Konto beginnt an der Chatkante |
| Coach-Journal | `--w-read` (920) | links | keine Kopfreihe |
| Einrichten-Karten (Mentor, Coach) | `--w-chat` (800) | mittig | – |
| Beitritts-Karten (Coach, Co-Coach) | `--w-single` (680) in einer 800er-Spalte | mittig | – |
| Ruhepunkt | 720 (unverändert) | mittig | keine Kopfreihe |

Symbole in zentrierten Einrichten- und Beitrittskarten stehen mittig wie in `.empty`: 34 px, `--faint`.

### 1.12 Dokumentierte Ausnahmen (bleiben bewusst)

- TradeLog-Tabelle 10 px seitlich (`.tl-fit .tbl`, README Z. 104, `tlfittest.js`): passt bei 1280 px ohne seitliches Scrollen.
- Handy-Tabellen `9px 10px` (`mobiletest.js:34`), Affiliate-Handy-Tabelle 6 px seitlich.
- „Letzte Trades“ innen 8 px zwischen den Spalten (`.recent-wrap`), außen bündig mit der Karte.
- Notebook-Spaltenköpfe `.nb .col-head` 12/12/10 (57 px Kopfhöhe ist die Referenz für den neuen Notizkopf).
- Seitenleiste: Schienen- und Einklapp-Maße, Dichte-Regeln für niedrige Fenster (6 bzw. 5 px Polster).
- Handy-Kachel seitlich 12 px.

### 1.13 Seitenleiste

- Die Trennlinie unter der Marke liegt genau auf der Linie der Titelzeile (y = 71, `--topbar-h` − 1) und läuft über die volle Leistenbreite, ausgeklappt und eingeklappt.
- Die Marke ist so hoch wie die Titelzeile (`min-height: var(--topbar-h)`), Name und Untertitel stehen auf derselben Mittellinie wie der Seitentitel.
- Die Dichte-Regeln für niedrige Fenster wirken (Kaskade korrigiert).
- Die Konto-Karte unten bleibt immer sichtbar: Sie klebt 18 px über dem Fensterrand, auch wenn die Navigation scrollt.

Gemessen (`sidebar.js`): Linie bei y = 71, x = 0–231 (voll) bzw. 0–79 (eingeklappt). Konto-Karte unten bei innerHeight − 18 für 1440×1000, 1366×768 und 1280×720. Bei 1440×1000 und 1366×768 gilt scrollHeight = clientHeight.

### 1.14 Notebook

- Die drei Spaltenköpfe stehen auf einer Linie (Oberkante, Höhe 57 px, Trennlinie). Die erste Zeile der Notiz (Datum, Speicherstand, Teilen, •••) ist ein eigener Spaltenkopf `.col-head.note-bar`. Titel, Metadaten und Tags folgen 16 px darunter.
- Am PC steht das Kalender-Symbol des Datumsknopfs auf der Textkante von Titel und Metadaten (x = 28 in der Spalte).
- Zwischen der Linie der Werkzeugleiste und dem ersten Textblock liegen 16 px, auf allen Breiten.
- Mentor-Notizen unter der Notiz beginnen auf der Textkante (28 px).
- Bei 961–1180 px ist die Ordnerspalte beim ersten Öffnen eingeklappt (Knopf „Ordner anzeigen“). Die Notizspalte bekommt so ≈ 480 px.
- Notiz im Papierkorb: derselbe Kopf wie eine normale Notiz (Spaltenkopf mit Knöpfen, großer Titel, Meta-Zeilen).

### 1.15 Leerräume, die nichts tragen

- Keine leere Kopfreihe (Coach).
- Dashboard-Bereichskarten (Prop-Konten, Ruhepunkt, Mentor) sind „flach“: Stehen nur flache Karten in einer Reihe, richtet sich die Höhe nach dem Inhalt. Neben 396-px-Karten wachsen sie mit, der Inhalt steht oben.
- Leerzustände in einer Kartenreihe stehen auf derselben Höhe (gleiche `emptyBox`-Höhe 280).

### 1.16 Inline-Abstände in JS-Vorlagen

Feste Abstände gehören ins CSS. In `web/js/screens/*.js`, `app.js`, `widgets.js` und `ui.js` gibt es heute 139 Inline-Stile mit margin/gap/padding. Ziel: höchstens 35. Übrig bleiben nur berechnete Werte (Breiten aus Daten, `--p`, Farben) und einzelne Paddings ohne passende Komponente (auf die Skala gerundet). Dafür gibt es Hilfsklassen am Ende von app.css:

```css
.s-1 { gap: var(--sp-1); } .s-2 { gap: var(--sp-2); } .s-3 { gap: var(--sp-3); } .s-4 { gap: var(--sp-4); } .s-6 { gap: var(--sp-6); }
.mt-1 { margin-top: var(--sp-1); } .mt-2 { margin-top: var(--sp-2); } .mt-3 { margin-top: var(--sp-3); } .mt-4 { margin-top: var(--sp-4); } .mt-6 { margin-top: var(--sp-6); }
.mb-1 { margin-bottom: var(--sp-1); } .mb-2 { margin-bottom: var(--sp-2); } .mb-3 { margin-bottom: var(--sp-3); } .mb-4 { margin-bottom: var(--sp-4); }
.ml-auto { margin-left: auto; }
```

Umrechnung beim Ersetzen: 1–2 → nur Haarlinie (sonst 4), 3–5 → 4, 6–9 → 8, 10–13 → 12, 14–18 → 16, 20–22 → 20, 24–26 → 24, 28–34 → 32.

---

## 2. Konflikte und Entscheidungen

1. **Wertlinie der Kacheln (bereich_dashboard-10, hierarchie-10, bereich_konto-27, bereich_prop-12, bereich_training-25, bereich_statistik-9, responsiv-36).** Vorgeschlagen waren: `flex-start` mit Diagramm oben bündig (Donut-Mitte 9 px unter der Zahl, verletzt `dashtest.js:19`), `flex-start` nur für Prop/Affiliate/Statistik (`.kstrip`, `.st-tiles`), Fußzeile aus der Wertspalte holen plus `min-height` je Reihe (Variante H; die schmale Ø-Gewinn/Verlust-Kachel bleibt versetzt) und `flex-start` mit negativem Rand am Diagramm. **Entscheidung:** eine globale Regel für alle `.tile` (Variante F, 1.6). Sie ist gemessen bei 1440, 1024 und 390 auf Dashboard, TradeLog, Schatten-Ich, Prop, Affiliate und Statistik. Dabei bleiben die Diagramme auf Höhe des Werts (dC ≤ 0,8 bei 1440, ≤ 1,5 bei 390), und die Nutzerentscheidung bleibt unberührt. Die Bereichsklassen `.st-tiles`/`.st-kpis` und die Sonderregeln für `.kstrip`/`.coach-gs-tiles` entfallen. Für die Statistik-Übersicht (`.stat-tile`) gilt „unten bündig“ (Teil 4 aus bereich_dashboard-10 bzw. diagramme-2).
2. **Kachel-Innenabstand (bereich_dashboard-42: 14px 20px; abstaende_layout-31: seitlich 20, Handy 12px 15px).** **Entscheidung:** 16px 20px am PC, die Handy-Regel `16px 12px` (app.css:3028) bleibt. Die Behauptung in abstaende_layout-31, die Handy-Kachel habe heute 12px 15px, stimmt nicht. 16 oben/unten entspricht der Skala und der Handy-Kachel. Die Container-Abfragen sinken um 10 px, außer der 150er-Abfrage (Begründung 1.6).
3. **Kartenkopf (abstaende_layout-11, komponenten-22, bereich_konto-26).** Nur `align-items: center` würde den Kopf auf Knopfhöhe (34 px) bringen und Titel benachbarter Karten versetzen. **Entscheidung:** zentrieren plus `margin-block: -7px` an der Knopfreihe (1.7). Die Kopfhöhe bleibt 21,75 px. Den rechtsbündigen Ausgleich für Geisterknöpfe (komponenten-22, Teil 2) stelle ich zurück (Abschnitt 5).
4. **Formular-Dialoge (bereich_prop-36, komponenten-20, bereich_konto-47).** Ein Prüfer wollte `form.stack` (Prompt-Dialog) ausnehmen, ein anderer nicht. **Entscheidung:** keine Ausnahme. So steht auch im Prompt-Dialog die Fußzeile 16 px unter dem Feld wie überall. `.modal-foot` padding-top 6 → 16 (komponenten-20). Die dialogeigenen Abstände aus bereich_notebook_news-31 (Komponenten-Gruppe: `.modal-foot { margin-top: 20px; padding-top: 14px }` im Ordner-Dialog) entfallen, sonst entstehen doppelte Abstände.
5. **Abschnittsabstand 24 und Kopfreihe 16 (abstaende_layout-32 und abstaende_layout-1).** Der `.content`-gap gilt auch nach der Kopfreihe. **Entscheidung:** `--content-gap` plus negativer Rand an `.page-head` (1.4). `--page-head-h` bleibt 64, weil padding-top +2 und Kopfreihe→Inhalt −2 sich aufheben. Die in abstaende_layout-32 genannte Anhebung auf 70/121/96 entfällt.
6. **TradeLog-Fuge 18 → 16.** README Z. 93 („festem 18-px-Abstand“) und `mobiletest.js:31` halten den Wert fest. Die Absicht („wie zwischen den anderen Inhaltsblöcken“, Kommentar app.css:955) bleibt erhalten. Die Zahl folgt der neuen Raster-Lücke. README und Test werden angepasst (Schritt K).
7. **Lesebreiten (hierarchie-38, bereich_konto-24, zustaende-15, bereich_konto-53).** hierarchie-38 schlug in der Prüferfassung vor, News, Mentor und Coach auf 960 px zentriert zu vereinheitlichen. Ein anderer Prüfer lehnte das ab: zu lange Chatzeilen, und News würde zentriert, obwohl der Seitentitel links steht. Ein Befund, der den Mentor linksbündig wollte (bereich_training-39), wurde schon im Audit verworfen. **Entscheidung:** Die Breiten bleiben inhaltlich begründet (Tabelle 1.11). Die Kopfreihe wird an die Inhaltskante gebunden (Ursprungsvorschlag von hierarchie-38). Coach wird wie die anderen Arbeitsseiten linksbündig in voller Breite (bereich_konto-24). Das Journal bleibt eine linksbündige Lesespalte. Einrichten-Karten sind bei Mentor und Coach gleich breit (800, zustaende-15). Die Beitrittskarte ist 680 breit und hat eine Achse (bereich_konto-53).
8. **Farbe und Größe des Einrichten-Symbols (bereich_konto-1: `--text-2`, 40/36 px; zustaende-15: `--faint`, 34 px).** **Entscheidung:** wie das gemeinsame Leer-Symbol `.empty > svg` (34 px, `--faint`), weil es derselbe Zustand ist (nichts eingerichtet). Grün entfällt (BRIEF: Grün nur mit Bedeutung).
9. **Auswahlkarten-Raster in den Einstellungen (abstaende_layout-21: alle vier Raster mit 4 Spalten; bereich_einstellungen-24: Farbpaare und Sprachen 3 + 3 per max-width).** Mit 4 Spalten stünden die 6 Farbpaare als 4 + 2. Mit max-width 720 würden die Raster wieder an verschiedenen x enden. **Entscheidung:** volle Blockbreite, gemeinsame Lücke 12, Spaltenzahl nach Anzahl (4 bzw. 3), unter 720 px Container 2 (1.5). So endet kein Raster mitten im Block, und es gibt keine halb leere Zeile (außer bei „Meine Designs“, einer wachsenden Sammlung).
10. **Beschreibungen in Einstellungsblöcken (bereich_einstellungen-31: Titel→Text 6, Text→Inhalt 14; abstaende_layout-34: `.set-block > * + * { 12 }`; Typografie typografie-8/referenz-35: h3 margin-bottom 12).** **Entscheidung:** Skala 4/16 (1.2), umgesetzt über `.set-desc` und `:has(+ .set-desc)`, ohne Eulen-Selektor, weil der mit Stacks und Inline-Rändern doppelt. Die Abstände legt diese Gruppe fest, Größe und Gewicht von `h3` (15/600) die Typografie. Maximalbreite der Beschreibung: 68ch, wie typografie-9 für `.set-block .small` vorsieht. `.set-desc` übernimmt diese Regel, weil die Beschreibungen danach nicht mehr `.small` sind.
11. **Break-even-Zeile (bereich_einstellungen-25: Segment-Knöpfe auf 41,6 px aufpolstern; responsiv-45: Wrapper `.be-range`).** **Entscheidung:** ein Raster `.be-grid` ohne Wrapper, `align-items: start`. Die Labels stehen auf einer Linie, die Steuerelement-Höhen gleicht die Komponenten-Spezifikation an. Ein Sonderpolster für dieses eine Segment schaffe ich nicht. Am Handy: Einheit oben, Von | Bis nebeneinander, Felder volle Breite. Der Zurücksetzen-Knopf wandert in die Titelzeile des Blocks (wie „Meine Designs“). komponenten-39 ist damit für diesen Knopf erledigt.
12. **Tilt-Profil (abstaende_layout-27 mit Subgrid; responsiv-35 mit Schlüssel-Wert-Zeilen am Handy).** **Entscheidung:** beides. Subgrid ab 561 px (Werte auf einer Linie, egal wie die Labels umbrechen), am Handy Zeilen „Label links, Wert rechts“. Labels 12/500 `--muted` ohne Versalien, Werte 32 (bis 960: 24, Handy: 20).
13. **Bearbeitungsmodus (bereich_dashboard-8).** Der Faktenprüfer schlug eine Leiste als Overlay über dem Kartenkopf vor, ohne Höhenzuschläge. Der Vorgabenprüfer lehnte das ab: rund 200 px Steuerelemente über langen Titeln und über dem Wert der 215-px-Kacheln. **Entscheidung:** risikoarme Fassung. Der Name steht nur noch für Screenreader in der Leiste, die gestrichelte Außenlinie entfällt, die Karte selbst ist gestrichelt. Damit bleiben zwei statt drei Rahmen und ein Name statt zwei. Der Sprung um 48 px beim Umschalten bleibt (Moduswechsel). Ich stelle ihn zurück (Abschnitt 5).
14. **Notizkopf (bereich_notebook_news-23 mit zwei Varianten).** **Entscheidung:** eigener Spaltenkopf `.note-bar`, keine Polster-Korrektur. Er bringt die gemeinsame Trennlinie und dieselbe Höhe wie links und in der Mitte. abstaende_layout-28 (Datumsknopf bündig) und bereich_notebook_news-25 (Papierkorb-Kopf) setzen darauf auf.
15. **Papierkorb-Knöpfe (bereich_notebook_news-25: `btn sm danger` oder `btn sm ghost` mit roter Schrift).** **Entscheidung:** `btn sm danger`, wie „Leeren“ in derselben Ansicht. „Wiederherstellen“ wird neutral (`btn sm`).
16. **Grabstein-Rückseite (bereich_prop-47: Faktenprüfer beide Seiten 34 px, Vorgabenprüfer nur Rückseite).** **Entscheidung:** nur die Rückseite, 32 px (Skala, 11 px Luft zur Tafel). Die zentrierte Vorderseite behält ihre Breite für den 20-px-Firmennamen. `friedhoftest.js:80` (Stein < 560 px) danach laufen lassen.
17. **Consistency-Zeile (bereich_prop-29).** Der Faktenprüfer wollte das Label auf „Consistency“ kürzen. `proptest.js:102` und die Übersetzungen hängen aber an „Consistency Rule“. **Entscheidung:** Das Label bleibt und bricht nicht um (`.prop-conds .kv > span { white-space: nowrap }`). Der Wert wird zweizeilig aufgeteilt („Heute noch erlaubt“ als eigene Zeile). `.kv b { text-align: right; }` gilt global.
18. **Dashboard-Listener (bereich_prop-1, aufbau-2, bereich_statistik-34; Teil von abstaende_layout-4/hierarchie-8).** `unmount()` ist seit `aa9f1c6` umgesetzt. Dazu kommt nur noch die Routen-Sperre in `place()` als zweite Sicherung. Die vorgeschlagene Einschränkung des Selektors auf `.dash-head:not(.page-head)` entfällt: Auch die Kopfreihe des Dashboards ist `.page-head`, das würde das Dashboard selbst brechen.
19. **Tagesansicht (referenz-17) und Wortwahl (wording-5, Gruppe Wortwahl).** Beide entfernen „Trade für diesen Tag“ und den Kopf-Knopf „Check-in“. **Entscheidung:** Diese Spezifikation beschreibt den Endzustand der Kopfreihe vollständig (Schritt E-day, Schritt app.js). Wird wording-5 vorher umgesetzt, entfallen dort die doppelten Teile. Keine Funktion geht verloren: Check-in bleibt in der Check-in-Karte („Check-in nachtragen“ bzw. „Bearbeiten“), und „Trade loggen“ übernimmt auf einem anderen Tag dessen Datum.
20. **Querbezüge zu anderen Gruppen:**
    - KI-Look (ki_look-10, bereich_dashboard-41) streicht die Verlaufslinie über `.tile .body` und will `padding-top` 8 → 4. Das padding-top der Kachel legt diese Gruppe auf 12 fest, weil sonst das Diagramm in den Titel ragt. Die Linie darf entfallen.
    - Komponenten (diagramme-43) will der Verlaufskachel die Linie geben, Typografie (bereich_trades_tag-31) macht daraus `.body spark-body`. Beides verträgt sich mit 1.6, weil die Regeln für `.spark-body` spezifischer sind.
    - Komponenten (bereich_statistik-8) will die Statistik-Übersicht auf `U.tile` umstellen. Dann gilt die Unten-bündig-Regel als `.st-kpis .tile .body { flex: 0 0 auto; margin-top: auto; }` statt an `.stat-tile`.
    - Responsiv (bereich_prop-13: Klassen `kstrip n4/n5`) überschneidet sich mit responsiv-32. Die 4er-Regel hier deckt `.kstrip` mit genau vier Kacheln ab (Spezifität 0,4,0 schlägt `.grid.tiles.kstrip`). Aus bereich_prop-13 bleibt nur der n5-Teil.
    - Responsiv (abstaende_layout-15) ist ein Duplikat von responsiv-10 und wird hier umgesetzt.
    - Komponenten (komponenten-16) blendet die Pfeile aller Zahlenfelder global aus. Das deckt die Pfeile im Provisions-Dialog (bereich_konto-47) ab.
    - Typografie legt Größen und Gewichte fest (`.prop-h3` 600, `.tilt-stats` 32/24, `.set-block h3` 15/600). Wo ein Befund dieser Gruppe sie mitnennt, übernehme ich die Werte der Typografie-Gruppe.
21. **Steuerelement-Innenmaße aus abstaende_layout-1.** Die Tabelle des Befunds nennt auch Knopf-, Chip-, Menü- und Popover-Innenabstände. Die setzt die Komponenten-Spezifikation um. Hier nur `.nav a` (gap 14 → 12) und `.field` (gap 6 → 8).
22. **Kleinere Abweichungen von Vorschlägen:**
    - responsiv-13: Die matchMedia-Abfrage gilt nur für 961–1180 px. Am Handy braucht die Ordner-Ansicht die linke Spalte.
    - bereich_prop-37: Der Hinweis wird eine volle Rasterzeile, kein (i). Das bleibt bei der Entscheidung, (i)-Zeichen zu reduzieren.
    - bereich_prop-54: Notiz als `span2` (volle Zeile), nicht `span 2`. Sonst entsteht am Handy eine implizite Spalte (`proptest.js:130`).
    - bereich_prop-33: kein `align-items: end`. Sonst rutscht das Stop-Feld wegen seines Hinweises nach oben.
    - bereich_trades_tag-3: Grenze 1279 statt 1100, kein `align-items: start`.
    - bereich_notebook_news-22: 16 px statt 18 (Skala).
    - bereich_trades_tag-9: Lücke 16 statt 14 (Formular-Regel).
    - responsiv-44 und bereich_trades_tag-23: ein Klassenname `stat-grid detail` statt `dense`/`td-grid`.
23. **Textänderungen in Layout-Befunden, die ich nicht übernehme.** Das Layout löst das Problem jeweils allein:
    - bereich_trades_tag-3: „geplant …, erreicht …“ → „… → …“. Die Spalte ist bei zwei Detailspalten breit genug, der Text darf umbrechen.
    - bereich_prop-12: Fußtext „Verlorene Gebühren“ kürzen. Die Werte stehen durch 1.6 auf einer Linie, `friedhoftest.js:49` hängt am Text.
    - bereich_einstellungen-13: Beispieldaten-Text kürzen. Der Knopf steht durch `.set-item` rechts. Der vorgeschlagene Text würde `sampletest.js:118` brechen (es fehlen „Replay-Screenshots“ und „Sprachnotizen“).
    - bereich_einstellungen-31: neue Beschreibung für „Erscheinungsbild“. Die Vorschaukarten erklären sich selbst.
24. **Duplikate (gemeinsam umgesetzt):**
    - komponenten-20 = bereich_prop-36 (bereich_konto-47 hat dieselbe Ursache)
    - hierarchie-10 ≈ bereich_dashboard-10
    - bereich_konto-26 = abstaende_layout-11 = komponenten-22
    - hierarchie-8 = abstaende_layout-4
    - responsiv-44 = bereich_trades_tag-23
    - responsiv-45 = bereich_einstellungen-25
    - responsiv-35 ⊂ abstaende_layout-27
    - bereich_konto-1 ≈ zustaende-15 (Symbol)
    - abstaende_layout-23 + bereich_einstellungen-13 (Daten und Sicherung)
    - abstaende_layout-31 ⊃ bereich_dashboard-42
    - bereich_einstellungen-24 ⊂ abstaende_layout-21
    - bereich_prop-1 = aufbau-2 = bereich_statistik-34

---

## 3. Umsetzungsschritte

Reihenfolge: A Token und Basis → B Komponenten → C Raster und Seitenlayout → D Einzelstellen in CSS → E–J JavaScript → K Tests, Übersetzungen, README. Nach jedem Block: `bash web/e2e/runall.sh` und Sichtprüfung der Seiten in Abschnitt 4. Am Ende von app.css stehen danach die Hilfsklassen (A6).

### web/css/app.css

**A – Token und Basis**

| Nr. | Stelle | vorher → nachher | Befunde |
|---|---|---|---|
| A1 | `:root`, nach `--gutter: 24px;` (Z. 52) | Token aus 1.1 einfügen (`--sp-1` … `--sp-10`, `--content-gap`, `--grid-gap`, `--pad-card`, `--w-chat`, `--w-news`, `--w-read`, `--w-single`). | abstaende_layout-1 |
| A2 | `.row` (Z. 127) | `gap: 10px` → `gap: var(--sp-2)` | abstaende_layout-1, -34 |
| A3 | `.stack` (Z. 129) | `gap: 10px` → `gap: var(--sp-3)` | abstaende_layout-1, -34 |
| A4 | `.content` (Z. 230) | `padding: 22px var(--gutter) 60px; … gap: 18px;` → `padding: var(--sp-6) var(--gutter) 60px; … gap: var(--content-gap);`. Direkt danach neu: `.content > .page-head { flex-shrink: 0; margin-bottom: calc(var(--sp-4) - var(--content-gap)); }`, `.page-head:empty { display: none; }` und `.content:has(> .dash-top, > .dash-main) { --content-gap: var(--grid-gap); }` | abstaende_layout-32, bereich_notebook_news-5, abstaende_layout-4, hierarchie-8 |
| A5 | Fenster-Layouts Z. 959 und Z. 964 | `padding-bottom: 22px` → `padding-bottom: var(--sp-6)` (beide) | abstaende_layout-32 |
| A6 | Ende der Datei (nach Z. 3144) | Hilfsklassen aus 1.16 anfügen (`.s-*`, `.mt-*`, `.mb-*`, `.ml-auto`). Kommentar: „Hilfsklassen der Abstandsskala; stehen am Ende, damit sie Komponenten-Abstände überschreiben“. | abstaende_layout-34 |
| A7 | `.field` (Z. 297) | `gap: 6px` → `gap: var(--sp-2)` | abstaende_layout-1 |
| A8 | `.form-grid` (Z. 300) | `gap: 12px 14px` → `gap: var(--sp-4)`. Neu nach Z. 301: `.form-grid .span4 { grid-column: 1 / -1; } @media (min-width: 961px) { .form-grid .span4 { grid-column: span 4; } }` | abstaende_layout-32, bereich_prop-37 |
| A9 | `.nav a, .nav button` (Z. 170) | `gap: 14px` → `gap: var(--sp-3)` | abstaende_layout-1 |

**B – Komponenten**

| Nr. | Stelle | vorher → nachher | Befunde |
|---|---|---|---|
| B1 | `.card` (Z. 485) | `padding: 18px 20px` → `--pad-x: var(--pad-card); padding: var(--pad-card);` | abstaende_layout-31, abstaende_layout-12 |
| B2 | `.card.tight` (Z. 487) | Regel löschen (im JS unbenutzt) | abstaende_layout-31 |
| B3 | `.card.flush` (Z. 488) | `padding: 0; overflow: hidden;` → `--pad-x: 0px; padding: 0; overflow: hidden;` | abstaende_layout-12 |
| B4 | `.card-head` (Z. 490) | `margin-bottom: 14px` → `margin-bottom: var(--sp-4)`. Neu dahinter: `.card-head:not(:has(.card-sub)) { align-items: center; } .card-head > .row { margin-block: -7px; }` | abstaende_layout-11, komponenten-22, bereich_konto-26 |
| B5 | `.card-sub` (Z. 503) | `margin-top: 3px` → `margin-top: var(--sp-1)` | abstaende_layout-1 |
| B6 | `.card .divider` (Z. 504) | Selektor → `:is(.card, .set-block) .divider` (der Trenner in Einstellungsblöcken war unsichtbar) | abstaende_layout-23 |
| B7 | `.tile` (Z. 515) | `padding: 12px 15px 12px; … gap: 7px;` → `padding: var(--sp-4) var(--sp-5); … gap: var(--sp-2);` | abstaende_layout-31, bereich_dashboard-42 |
| B8 | `@container (max-width: 220px)` (Z. 523) | `220px` → `210px` | bereich_dashboard-42 |
| B9 | `.tile .body` (Z. 524) | `align-items: center; … padding-top: 8px;` → `align-items: flex-start; … padding-top: var(--sp-3);` (flex: 1, gap und background bleiben) | bereich_dashboard-10, hierarchie-10, bereich_konto-27, bereich_prop-12, bereich_training-25, bereich_statistik-9, responsiv-36 |
| B10 | Kommentar Z. 527 und `.tile.side .gauge` (Z. 528) | Kommentar → „Kacheln mit kleinem Diagramm: der Wert steht oben wie in allen Kacheln; das Diagramm belegt nur die Wertzeile (negativer Rand) und bleibt mittig zur Zahl“. Regel → `.tile.side .gauge { margin-right: var(--sp-3); margin-block: -14px; } .tile.side .body { padding-bottom: var(--sp-2); }` | wie B9 |
| B11 | Container-Abfragen Z. 532, 533 | `178px` → `168px`, `164px` → `154px`. Z. 534 (`150px`) bleibt; dort zusätzlich `.tile.side .gauge:has(> .gauge-stack) { margin-block: -3px; }` ergänzen. | bereich_dashboard-42, wie B9 |
| B12 | `@container (max-width: 250px)` (Z. 1644) | `250px` → `240px` | bereich_dashboard-42 |
| B13 | Verlaufskachel Z. 1733–1737 | Z. 1733 `.tile.spark-tile { gap: 2px; }` löschen. Z. 1734 → `.tile.spark-tile .spark-body { flex: 1; display: flex; align-items: flex-start; gap: 18px; min-height: 0; padding-top: var(--sp-3); }`. Z. 1736 um `margin-block: -14px;` ergänzen. Z. 1737 `@container (max-width: 190px)` → `180px`, darin `.tile.spark-tile .chart { flex: 0 0 auto; height: 48px; margin-block: 0; }` | bereich_dashboard-10 |
| B14 | `.stat-tiles` (Z. 635) | `gap: 14px` → `gap: var(--grid-gap)` | abstaende_layout-32 |
| B15 | `.stat-tile` (Z. 636), `.stat-tile .v` (Z. 639) | `.stat-tile`: `padding: 16px 18px` → `padding: var(--sp-4) var(--sp-5); display: flex; flex-direction: column;`. `.stat-tile .v`: `margin-top: 8px` → `margin-top: auto; padding-top: var(--sp-2);` | bereich_dashboard-10, responsiv-36, abstaende_layout-31 |
| B16 | `.stat-grid`/`.stat` (Z. 645, 646) | Z. 645 (`@media (max-width: 560px) { .stat-grid { grid-template-columns: 1fr; } .stat { border-right: 0 !important; } }`) löschen. Die zwei Spalten mit Rändern kommen dann aus dem 1100er-Block Z. 644. Z. 646 `.stat { padding: 16px 18px; … }` → `padding: var(--sp-4) var(--sp-5)`. Neu nach Z. 650, in dieser Reihenfolge: `.stat-grid.detail .stat { padding: var(--sp-3) var(--sp-5); } .stat-grid.detail .v { font-size: 16px; } .detail-head .stars { font-size: 13px; color: var(--text-2); letter-spacing: 1px; } @media (max-width: 560px) { .stat-grid.detail .stat { padding: var(--sp-3) var(--sp-4); } } @media (max-width: 359px) { .stat-grid { grid-template-columns: 1fr; } .stat-grid > .stat { border-right: 0; } }` (die Media-Regeln müssen hinter der Desktop-Regel stehen, gleiche Spezifität) | bereich_trades_tag-23, responsiv-44, abstaende_layout-31 |
| B17 | `.kv b` (Z. 654) | `font-weight: 600;` → `font-weight: 600; text-align: right;` | bereich_prop-29 |
| B18 | `.bar-row` (Z. 655) | `gap: 5px; padding: 7px 0;` → `gap: var(--sp-1); padding: var(--sp-2) 0;` | abstaende_layout-1 |
| B19 | `.banner` (Z. 662) | `padding: 14px 16px` → `padding: var(--sp-3) var(--sp-4)` | abstaende_layout-31 |
| B20 | Tabellen Z. 593, 597, 612 | `.tbl th` `padding: 13px 14px` → `var(--sp-3) var(--sp-4)`. `.tbl td` `12px 14px` → `var(--sp-3) var(--sp-4)`. `.tbl.compact td, .tbl.compact th` `9px 12px` → `var(--sp-2) var(--sp-3)`. Ausnahmen 1743 (TradeLog), 2990–2994 und 3056 (Handy) bleiben. | abstaende_layout-1 |
| B21 | Tabellen in Karten, neu nach Z. 615 | `:is(.card, .pf-body) .tbl-wrap.inset { margin-inline: calc(-1 * var(--pad-x)); }` `:is(.card, .pf-body) .tbl-wrap.inset .tbl :is(th, td):first-child { padding-left: var(--pad-x); }` `:is(.card, .pf-body) .tbl-wrap.inset .tbl :is(th, td):last-child { padding-right: var(--pad-x); }`. Der aufklappbare Prop-Abschnitt ist eine Karte ohne `.card`: Z. 2627 `.pf-body { padding: 4px 20px 20px; …; gap: 14px; }` → `.pf-body { --pad-x: var(--pad-card); padding: var(--sp-1) var(--pad-card) var(--pad-card); …; gap: var(--sp-4); }`. Z. 2440 `.tbl-wrap.inset .pager { padding: 12px 0 0; … }` → `padding: var(--sp-3) var(--pad-x, 0) 0;`. Handy-Regeln Z. 3033–3034 löschen. Neu nach Z. 615: `.tbl.wrap th { white-space: normal; }` | abstaende_layout-12, bereich_trades_tag-3 |
| B22 | `.modal` (Z. 827), `.modal-foot` (Z. 832) | `.modal`: `padding: 22px 24px` → `padding: var(--sp-6)`. Neu nach Z. 829: `.modal > form { display: flex; flex-direction: column; gap: var(--sp-4); min-width: 0; }`. `.modal-foot`: `gap: 10px; … padding-top: 6px;` → `gap: var(--sp-2); … padding-top: var(--sp-4);`. Im 960er-Block Z. 942 `.modal { padding: 18px 16px; }` → `.modal { padding: var(--sp-5) var(--sp-4); }` | bereich_prop-36, komponenten-20, bereich_konto-47 |
| B23 | Trade-Formular Z. 836–840, 850, 872, 2979–2982 | Z. 836–840 ersetzen durch: `.tf-main { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: var(--sp-4); align-items: end; } .tf-main > .field { grid-column: span 2; } .tf-main > .tf-sym { grid-column: span 4; } .tf-main:has(#f-account) > .tf-sym { grid-column: span 2; } .tf-main > .tf-c3 { grid-column: span 3; }`. Z. 850 `.dir-switch`: `min-width: 210px;` streichen. Z. 872 → `.tf-main > .tf-wide { grid-column: 1 / -1; }`. Handy Z. 2979–2982 ersetzen durch `.tf-main { gap: var(--sp-3); } .tf-main > :is(.tf-sym, .tf-dir, .tf-dt, .field:has(#f-account)) { grid-column: 1 / -1; }` | bereich_trades_tag-9, abstaende_layout-32 |
| B24 | `.prop-form`, `.prop-h3` (Z. 2717, 2718) | Z. 2717 löschen. Z. 2718 → `.prop-h3 { font-size: 14px; font-weight: 600; margin-top: var(--sp-2); }` | bereich_prop-36 |
| B25 | `.prop-rules`, `.prop-rule`, `.prop-rule-f` (Z. 2719, 2720, 2722) | `.prop-rules` gap 10 → `var(--sp-3)`. `.prop-rule` `padding: 12px 14px` → `var(--sp-3) var(--sp-4)`. `.prop-rule-f` `gap: 10px 12px` → `gap: var(--sp-3)` | abstaende_layout-1 |
| B26 | Einstellungsblöcke Z. 1813, 1817, 1818, 1820 | `.set-body` gap 22 → `var(--content-gap)`, dazu `container-type: inline-size;`. `.set-block` `padding: 18px 20px` → `padding: var(--pad-card)`. `.set-block h3` `margin-bottom: 10px` → `margin-bottom: var(--sp-4)`. `.set-head-row` `margin-bottom: 4px` → `margin-bottom: var(--sp-4)`. Neu nach Z. 1821: `.set-block h3:has(+ .set-desc), .set-head-row:has(+ .set-desc) { margin-bottom: var(--sp-1); } .set-desc { font-size: 12px; color: var(--muted); max-width: 68ch; margin: 0 0 var(--sp-4); } .set-desc:last-child { margin-bottom: 0; } .set-item { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: var(--sp-4); align-items: center; padding: var(--sp-4) 0; border-top: 1px solid var(--border); } .set-item:first-child { padding-top: 0; border-top: 0; } .set-block .form-grid { max-width: 560px; grid-template-columns: repeat(2, minmax(0, 1fr)); } .set-block .set-field { max-width: 560px; } .set-addrow { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: var(--sp-3); margin-top: var(--sp-4); }` | bereich_einstellungen-31, -27, -26, -13, abstaende_layout-23, -34, -21 |
| B27 | Break-even, neu nach `.input-unit .input` (Z. 1882) | `.be-grid { display: grid; grid-template-columns: auto 160px 160px; gap: var(--sp-3) var(--sp-4); align-items: start; justify-content: start; }` | bereich_einstellungen-25, responsiv-45 |
| B28 | weitere Container | `.cpn` (Z. 2645) `gap: 5px; padding: 18px 20px` → `gap: var(--sp-1); padding: var(--pad-card)`. `.aff-ticket` (Z. 2667), `.coach-entry` (Z. 2870), `.nw-next` (Z. 3070), `.rp-choice` (Z. 2156) `padding: 16px 18px` → `padding: var(--sp-4) var(--sp-5)`. `.shadow-rule` (Z. 2401) `padding: 14px 16px` → `var(--sp-3) var(--sp-4)`. `.coach-invite` (Z. 2863) `padding: 12px 14px` → `var(--sp-3) var(--sp-4)`. `.prop-entry` (Z. 2681) `padding: 14px; margin-bottom: 14px` → `padding: var(--sp-4); margin-bottom: var(--sp-4)` | abstaende_layout-31 |

**C – Raster und Seitenlayout**

| Nr. | Stelle | vorher → nachher | Befunde |
|---|---|---|---|
| C1 | `.grid` (Z. 505) | `gap: 18px` → `gap: var(--grid-gap)`. Neu nach Z. 512: `.grid.detail-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } @media (max-width: 1279px) { .grid.detail-grid { grid-template-columns: 1fr; } }` | abstaende_layout-32, bereich_trades_tag-3 |
| C2 | Dashboard Z. 1426–1433 | `.dash-top` und `.dash-main` `gap: 18px` → `gap: var(--grid-gap)`. Z. 1429 `calc(var(--card-h) * 2 + 18px)` → `calc(var(--card-h) * 2 + var(--grid-gap))`. Z. 1433 `+ 18px + 96px` → `+ var(--grid-gap) + 96px`. Z. 1594 ebenso. Z. 1430 → `.dash-main > .w.flat { height: auto; align-self: stretch; }`. Neu nach Z. 1449: `.dash-main > .w.flat .fw-empty { justify-content: flex-start; }`. Z. 1492 `.btn.fw-reset { margin-top: auto; …` → `margin-top: var(--sp-3);` | abstaende_layout-32, bereich_dashboard-24 |
| C3 | Schatten-Ich-Widget Z. 1453, 1456, 3039 | Z. 1453 `.fw-stats { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-bottom: 12px; }` → `.fw-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--sp-3); margin-bottom: var(--sp-3); }`. Neu dahinter: `.card.fw-shadow { container-type: inline-size; } @container (min-width: 520px) { .fw-stats { grid-template-columns: repeat(4, minmax(0, 1fr)); } }`. Z. 1456 `.fw-stats b`: `overflow: hidden; text-overflow: ellipsis;` streichen (`white-space: nowrap` bleibt). Z. 3039 (Handy-Regel) löschen. | bereich_dashboard-2 |
| C4 | Bearbeitungsmodus Z. 1569, 1579 | Z. 1569 `.w.editing { outline: 1.5px dashed var(--border-2); outline-offset: 5px; border-radius: var(--radius); }` → `.w.editing { border-radius: var(--radius); } .w.editing .w-body > :is(.card, .tile) { border-style: dashed; border-color: var(--border-2); }`. Z. 1579 `.w-bar .w-name { … }` löschen. | bereich_dashboard-8 |
| C5 | Dashboard 961–1240, neu nach Z. 1595 | `@media (min-width: 961px) and (max-width: 1240px) { .dash-main { grid-template-columns: repeat(2, minmax(0, 1fr)); } .w.sz-gross, .skel.sz-gross, .dash-main > .add-slot.gap.sz-gross { grid-column: span 2; } }`. Muss nach Z. 1593 stehen (gleiche Spezifität). Dazu nach Z. 576: `@container (max-width: 150px) { .score-scale .lbls span:not(:first-child):not(:last-child) { display: none; } }` | responsiv-10 |
| C6 | Tablet und Kacheln, 960er-Block Z. 1775–1776 | Beide Zeilen (Karussell) löschen. Direkt nach dem 960er-Block (nach Z. 1797) neu: `@media (min-width: 721px) and (max-width: 960px) { .dash-main, .dash-main.editing { grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: stretch; } .dash-main > .w.sz-mittel, .dash-main > .w.sz-gross, .dash-main > .skel.sz-mittel, .dash-main > .skel.sz-gross, .dash-main > .add-slot.gap.sz-mittel, .dash-main > .add-slot.gap.sz-gross { grid-column: 1 / -1 !important; } }`. Danach: `@media (min-width: 561px) and (max-width: 1240px) { .dash-top:has(> :nth-child(5):last-child) { grid-template-columns: repeat(6, minmax(0, 1fr)); } .dash-top:has(> :nth-child(5):last-child) > * { grid-column: span 2; } .dash-top:has(> :nth-child(5):last-child) > :nth-child(n + 4) { grid-column: span 3; } }` und `@media (min-width: 1000px) and (max-width: 1240px), (min-width: 800px) and (max-width: 960px) { .dash-top:has(> :nth-child(4):last-child), .grid.tiles:has(> :nth-child(4):last-child) { grid-template-columns: repeat(4, minmax(0, 1fr)); } }` | responsiv-42, responsiv-32 |
| C7 | Handy-Block Z. 3025–3038 | Nach Z. 3026: `.dash-top > .w:last-child:nth-child(odd), .dash-top > .add-slot:last-child:nth-child(odd) { grid-column: span 2; }`. Z. 3036 `.stat-tiles { …; gap: 10px; }` → `gap: var(--sp-3)`. Z. 3037 `.stat-tile { padding: 14px; }` → `padding: var(--sp-4) var(--sp-3)`. Z. 2739 (960er-Block Prop) `.kstrip .tile { padding: 14px 16px; }` → in den 560er-Block verschieben als `.kstrip .tile { padding: var(--sp-4) var(--sp-3); }` | responsiv-31, abstaende_layout-31 |
| C8 | Statistik-Reiter, neu nach Z. 1513 | `.content > .tabs.scroll-x[data-subnav] { margin-bottom: calc(var(--sp-3) - 4px - var(--content-gap)); }` | abstaende_layout-19 |
| C9 | Auswahlkarten-Raster Z. 1822, 1834, 1835, 1919, 1927, 1944 | Die eigenen `grid-template-columns`/`gap`/`max-width` in `.design-grid` (1822), `.theme-grid` (1834), `.lang-grid` (1919), `.font-grid` (1927) und `.pair-grid` (1944) streichen, ebenso die Media-Regel 1835. Neu nach 1821: `.theme-grid, .font-grid, .design-grid, .pair-grid, .lang-grid { display: grid; gap: var(--sp-3); } .theme-grid, .font-grid, .design-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } .pair-grid, .lang-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } @container (max-width: 720px) { .theme-grid, .font-grid, .design-grid, .pair-grid, .lang-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .pair-card .pv i { padding: 7px 4px; } }` (Container ist `.set-body`, B26). | abstaende_layout-21, bereich_einstellungen-24 |
| C10 | Einstellungen Z. 1805, 1895 | `.settings` `gap: 28px` → `gap: var(--sp-8)`. Im 960er-Block `.settings { …; gap: 14px; }` → `gap: var(--sp-4)` | abstaende_layout-32 |
| C11 | Abschnitts-Wrapper | `.aff` (Z. 2662) `gap: 16px` → `gap: var(--content-gap)`. Neu: `.aff > .aff-top { margin-bottom: calc(var(--sp-3) - var(--content-gap)); }`. `.nw-wrap` (Z. 3063) → `display: flex; flex-direction: column; gap: var(--content-gap); max-width: var(--w-news);`. `.nw-list` (Z. 3082) gap 14 → `var(--grid-gap)`. `.cpn-grid` (Z. 2644) gap 14 → `var(--grid-gap)`. `.coach-entries` (Z. 2869) gap 14 → `var(--grid-gap)`. `.shadow-rules` (Z. 2400) gap 10 → `var(--sp-3)`. `.nb` (Z. 954) gap 14 → `var(--grid-gap)`. `.content > .tl-fit` (Z. 955) gap 18 → `var(--grid-gap)`, Kommentar: „Kacheln, Reiter, Filter und Tabelle als eine Fläche wie das Dashboard“. | abstaende_layout-32 |
| C12 | Breiten Z. 2339, 2849, 2850 | `.mentor-wrap { max-width: 800px; margin: 0 auto; }` → `.mentor-wrap { width: 100%; max-width: var(--w-chat); margin-inline: auto; }`. `.coach-wrap { max-width: 920px; margin: 0 auto; width: 100%; …; gap: 16px; }` → `.coach-wrap { width: 100%; display: flex; flex-direction: column; gap: var(--content-gap); }`. Z. 2850 `.coach-wrap.wide` ersetzen durch `.coach-wrap.read { max-width: var(--w-read); } .coach-wrap.narrow { max-width: var(--w-chat); margin-inline: auto; }`. Neu nach Z. 1338: `.content:has(> .mentor-wrap) > .page-head { width: 100%; max-width: var(--w-chat); margin-inline: auto; } .content:has(> .nw-wrap) > .page-head { width: 100%; max-width: var(--w-news); }` | bereich_konto-24, hierarchie-38, zustaende-15 |
| C13 | Skelett Z. 1540–1548 | `.boot-body` `padding: 22px var(--gutter) 60px; … gap: 18px;` → `padding: var(--sp-6) var(--gutter) 60px; … gap: var(--grid-gap);`. `.boot-tiles` und `.boot-main` `gap: 18px` → `var(--grid-gap)`. `.boot-sb` `padding: 6px 10px` → `padding: 22px 10px 6px` (die Leiste hat oben kein Polster mehr, D1). | abstaende_layout-32, abstaende_layout-7 |

**D – Einzelstellen**

| Nr. | Stelle | vorher → nachher | Befunde |
|---|---|---|---|
| D1 | Seitenleiste Z. 137–157, 192, 232 | (1) Die beiden @media-Blöcke Z. 146–157 samt Kommentar unverändert hinter `.sidebar .spacer { flex: 1; }` (Z. 187) verschieben und dabei die Zeile `.brand { padding-bottom: 14px; }` streichen. (2) `.sidebar` `padding: 22px 14px 18px` → `padding: 0 14px 18px`. (3) `.brand` `padding: 4px 0 18px 16px` → `min-height: var(--topbar-h); padding: 0 0 0 16px`. (4) `.sidebar .sb-sep` `margin: 0 8px 14px` → `margin: -5px -14px 14px` (−5 gleicht den gap 4 der Leiste aus, Linie bei y = 71), neu `html.sb-mini .sidebar .sb-sep { margin: -5px -10px 14px; }`. (5) Z. 192 `html.sb-mini .brand { …; padding: 0 0 18px; … }` → `padding: 0; min-height: var(--topbar-h); justify-content: center;`. (6) Z. 232 `.sb-userwrap { margin-top: 10px; flex: 0 0 auto; }` → `.sidebar .sb-userwrap { position: sticky; bottom: -18px; z-index: 1; flex: 0 0 auto; margin: 2px 0 -18px; padding: 8px 0 18px; background: var(--bg-2); }`. Der Selektor braucht `.sidebar`, weil `.popwrap { position: relative }` (Z. 328) später steht. `bottom: -18px` und der negative Rand gleichen das Leistenpolster aus. Gemessen: Karte bei innerHeight − 18. | bereich_shell-2, abstaende_layout-7 |
| D2 | Notebook Z. 1013, 1015–1019, 1061, 1068, 1079, 1128, 1136, 1193, 3005–3014 | (1) Z. 1013 `.nb .note-head { padding: 22px 28px 10px; …}` → `padding: var(--sp-4) 28px 10px`. (2) Neu nach Z. 1013: `.nb .note-bar { justify-content: space-between; flex-wrap: nowrap; padding: 12px 28px 10px; } .nb .note-bar .datebtn { padding-block: 6px; } @media (min-width: 961px) { .nb .note-bar .datebtn { margin-left: -11px; } }`. (3) Z. 1061: `.nb.no-left { grid-template-columns: 260px minmax(0, 1fr); }` → `240px minmax(0, 1fr)`, dazu `@media (min-width: 961px) and (max-width: 1180px) { .nb .note-title { font-size: 28px; } }`. (4) Im 960er-Block nach Z. 1068: `.nb .note-bar { padding-inline: 16px; }`. (5) Z. 1079 `.nb-toolbar` `margin: 0 -8px 10px` → `margin: 0 -8px 0`, Z. 3014 `margin: 0 -8px 8px` → `margin: 0 -8px 0`. (6) Z. 1128 `.ql-editor { padding: 14px 20px 60px; …}` → `padding: var(--sp-4) 20px 60px`. Neu nach Z. 1136: `.ql-editor > :first-child { margin-top: 0; }`. (7) Druck Z. 1193 `.nb .note-head .row .btn` → `.nb .note-bar .btn`. (8) Handy Z. 3006–3009: `.nb .note-head > .row, .nb .note-head > .row > .row` → `.nb .note-bar, .nb .note-bar > .row`. `.nb .note-head > .row > .row:first-child` → `.nb .note-bar > .row:first-child`. `.nb .note-head .popwrap:has(> .datebtn)` → `.nb .note-bar .popwrap:has(> .datebtn)`. `.nb .note-head .row [data-action="nb-share"]` → `.nb .note-bar [data-action="nb-share"]`. Neu im 560er-Block: `.nb .note-bar { padding-inline: 14px; }` | bereich_notebook_news-23, abstaende_layout-28, bereich_notebook_news-22, responsiv-13 |
| D3 | Mentor-Notizen Z. 2882 | `.mentor-notes.in-note { margin: 8px 0 16px; …}` → `margin: var(--sp-2) 28px var(--sp-4);` | bereich_konto-18 |
| D4 | Tilt-Profil Z. 1300–1307 | Z. 1300 `.tilt-wrap` `gap: 18px` → `gap: var(--sp-4)`. Z. 1301 → `.tilt-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); grid-template-rows: auto auto; column-gap: var(--sp-3); row-gap: var(--sp-2); flex: 1; align-content: center; } .tilt-stats > div { display: grid; grid-row: span 2; grid-template-rows: subgrid; }`. Z. 1302 → `.tilt-stats .k { align-self: end; font-size: 12px; font-weight: 500; line-height: 16px; color: var(--muted); }`. Z. 1303: `font-size: 40px` → `32px`, `margin-top: 8px` → `0`. Z. 1304 (`.v.cur`) löschen. Z. 1307 → `@media (max-width: 960px) { .tilt-stats .v { font-size: 24px; } }`. Neu im 560er-Block: `.tilt-stats { grid-template-columns: 1fr; grid-template-rows: none; row-gap: 0; } .tilt-stats > div { display: flex; grid-row: auto; justify-content: space-between; align-items: baseline; gap: var(--sp-3); padding: var(--sp-3) 0; border-bottom: 1px solid var(--border); } .tilt-stats > div:last-child { border-bottom: 0; } .tilt-stats .v { font-size: 20px; text-align: right; } .tilt-stats .v small { font-size: 12px; }` | abstaende_layout-27, responsiv-35 |
| D5 | Ruhepunkt Z. 2260, 2262 | `dl.rp-summary` `gap: 0 24px` → `gap: 0`. `dl.rp-summary dd` zusätzlich `padding-left: var(--sp-6);` | bereich_training-47 |
| D6 | Prop | Z. 2713 `.prop-group { gap: 10px }` → `gap: var(--sp-3)`. Neu nach Z. 2713: `.prop-sec { display: flex; flex-direction: column; gap: var(--sp-3); min-width: 0; } .prop-sec > .prop-group + .prop-group, .prop-sec > .prop-cards + .prop-group { margin-top: var(--sp-3); }`. Neu nach Z. 2732: `.prop-assign-row .badge { min-width: 80px; }`. Neu nach Z. 2681: `.prop-entry-foot { grid-column: 1 / -1; display: flex; justify-content: flex-end; }`, im 560er-Block `.prop-entry-foot .btn { flex: 1 1 auto; justify-content: center; }`. Z. 2725 `.prop-entry .field button { width: 100%; }` löschen. Neu nach Z. 2710: `.prop-conds .kv > span { white-space: nowrap; }` | abstaende_layout-36, bereich_prop-41, bereich_prop-54, bereich_prop-29 |
| D7 | Grabstein-Rückseite Z. 2776 | `.pg-back { transform: rotateY(180deg); padding-top: 60px; padding-bottom: 104px; …}` → zusätzlich `padding-inline: var(--sp-8);` | bereich_prop-47 |
| D8 | Mentor/Coach-Einrichtung Z. 2340–2341, 2891, 2893, 2953 | Z. 2340 `.mentor-setup { text-align: center; padding: 44px 24px; }` → `padding: var(--sp-10) var(--sp-6)`. Z. 2341 → `.mentor-setup .ico, .coach-join-head .ico { display: flex; justify-content: center; } .mentor-setup .ico svg { width: 34px; height: 34px; color: var(--faint); }`. Z. 2891 `.coach-join { padding: 22px 24px; }` → `.coach-join { width: 100%; max-width: var(--w-single); margin-inline: auto; padding: var(--sp-6); }`. Z. 2893 `.coach-join-head .ico svg { width: 36px; height: 36px; color: var(--accent); }` → `width: 34px; height: 34px; color: var(--faint);`. Z. 2953 `.coach-co-what`: `max-width: 640px; margin: 0 auto;` streichen. Neu: `.modal .coach-invite > .small { flex-basis: 100%; }` | bereich_konto-1, zustaende-15, bereich_konto-53, bereich_konto-46 |
| D9 | Einstellungen Handy (560er-Block) | Neu: `.set-item { grid-template-columns: 1fr; } .set-block .form-grid { grid-template-columns: 1fr; } .be-grid { grid-template-columns: 1fr 1fr; } .be-grid > .field:first-child { grid-column: 1 / -1; } .set-block .input-unit .input { width: 100%; }` | bereich_einstellungen-13, -27, -25, responsiv-45 |
| D10 | Mobile-Kartenhöhe „Letzte Trades“ Z. 1780 | `height: calc(280px + 74px)` → `height: calc(280px + 80px)` (Kopf 21,75 + 16 + Polster 40 + Rand 2). Kommentar bleibt. | abstaende_layout-31 (Folge) |

### web/js/app.js

| Nr. | Stelle | vorher → nachher | Befunde |
|---|---|---|---|
| E1 | `pageHead` (Z. 256–262) | vor dem `return`: `if (!left && !right) return '';` | abstaende_layout-4, hierarchie-8 |
| E2 | Trade-Formular Z. 353–365 | Wrapper `<div class="tf-row3">` und die beiden `<div class="tf-row2">` samt schließenden `</div>` entfernen. Alle Felder werden direkte Kinder von `.tf-main`. Klassen: Richtung `class="field tf-dir"`; Eröffnet und Geschlossen `class="field tf-c3 tf-dt"`; Punktwert und Gebühren `class="field tf-c3"`. Symbol behält `field tf-sym`, Prop-Konten `field tf-wide`. | bereich_trades_tag-9 |
| E3 | `'new-trade'()` (Z. 324) | → `'new-trade'() { const r = this.state.route, d = this.state.params && this.state.params[0]; if (r === 'day' && d && d !== C.dayKey(new Date())) { const x = C.parseDayKey(d); x.setHours(9, 0, 0, 0); return this.openTradeEditor(null, { openedAt: x.toISOString() }); } this.openTradeEditor(null); }` (wie `new-trade-day` in day.js:24) | referenz-17 |
| E4 | Inline-Abstände (9 Stück) | nach 1.16 ersetzen: `margin-left:auto` → `ml-auto`, `gap:18px` → `s-4`, `margin-top:6px`/`8px` → `mt-2`. CSV-Import (Z. 564): die drei `<label class="field" style="flex-direction:row;align-items:center;gap:6px">` → `<label class="field inline">`, dazu in app.css nach `.field` (A7) `.field.inline { flex-direction: row; align-items: center; }` (gap 8 aus `.field`). | abstaende_layout-34 |

### web/js/ui.js

Keine Strukturänderung. Die Kachel-Ausrichtung ist reines CSS. U.tile (Z. 171) bleibt, weil Variante H aus hierarchie-10 nicht umgesetzt wird. Ein Inline-Stil (nach 1.16).

### web/js/screens/dashboard.js

| Nr. | Stelle | vorher → nachher | Befunde |
|---|---|---|---|
| F1 | `placeContext` → `place` (Z. 15) | erste Anweisung in `place = () => {`: `if (App.state.route !== 'dashboard') return;`. `unmount()` (Z. 138) bleibt. | bereich_prop-1, aufbau-2, bereich_statistik-34, abstaende_layout-4 |
| F2 | `wrap()` Z. 41 | `<span class="w-name">${esc(e.name || inst.typ)}</span>` → `<span class="vh">${esc(e.name || inst.typ)}</span><span class="grow"></span>` | bereich_dashboard-8 |
| F3 | Z. 54 (leere Vorlage) | `<div class="dashed" style="text-align:center;padding:30px">` → `<div class="dashed center" style="padding:32px">` (Skala) | abstaende_layout-34 |

### web/js/widgets.js

| Nr. | Stelle | vorher → nachher | Befunde |
|---|---|---|---|
| G1 | Gesamt-Score Z. 227 | `if (d.empty) return card(e, emptyBox());` → `card(e, emptyBox(280))` | zustaende-9 |
| G2 | Registry Z. 351, 361, 370 | in `prop_konten`, `ruhepunkt` und `mentor` nach `groesse: 'klein',` den Eintrag `flach: true,` ergänzen | bereich_dashboard-24 |
| G3 | Schatten-Ich-Widget Z. 337 | `{ trailing: more('#/shadow') }` → `{ trailing: more('#/shadow'), cls: 'fw-shadow' }` | bereich_dashboard-2 |
| G4 | 14 Inline-Abstände | nach 1.16 ersetzen | abstaende_layout-34 |

### web/js/screens/trades.js

| Nr. | Stelle | vorher → nachher | Befunde |
|---|---|---|---|
| H1 | Detail-Raster Z. 86 | `<div class="grid two">` → `<div class="grid detail-grid">` | bereich_trades_tag-3 |
| H2 | Kennzahlen Z. 67–68 | Z. 68: Eintrag `['Bewertung', …]` aus dem Array entfernen. `<div class="stat-grid">` → `<div class="stat-grid detail">`. An `.stat` `style="padding:12px 20px"` und an `.v` `style="font-size:16px"` streichen. Z. 67 nach den Chips, vor `<div class="big">`: `${t.rating ? `<span class="stars" aria-label="Bewertung ${t.rating} von 5">${'★'.repeat(t.rating)}<span class="faint">${'★'.repeat(5 - t.rating)}</span></span>` : ''}` | bereich_trades_tag-23, responsiv-44 |
| H3 | weitere Inline-Abstände (Z. 59 u. a., zusammen 20) | nach 1.16 ersetzen | abstaende_layout-34 |

### web/js/screens/shadow.js

| Nr. | Stelle | vorher → nachher | Befunde |
|---|---|---|---|
| I1 | Z. 112 | `<span class="n">${esc(range.label)}</span>` streichen | bereich_training-25, responsiv-36 |
| I2 | Z. 113 | `{ n: `${p.n} Trade${p.n === 1 ? '' : 's'}` }` → `{ foot: `${p.n} Trade${p.n === 1 ? '' : 's'} im Zeitraum` }` | bereich_training-25 |
| I3 | Z. 120 | in `U.card('Regelverstöße', …, { sub: esc(pd.label), info: … })` die Option `sub: esc(pd.label), ` streichen | bereich_training-25 |

### web/js/screens/stats.js

| Nr. | Stelle | vorher → nachher | Befunde |
|---|---|---|---|
| J1 | Z. 58 | beide `chart h220` (r-t, r-v) → `chart h240` | bereich_statistik-36 |
| J2 | Z. 52 (Emotion) | `<div class="chart h280" data-chart="hbars" data-id="m-emo"></div>` → `<div class="chart" style="height:${Math.max(240, emo.length * 34)}px" data-chart="hbars" data-id="m-emo"></div>` (der Zeichner liest clientHeight, ui.js:232) | bereich_statistik-36 |

### web/js/screens/day.js

| Nr. | Stelle | vorher → nachher | Befunde |
|---|---|---|---|
| E-day1 | Screen-Objekt nach `title` | `head: { range: false },` und `actions(ctx) { const key = ctx.params[0] \|\| C.dayKey(new Date()); return `<button type="button" class="btn" data-action="cert-open" data-kind="day" data-ref="${key}" data-tip="Daily Profit Certificate">${I.shield}<span class="hide-m">Zertifikat</span></button>`; },` | referenz-17 |
| E-day2 | `render()` Z. 12 und Z. 20 | Die Datumsnavigation wird Teil der Kopfreihe: `ctx.headLeft = `<div class="row s-2"><a class="btn round" href="#/day/${C.dayKey(prev)}" aria-label="Voriger Tag">${I.chevL}</a><a class="btn round" href="#/day/${C.dayKey(next)}" aria-label="Nächster Tag">${I.chevR}</a><h2 class="day-title">${fmt.weekdayLong(date)}</h2>${isToday ? U.pill('Heute', 'win') : `<a class="btn sm ghost" href="#/day/${C.dayKey(new Date())}">Heute</a>`}</div>`;` (das Konto steht davor, pageHead setzt `headLeft` nach dem Konto). Die Pillenfarbe entscheidet die Farb-Gruppe, Layout und Position stehen hier. Die Knöpfe „Zertifikat“, „Check-in“ und „Trade für diesen Tag“ aus Z. 12 entfallen. Z. 20 `return `${nav}${stats}…`` → `return `${stats}…``. CSS neu (app.css, Tagesansicht): `.day-title { font-size: 18px; margin-left: var(--sp-1); }`. Ergebnis: eine Kopfreihe, links Konto · ‹ › Datum (Heute), rechts Zertifikat · Session · „Trade loggen“. | referenz-17 |
| E-day3 | `new-trade-day` (Z. 24) | bleibt, wird aber nicht mehr verwendet. Entfernen, sobald `grep -rn "new-trade-day" web/js` außer Z. 24 nichts mehr findet. | referenz-17 |
| E-day4 | Inline-Abstände (10) | nach 1.16 ersetzen | abstaende_layout-34 |

### web/js/screens/notebook.js

| Nr. | Stelle | vorher → nachher | Befunde |
|---|---|---|---|
| K1 | Z. 6 | `leftOpen: true` → `leftOpen: !(window.matchMedia && matchMedia('(min-width: 961px) and (max-width: 1180px)').matches)` | responsiv-13 |
| K2 | Z. 72–74 (normale Notiz) | Die erste Zeile `<div class="row" style="justify-content:space-between;flex-wrap:nowrap">…</div>` aus `.note-head` herausnehmen. Sie wird direkt nach `<div class="col right">` zu `<div class="col-head note-bar">…</div>`, Inhalt unverändert, Inline-Stil weg. Das innere `<div class="row" style="gap:6px;flex-wrap:nowrap">` → `<div class="row s-2">`. `.note-head` enthält danach Titel, Meta und Tags. | bereich_notebook_news-23, abstaende_layout-28 |
| K3 | Z. 67 (Notiz im Papierkorb) | → `<div class="col right"><div class="col-head note-bar"><button type="button" class="btn ghost icon sm back" data-action="nb-view" data-value="list" aria-label="Zurück">${I.back}</button><span class="grow"></span><button type="button" class="btn sm" data-action="nb-trash-restore" data-id="${cur.id}">Wiederherstellen</button><button type="button" class="btn sm danger" data-action="nb-trash-purge" data-id="${cur.id}">Endgültig löschen</button></div><div class="note-head"><h2 class="note-title">${esc(cur.title \|\| 'Ohne Titel')}</h2><div class="meta"><div>Gelöscht am ${fmt.dateTime(cur.deletedAt)}</div><div>Wird am ${fmt.dateFull(new Date(new Date(cur.deletedAt).getTime() + 30 * 86400000))} endgültig entfernt</div></div></div><div class="note-body nb-share-view">…unverändert…</div></div>` | bereich_notebook_news-25 |
| K4 | Z. 60 (Liste) | `'Gelöscht ' + fmt.dateTime(n.deletedAt)` → `'Gelöscht am ' + fmt.dateTime(n.deletedAt)` | bereich_notebook_news-25 |
| K5 | 14 Inline-Abstände | nach 1.16 ersetzen (z. B. `col-body` `style="padding-top:6px"` → Klasse mit `padding-top: var(--sp-2)`) | abstaende_layout-34 |

### web/js/screens/misc.js (Einstellungen)

| Nr. | Stelle | vorher → nachher | Befunde |
|---|---|---|---|
| L1 | Profil Z. 48 | `<div class="form-grid" style="max-width:720px">` → `<div class="form-grid">` (2 Spalten über B26) | bereich_einstellungen-27 |
| L2 | Beschreibungen Z. 60, 62, 109, 144, 145, 146, 194 | jedes `<div class="small muted" style="margin-bottom:…">` direkt unter einem Blocktitel → `<div class="set-desc">`. In Z. 109 (Meine Designs) die dynamische `margin-bottom:${list.length ? 14 : 0}px` streichen, den leeren Fall regelt `:last-child`. | bereich_einstellungen-31, abstaende_layout-34 |
| L3 | Daten und Sicherung Z. 63–68 | Z. 63 `<div class="stack" style="gap:12px">` → `<div>`. Z. 64, 65, 66, 68: `<div class="row between" style="gap:12px">` → `<div class="set-item">`. Z. 67 `<div class="divider"></div>` streichen. Z. 66: Knopf „Entfernen“ `btn sm danger` → `btn sm`. Z. 68: `<b class="neg">Alles löschen</b>` → `<b>Alles löschen</b>` (der Knopf bleibt `btn sm danger`). Text in Z. 66 bleibt. | bereich_einstellungen-13, abstaende_layout-23 |
| L4 | Benachrichtigungen Z. 168–177 | je Block: `<div class="set-block"><h3>Performance-Recaps</h3><div class="set-desc">…</div><div class="stack s-4">${switchRow…}…</div></div>`. Das `<h3 style="margin-bottom:4px">`, der Wrapper `<div>` und `set-block stack style="gap:18px"` entfallen. Für „Hinweis-Punkte in der Seitenleiste“ ebenso. | bereich_einstellungen-31 |
| L5 | Mentor Z. 155–157 | `<form … class="set-block stack" style="gap:14px">` → `class="set-block stack s-4"`. Die beiden `.field` bekommen `class="field set-field"`. Die Inline-`margin-top` der Hinweise darunter → `mt-2`. | bereich_einstellungen-27 |
| L6 | Trading Z. 192–201 | Z. 192 `class="stack" style="gap:22px"` → `class="stack s-6"`. Z. 193 `class="chips" style="gap:8px"` → `class="chips s-2"`. Z. 194: `<h3>Break-even-Bereich</h3>` → `<div class="set-head-row"><h3>Break-even-Bereich</h3><button type="button" class="btn sm ghost" data-action="be-reset">Auf Standard zurücksetzen</button></div>`, Beschreibung als `set-desc`. Z. 195 `<div class="row" style="gap:16px;align-items:flex-end">` → `<div class="be-grid">`. Z. 196 (alter Zurücksetzen-Knopf mit Inline-Farbe) löschen. Z. 198 `<div class="field" style="max-width:300px;margin-top:12px">` → `<div class="field set-field mt-3">`. Z. 199 `<div class="form-grid" style="max-width:560px">` → `<div class="form-grid">`. Z. 200 `style="margin-top:12px;align-items:flex-start"` → Klasse `mt-3`, `align-items:flex-start` in eine Regel `.set-block .check.top { align-items: flex-start; }` (app.css) und Klasse `top`. | bereich_einstellungen-25, -27, responsiv-45 |
| L7 | Regeln Z. 207 | `<form data-action="add-rule" class="row" style="margin-top:14px"><input class="input grow" …>…<button … class="btn sm primary">` → `<form data-action="add-rule" class="set-addrow"><input class="input" …><button type="submit" class="btn">Hinzufügen</button></form>` (neutral, Feldhöhe). `stack style="gap:4px"` → `stack s-1`. | bereich_einstellungen-26 |
| L8 | Notebook Z. 214–223 | Z. 214 `class="nb-settings"` → `class="set-block nb-settings"`. Z. 215 `class="stack" style="gap:14px"` → `class="stack s-4"`. Z. 221 am Knopf „Auf Standard zurücksetzen“ `style="color:var(--muted)"` streichen. Z. 223 `<div><div class="lbl" style="font-size:13px;font-weight:600;color:var(--text-2);margin-bottom:8px">Vorschau</div><div class="nb-preview" …>` → `<div class="field"><span class="lbl">Vorschau</span><div class="nb-preview" …>` | bereich_einstellungen-12 |
| L9 | Sprache Z. 33 | `<p class="small muted" style="margin-top:14px;max-width:640px">` → `<p class="small muted mt-4">` | abstaende_layout-34 |
| L10 | übrige Inline-Abstände in misc.js (zusammen 50) | nach 1.16 ersetzen | abstaende_layout-34 |

### web/js/screens/prop.js

| Nr. | Stelle | vorher → nachher | Befunde |
|---|---|---|---|
| M1 | Z. 125 | `return `${summaryTiles(list)}${head}${body}${none}${endedHtml}`;` → `return `${summaryTiles(list)}<section class="prop-sec">${head}${body}${none}</section>${endedHtml}`;` | abstaende_layout-36 |
| M2 | Z. 194, 201 | Z. 194: `<span class="hint">…</span>` aus dem Währungsfeld nehmen und direkt hinter dem Feld als eigenes Rasterelement setzen: `<span class="hint span2" id="pa-cur-hint">Balance, Limits und Puffer in Kontowährung. Trade-P&L bleibt in der Journal-Währung.</span>`. Das Select bekommt `aria-describedby="pa-cur-hint"`. Z. 201: Notiz `class="field span2"` → `class="field span4"`. | bereich_prop-37 |
| M3 | Z. 240, 241 | Label „Gelb, wenn weniger als … % des Limits übrig“ → „Gelb unter (% übrig)“, „Rot, wenn weniger als … % übrig“ → „Rot unter (% übrig)“ | bereich_prop-33 |
| M4 | Z. 262, 266 | letztes Feld `<div class="field"><span class="lbl">&nbsp;</span><button type="submit" …>…</button></div>` → `<div class="prop-entry-foot"><button type="submit" class="btn primary">${I.plus} Ausgabe erfassen</button></div>` (Payout: „Payout erfassen“). Notiz in Z. 262 `class="field"` → `class="field span2"`. | bereich_prop-54 |
| M5 | Z. 264, 268 | `<div class="tbl-wrap">` → `<div class="tbl-wrap inset">` | abstaende_layout-13 |
| M6 | Z. 283 | Die kv-Zeile „Consistency Rule“ bekommt den Wert `${cons.ok ? '<span class="pos">ok</span>' : '<span class="neg">verletzt</span>'} <span class="muted">· bester Tag ${cons.bestDayPct == null ? '—' : fmt.pct(cons.bestDayPct)} von max. ${fmt.num(cons.maxDayPct)} %</span>` (Teil „heute noch … erlaubt“ und das title-Attribut entfallen). Direkt danach, nur bei `cons && isFinite(cons.allowedToday)`: `U.kv('Heute noch erlaubt', fmt.cur(cons.allowedToday))`. Die Karte `conds` bekommt `{ cls: 'prop-conds' }`. | bereich_prop-29 |

### web/js/screens/coach.js

| Nr. | Stelle | vorher → nachher | Befunde |
|---|---|---|---|
| N1 | Z. 22 | `<div class="coach-wrap">` → `<div class="coach-wrap narrow">`. Im Knopf `${I.settings} Zu den Einstellungen` → `Zu den Einstellungen` | zustaende-15, bereich_konto-24 |
| N2 | Z. 117 | `coach-wrap wide` → `coach-wrap` | bereich_konto-24 |
| N3 | Z. 156 | `<div class="coach-wrap">` → `<div class="coach-wrap read">` | bereich_konto-24 |
| N4 | Z. 167, 168, 169, 171, 184, 186, 187 | `<div class="coach-wrap">` → `<div class="coach-wrap narrow">` | bereich_konto-24, bereich_konto-53 |
| N5 | Z. 196 | `style="margin-top:14px;max-width:420px"` → Klasse `mt-4` (ohne max-width) | bereich_konto-53 |
| N6 | Z. 265 | `{ cls: 'wide' }` → `{ cls: 'narrow' }` | bereich_konto-46 |

### web/js/screens/affiliate.js

| Nr. | Stelle | vorher → nachher | Befunde |
|---|---|---|---|
| O1 | Z. 92 | `<p class="muted small no-i18n">…</p><div class="field">…</div>` in `<div class="stack">…</div>` fassen (12 px zwischen Untertitel und Feld). Die Zahlenpfeile entfernt die globale Regel aus komponenten-16. Falls sie noch nicht da ist (`grep -n "inner-spin-button" web/css/app.css` findet keine globale `input[type=number]`-Regel), diese Regel aus komponenten-16 jetzt anlegen. | bereich_konto-47 |

### web/js/screens/mentor.js

Keine Strukturänderung (Breiten in C12, Symbol in D8). Ein Inline-Abstand nach 1.16.

### web/index.html, web/css/landing.css

| Nr. | Stelle | vorher → nachher | Befunde |
|---|---|---|---|
| P1 | index.html Z. 34 | `<div class="shot">` → `<div class="lp-shot">` | ki_look-3 |
| P2 | index.html Z. 67 | `'.shot, section.feat, section.steps'` → `'.lp-shot, section.feat, section.steps'` | ki_look-3 |
| P3 | landing.css Z. 19–23, 59–60 | jedes `.lp .shot` → `.lp .lp-shot`. app.css:752–756 (`.shot` für Trade-Screenshots) bleibt. | ki_look-3 |

### web/js/lang/*.js (en, es, zh, hi, pt)

| Nr. | Neue bzw. geänderte Schlüssel | Befunde |
|---|---|---|
| Q1 | „{0} Trades im Zeitraum“, „{0} Trade im Zeitraum“ | bereich_training-25 |
| Q2 | „Bewertung {0} von 5“ | bereich_trades_tag-23 |
| Q3 | „Gelöscht am {0}“, „Wird am {0} endgültig entfernt“. Alte Schlüssel „Gelöscht: {0}“ und „Wird endgültig entfernt am {0}“ entfernen. | bereich_notebook_news-25 |
| Q4 | „Gelb unter (% übrig)“, „Rot unter (% übrig)“. Die alten zwei Schlüssel entfernen. | bereich_prop-33 |
| Q5 | „Heute noch erlaubt“, „bester Tag {0} von max. {1} %“ (falls der Wert als Muster übersetzt wird) | bereich_prop-29 |

### Tests

| Nr. | Datei | Änderung | Befunde |
|---|---|---|---|
| R1 | `web/e2e/mobiletest.js:31` | `g === 18` → `g === 16`, Text „18px Abstand“ → „16px Abstand“ | abstaende_layout-32 |
| R2 | `web/e2e/mobiletest.js:72` | `dd.cardH === 354` → `dd.cardH === 360`, Text „(354px)“ → „(360px)“ | abstaende_layout-31 (Folge) |
| R3 | `web/e2e/shadowtest.js:68, 69, 71, 74` | Zeitraum nicht mehr aus `.shadow-main .head .n`, sondern aus `[data-pop=range] span`. Trade-Zahl aus `.tile:nth-child(2) .foot` (parseInt) statt `.tile:nth-child(2) .head .n` | bereich_training-25 |
| R4 | `web/e2e/headtest.js` | neuer Fall: 1440 → #/dashboard → #/stats → Viewport 800 → 1440: `#content > .page-head .dh-context [data-pop=range]` vorhanden, `#tb-tools` leer | bereich_statistik-34 |
| R5 | neu `web/tests/inline-style.test.mjs` (node --test) | zählt `style="[^"]*(margin\|gap\|padding)` in `web/js/screens/*.js`, `web/js/app.js`, `web/js/widgets.js`, `web/js/ui.js`. Schlägt fehl, wenn die Zahl über dem Stand nach der Umstellung liegt (höchstens 35, genauen Wert eintragen). | abstaende_layout-34 |

### web/README.md

| Nr. | Stelle | Änderung | Befunde |
|---|---|---|---|
| S1 | neuer Abschnitt „Abstände“ nach „Bewegung und Übergänge“ | Skala (1.1), Zuordnung (Tabelle 1.2), Container (Tabelle 1.3), Breiten (1.11), Ausnahmen (1.12), Regel „keine Inline-Abstände in JS-Vorlagen außer berechneten Werten; Hilfsklassen `.s-n`, `.mt-n`, `.mb-n`“, Wertlinie der Kacheln (1.6) | abstaende_layout-1, -34 |
| S2 | Z. 67 | „unten ein 3-Spalten-Raster“ → „unten ein 3-Spalten-Raster (721–1240 px zwei Spalten, darunter eine)“ | responsiv-10, responsiv-42 |
| S3 | Z. 73 | nach „Handy: Kacheln in zwei Spalten“ ergänzen: „(eine ungerade letzte Kachel über die volle Breite; Tablet 3 + 2 ohne Karussell)“ | responsiv-31, responsiv-42 |
| S4 | Z. 93 | „TradeLog-Blöcke mit festem 18-px-Abstand“ → „TradeLog-Blöcke mit festem 16-px-Abstand (wie das Dashboard-Raster)“ | abstaende_layout-32 |
| S5 | Z. 51 | „Auf niedrigen Bildschirmen etwas dichter.“ → „Auf niedrigen Bildschirmen etwas dichter; die Konto-Karte bleibt unten immer sichtbar. Die Linie unter dem Schriftzug liegt auf der Linie der Titelzeile.“ | bereich_shell-2, abstaende_layout-7 |
| S6 | Z. 120 | nach „drei Spalten (Ordner und Tags, Notizliste, Notiz)“ ergänzen: „(961–1180 px: Ordner zunächst eingeklappt)“ | responsiv-13 |
| S7 | Z. 108 | Tagesansicht: „Datum mit ‹ › in der Kopfreihe; „Trade loggen“ übernimmt das Datum des angezeigten Tages“ | referenz-17 |

---

## 4. Akzeptanzkriterien

Alle Messungen mit Playwright, Beispieldaten, dunkles Design. Für die Aufnahmen gilt: `Store.installSample()`, Fenster wie angegeben, Schriften lokal.

**Skala und Container**
1. `grep -c -- "--sp-" web/css/app.css` ≥ 60. `grep -nE "padding: 12px 15px|gap: 7px; min-width: 0; transition|padding: 22px 24px; display: flex" web/css/app.css` liefert nichts.
2. Berechnete Werte bei 1440 (getComputedStyle):
   - Innenabstände: `.card` padding 20px; `.tile` 16px 20px; `.stat-tile` 16px 20px; `.set-block` 20px; `.kstrip .tile` 16px 20px; `.banner` 12px 16px; `.modal` 24px.
   - Lücken: `.content` gap 24px (Dashboard 16px); `.grid`, `.dash-top`, `.dash-main`, `.stat-tiles`, `.nb`, `.tl-fit`, `.form-grid`, `.tf-main` 16px; `.set-body` 24px; `.settings` 32px; `.row` 8px; `.stack` 12px; `.field` 8px.
3. Census-Lauf (`audit/census.json`-Skript): gerenderte gap-Werte zwischen Karten nur 12, 16, 24 (Dashboard und TradeLog 16). Kein gerenderter Container-Innenabstand außerhalb der Tabelle 1.3.
4. Textkanten bei 1440: Titel der ersten Dashboard-Kachel x == Titel der ersten Dashboard-Karte x (277). Statistik: Kachel-Label x == Kartentitel x. Dashboard, Affiliate, Prop-Bilanz: erste Tabellenspalte x == Kartentitel x (± 1).

**Wertlinie**
5. In jeder Kachelreihe gilt max − min der `.val`-Oberkanten ≤ 1 px:
   - bei 1440 und 1024: Dashboard, TradeLog, Schatten-Ich, Statistik (Fehler, Edge-Check, Monte Carlo), Prop-Übersicht, Prop-Bilanz, Friedhof, Affiliate (beide Ansichten);
   - bei 390: Dashboard, TradeLog, Schatten-Ich, Prop.
   Statistik-Übersicht: `.stat-tile .v`-Unterkanten je Reihe gleich (1440, 1024, 390).
6. `dashtest.js:19` grün (|Wertmitte − Diagrammmitte| < 1,5 und Abstand zum rechten Rand ≥ 26). Bei 390 gilt |dC| ≤ 2. Kein Diagramm ragt über den Kachelrand: Kachel unten − Diagramm unten ≥ 6 px, Diagramm oben − Kopf unten ≥ 4 px.

**Kartenkopf, Dialoge, Formulare**
7. |Titelmitte − Knopfmitte| ≤ 1 px bei: „Tages-Checkliste“/„Tag ansehen“ (progress), „Ausgaben“/„Ausgabe erfassen“ (prop/bilanz), „Plan vs. Ausführung“/„Bearbeiten“ (Trade-Ansicht), „Als Mentor“/„+ Gruppe“ (Coach). Titel-Oberkante minus Karten-Oberkante ist in allen Dashboard-Karten gleich (21 px).
8. Dialoge Trade loggen, Plan & Bewertung, Check-in, Session starten/beenden, Konto (Einstellungen), Prop-Konto, Preset, Trades zuordnen, Ordner, Vorlage, Provision, Aufgabe an alle, Prompt: Kopf → erstes Element 16 px, letztes Element → Fußlinie 16 px, Fußlinie → Knöpfe 16 px (± 1). Keine Stelle mit doppeltem Abstand (> 24 px) durch alte Inline-Ränder.
9. Trade-Dialog 1440: rechte Kante Symbol == rechte Kante Ausstieg, linke Kante Richtung == linke Kante Kontrakte, Eröffnet/Punktwert und Geschlossen/Gebühren bündig (± 1). `tradeformtest.js` grün (Handy passt in 390×844).
10. Prop-Konto-Dialog 1440: erste Feldreihe ≤ 70 px hoch, Hinweis als eigene Zeile, Gruppe und Notiz in einer Reihe. Ausgabe-Formular: kein `&nbsp;`-Label (`grep -c "lbl\">&nbsp;" web/js/screens/prop.js` = 0).

**Seiten**
11. Seitenleiste: `.sb-sep` top == 71 bei 1440×900, voll und eingeklappt; Linie von x = 0 bis zur Leistenkante. `.sb-user` bottom == innerHeight − 18 bei 1366×768 und 1280×720. `sidebartest.js` und `usercardtest.js` grün.
12. Coach (#/coach ohne Server): `#content > .page-head` existiert nicht, die erste Karte beginnt bei y = 96. Einrichten-Symbol mittig (|Symbolmitte − Kartenmitte| ≤ 1). Mentor- und Coach-Einrichtekarte gleich breit (800).
13. Mentor: Konto-Auswahl links == linke Chatkante (± 1), Chatkarte 800 breit, auch nach einer langen Antwort. News: rechte Kante „Trade loggen“ == rechte Listenkante.
14. Notebook 1440: Kopfreihe in „Alle“, „Trade Notes“ und „Papierkorb“ gleich hoch. Spaltenköpfe links, Mitte und Notiz mit gleicher Oberkante und Höhe (57 ± 1), Trennlinie auf derselben y. Kalender-Symbol x == Titel x (± 1). Leistenlinie → erster Block 16 ± 1 (1440, 390). Papierkorb-Notiz: beide Knöpfe in einer Zeile, Titel 34 px. Bei 1024: Notizspalte ≥ 460 px, Titel einzeilig.
15. Einstellungen Design 1440: rechte Kante jedes Auswahlrasters == Innenkante seines Blocks (± 1). Theme/Schrift 4 Spalten, Farbpaare 3 + 3. Bei 1024 und 390 je 2 Spalten. `settest2.js` grün (Euro in einer Zeile). Profil: Formular zweispaltig, alle Knöpfe in „Daten und Sicherung“ rechts neben dem Text (1440, 1024). Regeln: „Hinzufügen“ rechts neben dem Feld. Break-even: Labels „Einheit“, „Von“, „Bis“ auf derselben y. Am Handy kein Überlauf (`settest.js:65`).
16. Dashboard:
    - 1024: zwei Widget-Spalten, Kacheln 3 + 2 ohne Lücke, kein abgeschnittener Inhalt in „Letzte Trades“.
    - 768×1024: kein seitliches Scrollen der Kacheln, Widget-Raster zweispaltig.
    - 390: fünfte Kachel volle Breite.
    - Bereichskarten (Prop, Ruhepunkt, Mentor) in einer Reihe allein: Reihe < 300 px hoch.
    - Leeres Dashboard: Leerzustände der drei Karten einer Reihe auf gleicher Höhe.
    - Schatten-Ich-Widget klein: keine Ellipse in Beträgen.
17. Trade-Ansicht 1440: zwei Detailspalten, „Abweichung“ vollständig sichtbar. Kennzahlen 4 + 4, Bewertung als Sterne im Kopf. Bei 390: Kennzahlen zweispaltig.
18. Statistik 1440: Reiter → erste Kachel 12 ± 1, Diagrammkarte → Reiter 24 ± 1. Marktphase, Tage und Setups: zweispaltige Diagrammkarten gleich hoch (240-px-Diagramme).
19. Startseite (index.html) 1440 und 390: kein leerer grauer Kasten unter dem Demo-Fenster, Demo nicht abgeschnitten, Einblenden beim Scrollen wirkt (`.lp-shot` erhält `.rv`).
20. Tilt-Profil 1440 und 390: die drei Werte auf derselben Höhe, Labels ohne Versalien. Am Handy Zeilen „Label | Wert“.
21. Ruhepunkt „Dein Plan für heute“: jede Zeilenlinie durchgehend.
22. Grabstein-Rückseite: Text ≥ 10 px von der Tafelkante. `friedhoftest.js:80` grün.

**Code und Tests**
23. `grep -cE 'style="[^"]*(margin|gap|padding)' web/js/screens/*.js web/js/app.js web/js/widgets.js web/js/ui.js | awk -F: '{s+=$2} END {print s}'` ≤ 35. `node --test web/tests/inline-style.test.mjs` grün.
24. `bash web/e2e/runall.sh` vollständig grün, inklusive `leaktest`, `dashtest`, `mobiletest`, `tradeformtest`, `sidebartest`, `usercardtest`, `settest`, `settest2`, `proptest`, `friedhoftest`, `shadowtest`, `coachtest`, `calmnavtest`, `sixtest`, `tlfittest`.
25. Atlas neu aufnehmen (`audit/atlas.js`, dark/light × 1440/1024/390) und gegen die Befund-Screenshots vergleichen. Helles Design gleichwertig, keine Überläufe (`mobiletest` prüft alle Routen auf seitlichen Überlauf).

---

## 5. Zurückgestellt

Kein Befund der Gruppe wird ganz zurückgestellt. Diese Teile von Befunden setze ich bewusst nicht um:

| Befund | Teil | Grund |
|---|---|---|
| bereich_dashboard-8 | Raster springt beim Ein- und Ausschalten des Bearbeitungsmodus um 48 px | Die vorgeschlagene Overlay-Leiste würde in 215-px-Kacheln Wert und Titel verdecken und `.w` umpositionieren. Der Sprung gehört zum Moduswechsel und ist hinnehmbar. Doppelter Name und drei Rahmen sind behoben. |
| komponenten-22 | Text von Geisterknöpfen im Kartenkopf bündig am rechten Inhaltsrand (negativer rechter Rand) | Der Ausgleichswert hängt am Polster von `.btn.sm`, das die Komponenten-Spezifikation neu festlegt. Danach als eine Regel `.card-head > .row > .btn.ghost:last-child:not(.icon) { margin-right: calc(-1 * <Polster>) }` nachziehen. Die Ausrichtung zum Titel ist umgesetzt. |
| hierarchie-38 | Vereinheitlichung aller Lesebreiten auf 960 px zentriert (Prüferfassung) | Chatzeilen würden zu lang (≈ 105 Zeichen), News stünde zentriert unter einem linken Seitentitel. Umgesetzt ist der Ursprungsvorschlag: Kopfreihe an die Inhaltskante gebunden. |
| bereich_trades_tag-3 | Text „geplant …, erreicht …“ → Pfeil | Die zwei Detailspalten lösen den Platzmangel. Die Wortwahl liegt bei der Wortwahl-Gruppe. |
| bereich_prop-12 | Fußtext „Verlorene Gebühren“ kürzen | Mit der Wertlinie (1.6) nicht nötig. `friedhoftest.js:49` hängt am Text. README Z. 245 („Leiste ohne Fußtexte“) gehört zur Aufbau-Gruppe. |
| bereich_einstellungen-13 | Beispieldaten-Text kürzen | `.set-item` hält den Knopf rechts. Der Vorschlagstext würde `sampletest.js:118` brechen. Die Wortwahl-Gruppe kann kürzen, solange „Prop-Konten“, „Replay-Screenshots“, „Sprachnotizen“ und „Vorschlagsregeln“ enthalten bleiben. |
| bereich_einstellungen-31 | neue Beschreibung unter „Erscheinungsbild“ | Die Vorschaukarten erklären sich selbst. Auch „Ruhepunkt“, „Daten und Sicherung“ und „Risiko und Warnungen“ haben keine Beschreibung. |
| abstaende_layout-1 | Innenabstände von Steuerelementen (Knopf, Chip, Menüeintrag, Popover 4) | Die Komponenten-Spezifikation setzt sie um, mit Werten aus derselben Skala. Hier ist die Skala verbindlich gemacht. |

---

## 6. Nutzer fragen

| Befund | Frage | Empfehlung |
|---|---|---|
| bereich_notebook_news-13 (mit abstaende_layout-29, referenz-38, hierarchie-49) | Die Werkzeugleiste im Notiz-Editor bricht bei 1440 px um: In Zeile 2 steht nur das Bild-Symbol (Leiste 88 statt 51 px hoch). Laut README hat die Leiste einen eigenen Teil „Bild (Datei oder Adresse)“. Dürfen „Bild hochladen“ und „Bild über Adresse“ ins „+“-Menü (Gruppe Grundbausteine) wandern? Strg+V, Ziehen und „/“ bleiben, der Hochladen-Eintrag öffnet weiter direkt die Dateiauswahl. | Ja. Gemessen passt die Leiste dann bei 1440 px in eine Zeile für alle Absatzformate, wenn zusätzlich der Umwandeln-Knopf fest 116 px breit ist (Beschriftung 13 px mit Ellipse) und Trenner und Lücken auf 2 px sinken. Bei 1366/1280 px bricht sie weiter in zwei volle Reihen um, ein verstecktes seitliches Scrollen am PC gibt es nicht. Umsetzung bei Zustimmung: editor.js:122–123 (Bild-Popwrap und Trenner davor entfernen, zwei Einträge im „+“-Menü nach „Tabelle“, `.ed-hint` darunter); app.css:1079 gap 3 → 2px, 1080 `.sep` margin `0 4px` → `0 2px`, 1084 `.tb.turn { width: 116px; min-width: 0; … }`, 1085 `.tb.turn .lbl { font-size: 13px; min-width: 0; overflow: hidden; text-overflow: ellipsis; }`; Tests `imgtest.js:11,17` und `figtest.js:6` auf `[data-pop$="insert"]` bzw. `.ed-pop[id$="insert"]` umstellen; README Z. 123–125 anpassen. |
