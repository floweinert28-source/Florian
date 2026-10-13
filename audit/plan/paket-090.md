# Paket 090 · wording, barrierefreiheit

Schritte: 21 · Dateien: web/README.md, web/e2e/runall.sh, web/js/app.js, web/js/coach.js, web/js/core.js, web/js/lang/en.js, web/js/lang/es.js, web/js/lang/hi.js, web/js/lang/pt.js, web/js/lang/zh.js, web/js/screens/coupons.js, web/js/screens/dash-filter.js, web/js/screens/dashboard.js, web/js/screens/mentor.js, web/js/screens/news.js, web/js/screens/notebook.js, web/js/screens/prop.js, web/js/screens/ruhepunkt.js, web/js/screens/shadow.js, web/js/screens/trades.js, web/js/shadow.js, web/js/voice.js, web/js/widgets.js
Betroffene Tests laut Spezifikation: prüfen: e2e/langtest.js; web/e2e/coachtest.js; web/e2e/filtertest.js; web/e2e/glidetest.js; web/e2e/langtest.js (Übersetzung); web/e2e/mobiletest.js; web/e2e/motiontest.js; web/e2e/rangetest.js; web/e2e/rptest.js:9; web/e2e/scorestatetest.js:10; web/e2e/sidebartest.js; web/e2e/sixtest.js; web/e2e/switchtest.js; web/e2e/tiptest.js; web/e2e/tradeformtest.js; web/e2e/usercardtest.js; web/e2e/usercardtest.js:11
Baut auf Paketen auf: 4, 11, 12, 16, 35, 38, 42, 47, 57, 58, 69, 77, 80, 83, 87, 89

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## barrierefreiheit-E-runall · web/e2e/runall.sh vollständig ausführen, besonders die genannten Suiten

Gruppe barrierefreiheit · Cluster barrierefreiheit · Aufwand M · Befunde: —
Quelle: audit/spec/barrierefreiheit.md Z. 909–911 · Dateien: web/e2e/runall.sh
Abhängig von: barrierefreiheit-D1, barrierefreiheit-E-dashtest-15, barrierefreiheit-E-notechecktest-14, barrierefreiheit-E-newstest-52, barrierefreiheit-E-aria-current, barrierefreiheit-E-dptest-92

```text

Danach `web/e2e/runall.sh` vollständig, besonders `tradeformtest`, `mobiletest` (Affiliate-Tabelle bei 390 ohne seitliches Scrollen, Tabellen mit 40-px-Knöpfen), `rangetest`, `sixtest`, `filtertest`, `coachtest`, `usercardtest`, `sidebartest`, `motiontest`, `switchtest`, `glidetest`, `tiptest`.

```

## kilook-C26 · Wörterbücher en/es/pt/zh/hi: neue Schlüssel (Bedienung, Tastenkürzel …), alte Tastatur-Schlüssel löschen

Gruppe kilook · Cluster wording · Aufwand S · Befunde: barrierefreiheit-43, diagramme-4
Quelle: audit/spec/kilook.md Z. 727–744 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/pt.js, web/js/lang/zh.js, web/js/lang/hi.js
Abhängig von: kilook-C24

```text
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

```

## kilook-C28 · README: Tastatur, Mentor-Notiz, Fortschritt, Kalender, Schrift, Geldformat, Prop-Währung

Gruppe kilook · Cluster wording · Aufwand S · Befunde: barrierefreiheit-43, bereich_konto-17, ki_look-33, ki_look-6, diagramme-31, typografie-33, diagramme-32, diagramme-35, diagramme-4
Quelle: audit/spec/kilook.md Z. 751–762 · Dateien: web/README.md
Abhängig von: kilook-A1, kilook-A2, kilook-A5, kilook-B3, kilook-B4, kilook-C6, kilook-C9a, kilook-C18, kilook-C19b, kilook-C19c, kilook-C20, kilook-C24

```text
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

```

## responsiv-3.18 · Sprachdateien: neue Texte eintragen, Prop-Kartenwert auf Englisch prüfen

Gruppe responsiv · Cluster wording · Aufwand M · Befunde: bereich_prop-10, bereich_training-24, responsiv-6, bereich_notebook_news-11, bereich_dashboard-4, bereich_training-38
Quelle: audit/spec/responsiv.md Z. 550–553 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/zh.js, web/js/lang/hi.js, web/js/lang/pt.js, web/js/screens/prop.js
Abhängig von: responsiv-3.3a, responsiv-3.10, responsiv-3.12a, responsiv-3.12c, responsiv-3.13, responsiv-3.15

```text
### 3.18 web/js/lang/{en,es,zh,hi,pt}.js

Neue Einträge (Muster wie vorhanden): „Bis zum Bestehen“ (en „To pass“), „{0} fehlen“ (en „{0} to go“), „{0}× gebrochen“ (en „Broken {0}×“), „Beantragt {0}“ (en „Requested {0}“), „Schreib dem Mentor …“ (en „Write to your mentor …“). „Teilen“, „Konto: {0}“, „Verlauf löschen“ prüfen und fehlende Einträge ergänzen. Der Wert der Prop-Karte ist ein einziger Textknoten („in 3 Handelstagen · 1.946,15 $ fehlen“): auf Englisch umschalten und prüfen, dass er vollständig übersetzt wird; fehlt ein Muster für die Kombination, die Teile in planText je in ein eigenes `<span>` setzen.

```

## wording-S2.1 · core.js: Radar-Achse in SCORE_AXES „Win-Rate“ → „Trefferquote“

Gruppe wording · Cluster wording · Aufwand S · Befunde: wording-3, bereich_dashboard-32
Quelle: audit/spec/wording.md Z. 304–308 · Dateien: web/js/core.js
Abhängig von: —

```text
### Schritt 2 · `web/js/core.js` (zentrale Kennzahl-Namen)

| # | Stelle | vorher → nachher | ids |
|---|---|---|---|
| 2.1 | `SCORE_AXES` Z. 265 | `winRate: 'Win-Rate'` → `winRate: 'Trefferquote'` (übrige Achsen unverändert) | wording-3, bereich_dashboard-32 |
```

## wording-S2.14 · core.js insights(): Einzahl „1 Trade“ und „Trefferquote“ in den Insight-Sätzen

Gruppe wording · Cluster wording · Aufwand S · Befunde: wording-3, zustaende-28
Quelle: audit/spec/wording.md Z. 321–322 · Dateien: web/js/core.js
Abhängig von: —

```text
| 2.14 | `insights()` Z. 544–549 | neue lokale Hilfsfunktion in `insights()` direkt nach `const pct = …` (Z. 541): `const nT = n => n === 1 ? '1 Trade' : \`${n} Trades\`;`; in Z. 544 `${mr.mistakeN} Trades mit Fehler-Tags` → `${nT(mr.mistakeN)} mit Fehler-Tags`, Z. 546 `${best.s.n} Trades, Win-Rate ${pct(…)}` → `${nT(best.s.n)}, Trefferquote ${pct(…)}` und `${worst.s.n} Trades mit` → `${nT(worst.s.n)} mit`, Z. 548 `bei ${b.s.n} Trades` → `bei ${nT(b.s.n)}`, Z. 549 `${wd[0].s.n} Trades mit` → `${nT(wd[0].s.n)} mit` | wording-3, zustaende-28 |

```

## wording-S5.1-5.2 · app.js: Navigationsgruppe „Prop Trading“, Konto-Karte „Profil ergänzen“

Gruppe wording · Cluster wording · Aufwand S · Befunde: bereich_shell-33, bereich_shell-34
Quelle: audit/spec/wording.md Z. 349–354 · Dateien: web/js/app.js
Abhängig von: —

```text
### Schritt 5 · `web/js/app.js` und `web/app.html` (Shell, Navigation, Trade-Dialog)

| # | Stelle | vorher → nachher | ids |
|---|---|---|---|
| 5.1 | app.js:18 Navigationsgruppe | `['Konten', [['prop', …], ['coupons', …]]]` → `['Prop Trading', [['prop', …], ['coupons', …]]]` (Einträge gleich; Schlüssel „Konten“ in js/lang **nicht** umbenennen, er wird weiter gebraucht) | bereich_shell-33 |
| 5.2 | app.js:229 Konto-Karte | `'<span>Profil vervollständigen</span>'` → `'<span>Profil ergänzen</span>'` | bereich_shell-34 |
```

## wording-S5.6-5.8 · app.js: Zähler über U.count (Symbol-Liste, CSV-Import) und „Trefferquote“ im Session-Ende

Gruppe wording · Cluster wording · Aufwand S · Befunde: zustaende-28, wording-3, bereich_trades_tag-36
Quelle: audit/spec/wording.md Z. 358–360 · Dateien: web/js/app.js
Abhängig von: wording-S1.1-1.3

```text
| 5.6 | app.js:391 Symbol-Liste | `(o.n === 1 ? '1 Trade' : \`${o.n} Trades\`)` → `U.count(o.n, 'Trade', 'Trades')` | zustaende-28 |
| 5.7 | app.js:530 Session-Ende | `<div class="caption">Win-Rate</div>` → `<div class="caption">Trefferquote</div>` | wording-3, bereich_trades_tag-36 |
| 5.8 | app.js:567 und :574 (CSV) | `${preview.trades.length} Trades erkannt` → `${U.count(preview.trades.length, 'Trade', 'Trades')} erkannt`; Toast `${fresh.length} Trades importiert` → `${U.count(fresh.length, 'Trade', 'Trades')} importiert` | zustaende-28 |
```

## wording-S6.16-6.18 · Disziplin-Kosten-, Schatten-Ich- und Blind-Replay-Widget: „Verstöße“, „Lege fest“, Zähler

Gruppe wording · Cluster wording · Aufwand S · Befunde: wording-38, zustaende-28
Quelle: audit/spec/wording.md Z. 382–384 · Dateien: web/js/widgets.js
Abhängig von: wording-S1.1-1.3

```text
| 6.16 | widgets.js:323 / :331 desc | `'Schatten-Ich: was Regelbrüche dich im Zeitraum gekostet oder gebracht haben.'` → `'Schatten-Ich: was Verstöße dich im Zeitraum gekostet oder gebracht haben.'`; `'… was Regelbrüche gekostet haben, …'` → `'… was Verstöße gekostet haben, …'` | wording-38 |
| 6.17 | widgets.js:334 | `Leg fest, was für dich gilt. Dann rechnet dein Schatten-Ich, was Regelbrüche kosten.` → `Lege fest, was für dich gilt. Dann rechnet dein Schatten-Ich, was Verstöße kosten.` | wording-38 |
| 6.18 | widgets.js:344 / :348 | `${fmt.int(ready)} Trades bereit` → `${U.count(ready, 'Trade', 'Trades')} bereit`; `von ${fmt.int(st.n)} Trades` → `von ${U.count(st.n, 'Trade', 'Trades')}` | zustaende-28 |
```

## wording-S6.19-6.22 · Prop-Konten- und Mentor-Widget: „Kontostand“, „Prop-Konto anlegen“, „reicht für N Stops“, „Journalyst-Server“

Gruppe wording · Cluster wording · Aufwand S · Befunde: wording-32, wording-34, wording-33, wording-14
Quelle: audit/spec/wording.md Z. 385–388 · Dateien: web/js/widgets.js
Abhängig von: —

```text
| 6.19 | widgets.js:351 Prop-Widget desc/info | „Ampel, Balance und Puffer“ → „Ampel, Kontostand und Puffer“; „die Ampel, die Balance und …“ → „die Ampel, den Kontostand und …“ | wording-32 |
| 6.20 | widgets.js:354 Leerzustand | `Leg ein Konto an, dann siehst du hier Ampel, Balance und Puffer.` → `Lege ein Prop-Konto an, dann siehst du hier Ampel, Kontostand und Puffer.`; Knopftext `Konto anlegen` → `Prop-Konto anlegen` | wording-32, wording-34 |
| 6.21 | widgets.js:358 | `noch ${b.stops} Stop-Loss${b.stops === 1 ? '' : 'es'}` → `reicht für ${b.stops} Stop${b.stops === 1 ? '' : 's'}` | wording-33 |
| 6.22 | widgets.js:373 Mentor-Widget | `Der Mentor läuft über deinen eigenen Server.` → `Der Mentor läuft über deinen Journalyst-Server.` (Knopf und Ziel `#/mentor` bleiben, fwtest.js:46) | wording-14 |
```

## wording-S7.1-7.3 · Dashboard: Widget-Suche „Widgets durchsuchen“ mit aria-label, „Neuer Recap“, Banner-Knopf „CSV importieren“

Gruppe wording · Cluster wording · Aufwand S · Befunde: wording-51, wording-11, wording-49
Quelle: audit/spec/wording.md Z. 395–401 · Dateien: web/js/screens/dashboard.js
Abhängig von: —

```text
### Schritt 7 · `web/js/screens/dashboard.js` und `web/js/screens/dash-filter.js`

| # | Stelle | vorher → nachher | ids |
|---|---|---|---|
| 7.1 | dashboard.js:78 Widget-Suche | `placeholder="Widget suchen …"` → `placeholder="Widgets durchsuchen" aria-label="Widgets durchsuchen"` | wording-51 |
| 7.2 | dashboard.js:89 Hinweis-Punkt | `'Neuer Performance-Recap'` → `'Neuer Recap'` | wording-11 |
| 7.3 | dashboard.js:130 Willkommen-Banner | `${I.upload} CSV</button>` → `${I.upload} CSV importieren</button>` | wording-49 |
```

## wording-S7.4-7.6 · Dashboard-Filter: Platzhalter „Von“/„Bis“, „Intraday / Mehrtägig“, „Nachbereitet: Alle · Ja · Nein“

Gruppe wording · Cluster wording · Aufwand S · Befunde: bereich_dashboard-31
Quelle: audit/spec/wording.md Z. 402–405 · Dateien: web/js/screens/dash-filter.js
Abhängig von: —

```text
| 7.4 | dash-filter.js:104 `pair()` | `placeholder="${o.ph1 \|\| 'Min'}"` → `\|\| 'Von'`; `placeholder="${o.ph2 \|\| 'Max'}"` → `\|\| 'Bis'` | bereich_dashboard-31 |
| 7.5 | dash-filter.js:119 | `row('Intraday / Multiday', seg('span', f, [['', 'Alle'], ['intraday', 'Intraday'], ['multiday', 'Multiday']]))` → `row('Intraday / Mehrtägig', seg('span', f, [['', 'Alle'], ['intraday', 'Intraday'], ['multiday', 'Mehrtägig']]))` | bereich_dashboard-31 |
| 7.6 | dash-filter.js:120 | `row('Reviewed', seg('reviewed', f, [['', 'Alle'], ['yes', 'Reviewed'], ['no', 'Unreviewed']]), 'Bewertung oder Notiz vorhanden')` → `row('Nachbereitet', seg('reviewed', f, [['', 'Alle'], ['yes', 'Ja'], ['no', 'Nein']]), 'Bewertung oder Notiz vorhanden')` (Werte `yes`/`no` bleiben, filtertest.js:62) | bereich_dashboard-31 |

```

## wording-S9.8-9.9 · TradeLog: Seitenwähler-Zähler über U.count, „Trefferquote“ in den Tageskarten

Gruppe wording · Cluster wording · Aufwand S · Befunde: zustaende-28, wording-3, bereich_trades_tag-36
Quelle: audit/spec/wording.md Z. 431–432 · Dateien: web/js/screens/trades.js
Abhängig von: wording-S1.1-1.3

```text
| 9.8 | Z. 48 Seitenwähler | `von ${rows.length} Trades` → `von ${U.count(rows.length, 'Trade', 'Trades')}` | zustaende-28 |
| 9.9 | Z. 54 Tageskarten | `<div class="k">Win-Rate</div>` → `<div class="k">Trefferquote</div>` | wording-3, bereich_trades_tag-36 |
```

## wording-S9.17 · Dialogtitel „Text-Notiz“ statt „Notiz sprechen oder tippen“

Gruppe wording · Cluster wording · Aufwand S · Befunde: bereich_trades_tag-47
Quelle: audit/spec/wording.md Z. 440–441 · Dateien: web/js/screens/trades.js
Abhängig von: —

```text
| 9.17 | Z. 118 Dialogtitel | `<h2>Notiz sprechen oder tippen</h2>` → `<h2>Text-Notiz</h2>` | bereich_trades_tag-47 |

```

## wording-S11.1-11.5 · Schatten-Ich: Regel „Schluss nach Verlustserie“, Kosten-Texte mit „Verstöße“, DESC-Texte, Banner ohne Gedankenstrich, Zähler

Gruppe wording · Cluster wording · Aufwand S · Befunde: wording-41, wording-38, wording-10, zustaende-28
Quelle: audit/spec/wording.md Z. 462–470 · Dateien: web/js/shadow.js, web/js/screens/shadow.js
Abhängig von: wording-S1.1-1.3

```text
### Schritt 11 · `web/js/shadow.js` und `web/js/screens/shadow.js`

| # | Stelle | vorher → nachher | ids |
|---|---|---|---|
| 11.1 | js/shadow.js:14 | `label: 'Stopp nach Verlusten in Folge'` → `label: 'Schluss nach Verlustserie'` (Regel-Schlüssel `lossStreak` bleibt; das aria-label „… : Verluste“ zieht mit) | wording-41 |
| 11.2 | screens/shadow.js:25 `costView` | `'Regelbrüche haben dich das gekostet'` → `'So viel haben dich Verstöße gekostet'`; `'Regelbrüche haben dir das gebracht'` → `'So viel haben dir Verstöße gebracht'` | wording-38 |
| 11.3 | screens/shadow.js:32 `DESC` | `dailyLoss: 'Ist das Tageslimit erreicht, ist für heute Schluss.'` → `'Ist der maximale Tagesverlust erreicht, ist für heute Schluss.'`; `lossStreak: 'Nach so vielen Verlusten hintereinander ist Pause.'` → `'Nach so vielen Verlusten hintereinander ist für heute Schluss.'` | wording-10, wording-41 |
| 11.4 | screens/shadow.js:58 Banner | `'Schalte oben mindestens eine Regel ein – dann rechnet dein Schatten-Ich, was Regelbrüche kosten.'` → `'Schalte oben mindestens eine Regel ein. Dann rechnet dein Schatten-Ich, was Verstöße kosten.'` | wording-38 |
| 11.5 | screens/shadow.js:59 | `${res.unknownRisk === 1 ? '1 Trade ohne Stop konnte' : \`${…} Trades ohne Stop konnten\`}` → `${U.count(res.unknownRisk, 'Trade', 'Trades')} ohne Stop ${res.unknownRisk === 1 ? 'konnte' : 'konnten'}` | zustaende-28 |
```

## wording-S11.6-11.11 · Schatten-Ich-Karten: „Regelwerk“, Intro, Info-Texte, Kachel-Fuß „Ohne Verstöße“, Diagramm „Kumulierter Netto-P&L“

Gruppe wording · Cluster wording · Aufwand S · Befunde: wording-25, wording-38, wording-39, wording-40
Quelle: audit/spec/wording.md Z. 471–477 · Dateien: web/js/screens/shadow.js
Abhängig von: —

```text
| 11.6 | screens/shadow.js:60 | `U.card('Mein Regelwerk', …, { info: 'Schalte ein, was für dich gilt. Dein Schatten-Ich hält sich daran – Änderungen gelten sofort.' })` → `U.card('Regelwerk', …, { info: 'Schalte ein, was für dich gilt. Dein Schatten-Ich hält sich daran, Änderungen gelten sofort.' })` | wording-25, wording-38 |
| 11.7 | screens/shadow.js:108 Intro | `Dein Schatten-Ich handelt wie du – nur ohne Regelbrüche.` → `Dein Schatten-Ich handelt wie du, hält sich aber an jede aktive Regel.` | wording-38 |
| 11.8 | screens/shadow.js:109 | `'Sobald Trades geschlossen sind, zeigt dir dein Schatten-Ich, was Regelbrüche kosten.'` → `'… was Verstöße kosten.'` | wording-38 |
| 11.9 | screens/shadow.js:112 Info | `'Schatten-Ich minus echt: Was Regelbrüche im Zeitraum unterm Strich bewirkt haben.'` → `'Schatten-Ich minus echt: was Verstöße im Zeitraum unterm Strich bewirkt haben.'` | wording-38 |
| 11.10 | screens/shadow.js:114 | `{ foot: 'Mit allen Regeln eingehalten' }` → `{ foot: 'Ohne Verstöße' }` | wording-39 |
| 11.11 | screens/shadow.js:118 | `U.card('Equity: echt vs. Schatten-Ich', …, { info: '… lässt Trades mit Regelbruch weg …' })` → `U.card('Kumulierter Netto-P&L', …, { info: '… lässt Trades mit Verstoß weg …' })` (Legende „Echt / Schatten-Ich“ bleibt) | wording-40, wording-38 |

```

## wording-S12.30 · Coupons-Leerzustand „Coupon-Codes für Prop Firms erscheinen hier.“

Gruppe wording · Cluster wording · Aufwand S · Befunde: wording-55
Quelle: audit/spec/wording.md Z. 511–512 · Dateien: web/js/screens/coupons.js
Abhängig von: —

```text
| 12.30 | coupons.js:13 | `'Rabatt-Codes für Prop Firms erscheinen hier.'` → `'Coupon-Codes für Prop Firms erscheinen hier.'` | wording-55 |

```

## wording-S14.8-14.9 · Notebook: Zähler über U.count, Toast „Notiz verschoben“

Gruppe wording · Cluster wording · Aufwand S · Befunde: zustaende-28, bereich_notebook_news-27
Quelle: audit/spec/wording.md Z. 536–537 · Dateien: web/js/screens/notebook.js
Abhängig von: wording-S1.1-1.3

```text
| 14.8 | notebook.js:141 / 142 / 149 / 162 | `` `${nb.selected.length} Notizen verschoben` `` → `` `${U.count(nb.selected.length, 'Notiz', 'Notizen')} verschoben` ``; ebenso `… löschen?` (142), `… endgültig löschen?` (149); Z. 162 `Alle ${n} Notizen darin werden …` → `${n === 1 ? 'Die Notiz darin wird' : \`Alle ${n} Notizen darin werden\`} mit gelöscht …` | zustaende-28 |
| 14.9 | notebook.js:143 | `U.toast('Verschoben', 'ok')` → `U.toast('Notiz verschoben', 'ok')` | bereich_notebook_news-27 |
```

## wording-S15.1-15.3 · News: Fehlertexte auf „Journalyst-Server“ und „Einstellungen → Server“, Banner gekürzt

Gruppe wording · Cluster wording · Aufwand S · Befunde: bereich_notebook_news-46, wording-14, bereich_notebook_news-45
Quelle: audit/spec/wording.md Z. 541–547 · Dateien: web/js/screens/news.js
Abhängig von: —

```text
### Schritt 15 · Server-Texte: `web/js/screens/news.js`, `web/js/screens/mentor.js`, `web/js/screens/coach.js`, `web/js/coach.js`, `web/js/voice.js`, `web/js/screens/ruhepunkt.js`

| # | Stelle | vorher → nachher | ids |
|---|---|---|---|
| 15.1 | news.js:28 | `'Der Server ist nicht erreichbar. Prüf die Adresse unter Einstellungen → Mentor.'` → `'Der Journalyst-Server ist nicht erreichbar. Prüfe deine Verbindung und die Adresse unter Einstellungen → Server.'` | bereich_notebook_news-46, wording-14 |
| 15.2 | news.js:29 | `'Zugangstoken fehlt oder ist falsch (Einstellungen → Mentor).'` → `'Zugangstoken fehlt oder ist falsch. Prüfe es unter Einstellungen → Server.'` | bereich_notebook_news-46, wording-14 |
| 15.3 | news.js:91 Banner | `<b>Beispielansicht.</b> Echte Termine kommen über deinen Journalyst-Server (derselbe wie für den Mentor). <span class="muted">Die Beispiele haben keine Prognose- oder Vorwerte.</span>` → `<b>Beispielansicht.</b> Echte Termine kommen über deinen Journalyst-Server.` (Knopf „Server einrichten“ bleibt; Präfix „Beispiel: “ in Z. 40 bleibt) | bereich_notebook_news-45, wording-14 |
```

## wording-S15.4-15.5 · Mentor: Fehler- und Einrichten-Text, Knopf „Server einrichten“, Repo-Pfad streichen

Gruppe wording · Cluster wording · Aufwand S · Befunde: wording-14, bereich_notebook_news-46, bereich_training-35
Quelle: audit/spec/wording.md Z. 548–549 · Dateien: web/js/screens/mentor.js
Abhängig von: —

```text
| 15.4 | mentor.js:17 | `'Der Mentor-Server ist nicht erreichbar. Prüf die Adresse unter Einstellungen → Mentor und deine Verbindung.'` → Text aus 15.1 | wording-14, bereich_notebook_news-46 |
| 15.5 | mentor.js:79 | `<p class="muted">Der Mentor läuft über deinen eigenen Server, damit der API-Schlüssel nie im Browser landet. Trag unter Einstellungen → Mentor die Server-Adresse und das Zugangstoken ein.</p>` → `<p class="muted">Der Mentor läuft über deinen Journalyst-Server, damit der API-Schlüssel nie im Browser liegt. Trage unter Einstellungen → Server die Adresse und das Zugangstoken ein.</p>`; Knopf `Zu den Einstellungen` → `Server einrichten`; `<div class="small faint" style="margin-top:14px">Anleitung zum Server: <code>server/README.md</code> im Projekt.</div>` ersatzlos streichen (h2 bleibt) | bereich_training-35, wording-14 |
```

## wording-S15.16-15.21 · Server-Texte in js/coach.js, voice.js, ruhepunkt.js: „Journalyst-Server“, „Prüfe“/„versuche“, Kommentare

Gruppe wording · Cluster wording · Aufwand S · Befunde: wording-14, bereich_notebook_news-46
Quelle: audit/spec/wording.md Z. 560–566 · Dateien: web/js/coach.js, web/js/voice.js, web/js/screens/ruhepunkt.js
Abhängig von: —

```text
| 15.16 | js/coach.js:41 | `'Der Server ist nicht erreichbar. Prüf die Adresse unter Einstellungen → Mentor und deine Verbindung.'` → Text aus 15.1 | wording-14, bereich_notebook_news-46 |
| 15.17 | voice.js:18 | `'Mentor-Server nicht eingerichtet'` → `'Journalyst-Server nicht eingerichtet'` | wording-14 |
| 15.18 | voice.js:72 | `Ohne Mentor-Server wird nur das Transkript gespeichert. Adresse unter Einstellungen → Mentor.` → `Ohne Journalyst-Server wird nur das Transkript gespeichert. Die Adresse trägst du unter Einstellungen → Server ein.` | wording-14 |
| 15.19 | voice.js:103 | `… richte den Mentor-Server ein.` → `… richte den Journalyst-Server ein.` | wording-14 |
| 15.20 | ruhepunkt.js:776 | `'Speichern hat nicht geklappt. Prüf deine Verbindung und versuch es noch einmal.'` → `'Speichern hat nicht geklappt. Prüfe deine Verbindung und versuche es noch einmal.'` | bereich_notebook_news-46 |
| 15.21 | Kommentare js/coach.js:1 und voice.js:2 | „Mentor-Server“ → „Journalyst-Server“ (nur Kommentar, damit die grep-Prüfung 4.1 auf 0 kommt) | wording-14 |

```
