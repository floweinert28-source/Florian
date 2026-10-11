# Wording-Inventar der deutschen Oberfläche (Journalyst)

Stand: 11.10.2026. Teil des Design-Audits (siehe `audit/BRIEF.md`).

## 0. Umfang und Methode

Quellen und Zählung:

- `audit/strings-de.json`: 2023 Einträge, davon 416 Zeitzonen-Namen (Profil → Zeitzone, keine Oberflächentexte) → 1607 echte Texte.
- Code (`web/js/app.js`, `ui.js`, `widgets.js`, `screens/*.js`, `coach.js`, `certificate.js`, `editor.js`, `voice.js`, `store.js`, `core.js`, `prop.js`, `propsim.js`, `shadow.js`, `app.html`): 2365 sichtbare Texte extrahiert (Template-Literale, Attribute `placeholder/title/aria-label/data-tip`, `U.empty/toast/confirmModal/card/tile/kv`, `info:`), davon rund 1200 nicht in `strings-de.json` (neuer als die Sammlung: Coach, Ruhepunkt, Prop-Dialoge, Notebook-Papierkorb, Tilt-Warnungen, Edge-Texte, Zertifikat-Dialog).
- Nach Rolle klassifiziert: 131 Knopftexte (+17 Link-Knöpfe), 32 Seitentitel, 31 Leerzustand-Titel, 95 Toasts, 27 Bestätigungsdialoge, 112 Info-Tooltips, 38 Platzhalter, 69 Tabellenköpfe, 109 Feldnamen, 85 Hilfstexte.
- Screenshots `audit/shots/dark-1440/*.png` und `audit/shots/extra-dark-1440/*.png` als Beleg für das, was wirklich gerendert wird.
- Prüfung der Belege (11.10., zweiter Durchgang): alle `datei:zeile`-Angaben gegen den aktuellen Code geprüft und korrigiert (Verschiebungen in app.js, misc.js, prop.js, notebook.js, certdata.js, screens/coach.js); day.png, modal_trade_loggen.png, prop_cockpit.png, prop_konten.png, pop_zertifikat.png und dashboard.png bestätigen W-04, W-05a, W-06, W-08, W-23b, W-23f. „Letzter Login“ wird nicht mehr gerendert (W-23g angepasst); neu dazu W-05c und W-44.
- Prüfregeln: `.claude/skills/writing-guidelines/rules.md` (aktive Stimme, Du, keine Gedankenstriche als Satzzeichen, echte Ellipse, keine Marketing-Wörter, Loading-Texte mit „…“).

Schwere: 1 = fällt sofort auf oder stört die Bedienung, 2 = deutlich sichtbare Inkonsistenz, 3 = Feinschliff. Jeder Befund hat eine Nummer (W-xx), Beleg und Vorschlag (vorher → nachher). „Berührt Vorgaben“ steht nur, wenn ein Vorschlag die Vorgaben aus dem Brief streift (Aufbau darf geändert werden, wenn begründet).

Zuerst die Kurzfassung der drei wichtigsten Probleme, weil sie durch die ganze Oberfläche laufen:

1. **Vier Wörter für eine Kennzahl** („Trefferquote“, „Win-Rate“, „Winrate“, „Win rate“), teils auf demselben Bildschirm (W-01).
2. **Dieselben Wörter für verschiedene Dinge**: „Mentor“ (KI-Chat und menschlicher Coach), „Konto“ (Journal-Konto, Prop-Konto, Benutzerkonto), „Session“ (Trading, Ruhepunkt, Replay), „Check-in“ (zwei Formulare mit zwei Skalen), „Ampel“ (Prop-Risiko und Tagesform), „Journal“ (App, Bereich, Notebook-Notizen), „Tag“ (Schlagwort und Datum) (W-02, W-03, W-17 bis W-21).
3. **Dieselbe Aktion mit zwei Knöpfen auf einem Bildschirm** („Trade loggen“ und „Trade für diesen Tag“; „Prop-Konto“ und „Konto anlegen“; „Check-in“ und „Check-in nachtragen“) (W-04).

---

## 1. Glossar: Fachbegriffe, Varianten, Vorkommen, Empfehlung

Spalten: Begriff (Sache) · Varianten in der Oberfläche mit Beleg · Zahl der Fundstellen (eindeutige Texte) · Empfehlung (Stammform, die überall gilt).

### 1.1 Kennzahlen

| Sache | Varianten (Beleg) | Fundstellen | Empfehlung |
|---|---|---|---|
| Anteil Gewinn-Trades | „Trefferquote“ (Kachel „Trade-Trefferquote“, widgets.js:169; „Tages-Trefferquote“ widgets.js:173; Coach, Replay, Recap) · „Win-Rate“ (Radar-Achse core.js:265; Statistik-Kachel core.js:319; „Ø Tages-Win-Rate“ core.js:323; Tabellenkopf stats.js:31; Session-beenden-Dialog app.js:529; Tagesansicht day.js:14; Tilt-Text core.js:546) · „Winrate“ (Coach: screens/coach.js:96 „Ø Winrate“, 113 Tabellenkopf, 121 Info-Text; widgets.js:115 title="Winrate" an der Serien-Kachel) · „Win rate“ (Zertifikat certificate.js:23, englisches Dokument) | 27 / 4 / 3 / 1 | **Trefferquote** überall in der deutschen Oberfläche; „Trade-Trefferquote“ und „Tages-Trefferquote“, wenn beide nebeneinander stehen. „Win rate“ nur im englischen Zertifikat. |
| Netto-Ergebnis | „Netto-P&L“ (18) · „Netto P&L“ ohne Bindestrich (Dashboard-Kachel widgets.js:165, dashboard.png oben links, direkt neben „Netto-P&L pro Tag“) · „P&L“ allein (41, u. a. TradeLog-Spalte trades.js:7, Prop-Karten) · „Netto-Ergebnis“ (9, nur Tooltips) · „Netto-Tagesergebnis“ (1) · „Tages-P&L“ (5) · „Ergebnis“ (28) · „Net result“ (Zertifikat) | 18/1/41/9/1/5/28 | **Netto-P&L** als Beschriftung (Kacheln, Spalten, Achsen); in Fließtext „Netto-Ergebnis“ erlaubt, aber nicht beides im selben Tooltip. „P&L“ allein nur in Spalten, wenn der Platz fehlt und das Netto aus dem Kontext klar ist (TradeLog). |
| Erwartungswert je Trade | „Trade-Erwartungswert“ (core.js:316) und „Ø Netto-P&L pro Trade“ (core.js:317) sind **dieselbe Zahl** (stats_summary.png: beide Kacheln zeigen +89,30 €); dazu „Erwartungswert pro Trade“ (Widget widgets.js), „Ø {0} pro Trade“ (Kachel-Untertitel), „Erwartungswert je Setup“ (stats.js:39) | 4 Namen | **Erwartungswert** (Kachel „Erwartungswert“, Untertitel „pro Trade“). Eine der beiden Statistik-Kacheln streichen (siehe W-41). |
| Profit-Faktor | „Profit-Faktor“ (11) · „Profit Factor“ (propsim.js:234, 236; Prop-Auswertungstext „… Ø R, Profit Factor, Max. Drawdown“) | 11 / 3 | **Profit-Faktor** |
| Break-even | „Break-even“ (15) · „Breakeven“ (widgets.js, Beschreibung der Trefferquote-Kachel: „Gewinnern, Breakeven und Verlierern“) · „BE“ nirgends im Text (nur Farb-Schlüssel) | 15 / 1 | **Break-even** |
| Konsistenz (Score-Achse) | „Konsistenz“ (Radar-Achse, Info widgets.js:226) · „Konstanz“ (Widget-Beschreibung widgets.js:226 „Drawdown und Konstanz“, Report-Gruppe „Serien & Konstanz“ widgets.js:206) · „Consistency“ (Prop-Regel, 8) | 3 / 3 / 8 | **Konsistenz** für die Score-Achse und die Report-Gruppe; „Consistency Rule“ bleibt der Prop-Fachbegriff (siehe 1.4). |
| Drawdown, maximal / durchschnittlich | „Max. Drawdown“ (7) · „Maximaler Drawdown“ (Widget-Name widgets.js) · „Durchschnittlicher Drawdown“ (Widget-Name) · „Ø Tages-Drawdown“ (core.js) · „Max. Drawdown übrig“ (Prop) · „Ø Max. Drawdown“ (Coach) | 7 / 1 / 1 / 1 | Beschriftungen: **Max. Drawdown**, **Ø Drawdown**; ausgeschrieben nur im Fließtext. Widget-Namen angleichen (widgets.js: „Maximaler Drawdown“ → „Max. Drawdown“, „Durchschnittlicher Drawdown“ → „Ø Drawdown“). |
| Durchschnitt | „Ø“ (61 Beschriftungen) · „Durchschnittlich…“ (9, nur Tooltips) · „im Schnitt“ (1) · „Mittelwert“ (3) | | **Ø** in Beschriftungen, „durchschnittlich“ im Satz. Gut so, keine Änderung außer den zwei Widget-Namen oben. |
| Maximum | „Max.“ (25) · „Maximal …“ (Regeltexte, 15) · „Maximale/r …“ (Ruhepunkt, Challenge-Dialog „Maximaler Verlust“) · „Höchstens“ (4) | | Beschriftungen **Max.**; Sätze „höchstens“. „Maximaler Verlust“ (dashboard.js:182, Challenge-Dialog) → „Max. Verlust“ (wie Widget-Fuß „Ziel: {0} · max. Verlust {1}“). |
| R-Multiple | „R“ (Spalte „RR“ im TradeLog trades.js:7 = realisiertes R) · „Ø R“ (Tagesansicht) · „Ø geplantes R-Multiple“ / „Ø realisiertes R-Multiple“ (Statistik) · „R-Wert“ (Edge: „Trades mit R-Wert“) · „R-Einheit“ (Geld-blind) · „RR“ | | Spalte **R** (nicht „RR“, das ist das geplante Chance-Risiko-Verhältnis, nicht das Ergebnis); Kacheln „Ø R (geplant)“ / „Ø R (realisiert)“; „R-Wert“ → „R“. |
| Haltedauer | „Haltedauer“ (konsistent) · Einheiten „12 min“, „1 h 22 min“ (fmt.dur) vs. Filter „Min.“/„Std.“/„Tage“ (dash-filter.js:127) | | fmt.dur-Schreibweise auch im Filter: „min · h · d“ oder ausgeschrieben „Minuten · Stunden · Tage“. |

### 1.2 Trade-Felder

| Sache | Varianten (Beleg) | Empfehlung |
|---|---|---|
| Einstiegs-/Ausstiegskurs | Dialog „Einstieg“/„Ausstieg“ (app.js:354, modal_trade_loggen.png) · TradeLog-Spalten „Einstiegspreis“/„Ausstiegspreis“ (trades.js:7, trades.png) · Fehler-Toasts „Einstiegskurs fehlt“/„Ausstiegskurs fehlt für geschlossenen Trade“ (app.js:476) · Trade-Detail „Einstieg“/„Ausstieg“ (trades.js:68) · CSV-Import „Einstiegskurs nicht lesbar“ (core.js:504) · „Screenshot vor Entry“ (trades.js:80, 9 Fundstellen) neben „Chart vor dem Einstieg“ (replay.js:61, 5) | Feld und Spalte **Einstieg** / **Ausstieg**; im Satz „Einstiegskurs“. „Screenshot vor Entry“ → **„Chart vor dem Einstieg“** (Name existiert schon). |
| Zeitpunkte | Dialog und TradeLog „Eröffnet“/„Geschlossen“ (app.js:359, trades.js:7) · Trade-Detail „Eröffnung“/„Schluss“ (trades.js:68, trade_detail.png) · CSV-Platzhalter „Eröffnung;Schluss;…“ (app.js:560) · Import-Vorschau „Eröffnung“/„Schluss“ (app.js:567) · Filter „Einstiegszeit“/„Ausstiegszeit“ (dash-filter, Widget-Zahnrad widgets.js:234) | **Eröffnet** / **Geschlossen** (Zeitpunkte) überall; „Schluss“ nur als Wort in Sätzen („ist für heute Schluss“). Filter: „Eröffnet (Uhrzeit)“ / „Geschlossen (Uhrzeit)“. |
| Positionsgröße | „Kontrakte“ (Dialog app.js:356) · „Stück × Punktwert“ (Detail trades.js:68) · „Stück“ (CSV app.js:560, Import-Tabelle app.js:567) · „Stückzahl“ (core.js:318 „Gehandelte Stückzahl pro Handelstag“, Feldliste core.js:444) · „Stück / Kontrakte“ und „Positionsgröße“ (Filter) · „Max. Kontrakte/Lots“ (Prop) · „Volumen“ (Kennzahl) | Feld **Kontrakte** (Futures-Fokus, so steht es schon im Dialog); Kennzahl **Volumen**; Filter „Kontrakte“; „Stück“ und „Stückzahl“ streichen. Prop: „Max. Kontrakte“ (Lots nur bei Forex-Konten, dann „Max. Lots“). |
| Gebühren | „Gebühren“ konsistent; „Gebühr“ (Prop-Preset-Spalte) | ok |
| Richtung | „Long“/„Short“ (Dialog, Filter) · „LONG“/„SHORT“ als Text in der Pille (ui.js:175) | Pillen-Text „Long“/„Short“, Versalien per CSS (siehe W-24). |
| Status/Ergebnis | TradeLog-Spalte „Status“ mit Werten „Gewinn/Verlust“ (trades.png) · Filter heißt „Ergebnis“ (dash-filter) und „Alle Ergebnisse“ (TradeLog-Filter) · Werte „Gewinn / Verlust / Break-even / Offen“ | Spalte und Filter **Ergebnis**; „Offen“ gehört zu „Offen / Geschlossen“, nicht zum Ergebnis (im TradeLog-Filter „Alle Ergebnisse“ steht „Offen“ als vierte Option, trades.js:42). |
| Plan | „Plan“ (Geplanter Einstieg, Stop, Ziel) · „Plan & Bewertung“ (Dialogtitel app.js:416) · „Plan vs. Ausführung“ (Karte) · „Plan ergänzen“ (Knopf) · „Begründung“ | ok; Dialogtitel „Plan & Bewertung“ → „Plan und Bewertung“ (siehe W-27 zu „&“). |
| Bewertung | „Bewertung“ (Sterne) · Filter „Reviewed/Unreviewed“ und „Trade-Bewertung“ (dash-filter) | „Reviewed“ → **Bewertet**, „Unreviewed“ → **Unbewertet**; Filter-Gruppe „Bewertung“. |

### 1.3 Aktionen rund um den Trade

| Sache | Varianten (Beleg) | Empfehlung |
|---|---|---|
| Trade anlegen | „Trade loggen“ (Hauptknopf app.js:253, Dialogtitel) · „Trade speichern“ (Dialog-Knopf app.js:368; beim Bearbeiten heißt derselbe Knopf schon „Speichern“) · „Trade für diesen Tag“ (Tagesansicht day.js:12, grün, day.png) · „neuer Trade“ (Tastaturhinweis misc.js:66 „N neuer Trade“) · „Logge einen Trade“ / „Logge Trades“ / „Logge deinen ersten Trade“ (Leerzustände) · „Trade anlegen“ nirgends | **Trade loggen** ist der eine Name der Aktion (auch im Tastaturhinweis „N Trade loggen“). Dialog-Knopf „Trade speichern“ → „Speichern“ (wie alle anderen Dialoge; der Titel sagt schon „Trade loggen“). „Trade für diesen Tag“ streichen (W-04). |
| Session | „Session starten“ (Kopfreihe app.js:250, Dialogtitel app.js:490) · „Session beenden“ · „Session gestartet“ (Checkliste) · „Session läuft. Viel Erfolg.“ (Toast) · Leerzustand „Starte den Tag mit „Session starten““ · Einstellungen „beim Session-Ende“ | Siehe W-17 (drei Bedeutungen). Innerhalb des Tradings konsistent. |
| Check-in | Dialog „Check-in {Datum}“ (app.js:524) mit Schlaf in Stunden, Stress 1–5, Stimmung 1–5 (app.js:516–517) · Tagesansicht „Check-in“ / „Check-in bearbeiten“ / „Check-in nachtragen“ (day.js:12,16) · Ruhepunkt „Check-in“ mit Schlaf/Stress/Stimmung 0–10 plus Körper und Ampel (mentor.js:42 „Schlaf {n}/10“, ruhepunkt.js:472 „von 10“) · Tagesansicht zeigt „Stress 3 / 5“ (day.js:16) | Siehe W-18. Ein Check-in, eine Skala. |
| Regeln | „Regeln“ (56) · „Regelwerk“ / „Mein Regelwerk“ (Schatten-Ich, 8) · „Handelsregeln“ (Einstellungen, 4) · „Tagesregeln“ (Ruhepunkt, 3) · „Regel-Check“ (Fortschritt, 3) · „Regel-Tracker“ (Widget, 2) · „Regeltreue“ (Score-Achse) · „Regelbruch“/„Regelbrüche“ (14) · „Verstöße“/„Regelverstöße“ (14) · „gebrochene Regeln“/„Regeln gebrochen“ (store.js:143) · „Gebrochene Regeln“ (Feld) | Zwei verschiedene Dinge, die beide „Regeln“ heißen: (a) die **Checklisten-Regeln** aus Einstellungen → Regeln (frei formulierte Sätze, abhaken), (b) das **Regelwerk** des Schatten-Ichs (sieben messbare Schalter). Empfehlung: (a) bleibt „Regeln“/„Handelsregeln“, (b) bleibt „Regelwerk“; Verstöße gegen (b) heißen einheitlich **„Verstöße“** (nicht „Regelbrüche“ und „Verstöße“ gemischt: shadow.js Kacheln „Verstöße“, Fuß „Regelbrüche haben dich das gekostet“); Verstöße gegen (a) heißen „gebrochene Regeln“ (Feld im Trade). |
| Setup | „Setup“/„Setups“ (35) · „Strategie“ (core.js:450 CSV-Feld, Coach „Playbooks und Strategien“) | **Setup**. CSV-Feldname „Strategie“ → „Setup“ (Erkennung von „Strategie“ als Spaltenname bleibt intern). |
| Fehler-Tags | „Fehler-Tags“ (9) · „Fehler“ (Reiter, Filter „Fehler: alle“/„Nur mit Fehler“, Kategorie) · „Fehler markiert“ · „Fehlerkosten“ | **Fehler-Tags** für das Feld, **Fehler** als Reiter/Kategorie. Filter „Fehler: alle“ → „Alle Fehler-Tags“ (wie „Alle Setups“), „Nur mit Fehler“ → „Mit Fehler-Tag“. |
| Offene Positionen | „Offene Positionen“ (Reiter, Hinweis-Punkt, 8) · „Offener Trade“ (Dialog-Vorschau app.js:469) · „Offen“ (Filter) · „noch offen“ | **Offene Positionen** (Mehrzahl, Liste), **offener Trade** (ein Datensatz). ok. |
| Verpasster Trade | „Verpasste Trades“ (Reiter) · „Verpassten Trade notieren“ (Dialog trades.js:110) · „Entgangen“, „Hätte gebracht“ (Kacheln) · Toast „Notiert“ | ok; Knopf im Reiter sollte „Verpassten Trade notieren“ heißen (nicht „Trade loggen“). |

### 1.4 Konten, Prop Firms

| Sache | Varianten (Beleg) | Empfehlung |
|---|---|---|
| Konto (drei Bedeutungen) | (a) **Journal-Konto**: Kopfzeile „Hauptkonto“/„Alle Konten“, „Konten verwalten“, Einstellungen → Konten („Alle angelegten Handelskonten“ misc.js:186), Dialog-Feld „Konto“ · (b) **Prop-Konto**: Nav-Gruppe „Konten“ (enthält nur Prop Firms und Coupon-Codes, app.js:19), Prop-Knöpfe „Prop-Konto“ (Kopfreihe prop.js:294) und „Konto anlegen“ (Karte prop.js:82, prop_konten.png), „Deine Konten“, „Aktive Konten“, Widget „Kein aktives Konto“ · (c) **Benutzerkonto**: Profil „Support-Team Zugriff auf mein Konto erlauben“, „Zusätzliche Sicherheit für dein Konto“ (misc.js:62), „Dein Journal hat noch kein Benutzerkonto“ (misc.js:280) | (a) **Konto** (Journal) · (b) **Prop-Konto** immer mit Präfix, auch in Knöpfen („Prop-Konto anlegen“) und Kacheln („Aktive Prop-Konten“); Nav-Gruppe „Konten“ → **„Prop Trading“** (begründet: die Gruppe enthält kein Journal-Konto) · (c) „Konto“ → **„Zugang“** / „Journal“ („Zugriff auf mein Journal erlauben“, „Sicherheit für deinen Zugang“). |
| Kontostand / Balance | „Kontostand“ (10, Journal) · „Balance“ (Prop, 7; Karten-Label „BALANCE“ prop_cockpit.png) · „Startbalance“, „Mindestbalance“ (Prop-Dialog) · „Startkapital“ (Journal) · „Kontogröße“ (10) | Journal: **Kontostand** und **Startkapital**; Prop: **Kontostand** statt „Balance“ (Label auf der Karte), „Startbalance“ → „Startkapital“, „Mindestbalance“ → „Mindest-Kontostand“. „Kontogröße“ bleibt für die Einstellung. |
| Prop Firm | „Prop Firms“ (Seitentitel, Nav) · „Prop-Firm-Bereich“, „Prop-Firm-Challenge“ · „Prop Firm“ (store.js:200 Verlaufstyp) · „Firma“ (13, in Tabellen und Sätzen) | Bereichsname **Prop Firms**; als Attribut mit Bindestrich „Prop-Firm-…“; in Tabellen **Firma**. store.js:200 „Prop Firm“ → „Prop-Konto“/„Konto-Vorlage“ je nach Eintrag. |
| Vorlage / Preset | „Vorlage“ (Dashboard-Vorlagen, Notebook-Vorlagen, 29) · „Preset“ (Prop, 22: „Eigene Presets“, „Preset anlegen“, „Preset ansehen“, „Preset löschen?“, „Preset kopiert – bitte Werte prüfen“) · Untertitel „Vorlagen für neue Konten“ direkt neben „Eigene Presets“ (prop_konten.png) · „Firma und Kontogröße (Preset)“ (Dialog) | **Konto-Vorlage** überall im Prop-Bereich (Überschrift „Konto-Vorlagen“, Knöpfe „Konto-Vorlage anlegen“, Toast „Konto-Vorlage gespeichert“). „Preset“ streichen. |
| Phasen/Status | „Challenge 1/2“, „Funded“ (Phase) · „Aktiv/Bestanden/Geplatzt/Archiviert“ (Status, Pillen prop_konten.png) · „bestanden, geplatzt oder archiviert“ (Klein geschrieben als Untertitel) · „Als geplatzt markieren“/„Als bestanden markieren“ · „Breach“ (Friedhof: „vom Start bis zum Breach“, „1 von 1 Breaches“, „Breach-Datum“ prop-friedhof.js:56; propsim.js:189,197) · „Konto geplatzt“ | Phase: **Challenge**, **Funded** (Branchenbegriffe, bleiben). Status deutsch: **aktiv, bestanden, geplatzt, archiviert**. „Breach“ → **„geplatzt“/„Platzen“** („vom Start bis zum Platzen“, „1 von 1 geplatzten Konten“, „Datum des Platzens“ → „† Datum“ passt zum Grabstein). |
| Regeln der Prop Firm | „Daily Loss“ (8) neben „Tagesverlust“/„Tagesverlustlimit“ (9; Einstellungen → Trading, Schatten-Ich „Max. Tagesverlust“) · „Profit Target“ (5) neben „Gewinnziel“ (5; Challenge-Widget) · „Consistency Rule“/„Consistency“ (8) · „Max. Drawdown“ · „Trailing“, „trailing Tagesende“, „trailing + Lock“ (prop.js:22) · „Drawdown-Boden“ · „Mindest-Handelstage“/„Mindesttage“ · „Profit Split“/„Split“ · „Payout“ (28) neben „Auszahlung“ (1) · „Reset“, „Aktivierung“ | Zwei Welten bewusst trennen: **Prop-Regeln tragen die Namen der Firmen** (Daily Loss, Profit Target, Consistency Rule, Max. Drawdown, Trailing, Lock, Payout, Split) und werden nie übersetzt; **Journal-Begriffe sind deutsch** (Tagesverlustlimit, Gewinnziel). Innerhalb der Prop-Welt dann konsequent: „Mindesttage“ → „Mindest-Handelstage“, „Auszahlung“ → „Payout“, Optionen groß „Trailing Tagesende“, „Trailing + Lock“. |
| Ampel | Prop: „Ampel Grün · {0} des Limits übrig“, „Ampel und Stop-Größe“, Widget „Aktive Prop-Konten mit Ampel“ (22) · Ruhepunkt: „Deine Ampel steht heute auf …“ (ruhepunkt.js:516), Mentor-Kontext „Ampel {amp}“ (mentor.js:42) | Prop behält **Ampel**. Ruhepunkt → **Tagesform** („Deine Tagesform heute: Gelb. Setz deine Limits …“). |
| Puffer / Stop-Größe | „Puffer“, „Puffer in Stops“, „noch 7 Stop-Losses“, „Stop-Größe“ | ok (Prop-Welt). „noch 7 Stop-Losses“ → „Puffer: 7 Stops“ ist kürzer, aber nicht nötig. |
| Cockpit | Reiter heißt „Übersicht“ (prop.js:6), der Friedhof-Leerzustand sagt „Konten, die du im Cockpit über „Als geplatzt markieren“ beendest“ (prop-friedhof.js:171); „Cockpit“ auch in Alt-Strings | „Cockpit“ → **„Übersicht“** (prop-friedhof.js:171). |

### 1.5 Bereiche, Zeit, Daten

| Sache | Varianten (Beleg) | Empfehlung |
|---|---|---|
| Zeitraum | „Zeitraum“ (39; „im Zeitraum“ 20, „im gewählten Zeitraum“ 7, „in diesem Zeitraum“ 2) · keine Konkurrenz („Periode“ 0) | **Zeitraum**; in Tooltips immer „im Zeitraum“ (das „gewählten“ ist überflüssig, der Zeitraum ist immer der gewählte). |
| Session (drei Bedeutungen) | (a) Trading-Session mit Check-in (22) · (b) Ruhepunkt-Sessions („Ruhepunkt-Sessions“, „Deine letzten Sessions“, „Session löschen?“ ruhepunkt.js:891) · (c) Blind-Replay („Trefferquote je Session“, „Sessions“, „Neue Session“ replay.js:83) neben „Runde“ (15) | (a) **Session** · (b) **Übung** („Deine letzten Übungen“, „Übung löschen?“, Einstellung „Zeigt in den Ruhepunkt-Übungen …“) · (c) **Runde** (Replay nutzt „Runde“ schon 15-mal; „Session“ dort streichen). |
| Journal (drei Bedeutungen) | (a) ganze App: „Dein Journal ist noch leer“ (dashboard.js:130), „Willkommen im Journal“ (store.js:363), „Dein Journal hat noch kein Benutzerkonto“ · (b) Nav-Gruppe „Journal“ (TradeLog, Tagesansicht, Notebook, News) · (c) Coach: „Journal-Einträge“ (10) = Notebook-Notizen; „Klick auf eine Zeile öffnet das Journal“ · Ordner „Daily Journal“ (store.js:56) · „Tagesjournal-Einträge“ (misc.js:214) | (a) **Journalyst** oder „dein Journal“ nur im Willkommenstext · (b) Nav-Gruppe bleibt „Journal“ · (c) Coach: **„Notizen“** („Notizen und Kurz-Stats“, „öffnet das Notebook“) · Ordner „Daily Journal“ → **„Tagesnotizen“**, „Trade Notes“ → **„Trade-Notizen“**, „Session Recap“ → **„Session-Rückblick“** (store.js:56; nur für neue Installationen oder per Migration) · „Tagesjournal-Einträge“ → „Tagesnotizen“. |
| Notebook / Notiz / Tagesnotiz | „Notebook“ (Bereich) · „Notiz“ (81) · „Tagesnotiz“ (12) · „Tag loggen“ als Knopf für eine neue Tagesnotiz (notebook.js:61) · „Tagesnotiz anlegen“ (day.js:19) · „Neue Notiz“ | **Notebook**, **Notiz**, **Tagesnotiz**. „Tag loggen“ → **„Tagesnotiz anlegen“** (gleicher Wortlaut wie Tagesansicht). |
| Tag (Schlagwort) vs. Tag (Datum) | Schlagwort: „Tag hinzufügen“, „Neuen Tag anlegen“, „Tag löschen“, „Tag entfernen“, „+ Tag“ (notebook.png), „Tags“ (18), „Fehler-Tags“ · Datum: „Bester Tag“, „Tag ansehen“, „Trade für diesen Tag“, „Tag loggen“, Tabellenkopf „Tag“ (stats.js:31) | „Tag“ als Schlagwort bleibt (eingeführt, kurz), aber **nie allein neben Datums-Kontext**: „Neuen Tag anlegen“ → „Tag erstellen“ bleibt zweideutig → **„Neues Tag“** mit sächlichem Artikel (Duden erlaubt „das Tag“ für das Schlagwort; die App nutzt „den Tag“) → Empfehlung: Schlagwort überall **„das Tag“** („Neues Tag anlegen“, „Dieses Tag entfernen“), Datums-Aktionen immer mit „Tagesansicht“/„Tagesnotiz“ („Tag ansehen“ → „Tagesansicht öffnen“). |
| Tagesansicht | „Tagesansicht“ (Nav, 4) · „Tag ansehen“ (Fortschritt) · Seitentitel „Tagesansicht“ · Tooltip „Klick öffnet die Tagesansicht“ | **Tagesansicht**; „Tag ansehen“ → „Tagesansicht öffnen“. |
| Statistik | Nav „Statistiken“ · Recap-Link „Zur Statistik“ (dashboard.js:128) · Zertifikat-Menü „Performance · Stats“ (certdata.js:11) · Coach „Kurz-Stats“ · Welcome-Text „Statistiken“ | Bereichsname **Statistiken** (Plural, wie Nav); Links „Zu den Statistiken“; „Stats“ → „Statistiken“; Coach „Kurz-Stats“ → „Kurz-Statistik“. |
| Dashboard-Bausteine | „Widget“ (11: „Widget hinzufügen“, „Maximal 5 Widgets“, „Widget suchen“) · „Karte“ in Tooltips („So viele Zeilen, wie in die Karte passen“ widgets.js:253) · „Kachel“ (0 in der Oberfläche, nur README/Brief) · „Kennzahl“ (Report) · Replay „Karten“ (Karteikasten) | Oberfläche: **Widget** für alles, was im Dashboard liegt; in Tooltips „in das Widget passen“. „Kachel/Karte“ nur intern. |
| Vorlage (Dashboard) | „Vorlage“, „Standard-Vorlage“, „Vorlage wählen/bearbeiten/erstellen“, Toasts „Vorlage „X“ erstellt/gespeichert/gelöscht“ | konsistent, gut. |
| Recap | „Wochen-Recap“, „Monats-Recap“, „Performance-Recap“ (10) · „Zusammenfassung“ (5, erklärend) · „Rückblick“ (Ruhepunkt) | **Recap** bleibt (kurz, als Produktwort eingeführt), Erklärtext „Zusammenfassung“ ok. Notebook-Ordner „Session Recap“ siehe oben. |
| Score | „Gesamt-Score“, „Dein Score“, „Score-Radar“ (Widget-Name) neben Karte „Gesamt-Score“, „Disziplin-Score“, „Tages-Score“, „Teilscore“, Spalte „Score“ | ok; Widget-Name „Score-Radar“ → „Gesamt-Score“ (so heißt die Karte). |
| Einstellungen des Widgets | „Zahnrad“ (4 Tooltips) · Knopf-Titel „Einstellungen“ (widgets.js:234) | Tooltip: „über das Zahnrad (Einstellungen des Widgets)“ einmal, sonst „über die Widget-Einstellungen“. |
| Mentor (zwei Rollen) | KI: „Mentor“ (Nav), „Mentor-Chat“, „Trading-Psychologie-Mentor“, „Mentor-Server“, Einstellungen → Mentor · Mensch: Coach-Bereich „Dein Mentor“, „Als Mentor“, „Mentor-Notizen“, „Notiz deines Mentors“, „Mentoren:“, „Neue Mentor-Notiz von {0}“ (coach.js, 72 Fundstellen „Mentor“ insgesamt, 31 „Coach“) | KI bleibt **Mentor**. Mensch heißt **Coach** („Dein Coach“, „Als Coach“, „Coach-Notizen“, „Neue Coach-Notiz von {0}“, „Co-Coach“ passt dann). Einstellungen-Bereich „Mentor“ → **„Server“** (er versorgt Mentor, Coach, News und Sprachnotizen; Untertitel sagt das heute schon in drei Sätzen). |
| Coach Mode | „Coach Mode einrichten“, „Dein Name im Coach Mode“, „Coach Mode läuft über …“ (coach.png) · Nav/Titel „Coach“ | **Coach** („Coach einrichten“, „Dein Name im Coach-Bereich“). |
| Schüler | „Schüler“ (35), „Als Schüler“ | ok (einheitlich). Alternativ „Trader“, aber nicht nötig. |

### 1.6 Englische Wörter: behalten oder ersetzen

Behalten (Branchen- oder Produktbegriffe ohne gebräuchliches deutsches Wort): Trade, TradeLog, Dashboard, Notebook, News, Setup, Long/Short, Stop, Stop-Loss, Drawdown, Break-even, Tilt, Edge, Monte Carlo, Score, Recap, Futures, Forex, Krypto, Prop Firm, Challenge, Funded, Payout, Daily Loss, Profit Target, Consistency Rule, Trailing, Copy-Trading, Overtrading, Revenge-Trade, Pullback, Breakout, Reversal, Coach, Mentor, Affiliate, Creator, Widget, Tag, Chart, Screenshot, CSV/JSON/PDF/PNG, MAE/MFE, R, P&L.

Ersetzen (es gibt ein klares deutsches Wort, und die Mischung fällt auf):

| Vorher (Beleg) | Nachher |
|---|---|
| „Reviewed“ / „Unreviewed“ (dash-filter.js, pop_filter.png-Bereich „Trade“) | „Bewertet“ / „Unbewertet“ |
| „Intraday / Multiday“ (dash-filter) | „Intraday / Mehrtägig“ |
| „Balance“ (Prop-Karten, prop_cockpit.png „BALANCE“) | „Kontostand“ |
| „Breach“/„Breaches“ (prop-friedhof.js:56, propsim.js:189) | „geplatzt“ / „Platzen“ |
| „Logs“ (Einstellungen-Abschnitt misc.js:7) mit Reitern „Imports“ / „Verlauf“ (misc.js:250) | „Verlauf“ mit Reitern „Importe“ / „Änderungen“ |
| „Coach Mode“ (coach.js) | „Coach“ |
| „Cockpit“ (prop-friedhof.js:171) | „Übersicht“ |
| „Preset“ (prop.js, store.js:200) | „Konto-Vorlage“ |
| „Winrate“/„Win-Rate“ | „Trefferquote“ |
| „Profit Factor“ (propsim.js) | „Profit-Faktor“ |
| „Stats“ (Zertifikat-Menü certdata.js:11) | „Statistiken“ |
| „Daily Profit / Weekly Profit / Monthly Profit / Performance“ als Haupttext im Zertifikat-Menü mit deutschem Nebentext „Tag/Woche/Monat/Stats“ (pop_zertifikat.png) | Haupttext deutsch „Tageszertifikat · Wochenzertifikat · Monatszertifikat · Performance-Zertifikat“, Nebentext englischer Dokumenttitel „Daily Profit“ usw. (das Dokument selbst bleibt englisch) |
| „Daily Profit Certificate“ (Tooltip day.js:12) | „Tageszertifikat erstellen“ |
| „Letzter Login:“ (nur noch im Wörterbuch strings-de.json; app.js rendert es nicht mehr) | Eintrag streichen; falls wieder sichtbar: „Zuletzt hier“ |
| „Trade Notes / Daily Journal / Session Recap“ (Ordner store.js:56) | „Trade-Notizen / Tagesnotizen / Session-Rückblick“ |
| „Report“ (Widget-Name widgets.js) | „Kennzahlen-Verlauf“ |
| „Skippen“ (Replay, versteckt) | bleibt, da Bereich versteckt; bei Freigabe „Auslassen“ |
| „Trading Journal App“ (Seitenleisten-Untertitel, app.js:210, `no-i18n`) | bleibt als Claim; prüfen, ob nötig (siehe Hinweise) |

---

## 2. Verstöße

### 2.1 Anrede, Ton, Stimme

- **Gut:** Durchgehend Du-Form, keine Sie-Form (die 7 „Sie“-Treffer sind Pronomen der 3. Person: „Sie erscheinen …“, „Sie landen …“).
- **W-33 · Einstellungen → Profil · Schwere 2.** „So gehen wir mit deinen Daten um.“ und Schalter „Support-Team Zugriff auf mein Konto erlauben“ (misc.js:60, settings_profil.png) sprechen in einer Firmenstimme („wir“, „Support-Team“) in einer App ohne Server und ohne Konto. Vorschlag: Abschnitt „Privatsphäre“ → Text „Deine Daten bleiben in diesem Browser. Es gibt keinen Server und keinen Support-Zugriff.“ und Schalter entfernen (oder bis zur Funktion ausblenden). Berührt Aufbau: ja (Abschnitt wird kleiner), begründet durch Wahrheit der Aussage.
- **W-38 · Einstellungen → Trading/Abo · Schwere 3.** Untertitel „Passe dein Trading-Erlebnis an.“ (misc.js:192) und „Verwaltung deines Plans.“ (misc.js:181) sind Floskeln („Erlebnis“ = Marketing). Vorschlag: „Instrumente, Break-even-Bereich, Geld-blind-Modus und Risiko-Warnungen.“ bzw. Abo: „Kostenlos, alle Funktionen enthalten.“ als Untertitel (Satz steht schon im Inhalt).
- **W-34 · überall · Schwere 3.** Imperativ mal mit, mal ohne -e: „Trage geplanten Einstieg …“ (trades.js:73), „Trage MAE und MFE …“ (trades.js:75), „Trage im Konto …“ (prop.js:279) neben „Trag unter Einstellungen → Mentor …“ (mentor.js:17, 55; coach.js), „Leg ein Konto an“ (widgets.js:354), „Leg fest, was für dich gilt“ (widgets.js), „Prüf deine Verbindung“ (mentor.js:17) neben „Prüfe, ob jeder davon …“ (core.js:295), „Schick den Einladungslink“ (coach). Vorschlag: Oberflächentexte (Hilfe, Leerzustände, Tooltips, Einstellungen) in der Vollform („Trage“, „Lege“, „Prüfe“, „Schicke“); die Kurzform bleibt nur im Ruhepunkt (gesprochener Ton: „Nimm die Hand von der Maus“, „Setz dich bequem hin“).
- **W-36 · Mentor, Einstellungen → Mentor, Coach, Replay · Schwere 2.** Entwickler-Sprache in der Oberfläche: „Anleitung zum Server: server/README.md im Projekt.“ (mentor.js:79, mentor.png), Platzhalter „Wert von MENTOR_APP_TOKEN“ (misc.js:157), „COACH_SMTP_HOST, siehe server/README.md“ (coach), „Das Modul replay.js fehlt.“ (replay.js:111), „Speicherort: dieser Browser (localStorage und IndexedDB)“ (misc.js:69), „IndexedDB nicht verfügbar“ (store.js:387). Vorschlag: Dateipfade und Variablennamen raus; „Anleitung zum Server: in der Server-Dokumentation (README).“ als Link, Platzhalter „Zugangstoken vom Server“, Fehlertexte „Replay ist nicht geladen“ / „Der Browser erlaubt keinen Speicher (privates Fenster?)“.
- **W-37 · Einstellungen → Profil/Abo · Schwere 2.** Knöpfe, die nichts tun außer einen Hinweis zu zeigen: „Passwort zurücksetzen“ (misc.js:280, Dialog endet mit „Verstanden“), „2FA aktivieren“ als grüner Hauptknopf (misc.js:62; Dialog misc.js:284, settings_profil.png), „2FA ist nicht aktiviert“. Wording-Folge: Der Nutzer liest ein Versprechen. Vorschlag: beide Abschnitte bis zur Funktion entfernen oder als eine graue Zeile „Anmeldung, Passwort und 2FA kommen mit Benutzerkonten.“ Berührt Aufbau: ja, begründet (nichts Totes zeigen).

### 2.2 Englisch-Deutsch-Mix

Siehe Tabelle 1.6. Die sichtbarsten Fälle als Befunde:

- **W-23a · Dashboard → Filter · Schwere 2.** „Reviewed / Unreviewed“, „Intraday / Multiday“ als Optionen zwischen „Gewinn / Verlust / Break-even“ und „Offen / Geschlossen“ (dash-filter.js, Strings 1317–1322). → „Bewertet / Unbewertet“, „Intraday / Mehrtägig“.
- **W-23b · Prop Firms → Übersicht · Schwere 2.** Karten-Label „BALANCE“ neben „P&L“, „Max. Drawdown übrig“, „Nächster Payout“, „Consistency verletzt“ (prop_cockpit.png). → „Kontostand“; Rest bleibt (Prop-Regelnamen).
- **W-23c · Prop Firms → Friedhof · Schwere 2.** „vom Start bis zum Breach“, „1 von 1 Breaches“ (prop_friedhof.png, prop-friedhof.js:56) neben „Geplatzte Konten“, „Todesursache“. → „vom Start bis zum Platzen“, „1 von 1 geplatzten Konten“.
- **W-23d · Einstellungen · Schwere 2.** Abschnitt „Logs“ mit Reiter „Imports“ (misc.js:7, 250) zwischen lauter deutschen Abschnittsnamen. → „Verlauf“ mit „Importe“ / „Änderungen“.
- **W-23e · Coach · Schwere 2.** „Coach Mode einrichten“, „Coach Mode läuft über …“ (coach.png) obwohl der Bereich „Coach“ heißt. → „Coach einrichten“, „Der Coach-Bereich läuft über …“.
- **W-23f · Zertifikat-Menü · Schwere 2.** Menüeinträge englisch mit deutschem Nebentext („Daily Profit · Tag“, pop_zertifikat.png), Untertext „Stats“. → deutsch vorn (siehe 1.6).
- **W-23g · Wörterbuch · Schwere 3.** „Letzter Login:“ steht nur noch in strings-de.json und den Sprachdateien; seit der Konto-Karte rendert app.js den Text nicht mehr (app.js:272 ist nur ein Kommentar, store.js:104 der Zeitstempel). → Eintrag aus `js/lang/*.js` streichen; falls die Zeile zurückkommt: „Zuletzt hier:“ (es gibt keine Anmeldung).

### 2.3 Groß-/Kleinschreibung (Konvention festhalten)

Beobachtete Konvention (hält in über 95 % der Texte): **Satzschreibung** mit großem Anfang für Titel, Reiter, Knöpfe, Feldnamen und Pillen („Trade loggen“, „Als PDF herunterladen“, „Edge-Check“); Versalien kommen aus CSS (`text-transform: uppercase` in `.caption`, `.k`, Nav-Gruppen; 21 Stellen in app.css), nicht aus dem Text. Abweichungen:

- **W-24a · Pillen Long/Short · Schwere 3.** `ui.js:175` schreibt den Text selbst groß (`'LONG'`/`'SHORT'`), ebenso `widgetpreviews.js:66,73` („TAGE“, „TRADES“, „DEIN SCORE“). Übersetzung und Screenreader bekommen Versalien. → Text „Long“/„Short“/„Tage“/„Trades“/„Dein Score“, Versalien per CSS wie überall sonst.
- **W-24b · Optionen und Pillen klein geschrieben · Schwere 3.** Kleingeschriebene Werte, wo sonst Großschreibung gilt: „automatisch“ (Option im CSV-Import app.js:564; Platzhalter misc.js:198, prop.js:242, prop.js:266), „niedrig/normal/hoch“ (Volatilität, Strings 814/1280), „aktiv“ (Einstellungen → Konten, String 788) neben „Aktiv“ (Prop-Pille, prop_konten.png), „bereit“ (Prop „Nächster Payout: bereit“), „unverifiziert“/„geprüft“ (Preset-Pillen), „trailing Tagesende“/„trailing + Lock“ (prop.js:22), „steigend“ (Fortschritt), „erledigt/offen“ (Coach-Pillen) neben „Erledigt“/„Wieder offen“ (Knöpfe). → Werte in Pillen, Optionen und Auswahlfeldern groß („Niedrig“, „Automatisch“, „Aktiv“, „Bereit“, „Trailing Tagesende“); klein nur die Endpunkte von Skalen („entspannt – sehr gestresst“) und Teile eines Satzes.
- **W-24c · Zwei Schreibweisen für Reiter-Untertitel · Schwere 3.** „Abgeschlossen · bestanden, geplatzt oder archiviert“ (klein, prop_cockpit.png) neben „Eigene Presets · Vorlagen für neue Konten“ (groß, prop_konten.png). → Untertitel groß beginnen.

### 2.4 Satzzeichen

Konvention, die sich aus der Mehrheit ergibt: Titel, Reiter, Knöpfe, Feldnamen, Kachel-Titel, Toasts **ohne Punkt**; Hilfstexte, Tooltips, Leerzustand-Texte, Dialogtexte **als Sätze mit Punkt**. Abweichungen:

- **W-25a · Bestätigungsdialoge · Schwere 2.** 20 von 27 Titeln sind Fragen mit „?“ („Trade löschen?“, „Gruppe schließen?“), aber „Vorlage löschen“ (dashboard.js:198), „Tag löschen“ (misc.js:353), „Tags zurücksetzen“ (misc.js:354), „Verlauf leeren“ (misc.js:360) haben kein „?“ und verschieben die Frage in den Text („Vorlage „X“ wirklich löschen?“); „Wirklich alles löschen?“ (misc.js:366) hat das „wirklich“ im Titel. → Titel immer „<Objekt> löschen?“, Text nennt die Folge ohne „wirklich“, Knopf ist das Verb. Konkret: „Vorlage löschen“ → „Vorlage „X“ löschen?“ + Text „Die Widgets dieser Vorlage gehen verloren.“; „Tag löschen“ → „Tag „X“ löschen?“ + Text „Der Tag wird von allen Trades entfernt.“; „Tags zurücksetzen“ → „Tags zurücksetzen?“; „Verlauf leeren“ → „Verlauf leeren?“; „Wirklich alles löschen?“ → „Alles löschen?“.
- **W-25b · Toasts · Schwere 3.** Die meisten ohne Punkt, aber: „Session läuft. Viel Erfolg.“ (app.js:548), „Gruppe erstellt. Kopiere den Einladungslink.“ (coach.js:276), „Du bist jetzt Co-Coach.“ (coach.js:360), „Du bist in der Gruppe. Dein Journal wird jetzt abgeglichen.“ (coach.js:380), „Aufnahme gespeichert.“ (voice.js:101), „Gespeichert. Der Server verschickt noch keine Mails.“ (coach). → Ein Satz ohne Punkt: „Session gestartet“, „Gruppe erstellt“, „Co-Coach beigetreten“, „Gruppe beigetreten“, „Aufnahme gespeichert“; Zusatzinfos gehören in die Fläche, nicht in den Toast.
- **W-25c · Doppelpunkte an Beschriftungen · Schwere 3.** „Trades pro Seite:“ (trades.png) neben „Trades pro Seite“ (beide Strings 137/138 existieren), „Verstöße pro Seite:“/„Verstöße pro Seite“, „Mentor:“/„Mentoren:“, „Zuletzt:“, „Max. Drawdown:“ (widgets.js:1386) neben „Ziel: {0}“, „Aktuell ({0}):“. → Beschriftung ohne Doppelpunkt, wenn der Wert daneben oder darunter steht (Layout trennt); Doppelpunkt nur innerhalb eines Satzes („Ziel: +3.000 €“ im Fließtext ist ok).
- **W-25d · Hilfstexte ohne Punkt · Schwere 3.** Einzelne Hilfstexte und Tooltips enden ohne Punkt: „Filtern nach Ordner, Tag und Zeitraum“ (notebook.js:46, data-tip), „Vorlagen für neue Konten“ (Untertitel), „Gelb unter 50 %, Rot unter 25 %“ (prop_konten.png), „Werktage in Folge mit Trades, Check-in oder Notiz“ (Fortschritt), „Ø Disziplin-Score der Trades im Zeitraum:“ (Doppelpunkt am Ende, String 969). Regel: Tooltips mit nur einem Nominalausdruck (bis 5 Wörter) ohne Punkt; alles mit Verb oder mehr als einem Satz mit Punkt.
- **W-27 · Gedankenstriche · Schwere 3.** Halbgeviertstrich als Satzzeichen in 21 Texten, sichtbar z. B. „Dein Schatten-Ich handelt wie du – nur ohne Regelbrüche.“ (shadow.png zeigt den Strich lang), „Maximal 5 Widgets – entferne zuerst eines“ (dashboard.js:207), „Preset kopiert – bitte Werte prüfen“ (prop.js:355), „Schalte oben mindestens eine Regel ein – dann rechnet …“ (shadow.js), „Einheit R gewählt, aber keine R-Einheit hinterlegt – Regel nicht prüfbar.“ (js/shadow.js:51, Regel-Engine), propsim.js:119,120,132. Die Writing Guidelines verbieten Gedankenstriche als Satzzeichen. → Doppelpunkt, Komma oder zwei Sätze: „Dein Schatten-Ich handelt wie du, nur ohne Regelbrüche.“, „Höchstens 5 Widgets. Entferne zuerst eines.“, „Konto-Vorlage kopiert, bitte Werte prüfen“. Bereiche bleiben mit Halbgeviertstrich ohne Leerzeichen („1–10“); heute steht „1 – 10 von 10 Trades“ (trades.png, mit Leerzeichen) neben „1–6 Bereiche“ (ohne). → „1–10 von 10 Trades“.
- **W-27b · „&“ gegen „und“ · Schwere 3.** Titel mit „&“: „Letzte Trades & offene Positionen“, „Plan & Bewertung“, „Tags & Notizen“, „Drawdown & Risiko“, „Serien & Konstanz“, „Trading-Aktivität & Volumen“, „Risiko & Drawdown“, „Kontostand & P&L“, „Täglicher & kumulierter P&L“; daneben „Daten und Sicherung“, „Risiko und Warnungen“, „Gewinn, Verlust und Break-even“, „Hilfe und Beratung“, „Regeln, Payout und Gebühren“, „Konto und Einstellungen“, „Ampel und Stop-Größe“. Die Guidelines erlauben „&“ nur bei Platzmangel (Nav, Knöpfe). → „und“ in Titeln; „&“ bleibt nur in „P&L“ und „Drag & Drop“. Ausnahme Widget-Titel in der Kachelzeile, wenn der Platz sonst umbricht („Kontostand & P&L“ → „Kontostand und P&L“ passt bei 1440; auf dem Handy wird „Kontostand“ gezeigt).
- **W-28 · Minus und Platzhalter · Schwere 3.** Geld-blind-Text zeigt „„– R““ mit Halbgeviertstrich (misc.js:197, settings_trading.png rendert „— R“), Ergebnisse nutzen das echte Minus „−344,43 €“ (dashboard.png), Leerwerte „—“ (Tagesansicht day.png). → Kein Wert immer „—“ (Geviertstrich) ohne Einheit; Minus immer „−“ (U+2212). „Trades ohne Stop zeigen „—““.
- **W-32 · Ausrufezeichen · Schwere 3.** Nur eines in der Oberfläche: „Entfernt alle Daten aus diesem Browser. Vorher exportieren!“ (misc.js:68, settings_profil.png). → „Vorher eine Sicherung exportieren.“ (Bibelzitate im Ruhepunkt behalten ihre Zeichensetzung.)

### 2.5 Ellipsen, Ladezustände

- **Gut:** Überall das echte Zeichen „…“ (U+2026), nie „...“. Immer ein Leerzeichen davor („Suchen …“, „Speichert …“): einheitlich, bleibt so.
- **W-26 · Ladetexte · Schwere 3.** Fünf Formen für „es läuft“: „Lädt“ (ui.js:462, ohne Ellipse), „Prüfe …“ (mentor.js:124), „Speichert …“ (ruhepunkt.js:767), „Wird erstellt …“ (certificate.js:91), „Wird ausgewertet …“ (voice.js:104), „Verlauf wird geladen …“ (mentor.js:70), „Termine werden geladen …“ (news.js:87), „Wird abgeglichen …“ (coach), „Sicherung wird erstellt …“ (misc.js:362), „Aufnahme läuft, Transkription aktiv …“ (voice.js:112). → Eine Form: „Wird <Partizip> …“ („Wird geladen …“, „Wird geprüft …“, „Wird gespeichert …“), mit Objekt davor, wenn nötig („Verlauf wird geladen …“). „Lädt“ → „Wird geladen …“.
- **W-26b · Platzhalter in Suchfeldern · Schwere 3.** „Suchen …“ (Filter), „Widget suchen …“ (dashboard.js:78), „Suchen: Symbol, Setup, Notiz …“ (trades.js:39) neben „Notizen durchsuchen“, „Tags suchen“, „Typ suchen“ (ohne Ellipse). → „<Objekt> suchen“ ohne Ellipse (die Ellipse ist für Ladezustände reserviert): „Widgets suchen“, „Trades suchen“ (Symbol, Setup, Notiz als Tooltip), „Notizen suchen“.

### 2.6 Abkürzungen

- **W-29 · Dashboard → Filter · Schwere 2.** „Min.“ (Minuten) und „Std.“ (Stunden) als Einheiten der Haltedauer (dash-filter.js:127) im selben Fenster wie „Min“ / „Max“ für Von/Bis-Felder (dash-filter.js:104): „Min.“ und „Min“ nebeneinander. → Haltedauer-Einheiten wie fmt.dur: „min · h · d“ (so zeigt es die App in „12 min“, „1 h 22 min“); Bereichsfelder „Von“ / „Bis“ statt „Min“ / „Max“ (so heißen sie auch im Break-even-Bereich, settings_trading.png).
- **W-29b · überall · Schwere 3.** „z. B.“ steht 24-mal mit normalem Leerzeichen; am Zeilenende bricht es („z.“ / „B.“). → schmales geschütztes Leerzeichen (U+202F) in `fmt`/i18n beim Rendern einsetzen, oder in den Strings.
- Zulässige Abkürzungen (konsistent benutzt, kein Befund): Ø, Max., R, P&L, MAE/MFE, CSV, JSON, PDF, PNG, 2FA, ROI, EOD (nur propsim), Strg.
- **W-29c · Prop-Kontogrößen · Schwere 3.** „50K“, „100K“, „{0}0K“ als Teil des Kontonamens (prop_konten.png „Topstep 50K“) neben „100.000 € · Forex / CFD“ auf dem Grabstein (prop_friedhof.png). → „50K“ bleibt als Firmen-Jargon im Kontonamen; überall, wo ein Betrag gemeint ist, „50.000 $“ in Kontowährung.

### 2.7 Zahlen- und Datumsformate

- **W-05a · Trade loggen · Schwere 1.** Die Felder „Eröffnet“/„Geschlossen“ zeigen „10/11/2026, 12:40 PM“ und Platzhalter „mm/dd/yyyy, --:-- --“ (modal_trade_loggen.png): natives `datetime-local` im Browser-Gebietsschema, nicht in der App-Sprache. README sagt, ein eigener Kalender mit Uhrzeit existiert (`js/datepicker.js`); das Feld selbst rendert aber das Browser-Format. → Feld als Text in App-Format „11.10.2026, 12:40“ rendern (Anzeige aus `fmt.dateTime`, Eingabe über den eigenen Kalender), Platzhalter „TT.MM.JJJJ, HH:MM“. (Wenn Playwright nur en-US simuliert: trotzdem beheben, weil jeder Nutzer mit englischem Browser und deutscher App-Sprache das sieht.)
- **W-05b · überall · Schwere 2.** Sieben Datumsformen nebeneinander: „08.10.2026 19:43“ (TradeLog, ohne Komma), „08.10.2026, 19:43“ (Trade-Detail, mit Komma), „11.10.2026, 12:39“ (Notebook-Liste), „So, 11. Okt 2026“ (Notebook-Kopf, Monat abgekürzt ohne Punkt), „1. Okt. 2026 – 31. Okt. 2026“ (Zeitraum-Fuß, Monat abgekürzt mit Punkt, pop_zeitraum.png), „Sonntag, 11. Oktober 2026“ (Tagesansicht), „01.10.“ (Achsen), „03.08.“ (Fortschritt, README). → Vier Formate festlegen und in `fmt` erzwingen: kurz „08.10.2026“; mit Zeit „08.10.2026, 19:43“; lang „Sonntag, 11. Oktober 2026“ (Tagesansicht, Notebook-Kopf „So., 11. Oktober 2026“ nur mit Punkt nach „So“); Achsen „08.10.“. Monatsnamen nie abkürzen („1. Oktober – 31. Oktober 2026“ im Zeitraum-Fuß; „Oktober 2026“ im Knopf ist schon richtig).
- **W-05c · Prop Firms → Übersicht · Schwere 2.** Gemischte Dezimalstellen in einem Ausdruck: „Max. Drawdown übrig 11.162 $ von 3.000,00 $“ und „BALANCE 111.262 $“ neben „P&L +11.262 €“ (prop_cockpit.png, Apex-Karte; Topstep-Karte daneben „2.000,00 $ von 2.000,00 $“). Ursache: `fmt.cur` schaltet ab 10.000 auf 0 Nachkommastellen, darunter 2 (ui.js:122 `a >= 10000 ? 0 : 2`), und prop.js:93/94/102 formatieren jeden Wert einzeln. → Paare gemeinsam formatieren: beide Werte eines „x von y“ mit derselben Stellenzahl (0, sobald einer ≥ 10.000 ist; `money(a, v, { compact: true })` für beide). Auf der Prop-Karte Kontostand, Limits und Puffer durchgehend ohne Nachkommastellen (Kontowährung, immer vierstellig oder größer), nur der P&L mit zwei.
- **W-06 · Prop Firms → Übersicht · Schwere 1.** Dieselbe Zahl in zwei Währungen auf einer Karte: „35 % · 1.946,15 $ fehlen“ (Ziel-Balken, prop.js:94, Kontowährung) und „Bestehen: Gewinn fehlt: 1.946,15 € · Consistency verletzt“ (prop.js:75, Journal-Währung) (prop_cockpit.png, Topstep-Karte). Die README erklärt „Balance, Limits und Puffer in Kontowährung, Trade-P&L in Journal-Währung“, aber der fehlende Gewinn ist eine Konto-Größe. → prop.js:75 mit `money(a, …)` wie Zeile 94 formatieren; die P&L-Zeile der Karte bekommt den Zusatz „(Journal-Währung)“ im Tooltip oder wird in die Kontowährung umgerechnet.
- **W-30 · Skalen · Schwere 2.** Check-in-Skalen „1 entspannt – 5 sehr gestresst“ (app.js:517), Tagesansicht „3 / 5“ (day.js:16), Ruhepunkt-Werte „Schlaf 7/10, Stress 4/10“ (mentor.js:42; ruhepunkt.js:472 „von 10“). Zwei Skalen für dieselben drei Größen. → Eine Skala (siehe W-18) und eine Schreibweise „3 von 5“ (kein „/“).
- **W-30b · Prozent, R, Einheiten · gut.** „40,0 %“, „+2,51 R“, „1 h 22 min“, „12 min“, „+893,04 €“ sind konsistent über `fmt` (Leerzeichen vor %, R, €). Kein Befund; nur prüfen, dass es geschützte Leerzeichen sind (Umbruch zwischen Zahl und Einheit in schmalen Kacheln).

### 2.8 Emojis, Symbole

- **W-31 · Fortschritt · Schwere 3.** „Check-in ✓“, „Notiz ✓“ als Text im Tooltip der Aktivitäts-Heatmap (progress.js, Strings 985/988). → „Check-in gemacht“, „Notiz geschrieben“ (Wortlaut der Checkliste), Häkchen nur als Symbol.
- Platzhalter „z. B. 📈 Strategie“ (notebook.js:116) ist beabsichtigt (Ordner dürfen ein Emoji tragen): ok. Sterne „★“ (Bewertung), „† / *“ und „R · I · P“ (Grabstein) sind gestalterische Entscheidungen: ok.

### 2.9 Doppelte Leerzeichen, Tippfehler

- Doppelte Leerzeichen: 0 Treffer. Tippfehler: keine gefunden. Einzelne Härtefälle:
  - **W-35a · Einstellungen → Trading · Schwere 3.** „Geld-blind-Modus“ (misc.js:197, 337) ist ungewöhnlich getrennt. → „Geldblind-Modus“ oder kürzer „R-Modus“ (die Erklärung bleibt: „zeigt R statt Beträge“).
  - **W-35b · Trade-Detail · Schwere 3.** „Keine Exkursionsdaten“ (trades.js:75) ist Fachjargon ohne Erklärung. → „Kein MAE/MFE erfasst“.
  - **W-35c · Statistik → Fehler · Schwere 3.** „Keine Fehler-Tags vergeben. Sehr gut, oder ehrlich bleiben?“ (stats.js:52) ist eine rhetorische Frage (Guidelines: keine). → „Keine Fehler-Tags vergeben. Prüfe beim nächsten Review, ob das stimmt.“
  - **W-35d · Mentor → Leerzustand · Schwere 3.** „Dein Edge lässt nach“ (stats.js:73 Banner) vs. Tilt-Titel „Edge noch nicht belegt“ / „Dein Edge ist statistisch belegt“ (core.js:550): Artikel schwankt nicht, aber „Edge“ ist mal mit „dein“, mal ohne. ok, nur prüfen.
  - **W-35e · Prop-Konten-Leerzustand · Schwere 2.** „Lege ein Konto aus einem Firmen-Preset an …“ (prop.js:82): Die eingebauten Firmen-Presets gibt es laut README nicht mehr (nur eigene). Text ist veraltet. → „Lege ein Prop-Konto an (Firma, Größe, Regeln). Dann siehst du hier Kontostand, Puffer, Ampel und den Weg zum Payout.“

### 2.10 Doppelte Inhalte unter verschiedenen Namen

- **W-41 · Statistiken → Übersicht · Schwere 2.** Die Kacheln „Trade-Erwartungswert“ (core.js:316) und „Ø Netto-P&L pro Trade“ (core.js:317) zeigen dieselbe Zahl (stats_summary.png: beide +89,30 €); die Tooltips beschreiben dieselbe Rechnung einmal als Formel („Win-Rate × Ø Gewinn + Verlustrate × Ø Verlust.“), einmal als Division („Netto-P&L geteilt durch Anzahl der Trades.“). → Eine Kachel „Erwartungswert“ mit Untertitel „pro Trade“, Tooltip „Netto-P&L geteilt durch Anzahl der Trades. Entspricht Trefferquote × Ø Gewinn minus Verlustquote × Ø Verlust.“; die zweite Kachel streichen (16 → 15 Kennzahlen). Berührt Aufbau: ja, begründet (kein Doppel).
- **W-42 · Edge-Check · Schwere 3.** „Mindestens 20 Trades mit R-Wert nötig, aktuell 10.“ steht in der Kachel „Urteil“ und noch einmal als Leerzeile im Diagramm (stats_edge.png, stats.js:71 und ui.js:339). → Diagramm-Leerzeile „Ab 20 Trades mit R“.
- **W-43 · Dashboard-Widgets · Schwere 3.** Beschreibung in der Bibliothek und Info-Tooltip desselben Widgets weichen in Wortwahl ab (Beispiel Gesamt-Score, W-14g; „Täglicher & kumulierter P&L“ gegen Tooltip „Säulen: Netto-Ergebnis je Handelstag …“). → Beide Texte aus einer Quelle je Widget ableiten (widgets.js-Registry: `desc` für die Bibliothek, `info` für den Tooltip, gleiche Begriffe).

### 2.11 Textlängen

- **W-44 · Seitenleiste → Konto-Karte · Schwere 2.** „Profil vervollständigen“ (app.js:229, Untertitel der Konto-Karte, solange keine E-Mail hinterlegt ist) wird bei 1440 px zu „Profil vervollständi…“ abgeschnitten (dashboard.png, day.png, prop_cockpit.png, prop_konten.png: auf jedem Bildschirm sichtbar, auch im hellen Design). → „Profil ergänzen“ (15 statt 22 Zeichen, passt neben dem Avatar in eine Zeile); Übersetzungen in `js/lang/*.js` entsprechend kürzen.

---

## 3. Knopf-Verben

Alle Knopftexte (131 `<button>` + 17 `.btn`-Links + Menüeinträge), gruppiert nach Absicht. Fett = empfohlene Stammform. Dahinter die konkurrierenden Verben mit Beleg.

### 3.1 Etwas Neues anlegen

| Konkurrierende Texte (Beleg) | Empfehlung |
|---|---|
| „Trade loggen“ (app.js:253) · „Trade für diesen Tag“ (day.js:12) · „Verpassten Trade notieren“ (trades.js:110) · „Tag loggen“ (notebook.js:61) | **Trade loggen** (nur für Trades); „Verpassten Trade notieren“ bleibt (anderes Objekt); „Tag loggen“ → „Tagesnotiz anlegen“ |
| „Konto hinzufügen“ (misc.js:186, Journal) · „Konto anlegen“ (prop.js:82, widgets.js:354) · „Prop-Konto“ (prop.js:294, nur Nomen) | **anlegen** für Datensätze: „Konto anlegen“ (Einstellungen), „Prop-Konto anlegen“ (Prop, ein Knopf statt zwei) |
| „Ordner hinzufügen“ (notebook.js:52) · „Tag hinzufügen“ (misc.js:238) · „Neuen Tag anlegen“ (notebook.js:77) · „Anlegen“ (notebook.js:168) · „Widget hinzufügen“ (dashboard.js:26) · „Kennzahl hinzufügen“ (widgets.js:223) · „„X“ hinzufügen“ (Filter-Symbol) · „Hinzufügen“/„Hinzugefügt“ (Widget-Bibliothek) | **hinzufügen** nur, wenn etwas in eine bestehende Sammlung oder Ansicht kommt (Widget ins Dashboard, Kennzahl ins Widget, Symbol in den Filter, Tag an eine Notiz); **anlegen**, wenn ein neuer Datensatz entsteht (Ordner, Tag in Einstellungen → Inhalte, Regel, Konto, Vorlage). Also: „Ordner anlegen“, „Tag anlegen“ (Einstellungen), „Tag hinzufügen“ (an Notiz) |
| „Neue Vorlage erstellen“ (Dashboard-Menü) · „Erstellen und bearbeiten“ (dashboard.js:193) · „Erstellen“ (Coach-Gruppe) · „Zertifikat erstellen“ · „Neue Regel“ (misc.js:207) + „Hinzufügen“ · „Neue Notiz“ (notebook.js:74) · „Neue Vorlage …“ (Editor) · „Neue Session“ (Replay) · „Neuen Einladungslink erzeugen“ · „Neuen Link erzeugen“ · „Nur-Lese-Link erzeugen“ · „Eigenes Preset“ (prop.js:238) · „Preset anlegen“ (prop.js:226) | **anlegen** für Vorlage, Regel, Notiz, Gruppe, Konto-Vorlage („Vorlage anlegen“, „Regel anlegen“, „Notiz anlegen“ oder kurz „Neue Notiz“ als Hauptknopf im Notebook ist vertretbar, dann aber überall „Neue …“ ohne Verb für Hauptknöpfe: „Neue Notiz“, „Neue Regel“, „Neue Vorlage“); **erstellen** nur für erzeugte Dateien/Dokumente (Zertifikat, Sicherung, Link: „Link erstellen“ statt „erzeugen“) |
| „Ausgabe erfassen“ · „Payout erfassen“ (prop.js:262, 266) | **eintragen** („Ausgabe eintragen“, „Payout eintragen“) passt zu „Trage im Konto … ein“, oder bei „erfassen“ bleiben, aber dann nur hier |
| „Mentor-Chat einrichten“ · „Coach Mode einrichten“ · „Server einrichten“ (news) · „Challenge einrichten“ (dashboard.js:182) · „Einrichten“ (widgets.js:373) | **einrichten** nur für Verbindungen (Server); Challenge-Widget → „Ziel festlegen“ (so heißt die Leermeldung „Noch kein Ziel festgelegt.“) |
| „Check-in“ (day.js:12) · „Check-in nachtragen“ (day.js:16) · „Check-in bearbeiten“ | **Check-in** (Kopf) für heute; für vergangene Tage „Check-in nachtragen“ an genau einer Stelle (Karte), nicht beides auf einem Bildschirm (W-04) |

### 3.2 Speichern, Anwenden, Bestätigen

| Konkurrierende Texte (Beleg) | Empfehlung |
|---|---|
| „Speichern“ (21×) · „Trade speichern“ (app.js:368) · „Speichern und loslegen“ / „… abschalten“ / „… schließen“ (Ruhepunkt) · „Aktuelles speichern“ (Designs) | **Speichern** in Dialogen; Ruhepunkt-Varianten bleiben (sie sagen, was danach passiert); „Trade speichern“ → „Speichern“; „Aktuelles speichern“ → „Design speichern“ |
| „Anwenden“ (Zeitraum, Filter, Notebook-Filter) · „Übernehmen“ (voice.js:45, „Vorschlag übernehmen“ shadow.js:58) · „Fertig“ (Kalender) · „OK“ (Symbol-Eingabe app.js:393) · „Verstanden“ (misc.js:280) | **Anwenden** für Filter/Zeitraum; **Übernehmen** für Vorschläge; „Fertig“ für den Kalender ok; „OK“ → „Übernehmen“; „Verstanden“ → „Schließen“ |
| „Einlesen“ (CSV-Text) · „Importieren“ (CSV-Dialog) · „Einspielen“ (Sicherung) · „Zusammenführen“ / „Ersetzen“ (Sicherung) · „Laden“ (Beispieldaten) · „Aus Datei laden“ (Notiz) | **Importieren** für CSV und Sicherung („Sicherung importieren“ mit Optionen „Zusammenführen“/„Ersetzen“); „Einlesen“ → „Vorschau“ (das macht der Knopf: er parst den Text); „Beispieldaten laden“ bleibt |
| „Beitreten“ · „Senden“ · „Notiz senden“ · „Antworten“ · „Aufgabe geben“ · „Jetzt abgleichen“ · „Aktualisieren“ · „Neu laden“ (mentor.js:81) · „Erneut versuchen“ · „Verbindung testen“ · „Neu simulieren“ | ok; „Neu laden“ → „Aktualisieren“ (News nutzt das schon) |

### 3.3 Abbrechen, Schließen, Zurück

„Abbrechen“ (26×, Dialoge) · „Schließen“ (aria-label der ×) · „Zurück“ · „Zurück zum TradeLog“ · „Zur Übersicht“ (Replay) · „Ausblenden“ (Recap-Banner) · „Menü schließen“ · „Verlassen“ / „Austreten“ (Coach). Konsistent; nur „Zurück zum TradeLog“ (trades.js:63) und Breadcrumb „← TradeLog“ (trades.js:66) sind zwei Formen → beide „TradeLog“ mit Pfeil.

### 3.4 Löschen, Entfernen, Leeren, Zurücksetzen

| Konkurrierende Texte (Beleg) | Empfehlung |
|---|---|
| „Löschen“ (37×) · „Endgültig löschen“ · „Alles löschen“ · „Trade löschen?“ … | **Löschen** = Daten weg (immer mit Rückfrage) |
| „Entfernen“ für Profilbild (misc.js:47), Beispieldaten (misc.js:54, rot umrandet), Widget („Widget entfernen“), Farbe, Tag („Tag entfernen“), Eintrag („Eintrag entfernen“ misc.js:255 im Verlauf), Co-Coach („{0} entfernt“) | **Entfernen** = aus einer Ansicht oder Sammlung nehmen, ohne Daten zu löschen (Widget, Tag von Notiz, Farbe aus Liste, Beispieldaten sind wiederherstellbar). Profilbild und Verlaufseintrag werden gelöscht → „Löschen“ |
| „Leeren“ (Verlauf, Papierkorb) · „Zurücksetzen“ (Filter, Tags, „Auf Standard zurücksetzen“, „Standardfarben“) | ok; „Standardfarben“ (Knopf misc.js:145) → „Auf Standard zurücksetzen“ wie im Break-even-Bereich |

### 3.5 Öffnen, Ansehen, Anzeigen, Navigieren

| Konkurrierende Texte (Beleg) | Empfehlung |
|---|---|
| „Öffnen“ (coach, notebook) · „Trade öffnen“ · „Im Notebook öffnen“ (day.js:19) · „Im Notebook ansehen“ (coach) · „Tag ansehen“ · „Chart ansehen“ · „Preset ansehen“ · „Ansehen“ (prop.js:237) · „Setup anzeigen“ · „Mehr anzeigen“ · „Alle anzeigen“ · „Details“ (dashboard.js:129) · „Anleitung anzeigen“ · „Ordner anzeigen“ | **öffnen** = ein Objekt oder einen Bereich aufrufen („Trade öffnen“, „Im Notebook öffnen“, „Tagesansicht öffnen“, „Konto-Vorlage öffnen“); **anzeigen** = mehr im selben Bild zeigen („Mehr anzeigen“, „Setup anzeigen“, „Details anzeigen“ statt „Details“); „ansehen“ streichen |
| „Zur Statistik“ · „Zum Mentor“ · „Zur Gruppe“ · „Zu den Einstellungen“ · „Zum Üben“ · „Zum eigenen Notebook“ · „Jetzt üben“ · „Starten“ (Ruhepunkt-Widget) · „Session starten“ | **Zu …/Zum …/Zur …** für Bereichswechsel aus Leerzuständen und Widgets, mit dem Bereichsnamen („Zu den Statistiken“, „Zum Mentor“, „Zu den Einstellungen“) |

### 3.6 Bearbeiten, Verwalten

„Bearbeiten“ (4×) · „Diese Vorlage bearbeiten“ / „Vorlage bearbeiten“ (dashboard.js:31, 33: zwei Texte für denselben Menüpunkt in verschiedenen Zuständen) · „Regeln bearbeiten“ · „Preset bearbeiten“ · „Plan ergänzen“ · „Umbenennen“ · „Farbe ändern“ · „Datum der Notiz ändern“ · „Provision von X ändern“ · „Trades zuordnen“ · „Als geplatzt/bestanden/erledigt/offen markieren“ · „Konten verwalten“ (app.js:244). → „Diese Vorlage bearbeiten“ → „Vorlage bearbeiten“; „Plan ergänzen“ → „Plan bearbeiten“ (der Dialog heißt „Plan & Bewertung“ und bearbeitet auch Bestehendes); „ändern“ nur für ein einzelnes Attribut (Farbe, Datum, Provision): ok.

### 3.7 Export, Teilen, Kopieren

„Sicherung exportieren“ mit „Ohne Anhänge“ / „Mit Anhängen“ · „Exportieren (JSON)“ · „Als PDF herunterladen“ · „PNG herunterladen“ · „Teilen“ · „Link kopieren“ · „Einladungslink kopieren“ · „Kopieren“ · „Hochladen“ / „Foto hochladen“ / „Vom Computer hochladen“ · „Über Adresse einfügen“. → konsistent genug; „Exportieren (JSON)“ → „Als JSON exportieren“ (parallel zu „Als PDF herunterladen“).

### 3.8 Knöpfe nur mit Nomen

„Prop-Konto“ (prop.js:294), „CSV“ (dashboard.js:130, leer_dashboard.png), „Zertifikat“ (öffnet Menü, ok), „Filter“ (öffnet Menü, ok), „Vorlage“ (Menü, ok), „Link“ (coach.js:42), „Schließen“/„Umdrehen“ (ok). → Aktionen brauchen ein Verb: „Prop-Konto anlegen“, „CSV importieren“, „Link kopieren“. Menü-Öffner dürfen Nomen sein.

### 3.9 Befund zu doppelten Knöpfen

- **W-04 · Tagesansicht, Prop Firms → Konten · Schwere 1.** Zwei Knöpfe für dieselbe Aktion im selben Bild: day.png zeigt „Trade loggen“ (Kopfreihe, grün) und „Trade für diesen Tag“ (grün) 60 px darunter; außerdem „Check-in“ (Kopf) und „Check-in nachtragen“ (Karte). prop_konten.png zeigt „Prop-Konto“ (Kopfreihe) und „Konto anlegen“ (Karte, grün). → Pro Bildschirm ein Knopf je Aktion: Tagesansicht behält „Trade loggen“ in der Kopfreihe (öffnet den Dialog mit dem Datum des Tages vorbelegt) und streicht „Trade für diesen Tag“; die Check-in-Karte behält ihren Knopf, der Kopf verliert „Check-in“; Prop: „Prop-Konto anlegen“ nur in der Kopfreihe, Karte „Deine Konten“ ohne eigenen Knopf (im Leerzustand ein Link mit gleichem Wortlaut). Berührt Aufbau: ja (Kopfreihe der Tagesansicht), begründet.

---

## 4. Leere Zustände, Fehlermeldungen, Toasts, Tooltips, Platzhalter

Bewertung: ✓ klar und hilfreich · ~ geht, aber Wortwahl/Ton anpassen · ✗ unklar, technisch oder irreführend.

### 4.1 Leere Zustände (31 Titel, 23 Texte)

Muster, das die Mehrheit nutzt und das wir festschreiben: Titel „Noch keine …“ (es gab noch nie etwas) / „Keine … im Zeitraum“ (Filter schneidet ab) / „Kein … passt zum Filter“; Text: ein Satz mit dem nächsten Schritt; darunter höchstens ein Knopf.

| Stelle (Beleg) | Titel · Text | Wertung |
|---|---|---|
| Dashboard leer (dashboard.js:130, leer_dashboard.png) | „Willkommen“ · „Dein Journal ist noch leer. Logge deinen ersten Trade, importiere eine CSV oder lade Beispieldaten, um alle Auswertungen zu sehen.“ + „CSV“ + „Beispieldaten laden“ | ✓ Text; ~ Knopf „CSV“ → „CSV importieren“; „Journal“ → „Journalyst“ (W-20) |
| Dashboard-Kacheln/Widgets leer (widgets.js:9, 32) | „Noch keine Daten“ 9-mal auf einem Bildschirm, Text „Logge Trades oder ändere den Zeitraum.“ | ✗ Wiederholung; Kacheln sollten „—“ zeigen, nur Widgets den Leerzustand; Text ok |
| Dashboard Vorlage ohne Widgets (dashboard.js:53) | „Diese Vorlage hat noch keine Widgets. Über „Vorlage bearbeiten“ fügst du welche hinzu.“ | ✓ |
| Widget-Suche (dashboard.js:61) | „Kein Widget gefunden“ | ✓ |
| Statistik Übersicht (stats.js:23) | „Keine abgeschlossenen Trades im Zeitraum“ · „Ändere den Zeitraum oder logge Trades.“ | ✓ |
| Statistik Tage/Setups/Zeit/Fehler (stats.js:29, 37) | „Keine Handelstage im Zeitraum“ / „Keine Trades im Zeitraum“ · (kein Text) | ~ Text ergänzen wie Übersicht |
| Statistik Marktphase (stats.js:55) | „Keine Marktphasen erfasst“ · „Lege in der Tagesansicht oder beim Beenden der Session fest, ob …“ | ✓ |
| Statistik Zustand (stats.js:61) | „Keine Check-ins im Zeitraum“ · „Starte den Tag mit „Session starten“, dann siehst du hier …“ | ✓ |
| Statistik Monte Carlo (stats.js:77) | „Mindestens 10 abgeschlossene Trades nötig“ · „Die Simulation zieht zufällig aus deinen bisherigen Trades.“ | ✓ |
| Edge (stats_edge.png) | Pille „Zu wenig Daten“ · „Mindestens 20 Trades mit R-Wert nötig, aktuell 10.“ · Diagramm-Leerzeile „Mindestens 20 Trades mit R-Wert nötig“ (ui.js:339) | ~ zweimal derselbe Satz auf einem Bild; Diagramm-Leerzeile reicht als „Ab 20 Trades“; „R-Wert“ → „R“ |
| TradeLog (trades.js:45) | „Keine Trades passen zum Filter“ · „Ändere die Filter oder den Zeitraum.“ / ohne Filter: „Logge einen Trade oder importiere eine CSV-Datei.“ + „CSV importieren“ | ✓ |
| TradeLog Tage (trades.js:53) | „Sobald Trades abgeschlossen sind, erscheinen hier Tageskarten.“ | ✓ |
| Verpasste Trades (trades.js:57) | „Keine verpassten Trades notiert“ · „Setups, die du gesehen, aber nicht gehandelt hast. So erkennst du, ob Zögern dich Geld kostet.“ | ✓ |
| Trade nicht gefunden (trades.js:63) | „Trade nicht gefunden“ · „Vielleicht wurde er gelöscht.“ + „Zurück zum TradeLog“ | ✓ |
| Trade-Detail Plan (trades.js:73) | „Kein Plan hinterlegt“ · „Trage geplanten Einstieg, Stop und Ziel ein, um Plan und Ausführung zu vergleichen.“ + „Plan ergänzen“ | ✓ |
| Trade-Detail MAE/MFE (trades.js:75) | „Keine Exkursionsdaten“ · „Trage MAE und MFE im Editor ein.“ | ~ „Kein MAE/MFE erfasst“ (W-35b) |
| Tagesansicht Trades (day.js:15, day.png) | „Keine Trades an diesem Tag“ · „Ein ruhiger Tag ist auch ein guter Tag.“ | ✓ (Ton passt; am Wochenende leicht schief, aber harmlos) |
| Tagesansicht Check-in (day.js:16) | „Kein Check-in“ · „Schlaf, Stress und Stimmung vor dem Handel festhalten.“ + „Check-in nachtragen“ | ✓ |
| Tagesansicht Regeln (day.js:18) | „Keine Regeln definiert“ · „Lege deine Handelsregeln in den Einstellungen an.“ + „Regeln anlegen“ | ~ „definiert“ → „angelegt“ (Fortschritt sagt „Noch keine Regeln angelegt“) |
| Tagesansicht Notiz (day.js:19) | „Noch keine Tagesnotiz“ · „Halte fest, wie der Tag lief und was du mitnimmst.“ + „Tagesnotiz anlegen“ | ✓ |
| Tagesansicht Datum (day.js:9) | „Ungültiges Datum“ | ✓ |
| Fortschritt (progress.js:69, 73) | „Noch keine Tage mit Regel-Check“ / „Noch keine Regeln angelegt“ / „Noch keine Regeln. Lege unter Einstellungen deine Handelsregeln an, dann erscheinen sie hier als Checkliste.“ | ✓ |
| Notebook (notebook.js:31, 54, 63) | „Noch keine Tags“ · „Noch keine eigenen Ordner“ · „Papierkorb ist leer“ | ✓ |
| Notebook Link (notebook.js:123) | „Link ungültig“ · „Diese geteilte Notiz konnte nicht gelesen werden.“ | ✓ |
| Schatten-Ich (shadow.js:67, 77, 109) | „Keine Verstöße“ · „In diesem Zeitraum hast du dich an deine Regeln gehalten.“ / „Keine Regel aktiv“ / „Noch keine abgeschlossenen Trades“ · „Sobald Trades geschlossen sind, zeigt dir dein Schatten-Ich, was Regelbrüche kosten.“ | ✓ („Regelbrüche“ → „Verstöße“, 1.3) |
| Schatten-Ich ohne Setups (shadow.js:49) | „Noch keine Setups angelegt. Lege sie unter Einstellungen → Inhalte an oder vergib sie beim Loggen.“ | ✓ |
| Prop Konten (prop.js:82) | „Noch keine Prop-Konten“ · „Lege ein Konto aus einem Firmen-Preset an …“ | ✗ veraltet (W-35e) |
| Prop Filter (prop.js:124) | „Kein Konto passt zum Filter“ · „Ändere Firma, Phase oder Status.“ | ✓ |
| Prop Trades zuordnen (prop.js:134) | „Keine Trades im Journal“ · „Logge zuerst Trades, dann kannst du sie hier zuordnen.“ | ✓ |
| Prop Friedhof (prop-friedhof.js:171) | „Noch kein Konto auf dem Friedhof“ · „Gut so. Konten, die du im Cockpit über „Als geplatzt markieren“ beendest, landen hier als Grabstein, mit Ursache, auslösendem Trade und den Mustern dahinter.“ | ~ „Cockpit“ → „Übersicht“; sonst ✓ |
| Prop Muster (prop_friedhof.png) | „Ab zwei Grabsteinen erscheinen hier Muster: Uhrzeit, Wochentag, Symbol, Setup, Verlustserie oder Emotion, wenn sie sich wiederholen.“ | ✓ |
| Prop Payout-Planer (prop.js:279) | „Keine Bedingungen hinterlegt“ · „Trage im Konto die Payout-Bedingungen ein …“ | ✓ |
| Mentor (mentor.js:79, mentor.png) | „Mentor-Chat einrichten“ · „Der Mentor läuft über deinen eigenen Server, damit der API-Schlüssel nie im Browser landet. Trag unter Einstellungen → Mentor …“ + „Zu den Einstellungen“ + „Anleitung zum Server: server/README.md im Projekt.“ | ~ Dateipfad raus (W-36), „Trag“ → „Trage“ |
| Coach (coach.js:22, coach.png) | „Coach Mode einrichten“ · „Coach Mode läuft über denselben Server wie der Mentor-Chat. Trag …; danach kannst du hier Gruppen anlegen oder einer Gruppe beitreten.“ | ~ „Coach Mode“ → „Coach“, „Trag“ → „Trage“ |
| Coach Schüler (coach.js:112, 154) | „Noch kein Schüler“ · „Schick den Einladungslink. Wer beitritt, erscheint hier mit Kurz-Stats.“ / „Noch keine Einträge“ · „{0} hat im geteilten Zeitraum noch nichts ins Journal geschrieben.“ | ✓ („Journal“ → „Notebook“) |
| News (news.js:86, 88) | „News konnten nicht geladen werden“ + „Erneut versuchen“ · „Keine Termine für diese Auswahl“ | ✓ |
| Coupons (coupons.js:13) | „Noch keine Codes hinterlegt“ · „Rabatt-Codes für Prop Firms erscheinen hier.“ | ✓ |
| Affiliate (affiliate.js:75) | „Affiliate nicht verfügbar“ · „Die Affiliate-Daten konnten nicht geladen werden.“ | ✓ |
| Replay (replay.js:111) | „Replay nicht geladen“ · „Das Modul replay.js fehlt.“ | ✗ technisch (Bereich versteckt) |
| Widgets der Bereiche (widgets.js:324–328, 1569–1577) | „Regelwerk festlegen“ / „Noch keine Runde“ + „Jetzt üben“ / „Kein aktives Prop-Konto“ · „Leg ein Konto an, dann siehst du hier Ampel, Balance und Puffer.“ / „Mentor noch nicht eingerichtet“ · „… Einmal einrichten, dann fragst du ihn direkt von hier.“ | ~ „Leg“ → „Lege“, „Balance“ → „Kontostand“, „Konto“ → „Prop-Konto“ |
| Zertifikat (certificate.js:84) | „Keine Trades in diesem Zeitraum“ · „Wähle einen anderen Zeitraum, um ein Zertifikat zu erstellen.“ | ~ „in diesem“ → „im Zeitraum“ |
| Kontostand im Geld-blind-Modus (widgets.js:262) | „Kontostand ausgeblendet“ · „Im Geld-blind-Modus wird der Kontostand nicht angezeigt.“ | ✓ |
| Challenge-Widget (widgets.js:268) | „Noch kein Ziel festgelegt.“ · „Klicke auf das Zahnrad und trage Gewinnziel und maximalen Verlust ein.“ | ~ Titel ohne Punkt |

### 4.2 Fehlermeldungen (Toasts `err` und Fehlertexte)

| Text (Beleg) | Wertung · Vorschlag |
|---|---|
| „Symbol fehlt“ · „Long oder Short wählen“ · „Einstiegskurs fehlt“ · „Ausstiegskurs fehlt für geschlossenen Trade“ (app.js:476) | ✓ knapp; „Einstiegskurs“ → „Einstieg fehlt“ (1.2) |
| „Bitte ein Startdatum wählen“ (app.js:319) · „Bitte einen Namen eingeben“ (coach) · „Bitte eine E-Mail-Adresse eintragen“ · „Bitte Firma und Kontogröße angeben“ (prop.js:330) · „Bitte Firma, Konto und Größe angeben“ (prop.js:357) · „Bitte Betrag und Datum angeben“ · „Bitte Konto und Bruttobetrag angeben“ · „Bitte 0 bis 100 % angeben“ · „Bitte eine vollständige Adresse angeben“ | ~ Zwei Muster („… fehlt“ und „Bitte … angeben“) für denselben Fall. Ein Muster: „<Feld> fehlt“ bei einem Feld, „<Feld> und <Feld> fehlen“ bei mehreren; „Bitte“ weg. prop.js:330/357 nennen fast dasselbe verschieden → beide „Firma und Kontogröße fehlen“ |
| „Schreib zuerst, was dich beschäftigt“ (dashboard.js:100) · „Erst speichern oder abbrechen“ (dashboard.js:188) · „Maximal 5 Widgets – entferne zuerst eines“ (dashboard.js:207) · „Die letzte Vorlage kann nicht gelöscht werden“ | ✓ Inhalt; Gedankenstrich raus: „Höchstens 5 Widgets. Entferne zuerst eines“ |
| „Datei ist leer oder unlesbar“ (app.js:573) · „Datei nicht lesbar:“ + Rohfehler (misc.js:365) · „Keine gültige Sicherung.“ (store.js:320) · „Kein Notiz-Format“ (notebook.js:94) | ~ „Datei nicht lesbar:“ hängt einen technischen Text an → „Datei nicht lesbar“ (Details in Konsole); „Keine gültige Sicherung“ ohne Punkt; „Kein Notiz-Format“ → „Datei ist keine Notiz“ |
| „Speichern hat nicht geklappt“ (trades.js:94) · „Das hat nicht geklappt“ (coach) · „Speichern hat nicht geklappt. Prüf deine Verbindung und versuch es noch einmal.“ (ruhepunkt.js:776) · „Speichern fehlgeschlagen“ (store.js:101) · „Export fehlgeschlagen. Bitte noch einmal versuchen.“ (certificate.js:91) · „Auswertung fehlgeschlagen“ (voice.js:34) · „Fehlgeschlagen“ (voice.js:124) · „Abgleich nicht möglich“ (coach) · „Kopieren nicht möglich, bitte den Link markieren“ · „Keine Verbindung“ (mentor.js:131) · „Teilen wird hier nicht unterstützt.“ · „Zwischenablage nicht verfügbar. Lade das PNG stattdessen herunter.“ | ✗ drei Register („hat nicht geklappt“, „fehlgeschlagen“, „nicht möglich“). Ein Muster: „<Aktion> nicht möglich“ + ggf. nächster Schritt: „Speichern nicht möglich“, „Export nicht möglich, bitte noch einmal versuchen“, „Kopieren nicht möglich, Link markieren und Strg+C drücken“, „Auswertung nicht möglich“, „Abgleich nicht möglich“ |
| „Dieses Bildformat kann der Browser nicht lesen (z. B. HEIC). Bitte JPG oder PNG wählen.“ (misc.js:278) · „Bild konnte nicht gespeichert werden“ · „Keine Bilder erkannt“ / „Kein Bild erkannt“ · „Das war keine Bilddatei“ / „Nicht alle Dateien waren Bilder“ (editor.js:205) | ~ vier Texte für „keine Bilddatei“ → „Keine Bilddatei“ / „Nur Bilddateien (JPG, PNG)“ |
| „Kein Mikrofonzugriff. Erlaube das Mikrofon in den Browser-Einstellungen oder nutze die Text-Notiz.“ (voice.js:84) · „Mentor-Server nicht eingerichtet“ · „Der Mentor-Server ist nicht erreichbar. Prüf die Adresse unter Einstellungen → Mentor und deine Verbindung.“ (mentor.js:17) · „Zugangstoken fehlt oder ist falsch.“ · „Tageslimit von {0} Nachrichten erreicht. Morgen geht es weiter.“ | ✓ („Prüf“ → „Prüfe“) |
| „Der Browser erlaubt keine Mitteilungen für diese Seite“ · „Im Browser blockiert. Du kannst Mitteilungen …“ · „Auf dem Server ist kein E-Mail-Versand eingerichtet (COACH_SMTP_HOST, siehe server/README.md)…“ | ~ letzterer technisch (W-36) |
| Trade-Dialog-Vorschau „Long oder Short wählen“ (modal_trade_loggen.png) als Hinweis unten links, zugleich als Fehler-Toast | ✓ beides derselbe Wortlaut, gut |

### 4.3 Erfolgs- und Hinweis-Toasts

| Muster | Beispiele (Beleg) | Wertung · Vorschlag |
|---|---|---|
| „<Objekt> gespeichert“ | „Trade gespeichert“, „Profil gespeichert“, „Konto gespeichert“, „Design gespeichert“, „Vorlage gespeichert“, „Preset gespeichert“, „Check-in gespeichert“, „Provision gespeichert“, „Screenshot vor Entry gespeichert“ | ✓ Stammform |
| „Gespeichert“ allein (app.js:483 und 7 weitere) | | ~ nur, wenn das Objekt im Kontext eindeutig ist (Einstellungen-Formulare: ok) |
| „<Objekt> angelegt/erstellt/erfasst“ | „Konto angelegt“, „Preset angelegt“, „Vorlage „X“ erstellt“, „Gruppe erstellt. Kopiere den Einladungslink.“, „Ausgabe erfasst“, „Payout erfasst“, „Notiert“ (verpasster Trade), „Kopie erstellt“ | ~ auf „angelegt“ vereinheitlichen (parallel zu den Knöpfen 3.1); „Notiert“ → „Verpasster Trade notiert“ |
| „<Objekt> gelöscht/entfernt“ | „Trade gelöscht“, „Vorlage gelöscht“, „Konto gelöscht“, „Design gelöscht“, „Alle Daten gelöscht“, „Beispieldaten entfernt“, „{0} entfernt“, „Gruppe geschlossen“, „Verlauf gelöscht“ | ✓ |
| Kopieren | „Kopiert“ (misc.js:363), „In die Zwischenablage kopiert“ (certificate.js:98), „Code kopiert“ (coupons.js:18), „Einladungslink kopiert“, „Co-Coach-Link kopiert“, „Text markiert, jetzt mit Strg+C kopieren“, „Markiert, jetzt mit Strg+C kopieren“ | ~ „<Objekt> kopiert“ („Link kopiert“, „Code kopiert“, „Zertifikat kopiert“); Fallback einheitlich „Markiert, jetzt Strg+C drücken“ |
| Notebook | „Vorlage „X“ eingefügt“, „Notiz geladen“, „{0} Notizen verschoben“, „Verschoben“, „In den Papierkorb verschoben“, „Wiederhergestellt“, „Druckdialog: dort „Als PDF speichern“ wählen“ | ~ „Verschoben“ → „Notiz verschoben“; Papierkorb-Toast ok |
| Session | „Session läuft. Viel Erfolg.“ (app.js:548), „Session beendet“ | ~ „Session gestartet“ (parallel zur Checkliste „Session gestartet“) |
| Beispieldaten | „Beispieldaten geladen“, „Beispieldaten entfernt“, „Beispieldaten konnten nicht geladen werden“ | ✓ |
| Prop | „Status: {0}“ (prop.js:337), „Konto als geplatzt markiert“, „{0} Trades zugeordnet“, „Preset kopiert – bitte Werte prüfen“ | ~ „Status: Archiviert“ → „Konto archiviert“ (Partizipform); Gedankenstrich raus |
| Voice/Mentor | „Übernommen“, „Aufnahme gespeichert.“, „Transkript gespeichert. Für Vorschläge … richte den Mentor-Server ein.“, „Verbindung geprüft“, „Verlauf gelöscht“ | ~ Punkt weg; zweiter Satz in die Fläche |
| Sprache | „Währung: {0}“ (misc.js:289, nach Sprachwechsel) | ~ „Währung auf {0} umgestellt“ |
| Schatten-Ich | „Drei Regeln eingeschaltet“ | ✓ |

### 4.4 Tooltips und Info-Texte (112)

Insgesamt die stärkste Textgruppe der App: fast alle erklären die Rechnung in ein bis zwei Sätzen, neutral und ohne Füllwörter („Bruttogewinn geteilt durch Bruttoverlust.“). Befunde:

- **W-14b · Dashboard-Widgets · Schwere 3.** UI-Jargon: „Die Pillen zeigen die längste Verlust- und Gewinnserie.“ (widgets.js:179, 181, 183). → „Darunter die längste Verlust- und Gewinnserie.“
- **W-14c · Mini-Kalender · Schwere 3.** „Beim Drüberfahren erscheint das Ergebnis.“ (widgets.js:275) und „Fährst du mit der Maus darauf, steht der Grund dabei.“ (misc.js:174) sind umgangssprachlich und gerätespezifisch (Touch hat keine Maus). → „Beim Darüberfahren oder Antippen erscheint das Ergebnis.“ / „Beim Darüberfahren oder Antippen steht der Grund dabei.“
- **W-14d · Regel-Tracker · Schwere 3.** „Heatmap wie bei GitHub“ (widgets.js:279). → „Ein Kästchen pro Tag: je mehr Regeln eingehalten, desto kräftiger die Farbe.“ (der Rest des Satzes sagt es schon). Ebenso „abhaken im Fortschritt-Tab“ → „abhaken im Fortschritt“.
- **W-14e · Zahnrad · Schwere 3.** Vier Tooltips sagen „über das Zahnrad“ (widgets.js:232, 265, 290; 268 „Klicke auf das Zahnrad“), der Knopf heißt „Einstellungen“ (widgets.js:234 title). → „über die Widget-Einstellungen (Zahnrad)“ beim ersten Mal, sonst „über die Widget-Einstellungen“.
- **W-14f · Tagesansicht · Schwere 3.** data-tip „Daily Profit Certificate“ (day.js:12) englisch. → „Tageszertifikat erstellen“.
- **W-14g · Gesamt-Score · Schwere 2.** Radar-Info „Sechs Achsen …: Trefferquote, Profit-Faktor, Gewinn/Verlust-Verhältnis, Konsistenz, Regeltreue und Drawdown“ (widgets.js:226) und Bibliotheks-Beschreibung „Punktzahl … aus Trefferquote, Profit-Faktor, Gewinn/Verlust-Verhältnis, Drawdown und Konstanz“ (dieselbe Zeile, fünf statt sechs Achsen, „Konstanz“ statt „Konsistenz“, keine Regeltreue). → Beschreibung an die Info angleichen (sechs Achsen, „Konsistenz“, „Regeltreue“).
- **W-14h · Fortschritt · Schwere 3.** Info „Check-in, Session, Trades, Regeln, Tagesnotiz.“ (progress.js:68) ist nur eine Aufzählung. → „Zählt heute: Check-in, Session, Trades, Regeln und Tagesnotiz.“
- Tooltips ohne Punkt, die Sätze sind: „Filtern nach Ordner, Tag und Zeitraum“ (ok als Nominalgruppe), „Sortieren: Zuletzt bearbeitet“ (ok). Kein Befund.

### 4.5 Platzhalter (38)

- **Gut:** Beispielmuster „z. B. …“ ist konsequent („z. B. Scalping-Tag“, „z. B. Topstep“, „z. B. 2R oder 150 €“); Fragen als Platzhalter in Reflexionsfeldern („Warum dieser Trade?“, „Was lief gut, was nicht, was nimmst du mit?“) passen zum Ton.
- **W-39 · Prop → Konto-Dialog · Schwere 3.** Platzhalter „= Kontogröße“ (prop.js:198, Startbalance) und „oder über Konto“ (prop.js:262, Ausgabe-Firma) sind Kürzel ohne Satz. → „wie Kontogröße“ / „leer: Firma des gewählten Kontos“.
- **W-39b · Coach → Beitritt · Schwere 3.** Feld „Dein Name für den Mentor“ mit Platzhalter „Vorname“ (coach.js:172): Platzhalter wiederholt nicht das Label, gut; „Mentor“ → „Coach“ (W-02).
- **W-39c · Einstellungen → Server · Schwere 2.** Platzhalter „Wert von MENTOR_APP_TOKEN“ (misc.js:157). → „Zugangstoken vom Server“.
- **W-39d · Filter-Suche · Schwere 3.** „Suchen …“ (dash-filter.js:95) ohne Objekt, obwohl die Liste Symbole zeigt. → „Symbol suchen“.
- Editor „Schreib los …“ (editor.js:132): einziger Platzhalter in Kurzform-Imperativ; passt zum Notebook-Ton, kann bleiben.

---

## 5. Titel der Bereiche und Reiter

### 5.1 Navigation (app.js:14–19) und Seitentitel

| Gruppe | Einträge · Seitentitel | Wertung |
|---|---|---|
| Übersicht | Dashboard · Statistiken · Fortschritt | ✓ Einwort-Nomen |
| Journal | TradeLog · Tagesansicht · Notebook · News | ✓ (Gruppe heißt „Journal“, siehe W-20) |
| Training | Schatten-Ich · (Blind-Replay, versteckt) · Mentor · Ruhepunkt | ✓ |
| Konten | Prop Firms · Coupon-Codes | ✗ Gruppe heißt „Konten“, enthält kein Journal-Konto (W-03) → „Prop Trading“ |
| Konto-Menü unten | Profil · Coach · Affiliate · Einstellungen · Benachrichtigungen · Sprache · Design (Hell/Dunkel) | ~ „Design“ im Menü, in den Einstellungen heißt der Bereich „Design“ und sein erster Block „Erscheinungsbild“ (misc.js:143); der Schalter wechselt nur Hell/Dunkel → Menüzeile „Erscheinungsbild“ |
| Seitentitel | Trade-Detail heißt „Trade“ (trades.js:19); Notebook-Freigabe „Geteilte Notiz“; alle anderen = Nav-Name | ✓ |

### 5.2 Reiter und Unter-Navigation

| Bereich | Reiter (Beleg) | Wertung · Vorschlag |
|---|---|---|
| Statistiken | Übersicht · Tage · Setups · Zeit · Fehler · Marktphase · Zustand · Edge-Check · Monte Carlo (stats.js:5) | ✓ Einwort-Nomen; „Edge-Check“ ist der einzige mit Verb-Anteil → „Edge“ reicht (Karte darunter heißt „Rollierender Edge“) |
| TradeLog | Trades · Tage · Verpasste Trades (trades.png) | ✓ |
| Dashboard „Letzte Trades“ | Letzte Trades · Offene Positionen | ✓ |
| Prop Firms | Übersicht · Auswertung · Konten (prop.js:12) mit Unter-Reitern Bilanz · Friedhof unter „Auswertung“ (prop_friedhof.png); die Bereichsleiste steht auf der Übersicht in der Kopfreihe (prop_cockpit.png), im Friedhof oben rechts in der Titelzeile (prop_friedhof.png) | ~ „Auswertung“ ist kein treffender Oberbegriff für „Bilanz“ (Geld) und „Friedhof“ (geplatzte Konten); zwei Ebenen für vier Ansichten. → eine flache Leiste **Übersicht · Bilanz · Friedhof · Konten**. Berührt Aufbau: ja, begründet (eine Ebene weniger, Namen sagen, was drin ist). |
| Einstellungen | Profil · Design · Sprache · Benachrichtigungen · Abo ‖ Konten · Trading · Regeln · Notebook · Mentor · Inhalte · Logs (misc.js:6) | ~ „Logs“ → „Verlauf“ (W-23d); „Mentor“ → „Server“ (versorgt Mentor, Coach, News, Sprachnotizen; W-02); „Inhalte“ (= Kategorien und Tags) → „Tags“; „Design“ → „Erscheinungsbild“ oder umgekehrt den Block umbenennen, nicht beides behalten |
| Einstellungen → Logs | Imports · Verlauf (misc.js:250) | → „Importe · Änderungen“ |
| Coach | Als Mentor · Als Schüler (coach.js:53) | → „Als Coach · Als Schüler“ |
| Affiliate | Alle Creator · Creator-Ansicht (affiliate.js:2) | ~ „Creator-Ansicht“ ist eine Sicht, „Alle Creator“ eine Liste; → „Alle Creator · Mein Creator-Konto“ oder „Betreiber · Creator“ |
| Zertifikat-Menü | Daily Profit (Tag) · Weekly Profit (Woche) · Monthly Profit (Monat) · Performance (Stats) (certdata.js:8–11, pop_zertifikat.png) | ✗ englisch vorn, „Stats“ (W-23f) |
| Zeitraum-Menü | Heute · Diese Woche · Dieser Monat · Letzte 30 Tage · Dieses Quartal · Dieses Jahr · Gesamt · Benutzerdefiniert (app.js:21) | ✓ |
| Notebook-Seitenleiste | Ordner: Alle Notizen · Trade Notes · Daily Journal · Session Recap · (eigene) · Tags · „Kürzlich gelöscht“ (notebook.js:57) während der Bereich selbst „Papierkorb“ heißt (notebook.js:61 Titel, Toast „In den Papierkorb verschoben“, Dialog „Papierkorb leeren?“) | ✗ zwei Namen für den Papierkorb → „Papierkorb“ auch im Link (notebook.js:57); Standardordner deutsch (1.5) |
| Ruhepunkt | Vor dem Trading · Nach dem Trading · Akut-Reset (Strings 1110–1114) | ✓ |

### 5.3 Konvention für Titel

Beobachtet und bestätigt: Bereichs- und Reiternamen sind **Nomen ohne Verb**, Einzahl (außer „Statistiken“, „Trades“, „Tage“, „Setups“, „Konten“, wo die Mehrzahl die Liste meint), Satzschreibung. Karten- und Kachel-Titel sind Nomen oder Nominalgruppen („Kumulierter Tages-P&L“, „Letzte Trades und offene Positionen“), nie Fragen (Ausnahme Ruhepunkt-Schritte: „Wie geht es dir heute wirklich?“ ist dort gewollt). Dialog-Titel nennen die Aktion im Infinitiv („Trade loggen“, „CSV importieren“, „Widget hinzufügen“, „Notiz teilen“) oder das Objekt („Check-in 11.10.2026“, „Plan und Bewertung NQ“).

Abweichungen: „Session starten“ als Dialogtitel, obwohl der Dialog den Check-in enthält (app.js:490) → „Session starten“ bleibt, aber der erste Abschnitt heißt „Check-in“; „Verpassten Trade notieren“ ✓; „Neue Vorlage“ (dashboard.js:193) → „Vorlage anlegen“; „Challenge einrichten“ → „Ziel festlegen“; „Trades zuordnen · {Konto}“ ✓.

---

## 6. Empfehlung: Wording-Regelwerk in 15 Regeln

1. **Du, Präsens, aktiv.** Der Nutzer wird mit „du“ angesprochen, die App spricht nie als „wir“ (Ausnahme: der Sprecher im Ruhepunkt, der mitatmet). Keine Floskeln („Erlebnis“, „einfach“, „schnell“), keine rhetorischen Fragen außerhalb von Check-in und Ruhepunkt. Imperative in der Vollform („Trage“, „Lege“, „Prüfe“); die Kurzform nur im gesprochenen Ton des Ruhepunkts.
2. **Ein Wort pro Sache, festgelegt im Glossar (Abschnitt 1).** Stammformen: Trefferquote, Netto-P&L, Erwartungswert, Profit-Faktor, Break-even, Konsistenz, Max., Ø, Einstieg/Ausstieg, Eröffnet/Geschlossen, Kontrakte, Volumen, Ergebnis, Zeitraum, Konto (Journal), Prop-Konto, Konto-Vorlage, Kontostand, Regeln (Checkliste), Regelwerk (Schatten-Ich), Verstöße, Session (Trading), Übung (Ruhepunkt), Runde (Replay), Check-in, Tagesform (statt Ruhepunkt-Ampel), Ampel (Prop), Mentor (KI), Coach (Mensch), Notebook, Notiz, Tagesnotiz, Tag (Schlagwort, sächlich), Widget, Vorlage, Recap, Score. Neue Texte werden vor dem Einbau gegen diese Liste geprüft (grep).
3. **Ein Wort hat eine Bedeutung.** Kein Begriff bezeichnet zwei verschiedene Dinge (heute: Mentor, Konto, Session, Check-in, Ampel, Journal, Tag). Wenn ein zweites Ding denselben Namen braucht, bekommt eines ein Präfix (Prop-Konto, Tagesnotiz) oder ein anderes Wort.
4. **Englisch nur als Fachwort oder Produktname.** Erlaubt ist die Liste in 1.6 (Trade, Setup, Drawdown, Payout, Daily Loss, Profit Target, Consistency Rule, Edge, Score, Recap, Widget, Tag, Dashboard, TradeLog, Notebook, News, Coach, Mentor, Affiliate …). Alles andere ist deutsch (Bewertet statt Reviewed, Kontostand statt Balance, Verlauf statt Logs, geplatzt statt Breach, Konto-Vorlage statt Preset). Prop-Regelnamen bleiben in der Sprache der Firmen und werden nie halb übersetzt.
5. **Knöpfe: Objekt + Verb im Infinitiv** („Trade loggen“, „Prop-Konto anlegen“, „CSV importieren“). Nur Nomen, wenn der Knopf ein Menü öffnet („Filter“, „Zertifikat“, „Vorlage“). Hauptknopf eines Bereichs darf „Neue Notiz“ heißen, dann aber nach demselben Muster überall („Neue Regel“, „Neue Vorlage“).
6. **Verb-Familie:** anlegen (neuer Datensatz) · hinzufügen (in bestehende Sammlung/Ansicht) · loggen (nur Trade) · eintragen (Werte in ein bestehendes Objekt: Ausgabe, Payout, Plan) · einrichten (Verbindung) · bearbeiten (Dialog mit mehreren Feldern) · ändern (ein Attribut) · speichern (Dialog schließen und behalten) · anwenden (Filter, Zeitraum) · übernehmen (Vorschlag) · löschen (Daten weg, mit Rückfrage) · entfernen (aus Ansicht, Daten bleiben) · leeren (Container) · zurücksetzen (auf Standard) · öffnen (Objekt oder Bereich aufrufen) · anzeigen (mehr im selben Bild) · Zu/Zum/Zur + Bereichsname (Navigation aus Leerzuständen) · Abbrechen (Dialog ohne Speichern) · Schließen (Fläche ohne Eingaben).
7. **Pro Bildschirm ein Knopf je Aktion.** Die Kopfreihe trägt die Hauptaktionen; Karten wiederholen sie nicht. Leerzustände dürfen einen Link mit demselben Wortlaut haben.
8. **Schreibweise:** Satzschreibung mit großem Anfang in Titeln, Reitern, Knöpfen, Feldnamen, Pillen, Optionen und Werten („Aktiv“, „Niedrig“, „Automatisch“). Versalien nur per CSS für Mikro-Labels und Nav-Gruppen, nie im Text. Klein nur Skalen-Enden und Satzteile.
9. **Satzzeichen:** Titel, Reiter, Knöpfe, Feldnamen, Pillen, Kachel-Titel und Toasts ohne Punkt und ohne Doppelpunkt. Hilfstexte, Tooltips, Leerzustand-Texte und Dialogtexte sind ganze Sätze mit Punkt. Fragen nur als Titel von Bestätigungen („Trade löschen?“) und in Check-in/Ruhepunkt. Kein „wirklich“, kein Ausrufezeichen.
10. **Striche und Zeichen:** Keine Gedankenstriche als Satzzeichen (Doppelpunkt, Komma, Punkt). Halbgeviertstrich „–“ nur für Bereiche ohne Leerzeichen („1–10“, „09:30–16:00“). Mittelpunkt „ · “ trennt Metadaten („+893,04 € · 5 Handelstage“). Minus ist „−“ (U+2212). Kein Wert ist „—“. „&“ nur in „P&L“ und „Drag & Drop“, sonst „und“. Typografische Anführungszeichen „…“ (werden schon überall benutzt).
11. **Ellipse „…“** (ein Zeichen, mit Leerzeichen davor) nur für laufende Vorgänge im Muster „Wird <Partizip> …“ („Wird geladen …“, „Verlauf wird geladen …“) und für Menüpunkte, die einen Dialog öffnen („Neue Vorlage …“). Suchfelder ohne Ellipse („Trades suchen“).
12. **Zahlen und Daten kommen aus `fmt`, nie aus dem Text.** Datum kurz „08.10.2026“, mit Zeit „08.10.2026, 19:43“, lang „Sonntag, 11. Oktober 2026“, Achsen „08.10.“; Monatsnamen nie abgekürzt. Zahl und Einheit mit geschütztem Leerzeichen („40,0 %“, „+2,5 R“, „1 h 22 min“). Skalen als „3 von 5“. Kontogrößen „50K“ nur im Konto-Namen, sonst Betrag in Kontowährung. Ein Betrag erscheint auf einem Bildschirm nur in einer Währung.
13. **Abkürzungen:** nur Ø, Max., z. B. (mit schmalem geschütztem Leerzeichen), R, P&L, MAE/MFE, CSV, JSON, PDF, PNG, 2FA, ROI, Strg. Einheiten für Dauer wie `fmt.dur` („min“, „h“, „d“), nicht „Min.“/„Std.“. Keine Entwickler-Namen (Dateipfade, Variablen, Modulnamen) in der Oberfläche.
14. **Leerzustände, Toasts, Bestätigungen nach festem Muster.** Leerzustand: Titel „Noch keine …“ / „Keine … im Zeitraum“ / „Kein … passt zum Filter“, ein Satz mit nächstem Schritt, höchstens ein Knopf. Erfolgs-Toast: „<Objekt> <Partizip>“ („Trade gespeichert“, „Konto angelegt“), ein Satz, kein Punkt; „Gespeichert“ nur bei eindeutigem Kontext. Fehler-Toast: „<Feld> fehlt“ oder „<Aktion> nicht möglich“ + nächster Schritt, ohne „Bitte“, ohne „hat nicht geklappt“, ohne „fehlgeschlagen“. Bestätigung: Titel „<Objekt> löschen?“, Text nennt die Folge, Knopf trägt das Verb („Löschen“, „Leeren“, „Verlassen“), nie „OK“.
15. **Tooltips erklären Rechnung oder Bedeutung in ein bis zwei Sätzen,** neutral, geräteneutral („beim Darüberfahren oder Antippen“), ohne UI-Jargon („Pillen“, „Zahnrad“ nur mit Erklärung „Widget-Einstellungen (Zahnrad)“), ohne Vergleiche mit anderen Produkten („wie bei GitHub“, „nach TradeZella“). Der Tooltip eines Widgets und seine Beschreibung in der Bibliothek nennen dieselben Achsen und Begriffe.

---

## 7. Hinweise: Was schon gut ist

- Du-Form ohne einen einzigen Sie-Ausrutscher; Ton ruhig und direkt, besonders im Schatten-Ich („Höchstens so viele Trades an einem Tag.“), im Friedhof-Leerzustand („Gut so.“) und in der Tagesansicht („Ein ruhiger Tag ist auch ein guter Tag.“).
- Typografie der Zeichen ist sauber: echte Ellipse „…“ überall (0 × „...“), Anführungszeichen „…“ überall, echtes Minus in Beträgen, 0 doppelte Leerzeichen, nur ein Ausrufezeichen.
- Tooltips erklären Formeln statt zu werben („Bruttogewinn geteilt durch Bruttoverlust. Über 1,5 gilt als gut …“), und Bestätigungsdialoge nennen die Folge („Die Notiz verschwindet auch beim Schüler.“).
- Leerzustände folgen fast überall dem Muster Titel + nächster Schritt + ein Knopf; die Unterscheidung „Noch keine …“ (nie etwas) gegen „Keine … im Zeitraum“ (Filter) ist bereits gelebt.
- Zeitraum-Menü, Statistik-Reiter, TradeLog-Reiter und Dashboard-Vorlagen-Texte sind in sich konsistent; „Zeitraum“ hat keine Konkurrenz.
- Die Prop-Welt benutzt die Firmenbegriffe (Daily Loss, Profit Target, Consistency Rule, Payout) konsequent englisch; das ist richtig, nur „Balance“, „Breach“, „Preset“ und „Cockpit“ fallen heraus.
- Beispielplatzhalter („z. B. Scalping-Tag“, „z. B. 2R oder 150 €“) sind konkret statt generisch.
- Keine Tippfehler gefunden.

### Reihenfolge für die Umsetzung (nach Schwere und Reichweite)

1. W-01 (Trefferquote), W-08 (Netto-P&L), W-41/1.1 (Erwartungswert-Doppelkachel): vier Dateien (core.js:265/316/317/319/323, widgets.js:115/165, screens/coach.js:96/113/121, day.js:14).
2. W-04 (doppelte Knöpfe: day.js:12/16, prop.js:82/294), W-06 (Währung prop.js:75), W-05a (Datumsfeld im Dialog), W-05c (Dezimalstellen prop.js:93/94/102), W-44 (Konto-Karte app.js:229).
3. W-02/W-03 (Mentor→Coach, Konto-Präfixe, Nav-Gruppe), W-16 (Preset→Konto-Vorlage), W-17/W-18/W-19 (Session/Check-in/Ampel), W-20/W-21 (Journal/Tag).
4. Tabellen 1.2 und 1.6 (Feldnamen und englische Reste), Notebook-Papierkorb, Standardordner.
5. Satzzeichen- und Toast-Muster (2.4, 4.2, 4.3), Imperativ-Form (W-34), Tooltips (4.4).
