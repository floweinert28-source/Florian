# Design-Audit Journalyst – Rahmen für alle Agenten

## Produkt
Journalyst ist eine Trading-Journal-Web-App (Vanilla JS + CSS, kein Framework) für Daytrader (Futures wie NQ/ES, Prop-Firm-Konten).
Oberfläche auf Deutsch in der Du-Form; weitere Sprachen über `web/js/i18n.js` (Texte werden anhand der deutschen Strings übersetzt).
Bereiche (Routen `#/<route>`): dashboard (Widgets, Vorlagen, Bearbeitungsmodus), stats (9 Reiter), trades (TradeLog), day (Tagesansicht),
notebook, news, progress (Fortschritt), shadow (Schatten-Ich: Regelwerk, Verstöße), mentor (KI-Mentor), ruhepunkt (Calm Point),
prop (Prop Firms: Übersicht, analyse, auswertung, bilanz, finanzen, payout, friedhof), coupons, affiliate, coach, settings (Profil, Design, Sprache,
Benachrichtigungen, Abo, Konten, Trading, Regeln, Notebook, Mentor, Inhalte, …). Dialoge: Trade loggen, Check-in, Zertifikat, CSV-Import;
Menüs: Zeitraum, Konto, Filter, Vorlage, Konto-Menü unten links; Seitenleiste (voll und eingeklappt), Handy-Menü.

## Was der Nutzer will (verbindlich)
- „Clean, simpel, premium, nicht vibecoded.“ Ruhig, präzise, konsistent. Nichts Dekoratives hinzufügen.
- Dunkles warmes Graphit als Standard, helles Design gleichwertig. Grün nur mit Bedeutung: Gewinn/positiv und der Hauptknopf „Trade loggen“. Ausgewählte Zustände flach: leicht angehobene Fläche, feiner Rand, kein Licht, kein Schein, kein Glow, keine fetten aktiven Einträge.
- Schriften: Satoshi (Text), Onest (Zahlen). Gewichte abgestuft: Steuerelemente 500, Titel 600, nur Werte und Hauptknöpfe 700.
- Kurven monoton (kein Überschwingen), Diagramme ruhig, Punkte klein, Balken wachsen von der Nulllinie. Info-Symbole nur beim Darüberfahren.
- Eingangs-Animationen nur beim Seitenwechsel. Skelett beim Start.
- Aufbau (Informationsarchitektur, Reihenfolge, Zusammenlegen oder Trennen von Bereichen) DARF geändert werden, wenn es klar besser ist. Begründen.
- Bestehende Features dürfen nicht kaputtgehen. Blind-Replay bleibt versteckt (Feature-Flag). Server/Datenbank sind nicht Teil des Audits.
- Nichts vorschlagen, was der Nutzer bereits abgelehnt hat: Glow/Lichtverlauf auf gewählten Elementen, fette aktive Einträge, grüne Markierung von Auswahl, bunte Akzente, Rahmen um Notebook-Ordner, Schatten an Zahlenfeldern, Ladesymbol statt Skelett.

## Material
- Screenshots (Atlas): `audit/shots/<theme>-<breite>/<name>.png` mit theme = dark|light, breite = 1440|1024|390. Namen: Routen (z. B. `dashboard.png`, `stats_days.png`, `prop_bilanz.png`, `settings_design.png`), `day_mit_trades`, `notebook_notiz`, `trade_detail`, `modal_trade_loggen`, `modal_checkin`, `modal_zertifikat`, `pop_zeitraum`, `pop_konto`, `pop_filter`, `pop_vorlage`, `pop_zertifikat`, `dashboard_bearbeiten`, `panel_widget_hinzufuegen`, `menu_konto_unten`, `sidebar_mini`, `mobile_menue`, `leer_*` (ohne Daten). `audit/atlas-log.txt` sagt, welche Aufnahmen fehlgeschlagen sind. Screenshots mit dem Read-Werkzeug ansehen (Bilder).
- Stil-Zensus (gerenderte Werte, dark 1440): `audit/census.json` (global gezählt: Schriftgrößen, Gewichte, Zeilenhöhen, Farben, Hintergründe, Ränder, Radien, Gaps, Paddings, Schatten) und je Seite `audit/census/<seite>.json` (mit Beispiel-Selektoren und Textproben).
- Alle deutschen Oberflächentexte: `audit/strings-de.json` (Schlüssel = Text). Neuere Texte stehen direkt im Code.
- Code: `web/css/app.css` (eine Datei, ~3100 Zeilen, Tokens oben in `:root`), `web/js/app.js` (Shell, Routing, Kopfzeile, Trade-Formular), `web/js/ui.js` (Komponenten, Diagramm-Zeichner, Icons), `web/js/widgets.js` (Dashboard-Widgets), `web/js/screens/*.js` (je Bereich), `web/js/motion.js`, `web/js/lang/*.js`, `web/README.md` (dokumentiert jede Entscheidung; dort steht, was der Nutzer schon festgelegt hat).
- Skills (Prüfwissen): `.claude/skills/impeccable/SKILL.md` und `.claude/skills/impeccable/reference/{critique,audit,polish,typeset,layout,colorize,clarify,distill,harden,adapt,animate,onboard,craft-floor,component-review}.md`; `.claude/skills/web-design-guidelines/rules.md` (100+ Regeln); `.claude/skills/writing-guidelines/rules.md`; Diagramme: `/tmp/claude-0/bundled-skills/2.1.294/519242501d69fe8622fb32e21bc8832d/dataviz/SKILL.md` und dessen `references/`.
- App live ansehen (optional, für eigene Aufnahmen): im Ordner `/tmp/claude-0/-home-user-Florian/3d79e81c-3967-55f9-a53a-e07cf04bcd94/scratchpad` mit `export NODE_PATH=$(npm root -g) && node -r ./de-default.js <skript>.js`; Playwright, Seite `file:///home/user/Florian/web/app.html#/<route>`; Beispieldaten `Store.installSample(); Store.saveNow();` dann reload; helles Design `Store.setSetting('theme','light'); Theme.apply(Store.settings)`; Schriften lokal über `await require('./localfonts.js')(page)`. Eigene Aufnahmen bitte nach `audit/shots/extra/` legen.

## Was ein Befund braucht
Konkret und belegbar. Jeder Befund nennt: Bereich (Route/Dialog), Kategorie, Schwere (1 = fällt sofort auf oder stört die Bedienung, 2 = deutlich sichtbare Inkonsistenz, 3 = Feinschliff),
was genau falsch ist (mit Wert: z. B. „Kachel-Titel 13px/500, Karten-Titel 15px/600, Tabellenkopf 12.5px/500 – drei Stufen für dieselbe Rolle“),
Beleg (Screenshot-Name und/oder `datei:zeile` und/oder Zensus-Wert), Vorschlag (vorher → nachher, so konkret, dass ein anderer Agent es ohne Rückfrage umsetzen kann),
und ob der Vorschlag die Vorgaben oben berührt. Keine Allgemeinplätze („mehr Weißraum“), keine Vorschläge ohne Beleg.
