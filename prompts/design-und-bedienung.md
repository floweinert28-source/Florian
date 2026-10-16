# Prompt: Design & Bedienung meiner App überarbeiten

> Zum Kopieren in Claude Code (oder ein anderes KI-Coding-Tool).
> Die Stellen in [ECKIGEN KLAMMERN] vorher ausfüllen.

---

Du bist ab jetzt Senior Product Designer und Frontend-Entwickler für meine App. Deine Aufgabe: Design und Bedienung meiner App so überarbeiten, dass sie professionell, eigenständig und angenehm zu bedienen ist und **nicht nach „KI-gebaut“ aussieht**. Arbeite gründlich und Schritt für Schritt.

## Über die App

- Name: [APP-NAME]
- Worum es geht (1–2 Sätze): [BESCHREIBUNG]
- Zielgruppe: [WER NUTZT DIE APP]
- Plattformen: **Web, iOS und Android**. Die App hat eine **KI-Funktion**: [KURZ BESCHREIBEN, z. B. KI-Chat].
- Technik: [z. B. React Native/Expo, Next.js, Flutter … oder: „schau im Code nach“]
- Stimmung/Marke: [z. B. ruhig und vertrauenswürdig / verspielt / sportlich]
- Vorbilder, deren Look mir gefällt: [APPS ODER LINKS, optional]

## So gehst du vor

1. **Erst ansehen, nichts ändern.** Lies den Code und mach Screenshots aller wichtigen Screens (Web per Playwright im Browser, mobil im Simulator, wenn möglich). Prüfe jeden Screen gegen alle Regeln unten.
2. **Bericht.** Gib mir eine Liste aller Verstöße, sortiert nach Wichtigkeit (zuerst, was Nutzer stört oder blockiert, dann Optik), mit Screen und Datei.
3. **Design-Grundlage festlegen.** Schlage eine Farbpalette, Schriften, Abstands- und Radius-Skala vor und lege sie als zentrale Theme-/Token-Datei an (hell **und** dunkel). Warte auf mein OK, bevor du großflächig umbaust.
4. **Umsetzen in kleinen Schritten.** Ein Bereich pro Schritt (z. B. erst Buttons und Ladezustände, dann Onboarding, dann Paywall). Nach jedem Schritt: kurze Zusammenfassung, was geändert wurde.
5. **Selbst prüfen.** Nach jedem Schritt Screenshots in hell und dunkel, Handy und Tablet/Desktop, und mit großer Schrift. Fehler selbst beheben.
6. **Funktion nicht kaputt machen.** Keine Logik, Daten oder Sicherheitsprüfungen ändern, nur Darstellung und Bedienung. Alten Code ersetzen statt eine zweite Version daneben zu bauen.

## 1. Klarheit: eine Hauptaktion pro Screen

- Jeder Screen hat **genau eine offensichtliche Hauptaktion** (Hick's Law: mehr Auswahl → langsamere Entscheidung → schlechtere Bindung).
- Der Hauptbutton sieht **deutlich wichtiger** aus als alles andere.
- **Nie zwei gleich wichtig aussehende Buttons nebeneinander.** Zweite Aktion als Text- oder Outline-Button.
- Erweiterte Optionen erst zeigen, wenn sie gebraucht werden. Was gerade nicht relevant ist, nicht anzeigen.
- Nicht alles zeigen, was die App kann. Die App darf innen komplex sein, der nächste Schritt muss trotzdem klar sein.
- Wichtige Zahlen groß, das Label dazu klein.

## 2. Feedback und Ladezustände

- **Jeder Tap/Klick gibt sofort sichtbares Feedback** (gedrückter Zustand, Haptik auf dem Handy).
- Langsame Arbeit im Hintergrund erledigen; die Oberfläche sofort aktualisieren (optimistisches UI) und bei Fehler zurückrollen.
- **Skeleton-Loader statt Spinner**, überall wo geladen wird. Skeletons haben die Form des echten Inhalts.
- **Doppel-Tap sperren:** Buttons während der Aktion deaktivieren, damit nichts doppelt gekauft, gespeichert oder gesendet wird.
- Lange Listen nachladen (Pagination/Lazy Loading), Bilder in passender Größe.

## 3. Fehler und Meldungen

- **Nie rohe Fehlertexte** zeigen (kein „undefined“, kein 404, keine Datenbank- oder Stacktrace-Meldung). Das wirkt unfertig und verrät Angreifern dein Backend.
- Fehler abfangen und freundlich in Alltagssprache melden: **was passiert ist und was der Nutzer tun kann.** Kurz, als Toast oder direkt am Feld.
- Technische Details nur ins Log, nie in die Oberfläche.

## 4. Formulare und Eingaben

- **Die Tastatur verdeckt nie das aktive Eingabefeld** (iOS und Android prüfen).
- **Eingaben bleiben erhalten**, wenn der Nutzer zurück geht oder die App kurz verlässt.
- Passende Tastaturtypen (E-Mail, Zahl, Telefon), Autofill unterstützen.
- Fehler direkt am Feld anzeigen, nicht erst nach dem Absenden ganz oben.

## 5. Onboarding und Konto

- **Erst nutzen lassen, dann Account.** Kein Zwangs-Login, nur um sich umzusehen.
- Im Onboarding sitzt der **Weiter-Button auf jedem Screen an exakt derselben Stelle.**
- Bei „Mit Apple anmelden“ **nicht noch einmal nach dem Namen fragen**; Namen später im Profil änderbar machen.
- **Konto löschen** muss direkt in der App erreichbar sein (Einstellungen).

## 6. Paywall und Abo (Gestaltung)

- Paywall im Onboarding zeigen, mit Testphase.
- Die Paywall darf **optisch anders** aussehen als der Rest, damit Nutzer bewusst hinschauen.
- **Zeitleiste der Testphase** zeigen (heute / Erinnerung vor Ablauf / erste Abbuchung).
- Preis, Laufzeit und Verlängerung **direkt neben dem Kauf-Button** sichtbar.
- Ankerpreis erlaubt (z. B. Jahresabo neben Monatspreis), aber **keine Dark Patterns**: kein verstecktes Kündigen, keine irreführenden Texte, keine Tricks beim Bezahlen.
- „Käufe wiederherstellen“ gut auffindbar.

## 7. KI-Funktion (Gestaltung)

- **Vor der ersten Nachricht klar zeigen, dass der Nutzer mit einer KI spricht** (EU AI Act). Ein Hinweis im Impressum reicht nicht.
- **Einwilligungs-Screen**, bevor Daten an den KI-Anbieter gehen. Klar sagen, welche Daten wohin gehen.
- Während die KI antwortet: sichtbarer Ladezustand, Abbrechen möglich, Antwort nach und nach anzeigen (Streaming).
- Fehler oder Nutzungslimit freundlich erklären, mit nächstem Schritt.

## 8. Benachrichtigungen und Bewertungen

- **Push-Nachrichten mit klarem Inhalt.** Grund lesbar, ohne die App zu öffnen. Keine Nachricht nur mit Emoji.
- **Nach einer Bewertung erst fragen, wenn der Nutzer etwas geschafft hat**, nie nach ein paar Sekunden.

## 9. Datei-Uploads (falls vorhanden)

- Die Ablagefläche reagiert sichtbar beim Darüberziehen (Rahmen, Text).
- Ehrlicher Fortschritt in **Prozent und Restzeit**, kein Endlos-Spinner.
- Bricht der Upload ab: **Neuversuch direkt an der Stelle**, die Datei bleibt geladen.
- Nach dem Upload eine **Vorschau mit Typ und Größe**.
- Mehrere Dateien: jede mit eigenem Fortschritt und eigenem Neuversuch; ein Fehler blockiert nicht die anderen.

## 10. Hell, dunkel und Barrierefreiheit

- **Dark Mode** über eine zentrale Theme-Datei mit heller und dunkler Palette, die der Systemeinstellung folgt. **Beide Modi gut lesbar**, ausreichend Kontrast.
- **Schrift skaliert mit der Systemeinstellung bis mindestens 200 %**: iOS Dynamic Type (bei eigener Schrift UIFontMetrics), Android sp-Einheiten, Web rem. Nichts darf abschneiden oder überlappen.
- Screenreader: alle Bedienelemente beschriftet, Bilder mit Alt-Text, sinnvolle Reihenfolge.
- Web: komplett per Tastatur bedienbar, sichtbarer Fokus.
- Ausreichend große Tippflächen.
- Zusätzlich eine Seite „Erklärung zur Barrierefreiheit“ im Footer/Einstellungen. Die ersetzt die Punkte oben aber nicht.

## 11. Geräte und Plattformen

- **iPad und Android-Tablets testen:** keine Buttons außerhalb des Bildschirms, kein abgeschnittener Text, kein gequetschtes Layout. Kein hochskaliertes Handy-Layout in der Mitte.
- Web: von 360 px Handybreite bis großem Desktop sauber, nie seitlich scrollen.
- Plattform-Gewohnheiten respektieren: iOS (Zurück-Wischgeste, Apple Human Interface Guidelines), Android (System-Zurück-Taste, Material-Verhalten), Web (Links, Tastatur).
- iOS 26: bei verschachtelten abgerundeten Elementen konzentrische Ecken (ConcentricRectangle), statt zufälliger Radien.

## 12. Eigener Look statt KI-Standard

Lege eine bewusste, zur App passende Gestaltung fest:

- **Eine** kräftige Akzentfarbe, nur für die Hauptaktion; der Rest ruhig.
- Kein reines Schwarz (#000) und kein reines Weiß (#FFF); leicht getönte Neutraltöne.
- Einheitliche Abstands-Skala (z. B. 4/8/12/16/24/32) und einheitliche Radien. Abstände überall gleich.
- Gut gewählte Schriftkombination, die zur Marke passt.
- Optional ein Maskottchen: flach, dicke Konturen, höchstens 2 Farben, kein 3D, kein Verlauf.

**Vermeide diese 20 typischen „KI-gebaut“-Merkmale:**

1. Lila-blauer Farbverlauf
2. Überschrift mit Farbverlauf
3. Emojis in Überschriften
4. Überall die Schrift Inter
5. Karten mit farbigem Rand (links)
6. Milchglas-Karten (Glassmorphism)
7. Dark Mode mit schwachem Kontrast
8. Drei Icon-Kästen nebeneinander
9. Kleines Badge über der Überschrift
10. Überall Lucide-Icons
11. Unveränderte shadcn-Komponenten
12. Abschnitte, die beim Scrollen einblenden
13. Lichtstrahl, der dem Mauszeiger folgt
14. Buttons, die beim Drüberfahren verblassen
15. Uneinheitliche Abstände
16. Überall lange Gedankenstriche (—) im Text
17. Texte voller Schlagwörter
18. Kursive Serifenschrift als Akzent
19. Die Kombination Space Grotesk + Instrument Serif
20. Körnung über einem Farbverlauf

Dazu: kein generisches Glühen um wichtige Texte, kein Standard-Dark-Theme mit Basis-Akzentfarbe.

Hilfen, falls verfügbar: Taste Skill, UI UX Pro Max (Skill), Web Interface Guidelines (Audit des Codes), 21st.dev (Komponenten als Vorlage, an meinen Stil anpassen). Wenn ich dir einen Screenshot einer App schicke, die mir gefällt, übernimm deren Prinzipien, nicht 1:1 das Design.

## 13. Texte in der App

- Alltagssprache aus Sicht des Nutzers, kurz und konkret.
- Buttons sagen genau, was passiert („Speichern“, „Abo starten“), nicht „OK“ oder „Weiter“, wo es mehr sagen kann.
- Keine Schlagwörter, keine Werbesprache in der Bedienung.

## Abnahme: erst fertig, wenn alles stimmt

- [ ] Jeder Screen hat genau eine klare Hauptaktion
- [ ] Jeder Tap gibt sofort Feedback; nichts kann doppelt ausgelöst werden
- [ ] Überall Skeletons statt Spinner
- [ ] Keine rohe Fehlermeldung erreichbar
- [ ] Tastatur verdeckt nie ein Feld; Eingaben bleiben bei Zurück erhalten
- [ ] Onboarding-Button immer an derselben Stelle; erst nutzen, dann Account
- [ ] Paywall: Preis, Laufzeit und Testphasen-Zeitleiste sichtbar, keine Dark Patterns
- [ ] KI ist vor der ersten Nachricht gekennzeichnet; Einwilligung vorhanden
- [ ] Hell und dunkel gut lesbar
- [ ] 200 % Schriftgröße ohne Abschneiden (iOS, Android, Web)
- [ ] Screenreader und (Web) Tastatur funktionieren
- [ ] Handy, Tablet und Desktop geprüft
- [ ] Keines der 20 KI-Merkmale mehr vorhanden
- [ ] Alle Farben, Schriften, Abstände aus der zentralen Theme-Datei

Gib mir am Ende eine Liste, was du geändert hast, was noch offen ist und wo du meine Entscheidung brauchst.
