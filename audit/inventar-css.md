# Stil-Inventar Journalyst (CSS und gerenderter Zensus)

Stand: 2026-10-11. Quellen: `web/css/app.css` (3144 Zeilen, 2831 Regeln), `audit/census.json` (gerendert, dunkel, 1440 px, 44 Ansichten), `audit/census/<seite>.json` (je Seite mit Beispiel-Selektoren und Textproben), `audit/impeccable-detect.txt`, Screenshots `audit/shots/dark-1440/*.png`.

Lesehinweis zum Zensus: Jede der 44 Ansichten enthält Seitenleiste und Kopfzeile. Deren Texte zählen also 43–44-mal (12 Navigationseinträge 14.5 px, 4 Gruppentitel 11 px, Marke 16 px, h1 21 px, Konto-Karte). Wo das die Zahlen verzerrt, steht ein Wert „ohne Rahmen“ daneben.

Zeilenangaben beziehen sich auf `web/css/app.css`.

---

## 0. Was gut ist (kurz)

- Farben laufen fast vollständig über Tokens; das helle Design ist komplett tokenisiert (Z. 54–73). Nur 11 echte Rohfarben außerhalb von Theme-Blöcken, Overlays und Illustrationen (Abschnitt 4.3).
- Rahmen sind streng: 134× `1px solid var(--border)`, 42× `1px solid var(--border-2)`, gerendert 788× / 369×. Keine 1.5-px- oder 2-px-Rahmen an Flächen (Ausnahmen: Checkboxen, Dropzones).
- Ein Schatten-Token (`--shadow`, 15×) für alle schwebenden Ebenen (Popover, Modal, Tooltip, Toast, Seitenpanel, Symbol-Menü).
- Bewegung über eine Dauer-/Easing-Skala (`--dur-1/2/3`, `--ease`), 107 von 120 Übergängen nutzen sie.
- Ein gemeinsamer flacher „Ausgewählt“-Stil am Dateiende (Z. 3122–3131) für Reiter, Segmente, Chips, Karten.
- Verschachtelte Radien stimmen fast überall (Schiene 11 → Knopf 8 bei 3 px Innenabstand, Z. 2542/2543; Prop-Reiter 12 → 9, Z. 2588/2590; Filter-Segment 10 → 7, Z. 1385/1386; Mini-Segment 8 → 6, Z. 1585).
- Knopf und Eingabefeld haben dieselbe Höhe (41,6 px), Zeilen mit beidem stehen bündig (Z. 267, 289).
- Tabellen mit `tabular-nums` (Z. 94), Info-Symbole nur beim Darüberfahren (Z. 496–498), `prefers-reduced-motion` (Z. 97), dünne Scrollbalken (Z. 125–126), Bottom-Sheets am Handy (Z. 3059).

---

## 1. Typo-Skala

### 1.1 Schriftfamilien

| Token | Wert | Verwendungen | Gerendert (Zensus) |
|---|---|---|---|
| `--font` | Satoshi, Onest, Segoe UI, system-ui … | 15 | Satoshi 2673 Texte |
| `--font-display` | **identisch mit `--font`** | 62 | – |
| `--font-num` | Onest, Segoe UI, system-ui … | 33 (+ Sammelregel Z. 1800 mit 30 Selektoren) | Onest 750 Texte |
| – | ui-monospace (`.mono`, Z. 102) | 1 | monospace 5 |
| – | Quicksand, Nunito, Roboto, -apple-system | nur Schrift-Vorschau in Einstellungen → Design | je 1–2 |

Befund: `--font-display` ist ein zweiter Name für dieselbe Schrift (Z. 40–41). 62 Regeln benutzen ihn, 15 `--font`. Ein Token reicht; `--font-display` bleibt höchstens als Alias.

### 1.2 Gerenderte Schriftgrößen (dunkel, 1440 px)

Spalten: n = Vorkommen im Zensus (alle 44 Ansichten); Gewichte mit Anteil; Zeilenhöhen gerendert; Rollen mit CSS-Zeile; Markierung: ■ = Größe hat im CSS nur eine Regel, ● = gerendert nur einmal, ▲ = Rolle mit mehreren Größen (siehe 1.3).

| Größe | n | davon Rahmen ≈ | Gewichte (n) | Zeilenhöhen | Schrift | Rollen (CSS-Zeile) | Mark. |
|---|---|---|---|---|---|---|---|
| 9.5px | 0 | – | – | – | Onest | Kalender-Tagesbetrag Handy `.cal .d .pm` (3042) | ■ |
| 10px | 1 | 0 | 500 | 14.5 | Satoshi | Sortierpfeil `.tbl th .dir` „▼“ (596); Ring-Untertitel (699); News-Wert-Label (3105); Kalender ≤960 (940, 1793) | ● |
| 10.5px | 26 | 0 | 600 (23), 700 (2) | 10.5 / 15.2 | Onest 20, Satoshi 3 | Long/Short-Abzeichen `.badge` (618); Trefferquote im Kalendertag `.wr` (718); Grab-Label `.pg-cause span`, `.pg-rip` (2804, 2793); kleine Pillen (533, 2632, 2920) | |
| 11px | 250 | 174 (Gruppentitel) | 700 (183), 600 (44), 400 (19) | 15.95 / 16.5 / 17.6 | Satoshi 211, Onest 35 | Eyebrow: `.caption` 600 (101), `.nav-title` 700 (167), `.popover .sec` 700 (341), `.nb .sec-h` 700 (975), `.nb-menu .head` 700 (1117), `.cp-sec` 700 (456); kleine KPI-Labels (793, 910, 1035, 1302); Diagramm-Achsen `.chart text` (683, 1648 = 11.5!); Pillen in Kacheln (539); Zähler `.btn .cntb` (1341), `.nav .badge-n` (186); Wochentage (358, 419); Hinweise (816, 1382, 2354); News-Pillen (3085, 3087, 3100) | ▲ |
| 11.5px | 130 | 0 | 600 (70), 400 (52), 700 (5) | 16.675 | Onest 72, Satoshi 55 | Status-Pille `.pill` (545); Feld-Hinweis `.field .hint` (299); Widget-KPI-Label `.fw-stats span` (1455); Gruppentitel Widget-Bibliothek `.sp-group` (1605); Mini-Segment (1585); Notizdatum (1002); Speicherstand (1030); Kalender-Tageszahl (708, 724); Filter-Label (1360); Chart-Text (1648); Regel-Hinweis (2724); Karten-Kleintext (1923, 1932); `.pf-n` (2608) | ▲ |
| 12px | 430 | 43 (Untertitel Marke) | 400 (196), 500 (162), 600 (51), 700 (12) | 17.4 | Satoshi 330, Onest 86, mono 5 | Hilfstext `.small` (101), `.tile .foot` (541), `.stat .s` (650), `.tbl .sub` (611); Tabellenkopf `.tbl th` 500 (593); Formular-Label `.field > label` 600 (298); Chip `.chip` 500 (623); Legende (691), Tooltip (693); `.btn.xs` (281); `.tile .head .n` (518); Filter-Segmente (1362–1364); Theme/Sprach-Kleintext (1923, 1964); `.aff-code` (2670); Handy-Tabellen (2994, 3032) | ▲ |
| 12.5px | 286 | 43 (Avatar-Initial) | 700 (98), 400 (74), 500 (61), 600 (29) | 18.125 / 16.875 / 17.5 | Satoshi 262 | **72 Regeln, die meisten aller Größen.** Kleiner Knopf `.btn.sm` (280), Filter-Fußknopf (1367), Tracker-/Report-Knöpfe (1678, 1711); Segmente `.seg.pill` (322), `.seg.segc` (2543), `.fd-seg`/`.fd-tog`/`.fd-chip`/`.fd-add` (1386–1407), `.tabs.sm` (1508), `.select.sm` (1653); Karten-Untertitel `.card-sub` (503), `.ph-note` (1338), `.pf-sub` (2622), `.rh-sub` (2461), `.sr-desc` (2406), `.ce-date` (2873); Kalender-Wochentag `.cal .wd` 600 (703); Labels `.fd-l` 600 (1381), `.fw-lbl` 600 (1463), `.aff-label` 600 (2668), `.stc-l` (2965); Prop-Fakten (2798, 2808); Avatar `.sb-av` 700 (236); Tabelle Handy (3056) | ▲ |
| 13px | 661 | 43 (Avatar „T“) | 400 (447), 700 (124), 600 (81), 500 (8) | 18.85 / 20.15 | Onest 425, Satoshi 235 | Tabelle `.tbl` (592); Segment `.seg button` 500 (318), Bewertung (324); Popover-Eintrag (334); KPI-Label `.stat-tile .k` 400 (637), `.stat .k` (647); Schlüssel/Wert `.kv` (651); Banner (662), Toast 600 (898), Checkbox (302), Avatar 700 (264); Kalender-Tage (360, 420, 434, 479); Legende Fieldset (893); Link `.more-link` 600 (1659); `.rp-chip` (2244); kleine Eingaben (1396, 2428, 2429, 2923); News-Kopf `.nw-dh` 600 (3084), `.nw-time` 600 (3091); Hilfstexte (1268, 1451, 2648, 3064) | ▲ |
| 13.5px | 418 | ≈130 (Trade loggen, Zeitraum, Konto) | 500 (282), 600 (71), 700 (33), 400 (18) | 19.575 | Satoshi 402 | Knopf `.btn` (267); Eingabe `.input/.select` (289); Reiter `.tabs button` (660), `.prop-tabs a` 600 (2590), `.prop-sub a` 600 (2595); **Kachel-Titel `.tile .head` 500** (517); Konto-Menü (250, 254); Monat im Kalender 600 (429); Listen-Titel 700 (782, 1001, 1611, 2640, 2328); Untertitel `.set-head p` (1816); Fließtext Ruhepunkt/Coach/News (2203, 2214, 2921, 2953, 3088); Richtungs-/Symbolwahl (862, 881); `.add-slot` 600 (1586) | ▲ |
| 14px | 305 | 43 (Konto-Name) | 500 (162), 600 (62), 700 (62), 400 (13), 800 (5) | 20.3 / 14 | Satoshi 292, Onest 10 | Grundschrift `body` (84); Einstellungs-Navigation `.set-nav a` 500 (1807); **Block-Titel `.set-block h3` 700** (1818), `.prop-h3` 700 (2718), `.rp-dlg h3` (2320); Reiter `.set-tabs` 600 (1867); Regel-Label `.sr-label` 600 (2405); Kalender-P&L 800 (721, 725); kleine Werte 700 (794, 911, 1480, 1490, 2641); Chip groß (1879); Datumsknopf 600 (1015); Listen (1273, 2480, 2927); Texte (2517, 2572, 2888) | ▲ |
| 14.5px | 529 | 516 (Navigation) | 500 (516), 400 (1) | 21.025 / 22.475 | Satoshi | Seitenleisten-Navigation `.nav a` (169); Kalender-Titel (356, 409, 473); Notiz-Text `.note-body` (786), Coach-Notiz (2875); Chat `.msg` (2349); Ruhepunkt `.rp` (2141 und 7 weitere); Filter-Kopf h2 (1348). **Außerhalb der Seitenleiste nur 13 Vorkommen.** | ▲ |
| 15px | 99 | 0 | 600 (76), 700 (22) | 21.75 / 16.5 / 24.75 | Satoshi 97, Onest 1 | Karten-Titel `.card-title` (491), `.prop-h` (2607), `.pf-t` (2621), `.cpn-head b` (2647), `.prop-title b` (2692), `.prop-group-title b` (2715), `.nw-next-t b` (3075), `.shadow-intro b` (2395), `.day-card .date` (907); Leer-Titel `.empty b` 700 (677), `.tile .nodata` (1502); großer Knopf `.btn.big` (2530, 2576); Trade-Symbol (890); Filter-Gruppe (1374); Editor-Größenfeld 700 (1093) | ▲ |
| 16px | 119 | 86 (Marke) | 800 (86), 700 (22), 400 (8), 600 (1) | 19.2 / 23.2 / 26.4 / 20.8 / 25.6 / 17.6 | Satoshi 108, Onest 9 | Marke `.brand` 800 (140); Editor-Text (1127, 1903); Widget-Werte 700 `.fw-stats b` (1456), `.stc-col > b` (2967), `.yc.year b` (1690), Tages-P&L (908); Widget-Leer-Titel 600 (1450); Sprach-Karte (1922); Ruhepunkt-Wahl 700 (2187) | ▲ |
| 17px | 1 | 0 | 700 | 24.65 | Onest | News „morgen“ `.nw-next-when b` (3077); h1 Handy (925); `.ce-title` (2874); `.rp-range-val` (2233) | ● |
| 18px | 11 | 0 | 700 (9), 600 (1) | 19.8 / 26.1 | Satoshi | Prop-Saldo klein `.prop-balance .val.sm` (2701); Grab-Ursache (2805); Schieberegler-Wert (815); Editor-Platzhalter (1130); Ruhepunkt h3 (2253), Schließen-× (2331); Leer-Titel Replay (2477); Replay-Urteil (2533); Tagesansicht h2 „Sonntag, 11. Oktober 2026“ 600 (keine CSS-Regel gefunden) | ▲ |
| 18.72px | 1 | 0 | 600 | 30.9 | Satoshi | Notebook: `h3` „Notebook“ ohne Regel (Browser-Standard 1.17 em × 16 px, Zensus notebook) | ● |
| 19px | 1 | 0 | 600 | 27.55 | Satoshi | Vorschau `.pv-h3` (1889); Modal-Titel `.modal-head h2` (831); Seitenpanel h2 (1602); Serien-Ring (1506); Atem-Phase (2293) | ● |
| 20px | 5 | 0 | 600 (2), 700 (2) | 29 / 24 / 22 | Satoshi 3, Onest 1 | Coach/Mentor-Einrichtung h2 (2342, 2894), `.coach-title` (2852); Grab-Kopf (2795); Replay-Symbol (2500); Emoji-Raster (1122); Handy-Werte (2742, 3038) | ▲ |
| 21px | 44 | 43 (h1) | 600 | 30.45 | Satoshi | Seitentitel `.topbar h1` (215); Vers (2257); Coach-Gruppen-Kachelwert (2945); Kachelwert Handy (3027) | |
| 22px | 0 | – | – | – | – | `.stat .v` (649, Kennzahlen-Raster, im Atlas nicht gerendert); Notiztitel (784); Tracker-Score (1679); Kachelwert ≤960 (936) | |
| 24px | 63 | 0 | 700 (57), 600 (2) | 34.8 / 26.4 / 39.6 | Onest 44, Satoshi 15 | **Kachelwert Statistik `.stat-tile .v`** (639); **Prop-Kachelwert** (2684); **Einstellungs-Titel `.set-head h2` 700** (1815); Ruhepunkt-Titel (2194); Serien-Kachel (1644) | ▲ |
| 25px | 28 | 0 | 700 | 27.5 | Onest | **Dashboard-Kachelwert `.tile .val`** (540) – einzige Regel mit 25 px | ■ ▲ |
| 26px | 11 | 0 | 700 | 28.6 / 31.2 / 37.7 | Satoshi | **Prop-Saldo `.prop-balance .val`** (2700, in Satoshi statt Onest); Trade-Detail Symbol/Betrag (747, 748); Ruhepunkt-Frage (2153); großer Avatar (1910); Nummern-Marker (2208) | ▲ |
| 28px | 1 | 0 | 700 | 30.8 | Onest | **Spark-Kachelwert `.tile.spark-tile .val`** (1735, TradeLog) | ■ ● ▲ |
| 30px | 9 | 0 | 700 | 43.5 / 33 | Onest 4, 5 Schriftproben | Score `.score-big` (577); Schriftprobe `.font-card .sample` (1929); Sprach-Timer (2571) | ▲ |
| 32px | 0 | – | – | – | – | `.tilt-stats .v.cur` (1304), `.rp-bigtime` (2303) | |
| 34px | 1 | 0 | 700 | 37.4 | Onest | **Schatten-Ich Hauptwert** (2397); Notiztitel (1014); Replay-Zahl (2540); Fortschritt Handy (1297) | ● ▲ |
| 40px | 0 | – | – | – | – | `.tilt-stats .v` (1303) | ■ |
| 42px | 0 | – | – | – | – | `.streak .big` (798) | ■ |
| 44px | 3 | 0 | 700 | 48.4 | Onest | Fortschritt `.big-stat` „0 Tage“ (1203) | ■ ▲ |
| 48px | 0 | – | – | – | – | Replay-Widget `.fw-big` (1464) | ■ |
| 56px | 0 | – | – | – | – | Replay-Hero `.rh-big` (2460), Handy 46 px (2551) | ■ |

Zusammenfassung: 25 gerenderte Größen, 37 im CSS (ohne Zertifikat-`calc()`-Größen und Editor-`em`). **Elf Stufen unter 16 px in Halbpixel-Schritten (10 / 10.5 / 11 / 11.5 / 12 / 12.5 / 13 / 13.5 / 14 / 14.5 / 15).** Die 12.5-px-Stufe ist mit 72 Regeln die am meisten benutzte Größe im CSS, obwohl sie als Grundschrift nirgends definiert ist.

### 1.3 Rollen mit mehreren Größen

| Rolle | Größen / Gewichte im Einsatz | Belege |
|---|---|---|
| **Kachel-Titel (KPI-Label)** | 13.5/500 `--text-2` (`.tile .head` 517, auch Prop-Streifen) · 13/400 `--text-2` (`.stat-tile .k` 637, `.stat .k` 647) · 12.5/600 (`.fw-lbl` 1463) · 13/600 (`.rh-lbl` 2459) · 11.5/400 `--muted` (`.fw-stats span` 1455) · 11/400 `--muted` (`.day-card .stats .k` 910, `.nb .stats-grid .k` 1035, `.strat-stats .k` 793, `.tilt-stats .k` 1302) · 11/600 uppercase (`.caption` 101, z. B. „DEIN SCORE“, „BALANCE“) | dashboard.png „Netto P&L“ 13.5/500; stats_summary.png „Netto-P&L“ 13/400; prop_cockpit.png „Aktive Konten“ 13.5/500 und „BALANCE“ 11/600 uppercase |
| **Kachel-Wert** | 25/700 (`.tile .val` 540) · 24/700 (`.stat-tile .v` 639, `.prop-tiles` 2684) · 22/700 (`.stat .v` 649) · 21/700 (`.coach-gs-tiles` 2945) · 28/700 (`.spark-tile` 1735) · 26/700 (`.prop-balance .val` 2700) · 34/700 (`.shadow-main` 2397) · 16/700 (`.fw-stats b` 1456, `.stc-col b` 2967) · 14/700 (`.day-card .stats .v` 911) · 13.5/700 (`.nb .stats-grid .v` 1036). Hero-Zahlen: 44 (1203) · 48 (1464) · 56 (2460) · 42 (798) · 40/32 (1303/1304) · 30 (577) · 34 (2540). Handy: 20 (3038), 21 (3027), 22 (936, 2741), 24 (1307), 26 (2446), 30 (1307), 34 (1297) | dashboard.png „893,04 €“ 25 px; stats_summary.png „+893,04 €“ 24 px; prop_cockpit.png „2“ 24 px, „111.262 $“ 26 px |
| **Karten-/Block-Titel** | 15/600 (`.card-title` 491 + 8 Klone) · 14/700 (`.set-block h3` 1818, `.prop-h3` 2718) · 14/600 (`.rp-dlg h3` 2320) · 13/600 (`.nw-dh` 3084) · 13/600 uppercase (`.journal .col h3` 774) · 16/600 (`.fw-empty b` 1450) · 16/700 (`.rp-choice .rp-name` 2187) · 18/700 (`.rp-callout h3` 2253, `.pg-cause b` 2805) · 18/600 (`.rh-empty .card-title` 2477) · 20/700 (`.prop-grave-head b` 2795) | settings_profil.png „Profilbild“/„Privatsphäre“ 14/700 vs. dashboard.png „Gesamt-Score“ 15/600 |
| **Bereichs-/Dialog-Überschrift (h2)** | 24/700 (`.set-head h2` 1815, `.rp-title` 2194) · 20/600 (`.coach-title` 2852, `.mentor-setup h2` 2342, `.coach-join-head h2` 2894) · 19/600 (`.modal-head h2` 831, `.side-panel h2` 1602) · 18/600 (Tagesansicht h2, keine Regel) · 17 (`.ce-title` 2874) · 14.5 (`.fd-pop .sp-head h2` 1348) · 26/700 (`.rp-q` 2153) · 34/700 (`.nb .note-title` 1014) | settings_profil.png „Profil“ 24/700; modal_trade_loggen.png Titel 19/600 |
| **Eyebrow (Abschnittslabel, Großbuchstaben)** | 11/600 .06em (`.caption` 101) · 11/700 .09em (`.nav-title` 167) · 11/700 .06em (`.popover .sec` 341, `.cp-sec` 456, `.nb .sec-h` 975, `.nb-menu .head` 1117, `.sym-cap` 880) · 11.5/700 .06em (`.sp-group` 1605) · 13/600 .06em (`.journal .col h3` 774) · 10.5/600 .16em (`.pg-cause span` 2804) · 11/700 .03em (`.rr-week` 358, `.dp-week` 419) · 11/700 .08em (`.dstreak-steps b` 1265) · 11.5 .1em (`.rp-breath .rp-seg` 2292) | dashboard.png „ÜBERSICHT“ (700) vs. „DEIN SCORE“ (600); pop_zeitraum.png Abschnitte |
| **Formular-Label / Hilfstext** | Label: 12/600 `--muted` (`.field > label` 298) · 12.5/600 `--text-2` (`.fd-l` 1381, `.aff-label` 2668) · 14/600 (`.sr-label` 2405) · 13.5 (`.rp-l` 2224) · 12 (`.nw-fg .lbl` 3081, `.cert-opts .lbl` 1964). Hinweis: 11.5 `--faint` (`.field .hint` 299, `.ed-hint` 1078) · 11/500 `--faint` (`.fd-hint` 1382) · 12 `--muted` (`.small.muted`, 154 Verwendungen im JS) · 12.5 (`.card-sub` 503, `.sr-desc` 2406) · 13 (`.cpn-off` 2648) · 13.5 (`.set-head p` 1816) | settings_profil.png: Feld-Label 12/600, Block-Untertitel 12 /400, Seiten-Untertitel 13.5 |
| **Knopf / Reiter / Segment** | 13.5/500 (`.btn` 267, `.tabs` 660) · 13.5/600 (`.btn.primary` 274, `.btn.accent` 3137, `.rp-btn` 2214, `.prop-tabs a` 2590, `.prop-sub a` 2595) · 14/600 (`.set-tabs` 1867, `.nb .datebtn` 1015) · 13/500 (`.seg button` 318, `.rp-chip` 2244) · 13/600 (`.dp-link` 434, `.more-link` 1659) · 12.5/500 (`.btn.sm` 280, `.seg.pill` 322, `.seg.segc` 2543, `.tabs.sm` 1508) · 12.5/600 (`.fd-seg` 1386, `.fd-tog` 1388, `.fd-chip` 1400, `.fd-add` 1407, `.fd-foot .btn` 1367) · 12 (`.btn.xs` 281) · 11.5 (`.seg.mini` 1585) · 15/500 (`.btn.big` 2530) | stats_summary.png Reiter 13.5/500; prop_cockpit.png Schiene „Übersicht / Auswertung / Konten“ 13.5/600 |
| **Navigation / Listeneintrag** | 14.5/500 (`.nav a` 169) · 14/500 (`.set-nav a` 1807) · 13.5 (`.sb-menu .item` 250) · 13 (`.popover .item` 334) · 13.5/700 (`.nb .note-item b` 1001) | dashboard.png Seitenleiste 14.5 vs. settings_profil.png Einstellungs-Navigation 14 |
| **Tabelle** | Zelle 13/400 Onest (592 + 1800) · Kopf 12/500 `--muted` (593) · Nebenzeile 12 (611) · Symbol 13/700 Satoshi (602) · Handy 12.5 (3056), Affiliate Handy 11/12 (2993, 2994), Letzte Trades Handy 12 (3032) | trades.png, affiliate.png |
| **Fließtext** | 14 (`body` 84, `.mn-text` 2888, `.rules-list` 1273) · 14.5 (`.note-body` 786, `.msg` 2349, `.rp` 2141, `.ce-body` 2875) · 16 (Editor 1127) · 13.5 (`.mr-text` 2921, `.nw-row` 3088, `.coach-co-what` 2953) · 13 (`.rp-choice .rp-desc` 2188) | notebook_notiz.png, mentor.png |

### 1.4 Größen, die nur einmal vorkommen

- Nur **eine CSS-Regel**: 9.5 px (3042), 25 px (540 – der Dashboard-Kachelwert!), 28 px (1735), 40 px (1303), 42 px (798), 44 px (1203), 46 px (2551), 48 px (1464), 56 px (2460).
- Nur **einmal gerendert**: 10 px (Sortierpfeil ▼ als Text, 596), 17 px (3077), 18.72 px (h3 ohne Regel, Notebook), 19 px (Vorschau 1889), 28 px (1735), 34 px (2397).
- Im CSS definiert, im Atlas **nie gerendert**: 22 px, 32 px, 40 px, 42 px, 48 px, 56 px (Kennzahlen-Raster `.stat`, Tilt-Statistik, Serie, Replay-Widget/-Hero).

### 1.5 Gewichte

| Gewicht | Gerendert | CSS-Regeln | Verwendung laut README (Z. 209) | Abweichungen |
|---|---|---|---|---|
| 400 | 847 | 3 explizit (Rest geerbt) | Fließ- und Hilfstext | `.stat-tile .k`, `.stat .k` (KPI-Labels) erben 400, `.tile .head` hat 500 |
| 500 | 1218 | 31 | Steuerelemente (Knöpfe, Reiter, Segmente, Chips, Tabellenköpfe, Kachel-Titel) | – |
| 600 | 575 | 107 | Titel | – |
| 700 | 700 | 109 | nur Werte und Hauptknöpfe | Eyebrows (167, 341, 456, 975, 1117, 1605), `.set-head h2` (1815), `.set-block h3` (1818), `.prop-h3` (2718), `.rp-callout h3` (2253), `.prop-grave-head b` (2795), `.tbl .sym` (602), Avatare (236, 264), Listen-Titel als `b` ohne Gewichtsangabe, also Browser-700 (782, 1001, 1611, 2640), `.empty b` (677), Zähler (1341, 2608, 3100), `.nb-toolbar .sz` (1093), `.dp-day.sel` (426) |
| 600 statt 500 bei Steuerelementen | – | – | – | `.prop-tabs a` (2590), `.prop-sub a` (2595), `.set-tabs button` (1867), `.fd-seg/.fd-tog/.fd-chip/.fd-add` (1386–1407), `.rp-btn` (2214), `.dp-month` (429), `.dp-link` (434), `.nb .datebtn` (1015), `.datepick .dp` (1023), `.add-slot` (1586), `.toast` (898), `.more-link` (1659) |
| 800 | 93 | 4 | – | Marke (140, dokumentiert), Kalender-P&L am PC (721, 2976, README Z. 191 dokumentiert) |
| 650 | 0 | 2 | – | Zertifikat (2007, 2015); Satoshi hat keinen 650er Schnitt → Browser synthetisiert |

### 1.6 Zeilenhöhen

- `body { line-height: 1.45 }` (Z. 84). Daraus entstehen gebrochene Höhen: 13.5 px → 19.575, 12.5 → 18.125, 14.5 → 21.025, 13 → 18.85. Gerendert **49 verschiedene Zeilenhöhen**; CSS setzt `line-height` nur 56-mal mit 16 Werten: 1 (8×), 1.1 (7×, Werte), 1.45 (6×), 1.5 (5×), 1.2 (4×), 1.3 (4×), 1.25 (4×), 1.4 (3×), 1.6 (3×), 1.55 (3×), 1.65 (2×), 1.05 (2×), 1.7 (2×), 1.02, 1.35, 16px.
- Fließtext hat vier Zeilenhöhen: 1.45 (body), 1.55 (`.rp` 2141, `.msg` 2349, `.mn-text` 2888), 1.6 (`.ce-body` 2876, `ol.rp-visual` 2206), 1.65 (`.note-body` 786, `.ql-editor` 1128), 1.7 (`.rp-guide` 2203).
- Werte haben drei: 1 (`.badge`, `.streak .big`), 1.05 (`.fw-big`, `.rh-big`), 1.1 (`.tile .val`, `.big-stat`, `.prop-balance .val`).
- Folge für Steuerelemente: keine ganzzahligen Höhen (siehe 5.1), Zeilen im Raster verschieben sich um Bruchteile.

### 1.7 Laufweiten und Großbuchstaben

- 28 Laufweiten im CSS, 29 gerendert. Uppercase 21 Regeln, 291 gerenderte Texte.
- Werte: `-0.01em` (h1–h4 Z. 90, `.stat-tile .v`, `.stat .v`, `.set-head h2`), `-0.02em` (`.tile .val`, `.note-title`, `.spark-tile`, `.prop-balance`), `-0.03em` (`.big-stat`, `.fw-big`, `.rh-big`), `-.025em`/`-.035em` (Zertifikat). Drei Werte für dieselbe Rolle (Kachelwert).
- Eyebrows: `.03em`, `.04em`, `.06em`, `.08em`, `.09em`, `.1em`, `.12em`, `.16em`, `.5em` (`.pg-rip`). Für eine Rolle vier bis fünf Werte (siehe 1.3).
- `.fd-tog.stars button { letter-spacing: -1px }` (1390) – einziger Pixelwert.

---

## 2. Abstandsskala

### 2.1 Einzelwerte über gap / padding / margin (CSS, alle Deklarationen zerlegt)

| Wert | Vorkommen | Raster | Typische Stellen |
|---|---|---|---|
| 1px | 14 | – | `.sb-who` gap (242), `.nav .badge-n` (186), `.nw-v` (3104) |
| 2px | 99 | 2-px | Schienen-Innenabstand (1585, 2542), Kalender-Lücken (414, 418), `.note-title` (1014), Fokus-Luft |
| 3px | 36 | **ungerade** | `.nav` gap (164), `.pill` (545), Schienen (2542, 2590, 1385), `.card-sub` mt (503), `.set-row .switch` mt (1864) |
| 4px | 112 | 4-px | `.sidebar` gap, `.tile .foot` mt, `.rating` gap |
| 5px | 25 | **ungerade** | `.pill` gap, `.dp-title` gap, `.bar-row` gap (655), `.cpn` gap (2645) |
| 6px | 151 | 2-px | `.field` gap (297), `.seg` gap (317), `.popover` padding (329), `.chips` gap, `.btn.icon.sm` |
| 7px | 32 | **ungerade** | `.tile` gap (515), `.btn.sm` (280), `.prop-tabs a` (2590), `.seg.segc button` (2543), `.tabs.sm` (1508), `.nb .datebtn` (1015) |
| 8px | 222 | 4-px | `.btn` gap, `.tabs` gap, `.card-title` gap, `.nav a` vertikal |
| 9px | 26 | **ungerade** | `.seg button` (318), `.popover .item` (334), `.sb-user` (233), `.btn.icon` (282), `.chip.sel.big` (1879), `.theme-card` gap (1836), `.nb .folder` (978) |
| 10px | 197 | 2-px | `.row`/`.stack` gap (127, 129), `.input` vertikal (289), `.btn` vertikal (267), `.tabs button` vertikal (660), `.modal-foot` gap, `.topbar .actions` gap |
| 11px | 14 | **ungerade** | `.btn.sm` horizontal (280), `.set-nav a` vertikal (1807), `#tip` (693), `.nw-dh` (3084), `.btn.fw-reset` (1492), `.fd-chip` (1400) |
| 12px | 148 | 4-px | `.topbar` gap, `.input` horizontal, `.card-head` gap, `.form-grid`, `.stat-tiles` Handy |
| 13px | 4 | **ungerade** | `.tbl th` vertikal (593), `.fd-gh` (1374) |
| 14px | 108 | 2-px | `.nav a` gap (169), `.stat-tiles` gap (635), `.card-head` mb (490), `.legend` gap, `.tbl th/td` horizontal (593, 597), `.form-grid` Spalte, `.banner` vertikal |
| 15px | 1 | **ungerade** | `.tile` horizontal (515) |
| 16px | 79 | 4-px | `.btn` horizontal, `.nav a` horizontal, `.modal` gap, `.card.tight` horizontal |
| 18px | 50 | 2-px | `.content` gap (230), `.grid` gap (505), `.card` vertikal (485), `.set-block` vertikal (1817), `.stat-tile` horizontal (636) |
| 20px | 33 | 4-px | `.card` horizontal (485), `.kstrip .tile` horizontal (2602), `.modal-bg` padding |
| 22px | 25 | 2-px | `.content` oben (230), `.sidebar` oben (137), `.modal` vertikal (827), `.set-body` gap (1813), `.set-tabs` gap (1866), `.prop-sub` gap (2595), `.serie` gap |
| 24px | 11 | 4-px | `--gutter`, `.modal` horizontal, `.nw-filters` |
| 26px | 11 | 2-px | `.nav.nav-group + .nav.nav-group` mt (166), `.rr-months` gap (355), `.replay-hero` (2456), `.prop-graves` |
| 28px | 13 | 4-px | `.settings` gap (1805), `.rh-main` gap (2457), `.nb .note-head` horizontal (1013) |
| 30–38px | 9 | gemischt | `.select` rechts 30 (296), `.input[type=date]` rechts 38 (392), `.nb-search` links 36 (951) |
| 40–60px | 15 | 4-px | `.empty` 40/20 (675), `.content` unten 60 (230) |

Verteilung: **auf dem 4-px-Raster ≈ 638 Werte (45 %), nur auf dem 2-px-Raster ≈ 649 (45 %), ungerade ≈ 138 (10 %).** Die App fährt faktisch zwei gleich starke Skalen: 8/12/16/20/24 und 6/10/14/18/22. Dazu die ungeraden 3/5/7/9/11/13/15 vor allem bei kleinen Steuerelementen (Pillen, Segmente, kleine Knöpfe).

### 2.2 Gerenderte gap-Werte (Zensus, Top)

8px 765 · 14px 612 · 12px 382 · 3px 206 · 10px 198 · 6px 116 · 5px 90 · 4px 86 · 18px 84 · 2px 68 · 7px 56 · 12px 14px 50 · 10px 16px 45 · 1px 44 · 22px 19 · 28px 13 · 16px 11 · 9px 10. Insgesamt 31 verschiedene gap-Werte.

### 2.3 Gerenderte Paddings (Zensus, Top)

`8px 16px` 528 (Navigation) · `10px 16px` 241 (Knöpfe) · `0 16px 8px` 176 (Gruppentitel) · `11px 12px` 156 (Einstellungs-Navigation) · `18px 20px` 111 (Karten) · `7px 11px` 65 (kleine Knöpfe) · `7px 0` 35 · `8px` 35 · `10px 10px` 30 · `12px 15px` 29 (Kacheln) · `8px 0 0` 27 · `14px 16px` 25 · `16px 20px` 25 (Prop-Streifen) · `4px 10px` 23 (Chips) · `6px` 23 · `7px 14px` 22 (Schienen-Knöpfe) · `10px 12px` 22 (Eingaben). **106 verschiedene Padding-Kombinationen** in 44 Ansichten.

### 2.4 Innenabstände der Container

| Container | Padding | Zeile |
|---|---|---|
| `.card` | 18px 20px | 485 |
| `.card.tight` | 14px 16px | 487 |
| `.tile` | **12px 15px 12px** | 515 |
| `.stat-tile` | 16px 18px | 636 |
| `.stat` (Raster) | 16px 18px | 646 |
| `.kstrip .tile` (Prop-Streifen) | 16px 20px | 2602 |
| `.set-block` | 18px 20px | 1817 |
| `.cpn` (Coupon) | 18px 20px | 2645 |
| `.aff-ticket` | 16px 18px | 2667 |
| `.coach-entry` | 16px 18px | 2870 |
| `.nw-next` | 16px 18px | 3070 |
| `.rp-choice` | 16px 18px | 2156 |
| `.banner` | 14px 16px | 662 |
| `.shadow-rule` | 14px 16px | 2401 |
| `.prop-entry` | 14px | 2681 |
| `.nw-banner` | 12px 16px | 3064 |
| `.coach-invite` | 12px 14px | 2863 |
| `.sp-item` | 12px | 1607 |
| `.modal` | 22px 24px | 827 |
| `.popover` | 6px | 329 |
| `.popover.dp` | 12px 12px 10px | 406 |
| `.fd-pop` | 10px 12px 0 | 1345 |
| `.side-panel` | 20px | 1598 |
| `.content` | 22px 24px 60px | 230 |
| `.sidebar` | 22px 14px 18px | 137 |
| `.topbar` | 12px 24px | 211 |
| `.empty` | 40px 20px | 675 |

Fünf verschiedene Innenabstände für „Karte“ (18/20, 16/18, 16/20, 14/16, 12/15).

### 2.5 Raster-Lücken

`.content` 18 (230) · `.grid` 18 (505) · `.stat-tiles` 14 (635) · `.shadow-rules` 10 (2400) · `.cpn-grid` 14 · `.design-grid` 14 (1823) · `.form-grid` 12/14 (300) · `.settings` 28 (1805) · `.set-body` 22 (1813) · `.coach-wrap` 16 (2849) · `.nw-wrap` 16 (3063) · `.nw-list` 14 · `.aff` 16 · `.coach-entries` 14 (2869) · `.rh-main` 28 · Handy `.dash-top` 12 (3024), `.stat-tiles` 10 (3036). Sieben Werte (10, 12, 14, 16, 18, 22, 28) für „Abstand zwischen Karten“.

---

## 3. Radien, Rahmen, Schatten

### 3.1 Radien

| Wert | CSS-Deklarationen | Gerendert | Wo |
|---|---|---|---|
| 999px / 50% | 48 / 26 | 235 / 2 | Pillen, Avatare, Punkte, Schalter, Toast, `.btn.round` |
| 16px | 2 | 3 | `.modal` (827), `.rp-choice .rp-icon` (2161) |
| 14px (`var(--radius)`) | 17 | 257 | `.card`, `.tile`, `.tbl-wrap`, `.set-block`, `.popover.dp/.cp`, `.prop-fold`, `.cpn` |
| 14px literal | 13 | (in 257) | `.sb-user` (233), `.stat-tile` (636), `.fd-group` (1373), `.rep-panel` (1700), `.tc-prev` (1839), `.nw-day` (3083), `.nw-next` (3070) |
| 12px | 34 | 931 | `.nav a` (169), `.btn` (267), `.popover` (329), `.tabs button` (660), `.banner` (662), `.modal`-Innen, `.prop-tabs` (2588), `.sp-item` (1607), `.dropzone` (749), `.shadow-rule` (2401), `.coach-invite` |
| 11px | 3 | 1 | `.dir-switch` (850), `.seg.segc` (2542), `.nw-next-ico` (3071) |
| 10px (`--radius-sm`) | 36 + 3 | 255 | `.input/.select` (289), `.seg button` (318), `.set-nav a` (1807), `.dp-month` (429), `.cp-sv` (441), `.sr-num` (2410), `.mentor-note` (2884), `.tpl-menu` (1632), `.coach-radio` (2902), `.cpn-code` (2649), `.fd-seg` (1385) |
| 9px | 24 | 180 | `.btn.sm` (280), `.sb-toggle` (160), `.rr-day` (360), `.dp-day` (420), `.card-ico` (501), `#tip` (693), `.tabs.sm` (1508), `.prop-tabs a` (2590), `.nb .datebtn` (1015), `.select.sm` (1653), `.dir-opt` (862) |
| 8px | 29 | 394 | `.popover .item` (334), `.dp-title` (409), `.dp-nav` (415), `.seg.segc button` (2543), `.seg.mini` (1585), `.fd-tog` (1388), `.fd-chip` (1400), `.cal.mini .d` (729), `.mn-reply` (2915), `.pair-card .pv i` (1947) |
| 7px (`--radius-xs`, **0 Verwendungen**) | 7 | 5 | `.btn.xs` (281), `.exc-bar` (763), `.fd-seg button` (1386), `.fd-tog` im Fenster (1363), `.aff-code` (2670) |
| 6px | 17 | 10 | `.rating button` (324), `.cp-hue` (443), Checkbox-Kasten (801, 2929), `.nb-toolbar .sz` (1093), `.fd-seg` im Fenster (1362), `.nw-cur` (3100), `.fd-chip button` (1404) |
| 5px | 1 | 0 | `.tracker i` (1665) |
| 4px | 19 | 51 | Fortschrittsbalken (554, 559, 657, 811), `.nb-figure .rs::before` (1163) |
| 3px / 2px / 1.5px / 1px | 10 / 5 / 1 / 2 | 6 / 9 / 0 / 0 | Balken, Unterstriche, Marker |
| 20px 20px 0 0 | 1 | – | Bottom-Sheet (3059) |

Befund: Sieben Flächenradien in Gebrauch (6, 7, 8, 9, 10, 12, 14) plus 11 und 16. Die drei Tokens decken das nicht ab: `--radius` 17×, `--radius-sm` 3×, `--radius-xs` 0×; literale 10 px 36×, 9 px 24×, 8 px 29×, 12 px 34×. Knopf (12) und Eingabe (10) haben nebeneinander verschiedene Ecken (dashboard.png Kopfzeile: Knöpfe 12, Avatar rund; modal_trade_loggen.png: Felder 10 neben Knöpfen 12).

### 3.2 Rahmen

| Deklaration | CSS | Gerendert (Zensus) | Wo |
|---|---|---|---|
| `1px solid var(--border)` (#262522) | 134 | 788 | Karten, Kacheln, Trennlinien, Tabellenzeilen, Reiter |
| `1px solid var(--border-2)` (#34322e) | 42 | 369 | Knöpfe, Eingaben, Popover, Modal, Segmente, Konto-Karte |
| `1px solid transparent` | 13 | 697 | Navigation, Chips, Ordner, Ghost-Knöpfe (Platzhalter für Hover/Auswahl) |
| `1px dashed var(--border-2)` | 8 | – | Tag hinzufügen, Palette, `.dashed`, `.fd-add`, Coupon-Code (2649), Affiliate-Code (2670) |
| `1.5px dashed var(--border-2)` | 3 | – | Dropzone (749), Replay-Slot (1486), `.add-slot` (1586) |
| `1.5px solid var(--border-2)` | 3 | – | Checkbox-Kästen (801, 1004, 2929) |
| `2px solid …` | 6 | – | `.set-tabs` Unterstrich (1867), Log-Marker (1875), Ruhepunkt-Callout (2251), `.dstreak-track i` (1258), `.nb-figure` (1163) |
| `3px solid …` | 5 | 11 (Punkte) | Notebook-Ordnerbalken `--fc` (978), Blockquote Akzent (1137), Replay-Ergebnis `--profit` (2531), Farb-Punkte `--surface` (1935, 1953), `.mentor-note::before` 3 px Streifen (2885) |
| `4px solid …` | 3 | – | Serien-Ring `--profit` (1506), Schieber-Knopf (812, 813) |
| `border-color: var(--accent)` | 21 | 19 (`.btn.primary`) | siehe 6, A12 |
| `border-color: var(--loss)` | 8 | 6 (`.btn.danger`) | |
| color-mix-Ränder (Auswahl, Gewinn/Verlust, Warnung) | 15 | 41 + 7 + 8 + … | Z. 710, 711, 1246, 1401–1403, 1693–1695, 2158, 2402, 2871, 2903, 3068, 3128 |

Rahmenfarben hell: `--border` #e1e6e2, `--border-2` #cfd6d1 (kühl-grünlich, siehe 4.1). Regelscanner meldet vier „side-tab“-Streifen: 978, 1137, 2251, 2531, 2885 (3 px bzw. 2 px Farbbalken links).

### 3.3 Schatten

| Wert | CSS | Gerendert | Wo |
|---|---|---|---|
| `var(--shadow)` 0 18px 50px rgba(0,0,0,.55) | 15 | (Overlays nicht im Zensus) | Popover, Modal, Tooltip, Toast, Seitenleiste mobil, Symbol-Menü, Filter-Fenster, Seitenpanel |
| `var(--lift-shadow)` 0 14px 28px -20px rgba(0,0,0,.7) | 1 | – | `.tile:hover, .stat-tile:hover` (516) |
| `var(--dot-glow)` | 4 | – | Balken am aktiven Eintrag (181), Hinweis-Punkte (184, 240, 252) – dokumentiert |
| `inset 0 0 0 1px var(--border-2)` | 5 | 60 | Avatar klein (236), Schalter (306), großer Avatar (1910), Konfidenz-Balken (2512) |
| `0 0 0 1px var(--border-2)` | 3 | 54 | Avatar (264), Farb-Punkte (1935, 1953) |
| `inset 0 1px 0 rgba(255,255,255,.04)` | 1 | 40 | `.btn.accent` „Trade loggen“ (3142) – dokumentiert („Hauch Licht“) |
| Hell: `.card, .tile` 0 1px 2px rgba(0,0,0,.03), 0 6px 18px rgba(20,30,24,.06) | 1 | – | 1499 |
| Fokus 0 0 0 3px `--accent-soft` | 6 | – | Eingabe-Fokus (293), Schalter (315), Kalender (426), Hex-Feld (451), Schieber (814), Prop-Ampel grün (2695) |
| Auswahl 0 0 0 2px `--accent` | 4 | – | Kalender-Tag (713), Heute-Marker (1292, 1672, 1771) |
| Auswahl 0 0 0 2px `--text` | 2 | 1 | Farb-Punkt (1937), Farbwähler (1954) |
| Auswahl 3px Surface + 4.5px Text 85 % | 2 | 1 | Design-Karte (1830), Theme-Karte (1841) |
| Inset 1.5px `--accent` | 2 | – | Zeitraum-Vorschau (373), Kalender-Rand (425) |
| Akzent-Glows (gegen „kein Schein“) | 7 | – | `.btn.primary:hover` 0 8px 20px -10px `--accent-glow` (275); Schieber-Knopf 0 0 14px -2px (812); `.dir-opt` gedrückt 0 0 10px (869); Handy-„Trade loggen“ 0 14px 30px -8px (3019); Konfidenz-Balken (2514, 2524); Serie Stufe 2/3 (1247, 1261, 1262, dokumentiert) |
| `.seg.segc button[aria-pressed]` 0 1px 2px rgba(0,0,0,.25) + inset Rand | 1 | – | 2545 – überschreibt die globale flache Regel (3125–3130) durch höhere Spezifität |
| Ruhepunkt-Glows (`--phase`) | 6 | – | 2248, 2274, 2276, 2282 – bewusste Atmosphäre des Bereichs |
| `.kstrip .tile` Hairlines -1px 0 0 / 0 -1px 0 `--border` | 2 | 21 | 2602, 2603 |

66 verschiedene Schatten-Deklarationen, davon 15 über Token. **Fünf verschiedene Fokus-/Auswahlringe** (outline 2 px Akzent mit Offset 2 – 11×; 0 0 0 3px Akzent-soft; 0 0 0 2px Akzent; inset 1.5 px Akzent; 0 0 0 2px Text).

---

## 4. Farben

### 4.1 Tokens (`:root`, Z. 7–53; hell Z. 54–73; Schwarz Z. 76–80)

| Token | Dunkel (Graphit) | Hell | Schwarz | Verwendungen |
|---|---|---|---|---|
| `--bg` | #0e0d0b | #f5f7f5 | #000000 | 9 |
| `--bg-2` | #151412 | #eef1ee | #070907 | 2 |
| `--surface` | #1a1917 | #ffffff | #0b0d0c | 91 |
| `--surface-2` | #22211f | #f3f5f3 | #121513 | 111 |
| `--surface-3` | #2b2a26 | #e9ede9 | #191d1a | 55 |
| `--border` | #262522 | #e1e6e2 | #1f2622 | 162 |
| `--border-2` | #34322e | #cfd6d1 | #2b332e | 98 |
| `--field` | #121110 | #ffffff | #0b0d0c | 5 |
| `--ambient` | radial-gradient … rgba(255,238,218,.045) | none | none | 1 |
| `--sheen` | rgba(255,255,255,.055) | rgba(255,255,255,.75) | – | 1 |
| `--text` | #f2f0ec | #0d130f | #f2f5f3 | 136 |
| `--text-2` | #bcb8b1 | #3d463f | #b4bdb7 | 96 |
| `--muted` | #8a867f | #6a746d | #7d877f | 171 |
| `--faint` | #4f4c47 | #b0b8b2 | #4d564f | 21 |
| `--accent` | #34f58a | #0fb862 | – | 186 |
| `--accent-2` | #1fd873 | #0a9a52 | – | 5 (nur Hover von `.btn.primary`/Schalter) |
| `--accent-ink` | #04140a | #ffffff | – | 13 |
| `--accent-soft` | rgba(52,245,138,.12) | rgba(15,184,98,.12) | – | 34 |
| `--accent-glow` | rgba(52,245,138,.28) | rgba(15,184,98,.22) | – | 13 |
| `--dot-glow` | 2 Glows aus `--accent` | – | – | 4 |
| `--profit` | #34f58a (= `--accent`) | #0fb862 | – | 19 |
| `--loss` | #ff5c5c | #e03e3e | – | 55 |
| `--loss-soft` | rgba(255,92,92,.14) | rgba(224,62,62,.12) | – | 9 |
| `--be` | #8b7cf6 | #6b5bd6 | – | 13 |
| `--be-soft` | rgba(139,124,246,.16) | rgba(107,91,214,.14) | – | 2 |
| `--warn` | #f5b93a | #d99a12 | – | 38 |
| `--warn-soft` | rgba(245,185,58,.14) | rgba(217,154,18,.14) | – | 4 |
| `--info` | #5cb8ff | #2b8fe0 | – | 1 (`.pill.open` 551) |
| `--shadow` | 0 18px 50px rgba(0,0,0,.55) | 0 18px 50px rgba(20,30,24,.14) | – | 15 |
| `--lift-shadow` | 0 14px 28px -20px rgba(0,0,0,.7) | rgba(20,30,24,.35) | – | 1 |
| `--radius` / `-sm` / `-xs` | 14px / 10px / 7px | | | 17 / 3 / **0** |
| `--dur-1/2/3`, `--ease`, `--ease-in`, `--ease-io` | 150/240/380 ms | | | 110 / 61 / 8, 182 / 4 / 2 |
| `--sidebar-w`, `--topbar-h`, `--page-head-h`, `--gutter` | 232 / 72 / 64 / 24 px | | | 1 / 6 / 3 / 7 |
| `--sb-thumb` (Z. 125) | color-mix(text 16 %) | | | 1 |

Gerenderte Textfarben (Zensus): `--text` 1146, `--text-2` 1007, `--muted` 940, `--accent` 109 + color-mix 47, `--loss` 118 + 8, `--accent-ink` 32, `--faint` 19, `--be` 3, `--warn` 2, `--info` 2. Hintergründe: `--surface` 560, `--surface-2` 468, `--surface-3` 171, `--bg` 42, Kopfzeile rgba 82 % 44, Akzent 59, Verlust 9.

Beobachtungen zu den Tokens:
- **Hell ist nicht das warme Gegenstück zu Graphit.** Dunkel: warm (#0e0d0b, #f2f0ec, #8a867f, Ambient rgba(255,238,218)). Hell: kühl-grünlich (#f5f7f5, #e1e6e2, #0d130f, #6a746d, #b0b8b2; Schatten rgba(20,30,24)). Der Schwarz-Modus ist ebenfalls grünlich (#121513, #1f2622, #b4bdb7).
- `--accent` und `--profit` haben denselben Wert, werden aber vermischt: Gewinn-Elemente nutzen `--accent`/`--accent-soft` (`.pill.win` 546, `.prop-ampel.gruen` 2695, `.cal .d.win`? nein: `--profit`). Einstellungen → Design erlaubt getrennte Akzent- und Gewinnfarbe (README Z. 171); eine andere Akzentfarbe färbt dann Gewinn-Pillen um.
- `--faint` (#4f4c47 auf #1a1917 ≈ 2.1:1; hell #b0b8b2 auf #fff ≈ 2.1:1) wird für lesbaren Text benutzt: `.field .hint` 11.5 px (299), `.ed-hint` (1078), `.fd-hint` 11 px (1382), `.stc-l small` (2966), `.dstreak.s0` (1221), `.mono`? nein. Der Regelscanner meldet dazu passend #8a867f auf Weiß 3.6:1 (nur in `index.html`).
- `--font-display` = `--font` (siehe 1.1). `--radius-xs` ungenutzt. `--info` einmal, zusätzlich als Rohwert dupliziert (`--rp-dawn: #5cb8ff`, 2141).
- Tokens, die nur in `:root` stehen und nirgends als Komponenten-Token (Höhe, Abstand, Schriftgröße) existieren: es gibt **keine** Tokens für Schriftgrößen, Abstände, Steuerelement-Höhen oder z-index.

### 4.2 Rohfarben außerhalb von `:root` (alle, mit Zeile)

Gruppe A – Theme-Blöcke und bewusst feste Paletten (keine Anomalie):
- 57–62: helles Design in `@media (prefers-color-scheme: light)` (Duplikat von 65–73).
- 76–79: Variante „Schwarz“ (#000000, #070907, #0b0d0c, #121513, #191d1a, #1f2622, #2b332e, #f2f5f3, #b4bdb7, #7d877f, #4d564f).
- 1860–1862: Theme-Vorschaukarten (Graphit #1e1d1a/#0e0d0b/#151412/#1c1b19/#2f2d29/#3d3b36/#2a2926; Schwarz #0c0e0d/#000000/#060807/#0d0f0e/#1f2622/#2b332e/#171b18; Hell #eef1ee/#d9dfda/#f3f5f3/#ffffff/#cfd6d1/#d3d9d4/#edf0ed). Hinweis: Graphit-Vorschau #1e1d1a/#1c1b19/#2f2d29 weicht von den echten Tokens #1a1917/#22211f/#262522 ab.
- 1977–1983, 1990: Zertifikat „Navy“ (#070a19, #f1f3fb, #8f98c6, rgba(241,243,251,.78), rgba(208,215,255,.6/.16), rgba(52,84,196,.6), rgba(64,92,200,.45), rgba(120,148,255,.14), rgba(0,0,0,.32), rgba(130,150,255,.05), #8e98d0, #f3f4fc, #df8592, #f9e5e8) und „App“ (#0e0d0b, #f2f0ec, #bcb8b1, #8a867f, #262522, #1a1917, #2b2a26, rgba(255,238,218,.07)) – das Zertifikat ist immer dunkel, unabhängig vom Design.
- 2141–2142: Ruhepunkt-Palette (`--rp-dawn` #5cb8ff / hell #2a6fb8, `--rp-brick` hell #c73a3a, `--rp-on-phase` #04140a / hell #ffffff, `--rp-amber` Fallback #f5b93a).
- 2122–2127: Ruhepunkt-Ambiente rgba(92,184,255,.26), rgba(255,160,196,.15), rgba(139,124,246,.16); hell rgba(42,111,184,.16), rgba(226,110,156,.12), rgba(107,91,214,.12).
- 2770, 2826–2834: Friedhof-Illustration (rgba(255,255,255,.07), rgba(0,0,0,.6), #fff3dc, #fff4da, #fffef6, rgba(90,130,255,.5), #2a211b, rgba(255,166,78,.22/.17)); 2838–2839 hell.
- 1196–1197: Druck (#fff, #000).
- 442–445: Farbwähler (Schwarz-/Weiß-/Hue-Verläufe, Knopf #fff mit rgba(0,0,0,.45)).
- 842: `@property --dir-c initial-value: #34f58a` (kann kein `var()` enthalten).

Gruppe B – Overlays/Schatten in Schwarz oder Weiß (vertretbar, aber im hellen Design teils zu hart):
- 200 rgba(0,0,0,.28) Theme-Toggle-Knopf (hell: 201 rgba(20,30,24,.14)).
- 312 `#ffffff` + rgba(0,0,0,.25) Schalter-Knopf an.
- 575 rgba(0,0,0,.35) Score-Knopf; 582 rgba(0,0,0,.25) Swatch-Rand.
- 757 rgba(0,0,0,.86) Lightbox; 824 rgba(0,0,0,.6) Modal; 921 rgba(0,0,0,.55) Scrim; 1597 rgba(0,0,0,.45) Panel.
- 1163 rgba(0,0,0,.35); 1169 rgba(0,0,0,.7) + #fff Bildgrößen-Chip.
- 1218, 1229 #fff Flammenkern.
- 1499 rgba(0,0,0,.03), rgba(20,30,24,.06) Karten hell.
- 1529 #000 (Spinner-Maske); 2276 #ffffff/#000000 (Tide-Maske).
- 1841 rgba(0,0,0,.6), 1843 rgba(0,0,0,.55), 1856 rgba(0,0,0,.55) + #fff Theme-Karte.
- 1912 rgba(0,0,0,.45) + #fff Avatar-Kamera.
- 2107 rgba(0,0,0,.22), 2108 hell rgba(160,60,100,.16) Ruhepunkt-Blüte.
- 2545 rgba(0,0,0,.25) Schienen-Knopf gedrückt (siehe 3.3).
- 2771 rgba(0,0,0,.35) Grabstein.
- 3019 rgba(0,0,0,.35) Handy-Knopf; 3142 rgba(255,255,255,.04), 3144 rgba(255,255,255,.7) `.btn.accent`.

Gruppe C – echte Abweichungen von den Tokens:
| Zeile | Wert | Stelle | Problem |
|---|---|---|---|
| 296 | `%238b948e` in Data-URI | `.select` Pfeil | fester Grauton #8b948e, nicht `--muted` (#8a867f dunkel / #6a746d hell); ändert sich im hellen Design nicht |
| 392 | `%238b948e` in Data-URI | Datumsfelder Kalender-Symbol | wie oben |
| 1947 | `color: #04140a` | `.pair-card .pv i` (Schrift-Paar-Vorschau) | ist `--accent-ink` dunkel; hell ist `--accent-ink` #ffffff → Vorschau weicht ab |
| 2141 | `--rp-on-phase: #04140a` | Ruhepunkt Primärknopf | wie 1947 (hell über 2142 korrigiert, aber doppelt gepflegt) |
| 441 | inset rgba(255,255,255,.06) | Farbfläche Picker | im hellen Design unsichtbar |
| 449, 459 | inset rgba(255,255,255,.12) | Farb-Vorschau, Farb-Chips | im hellen Design unsichtbar (weiß auf weiß) |
| 1109 | rgba(255,255,255,.12) | Editor-Palette | wie oben |
| 465 | `#fff` | `.cp-x:hover` auf `--loss` | sollte `--accent-ink`/weiß-Token sein; hell ok, dunkel hart |
| 871 | `#fff` | Richtungs-Symbol hell | festes Weiß statt `--accent-ink` |
| 582 | rgba(0,0,0,.25) | Swatch-Rand | dunkel kaum sichtbar, hell hart |

### 4.3 Farben in JS (zur Kenntnis)

Der Zensus zeigt feste Diagramm-/Kategorie-Hintergründe aus dem JS: #f97316, #facc15, #22d3ee, #3b82f6, #7b61ff, #ec4899, #e5e7eb, #6b6b6b, #9aa3a0 (Kategorie-Punkte in Einstellungen → Inhalte und Farbwähler-Vorgaben). Nicht Teil des CSS-Inventars, aber: diese Vorgaben sind Tailwind-Standardfarben, nicht aus der App-Palette abgeleitet.

---

## 5. Komponenten-Varianten (Maße aus dem CSS)

Höhen berechnet mit `line-height 1.45` (geerbt), sofern keine feste Höhe gesetzt ist.

### 5.1 Knöpfe `.btn` (Z. 266–286, 1328, 3137–3144)

| Variante | Padding | Schrift | Radius | Rahmen / Fläche | Höhe | Zeile |
|---|---|---|---|---|---|---|
| `.btn` | 10px 16px | 13.5/500 | 12 | `--border-2` / `--surface`; Hover `--surface-2`, translateY(-1px) | **41.6** | 267, 272 |
| `.btn.primary` | wie `.btn` | 13.5/600 | 12 | `--accent` / `--accent`, Schrift `--accent-ink`; Hover `--accent-2` + Glow (275) | 41.6 | 274 |
| `.btn.accent` („Trade loggen“) | wie `.btn` | 13.5/600 | 12 | Rand-Verlauf aus Akzent, innen `--surface` + Lichtfleck, Schrift Akzent 88 % | 41.6 | 3137 |
| `.btn.danger` | wie `.btn` | 13.5/500 | 12 | `--loss` / transparent; Hover `--loss-soft` | 41.6 | 276 |
| `.btn.ghost` | wie `.btn` | 13.5/500 `--text-2` | 12 | transparent; Hover `--surface-2` | 41.6 | 278 |
| `.btn.sm` | 7px 11px | 12.5 | 9 | wie Basis | **34.1** | 280 |
| `.btn.xs` | 4px 8px | 12 | 7 | | **27.4** | 281 |
| `.btn.icon` | 9px | – (SVG 16) | 12 | | **36** | 282 |
| `.btn.icon.sm` | 6px | – | 12 | | 30 | 283 |
| `.btn.round` | 0, 36×36 | – | 999 | | 36 | 284 |
| `.btn.icon-only` | 0 seitlich, Breite 40 | | 12 | | 41.6 | 1328 |
| `.btn.big` (Replay, Sprache) | wie `.btn` | 15 | 12 | | 43.75 | 2530, 2576 |
| `.btn.fw-reset` / `.fw-go` | 11px 14px / 11px 16px | 13.5 | 12 | | 43.6 | 1492, 1470 |
| `.fd-pop .fd-foot .btn` | 7px 10px | 12.5 | 12 (geerbt) | | 34.1 | 1367 |
| `.tracker-foot > .btn` | 8px 12px | 12.5 | 12 | | 36.1 | 1678 |
| `.rp-btn` (eigenes System) | 10px 16px, min-height 40 | 13.5/600 | 12 | `--border-2` / `--surface`; primary `--phase` | 40 | 2214 |
| `.dash-head .tl` Handy | 54×54 | – | 999 | Akzent + Glow | 54 | 3019 |
| `:disabled` | opacity .5 | | | | | 286 |

Zähler im Knopf `.btn .cntb`: 18 px hoch, 11/700, `--text` auf `--bg` (invertiert), 1341.

### 5.2 Eingaben `.input`, `.select`, `.field` (Z. 289–316, 392, 1653, 2410–2429)

| Element | Padding / Höhe | Schrift | Radius | Rahmen / Fläche | Zeile |
|---|---|---|---|---|---|
| `.input`, `.select`, `textarea.input` | 10px 12px → **41.6** | 13.5 | 10 | `--border-2` / `--field` (#121110); Fokus Rand `--accent` + 0 0 0 3px `--accent-soft`; Placeholder `--faint` | 289–294 |
| `textarea.input` | min-height 90, lh 1.5 | | | | 295 |
| `.select` | rechts 30, Pfeil-SVG #8b948e bei right 11px | | | | 296 |
| `.input[type=date|datetime-local|month]` | rechts 38, Kalender-SVG #8b948e | | | | 392 |
| `.select.sm` | 6px 28px 6px 10px → **32.1** | 12.5 | 9 | | 1653 |
| `.sr-num` (Zahl + Einheit) | Höhe **36** | 13.5/600 | 10 | `--border-2` / `--field` | 2410–2419 |
| `.sr-unit`, `.sr-time` | Höhe 36, 0 30px 0 12px / 0 10px | 13 | | | 2428, 2429 |
| `.fd-pair .input`, `.fd-unit` | Höhe 36, 0 10px | 13 | | | 1396, 1397 |
| `.fd-pop .fd-pair .input` | Höhe 32 | 12.5 | | | 1365 |
| `.fd-drop .q .input` | Höhe 34, ohne Rand | | | | 1413 |
| `.cp-hex` | Höhe 34, 0 10px | | 10 | | 450 |
| `.sym-new .input` | 7px 10px | uppercase | | | 888 |
| `.input-unit .input` | links 48, Breite 160 | | | | 1882 |
| `.coach-invite .input` | | 12.5 Onest | | | 2864 |
| `.field` | Spalte, gap 6 | | | | 297 |
| `.field > label, .lbl` | | 12/600 `--muted` | | | 298 |
| `.field .hint` | | 11.5 `--faint` | | | 299 |
| `.form-grid` | gap 12px 14px, Spalten ≥180 | | | | 300 |
| `.check` | gap 8, Box 16×16 `accent-color` | 13 | | | 302, 303 |
| `.switch` | 36×20, Knopf 14 (aktiv 18 beim Drücken), Spur `--surface-3` + inset Rand, an `--accent`, Knopf #ffffff; Easing mit Überschwingen cubic-bezier(.34,1.36,.64,1) (README: gewollt) | | 999 | | 306–316 |
| `.rating button` | 26×26 | 13 | 6 | `--border-2` / `--surface`, Schrift `--faint`; gewählt `--lc: --warn` | 324, 325 |
| `.slider input[type=range]` | Spur 8, Knopf 24 (Firefox 16) mit 4 px Rand `--surface` + Ring 1.5 px Akzent + Glow | | | | 811–814 |

Sechs Höhen für Eingabefelder: 41.6, 36, 34, 32.1, 32, und `.sym-new` 7px-Padding (≈ 35.6).

### 5.3 Karten, Kacheln, Kennzahlen (Z. 484–560, 634–660, 1800, 2601–2604)

| Komponente | Fläche / Rand / Radius | Padding | Innen | Zeile |
|---|---|---|---|---|
| `.card` | `--surface` / `--border` / 14 (`--radius`); Hover `--border-2` | 18px 20px | `.card-head` gap 12, mb 14; `.card-title` 15/600 gap 8; `.card-sub` 12.5 `--muted` mt 3; `.card-ico` 28×28 r9 `--accent-soft`; `.divider` 12px 0 | 485–504 |
| `.card.tight` / `.flush` / `.fill` | | 14px 16px / 0 / flex | | 487–489 |
| `.tile` (Dashboard-KPI) | `--surface` / `--border` / 14; Hover `--border-2`, translateY(-2px), `--lift-shadow` | **12px 15px 12px**, gap 7 | `.head` 13.5/500 `--text-2`; `.head .n` 12/500 `--muted` Onest; `.body` pt 8, gap 12px 14px, Trennlinie als Verlauf 22 %→48 %; `.val` 25/700 Onest lh 1.1 ls -0.02em; `.foot` 12 `--muted` mt 4; `.val small.sub` 13/600 Satoshi (1501); `.nodata` 15/600 `--muted` (1502) | 515–544 |
| `.tile.wide .body` | | | gap 12px 44px | 526 |
| `.tile.side .gauge` | | | mr 12, Stack translateY(-3.5px), SVG 62 | 528–539 |
| Container ≤220 / ≤178 / ≤164 / ≤150 | | | Balken umbricht / mr 0 / `.val` 22, Pille 10.5 / Pillen weg, SVG 54 | 522, 531–534 |
| `.tile.spark-tile .val` | | | 28/700 | 1735 |
| `.stat-tiles` | Raster 4 Spalten, gap 14; ≤1100 2 Spalten; ≤560 1 Spalte | | | 635, 640, 641 |
| `.stat-tile` | `--surface` / `--border` / **14 literal**; Hover wie `.tile` | 16px 18px | `.k` 13/400 `--text-2` gap 6, Info 13; `.v` 24/700 mt 8 ls -0.01em | 636–639 |
| `.stat-grid` / `.stat` | Raster 4 Spalten, gap 0, Zellrahmen rechts/unten `--border` | 16px 18px | `.k` 13; `.v` 22/700 mt 4; `.s` 12 `--muted` mt 2 | 642–650 |
| `.grid.tiles.kstrip` (Prop-Streifen) | eine Karte, Kacheln ohne Fläche, Hairlines per box-shadow | 16px 20px | `.body` pt 4 | 2601–2604 |
| `.prop-tiles .tile .val` / `.coach-gs-tiles .tile .val` / `.shadow-main .val` | | | 24 / 21 / 34 | 2684, 2945, 2397 |
| `.prop-balance` | Trennlinien oben/unten | 10px 0 | `.val` 26/700 **Satoshi** ls -0.02em; `.val.sm` 18 | 2699–2701 |
| `.set-block` | `--surface` / `--border` / 14 | 18px 20px | `h3` 14/700 mb 10 | 1817–1818 |
| `.cpn` | wie Karte | 18px 20px, gap 5 | `.cpn-head b` 15/600; `.cpn-off` 13 `--muted`; `.cpn-code` gestrichelt r10 | 2645–2652 |
| `.aff-ticket` | wie Karte | 16px 18px, gap 2 | | 2667 |
| `.banner` | r12, Rand farbig (`warn`/`loss`/`accent`/`info`) | 14px 16px, gap 12 | 13; SVG 18 | 662–673 |
| `.empty` | | 40px 20px, gap 8, min-h 180 | SVG 34 `--faint`; `b` 15/700 `--text`; `.small` max 360 | 675–678 |
| `.kv` | Trennlinie unten | 8px 0, gap 12 | 13; `b` 600 | 651–654 |
| `.bar-row` | | 7px 0, gap 5 | `.bl` 12.5; Spur 7 r4 | 655–658 |
| `.grid` | gap 18; `.tiles` ≥215; `.two` ≥340; `.three` ≥280; `.main-side` 2fr/≥300; `.side-main` ≥280/2fr | | | 505–512 |

### 5.4 Chips, Abzeichen, Pillen (Z. 545–551, 618–632, 186, 1341, 1400–1409, 2244, 2608)

| Komponente | Höhe | Padding | Schrift | Radius | Farben | Zeile |
|---|---|---|---|---|---|---|
| `.pill` (Status: win/be/loss/warn/neutral/open) | 22.7 | 3px 9px, gap 5 | 11.5/600 | 999 | `--accent-soft`/`--accent` (win!), `--be-soft`, `--loss-soft`, `--warn-soft`, `--surface-3`/`--text-2`, `--surface-3`/`--info` | 545–551 |
| `.tile .gauge-stack .pill` | ~18.5 | 1px 7px | 11, lh 1.5 | 999 | | 539 |
| `.badge` (Long/Short) | **22 fest** | 0 9px 0 4px, gap 5 | 10.5/600 uppercase .06em lh 1 | 999 | `--c` 80 % Text, Rand `--c` 16 %, Fläche 8 %; Kreis 15 mit Pfeil 9 | 618–622 |
| `.chip` (Setup/Fehler/Emotion/Regel) | 27.4 | 4px 10px, gap 5 | 12/500 | 999 | `--surface-3`/`--text-2`; mistake `--loss-soft`; emotion `--be-soft`; rule `--warn-soft` | 623–627 |
| `.chip.sel` (wählbar) | 27.4 | | | | `--surface` / `--border-2`; Hover `--text-2`; gewählt global (3125) | 628–631 |
| `.chip.sel.big` | 40.3 | 9px 18px | 14 | 999 | | 1879 |
| `.nav .badge-n` | ~18 | 1px 7px | 11 | 999 | `--surface-3`/`--text-2` | 186 |
| `.btn .cntb` | 18 fest | 0 5px | 11/700 | 999 | `--text`/`--bg` (invertiert) | 1341 |
| `.pf-n` | 20 fest | 0 7px | 11.5/700 | 999 | `--surface-3`/`--text-2` | 2608 |
| `.nw-rel` / `.nw-n` / `.nw-cur` | – | 2px 8px / 1px 7px / 2px 7px | 11/600 / 11/600 Onest / 11/700 Onest .03em | 999 / 999 / **6** | `--surface-3` / `--surface-2` `--muted` / `--surface-2` + Rand | 3085, 3087, 3100 |
| `.fd-chip` | 30 fest | 0 4px 0 11px | 12.5/600 | 8 | `--surface` / `--border-2`; Typ-Rand Akzent/Verlust/BE 45 % | 1400–1403 |
| `.fd-pop .fd-chip` | 28 | | 12 | 8 | | 1364 |
| `.fd-add` | 30 | 0 11px 0 8px | 12.5/600 | 8 | gestrichelt `--border-2`; Hover/on Akzent | 1407–1408 |
| `.rp-chip` | ~32 | 7px 14px | 13/500 | 999 | transparent / `--border-2` | 2244 |
| `.rp-chip-sm` | ~24 | 4px 10px | 11.5 | 999 | | 2290 |
| `.nb .tagpill` | – | 4px 10px | 12 | | | 992 |
| `.aff-code` | – | 3px 8px | 12/600 Onest .04em | 7 | gestrichelt | 2670 |

Vier Radien (999, 8, 7, 6) und sechs Höhen (18, 20, 22, 22.7, 27.4, 28/30) für „kleines Etikett“.

### 5.5 Reiter, Segmente, Schienen (Z. 317–325, 660–661, 1508–1512, 1585–1586, 1385–1389, 1866–1869, 2542–2545, 2590–2598)

| System | Container | Knopf: Padding | Schrift | Radius | Fläche/Rand | Höhe | Gewählt | Zeile |
|---|---|---|---|---|---|---|---|---|
| `.tabs` | gap 8, umbrechend | 10px 20px | 13.5/500 `--text-2` | 12 | `--surface` / `--border` | 41.6 | global flach (3125) | 660 |
| `.tabs.sm` | | 7px 14px | 12.5 | 9 | | 34.1 | | 1508 |
| `.tabs` Handy | nowrap, scrollt | 9px 14px | 13 | | | | | 3054 |
| `.seg` | gap 6 | 9px 16px | 13/500 `--text-2` | 10 | `--surface` / `--border` | 38.85 | global; Short: `--loss` + inset Rand (321) | 318 |
| `.seg.pill` | | 6px 12px | 12.5 | 999 | | 32.1 | | 322 |
| `.seg.mini` | `--surface` / `--border`, r8, p2, gap 2 | 3px 7px | 11.5 | 6 | ohne | 24.7 | | 1585 |
| `.seg.segc` (Schiene) | `--surface-2` / `--border`, r11, p3, gap 2 | 7px 14px | 12.5 | 8 | ohne | 30.1 (+8 = 38.1) | `--surface` + 0 1px 2px rgba(0,0,0,.25) + inset `--border-2` (2545) | 2542–2545 |
| `.prop-tabs` (Schiene) | `--surface` / `--border`, r12, p3, gap 2 | 7px 14px | 13.5/**600** `--text-2` | 9 | transparenter Rand | 35.6 (+8 = 43.6) | global | 2590–2592 |
| `.prop-sub` (Unterstrich) | gap 22, Linie `--border` | 2px 1px 11px | 13.5/600 `--muted` | – | – | ~32.6 | `--text` + 2 px Akzent-Linie (2597–2598) | 2595–2598 |
| `.set-tabs` (Unterstrich) | gap 22, Linie `--border` | 8px 2px 12px | 14/600 `--muted` | – | 2 px transparent unten | ~42.3 | Schrift + Linie `--accent` (1869) | 1866–1869 |
| `.fd-seg` (Filter) | `--surface` / `--border`, r10, p3, gap 4 | 5px 10px | 12.5/600 `--text-2` | 7 | transparenter Rand | 30.1 | global | 1385–1387 |
| `.fd-pop .fd-seg` | r8, p2 | 4px 8px | 12 | 6 | | 27.4 | | 1361–1362 |
| `.fd-tog` | gap 4 | Höhe 32, 0 9px, min-w 38 | 12.5/600 | 8 | `--surface` / `--border` | 32 | global | 1388 |
| `.fd-pop .fd-tog` | | Höhe 28, 0 7px | 12 | 7 | | 28 | | 1363 |
| `.dir-switch` (Long/Short) | Höhe 42, p3, r11 | 0 12px | 13.5/600 .02em | 9 | | 36 | farbige Fläche mit Schein (852, 869) | 850–872 |
| `.rating` | gap 4 | 26×26 | 13 | 6 | | 26 | `--lc: --warn` | 323–325 |
| `.nav a` (Seitenleiste) | gap 3 | 8px 16px, gap 14 | 14.5/500 | 12 | transparenter Rand | 37 | `--surface-2` + `--border` + 3 px Akzentbalken mit Glow (179–181) | 169–181 |
| `.set-nav a` | gap 2 | 11px 12px, gap 12 | 14/500 `--text-2` | 10 | – | 42.3 | `--surface-2` (1811) | 1807–1811 |
| `.popover .item` | | 9px 12px, gap 10 | 13 | 8 | – | 36.85 | Schrift `--accent` (337) | 334–337 |
| `.sb-menu .item` | p6 | wie `.popover .item` | 13.5 `--text-2` | 8 | | 37.6 | `.on` `--surface-2` | 250–251 |

**Zehn Reiter-/Segment-Systeme** mit acht verschiedenen Knopfhöhen (24.7, 27.4, 28, 30.1, 32, 34.1, 35.6, 38.85, 41.6, 42.3) und sechs Radien (6, 7, 8, 9, 10, 12).

### 5.6 Popover und schwebende Ebenen (Z. 327–389, 406, 439, 693, 879, 898, 1116, 1124, 1345, 1598, 1632)

| Komponente | Lage / z | Breite | Fläche / Rand / Radius / Schatten | Padding | Inhalt | Zeile |
|---|---|---|---|---|---|---|
| `.popover` | absolut, top 100 % + 8, z 40 | min 220 | `--surface` / `--border-2` / 12 / `--shadow` | 6 | `.item` 9px 12px r8 13; `.sec` 11/700 uppercase 8px 12px 4px; `hr` 6px 4px | 329–342 |
| `.popover.up` (Konto-Menü) | unten 100 % + 8 | – | | | | 247 |
| `.popover.range-pop` (Zeitraum) | | 168px + auto, max 100vw-24 | | 0 | Vorgaben p8 gap 2; Kalender 10px 16px 14px; Handy 320 | 344–348, 383 |
| `.popover.dp` (Datum) | fixed, z 70 | 284 (mit Zeit 404) | r14 | 12px 12px 10px | Tag 34 r9 13/500; Titel 30 r8 14.5/600; Monat 46 r10 | 406–436, 469 |
| `.popover.cp` (Farbe) | fixed, z 72 | 248 | r14 | 12 | Vorschau 34 r10; Hex 34 r10; Chips 24 | 439–466 |
| `.sb-menu` | | eingeklappt 240 fest, z 70 | | 6 | `.item` 13.5; `.sb-menu-row` 4px 6px 4px 12px | 249–262 |
| `.fd-pop` (Filter) | absolut, z 56 | (JS, 320) | `--surface` / `--border-2` / 12 / `--shadow` | 10px 12px 0 | Kopf h2 14.5; Fuß r 0 0 11 11, 10px 12px | 1345–1368 |
| `.nb-menu` | absolut, z 30 | 280, max-h 320 | r12 | 6 | `.head` 11/700 uppercase | 1116–1123 |
| `.nb-ytpop` | absolut, z 30 | – | **Rand `--accent`** / 10 | 8px 10px | 12.5 | 1124 |
| `.sym-menu` | fixed, z 90 | – | r12 | 6 | | 879 |
| `.tpl-menu` | im Fluss | – | `--surface-2` / `--border` / 10 | 4 | `.item` 12.5 | 1632–1633 |
| `.ed-pop` | | min 240 | | | | 1097 |
| `#tip` | fixed, z 100 | – | `--surface-2` / `--border-2` / **9** / `--shadow` | 8px 11px | 12, lh 1.45 | 693 |
| `.toast` | | – | `--surface-2` / `--border-2` / 999 / `--shadow` | 10px 16px | 13/600 | 898 |
| `.side-panel` | fixed rechts, z 56 | min(460, 100 %) | `--surface`, Rand links `--border-2`, `--shadow` | 20 (Handy 16) | h2 19; Liste gap 10; `.sp-item` 12 r12 `--surface-2`, Vorschau 144×92 r10 | 1598–1613 |
| `.panel-bg` / `.scrim` / `.modal-bg` / `.lightbox` | z 55 / 45 / 60 / 90 | | rgba(0,0,0,.45 / .55 / .6 / .86), Blur 4 bei Modal | | | 1597, 921, 824, 757 |

z-index-Werte in der Datei: -1, 0, 1, 2, 5, 15, 20, 30, 40, 45, 50, 55, 56, 60, 70, 72, 90, 100, 120 (19 Stufen, kein Token).

### 5.7 Modal (Z. 823–835, 1959–1969, 3059)

| | Wert | Zeile |
|---|---|---|
| Hintergrund | rgba(0,0,0,.6), Blur 4, Padding 20, z 60, Einblenden `--dur-2` | 824 |
| `.modal` | Breite min(860, 100 %), max-h 100vh-40, `--surface` / `--border-2` / **16** / `--shadow`, Padding 22px 24px, gap 16, pop-in `--dur-3` | 827 |
| `.modal.narrow` / `.wide` / `.tf-modal` | 520 / 1080 / 680 | 828, 829, 835 |
| `.modal-head` | gap 12; `h2` 19/600 | 830–831 |
| `.modal-foot` | rechtsbündig, gap 10, pt 6, Linie `--border`; `.left` links | 832–833 |
| `.cert-modal .cert-body` | 1fr + 280, gap 18 | 1959 |
| Handy | Bottom-Sheet, r 20 20 0 0, max-h 100dvh-28, unten 20 + safe-area | 3059 |

### 5.8 Tabellen (Z. 590–615, 1743, 1872–1878, 2990–2994, 3032–3034, 3056)

| | Wert | Zeile |
|---|---|---|
| `.tbl-wrap` | `--surface` / `--border` / 14, scrollt seitlich; `.inset` ohne Rand | 591, 613 |
| `.tbl` | 13, min-w 640, alle Zellen Onest (1800), `tabular-nums` (94) | 592 |
| `th` | **13px 14px**, 12/500 `--muted`, sticky, Linie `--border`, Sortierpfeil ▼ 10 px als Text (596) | 593–596 |
| `td` | 12px 14px, Linie `--border`, nowrap; letzte Zeile ohne Linie; `tr.link:hover` `--surface-2` | 597–600 |
| `.sym` | 700 Satoshi; Symbol+Richtung: Symbol 1 %, Abzeichen mittig min-w 80 | 602–607 |
| `.sub` | 12 `--muted` | 611 |
| `.tbl.compact` | 9px 12px | 612 |
| `.recent-wrap .tbl` | innen 8 seitlich | 609–610 |
| `.tl-fit .tbl` | 10 seitlich | 1743 |
| `td.wrapcell` | umbrechend, 240–520, lh 1.45 | 1872 |
| `.logtbl td.tl` | Zeitleiste 2 px `--border-2`, Punkt 12 mit 2 px `--accent` | 1874–1878 |
| Handy `.tbl` | 9px 10px, 12.5 | 3056 |
| Handy `.recent-wrap` | 8px 6px, 12 | 3032 |
| Handy `.aff-tbl` | 6 seitlich, th 11, td 12 | 2990–2994 |

Fünf Zellen-Dichten (13/14 · 12/14 · 9/12 · 8 · 10 seitlich) und vier Schriftgrößen (13, 12.5, 12, 11).

---

## 6. Anomalien (mit Vorschlag vorher → nachher)

Schwere: 1 = fällt sofort auf oder stört, 2 = deutlich sichtbare Inkonsistenz, 3 = Feinschliff. „Vorgaben“: ob der Vorschlag die Nutzervorgaben aus dem Brief berührt.

| # | S | Befund | Beleg | Vorschlag (vorher → nachher) | Vorgaben |
|---|---|---|---|---|---|
| A1 | 1 | **KPI-Label in drei Stufen für dieselbe Rolle:** Dashboard-Kachel 13.5/500 `--text-2`, Statistik-Kachel 13/400 `--text-2`, Prop-Streifen 13.5/500, Widget-KPIs 11.5/400 `--muted`, Tageskarte 11/400, Eyebrow-Variante 11/600 uppercase („DEIN SCORE“, „BALANCE“) | dashboard.png, stats_summary.png, prop_cockpit.png; Z. 517, 637, 647, 1455, 910, 1035, 101; Zensus 13.5px 418 / 13px 661 | Eine Rolle „KPI-Label“: 13px/500/`--text-2`, lh 1.3. `.tile .head` 13.5→13; `.stat-tile .k`, `.stat .k` 400→500; `.fw-stats > div > span`, `.day-card .stats .k`, `.nb .stats-grid .k`, `.strat-stats .k`, `.tilt-stats .k` 11/11.5→12px/500/`--muted`. `.caption` nur noch für echte Abschnittslabels, nicht als Kachel-Titel (prop.js „Balance“, dashboard „Dein Score“ → `.tile .head`-Stil). | nein |
| A2 | 1 | **Kachelwert in 25/24/22/21/26/28/34 px**, Hero-Zahlen 44/48/56/42/40 | dashboard.png 25 px; stats_summary.png 24 px; prop_cockpit.png 24 und 26 px; Z. 540, 639, 649, 2684, 2945, 1735, 2700, 2397, 1203, 1464, 2460, 798, 1303 | Drei Stufen: Kachelwert **24px/700 Onest lh 1.1 ls -0.02em** (`.tile .val` 25→24, `.stat .v` 22→24, `.coach-gs-tiles` 21→24, `.prop-balance .val` 26→24, `.spark-tile` 28→24); Hervorhebung **32px** (`.shadow-main .val` 34→32, `.replay-big` 34→32, `.score-big` 30→32, `.rp-bigtime` 32, `.tilt-stats .v` 40→32); Hero **44px** (`.fw-big` 48→44, `.rh-big` 56→44, `.streak .big` 42→44). Handy einheitlich 22 (statt 20/21/22, Z. 3027, 3038, 936). Laufweite: ≤32 px -0.02em, 44 px -0.03em. | nein |
| A3 | 1 | **Gewichte gegen die eigene Regel** (README Z. 209: Steuerelemente 500, Titel 600, nur Werte/Hauptknöpfe 700): Einstellungs-Titel 24/700, Block-Titel 14/700, Prop-h3 700, Eyebrows 700, Prop-Reiter/Unterreiter 600, Einstellungs-Reiter 600, Filter-Segmente 600, Ruhepunkt-Knöpfe 600, Kalender-Knöpfe 600, Avatar-Initialen 700, Tabellen-Symbol 700, Zähler 700 | settings_profil.png („Profil“, „Privatsphäre“); prop_cockpit.png (Schiene); Zensus 700 = 700 Vorkommen; Z. 1815, 1818, 2718, 2253, 2795; 167, 341, 456, 975, 1117, 1605; 2590, 2595, 1867, 1386, 1388, 1400, 1407, 2214, 429, 434, 1015, 1023, 1586, 898, 1659; 236, 264, 602, 1341, 2608, 3100 | Titel → 600: `.set-head h2`, `.set-block h3`, `.prop-h3`, `.rp-callout h3`, `.prop-grave-head b`, `.rp-dlg h3`. Eyebrows → 600 (wie `.caption`): `.nav-title`, `.popover .sec`, `.cp-sec`, `.nb .sec-h`, `.nb-menu .head`, `.sp-group`. Steuerelemente → 500: `.prop-tabs a`, `.prop-sub a`, `.set-tabs button`, `.fd-seg button`, `.fd-tog button`, `.fd-chip`, `.fd-add`, `.rp-btn` (nicht `.rp-primary`), `.dp-month`, `.dp-link`, `.nb .datebtn`, `.datepick .dp`, `.add-slot`, `.toast`, `.more-link`. Avatare und `.tbl .sym` → 600. Zähler (`.cntb`, `.pf-n`, `.nw-cur`) → 600. | nein (setzt die Regel um) |
| A4 | 2 | **Halbpixel-Typoskala:** 11 Stufen unter 16 px (10 / 10.5 / 11 / 11.5 / 12 / 12.5 / 13 / 13.5 / 14 / 14.5 / 15); 12.5 px hat 72 Regeln, 13 px 70, 11 px 41 | Abschnitt 1.2; Zensus fontSize 25 Werte | Skala auf **11 · 12 · 13 · 14 · 15 · 17 · 20 · 24 · 32 · 44** (10 nur für Diagramm-Achsen). Zuordnung: 10.5→11 (`.badge`, `.wr`, Grab-Label, Mini-Pillen); 11.5→12 (`.pill`, `.field .hint`, `.fw-stats span`, `.sp-group`, `.seg.mini`, Notizdatum, `.save-state`, `.fd-pop .fd-l`, `.chart text` 1648, `.pf-n`, Regel-Hinweis, Karten-Kleintext); 12.5→13 bei Steuerelementen (`.btn.sm`, `.seg.pill`, `.seg.segc`, `.fd-*`, `.tabs.sm`, `.select.sm`, `.fd-foot .btn`) und →12 bei Hilfstext (`.card-sub`, `.ph-note`, `.pf-sub`, `.rh-sub`, `.sr-desc`, `.ce-date`, `.stc-l`, `.pg-facts`); 13.5→14 (`.btn`, `.input`, `.tabs`, `.prop-tabs`, `.prop-sub`, `.tile .head`→13 (A1), `.sb-menu`, `.dp-month`, Listen-Titel, `.set-head p`, Ruhepunkt-/Coach-/News-Text); 14.5→14 (`.nav a`, Kalender-Titel, `.note-body`, `.msg`, `.rp`, `.ce-body`, `.fd-pop h2`→15). Danach bleiben 10 Größen statt 25. | nein |
| A5 | 2 | **Zeilenhöhe 1.45 erzeugt gebrochene Steuerelement-Höhen:** `.btn`/`.input`/`.tabs` 41.6 px, `.btn.sm` 34.1, `.seg` 38.85, `.prop-tabs` 35.6, `.select.sm` 32.1, `.seg.segc` 30.1, `.set-nav a` 42.3; dazu feste 36 (`.sr-num`, `.fd-pair`, `.btn.round`), 40 (Avatar, `.rp-btn`), 32/30/28 (Filter). 49 gerenderte Zeilenhöhen. | dashboard.png Kopfzeile: Knöpfe 41.6 neben Avatar 40; Abschnitte 5.1, 5.2, 5.5 | Drei Höhen als Tokens: `--ctl: 40px`, `--ctl-sm: 32px`, `--ctl-xs: 24px`. Steuerelemente mit `min-height`, `line-height: 1.2`, Padding nur seitlich: `.btn` → `min-height: var(--ctl); padding: 0 16px`; `.btn.sm` → `--ctl-sm; 0 12px`; `.btn.xs` → `--ctl-xs; 0 8px`; `.input/.select` → `min-height: var(--ctl); padding: 0 12px` (textarea behält Padding 10px 12px); `.tabs button` 40; `.tabs.sm` 32; `.seg button` 40 (`0 14px`); `.seg.pill`, `.seg.segc button`, `.fd-tog`, `.fd-chip`, `.select.sm`, `.sr-num`, `.fd-pair .input` → 32; `.seg.mini`, `.fd-pop .fd-*` → 24; `.prop-tabs a` 32 (Schiene 40 außen); `.btn.icon`, `.btn.round`, `.avatar`, `.sb-av` → 40 / 32. `body` lh 1.45→1.5 für Fließtext; Werte 1.1 behalten. | nein |
| A6 | 2 | **Zwei Abstandsraster gleich stark** (4er: 638 Vorkommen, 2er-versetzt 6/10/14/18/22: 649, ungerade 138). Fünf Karten-Innenabstände (18/20, 16/18, 16/20, 14/16, 12/15); sieben Raster-Lücken (10, 12, 14, 16, 18, 22, 28); Navigationslücke 14, Kachel-gap 7, Kachel-Padding 15, Tabellenkopf 13 | Abschnitte 2.1, 2.4, 2.5; Z. 515, 593, 635, 505, 230, 1805, 1813 | 4er-Skala als Tokens `--s1: 4px` … `--s8: 32px` (4, 8, 12, 16, 20, 24, 32, 40). Mapping: 2 bleibt (Hairlines); 3/5→4; 6/7→8; 9/10/11→8 oder 12 (gap in `.row`/`.stack` 10→8, `.btn` vertikal entfällt durch A5, `.set-nav a` 11px 12px→8px 12px, `.popover .item` 9px 12px→8px 12px, `.seg button` seitlich 16 bleibt); 13/14/15→12 oder 16 (`.tile` 12px 15px→16px, `.tbl th` 13px 14px→12px 16px, `.tbl td` 12px 14px→12px 16px, `.stat-tiles` gap 14→16, `.nav a` gap 14→12, `.card-head` mb 14→16, `.legend` gap 14→12); 18→16 oder 20 (`.content` gap 18→20, `.grid` gap 18→16, `.card` 18px 20px→20px, `.set-block` →20px, `.stat-tile`/`.kstrip .tile` 16px 18px / 16px 20px→16px 20px); 22→24 (`.content` oben, `.modal` 22px 24px→24px, `.set-body` gap, `.set-tabs`/`.prop-sub` gap 22→24); 26→24 (`.nav-group` Abstand 166); 28→32 oder 24 (`.settings` gap, `.rh-main`). Ergebnis: Karte 20, Kachel 16, kleine Karte 12/16, Raster-Lücke 16, Abschnittslücke 24. | nein |
| A7 | 2 | **Radien: 7 Flächenradien (6–14) und drei Tokens, die kaum genutzt werden** (`--radius` 17×, `--radius-sm` 3×, `--radius-xs` 0×; literal 10 px 36×, 9 px 24×, 8 px 29×, 12 px 34×). Knopf 12 neben Eingabe 10 neben Reiter 12 neben Segment 10 neben kleinem Knopf 9 | Abschnitt 3.1; modal_trade_loggen.png (Felder 10, Knöpfe 12); Z. 267, 289, 318, 280, 660, 1807, 334 | Vier Tokens und sonst nichts: `--r-lg: 14px` (Karten, Kacheln, Popover-Kalender, Modal 16→14, Tabellen-Wrapper), `--r: 10px` (alle Steuerelemente: `.btn` 12→10, `.tabs button` 12→10, `.nav a` 12→10, `.popover` 12→10, `.banner` 12→10, `.prop-tabs` Schiene 12→10, `.dropzone`, `.shadow-rule`, `.sp-item`, `.fd-pop`, `.nb-menu`, `.sym-menu`), `--r-sm: 8px` (`.btn.sm` 9→8, `.tabs.sm` 9→8, `.select.sm` 9→8, `.rr-day`/`.dp-day` 9→8, `#tip` 9→8, `.card-ico` 9→8, `.dir-opt` 9→8, `.prop-tabs a` 9→8, `.seg.segc button` 8, `.seg.segc` 11→10, `.dir-switch` 11→10, `.fd-seg` 10→8 mit Knopf 6), `--r-xs: 6px` (`.btn.xs` 7→6, `.fd-seg button` 7→6, `.aff-code` 7→6, `.rating`, Checkboxen, `.nw-cur`). Pillen 999 bleiben. Verschachtelung: Außen − Innenabstand (Schiene 10 mit p3 → Knopf 8 bleibt stimmig; `.popover` 10 mit p6 → `.item` 8→6). | nein |
| A8 | 2 | **Eyebrow-Label in neun Varianten** (Größe 10.5–13, Gewicht 600/700, Laufweite .03–.16em) | Abschnitt 1.3; dashboard.png „ÜBERSICHT“ 700 vs. „DEIN SCORE“ 600; Z. 101, 167, 341, 456, 975, 1117, 1605, 774, 2804, 358, 419, 1265 | Eine Definition `.caption { font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); }` und alle anderen darauf: `.nav-title` (.09em→.06em, 700→600), `.popover .sec`, `.cp-sec`, `.nb .sec-h`, `.nb-menu .head`, `.sp-group` (11.5→11), `.journal .col h3` (13→11). Wochentage im Kalender (`.rr-week`, `.dp-week`) 11/500 .03em ohne Uppercase-Zwang, da keine Abschnittslabels. `.pg-cause span` .16em→.08em. | nein |
| A9 | 2 | **Karten-/Block-Titel in sechs Größen** (13, 14, 15, 16, 18, 20) und **Bereichs-/Dialog-Überschriften in sieben** (14.5, 17, 18, 19, 20, 24, 26) | Abschnitt 1.3; settings_profil.png „Profil“ 24/700, „Profilbild“ 14/700, dashboard.png „Gesamt-Score“ 15/600; Z. 491, 1818, 2718, 3084, 1450, 2187, 2253, 2795; 1815, 831, 1602, 2852, 2342, 2894, 1348, 2874 | Drei Titelstufen: **h1 Seite 21/600** (bleibt); **h2 Bereich/Dialog 20/600** (`.set-head h2` 24/700→20/600, `.modal-head h2` 19→20, `.side-panel h2` 19→20, `.coach-title`, `.mentor-setup h2`, `.coach-join-head h2` bleiben 20, `.rp-title` 24→20, `.ce-title` 17→20, `.fd-pop .sp-head h2` 14.5→15 als Karten-Titel); **Karten-/Block-Titel 15/600** (`.set-block h3` 14/700→15/600, `.prop-h3` →15/600, `.rp-dlg h3` →15/600, `.nw-dh` 13→15 (Tages-Kopf) oder 13/500 als Untertitel, `.fw-empty b` 16→15, `.rp-choice .rp-name` 16/700→15/600, `.rp-callout h3` 18/700→15/600, `.pg-cause b` 18→17, `.prop-grave-head b` 20→17, `.rh-empty .card-title` 18→15). Hero-Titel (Notiz, Ruhepunkt-Frage) 28/700 statt 34 und 26. Tagesansicht-h2 ohne Regel (18 px) und Notebook-h3 ohne Regel (18.72 px) erhalten Klassen (`.card-title`). | nein |
| A10 | 2 | **Zahlen nicht durchgängig in Onest:** Prop-Saldo „111.262 $“ 26/700 Satoshi, Prop-P&L 18/700 Satoshi, Widget-Kontostand `.fw-acc-v` 14/700 Satoshi, Zustand-Spalten `.stc-col b` 16/700 Satoshi, Prop-Fakten `b` 12.5/700 Satoshi; umgekehrt steht **jede Tabellenzelle in Onest** (Z. 1800 `.tbl td`), also auch Namen und Texte („Sara Yilmaz“, „Creator“) | prop_cockpit.png; Zensus prop: `div.val` 26px Satoshi; Zensus affiliate: `button.aff-name` 13/700 Onest; Zensus 13px: 425 Onest / 235 Satoshi; Z. 2700, 2701, 1480, 2967, 2808–2813, 1800 | `.prop-balance .val`, `.prop-balance .val.sm`, `.fw-acc-v`, `.stc-col > b`, `.pg-facts dd`, `.prop-grave-kv b`, `.fw-stats b`, `.day-card .stats .v`, `.nb .stats-grid .v`, `.strat-stats .v` → `font-family: var(--font-num)`. In Z. 1800 `.tbl td` entfernen und stattdessen `.tbl td.r, .tbl td.num, .tbl td.c` (Zahlenspalten) auf Onest setzen; Textspalten erben Satoshi. Regel in README ergänzen: „Onest nur für Ziffern-Zellen“. | nein (setzt Vorgabe um) |
| A11 | 2 | **Grün als Auswahl-/Zustandsmarkierung ohne Bedeutung** (Vorgabe: Grün nur Gewinn und „Trade loggen“; „grüne Markierung von Auswahl“ abgelehnt): Menü-Haken `--accent` (337), Einstellungs-Reiter Schrift + Unterstrich `--accent` (1869), Prop-Unterreiter Unterstrich `--accent` (2597–2598), Kalender-Tag gewählt Ring `--accent` (713) und `.dp-day.sel` Fläche `--accent` 700 (426), Notiz gewählt Rand `--accent-soft` (1008), Editor-Werkzeug gedrückt `--accent-soft` (1090), „Hinzugefügt“ `--accent-soft` (1618), Coach-Radio Rand Akzent 45 % (2903), YouTube-Popover Rand `--accent` (1124), Bearbeiten-Leiste Rand `--accent` (1567), Heute-Marker Ring `--accent` (1292, 1672, 1771), Log-Punkt `--accent` (1875), Blockquote 3 px `--accent` (1137), `.card-ico` Akzent (501), Info-Banner-Symbol Akzent (669), Einrichtungs-Symbole Akzent (2341, 2893), `.more-link` Akzent 600 (1659), Hover auf Dropzone/Add-Slot/`.fd-add`/`.ct-check` Akzent (750, 1588, 1408, 2931) | dashboard.png „Mehr anzeigen“ grün, „11“ Heute-Kreis grün; settings_* Reiter; pop_konto.png Haken; Z. wie genannt | Neutraler Auswahlstil überall: Menü-Haken `color: var(--text)` + Häkchen-Symbol; `.set-tabs`/`.prop-sub` gewählt `color: var(--text)`, Unterstrich `background: var(--text)`; Kalender-Tag gewählt wie Farb-Punkt (`box-shadow: 0 0 0 2px var(--surface), 0 0 0 3.5px var(--text)`), `.dp-day.sel` Fläche `--text`, Schrift `--bg`; Heute-Marker Ring `--text-2`; Notiz gewählt `--border-2` + `--surface-2`; Werkzeug gedrückt `--surface-2`; „Hinzugefügt“ `--surface-2`/`--text-2`; Coach-Radio `--border-2`; YouTube-Popover/Bearbeiten-Leiste `--border-2`; Log-Punkt `--text-2`; Blockquote `--border-2`; `.card-ico` `--surface-3`/`--text-2`; Info-Symbole `--text-2`; `.more-link` `--text` 500 mit Unterstrich beim Hover; Hover-Zustände `--text-2`. Akzent bleibt bei: Gewinn, `.btn.primary`/`.btn.accent`, Schalter an, Fokus-Outline, Balken am aktiven Navigationseintrag (dokumentiert), `.prop-card.passed`. | ja – setzt die Vorgabe um |
| A12 | 2 | **Fünf Fokus-/Auswahlringe:** outline 2 px Akzent Offset 2 (95 + 10 Stellen), 0 0 0 3px `--accent-soft` (293, 315, 426, 451, 814, 2695), 0 0 0 2px `--accent` (713, 1292, 1672, 1771), inset 1.5 px `--accent` (373, 425), 0 0 0 2px `--text` (1937, 1954), 3 px Surface + 4.5 px Text (1830, 1841), outline `--phase` (2144), outline `--dir-c` (864) | Abschnitt 3.3 | Zwei Ringe: **Fokus** = `outline: 2px solid var(--accent); outline-offset: 2px` überall (Eingabefelder zusätzlich Rand `--accent`, der 3-px-Soft-Ring entfällt: 293, 315, 451, 814 → `box-shadow: none`); **Auswahl** = `box-shadow: 0 0 0 2px var(--surface), 0 0 0 3.5px var(--text)` für Farb-Punkte, Theme-/Design-Karten, Kalender-Tag, Heute-Marker (1830/1841 vereinfachen, 713/1292/1672/1771 umstellen). 864 und 2144 auf `--accent`. | ja (Teil von A11) |
| A13 | 2 | **Scheine/Glows entgegen „kein Schein“:** `.btn.primary:hover` Akzent-Glow (275), Schieber-Knopf Glow (812), Richtungs-Knopf Glow (869), Handy-„Trade loggen“ Akzent-Glow (3019), Konfidenz-Balken Glow (2514, 2524), `.seg.segc` gedrückt mit Fallschatten (2545) überschreibt die flache Regel (3125–3130) | impeccable-detect „dark-glow“; Z. genannt | 275 → `box-shadow: none` (Hover nur `--accent-2`); 812 → `box-shadow: 0 0 0 1.5px var(--accent)`; 869 → `box-shadow: none`; 3019 → `box-shadow: 0 6px 18px rgba(0,0,0,.35)`; 2514/2524 → `box-shadow: none` (Farbe reicht); 2545 → `box-shadow: inset 0 0 0 1px var(--border-2)` ohne Fallschatten. Serie Stufe 2/3 (1247–1262) und Ruhepunkt bleiben (dokumentierte Ausnahmen). | ja – setzt die Vorgabe um |
| A14 | 2 | **Helles Design ist kühl-grün statt warm** (dunkel: #0e0d0b / #f2f0ec / #8a867f warm; hell: #f5f7f5 / #0d130f / #6a746d / Ränder #e1e6e2 / #cfd6d1 grünlich; Schatten rgba(20,30,24)); Schwarz-Variante ebenfalls grünlich (#121513, #b4bdb7) | Z. 54–73, 76–79; light-1440/dashboard.png | Warme helle Neutrale: `--bg: #f6f5f2; --bg-2: #efede8; --surface: #ffffff; --surface-2: #f4f2ee; --surface-3: #ebe8e2; --field: #ffffff; --border: #e5e2dc; --border-2: #d2cec6; --text: #171613; --text-2: #4a4741; --muted: #78746c; --faint: #b3afa7`; Schatten `rgba(30, 27, 22, .14)` / Karten hell `0 1px 2px rgba(30,27,22,.04), 0 6px 18px rgba(30,27,22,.06)`. Schwarz-Variante auf Neutralgrau: `--surface: #0c0c0b; --surface-2: #131312; --surface-3: #1a1a18; --border: #202020; --border-2: #2d2c2a; --text-2: #b9b6b0; --muted: #807c75; --faint: #4e4b46`. Kontrast `--muted` #78746c auf #fff ≈ 4.6:1. | nein („helles Design gleichwertig“) |
| A15 | 2 | **`--faint` als Textfarbe für Hinweise** (≈ 2.1:1 in beiden Designs): `.field .hint` 11.5 px (299), `.ed-hint` (1078), `.fd-hint` 11 px (1382), `.stc-l small` (2966), `.rating button` Schrift (324), `.coach-no svg` (2910) | impeccable-detect low-contrast; Z. genannt | Hinweise auf `--muted` (4.8:1 dunkel, 4.6:1 hell nach A14); `--faint` nur für Platzhalter, Trennzeichen, inaktive Symbole. 299, 1078, 1382, 2966 → `color: var(--muted)`. | nein |
| A16 | 2 | **Gewinn-Elemente hängen an `--accent` statt `--profit`** (getrennt einstellbar laut README Z. 171): `.pill.win` (546), `.prop-ampel.gruen` Ring `--accent-soft` (2695), `.streak-ring` nutzt `--profit` (1506) korrekt; `--profit-soft` existiert nicht | Z. 546, 2695; `:root` ohne `--profit-soft` | Token `--profit-soft: rgba(52, 245, 138, .12)` (hell rgba(15,184,98,.12)) ergänzen; `.pill.win { background: var(--profit-soft); color: var(--profit); }`; `.prop-ampel.gruen { box-shadow: 0 0 0 3px var(--profit-soft) }`; Kalender-Gewinn (710), `.yc.win` (1693) bleiben auf `--profit`. | nein |
| A17 | 3 | **Zehn Reiter-/Segment-Systeme** (5.5) mit acht Höhen und sechs Radien | prop_cockpit.png Schiene 43.6 hoch neben Knöpfen 41.6; stats_summary.png freie Reiter | Zwei Systeme: **Reiter** (`.tabs`: freie Knöpfe, 40/32 hoch, r10/8, 14/13 px 500) und **Schiene** (`.seg.segc` als Basis: Container `--surface-2` r10 p3, Knopf 32 hoch r8 13/500, gewählt `--surface` + inset `--border-2`). `.prop-tabs` → `.seg.segc`; `.fd-seg`, `.seg.mini` → `.seg.segc.sm` (Knopf 24, r6); `.seg` (Trade-Formular) → `.tabs` oder Schiene; `.fd-tog` → `.tabs.sm`; Unterstrich-Reiter (`.set-tabs`, `.prop-sub`) → eine Klasse `.tabs.line` (14/500 `--muted`, gewählt `--text`, Linie 2 px `--text`, gap 24). | nein |
| A18 | 3 | **Zwei Listen-/Navigationsmetriken:** `.nav a` 8px 16px r12 14.5/500 gap 14 (169) vs. `.set-nav a` 11px 12px r10 14/500 gap 12 (1807) vs. `.popover .item` 9px 12px r8 13 (334) vs. `.sb-menu .item` 13.5 (250) | dashboard.png vs. settings_profil.png | Ein Listeneintrag: Höhe 40 (Menü 36), Padding 0 12px, r10 (Menü r8 bei Popover r10/p6 → 4 wäre korrekt, 6 vertretbar), 14/500, gap 12, Symbol 18. `.nav a` 14.5→14, Padding 8px 12px; `.set-nav a` 11px 12px→8px 12px; `.popover .item`/`.sb-menu .item` 13/13.5→14 (oder beide 13). | nein |
| A19 | 3 | **Etiketten (Chips/Pillen/Badges/Zähler) in sechs Höhen und vier Radien;** Zähler im Filterknopf invertiert (`--text` auf `--bg`, 1341) – einziges invertiertes Element der App; `.nw-cur` als einziges Etikett eckig r6 (3100) | 5.4; dashboard.png Pillen 4/0/6 neben Long/Short-Abzeichen | Vier Etiketten: **Status-Pille** 22 hoch, 0 8px, 11/600, r999 (`.pill`, `.tile .gauge-stack .pill`, `.nw-rel`, `.nw-n`); **Abzeichen Long/Short** 22 hoch, 11/600 .04em, r999 (`.badge` 10.5→11); **Chip wählbar** 28 hoch, 0 10px, 12/500, r999 (`.chip`, `.fd-chip` r8→999 und 30→28, `.rp-chip` 32→28, `.chip.sel.big` 40→32); **Zähler** 18 hoch, 11/600, r999, `--surface-3`/`--text-2` (`.cntb` nicht invertiert, `.pf-n` 20→18, `.nav .badge-n`). `.nw-cur` r6→999. | nein |
| A20 | 3 | **Tabellen: Kopf höher als Zelle** (th 13px 14px vs. td 12px 14px, 593/597); fünf Dichten; Sortierpfeil als Text „▼“ 10 px (596) | trades.png; Z. 593–612, 1743, 3032, 3056 | `th` → `padding: 12px 16px`; `td` → `12px 16px`; `.compact` → `8px 12px`; `.recent-wrap`/`.tl-fit` auf `.compact` umstellen und Sonderregeln 605–610, 1743 streichen; Handy eine Dichte `8px 10px` 12 px (3032, 3056, 2990–2994 zusammenführen). Sortierpfeil als 12-px-SVG (Chevron aus `ui.js`-Icons) statt Text. | nein |
| A21 | 3 | **Rohfarben, die Tokens umgehen** (4.2 Gruppe C): Pfeile in `.select`/Datumsfeld #8b948e (296, 392), `.pair-card .pv i` #04140a (1947), `--rp-on-phase` #04140a (2141), weiße 6–12 %-Ränder im Farbwähler/Palette (441, 449, 459, 1109), Swatch-Rand Schwarz 25 % (582) | Z. genannt; light-1440/settings_profil.png Auswahlpfeil bleibt dunkelgrau-grün | 296/392: Pfeil als `mask-image` mit `background-color: var(--muted)` (oder zwei Data-URIs je Design über `:root[data-theme="light"] .select`); 1947, 2141 → `var(--accent-ink)` (2142 entfällt dann); 441/449/459/1109 → `color-mix(in srgb, var(--text) 12%, transparent)`; 582 → `color-mix(in srgb, var(--text) 20%, transparent)`. | nein |
| A22 | 3 | **Token-Hygiene:** `--font-display` = `--font` (62 vs. 15 Verwendungen); `--radius-xs` 0×; `--info` 1× und als `--rp-dawn` dupliziert (2141); `--accent-2` nur Hover; `--be-soft` 2×; `--bg-2` 2×; Theme-Vorschau Graphit (1860) nutzt #1e1d1a/#1c1b19/#2f2d29 statt der echten Token-Werte #1a1917/#22211f/#262522; helles Design doppelt gepflegt (54–63 und 65–73) | Abschnitt 4.1 | `--font-display` entfernen (62 Stellen → `var(--font)`); Radius-Tokens nach A7; `--rp-dawn: var(--info)`; Theme-Vorschau auf Token-Werte (`--c1: #1a1917; --cp: #22211f; --cb: #262522`); helles Design einmal definieren (`@media` Block ruft dieselben Werte über eine gemeinsame Custom-Property-Gruppe oder wird per JS gesetzt – Theme.apply setzt `data-theme` ohnehin). Zusätzlich fehlende Tokens anlegen: Schriftgrößen (`--fs-11 … --fs-44`), Abstände (`--s1 … --s8`), Höhen (`--ctl*`), z-index (`--z-sticky 10, --z-sidebar 30, --z-popover 40, --z-scrim 45, --z-panel 56, --z-modal 60, --z-picker 70, --z-lightbox 90, --z-tip 100`). | nein |
| A23 | 3 | **13 hart codierte Übergangsdauern** neben der Skala (273 60ms, 306–307 .26s/.32s/.18s, 850 140ms, 858 160ms, 1317 1.1s, 2513 40ms, Keyframes mit eigenen Zeiten); `.switch` mit Überschwing-Easing (306; README: gewollt) | Z. genannt | 273 → `var(--dur-1)` mit `transition-duration` halbiert über `calc(var(--dur-1) / 2)`; 306–307 → `--dur-2` / `--dur-3`; 850/858 → `--dur-1`; 2513 Verzögerungen → `calc(var(--dur-1) / 4)`. Schalter-Easing bleibt (dokumentiert). | nein |
| A24 | 3 | **`.btn.primary` mehrfach pro Ansicht:** Profil-„Speichern“ grün, „2FA aktivieren“ grün, aber „Speichern“ unter Privatsphäre neutral (dieselbe Seite); 56 Verwendungen von `btn primary` im JS (misc.js 11, prop.js 8, app.js 6) | settings_profil.png; `grep "btn primary" js/**` | Pro Ansicht höchstens ein grüner Hauptknopf (Formular-Speichern oder Dialog-Bestätigung). „2FA aktivieren“, zweites „Speichern“, „Prop-Konto“-Anlegen u. ä. → `.btn` (neutral, 500). Entscheidung in README festhalten: „`.btn.primary` nur für die eine bestätigende Handlung einer Ansicht oder eines Dialogs“. | ja – stützt „Grün nur mit Bedeutung“ |
| A25 | 3 | **Ungestylte Überschriften:** Notebook `h3` „Notebook“ 18.72 px (Browser-Standard), Tagesansicht `h2` 18 px ohne Regel; Hilfsklassen-Dopplung `class="small muted"` (107×) vs. `"muted small"` (47×) | Zensus notebook, day; `grep class=` im JS | Beide Überschriften erhalten `.card-title` (15/600) bzw. nach A9 20/600; eine Hilfsklasse `.note` (12 px `--muted`) statt zweier Kombinationen – oder JS-Reihenfolge vereinheitlichen. | nein |
| A26 | 3 | **Seitenleisten-Text größer als Grundschrift** (`.nav a` 14.5 px, body 14, Knöpfe 13.5, Einstellungs-Navigation 14); 14.5 px kommt außerhalb der Seitenleiste nur 13-mal vor | Zensus 14.5px 529 (516 Navigation); Z. 169, 84, 267 | `.nav a` 14.5→14 (A4); Knöpfe 13.5→14 (A4). Damit teilen Navigation, Grundschrift, Knöpfe und Eingaben eine Größe. | nein |

### Querverweise für andere Prüfer

- Gewichte 700 auf Nicht-Werten (A3) und Grün als Auswahl (A11) sind die beiden Punkte, bei denen das CSS der eigenen README widerspricht; alle anderen Punkte sind Vereinheitlichung ohne Richtungswechsel.
- Die Zertifikat-Regeln (1971–2100) und der Friedhof (2765–2846) haben eigene feste Paletten und Skalen (`calc(var(--s) * Npx)`); sie sind bewusst vom App-Design entkoppelt und hier nur inventarisiert, nicht als Anomalie gezählt.
- Der Ruhepunkt (2103–2334) nutzt `--phase`-Farben mit Glows und eigene Knöpfe (`.rp-btn`, `.rp-chip`); laut README ein bewusst anderer, ruhiger Raum. Die Knopf-Maße (A5, A7) sollten trotzdem mitziehen, die Atmosphäre nicht.
