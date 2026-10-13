# Hick's Law: Jeder Screen will genau eine Sache

Journalyst · Stand 13.10.2026 · 196 geprüfte Zustände · 112 Vorschläge · 17 Entscheidungen · Umsetzung erst nach deiner Freigabe · Belege und Prüfnotizen in `hicks.json`

## Gesamtbild

Gut eingehalten sind die Regeln dort, wo du zuletzt selbst aufgeräumt hast: Fast jeder Dialog hat genau einen gefüllten Knopf, Menüs bündeln Seltenes, und Schatten-Ich, Mentor und Coach haben eine schlanke Kopfreihe. Am schwächsten ist Regel 2 bei der wichtigsten Aktion: „Trade loggen“ ist bewusst nur getönt, deshalb gewinnt jeder gefüllte Knopf daneben, etwa die Knöpfe der Bereichs-Widgets im Dashboard, „Tagesnotiz anlegen“, „2FA aktivieren“ oder „30 Sekunden aufnehmen“. Ebenso schwach ist Regel 5: Dashboard, TradeLog, Statistiken, Tagesansicht, Bilanz und Blind-Replay zeigen ohne Daten das volle Werkzeugbrett statt eines Satzes und eines Knopfs. Den größten Hebel hat die Kopfreihe, die „Trade loggen“ und ▷ auf neun Seiten mit anderer Aufgabe zeigt (Nr. 1); danach folgen die leeren Zustände, die Trade-Detailseite mit dem Hauptknopf unter der Falz und lange Formulare wie „Konto anlegen“ mit 30 gleichrangigen Feldern.

## Hierarchie-Stufen

Nur diese Stufen gibt es im Design, und nur mit ihnen arbeiten die Vorschläge. Kein neuer Stil, keine neue Farbe.

| Stufe | Element | So sieht es aus | Wofür |
|---|---|---|---|
| Primär, gefüllt | `.btn.primary` (app.css:274) | grüne Fläche, dunkle Schrift, 600 | der eine Hauptknopf eines Bereichs oder Dialogs: „Speichern“, „Neue Notiz“, „Konto anlegen“; im Leerzustand auch „Trade loggen“ |
| Primär, global | `.btn.accent` „Trade loggen“ (app.css:3137) | Kartenfläche, grün getönter Verlaufsrand, grüne Schrift; **nicht gefüllt** | der globale Hauptknopf in der Kopfreihe |
| Primär, Handy | runder Knopf `.dash-head .tl` (app.css:3019) | 54-px-Kreis unten rechts; heute dunkel mit grünem Ring, weil 3137 ihn überschreibt | „Trade loggen“ auf dem Handy |
| Sekundär | `.btn` (auch `.sm`, `.xs`) | Rahmen, Kartenfläche, keine Füllung | der Zweitweg: „Abbrechen“, „CSV importieren“, „Zeitraum ändern“ |
| Tertiär | `.btn.ghost`, Textlink | nur Text oder Symbol, kein Rahmen | Seltenes und reine Navigation: „Mehr anzeigen“, „Heute“, „Tag ansehen“ |
| Werkzeug | `.btn.icon-only`, `.btn.ghost.icon` | nur Symbol (gerahmt bzw. ohne Rahmen), Text für Screenreader | Vorlage, Zertifikat, Session ▷ |
| Zerstörend | `.btn.danger` | roter Rahmen und rote Schrift, keine Füllung (ghost-rot nur im Notebook, app.css:1011) | „Löschen“ in Bestätigungen |
| Versteckt | Menü/Popover (`.popwrap` + `.item`), Aufklappzeile `<details><summary class="muted small">` (app.js:560), Hover-Einblendung `.dot-x` (app.css:463-467) | erst auf Klick oder Hover | „Mehr Optionen“, zweite Schritte, Löschen in Listen |

Zählregel: „Gefüllt“ heißt in diesem Bericht immer `.btn.primary`, also eine grüne Fläche. „Trade loggen“ ist am Desktop bewusst nur getönt (deine Festlegung, README:202-208); deshalb gewinnt jeder gefüllte Knopf daneben, und Regel 2 entsteht für „Trade loggen“ durch weniger Konkurrenz, nicht durch eine Füllung. Je Screen höchstens ein gefüllter Knopf. Wo ein Vorschlag einen bisher umrandeten Knopf füllt, entscheidest du das mit E3, weil Grün sonst nur für Gewinn und „Trade loggen“ steht. Der Ruhepunkt hat eigene Stufen in seiner Phasenfarbe (`.rp-primary` gefüllt, `.rp-btn` mit Rand, `.rp-ghost`, `.rp-quiet`). Gewählte Reiter und Segmente tragen die flache, leicht angehobene Fläche (app.css:3124 ff.); das ist ein Zustand, kein Knopf-Rang.

## Pro Screen

In der Reihenfolge der Navigation. „Nr.“ verweist auf die Vorschläge im nächsten Kapitel.

### Rahmen der App: Titelzeile, Seitenleiste, Menüs, Kopfreihe

#### Titelzeile · voll (Desktop)

- **Hauptaktion:** Orientierung (Seitentitel); auf dem Dashboard trägt sie Zeitraum, Konto und Filter, die Hauptaktion liegt eine Reihe tiefer.
- **Optisch klar?** Nein. Erstes Element ist ein ☰ ohne Funktion, daneben drei gleich große Rahmenknöpfe; ein aktiver Filter sieht aus wie „Trade loggen“.
- **Konkurrierende Knöpfe:** ☰ (wirkungslos); Zeitraum, Konto, Filter; aktiver Filter in Akzent-Optik; Avatar „T“ doppelt zur Konto-Karte.
- **Versteckbar:** Konto-Wahl bei einem Konto.
- **Nicht relevant gezeigt:** ☰ auf dem Desktop; Konto-Knopf mit einem einzigen Konto. (Das Verrutschen von Zeitraum/Konto auf andere Seiten ist seit 11.10. behoben.)

→ Nr. 3, 25, 27

#### Titelzeile · leer (Dashboard ohne Trades)

- **Hauptaktion:** Ersten Trade loggen oder importieren; die Aktion kommt aus der Seite.
- **Optisch klar?** Nein. Stärkster Knopf ist das gefüllte „Beispieldaten laden“, nicht „Trade loggen“.
- **Konkurrierende Knöpfe:** Zeitraum, Konto, Filter; gefülltes „Beispieldaten laden“.
- **Versteckbar:** Zeitraum, Konto, Filter bis zum ersten Trade.
- **Nicht relevant gezeigt:** Filter und Zeitraum ohne Daten; Konto-Wahl bei einem Konto.

→ Nr. 19

#### Titelzeile · Handy

- **Hauptaktion:** Menü öffnen (☰); die Seitenaktion ist der runde „+“.
- **Optisch klar?** Ja, nur ☰, Titel, Avatar.
- **Konkurrierende Knöpfe:** Avatar (→ Profil) und Konto-Karte (→ Menü) tun Verschiedenes.
- **Versteckbar:** Konto-Karte in der Schublade, sobald der Avatar das Konto-Menü öffnet.
- **Nicht relevant gezeigt:** —

→ Nr. 111

#### Seitenleiste · ausgeklappt

- **Hauptaktion:** Bereich wechseln; die Leiste lässt der Seite den Vortritt.
- **Optisch klar?** Ja, nur der aktive Eintrag ist angehoben, kein Knopf gefüllt.
- **Konkurrierende Knöpfe:** Konto-Karte unten doppelt zum Avatar; Einklapp-Symbol neben dem wirkungslosen ☰. 12 gleichrangige Einträge sind für Navigation normal.
- **Versteckbar:** — (Coupons nach Prop zu verlegen ist verworfen).
- **Nicht relevant gezeigt:** ☰ in der Titelzeile.

→ Nr. 27

#### Seitenleiste · eingeklappt

- **Hauptaktion:** Bereich per Symbol wechseln.
- **Optisch klar?** Ja. Aktiver Eintrag einzige Fläche.
- **Konkurrierende Knöpfe:** Zwei gleiche „T“ mit verschiedenem Verhalten; ☰ neben dem Ausklapp-Symbol.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** ☰ auf dem Desktop.

→ Nr. 27, 111

#### Seitenleiste · leer (keine Trades)

- **Hauptaktion:** Navigation; die Seite (erster Trade) führt.
- **Optisch klar?** Ja. Die Leiste bleibt wie im vollen Zustand, das ist richtig.
- **Konkurrierende Knöpfe:** Hinweis-Punkt „Check-in fehlt“ (Mo–Fr) schon ohne einen Trade.
- **Versteckbar:** Check-in-Punkt bis zum ersten Trade; Coach-, Notebook- und Prop-Punkte bleiben.
- **Nicht relevant gezeigt:** Check-in-Erinnerung vor dem ersten Trade.

→ Nr. 72

#### Handy-Menü (Schublade)

- **Hauptaktion:** Bereich wählen.
- **Optisch klar?** Ja. Aktiver Eintrag einzige Fläche, Schließen als ghost-X.
- **Konkurrierende Knöpfe:** Konto-Karte unten, angeschnitten (816–874 px bei 844 px Höhe).
- **Versteckbar:** Konto-Karte, sobald der Avatar das Konto-Menü öffnet.
- **Nicht relevant gezeigt:** —

→ Nr. 111

#### Konto-Menü unten links · Desktop

- **Hauptaktion:** Einstellungen öffnen.
- **Optisch klar?** Nein. Sechs gleichrangige Einträge plus Design-Schalter, „Einstellungen“ an vierter Stelle.
- **Konkurrierende Knöpfe:** „Profil“ und „Einstellungen“ (gleiche Seite); „Benachrichtigungen“, „Sprache“ (Unterseiten).
- **Versteckbar:** — (Inhalt und Reihenfolge hast du festgelegt; das Menü ist selbst die versteckte Stufe).
- **Nicht relevant gezeigt:** Doppelte Wege zur selben Seite.

#### Konto-Menü · Handy

- **Hauptaktion:** Einstellungen öffnen.
- **Optisch klar?** Nein. Wie am Desktop; der Auslöser ist angeschnitten.
- **Konkurrierende Knöpfe:** Wie Desktop.
- **Versteckbar:** Wie Desktop.
- **Nicht relevant gezeigt:** —

#### Kopfreihe · voll (Standard auf allen Seiten ohne eigene Kopfreihe)

- **Hauptaktion:** Die Aktion der jeweiligen Seite: TradeLog „Trade loggen“, Prop „+ Prop-Konto“, Notebook „Neue Notiz“, Einstellungen „Speichern“, Tagesansicht „Trade loggen“ für den Tag.
- **Optisch klar?** Nein. „Trade loggen“ und ▷ stehen auf jeder Seite; wo die Seite einen gefüllten Knopf hat („Tagesnotiz anlegen“, „Speichern“, „2FA aktivieren“), ist der stärker.
- **Konkurrierende Knöpfe:** „Trade loggen“ auf Seiten mit anderer Aufgabe; ▷ auf neun Seiten mit anderer Aufgabe; Zeitraum/Konto auf Einstellungen und Tagesansicht.
- **Versteckbar:** ▷ nur auf TradeLog und Tagesansicht (laufende Session überall); „Trade loggen“ nur auf Dashboard, TradeLog, Tagesansicht und der Prop-Übersicht (am Desktop überall per Taste N).
- **Nicht relevant gezeigt:** „Trade loggen“ und ▷ auf Coupons, Affiliate, News, Einstellungen; Zeitraum/Konto auf Einstellungen; Zeitraum auf der Tagesansicht.

→ Nr. 1, 8

#### Kopfreihe · leer (Konto ohne Trades)

- **Hauptaktion:** Ersten Trade loggen oder CSV importieren.
- **Optisch klar?** Nein. Beide Aktionen stehen doppelt; der gefüllte Knopf der Leer-Karte schlägt den oben.
- **Konkurrierende Knöpfe:** „Trade loggen“ oben (getönt) gegen „Trade loggen“ unten (gefüllt); „CSV importieren“ doppelt; Zeitraum, Konto, ▷.
- **Versteckbar:** Zeitraum und ▷ bis zum ersten Trade; Konto bei einem Konto.
- **Nicht relevant gezeigt:** Zeitraum und Session ohne Trades; doppelte Knöpfe.

→ Nr. 26

#### Kopfreihe · Handy

- **Hauptaktion:** „Trade loggen“ als runder Knopf (54 px, unten rechts).
- **Optisch klar?** Ja, durch Größe und Lage; gefüllt ist er aber nicht (dunkler Kreis mit grünem Ring, CSS-Überschreibung).
- **Konkurrierende Knöpfe:** ▷ neben dem Zeitraum; runder Knopf auf Seiten ohne Trade-Bezug.
- **Versteckbar:** ▷ (nur TradeLog und Tagesansicht).
- **Nicht relevant gezeigt:** Runder Knopf auf Einstellungen, Coupons, Affiliate, News.

→ Nr. 2

### Dialog „Trade loggen“ und Check-in

#### Trade loggen · leer (neuer Trade)

- **Hauptaktion:** „Trade speichern“; davor sieben Felder: Symbol, Richtung, Einstieg, Ausstieg, Kontrakte, Eröffnet, Geschlossen.
- **Optisch klar?** Ja auf Knopf-Ebene (einziger gefüllter, „Abbrechen“ umrandet, X ghost); als Screen zu voll mit neun Feldern plus Prop-Chips auf einmal.
- **Konkurrierende Knöpfe:** Prop-Konten-Chips direkt über dem Fuß (wirken wie Knöpfe).
- **Versteckbar:** Punktwert, Gebühren, Prop-Konten → „Mehr Optionen“. Stop, Ziel, Setup, Notizen, Screenshots stehen schon in „Plan & Bewertung“.
- **Nicht relevant gezeigt:** Fuß-Hinweis „Long oder Short wählen“, solange das Symbol fehlt; „Risiko —“ ohne Stop; (i) am Punktwert dauerhaft sichtbar.

→ Nr. 20, 78

#### Trade loggen · Long gewählt

- **Hauptaktion:** Einstieg eintragen; Ziel bleibt „Trade speichern“.
- **Optisch klar?** Ja. Einziger gefüllter Knopf; die grüne Long-Hälfte ist deine gewollte Bedeutungsfarbe.
- **Konkurrierende Knöpfe:** Long-Hälfte (gewollt); Prop-Chips.
- **Versteckbar:** Wie leer.
- **Nicht relevant gezeigt:** „Offener Trade · Risiko —“ vor jedem Kurs.

#### Trade loggen · Fehler (Speichern mit Lücken)

- **Hauptaktion:** Das eine fehlende Feld ausfüllen, in Formular-Reihenfolge.
- **Optisch klar?** Nein. Browser-Blase (Einstieg), Fuß-Hinweis (Richtung) und Toasts nennen verschiedene Felder in falscher Reihenfolge.
- **Konkurrierende Knöpfe:** Drei Meldungsarten nebeneinander.
- **Versteckbar:** Alle Meldungen auf eine Prüfung und einen Toast.
- **Nicht relevant gezeigt:** Englische Browser-Blase in fremdem Stil.

→ Nr. 63

#### Trade loggen · Handy (Bottom-Sheet)

- **Hauptaktion:** „Trade speichern“.
- **Optisch klar?** Ja bei 390×844 (sichtbar, einziger gefüllter); bei 667 px Höhe oder mit Browser-Leisten rutscht er unter den Rand, und beide Fußknöpfe sind gleich breit.
- **Konkurrierende Knöpfe:** „Abbrechen“ gleich groß; Prop-Chips über dem Fuß.
- **Versteckbar:** Punktwert, Gebühren, Prop-Konten (~230 px).
- **Nicht relevant gezeigt:** Wie Desktop.

→ Nr. 79

#### Trade loggen · Symbol-Liste offen

- **Hauptaktion:** Ein Symbol wählen (die erste Option hat den Fokus).
- **Optisch klar?** Ja beim Öffnen; am Listenende stehen „OK“ und „Trade speichern“ beide gefüllt.
- **Konkurrierende Knöpfe:** „OK“ (gefüllt) für den seltenen Freitext-Fall.
- **Versteckbar:** — („Anderes Symbol“ bleibt unten).
- **Nicht relevant gezeigt:** —

→ Nr. 34

#### Trade bearbeiten

- **Hauptaktion:** „Speichern“.
- **Optisch klar?** Ja.
- **Konkurrierende Knöpfe:** Keine.
- **Versteckbar:** Wie leer. „Mehr Optionen“ öffnet sich, wenn Werte gesetzt sind.
- **Nicht relevant gezeigt:** Prop-Chips ohne Zuordnung.

#### Check-in · leer

- **Hauptaktion:** „Speichern“ nach Schlaf, Stress, Stimmung.
- **Optisch klar?** Ja. Einziger gefüllter Knopf; „Entfernen“ erscheint nur mit vorhandenem Check-in.
- **Konkurrierende Knöpfe:** Keine (das grüne Schlafgesicht ist Bedeutungsfarbe).
- **Versteckbar:** Notiz → „Notiz hinzufügen“.
- **Nicht relevant gezeigt:** Leeres Notizfeld als volle Zeile.

→ Nr. 80

### Dashboard

#### Dashboard · voll

- **Hauptaktion:** „Trade loggen“.
- **Optisch klar?** Nein, nur getönt; die gefüllten Knöpfe der Bereichs-Widgets (Ruhepunkt „Starten“, Mentor „Einrichten“, Prop „Konto anlegen“, Schatten-Ich „Regelwerk festlegen“) sind die stärksten Flächen, dazu fünf grüne Links.
- **Konkurrierende Knöpfe:** Gefüllte Widget-Knöpfe; Zeitraum, Konto, Filter (gleich große Rahmen); Vorlage/Zertifikat (gerahmt); aktiver Filter in Akzent-Optik; „Mehr anzeigen“ und 4× „Öffnen“ in Grün.
- **Versteckbar:** Konto bei einem Konto; Filter nur als Symbol mit Zähler; Vorlage/Zertifikat ghost; „Heute“ nur in einem anderen Monat; Reiter „Offene Positionen“ nur mit offenen Positionen.
- **Nicht relevant gezeigt:** „Heute“ im aktuellen Monat; Reiter „Offene Positionen“ ohne Positionen; Konto-Menü mit einem Konto.

→ Nr. 3, 25, 31, 74, 75

#### Dashboard · leer

- **Hauptaktion:** „Trade loggen“; CSV und Beispieldaten sind Nebenwege.
- **Optisch klar?** Nein. Fünf gefüllte Knöpfe („Beispieldaten laden“ und vier Widget-Knöpfe) gegen ein getöntes „Trade loggen“.
- **Konkurrierende Knöpfe:** 22 Bedienelemente: „Beispieldaten laden“, Widget-Knöpfe, „CSV“, Zeitraum/Konto/Filter, Vorlage/Zertifikat, Reiter, Kalender-Pfeile, „Heute“.
- **Versteckbar:** Alles außer einem Block mit Satz und Knopf, bis der erste Trade da ist.
- **Nicht relevant gezeigt:** 9× „Noch keine Daten“, 3× „ändere den Zeitraum“, Filter („0 Trades“), Zertifikat, Reiter, Kalender-Navigation.

→ Nr. 19

#### Dashboard · Handy

- **Hauptaktion:** „Trade loggen“ (runder Knopf).
- **Optisch klar?** Nein. Der runde Knopf ist nicht gefüllt, oben stehen vier gleich gerahmte Knöpfe.
- **Konkurrierende Knöpfe:** Zeitraum, Filter, Vorlage, Zertifikat (alle gerahmt).
- **Versteckbar:** Vorlage und Zertifikat ghost.
- **Nicht relevant gezeigt:** Vorlage/Zertifikat dauerhaft in der ersten Reihe; Reiter ohne offene Positionen.

→ Nr. 2, 31

#### Dashboard · bearbeiten

- **Hauptaktion:** „Speichern“.
- **Optisch klar?** Bedingt. Einziger gefüllter Knopf der Leiste, aber die gefüllten Widget-Knöpfe (Ruhepunkt, Mentor) stehen weiter daneben.
- **Konkurrierende Knöpfe:** Gefüllte Knöpfe der Bereichs-Widgets.
- **Versteckbar:** Widget-Inhalte beim Anordnen stilllegen.
- **Nicht relevant gezeigt:** Reiter, Kalender, „Mehr anzeigen“, klickbare Trade-Zeilen beim Anordnen.

→ Nr. 3, 76

#### Panel „Widget hinzufügen“

- **Hauptaktion:** Ein Widget hinzufügen.
- **Optisch klar?** Nein. Über dem Falz stehen vier grüne „Hinzugefügt“ und kein „Hinzufügen“.
- **Konkurrierende Knöpfe:** „Hinzugefügt“ in Akzent auf Akzent; nach Suche bis zu ~15 gefüllte „Hinzufügen“ untereinander.
- **Versteckbar:** „Hinzugefügt“ als stiller Zustand; Hinzugefügte ans Ende.
- **Nicht relevant gezeigt:** Schon hinzugefügte als erste Zeilen; „Bereiche der App“ vor den Auswertungen.

→ Nr. 33

#### Zeitraum-Menü

- **Hauptaktion:** Zeitraum wählen und „Anwenden“.
- **Optisch klar?** Ja. Genau ein gefüllter Knopf, „Zurücksetzen“ ghost.
- **Konkurrierende Knöpfe:** Keine.
- **Versteckbar:** — (die zwei Monatskalender sind deine Vorschau-Entscheidung #35).
- **Nicht relevant gezeigt:** —

#### Konto-Menü (ein Konto)

- **Hauptaktion:** Konto wechseln.
- **Optisch klar?** Ja als Menü, aber es gibt nichts zu wechseln.
- **Konkurrierende Knöpfe:** Keine.
- **Versteckbar:** Der ganze Knopf bei einem Konto.
- **Nicht relevant gezeigt:** Der einzige Eintrag (nicht einmal als gewählt markiert).

→ Nr. 25

#### Filter-Fenster

- **Hauptaktion:** Filter setzen und „Anwenden“.
- **Optisch klar?** Ja. Ein gefüllter Knopf mit Live-Zähler.
- **Konkurrierende Knöpfe:** Keine.
- **Versteckbar:** Offen/Geschlossen, Intraday/Multiday, Reviewed, Bewertung in eine eingeklappte Gruppe.
- **Nicht relevant gezeigt:** Im leeren Journal der ganze Filter.

→ Nr. 32

#### Filter-Fenster · Handy

- **Hauptaktion:** Filter setzen und „Anwenden“.
- **Optisch klar?** Ja. Der Fuß klebt unten.
- **Konkurrierende Knöpfe:** Keine.
- **Versteckbar:** Dieselben vier Zeilen wie am Desktop.
- **Nicht relevant gezeigt:** Deaktiviertes „Zurücksetzen“, solange nichts gesetzt ist.

→ Nr. 32

#### Vorlage-Menü (eine Vorlage)

- **Hauptaktion:** Vorlage wechseln bzw. „Diese Vorlage bearbeiten“.
- **Optisch klar?** Nein. Fünf Elemente für zwei Aktionen, „Bearbeiten“ steht doppelt.
- **Konkurrierende Knöpfe:** „Neue Vorlage erstellen“ gleich gestaltet; Stift je Zeile; ⋯ je Zeile.
- **Versteckbar:** Stift ins ⋯-Menü der Zeile.
- **Nicht relevant gezeigt:** Deaktiviertes „Löschen“ (eine Vorlage) und „Ist Standard“.

→ Nr. 77

#### Zertifikat-Menü (Dashboard)

- **Hauptaktion:** Eine Art wählen. Naheliegend: „Daily Profit“ des letzten Handelstags.
- **Optisch klar?** Ja als Menü, aber „Tag“ bezieht sich immer auf heute.
- **Konkurrierende Knöpfe:** Keine.
- **Versteckbar:** Zertifikat-Knopf ohne Trades.
- **Nicht relevant gezeigt:** Knopf im leeren Journal (jeder Weg endet im Leerhinweis).

→ Nr. 28, 29

#### Dialoge „Neue Vorlage“ und Challenge-Einstellungen

- **Hauptaktion:** „Erstellen und bearbeiten“ bzw. „Speichern“.
- **Optisch klar?** Ja. Genau ein gefüllter Knopf.
- **Konkurrierende Knöpfe:** Keine.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** —

### Zertifikat (aus Dashboard, Statistiken, Tagesansicht)

#### Zertifikat-Menü

- **Hauptaktion:** „Daily Profit“ des letzten Handelstags. Das teilt ein Daytrader am häufigsten.
- **Optisch klar?** Nein. Vier gleiche Zeilen mit doppelter Benennung („Daily Profit · Tag“); „Daily Profit“ führt an handelsfreien Tagen ins Leere.
- **Konkurrierende Knöpfe:** Vier gleiche Einträge; rechte Spalte wiederholt die linke.
- **Versteckbar:** Auslöser, solange es keine Trades gibt.
- **Nicht relevant gezeigt:** Rechte Spalte als Wiederholung; Einträge, deren Zeitraum leer ist.

→ Nr. 28, 29

#### Zertifikat-Dialog · voll

- **Hauptaktion:** „PNG herunterladen“.
- **Optisch klar?** Ja. Einziger gefüllter Knopf.
- **Konkurrierende Knöpfe:** „Kopieren“ und „Teilen“ gleich umrandet (nur mit Share-API).
- **Versteckbar:** Auflösungs-Hinweis aus dem Fuß; die Häkchen bleiben (Datenschutz).
- **Nicht relevant gezeigt:** Auflösungs-Hinweis als Fußzeile.

→ Nr. 73

#### Zertifikat-Dialog · leer (Zeitraum ohne Trades)

- **Hauptaktion:** Zu einem Zeitraum mit Trades wechseln.
- **Optisch klar?** Nein. Stärkste Fläche ist das deaktivierte, halb transparente „PNG herunterladen“; der Weg sind nur kleine ‹ ›.
- **Konkurrierende Knöpfe:** Deaktivierte Export-Knöpfe; Format-Segmente, Häkchen.
- **Versteckbar:** Format, Häkchen, Hinweis und Export, bis der Zeitraum Trades hat.
- **Nicht relevant gezeigt:** Export und Formatwahl ohne Vorschau.

→ Nr. 30

#### Zertifikat-Dialog · Handy

- **Hauptaktion:** Auf Telefonen „Teilen“, sonst „PNG herunterladen“.
- **Optisch klar?** Nein. „PNG herunterladen“ ganz unten; mit Share-API drei Knöpfe, zwei gleich umrandet.
- **Konkurrierende Knöpfe:** „Kopieren“, „Teilen“.
- **Versteckbar:** Auflösungs-Hinweis.
- **Nicht relevant gezeigt:** Hinweiszeile über den Knöpfen.

→ Nr. 73

### Statistiken

#### Übersicht · voll

- **Hauptaktion:** Kennzahlen lesen; die einzige Entscheidung ist der Reiter. „Trade loggen“ ist der einzige Akzent.
- **Optisch klar?** Nein. 14 gleich aussehende Pillen (5 in der Kopfreihe, 9 Reiter) vor dem ersten Inhalt.
- **Konkurrierende Knöpfe:** „Zertifikat ▾“ (beschriftet wie Zeitraum/Konto); ▷; acht nicht aktive Reiter in Knopfform.
- **Versteckbar:** Zertifikat als Symbol; ▷ ohne laufende Session.
- **Nicht relevant gezeigt:** ▷ (Ritual, keine Analyse); Kumulativ-Kurve auf Reitern ohne Bezug.

→ Nr. 1, 9, 28, 41

#### Übersicht · leer

- **Hauptaktion:** „Trade loggen“, oder, wenn Trades außerhalb des Zeitraums liegen, „Gesamt“ zeigen.
- **Optisch klar?** Nein. Die Botschaft steht nach einer leeren 300-px-Kurve und neun leeren Reitern, ohne Knopf.
- **Konkurrierende Knöpfe:** Neun leere Reiter, Zertifikat, ▷, Diagrammkarte.
- **Versteckbar:** Reiter und Kurve bis Daten da sind; Zertifikat ohne abgeschlossene Trades.
- **Nicht relevant gezeigt:** Flache 0-€-Kurve mit Legende; leere Reiter; Zertifikat-Export ohne Daten.

→ Nr. 10, 28

#### Übersicht · Handy

- **Hauptaktion:** Lesen; der Hauptknopf ist der runde „+“.
- **Optisch klar?** Ja. Der runde Knopf ist der einzige Akzent (getönt, nicht gefüllt).
- **Konkurrierende Knöpfe:** „🛡 ▾“ und ▷ als zwei gleiche Symbole; Reiterleiste in Knopfform, bricht bei „Feh…“ ab.
- **Versteckbar:** ▷; Kurve auf fremden Reitern.
- **Nicht relevant gezeigt:** ▷; 300-px-Kurve vor jedem Reiter.

→ Nr. 1, 2, 9

#### Übersicht · Handy leer

- **Hauptaktion:** „Trade loggen“ (runder Knopf) bzw. Zeitraum auf „Gesamt“.
- **Optisch klar?** Ja. Der runde Knopf ist der stärkste; Irrelevantes füllt trotzdem den Schirm.
- **Konkurrierende Knöpfe:** Zertifikat und ▷; leere Reiter.
- **Versteckbar:** Kurve, Reiter, Zertifikat wie am Desktop.
- **Nicht relevant gezeigt:** Leere Kurve; leere Reiter.

→ Nr. 10

#### Zertifikat-Menü (Statistiken)

- **Hauptaktion:** Performance-Zertifikat für den gezeigten Zeitraum.
- **Optisch klar?** Nein. Der passende Eintrag steht als letzter von vier gleichen.
- **Konkurrierende Knöpfe:** Daily/Weekly/Monthly (beziehen sich auf heute).
- **Versteckbar:** Tag/Woche/Monat unter eine Trennlinie.
- **Nicht relevant gezeigt:** Bezug „heute“, während die Seite einen Zeitraum zeigt.

→ Nr. 29

#### Tage

- **Hauptaktion:** Tage vergleichen (lesen); der Sprung in die Tagesansicht ist Zweitaktion.
- **Optisch klar?** Ja. Im Inhalt konkurriert nichts; klickbare Zeilen sind das App-Muster.
- **Konkurrierende Knöpfe:** Keine im Inhalt (Kopfreihe wie Übersicht).
- **Versteckbar:** —
- **Nicht relevant gezeigt:** ▷.

#### Setups

- **Hauptaktion:** Lesen: Erwartungswert je Setup.
- **Optisch klar?** Ja. Keine Knöpfe im Inhalt.
- **Konkurrierende Knöpfe:** Keine.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** Kumulativ-Kurve oben (ohne Bezug).

→ Nr. 41

#### Zeit

- **Hauptaktion:** Lesen: Wochentag, Uhrzeit, Haltedauer.
- **Optisch klar?** Ja. Keine Knöpfe im Inhalt.
- **Konkurrierende Knöpfe:** Keine.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** Kumulativ-Kurve oben.

→ Nr. 41

#### Fehler

- **Hauptaktion:** Lesen: was Fehler gekostet haben.
- **Optisch klar?** Ja. Keine Knöpfe im Inhalt.
- **Konkurrierende Knöpfe:** Keine.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** Kumulativ-Kurve oben.

→ Nr. 41

#### Marktphase

- **Hauptaktion:** Lesen: in welcher Marktphase das Trading funktioniert.
- **Optisch klar?** Ja. Keine Knöpfe im Inhalt.
- **Konkurrierende Knöpfe:** Keine.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** Kumulativ-Kurve oben.

→ Nr. 41

#### Zustand

- **Hauptaktion:** Lesen: Schlaf, Stress, Stimmung gegen Ergebnis.
- **Optisch klar?** Ja. Keine Knöpfe im Inhalt.
- **Konkurrierende Knöpfe:** Keine.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** Kumulativ-Kurve oben (Check-in-Werte unter einer P&L-Kurve).

→ Nr. 41

#### Edge-Check · „Zu wenig Daten“

- **Hauptaktion:** Verstehen, dass Trades fehlen, und weiter loggen.
- **Optisch klar?** Nein. Der Satz „mindestens 20 Trades mit R-Wert“ steht doppelt, eine 280-px-Karte ist leer.
- **Konkurrierende Knöpfe:** Keine Knöpfe; zwei Träger derselben Botschaft.
- **Versteckbar:** Karte „Rollierender Edge“ samt Untertitel bis 20 Trades mit R.
- **Nicht relevant gezeigt:** Leere Karte; Standardabweichung/-fehler aus zu kleiner Stichprobe.

→ Nr. 43

#### Monte Carlo · voll

- **Hauptaktion:** Ergebnis lesen (Ruin- und Gewinnwahrscheinlichkeit).
- **Optisch klar?** Ja. „Neu simulieren“ ist umrandet; es steht aber vor den Zahlen, auf dem Handy wie ein zehnter Reiter.
- **Konkurrierende Knöpfe:** Auf dem Handy die Reiterleiste (gleiche Form).
- **Versteckbar:** „Neu simulieren“ an die Karte „Beispielpfade“ (ghost).
- **Nicht relevant gezeigt:** —

→ Nr. 86

#### Tage, Setups, Zeit, Fehler · leer

- **Hauptaktion:** Wie Übersicht leer.
- **Optisch klar?** Nein. Leerer Satz, kein Knopf.
- **Konkurrierende Knöpfe:** Reiter, Kurve, Zertifikat, ▷.
- **Versteckbar:** Alles außer der Botschaft.
- **Nicht relevant gezeigt:** Kurve mit Nulllinie, leere Reiter. (Nach dem Seiten-Leerzustand nicht mehr erreichbar.)

#### Marktphase · leer

- **Hauptaktion:** Für einen Handelstag im Zeitraum die Marktphase festlegen, in der Tagesansicht dieses Tages.
- **Optisch klar?** Nein. Zwei Wege im Text, kein Knopf.
- **Konkurrierende Knöpfe:** Keine.
- **Versteckbar:** Den zweiten Weg („beim Beenden der Session“) aus dem Satz.
- **Nicht relevant gezeigt:** —

→ Nr. 42

#### Zustand · leer

- **Hauptaktion:** „Session starten“ (Check-in).
- **Optisch klar?** Nein. Der Satz verweist auf ein unbeschriftetes ▷ in der Kopfreihe.
- **Konkurrierende Knöpfe:** Keine.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** —

→ Nr. 42

#### Monte Carlo · leer

- **Hauptaktion:** Weiter Trades loggen, bis 10 abgeschlossen sind.
- **Optisch klar?** Nein. Der Satz erklärt die Methode, nicht wie viele fehlen.
- **Konkurrierende Knöpfe:** Keine.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** —

→ Nr. 42

### Fortschritt

#### Fortschritt · voll

- **Hauptaktion:** Den Tag abhaken: den nächsten offenen Schritt der Checkliste erledigen (Check-in, Session, Trade, Regeln, Tagesnotiz).
- **Optisch klar?** Nein. Die Checkliste, der einzige bedienbare Teil, beginnt unter der Falz (y≈840).
- **Konkurrierende Knöpfe:** „Trade loggen“; ▷ (doppelt zum Checklisten-Eintrag); „Tag ansehen“ und „Regeln bearbeiten“ (umrandet); Heatmap-Pfeile; Zeitraum/Konto.
- **Versteckbar:** ▷ ohne laufende Session; „Automatische Regeln“ ohne Trades heute.
- **Nicht relevant gezeigt:** Gestrichelter Kasten „Noch keine Trades heute“; „Keine Daten“ statt „0 von 5“.

→ Nr. 1, 11, 46, 92

#### Fortschritt · leer

- **Hauptaktion:** Den Tag abhaken; der erste offene Schritt ist meist der erste Trade.
- **Optisch klar?** Nein. Unter „Trade loggen“ stehen acht leere Karten mit weiteren Knöpfen; „Keine Regeln“ dreimal.
- **Konkurrierende Knöpfe:** „Regeln anlegen“ und „Regeln bearbeiten“ (gleich, gleiches Ziel); „Tag ansehen“; Heatmap-Pfeile; ▷.
- **Versteckbar:** „Regeln bearbeiten“ ohne Regeln; Heatmap-Pfeile ohne aktiven Tag.
- **Nicht relevant gezeigt:** „0 %“ mit leerem Ring ohne Regeln; leere Disziplin-Karte; Tilt-Profil ohne Trade; doppelter Regel-Hinweis; „Automatische Regeln“.

→ Nr. 46, 47, 48

#### Fortschritt · Handy

- **Hauptaktion:** Wie Desktop; sichtbar primär ist der runde Knopf.
- **Optisch klar?** Nein. Die Checkliste kommt erst nach ~1,35 Bildschirmen.
- **Konkurrierende Knöpfe:** ▷, Heatmap-Pfeile, umrandete Kartenkopf-Knöpfe.
- **Versteckbar:** ▷.
- **Nicht relevant gezeigt:** Im leeren Zustand dieselben leeren Karten.

→ Nr. 1, 11

### TradeLog

#### Reiter Trades · voll

- **Hauptaktion:** „Trade loggen“; im Inhalt eine Zeile öffnen.
- **Optisch klar?** Ja, knapp. Einziger Akzent; darunter ~20 gleich gewichtete Elemente.
- **Konkurrierende Knöpfe:** „CSV importieren“ (voller Rahmenknopf daneben); Zeitraum/Konto; Suchfeld + 4 Selects; Seitenwähler.
- **Versteckbar:** Selects hinter „Filter“ mit Zähler; CSV als Symbol; Seitenwähler ab zwei Seiten.
- **Nicht relevant gezeigt:** „1 von 1 Seite“ mit deaktivierten Pfeilen; „10 von 10 Trades“ doppelt.

→ Nr. 37, 64, 82

#### Reiter Trades · leer

- **Hauptaktion:** Ersten Trade loggen (Nebenweg CSV).
- **Optisch klar?** Nein. In der Leer-Karte stimmt die Stufung, aber beide Aktionen stehen doppelt, dazu Filter, Kacheln, Reiter ohne Funktion.
- **Konkurrierende Knöpfe:** Zweites „CSV importieren“ und „Trade loggen“ oben; Suchfeld + 4 Selects; Reiter.
- **Versteckbar:** Filterzeile, Kacheln, Kopfreihen-CSV bis zum ersten Trade.
- **Nicht relevant gezeigt:** Filter bei 0 Trades, „0 von 0“, 4× „Noch keine Daten“; „Keine Trades im Zeitraum“, obwohl es gar keine gibt; 34-px-Symbole in den Knöpfen.

→ Nr. 4, 6, 36

#### Reiter Trades · Suche/Filter

- **Hauptaktion:** Mit Treffern eine Zeile öffnen; ohne Treffer Filter zurücksetzen.
- **Optisch klar?** Nein, ohne Treffer: Die Leer-Karte hat keinen Knopf, „Zurücksetzen“ steht klein in der Filterzeile.
- **Konkurrierende Knöpfe:** Suchfeld + 4 Selects; Kopfreihe.
- **Versteckbar:** Selects im Filter-Popover.
- **Nicht relevant gezeigt:** Mit Treffern der Seitenwähler („1 von 1 Seite“) doppelt zu „5 von 10“.

→ Nr. 36

#### Reiter Tage · voll

- **Hauptaktion:** Einen Handelstag öffnen.
- **Optisch klar?** Ja. Je Karte genau ein ghost-Link „Tagesansicht ›“.
- **Konkurrierende Knöpfe:** Im Inhalt keine; oben CSV neben „Trade loggen“.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** —

#### Reiter Tage · leer

- **Hauptaktion:** Ersten Trade loggen bzw. Zeitraum ändern.
- **Optisch klar?** Nein. Ein Satz ohne Knopf.
- **Konkurrierende Knöpfe:** Kopfreihe (CSV, „Trade loggen“).
- **Versteckbar:** Kacheln.
- **Nicht relevant gezeigt:** 4× „Noch keine Daten“.

→ Nr. 36

#### Reiter Verpasste Trades · voll

- **Hauptaktion:** Verpassten Trade notieren.
- **Optisch klar?** Nein. Kleiner Knopf neben den Reitern; „CSV“ und „Trade loggen“ oben sind größer.
- **Konkurrierende Knöpfe:** „Trade loggen“, „CSV importieren“, Zeitraum/Konto.
- **Versteckbar:** CSV in diesem Reiter.
- **Nicht relevant gezeigt:** Kopfreihen-CSV; Kacheln und Zeitraum ohne Bezug (die Liste ist nicht nach Zeitraum gefiltert).

→ Nr. 37, 38

#### Reiter Verpasste Trades · leer

- **Hauptaktion:** Ersten verpassten Trade notieren.
- **Optisch klar?** Nein. Leer-Karte mit zwei Sätzen, der Knopf klein oben rechts.
- **Konkurrierende Knöpfe:** „Trade loggen“, „CSV“.
- **Versteckbar:** Kacheln, Kopfreihen-CSV.
- **Nicht relevant gezeigt:** Kacheln; zweiter Erklärsatz.

→ Nr. 38

#### TradeLog · Handy voll

- **Hauptaktion:** „Trade loggen“ (runder Knopf).
- **Optisch klar?** Ja.
- **Konkurrierende Knöpfe:** Suchfeld + 4 Selects in drei Zeilen; Seitenwähler in zwei Zeilen.
- **Versteckbar:** Selects ins Popover; Seitenwähler bei einer Seite; CSV als Symbol (heute auf dem Handy nicht erreichbar).
- **Nicht relevant gezeigt:** „1 von 1 Seite“.

→ Nr. 2, 37, 64, 82

#### TradeLog · Handy leer

- **Hauptaktion:** Ersten Trade loggen.
- **Optisch klar?** Ja. Die Leer-Karte ist richtig gestuft.
- **Konkurrierende Knöpfe:** Runder Knopf neben dem gefüllten „Trade loggen“ der Karte; Filterzeile.
- **Versteckbar:** Filter und Kacheln.
- **Nicht relevant gezeigt:** Suchfeld + 4 Selects, Kacheln (197 px), „0 von 0“.

→ Nr. 4

#### Trade-Detail · voll

- **Hauptaktion:** „Plan & Bewertung“ ausfüllen (Plan, Setup, Bewertung, Tags, Notiz); „Bearbeiten“ ändert nur Ausführungsdaten.
- **Optisch klar?** Nein. Im ersten Bild kein Hauptknopf; das gefüllte „Bearbeiten“ liegt unter der Falz, „30 Sekunden aufnehmen“ ist ebenfalls gefüllt, „Bearbeiten“ steht dreimal mit zwei Bedeutungen.
- **Konkurrierende Knöpfe:** „30 Sekunden aufnehmen“ (gefüllt); „Trade loggen“; „Löschen“ gleich groß neben „Bearbeiten“; 2× ghost-„Bearbeiten“.
- **Versteckbar:** Zeitraum und Konto (wirken hier nicht).
- **Nicht relevant gezeigt:** Zeitraum, Konto, ▷; leere Sprachnotiz-Fläche mit gefülltem Aufnahmeknopf.

→ Nr. 5, 39

#### Trade-Detail · Handy

- **Hauptaktion:** Wie Desktop: „Plan & Bewertung“.
- **Optisch klar?** Nein. „Bearbeiten“ erst nach ~3 Bildschirmen; der runde Knopf liegt über den Kennzahlen.
- **Konkurrierende Knöpfe:** Runder „+“; „30 Sekunden aufnehmen“ (gefüllt); „Löschen“.
- **Versteckbar:** Runder Knopf auf der Detailseite; Zeitraum.
- **Nicht relevant gezeigt:** Zeitraum, ▷, runder Knopf.

→ Nr. 5, 40

#### CSV-Import · Schritt 1

- **Hauptaktion:** CSV-Datei ablegen oder auswählen.
- **Optisch klar?** Nein. Das Ablage-Symbol ist 984 px groß (fehlende Größenregel) und füllt den Dialog.
- **Konkurrierende Knöpfe:** Keine (im Fuß nur „Abbrechen“).
- **Versteckbar:** — („Oder Text einfügen“ ist schon eingeklappt).
- **Nicht relevant gezeigt:** —

→ Nr. 6

#### CSV-Import · Schritt 2 (Spalten zuordnen)

- **Hauptaktion:** „Importieren“.
- **Optisch klar?** Ja. Drei Stufen im Fuß korrekt.
- **Konkurrierende Knöpfe:** Drei Einstell-Selects oben (Dezimal, Datum, Konto).
- **Versteckbar:** Dezimal hinter „Mehr Optionen“; Konto bei einem Konto; Datum nur, wenn eindeutig.
- **Nicht relevant gezeigt:** Konto-Select bei einem Konto; Spaltenkopf-Zeile auf dem Handy. (Dass das Datum nicht erkannt wird, ist ein eigener Fehler.)

→ Nr. 83

#### Dialog „Verpassten Trade notieren“

- **Hauptaktion:** „Speichern“.
- **Optisch klar?** Ja.
- **Konkurrierende Knöpfe:** Keine.
- **Versteckbar:** R-Multiple (ggf. Setup) hinter „Mehr Optionen“.
- **Nicht relevant gezeigt:** —

→ Nr. 80

#### Bestätigung „Trade löschen“

- **Hauptaktion:** Löschen bestätigen.
- **Optisch klar?** Nein. „Abbrechen“ und „Löschen“ gleich groß und umrandet, nur die Farbe unterscheidet.
- **Konkurrierende Knöpfe:** „Abbrechen“.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** —

→ Nr. 81

#### Dialog „Text-Notiz“

- **Hauptaktion:** „Speichern“.
- **Optisch klar?** Ja.
- **Konkurrierende Knöpfe:** Keine.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** Titelhälfte „sprechen“.

→ Nr. 84

### Tagesansicht

#### Tag mit Trades

- **Hauptaktion:** „Trade loggen“ (Akzent, Tag vorbelegt); auf vergangenen Tagen trägt die Reihenfolge Trades → Regeln → Tagesnotiz die Nachbereitung.
- **Optisch klar?** Nein. Zwei grüne „+“ mit gleicher Funktion übereinander; „Zertifikat“ und „Check-in bearbeiten“ gleich groß daneben.
- **Konkurrierende Knöpfe:** „Trade loggen“ (Kopfreihe) und „Trade für diesen Tag“; Zertifikat; „Check-in bearbeiten“ (zusätzlich in der Karte); ▷.
- **Versteckbar:** Zertifikat als Symbol; Check-in nur in der Karte; Zeitraum (wirkt hier nicht).
- **Nicht relevant gezeigt:** Zeitraum-Menü; zweiter Trade-Knopf ohne Tagesvorbelegung.

→ Nr. 7, 28, 39

#### Heute ohne Trades

- **Hauptaktion:** „Trade loggen“ (Akzent, aktuelle Uhrzeit); vor dem Handel ist Check-in/Session der erste Schritt.
- **Optisch klar?** Nein. „Tagesnotiz anlegen“ ist der einzige gefüllte und damit stärkste Knopf; dazu zwei Trade-Knöpfe.
- **Konkurrierende Knöpfe:** „Tagesnotiz anlegen“ (gefüllt); zwei Trade-Knöpfe; Zertifikat; Check-in doppelt.
- **Versteckbar:** Kennzahlen-Karte ohne Trades; Regeln und Marktphase bis zum ersten Trade; Zertifikat.
- **Nicht relevant gezeigt:** Kennzahlen mit acht Platzhaltern; Zertifikat ohne Trade; „0 von 5 eingehalten“; Marktphase-Formular; Zeitraum.

→ Nr. 6, 7, 8, 21

#### Vergangener Tag ohne Trades

- **Hauptaktion:** Weiterblättern. An handelsfreien Tagen ist nichts zu tun; nachtragen per „Trade loggen“ ist die Ausnahme, die Tagesnotiz sekundär.
- **Optisch klar?** Nein. Stärkster Knopf ist „Tagesnotiz anlegen“ (gefüllt); sechs Karten für einen Tag ohne Handel.
- **Konkurrierende Knöpfe:** „Tagesnotiz anlegen“; zwei Trade-Knöpfe; Zertifikat, Check-in; Marktphase (sechs Segmente).
- **Versteckbar:** Kennzahlen, Regeln, Marktphase, Check-in ohne Daten hinter „Mehr anzeigen“.
- **Nicht relevant gezeigt:** Kennzahlen; Zertifikat; Regel-Checkliste; Marktphase; ▷ für einen vergangenen Tag.

→ Nr. 8, 21

#### Handy · Tag mit Trades

- **Hauptaktion:** „Trade loggen“ (runder Knopf, Tag vorbelegt).
- **Optisch klar?** Nein. Der runde Knopf und „+ Trade für diesen Tag“ sehen gleich aus; vier Steuerzeilen vor dem Inhalt.
- **Konkurrierende Knöpfe:** Zweites grünes „+“; Zertifikat/Check-in als eigene Zeile; „Bearbeiten“ in der Check-in-Karte; ▷.
- **Versteckbar:** Zeitraum; Zertifikat als Symbol; Check-in nur in der Karte.
- **Nicht relevant gezeigt:** Zeitraum; ▷ für einen vergangenen Tag; zweites „+“.

→ Nr. 2, 7

#### Handy · heute ohne Trades

- **Hauptaktion:** Wie heute am Desktop: Check-in/Session zuerst, danach „Trade loggen“ (Akzent).
- **Optisch klar?** Nein. Fünf Steuerzeilen vor dem Inhalt, dann leere Kennzahlen.
- **Konkurrierende Knöpfe:** Zwei „+“; Zeile Zertifikat/Check-in; „Tagesnotiz anlegen“ (gefüllt).
- **Versteckbar:** Kennzahlen; Zeitraum; Zertifikat; Regeln und Marktphase.
- **Nicht relevant gezeigt:** Kennzahlen mit Nullen; Zertifikat; Zeitraum.

→ Nr. 8, 21

#### Ungültiges Datum

- **Hauptaktion:** Zurück zum heutigen Tag.
- **Optisch klar?** Nein. Es gibt keinen Knopf.
- **Konkurrierende Knöpfe:** Die Kopfreihe bietet alles außer der sinnvollen Aktion.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** „Trade loggen“, ▷, Zeitraum, Konto für ein Datum, das es nicht gibt.

→ Nr. 85

### Notebook

#### Notebook · voll

- **Hauptaktion:** „Neue Notiz“ (bzw. in der offenen Notiz weiterschreiben).
- **Optisch klar?** Ja. Einziger gefüllter Knopf (Desktop und Handy).
- **Konkurrierende Knöpfe:** „Trade loggen“ (Akzent); „Ordner hinzufügen“ spiegelt Form und Lage von „Neue Notiz“; Werkzeugleiste bricht um; „Teilen“ mit Text.
- **Versteckbar:** „Ordner hinzufügen“ als „+“ im Abschnittskopf; „Teilen“ ins …-Menü; seltene Formate hinter „Weitere Formate“.
- **Nicht relevant gezeigt:** Tag-Feld im Filter ohne Tags.

→ Nr. 65, 87

#### Notiz offen

- **Hauptaktion:** In die Notiz schreiben.
- **Optisch klar?** Nein. ~22 Elemente auf ~300 px vor dem Text.
- **Konkurrierende Knöpfe:** Werkzeugleiste (Größen-Stepper ist das breiteste Element); „Teilen“; Datumsknopf.
- **Versteckbar:** „Teilen“ ins Menü (bis 560 px heute gar nicht erreichbar); Ordnerliste im Menü als zweiter Schritt.
- **Nicht relevant gezeigt:** — (Trade- und Tagesstatistik sind eingeklappt, das ist vorbildlich).

→ Nr. 44

#### Neue Notiz

- **Hauptaktion:** Losschreiben.
- **Optisch klar?** Ja. Fokus im Editor, Platzhalter „Schreib los …“.
- **Konkurrierende Knöpfe:** Werkzeugleiste; „Teilen“ bei leerem Inhalt.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** Teilen, Export, PDF bei leerem Inhalt (nach „Teilen ins Menü“ unsichtbar).

#### Notebook · leer

- **Hauptaktion:** Erste eigene Notiz („Neue Notiz“).
- **Optisch klar?** Nein. Bei einer Notiz stehen Suche, Filter, Auswählen, Sortieren und leere Abschnitte; in jedem leeren Ordner ein zweiter gefüllter „Neue Notiz“.
- **Konkurrierende Knöpfe:** Zweites gefülltes „Neue Notiz“; „Ordner hinzufügen“; Filter, Auswählen, Sortieren.
- **Versteckbar:** Auswählen, Sortieren, Filter ab zwei Notizen; „Tags“ erst mit einem Tag; „Kürzlich gelöscht“ nur mit Inhalt.
- **Nicht relevant gezeigt:** „Noch keine Tags“, „Noch keine eigenen Ordner“, leerer Papierkorb-Link.

→ Nr. 8, 45

#### Notebook · Handy Liste

- **Hauptaktion:** „Neue Notiz“ (oder eine Notiz öffnen).
- **Optisch klar?** Ja. „+ Neue Notiz“ gefüllt in voller Breite; der runde Knopf ist ein zweites grünes „+“ mit anderer Bedeutung.
- **Konkurrierende Knöpfe:** Runder „+“ („Trade loggen“); Auswählen/Sortieren; ▷, Filter.
- **Versteckbar:** Runder Knopf im ganzen Notebook; Auswählen/Sortieren ab zwei Notizen.
- **Nicht relevant gezeigt:** Zweites „+“; ▷.

→ Nr. 40

#### Notebook · Handy Notiz

- **Hauptaktion:** Schreiben.
- **Optisch klar?** Nein. Kopfreihe (Suche, Filter, ▷) über der Notiz; B, I, U erst nach Wischen.
- **Konkurrierende Knöpfe:** Kopfreihe; deaktiviertes Rückgängig/Wiederholen und Größe stehen vorn.
- **Versteckbar:** Suchzeile beim Schreiben; Format-Reihenfolge.
- **Nicht relevant gezeigt:** Suche/Filter beim Schreiben.

→ Nr. 65, 88

#### Notebook · Handy Ordneransicht

- **Hauptaktion:** Einen Ordner wählen.
- **Optisch klar?** Nein. Der einzige Knopf ganz oben ist „Ordner hinzufügen“ in voller Breite.
- **Konkurrierende Knöpfe:** „Ordner hinzufügen“; runder Knopf.
- **Versteckbar:** „Ordner hinzufügen“ als „+“; runder Knopf.
- **Nicht relevant gezeigt:** Volle Breite für eine seltene Aktion.

→ Nr. 87

#### Papierkorb

- **Hauptaktion:** Eine gelöschte Notiz wiederherstellen.
- **Optisch klar?** Nein, beim Betreten ist das rote „Leeren“ der einzige Knopf; „Wiederherstellen“ erscheint erst nach Auswahl.
- **Konkurrierende Knöpfe:** „Leeren“ und „Endgültig löschen“ (rot umrandet).
- **Versteckbar:** Beide eine Stufe leiser (ghost-rot).
- **Nicht relevant gezeigt:** Sortieren bei leerem Papierkorb.

→ Nr. 89

#### Auswahlmodus

- **Hauptaktion:** Notizen markieren, dann verschieben oder löschen.
- **Optisch klar?** Nein. „Fertig“ (umrandet) wirkt wichtiger als Verschieben und Löschen (ghost).
- **Konkurrierende Knöpfe:** „Neue Notiz“ (gefüllt) über der Auswahlzeile; „Fertig“.
- **Versteckbar:** „Neue Notiz“, Sortieren, Umschalter im Modus.
- **Nicht relevant gezeigt:** „Neue Notiz“ und Sortieren im Modus; der grün markierte Umschalter.

→ Nr. 89

#### …-Menü der Notiz

- **Hauptaktion:** Einen Eintrag wählen (meist Verschieben oder Löschen).
- **Optisch klar?** Ja. „Löschen“ ist abgesetzt.
- **Konkurrierende Knöpfe:** Fünf Ordnerzeilen vor den Aktionen; „Teilen“ fehlt.
- **Versteckbar:** Ordnerliste als zweiter Schritt.
- **Nicht relevant gezeigt:** —

#### …-Menü je Ordner

- **Hauptaktion:** Ordner bearbeiten.
- **Optisch klar?** Ja.
- **Konkurrierende Knöpfe:** „Umbenennen“ und „Farbe ändern“ öffnen denselben Dialog.
- **Versteckbar:** Beide → „Bearbeiten“.
- **Nicht relevant gezeigt:** —

→ Nr. 90

#### Ordner-Dialog

- **Hauptaktion:** „Speichern“.
- **Optisch klar?** Ja.
- **Konkurrierende Knöpfe:** Keine.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** Schreibgeschütztes Namensfeld bei „Farbe ändern“ (entfällt mit „Bearbeiten“).

→ Nr. 90

#### Vorlage-Dialoge

- **Hauptaktion:** „Speichern“.
- **Optisch klar?** Ja. Vorbild: „Löschen“ ghost links, „Abbrechen“ umrandet, „Speichern“ gefüllt.
- **Konkurrierende Knöpfe:** Keine.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** —

#### Dialog „Notiz teilen“

- **Hauptaktion:** Link kopieren.
- **Optisch klar?** Nein. „Öffnen“ ist gefüllt, „Link kopieren“ nur umrandet.
- **Konkurrierende Knöpfe:** „Öffnen“.
- **Versteckbar:** „Öffnen“ sekundär.
- **Nicht relevant gezeigt:** —

→ Nr. 34

#### Filter und Sortieren

- **Hauptaktion:** Filter anwenden bzw. Sortierung wählen.
- **Optisch klar?** Ja.
- **Konkurrierende Knöpfe:** Keine.
- **Versteckbar:** Tag-Feld nur mit Tags (das Ordner-Feld bleibt: einziger Weg, in einem Ordner zu suchen).
- **Nicht relevant gezeigt:** Tag-Feld ohne Tags.

#### „+ Tag“

- **Hauptaktion:** Tag zuweisen (leer: den ersten anlegen).
- **Optisch klar?** Ja. Leer ist es ein Vorbild: ein Satz, ein Eintrag.
- **Konkurrierende Knöpfe:** Keine.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** —

#### Editor-Menüs („+“, „Text ▾“, Bild, Farben)

- **Hauptaktion:** Baustein einfügen bzw. Block umwandeln.
- **Optisch klar?** Ja.
- **Konkurrierende Knöpfe:** Zehn Blocktypen stehen in „+“ und „Text ▾“ und per „/“.
- **Versteckbar:** — (Aufteilung nach TradePath ist deine Vorgabe).
- **Nicht relevant gezeigt:** Dubletten im „+“-Menü.

#### Geteilte Notiz

- **Hauptaktion:** Lesen.
- **Optisch klar?** Ja. Ein Knopf „Zum eigenen Notebook“.
- **Konkurrierende Knöpfe:** Keine.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** —

### News

#### News · ohne Server (Beispielansicht)

- **Hauptaktion:** „Server einrichten“.
- **Optisch klar?** Nein. Der eine hilfreiche Knopf ist der leiseste; Hero-Karte und rote/gelbe Chips ziehen mehr Blick als „Trade loggen“ und „Server einrichten“.
- **Konkurrierende Knöpfe:** Hero mit Countdown für einen Beispieltermin; 8 Filter-Chips; „Trade loggen“.
- **Versteckbar:** Hero und Filter in der Beispielansicht; Hinweis auf einen Satz.
- **Nicht relevant gezeigt:** Countdown „morgen“ für ein Beispiel; Filter auf Beispieldaten.

→ Nr. 66

#### News · Handy

- **Hauptaktion:** „Server einrichten“ (mit Server: die nächste wichtige News).
- **Optisch klar?** Nein. ▷ allein in der ersten Zeile, Hero und zwei Chip-Reihen vor der Liste.
- **Konkurrierende Knöpfe:** Runder Knopf (umrandet), ▷, Hero, 8 Chips.
- **Versteckbar:** Hero und Filter in der Beispielansicht; Währungen als zweiter Schritt; ▷ nicht allein.
- **Nicht relevant gezeigt:** Eigene Zeile nur für ▷; Countdown für Beispiele.

→ Nr. 1, 66, 112

#### News · mit Server

- **Hauptaktion:** Die nächste wichtige News sehen (Hero).
- **Optisch klar?** Ja. Hero zuerst, Filter als Chips, „Aktualisieren“ ghost.
- **Konkurrierende Knöpfe:** „Trade loggen“ oben rechts.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** —

#### News · Fehler / keine Treffer

- **Hauptaktion:** Fehler: Ursache beheben; keine Treffer: Filter zurücksetzen.
- **Optisch klar?** Ja. Ein Satz, ein Knopf; aber der Knopf passt nicht immer.
- **Konkurrierende Knöpfe:** Keine.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** Bei 401/„nicht erreichbar“ nur „Erneut versuchen“; „Keine Termine“ ohne Zurücksetzen.

→ Nr. 91

### Schatten-Ich

#### Schatten-Ich · voll

- **Hauptaktion:** Den teuersten Regelbruch erkennen und den Trade öffnen.
- **Optisch klar?** Nein. Verstöße und Ranking beginnen bei y≈1190, nach dem ganzen Regelwerk.
- **Konkurrierende Knöpfe:** Sieben Regel-Schalter mit Zahlenfeldern; Setup-Chips; Zeitraum/Konto; Seitenwahl.
- **Versteckbar:** Regelwerk eingeklappt, sobald eine Regel aktiv ist (Reihenfolge bleibt).
- **Nicht relevant gezeigt:** Setup-Warnung doppelt.

→ Nr. 22, 93

#### Schatten-Ich · Trades, keine Regel aktiv

- **Hauptaktion:** Regeln einschalten, am schnellsten über „Vorschlag übernehmen“.
- **Optisch klar?** Nein. „Vorschlag übernehmen“ ist ein kleiner Knopf am Ende der Liste.
- **Konkurrierende Knöpfe:** Sieben Schalter.
- **Versteckbar:** — (das Banner steht bewusst unter den Schaltern).
- **Nicht relevant gezeigt:** Vier Kacheln „—“; zwei deckungsgleiche Linien.

#### Schatten-Ich · leer

- **Hauptaktion:** Ersten Trade loggen.
- **Optisch klar?** Nein. „Trade loggen“ und „Vorschlag übernehmen“ sehen gleich aus; dazu sieben Schalter.
- **Konkurrierende Knöpfe:** „Vorschlag übernehmen“; sieben Schalter; Zeitraum/Konto.
- **Versteckbar:** Regelwerk eingeklappt hinter „Regeln einzeln wählen“.
- **Nicht relevant gezeigt:** Zeitraum (das Konto bleibt, wenn andere Konten Trades haben).

→ Nr. 22, 26, 49

#### Schatten-Ich · Handy

- **Hauptaktion:** Wie voll.
- **Optisch klar?** Nein. „Regelverstöße“ erst bei ≈1810 px; die Spalte „Kosten“ liegt außerhalb.
- **Konkurrierende Knöpfe:** Sieben Schalter; Zeitraum.
- **Versteckbar:** Regelwerk eingeklappt; Spalten „Echt“/„Schatten“ unter 560 px.
- **Nicht relevant gezeigt:** „Echt“ und „Schatten“ verdrängen „Kosten“.

→ Nr. 22, 50

### Blind-Replay

Per Feature-Flag versteckt, trotzdem geprüft.

#### Übersicht · voll

- **Hauptaktion:** Eine neue Runde starten („Session starten“ in der Hero-Karte).
- **Optisch klar?** Ja, aber verwässert. Oben steht ein ▷ mit gleichem Symbol und Namen für etwas anderes, dazu „Trade loggen“.
- **Konkurrierende Knöpfe:** ▷ (Trading-Session); „Trade loggen“. Das Konto ist Kontext, kein Konkurrent.
- **Versteckbar:** ▷ und „Trade loggen“ auf dieser Seite.
- **Nicht relevant gezeigt:** „Letzte 20“ = Gesamtquote bei höchstens 20 Karten; Trading-Session beim Üben.

→ Nr. 1, 94, 96

#### Übersicht · Handy

- **Hauptaktion:** Eine neue Runde starten (Knopf in voller Breite).
- **Optisch klar?** Ja.
- **Konkurrierende Knöpfe:** ▷ neben dem Konto; runder Knopf über „Treffer je Gefühl“.
- **Versteckbar:** ▷, runder Knopf.
- **Nicht relevant gezeigt:** „Letzte 20“ doppelt.

→ Nr. 1

#### Startkarte · leer

- **Hauptaktion:** Den ersten übbaren Trade schaffen: „Trade loggen“ bzw. „Screenshot vor Entry hinzufügen“.
- **Optisch klar?** Nein. Stärkstes Element ist ein deaktivierter, halb transparenter grüner Knopf; der Weg steht als graue Zeile ohne Link.
- **Konkurrierende Knöpfe:** Toter „Session starten“; „Trade loggen“ oben; ▷; drei Schritte mit grünen Nummern.
- **Versteckbar:** Toter Knopf, bis ein Trade bereit ist.
- **Nicht relevant gezeigt:** Deaktivierter Hauptknopf; Trading-Session.

→ Nr. 1, 12, 95

#### Startkarte · Handy leer

- **Hauptaktion:** Wie Desktop.
- **Optisch klar?** Nein. Der deaktivierte Knopf in voller Breite ist das größte Element.
- **Konkurrierende Knöpfe:** Toter Knopf; runder „+“; ▷; drei Schritte (92 px).
- **Versteckbar:** Toter Knopf; runder Knopf, ▷.
- **Nicht relevant gezeigt:** Deaktivierter Hauptknopf.

→ Nr. 12, 95

#### Startkarte · Trades bereit, noch keine Runde

- **Hauptaktion:** Erste Runde starten.
- **Optisch klar?** Ja. Aktiv, gefüllt, „35 Trades bereit“.
- **Konkurrierende Knöpfe:** ▷, „Trade loggen“; drei Schritte.
- **Versteckbar:** ▷ und „Trade loggen“.
- **Nicht relevant gezeigt:** Trading-Session.

→ Nr. 1, 95

#### Karte · Entscheidung

- **Hauptaktion:** Entscheiden: „Nehmen“ oder „Skippen“.
- **Optisch klar?** Ja nach den Regeln. „Nehmen“ gefüllt, „Skippen“ umrandet; bei einer Blind-Entscheidung ist das aber eine Voreinstellung.
- **Konkurrierende Knöpfe:** Kopfreihe (Konto, ▷, „Trade loggen“); ein Kontowechsel beendet die Runde scheinbar.
- **Versteckbar:** Die ganze Kopfreihe während der Runde.
- **Nicht relevant gezeigt:** „Trade loggen“ und Session beim Üben.

→ Nr. 51

#### Karte · Handy

- **Hauptaktion:** Wie Desktop.
- **Optisch klar?** Ja.
- **Konkurrierende Knöpfe:** Konto/▷-Zeile (~65 px); runder Knopf; zweizeiliger Kartenkopf.
- **Versteckbar:** Kopfreihe und runder Knopf während der Runde.
- **Nicht relevant gezeigt:** „Trade loggen“, Session, Konto während der Runde.

→ Nr. 51

#### Auflösung

- **Hauptaktion:** „Nächster Trade“ (bei der letzten Karte „Auswertung“).
- **Optisch klar?** Ja. Einziger gefüllter Knopf.
- **Konkurrierende Knöpfe:** Kopfreihe bzw. runder Knopf.
- **Versteckbar:** „Setup anzeigen“ nach der Entscheidung; Kopfreihe.
- **Nicht relevant gezeigt:** „Setup anzeigen“, obwohl das Setup schon in der Ergebniszeile steht.

→ Nr. 51, 96

#### Auswertung

- **Hauptaktion:** Neue Runde starten.
- **Optisch klar?** Ja. Musterbeispiel (gefüllt plus umrandet).
- **Konkurrierende Knöpfe:** Kopfreihe (▷ mit demselben Symbol wie „Neue Session“).
- **Versteckbar:** Kopfreihe bis „Zur Übersicht“.
- **Nicht relevant gezeigt:** Session, „Trade loggen“, Konto im Abschluss.

→ Nr. 51, 94

### Mentor

#### Mentor · nicht eingerichtet

- **Hauptaktion:** „Zu den Einstellungen“.
- **Optisch klar?** Ja. Einziger gefüllter Knopf.
- **Konkurrierende Knöpfe:** Konto-Wahl in der Kopfreihe.
- **Versteckbar:** Konto und Hinweis bis zur Einrichtung.
- **Nicht relevant gezeigt:** „Der Mentor sieht die letzten 20 Trades …“ ohne Mentor.

→ Nr. 97

#### Mentor · Chat

- **Hauptaktion:** Schreiben und senden.
- **Optisch klar?** Ja. Senden ist der einzige gefüllte Knopf.
- **Konkurrierende Knöpfe:** „Verlauf löschen“ (mit Text), „Verlauf neu laden“ (Uhr-Symbol), Konto.
- **Versteckbar:** Beide Verlaufswerkzeuge in ein …-Menü.
- **Nicht relevant gezeigt:** Deaktiviertes „Verlauf löschen“ ohne Nachrichten.

→ Nr. 52

#### Mentor · Chat Handy

- **Hauptaktion:** Schreiben und senden.
- **Optisch klar?** Ja.
- **Konkurrierende Knöpfe:** „Verlauf löschen“ in eigener Zeile; Uhr-Symbol.
- **Versteckbar:** …-Menü.
- **Nicht relevant gezeigt:** —

→ Nr. 52

### Ruhepunkt

#### Ruhepunkt · Start

- **Hauptaktion:** Die passende Session wählen (Vor, Nach, Akut). Die Wahl selbst ist die eine Aktion.
- **Optisch klar?** Ja. Bewusste Dreierwahl; gleich große Karten sind hier richtig.
- **Konkurrierende Knöpfe:** „×“ in jeder Verlaufszeile (bis zu acht).
- **Versteckbar:** „×“ erst bei Hover/Fokus (Touch: immer).
- **Nicht relevant gezeigt:** —

→ Nr. 100

#### Ruhepunkt · Atem- und Countdown-Schritte

- **Hauptaktion:** Die Übung starten, erst danach weiter.
- **Optisch klar?** Nein. Übungsknopf und „Weiter“ bzw. „Speichern und schließen“ sind beide in der Phasenfarbe gefüllt.
- **Konkurrierende Knöpfe:** „Weiter“/„Speichern und schließen“; „← Übersicht“ und „Abbrechen“ in Schritt 1; Tempo-Chips unter „Starten“.
- **Versteckbar:** Tempo-Zeile während der Atmung.
- **Nicht relevant gezeigt:** „← Übersicht“ in Schritt 1. (Fehler: „Speichern und schließen“ beendet eine laufende Pause still.)

→ Nr. 13, 98, 99

#### Ruhepunkt · Formular-Schritte

- **Hauptaktion:** Ausfüllen und „Weiter“.
- **Optisch klar?** Ja. Genau ein gefüllter Knopf, „Zurück“ umrandet.
- **Konkurrierende Knöpfe:** Keine.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** Drei Zeilen „nicht festgelegt“ ohne Tagesregeln (gewollter Hinweis).

#### Ruhepunkt · Fertig

- **Hauptaktion:** „Mit dem Mentor besprechen“, wenn der Mentor eingerichtet ist, sonst zur Übersicht. Nach „Vor dem Trading“ fraglich, dort will man eher in den Handel.
- **Optisch klar?** Ja. Einziger gefüllter Knopf.
- **Konkurrierende Knöpfe:** „← Übersicht“ oben und „Zur Übersicht“ unten.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** „← Übersicht“ oben; Mentor-Knopf ohne eingerichteten Mentor.

→ Nr. 98

#### Ruhepunkt · Dialog „Hilfe“

- **Hauptaktion:** Nummern lesen, „Schließen“.
- **Optisch klar?** Ja für Mausnutzer; mit Tastatur trägt das X den Fokusring.
- **Konkurrierende Knöpfe:** X mit Fokus (nur bei Tastatur sichtbar).
- **Versteckbar:** —
- **Nicht relevant gezeigt:** —

→ Nr. 35

#### Ruhepunkt · Bestätigung „Session löschen“

- **Hauptaktion:** Löschen bestätigen (oder abbrechen).
- **Optisch klar?** Nein. „Abbrechen“ und „Löschen“ gleich geformt, nur die Farbe unterscheidet.
- **Konkurrierende Knöpfe:** „Abbrechen“; X mit Fokus (Tastatur).
- **Versteckbar:** —
- **Nicht relevant gezeigt:** —

→ Nr. 81

#### Ruhepunkt · Handy

- **Hauptaktion:** Start: Session wählen; Schritte: Übung starten, dann „Weiter“.
- **Optisch klar?** Nein. Zwei gefüllte Knöpfe je Übungsschritt.
- **Konkurrierende Knöpfe:** Zwei gefüllte Knöpfe; „×“ je Zeile; doppelter Ausstieg in Schritt 1.
- **Versteckbar:** Tempo-Zeile während der Atmung.
- **Nicht relevant gezeigt:** —

→ Nr. 13

### Prop Firms

#### Übersicht · voll

- **Hauptaktion:** „Trade loggen“. Trades kommen über „Prop-Konten“ im Trade-Dialog in die Konten.
- **Optisch klar?** Nein. „+ Prop-Konto“ steht in Leserichtung vor „Trade loggen“, beide gleich geformt.
- **Konkurrierende Knöpfe:** „+ Prop-Konto“, ▷; je Karte „Trades zuordnen“ und „Bearbeiten“.
- **Versteckbar:** ▷; „Konto anlegen“ tertiär; „Bearbeiten“ als Stift im Kartenkopf.
- **Nicht relevant gezeigt:** ▷.

→ Nr. 14, 101

#### Karte „Regel verletzt“ / „Ziel erreicht“

- **Hauptaktion:** Den Statuswechsel bestätigen („Als geplatzt/bestanden markieren“).
- **Optisch klar?** Ja.
- **Konkurrierende Knöpfe:** Fußknöpfe (schwach); „Trade loggen“.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** Balken, „Bestehen: Konto geplatzt“, „Puffer: noch 20 Stop-Losses“ nach dem Breach.

→ Nr. 68

#### Abschnitt „Abgeschlossen“ aufgeklappt

- **Hauptaktion:** Nachschlagen; einzige Aktion „Bearbeiten“.
- **Optisch klar?** Nein. Beendete Konten bekommen die volle Karte mit Balken.
- **Konkurrierende Knöpfe:** „Trades zuordnen“ und „Bearbeiten“ je Karte.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** Balken, „Bestehen …“, „Puffer …“ bei beendeten Konten.

→ Nr. 68

#### Übersicht · leer

- **Hauptaktion:** „Konto anlegen“.
- **Optisch klar?** Ja. Einziger gefüllter Knopf; dieselbe Aktion steht oben noch einmal.
- **Konkurrierende Knöpfe:** „+ Prop-Konto“, „Trade loggen“, ▷.
- **Versteckbar:** Alle Kopf-Werkzeuge ohne Konto.
- **Nicht relevant gezeigt:** Doppelung; zweiter Satz mit „Firmen-Preset“.

→ Nr. 14

#### Übersicht · Handy

- **Hauptaktion:** Voll: „Trade loggen“ (runder Knopf). Leer: „Konto anlegen“.
- **Optisch klar?** Nein, bis zu drei „+“ mit zwei Bedeutungen.
- **Konkurrierende Knöpfe:** Kopf-„+“ ohne Text, ▷, zwei vollbreite Ghost-Knöpfe je Karte.
- **Versteckbar:** Kopf-„+“ und ▷ auf dem Handy.
- **Nicht relevant gezeigt:** ▷; zweites und drittes „+“.

→ Nr. 14

#### Bilanz · voll

- **Hauptaktion:** „Ausgabe erfassen“.
- **Optisch klar?** Nein. „Ausgabe erfassen“ und „Payout erfassen“ sind beide gefüllt (nicht gleichzeitig im Bild).
- **Konkurrierende Knöpfe:** „Payout erfassen“; Kopf-Werkzeuge.
- **Versteckbar:** Ausgaben ab der 6. Zeile; Kopf-Werkzeuge.
- **Nicht relevant gezeigt:** „Trade loggen“, „+ Prop-Konto“, ▷.

→ Nr. 23, 67

#### Bilanz · Erfassungsformular offen

- **Hauptaktion:** Der Submit „Ausgabe erfassen“ bzw. „Payout erfassen“.
- **Optisch klar?** Ja.
- **Konkurrierende Knöpfe:** „× Schließen“ (in Ordnung).
- **Versteckbar:** Ausgabe: Notiz, Firma nur ohne Konto. Payout: Split, Netto, Erhalten am, Status.
- **Nicht relevant gezeigt:** Feld „Firma“ bei gewähltem Konto.

→ Nr. 24

#### Bilanz · leer

- **Hauptaktion:** „Ausgabe erfassen“ (die erste Challenge-Gebühr).
- **Optisch klar?** Nein. Beide Formulare klappen von selbst auf: zwei gefüllte Submits, zwei „Schließen“.
- **Konkurrierende Knöpfe:** Zweiter Submit; Kopf-Werkzeuge.
- **Versteckbar:** Payout als „oder Payout erfassen“; Planer eingeklappt.
- **Nicht relevant gezeigt:** Kacheln mit 0 € und grünem „erreicht“; leeres Diagramm; leere „Pro Firma“; doppelte Leerhinweise.

→ Nr. 23

#### Bilanz · Payout-Planer offen

- **Hauptaktion:** Konto wählen und den Weg zum Payout bzw. Bestehen ablesen.
- **Optisch klar?** Ja.
- **Konkurrierende Knöpfe:** Keine.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** Info-Banner (doppelt zur Kontoauswahl); „Profit Split“ in der Challenge; leere „Payouts dieses Kontos“.

→ Nr. 102

#### Bilanz · Handy

- **Hauptaktion:** „Ausgabe erfassen“.
- **Optisch klar?** Nein. Vier „+“, zwei davon gefüllt; „Erhalten“ liegt rechts außerhalb.
- **Konkurrierende Knöpfe:** Kopf-„+“, ▷, runder „+“, „Payout erfassen“.
- **Versteckbar:** Payouts: Brutto, Split, Beantragt, Erhalten-Datum; Ausgaben: Firma, Konto, Notiz.
- **Nicht relevant gezeigt:** Kopf-Werkzeuge und runder Knopf auf der Bilanz.

→ Nr. 67

#### Friedhof · voll

- **Hauptaktion:** Einen Grabstein umdrehen.
- **Optisch klar?** Nein. Auffälligster Knopf ist „Trade loggen“ in der Kopfreihe.
- **Konkurrierende Knöpfe:** „Trade loggen“, „+ Prop-Konto“, ▷, runder Knopf.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** Muster-Karte bei einem Grabstein; Kopf-Werkzeuge.

→ Nr. 102

#### Friedhof · leer

- **Hauptaktion:** Keine. Es gibt nichts zu tun; ohne Konten „Konto anlegen“.
- **Optisch klar?** Ja, mit Konten passt „Gut so.“ ohne Knopf.
- **Konkurrierende Knöpfe:** Kopf-Werkzeuge.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** Kopf-Werkzeuge; „im Cockpit“ statt „in der Übersicht“.

→ Nr. 14

#### Konten · voll

- **Hauptaktion:** „Konto anlegen“.
- **Optisch klar?** Ja. Einziger gefüllter; aber oben dieselbe Aktion, aufgeklappt ein zweites gefülltes „Speichern“.
- **Konkurrierende Knöpfe:** „+ Prop-Konto“, „Trade loggen“, ▷; Papierkorb je Zeile; Ampel-„Speichern“.
- **Versteckbar:** Löschen je Zeile → nur im Dialog.
- **Nicht relevant gezeigt:** Kopf-Werkzeuge.

→ Nr. 8, 69

#### Konten · leer

- **Hauptaktion:** „Konto anlegen“.
- **Optisch klar?** Nein. Zwei gefüllte „Konto anlegen“ untereinander plus „+ Prop-Konto“.
- **Konkurrierende Knöpfe:** Kartenkopf-Knopf, „+ Prop-Konto“, „Trade loggen“, ▷.
- **Versteckbar:** „Ampel und Stop-Größe“ bis zum ersten Konto.
- **Nicht relevant gezeigt:** Kartenkopf-Knopf; Ampel; Kopf-Werkzeuge.

→ Nr. 14

#### Konten · Handy

- **Hauptaktion:** „Konto anlegen“.
- **Optisch klar?** Nein. Die Tabelle zeigt nur Konto und Phase, Bearbeiten liegt rechts außerhalb; leer vier „+“.
- **Konkurrierende Knöpfe:** Kopf-„+“, ▷, runder „+“, zweites gefülltes „Konto anlegen“.
- **Versteckbar:** Start, Gruppe, Trades auf dem Handy.
- **Nicht relevant gezeigt:** Runder Knopf auf Konten.

→ Nr. 69

#### Dialog „Konto anlegen“

- **Hauptaktion:** „Konto anlegen“.
- **Optisch klar?** Nein. Der Knopf steht nach 30 gleichrangigen Feldern und ist beim Öffnen nicht im Bild.
- **Konkurrierende Knöpfe:** X mit Fokus (nur Tastatur); „Abbrechen“ (in Ordnung).
- **Versteckbar:** Markt, Währung, Status, Startdatum/-balance, Split, Gruppe, Notiz, alle Modus-, Basis-, Reset- und Zeitzonen-Felder, „Weitere Regeln“.
- **Nicht relevant gezeigt:** Payout-Bedingungen in der Challenge; Profit Target bei funded; Lock-Felder ohne „Trailing mit Lock“; Status beim Neuanlegen; Info-Banner als Kasten.

→ Nr. 24, 35

#### Dialog „Konto bearbeiten“

- **Hauptaktion:** „Speichern“ (Anlass meist Regeln, Phasenwechsel, Archivieren; geplatzt/bestanden haben eigene Banner-Knöpfe).
- **Optisch klar?** Nein. „Speichern“ erst nach dem Scrollen; das rot umrandete „Löschen“ fällt daneben stark auf.
- **Konkurrierende Knöpfe:** „Löschen“ (rot), „Abbrechen“.
- **Versteckbar:** Zusatzfelder wie beim Anlegen; „Status“ bleibt sichtbar.
- **Nicht relevant gezeigt:** —

→ Nr. 69

#### Dialog „Trades zuordnen“

- **Hauptaktion:** „Speichern“.
- **Optisch klar?** Ja.
- **Konkurrierende Knöpfe:** „Alle“/„Keine“ umrandet wie „Abbrechen“.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** „Speichern“/„Abbrechen“ ohne Trades; „Alle/Keine“ bei weniger als zwei Trades.

→ Nr. 34

#### Dialog „Eigenes Preset“

- **Hauptaktion:** „Preset anlegen“ bzw. „Speichern“; beim Ansehen „Als eigenes Preset kopieren“.
- **Optisch klar?** Nein. Alle Felder gleichrangig, der Hauptknopf erst nach dem Scrollen; „Löschen“ rot neben „Speichern“.
- **Konkurrierende Knöpfe:** „Löschen“ (danger).
- **Versteckbar:** Markt, Währung, Split, „Zuletzt geprüft“, Notiz, Modi, „Weitere Regeln“, Payout, übrige Gebühren.
- **Nicht relevant gezeigt:** Lock-Felder ohne „Trailing mit Lock“.

→ Nr. 24

#### Lösch-Bestätigungen (Konto, Preset, Ausgabe, Payout)

- **Hauptaktion:** Löschen bestätigen.
- **Optisch klar?** Ja. Rot macht die Hauptaktion eindeutig.
- **Konkurrierende Knöpfe:** Keine.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** —

→ Nr. 81

### Coupon-Codes

#### Coupon-Codes · voll

- **Hauptaktion:** Einen Code kopieren (Klick aufs Ticket).
- **Optisch klar?** Nein. Zuerst fällt „Trade loggen“ auf, das einzige farbige Element.
- **Konkurrierende Knöpfe:** „Trade loggen“, ▷.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** „Trade loggen“ und ▷; Marke „Beispiel“ dreimal.

→ Nr. 1, 103

#### Coupon-Codes · Handy

- **Hauptaktion:** Einen Code kopieren.
- **Optisch klar?** Nein. ▷ allein in der ersten Zeile, der runde Knopf als einziges farbiges Element.
- **Konkurrierende Knöpfe:** ▷, runder Knopf.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** ▷-Zeile, runder Knopf, „Beispiel“ je Kachel.

→ Nr. 1

#### Coupon-Codes · leer

- **Hauptaktion:** Keine eigene (die Codes sind fest hinterlegt; der Zustand ist praktisch unerreichbar).
- **Optisch klar?** Nein. Stärkster Knopf ist „Trade loggen“.
- **Konkurrierende Knöpfe:** „Trade loggen“, ▷.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** „Trade loggen“, ▷.

### Coach

#### Coach · nicht eingerichtet

- **Hauptaktion:** „Zu den Einstellungen“.
- **Optisch klar?** Ja. Einziger gefüllter Knopf, Kopfreihe aus.
- **Konkurrierende Knöpfe:** Keine.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** Zweiter Satz mit Technik-Details.

→ Nr. 107

#### Coach · nicht eingerichtet, Handy

- **Hauptaktion:** „Zu den Einstellungen“.
- **Optisch klar?** Ja.
- **Konkurrierende Knöpfe:** Keine.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** Technik-Satz über fünf Zeilen.

→ Nr. 107

#### Übersicht · noch keine Gruppe

- **Hauptaktion:** „+ Gruppe“.
- **Optisch klar?** Ja. Einziger gefüllter Knopf.
- **Konkurrierende Knöpfe:** Benachrichtigungen-Karte (größte Karte: Schalter, E-Mail, „Speichern“).
- **Versteckbar:** —
- **Nicht relevant gezeigt:** Benachrichtigungen ohne Gruppe.

→ Nr. 55

#### Übersicht · als Mentor mit Gruppen

- **Hauptaktion:** Eine eigene Gruppe öffnen (Name oder „Öffnen“).
- **Optisch klar?** Nein. Am stärksten wirkt das gefüllte „+ Gruppe“.
- **Konkurrierende Knöpfe:** „+ Gruppe“ (gefüllt); Benachrichtigungen-Formular; „Was der Mentor sieht“.
- **Versteckbar:** E-Mail-Feld und „Speichern“ nur bei eingeschaltetem Schalter; Benachrichtigungen eingeklappt.
- **Nicht relevant gezeigt:** E-Mail-Feld bei ausgeschalteter E-Mail.

→ Nr. 8, 55, 57

#### Übersicht · als Schüler

- **Hauptaktion:** Die offene Aufgabe abhaken.
- **Optisch klar?** Nein. Auffälligster Knopf ist „+ Gruppe“ der Mentor-Rolle; die Aufgaben stehen an dritter Stelle.
- **Konkurrierende Knöpfe:** „+ Gruppe“; „Verlassen“, „Jetzt abgleichen“; „Was der Mentor sieht“; Benachrichtigungen.
- **Versteckbar:** „Verlassen“ und „Jetzt abgleichen“ ins Zeilenmenü; Abgleich-Zeile nur bei Fehler.
- **Nicht relevant gezeigt:** Mentor-Karte mit gefülltem Knopf; „Zuletzt abgeglichen …“ im Normalfall.

→ Nr. 15, 55, 105

#### Übersicht · Handy

- **Hauptaktion:** Mentor: eine Gruppe öffnen; Schüler: die offene Aufgabe abhaken.
- **Optisch klar?** Nein. Oben steht für beide Rollen das gefüllte „+ Gruppe“.
- **Konkurrierende Knöpfe:** „+ Gruppe“; „Öffnen“ je Zeile; Benachrichtigungen (~290 px); „Verlassen“/„Abgleichen“.
- **Versteckbar:** Benachrichtigungen eingeklappt; Zeilenmenü.
- **Nicht relevant gezeigt:** Mentor-Karte zuerst für Schüler; E-Mail-Feld bei ausgeschaltetem Schalter.

→ Nr. 15, 55, 57

#### Gruppe · voll

- **Hauptaktion:** Das Journal eines Schülers öffnen (Zeile).
- **Optisch klar?** Nein. Zuerst die volle Einladungsleiste, dann sechs Kacheln.
- **Konkurrierende Knöpfe:** Einladungslink mit „Kopieren“; „Aufgabe an alle“, „Aktualisieren“ (ghost, wird gebraucht); Zeitraum.
- **Versteckbar:** Einladungslink ins …-Menü, sobald Schüler da sind.
- **Nicht relevant gezeigt:** Einladungsleiste bei vorhandenen Schülern.

→ Nr. 54

#### Gruppe · leer

- **Hauptaktion:** Einladungslink kopieren (der Knopf der Einladungsleiste).
- **Optisch klar?** Nein. „Kopieren“ nur umrandet, der Leerzustand ohne Knopf.
- **Konkurrierende Knöpfe:** Zeitraum-Segment; „Aktualisieren“.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** Zeitraum und Stat-Hinweis ohne Schüler.

→ Nr. 54

#### Gruppen-Menü (…)

- **Hauptaktion:** Keine. Sammelstelle für Seltenes.
- **Optisch klar?** Ja. Erfüllt Regel 3.
- **Konkurrierende Knöpfe:** Keine.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** —

→ Nr. 54

#### Gruppe · Handy

- **Hauptaktion:** Einen Schüler öffnen.
- **Optisch klar?** Nein. Die Tabelle beginnt bei ≈770 px, nach Einladungskarte und sechs Kacheln.
- **Konkurrierende Knöpfe:** Einladungskarte; sechs Kacheln; ✓ und ⟳ ohne Text.
- **Versteckbar:** Einladungslink ins Menü.
- **Nicht relevant gezeigt:** Einladungskarte bei vorhandenen Schülern.

→ Nr. 18, 54

#### Journal eines Schülers

- **Hauptaktion:** Unter einem Eintrag eine Notiz schreiben und senden.
- **Optisch klar?** Nein. N+1 gefüllte grüne Knöpfe („Notiz senden“ unter jedem Eintrag, auch leer; „Aufgabe geben“ oben).
- **Konkurrierende Knöpfe:** „Aufgabe geben“ mit offenem Formular; „Notiz senden“ ×N; „Antworten“ je Notiz; „Bearbeiten“/„Löschen“ mit Text.
- **Versteckbar:** Aufgaben-Formular hinter „Aufgabe geben“; Antwortfeld hinter „Antworten“; Bearbeiten/Löschen als Symbole.
- **Nicht relevant gezeigt:** „Notiz senden“ bei leerem Feld; offenes Datumsfeld; „Nur lesen …“ bei jedem Besuch.

→ Nr. 16, 17, 56, 106

#### Journal eines Schülers · Handy

- **Hauptaktion:** Notiz senden.
- **Optisch klar?** Nein. Abwechselnd Text und vollbreite grüne Knopfblöcke.
- **Konkurrierende Knöpfe:** „Notiz senden“ ×N, „Aufgabe geben“, „Antworten“ (volle Breite).
- **Versteckbar:** Aufgaben-Formular, Antwortfeld.
- **Nicht relevant gezeigt:** Senden-Knöpfe ohne Text.

→ Nr. 16, 17, 56

#### Einladung annehmen (Schüler)

- **Hauptaktion:** „Beitreten“.
- **Optisch klar?** Ja. Einziger gefüllter Knopf; die lange Tabelle ist hier die Einwilligung.
- **Konkurrierende Knöpfe:** Keine.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** —

#### Einladung als Co-Coach

- **Hauptaktion:** „Als Co-Coach beitreten“.
- **Optisch klar?** Ja.
- **Konkurrierende Knöpfe:** Keine.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** —

#### Dialog „Co-Coaches“

- **Hauptaktion:** Den Co-Coach-Link kopieren.
- **Optisch klar?** Nein. Kein gefüllter Knopf; „Kopieren“ und „Fertig“ gleichrangig.
- **Konkurrierende Knöpfe:** „Fertig“, „Neuen Link erzeugen“.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** —

→ Nr. 34

#### Dialog „Aufgabe an alle“

- **Hauptaktion:** „Aufgabe geben“.
- **Optisch klar?** Ja.
- **Konkurrierende Knöpfe:** Keine.
- **Versteckbar:** „Fällig am (optional)“ hinter einer Aufklappzeile.
- **Nicht relevant gezeigt:** —

→ Nr. 80

#### Dialoge „Neue Gruppe“, „Umbenennen“, Bestätigungen

- **Hauptaktion:** Erstellen / Speichern / Bestätigen.
- **Optisch klar?** Ja. Genau ein gefüllter Knopf.
- **Konkurrierende Knöpfe:** Keine.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** —

#### Dialog „Was der Mentor sieht“

- **Hauptaktion:** Lesen und schließen.
- **Optisch klar?** Ja.
- **Konkurrierende Knöpfe:** Keine.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** —

#### Mentor-Notiz im Notebook (Sicht des Schülers)

- **Hauptaktion:** Die Notiz lesen und ggf. antworten.
- **Optisch klar?** Ja.
- **Konkurrierende Knöpfe:** Keine.
- **Versteckbar:** Antwortfeld hinter „Antworten“, solange es keinen Verlauf gibt.
- **Nicht relevant gezeigt:** —

→ Nr. 56

### Affiliate

#### Alle Creator · voll

- **Hauptaktion:** Einen Creator öffnen.
- **Optisch klar?** Nein. Als Knopf sticht nur „Trade loggen“ heraus; Kacheln und Balken dominieren.
- **Konkurrierende Knöpfe:** „Trade loggen“, ▷; 5× Stift „Provision ändern“.
- **Versteckbar:** Stift erst bei Hover/Fokus.
- **Nicht relevant gezeigt:** „Trade loggen“, ▷; Kachel „Creator: 5“ = Zeilenzahl.

→ Nr. 1, 100, 104

#### Alle Creator · Handy

- **Hauptaktion:** Einen Creator öffnen (Name antippen).
- **Optisch klar?** Nein. Nichts deutet das Öffnen an.
- **Konkurrierende Knöpfe:** Runder Knopf über der Tabelle; ▷-Zeile.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** ▷-Zeile, runder Knopf, Kachel „Creator“ in einer halben Reihe.

→ Nr. 1

#### Creator-Ansicht · voll

- **Hauptaktion:** „Dein Link“ kopieren.
- **Optisch klar?** Nein. Link und Code als zwei gleiche Tickets (am Desktop ist der Link schon breiter).
- **Konkurrierende Knöpfe:** Code-Ticket; „Trade loggen“, ▷; Creator-Auswahl, Reiter.
- **Versteckbar:** Code als Zeile unter dem Link.
- **Nicht relevant gezeigt:** „Trade loggen“, ▷.

→ Nr. 1, 53

#### Creator-Ansicht · Handy

- **Hauptaktion:** Den Link kopieren.
- **Optisch klar?** Nein. Zwei gleich große Karten, der Link abgeschnitten, der Code vollständig.
- **Konkurrierende Knöpfe:** Code-Karte; runder Knopf; ▷-Zeile.
- **Versteckbar:** Code als Zeile.
- **Nicht relevant gezeigt:** ▷-Zeile, runder Knopf.

→ Nr. 1, 53

#### Creator ohne Kunden

- **Hauptaktion:** Den Link kopieren und teilen.
- **Optisch klar?** Nein. Kacheln mit 0, Diagramm mit acht Null-Monaten, leere Kundenliste (mit Beispieldaten nicht erreichbar).
- **Konkurrierende Knöpfe:** Null-Kacheln; leeres Diagramm; „Trade loggen“.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** Kacheln, Diagramm, Kundenkarte ohne Kunden.

→ Nr. 53

#### Dialog „Provision ändern“

- **Hauptaktion:** „Speichern“.
- **Optisch klar?** Ja.
- **Konkurrierende Knöpfe:** Keine.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** —

### Einstellungen

#### Rahmen (Kopfreihe und Bereichsmenü)

- **Hauptaktion:** Im gewählten Bereich eine Einstellung ändern; die Kopfreihe hat hier keine Aufgabe.
- **Optisch klar?** Nein. Jeder Bereich beginnt mit vier fremden Elementen; auf Konten stehen zwei „+“ übereinander.
- **Konkurrierende Knöpfe:** Zeitraum, Konto, ▷, „Trade loggen“.
- **Versteckbar:** Daten und Sicherung als eigener Bereich; „Abo“ aus dem Menü.
- **Nicht relevant gezeigt:** Zeitraum, Konto (wirkt nur auf die Anzeige von Einheit und 1 R in Trading), ▷, „Trade loggen“.

→ Nr. 1, 70, 108

#### Profil · voll

- **Hauptaktion:** Profilangaben eintragen und „Speichern“.
- **Optisch klar?** Nein. Zwei gefüllte Knöpfe („Speichern“, Platzhalter „2FA aktivieren“), 14 Bedienelemente auf ~1700 px.
- **Konkurrierende Knöpfe:** „2FA aktivieren“; „Passwort zurücksetzen“ neben „Speichern“; zweites „Speichern“ (Privatsphäre); vier gleiche Datenknöpfe; zwei rote.
- **Versteckbar:** Adresse und Bio; Block „Sicherheit“; Export-Variante als Häkchen; Import-Modus im Dialog; Beispieldaten-Text.
- **Nicht relevant gezeigt:** Ausgegrautes Profilbild-„Entfernen“; Tastatur-Hinweis im Datenblock (nennt „1–6“, es sind 1–9 und 0); Kopfreihe.

→ Nr. 8, 59, 70

#### Profil · leer

- **Hauptaktion:** Profil speichern; im Datenblock hilft einem neuen Nutzer „Beispieldaten laden“.
- **Optisch klar?** Nein. „Laden“ ist klein und gleich gewichtet wie Export/Import; gefüllt ist nur der 2FA-Platzhalter.
- **Konkurrierende Knöpfe:** Ohne/Mit Anhängen, Zusammenführen/Ersetzen, „Alles löschen“, „2FA aktivieren“.
- **Versteckbar:** Export und „Alles löschen“ hinter „Weitere Datenaktionen“.
- **Nicht relevant gezeigt:** Export ohne Trades; „Alles löschen“ ohne Daten; „Ersetzen“.

→ Nr. 8, 70

#### Design

- **Hauptaktion:** Erscheinungsbild wählen (wirkt sofort).
- **Optisch klar?** Ja. Kein gefüllter Knopf konkurriert; aber ~31 gleichrangige Auswahlpunkte.
- **Konkurrierende Knöpfe:** Schriftkarten; Einzel-Farbwähler neben den Farbpaaren; „Aktuelles speichern“.
- **Versteckbar:** Einzel-Farbwähler hinter „Eigene Farben“; „Standardfarben“ nur bei Abweichung.
- **Nicht relevant gezeigt:** „Standardfarben“ im Standard; „Aktuelles speichern“ bei schon gespeichertem Design.

→ Nr. 58, 71

#### Sprache

- **Hauptaktion:** Sprache wählen.
- **Optisch klar?** Ja. Sechs Karten, die gewählte markiert.
- **Konkurrierende Knöpfe:** Kopfreihe.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** Kopfreihe.

#### Benachrichtigungen

- **Hauptaktion:** Performance-Recaps einschalten (beide stehen aus).
- **Optisch klar?** Nein. Acht grün leuchtende Hinweis-Schalter ziehen den Blick von den zwei grauen Recap-Schaltern weg.
- **Konkurrierende Knöpfe:** Hauptschalter und sieben Bereichsschalter; Kopfreihe.
- **Versteckbar:** Sieben Bereichsschalter hinter „Bereiche einzeln wählen“.
- **Nicht relevant gezeigt:** Kopfreihe.

→ Nr. 58

#### Abo

- **Hauptaktion:** Keine (Platzhalter).
- **Optisch klar?** Nein. Die einzigen Knöpfe sind die der Kopfreihe.
- **Konkurrierende Knöpfe:** Kopfreihe.
- **Versteckbar:** Der ganze Eintrag im Menü.
- **Nicht relevant gezeigt:** Der Bereich selbst.

→ Nr. 108

#### Konten

- **Hauptaktion:** „+ Konto hinzufügen“.
- **Optisch klar?** Ja. Einziger gefüllter; darüber aber „+ Trade loggen“ (zwei „+“).
- **Konkurrierende Knöpfe:** „+ Trade loggen“; Konto-Picker; Stift und Papierkorb je Zeile.
- **Versteckbar:** Löschen in den Dialog.
- **Nicht relevant gezeigt:** Zeitraum, ▷.

→ Nr. 1, 69

#### Trading

- **Hauptaktion:** Werte anpassen und „Speichern“.
- **Optisch klar?** Nein. „Speichern“ liegt unter der Falz und gilt nur für einen Teil der Felder; Chips und Schalter speichern sofort.
- **Konkurrierende Knöpfe:** Instrument-Chips, Einheit, Geld-blind, „Auf Standard zurücksetzen“, Kopfreihe.
- **Versteckbar:** Ruin-Schwelle, Monte-Carlo-Durchläufe, 1 R hinter „Mehr Optionen“.
- **Nicht relevant gezeigt:** „Auf Standard zurücksetzen“ bei 0/0; „Was handelst du?“ (wird nirgends ausgewertet). (Dass Umschalten ungespeicherte Felder verwirft, ist ein eigener Fehler.)

→ Nr. 58, 71

#### Regeln · voll

- **Hauptaktion:** Regel eintippen und „+ Hinzufügen“.
- **Optisch klar?** Ja. Einziger gefüllter Knopf.
- **Konkurrierende Knöpfe:** Fünf Papierkörbe (immer sichtbar); Kopfreihe.
- **Versteckbar:** Papierkorb erst bei Hover/Fokus.
- **Nicht relevant gezeigt:** Kopfreihe.

→ Nr. 100

#### Regeln · leer

- **Hauptaktion:** Die erste Regel anlegen.
- **Optisch klar?** Ja. Ein Satz, ein Feld, ein Knopf.
- **Konkurrierende Knöpfe:** Kopfreihe.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** Gestrichelte Box wiederholt Feld und Knopf (bleibt: übliches Leer-Muster).

#### Notebook

- **Hauptaktion:** Schriftgrößen wählen und „Speichern“.
- **Optisch klar?** Ja.
- **Konkurrierende Knöpfe:** Kopfreihe.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** „Auf Standard zurücksetzen“ bei Standardwerten.

→ Nr. 71

#### Mentor · leer

- **Hauptaktion:** Adresse und Token eintragen, „Speichern“.
- **Optisch klar?** Ja.
- **Konkurrierende Knöpfe:** „Verbindung testen“ (ohne Adresse nur eine Fehlermeldung); grüner Schalter „Audio behalten“.
- **Versteckbar:** „So funktioniert es“ und den Technik-Hinweis einklappen.
- **Nicht relevant gezeigt:** „Verbindung testen“ ohne Adresse.

→ Nr. 58, 71

#### Inhalte · Reiter Kategorien (Start)

- **Hauptaktion:** Keine. Eine reine Lesetabelle; die Aktion („Tag hinzufügen“) liegt im zweiten Reiter.
- **Optisch klar?** Nein.
- **Konkurrierende Knöpfe:** Reiter „Tags“; Kopfreihe.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** Feste Kategorien-Tabelle als Startansicht.

→ Nr. 60

#### Inhalte · Reiter Tags

- **Hauptaktion:** „+ Tag hinzufügen“.
- **Optisch klar?** Ja. Einziger gefüllter; daneben aber „Zurücksetzen“ (alle Tags!), das sich wie „Filter zurücksetzen“ liest.
- **Konkurrierende Knöpfe:** „Zurücksetzen“; Suche und Filter; 50 Stift- und Papierkorb-Symbole.
- **Versteckbar:** „Zurücksetzen“ unter die Tabelle; Löschen in den Dialog.
- **Nicht relevant gezeigt:** Suche und Filter, wenn es keine Tags gibt.

→ Nr. 60, 61, 69

#### Logs · Imports leer

- **Hauptaktion:** Weiter hilft „CSV importieren“.
- **Optisch klar?** Nein. Ein 8-spaltiger Tabellenkopf über dem Leerzustand, kein Knopf.
- **Konkurrierende Knöpfe:** Kopfreihe.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** Tabellenkopf ohne Zeilen.

→ Nr. 109

#### Logs · Verlauf

- **Hauptaktion:** Den Verlauf durchsehen.
- **Optisch klar?** Ja. Kein gefüllter Knopf.
- **Konkurrierende Knöpfe:** „Verlauf leeren“ in der Filterleiste.
- **Versteckbar:** „Verlauf leeren“ unter die Tabelle.
- **Nicht relevant gezeigt:** Suche, Filter, Leeren bei leerem Verlauf.

→ Nr. 61

#### Dialog „Konto“

- **Hauptaktion:** „Speichern“.
- **Optisch klar?** Ja für Mausnutzer; mit Tastatur hat das X Fokus und Ring, Enter schließt.
- **Konkurrierende Knöpfe:** X mit Fokus.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** —

→ Nr. 35, 69

#### Dialog „Tag“

- **Hauptaktion:** „Speichern“.
- **Optisch klar?** Ja.
- **Konkurrierende Knöpfe:** X mit Fokus (Tastatur).
- **Versteckbar:** —
- **Nicht relevant gezeigt:** Kategorie immer „Setups“ vorbelegt, auch bei aktivem Filter.

→ Nr. 69, 110

#### Dialog „Sicherung einspielen“

- **Hauptaktion:** JSON-Datei ablegen oder auswählen.
- **Optisch klar?** Ja, aber nur, weil das Upload-Symbol fehlerhaft ~300 px groß ist.
- **Konkurrierende Knöpfe:** Vorgelagerte Wahl „Zusammenführen/Ersetzen“ auf der Seite.
- **Versteckbar:** „Ersetzen“ als Option im Dialog.
- **Nicht relevant gezeigt:** Warnbanner, bevor „Ersetzen“ gewählt ist.

→ Nr. 6, 70

#### Dialog „Sicherung erstellt“

- **Hauptaktion:** „Fertig“ (der Download läuft schon).
- **Optisch klar?** Ja.
- **Konkurrierende Knöpfe:** Großes JSON-Textfeld; „Kopieren“.
- **Versteckbar:** Beides hinter „Download startet nicht?“.
- **Nicht relevant gezeigt:** JSON-Text im Normalfall.

→ Nr. 70

#### Bestätigungen und Hinweise

- **Hauptaktion:** Bestätigen bzw. „Verstanden“.
- **Optisch klar?** Ja.
- **Konkurrierende Knöpfe:** Keine.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** — (Enter auf dem X bricht schon ab).

→ Nr. 81

#### Einstellungen · Handy (alle Bereiche)

- **Hauptaktion:** Bereich wählen und dort ändern.
- **Optisch klar?** Nein. Zeitraum und ▷ oben, der runde Knopf überdeckt Felder; der aktive Bereich in der Leiste ist oft nicht zu sehen.
- **Konkurrierende Knöpfe:** Zeitraum, ▷, runder „+“.
- **Versteckbar:** Abo-Eintrag.
- **Nicht relevant gezeigt:** Zeitraum, ▷, runder Knopf.

→ Nr. 1, 62

#### Konten · Handy

- **Hauptaktion:** „+ Konto hinzufügen“.
- **Optisch klar?** Ja. Gefüllt in voller Breite.
- **Konkurrierende Knöpfe:** Runder „+“.
- **Versteckbar:** —
- **Nicht relevant gezeigt:** Zeitraum, ▷ (Bearbeiten nur nach seitlichem Wischen).

→ Nr. 69

#### Inhalte/Tags · Handy

- **Hauptaktion:** „+ Tag hinzufügen“.
- **Optisch klar?** Nein. Werkzeugleiste in drei Zeilen, „Zurücksetzen“ über dem Hauptknopf.
- **Konkurrierende Knöpfe:** „Zurücksetzen“, Suche und Filter, runder „+“.
- **Versteckbar:** „Zurücksetzen“ unter die Tabelle.
- **Nicht relevant gezeigt:** Zeitraum, ▷.

→ Nr. 60, 69

#### Trading · Handy

- **Hauptaktion:** Werte ändern und „Speichern“.
- **Optisch klar?** Nein. „Speichern“ am Ende einer 1610 px hohen Seite; man sieht nicht, ob gespeichert ist.
- **Konkurrierende Knöpfe:** Runder „+“; sofort wirkende Chips und Schalter.
- **Versteckbar:** Monte-Carlo-Parameter und 1 R hinter „Mehr Optionen“.
- **Nicht relevant gezeigt:** Zeitraum, ▷.

→ Nr. 71

## Vorschläge nach Wirkung

Alle bestätigten Vorschläge; gleichartige über mehrere Screens sind zusammengefasst. Sortiert nach Wirkung, bei gleicher Wirkung nach Aufwand (S, M). Primär = gefüllt bzw. „Trade loggen“, sekundär = umrandet, tertiär = Text/ghost.

### Wirkung groß

1. **Kopfreihe: „Trade loggen“ und ▷ nur dort, wo sie die Aufgabe der Seite sind** · Regel 1, 3, 4, 5 · Aufwand S · vorher entscheiden: E1
   - Wo: Kopfreihe aller Seiten (Desktop und Handy): Einstellungen (alle Bereiche), Coupon-Codes, Affiliate, Blind-Replay, Statistiken, Fortschritt, Notebook, News, Prop Firms
   - Änderung: Der Standard in pageHead (app.js:257) wird „kein „Trade loggen“, kein ▷“. Eingeschaltet bleiben beide nur im TradeLog und in der Tagesansicht (dort mit Tagesvorbelegung, Nr. 7); das Dashboard hat seine eigene Reihe, die Prop-Übersicht schaltet „Trade loggen“ selbst ein (Nr. 14). Eine laufende Session (Timer und Stopp) bleibt auf jeder Seite mit Kopfreihe sichtbar, außer wo sie ausdrücklich aus ist (Schatten-Ich, Mentor, Coach, Prop Firms, Einstellungen, Coupon-Codes, Affiliate, Replay). Die Einstellungen verlieren zusätzlich Zeitraum und Konto; Coupon-Codes und Affiliate zeigen beides schon heute nicht. Damit eine ganz leere Kopfreihe verschwindet, gibt pageHead '' zurück, wenn links und rechts nichts steht (app.js:261); sonst bleiben wie heute beim Coach rund 60 px Leerraum. Folge auf dem Handy: Der runde „+“-Knopf erscheint nur noch auf Dashboard, TradeLog, Tagesansicht und der Prop-Übersicht mit Konten. Auch das doppelte „+“ auf Einstellungen → Konten verschwindet. Erreichbar bleibt „Trade loggen“ am Desktop überall über die Taste N (app.html:96, nachgeprüft), dazu über Dashboard, TradeLog, Tagesansicht und die Fortschritt-Checkliste; ▷ über TradeLog, Tagesansicht und die Checkliste. Vorbild ist deine Entscheidung fürs Schatten-Ich (shadow.js:104, README:223). Auf Statistiken braucht der Leerzustand „Zustand“ dafür einen eigenen Session-Knopf (Nr. 42). README:89 anpassen. Ohne diesen Punkt müsste auf dem Handy das ▷ von News, Coupons, Affiliate und Prop aus seiner eigenen Zeile in die Titelzeile wandern.
2. **Runder „Trade loggen“-Knopf auf dem Handy wieder gefüllt, ohne Schein** · Regel 2 · Aufwand S · vorher entscheiden: E2
   - Wo: Alle Handy-Screens mit dem runden „+“ (nach Nr. 1: Dashboard, TradeLog, Tagesansicht, Prop-Übersicht)
   - Änderung: Die Handy-Regel (app.css:3019) setzt einen gefüllten Kreis; `.btn.accent` (app.css:3137, gleiche Spezifität, steht später) überschreibt sie. Heute ist der Knopf deshalb ein dunkler Kreis mit grünem Ring. Das passt zu deiner Entscheidung „Trade loggen ruhiger“ (Commit 96b165b), deshalb nur mit deiner Zustimmung (E2). Umsetzung: Selektor auf `.dash-head .btn.accent.tl` heben, Fläche grün, Plus in Akzent-Tinte. Den grünen Schein aus 3019 streichen, nur der neutrale Schatten bleibt. Desktop unverändert.
3. **Dashboard: Grün nur noch auf „Trade loggen“** · Regel 2, 4 · Aufwand S · vorher entscheiden: E3
   - Wo: Dashboard voll, Bearbeiten, Titelzeile mit aktivem Filter (Desktop und Handy)
   - Änderung: (1) Die gefüllten Knöpfe der Bereichs-Widgets werden umrandet (`btn sm` bzw. `btn`): Ruhepunkt „Starten“, Mentor „Einrichten“ bzw. „Zum Mentor“, Prop-Konten „Konto anlegen“, Schatten-Ich „Regelwerk festlegen“, Blind-Replay „Session starten“ (widgets.js:334, 343, 354, 365, 373, 374). Auf ihren eigenen Seiten bleiben sie gefüllt. (2) `.more-link` („Mehr anzeigen“, viermal „Öffnen“, Regel-Tracker) bekommt statt Akzent die vorhandene neutrale Textfarbe (app.css:1659, so wie README:207 Grün begrenzt). (3) Der aktive Filter bleibt `.btn`; den Zustand zeigt allein der neutrale Zähler (dashboard.js:124, README:207). Danach ist „Trade loggen“ der einzige grüne Knopf des Dashboards. Teil (1) haben die Prüfer ergänzt: Die Bereichs-Widgets fehlen in den Atlas-Aufnahmen nur wegen der Scroll-Einblendung, im Standard-Layout sind sie da.
4. **TradeLog ohne Trades: nur der Leerzustand** · Regel 4, 5 · Aufwand S
   - Wo: TradeLog leer (Desktop, Handy)
   - Änderung: Ohne Trades im Zeitraum entfallen Filterzeile, die vier Kacheln „Noch keine Daten“ und „0 von 0 Trades“; ohne einen einzigen Trade im Konto auch das Kopfreihen-„CSV importieren“ und (Nr. 26) das Kopfreihen-„Trade loggen“. Es bleibt die Leer-Karte mit „Trade loggen“ (gefüllt) und „CSV importieren“ (umrandet); diese Stufung stimmt schon. Findet nur ein Filter nichts, bleibt die Filterzeile. Filter und Kacheln kommen mit dem ersten Trade im Zeitraum zurück, ein gesetzter Filter bleibt gespeichert. Die Knöpfe der Leer-Karte sind heute 50 px hoch mit 34-px-Symbolen; das behebt Nr. 6. Genau dein Wunsch: „TradeLog leer: nur CSV importieren / Trade loggen“.
5. **Trade-Detail: „Plan & Bewertung“ als einziger gefüllter Knopf, oben** · Regel 1, 4 · Aufwand S · vorher entscheiden: E6
   - Wo: Trade-Detail (Desktop, Handy)
   - Änderung: In die Kopfzeile („← TradeLog · Datum“) rechts: „Plan & Bewertung“ (`.btn.sm.primary`, füllt das Journal: Plan, Setup, Bewertung, Fehler, Tags, Notiz) und daneben „Trade bearbeiten“ (`.btn.sm`, nur Ausführungsdaten). Der Fuß verliert „Bearbeiten“; „Notiz im Notebook“ bleibt umrandet, „Löschen“ bleibt `.btn.sm.danger` rechts außen, jetzt nicht mehr neben einem Primärknopf. „30 Sekunden aufnehmen“ wird umrandet. Die Karten-Knöpfe heißen „Plan bearbeiten“ und „Tags bearbeiten“ (ghost). Heute liegt der Fuß mit dem gefüllten „Bearbeiten“ bei 1440×900 unter der Falz (y≈1390) und auf dem Handy nach etwa drei Bildschirmen, und „30 Sekunden aufnehmen“ ist ebenfalls gefüllt. README:39 anpassen.
6. **Ablage- und Leer-Symbole auf Symbolgröße begrenzen (Fehlerbehebung)** · Regel 2 · Aufwand S
   - Wo: CSV-Import Schritt 1, Screenshot-Ablagen im Trade-Detail, Sicherung einspielen, alle Leer-Karten mit Knöpfen
   - Änderung: `.dropzone svg` bekommt Größe und Farbe der Leer-Symbole (`display:block; width/height 28px; margin: 0 auto 8px`). Heute misst das Symbol im CSV-Dialog 984 px, im Trade-Detail 287 px, beim Einspielen einer Sicherung ~300 px und füllt den Dialog. Dazu `.empty svg` → `.empty > svg` (app.css:676), damit Symbole in Knöpfen der Leer-Karten nicht auf 34 px aufgeblasen werden. Kein neues Styling.
7. **Tagesansicht: ein Akzentknopf „Trade loggen“, die Datumszeile nur noch Navigation** · Regel 1, 3, 4 · Aufwand S · vorher entscheiden: E5
   - Wo: Tagesansicht mit Trades, heute leer, vergangener Tag leer (Desktop, Handy)
   - Änderung: Der Kopfreihen-Knopf „Trade loggen“ (Akzent, auf dem Handy der runde Knopf) belegt auf vergangenen Tagen das Datum vor (`new-trade-day`), heute bleibt `new-trade` mit der aktuellen Uhrzeit (`new-trade-day` würde 09:00 setzen). „+ Trade für diesen Tag“ in der Datumszeile entfällt, seine Aufgabe übernimmt dieser Knopf. „Check-in“ verlässt die Datumszeile; er bleibt in der Check-in-Karte („Check-in nachtragen“ bzw. „Bearbeiten“) und heute zusätzlich über ▷. Zertifikat: Nr. 28. Datumszeile danach: ‹ › Datum und „Heute“ (ghost) bzw. die Heute-Pille; auf dem Handy zwei bis drei statt vier bis fünf Steuerzeilen. Bei ungültigem Datum der normale Knopf (kein Absturz).
8. **Zweiter gefüllter Knopf auf einer Seite wird umrandet** · Regel 2, 4 · Aufwand S
   - Wo: Tagesansicht („Tagesnotiz anlegen“, alle Zustände), Einstellungen → Profil („2FA aktivieren“), Notebook leer (zweites „Neue Notiz“), Prop → Konten (Ampel-„Speichern“), Coach-Übersicht („+ Gruppe“)
   - Änderung: Jeweils `.btn.primary` → `.btn` (bzw. `.btn.sm`), die Funktion bleibt. „Tagesnotiz anlegen“ ist heute der einzige gefüllte und durch das 34-px-Symbol größte Knopf der Tagesansicht; er wird umrandet und verliert das Plus wie seine Nachbarn „Check-in nachtragen“ und „Regeln anlegen“. „2FA aktivieren“ (Platzhalter) und „Passwort zurücksetzen“ kommen in einen Block „Sicherheit“ in derselben Zeilenform wie die Datenzeilen; im Profil bleibt nur „Speichern“ gefüllt. Notebook: „Neue Notiz“ in der leeren rechten Spalte wird umrandet und bleibt, weil er auf dem Handy dort die einzige Bedienung ist. Prop → Konten: Ampel-„Speichern“ umrandet. Coach: „+ Gruppe“ bleibt nur in der ganz leeren Übersicht gefüllt; sobald es in irgendeiner Rolle eine Gruppe gibt, ist er umrandet.
9. **Reiterleisten: nur der aktive Reiter ist eine Fläche** · Regel 4 · Aufwand S
   - Wo: Statistiken (alle Reiter, Desktop und Handy); ebenso TradeLog-Reiter und Widget „Letzte Trades“
   - Änderung: Nicht aktive Reiter werden `btn ghost` (Text), der aktive behält die flache Auswahlfläche (app.css:3126-3131). Aus 14 gleichen Pillen über dem Inhalt werden 6; auf dem Handy liest sich die abgeschnittene Leiste als Navigation. Dieselbe Stufe in U.tabs (ui.js:183) und widgets.js:257, damit die Rolle „Reiter“ überall gleich aussieht. Alle neun Reiter bleiben.
10. **Statistiken ohne abgeschlossene Trades: eine Botschaft für die ganze Seite** · Regel 5 · Aufwand S
   - Wo: Statistiken leer (Desktop, Handy; jede Reiter-Route)
   - Änderung: Keine Kurve, keine Reiter, nur ein Leerzustand. Ohne Trades: „Noch keine abgeschlossenen Trades“ und „Trade loggen“ (`.btn.sm.primary` wie im TradeLog, der einzige gefüllte Knopf). Mit Trades außerhalb des Zeitraums: „Außerhalb von „Oktober 2026“ liegen n abgeschlossene Trades.“ und „Gesamten Zeitraum anzeigen“ (umrandet, neue kleine Aktion `range-preset` in app.js, auch für andere Bereiche nutzbar). Zeitraum und Konto bleiben in der Kopfreihe, im zweiten Fall sind sie die Lösung. Die Reiter erscheinen mit den Daten.
11. **Fortschritt: Tages-Checkliste vor die Heatmap** · Regel 1 · Aufwand S · vorher entscheiden: E9
   - Wo: Fortschritt voll (Desktop, Handy)
   - Änderung: Reihenfolge: Kacheln → Checkliste „Dein Tag“ (links) mit Regeln/Disziplin/Tilt (rechts) → „Trading-Aktivität“ → „Regeln im Detail“. Die Checkliste ist der einzige bedienbare Teil und steht bei 1440×900 dann ab y≈340 statt ≈840; auf dem Handy rückt sie von ~1140 auf ~760 px. Es fällt nichts weg.
12. **Blind-Replay ohne bereite Trades: der tote Knopf wird der eine hilfreiche** · Regel 5 · Aufwand S
   - Wo: Replay-Startkarte leer (Desktop, Handy), Übersicht ohne bereite Trades, Dashboard-Widget „Blind-Replay“
   - Änderung: Statt eines deaktivierten, halb transparenten grünen „Session starten“: ohne geschlossene Trades „Trade loggen“ (gefüllt), mit Trades ohne Vorher-Screenshot „Screenshot vor Entry hinzufügen“ (gefüllt, öffnet den zuletzt geschlossenen Trade); darunter genau ein Satz. Die Klasse rh-start bleibt (volle Breite auf dem Handy). Das Dashboard-Widget bekommt dieselbe Logik. Test replaytest.js:12 anpassen.
13. **Ruhepunkt-Übungen: nur ein gefüllter Knopf, erst die Übung, dann „Weiter“** · Regel 4 · Aufwand S
   - Wo: Ruhepunkt: Atem- und Countdown-Schritte (vor 1/3/5, nach 2, akut 1/2), Desktop und Handy
   - Änderung: Solange die Übung nicht beendet ist, ist der Übungsknopf („Starten“, „60 Sekunden starten“, „Pause starten“) gefüllt und „Weiter“ nur `.rp-btn`; nach Ende (`rp:done`) tauschen sie (Übung → „Noch einmal“ als `.rp-ghost`). Akut 2: „Speichern und schließen“ wird erst nach Ende der 15-Minuten-Pause primär; während die Pause läuft, ist auch „Pausieren“ ghost. Dazu gehört ein eigener Fehler, den dieser Punkt nicht behebt: „Speichern und schließen“ beendet heute eine laufende Pause still (ruhepunkt.js:769-781).
14. **Prop Firms: Kopfreihe je Reiter, ein „Konto anlegen“ statt drei** · Regel 1, 4, 5 · Aufwand S
   - Wo: Prop Übersicht (voll, leer, Handy), Bilanz, Friedhof (leer), Konten (leer, Handy)
   - Änderung: Kopfreihe als Getter: „Trade loggen“ nur in der Übersicht mit Konten, kein ▷, kein Zeitraum, kein Konto. Dort steht tertiär „Konto anlegen“ (ghost); bis 960 px (Handy, Tablet) ist er ausgeblendet und über den Reiter Konten erreichbar. Bilanz, Friedhof, Konten und alle leeren Zustände haben keine Kopf-Werkzeuge (die leere Reihe entfällt mit Nr. 1); „Trade loggen“ und ▷ bleiben wie in Nr. 1 erreichbar, ein laufender Session-Timer ist hier wie im Schatten-Ich nicht zu sehen. Leere Übersicht, leere Konten und Friedhof ohne Konten: ein Satz „Lege dein erstes Prop-Konto an, dann siehst du hier Balance, Puffer und den Weg zum Payout.“ und ein gefüllter „Konto anlegen“. Die leere Konten-Liste hat keinen Kartenkopf-Knopf und zeigt „Ampel und Stop-Größe“ erst mit dem ersten Konto (vorher ohne Wirkung). Friedhof: „im Cockpit“ → „in der Übersicht“. Heute stehen dort bis zu vier „+“ mit zwei Bedeutungen. README Prop ergänzen.
15. **Coach als Schüler: die offene Aufgabe zuerst** · Regel 1 · Aufwand S
   - Wo: Coach-Übersicht als Schüler (Desktop, Handy)
   - Änderung: Für reine Schüler mit offenen Aufgaben steht die Aufgaben-Karte ganz oben (volle Breite), dann „Als Schüler“, dann „Als Mentor“. Ohne offene Aufgaben zuerst die Rollen-Karten, eine leere Aufgaben-Karte steht nicht oben. „+ Gruppe“ ist umrandet (Nr. 8). Mentoren und gemischte Rollen bleiben wie heute.
16. **Schüler-Journal: „Notiz senden“ erst, wenn Text da ist** · Regel 4 · Aufwand S
   - Wo: Coach → Journal eines Schülers (Desktop, Handy)
   - Änderung: Heute steht unter jedem Eintrag ein gefüllter grüner Knopf, auch deaktiviert; bei 30 Einträgen sind es 30. Der Knopf ist `hidden`, bis das Feld Text hat; sichtbar ist dann nur der eine gefüllte Knopf, an dem man gerade schreibt. Handy: je Eintrag ~40 px weniger.
17. **„Aufgabe geben“ als Dialog statt offenem Formular** · Regel 3 · Aufwand S
   - Wo: Coach → Journal eines Schülers (Desktop, Handy)
   - Änderung: Das stets offene Formular mit gefülltem „Aufgabe geben“ über allen Einträgen entfällt. Im Kartenkopf steht „Aufgabe geben“ (ghost, gleiches Symbol wie „Aufgabe an alle“) und öffnet denselben Dialog, verallgemeinert auf einen Schüler. Die Aufgabenliste bleibt sichtbar.
18. **Handy: Schülertabelle vor „Gruppe im Überblick“** · Regel 1 · Aufwand S
   - Wo: Coach → Gruppe auf dem Handy
   - Änderung: Nur unter 560 px: `.coach-gstats { order: 1 }`. Die Schüler-Karte (Hauptaktion: Schüler öffnen) steht dann vor den sechs Kacheln; heute beginnt sie bei ≈770 px. Desktop bleibt „Kennzahlen, dann Tabelle“.
19. **Dashboard leer: ein Block mit einem Satz, einem Hauptknopf und leisen Nebenwegen** · Regel 1, 4, 5 · Aufwand M
   - Wo: Dashboard leer, Titelzeile leer
   - Änderung: Ohne einen einzigen Trade (über alle Konten) steht statt Banner, Kopfreihe und Raster nur eine Karte: Titel „Willkommen“, Satz „Dein Journal ist noch leer. Logge deinen ersten Trade.“, dazu „Trade loggen“ (gefüllt), „CSV importieren“ (umrandet) und „Beispieldaten laden“ (ghost). Zeitraum, Konto, Filter, Vorlage und Zertifikat erscheinen mit dem ersten Trade, Import oder den Beispieldaten; ein gesetzter Filter bleibt zurücksetzbar. Raster und Vorlage bleiben gespeichert; die Bereichs-Widgets bleiben über die Seitenleiste erreichbar, die Beispieldaten auch in den Einstellungen. Heute stehen dort fünf gefüllte Knöpfe gegen ein getöntes „Trade loggen“. Nebenbei behoben: Das Banner meldet heute „Journal leer“, auch wenn nur das gewählte Konto leer ist. Falls du den Block nicht willst, mindestens: „Beispieldaten laden“ auf ghost, ein Willkommens-Satz statt drei Optionen, leere Widgets ohne Pfeile, „Heute“ und Reiter, und ohne den falschen Hinweis „ändere den Zeitraum“.
20. **„Trade loggen“: Punktwert, Gebühren und Prop-Konten hinter „Mehr Optionen“** · Regel 3 · Aufwand M · vorher entscheiden: E7
   - Wo: Dialog „Trade loggen“ (leer, Long, Handy, Bearbeiten)
   - Änderung: Sichtbar bleiben Symbol, Richtung, (Konto), Einstieg/Ausstieg/Kontrakte, Eröffnet/Geschlossen und der Fuß („Trade speichern“ gefüllt, „Abbrechen“ umrandet). Punktwert, Gebühren und Prop-Konten kommen in eine Aufklappzeile „Mehr Optionen · Punktwert 20 · Gebühren 0 $ …“ (aktuelle Werte im Text, Muster wie „Oder Text einfügen“, app.js:560). Offen ist sie, wenn du sie zuletzt offen gelassen hast (gemerkt), wenn beim Bearbeiten Gebühren, eine Prop-Zuordnung oder ein abweichender Punktwert gesetzt sind, oder wenn ein Symbol ohne bekannten Punktwert gewählt wird. Nur zusammen mit Nr. 63, sonst blockiert ein ungültiges verstecktes Feld still. Stop, Ziel, Setup, Notizen und Screenshots stehen schon heute nicht hier, sondern in „Plan & Bewertung“. Auf dem Handy wird das Sheet ~230 px kürzer, „Trade speichern“ bleibt auch bei 667 px Höhe sichtbar.
21. **Leerer Tag: Kennzahlen weg, Regeln und Marktphase hinter „Mehr anzeigen“** · Regel 5 · Aufwand M · vorher entscheiden: E5
   - Wo: Tagesansicht heute ohne Trades, vergangener Tag ohne Trades (Desktop, Handy)
   - Änderung: Ohne Trades entfällt die Kennzahlen-Karte (P&L „—“, leere Sparkline, acht Nullen; auf dem Handy fast ein Bildschirm). Sichtbar bleiben der Leerzustand, die Check-in-Karte (heute oder mit Daten, direkt unter dem Leerzustand) und die Tagesnotiz-Karte. Regeln ohne Häkchen und Marktphase ohne Wahl erscheinen nach „Mehr anzeigen“ (ghost, je Tag gemerkt; vorhandene Texte „Mehr anzeigen“ und „Weniger“) oder sobald Daten da sind. Fehlt eine Karte, stehen die übrigen in voller Breite statt halb. Mit Trades bleibt alles wie heute. Regeln und Marktphase lassen sich zusätzlich beim Beenden der Session setzen.
22. **Schatten-Ich: Regelwerk eingeklappt, Ergebnis schneller sichtbar** · Regel 1, 3 · Aufwand M
   - Wo: Schatten-Ich voll, leer, Handy
   - Änderung: Die Reihenfolge bleibt, damit sich beim Schalten darüber nichts verschiebt (deine Entscheidung, shadow.js:57). Mit aktiven Regeln und ohne Warnung ist „Mein Regelwerk“ beim Betreten eine Zeile mit den aktiven Regeln („Max. 3 Trades pro Tag · Stopp nach 2 Verlusten …“) und „Regeln bearbeiten“ (umrandet); jede Änderung im offenen Raster hält es offen, beim Seitenwechsel klappt es zu. Leerzustand: „Noch keine Regel aktiv. Du kannst sie schon vor dem ersten Trade festlegen.“ mit „Vorschlag übernehmen“ (umrandet) und „Regeln einzeln wählen“ (ghost); aufgeklappt steht das Banner wie heute unter den Schaltern. Handy (≤1100 px): „Welche Regel kostet am meisten“ vor „Regelverstöße“ (CSS order). „Regelverstöße“ rückt am Desktop von ≈1190 auf ≈850 px, auf dem Handy von ≈1810 auf ≈1060 px.
23. **Bilanz: ein gefüllter Knopf „Ausgabe erfassen“; leer nur ein Satz und ein Knopf** · Regel 4, 5 · Aufwand M
   - Wo: Prop → Bilanz (voll, Formular offen, leer)
   - Änderung: „Ausgabe erfassen“ gefüllt, „Payout erfassen“ umrandet (auch beim Zurücksetzen nach dem Schließen); nur ein Formular gleichzeitig offen. Ohne Buchungen statt fünf Kacheln (mit grünem „erreicht“ bei 0 €), leerem Diagramm und zwei automatisch offenen Formularen nur: Titel „Noch keine Ausgaben oder Payouts“, Satz „Erfasse deine erste Challenge-Gebühr, dann zeigt die Bilanz Netto, ROI und Break-even.“, dazu „Ausgabe erfassen“ (gefüllt) und „oder Payout erfassen“ (ghost, nur mit Konten); der Payout-Planer bleibt eingeklappt darunter. Ab der ersten Buchung erscheint die volle Bilanz. README Prop ergänzen.
24. **Prop-Dialoge und -Formulare: Pflichtfelder vorn, der Rest hinter „Mehr Optionen“** · Regel 3, 5 · Aufwand M · vorher entscheiden: E11
   - Wo: Konto anlegen/bearbeiten, Eigenes Preset, Formulare „Ausgabe/Payout erfassen“
   - Änderung: Konto anlegen: sichtbar Preset (nur mit eigenen Presets), Firma, Konto, Kontogröße, Phase, Daily-Loss-Wert, Drawdown-Wert und -Typ, Profit Target (Challenge) bzw. Payout-Bedingungen (Funded). Gut 20 weitere Felder kommen in einen gemeinsamen Baustein „Mehr Optionen“; Lock-Felder nur bei „Trailing mit Lock“, Profit Target/Payout je Phase (nur `hidden`, Werte bleiben). Info-Banner als Hinweiszeile. „Konto anlegen“ steht beim Öffnen (1440) im Bild, heute erst nach 30 Feldern. Preset-Dialog genauso (ohne Phasen-Logik, im Ansehen-Modus offen; „Preset löschen“ wie in Nr. 69). Payout-Formular: Konto, Brutto, Beantragt sichtbar, Split/Netto/Erhalten/Status in „Mehr Optionen“; Ausgabe: Firma nur, solange kein Konto gewählt ist, Notiz in „Mehr Optionen“. Achtung: Reset-Uhrzeit und Zeitzone sind dann versteckt; Presets sollten sie füllen.

### Wirkung mittel

25. **Konto-Knopf erst ab zwei Konten** · Regel 5 · Aufwand S · vorher entscheiden: E4
   - Wo: Dashboard-Titelzeile, Kopfreihen von Statistiken, Fortschritt, Schatten-Ich, TradeLog, Tagesansicht; Konto-Menü
   - Änderung: accountControl (app.js:242) gibt bei einem einzigen Konto nichts aus; Knopf und Menü (Alle Konten, Konten, Konten verwalten) erscheinen unverändert ab dem zweiten Konto, mit derselben Logik, die „Alle Konten“ schon hat. Ausnahme Mentor: Dort bleibt der Knopf mit dem Hinweis „Der Mentor sieht die letzten 20 Trades dieses Kontos“ (deine Entscheidung #8). „Konten verwalten“ bleibt unter Einstellungen → Konten. README:62 und :144 ergänzen.
26. **Leeres Konto: Kopfreihe ohne Zeitraum, Session und zweites „Trade loggen“** · Regel 5 · Aufwand S
   - Wo: Kopfreihe aller Seiten im leeren Zustand (TradeLog, Statistiken, Fortschritt, Schatten-Ich) und Titelzeile des Dashboards
   - Änderung: Hat das gewählte Konto keinen einzigen Trade, rendert pageHead weder Zeitraum noch ▷. Die Konto-Wahl folgt Nr. 25 (ab zwei Konten immer sichtbar, damit man zu einem Konto mit Trades zurückkommt). Im TradeLog fällt in diesem Zustand auch das Kopfreihen-„Trade loggen“ weg (auf dem Handy der runde Knopf): „Trade loggen“ steht dann genau einmal, gefüllt in der Leer-Karte. Gibt es Trades nur außerhalb des Zeitraums, bleibt alles, denn dann hilft der Zeitraum. Für die Titelzeile des Dashboards gilt dieselbe Bedingung (Zeitraum und Filter erst mit Trades im gewählten Konto, ein aktiver Filter bleibt zurücksetzbar); ganz ohne Trades in allen Konten greift Nr. 19. Mit dem ersten Trade ist alles wieder da. Den echten Leerzustand sieht man erst nach „Beispieldaten entfernen“.
27. **☰ auf dem Desktop wirklich ausblenden** · Regel 5 · Aufwand S
   - Wo: Titelzeile Desktop, eingeklappte Seitenleiste
   - Änderung: `.menu-btn{display:none}` (app.css:224) verliert gegen `.btn{display:inline-flex}` (app.css:267): Der ☰ ist sichtbar und tut nichts. Regel auf `.topbar .menu-btn` heben und im Block bis 960 px ebenso `.topbar .menu-btn { display: inline-flex }`. Einklappen bleibt über das Symbol in der Leiste, auf dem Handy bleibt ☰.
28. **Zertifikat überall als Symbol-Werkzeug und nur, wenn es etwas zu zertifizieren gibt** · Regel 4, 5 · Aufwand S
   - Wo: Statistiken (voll, leer), Tagesansicht (alle Zustände), Dashboard (leer)
   - Änderung: Statistiken: Der beschriftete Caret-Knopf „Zertifikat ▾“ wird das Schild-Symbol wie auf dem Dashboard (Popover bleibt). Tagesansicht: „Zertifikat“ verlässt die Datumszeile und steht als Symbol in der Kopfreihe, nur wenn der Tag abgeschlossene Trades hat. Dashboard und Statistiken: Symbol erst, wenn es Trades gibt (Statistiken: abgeschlossene); ohne Trades zeigt der Dialog ohnehin nur „Keine Trades“. Mit dem ersten (abgeschlossenen) Trade erscheint das Symbol an derselben Stelle. Stufe wie die übrigen Symbol-Werkzeuge (Nr. 31). Test certtest.js:54 auf einen Tag mit Trades umstellen.
29. **Zertifikat-Menü: der letzte Handelstag und konkrete Zeiträume** · Regel 1, 5 · Aufwand S · vorher entscheiden: E8
   - Wo: Zertifikat-Menü (Dashboard-Schild, Statistiken)
   - Änderung: „Daily Profit“ bezieht sich auf den jüngsten Tag mit Trades (≤ heute) statt auf heute; Woche und Monat auf dessen Woche/Monat. Rechts steht der konkrete Zeitraum („Do 08.10.“, „KW 41“, „Okt 2026“) statt „Tag/Woche/Monat/Stats“. Auf Statistiken steht „Performance“ (rechts der gewählte Zeitraum, z. B. „Oktober 2026“) zuerst; Tag, Woche und Monat folgen unter einer Trennlinie. Keine grüne Markierung eines Eintrags.
30. **Zertifikat ohne Trades im Zeitraum: ein Satz, ein Knopf** · Regel 5 · Aufwand S
   - Wo: Zertifikat-Dialog leer (Desktop, Handy)
   - Änderung: Heute ist das deaktivierte, halb transparente „PNG herunterladen“ die stärkste Fläche. Format, Häkchen, Auflösungshinweis und Export erscheinen erst, wenn der Zeitraum Trades hat. Im Leerzustand genau ein gefüllter Knopf, je Art: „Zum letzten Handelstag“, „Zur letzten Woche mit Trades“, „Zum letzten Monat mit Trades“, „Gesamten Zeitraum zeigen“ (springt rückwärts, Hilfsfunktion mit Nr. 29 teilen). Ohne jeden Trade nur der Satz.
31. **Symbol-Werkzeuge der Kopfreihe tertiär (ghost)** · Regel 3, 4 · Aufwand S
   - Wo: Dashboard voll und Handy; alle Kopfreihen mit ▷
   - Änderung: Vorlage und Zertifikat (dashboard.js:125) und das ▷ der übrigen Kopfreihen (sessionControl, app.js:250) werden `btn ghost icon-only` statt gerahmt, bei gleicher Größe und mit denselben Symbolen. Rechts ist dann nur „Trade loggen“ umrandet und getönt. Kein ⋯-Menü (README:64 „Vorlage und Zertifikat als Symbole“ bleibt).
32. **Filter-Fenster: seltene Zeilen eingeklappt, „Zurücksetzen“ erst bei Bedarf** · Regel 3 · Aufwand S
   - Wo: Dashboard-Filter (Desktop, Handy)
   - Änderung: Bereich „Trade“ zeigt Symbol, Richtung, Ergebnis. Offen/Geschlossen, Intraday/Multiday, Reviewed und Bewertung kommen in eine eigene, eingeklappte Gruppe direkt darunter (öffnet sich mit aktiven Werten von selbst; in GROUP_KEYS eintragen, Gruppen-ID nicht „status“). „Zurücksetzen“ erscheint erst mit dem ersten gesetzten Wert, wie im Zeitraum-Menü. „Anwenden“ bleibt der eine gefüllte Knopf. README:77-80 anpassen.
33. **Widget hinzufügen: „Hinzugefügt“ still, Wählbares zuerst** · Regel 4, 5 · Aufwand S · vorher entscheiden: E17
   - Wo: Panel „Widget hinzufügen“
   - Änderung: „Hinzugefügt“ ohne Akzentfläche und -schrift (muted mit Haken; die Regel app.css:1618 ändern, die Klasse allein reicht nicht). Innerhalb jeder Gruppe stehen die beim Öffnen noch wählbaren Widgets oben (Sortierung nach dem Stand beim Öffnen, damit beim Hinzufügen nichts springt). Gruppe „Auswertungen“ vor „Bereiche der App“.
34. **Dialoge: der eine gefüllte Knopf ist der, für den man den Dialog öffnet** · Regel 2, 4, 5 · Aufwand S
   - Wo: Notiz teilen; Co-Coaches; Symbol-Liste im „Trade loggen“; Trades zuordnen (Prop)
   - Änderung: Notiz teilen: „Link kopieren“ gefüllt (rechts), „Öffnen“ umrandet (heute umgekehrt). Co-Coaches: „Kopieren“ gefüllt, „Fertig“ umrandet (heute kein gefüllter Knopf). Symbol-Liste: „OK“ umrandet, Enter bleibt der Hauptweg; „Trade speichern“ bleibt der einzige gefüllte Knopf. Trades zuordnen: „Alle“/„Keine“ ghost und erst ab zwei Trades; ohne Trades nur „Trade loggen“ (gefüllt, schließt erst diesen Dialog) statt „Abbrechen“ und „Speichern“ (das X schließt weiter); Erklärsatz „Die letzten 50 Trades; ältere ordnest du im Trade-Editor zu.“
35. **Dialoge: Startfokus nie auf dem Schließen-X** · Regel 2 · Aufwand S
   - Wo: Alle Dialoge mit Standard-Kopf: Konto, Tag, Sicherung, Prop-Konto/Preset/Zuordnen, Hinweise, Bestätigungen, Ruhepunkt-Hilfe
   - Änderung: U.modal (ui.js:434) wählt beim Öffnen: mit feinem Zeiger das erste sichtbare Feld; bei Bestätigungen mit rotem Knopf „Abbrechen“; sonst den gefüllten Fußknopf; das X nie. Auf Touch keine Textfelder (keine aufspringende Tastatur im Bottom-Sheet). Für Sonderfälle eine Option `focus` (z. B. Prop-Konto: Preset bzw. Firma). „Trade loggen“ und Sprachnotiz bleiben ohne Startfokus (noFocus). Der grüne Ring am X ist nur bei Tastaturbedienung sichtbar, dort liegt vor allem der Gewinn.
36. **TradeLog-Leerkarten: je ein Satz und der eine passende Knopf** · Regel 1, 5 · Aufwand S
   - Wo: Reiter Trades (kein Trade überhaupt, Zeitraum leer, Filter ohne Treffer), Reiter Tage leer
   - Änderung: Kein Trade überhaupt: „Noch keine Trades“ + „Trade loggen“ (gefüllt) + „CSV importieren“. Trades nur außerhalb des Zeitraums: Titel „Keine Trades im Zeitraum“, Satz „Wähle einen anderen Zeitraum.“ + „Zeitraum ändern“ (umrandet, öffnet das vorhandene Zeitraum-Menü). Filter ohne Treffer: „Ändere die Filter.“ + „Filter zurücksetzen“ (umrandet, vorhandene Aktion). Reiter Tage: derselbe Knopf je Fall; nur offene Trades → kein Knopf. Neue Texte in js/lang/*.
37. **„CSV importieren“: ein Symbolknopf, auf dem Handy erreichbar, nur im Reiter Trades** · Regel 3, 5 · Aufwand S
   - Wo: TradeLog Kopfreihe (Desktop, Handy, Reiter Verpasste)
   - Änderung: Der Kopfreihen-Knopf wird `btn icon-only` mit Titel und aria-label wie ▷, ohne `hide-m`; mit Daten ist der Import heute auf Handy und Tablet nirgends erreichbar. Im Reiter „Verpasste Trades“ (importiert keine verpassten Trades) und ohne Trades (die Leer-Karte bietet ihn) wird er nicht gerendert. Rechts ist dann „Trade loggen“ der einzige Textknopf.
38. **Reiter „Verpasste Trades“: der eine Knopf an der richtigen Stelle** · Regel 2, 5 · Aufwand S
   - Wo: TradeLog → Verpasste Trades (leer, voll)
   - Änderung: Leer: „Verpassten Trade notieren“ (umrandet) in die Leer-Karte, ein Satz statt zwei; der Knopf neben den Reitern entfällt in diesem Zustand. Voll: der Knopf in normaler Größe (`.btn` statt `.btn.sm`), kein Grün. Nebenbefund: Die Liste ist nicht nach Zeitraum gefiltert, Kacheln und Zeitraum haben im Reiter keinen Bezug.
39. **Zeitraum und Konto nur, wo sie filtern** · Regel 5 · Aufwand S
   - Wo: Tagesansicht (alle Zustände), Trade-Detail
   - Änderung: Tagesansicht: `head: { range: false }`, denn sie nutzt den Zeitraum nirgends; das Konto bleibt und wird auf dem Handy sichtbar (wie beim Mentor). Trade-Detail: ohne Zeitraum und Konto; pageHead nimmt `head` dafür auch als Funktion (Detail → aus, Liste → wie bisher). Muster: Notebook, News, Coupons. README:108 ergänzen.
40. **Handy: kein runder „+“-Knopf über Notebook und Trade-Detail** · Regel 4, 5 · Aufwand S · vorher entscheiden: E1
   - Wo: Notebook (Liste, Ordner) und Trade-Detail auf dem Handy
   - Änderung: Die vorhandene Regel „kein runder Knopf über dem Text“ (app.css:3017, heute nur Notiz-Ansicht) gilt für das ganze Notebook (`.content:has(.nb)`) und für die Trade-Detailseite (`.content:has(.detail-head)`). Dort wollen die Screens „Neue Notiz“ bzw. „Plan & Bewertung“; ein zweites grünes „+“ mit anderer Bedeutung entfällt. „Trade loggen“ bleibt im TradeLog einen Tipp entfernt. Mit Nr. 1 entfällt der Knopf im Notebook ohnehin. Berührt README:89 („runder Knopf unten rechts“), deshalb zusammen mit E1 entscheiden.
41. **Kumulativ-Kurve nur auf Übersicht und Tage, unter den Reitern** · Regel 5 · Aufwand S
   - Wo: Statistiken: Setups, Zeit, Fehler, Marktphase, Zustand, Edge-Check, Monte Carlo
   - Änderung: Die Reiterleiste steht immer direkt unter der Kopfreihe (springt beim Reiterwechsel nicht, README:359). Die Kurve wird Teil des Inhalts von Übersicht und Tage; alle anderen Reiter beginnen ~300 px höher. Am deutlichsten beim Reiter Zustand (Check-in-Werte unter einer P&L-Kurve).
42. **Reiter-Leerzustände: der eine passende Knopf** · Regel 1 · Aufwand S
   - Wo: Statistiken: Marktphase leer, Zustand leer, Monte Carlo leer
   - Änderung: Marktphase: ein Satz und „Letzten Handelstag öffnen“ (umrandet; Ziel ist der letzte Tag im Zeitraum mit Trades, denn heute ohne Trades zählt nicht). Zustand: ein Satz und „Session starten“ (umrandet; bei laufender Session kein Knopf und ein angepasster Satz). Das ist Pflicht, sobald ▷ auf Statistiken wegfällt (Nr. 1). Monte Carlo: „Aktuell n von 10 abgeschlossenen Trades.“ statt des Methodensatzes, kein Knopf.
43. **Edge-Check bei „Zu wenig Daten“: keine leere Kurvenkarte** · Regel 5 · Aufwand S
   - Wo: Statistiken → Edge-Check
   - Änderung: Die Karte „Rollierender Edge“ samt Untertitel (Standardabweichung aus zu wenigen Trades) erscheint erst, wenn es eine Kurve gibt (20 Trades mit R). Bis dahin trägt die Kachel „Urteil“ die Botschaft; „Nötige Stichprobe“ bleibt (andere Aussage).
44. **Notiz: „Teilen“ ins …-Menü, Verschieben als zweiter Schritt** · Regel 3 · Aufwand S
   - Wo: Notiz offen (Desktop, Handy), …-Menü der Notiz
   - Änderung: „Teilen“ verlässt die Kopfzeile der Notiz und steht im …-Menü; bis 560 px ist Teilen heute gar nicht erreichbar (app.css:3009). Menü: „In Ordner verschieben …“ (zweiter Schritt im selben Menü, kein verschachteltes Popover), Teilen, Duplizieren | Aus Datei laden, Exportieren (JSON), Als PDF | Löschen (rot). Heute stehen dort 10 Einträge (davon 5 Ordner), danach 7 einschließlich Teilen. README:96 anpassen.
45. **Leeres Notebook: Werkzeuge erst, wenn es etwas zu ordnen gibt** · Regel 5 · Aufwand S
   - Wo: Notebook leer (eine Notiz, leerer Ordner, leerer Papierkorb)
   - Änderung: Auswählen, Sortieren und Filter erst ab zwei Notizen (gezählt ohne Suche; aktive Filter bleiben sichtbar und aufhebbar). Abschnitt „Tags“ erst mit dem ersten Tag (erscheint sofort, ohne Neuaufbau). Platzhalter „Noch keine eigenen Ordner“ und „Kürzlich gelöscht“ bei leerem Papierkorb entfallen; der Link erscheint, sobald etwas gelöscht ist. „Neue Notiz“ bleibt der eine gefüllte Knopf.
46. **Fortschritt-Checkliste: Abschnitte nur mit Inhalt** · Regel 5 · Aufwand S
   - Wo: Fortschritt voll und leer
   - Änderung: Der Regelblock der Checkliste erscheint nur mit Regeln (die Aufforderung steht einmal in „Aktuelle Regeln“). „Automatische Regeln“ (Überschrift und Liste) erst ab dem ersten Trade des Tages; der gestrichelte Kasten „Noch keine Trades heute“ entfällt.
47. **Fortschritt leer: Auswertungen erst mit Daten, keine falschen Nullen** · Regel 5 · Aufwand S
   - Wo: Fortschritt leer (Desktop, Handy)
   - Änderung: Ohne abgeschlossene Trades fehlen „Disziplin pro Woche“ und „Dein Tilt-Profil“ („Aktuelle Regeln“ übernimmt `fill`, damit die Spalte so hoch bleibt wie die Checkliste). Heatmap-Pfeile erst mit einem aktiven Tag. „% Regeln eingehalten“ zeigt ohne Wert „—“ ohne Ring (heute „0 %“ mit grünem Punkt); „Heutiger Fortschritt“ zeigt immer Prozent („0 %“ statt „Keine Daten“).
48. **Regeln: eine Aufforderung mit dem richtigen Ziel** · Regel 4 · Aufwand S
   - Wo: Fortschritt leer und voll (Karte „Aktuelle Regeln“)
   - Änderung: Ohne Regeln nur „Regeln anlegen“ (umrandet); „Regeln bearbeiten“ erst mit Regeln. Beide Links auf #/settings/regeln statt #/settings.
49. **Schatten-Ich leer: „Trade loggen“ als einziger gefüllter Knopf** · Regel 4 · Aufwand S
   - Wo: Schatten-Ich leer
   - Änderung: Der Knopf im Leerzustand wird `.btn.sm.primary` wie im TradeLog-Leerzustand (heute gleich umrandet wie „Vorschlag übernehmen“). „Vorschlag übernehmen“ bleibt umrandet.
50. **Handy: Verstöße-Tabelle Datum · Symbol · Regel · Kosten** · Regel 5 · Aufwand S
   - Wo: Schatten-Ich auf dem Handy
   - Änderung: Unter 560 px die Spalten „Echt“ und „Schatten“ ausblenden und die Mindestbreite der Tabelle aufheben; heute liegt „Kosten“ rechts außerhalb. Ein Tipp auf die Zeile öffnet den Trade mit allen Werten.
51. **Blind-Replay: Fokusmodus während einer Runde** · Regel 4, 5 · Aufwand S
   - Wo: Replay-Karte (Entscheidung, Auflösung, Auswertung; Desktop und Handy)
   - Änderung: Solange eine Runde läuft (bis „Zur Übersicht“), keine Kopfreihe (Getter ownActions, wie beim Ruhepunkt). Die Karte rückt ~65 px nach oben, bei jeder der zehn Karten; ein Kontowechsel kann die Runde nicht mehr scheinbar beenden. Ausgang bleibt „Abbrechen“ (ghost) bzw. „Zur Übersicht“.
52. **Mentor-Chat: Verlaufswerkzeuge in ein …-Menü** · Regel 3, 5 · Aufwand S
   - Wo: Mentor-Chat (Desktop, Handy)
   - Änderung: „Verlauf neu laden“ und „Verlauf löschen“ (nur mit Nachrichten, mit der bisherigen Rückfrage) kommen in ein …-Menü im Kartenkopf (Muster coach.js:118). Auf dem Handy passt der Kartenkopf wieder in eine Zeile, der Chat gewinnt ~60 px. Senden bleibt der einzige gefüllte Knopf.
53. **Affiliate-Creator: Link primär, Code als Zeile darunter; ohne Kunden nur der Link** · Regel 4, 5 · Aufwand S
   - Wo: Affiliate → Creator-Ansicht (Desktop, Handy, ohne Kunden)
   - Änderung: Eine Teilen-Karte: „Dein Link“ als großes Ticket, darunter „oder Code“ mit Kopier-Symbol (ghost). Auf dem Handy eine Karte (~110 px) weniger, und der abgeschnittene Link steht nicht mehr gleich groß neben dem vollständigen Code. Ohne Kunden nur diese Karte und ein Satz (Provision im Satz); Kacheln, Null-Diagramm und leere Kundenliste ab dem ersten Kunden.
54. **Gruppe: Einladungsleiste nur ohne Schüler, dort mit gefülltem „Kopieren“** · Regel 1, 3, 5 · Aufwand S · vorher entscheiden: E3
   - Wo: Coach → Gruppe (leer, voll, Handy), Gruppen-Menü
   - Änderung: Ohne Schüler wird „Kopieren“ der Einladungsleiste gefüllt (kein zweiter Knopf im Leerzustand); Zeitraum-Segment und Stat-Hinweis erst mit Schülern („Aktualisieren“ bleibt). Mit Schülern verschwindet die Leiste; „Einladungslink kopieren“ ist erster Eintrag im …-Menü (Popover schließt; bei Kopierfehler erscheint die Leiste zum Markieren). Auf dem Handy ~140 px weniger über der Tabelle.
55. **Coach-Benachrichtigungen: ohne Gruppe weg, sonst eine Zustandszeile** · Regel 3, 5 · Aufwand S
   - Wo: Coach-Übersicht (leer, als Mentor, als Schüler, Handy)
   - Änderung: Ohne Gruppe gibt es die Karte nicht (heute die größte Karte des leeren Screens). Mit Gruppe: Titel mit Zustand („E-Mail aus · Browser aus“), Formular eingeklappt („Ändern“, Zustand gemerkt, weil Schalter neu aufbauen). E-Mail-Feld, Hinweis und „Speichern“ nur bei eingeschaltetem E-Mail-Schalter; Ausschalten speichert sofort.
56. **Antwortfeld unter Mentor-Notizen erst auf „Antworten“** · Regel 3 · Aufwand S
   - Wo: Coach → Journal (Desktop, Handy), Notebook (Mentor-Notiz, Sicht des Schülers)
   - Änderung: Ohne Verlauf und Entwurf steht statt des offenen Felds ein ghost-Knopf „Antworten“; er öffnet das Feld im DOM (ohne Neuaufbau, weil der Block im Notebook unter dem Editor steht; Zustand gemerkt) und fokussiert es.
57. **Gruppenzeilen: „Öffnen“ als Chevron** · Regel 4 · Aufwand S
   - Wo: Coach-Übersicht als Mentor (Desktop, Handy)
   - Änderung: Das umrandete „Öffnen“ je Gruppe wird ein ghost-Chevron; der Gruppenname bleibt Link. Hauptziel sind danach die Gruppenzeilen selbst (Name oder Chevron), wie es für eine Liste richtig ist. Keine klickbare ganze Zeile (bräuchte neues Hover-Styling).
58. **Einstellungen: Expertenwerte und Erklärtexte hinter Aufklappzeilen** · Regel 3, 5 · Aufwand S
   - Wo: Einstellungen → Trading, Benachrichtigungen, Design, Mentor
   - Änderung: Trading: Ruin-Schwelle, Monte-Carlo-Durchläufe und „1 R entspricht“ hinter „Mehr Optionen“ (offen bei Abweichung; ein ungültiger Wert öffnet die Zeile); „Was handelst du?“ als eigener Block hinter das Formular (die Auswahl wirkt nirgends). Benachrichtigungen: die 7 Bereichsschalter hinter „Bereiche einzeln wählen“ (offen, wenn einer aus ist); die zwei Recap-Schalter, um die es geht, stehen dann oben frei. Design: Einzel-Farbwähler hinter „Eigene Farben“ (offen bei eigenen Farben oder Break-even). Mentor: „So funktioniert es“ und die Sprachjournal-Technik eingeklappt. Gleiche summary-Form überall, Zustand gemerkt.
59. **Profil: ein „Speichern“, Zusatzfelder eingeklappt** · Regel 3, 4, 5 · Aufwand S
   - Wo: Einstellungen → Profil
   - Änderung: Privatsphäre wird ein Schalter (wirkt sofort, ohne Neuaufbau, damit getippte Profilfelder nicht verloren gehen) statt Häkchen mit eigenem „Speichern“. Adresse und Bio hinter „Weitere Angaben“ (offen, wenn befüllt; werden nirgends sonst genutzt). Profilbild-„Entfernen“ nur, wenn es ein Bild gibt.
60. **Inhalte: „Tags“ zuerst, „+ Tag hinzufügen“ im Bereichskopf** · Regel 1, 5 · Aufwand S
   - Wo: Einstellungen → Inhalte (Desktop, Handy)
   - Änderung: Standard-Reiter ist „Tags“ (Kategorien als zweiter Reiter; heute öffnet der Bereich mit einer reinen Lesetabelle). „+ Tag hinzufügen“ (gefüllt) steht im Bereichskopf auf beiden Reitern, wie „Konto hinzufügen“. Ohne Tags nur der Leerzustand mit diesem Knopf, Suche und Filter erst mit Tags.
61. **Zerstörende Massenaktionen unter die Tabelle** · Regel 4, 5 · Aufwand S
   - Wo: Einstellungen → Inhalte/Tags (Desktop, Handy), Logs/Verlauf
   - Änderung: „Zurücksetzen“ (alle Tags) liest sich neben „Filtern nach“ wie „Filter zurücksetzen“. Es verlässt die Werkzeugleiste und steht unter der Tabelle als ghost „Tags auf Standardliste zurücksetzen“. „Verlauf leeren“ ebenso unter die Tabelle; ohne Einträge keine Suche, kein Filter, kein Leeren. Die Rückfragen bleiben.
62. **Handy: aktiver Einstellungsbereich in der Leiste sichtbar** · Regel 1 · Aufwand S
   - Wo: Einstellungen auf dem Handy
   - Änderung: Nach dem Neuaufbau auch für die Bereichsleiste (`data-subnav="side"`) `revealActive` aufrufen; heute springt sie an den Anfang und der aktive Bereich (z. B. Konten) ist nicht zu sehen. Der Seiten-Scroll beginnt weiter oben (README:360).
63. **„Trade loggen“: eine Prüfung, eine Meldung, ein Fokus** · Regel 1 · Aufwand M
   - Wo: Dialog „Trade loggen“, Fehlerfall
   - Änderung: `novalidate` am Formular (required bleibt für die Semantik). Geprüft wird in Formular-Reihenfolge: Symbol → Richtung → Einstieg → Kontrakte → Eröffnet → Ausstieg bei gesetztem Geschlossen. Beim ersten Fehler genau ein Toast, Fokus aufs Feld (im Bottom-Sheet in Sicht scrollen), das Wackeln an der Richtung bleibt. Die englische Browser-Blase entfällt.
64. **TradeLog-Filter hinter einen Knopf mit Zähler** · Regel 3 · Aufwand M
   - Wo: TradeLog voll und Suche (Desktop, Handy)
   - Änderung: Das Suchfeld bleibt. Die vier Selects (Symbol, Setup, Ergebnis, Fehler) wandern in ein Popover hinter „Filter“ (`.btn` mit neutralem Zähler, nie `.accent`, sonst stehen zwei grüne Knöpfe da). Das Popover bleibt nach jeder Wahl offen (nach rerender wieder öffnen). Bei aktivem Filter steht „Zurücksetzen“ (ghost) und „x von y Trades“ in der Zeile. Handy: eine Zeile statt drei. README-Abschnitt TradeLog anpassen.
65. **Editor-Werkzeugleiste: eine Zeile, die häufigsten Formate zuerst** · Regel 3 · Aufwand M · vorher entscheiden: E9
   - Wo: Notiz offen (Desktop, Handy), Vorlagen-Editor
   - Änderung: Größen-Stepper und „Durchgestrichen“ hinter einen Umschalter „Weitere Formate“ (normaler `.tb`, Zustand gemerkt); Farbe und Textmarker bleiben. Bei 1440 bricht die Leiste nicht mehr um („Bild“ allein in Zeile 2). Handy, nur per CSS `order` (DOM gleich): + · Text ▾ · B I U · Bild zuerst, Farben und Größe danach, Rückgängig/Wiederholen am Ende.
66. **News ohne Server: ein Satz, ein Knopf, die Vorschau gedämpft darunter** · Regel 1 · Aufwand M · vorher entscheiden: E15
   - Wo: News, Beispielansicht (Desktop, Handy)
   - Änderung: In der Beispielansicht entfallen Hinweisband, Hero mit Countdown und die 8 Filter-Chips. Oben: Titel „News brauchen deinen Journalyst-Server“, Satz „Echte Termine kommen über denselben Server wie der Mentor.“ und „Server einrichten“ (gefüllt, wie die Einrichtung bei Mentor und Coach). Darunter die Beispieltermine gedämpft (vorhandene Klasse `past`) mit „Beispiel: so sieht es mit Server aus“. Mit Server bleibt alles wie heute.
67. **Bilanz-Tabellen: kürzer, auf dem Handy nur Spalten mit Handlung** · Regel 3, 5 · Aufwand M
   - Wo: Prop → Bilanz (Desktop, Handy)
   - Änderung: Ausgaben ab der 6. Zeile hinter „Alle n anzeigen“ (ghost, Zustand gemerkt). Unter 960 px: Payouts zeigen Konto, Netto, Status, „Erhalten“ und Papierkorb (heute liegt „Erhalten“ rechts außerhalb); Ausgaben zeigen Datum, Typ, Betrag und Papierkorb; Notiz sowie Firma bzw. Konto stehen als Unterzeile unter dem Typ (vorhandene `.sub`-Zeile), damit auf dem Handy keine Angabe verloren geht. Brutto, Split und die Daten der Payouts stehen weiter im Planer („Payouts dieses Kontos“).
68. **Geplatzte und beendete Konten: kompakte Karte** · Regel 5 · Aufwand M
   - Wo: Prop-Übersicht: Karte „Regel verletzt“, Abschnitt „Abgeschlossen“
   - Änderung: Aktives Konto mit Breach: Banner mit „Als geplatzt markieren“, Balance/P&L und Fuß, aber keine Balken und Puffer mehr (sie zeigen danach Falsches, z. B. „noch 20 Stop-Losses“; ändern sich Regeln oder Zuordnung so, dass kein Breach mehr vorliegt, kommen sie zurück). Beendete Konten: Kopf mit Status, Balance, P&L, „Trades zuordnen“; ein Textlink „Zum Grabstein“ nur, wenn es den Stein gibt.
69. **Tabellen: Zeile öffnet „Bearbeiten“, Löschen nur noch im Dialog** · Regel 3, 4, 5 · Aufwand M · vorher entscheiden: E11
   - Wo: Einstellungen → Konten und → Inhalte/Tags (Desktop, Handy), Konto- und Tag-Dialog; Prop → Konten (Desktop, Handy), Prop-Konto-Dialog
   - Änderung: Zeilen werden `tr.link` (öffnen den Bearbeiten-Dialog), der Stift bleibt für die Tastatur, der Papierkorb je Zeile entfällt (Tags: 50 Symbolknöpfe weniger). Löschen steht im Bearbeiten-Dialog links im Fuß, mit der vorhandenen Rückfrage; danach schließt der Dialog. Handy: Nebenspalten (Prop: Start, Gruppe, Trades) aus; sie stehen weiter im Konto-Dialog bzw. auf der Karte, und die abgeschnittene Aktionsspalte wird überflüssig. Prop-Konto-Dialog: beim Bearbeiten steht „Status“ direkt nach Firma, Konto, Kontogröße. Die Stufe des Lösch-Knopfs im Dialog ist offen (rot umrandet wie heute oder ghost „… löschen“), siehe Entscheidung.
70. **Einstellungen: eigener Bereich „Daten“ mit zusammengefassten Knöpfen** · Regel 1, 3, 5 · Aufwand M · vorher entscheiden: E3, E10
   - Wo: Einstellungen: Bereichsmenü, Profil (voll, leer), Dialoge „Sicherung einspielen“ und „Sicherung erstellt“
   - Änderung: Export, Einspielen, Beispieldaten, Alles löschen und Speicherort ziehen aus dem Profil in einen letzten Bereich „Daten“ (nach Logs). Dort: „Sicherung exportieren“ (gefüllt, wenn Daten da sind) mit Häkchen „Bilder und Audio einschließen“ statt zwei Knöpfen; „Sicherung einspielen …“ als ein Knopf, Zusammenführen oder Ersetzen wählt man im Dialog (Segment, Warnung nur bei „Ersetzen“); Beispieldaten „Laden“/„Entfernen“ umrandet, rot bleibt nur „Alles löschen“; Beispieldaten-Text ein Satz + „Was passiert genau?“. Ohne Daten: „Beispieldaten laden“ gefüllt, Export und „Alles löschen“ hinter „Weitere Datenaktionen“. Export-Dialog: Textfeld und „Kopieren“ hinter „Download startet nicht?“ (ebenso U.downloadText). Den Tastatur-Hinweis korrigieren statt streichen: N und die Ziffern 1–9, 0 gibt es (app.html:93-97), der Text nennt „1–6“. README:23, :171, :318.
71. **Einstellungen: „Speichern“ erst bei Änderung aktiv, „Zurücksetzen“ nur bei Abweichung** · Regel 2, 5 · Aufwand M
   - Wo: Einstellungen → Trading (Desktop, Handy), Notebook, Mentor, Design
   - Änderung: Speichern-Knöpfe bleiben gefüllt, sind aber deaktiviert, bis ein Feld ihres Formulars geändert wurde (Trading zusätzlich „Ungespeicherte Änderungen“); „Aktuelles speichern“ (Design) ist deaktiviert, wenn das Design schon gespeichert ist; „Verbindung testen“ erst mit Adresse. Zurücksetzen-Knöpfe („Standardfarben“, „Auf Standard zurücksetzen“ in Trading und Notebook) erscheinen nur bei Abweichung vom Standard. Dazu gehört ein eigener Fehler: Schalter und Chips, die neu aufbauen (Trading, Profil), verwerfen heute ungespeicherte Eingaben still.

### Wirkung klein

72. **Check-in-Punkt in der Seitenleiste erst ab dem ersten Trade** · Regel 5 · Aufwand S
   - Wo: Seitenleiste leer
   - Änderung: Nur der Punkt an „Tagesansicht“ (app.js:38) prüft zuerst, ob es überhaupt Trades gibt (über alle Konten). Coach-, Notebook- und Prop-Punkte bleiben, sie hängen nicht an Journal-Trades.
73. **Zertifikat-Fuß: nur Knöpfe, auf Telefonen „Teilen“ zuerst** · Regel 3, 4 · Aufwand S
   - Wo: Zertifikat-Dialog voll (Desktop, Handy)
   - Änderung: Der Hinweis „PNG in doppelter Auflösung“ wandert aus dem Fuß unter die Format-Segmente. Auf Touch-Geräten, die Dateien teilen können: „Teilen“ gefüllt, „PNG herunterladen“ umrandet, „Kopieren“ ghost; sonst „PNG herunterladen“ gefüllt, „Kopieren“ umrandet, „Teilen“ ghost. Die Häkchen („Beträge ausblenden“, „Username anzeigen“) bleiben sichtbar, weil sie bestimmen, was öffentlich geteilt wird.
74. **Dashboard-Widgets: Bedienelemente nur, wenn sie etwas tun** · Regel 5 · Aufwand S
   - Wo: Dashboard voll (Kalender, Letzte Trades)
   - Änderung: „Heute“ im Kalender nur, wenn ein anderer Monat gezeigt wird, dann als ghost wie in der Tagesansicht. Reiter „Offene Positionen“ nur bei offenen Positionen; sonst steht die Tabelle direkt unter dem Titel, ein hängender Reiterzustand fällt auf „Letzte Trades“ zurück.
75. **Dashboard-Filter: nur Symbol und Zähler** · Regel 3 · Aufwand S
   - Wo: Dashboard-Titelzeile (Desktop)
   - Änderung: Der Text „Filter“ steht nur noch für Screenreader; die Klasse bleibt `.btn` (nicht icon-only, sonst passt der Zähler nicht). Titelzeile danach: „Oktober 2026“, Filter-Symbol, Avatar.
76. **Bearbeitungsmodus: Widget-Inhalte ruhen** · Regel 5 · Aufwand S
   - Wo: Dashboard bearbeiten
   - Änderung: Widget-Inhalte bekommen im Bearbeitungsmodus `pointer-events: none` (Reiter, Kalender, Links, Trade-Zeilen, Bereichs-Knöpfe); ausgenommen sind die Widget-Einstellungen (Zahnrad, Auflösung, Segment, Report-Panel). Ziehen und Ablegen funktioniert weiter.
77. **Vorlage-Menü: ein Weg je Aktion, keine toten Einträge** · Regel 3, 5 · Aufwand S
   - Wo: Vorlage-Menü
   - Änderung: Der Stift je Zeile wandert als „Bearbeiten“ an den Anfang des ⋯-Menüs der Zeile („Umbenennen“ dann ohne Symbol). „Löschen“ nur ab zwei Vorlagen, „Als Standard festlegen“ nur bei Nicht-Standard, statt sie deaktiviert anzuzeigen.
78. **„Trade loggen“: Fuß-Hinweis nennt immer den nächsten Schritt** · Regel 1 · Aufwand S
   - Wo: Dialog „Trade loggen“ (leer, Long)
   - Änderung: Der vorhandene Hinweis links im Fuß folgt der Formular-Reihenfolge: „Symbol wählen“ → „Long oder Short wählen“ (Text aus README:44 bleibt) → „Einstieg eintragen“; ist der Ausstieg gesetzt und „Geschlossen“ leer: „Geschlossen fehlt, der Trade bleibt offen“. „Risiko —“ nur, wenn es einen Wert gibt. „Geschlossen“ wird nicht vorbelegt (würde nachgetragene Trades still verfälschen).
79. **Handy: „Trade speichern“ breit, „Abbrechen“ schmal** · Regel 2 · Aufwand S
   - Wo: Dialog „Trade loggen“ und „Plan & Bewertung“ auf dem Handy
   - Änderung: `.tf-modal .modal-foot .btn { flex: 1 }` (app.css:2985) ersetzen: der gefüllte Knopf `flex: 1 1 auto`, der andere `flex: 0 0 auto`, wie im Fuß des Filter-Fensters (app.css:1425). Heute sind beide 173×42 px.
80. **Kleine Dialoge: das optionale Feld hinter einer Aufklappzeile** · Regel 3 · Aufwand S
   - Wo: Verpassten Trade notieren; Check-in (und Session starten); Aufgabe an alle / an einen Schüler
   - Änderung: Gleiches `<details><summary class="muted small">`-Muster wie „Oder Text einfügen“: Verpasst → „Mehr Optionen“ mit R-Multiple und Setup (Setup speist die Auswertung „bei welchen Setups zögere ich“ und bleibt im Zweifel sichtbar; eigenes form-grid im details). Check-in → „Notiz hinzufügen“ (offen, wenn es eine Notiz gibt; „Fokus für heute“ bleibt sichtbar). Aufgabe → „Fällig am (optional)“ als Aufklappzeile, vorhandener Text. Der eine gefüllte Knopf bleibt jeweils allein.
81. **Lösch-Bestätigungen: „Abbrechen“ als Textknopf** · Regel 4 · Aufwand S · vorher entscheiden: E12
   - Wo: Alle Bestätigungen mit rotem Knopf (Trade, Ruhepunkt-Session, Mentor-Verlauf, Konten, Tags …)
   - Änderung: Nur bei `danger` wird „Abbrechen“ in U.confirmModal (ui.js:447) ghost und bekommt den Startfokus (Enter bricht ab). „Löschen“ bleibt rot umrandet. Normale Bestätigungen bleiben wie alle anderen Dialoge (Bestätigen gefüllt, Abbrechen umrandet). Heute sehen „Abbrechen“ und „Löschen“ gleich geformt aus, nur die Farbe unterscheidet sie.
82. **Seitenwähler nur bei mehr als einer Seite** · Regel 5 · Aufwand S
   - Wo: TradeLog voll (Desktop, Handy)
   - Änderung: Bis 10 Zeilen kein Seitenwähler (die Trefferzahl steht schon im Filterbalken); bei einer Seite mit mehr Zeilen nur „Trades pro Seite“. Ab der 11. Zeile erscheint er von selbst. Handy: zwei Zeilen weniger. README:106 ergänzen.
83. **CSV-Import Schritt 2: Einstellungen nur, wenn sie nötig sind** · Regel 3, 5 · Aufwand S
   - Wo: CSV-Import, Spalten zuordnen (Desktop, Handy)
   - Änderung: Konto-Select nur bei mehreren Konten (sonst Standardkonto). Dezimal hinter „Mehr Optionen“ (öffnet bei Fehlern, Zustand gemerkt, weil der Dialog neu aufbaut). Das Datumsformat nur einklappen, wenn es aus den Daten eindeutig ist; heute wird es nicht erkannt und bei US-Exporten (MM/TT) still vertauscht. Handy: die Spaltenkopf-Zeile ausblenden. Eigener Fehler, außerhalb von Hick: Die Spalten „Einstieg/Ausstieg“ werden den Zeitfeldern zugeordnet.
84. **Dialog „Text-Notiz“: Titel passend zum Knopf** · Regel 1 · Aufwand S
   - Wo: Trade-Detail → Text-Notiz
   - Änderung: „Notiz sprechen oder tippen“ → „Text-Notiz“; der Dialog bietet nur das Tippen, gesprochen wird über „30 Sekunden aufnehmen“. Text ist schon übersetzt.
85. **Ungültiges Datum: ein Knopf „Heute“** · Regel 1 · Aufwand S
   - Wo: Tagesansicht mit ungültigem Datum
   - Änderung: `U.empty('day', 'Ungültiges Datum', '', <a class="btn sm" href="#/day">Heute</a>)`; „Heute“ ist ein vorhandener, übersetzter Text. Der Akzent bleibt beim normalen „Trade loggen“.
86. **Monte Carlo: „Neu simulieren“ ans Diagramm, nach den Ergebnissen** · Regel 3 · Aufwand S
   - Wo: Statistiken → Monte Carlo (Desktop, Handy)
   - Änderung: „Neu simulieren“ (ghost, Würfel) als trailing an die Karte „Beispielpfade“; die erste Zeile wird reiner Kontextsatz. Reihenfolge: Kontext → vier Ergebnis-Kacheln → Diagramm mit Knopf. Der Knopf würfelt alle Werte neu, nicht nur die Pfade. Auf dem Handy steht er nicht mehr wie ein zehnter Reiter allein unter der Leiste.
87. **„Ordner hinzufügen“ als kleines „+“ am Abschnitt „Ordner“** · Regel 3 · Aufwand S
   - Wo: Notebook voll, Handy-Ordneransicht
   - Änderung: Der vollbreite Rahmenknopf verlässt den Spaltenkopf (er spiegelt heute Form und Lage von „Neue Notiz“ und wirkt in der Handy-Ordneransicht wie die Hauptaktion). Stattdessen ein ghost-„+“ neben dem Abschnittstitel (als Nachbar, nicht im Titelknopf). Handy/Tablet: linker Spaltenkopf entfällt, „Alle Notizen“ ist der erste Treffer.
88. **Handy-Notiz: beim Schreiben keine Suchzeile** · Regel 5 · Aufwand S
   - Wo: Notebook, Notiz-Ansicht auf dem Handy
   - Änderung: Im Handy-Block die Kopfreihe der Notiz-Ansicht ausblenden, und zwar nur `.dh-context` (Suche, Filter), damit ein laufender Session-Timer sichtbar bleibt. „←“ führt zur Liste mit der Kopfreihe.
89. **Papierkorb und Auswahlmodus: Zerstören leiser, die Auswahl ersetzt den Kopf** · Regel 4, 5 · Aufwand S
   - Wo: Notebook Papierkorb, Auswahlmodus
   - Änderung: „Leeren“ und „Endgültig löschen“ werden ghost-rot; dafür die vorhandene Notebook-Regel (app.css:1011) auf `.nb .btn.danger.ghost` erweitern, sonst wären sie grau. „Wiederherstellen“ bleibt der einzige gefüllte. Im Auswahlmodus ersetzt die Auswahlzeile den Spaltenkopf („Neue Notiz“, Sortieren, Umschalter weg; „Fertig“ ghost); nach „Fertig“ ist alles zurück. Nebeneffekt: Die grüne Markierung des gedrückten Auswählen-Umschalters verschwindet.
90. **Ordner-Menü: „Bearbeiten“ statt „Umbenennen“ + „Farbe ändern“** · Regel 1 · Aufwand S
   - Wo: …-Menü je Ordner, Ordner-Dialog
   - Änderung: Beide Einträge öffnen heute denselben Dialog. Ein Eintrag „Bearbeiten“, der Dialog heißt immer „Ordner bearbeiten“; die Variante mit schreibgeschütztem Namen entfällt. Menü: Bearbeiten, Standard-Vorlage, | Löschen.
91. **News-Fehler und leere Auswahl: der Knopf passt zur Ursache** · Regel 1 · Aufwand S
   - Wo: News mit Server: Fehler, keine Treffer
   - Änderung: Bei 401 oder „nicht erreichbar“: „Zu den Einstellungen“ (umrandet, vorhandener Text) + „Erneut versuchen“ (ghost); sonst wie heute „Erneut versuchen“. „Keine Termine für diese Auswahl“: „Alle Termine zeigen“ (umrandet; setzt alle Wichtigkeiten und keine Währung, damit garantiert Termine erscheinen).
92. **Navigationslinks in Kartenköpfen tertiär** · Regel 4 · Aufwand S
   - Wo: Fortschritt („Tag ansehen“, „Regeln bearbeiten“), Dashboard („Zur Statistik“)
   - Änderung: Reine Navigationslinks in Kartenköpfen werden `.btn.sm.ghost`. Knöpfe, die auf der Seite etwas tun („Vorschlag übernehmen“, „Konto anlegen“), bleiben umrandet. Heatmap-Pfeile bleiben.
93. **Setup-Warnung nur einmal, dort, wo man sie beheben kann** · Regel 5 · Aufwand S
   - Wo: Schatten-Ich, Regel „Nur bestimmte Setups“
   - Änderung: Die Engine-Warnung „keine Setups ausgewählt“ fällt als Banner weg, wenn die Kachel ihren eigenen Hinweis zeigt (Setups vorhanden, keine gewählt). Gibt es gar keine Setups, bleibt das Banner der einzige Hinweis.
94. **Blind-Replay sagt „Runde“, nicht „Session“** · Regel 1 · Aufwand S · vorher entscheiden: E14
   - Wo: Replay (Startkarte, Auswertung), Dashboard-Widget
   - Änderung: „Runde starten“, „Runde beendet“, „Trefferquote in dieser Runde.“, „Neue Runde“, auch im Dashboard-Widget. „Session starten“ bleibt der Trading-Session vorbehalten. Neue Schlüssel in js/lang/*; interne Namen, Symbol und Stufen bleiben. README:84 und :229-240.
95. **Blind-Replay-Startkarte: ein Satz statt drei Schritte** · Regel 1, 5 · Aufwand S · vorher entscheiden: E14
   - Wo: Replay-Startkarte (leer, Trades bereit; Desktop, Handy)
   - Änderung: Titel, ein Satz (mit bereiten Trades der schon übersetzte Satz „Alte Trades ohne Ergebnis: nehmen oder skippen?“, sonst der Satz aus Nr. 12), ein Knopf, darunter „n Trades bereit“. Die drei Schritte mit grünen Nummernkreisen entfallen (Grün ohne Bedeutung). Karte auf dem Handy rund ein Drittel niedriger. README:236, Test replaytest.js anpassen.
96. **Blind-Replay: doppelte Angaben weg** · Regel 5 · Aufwand S
   - Wo: Replay-Übersicht, Auflösung, Dashboard-Widget
   - Änderung: „Letzte 20“ erst ab 21 Karten (bis dahin identisch mit der großen Zahl; im Widget ebenso). „Setup anzeigen“ nur vor der Entscheidung, denn die Auflösung nennt das Setup schon; ein Klick blendet heute einen zweiten Chip ein.
97. **Mentor nicht eingerichtet: nur die Einrichtungskarte** · Regel 5 · Aufwand S
   - Wo: Mentor nicht eingerichtet
   - Änderung: Kopfreihe (Konto und Hinweis „Der Mentor sieht …“) erst nach der Einrichtung; davor nur die Karte mit „Zu den Einstellungen“. Die dann leere Kopfreihe verschwindet nur mit der pageHead-Änderung aus Nr. 1 ('' bei leerer Reihe). Im eingerichteten Zustand bleibt deine Kopfreihe „nur Konto“.
98. **Ruhepunkt: ein Ausstieg je Schritt, Hauptknopf nur, wenn er weiterführt** · Regel 1, 5 · Aufwand S · vorher entscheiden: E16
   - Wo: Ruhepunkt: Schritt 1, Abschluss „Gespeichert“
   - Änderung: In Schritt 1 und im Abschluss fällt „← Übersicht“ oben weg (unten stehen „Abbrechen“ bzw. „Zur Übersicht“ mit demselben Ziel). „Mit dem Mentor besprechen“ nur bei eingerichtetem Mentor (Prüfung zur Laufzeit), sonst wird „Zur Übersicht“ primär; der Mentor bleibt über die Seitenleiste erreichbar.
99. **Ruhepunkt: Tempo-Zeile nur während der laufenden Atmung verbergen** · Regel 3 · Aufwand S
   - Wo: Ruhepunkt: Atem-Schritte
   - Änderung: Während `running` (heute nur deaktiviert) wird die Tempo-Zeile per `visibility: hidden` verborgen; der Platz bleibt, nichts springt. Vor dem Start, in der Pause und nach „Gut gemacht“ bleibt das Tempo wählbar (es ist der einzige Ort dafür).
100. **Lösch- und Stift-Symbole in Listen erst bei Hover/Fokus (Touch: immer)** · Regel 3 · Aufwand S
   - Wo: Einstellungen → Regeln, Ruhepunkt-Verlauf, Affiliate (Stift an der Provision)
   - Änderung: Vorhandenes Muster `.dot-x`/`.cp-x` (app.css:463-467): unsichtbar bis Hover oder Fokus der Zeile, auf Touch-Geräten immer sichtbar. Betrifft den Papierkorb je Regel, das „×“ je Ruhepunkt-Session und den Stift „Provision ändern“. Löschen bleibt mit Rückfrage, die Provision per Klick auf die Zahl.
101. **Konto-Karte: „Bearbeiten“ als Stift im Kartenkopf** · Regel 4 · Aufwand S
   - Wo: Prop-Übersicht (Desktop, Handy)
   - Änderung: Im Fuß bleibt nur „Trades zuordnen“ (ghost); „Bearbeiten“ wird ein Stift (`btn ghost icon sm`) hinter den Pillen im Kartenkopf, wie in der Konten-Tabelle. Auf dem Handy ein vollbreiter Knopf je Karte weniger, der runde Knopf liegt nicht mehr über „Bearbeiten“.
102. **Payout-Planer und Friedhof: nur zeigen, was etwas aussagt** · Regel 5 · Aufwand S
   - Wo: Bilanz mit Planer, Friedhof
   - Änderung: Planer: Der Info-Banner der Challenge wird Untertitel der Karte, „Profit Split“ nur bei funded, „Payouts dieses Kontos“ nur mit Einträgen (sonst „Bedingungen“ in voller Breite). Friedhof: Karte „Muster“ erst ab zwei Grabsteinen.
103. **Coupon-Codes: Marke „Beispiel“ einmal über dem Raster** · Regel 5 · Aufwand S
   - Wo: Coupon-Codes
   - Änderung: Sind alle Einträge Beispiele, steht die Pille „Beispiel“ einmal rechts über dem Raster (globale `.row`/`.grow`) statt an jeder Kachel; bei gemischten Listen bleibt sie je Kachel. README:266 anpassen.
104. **Affiliate-Liste: ganze Zeile öffnet den Creator, Kachel „Creator“ in den Kartenkopf** · Regel 4, 5 · Aufwand S
   - Wo: Affiliate → Alle Creator (Desktop, Handy)
   - Änderung: `tr.link` öffnet die Creator-Ansicht (der Name bleibt Knopf, am Desktop bleibt der Chevron). Die Kachel „Creator: 5“ (= Zeilenzahl) wird Zusatz am Kartenkopf („5 Creator“); vier Kacheln bleiben, auf dem Handy entfällt die halbleere dritte Reihe. README:268 anpassen.
105. **Schüler-Gruppenzeile: Neuigkeiten als Knopf, Seltenes ins Menü** · Regel 2, 3 · Aufwand S
   - Wo: Coach-Übersicht als Schüler
   - Änderung: „Im Notebook ansehen“ wird bei ungelesenen Einträgen ein umrandeter Knopf (nicht gefüllt, weil die Aufgabe die Hauptaktion bleibt). „Verlassen“ und „Jetzt abgleichen“ kommen in ein …-Menü der Zeile; die Abgleich-Zeile erscheint nur bei Fehler oder während des Abgleichs (dort bleibt „Jetzt abgleichen“ sichtbar). Das Popover schließt vor der Rückfrage. Der Abgleich gilt für alle Gruppen; bei mehreren Gruppen steht er deshalb in jedem Zeilenmenü (Prüferhinweis).
106. **Schüler-Journal: Kleinkram leiser** · Regel 4, 5 · Aufwand S
   - Wo: Coach → Journal eines Schülers
   - Änderung: „Bearbeiten“/„Löschen“ an eigenen Notizen als Symbolknöpfe (Muster coach.js:35). Der Absatz „Nur lesen. Deine Notizen erscheinen …“ nur, bis du die erste Notiz an diesen Schüler geschrieben hast, ohne neues (i)-Symbol.
107. **Coach nicht eingerichtet: ein Satz statt zwei** · Regel 5 · Aufwand S
   - Wo: Coach nicht eingerichtet (Desktop, Handy)
   - Änderung: Neuer Text: „Verbinde in den Einstellungen den Server des Mentor-Chats, dann legst du hier Gruppen an oder trittst einer bei.“ Der Bezug zum Mentor bleibt; Adresse und Token stehen auf der Einstellungsseite. Auf dem Handy rückt der Knopf zwei Zeilen hoch. Alter Schlüssel in allen fünf js/lang/* ersetzen.
108. **„Abo“ aus dem Bereichsmenü, solange es kein Abo gibt** · Regel 5 · Aufwand S
   - Wo: Einstellungen: Bereichsmenü, Abo
   - Änderung: Der Platzhalter-Bereich wird im Menü übersprungen (Merker in SECTIONS), die Route #/settings/abo bleibt gültig. README:171 anpassen.
109. **Logs → Imports leer: ein Satz und „CSV importieren“** · Regel 5 · Aufwand S
   - Wo: Einstellungen → Logs → Imports leer
   - Änderung: Ohne Imports statt des 8-spaltigen Tabellenkopfs nur der Leerzustand mit „CSV importieren“ (umrandet, vorhandene Aktion und Übersetzung).
110. **Neuer Tag: Kategorie aus dem aktiven Filter** · Regel 1 · Aufwand S
   - Wo: Einstellungen → Tag-Dialog
   - Änderung: „+ Tag hinzufügen“ belegt die Kategorie mit dem aktiven Filter vor (heute immer „Setups“); der Nutzer tippt nur noch den Namen.
111. **Avatar öffnet überall das Konto-Menü; Handy-Schublade nur für die Navigation** · Regel 1, 5 · Aufwand M
   - Wo: Titelzeile (Desktop, Handy), eingeklappte Seitenleiste, Handy-Menü
   - Änderung: Der Avatar oben rechts öffnet dasselbe Menü wie die Konto-Karte (gemeinsame Einträge, zwei IDs) und trägt den Coach-Punkt. Danach tun die zwei „T“ dasselbe. Auf dem Handy entfällt die Konto-Karte in der Schublade, die passt dann ohne Scrollen. Profil: 2 Klicks statt 1; Coach, Affiliate, Design auf dem Handy: 2 statt 3 Tipps.
112. **News auf dem Handy: Währungen als zweiter Schritt** · Regel 3 · Aufwand M
   - Wo: News mit Server, Handy
   - Änderung: Unter 560 px wird die Währungs-Reihe ein Chip „Währung: Alle ▾“ mit Popover (dieselben Chips). „Wichtigkeit“ bleibt als Reihe, Desktop unverändert. Wirkt erst mit echten Daten (bis ~10 Währungen = drei bis vier Chip-Reihen).

## Entscheidungen für dich

Hier gibt es mehr als einen sinnvollen Weg, oder der Vorschlag berührt etwas, das du schon festgelegt hast. Jeweils mit Empfehlung.

**E1. Wo soll „Trade loggen“ (und auf dem Handy der runde „+“) stehen bleiben?**

- A: nur auf Dashboard, TradeLog, Tagesansicht und der Prop-Übersicht mit Konten (strenge Fassung von Nr. 1); auf dem Handy zusätzlich kein runder Knopf über Notebook und Trade-Detail (Nr. 40).
- B: zusätzlich auf den Journal-Seiten Statistiken, Fortschritt, Notebook und News; weg nur auf Einstellungen, Coupon-Codes, Affiliate, Replay (wie heute schon Schatten-Ich, Mentor, Coach).
- Empfehlung: A. Auf Statistiken, Fortschritt, Notebook und News will der Screen etwas anderes (lesen, abhaken, schreiben); du hast dieselbe Regel fürs Schatten-Ich schon so entschieden, und am Desktop bleibt die Taste N überall. Preis: Auf dem Handy fehlt dort der runde Knopf, ein Tipp mehr über das Menü.
- Berührt: README:89 („runder Knopf unten rechts“), README:223, shadow.js:104

**E2. Soll der runde „Trade loggen“-Knopf auf dem Handy wieder gefüllt sein?**

- Ja, gefüllt grün ohne Schein (Nr. 2).
- Nein, ruhig wie heute (dunkler Kreis mit grünem Ring).
- Empfehlung: Ja. Auf dem Handy ist er der einzige Hauptknopf jedes Screens, und Regel 2 nennt Füllung ausdrücklich. Die Handy-Regel (app.css:3019) setzt die Füllung schon; heute fehlt sie, weil `.btn.accent` sie überschreibt und weil du „Trade loggen“ ruhiger haben wolltest (Commit 96b165b). Den Schein, den du abgelehnt hast, nehmen wir heraus. Am Desktop bleibt „Trade loggen“ ruhig.
- Berührt: deine Entscheidung „Trade loggen ruhiger“ (Commit 96b165b), app.css:3019/3137

**E3. Bleibt „Trade loggen“ am Desktop nur getönt, und darf daneben je Bereich ein gefüllter (grüner) `.btn.primary` stehen?**

- Getönt lassen; Vorrang entsteht, indem Konkurrenten zurückgestuft werden. Ein gefüllter `.btn.primary` je Bereich oder Dialog („Neue Notiz“, „Konto anlegen“, „Speichern“) ist erlaubt, wo „Trade loggen“ nicht die Aufgabe ist. Neu gefüllt würden dann nur „Kopieren“ in der leeren Coach-Gruppe (Nr. 54), „Server einrichten“ (Nr. 66) sowie „Sicherung exportieren“ bzw. „Beispieldaten laden“ im Bereich „Daten“ (Nr. 70).
- Streng nach deiner Regel „Grün nur für Gewinn und „Trade loggen““: Außer dem einen Hauptknopf eines Dialogs wird nichts neu gefüllt; die eben genannten Knöpfe bleiben umrandet.
- „Trade loggen“ am Desktop ebenfalls füllen.
- Empfehlung: Erste Variante. Nach Nr. 3 und Nr. 1 ist „Trade loggen“ auf seinen Seiten der einzige grüne Knopf; eine Füllung würde deine Festlegungen #61/#72 („ruhig, Grün nur mit Bedeutung“) aufweichen. Ein gefüllter Hauptknopf je Bereich ist schon heute dein Muster („Speichern“, „Neue Notiz“, „Zu den Einstellungen“). Die Regel „höchstens ein gefüllter Knopf je Screen“ gilt dann für `.btn.primary`.
- Berührt: README:202-208 („Grün nur für Gewinn und „Trade loggen““), Aufgaben #61, #72

**E4. Konto-Knopf erst ab zwei Konten?**

- Ja, überall außer beim Mentor (Nr. 25).
- Nein, der Knopf bleibt immer (Platz in der Titelzeile laut README:62).
- Empfehlung: Ja. Mit einem Konto gibt es nichts zu wählen; dasselbe Muster hast du schon abgenommen (Konto-Feld im Trade-Dialog nur bei mehreren Konten, Prop-Filter erst ab fünf Konten). Beim Mentor bleibt der Knopf, weil er erklärt, welche Trades der Mentor sieht.
- Berührt: README:62, README:144, Aufgabe #8

**E5. Tagesansicht: Was ist die eine Sache, „Trade loggen“ oder Check-in und Nachbereitung?**

- Akzent bleibt „Trade loggen“; vor dem Handel steht die Check-in-Karte direkt unter dem Leerzustand, an vergangenen Tagen trägt die Reihenfolge Trades → Regeln → Tagesnotiz die Nachbereitung.
- Heute vor dem ersten Trade „Check-in“ bzw. ▷ als Hauptaktion hervorheben.
- Empfehlung: Erste Variante (Nr. 7, Nr. 21). Grün ist laut deiner Regel nur für „Trade loggen“ da; der Check-in ist der erste Schritt, bekommt aber Platz statt Farbe. Wichtig: Heute nimmt „Trade loggen“ die aktuelle Uhrzeit, nur vergangene Tage werden vorbelegt.
- Berührt: README:203

**E6. Trade-Detail: Welcher Knopf ist gefüllt, „Plan & Bewertung“ oder „Trade bearbeiten“?**

- „Plan & Bewertung“ gefüllt, „Trade bearbeiten“ umrandet (Nr. 5).
- Kein gefüllter Knopf: beide umrandet nebeneinander oben.
- Empfehlung: „Plan & Bewertung“ gefüllt. Dafür öffnet ein Daytrader die Detailseite (vor allem nach einem CSV-Import); Rohdaten korrigiert er selten. Laut README:33-39 trägt man Plan, Bewertung und Tags nur hier ein.
- Berührt: README:33-39

**E7. „Trade loggen“: Welche Felder sind Pflicht, was kommt hinter „Mehr Optionen“?**

- Sichtbar: Symbol, Richtung, Einstieg, Ausstieg, Kontrakte, dazu Eröffnet und Geschlossen. Hinter „Mehr Optionen“: Punktwert, Gebühren, Prop-Konten, Klappzustand gemerkt (Nr. 20).
- Nur deine fünf Felder sichtbar, Eröffnet/Geschlossen ebenfalls einklappen.
- Empfehlung: Erste Variante. Ohne „Geschlossen“ bleibt ein Trade offen und hat keinen P&L, und „Eröffnet“ steht beim Nachtragen auf „jetzt“; beide müssen sichtbar bleiben. Die von dir genannten Zusatzfelder (Stop, Ziel, Setup, Notizen, Screenshots) stehen schon in „Plan & Bewertung“. Weil Futures fast immer Gebühren haben, merkt sich „Mehr Optionen“, ob du es offen lässt.
- Berührt: README:33-38

**E8. Zertifikat: Welcher Eintrag ist der naheliegende?**

- „Daily Profit“ des letzten Handelstags (Nr. 29).
- Das Zertifikat zum gerade gewählten Zeitraum (z. B. Monthly bei „Oktober 2026“).
- Empfehlung: Letzter Handelstag, für einen Daytrader der häufigste Grund zu teilen; Montag früh liefert Freitag. Den Zeitraum-Bezug sieht man trotzdem, weil rechts der konkrete Zeitraum steht. Eine grüne Markierung des passenden Eintrags ist verworfen (Auswahl-Grün hast du abgelehnt).

**E9. Darf von der „nach TradePath“ gebauten Reihenfolge abgewichen werden (Fortschritt, Editor-Werkzeugleiste)?**

- Ja: Checkliste vor die Heatmap (Nr. 11); Größe/Durchgestrichen hinter „Weitere Formate“, auf dem Handy B I U zuerst (Nr. 65).
- Nein, Aufbau wie TradePath lassen.
- Empfehlung: Ja für den Fortschritt, denn die Checkliste ist das Einzige, was man dort tut, und liegt heute unter der Falz. Für die Werkzeugleiste ja auf dem Handy (B, I, U sind heute abgeschnitten); den „Weitere Formate“-Umschalter am Desktop nur, wenn dich der Umbruch bei 1440 stört.
- Berührt: progress.js:1, editor.js:1-3, README:123

**E10. Einstellungen: neuer Bereich „Daten“?**

- Ja: Sicherung, Beispieldaten und „Alles löschen“ als eigener letzter Bereich (Nr. 70).
- Nein: alles bleibt im Profil, nur die Knöpfe werden zusammengefasst.
- Empfehlung: Ja. Das Profil hat heute fünf Blöcke mit 14 Bedienelementen und zwei gefüllten Knöpfen; Daten und Profilangaben sind verschiedene Aufgaben. Es geht keine Funktion verloren, kein Link zeigt auf den Datenblock.
- Berührt: README:23, README:171

**E11. Löschen im Bearbeiten-Dialog: rot umrandet oder als Textknopf?**

- Rot umrandet links (`.btn.danger.left`, heutiges Muster im Prop-Konto-Dialog).
- Textknopf links mit klarem Text („Konto löschen“, `.btn.ghost.left`, Muster „Entfernen“ im Check-in); Rot erst in der Rückfrage.
- Empfehlung: Textknopf. Dann gibt es im Dialog nur einen hervorgehobenen Knopf („Speichern“), und die rote Rückfrage bleibt die Sicherung. Einheitlich für Prop-Konto, Preset, Konto (Einstellungen) und Tag (Nr. 69, Nr. 24). Achtung: `ghost` + `danger` ist außerhalb des Notebooks grau, deshalb ohne `danger`.
- Berührt: prop.js:204, app.js:524

**E12. Lösch-Bestätigung: „Abbrechen“ umrandet lassen oder als Textknopf?**

- Textknopf nur bei roten Bestätigungen, Startfokus auf „Abbrechen“ (Nr. 81).
- Wie heute: „Abbrechen“ in allen Dialogen umrandet.
- Empfehlung: Textknopf. Weil es keine rote Füllung gibt, sehen „Abbrechen“ und „Löschen“ heute gleich geformt aus; das verletzt Regel 4. Die Sorge, ein leiser „Abbrechen“ lenke zum Löschen, fängt der Fokus auf „Abbrechen“ ab (Enter bricht ab). Ein Prüfer hatte für den TradeLog dagegen gestimmt (gleiche Aktion, gleiche Stufe), deshalb fragen wir dich.
- Berührt: ui.js:447

**E13. Blind-Replay: „Nehmen“ gefüllt und „Skippen“ umrandet, oder beide gleich?**

- Wie heute (Regel 4: ein gefüllter Knopf).
- Ausnahme von Regel 4: beide gleich (umrandet, gleich groß), wie bei deinem Tinder-Beispiel.
- Empfehlung: Beide gleich. Die eine Sache dieses Screens ist „entscheiden“; ein gefülltes „Nehmen“ verleitet zum Nehmen und verfälscht die Trefferquote, um die es beim Training geht. Kein bestätigter Vorschlag, nur deine Wahl; Replay ist ohnehin per Feature-Flag versteckt.
- Berührt: replay.js:65

**E14. Blind-Replay: „Runde“ statt „Session“ und ein Satz statt drei Schritte?**

- Ja (Nr. 94, Nr. 95).
- Nein, Texte und drei Schritte wie in README:229-240.
- Empfehlung: Ja. „Session“ heißt sonst die Trading-Session mit Check-in, und deine neuere Vorgabe für Leer- und Startzustände lautet „ein Satz und ein Knopf“. Die grünen Nummernkreise sind Grün ohne Bedeutung.
- Berührt: README:84, README:229-240

**E15. News ohne Server: „Server einrichten“ gefüllt oder umrandet?**

- Gefüllt, wie die Einrichtung bei Mentor und Coach (Nr. 66).
- Umrandet, weil „Trade loggen“ in derselben Kopfreihe steht.
- Empfehlung: Gefüllt. Es ist der einzige Knopf, der auf dieser Seite weiterhilft, und mit Nr. 1 steht auf News kein „Trade loggen“ mehr. Gleiche Aktion, gleiche Stufe wie bei Mentor und Coach.
- Berührt: deine Regel „Grün nur für Gewinn und „Trade loggen““ (siehe E3)

**E16. Ruhepunkt-Abschluss nach „Vor dem Trading“: Soll „Mit dem Mentor besprechen“ der Hauptknopf sein?**

- Wie vorgeschlagen: Mentor-Knopf nur, wenn eingerichtet; sonst „Zur Übersicht“ primär (Nr. 98).
- Zusätzlich nach „Vor dem Trading“ immer „Zur Übersicht“ primär, Mentor umrandet.
- Empfehlung: Erste Variante jetzt umsetzen. Ob nach „Vor dem Trading“ überhaupt ein Gespräch der nächste Schritt ist (eigentlich will man in den Handel), ist eine Frage an den Ablauf aus docs/ruhepunkt.html; Empfehlung: dort „Zur Übersicht“ primär. Das wäre ein neuer Vorschlag, nicht Teil dieser Prüfung.
- Berührt: ruhepunkt.js:1-2 (Texte aus docs/ruhepunkt.html)

**E17. „Widget hinzufügen“: Gruppe „Auswertungen“ vor „Bereiche der App“?**

- Ja (Nr. 33).
- Nein, Bereiche zuerst wie bei Aufgabe #32.
- Empfehlung: Ja. Die Bereichs-Widgets sind durch die Layout-Migration bei fast allen schon hinzugefügt; oben sollen die Einträge stehen, die man noch wählen kann. Die Reihenfolge steht nur als Code-Kommentar, nicht in der README.
- Berührt: dashboard.js:59 (Aufgabe #32)

## Verworfen

Geprüft und bewusst nicht vorgeschlagen.

*Rahmen der App: Titelzeile, Seitenleiste, Menüs, Kopfreihe*

- **Titelzeile · voll (Desktop):** „Dashboard-Platzierung nicht auf andere Seiten übertragen“: Schon behoben (Commit aa9f1c6 vom 11.10., unmount im Dashboard); die Aufnahmen waren älter.
- **Titelzeile · voll (Desktop):** „Avatar in der Titelzeile nur auf dem Handy“: Der Avatar ist fester Teil der Titelzeile (README:62, :339). Das eigentliche Problem, zwei gleiche „T“ mit verschiedenem Verhalten, löst Nr. 111.
- **Seitenleiste · ausgeklappt:** „Coupon-Codes aus der Navigation in Prop Firms verlegen“: Widerspricht README:264 (Coupon-Codes eigener Bereich) und README:241 (Prop Firms auf drei Bereiche reduziert); kleiner Gewinn.
- **Konto-Menü unten links · Desktop:** „Konto-Menü auf 4 Zeilen kürzen, Einstellungen zuerst“: Inhalt und Reihenfolge des Konto-Menüs hast du festgelegt (README:60-61, #30, #48); das Menü ist selbst schon die versteckte Stufe. Offen nur: „Profil“ öffnet dieselbe Seite wie „Einstellungen“.

*Dialog „Trade loggen“ und Check-in*

- **Trade loggen · leer (neuer Trade):** „Beim Öffnen das Symbol-Feld fokussieren statt nichts“: Fokus färbt das Symbolfeld sofort grün; den automatischen Fokus hast du bewusst entfernt (Commit 2a2db87).
- **Trade loggen · Long gewählt:** „Nach der Richtungswahl direkt zum Einstieg“: Ungefragter grüner Fokus und auf dem Handy die aufspringende Tastatur; der Text-Teil steckt in Nr. 78.
- **Trade loggen · Long gewählt:** „„Mehr Optionen“ gilt auch hier“: Dublette, in Nr. 20 enthalten.
- **Trade loggen · Handy (Bottom-Sheet):** „„Mehr Optionen“ bringt auf dem Handy den Hauptknopf in Sicht“: Dublette, in Nr. 20 enthalten (bei 390×844 ist „Trade speichern“ schon sichtbar).
- **Trade bearbeiten:** „„Mehr Optionen“ beim Bearbeiten automatisch offen, wenn Werte gesetzt sind“: In Nr. 20 enthalten (Aufklappen beim Bearbeiten).
- **Check-in · leer:** „Fokus beim Öffnen auf das erste Feld statt auf das X“: Ein globaler Fokuswechsel hätte bei Bestätigungen „Löschen“ fokussiert (Enter löscht). Der Fokusring ist nur bei Tastatur sichtbar; sicher gelöst in Nr. 35.

*Dashboard*

- **Zeitraum-Menü:** „Kalender erst bei „Benutzerdefiniert“ zeigen (optional)“: Die zwei Monatskalender im Zeitraum-Menü sind deine Vorschau-Entscheidung (#18, #35, README:70); das Menü erfüllt die Regeln schon.

*Zertifikat (aus Dashboard, Statistiken, Tagesansicht)*

- **Zertifikat-Menü:** „Passenden Eintrag zum gewählten Zeitraum markieren“: Wäre eine grüne Markierung im Menü (abgelehnt) und täuscht in einem Aktionsmenü eine Auswahl vor; Nr. 29 zeigt den konkreten Zeitraum ohnehin rechts.

*Statistiken*

- **Übersicht · voll:** „Neun Reiter → fünf Reiter plus „Mehr ▾“ (Entscheidung des Nutzers nötig)“: Das Popover würde in der scrollenden Reiterleiste abgeschnitten, auf dem Handy hilft es nicht, und die Reiter sind deine Navigation (README:109-111). Nr. 9 beruhigt die Leiste billiger.
- **Tage:** „Klickbare Tageszeilen als Link erkennbar machen – nur mit vorhandenem Muster“: Die App hat keine Link-Optik; klickbare Zeilen ohne Link-Hinweis sind das App-Muster.
- **Tage, Setups, Zeit, Fehler · leer:** „Diese vier Leerzustände durch den Seiten-Leerzustand ersetzen“: Nach Nr. 10 nicht mehr erreichbar.

*Fortschritt*

- **Fortschritt · voll:** „„Nächster Schritt“ direkt in der Kachel „Heutiger Fortschritt““: Ein zusätzlicher Link doppelt den Checklisten-Eintrag; nach Nr. 11 steht die Checkliste direkt unter der Kachel.

*TradeLog*

- **Reiter Trades · leer:** „Reiter „Tage“ ohne Trades ausblenden“: Reiter sind Navigation; ein Reiter, der je nach Datenlage verschwindet, macht den Aufbau unberechenbar. Sein Leerzustand bekommt in Nr. 36 einen Knopf.
- **Reiter Tage · voll:** „Ganze Tageskarte als Link, „Tagesansicht ›“ bleibt als Hinweis“: Betrifft Fitts, nicht Hick: die Zahl der Wahlmöglichkeiten sinkt nicht, die Karte hat schon genau eine Aktion; bräuchte neue Hover-Optik.
- **TradeLog · Handy leer:** „Ein gefüllter Knopf in der Leer-Karte“: Die Leer-Karte erfüllt Regel 4 schon; was auffällt, sind die 34-px-Symbole (Nr. 6). Der doppelte runde Knopf fällt mit Nr. 26 weg.
- **Trade-Detail · voll:** „„Löschen“ tertiär statt gleich groß neben „Bearbeiten““: `ghost`+`danger` ist außerhalb des Notebooks grau statt rot; Löschen ist überall `.btn.sm.danger`. Die Nähe zum Hauptknopf löst Nr. 5.
- **Bestätigung „Trade löschen“:** „„Abbrechen“ im Bestätigungsdialog als Textknopf“: Ein Prüfer: „Abbrechen“ ist in allen Dialogen umrandet. Derselbe Gedanke ist für rote Bestätigungen in Nr. 81 bestätigt; die Entscheidung liegt bei dir (E12).

*Tagesansicht*

- **Tag mit Trades:** „Session-Start ▷ nur für heute“: Kleiner Gewinn; die Kopfreihe würde beim Blättern zwischen heute und gestern ihren Aufbau ändern und eine laufende Session verstecken.
- **Vergangener Tag ohne Trades:** „Leerzustand „Keine Regeln definiert“ nicht in der Tagesansicht bewerben“: Der Leerzustand „Keine Regeln definiert“ ist schon ein Satz und ein Knopf und der einzige Hinweis auf Regeln in der Tagesansicht. Eigener Fix: Der Link soll auf #/settings/regeln zeigen.

*Notebook*

- **Notebook · voll:** „Entscheidung: Notebook will „Neue Notiz“ – nur ein gefüllter Knopf pro Screen“: Keine Änderung nötig: „Neue Notiz“ ist schon der einzige gefüllte Knopf. Die Grundsatzfrage steht unter den Entscheidungen.
- **Notebook · voll:** „Filter-Knopf erst ab zwei Notizen; Tag-Feld nur, wenn Tags existieren“: Dublette von Nr. 45; das Tag-Feld im Filter ohne Tags auszublenden ist harmlos und kann dort mitlaufen.
- **Neue Notiz:** „Leere Notiz: Teilen/Export/PDF/Duplizieren erst bei Inhalt“: Die Bedingung greift nicht (neue Notizen haben einen Datumstitel), die Seite baut beim Tippen nicht neu auf; nach Nr. 44 steht ohnehin alles im Menü.
- **Neue Notiz:** „Knopftext passend zur erzeugten Notiz“: Kein Hierarchie-Thema; „Neue Notiz“ legt bewusst eine Tagesnotiz an (Daily Journal als Standard).
- **Notebook · Handy Notiz:** „„Teilen“ auf dem Handy erreichbar machen (ins …-Menü)“: Dublette von Nr. 44.
- **Notebook · Handy Ordneransicht:** „Ordneransicht: „Ordner hinzufügen“ als Ghost-„+“ im Abschnittskopf“: In Nr. 87 aufgegangen.
- **…-Menü der Notiz:** „Notiz-Menü auf 6–7 Einträge: Verschieben als zweiter Schritt, Teilen hinein“: Dublette von Nr. 44.
- **Ordner-Dialog:** „„Farbe ändern“: Namensfeld nicht zeigen (oder Variante zusammenlegen)“: Durch Nr. 90 überflüssig.
- **Filter und Sortieren:** „Filter-Popover auf das Einzigartige reduzieren“: Das Ordner-Feld im Filter ist der einzige Weg, innerhalb eines Ordners zu suchen; es auszublenden würde eine Funktion entfernen.
- **Editor-Menüs („+“, „Text ▾“, Bild, Farben):** „„+“-Menü ohne Dubletten zu „Text ▾““: Das „+“-Menü ist nach deinem TradePath-Vorbild festgelegt (README:123); innerhalb eines Menüs ist der Gewinn klein.

*News*

- **News · Handy:** „Handy: Beispielansicht wie Desktop auf einen Knopf reduzieren“: Dublette von Nr. 66.

*Schatten-Ich*

- **Schatten-Ich · Trades, keine Regel aktiv:** „Ohne aktive Regel nur Intro und Regelwerk zeigen“: Widerspricht deiner Entscheidung: Das Banner steht unter den Schaltern, damit beim ersten Einschalten nichts verrutscht (README, shadow.js:57).

*Blind-Replay*

- **Übersicht · voll:** „Konto-Auswahl nur bei mehreren Konten“: Das Konto bestimmt die Übungs-Trades (wie beim Mentor); geregelt wird es global in Nr. 25.
- **Übersicht · voll:** „Runden-Säulen erst ab 3 Runden, dann ohne doppelten Fakt“: Ab 21 Runden stünde die Gesamtzahl nur noch im Tooltip; das Widget zeigt den Verlauf bewusst ab zwei Runden; README:234.
- **Übersicht · Handy:** „Fakten-Streifen auf dem Handy entlasten“: Dublette von Nr. 96; der Streifen passt schon in eine Zeile.
- **Karte · Handy:** „Kartenkopf auf dem Handy in einer Zeile“: Der Kartenkopf bliebe trotzdem zweizeilig (gemessen); der Zähler ist festgelegt (README:237).

*Mentor*

- **Mentor · Chat Handy:** „Konto-Hinweis auf dem Handy in das Konto-Popover“: Der Hinweis erklärt, warum die Kontowahl dort steht; du hast ihn so bestellt (Mentor-Kopfreihe).

*Ruhepunkt*

- **Ruhepunkt · Start:** „Empfohlene Session nach der Lage zuerst“: Die Dreierwahl ist richtig; wechselnde Positionen schaden gerade beim Akut-Reset, und die Texte stammen unverändert aus docs/ruhepunkt.html.
- **Ruhepunkt · Formular-Schritte:** „Leerer Tagesplan: eine Zeile und ein Sprung statt drei Leerzeilen“: Die Zeilen „nicht festgelegt“ sind ein gewollter Hinweis; ein zusätzlicher Knopf fügt eine Wahl hinzu; Texte fest.

*Coupon-Codes*

- **Coupon-Codes · leer:** „Leerzustand: ein Satz und ein sekundärer Weg weiter“: Der Zustand ist praktisch nicht erreichbar (Codes fest im Code); der Knopf führte nur in einen anderen Bereich.

*Coach*

- **Gruppe · voll:** „Schülername als Link, damit das Öffnen sichtbar ist“: Kein Gewinn nach den Regeln (Hover gibt es schon) und ein Stilwechsel (700 → 600).
- **Gruppe · voll:** „„Aktualisieren“ ins „…“-Menü“: „Aktualisieren“ wird gebraucht (die Gruppe lädt nur beim Betreten); gleiche Aktion, gleiche Stufe wie in Journal und Leerzustand.
- **Gruppe · Handy:** „Symbolknöpfe ✓ und ⟳ am Handy ins Menü“: „Aufgabe an alle“ ist häufig; die Stufe hinge von der Breite ab. Das mehrdeutige ✓ ohne Text ist eine Frage der Verständlichkeit.

*Affiliate*

- **Alle Creator · Handy:** „Zeile tippbar machen, damit das Öffnen am Handy überhaupt erkennbar ist“: Chevron am Handy würde die Tabelle seitlich scrollen lassen (README:275); die tippbare Zeile steckt in Nr. 104.

*Einstellungen*

- **Design:** „Gespeicherte Designs zuerst, wenn vorhanden“: Die Blockreihenfolge würde beim Speichern springen; README legt sie fest.
- **Sprache:** „Untertitel auf einen Satz“: Nur Text, keine Wahl weniger; der Untertitel der Sprachseite fiele bis zur Übersetzung auf Deutsch zurück.
- **Benachrichtigungen:** „Recap-Beschreibungen kürzen“: Nur Text und ungenauer („ab 4 Trades“ statt „mindestens 4 geschlossene Trades bis Sonntag“).
- **Regeln · leer:** „Leerzustand = Feld + Knopf“: Der Leerzustand ist schon Satz, Feld, Knopf; Autofokus öffnete auf dem Handy die Tastatur.
- **Bestätigungen und Hinweise:** „Bei zerstörenden Bestätigungen Fokus auf „Abbrechen““: Als Schutzregel in Nr. 35 enthalten; heute bricht Enter auf dem X schon ab.
