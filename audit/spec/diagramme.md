# Zielspezifikation: Diagramme und Kennzahlen

Geltungsbereich: alle SVG-Diagramme (`web/js/ui.js` drawers, `web/js/widgets.js` U.drawers, `affiliate.js` affbars), ihre Legenden, Achsen, Flächen, Balken und Einzüge, die Widget-Vorschaubilder (`web/js/widgetpreviews.js`) sowie die Kennzahl-Anzeigen, die in den 45 Befunden dieser Gruppe stehen (Regeltreue-Ring, Aktivitäts-Heatmap, Regel-Tracker, Prop-Puffer, Schatten-Ich-Ranking, Notiz-Statistik, Gewinner/Verlierer-Zähler). Zeilenangaben beziehen sich auf den Stand von Commit 677b630 (vom 11.10. bis heute an diesen Dateien unverändert, geprüft).

## 1. Zielzustand

### 1.1 Achsen und Skalen

**A-1 Werteachse links, volle Beträge.** Jede senkrechte Werteachse steht links und wird über `axisLeft(ticks, y, ml, W, mr, fmtFn)` gezeichnet. Beschriftung:
- Geld: `fmt.axisCur` (voller Betrag ohne Nachkommastellen, z. B. „2.000 €“, „−1.500 €“; im Geld-blind-Modus R).
- R: `fmt.r`. Prozent: `fmt.pct(v, 0)`.
- Kurzformen wie „2k“, „35k“ oder „−250“ ohne Einheit gibt es auf keiner Diagrammachse. `curShort` in `ui.js` entfällt. Die gleichnamige Funktion in `widgets.js:41` bleibt, sie dient dem Kalender.
- Ränder: `ml = axisWidth(Beschriftungen)`, `mr = 12`. Ausnahme hbars mit `mr = 44` für die Anzahl-Spalte (A-6).

Vorher → nachher: „P&L nach Wochentag“ rechts „2k · 1k · 0“ → links „2.000 € · 1.000 € · 0 €“. Monte Carlo rechts „35k · 30k“ → links „35.000 € · 30.000 €“. hbars unten „−250 · 0 · 750“ → „−250 € · 0 € · 750 €“.

**A-2 Runder Wertebereich.** `niceTicks` erweitert den Bereich auf volle Schritte: der erste Strich liegt bei `floor(min/s)·s`, der letzte bei `ceil(max/s)·s`. Damit ragt kein Balken und keine Linie über den obersten oder untersten Strich hinaus. Beispiel „Netto-P&L pro Tag“: Daten bis 2.069 € → Achse bis 2.500 € statt bis 2.000 €.

**A-3 Beschriftungen überlappen nie.**
- Senkrechte Achse: Ist eine Beschriftung weniger als 14 px von der zuletzt gezeichneten entfernt, entfällt sie. Die Gitterlinie bleibt.
- Waagerechte Wert- und Zeitachsen (hbars unten, Punktdiagramme): Breite je Beschriftung = Zeichen × 6,2 + 4 px. Eine Beschriftung entfällt, wenn ihr linker Rand näher als 10 px am rechten Rand der vorigen liegt. Randbeschriftungen werden nach innen geschoben.
- Kategorie-Achsen (vbars): Es wird nur jede `step`-te Kategorie beschriftet, `step = ceil((längster Name × 6,6 + 8) / Fachbreite)`.
- „Disziplin pro Woche“: Es wird nur jede `every`-te Woche beschriftet, `every = ceil(44 / Fachbreite)`, gezählt von der jüngsten Woche aus. Die jüngste Woche ist also immer beschriftet.
- Nichts wird gedreht. `rotate(` kommt in keiner Diagrammbeschriftung vor.

**A-4 Runde Zeitwerte.**
- „Performance nach Uhrzeit“: Striche auf vollen Viertel-, halben oder ganzen Stunden. Schritt = kleinster aus [15, 30, 60, 120, 180, 240, 360] min, der höchstens 6 Striche ergibt. Format „09:00“. Weil die Spanne mindestens 30 min beträgt, gibt es immer mindestens 2 Striche.
- „Performance nach Haltedauer“: Striche aus `HOLD_TICKS` („1 min“, „5 min“, „15 min“, „30 min“, „1 h“, „2 h“, „4 h“, „8 h“, „1 T“, „3 T“, „1 W“). Fallen weniger als 2 davon in den Bereich, gibt es 3 Striche (Anfang, Mitte, Ende), beschriftet mit `fmt.dur` (unter 1 min: „{n} s“). Der Tooltip behält `durLabel` mit Sekunden.

**A-5 Geordnete Kategorien lückenlos.**
- Wochentag: Mo–Fr immer, Sa/So nur bis zum letzten belegten Tag.
- Uhrzeit und Haltedauer: alle Fächer zwischen dem ersten und dem letzten belegten.
- Uhrzeit-Fächer sind alle 1 h breit: „18–20“ wird zu „18–19“ und „19–20“.
- Ein leeres Fach hat keinen Balken. Seine Beschriftung steht in `--faint`, darüber liegt ein transparentes Trefferfeld mit Tooltip „<b>{Name}</b>: Keine Trades“.
- Tabellen (`groupTable`) zeigen leere Fächer nicht.

### 1.2 Text im Diagramm

**A-6 Textstufen (eine Definition je Rolle):**

| Rolle | Größe/Gewicht | Farbe | Schrift | Ort |
|---|---|---|---|---|
| Achsenwerte, Zeitachse, Anzahl „n×“ | 11 px / 400 | `--muted` | Onest (Sammelregel app.css:1800), `tabular-nums` | `.chart text` |
| Kategorienamen (hbars) | 12 px / 400 | `--text-2`; „Ohne …“ in `--muted`; leeres Fach in `--faint` | Onest | inline wie bisher |
| Werte an Säulen | 11 px / 400 | `--text-2` | Onest | `.chart text.bv` |
| Beschriftung von Bezugslinien im Feld („Startkapital 25.000 €“, „Ruin-Schwelle 17.500 €“, „Median 29.259 €“, „Gesamt +0,35 R“, „Ruin ab 30 %“) | 11 px / 400 | Farbe der Linie (`--muted`, `--loss`, `--text-2`) | Onest | `.chart text.lbl` mit Hof in Kartenfarbe (`paint-order: stroke; stroke: var(--surface); stroke-width: 3px`) |
| Legende | 12 px / 400 | `--text-2` | Satoshi | `.chart-legend` (A-12) |

Zwei `.chart text`-Regeln gibt es nicht mehr. Die spätere Regel in app.css:1648 (11,5 px, `--text-2`) entfällt.

- hbars-Namen werden passend zur Spaltenbreite gekürzt, mit „…“ am Ende: `maxCh = max(6, floor((ml − 14) / 6,8))`. Bei gekürztem Namen trägt der Text `data-tip` mit dem vollen Namen.
- Die Anzahl „n×“ steht in einer eigenen rechten Spalte (x = W − 4, rechtsbündig) und kann so keinen Namen und keinen Balken überdecken.

### 1.3 Linien, Gitter, Bezugslinien

**A-7**
- Gitterlinien sind 1 px, durchgezogen, `--border`, `shape-rendering: crispEdges`. Die Nulllinie ist 1 px, durchgezogen, `--border-2`.
- Gestrichelt sind nur Bezugslinien (Startkapital, Ruin-Schwelle, Ruin im Histogramm: 1 px, `stroke-dasharray="4 3"`) und die hypothetische Reihe Schatten-Ich (2,2 px, `"5 4"`).
- Jede Verlaufslinie läuft über `UI.smooth` (monoton, kein Überschwingen), auch Kontostand- und Drawdown-Verlauf. Nur bei genau einem Punkt bleibt die Mini-Strecke.
- Linienstärken bleiben, wie sie sind (2,2 px Hauptlinien, 2 px Spark/Drawdown/Rolling, 1 px Monte-Carlo-Pfade, 2 px Median).

### 1.4 Farbe mit Bedeutung

**A-8**
- **Gewinn/Verlust.** Eine Linie, die die Null- oder Bezugslinie kreuzt, wird dort per `clipPath` geteilt: darüber `--profit`, darunter `--loss`. Das gilt für pnl, spark und Kontostand (Bezug Startkapital). End- und Hover-Punkt nehmen die Farbe ihres Abschnitts an.
- **Neutrale Größen** sind Anzahlen, Provisionen, die Trefferquote als Reihe, der rollierende Edge, Monte-Carlo-Pfade und das Schatten-Ich. Hauptreihe `--text`, Nebenreihe `--text-2`. Mengenbalken ohne Vorzeichen: `--text-2`, `fill-opacity .45`.
- **Bewertung 0–100:** `U.scoreColor` (Disziplin pro Woche, Regeltreue-Ring).
- **Break-even** ist überall `--be`, auch im Punktdiagramm. `--be` ist nie eine Serienfarbe.
- **`--accent` in Diagrammen** nur noch im Gesamt-Score-Netz (README Z. 105) und im Regel-Tracker (Regeltreue = positiv). Die Monte-Carlo-Farben legt die Farb-Spezifikation fest (bereich_statistik-25: Pfade `--text-2` .22, Histogramm `--text-2` .45, ab Ruin `--loss` .9). Hier werden sie vorausgesetzt.
- **Frei wählbare Serienfarben (Report).** Standard ist `['#2f80d0', '#b4549f', '#c0702f']` (Blau, Magenta, Kupfer). Geprüft mit `dataviz/scripts/validate_palette.js`: ALL PASS dunkel auf #1a1917 und hell auf #ffffff. OKLab-ΔE zu `--be` ≥ 10,7 (#4a6fe3 hätte nur 6,0). Kein Grün, kein Bernstein.
- **Aktivitäts-Heatmap:** neutrale Stufen `color-mix(in srgb, var(--text) 14/26/38/50/62 %, var(--surface-2))`. Die Heute-Markierung ist `0 0 0 2px var(--text-2)`.
- **Regel-Tracker:** Die Legende verwendet dieselben Selektoren wie die Zellen und zeigt dadurch immer dieselben Stufen.
- **Info-Texte nennen keine Farbe** („Blau sind …“, „… desto kräftiger das Grün“), weil Gewinn-, Verlust-, Break-even- und Akzentfarbe in den Einstellungen wählbar sind.

### 1.5 Flächen

**A-9**
- Eine Fläche liegt immer zwischen Linie und Nulllinie, nie bis zum unteren Rand.
- Die Fläche ist eine flache Tönung ohne Verlauf: Gewinn `fill-opacity .12`, Verlust `.16`. Rot bleibt also etwas kräftiger, wie README Z. 188 verlangt. Der Drawdown ist eine Verlustfläche (.16). In `ui.js` und `widgets.js` gibt es keinen `linearGradient` mehr.
- Keine Fläche gibt es, wenn Säulen im selben Diagramm stehen („Täglicher & kumulierter P&L“), und beim rollierenden Edge.

### 1.6 Balken

**A-10**
- **Form:** an der Nulllinie gerade, nur das Wertende gerundet. Radius `min(3, Breite/2, Länge)`. Gezeichnet als `<path class="br">` über `U.vbarPath` / `U.hbarPath`. Kein `<rect rx>` mehr für Datenbalken.
- **Deckkraft:**
  - Gewinn/Verlust-Balken allein (vbars, hbars, dbars, Report): `.85`
  - Balken unter einer Linie (Täglich & kumuliert): `.55`
  - Score-Säulen: `.85`
  - Mengenbalken: `--text-2` `.45`
- **Lage:** Balken sitzen in der Mitte ihres Fachs (Bandskala) und ragen nie über den Plotrand.
- **Mindestlänge** wie bisher: vbars/hbars/Affiliate 2 px, pnl/dbars 1,5 px, Report 1 px.
- **„Disziplin pro Woche“:** Score als Zahl über jeder Säule (`text.bv`), solange die Fachbreite ≥ 22 px ist. Oben 16 px Platz.

### 1.7 Mehrere Einheiten

**A-11 Nie zwei y-Achsen.**
- Je Einheit eine Spur, die Spuren stehen übereinander. Höhenanteile: 1 Einheit 100 %, 2 Einheiten 62/38 %, 3 Einheiten 50/25/25 %. Zwischen den Spuren 14 px.
- Jede Spur hat eigene `niceTicks` (Spur < 100 px hoch: 3, sonst 5) und eine eigene linke Achse über `U.axisLeft`. Liegt in der Spur ein Balken, bekommt sie eine eigene Nulllinie.
- Die Datumsachse steht nur unter der untersten Spur. Die Hover-Linie läuft über die ganze Höhe.
- Die erste Einheit der Serienliste steht oben.

### 1.8 Legenden

**A-12**
- Es gibt eine Legendenform: `.chart-legend`, oben links direkt über dem `.chart`. Schrift 12 px / 400 in `--text-2`. Punkt 8 px rund, 6 px Abstand zum Text. Lücke zwischen den Einträgen 16 px, `margin: 0 0 8px`. Für eine gestrichelte Reihe steht statt des Punkts ein 14 px langer gestrichelter Strich (`i.dash`, 2 px `--text-2`).
- Eine Legende gibt es nur bei zwei und mehr Reihen. Eine einzelne Reihe nennt der Kartentitel. Bezugslinien werden direkt beschriftet und stehen nicht in der Legende.
- Die Klasse `.legend` (app.css:691–692) bleibt allein für die Fieldset-Überschriften in den Dialogen.

### 1.9 Kennzahl-Anzeigen

**A-13**
- **Gepaarte Zähler** („Gewinner / Verlierer“, „Gewinntage / Verlusttage“): Farbe nur bei Wert > 0 (`pos` bzw. `neg`). Eine 0 bleibt neutral.
- **Zählspalten in Tabellen** (Gewinner, Verlierer) sind nie eingefärbt. Die Spaltenüberschrift trägt die Bedeutung.
- **Beträge in Listenzeilen mit Balken** (`.bar-row .bl > b`): Onest, `tabular-nums`, Gewicht wie bisher (700). Der Zusatz „· n×“ steht in 400.
- **Prop-Puffer, wenn der Rest größer ist als das Limit:** Text „{Rest} über dem Boden“ statt „{Rest} von {Limit}“. Beim Drawdown bekommt der Betrag den Tooltip „Boden bei {Betrag}“, bei gesperrtem Boden „Boden fest bei {Betrag}“. Der Balken bleibt voll.
- **Trade-Notiz:** aufklappbar „Trade-Details“ mit `.kv`-Zeilen „Einstieg → Ausstieg“, „Kontrakte“, „R-Multiple“, „Brutto-P&L“, „Gebühren“. Keine Statistik-Kacheln und kein Diagramm. Tagesnotiz: die Sparkline erst ab 3 abgeschlossenen Trades, sonst nur die Kennzahlen in voller Breite.
- **Regeltreue-Ring:** 64 × 64 px, Strich 6 px, Farbe `U.scoreColor(rate·100)`, kein Schein. Ohne Wert und bei 0 % gibt es keinen Bogen, nur die Spur.
- **Schatten-Ich-Ranking:** Nur Regeln mit Verstoß bekommen einen Balken. Regeln ohne Verstoß stehen in einer Zeile „Ohne Verstöße: A, B“. Hat keine Regel einen Verstoß, steht der Leerzustand „Keine Verstöße“.

**A-14 Kumulierter Netto-P&L.**
- Ein Name: „Kumulierter Netto-P&L“, in Dashboard-Widget, Statistik-Karte und Vorschau.
- Eine Zeitachse: ein Punkt je Handelstag, keine aufgefüllten Kalendertage.
- Die Statistik-Karte hat diesen Kartentitel und keine Legende. Sie erscheint nur, wenn es abgeschlossene Trades gibt.

**A-15 Monte Carlo.**
- Median je Schritt als Linie in `--text`, 2 px, mit Endbeschriftung „Median {fmt.axisCur}“. Ihr Endwert ist gleich `mc.final.p50`.
- Pfad-Achse „0 · 25 · 50 Trades“: nur der letzte Wert trägt „Trades“.
- Histogramm-Achse auf runden Prozenten (`niceTicks(0, maxP, 4)`, z. B. 0 % · 10 % · 20 % · 30 %).
- Ruin-Linie gestrichelt, wenn `ruinPct ≤ maxP`, beschriftet mit „Ruin ab 30 %“.
- Die Ruin-Schwelle im Pfaddiagramm ist mit vollem Betrag beschriftet („Ruin-Schwelle 17.500 €“ statt „18k“).

**A-16 Radar.** Die Beschriftung ist effektiv nie kleiner als 11 px. Schriftgröße in SVG-Einheiten = 11 × k, mit k = clamp(Breite der Ausgangs-viewBox / gerenderte Breite, 1, 1,4). Neu berechnet bei jedem Zeichnen und bei Fenstergröße.

**A-17 Zugänglichkeit.**
- Jedes Diagramm-SVG unter `.chart` bekommt `role="img"` und `aria-label` = `data-label` des `.chart` oder der Kartentitel. Ohne Namen bekommt es `aria-hidden="true"`.
- Der Heatmap-Container trägt `role="img" aria-label="Trading-Aktivität"`.

**A-18 Einzug.**
- Die Fläche läuft der Linie nicht voraus und endet gemeinsam mit ihr. Die Werte legt die Spezifikation Bewegung fest (B6/K7: `.ar` mit `ch-fade var(--dur-3) var(--ease) calc(var(--dur-4) - var(--dur-3)) both`).
- Gestrichelte Linien blenden ein (Klasse `ar`), statt sich zu zeichnen, damit ihr Strichmuster erhalten bleibt.
- Balken (`.br`, auch als `<path>`) wachsen weiter von der Nulllinie.
- Werte über Säulen (`text.bv`) erscheinen nach dem Wachsen.

### 1.10 Glossar und Texte (vorher → nachher)

| Stelle | Vorher | Nachher |
|---|---|---|
| Widget-Name kum_pnl, Vorschau | Kumulierter Tages-P&L | Kumulierter Netto-P&L |
| Statistik-Kopfkarte | (kein Titel) + Legende „● Kumulierter Netto-P&L“ | Titel „Kumulierter Netto-P&L“, keine Legende |
| Info perf_uhrzeit / perf_haltedauer, letzter Satz | Blau sind Break-even-Trades. | Break-even-Trades liegen auf der Nulllinie. |
| Info verlauf_trefferquote | … Trefferquote (rechte Achse), Ø Gewinn und Ø Verlust (linke Achse). | Laufende Werte bis zum jeweiligen Handelstag: oben Ø Gewinn und Ø Verlust, unten die Trefferquote. |
| desc taeglich_kumuliert | Säulen für den Tages-P&L und Fläche für den kumulierten P&L in einem Diagramm. | Säulen für den Tages-P&L und eine Linie für den kumulierten P&L in einem Diagramm. |
| info taeglich_kumuliert | … Fläche und Linie: kumuliertes Ergebnis im Zeitraum. | Säulen: Netto-Ergebnis je Handelstag. Linie: kumuliertes Ergebnis im Zeitraum. |
| Kontostand-Verlauf | Legende „● Kontostand ● Startkapital“ | keine Legende, Linie beschriftet „Startkapital 25.000 €“ |
| Info Trading-Aktivität | … Je mehr Trades, desto kräftiger das Grün. … | … Je mehr Trades, desto kräftiger das Kästchen. … (passt zu „Ein Kästchen pro Tag“) |
| Prop-Puffer über Limit | 11.162 $ von 3.000,00 $ | 11.162 $ über dem Boden (Tooltip „Boden fest bei 50.100 $“) |
| Monte Carlo Ruin-Label | Ruin-Schwelle 18k | Ruin-Schwelle 17.500 € |
| Monte Carlo Pfad-Achse | 0 Trades · 25 Trades · 50 Trades | 0 · 25 · 50 Trades |
| Histogramm-Achse | 0 % · 19 % · 36 % | 0 % · 10 % · 20 % · 30 % + „Ruin ab 30 %“ |
| Haltedauer-Achse | 3m:24s · 12m:49s · 1h:15m (schräg) | 1 min · 5 min · 15 min · 1 h (waagerecht) |
| Uhrzeit-Achse | 08:52 · 10:21 · 11:50 (schräg) | 09:00 · 10:00 · 11:00 (waagerecht) |
| Notiz-Kopf (Trade) | Trade-Statistik · 1 Trade | Trade-Details |
| Schatten-Ich-Ranking | „Regel X 0,00 € · 0×“ als leere Balkenzeile | Ohne Verstöße: Regel X, Regel Y |
| Leeres Fach | (fehlt) | Tooltip „{Name}: Keine Trades“ |

Begriffe: „Boden“ für die Prop-Grenze (App-Begriff „Drawdown-Boden“, prop.js:51), „Ruin-Schwelle“ nur in Monte Carlo, „Startkapital“, „Median“, „R-Multiple“, „Trefferquote“ in allen neuen Texten. Jeder neue oder geänderte deutsche Text bekommt einen Eintrag in `js/lang/{en,es,pt,hi,zh}.js`. Der alte Schlüssel wird dabei ersetzt, nicht stehen gelassen.

## 2. Konflikte und Entscheidungen

**K1 – Achsenformat.** typografie-29, diagramme-9 (mit Ergänzung bereich_statistik-14) und der Achsenteil von hierarchie-50 beschreiben dasselbe. Farbe/diagramme-37 regelt `.chart text` identisch.
- Entscheidung: alles links mit `fmt.axisCur`, ein Schritt (C2/C13–C16), `.chart text` nur einmal ändern (A1).
- Der Vorschlag aus typografie-29, bei vbars rechts `mr = Math.max(52, …)` zu setzen, entfällt, weil die Achse nach links wandert.
- Mit `curShort` fällt auch der Fehler weg, dass der Geld-blind-Modus in vbars, hbars und Monte Carlo rohe Beträge zeigte (README Z. 211).

**K2 – Achsenbereich.** bereich_konto-55 will nur in affiliate.js nachbessern, diagramme-8 zentral in `niceTicks`.
- Entscheidung: zentral (C1). affiliate.js:43 bleibt unverändert und erbt die Korrektur, denn `y1 = Math.max(letzter Strich, …)` ist dann der letzte Strich.
- Gegen mehr Striche und dadurch überlappende Beschriftungen schützt A-3 (C3).

**K3 – Kumulierter P&L.** diagramme-13 (nur Handelstage) steht gegen die Ergänzung aufbau-36 (beide bis heute auffüllen).
- Entscheidung: nur Handelstage. So zeichnen alle Dashboard-Diagramme, und `fillDays` stammt aus dem ersten Aufbau (8b84260), keine Nutzerentscheidung.
- hierarchie-14 ist ein Duplikat.
- zustaende-5 sagt „fillDays bleibt“. Das ist mit dem Löschen von `fillDays` überholt, der Kern (keine Karte ohne abgeschlossene Trades) bleibt.
- bereich_statistik-48 (Titel statt Legende) ist im selben Schritt.
- Gruppenübergreifend:
  - aufbau-19, bereich_statistik-5 und responsiv-37 (Aufbau) verschieben die Karte in den Reiter „Übersicht“. Das verträgt sich, hier wird nur der Inhalt der Karte festgelegt.
  - farbe_kontrast-20 (Farbe) will den Legendenpunkt auf `--profit` setzen. Das entfällt, weil die Legende entfällt.
  - bereich_statistik-22 (Zustände) ist dasselbe wie zustaende-5 und wird nur einmal umgesetzt.

**K4 – Trefferquote in der Break-even-Farbe.** bereich_dashboard-36, der Farbteil von diagramme-6 und die Ergänzung diagramme-20 sind deckungsgleich. Entscheidung: `--text-2` an einer Stelle (E10, F4).
- Info-Text ohne Farbnamen: „Break-even-Trades liegen auf der Nulllinie.“
- Die Variante „erscheinen in der Break-even-Farbe“ wurde verworfen, weil sie sich selbst erklärt.

**K5 – Kurvenfamilie.** bereich_dashboard-39 und diagramme-16 sind gleich. Der Drawdown-Pfad steht in widgets.js:102.

**K6 – Kontostand.** diagramme-15 und bereich_dashboard-37 sind gleich.
- Entscheidung: Bezugslinie 1 px `--muted`, gestrichelt „4 3“. Damit haben alle Bezugslinien dasselbe Muster wie die Ruin-Schwelle. „4 4“ aus dem Vorschlag wird angeglichen.
- Direkte Beschriftung, keine Legende, Linie an der Bezugslinie zweifarbig.

**K7 – Uhrzeit/Haltedauer.** bereich_dashboard-35 und diagramme-19 sind gleich. Die Rückfälle bei engem Datenbereich sind hier verbindlich festgelegt (A-4). Zusätzlich verhindert das Ausdünnen im Zeichner Überlappung bei schmalen Karten.

**K8 – Flächen-Deckkraft.** diagramme-17 will flache .12/.16. Die Prüfer-Anmerkung zu bereich_notebook_news-19 sagt „Opazitäten werden nicht gesenkt“, mit der Begründung, sie müssten zu drawers.pnl passen.
- Entscheidung: diagramme-17 gilt für alle Flächen, Spark eingeschlossen. So bleibt die Gleichheit mit pnl erhalten, und README Z. 188 (Rot kräftiger) bleibt mit .16 zu .12 gewahrt.
- Drawdown .16 statt .14 aus dem Vorschlag: eine Regel für alle Verlustflächen.
- Den Rolling-Teil von diagramme-17 (.10) ersetzt farbe_kontrast-37: Diese Fläche entfällt ganz, weil sie bis zum unteren Rand reichte und keine Bedeutung trägt.

**K9 – Balkenform.** diagramme-11 (Pfad, Wertende gerundet, r = 3) steht gegen bereich_statistik-35 (`rx 2` an allen Ecken, .85).
- Entscheidung: Form aus diagramme-11 für alle Datenbalken, Deckkraft .85 aus bereich_statistik-35.
- Die Histogramm-Farben setzt Farbe/bereich_statistik-25. Die Ergänzung bereich_training-16 (Breite 18, .7, rx 3) wird nicht übernommen, Breite und Deckkraft der Wochen-Säulen bleiben (diagramme-25).
- Risiken: Einzug, `rect.br`-Selektoren und 3 Tests. Sie sind in C6, A3 und O1–O4 vollständig aufgeführt.

**K10 – Legenden.**
- Gewicht: diagramme-14 sagt im Vorschlag 500, die Prüfer-Anmerkung 400. Entscheidung: 400. Legenden sind keine Steuerelemente, 500 gilt laut BRIEF nur für Steuerelemente.
- `.legend` wird auch für die Fieldset-Überschriften in den Dialogen benutzt (app.js:493, 531, 532, 565). Die zentrieren sich dort heute über `.legend { justify-content: center }` (extra/late003_session_end.png). Entscheidung: eine neue Klasse `.chart-legend`. Die Dialoge bleiben dadurch unverändert. Ob die Fieldset-Überschriften links stehen sollen, entscheidet die Gruppe Komponenten.

**K11 – Heatmap.** farbe_kontrast-21 (14/26/38/50/62 %) steht gegen die Ergänzung diagramme-23 (8–52 %) und Farbe/bereich_training-8 (8/16/28/42/58 %).
- Entscheidung: 14/26/38/50/62 %. Grund: 8 % ergibt im hellen Design nur 1,25:1 zum leeren Feld (Prüfer), 80 % wäre im Dunkeln als 40-px-Fläche zu laut.
- Info-Text „Kästchen“ statt „Feld“, passend zum ersten Satz „Ein Kästchen pro Tag“.
- Heute-Rahmen 2 px `--text-2`. Vereinheitlicht die Farb-Spezifikation alle „Heute“-Markierungen (farbe_kontrast-24, referenz-8), gilt deren Wert.

**K12 – Regel-Tracker-Legende.** Farbe/bereich_dashboard-38 dämpft die Tracker-Stufen auf 18/32/50/70 %, diagramme-24 will nur Legende = Zellen.
- Entscheidung: gemeinsame Selektoren `.tracker i.lN, .heat-legend.right i.lN` (A6). Welche Prozentwerte gelten, entscheidet die Farb-Spezifikation. Die Legende folgt automatisch.
- Die Werte 25/45/70/100 % bleiben hier unverändert.

**K13 – Report-Farben.** farbe_kontrast-38 (`#3d6bff, #8a867f, #f5a53a`) steht gegen Farbe/diagramme-44 (`#4a6fe3, #b4549f, #c0702f`).
- Die eigene Palette fällt durch den Validator: #8a867f hat Chroma 0,011 (liest sich grau), #f5a53a liegt außerhalb des Helligkeitsbands und hat hell nur 2,03:1.
- Die Palette aus diagramme-44 besteht zwar, ihr Blau liegt aber nah an `--be` (ΔE 6,0 hell).
- Entscheidung: `['#2f80d0', '#b4549f', '#c0702f']`, alle Checks PASS in beiden Designs.
- Gespeicherte alte Standardwerte werden beim Lesen ersetzt (#3d6bff → #2f80d0, #f5a53a → #b4549f, #4fd1a5 → #c0702f). Selbst gewählte Farben bleiben.
- Keine `var()`-Werte, weil der Farbwähler (`input type=color`, colorpicker.js) nur #rrggbb annimmt.

**K14 – Regeltreue-Ring.** bereich_training-7 (64/6), seine Prüfer-Fassung (72/6, `--text-2`), die Ergänzung diagramme-26 (64/6) und KI-Look/ki_look-6 (88/7, Rand 116–120) weichen voneinander ab.
- Entscheidung: 64/6, Rand 96 px, Farbe `scoreColor`. 64 px entspricht der Größe der Kachel-Diagramme. Der Ring wiederholt nur die Zahl daneben und soll deshalb Begleitzeichen sein, kein Blickfang. `scoreColor` gibt ihm dieselbe Bedeutung wie jeder anderen Score-Anzeige.
- Der Ring bleibt bestehen (Nutzerentscheidung laut ki_look-6, headtest).
- „Kein Bogen bei 0“ deckt zugleich Zustände/zustaende-11 ab.
- Den Wert „—“ statt „0 %“ ohne Regeln regelt Zustände/bereich_training-6, nicht hier.
- Die `transition` derselben Zeile 1317 regelt Bewegung (B8). Hier wird nur `filter` entfernt.

**K15 – Prop-Puffer.** diagramme-39 und Zustände/bereich_prop-6 sind derselbe Fall.
- Entscheidung Text: „über dem Boden“. Das ist für Drawdown und Daily Loss richtig, denn `remaining` ist immer der Abstand zur jeweiligen Grenze. Es benutzt außerdem den App-Begriff „Drawdown-Boden“.
- „über der Schwelle“ (Original) wurde verworfen, weil „Schwelle“ in der App für Monte Carlo steht. „· Boden fest“ (bereich_prop-6) wurde verworfen, weil es nur bei gesperrtem Boden stimmt und dort als Tooltip steht.
- Die gleiche Stellenzahl beider Beträge und das Kappen „372 % des Limits“ bleiben bei bereich_prop-6.

**K16 – Anzahl in hbars.** diagramme-1 (rechte Spalte) steht gegen die Ergänzung bereich_statistik-4 (Anzahl in der Namensspalte). Entscheidung: rechte Spalte. Die Namensspalte ist am Handy nur etwa 85 px breit, „Name · 12“ würde links abgeschnitten. Die Kürzung mit „…“ deckt zugleich diesen Teil von bereich_statistik-37 ab.

**K17 – Leere Kategorien.** diagramme-12 (in `timeAnalysis`) steht gegen die Ergänzung bereich_statistik-15 (in `groupBy`). Entscheidung: `timeAnalysis`, weil `regimeAnalysis` sonst mit aufgefüllt würde. Barrierefreiheit/diagramme-46 (Trefferbänder für Tooltips) verträgt sich damit: Das transparente Fach-Rechteck für leere Kategorien hat dieselbe Form.

**K18 – Wochenbeschriftung.** bereich_training-15 (2er/4er-Raster) und responsiv-34 (`ceil(44/gap)`) lösen dasselbe. Entscheidung: `ceil(44/gap)`, das ist allgemeiner und ergibt bei 31,6 px dasselbe (jede zweite Woche).

**K19 – Schatten-Ich-Diagramm.** bereich_training-28 und die Ergänzung farbe_kontrast-35 werden zusammengeführt.
- Eine zusätzliche `.zero`-Linie (Prüfer-Fassung) entfällt. Die 0-€-Linie ist bereits eine Gitterlinie, eine weitere gestrichelte Linie neben der gestrichelten Reihe würde verwirren.
- Den Kartentitel „Equity: echt vs. Schatten-Ich“ regelt Wording/wording-40, hier bleibt er.
- Das Dashboard-Widget bekommt nur die neuen Serienfarben, keine Legende (Platz). Unterscheidbar bleiben die Reihen über Strichart und die beschrifteten Werte darüber.

**K20 – Einzug.** Bewegung/bewegung-1 und diagramme/bewegung-2 setzen beide die Zeilen app.css:106–112.
- Die Bewegungs-Spezifikation (B6, K7) löst bewegung-2 bereits: Fläche ab 260 ms, Ende gemeinsam mit der Linie bei 640 ms.
- Entscheidung: Die Zeiten kommen von dort. Hier werden in denselben Zeilen nur Selektoren geändert (`rect.br` → `.br`), und `text.bv` kommt hinzu.
- In ui.js:253 ändert dieser Plan nur `'rect.br'` → `'.br'`, die Staffel-Rechnung derselben Zeile kommt aus Bewegung 3.6.

**K21 – Textalternative.** barrierefreiheit-19 (Kartentitel) steht gegen Barrierefreiheit/bereich_statistik-33 (Inhaltssätze für 6 Statistik-Typen).
- Entscheidung: Hier wird der allgemeine Rückfall gebaut (`nameChart`, C7).
- Setzt die Barrierefreiheits-Spezifikation `chartLabel(k, data)` um, steht dieser Aufruf in `nameChart` vor dem Kartentitel: `const t = chartLabel(k, data) || el.dataset.label || Kartentitel`.

**K22 – Affiliate-Balken.** bereich_konto-7 (neutral) steht gegen Farbe/farbe_kontrast-20 (`--profit`).
- Entscheidung: neutral `--text-2` .45 in beiden Ansichten. Die Werte haben kein Vorzeichen. In der Betreiber-Ansicht sind Provisionen Ausgaben, dort wäre Grün falsch. Dieselbe Farbe für beide Ansichten ist ruhiger.
- Die Hover-Regel aus dem Prüfer-Vorschlag (`rect:hover { fill-opacity: .8 }`) entfällt, weil kein anderes Balkendiagramm einen Hover-Zustand hat.

**K23 – Monte Carlo.** Der Median (diagramme-21) setzt die neutralen Pfadfarben aus Farbe/bereich_statistik-25 voraus. Das Start-Label aus der Prüfer-Fassung entfällt (Prüfer-Anmerkung), weil Startkapital und Ruin in der Zeile über den Kacheln stehen. Die Ruin-Beschriftung mit vollem Betrag deckt sich mit Wording/bereich_statistik-26 (`fmt.cur(…, { compact: true })` = `fmt.axisCur`).

**K24 – Zähler-Farbe.** bereich_notebook_news-18 („nur bei > 0 färben“) und hierarchie-50 („Tabellenspalten neutral“) widersprechen sich nicht, sie gelten an verschiedenen Orten (A-13). Gleiches Muster wie in day.js:14 und trades.js:54 steht auch in stats.js:31 („Gewinntage / Verlusttage“). Dort wird es mitgezogen, sonst entsteht eine neue Ungleichheit.

**K25 – Ranking-Gewicht.** bereich_training-30 schlägt im Original `font-weight: 600` vor, die Prüfer-Fassung behält 700. Entscheidung: 700 bleibt (Werte dürfen 700 sein). Falsch war nur die Schriftfamilie.

**K26 – Zeitachse „Ausgaben vs. Payouts“.** diagramme-40 (Zeitachse + Treppe) steht gegen bereich_prop-23 (Zeitachse ohne Treppe; Prüfer-Fakten: „Treppe nötig“).
- Mit Zeitachse, aber weicher Kurve würde eine Lücke von 26 Tagen als lange gleichmäßige Rampe erscheinen. Das täuscht mehr als heute.
- Die Treppe berührt die Nutzerentscheidung „alle Kurven weich“ (README Z. 345–347).
- Entscheidung: Beides kommt als Paket unter „Nutzer fragen“, nichts davon wird vorab umgesetzt.

## 3. Umsetzungsschritte

Reihenfolge: Tokens und Basisstile → Skalen und Bausteine → Zeichner → Widgets und Seiten → Vorschaubilder → Übersetzungen → Tests → README. Für jeden Schritt sind die erledigten Befund-ids angegeben.

### 3.1 `web/css/app.css`

**A1 Diagrammtext, eine Definition** (typografie-29, diagramme-9, diagramme-25)
- Z. 683 `.chart text { fill: var(--muted); font-size: 11px; font-family: var(--font); }` → `.chart text { fill: var(--muted); font-size: 11px; font-variant-numeric: tabular-nums; }` Die Schrift Onest kommt aus der Sammelregel Z. 1800, `.chart text` steht dort schon.
- direkt darunter neu:
  ```css
  .chart text.bv { fill: var(--text-2); } /* Wert an der Säule */
  .chart text.lbl { paint-order: stroke; stroke: var(--surface); stroke-width: 3px; stroke-linejoin: round; } /* Beschriftung an Bezugslinien im Feld */
  ```
- Z. 1647–1648 (`/* Achsen-Text */` und `.chart text { fill: var(--text-2); font-size: 11.5px; }`) löschen.

**A2 Gitter und Nulllinie durchgezogen** (diagramme-7)
- Z. 684 → `.chart .grid line { stroke: var(--border); shape-rendering: crispEdges; }`
- Z. 685 → `.chart .zero { stroke: var(--border-2); shape-rendering: crispEdges; }`
- Z. 1323 (`.chart .grid line { stroke-dasharray: 3 4; }`) löschen.

**A3 Einzug: Selektoren für Pfad-Balken und Werte** (diagramme-11, diagramme-25; Zeiten aus Bewegung B6, siehe K20)
- Z. 108 Selektor `.chart svg.enter rect.br` → `.chart svg.enter .br`. Die Deklarationen bleiben, deren Werte setzt Bewegung B6.
- Z. 109 `.chart svg.enter rect.br.dn` → `.chart svg.enter .br.dn`.
- nach Z. 112 neu: `.chart svg.enter text.bv { animation: ch-fade var(--dur-2) var(--ease) var(--dur-3) both; } /* Wert erscheint nach dem Wachsen der Säule */`
- Rückfall, falls Bewegung B6 nicht umgesetzt wird: Z. 107 und 112 `ch-fade 1s ease .35s both` → `ch-fade .45s ease .55s both` (bewegung-2).

**A4 Legende** (diagramme-14, bereich_training-28)
- nach Z. 692 neu:
  ```css
  /* Diagramm-Legende: oben links über dem Diagramm, nur bei zwei und mehr Reihen (.legend bleibt für Fieldset-Überschriften) */
  .chart-legend { display: flex; flex-wrap: wrap; gap: 6px 16px; margin: 0 0 8px; font-size: 12px; font-weight: 400; color: var(--text-2); }
  .chart-legend span { display: inline-flex; align-items: center; }
  .chart-legend i { display: inline-block; width: 8px; height: 8px; border-radius: 999px; margin-right: 6px; }
  .chart-legend i.dash { width: 14px; height: 0; border-radius: 0; background: none; border-top: 2px dashed var(--text-2); }
  ```
- Z. 1649–1651 (`.legend.top`, `.legend.rep i`, `.legend.rep`) löschen. Z. 691–692 bleiben unverändert.

**A5 Aktivitäts-Heatmap neutral** (farbe_kontrast-21, Ergänzung diagramme-23)
- Z. 1287–1290: in `.activity i.lN, .heat-legend i.lN` jeweils `color-mix(in srgb, var(--accent) 22% | 40% | 60% | 80%, var(--surface-2))` → `color-mix(in srgb, var(--text) 14% | 26% | 38% | 50%, var(--surface-2))`. `border-color: transparent` bleibt.
- Z. 1291 `background: var(--accent)` → `background: color-mix(in srgb, var(--text) 62%, var(--surface-2))`.
- Z. 1292 → `.activity i.today { box-shadow: 0 0 0 2px var(--text-2); }`

**A6 Regel-Tracker: Legende = Zellen** (diagramme-24)
- Z. 1668 → `.tracker i.l1, .heat-legend.right i.l1 { background: color-mix(in srgb, var(--accent) 25%, var(--surface-2)); border: 0; }`
- Z. 1669 → gleiche Form mit `.l2` und 45 %
- Z. 1670 → gleiche Form mit `.l3` und 70 %
- Z. 1671 → `.tracker i.l4, .heat-legend.right i.l4 { background: var(--accent); border: 0; }`

Die Spezifität (0,3,1) schlägt `.heat-legend i.lN` aus A5. Die Fortschritt-Legende (ohne `.right`) bleibt neutral.

**A7 Regeltreue-Ring** (bereich_training-7, Ergänzung diagramme-26)
- Z. 1312 `margin-right: 150px` → `margin-right: 96px`.
- Z. 1317: `filter: drop-shadow(0 0 6px var(--accent-glow));` streichen. Die Farbe kommt künftig inline (H1). Die `transition` derselben Zeile ändert Bewegung B8.
- Z. 1318 → `@media (max-width: 600px) { .card.ring-card { min-height: 0; } }`. Der 64-px-Ring bleibt damit auch am Handy rechts mittig.

**A8 Beträge in Balkenzeilen** (bereich_training-30)
- nach Z. 658 (`.bar-row .track i`) neu: `.bar-row .bl > b { font-family: var(--font-num); font-variant-numeric: tabular-nums; } .bar-row .bl > b .muted { font-weight: 400; }`
- nach Z. 2443 neu: `.shadow-clean { margin-top: 10px; }`

**A9 Notiz-Statistik ohne Diagramm** (bereich_notebook_news-18)
- nach Z. 1036 neu: `.nb .stats-grid.solo { grid-template-columns: 1fr; }`

### 3.2 `web/js/core.js`

**B1 Uhrzeit-Fächer und leere Kategorien** (diagramme-12, Ergänzung bereich_statistik-15)
- Z. 194: in `HOUR_BUCKETS` den Eintrag `'18–20'` durch `'18–19', '19–20'` ersetzen.
- Z. 195 → ``const hourBucket = h => h < 8 ? 'vor 8' : h < 20 ? `${h}–${h + 1}` : 'ab 20';``
- nach Z. 197 neu:
  ```js
  /* geordnete Achsen lückenlos: leere Fächer zwischen erstem und letztem belegten (minHi: mindestens bis zu diesem Index, ab Index 0) */
  const padGroups = (gs, order, minHi = -1) => { if (!gs.length) return gs; const by = new Map(gs.map(g => [g.key, g])); const idx = gs.map(g => order.indexOf(g.key)); const lo = minHi >= 0 ? 0 : Math.min(...idx), hi = Math.max(minHi, ...idx); return order.slice(lo, hi + 1).map(k => by.get(k) || { key: k, trades: [], s: summary([]) }); };
  ```
- Z. 200–202 in `timeAnalysis`: `weekdays: padGroups(groupBy(…, WEEKDAYS), WEEKDAYS, 4)`, `hours: padGroups(groupBy(…, HOUR_BUCKETS), HOUR_BUCKETS)`, `holding: padGroups(groupBy(…, HOLD_BUCKETS), HOLD_BUCKETS)`. Die Argumente von groupBy bleiben, wie sie sind. `groupBy` und `regimeAnalysis` bleiben unverändert.

**B2 Monte-Carlo-Median** (diagramme-21)
- in `monteCarlo` vor der Lauf-Schleife (Z. 236): `const steps = Array.from({ length: horizon + 1 }, () => new Float64Array(runs));`
- in der Lauf-Schleife: direkt nach `let e = start, …` `steps[0][r] = start;`, in der inneren Schleife nach `e += …` `steps[i + 1][r] = e;`
- im Rückgabeobjekt (Z. 244) ergänzen: `median: steps.map(a => percentile(a, .5))`. Der Zufallsgenerator bleibt unverändert, die Werte sind deterministisch.

### 3.3 `web/js/ui.js` – Skalen und Bausteine

**C1 `niceTicks` mit rundem Bereich** (diagramme-8, bereich_konto-55)
- Z. 189 → in der Funktion nach der Schrittwahl `s`:
  ```js
  const lo = Math.floor(min / s + 1e-9) * s, hi = Math.ceil(max / s - 1e-9) * s, k = Math.round((hi - lo) / s); const t = []; for (let i = 0; i <= k; i++) t.push(+(lo + i * s).toFixed(6)); return t;
  ```
  Das ersetzt die bisherige Schleife `for (let v = Math.ceil(min / s) * s; v <= max + 1e-9; v += s)`. Alle Aufrufer (ui.js:264, 291, 302, 325, 333, 340, 348; widgets.js:59, 77, 89, 99; affiliate.js:43) nehmen schon `Math.min/Math.max` mit den Daten und brauchen keine Änderung.

**C2 `curShort` entfernen** (typografie-29, diagramme-9). Z. 207 löschen, nachdem C13, C14 und C16 umgesetzt sind. Danach muss `grep -n curShort web/js/ui.js` leer sein.

**C3 `axisLeft` ohne Überlappung, Kommentar** (diagramme-8, diagramme-7)
- Z. 228 Kommentar `gestrichelte Gitterlinien` → `durchgezogene Haarlinien`.
- Z. 230 →
  ```js
  const axisLeft = (ticks, yf, ml, W, mr, fmtFn) => { let last = Infinity; return `<g class="grid">${ticks.map(t => { const y = yf(t), show = Math.abs(last - y) >= 14; if (show) last = y; return `<line x1="${ml}" x2="${W - mr}" y1="${y}" y2="${y}"/>${show ? `<text x="${ml - 8}" y="${y + 3.5}" text-anchor="end">${fmtFn(t)}</text>` : ''}`; }).join('')}</g>`; };
  ```

**C4 Waagerechte Beschriftung ohne Überlappung** (bereich_dashboard-35, diagramme-9). Neu nach Z. 230:
```js
/* waagerechte Achse: Beschriftung nur, wenn sie die vorige nicht berührt; am Rand nach innen geschoben, nie gedreht */
const xLabels = (items, x0, x1, y) => { let right = -Infinity; return items.map(({ x, label }) => { const s = String(label), w = s.length * 6.2 + 4, cx = Math.min(x1 - w / 2, Math.max(x0 + w / 2, x)); if (cx - w / 2 < right + 10) return ''; right = cx + w / 2; return `<text x="${cx.toFixed(1)}" y="${y}" text-anchor="middle">${esc(s)}</text>`; }).join(''); };
```

**C5 Balken-Pfade** (diagramme-11). Neu nach C4:
```js
/* Balken: an der Nulllinie gerade, nur das Wertende gerundet (Radius höchstens 3 px, halbe Breite bzw. Länge) */
const vbarPath = (x, w, yz, yv, r = 3) => { const f = n => +n.toFixed(2), h = Math.abs(yv - yz), rr = Math.min(r, w / 2, h); if (rr < 0.5) return `M${f(x)},${f(yz)}V${f(yv)}H${f(x + w)}V${f(yz)}Z`; const up = yv < yz, s = up ? 1 : 0, d = up ? rr : -rr; return `M${f(x)},${f(yz)}V${f(yv + d)}A${f(rr)},${f(rr)} 0 0 ${s} ${f(x + rr)},${f(yv)}H${f(x + w - rr)}A${f(rr)},${f(rr)} 0 0 ${s} ${f(x + w)},${f(yv + d)}V${f(yz)}Z`; };
const hbarPath = (y, h, xz, xv, r = 3) => { const f = n => +n.toFixed(2), w = Math.abs(xv - xz), rr = Math.min(r, h / 2, w); if (rr < 0.5) return `M${f(xz)},${f(y)}H${f(xv)}V${f(y + h)}H${f(xz)}Z`; const right = xv > xz, s = right ? 1 : 0, d = right ? -rr : rr; return `M${f(xz)},${f(y)}H${f(xv + d)}A${f(rr)},${f(rr)} 0 0 ${s} ${f(xv)},${f(y + rr)}V${f(y + h - rr)}A${f(rr)},${f(rr)} 0 0 ${s} ${f(xv + d)},${f(y + h)}H${f(xz)}Z`; };
```
- Z. 464 `root.UI = { … }` um `vbarPath, hbarPath, xLabels, fitRadars` ergänzen.
- Aufrufmuster: `<path class="br${neg ? ' dn' : ''}" d="${vbarPath(x, bw, yNull, yWert)}" fill="…" fill-opacity="…" data-tip="…"/>`. Die Mindestlänge (A-10) wird vorher an `yWert` bzw. `xWert` geklemmt.

**C6 Einzug für Pfad-Balken und gestrichelte Linien** (diagramme-11, bereich_training-28)
- Z. 249: in der Schleife über `path, polyline, polygon` die Abbruchbedingung um `|| el.classList.contains('br')` ergänzen. Direkt danach einfügen: `if (el.hasAttribute('stroke-dasharray')) { el.classList.add('ar'); return; } /* gestrichelte Linien blenden ein; ch-draw würde ihr Strichmuster überschreiben */`
- Z. 253: nur `svg.querySelectorAll('rect.br')` → `svg.querySelectorAll('.br')`. Den Rest der Zeile regelt Bewegung 3.6 (K20).

**C7 Name für Screenreader** (barrierefreiheit-19)
- Z. 232 in `drawCharts`: direkt nach `drawers[k] && drawers[k](el, data, W, H);` `nameChart(el);` aufrufen.
- neue Funktion nach `drawCharts`:
  ```js
  /* Name für Screenreader: data-label am .chart oder der Kartentitel (beim Zeichnen schon übersetzt); ohne Namen ausgeblendet */
  function nameChart(el) { const svg = el.querySelector('svg'); if (!svg) return; const card = el.closest('.card'), head = card && card.querySelector('.card-title'); const t = el.dataset.label || (head ? head.textContent.trim() : ''); if (t) { svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', t); } else svg.setAttribute('aria-hidden', 'true'); }
  ```
  `drawCharts` schreibt das SVG bei jeder Größenänderung neu, deshalb wird der Name nach jedem Zeichnen gesetzt. Zur Erweiterung durch bereich_statistik-33 siehe K21.

**C8 `hoverLine` mit Bandskala** (diagramme-18)
- Z. 234 Signatur → `function hoverLine(el, svg, pts, xf, yf, tipFn, color, band)`.
- Z. 235 in `show`: `const i = band ? C.clamp(Math.floor((cx - r.left) / r.width * pts.length), 0, pts.length - 1) : C.clamp(Math.round((cx - r.left) / r.width * (pts.length - 1)), 0, pts.length - 1);`

### 3.4 `web/js/ui.js` – Zeichner

**C9 `drawers.pnl`** (diagramme-18, diagramme-17, diagramme-11)
- Z. 267 → `const x = showBars ? (i => ml + (i + 0.5) * iw / n) : (i => n === 1 ? ml + iw / 2 : ml + i / (n - 1) * iw);`
- Z. 271 `const gp = gid(), gn = gid(), cp = gid(), cn = gid();` → `const cp = gid(), cn = gid();`
- Z. 275–276: beide `<linearGradient>` löschen. Die `clipPath` in Z. 277 bleiben.
- Z. 280: `<rect … rx="2" class="br…" …/>` →
  ```js
  `<path class="br${p.pnl >= 0 ? '' : ' dn'}" d="${vbarPath(x(i) - bw / 2, bw, y(0), p.pnl >= 0 ? Math.min(y(p.pnl), y(0) - 1.5) : Math.max(y(p.pnl), y(0) + 1.5))}" fill="var(--${p.pnl >= 0 ? 'profit' : 'loss'})" fill-opacity=".55"/>`
  ```
- Z. 281 → ``${showBars ? '' : `<path class="ar" d="${area}" fill="var(--profit)" fill-opacity=".12" clip-path="url(#${cp})"/><path class="ar" d="${area}" fill="var(--loss)" fill-opacity=".16" clip-path="url(#${cn})"/>`}``
- Z. 286: an `hoverLine(…)` als letztes Argument `, showBars` anhängen.

**C10 `drawers.equity`** (diagramme-17; ungenutzt, nur der Einheitlichkeit halber)
- Z. 295: `<defs><linearGradient …></defs>` löschen.
- den Flächenpfad `fill="url(#${g})"` → `fill="${col}" fill-opacity="${last >= 0 ? .12 : .16}"`
- `const g = gid()` in Z. 293 streichen.

**C11 `drawers.line` (Kontostand)** (diagramme-15, bereich_dashboard-37, bereich_dashboard-39, diagramme-16)
- Z. 305: Zweig für `n > 1` → `smooth(pts.map((p, i) => [x(i), y(p.v)]))`. Der Zweig für `n === 1` bleibt.
- Z. 306 → `const last = pts[n - 1].v; const colOf = v => base == null ? (d.color || 'var(--text)') : v >= base ? 'var(--profit)' : 'var(--loss)'; const yb = base != null ? y(base) : null; const cp = gid(), cn = gid();` (`xt` wird nicht benutzt und entfällt.)
- Z. 307–311 SVG-Inhalt:
  ```js
  `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${base != null ? `<defs><clipPath id="${cp}"><rect x="0" y="0" width="${W}" height="${Math.max(0, yb)}"/></clipPath><clipPath id="${cn}"><rect x="0" y="${yb}" width="${W}" height="${Math.max(0, H - yb)}"/></clipPath></defs>` : ''}${axisLeft(ticks, y, ml, W, mr, fmt.axisCur)}
   ${base != null ? `<line x1="${ml}" x2="${W - mr}" y1="${yb}" y2="${yb}" stroke="var(--muted)" stroke-width="1" stroke-dasharray="4 3"/>${(() => { const right = Math.abs(y(last) - yb) > 20, ty = yb - 6 < mt + 10 ? yb + 14 : yb - 6; return `<text class="lbl" x="${right ? W - mr : ml + 4}" y="${ty}" text-anchor="${right ? 'end' : 'start'}">Startkapital ${fmt.axisCur(base)}</text>`; })()}` : ''}
   ${base != null ? `<path d="${line}" fill="none" stroke="var(--profit)" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" clip-path="url(#${cp})"/><path d="${line}" fill="none" stroke="var(--loss)" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" clip-path="url(#${cn})"/>` : `<path d="${line}" fill="none" stroke="${colOf(last)}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>`}
   <circle cx="${x(n - 1)}" cy="${y(last)}" r="4" fill="${colOf(last)}" stroke="var(--surface)" stroke-width="2"/>
   ${dateAxis(n, x, i => pts[i].date, ml, W, mr, H)}
   <g class="hover"><line y1="${mt}" y2="${H - mb}" stroke="var(--text-2)" stroke-opacity=".5"/><circle r="4.5" stroke="var(--surface)" stroke-width="2"/></g><rect class="hit" x="${ml}" y="0" width="${iw}" height="${H}" fill="transparent"/></svg>`
  ```
- Z. 312: `hoverLine(…)` um das Argument `i => colOf(pts[i].v)` für `color` ergänzen.

**C12 `drawers.spark`** (bereich_notebook_news-19, diagramme-17)

Z. 316–319 ersetzen. Der Rumpf nach der Leer-Prüfung:
```js
const pts = [0, ...vals]; const mn = Math.min(0, ...pts), mx = Math.max(0, ...pts);
const x = i => 4 + i / (pts.length - 1) * (W - 8), y = v => 6 + (mx - v) / (mx - mn || 1) * (H - 12);
const last = pts[pts.length - 1], col = last >= 0 ? 'var(--profit)' : 'var(--loss)', y0 = y(0), cp = gid(), cn = gid();
const line = smooth(pts.map((v, i) => [x(i), y(v)])), area = `${line} L${x(pts.length - 1)},${y0} L${x(0)},${y0} Z`;
el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs><clipPath id="${cp}"><rect x="0" y="0" width="${W}" height="${y0}"/></clipPath><clipPath id="${cn}"><rect x="0" y="${y0}" width="${W}" height="${Math.max(0, H - y0)}"/></clipPath></defs><line class="zero" x1="4" x2="${W - 4}" y1="${y0}" y2="${y0}"/><path d="${area}" fill="var(--profit)" fill-opacity=".12" clip-path="url(#${cp})"/><path d="${area}" fill="var(--loss)" fill-opacity=".16" clip-path="url(#${cn})"/><path d="${line}" fill="none" stroke="var(--profit)" stroke-width="2" clip-path="url(#${cp})"/><path d="${line}" fill="none" stroke="var(--loss)" stroke-width="2" clip-path="url(#${cn})"/><circle cx="${x(pts.length - 1)}" cy="${y(last)}" r="3" fill="${col}"/></svg>`;
```
Wirkt auf notebook.js:106, day.js:14, trades.js:26 und trades.js:54.

**C13 `drawers.vbars`** (diagramme-9, typografie-29, hierarchie-50 Achse, bereich_statistik-35, diagramme-11, diagramme-12)

Z. 323–327 ersetzen. Der Rumpf nach der Leer-Prüfung:
```js
const perTrade = d.metric === 'expectancy'; const vals = groups.map(g => g.s.n ? (perTrade ? g.s.expectancy : g.s.total) : 0);
const ticks = niceTicks(Math.min(0, ...vals), Math.max(0, ...vals), 3); const y0 = Math.min(ticks[0], ...vals, 0), y1 = Math.max(ticks[ticks.length - 1], ...vals, 0);
const ml = axisWidth(ticks.map(fmt.axisCur)), mr = 12, mt = 12, mb = 26;
const y = v => mt + (y1 - v) / (y1 - y0 || 1) * (H - mt - mb); const gap = (W - ml - mr) / groups.length, bw = Math.min(44, gap * 0.62);
const name = g => String(g.label || g.key); const step = Math.max(1, Math.ceil((Math.max(...groups.map(g => name(g).length)) * 6.6 + 8) / gap));
el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${axisLeft(ticks, y, ml, W, mr, fmt.axisCur)}<line class="zero" x1="${ml}" x2="${W - mr}" y1="${y(0)}" y2="${y(0)}"/>${groups.map((g, i) => { const v = vals[i], cx = ml + i * gap + gap / 2;
  const lab = i % step === 0 ? `<text x="${cx}" y="${H - 7}" text-anchor="middle"${g.s.n ? '' : ' style="fill:var(--faint)"'}>${esc(name(g))}</text>` : '';
  if (!g.s.n) return `<rect x="${ml + i * gap}" y="${mt}" width="${gap}" height="${H - mt - mb}" fill="transparent" data-tip="<b>${esc(name(g))}</b>: Keine Trades"></rect>${lab}`;
  return `<path class="br${v >= 0 ? '' : ' dn'}" d="${vbarPath(cx - bw / 2, bw, y(0), v >= 0 ? Math.min(y(v), y(0) - 2) : Math.max(y(v), y(0) + 2))}" fill="var(--${v >= 0 ? 'profit' : 'loss'})" fill-opacity=".85" data-tip="…bisheriger Text unverändert…"></path>${lab}`; }).join('')}</svg>`;
```
Der Tooltip-Text bleibt wörtlich wie bisher. „Win-Rate“ darin ändert Wording/wording-3.

**C14 `drawers.hbars`** (diagramme-1, Ergänzung bereich_statistik-4, bereich_statistik-37, diagramme-9, typografie-29, bereich_statistik-35, diagramme-11, diagramme-12)

Z. 331–335 ersetzen:
```js
const perTrade = d.metric === 'expectancy'; const vals = groups.map(g => g.s.n ? (perTrade ? g.s.expectancy : g.s.total) : 0); const ml = Math.min(130, W * 0.3), mr = 44, mt = 6, mb = 24;
const ticks = niceTicks(Math.min(0, ...vals), Math.max(0, ...vals), W - ml - mr < 260 ? 3 : 4); const x0 = Math.min(ticks[0], ...vals, 0), x1 = Math.max(ticks[ticks.length - 1], ...vals, 0);
const x = v => ml + (v - x0) / (x1 - x0 || 1) * (W - ml - mr); const rowH = (H - mt - mb) / groups.length, bh = Math.min(20, rowH * 0.62);
const maxCh = Math.max(6, Math.floor((ml - 14) / 6.8)); const cut = s => s.length > maxCh ? s.slice(0, maxCh - 1) + '…' : s;
el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><g class="grid">${ticks.map(t => `<line x1="${x(t)}" x2="${x(t)}" y1="${mt}" y2="${H - mb}"/>`).join('')}${xLabels(ticks.map(t => ({ x: x(t), label: fmt.axisCur(t) })), ml, W - mr, H - 7)}</g><line class="zero" x1="${x(0)}" x2="${x(0)}" y1="${mt}" y2="${H - mb}"/>${groups.map((g, i) => { const v = vals[i], cy = mt + i * rowH + rowH / 2, full = String(g.label || g.key), lab = cut(full);
  const label = `<text x="${ml - 10}" y="${cy + 4}" text-anchor="end" style="fill:var(--${!g.s.n ? 'faint' : /^Ohne /.test(full) ? 'muted' : 'text-2'});font-size:12px"${lab !== full ? ` data-tip="${esc(full)}"` : ''}>${esc(lab)}</text>`;
  if (!g.s.n) return `${label}<rect x="0" y="${cy - rowH / 2}" width="${W - mr}" height="${rowH}" fill="transparent" data-tip="<b>${esc(full)}</b>: Keine Trades"></rect>`;
  return `${label}<path class="br" d="${hbarPath(cy - bh / 2, bh, x(0), v >= 0 ? Math.max(x(v), x(0) + 2) : Math.min(x(v), x(0) - 2))}" fill="var(--${v >= 0 ? 'profit' : 'loss'})" fill-opacity=".85" data-tip="…bisheriger Text unverändert…"></path><text x="${W - 4}" y="${cy + 3.5}" text-anchor="end">${g.s.n}×</text>`; }).join('')}</svg>`;
```

**C15 `drawers.rolling`** (diagramme-9, farbe_kontrast-37, Rolling-Teil von diagramme-17)
- Z. 339: `const ml = 8, mr = 56, mt = 16, mb = 26;` aus der Leerzweig-Zeile herausnehmen und **nach** der Tick-Berechnung (Z. 340) als `const ml = axisWidth(ticks.map(t => fmt.r(t))), mr = 12, mt = 16, mb = 26;` setzen. Die Funktion `x` steht danach.
- Z. 342:
  - `<defs>…linearGradient…</defs>` löschen
  - `<g class="grid">…W - mr + 8…</g>` → `${axisLeft(ticks, y, ml, W, mr, t => fmt.r(t))}`
  - Mittelwert-Text → `<text class="lbl" x="${W - mr - 4}" y="${y(e.mean) - 5}" text-anchor="end">Gesamt ${fmt.r(e.mean)}</text>`
  - Flächenpfad `<path d="${line} L…Z" fill="url(#${g})"/>` löschen
  - Linie `stroke="var(--accent)"` → `stroke="var(--text)"`
  - Hover-Kreis `fill="var(--accent)"` → `fill="var(--text)"`
- `const g = gid()` in Z. 341 streichen. Die Mittelwert-Linie in `--profit`/`--loss` bleibt.

**C16 `drawers.mc`** (diagramme-9, typografie-29, bereich_statistik-44, diagramme-21)
- Z. 347: `const ml = 8, mr = 58, mt = 12, mb = 26;` aus der Leerzweig-Zeile streichen.
- Z. 348: in `niceTicks(Math.min(...all, ruinY), Math.max(...all), 4)` den Median einbeziehen: `Math.min(...all, ...mc.median, ruinY)` und `Math.max(...all, ...mc.median)`. Dasselbe gilt für `y0`/`y1`. Danach `const ml = axisWidth(ticks.map(fmt.axisCur)), mr = 12, mt = 12, mb = 26;` setzen.
- Z. 350:
  - `<g class="grid">…curShort(t)…</g>` → `${axisLeft(ticks, y, ml, W, mr, fmt.axisCur)}`
  - Ruin-Text → `<text class="lbl" x="${ml + 2}" y="${y(ruinY) - 5}" style="fill:var(--loss)">Ruin-Schwelle ${fmt.axisCur(ruinY)}</text>`
  - nach den Pfad-Polylines neu:
    ```js
    `<polyline fill="none" stroke="var(--text)" stroke-width="2" stroke-linejoin="round" points="${mc.median.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')}"/><text class="lbl" x="${x(mc.horizon) - 4}" y="${y(mc.median[mc.horizon]) - 6}" text-anchor="end" style="fill:var(--text-2)">Median ${fmt.axisCur(mc.median[mc.horizon])}</text>`
    ```
  - Achsentext ``${i} Trades`` → ``${i === mc.horizon ? `${i} Trades` : i}``
- Pfadfarbe laut Farbe/bereich_statistik-25: `stroke="var(--text-2)" stroke-opacity=".22"`. Wird sie nicht dort umgesetzt, dann hier.

**C17 `drawers.hist`** (bereich_statistik-44, Ergänzung diagramme-22, diagramme-11)

Z. 353–354 ersetzen. Der Rumpf nach der Leer-Prüfung:
```js
const n = mc.hist.length, max = Math.max(1, ...mc.hist.map(b => b.n)), mb = 20, mt = 18, gap = W / n, maxP = mc.hist[n - 1].hi, xp = p => p / maxP * W;
const tk = niceTicks(0, maxP, 4).filter(t => t <= maxP + 1e-9); const rx = mc.ruinPct <= maxP ? xp(mc.ruinPct) : null;
el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${mc.hist.map((b, i) => { if (!b.n) return ''; const h = b.n / max * (H - mb - mt); return `<path class="br" d="${vbarPath(i * gap + 1, Math.max(1, gap - 2), H - mb, H - mb - h)}" fill="…Farbe laut bereich_statistik-25…" fill-opacity="…" data-tip="Drawdown ${fmt.pct(b.lo, 0)} bis ${fmt.pct(b.hi, 0)}: ${b.n} Durchläufe"></path>`; }).join('')}
  ${rx != null ? `<line x1="${rx}" x2="${rx}" y1="4" y2="${H - mb}" stroke="var(--loss)" stroke-opacity=".8" stroke-dasharray="4 3"/><text class="lbl" x="${rx > 90 ? rx - 4 : rx + 4}" y="12" text-anchor="${rx > 90 ? 'end' : 'start'}" style="fill:var(--loss)">Ruin ab ${fmt.pct(mc.ruinPct, 0)}</text>` : ''}
  ${tk.map((t, j) => `<text x="${xp(t)}" y="${H - 5}" text-anchor="${j === 0 ? 'start' : t >= maxP * 0.97 ? 'end' : 'middle'}">${fmt.pct(t, 0)}</text>`).join('')}</svg>`;
```
Die Farbe der Fächer kommt aus der Farb-Spezifikation: `b.lo >= mc.ruinPct` → `var(--loss)` .9, sonst `var(--text-2)` .45.

**C18 `drawers.weeks`** (bereich_training-15, responsiv-34, diagramme-25, Ergänzung bereich_training-16, diagramme-11)

Z. 358–360 ersetzen. Der Rumpf nach der Leer-Prüfung:
```js
const mb = 18, mt = 16, gap = W / w.length, bw = Math.min(28, gap * 0.6); /* bei wenig Platz kurze Daten (03.08.) und nur jede n-te Woche beschriftet, die jüngste immer */
const lbl = d0 => gap < 66 ? new Date(d0).toLocaleDateString(LOC(), { day: '2-digit', month: '2-digit' }) : fmt.date(d0);
const every = Math.max(1, Math.ceil(44 / gap)), showL = i => (w.length - 1 - i) % every === 0, showV = gap >= 22;
el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${w.map((p, i) => { const h = Math.max(2, p.score / 100 * (H - mb - mt)), cx = i * gap + gap / 2; return `<path class="br" d="${vbarPath(cx - bw / 2, bw, H - mb, H - mb - h)}" fill="${scoreColor(p.score)}" fill-opacity=".85" data-tip="Woche ab ${fmt.date(p.week)}: Score ${Math.round(p.score)} (${p.n} Trades)"></path>${showV ? `<text class="bv" x="${cx}" y="${H - mb - h - 5}" text-anchor="middle">${Math.round(p.score)}</text>` : ''}${showL(i) ? `<text x="${cx}" y="${H - 4}" text-anchor="middle">${lbl(p.week)}</text>` : ''}`; }).join('')}</svg>`;
```

**C19 Radar-Schrift** (responsiv-11; nach Abstände/responsiv-10 umsetzen)
- Z. 384: am `<svg class="radar-svg" …>` das Attribut `data-vb="${-pad} 0 ${size + 2 * pad} ${size}"` ergänzen.
- `fitRadars` (Z. 388): am Anfang jeder svg-Schleife, **vor** dem Zeilenumbruch und vor `getBBox`:
  ```js
  const vb0 = svg.dataset.vb; if (vb0) { const w0 = +vb0.split(' ')[2]; svg.setAttribute('viewBox', vb0); svg.style.maxWidth = w0 + 'px'; const rw = svg.getBoundingClientRect().width; const k = rw ? Math.min(Math.max(w0 / rw, 1), 1.4) : 1; svg.querySelectorAll('text').forEach(t => { t.style.fontSize = (11 * k).toFixed(1) + 'px'; }); }
  ```
  Weil die Ausgangs-viewBox jedes Mal zurückgesetzt wird, schaukelt sich die Weitung nicht auf. Kein ResizeObserver.

### 3.5 `web/js/app.js`

**D1** (responsiv-11) Z. 301: im Resize-Timeout `U.drawCharts(document.getElementById('main'))` → `{ U.drawCharts(document.getElementById('main')); U.fitRadars(); }`.

### 3.6 `web/js/widgets.js`

**E1 Mehrlinien-Zeichner als Spuren** (diagramme-6, bereich_training-28, diagramme-11, bereich_statistik-35)
- Z. 54 Kommentar → `/* Mehrere Linien oder Balken; je Einheit eine Spur übereinander (nie zwei y-Achsen auf einer Fläche) */`
- Z. 57–61 ersetzen durch:
  ```js
  const units = [...new Set(series.map(s => s.unit))].slice(0, 3); const SHARE = [[1], [.62, .38], [.5, .25, .25]][units.length - 1]; const GAP = 14, mt = 12, mb = 30, ih = H - mt - mb - GAP * (units.length - 1);
  const lane = {}; let top = mt;
  units.forEach((u, ui) => { const h = ih * SHARE[ui]; const vals = series.filter(s => s.unit === u).flatMap(s => pts.map(p => p.v[s.key]).concat(s.type === 'bar' ? [0] : [])).filter(v => v != null && isFinite(v)); if (!vals.length) vals.push(0); const lo = Math.min(...vals), hi = Math.max(...vals); const ticks = U.niceTicks(lo, hi === lo ? lo + 1 : hi, h < 100 ? 3 : 5); lane[u] = { top, h, ticks, y0: Math.min(ticks[0], lo), y1: Math.max(ticks[ticks.length - 1], hi) }; top += h + GAP; });
  const ml = Math.max(...units.map(u => U.axisWidth(lane[u].ticks.map(t => unitFmt(u, t, true))))), mr = 12; const iw = W - ml - mr;
  const n = pts.length; const x = i => n === 1 ? ml + iw / 2 : ml + i / (n - 1) * iw; const y = (u, v) => { const L = lane[u]; return L.top + (L.y1 - v) / (L.y1 - L.y0 || 1) * L.h; };
  ```
- Z. 66 den Ausdruck `${U.axisLeft(scale[u0].ticks, …)}` hinter `<svg …>` und die ganze Z. 67 (rechte Achse) ersetzen durch `${units.map(u => U.axisLeft(lane[u].ticks, v => y(u, v), ml, W, mr, v => unitFmt(u, v, true)) + (series.some(s => s.unit === u && s.type === 'bar') && lane[u].y0 < 0 && lane[u].y1 > 0 ? `<line class="zero" x1="${ml}" x2="${W - mr}" y1="${y(u, 0)}" y2="${y(u, 0)}"/>` : '')).join('')}`
- Z. 68 Balken: `scale[s.unit]` → `lane[s.unit]`. `<rect … rx="2" class="br…" fill-opacity=".8"/>` → `<path class="br${v >= 0 ? '' : ' dn'}" d="${U.vbarPath(x(i) - bw * bars.length / 2 + bi * bw, bw, zero, v >= 0 ? Math.min(yy, zero - 1) : Math.max(yy, zero + 1))}" fill="${s.color}" fill-opacity=".85"/>`
- Z. 69 Linie: nach `stroke-linecap="round"` `${s.dash ? ` stroke-dasharray="${s.dash}"` : ''}` einfügen. Punkte nur bei `dots && !s.dash`.
- Z. 72 `bindHover` bleibt.

**E2 Punktdiagramm** (bereich_dashboard-35, Ergänzung diagramme-19, bereich_dashboard-36, Ergänzung diagramme-20)
- Z. 74 Kommentar `Beschriftungen unten schräg` → `Beschriftungen unten waagerecht`.
- Z. 78 `mb = 50` → `mb = 30`.
- Z. 83 → `${U.xLabels(xt.map(t => ({ x: x(t.v), label: t.label })), ml, W - mr, H - 8)}`
- Z. 84 `'info'` → `'be'`.

**E3 Säulen je Tag** (diagramme-11) Z. 93: `<rect …rx="2" class="br…" … fill-opacity=".85" data-tip="…">` → `<path class="br${p.pnl >= 0 ? '' : ' dn'}" d="${U.vbarPath(x(i) - bw / 2, bw, y(0), p.pnl >= 0 ? Math.min(y(p.pnl), y(0) - 1.5) : Math.max(y(p.pnl), y(0) + 1.5))}" fill="…unverändert…" fill-opacity=".85" data-tip="…unverändert…"></path>`.

**E4 Drawdown** (bereich_dashboard-39, diagramme-16, diagramme-17)
- Z. 102 Zweig für `n > 1` → `U.smooth(pts.map((p, i) => [x(i), y(p.dd)]))`.
- Z. 103: `<defs>…</defs>` löschen. Die Fläche `fill="url(#${g})"` → `fill="var(--loss)" fill-opacity=".16"`. `const g = gid()` in Z. 101 streichen.

**E5 Fallback-Vorschauen** (diagramme-7, bereich_dashboard-36)
- Z. 149 `PV.scatter`: `stroke-dasharray="3 3"` streichen.
- Z. 148 `PV.line`: dritte Linie `stroke="var(--be)"` → `stroke="var(--text-2)"`. `--be` ist nie Serienfarbe (A-8).

**E6 Achsenstriche Uhrzeit/Haltedauer** (bereich_dashboard-35)
- Z. 238 `const k = 9; const ticks = Array.from(…)` →
  ```js
  const st = [15, 30, 60, 120, 180, 240, 360].find(s => Math.floor(x1 / s) - Math.ceil(x0 / s) + 1 <= 6) || 360; const ticks = []; for (let m = Math.ceil(x0 / st) * st; m <= x1; m += st) ticks.push({ v: m, label: hhmm(m) });
  ```
- Z. 246 `const k = 11; const ticks = Array.from(…)` →
  ```js
  let ticks = HOLD_TICKS.map(([m, l]) => ({ v: Math.log10(m * 60 + 1), label: l })).filter(t => t.v >= x0 && t.v <= x1); if (ticks.length < 2) ticks = [x0, (x0 + x1) / 2, x1].map(v => { const min = (10 ** v - 1) / 60; return { v, label: min < 1 ? `${Math.round(min * 60)} s` : fmt.dur(min) }; });
  ```
  Der Tooltip (Z. 244) behält `durLabel`.

**E7 Report-Farben** (farbe_kontrast-38)
- Z. 211 → `const REPORT_COLORS = ['#2f80d0', '#b4549f', '#c0702f']; /* Blau, Magenta, Kupfer: weder Gewinn, Verlust, Break-even noch Warnung; dataviz-Validator hell und dunkel bestanden */ const REPORT_OLD = { '#3d6bff': '#2f80d0', '#f5a53a': '#b4549f', '#4fd1a5': '#c0702f' };`
- Z. 216 nach dem bestehenden `.map(…)`, vor `.filter(…)`, einfügen: `.map(x => { const nc = REPORT_OLD[String(x.color).toLowerCase()]; return nc ? Object.assign({}, x, { color: nc }) : x; })`

**E8 Widget-Registry: Namen, Texte, Legenden, Serienfarben**
- Z. 228 (diagramme-13): `name: 'Kumulierter Tages-P&L'` → `name: 'Kumulierter Netto-P&L'`.
- Z. 230–231 (bereich_dashboard-36, diagramme-6, diagramme-14):
  - `info` → `'Laufende Werte bis zum jeweiligen Handelstag: oben Ø Gewinn und Ø Verlust, unten die Trefferquote.'`
  - Serie winRate `color: 'var(--be)'` → `color: 'var(--text-2)'`
  - Kartenrumpf → `<div class="chart-legend"><span><i style="background:var(--profit)"></i>Ø Gewinn</span><span><i style="background:var(--loss)"></i>Ø Verlust</span><span><i style="background:var(--text-2)"></i>Trefferquote</span></div><div class="chart h280" data-chart="lines" data-id="dash-verlauf"></div>`
- Z. 232 und Z. 241 (bereich_dashboard-36): im `info` den Satz `Blau sind Break-even-Trades.` → `Break-even-Trades liegen auf der Nulllinie.`
- Z. 251 (diagramme-18): `desc` → `'Säulen für den Tages-P&L und eine Linie für den kumulierten P&L in einem Diagramm.'`, `info` → `'Säulen: Netto-Ergebnis je Handelstag. Linie: kumuliertes Ergebnis im Zeitraum.'`
- Z. 262 (diagramme-15, diagramme-14): `<div class="legend top">…</div>` vor dem `.chart` löschen.
- Z. 299 (diagramme-14): ``${panel}<div class="chart h280" …></div><div class="legend rep">${…}</div>`` → ``${panel}<div class="chart-legend">${series.map(s => `<span><i style="background:${s.color}"></i>${esc(s.label)}</span>`).join('')}</div><div class="chart h280" data-chart="lines" data-id="dash-report"></div>``
- Z. 336 (bereich_training-28, Ergänzung farbe_kontrast-35): `series` → `[{ key: 'real', label: 'Echt', unit: 'cur', color: 'var(--text)' }, { key: 'shadow', label: 'Schatten-Ich', unit: 'cur', color: 'var(--text-2)', dash: '5 4' }]`

### 3.7 `web/js/screens/stats.js`

**G1 Kopfkarte** (diagramme-13, hierarchie-14, zustaende-5, bereich_statistik-48)

Z. 12–14 →
```js
const days = C.dailyAggregation(list);
let top = ''; if (closed.length) { const id = 'stats-top'; U.chartData[id] = { days, bars: false, dots: days.length <= 45 }; top = U.card('Kumulierter Netto-P&L', `<div class="chart h240" data-chart="pnl" data-id="${id}"></div>`); }
```
`const r = App.range();` entfällt. Verschiebt Aufbau/aufbau-19 die Karte in „Übersicht“, gilt dort derselbe Inhalt.

**G2** (diagramme-13, hierarchie-14) Z. 20 `function fillDays…` löschen.

**G3 Zähler neutral bzw. nur > 0 gefärbt** (hierarchie-50, bereich_notebook_news-18/K24)
- Z. 32: `<td class="r pos">${d.wins}</td><td class="r neg">${d.losses}</td>` → `<td class="r">${d.wins}</td><td class="r">${d.losses}</td>`
- Z. 31: `<span class="pos">${ds.winDays}</span> / <span class="neg">${ds.lossDays}</span>` → `<span class="${ds.winDays ? 'pos' : ''}">${ds.winDays}</span> / <span class="${ds.lossDays ? 'neg' : ''}">${ds.lossDays}</span>`

**G4** (diagramme-12) Z. 34 `groupTable`: `${groups.map(g => …` → `${groups.filter(g => g.s.n > 0).map(g => …`

**G5 Sortierung nach gezeigtem Wert** (bereich_statistik-37)
- vor `function tabSetups` neu: `const byExp = gs => gs.slice().sort((a, b) => (/^Ohne /.test(a.key) - /^Ohne /.test(b.key)) || b.s.expectancy - a.s.expectancy);`
- Z. 38 `{ groups: setups, metric: 'expectancy' }` → `{ groups: byExp(setups), metric: 'expectancy' }`
- Z. 49 `{ groups: emo, metric: 'expectancy' }` → `{ groups: byExp(emo), metric: 'expectancy' }`

Die Tabelle „Setups“ und `t-hold` (geordnete Fächer) bleiben unsortiert.

### 3.8 `web/js/screens/progress.js`

**H1 Ring** (bereich_training-7, Ergänzung diagramme-26)

Z. 6 `ringArc(rate, size = 116, lw = 9)` → `ringArc(rate, size = 64, lw = 6)`. Den `<circle class="arc" …/>` nur ausgeben, wenn `rate > 0`, und um `style="stroke:${U.scoreColor(rate * 100)}"` ergänzen:
```js
${rate > 0 ? `<circle class="arc" style="stroke:${U.scoreColor(rate * 100)}" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${lw}" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c}" data-target="${off.toFixed(2)}"/>` : ''}
```
`mount()` (Z. 41–43) kommt mit leerer Liste aus.

**H2 Heatmap-Name** (barrierefreiheit-19) Z. 29: `<div class="activity" data-keep-scroll …>` → `<div class="activity" role="img" aria-label="Trading-Aktivität" data-keep-scroll …>`

**H3 Info-Text** (farbe_kontrast-21) Z. 71: `Je mehr Trades, desto kräftiger das Grün.` → `Je mehr Trades, desto kräftiger das Kästchen.`

### 3.9 `web/js/screens/shadow.js`

**I1 Ranking** (bereich_training-30) Z. 76–80 `rankingRows`:
```js
function rankingRows(ranking) {
  if (!ranking.length) return U.empty('shield', 'Keine Regel aktiv', '');
  const hit = ranking.filter(x => x.n > 0), clean = ranking.filter(x => !x.n); const max = Math.max(0, ...hit.map(x => Math.abs(x.cost)));
  const bars = hit.length ? `<div class="shadow-rank">${hit.map(x => U.barRow(x.label, x.cost, max, `${U.pnl(-x.cost)} <span class="muted">· ${x.n}×</span>`, x.cost > C.EPS ? 'var(--loss)' : x.cost < -C.EPS ? 'var(--profit)' : 'var(--surface-3)')).join('')}</div>` : U.empty('shield', 'Keine Verstöße', 'Im Zeitraum wurde keine Regel gebrochen.');
  return bars + (clean.length ? `<div class="small muted shadow-clean">Ohne Verstöße: ${clean.map(x => esc(x.label)).join(', ')}</div>` : '');
}
```
Die Engine liefert Regeln ohne Verstoß weiter mit 0 (tests/shadow.test.mjs:163). Gefiltert wird nur in der Anzeige.

**I2 Diagramm und Legende** (bereich_training-28, diagramme-14)
- Z. 117 `series` wie E8 (Z. 336).
- Z. 118: `<div class="legend top">…</div>` → `<div class="chart-legend"><span><i style="background:var(--text)"></i>Echt</span><span><i class="dash"></i>Schatten-Ich</span></div>`

### 3.10 `web/js/screens/prop.js`

**J1 Puffer über Limit** (diagramme-39)

Z. 93 `bar` →
```js
const bar = (lbl, x) => { if (!x) return ''; const over = x.limit > 0 && x.remaining > x.limit + C.EPS; const tip = over && x.floor != null ? ` data-tip="${esc(`${x.locked ? 'Boden fest bei' : 'Boden bei'} ${money(a, x.floor)}`)}"` : ''; return `<div class="prop-bar"><div class="bl"><span>${lbl} übrig</span><b${tip}>${money(a, x.remaining)} <span class="muted">${over ? 'über dem Boden' : `von ${money(a, x.limit)}`}</span></b></div><div class="track"><i style="width:${x.limit > 0 ? Math.min(100, x.remaining / x.limit * 100).toFixed(1) : 0}%;background:${x.limit > 0 ? col(x.remaining / x.limit) : 'var(--surface-3)'}"></i></div></div>`; };
```

**J2 Legende** (diagramme-14) Z. 257: die `<div class="legend">…</div>` hinter dem `.chart` → `<div class="chart-legend">…</div>` vor dem `.chart` (Inhalt gleich).

### 3.11 `web/js/screens/affiliate.js`

**K1 Neutrale Balken** (bereich_konto-7, diagramme-11; bereich_konto-55 über C1)

Z. 47: `<rect … height="${Math.max(m.v > 0 ? 2 : 0, y(0) - y(m.v))…}" rx="4" fill="var(--accent)" fill-opacity=".85" data-tip="…">` → `<path class="br" d="${U.vbarPath(x(i) - bw / 2, bw, y(0), m.v > 0 ? Math.min(y(m.v), y(0) - 2) : y(0))}" fill="var(--text-2)" fill-opacity=".45" data-tip="…unverändert…"></path>`. Das gilt für beide Ansichten. Kein Hover-Stil (K22).

### 3.12 `web/js/screens/notebook.js`, `day.js`, `trades.js`

**L1 Notiz-Statistik** (bereich_notebook_news-18) `statsHTML` Z. 102–107. Nach `const rOf = …` neu:
```js
const cnt = (v, k) => `<span class="${v ? k : ''}">${v}</span>`;
const head = one ? 'Trade-Details' : `${n.type === 'trade' ? 'Trade-Statistik' : 'Tagesstatistik'} · ${trades.length} Trade${trades.length === 1 ? '' : 's'}`;
const body = one
  ? `<div class="trade-facts">${U.kv('Einstieg → Ausstieg', `${fmt.price(one.entryPrice)} → ${one.exitPrice != null ? fmt.price(one.exitPrice) : '—'}`)}${U.kv('Kontrakte', fmt.num(one.quantity))}${U.kv('R-Multiple', one.r != null ? fmt.r(one.r) : '—')}${U.kv('Brutto-P&L', `<span class="${U.cls(s.gross)}">${fmt.cur(s.gross, Object.assign({ signed: true }, rOf(s.gross)))}</span>`)}${U.kv('Gebühren', fmt.cur(s.fees, rOf(s.fees)))}</div>`
  : `<div class="stats-grid${closed.length >= 3 ? '' : ' solo'}">${closed.length >= 3 ? `<div class="chart h120" data-chart="spark" data-id="${id}"></div>` : ''}<div class="kpis">…bisherige Kacheln, nur Gewinner/Verlierer als ${cnt(s.wins, 'pos')} / ${cnt(s.losses, 'neg')}…</div></div>`;
```
Rückgabe: `<div class="stats-box"><button …>${I.chev}<span>${head}</span></button>${open ? body : ''}</div>`. Geld-blind läuft weiter über `rOf`/`fmt.cur`. Die Schrift (app.css:1036) bleibt, `.stats-grid .v` und `.kv b` sind schon Onest.

**M1 Zähler** (bereich_notebook_news-18)
- day.js:14: `<span class="pos">${s.wins}</span> / <span class="neg">${s.losses}</span>` → `<span class="${s.wins ? 'pos' : ''}">${s.wins}</span> / <span class="${s.losses ? 'neg' : ''}">${s.losses}</span>`
- trades.js:54: dasselbe mit `d.wins` / `d.losses`.

### 3.13 `web/js/widgetpreviews.js` (Vorschauen = Miniaturen der echten Widgets, README Z. 75)

- **F1** (diagramme-7) Z. 18 `grid`: `line(x1, y, x2, y, G, .5, '2 2')` → `line(x1, y, x2, y, G, .5)`.
- **F2** (farbe_kontrast-38) Z. 7 `BLUE = '#3d6bff', ORANGE = '#f5a53a'` → `BLUE = '#2f80d0', ORANGE = '#b4549f'`. Der Name `ORANGE` wird zu `MAGENTA`, alle Verwendungen mitziehen.
- **F3** (diagramme-13, diagramme-17) Z. 74–75 `kum_pnl`:
  - `ttl('Kumulierter Tages-P&L')` → `ttl('Kumulierter Netto-P&L')`
  - Verlauf `pvkg` → flache Fläche über `area(pts, 70, P, .12)`, die `<defs>` entfallen
- **F4** (bereich_dashboard-36, diagramme-6, diagramme-14) Z. 76–77 `verlauf_trefferquote`:
  - Legende oben links unter dem Titel (y ≈ 22) mit `[[P,'Ø Gewinn'],[L,'Ø Verlust'],[T2,'Trefferquote']]`
  - darunter zwei Spuren: oben y 28–52 (Ø Gewinn P, Ø Verlust L; € links), unten y 58–72 (Trefferquote in T2; % links)
  - keine Beschriftung bei x = 134 (keine rechte Achse); `B` kommt nicht mehr vor
- **F5** (diagramme-18) Z. 85 `taeglich_kumuliert`: `+ area(pts, 58, P, .18)` streichen.
- **F6** (diagramme-15) Z. 94 `kontostand`:
  - `legend(…)` streichen
  - `line(28, 70, 134, 70, L, .9)` → `line(28, 70, 134, 70, F, .6, '2 1.5')` plus `tx(132, 67, 'Startkapital', 3.4, F, { a: 'end' })`
  - Linie bleibt `P`
- **F7** (diagramme-17) Z. 96 `drawdown_verlauf`: `area(pts, 22, L, .28)` → `area(pts, 22, L, .16)`.
- **F8** (diagramme-6, diagramme-14, farbe_kontrast-38) Z. 106–107 `report`:
  - keine rechte Achse (`yl([...], [...], 134)` streichen)
  - Spur oben „Trefferquote“ (BLUE) mit %-Achse links, Spur unten „Ø Gewinn“ (MAGENTA) mit €-Achse links
  - Legende oben links unter der Kopfzeile
- **F9** (bereich_dashboard-35) Haltedauer-Vorschau: `lab` → `['1 min', '', '5 min', '', '15 min', '', '1 h', '', '4 h']` (leere Einträge ohne Text). Uhrzeit-Vorschau: `xl(['09:30','11:00','12:30','14:00','15:30'], …)` → `xl(['10:00','12:00','14:00','16:00'], [44, 74, 104, 130])`.

### 3.14 `web/js/lang/{en,es,pt,hi,zh}.js`

Je Datei den alten deutschen Schlüssel durch den neuen ersetzen (sonst fällt der Text auf Deutsch zurück). Neue Schlüssel ergänzen. Englische Werte sind verbindlich, die übrigen Sprachen sinngemäß:

| Schlüssel (de) | en |
|---|---|
| Laufende Werte bis zum jeweiligen Handelstag: oben Ø Gewinn und Ø Verlust, unten die Trefferquote. | Running values up to each trading day: avg win and avg loss on top, win rate below. |
| Jeder Punkt ist ein geschlossener Trade: waagerecht die Uhrzeit (Einstieg oder Ausstieg, wählbar über das Zahnrad), senkrecht das Netto-Ergebnis. Break-even-Trades liegen auf der Nulllinie. | … Break-even trades sit on the zero line. (Rest wie bisher) |
| Jeder Punkt ist ein geschlossener Trade: waagerecht die Haltedauer (logarithmisch), senkrecht das Netto-Ergebnis. Break-even-Trades liegen auf der Nulllinie. | … Break-even trades sit on the zero line. |
| Säulen für den Tages-P&L und eine Linie für den kumulierten P&L in einem Diagramm. | Bars for daily P&L and a line for cumulative P&L in one chart. |
| Säulen: Netto-Ergebnis je Handelstag. Linie: kumuliertes Ergebnis im Zeitraum. | Bars: net result per trading day. Line: cumulative result in the period. |
| Ein Kästchen pro Tag, bis zu ein Jahr zurück. Je mehr Trades, desto kräftiger das Kästchen. Ziehen oder Pfeile zum Verschieben, Klick öffnet die Tagesansicht. | One box per day, up to a year back. The more trades, the stronger the box. Drag or use the arrows to scroll; click to open the day view. |
| Startkapital {0} | Starting capital {0} |
| Median {0} | Median {0} |
| Ruin-Schwelle {0} | Ruin threshold {0} |
| Ruin ab {0} | Ruin from {0} |
| 1 T / 3 T / 1 W | 1 d / 3 d / 1 wk |
| {0} s | {0} s |
| Keine Trades | (vorhanden) |
| Ohne Verstöße: {0} | No violations: {0} |
| Keine Verstöße | No violations |
| Im Zeitraum wurde keine Regel gebrochen. | No rule was broken in this period. |
| über dem Boden | above the floor |
| Boden bei {0} | Floor at {0} |
| Boden fest bei {0} | Floor locked at {0} |
| Trade-Details | Trade details |
| Einstieg → Ausstieg | Entry → Exit |
| R-Multiple | R multiple |

Den Schlüssel „Kumulierter Tages-P&L“ (en.js:772) und die alten Fassungen der ersetzten Sätze (en.js:48, 534, 868–871) entfernen. „Kumulierter Netto-P&L“ existiert schon (en.js:372).

### 3.15 Tests (`web/e2e/`; danach die geänderten Dateien in den Scratchpad kopieren, weil `runall.sh` dort läuft)

- **O1** dashtest.js:69 (bereich_dashboard-35) → `ok('Uhrzeit-Achse waagerecht mit vollen Zeiten', await p.$eval('.w[data-typ="perf_uhrzeit"] .chart svg', svg => { const all = [...svg.querySelectorAll('text')]; const t = all.filter(x => /^\d{2}:\d{2}$/.test(x.textContent)); return t.length >= 2 && t.every(x => /:(00|15|30|45)$/.test(x.textContent)) && !all.some(x => (x.getAttribute('transform') || '').includes('rotate(')); }));`
- **O2** dashtest.js:92 (diagramme-11): `.chart rect[rx="2"]` → `.chart .br`.
- **O3** dashtest.js:95 (diagramme-6): Name → `'Report: zwei Spuren'`, Prüfung ergänzen um `svg.querySelectorAll('.grid').length >= 2 && ![...svg.querySelectorAll('.grid text')].some(x => +x.getAttribute('x') > svg.viewBox.baseVal.width / 2)`.
- **O4** headtest.js:48 (diagramme-11): `.chart svg.enter rect.br` → `.chart svg.enter .br`. affiliatetest.js:25: `.chart[data-chart=affbars] rect` → `.chart[data-chart=affbars] .br`.
- **O5** shadowtest.js:30 (bereich_training-28) → `path` gleich 2 und `path[stroke-dasharray]` gleich 1. shadowtest.js:57 (bereich_training-30) → `const clean = await p.$eval('.shadow-clean', e => e.textContent.replace(/^[^:]*:/, '').split(',').filter(s => s.trim()).length).catch(() => 0); ok('Ranking jetzt drei Regeln', (await p.$$('.shadow-rank .bar-row')).length + clean === 3);`
- **O6** tests/core.test.mjs:57 (diagramme-21) ergänzen: `assert.equal(a.median.length, a.horizon + 1); assert.equal(a.median[a.horizon], a.final.p50);`

### 3.16 `web/README.md`

- **P1** Z. 109–111 (Statistiken) ergänzen:
  - „Kurve ‚Kumulierter Netto-P&L‘ mit einem Punkt je Handelstag wie im Dashboard, nur mit abgeschlossenen Trades“
  - „Wochentag, Uhrzeit (1-h-Fächer) und Haltedauer zeigen leere Fächer grau beschriftet“
  - „Monte Carlo mit Median-Linie“
- **P2** Z. 129/136 (Fortschritt):
  - „Aktivitäts-Heatmap in neutralen Stufen (viele Trades sind keine Bewertung)“
  - „Regeltreue-Ring 64 px in der Score-Farbe, ohne Schein, ohne Bogen bei 0“
  - „Disziplin pro Woche: Score über jeder Säule; bei wenig Platz kurze Daten und nur jede zweite (dritte, vierte) Woche beschriftet, die jüngste immer“
- **P3** Z. 187–195 (Farben/Achsen) ergänzen:
  - „Werteachsen links mit vollen Beträgen (`fmt.axisCur`, im Geld-blind-Modus R), Bereich auf runde Striche erweitert, keine gedrehten oder überlappenden Beschriftungen“
  - „Gitter durchgezogen, gestrichelt nur Bezugslinien und die Schatten-Ich-Linie“
  - „Flächen flach zwischen Linie und Nulllinie (Gewinn 12 %, Verlust 16 %)“
  - „Balken an der Nulllinie gerade, am Wertende 3 px rund“
  - „Legenden oben links (`.chart-legend`), nur bei zwei und mehr Reihen“
  - „Report-Standardfarben Blau/Magenta/Kupfer“
- **P4** Z. 219: „Equity echt vs. Schatten“ → „Kurven: echt als volle Linie in Textfarbe, Schatten-Ich gestrichelt grau“. Ranking: „Regeln ohne Verstoß als eine Zeile“.
- **P5** Z. 345–348 (Kurven): „auch Kontostand- und Drawdown-Verlauf. Mehrere Einheiten (Trefferquote-Verlauf, Report) stehen als Spuren übereinander, jede mit eigener Achse links, es gibt keine rechte Achse.“
- **P6** Z. 350–352 (Einzug): „gestrichelte Linien blenden ein; Werte über Säulen erscheinen nach dem Wachsen“.

## 4. Akzeptanzkriterien

**grep-Prüfungen** (vom Repo-Wurzelverzeichnis):
1. `grep -n "curShort" web/js/ui.js` → keine Treffer.
2. `grep -n "stroke-dasharray: 3" web/css/app.css` → keine Treffer. `grep -c "^\.chart text {" web/css/app.css` → 1.
3. `grep -n "rotate(-45" web/js/widgets.js` → keine Treffer.
4. `grep -rn "legend top\|legend rep\|\.legend\.top\|\.legend\.rep" web/js web/css` → keine Treffer. `grep -rn 'class="legend"' web/js` → nur app.js (Fieldsets, 4 Treffer).
5. `grep -c "linearGradient" web/js/ui.js web/js/widgets.js` → je 0.
6. `grep -n "var(--info)" web/js/widgets.js` → keine Treffer. `grep -n "var(--be)" web/js/widgets.js` → nur noch in den Kacheln Trade- und Tages-Trefferquote (Halbkreis und Pillen, heute Z. 170 und 174), nicht in Serien, Legenden oder `PV.line`.
7. `grep -n "fillDays\|Kumulierter Tages-P&L" web/js/screens/stats.js web/js/widgets.js web/js/widgetpreviews.js` → keine Treffer.
8. `grep -n "'18–20'" web/js/core.js` → keine Treffer.
9. `grep -n "drop-shadow" web/css/app.css | grep ring-arc` → keine Treffer.
10. `grep -n "#4fd1a5\|#3d6bff" web/js/widgets.js web/js/widgetpreviews.js` → nur in `REPORT_OLD`.
11. `grep -n "accent) 22%\|accent) 40%\|accent) 60%\|accent) 80%" web/css/app.css` → keine Treffer.
12. `grep -nE 'rx="[24]" (class="br|fill="(var|\$\{scoreColor))' web/js/ui.js web/js/widgets.js web/js/screens/affiliate.js` → keine Treffer. Datenbalken sind nur noch `<path class="br">`. Symbole und PV-Vorschauen mit `rx` sind nicht betroffen.

**Playwright-Sonde** (dark und light, 1440/1024/390; Beispieldaten; Routen dashboard, stats/summary…stats/mc (alle 9), progress, shadow, prop/bilanz, prop (Übersicht), affiliate, affiliate/creator, day, trades, notebook mit Trade-Notiz):
13. Für jedes `.chart svg`:
    - `role="img"` mit nicht leerem `aria-label` oder `aria-hidden="true"`
    - kein `<text>` mit `transform`
    - alle `.grid line` und `.zero` haben `getComputedStyle().strokeDasharray === 'none'`
14. Keine zwei `<text>` im selben `.chart svg` überschneiden sich (getBBox, 1 px Toleranz).
15. In Diagrammen mit waagerechtem Gitter liegt jede `.br`-BBox zwischen oberster und unterster Gitterlinie (±0,5 px). Prüffälle: stats_days „P&L nach Wochentag“, dashboard „Netto-P&L pro Tag“, affiliate (beide Ansichten).
16. `.chart text` außerhalb von `.bv`, `.lbl` und den hbars-Namen: `fontSize === '11px'`. Farbe dark `rgb(138, 134, 127)`, light `rgb(106, 116, 109)`. Schrift beginnt mit „Onest“.
17. Jede `.chart-legend` steht vor einem `.chart`-Geschwister. Ihre Spans sind 12px/400, dark `rgb(188, 184, 177)`.
18. Geld-blind an (Einstellungen → Trading), #/stats/days: Achsenbeschriftungen von „P&L nach Wochentag“ enden auf „R“. Kein Text passt auf `/^\d+(,\d)?k$/`.
19. #/stats/days: Die vbars-Beschriftungen enthalten „Mo, Di, Mi, Do, Fr“, auch wenn Di keine Trades hat (Di in `rgb(79, 76, 71)` dark). #/stats/time: „18–19“ oder „19–20“ statt „18–20“.
20. #/progress:
    - `.activity i.l5` hat eine andere Hintergrundfarbe als `--accent`
    - `.ring-arc` ist 64 px breit
    - `.ring-arc .arc` hat `filter === 'none'`
    - bei 390 px ist kein Wochenlabel-Paar näher als 44 px, das letzte Label gehört zur jüngsten Woche
21. #/shadow:
    - genau ein `path[stroke-dasharray]` in `[data-id=shadow-curve]`
    - kein `.bar-row` mit „0×“
22. Prop-Übersicht (Apex funded): Text „über dem Boden“ und Tooltip „Boden fest bei …“. Nirgends „von 3.000“ bei einem Rest über 3.000.
23. Report-Widget mit zwei Einheiten: zwei `g.grid`, keine Achsenbeschriftung rechts der Mitte.

**Tests:**
24. `node --test web/tests/*.mjs` grün, alle Suiten aus `web/e2e/runall.sh` grün (bes. dashtest, headtest, chartanimtest, shadowtest, affiliatetest, mobiletest, blindtest, proptest, sixtest, calmnavtest).

**Screenshot-Prüfpunkte** (neu aufnehmen nach `audit/shots/extra/diagramme-nachher/`, gleiche Namen wie im Atlas):

| Aufnahme | Prüfpunkt |
|---|---|
| dark-1440/stats_days | Achse links „2.000 €“, oberste Säule unter dem obersten Strich, Gewinner/Verlierer-Spalten weiß |
| dark-1440/stats_time | keine Kollision „2–4 h1×“, Anzahl rechts in eigener Spalte |
| dark-1440/stats_mc | Median-Linie mit „Median …“, Achse links mit vollen Beträgen, „0 · 25 · 50 Trades“, Histogramm „0 % · 10 % · 20 % · 30 %“ mit „Ruin ab 30 %“ |
| dark-1440/dashboard | Kontostand mit gestrichelter grauer Startkapital-Linie und Beschriftung, Linie unter Startkapital rot; Uhrzeit-Achse waagerecht „09:00 …“; Trefferquote-Verlauf in zwei Spuren, Trefferquote grau, Legende oben |
| dark-390/progress | Wochenlabels nicht zusammengeschoben, Score über den Säulen, Heatmap grau |
| dark-1440/progress | Ring 64 px rechts, ohne Schein, „5 Tage mit Regel-Check im Zeitraum“ einzeilig |
| light-1440/shadow | echte Linie dunkel durchgezogen, Schatten-Ich grau gestrichelt, Legende mit Strich |
| dark-1440/affiliate | graue Balken, oberster Balken unter dem obersten Strich |
| dark-1440/prop_cockpit | Apex „11.162 $ über dem Boden“ |
| notebook_notiz (Trade) | „Trade-Details“ mit 5 Zeilen, kein rotes Dreieck |
| light-1440/day_mit_trades | Sparkline-Fläche zwischen Linie und Nulllinie |

Zensus (Stil-Zensus neu erheben, dark 1440, dashboard): Legendentexte nur noch als `fs 12px, fw 400, c rgb(188, 184, 177)`. Keine 13-px-Legende (`legend.rep`) mehr.

## 5. Zurückgestellt

Ganz zurückgestellt ist kein Befund dieser Gruppe. Nicht umgesetzt werden diese Teile von Befunden:

| Teil | Grund |
|---|---|
| diagramme-17: Rolling-Fläche mit .10 | ersetzt durch farbe_kontrast-37: Die Fläche entfällt, weil sie bis zum unteren Rand reichte und keine Bedeutung trägt (K8). |
| bereich_konto-7: Hover-Regel `rect:hover { fill-opacity: .8 }` | Kein anderes Balkendiagramm hat einen Hover-Zustand, Einheitlichkeit geht vor (K22). |
| bereich_konto-55: lokale Korrektur in affiliate.js | zentral in `niceTicks` gelöst (K2), eine zweite Stelle würde nur doppeln. |
| bereich_notebook_news-18: „Werte in Satoshi statt Onest“ | Befund falsch, `.stats-grid .v` ist schon Onest (app.css:1800). |
| farbe_kontrast-38: Palette `#3d6bff, #8a867f, #f5a53a` | fällt durch den dataviz-Validator (Chroma, Helligkeitsband, 2,03:1 hell) und wird durch die geprüfte Palette ersetzt (K13). |
| bereich_statistik-35: Histogramm | Farbe und Deckkraft regelt Farbe/bereich_statistik-25. |
| diagramme-21: Start-Label „Start 25.000 €“ | Prüfer-Anmerkung. Startkapital und Ruin stehen in der Zeile über den Kacheln, ein weiteres Label im Feld wäre Wiederholung. |
| bereich_training-28: zusätzliche `.zero`-Linie (Prüfer-Fassung) | Die 0-€-Linie ist schon eine Gitterlinie, eine gestrichelte Nulllinie neben der gestrichelten Schatten-Reihe würde verwirren (Prüfer-Anmerkung). |
| zustaende-5: Teil 2 (Zeichnen erst ab dem ersten Handelstag) | vom Prüfer abgelehnt; mit dem Wegfall von `fillDays` ohnehin gegenstandslos. |
| typografie-29: `vbars mr = Math.max(52, …)` | gegenstandslos, die Achse steht links. |
| Ergänzung bereich_training-16: Säulenbreite 18 px, Deckkraft .7, rx 3 | Geschmack. Die Lesbarkeit lösen die Werte über den Säulen (diagramme-25). Der Radius folgt A-10. |
| diagramme-15: Startkapital-Strich „4 4“ | an „4 3“ der Ruin-Schwelle angeglichen (K6). |

## 6. Nutzer fragen

**N1 – diagramme-29: Profit-Faktor als Balken statt Ring?**
- Frage: „Die Kachel Profit-Faktor zeigt einen Ring aus Bruttogewinn und -verlust, ‚Ø Gewinn/Verlust‘ daneben einen waagerechten Zweiteil-Balken. Beides ist dasselbe, ein Verhältnis zweier Beträge. Sollen beide gleich aussehen (Balken)? Du hattest den Ring früher bewusst größer gemacht (Commit e2bec1b ‚Profit-Faktor nur mit größerem Ring‘), und der Kachelaufbau folgt TradeZella.“
- Empfehlung: **Ja.**
  - Gleiche Kennzahl-Art, gleiche Form.
  - Am Handy ist der 55-px-Ring lauter als der Wert und macht die Kachel höher als ihre Nachbarn (extra/dv-crop-390-dash.png).
  - Die Halbkreise der Trefferquoten bleiben, sie zeigen drei Anteile (Gewinn/BE/Verlust).
- Umsetzung bei Ja:
  - widgets.js:172 `{ side: true, gauge: U.donut(…) }` → `{ gauge: <wl-single wie Z. 176 mit s.gp und s.gl> }` plus `.replace('class="tile"', 'class="tile wide"')`
  - widgets.js:171 `preview: 'donut'` → `'wl'`, `desc` → „Summe aller Gewinne geteilt durch Summe aller Verluste, als Balken im Verhältnis zueinander.“ (Schlüssel in js/lang/*.js)
  - widgetpreviews.js:60 nach dem Muster von Z. 62 zeichnen
  - danach mobiletest.js:32 und :68 prüfen (`.wl-single` trifft dann zuerst die Profit-Faktor-Kachel)

**N2 – diagramme-40 und bereich_prop-23: „Ausgaben vs. Payouts“ als Treppe auf echter Zeitachse?**
- Frage: „Im Prop-Diagramm ‚Ausgaben vs. Payouts‘ stehen alle Buchungen gleich weit auseinander, ob 1 Tag oder 26 Tage dazwischen liegen. Die weiche Kurve zeigt außerdem stetiges Wachstum, wo es Sprünge gab. Darf dieses eine Diagramm eine echte Zeitachse und eine Treppe bekommen (flach bis zur Buchung, dann senkrecht hoch)? Bisher gilt: alle Kurven weich (README ‚Kurven‘: gerade Stücke wirkten zackig).“
- Empfehlung: **Ja, nur für dieses Diagramm.**
  - Kumulierte Buchungen sind Sprünge, eine Treppe ist hier die ehrliche Form. Sie ist monoton und schießt nie über.
  - Nur die Zeitachse ohne Treppe würde ich nicht umsetzen: Eine Lücke von 26 Tagen erschiene dann als lange, gleichmäßige Rampe, das täuscht mehr als heute.
  - Bei Nein bleibt das Diagramm, wie es ist.
- Umsetzung bei Ja, nur über die Optionen `d.timeX` und `s.step`, alle anderen lines-Diagramme bleiben gleich:
  - widgets.js:61 `x` → `const tx = d.timeX && n > 1 ? pts.map(p => +p.date) : null; const x = i => n === 1 ? ml + iw / 2 : tx && tx[n - 1] > tx[0] ? ml + (tx[i] - tx[0]) / (tx[n - 1] - tx[0]) * iw : ml + i / (n - 1) * iw;`
  - widgets.js:63 `path`: bei `s.step` statt `U.smooth(r)` → ``'M' + r[0].join(',') + r.slice(1).map(([px, py]) => `H${px.toFixed(1)}V${py.toFixed(1)}`).join('')``
  - widgets.js:47 `bindHover`: `i` als nächster Punkt bestimmen: `const sx = +hit.getAttribute('x') + (cx - r.left) / r.width * +hit.getAttribute('width'); let i = 0; for (let k = 1; k < n; k++) if (Math.abs(xf(k) - sx) < Math.abs(xf(i) - sx)) i = k;` Bei gleichen Abständen ergibt das dasselbe wie heute.
  - prop.js:254 `U.chartData['prop-balance']` um `timeX: true` ergänzen, beide Serien um `step: true`
  - Info prop.js:256 → „Stand nach jeder Ausgabe bzw. jedem Payout, auf der Zeitachse. Payout-Datum: erhalten, sonst beantragt.“
  - README Z. 345–347 ergänzen: „Ausnahme: ‚Ausgaben vs. Payouts‘ als Treppe auf echter Zeitachse.“
