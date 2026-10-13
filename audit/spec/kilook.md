# Zielspezifikation „KI-Look und Sonstiges“

Gruppe `kilook`, 25 bestätigte Befunde aus `audit/spec-input/kilook.json`.
Code-Stand: Commit `677b630`. An `web/` hat sich seit dem 11.10. 15:21 nichts geändert, die Zeilenangaben gelten also.
Vor jeder Änderung die Stelle über den zitierten Text suchen, denn frühere Schritte verschieben Zeilen.

Nachgeprüft wurden alle Code-Stellen. Außerdem habe ich in der Sitzungsmitschrift nachgesehen, was der Nutzer ausdrücklich festgelegt hat:

- 02.10.: „Die Linie in den Boxen muss nicht durchgezogen sein. Damit's nicht durchs Diagramm geht.“
- 28.09.: der Regeltreue-Ring soll „alleine stehen ohne Zahl in der Mitte und vor allem mehr mittig und größer“ sein.
- 30.09.: „Die drei Symbole sind sehr stark gemacht, auch mit der Bewegung und Visualisierung.“

Diese drei Aussagen bestimmen, was unter „Nutzer fragen“ steht.

## Abdeckung

| id | Schwere | Kurz | Wo erledigt |
|---|---|---|---|
| diagramme-4 | 1 | Prop: dieselbe Zahl in $ und € | Z5c · C19, C20, C26, C27 |
| bereich_konto-17 | 2 | Mentor-Notiz bernsteinfarben mit Streifen | Z2 · B3, C21 |
| ki_look-12 | 2 | Bearbeiten-Leiste grün mit Pulspunkt | Z1, Z2 · B2, C12 |
| ki_look-17 | 2 | Funkel-Symbol für vier Dinge | Z4 · B1, C12–C15, C25 |
| diagramme-32 | 2 | Cent fallen ab 10.000 weg | Z5a · A1, A2, C14, C19 |
| bereich_shell-28 | 2 | Coach trägt KI-Funkelsymbol | Z4 · B1 |
| ki_look-6 | 2 | Regeltreue-Ring mit Glow, „0 %“ ohne Regeln | Z1, Z7 · B4, C18 · Größe: N2 |
| bereich_training-45 | 2 | Ruhepunkt-Startkarten: Lift, Farbschein, Endlos-Symbole | Z1, Z6 · B5 · Symbolbewegung und Glühen: N3 |
| ki_look-43 | 2 | Startseite: Fake-Browserfenster, grüne Auswahl, alte Labels | Z8 · B8, C7 · Screenshot-Ersatz: R1 |
| ki_look-42 | 2 | Startseite: sechs Symbolkarten und „SCHRITT n“ | Z8 · B8, C7 |
| ki_look-44 | 2 | Startseite: grüne „Neu:“-Leiste, Knöpfe in Versalien | Z8 · B8, C7 |
| bereich_dashboard-41 | 3 | Auslaufende Linie unter Kacheltitel | N1 |
| diagramme-31 | 3 | Kalender mit gemischten Nachkommastellen | Z5a · C9 · title-Zusatz: R3 |
| diagramme-35 | 3 | Netto-P&L mal mit, mal ohne Vorzeichen | Z5b · A3, C9, C16 |
| bereich_shell-35 | 3 | Tote Shell-Regeln und Markup | Z11 · C1, C7, C8, C11 |
| ki_look-10 | 3 | Auslaufende Haarlinie unter Kacheltitel | N1 |
| ki_look-36 | 3 | Versal-Kicker über Kennzahlen | Z3 · A4, B6, C8, C9, C10, C13, C14, C16, C17, C19 · Texte: R4 |
| typografie-33 | 3 | Inter immer geladen | Z10 · A5, A6 |
| ki_look-31 | 3 | Tote Navy/Hell-Regeln mit Verlaufstext im Zertifikat | Z1, Z11 · C3, C11 |
| bereich_notebook_news-41 | 3 | News-Hero mit Deko-Glockenkachel | Z1 · B7, C22 |
| bereich_notebook_news-36 | 3 | Doppelte und tote Notebook-Regeln | Z11 · C2 |
| ki_look-33 | 3 | Mentor-Notiz mit drei Signalen | Z2 · B3, C21 |
| bereich_prop-51 | 3 | Toter Prop-Code, veraltete Kommentare | Z11 · C5, C19, C20 |
| bereich_training-49 | 3 | Reste des Schalters „Christlicher Impuls“ | Z11 · C4, C23 |
| barrierefreiheit-43 | 3 | Tastenkürzel: Doku falsch, „0“ ins Leere, nicht abschaltbar | Z9 · C6, C8, C24, C26, C28 · Neubelegung: R2 |

---

## 1. Zielzustand

### Z1 Keine dekorativen KI-Signale

1. **Kein Schein.** Kein farbiger `box-shadow` mit Null-Versatz, kein `filter: drop-shadow(…)` in Farbe, kein farbiger Schatten unter Karten.
   Erlaubt bleiben nur die Ausnahmen aus README und BRIEF:
   - „Trade loggen“ (`.btn.accent`, README:206)
   - `--dot-glow` an Hinweis-Punkten und am Balken des aktiven Seitenleisten-Eintrags (README:111)
   - Serie „Im Flow“ und „Unaufhaltsam“ (README:130–132)
   - Ergebnis-Pille im Zertifikat (README:140)
   - Ruhepunkt-Atemlicht `.rp-tide`/`.rp-tide-glow` und die Farbflächen im Hintergrund (README:142)
   - die Ruhepunkt-Symbole, bis der Nutzer N3 beantwortet hat

   Neutrale Tiefenschatten (`--shadow`, `--lift-shadow`) zählen nicht als Schein.
2. **Keine farbigen Seitenstreifen** (`::before` oder `border-left` ab 2 px in einer Farbe) an Karten und Notizen. Ausnahmen mit Funktion: der Farbbalken der Notebook-Ordner (README:120) und das Zitat im Editor.
3. **Kein Verlaufstext** (`background-clip: text`), außer bei der Serie „Unaufhaltsam“ (app.css:1244, 1267, README:131). In `app.css` bleiben genau 2 Vorkommen.
4. **Keine pulsierenden Punkte und keine Endlosschleifen als Schmuck.** Endlos-Animationen gibt es nur bei:
   - Lade- und Skelettzuständen
   - Serie (README)
   - Ruhepunkt-Atmosphäre (Blütenblätter, Farbflächen, Atemlicht)
   - Ruhepunkt-Symbolen, bis N3 beantwortet ist
5. **Keine Deko-Symbolkacheln** (Symbol im abgerundeten Quadrat ohne eigene Information). Betrifft den News-Hero und die Funktionsliste der Startseite.
6. **Keine nachgebaute Fenster-Chrome**, also keine Ampelpunkte und keine Fensterleiste.
7. **Keine Versal-Kicker über Werten** (siehe Z3).

### Z2 Farbe nach Bedeutung (Ausschnitt für diese Gruppe)

- **`--warn` (Bernstein) nur für Warnungen.**
  - Die Mentor-Notiz im Coach Mode ist neutral: Fläche `var(--surface-2)`, Rand `1px solid var(--border)`, kein Streifen. Die Trennlinien im Notebook und im Antwortverlauf sind `1px solid var(--border)`.
  - Die Antwort eines Mentors bekommt `color-mix(in srgb, var(--text) 4%, transparent)`.
  - Die Pillen „Mentor“ und „1 Antwort“ sind `U.pill(…, 'neutral')`.
- **`--accent` (Grün) nie als Modus- oder Auswahlanzeige.** Davon betroffen:
  - die Bearbeiten-Leiste im Dashboard
  - der aktive Eintrag in der Startseiten-Demo
  - die Startseiten-Leiste
  - die Symbolkacheln und der „SCHRITT“-Kicker der Startseite

  Grün bleibt für Gewinn, „Trade loggen“, den Hauptknopf (`.btn.primary`, z. B. „Speichern“), Schalter und Hinweis-Punkte. Die Kurve in der Demo bleibt ebenfalls grün, weil sie ein Ergebnis zeigt.
- **Modus und Auswahl sind flach.** Eine schwebende Modus-Leiste hat Fläche `var(--surface-2)`, Rand `1px solid var(--border-2)` und `box-shadow: var(--shadow)`, weil sie sticky über dem Inhalt liegt. Ein gewählter Listeneintrag hat Fläche `var(--surface-2)`, Rand `var(--border)` und Schrift `var(--text)`, genau wie `.nav a.active` (app.css:179).

### Z3 Beschriftungen über Werten und Abschnittslabels

| Rolle | Klasse | Werte | Wann |
|---|---|---|---|
| Wert-Beschriftung (KPI-Label) | `.kpi-label` (neu) | `font-size: 13px; line-height: 18px; font-weight: 500; color: var(--text-2);` Satzschreibung, keine Laufweite | Steht direkt über oder neben einem Wert (Zahl, Betrag, Dauer, Score) |
| Abschnittslabel (Eyebrow) | `.caption` (unverändert, app.css:101) | 11px / 600 / Versalien / .06em / `--muted` | Gruppentitel über Listen oder Abschnitten |
| Kleine Kennzahl-Beschriftung | `.tilt-stats .k` | `font-size: 12px; font-weight: 500; color: var(--muted);` keine Versalien, keine Laufweite | Tilt-Profil (Fortschritt) |

- Werte für `.kpi-label` entsprechen der Rolle „KPI-Label“ der Typografie-Spezifikation (13/500/`--text-2`). Legt `spec/typografie.md` für diese Rolle einen anderen Wert fest, gilt dieser. Klassenname und Zuordnung bleiben.
- **Vorher → nachher** (der Text im Code ändert sich nicht, nur die Versalien entfallen):
  - „DEIN SCORE“ → „Dein Score“
  - „NETTO-P&L“ → „Netto-P&L“
  - „BALANCE“ / „P&L“ → „Balance“ / „P&L“
  - „TAGE MIT 3 VERLUSTEN IN FOLGE“ → „Tage mit 3 Verlusten in Folge“
  - Session-Ende „HEUTE · TRADES · WIN-RATE“ → „Heute · Trades · Win-Rate“
  - Statistik „GEWINNER · VERLIERER“ → „Gewinner · Verlierer“
  - TradeLog „ENTGANGEN · WÄREN GEWINNER GEWESEN“ → Satzschreibung
  - Serien-Widget „TAGE · TRADES“ → „Tage · Trades“
  - Blind-Replay „SESSION BEENDET“ → „Session beendet“
- **`.caption` bleibt** an:
  - den Gruppentiteln der Seitenleiste (eigene Klasse `.nav-title`)
  - trades.js:76 (Fehler, Emotionen, Gebrochene Regeln, Notizen)
  - progress.js:74–75 (Automatische Regeln, Dein Tag)
  - news.js:83 („Nächste wichtige News“, e2e/newstest.js:93 liest `.nw-next .caption`)
  - replay.js:68 („So ging es weiter“)
  - voice.js:107/115 (Vorschläge)

### Z4 Symbole

- **Coach (menschlicher Mentor) = Doktorhut** im Strichstil der App:
  `coach: sv('<path d="M2 9.5L12 5l10 4.5L12 14z"/><path d="M6 11.5V16c0 1.4 2.7 3 6 3s6-1.6 6-3v-4.5"/><path d="M22 9.5V15"/>')`.
  - Der KI-Mentor behält die Sprechblase (`I.chat`).
  - Profil (`I.account`) und Affiliate (`I.affiliate`) sind Personen, deshalb wird der Coach keine Person.
- **Check-in = Gesicht (`I.mood`)** überall: im Knopf der Tagesansicht und in beiden Leerzuständen.
- **Info-Banner = `I.info`**, das ist der Standard von `U.banner`, ohne `icon`-Option.
- **`I.sparkle` gibt es nicht mehr.** Kein Funkelsymbol in App und Startseite.

### Z5 Geldbeträge: Genauigkeit, Vorzeichen, Währung

**Z5a Genauigkeit nach Bedeutung, nicht nach Größe.** `fmt.cur` hat keine Größenschwelle mehr. `compact: true` wird nur noch ausdrücklich übergeben.

| Art | Nachkommastellen | Beispiel vorher → nachher |
|---|---|---|
| Ergebnisse (P&L, Netto-P&L, Erwartungswert, Ø Gewinn/Verlust, Disziplin-Kosten), Gebühren, Ausgaben, Payouts, Provisionen, Umsätze | immer 2 | Prop-Karte „+11.262 €“ → „+11.262,00 $“; Netto-P&L „Gesamt“ ≥ 10.000 → mit Cent |
| Bestände (Kontostand, Balance, Startkapital, Kontogröße, Mindestbalance) über `fmt.balance` | 0 | „9.876,54 €“ → „9.877 €“; „25.893 €“ bleibt |
| Regelgrößen (Daily Loss, Max. Drawdown, Profit Target, Puffer, „… fehlen“, „heute noch … erlaubt“, Vorschlag „Ø Gewinn pro Tag“, Consistency-Warnung) | 0 | „11.162 $ von 3.000,00 $“ → „11.162 $ von 3.000 $“; „1.946,15 $ fehlen“ → „1.946 $ fehlen“ |
| Monte Carlo (Startkapital, Drawdowns, Endkapital samt Fußzeilen) | 0 | „Median-Drawdown −2.975,94 €“ → „−2.976 €“ |
| Kalender-Monatsraster (Tageszelle `.p`, Wochensumme) | 0 | „−486,02 €“ → „−486 €“; „−1.054 €“ bleibt |
| Diagrammachsen (`fmt.axisCur`) | 0 (bestehend) | – |
| Handy-Kurzform `.pm` | k-Form (bestehend, README:192) | – |

- Ein Paar „X von Y“ hat immer auf beiden Seiten dieselbe Genauigkeit.
- Die Cent eines Kalendertags stehen in der Tagesansicht.

**Z5b Vorzeichen.**
- Ergebnisse haben immer „+“ oder „−“. Das ist der Standard von `U.pnl`.
- Bestände (`fmt.balance`) haben nie ein Vorzeichen.
- `signed: false` an `U.pnl` ist verboten.
- Beispiel: Dashboard und TradeLog „893,04 €“ → „+893,04 €“, wie in der Statistik.

**Z5c Währung.**
- **In Kontowährung (`a.currency`)** steht alles, was genau zu einem Prop-Konto gehört:
  - Balance, P&L, Daily Loss, Max. Drawdown, Ziel, Puffer
  - Payout-Planer: Gewinn seit Start, „von“, „fehlen“, Mindestbalance, „heute noch … erlaubt“, Netto bei Auszahlung, Vorschlag, Consistency-Warnung
  - Grabstein: Größe, Ergebnis, Trade-P&L
- **In Journal-Währung bleiben:**
  - alle Journal-Seiten
  - die Prop-Bilanz (Ausgaben, Payouts, ROI über alle Firmen)
  - die Liste „Payouts dieses Kontos“ (so, wie sie erfasst wurden)
  - die Friedhof-Kacheln (Gebühren)
  - die Stop-Größe aus den Einstellungen im Puffer-Tooltip („/ 150,00 € je Stop-Loss“, e2e/proptest.js:116)
- **Summe über Konten:** je Währung getrennt, mit „ · “ verbunden („+11.262,00 $ · +1.053,85 €“). Bei nur einer Währung steht eine Zahl.
- **Hinweis im Konto-Dialog (prop.js:194):** „Balance, Limits und Puffer in Kontowährung. Trade-P&L bleibt in der Journal-Währung.“ → „Balance, P&L, Limits und Puffer des Kontos in Kontowährung. Trade-Listen zeigen die Journal-Währung.“ Benennt die Wortwahl-Spezifikation „Balance“ in „Kontostand“ um, wird dieser Satz mit umbenannt.

### Z6 Hover und Bewegung in dieser Gruppe

- **Bearbeiten-Leiste:** keine Animation.
- **Ruhepunkt-Startkarten** `.rp-choice:hover`:
  - nur `border-color: var(--border-2); background: var(--surface-2);`
  - Symbolkachel: Fläche mit 20 % Phasenfarbe (wie bisher), ohne Skalierung
  - kein Anheben, kein farbiger Schatten, kein Lichtkegel

  Hover ändert nie die Dauer einer laufenden Animation, sonst springt das Symbol.
  Das Anheben wirkt heute ohnehin nicht. Gemessen: Die Eingangsanimation `rp-in` mit `fill-mode: both` hält `transform: none`, sodass beim Überfahren `matrix(1, 0, 0, 1, 0, 0)` bleibt. Sichtbar ist nur der farbige Schatten `rgb(92, 184, 255) 0px 14px 30px -18px`.
- **Ruhepunkt-Ampelpunkt und Rhythmus-Balken:** ohne Schein.
- **Startseite:** Die Einträge in „Funktionen“ und „Ablauf“ haben keinen Hover-Effekt. Sie sind keine Karten mehr und nicht klickbar.
- **Fortschrittsring:** Die Füll-Animation beim Seitenwechsel bleibt (README:234), aber ohne Schein.

### Z7 Leer- und Nullzustände ohne erfundene Werte

- Bei „% Regeln eingehalten“ ohne Grundlage (`cur.rate == null`, also ohne Regeln oder ohne Regel-Check) gilt:
  - Wert `<span class="muted">—</span>`
  - kein Ring, kein Trend-Pfeil
  - Karte ohne Klasse `ring-card`
- Der Ring zeichnet den Bogen nur bei `rate > 0`. Sonst entsteht bei Länge 0 durch die runde Linienkappe ein grüner Punkt.

### Z8 Startseite (`web/index.html`, `web/css/landing.css`)

- Keine Ankündigungsleiste.
- Große Knöpfe in Satzschreibung, `font-size: 15px`, so groß wie die großen Knöpfe der App (`.replay-decide .btn.big`, `.voice-actions .btn.big`). Das Gewicht kommt aus `.btn` (500) bzw. `.btn.primary` (600).
- **Demo = verkleinerte App:**
  - keine Fensterleiste
  - aktiver Eintrag flach und neutral wie `.nav a.active`
  - Einträge in App-Reihenfolge ohne „Einstellungen“: Dashboard, Statistiken, Fortschritt, TradeLog, Tagesansicht, Notebook, News
  - Beschriftungen nach Glossar (Z12)
  - Kurve monoton
- **Funktionen:** Liste in 2 Spalten (unter 900 px eine Spalte), Trennlinie oben, kein Symbol, keine Kartenfläche. Die Klasse `.feat-card` und der Container `.feats` bleiben, weil `motion.js` (GRID) und e2e/motiontest.js:72–74 sie brauchen.
- **Ablauf:** drei Einträge, jeweils Ziffer in Onest und `--muted` vor dem Titel, kein Kicker. `section.steps > .step` bleibt (index.html:67).

### Z9 Tastenkürzel

- **Belegung unverändert:**

  | Taste | Ziel |
  |---|---|
  | N | Trade loggen |
  | 1 | Dashboard |
  | 2 | TradeLog |
  | 3 | Tagesansicht |
  | 4 | Statistiken |
  | 5 | Notebook |
  | 6 | Fortschritt |
  | 7 | Ruhepunkt |
  | 8 | Mentor |
  | 9 | Schatten-Ich |
  | 0 | Blind-Replay, nur wenn `App.on('replay')`; sonst tut die Taste nichts |

- **Abschaltbar** über die Einstellung `settings.shortcuts`, Standard an (`!== false`). Esc schließt Dialoge immer.
- Der Knopf „Trade loggen“ trägt `aria-keyshortcuts="N"`.
- Die Dokumentation nennt „1–9“.

### Z10 Schriften laden

- Global werden nur Onest (`family=Onest:wght@400..800`) und Satoshi (Fontshare) geladen.
- Inter und Roboto kommen ausschließlich über `Theme.loadFont`, wenn „Klassisch“ gewählt ist.
- Die Canvas-Beispielbilder (sample.js) nutzen Onest.

### Z11 Code-Hygiene

- Keine Regeln, Variablen oder Markup ohne Verwendung.
- Keine wirkungslosen Deklarationen (überschrieben oder auf `transparent` gesetzt).
- Kommentare beschreiben den aktuellen Stand:
  - Prop hat drei Bereiche (Übersicht, Auswertung mit Bilanz und Friedhof, Konten), ohne „Rechner“, „fünf Bereiche“ und „Challenge vs. Funded“.
  - Das Zertifikat hat ein Design (`app`), ohne „Navy und Hell“.
  - Der Friedhof ist flach, ohne „Körnung, Riss, Grablicht“.

### Z12 Wortwahl in dieser Gruppe

Glossar-Ausschnitt; maßgeblich ist `spec/wording.md` bzw. `audit/inventar-wording.md` Abschnitt 1.

| Begriff / Stelle | Regel | vorher → nachher |
|---|---|---|
| Netto-P&L | mit Bindestrich (Glossar) | Startseite: „Netto-P&L“ bleibt (nicht „Netto P&L“) |
| Trefferquote | statt Win-Rate (Glossar) | Startseite: „Trade-Win-Rate“ → „Trade-Trefferquote“; „Win-Rate, Profit-Faktor …“ → „Trefferquote, Profit-Faktor …“ |
| Bearbeiten-Leiste | Mittelpunkt als Trenner wie überall | „Bearbeitungsmodus – Standard“ → „Bearbeitungsmodus · Standard“ |
| Startseiten-Knöpfe | Satzschreibung | „JOURNAL ÖFFNEN“ → „Journal öffnen“ (nur CSS, der HTML-Text ist schon richtig) |
| Ablauf Startseite | Ziffer statt Kicker | „SCHRITT 1 / Session starten“ → „1 Session starten“ |
| Einstellungen → Profil | neuer Block | Überschrift „Bedienung“, Schalter „Tastenkürzel“, Text „**N** Trade loggen · **1–9** Bereich wechseln“ |
| Fußzeile „Daten und Sicherung“ | ohne Tastatur-Teil (steht jetzt am Schalter) | „… (localStorage und IndexedDB). Tastatur: N neuer Trade · 1–6 Bereiche · Esc schließt Dialoge.“ → „… (localStorage und IndexedDB).“ |
| README Tastatur | Belegung richtig | „**1–6** Bereiche“ → „**1–9** Bereiche (0 = Blind-Replay, nur wenn freigeschaltet)“ |
| Konto-Dialog Prop | siehe Z5c | – |

---

## 2. Konflikte und Entscheidungen

**K1 · ki_look-10 ↔ bereich_dashboard-41 (zusammengeführt mit referenz-25, hierarchie-43)**
- Alle vier Befunde betreffen dieselbe Linie (app.css:524–525). Sie unterscheiden sich nur im Abstand: `padding-top` 8 px bleibt bzw. wird 4 px.
- Die auslaufende Linie geht auf den ausdrücklichen Wunsch des Nutzers vom 02.10. zurück (Commit 86a71e9).
- **Entscheidung:** nicht umsetzen, sondern unter N1 fragen. Meine Empfehlung dort: ganz weglassen, 4 px. Zwei der drei Vorschläge nennen 4 px, und die 8 px waren nur Abstand für die Linie.

**K2 · ki_look-17 ↔ bereich_shell-28 (Coach-Symbol)**
- ki_look-17 schlägt eine Person vor, bereich_shell-28 einen Doktorhut.
- **Entscheidung: Doktorhut.** Im Konto-Menü stünden sonst drei Personen untereinander (Profil, Coach, Affiliate). Die Kopf-Körper-Form wäre fast gleich wie bei `I.affiliate`. So steht es auch in der Prüfer-Anmerkung zu bereich_shell-28.

**K3 · bereich_konto-17 ↔ ki_look-33 (Mentor-Notiz)**
- Beide Befunde betreffen dasselbe. Sie unterscheiden sich nur in drei Punkten: Rand (`--border-2` gegen `--border`), Eingrenzung (`.mentor-notes > .mentor-note` gegen `.mentor-notes .mentor-note`) und ob die Pille neutral wird.
- **Entscheidung:**
  - **Rand `--border`:** Die App hat dafür schon eine Regel für „leicht angehobene Fläche, feiner Rand“ (`.nav a.active`, `.coach-radio`). Die Fläche `--surface-2` trennt bereits.
  - **Selektor `.mentor-notes > .mentor-note`:** coach.js:139 und :243 setzen die Notizen als direkte Kinder. Der KI-Hinweis in mentor.js:85 heißt ebenfalls `.mentor-note` und fällt damit aus der Coach-Regel heraus. Er behält nur app.css:2363.
  - **Pille neutral:** Bernstein bedeutet Warnung.
- Verträglich mit komponenten/bereich_training-1, das den KI-Hinweis in `.mentor-disclaimer` umbenennt, und mit wording/aufbau-29, das den Pillentext „Mentor“ in „Coach“ umbenennt. Hier ändert sich nur der Ton der Pille.
- Die grüne Neu-Markierung `.mn-reply.is-new { box-shadow: inset 2px 0 0 var(--accent) }` gehört nicht zu diesen Befunden und bleibt. Sie hat dieselbe Rolle wie ein Hinweis-Punkt.

**K4 · diagramme-4 ↔ aufbau/hierarchie-4 und wording/bereich_prop-5**
- Die Prüfer-Anmerkung zu hierarchie-4 nennt „Balance in Kontowährung, P&L in Journal-Währung“ eine Entscheidung, die der Nutzer treffen müsste.
- Sie stammt aber nicht vom Nutzer. Sie kam mit Commit ee2c2af („Prop Firms: Funde der Prüfung behoben“) aus einer Prüfung durch Claude. In der Mitschrift und im README steht nichts dazu. diagramme-4 ist mit `beruehrt_vorgaben: false` bestätigt.
- Weil `balance = start + Σ pnl` ohne Umrechnung gerechnet wird, ist nur eine Währung richtig.
- **Entscheidung: umsetzen** (C19, C20) und die Tests anpassen (C27).
- Der Teil von hierarchie-4, „Gewinn fehlt“ nur bei Funded-Konten zu zeigen, ist ein eigener Schritt der Aufbau-Gruppe und verträgt sich damit.
- Den Hinweistext legt Z5c fest. Die Wortwahl-Fassung von bereich_prop-5 („Kontostand, …“) wird übernommen, sobald „Balance“ in der ganzen App umbenannt ist.

**K5 · diagramme-32 ↔ typografie-14, zustaende-23 und wording-53**
- Alle drei ändern ui.js:122 gleich. Wer zuerst kommt, ändert, der andere überspringt.
- Hier kommen die Bedeutungsregel (Z5a) und `fmt.balance` ganzzahlig dazu.
- wording-53 will die Affiliate-Kacheln ganzzahlig. Das widerspricht Z5a, denn Umsatz und Provisionen sind Geldflüsse.
- **Entscheidung:** Cent bleiben. Läuft eine Kachel über, verkleinert die Container-Abfrage (app.css:533) die Zahl.

**K6 · diagramme-35 ↔ wording-7**
- Gleicher Inhalt. wording-7 schreibt `{ signed: true }`, hier fällt die Option ganz weg (gleiches Ergebnis, Standard von `U.pnl`). trades.js:26 kommt hier dazu.

**K7 · diagramme-31 ↔ wording/bereich_dashboard-17**
- Gleiche Änderung an widgets.js:115–116. Der Strich `--` → `—` (widgets.js:127) bleibt bei der Wortwahl-Gruppe.
- Den Zusatz „title-Attribut mit Cent“ aus den Prüfer-Anmerkungen setze ich nicht um (R3).

**K8 · ki_look-36 ↔ typografie-4, referenz-43, bereich_dashboard-44, bereich_trades_tag-39, bereich_training-21**
- **Klassenname `.kpi-label`** (wie typografie-4), nicht `.val-label` oder `.k-label`, damit es nur eine Klasse gibt.
- **Größe 13 px** statt 13,5 px aus ki_look-36, passend zur Typo-Skala (typografie-3).
- **Abgelehnt:**
  - bereich_dashboard-44 will „Heutiger Score“ (widgets.js:287) als `.caption` in Versalien. Es ist aber eine Beschriftung über einem Wert, also `.kpi-label`, gleich wie „Dein Score“.
  - bereich_trades_tag-39 will day.js:14 als `.caption` lassen. Das widerspricht typografie-4 und referenz-43, die dieselbe Stelle umstellen.
- **Tilt-Labels 12 px/500** wie bereich_training-21 und abstaende_layout-27. Die 12,5 px aus ki_look-36 stehen nicht auf der Skala.

**K9 · ki_look-12 ↔ bewegung/bereich_dashboard-9**
- Gleicher Befund. Fläche `--surface-2` aus bereich_dashboard-9, weil die Leiste über Karten mit `--surface` schwebt. Bei `--surface` aus ki_look-12 hebt sie sich nicht ab.
- Trenner „·“ aus bereich_dashboard-9. Das Markup in C12 ist die gemeinsame Endfassung.

**K10 · ki_look-6 ↔ diagramme/bereich_training-7 und zustaende-11**
- „Bogen nur bei rate > 0“ (zustaende-11) gehört hierher, weil es denselben grünen Kappenpunkt behebt.
- Die Ringfarbe `--text-2` aus bereich_training-7 bleibt bei der Diagramm-Gruppe.
- Die Größe (116 → 88 bzw. 72 px) ändert den Wunsch des Nutzers „größer“ vom 28.09. Sie steht deshalb unter N2.

**K11 · bereich_training-45 (mit bewegung-36, bewegung-7, bewegung-8, ki_look-27) ↔ bewegung/komponenten-13**
- komponenten-13 will `.rp-choice` als eigene Bildsprache behalten. bewegung-36 will das Anheben wie `.tile:hover`.
- **Entscheidung:** Hover nur über Rand und Fläche (Z6), wie in den Prüfer-Anmerkungen zu bereich_training-45. Das Anheben ist heute wirkungslos (gemessen, siehe Z6), und ein Rand in der Phasenfarbe wäre ein bunter Akzent.
- **Sofort umgesetzt:**
  - Farbschein, Lichtkegel und Skalierung des Symbols entfallen.
  - Die Regeln, die beim Hover die Dauer ändern, werden gelöscht. Das behebt den Sprung, den bewegung-8 beschreibt.
  - Ampelpunkt und Rhythmus-Balken verlieren ihren Schein.
- **Unter N3 offen:** das Pausieren der Symbole im Ruhezustand und das Glühen in den Keyframes `rp-sun`/`rp-moon`. Beides ist Teil der Symbole, die der Nutzer ausdrücklich gelobt hat.

**K12 · bereich_training-49 ↔ komponenten/bewegung-41**
- Doppelt. Gleiche Löschung (app.css:2147–2151, Teil von 2333). Wird nur einmal ausgeführt.

**K13 · bereich_notebook_news-36 ↔ typografie-17, zustaende/farbe_kontrast-29, typografie/bereich_notebook_news-14**
- Alles verträglich:
  - `.journal` löschen (auch typografie-17, Schritt 3)
  - Zeile 783 löschen (behebt farbe_kontrast-29)
  - 1085/1086 zusammenführen mit den Werten aus bereich_notebook_news-14 (13 px/500)
- `.folder` (775–778) ist global, wird im Notebook genutzt und **bleibt**.
- 1028 `.nb .note-title:focus` bleibt.

**K14 · ki_look-43 ↔ Wortwahl-Glossar**
- Der Vorschlag „Netto-P&L“ → „Netto P&L“ widerspricht dem Glossar (Netto-P&L mit Bindestrich, wording-6 ändert die App-Kachel genau so).
- **Entscheidung:** Die Startseite behält „Netto-P&L“. „Trade-Win-Rate“ und „Win-Rate“ werden „Trefferquote“.
- Der „Echte Aufnahmen“-Teil ist zurückgestellt (R1).
- Der Prüfer-Hinweis auf den grünen aktiven Navigationslink (landing.css:8–10) gehört nicht zu diesem Befund und nicht in diese Spezifikation (Farbe-Gruppe).
- ki_look-3 (Abstände-Gruppe) benennt evtl. `.shot` um. Die Schritte in B8 sind über den Inhalt der Regel beschrieben und gelten unter dem neuen Namen genauso.

**K15 · ki_look-44 intern (15 oder 16 px)**
- Die Prüfer-Anmerkung „kein Grund zur Senkung“ steht gegen den Vorschlag 15 px.
- **Entscheidung: 15 px.** Die großen Knöpfe der App sind 15 px (app.css:2530, 2576). Ein großer Knopf hat damit eine Größe.

**K16 · barrierefreiheit-43 ↔ aufbau-21, wording/bereich_shell-32, wording-20, aufbau-25**
- Alle wollen die Belegung behalten, „0“ nur mit Replay und die Doku auf „1–9“ bringen.
- Mein Weg ist `if (App.on('replay')) map['0'] = 'replay';` (`App.on` ist exportiert, app.js:44). Dafür braucht es keine neue Methode `feature()` wie in bereich_shell-32.
- wording-20 schreibt die Fußzeile mit Kürzel-Legende neu. Hier steht die Legende am neuen Schalter, und die Fußzeile verliert den Tastatur-Teil.
- **Entscheidung:** Legende am Schalter, um die Doppelung zu vermeiden. Den Speicherort-Satz in der Fußzeile formuliert die Wortwahl-Gruppe.
- Baut aufbau-25 „Profil“ um, wandert der Block „Bedienung“ mit den übrigen allgemeinen Einstellungen mit.

**K17 · bereich_notebook_news-41 ↔ ki_look-37 (verworfen)**
- ki_look-37 ist in `findings-dropped.json`. Die Beschriftung „Nächste wichtige News“ bleibt, nur die Glocke fällt weg.

**K18 · bereich_shell-35 ↔ abstaende/bereich_shell-2**
- bereich_shell-2 verschiebt die beiden `@media`-Blöcke (app.css:146–157) hinter Zeile 187.
- Die Änderungen in C1 (Zeile 152 löschen, `, .nav button` streichen) gelten für diese Blöcke, egal wo sie stehen.

**K19 · ki_look-17 ↔ farbe/zustaende-7, bereich_dashboard-14 und zustaende/bereich_statistik-46**
- bereich_statistik-46 will `'sparkle'` in stats.js:61 behalten, als „Check-in-Symbol der App“. Mit Z4 ist das Check-in-Symbol `mood`.
- **Entscheidung:** auch stats.js:61 → `'mood'`.
- Banner: Die Option `icon` wird gestrichen, es kommt das Standard-Info-Symbol, wie bei der Farbe-Gruppe. Kein `icon: false` mit API-Änderung an `U.banner`.

**K20 · ki_look-42**
- Mit dem Umbau zur Liste entfallen die Hover-Effekte der Funktions- und Ablauf-Karten (landing.css:55–58). Es sind keine Karten mehr.
- Das ist keine Nutzer-Entscheidung. Der Animations-Auftrag vom 30.09. verlangte allgemein „dezente Hover-Zustände … Weniger ist mehr“, nicht diese Karten.
- Der Hover am Demo-Fenster (landing.css:59–60) bleibt.

---

## 3. Umsetzungsschritte

**Reihenfolge:**
1. Phase A: Skalen und Tokens
2. Phase B: Komponenten
3. Phase C: Einzelstellen, nach Datei

Innerhalb einer Phase stehen die Schritte nach Datei sortiert. C25 (sparkle löschen) muss nach C12–C15 kommen.

### Phase A · Skalen und Tokens

**A1 · web/js/ui.js:122 · `fmt.cur` – Genauigkeit** (diagramme-32)
- vorher: `const a = Math.abs(v); const d = o.compact ? 0 : (a >= 10000 ? 0 : 2);`
- nachher: `const a = Math.abs(v); const d = o.compact ? 0 : 2;`

**A2 · web/js/ui.js:117–118 · `fmt.balance` – Bestände ganzzahlig** (diagramme-32)
- vorher:
  ```js
  /* Kontostand: im Geld-blind-Modus komplett ausgeblendet */
  balance(v, o = {}) { return blind.on ? (…) : fmt.cur(v, o); },
  ```
- nachher:
  ```js
  /* Kontostand und andere Bestände: ganzzahlig, ohne Vorzeichen; im Geld-blind-Modus komplett ausgeblendet */
  balance(v, o = {}) { return blind.on ? (…) : fmt.cur(v, Object.assign({ compact: true }, o)); },
  ```
- Wirkt auf widgets.js:168 (Kontostand-Kachel), widgets.js:358 (Prop-Widget), prop.js:102, prop.js:283 und prop-friedhof.js:136.

**A3 · web/js/ui.js:165 · Regel zu `U.pnl`** (diagramme-35)
- Direkt über `const pnl = …` einfügen:
  `/* Ergebnisse (P&L, Erwartungswert, Ø Gewinn/Verlust) immer mit Vorzeichen; Bestände laufen über fmt.balance ohne Vorzeichen. signed: false hier nicht übergeben. */`

**A4 · web/css/app.css:101 · neue Rolle `.kpi-label`** (ki_look-36)
- Hinter die Zeile mit `.caption { … }` einfügen:
  `.kpi-label { font-size: 13px; line-height: 18px; font-weight: 500; color: var(--text-2); } /* Beschriftung direkt über einem Wert, Satzschreibung; .caption bleibt für Abschnittslabels */`

**A5 · web/app.html:11 und web/index.html:11 · Schriften** (typografie-33)
- vorher: `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap">`
- nachher: `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Onest:wght@400..800&display=swap">`

**A6 · web/js/sample.js:311, 321, 323, 324, 325 · Canvas-Schrift** (typografie-33)
- In allen fünf `g.font`-Zeilen `Inter, Roboto, sans-serif` → `Onest, sans-serif`.

### Phase B · Komponenten

**B1 · web/js/ui.js:22 · `I.coach`** (bereich_shell-28, ki_look-17)
- vorher: `coach: sv('<path d="M12 3l1.8 4.6L18 9.5l-4.2 1.9L12 16l-1.8-4.6L6 9.5l4.2-1.9z"/><path d="M19 15l.8 2 …"/>'),`
- nachher: `coach: sv('<path d="M2 9.5L12 5l10 4.5L12 14z"/><path d="M6 11.5V16c0 1.4 2.7 3 6 3s6-1.6 6-3v-4.5"/><path d="M22 9.5V15"/>'),`
- Der Schlüssel bleibt. Damit gilt die Änderung automatisch in app.js:231 (Konto-Menü) und coach.js:22, :112, :172, :188.

**B2 · web/css/app.css · Bearbeiten-Leiste** (ki_look-12)
- **Z. 1567** `.edit-bar`: `border: 1px solid var(--accent); background: color-mix(in srgb, var(--accent) 10%, var(--surface));` → `border: 1px solid var(--border-2); background: var(--surface-2);`. `position: sticky`, `box-shadow: var(--shadow)` und alles Übrige bleiben.
- **Z. 1568** `.dot-live { … animation: pulse 1.6s infinite; }` löschen.
- **Z. 1115** `@keyframes pulse { … }` löschen. Die Keyframes `streak-pulse` und `streak-pulse-3` sind eigene und bleiben.

**B3 · web/css/app.css:2880–2916 · Mentor-Notiz** (bereich_konto-17, ki_look-33)
- **2880** Kommentar → `/* Mentor-Notiz (Coach): neutrale Fläche mit feinem Rand und Kopfzeile (Pille „Mentor“, Name, Zeit); gilt nur innerhalb von .mentor-notes */`
- **2882** `.mentor-notes.in-note { …; border-top: 1px dashed var(--border-2); }` → `border-top: 1px solid var(--border);`
- **2884** vorher `.mentor-note { position: relative; padding: 10px 12px 10px 16px; border-radius: 10px; background: color-mix(in srgb, var(--warn) 6%, var(--surface-2)); border: 1px solid color-mix(in srgb, var(--warn) 28%, var(--border)); }`
  → nachher `.mentor-notes > .mentor-note { padding: 10px 12px; border-radius: 10px; background: var(--surface-2); border: 1px solid var(--border); }`
- **2885** `.mentor-note::before { … }` löschen.
- **2886–2889** den Selektor-Anfang `.mentor-note` → `.mentor-notes > .mentor-note`:
  - `… .mn-head`
  - `… .mn-head b`
  - `… .mn-text`
  - `… .mn-edit`
- **2914** `.mn-thread { …; border-top: 1px dashed color-mix(in srgb, var(--warn) 22%, var(--border)); }` → `border-top: 1px solid var(--border);`
- **2916** `.mn-reply.mentor { background: color-mix(in srgb, var(--warn) 5%, transparent); }` → `.mn-reply.mentor { background: color-mix(in srgb, var(--text) 4%, transparent); }`
- **2363** `.mentor-note { padding: 0 18px 12px; }` (KI-Hinweis im Mentor-Chat) **unverändert**.

**B4 · web/css/app.css:1317 · Fortschrittsring ohne Schein** (ki_look-6)
- vorher: `.ring-arc .arc { stroke: var(--accent); transition: stroke-dashoffset 1.1s cubic-bezier(.22, .61, .36, 1); filter: drop-shadow(0 0 6px var(--accent-glow)); }`
- nachher: `.ring-arc .arc { stroke: var(--accent); transition: stroke-dashoffset 1.1s cubic-bezier(.22, .61, .36, 1); }`
- 1312 `margin-right: 150px` bleibt, weil der Ring 116 px groß bleibt (N2).

**B5 · web/css/app.css · Ruhepunkt-Startkarten und Schein-Reste** (bereich_training-45 mit bewegung-36, bewegung-8; ki_look-27 teilweise)
- **2156** `.rp-choice { …; transition: border-color var(--dur-2) var(--ease), transform var(--dur-2) var(--ease), box-shadow var(--dur-2) var(--ease), background var(--dur-2) var(--ease); …}` → `transition: border-color var(--dur-2) var(--ease), background var(--dur-2) var(--ease);`. `position: relative; overflow: hidden;` bleiben.
- **2157** `.rp-choice::before { … radial-gradient … }` löschen.
- **2158** vorher `.rp-choice:hover { border-color: color-mix(in srgb, var(--c) 60%, var(--border)); transform: translateY(-2px); box-shadow: 0 14px 30px -18px var(--c); }`
  → nachher `.rp-choice:hover { border-color: var(--border-2); background: var(--surface-2); }`
- **2159** `.rp-choice:hover::before, .rp-choice:focus-visible::before { opacity: 1; }` löschen.
- **2160** `.rp-choice:active { transform: translateY(0); }` löschen. Die Regel ist wirkungslos, weil `rp-in` mit `both` das transform hält.
- **2161** in `.rp-choice .rp-icon` die transition `background var(--dur-2) var(--ease), transform var(--dur-2) var(--ease)` → `background var(--dur-2) var(--ease)`.
- **2162** vorher `.rp-choice:hover .rp-icon { background: color-mix(in srgb, var(--c) 20%, var(--surface-2)); transform: scale(1.04); }`
  → nachher `.rp-choice:hover .rp-icon { background: color-mix(in srgb, var(--c) 20%, var(--surface-2)); }`
- **2166** `.rp-choice:hover .rp-i-sun, .rp-choice:hover .rp-i-rays { animation-duration: 2.2s; }` löschen. Behebt den Sprung.
- **2177** `.rp-choice:hover .rp-i-ring, .rp-choice:hover .rp-i-ring2, .rp-choice:hover .rp-i-pause { animation-duration: 2s; }` löschen.
- **2248** `.rp-ampel .rp-dot { …; background: var(--c); box-shadow: 0 0 12px var(--c); }` → `box-shadow` streichen.
- **2282** `.rp-seq-i i { …; background: var(--phase); box-shadow: 0 0 8px color-mix(in srgb, var(--phase) 50%, transparent); }` → `box-shadow` streichen.
- **Nicht ändern:**
  - 2164–2180 (Symbol-Animationen, `drop-shadow` in `rp-sun`/`rp-moon`): erst nach Antwort auf N3
  - 2120–2131 (Farbflächen)
  - `.rp-tide`, `.rp-tide-glow`

**B6 · web/css/app.css:1302 · Tilt-Labels** (ki_look-36)
- vorher: `.tilt-stats .k { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; font-weight: 700; }`
- nachher: `.tilt-stats .k { font-size: 12px; color: var(--muted); font-weight: 500; }`

**B7 · web/css/app.css · News-Hero** (bereich_notebook_news-41)
- **3071–3072** `.nw-next-ico { … }` und `.nw-next-ico svg { … }` löschen.
- **3119** im Block `@media (max-width: 640px)` an die Regel `.nw-next-when { … }` `flex-basis: 100%;` anhängen. Der Countdown bricht damit am Handy immer in eine eigene zweite Zeile.

**B8 · web/css/landing.css · Startseite** (ki_look-42, ki_look-43, ki_look-44)
- **3** `.lp .ribbon { … }` löschen.
- **18** vorher `.lp .btn.big { padding: 16px 30px; font-size: 16px; border-radius: 16px; text-transform: uppercase; letter-spacing: .04em; }`
  → nachher `.lp .btn.big { padding: 16px 30px; font-size: 15px; border-radius: 16px; }`
- **21–23** löschen (die drei Regeln `.lp .shot .frame .bar`, `.lp .shot .frame .bar i`, Ampelfarben `#ff5f57/#febc2e/#28c840`).
- **27** vorher `.lp .demo .side div.on { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }`
  → nachher `.lp .demo .side div.on { border-color: var(--border); color: var(--text); background: var(--surface-2); }`
- **35** vorher `.lp .feats { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 14px; }`
  → nachher `.lp .feats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 48px; }`
- **36** vorher `.lp .feat-card { border: 1px solid var(--border); border-radius: 16px; padding: 20px; background: var(--surface); }`
  → nachher `.lp .feat-card { border-top: 1px solid var(--border); padding: 20px 0; }`
- **37–38** `.lp .feat-card .ico { … }` und `.lp .feat-card .ico svg { … }` löschen.
- **39** vorher `.lp .feat-card b { display: block; font-family: var(--font-display); font-size: 16px; margin-bottom: 6px; }`
  → nachher `.lp .feat-card b, .lp .step b { display: block; font-family: var(--font-display); font-size: 16px; font-weight: 600; margin-bottom: 6px; }`
- **41** in `.lp .steps { … }` `gap: 14px` → `gap: 0 48px`.
- **42** vorher `.lp .step { padding: 22px; border-radius: 16px; background: var(--surface-2); border: 1px solid var(--border); }`
  → nachher `.lp .step { padding: 20px 0 0; border-top: 1px solid var(--border); }`
- **43** vorher `.lp .step .k { font-family: var(--font-display); color: var(--accent); font-weight: 800; font-size: 13px; letter-spacing: .1em; margin-bottom: 8px; }`
  → nachher `.lp .step .k { font-family: var(--font-num); color: var(--muted); font-weight: 500; margin-right: 8px; }`
- **44** `.lp .step p { color: var(--text-2); font-size: 14px; margin-top: 6px; }` → `.lp .step p { color: var(--text-2); font-size: 14px; }`
- **47** im Block `@media (max-width: 900px) { … }` ergänzen: `.lp .feats { grid-template-columns: 1fr; }`
- **49** Kommentar → `/* Bewegung auf der Startseite: Hero blendet beim Laden ein (reines CSS, ohne JS sichtbar) */`
- **55–58** löschen:
  - `.lp .feat-card, .lp .step { transition … }`
  - `… :hover { transform … }`
  - `.lp .feat-card .ico { transition … }`
  - `.lp .feat-card:hover .ico { … }`
- 59–60 (`.lp .shot .frame` Hover) bleiben.

### Phase C · Einzelstellen, nach Datei

**C1 · web/css/app.css · Shell-Reste** (bereich_shell-35; erst nach C7/C8 Teil „Schriftzug“, weil Z. 159 sonst „yst“ kursiv macht)
- **Aus den Selektorlisten nur den `.nav button`-Teil streichen:**
  - **149** `.nav a, .nav button { padding-top: 6px; padding-bottom: 6px; }` → `.nav a { … }`
  - **155** wie 149
  - **169** `.nav a, .nav button {` → `.nav a {`
  - **175** `.nav a svg, .nav button svg` → `.nav a svg`
  - **176** `.nav a:hover, .nav button:hover` → `.nav a:hover`
  - **177** `.nav a:active, .nav button:active` → `.nav a:active`
  - **195** `html.sb-mini .nav a, html.sb-mini .nav button {` → `html.sb-mini .nav a {`
  - **196** `html.sb-mini .nav a span, html.sb-mini .nav button span` → `html.sb-mini .nav a span`
- **Löschen:**
  - **152** `.nav.nav-sec { margin-top: 8px; }` (in `@media … max-height: 1060px`)
  - **159** `.brand em { font-style: normal; color: inherit; }`
  - **163** `.sidebar hr { … }`
  - **165** `.nav.nav-sec { margin-top: 12px; }`
  - **186** `.nav .badge-n { … }`
- **199** `.theme-toggle { … align-self: flex-start; … margin: 10px 16px 0; … }` → `align-self: flex-start;` streichen, `margin: 10px 16px 0;` → `margin: 0;`
- **Löschen:**
  - **207** `html.sb-mini .theme-toggle { flex-direction: column; align-self: center; margin: 10px 0 0; }`
  - **208** `html.sb-mini[data-theme="light"] .theme-toggle::before { transform: translateY(22px); }`
  - **225–228** `.menu-btn svg path { … }` und die drei `:nth-child`-Regeln
  - **241** der verwaiste Kommentar `/* helles Design: Balken und Punkte … */`
  - **255** `.sb-menu .theme-toggle, html.sb-mini .sb-menu .theme-toggle { margin: 0; flex-direction: row; align-self: auto; }` (jetzt Grundwert)
  - **256** `html.sb-mini[data-theme="light"] .sb-menu .theme-toggle::before { transform: translateX(26px); }` (übernimmt 201)

**C2 · web/css/app.css · Notebook-Reste** (bereich_notebook_news-36)
- **769** Kommentar `/* ---------- Journal ---------- */` → `/* ---------- Notebook-Ordner ---------- */`
- **770–774** `.journal …` (5 Regeln) löschen.
- **775–778** `.folder …` **bleiben**.
- **779–787** löschen: `.note-item`, `:hover`, `.active`, `b`, `span`, `.note-title`, `.note-title:focus`, `.note-body`, `.note-body:focus`.
- **788** `@media (max-width: 960px) { .journal … }` löschen.
- **1028** `.nb .note-title:focus { outline: none; }` **bleibt**.
- **1057** `.nb .tags-row input { max-width: 190px; … }` und **1059** `.nb .tags-row input { max-width: none; }` löschen.
- **1085–1086** vorher `.nb-toolbar .tb.turn .lbl { font-size: 15px; }` und `.nb-toolbar .tb .lbl { font-size: 13px; font-weight: 600; }`
  → nachher eine Regel `.nb-toolbar .tb.turn .lbl { font-size: 13px; font-weight: 500; }`. Werte aus typografie/bereich_notebook_news-14. `.lbl` gibt es nur im Umwandeln-Knopf (editor.js:118).

**C3 · web/css/app.css · Zertifikat-Grundregeln** (ki_look-31; zusammen mit C11)
- **1973–1974** im Kommentar „…, feiner Kartenrahmen und im Hintergrund die Kurslinie aus der Ladeanzeige.“ → „…, feiner Kartenrahmen.“
- **1977** in `.cert { … }` `--c-line: rgba(208, 215, 255, .6);` streichen.
- **1978** die ganze Zeile löschen (`--c-glow`, `--c-glow2`, `--c-bar`, `--c-band`, `--c-band2`).
- **1979** die ganze Zeile löschen (`--g1`, `--g2`, `--gn1`, `--gn2`).
- **1993–1995** die drei Kommentarzeilen (zweimal Kurslinie, „Rahmenecken (nur Navy und Hell)“) löschen.
- **1997** `/* ---------- Navy und Hell ---------- */` → `/* ---------- Grundregeln (Aufbau und Formate) ---------- */`
- **2000** `.cert-brand { …; color: var(--g1); … }` → `color: var(--c-text);`
- **2002–2003** in `.cert-title .ct-big` die ganze zweite Zeile `background: linear-gradient(…); -webkit-background-clip: text; background-clip: text; color: transparent; -webkit-text-fill-color: transparent;` löschen. Die Regel endet mit `white-space: nowrap; }`.
- **2010** vorher `.cert-value span { display: inline-block; padding-bottom: .04em; background: linear-gradient(…); -webkit-background-clip: text; background-clip: text; color: transparent; -webkit-text-fill-color: transparent; }`
  → nachher `.cert-value span { display: inline-block; padding-bottom: .04em; }`. `display: inline-block` bleibt, sonst verliert die Ergebnis-Pille Innenabstand und Rundung.
- **2011** `.cert[data-sign="neg"] .cert-value span { background-image: … }` löschen.
- **2022** `.cert-foot .issue .line { … }` löschen.
- **2049** `.cert[data-theme="app"] .cert-brand .name em { … }` löschen (nach C11).
- **2052** in `.cert[data-theme="app"] .cert-title .ct-big` `background: none;` und `-webkit-text-fill-color: var(--c-text);` streichen. `color: var(--c-text)` bleibt.
- **2059** `-webkit-text-fill-color: var(--c-acc)` **bleibt**, weil e2e/certtest.js:17 es prüft.
- **2077** `.cert[data-theme="app"] .cert-foot .issue .line { display: none; }` löschen.

**C4 · web/css/app.css · Ruhepunkt-Schalter-Reste** (bereich_training-49 = bewegung-41)
- **2147–2151** die fünf Regeln `.rp-switch …` löschen.
- **2333** in der Liste `.rp-switch input, .rp-switch input::after, .rp-choice { transition: none; }` den Teil `.rp-switch input, .rp-switch input::after, ` streichen. Übrig bleibt `.rp-choice { transition: none; }`.

**C5 · web/css/app.css · Prop-Reste** (bereich_prop-51)
- **Kommentare:**
  - **2585** im Kommentar „…, Trade-Zuordnung, Rechner (Klassen mit Präfix prop-)“ → „…, Trade-Zuordnung (Klassen mit Präfix prop-)“
  - **2587** → `/* Prop Firms: drei Bereiche als Schiene links in der Kopfreihe, Unteransichten (Bilanz, Friedhof) als Reiter mit Unterstrich */`
  - **2683** `/* Rechner: Eingaben links, Ergebnis rechts */` → `/* Kennzahlen-Leiste: Wertgröße */`
  - **2760** „Prop Firms, Phase 3: Konto-Friedhof (Grabsteine, Muster) und Challenge vs. Funded (Vergleichstabelle)“ → „Prop Firms, Phase 3: Konto-Friedhof (Grabsteine, Muster)“
  - **2766–2768** die beiden Kommentare → ein Kommentar `/* Friedhof: jede Breach-Karte ist ein flacher Grabstein in den Flächenfarben der App, auf einem Sockel mit Kerzen */`
- **2734–2735** `/* Rechner */` und `.prop-unv { … }` löschen.
- **2763–2765** nur die `.prop-highlights…`-Selektoren streichen:
  - `.prop-patterns { … }`
  - `.prop-patterns li::marker { … }`
  - `.prop-patterns-empty { … }`
- **2770** in `.prop-grave { … }` die Eigenschaften `--eng-hi: …; --eng-lo: …; --grain: url(…);` streichen. Die übrigen Deklarationen bleiben.
- **2779** `--eng-hi: transparent; --eng-lo: transparent;` streichen. Der Kommentar wird „flach: Flächenfarben der App“.
- **Wirkungslose `text-shadow` streichen:**
  - **2793** `.pg-rip`: `text-shadow: 0 1px 0 var(--eng-hi), 0 -1px 0 var(--eng-lo);`
  - **2795** `.prop-grave-head b`: dasselbe
  - **2799** `.pg-dates`: `text-shadow: 0 -1px 0 var(--eng-lo);`
  - **2805** `.pg-cause b`: dasselbe wie 2793
- **2839** `:root[data-theme="light"] .prop-grave-kv { … }` löschen.
- **2842–2844** `.prop-grave .kv`, `.prop-grave .kv > b`, `.prop-grave-trade` löschen. Im Block bleibt `.pg-stone { margin: 0 22px; }`.

**C6 · web/app.html:93–96 · Tastenkürzel** (barrierefreiheit-43)
- Erste Zeile im keydown-Listener: `if (window.Store && Store.settings && Store.settings.shortcuts === false) return;`
- **95** vorher `const map = { '1': 'dashboard', …, '9': 'shadow', '0': 'replay' };`
  → nachher `const map = { '1': 'dashboard', '2': 'trades', '3': 'day', '4': 'stats', '5': 'notebook', '6': 'progress', '7': 'ruhepunkt', '8': 'mentor', '9': 'shadow' }; if (App.on('replay')) map['0'] = 'replay';`

**C7 · web/index.html · Startseite** (ki_look-42, ki_look-43, ki_look-44, bereich_shell-35; Z. 11 siehe A5)
- **20** `<div class="ribbon">Neu: Session-Check-in …</div>` löschen.
- **22** `<span>Journal<em>yst</em></span>` → `<span>Journalyst</span>`
- **34** `<div class="shot"><div class="frame"><div class="bar"><i></i><i></i><i></i></div><div class="demo">` → `<div class="shot"><div class="frame"><div class="demo">`
- **35** Inhalt von `.side` → `<div class="on">Dashboard</div><div>Statistiken</div><div>Fortschritt</div><div>TradeLog</div><div>Tagesansicht</div><div>Notebook</div><div>News</div>`
- **37** „Netto-P&L“ bleibt (K14).
- **39** `<span>Trade-Win-Rate</span>` → `<span>Trade-Trefferquote</span>`
- **41** beide `d`-Attribute ersetzen:
  - Fläche: `M0,110 C46.7,103.2 93.3,96.3 140,92 C186.7,87.7 233.3,89.3 280,84 C326.7,78.7 373.3,62.2 420,55 C473.3,46.8 526.7,45.1 580,40 C653.3,32.9 726.7,25.5 800,18 L800,130 L0,130 Z`
  - Linie: derselbe Pfad ohne ` L800,130 L0,130 Z`

  Nachgerechnet mit dem d3-Verfahren monotoneX durch dieselben sechs Punkte. Die Kurve steigt überall, statt bei x≈580 einzusacken.
- **48–53** in jeder `.feat-card` das `<div class="ico"><svg …>…</svg></div>` löschen. `class="feat-card"`, `<b>` und `<p>` bleiben, damit es weiter 6 `.feat-card` sind.
- **49** „Win-Rate, Profit-Faktor, Erwartungswert …“ → „Trefferquote, Profit-Faktor, Erwartungswert …“
- **57–59** jeweils `<div class="k">SCHRITT 1</div><b>Session starten</b>` → `<b><span class="k">1</span>Session starten</b>`, ebenso für 2 („Trades loggen“) und 3 („Auswerten“).

**C8 · web/js/app.js** (bereich_shell-35, barrierefreiheit-43, ki_look-36)
- **210** `<span class="name no-i18n">Journal<em>yst</em></span>` → `<span class="name no-i18n">Journalyst</span>`
- **253** `newTradeButton()`: `<button type="button" class="btn accent tl" data-action="new-trade">` → `<button type="button" class="btn accent tl" data-action="new-trade" aria-keyshortcuts="N">`
- **530** (Session-Ende) dreimal `<div class="caption">` → `<div class="kpi-label">` (Heute, Trades, Win-Rate).

**C9 · web/js/widgets.js** (diagramme-31, diagramme-35, ki_look-36)
- **115** `fmt.cur(e.pnl, { signed: true, compact: Math.abs(e.pnl) >= 1000 })` → `fmt.cur(e.pnl, { signed: true, compact: true })`
- **116** `fmt.cur(wk.pnl, { signed: true, compact: Math.abs(wk.pnl) >= 1000 })` → `fmt.cur(wk.pnl, { signed: true, compact: true })`
- **166** `U.pnl(d.s.total, '', { signed: false })` → `U.pnl(d.s.total)`
- **184** `<div class="caption">${label}</div>` → `<div class="kpi-label">${label}</div>`
- **227** `<div class="caption">Dein Score</div>` → `<div class="kpi-label">Dein Score</div>`
- **287** `<div class="caption" style="text-transform:none;letter-spacing:0;font-size:13px;font-weight:600;color:var(--text-2)">Heutiger Score …` → `<div class="kpi-label">Heutiger Score …`

**C10 · web/js/widgetpreviews.js:73 · Vorschaubild Score** (ki_look-36; die Vorschauen sind genaue Miniaturen, README:91)
- `tx(8, 54, 'DEIN SCORE', 3.8, F, { w: 600, ls: .3 })` → `tx(8, 54, 'Dein Score', 5.2, T2)`

**C11 · web/js/certificate.js** (ki_look-31, bereich_shell-35)
- **33** `<span class="name">Journal<em>yst</em></span>` → `<span class="name">Journalyst</span>`
- **39–40** in beiden `.issue` das `<div class="line"></div>` löschen.

**C12 · web/js/screens/dashboard.js** (ki_look-12, ki_look-17)
- **119** vorher `<div class="edit-bar"><div class="row"><span class="dot-live"></span><b>Bearbeitungsmodus</b><span class="muted">–</span><span>${esc(tpl.name)}</span></div>`
  → nachher `<div class="edit-bar"><div class="row"><b>Bearbeitungsmodus</b><span class="muted">·</span><span>${esc(tpl.name)}</span></div>`. Der Rest der Zeile bleibt, „Speichern“ bleibt `btn primary`.
- **130** im `U.banner(…, 'Willkommen', …, { icon: 'sparkle', trailing: … })` den Teil `icon: 'sparkle', ` streichen.

**C13 · web/js/screens/day.js** (ki_look-17, ki_look-36)
- **12** `${I.sparkle} ${d.checkIn ? 'Check-in bearbeiten' : 'Check-in'}` → `${I.mood} ${d.checkIn ? 'Check-in bearbeiten' : 'Check-in'}`
- **14** `<div class="caption">Netto-P&L</div>` → `<div class="kpi-label">Netto-P&L</div>`
- **16** `U.empty('sparkle', 'Kein Check-in', …)` → `U.empty('mood', 'Kein Check-in', …)`

**C14 · web/js/screens/stats.js** (ki_look-17, ki_look-36, diagramme-32)
- **45** `<div class="caption">Gewinner</div>` und `<div class="caption">Verlierer</div>` → `class="kpi-label"`
- **61** `U.empty('sparkle', 'Keine Check-ins im Zeitraum', …)` → `U.empty('mood', 'Keine Check-ins im Zeitraum', …)`
- **79–80** (Monte Carlo) jedes `fmt.cur(x)` → `fmt.cur(x, { compact: true })`:
  - `mc.start`
  - `-mc.dd.p50`
  - `-mc.dd.p95`
  - `-mc.dd.worst`
  - `mc.final.p50`
  - `mc.final.p5`
  - `mc.final.p95`

**C15 · web/js/screens/shadow.js:58** (ki_look-17)
- In `U.banner('info', 'Noch keine Regel aktiv', …, { icon: 'sparkle', trailing: … })` den Teil `icon: 'sparkle', ` streichen.

**C16 · web/js/screens/trades.js** (diagramme-35, ki_look-36)
- **26** `U.pnl(s.total, '', { signed: false })` → `U.pnl(s.total)`
- **59** `<div class="caption">Entgangen</div>` und `<div class="caption">Wären Gewinner gewesen</div>` → `class="kpi-label"`
- **76** bleibt `.caption`.

**C17 · web/js/screens/replay.js:83** (ki_look-36)
- `<div class="caption">Session beendet</div>` → `<div class="kpi-label">Session beendet</div>`. Die Seite ist versteckt; der Schritt dient nur der Einheitlichkeit. 68 bleibt `.caption`.

**C18 · web/js/screens/progress.js** (ki_look-6)
- **6** `ringArc`: den zweiten Kreis `<circle class="arc" … />` in `${rate > 0 ? `<circle class="arc" … />` : ''}` einschließen. Der `.track`-Kreis bleibt immer. `size = 116, lw = 9` bleibt (N2).
- **69** vorher
  `` ${U.card('% Regeln eingehalten', `<div class="big-stat"><span>${cur.rate == null ? '0 %' : fmt.pct(cur.rate)}</span>${arrow(rateDir)}</div><div class="small muted">…</div><div class="ring-abs">${ringArc(cur.rate)}</div>`, { info: '…', cls: 'ring-card' })} ``
  → nachher
  `` ${U.card('% Regeln eingehalten', `<div class="big-stat"><span>${cur.rate == null ? '<span class="muted">—</span>' : fmt.pct(cur.rate)}</span>${arrow(rateDir)}</div><div class="small muted">…unverändert…</div>${cur.rate == null ? '' : `<div class="ring-abs">${ringArc(cur.rate)}</div>`}`, { info: '…unverändert…', cls: cur.rate == null ? '' : 'ring-card' })} ``
  `rateDir` ist bei `null` schon 0, der Pfeil entfällt damit von selbst.

**C19 · web/js/screens/prop.js** (diagramme-4, diagramme-32, ki_look-36, bereich_prop-51)
- **7–8** vorher „Weitere Ansichten (Friedhof, Vergleich, Simulation …) registrieren sich … Oben stehen nur fünf Bereiche; Finanzen und Analyse haben einen kleinen Umschalter … Die Adressen bleiben #/prop/<ansicht>“
  → nachher `/* Weitere Ansichten (Friedhof) registrieren sich aus eigenen Dateien über root.PropScreen.register. Die Adressen bleiben #/prop/<ansicht> */`
- **68** `fmtMoney: v => fmt.cur(v)` → `fmtMoney: v => money(a, v, { compact: true })`. Betrifft die Consistency-Warnung („heute mehr als …“).
- **75** `Gewinn fehlt: ${fmt.cur(plan.missingProfit)}` → `Gewinn fehlt: ${money(a, plan.missingProfit, { compact: true })}`
- **86–87** `summaryTiles`: Summe je Währung.
  ```js
  const active = list.filter(a => a.status === 'active'); const byCur = new Map(); let red = 0;
  for (const a of active) { const { ev } = evalOf(a); const c = a.currency || ''; byCur.set(c, (byCur.get(c) || 0) + ev.pnl); if (ev.buffer.ampel === 'rot' || ev.status === 'breached') red++; }
  /* P&L je Kontowährung: eine Währung = eine Zahl, mehrere = „+11.262,00 $ · +1.053,85 €“ */
  const pnlText = byCur.size ? [...byCur].map(([c, v]) => U.pnl(v, '', c ? { currency: c } : {})).join(' · ') : U.pnl(0);
  ```
  In Z. 87 `U.tile('P&L aktive Konten', U.pnl(pnl), …)` → `U.tile('P&L aktive Konten', pnlText, …)`.
- **93** `money(a, x.remaining)` → `money(a, x.remaining, { compact: true })`; `money(a, x.limit)` → `money(a, x.limit, { compact: true })`
- **94** `money(a, ev.target.remaining)` → `money(a, ev.target.remaining, { compact: true })`
- **102**
  - beide `<div class="caption">` (Balance, P&L) → `<div class="kpi-label">`
  - `U.pnl(ev.pnl)` → `U.pnl(ev.pnl, '', { currency: a.currency })`
  - `fmt.balance(…, { currency: a.currency })` bleibt (A2 macht es ganzzahlig)
- **104** im Puffer-Tooltip `money(a, b.money)` → `money(a, b.money, { compact: true })`. `fmt.cur(stopSize)` **bleibt** (R6).
- **194** Hinweis `Balance, Limits und Puffer in Kontowährung. Trade-P&L bleibt in der Journal-Währung.` → `Balance, P&L, Limits und Puffer des Kontos in Kontowährung. Trade-Listen zeigen die Journal-Währung.`
- **283** (Payout-Planer, Karte „Bedingungen“):
  - `U.pnl(ev.pnl)` → `U.pnl(ev.pnl, '', { currency: a.currency })`
  - `von ${fmt.cur(o.minProfit)}` → `von ${money(a, o.minProfit, { compact: true })}`
  - `${fmt.cur(missP)} fehlen` → `${money(a, missP, { compact: true })} fehlen`
  - `fmt.balance(ev.balance)` → `fmt.balance(ev.balance, { currency: a.currency })`
  - `von ${fmt.cur(o.minBalance)}` → `von ${money(a, o.minBalance, { compact: true })}`
  - `${fmt.cur(missB)} fehlen` → `${money(a, missB, { compact: true })} fehlen`
  - `heute noch ${fmt.cur(cons.allowedToday)} erlaubt` → `heute noch ${money(a, cons.allowedToday, { compact: true })} erlaubt`
  - `fmt.cur(ev.pnl * num(a.profitSplit, 0))` → `money(a, ev.pnl * num(a.profitSplit, 0))` (Auszahlung, mit Cent)
- **284** `fmt.cur(plan.suggestion.perDay)` → `money(a, plan.suggestion.perDay, { compact: true })`; `fmt.cur(plan.suggestion.total)` → `money(a, plan.suggestion.total, { compact: true })`
- **286** (Payouts dieses Kontos) **unverändert**, Journal-Währung wie erfasst.
- **303** Kommentar „Die fünf Bereiche stehen links in der Kopfreihe …“ → „Die drei Bereiche stehen links in der Kopfreihe …“

**C20 · web/js/screens/prop-friedhof.js** (diagramme-4, bereich_prop-51)
- **32** `const kv = (k, v) => …;` löschen.
- **119–122** `const when = …;` und `const tradeHtml = …;` löschen. `whenShort` (123) und `WEEKDAY_LONG` bleiben.
- **136** `fmt.balance(t.size)` → `fmt.balance(t.size, { currency: acc && acc.currency })`. Ersetzt wording/bereich_prop-46 die Unterzeile, entfällt dieser Teil.
- **146** `U.pnl(t.result)` → `U.pnl(t.result, '', { currency: acc && acc.currency })`
- **149** `U.pnl(c.pnl, '', { r: trade.r })` → `U.pnl(c.pnl, '', { r: trade.r, currency: acc && acc.currency })`

**C21 · web/js/screens/coach.js** (bereich_konto-17, ki_look-33)
- **35, 128, 243** `U.pill('Mentor', 'warn')` → `U.pill('Mentor', 'neutral')`. Den Pillentext legt spec/wording.md fest (aufbau-29).
- **87** in `U.pill(r.new_replies === 1 ? '1 Antwort' : …, 'warn')` → `'neutral'`.

**C22 · web/js/screens/news.js:83** (bereich_notebook_news-41)
- `<div class="nw-next"><span class="nw-next-ico">${I.bell}</span><div class="grow">` → `<div class="nw-next"><div class="grow">`. `<div class="caption">Nächste wichtige News</div>` bleibt.

**C23 · web/js/screens/ruhepunkt.js** (bereich_training-49)
- **11** Kommentar „Standardwert für den Schalter "Christlicher Impuls" …“ → „Standardwert für die Einstellung "Christlicher Impuls" …“
- **824–826** `function syncFaithUI() { … }` löschen.
- **829** in `setFaith` die Zeile `syncFaithUI();` löschen. `setFaith` bleibt (Export in `root.Ruhepunkt`).
- **888** `'rp-faith': function (el) { setFaith(el.checked); },` löschen.

**C24 · web/js/screens/misc.js** (barrierefreiheit-43)
- Vor Z. 63 (`<div class="set-block"><h3>Daten und Sicherung</h3>`) einfügen:
  `<div class="set-block"><h3>Bedienung</h3>${switchRow('Tastenkürzel', '<b>N</b> Trade loggen · <b>1–9</b> Bereich wechseln', 'shortcuts-toggle', st.shortcuts !== false)}</div>`
- **69** vorher `<div class="small faint">Speicherort: dieser Browser (localStorage und IndexedDB). ${S.storageOK ? '' : '<span class="neg">Achtung: …</span>'} Tastatur: <b>N</b> neuer Trade · <b>1–6</b> Bereiche · <b>Esc</b> schließt Dialoge.</div>`
  → nachher `<div class="small faint">Speicherort: dieser Browser (localStorage und IndexedDB).${S.storageOK ? '' : ' <span class="neg">Achtung: Speichern ist derzeit nicht möglich (privates Fenster oder blockierte Website-Daten).</span>'}</div>`
- In `Object.assign(App.actions, { … })` hinter `'faith-toggle'() { … },` (Z. 282) einfügen:
  `'shortcuts-toggle'() { S.setSetting('shortcuts', !(S.settings.shortcuts !== false)); rerender(); },`

**C25 · web/js/ui.js:71 · `I.sparkle` löschen** (ki_look-17; erst nach C12–C15)
- Zeile `sparkle: sv('<path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/>'),` löschen.
- Danach muss `grep -rn "sparkle" web/js web/index.html | grep -v "/lang/"` 0 Treffer ergeben.

**C26 · web/js/lang/{en,es,pt,zh,hi}.js · neue und geänderte Schlüssel** (barrierefreiheit-43, diagramme-4)

| Deutsch | en | es | pt | zh | hi |
|---|---|---|---|---|---|
| `Bedienung` | Controls | Controles | Controles | 操作 | नियंत्रण |
| `Tastenkürzel` | Keyboard shortcuts | Atajos de teclado | Atalhos de teclado | 键盘快捷键 | कीबोर्ड शॉर्टकट |
| `Trade loggen ·` | Log trade · | Registrar trade · | Registrar trade · | 记录交易 · | ट्रेड दर्ज करें · |
| `Bereich wechseln` | switch section | cambiar sección | trocar seção | 切换区域 | सेक्शन बदलें |
| `Speicherort: dieser Browser (localStorage und IndexedDB).` | Storage: this browser (localStorage and IndexedDB). | Almacenamiento: este navegador (localStorage e IndexedDB). | Armazenamento: este navegador (localStorage e IndexedDB). | 存储位置：此浏览器（localStorage 和 IndexedDB）。 | स्टोरेज: यह ब्राउज़र (localStorage और IndexedDB)। |

- Die nicht mehr benutzten Schlüssel löschen:
  - `"Speicherort: dieser Browser (localStorage und IndexedDB). Tastatur:"`
  - `"neuer Trade ·"`
  - `"Bereiche ·"`
  - `"schließt Dialoge."`
  Vorher mit `grep -rn` prüfen, dass kein anderer Text sie braucht.
- Der Prop-Hinweis (prop.js:194) hat in den Wörterbüchern noch keinen Schlüssel (Prop ist nicht in Etappe 1). Nichts eintragen.

**C27 · web/e2e/proptest.js** (diagramme-4, diagramme-32)
- **55** `UI.fmt.cur(b, { currency: Store.propAccounts()[0].currency })` → `UI.fmt.balance(b, { currency: Store.propAccounts()[0].currency })`. Der Kommentar wird `/* Balance und P&L in Kontowährung (USD) */`.
- **56** `card.pnl.includes('€')` → `card.pnl.includes('$')`
- **101** in `Prop.payoutPlan(…, { …, fmtMoney: v => UI.fmt.cur(v) })` → `fmtMoney: v => UI.fmt.cur(v, { currency: Store.propAccounts()[2].currency, compact: true })`
- **116** („/ 150,00 € je Stop-Loss“) **unverändert**.

**C28 · web/README.md · Dokumentation** (alle umgesetzten Befunde)
- **318** `Tastatur: **N** neuer Trade, **1–6** Bereiche, **Esc** schließt Dialoge.`
  → `Tastatur: **N** Trade loggen, **1–9** Bereiche (0 = Blind-Replay, nur wenn freigeschaltet), **Esc** schließt Dialoge. Die Einzeltasten lassen sich unter Einstellungen → Profil → Bedienung abschalten.`
- **153** hinter „(Badge „Mentor“, Name, Zeit; …)“ ergänzen: „Notiz als neutrale Fläche mit feinem Rand, ohne Farbstreifen“.
- **129** (Fortschritt) ergänzen: „„% Regeln eingehalten“ zeigt ohne Regeln oder Regel-Check „—“ und keinen Ring; der Ring leuchtet nicht.“
- **190** (Kalender-Kacheln) ergänzen: „Im Monatsraster stehen Tages- und Wochenbeträge ohne Cent; die Cent zeigt die Tagesansicht.“
- **172** (Schrift) ergänzen: „`app.html` und die Startseite laden von Google nur Onest; Inter und Roboto lädt `Theme.loadFont` nur für „Klassisch“.“
- **211** (Geld-blind-Modus, Absatz zu `fmt.cur`) ergänzen: „Genauigkeit nach Bedeutung: Ergebnisse, Gebühren und Payouts immer mit Cent und Ergebnisse mit Vorzeichen; Bestände (`fmt.balance`), Limits, Ziele, Puffer und Monte Carlo ganzzahlig. Keine Größenschwelle.“
- **241 ff.** (Prop Firms) ergänzen: „Alles, was zu einem Konto gehört (Balance, P&L, Limits, Puffer, Payout-Planer, Grabstein), steht in der Kontowährung; Bilanz und Payout-Liste in der Journal-Währung; die Kachel „P&L aktive Konten“ summiert je Währung.“

---

## 4. Akzeptanzkriterien

**grep** (vom Repo-Wurzelverzeichnis; „0“ heißt keine Treffer):

1. `grep -rn "dot-live\|@keyframes pulse " web/css web/js` → 0
2. `grep -rn "sparkle" web/js web/index.html | grep -v "/lang/"` → 0
3. `grep -rn "signed: false" web/js | grep -v "/lang/"` → 0
4. `grep -n "a >= 10000 ? 0 : 2" web/js/ui.js` → 0; `grep -n "compact: Math.abs" web/js/widgets.js` → 0
5. `grep -c "background-clip: text" web/css/app.css` → 2 (nur 1244/1267, Serie)
6. `grep -n "mentor-note::before\|var(--warn) 6%\|var(--warn) 28%\|var(--warn) 22%\|var(--warn) 5%" web/css/app.css` → 0
7. `grep -n "U.pill('Mentor', 'warn')" web/js/screens/coach.js` → 0
8. `grep -n "drop-shadow(0 0 6px var(--accent-glow))" web/css/app.css` → 0
9. `grep -n "box-shadow: 0 0 12px var(--c)\|0 0 8px color-mix(in srgb, var(--phase)\|0 14px 30px -18px var(--c)\|animation-duration: 2" web/css/app.css` → 0
10. `grep -rn "rp-switch\|rp-faith\|syncFaithUI" web/css web/js` → 0
11. `grep -rn "nav-sec\|badge-n\|\.nav button\|menu-btn svg path\|\.brand em\|Journal<em>" web/css web/js web/index.html` → 0
12. `grep -rn "prop-grave-kv\|prop-highlights\|prop-unv\|--grain\|eng-hi\|eng-lo\|prop-grave-trade\|tradeHtml" web/css web/js` → 0
13. `grep -n "c-glow\|c-band\|c-bar\|--g1\|--gn1\|issue .line\|Navy" web/css/app.css` → 0; `grep -n 'class="line"' web/js/certificate.js` → 0
14. `grep -n "^\.journal\|^\.note-item\|^\.note-title\|^\.note-body\|tags-row input" web/css/app.css` → 0
15. `grep -rn "nw-next-ico" web` → 0
16. `grep -rn "family=Inter\|Inter, Roboto" web/app.html web/index.html web/js/sample.js` → 0
17. `grep -n "ribbon\|uppercase\|SCHRITT\|class=\"bar\"\|ff5f57\|class=\"ico\"\|Win-Rate\|accent-soft" web/index.html web/css/landing.css` → 0
18. `grep -rn 'class="caption' web/js | grep -v "/lang/"` → genau diese 10 Stellen:
    - trades.js:76 (4×)
    - progress.js:74, progress.js:75
    - news.js:83
    - replay.js:68
    - voice.js:107, voice.js:115
19. `grep -n "1–6" web/js/screens/misc.js web/README.md` → 0
20. `grep -n "'0': 'replay'" web/app.html` → 0; `grep -n "aria-keyshortcuts" web/js/app.js` → 1

**Zensus** (dunkel, 1440 px, neu erzeugen wie in `audit/atlas.js`):
- `textTransform.uppercase` je Seite:
  - dashboard 7 → 6
  - day 7 → 6
  - prop_cockpit 14 → 6

  Übrig bleiben 4 Gruppentitel und der Schriftzug, auf day zusätzlich ein Label. Ändert die Typografie-Gruppe die Gruppentitel, gelten die neuen Werte minus dieselbe Differenz.
- In `census/dashboard.json`, `day.json` und `prop_cockpit.json` gibt es keinen Text mit Selektor `div.caption` mehr. Neu ist `div.kpi-label` mit `fs 13px`, `fw 500`.
- `census/news.json` behält `div.caption` „Nächste wichtige News“.

**Screenshots** (Atlas neu, dunkel und hell; Namen wie in `audit/shots`):

- **Dashboard** (`dashboard.png`):
  - Kachel Netto-P&L „+893,04 €“, mit Vorzeichen
  - Kontostand ganzzahlig
  - Kalender ohne Cent („−486 €“)
  - „Dein Score“ in Satzschreibung
- **Bearbeiten** (`extra-dark-1440/dashboard_bearbeiten.png`): Leiste grau mit Rand `--border-2`, kein grüner Rand, kein Punkt, Text „Bearbeitungsmodus · Standard“. „Speichern“ bleibt grün.
- **Fortschritt** (`leer_progress.png`): „—“ in Grau, kein Ring, kein grüner Punkt.
- **Fortschritt mit Daten** (`hicks-tr-1440-progress_voll.png`-Ansicht): Ring 116 px ohne Schein. Die Tilt-Labels sind in Satzschreibung und 12 px groß.
- **Ruhepunkt** (`extra-dark-1440/ruhepunkt_start.png` und mit Hover über „Vor dem Trading“):
  - beim Hover Rand und Fläche grau
  - kein blauer Schatten, kein Lichtkegel
  - das Symbol springt beim Überfahren nicht
  - Ampelpunkt im Check-in-Schritt ohne Schein
- **Konto-Menü** (`extra-dark-1440/menu_konto_unten.png` und `extra-dark-390`): Coach mit Doktorhut, klar unterscheidbar von Profil und Affiliate. Hell/Dunkel-Schalter mittig in der Zeile, auch bei eingeklappter Leiste (`sidebar_mini.png` → Menü öffnen).
- **Tagesansicht** (`day.png`): Check-in-Knopf mit Gesicht, „Netto-P&L“ in Satzschreibung. Der Leerzustand „Kein Check-in“ zeigt ein Gesicht.
- **Prop** (`prop_cockpit.png`, `prop.png`):
  - Karte zeigt „Balance“/„P&L“ in Satzschreibung
  - Balance und P&L in derselben Währung ($), z. B. „111.262 $“ und „+11.262,00 $“
  - Balken „… übrig 1.234 $ von 3.000 $“
  - „Gewinn fehlt: 1.946 $“
  - Kachel „P&L aktive Konten“ in $
- **Payout-Planer** (`prop_bilanz` mit offenem Planer): alle Kontobeträge in $; „Payouts dieses Kontos“ unverändert in €.
- **Friedhof** (Rückseite): Ergebnis und Trade-P&L in Kontowährung.
- **Monte Carlo** (`stats_mc.png`): Kacheln und Fußzeilen ganzzahlig.
- **Coach-Journal** (nur mit Coach-Server, `extra/cca/coach-journal-dark-1440.png`): Notiz grau mit feinem Rand, ohne Streifen; Pillen „Mentor“ grau; Trennlinien durchgezogen. Der KI-Hinweis im Mentor-Chat (`mentor.png`) ist keine Karte.
- **News** (`dark-390/news.png`): Hero-Karte ohne Glocke, etwa 112 CSS-px hoch, Countdown in Zeile 2. Desktop: eine Zeile.
- **Einstellungen → Profil** (`settings_profil.png`): Block „Bedienung“ mit Schalter „Tastenkürzel“, an; die Fußzeile ohne Tastatur-Teil.
- **Startseite** (`shots/extra/slop/landing_dark.png`, `landing_light.png`, dazu 390 px):
  - keine grüne Leiste, keine Ampelpunkte
  - Demo-Eintrag „Dashboard“ grau hinterlegt, nicht grün
  - Knöpfe in Satzschreibung
  - Funktionen als 2-spaltige Liste ohne Symbole (390 px: eine Spalte)
  - Ablauf „1 Session starten“ ohne Kicker
  - Demo-Kurve steigt überall
- **Zertifikat** (`modal_zertifikat.png`): PNG-Export vorher und nachher pixelgleich für Tag mit Gewinn und Tag mit Verlust, je Quadrat, Story und Querformat (6 Paare). Schriftzug „JOURNALYST“ unverändert.

**Verhalten** (manuell oder als neue Prüfungen in einer e2e-Suite):
- Bei `FEATURES.replay = false` ändert Taste „0“ `location.hash` nicht. Mit `localStorage.jy_features = '{"replay":true}'` führt „0“ zu `#/replay`.
- Bei `Store.settings.shortcuts = false` tun „N“ und „1“ bis „9“ nichts. Esc schließt einen offenen Dialog weiter.
- Bei Zeitraum „Gesamt“ mit P&L ≥ 10.000 laufen die Kacheln bei 1024 und 390 px nicht über. Das prüft auch `e2e/mobiletest.js`.
- `document.querySelectorAll('.cal .p')`: kein Text mit `/,\d\d\s?[€$]/`.

**Tests:**
- `node --test web/tests/*.mjs` grün.
- `bash web/e2e/runall.sh` grün, insbesondere:
  - proptest (angepasst, C27)
  - friedhoftest
  - dashtest
  - motiontest (6 × `.feat-card.rv`)
  - newstest (`.nw-next .caption`)
  - rptest
  - usercardtest
  - sidebartest
  - settest2 („Klassisch“ lädt Inter)
  - certtest
  - mobiletest
  - headtest
  - mentortest
  - coachtest (mit Server)

---

## 5. Zurückgestellt

- **R1 · ki_look-43, Teil „echte Aufnahmen statt HTML-Demo“** (`<picture>` mit `web/assets/landing-dashboard-{dark,light}.png`):
  - widerspricht README:202 („Die Wahl gilt für die ganze Website inklusive Startseite“, gesetzt über `data-theme` und `Theme.applyFromStorage`)
  - ein Bild übernimmt keine eigene Akzent-, Gewinn- und Verlustfarbe

  Die HTML-Demo wird stattdessen angeglichen (B8, C7).
- **R2 · barrierefreiheit-43, Teil „Belegung an die Reihenfolge der Seitenleiste anpassen“:**
  - bricht e2e/rptest.js:10 (Taste 7 → Ruhepunkt) und e2e/mentortest.js:21 (Taste 8 → Mentor)
  - widerspricht README:215 („Schatten-Ich (Taste 9)“)
  - nähme dem Ruhepunkt sein Kürzel (Platz 10)
  - bricht Gewohnheiten ohne klaren Gewinn
- **R3 · diagramme-31, Zusatz „`title`-Attribut mit Cent am Kalendertag“:**
  - Ein natives `title` passt nicht zum Tooltip-System der App (`data-tip`).
  - Die Cent sind einen Klick entfernt in der Tagesansicht. Der große Kalender hatte nie einen Tooltip.
- **R4 · ki_look-36, Textänderungen:**
  - „Balance“ → „Kontostand“: prop.js nutzt „Balance“ 16-mal, README spricht im Prop-Bereich von Balance.
  - Neue Tilt-Texte: „Verlustserien (3+)“ ändert den Sinn.

  Beides ist Sache von `spec/wording.md` (wording-32). Hier ändert sich nur die Schreibweise.
- **R5 · bereich_shell-28, grünes großes Coach-Symbol im Leerzustand** (`.mentor-setup .ico svg { color: var(--accent) }`, app.css:2341; ebenso 2893): eigener Farb-Befund, gehört in `spec/farbe.md`. Hier ändert sich nur die Form des Symbols.
- **R6 · diagramme-4, Stop-Größe im Puffer-Tooltip:**
  - bleibt in Journal-Währung, weil es eine globale Einstellung ist, die in Journal-Währung eingegeben wird (prop.js:242)
  - e2e/proptest.js:116 erwartet „/ 150,00 € je Stop-Loss“

---

## 6. Nutzer fragen

**N1 · ki_look-10 und bereich_dashboard-41 (Trennlinie in den Kacheln)**
- **Frage:** „Am 2.10. wolltest du, dass die Linie in den Kacheln nicht durchgezogen ist, damit sie nicht durchs Diagramm läuft. Jetzt läuft sie unter dem Titel nach der Hälfte aus. Sollen wir sie ganz weglassen? Titel und Wert wären dann nur durch Abstand getrennt.“
- **Empfehlung: Ja, ganz weglassen.**
  - Die halbe Linie ist reine Zierde.
  - Ohne Linie läuft auch nichts mehr durchs Diagramm, dein damaliges Ziel bleibt also erfüllt.
  - Abstand Titel–Wert 11 px.

  Vorher und nachher zeigen (`shots/extra/dash/crop-tiles2x.png`).
- **Bei Ja:** app.css:524–525 →
  `.tile .body { display: flex; align-items: center; justify-content: space-between; gap: 12px 14px; padding-top: 4px; flex: 1; }`
  Die Zeile mit `linear-gradient(90deg, var(--border), var(--border) 22%, transparent 48%)` entfällt, ohne Ersatzlinie. Das wirkt auf alle `.tile`: Dashboard, Schatten-Ich, Prop-Streifen, Startseiten-Demo.
  Akzeptanz: `grep -n "transparent 48%" web/css/app.css` → 0.

**N2 · ki_look-6 (Größe des Regeltreue-Rings)**
- **Frage:** „Den Ring bei „% Regeln eingehalten“ wolltest du am 28.9. größer und mittig. Das Audit schlägt 88 px statt 116 px vor, weil er nur die Prozentzahl daneben wiederholt. Soll er kleiner werden?“
- **Empfehlung:** Größe lassen (116 px).
  - Es war dein ausdrücklicher Wunsch.
  - Was wirklich gestört hat, wird ohnehin behoben (B4, C18): der grüne Schein und das erfundene „0 %“ samt grünem Punkt ohne Regeln.
- **Falls kleiner gewünscht:**
  - progress.js:6 `size = 116, lw = 9` → `size = 88, lw = 7`
  - app.css:1312 `margin-right: 150px` → `116px`

**N3 · bereich_training-45 (Bewegung und Glühen der drei Ruhepunkt-Symbole; mit bewegung-7 und ki_look-27)**
- **Frage:** „Die drei Symbole im Ruhepunkt bewegen sich ständig: Die Sonne steigt und glüht, der Mond schaukelt und glüht, Sterne blinken, der Ring pulsiert. Am 30.9. fandest du sie stark. Sollen sie im Ruhezustand stillstehen und sich nur bewegen, wenn man mit der Maus darüberfährt oder sie per Tastatur anwählt, und Sonne und Mond ohne Glühen?“
- **Empfehlung: Ja.**
  - Die Bewegung bleibt erlebbar, sobald man sich einem Ablauf zuwendet.
  - Im Ruhezustand ist die Seite wirklich ruhig.
  - Das passt zu „Animationen nur beim Seitenwechsel, kein Schein“.
  - Atemlicht, Blütenblätter und Farbflächen bleiben.
- **Bei Ja:**
  - **Keyframes** app.css:2167 →
    `@keyframes rp-sun { 0%, 100% { transform: translateY(4px); } 50% { transform: translateY(-1px); } }`
    und in 2170 (`rp-moon`, 50 %) `filter: drop-shadow(0 0 6px var(--c));` streichen.
  - **Direkt nach 2180 neu:**
    `.rp-i-sun, .rp-i-rays, .rp-i-moon, .rp-i-stars circle, .rp-i-ring, .rp-i-ring2, .rp-i-pause { animation-play-state: paused; }`
    `.rp-choice:is(:hover, :focus-visible) :is(.rp-i-sun, .rp-i-rays, .rp-i-moon, .rp-i-ring, .rp-i-ring2, .rp-i-pause), .rp-choice:is(:hover, :focus-visible) .rp-i-stars circle { animation-play-state: running; }`
  - Die Regel für reduzierte Bewegung (2333) bleibt.
  - **Akzeptanz:** Im Ruhezustand liefert `getComputedStyle(document.querySelector('.rp-i-sun')).animationPlayState` den Wert `paused`, beim Hover `running`. `grep -n "drop-shadow" web/css/app.css` zeigt keine Treffer mehr in `rp-sun` und `rp-moon`.
