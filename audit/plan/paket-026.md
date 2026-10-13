# Paket 026 · training, aufbau, dashboard

Schritte: 22 · Dateien: web/README.md, web/css/app.css, web/js/screens/mentor.js, web/js/screens/progress.js, web/js/screens/ruhepunkt.js, web/js/screens/shadow.js
Betroffene Tests laut Spezifikation: Akzeptanz grep 11, Sonde 20; Akzeptanz grep 9; Sonde 20; prüfen: e2e/headtest.js:55–57 (Füll-Animation .ring-arc .arc); prüfen: e2e/mentortest.js:44; prüfen: e2e/rptest.js (.rp-choice, .rp-seq-i); prüfen: e2e/rptest.js:11; prüfen: e2e/shadowtest.js; web/e2e/headtest.js:55, :57 (.ring-arc .arc) prüfen; web/e2e/shadowtest.js:57 (O5); web/tests/shadow.test.mjs:163 bleibt
Baut auf Paketen auf: 6, 16, 19, 20, 23, 25

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## aufbau-D2b · README: TradeLog, Tagesansicht, Statistiken, News, Fortschritt

Gruppe aufbau · Cluster aufbau · Aufwand S · Befunde: bereich_trades_tag-18, bereich_trades_tag-33, bereich_trades_tag-27, hierarchie-7, aufbau-5, aufbau-19, bereich_statistik-5, aufbau-20, bereich_notebook_news-39, bereich_training-11, bereich_training-10
Quelle: audit/spec/aufbau.md Z. 689–693 · Dateien: web/README.md
Abhängig von: aufbau-C15a, aufbau-C15b, aufbau-C15c, aufbau-C7a, aufbau-B6, aufbau-B7, aufbau-C14b, aufbau-C1, aufbau-C9a, aufbau-C11c

```text
- TradeLog (Z. 84 ff.): Spaltenfolge, „Kacheln folgen Suche und Filter“, „Verpasste Trades folgen Zeitraum und Konto“
- Z. 108 Tagesansicht: „Kopfreihe ohne Zeitraum; „Trade loggen“ legt an anderen Tagen den Trade auf diesen Tag (09:00), auch mit Taste N“
- Z. 109 Statistiken: „Reiterleiste oben; die Kurve „Kumulierter Netto-P&L“ nur in der Übersicht; 16 Kennzahlen in vier Themenreihen“
- News-Punkt: „Filter in der Kopfreihe, kein Session-Knopf“
- Z. 135 Fortschritt: „links die Tages-Checkliste, rechts untereinander Disziplin pro Woche und Tilt-Profil, zusammen so hoch wie die Checkliste (das Tilt-Profil füllt den Rest); darunter Trading-Aktivität und Regeln im Detail“
```

## aufbau-C16 · Ruhepunkt-Fuß: Hilfe-Link links und unterstrichen; Telefonnummern unterstrichen

Gruppe aufbau · Cluster training · Aufwand S · Befunde: bereich_training-50
Quelle: audit/spec/aufbau.md Z. 629–636 · Dateien: web/css/app.css
Abhängig von: —

```text
#### Restliche Einzelstellen in `web/css/app.css`

**C16 Ruhepunkt-Fuß** · bereich_training-50
- Z. 2316 `.rp-foot { …; justify-content: flex-end; … }` → `justify-content: flex-start;` (am Handy bleibt Z. 2334 zentriert)
- Z. 2317 → `.rp-foot .rp-btn.rp-quiet { font-size: 13px; color: var(--text-2); text-decoration: underline; text-underline-offset: 3px; padding-left: 0; }`
- Z. 2318 → `.rp-foot .rp-btn.rp-quiet:hover { color: var(--text); }`
- Z. 2322 `.rp-dlg a { color: var(--text); font-weight: 700; }` → `.rp-dlg a { color: var(--text); font-weight: 700; text-decoration: underline; text-underline-offset: 3px; }`

```

## diagramme-A5 · Aktivitäts-Heatmap neutral (--text 14/26/38/50/62 %), Heute-Ring --text-2

Gruppe diagramme · Cluster training · Aufwand S · Befunde: farbe_kontrast-21, diagramme-23
Quelle: audit/spec/diagramme.md Z. 316–320 · Dateien: web/css/app.css
Abhängig von: —

```text
**A5 Aktivitäts-Heatmap neutral** (farbe_kontrast-21, Ergänzung diagramme-23)
- Z. 1287–1290: in `.activity i.lN, .heat-legend i.lN` jeweils `color-mix(in srgb, var(--accent) 22% | 40% | 60% | 80%, var(--surface-2))` → `color-mix(in srgb, var(--text) 14% | 26% | 38% | 50%, var(--surface-2))`. `border-color: transparent` bleibt.
- Z. 1291 `background: var(--accent)` → `background: color-mix(in srgb, var(--text) 62%, var(--surface-2))`.
- Z. 1292 → `.activity i.today { box-shadow: 0 0 0 2px var(--text-2); }`

```

## diagramme-A6 · Regel-Tracker: Legende und Zellen mit gemeinsamen Selektoren

Gruppe diagramme · Cluster dashboard · Aufwand S · Befunde: diagramme-24
Quelle: audit/spec/diagramme.md Z. 321–328 · Dateien: web/css/app.css
Abhängig von: diagramme-A5

```text
**A6 Regel-Tracker: Legende = Zellen** (diagramme-24)
- Z. 1668 → `.tracker i.l1, .heat-legend.right i.l1 { background: color-mix(in srgb, var(--accent) 25%, var(--surface-2)); border: 0; }`
- Z. 1669 → gleiche Form mit `.l2` und 45 %
- Z. 1670 → gleiche Form mit `.l3` und 70 %
- Z. 1671 → `.tracker i.l4, .heat-legend.right i.l4 { background: var(--accent); border: 0; }`

Die Spezifität (0,3,1) schlägt `.heat-legend i.lN` aus A5. Die Fortschritt-Legende (ohne `.right`) bleibt neutral.

```

## diagramme-A7 · Regeltreue-Ring CSS: Rand 96px, drop-shadow streichen, Handy-Regel kürzen

Gruppe diagramme · Cluster training · Aufwand S · Befunde: bereich_training-7, diagramme-26
Quelle: audit/spec/diagramme.md Z. 329–333 · Dateien: web/css/app.css
Abhängig von: —

```text
**A7 Regeltreue-Ring** (bereich_training-7, Ergänzung diagramme-26)
- Z. 1312 `margin-right: 150px` → `margin-right: 96px`.
- Z. 1317: `filter: drop-shadow(0 0 6px var(--accent-glow));` streichen. Die Farbe kommt künftig inline (H1). Die `transition` derselben Zeile ändert Bewegung B8.
- Z. 1318 → `@media (max-width: 600px) { .card.ring-card { min-height: 0; } }`. Der 64-px-Ring bleibt damit auch am Handy rechts mittig.

```

## diagramme-A8b · Neue Klasse .shadow-clean (Abstand der Zeile „Ohne Verstöße“)

Gruppe diagramme · Cluster training · Aufwand S · Befunde: bereich_training-30
Quelle: audit/spec/diagramme.md Z. 336–337 · Dateien: web/css/app.css
Abhängig von: —

```text
- nach Z. 2443 neu: `.shadow-clean { margin-top: 10px; }`

```

## diagramme-H1 · Regeltreue-Ring 64/6 px in scoreColor, kein Bogen bei 0

Gruppe diagramme · Cluster training · Aufwand S · Befunde: bereich_training-7, diagramme-26
Quelle: audit/spec/diagramme.md Z. 626–635 · Dateien: web/js/screens/progress.js
Abhängig von: diagramme-A7

```text
### 3.8 `web/js/screens/progress.js`

**H1 Ring** (bereich_training-7, Ergänzung diagramme-26)

Z. 6 `ringArc(rate, size = 116, lw = 9)` → `ringArc(rate, size = 64, lw = 6)`. Den `<circle class="arc" …/>` nur ausgeben, wenn `rate > 0`, und um `style="stroke:${U.scoreColor(rate * 100)}"` ergänzen:
```js
${rate > 0 ? `<circle class="arc" style="stroke:${U.scoreColor(rate * 100)}" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${lw}" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c}" data-target="${off.toFixed(2)}"/>` : ''}
```
`mount()` (Z. 41–43) kommt mit leerer Liste aus.

```

## diagramme-I1 · Schatten-Ich-Ranking: Balken nur bei Verstoß, Zeile „Ohne Verstöße“, Leerzustand

Gruppe diagramme · Cluster training · Aufwand S · Befunde: bereich_training-30
Quelle: audit/spec/diagramme.md Z. 640–652 · Dateien: web/js/screens/shadow.js
Abhängig von: diagramme-A8b

```text
### 3.9 `web/js/screens/shadow.js`

**I1 Ranking** (bereich_training-30) Z. 76–80 `rankingRows`:
```js
function rankingRows(ranking) {
  if (!ranking.length) return U.empty('shield', 'Keine Regel aktiv', '');
  const hit = ranking.filter(x => x.n > 0), clean = ranking.filter(x => !x.n); const max = Math.max(0, ...hit.map(x => Math.abs(x.cost)));
  const bars = hit.length ? `<div class="shadow-rank">${hit.map(x => U.barRow(x.label, x.cost, max, `${U.pnl(-x.cost)} <span class="muted">· ${x.n}×</span>`, x.cost > C.EPS ? 'var(--loss)' : x.cost < -C.EPS ? 'var(--profit)' : 'var(--surface-3)')).join('')}</div>` : U.empty('shield', 'Keine Verstöße', 'Im Zeitraum wurde keine Regel gebrochen.');
  return bars + (clean.length ? `<div class="small muted shadow-clean">Ohne Verstöße: ${clean.map(x => esc(x.label)).join(', ')}</div>` : '');
}
```
Die Engine liefert Regeln ohne Verstoß weiter mit 0 (tests/shadow.test.mjs:163). Gefiltert wird nur in der Anzeige.

```

## zustaende-S-C11 · Schatten-Ich-Regelkarte: aus transparent, an surface-2 mit Rand border-2 (kein Grün)

Gruppe zustaende · Cluster training · Aufwand S · Befunde: farbe_kontrast-30
Quelle: audit/spec/zustaende.md Z. 333–337 · Dateien: web/css/app.css
Abhängig von: —

```text
**S-C11 Regelkarte im Schatten-Ich** – farbe_kontrast-30
- Kommentar Z. 2399 „an = leicht getönt“ → „an = leicht angehoben (Fläche surface-2, Rand border-2), Grün nur im Schalter“.
- Z. 2401 `.shadow-rule { … background: var(--surface-2); … }` → `background: transparent;` (Rand, Abstände, Transition bleiben).
- Z. 2402 → `.shadow-rule.on { border-color: var(--border-2); background: var(--surface-2); }`

```

## zustaende-S-PR1 · Fortschritt-Hero: „0 %“ in muted, Regeltreue ohne Daten „—“, Trendpfeil nur mit Vorzeitraum und Tooltip

Gruppe zustaende · Cluster training · Aufwand S · Befunde: bereich_training-6, wording-42, zustaende-10, ki_look-7, diagramme-27, typografie-15
Quelle: audit/spec/zustaende.md Z. 695–702 · Dateien: web/js/screens/progress.js
Abhängig von: —

```text
### 3.13 `web/js/screens/progress.js`

**S-PR1 Hero-Werte und Pfeile** – bereich_training-6 (mit wording-42, zustaende-10, ki_look-7), diagramme-27, typografie-15
- Z. 20 `const arrow = (dir) => dir > 0 ? `<span class="trend up" aria-label="steigend">…` : …` → `const arrow = (dir, tip = '') => …`, in beiden `<span class="trend …"` nach `aria-label="…"` `${tip ? ` data-tip="${esc(tip)}"` : ''}` ergänzen.
- Z. 59 → `const rateDir = cur.rate != null && prev && prev.rate != null ? Math.sign(cur.rate - prev.rate) : 0;`
- Z. 68 `<span>${doneN ? pct + ' %' : 'Keine Daten'}</span>${arrow(doneN >= 4 ? 1 : 0)}` → `<span class="${doneN ? '' : 'muted'}">${pct} %</span>` (Pfeil entfällt).
- Z. 69 `<span>${cur.rate == null ? '0 %' : fmt.pct(cur.rate)}</span>${arrow(rateDir)}` → `<span>${cur.rate == null ? '<span class="muted">—</span>' : fmt.pct(cur.rate)}</span>${arrow(rateDir, rateDir ? `Vorzeitraum: ${fmt.pct(prev.rate)}` : '')}`

```

## zustaende-S-PR2 · Fortschritt-Ring: kein Bogen bei 0 oder null

Gruppe zustaende · Cluster training · Aufwand S · Befunde: zustaende-11
Quelle: audit/spec/zustaende.md Z. 703–705 · Dateien: web/js/screens/progress.js
Abhängig von: —

```text
**S-PR2 Ring ohne Kappe bei 0** – zustaende-11
Z. 6 `ringArc`: den zweiten Kreis `<circle class="arc" …/>` nur ausgeben, wenn `rate > 0` (`${rate > 0 ? `<circle class="arc" …/>` : ''}`). mount (Z. 41–43) kommt mit leerer NodeList zurecht.

```

## zustaende-S-PR3 · Fortschritt: Regel-Karte als .dashed mit einem Kopf-Knopf (anlegen/bearbeiten), Wochen-Diagramm nur mit Daten

Gruppe zustaende · Cluster training · Aufwand S · Befunde: bereich_training-19, zustaende-13, zustaende-2
Quelle: audit/spec/zustaende.md Z. 706–709 · Dateien: web/js/screens/progress.js
Abhängig von: —

```text
**S-PR3 Regel-Karte und Wochen** – bereich_training-19, zustaende-13, zustaende-2
- Z. 77 Leerzweig `U.empty('shield', 'Keine Regeln definiert', …, `<a class="btn sm" href="#/settings">Regeln anlegen</a>`)` → `'<div class="dashed">Noch keine Regeln angelegt.</div>'`; `trailing: `<a class="btn sm" href="#/settings">${I.edit} Regeln bearbeiten</a>`` → `trailing: `<a class="btn sm" href="#/settings/regeln">${rules.length ? `${I.edit} Regeln bearbeiten` : `${I.plus} Regeln anlegen`}</a>``
- Z. 78 `<div class="chart h200" data-chart="weeks" data-id="prog-weeks"></div>` → `${weeks.length ? '<div class="chart h200" data-chart="weeks" data-id="prog-weeks"></div>' : '<div class="dashed">Noch keine abgeschlossenen Trades.</div>'}`

```

## zustaende-S-MT1 · Mentor ohne Server: leere Kopfreihe (head als Getter)

Gruppe zustaende · Cluster training · Aufwand S · Befunde: zustaende-16, hierarchie-34
Quelle: audit/spec/zustaende.md Z. 837–841 · Dateien: web/js/screens/mentor.js
Abhängig von: —

```text
### 3.19 `web/js/screens/mentor.js`

**S-MT1 Kopfreihe ohne Server** – zustaende-16 (mit hierarchie-34)
Z. 76 `head: { range: false, session: false, trade: false, note: 'Der Mentor sieht die letzten 20 Trades dieses Kontos.' },` → `get head() { return configured() ? { range: false, session: false, trade: false, note: 'Der Mentor sieht die letzten 20 Trades dieses Kontos.' } : { range: false, account: false, session: false, trade: false }; },` (app.js:257 liest den Getter über `Object.assign`).

```

## zustaende-S-RP1 · Ruhepunkt: laufende Session nur mit Rückfrage verwerfen

Gruppe zustaende · Cluster training · Aufwand S · Befunde: bereich_training-42
Quelle: audit/spec/zustaende.md Z. 858–864 · Dateien: web/js/screens/ruhepunkt.js
Abhängig von: —

```text
### 3.21 `web/js/screens/ruhepunkt.js`

**S-RP1 Session nicht ohne Rückfrage verwerfen** – bereich_training-42
- Z. 781 (`renderDone`) `cleanup(); homeBtn(true);` → `cleanup(); homeBtn(false);`
- Z. 890 → `'rp-home': function () { if (!stage) return; var go = function () { renderHome().focus({ preventScroll: true }); }; if (mode === 'step' && stepIdx > 0) { U.confirmModal('Session verwerfen?', 'Deine Eingaben aus dieser Session gehen verloren.', { ok: 'Verwerfen', danger: true }).then(function (yes) { if (yes && stage) go(); }); } else go(); },`
- Beschriftung „← Übersicht“ (Z. 877) bleibt.

```

## zustaende-S-R2 · README Z. 144: Mentor ohne Server zeigt keine Kopfreihe

Gruppe zustaende · Cluster training · Aufwand S · Befunde: —
Quelle: audit/spec/zustaende.md Z. 889–889 · Dateien: web/README.md
Abhängig von: zustaende-S-MT1

```text
- Z. 144: Satz ergänzen „Ohne eingerichteten Server zeigt die Kopfreihe nichts.“
```

## zustaende-S-R3 · README Z. 224: Schatten-Ich-Regelkarte „leicht angehoben“, Grün nur im Schalter

Gruppe zustaende · Cluster training · Aufwand S · Befunde: —
Quelle: audit/spec/zustaende.md Z. 890–890 · Dateien: web/README.md
Abhängig von: zustaende-S-C11

```text
- Z. 224: „eingeschaltet ist sie leicht getönt“ → „eingeschaltet ist sie leicht angehoben (flach, feiner Rand), Grün nur im Schalter“.
```

## barrierefreiheit-C-shadow-69 · Schatten-Ich-Verstöße: Link in der ersten Zelle

Gruppe barrierefreiheit · Cluster training · Aufwand S · Befunde: bereich_training-20, barrierefreiheit-4
Quelle: audit/spec/barrierefreiheit.md Z. 785–788 · Dateien: web/js/screens/shadow.js
Abhängig von: barrierefreiheit-B7

```text
#### `web/js/screens/shadow.js`

- **Z. 69:** `<td>${fmt.dateTime(v.date)}</td>` → `<td><a class="row-link" href="#/trades/${esc(v.tradeId)}">${fmt.dateTime(v.date)}</a></td>` (Befunde: bereich_training-20, barrierefreiheit-4)

```

## kilook-B4 · Fortschrittsring ohne drop-shadow

Gruppe kilook · Cluster training · Aufwand S · Befunde: ki_look-6
Quelle: audit/spec/kilook.md Z. 436–440 · Dateien: web/css/app.css
Abhängig von: —

```text
**B4 · web/css/app.css:1317 · Fortschrittsring ohne Schein** (ki_look-6)
- vorher: `.ring-arc .arc { stroke: var(--accent); transition: stroke-dashoffset 1.1s cubic-bezier(.22, .61, .36, 1); filter: drop-shadow(0 0 6px var(--accent-glow)); }`
- nachher: `.ring-arc .arc { stroke: var(--accent); transition: stroke-dashoffset 1.1s cubic-bezier(.22, .61, .36, 1); }`
- 1312 `margin-right: 150px` bleibt, weil der Ring 116 px groß bleibt (N2).

```

## kilook-B5 · Ruhepunkt-Startkarten: Hover nur Rand/Fläche, kein Lichtkegel/Lift/Skalierung, keine Dauer-Änderung; Schein an Ampelpunkt und Rhythmus-Balken weg

Gruppe kilook · Cluster training · Aufwand M · Befunde: bereich_training-45
Quelle: audit/spec/kilook.md Z. 441–459 · Dateien: web/css/app.css
Abhängig von: —

```text
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

```

## kilook-B6 · Tilt-Labels 12px/500 ohne Versalien

Gruppe kilook · Cluster training · Aufwand S · Befunde: ki_look-36
Quelle: audit/spec/kilook.md Z. 460–463 · Dateien: web/css/app.css
Abhängig von: —

```text
**B6 · web/css/app.css:1302 · Tilt-Labels** (ki_look-36)
- vorher: `.tilt-stats .k { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; font-weight: 700; }`
- nachher: `.tilt-stats .k { font-size: 12px; color: var(--muted); font-weight: 500; }`

```

## kilook-C4 · Ruhepunkt-CSS: Reste des Schalters „Christlicher Impuls“ (.rp-switch) löschen

Gruppe kilook · Cluster training · Aufwand S · Befunde: bereich_training-49
Quelle: audit/spec/kilook.md Z. 553–556 · Dateien: web/css/app.css
Abhängig von: —

```text
**C4 · web/css/app.css · Ruhepunkt-Schalter-Reste** (bereich_training-49 = bewegung-41)
- **2147–2151** die fünf Regeln `.rp-switch …` löschen.
- **2333** in der Liste `.rp-switch input, .rp-switch input::after, .rp-choice { transition: none; }` den Teil `.rp-switch input, .rp-switch input::after, ` streichen. Übrig bleibt `.rp-choice { transition: none; }`.

```

## kilook-C15 · Schatten-Ich: Banner „Noch keine Regel aktiv“ ohne icon: 'sparkle'

Gruppe kilook · Cluster training · Aufwand S · Befunde: ki_look-17
Quelle: audit/spec/kilook.md Z. 642–644 · Dateien: web/js/screens/shadow.js
Abhängig von: —

```text
**C15 · web/js/screens/shadow.js:58** (ki_look-17)
- In `U.banner('info', 'Noch keine Regel aktiv', …, { icon: 'sparkle', trailing: … })` den Teil `icon: 'sparkle', ` streichen.

```
