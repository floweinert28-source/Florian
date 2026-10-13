# Zielspezifikation Komponenten (Journalyst)

Geltung: alle 87 bestätigten Befunde aus `spec-input/komponenten.json`. Zeilenangaben beziehen sich auf den Code-Stand von Commit 677b630 (Code seit 11.10. unverändert). Weil sich Zeilen beim Umsetzen verschieben, immer über den genannten Selektor bzw. die Funktion suchen. Pfade relativ zu `/home/user/Florian/web`.

Was schon gut ist und bleibt: der gemeinsame flache Auswahl-Stil am Dateiende (app.css:3122–3134), das Schalter-Design `.switch` (README Z. 224), die Richtungs-Umschalter `.dir-switch`, Knopf und Feld mit gleicher Höhe (41,6 px), die Verschachtelung der Radien in Schienen (außen 12, innen 9 bei 3 px Innenabstand).

---

## 1. Zielzustand

### 1.1 Grundsätze

1. Jede Rolle hat genau eine Bauart. Zwei gleiche Rollen sehen gleich aus, auch wenn sie in verschiedenen Bereichen stehen.
2. Grün nur für Gewinn, „positiv/eingehalten“ und den Akzent-Knopf „Trade loggen“. Keine grüne Markierung einer Auswahl, eines Hover-Zustands oder eines Rahmens.
3. Gewählt = flach: leicht angehobene Fläche, feiner Rand (gemeinsame Regel app.css:3125), kein Schein, kein Schatten, kein Fettdruck.
4. Gewichte: Steuerelemente 500 (Knöpfe, Reiter, Segmente, Chips, Menüeinträge), Beschriftungen von Feldern 600 (wie heute `.field > label`), Titel 600, Werte und Hauptknöpfe 700 bzw. heutiges Gewicht von `.btn.primary`/`.btn.accent`.
5. Keine Gestaltung per Inline-Style. Inline bleiben nur dynamische Werte (`--p`, Breiten in %, Farben aus Daten).

### 1.2 Höhen der Steuerelemente

| Stufe | Höhe | Gilt für |
|---|---|---|
| md | 41,6 px (natürlich: `.btn` Padding 10/16, `.input` 10/12, Zeilenhöhe 1,45) | `.btn`, `.input`, `.select`, Datums- und Zeitfelder (nach C04 ebenfalls 41,6) |
| md in der Kopfreihe | **42 px fest** | alle Knöpfe direkt in `.dash-head > .row` (Text- und Symbolknöpfe), `.btn.icon-only` 42×42, Reiter-Schiene außen 42, Segment-Schiene außen 42, `.dir-switch` 42 |
| sm | **34 px** | `.btn.sm` (34,1), neu `.input.sm` 34, `.select.sm` 34 (heute 32,1), Pfeilknopf `.btn.nav` 34×34 |
| xs | 27,4 px | `.btn.xs` (unverändert) |
| Chip | **28 px** | wählbare Chips `.chip.sel`, `.fd-chip`, `.fd-add`, `.nb .tagpill` |
| Etikett in Tabellen | **22 px** | `.badge`, `.pill` (unverändert) und neu Chips in `.tbl` und `.detail-head` |
| Menüeintrag | **min. 36 px** | `.popover .item`, `.sym-opt`, `.fd-opts .item`, `.tpl-row .item.name`, `.sb-menu .item` |

Symbolknöpfe in Karten, Listen und Dialogköpfen bleiben `.btn.icon` 36 bzw. `.btn.icon.sm` 30. Jedes SVG in einem Knopf ist 16×16 und schrumpft nie (`flex: 0 0 auto`).

### 1.3 Knöpfe

**Varianten (keine weiteren):** Standard `.btn` (Rahmen), `.btn.ghost`, `.btn.danger`, `.btn.accent` (nur „Trade loggen“ in der Kopfreihe und als runder Knopf am Handy), `.btn.primary`.

**Wo `.btn.primary` erlaubt ist (abschließend):**
1. im Fuß eines Dialogs (`.modal-foot`) und im Zertifikat-Dialog („PNG herunterladen“, certificate.js:88), im Sprachjournal-Dialog (voice.js:49, 70);
2. im Fuß eines Popovers oder schwebenden Panels: Zeitraum (`.rr-foot`), Filter (`.fd-foot`), Farbwähler (colorpicker.js:44), Notebook-Filter (notebook.js:47), „OK“ im Symbol-Menü (app.js:393), „Als Video einbetten“ (editor.js:130), „Hinzufügen“ in der Widget-Bibliothek (dashboard.js:63, e2e hängt daran);
3. als Absenden des Formulars, das den Hauptinhalt einer Seite bildet: Coach-Beitritt „Beitreten“/„Als Co-Coach beitreten“ (coach.js:178, 197), Einstellungen → Mentor „Speichern“ (misc.js:158), Mentor-Chat „Senden“ (mentor.js:84), Bearbeitungsleiste des Dashboards „Speichern“ (dashboard.js:119);
4. Blind-Replay (replay.js) bleibt unverändert (versteckt).

Alles andere ist neutral: Auslöser (Anlegen, Hinzufügen, Öffnen, Aufnehmen, Starten, Einrichten, Wiederherstellen, Markieren) und Absenden von Inline-Formularen in Karten (Regel hinzufügen, Aufgabe geben, Notiz senden, Antwort, Ausgabe/Payout erfassen, E-Mail speichern, Notiz-Bearbeitung speichern).

**Anlegen-Auslöser:** Plus-Symbol, neutral. Auf Seitenebene (Kopfreihe, `.set-head`) `btn`, in Karten- und Spaltenköpfen `btn sm`. Inline-Anlegen = Feld und Knopf in einer Zeile, Knopf `btn` (gleiche Höhe wie das Feld).

**Leerzustände:** Aktion immer `btn sm` (neutral), auch „Trade loggen“ und „Konto anlegen“.

**Farbe von `.btn.primary`:** offen, siehe Frage N1. Bis zur Antwort bleibt die Fläche grün, aber ohne Schein beim Darüberfahren.

**Pfeilknöpfe (Vor/Zurück):** genau ein Baustein `.btn.nav`: 34×34, Rahmen wie `.btn`, Radius 9, Symbol 16. Gilt für Tagesansicht, Kalender-Widget, Zertifikat, Aktivitäts-Heatmap, Seitenwahl (TradeLog, Schatten-Ich). Im Zeitraum-Popover bleibt `.rr-nav` ein randloser Knopf, aber 32×32. `.btn.round` entfällt.

**Kopfreihe:** alle Knöpfe 42 px hoch, Symbolknöpfe 42×42 (mit Zähler darf der Knopf breiter werden: `min-width`). „Session starten“ ab 1181 px mit Text „▷ Session starten“, darunter nur Symbol (42×42). Das Dashboard bleibt ohne Session-Knopf (README Z. 64–65).

### 1.4 Eingabefelder

- **Beschriftung:** jede Feldbeschriftung ist `<label>` oder `<span class="lbl">` direkt in `.field`: 12px/600 `--muted`. Keine unklassierten `<span>`, keine Sonderfarben (`.cert-opts .lbl`), keine Sondergrößen (`.prop-rule-f .field span`, `.fd-l`).
- **Zahlenfelder:** nie Browser-Pfeile, global für jedes `input[type=number]`. Pfeiltasten und Tippen bleiben. Eigene Pfeile nur im Regelwerk (`.sr-step`).
- **Einheit im Feld:** eine Bauart `.inp-cur` (Helfer `App.unitField`): Währung nach Sprache davor ($) oder dahinter (€), `%` immer dahinter. Zeichen 13px/500 `--muted`, 12 px vom Feldrand, Feldtext rückt um `18px + Zeichenbreite` ein. Ausnahme: Regelwerk (`.sr-num`/`.sr-unit`), weil die Einheit dort wählbar ist.
- **Datums- und Zeitfelder:** gleiche Höhe wie Textfelder (41,6). Uhrzeitfelder (`type=time`) öffnen denselben App-Wähler wie Datumsfelder (nur die Stunden- und Minutenspalten).
- **Kleine Felder:** `.input.sm` und `.select.sm` 34 px, Schrift 12.5px, Radius 9 (wie `.btn.sm`).
- **Einzeilige Textareas** (Antworten, Notizen im Coach) ohne Größen-Griff, wachsen mit dem Inhalt bis 160 px.

### 1.5 Auswahl-Steuerelemente

- **Ja/Nein-Einstellung:** immer `.switch` über `switchRow`, speichert sofort.
- **Häkchen in Formularen** (Mehrfachauswahl in Listen, z. B. Zertifikat-Optionen, Trade-Zuordnung): natives Kästchen 16 px mit `accent-color: var(--text)` (dunkel: helle Box, dunkler Haken; hell: dunkle Box, heller Haken). Radios ebenso, sie bleiben rund.
- **Abhak-Zeilen** (Checklisten, Coach-Aufgaben, „Bewusst abschalten“ im Ruhepunkt): eigene Box 20×20, Radius 6, Rand 1,5 px `--border-2`. Erledigt/eingehalten = gefüllt (`--accent`, im Ruhepunkt `--phase`), weil das „positiv“ bedeutet. Text bleibt in Textfarbe, nie durchgestrichen. Nur-Anzeige-Kästchen (Mentor sieht Aufgaben) ohne Rand.
- **Quill-Checklisten** im Notebook: Kästchen in `--text-2`, nicht grün.
- **Einzelauswahl (Segment):** `.seg` ist eine Schiene: Behälter `--surface-2`, Rand `--border`, Radius 12, Innenabstand 3, Lücke 2; Tasten 34 px hoch, Padding 0 14px, Radius 9, 13px/500 `--text-2`, transparenter 1-px-Rand, Übergang 150 ms. Gewählt über die gemeinsame flache Regel. Darf umbrechen (`flex-wrap: wrap`), damit nichts überläuft. Varianten: `.seg.mini` (24 px Tasten, Dashboard-Größen), `.fd-seg` (Filter, Werte angeglichen).
- **1–5-Skalen:** ein Baustein `.scale5`: 32×32-Tasten, Radius 8, Rand `--border`, Fläche `--surface`, 13px/500 `--text-2`, Lücke 6. Check-in gewählt neutral. Bewertung `.scale5.rating` mit ★, kumulativ markiert, gewählt in `--warn` (hat Bedeutung). Filter-Sterne `.fd-tog.stars` bleiben Mehrfachauswahl.
- **Wählbare Chips:** 28 px, Padding 0 10px, Radius 999, 12px/500. Gilt für `.chip.sel`, `.fd-chip` (Padding 0 4px 0 11px wegen ×), `.fd-add`, `.nb .tagpill` (Zähler 11px/500). Keine große Chip-Variante.
- **Etiketten in Tabellenzeilen:** alle 22 px hoch (Status-Pille, Long/Short-Abzeichen, Setup-/Fehler-Chip).

### 1.6 Reiter

Zwei Formen, nach Ebene:

| Form | Wofür | Maße |
|---|---|---|
| **Schiene** (`.tabs`, `.prop-tabs`) | Bereichs-Navigation auf Seitenebene: TradeLog-Ansichten, Statistik-Reiter, Prop-Bereiche, Affiliate-Umschalter | Behälter `inline-flex`, Lücke 2, Innenabstand 3, Rand `--border`, Radius 12, Fläche `--surface`, außen 42 px; Einträge 34 px hoch, Padding 0 12px, Radius 9, 13.5px/500 `--text-2`, transparenter Rand; Hover `--text` auf `--surface-2`; gewählt gemeinsame flache Regel; kein Scrollbalken |
| **Unterstrich** (`.subtabs`, `.set-tabs`, `.prop-sub`) | Unteransichten (Prop Bilanz/Friedhof, Einstellungen Kategorien/Tags, Imports/Verlauf) und Umschalter in Karten („Letzte Trades / Offene Positionen“) | Linie unten 1 px `--border`, Lücke 22; Einträge Padding 2px 1px 11px, 13.5px/500 `--muted`; Hover und gewählt `--text`; Linie 2 px `var(--text)`, gleitet über `scaleX` ein |

Keine Reiter aus `.btn`-Knöpfen, keine grüne Linie oder Schrift, kein Gewicht 600.

### 1.7 Menüs und schwebende Ebenen

- **Menüeintrag:** min. 36 px, Padding 0 10px, Lücke 10, 13px/500 `--text`, Radius 8, Symbol 16 px `--muted` (Gefahr-Einträge: Symbol in Eintragsfarbe). Gilt für `.popover .item`, `.sb-menu .item`, `.sym-opt`, `.tpl-row .item.name`, `.tpl-menu .item`, `.fd-opts .item`. Abschnittsköpfe `.popover .sec` bündig (Padding links 10).
- **Gewählter Eintrag:** `color: var(--text); background: var(--surface-2)`, kein eigenes Gewicht, kein Grün (Vorbild `.sb-menu .item.on`).
- **Haken:** nur in Listen mit Einzelwahl, die als Liste stehen (Vorlagen, Konto, Notebook-Tags, Editor-Menüs): linke Spalte 16 px, Haken 16 px in `--text-2`; die Spalte bleibt auch ohne Haken frei. Zeitraum-Vorgaben und Symbol-Liste ohne Haken.
- **Ebenen:** alle schwebenden Menüs und Wähler Radius 12, Rand `--border-2`, `--shadow`; Menüs Innenabstand 6, Werkzeuge (Datum, Farbe) 12. Kein Kasten im Kasten (Vorlagen-Untermenü als eingerückte Gruppe mit Linie). Tooltip `#tip` bleibt 9 px.
- **Popover-Fuß:** links Meta-Text 13px `--muted`, rechts `btn sm ghost` „Zurücksetzen“ (nur wenn etwas gesetzt ist) und `btn sm primary` „Anwenden“. Gilt für Zeitraum und Filter.

### 1.8 Kacheln, Karten, Tabellen, Kalender

- **Kacheln** sind nicht klickbar und reagieren beim Darüberfahren nur mit dem Rand (`--border-2`), ohne Anheben und Schatten. `.stat-tile` übernimmt die Maße von `.tile`: Padding 12px 15px, Titel 13.5px/500 `--text-2`, Wert 25px/700, Laufweite −0,02em, Zeilenhöhe 1,1, am Handy 22 px, im hellen Design derselbe Schatten wie `.tile`. Die Kennzahlen-Kachel mit Verlauf (`.spark-tile`) hat dieselbe Trennlinie und Wertgröße wie alle Kacheln. Kennzahlen-Leisten (`.kstrip`) haben im hellen Design nur Haarlinien.
- **Karten:** keine Unterkarten. Werte in einer Karte stehen flach nebeneinander (Kennzahlen-Optik `.day-card .stats`), Listen sind durch Haarlinien getrennt.
- **Tabellen in Karten:** immer `tbl-wrap inset` (kein zweiter Rahmen). Eine Tabelle steht nie ohne Karte auf der Seite. Symbol und Richtung stehen in zwei Zellen unter einer gemeinsamen Überschrift (README Z. 46–47).
- **Kalender:** Wochentage als reine Beschriftung (12px/500 `--muted`, ohne Rand und Fläche). Tageszahl ohne Kreis (12px/500 `--muted`, an Handelstagen `--text-2`). Nur „heute“ hat einen gefüllten Kreis: `--text` als Fläche, `--bg` als Schrift, 600. Heute-Marker in Rastern (Aktivität, Regel-Tracker, Jahresübersicht): Ring 1,5 px `--text-2`. Jahreskalender-Kopf wie Wochentage.
- **Tageskarten (TradeLog → Tage)** und Tagesansicht zeigen dieselben acht Kennzahlen aus einer Funktion (`App.dayStatsHTML`); das Wort „Netto“ ist gedämpft, nur der Betrag trägt die Farbe.

### 1.9 Leerzustände und Ablageflächen

- **Leerzustand:** Symbol 34 px `--faint` (nur das direkte Kind), Titel 15px, ein Satz, darunter mit 16 px Abstand die Aktion (`btn sm`). Symbole in Knöpfen bleiben 16 px.
- **Dropzone:** Symbol 24 px `--muted`, Padding 20px 16px, Hover/Ziehen: Rand `--text-2`, Fläche `--surface-2`, Schrift `--text` (kein Grün).
- **Leere Tabellen** (Logs): keine Spaltenköpfe über einem Leerzustand; der Kasten (`.tbl-wrap`) bleibt.

### 1.10 Links, Symbole, Tooltips, Avatar

- **Textlink** im Fließtext oder in Metazeilen: `.tlink` = `--text-2`, feine Unterstreichung `--border-2` (Versatz 3 px), Hover `--text`. Links mit ↗-Symbol (Coupons) ohne Unterstreichung, aber in `--text-2`.
- **Symbol-Bedeutungen:** Aktualisieren, Abgleichen, Neu laden, Link erneuern = `I.refresh`. `I.replay` nur für Blind-Replay. Hinzufügen/Geben = `I.plus`. Sortieren = `I.sort` (neu). Auswählen-Modus = `I.checkSquare` (neu). Auf- und Zuklappen = CSS-Chevron wie `.rp-more summary::after`, nie Textzeichen ▸/▾.
- **Tooltips in der Seitenleiste:** kein `title`, der sichtbaren Text wiederholt. Eingeklappt erscheint der App-Tooltip (`#tip`) rechts neben dem Eintrag, mittig. Hinweis-Punkte nutzen `data-tip` statt `title`.
- **Avatar und Konto-Karte** zeigen dieselben Initialen aus einer Funktion `App.displayName()`.

### 1.11 Einstellungen: Speichern

Alle Einstellungen außer Mentor speichern sofort beim Ändern (Ereignis `change`, also beim Verlassen des Feldes). Rechts im Bereichskopf (`.set-head`) erscheint 1,5 s lang „Gespeichert“ (12px `--muted`). Es gibt keine „Speichern“-Knöpfe mehr in Profil, Privatsphäre, Trading und Notebook. Mentor bleibt ein Formular mit „Speichern“ und „Verbindung testen“.

### 1.12 Wortwahl der Komponenten

Regeln: dasselbe Ding hat überall denselben Namen (Dialogtitel = Knopf = Leerzustand); Menüeinträge passen in eine Zeile (höchstens ca. 28 Zeichen); Bereichsangaben mit Halbgeviertstrich ohne Leerzeichen („1–10“); Einheiten stehen im Feld, nicht im Label.

| Stelle | vorher | nachher |
|---|---|---|
| Prop-Kopfreihe (prop.js:294) | „+ Prop-Konto“ | „+ Konto anlegen“ |
| Verpasst-Dialog (trades.js:110) | „R-Multiple“ | „R“ |
| Verpasst-Dialog | „Hätte gebracht (P&L)“ | „Hätte gebracht“ |
| Coach-Gruppenmenü (coach.js:115) | „Neuen Einladungslink erzeugen“ | „Einladungslink erneuern“ |
| Bestätigung (coach.js:284) | „Neuen Einladungslink erzeugen?“ / Knopf „Neuen Link erzeugen“ | „Einladungslink erneuern?“ / „Erneuern“ |
| Toast (coach.js:285) | „Neuer Einladungslink“ | „Einladungslink erneuert“ |
| Co-Coach-Fenster (coach.js:265) | „Neuen Link erzeugen“ | „Link erneuern“ |
| Toast (coach.js:349) | „Neuer Co-Coach-Link“ | „Co-Coach-Link erneuert“ |
| Konto-Karte (app.js:229) | „Profil vervollständigen“ | „Profil ergänzen“ |
| Einstellungen → Trading (misc.js:199) | „Tagesverlustlimit (% vom Konto)“ | „Tagesverlustlimit“ (Feld zeigt „%“) |
| Einstellungen → Trading | „Ruin-Schwelle Monte Carlo (% Drawdown)“ | „Ruin-Schwelle (Drawdown)“ (Feld zeigt „%“) |
| Einstellungen → Trading, Segment „Einheit“ | „% / EUR“ | „% / €“ (Zeichen statt Code, `fmt.curSym`) |
| Logs-Suche (misc.js:259) | Platzhalter „Typ suchen“ | „Verlauf durchsuchen“ |
| Logs, Suche ohne Treffer | „Noch kein Verlauf“ | „Keine Einträge gefunden“ (leerer Verlauf behält „Noch kein Verlauf“) |
| Statistik → Tage (stats.js:32) | (kein Titel) | Karte „Alle Handelstage“ |
| Tageskarten (trades.js:54) | „Netto +591,83 €“ ganz eingefärbt | „Netto“ gedämpft + Betrag farbig |
| Seitenwahl (trades.js:48, shadow.js:73) | „1 – 10 von 10 Trades“ | „1–10 von 10 Trades“ (ebenso „Verstößen“) |
| Ordner-Dialog (notebook.js:116) | Platzhalter „z. B. 📈 Strategie“, Beschriftung „eigene“ | „z. B. Strategie“, Farbkreis mit Plus und Tooltip „Eigene Farbe“ |
| Beispiel-Ordner (sample.js:284) | „📈 Strategie“, „💡 Ideen“ | „Strategie“, „Ideen“ |
| Notebook-Tag-Menü (notebook.js:77) | Eintrag „Neuen Tag anlegen“ (öffnet Dialog) | Suchfeld „Tags suchen“; ohne Treffer oben „„{Name}“ als Tag anlegen“ |
| Teilen-Dialog (notebook.js:170) | dreizeiliger Hinweis | „Wer den Link öffnet, sieht die Notiz nur lesend. Bilder erscheinen als Platzhalter.“ (Satz zur veröffentlichten Website nur bei `file:`) |
| Vorlagen-Menü (dashboard.js:33) | „Ist Standard“ (deaktiviert) | Eintrag entfällt; „Als Standard festlegen“ nur bei Nicht-Standard; neuer Eintrag „Bearbeiten“ im Untermenü |
| Ruhepunkt-Rhythmus (ruhepunkt.js:55–58) | „Durch die Nase einatmen“ / „Kurz nachziehen“ / „Lang durch den Mund ausatmen“ in der Leiste | Kurzlabels „Einatmen“ / „Nachziehen“ / „Ausatmen“ (Langtext bleibt in `.rp-phase` und „Danach: …“) |
| Fehlermeldungen Verpasst-Dialog | (still Long gespeichert) | Toast „Symbol fehlt“ bzw. „Long oder Short wählen“ (wie Trade-Dialog) |

Übersetzung: Jeder neue oder geänderte deutsche Text bekommt einen Eintrag in `js/lang/{en,es,zh,hi,pt}.js`, wenn der alte Text dort einen Eintrag hatte oder der Bereich zu Etappe 1 gehört (Navigation, Dashboard, TradeLog, Trade-Editor, Kopfreihen, Einstellungen, Coach). Englische Werte siehe Schritt L1.

---

## 2. Konflikte und Entscheidungen

| # | Befunde | Widerspruch | Entscheidung und Grund |
|---|---|---|---|
| K1 | komponenten-1, bereich_konto-5, (Gruppe Farbe: referenz-6) | komponenten-1 will `.btn.primary` global auf Textfarbe umstellen, der Prüfer von bereich_konto-5 lehnt die globale Umstellung ohne Nutzer ab, Gruppe Farbe schlägt `--surface-3` vor. | Aufgeteilt: Regel „wo primary erlaubt ist“ und das Herabstufen aller Auslöser werden jetzt umgesetzt (gilt bei jeder Farbe), der Schein beim Darüberfahren fällt jetzt weg (Vorgabe „kein Glow“). Die Füllfarbe ist Frage N1 (eine gemeinsame Frage mit Gruppe Farbe). |
| K2 | komponenten-30, bereich_konto-5, komponenten-1 (Prüfer: prop.js:262/266 bleiben), Gruppe Farbe bereich_prop-16 | Inline-Absenden einmal `btn primary` (Regel „Hinzufügen“), einmal neutral („Aufgabe geben“), Prop-Formulare einmal primary, einmal neutral. | Inline-Formulare in Karten senden neutral ab (`btn` bzw. `btn sm`). Grund: sonst stehen auf einer Seite viele primäre Knöpfe (Coach: 28× „Notiz senden“), und die Regel bleibt ohne Ausnahmen prüfbar. |
| K3 | komponenten-25, komponenten-12, komponenten-11, bereich_dashboard-26 | komponenten-25 will einen eckigen Pfeilknopf, komponenten-12 und -11 wollen `.round` behalten, bereich_dashboard-26 will Pfeile so hoch wie „Heute“ (34). | Ein eckiger Baustein `.btn.nav` 34×34, Radius 9. Grund: vier Bauarten sind der eigentliche Fehler; die runde Form ist in der README nicht festgelegt und ist neben eckigen `btn sm` („Heute“, „Zertifikat“) der Ausreißer. 34 statt 32, weil die Pfeile fast immer neben `btn sm` stehen; die Seitenwahl erreicht 34 über `.select.sm` 34. |
| K4 | referenz-23, komponenten-27, bereich_statistik-6 | referenz-23: alle Seitenreiter als Schiene, `.tabs.sm` als kleine Schiene; komponenten-27: Reiter in Karten als Unterstrich; bereich_statistik-6: eigene Klasse `rail`, Padding 7/14 bzw. 7/12. | Zwei Formen nach Ebene (Schiene = Seitenebene, Unterstrich = Unterebene und Karten). Klassen bleiben (`.tabs`, `.prop-tabs`, `.set-tabs`, `.prop-sub`), weil e2e daran hängt; neue neutrale Klasse `.subtabs` nur für den Karten-Umschalter. Einträge 34 px hoch mit Padding 0 12px: so passen die 9 Statistik-Reiter bei 1024 px, und die Schiene ist außen 42 px wie die Knöpfe in derselben Prop-Kopfreihe (heute 43,6 neben 41,6). |
| K5 | zustaende-14 (Vorschlag und Prüfer), Gruppe Farbe bereich_trades_tag-21 | Zweites „Trade loggen“ im TradeLog-Leerzustand entfernen oder als `btn sm accent`; Schatten-Ich „Trade loggen“ als Akzent. | Alle Leerzustand-Aktionen `btn sm` neutral, beide Knöpfe im TradeLog bleiben. Grund: eine Regel ohne Ausnahme; Grün trägt nur der Hauptknopf in der Kopfreihe. |
| K6 | ki_look-11 (Vorschlag vs. Prüfer), Gruppe Farbe referenz-8/farbe_kontrast-24 | „Heute“ als `--surface-3`-Kreis oder als `--text`-Kreis. | `--text`-Fläche, `--bg`-Schrift, 600. Grund: einziger gefüllter Kreis, deutlich ohne Farbe; identisch mit Gruppe Farbe. Kreisgröße 24 px und Lage bleiben, damit die Winrate `.wr` auf gleicher Höhe bleibt. |
| K7 | ki_look-11 | „800 → 700“ beim Tagesbetrag widerspricht README Z. 191 („Onest 800“). | Nicht umsetzen, Frage N2. |
| K8 | bereich_training-41 (Vorschlag, Prüfer) | Kurzlabels „Ein/Aus“ + 72 px oder „Einatmen/…“ + `max-content`. | „Einatmen“, „Nachziehen“, „Ausatmen“ und `min-width: max-content`. Grund: „Aus“ ist als Übersetzungsschlüssel mehrdeutig (Off); „Einatmen/Ausatmen“ gibt es schon in den anderen Rhythmen; `max-content` verhindert Überlauf ohne feste Breite (390 px: 52+62+54 px passen). |
| K9 | bereich_prop-52 (Vorschlag vs. Prüfer) | Eigenes Textfeld nur im Prop-Dialog oder Zeit-Modus im App-Kalender. | Zeit-Modus in `datepicker.js` für alle `type=time` (prop.js:149, shadow.js:38, dash-filter.js:125–126). Grund: sonst ein drittes Bedienmuster für Uhrzeiten. Die 24-h-Anzeige im Feld kommt aus der Anzeige-Überlagerung der Gruppe Wortwahl (wording-2/zustaende-20) und wird dort umgesetzt. |
| K10 | bereich_statistik-8 (Vorschlag vs. Prüfer) | Baustein tauschen (`U.tile`) oder nur Maße angleichen. | Nur Maße angleichen, dazu Padding und Handy-Wert (22 px, Test mobiletest.js:27 auf „22px“ anpassen). Grund: der Tausch bricht sixtest/motiontest/mobiletest und bringt die Verlaufslinie als neue Dekoration. |
| K11 | bereich_notebook_news-31 (Vorschlag vs. Prüfer) | Grün durch `#2bb3a3` ersetzen oder streichen; Standard für neue Ordner. | Grün streichen (8 Farben), Standard neuer Ordner fest `#8b7cf6`. Grund: `#2bb3a3` wirkt selbst grün; ohne festen Standard würde Index 3 Rot (Verlustfarbe). |
| K12 | bereich_dashboard-47 (Vorschlag vs. Prüfer) | Stift in der Vorlagenzeile streichen oder ins Untermenü. | Ins Untermenü „…“ als „Bearbeiten“. Grund: der Stift bearbeitet auch nicht aktive Vorlagen; Streichen nähme eine Funktion weg. |
| K13 | komponenten-16, bereich_trades_tag-10, komponenten-17 | „€“ 12 oder 14 px vom Rand. | 12 px, und „$“ davor ebenfalls 12 px (heute 14). Grund: Feldtext steht 12 px vom Rand; beide Seiten spiegeln sich. |
| K14 | referenz-5 (Vorschlag vs. Prüfer), hierarchie-46 | Neue Klasse `ses-start` mit `hide-m` oder eine Variante ohne `hide-m`. | Variante ohne `hide-m` mit `.lbl-wide` (Prüfer-Fassung). Grund: `hide-m` blendet den ganzen Knopf am Handy aus. |
| K15 | responsiv-23 (Vorschlag vs. Prüfer) | CSS-Anker oder Wahl des angezeigten Monats in JS. | JS (`oneMonth()`), CSS bleibt. Grund: bei gespeichertem eigenem Zeitraum würde der CSS-Weg den Fehler nur umdrehen. |
| K16 | komponenten-21 (Prüfer-Fassungen) | Das × im Filterkopf streichen oder behalten; Titelgröße 13/14,5/15. | × bleibt (am Handy fast bildschirmfüllend, filtertest.js:39). Titelgröße regelt die Typografie-Spezifikation (typografie-18), hier unverändert. |
| K17 | bereich_einstellungen-35, komponenten-17 | `.input-unit` mit „%“ davor und 160 px, oder `.inp-cur`. | `.inp-cur` mit „%“ dahinter; die beiden %-Felder behalten die Rasterbreite (sie stehen in `.form-grid` neben „Monte-Carlo-Durchläufe“). Von/Bis/1 R behalten 160 px über `.inp-cur.w160`. |
| K18 | komponenten-33 (Vorschlag vs. Prüfer) | Checklisten-Box 20 → 16 px; eigener Checkbox-Nachbau `.cbx`. | Box bleibt 20 px (ganze Zeile ist Schalter), kein Nachbau; native Häkchen nur über `accent-color: var(--text)`. |
| K19 | bereich_training-1, hierarchie-37 | KI-Hinweis linksbündig oder zentriert. | Linksbündig auf der 18-px-Kante des Eingabefeldes. |
| K20 | bereich_dashboard-11; Gruppe Bewegung bewegung-18/komponenten-13 | Token `--lift-shadow` löschen. | Token bleibt, `css/landing.css:56` nutzt es. Kalendertage und Tracker-Zellen behalten ihre Hover-Rückmeldung (sie sind klickbar); das allgemeine Knopf-Anheben regelt Gruppe Bewegung. |
| K21 | komponenten-36, komponenten-45 | `.chip { height: 28px }` würde Tabellen-Chips (22 px) blockieren. | Feste 28 px nur für wählbare Chips (`.chip.sel`); Anzeige-Chips in Tabellen und im Detailkopf 22 px. |
| K22 | bereich_dashboard-45 (Vorschlag 500, Prüfer 600) | Gewicht der Regel-Tracker-Beschriftung. | 500 (README: Kachel-Titel 500). |
| K23 | referenz-20, bereich_trades_tag-13, Gruppe Barrierefreiheit bereich_trades_tag-41 | Alle ändern `.checklist .it`. | Reihenfolge: zuerst die Knopf-Umstellung aus bereich_trades_tag-41 (falls sie `border: 0` setzt), danach C18 (Linie unten). C18 steht im Stylesheet nach jeder Zurücksetzung. |
| K24 | komponenten-26, komponenten-44 | `.seg.pill` als Ausnahme der Schiene. | `.seg.pill` entfällt ganz, der Check-in nutzt `.scale5`. `.seg.segc` ist toter Code (grep: keine Verwendung in js/ und HTML) und wird gelöscht. |
| K25 | komponenten-2, bereich_notebook_news-20 | Gewählte Tags in `--text`, Haken `--text` oder `--text-2`. | Text `--text`, Haken `--text-2` (wie alle Menü-Haken). |
| Dubletten | abstaende_layout-3 = aufbau-1 = bereich_shell-1 (Menü-Knopf); zustaende-1 = bereich_trades_tag-2 = bereich_prop-42 = bereich_training-31 (Leerzustand-Symbole); komponenten-16 = bereich_trades_tag-10 (Zahlenfelder); hierarchie-28 + responsiv-46 (Prop-Kopfknopf); referenz-23 + bereich_statistik-6 + komponenten-27 (Reiter); komponenten-11 + bereich_dashboard-26 (Kopfreihe); komponenten-26 + bewegung-25 (Segment); bereich_einstellungen-11 + -2 (Einstellungen) | — | Jeweils ein gemeinsamer Schritt, alle ids dort genannt. |

---

## 3. Umsetzungsschritte

Reihenfolge: erst app.css (Grundlagen → Komponenten → Einzelstellen), dann JS-Dateien (Helfer in ui.js/app.js zuerst, dann Bildschirme), dann Sprachdateien, README, e2e. Jeder Schritt nennt die erledigten Befund-ids.

### 3.1 web/css/app.css

#### A. Grundlagen und Skalen

**C01 – Symbole in Knöpfen schrumpfen nicht** (bereich_notebook_news-37)
Z. 271 `.btn svg { width: 16px; height: 16px; }` → `.btn svg { width: 16px; height: 16px; flex: 0 0 auto; }`

**C02 – Zahlenfelder ohne Browser-Pfeile, global** (komponenten-16, bereich_trades_tag-10)
Nach Z. 294 (`.input::placeholder`) einfügen, ohne Klassenbindung:
```css
input[type=number] { -moz-appearance: textfield; appearance: textfield; }
input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
```
Danach streichen: in Z. 1093 nur `-moz-appearance: textfield;`; die ganzen Zeilen 1094, 2238, 2239, 2416 (`.sr-num .input { -moz-appearance… }`) und 2418. Kommentar Z. 2415 und `.sr-step` bleiben.

**C03 – sm-Stufe 34 px für Felder** (bereich_konto-9, komponenten-14)
Nach Z. 296 (`.select {…}`) einfügen: `.input.sm { height: 34px; padding: 0 10px; font-size: 12.5px; border-radius: 9px; }`
Z. 1653 `.select.sm { … padding: 6px 28px 6px 10px; … }` → `padding: 7px 28px 7px 10px;` (ergibt 34,1 px; übrige Angaben bleiben). `.rep-type` (Z. 1708, eigene Höhe 36) bleibt.

**C04 – Datums- und Zeitfelder so hoch wie Textfelder** (komponenten-14)
Bei den `::-webkit-datetime-edit`-Regeln (um Z. 392–405) ergänzen: `.input::-webkit-datetime-edit-fields-wrapper { padding: 0; }`

**C05 – Eine Feld-Beschriftung** (komponenten-18)
- Z. 1381 `.fd-l { … font-size: 12.5px; font-weight: 600; color: var(--text-2); … }` → `font-size: 12px; font-weight: 600; color: var(--muted);`
- Z. 1360 `.fd-pop .fd-l { font-size: 11.5px; }` löschen.
- Z. 1964 `.cert-opts .lbl { display: block; font-size: 12px; font-weight: 600; color: var(--text-2); margin-bottom: 6px; }` → `.cert-opts .lbl { display: block; margin-bottom: 6px; }`
- Z. 2723 `.prop-rule-f .field span { … }` löschen.
(JS-Teil in U2, D3, P2.)

#### B. Komponenten

**C06 – Hauptknopf ohne Schein** (komponenten-1)
Z. 275 `.btn.primary:hover { background: var(--accent-2); border-color: var(--accent-2); box-shadow: 0 8px 20px -10px var(--accent-glow); }` → `.btn.primary:hover { background: var(--accent-2); border-color: var(--accent-2); box-shadow: none; }`
(Die Füllfarbe Z. 274 erst nach Antwort auf N1 ändern.)

**C07 – Ein Pfeilknopf** (komponenten-25, bereich_dashboard-26, komponenten-12)
- Z. 284–285 `.btn.round { … }` und `.btn.round.accent { … }` ersetzen durch:
```css
.btn.nav { width: 34px; height: 34px; padding: 0; border-radius: 9px; justify-content: center; flex: 0 0 auto; }
```
- Z. 352 `.rr-nav { width: 30px; height: 30px; …}` → `width: 32px; height: 32px;` (Rest bleibt).
- Z. 1749–1753 (`.pager .pg-nav { …border…overflow… }`, `.pager .pg-nav button {…}`, `button + button`, `:hover`, `:disabled`) ersetzen durch `.pager .pg-nav { display: inline-flex; gap: 4px; }`. Z. 1754 `.pager .pg-nav svg` löschen (16 px kommt aus `.btn svg`).

**C08 – Kopfreihe 42 px** (komponenten-11, bereich_dashboard-26, referenz-5)
- Nach Z. 1327 (`.dash-head .dh-sep`) einfügen:
```css
.dash-head > .row > .btn, .dash-head > .row > .popwrap > .btn { height: 42px; }
.dash-head > .row > .btn.icon, .dash-head > .row > .popwrap > .btn.icon { min-width: 42px; padding: 0 12px; }
```
- Z. 1328 `.btn.icon-only { width: 40px; padding-left: 0; padding-right: 0; justify-content: center; }` → `.btn.icon-only { width: 42px; height: 42px; padding: 0; justify-content: center; }`
- Nach Z. 1330 (`.vh`) für „Session starten“ einfügen:
```css
@media (max-width: 1180px) { .btn > .lbl-wide { display: none; } .btn:has(> .lbl-wide) { width: 42px; padding-left: 0; padding-right: 0; } }
```
- Im Block `@media (max-width: 560px)` am Dateiende ergänzen: `.dash-head [data-action="dash-f-open"] { height: 42px; min-width: 42px; padding: 0 12px; }`
(Der runde Knopf am Handy wird in C35 mit höherer Spezifität auf 54 px gesetzt.)

**C09 – Einzelfälle der Knöpfe auf die Stufen zurückführen** (komponenten-12)
- Z. 1678 `.tracker-foot > .btn { flex: 0 0 auto; padding: 8px 12px; font-size: 12.5px; }` → `.tracker-foot > .btn { flex: 0 0 auto; }` (Markup wird `btn sm`, W6).
- Z. 1470 `.fw-go { … padding: 11px 16px; … }` → Angabe `padding` streichen.
- Z. 1492 `.btn.fw-reset { … padding: 11px 14px; font-weight: 600; }` → `padding` streichen, `font-weight: 500`.
- Z. 2576 `.voice-actions .btn.big { … }` löschen.
- Z. 2530 `.replay-decide .btn.big { padding: 13px 26px; font-size: 15px; border-radius: 14px; min-width: 132px; justify-content: center; }` → `.replay-decide .btn.big { min-width: 132px; justify-content: center; }`
- Filter-Fuß siehe C24.

**C10 – Menü-Knopf nur am Handy** (abstaende_layout-3, aufbau-1, bereich_shell-1)
- Z. 224 `.menu-btn { display: none; }` → `.topbar .menu-btn { display: none; }`
- Z. 923 (im Block `@media (max-width: 960px)`) `.menu-btn { display: inline-flex; }` → `.topbar .menu-btn { display: inline-flex; }`

**C11 – Leerzustand** (zustaende-1, bereich_trades_tag-2, bereich_prop-42, bereich_training-31, zustaende-14)
- Z. 676 `.empty svg { width: 34px; height: 34px; color: var(--faint); }` → `.empty > svg { width: 34px; height: 34px; color: var(--faint); }`
- Z. 677 `.empty b { color: var(--text); font-size: 15px; }` → `.empty > b { color: var(--text); font-size: 15px; }`
- Nach Z. 678 neu: `.empty > .btn, .empty > .row { margin-top: 8px; }`

**C12 – Dropzone** (bereich_trades_tag-1)
- Z. 749 `.dropzone { … padding: 22px; … }` → `padding: 20px 16px;`
- Z. 750 `.dropzone.over, .dropzone:hover { border-color: var(--accent); background: var(--accent-soft); color: var(--text); }` → `.dropzone.over, .dropzone:hover { border-color: var(--text-2); background: var(--surface-2); color: var(--text); }`
- Nach Z. 750 neu: `.dropzone > svg { width: 24px; height: 24px; display: block; margin: 0 auto 8px; color: var(--muted); }`

**C13 – Einheit im Feld** (komponenten-17, komponenten-16, bereich_trades_tag-10, bereich_einstellungen-35)
- Z. 844 `.inp-cur .cur-sym { … font-weight: 600; font-size: 13.5px; … }` → `font-weight: 500; font-size: 13px;`
- Z. 846 `.inp-cur.pre .cur-sym { left: 14px; }` → `left: 12px;`
- Z. 847 `.inp-cur.pre .input { padding-left: calc(20px + var(--sl, 1) * 1ch); }` → `calc(18px + var(--sl, 1) * 1ch)`
- Z. 848 `.inp-cur.post .cur-sym { right: 40px; }` → `right: 12px;`
- Z. 849 `.inp-cur.post .input { padding-right: calc(46px + var(--sl, 1) * 1ch); }` → `calc(18px + var(--sl, 1) * 1ch)`
- Neu nach Z. 849: `.inp-cur.w160 { width: 160px; }`
- Z. 1880–1882 (`.input-unit`, `.input-unit span`, `.input-unit .input`) löschen.

**C14 – Segment als Schiene** (komponenten-26, bewegung-25, komponenten-44)
- Z. 317–318 ersetzen durch:
```css
.seg { display: inline-flex; flex-wrap: wrap; gap: 2px; padding: 3px; max-width: 100%; border-radius: 12px; border: 1px solid var(--border); background: var(--surface-2); }
.seg button { height: 34px; padding: 0 14px; border-radius: 9px; border: 1px solid transparent; background: none; color: var(--text-2); font-weight: 500; font-size: 13px; white-space: nowrap; cursor: pointer; transition: background var(--dur-1) var(--ease), color var(--dur-1) var(--ease), border-color var(--dur-1) var(--ease), box-shadow var(--dur-1) var(--ease); }
```
- Z. 319 `.seg button:hover { color: var(--text); background: var(--surface-2); }` → `.seg button:hover { color: var(--text); background: var(--surface-3); }`
- Z. 320, 321 bleiben. Z. 322 (`.seg.pill button`) löschen.
- Z. 1584–1585 → `.seg.mini { padding: 2px; border-radius: 8px; flex-wrap: nowrap; }` und `.seg.mini button { height: 24px; padding: 0 7px; font-size: 11.5px; border-radius: 6px; }`
- Z. 1385 `.fd-seg { … gap 4 … background: var(--surface); … }` → `gap: 2px; background: var(--surface-2);`; Z. 1386 `.fd-seg button { … font-weight: 600; … }` → `font-weight: 500;`
- Z. 1965–1966 (`.cert-opts .seg.sm button`, `… small`) löschen.
- Z. 2542–2545 (`.seg.segc …`) löschen; in Z. 2754 den Teil `.seg.segc { max-width: 100%; } .seg.segc button { white-space: normal; line-height: 1.25; }` samt Kommentar streichen.

**C15 – 1–5-Skala** (komponenten-44)
- Z. 323–325 (`.rating`, `.rating button`, `.rating button[aria-pressed]`) ersetzen durch:
```css
.scale5 { display: inline-flex; gap: 6px; }
.scale5 button { width: 32px; height: 32px; padding: 0; border-radius: 8px; border: 1px solid var(--border); background: var(--surface); color: var(--text-2); font-size: 13px; font-weight: 500; cursor: pointer; transition: background var(--dur-1) var(--ease), color var(--dur-1) var(--ease), border-color var(--dur-1) var(--ease); }
.scale5 button:hover { color: var(--text); background: var(--surface-2); }
.scale5.rating button { color: var(--muted); }
.rating button[aria-pressed="true"] { --lc: var(--warn); }
```
- In der gemeinsamen Auswahlregel (Z. 3125) `.rating button[aria-pressed="true"]` → `.scale5 button[aria-pressed="true"]`.
- Z. 1390 `.fd-tog.stars button { letter-spacing: -1px; font-size: 11px; color: var(--warn); }` → `letter-spacing` streichen.

**C16 – Chips** (komponenten-36, komponenten-45)
- Z. 628 `.chip.sel { cursor: pointer; … }` → zusätzlich `height: 28px; padding: 0 10px;`
- Z. 1879 `.chip.sel.big { … }` löschen.
- Nach Z. 632 neu: `.tbl .chip, .detail-head .chip { padding: 2px 9px; font-size: 11.5px; line-height: 16px; }` (22 px mit Rand).
- Z. 1400 `.fd-chip { … height: 30px; … border-radius: 8px; … font-size: 12.5px; font-weight: 600; … }` → `height: 28px; border-radius: 999px; font-size: 12px; font-weight: 500;`
- Z. 1407 `.fd-add { … height: 30px; … border-radius: 8px; … font-size: 12.5px; font-weight: 600; … }` → `height: 28px; border-radius: 999px; font-size: 12px; font-weight: 500;`
- Z. 992 `.nb .tagpill { … padding: 4px 10px; … font-weight: 600; … }` → `height: 28px; padding: 0 10px; … font-weight: 500;`; Z. 993 `.nb .tagpill b { color: var(--muted); font-weight: 600; }` → `font-size: 11px; font-weight: 500;`

**C17 – Häkchen und Abhak-Kästchen** (komponenten-33, bereich_konto-23, bereich_training-48)
- Z. 303 `.check input { accent-color: var(--accent); … }` → `accent-color: var(--text);`
- Z. 2731 `.prop-assign-row input { accent-color: var(--accent); … }` → `accent-color: var(--text);`
- Z. 2904 `.coach-radio input { … accent-color: var(--accent); }` → `accent-color: var(--text);`
- Z. 1143 `.ql-editor li[data-list=checked] > .ql-ui, .ql-editor li[data-list=unchecked] > .ql-ui { color: var(--accent); }` → `color: var(--text-2);`
- Z. 2932 `.ct-check[aria-checked="true"], .coach-task.done .ct-check.static { … }` → nur `.ct-check[aria-checked="true"] { … }`
- Z. 2933 `.ct-check.static { cursor: default; }` → `.ct-check.static, .ct-check.static:hover { cursor: default; border-color: transparent; background: none; color: var(--text-2); }`
- Z. 2268 `.rp-checks input { width: 20px; height: 20px; accent-color: var(--phase); flex: none; margin: 0; }` ersetzen durch:
```css
.rp-checks .rp-box { width: 20px; height: 20px; border-radius: 6px; border: 1.5px solid var(--border-2); display: grid; place-items: center; flex: none; color: transparent; transition: background var(--dur-1) var(--ease), border-color var(--dur-1) var(--ease); }
.rp-checks .rp-box svg { width: 13px; height: 13px; }
.rp-checks input:checked + .rp-box { background: var(--phase); border-color: var(--phase); color: var(--rp-on-phase); }
.rp-checks input:focus-visible + .rp-box { outline: 2px solid var(--phase); outline-offset: 3px; }
```

**C18 – Checklisten-Zeilen flach, nicht durchgestrichen** (bereich_trades_tag-13, referenz-20)
- Z. 799 `.checklist { … gap: 6px; }` → `gap: 0;`
- Z. 800 `.checklist .it { … padding: 9px 10px; border-radius: 9px; background: var(--surface-2); … }` → `padding: 10px 0; border-radius: 0; background: none; border-bottom: 1px solid var(--border);`
- Neu nach Z. 800: `.checklist .it:last-child { border-bottom: 0; }` und `.checklist .it.toggle:hover .box { border-color: var(--text-2); }`
- Z. 805 `.checklist .it.done span { color: var(--muted); text-decoration: line-through; }` ersatzlos löschen.
(Wirkt bewusst auch in Fortschritt und Session-Dialogen.)

**C19 – Reiter-Schiene** (referenz-23, bereich_statistik-6, komponenten-27)
- Z. 659–661 ersetzen durch:
```css
.tabs, .prop-tabs { display: inline-flex; gap: 2px; padding: 3px; max-width: 100%; border-radius: 12px; border: 1px solid var(--border); background: var(--surface); overflow-x: auto; scrollbar-width: none; overscroll-behavior-x: contain; }
.tabs::-webkit-scrollbar, .prop-tabs::-webkit-scrollbar { display: none; }
.tabs > button, .tabs > a, .prop-tabs a { display: inline-flex; align-items: center; height: 34px; padding: 0 12px; border: 1px solid transparent; border-radius: 9px; background: none; color: var(--text-2); font-size: 13.5px; font-weight: 500; text-decoration: none; white-space: nowrap; cursor: pointer; flex: 0 0 auto; transition: background var(--dur-1) var(--ease), color var(--dur-1) var(--ease), border-color var(--dur-1) var(--ease); }
.tabs > button:hover, .tabs > a:hover, .prop-tabs a:hover { color: var(--text); background: var(--surface-2); }
.tabs > button:focus-visible, .tabs > a:focus-visible, .prop-tabs a:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
```
- Z. 1508 `.tabs.sm button { … }` löschen.
- Z. 1511–1513 → `.tabs.scroll-x { overflow-x: auto; flex-wrap: nowrap; padding: 3px; margin: 0; }` (die zweite Regel mit `margin: -4px …` und der `::-webkit-scrollbar`-Regel entfallen, beides steht jetzt in der Grundregel).
- Z. 2588–2591 (`.prop-tabs`, `::-webkit-scrollbar`, `.prop-tabs a`, `:hover`) löschen; in Z. 2591 bleibt nur `.prop-sub a:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }` (wird in C20 erweitert).
- Z. 2753 (Handy, `.prop-tabs`): `.prop-tabs a { flex: 1 1 auto; text-align: center; padding: 8px 4px; font-size: 12.5px; }` → `.prop-tabs a { flex: 1 1 auto; justify-content: center; padding: 0 4px; font-size: 12.5px; }`
- Z. 3054 (Handy) `.tabs button { padding: 9px 14px; font-size: 13px; }` → `.tabs > button, .tabs > a { padding: 0 12px; font-size: 13px; }`; Z. 3052 `.tabs { flex-wrap: nowrap; overflow-x: auto; … }` bleibt.

**C20 – Unterstrich-Reiter** (komponenten-27, referenz-23)
- Z. 1866–1869 (`.set-tabs …`) und Z. 2593–2598 (`.prop-sub …`) ersetzen durch eine gemeinsame Fassung:
```css
.subtabs, .set-tabs, .prop-sub { display: flex; gap: 22px; border-bottom: 1px solid var(--border); overflow-x: auto; scrollbar-width: none; }
.subtabs::-webkit-scrollbar, .set-tabs::-webkit-scrollbar, .prop-sub::-webkit-scrollbar { display: none; }
.subtabs > button, .set-tabs > button, .prop-sub a { position: relative; padding: 2px 1px 11px; border: 0; background: none; font-size: 13.5px; font-weight: 500; color: var(--muted); text-decoration: none; white-space: nowrap; cursor: pointer; transition: color var(--dur-1) var(--ease); }
.subtabs > button:hover, .set-tabs > button:hover, .prop-sub a:hover, .subtabs > button[aria-pressed="true"], .set-tabs > button[aria-pressed="true"], .prop-sub a[aria-pressed="true"] { color: var(--text); }
.subtabs > button::after, .set-tabs > button::after, .prop-sub a::after { content: ''; position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; border-radius: 2px; background: var(--text); transform: scaleX(0); transition: transform var(--dur-2) var(--ease); }
.subtabs > button[aria-pressed="true"]::after, .set-tabs > button[aria-pressed="true"]::after, .prop-sub a[aria-pressed="true"]::after { transform: scaleX(1); }
.subtabs > button:focus-visible, .set-tabs > button:focus-visible, .prop-sub a:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
```
- Die Regel `.prop-sub a:focus-visible` aus C19 entfällt damit.

**C21 – Menüeinträge** (komponenten-35, komponenten-2)
- Z. 334 `.popover .item { … padding: 9px 12px; … font-size: 13px; color: var(--text); }` → `min-height: 36px; padding: 0 10px; … font-size: 13px; font-weight: 500; color: var(--text);` (gap 10, Radius 8 bleiben).
- Z. 337 `.popover .item[aria-checked="true"] { color: var(--accent); }` → `.popover .item[aria-checked="true"] { color: var(--text); background: var(--surface-2); }`
- Z. 339 `.popover .item svg { width: 15px; height: 15px; }` → `.popover .item svg { width: 16px; height: 16px; flex: 0 0 auto; color: var(--muted); }`; neu danach: `.popover .item.danger svg { color: inherit; }`, `.popover .item .chk { width: 16px; flex: 0 0 auto; display: inline-flex; color: var(--text-2); }`, `.popover .item .chk svg { color: inherit; }`
- Z. 341 `.popover .sec { … padding: 8px 12px 4px; … }` → `padding: 8px 10px 4px;`
- Z. 250 `.sb-menu .item { font-size: 13.5px; color: var(--text-2); } .sb-menu .item:hover { color: var(--text); }` löschen (Z. 251 `.on` bleibt).
- Z. 253 `.sb-menu-row { … padding: 4px 6px 4px 12px; font-size: 13.5px; … }` → `padding: 4px 6px 4px 10px; font-size: 13px;`
- Z. 881 `.sym-opt { … gap: 12px; … padding: 9px 10px; … font-size: 13.5px; … }` → `gap: 10px; min-height: 36px; padding: 0 10px; font-size: 13px;`
- Z. 886 `.sym-opt[aria-selected="true"] { background: var(--accent-soft); color: var(--accent); }` → `.sym-opt[aria-selected="true"] { background: var(--surface-2); color: var(--text); }`
- Z. 1415 `.fd-opts .item { … gap: 8px; … padding: 8px 10px; … }` → `gap: 10px; min-height: 36px; padding: 0 10px; font-weight: 500;`; Z. 1417 `.fd-opts .item svg { width: 14px; height: 14px; }` → `width: 16px; height: 16px; color: var(--muted);`
- Notebook-Tags und Editor: Z. 1052 `.nb .tagpop .chk { width: 14px; height: 14px; … color: var(--accent); }` → `width: 16px; height: 16px; … color: var(--text-2);`; Z. 1053 (`.nb .tagpop .chk svg`) löschen. Z. 1103 `.ed-pop .item .chk { display: none; width: 14px; height: 14px; color: var(--accent); }` → `width: 16px; height: 16px; color: var(--text-2);` (display bleibt).

**C22 – Schwebende Ebenen** (komponenten-34)
- Z. 406 `.popover.dp { … border-radius: var(--radius); … }` und Z. 439 `.popover.cp { … border-radius: var(--radius); … }` → `border-radius: 12px;`
- Z. 1124 `.nb-ytpop { … border: 1px solid var(--accent); border-radius: 10px; … }` → `border: 1px solid var(--border-2); border-radius: 12px;`

**C23 – Vorlagen-Menü** (bereich_dashboard-47, komponenten-2, komponenten-34, komponenten-35)
- Z. 1625 `.tpl-row .item.name { flex: 1 1 auto; padding: 8px 10px; }` → `.tpl-row .item.name { flex: 1 1 auto; }`
- Z. 1627 `.tpl-row .chk { width: 16px; display: inline-flex; color: var(--accent); flex: 0 0 auto; }` → `color: var(--text-2);`; Z. 1628 (`.tpl-row .chk svg`) löschen.
- Z. 1629 `.tpl-row .star { color: var(--warn); … }` → `color: var(--muted);`
- Z. 1631 `.tpl-row.on .item.name { color: var(--accent); font-weight: 600; }` → `.tpl-row.on { background: var(--surface-2); } .tpl-row.on .item.name { color: var(--text); }`
- Z. 1632 `.tpl-menu { margin: 2px 6px 8px 24px; padding: 4px; border: 1px solid var(--border); border-radius: 10px; background: var(--surface-2); }` → `.tpl-menu { margin: 2px 0 6px 26px; padding: 4px 0 0; border: 0; border-top: 1px solid var(--border); border-radius: 0; background: none; }`
- Z. 1633 `.tpl-menu .item { padding: 7px 10px; font-size: 12.5px; }` löschen.
- Neu nach Z. 1635: `.tpl-menu .item.danger:disabled { color: var(--text); }`
- Z. 1636 `.tpl-menu .star-i { … color: var(--warn); }` → `color: var(--muted);`

**C24 – Filter-Fuß wie Zeitraum-Fuß** (komponenten-21, komponenten-12)
- Z. 1366–1371 (`.fd-pop .fd-foot`, `.fd-pop .fd-foot .btn`, `… .btn.ghost`, `… .btn.primary`, `… .fd-n`, `… .btn svg`) ersetzen durch:
```css
.fd-pop .fd-foot { align-items: center; gap: 12px; padding: 12px var(--sp-pad); border-radius: 0 0 11px 11px; }
.fd-foot .fd-n { font-size: 13px; color: var(--muted); min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.fd-btns { display: flex; gap: 8px; flex: 0 0 auto; }
```
- Z. 1419 (`.fd-foot .btn.primary { gap: 8px; }`) und Z. 1420 (`.fd-foot .fd-n { padding-left… border-left… }`) löschen.
- Z. 1424 (Handy-Regel für `.fd-foot .btn…`) löschen.

**C25 – Kacheln** (bereich_dashboard-11, bereich_statistik-8, diagramme-43, bereich_konto-28)
- Z. 515 `.tile { … transition: border-color var(--dur-2) var(--ease), transform var(--dur-2) var(--ease), box-shadow var(--dur-2) var(--ease); }` → `transition: border-color var(--dur-2) var(--ease);`
- Z. 516 → `.tile:hover, .stat-tile:hover { border-color: var(--border-2); }`
- Z. 636 `.stat-tile { … border-radius: 14px; padding: 16px 18px; … transition: … }` → `border-radius: var(--radius); padding: 12px 15px; … transition: border-color var(--dur-2) var(--ease);`
- Z. 637 `.stat-tile .k { … font-size: 13px; color: var(--text-2); }` → `font-size: 13.5px; font-weight: 500; color: var(--text-2);`
- Z. 639 `.stat-tile .v { … font-size: 24px; … letter-spacing: -0.01em; }` → `font-size: 25px; letter-spacing: -0.02em; line-height: 1.1;`
- Z. 1499 → `:root[data-theme="light"] .card, :root[data-theme="light"] .tile, :root[data-theme="light"] .stat-tile { … }`
- Handy (Z. 3037–3038): `.stat-tile { padding: 14px; }` löschen; `.stat-tile .v { font-size: 20px; }` → `font-size: 22px;`
- Spark-Kachel: Z. 1733 `.tile.spark-tile { gap: 2px; }` löschen. Z. 1734 `.tile.spark-tile .spark-body { … }` ergänzen um `padding-top: 8px; background: linear-gradient(90deg, var(--border), var(--border) 22%, transparent 48%) top left / 100% 1px no-repeat;`. Z. 1735 `.tile.spark-tile .val { font-family…; font-size: 28px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.1; flex…}` → `.tile.spark-tile .val { flex: 0 0 auto; display: flex; align-items: center; margin: 0; padding: 0; min-height: 0; }` (Größe, Schrift, Gewicht kommen aus `.tile .val`).
- Nach Z. 2603 neu: `:root[data-theme="light"] .kstrip .tile, :root[data-theme="light"] .kstrip .tile:hover { box-shadow: -1px 0 0 var(--border), 0 -1px 0 var(--border); }`
- `--lift-shadow` (Z. 48, 59, 69) bleibt (landing.css:56).
- Wenn die Typografie- oder Abstände-Spezifikation `.tile .head`, `.tile .val` oder das Kachel-Padding ändert, gelten deren Werte gleichermaßen für `.stat-tile .k`, `.stat-tile .v` und `.stat-tile`.

**C26 – Kalender** (ki_look-11, bereich_dashboard-45)
- Z. 703 → `.cal .wd { text-align: center; padding: 4px 4px 6px; font-size: 12px; font-weight: 500; color: var(--muted); border: 0; background: none; }`
- Z. 704 und Z. 1757 (`.cal .wd.wk`) löschen.
- Z. 708 `.cal .d .n { …; font-size: 11.5px; font-weight: 600; background: var(--surface-3); color: var(--text-2); }` → Lage und Größe behalten (absolute, top/right 6px, 24×24, Radius 999, grid), nur `font-size: 12px; font-weight: 500; background: none; color: var(--muted);`
- Z. 709 `.cal .d.today .n { background: var(--accent); color: var(--accent-ink); }` löschen; nach Z. 712 einfügen: `.cal .d:is(.win, .loss, .be) .n { color: var(--text-2); }` und danach `.cal .d.today .n { background: var(--text); color: var(--bg); font-weight: 600; }`
- Z. 731 `.cal.mini .d.today .n { color: var(--accent); }` → `.cal.mini .d.today .n { color: var(--text); font-weight: 600; } .cal.mini .d.today { border-color: var(--text-2); }`
- Z. 1292 `.activity i.today`, Z. 1672 `.tracker i.today`, Z. 1771 `.ym-grid i.today`: `box-shadow: 0 0 0 2px var(--accent)` → `box-shadow: 0 0 0 1.5px var(--text-2)`
- Z. 1685 `.ycal-head span { … }` → `.ycal-head span { text-align: center; padding: 0 2px 6px; font-size: 12px; font-weight: 500; color: var(--muted); border: 0; }`
- Nach Z. 732 (`.cal-nav`) neu: `.cal-nav .cal-title { font-size: 15px; min-width: 140px; text-align: center; }`
- Handy-Regel Z. 940 bleibt; Z. 721 (`.cal .d .p` 800) bleibt bis N2.

**C27 – Auswahl in Einstellungen → Design** (bereich_einstellungen-19)
- Z. 1830 → `.design-card[aria-pressed="true"] .dc-prev { box-shadow: inset 0 0 0 1px var(--dd), 0 0 0 2px var(--surface), 0 0 0 3.5px var(--text); }`
- Z. 1841 → `.theme-card[aria-pressed="true"] .tc-prev { box-shadow: inset 0 0 0 1px var(--cb), 0 0 0 2px var(--surface), 0 0 0 3.5px var(--text); }`
- Z. 1937 `.dot[aria-pressed="true"] { box-shadow: 0 0 0 2px var(--text); transform: scale(1.08); }` → `.dot[aria-pressed="true"] { box-shadow: 0 0 0 1.5px var(--text); transform: none; }`
- Z. 461 (`.cp-c`) und Fokusring Z. 1842 bleiben.

**C28 – Kennzahl-Auswahl im Report-Widget** (ki_look-35)
- Z. 1704 `.rep-sel { … border-left-width: 4px; … font-weight: 600; … }` → `border-left-width` streichen, `font-weight: 500`.
- Z. 1707 `.rep-sel.on { border-color: var(--accent); }` → `.rep-sel.on { border-color: var(--text-2); background: var(--surface-3); }`

**C29 – Notebook: Ordner und Tag-Menü** (bereich_notebook_news-32, bereich_notebook_news-20, komponenten-2)
- Z. 978 `.nb .folder { … padding: 8px 8px 8px 10px; … border: 1px solid transparent; border-left: 3px solid var(--fc, transparent); … }` → `padding: 8px 8px 8px 12px;` und die Deklaration `border-left: 3px solid var(--fc, transparent);` streichen.
- Neu nach Z. 978: `.nb .folder::before { content: ''; position: absolute; left: 0; top: 8px; bottom: 8px; width: 3px; border-radius: 2px; background: var(--fc, transparent); }`
- Z. 1041 `.nb .tagpop { min-width: 220px; width: max-content; max-width: min(720px, calc(100vw - 48px)); }` → `.nb .tagpop { width: 280px; max-width: calc(100vw - 32px); }`
- Z. 1042 `.nb .tagcols { display: flex; gap: 4px; align-items: flex-start; }` → `.nb .tagcols { display: flex; flex-direction: column; gap: 0; max-height: 360px; overflow-y: auto; overscroll-behavior: contain; }`
- Z. 1043–1045 (farbige `.sec.k-*`/`.item.k-*[aria-checked]`) und Z. 1046 löschen; neu: `.nb .tagpop .item[aria-checked="true"] { color: var(--text); }`
- Z. 1050 `.nb .tagcol { min-width: 150px; max-height: 340px; overflow-y: auto; … }` → `.nb .tagcol { min-width: 0; }`
- Z. 1051 (Regel ≤760 px) löschen.
- Neu: `.nb .tagpop-q { padding: 4px 4px 6px; } .nb .tagpop-q .input { height: 34px; padding: 0 10px; font-size: 13px; }`

**C30 – Ordner-Dialog** (bereich_notebook_news-31)
Nach den `.swatch`-Regeln (Z. 580–584; `.swatch` ist die Pille mit 18-px-Farbkreis, die der Ordner-Dialog schon nutzt) einfügen:
```css
.swatch.add { position: relative; }
.swatch.add i { border: 1px dashed var(--border-2); display: grid; place-items: center; color: var(--text-2); }
.swatch.add i svg { width: 12px; height: 12px; }
.swatch.add input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
form[data-action="nb-folder-save"] .stack { gap: 16px; }
form[data-action="nb-folder-save"] .modal-foot { margin-top: 20px; padding-top: 14px; }
```

**C31 – Mentor-Chat** (bereich_training-2, bereich_training-1)
- Z. 2344 `.mentor { display: flex; … }` → `.mentor-chat { display: flex; … }` (Werte bleiben).
- Z. 2364 (im @media-Block) `.mentor { height: …; min-height: 400px; }` → `.mentor-chat { … }`
- Z. 2363 `.mentor-note { padding: 0 18px 12px; }` → `.mentor-disclaimer { padding: 0 18px 12px; color: var(--muted); }`
- Coach-Regeln Z. 2884–2889 und Z. 2916 bleiben unverändert.

**C32 – Coach-Kleinigkeiten** (bereich_konto-36, bereich_konto-50, bereich_konto-22, bereich_konto-45)
- Nach Z. 2900 neu: `.coach-yes, .coach-no { align-items: flex-start; } .coach-yes svg, .coach-no svg { flex: none; margin-top: 2px; }`
- Z. 2937–2938 (`.ct-done summary::before`, `[open] … ::before`) löschen; neu: `.ct-done summary { display: inline-flex; align-items: center; gap: 5px; }`. Z. 2310 → `.rp-more summary::after, .ct-done summary::after { … }`; Z. 2311 → `.rp-more[open] summary::after, .ct-done[open] summary::after { … }`
- Z. 2879 `.ce-write textarea { … resize: vertical; … }` und Z. 2923 `.mr-write textarea { … resize: vertical; … }` → `resize: none; field-sizing: content; max-height: 160px;` (min-height 44 bzw. 34 bleibt). `.mn-edit` bleibt `resize: vertical`.
- Neu: `#pop-coachmenu .item { white-space: nowrap; }`

**C33 – Textlinks** (bereich_konto-49)
- Nach Z. 89 (`a { … }`) neu:
```css
.tlink { color: var(--text-2); text-decoration: underline; text-decoration-color: var(--border-2); text-underline-offset: 3px; transition: color var(--dur-2) var(--ease), text-decoration-color var(--dur-2) var(--ease); }
.tlink:hover { color: var(--text); text-decoration-color: currentColor; }
```
- Z. 2657 `.cpn-link { align-self: flex-start; display: inline-flex; align-items: center; gap: 4px; margin-top: 4px; font-size: 12.5px; color: var(--muted); text-decoration: none; transition: … }` → `.cpn-link { align-self: flex-start; display: inline-flex; align-items: center; gap: 4px; margin-top: auto; padding-top: 6px; font-size: 12.5px; color: var(--text-2); text-decoration: none; transition: color var(--dur-2) var(--ease); }`; Z. 2658 bleibt.

**C34 – Ruhepunkt** (bewegung-41, bereich_training-41)
- Z. 2147–2151 (alle `.rp-switch`-Regeln) löschen; in Z. 2333 aus der Selektorliste `.rp-switch input, .rp-switch input::after, ` streichen.
- Z. 2280 `.rp-seq-i { position: relative; min-width: 0; … }` → `min-width: max-content;`
- Z. 2334 (Handy) den Teil `.rp-seq-i b { white-space: normal; }` streichen. Die Ellipse in Z. 2283 bleibt als Netz.

**C35 – Runder „Trade loggen“-Knopf am Handy** (responsiv-17)
- Z. 3019 `.dash-head .tl { … background: var(--accent); color: var(--accent-ink); border-color: var(--accent); box-shadow: 0 14px 30px -8px var(--accent-glow), 0 6px 18px rgba(0, 0, 0, .35); }` → `background`, `color`, `border-color` und `box-shadow` streichen (Lage, 54×54, Radius bleiben).
- Z. 3020 (`.dash-head .tl:hover { background: var(--accent); }`) löschen.
- Ans Dateiende (hinter Z. 3144) neu:
```css
@media (max-width: 560px) {
  .dash-head .btn.accent.tl { width: 54px; height: 54px; box-shadow: inset 0 1px 0 rgba(255, 255, 255, .04), 0 6px 18px rgba(0, 0, 0, .35); }
  :root[data-theme="light"] .dash-head .btn.accent.tl { box-shadow: inset 0 1px 0 rgba(255, 255, 255, .7), 0 6px 16px rgba(0, 0, 0, .14); }
}
```

#### C. Einzelstellen

**C36 – Klassen statt Inline-Stil** (bereich_dashboard-45, bereich_trades_tag-38)
Neu (bei den jeweiligen Widget-Regeln):
```css
.score-row { gap: 16px; margin-top: 8px; align-items: center; }
.score-row .score-scale { margin: 0 8px 14px; }
.chal-head { margin-bottom: 6px; }
.chal-head .big-stat { font-size: 30px; margin: 0; }
.chal-foot { margin-top: 8px; }
.tracker-cap { font-size: 13px; font-weight: 500; color: var(--text-2); }
.tracker-score { gap: 12px; flex-wrap: nowrap; }
.dash-empty { text-align: center; padding: 32px; }
.day-title { font-size: 20px; margin-left: 6px; }
```

**C37 – Einstellungen** (bereich_einstellungen-2, komponenten-30)
- Z. 1030 `.nb .save-state { … }` → `.save-state { font-size: 11.5px; color: var(--muted); margin-left: auto; white-space: nowrap; }`; Z. 1031 `.nb .save-state.saving` → `.save-state.saving`; Z. 1193 (Druck) `.nb .save-state` → `.save-state`.
- Neu nach Z. 1816: `.set-head .save-state { align-self: center; font-size: 12px; }`
- Nach Z. 128 (`.row`) neu: `.add-row { flex-wrap: nowrap; }`

### 3.2 web/js/ui.js

**U1 – Neue Symbole** (bereich_notebook_news-34)
In der Icon-Liste nach `arrowDown` (Z. 77):
```js
sort: sv('<path d="M7 4v16M4 7l3-3 3 3M17 20V4M14 17l3 3 3-3"/>'),
checkSquare: sv('<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>'),
```

**U2 – Feldbeschriftung im Eingabe-Dialog** (komponenten-18)
Z. 453 (promptModal) `<label class="field"><span>${esc(o.label || 'Name')}</span>` → `<label class="field"><span class="lbl">${esc(o.label || 'Name')}</span>`

**U3 – Tooltip rechts neben einem Element** (bereich_shell-20)
In `bindTips` (Z. 420), in `move` direkt nach `tipFor = t;` einfügen:
```js
if (t.dataset.tipSide === 'right') { const r = t.getBoundingClientRect(), tip = tipEl(); tip.innerHTML = t.dataset.tip; tip.classList.add('on'); tip.style.left = (r.right + 8) + 'px'; tip.style.top = Math.max(8, r.top + r.height / 2 - tip.offsetHeight / 2) + 'px'; return; }
```
danach wie bisher `tipShowAt(...)`.

### 3.3 web/js/app.js

**A1 – Seitenleiste ohne doppelte System-Tooltips** (bereich_shell-20)
- Die Zeile mit `const desk = …; const mini = …; document.documentElement.classList.toggle('sb-mini', mini);` (Z. 209) vor `const item` (Z. 207) ziehen.
- Z. 207 in `item`: `title="${label}"` → `${mini ? ` aria-label="${label}" data-tip="${label}" data-tip-side="right"` : ''}`
- Z. 206 (`dot`) und Z. 225 (`cdot`): `title="${esc(w)}"` bzw. `title="${esc(coachWhy)}"` → `data-tip="${esc(w)}"` bzw. `data-tip="${esc(coachWhy)}"`; `aria-label` bleibt.
- Z. 210 Einklapp-Knopf: `title="${mini ? 'Ausklappen' : 'Einklappen'}"` → `data-tip="${mini ? 'Ausklappen' : 'Einklappen'}"${mini ? ' data-tip-side="right"' : ''}`; beim Handy-Schließen-Knopf `title="Schließen"` streichen.
- Z. 227 `.sb-user`: `title="Konto und Einstellungen"` streichen; nur im Mini-Modus ` data-tip="Konto und Einstellungen" data-tip-side="right"` setzen.

**A2 – Ein Anzeigename** (bereich_konto-54, hierarchie-47)
- Neue Methode in `App`:
```js
displayName() {
  const st = S.settings, pr = st.profile || {};
  const full = [pr.firstName, pr.lastName].map(x => String(x || '').trim()).filter(Boolean).join(' ');
  const user = String(pr.username || '').trim().replace(/^@/, '');
  const name = full || user || (st.name && st.name !== 'Trader' ? String(st.name).trim() : '') || 'Trader';
  return { name, user, initials: name.split(/\s+/).map(x => x[0]).join('').slice(0, 2).toUpperCase() };
},
```
- `userCard` (Z. 220–223): `full`, `user`, `name`, `initials` aus `this.displayName()` holen.
- `topbar` (Z. 264): `const initials = (S.settings.name || 'T')…` → `const initials = this.displayName().initials;`
- Z. 229: `'<span>Profil vervollständigen</span>'` → `'<span>Profil ergänzen</span>'`

**A3 – Konto-Menü mit Haken-Spalte** (komponenten-2)
In `accountControl` (Z. 244) jedem `.item` (auch „Alle Konten“) vor dem Namen `<span class="chk">${checked ? I.check : ''}</span>` voranstellen (`checked` = derselbe Ausdruck wie `aria-checked`). Der Eintrag „Konten verwalten“ behält sein Zahnrad, es steht in derselben 16-px-Spalte.

**A4 – „Session starten“ mit Text ab 1181 px** (referenz-5)
`sessionControl` (Z. 248–251): Parameter `iconOnly` entfällt; der Zweig ohne Session liefert immer
`<button type="button" class="btn" data-action="start-session" title="Session starten" aria-label="Session starten">${I.play}<span class="lbl-wide">Session starten</span></button>`.
Z. 260 `this.sessionControl(true)` → `this.sessionControl()`. Der laufende Zweig („Beenden“ mit Timer) bleibt.

**A5 – Gemeinsame Feld-Helfer** (bereich_trades_tag-11, komponenten-17, bereich_einstellungen-35)
Bei `feeSym` (Z. 439):
```js
App.unitField = function (inputHtml, unit, cls = '') { const f = unit === '%' ? { sym: '%', side: 'post' } : feeSym(unit); return `<div class="inp-cur ${f.side}${cls ? ' ' + cls : ''}" style="--sl:${f.sym.length}">${inputHtml}<span class="cur-sym no-i18n" aria-hidden="true">${esc(f.sym)}</span></div>`; };
App.curField = function (o) { return App.unitField(`<input class="input" type="number" step="any"${o.min != null ? ` min="${o.min}"` : ''} id="${o.id}" name="${o.name}" value="${o.value == null ? '' : o.value}" inputmode="decimal">`, accCurrency(o.accountId)); };
App.feeField = function (t) { return App.curField({ name: 'fees', id: 'f-fees', value: t.fees || 0, accountId: t.accountId, min: 0 }); };
```
Zusätzlich die Markup-Teile für Symbol und Richtung aus `openTradeEditor` (Z. 350, 351) herauslösen: `App.symbolField(sym)` liefert das bisherige `<div class="field tf-sym">…</div>` (IDs `f-symbol-btn`, `f-symbol`, `f-symbol-l` bleiben), `App.dirField(dir)` das bisherige `<div class="field">…<div class="dir-switch" id="f-dir" …>…</div><input type="hidden" name="direction" …></div>`. `openTradeEditor` ruft beide auf. Die Symbolwahl (Z. 395–410) greift auf `#f-mult` schon abgesichert zu (`if (mi && …)`, Z. 399); im Verpasst-Dialog gibt es kein `#f-mult`, das bleibt so. `set-dir` (Z. 471) und `updateTradePreview` arbeiten ohne `#trade-form` weiter (früher Ausstieg), nichts zu ändern.

**A6 – Check-in und Bewertung als 1–5-Skala** (komponenten-44)
- Z. 513 `<div class="seg pill" data-chips="${name}">` → `<div class="scale5" data-chips="${name}">` (Aktion `seg-set` bleibt).
- Z. 428 `<div class="rating" id="f-rating">` → `<div class="scale5 rating" id="f-rating">`

**A7 – Gespeichert-Hinweis** (bereich_einstellungen-2)
Neu: `App.savedHint = function () { const s = document.querySelector('.set-head .save-state'); if (!s) return; s.textContent = 'Gespeichert'; clearTimeout(App._svT); App._svT = setTimeout(() => { s.textContent = ''; }, 1500); };`

**A8 – Gemeinsame Tages-Kennzahlen** (bereich_trades_tag-43)
Neu: `App.dayStatsHTML(s, o = {})` gibt `<div class="stats"${o.style ? ` style="${o.style}"` : ''}>…</div>` mit acht Feldern in dieser Reihenfolge zurück: Trades (`o.n ?? s.n`, dahinter ` <span class="muted small">(x offen)</span>`, wenn `o.open`), Brutto-P&L (`U.cls`, signiert), Gewinner / Verlierer (`pos`/`neg`), Gebühren, Win-Rate, Volumen (`fmt.num(…, 2)`), Profit-Faktor, Ø R (`fmt.r(s.avgR)` oder „—“). Ohne geschlossene Trades (`o.closed === 0`) zeigen Win-Rate, Profit-Faktor und Ø R „—“, wie heute in day.js:14.

### 3.4 web/js/widgets.js

**W1 – Kalender-Navigation** (komponenten-25, bereich_dashboard-45)
Z. 121 `calNav`: beide `class="btn round"` → `class="btn nav"`; `<h3 style="font-size:15px;min-width:140px;text-align:center">` → `<h3 class="cal-title">`.

**W2 – Report-Auswahl ohne Farbstreifen** (ki_look-35, komponenten-1)
Z. 223: am Knopf `.rep-sel` das Attribut `style="border-left-color:${esc(r.color)}"` entfernen. Am Knopf „Kennzahl“ (`class="btn primary sm …" data-action="dash-rep-pick" data-i="new"`) `primary` streichen.

**W3 – Score-Reihe** (bereich_dashboard-45)
Z. 227: `<div class="row" style="gap:16px;margin-top:8px;align-items:center">` → `<div class="row score-row">`; an `.score-scale` `style="margin:0 8px 14px;--p:${sc.overall}"` → `style="--p:${sc.overall}"`.

**W4 – Karten-Umschalter als Unterstrich** (komponenten-27, referenz-23)
Z. 257: `<div class="tabs sm" style="margin-bottom:12px">` → `<div class="subtabs" style="margin-bottom:12px">`

**W5 – Challenge** (bereich_dashboard-45)
Z. 273: `<div class="row between" style="margin-bottom:6px">` → `<div class="row between chal-head">`; `<div class="big-stat" style="font-size:30px;margin:0">` → `<div class="big-stat">`; beide `<div class="small muted" style="margin-top:8px">` → `<div class="small muted chal-foot">`.

**W6 – Regel-Tracker** (bereich_dashboard-45, komponenten-12)
Z. 287: `<div class="caption" style="text-transform:none;letter-spacing:0;font-size:13px;font-weight:600;color:var(--text-2)">` → `<div class="tracker-cap">`; `<div class="row" style="gap:12px;flex-wrap:nowrap">` → `<div class="row tracker-score">`; `<a class="btn" href="#/progress">` → `<a class="btn sm" href="#/progress">`. Breite `style="width:…%"` bleibt.

**W7 – Auslöser in Feature-Widgets neutral** (komponenten-1; deckt sich mit Gruppe Farbe bereich_dashboard-1, nur einmal umsetzen)
Z. 334 und Z. 354 `class="btn sm primary"` → `class="btn sm"`; Z. 365 `class="btn sm${key === 'vor' ? ' primary' : ''}"` → `class="btn sm"`; Z. 373 `class="btn sm primary"` → `class="btn sm"`; Z. 374 (Mentor-Widget, Inline-Formular) `class="btn primary"` → `class="btn"`.

### 3.5 web/js/datepicker.js, rangepicker.js, certificate.js, store.js, sample.js

**D1 – datepicker.js: Uhrzeit im App-Wähler** (bereich_prop-52)
- Z. 11 `const TYPES = { date: 1, 'datetime-local': 1, month: 1 };` → `{ date: 1, 'datetime-local': 1, month: 1, time: 1 }`
- `render()` (Z. 74–84): für `input.type === 'time'` nur `${timeHTML()}${foot}` rendern (kein Monatsraster), Popover-Breite 132 px (Klasse `time` am Popover, CSS `.popover.dp.time { width: 132px; }`). Fuß: „Löschen“ nur ohne `required`, „Fertig“.
- `timeHTML()` (Z. 65) und `setTime()` (Z. 118–119): bei `type=time` die Zeit aus `input.value.slice(0, 5)` lesen statt `slice(11, 16)` und mit `write(inp, `${pad(h)}:${pad(m)}`)` ohne Tagesteil schreiben.
- `open()` (Z. 176): bei `type=time` `view.mode = 'time'`, `focusKey` leer.
- CSS (app.css Z. 392–393): `.input[type="time"]` in beide Selektorlisten der Datumsfelder aufnehmen (eigenes Symbol rechts, nativer Indikator aus), Symbol: Uhr statt Kalender.
- Gilt für prop.js:149, shadow.js:38, dash-filter.js:125–126. Die 24-h-Darstellung im Feld liefert die Anzeige-Überlagerung aus wording-2 (zustaende-20).

**D2 – rangepicker.js: einzelner Monat zeigt das Zeitraumende** (responsiv-23)
- Neu am Modulanfang: `const oneMonth = () => !!(window.matchMedia && matchMedia('(max-width: 700px), (min-width: 961px) and (max-width: 1000px)').matches);`
- In `pick()` (Z. 59) und im `else`-Zweig von `reset()` (Z. 29): wenn `oneMonth()`, dann `const e = parse(st.to) || now; st.view = { y: e.getFullYear(), m: e.getMonth() };`, sonst wie bisher den Vormonat. Gespeicherte eigene Zeiträume zeigen weiter den Startmonat. CSS Z. 223 und 386 bleiben.

**D3 – certificate.js** (komponenten-26, komponenten-25, komponenten-18)
- Z. 73 `<div class="seg sm">` → `<div class="seg">`
- Z. 85: beide `class="btn round sm"` → `class="btn nav"`
- Format-Zeile: Labels ohne `<small>` (`[k, v.label]`), direkt nach dem Segment `<div class="hint">${f.w} × ${f.h} px</div>` (`f` = `FORMATS[o.format]`, die Seitenleiste wird bei jedem Formatwechsel neu gerendert).

**D4 – store.js: Daily Journal nicht grün** (bereich_notebook_news-31)
Z. 56 `['daily', 'Daily Journal', '#34f58a']` → `['daily', 'Daily Journal', '#9aa3a0']`. Beim Laden (dort, wo Standardordner ergänzt werden) einmalig: Ordner mit `id === 'daily'`, `isDefault` und Farbe `#34f58a` (ohne Groß-/Kleinschreibung) bekommen `#9aa3a0`.

**D5 – sample.js: Ordner ohne Emoji** (referenz-39)
Z. 284: `name: '📈 Strategie'` → `'Strategie'`, `'💡 Ideen'` → `'Ideen'`. Keine Migration installierter Beispieldaten.

### 3.6 web/js/screens/*.js

**S-coach (coach.js)** (bereich_konto-10, bereich_konto-5, komponenten-1, bereich_konto-45, bereich_konto-49, bereich_konto-22, bereich_konto-9)
- `I.replay` → `I.refresh` in Z. 47, 115, 157 und 265; Z. 121 „Aufgabe an alle“ `${I.check}` → `${I.plus}`.
- Neutral: Z. 22 `<a class="btn primary" href="#/settings/mentor">` → `<a class="btn" …>`; Z. 53 „+ Gruppe“ `btn sm primary` → `btn sm`; Z. 129 „Speichern“ (Notiz bearbeiten) `btn sm primary` → `btn sm`; Z. 140 „Notiz senden“ `btn sm primary` → `btn sm`; Z. 148 „Aufgabe geben“ `btn sm primary` → `btn sm`. Z. 178, 197, 271 bleiben primary.
- Wortwahl: Z. 115 „Neuen Einladungslink erzeugen“ → „Einladungslink erneuern“; Z. 284 Titel → „Einladungslink erneuern?“, `ok: 'Erneuern'`; Z. 285 Toast → „Einladungslink erneuert“; Z. 265 „Neuen Link erzeugen“ → „Link erneuern“; Z. 349 Toast → „Co-Coach-Link erneuert“.
- Z. 48 `<a href="#/notebook">Im Notebook ansehen</a>` → `<a class="tlink" href="#/notebook">Im Notebook ansehen</a>`
- Z. 296 (`coach-note-draft`) und Z. 313 (`coach-reply-draft`) als erste Anweisung: `if (!(window.CSS && CSS.supports('field-sizing', 'content'))) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight + 2, 160) + 'px'; }`
- Die 5 Felder `class="input sm"` (Z. 77, 109, 148 zweimal, 263) bleiben, sie bekommen ihre Höhe aus C03.
- Z. 66 bleibt (Zählung „1 erledigt“/„n erledigt“).

**S-coupons (coupons.js)** (bereich_konto-49)
Z. 6 `class="cpn-link"` → `class="cpn-link"` bleibt (Darstellung kommt aus C33, kein `tlink`, das ↗ kennzeichnet den Link).

**S-dash-filter (dash-filter.js)** (komponenten-21)
Z. 141 `footHTML` →
```js
return `<span class="fd-n">${n === 1 ? '1 Trade' : fmt.int(n) + ' Trades'}</span><span class="fd-btns">${count(f) ? '<button type="button" class="btn sm ghost" data-action="dash-f-reset">Zurücksetzen</button>' : ''}<button type="button" class="btn sm primary" data-action="dash-f-apply">Anwenden</button></span>`;
```
Kopf mit × (Z. 145) bleibt.

**S-dashboard (dashboard.js)** (bereich_dashboard-47, komponenten-18, bereich_dashboard-45, komponenten-1)
- Z. 32: in `.tpl-row` den Knopf `data-action="dash-tpl-edit" … title="Bearbeiten"` (Stift) entfernen.
- Z. 33 (Untermenü) als ersten Eintrag einfügen: `<button type="button" class="item" data-action="dash-tpl-edit" data-id="${t.id}">${I.edit}<span>Bearbeiten</span></button>`. Den Eintrag `data-action="dash-tpl-default"` nur bei `!t.isDefault` ausgeben, Text immer „Als Standard festlegen“ (kein `disabled`, kein „Ist Standard“). Der obere Eintrag „Diese Vorlage bearbeiten“ (Z. 31) bleibt (e2e klickt `#pop-tpl [data-action="dash-tpl-edit"]`, erster Treffer).
- Z. 53 `<div class="dashed" style="text-align:center;padding:30px">` → `<div class="dashed dash-empty">`
- Z. 130 „Beispieldaten laden“ `btn sm primary` → `btn sm`
- Z. 184 (Challenge-Dialog, viermal) und Z. 195 („Neue Vorlage“, „Name“): `<label class="field"><span>` → `<label class="field"><span class="lbl">`
- Z. 63 (`sp-add … primary`) und Z. 119 (Bearbeitungsleiste) bleiben.

**S-day (day.js)** (komponenten-25, bereich_trades_tag-38, referenz-20, bereich_trades_tag-43, zustaende-14)
- Z. 12: beide `class="btn round"` → `class="btn nav"`; `<h2 style="font-size:18px;margin-left:6px">` → `<h2 class="day-title">`; Link „Heute“ (nur an anderen Tagen) `class="btn sm ghost"` → `class="btn sm"`, Platz bleibt am Anfang der rechten Gruppe. Die Pille „Heute“ regelt Gruppe Farbe (komponenten-8).
- Z. 14: die handgeschriebene `<div class="stats">…</div>` → `${App.dayStatsHTML(s, { n: trades.length, open: trades.length - closed.length, closed: closed.length })}` (innerhalb der bestehenden `.day-card`).
- Z. 16 (Check-in): das äußere `<div class="grid" style="grid-template-columns:repeat(3,1fr);gap:8px">` mit den drei `<div class="strat-stats" style="margin:0;grid-template-columns:1fr">…</div>` → `<div class="day-card"><div class="stats" style="grid-template-columns:repeat(3,1fr);margin-top:0">` + je Wert `<div><div class="k">${k}</div><div class="v"${col ? ` style="color:${col}"` : ''}>${v}</div></div>` + `</div></div>`.
- Z. 19 „Tagesnotiz anlegen“ (Leerzustand) `btn sm primary` → `btn sm`.

**S-mentor (mentor.js)** (bereich_training-2, bereich_training-1, bereich_training-37, komponenten-1)
- Z. 81 `<section class="card mentor">` → `<section class="card mentor-chat">`
- Z. 82 `${I.clock}` → `${I.refresh}` (aria-label und data-tip bleiben).
- Z. 85 `class="mentor-note small faint"` → `class="mentor-disclaimer small"`
- Z. 79 `<a class="btn primary" href="#/settings/mentor">` → `<a class="btn" …>`. Z. 84 (Senden) bleibt primary.

**S-misc (misc.js, Einstellungen)** (bereich_einstellungen-11, bereich_einstellungen-2, komponenten-30, komponenten-17, bereich_einstellungen-35, komponenten-36, bereich_einstellungen-40, komponenten-1, komponenten-27)
- Z. 14 `head`: `${trailing}` → `<span class="save-state" aria-live="polite"></span>${trailing}`
- Profil, Z. 46: `<form data-action="save-profile" class="set-block stack" …>` → `<form data-action="save-profile" data-change="save-profile" class="set-block stack" …>`. Z. 58: den Knopf `Speichern` entfernen, „Passwort zurücksetzen“ bleibt allein in der Reihe. Handler `save-profile` (Z. 276): `U.toast(…)` und `rerender()` entfernen, stattdessen `App.savedHint()`; `rerender()` nur, wenn sich `currency` geändert hat. Das Avatar-Feld behält sein eigenes `data-change="avatar-file"` (wird über `closest` zuerst gefunden).
- Privatsphäre, Z. 60: `<form data-action="save-privacy">…</form>` (Checkbox + „Speichern“) → `${switchRow('Support-Team Zugriff auf mein Konto erlauben', 'Wenn aktiviert, kann das Support-Team auf dein Konto zugreifen, um dir besser zu helfen und Fehler zu finden.', 'privacy-toggle', priv.support)}` (h3 und Untertitel bleiben). Neue Aktion: `'privacy-toggle'(el) { const on = !(S.settings.privacy || {}).support; S.setSetting('privacy', Object.assign({}, S.settings.privacy, { support: on })); el.setAttribute('aria-checked', String(on)); App.savedHint(); }`. Handler `save-privacy` (Z. 283) löschen.
- Z. 62 „2FA aktivieren“ `btn primary sm` → `btn sm`.
- Konten, Z. 186: „Konto hinzufügen“ `class="btn sm primary"` → `class="btn"`.
- Trading, Z. 192: `<form data-action="save-trading" …>` → zusätzlich `data-change="save-trading"`. Z. 193 `class="chip sel big"` → `class="chip sel"`. Z. 195: Segment „Einheit“ `['abs', cur]` → `['abs', fmt.curSym(cur)]`; Von/Bis: `<div class="input-unit"><span>${unit}</span><input class="input" … id="be-from" …></div>` → ``${App.unitField(`<input class="input" type="number" step="0.01" max="0" id="be-from" name="from" value="${be.from}" inputmode="decimal">`, unit, 'w160')}`` (inneres Markup als Template-String mit Backticks, damit `${be.from}` eingesetzt wird), „Bis“ entsprechend mit `min="0" id="be-to" name="to" value="${be.to}"`. Z. 198 („1 R entspricht“): das bisherige `<input …id="se-runit"…>` unverändert in ``App.unitField(`…`, cur, 'w160')`` setzen. Z. 199: Labels „Tagesverlustlimit (% vom Konto)“ → „Tagesverlustlimit“, „Ruin-Schwelle Monte Carlo (% Drawdown)“ → „Ruin-Schwelle (Drawdown)“; beide bisherigen `<input …>` (Namen `dailyLossLimitPct`, `ruinDrawdownPct` bleiben) in ``App.unitField(`…`, '%')`` (Rasterbreite, kein `w160`). Z. 200 (Tilt-Checkbox) → `<div style="margin-top:14px">${switchRow('Tilt-Warnungen', 'Warnt auf dem Dashboard bei Verlustserien, Größenerhöhung nach Verlust, Revenge-Trades und erreichtem Tageslimit.', 'tilt-toggle', st.tiltWarnings)}</div>`. Z. 201 (`Speichern`) entfernen. Neue Aktion: `'tilt-toggle'(el) { const on = !S.settings.tiltWarnings; S.setSetting('tiltWarnings', on); el.setAttribute('aria-checked', String(on)); App.savedHint(); }`. Handler `save-trading` (Z. 335): `st.tiltWarnings = fd.get('tiltWarnings') === 'on';` streichen, `U.toast` und `rerender()` → `App.savedHint()` (`C.setBreakEven` bleibt).
- Regeln, Z. 207: `<form data-action="add-rule" class="row" style="margin-top:14px">` → `<form data-action="add-rule" class="row add-row" style="margin-top:14px">`; Knopf `btn sm primary` → `btn`.
- Notebook, Z. 214: `<form data-action="save-notebook" …>` → zusätzlich `data-change="save-notebook"`. Z. 220 (Checkbox „Erledigte Punkte durchstreichen“) → `${switchRow('Erledigte Punkte durchstreichen', 'Abgehakte Einträge in To-do-Listen werden durchgestrichen.', 'nb-strike-toggle', nb.strike)}`. Z. 221: Knopf `Speichern` entfernen, „Auf Standard zurücksetzen“ bleibt. Neue Aktion: `'nb-strike-toggle'(el) { const nb = Object.assign({}, NB_DEFAULT, S.settings.notebook || {}); nb.strike = !nb.strike; S.setSetting('notebook', nb); root.Theme.apply(S.settings); el.setAttribute('aria-checked', String(nb.strike)); const pc = document.querySelector('#nb-preview .pv-check'); if (pc) pc.classList.toggle('strike', nb.strike); App.savedHint(); }`. `nb-preview` (Z. 343): den Teil mit `[name=strike]` löschen und am Ende `App.actions['save-notebook'](form)` aufrufen. `save-notebook` (Z. 344): `strike: fd.get('strike') === 'on'` → `strike: Object.assign({}, NB_DEFAULT, S.settings.notebook || {}).strike`; `U.toast` und `rerender()` → `App.savedHint()`.
- Inhalte, Z. 238: „Tag hinzufügen“ `btn sm primary` → `btn sm`.
- Logs (bereich_einstellungen-40): Z. 255 am Import-Papierkorb `style="color:var(--loss)"` entfernen. Wenn `imps.length === 0`: statt Tabelle `<div class="tbl-wrap"><div class="empty" style="min-height:140px">${I.upload}<b>Noch keine Imports</b><span class="small">CSV-Importe und eingespielte Sicherungen erscheinen hier.</span></div></div>`. Z. 260: wenn `(S.data.logs || []).length === 0` dasselbe Muster mit `${I.clock}`, „Noch kein Verlauf“ und dem bisherigen Untertext; liefern nur Suche/Filter keine Treffer, bleibt die Tabelle und die Leerzeile sagt „Keine Einträge gefunden“. Z. 259 Platzhalter „Typ suchen“ → „Verlauf durchsuchen“.
- Z. 231 und 250 (`.set-tabs`) bleiben im Markup; das Aussehen kommt aus C20.
- Mentor (Z. 154–158) bleibt Formular mit „Speichern“.

**S-notebook (notebook.js)** (bereich_notebook_news-32, referenz-39, bereich_notebook_news-34, bereich_notebook_news-20, bereich_notebook_news-31, bereich_notebook_news-30, komponenten-1, komponenten-30, zustaende-14, komponenten-2)
- Z. 51: `${x.isDefault ? folderIcon(x).replace('<svg', '<svg class="ico"') : ''}` → `${folderIcon(x).replace('<svg', '<svg class="ico"')}` (eigene Ordner bekommen `I.folder`).
- Z. 61: „Neue Notiz“/„Tag loggen“ `btn sm primary grow` → `btn sm grow`; Auswahlmodus `${I.check}` → `${I.checkSquare}`; Sortieren `${I.arrowDown}` → `${I.sort}` (Tooltips bleiben).
- Z. 66 (Leerzustand rechts) `btn sm primary` → `btn sm`. Z. 67 „Wiederherstellen“ `btn sm primary` → `btn sm`.
- Tag-Menü (Z. 26–31, 77): über `.tagcols` (außerhalb, damit `refreshTags` es nicht ersetzt) `<div class="tagpop-q"><input class="input" id="nb-tag-q" placeholder="Tags suchen" aria-label="Tags suchen" data-input="nb-tag-q" autocomplete="off"></div>`. Gruppen stehen untereinander (CSS C29). Den Fuß `<hr><button … data-action="nb-tag-new" …>Neuen Tag anlegen</button>` (Z. 77) entfernen. Neuer Handler `nb-tag-q`: blendet `.item` aus, deren `data-name` den Suchtext nicht enthält (ohne Groß-/Kleinschreibung), leere Gruppen ebenso; ist der Suchtext nicht leer und gibt es keinen gleichnamigen Tag, steht ganz oben `<button type="button" class="item" data-action="nb-tag-new" data-id="${cur.id}" data-name="${esc(q)}">${I.plus}<span>„${esc(q)}“ als Tag anlegen</span></button>`. `nb-tag-new` legt den Tag mit `data-name` ohne Dialog an (`S.ensureTag`) und weist ihn zu. `refreshTags` (Z. 36) wendet nach dem Neuaufbau den aktuellen Suchtext erneut an.
- Ordner-Dialog: Z. 5 `'#34f58a'` aus `FOLDER_COLORS` streichen (8 Farben). Z. 115 `color: FOLDER_COLORS[3]` → `color: '#8b7cf6'`. Z. 116: Platzhalter „z. B. 📈 Strategie“ → „z. B. Strategie“; statt `<label class="color-field">…<span class="small muted">eigene</span></label>` als letzten Kreis in `.swatches`: `<label class="swatch add" aria-label="Eigene Farbe" data-tip="Eigene Farbe" aria-pressed="${!FOLDER_COLORS.includes(cur.color)}"><i style="background:${FOLDER_COLORS.includes(cur.color) ? 'transparent' : cur.color}">${FOLDER_COLORS.includes(cur.color) ? I.plus : ''}</i><input type="color" name="custom" value="${cur.color}" data-input="fo-color-custom" aria-label="Eigene Farbe"></label>`. Handler `fo-color-custom` (Z. 158): zusätzlich das `<i>` des Plus-Kreises in der Farbe einfärben, Plus entfernen, `aria-pressed="true"` setzen.
- Teilen-Dialog (Z. 170): `<textarea class="input mono" id="share-link" readonly style="min-height:90px">…</textarea>` → `<input class="input" id="share-link" readonly value="${esc(link)}" style="text-overflow:ellipsis">`, beim Fokus markieren (`onMount`: `el.querySelector('#share-link').addEventListener('focus', e => e.target.select())`). Hinweis → „Wer den Link öffnet, sieht die Notiz nur lesend. Bilder erscheinen als Platzhalter.“; nur wenn `location.protocol === 'file:'` eine zweite Zeile `<p class="small muted">Der Link funktioniert für andere erst mit der Adresse deiner veröffentlichten Website.</p>`. Fuß: `<a class="btn ghost" href="${esc(link)}" target="_blank" rel="noopener">${I.external} Öffnen</a><button type="button" class="btn primary" data-action="nb-copy" data-target="share-link">${I.copy} Link kopieren</button>`.

**S-progress (progress.js)** (komponenten-25)
Z. 71: beide `class="btn round"` (act-scroll) → `class="btn nav"`.

**S-prop (prop.js)** (hierarchie-28, responsiv-46, zustaende-14, komponenten-1, komponenten-30, bereich_prop-18, komponenten-18)
- Z. 82 Leerzustand `class="btn primary"` → `class="btn sm"`.
- Z. 97 „Als bestanden markieren“ `btn sm primary` → `btn sm`.
- Z. 146 `<label class="field"><span>${esc(lbl)}</span>` → `<label class="field"><span class="lbl">${esc(lbl)}</span>`.
- Z. 244: in `U.card('Deine Konten', accTable, { trailing: …, info: … })` die Option `trailing` streichen.
- Z. 251 `entryBtn`: `class="btn sm${e[kind] ? '' : ' primary'}"` → `class="btn sm"`.
- Z. 262 und Z. 266 (Absenden „Ausgabe erfassen“/„Payout erfassen“ im Inline-Formular) `class="btn primary"` → `class="btn"`.
- Z. 264 und Z. 268 `<div class="tbl-wrap">` → `<div class="tbl-wrap inset">`.
- Z. 294 `${I.plus}<span class="hide-m">Prop-Konto</span>` → `${I.plus}<span>Konto anlegen</span>`.

**S-ruhepunkt (ruhepunkt.js)** (bereich_training-41, bereich_training-48)
- Z. 55–58 (`P.seufzer`): `short` ergänzen: `{ label: 'Durch die Nase einatmen', short: 'Einatmen', … }`, `{ label: 'Kurz nachziehen', short: 'Nachziehen', … }`, `{ label: 'Lang durch den Mund ausatmen', short: 'Ausatmen', … }`.
- Z. 248 `h('b', null, p.label)` → `h('b', null, p.short || p.label)`.
- Z. 606–609: `var cb = h('input', { type: 'checkbox' });` → `var cb = h('input', { type: 'checkbox', class: 'vh' }); var box = h('span', { class: 'rp-box', 'aria-hidden': 'true' }); box.innerHTML = I.check;` und `return h('label', null, cb, h('span', null, it[1]));` → `return h('label', null, cb, box, h('span', null, it[1]));` (`checked`-Vorbelegung und Listener bleiben).

**S-shadow (shadow.js)** (komponenten-25, bereich_trades_tag-34)
Z. 73 (Seitenwahl): Knöpfe in `.pg-nav` bekommen `class="btn nav"`; Seitenauswahl und `.pg-nav` nur bei mehr als einer Seite; `${from + 1} – ${…}` → `${from + 1}–${…}` (Schlüssel „{0}–{1} von {2} Verstößen“). Z. 109 bleibt `btn sm`.

**S-stats (stats.js)** (bereich_statistik-6, referenz-23, komponenten-27, bereich_statistik-19)
- Z. 15: `<a class="btn" href="#/stats/${k}" aria-pressed="${tab === k}" style="${tab === k ? '' : 'color:var(--text-2)'}">` → `<a href="#/stats/${k}" aria-pressed="${tab === k}">` (Klassen `tabs scroll-x` und `data-subnav` am Behälter bleiben).
- Z. 34 (`groupTable`): `<div class="tbl-wrap">` → `<div class="tbl-wrap inset">`.
- Z. 32 (Tage): `<div class="tbl-wrap"><table…>…</table></div>` → `${U.card('Alle Handelstage', '<div class="tbl-wrap inset"><table…>…</table></div>')}`.

**S-trades (trades.js)** (bereich_trades_tag-11, bereich_trades_tag-34, zustaende-14, komponenten-25, bereich_trades_tag-43, bereich_trades_tag-30, komponenten-1)
- Z. 44: `<span class="muted small" style="margin-left:auto">${rows.length} von ${list.length} Trades</span>` nur ausgeben, wenn `f.q || f.symbol || f.setup || f.status || f.mistake`.
- Z. 45 Leerzustand „Trade loggen“ `btn sm primary` → `btn sm`.
- Z. 48 (Seitenwahl): das zweite `<label class="pg-l">` (Seitenauswahl, „von n Seite(n)“) und `<span class="pg-nav">` nur bei `pages > 1`; Knöpfe in `.pg-nav` `class="btn nav"`; `${from + 1} – ${…}` → `${from + 1}–${…}` (Schlüssel „{0}–{1} von {2} Trades“). „Trades pro Seite“ und `.pg-info` bleiben immer.
- Z. 54 (Tageskarten): `<span class="pnl ${U.cls(d.pnl)}">Netto ${fmt.cur(d.pnl, { signed: true })}</span>` → `<span class="pnl"><span class="muted">Netto</span> <span class="${U.cls(d.pnl)}">${fmt.cur(d.pnl, { signed: true })}</span></span>`; die sieben handgeschriebenen Kennzahlen → `${App.dayStatsHTML(C.summary(d.trades), { style: 'margin-top:0' })}`.
- Z. 59 (Verpasste Trades): `<th>Symbol</th>` → `<th colspan="2">Symbol</th>`; `<td class="sym">${esc(x.symbol)} ${U.badge(x.direction)}</td>` → `<td class="sym">${esc(x.symbol)}</td><td class="dir-cell">${U.badge(x.direction)}</td>`.
- Z. 84 „30 Sekunden aufnehmen“ `btn sm primary` → `btn sm`; Z. 85 „Bearbeiten“ `btn primary sm` → `btn sm`.
- Verpasst-Dialog Z. 110: `<div class="form-grid">` → `<div class="form-grid cols3">` (CSS: `.form-grid.cols3 { grid-template-columns: repeat(3, minmax(0, 1fr)); } @media (max-width: 560px) { .form-grid.cols3 { grid-template-columns: 1fr; } }` nach app.css Z. 301). Reihenfolge: Datum | Symbol | Richtung, dann Setup | Hätte gebracht | R, dann „Warum nicht gehandelt?“ (`span2` → volle Breite). Symbol `<input class="input" id="m-symbol" name="symbol" required>` → `${App.symbolField('')}`; Richtung `${U.seg([[1,'Long'],[-1,'Short']], 1, 'set-dir')}<input type="hidden" name="direction" value="1">` → `${App.dirField(0)}` (keine Vorwahl). „Hätte gebracht (P&L)“ → „Hätte gebracht“ mit `App.curField({ name: 'pnl', id: 'm-pnl', value: '', accountId: S.defaultAccountId() })`; „R-Multiple“ → „R“. Am `U.modal(…)`-Aufruf des Dialogs die Option `{ onClose: () => App.closeSymbolMenu(), onMount: el => App.noLabelFocus(el) }` ergänzen (wie im Trade-Dialog), damit das Symbol-Menü mit dem Dialog schließt. Das versteckte Feld heißt weiter `name="symbol"` (`#f-symbol`), `save-missed` liest es unverändert.
- Z. 112 (`save-missed`) vor dem Speichern: `if (!fd.get('symbol')) return U.toast('Symbol fehlt', 'err'); if (!fd.get('direction')) { const sw = form.querySelector('#f-dir'); sw.classList.remove('need'); void sw.offsetWidth; sw.classList.add('need'); return U.toast('Long oder Short wählen', 'err'); }` und `direction: Number(fd.get('direction'))`.

### 3.7 web/js/lang/*.js

**L1 – Übersetzungen** (alle Befunde mit Wortwahl: bereich_trades_tag-11, hierarchie-47, hierarchie-28, bereich_konto-45, bereich_einstellungen-35, bereich_einstellungen-40, bereich_statistik-19, bereich_trades_tag-43, bereich_trades_tag-34, bereich_notebook_news-20, bereich_dashboard-47)
Neue/umbenannte Schlüssel in en, es, zh, hi, pt (englischer Wert zur Orientierung, die anderen Sprachen sinngemäß):
- „Hätte gebracht“ → „Would have made“
- „Konto anlegen“ (falls nicht vorhanden) → „Add account“
- „Einladungslink erneuern“ → „Renew invite link“; „Einladungslink erneuern?“ → „Renew invite link?“; „Erneuern“ → „Renew“; „Link erneuern“ → „Renew link“; „Einladungslink erneuert“ → „Invite link renewed“; „Co-Coach-Link erneuert“ → „Co-coach link renewed“
- Schlüssel „Profil vervollständigen“ umbenennen in „Profil ergänzen“ (en „Complete profile“, es/pt „Completar perfil“, hi/zh Wert unverändert)
- „Tagesverlustlimit“ → „Daily loss limit“; „Ruin-Schwelle (Drawdown)“ → „Ruin threshold (drawdown)“
- „Verlauf durchsuchen“ → „Search history“; „Keine Einträge gefunden“ → „No entries found“; „Noch kein Verlauf“ → „No history yet“ (falls fehlt); „CSV-Importe und eingespielte Sicherungen erscheinen hier.“ → „CSV imports and restored backups appear here.“
- „Alle Handelstage“ → „All trading days“; „Netto“ → „Net“
- Schlüssel „{0} – {1} von {2} Trades“ → „{0}–{1} von {2} Trades“ (en „{0}–{1} of {2} trades“), „{0} – {1} von {2} Verstößen“ → „{0}–{1} von {2} Verstößen“ (Zielwerte ebenfalls ohne Leerzeichen um den Strich)
- „Tags suchen“ → „Search tags“; „„{0}“ als Tag anlegen“ → „Create tag “{0}”“ (nur, weil „Neuen Tag anlegen“ dort schon übersetzt ist)
- „Bearbeiten“, „Als Standard festlegen“ (falls fehlen) → „Edit“, „Set as default“
- Ruhepunkt- und Teilen-Texte nur, wenn der Bereich dort Einträge hat (heute nicht).

### 3.8 web/README.md

**R1** (komponenten-1, komponenten-21, bereich_einstellungen-2, bereich_einstellungen-11, komponenten-16, komponenten-27, zustaende-14, ki_look-11, bereich_notebook_news-32, bereich_notebook_news-20)
- Z. 80: „„Anwenden“ zeigt live die Zahl der Trades“ → „unten links steht live die Zahl der Trades“.
- Z. 120 (Notebook): ergänzen „Eigene Ordner tragen links ihren Farbbalken und ein Ordner-Symbol. Das Tag-Menü ist eine Spalte mit Suche; ein neuer Tag entsteht direkt aus der Suche.“
- Z. 171 (Einstellungen): ergänzen „Alle Einstellungen außer Mentor speichern sofort; „Gespeichert“ erscheint kurz neben dem Bereichstitel. Ja/Nein-Optionen sind Schalter.“
- Z. 190: ergänzen „Heute ist der einzige gefüllte Kreis (Textfarbe), Wochentage ohne Kästen.“
- Nach Z. 210 neuer Absatz **Bausteine**: „Knöpfe: Auslöser (Anlegen, Öffnen, Starten) sind neutral, Anlegen mit Plus; `.btn.primary` nur im Fuß von Dialogen und Popovern und beim Absenden des Hauptformulars einer Seite; Leerzustände: Symbol, Titel, ein Satz, Aktion als `btn sm`. Reiter: Bereichs-Navigation als Schiene, Unteransichten und Reiter in Karten mit Unterstrich. Pfeile: ein Baustein `.btn.nav` (34 px). Menüs: gewählter Eintrag neutral grau hinterlegt, Haken nur in Listen mit Einzelwahl.“
- Z. 227: ergänzen „Gilt für alle Zahlenfelder der App.“
- Nach Antwort auf N1/N2 Z. 191 und Z. 207–208 nachziehen.

### 3.9 web/e2e

**E1 – Tests an geänderte Bedienung anpassen** (bereich_einstellungen-2, bereich_einstellungen-11, bereich_notebook_news-20, responsiv-23, bereich_training-48, bereich_shell-20, hierarchie-47, bereich_statistik-8)
- settest.js:22: statt Klick auf `form[data-action="save-trading"] button[type=submit]` → `await p.press('#be-to', 'Tab')`; settest.js:31: Klick auf den Notebook-Speichern-Knopf entfernen (`selectOption` löst `change` aus).
- settest2.js:9–16: nach dem letzten `fill` `await p.press('#pf-addr', 'Tab')`; Privatsphäre: `await p.click('[data-action="privacy-toggle"]')`, gleiche Prüfung `Store.settings.privacy.support === true`.
- sixtest.js:57: in `#nb-tag-q` „Sixtest“ tippen, dann `#pop-nbtags [data-action=nb-tag-new]` klicken (kein Prompt-Dialog mehr).
- rangetest.js:18: `'#pop-range [data-rr="prev"]'` → `'#pop-range [data-rr="prev"]:visible'`.
- rptest.js:46: `p.click('.rp-checks input')` → `p.click('.rp-checks label')`.
- navdottest.js:8 und :53, coachtest.js:94, :98, :127, sidebartest.js:27: `.title` bzw. `getAttribute('title')` an `.nav-dot`/`.sb-av-dot` → `getAttribute('aria-label')`.
- usercardtest.js:11: `'Trader / Profil vervollständigen'` → `'Trader / Profil ergänzen'`.
- mobiletest.js:27: Erwartung `st.v === '20px'` → `st.v === '22px'`.

---

## 4. Akzeptanzkriterien

### 4.1 grep-Prüfungen (im Ordner `web/`)

| Prüfung | Erwartung |
|---|---|
| `grep -rn "btn round" js` und `grep -n "\.btn\.round" css/app.css` | 0 Treffer |
| `grep -n "\.empty svg\|\.empty b " css/app.css` | 0 Treffer; `\.empty > svg` 1 Treffer |
| `grep -n "spin-button" css/app.css` | genau 1 Zeile (die globale Regel) |
| `grep -rn 'class="field"><span>' js` | 0 Treffer |
| `grep -n "segc\|rp-switch\|input-unit\|chip\.sel\.big\|tabs\.sm\|seg\.pill" css/app.css` | 0 Treffer |
| `grep -n "I.replay" js/screens/coach.js`; `grep -n "I.clock" js/screens/mentor.js` | 0 Treffer |
| `grep -n "accent" css/app.css` in den Regeln `.popover .item[aria-checked`, `.sym-opt[aria-selected`, `.tpl-row`, `.tpl-menu`, `.nb .tagpop`, `.ed-pop .item .chk`, `.set-tabs`, `.prop-sub`, `.cal .d.today`, `.cal.mini .d.today`, `i.today`, `.check input`, `.prop-assign-row input`, `.coach-radio input`, `.ql-ui`, `.nb-ytpop`, `.dropzone`, `.rep-sel`, `.btn.primary:hover` (box-shadow) | kein `--accent`/`--accent-soft`/`--accent-glow` mehr |
| `grep -n "font-weight: 600" css/app.css` in `.prop-tabs a`, `.prop-sub a`, `.set-tabs`, `.fd-seg button`, `.fd-chip`, `.fd-add`, `.nb .tagpill`, `.rep-sel`, `.tpl-row.on`, `.btn.fw-reset` | 0 Treffer |
| `grep -rn 'title="\${label}"' js/app.js` | 0 Treffer |
| `grep -rn "Profil vervollständigen\|Neuen Einladungslink\|R-Multiple</label>\|Typ suchen" js --include=*.js` (ohne lang/) | 0 Treffer |
| `grep -n "primary" js/screens/{coach,notebook,prop,misc,trades,day,dashboard,mentor}.js js/widgets.js` | nur noch die erlaubten Stellen aus 1.3 (Dialog-/Popover-Fuß, coach.js:178/197/271, misc.js:158, mentor.js:84, dashboard.js:63/119) |
| `grep -n "style=\"font-size:15px;min-width:140px\|font-size:30px;margin:0\|text-transform:none;letter-spacing:0\|text-align:center;padding:30px" js` | 0 Treffer |

### 4.2 Gerenderte Werte (Playwright, dunkel, 1440 px, Beispieldaten; Zensus-Skript erneut laufen lassen)

- Jede Route: `.topbar .menu-btn` hat `display: none`; `.topbar h1` beginnt bei x = 256 (Kante des Inhalts). Bei 390 px ist `.menu-btn` sichtbar und öffnet die Leiste (motiontest).
- Dashboard, TradeLog, Statistiken, Notebook, Prop: alle Knöpfe in `.dash-head > .row` (direkt oder in `.popwrap`) 42 ± 0,5 px hoch; Vorlage, Zertifikat, Session (≤1180), Notebook-Filter 42 px breit (Filter mit Zähler ≥ 42).
- 1440 px: „Session starten“ zeigt Text; 1180 px und 390 px: nur Symbol, 42×42; Dashboard ohne `[data-action=start-session]`.
- `leer_trades`, `leer_shadow`, `leer_prop`, Tagesansicht ohne Notiz: Knöpfe im Leerzustand 34 ± 0,5 px hoch, ihr SVG 16×16, keiner hat Klasse `primary`.
- Trade-Ansicht ohne Screenshots: Dropzone-SVG 24×24, Karte „Screenshots“ < 200 px hoch; Hover-Rand nicht grün.
- Trade-Dialog: Einstieg, Eröffnet, Punktwert, Symbol alle 41,6 ± 0,5 px; kein Spin-Knopf (`::-webkit-inner-spin-button` mit `appearance: none`); „€“ endet 12 px vor dem Feldrand.
- Verpasst-Dialog: Klick auf „Short“ → `aria-pressed` Short = true, verstecktes Feld = -1; Speichern ohne Richtung zeigt Toast „Long oder Short wählen“ und speichert nichts.
- Statistiken bei 1024 px mit offener Seitenleiste: Reiterleiste `scrollWidth ≤ clientWidth`; Leiste außen 42 px; kein Reiter mit Klasse `btn`. Kacheln: `.stat-tile .k` 13.5px/500, `.stat-tile .v` 25px.
- TradeLog: Reiter-Schiene außen 42 px; Spark-Kachel: Wert 25px und auf gleicher Höhe (±1 px) wie die Werte der Nachbarkacheln; Trennlinie unter dem Titel vorhanden.
- Prop: Kopfreihe Schiene und „+ Konto anlegen“ beide 42 px; Karte „Deine Konten“ ohne Knopf im Kopf; bei 390 px steht im Kopfknopf Text.
- Prop → Bilanz und Statistik → Setups/Richtung/Kombinationen/Uhrzeiten: kein `.tbl-wrap` ohne `inset` innerhalb einer `.card`. Statistik → Tage: Tabelle in Karte „Alle Handelstage“.
- Kalender-Widget: `.cal .wd` ohne Rand und Fläche; genau ein `.cal .d .n` mit nicht transparentem Hintergrund (heute) und dessen Farbe = `--text`; Pfeile 34×34, Radius 9.
- Menüs (Zeitraum, Konto, Vorlage, Konto-Menü unten, Symbol-Menü, Filter-Suche): alle Einträge 13px/500, Höhe ≥ 36 px; gewählter Eintrag: Farbe = `--text`, Hintergrund = `--surface-2`, Gewicht 500. Konto-Menü: Haken links, Namen bündig. Vorlagen-Menü: Stern in `--muted`, kein Stift in der Zeile, „Bearbeiten“ im Untermenü.
- Filter-Popover: Fuß links „n Trades“ (`.fd-n`, 13px `--muted`), rechts `btn sm` „Anwenden“ (34 px) ohne Haken; „Zurücksetzen“ nur bei aktivem Filter.
- Zeitraum bei 390 px mit „Dieser Monat“: sichtbarer Monat = aktueller Monat mit Band.
- Einstellungen → Trading: keine native Checkbox, kein Knopf `type=submit`; „Tilt-Warnungen“ ist `.switch`; Von/Bis/1 R und die beiden %-Felder zeigen das Zeichen im Feld; Feld ändern + Tab → `.set-head .save-state` zeigt „Gespeichert“ und `Store.settings` ist aktualisiert. Profil: kein „Speichern“, Privatsphäre ist Schalter. Einstellungen → Design: keine Schlagschatten an `.tc-prev`, `.dot[aria-pressed=true]` ohne `scale`.
- Einstellungen → Logs ohne Importe: keine `thead` sichtbar, Leerzustand im Kasten; Platzhalter „Verlauf durchsuchen“.
- Mentor-Chat: `.mentor-disclaimer` ohne Rand und Fläche, Farbe = `--muted`, Kontrast ≥ 4,5:1; ein eingefügtes `<div class="mn-reply mentor">` mit einer Zeile ist < 80 px hoch.
- Notebook: alle Ordnernamen beginnen auf derselben x-Position (±1 px); Farbbalken gerade (`::before`, 3 px); Tag-Menü 280 px breit, eine Spalte, Suchfeld oben, keine farbigen Köpfe, kein Eintrag halb abgeschnitten innerhalb der Notizspalte.
- Hell (light-1440): Affiliate- und Prop-Kennzahlenleisten ohne weiche Schatten zwischen den Kacheln; runder „Trade loggen“-Knopf (390 px) mit neutralem Schatten, Plus sichtbar, ohne `--accent-glow`.
- Coach (mit Server): Felder `.input.sm` 34 px neben `btn sm` 34 px (Unterkanten bündig ±0,5); Symbole „Aktualisieren“/„Jetzt abgleichen“/„Link erneuern“ = Kreispfeile; Haken „Kurz-Stats“ bei 390 px 15×15; Antwortfeld ohne Größen-Griff; „1 erledigt“ mit CSS-Chevron.

### 4.3 Screenshot-Prüfpunkte (dark und light, 1440/1024/390 neu aufnehmen)

`notebook.png` („Neue Notiz“ neutral, ▷ und Filter gleich hoch wie Suche), `stats.png` (Schiene statt 9 Rahmen), `trades.png` (Schiene, Seitenwahl ohne Pfeile bei einer Seite, kein doppelter Zähler), `prop.png`/`prop_konten.png`, `pop_vorlage.png`, `pop_zeitraum.png` (dark-390: aktueller Monat), `pop_filter.png`, `pop_konto.png`, `dashboard.png` (Kalender, Kopfreihe), `day.png`, `modal_trade_loggen.png`, `modal_checkin.png` (1–5 als `.scale5`), `modal_zertifikat.png` (Format-Schiene in einer Zeile, Pfeile eckig), `settings_trading.png`, `settings_profil.png`, `settings_design.png`, `settings_logs.png`, `leer_*.png`, `menu_konto_unten.png`, `sidebar_mini.png` (App-Tooltip rechts), `extra/tl-1440-modal_verpasst.png`, `extra/hicks-tr-1440-mentor_chat.png`, `extra/nbnw/dark-1440_pop_tags.png`, `extra/nbnw/dark-1440_modal_ordner.png`, `extra/nbnw/dark-1440_modal_teilen.png`, `extra/hicks-prop-1440-bilanz.png`, `extra/hicks-tr-1440-rp_nach_4_abschluss.png`.

### 4.4 Tests

`web/e2e/runall.sh` vollständig grün, insbesondere headtest, sixtest, dashtest, fwtest, gaptest, filtertest, rangetest, dptest, mobiletest, langtest (keine abgeschnittenen `.seg`-Tasten), calmnavtest, chartanimtest, proptest, friedhoftest, affiliatetest, sampletest, settest, settest2, coachtest, navdottest, sidebartest, usercardtest, rptest, mentortest, tlfittest, shadowtest, certtest; `node --test web/tests/*.mjs` grün.

---

## 5. Zurückgestellt

| id | Teil | Grund |
|---|---|---|
| komponenten-14 | feste Höhe 40 px für `.input`/`.select` | Knöpfe sind ebenfalls 41,6 px; nur Felder zu ändern schafft in jeder Feld-Knopf-Zeile eine neue Abweichung. Ein Höhen-Token ist Sache der Abstände-Spezifikation (Inventar A5). |
| bereich_statistik-8 | Austausch `.stat-tile` gegen `U.tile` | bricht sixtest:39, motiontest:18/57, mobiletest:26; `.stat-grid` ist belegt; brächte die Verlaufslinie als neue Dekoration. Maße werden angeglichen (C25). |
| komponenten-45 | Umbau von `.pill` (≈50 Stellen) und „Long/Short“ statt „LONG/SHORT“ | Großbuchstaben-Abzeichen ist dokumentiert (README Z. 45–47, app.css:607); `.pill` hat viele eigene Überschreibungen. Nur die Höhen werden angeglichen. |
| komponenten-12 | `.rp-btn` (Ruhepunkt) und volle Vereinheitlichung `.big` | Ruhepunkt ist laut README ein eigener Raum mit Phasenfarben; `.big` kommt nur im versteckten Blind-Replay vor (dort nur gekürzt). |
| komponenten-11 | 28-px-× im Filterkopf | Kopf eines Popovers, anderer Kontext als die Kopfreihe. |
| bereich_einstellungen-11 (Ergänzung referenz-33) | `.set-block` als flache Abschnitte | Geschmack ohne Fehlerbeleg; würde Felder direkt auf `--bg` legen und neue Brüche erzeugen. |
| ki_look-11 (Ergänzung hierarchie-42) | leere Zukunftstage ohne Rand | das Raster würde ungleich. |
| bereich_konto-10 | `I.replay` im Friedhof („Umdrehen“) | außerhalb des Bereichs, eigene Bedeutung; nur die Coach-Stellen werden getauscht. |
| bereich_einstellungen-35 | feste Breite 160 px für die %-Felder | sie stehen in `.form-grid` neben einem Select; 160 px wäre dort kürzer als der Nachbar (K17). |
| responsiv-17 | voll grüne runde Scheibe | widerspricht der Entscheidung „Trade loggen ruhiger“ (Commit 96b165b, Kommentar app.css:3135); nur neutraler Schatten. |
| bereich_trades_tag-38 | „Heute“ zwischen Pfeile und Datum verschieben | das Datum würde beim Wechsel auf heute seitlich springen. |
| referenz-39 | Umbenennen schon installierter Beispieldaten | keine Migration fremder Daten; gilt ab Neuinstallation. |
| bereich_dashboard-11 | Hover von Kalendertagen und Tracker-Zellen entfernen; `--lift-shadow` löschen | beide sind klickbar (Rückmeldung richtig); das Token nutzt landing.css:56. |
| komponenten-21 | × im Filter entfernen; neue Titelgröße | × nötig am Handy und in filtertest.js:39; Titelgröße regelt die Typografie-Spezifikation. |
| bereich_notebook_news-20 | 6-px-Farbpunkte vor Tag-Gruppen | Gruppen haben schon Köpfe, Punkte wären neue Dekoration. |
| komponenten-44 | Filter-Sterne als `.scale5`; Einfärben der Check-in-Auswahl über `App.scaleColor` | Filter ist eine Mehrfachauswahl mit „★★★“-Tasten; farbige Auswahl ist abgelehnt. |
| bereich_training-41 | Kurzlabels „Ein“/„Aus“ | mehrdeutig, „Aus“ kollidiert als Übersetzungsschlüssel (Off). |
| bereich_prop-52 | eigenes Textfeld für die Reset-Uhrzeit | drittes Bedienmuster für Uhrzeiten; stattdessen Zeit-Modus im App-Wähler (D1). |
| komponenten-33 | eigener Checkbox-Nachbau `.cbx`; Checklisten-Box 16 px | `accent-color: var(--text)` erzeugt dasselbe neutrale Bild ohne Risiko; die Box ist ein Zeilen-Schalter, 20 px passt. |

---

## 6. Nutzer fragen

**N1 – Farbe des gefüllten Hauptknopfs** (komponenten-1, bereich_konto-5; dieselbe Frage stellt Gruppe Farbe mit referenz-6)
Frage: „Grün soll nur Gewinn und ‚Trade loggen‘ zeigen. Die gefüllten Bestätigen-Knöpfe in Dialogen (‚Speichern‘, ‚Anwenden‘, ‚Konto anlegen‘ …) sind heute vollflächig grün. Sollen sie (A) grün bleiben, (B) eine neutrale Vollfläche in Textfarbe bekommen (dunkel: fast weiß mit dunkler Schrift, hell: fast schwarz mit heller Schrift) oder (C) nur eine ruhige graue Fläche?“
Empfehlung: **B.** Nach den Schritten dieser Spezifikation steht `.btn.primary` nur noch in Dialogen, Popovern und Hauptformularen, also fast nie neben „Trade loggen“; im Dialog braucht die eine Bestätigung eine klare Fläche, C wäre von „Abbrechen“ kaum zu unterscheiden. Umsetzung B: app.css Z. 274 → `.btn.primary { background: var(--text); border-color: var(--text); color: var(--bg); font-weight: 600; }`, Z. 275 → `.btn.primary:hover { background: color-mix(in srgb, var(--text) 86%, var(--bg)); border-color: color-mix(in srgb, var(--text) 86%, var(--bg)); box-shadow: none; }`; README Z. 207–208 „Grün bleibt für Gewinne, den Akzent-Knopf ‚Trade loggen‘, Schalter und den Balken am aktiven Eintrag; gefüllte Hauptknöpfe sind neutral.“ (Variante C: `background: var(--surface-3); border-color: var(--border-2); color: var(--text);`, Hover `color-mix(in srgb, var(--text) 8%, var(--surface-3))`.) Zusatzfrage: „Soll ‚Trade speichern‘ im Trade-Dialog stattdessen wie ‚Trade loggen‘ aussehen?“ Empfehlung: nein, alle Dialog-Bestätigungen gleich.

**N2 – Tagesbetrag im Kalender: Onest 800 oder 700** (ki_look-11)
Frage: „In der README steht für den Kalender ‚am PC kräftiger, Onest 800‘. Deine allgemeine Regel sagt ‚nur Werte 700‘. Soll der Tagesbetrag im Kalender auf 700 wie alle anderen Werte?“
Empfehlung: **ja, 700.** Dann app.css Z. 721 `.cal .d .p { font-weight: 800; … }` → `font-weight: 700;` und README Z. 191 „(am PC kräftiger, Onest 800)“ → „(Onest 700 wie alle Werte)“.

**N3 – Statusspalte in TradeLog und Tagesansicht** (ki_look-19)
Frage: „Jede Trade-Zeile zeigt eine Pille ‚Gewinn/Verlust‘, obwohl P&L und RR schon eingefärbt sind. Sollen wir die Spalte ‚Status‘ entfernen? Der Filter ‚Alle Ergebnisse‘ bleibt, Break-even-Trades werden dann neutral eingefärbt, offene Trades erkennt man an ‚offen‘ in ‚Geschlossen‘. Sortieren nach Status entfällt.“
Empfehlung: **ja.** Umsetzung: trades.js:7 `['status', 'Status']` aus `COLS` streichen; trades.js:49 Zelle `<td>${U.statusPill(t.status)}</td>` streichen und die P&L-Zelle `U.pnl(t.pnl, t.status === 'be' ? 'neu' : '', { r: t.r })`, RR `U.rText(t.r, t.status === 'be' ? 'neu' : '')`; day.js:15 `<th>Status</th>` und die Status-Zelle streichen. Pille in der Trade-Ansicht (trades.js:67) bleibt.

**N4 – Profilbild oben rechts zusätzlich zur Konto-Karte** (hierarchie-47, niedrige Priorität)
Frage: „Oben rechts führt das Profilbild zum Profil, unten links öffnet die Konto-Karte dasselbe und mehr. Soll das Profilbild oben rechts am PC wegfallen?“
Empfehlung: **nein, behalten.** Zeitraum, Konto und Filter stehen laut README „auf Höhe des Avatars“, das Zeitraum-Menü richtet sich an ihm aus, das Start-Skelett zeigt ihn. Umgesetzt wird nur der abgeschnittene Untertitel („Profil ergänzen“).

**N5 – „Session starten“ auf dem Dashboard** (referenz-5, niedrige Priorität)
Frage: „Auf allen Seiten außer dem Dashboard steht neben ‚Trade loggen‘ der Knopf ‚Session starten‘. Du hattest festgelegt: auf dem Dashboard kein Session-Knopf. Soll das so bleiben?“
Empfehlung: **ja, so lassen** (README Z. 64–65; sixtest.js:13–14 und voicetest.js:21 prüfen das). Umgesetzt wird nur die Beschriftung auf den anderen Seiten.
