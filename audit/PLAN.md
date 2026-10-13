# Umsetzungsplan Design-Audit

1125 Schritte aus 12 Zielspezifikationen (audit/spec/*.md) · 314 Entscheidungen zu Überschneidungen (plan/entscheid-*.json) · 1042 aktiv, 70 entfallen (doppelt oder überstimmt), 15 warten auf eine Nutzerfrage · 77 Pakete in 36 Wellen.

Ablauf je Paket: Umsetzer in eigener Arbeitskopie (git-Worktree) → strenger Prüfer → Zusammenführen in den Hauptzweig mit vollem Testlauf (alle Suiten) → Push. Pakete einer Welle laufen parallel.

## Pakete

| Paket | Cluster | Schritte | Baut auf | Dateien |
|---|---|---|---|---|
| 001 | tokens | 21 | — | README.md, app.html, css/app.css, index.html, js/theme.js |
| 002 | tokens | 23 | 001 | scratchpad/localfonts.js, README.md, css/app.css, css/landing.css, e2e/localfonts.js |
| 003 | tokens | 9 | — | app.html, css/app.css, e2e/motiontest.js, index.html, js/sample.js, js/ui.js |
| 004 | komponenten | 29 | 001 | README.md, css/app.css, js/ui.js |
| 005 | komponenten, tokens | 34 | 001, 002, 004 | README.md, css/app.css, css/landing.css, index.html, js/app.js, js/ui.js |
| 006 | komponenten | 33 | 001, 002, 004, 005 | README.md, css/app.css, js/app.js, js/datepicker.js, js/screens/dash-filter.js, js/ui.js |
| 007 | komponenten | 30 | 001, 003, 006 | README.md, css/app.css, css/landing.css, e2e/dashtest.js, js/app.js, js/datepicker.js … |
| 008 | komponenten | 7 | 006, 007 | css/app.css, e2e/motiontest.js, js/datepicker.js |
| 009 | shell | 4 | 001, 002, 004 | css/app.css, js/screens/dashboard.js |
| 010 | shell, tokens | 27 | 001, 002, 006, 009 | README.md, app.html, css/app.css, e2e/coachtest.js, e2e/navdottest.js, e2e/sidebartest.js … |
| 011 | aufbau, shell | 10 | 002, 009, 010 | css/app.css, css/landing.css, index.html, js/app.js, js/screens/dashboard.js |
| 012 | dashboard | 21 | 001, 002, 004 | README.md, css/app.css, e2e/dashtest.js, js/screens/dashboard.js, js/widgetpreviews.js, js/widgets.js |
| 013 | dashboard, komponenten | 29 | 001, 002, 005, 006, 012 | README.md, css/app.css, e2e/headtest.js, js/screens/dashboard.js, js/widgets.js |
| 014 | dashboard, komponenten | 35 | 001, 003, 006, 007, 008, 013 | css/app.css, e2e/dashtest.js, e2e/leaktest.js, js/screens/dash-filter.js, js/screens/dashboard.js, js/widgetpreviews.js … |
| 015 | statistik | 37 | 001, 002, 004, 005, 006, 007, 009 | css/app.css, e2e/scorestatetest.js, js/core.js, js/screens/stats.js, tests/core.test.mjs |
| 016 | statistik | 8 | 003, 007, 015 | css/app.css, js/core.js, js/screens/stats.js |
| 017 | trades_tag | 26 | 001, 002, 004, 005, 010 | README.md, css/app.css, e2e/mobiletest.js, js/app.js, js/screens/day.js, js/screens/trades.js |
| 018 | trades_tag | 9 | 006, 017 | css/app.css, js/app.js, js/screens/day.js, js/screens/trades.js |
| 019 | trades_tag, shell | 34 | 003, 006, 007, 011, 017, 018 | README.md, app.html, css/app.css, e2e/sampletest.js, js/app.js, js/screens/day.js … |
| 020 | trades_tag | 8 | 007, 008 | css/app.css, js/app.js, js/screens/day.js, js/screens/trades.js |
| 021 | notebook_news | 28 | 001, 002 | README.md, css/app.css, e2e/newstest.js, js/editor.js, js/screens/news.js, js/screens/notebook.js |
| 022 | notebook_news | 32 | 001, 006, 021 | README.md, css/app.css, e2e/newstest.js, e2e/sixtest.js, js/editor.js, js/sample.js … |
| 023 | notebook_news | 7 | 007, 010, 021 | css/app.css, js/editor.js, js/screens/news.js, js/screens/notebook.js |
| 024 | training | 28 | 001, 002, 005, 007 | css/app.css, e2e/rptest.js, e2e/shadowtest.js, js/screens/mentor.js, js/screens/progress.js, js/screens/ruhepunkt.js … |
| 025 | training, aufbau, dashboard | 18 | 001, 007, 011, 015, 018, 019, 022, 024 | README.md, css/app.css, js/screens/mentor.js, js/screens/progress.js, js/screens/ruhepunkt.js, js/screens/shadow.js |
| 026 | training, komponenten | 10 | 003, 007, 014, 016, 019, 025 | css/app.css, js/screens/progress.js, js/screens/replay.js, js/screens/ruhepunkt.js, js/ui.js |
| 027 | prop | 34 | 001, 002, 004, 005, 006, 007 | css/app.css, e2e/proptest.js, js/screens/prop-friedhof.js, js/screens/prop.js |
| 028 | prop | 24 | 003, 007 | css/app.css, e2e/friedhoftest.js, e2e/proptest.js, js/screens/prop-friedhof.js, js/screens/prop.js |
| 029 | konto, prop | 30 | 001, 002, 005, 006, 011, 028 | README.md, css/app.css, js/certificate.js, js/screens/affiliate.js, js/screens/coach.js, js/screens/prop-friedhof.js |
| 030 | konto, statistik | 10 | 007, 011, 015, 029 | css/app.css, e2e/affiliatetest.js, e2e/calmnavtest.js, e2e/chartanimtest.js, e2e/coachtest.js, js/certificate.js … |
| 031 | konto, dashboard | 21 | 006, 007, 030 | css/app.css, e2e/affiliatetest.js, e2e/coachtest.js, js/certificate.js, js/coach.js, js/screens/affiliate.js … |
| 032 | einstellungen | 26 | 001, 002 | css/app.css, js/screens/misc.js, js/theme.js |
| 033 | einstellungen | 1 | 002, 032 | js/screens/misc.js |
| 034 | einstellungen, tokens | 16 | 002, 005, 006, 011, 013, 017, 021, 029, 032, 033 | css/app.css, e2e/settest2.js, js/app.js, js/screens/misc.js, tests/inline-style.test.mjs |
| 035 | einstellungen, aufbau | 19 | 027, 028, 029, 030, 034 | README.md, css/app.css, e2e/settest.js, js/screens/misc.js |
| 036 | responsiv | 2 | 001 | css/app.css |
| 037 | responsiv, dashboard | 9 | 002, 005, 010, 011, 013, 032, 036 | README.md, css/app.css, e2e/mobiletest.js, e2e/rangetest.js |
| 038 | responsiv, shell | 11 | 001, 006, 010, 011, 013, 014, 022, 037 | README.md, css/app.css, js/screens/dashboard.js, js/ui.js |
| 039 | trades_tag, komponenten, statistik | 4 | 007, 015, 019, 038 | js/screens/day.js, js/screens/stats.js, js/screens/trades.js, js/ui.js |
| 040 | training, notebook_news | 6 | 023, 026, 038 | css/app.css, js/screens/mentor.js, js/screens/notebook.js, js/screens/progress.js, js/screens/shadow.js |
| 041 | responsiv, prop, konto | 6 | 002, 031, 038 | css/app.css, js/screens/coach.js, js/screens/prop.js |
| 042 | responsiv, komponenten, trades_tag | 4 | 007, 041 | css/app.css, js/app.js |
| 043 | responsiv | 4 | 007, 016, 023, 031, 040, 041, 042 | css/app.css, e2e/runall.sh, e2e/tablettest.js, js/screens/dash-filter.js |
| 044 | konto, responsiv, trades_tag | 3 | 007, 019, 031, 043 | css/app.css, js/screens/coach.js, js/screens/trades.js |
| 045 | diagramme, statistik | 7 | — | css/app.css, js/core.js, js/screens/stats.js, js/ui.js |
| 046 | diagramme, prop | 5 | 001 | css/app.css, js/screens/prop.js |
| 047 | diagramme, konto | 5 | — | js/screens/affiliate.js, js/ui.js |
| 048 | diagramme, responsiv | 9 | 015, 038, 046, 047 | js/app.js, js/ui.js |
| 049 | diagramme, statistik | 3 | 015, 046, 047, 048 | README.md, js/ui.js |
| 050 | training, diagramme | 2 | 025, 047, 049 | README.md, js/widgets.js |
| 051 | diagramme, training | 32 | 003, 007, 015, 025, 045, 046, 047, 048, 049, 050 | README.md, css/app.css, e2e/dashtest.js, e2e/shadowtest.js, js/screens/shadow.js, js/ui.js … |
| 052 | diagramme | 5 | 003, 051 | README.md, css/app.css, e2e/chartanimtest.js, js/ui.js |
| 053 | zustaende | 7 | 002, 010 | README.md, css/app.css, js/screens/dash-filter.js, js/widgets.js |
| 054 | trades_tag, prop, einstellungen | 4 | 053 | js/screens/day.js, js/screens/misc.js, js/screens/prop.js, js/screens/trades.js |
| 055 | zustaende, dashboard, trades_tag | 5 | 013, 014 | css/app.css, js/screens/trades.js, js/widgets.js |
| 056 | zustaende, notebook_news, konto | 5 | 002, 005 | css/app.css, js/screens/coach.js, js/screens/news.js, js/ui.js |
| 057 | diagramme, zustaende, prop | 6 | 051, 056 | e2e/dashtest.js, js/screens/prop.js, js/ui.js, js/widgets.js |
| 058 | zustaende, dashboard, diagramme | 8 | 002, 007, 010, 014, 031, 055, 056 | README.md, e2e/dashtest.js, js/app.js, js/ui.js, js/widgets.js |
| 059 | barrierefreiheit | 10 | 003 | css/app.css, css/landing.css, js/screens/progress.js, js/ui.js |
| 060 | komponenten, notebook_news, konto, barrierefreiheit | 6 | 059 | css/app.css, js/screens/coach.js, js/screens/notebook.js, js/ui.js |
| 061 | trades_tag, zustaende, komponenten | 5 | 007, 017, 018, 019, 055, 058, 060 | e2e/dptest.js, js/app.js, js/screens/trades.js |
| 062 | barrierefreiheit, komponenten, notebook_news | 4 | 007, 060 | js/app.js, js/editor.js, js/ui.js |
| 063 | training, komponenten, shell, trades_tag | 6 | 007, 062 | e2e/notechecktest.js, js/app.js, js/screens/day.js, js/screens/progress.js |
| 064 | einstellungen | 6 | 006, 007, 034, 062 | README.md, e2e/settest.js, js/screens/misc.js |
| 065 | dashboard, barrierefreiheit, shell | 4 | 060, 062 | js/app.js, js/widgets.js |
| 066 | trades_tag | 4 | 006, 007, 060, 062, 065 | js/app.js, js/screens/trades.js |
| 067 | barrierefreiheit, notebook_news, einstellungen | 6 | 003, 007, 014, 015, 027, 031, 060, 062, 065 | README.md, app.html, e2e/affiliatetest.js, e2e/calmnavtest.js, e2e/friedhoftest.js, e2e/proptest.js … |
| 068 | wording, barrierefreiheit, einstellungen | 34 | 009, 010, 012, 013, 014, 015, 017, 018, 019, 021, 022, 024, 025, 027, 030, 032, 034, 045, 048, 049, 051, 054, 057, 064, 067 | js/app.js, js/coach.js, js/lang/en.js, js/lang/es.js, js/lang/hi.js, js/lang/pt.js … |
| 069 | wording | 24 | 003, 007, 010, 025, 028, 031, 032, 040, 041, 067, 068 | README.md, js/app.js, js/coach.js, js/core.js, js/lang/en.js, js/lang/es.js … |
| 070 | wording, einstellungen | 7 | 007, 014, 016, 019, 020, 023, 026, 028, 031, 034, 035, 044, 051, 064, 069 | e2e/navdottest.js, js/lang/en.js, js/lang/es.js, js/lang/hi.js, js/lang/pt.js, js/lang/zh.js … |
| 071 | wording, konto | 6 | 007, 014, 016, 019, 020, 026, 028, 031, 035, 044, 051, 069, 070 | README.md, e2e/coachlang.js, e2e/coachtest.js, e2e/dashtest.js, e2e/i18n/en/part-audit-wording.json, e2e/i18n/es/part-audit-wording.json … |
| 072 | bewegung, diagramme | 6 | 047, 051 | README.md, css/app.css, css/landing.css, e2e/affiliatetest.js, e2e/headtest.js, js/ui.js |
| 073 | bewegung, wording | 12 | 003, 007, 008, 010, 011, 014, 020, 023, 038, 040, 041, 042, 072 | README.md, css/app.css, e2e/motiontest.js, js/app.js, js/motion.js, js/ui.js |
| 074 | shell, komponenten | 4 | 002, 005, 010, 060, 075, 076 | app.html, css/app.css |
| 075 | trades_tag, training, responsiv | 3 | 007, 010, 014, 023, 038, 039, 040, 041, 062, 068, 072, 074, 076 | e2e/mobiletest.js, js/screens/mentor.js, js/screens/trades.js |
| 076 | zustaende, barrierefreiheit | 4 | 005, 007, 022, 037, 061, 062, 063, 067, 074, 077 | app.html, css/app.css, e2e/runall.sh, js/app.js |
| 077 | wording | 1 | 010, 014, 015, 019, 022, 027, 035, 051, 060, 061, 062, 065, 066, 067, 074, 075 | js/lang/en.js, js/lang/es.js, js/lang/hi.js, js/lang/pt.js, js/lang/zh.js |

## Wellen

- Welle 1: 001, 003
- Welle 2: 002, 004, 036, 046
- Welle 3: 005, 009, 021, 032
- Welle 4: 006, 012, 033
- Welle 5: 007, 013, 022
- Welle 6: 008, 010, 015, 024
- Welle 7: 011, 016, 023, 027
- Welle 8: 014, 017, 028, 045
- Welle 9: 018, 029, 037, 053
- Welle 10: 019, 030, 038
- Welle 11: 020, 025, 031
- Welle 12: 026, 034, 041, 055
- Welle 13: 035, 039, 040, 042
- Welle 14: 043, 047, 054
- Welle 15: 044, 048
- Welle 16: 049
- Welle 17: 050, 056
- Welle 18: 051
- Welle 19: 052
- Welle 20: 057
- Welle 21: 058
- Welle 22: 059
- Welle 23: 060
- Welle 24: 061, 072
- Welle 25: 062
- Welle 26: 063, 064
- Welle 27: 065
- Welle 28: 066, 067
- Welle 29: 068
- Welle 30: 069
- Welle 31: 070, 073
- Welle 32: 071
- Welle 33: 074
- Welle 34: 075
- Welle 35: 077
- Welle 36: 076

## Fragen an dich (werden bis zur Antwort nicht umgesetzt)

- **farbe · bereich_trades_tag-17:** Die Long/Short-Abzeichen sind heute grün bzw. rot (README Z. 45–46). Dadurch steht oft ein rotes „SHORT“ neben einem grünen Gewinn. Sollen Fläche, Rand und Schrift der Abzeichen neutral werden, sodass nur der kleine Pfeil im Kreis die Richtungsfarbe behält? Empfehlung: Ja. In .badge (app.css:618–619) Schrift auf --text-2, Rand auf --border und Fläche auf --surface-2 setzen. Der Pfeil-Kreis (--c, .badge .bi) bleibt grün bzw. rot, Schreibweise LONG/SHORT und Größe bleiben. README Z. 45–46 und den Kommentar Z. 617 anpassen. Long/Short-Umschalter im Trade-Dialog und Dashboard-Filter bleiben farbig. Die Variante „auch der Pfeil grau“ empfehle ich nicht.
- **typografie · referenz-43:** Das Gesamt-Score-Widget hast du „wieder wie am Anfang“ herstellen lassen. Soll „Dein Score“ trotzdem wie alle anderen Wert-Beschriftungen normal geschrieben werden (13/500 statt 11/600 in Versalien)? Radar, Skala und Zahl bleiben unverändert. Empfehlung: Ja. Sonst bleibt es die einzige Versal-Beschriftung über einem Wert in der App.
- **typografie · bereich_training-21:** Der Prüfvorschlag will die eigenen Farben des Serie-Stufenworts („Im Flow“ in Akzent, „Unaufhaltsam“ mit Verlauf, app.css Z. 1266–1267) löschen und alles grau setzen. Sollen die Stufenfarben entfallen? Empfehlung: Nein. Die Stufenfarben bleiben (README Z. 129–133). Umgesetzt wird nur Gewicht 700 → 600 und Laufweite .08em → .06em.
- **abstaende · bereich_notebook_news-13:** Die Werkzeugleiste im Notiz-Editor bricht bei 1440 px um; in Zeile 2 steht nur das Bild-Symbol. Laut README hat die Leiste einen eigenen Teil „Bild (Datei oder Adresse)“. Dürfen „Bild hochladen“ und „Bild über Adresse“ ins „+“-Menü wandern? Strg+V, Ziehen und „/“ bleiben, und Hochladen öffnet weiter direkt die Dateiauswahl. Empfehlung: Ja. Zusammen mit einem festen 116 px breiten Umwandeln-Knopf und schmaleren Trennern passt die Leiste dann bei 1440 px in eine Zeile, für alle Absatzformate. Bei 1366 und 1280 px bricht sie in zwei volle Reihen um, ein verstecktes seitliches Scrollen am PC gibt es nicht. Anzupassen sind dann `imgtest.js`, `figtest.js` und README Z. 123–125. Die genauen Schritte stehen in Abschnitt 6 der Spezifikation.
- **komponenten · komponenten-1:** Die gefüllten Bestätigen-Knöpfe (Speichern, Anwenden, Konto anlegen …) sind heute vollflächig grün, obwohl Grün nur Gewinn und ‚Trade loggen‘ zeigen soll. Welche Füllung sollen sie bekommen: (A) bleibt grün, (B) neutrale Vollfläche in Textfarbe (dunkel fast weiß, hell fast schwarz) oder (C) ruhige graue Fläche? Und soll ‚Trade speichern‘ im Trade-Dialog wie ‚Trade loggen‘ aussehen? (betrifft auch bereich_konto-5 und referenz-6 der Gruppe Farbe) Empfehlung: B (app.css Z.274: background/border var(--text), color var(--bg), 600; Hover color-mix 86 %, ohne Schatten). primary steht danach nur noch in Dialogen, Popovern und Hauptformularen, also fast nie neben ‚Trade loggen‘. Zusatzfrage: nein, alle Dialog-Bestätigungen sollen gleich aussehen.
- **komponenten · ki_look-11:** In der README steht für den Kalender-Tagesbetrag ‚am PC kräftiger, Onest 800‘. Deine allgemeine Regel lautet ‚nur Werte 700‘. Soll der Betrag auf 700 wie alle anderen Werte? Empfehlung: Ja, 700: app.css Z.721 font-weight 800 → 700, README Z.191 anpassen.
- **komponenten · ki_look-19:** Jede Trade-Zeile zeigt eine Pille ‚Gewinn/Verlust‘, obwohl P&L und RR schon eingefärbt sind. Soll die Spalte ‚Status‘ in TradeLog und Tagesansicht wegfallen? Der Ergebnis-Filter bleibt, Break-even wird neutral eingefärbt, das Sortieren nach Status entfällt. Empfehlung: Ja: trades.js:7/49 und day.js:15 ohne Statusspalte; P&L und RR bei status 'be' mit Klasse 'neu'. Die Pille in der Trade-Ansicht bleibt.
- **komponenten · hierarchie-47:** Oben rechts führt das Profilbild zum Profil, unten links öffnet die Konto-Karte dasselbe und mehr. Soll das Profilbild oben rechts am PC wegfallen? Empfehlung: Nein, behalten. Zeitraum, Konto und Filter richten sich laut README am Avatar aus, und das Start-Skelett zeigt ihn. Umgesetzt wird nur ‚Profil ergänzen‘ statt des abgeschnittenen ‚Profil vervollständi…‘.
- **komponenten · referenz-5:** Du hattest festgelegt, dass das Dashboard keinen ‚Session starten‘-Knopf hat, alle anderen Seiten schon. Soll das so bleiben? Empfehlung: Ja, so lassen (README Z.64–65, sixtest und voicetest prüfen das). Umgesetzt wird nur die Beschriftung ‚Session starten‘ ab 1181 px auf den anderen Seiten.
- **aufbau · komponenten-3:** Sollen Zeitraum und Konto ab 961 px auf allen Seiten oben rechts in der Titelzeile stehen wie auf dem Dashboard (am Handy weiter in der Kopfreihe)? Empfehlung: Ja. Das führt deine Titelzeilen-Entscheidung überall fort, die Filter springen nicht mehr und bleiben beim Scrollen sichtbar. Die Umsetzung ist in F1 vorbereitet; dabei ändern sich leaktest.js, sixtest.js, shadowtest.js, motiontest.js, headtest.js und README:62–65/144/221.
- **aufbau · bereich_shell-8:** Gleiche Frage wie komponenten-3: Zeitraum und Konto auf allen Seiten oben rechts? Empfehlung: Ja, zusammen mit komponenten-3 umsetzen (F1).
- **aufbau · aufbau-16:** Prop Firms: Eine Leiste „Übersicht · Bilanz · Friedhof · Konten“ statt „Auswertung“ mit zweiter Unterleiste? Empfehlung: Ja. „Auswertung“ trägt nur noch zwei Ansichten und kostet eine zweite Leiste und einen Klick. Vier Segmente passen auch bei 390 px.
- **aufbau · aufbau-9:** Soll der Check-in im Ruhepunkt (Schritt 2) dieselben Skalen wie der Tages-Check-in nutzen und als Check-in des Tages zählen? Dadurch ändern sich Texte aus docs/ruhepunkt.html. Empfehlung: Ja. Heute steht danach „Kein Check-in“ in der Tagesansicht, die Kernroutine verlangt doppelte Arbeit. mentor.js:42 und rptest.js werden mitgezogen.
- **aufbau · aufbau-8:** Sollen die messbaren Regeln aus einer Quelle kommen (Schatten-Ich-Regelwerk), statt aus vier Stellen? Empfehlung: Teilweise: den Ruhepunkt-Schritt „Deine Regeln für heute“ mit den Regelwerk-Werten vorbelegen. Die „Automatischen Regeln“ und das Tagesverlustlimit bleiben, weil sie die Tilt-Warnungen speisen. Die Klarstellung ist schon in der Spezifikation.
- **aufbau · aufbau-25:** Einstellungen: Privatsphäre, Zwei-Faktor sowie Daten und Sicherung (mit „Alles löschen“) aus „Profil“ in einen neuen Bereich „Sicherheit und Daten“ verschieben? Empfehlung: Ja, direkt nach Profil, Symbol download. Der Schalter „Christlicher Impuls“ bleibt im Profil.
- **aufbau · bereich_einstellungen-7:** Den Einstellungsbereich „Abo“ streichen, solange es kein Abo gibt? Empfehlung: Ja, ohne Ersatztext. #/settings/abo fällt auf Profil zurück, settest.js wird angepasst.
- **aufbau · bereich_einstellungen-36:** Den Reiter „Kategorien“ unter Inhalte streichen und die drei Kategorien als Filter-Chips über der Tag-Liste zeigen? Empfehlung: Ja. Chips ohne Farbpunkt, gewählter Chip flach. Vorab wird schon „Tags“ zum Standard-Reiter.
- **aufbau · bereich_einstellungen-6:** Den Block „Was handelst du?“ in Einstellungen → Trading streichen? Die Auswahl wird nirgends verwendet. Empfehlung: Ja. Der gespeicherte Wert bleibt; mit einer echten Funktion kehrt er später als „Märkte“ zurück.
- **aufbau · bereich_einstellungen-5:** Adresse, Bio und Zeitzone im Profil wirken nirgends. Sollen sie raus? Der Fehler „Africa/Abidjan“ ist bereits behoben. Empfehlung: Adresse und Bio streichen, Zeitzone behalten.
- **aufbau · aufbau-14:** Die Gruppe „Konten“ in der Seitenleiste (Prop Firms, Coupon-Codes) in „Prop Trading“ umbenennen, um die Verwechslung mit Einstellungen → Konten zu vermeiden? Empfehlung: Ja, nur der Name. Gruppen und Reihenfolge bleiben.
- **aufbau · bereich_notebook_news-9:** Im Notebook-Filter Ordner und Tag streichen (gibt es links schon) und nur „Zuletzt bearbeitet von–bis“ lassen? Dann lässt sich eine Suche nicht mehr auf einen Ordner eingrenzen. Empfehlung: Ja. Zwei Orte für denselben Filter führen zu leeren Listen. Vorab bekommen die Datumsfelder sichtbare Labels.
- **diagramme · diagramme-29:** Die Profit-Faktor-Kachel zeigt einen Ring, „Ø Gewinn/Verlust“ daneben einen waagerechten Zweiteil-Balken, obwohl beide ein Verhältnis zweier Beträge sind. Sollen beide gleich aussehen (Balken)? Du hattest den Ring früher bewusst größer gemacht (Commit e2bec1b), der Aufbau folgt TradeZella. Empfehlung: Ja: gleiche Kennzahl-Art, gleiche Form. Am Handy ist der Ring lauter als der Wert und macht die Kachel höher. Die Halbkreise der Trefferquoten bleiben. Die Umsetzung bei Ja steht fertig in Abschnitt 6 (widgets.js:171–172, widgetpreviews.js:60, mobiletest prüfen).
- **diagramme · diagramme-40:** Darf „Ausgaben vs. Payouts“ als einziges Diagramm eine echte Zeitachse und eine Treppe bekommen (flach bis zur Buchung, dann senkrecht)? Bisher gilt laut README „Kurven“: alle Kurven weich. Empfehlung: Ja, nur für dieses Diagramm. Buchungen sind Sprünge, die Treppe ist monoton und ehrlich. Die Zeitachse allein ohne Treppe nicht umsetzen, denn eine 26-Tage-Lücke sähe dann wie gleichmäßiges Wachstum aus. Bei Nein bleibt alles wie heute. Die Umsetzung über die Optionen timeX/step, bindHover nach dem nächsten Punkt und die README-Ausnahme steht in Abschnitt 6.
- **diagramme · bereich_prop-23:** Gleiche Frage wie bei diagramme-40: echte Zeitachse für „Ausgaben vs. Payouts“, nur zusammen mit der Treppenform, weil die Zeitachse allein die Darstellung irreführender macht. Empfehlung: Zusammen mit diagramme-40 als ein Paket entscheiden. Empfehlung: Ja (Zeitachse plus Treppe nur in diesem Diagramm).
- **zustaende · zustaende-37:** Darf die Trade-Tabelle im TradeLog bei wenigen Trades kürzer sein als das Fenster (`.tl-fit > .tbl-wrap.paged { flex: 0 1 auto }`), sodass der Seitenwähler direkt unter der letzten Zeile steht? README Z. 103–107 legt heute fest: „füllt genau das Fenster“. Empfehlung: Ja. Der Kern bleibt: Die Seite scrollt nicht, der Seitenwähler ist immer sichtbar, lange Listen füllen weiter das Fenster. Danach README Z. 103–107 ergänzen. Seitenwähler nur bei mehreren Seiten und Zähler nur bei aktivem Filter werden ohnehin umgesetzt.
- **barrierefreiheit · bereich_shell-30:** Du hast den Hell/Dunkel-Schalter im Konto-Menü bewusst schlank gemacht (26 × 22). Soll er auf Touch-Geräten sichtbar größer werden (Knöpfe 36 × 32)? Empfehlung: Nein. Die Spezifikation vergrößert nur die unsichtbare Trefferfläche auf 26 × 34. Die Optik bleibt, und WCAG 2.5.8 ist erfüllt.
- **barrierefreiheit · barrierefreiheit-8:** Beim Trade-Dialog hast du festgelegt, dass kein Feld vorausgewählt ist. Sollen andere Formular-Dialoge (Check-in, Prop-Konto, Plan & Bewertung …) beim Öffnen am PC direkt im ersten Feld stehen? (gilt auch für bereich_prop-39) Empfehlung: Nein, dieselbe Regel wie bei „Trade loggen“: Der Dialog selbst bekommt den Fokus. Tastatur-Nutzer sind mit zwei Tab-Schritten im ersten Feld, Maus-Nutzer sehen keinen vorausgewählten Rahmen, und am Handy springt keine Tastatur auf.
- **barrierefreiheit · bereich_prop-39:** Wie bei barrierefreiheit-8: Sollen die Prop-Dialoge (Konto anlegen/bearbeiten, Zuordnen) beim Öffnen am PC im ersten Feld stehen statt auf dem Dialog? Empfehlung: Nein. Das × wird ohnehin nie mehr fokussiert; der Dialog selbst bekommt den Fokus.
- **barrierefreiheit · bereich_dashboard-21:** Du hast die (i)-Zeichen bewusst zurückgenommen. Sollen sie auf Touch-Geräten (dort immer sichtbar) kräftiger sein (--muted, 4,8:1 statt --faint, 2,1:1)? Empfehlung: Nein. Die Erklärungen sind Zusatzinformation und per Antippen erreichbar. Die Trefferfläche wird unsichtbar auf 24 px vergrößert, die Farbe bleibt.
- **kilook · ki_look-10:** Am 2.10. wolltest du, dass die Linie in den Kacheln nicht durchgezogen ist, damit sie nicht durchs Diagramm läuft. Jetzt läuft sie unter dem Titel nach der Hälfte aus. Sollen wir sie ganz weglassen? Titel und Wert wären dann nur durch Abstand getrennt. Empfehlung: Ja, ganz weglassen (reine Zierde, dein Ziel „nicht durchs Diagramm“ bleibt erfüllt), ohne Ersatzlinie. padding-top 8 → 4 px, damit Titel und Wert 11 px auseinander stehen. Vorher/Nachher zeigen (shots/extra/dash/crop-tiles2x.png).
- **kilook · bereich_dashboard-41:** Gleiche Frage wie bei ki_look-10 (auslaufende Linie unter dem Kacheltitel, app.css:524–525). Empfehlung: Wie bei ki_look-10: ganz weglassen, padding-top 4 px.
- **kilook · ki_look-6:** Den Ring bei „% Regeln eingehalten“ wolltest du am 28.9. größer und mittig. Das Audit schlägt 88 px statt 116 px vor, weil er nur die Prozentzahl daneben wiederholt. Soll er kleiner werden? Empfehlung: Größe lassen (116 px), weil es dein ausdrücklicher Wunsch war. Der grüne Schein und das erfundene „0 %“ mit grünem Punkt ohne Regeln werden ohnehin behoben.
- **kilook · bereich_training-45:** Die drei Symbole im Ruhepunkt bewegen sich ständig: Die Sonne steigt und glüht, der Mond schaukelt und glüht, Sterne blinken, der Ring pulsiert. Am 30.9. fandest du sie stark. Sollen sie im Ruhezustand stillstehen und sich nur bewegen, wenn man mit der Maus darüberfährt oder sie per Tastatur anwählt, und Sonne und Mond ohne Glühen? Empfehlung: Ja: animation-play-state paused im Ruhezustand, running bei :hover und :focus-visible, drop-shadow aus den Keyframes rp-sun und rp-moon entfernen. Atemlicht, Blütenblätter und Farbflächen bleiben. Schon umgesetzt sind: kein farbiger Schatten, kein Lichtkegel, kein Springen des Symbols beim Überfahren, kein Schein an Ampelpunkt und Rhythmus-Balken.
- **responsiv · bereich_einstellungen-22:** Sollen die Einstellungen am Handy als Liste mit Unterseiten erscheinen (wie die iOS-Einstellungen, mit „‹ Einstellungen“ oben) statt als seitlich wischbare Leiste, in der von zwölf Abschnitten nur dreieinhalb sichtbar sind? Empfehlung: Ja. Die Liste ist das gewohnte Muster und entfernt keine Funktion. Umsetzung rein per Klasse is-index (misc.js plus CSS im 560er-Block), Desktop und 561–960 px bleiben unverändert. Bis zur Antwort zeigt nur der allgemeine Wischleisten-Auslauf an .set-nav, dass es weitergeht.
- **wording · aufbau-29:** Soll die betreuende Person im Coach-Bereich in der Oberfläche ‚Coach‘ heißen statt ‚Mentor‘? ‚Mentor‘ ist sonst der KI-Chat. README Z. 145–170 legt heute ‚Mentor‘ fest, und die Server-Mails sagen weiter ‚Mentor‘. Empfehlung: Ja, nur die Oberflächentexte umbenennen. Rollenwerte, API-Felder, CSS-Klassen und Route bleiben. coachtest.js:42/84/96 und README anpassen, die Server-Mails später angleichen.
- **wording · wording-17:** Soll der Schalter ‚Support-Team-Zugriff erlauben‘ samt ‚Speichern‘ entfallen? Er wird nirgends ausgewertet, und ein Support-Team gibt es nicht. README Z. 171 und settest2.js:16 nennen bzw. prüfen ihn. Empfehlung: Ja. Der Block bleibt als reine Information: ‚Deine Daten liegen nur in diesem Browser. Mentor, Coach und Sprachnotizen schicken Auszüge an deinen Journalyst-Server, wenn du ihn einrichtest.‘
- **wording · wording-18:** Sollen ‚2FA aktivieren‘ und ‚Passwort zurücksetzen‘ bis zu echten Benutzerkonten ausgeblendet werden? Beide öffnen nur einen Hinweis (README Z. 171, settest2.js:17). Empfehlung: Ausblenden und durch eine graue Zeile ersetzen: ‚Anmeldung, Passwort und 2FA kommen mit Benutzerkonten.‘ Will der Nutzer sie als Ankündigung behalten, bleibt es bei Schritt 17.3 (neutraler Knopf, ehrlicher Text).
- **bewegung · bereich_dashboard-12:** Soll das Einblenden beim Reinscrollen (Karten unter dem Fenster blenden beim Scrollen gestaffelt ein, README Z. 330) in der App ganz wegfallen? Der Fehler beim Neuaufbau und das Drucken werden ohnehin behoben. Empfehlung: Ja, in der App abschalten (app.js M.scan-Aufruf löschen, app.css:569 löschen, README Z. 330 kürzen, motiontest.js Z. 9–13 und 20–24 umstellen). Auf der Startseite behalten. Das ist ruhiger, folgt der Vorgabe „Eingangs-Animationen nur beim Seitenwechsel“ wörtlich, und kein Inhalt ist mehr kurz unsichtbar.
- **bewegung · bewegung-15:** Soll das weiche Scrollen (scroll.js, heute 7,5 % des Restwegs pro Bild, README Z. 363–364) unabhängig von der Bildwiederholrate werden? Und auf welchem Bildschirm (60/120/144 Hz) fühlt es sich heute richtig an? Empfehlung: Ja, zeitbasiert mit Zeitkonstante TAU, geeicht auf den Bildschirm des Nutzers, damit sich für ihn nichts ändert: 60 Hz → 214 ms, 120 Hz → 107 ms, 144 Hz → 89 ms. Code: current += (target - current) * (1 - Math.exp(-dt / TAU)); dt aus performance.now(), höchstens 50 ms.

## Entfallene Schritte

- abstaende-C4: ENTFÄLLT (zusammen_mit aufbau-B13): Das Löschen von Z. 1579 übernimmt aufbau-B13. Zum übrigen Teil von C4 siehe Anker .w.editing (entfällt).
- abstaende-E1: ENTFÄLLT (zusammen_mit aufbau-B1): Der frühe Rücksprung `if (!left && !right) return '';` ist in aufbau-B1 enthalten.
- abstaende-E3: ENTFÄLLT (zusammen_mit aufbau-B6): Wird von aufbau-B6 umgesetzt, keine eigene Änderung.
- abstaende-F2: ENTFÄLLT (entfaellt ): Nicht umsetzen. Die Leiste bekommt nur `<span class="grow" aria-hidden="true"></span>` aus aufbau-C6b, keinen .vh-Namen.
- abstaende-K1: ENTFÄLLT (entfaellt ): leftOpen bleibt true. Die mittleren Breiten regelt der Container nbc (responsiv-B8, 3.13 öffnet die Ordner über „Zurück“). Die Abnahme „961–1180 px: Ordnerspalte beim ersten Öffnen eingeklappt“ (abstaende 1.14) entfällt.
- abstaende-MENTOR: ENTFÄLLT (entfaellt ): Der einzige Inline-Abstand in mentor.js (`style="margin-top:14px"` an der Anleitungszeile) verschwindet mit der Zeile (wording-S15.4-15.5). Breiten (C12) und Symbol (D8) laufen in ihren eigenen Schritten. Die Inline-Größen der Skelett-Blasen (Z. 83, width/height) sind keine Ab
- abstaende-S6: ENTFÄLLT (entfaellt ): README Z. 120 ändert responsiv 3.19 („bei schmalem Inhalt (unter 1000px) Liste und Notiz, die Ordner über „Zurück“, unter 700px eine Spalte“).
- aufbau-A3b: ENTFÄLLT (entfaellt ): Vollständig abgedeckt: `.tile .head` 13 durch typografie-3.2.3i (mit Token und Zeilenhöhe), `.stat-tile .k` und `.stat .k` 500 durch typografie-3.2.4l.
- aufbau-A4b: ENTFÄLLT (entfaellt ): Alle fünf Punkte sind durch Typografie abgedeckt: `.set-head h2` → typografie-3.2.3u, `.set-head p` → typografie-3.2.3i, `.set-block h3` → typografie-3.2.3r, `.set-row b` und Optionstitel → typografie-3.2.4k (dort um `.set-block .avatar-row b` ergänzt). Die Handy-Stufe 16/22 p
- aufbau-B11: ENTFÄLLT (zusammen_mit responsiv-B6a): Die 4er-Regel ist doppelt. Die 6er-Regel steht im Block von responsiv-B6a und gilt ab 561 px statt ab 961 px. Kein eigener Block nach Z. 2604.
- aufbau-B3: ENTFÄLLT (zusammen_mit zustaende-S-A3): Teil 1 (Methode App.userName()) und Teil 2 (Initialen in topbar) entfallen. userCard und topbar nutzen App.userInfo() aus zustaende-S-A3. Im Tabellentext aufbau.md Z. 27 und in regeln.md App.userName() durch App.userInfo() ersetzen. Die übrigen Teile von B3 re
- aufbau-B5: ENTFÄLLT (zusammen_mit zustaende-S-A2): Die href-Änderung `#/settings` → `#/settings/konten` ist in zustaende-S-A2 enthalten. Nicht doppelt umsetzen.
- aufbau-C12a: ENTFÄLLT (zusammen_mit responsiv-3.12a): Bedingung und Rückfall „nur noch das Ziel“ setzt responsiv-3.12a in planText um. Kein eigener Eingriff in Z. 75–76.
- aufbau-C15b: ENTFÄLLT (zusammen_mit zustaende-S-T1): Nicht separat umsetzen. Die Filter-Logik und den Zähler setzt zustaende-S-T1. Glossarzeilen aufbau.md Z. 160 und Z. 655 („Gefiltert · {0} Trades“) entfallen. Prüfpunkt Z. 744 wird zu: Suche „NQ“, `.spark-tile .n` lautet „{n} abgeschlossen“, und der Netto-Wert 
- barrierefreiheit-B11: ENTFÄLLT (zusammen_mit zustaende-S-C3): `.input[aria-invalid="true"] { border-color: var(--loss); }` ist in der ersten Regel von zustaende-S-C3 enthalten, nicht doppelt anlegen.
- barrierefreiheit-B6: ENTFÄLLT (entfaellt ): Alle Teile sind anderswo abgedeckt: Z. 337 durch farbe-B4, Z. 1044 (Notebook-Tags) durch komponenten-C29b (alle farbigen Tag-Regeln gelöscht; der grüne Setup-Kopf, den B6 behalten wollte, verstößt gegen „Grün nur Gewinn und Trade loggen“), Z. 1627/1631 (Vorlagen) durch kompone
- barrierefreiheit-C-prop-294: ENTFÄLLT (zusammen_mit wording-S12.27): wording-S12.27 entfernt hide-m mit. Der Wortlaut ist „Prop-Konto anlegen“.
- barrierefreiheit-P6: ENTFÄLLT (zusammen_mit responsiv-3.3c): Entfällt als eigener Schritt: kein Fokus-Aufruf in sidebar(), kein closeSidebar(), scrim() und sb-toggle bleiben unverändert. Fokus auf „Menü schließen“ beim Öffnen und Rückgabe an .menu-btn (auch bei Escape) setzt 3.3c in renderSidebar um.
- bewegung-3.7a: ENTFÄLLT (zusammen_mit kilook-C12): Das Entfernen von `<span class="dot-live"></span>` in dashboard.js:119 macht kilook-C12 zusammen mit dem Trenner „·“ (nicht „–“).
- bewegung-3.8b: ENTFÄLLT (zusammen_mit barrierefreiheit-C-dash-filter-168-189): Das Ausblenden mit ID-Entfernung steckt im gemeinsamen close(). Prüfung 6 der Bewegung (40 ms nach Escape existiert .fd-pop.closing, nach 250 ms ist #fd-layer leer) bleibt gültig.
- bewegung-B5: ENTFÄLLT (zusammen_mit zustaende-S-C5): B5 fällt als eigener Schritt weg. Es gibt keine Regel `.tile:hover, .stat-tile:hover { border-color: var(--border-2) }`. Das Löschen von Z. 516 und 2603 und das Streichen der Übergänge übernimmt S-C5.
- bewegung-C4: ENTFÄLLT (zusammen_mit kilook-B2): Identische Änderung, kilook-B2 setzt sie um.
- diagramme-A8a: ENTFÄLLT (entfaellt ): Onest übernimmt typografie-3.2.2f, tabular-nums typografie-3.2.2e, das .muted-Gewicht 400 typografie-3.2.5d (Selektor `.bar-row .bl b`, deckt `> b` ab). In diagramme A-13 „700“ als „600 (Listenwert)“ lesen.
- farbe-B12: ENTFÄLLT (zusammen_mit komponenten-C11): Dieselbe Änderung an Z. 676 macht komponenten-C11.
- farbe-B23a: ENTFÄLLT (zusammen_mit diagramme-A5): Kein eigener Schritt: diagramme-A5 übernimmt die Änderung, mit dem Selektor `:not(.right)` aus B23a. Die Prozentwerte 8/16/28/42/58 % werden NICHT verwendet. Gilt jetzt: 14/26/38/50/62 %. Die Farb-Akzeptanz (progress_voll grau abgestuft, kein --accent in .activi
- farbe-B5: ENTFÄLLT (entfaellt ): Die Heute-Markierung aller vier Selektoren setzt zustaende-S-C8 um (Unterstreichung, --text, ohne Ring).
- farbe-C12a: ENTFÄLLT (zusammen_mit wording-S5.4-5.5): Der Wechsel faint → lbl-hint geschieht in wording-S5.4. Ergebnis: <span class="lbl-hint dp-coarse">(leer lassen, solange offen)</span>.
- farbe-C14b: ENTFÄLLT (zusammen_mit diagramme-E7): REPORT_COLORS und das Umschreiben alter Standardfarben nur einmal, in diagramme-E7 (#2f80d0 statt #4a6fe3). Der Test 4.6 aus farbe-C14b (gespeicherter Report mit alten Standardfarben zeigt die neuen, eigene Farben bleiben) wird mit den Werten aus E7 bei E7 geprü
- farbe-C14d: ENTFÄLLT (entfaellt ): Die Fußzeile entfällt ganz. Die Inhaltsbedingung trägt der Kopf-Link aus aufbau-C2a (d.all.length).
- farbe-C2: ENTFÄLLT (entfaellt ): aufbau-C11c löscht die Regel .rules-list li::marker samt Karte.
- farbe-C3b: ENTFÄLLT (entfaellt ): Z. 1659 setzt aufbau-B12 wortgleich um, Z. 1660 ohne Unterstreichung nach aufbau-B12.
- farbe-C7: ENTFÄLLT (entfaellt ): Kommentar und `.shadow-rule.on` setzt zustaende-S-C11 um (Fläche --surface-2, Rand --border-2, aus transparent).
- farbe-C8a: ENTFÄLLT (zusammen_mit komponenten-C17a): Identische Änderung. Sie wird in komponenten-C17a umgesetzt.
- farbe-D3f: ENTFÄLLT (zusammen_mit zustaende-S-R3): Dieselbe README-Stelle, zustaende-S-R3 schreibt den Text.
- kilook-B2: ENTFÄLLT (zusammen_mit bewegung-C4): Identische CSS-Änderung (Rand --border-2, Fläche --surface-2, .dot-live und @keyframes pulse löschen); bewegung-C4 setzt sie einmal um.
- kilook-B6: ENTFÄLLT (zusammen_mit abstaende-D4): 12px/500/--muted ohne Versalien schreibt abstaende-D4 (mit Tokens und align-self: end).
- kilook-C9a: ENTFÄLLT (zusammen_mit wording-S6.1-6.4): Gleiche Änderung an Z. 115/116. Die Prüfungen (mobiletest.js:66, .cal .p ohne /,\d\d\s?[€$]/) laufen im Wortwahl-Schritt.
- komponenten-A2: ENTFÄLLT (zusammen_mit zustaende-S-A3): Keine Methode App.displayName() anlegen, userCard und topbar laufen über App.userInfo(). Der Punkt „Profil vervollständigen“ → „Profil ergänzen“ wird nur über wording-S5.1-5.2 Teil 5.2 umgesetzt (einschließlich usercardtest.js:11 und Sprachschlüssel, nicht dop
- komponenten-A6: ENTFÄLLT (entfaellt ): Den Klassenwechsel übernehmen barrierefreiheit-P13 (Z. 428: `class="scale5 rating"`) und barrierefreiheit-P14a (Z. 513: `class="scale5"`), die dieselben Zeilen ohnehin neu schreiben.
- komponenten-C25b: ENTFÄLLT (entfaellt ): Entfällt vollständig: Die gap-Löschung übernimmt abstaende-B13. Der Wert erbt .tile .val (aufbau-A2). Trennlinie und Abstand kommen über die Klasse body an .spark-body (typografie-3.8b), es gibt keine eigene linear-gradient-Kopie mit padding-top 8.
- komponenten-C25c: ENTFÄLLT (zusammen_mit farbe-B24): Die Regel aus Z. 407 legt farbe-B24 an, ohne den Selektor `:root[data-theme="light"] .kstrip .tile:hover`. Die Hinweise aus Z. 408–409 gelten weiter: --lift-shadow bleibt, und .stat-tile übernimmt die .tile-Werte aus Typografie und Abstände.
- komponenten-C34a: ENTFÄLLT (zusammen_mit kilook-C4): Identisch mit kilook-C4, nicht separat umsetzen.
- komponenten-D2: ENTFÄLLT (entfaellt ): Ersetzt durch responsiv-3.4 (oneMonth(box), presetView, pick(p, box), setPreset, fit) und den fit-Aufruf in App.fitPopover (responsiv-3.3b). Kein Media-Query-Duplikat in rangepicker.js.
- komponenten-E1h: ENTFÄLLT (entfaellt ): Der Handy-Kachelwert bleibt 20 px; mobiletest.js:27 bleibt unverändert.
- komponenten-S-coupons: ENTFÄLLT (zusammen_mit komponenten-C33b): Nur eine Prüfung, das Markup bleibt. Wird mit C33b erledigt; coupontest.js:14 (`.cpn-link[target=_blank][rel=noopener]`) muss grün bleiben.
- komponenten-S-day-a: ENTFÄLLT (zusammen_mit abstaende-E-day2): Die Klassenwechsel aus Z. 12 (`btn nav`, `day-title`, „Heute“ als `btn sm`) setzt abstaende-E-day2 beim Umbau in die Kopfreihe um. Die Platzierung am Anfang der rechten Gruppe entfällt.
- komponenten-S-prop-f: ENTFÄLLT (zusammen_mit wording-S12.27): Text „Prop-Konto anlegen“ statt „Konto anlegen“. wording-S12.27 setzt ihn um, zusammen mit dem Entfernen von hide-m.
- komponenten-S-stats-a: ENTFÄLLT (zusammen_mit barrierefreiheit-C-stats-15): class="btn" und Inline-Farbe entfernt barrierefreiheit-C-stats-15 im selben Durchgang.
- komponenten-S-trades-c: ENTFÄLLT (zusammen_mit zustaende-S-T2): Das Template schreibt zustaende-S-T2. Von hier kommen die Knöpfe .btn.nav und „{0}–{1}“ ohne Leerzeichen, beides gilt für pages > 1. Die Vorgabe „.pg-info immer“ entfällt: Bei einer Seite erscheint pg-info nur ohne aktiven Filter.
- responsiv-3.2a: ENTFÄLLT (zusammen_mit typografie-3.4d): fmt.weekdayShort nicht anlegen. Dieselbe Ausgabe liefert fmt.weekdayDM(d) aus typografie-3.4d. In den Regeln und Texten von Responsiv „fmt.weekdayShort“ durch „fmt.weekdayDM“ ersetzen.
- responsiv-B1: ENTFÄLLT (zusammen_mit abstaende-D1): Verschieben über abstaende-D1 (1). B1 wird insgesamt nicht separat umgesetzt (siehe .sb-userwrap). Die B1-Tests (sidebartest 1440×1000, usercardtest:21, mobiletest:59–60) laufen bei D1 mit.
- typografie-3.2.2d: ENTFÄLLT (zusammen_mit kilook-C2): Nicht separat umsetzen; Z. 770–774 und Z. 788 löscht kilook-C2.
- typografie-3.2.5a: ENTFÄLLT (zusammen_mit aufbau-A2): Gleiche Regel, aber `font-size: var(--tile-val)` statt var(--fv-24); aufbau-A2 schreibt sie.
- typografie-3.2.5b: ENTFÄLLT (entfaellt ): Alle drei Teile sind übernommen: gap-Löschung und flex-wrap: nowrap macht abstaende-B13, die Typo-Dubletten in .tile.spark-tile .val löscht aufbau-A2.
- typografie-3.5c: ENTFÄLLT (zusammen_mit komponenten-W5): Klasse score-big setzt komponenten-W5, ohne `style="margin:0"` (.score-big hat keinen Außenabstand).
- wording-S17.22: ENTFÄLLT (zusammen_mit aufbau-C8e): Der Verweis auf „Plan & Bewertung“ steckt im neuen Untertitel von aufbau-C8e. Kein eigener Text und kein eigener Sprachschlüssel.
- wording-S5.3: ENTFÄLLT (zusammen_mit aufbau-B6): Wird von aufbau-B6 umgesetzt, keine eigene Änderung.
- wording-S5.9: ENTFÄLLT (zusammen_mit aufbau-B7): Beide Teile (Taste 0 nur mit Replay, N über App.actions['new-trade']) setzt aufbau-B7 um. Die eigene Zeile if (e.key === '0' && !App.on('replay')) return; entfällt.
- zustaende-S-C14: ENTFÄLLT (zusammen_mit komponenten-C37a): Alle drei Punkte (12 px, `.saving` ohne Gelb löschen, `.set-head .save-state`) stecken im Endzustand von komponenten-C37a.
- zustaende-S-C9b: ENTFÄLLT (zusammen_mit komponenten-C20): Z. 1867, 1869, 2595 und 2597 (500, --text statt Akzent) stecken in der gemeinsamen Fassung von C20. Die grep-Prüfung in zustaende.md Z. 908 bleibt gültig.
- zustaende-S-C9c: ENTFÄLLT (zusammen_mit farbe-C4): Z. 1921 wird nicht separat geändert, farbe-C4 setzt denselben Wert.
- zustaende-S-DP: ENTFÄLLT (entfaellt ): Erledigt durch wording-S3.1-3.3 und wording-S4.1-4.7: keine Klasse is-empty in app.js:360, kein zweiter input/change-Listener, keine CSS-Regel .input.is-empty.
- zustaende-S-F1: ENTFÄLLT (entfaellt ): Z. 172 und Z. 61 setzt aufbau-C13 um (statt '' steht dort die Textzeile). Das info an der Kachel „Häufigste Regel“ (Z. 56) entfällt ersatzlos.
- zustaende-S-M2: ENTFÄLLT (zusammen_mit komponenten-S-misc-e): komponenten-S-misc-e übernimmt das Speichern bei change (Formular-data-change, Knopf in Z. 201 entfernen, Handler mit App.savedHint). Aus S-M2 bleibt nur die Gültigkeitsprüfung; sie wandert in S-misc-e. head('Trading', …) bekommt kein trailing. zustaende
- zustaende-S-PR1: ENTFÄLLT (zusammen_mit aufbau-C11a): Z. 20, 59, 68 und 69 setzt aufbau-C11a in der Endfassung um; enthalten sind „—“ in .muted ohne Daten und .muted bei 0 erledigten Schritten. In zustaende.md anpassen: Prüfpunkt 18 (leer_progress) → „Heutiger Fortschritt“ = „0 / 5“ in --muted. Glossarzeile Z. 133 u
- zustaende-S-ST1: ENTFÄLLT (zusammen_mit diagramme-G1): Die Prüfung auf closed.length steckt in diagramme-G1. Kein fillDays und kein leerer Kartentitel.
- zustaende-S-T2: ENTFÄLLT (zusammen_mit komponenten-S-trades-c): Die Teile 1 und 2 (Zähler nur mit Filter, reduzierter Seitenwähler bei einer Seite) gehen in komponenten-S-trades-c auf. „Trade${…'s'}“ wird dort durch U.count ersetzt. Teil 3 bleibt offen bis zustaende-37.
- zustaende-S-TE3: ENTFÄLLT (zusammen_mit bewegung-3.11a): Dieselbe Testanpassung in motiontest.js:52–53; bewegung-3.11a setzt sie einmal um (Name und Prüfung siehe dort).
- zustaende-S-TE6: ENTFÄLLT (zusammen_mit komponenten-E1a): settest.js:22 wird nur einmal geändert, durch komponenten-E1a (siehe #be-to).
- zustaende-S-TE7: ENTFÄLLT (entfaellt ): friedhoftest.js:47 bleibt unverändert. Der Test prüft weiter .prop-patterns-empty, den Text „Ab zwei Grabsteinen“ und dass .prop-patterns fehlt.

## Wartende Schritte

- aufbau-B3: wartet auf komponenten: hierarchie-47 (N4, Profilbild oben rechts am PC behalten?)
- aufbau-D3d: wartet auf komponenten: hierarchie-47 (N4 – Profilbild oben rechts am PC wegfallen lassen?)
- barrierefreiheit-P5: wartet auf aufbau: aufbau-14 (F10, Gruppe „Konten“ in „Prop Trading“ umbenennen?)
- barrierefreiheit-P8: wartet auf komponenten: hierarchie-47 (N4, Profilbild oben rechts am PC behalten?)
- diagramme-H1: wartet auf kilook ki_look-6 (nur die Ringgröße 116 vs. 64 px; Bogen-Bedingung und Bogenfarbe sind entschieden)
- farbe-C28: wartet auf komponenten: komponenten-1 (N1, Füllfarbe des Hauptknopfs) – betrifft nur den Füll-Teil von farbe-C5 (Z. 2217/2218); farbe-C28 und typografie-3.2.4c laufen sofort
- farbe-C5: wartet auf komponenten: komponenten-1 (N1, Füllfarbe des Hauptknopfs) – betrifft nur den Füll-Teil von farbe-C5 (Z. 2217/2218); farbe-C28 und typografie-3.2.4c laufen sofort
- kilook-C18: wartet auf kilook ki_look-6 (nur die Ringgröße 116 vs. 64 px; Bogen-Bedingung und Bogenfarbe sind entschieden)
- komponenten-A2: wartet auf komponenten: hierarchie-47 (N4, Profilbild oben rechts am PC behalten?)
- komponenten-S-misc-c: wartet auf wording / wording-17 (Support-Team-Schalter streichen?) – nur der Privatsphäre-Teil
- typografie-3.2.4c: wartet auf komponenten: komponenten-1 (N1, Füllfarbe des Hauptknopfs) – betrifft nur den Füll-Teil von farbe-C5 (Z. 2217/2218); farbe-C28 und typografie-3.2.4c laufen sofort
- wording-S17.2-17.3: wartet auf wording / wording-17 (Support-Team-Schalter streichen?) – nur der Privatsphäre-Teil
- wording-S5.1-5.2: wartet auf aufbau: aufbau-14 (F10, Gruppe „Konten“ in „Prop Trading“ umbenennen?)
- zustaende-S-A3: wartet auf komponenten: hierarchie-47 (N4, Profilbild oben rechts am PC behalten?)
- zustaende-S-PR2: wartet auf kilook ki_look-6 (nur die Ringgröße 116 vs. 64 px; Bogen-Bedingung und Bogenfarbe sind entschieden)