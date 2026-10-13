# Paket 025 · training, aufbau, dashboard

Schritte: 16 · Dateien: web/README.md, web/css/app.css, web/js/screens/mentor.js, web/js/screens/progress.js, web/js/screens/ruhepunkt.js, web/js/screens/shadow.js
Betroffene Tests laut Spezifikation: Akzeptanz grep 11, Sonde 20; prüfen: e2e/mentortest.js:44; prüfen: e2e/rptest.js (.rp-choice, .rp-seq-i); prüfen: e2e/rptest.js:11; prüfen: e2e/shadowtest.js; web/e2e/shadowtest.js:57 (O5); web/tests/shadow.test.mjs:163 bleibt
Baut auf Paketen auf: 1, 6, 9, 15, 18, 19, 22, 24

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .rp-foot .rp-btn.rp-quiet] aufbau-C16 gewinnt inhaltlich: Der Krisenhilfe-Link „Hilfe und Beratung“ ist keine graue 12-px-Fußnote, er soll als Link erkennbar und lesbar sein (bereich_training-50). Die Größe steht aber als Token: `.rp-foot .rp-btn.rp-quiet { font-size: var(--fs-13); line-height: var(--lh-13); color: var(--text-2); text-decoration: underline; text-underline-offset: 3px; padding-left: 0; }` und `.rp-foot .rp-btn.rp-quiet:hover { color: var(--text); }`. Dazu `.rp-foot { … justify-content: flex-start; … }` (am Handy bleibt Z. 2334 zentriert) und `.rp-dlg a` wie in C16. 13 liegt auf der Skala (kleines Steuerelement). rptest.js:11 prüft nur den Text und ist nicht betroffen.
- ÄNDERN: In Z. 2317 `font-size: 13px` → `font-size: var(--fs-13); line-height: var(--lh-13)`. Alles andere bleibt wie in der Spezifikation.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .heat-legend i.l1] Beide Schritte machen dasselbe: Sie färben die Aktivitäts-Heatmap im Fortschritt neutral, und der Heute-Ring wird --text-2. Sie unterscheiden sich nur in den Prozentwerten und im Legenden-Selektor. Verbindlich für app.css Z. 1287–1291: `.activity i.l1, .heat-legend:not(.right) i.l1 { background: color-mix(in srgb, var(--text) 14%, var(--surface-2)); border-color: transparent; }`, ebenso l2 26 %, l3 38 %, l4 50 % und l5 62 % (l5 also auch als color-mix, nicht var(--accent), und ebenfalls mit `border-color: transparent`). Z. 1292: `.activity i.today { box-shadow: 0 0 0 2px var(--text-2); }`. Gibt die Entscheidung zum Anker `.activity i.today` (Komponenten nennt 1,5 px) etwas anderes vor, gilt diese. Begründung für die Werte: Nachgerechnet hat die erste Stufe bei 8 % zum leeren Kästchen nur 1,25:1 (dunkel) und 1,18:1 (hell), ist also kaum vom leeren Feld zu unterscheiden. Bei 14 % sind es 1,51:1 und 1,35:1. Die Schritte zwischen den Stufen sind gleichmäßig (1,37–1,48 dunkel, 1,33–1,47 hell). Die Diagramm-Spezifikation hat beide Werte in K11 ausdrücklich gegeneinander abgewogen. Farbe 1.9 / regeln.md Z. 13 (8/16/28/42/58 %) gilt damit nicht. Begründung für den Selektor `:not(.right)` (aus farbe-B23a): Die Fortschritt-Legende wird damit unabhängig von der Tracker-Legende `.heat-legend.right`. Sie hängt nicht mehr an der Spezifität und gilt gleich, ob beim Regel-Tracker diagramme-A6 oder farbe-B23b gewinnt. Die Akzeptanzprüfungen beider Gruppen bleiben erfüllt: diagramme grep 11 und Sonde 20 (l5 ≠ --accent), Farbe (kein var(--accent) in `.activity`, progress_voll grau abgestuft).
- ÄNDERN: Werte 14/26/38/50/62 % und Heute-Ring wie spezifiziert umsetzen, aber in allen fünf Regeln (Z. 1287–1291) den Legenden-Teil `.heat-legend i.lN` durch `.heat-legend:not(.right) i.lN` ersetzen. In l5 `border-color: transparent` behalten. Den Hinweis zur Spezifität (0,3,1) in A6 nicht mehr als Voraussetzung behandeln: Die Selektoren überschneiden sich nicht mehr. Zusätzlich gelten mit diesem Schritt die Befunde bereich_training-8, farbe_kontrast-24 (Teil Aktivität) und referenz-8 (Teil Aktivität) als erledigt.
- ÜBERNIMMT farbe-B23a: Kein eigener Schritt: diagramme-A5 übernimmt die Änderung, mit dem Selektor `:not(.right)` aus B23a. Die Prozentwerte 8/16/28/42/58 % werden NICHT verwendet. Gilt jetzt: 14/26/38/50/62 %. Die Farb-Akzeptanz (progress_voll grau abgestuft, kein --accent in .activity) prüft man am Ergebnis von A5.
- [konflikt: .activity i.l1] Wie beim Anker `.heat-legend i.l1` (eine gemeinsame Entscheidung): `.activity i.l1, .heat-legend:not(.right) i.l1 { background: color-mix(in srgb, var(--text) 14%, var(--surface-2)); border-color: transparent; }`, umgesetzt von diagramme-A5, farbe-B23a zusammen_mit A5.
- [konflikt: .activity i.l2] Wie beim Anker `.heat-legend i.l1`: `.activity i.l2, .heat-legend:not(.right) i.l2 { background: color-mix(in srgb, var(--text) 26%, var(--surface-2)); border-color: transparent; }`, umgesetzt von diagramme-A5, farbe-B23a zusammen_mit A5.
- [konflikt: .activity i.l3] Wie beim Anker `.heat-legend i.l1`: `.activity i.l3, .heat-legend:not(.right) i.l3 { background: color-mix(in srgb, var(--text) 38%, var(--surface-2)); border-color: transparent; }`, umgesetzt von diagramme-A5, farbe-B23a zusammen_mit A5.
- [konflikt: .activity i.l4] Wie beim Anker `.heat-legend i.l1`: `.activity i.l4, .heat-legend:not(.right) i.l4 { background: color-mix(in srgb, var(--text) 50%, var(--surface-2)); border-color: transparent; }`, umgesetzt von diagramme-A5, farbe-B23a zusammen_mit A5.
- [konflikt: .activity i.l5] Wie beim Anker `.heat-legend i.l1`: `.activity i.l5, .heat-legend:not(.right) i.l5 { background: color-mix(in srgb, var(--text) 62%, var(--surface-2)); border-color: transparent; }`, also nicht mehr var(--accent). Umgesetzt von diagramme-A5, farbe-B23a zusammen_mit A5.
- [konflikt: --accent] Affiliate-Balken (affiliate.js Z. 47): neutral nach diagramme-K1, also `<path class="br">` mit fill var(--text-2) und fill-opacity .45. Das gilt auch gegen farbe-C16 (--profit). Gründe: Provisionen sind immer ≥ 0, Grün trüge keine Unterscheidung. Die Farbe-Regel selbst sagt „Spalten mit einheitlichem Vorzeichen neutral“, und diagramme A-8 nennt Provisionen ausdrücklich neutral. Fokusring: barrierefreiheit-A2a (--focus = Textfarbe) gilt. Der README-Satz in farbe-D3e wird unter Anker .btn.primary angepasst. Die übrigen Schritte ändern verschiedene Stellen und sind untereinander verträglich. Ihre Einzelkonflikte stehen unter eigenen Ankern (.popover .item[aria-checked], .activity/.tracker/.heat-legend, .dp-day.today/.rr-day.today, .set-tabs/.prop-sub).
- [konflikt: .activity i.today] Das Ergebnis lautet `.activity i.today { box-shadow: 0 0 0 2px var(--text-2); }`. Begründung: Die Farbregel „Raster 0 0 0 2px var(--text-2)“ und diagramme A-8 nennen beide 2 px. Ganze Pixel zeichnen auf 1×-Bildschirmen scharf, 1,5 px wird verwaschen. Der Ring hebt sich außerdem klar vom 1-px-Hover-Umriss ab (bewegung). Für die Einheitlichkeit der Raster gilt dieselbe Breite auch für .tracker i.today und .ym-grid i.today (diese Anker regelt konflikt-4). diagramme-A5 und farbe-B23a schreiben in Z. 1292 denselben Wert: Wer zuerst läuft, setzt ihn, der andere findet ihn schon vor. Die Heatmap-Stufen sind nicht Teil dieses Ankers (konflikt-5).

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .tracker i.l1] Zellen und Legende des Regel-Trackers nutzen dieselben Selektoren (diagramme-A6, eine Quelle). Die Prozente kommen aus der Farb-Spezifikation; diagramme K12 überlässt sie ihr ausdrücklich. Grün bleibt, weil Regeltreue positiv ist (BRIEF), aber gedämpft statt als volle --accent-Fläche (ruhige Diagramme). Ergebnis in Z. 1668–1671: `.tracker i.l1, .heat-legend.right i.l1 { background: color-mix(in srgb, var(--accent) 18%, var(--surface-2)); border: 0; }`, ebenso l2 mit 32 %, l3 mit 50 % und l4 mit `color-mix(in srgb, var(--accent) 70%, var(--surface-2))`. Nach Z. 1675 kommen keine zusätzlichen .heat-legend.right-Regeln. Die Legende der Aktivität (ohne .right) bleibt neutral, die Spezifität 0,3,1 trennt beide.
- ÄNDERN: 18/32/50/70 % statt 25/45/70/100 %. l4 als `color-mix(in srgb, var(--accent) 70%, var(--surface-2))` statt `var(--accent)`, border: 0 bleibt. dashtest.js:72 (Tracker-Raster) mitprüfen.
- [konflikt: .tracker i.l2] Wie beim Anker .tracker i.l1: gemeinsamer Selektor `.tracker i.l2, .heat-legend.right i.l2` aus diagramme-A6, Wert `color-mix(in srgb, var(--accent) 32%, var(--surface-2))`, border: 0. Die Anpassungen stehen dort.
- [konflikt: .tracker i.l3] Wie beim Anker .tracker i.l1: gemeinsamer Selektor `.tracker i.l3, .heat-legend.right i.l3` aus diagramme-A6, Wert `color-mix(in srgb, var(--accent) 50%, var(--surface-2))`, border: 0. Die Anpassungen stehen dort.
- [konflikt: .tracker i.l4] Wie beim Anker .tracker i.l1: gemeinsamer Selektor `.tracker i.l4, .heat-legend.right i.l4` aus diagramme-A6, Wert `color-mix(in srgb, var(--accent) 70%, var(--surface-2))` statt `var(--accent)`, border: 0. Die Anpassungen stehen dort.
- [doppelt: .heat-legend.right i.l1] Die Legende hängt am Zellen-Selektor von diagramme-A6 (18 %). Die eigene Legenden-Regel aus farbe-B23b entfällt. Die Anpassungen stehen beim Anker .tracker i.l1.
- [doppelt: .heat-legend.right i.l2] Die Legende hängt am Zellen-Selektor von diagramme-A6 (32 %). Die eigene Legenden-Regel aus farbe-B23b entfällt. Die Anpassungen stehen beim Anker .tracker i.l1.
- [doppelt: .heat-legend.right i.l3] Die Legende hängt am Zellen-Selektor von diagramme-A6 (50 %). Die eigene Legenden-Regel aus farbe-B23b entfällt. Die Anpassungen stehen beim Anker .tracker i.l1.
- [doppelt: .heat-legend.right i.l4] Die Legende hängt am Zellen-Selektor von diagramme-A6 (70 %). Die eigene Legenden-Regel aus farbe-B23b entfällt. Die Anpassungen stehen beim Anker .tracker i.l1.
- [konflikt: --accent] Affiliate-Balken (affiliate.js Z. 47): neutral nach diagramme-K1, also `<path class="br">` mit fill var(--text-2) und fill-opacity .45. Das gilt auch gegen farbe-C16 (--profit). Gründe: Provisionen sind immer ≥ 0, Grün trüge keine Unterscheidung. Die Farbe-Regel selbst sagt „Spalten mit einheitlichem Vorzeichen neutral“, und diagramme A-8 nennt Provisionen ausdrücklich neutral. Fokusring: barrierefreiheit-A2a (--focus = Textfarbe) gilt. Der README-Satz in farbe-D3e wird unter Anker .btn.primary angepasst. Die übrigen Schritte ändern verschiedene Stellen und sind untereinander verträglich. Ihre Einzelkonflikte stehen unter eigenen Ankern (.popover .item[aria-checked], .activity/.tracker/.heat-legend, .dp-day.today/.rr-day.today, .set-tabs/.prop-sub).

## diagramme-A8b · Neue Klasse .shadow-clean (Abstand der Zeile „Ohne Verstöße“)

Gruppe diagramme · Cluster training · Aufwand S · Befunde: bereich_training-30
Quelle: audit/spec/diagramme.md Z. 336–337 · Dateien: web/css/app.css
Abhängig von: —

```text
- nach Z. 2443 neu: `.shadow-clean { margin-top: 10px; }`

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: U.empty] (1) Check-in-Leerzustände nutzen I.mood: kilook-C13 in day.js:16, kilook-C14 in stats.js:61. kilook-C25 löscht I.sparkle; der Satz „Z. 61 Symbol sparkle bleibt“ in zustaende-S-ST2 gilt deshalb nicht. (2) Den Knopftext im Check-in-Leerzustand der Tagesansicht setzt aufbau-C7c einmal: `${key < C.dayKey(new Date()) ? 'Check-in nachtragen' : 'Check-in machen'}`. Für künftige Tage passt „nachtragen“ nicht. (3) Schatten-Ich-Ranking (diagramme-I1): Ein leerer Hinweis ist nicht erlaubt (zustaende Z1: nie ''), also `U.empty('shield', 'Keine Regel aktiv', 'Schalte oben im Regelwerk mindestens eine Regel ein.')`. Ohne Verstoß gibt es keinen zweiten Leerzustand „Keine Verstöße“, der steht schon in der Nachbarkarte „Regelverstöße“. Es bleibt nur die Zeile „Ohne Verstöße: …“. (4) TradeLog-Liste: `return (list.length ? filters : '') + U.empty('tradelog', …)` mit Titel und Satz nach zustaende-S-T3. wording 9.7 und S-T3 ergänzen sich in derselben Zeile. (5) Regeln im Fortschritt: siehe #/settings/regeln. Verträglich sind aufbau-C15c, wording 9.14, 12.6, 12.30, zustaende-S-DY1 und noTrades aus S-ST2.
- ÄNDERN: `if (!ranking.length) return U.empty('shield', 'Keine Regel aktiv', 'Schalte oben im Regelwerk mindestens eine Regel ein.');` und `const bars = hit.length ? `<div class="shadow-rank">…</div>` : '';` ohne U.empty 'Keine Verstöße'. Rückgabe: bars plus die Zeile „Ohne Verstöße: …“ wie spezifiziert.
- [konflikt: U.barRow] typografie-3.8h setzt „Kosten je Fehler“ (stats.js:52) einmal um, mit dem Begriff aus dem Wording-Glossar: `${U.pnl(it.total)} <span class="muted">· ${it.n}× · Trefferquote ${fmt.pct(it.n ? it.wins / it.n : 0)}</span>`. „Win-Rate“ und „WR“ kommen nicht vor. Die Struktur aus Betrag und gedämpftem Zusatz passt zu diagramme-A8a (`.bar-row .bl > b` in Onest mit tabular-nums, `.muted` in 400) und zum Ranking aus diagramme-I1.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .shadow-rule.on] Nach zustaende-S-C11: aus = `.shadow-rule { …; background: transparent; }` (Rand --border, Abstände und Transition bleiben). An = `.shadow-rule.on { border-color: var(--border-2); background: var(--surface-2); }`. Kommentar Z. 2399: „an = leicht angehoben (Fläche surface-2, Rand border-2), Grün nur im Schalter“. Grund: BRIEF „leicht angehobene Fläche, feiner Rand“. farbe-C7 ließe aus und an beide auf --surface-2 und unterschiede sie nur durch 3 % Textbeimischung, das wäre kaum sichtbar, und der Zustand hinge allein am Schalter. transparent → surface-2 ist ruhig, lesbar und ohne Grün.

## zustaende-S-PR3 · Fortschritt: Regel-Karte als .dashed mit einem Kopf-Knopf (anlegen/bearbeiten), Wochen-Diagramm nur mit Daten

Gruppe zustaende · Cluster training · Aufwand S · Befunde: bereich_training-19, zustaende-13, zustaende-2
Quelle: audit/spec/zustaende.md Z. 706–709 · Dateien: web/js/screens/progress.js
Abhängig von: —

```text
**S-PR3 Regel-Karte und Wochen** – bereich_training-19, zustaende-13, zustaende-2
- Z. 77 Leerzweig `U.empty('shield', 'Keine Regeln definiert', …, `<a class="btn sm" href="#/settings">Regeln anlegen</a>`)` → `'<div class="dashed">Noch keine Regeln angelegt.</div>'`; `trailing: `<a class="btn sm" href="#/settings">${I.edit} Regeln bearbeiten</a>`` → `trailing: `<a class="btn sm" href="#/settings/regeln">${rules.length ? `${I.edit} Regeln bearbeiten` : `${I.plus} Regeln anlegen`}</a>``
- Z. 78 `<div class="chart h200" data-chart="weeks" data-id="prog-weeks"></div>` → `${weeks.length ? '<div class="chart h200" data-chart="weeks" data-id="prog-weeks"></div>' : '<div class="dashed">Noch keine abgeschlossenen Trades.</div>'}`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: U.empty] (1) Check-in-Leerzustände nutzen I.mood: kilook-C13 in day.js:16, kilook-C14 in stats.js:61. kilook-C25 löscht I.sparkle; der Satz „Z. 61 Symbol sparkle bleibt“ in zustaende-S-ST2 gilt deshalb nicht. (2) Den Knopftext im Check-in-Leerzustand der Tagesansicht setzt aufbau-C7c einmal: `${key < C.dayKey(new Date()) ? 'Check-in nachtragen' : 'Check-in machen'}`. Für künftige Tage passt „nachtragen“ nicht. (3) Schatten-Ich-Ranking (diagramme-I1): Ein leerer Hinweis ist nicht erlaubt (zustaende Z1: nie ''), also `U.empty('shield', 'Keine Regel aktiv', 'Schalte oben im Regelwerk mindestens eine Regel ein.')`. Ohne Verstoß gibt es keinen zweiten Leerzustand „Keine Verstöße“, der steht schon in der Nachbarkarte „Regelverstöße“. Es bleibt nur die Zeile „Ohne Verstöße: …“. (4) TradeLog-Liste: `return (list.length ? filters : '') + U.empty('tradelog', …)` mit Titel und Satz nach zustaende-S-T3. wording 9.7 und S-T3 ergänzen sich in derselben Zeile. (5) Regeln im Fortschritt: siehe #/settings/regeln. Verträglich sind aufbau-C15c, wording 9.14, 12.6, 12.30, zustaende-S-DY1 und noTrades aus S-ST2.
- [konflikt: #/settings/regeln] Alle Wege zu den Regeln führen auf #/settings/regeln. Doppelt umgesetzte Stellen: Widget-Leertext → aufbau-C2a (zustaende-S-W5 siehe widget:regel_tracker), Tagesansicht day.js:18 → aufbau-C7c. Fortschritt: Die Karte „Aktuelle Regeln“ entfällt (aufbau-C11b). Die Regeln stehen schon als Tages-Checkliste daneben, und eine Information gehört an eine Stelle. Ihr Kopf-Knopf wandert in die Tages-Checkliste: `trailing: `<a class="btn sm" href="#/settings/regeln">${rules.length ? `${I.edit} Regeln bearbeiten` : `${I.plus} Regeln anlegen`}</a><a class="btn sm" href="#/day/${todayKey}">Tag ansehen</a>``. Der Leerzustand der Checkliste ist `<div class="dashed">Noch keine Regeln angelegt.</div>` ohne Knopf: zustaende verlangt für .dashed einen Satz ohne Knopf, für jede Aktion gibt es ein Bedienelement, und der Satz folgt dem Glossar. zustaende-S-PR3 Z. 78 (Wochen-Diagramm nur mit Daten) bleibt.
- ÄNDERN: Z. 77 entfällt, weil die Karte gelöscht wird; die Logik des Kopf-Knopfs setzt aufbau-C11b in der Tages-Checkliste um. Z. 78 bleibt.
- [doppelt: .dashed] komponenten-S-dashboard-b setzt die leere Dashboard-Vorlage (dashboard.js:53) einmal um: `<div class="dashed dash-empty">…</div>` ohne Inline-Stil, CSS `.dash-empty { text-align: center; padding: var(--sp-8); }` (32 px aus der Abstandsskala, siehe komponenten-C36 unter .kpi-label). .dashed bleibt ein Satz ohne Knopf (Fortschritt siehe #/settings/regeln). typografie-3.2.3l stellt nur die Schriftgröße auf das Token um.

## zustaende-S-MT1 · Mentor ohne Server: leere Kopfreihe (head als Getter)

Gruppe zustaende · Cluster training · Aufwand S · Befunde: zustaende-16, hierarchie-34
Quelle: audit/spec/zustaende.md Z. 837–841 · Dateien: web/js/screens/mentor.js
Abhängig von: —

```text
### 3.19 `web/js/screens/mentor.js`

**S-MT1 Kopfreihe ohne Server** – zustaende-16 (mit hierarchie-34)
Z. 76 `head: { range: false, session: false, trade: false, note: 'Der Mentor sieht die letzten 20 Trades dieses Kontos.' },` → `get head() { return configured() ? { range: false, session: false, trade: false, note: 'Der Mentor sieht die letzten 20 Trades dieses Kontos.' } : { range: false, account: false, session: false, trade: false }; },` (app.js:257 liest den Getter über `Object.assign`).

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: App.pageHead] aufbau-B1 schreibt pageHead und newTradeButton neu und nimmt die Teile der anderen Schritte auf. Endzustand: `const sh = typeof screen.head === 'function' ? screen.head(ctx) : screen.head; const h = Object.assign({ range: true, account: true, session: true, trade: true, note: '', tradeTip: '' }, sh);`. In `left` steht `this.accountControl({ mobile: !h.range, iconM: !!h.range })` (responsiv-3.3a), danach wie heute `ctx.headLeft` und der Hinweis. In `right` steht `this.sessionControl()` ohne Argument (komponenten-A4); B1 lässt dort fälschlich noch `(true)` stehen. Vor dem return kommt `if (!left && !right) return '';`; das steht in B1 und abstaende-E1 gleich, also doppelt. abstaende-E-day2 setzt nur `ctx.headLeft` und passt ohne Änderung, weil pageHead headLeft nach dem Konto einsetzt. Mentor ohne Server nutzt die Funktionsform von head (siehe Anker screen.head).
- [konflikt: screen.head] Ein Mechanismus für bedingte Kopfreihen: `screen.head` darf eine Funktion von ctx sein (aufbau-B1, auch für Trade-Ansicht und Tagesansicht). Ein Getter würde zwar auch funktionieren, wäre aber eine zweite Schreibweise für dasselbe. Mentor: `head() { return configured() ? { range: false, session: false, trade: false, note: 'Der Mentor sieht die letzten 20 Trades dieses Kontos.' } : { range: false, account: false, session: false, trade: false }; }`. Ohne Server bleiben left und right leer, pageHead liefert '' (B1).
- ÄNDERN: Statt `get head() { … }` die Methode `head() { return configured() ? {…} : { range: false, account: false, session: false, trade: false }; }` mit demselben Inhalt. pageHead (aufbau-B1) ruft Funktionen mit ctx auf. Kommentar „head als Funktion“ statt „Getter“.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: U.confirmModal] Die Schnittstelle bleibt gleich: confirmModal(title, text, {ok, danger}) gibt ein Promise<boolean> zurück. U3a baut nur das Dialog-Gerüst um, U3b ergänzt data-autofocus (bei danger auf „Abbrechen“, sonst auf der Bestätigung). Alle fünf Aufrufe aus zustaende passen damit zusammen: Titel enden auf „?“, OK-Knopf „Löschen“/„Verwerfen“ mit danger (Z8). Es gibt eine echte Abhängigkeit: S-A5 öffnet die Rückfrage ÜBER dem Check-in-Dialog. Ohne P4 löst „Abbrechen“ bzw. × der Rückfrage zuerst den eigenen Listener aus (closeModal, Motion.leave lässt den Knopf noch im DOM). Danach greift der globale [data-close]-Handler (app.js:280) und schließt zusätzlich den Check-in-Dialog. Deshalb kommt P4 vor S-A5. S-A5 schließt nach „Löschen“ den Check-in-Dialog weiter direkt mit U.closeModal() und nicht über requestClose. So löst der guard aus P14b keine zweite Rückfrage „Änderungen verwerfen?“ aus. Der Fokus nach dem Schließen passt: In S-RP1 setzt .then(go) den Fokus als Microtask, bevor restoreAfterModal per setTimeout(0) läuft. restoreAfterModal sieht den gesetzten Fokus und tut nichts.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: README Z. 224] Es gibt einen Text: „eingeschaltet ist sie leicht angehoben (flach, feiner Rand), Grün nur im Schalter“ (zustaende-S-R3). Er stimmt für beide CSS-Fassungen der Regelkarte (farbe-C7 und zustaende-S-C11) und nennt die Grün-Regel aus dem Brief.
- ÜBERNIMMT farbe-D3f: Dieselbe README-Stelle, zustaende-S-R3 schreibt den Text.

## barrierefreiheit-C-shadow-69 · Schatten-Ich-Verstöße: Link in der ersten Zelle

Gruppe barrierefreiheit · Cluster training · Aufwand S · Befunde: bereich_training-20, barrierefreiheit-4
Quelle: audit/spec/barrierefreiheit.md Z. 785–788 · Dateien: web/js/screens/shadow.js
Abhängig von: barrierefreiheit-B7

```text
#### `web/js/screens/shadow.js`

- **Z. 69:** `<td>${fmt.dateTime(v.date)}</td>` → `<td><a class="row-link" href="#/trades/${esc(v.tradeId)}">${fmt.dateTime(v.date)}</a></td>` (Befunde: bereich_training-20, barrierefreiheit-4)

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

## kilook-C4 · Ruhepunkt-CSS: Reste des Schalters „Christlicher Impuls“ (.rp-switch) löschen

Gruppe kilook · Cluster training · Aufwand S · Befunde: bereich_training-49
Quelle: audit/spec/kilook.md Z. 553–556 · Dateien: web/css/app.css
Abhängig von: —

```text
**C4 · web/css/app.css · Ruhepunkt-Schalter-Reste** (bereich_training-49 = bewegung-41)
- **2147–2151** die fünf Regeln `.rp-switch …` löschen.
- **2333** in der Liste `.rp-switch input, .rp-switch input::after, .rp-choice { transition: none; }` den Teil `.rp-switch input, .rp-switch input::after, ` streichen. Übrig bleibt `.rp-choice { transition: none; }`.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: .rp-switch input] Wortgleich: Z. 2147–2151 (alle .rp-switch-Regeln) löschen und in Z. 2333 aus der Liste `.rp-switch input, .rp-switch input::after, ` streichen. Übrig bleibt `.rp-choice { transition: none; }`. Einmal über kilook-C4, prüfen mit rptest.js:11.
- ÜBERNIMMT komponenten-C34a: Identisch mit kilook-C4, nicht separat umsetzen.
- [doppelt: .rp-switch input::after] Wie beim Anker .rp-switch input: einmal über kilook-C4. komponenten-C34a entfällt als eigener Schritt.
- ÜBERNIMMT komponenten-C34a: Identisch mit kilook-C4.
- [doppelt: .rp-switch] kilook-C4 und komponenten-C34a löschen genau dasselbe: die fünf .rp-switch-Regeln (Z. 2147–2151) und den Teil „.rp-switch input, .rp-switch input::after, “ in Z. 2333. kilook-C4 übernimmt (toter Code). typografie-3.2.3l setzt in Z. 2147 kein Token.
- ÜBERNIMMT komponenten-C34a: Identische Löschung, nur einmal umsetzen.

## kilook-C15 · Schatten-Ich: Banner „Noch keine Regel aktiv“ ohne icon: 'sparkle'

Gruppe kilook · Cluster training · Aufwand S · Befunde: ki_look-17
Quelle: audit/spec/kilook.md Z. 642–644 · Dateien: web/js/screens/shadow.js
Abhängig von: —

```text
**C15 · web/js/screens/shadow.js:58** (ki_look-17)
- In `U.banner('info', 'Noch keine Regel aktiv', …, { icon: 'sparkle', trailing: … })` den Teil `icon: 'sparkle', ` streichen.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: U.banner] Alle sechs Änderungen gelten; doppelt ist nur dashboard.js:130 (das sparkle-Symbol). Endstand: dashboard.js:130 `U.banner('info', 'Willkommen', …, { trailing: … }` mit „CSS importieren“ und zwei neutralen `btn sm`, ohne icon (farbe-C19c). shadow.js:58 ohne `icon: 'sparkle'` (kilook-C15). prop.js:97 `U.banner('ok', 'Ziel erreicht', …)` (farbe-C26b). prop.js:279/280 ohne den letzten info-Zweig und ohne warn (aufbau-C12e). Dazu eine Lücke: Der Erfolgs-Zweig `U.banner('accent', plan.funded ? 'Bereit für den Payout' : 'Challenge bestanden', …)` in Z. 279 wird `U.banner('ok', …)`. Grund: Die Farbe-Spezifikation benennt `.banner.accent` in `.banner.ok` um; ohne diese Änderung stünde das Banner ohne Stil da. coach.js:27 errorBox wie zustaende-S-CS1. Abnahme: `grep -rnE "banner\('accent'|icon: 'sparkle'" web/js` findet nichts mehr (I.sparkle wird gelöscht).
