# Paket 089 · wording

Schritte: 13 · Dateien: web/js/coach.js, web/js/lang/en.js, web/js/lang/es.js, web/js/lang/hi.js, web/js/lang/pt.js, web/js/lang/zh.js, web/js/screens/mentor.js, web/js/screens/news.js, web/js/screens/notebook.js, web/js/screens/progress.js, web/js/widgets.js
Betroffene Tests laut Spezifikation: Akzeptanz grep 7; web/e2e/langtest.js
Baut auf Paketen auf: 15, 21, 24, 30, 34, 35, 38, 41, 52, 65, 66, 68, 69, 74, 79, 80, 81, 84, 85, 86

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## diagramme-E8a · Widget-Name kum_pnl → „Kumulierter Netto-P&L“

Gruppe diagramme · Cluster wording · Aufwand S · Befunde: diagramme-13
Quelle: audit/spec/diagramme.md Z. 588–589 · Dateien: web/js/widgets.js
Abhängig von: —

```text
**E8 Widget-Registry: Namen, Texte, Legenden, Serienfarben**
- Z. 228 (diagramme-13): `name: 'Kumulierter Tages-P&L'` → `name: 'Kumulierter Netto-P&L'`.
```

## diagramme-E8c · Info perf_uhrzeit/perf_haltedauer: „Break-even-Trades liegen auf der Nulllinie.“

Gruppe diagramme · Cluster wording · Aufwand S · Befunde: bereich_dashboard-36
Quelle: audit/spec/diagramme.md Z. 594–594 · Dateien: web/js/widgets.js
Abhängig von: —

```text
- Z. 232 und Z. 241 (bereich_dashboard-36): im `info` den Satz `Blau sind Break-even-Trades.` → `Break-even-Trades liegen auf der Nulllinie.`
```

## diagramme-E8d · taeglich_kumuliert: desc und info (Linie statt Fläche)

Gruppe diagramme · Cluster wording · Aufwand S · Befunde: diagramme-18
Quelle: audit/spec/diagramme.md Z. 595–595 · Dateien: web/js/widgets.js
Abhängig von: —

```text
- Z. 251 (diagramme-18): `desc` → `'Säulen für den Tages-P&L und eine Linie für den kumulierten P&L in einem Diagramm.'`, `info` → `'Säulen: Netto-Ergebnis je Handelstag. Linie: kumuliertes Ergebnis im Zeitraum.'`
```

## diagramme-H3 · Info Trading-Aktivität: „desto kräftiger das Kästchen“

Gruppe diagramme · Cluster wording · Aufwand S · Befunde: farbe_kontrast-21
Quelle: audit/spec/diagramme.md Z. 638–639 · Dateien: web/js/screens/progress.js
Abhängig von: —

```text
**H3 Info-Text** (farbe_kontrast-21) Z. 71: `Je mehr Trades, desto kräftiger das Grün.` → `Je mehr Trades, desto kräftiger das Kästchen.`

```

## diagramme-3.14a · Sprachdateien: ersetzte Info-/Beschreibungssätze (Trefferquote-Verlauf, Uhrzeit, Haltedauer, Täglich & kumuliert, Trading-Aktivität)

Gruppe diagramme · Cluster wording · Aufwand M · Befunde: bereich_dashboard-36, diagramme-6, diagramme-18, farbe_kontrast-21
Quelle: audit/spec/diagramme.md Z. 713–724 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/pt.js, web/js/lang/hi.js, web/js/lang/zh.js
Abhängig von: diagramme-E8b, diagramme-E8c, diagramme-E8d, diagramme-H3

```text
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
```

## diagramme-3.14b · Sprachdateien: neue Beschriftungen (Startkapital, Median, Ruin, Zeiteinheiten, Verstöße, Boden, Trade-Details)

Gruppe diagramme · Cluster wording · Aufwand M · Befunde: diagramme-15, diagramme-21, bereich_statistik-44, bereich_dashboard-35, diagramme-12, bereich_training-30, diagramme-39, bereich_notebook_news-18
Quelle: audit/spec/diagramme.md Z. 725–741 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/pt.js, web/js/lang/hi.js, web/js/lang/zh.js
Abhängig von: diagramme-C11, diagramme-C16, diagramme-C17, diagramme-E6, diagramme-I1, diagramme-J1, diagramme-L1

```text
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

```

## diagramme-3.14c · Sprachdateien: alte Schlüssel entfernen („Kumulierter Tages-P&L“, alte Satzfassungen en.js:48, 534, 868–871)

Gruppe diagramme · Cluster wording · Aufwand S · Befunde: diagramme-13, bereich_dashboard-36, diagramme-6, diagramme-18, farbe_kontrast-21
Quelle: audit/spec/diagramme.md Z. 742–743 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/pt.js, web/js/lang/hi.js, web/js/lang/zh.js
Abhängig von: diagramme-3.14a, diagramme-E8a, diagramme-F3

```text
Den Schlüssel „Kumulierter Tages-P&L“ (en.js:772) und die alten Fassungen der ersetzten Sätze (en.js:48, 534, 868–871) entfernen. „Kumulierter Netto-P&L“ existiert schon (en.js:372).

```

## zustaende-S-CO2 · Coach-Health: HTTP-Wortlaut „Der Server antwortet mit Fehler {0}.“

Gruppe zustaende · Cluster wording · Aufwand S · Befunde: zustaende-18
Quelle: audit/spec/zustaende.md Z. 604–606 · Dateien: web/js/coach.js
Abhängig von: —

```text
**S-CO2 HTTP-Wortlaut** – zustaende-18
Z. 43 `` `Server antwortet mit ${r.status}` `` → `` `Der Server antwortet mit Fehler ${r.status}.` ``. Z. 41 bleibt.

```

## zustaende-S-NW3 · News: Offline-Wortlaut mit „und deine Verbindung“

Gruppe zustaende · Cluster wording · Aufwand S · Befunde: zustaende-18
Quelle: audit/spec/zustaende.md Z. 807–809 · Dateien: web/js/screens/news.js
Abhängig von: —

```text
**S-NW3 Offline-Wortlaut** – zustaende-18
Z. 28 `'Der Server ist nicht erreichbar. Prüf die Adresse unter Einstellungen → Mentor.'` → `'Der Server ist nicht erreichbar. Prüf die Adresse unter Einstellungen → Mentor und deine Verbindung.'`

```

## zustaende-S-MT2 · Mentor: einheitlicher Offline- und HTTP-Wortlaut

Gruppe zustaende · Cluster wording · Aufwand S · Befunde: zustaende-18
Quelle: audit/spec/zustaende.md Z. 842–845 · Dateien: web/js/screens/mentor.js
Abhängig von: —

```text
**S-MT2 Wortlaut** – zustaende-18
- Z. 17 `'Der Mentor-Server ist nicht erreichbar. …'` → `'Der Server ist nicht erreichbar. Prüf die Adresse unter Einstellungen → Mentor und deine Verbindung.'`
- Z. 127 `'Server antwortet mit ' + r.status` → `'Der Server antwortet mit Fehler ' + r.status + '.'`

```

## zustaende-S-NB3 · Notebook-Speicherstand „Wird gespeichert …“

Gruppe zustaende · Cluster wording · Aufwand S · Befunde: bereich_notebook_news-24
Quelle: audit/spec/zustaende.md Z. 855–857 · Dateien: web/js/screens/notebook.js
Abhängig von: zustaende-S-C14

```text
**S-NB3 Speicherstand** – bereich_notebook_news-24
Z. 100 `'Speichert…'` → `'Wird gespeichert …'`. Die Klasse `saving` darf bleiben (hat keine Farbe mehr).

```

## zustaende-S-L · Sprachdateien en/es/hi/pt/zh: alle neuen Schlüssel ergänzen, alte kleingeschriebene Countdown-Schlüssel entfernen

Gruppe zustaende · Cluster wording · Aufwand L · Befunde: —
Quelle: audit/spec/zustaende.md Z. 870–874 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/hi.js, web/js/lang/pt.js, web/js/lang/zh.js
Abhängig von: —

```text
### 3.23 `web/js/lang/{en,es,hi,pt,zh}.js` – S-L

Neue Schlüssel (deutsch → englisch; es/pt/hi/zh sinngemäß in derselben Form, Platzhalter beibehalten):
„Noch keine Trades“ → „No trades yet“; „Logge deinen ersten Trade oder importiere eine CSV-Datei.“ → „Log your first trade or import a CSV file.“; „Keine abgeschlossenen Trades im Zeitraum“ → „No closed trades in this period“; „Ändere den Zeitraum oder logge Trades.“ → „Change the period or log trades.“; „Keine Trades im Zeitraum“ → „No trades in this period“; „Keine Handelstage im Zeitraum“ → „No trading days in this period“; „Keine Trades passen zum Filter“ → „No trades match the filter“; „Ändere die Filter oder den Zeitraum.“ → „Change the filters or the period.“; „Noch keine abgeschlossenen Trades“ → „No closed trades yet“; „Noch keine abgeschlossenen Trades.“ → „No closed trades yet.“; „Noch keine Daten“ → „No data yet“; „Noch keine Wochen“ → „No weeks yet“; „Zu wenig Trades“ → „Not enough trades“; „Mindestens {0} Trades mit R-Wert nötig“ → „At least {0} trades with an R value needed“; „Der gleitende Durchschnitt erscheint ab {0} Trades mit R-Wert.“ → „The rolling average appears after {0} trades with an R value.“; „Keine Trades mit R im Zeitraum“ → „No trades with R in this period“; „Trage in der Trade-Ansicht unter „Plan & Bewertung“ einen Stop ein, dann wird das R-Multiple berechnet.“ → „Enter a stop under “Plan & review” in the trade view to calculate the R multiple.“; „Noch keine Regeln angelegt.“ → „No rules yet.“; „Regeln anlegen“ → „Add rules“; „Vorzeitraum: {0}“ → „Previous period: {0}“; „Symbol wählen“, „Long oder Short wählen“ (falls fehlend) → „Choose a symbol“, „Choose long or short“; „Einstieg eintragen“ → „Enter the entry“; „Kontrakte eintragen“ → „Enter the contracts“; „Datum eintragen“ → „Enter the date“; „Ausstieg eintragen oder Geschlossen leeren“ → „Enter the exit or clear Closed“; „Pflichtfeld“ → „Required“; „Mindestens {0}“ → „At least {0}“; „Höchstens {0}“ → „At most {0}“; „Gültige E-Mail-Adresse eintragen“ → „Enter a valid email address“; „Ungültiger Wert“ → „Invalid value“; „In {0} Min.“ → „In {0} min“; „In {0} Std. {1} Min.“ → „In {0} h {1} min“; „In {0} Std.“ → „In {0} h“; „In {0} Tagen“ → „In {0} days“ (alte kleingeschriebene Schlüssel „jetzt“, „morgen“, „in {0} …“ entfernen, wenn grep keine weitere Nutzung findet); „Wird gespeichert …“ → „Saving …“; „Wird geladen …“ → „Loading …“; „{0} abgeschlossen“ → „{0} closed“; „Summe aller abgeschlossenen Trades im Zeitraum, bei aktiver Suche oder aktivem Filter nur der gefilterten. Daneben der Verlauf je Handelstag.“ → „Sum of all closed trades in the period; with an active search or filter, only the filtered ones. Next to it, the curve per trading day.“; „Ungültiges Datum“ → „Invalid date“; „Die Adresse enthält kein gültiges Datum.“ → „The address does not contain a valid date.“; „Zum heutigen Tag“ → „Go to today“; „Verpassten Trade löschen?“ → „Delete missed trade?“; „Der Eintrag wird dauerhaft entfernt.“ → „The entry will be removed permanently.“; „Screenshot löschen?“ → „Delete screenshot?“; „Screenshot vor Entry löschen?“ → „Delete pre-entry screenshot?“; „Das Bild wird dauerhaft entfernt.“ → „The image will be removed permanently.“; „Sprachnotiz löschen?“ → „Delete voice note?“; „Aufnahme und Transkript werden dauerhaft entfernt.“ → „The recording and transcript will be removed permanently.“; „Check-in löschen?“ → „Delete check-in?“; „Die Angaben dieses Check-ins werden gelöscht.“ → „This check-in’s entries will be deleted.“; „Regel löschen?“ → „Delete rule?“; „„{0}“ wird gelöscht. Zum Pausieren reicht der Schalter.“ → „“{0}” will be deleted. To pause it, use the switch.“; „Session verwerfen?“ → „Discard session?“; „Deine Eingaben aus dieser Session gehen verloren.“ → „Your entries from this session will be lost.“; „Verwerfen“ → „Discard“; „Tags auf Standard zurücksetzen“ → „Reset tags to default“; „Tags auf Standard zurücksetzen?“ → „Reset tags to default?“; „Adresse speichern“ → „Save address“; „Trage zuerst eine E-Mail-Adresse ein“ → „Enter an email address first“; „E-Mail-Benachrichtigung aus“ → „Email notifications off“; „Schick den Einladungslink oben an deine Schüler. Wer beitritt, erscheint hier mit Kurz-Stats.“ → „Send the invite link above to your students. Anyone who joins appears here with quick stats.“; „Boden fest“ → „floor locked“; „Ab zwei Grabsteinen erscheinen Muster: Uhrzeit, Wochentag, Symbol, Setup, Verlustserie oder Emotion, wenn sie sich wiederholen.“ → „From two tombstones on, patterns appear: time, weekday, symbol, setup, losing streak or emotion, when they repeat.“; „{0} T“ → „{0} d“; „{0} s“ → „{0} s“. Prop-Bilanz-Texte („noch keine Ausgaben“) sind wie der Rest der Bilanz noch nicht übersetzt und brauchen keinen Schlüssel.

```

## barrierefreiheit-D1 · Wörterbücher: alle Glossar-Schlüssel aus Z8 in en/es/pt/zh/hi, alte Toast-Schlüssel entfernen, „Session beenden“ nachtragen, Muster-Schlüssel (D1+D2)

Gruppe barrierefreiheit · Cluster wording · Aufwand L · Befunde: bereich_dashboard-40, barrierefreiheit-12, barrierefreiheit-13, barrierefreiheit-17, barrierefreiheit-31, barrierefreiheit-34, barrierefreiheit-35, barrierefreiheit-36, barrierefreiheit-37, barrierefreiheit-38, barrierefreiheit-39, bereich_einstellungen-20, bereich_einstellungen-21, bereich_statistik-33, wording-1, bereich_shell-14, barrierefreiheit-49, barrierefreiheit-11, bereich_notebook_news-35
Quelle: audit/spec/barrierefreiheit.md Z. 888–895 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/pt.js, web/js/lang/zh.js, web/js/lang/hi.js
Abhängig von: barrierefreiheit-U3a, barrierefreiheit-U6a, barrierefreiheit-H1, barrierefreiheit-H2, barrierefreiheit-P9, barrierefreiheit-P11, barrierefreiheit-P12, barrierefreiheit-P13, barrierefreiheit-P14a, barrierefreiheit-P15, barrierefreiheit-C-widgets-36, barrierefreiheit-C-widgets-115, barrierefreiheit-C-widgets-170-174, barrierefreiheit-C-widgets-222-234, barrierefreiheit-C-widgets-374, barrierefreiheit-C-editor-41-42, barrierefreiheit-C-editor-112, barrierefreiheit-C-editor-118-164, barrierefreiheit-C-trades-49, barrierefreiheit-C-trades-50, barrierefreiheit-C-trades-59, barrierefreiheit-C-trades-77-116, barrierefreiheit-C-stats-15, barrierefreiheit-C-notebook-28-74, barrierefreiheit-C-dashboard-78, barrierefreiheit-C-dash-filter-95-121, barrierefreiheit-C-misc-93-145, barrierefreiheit-C-misc-186-207, barrierefreiheit-C-misc-238-259, barrierefreiheit-C-misc-365, barrierefreiheit-C-prop-233-267, barrierefreiheit-C-mentor-83-111

```text
### Phase D – Wörterbücher

#### `web/js/lang/{en,es,pt,zh,hi}.js`

- **D1:** Alle Schlüssel aus dem Glossar Z8 eintragen. „Einstiegskurs fehlt“ und „Ausstiegskurs fehlt für geschlossenen Trade“ entfernen, „Session beenden“ nachtragen (fehlt heute in en.js).
- **D2:** Muster mit `{0}`, `{1}`, `{2}` als Muster-Schlüssel. Doppelte `{n}` in einem Schlüssel vermeiden; dafür sind die Serien- und Diagramm-Labels über `I18N.t` gebaut.
- Befunde: alle mit neuen Texten (bereich_dashboard-40, barrierefreiheit-12, barrierefreiheit-13, barrierefreiheit-17, barrierefreiheit-31, barrierefreiheit-34, barrierefreiheit-35, barrierefreiheit-36, barrierefreiheit-37, barrierefreiheit-38, barrierefreiheit-39, bereich_einstellungen-20, bereich_einstellungen-21, bereich_statistik-33, wording-1, bereich_shell-14, barrierefreiheit-49, barrierefreiheit-11, bereich_notebook_news-35)

```
