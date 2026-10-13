# Zielspezifikation „Responsiv (Handy, Tablet)“

Grundlage: 50 bestätigte Befunde aus `spec-input/responsiv.json`, BRIEF.md, `web/README.md`, Code-Stand `aa9f1c6` (letzte Code-Änderung, Zeilenangaben gelten für diesen Stand).
Eigene Nachmessungen dieser Spezifikation liegen in `scratchpad/respspec/` (Prototypen per Stil-Injektion bei 390×844 und 1024–1440 px, siehe Abschnitt 2).

---

## 1. Zielzustand

### 1.1 Breiten-Stufen (verbindlich, keine neuen Grenzwerte erfinden)

| Stufe | Bereich | Abfrage im CSS | Merkmale |
|---|---|---|---|
| Handy | ≤ 560 px | `@media (max-width: 560px)` (Block am Dateiende) | Kopfreihe als umbrechende Werkzeugleiste, runder „Trade loggen“-Knopf, Tabellen nur mit Kernspalten, Dialoge als Bottom-Sheet |
| Tablet hochkant | 561–960 px | `@media (max-width: 960px)` | Seitenleiste als Schublade, Titelzeile 60 px, Seitenrand 16 px |
| Schmaler Desktop / Tablet quer | 961–1240 px | `@media (min-width: 961px) and (max-width: 1240px)` | Dashboard-Raster 2 Spalten, 5 Kacheln als 3 + 2 |
| Desktop | ≥ 1241 px | – | wie heute |

Ausnahmen, die bewusst an anderen vorhandenen Werten hängen: Notebook richtet sich nach der **Inhaltsbreite** (Container `nbc`, Abschnitt 1.8); Statistik-Kennzahlen 2 Spalten erst ≤ 760 px (vorhandener Grenzwert, Abschnitt 1.7); Coach-Tabelle ≤ 1180 px (vorhandener Grenzwert der Coach-Kacheln).

### 1.2 Ränder, Safe Area, Titelzeile

- Seitenrand unter 961 px: links und rechts `max(16px, env(safe-area-inset-left/right, 0px))` für `.content` und `.topbar`.
- Titelzeile: `top: 0`, der obere Inset steckt im Innenabstand (`padding-top: calc(12px + env(safe-area-inset-top, 0px))` Desktop, `calc(10px + …)` unter 961 px). Unter 961 px: Glyphe des Menüknopfs steht auf der Inhaltskante x = 16, Avatar endet bei vw − 16.
- Runder „Trade loggen“-Knopf: `right: calc(16px + env(safe-area-inset-right, 0px))`, `bottom` wie heute. Der Inhalt reserviert unten `calc(104px + env(safe-area-inset-bottom, 0px))`. Der Knopf darf beim Scrollen Inhalt überdecken (schwebender Knopf), er wird nicht ein- oder ausgeblendet.
- Schublade: oben `calc(22px + inset-top)`, links `calc(14px + inset-left)`, unten steckt `calc(18px + inset-bottom)` im Konto-Karten-Wrapper.

### 1.3 Kopfreihe und Konto-Knopf

- Der Konto-Knopf erscheint unter 961 px immer dann, wenn es **mehr als ein Konto** gibt, oder wenn die Seite keinen Zeitraum hat (Mentor, wie heute). Bei genau einem Konto bleibt das Handy wie heute.
- Am Handy (≤ 560 px) auf Seiten **mit** Zeitraum ist der Konto-Knopf ein 40 × 40-Symbolknopf (Personen-Symbol, kein Name, kein Pfeil). Name bleibt per `aria-label="Konto: {Name}"` und `title` erhalten. Die Kopfreihe darf dadurch zweizeilig werden (README: umbrechende Werkzeugleiste).
- Der Kontoname im Knopf ist überall höchstens **180 px** breit, danach Ellipse („…“); der volle Name steht im `title`.

### 1.4 Menüs (Popover) am Handy

- Alle Menüs der Kopfreihe (`.dash-head`: Zeitraum, Konto, Vorlage, Zertifikat, Notebook-Filter usw.) öffnen am Handy in der **vollen Breite der Kopfreihe**: x = 16 bis vw − 16, direkt unter der Kopfreihe.
- Das Filter-Fenster des Dashboards (eigene Ebene `#fd-layer`) ebenso: Breite vw − 32, links 16.
- Alle anderen Menüs am Handy: `max-width: calc(100vw - 32px)`; `App.fitPopover` hält 16 px Abstand zum Rand (Desktop weiter 8 px).
- Zeitraum-Menü mit nur einem sichtbaren Monat (Handy ≤ 700 px und Titelzeile 961–1000 px): Ist eine **Vorgabe** gewählt („Dieser Monat“ usw.), zeigt der Kalender den **aktuellen Monat**. Gespeicherte eigene Zeiträume zeigen weiter den Startmonat.

### 1.5 Tabellen am Handy (Kernspalten-Regel)

Regel: Am Handy scrollt keine Datentabelle seitlich. Sichtbar bleiben höchstens vier Spalten: links die Hauptspalte (Name/Datum/Regel), rechts der Kernwert (P&L, Betrag, Netto, Kosten), ganz rechts Aktionen, falls vorhanden. Was wegfällt, steht entweder in einer **Unterzeile** der Hauptspalte (12 px, `--muted`, Werte mit „ · “ getrennt, keine Spaltenköpfe) oder ist über die Zeile erreichbar (Trade-Detail, Tagesansicht, Schüler-Ansicht, Konto-Dialog). Funktionen (Löschen, „Erhalten“, Bearbeiten) bleiben immer sichtbar.

| Tabelle | Datei | am Handy sichtbar | Unterzeile der Hauptspalte |
|---|---|---|---|
| TradeLog | `trades.js` | Eröffnet (`08.10. 19:43`), Symbol, Richtung (nur Pfeil), P&L | – (Rest im Trade-Detail) |
| Trades des Tages | `day.js` | Zeit (nur Start), Symbol, Richtung (nur Pfeil), Netto-P&L | – |
| Statistik → Tage | `stats.js` tabDays | Tag (`Do., 08.10.`), Trades, Win-Rate, Netto-P&L | – (Rest in der Tagesansicht) |
| Statistik → Gruppen (Setups, Richtung, Symbole …) | `stats.js` groupTable | Name, Trades, Win-Rate, Netto-P&L | – (Ø pro Trade steht im Diagramm darüber; Ø R und Profit-Faktor ab 561 px) |
| Fortschritt → Regeln im Detail | `progress.js` | Regel, Eingehalten (Tage) | „2× gebrochen · −120,00 €“, nur wenn gebrochen |
| Schatten-Ich → Verstöße | `shadow.js` | Regel, Kosten (letzte Spalte) | „08.10. 15:39 · NQ“ |
| Prop → Ausgaben | `prop.js` | Typ, Betrag, Löschen | „08.10.2026 · {Konto oder Firma}“ |
| Prop → Payouts | `prop.js` | Konto, Netto, Aktionen („Erhalten“, Löschen) | „{Status-Pille} · Beantragt 01.10.2026“ |
| Prop → Deine Konten | `prop.js` | Konto, Status, Aktionen (Bearbeiten, Löschen) | vorhandene Unterzeile + „ · {Phase}“ |
| Coach → Schüler | `coach.js` | Schüler, Trades, Winrate, Aufgaben | – (Rest in der Schüler-Ansicht); ≤ 1180 px zusätzlich ohne Ø Gewinn / Ø Verlust |

Mechanik (eine Lösung für alle, wie Affiliate): Tabelle bekommt `ph-fit`, ausgeblendete `th`/`td` bekommen `ph-hide`, nur am Handy sichtbare Teile `ph-only`, umbrechende Zellen `ph-wrap`. Zellabstand am Handy in `ph-fit`-Tabellen `9px 8px`, Schrift 12,5 px wie heute. Richtungs-Abzeichen in `ph-fit`-Tabellen nur als Pfeil (Text visuell versteckt, für Screenreader vorhanden). Lange Datumsformen weichen am Handy der Kurzform.

Unter 961 px gibt es keine senkrecht scrollende Box mehr in der scrollenden Seite (TradeLog, Verstöße): `.tbl-wrap.paged .tbl-scroll` ohne `max-height`.

### 1.6 Wischleisten

Waagerecht wischbare Leisten (`.tabs`, `.prop-tabs`, `.prop-sub`, `.set-nav` unter 961 px, `.nb-toolbar` am Handy) haben keinen Scrollbalken (README Z. 361), zeigen aber an jedem Rand, hinter dem es weitergeht, einen **28 px breiten weichen Auslauf**. `App.edgeFade` setzt dafür `fade-l` / `fade-r`. Technik: `mask-image`; nur bei der Editor-Werkzeugleiste (enthält Menüs) ein klebender Verlauf in `--surface` statt Maske. Der gewählte Reiter wird weiter ins Bild geschoben (`App.revealActive`). Kein Umbruch der Reiterleiste.

### 1.7 Kachelreihen und Raster

- Handy: Kacheln in zwei Spalten; eine **ungerade letzte Kachel geht über die volle Breite** (Dashboard, Skelett; Prop-Leiste hat das schon).
- 961–1240 px: **vier Kacheln in einer Reihe**, **fünf Kacheln als 3 + 2** (6er-Raster: die ersten drei `span 2`, die letzten zwei `span 3`). Gilt für Dashboard-Kacheln (`.dash-top`), Kennzahlen-Leisten (`.kstrip`: Prop-Übersicht, Bilanz, Friedhof, Affiliate) und TradeLog-Kacheln. Ab 1241 px alles in einer Reihe. TradeLog unter 961 px: 2 × 2.
- Dashboard-Raster unten (`.dash-main`) 961–1240 px: **zwei Spalten**; „groß“ (`sz-gross`) überspannt 2, „mittel“ überspannt 2 (volle Breite), „klein“ 1. Ab 1241 px drei Spalten wie heute.
- Statistik → Übersicht (16 Kennzahlen): 4 Spalten bis hinunter zu 761 px, darunter 2. Werte einer Reihe stehen unten bündig (Kachel als Spalte, Wert `margin-top: auto`). Ist eine Kachel ≤ 175 px breit, ist der Wert 20 px. Die drei Karten darunter (Serien, Drawdown & Risiko, Haltedauer): ≥ 1101 px drei Spalten, 561–1100 px zwei Spalten mit „Haltedauer“ über die volle Breite, Handy eine.
- Kachelwerte: am Handy **einheitlich 20 px** (`.tile .val`, Spark-Kachel, Prop-Leiste, `.stat-tile .v`). Die Spark-Kachel (TradeLog „Netto-P&L“) hat keine eigene Größe mehr (Desktop 25 px statt 28 px, Tablet 22 px). Kennzahlen-Leisten mit Kacheln ≤ 200 px: Wert 20 px.

### 1.8 Notebook-Spalten nach Inhaltsbreite (ab 961 px)

Container `nbc` = Inhaltsbereich `.content` ab 961 px Fensterbreite.

| Inhaltsbreite | Spalten | Beispiel |
|---|---|---|
| ≥ 1160 px | 236 / 300 / Rest (wie heute) | 1440 offen: Notiz 596 px |
| 1000–1159 px | 210 / 260 / Rest | 1280 offen: Notiz 502 px; 1366 offen: 588 px |
| 700–999 px | Liste 260 / Notiz (Ordner über den Zurück-Knopf der Liste) | 1024 offen: Notiz 470 px; 1024 eingeklappt: 622 px |
| < 700 px | eine Spalte wie am Handy | 961–979 offen |

Unter 961 px gilt weiter die bestehende Einspalten-Ansicht.

### 1.9 TradeLog-Höhe (Desktop)

Die Liste füllt weiter das Fenster (README). Die Tabellen-Box ist aber mindestens **256 px** hoch (Kopf 44 + drei Zeilen + Seitenwähler 55). Reicht das Fenster dafür nicht, scrollt die Seite (Seitenwähler bleibt nach dem Scrollen erreichbar).

### 1.10 Seitenleiste und Schublade

- Die Dichte-Regeln für niedrige Fenster (≥ 961 px, Höhe ≤ 1060 / ≤ 940 px) greifen wirklich (stehen nach den Grundregeln).
- Die Konto-Karte klebt auf allen Breiten unten in der Leiste (`position: sticky; bottom: 0`, Hintergrund `--bg-2`); die Navigation scrollt darunter. Ohne Überlauf sieht alles aus wie heute (Abstände 10 px darüber, 18 px darunter).
- Schublade (≤ 960 px): Safe Area wie 1.2; bei Fensterhöhe ≤ 940 px Gruppenabstand 16 px statt 26 px und Marke unten 14 px; **Zeilenhöhe der Einträge bleibt 39 px** (Fingerziel). Schließen-Knopf 40 × 40.
- Geschlossene Schublade ist unsichtbar und nicht fokussierbar (`visibility: hidden` nach der Schiebe-Animation). Beim Öffnen springt der Fokus auf den aktiven Eintrag, der Inhalt dahinter ist `inert`; beim Schließen kehrt der Fokus an den Menüknopf zurück, wenn er in der Schublade war.

### 1.11 Eingabefelder am Handy

Alle Text-, Zahl-, Datums- und Auswahlfelder und Textbereiche haben am Handy **16 px** (iOS zoomt sonst). Ausgenommen: Checkbox, Radio, Regler, Farbfeld, Datei und der Notiztitel (größer). Einzeilige `.input`/`.select` behalten 42 px Höhe (`line-height: 20px`). Kein `maximum-scale`/`user-scalable=no` im Viewport.

### 1.12 Dialoge am Handy

Bottom-Sheet gleitet von unten herein (`sheet-in`, `--dur-3`, `--ease`) und hinaus (`sheet-out`, `--dur-2`, `--ease-in`); der Hintergrund blendet gleich lang aus. Desktop unverändert (`pop-in`/`pop-out`). „Bewegung reduzieren“ schaltet alles ab (vorhandene Regel app.css:97).

### 1.13 Lange Inhalte

| Element | Grenze | Rest |
|---|---|---|
| Kontoname im Konto-Knopf | 180 px, Ellipse | `title` |
| Auswahlfelder der TradeLog-Filter | 200 px | Zähler „x von y Trades“ bricht nie allein um (`nowrap`, rechts) |
| Setup-Chip in Tabellen | 150 px, Ellipse | `data-tip` mit vollem Namen, nur bei > 20 Zeichen |
| Symbol in „Letzte Trades“ | 7.5em, Ellipse | `title` |

### 1.14 Einzelregeln

- **Editor-Werkzeugleiste am Handy:** Reihenfolge B, I, U, S, Einfügen (+), Text, Farbe, Marker, Bild, Rückgängig, Wiederholen, Schriftgröße. Nichts wird ausgeblendet; Trenner entfallen am Handy, Abstand 4 px; „Text“-Knopf 84 px.
- **Notiz teilen am Handy:** „Teilen“ steht im •••-Menü (nach „Duplizieren“); der Knopf in der Kopfzeile bleibt ab 561 px.
- **Mentor am Handy:** Kopf einzeilig, „Verlauf löschen“ nur als Symbol (`aria-label`), Platzhalter auf Touch-Geräten „Schreib dem Mentor …“, mit Maus wie heute.
- **Prop-Karte (Cockpit):** Zeilen „Bis zum Bestehen“, „Nächster Payout“, „Puffer“ brechen nie um; Wert rechtsbündig, darf in sich umbrechen.
- **Bearbeitungsmodus am Handy:** Leiste der oberen Kacheln ohne Namen (er steht darunter als Kacheltitel), Pfeile und × je 40 × 40.
- **Skelett am Handy** = Maße der fertigen Seite: Titelzeile 60 px mit Menü-Platzhalter, Kopfreihe 46 px (Zeitraum 166 px + 3 Symbole), fünf Kacheln à 111 px (fünfte volle Breite), Karte 339 px.
- **Formular-Raster:** `.grid.two` läuft nie über seinen Container (`minmax(min(340px, 100%), 1fr)`).

### 1.15 Texte dieser Gruppe (Glossar, vorher → nachher)

Regeln: Unterzeilen nennen nur Werte, getrennt mit „ · “; Datum lang `TT.MM.JJJJ` (`fmt.dateFull`), kurz `TT.MM.` (`fmt.dateDM`), Wochentag kurz „Do., 08.10.“ (`fmt.weekdayShort`, neu). Jeder neue Text wird in `js/lang/{en,es,zh,hi,pt}.js` eingetragen (Muster mit `{0}`).

| Ort | vorher | nachher |
|---|---|---|
| Prop-Karte, Label | „Bestehen“ | „Bis zum Bestehen“ |
| Prop-Karte, Wert | „Gewinn fehlt: 1.946,15 €“ (andere Währung als der Ziel-Balken) | entfällt, wenn der Ziel-Balken darüber steht; sonst „1.946,15 $ fehlen“ in Kontowährung (`money(a, …)`) |
| Regeln im Detail (Handy-Unterzeile) | – | „2× gebrochen · −120,00 €“ (Muster „{0}× gebrochen“) |
| Payouts (Handy-Unterzeile) | – | „{Status} · Beantragt 01.10.2026“ (Muster „Beantragt {0}“) |
| •••-Menü der Notiz (Handy) | – | „Teilen“ |
| Konto-Knopf | nur `title="Konto: …"` | zusätzlich `aria-label="Konto: {Name}"` |
| Mentor-Platzhalter (Touch) | „Schreib dem Mentor … (Enter sendet, Shift+Enter neue Zeile)“ | „Schreib dem Mentor …“ |
| Mentor, Löschen-Knopf | Text „Verlauf löschen“ | am Handy nur Symbol, `aria-label="Verlauf löschen"` |

### 1.16 Hilfsklassen (Vokabular)

| Klasse | Wirkung |
|---|---|
| `ph-hide` | ≤ 560 px ausgeblendet (`!important`), global, auch außerhalb von Tabellen |
| `ph-only` | nur ≤ 560 px sichtbar (`display: revert`); in Menüs `.popover .item.ph-only` → `flex` |
| `ph-fit` (an `.tbl`) | ≤ 560 px `min-width: 0`, Zellen `9px 8px`, Pfeil-Abzeichen |
| `ph-wrap` (an `td`) | ≤ 560 px darf umbrechen |
| `acc-iconm` (am Konto-Popwrap) | ≤ 560 px nur Symbol |
| `fade-l` / `fade-r` | Auslauf am linken / rechten Rand einer Wischleiste |
| `tb-hide` (nur Coach) | ≤ 1180 px ausgeblendet |

`hide-m` (≤ 960 px) bleibt unverändert für bestehende Stellen; neue Handy-Regeln nutzen `ph-*`.

---

## 2. Konflikte und Entscheidungen

**K1 Konto-Knopf (bereich_dashboard-4, responsiv-1, zustaende-29).** Drei Vorschläge an drei Stellen (dashboard.js:124, app.js:244, app.js:259). Entscheidung: eine Bedingung in `accountControl` (app.js:244): sichtbar unter 961 px, wenn `o.mobile || accounts.length > 1`. Die Darstellung „nur Symbol“ steuert eine eigene Option `iconM` statt eines `:has(+ …)`-Selektors (lesbarer, unabhängig von der Reihenfolge). Die Prüfer-Idee, bei Platzmangel das Zertifikat am Handy auszublenden, wird nicht übernommen (Funktion; zweizeilige Kopfreihe ist laut README erlaubt).

**K2 Eingabefelder (responsiv-9 gegen typografie-26).** `@media (pointer: coarse)` mit Selektorliste (responsiv-9) träfe auch iPads und wäre bei jeder neuen Feldklasse lückenhaft (7 spezifischere Regeln: app.css:1057, 1396, 2236, 2412, 2610, 2864, 2923, dazu `.sr-unit`, `.sr-time`, `.fd-unit`, `.cp-hex input`). Entscheidung: ≤ 560 px, ein allgemeiner Selektor mit `!important`, Notiztitel ausgenommen. Höhe: Prüfer maß 42 → 45 px; in der Notebook-Zeile verrutscht dann die Mitte zu den 40-px-Knöpfen. Entscheidung: `line-height: 20px` für einzeilige `.input`/`.select` (42 px bleiben; `.select.sm` 32 → 34 px). Größere Fingerziele regelt die Gruppe Barrierefreiheit (responsiv-30 dort), kein Widerspruch.

**K3 Schublade und Seitenleiste (bereich_shell-16, responsiv-15, responsiv-14, bereich_shell-31, barrierefreiheit-30).** Gemeinsame Lösung: Dichte-Blöcke verschieben, Konto-Karte überall sticky, Abstand unten im Wrapper statt in `.sidebar` (sonst scheint Navigation unter der Karte durch, Prüfer-Messung). Die Prüfer-Fassung von bereich_shell-16 verkleinert die Zeilen auf 35 px; abgelehnt (Fingerziel, der Befund selbst sagt „NICHT verkleinern“). Gruppenabstand 16 px nur bei Fensterhöhe ≤ 940 px, damit hohe Tablets luftig bleiben wie der Desktop.

**K4 Handy-Tabellen (bereich_trades_tag-5, responsiv-4, responsiv-7, responsiv-5, bereich_statistik-20, bereich_prop-21, responsiv-6, bereich_prop-22, bereich_training-24, responsiv-8, bereich_training-27, bereich_konto-13).** Drei Techniken waren vorgeschlagen: Kartenliste per `display: grid` auf `tr` (trades_tag-5), `data-m`-Attribute (responsiv-4/-6/-7) und Klassen nach dem Affiliate-Muster. Entscheidung: **eine** Technik für alle zehn Tabellen, das vorhandene Muster (`ph-hide`, README Z. 275 f.). Gründe: Tabellen-Semantik bleibt, kein `display: block` auf `table`, ein Vokabular statt drei. Messung mit Prototyp bei 390 px (respspec/tblfit*.js): TradeLog 356/356, Tage 356/356 (nur mit Kurzdatum; mit Langdatum 422/356), Setups 314/314, Regeln 316/316, Verstöße 316/316, Ausgaben 314/314, Payouts 314/314, Konten 316/316, Trades des Tages 316/316 (scrollWidth/clientWidth). Verstöße: Prüfer wollte „Datum | Regel | Kosten“; gewählt „Regel (Unterzeile Datum · Symbol) | Kosten“, damit die Regel nicht auf 124 px zusammengedrückt wird und das Muster überall gleich ist. Prop-Konten: Prüfer-Fassung blendet „Löschen“ am Handy aus; abgelehnt (Funktion). Die Messung zeigt: Konto (umbrechend) + Status + beide Aktionen passen (142 + 98 + 76 px). Gruppentabellen der Statistik: Ø R und Profit-Faktor sind am Handy nicht sichtbar (ab 561 px schon); Ø pro Trade steht im Diagramm „Erwartungswert je Setup“ darüber. Das ist eine Darstellungsreduktion, keine entfernte Funktion.

**K5 Menüränder (bereich_dashboard-27 gegen responsiv-24).** dashboard-27 will das Zeitraum-Menü wie das Filter-Fenster auf 8 px Rand bringen, responsiv-24 alle drei auf den 16-px-Seitenrand. Entscheidung: 16 px (Seitenrand der ganzen App), Filter-Fenster wird angepasst. CSS-Anker ist `.dash-head` (die Prüfer haben nachgewiesen, dass `left: 16px` an `.popwrap` relativ zum Knopf wirkt).

**K6 Zeitraum-Monat (bereich_dashboard-27).** CSS-Lösung (ersten Monat ausblenden) bricht gespeicherte Zeiträume (Prüfer). JS mit `matchMedia` kennt den Fall „Titelzeile 961–1000 px nur auf dem Dashboard“ nicht. Entscheidung: RangePicker prüft am gerenderten Menü, ob der zweite Monat ausgeblendet ist (`getComputedStyle(...).display === 'none'`), beim Wählen einer Vorgabe und beim Öffnen (`fit`). Deckt Handy und 961–1000 px ab.

**K7 Kachelreihen (abstaende_layout-16, bereich_prop-13, bereich_trades_tag-32, bereich_dashboard-25).** Vorschläge: `data-n`-Attribut mit 4 → 2 × 2 (abstaende_layout-16), Klassen `n4`/`n5` in vier JS-Dateien mit Grenze 1180 oder 1240 (prop-13), TradeLog 4 Spalten (trades_tag-32). Entscheidung: eine Regel für alle drei Reihen über die Kinderzahl (`:has(> :nth-child(5):last-child)`), keine JS-Änderung; 4 Kacheln immer in einer Reihe ab 961 px (Kachelbreite 156–186 px liegt im Bereich, für den die vorhandenen Container-Abfragen ≤ 220/190/178/164/150 px gebaut sind; Handy-Kacheln sind 173 px), 5 Kacheln 3 + 2 bis 1240 px (Prüfer-Rechnung: fünf Kacheln brauchen ≥ 950 px Inhalt). Gruppenübergreifend: Die Gruppe Abstände hat mit responsiv-32 denselben Befund (generische `.grid.tiles`-Regel, 4 Spalten erst ab 1000 px). Die Werte müssen übereinstimmen; diese Spezifikation legt 961 px fest, weil sonst zwischen 961 und 999 px das 3 + 1 bleibt. Wer zuerst umsetzt, setzt diese Regel; die andere Gruppe gilt dann als erledigt.

**K8 Notebook (bereich_notebook_news-1).** Original: Ordner als Overlay bei ≤ 1100 px Inhalt, Einspalten-Modus ab 760 px. Prüfer: Zurück-Knopf statt Overlay, Einspalten ≤ 800 px (trifft genau 1024 px mit offener Seitenleiste). Entscheidung: Zurück-Knopf (vorhanden, kein neues Element), Grenzen 1160 / 1000 / 700 px Inhaltsbreite. Begründung per Prototyp (respspec/nbc.js): 1024 offen bekommt so zwei Spalten mit 470 px Notiz statt der Handy-Ansicht; 1366 offen behält drei Spalten (588 px Notiz). Werkzeugleiste ist bei 470–626 px zweizeilig (88 px), genau wie heute bei 1440 px – kein Rückschritt. `container-type` nur ab 961 px (Prüfer: der runde Knopf ist am Handy fest positioniert und läge sonst im Container).

**K9 TradeLog-Höhe (responsiv-2).** Original `min-height: 900px` als Bedingung nimmt Laptops die gewünschte Einpassung; Prüfer-Fassung 310 px (4 Zeilen) bricht `e2e/tlfittest.js` bei 1280 × 720 (scrollt 11 px). Entscheidung: Kacheln in eine Reihe (K7) holen ~120 px zurück, dazu Mindesthöhe **256 px** (3 Zeilen). Damit bleiben 1440 × 900, 1280 × 720 und 1100 × 800 ohne Seitenscroll (tlfittest unverändert grün), 1024 × 768 zeigt ≥ 3 Zeilen statt 0,8.

**K10 Editor-Werkzeugleiste (bereich_notebook_news-12 gegen responsiv-40).** Beide Originale blenden Rückgängig/Wiederholen bzw. Schriftgröße aus; abgelehnt (am Handy gibt es kein Strg+Z, Funktion). Entscheidung: nur umsortieren, Trenner am Handy weg. Kante: Prototyp (respspec/tbfade.js, tb0–tb2.png) zeigt den klebenden Verlauf links/rechts sauber. Grund gegen `mask-image` hier: Bei der Prüfung gemessen, dass das Menü „Einfügen“ am Handy schon heute von der wischbaren Leiste abgeschnitten wird (`overflow-y` wird `auto`, `elementFromPoint` trifft das Menü nicht; respspec/tbpop.js). Eine Maske würde auch eine spätere Reparatur (Menü fest positioniert) wieder abschneiden. Diese Beobachtung ist kein Befund dieser Gruppe und hier nicht Teil der Abnahme; sie gehört als eigener Punkt in die Planung (Gruppe Komponenten/Zustände).

**K11 Reiterleiste (bereich_statistik-47 mit Ergänzung abstaende_layout-18).** Ergänzung schlägt Umbruch ab 961 px vor; abgelehnt (zweizeilige Leiste wirkt kaputt, README: Reiter in einer Reihe). Kante beidseitig, gilt für alle Wischleisten (auch `.set-nav`, `.prop-tabs`, `.prop-sub`), nicht nur Statistik. Kein Konflikt mit BRIEF: kein Licht, kein Schein, nur Hinweis aufs Wischen.

**K12 Kachelwerte (typografie-28).** Prüfer schwanken zwischen 20 und 21 px. Entscheidung 20 px: `mobiletest.js:27` prüft `.stat-tile .v === '20px'` und bleibt grün, eine Stufe für alle Handy-Kennzahlen. `.prop-balance .val` (Kontostand, eigene Rolle) und `.topbar h1` (17 px, Leistentitel) bleiben. Desktop-Werte der Kacheln (25 / 24 px) gehören der Gruppe Typografie; hier wird nur die 28-px-Ausnahme der Spark-Kachel entfernt.

**K13 Statistik-Übersicht (bereich_statistik-21).** Original Grenze 1000 px, Prüfer 860 px. Entscheidung **760 px** (vorhandener Grenzwert; bei 761 px sind die Kacheln 172 px, mit Container-Regel 20 px passt „−1.141,12 €“). Kartenreihe mit festen Spalten statt `auto-fit`-Trick (Prüfer: auto-fit zählt nach Container, die Regel nach Fenster).

**K14 Mentor (bereich_training-38).** Prüfer-Fassung nutzt `.hide-m` (≤ 960 px) für den Knopftext; dann verliert auch das Tablet die Beschriftung, obwohl Platz ist. Entscheidung `ph-hide` (≤ 560 px).

**K15 Teilen (bereich_notebook_news-11).** Prüfer wiesen nach, dass der Original-CSS-Weg zweimal an der Spezifität scheitert. Entscheidung: Knopf in der Kopfzeile bekommt `ph-hide` (statt der Regel app.css:3009), Menüeintrag `item ph-only` mit eigener Regel `.popover .item.ph-only`. `nb-share` schließt zuerst offene Menüs, sonst bliebe das •••-Menü unter dem Dialog offen.

**K16 Prop-Karte (bereich_prop-10).** Prüfer-Fassung zieht „Consistency“ in eine eigene Zeile. Entscheidung: Consistency bleibt im Wert (weniger Logik); der Umbruch wird per CSS verhindert, der doppelte Betrag entfällt. Das reicht für den Befund (Label allein in einer Zeile, Wert linksbündig).

**K17 Scrollbox TradeLog (responsiv-3).** Befund nennt das Handy. Die 530-px-Box ist bei 561–960 px (iPad hochkant) dieselbe Scroll-Falle. Entscheidung: Rücknahme für ≤ 960 px (gleiche Begründung, README: „Handy scrollt wie gewohnt“, ab 961 px füllt die Liste das Fenster).

**K18 Skelett (bereich_shell-5) und bereich_shell-4 (Gruppe Zustände).** Gleiche Regeln `.boot-head`, `.boot-tiles .skel`, gleiche Zeile app.html:21. Diese Spezifikation ändert nur Regeln im Block `@media (max-width: 960px)` und fügt zwei Platzhalter hinzu; die Desktop-Maße setzt die Gruppe Zustände. Der Menü-Platzhalter ist auf die neue Titelzeile aus bereich_shell-31 abgestimmt (Titel bei x = 51).

**K19 Wording-Überschneidungen.** bereich_trades_tag-35 (Gruppe Wortwahl) fasst die TradeLog-Auswahlfelder in `.tl-selects`. Die hier eingeführte Klasse `.tl-filters` sitzt an der äußeren Reihe, `.tl-filters .select` greift auch innerhalb von `.tl-selects` – verträglich. „Bis zum Bestehen“ ist mit der Gruppe Wortwahl abzugleichen; gibt deren Glossar einen anderen Begriff vor, gilt deren Begriff, die Layout-Regel bleibt.

**K20 Weitere Gruppen.** Spalte „Status“ im TradeLog (ki_look-19) und Spaltenname „Effekt“ im Schatten-Ich (bereich_training-3) werden anderswo entschieden; diese Spezifikation blendet die Spalten am Handy nur aus bzw. nimmt „die letzte Spalte“. Grüne Markierung gedrückter Werkzeugknöpfe (`.nb-toolbar .tb[aria-pressed="true"]`, app.css:1090) gehört der Gruppe Farbe.

---

## 3. Umsetzungsschritte

Reihenfolge: zuerst Skalen und Hilfsklassen, dann Komponenten, dann Einzelstellen. Zeilen gelten für den Stand vor der Umsetzung; nach Verschiebungen per Selektor suchen.

### 3.1 web/css/app.css

#### A – Skalen und Hilfsklassen

**A1 Handy-Hilfsklassen** (bereich_prop-21, responsiv-6, bereich_prop-22, responsiv-4, responsiv-7, bereich_trades_tag-5, responsiv-5, bereich_statistik-20, bereich_training-24, responsiv-8, bereich_training-27, bereich_konto-13, bereich_notebook_news-11, bereich_training-38)
- Nach Z. 1330 (`.vh { … }`) global ergänzen:
  `.ph-only { display: none; }`
  `.popover .item.ph-only { display: none; }`
- Im Block `@media (max-width: 560px)` (Z. 2978 ff.) direkt nach Z. 2997 ergänzen:
  ```css
  /* Handy: Hilfsklassen und Tabellen mit Kernspalten (kein seitliches Scrollen) */
  .ph-hide { display: none !important; }
  .ph-only { display: revert; }
  .popover .item.ph-only { display: flex; }
  .tbl.ph-fit { min-width: 0; }
  .tbl.ph-fit th, .tbl.ph-fit td { padding-left: 8px; padding-right: 8px; }
  .tbl.ph-fit td.ph-wrap { white-space: normal; }
  .tbl.ph-fit .sub.ph-only { display: block; margin-top: 2px; white-space: normal; }
  .tbl.ph-fit .badge, .tbl.ph-fit td.dir-cell .badge { min-width: 0; padding: 0 3px; gap: 0; }
  .tbl.ph-fit .badge .bl { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  ```
  Hinweis: Z. 3056 (`.tbl th, .tbl td { padding: 9px 10px; … }`) bleibt für Tabellen ohne `ph-fit`.

**A2 Wischleisten-Auslauf** (bereich_statistik-47, responsiv-40, bereich_notebook_news-12; die allgemeine Regel gilt auch für `.set-nav`, ändert dort aber nicht den Aufbau, siehe 6)
- Nach Z. 1513 global ergänzen:
  ```css
  /* Wischleisten: an dem Rand, hinter dem es weitergeht, weich auslaufen (App.edgeFade setzt fade-l / fade-r) */
  :is(.tabs, .prop-tabs, .prop-sub, .set-nav).fade-r { -webkit-mask-image: linear-gradient(90deg, #000 calc(100% - 28px), transparent); mask-image: linear-gradient(90deg, #000 calc(100% - 28px), transparent); }
  :is(.tabs, .prop-tabs, .prop-sub, .set-nav).fade-l { -webkit-mask-image: linear-gradient(90deg, transparent, #000 28px); mask-image: linear-gradient(90deg, transparent, #000 28px); }
  :is(.tabs, .prop-tabs, .prop-sub, .set-nav).fade-l.fade-r { -webkit-mask-image: linear-gradient(90deg, transparent, #000 28px, #000 calc(100% - 28px), transparent); mask-image: linear-gradient(90deg, transparent, #000 28px, #000 calc(100% - 28px), transparent); }
  ```
- `.nb-toolbar` bekommt keine Maske (siehe B10).
- Z. 1896 (`.set-nav { …; scrollbar-width: thin; }`) → `scrollbar-width: none;` und direkt danach `.set-nav::-webkit-scrollbar { display: none; }` (Wischleisten-Regel, README Z. 361).

**A3 Eingabefelder 16 px** (responsiv-9, typografie-26)
- Im Block `@media (max-width: 560px)` am **Ende des Blocks** (nach Z. 3059, vor der schließenden Klammer) ergänzen:
  ```css
  /* iOS Safari zoomt bei Feldern unter 16px beim Antippen: alle Felder am Handy 16px (Notiztitel ist größer und bleibt) */
  input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=color]):not([type=file]):not(.note-title), select, textarea { font-size: 16px !important; }
  input.input, select.select { line-height: 20px; } /* einzeilige Felder bleiben 42px hoch */
  ```
- web/app.html:5 bleibt unverändert (kein `maximum-scale`).

**A4 Safe Area und Seitenränder** (responsiv-16, responsiv-21, responsiv-15, bereich_shell-31)
- Z. 212–213 `.topbar { position: sticky; top: env(safe-area-inset-top, 0px); …; padding: 12px var(--gutter); … }` → `top: 0;` und `padding: calc(12px + env(safe-area-inset-top, 0px)) var(--gutter) 12px;` (Rest unverändert).
- Z. 924 (Block ≤ 960 px) `.topbar { padding: 10px 12px; min-height: 60px; gap: 8px; flex-wrap: nowrap; }` → `.topbar { padding: calc(10px + env(safe-area-inset-top, 0px)) max(16px, env(safe-area-inset-right, 0px)) 10px max(16px, env(safe-area-inset-left, 0px)); min-height: 60px; gap: 8px; flex-wrap: nowrap; }`; direkt danach neu: `.topbar .menu-btn { margin-left: -9px; } /* 18-px-Glyphe auf der Inhaltskante x=16 */` (nur in diesem Block, der Menüknopf ist auf dem Desktop ebenfalls sichtbar).
- Z. 934 `.content { padding: 16px 16px 60px; --gutter: 16px; }` → `.content { padding: 16px max(16px, env(safe-area-inset-right, 0px)) 60px max(16px, env(safe-area-inset-left, 0px)); --gutter: 16px; }`
- Z. 2998 `.content { padding-bottom: 104px; }` → `.content { padding-bottom: calc(104px + env(safe-area-inset-bottom, 0px)); }`
- Z. 3019 `.dash-head .tl { position: fixed; right: 16px; …` → `right: calc(16px + env(safe-area-inset-right, 0px));` (Rest unverändert).

#### B – Komponenten

**B1 Seitenleiste Desktop: Dichte und klebende Konto-Karte** (responsiv-14, bereich_shell-16)
- Z. 146–157 (Kommentar „niedrige Fenster …“ und beide Blöcke `@media (min-width: 961px) and (max-height: 1060px)` / `(max-height: 940px)`) unverändert ausschneiden und direkt nach Z. 187 (`.sidebar .spacer { flex: 1; }`) einfügen, vor „Seitenleiste eingeklappt“.
- Z. 139 `padding: 22px 14px 18px;` → `padding: 22px 14px 0;`
- Z. 232 `.sb-userwrap { margin-top: 10px; flex: 0 0 auto; }` → `.sb-userwrap { position: sticky; bottom: 0; z-index: 1; flex: 0 0 auto; margin-top: 2px; padding: 8px 0 18px; background: var(--bg-2); } /* Konto-Karte bleibt sichtbar, die Navigation scrollt darunter */`

**B2 Schublade (≤ 960 px)** (bereich_shell-16, responsiv-15, barrierefreiheit-30, bereich_shell-31)
- Z. 918 `.sidebar { position: fixed; …; transform: translateX(-102%); transition: transform var(--dur-2) var(--ease); …}` → in derselben Regel ergänzen bzw. ändern: `padding: calc(22px + env(safe-area-inset-top, 0px)) 14px 0 calc(14px + env(safe-area-inset-left, 0px)); visibility: hidden; transition: transform var(--dur-2) var(--ease), visibility 0s linear var(--dur-2);`
- Z. 920 `.sidebar.open { transform: none; }` → `.sidebar.open { transform: none; visibility: visible; transition: transform var(--dur-2) var(--ease), visibility 0s; }`
- Im selben Block neu: `.sidebar .sb-userwrap { padding-bottom: calc(18px + env(safe-area-inset-bottom, 0px)); }` und `.brand .sb-toggle { width: 40px; height: 40px; margin-right: -6px; }`
- Direkt nach dem Block (nach Z. 944) neu:
  `@media (max-width: 960px) and (max-height: 940px) { .sidebar .nav.nav-group + .nav.nav-group { margin-top: 16px; } .sidebar .brand { padding-bottom: 14px; } }`
  Die Innenabstände der Einträge (`.nav a` 8 px oben/unten) bleiben.

**B3 Konto-Knopf** (bereich_dashboard-4, responsiv-1, zustaende-29)
- Nach Z. 1332 global: `[data-pop="account"] > span { max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }`
- Im Block ≤ 560 px neu:
  `.acc-iconm > [data-pop="account"] { width: 40px; padding-left: 0; padding-right: 0; }`
  `.acc-iconm > [data-pop="account"] > span { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }`
  `.acc-iconm > [data-pop="account"] .caret { display: none; }`

**B4 Menüs am Handy** (responsiv-24, bereich_dashboard-27)
- Z. 3050 `.popover { max-width: calc(100vw - 16px); }` → `.popover { max-width: calc(100vw - 32px); }`, darunter neu:
  ```css
  /* Menüs der Kopfreihe: volle Breite der Kopfreihe (16px Seitenrand), direkt unter ihr */
  .dash-head { position: relative; }
  .dash-head .popwrap { position: static; }
  .dash-head .popover, .dash-head .popover.range-pop { left: 0 !important; right: 0; width: auto; max-width: none; }
  ```
  (`!important` schlägt den Inline-Wert aus `fitPopover`.)

**B5 Tabellen** (zustaende-31, zustaende-32, responsiv-7, responsiv-3)
- Nach Z. 615 neu: `.tbl.day-tbl { min-width: 560px; } /* Trades des Tages: früher Inline-Stil in day.js */`
- Nach Z. 610 neu: `.recent-wrap td.sym .sym-t { display: inline-block; max-width: 7.5em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; vertical-align: bottom; }`
- Nach Z. 624 neu: `.tbl .chip.setup { display: inline-block; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; vertical-align: middle; }`
- Z. 1754 `@media (max-width: 960px) { .pager { … } .pager .pg-sep { display: none; } }` → in diesem Block ergänzen: `.tbl-wrap.paged .tbl-scroll { max-height: none; overscroll-behavior: auto; } /* unter 961px keine Scrollbox in der scrollenden Seite */` (steht nach Z. 1740 und gewinnt).

**B6 Kachelreihen und Dashboard-Raster** (abstaende_layout-15, abstaende_layout-16, bereich_prop-13, bereich_trades_tag-32, responsiv-2)
- Z. 1773 `@media (max-width: 1240px) { .dash-top { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); } }` ersetzen durch:
  ```css
  /* Kachelreihen ab 961px: bis vier Kacheln in einer Reihe (Dashboard: Grundregel repeat(--n)) */
  @media (min-width: 961px) {
    .grid.tiles.kstrip:has(> :nth-child(4):last-child) { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .grid.tiles.kstrip:has(> :nth-child(5):last-child) { grid-template-columns: repeat(5, minmax(0, 1fr)); }
    .tl-fit > .grid.tiles { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  }
  /* 961–1240px: fünf Kacheln als 3 + 2, Dashboard-Raster mit zwei Spalten */
  @media (min-width: 961px) and (max-width: 1240px) {
    .dash-top:has(> :nth-child(5):last-child), .grid.tiles.kstrip:has(> :nth-child(5):last-child) { grid-template-columns: repeat(6, minmax(0, 1fr)); }
    .dash-top:has(> :nth-child(5):last-child) > *, .grid.tiles.kstrip:has(> :nth-child(5):last-child) > * { grid-column: span 2; }
    .dash-top:has(> :nth-child(5):last-child) > :nth-child(n + 4), .grid.tiles.kstrip:has(> :nth-child(5):last-child) > :nth-child(n + 4) { grid-column: span 3; }
    .dash-main { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .dash-main > .w.sz-gross, .dash-main > .skel.sz-gross, .dash-main > .add-slot.gap.sz-gross { grid-column: span 2; }
  }
  ```
  (Steht nach Z. 1593, gewinnt gegen `.add-slot.gap.sz-gross`.)
- Im Block `@media (max-width: 960px)` (Z. 1774 ff.) ergänzen: `.tl-fit > .grid.tiles { grid-template-columns: repeat(2, minmax(0, 1fr)); }`
- Im Block `@media (min-width: 961px)` (Z. 957–970) nach Z. 968 ergänzen: `.tl-fit > .tbl-wrap.paged { min-height: 256px; } /* mind. drei Zeilen; sonst scrollt die Seite */`
- Nach Z. 2745 (Ende des Prop-Blocks, nach `.prop-tiles .tile .val` Z. 2684) neu: `@container (max-width: 200px) { .kstrip .tile .val { font-size: 20px; } }`

**B7 Statistik-Übersicht** (bereich_statistik-21)
- Z. 636 `.stat-tile { … min-width: 0; transition: … }` → zusätzlich `display: flex; flex-direction: column; container-type: inline-size;`
- Z. 639 `.stat-tile .v { …; margin-top: 8px; … }` → `margin-top: auto; padding-top: 8px;`
- Z. 640 `@media (max-width: 1100px) { .stat-tiles { … repeat(2 … } }` → `@media (max-width: 760px) { … }` (Inhalt gleich).
- Nach Z. 641 neu:
  ```css
  @container (max-width: 175px) { .stat-tile .v { font-size: 20px; } }
  .grid.three.st-cards { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  @media (max-width: 1100px) { .grid.three.st-cards { grid-template-columns: repeat(2, minmax(0, 1fr)); } .grid.three.st-cards > :nth-child(3) { grid-column: 1 / -1; } }
  @media (max-width: 560px) { .grid.three.st-cards { grid-template-columns: minmax(0, 1fr); } }
  ```

**B8 Notebook-Spalten** (bereich_notebook_news-1)
- Z. 1061 `@media (max-width: 1180px) { .nb { grid-template-columns: 210px 260px minmax(0, 1fr); } .nb.no-left { … } }` ersetzen durch:
  ```css
  /* Spalten nach Inhaltsbreite (nicht Fensterbreite): Seitenleiste offen oder eingeklappt zählt mit */
  @media (min-width: 961px) { .content:has(> .nb) { container: nbc / inline-size; } }
  @container nbc (max-width: 1159px) { .nb { grid-template-columns: 210px 260px minmax(0, 1fr); } .nb.no-left { grid-template-columns: 260px minmax(0, 1fr); } }
  @container nbc (max-width: 999px) {
    .nb, .nb.no-left { grid-template-columns: 260px minmax(0, 1fr); }
    .nb > .col.left, .nb[data-view="folders"] > .col.mid { display: none; }
    .nb[data-view="folders"] > .col.left { display: flex; }
    .nb .col.mid .back { display: inline-flex; }
    .nb .collapse-left, .nb .col.mid [data-action="nb-left-toggle"] { display: none; }
  }
  @container nbc (max-width: 699px) {
    .nb, .nb.no-left { grid-template-columns: minmax(0, 1fr); }
    .nb > .col { display: none; }
    .nb[data-view="folders"] > .col.left, .nb[data-view="list"] > .col.mid, .nb[data-view="note"] > .col.right { display: flex; }
    .nb .back { display: inline-flex; }
  }
  ```
  Z. 1062–1072 (≤ 960 px) bleiben unverändert.

**B9 Bottom-Sheet** (bewegung-29)
- Nach Z. 2375 neu: `@keyframes sheet-in { from { transform: translateY(100%); } }` und `@keyframes sheet-out { to { transform: translateY(100%); } }`
- Im Block ≤ 560 px nach Z. 3059 neu:
  `.modal { animation: sheet-in var(--dur-3) var(--ease) backwards; }`
  `.modal-bg.out { animation-duration: var(--dur-2); }`
  `.modal-bg.out .modal { animation: sheet-out var(--dur-2) var(--ease-in) forwards; }`

**B10 Editor-Werkzeugleiste am Handy** (bereich_notebook_news-12, responsiv-40)
- Im Block ≤ 560 px direkt nach Z. 3015 neu:
  ```css
  /* Formatierung zuerst; Rückgängig, Wiederholen und Schriftgröße am Ende der wischbaren Zeile (nichts fällt weg) */
  .nb-toolbar { gap: 4px; }
  .nb-toolbar > .sep { display: none; }
  .nb-toolbar > [data-ed="bold"], .nb-toolbar > [data-ed="italic"], .nb-toolbar > [data-ed="underline"], .nb-toolbar > [data-ed="strike"] { order: -1; }
  .nb-toolbar > .size, .nb-toolbar > [data-ed="undo"], .nb-toolbar > [data-ed="redo"] { order: 1; }
  .nb-toolbar .tb.turn { min-width: 84px; }
  /* Auslauf als klebender Verlauf statt Maske: die Leiste enthält Menüs, eine Maske würde sie abschneiden */
  .nb-toolbar::before, .nb-toolbar::after { content: ''; position: sticky; z-index: 1; flex: 0 0 28px; align-self: stretch; pointer-events: none; visibility: hidden; }
  .nb-toolbar::before { order: -2; left: 0; margin-right: -28px; background: linear-gradient(270deg, transparent, var(--surface)); }
  .nb-toolbar::after { order: 2; right: 0; margin-left: -28px; background: linear-gradient(90deg, transparent, var(--surface)); }
  .nb-toolbar.fade-l::before, .nb-toolbar.fade-r::after { visibility: visible; }
  ```

**B11 Skelett am Handy** (bereich_shell-5)
- Nach Z. 1539 global: `.boot-top .skel.mb, .boot-head .skel.m { display: none; }`
- Z. 1554 (Block ≤ 960 px) ersetzen:
  - `.boot-top { padding: 12px 16px; }` → `.boot-top { min-height: 60px; padding: 10px 16px; }`
  - `.boot-top .skel:not(.t):not(.av) { display: none; }` → `.boot-top .skel:not(.t):not(.av):not(.mb) { display: none; } .boot-top .skel.mb { display: block; width: 20px; height: 20px; border-radius: 6px; margin-right: 7px; } .boot-top .skel.av { width: 34px; height: 34px; }` (Titel-Platzhalter bei x = 16 + 20 + 7 + 8 = 51 wie der echte Titel nach A4)
  - `.boot-head { display: none; }` → `.boot-head { display: flex; justify-content: flex-start; min-height: 46px; } .boot-head .skel { width: 40px; height: 40px; } .boot-head .skel.tl { order: -1; width: 166px; height: 42px; margin-left: 0; } .boot-head .skel.m { display: block; }`
  - `.boot-tiles .skel { height: 96px; }` → `.boot-tiles .skel { height: 111px; } .boot-tiles .skel:nth-child(n + 4) { display: block; } .boot-tiles .skel:nth-child(5) { grid-column: 1 / -1; }`
  - `.boot-main .skel { height: 260px; }` → `.boot-main .skel { height: 339px; }`

#### C – Einzelstellen

**C1 Handy-Dashboard** (bereich_dashboard-25, typografie-28, responsiv-41)
- Im Block ≤ 560 px nach Z. 3026: `.dash-top > :last-child:nth-child(odd) { grid-column: 1 / -1; }`
- Z. 3027 `.tile .val { font-size: 21px; }` → `.tile .val { font-size: 20px; }`
- Z. 1735 `.tile.spark-tile .val { …; font-size: 28px; … }` → `font-size: 28px;` streichen (Rest der Regel bleibt).
- Im Block ≤ 560 px neu: `.dash-top .w-bar .w-name { display: none; } .dash-top .w-bar { justify-content: space-between; } .w-bar .mv .btn, .w-bar .rm { width: 40px; height: 40px; padding: 0; justify-content: center; }`

**C2 TradeLog-Filterzeile** (zustaende-30)
- Nach Z. 1743 neu: `.tl-filters .select { max-width: 200px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; } .tl-count { margin-left: auto; white-space: nowrap; flex: 0 0 auto; }`

**C3 Prop-Karte** (bereich_prop-10)
- Z. 2709 `.prop-meta .kv { padding: 6px 0; flex-wrap: wrap; }` → `.prop-meta .kv { padding: 6px 0; flex-wrap: nowrap; } .prop-meta .kv > span { flex: 0 0 auto; }`
- Z. 2710 `.prop-meta .kv b { text-align: right; }` → `.prop-meta .kv > b { min-width: 0; margin-left: auto; text-align: right; }`

**C4 Coach-Tabelle** (bereich_konto-13)
- Nach Z. 2867 neu:
  `@media (max-width: 1180px) { .coach-tbl .tb-hide { display: none; } .tbl.coach-tbl th, .tbl.coach-tbl td { padding-left: 8px; padding-right: 8px; } }`

**C5 Formular-Raster** (bereich_konto-35)
- Z. 508 `.grid.two { grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); }` → `.grid.two { grid-template-columns: repeat(auto-fit, minmax(min(340px, 100%), 1fr)); }`

**C6 Mentor-Kopf** (bereich_training-38)
- Nach Z. 2364 neu: `@media (max-width: 560px) { .mentor-head { flex-wrap: nowrap; } .mentor-head > div:first-child { min-width: 0; } }`

**C7 Notebook „Teilen“** (bereich_notebook_news-11)
- Z. 3009 `.nb .note-head .row [data-action="nb-share"] { display: none; }` ersatzlos streichen (übernimmt `ph-hide` am Knopf, siehe 3.13). Kommentar Z. 3004 „Teilen steckt auf dem Handy nicht in der Reihe“ → „Teilen steht am Handy im •••-Menü“.

**C8 Schatten-Ich-Tabelle** (bereich_training-27)
- Keine eigene CSS-Regel nötig: `.tbl.ph-fit { min-width: 0 }` (A1, Spezifität 0,2,0) schlägt `.shadow-tbl { min-width: 560px/520px }` (Z. 2437, 2448).

### 3.2 web/js/ui.js

- Z. 147 nach `dateDM(d) { … },` neu: `weekdayShort(d) { return new Date(d).toLocaleDateString(LOC(), { weekday: 'short', day: '2-digit', month: '2-digit' }); }, /* „Do., 08.10.“ (Tabellen am Handy) */` (responsiv-5, bereich_statistik-20)
- Z. 175 `badge`: `…</i>${dir > 0 ? 'LONG' : 'SHORT'}</span>` → `…</i><span class="bl">${dir > 0 ? 'LONG' : 'SHORT'}</span></span>` (responsiv-4, responsiv-7, bereich_trades_tag-5)
- Z. 176 `const chip = (text, kind = '') => \`<span class="chip ${kind}">${esc(text)}</span>\`;` → `const chip = (text, kind = '', tip = '') => \`<span class="chip ${kind}"${tip ? \` data-tip="${esc(tip)}"\` : ''}>${esc(text)}</span>\`;` (zustaende-31)
- Z. 441 `closeModal`: `Mo.leave(bg, 'out', '--dur-1', () => bg.remove())` → `Mo.leave(bg, 'out', window.matchMedia('(max-width: 560px)').matches ? '--dur-2' : '--dur-1', () => bg.remove())` (bewegung-29)

### 3.3 web/js/app.js

- Z. 243–244 `accountControl(o = {})` (bereich_dashboard-4, responsiv-1):
  vorher `return \`<div class="popwrap${o.mobile ? '' : ' hide-m'}"><button type="button" class="btn" data-pop="account" title="Konto: ${esc(accName)}">…`
  nachher
  ```js
  const show = o.mobile || accounts.length > 1; /* unter 961px nur, wenn es etwas zu wechseln gibt oder die Seite keinen Zeitraum hat */
  return `<div class="popwrap${show ? '' : ' hide-m'}${o.iconM ? ' acc-iconm' : ''}"><button type="button" class="btn" data-pop="account" title="Konto: ${esc(accName)}" aria-label="Konto: ${esc(accName)}">…`
  ```
  Kommentar Z. 241 anpassen: „o.mobile: auch bei nur einem Konto unter 961px zeigen; o.iconM: am Handy nur als Symbol“.
- Z. 259 `pageHead`: `this.accountControl({ mobile: !h.range })` → `this.accountControl({ mobile: !h.range, iconM: !!h.range })`
- Z. 161 `fitPopover(pop)`: als erste Zeile `if (pop.id === 'pop-range' && root.RangePicker && root.RangePicker.fit) root.RangePicker.fit(pop); /* ein sichtbarer Monat: bei einer Vorgabe den aktuellen zeigen */` (bereich_dashboard-27)
- Z. 169: `const over = r.right - (right - 8); … Math.max(0, r.left - left - 8)` → davor `const m = window.innerWidth <= 560 ? 16 : 8; /* Handy: 16px Abstand wie der Seitenrand */` und beide `8` durch `m` ersetzen (responsiv-24).
- `renderSidebar()` Z. 200–214 (barrierefreiheit-30):
  - erste Zeile ergänzen: `const wasOpen = sb.classList.contains('open'); const hadFocus = sb.contains(document.activeElement);` (vor dem `innerHTML`-Austausch, `sb` zuerst holen)
  - nach Z. 213 neu:
    ```js
    /* Schublade: offen fängt sie den Fokus, der Inhalt dahinter ist inert; geschlossen kehrt der Fokus an den Menüknopf zurück */
    const main = document.getElementById('main'); if (main) main.inert = open && !desk;
    if (open && !wasOpen && !desk) { const a = sb.querySelector('.nav a.active') || sb.querySelector('.nav a'); if (a) a.focus(); }
    else if (!open && wasOpen && hadFocus) { const b = document.querySelector('.menu-btn'); if (b) b.focus(); }
    ```
- Neue Methode nach `revealActive` (Z. 116) (bereich_statistik-47, responsiv-40, bereich_notebook_news-12):
  ```js
  /* Wischleisten: am Rand, hinter dem es weitergeht, weich auslaufen (fade-l / fade-r); Listener einmal je Leiste */
  edgeFade(scope) {
    (scope || document).querySelectorAll('.tabs, .prop-tabs, .prop-sub, .set-nav, .nb-toolbar').forEach(el => {
      const f = () => { const max = el.scrollWidth - el.clientWidth; el.classList.toggle('fade-l', max > 1 && el.scrollLeft > 2); el.classList.toggle('fade-r', max > 1 && el.scrollLeft < max - 2); };
      if (!el._edgeFade) { el._edgeFade = f; el.addEventListener('scroll', f, { passive: true }); }
      f();
    });
  },
  ```
  Aufrufe: in `render()` nach Z. 107 (`window.scrollTo(…)`) `this.edgeFade(main);`; im Resize-Listener Z. 301 im Timeout zusätzlich `this.edgeFade(document.getElementById('main'));`.

### 3.4 web/js/rangepicker.js (bereich_dashboard-27)

- Nach Z. 27 neu:
  ```js
  /* nur ein Monat sichtbar (Handy, Titelzeile 961–1000px): bei einer Vorgabe den aktuellen Monat zeigen, sonst wie bisher Vormonat + aktueller */
  function oneMonth(box) { const m = box && box.querySelectorAll('.rr-m')[1]; return !!m && getComputedStyle(m).display === 'none'; }
  function presetView(box) { const now = new Date(); return oneMonth(box) ? { y: now.getFullYear(), m: now.getMonth() } : { y: now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear(), m: (now.getMonth() + 11) % 12 }; }
  ```
- Z. 59 `function pick(p) { …; const now = new Date(); st.view = { y: …, m: … }; }` → `function pick(p, box) { …; st.view = presetView(box); }`
- Z. 60 `function setPreset(box, p) { pick(p); refresh(box); }` → `function setPreset(box, p) { pick(p, box); refresh(box); }`
- Neu: `function fit(pop) { const box = pop.querySelector('[data-rr-root]'); if (!box || !st.preset) return; const v = presetView(box); if (v.y !== st.view.y || v.m !== st.view.m) { st.view = v; refresh(box); } }`
- Z. 96 `root.RangePicker = { html, value, init, setPreset };` → `{ html, value, init, setPreset, fit }`

### 3.5 web/js/screens/dash-filter.js (responsiv-24, bereich_dashboard-27)

- Z. 148 Kommentar „auf dem Handy volle Breite mit 8px Rand“ → „mit 16px Rand (Seitenrand)“.
- Z. 153 `const w = phone ? vw - 16 : …` → `phone ? vw - 32 : …`
- Z. 154 `const left = phone ? 8 : …` → `phone ? 16 : …`

### 3.6 web/js/screens/dashboard.js (bereich_dashboard-4)

- Z. 124 `${App.accountControl()}` → `${App.accountControl({ iconM: true })}`

### 3.7 web/js/screens/trades.js (responsiv-4, bereich_trades_tag-5, zustaende-30, zustaende-31, responsiv-3)

- Nach Z. 8 neu: `const PH = ['openedAt', 'symbol', 'direction', 'pnl']; /* am Handy sichtbare Spalten */`
- Z. 39 `<div class="row" style="gap:8px">` → `<div class="row tl-filters" style="gap:8px">`
- Z. 44 `<span class="muted small" style="margin-left:auto">` → `<span class="muted small tl-count">`
- Z. 46 `th`: `class="sortable ${al || ''}"` → `class="sortable ${al || ''}${PH.includes(k) ? '' : ' ph-hide'}"`
- Z. 49 Zeilen:
  - `<td>${fmt.dateFull(t.open)} <span class="muted">${fmt.time(t.open)}</span></td>` → `<td><span class="ph-hide">${fmt.dateFull(t.open)}</span><span class="ph-only">${fmt.dateDM(t.open)}</span> <span class="muted">${fmt.time(t.open)}</span></td>`
  - Status-`td` → `<td class="ph-hide">`, Geschlossen-`td` → `<td class="ph-hide">`, Einstieg/Ausstieg/RR/Regeln/Score-`td` → `class="r ph-hide"`, Setup-`td` → `<td class="ph-hide">`
  - `U.chip(t.setup, 'setup')` → `U.chip(t.setup, 'setup', t.setup.length > 20 ? t.setup : '')`
- Z. 50 `<table class="tbl">` → `<table class="tbl ph-fit">`
- Z. 59 (Verpasste Trades) `U.chip(x.setup, 'setup')` → `U.chip(x.setup, 'setup', x.setup.length > 20 ? x.setup : '')`

### 3.8 web/js/screens/day.js:15 (responsiv-7, bereich_trades_tag-5, zustaende-31)

- `<table class="tbl compact" style="min-width:560px">` → `<table class="tbl compact day-tbl ph-fit">`
- Kopf: `<th>Setup</th><th>Status</th>` → `<th class="ph-hide">Setup</th><th class="ph-hide">Status</th>`; `<th class="r">R</th><th class="r">Score</th>` → `<th class="r ph-hide">R</th><th class="r ph-hide">Score</th>`
- Zeit: `${t.close ? \` – ${fmt.time(t.close)}\` : ''}` → `${t.close ? \`<span class="ph-hide"> – ${fmt.time(t.close)}</span>\` : ''}`
- Setup-`td` → `<td class="ph-hide">`, Chip mit `U.chip(t.setup, 'setup', t.setup.length > 20 ? t.setup : '')`; Status-`td` → `<td class="ph-hide">`; R- und Score-`td` → `class="r ph-hide"`.

### 3.9 web/js/screens/stats.js (responsiv-5, bereich_statistik-20, bereich_statistik-21)

- Z. 26 `<div class="grid three">` → `<div class="grid three st-cards">`
- Z. 32 tabDays: `<table class="tbl compact">` → `<table class="tbl compact ph-fit">`; `th` und `td` von Gewinner, Verlierer, Brutto, Gebühren, Drawdown bekommen zusätzlich `ph-hide` (`class="r ph-hide"`, bei Gewinner/Verlierer `class="r pos ph-hide"` / `class="r neg ph-hide"`, Drawdown `class="r neg ph-hide"`); Tageszelle `<td>${fmt.weekdayLong(d.day)}</td>` → `<td><span class="ph-hide">${fmt.weekdayLong(d.day)}</span><span class="ph-only">${fmt.weekdayShort(d.day)}</span></td>`
- Z. 34 groupTable: `<table class="tbl compact">` → `<table class="tbl compact ph-fit">`; `th`/`td` von „Ø pro Trade“, „Ø R“, „Profit-Faktor“ → `class="r ph-hide"`; erste `td` → `<td class="ph-wrap">`.

### 3.10 web/js/screens/progress.js:82 (bereich_training-24, responsiv-8)

- `<table class="tbl compact">` → `<table class="tbl compact ph-fit">`
- `<th class="r">Gebrochen (Trades)</th><th class="r">Kosten</th>` → `class="r ph-hide"` an beiden; die zugehörigen `td` ebenso.
- Regel-Zelle: `<td style="white-space:normal">${esc(x.rule.text)}</td>` → `<td style="white-space:normal">${esc(x.rule.text)}${x.brokenN ? \`<div class="sub ph-only"><span>${x.brokenN}× gebrochen</span> · ${U.pnl(x.brokenCost)}</div>\` : ''}</td>`

### 3.11 web/js/screens/shadow.js (bereich_training-27)

- Z. 68 `row`: Datum-`td` → `<td class="ph-hide">`; `<td class="sym">` → `<td class="sym ph-hide">`; Regel-`td` → `<td class="ph-wrap">${esc(v.label)}…<div class="sub ph-only">${fmt.dateDM(v.date)} ${fmt.time(v.date)} · ${esc(v.symbol)}</div></td>`; Echt- und Schatten-`td` → `class="r ph-hide"`; letzte Spalte bleibt.
- Z. 71 `<table class="tbl compact shadow-tbl">` → `<table class="tbl compact shadow-tbl ph-fit">`; `th` Datum, Symbol → `class="ph-hide"`, Echt, Schatten → `class="r ph-hide"`.

### 3.12 web/js/screens/prop.js (bereich_prop-21, responsiv-6, bereich_prop-22, bereich_prop-10)

- Z. 75 planText: `if (plan.missingProfit > C.EPS) parts.push(\`Gewinn fehlt: ${fmt.cur(plan.missingProfit)}\`);` → `if (plan.missingProfit > C.EPS && !(ev.target && a.phase !== 'funded')) parts.push(\`${money(a, plan.missingProfit)} fehlen\`); /* mit Ziel-Balken nennt der Balken den Betrag schon */`
- Z. 104 `U.kv(plan.funded ? 'Nächster Payout' : 'Bestehen', …)` → `U.kv(plan.funded ? 'Nächster Payout' : 'Bis zum Bestehen', …)`
- Z. 233 Konten: `<table class="tbl compact prop-acc-tbl">` → `<table class="tbl compact prop-acc-tbl ph-fit">`; `th` Phase, Start, Gruppe → `class="ph-hide"`, Trades → `class="r ph-hide"`; zugehörige `td` ebenso; Konto-`td` → `<td class="ph-wrap">`; Unterzeile `<div class="sub">${nameOf(PD.MARKETS, a.market, 'Futures')}</div>` → `<div class="sub">${nameOf(PD.MARKETS, a.market, 'Futures')}<span class="ph-only"> · ${nameOf(PHASES, a.phase)}</span></div>`. Status und Aktionen (Bearbeiten, Löschen) bleiben sichtbar.
- Z. 263 exRows: Datum-`td` → `<td class="ph-hide">`; Typ-`td` → `<td class="ph-wrap">${nameOf(PD.EXPENSE_TYPES, e.type)}<div class="sub ph-only">${fmt.dateFull(e.date)} · ${a ? esc(accName(a)) : esc(e.firm || '—')}</div></td>`; Firma- und Konto-`td` → `class="ph-hide"`; Notiz-`td` `class="muted"` → `class="muted ph-hide"`.
- Z. 264 Ausgaben-Tabelle `class="tbl compact"` → `class="tbl compact ph-fit"`; `th` Datum, Firma, Konto, Notiz → `class="ph-hide"`.
- Z. 267 poRows: Konto-`td` → `<td class="ph-wrap">${a ? esc(accName(a)) : esc(p.firm || '—')}<div class="sub ph-only">${U.pill(nameOf(PAYOUT_STATUS, p.status), kind)} · <span>Beantragt ${fmt.dateFull(p.requestedAt)}</span></div></td>`; Brutto, Split → `class="r ph-hide"`; Beantragt, Erhalten, Status → `class="ph-hide"`. Netto und Aktionsspalte bleiben.
- Z. 268 Payout-Tabelle `class="tbl compact"` → `class="tbl compact ph-fit"`; `th` Brutto, Split → `class="r ph-hide"`, Beantragt, Erhalten, Status → `class="ph-hide"`.

### 3.13 web/js/screens/notebook.js (bereich_notebook_news-1, bereich_notebook_news-11)

- Z. 74 Kopfzeile: `<button type="button" class="btn ghost sm" data-action="nb-share" …>` → `class="btn ghost sm ph-hide"` (Rest gleich).
- Z. 74 •••-Menü: nach `<button type="button" class="item" data-action="nb-duplicate" …>${I.copy} Duplizieren</button>` einfügen: `<button type="button" class="item ph-only" data-action="nb-share" data-id="${cur.id}">${I.external} Teilen</button>`
- Z. 130 `'nb-view'(el) { st().view = el.dataset.value; App.rerender(); }` → `'nb-view'(el) { const nb = st(); nb.view = el.dataset.value; if (nb.view === 'folders') nb.leftOpen = true; /* sonst wird die Ordner-Spalte gar nicht gerendert */ App.rerender(); }`
- Z. 170 `'nb-share'(el) { flush(); …` → `'nb-share'(el) { App.closePopovers(); flush(); …`

### 3.14 web/js/screens/coach.js (bereich_konto-13)

- Z. 87 statsRow: erste `td` → `<td class="ph-wrap">`; `td` Profit-Faktor, Max. Drawdown, Letzter Eintrag → `class="r ph-hide"`; `td` Ø Gewinn, Ø Verlust → `class="r tb-hide ph-hide"`.
- Z. 113: `<table class="tbl compact coach-tbl">` → `<table class="tbl compact coach-tbl ph-fit">`; `th` entsprechend (`Profit-Faktor`, `Max. Drawdown`, `Letzter Eintrag` → `r ph-hide`; `Ø Gewinn`, `Ø Verlust` → `r tb-hide ph-hide`).

### 3.15 web/js/screens/mentor.js (bereich_training-38)

- Z. 82: `<button type="button" class="btn sm ghost" data-action="mentor-clear" …>${I.trash} Verlauf löschen</button>` → `<button type="button" class="btn sm ghost" data-action="mentor-clear" aria-label="Verlauf löschen" …>${I.trash}<span class="ph-hide">Verlauf löschen</span></button>`
- Z. 84 Platzhalter: `'Schreib dem Mentor … (Enter sendet, Shift+Enter neue Zeile)'` → `(matchMedia('(hover: hover) and (pointer: fine)').matches ? 'Schreib dem Mentor … (Enter sendet, Shift+Enter neue Zeile)' : 'Schreib dem Mentor …')`

### 3.16 web/js/widgets.js:256 (zustaende-32)

- `<td class="sym">${esc(t.symbol)}</td>` → `<td class="sym"><span class="sym-t" title="${esc(t.symbol)}">${esc(t.symbol)}</span></td>`

### 3.17 web/app.html:21 (bereich_shell-5)

- `<div class="boot-top"><span class="skel t"></span>…` → `<div class="boot-top"><span class="skel mb"></span><span class="skel t"></span>…`
- `<div class="boot-head"><span class="skel"></span><span class="skel"></span><span class="skel tl"></span></div>` → `…<span class="skel tl"></span><span class="skel m"></span></div>`

### 3.18 web/js/lang/{en,es,zh,hi,pt}.js

Neue Einträge (Muster wie vorhanden): „Bis zum Bestehen“ (en „To pass“), „{0} fehlen“ (en „{0} to go“), „{0}× gebrochen“ (en „Broken {0}×“), „Beantragt {0}“ (en „Requested {0}“), „Schreib dem Mentor …“ (en „Write to your mentor …“). „Teilen“, „Konto: {0}“, „Verlauf löschen“ prüfen und fehlende Einträge ergänzen. Der Wert der Prop-Karte ist ein einziger Textknoten („in 3 Handelstagen · 1.946,15 $ fehlen“): auf Englisch umschalten und prüfen, dass er vollständig übersetzt wird; fehlt ein Muster für die Kombination, die Teile in planText je in ein eigenes `<span>` setzen.

### 3.19 web/README.md

- Z. 51: „Auf niedrigen Bildschirmen etwas dichter.“ → „Auf niedrigen Bildschirmen etwas dichter; die Konto-Karte klebt unten, die Navigation scrollt darunter.“
- Z. 62–64: „…auf dem Handy in der Kopfreihe)“ → „…auf dem Handy in der Kopfreihe; der Konto-Knopf erscheint unter 961px nur bei mehr als einem Konto, am Handy als Symbol)“.
- Z. 67: „unten ein 3-Spalten-Raster“ → „unten ein 3-Spalten-Raster (961–1240px: zwei Spalten, oben fünf Kacheln als 3 + 2)“.
- Z. 76–77: „(Handy: einer)“ → „(Handy: einer; bei einer Vorgabe der aktuelle Monat)“; „auf dem Handy volle Breite“ → „auf dem Handy wie alle Menüs der Kopfreihe volle Breite mit 16px Rand“.
- Z. 92: „Tabellen kompakt ohne Zeilenumbruch“ → „Tabellen nur mit Kernspalten (Name/Datum, Kernwert, Aktionen; Nebeninfos in einer Unterzeile), kein seitliches Scrollen; Eingabefelder 16px; Dialoge gleiten von unten herein“.
- Z. 96: „„Teilen“ nur ab 561px“ → „„Teilen“ ab 561px in der Reihe, darunter im •••-Menü“; Werkzeugleiste: „Formatierung zuerst, Rückgängig/Wiederholen/Größe am Ende“.
- Z. 101: „Ab 961px bleibt alles wie gehabt“ → „Ab 961px gelten die Desktop-Regeln (961–1240px: Dashboard zweispaltig, Kachelreihen 4 bzw. 3 + 2)“.
- Z. 106–107: nach „die Seite selbst scrollt nicht.“ ergänzen: „Ist das Fenster für drei Tabellenzeilen zu niedrig, scrollt die Seite. Unter 961px scrollt die Tabelle mit der Seite (keine eigene Box).“
- Z. 120: „drei Spalten (Ordner und Tags, Notizliste, Notiz)“ → „drei Spalten (…); bei schmalem Inhalt (unter 1000px) Liste und Notiz, die Ordner über „Zurück“, unter 700px eine Spalte“.
- Z. 361: „Waagerechte Reiterleisten haben keinen sichtbaren Scrollbalken.“ → „… keinen sichtbaren Scrollbalken; am Rand, hinter dem es weitergeht, laufen sie weich aus (`App.edgeFade`).“

### 3.20 web/e2e/*.js

- `mobiletest.js:34`: `tabs.pad === '9px 10px'` → `'9px 8px'`; Text „Tabellenzellen kompakt ohne Umbruch“ → „Tabelle mit Kernspalten, P&L im Bild“ und zusätzlich prüfen: `.tl-fit .tbl-scroll` `scrollWidth <= clientWidth + 1` und die letzte sichtbare `td` endet ≤ 374 px.
- `mobiletest.js`: neue Prüfungen aus Abschnitt 4 (A-Handy) ergänzen.
- `proptest.js:103`: Regex `/in \d+ Handelstag|Gewinn fehlt|bereit|Consistency/` → `/in \d+ Handelstag|fehlen|bereit|Consistency/`.
- `tlfittest.js`: unverändert lassen (muss grün bleiben); neue Suite `tablettest.js` für 1024 × 768 (Abschnitt 4, B) und in `runall.sh` eintragen.

---

## 4. Akzeptanzkriterien

Aufbau: Playwright, `file:///home/user/Florian/web/app.html`, Beispieldaten (`Store.installSample()`), Zeitraum „Gesamt“, dunkel; Stichproben hell. Für Konto-Prüfungen ein zweites Konto anlegen (`Store.addAccount({ name: 'Apex Trader Funding 150K Evaluation Konto Nr. 3', size: 150000, currency: 'USD' })`).

### A – Handy 390 × 844 (`isMobile`, `hasTouch`)

1. Konto (bereich_dashboard-4, responsiv-1): Mit zwei Konten ist `[data-pop="account"]` auf `#/dashboard`, `#/stats`, `#/trades`, `#/day`, `#/progress`, `#/shadow` sichtbar (`offsetParent !== null`), 40 × 40 px (± 2), `aria-label` beginnt mit „Konto:“, Menü öffnet und wechselt das Konto. Mit einem Konto: unsichtbar wie heute. Mentor zeigt den Namen.
2. Kein seitlicher Überlauf: Für jede `.tbl-wrap`/`.tbl-scroll` auf `#/trades`, `#/day/<Tag mit Trades>`, `#/stats/days`, `#/stats/setups`, `#/progress`, `#/shadow`, `#/prop/bilanz`, `#/prop/konten`, Coach-Gruppe gilt `scrollWidth <= clientWidth + 1`; die Kernwert-Zelle (P&L/Betrag/Netto/Kosten) endet ≤ 374 px. Referenz Prototyp: 356/356 bzw. 314–316/314–316.
3. Funktionen in Tabellen: Löschen (Ausgaben, Payouts, Konten), „Erhalten“ (beantragter Payout) und Bearbeiten (Konten) sind sichtbar und klickbar.
4. TradeLog-Box (responsiv-3): `.tbl-wrap.paged .tbl-scroll` hat `max-height: none`; `window.scrollBy(0, 600)` über der Tabelle bewegt `scrollY`.
5. Eingabefelder (responsiv-9, typografie-26): Auf `#/trades`, `#/settings/profil`, `#/notebook`, `#/shadow` und im Dialog „Trade loggen“ hat jedes sichtbare `input` (ohne checkbox/radio/range/color/file/`.note-title`), `select`, `textarea` `font-size >= 16px`; `.input` und `.select` sind 42 px hoch (± 1).
6. Menüs (responsiv-24, bereich_dashboard-27): `#pop-range`, `#pop-tpl`, `#pop-cert`, `#pop-account` und `#fd-pop` haben `left = 16 ± 1`, `right = 374 ± 1`. Mit „Dieser Monat“ zeigt der einzige sichtbare Monat (das `.rr-m` in `#pop-range`, dessen berechnetes `display` nicht `none` ist) in `.rr-m-title` den aktuellen Monat (Oktober 2026 bei Datum 13.10.2026). Ein gespeicherter eigener Zeitraum 03.–20.09. zeigt weiter September.
7. Wischleisten (bereich_statistik-47): `#/stats` `.tabs.scroll-x` hat `fade-r`, nicht `fade-l`; nach `scrollLeft = scrollWidth` nur `fade-l`; `getComputedStyle(...).maskImage` ≠ `none`.
8. Editor (bereich_notebook_news-12, responsiv-40): In der Notiz-Ansicht liegen B, I, U, S vollständig im Bild (`right <= toolbar.right`), Reihenfolge B < I < U < S < Einfügen < Text; Rückgängig, Wiederholen und Schriftgröße existieren und sind per Scrollen erreichbar; `.nb-toolbar` hat `fade-r` bei `scrollLeft = 0`; Prüfbild wie respspec/tb0.png. mobiletest „Werkzeugleiste eine Zeile, seitlich wischbar“ bleibt grün.
9. Teilen (bereich_notebook_news-11): Das •••-Menü enthält einen sichtbaren Eintrag „Teilen“, Klick öffnet „Notiz teilen“ und schließt das Menü. Bei 1440 px ist der Menüeintrag unsichtbar, der Kopfzeilen-Knopf sichtbar.
10. Dashboard (bereich_dashboard-25, typografie-28, responsiv-41): Die fünfte Kachel ist 358 px breit (± 2); `.tile .val`, `.tile.spark-tile .val` (TradeLog), `.prop-tiles .tile .val`, `.stat-tile .v` sind 20 px. Im Bearbeitungsmodus ist `.dash-top .w-bar .w-name` `display: none`, Pfeile und × 40 × 40.
11. Schublade (bereich_shell-16, responsiv-15, barrierefreiheit-30, bereich_shell-31): Bei 390 × 844 und 390 × 664 liegt `.sb-user` vollständig im Fenster (`bottom <= innerHeight`), und im Streifen unter der Karte scheint keine Navigation durch (`elementFromPoint(sidebar.left + 40, innerHeight - 4)` liefert `.sb-userwrap` oder ein Kind davon); Schließen-Knopf 40 × 40; geschlossen: `getComputedStyle(sidebar).visibility === 'hidden'` und Tab vom Menüknopf aus landet nicht in der Leiste; geöffnet: `document.activeElement` liegt in `#sidebar`, `#main.inert === true`; Escape → Fokus auf `.menu-btn`, `inert === false`. Zeilenhöhe `.nav a` 39 px (± 1).
12. Titelzeile (bereich_shell-31): Menü-Glyphe (`.menu-btn svg`) `left = 16 ± 1`; Avatar `right = 374 ± 1`; Titel `h1` `left = 51 ± 2`.
13. Skelett (bereich_shell-5): Beim Start (Seite vor dem ersten Render, wie loadtest) `.boot-top` 61 px hoch (60 + Rand, ± 1), Titel-Platzhalter `left = 51 ± 2`, `.boot-head` sichtbar mit 4 Platzhaltern, 5 Kachel-Platzhalter à 111 px, der fünfte volle Breite, Karte 339 px; Vergleich `boot_mobile.png` gegen `boot_mobile_fertig.png` ohne Sprung der Kachelreihe (y 140 ± 4).
14. Mentor (bereich_training-38): `.mentor-head` ≤ 64 px hoch, Löschen-Knopf ohne sichtbaren Text mit `aria-label`; Platzhalter „Schreib dem Mentor …“.
15. Prop-Karte (bereich_prop-10): In jeder `.prop-meta .kv` haben Label und Wert dieselbe obere Kante (± 2 px); Wert rechtsbündig; kein „Gewinn fehlt“ im DOM.
16. Bottom-Sheet (bewegung-29): `getComputedStyle(.modal).animationName === 'sheet-in'`; beim Schließen hat `.modal-bg.out .modal` `sheet-out`, `.modal-bg.out` 240 ms.
17. Safe Area (responsiv-16, responsiv-21): `grep -c "env(safe-area-inset-left" web/css/app.css` ≥ 2, `grep -c "env(safe-area-inset-right" web/css/app.css` ≥ 3; `.content` `padding-bottom` = 104 px ohne Inset.
18. Coach-Beitritt (bereich_konto-35): Namensfeld endet ≤ Innenkante der Karte (≤ 357 px).

### B – Tablet quer 1024 × 768 und schmaler Desktop

1. Dashboard (abstaende_layout-15, abstaende_layout-16): `.dash-main` hat zwei Spalten (`gridTemplateColumns` mit 2 Werten); oben 3 + 2 Kacheln, keine leere Zelle, beide Reihen gleich hoch (± 2); in „Letzte Trades“ ist die P&L-Spalte sichtbar und das Abzeichen nicht abgeschnitten; Score-Skala-Beschriftungen überlappen nicht (Abstand benachbarter Labels > 0). Bei 1241 px wieder drei Spalten und fünf Kacheln in einer Reihe. Bearbeitungsmodus bei 1024: kein implizites drittes Raster-Feld (`gridTemplateColumns` weiter 2 Werte).
2. Prop (bereich_prop-13): `#/prop` vier Kacheln in einer Reihe (gleiche `top`), `#/prop/bilanz` 3 + 2, `#/prop/friedhof` und Affiliate (4 bzw. 5) ebenso; kein Wert läuft über (`scrollWidth <= clientWidth` je `.val`). Bei 390 px weiter zwei Spalten.
3. TradeLog (responsiv-2, bereich_trades_tag-32): vier Kacheln in einer Reihe; ≥ 3 vollständige Tabellenzeilen sichtbar oder nach `scrollTo(0, 1e4)` erreichbar; Seitenwähler nach dem Scrollen voll sichtbar. `e2e/tlfittest.js` (1440 × 900, 1280 × 720, 1100 × 800) bleibt unverändert grün.
4. Notebook (bereich_notebook_news-1): Notiz-Spalte ≥ 440 px (Prototyp: 470 px bei offener, 622 px bei eingeklappter Seitenleiste); Zurück in der Liste zeigt die Ordner, Klick auf einen Ordner zeigt wieder die Liste. 1366 × 768: drei Spalten (210/260/588 ± 2). 1440 × 900: 236/300/596 wie heute.
5. Statistik (bereich_statistik-21): `#/stats` Übersicht 4 Spalten, 4 Reihen; Werte einer Reihe auf gleicher Unterkante (± 1); Seite deutlich kürzer als 2037 px (Ziel ≤ 1700 px); Karten „Serien“ und „Drawdown & Risiko“ nebeneinander, „Haltedauer“ volle Breite.
6. Reiter (bereich_statistik-47): Bei 1024 px hat `.tabs.scroll-x` `fade-r`, falls `scrollWidth > clientWidth`.
7. Seitenleiste (responsiv-14): Bei 1024 × 768 `getComputedStyle(.nav a).paddingTop === '5px'`, Gruppenabstand 12 px, `.sb-user` vollständig sichtbar (`bottom <= 768 − 17`). Bei 1024 × 700 und eingeklappt ebenso; nichts scheint unter der Karte durch. `sidebartest.js` (1440 × 1000) grün.
8. Coach (bereich_konto-13): Schülertabelle bei 1024 und 390 ohne seitlichen Überlauf.

### C – Lange Inhalte (1440, 1024, 390; zustaende-29/-30/-31/-32)

1. Kontoname „Apex Trader Funding 150K Evaluation Konto Nr. 3“: Name-Span ≤ 180 px; TradeLog-Kopfreihe bei 1200 px einzeilig (Höhe 40 ± 2 statt 66).
2. Setup „Opening-Range-Breakout nach Nachrichten-Spike“: Filter-`select` ≤ 200 px, „x von y Trades“ in derselben Zeile wie die Filter bei 1440 px; Setup-Chip in Tabelle ≤ 150 px mit `data-tip`; Spalten Regeln und Score bei 1440 sichtbar ohne seitliches Scrollen.
3. Symbol „MNQZ2026-CME“ in „Letzte Trades“: P&L-Zelle vollständig (`scrollWidth <= clientWidth` in `.recent-wrap`), Symbol endet mit „…“.

### D – grep-Prüfungen

- `grep -n 'style="min-width:560px"' web/js/screens/day.js` → keine Treffer.
- `grep -n 'note-head .row \[data-action="nb-share"\]' web/css/app.css` → keine Treffer.
- `grep -n "@media (max-width: 1180px) { .nb {" web/css/app.css` → keine Treffer.
- `grep -n "auto-fit, minmax(200px, 1fr)" web/css/app.css` → keine Treffer.
- Zeile von `@media (min-width: 961px) and (max-height: 1060px)` > Zeile von `.sidebar .spacer` (`grep -n`).
- `grep -c "ph-fit" web/js/screens/{trades,day,stats,progress,shadow,prop,coach}.js` → zusammen 10.
- `grep -n "maximum-scale\|user-scalable" web/app.html` → keine Treffer.
- `grep -n "Gewinn fehlt" web/js/screens/prop.js` → keine Treffer.

### E – Regression

`web/e2e/runall.sh` vollständig grün (mit den Anpassungen aus 3.20). Screenshot-Atlas dark/light 390 und 1024 für die oben genannten Routen neu aufnehmen und gegen `shots/dark-390/*` bzw. `shots/dark-1024/*` vergleichen; 1440 darf sich nur bei Spark-Kachel (25 statt 28 px) und Seitenleisten-Karte (klebt) unterscheiden.

---

## 5. Zurückgestellt

Kein Befund dieser Gruppe wird vollständig zurückgestellt. Bewusst **nicht** übernommen werden folgende Teil-Vorschläge:

| Herkunft | Teil-Vorschlag | Grund |
|---|---|---|
| responsiv-21 (Prüfer-Anmerkung) | Runden Knopf beim Scrollen aus- und einblenden | Neue scrollgebundene Bewegung; BRIEF: Eingangs-Animationen nur beim Seitenwechsel, nichts hinzufügen. Überdecken beim Scrollen ist bei einem schwebenden Knopf normal; das letzte Element bleibt durch den Innenabstand erreichbar. Das Überdecken des Monatspfeils auf „Fortschritt“ im Ruhezustand wäre ein eigener Befund (nicht in dieser Liste). |
| bereich_trades_tag-5 | Zeilen als Kartenraster (`display: grid` auf `tr`, `display: block` auf `table`) | Ersetzt durch die einheitliche Kernspalten-Regel (K4). |
| abstaende_layout-18 (Ergänzung zu bereich_statistik-47) | Reiterleiste ab 961 px umbrechen | Zweizeilige Leiste; README „Reiter in einer Reihe“. Auslauf statt Umbruch. |
| bereich_prop-22 (Prüfer-Fassung) | Löschen-Symbol am Handy ausblenden | Funktion; die Messung zeigt, dass es passt. |
| bereich_dashboard-4 (Prüfer-Fassung, Punkt 4) | Zertifikat-Knopf am Handy ausblenden, falls die Kopfreihe umbricht | Funktion; Umbruch ist erlaubt. |
| bereich_shell-16 (Prüfer-Fassung) | Navigationszeilen der Schublade auf 35 px verdichten | Fingerziel; der Befund selbst schließt es aus. |
| bereich_notebook_news-12, responsiv-40 (Originale) | Rückgängig/Wiederholen bzw. Schriftgröße am Handy ausblenden | Funktion (kein Strg+Z am Handy). |
| bereich_notebook_news-1 (Original) | Ordner als schwebendes Overlay mit eigenem Schließen-Verhalten | Mehr neues Verhalten; der vorhandene Zurück-Knopf löst es ohne neues Element. |
| responsiv-2 (Original) | TradeLog-Einpassung nur ab 900 px Fensterhöhe | Nimmt Laptops (≈ 780–820 px Fensterhöhe) die gewollte Einpassung. |
| typografie-28 (Original) | Seitentitel am Handy 17 → 18 px, `.prop-balance .val` angleichen | Kein Fehler (Leistentitel, eigene Rolle); Geschmack. |
| – | TradeLog-Tabelle bei 961–1279 px ohne seitliches Scrollen | Nicht Teil der Befunde; README sagt „passt ab 1280 px“. Bleibt wie heute. |

---

## 6. Nutzer fragen

**bereich_einstellungen-22 – Einstellungen am Handy als Liste statt waagerechter Leiste** (Prüfer: „berührt Vorgaben: ja“; ändert den Aufbau eines Bereichs).
Heute: unter 961 px werden zwölf Abschnitte zu einer wischbaren Leiste, bei 390 px sieht man „Profil, Design, Sprache, Be…“ (dark-390/settings.png). Vorschlag: Am Handy zeigt `#/settings` eine senkrechte Liste aller Abschnitte (48 px hohe Zeilen, Gruppen wie am Desktop, Pfeil rechts); ein Abschnitt öffnet sich als eigene Seite mit „‹ Einstellungen“ oben. Umsetzung rein per CSS-Klasse `is-index` (misc.js render, CSS im 560er-Block), Desktop und 561–960 px unverändert; `#/settings` zeigt dort weiter Profil.
Frage an den Nutzer: „Sollen die Einstellungen am Handy als Liste mit Unterseiten erscheinen (wie in iOS-Einstellungen) statt als seitlich wischbare Leiste?“
Empfehlung: **Ja.** Zwölf Einträge in einer Wischleiste sind am Handy kaum auffindbar; eine Liste ist das gewohnte Muster und entfernt keine Funktion. Bis zur Antwort greift nur der allgemeine Wischleisten-Auslauf (A2: `.set-nav` mit `fade-r`, ohne Scrollbalken), der zumindest zeigt, dass es weitergeht.
Nebenbei (aus den Prüfer-Anmerkungen, eigenes Thema außerhalb dieser Gruppe): Vier Links „Regeln anlegen/bearbeiten“ zeigen auf `#/settings` und landen auf „Profil“ statt „Regeln“ (progress.js:77 zweimal, day.js:18, widgets.js:288).
