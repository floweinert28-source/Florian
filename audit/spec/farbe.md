# Zielspezifikation „Farbe und Kontrast“

Grundlage: 93 bestätigte Befunde aus `spec-input/farbe.json`, BRIEF.md, `web/README.md`, Inventar (`inventar-css.md` Abschnitt 4 und A11–A16, A21, A24), Zensus (`census.json`, `census/*.json`) und der Code-Stand vom 13.10. (Zeilennummern gegen `web/css/app.css` mit 3144 Zeilen geprüft). Alle Kontrastwerte sind nach WCAG 2.x nachgerechnet (Skript `scratchpad/farbe-work/cr.py`), die Report-Palette mit `dataviz/scripts/validate_palette.js` (dunkel und hell: alle Prüfungen PASS).

---

## 1. Zielzustand

### 1.1 Grundregel: Farbe heißt Bedeutung

1. **Grün** (`--profit`, `--accent`) erscheint nur an diesen Stellen:
   - **Gewinn und Positives:** positive Beträge und R-Werte (`.pos`), Pille „Gewinn“ und Gewinn-Zähler (`.pill.win`), Gewinntage im Kalender und in der Jahresübersicht, Gewinnbalken und -kurven, „Ziel erreicht“ (`.banner.ok`), bestandene Prop-Konten (`.prop-card.passed`, `STATUS_KIND.passed`), grüne Prop-Ampel, Regeltreue im Regel-Tracker, Score ab 75 in Ring, Skala und Wochenbalken.
   - **„Trade loggen“:** nur `.btn.accent` (Kopfzeile `App.newTradeButton`, Leerzustand TradeLog, „Trade für diesen Tag“, runder Handy-Knopf `.dash-head .tl`).
   - **Steuerelemente mit dokumentierter Ausnahme:** Schalter an (`.switch`, `.rp-switch`), Balken am aktiven Seitenleisten-Eintrag, Hinweis-Punkte (`--dot-glow`), Fokusring (`:focus-visible`), Score-Netz (README Z. 105), Long im Trade-Dialog (`--dir-c`).
   - Alles andere ist neutral. Das gilt für Auswahl, „Heute“, Status, Links, Symbole, Häkchen, Hover und Ladeanzeigen.
2. **Gewinn-Darstellungen nutzen `--profit`/`--profit-soft`, nie `--accent`.** `--accent` bleibt für „Trade loggen“, Schalter, Balken, Punkte, Fokus und Score-Netz. Akzent und Gewinn sind getrennt einstellbar (README Z. 187), ihre Rollen dürfen nicht vermischt werden.
3. **Rot** (`--loss`) nur für Verlust, Fehler, „geplatzt“ und Negatives. **Gelb** (`--warn`) nur für Warnung und „mittel“. **Violett** (`--be`) nur für Break-even und Emotion. **Blau** (`--info`) nur für den Status „offen/läuft“ (`.pill.open`) und die Kalender-Ansichten Trefferquote/Trades (widgets.js:130–131).
4. **Kein Licht, kein Schein, kein Verlauf auf gewählten Elementen.** Einzige Ausnahmen: „Trade loggen“ (`.btn.accent`), die Serien-Stufen (README Z. 130–132) und der Ruhepunkt-Hintergrund (README Z. 142).

### 1.2 Tokens (verbindliche Werte)

| Token | Dunkel (Graphit, `:root`) | Hell (beide Blöcke Z. 57–62 und Z. 67–72) | Zweck | Kontrast (nachgerechnet) |
|---|---|---|---|---|
| `--muted` | `#8a867f` → **`#948f88`** | `#6a746d` → **`#5f6862`** | Sekundärtext, Hinweise, Platzhalter, Achsen | dunkel: surface 5,47 · surface-2 5,01 · surface-3 4,48 · Feld 5,88; hell: Weiß 5,76 · bg 5,35 · Seitenleiste 5,06 · surface-2 5,26 · surface-3 4,87 |
| `--accent` | `#34f58a` (bleibt) | `#0fb862` → **`#077a41`** | „Trade loggen“, Schalter, Balken, Fokus | hell: Weiß 5,43 · bg 5,04 · surface-3 4,59 |
| `--accent-2` | bleibt | `#0a9a52` → **`#06663a`** | Hover von Schaltern | – |
| `--accent-ink` | `#04140a` (bleibt) | `#ffffff` (bleibt) | Schrift auf Akzentflächen | hell Weiß auf `#077a41` 5,43 |
| `--accent-soft` | bleibt | → **`rgba(7, 122, 65, 0.10)`** | Fokus-Schein, leichte Tönung | – |
| `--accent-glow` | bleibt | → **`rgba(7, 122, 65, 0.20)`** | Textauswahl | – |
| `--profit` | `#34f58a` (bleibt) | `#0fb862` → **`#077a41`** | Gewinn (Text, Flächen, Kurven) | hell Pille 4,72 · Kalenderkachel 4,72 |
| `--profit-soft` | **neu `rgba(52, 245, 138, 0.12)`** | **neu `rgba(7, 122, 65, 0.10)`** | Fläche der Gewinn-Pille, „Ziel erreicht“ | – |
| `--loss` | `#ff5c5c` (bleibt) | `#e03e3e` → **`#c62e2e`** | Verlust | hell Weiß 5,48 · surface-3 4,63 · Pille 4,69 |
| `--loss-soft` | bleibt | → **`rgba(198, 46, 46, 0.10)`** | Fläche Verlust-Pille | – |
| `--be` | `#8b7cf6` → **`#9a8cf8`** | `#6b5bd6` → **`#5f4fcf`** | Break-even, Emotion | dunkel Pille 4,91; hell Pille 4,89 · Weiß 5,99 |
| `--be-soft` | → **`rgba(154, 140, 248, 0.16)`** | → **`rgba(95, 79, 207, 0.14)`** | Fläche BE-Pille | – |
| `--warn` | `#f5b93a` (bleibt) | `#d99a12` (bleibt) | Warn-**Flächen** und Symbole (Ampel, Skala, Balken, Banner-Rand) | – |
| `--warn-text` | **neu `var(--warn)`** | **neu `#8f5f00`** | Warn-**Text** | hell Weiß 5,52 · surface-2 5,04 · Warn-Pille 4,92 |
| `--imp-mid` | **neu `var(--warn)`** | **neu `#b8820c`** | mittlerer Wichtigkeits-Balken (News) | hell 3,37 (Grafik ≥ 3) |
| `--info` | `#5cb8ff` (bleibt) | `#2b8fe0` → **`#1d6db5`** | Status „offen“ | hell surface-3 4,54 · Weiß 5,38 |
| `--faint` | bleibt | bleibt | nur Striche, Linien, leere Symbole, Deaktiviertes | – |

Nicht verändert: Flächen- und Rand-Tokens (`--bg` … `--border-2`), die Variante „Schwarz“ (Z. 76–80, eigenes `--muted #7d877f` erreicht 4,58–5,24:1), das Zertifikat (`--c-*`, eigene Palette), `--warn`/`--warn-soft` als Flächenfarben.

`web/js/theme.js` spiegelt die Standardwerte: `DEFAULTS = { dark: { accent: '#34f58a', profit: '#34f58a', loss: '#ff5c5c', be: '#9a8cf8' }, light: { accent: '#077a41', profit: '#077a41', loss: '#c62e2e', be: '#5f4fcf' } }`.

### 1.3 Textkontrast

- Lesbarer Text (Wörter, Zahlen, Platzhalter, Hinweise, Leertexte, Zustände wie „offen“) erreicht **mindestens 4,5:1** auf seiner tatsächlichen Fläche, in beiden Designs.
- **`--faint` ist nie Textfarbe für Wörter oder Zahlen.** Erlaubt nur für: den Platzhalter-Strich „—“ und „--:--“, leere bzw. inaktive Symbole (`.empty > svg`, `span.info`, ungefüllte ★, `.coach-no svg`, Serien-Flamme Stufe 0), Formen in Widget-Vorschauen, deaktivierte Einträge (`:disabled`, `.dp-day.out`) und die Linie bei erledigten Aufgaben.
- **`--muted`** ist die Farbe für Feld-Hinweise (`.field .hint`, `.prop-rule .hint`, `.fd-hint`, `.stc-l small`), Platzhalter (`.input::placeholder`, `.ql-editor.ql-blank::before`, „Symbol wählen“), Leertexte („Noch keine Tags“, „Nichts gefunden“), Fußnoten (Speicherort, CSV-Hinweis, KI-Hinweis) und Diagramm-Achsen.
- Hinweise in Feld-Beschriftungen („(leer = offen)“) nutzen die Klasse `.lbl-hint` (`--muted`, Gewicht 500), damit sie sich vom Label (600) abheben.
- **Gelb als Schrift immer `--warn-text`**, Gelb als Fläche/Symbol `--warn`.
- **Kleintext auf getönten Flächen** (Kalenderkacheln: Winrate `.wr`, Anzahl `.c`) steht in `--text-2` (dunkel 6,13/6,96:1, hell 8,52/8,38:1).

### 1.4 Knopf-Hierarchie

| Stufe | Klasse | Aussehen | Wofür | Höchstens |
|---|---|---|---|---|
| Hauptaktion der App | `.btn.accent` | wie bisher (dunkle Fläche, grüne Schrift, ein Hauch Licht) | nur „Trade loggen“ in allen Varianten | 1 je Ansicht (plus Handy-Rundknopf) |
| Bestätigen | `.btn.primary` | **neutral angehoben:** `background: var(--surface-3); border-color: var(--border-2); color: var(--text); font-weight: 600;` Hover `background: color-mix(in srgb, var(--text) 8%, var(--surface-3)); border-color: color-mix(in srgb, var(--text) 18%, var(--border-2)); box-shadow: none;` | die eine abschließende Aktion eines **sichtbaren** Formulars oder Dialogs: Speichern, Anwenden, Senden, Übernehmen, Erfassen, Importieren, Beitreten, Bestätigen | 1 je Formular/Dialog |
| Normal | `.btn` | wie bisher | alles, was **öffnet, anlegt, hinzufügt, startet, aufklappt oder navigiert**, sowie „Schließen/Verstanden“ in reinen Info-Dialogen | – |
| Gefahr | `.btn.danger` | wie bisher | Löschen | – |

Beispiele (vorher → nachher): „Konto hinzufügen“ grün gefüllt → `.btn sm`; „Neue Notiz“ grün gefüllt → `.btn sm`; „Speichern“ (Profil) grün gefüllt → `.btn.primary` neutral angehoben; „Hinzufügen“ in der Widget-Bibliothek grün gefüllt → `.btn sm`; „Trade loggen“ im leeren TradeLog grün gefüllt → `.btn sm accent`; „Zu den Einstellungen“ grün gefüllt → `.btn`.

Ruhepunkt: `.rp-btn.rp-primary` sieht aus wie `.btn.primary` (gleiche Tokens), je Bildschirm genau einer; die Phasenfarbe bleibt für Fortschrittsstriche, Atemkreis, Timer-Ring, Schieber und gewählte Chips.

### 1.5 Auswahl, Zustände, Markierungen

- **Ausgewählt** = der gemeinsame flache Stil am Ende von `app.css` (Fläche `color-mix(in srgb, var(--text) 10%, var(--surface))`, Rand `color-mix(in srgb, var(--text) 22%, var(--border-2))`, kein Schatten). Neu angeschlossen: aktiver Filter-Knopf (`.dh-context .btn.is-set`). Gleiche Werte als eigene Regeln (wegen `:has()` bzw. fehlendem Rand): gewählte Coach-Option (`.coach-radio:has(input:checked)`), gewählter Menüeintrag (`.popover .item[aria-checked="true"]`, Rand als `inset`-Schatten).
- **Aktiver Navigationseintrag** (Seitenleiste, Einstellungs-Menü): angehobene Fläche plus feiner Rand. Im hellen Design Fläche `--surface` (Weiß) mit Rand `--border-2`, weil `--surface-2` auf dem Grund nur 1,02–1,04:1 erreicht.
- **Unterstrich-Reiter** (`.prop-sub`, `.set-tabs`): gewählt = Schrift `--text`, Linie 2 px `--text`.
- **Gedrückte Werkzeuge** (Editor, Notebook-Kopf, Bildgröße): `background: var(--surface-3); color: var(--text)` (wo ein Rand existiert: `border-color: var(--border-2)`).
- **Native Häkchen und Optionsfelder:** `accent-color: var(--text)`.
- **„Heute“** ist überall neutral:
  - Dashboard-Kalender: Kreis 24 px in `--text`, Ziffer `--bg`; normale Tage **ohne** Kreisfläche (`background: none`), Ziffer `--text-2`.
  - Mini-Kalender: Zellrand `--text-2`, Ziffer `--text`.
  - Datumswähler (`.dp-day`, `.dp-month`, `.datepick .dp`): Schrift `--text`, Ring `inset 0 0 0 1px var(--muted)`.
  - Zeitraum-Kalender (`.rr-day`): Schrift `--text`, kein Ring (README Z. 77).
  - Raster (Aktivität, Regel-Tracker, Jahres-Monatsraster): `box-shadow: 0 0 0 2px var(--text-2)`.
  - Tagesansicht: `U.pill('Heute', 'neutral')`.
- **Status-Pillen ohne Gewinn-Bedeutung** sind neutral (`.pill.neutral`): „Heute“, „Aktiv“, „geprüft“, „Neu“, „{n} neu“. „Ausgezahlt“ ist ruhiger Text (`.muted`). `.pill.win` bleibt nur bei ui.js:177 („Gewinn“) und widgets.js:36/170/174 (Gewinnserie, Gewinner-Zähler).
- **„Neu“ im Coach-Bereich:** neutrale Pille, kein farbiger Rand, kein Seitenstreifen. Sind alle Einträge neu (mehr als 1), entfallen die Einzelpillen; der Kopf zeigt „{n} neue Einträge“. Die Klasse `is-new` bleibt im Markup (Tests).
- **Kein Schein:** Long/Short-Schieber flach getönt (10 % Richtungsfarbe auf `--surface`, Rand `inset` 22 %), Pfeilkreis ohne Glow; Schlaf-Schieber Spur `--text-2`, Knopf `--text` ohne Glow; Ladelinie `--text-2` ohne `drop-shadow`.

### 1.6 Gewinn und Verlust in Zahlen

- **Disziplin-Kosten:** überall die Wirkung aufs Konto mit Vorzeichen (Kachel, Widget, Tabelle, Ranking): Kosten „−824,03 €“ rot, Nutzen „+… €“ grün. Spaltenkopf „Kosten“ → „Effekt“.
- **Zähler** (Gewinner/Verlierer, Gewinntage/Verlusttage): in Tabellen neutral; in „X / Y“-Paaren nur gefärbt, wenn > 0 (0 bleibt Schriftfarbe).
- **Spalten, in denen jede Zeile dasselbe Vorzeichen trägt** (Prop-Ausgaben, Payout-Netto), sind neutral; die Farbe tragen die Summen-Kacheln.
- **Ø-Gewinn/Ø-Verlust-Beschriftung:** Farbe über `U.cls()`, also „0,00 €“ in `--text-2`; beide Seiten nach demselben Kompakt-Kriterium.
- **Realisiertes R** ist ein Ergebnis und wird gefärbt (`U.rText`), geplantes R bleibt neutral.
- **Score in Tabellen:** ≥ 75 Schriftfarbe, 50–74 `--warn-text`, < 50 `--loss`, normales Zellgewicht (`<span>` statt `<b>`). Ring, Skala und Wochenbalken: `--profit`/`--warn`/`--loss`.
- **Disziplin-Teilpunkte:** voll `--text-2`, teilweise `--warn-text`, 0 `--loss`. „Keine Fehler markiert“ `--muted`.
- **Regeln-Spalte:** eingehalten = Häkchen in `--muted`, gebrochen = × in `--loss`.
- **Verpasste Trades:** Summe in Schriftfarbe ohne Vorzeichen; Beschriftung „Entgangen“ (Summe ≥ 0) bzw. „Verlust vermieden“ (Summe < 0).
- **Zählungen sind neutral** („Geplatzte Konten 1“).
- **Kalender-Tönung:** dunkel Gewinn 16 %, Verlust **18 %** (Betrag dann 4,54:1); hell beide **10 %** auf `--surface`, Rand 35 % (Beträge 4,72/4,69:1, gleiche Helligkeit L* 94,5/93,9). Gilt für `.cal .d` und `.yc`.

### 1.7 Helles Design (zusätzlich zu den Tokens)

- Abdunklung hinter Dialogen `rgba(13, 19, 15, .32)`, Handy-Menü `.28`, Seitenpanel `.24` (dunkel bleibt `.6/.55/.45`).
- Kennzahlen-Leiste (`.kstrip`): Haarlinien statt Kachelschatten, Schatten an der Leiste.
- Aktive Einträge siehe 1.5.

### 1.8 Eigene Farben

- `forLight`: dunkelt in Schritten von 8 % ab, bis Luminanz ≤ 0,18 (höchstens 24 Schritte). Ergebnis: jede Vorgabe ≥ 4,64:1 auf Weiß (Neongrün `#1b7d47` 5,16; Blau `#326ed0` 4,91; Rot `#c74848` 4,72; Pink `#c83d82` 4,72; Türkis `#158090` 4,64; Gelb `#8c710c` 4,68; Orange `#b25310` 5,08). Bereits dunkle Werte (`#077a41`, `#c62e2e`, `#5f4fcf`) bleiben unverändert.
- `inkFor(h)`: Schrift auf einer Farbfläche ist `#ffffff` oder `#04140a`, je nachdem, was den höheren Kontrast hat.
- Theme setzt bei eigenen Farben `--profit-soft` (hell `.10`, dunkel `.12`), `--loss-soft` (hell `.10`, dunkel `.14`), `--accent-soft` (hell `.10`, dunkel `.13`).
- Vorschauen in Einstellungen → Design zeigen die **Anzeigefarbe** (im hellen Design `forLight(c)`), die Schrift der Paar-Chips über `inkFor`. Gewählt-Vergleiche nutzen die gespeicherten Rohwerte (Standard = `DEFAULTS.dark`).
- Farbpaare: „Violett / Gelb“ → „Blau / Gelb“ (`#3b82f6`, `#facc15`), „Weiß / Rot“ → „Neutral / Rot“ (Farben bleiben).

### 1.9 Diagramme

- Achsentext: eine Regel, `fill: var(--muted)` (4,85:1 dunkel und hell, Doppelregel Z. 1648 entfällt).
- Monte Carlo: Pfade `--text-2` mit Deckkraft .22; Drawdown-Histogramm `--text-2` .45, ab Ruin-Schwelle `--loss` .9.
- Aktivitäts-Heatmap (Fortschritt): neutral, Stufen `color-mix(in srgb, var(--text) 8 / 16 / 28 / 42 / 58 %, var(--surface-2))`.
- Regel-Tracker: Grün gedämpft `color-mix(in srgb, var(--accent) 18 / 32 / 50 / 70 %, var(--surface-2))`, Legende `.heat-legend.right` mit denselben vier Stufen.
- Report-Serien: `#4a6fe3` (Blau), `#b4549f` (Magenta), `#c0702f` (Kupfer), ein Satz für beide Designs (validiert: Helligkeitsband, Chroma, CVD, Normalsicht ΔE 18,5, Kontrast ≥ 3:1). Keine Serie in Grün, Bernstein oder Violett.
- Gewinn-Legendenpunkte und Affiliate-Balken in `--profit`.

### 1.10 Texte (neu oder geändert; jeweils in `js/lang/{en,es,hi,pt,zh}.js` eintragen)

| Ort | Vorher | Nachher |
|---|---|---|
| shadow.js:71 Spaltenkopf | „Kosten“ | „Effekt“ |
| dashboard.js:130 Banner-Knopf | „CSV“ | „CSV importieren“ (Schlüssel existiert, lang/en.js:113) |
| notebook.js:76 Link | „Tagesansicht“ | „Tagesansicht öffnen“ |
| trades.js:59 Beschriftung | „Entgangen“ (immer) | „Entgangen“ bzw. „Verlust vermieden“ |
| misc.js:186 Pille | „aktiv“ | „Aktiv“ (Schlüssel existiert, lang/en.js:300) |
| coach.js Kopf (allNew) | „{n} Einträge“ | „{n} neue Einträge“ |
| misc.js:234 Erklärsatz | „… Die Farben folgen deinen Akzent-, Verlust- und Break-even-Farben.“ | „… Setups sind neutral, Fehler stehen in der Verlustfarbe, Emotionen in der Break-even-Farbe.“ |
| misc.js:145 Hinweis Akzentfarbe | „Buttons, aktive Einträge und Diagramme.“ | „„Trade loggen“, Schalter, aktive Einträge und Diagramme.“ |
| progress.js:71 Info | „… desto kräftiger das Grün. …“ | „… desto kräftiger das Feld. …“ |
| theme.js:19 Paare | „Violett / Gelb“, „Weiß / Rot“ | „Blau / Gelb“, „Neutral / Rot“ |
| dashboard.js:124 aria-label | „Filter“ | „Filter“ bzw. „Filter ({0} aktiv)“ |
| editor.js Farbpalette | – | Abschnitt „Designfarben“, Kreis-Namen „Grau“, „Gewinn“, „Verlust“, „Warnung“, „Break-even“, „Info“, „Farbe {0}“ |

---

## 2. Konflikte und Entscheidungen

**K1 – Grün im hellen Design: ein dunkleres Token statt getrennter Text-Tokens.** Vorschläge: `--accent`/`--profit` gesamt dunkler (farbe_kontrast-1 `#077a41`, bereich_dashboard-3 `#067d45`) gegen eigene Text-Tokens bei hellem `#0fb862` (barrierefreiheit-7 `--accent-text`, bereich_konto-3 und bereich_notebook_news-3 `--accent-ink #04140a`, bereich_trades_tag-20 `--profit-text`/`--loss-text`, barrierefreiheit-24 `--focus`). **Entscheidung: ein Token, `#077a41`.** Gründe: Auch Balken, Kurven, Fokusring und Schalter brauchen ≥ 3:1, und `#0fb862` hat auf Weiß nur 2,61:1; die Text-Token-Lösung ließe genau diese Grafiken zu schwach. Eigene Farben werden über `forLight` (K8) ebenfalls ≥ 4,6:1. Mit `#077a41` hat weiße Schrift auf Grün 5,43:1, darum bleibt `--accent-ink` hell `#ffffff`, und `--focus`, `--accent-text`, `--profit-text`, `--loss-text` werden nicht gebraucht. Wertwahl: `#077a41` ist der einzige Kandidat mit ≥ 4,5:1 auch auf der Pillenfläche (4,72) und auf `--surface-3` (4,59); `#067d45` (4,40 Pille) und `#0c7f45` (4,32) fallen darunter.

**K2 – Helles Rot.** `#c62e2e` (farbe_kontrast-5) statt `#c92f2f` (bereich_dashboard-3) oder `#c93434` (barrierefreiheit-7): nur `#c62e2e` hält auf Pille (4,69 bei 10 %) und Kalenderkachel (4,69) ≥ 4,5.

**K3 – Helles Gelb.** Globales Abdunkeln von `--warn` (barrierefreiheit-7: `--warn: #9a6a08`) würde Ampel, Skala und Serien-Flamme bräunlich machen. Entscheidung: Token-Teilung nach farbe_kontrast-6 (`--warn-text`). Wert `#8f5f00` statt `#946200`/`#9a6a08`/`color-mix(65 %)`, weil nur er auch auf einer Warn-Pille über `--surface-2` 4,5 erreicht (4,51; `#946200` 4,28).

**K4 – `.btn.primary`.** Zwischen lokalem Umschalten einzelner Knöpfe (bereich_notebook_news-2, bereich_training-36 „folgt der globalen Entscheidung“) und globaler Neutralisierung (referenz-6) entscheide ich **global neutral**, weil BRIEF verbindlich sagt: Grün nur für Gewinn und den Hauptknopf „Trade loggen“. README Z. 207–208 („den Akzent-Knopf“) meint `.btn.accent`; der Satz wird präzisiert (Schritt R2). Aussehen: angehobene Fläche `--surface-3` (referenz-6). Die Variante „Text-Fläche (weiß auf Graphit)“ aus bereich_training-44 wird nicht genommen, weil sie das lauteste Element jeder Seite wäre und wieder lauter als „Trade loggen“. Der Ruhepunkt bekommt denselben neutralen Hauptknopf. Abgrenzung, welche Knöpfe primary bleiben, nach der Regel in 1.4: Absenden sichtbarer Formulare bleibt primary (prop.js:243 Ampel-„Speichern“, :262/:266 „Ausgabe/Payout erfassen“, widgets.js:374 Mentor-Frage). Der weitergehende Vorschlag in bereich_prop-16 („nur Dialog-Fuß“) und der Teil von bereich_dashboard-1 zu widgets.js:374 werden deshalb nicht umgesetzt; durch die neutrale Fläche gibt es dort ohnehin kein Grün mehr.

**K5 – Heute-Markierung.** Fünf Befunde (bereich_dashboard-16, farbe_kontrast-24, referenz-8, bereich_notebook_news-16, bereich_training-8) nennen verschiedene Ringfarben (`--text`, `--text-2`, `--border-2`). Entscheidung: Raster `2px --text-2` (gleiche Geometrie wie heute), Datumswähler `inset 1px --muted` (`--border-2` erreicht dunkel nur 1,26:1 und wäre kaum zu sehen), Dashboard-Kalender gefüllter Kreis `--text/--bg`. Mini-Kalender: Zellrand statt Unterstrich oder Gewicht 700 (Ziffern sind dort schon `--text`; 700 widerspricht der Gewichtsregel). `.rr-day.today` behält sein heutiges Gewicht 700 (Typografie-Thema), nur die Farbe wird neutral.

**K6 – Aktivitäts-Heatmap gegen Regel-Tracker.** bereich_dashboard-38 wollte die Tracker-Zellen in die (grünen) Aktivitätsregeln einhängen, bereich_training-8 macht die Aktivität neutral. Entscheidung: Aktivität neutral (Anzahl Trades ist keine Gewinn-Aussage); Tracker bleibt grün (Regeltreue = positiv), aber gedämpft 18/32/50/70 % mit eigener Legende `.heat-legend.right` (Werte aus dem Prüfer-Vorschlag zu bereich_dashboard-38). Damit passen in beiden Widgets Legende und Zellen zusammen.

**K7 – Kalendertönung.** farbe_kontrast-12 (Kleintext, dunkles Rot), bereich_dashboard-3 (hell 9/10 %) und diagramme-45 (hell 13 % Rot) widersprechen sich in den Prozenten. Entscheidung: hell 10/10 % mit Rand 35 % (beide Beträge ≥ 4,69:1, gleiche Helligkeit, also kein schwereres Rot im Hellen, so wie README Z. 188–189 die stärkere Rot-Tönung nur für dunkel begründet); dunkel Rot 23 → 18 % (Betrag 4,54:1, weiterhin kräftiger als Grün 16 %), statt einer zweiten, aufgehellten Rot-Schrift; Kleintext `--text-2`. Gilt auch für die Jahresübersicht `.yc`, damit beide Kalender gleich bleiben.

**K8 – `forLight` und Schriftfarbe auf Akzent.** Schwellen 0,16 / 0,18 / 0,19 und „nach Kontrast wählen“ (farbe_kontrast-15, -16, bereich_konto-3, bereich_notebook_news-3). Entscheidung: `forLight` 0,18 mit 8-%-Schritten (alle Vorgaben 4,64–5,16:1, nicht übertrieben dunkel); Schriftfarbe über eine echte Kontrastfunktion `inkFor` (entspricht der Kippstelle Luminanz ≈ 0,19 und ist robuster als eine feste Schwelle). Bekannte Grenze: Eigene Farben erreichen auf getönten Pillen 4,0–4,3:1 (Standardfarben ≥ 4,69).

**K9 – Platzhalter.** farbe_kontrast-10: `--muted` (≈ 5:1); typografie-10/bereich_einstellungen-15: `color-mix(--muted 75–80 %, transparent)` (≈ 3,3–3,8:1). Entscheidung: `--muted`, weil Suchfelder („Suchen: Symbol, Setup, Notiz …“, „Notizen durchsuchen“) keine andere Beschriftung haben. Vom eingegebenen Wert (`--text`, 15:1) bleibt der Platzhalter klar unterscheidbar. Der Editor-Platzhalter folgt (bereich_notebook_news-26).

**K10 – Kartensymbol im Reiter Zustand.** bereich_statistik-27 (neutrales Quadrat `--surface-2`) gegen ki_look-39 (ohne Fläche). Entscheidung ki_look-39: Symbol `--muted` 16 px ohne Kachel. Der Abstand kommt aus `.card-title { gap: 8px }`. Grund: „nichts Dekoratives“, und das gewünschte Symbol bleibt (Aufgabe 49).

**K11 – Willkommen-Banner.** zustaende-7 (Symbol „sparkle“ behalten, `.banner.accent` um `color` ergänzen oder in `.banner.ok` umbenennen) gegen bereich_dashboard-14/ki_look-14 (ohne Funkel-Symbol). Entscheidung: `U.banner('info', …)` ohne `icon`, beide Knöpfe neutral, „CSV importieren“; `.banner.accent` wird in **`.banner.ok`** umbenannt (beseitigt die Kollision mit der Hilfsklasse `.accent` dauerhaft) und nutzt `--profit` (Bedeutung „Ziel erreicht“). Info-Symbol in `--text-2` (wie `.nw-banner`, app.css:3065), nicht `--muted`.

**K12 – Report-Farben.** Tokens per `getComputedStyle` (Prüfer zu diagramme-44, bereich_dashboard-38) gegen eine feste Hex-Palette. Entscheidung: feste Palette `#4a6fe3/#b4549f/#c0702f`. `<input type="color">` braucht `#rrggbb`, der Satz besteht den Validator in beiden Designs, und die vorgeschlagenen Token-Werte fielen durch. Alte Standardfarben in gespeicherten Reports werden umgeschrieben, eigene bleiben.

**K13 – Disziplin-Kosten.** Ursprünglich „Kachel ohne Vorzeichen“ (bereich_training-3) gegen diagramme-36 (mit Vorzeichen wie Statistik → Fehler). Entscheidung: überall mit Vorzeichen (siehe 1.6). fwtest.js:24 vergleicht Widget und Seite über dieselbe `costView`, bleibt also grün.

**K14 – Coach „Neu“.** `border-color: var(--border-2)` gegen Löschen der Rand-Regel. Entscheidung: Regel Z. 2871 und Streifen Z. 2917 löschen. Bei „alle neu“ entfallen nur die Pillen, die Klasse `is-new` bleibt (coachtest.js:81 zählt sie).

**K15 – Zähler.** farbe_kontrast-42 (Paare nur > 0 färben) und bereich_statistik-39 (Tabelle ohne Farbe) sind zwei Kontexte, beide gelten (siehe 1.6).

**K16 – Prop-Bilanz.** Prüfer wollte die grüne Payout-Netto-Spalte behalten, bereich_prop-25 macht beide Spalten neutral. Entscheidung: beide neutral. Eine Spalte, in der jede Zeile grün ist, unterscheidet nichts, und Ausgaben und Payouts bleiben gleich behandelt.

**K17 – `.kv`-Selektor.** `.kv > span` (bereich_prop-9, bereich_statistik-2) gegen `.kv > span:first-child` (typografie-2). Entscheidung `:first-child`: trifft sicher nur das Label aus `U.kv` (ui.js:180) und prop-friedhof.js:32.

**K18 – Gewählte Notiz und Menüeintrag.** bereich_notebook_news-16: `.selected` mit `--surface-2` wäre identisch mit Hover; mit `--surface-3` identisch mit `.active`. Entscheidung: `.selected` = `--surface-3` + Rand `--border-2`, und `active` wird im Auswahlmodus nicht gesetzt (notebook.js:60). Menüeintrag `[aria-checked]`: flacher Auswahlstil als `inset`-Rand, weil Zeitraum-, Konto- und Sortiermenü kein Haken-Symbol haben (nur Schriftfarbe wäre unsichtbar).

**K19 – Long/Short-Schieber.** README Z. 43 („leuchtende Fläche“) gegen die neuere README Z. 203–206 und BRIEF („kein Schein“). Entscheidung: flach (bereich_trades_tag-12), README Z. 43 wird nachgezogen. Das Timing (260 ms, `--ease-io`) bleibt unangetastet (siehe Zurückgestellt).

**K20 – News-Chips.** Prüfer-Variante „Mini-Balken im Chip“ wird nicht übernommen (zusätzliches Element). Chips sind neutral wie alle Filter-Chips, die Balken in den Zeilen behalten Rot/Gelb/Grau (README Z. 113).

**K21 – Editor-Farbraster.** Das Raster ersetzen (Grauzeile tauschen) oder ergänzen? Entscheidung: ergänzen um eine Zeile „Designfarben“, das Raster bleibt vollständig (README Z. 124 „Schriftfarbe mit Farbraster“).

**K22 – Toter Code.** farbe_kontrast-20 und -26 schlagen Löschen vor (`U.heatmap`/`.heat`, `verifiedPill`). Entscheidung: umfärben statt löschen. Das hat keinen Funktionsbezug, und Aufräumen gehört nicht in die Farbgruppe.

**K23 – Schlaf-Schieber.** `min-width: 44px` (Prüfer) reicht nicht für „10,5 h“; Entscheidung `text-align: left` bei unveränderter Breite (bereich_trades_tag-45).

**K24 – Helles `--muted`.** `#626b65` (bereich_shell-17) gegen `#5f6862` (farbe_kontrast-9, -40). Entscheidung `#5f6862`: hält auch auf `--surface-3` (4,87) und auf gewählten Flächen (4,66) ≥ 4,5.

**K25 – „Mehr anzeigen“.** `d.all.length` gegen `rows.length`. Entscheidung `rows.length`: Auch im Reiter „Offene Positionen“ ohne Einträge erscheint kein Link ins Leere.

**K26 – Überschneidungen mit anderen Gruppen.** Schriftgrößen und -gewichte (typografie-10, bereich_dashboard-16, diagramme-37, `.rr-day`) entscheidet die Typografie-Spezifikation; hier wird nur Farbe festgelegt. Ausnahme: Der Editor-Platzhalter verliert seine 18 px (Sprung beim ersten Zeichen, bereich_notebook_news-26). Fokus im aufklappbaren Notiz-Abschnitt (Z. 1187) regelt bereich_notebook_news-35 (Barrierefreiheit). Kartentitel „Verpasste Trades“ regelt die Aufbau-Gruppe. Die Karte „Aktuelle Regeln“ (farbe_kontrast-22) kann durch die Aufbau-Gruppe (hierarchie-21) entfallen; dann entfällt Schritt C29. Legt die Komponenten-Gruppe ein Knopfsystem fest, muss es die Farbwerte aus 1.4 übernehmen.

**K27 – Offene Grünstellen ohne Befund (bewusst nicht angefasst).** Nach den Vorgaben wären auch diese Stellen zu prüfen, kein Befund dieser Gruppe nennt sie aber: Datumswähler gewählter Tag/Monat/Zeit (`.dp-day.sel`, `.dp-month.sel`, `.dp-t.sel`, `.dp-day.in/.edge`, `.dp-link.accent`), Zeitraum Start/Ende (README Z. 77, ausdrücklich so beschrieben), Symbol-Menü (`.sym-opt[aria-selected]`, Z. 886), Vorlagen-Menü (`.tpl-row .chk`, `.tpl-row.on .item.name`, Z. 1627/1631), Bearbeitungsmodus (`.edit-bar`, `.dot-live`, `.add-slot`, Z. 1567–1588), Report-Gruppe aufgeklappt (Z. 1717), Widget-Zahnrad aufgeklappt (Z. 1723), Dropzone-Hover (Z. 750), Checkliste und Coach-Aufgabe erledigt (Z. 802, 2931–2932), `.fw-rp.done` (Z. 1488), Log-Zeitleiste (Z. 1875), Notebook-Vorschau-Haken (Z. 1892), Schatten-Ich-Link und Stepper (Z. 2425, 2435), Prop-Listenmarker (Z. 2764), Sprachnotiz-Uhr (Z. 2570), Toast „ok“ (Z. 901). Sie bleiben in dieser Runde unverändert und stehen in der Erlaubt-Liste des Prüfskripts (Abschnitt 4). Sie sind Kandidaten für die Lückenrunde.

---

## 3. Umsetzungsschritte

Reihenfolge: A Tokens/Skalen → B Komponenten → C Einzelstellen → D Texte, Tests, Doku. Innerhalb einer Datei von oben nach unten. Zeilennummern beziehen sich auf den aktuellen Stand; nach Einfügungen verschieben sich spätere Zeilen, deshalb ist jeder Schritt zusätzlich über Selektor bzw. Funktionsnamen eindeutig.

### A. Tokens und Skalen

**A1 – `web/css/app.css` `:root` (dunkel)**
- Z. 22 `--muted: #8a867f;` → `--muted: #948f88;` — farbe_kontrast-9
- nach Z. 30 (`--profit`) neu: `--profit-soft: rgba(52, 245, 138, 0.12);` — farbe_kontrast-20, komponenten-8
- Z. 33 `--be: #8b7cf6;` → `--be: #9a8cf8;`; Z. 34 `--be-soft: rgba(139, 124, 246, 0.16);` → `--be-soft: rgba(154, 140, 248, 0.16);` — farbe_kontrast-7
- nach Z. 36 (`--warn-soft`) neu: `--warn-text: var(--warn);` und `--imp-mid: var(--warn);` — farbe_kontrast-6, bereich_notebook_news-42

**A2 – `web/css/app.css` helle Blöcke (Z. 57–62 im `@media (prefers-color-scheme: light)`-Block und Z. 67–72 in `:root[data-theme="light"]`, beide identisch ändern)**
- Z. 59/68: `--muted: #6a746d;` → `--muted: #5f6862;`
- Z. 60/70: `--accent: #0fb862; --accent-2: #0a9a52; --accent-ink: #ffffff; --accent-soft: rgba(15, 184, 98, 0.12); --accent-glow: rgba(15, 184, 98, 0.22);` → `--accent: #077a41; --accent-2: #06663a; --accent-ink: #ffffff; --accent-soft: rgba(7, 122, 65, 0.10); --accent-glow: rgba(7, 122, 65, 0.20);`
- Z. 61/71: `--profit: #0fb862; --loss: #e03e3e; --loss-soft: rgba(224, 62, 62, 0.12); --be: #6b5bd6; --be-soft: rgba(107, 91, 214, 0.14);` → `--profit: #077a41; --profit-soft: rgba(7, 122, 65, 0.10); --loss: #c62e2e; --loss-soft: rgba(198, 46, 46, 0.10); --be: #5f4fcf; --be-soft: rgba(95, 79, 207, 0.14);`
- Z. 62/72: `--warn: #d99a12; --warn-soft: rgba(217, 154, 18, 0.14); --info: #2b8fe0;` → `--warn: #d99a12; --warn-soft: rgba(217, 154, 18, 0.14); --warn-text: #8f5f00; --imp-mid: #b8820c; --info: #1d6db5;`
- Erledigt: farbe_kontrast-1, bereich_dashboard-3, barrierefreiheit-7, barrierefreiheit-24, bereich_konto-3, bereich_notebook_news-3, bereich_trades_tag-20, farbe_kontrast-5, farbe_kontrast-6, farbe_kontrast-7, farbe_kontrast-8, farbe_kontrast-9, farbe_kontrast-40 (Teil `--muted`), bereich_shell-17, bereich_notebook_news-42 (Teil Balken)

**A3 – `web/js/theme.js`**
- Z. 4 `DEFAULTS` → `{ dark: { accent: '#34f58a', profit: '#34f58a', loss: '#ff5c5c', be: '#9a8cf8' }, light: { accent: '#077a41', profit: '#077a41', loss: '#c62e2e', be: '#5f4fcf' } }` (wirkt automatisch auf misc.js:95/100/130 und certificate.js:10) — farbe_kontrast-1, bereich_dashboard-3, farbe_kontrast-5, farbe_kontrast-7
- Z. 19 `PRESETS_PAIR`: `['Violett / Gelb', '#8b7cf6', '#facc15']` → `['Blau / Gelb', '#3b82f6', '#facc15']`; `['Weiß / Rot', '#f2f5f3', '#ff5c5c']` → `['Neutral / Rot', '#f2f5f3', '#ff5c5c']`. Gespeicherte Farben bleiben, keine Migration. — bereich_einstellungen-18, bereich_einstellungen-17
- Z. 26 `forLight` → `const forLight = h => { let x = h; let i = 0; while (lum(x) > 0.18 && i++ < 24) x = shade(x, -0.08); return x; };` — farbe_kontrast-16
- direkt danach neu: `const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };` und `const inkFor = h => ratio(h, '#ffffff') >= ratio(h, '#04140a') ? '#ffffff' : '#04140a';` — farbe_kontrast-15
- Z. 45 in `apply`: `set('--accent-soft', acc && rgba(acc, 0.13));` → `set('--accent-soft', acc && rgba(acc, light ? 0.10 : 0.13));`; `set('--accent-ink', acc && (lum(acc) > 0.4 ? '#04140a' : '#ffffff'));` → `set('--accent-ink', acc && inkFor(acc));` — farbe_kontrast-15, bereich_konto-3, bereich_notebook_news-3
- Z. 47: `set('--loss-soft', l && rgba(l, 0.14));` → `set('--loss-soft', l && rgba(l, light ? 0.10 : 0.14)); set('--profit-soft', p && rgba(p, light ? 0.10 : 0.12));` — farbe_kontrast-20
- Z. 53 Export ergänzen: `…, surfaces, isLightBase, forLight, inkFor };` — bereich_einstellungen-17

### B. Komponenten (`web/css/app.css`, dann `web/js/ui.js`)

**B1 – Hilfsklassen, Z. 100:** `.warn { color: var(--warn); }` → `.warn { color: var(--warn-text); }` (`.accent` bleibt; nach C-Schritten nur noch von `.dp-link.accent` genutzt) — farbe_kontrast-6, bereich_konto-3

**B2 – Knöpfe, Z. 274–275** — referenz-6, bereich_notebook_news-2, bereich_einstellungen-9, bereich_prop-16, bereich_trades_tag-21, bereich_dashboard-1, bereich_training-36, bereich_konto-3, barrierefreiheit-7
- `.btn.primary { background: var(--accent); border-color: var(--accent); color: var(--accent-ink); font-weight: 600; }` → `.btn.primary { background: var(--surface-3); border-color: var(--border-2); color: var(--text); font-weight: 600; }`
- `.btn.primary:hover { background: var(--accent-2); border-color: var(--accent-2); box-shadow: 0 8px 20px -10px var(--accent-glow); }` → `.btn.primary:hover { background: color-mix(in srgb, var(--text) 8%, var(--surface-3)); border-color: color-mix(in srgb, var(--text) 18%, var(--border-2)); box-shadow: none; }`
- Folgeänderung Z. 1420 `.fd-foot .fd-n { … border-left: 1px solid color-mix(in srgb, var(--accent-ink) 30%, transparent); … }` → `border-left: 1px solid color-mix(in srgb, currentColor 30%, transparent);` (Trennstrich im neutralen „Anwenden“ bleibt sichtbar)

**B3 – Eingaben und Hinweise** — farbe_kontrast-10, farbe_kontrast-11, typografie-10, bereich_prop-34, barrierefreiheit-25, bereich_trades_tag-42, bereich_prop-40, farbe_kontrast-6, bereich_notebook_news-26
- Z. 294 `.input::placeholder { color: var(--faint); }` → `color: var(--muted);`
- Z. 299 `.field .hint { font-size: 11.5px; color: var(--faint); }` → `color: var(--muted);` (Größe unverändert, siehe K26)
- nach Z. 298 neu: `.field > label .lbl-hint { color: var(--muted); font-weight: 500; }`
- Z. 303 `.check input { accent-color: var(--accent); … }` → `accent-color: var(--text);`
- Z. 324 `.rating button { … color: var(--faint); … }` → `color: var(--muted);`
- Z. 325 `.rating button[aria-pressed="true"] { --lc: var(--warn); }` → `--lc: var(--warn-text);`
- Z. 876 `.sym-btn.sym-none .sym-v { color: var(--faint); … }` → `color: var(--muted);` („Symbol wählen“ ist die einzige Beschriftung)
- Z. 1382 `.fd-hint { … color: var(--faint); }` → `color: var(--muted);`
- Z. 2724 `.prop-rule .hint { font-size: 11.5px; color: var(--faint); }` → `color: var(--muted);`
- Z. 2966 `.stc-l small { … color: var(--faint); }` → `color: var(--muted);`

**B4 – Menüeinträge, Z. 337** — bereich_notebook_news-16, barrierefreiheit-7
`.popover .item[aria-checked="true"] { color: var(--accent); }` → `.popover .item[aria-checked="true"] { color: var(--text); background: color-mix(in srgb, var(--text) 10%, var(--surface)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--text) 22%, var(--border-2)); }`

**B5 – „Heute“ in Wählern** — referenz-8, farbe_kontrast-24, bereich_notebook_news-16
- Z. 363 `.rr-day.today { color: var(--accent); font-weight: 700; }` → `.rr-day.today { color: var(--text); font-weight: 700; }` (kein Ring)
- Z. 424 `.dp-day.today { color: var(--accent); font-weight: 700; box-shadow: inset 0 0 0 1px var(--accent-glow); }` → `.dp-day.today { color: var(--text); font-weight: 700; box-shadow: inset 0 0 0 1px var(--muted); }`
- Z. 431 `.dp-month.today { color: var(--accent); box-shadow: inset 0 0 0 1px var(--accent-glow); }` → `.dp-month.today { color: var(--text); box-shadow: inset 0 0 0 1px var(--muted); }`
- Z. 1026 `.datepick .dp.today { box-shadow: inset 0 0 0 1px var(--accent); }` → `box-shadow: inset 0 0 0 1px var(--muted);`

**B6 – Kartensymbol, Z. 500–502** — bereich_statistik-27, ki_look-39
- Kommentar Z. 500 → `/* kleines Symbol vor dem Kartentitel (U.card mit icon), neutral, ohne Fläche */`
- Z. 501 → `.card-ico { flex: 0 0 auto; display: grid; place-items: center; color: var(--muted); }`
- Z. 502 `.card-ico svg { width: 15px; height: 15px; }` → `width: 16px; height: 16px;`

**B7 – Pillen, Z. 546 und 549** — farbe_kontrast-20, komponenten-8, farbe_kontrast-26, bereich_trades_tag-20, bereich_konto-3, farbe_kontrast-6
- `.pill.win { background: var(--accent-soft); color: var(--accent); }` → `.pill.win { background: var(--profit-soft); color: var(--profit); }`
- `.pill.warn { background: var(--warn-soft); color: var(--warn); }` → `color: var(--warn-text);`

**B8 – Score-Skala, Z. 571–572:** in beiden `linear-gradient(…)` jeweils `var(--accent)` → `var(--profit)` — farbe_kontrast-19

**B9 – Regel-Chip, Z. 627:** `.chip.rule { background: var(--warn-soft); color: var(--warn); }` → `color: var(--warn-text);` — farbe_kontrast-6

**B10 – Schlüssel-Wert-Zeilen, Z. 653:** `.kv span { color: var(--muted); }` → `.kv > span:first-child { color: var(--muted); }` — typografie-2, bereich_prop-9, bereich_statistik-2

**B11 – Banner, Z. 669–671** — zustaende-7, bereich_dashboard-14, farbe_kontrast-8
- `.banner.info svg { color: var(--accent); }` → `.banner.info svg { color: var(--text-2); }`
- `.banner.accent { border-color: var(--accent); background: var(--accent-soft); }` → `.banner.ok { border-color: color-mix(in srgb, var(--profit) 45%, var(--border)); background: var(--profit-soft); color: var(--text); }`
- `.banner.accent svg { color: var(--accent); }` → `.banner.ok svg { color: var(--profit); }`

**B12 – Leerzustand, Z. 676:** `.empty svg { width: 34px; height: 34px; color: var(--faint); }` → `.empty > svg { … }` (Werte gleich; Symbole in Knöpfen des Leerzustands bleiben 16 px) — bereich_trades_tag-21

**B13 – Diagramm-Achsen** — diagramme-37
- Z. 683 `.chart text { fill: var(--muted); font-size: 11px; font-family: var(--font); }` → `.chart text { fill: var(--muted); font-size: 11px; font-variant-numeric: tabular-nums; }` (Schrift setzt die Sammelregel Z. 1800)
- Z. 1647–1648 Kommentar `/* Achsen-Text */` und `.chart text { fill: var(--text-2); font-size: 11.5px; }` löschen

**B14 – Kalender, Z. 708–731 und Jahresübersicht Z. 1693–1694** — bereich_dashboard-16, farbe_kontrast-24, referenz-8, farbe_kontrast-12, bereich_dashboard-3, diagramme-45
- Z. 708 `.cal .d .n { …; background: var(--surface-3); color: var(--text-2); }` → `background: none; color: var(--text-2);` (Position, 24×24, Radius, Größe und Gewicht bleiben)
- Z. 709 `.cal .d.today .n { background: var(--accent); color: var(--accent-ink); }` → `.cal .d.today .n { background: var(--text); color: var(--bg); }`
- Z. 711 `.cal .d.loss { background: color-mix(in srgb, var(--loss) 23%, var(--surface)); … }` → `18%` (Rand 52 % bleibt); ebenso Z. 1694 `.yc.loss` `23%` → `18%`
- Z. 713 `.cal .d.sel { box-shadow: 0 0 0 2px var(--accent); }` → `box-shadow: 0 0 0 2px var(--text-2);`
- nach Z. 722 neu: `.cal .d:is(.win, .loss, .be) :is(.c, .wr) { color: var(--text-2); }`
- nach Z. 722 neu (hell): `:root[data-theme="light"] .cal .d.win, :root[data-theme="light"] .yc.win { background: color-mix(in srgb, var(--profit) 10%, var(--surface)); border-color: color-mix(in srgb, var(--profit) 35%, var(--border)); }` und `:root[data-theme="light"] .cal .d.loss, :root[data-theme="light"] .yc.loss { background: color-mix(in srgb, var(--loss) 10%, var(--surface)); border-color: color-mix(in srgb, var(--loss) 35%, var(--border)); }`
- Z. 711 Kommentar → `/* dunkel: Rot etwas kräftiger als Grün (18 % zu 16 %), hell beide 10 % */`
- Z. 731 `.cal.mini .d.today .n { color: var(--accent); }` → `.cal.mini .d.today { border-color: var(--text-2); } .cal.mini .d.today .n { color: var(--text); }`

**B15 – Gewinn-Heatmap (ungenutzt), Z. 737–740** — farbe_kontrast-20
- `.heat i.l1 { background: color-mix(in srgb, var(--accent) 30%, var(--surface-3)); }` → `.heat i.l1 { background: color-mix(in srgb, var(--text) 18%, var(--surface-3)); }` (l1 = nur Check-in/Notiz)
- `.heat i.l2/.l3/.l4`: `var(--accent)` → `var(--profit)` (Prozente bleiben)

**B16 – Schieberegler, Z. 811–815** — bereich_trades_tag-45
- Z. 811 in `background: linear-gradient(90deg, var(--accent) var(--p, 50%), var(--surface-3) var(--p, 50%))` → `linear-gradient(90deg, var(--text-2) var(--p, 50%), var(--surface-3) var(--p, 50%))`
- Z. 812 `… background: var(--accent); border: 4px solid var(--surface); box-shadow: 0 0 0 1.5px var(--accent), 0 0 14px -2px var(--accent-glow); …` → `background: var(--text); border: 4px solid var(--surface); box-shadow: 0 0 0 1.5px var(--border-2);`
- Z. 813 `… background: var(--accent); … box-shadow: 0 0 0 1.5px var(--accent); …` → `background: var(--text); box-shadow: 0 0 0 1.5px var(--border-2);`
- Z. 815 `.slider .sv { min-width: 58px; text-align: right; … }` → `text-align: left;` (Breite 58 px und `.ticks` Z. 816 bleiben)

**B17 – Long/Short-Schalter im Trade-Dialog** — bereich_trades_tag-12
- Kommentar Z. 841 „eine leuchtende Fläche gleitet“ → „eine flache, leicht getönte Fläche gleitet“
- Z. 853–854 (in `.dir-switch::before`, Z. 852 mit `transition` bleibt unverändert): `background: linear-gradient(90deg, color-mix(in srgb, var(--dir-c) 26%, var(--surface-2)), color-mix(in srgb, var(--dir-c) 7%, var(--surface-2)) 85%); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--dir-c) 42%, transparent), -6px 4px 18px -10px color-mix(in srgb, var(--dir-c) 60%, transparent);` → `background: color-mix(in srgb, var(--dir-c) 10%, var(--surface)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--dir-c) 22%, var(--border-2));`
- Z. 869 `.dir-opt[aria-pressed="true"] .bi { background: var(--oc); box-shadow: 0 0 10px color-mix(in srgb, var(--oc) 50%, transparent); }` → `box-shadow: none;` (Fläche `var(--oc)` bleibt)

**B18 – Abdunklungen im hellen Design** — farbe_kontrast-33
- nach Z. 824 neu: `:root[data-theme="light"] .modal-bg { background: rgba(13, 19, 15, .32); }`
- in der Media-Query nach Z. 921 neu: `:root[data-theme="light"] .scrim { background: rgba(13, 19, 15, .28); }`
- nach Z. 1597 neu: `:root[data-theme="light"] .panel-bg { background: rgba(13, 19, 15, .24); }`

**B19 – Filter-Popover** — komponenten-31, farbe_kontrast-6
- Z. 1390 `.fd-tog.stars button { …; color: var(--warn); }` → `color: var(--warn-text);`; Z. 1391 `--lc: var(--warn)` → `--lc: var(--warn-text)`
- Z. 1401 `.fd-chip.setup { border-color: color-mix(in srgb, var(--accent) 45%, transparent); }` ersatzlos löschen
- Z. 1408 `.fd-add:hover, .fd-add.on { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }` → `{ border-color: var(--muted); color: var(--text); background: var(--surface-2); }`

**B20 – Ladelinie, Z. 1522 und 1527** — bewegung-44
- `.ld { …; color: var(--accent); … }` → `color: var(--text-2);`
- `.ld .ld-line { …; filter: drop-shadow(0 0 3px var(--accent-soft)); }` → `filter` streichen

**B21 – Unterstrich-Reiter und Prop-Filter** — bereich_prop-43
- Z. 2597 `.prop-sub a::after { …; background: var(--accent); … }` → `background: var(--text);`
- Z. 1869 `.set-tabs button[aria-pressed="true"] { color: var(--accent); border-bottom-color: var(--accent); }` → `{ color: var(--text); border-bottom-color: var(--text); }`
- Z. 2611 `.select.prop-fsel.on { border-color: var(--accent); color: var(--accent); }` → `{ border-color: var(--border-2); color: var(--text); background-color: var(--surface-2); }`

**B22 – Aktive Navigationseinträge** — bereich_shell-18, bereich_einstellungen-16, farbe_kontrast-40 (Symptom)
- nach Z. 179 neu: `:root[data-theme="light"] .nav a.active { background: var(--surface); border-color: var(--border-2); }`
- Z. 1810 `.set-nav a.active { background: var(--surface-2); color: var(--text); font-weight: 500; }` → `.set-nav a.active { background: var(--surface-2); box-shadow: inset 0 0 0 1px var(--border-2); color: var(--text); font-weight: 500; }`, darunter neu `:root[data-theme="light"] .set-nav a.active { background: var(--surface); }`

**B23 – Heatmaps, Tracker, Jahresraster** — bereich_training-8, bereich_dashboard-38, farbe_kontrast-24, referenz-8
- Z. 1287–1291 ersetzen (nur noch Aktivität und ihre Legende):
  `.activity i.l1, .heat-legend:not(.right) i.l1 { background: color-mix(in srgb, var(--text) 8%, var(--surface-2)); border-color: transparent; }`, ebenso `l2` 16 %, `l3` 28 %, `l4` 42 %, `l5` 58 %
- Z. 1292 `.activity i.today { box-shadow: 0 0 0 2px var(--accent); }` → `var(--text-2)`
- Z. 1668–1671 `.tracker i.l1 … l4` (25/45/70/100 %) → `color-mix(in srgb, var(--accent) 18%, var(--surface-2))`, `32%`, `50%`, `70%` (`border: 0` bleibt)
- Z. 1672 `.tracker i.today { box-shadow: 0 0 0 2px var(--accent); }` → `var(--text-2)`
- nach Z. 1675 neu: `.heat-legend.right i.l1 { background: color-mix(in srgb, var(--accent) 18%, var(--surface-2)); } .heat-legend.right i.l2 { background: color-mix(in srgb, var(--accent) 32%, var(--surface-2)); } .heat-legend.right i.l3 { background: color-mix(in srgb, var(--accent) 50%, var(--surface-2)); } .heat-legend.right i.l4 { background: color-mix(in srgb, var(--accent) 70%, var(--surface-2)); }`
- Z. 1771 `.ym-grid i.today { box-shadow: 0 0 0 2px var(--accent); }` → `var(--text-2)`

**B24 – Kennzahlen-Leiste hell, nach Z. 2603** — farbe_kontrast-32
`:root[data-theme="light"] .kstrip .tile { box-shadow: -1px 0 0 var(--border), 0 -1px 0 var(--border); }` und `:root[data-theme="light"] .grid.tiles.kstrip { box-shadow: 0 1px 2px rgba(0, 0, 0, .03), 0 6px 18px rgba(20, 30, 24, .06); }`

**B25 – Gemeinsamer Auswahlstil, Z. 3125–3128:** die Selektorliste (endet mit `.sb-user.active {`) um `.dh-context .btn.is-set` ergänzen — referenz-7

**B26 – Regeln-Symbol in Tabellen, neu (z. B. nach Z. 615):** `.tbl .rule-ic { display: inline-flex; vertical-align: middle; } .tbl .rule-ic svg { width: 14px; height: 14px; }` — bereich_trades_tag-19

**B27 – `web/js/ui.js`** — farbe_kontrast-19, bereich_trades_tag-19, farbe_kontrast-6, bereich_statistik-25
- Z. 184 in `ring`: `… : 'var(--accent)'` → `'var(--profit)'`
- Z. 185 `const scoreColor = s => s < 50 ? 'var(--loss)' : s < 75 ? 'var(--warn)' : 'var(--accent)';` → `… : 'var(--profit)';` und darunter neu `const scoreText = s => s < 50 ? 'var(--loss)' : s < 75 ? 'var(--warn-text)' : 'var(--text)';` (in `root.UI`, Z. 464, mit exportieren)
- Z. 350 (Monte-Carlo-Pfade) `stroke="var(--accent)" stroke-opacity=".3"` → `stroke="var(--text-2)" stroke-opacity=".22"`
- Z. 354 (Drawdown-Histogramm) `fill="var(--${b.lo >= mc.ruinPct ? 'loss' : 'accent'})" fill-opacity="${b.lo >= mc.ruinPct ? 1 : .75}"` → `fill="var(--${b.lo >= mc.ruinPct ? 'loss' : 'text-2'})" fill-opacity="${b.lo >= mc.ruinPct ? .9 : .45}"`

### C. Einzelstellen

**C1 – `web/css/app.css` Notebook und Editor** — bereich_notebook_news-16, bereich_notebook_news-26, ki_look-34, bereich_notebook_news-21, bereich_notebook_news-17, bereich_notebook_news-3, farbe_kontrast-6
- Z. 1007 `.nb .note-item .sel.on { background: var(--accent); border-color: var(--accent); color: var(--accent-ink); }` → `{ background: var(--text); border-color: var(--text); color: var(--bg); }`
- Z. 1008 `.nb .note-item.selected { background: var(--accent-soft); border-color: var(--accent-soft); }` → `{ background: var(--surface-3); border-color: var(--border-2); }`
- Z. 1012 `.nb .col-head .btn[aria-pressed="true"] { color: var(--accent); background: var(--accent-soft); }` → `{ color: var(--text); background: var(--surface-3); border-color: var(--border-2); }`
- nach Z. 1029 (`.nb .meta`) neu: `.nb .meta .pnl-line { margin-top: 4px; } .nb .meta .lbl-pnl { font-weight: 500; color: var(--text-2); } .nb .meta a { color: var(--text-2); text-decoration: underline; text-decoration-color: var(--border-2); text-underline-offset: 2px; } .nb .meta a:hover { color: var(--text); }`
- Z. 1031 `.nb .save-state.saving { color: var(--warn); }` → `var(--warn-text)`
- Z. 1044 `.nb .tagpop .sec.k-setup, .nb .tagpop .item.k-setup[aria-checked="true"] { color: var(--accent); }` → `.nb .tagpop .sec.k-setup { color: var(--muted); } .nb .tagpop .item.k-setup[aria-checked="true"] { color: var(--text); }`
- Z. 1052 `.nb .tagpop .chk { …; color: var(--accent); }` → `color: currentColor;`
- Z. 1090 `.nb-toolbar .tb[aria-pressed="true"] { background: var(--accent-soft); color: var(--accent); border-color: var(--accent-soft); }` → `{ background: var(--surface-3); color: var(--text); border-color: var(--border-2); }`
- Z. 1103 `.ed-pop .item .chk { …; color: var(--accent); }` → `color: var(--text);`
- Z. 1109 `.ed-palette .c { …; border: 1px solid rgba(255,255,255,.12); … }` → `border: 1px solid var(--border-2);`
- Z. 1120 `.nb-menu .row-item.on, .nb-menu .row-item:hover { background: var(--accent-soft); color: var(--accent); }` → `{ background: var(--surface-2); color: var(--text); }`
- Z. 1123 `… { background: var(--accent-soft); }` → `{ background: var(--surface-2); }`
- Z. 1124 `.nb-ytpop { …; border: 1px solid var(--accent); … }` → `border: 1px solid var(--border-2);`
- Z. 1130 `.ql-editor.ql-blank::before { color: var(--faint); font-style: normal; left: 20px; font-size: 18px; }` → `{ color: var(--muted); font-style: normal; left: 20px; }`
- Z. 1137 `.ql-editor blockquote { border-left: 3px solid var(--accent); … }` → `.ql-snow .ql-editor blockquote, .ql-editor blockquote { border-left: 2px solid var(--border-2); margin: 8px 0; padding-left: 14px; color: var(--text-2); }`
- Z. 1139 `.ql-editor code { background: var(--surface-3); color: var(--accent); … }` → Selektor `.ql-snow .ql-editor code, .ql-editor code` und `color: var(--text);`
- Z. 1140 `.ql-editor a { color: var(--accent); }` → `.ql-editor a { color: var(--text); text-decoration: underline; text-decoration-color: var(--border-2); text-underline-offset: 2px; }`; ebenso Z. 1190 `.nb-tweet a { color: var(--accent); … }` → `color: var(--text); text-decoration: underline; text-decoration-color: var(--border-2); text-underline-offset: 2px;` (`word-break` bleibt)
- Z. 1143 `… > .ql-ui { color: var(--accent); }` → `color: var(--text-2);`
- Z. 1148 und Z. 1154 (Quill-Tooltip-Links) `color: var(--accent)` → `color: var(--text)`
- Z. 1163 `.nb-figure .rs::before { …; background: var(--accent); … }` → `background: var(--text);`
- Z. 1165 `… { outline: 2px solid var(--accent); … }` → `outline: 2px solid var(--text-2);`
- Z. 1177 `.nb-figure .fig-bar button[aria-pressed="true"] { background: var(--accent-soft); color: var(--accent); }` → `{ background: var(--surface-3); color: var(--text); }`
- Z. 1187 `.nb-details summary:focus { color: var(--accent); }` löschen (Fokusring: bereich_notebook_news-35, andere Gruppe)

**C2 – `web/css/app.css` Fortschritt, Z. 1274** (entfällt, wenn die Aufbau-Gruppe die Karte „Aktuelle Regeln“ löscht) — farbe_kontrast-22
`.rules-list li::marker { color: var(--accent); font-weight: 700; }` → `.rules-list li::marker { color: var(--muted); font-weight: 500; font-family: var(--font-num); }`

**C3 – `web/css/app.css` Dashboard (Widget-Bibliothek, Letzte Trades, Report)** — bereich_dashboard-5, bereich_dashboard-1, referenz-9
- Z. 1613 `.sp-item .btn { flex: 0 0 auto; font-weight: 600; }` → `.sp-item .btn { flex: 0 0 auto; }` (Kommentar zur Breite streichen)
- Z. 1618 `.sp-item .btn.added { color: var(--accent); border-color: var(--accent-soft); background: var(--accent-soft); opacity: 1; }` → `{ color: var(--muted); border-color: transparent; background: transparent; opacity: 1; }`
- Z. 1659 `.more-link { color: var(--accent); font-weight: 600; font-size: 13px; text-decoration: none; }` → `.more-link { color: var(--text-2); font-weight: 500; font-size: 13px; text-decoration: none; }`
- Z. 1660 `.more-link:hover { text-decoration: underline; }` → `.more-link:hover { color: var(--text); text-decoration: underline; text-underline-offset: 3px; }`
- Z. 1707 `.rep-sel.on { border-color: var(--accent); }` → `.rep-sel.on { border-color: var(--border-2); background: var(--surface-3); }`
- Z. 1710 `.rep-foot .rep-reset { color: var(--accent); … }` → `color: var(--text-2);`
- Z. 1711 `.rep-foot .btn.primary { font-size: 12.5px; }` → `.rep-foot .rep-add { font-size: 12.5px; }`

**C4 – `web/css/app.css` Einstellungen** — bereich_einstellungen-47, bereich_einstellungen-8
- Z. 1853 `.theme-card.t-custom.is-new .tc-prev { …; outline: 1.5px dashed var(--border-2); …; color: var(--muted); }` → `outline: 1.5px dashed color-mix(in srgb, var(--text) 22%, transparent); … color: var(--text-2);`
- Z. 1921 `.lang-card:hover { border-color: var(--accent); }` → `border-color: var(--text-2);`
- Z. 1926 `.lang-card[aria-pressed="true"] .lang-cur { color: var(--accent); background: transparent; box-shadow: inset 0 0 0 1px var(--accent); }` → `{ color: var(--text-2); background: var(--surface-3); box-shadow: none; }`

**C5 – `web/css/app.css` Ruhepunkt** — farbe_kontrast-8, bereich_training-44
- Z. 2141 in `.rp { … }`: `--rp-dawn: #5cb8ff;` → `--rp-dawn: var(--info);`
- Z. 2142: aus `html[data-theme="light"] .rp, :root[data-theme="light"] .rp { --rp-dawn: #2a6fb8; --rp-brick: #c73a3a; --rp-on-phase: #ffffff; }` den Eintrag `--rp-dawn: #2a6fb8;` streichen
- Z. 2217 `.rp-btn.rp-primary { background: var(--phase); border-color: var(--phase); color: var(--rp-on-phase); }` → `.rp-btn.rp-primary { background: var(--surface-3); border-color: var(--border-2); color: var(--text); }`
- Z. 2218 `.rp-btn.rp-primary:hover { filter: brightness(1.08); }` → `.rp-btn.rp-primary:hover { background: color-mix(in srgb, var(--text) 8%, var(--surface-3)); border-color: color-mix(in srgb, var(--text) 18%, var(--border-2)); }`

**C6 – `web/css/app.css` Mentor** — bereich_konto-6, bereich_training-36
- Z. 2341 `.mentor-setup .ico svg { …; color: var(--accent); }` → `color: var(--text-2);`
- Z. 2350 `.msg.user { align-self: flex-end; background: var(--accent-soft); border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent); border-bottom-right-radius: 4px; }` → `.msg.user { align-self: flex-end; background: var(--surface-3); border: 1px solid var(--border-2); border-bottom-right-radius: 4px; }`
- Z. 2356 `.msg.typing i { …; background: var(--accent); … }` → `background: var(--muted);`

**C7 – `web/css/app.css` Schatten-Ich, Z. 2399 und 2402** — bereich_training-4
- Kommentar „an = leicht getönt“ → „an = leicht angehoben, neutral“
- `.shadow-rule.on { border-color: color-mix(in srgb, var(--accent) 30%, var(--border)); background: color-mix(in srgb, var(--accent) 5%, var(--surface-2)); }` → `.shadow-rule.on { border-color: var(--border-2); background: color-mix(in srgb, var(--text) 3%, var(--surface-2)); }`

**C8 – `web/css/app.css` Prop und Affiliate** — bereich_prop-40, bereich_konto-6
- Z. 2731 `.prop-assign-row input { accent-color: var(--accent); … }` → `accent-color: var(--text);`
- Z. 2678 `.aff-name:hover { color: var(--accent); }` → `.aff-name:hover { color: var(--text); text-decoration: underline; text-underline-offset: 3px; }`

**C9 – `web/css/app.css` Coach** — bereich_konto-2, bereich_konto-4, bereich_konto-6
- Z. 2861 `a.coach-name:hover { color: var(--accent); }` → `{ color: var(--text); text-decoration: underline; text-underline-offset: 3px; }`
- Z. 2871 `.coach-entry.is-new { … }` löschen
- Z. 2893 `.coach-join-head .ico svg { …; color: var(--accent); }` → `color: var(--text-2);`
- Z. 2898 `.coach-yes svg { …; color: var(--accent); }` → `color: var(--text-2);` (Z. 2900 `.coach-no svg` bleibt `--faint`)
- Z. 2903 `.coach-radio:has(input:checked) { border-color: color-mix(in srgb, var(--accent) 45%, var(--border)); background: color-mix(in srgb, var(--accent) 6%, var(--surface-2)); }` → `.coach-radio:has(input:checked) { color: var(--text); background: color-mix(in srgb, var(--text) 10%, var(--surface)); border-color: color-mix(in srgb, var(--text) 22%, var(--border-2)); box-shadow: none; }` (eigene Regel, nicht in die gemeinsame Liste; dort würde `:has()` in alten Browsern die ganze Liste ungültig machen)
- Z. 2904 `.coach-radio input { margin-top: 3px; accent-color: var(--accent); }` → `accent-color: var(--text);`
- Z. 2917 `.mn-reply.is-new { box-shadow: inset 2px 0 0 var(--accent); }` löschen

**C10 – `web/css/app.css` News, Z. 3096:** `.nw-imp.l2 i:nth-child(-n+2) { background: var(--warn); }` → `{ background: var(--imp-mid); }` — bereich_notebook_news-42

**C11 – `web/css/landing.css` Z. 14:** `.lp .hero h1 { …; color: #ededed; }` → `color: var(--text);` — ki_look-2

**C12 – `web/js/app.js`** — barrierefreiheit-25, bereich_trades_tag-42, typografie-10, farbe_kontrast-19, bereich_trades_tag-45, farbe_kontrast-11
- Z. 360 `<span class="faint">(leer = offen)</span>` → `<span class="lbl-hint">(leer = offen)</span>`
- Z. 497 `App.sleepZone`, Zweig fit: `color: 'var(--accent)'` → `'var(--profit)'`; Z. 501 `fit: { color: 'var(--accent)', … }` → `'var(--profit)'`
- Z. 511 `App.scaleColor`: `['var(--loss)', '#ff8c5c', 'var(--warn)', 'color-mix(in srgb, var(--accent) 70%, var(--warn))', 'var(--accent)']` → `['var(--loss)', 'color-mix(in srgb, var(--loss) 55%, var(--warn))', 'var(--warn)', 'color-mix(in srgb, var(--profit) 70%, var(--warn))', 'var(--profit)']`
- Z. 533 `<span class="faint">(wird in die Tagesnotiz im Notebook geschrieben)</span>` → `<span class="lbl-hint">…</span>`
- Z. 560 `<div class="small faint" …>Exporte von Brokern …` → `class="small muted"`
- Z. 567 `'<span class="faint">offen</span>'` → `'<span class="muted">offen</span>'`

**C13 – `web/js/core.js` Z. 329:** `{ key: 'realizedR', …, type: 'r', … }` → `type: 'rSigned'` (plannedR bleibt `'r'`) — farbe_kontrast-42

**C14 – `web/js/widgets.js`** — zustaende-26, diagramme-44, bereich_dashboard-38, bereich_dashboard-1, referenz-9
- Z. 176 (Kachel Ø Gewinn/Verlust): `<span class="pos">${fmt.cur(s.avgWin, { compact: s.avgWin >= 1000 })}</span><span class="neg">${fmt.cur(s.avgLoss, { compact: -s.avgLoss >= 1000 })}</span>` → vor dem `return` `const cmp = Math.max(s.avgWin, -s.avgLoss) >= 1000;`, dann `<span class="${U.cls(s.avgWin)}">${fmt.cur(s.avgWin, { compact: cmp })}</span><span class="${U.cls(s.avgLoss)}">${fmt.cur(s.avgLoss, { compact: cmp })}</span>`
- Z. 211 `const REPORT_COLORS = ['#3d6bff', '#f5a53a', '#4fd1a5'];` → `const REPORT_COLORS = ['#4a6fe3', '#b4549f', '#c0702f'];`
- Z. 216 (`reportConfig`): an die bestehende Kette nach `.map(...)` anhängen: `.map(o => { const OLD = { '#3d6bff': '#4a6fe3', '#f5a53a': '#b4549f', '#4fd1a5': '#c0702f' }; const n = OLD[String(o.color).toLowerCase()]; return n ? Object.assign({}, o, { color: n }) : o; })` (eigene Farben bleiben)
- Z. 223 `class="btn primary sm ${st.pick === 'new' ? 'on' : ''}"` → `class="btn sm rep-add ${st.pick === 'new' ? 'on' : ''}"`
- Z. 257 `${table}<div class="more-row"><a class="more-link" href="#/trades">Mehr anzeigen</a></div>` → `${table}${rows.length ? '<div class="more-row"><a class="more-link" href="#/trades">Mehr anzeigen</a></div>' : ''}`
- Z. 334 `class="btn sm primary" href="#/shadow"` → `class="btn sm"`; Z. 343 `class="btn primary fw-go"` → `class="btn fw-go"` (Blind-Replay, Feature-Flag bleibt); Z. 354 `class="btn sm primary"` → `class="btn sm"`; Z. 365 `class="btn sm${key === 'vor' ? ' primary' : ''}"` → `class="btn sm"`; Z. 373 `class="btn sm primary"` → `class="btn sm"`. Z. 374 (Formular „Fragen“) bleibt `btn primary` (siehe K4).

**C15 – `web/js/widgetpreviews.js`** — diagramme-44, bereich_training-3
- Z. 7 `BLUE = '#3d6bff'` → `'#4a6fe3'`, `ORANGE = '#f5a53a'` → `'#b4549f'`
- Z. 45 `big(8, 47, '2.170,41 €', L, 14)` → `big(8, 47, '−2.170,41 €', L, 14)`

**C16 – `web/js/screens/affiliate.js`** — farbe_kontrast-20, bereich_konto-8
- Z. 47 `fill="var(--accent)"` → `fill="var(--profit)"`
- Z. 67 `<td>${U.pill(paid ? 'Ausgezahlt' : 'Offen', paid ? 'win' : 'neutral')}</td>` → `<td>${paid ? '<span class="muted">Ausgezahlt</span>' : U.pill('Offen', 'neutral')}</td>`

**C17 – `web/js/screens/coach.js`** — bereich_konto-3, bereich_konto-4, bereich_konto-6, komponenten-8, farbe_kontrast-26, farbe_kontrast-11
- Z. 22 `class="btn primary" href="#/settings/mentor"` → `class="btn"` (navigiert, Regel 1.4)
- Z. 35 `U.pill('Neu', 'win')` → `U.pill('Neu')`
- Z. 48 `<b class="accent">${unread} ungelesen</b>` → `<b>${unread} ungelesen</b>`
- Z. 53 `class="btn sm primary"` („+ Gruppe“) → `class="btn sm"`
- Z. 86 `<span class="accent">${I.check}</span>` → `<span class="muted">${I.check}</span>`
- Z. 87 `U.pill(`${r.new} neu`, 'win')` → `U.pill(`${r.new} neu`)`; `'<span class="faint">0</span>'` → `'<span class="muted">0</span>'`
- Z. 133 `function entryHTML(e, notes, gid, sid, myId)` → `function entryHTML(e, notes, gid, sid, myId, allNew)`; Z. 137 `${e.is_new ? ` ${U.pill('Neu', 'win')}` : ''}` → `${e.is_new && !allNew ? ` ${U.pill('Neu')}` : ''}` (Klasse `is-new` an der `section` bleibt unverändert)
- Z. 146 `<span class="accent">erledigt</span>` → `<span>erledigt</span>`
- In `journal()` (Z. 150 ff.): `const allNew = !!j && j.entries.length > 1 && j.entries.every(e => e.is_new);`; Z. 153 `entryHTML(e, j.notes, gid, sid, myId)` → `entryHTML(e, j.notes, gid, sid, myId, allNew)`; Z. 157 `${j.entries.length === 1 ? '1 Eintrag' : `${j.entries.length} Einträge`}` → `${j.entries.length === 1 ? '1 Eintrag' : allNew ? `${j.entries.length} neue Einträge` : `${j.entries.length} Einträge`}`

**C18 – `web/js/screens/dash-filter.js` Z. 95 und Z. 183:** `<div class="small faint" style="padding:8px 10px">Nichts gefunden` → `class="small muted"` — barrierefreiheit-25, farbe_kontrast-11

**C19 – `web/js/screens/dashboard.js`** — bereich_dashboard-5, referenz-7, zustaende-7, bereich_dashboard-14
- Z. 63 `class="btn sm sp-add ${added ? 'added' : 'primary'}"` → `class="btn sm sp-add${added ? ' added' : ''}"`
- Z. 124 `<button type="button" class="btn ${fN ? 'accent' : ''}" data-action="dash-f-open" aria-label="Filter">` → `<button type="button" class="btn${fN ? ' is-set' : ''}" data-action="dash-f-open" aria-label="${fN ? `Filter (${fN} aktiv)` : 'Filter'}">` (Zähler `.cntb` unverändert)
- Z. 130 `U.banner('accent', 'Willkommen', '…', { icon: 'sparkle', trailing: `<button … class="btn sm" data-action="import">${I.upload} CSV</button><button … class="btn sm primary" data-action="install-sample">Beispieldaten laden</button>` })` → `U.banner('info', 'Willkommen', '…', { trailing: `<button type="button" class="btn sm" data-action="import">${I.upload} CSV importieren</button><button type="button" class="btn sm" data-action="install-sample">Beispieldaten laden</button>` })` (ohne `icon`, Standard ist `info`; `data-action` bleiben)

**C20 – `web/js/screens/day.js`** — farbe_kontrast-24, referenz-8, komponenten-8, bereich_trades_tag-25, farbe_kontrast-42, bereich_trades_tag-19, barrierefreiheit-25, bereich_trades_tag-21
- Z. 12 `U.pill('Heute', 'win')` → `U.pill('Heute', 'neutral')`
- Z. 14 `<span class="pos">${s.wins}</span> / <span class="neg">${s.losses}</span>` → `<span class="${s.wins ? 'pos' : ''}">${s.wins}</span> / <span class="${s.losses ? 'neg' : ''}">${s.losses}</span>`
- Z. 15 `<b style="color:${U.scoreColor(sc)}">${sc}</b>` → `<span style="color:${U.scoreText(sc)}">${sc}</span>`
- Z. 19 `<span class="faint">Noch leer.</span>` → `<span class="muted">Noch leer.</span>`; `class="btn sm primary" data-action="nb-day-note"` → `class="btn sm"`

**C21 – `web/js/screens/mentor.js`** — barrierefreiheit-25, farbe_kontrast-11, bereich_training-36
- Z. 79 `class="small faint" style="margin-top:14px">Anleitung zum Server:` → `class="small muted"`; `class="btn primary" href="#/settings/mentor">Zu den Einstellungen` → `class="btn"`
- Z. 84 Senden `btn primary icon` bleibt (Formular-Absenden, jetzt neutral)
- Z. 85 `class="mentor-note small faint"` → `class="mentor-note small muted"`

**C22 – `web/js/screens/misc.js`** — bereich_einstellungen-37, bereich_einstellungen-9, barrierefreiheit-25, farbe_kontrast-26, komponenten-8, bereich_einstellungen-17, referenz-6
- Z. 10 `setups: { label: 'Setups', color: 'var(--accent)', cls: 'setup' }` → `color: 'var(--text-2)'`
- Z. 62 `class="btn primary sm" data-action="twofa"` → `class="btn sm"`
- Z. 69 `class="small faint">Speicherort:` → `class="small muted"`
- Z. 186 `U.pill('aktiv', 'win')` → `U.pill('Aktiv')`; `class="btn sm primary" data-action="edit-account"` → `class="btn sm"`
- Z. 207 `class="btn sm primary">${I.plus} Hinzufügen` → `class="btn sm"`
- Z. 234 Satz `Die Farben folgen deinen Akzent-, Verlust- und Break-even-Farben.` → `Setups sind neutral, Fehler stehen in der Verlustfarbe, Emotionen in der Break-even-Farbe.`
- Z. 238 `class="btn sm primary" data-action="tag-new"` → `class="btn sm"`
- Z. 95 (`App.refreshSavedColors`) `T.DEFAULTS[st.theme === 'light' ? 'light' : 'dark'].accent` → `T.DEFAULTS.dark.accent`
- Z. 90–93 `savedDots`: `style="--c:${c}"` → `style="--c:${S.settings.theme === 'light' ? root.Theme.forLight(c) : c}"`
- In `design()` (Z. 129 ff.) am Anfang ergänzen: `const pv = c => st.theme === 'light' ? T.forLight(c) : c; const raw = k => (col[k] || T.DEFAULTS.dark[k]).toLowerCase();`
- Z. 134 Paare: `aria-pressed="${cur.profit.toLowerCase() === p && cur.loss.toLowerCase() === l}"` → `aria-pressed="${raw('profit') === p && raw('loss') === l}"`; `<i style="background:${p}">` → `<i style="background:${pv(p)};color:${T.inkFor(pv(p))}">`; `<i style="background:${l}">` → `<i style="background:${pv(l)};color:${T.inkFor(pv(l))}">` (app.css:1947 `color:#04140a` bleibt als Rückfall)
- Z. 141 `picker`: `<i style="background:${val}">` → `<i style="background:${pv(val)}">`
- Z. 145 Akzentpunkte: `aria-pressed="${cur.accent.toLowerCase() === c}"` → `aria-pressed="${raw('accent') === c}"`, `style="--c:${c}"` → `style="--c:${pv(c)}"`; Aufruf `savedDots(cur.accent, …)` → `savedDots(raw('accent'), …)`; Hinweis „Buttons, aktive Einträge und Diagramme.“ → „„Trade loggen“, Schalter, aktive Einträge und Diagramme.“

**C23 – `web/js/screens/news.js` Z. 76–77:** Konstante `IMP_COL` löschen und in `chip` den Teil `${key === 'impact' ? ` style="--lc:${IMP_COL[v]}"` : ''}` entfernen — bereich_notebook_news-42, farbe_kontrast-6

**C24 – `web/js/screens/notebook.js`** — bereich_notebook_news-26, barrierefreiheit-25, bereich_notebook_news-16, bereich_notebook_news-2, bereich_notebook_news-17, bereich_notebook_news-3
- Z. 34 `<span class="small faint">Noch keine Tags</span>` → `class="small muted"`
- Z. 54 `<div class="small faint" style="padding:4px 10px">Noch keine eigenen Ordner` → `class="small muted"`
- Z. 60 `class="note-item ${cur && cur.id === n.id ? 'active' : ''} …"` → `class="note-item ${!nb.selectMode && cur && cur.id === n.id ? 'active' : ''} …"`
- Z. 61 `class="btn sm primary grow" data-action="nb-new"` → `class="btn sm grow"`
- Z. 66 `class="btn sm primary" data-action="nb-new"` → `class="btn sm"` (Z. 47 „Anwenden“, 67 „Wiederherstellen“, 116/119/160 „Speichern“, 170 „Öffnen“ bleiben `primary` und werden über B2 neutral)
- Z. 76: `<div style="margin-top:4px;font-weight:700;color:var(--text)">Netto-P&L ${U.pnl(pnl, '', …)}` → `<div class="pnl-line"><span class="lbl-pnl">Netto-P&L</span> ${U.pnl(pnl, 'num', …)}` (übrige Argumente unverändert); bei den Links „Trade öffnen“ und „Tagesansicht“ `class="accent"` entfernen; Text „Tagesansicht“ → „Tagesansicht öffnen“

**C25 – `web/js/screens/progress.js` Z. 71:** Info `… Je mehr Trades, desto kräftiger das Grün. …` → `… Je mehr Trades, desto kräftiger das Feld. …` — bereich_training-8

**C26 – `web/js/screens/prop.js`** — bereich_prop-35, komponenten-8, farbe_kontrast-26, bereich_prop-16, zustaende-7, bereich_prop-25
- Z. 20 `STATUS_KIND = { active: 'open', … }` → `active: 'neutral'` („Beantragt“ Z. 267/286 bleibt `open`)
- Z. 81 `U.pill(`geprüft ${…}`, 'win')` → `U.pill(`geprüft ${…}`)`; Z. 236 `U.pill('geprüft', 'win')` → `U.pill('geprüft')`
- Z. 82 `class="btn primary" data-action="prop-account-new"` → `class="btn"`; Z. 244 `class="btn sm primary" data-action="prop-account-new"` → `class="btn sm"` (entfällt, falls die Aufbau-Gruppe den Knopf streicht)
- Z. 97 `U.banner('accent', 'Ziel erreicht', …)` → `U.banner('ok', 'Ziel erreicht', …)`
- Z. 251 `class="btn sm${e[kind] ? '' : ' primary'}"` → `class="btn sm"`
- Z. 263 `<td class="r neg">${fmt.cur(e.amount)}` → `<td class="r">`; Z. 267 und Z. 286 `<td class="r pos">${fmt.cur(p.net)}` → `<td class="r">`

**C27 – `web/js/screens/prop-friedhof.js` Z. 56:** im ersten `U.tile('Geplatzte Konten', …)` `tint: 'neg'` streichen — bereich_prop-44

**C28 – `web/js/screens/ruhepunkt.js`** — bereich_training-44
- Z. 155 `class="btn primary" data-close>Schließen` → `class="btn"`
- Z. 232 `class: 'rp-btn rp-primary'` (Atmung „Starten“) → `class: 'rp-btn'`
- Z. 366 `class: 'rp-btn rp-primary'` (Countdown) → `class: 'rp-btn'` (Z. 737 Navigation und Z. 791 Mentor bleiben `rp-primary`)

**C29 – `web/js/screens/shadow.js`** — bereich_training-3
- Kommentar Z. 24 → `/* Kosten-Darstellung: Wirkung auf das Konto mit Vorzeichen (wie Tabelle, Ranking und Statistik → Fehler) */`
- Z. 25 `costView`: Zweig `cost > C.EPS`: `text: fmt.cur(cost)` → `text: fmt.cur(-cost, { signed: true })` (Klasse `neg` bleibt); Zweig `cost < -C.EPS`: `text: fmt.cur(-cost)` → `text: fmt.cur(-cost, { signed: true })` (Klasse `pos` bleibt); Null-Zweig unverändert
- Z. 69 `${U.pnl(v.cost, '', costR)}` → `${U.pnl(-v.cost, '', costR.r == null ? {} : { r: -costR.r })}`
- Z. 71 `<th class="r">Kosten</th>` → `<th class="r">Effekt</th>`

**C30 – `web/js/screens/stats.js`** — farbe_kontrast-20, farbe_kontrast-42, bereich_statistik-39, typografie-2
- Z. 14 Legendenpunkt `<i style="background:var(--accent)">` → `var(--profit)`
- Z. 21 in `statVal` ergänzen: `case 'rSigned': return U.rText(v);`
- Z. 31 `U.kv('Gewinntage / Verlusttage', `<span class="pos">${ds.winDays}</span> / <span class="neg">${ds.lossDays}</span>`)` → `<span class="${ds.winDays ? 'pos' : ''}">${ds.winDays}</span> / <span class="${ds.lossDays ? 'neg' : ''}">${ds.lossDays}</span>`
- Z. 32 `<td class="r pos">${d.wins}</td><td class="r neg">${d.losses}</td>` → `<td class="r">${d.wins}</td><td class="r">${d.losses}</td>`; `<td class="r neg">${d.intradayDD ? fmt.cur(-d.intradayDD) : '—'}</td>` → `${d.intradayDD ? `<td class="r neg">${fmt.cur(-d.intradayDD)}</td>` : '<td class="r faint">—</td>'}`

**C31 – `web/js/screens/trades.js`** — bereich_trades_tag-21, bereich_trades_tag-19, bereich_trades_tag-42, barrierefreiheit-25, bereich_trades_tag-25, bereich_trades_tag-29, farbe_kontrast-11
- Z. 45 (Leerzustand) `class="btn sm primary" data-action="new-trade"` → `class="btn sm accent"`
- Z. 49 Score: `<b style="color:${U.scoreColor(sc)}">${sc}</b>` → `<span style="color:${U.scoreText(sc)}">${sc}</span>`; Regeln: `<span class="pos">${I.check.replace('<svg', '<svg style="width:14px;height:14px;display:inline"')}</span>` → `<span class="rule-ic muted">${I.check}</span>` und `<span class="neg" data-tip="…">${I.close.replace(…)}</span>` → `<span class="rule-ic neg" data-tip="…">${I.close}</span>`; `'<span class="faint">offen</span>'` → `'<span class="muted">offen</span>'` (die beiden „—“ bleiben `faint`)
- Z. 54 Tageskarten: `<span class="pos">${d.wins}</span> / <span class="neg">${d.losses}</span>` → `<span class="${d.wins ? 'pos' : ''}">${d.wins}</span> / <span class="${d.losses ? 'neg' : ''}">${d.losses}</span>`
- Z. 59 Verpasste Trades: `<div class="caption">Entgangen</div><div class="score-big ${U.cls(total)}">${fmt.cur(total, { signed: true })}</div>` → `<div class="caption">${total >= 0 ? 'Entgangen' : 'Verlust vermieden'}</div><div class="score-big">${fmt.cur(Math.abs(total))}</div>`
- Z. 74 Disziplin-Teilwerte: `c.f >= 0.99 ? 'var(--accent)' : c.f > 0 ? 'var(--warn)' : 'var(--loss)'` → `c.f >= 0.99 ? 'var(--text-2)' : c.f > 0 ? 'var(--warn-text)' : 'var(--loss)'`
- Z. 76 `class="pos small">Keine Fehler markiert` → `class="muted small"`
- Z. 83 `${v.transcript ? '' : 'faint'}` → `${v.transcript ? '' : 'muted'}`
- Z. 84 `class="btn sm primary" data-action="voice-open"` → `class="btn sm"`; Z. 85 `class="btn primary sm" data-action="edit-trade"` → `class="btn sm"`

**C32 – `web/js/editor.js` (Farbpalette, Z. 106–112)** — bereich_notebook_news-21
- Neue Konstante nach Z. 106: `const THEME_COLORS = [['var(--muted)', 'Grau'], ['var(--profit)', 'Gewinn'], ['var(--loss)', 'Verlust'], ['var(--warn-text)', 'Warnung'], ['var(--be)', 'Break-even'], ['var(--info)', 'Info']];`
- `palette(kind, custom)` (Z. 112) umbauen:
  - Abschnitt „Eigene Farben“ (Überschrift und Reihe) nur ausgeben, wenn `custom.length`; jeder eigene Kreis `aria-label="Farbe ${esc(c)}"`.
  - davor neuer Abschnitt `<div class="sec">Designfarben</div><div class="row-c">…</div>` mit einem Kreis je `THEME_COLORS`: für `kind === 'color'` `data-value="${v}"` und `style="background:${v}"`, für `kind === 'background'` `data-value="color-mix(in srgb, ${v} 22%, transparent)"` und gleicher `style`; `aria-label` und `data-tip` = Name. Die Grau-Farbe (`var(--muted)`) entfällt beim Textmarker.
  - den „+“-Kreis (`label.c.add`) ans Ende dieser Reihe „Designfarben“ setzen.
  - Kreise des Rasters „Standardfarben“ bekommen `aria-label="Farbe ${c}"`. Raster, „Farbe entfernen“ und das Speichern als Wert bleiben unverändert (alte Hex-Werte bleiben gültig).

### D. Texte, Tests, Dokumentation

**D1 – `web/js/lang/{en,es,hi,pt,zh}.js`:** für jeden Text aus 1.10 den Schlüssel anlegen bzw. den alten ersetzen (geänderte ganze Sätze: misc.js:234, misc.js:145-Hinweis, progress.js:71; neue Wörter: „Effekt“, „Tagesansicht öffnen“, „Verlust vermieden“, „{0} neue Einträge“, „Filter ({0} aktiv)“, „Blau / Gelb“, „Neutral / Rot“, „Designfarben“, „Grau“, „Warnung“, „Info“, „Farbe {0}“; vorhandene Schlüssel „Gewinn“, „Verlust“, „Break-even“, „Aktiv“, „CSV importieren“ prüfen). Englisch zum Beispiel: „Effect“, „Open day view“, „Loss avoided“, „{0} new entries“, „Filter ({0} active)“, „Blue / Yellow“, „Neutral / Red“, „Theme colors“. — betrifft bereich_training-3, bereich_notebook_news-17, bereich_trades_tag-29, bereich_konto-4, referenz-7, bereich_einstellungen-18, bereich_einstellungen-17, bereich_einstellungen-37, bereich_training-8, bereich_notebook_news-21, farbe_kontrast-26

**D2 – Tests**
- `web/e2e/dashtest.js` Z. 38, 49, 111: `'.side-panel .sp-item .btn.primary'` → `'.side-panel .sp-item .sp-add:not(.added)'` — bereich_dashboard-5
- `web/e2e/newstest.js` Z. 67: Prüfung umdrehen, neuer Text „Gewählte Wichtigkeit-Chips sind neutral“, Bedingung `(await p.$eval('[data-action=news-f][data-value=high]', b => b.style.getPropertyValue('--lc'))) === ''` — bereich_notebook_news-42

**D3 – `web/README.md`**
- Z. 43: „eine leuchtende Fläche gleitet zur gewählten Seite“ → „eine flache, leicht getönte Fläche gleitet zur gewählten Seite“ — bereich_trades_tag-12
- Z. 113 nach „Feiertage mit Kalender-Symbol)“ ergänzen: „; die gewählten Wichtigkeits-Chips im Filter sind neutral wie alle Filter-Chips“ — bereich_notebook_news-42
- Z. 188–189 → „Rote Flächen (Verlusttage im Kalender und in der Jahresübersicht, Fläche unter der Kurve im Minus) sind im dunklen Design etwas kräftiger getönt als grüne (18 % zu 16 %), damit sie auf dem dunklen Grund gleich stark wirken; im hellen Design sind beide gleich (10 %, Rand 35 %). Kleintext auf getönten Kacheln steht in `--text-2`.“ — farbe_kontrast-12, diagramme-45, bereich_dashboard-3
- nach Z. 201 neu: „Im hellen Design sind die Signalfarben abgedunkelt (Gewinn und Akzent `#077a41`, Verlust `#c62e2e`, Break-even `#5f4fcf`, Info `#1d6db5`, Warntext `#8f5f00`), damit Zahlen mindestens 4,5:1 erreichen; eigene Farben werden dafür automatisch abgedunkelt (`Theme.forLight`), die Schrift auf Farbflächen wählt `Theme.inkFor` nach dem höheren Kontrast. Report-Linien haben eine feste Palette (Blau, Magenta, Kupfer) ohne Grün.“ — farbe_kontrast-1, -5, -7, -8, -15, -16, diagramme-44
- Z. 203–208 ersetzen durch den Absatz: „**Grün nur für Gewinn und „Trade loggen“:** Grün (`--profit`, `--accent`) steht für Gewinn und Positives (Beträge, Pille „Gewinn“, Gewinntage, Kurven, „Ziel erreicht“, bestandene Konten, Regeltreue im Regel-Tracker, Score ab 75 in Ring und Skala), für „Trade loggen“ (`.btn.accent`, der einzige Knopf mit Licht), für Schalter, den kleinen Balken am aktiven Eintrag, die Hinweis-Punkte und den Fokusring. Bestätigende Knöpfe in Formularen und Dialogen (`.btn.primary`: Speichern, Anwenden, Senden) sind neutral: angehobene Fläche, feiner Rand, Gewicht 600. Was öffnet, anlegt, hinzufügt oder navigiert, ist ein normaler Knopf. Ausgewählte Reiter, Segmente, Chips, Karten, Menüeinträge und der aktive Filter-Knopf sind flach und ruhig: eine leicht angehobene Fläche mit feinem Rand, ohne Licht, Verlauf oder Schein (ein gemeinsamer Stil am Ende von `css/app.css`). `--lc` setzt eine bewusste Farbe nur dort, wo sie etwas bedeutet (Gewinn/Verlust, Long/Short, Bewertung, Fehler-/Emotions-Chips): Schrift in der Farbe, Fläche leicht getönt, Rand leise gefärbt. Neutral sind außerdem Setup-Chips und die Kategorie Setups, Avatare, die gewählte Notiz, Häkchen und Optionsfelder, „Heute“ (im Kalender ein Kreis in Schriftfarbe, in Datumswählern ein feiner Ring), Status-Pillen (Heute, Aktiv, geprüft, Neu), Links wie „Mehr anzeigen“, die Aktivitäts-Heatmap im Fortschritt, der Zähler im Filter-Knopf und die News-Karte. Info-Blau (`--info`) nur für den Status „offen“ und die Kalender-Ansichten Trefferquote/Trades; Info-Banner tragen ein neutrales Symbol. Lesbarer Text steht mindestens in `--muted` (≥ 4,5:1), `--faint` nur für Striche, Linien und leere Symbole. Gelber Text nutzt `--warn-text`.“ — referenz-6, bereich_dashboard-1, komponenten-8, farbe_kontrast-8, farbe_kontrast-24, bereich_prop-40, farbe_kontrast-11
- Z. 224: „eingeschaltet ist sie leicht getönt“ → „eingeschaltet ist sie leicht angehoben (neutral, feiner Rand)“ — bereich_training-4
- Z. 340: „über die ein grünes Stück gleitet“ → „über die ein helles Stück gleitet“ — bewegung-44

---

## 4. Akzeptanzkriterien

**4.1 Kontrast (berechnete Werte aus `getComputedStyle`, beide Designs; Prüfskript im Ordner `scratchpad` mit Playwright, Beispieldaten, `localfonts.js`)**

| Prüfpunkt | Route | Dunkel | Hell |
|---|---|---|---|
| Netto-P&L-Kachel „893,04 €“ (`.tile .val .pos`) auf `--surface` | dashboard | ≥ 4,5 | ≥ 5,4 (`rgb(7, 122, 65)`) |
| P&L-Zelle `.tbl .pos` / `.neg` | trades | ≥ 4,5 | ≥ 5,4 / ≥ 5,4 |
| Pille „Gewinn“, „Verlust“, „Break-even“ (Text auf eigener Fläche) | trades, dashboard | ≥ 4,5 | ≥ 4,6 |
| `.pill.warn`, `.warn`-Text, Chip „Mittel“ | coach, stats_mc | ≥ 4,5 | ≥ 4,5 |
| `.pill.open` „Offen“ | prop_konten, trades | ≥ 4,5 | ≥ 4,5 |
| `.field .hint`, `.prop-rule .hint`, `.fd-hint`, `.stc-l small`, Platzhalter | prop (Dialog Konto), settings_trading, pop_filter, stats_state, trades (Suche) | ≥ 4,5 | ≥ 4,5 |
| Betrag und Kleintext auf getönter Kalenderkachel | dashboard | Betrag ≥ 4,5 · Kleintext ≥ 6 | Betrag ≥ 4,6 · Kleintext ≥ 8 |
| Schrift auf `.btn.primary` | settings_profil | ≥ 12 | ≥ 15 |
| „Trade loggen“ (`.btn.accent`) Schrift | alle | unverändert | ≥ 4,8 |
| Fokusring (`outline-color`) gegen `--surface` und `--bg` | alle | ≥ 3 | ≥ 5 |
| Gruppentitel Seitenleiste (`--muted` auf `--bg-2`) | dashboard | ≥ 4,5 | ≥ 5,0 |
| Report-Palette | dashboard (Report) | `validate_palette.js "#4a6fe3,#b4549f,#c0702f" --mode dark --surface "#1a1917"` → ALL PASS | `--mode light --surface "#ffffff"` → ALL PASS |
| Eigene Farbe hell: Einstellungen → Design, Akzent Gelb, Paar „Blau / Orange“ | settings_design | – | `--accent`, `--profit`, `--loss` je ≥ 4,6 auf Weiß; `--accent-ink` = `#ffffff` |

**4.2 Grün nur mit Bedeutung (DOM-Prüfung auf allen Routen und Dialogen des Atlas, dunkel und hell)**
Im Browser je Route ausführen; Ergebnis muss leer sein:
```js
const acc = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
const prf = getComputedStyle(document.documentElement).getPropertyValue('--profit').trim();
const probe = c => { const d = document.createElement('i'); d.style.color = c; document.body.append(d); const v = getComputedStyle(d).color; d.remove(); return v; };
const G = [probe(acc), probe(prf)];
const allow = '.pos, .pill.win, .btn.accent, .switch, .rp-switch, .nav a.active, .nav-dot, .sb-av-dot, .banner.ok, .prop-card.passed, .prop-ampel, .cal .d.win, .yc.win, .tracker, .heat-legend.right, .tracker-foot, .dstreak, .card:has(.dstreak.s3), .ring, .score-scale, .chart, svg, .dir-switch, .dir-opt, .dash-head .tl, .rr-day, .dp-day, .dp-month, .dp-t, .dp-link, .sym-opt, .tpl-row, .edit-bar, .dot-live, .add-slot, .w.editing, .rep-g, .w-cfg, .dropzone, .checklist, .ct-check, .fw-rp, .logtbl, .nb-preview, .sr-step, .shadow-hint, .prop-patterns, .prop-highlights, .voice-clock, .toast, .tc-side, .theme-card, .conf, .rh-rounds, .rh-steps, .rb-track, .replay-progress';
[...document.querySelectorAll('body *')].filter(e => { const s = getComputedStyle(e); const own = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()); return (own && G.includes(s.color)) || G.includes(s.backgroundColor) || G.includes(s.borderTopColor); }).filter(e => !e.closest(allow)).map(e => e.tagName + '.' + e.className);
```
Die Erlaubt-Liste enthält nur die Bedeutungsstellen aus 1.1 und die offenen Stellen aus K27. Ausdrücklich **nicht** mehr grün sein dürfen: `.btn.primary`, `.more-link`, `.pill` mit „Heute/Aktiv/geprüft/Neu“, `.cal .d.today .n`, `.card-ico`, `.lang-cur`, `.set-tabs`, `.prop-sub`, `.prop-fsel.on`, `.fd-add`, `.fd-chip`, `.msg.user`, `.shadow-rule.on`, `.coach-radio`, `.coach-entry`, `.sp-item .btn`, `.rep-sel`, `.popover .item`, `.note-item`, Banner „Willkommen“.

**4.3 grep-Prüfungen (im Ordner `web/`)**
- `grep -n "var(--accent" css/app.css` liefert **keine** Zeile mehr mit diesen Selektoren: `.btn.primary`, `.popover .item[aria-checked`, `.rr-day.today`, `.dp-day.today`, `.dp-month.today`, `.card-ico`, `.pill.win`, `.score-scale`, `.banner.info`, `.banner.accent`, `.cal .d.today`, `.cal .d.sel`, `.cal.mini`, `.heat i.l`, `.slider input`, `.dir-switch::before`-Verlauf, `.note-item`, `.col-head .btn`, `.datepick .dp.today`, `.tagpop`, `.nb-toolbar`, `.ed-pop .item .chk`, `.nb-menu`, `.nb-ytpop`, `.ql-editor`, `.ql-tooltip`, `.nb-figure`, `.nb-details`, `.nb-tweet`, `.rules-list`, `.activity`, `.fd-chip.setup`, `.fd-add`, `.ld`, `.sp-item`, `.more-link`, `.ym-grid`, `.rep-sel`, `.rep-reset`, `.set-tabs`, `.lang-card`, `.mentor-setup`, `.msg`, `.shadow-rule`, `.prop-sub`, `.prop-fsel`, `.aff-name`, `.prop-assign-row`, `.coach-name`, `.coach-entry`, `.coach-join-head`, `.coach-yes`, `.coach-radio`, `.mn-reply`, `.check input`.
- `grep -n "var(--faint)" css/app.css` → nur noch Z. 23 (Token) und die Selektoren `.faint`, `.dp-day.out`, `.dp-tval.empty`, `span.info`, `.empty > svg`, `.datepick .dp.out`, `.dstreak-flame`, `.rep-it:disabled`, `.pg-nav button:disabled`, `.prop-ampel`, `.coach-no svg`, `.coach-task.done .ct-text` (Linie), `.stc-col.empty > b`.
- `grep -rn 'class="[^"]*\bfaint\b' js` → nur Stellen, deren Inhalt „—“ oder „★“ ist (ui.js:166, trades.js:49 ×2, trades.js:68, trades.js:76, coach.js:16, prop-friedhof.js:13, stats.js:32 neu).
- `grep -rn "'win')" js` (Pillen) → nur ui.js:177, widgets.js:36, :170, :174; `grep -n "paid ? 'win'" js/screens/affiliate.js` → leer.
- `grep -rn "btn[^\"']*primary" js/widgets.js js/screens/notebook.js js/screens/misc.js js/screens/trades.js js/screens/day.js js/screens/prop.js js/screens/coach.js js/screens/ruhepunkt.js js/screens/dashboard.js js/screens/mentor.js` → keine Treffer an den in C14, C17, C19–C22, C24, C26, C28, C31 genannten Zeilen (erlaubt: Formular-/Dialog-Bestätigungen wie notebook.js:47/67/116/119/160/170, misc.js:58/158/201/221/245/268/311, prop.js:97/200/204/221/226/243/262/266, trades.js:110/118, coach.js:129/140/148/178/197/271, mentor.js:84, widgets.js:374, dashboard.js:119/184/195).
- `grep -n "#ff8c5c\|#ededed\|rgba(255,255,255,.12)" js/app.js css/landing.css css/app.css` → keine Treffer in app.js:511, landing.css:14, app.css:1109.
- `grep -n "accent-color" css/app.css` → nur `var(--text)`.
- `grep -n "IMP_COL" js/screens/news.js` → leer.
- `grep -n "0fb862\|e03e3e\|6b5bd6\|2b8fe0\|8b7cf6" css/app.css js/theme.js` → leer (außer Ordnerfarben in store.js/notebook.js/sample.js, die nicht BE sind).

**4.4 Zensus (dunkel 1440, `audit/census.json` neu erzeugen mit `atlas.js`)**
- `color` `rgb(138, 134, 127)` (altes `--muted`): 940 → **0**; dafür erscheint `rgb(148, 143, 136)`.
- `color` `rgb(79, 76, 71)` (`--faint`) als Textfarbe: 19 → nur Elemente mit Textprobe „—“ (in `census/*.json` je Seite prüfen): mentor 2 → 0, settings 4 → 0, settings_profil 4 → 0, prop_konten 1 → 0, settings_trading 1 → 0, stats_state 7 → höchstens die „—“-Werte.
- `bg` `rgb(52, 245, 138)`: notebook 1 → 0, leer_trades 1 → 0, settings_konten 1 → 0, settings_regeln, settings_inhalte, settings_profil, prop/prop_cockpit, coach → nur noch Schalter, Ampel und Punkte (Prüfung über 4.2).
- `color` `rgb(52, 245, 138)`: settings_sprache 1 → 0, settings_logs 1 → 0, settings_inhalte 1 → 0, stats_state 3 → 0 (Kartensymbole); dashboard 15 → nur `.pos`-Werte und „Trade loggen“.

**4.5 Screenshot-Prüfpunkte (Atlas neu aufnehmen, vorher → nachher)**
- `light-1440/dashboard.png`: „893,04 €“ und „+803,45 €“ in dunklem Smaragdgrün klar lesbar; Kalender-Gewinn- und Verlusttage gleich hell; „11“ als dunkler Kreis, alle anderen Tageszahlen ohne graue Kreise; „Mehr anzeigen“ grau; Achsenbeschriftung grau statt fast schwarz; „Trade loggen“ ist das einzige grüne Bedienelement.
- `dark-1440/dashboard.png` und `extra/dash/*`: keine grünen „Öffnen“-Links, keine grünen Vollknöpfe in Widgets; Regel-Tracker gedämpft grün, Legende passt zu den Zellen.
- `dark-1440/settings_konten.png`, `settings_profil.png`, `settings_regeln.png`, `settings_inhalte.png`: kein grün gefüllter Knopf; „Speichern“ hellgrau angehoben; Setups-Punkt grau; Reiter „Kategorien“ weiß unterstrichen.
- `light-1440/settings_profil.png` und `settings_design.png`: gewählter Eintrag im Einstellungs-Menü als weiße Fläche mit Rand sichtbar; Paar-Chip „Neutral / Rot“ mit sichtbarer grauer Fläche; „Grün / Rot“ ist als gewählt markiert.
- `dark-1440/notebook.png`, `extra-dark-390/leer_notebook.png`: „Neue Notiz“ neutral; am Handy nur ein grüner Plus-Knopf („Trade loggen“).
- `extra-dark-1440/panel_widget_hinzufuegen.png`: keine grünen Flächen; „Hinzugefügt“ grau ohne Fläche.
- `extra-dark-1440/modal_trade_loggen_long.png` und hell: Long-Hälfte flach getönt, kein Verlauf, kein Schein am Pfeilkreis.
- `light-1440/modal_trade_loggen.png`: Seite hinter dem Dialog hellgrau (≈ `#abaeab`), nicht dunkelgrau.
- `extra-dark-1440/modal_checkin.png`: Schlaf-Spur grau, Knopf hell ohne Schein, „7 h“ direkt neben dem Spurende.
- `dark-1440/shadow.png`, `light-1440/shadow.png`: eingeschaltete Regeln ohne Grünton; Tabelle „Effekt“ zeigt „−824,03 €“ rot, Kachel ebenso.
- `extra/fsm/progress_voll.png`: Aktivitäts-Heatmap grau abgestuft; Info-Text ohne „Grün“.
- `dark-1440/stats_mc.png`: Pfade und Histogramm grau, nur Ruin-Bereich rot. `stats_state.png`: Symbole ohne grüne Kachel. `stats_days.png`: „Ø Gewinntag“ grün, „Ø Verlusttag“ rot, Zähler in der Tabelle neutral, kein rotes „—“.
- `dark-1440/prop.png`, `light-1440/prop.png`: „bereit“ grün, „Consistency verletzt“ gelb, „Konto geplatzt“ rot; Kennzahlen-Leiste hell mit Haarlinien; `prop_konten.png` „Aktiv“ grau; `extra/hicks-prop-1440-bilanz.png` Betragsspalten neutral, Unterreiter weiß unterstrichen; `prop_friedhof.png` „1“ neutral.
- `extra/cca/coach-*.png`: keine grünen Ränder, Pillen oder Haken; bei „alle neu“ keine Einzel-Pillen, Kopf „28 neue Einträge“; gewählte Option „Nur ab heute“ grau angehoben.
- `dark-1440/settings_sprache.png`: „EUR“ grau. `dark-1440/news.png`, `light-1440/news.png`: gewählte Wichtigkeits-Chips neutral; gelbe Balken hell kräftiger.
- `extra/slop/landing_light.png`: Hero-Überschrift dunkel und klar lesbar.
- `dark-1440/mentor.png`: eigene Nachrichten grau, Tipp-Punkte grau, KI-Hinweis lesbar.

**4.6 Regression**
- `bash web/e2e/runall.sh` (im Ordner `scratchpad`): alle Suiten PASS, ohne CRASH, insbesondere dashtest (angepasst), newstest (angepasst), coachtest (81, 110), fwtest (24), scorestatetest (20), rptest, mentortest, switchtest, headtest (61), affiliatetest (51), langtest (neue Texte übersetzt), mobiletest.
- `node --test web/tests/*.mjs` grün.
- Ein gespeicherter Report mit den alten Standardfarben zeigt nach dem Laden die neuen; eine eigene Report-Farbe bleibt.

---

## 5. Zurückgestellt

| Befund (Teil) | Was nicht umgesetzt wird | Grund |
|---|---|---|
| farbe_kontrast-40 (Teil) | helle Flächen `--surface-2 #eef1ee`, `--surface-3 #e3e8e4`, Theme-Karte `--cw`; Seitenleiste `--bg-2` → `--bg`; dunkle Ränder `.cal .wd`/`.shadow-rule` → `--border-2` | Das sichtbare Problem (unsichtbare gewählte Einträge auf `--surface-2`) lösen B22 gezielt, und `--muted` wird ohnehin angehoben. Eine globale Flächenverschiebung ändert jede Hover- und Inset-Fläche des hellen Designs und überschneidet sich mit dem offenen Inventarpunkt A14 (warmes Hell). Zusätzliche Ränder im Dunklen fügen Linien hinzu, das ist Geschmack („nichts Dekoratives“). |
| typografie-10 (Teil) | Schriftgrößen 11,5/11 → 12 px bei `.field .hint`, `.fd-hint`, `.stc-l small`, `.ed-hint` | Gehört zur Typo-Skala (Inventar A4, Typografie-Spezifikation); `.fd-hint` würde im 320 px breiten Filter umbrechen. Hier nur die Farbe. |
| bereich_dashboard-16 (Teil) | Tageszahl 11,5 → 12 px, Gewicht 500 | Typografie-Spezifikation; Fläche und Farbe sind hier geregelt. |
| diagramme-37 (Teil) | endgültige Achsen-Schriftgröße | Typografie-Spezifikation. Hier gilt `--muted` und die bestehende Regel 11 px, bis die Typo-Skala etwas anderes festlegt. |
| bereich_trades_tag-29 (Teil) | Kartentitel „Verpasste Trades“ weglassen, `.score-big` 30 → 25 px | Aufbau- bzw. Typografie-Thema; `.score-big` wird auch in day.js:14, app.js:530, stats.js:45 und widgets.js:227 genutzt. |
| bereich_trades_tag-12 (Teil) | `transition: transform 260ms` → `var(--dur-2)` | Bewegung; die Nutzer-Aufgabe „Long/Short-Wechsel ruckelt“ ist abgeschlossen, das Timing bleibt. |
| farbe_kontrast-20 (Teil), farbe_kontrast-26 (Teil) | Löschen von `U.heatmap`/`.heat` und `verifiedPill` | Kein Farbthema. Beide werden umgefärbt (B15, C26), Aufräumen später. |
| bereich_notebook_news-21 (Teil) | Farbraster entfernen | README Z. 124 dokumentiert das Raster als Funktion; es bleibt, nur ergänzt (C32). |
| bereich_notebook_news-16 (Teil) | Fokus-Stil des aufklappbaren Abschnitts (Z. 1187) | Regelt bereich_notebook_news-35 (Barrierefreiheit). Hier wird nur das Grün entfernt. |
| bereich_prop-16 (Teil), bereich_dashboard-1 (Teil) | Absenden-Knöpfe sichtbarer Formulare auf `.btn` (prop.js:243/262/266, widgets.js:374) | Widerspricht der Knopf-Regel 1.4; durch die neutrale `.btn.primary` gibt es dort kein Grün mehr (K4). |

---

## 6. Nutzer fragen

| Befund | Frage | Empfehlung |
|---|---|---|
| bereich_trades_tag-17 | Die Long/Short-Abzeichen im TradeLog, in der Tagesansicht, bei „Letzte Trades“ und im Trade-Kopf sind heute grün (Long) bzw. rot (Short), so wie in README Z. 45–46 festgelegt. Dadurch steht in vielen Zeilen ein rotes „SHORT“ neben einem grünen Gewinn (in trades.png 4 von 7 Zeilen). Sollen Fläche, Rand und Schrift der Abzeichen neutral werden und nur der kleine Pfeil im Kreis die Richtungsfarbe behalten? | **Ja, so umsetzen:** app.css:618–619 in `.badge` `color: color-mix(in srgb, var(--c) 80%, var(--text)); border: 1px solid color-mix(in srgb, var(--c) 16%, transparent); background: color-mix(in srgb, var(--c) 8%, transparent);` → `color: var(--text-2); border: 1px solid var(--border); background: var(--surface-2);`; `--c` (Z. 618/620) und `.badge .bi` (Z. 621–622) bleiben, also ↗ grün und ↘ rot im Kreis. Schreibweise LONG/SHORT und Größe bleiben. Kommentar app.css:617 und README Z. 45–46 → „Pille neutral (Fläche, Rand, Schrift), nur der Pfeil im Kreis trägt Grün/Rot“. Der Long/Short-Umschalter im Trade-Dialog und der Dashboard-Filter bleiben farbig. Die weitergehende Variante (auch der Pfeil grau, „Long/Short“ statt Versalien) empfehle ich nicht: Die Richtung auf einen Blick ist für Daytrader nützlich, und der Kern deiner Festlegung bleibt so erhalten. |
