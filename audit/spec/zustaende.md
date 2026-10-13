# Zielspezifikation „Zustände und Randfälle“

Gilt für die 77 bestätigten Befunde in `audit/spec-input/zustaende.json`. Verbindlich bleibt `audit/BRIEF.md`: ruhig, flach, Grün nur für Gewinn und „Trade loggen“, Gewichte 500/600/700, Skelett statt Ladesymbol, nichts Dekoratives. Alle Zeilenangaben beziehen sich auf den Stand von Commit `677b630` (13.10.). Bei jeder Änderung den Selektor bzw. den zitierten Code suchen, nicht blind die Zeile.

Bezüge zu anderen Gruppen-Spezifikationen (dort umgesetzt, hier nur genutzt):
- **komponenten-2** (Spec Komponenten): Optik des gewählten Menüeintrags (`.popover .item[aria-checked="true"]`: `color: var(--text); background: var(--surface-2)`, Haken links in 16-px-Spalte bei Konto und Vorlage). Hier wird nur festgelegt, *welcher* Eintrag gewählt ist.
- **wording-2 / zustaende-20** (Spec Wortwahl): Anzeige von Datumsfeldern samt Leerzustand in `--faint`. Deckt komponenten-15 ab (Fallback in Schritt S-DP).
- **bereich_shell-5** (Spec Responsiv): Handy-Skelett. Ändert dieselben Regeln `.boot-head`, `.boot-tiles`, `.boot-main` wie Schritt S-C21; zusammen umsetzen, erst S-C21, dann bereich_shell-5.
- **bereich_notebook_news-36** (Spec KI-Look): löscht den Block `app.css:779–788`. Damit ist auch Schritt S-C25 (Zeile 783) erledigt.
- **bereich_notebook_news-39** (Spec Aufbau): News-Filter in die Kopfreihe. Verträgt sich mit Schritt S-NW.

---

## 1. Zielzustand

### Z1 Leerzustände: vier Stufen, eine Sprache

| Stufe | Wann | Aufbau und Maße |
|---|---|---|
| **A Seiten-Leerzustand** `U.empty(icon, titel, satz, knopf)` | Eine ganze Seite oder ein ganzer Reiter hat nichts zu zeigen (Statistik-Reiter, TradeLog-Liste, Tagesansicht-Karte „Trades des Tages“, Edge-Check ohne R) | Symbol 34 px `--faint`; Titel 15 px / **600** `--text`; Satz 13 px (`.small`) `--muted`, max. 360 px; Knöpfe `.btn.sm` nur für den nächsten Schritt, höchstens zwei in einer Reihe (TradeLog: „CSV importieren“ und „Trade loggen“, wie bisher); `min-height: 180px`, `padding: 40px 20px`, `gap: 8px` (bestehende `.empty`). Der Satz sagt, was zu tun ist. Ein leerer Satz (`''`) ist verboten. |
| **B Karten-/Diagramm-Leerzustand** `U.chartEmpty(el, titel, hinweis)` bzw. `U.chartEmptyHTML(...)` | Ein Diagramm oder eine Karte in einer sonst gefüllten Seite hat keine Daten (Dashboard-Widgets, Diagramm-Zeichner) | Symbol 24 px `--faint`; Titel 13 px / 500 `--text-2`; Hinweis (optional) 12 px `--muted`; `padding: 16px; gap: 6px`. In einem `.chart`: `height: 100%` der Diagrammfläche. Als ganze Karte (`emptyBox`): füllt die Karte (`flex: 1 1 auto`), Mindesthöhe = Höhe des fehlenden Diagramms (220/280/300 px). **Dashboard-Karten zeigen nur den Titel, keinen Hinweis** (Zeitraum, Filter und Willkommen-Banner stehen darüber). |
| **C Leere Liste in einer Karte** `.dashed` | Ein Abschnitt innerhalb einer Karte mit weiterem Inhalt ist leer (Fortschritt, Prop-Bilanz „Pro Firma“) | unverändert: 13 px `--muted`, `1px dashed var(--border-2)`, Radius 10 px, Innenabstand 12/14 px. Ein Satz, kein Knopf. |
| **D Kennzahl ohne Wert** | Wertfeld einer Kachel oder Hero-Zahl | „—“ (U+2014) in Größe und Schrift des Werts, `font-weight: 500`, `--muted`. Für Screenreader steht daneben `<span class="vh">Noch keine Daten</span>`. |

Regeln:
1. **Keine leere Fläche über einem Leerzustand.** Ein Diagramm, das nur eine Nulllinie oder Platzhaltergrafik zeigen würde, wird nicht ausgegeben: Statistik-Kopfdiagramm ohne abgeschlossene Trades, Kennzahlen-Karte der Tagesansicht ohne Trades, Prop-Bilanz-Diagramm und „Pro Firma“ ohne Ausgaben und Payouts, „Rollierender Edge“ unter der Mindestzahl, Friedhof-Karte „Muster“ unter zwei Grabsteinen, „Disziplin pro Woche“ ohne Wochen.
2. **Keine Bedienelemente ohne Wirkung.** Kein „Mehr anzeigen“ unter leerer Liste, kein Zeitraum-Umschalter über leerer Schülerliste, kein Seitenwähler bei einer Seite, keine Kontowahl im Mentor ohne Server, keine zwei Knöpfe für dieselbe Aktion in einer Karte.
3. **Kein Schein-Erfolg und keine Schein-Null.** Ohne Daten kein „erreicht“, kein Grün, kein „0 %“ als Quote, kein ∞, keine Scheinwerte wie „0,00 R bis 0,00 R“.
4. **Die Klasse `.empty` ist nur für Leerzustände.** Andere Komponenten markieren „keine Werte“ mit `is-none` (z. B. Zustand-Spalte).

**Wortlaut der Leerzustände (Glossar):**

| Lage | Titel | Satz (nur Stufe A) |
|---|---|---|
| Gewähltes Konto hat keinen einzigen Trade (`App.allTrades().length === 0`, auf dem Dashboard `rawAll`) | Noch keine Trades | Logge deinen ersten Trade oder importiere eine CSV-Datei. |
| Trades vorhanden, Auswertung über abgeschlossene Trades im Zeitraum leer | Keine abgeschlossenen Trades im Zeitraum | Ändere den Zeitraum oder logge Trades. |
| Trades vorhanden, Liste aller Trades (TradeLog) im Zeitraum leer | Keine Trades im Zeitraum | Ändere den Zeitraum oder logge Trades. |
| Statistik → Tage leer | Keine Handelstage im Zeitraum | Ändere den Zeitraum oder logge Trades. |
| Suche oder Filter aktiv und dadurch leer | Keine Trades passen zum Filter | Ändere die Filter oder den Zeitraum. |
| „Letzte Trades“ (ohne Zeitraum), keine geschlossenen | Noch keine abgeschlossenen Trades | – |
| „Offene Positionen“ leer | Keine offenen Positionen | – |
| Teilreihe eines Diagramms leer, Seite sonst gefüllt | Noch keine Daten | – |
| Edge-Check ohne Trades mit R | Keine Trades mit R im Zeitraum | Trage in der Trade-Ansicht unter „Plan & Bewertung“ einen Stop ein, dann wird das R-Multiple berechnet. |

Nicht mehr verwenden: „Logge Trades oder ändere den Zeitraum.“, „Noch keine Daten“ als sichtbarer Kachelwert, „Keine Daten“ als Hero-Wert, leere Sätze in `U.empty`.
Bedingung „leeres Journal“ ist immer das **gewählte Konto ohne Dashboard-Filter** (`App.allTrades()` bzw. `rawAll`), nie `S.data.trades` (alle Konten).

### Z2 Werte: fehlend, null, unendlich, Stellen, Dauer

1. **Fehlender Wert = „—“.** Nie „–“, nie ein Wort im Wertfeld. In Tabellen steht der Strich in `.faint`. **Wörter** („offen“) stehen nie in `.faint` (Kontrast `--faint` auf `--surface` 2,06:1), sondern mindestens in `.muted` (4,85:1).
2. **Echte Null ist eine Zahl.** „0 %“, „0,00 €“, „0“. Bedeutet die Null „noch nichts getan“, steht sie in `.muted` (Vorbild `.dstreak.s0`, app.css:1219). Eine Null ist nie grün oder rot („0 / 0“ neutral, „2 / 0“: nur die 2 grün).
3. **Unendlich nur, wenn es stimmt.** ∞ nur bei „Gewinne ohne Verluste“. Nur Verluste oder gar nichts ergibt 0. Die bestehende Konvention bleibt: `null` = ∞ (core.js:85/88/121).
4. **Anteile in Tooltips höchstens 100 %** (gekappt).
5. **Geldbeträge: immer zwei Nachkommastellen.** Null Stellen nur bei ausdrücklichem `compact` (Achsen `fmt.axisCur`, Kalenderzellen, Kachel-Kurzformen `curShort`/`curCompact`). Keine Schwelle mehr ab 10.000. Folge: In einer Spalte, Zeile oder Kachelreihe haben alle Beträge dieselbe Stellenzahl.
6. **Kurse:** ab 10 genau 2 Nachkommastellen („21.190,00“), unter 10 vier bis fünf („1,08525“).
7. **Dauer als Messwert** (`fmt.dur`): „45 s“, „12 min“, „1 h 5 min“, „2 T“. Achsenbeschriftung (Haltedauer-Widget) mit genau einer Einheit: „45 s“, „5 min“, „1,5 h“, „12 h“, „2 T“. Nie „1h:05m“ oder „12m:05s“.
8. **Countdown als Satz** (nur News, README Z. 114): „Jetzt“, „In 12 Min.“, „In 3 Std. 20 Min.“, „In 3 Std.“, „Morgen“, „In 3 Tagen“. Immer groß am Anfang. Tage sind **Kalendertage**, nie `Math.round(h/24)`. Unter 6 Stunden wird immer relativ gezählt, auch über Mitternacht. Am selben Kalendertag bleibt der Stunden-Countdown.

### Z3 Ausgewählt, aktiv, Hover

1. **Ein gemeinsamer Ausgewählt-Stil** (Block am Ende von app.css, Z. 3120–3131): Fläche `color-mix(in srgb, var(--text) 10%, var(--surface))`, Rand `color-mix(in srgb, var(--text) 22%, var(--border-2))`, Schrift `--text`, kein Schatten. Neu im Selektor: `.btn.is-on` (Filter-Knopf bei aktivem Filter). Kein zweiter Ausgewählt-Stil.
2. **Grün markiert nie eine Auswahl.** Zeitraum-Kalender und Datumswähler: Band `--surface-3`; Start, Ende und gewählter Tag als invertierte Kachel (`background: var(--text); color: var(--bg); font-weight: 600`); „Heute“ unterstrichen (`text-decoration: underline; text-decoration-thickness: 1.5px; text-underline-offset: 4px; text-decoration-color: var(--muted)`, auf invertierter Kachel `currentColor`); Vorschau-Kachel `--surface-3` mit Ring `inset 0 0 0 1.5px var(--muted)`. Reiter-Unterstrich `--text`. Sprach-Chip `--text-2` mit Ring `--border-2`. Eingeschaltete Regelkarte im Schatten-Ich: `--surface-2` mit Rand `--border-2`. Zähler im Filter-Knopf: neutral.
3. **Grün bleibt nur für:** Gewinnzahlen, „Trade loggen“, eingeschaltete Schalter, den Balken am aktiven Seitenleisten-Eintrag, Hinweis-Punkte, den Ring-Bogen im Fortschritt (nur bei Wert > 0).
4. **Unter-Navigation der Einstellungen:** gewählter Eintrag `background: var(--surface); border: 1px solid var(--border)` (hell: Weiß mit Rand auf `#f5f7f5`, dunkel: `#1a1917` auf `#0e0d0b`), Hover `color-mix(in srgb, var(--text) 5%, transparent)`, Gewicht 500.
5. **Reiter und Unterreiter** (`.set-tabs`, `.prop-sub`) sind Steuerelemente: Gewicht 500.
6. **Einzelwahl-Menüs zeigen immer die aktuelle Wahl.** Konto-Menü: „Alle Konten“ ist gewählt, wenn `accountId` leer oder `'all'` ist; bei nur einem Konto ist dieses Konto gewählt. Die Optik kommt aus komponenten-2.
7. **Design-Einstellungen:** Ist keine eigene Farbe gesetzt, gilt die Standard-Vorlage (dunkle Werte aus `PRESETS_ACCENT`/`PRESETS_PAIR`) als gewählt, auch im hellen Design.
8. **Hover nur auf Bedienbarem.** Knöpfe, Links, Kalendertage, klickbare Zeilen und Wahlkarten reagieren. Kacheln (`.tile`, `.stat-tile`) und Karten (`.card`) ändern beim Darüberfahren nichts (kein Anheben, kein Schatten, kein Randwechsel). Nur das Info-Symbol erscheint (app.css:497).

### Z4 Deaktiviert

1. Token `--disabled-o: .4`. Jeder deaktivierte Knopf und Menüeintrag: `opacity: var(--disabled-o); cursor: not-allowed`. Kalendertage außerhalb des wählbaren Bereichs: dieselbe Deckkraft, `cursor: default`.
2. Deaktiviert reagiert nicht: kein Hover, kein Anheben um 1 px, kein Klick-Schrumpf.
3. Ein deaktivierter Hauptknopf (`.btn.primary`) ist neutral, nicht trüb grün.
4. Ausnahme: Die Seitenpfeile im TradeLog (`.pager .pg-nav button:disabled`, nur Farbe `--faint`) bleiben, weil sie in einer gemeinsamen Knopfgruppe stehen.

### Z5 Laden

1. **App-Start:** Skelett in den Maßen der fertigen Seite (Kopfreihe 46 px, Kacheln 131 px, Karten 396 px; Seitenleiste mit Marke, Untertitel, Trennlinie, vier Gruppen im 42-px-Raster und Konto-Karte). Hell-Design und eingeklappte Leiste stehen schon im Skelett. Theme und `sb-mini` werden im `<head>` gesetzt, bevor etwas gezeichnet wird.
2. **Bereiche, die Daten nachladen** (News, Coach), zeigen ein Skelett aus `.skel` in der Form des Inhalts. Kein Ring, keine Kurslinie, kein „wird geladen“-Satz als einziger Inhalt.
3. `U.spin()` nur **in Knöpfen neben Text** („Wird erstellt …“). `U.loader()` nur für Sprachnotizen und die kleine Hintergrund-Anzeige im Coach-Fuß, dort immer mit sichtbarem Text „Wird geladen …“ daneben.
4. Bei „Bewegung reduzieren“ läuft nichts (README Z. 342). Keine toten Regeln (`.spin { animation-duration: 2.4s }` entfällt).
5. Statustexte („Wird abgeglichen …“) verschwinden, sobald der Vorgang endet.
6. Ladetext-Form „Wird <Partizip> …“ mit Leerzeichen vor „…“ („Wird gespeichert …“). Speicherstand im Notebook in `--muted` 12 px, nie Gelb.

### Z6 Fehler

1. **Eingabefehler beim Absenden eines Formulars stehen am Feld.** Das `.field` bekommt `.invalid` (Rand `--loss` an `.input`, `.select`, `.sym-btn`, `.dir-switch`), das Element `aria-invalid="true"` und `aria-describedby="<id>-err"`, darunter steht `<div class="field-err" id="<id>-err">` (12 px, `--loss`, Abstand über `.field { gap: 6px }`). Alle Fehler erscheinen auf einmal, der Fokus springt aufs erste Feld. Keine Browser-Blase, kein Toast. Der Fehler verschwindet bei der nächsten Eingabe im Feld (input/change) bzw. bei Symbolwahl und Richtungswahl.
2. **Texte am Feld:** Symbol „Symbol wählen“, Richtung „Long oder Short wählen“, Einstieg „Einstieg eintragen“, Kontrakte „Kontrakte eintragen“, Eröffnet „Datum eintragen“, Ausstieg bei gesetztem „Geschlossen“ „Ausstieg eintragen oder Geschlossen leeren“. Native Prüfung aller übrigen Formulare: „Pflichtfeld“, „Mindestens {0}“, „Höchstens {0}“, „Gültige E-Mail-Adresse eintragen“, sonst „Ungültiger Wert“. Nie `validationMessage` (Browsersprache).
3. **Nur das Trade-Formular** bekommt `novalidate` (eigene Prüfung). Alle anderen Formulare behalten `required`, `min`, `max`; ein globaler `invalid`-Listener unterdrückt die Blase und zeigt die Feldfehler. Ohne `.field`-Hülle: nur roter Rand, `aria-invalid` und Fokus.
4. **Systemfehler** (Server, Netz) in Warn-Optik: `background: var(--warn-soft); border: 1px solid var(--warn); color: var(--text)`. Über sichtbaren Inhalten als Banner (`U.banner('warn', …)`), ohne Daten als Seiten-Leerzustand mit Symbol `warning`, im Mentor als Fehlerzeile `.mentor-err`. **Rot** steht für Verlust und Eingabefehler, nicht für Server.
5. **Einheitlicher Wortlaut:** offline „Der Server ist nicht erreichbar. Prüf die Adresse unter Einstellungen → Mentor und deine Verbindung.“; HTTP ohne eigene Meldung „Der Server antwortet mit Fehler {0}.“; Knopf „Erneut versuchen“ als `.btn.sm` mit Symbol `refresh`, im Banner im `trailing`-Platz (wie dashboard.js:129), nie `.btn.xs` im Fließtext.
6. **Keine Sackgasse:** Ein Fehler-Leerzustand nennt den Grund und bietet einen Weg (z. B. „Ungültiges Datum“ → „Zum heutigen Tag“).

### Z7 Toasts

1. Toasts melden **Ergebnisse** (gespeichert, gelöscht, kopiert, fehlgeschlagen), keine Formularfehler.
2. Ein Container `.toast-wrap` mit `role="status" aria-live="polite"`, **angelegt beim Start** (vor dem ersten Toast). Kein zweiter Container, kein `role="alert"` am einzelnen Toast, kein Symbol (der Text trägt den Zustand).
3. Dauer: `Math.min(7000, Math.max(kind === 'err' ? 4500 : 2400, 1200 + String(msg).length * 55))` ms. Darüberfahren hält an (`.toast { pointer-events: auto }`, die Fläche daneben bleibt klickbar), Verlassen startet 1500 ms neu.

### Z8 Löschen, Verwerfen, Zurücksetzen

1. Jede Aktion, die Daten **endgültig löscht**, fragt vorher mit `U.confirmModal`: Titel „<Objekt> löschen?“, Satz nennt, was verloren geht, OK-Knopf „Löschen“ (`danger: true`). Gilt für Trade (besteht), Konto und Tag (bestehen), Regel, verpassten Trade, Screenshot, Screenshot vor Entry, Sprachnotiz, Check-in.
2. Verlassen eines laufenden Ablaufs mit Eingaben (Ruhepunkt ab Schritt 2) fragt: „Session verwerfen?“ / „Deine Eingaben aus dieser Session gehen verloren.“ / OK „Verwerfen“ (danger). Der OK-Knopf heißt nie „Abbrechen“ (der Abbruch-Knopf von `confirmModal` heißt fest so, ui.js:447).
3. „Auf Standard zurücksetzen“ ist ein `.btn.ghost.sm` in `--muted` unter dem betroffenen Inhalt, nie in einer Filterleiste (Muster `be-reset`, misc.js:196).
4. Wörter: **Löschen** = Daten weg (immer mit Rückfrage), **Entfernen** = aus einer Ansicht nehmen.

### Z9 Speichern

1. **Eine Speicherart pro Formular.** Einstellungen → Trading speichert jede Änderung sofort (`change`), ohne Knopf „Speichern“; rechts im Kopf erscheint 2 s lang „Gespeichert“ (12 px, `--muted`, `aria-live="polite"`). Ungültige Werte (außerhalb `min`/`max`) werden nicht übernommen und am Feld gemeldet. Profil, Mentor und Notebook behalten „Speichern“ (Textfelder, Verbindungstest, Vorschau).
2. **Schalter und Segmente in Formular-Bereichen speichern sofort und bauen die Seite nicht neu auf.** Getippte, noch nicht gespeicherte Eingaben bleiben stehen. Ändert ein Schalter Rechenregeln (Break-even), wird die Regel sofort gesetzt (`C.setBreakEven`).
3. Coach → Benachrichtigungen: Der E-Mail-Schalter speichert sofort wie der Browser-Schalter. Ohne Adresse springt er nicht um, es kommt der Toast „Trage zuerst eine E-Mail-Adresse ein“ (err) und der Fokus geht ins Feld. Der Formularknopf heißt „Adresse speichern“.

### Z10 Randfälle der Logik (verbindliches Verhalten)

| Stelle | Zielverhalten |
|---|---|
| Prop-Karte, Konto mit verletzter Regel | Ampel **Rot**, Tooltip „Ampel Rot · Regel verletzt“. Wie Widget (widgets.js:358) und Seitenleisten-Punkt. |
| Prop-Karte, Konto verletzt oder geplatzt | Keine Puffer-Balken, kein Ziel, keine Meta-Zeile (Bestehen/Payout, Puffer). Kopf, Banner/Status-Pille, Kontostand, P&L und Fußknöpfe bleiben. |
| Prop-Balken, Rest größer als Limit (statischer DD im Plus, Trailing mit Lock, Daily Loss an Gewinntag) | Nur der Rest, kein „von …“; bei gesperrtem Boden (`x.locked`) dahinter `<span class="muted">· Boden fest</span>`. Balken voll, Farbe wie bisher. Ampel-Tooltip-Anteil gekappt auf 100 %. |
| Prop-Bilanz ohne Ausgaben | „Bis Break-even“ = „—“ mit Fuß „noch keine Ausgaben“; „Kosten je Bestehen“ = „—“. Ohne Ausgaben **und** Payouts kein Diagramm und keine Karte „Pro Firma“. Legende nur bei Datenpunkten. |
| `#/prop/payout` | Öffnet die Bilanz mit offenem Planer, schreibt die Adresse einmalig auf `#/prop/bilanz` um und scrollt den Planer unter die Titelzeile (16 px Luft). |
| Friedhof mit einem Grabstein | Keine Karte „Muster“. Der Hinweis steht als Info (i) an der Kachel „Häufigste Regel“. |
| Ø Tages-Gewinn/Verlust, Tages-Profit-Faktor | Nur Verlusttage → 0; keine Gewinn- und keine Verlusttage → 0; nur Gewinntage → ∞. |
| Zertifikat aus Dashboard/Statistik | Standardtag = letzter Tag mit abgeschlossenem Trade ≤ heute (nach `t.dayKey`), ohne Trades heute. Woche und Monat folgen diesem Tag. Das Menü schließt sich, bevor der Dialog öffnet. |
| TradeLog-Kacheln | Folgen im Reiter „Trades“ Suche und Filter (dieselbe Menge wie die Liste). In „Tage“ und „Verpasste Trades“ ungefiltert. Zähler „{n} abgeschlossen“. |
| TradeLog-Seitenwähler | Bei einer Seite nur „Trades pro Seite“ und „{n} Trades“. Bei mehreren Seiten wie bisher. Oben rechts „{x} von {y} Trades“ nur bei aktivem Filter. |
| Zeitzone im Profil | Steht die Browser-Zeitzone nicht in der Liste, wird sie als erste Option ergänzt und gewählt; „UTC“ ist immer in der Liste. Nie stillschweigend „Africa/Abidjan“. |
| Avatar oben und Konto-Karte | Gleiche Initialen aus einer Quelle (`App.userInfo()`). |
| Notebook, Standardordner | Kein „Farbe ändern“. In Verschieben-Menüs Standardordner mit ihrem Symbol, eigene Ordner mit Farbquadrat (wie links). |
| Notebook-Überschriften | Die Größen aus Einstellungen → Notebook wirken im Editor (h1/h2/h3). |
| Checklisten (Fortschritt, Tag, Check-in, Session-Ende) | Erledigt = gefüllter Haken + Text in `--text-2`, **ohne Durchstreichen**. Notebook-To-dos und Coach-Aufgaben behalten das Durchstreichen. |
| Trendpfeil im Fortschritt | Nur bei echtem Vergleich mit dem Vorzeitraum, Tooltip „Vorzeitraum: {0}“. Kein Pfeil aus festen Schwellen, keiner bei „Heutiger Fortschritt“. |
| Ring „% Regeln eingehalten“ | Bei Wert null oder 0 nur die Spur, kein Bogen (keine runde Kappe als grüner Punkt). |
| Tagesnotiz-Vorschau | Überschriften (`header` im Delta) als eigene Zeile in 600 `--text`, gleiche Schriftgröße wie der Text, 8 px Abstand davor. |
| Mentor ohne Server | Kopfreihe leer (kein Konto, kein Hinweis). Mit Server wie README Z. 144. |
| Coach, Gruppe ohne Schüler | Kein Umschalter Woche/Monat/Gesamt und kein „Kurz-Stats nur in R und Prozent“, solange die geladene Schülerliste leer ist (während des Ladens bleibt der Umschalter). |

### Z11 Text-Glossar (vorher → nachher)

| Stelle | vorher | nachher |
|---|---|---|
| Kachelwert leer (widgets.js:31, trades.js:26) | „Noch keine Daten“ | „—“ (+ `.vh` „Noch keine Daten“) |
| Dashboard-Karte leer (widgets.js:32) | „Noch keine Daten · Logge Trades oder ändere den Zeitraum.“ | „Noch keine Trades“ / „Keine Trades passen zum Filter“ / „Keine abgeschlossenen Trades im Zeitraum“ |
| Letzte Trades leer (widgets.js:256) | „Noch keine Daten“ | „Noch keine Trades“ / „Keine Trades passen zum Filter“ / „Noch keine abgeschlossenen Trades“ |
| Statistik Tage/Setups/Zeit/Fehler (stats.js:29/37/42/48) | Titel ohne Satz, teils „Keine Trades im Zeitraum“ | siehe Z1-Glossar, Satz „Ändere den Zeitraum oder logge Trades.“ |
| TradeLog leeres Journal (trades.js:45) | „Keine Trades im Zeitraum · Logge einen Trade oder importiere eine CSV-Datei.“ | „Noch keine Trades · Logge deinen ersten Trade oder importiere eine CSV-Datei.“ |
| TradeLog Zeitraum leer (trades.js:45) | „Keine Trades im Zeitraum · Logge einen Trade oder …“ | „Keine Trades im Zeitraum · Ändere den Zeitraum oder logge Trades.“ |
| Fortschritt Hero (progress.js:68) | „Keine Daten“ | „0 %“ (muted) |
| Fortschritt Regeltreue ohne Daten (progress.js:69) | „0 %“ | „—“ (muted) |
| Fortschritt Regeln leer (progress.js:77) | Leerzustand „Keine Regeln definiert“ + Knopf | `.dashed` „Noch keine Regeln angelegt.“; Kopf-Knopf „Regeln anlegen“ (ohne Regeln) / „Regeln bearbeiten“ |
| Fortschritt Wochen leer (progress.js:78) | „Noch keine Wochen“ mitten in 200 px | `.dashed` „Noch keine abgeschlossenen Trades.“ |
| Validierung Trade (app.js:476) | Toasts „Symbol fehlt“, „Einstiegskurs fehlt“, „Ausstiegskurs fehlt für geschlossenen Trade“ | Feldmeldungen aus Z6.2 |
| Notebook-Speicherstand (notebook.js:100) | „Speichert…“ (gelb) | „Wird gespeichert …“ (muted) |
| News-Countdown (news.js:50) | „jetzt“, „in 3 Std.“, „morgen“, „in 2 Tagen“ | „Jetzt“, „In 3 Std.“, „Morgen“, „In 2 Tagen“ |
| Mentor offline (mentor.js:17) | „Der Mentor-Server ist nicht erreichbar …“ | Offline-Satz aus Z6.5 |
| News offline (news.js:28) | „… unter Einstellungen → Mentor.“ | Offline-Satz aus Z6.5 (mit „und deine Verbindung“) |
| Coach/Mentor-Health HTTP (js/coach.js:43, mentor.js:127) | „Server antwortet mit 500“ | „Der Server antwortet mit Fehler 500.“ |
| Tags (misc.js:238/354) | Knopf „Zurücksetzen“ in der Filterleiste; Dialog „Tags zurücksetzen“ / OK „Zurücksetzen“ | Knopf „Tags auf Standard zurücksetzen“ unter der Tabelle; Dialog „Tags auf Standard zurücksetzen?“ / OK „Auf Standard zurücksetzen“ |
| Check-in-Dialog (app.js:524) | Knopf „Entfernen“ | „Löschen“ (mit Rückfrage „Check-in löschen?“) |
| Coach-Mail (coach.js:77, 367) | „Speichern“; „Bitte eine E-Mail-Adresse eintragen“ | „Adresse speichern“; „Trage zuerst eine E-Mail-Adresse ein“ |
| Coach leere Gruppe (coach.js:112) | „Schick den Einladungslink. Wer beitritt, …“ | „Schick den Einladungslink oben an deine Schüler. Wer beitritt, erscheint hier mit Kurz-Stats.“ |
| Tagesansicht ungültige Adresse (day.js:9) | „Ungültiges Datum“ ohne Satz | + „Die Adresse enthält kein gültiges Datum.“ + Knopf „Zum heutigen Tag“ |
| TradeLog-Kachel Zähler (trades.js:26) | „{n} Trades“ (nur abgeschlossene) | „{n} abgeschlossen“ |
| Coach-Fuß beim Laden (coach.js:58) | Kurslinie ohne Text | Kurslinie + „Wird geladen …“ |

Alle neuen oder geänderten Texte kommen in `web/js/lang/{en,es,hi,pt,zh}.js` (deutscher Text als Schlüssel, `{0}` für Zahlen und Namen). Englische Fassungen stehen in Schritt S-L.

---

## 2. Konflikte und Entscheidungen

**K1 Leerzustand im Dashboard (wording-46, bereich_dashboard-13, ki_look-15, zustaende-6).** wording-46 will den Hinweis „Logge Trades oder ändere den Zeitraum.“ bei vorhandenen Trades behalten, bereich_dashboard-13 will gar keinen Hinweis und „Keine Trades im Zeitraum“, ki_look-15 will Karten ganz ohne Text. *Entscheidung:* Dashboard-Karten zeigen nur einen Titel nach Lage (leeres Journal / Filter / Zeitraum), keinen Satz. Seiten-Leerzustände (Statistik, TradeLog) tragen den Satz. *Grund:* Im Dashboard stehen bis zu acht Karten nebeneinander, ein Satz wiederholt sich dann achtmal. Zeitraum, Filter und das Willkommen-Banner stehen direkt darüber. Völlig leere Karten wirken wie ein Ladefehler. Statt „im Zeitraum“ heißt es „Keine abgeschlossenen Trades im Zeitraum“, weil die Widgets über abgeschlossene Trades rechnen (`d.empty`). In „Letzte Trades“ fehlt der Zeitraum ganz (`d.all`), dort „Noch keine abgeschlossenen Trades“.

**K2 Leerer Kachelwert (wording-47 ↔ bereich_dashboard-13).** wording-47 (Fakten-Fassung) ändert `.tile .nodata` global. Das bläht die Textmeldungen „Keine Regel aktiv“, „Noch keine Runde“, „Kein aktives Konto“ (widgets.js:324–328) auf Wertgröße. bereich_dashboard-13 nutzt `span.muted` + `.vh` und verliert die Klasse `.nodata`. *Entscheidung:* neue Variante `.nodata.dash` mit `aria-hidden`-Strich und `.vh`-Text. `.tile .nodata` bleibt für Textmeldungen. Gewicht 500 statt 700, weil ein Strich kein Wert ist. `aria-label` an einem `span` ohne Rolle wird nicht verlässlich vorgelesen, darum `.vh`.

**K3 Bedingung „leeres Journal“.** wording-46 nutzt `S.data.trades` (alle Konten), das Banner nutzt `rawAll` (gewähltes Konto). *Entscheidung:* überall `App.allTrades()` bzw. `rawAll`. Das Dashboard reicht `raw` und `filtered` im ctx an die Widgets.

**K4 Diagramm-Leerzustand (diagramme-38).** Vier Varianten werden zu einer Komponente `U.chartEmpty`. Abweichend von der Fakten-Fassung bleiben `spark` (ui.js:316, steckt in Tabellenzeilen und Notizen) und `equity` mit einem einzigen Punkt (ui.js:290) leer. Ein Satz in jeder Trade-Zeile wäre Rauschen, und ein Punkt ist nicht „keine Daten“.

**K5 Rollierender Edge (diagramme-38 ↔ bereich_statistik-24).** diagramme-38 will eine 120 px hohe Leerfläche, bereich_statistik-24 eine Textzeile ohne Diagramm. *Entscheidung:* bereich_statistik-24. Die Kachel „Urteil“ sagt die Bedingung schon, die Karte behält ihre Unterzeile (Standardabweichung, Standardfehler). Bedingung `e.rolling.length` (core.js:224), nicht das Urteil.

**K6 Fortschritt-Hero (bereich_training-6, wording-42, zustaende-10, ki_look-7, diagramme-27, typografie-15, zustaende-11).** Sieben Befunde zu zwei Zeilen. *Entscheidung:* „Heutiger Fortschritt“ zeigt immer `{pct} %`, bei 0 in `.muted`. „% Regeln eingehalten“ ohne Daten „—“ in `.muted`. Kein Pfeil ohne Vergleich (diagramme-27). Kein Bogen bei 0 (zustaende-11). Geviertstrich „—“, nicht „–“.

**K7 Regel-Karte im Fortschritt (bereich_training-19 ↔ zustaende-13).** Fakten-Fassung: `.dashed` mit Link „Regeln anlegen“; zustaende-13: Kopf-Knopf heißt ohne Regeln „Regeln anlegen“. Beides zusammen wäre wieder doppelt. *Entscheidung:* `.dashed` ohne Link, ein Knopf im Kartenkopf mit wechselnder Beschriftung.

**K8 Formularprüfung (zustaende-3, barrierefreiheit-6, komponenten-4, bereich_trades_tag-6).** Die Fakten-Fassung setzt `novalidate` an alle Formulare. Dann entfiele die Prüfung von `required`, `min`, `max` in Prop-, Coach-, Konto- und Tag-Dialogen. *Entscheidung:* nur das Trade-Formular `novalidate` mit eigener Prüfung. Alle anderen behalten die native Prüfung, ein globaler `invalid`-Listener ersetzt die Blase durch Feldmeldungen. Die Fußzeilen-Vorschau „2 Angaben fehlen“ (komponenten-4) entfällt, README Z. 44 legt „Long oder Short wählen“ als Vorschau fest. Kein `role="status"` an `#trade-preview` (würde jeden Tastendruck ansagen). „Verpassten Trade notieren“ (trades.js:110) läuft über den globalen Listener. Die Pflichtfelder Datum und Symbol sind dort native `required`.

**K9 Fehlerfarbe.** Feldfehler `--loss` (wie `.dir-switch.need`, app.css:860). Systemfehler in Warn-Optik. `.mentor-err` wechselt von Rot auf Warn, damit Server-Fehler in Coach, News und Mentor gleich aussehen (zustaende-18, Fakten-Teil 4). Die übrigen Fakten-Teile von zustaende-18 (gemeinsames `errorState` mit festem Titel, `Co.OFFLINE`, Statuscode nur in der Konsole, Erneut-Knopf in `.mentor-err`) sind abgelehnt, siehe Abschnitt 5.

**K10 Toasts (zustaende-19 ↔ barrierefreiheit-20).** Feste 4000/6000 ms gegen Längenformel; ein gegen zwei Container; mit oder ohne Symbol. *Entscheidung:* ein Container, beim Start angelegt (sonst geht die erste Ansage verloren), Längenformel aus zustaende-19 (kurze Meldungen bleiben ruhig 2,4 s, lange bis 7 s), Anhalten beim Darüberfahren, kein Symbol. Ein zweiter fester Container läge an derselben Stelle und überdeckte den ersten. `motiontest.js:49` (Toast „Hallo“ nach 2500 ms aus) bleibt gültig.

**K11 Coach lädt (zustaende-17 ↔ bewegung-13).** bewegung-13 will an coach.js:28 Kurslinie + Text, zustaende-17 ein Skelett. *Entscheidung:* Skelett (BRIEF: „Ladesymbol statt Skelett“ abgelehnt; README Z. 340). Von bewegung-13 bleiben: tote Regel app.css:1559 löschen, Text neben der kleinen Kurslinie im Coach-Fuß (coach.js:58).

**K12 News-Countdown (bereich_notebook_news-40 ↔ zustaende-40).** news-40 zeigt ab 6 h „Heute, 14:30“ / „Morgen, 14:30“; zustaende-40 (Vorgaben-Fassung) hält den Stunden-Countdown unter 24 h (README Z. 114 „mit Countdown“); zustaende-40 (Fakten-Fassung) rechnet zuerst Kalendertage. *Entscheidung:* Kalendertage sind maßgeblich (beide Rechenfehler weg), unter 6 h immer relativ (auch über Mitternacht, newstest bleibt um 22–24 Uhr gültig), sonst am selben Tag Stunden, dann „Morgen“ und „In N Tagen“. Alles groß. Die kleine Zeile mit Datum und Uhrzeit bleibt immer: Bei „Morgen“ oder „In 3 Tagen“ ist sie die einzige Uhrzeit.

**K13 Dauerformate (zustaende-39).** Die Fakten-Fassung will den News-Countdown auf `fmt.dur` umstellen. *Entscheidung:* nein (Vorgaben-Prüfung). Der Countdown ist ein Satz mit eigenen Übersetzungsmustern. Regel Z2.7/Z2.8: Messwert = `fmt.dur`, Countdown = Satzform. „T“ bleibt (deutsch üblich), neues Muster `{0} T` → en `{0} d`.

**K14 Prop-Balken (wording-30 ↔ bereich_prop-6).** Vorgeschlagen sind eine eigene `compact`-Regel in `bar()` (ab 10.000 oder immer), ein Label „Abstand zum Boden“ und „· Limit …“. *Entscheidung:* keine eigene Stellenregel. Mit zustaende-23 haben beide Beträge ohnehin zwei Stellen. Das Label bleibt „{lbl} übrig“ (gilt auch für Daily Loss). Bei Rest > Limit entfällt „von …“, „· Boden fest“ nur bei `x.locked`. Ampel-Tooltip gekappt.

**K15 Zertifikat-Standardtag (bereich_dashboard-30).** Fakten-Fassung lokal in dashboard.js, Vorgaben-Fassung zentral in `menuHTML`. *Entscheidung:* zentral. Davon profitiert auch das Menü der Statistik, und es zählt dieselbe Trade-Menge wie der Dialog (`App.allTrades()`).

**K16 Coach-Abgleich (bereich_konto-14).** Vorgaben-Fassung `.then` in `sync()`, Fakten-Fassung im `finally` von `runSync`. *Entscheidung:* `finally`. Ein einziges Neuzeichnen nach `syncing = false`, auch nach Fehlern. Der bisherige Aufruf im `try` zeichnete noch mit „Wird abgeglichen …“.

**K17 Tags zurücksetzen (bereich_einstellungen-38).** „Standard-Tags wiederherstellen“ gegen „Tags auf Standard zurücksetzen“. *Entscheidung:* „Tags auf Standard zurücksetzen“. Das folgt dem bestehenden Muster „Auf Standard zurücksetzen“ (misc.js:196, 221), und „Wiederherstellen“ heißt im Notebook-Papierkorb schon „zurückholen“.

**K18 Speicherart in den Einstellungen (komponenten-5 ↔ bereich_einstellungen-1).** Vorgaben-Fassung: Trading und Notebook speichern sofort, Privatsphäre wird Schalter. Fakten-Fassung: nur Trading. *Entscheidung:* nur Trading. Notebook ist in sich einheitlich (Vorschau, dann Speichern), Privatsphäre auch (Wortlaut regelt wording-17). bereich_einstellungen-1 (kein `rerender` in Schaltern) ist zusätzlich nötig, weil Profil und Mentor ihr „Speichern“ behalten.

**K19 Klasse für den aktiven Filter-Knopf (bereich_dashboard-6).** Vorgeschlagen ist `.btn.on`. `widgets.js:223` nutzt aber schon `btn primary sm on` („Kennzahl hinzufügen“ im Report-Widget). *Entscheidung:* `.btn.is-on`, kollisionsfrei.

**K20 „Heute“ im Kalender (farbe_kontrast-23).** Ring (Fakten) gegen Unterstreichung (Vorgaben). *Entscheidung:* Unterstreichung. In `.rr-day` liegt das Band als `::before` über einem inneren Schatten und würde einen Ring seitlich verdecken. Dieselbe Markierung im Datumswähler und im Notebook-Kalender.

**K21 Deaktiviert: Pager und Ruhepunkt (zustaende-35, komponenten-42).** Die Fakten-Fassung nimmt den Pager in die Deckkraft-Regel auf und lässt den Ruhepunkt aus. *Entscheidung:* Pager bleibt nur farblich (gemeinsame Knopfgruppe würde fleckig), Ruhepunkt (`.rp-btn`, `.rp-chip-sm`) bekommt das Token, damit es nur noch eine Deckkraft gibt.

**K22 Kachel-Hover (zustaende-34, farbe_kontrast-43, ki_look-9, bewegung-43).** `e2e/motiontest.js` prüft heute „Kachel hebt sich beim Überfahren“. Das Anheben kam pauschal mit Commit 970d7b1 und ist in der README nicht festgehalten. *Entscheidung:* entfernen, Test umkehren. `--lift-shadow` bleibt (landing.css:56). `.cal .d:hover` bleibt (Kalendertage sind klickbar).

**K23 Hover-Farbe der Sprachkarte (farbe_kontrast-25).** Vorschlag `--muted`. *Entscheidung:* `--text-2`, wie `.font-card:hover` (app.css:1933) und `.pair-card:hover` (1949).

**K24 Platzhalter „offen“ im TradeLog (zustaende-24).** Vorgaben-Fassung „offen“ in `.muted`, Fakten-Fassung Strich. *Entscheidung:* Strich in `.faint`, denn die Status-Pille zwei Spalten weiter sagt schon „Offen“. In der CSV-Vorschau (ohne Pille) bleibt das Wort, in `.muted`.

**K25 Check-in „Entfernen“ (bereich_trades_tag-28).** Der Check-in wird gelöscht, nicht aus einer Ansicht genommen. *Entscheidung:* Knopf „Löschen“, Dialog „Check-in löschen?“ (Glossar Z8.4). Texte der Rückfragen: spezifisch (Vorgaben-Fassung), nicht der Einheitssatz der Fakten-Fassung, wie bei „Trade löschen?“.

**K26 README widerspricht BRIEF.** README Z. 77 („Start und Ende als Kachel in der Akzentfarbe“) und Z. 224 („eingeschaltet ist sie leicht getönt“) stammen aus der Zeit vor 0b52757/32116b1 („Auswahl flach“, „Grün nur für Gewinn und Trade loggen“) und widersprechen BRIEF und README Z. 203–208. Keiner der beiden Commits (6d179fa, c7e5494) hält eine ausdrückliche Nutzerentscheidung für Grün fest. *Entscheidung:* BRIEF gilt, die README-Zeilen werden angepasst (S-R). Kein Nutzerfragen-Fall.

**K27 Duplikate, zusammengeführt:** diagramme-5 = bereich_statistik-1 (Klasse `is-none` statt `none`, weil `none` zu allgemein ist); bereich_shell-7 = responsiv-43 (bereits mit Commit `aa9f1c6` behoben: `unmount()` in dashboard.js:138, Suite `e2e/leaktest.js`); barrierefreiheit-6 = zustaende-3; barrierefreiheit-20 = zustaende-19; zustaende-40 = bereich_notebook_news-40; bereich_prop-6 = wording-30 (Balken), plus Tooltip; zustaende-8 und wording-47 sind Teile von bereich_dashboard-13; typografie-15 (Fortschritt-Teil), diagramme-27 (Wert-Teil) und zustaende-11 (Wert-Teil) sind Teile von bereich_training-6; zustaende-13 gehört zu bereich_training-19.

**K28 Bilanz „erreicht“ (typografie-15 ↔ bereich_prop-14).** typografie-15 (Fakten) will „erreicht“ immer durch „0,00 €“ in Grau ersetzen. *Entscheidung:* nein. Mit Ausgaben und gedeckten Kosten ist „erreicht“ ein echter positiver Zustand (Grün erlaubt). Den falschen Fall ohne Ausgaben löst bereich_prop-14 („—“).

---

## 3. Umsetzungsschritte

Reihenfolge: erst app.css (Tokens → Komponenten → Einzelstellen), dann `ui.js` (Formatierung und Bausteine), dann die übrigen Dateien. Jeder Schritt nennt die Befund-ids.

### 3.1 `web/css/app.css`

#### Tokens

**S-C1 Token Deaktiviert** – zustaende-35
In `:root` nach Z. 47 (`--ease: …`) neu: `--disabled-o: .4;` (gilt für alle Designs).

#### Komponenten

**S-C2 Knöpfe: Hover und Deaktiviert** – zustaende-35, komponenten-42
- Z. 272 `.btn:hover {…}` → `.btn:hover:not(:disabled) {…}`
- Z. 273 `.btn:active {…}` → `.btn:active:not(:disabled) {…}`
- Z. 275 `.btn.primary:hover {…}` → `.btn.primary:hover:not(:disabled) {…}`
- Z. 277 `.btn.danger:hover {…}` → `.btn.danger:hover:not(:disabled) {…}`
- Z. 279 `.btn.ghost:hover {…}` → `.btn.ghost:hover:not(:disabled) {…}`
- Z. 286 `.btn:disabled { opacity: .5; cursor: not-allowed; }` → `.btn:disabled, .tpl-menu .item:disabled { opacity: var(--disabled-o); cursor: not-allowed; }` und direkt darunter neu `.btn.primary:disabled { background: var(--surface); border-color: var(--border-2); color: var(--text); box-shadow: none; }`
- Z. 427 `.dp-day:disabled, .dp-month:disabled { opacity: .35; cursor: not-allowed; background: none; }` → `{ opacity: var(--disabled-o); cursor: default; background: none; }`
- Z. 1089 `.nb-toolbar .tb:disabled { opacity: .35; cursor: default; background: none; color: inherit; }` → `{ opacity: var(--disabled-o); cursor: not-allowed; background: none; color: inherit; }`
- Z. 1583 `.w-bar .mv .btn:disabled { opacity: .3; }` löschen.
- Z. 1619 `.sp-item .btn:disabled:not(.added) {…}` löschen (Z. 1618 `.sp-item .btn.added { … opacity: 1 }` bleibt und gewinnt mit 0,3,0).
- Z. 1634 `.tpl-menu .item:disabled { opacity: .5; cursor: default; }` löschen (steckt jetzt in Z. 286).
- Z. 2221 `.rp-btn:disabled { opacity: .6; cursor: default; }` → `{ opacity: var(--disabled-o); cursor: not-allowed; }`
- Z. 2291 `.rp-chip.rp-chip-sm:disabled { opacity: .5; cursor: default; }` → `{ opacity: var(--disabled-o); cursor: not-allowed; }`
- Unverändert: Z. 1752 (Pager), 1019, 1722 (Blind-Replay).

**S-C3 Feldfehler** – zustaende-3, barrierefreiheit-6
Nach Z. 299 (`.field .hint`) neu:
```css
.field.invalid :is(.input, .select, .sym-btn, .dir-switch), .input[aria-invalid="true"], .select[aria-invalid="true"] { border-color: var(--loss); }
:is(.input, .select)[aria-invalid="true"]:focus { border-color: var(--loss); box-shadow: 0 0 0 3px var(--loss-soft); }
.field-err { font-size: 12px; line-height: 1.35; color: var(--loss); }
```

**S-C4 Leerzustände** – bereich_training-19, diagramme-38, bereich_dashboard-13, wording-47
- Z. 677 `.empty b { color: var(--text); font-size: 15px; }` → `.empty b { color: var(--text); font-size: 15px; font-weight: 600; }`
- Nach Z. 678 neu:
```css
.empty.chart-empty { min-height: 0; padding: 16px; gap: 6px; }
.chart > .empty.chart-empty { height: 100%; }
.chart-empty svg { width: 24px; height: 24px; }
.chart-empty .ce-t { font-size: 13px; font-weight: 500; color: var(--text-2); }
.chart-empty .small { font-size: 12px; color: var(--muted); }
```
- Nach Z. 1447 (`.w-body > .card > .chart`) neu: `.w-body > .card > .empty { flex: 1 1 auto; }` (Leerfläche füllt die Karte, Symbol in allen Karten einer Reihe auf gleicher Höhe; die Inline-`min-height` von `emptyBox` bleibt Untergrenze und schlägt `.empty.chart-empty { min-height: 0 }`).
- Nach Z. 1502 (`.tile .nodata {…}`, bleibt) neu: `.tile .nodata.dash { font-family: inherit; font-size: inherit; font-weight: 500; letter-spacing: inherit; color: var(--muted); }`

**S-C5 Kacheln und Karten ohne Hover** – zustaende-34
- Z. 485 `.card { …; transition: border-color var(--dur-2) var(--ease); }` → `transition: border-color var(--dur-1) var(--ease);`
- Z. 486 `.card:hover { border-color: var(--border-2); }` löschen.
- Z. 515 `.tile { …; transition: border-color var(--dur-2) var(--ease), transform var(--dur-2) var(--ease), box-shadow var(--dur-2) var(--ease); }` → `transition: border-color var(--dur-1) var(--ease);`
- Z. 516 `.tile:hover, .stat-tile:hover { … }` löschen.
- Z. 636 `.stat-tile { …; transition: border-color var(--dur-2) …, transform …, box-shadow … }` → `transition: border-color var(--dur-1) var(--ease);`
- Z. 2603 `.kstrip .tile:hover { … }` löschen (hob nur das Anheben auf; Z. 2602 hat dieselben Linien).
- Unverändert: `--lift-shadow` (Z. 48/59/69, genutzt von landing.css:56), Z. 497 (Info-Symbol), Z. 705 (`.cal .d:hover`).

**S-C6 Toast** – zustaende-19, barrierefreiheit-20
Z. 898 `.toast { … }`: am Ende `pointer-events: auto;` ergänzen. Z. 897 `.toast-wrap` behält `pointer-events: none`.

**S-C7 Gemeinsamer Ausgewählt-Stil und Zähler** – bereich_dashboard-6
- Z. 3123–3126 (Selektorliste vor `{ color: var(--lc, var(--text)); … }`): nach `.sb-user.active` die Klasse `, .btn.is-on` ergänzen.
- Z. 1341 `.btn .cntb { … background: var(--text); color: var(--bg); font-size: 11px; font-weight: 700; }` → `background: color-mix(in srgb, var(--text) 16%, transparent); color: var(--text); font-size: 11px; font-weight: 600;`
- Z. 1421 `.fd-panel .cntb {…}`: dieselbe Änderung.

**S-C8 Zeitraum-Kalender, Datumswähler, Notebook-Kalender ohne Grün** – farbe_kontrast-23 (mit bereich_dashboard-7, komponenten-7)
```css
/* 363 */ .rr-day.today { color: var(--text); font-weight: 600; text-decoration: underline; text-decoration-thickness: 1.5px; text-underline-offset: 4px; text-decoration-color: var(--muted); }
/* neu nach 363 */ .rr-day.start.today, .rr-day.end.today { text-decoration-color: currentColor; }
/* 366 */ … { …; background: var(--surface-3); }            /* statt var(--accent-soft) */
/* 372 */ .rr-day.start::after, .rr-day.end::after { …; background: var(--text); }   /* statt var(--accent) */
/* 373 */ .rr-day.pv-end::after, button.rr-day.in:hover::after { …; background: var(--surface-3); box-shadow: inset 0 0 0 1.5px var(--muted); }
/* 374 */ .rr-day.start, .rr-day.end { color: var(--bg); font-weight: 600; }
/* 423 */ .dp-day.in { background: var(--surface-3); color: var(--text); }
/* 424 */ .dp-day.today { color: var(--text); font-weight: 600; box-shadow: none; text-decoration: underline; text-decoration-thickness: 1.5px; text-underline-offset: 4px; text-decoration-color: var(--muted); }
/* 425 */ .dp-day.edge { box-shadow: inset 0 0 0 1.5px var(--muted); }
/* 426 */ .dp-day.sel { background: var(--text); color: var(--bg); font-weight: 600; box-shadow: none; }
/* neu nach 426 */ .dp-day.sel.today { text-decoration-color: currentColor; }
/* 431 */ .dp-month.today { color: var(--text); box-shadow: none; text-decoration: underline; text-decoration-thickness: 1.5px; text-underline-offset: 4px; text-decoration-color: var(--muted); }
/* 432 */ .dp-month.sel { background: var(--text); color: var(--bg); box-shadow: none; }
/* 436 */ .dp-link.accent { color: var(--text); }
/* 481 */ .dp-t.sel { background: var(--text); color: var(--bg); font-weight: 600; }
/* 1026 */ .datepick .dp.today { box-shadow: none; text-decoration: underline; text-decoration-thickness: 1.5px; text-underline-offset: 4px; text-decoration-color: var(--muted); }
```
Z. 337 (`.popover .item[aria-checked="true"]`) nicht hier, das regelt komponenten-2. Z. 437 (Fokusrahmen) bleibt.

**S-C9 Reiter, Unter-Navigation, Sprachkarte** – farbe_kontrast-4, farbe_kontrast-25
- Z. 1807 `.set-nav a { … }`: `border: 1px solid transparent;` ergänzen.
- Z. 1809 `.set-nav a:hover { background: var(--surface-2); color: var(--text); }` → `{ background: color-mix(in srgb, var(--text) 5%, transparent); color: var(--text); }`
- Z. 1810 `.set-nav a.active { background: var(--surface-2); … }` → `.set-nav a.active { background: var(--surface); border-color: var(--border); color: var(--text); font-weight: 500; }`
- Z. 1867 `.set-tabs button { … font-weight: 600; … }` → `font-weight: 500`
- Z. 1869 `.set-tabs button[aria-pressed="true"] { color: var(--accent); border-bottom-color: var(--accent); }` → `{ color: var(--text); border-bottom-color: var(--text); }`
- Z. 2595 `.prop-sub a { … font-weight: 600; … }` → `font-weight: 500`
- Z. 2597 `.prop-sub a::after { …; background: var(--accent); … }` → `background: var(--text);`
- Z. 1921 `.lang-card:hover { border-color: var(--accent); }` → `{ border-color: var(--text-2); }`
- Z. 1926 `.lang-card[aria-pressed="true"] .lang-cur { color: var(--accent); background: transparent; box-shadow: inset 0 0 0 1px var(--accent); }` → `{ color: var(--text-2); background: transparent; box-shadow: inset 0 0 0 1px var(--border-2); }`

**S-C10 Checkliste ohne Durchstreichen** – zustaende-12
Z. 805 `.checklist .it.done span { color: var(--muted); text-decoration: line-through; }` → `.checklist .it.done span { color: var(--text-2); }`. Z. 1144 und 2928 bleiben.

**S-C11 Regelkarte im Schatten-Ich** – farbe_kontrast-30
- Kommentar Z. 2399 „an = leicht getönt“ → „an = leicht angehoben (Fläche surface-2, Rand border-2), Grün nur im Schalter“.
- Z. 2401 `.shadow-rule { … background: var(--surface-2); … }` → `background: transparent;` (Rand, Abstände, Transition bleiben).
- Z. 2402 → `.shadow-rule.on { border-color: var(--border-2); background: var(--surface-2); }`

**S-C12 Mentor-Fehlerzeile in Warn-Optik** – zustaende-18
Z. 2359 `.mentor-err { …; background: var(--loss-soft); color: var(--loss); … }` → `background: var(--warn-soft); border: 1px solid var(--warn); color: var(--text);`

**S-C13 Laden: Skelette statt Ring/Kurslinie** – zustaende-17, bereich_notebook_news-38, bewegung-13
- Z. 1559 `.spin { animation-duration: 2.4s; }` löschen.
- Z. 2856 `.coach-loading {…}` → `.coach-skel { display: flex; flex-direction: column; gap: 8px; } .coach-skel .skel { height: 40px; border-radius: 10px; }`
- Z. 3108 `.nw-loading {…}` → `.nw-skel { display: flex; flex-direction: column; gap: 14px; } .nw-skel .skel { border-radius: 14px; }`

**S-C14 Speicherstand** – bereich_notebook_news-24, komponenten-5
- Z. 1030 `.nb .save-state { font-size: 11.5px; … }` → `font-size: 12px`
- Z. 1031 `.nb .save-state.saving { color: var(--warn); }` löschen.
- Nach Z. 1816 neu: `.set-head .save-state { font-size: 12px; color: var(--muted); align-self: center; min-height: 1em; }`

#### Einzelstellen

**S-C15 Zustand-Spalten** – bereich_statistik-1, diagramme-5
Z. 2969 `.stc-col.empty > b { color: var(--faint); }` → `.stc-col.is-none > b { color: var(--faint); }`

**S-C16 Notizliste: Verlust wieder rot** – farbe_kontrast-29 (mit bereich_notebook_news-4)
- Z. 783 `.note-item span {…}` löschen (falls der ganze Block 779–788 schon durch bereich_notebook_news-36 weg ist, entfällt dieser Teil).
- Nach Z. 1003 neu: `.nb .note-item .tr b { font-size: 12px; font-weight: 600; }`

**S-C17 Notebook-Überschriften** – typografie-22
- Z. 1904–1906: Selektoren `.ql-editor h1|h2|h3` → `.ql-snow .ql-editor h1`, `.ql-snow .ql-editor h2`, `.ql-snow .ql-editor h3` (Werte `var(--nb-h1, 30px)` usw. bleiben).
- Z. 1133–1135: jeweils `font-size: …em;` entfernen (Rest bleibt).

**S-C18 Tagesnotiz-Vorschau** – bereich_trades_tag-48
Nach den Tagesansicht-/Notebook-Regeln (z. B. nach Z. 1144) neu: `.nv > div { margin: 0; } .nv-h { font-weight: 600; color: var(--text); margin-top: 8px; } .nv-h:first-child { margin-top: 0; }`

**S-C19 Start-Skelett, Desktop** – bereich_shell-4 (zusammen mit bereich_shell-3; danach bereich_shell-5 aus Spec Responsiv)
Z. 1541 (`.boot-head`), 1542 (`.boot-head .skel`), 1545 (`.boot-tiles .skel`), 1547 (`.boot-main .skel`) ändern, 1548–1552 (`.boot-sb …`) ersetzen; 1543 (`.boot-head .skel.tl`) und die Media-Queries 1553–1554 bleiben (bereich_shell-5 passt 1554 an). Zielregeln:
```css
.boot-head { display: flex; justify-content: flex-end; align-items: center; gap: 8px; min-height: 46px; }
.boot-head .skel { border: 0; border-radius: 9px; height: 42px; width: 40px; }
.boot-tiles .skel { height: 131px; }
.boot-main .skel { height: 396px; }
.boot-sb { display: flex; flex-direction: column; gap: 0; padding: 4px 16px 0; height: 100%; }
.boot-sb .skel { border: 0; border-radius: 6px; height: 14px; width: 62%; margin: 12.5px 0 15.5px; } /* 39-px-Zeile + 3 px wie .nav (Z. 164) – Maße gemeinsam mit .nav a pflegen */
.boot-sb .skel.l { height: 19px; width: 54%; margin: 0 0 4px; }
.boot-sb .skel.l2 { height: 12px; width: 60%; margin: 0 0 18px; }
.boot-sb .sep { display: block; flex: 0 0 auto; height: 1px; background: var(--border); margin: 0 -8px 14px; }
.boot-sb .skel.g { height: 10px; width: 34%; margin: 33px 0 7px; } /* 24-px-Titelzeile, 26 px Gruppenabstand */
.boot-sb .skel.g.first { margin-top: 7px; }
.boot-sb .skel.card { margin: auto 0 0; height: 59px; width: 100%; border-radius: 14px; }
html.sb-mini .boot-sb { padding: 4px 0 0; align-items: center; }
html.sb-mini .boot-sb .skel { width: 40px; }
html.sb-mini .boot-sb .skel.g { height: 1px; width: 40px; }
html.sb-mini .boot-sb .sep { margin: 0 0 14px; width: 40px; }
html.sb-mini .boot-sb .skel.card { width: 40px; height: 40px; border-radius: 50%; }
```
Die bisherige Regel Z. 1552 `html.sb-mini .boot-sb .skel { width: 24px; }` entfällt. An `.nav a` (Z. 169) den Kommentar „Maße gemeinsam mit .boot-sb pflegen“ setzen.

### 3.2 `web/js/ui.js`

**S-U1 Geldbeträge immer mit zwei Stellen** – zustaende-23 (und Stellenteil von wording-30, bereich_prop-6)
Z. 122 `const a = Math.abs(v); const d = o.compact ? 0 : (a >= 10000 ? 0 : 2);` → `const a = Math.abs(v); const d = o.compact ? 0 : 2;`. Danach Dashboard-Kacheln, TradeLog-Kacheln, Affiliate-KPI-Streifen, Prop-Konto-Karten und Zertifikat (Quadrat und Story) bei 1024 und 390 px prüfen. Läuft ein Wert über, in app.css:533 die Container-Schwelle `@container (max-width: 164px)` → `190px` anheben. Nicht wieder Stellen abschneiden.

**S-U2 Kurse** – zustaende-22 (mit typografie-13)
Z. 142 `minimumFractionDigits: a < 10 ? 4 : a < 1000 ? 2 : 1` → `minimumFractionDigits: a < 10 ? 4 : 2`. `maximumFractionDigits` bleibt `a < 10 ? 5 : 2`.

**S-U3 Dauer mit Sekunden** – zustaende-39
Z. 157 `dur(min)`: direkt nach der null-Prüfung `if (min < 1) return `${Math.round(min * 60)} s`;` einfügen. Rest bleibt („12 min“, „1 h 5 min“, „2 T“).

**S-U4 Karten-/Diagramm-Leerzustand** – diagramme-38
Nach Z. 178 (`const empty = …`) neu:
```js
const chartEmptyHTML = (title = 'Noch keine Daten', hint = '', icon = 'stats') => `<div class="empty chart-empty">${I[icon] || ''}<span class="ce-t">${esc(title)}</span>${hint ? `<span class="small">${esc(hint)}</span>` : ''}</div>`;
const chartEmpty = (el, title, hint) => { el.innerHTML = chartEmptyHTML(title, hint); };
```
`chartEmpty` und `chartEmptyHTML` in `root.UI` (Z. 464) exportieren. Leerzweige der Zeichner:
- Z. 261 (pnl) und Z. 300 (line): `el.innerHTML = `<div class="empty" …>…Keine abgeschlossenen Trades im Zeitraum…`; return;` → `chartEmpty(el, 'Keine abgeschlossenen Trades im Zeitraum'); return;`
- Z. 323 (vbars), Z. 331 (hbars): → `chartEmpty(el); return;`
- Z. 339 (rolling): → `chartEmpty(el, 'Zu wenig Trades', `Mindestens ${e ? e.window : 20} Trades mit R-Wert nötig`); return;` (nur noch Rückfall, siehe S-ST4)
- Z. 347 (mc), Z. 353 (hist): `el.innerHTML = ''; return;` → `chartEmpty(el); return;`
- Z. 358 (weeks): → `chartEmpty(el, 'Noch keine Wochen'); return;` (nur noch Rückfall, siehe S-PR3)
- Z. 290 (equity, < 2 Punkte) und Z. 316 (spark) bleiben leer.

**S-U5 Feldfehler-Helfer** – zustaende-3, barrierefreiheit-6
Bei Modal & Toast (vor Z. 444) neu und in `root.UI` exportieren:
```js
function clearFieldError(el) {
  const f = el.closest('.field'); if (f) { f.classList.remove('invalid'); f.querySelectorAll(':scope > .field-err').forEach(x => x.remove()); }
  if (el.getAttribute('aria-invalid') === 'true') { el.removeAttribute('aria-invalid'); if ((el.getAttribute('aria-describedby') || '').endsWith('-err')) el.removeAttribute('aria-describedby'); }
}
function clearFieldErrors(scope) { scope.querySelectorAll('[aria-invalid="true"]').forEach(clearFieldError); scope.querySelectorAll('.field.invalid').forEach(f => f.classList.remove('invalid')); scope.querySelectorAll('.field-err').forEach(x => x.remove()); }
let errSeq = 0;
function fieldErrors(form, list) {
  clearFieldErrors(form);
  for (const { el, msg } of list) {
    el.setAttribute('aria-invalid', 'true');
    const f = el.closest('.field'); if (!f) continue;
    const id = (el.id || 'fld' + (++errSeq)) + '-err';
    f.classList.add('invalid');
    const m = document.createElement('div'); m.className = 'field-err'; m.id = id; m.textContent = msg; f.appendChild(m);
    el.setAttribute('aria-describedby', id);
  }
  if (list[0]) list[0].el.focus();
}
```

**S-U6 Toast** – zustaende-19, barrierefreiheit-20 (mit bewegung-30)
Z. 444 `function toast(…) {…}` ersetzen:
```js
function toastWrap() { let w = document.querySelector('.toast-wrap'); if (!w) { w = document.createElement('div'); w.className = 'toast-wrap'; w.setAttribute('role', 'status'); w.setAttribute('aria-live', 'polite'); document.body.appendChild(w); } return w; }
function toast(msg, kind = '') {
  const w = toastWrap(); const t = document.createElement('div'); t.className = `toast ${kind}`; t.textContent = msg; w.appendChild(t);
  const ms = Math.min(7000, Math.max(kind === 'err' ? 4500 : 2400, 1200 + String(msg).length * 55)); let tm;
  const leave = () => { const Mo = root.Motion; if (Mo && Mo.enabled) Mo.leave(t, 'out', '--dur-2', () => t.remove()); else t.remove(); };
  const arm = d => { clearTimeout(tm); tm = setTimeout(leave, d); };
  t.addEventListener('mouseenter', () => { clearTimeout(tm); t.classList.remove('out'); });
  t.addEventListener('mouseleave', () => arm(1500));
  arm(ms);
}
toast.init = toastWrap;
```

### 3.3 `web/js/core.js`

**S-K1 Tages-Payoff und Tages-Profit-Faktor** – zustaende-4
- Z. 131 `dayPayoff: lossDays.length && winDays.length ? mean(winDays.map(d => d.pnl)) / -mean(lossDays.map(d => d.pnl)) : null,` → `dayPayoff: lossDays.length ? mean(winDays.map(d => d.pnl)) / -mean(lossDays.map(d => d.pnl)) : (winDays.length ? null : 0),`
- Z. 134 `dayPF: gl < 0 ? gp / -gl : null,` → `dayPF: gl < 0 ? gp / -gl : (gp > 0 ? null : 0),`
- Kein Umbau auf `Infinity` (siehe Abschnitt 5). `ui.js:143`, `stats.js:21`, Score und Widgets bleiben.

### 3.4 `web/js/widgets.js`

**S-W1 Leerlage je Render** – wording-46, bereich_dashboard-13
Nach Z. 9 (`const NO_DATA = …`) neu:
```js
let EMPTY = 'range'; /* 'none' = Konto ohne Trade, 'filter' = Dashboard-Filter ohne Treffer, 'range' = Zeitraum leer; gesetzt in makeData */
const EMPTY_T = { none: 'Noch keine Trades', filter: 'Keine Trades passen zum Filter', range: 'Keine abgeschlossenen Trades im Zeitraum' };
```
In `makeData` (Z. 12) als erste Zeile: `EMPTY = !(ctx.raw || ctx.all || []).length ? 'none' : ctx.filtered ? 'filter' : 'range';`

**S-W2 Kachelwert „—“** – wording-47, bereich_dashboard-13
Z. 31 `const noData = () => `<span class="nodata">${NO_DATA}</span>`;` → `const noData = () => `<span class="nodata dash"><span aria-hidden="true">—</span><span class="vh">${NO_DATA}</span></span>`;`
Z. 324–328 (Textmeldungen „Keine Regel aktiv“ usw. mit `class="nodata"`) bleiben.

**S-W3 emptyBox und chartEmpty** – bereich_dashboard-13, wording-46, diagramme-38
- Z. 32 → `const emptyBox = (h = 220) => `<div class="empty chart-empty" style="min-height:${h}px">${I.stats}<span class="ce-t">${EMPTY_T[EMPTY]}</span></div>`;`
- Z. 44 → `const chartEmpty = el => U.chartEmpty(el);`

**S-W4 Letzte Trades** – zustaende-8, bereich_dashboard-13
- Z. 256 Leerzweig `<div class="empty recent-wrap" style="min-height:160px">${I.tradelog}<b>${tab === 'open' ? 'Keine offenen Positionen' : NO_DATA}</b></div>` → `<div class="empty chart-empty recent-wrap" style="min-height:160px">${I.tradelog}<span class="ce-t">${tab === 'open' ? 'Keine offenen Positionen' : EMPTY === 'none' ? 'Noch keine Trades' : EMPTY === 'filter' ? 'Keine Trades passen zum Filter' : 'Noch keine abgeschlossenen Trades'}</span></div>`
- Z. 257 `…${table}<div class="more-row"><a class="more-link" href="#/trades">Mehr anzeigen</a></div>`` → `…${table}${rows.length ? '<div class="more-row"><a class="more-link" href="#/trades">Mehr anzeigen</a></div>' : ''}``

**S-W5 Regel-Tracker-Link** – zustaende-2
Z. 288 `<a href="#/settings">Regeln in den Einstellungen anlegen</a>` → `<a href="#/settings/regeln">Regeln in den Einstellungen anlegen</a>`

**S-W6 Haltedauer** – zustaende-39
- Z. 38 `durLabel` ersetzen (nur noch Achse):
```js
const durLabel = min => { const sec = Math.round(min * 60); if (sec < 60) return `${sec} s`; if (min < 60) return `${Math.round(min)} min`; const h = min / 60; if (h < 24) return `${fmt.dec(h, h < 10 ? 1 : 0).replace(/[.,]0$/, '')} h`; return `${Math.round(h / 24)} T`; };
```
- Z. 244 Tooltip `${durLabel(t.holdingMin)}` → `${fmt.dur(t.holdingMin)}`

### 3.5 `web/js/screens/dashboard.js`

**S-D1 Leerlage durchreichen** – wording-46, bereich_dashboard-13
Z. 118 `if (fN) ctx = Object.assign({}, ctx, { all: applyFilter(ctx.all, f), inRange: applyFilter(ctx.inRange, f) });` → `if (fN) ctx = Object.assign({}, ctx, { raw: rawAll, filtered: true, all: applyFilter(ctx.all, f), inRange: applyFilter(ctx.inRange, f) });`

**S-D2 Filter-Knopf neutral** – bereich_dashboard-6
Z. 124 `class="btn ${fN ? 'accent' : ''}"` → `class="btn${fN ? ' is-on' : ''}"`.

**S-D3 Zertifikat-Menü** – bereich_dashboard-30
Z. 125 `root.Certificate.menuHTML({ day: todayKey })` → `root.Certificate.menuHTML({})`.

**S-D4 Größen-Listener** – responsiv-43, bereich_shell-7
Bereits erledigt (Commit `aa9f1c6`, dashboard.js:137–138 `unmount()`, App.render ruft es in app.js:78). Keine Änderung. Prüfung in Abschnitt 4.

### 3.6 `web/js/certificate.js`

**S-Z1 Standardtag** – bereich_dashboard-30
Z. 59 `const day = (ctx && ctx.day) || C.dayKey(new Date());` → `const today = C.dayKey(new Date()); const last = C.closedOnly(App.allTrades()).reduce((k, t) => t.dayKey > k && t.dayKey <= today ? t.dayKey : k, ''); const day = (ctx && ctx.day) || last || today;`

**S-Z2 Menü schließen** – bereich_dashboard-30
Z. 115 `'cert-open'(el) { open(el.dataset.kind, el.dataset.ref); }` → `'cert-open'(el) { App.closePopovers(); open(el.dataset.kind, el.dataset.ref); }`

### 3.7 `web/js/app.js`

**S-A1 Start: Toast-Container, Feldfehler** – zustaende-19, barrierefreiheit-20, zustaende-3
In `bind()` (Z. 271) als erste Zeile `U.toast.init();`. Neben dem submit-Listener (nach Z. 284) neu:
```js
let invalidBatch = null;
document.addEventListener('invalid', e => {
  const el = e.target; if (!el.form || el.form.noValidate) return; e.preventDefault();
  const v = el.validity; const num = x => fmt.num(Number(x), 4);
  const msg = v.valueMissing ? 'Pflichtfeld' : v.rangeUnderflow ? `Mindestens ${num(el.min)}` : v.rangeOverflow ? `Höchstens ${num(el.max)}` : v.typeMismatch && el.type === 'email' ? 'Gültige E-Mail-Adresse eintragen' : 'Ungültiger Wert';
  if (!invalidBatch) { invalidBatch = { form: el.form, list: [] }; queueMicrotask(() => { const b = invalidBatch; invalidBatch = null; U.fieldErrors(b.form, b.list); }); }
  invalidBatch.list.push({ el, msg });
}, true);
const clearErr = e => { const el = e.target; if (el && el.getAttribute && el.getAttribute('aria-invalid') === 'true') U.clearFieldError(el); };
document.addEventListener('input', clearErr, true); document.addEventListener('change', clearErr, true);
```

**S-A2 Konto-Menü** – bereich_dashboard-34, zustaende-2
Z. 244:
- „Alle Konten“: `aria-checked="${acc === 'all'}"` → `aria-checked="${!acc || acc === 'all'}"`
- je Konto: `aria-checked="${acc === a.id}"` → `aria-checked="${acc === a.id || ((!acc || acc === 'all') && accounts.length === 1)}"`
- Betrag: `<span class="muted small" style="margin-left:auto">` → `<span class="muted small" style="margin-left:auto" title="Kontogröße">`
- `<a class="item" href="#/settings">${I.settings} Konten verwalten</a>` → `href="#/settings/konten"`
- Haken links: über komponenten-2.

**S-A3 Gemeinsame Namenslogik** – bereich_shell-10
Neue Methode im App-Objekt vor `userCard` (Z. 218):
```js
userInfo() {
  const st = S.settings, pr = st.profile || {};
  const full = [pr.firstName, pr.lastName].map(x => String(x || '').trim()).filter(Boolean).join(' '); const user = String(pr.username || '').trim().replace(/^@/, '');
  const name = full || user || (st.name && st.name !== 'Trader' ? String(st.name).trim() : '') || 'Trader';
  const mail = String(pr.email || '').trim();
  return { name, initials: name.split(/\s+/).map(x => x[0]).join('').slice(0, 2).toUpperCase(), sub: mail || (user ? '@' + user : ''), avatarId: st.avatarId || '' };
},
```
`userCard` (Z. 219–223): `name`, `sub`, `initials` aus `const u = this.userInfo();` beziehen (Rest unverändert). `topbar` Z. 264 `const initials = (S.settings.name || 'T').split(…)…;` → `const initials = this.userInfo().initials;`

**S-A4 Trade-Formular prüfen** – zustaende-3, barrierefreiheit-6
- Z. 348 `<form id="trade-form" class="tf" data-action="save-trade" …>` → `<form id="trade-form" class="tf" data-action="save-trade" novalidate …>`. `required` an f-entry, f-qty, f-open bleibt (Semantik).
- Z. 476 Prüfkette ersetzen durch:
```js
const t = App.readTradeForm(form); const errs = []; const q = s => form.querySelector(s);
if (!t.symbol) errs.push({ el: q('#f-symbol-btn'), msg: 'Symbol wählen' });
if ('direction' in t && !t.direction) { errs.push({ el: q('#f-dir .dir-opt'), msg: 'Long oder Short wählen' }); const sw = q('#f-dir'); if (sw) { sw.classList.remove('need'); void sw.offsetWidth; sw.classList.add('need'); } }
if (t.entryPrice == null) errs.push({ el: q('#f-entry'), msg: 'Einstieg eintragen' });
if (!(Number(form.elements.quantity.value) > 0)) errs.push({ el: q('#f-qty'), msg: 'Kontrakte eintragen' });
if (!form.elements.openedAt.value) errs.push({ el: q('#f-open'), msg: 'Datum eintragen' });
if (t.closedAt && t.exitPrice == null) errs.push({ el: q('#f-exit'), msg: 'Ausstieg eintragen oder Geschlossen leeren' });
if (errs.length) { U.fieldErrors(form, errs); return; }
```
Die Meldung „Long oder Short wählen“ hängt am `.field` der Richtung (`q('#f-dir .dir-opt').closest('.field')`). Die Fußzeilen-Vorschau (Z. 469) und `.dir-switch.need` bleiben. Der Toast „Trade gespeichert“ bleibt.
- Z. 471 `'set-dir'`: am Ende `U.clearFieldError(f.querySelector('#f-dir .dir-opt'));` ergänzen (die Meldung hängt am ersten Richtungsknopf, auch wenn „Short“ geklickt wird).
- Z. 398 (Symbolwahl in `openSymbolMenu`): nach dem Setzen von `#f-symbol` `U.clearFieldError(btn);` ergänzen.

**S-A5 Check-in löschen** – bereich_trades_tag-28
- Z. 524 (Check-in-Dialog) Knopftext `>Entfernen</button>` (an `data-action="delete-checkin"`) → `>Löschen</button>`.
- Z. 551 → `async 'delete-checkin'(el) { if (!await U.confirmModal('Check-in löschen?', 'Die Angaben dieses Check-ins werden gelöscht.', { ok: 'Löschen', danger: true })) return; const d = S.day(el.dataset.day); if (d) { delete d.checkIn; S.save(); } U.closeModal(); App.rerender(); },`

**S-A6 CSV-Vorschau Platzhalter** – zustaende-24
Z. 567: `'<span class="faint">offen</span>'` → `'<span class="muted">offen</span>'`; Ausstieg `: '—'` → `: '<span class="faint">—</span>'`; Netto-P&L `: '—'` → `: '<span class="faint">—</span>'`.

### 3.8 `web/app.html`

**S-H1 Design und Leiste vor dem ersten Zeichnen** – bereich_shell-3
- Z. 23 `<script src="js/theme.js"></script>` (Ende von body) entfernen.
- Nach Z. 15 (`<link rel="stylesheet" href="css/app.css">`) einfügen:
```html
<script src="js/theme.js"></script>
<script>(function () { try { var raw = localStorage.getItem('trading-journal-web-v1'); var s = raw ? (JSON.parse(raw).settings || {}) : {}; Theme.apply(s); if (s.sidebarMini && matchMedia('(min-width: 961px)').matches) document.documentElement.classList.add('sb-mini'); } catch (e) { } })();</script>
```
(ein Parsen; `Theme.apply(Store.settings)` in Z. 89 und app.js:209 bleiben).

**S-H2 Skelett der Seitenleiste** – bereich_shell-4
Z. 19, Inhalt von `.boot-sb` ersetzen durch:
```html
<span class="skel l"></span><span class="skel l2"></span><span class="sep"></span>
<span class="skel g first"></span><span class="skel" style="width:52%"></span><span class="skel" style="width:58%"></span><span class="skel" style="width:48%"></span>
<span class="skel g"></span><span class="skel" style="width:56%"></span><span class="skel" style="width:60%"></span><span class="skel" style="width:50%"></span><span class="skel" style="width:46%"></span>
<span class="skel g"></span><span class="skel" style="width:54%"></span><span class="skel" style="width:58%"></span><span class="skel" style="width:44%"></span>
<span class="skel g"></span><span class="skel" style="width:64%"></span><span class="skel" style="width:54%"></span>
<span class="skel card"></span>
```

### 3.9 `web/js/coach.js`

**S-CO1 Status nach jedem Abgleich** – bereich_konto-14
In `runSync` (Z. 153–165): vor `try` `let fresh = [];`; im `try` `const fresh = takeNotes(…)…` → `fresh = takeNotes(…)…`; `if (fresh.length) { announce(fresh); refreshView(); }` → `if (fresh.length) announce(fresh);`; im `finally` nach `state.syncing = false;` ergänzen: `if (fresh.length || App.state.route === 'coach') refreshView();`. screens/coach.js:207 bleibt.

**S-CO2 HTTP-Wortlaut** – zustaende-18
Z. 43 `` `Server antwortet mit ${r.status}` `` → `` `Der Server antwortet mit Fehler ${r.status}.` ``. Z. 41 bleibt.

### 3.10 `web/js/screens/stats.js`

**S-ST1 Kopfdiagramm nur mit Daten** – bereich_statistik-22
Z. 13–14 → `let top = ''; if (closed.length) { const chartDays = fillDays(days, r); const id = 'stats-top'; U.chartData[id] = { days: chartDays, bars: false, dots: chartDays.length <= 45 }; top = U.card('', `…unverändert…`); }`

**S-ST2 Einheitliche Leerzustände** – bereich_statistik-46, wording-46
Vor `tabSummary` neu:
```js
function noTrades(icon, title, hint = 'Ändere den Zeitraum oder logge Trades.') {
  return App.allTrades().length ? U.empty(icon, title, hint) : U.empty(icon, 'Noch keine Trades', 'Logge deinen ersten Trade oder importiere eine CSV-Datei.', `<button type="button" class="btn sm" data-action="import">${I.upload} CSV importieren</button>`);
}
```
- Z. 23 → `if (!closed.length) return noTrades('stats', 'Keine abgeschlossenen Trades im Zeitraum');`
- Z. 29 → `if (!days.length) return noTrades('day', 'Keine Handelstage im Zeitraum');`
- Z. 37 → `if (!closed.length) return noTrades('strategy', 'Keine abgeschlossenen Trades im Zeitraum');`
- Z. 42 → `if (!closed.length) return noTrades('clock', 'Keine abgeschlossenen Trades im Zeitraum');`
- Z. 48 → `if (!closed.length) return noTrades('warning', 'Keine abgeschlossenen Trades im Zeitraum');`
- Z. 61 Symbol `sparkle` bleibt.

**S-ST3 Zustand-Spalte** – bereich_statistik-1, diagramme-5
Z. 64 `` `stc-col${g.n ? '' : ' empty'}` `` → `` `stc-col${g.n ? '' : ' is-none'}` ``.

**S-ST4 Edge-Check** – bereich_statistik-23, bereich_statistik-24
- Z. 70 nach `const e = C.edge(list);`: `if (!e.n) return noTrades('trend', 'Keine Trades mit R im Zeitraum', 'Trage in der Trade-Ansicht unter „Plan & Bewertung“ einen Stop ein, dann wird das R-Multiple berechnet.');`
- Z. 72 Kachel „Nötige Stichprobe“: `foot: e.required && e.required > e.n ? `noch ${e.required - e.n} Trades` : 'erreicht'` → `foot: e.required == null ? '' : e.required > e.n ? `noch ${e.required - e.n} Trades` : 'erreicht'`
- Z. 73 Karte „Rollierender Edge“: Inhalt `<div class="chart h280" …></div>${e.deteriorating ? …Banner… : ''}` → `${e.rolling.length ? `<div class="chart h280" data-chart="rolling" data-id="edge"></div>${e.deteriorating ? …Banner unverändert… : ''}` : `<div class="muted small">Der gleitende Durchschnitt erscheint ab ${e.window} Trades mit R-Wert.</div>`}`; `info` und `sub` unverändert.

### 3.11 `web/js/screens/trades.js`

**S-T1 Kacheln folgen dem Filter** – zustaende-27
- Z. 23 `const view = …; const list = ctx.inRange; const s = C.summary(list);` → `const view = …; const list = ctx.inRange; const base = view === 'trades' ? filtered(list) : list; const s = C.summary(base);`
- Z. 24 `const d = W.data(ctx, App);` → `const d = W.data(Object.assign({}, ctx, { inRange: base }), App);`
- Z. 26 Info-Text → `'Summe aller abgeschlossenen Trades im Zeitraum, bei aktiver Suche oder aktivem Filter nur der gefilterten. Daneben der Verlauf je Handelstag.'`; `${s.n} Trades` → `${s.n} abgeschlossen`; `'<span class="nodata">Noch keine Daten</span>'` → `'<span class="nodata dash"><span aria-hidden="true">—</span><span class="vh">Noch keine Daten</span></span>'` (wording-47).
- `renderTable`, `renderDays`, `renderMissed` bekommen weiter `list`.

**S-T2 Zähler und Seitenwähler** – zustaende-37 (Teile 1 und 2)
- In `renderTable` nach `const f = App.state.tradeFilter;` neu: `const active = !!(f.q || f.symbol || f.setup || f.status || f.mistake);`
- Z. 44 `<span class="muted small" style="margin-left:auto">${rows.length} von ${list.length} Trades</span>` → `${active ? `<span class="muted small" style="margin-left:auto">${rows.length} von ${list.length} Trades</span>` : ''}`
- Z. 48 `pager`: nach dem Label „Trades pro Seite“ bei `pages > 1` alles wie bisher (`pg-sep`, `pg-info` „{from} – {to} von {n} Trades“, `grow`, Seitenwahl mit „von N Seiten“, `pg-nav`). Bei `pages <= 1`: `${active ? '' : `<span class="pg-sep"></span><span class="pg-info">${rows.length} Trade${rows.length === 1 ? '' : 's'}</span>`}` und sonst nichts. „Trades pro Seite“ steht immer.
- Teil 3 (Box schrumpft) siehe Abschnitt 6.

**S-T3 Leerzustand der Liste** – wording-46
Z. 45 Titel `list.length ? 'Keine Trades passen zum Filter' : 'Keine Trades im Zeitraum'` → `list.length ? 'Keine Trades passen zum Filter' : App.allTrades().length ? 'Keine Trades im Zeitraum' : 'Noch keine Trades'`; Satz `list.length ? 'Ändere die Filter oder den Zeitraum.' : 'Logge einen Trade oder importiere eine CSV-Datei.'` → `list.length ? 'Ändere die Filter oder den Zeitraum.' : App.allTrades().length ? 'Ändere den Zeitraum oder logge Trades.' : 'Logge deinen ersten Trade oder importiere eine CSV-Datei.'`. Knöpfe unverändert.

**S-T4 Platzhalter in der Tabelle** – zustaende-24
- Z. 49 Spalte Geschlossen `'<span class="faint">offen</span>'` → `'<span class="faint">—</span>'`; Ausstieg `t.exitPrice != null ? fmt.price(t.exitPrice) : '—'` → `… : '<span class="faint">—</span>'`.
- Z. 59 Setup `x.setup ? U.chip(x.setup, 'setup') : '—'` → `… : '<span class="faint">—</span>'`.

**S-T5 Löschen mit Rückfrage** – bereich_trades_tag-28
Jeweils `async` machen und als erste Zeile die Rückfrage:
- Z. 113 `'delete-missed'` → `async 'delete-missed'(el) { if (!await U.confirmModal('Verpassten Trade löschen?', 'Der Eintrag wird dauerhaft entfernt.', { ok: 'Löschen', danger: true })) return; S.deleteMissed(el.dataset.id); App.rerender(); },`
- Z. 114 `'delete-pre-shot'`: `if (!await U.confirmModal('Screenshot vor Entry löschen?', 'Das Bild wird dauerhaft entfernt.', { ok: 'Löschen', danger: true })) return;`
- Z. 115 `'delete-shot'`: `if (!await U.confirmModal('Screenshot löschen?', 'Das Bild wird dauerhaft entfernt.', { ok: 'Löschen', danger: true })) return;`
- Z. 117 `'delete-voice'`: `if (!await U.confirmModal('Sprachnotiz löschen?', 'Aufnahme und Transkript werden dauerhaft entfernt.', { ok: 'Löschen', danger: true })) return;`

### 3.12 `web/js/screens/day.js`

**S-DY1 Ungültige Adresse** – bereich_trades_tag-44
Z. 9 `U.empty('day', 'Ungültiges Datum', '')` → `U.empty('day', 'Ungültiges Datum', 'Die Adresse enthält kein gültiges Datum.', '<a class="btn sm" href="#/day">Zum heutigen Tag</a>')`

**S-DY2 Kennzahlen-Karte nur mit Trades** – hierarchie-18 (mit zustaende-25)
Z. 14: `const stats = U.card('', …);` → `const stats = trades.length ? U.card('', …) : '';`. In der Karte die Spark-Zelle `<div class="grow chart h80" data-chart="spark" data-id="${id}" style="min-width:160px"></div>` nur bei `closed.length` ausgeben, sonst `''`. Gewinner/Verlierer `<span class="pos">${s.wins}</span> / <span class="neg">${s.losses}</span>` → `<span class="${s.wins ? 'pos' : ''}">${s.wins}</span> / <span class="${s.losses ? 'neg' : ''}">${s.losses}</span>`. Kein zusätzlicher Knopf im Leerzustand der Trade-Karte.

**S-DY3 Regel-Link** – zustaende-2
Z. 18 `<a class="btn sm" href="#/settings">Regeln anlegen</a>` → `href="#/settings/regeln"`.

**S-DY4 Notiz-Vorschau mit Überschriften** – bereich_trades_tag-48
Oben im Modul neu:
```js
function notePreview(content, max = 320) {
  const lines = []; let buf = '';
  for (const op of (content && content.ops) || []) {
    if (typeof op.insert !== 'string') continue; /* Bilder und andere Einbettungen auslassen */
    const parts = op.insert.split('\n');
    parts.forEach((p, i) => { buf += p; if (i < parts.length - 1) { lines.push({ t: buf.trim(), h: !!(op.attributes && op.attributes.header) }); buf = ''; } });
  }
  if (buf.trim()) lines.push({ t: buf.trim(), h: false });
  let n = 0; const out = [];
  for (const l of lines.filter(x => x.t)) {
    if (n >= max) { out[out.length - 1] = out[out.length - 1].replace(/<\/div>$/, ' …</div>'); break; }
    const cut = n + l.t.length > max; const s = cut ? l.t.slice(0, max - n) + ' …' : l.t; n += l.t.length;
    out.push(`<div${l.h ? ' class="nv-h"' : ''}>${esc(s)}</div>`); if (cut) break;
  }
  return out.join('');
}
```
Z. 19: `const preview = dn ? S.deltaText(dn.content).trim().slice(0, 320) : '';` → `const preview = dn ? notePreview(dn.content) : '';` und `<div style="white-space:pre-wrap">${preview ? esc(preview) + (… ' …' …) : '<span class="faint">Noch leer.</span>'}</div>` → `<div class="nv">${preview || '<span class="faint">Noch leer.</span>'}</div>`.

### 3.13 `web/js/screens/progress.js`

**S-PR1 Hero-Werte und Pfeile** – bereich_training-6 (mit wording-42, zustaende-10, ki_look-7), diagramme-27, typografie-15
- Z. 20 `const arrow = (dir) => dir > 0 ? `<span class="trend up" aria-label="steigend">…` : …` → `const arrow = (dir, tip = '') => …`, in beiden `<span class="trend …"` nach `aria-label="…"` `${tip ? ` data-tip="${esc(tip)}"` : ''}` ergänzen.
- Z. 59 → `const rateDir = cur.rate != null && prev && prev.rate != null ? Math.sign(cur.rate - prev.rate) : 0;`
- Z. 68 `<span>${doneN ? pct + ' %' : 'Keine Daten'}</span>${arrow(doneN >= 4 ? 1 : 0)}` → `<span class="${doneN ? '' : 'muted'}">${pct} %</span>` (Pfeil entfällt).
- Z. 69 `<span>${cur.rate == null ? '0 %' : fmt.pct(cur.rate)}</span>${arrow(rateDir)}` → `<span>${cur.rate == null ? '<span class="muted">—</span>' : fmt.pct(cur.rate)}</span>${arrow(rateDir, rateDir ? `Vorzeitraum: ${fmt.pct(prev.rate)}` : '')}`

**S-PR2 Ring ohne Kappe bei 0** – zustaende-11
Z. 6 `ringArc`: den zweiten Kreis `<circle class="arc" …/>` nur ausgeben, wenn `rate > 0` (`${rate > 0 ? `<circle class="arc" …/>` : ''}`). mount (Z. 41–43) kommt mit leerer NodeList zurecht.

**S-PR3 Regel-Karte und Wochen** – bereich_training-19, zustaende-13, zustaende-2
- Z. 77 Leerzweig `U.empty('shield', 'Keine Regeln definiert', …, `<a class="btn sm" href="#/settings">Regeln anlegen</a>`)` → `'<div class="dashed">Noch keine Regeln angelegt.</div>'`; `trailing: `<a class="btn sm" href="#/settings">${I.edit} Regeln bearbeiten</a>`` → `trailing: `<a class="btn sm" href="#/settings/regeln">${rules.length ? `${I.edit} Regeln bearbeiten` : `${I.plus} Regeln anlegen`}</a>``
- Z. 78 `<div class="chart h200" data-chart="weeks" data-id="prog-weeks"></div>` → `${weeks.length ? '<div class="chart h200" data-chart="weeks" data-id="prog-weeks"></div>' : '<div class="dashed">Noch keine abgeschlossenen Trades.</div>'}`

### 3.14 `web/js/screens/prop.js`

**S-P1 Konto-Karte** – bereich_prop-2, bereich_prop-3, bereich_prop-6, wording-30
- Z. 90 `const ampel = active ? b.ampel : 'aus';` → `const dead = ev.status === 'breached' || a.status === 'breached'; const ampel = !active ? 'aus' : ev.status === 'breached' ? 'rot' : b.ampel;`
- Z. 93 `bar` ersetzen:
```js
const bar = (lbl, x) => { if (!x) return ''; const over = x.limit > 0 && x.remaining > x.limit + C.EPS;
  const val = over ? `${money(a, x.remaining)}${x.locked ? ' <span class="muted">· Boden fest</span>' : ''}` : `${money(a, x.remaining)} <span class="muted">von ${money(a, x.limit)}</span>`;
  return `<div class="prop-bar"><div class="bl"><span>${lbl} übrig</span><b>${val}</b></div><div class="track"><i style="width:${x.limit > 0 ? Math.min(100, x.remaining / x.limit * 100).toFixed(1) : 0}%;background:${x.limit > 0 ? col(x.remaining / x.limit) : 'var(--surface-3)'}"></i></div></div>`; };
```
- Z. 100 Title `title="Ampel ${AMPEL[ampel]}${b.ratio != null ? ` · ${fmt.pct(b.ratio)} des Limits übrig` : ''}"` → `title="Ampel ${AMPEL[ampel]}${ev.status === 'breached' && active ? ' · Regel verletzt' : b.ratio != null ? ` · ${fmt.pct(Math.min(1, b.ratio))} des Limits übrig` : ''}"`
- Z. 103 `<div class="prop-bars">…</div>` → `${dead ? '' : `<div class="prop-bars">…</div>`}`
- Z. 104 `<div class="prop-meta">…</div>` → `${dead ? '' : `<div class="prop-meta">…</div>`}`

**S-P2 Bilanz ohne Buchungen** – bereich_prop-14, bereich_prop-15
- In `tabBilanz` vor `const tiles` (Z. 256) neu: `const none = bs.spent <= C.EPS;`
- Kachel „Bis Break-even“: Wert `bs.toBreakEven > C.EPS ? <neg> : '<span class="pos">erreicht</span>'` → `none ? '—' : bs.toBreakEven > C.EPS ? <neg wie bisher> : '<span class="pos">erreicht</span>'`; Fuß `bs.toBreakEven > C.EPS ? 'fehlende Payouts (netto)' : 'Payouts decken alle Ausgaben'` → `none ? 'noch keine Ausgaben' : (wie bisher)`.
- Kachel „Kosten je Bestehen“: `bs.costPerPassed == null ? '—' : fmt.cur(bs.costPerPassed)` → `bs.costPerPassed == null || none ? '—' : fmt.cur(bs.costPerPassed)`. Fuß unverändert.
- Z. 257 Legende `<div class="legend">…</div>` nur bei `bs.series.length`.
- Z. 271 `${tiles}<div class="grid main-side">${chart}${byFirm}</div>${expenses}…` → `${tiles}${ex.length || po.length ? `<div class="grid main-side">${chart}${byFirm}</div>` : ''}${expenses}${payouts}${planer}`

**S-P3 `#/prop/payout`** – bereich_prop-27
- Z. 299 `if (key === 'payout') { key = 'bilanz'; (s.fold || (s.fold = {})).planer = true; }` → `if (key === 'payout') { key = 'bilanz'; (s.fold || (s.fold = {})).planer = true; s.scrollTo = 'planer'; try { history.replaceState(null, '', '#/prop/bilanz'); } catch (e) { } }`
- Z. 309 `mount(main)` am Anfang: `if (st().scrollTo === 'planer') { st().scrollTo = null; requestAnimationFrame(() => { const d = main.querySelector('[data-fold="planer"]'); const tb = main.querySelector('.topbar'); if (d) window.scrollTo({ top: d.getBoundingClientRect().top + window.scrollY - (tb ? tb.offsetHeight : 0) - 16 }); }); }`

### 3.15 `web/js/screens/prop-friedhof.js`

**S-F1 Muster erst ab zwei Grabsteinen** – bereich_prop-45
- Z. 172 `${tiles(g)}${patternsCard(g)}` → `${tiles(g)}${g.n >= 2 ? patternsCard(g) : ''}`
- Z. 61: den Zweig `g.n < 2 ? 'Ab zwei Grabsteinen …' :` entfernen, nur „Kein wiederkehrendes Muster …“ bleibt.
- Z. 56 Kachel „Häufigste Regel“: Optionen `{ foot: … }` → `{ foot: …, info: g.n < 2 ? 'Ab zwei Grabsteinen erscheinen Muster: Uhrzeit, Wochentag, Symbol, Setup, Verlustserie oder Emotion, wenn sie sich wiederholen.' : undefined }`

### 3.16 `web/js/screens/misc.js`

**S-M1 Schalter ohne Neuaufbau** – bereich_einstellungen-1
- Z. 282 → `'faith-toggle'(el) { const on = S.settings.christlicherImpuls === false; S.setSetting('christlicherImpuls', on); el.setAttribute('aria-checked', String(on)); },`
- Z. 336 → `'voice-audio-toggle'(el) { const on = S.settings.voiceKeepAudio === false; S.setSetting('voiceKeepAudio', on); el.setAttribute('aria-checked', String(on)); },`
- Z. 337 → `'blind-toggle'(el) { const on = !S.settings.moneyBlind; S.setSetting('moneyBlind', on); fmt.setMoneyBlind(on, App.rUnit()); el.setAttribute('aria-checked', String(on)); U.toast(on ? 'Geld-blind-Modus an' : 'Geld-blind-Modus aus', 'ok'); },`
- Z. 333 → 
```js
'be-mode'(el) { const form = el.closest('form'); const be = Object.assign({}, S.settings.beOffset || {}, { mode: el.dataset.value }); if (form) { be.from = Math.min(0, Number(form.querySelector('#be-from').value) || 0); be.to = Math.max(0, Number(form.querySelector('#be-to').value) || 0); }
  S.setSetting('beOffset', be); C.setBreakEven(be); el.parentElement.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === el)));
  el.closest('.set-block').querySelectorAll('.input-unit span').forEach(s => { s.textContent = be.mode === 'pct' ? '%' : S.currency(); }); },
```
- Z. 334 →
```js
'be-reset'(el) { const be = { mode: 'abs', from: 0, to: 0 }; S.setSetting('beOffset', be); C.setBreakEven(be); const b = el.closest('.set-block');
  b.querySelector('#be-from').value = '0'; b.querySelector('#be-to').value = '0'; b.querySelectorAll('[data-action="be-mode"]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.value === 'abs')));
  b.querySelectorAll('.input-unit span').forEach(s => { s.textContent = S.currency(); }); },
```
Kein eigener `App.glideSwitch`-Aufruf (läuft über app.js:282).

**S-M2 Trading speichert sofort** – komponenten-5
- Z. 192 `head('Trading', 'Passe dein Trading-Erlebnis an.')` → `head('Trading', 'Passe dein Trading-Erlebnis an.', '<span class="save-state" id="set-save" aria-live="polite"></span>')`; `<form data-action="save-trading" class="stack" …>` → `<form data-action="save-trading" data-change="save-trading-auto" class="stack" …>`
- Z. 201 `<div><button type="submit" class="btn primary">Speichern</button></div>` entfernen.
- Z. 335: Lesen der Form in eine Funktion `function readTrading(form) { … }` auslagern (genau der heutige Inhalt bis `C.setBreakEven(st.beOffset)`). `'save-trading'(form) { readTrading(form); U.toast('Gespeichert', 'ok'); rerender(); }` bleibt für Enter. Neu:
```js
'save-trading-auto'(form) { if (!form.checkValidity()) { form.reportValidity(); return; } readTrading(form); const s = document.getElementById('set-save'); if (s) { s.textContent = 'Gespeichert'; clearTimeout(s._t); s._t = setTimeout(() => { s.textContent = ''; }, 2000); } },
```
(kein Toast, kein `rerender`). Profil, Mentor, Notebook unverändert.

**S-M3 Regeln löschen mit Rückfrage** – bereich_einstellungen-39
Z. 341 → `async 'delete-rule'(el) { const r = S.data.rules.find(x => x.id === el.dataset.id); if (!r) return; if (await U.confirmModal('Regel löschen?', `„${esc(r.text)}“ wird gelöscht. Zum Pausieren reicht der Schalter.`, { ok: 'Löschen', danger: true })) { S.deleteRule(r.id); rerender(); } },`

**S-M4 Tags zurücksetzen** – bereich_einstellungen-38
- Z. 238: `<button type="button" class="btn sm" data-action="tags-reset">Zurücksetzen</button>` aus der Filterleiste entfernen.
- Im Tags-Zweig direkt nach dem schließenden `</div>` von `.tbl-wrap` einfügen: `<div class="row" style="margin-top:10px"><button type="button" class="btn ghost sm" data-action="tags-reset" style="color:var(--muted)">Tags auf Standard zurücksetzen</button></div>`
- Z. 354 `U.confirmModal('Tags zurücksetzen', …, { ok: 'Zurücksetzen', danger: true })` → `U.confirmModal('Tags auf Standard zurücksetzen?', 'Alle Tags werden auf die Standardliste zurückgesetzt. Beschreibungen gehen verloren, Trades bleiben unverändert.', { ok: 'Auf Standard zurücksetzen', danger: true })`

**S-M5 Standardfarben gelten als gewählt** – farbe_kontrast-17
- Z. 130 am Ende: `const isDef = k => !col[k];`
- Z. 145 Akzent-Punkte `aria-pressed="${cur.accent.toLowerCase() === c}"` → `aria-pressed="${isDef('accent') ? c === T.DEFAULTS.dark.accent : cur.accent.toLowerCase() === c}"`
- Z. 134 Paare `aria-pressed="${cur.profit.toLowerCase() === p && cur.loss.toLowerCase() === l}"` → `aria-pressed="${isDef('profit') && isDef('loss') ? (p === T.DEFAULTS.dark.profit && l === T.DEFAULTS.dark.loss) : (cur.profit.toLowerCase() === p && cur.loss.toLowerCase() === l)}"`

**S-M6 Zeitzone** – referenz-36
Z. 54 `timezones().map(…)` → `(() => { const tzs = timezones(); if (!tzs.includes('UTC')) tzs.push('UTC'); if (tz && !tzs.includes(tz)) tzs.unshift(tz); return tzs; })().map(…)` (Auswahl weiter über `z === tz`).

### 3.17 `web/js/screens/news.js`

**S-NW1 Countdown in Kalendertagen** – bereich_notebook_news-40, zustaende-40
Z. 50 ersetzen:
```js
function inText(t, now) {
  const m = Math.round((t - now) / 60000); if (m < 1) return 'Jetzt';
  const dd = Math.round((new Date(t.getFullYear(), t.getMonth(), t.getDate()) - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
  if (m < 60) return `In ${m} Min.`;
  const h = Math.floor(m / 60), r = m % 60; const rel = r ? `In ${h} Std. ${r} Min.` : `In ${h} Std.`;
  if (dd === 0 || m < 360) return rel;
  return dd === 1 ? 'Morgen' : `In ${dd} Tagen`;
}
```
- Z. 83 `inText(new Date(next.time) - now)` → `inText(new Date(next.time), now)`. Die kleine Zeile (Datum, Uhrzeit) bleibt.
- Z. 98 im Takt `el.textContent = inText(left);` → `el.textContent = inText(new Date(el.dataset.newsIn), new Date());` (`left` bleibt für die Prüfung `left < -60000`).

**S-NW2 Skelett beim Laden** – zustaende-17, bereich_notebook_news-38
Z. 87 → `else if (ok && !s.events) body = `<div class="nw-skel" role="status" aria-label="Termine werden geladen"><div class="skel" style="height:78px"></div>${[2, 2, 1].map(n => `<div class="skel" style="height:${44 + n * 44}px"></div>`).join('')}</div>`;`

**S-NW3 Offline-Wortlaut** – zustaende-18
Z. 28 `'Der Server ist nicht erreichbar. Prüf die Adresse unter Einstellungen → Mentor.'` → `'Der Server ist nicht erreichbar. Prüf die Adresse unter Einstellungen → Mentor und deine Verbindung.'`

### 3.18 `web/js/screens/coach.js`

**S-CS1 Fehlerbanner** – zustaende-18
Z. 27 → `function errorBox(msg, retry) { return U.banner('warn', '', esc(msg), retry ? { trailing: `<button type="button" class="btn sm" data-action="${retry}">${I.refresh} Erneut versuchen</button>` } : {}); }`

**S-CS2 Skelett beim Laden** – zustaende-17
Z. 28 → `const loading = () => `<div class="coach-skel" role="status" aria-label="Wird geladen">${'<div class="skel"></div>'.repeat(5)}</div>`;` (wirkt in Z. 111, 153, 167, 184).

**S-CS3 Text neben der Hintergrund-Ladeanzeige** – bewegung-13
Z. 58 `${s.loading ? U.loader('sm', 'Lädt') : ''}` → `${s.loading ? `<span class="ld-row">${U.loader('sm', 'Lädt')}<span class="muted" aria-hidden="true">Wird geladen …</span></span>` : ''}`

**S-CS4 E-Mail-Schalter speichert sofort** – bereich_konto-15
- Z. 364 →
```js
async 'coach-mail-toggle'(el) { const f = el.closest('form'); const email = String(new FormData(f).get('email') || '').trim(); const on = el.getAttribute('aria-checked') !== 'true';
  if (on && !email) { f.querySelector('input[name=email]').focus(); return U.toast('Trage zuerst eine E-Mail-Adresse ein', 'err'); }
  el.setAttribute('aria-checked', String(on));
  try { const r = await Co.saveNotify(email, on); st().mail = r.mail; U.toast(on ? (r.mail ? 'E-Mail-Benachrichtigung an' : 'Gespeichert. Der Server verschickt noch keine Mails.') : 'E-Mail-Benachrichtigung aus', 'ok'); App.rerender(); }
  catch (e) { el.setAttribute('aria-checked', String(!on)); fail(e); } },
```
- Z. 367 `'Bitte eine E-Mail-Adresse eintragen'` → `'Trage zuerst eine E-Mail-Adresse ein'`.
- Z. 77 Knopf `Speichern` → `Adresse speichern` (Handler `coach-notify-save` bleibt).

**S-CS5 Leere Gruppe** – bereich_konto-44
- Z. 121 `<div class="row between coach-ctl">…</div>` nur ausgeben, wenn nicht `rows && !rows.length` (während des Ladens, `rows === null`, bleibt er).
- Z. 112 Besitzer-Text → „Schick den Einladungslink oben an deine Schüler. Wer beitritt, erscheint hier mit Kurz-Stats.“ Kein zusätzlicher Knopf.

### 3.19 `web/js/screens/mentor.js`

**S-MT1 Kopfreihe ohne Server** – zustaende-16 (mit hierarchie-34)
Z. 76 `head: { range: false, session: false, trade: false, note: 'Der Mentor sieht die letzten 20 Trades dieses Kontos.' },` → `get head() { return configured() ? { range: false, session: false, trade: false, note: 'Der Mentor sieht die letzten 20 Trades dieses Kontos.' } : { range: false, account: false, session: false, trade: false }; },` (app.js:257 liest den Getter über `Object.assign`).

**S-MT2 Wortlaut** – zustaende-18
- Z. 17 `'Der Mentor-Server ist nicht erreichbar. …'` → `'Der Server ist nicht erreichbar. Prüf die Adresse unter Einstellungen → Mentor und deine Verbindung.'`
- Z. 127 `'Server antwortet mit ' + r.status` → `'Der Server antwortet mit Fehler ' + r.status + '.'`

### 3.20 `web/js/screens/notebook.js`

**S-NB1 Verlust in der Notizliste** – farbe_kontrast-29
Z. 60 `U.pnl(pnl, '', { r: t.r })` → `U.pnl(pnl, 'num', { r: t.r })`.

**S-NB2 Farbe nur für eigene Ordner** – bereich_notebook_news-33
- Z. 51: Eintrag `<button … data-action="nb-folder-edit" … data-color="1">${I.dot} Farbe ändern</button>` nur bei `!x.isDefault` ausgeben.
- Z. 62 (`nb-move-sel`) und Z. 74 (`nb-move`): statt `<i style="width:10px;height:10px;border-radius:3px;background:${esc(x.color)}"></i>` → `${x.isDefault ? folderIcon(x) : `<i style="width:10px;height:10px;border-radius:3px;background:${esc(x.color)}"></i>`}`.

**S-NB3 Speicherstand** – bereich_notebook_news-24
Z. 100 `'Speichert…'` → `'Wird gespeichert …'`. Die Klasse `saving` darf bleiben (hat keine Farbe mehr).

### 3.21 `web/js/screens/ruhepunkt.js`

**S-RP1 Session nicht ohne Rückfrage verwerfen** – bereich_training-42
- Z. 781 (`renderDone`) `cleanup(); homeBtn(true);` → `cleanup(); homeBtn(false);`
- Z. 890 → `'rp-home': function () { if (!stage) return; var go = function () { renderHome().focus({ preventScroll: true }); }; if (mode === 'step' && stepIdx > 0) { U.confirmModal('Session verwerfen?', 'Deine Eingaben aus dieser Session gehen verloren.', { ok: 'Verwerfen', danger: true }).then(function (yes) { if (yes && stage) go(); }); } else go(); },`
- Beschriftung „← Übersicht“ (Z. 877) bleibt.

### 3.22 `web/js/datepicker.js` (nur falls wording-2 nicht umgesetzt ist)

**S-DP Leeres Datumsfeld** – komponenten-15
Wird durch wording-2 / zustaende-20 (Spec Wortwahl) erledigt. Ist das bei Umsetzung dieser Spec nicht der Fall: app.js:360 `class="input"` → `class="input${t.closedAt ? '' : ' is-empty'}"`; in `DatePicker.init()` ein Listener `document.addEventListener('input', e => { if (e.target.matches && e.target.matches('input.input[type="date"], input.input[type="datetime-local"], input.input[type="month"]')) e.target.classList.toggle('is-empty', !e.target.value); }, true);` (dasselbe für `change`); CSS nach app.css:294: `.input.is-empty, .input.is-empty::-webkit-datetime-edit { color: var(--faint); }`.

### 3.23 `web/js/lang/{en,es,hi,pt,zh}.js` – S-L

Neue Schlüssel (deutsch → englisch; es/pt/hi/zh sinngemäß in derselben Form, Platzhalter beibehalten):
„Noch keine Trades“ → „No trades yet“; „Logge deinen ersten Trade oder importiere eine CSV-Datei.“ → „Log your first trade or import a CSV file.“; „Keine abgeschlossenen Trades im Zeitraum“ → „No closed trades in this period“; „Ändere den Zeitraum oder logge Trades.“ → „Change the period or log trades.“; „Keine Trades im Zeitraum“ → „No trades in this period“; „Keine Handelstage im Zeitraum“ → „No trading days in this period“; „Keine Trades passen zum Filter“ → „No trades match the filter“; „Ändere die Filter oder den Zeitraum.“ → „Change the filters or the period.“; „Noch keine abgeschlossenen Trades“ → „No closed trades yet“; „Noch keine abgeschlossenen Trades.“ → „No closed trades yet.“; „Noch keine Daten“ → „No data yet“; „Noch keine Wochen“ → „No weeks yet“; „Zu wenig Trades“ → „Not enough trades“; „Mindestens {0} Trades mit R-Wert nötig“ → „At least {0} trades with an R value needed“; „Der gleitende Durchschnitt erscheint ab {0} Trades mit R-Wert.“ → „The rolling average appears after {0} trades with an R value.“; „Keine Trades mit R im Zeitraum“ → „No trades with R in this period“; „Trage in der Trade-Ansicht unter „Plan & Bewertung“ einen Stop ein, dann wird das R-Multiple berechnet.“ → „Enter a stop under “Plan & review” in the trade view to calculate the R multiple.“; „Noch keine Regeln angelegt.“ → „No rules yet.“; „Regeln anlegen“ → „Add rules“; „Vorzeitraum: {0}“ → „Previous period: {0}“; „Symbol wählen“, „Long oder Short wählen“ (falls fehlend) → „Choose a symbol“, „Choose long or short“; „Einstieg eintragen“ → „Enter the entry“; „Kontrakte eintragen“ → „Enter the contracts“; „Datum eintragen“ → „Enter the date“; „Ausstieg eintragen oder Geschlossen leeren“ → „Enter the exit or clear Closed“; „Pflichtfeld“ → „Required“; „Mindestens {0}“ → „At least {0}“; „Höchstens {0}“ → „At most {0}“; „Gültige E-Mail-Adresse eintragen“ → „Enter a valid email address“; „Ungültiger Wert“ → „Invalid value“; „In {0} Min.“ → „In {0} min“; „In {0} Std. {1} Min.“ → „In {0} h {1} min“; „In {0} Std.“ → „In {0} h“; „In {0} Tagen“ → „In {0} days“ (alte kleingeschriebene Schlüssel „jetzt“, „morgen“, „in {0} …“ entfernen, wenn grep keine weitere Nutzung findet); „Wird gespeichert …“ → „Saving …“; „Wird geladen …“ → „Loading …“; „{0} abgeschlossen“ → „{0} closed“; „Summe aller abgeschlossenen Trades im Zeitraum, bei aktiver Suche oder aktivem Filter nur der gefilterten. Daneben der Verlauf je Handelstag.“ → „Sum of all closed trades in the period; with an active search or filter, only the filtered ones. Next to it, the curve per trading day.“; „Ungültiges Datum“ → „Invalid date“; „Die Adresse enthält kein gültiges Datum.“ → „The address does not contain a valid date.“; „Zum heutigen Tag“ → „Go to today“; „Verpassten Trade löschen?“ → „Delete missed trade?“; „Der Eintrag wird dauerhaft entfernt.“ → „The entry will be removed permanently.“; „Screenshot löschen?“ → „Delete screenshot?“; „Screenshot vor Entry löschen?“ → „Delete pre-entry screenshot?“; „Das Bild wird dauerhaft entfernt.“ → „The image will be removed permanently.“; „Sprachnotiz löschen?“ → „Delete voice note?“; „Aufnahme und Transkript werden dauerhaft entfernt.“ → „The recording and transcript will be removed permanently.“; „Check-in löschen?“ → „Delete check-in?“; „Die Angaben dieses Check-ins werden gelöscht.“ → „This check-in’s entries will be deleted.“; „Regel löschen?“ → „Delete rule?“; „„{0}“ wird gelöscht. Zum Pausieren reicht der Schalter.“ → „“{0}” will be deleted. To pause it, use the switch.“; „Session verwerfen?“ → „Discard session?“; „Deine Eingaben aus dieser Session gehen verloren.“ → „Your entries from this session will be lost.“; „Verwerfen“ → „Discard“; „Tags auf Standard zurücksetzen“ → „Reset tags to default“; „Tags auf Standard zurücksetzen?“ → „Reset tags to default?“; „Adresse speichern“ → „Save address“; „Trage zuerst eine E-Mail-Adresse ein“ → „Enter an email address first“; „E-Mail-Benachrichtigung aus“ → „Email notifications off“; „Schick den Einladungslink oben an deine Schüler. Wer beitritt, erscheint hier mit Kurz-Stats.“ → „Send the invite link above to your students. Anyone who joins appears here with quick stats.“; „Boden fest“ → „floor locked“; „Ab zwei Grabsteinen erscheinen Muster: Uhrzeit, Wochentag, Symbol, Setup, Verlustserie oder Emotion, wenn sie sich wiederholen.“ → „From two tombstones on, patterns appear: time, weekday, symbol, setup, losing streak or emotion, when they repeat.“; „{0} T“ → „{0} d“; „{0} s“ → „{0} s“. Prop-Bilanz-Texte („noch keine Ausgaben“) sind wie der Rest der Bilanz noch nicht übersetzt und brauchen keinen Schlüssel.

### 3.24 Tests – S-TE

- `web/tests/core.test.mjs`: neu `daySummary` mit einem Verlusttag → `dayPayoff === 0` und `dayPF === 0`; mit einem Gewinntag → `dayPayoff === null` und `dayPF === null`; mit nur Break-even-Tagen → `dayPayoff === 0` und `dayPF === 0`.
- `e2e/dashtest.js:143–144` ersetzen: im leeren Zustand mindestens 5 `.dash-top .tile .nodata.dash` mit `textContent` „—Noch keine Daten“; mindestens 3 `.chart-empty .ce-t` mit „Noch keine Trades“; `#content` enthält nicht „ändere den Zeitraum“; kein `.recent-card .more-link`.
- `e2e/motiontest.js`: „Kachel hebt sich beim Überfahren“ → „Kachel bleibt beim Überfahren ruhig“ mit Erwartung `transform === 'none'`.
- `e2e/newstest.js:54`: `/^in 2 Std\./` → `/^In 2 Std\./`.
- `e2e/coachtest.js:169–170`: nach dem Ausfüllen nur `[data-action=coach-mail-toggle]` klicken (kein Submit), dann Toast „E-Mail-Benachrichtigung an“ prüfen.
- `e2e/settest.js:22`: statt Klick auf den Submit-Knopf `#be-from` und `#be-to` füllen und mit `press('Tab')` verlassen, dann den Store prüfen. Z. 26 bleibt (be-reset setzt `C.setBreakEven`).
- `e2e/friedhoftest.js:47`: bei einem Grabstein weder `.prop-patterns` noch `.prop-patterns-empty`; das Info der Kachel „Häufigste Regel“ enthält „Ab zwei Grabsteinen“.
- `e2e/scorestatetest.js:22` („Karte flach“, Höhe < 150 px) muss danach ohne Anpassung grün sein.

### 3.25 `web/README.md` – S-R

- Z. 77: „Start und Ende als Kachel in der Akzentfarbe“ → „Start und Ende als Kachel in der Schriftfarbe (invertiert), Band neutral (`--surface-3`), heute unterstrichen; keine grüne Auswahl“.
- Z. 144: Satz ergänzen „Ohne eingerichteten Server zeigt die Kopfreihe nichts.“
- Z. 224: „eingeschaltet ist sie leicht getönt“ → „eingeschaltet ist sie leicht angehoben (flach, feiner Rand), Grün nur im Schalter“.
- Z. 338–340: ergänzen „Design (hell/dunkel) und eingeklappte Leiste stehen schon im Skelett (Theme im `<head>` von `app.html`). Bereiche, die Daten nachladen (News, Coach), zeigen ein Skelett aus `.skel`; `U.spin()` nur in Knöpfen neben Text, `U.loader()` nur mit sichtbarem Text daneben.“
- Neuer Absatz nach „Bewegung und Übergänge“, Überschrift „Zustände“: vier Leerzustand-Stufen (Z1), „—“ für fehlende Werte, Feldfehler am Feld statt Toast, Toast-Dauer und Live-Region, Rückfrage vor endgültigem Löschen, Deaktiviert `--disabled-o`, Hover nur auf Bedienbarem.

---

## 4. Akzeptanzkriterien

**Tests**
1. `node --test web/tests/*.mjs` grün, inklusive der neuen `daySummary`-Fälle.
2. E2E grün (nach S-TE): dashtest, motiontest, newstest, coachtest, settest, settest2, friedhoftest, scorestatetest, leaktest, loadtest, tradeformtest, sixtest, filtertest, proptest, certtest, shadowtest, anchortest, tlfittest, mobiletest, langtest, sampletest, voicetest, rptest, dptest, rangetest, headtest, usercardtest.

**grep-Prüfungen** (jeweils 0 Treffer, wenn nicht anders angegeben)
3. `grep -rn 'href="#/settings"' web/js --include=*.js | grep -v /lang/`
4. `grep -n "a >= 10000 ? 0" web/js/ui.js`; `grep -n "a < 1000 ? 2 : 1" web/js/ui.js`
5. `grep -nE "^\.(rr-day|dp-day|dp-month|dp-t|dp-link)[^{]*\{[^}]*(--accent|--accent-soft|--accent-ink)" web/css/app.css` und `grep -n "datepick .dp.today.*accent" web/css/app.css`
6. `grep -nE "^\.(tile|stat-tile|card):hover|\.kstrip \.tile:hover" web/css/app.css`
7. `grep -nE ":disabled[^{]*\{[^}]*opacity: *\.[0-9]" web/css/app.css` (alle Deckkräfte über `var(--disabled-o)`); `grep -c "var(--disabled-o)" web/css/app.css` ≥ 6
8. `grep -nE "set-tabs button\[aria-pressed=\"true\"\][^}]*accent|prop-sub a::after[^}]*accent|lang-cur[^}]*accent|shadow-rule\.on[^}]*accent|\.btn \.cntb[^}]*var\(--bg\)" web/css/app.css`
9. `grep -n "Speichert…\|Logge Trades oder ändere den Zeitraum\|'Keine Daten'\|' empty'\|coach-loading\|nw-loading\|U.spin()" web/js/screens/notebook.js web/js/widgets.js web/js/screens/progress.js web/js/screens/stats.js web/js/screens/coach.js web/js/screens/news.js`
10. `grep -n "\.spin { animation-duration" web/css/app.css`; `grep -n "save-state.saving" web/css/app.css`
11. `grep -c "novalidate" web/js/app.js` = 1; `grep -n "U.toast('Symbol fehlt'\|Einstiegskurs fehlt\|Ausstiegskurs fehlt" web/js/app.js` = 0
12. `grep -n "setAttribute('aria-live', 'polite')" web/js/ui.js` ≥ 1
13. `grep -n "text-decoration: line-through" web/css/app.css` trifft nur noch `.ql-editor li[data-list=checked]` und `.coach-task.done .ct-text` (und ggf. eigene Notebook-Regeln), nicht `.checklist`.
14. `grep -n "'delete-missed'\|'delete-shot'\|'delete-pre-shot'\|'delete-voice'\|'delete-checkin'\|'delete-rule'" web/js -r` – jede Fundstelle ist `async` und enthält `confirmModal`.
15. `grep -n "Server antwortet mit \${\|'Server antwortet mit '" web/js -r` = 0; `grep -n "Mentor-Server ist nicht erreichbar" web/js -r` = 0
16. `grep -n "data-theme" web/app.html` zeigt weiter `data-theme="dark"` an `<html>`, und `js/theme.js` steht im `<head>` (Zeile < `</head>`), nicht mehr am Ende von `<body>`.

**Zensus und Messwerte** (Playwright, dark 1440 × 900, Werte wie in `audit/census`)
17. `leer_dashboard`: kein sichtbarer Text „Noch keine Daten“ (nur in `.vh`), kein „ändere den Zeitraum“, fünf Kachelwerte „—“ mit `font-size` 25 px und `color` = `--muted`; Symbole der Karten einer Reihe auf gleicher Höhe (±2 px).
18. `leer_progress`: kein `span` mit 44 px und Text „Keine Daten“; „Heutiger Fortschritt“ = „0 %“ in `--muted`; „% Regeln eingehalten“ = „—“; kein `.ring-arc .arc` im DOM.
19. `stats_state` mit Beispieldaten: alle drei Zustand-Karten < 150 px hoch; alle `.stc-l` auf gleicher y-Position.
20. `leer_stats`: kein Element `[data-id="stats-top"]`; erster Inhalt unter der Kopfreihe ist die Reiterleiste.
21. Start-Skelett (verzögertes `app.js`, wie `audit/shell-probe`): mit gespeichertem hellen Design `body` = `rgb(245, 247, 245)` schon im Skelett; mit `sidebarMini` Leiste 80 px im Skelett; Dashboard-Skelett Kacheln y=158/h=131, Karten y=307/h=396, Kopfreihe 46 px (±2 px gegenüber der fertigen Seite).
22. Toast: Direkt nach dem Start gibt es `.toast-wrap[role="status"][aria-live="polite"]` (vor dem ersten Toast). Ein `err`-Toast mit 60 Zeichen bleibt ≥ 4,5 s; beim Darüberfahren verschwindet er nicht.
23. Trade-Dialog leer speichern: kein Toast, ≥ 5 `.field-err`, `document.activeElement.id === 'f-symbol-btn'`, keine native Blase (Fokus und kein `:invalid`-Popup), „Long oder Short wählen“ in der Vorschau unverändert. Nach Eingabe im Einstieg verschwindet dessen Meldung.
24. Einstellungen → Profil: Vorname tippen, „Christlicher Impuls“ umschalten → Vorname steht noch im Feld. Trading: Tagesverlustlimit 5, Tab → Store = 5, „Gespeichert“ sichtbar; Geld-blind umschalten → Feld bleibt 5. Mentor: Server-Adresse tippen, „Audio behalten“ umschalten → Adresse steht noch.
25. Deaktivierter `.btn`: beim Darüberfahren `transform: none` und Hintergrund unverändert; `opacity` = 0.4; deaktivierter `.btn.primary` ohne Akzentfläche.

**Screenshot-Prüfpunkte** (Atlas neu aufnehmen, dark und light, 1440 und 390)
26. `pop_zeitraum`: kein Grün im Kalender; Start/Ende invertierte Kacheln; „heute“ unterstrichen; Band grau.
27. `dashboard` mit aktivem Filter (`extra/dash/dark-1440-filter-aktiv`): Filter-Knopf flach wie gewählte Segmente, Zähler neutral; nur „Trade loggen“ grün.
28. `settings_design` (light): Akzent-Punkt Neongrün und Karte „Grün / Rot“ gewählt. `settings_profil` (light): „Profil“ links sichtbar gewählt. `settings_inhalte`, `settings_sprache`, `prop` (Unterreiter), `shadow`: keine grüne Auswahl.
29. `prop` (Apex): „Max. Drawdown übrig 11.162,00 $ · Boden fest“, kein „von“. `extra/hicks-prop-1440-cockpit_breach`: Ampel rot, keine Balken, keine Meta-Zeile. `extra/hicks-prop-1440-leer_bilanz`: „Bis Break-even —“ mit „noch keine Ausgaben“, kein Diagramm, keine Karte „Pro Firma“.
30. `day` (Tag ohne Trades): keine Kennzahlen-Karte; `day_mit_trades`: Notiz-Vorschau mit „Lehre“ als fette Zeile.
31. `trades` mit einem Trade: kein Seitenwahl-Select, keine Pfeile, unten „1 Trade“; oben kein „1 von 1 Trades“; Kachel „1 abgeschlossen“. Mit Suche „NQ“: Kacheln rechnen mit den gefilterten Trades.
32. `notebook_notiz`: „−304,42 €“ in `--loss`, „DAX“ und Betrag gleich groß (12 px).
33. `news`: Kopfkarte „Morgen“ bzw. „In N Std. …“ großgeschrieben; Zeitpunkt 23:00 mit Termin übermorgen 02:00 zeigt „In 2 Tagen“ (`page.clock`/`Date`-Mock).
34. `modal_zertifikat` (an einem Sonntag nach Handelstagen): Vorschau zeigt den letzten Handelstag; das Menü oben rechts ist geschlossen.
35. `responsiv-43`/`bereich_shell-7`: TradeLog und Prop Firms nach Dashboard-Besuch und Fenster 1440 → 900 → 1440: `#tb-tools` leer (`e2e/leaktest.js`).

---

## 5. Zurückgestellt

Kein Befund wird ganz zurückgestellt. Bewusst **nicht** umgesetzt werden diese Teilvorschläge:

| Befund | Teil | Grund |
|---|---|---|
| typografie-15 | prop.js:256 „erreicht“ → „0,00 €“ in Grau; Regel „in Wertfeldern nur Zahlen“ | „Bis Break-even: erreicht“ in Grün ist ein echter positiver Zustand (Grün = positiv erlaubt). Der falsche Fall ohne Ausgaben ist durch bereich_prop-14 gelöst. Die Pauschalregel ist Geschmack und würde ohne Nutzen weitere Stellen ändern. |
| zustaende-4 | Umbau `null` → `Infinity` in core.js | Bricht Verlaufsdiagramme (Math.max/niceTicks), JSON (Coach-Sync, Speicher), Score („Infinity“) und certdata.js:48. Die Einzeilen-Korrektur reicht. |
| diagramme-38 | Leertext in `spark` (ui.js:316) und `equity` bei einem Punkt (ui.js:290); Höhe h120 für „Rollierender Edge“ | spark steckt in Tabellenzeilen und Notizen, ein Text wäre Rauschen; ein Punkt ist nicht „keine Daten“. Rolling: ersetzt durch bereich_statistik-24. |
| zustaende-18 | gemeinsames `errorState` mit Titel „Server nicht erreichbar“, `Co.OFFLINE`/`HTTP_ERR`, Statuscode nur in der Konsole, Erneut-Knopf in `.mentor-err` | Fester Titel falsch bei 401/404/Server-Meldungen; Leerzustand über weiter sichtbaren Coach-Karten falsch; `mentor-reload` lädt nur den Verlauf (nach Sendefehler irreführend); js/coach.js lädt nach news.js/mentor.js; Statuscode hilft Selbsthostern. |
| barrierefreiheit-20 | zweiter Container `role="alert"`, Symbol im Toast | Zweiter fixer Container überdeckt den ersten; alert in polite-Region wird doppelt angesagt; der Text trägt den Zustand, ein Symbol wäre Zusatzschmuck. |
| komponenten-5 | Sofort-Speichern auch für Notebook, Privatsphäre als Schalter | Notebook ist in sich einheitlich (Vorschau, dann Speichern); Privatsphäre ebenfalls (Wortlaut regelt wording-17). |
| zustaende-34 | Token `--lift-shadow` löschen | landing.css:56 nutzt es. |
| zustaende-35 | Pager-Pfeile auf Deckkraft | gemeinsame Knopfgruppe würde fleckig. |
| zustaende-39 | News-Countdown über `fmt.dur` | Countdown ist ein Satz mit eigenen Übersetzungsmustern; zwei Prüfer haben das abgelehnt. |
| bereich_notebook_news-40 | „Heute, 14:30“ ab 6 h Abstand | README Z. 114 legt einen Countdown fest; am selben Tag bleibt „In N Std.“. |
| bereich_dashboard-34 | Präfix „Größe“ vor dem Betrag | Geschmack, macht die Zeile länger; stattdessen `title="Kontogröße"`. |
| hierarchie-18 | zusätzlicher „Trade loggen“-Knopf im Leerzustand | „Trade für diesen Tag“ steht schon in der Tagesleiste; ein zweiter Trade-Knopf verwässert den grünen Hauptknopf. |
| bereich_konto-44 | zweiter „Kopieren“-Knopf im Leerzustand | Einladungslink mit „Kopieren“ steht direkt darüber. |
| bewegung-13 | Drehen/Pulsieren bei „Bewegung reduzieren“ | README Z. 342: bei weniger Bewegung ist alles aus. |
| bereich_training-19 | Leer-Schatten-Ich in eine Karte (shadow.js:109) | nicht bestätigt, gehört zur Schatten-Ich-Spec. |
| bereich_shell-4 | Titelversatz durch sichtbaren Menüknopf (`.menu-btn` wird von `.btn { display: inline-flex }` überschrieben); „Skelett zeigt immer das Dashboard“ | eigener Befund bzw. bewusst offen; der Titel-Versatz verschwindet mit dem Menüknopf-Fix. |
| bereich_dashboard-13 / ki_look-15 | Diagrammkarten ganz ohne Text | wirkt wie ein Ladefehler. |
| wording-30 / bereich_prop-6 | Label „Abstand zum Boden“, eigene `compact`-Regel in `bar()`, „· Limit …“ | „übrig“ gilt für Daily Loss und Drawdown; Stellen regelt zustaende-23 global; neue Texte ohne Nutzen. |
| bereich_statistik-46 | Symbol `sparkle` → `mood` | `sparkle` ist das Check-in-Symbol (day.js:12, 16). |
| komponenten-4 | Fußzeile „2 Angaben fehlen“ | README Z. 44: Vorschau sagt „Long oder Short wählen“; jedes Feld ist markiert. |

---

## 6. Nutzer fragen

**zustaende-37, Teil 3 – Tabellenhöhe im TradeLog.** README Z. 103–107 legt fest: „Auf dem Desktop füllt die Liste genau das Fenster … der Seitenwähler bleibt unten sichtbar“. Bei einem Trade stehen deshalb rund 340 px leere Tabellenfläche bis zum Seitenwähler (`extra/zustaende/trades_ein_trade.png`). Vorschlag: app.css nach Z. 967 `.tl-fit > .tbl-wrap.paged { flex: 0 1 auto; }` – die Box endet nach der letzten Zeile und wächst höchstens bis zur Fensterhöhe; lange Listen verhalten sich wie heute, die Seite scrollt weiter nicht.
*Frage:* „Darf die Trade-Tabelle bei wenigen Trades kürzer sein als das Fenster, sodass der Seitenwähler direkt unter der letzten Zeile steht?“
*Empfehlung:* Ja. Der Kern der Entscheidung (Seite scrollt nicht, Seitenwähler immer sichtbar, lange Listen füllen das Fenster) bleibt erhalten. README Z. 103–107 danach um „bei wenigen Trades endet die Box nach der letzten Zeile“ ergänzen. Die Teile 1 und 2 (Seitenwähler nur bei mehreren Seiten, Zähler nur bei aktivem Filter) werden ohne Rückfrage umgesetzt (S-T2).
