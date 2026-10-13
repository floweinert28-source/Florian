# Zielspezifikation: Barrierefreiheit und Bedienung

Gruppe „Barrierefreiheit und Bedienung“, 76 bestätigte Befunde (5× Schwere 1, 46× Schwere 2, 25× Schwere 3).
Grundlage: `audit/BRIEF.md`, `audit/spec-input/barrierefreiheit.json` (mit Prüfer-Anmerkungen), `web/README.md`, Code-Stand vom 11.10. (Zeilen unten gegen den aktuellen Code geprüft; `dashboard.js` ist seit Commit aa9f1c6 um zwei Zeilen verschoben, die Zeilen hier sind die aktuellen).

Leitlinie: Für Maus-Nutzer ändert sich fast nichts. Tastatur-, Screenreader- und Touch-Nutzer können alles bedienen, was Maus-Nutzer bedienen können. Nichts Dekoratives kommt dazu. Grün wird nirgends als Fokus- oder Auswahlfarbe eingesetzt.

---

## 1. Zielzustand

### Z1 Fokus ist immer sichtbar, neutral und einheitlich

- **Z1.1 Token.** In `:root` steht `--focus: var(--text);`. Weil `--text` in jedem Design gesetzt ist (Graphit, Schwarz, Weiß, Eigenes), gilt der Wert überall. Kontrast auf dem Hintergrund: dunkel #f2f0ec auf #0e0d0b ≈ 17,6:1, auf `--surface` ≈ 15,6:1; hell #0d130f auf #f5f7f5 ≈ 17:1. Gefordert sind 3:1. Heute erreicht der grüne Ring im hellen Design nur 2,42:1.
- **Z1.2 Ein Fokusring.** Jedes Bedienelement zeigt bei Tastaturfokus `outline: 2px solid var(--focus); outline-offset: 2px`, das ist die globale Regel `:focus-visible`. Abweichen darf nur der Abstand:
  - `-2px` in Behältern mit `overflow: hidden` (Prop-Reiter, Symbol-Liste, Screenshot-Kachel, Tabellen-Scrollbox),
  - `6px` am Schieberegler,
  - `4px` an den Theme-Karten.

  Als Fokusfarbe verboten sind `--accent`, `--accent-soft`, `--border-2` und `--dir-c`, ebenso Ringe aus `box-shadow`. Einzige Ausnahme ist der Blind-Replay (`.rp`, Feature-Flag aus): Er bleibt unberührt.
- **Z1.3 Eingabefelder** (`:focus`, also auch bei Mausklick): Rand `var(--text-2)`, kein Schein (`box-shadow: none`). Im Fehlerzustand (`aria-invalid="true"`) ist der Rand `var(--loss)`.
- **Z1.4 `outline: none` nur mit Ersatz.** Ohne Ersatz erlaubt nur auf Flächen, die das Programm selbst fokussiert und die keinen Ring zeigen sollen: `#content`, `.modal`, `.lightbox` (alle mit `tabindex="-1"`), außerdem die Editorfläche `.ql-editor` und die Titelfelder (der Cursor ist dort der Hinweis).
- **Z1.5 Auswahl ist nicht Fokus.** Für die Auswahl bleibt der flache Gewählt-Stil (leicht angehobene Fläche, feiner Rand), der Fokus ist der Umriss. Bei den Theme-Karten umschließt der Fokus die ganze Karte, der Auswahlring liegt nur um die Vorschau. So sind beide unterscheidbar.

### Z2 Fokusführung

- **Z2.1 Neuaufbau ohne Fokusverlust.** `App.render` merkt sich vor `main.innerHTML = …`, welches Element in `#main` oder `#sidebar` den Fokus hat. Danach fokussiert es dasselbe Element wieder.
  - Wiedererkennung in dieser Reihenfolge: `App.anchorKey(el)` → `[data-pop="…"]` → `a[href="…"]` → `#id`. Es wird nur fokussiert, wenn es genau einen sichtbaren Treffer gibt.
  - Immer mit `preventScroll: true`. Bei Textfeldern bleibt die Cursorposition erhalten.
  - Ohne Treffer bekommt `#content` den Fokus.
  - Setzt `screen.mount` selbst einen Fokus (Mentor-Eingabe), hat der Vorrang.
- **Z2.2 Seitenwechsel.** Ändert sich die Route (nicht beim allerersten Aufbau) und lag der Fokus vorher im Rahmen (`#main`, `#sidebar`) oder auf `<body>`, bekommt `#content` den Fokus (`tabindex="-1"`, ohne Ring).
- **Z2.3 Sprunglink** „Zum Inhalt springen“: erstes Element in `.shell`. Er ist nur sichtbar, solange er den Fokus hat (oben links 16 px / 12 px, Fläche `--surface-2`, Rand `--border-2`, 13,5/500). Er setzt den Fokus auf `#content` und ändert die Route nicht.
- **Z2.4 Dialoge** (`U.modal`):
  - Beim Öffnen hat der Dialog selbst den Fokus (`tabindex="-1"`, ohne Ring), nie das ×. Kein Feld wird automatisch fokussiert, wie beim Trade-Dialog, wo der Nutzer das so festgelegt hat (`tradeformtest.js:14`).
  - Ausnahmen: ein Element mit `data-autofocus` (Bestätigung: die sichere Wahl, also „Abbrechen“ bei `danger`, sonst die Bestätigung; Download: „Fertig“) sowie der Namensdialog (`promptModal`, fokussiert sein Feld wie bisher).
  - Solange ein Dialog offen ist, ist `.shell` `inert`.
  - Nach dem Schließen bekommt der Auslöser den Fokus zurück. Wurde die Seite inzwischen neu aufgebaut, sein Nachfolger mit demselben `anchorKey`, sonst `#content`.
  - Jeder Dialog trägt `aria-labelledby` auf seine `h2`.
- **Z2.5 Rückfrage vor Datenverlust.** Fünf Formular-Dialoge fragen nur dann nach, wenn sich ihre Eingaben geändert haben und sie per Escape oder Klick daneben geschlossen werden: Trade loggen/bearbeiten, Plan & Bewertung, Session starten, Check-in, Session beenden. Die Rückfrage lautet „Änderungen verwerfen?“. × und „Abbrechen“ schließen ohne Rückfrage, das sind bewusste Handlungen.
- **Z2.6 Menüs** (alle `[data-pop]`, Disclosure-Muster):
  - Der Auslöser trägt `aria-expanded="false|true"` und `aria-controls="pop-…"`. Es gibt weder `aria-haspopup` noch `role="menu"`.
  - Öffnen per Tastatur (`click.detail === 0`) setzt den Fokus auf den gewählten Eintrag (`[aria-checked="true"]`), sonst auf den ersten Eintrag oder Link.
  - Escape schließt das Menü. Lag der Fokus im Menü, geht er zurück auf den Auslöser.
  - Ein Klick daneben schließt ohne Fokus-Rücksprung.
- **Z2.7 Filter-Fenster** (Dashboard), wie Z2.6, dazu:
  - Beim Öffnen hat die erste Gruppenüberschrift den Fokus.
  - Tab läuft im Fenster im Kreis.
  - Beim Umschalten bleibt der Fokus auf demselben Knopf.
  - Nach ×, Escape und „Anwenden“ springt der Fokus zum Filter-Knopf zurück, nach Klick daneben und Seitenwechsel nicht.
- **Z2.8 Handy-Schublade** (≤ 960 px):
  - Geschlossen ist `#sidebar` `inert`.
  - Offen ist `#main` `inert`, und „Menü schließen“ hat den Fokus.
  - Schließen per Escape, × oder Abdunklung gibt den Fokus an den Menüknopf zurück, wenn er in der Leiste war.
- **Z2.9 Überdeckende Ebenen.**
  - Die Bildansicht (Lightbox) ist `role="dialog"` und nimmt den Fokus. Escape oder Klick schließen sie, danach bekommt der Auslöser den Fokus zurück.
  - Die verdeckte Seite eines Grabsteins ist `inert`.

### Z3 Tastaturbedienung

- **Z3.1 Grundsatz.** Alles, was per Klick etwas tut, ist per Tab erreichbar und mit Enter oder Leertaste auslösbar.
  - Für Aktionen gilt `<button type="button">`, für Navigation `<a href>`.
  - Eine `div` mit Klick ist nur als `role="button"` oder `role="checkbox"` mit `tabindex="0"` zulässig. Ein globaler Handler löst dann bei Enter und Leertaste `click()` aus.
- **Z3.2 Klickbare Tabellenzeilen** (`tr.link`):
  - Die erste Zelle enthält einen echten Link `<a class="row-link" href="…">` mit dem bisherigen Zellinhalt.
  - `data-action` bleibt an der Zeile, damit Mausklicks auf die übrigen Zellen weiter funktionieren.
  - Es gibt kein Overlay über die Zeile, damit die Tooltips in der Zeile erreichbar bleiben.
  - Bei Fokus wird die Zeile hell wie beim Darüberfahren (`:focus-within`).
- **Z3.3 Sortierköpfe.**
  - Im `th` steckt ein `<button class="th-sort">`. `data-action` steht an beiden, damit auch das Zellpolster sortiert.
  - `aria-sort` steht nur an der sortierten Spalte.
  - Die Richtung zeigt ein SVG-Chevron von 12 px statt ▲/▼.
- **Z3.4 Abhakbare Zeilen** sind `<button type="button" role="checkbox" aria-checked>`. Native Checkboxen bleiben fokussierbar (`.vh`, nie `.hidden`).
- **Z3.5 Auswahlgruppen.**
  - Einfachauswahl (Menüs Zeitraum, Konto, Uhrzeit, Sortieren, In Ordner verschieben, Umwandeln in; Check-in-Skalen; Bewertung): Gruppe `role="radiogroup"` mit Namen, Einträge `role="radio"` plus `aria-checked`.
  - Mehrfachauswahl (Notebook-Tags): `role="checkbox"` plus `aria-checked`.
  - `aria-checked` steht nie ohne passende Rolle.
  - Pfeiltasten bewegen den Fokus in einer Radiogruppe (mit Umlauf). Enter oder Leertaste wählen.
- **Z3.6 Zeitraum-Kalender:** ein Tab-Stopp je Kalender (wandernder `tabindex`), wie in `datepicker.js`. Pfeil links/rechts ±1 Tag, hoch/runter ±7 Tage, Bild auf/ab ±1 Monat. Die Ansicht wandert mit.
- **Z3.7 Ziehgriff** (Dashboard bearbeiten): Pfeiltasten verschieben das Widget um eine Stelle, danach hat der Griff des verschobenen Widgets den Fokus.
- **Z3.8 Scrollbereiche** ohne fokussierbaren Inhalt bekommen `tabindex="0" role="region"` und einen Namen (TradeLog-Tabelle: „Trades“).

### Z4 Namen, Rollen, Zustände

- **Z4.1 Zugänglicher Name.** Jeder Knopf und jeder Link hat einen Namen. Gibt es sichtbaren Text, ist er der Name oder dessen Anfang (WCAG 2.5.3).
  - Text, der am Handy ausgeblendet wird, wird mit `.vh-m` nur optisch versteckt, nicht mit `.hide-m`.
  - Symbolknöpfe ohne Text tragen `aria-label`.
- **Z4.2 Eindeutige Namen in Listen** nach dem Muster `<Objekt> „<Name>“ <Verb>`, siehe Glossar Z8.
- **Z4.3 Zustände.**
  - Aktive Seite oder aktiver Reiter: `aria-current="page"`, nie `aria-pressed` an Links.
  - Umschalter: `aria-pressed`, nur an `button`.
  - Auswahl: `aria-checked` mit Rolle (Z3.5).
  - Offenes Menü: `aria-expanded`.
- **Z4.4 Landmarken.**
  - Die Seitenleiste ist **eine** `<nav aria-label="Hauptnavigation">`. Die vier Gruppen darin sind `<div role="group" aria-labelledby>` auf ihren Titel.
  - Dazu kommt `<main>`.
  - Die Statistik-Reiter sind `<nav aria-label="Statistik-Bereiche">`.
  - Native `title`-Tooltips an Navigationslinks gibt es nur in der eingeklappten Leiste.
- **Z4.5 Bedeutung nie nur über Farbe oder Symbol.** Zahlen-Pillen, Regeln-Spalte, Wichtigkeitsbalken und Diagramme haben `role="img"` mit `aria-label`.
- **Z4.6 Info-Symbole.**
  - Jedes (i) ist `<button type="button" class="info" data-tip aria-label="<Erklärung>">`.
  - Der Tooltip erscheint beim Darüberfahren und bei Tastaturfokus (`:focus-visible`).
  - Die Sichtbarkeit bleibt wie entschieden: in Karten und Kacheln erst beim Darüberfahren oder bei Fokus in der Karte, auf Touch immer.
  - Kein (i) steht in einem `<label>`.
- **Z4.7 Bilder.** Inhaltsbilder haben einen Alt-Text (Notizbild: Bildunterschrift, sonst „Bild in der Notiz“). Vorschaubilder in Knöpfen haben `alt=""`, der Knopf trägt den Namen.
- **Z4.8 Ansagen.** Es gibt zwei Live-Regionen außerhalb von `#main`, beide ab dem Start im DOM:
  - `.toast-wrap` mit `role="status" aria-live="polite"` (alle Toasts),
  - `#sr-live` (`vh no-i18n`, `role="status"`) für Ansagen ohne sichtbare Meldung (Mentor).
- **Z4.9 Diagramm-Trefferflächen.**
  - Tooltip-Ziele bei Balken sind transparente Flächen über die volle Spaltenbreite bzw. Zeilenhöhe. Sie liegen über den Balken und tragen die Klasse `tip-hit`.
  - Streupunkte bleiben bei r 2,6, der unsichtbare Strich wird 16 px breit (≈ 21 px Ziel).

### Z5 Trefferflächen

- **Z5.1 Maße.** Überall mindestens 24 × 24 px oder die Abstandsausnahme aus WCAG 2.5.8. Einzige Ausnahme ist `.cp-x` im Farbwähler (siehe Zurückgestellt). Auf Touch (`pointer: coarse` bzw. ≤ 960 px) gilt für häufig genutzte Elemente:

  | Element | Ziel auf Touch |
  |---|---|
  | Menüknopf, Avatar, Schubladen-× | 44 px |
  | Filter-Fenster | 40 px |
  | Symbolknöpfe in Tabellen und Listen | 40 px |
  | Seitenwähler | 44 × 40 px |
  | „Öffnen“ / „Mehr anzeigen“ | 44 px hoch |
  | Check-in-Skala | 44 px |
  | Provisionssatz | ≈ 33 px hoch |

- **Z5.2 Technik.** Wo die sichtbare Größe eine Gestaltungsentscheidung ist, wird die Fläche unsichtbar über `::before` oder `::after` erweitert:

  | Element | sichtbar | Trefferfläche |
  |---|---|---|
  | Schalter | 36 × 20 | 52 × 38 |
  | Hell/Dunkel | 26 × 22 | 26 × 34 |
  | Kopfzeilen-Knöpfe | – | 44 |
  | Lösch-× an Farben und Designs | 16 | 24, nur nach außen |
  | (i) auf Touch | 14 | 24 |

  Sichtbar größer werden nur: Check-in-Skala 36 (Handy 44), Bewertungssterne 32, Filter-Fenster auf Touch 40, Symbolknöpfe und Seitenwähler auf Touch.
- **Z5.3** Erweiterte Flächen überlappen keine Nachbarziele.

### Z6 Pflichtfelder im Trade-Dialog

- Das Formular hat `novalidate`, damit keine Browser-Blase mehr erscheint („Please fill out this field.“). `required` bleibt als Semantik stehen.
- Die eigene Prüfung läuft in Feldreihenfolge: Symbol → Richtung → Einstieg → Kontrakte → Eröffnet → Ausstieg (nur bei geschlossenem Trade).
- Beim ersten Fehler: Toast, `aria-invalid="true"` am Feld und Fokus auf das Feld. Bei Richtung: die bestehende Markierung `.need` und Fokus auf „Long“.
- Eingabe ins Feld (bzw. Symbolwahl) entfernt `aria-invalid`.
- Die Vorschau unten links bleibt wie in README Z. 44 beschrieben.

### Z7 Lesbarkeit (Befunde dieser Gruppe)

- Kalender am Handy (≤ 560 px):
  - Kurzbetrag Onest 10,5 px / 700, Laufweite −0,02em (statt Satoshi 9,5 / −0,03em),
  - Tageszahl 11 px im 20-px-Kreis (statt 10 in 18),
  - Wochenbetrag 12,5 / 700 in Onest.
- LONG/SHORT-Abzeichen: 11 px / 600, Laufweite .04em, Satoshi (statt 10,5 / .06em, in Tabellen Onest).
- Vergangene News-Termine: Text in `--muted` (4,85:1) statt Deckkraft .5 (3,2:1). Die Wichtigkeitsbalken haben Deckkraft .6.

### Z8 Texte (Glossar und Regeln)

**Regeln**

1. Der Name ist der sichtbare Text. Ein `aria-label` kommt nur dazu, wenn kein Text sichtbar ist oder der Kontext fehlt. Dann beginnt oder endet es mit dem sichtbaren Wort.
2. Muster `<Objekt> „<Name>“ <Verb>`: Verb am Ende, Name in deutschen Anführungszeichen „…“, Datum mit „vom“. Kein „Knopf“ oder „Schaltfläche“ im Namen, keine Anweisungen wie „klicken“.
3. Namen und Gruppenlabels stehen ohne Punkt. Rückfrage-Titel enden mit „?“, Rückfrage-Texte sind ganze Sätze mit Punkt. Es gilt die Du-Form.
4. Fehler-Toasts lauten „<Feld> fehlt“, in der Mehrzahl „<Feld> fehlen“. Kein „Bitte“, kein „-kurs“.
5. Jeder neue Text kommt in alle fünf Wörterbücher `web/js/lang/{en,es,pt,zh,hi}.js`.
   - Texte mit Werten stehen dort als Muster mit `{0}`, `{1}`.
   - Diagramm-Labels und Serien-Pillen werden beim Erzeugen über `root.I18N.t(muster, [werte])` übersetzt, weil die Wörter in den Werten (Einheiten) selbst übersetzt werden müssen.

**Vorher → nachher (Beispiele)**

| Stelle | vorher (Screenreader hört) | nachher |
|---|---|---|
| Regel-Schalter (Einstellungen → Regeln) | „Aktiv, Schalter“ ×5 | „Regel „Max. 3 Trades pro Tag“ aktiv, Schalter“ |
| Papierkorb in Listen | „Löschen“ ×10 | „Regel „…“ löschen“, „Konto „Hauptkonto“ löschen“, „Ausgabe vom 05.10.2026 löschen“ |
| Session-Knopf | „01:23:45“ | „Session beenden“ (Zeit als Beschreibung) |
| Avatar oben rechts | „T“ bzw. leer | „Profil“ |
| Check-in-Skala | „1, Umschalter“ | „1 – entspannt, Optionsfeld, 1 von 5“ |
| Bewertung | „Schwarzer Stern“ ×5 | „3 von 5 Sternen“ |
| Trade-Dialog, leerer Einstieg | Browser-Blase „Please fill out this field.“ | Toast „Einstieg fehlt“, Feld rot umrandet und fokussiert |
| Toast | „Einstiegskurs fehlt“ / „Ausstiegskurs fehlt für geschlossenen Trade“ | „Einstieg fehlt“ / „Ausstieg fehlt“ |
| Konto-Karte unten | „Konto und Einstellungen“ (verdeckt den sichtbaren Namen) | „Trader Profil vervollständigen“; „Konto und Einstellungen“ nur in der eingeklappten Leiste |
| Kalendertag | „11“ | „11.10.2026 · +2.100,00 € · 3 Trades“ |

**Glossar der neuen Texte** (Wörterbuch-Schlüssel mit englischem Vorschlag; es, pt, zh und hi analog)

| Ort | Schlüssel (de) | en |
|---|---|---|
| Shell | „Zum Inhalt springen“ | Skip to content |
| Shell | „Hauptnavigation“ | Main navigation |
| Kopfreihe | „Session beenden“ (fehlt heute in en.js) | End session |
| Rückfrage | „Änderungen verwerfen?“ · „Deine Eingaben in diesem Fenster gehen verloren.“ · „Verwerfen“ | Discard changes? · Your input in this window will be lost. · Discard |
| Statistik | „Statistik-Bereiche“ | Statistics sections |
| Menügruppen | „Zeitraum“ · „Konto“ · „Uhrzeit“ · „Sortieren“ · „In Ordner verschieben“ · „Umwandeln in“ (vorhandene Einträge nutzen, fehlende ergänzen) | Period · Account · Time · Sort · Move to folder · Turn into |
| Trade-Dialog | „Einstieg fehlt“ · „Kontrakte fehlen“ · „Eröffnet fehlt“ · „Ausstieg fehlt“ (alte Schlüssel „Einstiegskurs fehlt“ und „Ausstiegskurs fehlt für geschlossenen Trade“ entfernen) | Entry missing · Contracts missing · Open time missing · Exit missing |
| Bewertung | „{0} von 5 Sternen“ · „1 Stern“ · „{0} Sterne“ | {0} of 5 stars · 1 star · {0} stars |
| Check-in | „1 – entspannt“, „2 – leicht“, „3 – mittel“, „4 – hoch“, „5 – sehr hoch“, „1 – schlecht“, „2 – mäßig“, „3 – neutral“, „4 – gut“, „5 – sehr gut“ | 1 – relaxed … 5 – very good |
| Kalender | „{0} · {1} · 1 Trade“ · „{0} · {1} · {2} Trades“ | {0} · {1} · 1 trade · {0} · {1} · {2} trades |
| TradeLog | „Alle Regeln eingehalten“ · „Gebrochen: {0}“ · „Trades“ (Region) | All rules followed · Broken: {0} · Trades |
| Screenshots | „Screenshot {0} von {1} vergrößern“ · „Screenshot vor Entry vergrößern“ · „Screenshot“ | Enlarge screenshot {0} of {1} · Enlarge pre-entry screenshot · Screenshot |
| Listen | „Regel „{0}“ aktiv“ · „Regel „{0}“ löschen“ · „Konto „{0}“ bearbeiten“ · „Konto „{0}“ löschen“ · „Tag „{0}“ bearbeiten“ · „Tag „{0}“ löschen“ · „Import {0} entfernen“ · „Preset „{0}“ bearbeiten“ / „… löschen“ / „… ansehen“ / „… kopieren“ · „Ausgabe vom {0} löschen“ · „Payout vom {0} löschen“ · „Verpassten Trade {0} vom {1} löschen“ | Rule “{0}” active · Delete rule “{0}” · … |
| Farben | „Eigene Farbe {0}“ · „Farbe {0} löschen“ · „Schriftfarbe {0}“ · „Textmarker {0}“ (Gruppe „Akzentfarbe“ und Farbnamen sind vorhanden) | Custom color {0} · Delete color {0} · Text color {0} · Highlighter {0} |
| Felder | „Nachricht an den Mentor“ · „Frage an den Mentor“ · „Kennzahl suchen“ · „Tags suchen“ · „Log-Typ suchen“ · „Widget suchen“ · „Symbol suchen“ · „Setup suchen“ · „Fehler suchen“ · „Emotion suchen“ · „CSV-Text einfügen“ · „Sicherung als Text einfügen“ | Message to the mentor · … |
| Pillen | „{0} Gewinner · {1} Break-even · {2} Verlierer“ · „{0} Gewinntage · {1} Break-even-Tage · {2} Verlusttage“ · „Längste Verlustserie: {0} · Längste Gewinnserie: {1}“ | {0} winners · {1} break-even · {2} losers · … |
| Diagramme | „{0} pro Trade“ · „Kumulierter Netto-P&L: Endstand {0}, tiefster Stand {1}“ · „Rollierender Edge: Gesamtschnitt {0} aus {1} Trades“ · „Monte-Carlo-Simulation: Ruin-Wahrscheinlichkeit {0}, Median-Drawdown {1}“ | {0} per trade · Cumulative net P&L: final {0}, lowest {1} · … |
| Mentor | „Mentor schreibt …“ | Mentor is typing … |
| Notebook | „Bild in der Notiz“ | Image in the note |

---

## 2. Konflikte und Entscheidungen

| # | Befunde | Widerspruch / Doppelung | Entscheidung und Grund |
|---|---|---|---|
| K1 | farbe_kontrast-14, farbe_kontrast-13, barrierefreiheit-21, barrierefreiheit-22, barrierefreiheit-23, barrierefreiheit-33, barrierefreiheit-14, bereich_dashboard-21, zustaende-36, bereich_notebook_news-35; Inventar A12 | Fokusfarbe: teils `--accent`, teils `--border-2` (1,4:1), Inventar A12 „Akzent bleibt bei Fokus“ | **Ein Token `--focus: var(--text)`** für alle. Grün erreicht hell nur 2,42:1, `--border-2` keine 3:1. README Z. 203–208 zählt die Fokusfarbe nicht zu den grünen Elementen (Gewinne, Akzent-Knopf, Schalter, Balken). Damit ist farbe_kontrast-14 trotz „berührt Vorgaben = ja“ **Umsetzung** der Vorgabe „Grün nur mit Bedeutung“, keine Änderung einer Nutzerentscheidung. A12 ist hierin überholt. |
| K2 | barrierefreiheit-1, barrierefreiheit-8, bereich_prop-39, komponenten-43 | Anfangsfokus: Dialog selbst (barrierefreiheit-1) vs. erstes Feld bei feinem Zeiger (barrierefreiheit-8 VF, bereich_prop-39) vs. sichere Wahl (komponenten-43) | **Dialog selbst** für alle, `data-autofocus` für Bestätigung und Download. Grund: Der Nutzer hat „kein Feld vorausgewählt“ festgelegt (Trade-Dialog, `tradeformtest.js:14`). Ein Fokus aufs erste Feld zeigt beim Öffnen per Maus sofort den Feldrahmen (`.input:focus` ist `:focus`, nicht `:focus-visible`) und öffnet am Handy die Tastatur. Das × wird nie fokussiert. Die Frage „erstes Feld bei anderen Dialogen?“ steht unter **Nutzer fragen**. |
| K3 | barrierefreiheit-4, zustaende-36, bereich_trades_tag-40 (in zustaende-36), bereich_konto-12, bereich_statistik-32, bereich_training-20 (Verstoß-Zeilen) | Link in der ersten Zelle (barrierefreiheit-4 V) vs. Stretched-Link mit `::after` (barrierefreiheit-4 VF, bereich_trades_tag-40) vs. Symbolzelle (zustaende-36) vs. `data-stop` (bereich_statistik-32) | **Link in der ersten Zelle, kein Overlay, kein `data-stop`, `data-action` bleibt an der Zeile.** Das Overlay würde die Tooltips der Regeln-Spalte (`trades.js:49`) und „+ n weitere“ (`shadow.js:69`) schlucken. Die erste Zelle (Datum und Zeit) ergibt eindeutigere Linknamen als „NQ“ ×50 und ist der erste Tab-Stopp der Zeile. Ohne `data-stop` verhalten sich alle Tabellen gleich wie heute (Klick navigiert über `App.navigate`). |
| K4 | barrierefreiheit-18, bereich_statistik-31, bereich_dashboard-21 | `span.info` → `.info` (trifft `.banner.info`) vs. `button.info` vs. `:is(span,button).info`; aria-label mit Präfix „Erklärung:“ (nicht übersetzbar) vs. ohne; (i) im `<label>` (ungültig) | **`button.info` überall**, aria-label = Erklärungstext ohne Präfix (steht so im Wörterbuch). Das Punktwert-(i) wandert aus dem `<label>` in eine Zeile `.lbl-row` neben dem Label. Touch-Ziel 24 px über `::before`, nicht über Innenabstand, damit `mobiletest.js:32` (Lage des Symbols im Kopf) grün bleibt. Die Touch-Farbe bleibt `--faint` (siehe Nutzer fragen). |
| K5 | farbe_kontrast-13, barrierefreiheit-21 | Schalter-Fokus: Sonderregeln löschen vs. eigener Ring mit Innenrand | **Löschen** (`app.css:314–315`). Dann gilt der globale Ring, das ist die einfachste und einheitliche Lösung. |
| K6 | barrierefreiheit-29, responsiv-26 (Ergänzung) | Schalter-Trefferfläche 44 × 44 vs. 52 × 38 | **52 × 38** (`inset: -9px -8px`). Bei 36–38 px Zeilenabstand (Einstellungen → Regeln) würden 44 px hohe Flächen überlappen. |
| K7 | bereich_shell-30, barrierefreiheit-28 | Hell/Dunkel sichtbar größer (28 × 26, Touch 36 × 32) vs. unsichtbare Erweiterung | **Unsichtbar 26 × 34.** Der schlanke Schiebeschalter ist eine Nutzerentscheidung (Commit 1e6fcc8, Aufgabe „Hell/Dunkel-Schalter neu“). WCAG 2.5.8 ist über die Abstandsausnahme schon erfüllt. Toter Code `app.css:207–208` wird mit entfernt. Die sichtbare Vergrößerung steht unter **Nutzer fragen**. |
| K8 | barrierefreiheit-46, bereich_einstellungen-43 | Lösch-× rundum vergrößern (beide) vs. nur `.dot-x`, nach außen | **Nur `.dot-x`, nach außen** (24 × 24, wächst nur 2 px in den Punkt). `.cp-x` im Farbwähler würde ins Nachbarfeld (24 px, 8 px Abstand) ragen. Löschen hat keine Rückfrage. |
| K9 | bereich_einstellungen-20, barrierefreiheit-36 | „Akzentfarbe Orange“ vs. „Orange“ + Gruppe; Editor „Textfarbe/Markierung“ vs. „Schriftfarbe/Textmarker“ | **Farbname allein + `role="group" aria-label="Akzentfarbe"`** (Namen aus `theme.js:18`, schon im Wörterbuch). Im Editor gelten die Begriffe der Oberfläche: „Schriftfarbe {0}“ / „Textmarker {0}“ (`editor.js:121/122`). |
| K10 | barrierefreiheit-35, bereich_einstellungen-21 | „Regel löschen: X“ vs. „Regel „X“ löschen“ | **„Regel „X“ löschen“**: Verb am Ende wie in der Verb-Familie des Wording-Inventars („Prop-Konto anlegen“, „Link kopieren“). Liest sich als Satz, Muster in Z8. |
| K11 | barrierefreiheit-26 (V / VF / Prüfer) | radiogroup + radio vs. `aria-current` + Häkchen vs. aria-checked behalten | **`role="radio"` in `role="radiogroup"`, `aria-checked` bleibt.** Tests (`rangetest.js:13/15/45/49`, `sixtest.js:54/56`) fragen `aria-checked` ab. Kein Häkchen-Symbol: es würde die umbrechenden Vorgaben-Pillen am Handy (`app.css:382–384`) verbreitern. Grün wird durch den flachen Gewählt-Stil ersetzt (Vorgabe „keine grüne Markierung von Auswahl“), ebenso im Vorlagen-Menü. |
| K12 | bereich_shell-12, barrierefreiheit-27 | Doppelt (Konto-Menü) | Zusammengeführt: Disclosure statt `role="menu"`, aria-label/title nur in der eingeklappten Leiste, Fokus aufs erste Element nur bei Tastatur, Escape → Auslöser. Gilt über Z2.6 für alle Menüs. |
| K13 | bereich_dashboard-22, barrierefreiheit-26, barrierefreiheit-5 | `aria-haspopup="menu"` (VF) vs. nur `aria-expanded`; Markup an 14 Stellen vs. zentral | **Nur `aria-expanded` + `aria-controls`, zentral** in `App.popInit` und im Klick-Handler. Kein `aria-haspopup`, denn die Popover sind keine Menü-Listen. |
| K14 | barrierefreiheit-5, bereich_dashboard-22 | Filter: Fokus-Rücksprung immer vs. nur bei ×, Escape, Anwenden | **Nur bei ×, Escape, Anwenden.** `close()` läuft auch bei Klick daneben (pointerdown, capture) und bei `hashchange`. Dort würde ein Rücksprung den Fokus vom angeklickten Element stehlen. `hashchange` ruft `close` heute mit dem Event als Argument auf, deshalb wird es gekapselt. |
| K15 | barrierefreiheit-15, bereich_trades_tag-41 (1), bereich_training-20 (1, 4) | Dreifach; CSS mit `background: none` bzw. `font: inherit` | Ein Schritt. CSS **ohne** `background` und **ohne** `font` (sonst gehen die Fläche `--surface-2` und die 13-px-Schrift verloren). Die Fokus-Rückgabe nach dem Abhaken übernimmt Z2.1 zentral statt je Aktion. |
| K16 | barrierefreiheit-16, bereich_trades_tag-41 (2) | Dropzone: eigener keydown je Fläche vs. globaler Handler; aria-label vs. sichtbarer Text | `role="button" tabindex="0"`. Auslösen über den **globalen** Enter/Leertaste-Handler aus barrierefreiheit-3 (gibt es dann). Kein aria-label, denn der sichtbare, übersetzte Text ist der Name. |
| K17 | barrierefreiheit-17, bereich_trades_tag-41 (3) | Lightbox mit sichtbarem ×-Knopf vs. fokussierte Fläche | **Ohne sichtbaren Knopf** (nichts Dekoratives; Klick überall schließt wie heute, `cursor: zoom-out`). Escape schließt. Eine gemeinsame `U.lightbox()` auch für die Notizbilder (`editor.js:42`). |
| K18 | barrierefreiheit-33, zustaende-36, typografie-30 | `all: unset` vs. explizite Rücksetzung; `data-action` nur am Knopf vs. auch am th; aria-sort an allen vs. nur an der aktiven Spalte | Explizite Rücksetzung (`all: unset` kann den Fokusring mit zurücksetzen). `data-action` an th **und** Knopf. `aria-sort` nur an der sortierten Spalte. Chevron statt ▲/▼. |
| K19 | barrierefreiheit-31, bereich_shell-14 | Sprunglink `href="#content"` (navigiert im Hash-Router zum Dashboard) vs. eigener Listener vs. `data-action` | `href="#content"` + `data-action="skip-content"`: Der globale Klick-Handler ruft `preventDefault`. Der Link steht als **erstes Kind von `.shell`** (nicht von `body`), damit er bei offenem Dialog mit `inert` wird. Sonst landet Tab aus dem Dialog auf ihm. |
| K20 | bereich_shell-14, barrierefreiheit-49 | `<aside>` → `<nav>` vs. `<aside>` ohne Label + innerer `<nav>`-Wrapper | **Äußeres Element wird `<nav aria-label="Hauptnavigation">`**, Gruppen als `div role="group"`. Kein Wrapper, also keine Layout-Änderung (der Wrapper bräuchte eigenes Flex und Gap). CSS und Tests greifen nur über Klassen zu (geprüft). `title` nur in der eingeklappten Leiste (barrierefreiheit-49). |
| K21 | bereich_shell-13, barrierefreiheit-32, bereich_statistik-7 | aria-current Seitenleiste, Einstellungen, Prop, Statistik | Überall `aria-current="page"`, `aria-pressed` an `<a>` entfällt (prop, affiliate, stats). CSS-Selektoren und vier Tests werden mitgezogen. |
| K22 | bewegung-32, barrierefreiheit-38 | Fehler-Toasts als `role="alert"` in einer polite-Region (doppelte Ansage) | **Nur `role="status"` an `.toast-wrap`.** Toasts sind kurz, polite genügt. Der Mentor bekommt eine eigene Region `#sr-live`, weil `#mentor-log` bei jedem Neuaufbau neu entsteht (eine mitgelieferte Live-Region sagt nichts an). |
| K23 | typografie-27 (VF vs. Prüfer) | 11/600 mit Rückfall 10,5 bei 360 px vs. 10,5/700 | **10,5 px / 700, −0,02em, Onest.** Werte sind 700 (Vorgabe). Bei 11 px läuft „−R$9,9k“ (45 px) über das 40-px-Feld. Der Wochenbetrag 12,5 bleibt (11 wäre eine Verkleinerung). Abweichung von einer etwaigen 11-px-Untergrenze der Gruppe Typografie: nur für diese Kurzform, begründet durch die Messung. |
| K24 | diagramme-46 (V vs. VF) | Trefferflächen unter vs. über den Balken | **Über** den Balken. Liegen sie darunter, trifft die Maus den sichtbaren Balken ohne `data-tip`, und der Tooltip geht aus. Klasse `tip-hit` statt `hit`, weil `hoverLine` (`ui.js:235`) `.hit` sucht. `enterAnim` überspringt transparente Flächen ohnehin (`ui.js:250`). |
| K25 | barrierefreiheit-2, barrierefreiheit-31 | `tabindex="-1"` an `#content` doppelt | Einmal, in Schritt P1. |
| K26 | barrierefreiheit-11 | Rückfrage: nur input/change-Zuhören vs. FormData-Vergleich | Vergleich FormData + `[aria-pressed]` (Long/Short, Chips) bei Öffnen und Schließen. Dazu eine **Voraussetzung**: Der globale `[data-close]`-Zweig (`app.js:280`) darf keinen Dialog schließen, der schon ausgeblendet wird (`.modal-bg.out`). Sonst schließt „Abbrechen“ in der Rückfrage auch das Formular darunter, das ist heute ein latenter Doppel-Schluss bei gestapelten Bestätigungen. |
| K27 | barrierefreiheit-37 | Texte im Original teils falsch („Replay-Widget“, `type="search"`) | aria-labels wie in Z8; **kein** `type="search"` (natives × bricht die `.input`-Optik). |
| K28 | Gruppenübergreifend | Gleiche Stellen in anderen Gruppen | **Farbe:** Grün an `.sym-opt[aria-selected]` (`app.css:886`), Schein am Regler-Knopf (`app.css:812`), `.more-link` grün/600 regelt die Gruppe Farbe; hier nur Fokus und Trefferfläche. **Wortwahl:** Beschriftung „Prop-Konto“ (`prop.js:294`) kann dort zu „Prop-Konto anlegen“ werden, hier wird nur `hide-m` entfernt. LONG/SHORT-Schreibweise (W-24a) regelt Wortwahl; hier nur Größe und Schrift. **Responsiv:** Breitere Aktionsspalten am Touch (responsiv-30) zusammen mit responsiv-6 bei 390 px prüfen. |

---

## 3. Umsetzungsschritte

Reihenfolge: **A Tokens → B Komponenten → C Einzelstellen → D Wörterbücher → E Tests und README.** Innerhalb jeder Phase nach Datei. Zeilen = aktueller Stand.

### Phase A – Tokens

#### `web/css/app.css`

**A1 Token `--focus`** (`:root`, nach Z. 28 `--accent-glow`)
- vorher: –
- nachher: `--focus: var(--text); /* Tastatur-Fokus: neutral, in jedem Design ≥ 3:1 (gilt auch hell, weil --text je Design gesetzt ist) */`
- Befunde: farbe_kontrast-14

**A2 Alle Fokusregeln auf `--focus`**

| Zeile | vorher | nachher | Befunde |
|---|---|---|---|
| 95 | `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }` | `… var(--focus) …` | farbe_kontrast-14 |
| 206 | `.theme-toggle button:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }` | `var(--focus)` | farbe_kontrast-14 |
| 235 | `.sb-user:focus-visible { outline: 2px solid var(--accent); … }` | `var(--focus)` | farbe_kontrast-14 |
| 293 | `.input:focus, .select:focus, textarea.input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }` | `{ outline: none; border-color: var(--text-2); box-shadow: none; }` | farbe_kontrast-14 |
| 314–315 | `.switch:focus-visible { outline: none; box-shadow: …accent-soft }` und `.switch[aria-checked="true"]:focus-visible {…}` | **beide Zeilen löschen** (der globale Ring greift, pillenförmig über `border-radius: 999px`) | farbe_kontrast-13, barrierefreiheit-21 |
| 437 | `.dp button:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }` | `var(--focus)` | farbe_kontrast-14 |
| 447 | `.cp-sv:focus-visible .cp-knob, .cp-hue:focus-visible .cp-knob { transform: …scale(1.15); box-shadow: 0 0 0 2.5px #fff, 0 0 0 5px var(--accent-soft), … }` | `.cp-sv:focus-visible, .cp-hue:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; } .cp-sv:focus-visible .cp-knob, .cp-hue:focus-visible .cp-knob { transform: translate(-50%, -50%) scale(1.15); }` (Knopf-Schatten aus Z. 445 bleibt) | farbe_kontrast-14 (gleiches Muster wie -13) |
| 451 | `.cp-hex:focus-within { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }` | `{ border-color: var(--text-2); box-shadow: none; }` | farbe_kontrast-14 |
| 814 | `.slider input[type=range]:focus-visible { box-shadow: 0 0 0 3px var(--accent-soft); }` | `{ outline: 2px solid var(--focus); outline-offset: 6px; box-shadow: none; }` (`outline: none` in Z. 811 bleibt für die Maus) | barrierefreiheit-22 |
| 864 | `.dir-opt:focus-visible { outline: 2px solid var(--dir-c); outline-offset: -2px; }` | `var(--focus)` | farbe_kontrast-14 |
| 885 | `.sym-opt:hover, .sym-opt:focus-visible { background: var(--surface-2); outline: none; }` | `.sym-opt:hover { background: var(--surface-2); } .sym-opt:focus-visible { background: var(--surface-2); outline: 2px solid var(--focus); outline-offset: -2px; }` | barrierefreiheit-23 |
| 1186–1187 | `.nb-details summary { …; outline: none; }` · `.nb-details summary:focus { color: var(--accent); }` | 1186 bleibt; 1187 → `.nb-details summary:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; border-radius: 4px; }` | bereich_notebook_news-35 |
| 1842 | `.theme-card:focus-visible { outline: none; } .theme-card:focus-visible .tc-prev { box-shadow: …, 0 0 0 5px var(--accent); }` | `.theme-card:focus-visible { outline-offset: 4px; border-radius: 16px; }` (Umriss um die ganze Karte, Z1.5) | farbe_kontrast-14 |
| 2411 | `.sr-num:focus-within { border-color: var(--accent); }` | `var(--text-2)` | farbe_kontrast-14 |
| 2516, 2592, 2620, 2653, 2675, 2679 | `outline: 2px solid var(--accent)` | `outline: 2px solid var(--focus)` (Offsets bleiben) | farbe_kontrast-14 |
| 2144, 2232, 2240 (`.rp`) | – | **unverändert** (Blind-Replay, Feature-Flag aus) | – |

### Phase B – Komponenten

#### `web/css/app.css`

**B1 Nur-optisch-versteckt am Handy** (im Block `@media (max-width: 960px)` Z. 1062–1072, nach `.hide-m`)
- nachher: `.vh-m { position: absolute !important; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }`
- Befunde: bereich_konto-11

**B2 Sprunglink und programmatische Fokusflächen** (nach `.vh`, Z. 1330)
- nachher:
  ```css
  .skip { position: fixed; left: 16px; top: -48px; z-index: 200; padding: 8px 12px; border-radius: 10px; background: var(--surface-2); border: 1px solid var(--border-2); color: var(--text); font-size: 13.5px; font-weight: 500; }
  .skip:focus { top: 12px; }
  #content:focus, .modal:focus, .lightbox:focus { outline: none; }
  ```
- Befunde: barrierefreiheit-31, bereich_shell-14, barrierefreiheit-2, barrierefreiheit-1, barrierefreiheit-8, barrierefreiheit-17

**B3 Info-Symbol als Knopf** (Z. 492–499, 638, 648)
- In allen Selektoren `span.info` → `button.info` (Z. 492, 493, 494, 496, 497, 498, 499, 638, 648). **Nicht** `.info` allein (`.banner.info` Z. 668).
- Z. 492 ergänzen: `padding: 0; border: 0; background: none; font: inherit; line-height: 0; border-radius: 50%;`
- Neu nach Z. 499: `@media (hover: none) { button.info { position: relative; } button.info::before { content: ''; position: absolute; inset: -5px -5px -5px -3px; } }` (Ziel 24 px, sichtbar 14 px, Farbe bleibt `--faint`).
- Neu: `.field > .lbl-row { display: flex; align-items: center; gap: 2px; } .field > .lbl-row > label { font-size: 12px; font-weight: 600; color: var(--muted); }`
- Befunde: barrierefreiheit-18, bereich_statistik-31, bereich_dashboard-21

**B4 Schalter-Trefferfläche** (nach Z. 316)
- nachher: `.switch::before { content: ''; position: absolute; inset: -9px -8px; }` (52 × 38; `::after` ist der Knopf und bleibt frei)
- Neu bei Z. 1863–1865: `.set-row-l { display: block; cursor: pointer; }`
- Befunde: barrierefreiheit-29 (und responsiv-26 über die Ergänzung)

**B5 Checklisten** (nach Z. 806)
- nachher:
  ```css
  .checklist button.it { width: 100%; margin: 0; border: 0; text-align: left; cursor: pointer; }
  .checklist .it.toggle:has(input:focus-visible) { outline: 2px solid var(--focus); outline-offset: 2px; }
  ```
  Ohne `background` und ohne `font`, damit Fläche (Z. 800) und Größe (13 px) bleiben.
- Befunde: barrierefreiheit-15, bereich_trades_tag-41, bereich_training-20, barrierefreiheit-14

**B6 Gewählter Menüeintrag flach statt grün**
- Z. 337 vorher: `.popover .item[aria-checked="true"] { color: var(--accent); }`
- nachher: `.popover .item[aria-checked="true"] { color: var(--text); background: color-mix(in srgb, var(--text) 10%, var(--surface)); }`
- Z. 1044 vorher: `.nb .tagpop .sec.k-setup, .nb .tagpop .item.k-setup[aria-checked="true"] { color: var(--accent); }`
- nachher: `.nb .tagpop .sec.k-setup { color: var(--accent); }`. Der gewählte Setup-Tag ist neutral (README: Setup neutral). 1045–1047 bleiben (Fehler und Emotion tragen Bedeutung).
- Z. 1627 `.tpl-row .chk { … color: var(--accent); … }` → `color: var(--text-2);`
- Z. 1631 `.tpl-row.on .item.name { color: var(--accent); font-weight: 600; }` → `{ color: var(--text); font-weight: 500; }`
- Befunde: barrierefreiheit-26

**B7 Tabellen: Sortierknopf, Zeilen-Fokus, Scrollbox**
- Z. 596 vorher: `.tbl th .dir { font-size: 10px; margin-left: 4px; color: var(--text-2); }`
- nachher:
  ```css
  .tbl th .dir { display: inline-flex; margin-left: 4px; color: var(--text-2); }
  .tbl th .dir svg { width: 12px; height: 12px; }
  .tbl th .dir.up svg { transform: rotate(180deg); }
  .th-sort { display: inline-flex; align-items: center; padding: 0; margin: 0; border: 0; background: none; font: inherit; color: inherit; cursor: pointer; border-radius: 4px; }
  ```
- Nach Z. 600: `.tbl tbody tr.link:focus-within td { background: var(--surface-2); } .tbl .row-link:focus-visible { border-radius: 4px; }`
- Nach Z. 1740: `.tbl-scroll:focus-visible { outline-offset: -2px; }`
- Befunde: barrierefreiheit-33, zustaende-36, typografie-30, barrierefreiheit-4, bereich_konto-12, bereich_statistik-32, bereich_training-20, barrierefreiheit-50

**B8 LONG/SHORT-Abzeichen** (Z. 618)
- vorher: `font-size: 10.5px; font-weight: 600; letter-spacing: .06em;`
- nachher: `font-size: 11px; font-weight: 600; letter-spacing: .04em; font-family: var(--font);`. Die Mindestbreite 80 px (Z. 607) reicht weiter.
- Befunde: typografie-30

**B9 Bewertung, Check-in-Skala, gemeinsamer Gewählt-Stil, Reiter**
- Z. 324: `.rating button { width: 26px; height: 26px; …}` → `width: 32px; height: 32px;`
- Z. 325: `.rating button[aria-pressed="true"] { --lc: var(--warn); }` → `.rating button.on { --lc: var(--warn); }`
- Z. 320: `.seg button[aria-pressed="true"]` → `.seg button[aria-pressed="true"], .seg button[aria-checked="true"]`
- Z. 322: `.seg.pill button { border-radius: 999px; padding: 6px 12px; font-size: 12.5px; }` → zusätzlich `min-width: 36px; min-height: 36px;`
- Im Block `@media (max-width: 560px)` ab Z. 2978: `.seg.pill button { min-width: 44px; min-height: 44px; }`
- Gemeinsame Liste Z. 3125–3128:
  - `.rating button[aria-pressed="true"]` → `.rating button.on`
  - `.seg button[aria-checked="true"]` ergänzen
  - `.tabs a[aria-pressed="true"]` → `.tabs a[aria-current="page"]`
  - `.prop-tabs a[aria-pressed="true"]` → `.prop-tabs a[aria-current="page"]`
- Z. 2596 / 2598: `.prop-sub a[aria-pressed="true"]` → `.prop-sub a[aria-current="page"]`
- Nach Z. 1513 (Statistik-Reiter ohne Inline-Farbe): `.tabs a:not([aria-current="page"]) { color: var(--text-2); } .tabs a:not([aria-current="page"]):hover { color: var(--text); }`
- Befunde: barrierefreiheit-12, barrierefreiheit-13, barrierefreiheit-32, bereich_statistik-7

**B10 Dropzone und Screenshot-Knopf** (nach Z. 750 bzw. 754)
- nachher:
  ```css
  .dropzone:focus-visible { outline-offset: 3px; }
  .shot-open { display: block; width: 100%; height: 100%; padding: 0; border: 0; background: none; cursor: zoom-in; }
  .shot-open:focus-visible { outline-offset: -2px; }
  ```
- Befunde: barrierefreiheit-16, barrierefreiheit-17, bereich_trades_tag-41

**B11 Fehlerzustand Feld** (nach Z. 293)
- nachher: `.input[aria-invalid="true"] { border-color: var(--loss); }`
- Befunde: wording-1

**B12 Trefferflächen auf Touch und Handy**

| Stelle | vorher | nachher | Befunde |
|---|---|---|---|
| Block `@media (max-width: 960px)` Z. 916–944 | – | `.menu-btn, .topbar .actions .avatar, .brand .sb-toggle { position: relative; } .menu-btn::after, .topbar .actions .avatar::after, .brand .sb-toggle::after { content: ''; position: absolute; } .menu-btn::after { inset: -4px; } .topbar .actions .avatar::after { inset: -5px; border-radius: 999px; } .brand .sb-toggle::after { inset: -7px; }` (je 44 px, sichtbar 36 / 34 / 30) | responsiv-28 |
| nach Z. 206 (Hell/Dunkel) | 26 × 22 | `.sb-menu .theme-toggle button { position: relative; } .sb-menu .theme-toggle button::after { content: ''; position: absolute; inset: -6px 0; }` (26 × 34, Optik und `translateX` bleiben) | barrierefreiheit-28, bereich_shell-30 |
| Z. 207–208 | `html.sb-mini .theme-toggle {flex-direction: column …}` · `html.sb-mini[data-theme="light"] .theme-toggle::before { transform: translateY(22px); }` | **löschen** (der Schalter steht nur noch im Konto-Menü, `app.js:232`; Z. 255–256 überschreiben beide) | bereich_shell-30 |
| nach Z. 467 (Lösch-× an Farben und Designs) | 16 × 16 | `.dot-x::before { content: ''; position: absolute; top: -6px; right: -6px; bottom: -2px; left: -2px; border-radius: 50%; }` (24 × 24 nach außen; `.cp-x` bleibt) | bereich_einstellungen-43, barrierefreiheit-46 |
| nach Z. 1365 (Filter-Fenster) | Segmente 27,4 px, Umschalter 28 px | `@media (pointer: coarse) { .fd-pop .fd-seg button { padding: 10px 12px; font-size: 13px; } .fd-pop .fd-tog button { height: 40px; font-size: 13px; } .fd-pop .fd-add, .fd-pop .fd-chip { height: 40px; } .fd-pop .fd-pair .input, .fd-pop .fd-pair .fd-unit { height: 40px; } }`. Innenabstand der Wochentag- und Monatsraster (Z. 1394) bleibt. | responsiv-25 |
| nach Z. 1660 (`.more-link`) | 42 × 19 / 89 × 16 | `@media (pointer: coarse) { .more-link { display: inline-flex; align-items: center; min-height: 44px; padding: 0 10px; margin: -12px -10px; } }` | responsiv-29 |
| Dateiende | Symbolknopf 30 × 30, Seitenwähler 36 × 32, Auswahl 62 × 32 | `@media (pointer: coarse) { .tbl .btn.icon.sm, .set-row .btn.icon.sm { width: 40px; height: 40px; padding: 11px; } .pager .pg-nav button { width: 44px; height: 40px; } .select.sm { padding-top: 10px; padding-bottom: 10px; } }` | responsiv-30 |
| Z. 2996–2997 (Handy) | `.aff-pct { gap: 0; margin: 0; padding: 0; } .aff-pct svg { display: none; }` | `.aff-pct { gap: 3px; padding: 8px 4px; margin: -8px -4px; } .aff-pct svg { width: 11px; height: 11px; }` | bereich_konto-32 |

**B13 Vergangene News** (Z. 3090)
- vorher: `.nw-row.past { opacity: .5; }`
- nachher: `.nw-row.past :is(.nw-time, .nw-title, .nw-cur) { color: var(--muted); } .nw-row.past .nw-v b { color: var(--muted); } .nw-row.past .nw-imp { opacity: .6; }`
- Befunde: bereich_notebook_news-47

**B14 Kalender am Handy**
- Z. 1800 (Zahlenschrift-Liste): `.cal .p` → `.cal .p, .cal .pm`
- Z. 940: `.cal .d .n { width: 18px; height: 18px; font-size: 10px; top: 3px; right: 3px; }` → `width: 20px; height: 20px; font-size: 11px;` (top und right bleiben)
- Z. 3042: `… font-weight: 700; font-size: 9.5px; letter-spacing: -.03em; …` → `font-weight: 700; font-size: 10.5px; letter-spacing: -.02em;` (Rest bleibt)
- Z. 3044: unverändert (12,5 / 700, jetzt in Onest über die Liste)
- Befunde: typografie-27

#### `web/js/ui.js`

**U1 Info-Symbol** (Z. 169)
- vorher: `` const info = text => text ? `<span class="info" data-tip="${esc(text)}">${I.info}</span>` : ''; ``
- nachher: `` const info = text => text ? `<button type="button" class="info" data-tip="${esc(text)}" aria-label="${esc(String(text).replace(/<[^>]*>/g, ''))}">${I.info}</button>` : ''; ``
- Befunde: barrierefreiheit-18, bereich_statistik-31, bereich_dashboard-21

**U2 Tooltip bei Tastaturfokus** (`bindTips`, nach Z. 424)
- nachher:
  ```js
  document.addEventListener('focusin', e => { const t = e.target; if (!t.matches || !t.matches('button.info[data-tip]') || !t.matches(':focus-visible')) return; const r = t.getBoundingClientRect(); tipFor = t; tipShowAt(r.left + r.width / 2, r.top, t.dataset.tip); });
  document.addEventListener('focusout', e => { if (tipFor && e.target === tipFor) tipHide(); });
  ```
  Nur bei `:focus-visible` (kein Doppel-Tooltip nach Mausklick). Nur das eigene Element blendet aus (Maus-Tooltips bleiben unberührt).
- Befunde: barrierefreiheit-18, bereich_statistik-31, bereich_dashboard-21

**U3 Dialog-Gerüst** (Z. 428–449)

`modal()` ersetzen:
```js
const modals = []; let modalSeq = 0;
function modal(html, o = {}) {
  const act = document.activeElement; const ret = act && act !== document.body ? act : null;
  const retKey = ret && root.App && root.App.anchorKey ? root.App.anchorKey(ret) : null;
  const bg = document.createElement('div'); bg.className = 'modal-bg';
  bg.innerHTML = `<div class="modal ${o.cls || ''}" role="dialog" aria-modal="true" tabindex="-1">${html}</div>`;
  document.body.appendChild(bg); const dlg = bg.firstElementChild; const entry = { bg, o, ret, retKey }; modals.push(entry);
  document.body.style.overflow = 'hidden'; const sh = document.querySelector('.shell'); if (sh) sh.inert = true;
  const h = dlg.querySelector('.modal-head h2'); if (h) { h.id = h.id || 'mh-' + (++modalSeq); dlg.setAttribute('aria-labelledby', h.id); }
  bg.addEventListener('mousedown', e => { if (e.target === bg && !o.locked) requestClose(); });
  if (o.onMount) o.onMount(dlg);
  if (o.guard) { const form = dlg.querySelector('form'); const snap = () => form ? JSON.stringify([[...new FormData(form)].filter(([, v]) => typeof v === 'string'), [...form.querySelectorAll('[aria-pressed]')].map(b => b.getAttribute('aria-pressed'))]) : ''; const start = snap(); entry.dirty = () => snap() !== start; }
  /* Anfangsfokus: [data-autofocus] oder der Dialog selbst; nie das ×, nie automatisch ein Feld (o.noFocus ist damit Standard) */
  setTimeout(() => { if (!dlg.isConnected || dlg.contains(document.activeElement)) return; (dlg.querySelector('[data-autofocus]') || dlg).focus({ preventScroll: true }); }, 30);
  return dlg;
}
```

`closeModal()` am Ende ergänzen und `restoreAfterModal()` neu:
```js
  if (!modals.length) { document.body.style.overflow = ''; const sh = document.querySelector('.shell'); if (sh) sh.inert = false; }
  const x0 = m[0]; if (x0) setTimeout(() => restoreAfterModal(x0), 0); /* nach dem synchronen App.rerender() */
}
function restoreAfterModal(x0) {
  const top = modals[modals.length - 1]; const a = document.activeElement;
  if (a && a !== document.body && !a.closest('.modal-bg.out')) return; /* jemand hat den Fokus schon gesetzt (Seitenwechsel, Mentor-Eingabe) */
  const ok = e => e && e.isConnected && e.getClientRects().length > 0 && !e.closest('[inert], .modal-bg.out');
  let el = ok(x0.ret) ? x0.ret : null;
  if (!el && !top && x0.retKey) { const hits = document.querySelectorAll('#main ' + x0.retKey + ', #sidebar ' + x0.retKey); if (hits.length === 1 && ok(hits[0])) el = hits[0]; }
  if (!el) el = top ? top.bg.firstElementChild : document.getElementById('content');
  if (el) el.focus({ preventScroll: true });
}
function requestClose() {
  const top = modals[modals.length - 1]; if (!top) return;
  if (top.o.guard && top.dirty && top.dirty()) { confirmModal('Änderungen verwerfen?', 'Deine Eingaben in diesem Fenster gehen verloren.', { ok: 'Verwerfen', danger: true }).then(ok => { if (ok) closeModal(); }); return; }
  closeModal();
}
```

`confirmModal` (Z. 447):
- Fuß-„Abbrechen“ → `<button type="button" class="btn" data-close${o.danger ? ' data-autofocus' : ''}>Abbrechen</button>`
- Bestätigung → `<button type="button" class="btn …" data-confirm${o.danger ? '' : ' data-autofocus'}>`

`downloadText` (Z. 458): Fertig → `<button type="button" class="btn primary" data-close data-autofocus>Fertig</button>`.

Befunde: barrierefreiheit-1, barrierefreiheit-8, barrierefreiheit-9, barrierefreiheit-10, barrierefreiheit-11, bereich_prop-39, komponenten-43

**U4 Live-Regionen** (Z. 444)
- vorher: `toast()` legt `.toast-wrap` beim ersten Toast an.
- nachher:
  ```js
  function toastWrap() { let w = document.querySelector('.toast-wrap'); if (!w) { w = document.createElement('div'); w.className = 'toast-wrap'; w.setAttribute('role', 'status'); w.setAttribute('aria-live', 'polite'); document.body.appendChild(w); } return w; }
  function toast(msg, kind = '') { const w = toastWrap(); /* … Rest wie bisher … */ }
  function announce(text) { let r = document.getElementById('sr-live'); if (!r) { r = document.createElement('div'); r.id = 'sr-live'; r.className = 'vh no-i18n'; r.setAttribute('role', 'status'); r.setAttribute('aria-live', 'polite'); document.body.appendChild(r); } r.textContent = ''; if (text) setTimeout(() => { r.textContent = text; }, 50); }
  ```
- Befunde: bewegung-32, barrierefreiheit-38

**U5 Bildansicht** (neu, nach `downloadText`)
```js
function lightbox(src, alt) {
  const back = document.activeElement; const lb = document.createElement('div');
  lb.className = 'lightbox'; lb.tabIndex = -1; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', alt || 'Screenshot');
  lb.innerHTML = `<img src="${esc(src)}" alt="${esc(alt || '')}">`;
  const close = () => { lb.remove(); if (back && back.isConnected) back.focus({ preventScroll: true }); };
  lb.addEventListener('click', close);
  lb.addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); } });
  document.body.appendChild(lb); lb.focus({ preventScroll: true }); return lb;
}
```
Befunde: barrierefreiheit-17, bereich_trades_tag-41, bereich_notebook_news-35

**U6 Diagramme: Textalternative und Trefferflächen**

Vor `drawCharts` (Z. 231) neu:
```js
const tr = (s, v) => root.I18N ? root.I18N.t(s, v) : s.replace(/\{(\d+)\}/g, (_, i) => v[i]);
function chartLabel(k, d) {
  if (!d) return '';
  if (k === 'vbars' || k === 'hbars') { const per = d.metric === 'expectancy'; return (d.groups || []).map(g => { const v = fmt.cur(per ? g.s.expectancy : g.s.total, { signed: true }); return `${g.label || g.key}: ${per ? tr('{0} pro Trade', [v]) : v}`; }).join(', '); }
  if (k === 'pnl' && d.days && d.days.length) { let c = 0, lo = 0; d.days.forEach(x => { c += x.pnl; lo = Math.min(lo, c); }); return tr('Kumulierter Netto-P&L: Endstand {0}, tiefster Stand {1}', [fmt.cur(c, { signed: true }), fmt.cur(lo, { signed: true })]); }
  if (k === 'rolling' && d.edge && d.edge.rolling && d.edge.rolling.length) return tr('Rollierender Edge: Gesamtschnitt {0} aus {1} Trades', [fmt.r(d.edge.mean), d.edge.n]);
  if ((k === 'mc' || k === 'hist') && d.mc) return tr('Monte-Carlo-Simulation: Ruin-Wahrscheinlichkeit {0}, Median-Drawdown {1}', [fmt.pct(d.mc.ruin, 1), fmt.cur(-d.mc.dd.p50)]);
  return '';
}
```

In `drawCharts` (Z. 232) nach `drawers[k] && drawers[k](el, data, W, H);`:
```js
const svg = el.querySelector('svg'); const lab = svg && chartLabel(k, data); if (lab) { svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', lab); }
```
`fmt.cur` beachtet den Geld-blind-Modus.

`vbars` (Z. 327): `data-tip="…"` vom sichtbaren `<rect>` entfernen. Vor `</svg>` eine zweite Schleife mit **demselben** Tooltip-Text:
`` ${groups.map((g, i) => `<rect class="tip-hit" x="${ml + i * gap}" y="${mt}" width="${gap}" height="${H - mt - mb}" fill="transparent" data-tip="…bisheriger Text mit vals[i]…"></rect>`).join('')} ``

`hbars` (Z. 335): ebenso, je Zeile `<rect class="tip-hit" x="0" y="${mt + i * rowH}" width="${W - mr}" height="${rowH}" fill="transparent" data-tip="…">` (schließt die Beschriftung links ein).

Befunde: bereich_statistik-33, diagramme-46

**U7 Export** (Z. 464)
- `root.UI` um `toastWrap, announce, lightbox, requestClose` ergänzen.

#### `web/app.html`

**H1 Sprunglink** (Z. 18, erstes Kind von `<div class="shell">`)
- nachher: `<a class="skip" href="#content" data-action="skip-content">Zum Inhalt springen</a>`
- Befunde: barrierefreiheit-31, bereich_shell-14

**H2 Landmarke** (Z. 19)
- vorher: `<aside class="sidebar" id="sidebar" aria-label="Navigation">…</aside>`
- nachher: `<nav class="sidebar" id="sidebar" aria-label="Hauptnavigation">…</nav>`
- Befunde: bereich_shell-14, barrierefreiheit-49

#### `web/js/app.js`

**P1 Fokus über Neuaufbau und Seitenwechsel** (`render`, Z. 76–110)

Neue Methoden im App-Objekt:
```js
focusSnapshot() {
  const a = document.activeElement; if (!a || a === document.body) return { body: true };
  const host = a.closest('#main') ? 'main' : a.closest('#sidebar') ? 'sidebar' : null; if (!host) return null;
  const sel = this.anchorKey(a) || (a.dataset && a.dataset.pop ? `[data-pop="${CSS.escape(a.dataset.pop)}"]` : null) || (a.matches('a[href]') ? `a[href="${CSS.escape(a.getAttribute('href'))}"]` : null) || (a.id && a.id !== 'content' ? '#' + CSS.escape(a.id) : null);
  let s = null, e = null; try { s = a.selectionStart; e = a.selectionEnd; } catch (_) { /* Feldtyp ohne Auswahl */ }
  return { host, sel, s, e };
},
restoreFocus(fs, routeChanged) {
  if (!fs || !this._rendered) return; const a = document.activeElement; if (a && a !== document.body) return; /* mount hat Vorrang */
  const content = document.getElementById('content');
  if (routeChanged) { if (content) content.focus({ preventScroll: true }); return; }
  if (fs.body) return;
  const box = document.getElementById(fs.host); const hits = box && fs.sel ? box.querySelectorAll(fs.sel) : [];
  const el = hits.length === 1 && hits[0].getClientRects().length && !hits[0].closest('[inert]') ? hits[0] : null;
  if (el) { el.focus({ preventScroll: true }); if (fs.s != null && el.setSelectionRange) try { el.setSelectionRange(fs.s, fs.e); } catch (_) { /* nicht unterstützt */ } }
  else if (content && fs.host === 'main') content.focus({ preventScroll: true });
},
popInit(scope) { scope.querySelectorAll('[data-pop]').forEach(b => { if (!b.hasAttribute('aria-expanded')) b.setAttribute('aria-expanded', 'false'); if (!b.hasAttribute('aria-controls')) b.setAttribute('aria-controls', 'pop-' + b.dataset.pop); }); },
```

In `render`:
- vor Z. 96: `const fs = this.focusSnapshot();`
- Z. 96: `id="content"` → `id="content" tabindex="-1"`
- nach Z. 97 (`translateNow`): `this.popInit(main);`
- Z. 106: nach `screen.mount(main, ctx)` erneut `this.popInit(main);` (Editor-Werkzeugleiste entsteht erst dort)
- nach Z. 109: `this.restoreFocus(fs, routeChanged); this._rendered = true;`

Befunde: barrierefreiheit-2, barrierefreiheit-31, bereich_dashboard-22, barrierefreiheit-26

**P2 Menüs** (Klick-Handler Z. 275, `closePopovers` Z. 172)
- Z. 275, Zweig „öffnen“, nach `target.classList.add('open');`:
  `pop.setAttribute('aria-expanded', 'true'); this.fitPopover(target); if (e.detail === 0) { const f = target.querySelector('[aria-checked="true"]') || target.querySelector('.item:not([disabled]), a[href], button:not([disabled])'); if (f) f.focus({ preventScroll: true }); }`
  (das bisherige `this.fitPopover(target)` dorthin verschieben)
- Z. 172 in der forEach-Schleife vor `M.leave(…)`:
  `` document.querySelectorAll(`[data-pop="${CSS.escape(p.id.slice(4))}"]`).forEach(b => b.setAttribute('aria-expanded', 'false')); ``
- Befunde: bereich_dashboard-22, barrierefreiheit-26, barrierefreiheit-27, bereich_shell-12

**P3 Tastatur global** (Z. 285, ersetzt den Escape-Handler)
```js
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const op = document.querySelector('.popover.open:not(.closing)'); const trg = op && document.querySelector(`[data-pop="${CSS.escape(op.id.slice(4))}"]`); const back = !!(op && op.contains(document.activeElement));
    U.requestClose(); this.closePopovers(); if (back && trg) trg.focus({ preventScroll: true });
    if (this.state.sidebarOpen) this.closeSidebar();
    return;
  }
  /* Enter/Leertaste auf eigenen Knöpfen (div mit role=button/checkbox) wie ein Klick */
  if ((e.key === 'Enter' || e.key === ' ') && !e.repeat && !e.defaultPrevented) { const t = e.target; if (t && t.matches && t.matches('[role="button"], [role="checkbox"]') && !t.matches('button, a[href], input, select, textarea, summary, [contenteditable="true"]')) { e.preventDefault(); t.click(); return; } }
  /* Pfeiltasten in Auswahlgruppen: Fokus weiter; gewählt wird mit Enter/Leertaste */
  const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
  if (step && e.target.matches && e.target.matches('[role="radio"]')) { const g = e.target.closest('[role="radiogroup"]'); if (!g) return; const all = [...g.querySelectorAll('[role="radio"]:not([disabled])')]; const i = all.indexOf(e.target); if (i < 0) return; e.preventDefault(); all[(i + step + all.length) % all.length].focus(); }
});
```
Der Handler reagiert nur auf das Element selbst (`e.target`), nicht auf Knöpfe darin, etwa das Ordner-Menü im Notebook. Befunde: barrierefreiheit-3, barrierefreiheit-16, barrierefreiheit-12, barrierefreiheit-13, barrierefreiheit-26, barrierefreiheit-11, bereich_shell-12, barrierefreiheit-27, bereich_shell-15

**P4 Doppel-Schluss verhindern** (Klick-Handler Z. 280)
- vorher: `if (closeEl) { if (closeEl.isConnected) U.closeModal(); return; }`
- nachher: `if (closeEl) { if (closeEl.isConnected && !closeEl.closest('.modal-bg.out')) U.closeModal(); return; }`
- Befunde: barrierefreiheit-11 (Voraussetzung, K26)

**P5 Seitenleiste** (`renderSidebar` Z. 200–214)
- Z. 209 (`const desk …; const mini …`) **vor** Z. 207 ziehen.
- Z. 207 vorher: `<a href="#/${key}" class="${cur === key ? 'active' : ''}" title="${label}" data-action="nav-close">`
  nachher: `` <a href="#/${key}" class="${cur === key ? 'active' : ''}"${cur === key ? ' aria-current="page"' : ''}${mini ? ` title="${label}"` : ''} data-action="nav-close"> ``
- Z. 210: `` ${NAV_GROUPS.map(([title, items]) => `<nav class="nav nav-group" aria-label="${title}"><div class="nav-title">${title}</div>…</nav>`)} ``
  → `` ${NAV_GROUPS.map(([title, items], gi) => `<div class="nav nav-group" role="group" aria-labelledby="ng-${gi}"><div class="nav-title" id="ng-${gi}">${title}</div>…</div>`)} ``
- Z. 210: `this.userCard(theme, why('coach'))` → `this.userCard(theme, why('coach'), mini)`
- nach Z. 210: `this.popInit(sb);`
- Z. 212 nach `scrim.classList.toggle('show', open);`:
  `const mob = !desk; sb.inert = mob && !open; const mainEl = document.getElementById('main'); if (mainEl) mainEl.inert = mob && open;`
- Befunde: bereich_shell-13, barrierefreiheit-32, barrierefreiheit-49, bereich_shell-14, bereich_shell-15

**P6 Schublade öffnen und schließen** (Aktionen Z. 308–311, neue Methode)
- Z. 308: `sidebar() { this.state.sidebarOpen = !this.state.sidebarOpen; this.renderSidebar(); if (this.state.sidebarOpen) document.querySelector('#sidebar .sb-toggle')?.focus({ preventScroll: true }); },`
- Neu im App-Objekt: `closeSidebar() { const back = document.getElementById('sidebar').contains(document.activeElement); this.state.sidebarOpen = false; this.renderSidebar(); if (back) document.querySelector('.menu-btn')?.focus({ preventScroll: true }); },`
- Z. 310 mobiler Zweig `else { this.state.sidebarOpen = false; this.renderSidebar(); }` → `else this.closeSidebar();`
- Z. 311: `scrim() { this.closeSidebar(); },`
- `nav-close` (Z. 313) bleibt.
- Befunde: bereich_shell-15

**P7 Konto-Karte** (`userCard` Z. 218–233)
- Signatur `userCard(theme, coachWhy, mini)`.
- Z. 226 `link`: `role="menuitem"` streichen.
- Z. 227 vorher: `data-pop="user" aria-haspopup="menu" aria-label="Konto und Einstellungen" title="Konto und Einstellungen"`
  nachher: `data-pop="user"${mini ? ' aria-label="Konto und Einstellungen" title="Konto und Einstellungen"' : ''}`
- Z. 228: `<span class="sb-av">` → `<span class="sb-av" aria-hidden="true">` (der Hinweis-Punkt `sb-av-dot` behält sein Label)
- Z. 231: `<div class="popover up sb-menu" id="pop-user" role="menu">` → ohne `role`
- Befunde: bereich_shell-12, barrierefreiheit-27

**P8 Titelzeile** (`topbar` Z. 265–266)
- Menüknopf: `aria-label="Menü"` → `aria-label="Menü" aria-controls="sidebar"`
- Avatar: `<a class="avatar" href="#/settings/profil" title="Profil">` → `… aria-label="Profil" title="Profil">`. Die Initialen werden zu `<span aria-hidden="true">${esc(initials)}</span>`.
- Befunde: barrierefreiheit-40, bereich_shell-15

**P9 Session-Knopf** (`sessionControl` Z. 249)
- vorher: `<button type="button" class="btn" data-action="end-session" title="Session beenden">`
- nachher: `<button type="button" class="btn" data-action="end-session" aria-label="Session beenden" aria-describedby="session-timer" title="Session beenden">`
- Befunde: barrierefreiheit-39

**P10 Sprunglink-Aktion und frühe Regionen**
- In `App.actions` (nach Z. 313): `'skip-content'() { const c = document.getElementById('content'); if (c) c.focus(); },`
- In `bind()` am Anfang: `U.toastWrap(); U.announce('');`
- Befunde: barrierefreiheit-31, bewegung-32, barrierefreiheit-38

**P11 Zeitraum- und Konto-Menü** (Z. 239, 244)
- Z. 239: `<div class="rr-presets">` → `<div class="rr-presets" role="radiogroup" aria-label="Zeitraum">`. Jeder Eintrag bekommt zusätzlich `role="radio"`.
- Z. 244: die `.item`-Knöpfe (Alle Konten und die Konten) in `<div role="radiogroup" aria-label="Konto">…</div>` fassen, jeder mit `role="radio"`. `<hr>` und „Konten verwalten“ stehen danach außerhalb.
- Befunde: barrierefreiheit-26

**P12 Trade-Dialog** (Z. 348–373, 398–400, 475–479)
- Z. 348: `<form id="trade-form" class="tf" data-action="save-trade" …>` → `<form id="trade-form" class="tf" novalidate data-action="save-trade" …>` (`required` an 354, 356, 359 bleibt als Semantik)
- Z. 363 vorher: `<div class="field"><label for="f-mult">Punktwert ${U.info('…')}</label><input …>`
  nachher: `<div class="field"><div class="lbl-row"><label for="f-mult">Punktwert</label>${U.info('…')}</div><input …>`
- Z. 369: Optionen um `guard: true` ergänzen. Im `onMount` ergänzen: `el.addEventListener('input', e => { if (e.target.removeAttribute) e.target.removeAttribute('aria-invalid'); });`
- Z. 398 (`pick`) nach `btn.classList.remove('sym-none');`: `btn.removeAttribute('aria-invalid');`
- Z. 476 (`save-trade`) Prüfung ersetzen:
  ```js
  const t = App.readTradeForm(form);
  const bad = (sel, msg) => { const f = form.querySelector(sel); if (f) { f.setAttribute('aria-invalid', 'true'); f.focus(); } return U.toast(msg, 'err'); };
  if (!t.symbol) return bad('#f-symbol-btn', 'Symbol fehlt');
  if ('direction' in t && !t.direction) { const sw = form.querySelector('#f-dir'); if (sw) { sw.classList.remove('need'); void sw.offsetWidth; sw.classList.add('need'); sw.querySelector('button')?.focus(); } return U.toast('Long oder Short wählen', 'err'); }
  if (t.entryPrice == null) return bad('#f-entry', 'Einstieg fehlt');
  if (!(t.quantity > 0)) return bad('#f-qty', 'Kontrakte fehlen');
  if (!form.querySelector('#f-open').value) return bad('#f-open', 'Eröffnet fehlt'); /* roh prüfen: readTradeForm setzt leer still auf „jetzt“ */
  if (t.closedAt && t.exitPrice == null) return bad('#f-exit', 'Ausstieg fehlt');
  ```
- Befunde: wording-1, barrierefreiheit-11, barrierefreiheit-18, bereich_statistik-31

**P13 Plan & Bewertung** (Z. 428, 435, 472)
- Z. 428 vorher: `` <span class="lbl">Bewertung</span><div class="rating" id="f-rating">${…`<button type="button" data-action="set-rating" data-value="${n}" aria-pressed="${t.rating >= n}">★</button>`…} ``
  nachher: `` <span class="lbl" id="f-rating-l">Bewertung</span><div class="rating" id="f-rating" role="radiogroup" aria-labelledby="f-rating-l">${[1, 2, 3, 4, 5].map(n => `<button type="button" role="radio" class="${t.rating >= n ? 'on' : ''}" data-action="set-rating" data-value="${n}" aria-checked="${t.rating === n}" aria-label="${n} von 5 Sternen">★</button>`).join('')}</div> ``
- Z. 435: Optionen `{ cls: 'tf-modal', guard: true, onMount: … }`
- Z. 472 `set-rating` in der Schleife: `b.classList.toggle('on', Number(b.dataset.value) <= nv); b.setAttribute('aria-checked', String(Number(b.dataset.value) === nv));`
- Befunde: barrierefreiheit-13, barrierefreiheit-11

**P14 Check-in, Session starten und beenden** (Z. 490–553)
- Z. 513 `scale`:
  `` const scale = (name, val, labels, lid) => `<div class="seg pill" role="radiogroup" aria-labelledby="${lid}" data-chips="${name}">${[1, 2, 3, 4, 5].map(n => `<button type="button" role="radio" data-action="seg-set" data-name="${name}" data-value="${n}" aria-checked="${Number(val) === n}" aria-label="${n} – ${labels[n - 1]}" title="${labels[n - 1]}">${n}</button>`).join('')}</div><input type="hidden" name="${name}" value="${val || ''}">`; ``
- Z. 517 / 518: `<span class="lbl">` → `<span class="lbl" id="lbl-stress">` bzw. `id="lbl-mood"`; Aufruf `scale('stress', ci.stress, […], 'lbl-stress')` bzw. `scale('mood', …, 'lbl-mood')`
- Z. 546 `seg-set`: `b.setAttribute('aria-pressed', b === el)` → `b.setAttribute('aria-checked', String(b === el))`
- Z. 490 (`openSessionStart`): `U.modal(`…`)` → `U.modal(`…`, { guard: true })`
- Z. 524 (`openCheckIn`): `{ cls: 'narrow' }` → `{ cls: 'narrow', guard: true }`
- Z. 529 (`openSessionEnd`): `{ guard: true }` ergänzen
- Z. 531 vorher: `<label class="it toggle"><input type="checkbox" name="rule" value="${r.id}" ${…'checked'…} class="hidden">`
  nachher: `<label class="it toggle${followed.includes(r.id) ? ' done' : ''}"><input type="checkbox" name="rule" value="${r.id}" ${followed.includes(r.id) ? 'checked' : ''} class="vh">` (der change-Listener Z. 553 hält `done` danach aktuell)
- Befunde: barrierefreiheit-12, barrierefreiheit-14, barrierefreiheit-11

**P15 CSV-Import** (Z. 560)
- `<div class="dropzone" id="import-drop">` → `<div class="dropzone" id="import-drop" role="button" tabindex="0">`
- `<textarea class="input" id="import-text" …>` → zusätzlich `aria-label="CSV-Text einfügen"`
- Befunde: barrierefreiheit-16, barrierefreiheit-37

### Phase C – Einzelstellen

#### `web/js/rangepicker.js` (barrierefreiheit-42)

- Z. 21: `const st = { from: '', to: '', view: { y: 0, m: 0 }, preset: null };` → zusätzlich `fk: ''` (Fokus-Tag JJJJ-MM-TT).
- Neu vor `monthHTML`:
  ```js
  const visible = k => { const d = parse(k); return !!d && d >= new Date(st.view.y, st.view.m, 1) && d <= new Date(st.view.y, st.view.m + 2, 0); };
  function ensureFk() { if (visible(st.fk)) return; const t = keyOf(new Date()); st.fk = visible(st.from) ? st.from : visible(t) ? t : keyOf(new Date(st.view.y, st.view.m, 1)); }
  ```
- `reset` (Z. 25) und `pick` (Z. 59): am Ende `st.fk = st.from || '';`
- `inner` (Z. 45): als erste Zeile `ensureFk();`
- Z. 41 Tag-Knopf: `tabindex="${k === st.fk ? '0' : '-1'}"` ergänzen.
- Klick-Handler (Z. 71–83):
  - direkt nach `const a = b.dataset.rr;`: `const had = box.contains(document.activeElement);`
  - im Zweig `day`: `st.fk = k;`
  - nach `refresh(box);`: `` if (had) { const t = a === 'day' || a === 'clear' ? box.querySelector('.rr-day[tabindex="0"]') : [...box.querySelectorAll(`[data-rr="${a}"]`)].find(x => x.getClientRects().length); if (t) t.focus({ preventScroll: true }); } ``
- In `init` neu:
  ```js
  document.addEventListener('keydown', e => {
    const d = e.target.closest && e.target.closest('.rr-day[data-k]'); if (!d) return; const box = d.closest('[data-rr-root]'); if (!box) return;
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key], mon = { PageUp: -1, PageDown: 1 }[e.key]; if (!step && !mon) return; e.preventDefault();
    const cur = parse(d.dataset.k); if (step) cur.setDate(cur.getDate() + step); else cur.setMonth(cur.getMonth() + mon); st.fk = keyOf(cur);
    const left = new Date(st.view.y, st.view.m, 1); if (cur < left) st.view = { y: cur.getFullYear(), m: cur.getMonth() }; else if (!visible(st.fk)) { const v = new Date(cur.getFullYear(), cur.getMonth() - 1, 1); st.view = { y: v.getFullYear(), m: v.getMonth() }; }
    refresh(box); let t = box.querySelector(`.rr-day[data-k="${st.fk}"]`);
    if (t && !t.getClientRects().length) { st.view = { y: cur.getFullYear(), m: cur.getMonth() }; refresh(box); t = box.querySelector(`.rr-day[data-k="${st.fk}"]`); } /* nur ein Monat sichtbar (Handy, 961–1000 px) */
    if (t) t.focus({ preventScroll: true });
  });
  ```
  `.shell` ist ein Grid; der Sprunglink (`position: fixed`) nimmt dort keine Zelle ein (geprüft: keine `.shell > …`-Regeln).

#### `web/js/widgets.js`

| Zeile | vorher | nachher | Befunde |
|---|---|---|---|
| 36 `streakPills` | `<span class="pills col">` | `` const u = root.I18N ? root.I18N.t(unit) : unit; const lab = (root.I18N ? root.I18N.t('Längste Verlustserie: {0} · Längste Gewinnserie: {1}', [`${maxL} ${u}`, `${maxW} ${u}`]) : `Längste Verlustserie: ${maxL} ${u} · Längste Gewinnserie: ${maxW} ${u}`); `` und `<span class="pills col" role="img" aria-label="${esc(lab)}" data-tip="${esc(lab)}">` | bereich_dashboard-40 |
| 84 Streupunkte | `stroke-width="7"` | `stroke-width="16"` (r 2.6 bleibt) | diagramme-46 |
| 93 `dbars` | `data-tip` am Balken | `data-tip` vom Balken entfernen. Vor `${U.dateAxis(…)}` je Tag `<rect class="tip-hit" x="${(x(i) - gap / 2).toFixed(1)}" y="${mt}" width="${gap.toFixed(1)}" height="${ih.toFixed(1)}" fill="transparent" data-tip="…bisheriger Text…"></rect>` | diagramme-46 |
| 115 Kalendertag | `role="button" tabindex="0"` ohne Name | zusätzlich `` aria-label="${esc(e ? `${fmt.dateFull(c.date)} · ${fmt.cur(e.pnl, { signed: true })} · ${e.n === 1 ? '1 Trade' : e.n + ' Trades'}` : fmt.dateFull(c.date))}" `` | barrierefreiheit-3 |
| 170 Trade-Trefferquote | `<span class="pills">` | `<span class="pills" role="img" aria-label="${s.wins} Gewinner · ${s.be} Break-even · ${s.losses} Verlierer" data-tip="${s.wins} Gewinner · ${s.be} Break-even · ${s.losses} Verlierer">` | bereich_dashboard-40 |
| 174 Tages-Trefferquote | `<span class="pills">` | ebenso mit `${ds.winDays} Gewinntage · ${be} Break-even-Tage · ${ds.lossDays} Verlusttage` | bereich_dashboard-40 |
| 222 Kennzahl-Suche | `<input class="input" id="rep-q" placeholder="Suchen" …>` | zusätzlich `aria-label="Kennzahl suchen"` | barrierefreiheit-37 |
| 234 Uhrzeit-Menü | `<div class="popover" id="pop-uhrzeit">` mit Einträgen `aria-checked` | `<div class="popover" id="pop-uhrzeit" role="radiogroup" aria-label="Uhrzeit">`, Einträge zusätzlich `role="radio"` | barrierefreiheit-26 |
| 256 Letzte Trades | `<td>${fmt.dateFull(…)}</td>` | `<td><a class="row-link" href="#/trades/${t.id}">${fmt.dateFull(tab === 'open' ? t.open : t.close)}</a></td>` | zustaende-36, barrierefreiheit-4 |
| 374 Mentor-Widget | `<textarea class="input" name="q" …>` | zusätzlich `aria-label="Frage an den Mentor"` | barrierefreiheit-37 |

#### `web/js/editor.js`

- Z. 41 nach `cap.value = v.caption || '';`: `const altOf = () => cap.value || (root.I18N ? root.I18N.t('Bild in der Notiz') : 'Bild in der Notiz'); img.alt = altOf();`. Der input-Listener der Bildunterschrift wird zu `cap.addEventListener('input', () => { img.alt = altOf(); dirty(node); });`
- Z. 42: `img.addEventListener('dblclick', () => { const lb = …; document.body.appendChild(lb); });` → `img.addEventListener('dblclick', () => U.lightbox(img.src, img.alt));`
- Z. 112: beide `<button type="button" class="c" …>` (eigene und Standardfarben) bekommen `aria-label="${kind === 'color' ? 'Schriftfarbe' : 'Textmarker'} ${esc(c)}"`.
- Z. 118: `id="pop-${p}turn"` → `id="pop-${p}turn" role="radiogroup" aria-label="Umwandeln in"`. In Z. 164 in der forEach-Schleife zusätzlich `b.setAttribute('role', 'radio');`
- Befunde: bereich_notebook_news-35, barrierefreiheit-36, barrierefreiheit-17, barrierefreiheit-26

#### `web/js/screens/trades.js`

- **Z. 46 Sortierköpfe**
  - vorher: `` <th class="sortable ${al || ''}" data-action="trade-sort" data-key="${k}">${l}${key === k ? `<span class="dir">${dir > 0 ? '▲' : '▼'}</span>` : ''}</th> ``
  - nachher: `` <th class="sortable ${al || ''}" data-action="trade-sort" data-key="${k}"${key === k ? ` aria-sort="${dir > 0 ? 'ascending' : 'descending'}"` : ''}><button type="button" class="th-sort" data-action="trade-sort" data-key="${k}">${l}${key === k ? `<span class="dir${dir > 0 ? ' up' : ''}" aria-hidden="true">${I.chev}</span>` : ''}</button></th> ``
  - Befunde: barrierefreiheit-33, zustaende-36, typografie-30
- **Z. 49 Zeile**
  - erste Zelle: `<td>${fmt.dateFull(t.open)} <span class="muted">${fmt.time(t.open)}</span></td>` → `<td><a class="row-link" href="#/trades/${t.id}">${fmt.dateFull(t.open)} <span class="muted">${fmt.time(t.open)}</span></a></td>`
  - Regeln-Zelle: `<span class="neg" data-tip="…">` → `<span class="neg" role="img" aria-label="Gebrochen: ${esc(t.rulesBroken.join(', '))}" data-tip="…">` und `<span class="pos">` → `<span class="pos" role="img" aria-label="Alle Regeln eingehalten">`
  - Befunde: barrierefreiheit-4, zustaende-36, barrierefreiheit-34
- **Z. 50:** `<div class="tbl-scroll">` → `<div class="tbl-scroll" tabindex="0" role="region" aria-label="Trades">` (Befund: barrierefreiheit-50)
- **Z. 59:** `aria-label="Löschen"` → `aria-label="Verpassten Trade ${esc(x.symbol)} vom ${fmt.dateFull(C.parseDayKey(x.date))} löschen"` (Befund: barrierefreiheit-35)
- **Z. 77 Screenshots:** `` t.screenshots.map(id => `<div class="shot"><img data-blob="${id}" alt="Screenshot" data-action="lightbox" data-blob-id="${id}"><button … del …>`) `` → `` t.screenshots.map((id, i) => `<div class="shot"><button type="button" class="shot-open" data-action="lightbox" data-blob-id="${id}" aria-label="Screenshot ${i + 1} von ${t.screenshots.length} vergrößern"><img data-blob="${id}" alt=""></button><button … del …>`) `` (Befunde: barrierefreiheit-17, bereich_trades_tag-41)
- **Z. 79 (vor Entry):** ebenso, `aria-label="Screenshot vor Entry vergrößern"` (Befund: barrierefreiheit-17)
- **Z. 80 und 81:** `<div class="dropzone" id="pre-drop" …>` bzw. `id="shot-drop"` bekommen zusätzlich `role="button" tabindex="0"` (Befunde: barrierefreiheit-16, bereich_trades_tag-41)
- **Z. 116:** `async lightbox(el) { …; const lb = document.createElement('div'); …; document.body.appendChild(lb); }` → `async lightbox(el) { const u = await root.Blobs.url(el.dataset.blobId); if (u) U.lightbox(u, 'Screenshot'); },` (Befunde: barrierefreiheit-17, bereich_trades_tag-41)

#### `web/js/screens/day.js`

- **Z. 15:** erste Zelle `<td>${fmt.time(t.open)}${…}</td>` → `` <td><a class="row-link" href="#/trades/${t.id}">${fmt.time(t.open)}${t.close ? ` – ${fmt.time(t.close)}` : ''}</a></td> `` (Befunde: barrierefreiheit-4, zustaende-36)
- **Z. 18:**
  - vorher: `<div class="it toggle ${…}" data-action="day-rule" data-day="${key}" data-rule="${r.id}">…</div>`
  - nachher: `<button type="button" class="it toggle ${followed.includes(r.id) ? 'done' : ''}" role="checkbox" aria-checked="${followed.includes(r.id)}" data-action="day-rule" data-day="${key}" data-rule="${r.id}">…</button>`
  - Die Fokus-Rückgabe nach `App.rerender()` übernimmt P1.
  - Befunde: barrierefreiheit-15, bereich_trades_tag-41, bereich_training-20

#### `web/js/screens/progress.js`

- **Z. 73:** wie day.js:18, mit `rule.id` (Befunde: barrierefreiheit-15, bereich_training-20)
- **Z. 75 („Dein Tag“):**
  - Zeilen mit `it.action` (ohne href) werden `<button type="button" class="it toggle ${it.done ? 'done' : ''}" data-action="${it.action}">`. Für `day-note-check` kommt zusätzlich `role="checkbox" aria-checked="${!!it.done}"` dazu.
  - Zeilen mit href bleiben `<a>`, Zeilen ohne beides bleiben `<div class="it">` (z. B. „Regeln abgehakt“).
  - Befunde: bereich_training-20, barrierefreiheit-15
- **Z. 28 (Heatmap):** bleibt (siehe Zurückgestellt).

#### `web/js/screens/stats.js`

- **Z. 15:**
  - vorher: `` <div class="tabs scroll-x" data-subnav>${TABS.map(([k, l]) => `<a class="btn" href="#/stats/${k}" aria-pressed="${tab === k}" style="${tab === k ? '' : 'color:var(--text-2)'}">${l}</a>`)…}</div> ``
  - nachher: `` <nav class="tabs scroll-x" data-subnav aria-label="Statistik-Bereiche">${TABS.map(([k, l]) => `<a class="btn" href="#/stats/${k}"${tab === k ? ' aria-current="page"' : ''}>${l}</a>`).join('')}</nav> ``
  - Befunde: bereich_statistik-7, barrierefreiheit-32
- **Z. 32:** `<td>${fmt.weekdayLong(d.day)}</td>` → `<td><a class="row-link" href="#/day/${d.key}">${fmt.weekdayLong(d.day)}</a></td>` (Befunde: bereich_statistik-32, barrierefreiheit-4)

#### `web/js/screens/shadow.js`

- **Z. 69:** `<td>${fmt.dateTime(v.date)}</td>` → `<td><a class="row-link" href="#/trades/${esc(v.tradeId)}">${fmt.dateTime(v.date)}</a></td>` (Befunde: bereich_training-20, barrierefreiheit-4)

#### `web/js/screens/coach.js`

- **Z. 42, 121 (2×), 157:** `<span class="hide-m">…</span>` → `<span class="vh-m">…</span>` (Befund: bereich_konto-11)
- **Z. 87:** `<span class="sym no-i18n">${esc(r.name)}</span>` → `<a class="sym no-i18n row-link" href="#/coach/g/${esc(encodeURIComponent(gid))}/s/${esc(encodeURIComponent(r.user_id))}">${esc(r.name)}</a>` (Befunde: bereich_konto-12, barrierefreiheit-4)

#### `web/js/screens/notebook.js`

- **Z. 28:** Tag-Einträge bekommen zusätzlich `role="checkbox"` (Befund: barrierefreiheit-26)
- **Z. 61:** `<div class="popover" id="pop-nbsort">` → `… role="radiogroup" aria-label="Sortieren">`, Einträge `role="radio"` (Befund: barrierefreiheit-26)
- **Z. 74:**
  - Die Ordner-Einträge unter „In Ordner verschieben“ in `<div role="radiogroup" aria-label="In Ordner verschieben">…</div>` fassen, Einträge `role="radio"` (Befund: barrierefreiheit-26)
  - `<span class="hide-m">Teilen</span>` → `<span class="vh-m">Teilen</span>` (Befund: bereich_konto-11, gleiches Muster)

#### `web/js/screens/dashboard.js`

- **Z. 30–32 (Vorlagen-Menü):** am Knopf `item name` der aktiven Vorlage `aria-current="true"` ergänzen (Befund: barrierefreiheit-26)
- **Z. 41 Ziehgriff:** `aria-label="Verschieben"` → `aria-label="Verschieben" aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown"` (Befund: barrierefreiheit-48)
- **Z. 78:** Widget-Suche bekommt zusätzlich `aria-label="Widget suchen"` (Befund: barrierefreiheit-37)
- **Z. 124 Filter-Knopf:** zusätzlich `aria-expanded="false" aria-controls="fd-pop"` (Befunde: bereich_dashboard-22, barrierefreiheit-5)
- **Z. 154 (`bindDnD`)** nach den mousedown/mouseup-Listenern:
  ```js
  h.addEventListener('keydown', ev => { const d = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[ev.key]; if (!d) return; ev.preventDefault(); const b = w.querySelector(`.mv [data-dir="${d}"]`); if (!b || b.disabled) return; const area = w.dataset.area, to = Number(w.dataset.idx) + d; b.click(); const nh = main.querySelector(`.w[data-area="${area}"][data-idx="${to}"] .handle`); if (nh) nh.focus({ preventScroll: true }); });
  ```
  `click()` löst `dash-move` auch auf den am Desktop ausgeblendeten `.mv`-Knöpfen aus (Befund: barrierefreiheit-48).

#### `web/js/screens/dash-filter.js` (barrierefreiheit-5, bereich_dashboard-22, barrierefreiheit-13, barrierefreiheit-37)

- **Z. 95:** `<input class="input" id="fd-q" placeholder="Suchen …" …>` → zusätzlich `aria-label="${PICK_LABEL[key]} suchen"`
- **Z. 103 `toggles`:** `opts.map(([v, l]) => …${l}</button>)` → `` opts.map(([v, l, a]) => `<button … ${a ? `aria-label="${a}" ` : ''}…>${l}</button>`) ``
- **Z. 121:** `[n, '★'.repeat(n)]` → `` [n, '★'.repeat(n), n === 1 ? '1 Stern' : `${n} Sterne`] ``
- **Z. 158–165 `refresh`:**
  - vor `body.innerHTML = …`: `const fa = document.activeElement; const fk = fa && l.contains(fa) ? App.anchorKey(fa) : null; const fkey = fa && fa.dataset ? fa.dataset.key : null;`
  - am Ende: `` if (!focusQ && fk) { const t = l.querySelector(fk) || (fkey ? l.querySelector(`[data-action="dash-f-pick"][data-key="${fkey}"]`) : null); if (t) t.focus({ preventScroll: true }); } ``
- **Z. 168 `open`** nach `place();`:
  ```js
  const b = document.querySelector('[data-action="dash-f-open"]'); if (b) b.setAttribute('aria-expanded', 'true');
  const l = layer(); if (!l._trap) { l._trap = true; l.addEventListener('keydown', e => { if (e.key !== 'Tab') return; const f = [...l.querySelectorAll('#fd-pop button:not([disabled]), #fd-pop input, #fd-pop select')].filter(x => x.getClientRects().length); if (!f.length) return; const i = f.indexOf(document.activeElement); if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); } }); }
  const g = document.querySelector('#fd-pop .fd-gh'); if (g) g.focus({ preventScroll: true });
  ```
- **Z. 169 `close`:** `function close(ret) { const u = ui(); const was = u.open; u.open = false; u.draft = null; u.pick = null; const l = document.getElementById('fd-layer'); if (l) l.innerHTML = ''; const b = document.querySelector('[data-action="dash-f-open"]'); if (b) { b.setAttribute('aria-expanded', 'false'); if (ret === true && was) b.focus({ preventScroll: true }); } }`
- **Z. 170:** `window.addEventListener('hashchange', close);` → `window.addEventListener('hashchange', () => close());` (das Event-Objekt darf nicht als `ret` ankommen)
- **Z. 174 Escape:** `else close();` → `else close(true);`
- **Z. 178:** `'dash-f-close'() { close(); }` → `'dash-f-close'() { close(true); }`
- **Z. 189 `dash-f-apply`:** nach `App.rerender();` ergänzen: `document.querySelector('[data-action="dash-f-open"]')?.focus({ preventScroll: true });`

#### `web/js/screens/misc.js`

- **Z. 15 `switchRow`** (barrierefreiheit-29):
  - oben im Modul: `let swN = 0;`, und als erste Zeile in `App.screens.settings.render` (Z. 19) `swN = 0;` (stabile ids je Aufbau, sonst findet P1 den Schalter nicht wieder)
  - nachher:
    ```js
    const switchRow = (title, text, action, on, extra = '') => { const id = 'sw' + (++swN); return `<div class="set-row"><button type="button" class="switch" role="switch" id="${id}" aria-checked="${!!on}" data-action="${action}" ${extra} aria-describedby="${id}-d"></button><div><label for="${id}" class="set-row-l"><b>${esc(title)}</b></label><div class="small muted" id="${id}-d">${text}</div></div></div>`; };
    ```
    Das bisherige `aria-label` entfällt, der Name kommt aus dem Label. Eindeutig auch bei mehrfach genutzten Aktionen (`notif-toggle`, `navdot-toggle`).
- **Z. 21:** im Link `${sec === s[0] ? ' aria-current="page"' : ''}` ergänzen (Befunde: bereich_einstellungen-21, barrierefreiheit-32)
- **Z. 93:** Punkt `aria-label="Eigene Farbe ${c}"`, × `aria-label="Farbe ${c} löschen"` (statt „Farbe löschen“) (Befunde: bereich_einstellungen-20, barrierefreiheit-36)
- **Z. 145:** `<div class="dots">` → `<div class="dots" role="group" aria-label="Akzentfarbe">`, jeder Preset-Punkt `aria-label="${n}"` (data-tip bleibt) (Befunde: bereich_einstellungen-20, barrierefreiheit-36)
- **Z. 186:** `aria-label="Bearbeiten"` → `aria-label="Konto „${esc(a.name)}“ bearbeiten"`, `aria-label="Löschen"` → `aria-label="Konto „${esc(a.name)}“ löschen"` (Befunde: barrierefreiheit-35, bereich_einstellungen-21)
- **Z. 207:** Schalter `aria-label="Aktiv"` → `aria-label="Regel „${esc(r.text)}“ aktiv"`, Papierkorb `aria-label="Löschen"` → `aria-label="Regel „${esc(r.text)}“ löschen"` (Befunde: barrierefreiheit-35, bereich_einstellungen-21)
- **Z. 238:** Tag-Suche bekommt zusätzlich `aria-label="Tags suchen"` (Befund: barrierefreiheit-37)
- **Z. 239:** `Tag „${esc(r.n)}“ bearbeiten` / `Tag „${esc(r.n)}“ löschen` (Befunde: barrierefreiheit-35, bereich_einstellungen-21)
- **Z. 255:** `aria-label="Eintrag entfernen"` → `aria-label="Import ${esc(x.file || when(x.at))} entfernen"` (Befund: bereich_einstellungen-21)
- **Z. 259:** Log-Suche bekommt zusätzlich `aria-label="Log-Typ suchen"` (Befund: barrierefreiheit-37)
- **Z. 365:** `<div class="dropzone" id="bk-drop">` → zusätzlich `role="button" tabindex="0"`; `<textarea class="input mono" id="bk-text" …>` → zusätzlich `aria-label="Sicherung als Text einfügen"` (Befunde: barrierefreiheit-16, barrierefreiheit-37)

#### `web/js/screens/prop.js`

- **Z. 233:** `aria-label="Bearbeiten"` / `"Löschen"` → `Konto „${esc(accName(a))}“ bearbeiten` / `Konto „${esc(accName(a))}“ löschen` (Befund: barrierefreiheit-35)
- **Z. 237:** `Bearbeiten` / `Löschen` / `Ansehen` / `Kopieren` → `` Preset „${esc(`${p.firm} ${p.name}`)}“ bearbeiten `` / `… löschen` / `… ansehen` / `… kopieren` (Befund: barrierefreiheit-35)
- **Z. 263:** `aria-label="Löschen"` → `aria-label="Ausgabe vom ${fmt.dateFull(e.date)} löschen"` (Befund: barrierefreiheit-35)
- **Z. 267:** `aria-label="Löschen"` → `aria-label="Payout vom ${fmt.dateFull(p.requestedAt)} löschen"` (Befund: barrierefreiheit-35)
- **Z. 294:** `${I.plus}<span class="hide-m">Prop-Konto</span>` → `${I.plus}<span>Prop-Konto</span>` (Beschriftung auf allen Breiten; den Wortlaut regelt die Gruppe Wortwahl) (Befund: bereich_prop-11)
- **Z. 304 und 305:** `aria-pressed="${…}"` an den `<a>` streichen, `aria-current="page"` bleibt (Befund: barrierefreiheit-32)

#### `web/js/screens/prop-friedhof.js` (bereich_prop-48)

- **Z. 132:** ` title="Umdrehen"` an `.pg-stone` streichen
- **Z. 142:** `<div class="pg-face pg-back" aria-hidden="true">` → `<div class="pg-face pg-back" aria-hidden="true" inert>`
- **Z. 166:** ersetzen durch
  ```js
  const front = stone.querySelector('.pg-front'), back = stone.querySelector('.pg-back'); front.inert = on; back.inert = !on; front.setAttribute('aria-hidden', String(on)); back.setAttribute('aria-hidden', String(!on)); if (e && e.detail === 0) { const t = (on ? back : front).querySelector('.pg-turn'); if (t) t.focus({ preventScroll: true }); }
  ```
  Klicks auf inerte Knoten landen beim Vorfahren `.pg-stone`, das Umdrehen per Klick bleibt.

#### `web/js/screens/affiliate.js`

- **Z. 51:** `aria-pressed="${view === k}"` an den `<a>` streichen (Befund: barrierefreiheit-32)

#### `web/js/screens/mentor.js` (barrierefreiheit-38, barrierefreiheit-37)

- **Z. 83:** `<div class="mentor-log" id="mentor-log">` → zusätzlich `role="log"`
- **Z. 84:** Eingabe bekommt zusätzlich `aria-label="Nachricht an den Mentor"`
- **Z. 108:** nach `App.rerender();`: `U.announce(root.I18N ? root.I18N.t('Mentor schreibt …') : 'Mentor schreibt …');`
- **Z. 111:** nach dem Push der Antwort: `U.announce('Mentor: ' + String(r.reply || '').slice(0, 500));`

#### `web/js/screens/news.js`

- **Z. 49:** an beiden Varianten von `.nw-imp` `role="img"` und `aria-label` mit demselben Text wie `title` ergänzen („Hohe/Mittlere/Niedrige Wichtigkeit“, „Feiertag“) (Befund: bereich_notebook_news-47)

### Phase D – Wörterbücher

#### `web/js/lang/{en,es,pt,zh,hi}.js`

- **D1:** Alle Schlüssel aus dem Glossar Z8 eintragen. „Einstiegskurs fehlt“ und „Ausstiegskurs fehlt für geschlossenen Trade“ entfernen, „Session beenden“ nachtragen (fehlt heute in en.js).
- **D2:** Muster mit `{0}`, `{1}`, `{2}` als Muster-Schlüssel. Doppelte `{n}` in einem Schlüssel vermeiden; dafür sind die Serien- und Diagramm-Labels über `I18N.t` gebaut.
- Befunde: alle mit neuen Texten (bereich_dashboard-40, barrierefreiheit-12, barrierefreiheit-13, barrierefreiheit-17, barrierefreiheit-31, barrierefreiheit-34, barrierefreiheit-35, barrierefreiheit-36, barrierefreiheit-37, barrierefreiheit-38, barrierefreiheit-39, bereich_einstellungen-20, bereich_einstellungen-21, bereich_statistik-33, wording-1, bereich_shell-14, barrierefreiheit-49, barrierefreiheit-11, bereich_notebook_news-35)

### Phase E – Tests und README

#### `web/e2e/*.js`

| Datei:Zeile | vorher | nachher |
|---|---|---|
| dashtest.js:15 | `'.dash-top span.info, .dash-main span.info'` | `'.dash-top button.info, .dash-main button.info'` |
| notechecktest.js:14 | `x.tagName === 'DIV'` | `x.tagName === 'BUTTON'` und `x.getAttribute('role') === 'checkbox'` |
| newstest.js:52 | `getComputedStyle(r).opacity < 0.7` | `r.classList.contains('past') && getComputedStyle(r.querySelector('.nw-title')).color === (() => { const s = document.createElement('span'); s.className = 'muted'; document.body.appendChild(s); const c = getComputedStyle(s).color; s.remove(); return c; })()` |
| proptest.js:19, 91, 95 · friedhoftest.js:21 | `.prop-tabs a[aria-pressed=true]` | `.prop-tabs a[aria-current=page]` |
| affiliatetest.js:16 | `x.getAttribute('aria-pressed')`, Soll `Alle Creator:true,…` | `x.getAttribute('aria-current')`, Soll `'Alle Creator:page,Creator-Ansicht:null'` |
| calmnavtest.js:51 | `t.querySelector('[aria-pressed="true"]')` | `t.querySelector('[aria-current="page"]')` |
| dptest.js:92 | „Zweites Escape schließt den Dialog“ | Das Feld wurde geändert (Z. 70–80). Zweites Escape zeigt „Änderungen verwerfen?“, dann Klick auf `[data-confirm]`, danach `!document.querySelector('.modal-bg')` |

Danach `web/e2e/runall.sh` vollständig, besonders `tradeformtest`, `mobiletest` (Affiliate-Tabelle bei 390 ohne seitliches Scrollen, Tabellen mit 40-px-Knöpfen), `rangetest`, `sixtest`, `filtertest`, `coachtest`, `usercardtest`, `sidebartest`, `motiontest`, `switchtest`, `glidetest`, `tiptest`.

#### `web/README.md`

- Z. 318: „Tastatur: **N** neuer Trade, **1–6** Bereiche, **Esc** schließt Dialoge“ → „Tastatur: **N** neuer Trade, **1–6** Bereiche, **Esc** schließt Dialoge (Formular-Dialoge mit geänderten Eingaben fragen „Änderungen verwerfen?“), **Tab** am Seitenanfang: „Zum Inhalt springen“, **Pfeiltasten** in Auswahlgruppen, im Zeitraum-Kalender und am Ziehgriff.“
- Neuer Absatz unter „Neuaufbau ohne Springen“: Fokus bleibt beim Neuaufbau auf demselben Element (`App.focusSnapshot`/`restoreFocus`), Seitenwechsel setzt ihn auf `#content`, Dialoge fokussieren sich selbst und geben ihn zurück, Fokusring neutral `--focus`.

---

## 4. Akzeptanzkriterien

### grep-Prüfungen (im Ordner `web/`)

1. `grep -nE ':focus[^{]*\{[^}]*(--accent|--accent-soft|--border-2|--dir-c)' css/app.css` → **0 Treffer** (Fokusregeln nur mit `--focus`/`--text-2`).
2. `grep -n -- '--focus' css/app.css` → Definition in `:root` plus ≥ 14 Verwendungen.
3. `grep -c 'span\.info' css/app.css` → **0**. `grep -n 'class="info"' js/ui.js` → nur `<button type="button" class="info"`.
4. `grep -rnE 'role="menu"|role="menuitem"|aria-haspopup="menu"' js` → **0**.
5. `grep -rnE '<a [^>]*aria-pressed' js` → **0**.
6. `grep -rn 'aria-checked' js` → jede Fundstelle hat in derselben Zeile `role="radio"`, `role="checkbox"` oder `role="switch"`, oder setzt den Zustand per `setAttribute` an solchen Elementen (Liste: app.js 239/244/318/546/472, widgets.js 234, notebook.js 28/60/61/74, editor.js 164, rangepicker.js 93, misc/shadow/coach Schalter, replay.js).
7. `grep -rn 'class="hide-m">' js` → nur noch `dashboard.js:124` (Filter, mit aria-label) und `stats.js:9` (Zertifikat, mit aria-label).
8. `grep -n 'type="checkbox"[^>]*class="hidden"' js/app.js` → **0**.
9. `grep -n 'novalidate' js/app.js` → Trade-Formular. `grep -rn "'Einstiegskurs fehlt'\|Ausstiegskurs fehlt" js` → **0**.
10. `grep -rn 'tr class="link"' js` → jede Zeile enthält `class="row-link"` (trades, day, stats, shadow, widgets, coach).
11. `grep -n 'aria-current="page"' js/app.js js/screens/misc.js js/screens/stats.js` → Seitenleiste, Einstellungs-Menü, Statistik-Reiter.
12. `grep -c 'Zum Inhalt springen' js/lang/en.js` = 1 (ebenso es, pt, zh, hi und alle Schlüssel aus Z8).

### Sonden

Ausführen im Scratchpad: `export NODE_PATH=$(npm root -g) && node -r ./de-default.js audit/a11y-probe2.js`.

13. `audit/a11y-probe2.js` liefert:
    - `switch-space -> BUTTON.switch …` (checked wechselt),
    - `stats-tab-enter -> A.btn […]` (der gewählte Reiter),
    - `trades-view-enter -> BUTTON […Tage]`,
    - `cal-day-enter -> route #/day/<heute>`, `cal-day-space -> route #/day/<heute>`,
    - `nb-folder-enter changed=true`,
    - `pagesize-change -> SELECT…`.
    Kein Ergebnis darf `BODY` sein.
14. `audit/a11y-probe.js`:
    - nach Taste N und nach Enter auf „Trade loggen“ ist `activeElement` = `DIV.modal` (inModal=true),
    - von 30 Tab-Schritten landet keiner in `.shell`,
    - nach Escape ist der Fokus wieder auf „Trade loggen“,
    - Check-in nach dem Öffnen: `activeElement` ist `.modal`, nicht `[data-close]`,
    - `tabs-to-content`: 1. Tab = `.skip`, Enter → `activeElement.id === 'content'` und `location.hash` unverändert,
    - Info-Symbole auf Statistiken: `focusable` = Anzahl (16), `ariaLabel` gesetzt.
15. `audit/shell-probe` (390 × 844):
    - nach Klick auf `.menu-btn` ist der Fokus auf `#sidebar .sb-toggle` und `#main.inert === true`,
    - Tab bleibt in der Leiste,
    - Escape → Fokus `.menu-btn`, `#main.inert === false`,
    - bei geschlossener Schublade `#sidebar.inert === true`.
    Konto-Menü (1440): Enter → Fokus auf „Profil“, Escape → Fokus `.sb-user`, `aria-expanded` wechselt false → true → false.
16. Zeitraum-Menü: vom Auslöser bis „Anwenden“ ≤ 14 Tab-Schritte (heute 74). Pfeil rechts vom Monatsletzten zeigt den Folgemonat mit Fokus auf dem 1.
17. Dashboard-Filter per Tastatur:
    - Enter öffnet, `activeElement` = erste `.fd-gh`,
    - Enter auf „Long“ lässt den Fokus auf „Long“,
    - Tab am letzten Element springt zum ersten,
    - Escape → Fokus auf dem Filter-Knopf, `aria-expanded="false"`.

### Kontrast und Maße

18. `--focus` gegen `--bg` und `--surface`: ≥ 3:1 in Graphit, Schwarz und Weiß (Soll ≈ 15–19:1).
19. Bei 390 px, Messung mit `elementFromPoint` 8 px außerhalb der sichtbaren Kante:
    - trifft Schalter, Menüknopf, Avatar, Schubladen-×, Hell/Dunkel-Knopf (oben/unten), `.more-link`, Lösch-× am Farbpunkt (nach außen) und (i) auf Touch,
    - `.aff-pct` ≥ 33 px hoch,
    - Check-in-Skala ≥ 44 × 44,
    - `.fd-seg button` ≥ 38 px,
    - Seitenwähler 44 × 40.
20. Zensus (Handy 390, Dashboard): `fontSize 9.5px` = 0; `.cal .d .pm` = 10.5px Onest 700; `.cal .d .n` = 11px. Zensus dark 1440: `10.5px` sinkt von 26 um die Zahl der Abzeichen (≤ 6 bleiben: `.wr`, Grab-Labels, Mini-Pillen); `span.badge` = 11px Satoshi.

### Screenshot-Prüfpunkte

Aufnahmen wie `audit/shots/` (dark/light, 1440/390).

21. **Unverändert für Maus-Nutzer** (Pixelvergleich, keine sichtbare Abweichung): dashboard, stats_*, trades, day, prop_*, settings_* (bis auf die Ausnahmen unten), notebook, Seitenleiste voll und eingeklappt, Konto-Menü.
22. **Erwartete sichtbare Änderungen, sonst keine:**
    - Check-in-Skala 36 px (Handy 44),
    - Bewertungssterne 32 px,
    - „+ Prop-Konto“ am Handy mit Text,
    - Stift am Provisionssatz am Handy,
    - vergangene News in `--muted`,
    - Kalender-Kurzbeträge am Handy 10,5 Onest,
    - LONG/SHORT 11 px,
    - Eingabefeld-Fokus mit grauem statt grünem Rand ohne Schein,
    - gewählter Eintrag in Zeitraum-, Konto-, Uhrzeit- und Vorlagen-Menü neutral (helle Fläche) statt grün,
    - Sortierpfeil als Chevron,
    - keine Browser-Tooltips mehr an den Navigationslinks der vollen Leiste,
    - Tooltip an den Zahlen-Pillen beim Darüberfahren.
23. **Tastatur-Aufnahmen** (Tab bis zum Element, dunkel und hell): Schalter, Schieberegler, Symbol-Option, Theme-Karte, Sortierkopf, Trade-Zeile, (i), Ordner, Kalendertag zeigen einen 2-px-Umriss in `--text`. Kein grüner Ring, kein Schein.
24. Trade-Dialog „Trade speichern“ ohne Einstieg: keine Browser-Blase, Toast „Einstieg fehlt“, Feld mit rotem Rand und Fokus.

### Tests

25. Alle Suiten in `web/e2e/runall.sh` grün, inklusive der angepassten aus Phase E. `node --test web/tests/core.test.mjs` grün.

---

## 5. Zurückgestellt

| Befund (Teilaspekt) | Was nicht umgesetzt wird | Grund |
|---|---|---|
| bereich_training-20 – Heatmap-Zellen im Fortschritt (`progress.js:28`) | Zellen bleiben Maus-Abkürzung ohne Tab-Stopp | Bis zu 91 Zellen als Tab-Stopps wären Lärm. Jeder Tag ist per Tastatur über die Tagesansicht (Vor/Zurück, Datum) und das jetzt bedienbare Kalender-Widget erreichbar. Checklisten und Verstoß-Zeilen dieses Befunds werden umgesetzt. |
| barrierefreiheit-46 – `.cp-x` im Farbwähler | Lösch-× im Farbwähler bleibt 16 px Trefferfläche | Die Felder sind 24 px mit 8 px Abstand (`app.css:457–459`). Eine größere Fläche ragt ins Nachbarfeld, ein Fehlklick löscht ohne Rückfrage. `.dot-x` (Einstellungen) wird vergrößert. |
| bereich_konto-11 – zusätzliche `data-tip` an „Aufgabe an alle“ / „Aktualisieren“ | keine weiteren Tooltips | Am Desktop wiederholen sie nur die sichtbare Beschriftung, auf Touch zeigen sie nichts. Der Name kommt über `.vh-m`. |
| Blind-Replay (`.rp`, `app.css:2144, 2232, 2240`) | Fokusfarben bleiben `--phase` | Feature-Flag aus (BRIEF). Beim Freischalten auf `--focus` umstellen. |

---

## 6. Nutzer fragen

| Befund | Frage | Empfehlung |
|---|---|---|
| bereich_shell-30 | Du hast den Hell/Dunkel-Schalter im Konto-Menü bewusst schlank gemacht (26 × 22). Soll er auf Touch-Geräten sichtbar größer werden (Knöpfe 36 × 32)? | **Nein.** Diese Spezifikation vergrößert nur die unsichtbare Trefferfläche auf 26 × 34. Die Optik bleibt, und WCAG 2.5.8 ist erfüllt. |
| barrierefreiheit-8, bereich_prop-39 | Beim Trade-Dialog hast du festgelegt, dass kein Feld vorausgewählt ist. Sollen andere Formular-Dialoge (Check-in, Prop-Konto, Plan & Bewertung …) beim Öffnen am PC direkt im ersten Feld stehen? | **Nein**, dieselbe Regel wie bei „Trade loggen“. Der Dialog selbst bekommt den Fokus. Tastatur-Nutzer sind mit zwei Tab-Schritten im ersten Feld, Maus-Nutzer sehen keinen vorausgewählten Rahmen, am Handy springt keine Tastatur auf. |
| bereich_dashboard-21 | Du hast die (i)-Zeichen bewusst zurückgenommen. Sollen sie auf Touch-Geräten (dort immer sichtbar) kräftiger sein (`--muted`, 4,8:1 statt `--faint`, 2,1:1)? | **Nein.** Die Erklärungen sind Zusatzinformation und per Antippen erreichbar. Das Ziel wird hier unsichtbar auf 24 px vergrößert. |
