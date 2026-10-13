# Spezifikation Typografie – Journalyst

Leitung: Themengruppe „Typografie“ (40 bestätigte Befunde aus `audit/spec-input/typografie.json`).
Grundlage: `audit/BRIEF.md`, `web/README.md`, `audit/inventar-css.md` (Abschnitt 1, A1–A10, A26), `audit/census.json`, Code-Stand des Audits (`web/css/app.css` mit 3144 Zeilen).
Zeilenangaben („Z.“) beziehen sich auf diesen Stand. Sie verschieben sich, sobald andere Gruppen umsetzen. **Immer nach Selektor suchen, die Zeile ist nur ein Hinweis.**

Abgedeckte Befunde: typografie-1, -3, -9, -11, -12, -14, -17, -19, -20, -21, -23, -31 · referenz-28, -32, -35, -43 · bereich_konto-31, -33, -34 · bereich_dashboard-44 · responsiv-33 · bereich_notebook_news-14, -15, -48 · bereich_training-21, -33, -46 · bereich_statistik-17, -18, -40, -41, -42 · bereich_trades_tag-31, -39 · bereich_einstellungen-28, -29, -30 · bereich_prop-49 · bereich_shell-22 · diagramme-42.

---

## 1. Zielzustand

### 1.1 Schriften laden

- **Satoshi als variable Schrift** (Gewichtsachse 300–900) über Fontshare: `https://api.fontshare.com/v2/css?f[]=satoshi@1&display=swap`. Damit sind 500, 600 und 700 echte, sichtbar verschiedene Stufen. Heute lädt die App nur die festen Schnitte 400/500/700/900, deshalb rendert jedes 600 als 700 und jedes 800 als 900 (gemessen: „Dashboard Statistiken“ 40 px → 500/600/700/800/900 = 391/411/411/425/425 px; mit der variablen Datei 388/401/408/417/422 px). Die verbindliche Stufung „Titel 600, nur Werte und Hauptknöpfe 700“ (BRIEF, README Z. 209) ist erst damit sichtbar.
- Onest bleibt wie bisher über Google Fonts (400/500/600/700/800). Die anderen Schriftarten aus `theme.js` (Quicksand, Nunito, Inter, Roboto) bleiben unverändert.
- Weil 800 und 900 bei Satoshi künftig verschieden aussehen, steht die Marke ausdrücklich auf **900**, damit sie aussieht wie heute.

### 1.2 Familien: Satoshi für Wörter, Onest für Ziffern

| Regel | Beispiele vorher → nachher |
|---|---|
| **Onest (`--font-num`)** trägt jedes Element, dessen Inhalt überwiegend aus Ziffern besteht: Beträge, Prozent, R, Faktoren, Zähler, Kurse, Datum und Uhrzeit in Ziffernform, Achsen. Ein Bindewort innerhalb eines Betragspaars (z. B. „von“, „bis“, „fehlen“) darf mit in Onest stehen. | Prop-Saldo „111.262 $“ Satoshi → Onest · Widget-Wert „824,03 €“ Satoshi → Onest · Tagesleiste „+247,50 €“ Satoshi → Onest · Handy-Kalender „−1,1k€“ Satoshi → Onest · Drawdown „−4,2 %“ Satoshi → Onest · „Kosten je Fehler“-Betrag Satoshi → Onest · Farbpaar-Vorschau „+240 €“ Satoshi → Onest |
| **Satoshi (`--font`)** trägt alle Wörter: Namen, Notizen, Setup-Chips, Status-Pillen, Tabellenköpfe, ausgeschriebene Daten. Tabellenzellen sind **standardmäßig Satoshi**. Onest bekommen nur Zahlenzellen, also `.tbl td.r`, `.tbl td.c` und Zellen mit der Klasse `num`. | „Apex Trader Funding 100K“, „Range-Fade“, „Gewinn“, „Funded“, „Journal-Einträge (Notebook, …)“: Onest → Satoshi · Tabellenkopf „Netto-P&L“, „Trades“, „RR“ (`th.r`): Onest → Satoshi, damit alle Köpfe einer Zeile auf derselben Grundlinie stehen |
| Kopier-Tickets (`.cpn-code`, Coupon-Code und Affiliate-Link) bleiben in Onest, wie in der README unter „Coupon-Codes“ beschrieben. | – |
| `--font-display` bleibt nur als Alias für Satoshi bestehen. Wert-Regeln setzen **keine** `font-family: var(--font-display)` mehr, sonst überstimmen sie die Onest-Sammelregel (Pflicht bei `.prop-balance .val` und `.rh-big`, die nach der Sammelregel stehen). | – |

### 1.3 Gewichte (verbindlich)

| Gewicht | Rolle | Gilt für (Auswahl, vollständige Liste in 3.2) |
|---|---|---|
| 400 | Fließtext, Hilfstext, Beschreibung, Tabellenzelle, kleine Kennzahl-Beschriftung | `body`, `.small`, `.card-sub`, `.tbl td`, `.day-card .stats .k`, `.strat-stats .k`, `.fw-stats > div > span`, gedämpfter Zusatz in Listenwerten |
| 500 | **Steuerelemente** (Knopf, Reiter, Segment, Chip, Menüeintrag, Navigation, Datums- und Kalenderknöpfe, Toolbar), **Tabellenkopf**, **Kachel-Titel und Wert-Beschriftung**, **Zeilentitel einer Option** in den Einstellungen, Toast | `.btn`, `.btn.accent` (auch der aktive Filter-Knopf), `.tabs button`, `.seg button`, `.prop-tabs a`, `.prop-sub a`, `.set-tabs button`, `.fd-*`, `.rp-btn`, `.dp-month`, `.dp-link`, `.nb .datebtn`, `.datepick .dp`, `.nb .tagpill`, `.add-slot`, `.more-link`, `.toast`, `.tbl th`, `.tile .head`, `.val-label`, `.stat-tile .k`, `.set-row b`, `.coach-nrow b` |
| 600 | **Titel** (h1–h4, Karten-, Block-, Listen-Titel, Zeilenkennung in Tabellen), **Abschnitts-Eyebrow**, Feld-Label, **Etiketten** (Pille, Abzeichen, Zähler), **Listenwerte** (`.kv b`, `.bar-row .bl b`) | `.card-title`, `.set-head h2`, `.set-block h3`, `.empty b`, `.shadow-intro b`, `.nb .note-item b`, `.tbl .sym`, `.tbl td.lbl`, `.aff-name`, `.caption` und alle Eyebrows, `.field > label`, `.pill`, `.badge`, `.btn .cntb` |
| 700 | **Kennzahl-Werte** (alle `--fv-*`), Beträge in Kalender, Tabellen und Pillen, **Hauptknöpfe** | `.tile .val`, `.score-big`, `.big-stat`, `.btn.primary`, „Trade loggen“ (`.btn.accent.tl`), `.rp-btn.rp-primary` |
| 800 | nur der Tages-P&L im Kalender (Onest, README Z. 191 „am PC kräftiger, Onest 800“) | `.cal .d .p`, `.cal .d .pm` im Container |
| 900 | Marke JOURNALYST | `.brand`, Zertifikat `.cert-brand .name`, Startseite `.lp .hero h1`, `.lp .step .k` |

Ausgewählte Zustände ändern das Gewicht nie (BRIEF: keine fetten aktiven Einträge). Der aktive Filter-Knopf (`.btn.accent`) steht deshalb auf 500 wie jeder Knopf.

### 1.4 Größenskala (Tokens in `:root`)

Text (Satoshi). Die Zeilenhöhe ist ein **einheitenloses Verhältnis**, damit sie sicher vererbt wird (eine px-Zeilenhöhe würde an alle Kinder vererbt und große Zahlen überlappen lassen):

| Token | Größe / Zeile | Rolle |
|---|---|---|
| `--fs-10` | 10 px / – | **nur** in `@container`-Notstufen sehr enger Zellen (zwei Stellen, siehe 3.2.3) |
| `--fs-11` / `--lh-11` | 11 / 16 px (`calc(16 / 11)`) | Eyebrow (Versal), Abzeichen, Zähler, Diagramm-Achse, Sortierpfeil |
| `--fs-12` / `--lh-12` | 12 / 16 px | Hilfs-, Fuß-, Legenden- und Tooltip-Text; Tabellenkopf; Feld-Label; Chip; Pille; kleine Kennzahl-Beschriftung; Handy-Tabelle |
| `--fs-13` / `--lh-13` | 13 / 18 px | Tabellenzelle, kv-Zeile, Beschreibung; **Kachel-Titel und Wert-Beschriftung**; kleiner Knopf (`.btn.sm`), Segment; **Menüeintrag** (alle Popover inkl. Konto-Menü) |
| `--fs-14` / `--lh-14` | 14 / 20 px | Grundschrift; Knopf, Eingabe, Reiter, **Navigation**; Listen-Titel; Zeilentitel einer Option |
| `--fs-15` / `--lh-15` | 15 / 20 px | Karten-, Block- und Leer-Titel |
| `--fs-18` / `--lh-18` | 18 / 24 px | h2 (Bereich, Dialog, Seitenpanel, Einstellungs-Bereich, Einrichtungs-Ansichten); h1 am Handy; Ruhepunkt-Bühnentitel am Handy |
| `--fs-21` / `--lh-21` | 21 / 28 px | h1 (Titelzeile); Ruhepunkt-Bühnentitel (`.rp-q`, `.rp-title`) |

Werte (Onest 700, Zeilenhöhe `--lh-val: 1.1`):

| Token | Größe | Rolle | Laufweite |
|---|---|---|---|
| `--fv-14` | 14 px | Wert in Leiste/Liste (Tagesleiste, Widget-Konten, Pro Firma) | 0 |
| `--fv-16` | 16 px | Widget-Kleinwert (Schatten-Ich-Widget, Zustand-Spalten), Schieberegler, News-Countdown | 0 |
| `--fv-20` | 20 px | Kachelwert in schmalen Containern, bis 960 px und am Handy | `--ls-val` |
| `--fv-24` | 24 px | **Kachelwert** (Dashboard, Statistik, Prop, Coach, TradeLog, Schatten-Ich), Prop-Saldo, Trade-Detail-Kopf | `--ls-val` (−0.02em) |
| `--fv-32` | 32 px | Hervorhebung (`.score-big`, Tilt-Werte, Sprach-Timer, Replay) | `--ls-val` |
| `--fv-44` | 44 px | Hero (`.big-stat`, Serie, Replay-Widget) | `--ls-hero` (−0.03em) |

Beträge in dichten Bauteilen (Kalender, Tabellen, Pillen, Balkenbeschriftung, kv-Zeilen) nutzen die Text-Skala (11–14 px). Sie behalten ihr Gewicht.

Nicht mehr erlaubt (außer in den Ausnahmen 1.11): 9.5, 10.5, 11.5, 12.5, 13.5, 14.5, 17, 19, 22, 25, 26, 28, 30, 34, 40, 42, 46, 48, 56 px.

### 1.5 Rollen (verbindlich)

| Rolle | Token, Gewicht, Farbe, Schreibung | vorher → nachher (Beispiele) |
|---|---|---|
| Seitentitel h1 | 21/600, Handy 18/600 | Handy 17 → 18 |
| Bereichs- und Dialog-Titel h2 | 18/600 | „Profil“ 24/700 → 18/600 (unter „Einstellungen“ 21/600) · Dialogtitel 19 → 18 · Coach-/Mentor-Einrichtung 20 → 18 · `.ce-title` 17 → 18 |
| Ruhepunkt-Bühnentitel | 21/600 (Handy 18/600), **h2**, nur `.rp-q` und `.rp-title` | „Wo stehst du gerade?“ h1 26/700 → h2 21/600 · „Deine Regeln für heute.“ 24/700 → 21/600 |
| Karten- und Block-Titel | 15/600 | „Daten und Sicherung“ 14/700 → 15/600 · `.rp-callout h3` 18/700 → 15/600 · `.fw-empty b` 16 → 15 · „Vor dem Trading“ (`.rp-name`) 16/700 → 15/600 · `.empty b` 15/700 → 15/600 · Schatten-Ich-Intro 15/700 → 15/600 |
| Listen-Titel | 14/600 | Notizliste „Willkommen im Journal“ 13.5/700 → 14/600 · Widget-Konto „Topstep 50K“ 13.5/700 → 14/600 · Prop-Gruppe „Copy NQ“ 15/700 → 15/600 (Karten-Titel) |
| Zeilentitel einer Option (Einstellungen, Coach-Benachrichtigungen) | 14/500, Farbe geerbt (damit `b.neg` „Alles löschen“ rot bleibt) | „Sicherung exportieren“ 14/700 → 14/500 · Checkbox-Titel 13/700 → 14/500 |
| Optionskarte (Design) | Vorschaukarten 13/600, Sprachkarte 14/600, Kartentext 12/400 `--muted` | Theme/Design 12.5/600 → 13/600 · Schrift/Farbpaar 13/700 → 13/600 · Sprache 16/700 → 14/600 · Schriftkarte `small` 11.5 → 12 |
| Abschnitts-Eyebrow | 11/600, Versal, +0.06em, `font-feature-settings: 'case'`, `--muted`, eine Sammelregel | „ÜBERSICHT“ 11/700/.09em → 11/600/.06em · Widget-Bibliothek 11.5/700 → 11/600 · Notebook „ORDNER“ 11/700 → 11/600 |
| Kachel-Titel und Wert-Beschriftung | 13/500 `--text-2`, normale Schreibung. Neue Klasse `.val-label` für Beschriftungen über großen Werten | „NETTO-P&L“ (Tagesansicht), „BALANCE“, „P&L“ (Prop-Karte), „ENTGANGEN“ (Verpasste Trades), „HEUTE / TRADES / WIN-RATE“ (Session beenden) 11/600 Versal → 13/500 normal · „Heutiger Score“ (Inline-Stil 13/600) → `.val-label` · Kachel-Titel 13.5/500 → 13/500 · `.stat-tile .k` 13/400 → 13/500 |
| Kleine Kennzahl-Beschriftung (dichte Raster) | 12/400 `--muted` | Tagesleiste und Setup-Karten 11 → 12 · Notebook-Statistik 11 → 12 · Schatten-Ich-Widget 11.5 → 12 |
| Steuerelement normal / klein | 14/500 bzw. 13/500 | `.btn` 13.5 → 14 · `.btn.sm` 12.5 → 13 · Prop-Reiter 13.5/600 → 14/500 · Einstellungs-Reiter 14/600 → 14/500 |
| Navigation | 14/500 | Seitenleiste 14.5 → 14 |
| Menüeintrag | 13 (alle Popover gleich) | Konto-Menü 13.5 → 13 |
| Tabellenkopf | 12/500 `--muted`, Satoshi | `th.r` Onest → Satoshi |
| Tabellenzelle | 13/400; Zeilenkennung (Symbol, Name, Setup, Creator) 600; Zahlenzellen Onest | „Range-Fade“ 13/700 Onest → 13/600 Satoshi · `.tbl .sym` 700 → 600 · `.aff-name` 700 → 600 |
| Etikett (Pille, Abzeichen, Zähler) | Pille 12/600, Abzeichen 11/600, Zähler 11/600 | `.pill` 11.5 → 12 · `.badge` 10.5 → 11 · `.btn .cntb` 11/700 → 11/600 · `.pf-n` 11.5/700 → 11/600 |
| Listenwert | Onest 600 mit tabellarischen Ziffern, Zusatz gedämpft 400 | `.kv b` (bleibt 600) · „Kosten je Fehler“ ganz 12.5/700 Satoshi → Betrag Onest 600 + „· 2× · 0 % Win-Rate“ 400 `--muted` |
| Hauptknopf | 700 | `.btn.primary` 600 → 700 · „Trade loggen“ → 700 · Ruhepunkt „Weiter/Starten“ (`.rp-primary`) 700 |
| Notiz-Titel | 32/600 Satoshi, −0.02em, Zeilenhöhe 1.2; bis 960 px 26, bis 560 px 24 (bleiben) | 34/700 → 32/600 |
| Editor-Überschriften | Größen aus Einstellungen → Notebook (unverändert), Zeilenhöhe 1.25 | h2 24 px mit Zeile 39.6 px → 30 px |

### 1.6 Zeilenhöhen

1. `body`: `font-size: var(--fs-14); line-height: var(--lh-14);` (14/20 px, als Verhältnis vererbt).
2. Jede Regel, deren Größe auf ein `--fs-N`-Token umgestellt wird, setzt zusätzlich `line-height: var(--lh-N)`.
3. Ausnahmen: Eine vorhandene Zeilenhöhe **≥ 1.5** (Fließtext: Notiz, Chat, Ruhepunkt-Anleitung, Mentor-Notiz, Textarea, Gauge-Pillen) und **≤ 1.25** (Werte, Abzeichen, Ein-Zeilen-Elemente mit fester Höhe) bleibt. Zeilenhöhen zwischen 1.26 und 1.49 werden durch das Token ersetzt.
4. Werte (`--fv-*`) bekommen `line-height: var(--lh-val)` (1.1). Vorhandene 1 oder 1.05 bleiben.
5. SVG-Text (`.chart text`, `.wpv text`) bekommt keine Zeilenhöhe.
6. Zeilenhöhe niemals als px-Wert an Container (`body`, `.tbl`, `.kv`, `.rp`) setzen.

### 1.7 Laufweite und Versalien

- Versal-Beschriftungen nur noch als Eyebrow (1.5): +0.06em, `'case'`. Ausnahmen mit eigener Laufweite: Serie-Stufenwort `.dstreak-steps b` (siehe 3.2.6), Grabstein, Zertifikat, Ruhepunkt-Atemsegmente `.rp-breath .rp-seg`.
- Werte ab 20 px −0.02em, Hero 44 px −0.03em, Werte bis 16 px und Text 0. Überschriften behalten −0.01em aus `h1, h2, h3, h4` (Z. 90).
- Kopier-Tickets: Coupon-Code +0.12em (bleibt); Link im Ticket 0.

### 1.8 Ziffern

- `tabular-nums` für alle Tabellenzellen (bleibt, Z. 94) und zusätzlich für rechtsbündige Listenwerte und laufende Zahlen: `.kv b`, `.bar-row .bl b`, `.chart text`, `.pfm-top span`, `.fw-acc-v`, `.pg-info`, `.day-card .stats .v`, `.nw-next-when b`, `.nw-time`, `.nw-v b`, `.nb-toolbar .sz`.
- Große Einzelwerte (`.tile .val`, `.stat-tile .v`, `.big-stat`) bleiben proportional (Begründung Z. 93).

### 1.9 Zahlen- und Datumsformate

| Regel | vorher → nachher |
|---|---|
| Geldbeträge **immer mit zwei Nachkommastellen**. `compact` (0 Stellen) nur bewusst und dann für **beide** Werte eines Paares. Kalender-, Achsen- und Kurzformen (`curCompact`, `curShort`, `axisCur`, Kalender `compact: ≥ 1000`) bleiben. | „11.162 $ von 3.000,00 $“ → „11.162,00 $ von 3.000,00 $“ · „+11.262 €“ neben „+1.053,85 €“ → „+11.262,00 €“ neben „+1.053,85 €“ |
| Profit-Faktor immer mit zwei Stellen, ∞ bleibt. | „0“ / „0,08“ / „1,83“ in einer Spalte → „0,00“ / „0,08“ / „1,83“ |
| Win-Rate: Kacheln **eine** Nachkommastelle, Tabellen und Fußzeilen keine. | Kachel „Win-Rate mit / ohne Fehler“ „50 % / 25 %“ → „50,0 % / 25,0 %“ |
| Streuungsmaße mit zwei Stellen. | „Standardfehler 0,501 R“ → „0,50 R“ |
| Datum in Trade-Listen (TradeLog Eröffnet/Geschlossen, Verpasste Trades, Letzte Trades): im laufenden Jahr ohne Jahr, sonst zweistellig. Detail, Tooltips und Fußzeilen behalten das volle Datum. | „08.10.2026 19:43“ → „08.10. 19:43“ · Vorjahr „29.12.25“ |
| Tagestabelle (Statistik → Tage): kurzer Wochentag + Tag/Monat, Jahr nur über eine Jahresgrenze. | „Donnerstag, 8. Oktober 2026“ → „Do., 08.10.“ (Englisch „Thu, 10/08“) |
| Spanne: Einheit nur einmal, geschütztes Leerzeichen vor der Einheit, Kachelgröße. | „−1,06 R bis +1,39 R“ (20 px, Inline-Stil) → „−1,06 bis +1,39 R“ (24 px) |
| Drawdown-Prozent in der Fußzeile, nicht neben dem Wert. | „−1.053,56 €“ + umbrechendes „−4,2 %“ → Wert „−1.053,56 €“, Fuß „−4,2 % · 01.10.2026“ |
| Keine Abkürzungen, die sonst nirgends stehen. | „· 2× · WR 0 %“ → „· 2× · 0 % Win-Rate“ |

### 1.10 Satzregeln

- Beschreibungstexte in den Einstellungen höchstens **68ch** breit (bei 12 px ≈ 450 px).
- Wortlisten mit „·“: Umbruch nur **vor** dem Trennpunkt, nie danach („Ängstlich · Frustriert“ / „· Fokussiert“).
- Ein-Zeilen-Werte, die am Handy umbrechen dürfen, brechen zwischen den Teilen um, nicht zwischen Zahl und Einheit („−1,06 bis“ / „+1,39 R“).
- Lange Kopier-Links ohne Sperrung, damit der Ref-Code sichtbar bleibt.

### 1.11 Ausnahmen (bleiben unverändert)

1. Zertifikat (`.cert*`, Größen über `calc(var(--s) * …)`) – nur die Marke 800 → 900.
2. Grabstein im Friedhof (`.pg-*`, `.prop-grave-*`, app.css ca. Z. 2780–2830) – nur die Trennpunkt-Korrektur (bereich_prop-49) und Onest für die Betrags-Spans (`.pg-facts dd > .pos/.neg/.neu`).
3. Editor-Inhalt (`.ql-editor`, `.nb-preview`, Größen aus Einstellungen → Notebook), außer der Zeilenhöhe der Überschriften.
4. Ruhepunkt-Vers `.rp-verse` (21/500, wird nur auf das Token `--fs-21` umgestellt).
5. Schriftprobe `.font-card .sample` (30 px), Avatar-Initiale `.avatar-big` (26 px), Emoji-Raster `.nb-menu .grid-em button` (20 px).
6. Notiz-Titel-Stufen 26 px (bis 960) und 24 px (bis 560), Z. 1069 und 3012.
7. Kalender-Tages-P&L Onest 800 (README Z. 191).

### 1.12 Erkannt, aber ohne Befund (nicht anfassen, Kandidaten für die Lückenrunde)

`.prop-h3` 14/700, `.sp-item .btn` 600, `.btn.fw-reset` 600, `.rp-switch` 600, `.cpick` 600, `.sym-btn` 600, `.dir-opt` 700, `.rr-week span`/`.dp-week span` 11/700, `.sb-av`/`.avatar` 700, `.prop-bar .bl b` 700 (Listenwert-Rolle), Inline-Größen `notebook.js:67` (h2 20 px) und `:123` (h2 22 px), ungestaltete Notebook-`h3` (18.72 px). Diese Stellen widersprechen der Regel in 1.3/1.4, sind aber durch keinen Befund dieser Gruppe belegt.

---

## 2. Konflikte und Entscheidungen

| # | Befunde | Widerspruch | Entscheidung und Grund |
|---|---|---|---|
| K1 | typografie-3 ↔ typografie-31 | Mapping setzt Konto-Menü 13.5 → 14 und weist „Menü“ der 14er-Stufe zu. Laut Prüfer von typografie-31 sind die Menüs 13 px, und 14 px kann feste Popover-Breiten sprengen (Filter 320 px, README Z. 77). | **Menüs 13, Navigation 14.** `.sb-menu .item` verliert die eigene Größe und erbt 13 von `.popover .item`, `.sb-menu-row` → 13. |
| K2 | typografie-3 ↔ referenz-32 | Mapping: `.set-head h2` → 18. Prüfer von referenz-32: 19, wie die Dialogtitel. | **18/600.** typografie-3 setzt auch die Dialog- und Panel-Titel 19 → 18. Das Argument „keine weitere Stufe“ gilt damit für 18. |
| K3 | typografie-3 ↔ bereich_training-46 | Mapping: `.rp-q` bleibt als Ausnahme 26 px, `.rp-title` → 18. training-46 will beide 22/600. | **Beide 21/600 (Handy 18/600), `.rp-q` als h2.** Dieselbe Rolle bekommt eine Größe. Eine 26/700-Ausnahme verletzt „Titel 600“ und ließe das zweite h1 bestehen. 22 wäre eine neue Stufe. 21 ist die h1-Stufe, damit steht der Bühnentitel nicht größer als der Seitentitel (dasselbe Prinzip wie K2). Der Vers (21/500) bleibt eigene Ausnahme. |
| K4 | typografie-3 ↔ bereich_training-46 | `.rp-callout h3` 16 (training) gegen 15 (Mapping), `.rp-sub` 14.5/600 (training) gegen 15. | **15/600** für beide (Karten-Titel-Rolle). 14.5 gibt es nicht mehr. |
| K5 | typografie-3 ↔ bereich_einstellungen-28 | Sprachkarte `.lang-card b` 16 → 15 (Mapping) gegen → 14/600. | **14/600.** Der Befund zu Optionskarten ist spezifischer. Die Sprachkarte ist eine Optionskarte und kein Kartentitel. |
| K6 | referenz-43 ↔ bereich_dashboard-44 ↔ bereich_trades_tag-39 ↔ typografie-17 | referenz-43: Wert-Beschriftungen werden `.val-label` (13/500, normale Schreibung). dashboard-44 und trades_tag-39 (Prüfer): `.caption` über `.score-big` sei das App-Muster, nur Z. 287 ist der Ausreißer. typografie-17: Z. 287 → `.val-label`. | **`.val-label` an allen Stellen gleichzeitig** (day.js:14, prop.js:102, trades.js:59, app.js:530, widgets.js:287). Damit ist das Bedenken „nur hier ersetzt schafft Ungleichheit“ ausgeräumt. In der Tagesansicht stehen dann „Netto-P&L“ und „Trades / Brutto-P&L“ in derselben Schreibung. **Ausnahme „Dein Score“ (widgets.js:227): Nutzer fragen** (6.1), weil das Widget auf Wunsch des Nutzers „wie am Anfang“ wiederhergestellt wurde. |
| K7 | typografie-20, bereich_konto-33 ↔ referenz-35, bereich_einstellungen-28 | `.set-row b`, `.coach-nrow b` → 600 gegen Zeilentitel → 14/500. | **14/500 (ohne Farbe).** Zeilentitel beschriften ein Steuerelement (Schalter, Checkbox, Knöpfe), dafür gilt 500. Die Hierarchie wird klarer: Block-Titel 15/600 > Zeilentitel 14/500 > Beschreibung 12/400. Bei 600 läge der Zeilentitel nur 1 px unter dem Block-Titel. Die Farbe bleibt weg, damit `b.neg` („Alles löschen“) rot bleibt (Spezifität 0,3,1 schlägt `.neg`). |
| K8 | typografie-1 ↔ typografie-19 / BRIEF | typografie-1: `.btn.accent` bleibt 600, nur `.btn.tl` 700. `.btn.accent` ist aber auch der **aktive** Filter-Knopf (dashboard.js:124). | **`.btn.accent` 500, `.btn.accent.tl` 700.** Mit echtem 600 stünde der aktive Filter fetter als der inaktive (500), und das hat der Nutzer abgelehnt. |
| K9 | typografie-3 ↔ bereich_einstellungen-29 | Rollentabelle in typografie-3: „Chip und Pille 500“. einstellungen-29 nimmt `.pill` 600 als Referenz für die Farbpaar-Beträge. | **Etiketten (Pille, Abzeichen, Zähler) 600, Chips 500.** Etiketten sind kleine Beschriftungen auf getönter Fläche und keine Steuerelemente. 600 hält sie bei 11–12 px lesbar. Chips sind wählbar und gelten als Steuerelemente. |
| K10 | typografie-3 (Mapping) ↔ Prüfer typografie-3 ↔ responsiv-33 | Mapping hebt alle 10/10.5 auf 11. Prüfer: Container-Notstufen nicht hochstufen. responsiv-33 hebt die Handy-Kalenderwerte gemessen auf 11. | **Handy (Z. 3042, 940) → 11**, gemessen passt „+2,1k€“ mit 33 px in 40 px. **`@container`-Notstufen (Z. 533 Pille, Z. 2977 `.cal .d .c`) → `--fs-10`.** Das Token ist nur dort erlaubt und macht nichts größer. |
| K11 | typografie-3 (Mapping) | `.stc-col > b` in `@container (max-width: 300px)` 14.5 → 16. Damit liefe die Notstufe ins Leere, die Beträge würden größer als in der Grundregel. | **300 px → `--fv-14`, 272 px → 13 px (`--fs-13`)**, nur verkleinern. |
| K12 | typografie-3 (Mapping) | Handy-Tabelle `.tbl th, .tbl td` (Z. 3056) 12.5 → 13 (als „Steuerelement“ eingeordnet). | **→ 12.** Das ist eine kompakte Tabellenzelle (README: Tabellen am Handy ohne Umbruch). 13 hebt die Verdichtung auf, die Stufe passt zu `.aff-tbl td` (2994) und „Letzte Trades“ (3032). |
| K13 | typografie-3 ↔ bereich_dashboard-44 | `.fw-stats > div > span` 11.5 → 12 (Mapping). Prüfer dashboard-44: nicht anfassen, weil „Disziplin-Kost…“ schon abgeschnitten ist. | **→ 12/400 `--muted`** (kleine Kennzahl-Beschriftung). Abgelehnt war 13/500. Mit 12 wächst die Breite um 0,5 px je 11,5 px. Die Kürzung kommt von vier Spalten mit 16-px-Werten (crop-schatten.png: auch „+893,0…“ ist gekürzt) und gehört zur Gruppe Abstände/Komponenten. In 4.3 als Prüfpunkt. |
| K14 | bereich_notebook_news-15 ↔ typografie-3 | Prüfer bereich_notebook_news-15: Listentitel bleiben 13.5 px. Mapping: 13.5 → 14. | **14/600** für alle Listentitel zusammen (`.nb .note-item b`, `.fw-acc-n b`, `.sp-item b`, `.rp-list .rp-li-main b`, `.pfm-top b`, `.coach-nrow b` als Zeilentitel 14/500). Die Begründung des Prüfers („wie die anderen Listentitel“) bleibt erfüllt. Notiz-Titel 34 → 32/600: liegt über der Editor-H1 (30 px), damit ist der Einwand gegen 28 gewahrt. |
| K15 | typografie-12 ↔ bereich_konto-34 ↔ bereich_einstellungen-30 | konto-34: Abwahl-Klasse `.tbl td.txt`. typografie-12: Zahlenzellen bekommen `num`, Text ist Standard. einstellungen-30 und komponenten-23 (Ergänzung) streichen nur `th.r`. | **typografie-12 (Zahlen markieren statt Text abwählen).** Die Klasse `txt` wird nicht eingeführt, Coach-Sichtbarkeit und Affiliate-Namen werden dadurch automatisch Satoshi. einstellungen-30 ist in typografie-12 enthalten. |
| K16 | typografie-12 ↔ bereich_statistik-18 ↔ bereich_statistik-40 | typografie-12: ausgeschriebenes Datum der Tagestabelle bleibt Satoshi. statistik-18: wird mit statistik-40 numerisch und damit Onest. | **Nach statistik-40 („Do., 08.10.“) bekommt die Zelle `num`** (Ziffern überwiegen). |
| K17 | bereich_statistik-18 | Zeilenname `.tbl td.lbl` 500 (Prüfer) gegen `.tbl .sym` 600 (typografie-20) und `.aff-name` 600 (konto-33). | **Zeilenkennung in Tabellen einheitlich 600** (Symbol, Setup-/Gruppenname, Creator). 700 und Onest fallen weg, wie es der Befund verlangt. |
| K18 | typografie-11 | Vorschlag `.pg-facts dd` ganz in Onest. | **Nur die Betrags-Spans** `.pg-facts dd > .pos/.neg/.neu`. Der Rest ist Text auf dem Grabstein (Ausnahme 1.11). |
| K19 | bereich_training-21 ↔ typografie-17 | training-21: `.dstreak-steps b` → `--muted`, Z. 1266/1267 (Stufenfarben) löschen. typografie-17/Prüfer: Stufenfarben gehören zur dokumentierten Serie (README Z. 129–133), `--muted` schwächt Stufe 1. | **Nur 700 → 600 und .08em → .06em, Farbe `--text-2` und Z. 1266/1267 bleiben.** Das Löschen der Stufenfarben ändert eine Nutzerentscheidung → 6.2. |
| K20 | bereich_statistik-42 | Prüfer lehnt den Win-Rate-Teil ab (Kacheln dürfen nicht auf 0 Stellen), Punkt 4 des Vorschlags (stats.js:51 → eine Stelle) folgt aber genau der Prüfer-Regel. | **Regel „Kacheln eine Stelle, Tabellen/Fuß keine“; stats.js:51 → `fmt.pct(…, 1)`.** Dashboard und Statistik zeigen damit dieselbe Kennzahl gleich. |
| K21 | referenz-28 | Helfer heißt einmal `dateList`, einmal `dateRow`. bereich_dashboard-50 schlägt `dateShort` vor (zeigt fälschlich „26“). | **`fmt.dateRow`.** Gilt auch für die Zelle „Geschlossen“ an einem anderen Tag und für „Verpasste Trades“, damit eine Tabelle keine zwei Datumsformen zeigt. |
| K22 | bereich_statistik-41 | `vorschlag_fakten` enthält `.replace(' R', ' R')` (wirkungslos). | **`.replace(' R', '&nbsp;R')`** für den oberen Wert. |
| K23 | bereich_prop-49 | Der Vorschlag `content: '·'` + `nowrap` ohne Leerzeichen zwischen den Chips lässt keine Umbruchstelle. | **`.join(' ')` + `content: '· '` + `nowrap` auf dem Chip** (Fassung des Prüfers, getestet). |
| K24 | typografie-14 ↔ Ergänzung hierarchie-27 | hierarchie-27: Balance und Limits ganzzahlig, P&L mit Stellen. | **typografie-14:** Das Format hängt am Ort und nicht am Betrag, zwei Stellen überall, `compact` nur bewusst und paarweise. Eine zweite Regel nur für Kontokarten wäre eine neue Sonderform. |
| K25 | referenz-35 | `margin-bottom` des Block-Titels 10 → 12/14, `flex-wrap: nowrap`. | **Abstand bleibt 10 px** (Sache der Gruppe Abstände), `nowrap` entfällt (Handy). Der Knopf bleibt über `flex: 1 1 320px` + 68ch rechts. |
| K26 | bereich_trades_tag-31 | Original: Typo-Dubletten in Z. 1735 streichen. Prüfer: nur die Größe streichen + `.body` an `spark-body`. | **Beides:** Z. 1735 verliert alle Typo-Angaben (erbt `.tile .val`), `spark-body` bekommt `.body`. Dazu `.tile.spark-tile { gap: 2px }` löschen (sonst 5 px höher als die Nachbarn) und `flex-wrap: nowrap` an `.spark-body` (die ≤960-Regel `.tile .body { flex-wrap: wrap }` darf den Verlauf nicht unter den Wert schieben). |
| K27 | typografie-3 | Inline-Größen in JS umgehen die Skala. | widgets.js:273 („Challenge“, `big-stat` mit `font-size:30px`) → Klasse `score-big` (32). stats.js:72 und widgets.js:287 laufen über ihre Befunde. Andere Inline-Größen liegen schon auf der Skala oder stehen in 1.12. |
| K28 | Schnittstellen zu anderen Gruppen | Komponenten (feste Steuerelement-Höhen, Reiter-Systeme), Farbe (`.more-link` grün, `.aff-name:hover` grün, Akzent-Rand an `.btn.accent`, `.pair-card .pv i` #04140a), Abstände (Kachel- und Block-Abstände). | Diese Spezifikation ändert nur Familie, Größe, Gewicht, Zeilenhöhe, Laufweite, Ziffern und Zahlenformate. Feste Höhen aus der Gruppe Komponenten haben Vorrang vor der Höhe aus Zeilenhöhe + Innenabstand. Ohne sie ergeben sich ganzzahlige Höhen (`.btn` und `.input` 42 px statt 41,6 px). |

---

## 3. Umsetzungsschritte

### 3.0 Reihenfolge und Zwischenprüfungen

| Etappe | Inhalt | Nach der Etappe |
|---|---|---|
| E1 | 3.1 Schrift laden, 3.2.1 Tokens, 3.2.4 Gewichte, 3.3, 3.9 | Gewichtsmessung (4.1), Screenshots dashboard, settings_profil, prop (dunkel 1440), `settest2` |
| E2 | 3.2.2 Sammelregeln, 3.2.3 Text-Skala (`--fs-*`) | Atlas dunkel 1440 + 390, `mobiletest`, `tlfittest`, Kopfzeile bei 1024 |
| E3 | 3.2.3 Werte-Skala (`--fv-*`), 3.2.5 Komponenten | Atlas dunkel 1440/1024/390, Kalender bei 1280 und 390 |
| E4 | 3.2.6 Einzelstellen, 3.4–3.8 JS | alle e2e-Läufe (`web/e2e/runall.sh`), `node --test web/tests/*.mjs` |
| E5 | 3.10 README, Abschluss-Zensus | Akzeptanz 4.1–4.5 |

### 3.1 `web/app.html` und `web/index.html`

| Stelle | vorher → nachher | Befund |
|---|---|---|
| app.html:13 und index.html:13 | `https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap` → `https://api.fontshare.com/v2/css?f[]=satoshi@1&display=swap` | typografie-1 |

### 3.2 `web/css/app.css`

#### 3.2.1 Tokens und Grundschrift

| Stelle | Änderung | Befund |
|---|---|---|
| `:root`, direkt nach `--font-num` (Z. 41) | einfügen:<br>`--fs-10: 10px; /* nur @container-Notstufen */`<br>`--fs-11: 11px; --lh-11: calc(16 / 11);`<br>`--fs-12: 12px; --lh-12: calc(16 / 12);`<br>`--fs-13: 13px; --lh-13: calc(18 / 13);`<br>`--fs-14: 14px; --lh-14: calc(20 / 14);`<br>`--fs-15: 15px; --lh-15: calc(20 / 15);`<br>`--fs-18: 18px; --lh-18: calc(24 / 18);`<br>`--fs-21: 21px; --lh-21: calc(28 / 21);`<br>`--fv-14: 14px; --fv-16: 16px; --fv-20: 20px; --fv-24: 24px; --fv-32: 32px; --fv-44: 44px;`<br>`--lh-val: 1.1; --ls-val: -0.02em; --ls-hero: -0.03em;` | typografie-3 |
| `body` (Z. 84–85) | `font-size: 14px; line-height: 1.45;` → `font-size: var(--fs-14); line-height: var(--lh-14);` | typografie-3 |

#### 3.2.2 Sammelregeln

| Stelle | vorher → nachher | Befund |
|---|---|---|
| Z. 101, `.small` | `.small { font-size: 12px; }` → `.small { font-size: var(--fs-12); line-height: var(--lh-12); }` | typografie-3 |
| Z. 101, `.caption` → **Eyebrow-Sammelregel** | `.caption { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; }` → `.caption, .nav-title, .popover .sec, .cp-sec, .sym-cap, .nb .sec-h, .nb-menu .head, .sp-group { font-size: var(--fs-11); line-height: var(--lh-11); font-weight: 600; letter-spacing: .06em; text-transform: uppercase; font-feature-settings: 'case'; color: var(--muted); }` | typografie-17, bereich_shell-22, bereich_notebook_news-15 |
| Einzelregeln der Eyebrows | aus `.nav-title` (Z. 167), `.popover .sec` (341), `.cp-sec` (456), `.sym-cap` (880), `.nb .sec-h` (975), `.nb-menu .head` (1117), `.sp-group` (1605) jeweils `font-size`, `font-weight`, `letter-spacing`, `text-transform` und `color` **entfernen**. Innenabstand, Rand, `display`, `cursor` usw. bleiben. `html.sb-mini .nav-title` (168) bleibt. | typografie-17, bereich_shell-22 |
| nach Z. 101 neu: Wert-Beschriftung | `.val-label { font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 500; color: var(--text-2); }` | referenz-43, bereich_dashboard-44 |
| Z. 770–774 und der `.journal`-Teil in Z. 788 | löschen (toter Code, kein `class="journal"` in `js/`) | typografie-17 |
| Z. 94, nach `.tbl td { font-variant-numeric: tabular-nums; }` | neu: `.kv b, .bar-row .bl b, .chart text, .pfm-top span, .fw-acc-v, .pg-info, .day-card .stats .v, .nw-next-when b, .nw-time, .nw-v b, .nb-toolbar .sz { font-variant-numeric: tabular-nums; }` | typografie-21, bereich_notebook_news-48, bereich_notebook_news-14 |
| Z. 1800 **Onest-Sammelregel** | Selektorliste ersetzen durch: `.num, .tbl td.r, .tbl td.c, .tile .val, .kv b, .cal .p, .cal .d .n, .cal .w .p, .cal .d .pm, .cal .w .pm, .stat .v, .big-stat, .score-big, .streak-ring, .yc b, .yc small, .tracker-foot .score-n, .slider .sv, .chart text, .tile .head .n, .tile .gauge-stack .pill, .pills.col .pill, .pg-info, .strat-stats .v, .day-card .pnl, .day-card .stats .v, .detail-head .big, .tilt-stats .v, .ym-head span, .score-scale .lbls, .ticks, .stats-grid .v, .stat-tile .v, .prop-balance .val, .prop-bar .bl b, .fw-stats b, .fw-acc-v, .stc-col > b, .wl-single .lbl, .pfm-top span, .pg-facts dd > .pos, .pg-facts dd > .neg, .pg-facts dd > .neu, .fw-big, .rh-big, .streak .big, .bar-row .bl b { font-family: var(--font-num); }`<br>Entfernt: `.tbl td`, `.tile.spark-tile .val` (deckt `.tile .val` ab), `.pill`, `.tbl th.r`. | typografie-11, typografie-12, bereich_einstellungen-30, bereich_konto-34, responsiv-33, bereich_statistik-17 |
| direkt nach Z. 1800 neu | `.tbl td.lbl { font-weight: 600; }` | bereich_statistik-18 |
| `font-family: var(--font-display)` in Wert-Regeln | **Pflicht** löschen in `.prop-balance .val` (2700) und `.rh-big` (2460), sonst schlagen sie die Onest-Regel. Zur Klarheit auch löschen in `.tile .val` (540), `.score-big` (577), `.day-card .head .pnl` (908), `.big-stat` (1203), `.fw-big` (1464), `.fw-stats b` (1456), `.tile.spark-tile .val` (1735). | typografie-11 |

#### 3.2.3 Skala-Zuordnung (Größe)

Schreibweise: Text `font-size: <alt>` → `font-size: var(--fs-N); line-height: var(--lh-N);` (Ausnahmen der Zeilenhöhe nach 1.6). Werte `font-size: <alt>` → `font-size: var(--fv-N); line-height: var(--lh-val);` und bei 20–32 px `letter-spacing: var(--ls-val)`, bei 44 px `var(--ls-hero)`.
**Regeln, deren Größe schon auf der Skala liegt (11/12/13/14/15/18/21 bzw. 14/16/20/24/32/44), bekommen ebenfalls das Token.** Sichtbar ändert sich dort nur die Zeilenhöhe. Alles unten gehört zu typografie-3, sofern keine andere id steht.

**→ `--fs-10` (nur in `@container`)**
- Z. 533 `.tile.side .gauge-stack .pill` 10.5 → 10 (K10)
- Z. 2977 `.cal .d .c` 10 → Token (K10)

**→ `--fs-11`**
- 9.5 → 11: Z. 3042 `.cal .d .pm` (Handy), zusätzlich `letter-spacing: -.03em` → `-.01em`, Rest der Regel bleibt (responsiv-33)
- 10 → 11: Z. 596 `.tbl th .dir`, Z. 699 `.ring .n small`, Z. 1793 `.cal .w .t` (≤ 960), Z. 3105 `.nw-v small`; Z. 940 `.cal .d .n` (≤ 960) zusätzlich `width: 18px; height: 18px` → `width: 20px; height: 20px` (`top`/`right` 3px bleiben, Heute-Kreis Z. 709 bleibt intakt) (responsiv-33)
- 10.5 → 11: Z. 618 `.badge`, Z. 718 `.cal .d .c .wr`, Z. 941 `.cal .p, .cal .d .p` (≤ 960), Z. 2284 `.rp-seq-i small` (bereich_training-46), Z. 2632 `.prop-presets td .sub .pill`, Z. 2920 `.mr-head .pill`
- 11.5 → 11: Z. 1605 `.sp-group` (über die Sammelregel), Z. 2292 `.rp-breath .rp-seg` (dazu 700 → 600, Laufweite .1em bleibt) (bereich_training-46), Z. 2608 `.pf-n` (dazu 700 → 600), Z. 1648 `.chart text` (keine Zeilenhöhe, SVG)
- schon 11 → Token: alle übrigen 11-px-Regeln (z. B. 186, 358, 419, 539, 576, 683, 722, 726, 728, 816, 981, 1022, 1341, 1382, 1421, 1643, 1688, 2354, 2993, 3030, 3085, 3087, 3100)

**→ `--fs-12`**
- 11 → 12: Z. 910 `.day-card .stats .k`, Z. 793 `.strat-stats .k` (bereich_trades_tag-39); Z. 1035 `.nb .stats-grid .k` (gleiche Rolle); Z. 2234 `.rp-scale-ends` (bereich_training-46)
- 11.5 → 12: Z. 299 `.field .hint`, 545 `.pill`, 708 `.cal .d .n`, 724 `.cal .w .t`, 1002 `.nb .note-item .d`, 1030 `.nb .save-state`, 1078 `.ed-pop .ed-hint` (Zeilenhöhe 1.4 → Token), 1175 `.nb-figure .fig-bar button` (dazu 700 → 500, bereich_notebook_news-15), 1360 `.fd-pop .fd-l`, 1455 `.fw-stats > div > span` (K13), 1585 `.seg.mini button`, 1932 `.font-card small` (bereich_einstellungen-28), 2289 `.rp-tempo`, 2290 `.rp-chip.rp-chip-sm`, 2467 `.rh-rounds-l`, 2579 `.voice-sug .k`, 2634 `.prop-acc-tbl td .sub, .prop-presets td .sub`, 2723 `.prop-rule-f .field span`, 2724 `.prop-rule .hint`, 2966 `.stc-l small`, 3078 `.nw-next-when small`
- Z. 553 `.wl-single .lbl`: nur `font-size: 11.5px;` löschen (wird von Z. 556 überschrieben), `white-space: nowrap` bleibt. Z. 556 (12/700) → Token.
- 12.5 → 12 (Hilfstext, Label, kompakt): 503 `.card-sub`, 656 `.bar-row .bl`, 703 `.cal .wd`, 821 `.zone`, 883 `.sym-opt .nm`, 1183 `.nb-figure .cap`, 1294 `.heat-legend`, 1338 `.page-head .ph-note`, 1365 `.fd-pop .fd-pair .input, .fd-pop .fd-pair .fd-unit` (wie die 12-px-Bedienelemente im Filter, Z. 1362–1364), 1381 `.fd-l` (Zeilenhöhe 1.3 → Token), 1461 `.fw-rounds-empty`, 1463 `.fw-lbl`, 1468 `.fw-facts`, 1685 `.ycal-head span`, 1762 `.ym-head`, 1947 `.pair-card .pv i` (dazu 700 → 600 und `font-family: var(--font-num)`, bereich_einstellungen-29), 2190 `.rp-where`, 2210 `.rp-small`, 2258 `.rp-verse-ref`, 2288 `.rp-next`, 2295 `.rp-meta`, 2306 `.rp-content:has(.rp-breath) > .rp-guide`, 2406 `.sr-desc` (Zeilenhöhe 1.35 → Token), 2414 `.sr-num .sr-suf`, 2461 `.rh-sub`, 2493 `.rc-count`, 2613 `.prop-accsel > span`, 2622 `.pf-sub`, 2657 `.cpn-link`, 2668 `.aff-label`, 2705 `.prop-bar .bl`, 2873 `.ce-date`, 2886 `.mentor-note .mn-head`, 2919 `.mr-head b`, 2965 `.stc-l`, 2976 `.cal .d .pm` (`@container` ≤ 77 px), 3044 `.cal .w .pm` (Handy), **3056 `.tbl th, .tbl td` (Handy) → 12** (K12)
- schon 12 → Token: übrige 12-px-Regeln (z. B. 143, 244, 281, 298, 518, 541, 593, 611, 623, 650, 691, 693, 730, 896, 1003, 1362–1364, 1465, 1479, 1490 span, 1663, 1664, 1674, 1885, 1923, 1964, 2317, 2470, 2489, 2642, 2656, 2670, 2906, 2918, 2994, 3029, 3032, 3081)

**→ `--fs-13`**
- 12.5 → 13 (Steuerelemente): 236 `.sb-av`, 280 `.btn.sm`, 322 `.seg.pill button`, 581 `.swatch`, 930 `.topbar .actions .btn`, 1009 `.nb .sel-row`, 1038 `.nb .tags-row .tag-add`, 1057 `.nb .tags-row input`, 1124 `.nb-ytpop`, 1367 `.fd-pop .fd-foot .btn`, 1386 `.fd-seg button`, 1388 `.fd-tog button`, 1400 `.fd-chip`, 1407 `.fd-add`, 1497 `.fw-chips button`, 1508 `.tabs.sm button`, 1574 `.w-bar`, 1633 `.tpl-menu .item`, 1653 `.select.sm`, 1678 `.tracker-foot > .btn`, 1711 `.rep-foot .btn.primary`, 1965 `.cert-opts .seg.sm button`, 2308 `.rp-more summary`, 2543 `.seg.segc button`, 2610 `.select.sm.prop-fsel`, 2753 `.prop-tabs a` (schmal), 2864 `.coach-invite .input`, 3106 `.nw-v b`
- 12.5 → 13 (Optionskarten): 1825 `.design-card b`, 1837 `.theme-card b` (bereich_einstellungen-28)
- 13.5 → 13: 517 `.tile .head` (bereich_dashboard-44, typografie-3), 1816 `.set-head p`, 254 `.sb-menu-row` (typografie-31); Z. 250 `.sb-menu .item`: `font-size: 13.5px;` **löschen** (erbt 13 von `.popover .item`, Z. 334) (typografie-31, K1)
- 15 → 13: Z. 1085 `.nb-toolbar .tb.turn .lbl` → `font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 500;`; Z. 1086 `.nb-toolbar .tb .lbl` löschen; Z. 1093 `.nb-toolbar .sz`: `font-size: 15px; font-weight: 700;` → `font-family: var(--font-num); font-size: var(--fs-13); font-weight: 500;` (bereich_notebook_news-14)
- `@container (max-width: 272px)` Z. 2971 `.stc-col > b` 13.5 → 13 (K11)
- schon 13 → Token: übrige 13-px-Regeln (z. B. 264, 302, 318, 324, 334, 360, 376, 420, 434, 479, 592, 637, 647, 651, 662, 720, 749, 765, 800, 893, 894, 898, 994, 1023, 1029, 1118, 1268, 1280, 1284, 1355, 1396, 1397, 1415, 1451, 1651, 1659, 1687, 1704, 1710, 1744, 1881, 1897, 1931, 1948, 1951, 2147, 2188, 2244, 2428, 2429, 2459, 2471, 2484, 2509, 2648, 2721, 2728, 2887, 2905, 2923, 3054, 3064, 3084, 3091, 3108)

**→ `--fs-14`**
- 13.5 → 14: Z. 267–270 `.btn`, 289–291 `.input, .select, textarea.input` (Zeilenhöhe von `textarea.input` 1.5 bleibt), 429 `.dp-month`, 450 `.cp-hex`, 660 `.tabs button`, 845 `.inp-cur .cur-sym`, 862 `.dir-opt`, 881 `.sym-opt`, 978 `.nb .folder`, 1001 `.nb .note-item b`, 1478 `.fw-acc-n b`, 1586 `.add-slot`, 1611 `.sp-item b`, 1720 `.rep-it`, 2203 `.rp-guide` (1.7 bleibt), 2214 `.rp-btn`, 2224 `.rp-l`, 2261 `dl.rp-summary dt`, 2294 `.rp-breath .rp-hint`, 2328 `.rp-list .rp-li-main b`, 2359 `.mentor-err`, 2412 `.sr-num .input`, 2590 `.prop-tabs a`, 2595 `.prop-sub a`, 2640 `.pfm-top b`, 2763 `.prop-patterns, .prop-highlights` (1.45 → Token), 2921 `.mr-text` (1.5 bleibt), 2949 `.coach-nrow b`, 2953 `.coach-co-what`, 3088 `.nw-row`
- 14.5 → 14: Z. 169–172 `.nav a, .nav button` (typografie-31), 786 `.note-body` (1.65 bleibt), 2141 `.rp` (1.55 bleibt), 2198 `.rp-open > .rp-guide`, 2206 `ol.rp-visual` (1.6 bleibt), 2227 `.rp-sl-head .rp-l`, 2236 `.rp input…, .rp textarea`, 2249 `.rp-ampel strong`, 2266 `.rp-checks label`, 2349 `.msg` (1.55 bleibt), 2875 `.ce-body.ql-container`
- 16 → 14: Z. 1922 `.lang-card b` → `font-size: var(--fs-14); font-weight: 600;` (bereich_einstellungen-28, K5)
- schon 14 → Token: übrige 14-px-Regeln (z. B. 243, 1015, 1273, 1490 b, 1629, 1715, 1807, 1867, 1879, 1930, 2247, 2320, 2405, 2480, 2517, 2572, 2888, 2927)

**→ `--fs-15`**
- 14.5 → 15/600: Z. 356 `.rr-m-title`, 409 `.dp-title`, 473 `.dp-tval`, 1348 `.fd-pop .sp-head h2`
- 16 → 15/600: Z. 1450 `.fw-empty b`, Z. 2187 `.rp-choice .rp-name` (700 → 600, bereich_training-46)
- 18 → 15/600: Z. 2253 `.rp-callout h3` (700 → 600, K4), Z. 2477 `.rh-empty .card-title`
- 14 → 15/600: Z. 1818 `.set-block h3` → `.set-block h3 { font-size: var(--fs-15); line-height: var(--lh-15); font-weight: 600; margin-bottom: 10px; }` (referenz-35)
- schon 15 → Token: 491 `.card-title`, 677 `.empty b` (dazu 600), 890, 907, 1374, 1502, 2209 `.rp-sub` (700 → 600), 2395 `.shadow-intro b` (dazu 600), 2530, 2537, 2576, 2607, 2621, 2647, 2692 (dazu 600), 2715 (dazu 600), 3075

**→ `--fs-18`**
- 17 → 18: Z. 925 `.topbar h1` (Handy), Z. 2874 `.ce-title`
- 19 → 18: Z. 831 `.modal-head h2`, Z. 1602 `.side-panel .sp-head h2`, Z. 2293 `.rp-breath .rp-phase` (700 → 600, bereich_training-46)
- 20 → 18: Z. 2342 `.mentor-setup h2`, Z. 2852 `.coach-title`, Z. 2894 `.coach-join-head h2`
- 24 → 18: Z. 1815 `.set-head h2 { font-size: 24px; font-weight: 700; letter-spacing: -0.01em; }` → `{ font-size: var(--fs-18); line-height: var(--lh-18); font-weight: 600; letter-spacing: -0.01em; }` (referenz-32, K2)
- Handy Z. 2334: `.rp-q { font-size: 22px; }` → `var(--fs-18)`, `.rp-title { font-size: 21px; }` → `var(--fs-18)` (K3)
- schon 18 → Token: 1130 `.ql-editor.ql-blank::before`, 2331 `.rp-x` (lh 1 bleibt)

**→ `--fs-21`**
- Z. 2153 `.rp-q`: `font-weight: 700; font-size: 26px; line-height: 1.2` → `font-weight: 600; font-size: var(--fs-21); line-height: var(--lh-21)` (bereich_training-46, K3)
- Z. 2194 `.rp-title`: `font-weight: 700; font-size: 24px; line-height: 1.25` → `font-weight: 600; font-size: var(--fs-21); line-height: var(--lh-21)` (bereich_training-46, K3)
- schon 21 → Token: 215 `.topbar h1`, 2257 `.rp-verse` (Zeilenhöhe 1.45 bleibt, Ausnahme)

**Notiz-Titel (Text, eigene Stufe)**
- Z. 1014 `.nb .note-title`: `font-size: 34px; font-weight: 700` → `font-size: 32px; font-weight: 600; line-height: 1.2` (letter-spacing −0.02em bleibt). Z. 1069 (26 px) und 3012 (24 px) bleiben. (bereich_notebook_news-15, K14)

**→ `--fv-14`**
- Z. 1036 `.nb .stats-grid .v` 13.5 → 14
- Z. 2970 `.stc-col > b` in `@container (max-width: 300px)` 14.5 → 14 (K11)
- schon 14 → Token: 794 `.strat-stats .v`, 911 `.day-card .stats .v`, 1480 `.fw-acc-v`, 2641 `.pfm-top span`

**→ `--fv-16`**
- 17 → 16: Z. 2233 `.rp-range-val` (lh 1 bleibt), Z. 3077 `.nw-next-when b`
- 18 → 16: Z. 815 `.slider .sv`, 2533 `.replay-verdict`, 2701 `.prop-balance .val.sm`
- 19 → 16: Z. 1506 `.streak-ring` · 20 → 16: Z. 2500 `.replay-meta .sym`
- schon 16 → Token: 908 `.day-card .head .pnl`, 1456 `.fw-stats b`, 1690 `.yc.year b`, 2967 `.stc-col > b`

**→ `--fv-20`**
- 22 → 20: Z. 533 `.tile .val` (`@container` ≤ 164 px), Z. 936 `.tile .val` (≤ 960), Z. 2741 `.prop-balance .val` (Handy)
- 21 → 20: Z. 3027 `.tile .val` (Handy)
- schon 20 → Token: 2742 `.prop-tiles .tile .val`, 3038 `.stat-tile .v`

**→ `--fv-24`**
- 25 → 24: Z. 540 `.tile .val`
- 22 → 24: Z. 649 `.stat .v`, Z. 1679 `.tracker-foot .score-n`
- 21 → 24: Z. 2945 `.coach-gs-tiles .tile .val`
- 26 → 24: Z. 747 `.detail-head .sym`, 748 `.detail-head .big`, 2446 `.shadow-tiles .tile.shadow-main .val` (Handy), 2700 `.prop-balance .val`, 2208 `ol.rp-visual li::before` (lh 1 bleibt)
- 34 → 24: Z. 2397 `.shadow-tiles .tile.shadow-main .val`
- 30 → 24: Z. 1307 `.tilt-stats .v` (≤ 960); `.v.cur` dort bleibt 24 → Token
- Z. 1735 `.tile.spark-tile .val`: siehe 3.2.5 (erbt `.tile .val`)
- schon 24 → Token: 639 `.stat-tile .v` (Laufweite −0.01em → `--ls-val`), 1644 `.streak-tile .val` (Container), 2684 `.prop-tiles .tile .val`

**→ `--fv-32`**
- 30 → 32: Z. 577 `.score-big`, Z. 2571 `.voice-time`
- 34 → 32: Z. 1297 `.big-stat` (≤ 960), Z. 2540 `.replay-big`
- 40 → 32: Z. 1303 `.tilt-stats .v` · 46 → 32: Z. 2551 `.rh-big` (Handy)
- schon 32 → Token: 1304 `.tilt-stats .v.cur`, 2303 `.rp-bigtime` (lh 1 bleibt)

**→ `--fv-44`**
- 42 → 44: Z. 798 `.streak .big` (lh 1 bleibt) · 48 → 44: Z. 1464 `.fw-big` · 56 → 44: Z. 2460 `.rh-big`
- schon 44 → Token: 1203 `.big-stat`

#### 3.2.4 Gewichte

| Selektor (Z.) | vorher → nachher | Befund |
|---|---|---|
| `.brand` (140) | 800 → 900 | typografie-1 |
| `.cert[data-theme="app"] .cert-brand .name` (2048) | 800 → 900 | typografie-1 |
| `.btn.primary` (274) | 600 → 700 | typografie-1 |
| `.btn.accent` (3137) | `font-weight: 600` → `font-weight: 500` | typografie-1, typografie-19 (K8) |
| neu nach Z. 3144 | `.btn.accent.tl { font-weight: 700; }` („Trade loggen“, app.js:253) | typografie-1 |
| `.rp-btn` (2214) | 600 → 500 | typografie-19 |
| `.rp-btn.rp-primary` (2217) | `font-weight: 700;` ergänzen | typografie-19 |
| `.prop-tabs a` (2590), `.prop-sub a` (2595), `.set-tabs button` (1867), `.fd-seg button` (1386), `.fd-tog button` (1388), `.fd-chip` (1400), `.fd-add` (1407), `.dp-month` (429), `.dp-link` (434), `.nb .datebtn` (1015), `.datepick .dp` (1023), `.add-slot` (1586), `.toast` (898), `.more-link` (1659) | 600 → 500 | typografie-19, bereich_konto-33, bereich_notebook_news-15 |
| `.datepick .dp` (1023) | zusätzlich `font-family: var(--font-num);` (wie `.dp-day`, Z. 420) | bereich_notebook_news-15 |
| `.nb .tagpill` (992) | 600 → 500 | bereich_notebook_news-15 |
| `.nb .tagpill b` (993) | `{ color: var(--muted); font-weight: 600; }` → `{ color: var(--muted); font-weight: 500; font-family: var(--font-num); }` | bereich_notebook_news-15 |
| `.nb-details summary` (1186) | 700 → 600 | bereich_notebook_news-15 |
| Listen-Titel: `.nb .note-item b` (1001), `.fw-acc-n b` (1478), `.fw-rp-t b` (1490), `.sp-item b` (1611), `.rp-list .rp-li-main b` (2328), `.pfm-top b` (2640), `.prop-title b` (2692), `.prop-group-title b` (2715) | `font-weight: 600;` ergänzen (heute erbt `<b>` Bold 700) | typografie-20, bereich_notebook_news-15 |
| `.shadow-intro b` (2395) | `font-weight: 600;` ergänzen | typografie-20, bereich_training-33 |
| `.empty b` (677) | `font-weight: 600;` ergänzen | bereich_training-33 |
| `.tbl .sym` (602) | 700 → 600 (gilt auch für die Schülernamen in `.coach-tbl`) | typografie-20, bereich_konto-33 |
| `.aff-name` (2677) | 700 → 600 | bereich_konto-33 |
| `.font-card b` (1931), `.pair-card b` (1948) | `font-weight: 600;` ergänzen | bereich_einstellungen-28 |
| Zeilentitel, neu nach Z. 1865 | `.set-row b, .set-block .row.between > div > b, .set-block .check b, .coach-nrow b { font-size: var(--fs-14); line-height: var(--lh-14); font-weight: 500; }` (**ohne** Farbe). Z. 2949 `.coach-nrow b { font-size: 13.5px; }` löschen. | referenz-35, bereich_einstellungen-28, bereich_konto-33, typografie-20 (K7) |
| `.stat-tile .k` (637), `.stat .k` (647) | `font-weight: 500;` ergänzen (Rolle Kachel-Titel) | typografie-3 |
| Zähler `.btn .cntb` (1341), `.fd-panel .cntb` (1421) | 700 → 600 | typografie-3 (Rolle Zähler) |
| `.dstreak-steps b` (1265) | `font-weight: 700; letter-spacing: .08em` → `font-weight: 600; letter-spacing: .06em` (Farbe und Z. 1266/1267 bleiben) | bereich_training-21 (K19) |
| `.rules-list li::marker` (1274) | `{ color: var(--accent); font-weight: 700; }` → `{ color: var(--muted); font-weight: 500; font-family: var(--font-num); }` | bereich_training-21 |

#### 3.2.5 Komponenten

| Selektor (Z.) | vorher → nachher | Befund |
|---|---|---|
| `.tile .val` (540) | `font-family: var(--font-display); font-size: 25px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.1;` → `font-size: var(--fv-24); font-weight: 700; letter-spacing: var(--ls-val); line-height: var(--lh-val);` | typografie-3 |
| `.tile.spark-tile` (1733) | Regel `{ gap: 2px; }` löschen | bereich_trades_tag-31 (K26) |
| `.tile.spark-tile .spark-body` (1734) | `flex-wrap: nowrap;` ergänzen | bereich_trades_tag-31 |
| `.tile.spark-tile .val` (1735) | `font-family`, `font-size: 28px`, `font-weight`, `letter-spacing`, `line-height` löschen. Es bleibt `{ flex: 0 0 auto; display: flex; align-items: center; margin: 0; padding: 0; min-height: 0; }` | bereich_trades_tag-31 |
| `.tile .val small.sub` (1501) | Regel löschen (nur im Drawdown-Widget benutzt, das in 3.5 umgebaut wird) | diagramme-42 |
| `.bar-row .bl b`, neu nach Z. 656 | `.bar-row .bl b { font-weight: 600; white-space: nowrap; } .bar-row .bl b .muted { font-weight: 400; }` (Schrift über die Sammelregel) | bereich_statistik-17 |
| `.cpn-code`, neu nach Z. 2655 | `.cpn-code.is-link { font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 500; letter-spacing: 0; }` | bereich_konto-31 |
| Beschreibungsbreite, neu nach Z. 1818 | `.set-head p, .set-block .small { max-width: 68ch; }` | typografie-9 |
| Knopf rechts halten, neu nach Z. 1818 | `.set-block .row.between > div:first-child { flex: 1 1 320px; min-width: 0; }` | referenz-35 |
| Editor-Überschriften, neu nach Z. 1135 | `.ql-editor h1, .ql-editor h2, .ql-editor h3 { line-height: 1.25; }` (Ränder 1133–1135 bleiben) | typografie-23 |
| Notebook-P&L, neu nach Z. 1029 | `.nb .nb-pnl { margin-top: 4px; font-weight: 500; color: var(--text-2); } .nb .nb-pnl > .pos, .nb .nb-pnl > .neg, .nb .nb-pnl > .neu { font-weight: 700; font-family: var(--font-num); }` | bereich_notebook_news-15 |

#### 3.2.6 Einzelstellen

| Selektor (Z.) | vorher → nachher | Befund |
|---|---|---|
| `.pg-facts dd.pg-tags .chip` (2814) | `white-space: nowrap;` ergänzen | bereich_prop-49 |
| `.pg-facts dd.pg-tags .chip + .chip::before` (2815) | `content: ' · ';` → `content: '· ';` | bereich_prop-49 |
| `.nw-next-when b` (3077), `.nw-time` (3091), `.nw-v b` (3106) | `tabular-nums` kommt aus der Sammelregel 3.2.2 (keine Einzeländerung nötig) | bereich_notebook_news-48 |

### 3.3 `web/css/landing.css`

| Stelle | vorher → nachher | Befund |
|---|---|---|
| Z. 14 `.lp .hero h1`, Z. 43 `.lp .step .k` | `font-weight: 800` → `font-weight: 900` (sieht aus wie heute, weil 800 bisher als 900 gerendert wurde) | typografie-1 |

### 3.4 `web/js/ui.js`

| Stelle | vorher → nachher | Befund |
|---|---|---|
| Z. 122 `fmt.cur` | `const d = o.compact ? 0 : (a >= 10000 ? 0 : 2);` → `const d = o.compact ? 0 : 2;` | typografie-14 |
| Z. 143 `fmt.factor` | `factor(v) { return v == null ? '∞' : fmt.num(v, 2); },` → `factor(v) { return v == null ? '∞' : new Intl.NumberFormat(LOC(), { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v); },` | bereich_statistik-42 |
| nach Z. 147 (`dateDM`) neu | `dateRow(d) { if (!d) return '—'; const x = new Date(d); return x.getFullYear() === new Date().getFullYear() ? fmt.dateDM(x) : fmt.dateShort(x); }, /* Trade-Listen: im laufenden Jahr ohne Jahr */` | referenz-28 |
| nach Z. 158 (`weekdayLong`) neu | `weekdayDM(d, withYear) { return new Date(d).toLocaleDateString(LOC(), Object.assign({ weekday: 'short', day: '2-digit', month: '2-digit' }, withYear ? { year: '2-digit' } : {})); }, /* Tagestabelle: „Do., 08.10.“ */` | bereich_statistik-40 |

### 3.5 `web/js/widgets.js`

| Stelle | vorher → nachher | Befund |
|---|---|---|
| Z. 186 (Maximaler Drawdown) | Wert `` `<span class="neg">${fmt.cur(dd.max)}</span><small class="neg sub">${pctText(dd.maxPct)}</small>` `` → `` `<span class="neg">${fmt.cur(dd.max)}</span>` ``; foot `dd.maxAt ? fmt.dateFull(dd.maxAt) : 'Kein Drawdown'` → `` dd.maxAt ? `<span class="neg">${pctText(dd.maxPct)}</span> · ${fmt.dateFull(dd.maxAt)}` : 'Kein Drawdown' `` | diagramme-42 |
| Z. 188 (Ø Drawdown) | Wert → `` `<span class="neg">${fmt.cur(dd.avg)}</span>` ``; foot → `` `<span class="neg">${pctText(dd.avgPct)}</span> · Aktuell: <span class="${U.cls(dd.current)}">${fmt.cur(dd.current)}</span>` `` (Datum entfällt, damit der Fuß einzeilig bleibt) | diagramme-42 |
| Z. 256 (Letzte Trades) | `<td>${fmt.dateFull(tab === 'open' ? t.open : t.close)}</td>` → `<td class="num">${fmt.dateRow(tab === 'open' ? t.open : t.close)}</td>` | referenz-28, typografie-12 |
| Z. 273 (Challenge) | `<div class="big-stat" style="font-size:30px;margin:0">` → `<div class="score-big" style="margin:0">` | typografie-3 (K27) |
| Z. 287 (Regel-Tracker) | `<div class="caption" style="text-transform:none;letter-spacing:0;font-size:13px;font-weight:600;color:var(--text-2)">Heutiger Score ${U.info(…)}</div>` → `<div class="val-label">Heutiger Score ${U.info(…)}</div>` | bereich_dashboard-44, typografie-17, referenz-43 |
| Z. 227 („Dein Score“) | **nicht ändern**, bis der Nutzer entschieden hat (6.1) | referenz-43 |

### 3.6 `web/js/widgetpreviews.js`

| Stelle | vorher → nachher | Befund |
|---|---|---|
| Z. 67 `max_drawdown` | `… + num(96, 47, '−15,5 %', 5, L, { w: 600 }) + cap(8, 65, '28.08.2026')` → `… + num(8, 65, '−15,5 %', 5, L, { w: 600 }) + cap(31, 65, '· 28.08.2026')` | diagramme-42 |
| Z. 68 `avg_drawdown` | `… + num(96, 47, '−3,0 %', 5, L, { w: 600 }) + tx(8, 65, 'Aktuell (01.10.2026):', 4.6, T2) + num(62, 65, '−758,76 €', 4.6, L, { w: 600 })` → `… + num(8, 65, '−3,0 %', 4.6, L, { w: 600 }) + tx(26, 65, '· Aktuell:', 4.6, T2) + num(49, 65, '−758,76 €', 4.6, L, { w: 600 })` | diagramme-42 |
| Kontrolle | x-Positionen in `panel_widget_hinzufuegen` prüfen: kein Überlappen, Abstand ≈ 2 Einheiten | – |

### 3.7 `web/js/app.js`

| Stelle | vorher → nachher | Befund |
|---|---|---|
| Z. 530 (Session beenden) | dreimal `<div class="caption">` („Heute“, „Trades“, „Win-Rate“) → `<div class="val-label">` | referenz-43 |
| Z. 567 (CSV-Vorschau) | `<td>${fmt.dateTime(d.open)}</td>` → `<td class="num">…`; `<td>${d.close ? fmt.dateTime(d.close) : '<span class="faint">offen</span>'}</td>` → `<td${d.close ? ' class="num"' : ''}>…` | typografie-12 |

### 3.8 `web/js/screens/*.js`

| Datei:Stelle | vorher → nachher | Befund |
|---|---|---|
| day.js:14 | `<div class="caption">Netto-P&L</div>` → `<div class="val-label">Netto-P&L</div>` | referenz-43, bereich_trades_tag-39 |
| day.js:15 | `<td>${fmt.time(t.open)}…</td>` → `<td class="num">${fmt.time(t.open)}…</td>` | typografie-12 |
| trades.js:26 | `<div class="spark-body">` → `<div class="body spark-body">` | bereich_trades_tag-31 |
| trades.js:49 | `<td>${fmt.dateFull(t.open)} <span class="muted">${fmt.time(t.open)}</span></td>` → `<td class="num">${fmt.dateRow(t.open)} <span class="muted">${fmt.time(t.open)}</span></td>`. Zelle „Geschlossen“: `<td>${t.close ? …` → `<td${t.close ? ' class="num"' : ''}>${t.close ? …`, darin `fmt.dateFull(t.close)` → `fmt.dateRow(t.close)` | referenz-28, typografie-12 (K21) |
| trades.js:59 | `<div class="caption">Entgangen</div>` und `<div class="caption">Wären Gewinner gewesen</div>` → `class="val-label"`; `<td>${fmt.dateFull(C.parseDayKey(x.date))}</td>` → `<td class="num">${fmt.dateRow(C.parseDayKey(x.date))}</td>` | referenz-43, typografie-12, referenz-28 |
| stats.js:21 (`statVal`) | `case 'factor': return v == null ? '∞' : fmt.num(v, 2);` → `case 'factor': return fmt.factor(v);` | bereich_statistik-42 |
| stats.js:29 (`tabDays`, nach `const ds = …`) | neu: `const multiYear = new Date(days[0].day).getFullYear() !== new Date(days[days.length - 1].day).getFullYear();` | bereich_statistik-40 |
| stats.js:32 | `<td>${fmt.weekdayLong(d.day)}</td>` → `<td class="num">${fmt.weekdayDM(d.day, multiYear)}</td>` | bereich_statistik-40 (K16) |
| stats.js:34 (`groupTable`) | `<td><b>${esc(g.label \|\| g.key)}</b></td>` → `<td class="lbl">${esc(g.label \|\| g.key)}</td>` | bereich_statistik-18 |
| stats.js:51 | `fmt.pct(mr.mistakeSummary.winRate)` → `fmt.pct(mr.mistakeSummary.winRate, 1)`, `fmt.pct(mr.compliantSummary.winRate)` → `fmt.pct(mr.compliantSummary.winRate, 1)` (Fuß „… aller Trades“ bleibt ohne Stelle) | bereich_statistik-42 (K20) |
| stats.js:52 | Text an `U.barRow`: `` `${fmt.cur(it.total, { signed: true })} · ${it.n}× · WR ${fmt.pct(it.n ? it.wins / it.n : 0)}` `` → `` `${U.pnl(it.total)} <span class="muted">· ${it.n}× · ${fmt.pct(it.n ? it.wins / it.n : 0)} Win-Rate</span>` `` | bereich_statistik-17 |
| stats.js:72 | `` `<span class="small" style="font-size:20px">${fmt.r(e.low)} bis ${fmt.r(e.high)}</span>` `` → `` `${fmt.r(e.low).replace(' R', '')} bis ${fmt.r(e.high).replace(' R', '&nbsp;R')}` `` | bereich_statistik-41 (K22) |
| stats.js:73 | `Standardabweichung ${fmt.num(e.sd, 2)} R · Standardfehler ${fmt.num(e.se, 3)} R` → `Standardabweichung ${fmt.dec(e.sd, 2)} R · Standardfehler ${fmt.dec(e.se, 2)} R` | bereich_statistik-42 |
| prop.js:102 | `<div class="caption">Balance</div>` und `<div class="caption">P&L</div>` → `class="val-label"` | referenz-43 |
| prop.js:233, 263, 267 (2 Zellen), 286 (2 Zellen) | jede `<td>${fmt.dateFull(…)}</td>` bzw. `<td>${p.receivedAt ? fmt.dateFull(…) : '—'}</td>` → `<td class="num">…` | typografie-12 |
| prop-friedhof.js:151, 152 | `.map(… U.chip(…)).join('')` → `.join(' ')` | bereich_prop-49 (K23) |
| shadow.js:69 | `<td>${fmt.dateTime(v.date)}</td>` → `<td class="num">…` | typografie-12 |
| notebook.js:76 | `<div style="margin-top:4px;font-weight:700;color:var(--text)">Netto-P&L …` → `<div class="nb-pnl">Netto-P&L …`; in beiden `<span class="muted small" style="font-weight:500">` das `style="font-weight:500"` streichen | bereich_notebook_news-15 |
| ruhepunkt.js:707 | `h('h1', { class: 'rp-q', tabindex: '-1' }, …)` → `h('h2', { class: 'rp-q', tabindex: '-1' }, …)` | bereich_training-46 |
| misc.js:33 | `style="margin-top:14px;max-width:640px"` → `style="margin-top:14px"` | typografie-9 |
| misc.js:255, 260 (Logs) | `<td>${when(x.at)}</td>` / `<td>${when(l.at)}</td>` → `<td class="num">…` | typografie-12 |
| affiliate.js:52 (`ticket`) | `class="cpn-code"` → `class="cpn-code${kind === 'link' ? ' is-link' : ''}"` | bereich_konto-31 |
| affiliate.js:67 | `<td class="nowrap">${fmt.dateFull(…)}</td>` → `<td class="nowrap num">…` | typografie-12, bereich_konto-34 |
| coach.js:25 | keine Änderung; die Sichtbarkeits-Tabelle wird durch 3.2.2 Satoshi | bereich_konto-34 |

### 3.9 Test-Helfer für lokale Schriften

| Datei | Änderung | Befund |
|---|---|---|
| `web/e2e/localfonts.js` Z. 5–6 und `scratchpad/localfonts.js` | `const sat = [[400,'Regular'],[500,'Medium'],[700,'Bold'],[900,'Black']].map(…)` → `const sat = "@font-face{font-family:'Satoshi';src:url('https://cdn.fontshare.com/local/Satoshi-Variable.woff2') format('woff2');font-weight:300 900;font-style:normal;font-display:swap}";` und den Kommentar auf „variable Schrift 300–900“ ändern. `Satoshi-Variable.woff2` liegt schon in `scratchpad/fonts-local/`. Nicht ins Repository legen (Lizenz, README Z. 173–175). | typografie-1 |

### 3.10 `web/README.md`

| Stelle | vorher → nachher | Befund |
|---|---|---|
| Z. 175–176 | „(feste Schnitte 400, 500, 700, 900; Gewicht 600 nimmt Bold)“ → „(variable Schrift mit Gewichtsachse 300–900; 500, 600 und 700 sind echte Stufen, die Marke steht auf 900)“ | typografie-1 |
| Z. 91 | „Kalender mit kurzer Tageszahl („+2,1k“, „−486“, …“ → „Kalender mit kurzer Tageszahl samt Währungszeichen („+2,1k€“, „−486€“, …“ | responsiv-33 |
| Z. 209–210, nach „… fett.“ ergänzen | „Etiketten (Pillen, Abzeichen, Zähler) und Listenwerte 600, die Marke 900. Satoshi für Wörter, Onest für alles, was überwiegend aus Ziffern besteht; Tabellenzellen sind Text, Zahlenzellen tragen `r`, `c` oder `num`. **Schriftgrößen** nur über Tokens in `css/app.css`: Text `--fs-11/12/13/14/15/18/21` mit Zeilenhöhen `--lh-*` (als Verhältnis, 16/16/18/20/20/24/28 px), Werte `--fv-14/16/20/24/32/44` (Onest 700, Zeilenhöhe 1.1); `--fs-10` nur in Container-Notstufen. Wert-Beschriftungen über großen Zahlen normal geschrieben (`.val-label`), Versalien nur für Abschnitts-Labels. **Zahlen:** Beträge immer mit zwei Nachkommastellen (ohne nur bewusst über `compact`, dann für beide Werte eines Paares), Profit-Faktor zwei Stellen, Win-Rate in Kacheln eine Stelle, in Tabellen keine; Datum in Trade-Listen ohne Jahr im laufenden Jahr (`fmt.dateRow`).“ | typografie-3, -11, -12, -14, referenz-28, -43, bereich_statistik-42 |

---

## 4. Akzeptanzkriterien

### 4.1 Schrift und Gewichte

1. `grep -n "satoshi@" web/app.html web/index.html` zeigt nur `satoshi@1`.
2. Im Browser (mit `localfonts.js`): `await document.fonts.load('600 40px Satoshi')`, danach misst ein Canvas „Dashboard Statistiken“ bei 500/600/700 drei **verschiedene** Breiten (lokal erwartet ≈ 388/401/408 px). Heute: 391/411/411.
3. `[...document.fonts].filter(f => f.family.replace(/"/g, '') === 'Satoshi').map(f => f.weight)` enthält `"300 900"`.
4. `settest2` („Satoshi geladen“) ist grün.
5. dashboard.png: „Gesamt-Score“ (15/600) sichtbar leichter als „893,04 €“ (700). „ÜBERSICHT“ (Seitenleiste) und „DEIN SCORE“ haben gleiches Gewicht und gleiche Laufweite. „Trade loggen“ ist fett, „Filter“ mit aktivem Filter ist **nicht** fetter als ohne.
6. `grep -nE "font-weight: ?(700|800)" web/css/app.css` trifft keine Titel- oder Steuerelement-Selektoren aus 3.2.4 mehr. `grep -n "font-weight: 800" web/css/app.css` trifft nur noch `.cal .d .p` (Z. 721) und `.cal .d .pm` im Container (Z. 2976), beide Onest. Die 650er-Angaben des Zertifikat-Standarddesigns (Z. 2007, 2015) bleiben unverändert, sie werden im App-Design ohnehin mit 700 überschrieben.

### 4.2 Skala (grep und Zensus)

1. `grep -nE "font-size: ?(9\.5|10\.5|11\.5|12\.5|13\.5|14\.5)px" web/css/app.css` liefert nur Zeilen mit `.pg-` oder `.prop-grave` (Grabstein).
2. `grep -nE "font-size: ?[0-9.]+px" web/css/app.css` liefert nur: Grabstein (`.pg-`, `.prop-grave`), `.avatar-big` (26), `.font-card .sample` (30), `.nb-menu .grid-em button` (20), `.nb .note-title` (32/26/24). Alle anderen Größen laufen über `var(--fs-*)`/`var(--fv-*)` (Zertifikat nutzt `calc`, Editor `em`/`var(--nb-*)`).
3. `grep -n "style=\"font-size" web/js/screens/stats.js web/js/widgets.js` → keine Treffer.
4. Atlas und Zensus neu erzeugen (`audit/atlas.js`, Ausgabe vorher sichern). In `census/<seite>.json` kommen die Größen 9.5, 10, 10.5, 11.5, 12.5, 13.5, 14.5, 17, 19, 22, 25, 28, 34 px **nur** in `prop_friedhof`/`prop/friedhof` (Grabstein) und `notebook` (Editor-Inhalt, ungestaltete `h3`, siehe 1.12) vor. `settings_design` darf zusätzlich 30 px (Schriftprobe), `settings_profil` 26 px (Avatar) enthalten.
5. `census.json` → `lineHeight`: höchstens 25 verschiedene Werte (heute 48). In `dashboard`, `stats_summary`, `trades` und `settings_profil` sind die fünf häufigsten Zeilenhöhen ganzzahlig (erwartet 16, 18, 20, 24, 26.4/28 px).
6. `census.json` → `letterSpacing`: kein 0.99px mehr (.09em der Seitenleisten-Gruppentitel). Alle Eyebrows der Sammelregel messen 0.66px (= .06em × 11 px), geprüft über `getComputedStyle` an `.nav-title`, `.popover .sec`, `.nb .sec-h`, `.sp-group`, `.caption`.

### 4.3 Screenshot-Prüfpunkte (dunkel 1440, wo genannt auch 1024/390 und hell)

| Ansicht | Prüfpunkt | Befund |
|---|---|---|
| dashboard | Kachel-Titel 13/500; Kachelwerte 24; „Heutiger Score“ 13/500 normal geschrieben; Drawdown-Kacheln: Wert einzeilig, Fuß „−4,2 % · 01.10.2026“; Letzte Trades „08.10.“; Schatten-Ich-Widget-Labels 12 px (Kürzung nicht schlimmer als heute, K13) | typografie-3, diagramme-42, referenz-28, bereich_dashboard-44 |
| dashboard 390 | Kalender-Beträge 11 px mit €, Tageszahl 11 px im 20-px-Kreis, Heute-Kreis sichtbar, `mobiletest` ohne seitlichen Überlauf | responsiv-33 |
| dashboard 1280 | Kalenderzellen ohne Überlauf (Container-Stufen) | K10 |
| trades | „893,04 €“ gleich groß wie „1,43“ (24 px), gleiche Trennlinie unter dem Titel; leer_trades: „Noch keine Daten“ in allen vier Kacheln auf gleicher Höhe (y ≈ 220); Tabellenkopf komplett Satoshi auf einer Grundlinie; „Range-Fade“, „Gewinn“ in Satoshi; Datumsspalte „08.10. 19:43“ in Onest; `tlfittest` grün | bereich_trades_tag-31, typografie-12, referenz-28 |
| day | „Netto-P&L“ über dem Wert normal geschrieben 13/500; Kennzahl-Labels 12 px; „Gewinner / Verlierer“ einzeilig | referenz-43, bereich_trades_tag-39 |
| prop (Cockpit) | „Balance“/„P&L“ normal 13/500; „111.262,00 $“ in Onest 24; „11.162,00 $ von 3.000,00 $“; Reiter „Übersicht · Auswertung · Konten“ 14/500; „Copy NQ“ und „Aktive Konten“ gleich schwer; bei 1024 passen vier Kacheln „+12.316,00 €“ | referenz-43, typografie-11, -14, -19, -20 |
| prop_bilanz | „Pro Firma“-Werte untereinander bündig; Tabellenspalten Typ/Firma/Konto/Notiz in Satoshi, Datum in Onest | typografie-21, -12 |
| prop_friedhof (Rückseite) | keine Zeile endet mit „·“ | bereich_prop-49 |
| stats_summary | Kachelwerte 24, Faktor-Kacheln mit zwei Stellen | typografie-3, bereich_statistik-42 |
| stats_setups/time/regime | erste Spalte Satoshi 600, Profit-Faktor „0,00“ statt „0“ | bereich_statistik-18, -42 |
| stats_days | „Do., 08.10.“ in Onest; am Handy belegt die Spalte weniger als die halbe Breite | bereich_statistik-40 |
| stats_mistakes | „−1.051,86 € · 2× · 0 % Win-Rate“, Betrag farbig Onest 600, Rest gedämpft 400; Kachel „Win-Rate mit / ohne Fehler“ mit einer Stelle | bereich_statistik-17, -42 |
| stats_edge | „−1,06 bis +1,39 R“ in Kachelgröße; 390: Umbruch nur als „−1,06 bis“ / „+1,39 R“; Untertitel „Standardfehler 0,50 R“ | bereich_statistik-41, -42 |
| settings_profil | „Profil“ 18/600 kleiner als „Einstellungen“ 21/600; „Daten und Sicherung“ 15/600 über „Sicherung exportieren“ 14/500; „Alles löschen“ bleibt rot; Beispieldaten-Text ≤ 68ch, „Entfernen“ rechts | referenz-32, referenz-35, typografie-9 |
| settings_trading, settings_sprache | Beschreibungen ≤ 68ch breit | typografie-9 |
| settings_design | Theme-/Designkarten 13/600, Sprachkarte 14/600, „+240 €“ in Onest 600 | bereich_einstellungen-28, -29 |
| settings_konten, settings_logs | Tabellenköpfe alle Satoshi, gleiche Höhe | bereich_einstellungen-30 |
| settings_benachrichtigungen, coach | Schalter-Titel 14/500 in Einstellungen und Coach gleich | K7, bereich_konto-33 |
| affiliate (Creator, 390) | Link zeigt den vollständigen Ref-Code, Coupon-Codes unverändert gesperrt; Creator-Namen 600 Satoshi | bereich_konto-31, -33, -34 |
| notebook, notebook_notiz | Listentitel 14/600; Tag-Pillen 500; „ORDNER“/„TAGS“ 11/600; Toolbar „Text“ und „16“ 13/500, „16“ in Onest; Notiztitel 32/600; Editor-h2 zweizeilig ohne Lücke; „Netto-P&L“ 500, Betrag 700 Onest | bereich_notebook_news-14, bereich_notebook_news-15, typografie-23 |
| news | Uhrzeiten und Werte mit gleich breiten Ziffern („14:15“ so breit wie „14:30“) | bereich_notebook_news-48 |
| ruhepunkt (+ Session) | `document.querySelectorAll('h1').length === 1`; „Wo stehst du gerade?“ und Session-Titel 21/600; „Vor dem Trading“ 15/600; `rptest` grün | bereich_training-46 |
| progress | „Aktuelle Regeln“-Ziffern gedämpft 500; Stufenwort der Serie 600, Farben der Stufen unverändert | bereich_training-21 |
| shadow, leer_shadow, leer_progress | Intro-Satz und Leer-Titel 15/600 wie Kartentitel | bereich_training-33, typografie-20 |
| sidebar, pop_konto | Navigation 14/500; Konto-Menü-Einträge 13 wie die anderen Menüs | typografie-31 |
| panel_widget_hinzufuegen | Drawdown-Vorschaubilder zeigen Prozent im Fuß, keine Überlappung | diagramme-42 |
| Kopfzeile 1024 | Knöpfe (14 px) ohne Umbruch oder Abschneiden | typografie-3 |
| hell 1440 | Stichprobe dashboard, settings_profil, trades: gleiche Typografie wie dunkel | – |
| index.html | Hero-Titel und Schritt-Nummern sehen aus wie vorher (900) | typografie-1 |

### 4.4 Code-Prüfungen

- `grep -n "a >= 10000" web/js/ui.js` → keine Treffer.
- `grep -n "WR \${" web/js/screens/stats.js` → keine Treffer.
- `grep -n "h('h1'" web/js/screens/ruhepunkt.js` → keine Treffer.
- `grep -rn 'class="caption"' web/js` → nur noch Abschnittsköpfe: widgets.js:184 (Serie), widgets.js:227 (bis zur Antwort 6.1), progress.js:74/75, trades.js:76, news.js:83, replay.js, voice.js.
- `grep -n "\.journal" web/css/app.css` → keine Treffer.
- `grep -n "small.sub" web/css/app.css web/js/widgets.js` → keine Treffer.
- `grep -nE "<td>\\$\{fmt\.(date|time)" -r web/js` → keine Treffer (alle Datums- und Zeitzellen tragen `num`).
- `grep -n "tbl th.r" web/css/app.css` → keine Treffer.

### 4.5 Tests

- `node --test web/tests/*.mjs` grün.
- `web/e2e/runall.sh` vollständig grün, insbesondere settest2, rptest, mobiletest, tlfittest, affiliatetest, coupontest, newstest, figtest, figdel, shadowtest, streaktest, coachtest. Tests, die Beträge über `UI.fmt.cur` berechnen, passen sich an. Hart kodierte ganzzahlige Beträge ab 10.000 sind anzupassen (beim Audit keine gefunden).

---

## 5. Zurückgestellt

| Befund (Teil) | Grund |
|---|---|
| bereich_training-46: `.rp-seq-i b` 11 → 12 px | Verschärft die Kürzung in der Rhythmus-Zeile. Erst zusammen mit der Mindestbreite aus bereich_training-41 (andere Gruppe) umsetzen. 11 px liegt auf der Skala. |
| bereich_statistik-42: Win-Rate in Kacheln auf 0 Stellen | Vom Prüfer abgelehnt: Dashboard-Kacheln zeigen dieselbe Kennzahl mit einer Stelle. Es gilt die Regel in 1.9. |
| responsiv-33: Wochentagszeile am Handy umgestalten; Kalender-Kurzform ohne Währungszeichen | Bruch zwischen Breakpoints bzw. widerspricht README Z. 194 (Commit bd02670, € gewollt). |
| typografie-14, Ergänzung hierarchie-27: Balance und Limits ganzzahlig | Zweite Formatregel nur für Kontokarten; typografie-14 löst den Befund vollständig (K24). |
| bereich_konto-31: `direction: rtl` als Fallback | Bidi-Umordnung kann die URL verfälschen; mit 13/500 ohne Sperrung passt der Link (≈ 225 px). |
| referenz-35: Abstand unter dem Block-Titel 10 → 12/14 px, `flex-wrap: nowrap` | Abstand gehört zur Gruppe Abstände; `nowrap` quetscht am Handy den Text neben zwei Knöpfen (K25). |
| bereich_dashboard-44: `.fw-stats > div > span` auf 13/500, `.tile .head` unverändert | 13/500 verschlimmert die Kürzung (Prüfer). Umgesetzt wird 12/400 (K13). `.tile .head` folgt der Skala (13). |
| bereich_konto-34: Klasse `.tbl td.txt` | Ersetzt durch die Markierung der Zahlenzellen (K15). |
| typografie-17: `.dstreak-steps b` und `.pg-cause span` in die Eyebrow-Sammelregel | Stufenwort mit eigenen Stufenfarben (README Z. 129–133) bzw. Inschrift auf dem Grabstein (Ausnahme 1.11). |
| bereich_notebook_news-15: Notiz-Titel-Stufen 26/24 px (Z. 1069, 3012) | Bewusste Breakpoint-Stufen (Prüfer), Ausnahme 1.11. |
| typografie-3: Ausnahmen Zertifikat, Grabstein, Editor-Inhalt, Ruhepunkt-Vers | Bewusst gestaltete Objekte bzw. Nutzereinstellungen (Prüfer), siehe 1.11. |

---

## 6. Nutzer fragen

### 6.1 „Dein Score“ im Gesamt-Score-Widget (referenz-43; widgets.js:227)

Alle anderen Beschriftungen über großen Werten werden normal geschrieben (13/500, „Netto-P&L“, „Balance“, „Heute“). Nur „DEIN SCORE“ bliebe in Versalien. Das Widget hast du ausdrücklich „wieder wie am Anfang“ herstellen lassen.
**Frage:** Soll „Dein Score“ wie die übrigen Wert-Beschriftungen normal geschrieben werden (13/500 statt 11/600 in Versalien)? Radar, Skala und Zahl bleiben unverändert.
**Empfehlung:** Ja. Sonst bleibt es die einzige Versal-Beschriftung über einem Wert in der App.

### 6.2 Stufenfarben des Serie-Stufenworts (bereich_training-21; app.css Z. 1266–1267)

Der Prüfvorschlag will die eigenen Farben des Stufenworts („Im Flow“ in Akzent, „Unaufhaltsam“ mit Verlauf) löschen und alles grau setzen. Die drei Stufen hast du so festgelegt (README Z. 129–133).
**Frage:** Sollen die Stufenfarben des Stufenworts entfallen?
**Empfehlung:** Nein. Umgesetzt wird nur Gewicht 700 → 600 und Laufweite .08em → .06em, die Stufenfarben bleiben.
