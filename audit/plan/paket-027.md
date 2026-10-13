# Paket 027 · training, komponenten

Schritte: 10 · Dateien: web/css/app.css, web/js/screens/progress.js, web/js/screens/replay.js, web/js/screens/ruhepunkt.js, web/js/ui.js
Betroffene Tests laut Spezifikation: prüfen: e2e/replaytest.js; prüfen: e2e/rptest.js:11; web/e2e/mentortest.js; web/e2e/sixtest.js:36 (Mentor-Kopfreihe)
Baut auf Paketen auf: 2, 3, 7, 14, 17, 20, 26

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## kilook-C25 · I.sparkle aus dem Symbolsatz löschen

Gruppe kilook · Cluster komponenten · Aufwand S · Befunde: ki_look-17
Quelle: audit/spec/kilook.md Z. 723–726 · Dateien: web/js/ui.js
Abhängig von: kilook-C12, kilook-C13, kilook-C14, kilook-C15

```text
**C25 · web/js/ui.js:71 · `I.sparkle` löschen** (ki_look-17; erst nach C12–C15)
- Zeile `sparkle: sv('<path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/>'),` löschen.
- Danach muss `grep -rn "sparkle" web/js web/index.html | grep -v "/lang/"` 0 Treffer ergeben.

```

## kilook-C17 · Blind-Replay: „Session beendet“ als .kpi-label

Gruppe kilook · Cluster training · Aufwand S · Befunde: ki_look-36
Quelle: audit/spec/kilook.md Z. 650–652 · Dateien: web/js/screens/replay.js
Abhängig von: kilook-A4

```text
**C17 · web/js/screens/replay.js:83** (ki_look-36)
- `<div class="caption">Session beendet</div>` → `<div class="kpi-label">Session beendet</div>`. Die Seite ist versteckt; der Schritt dient nur der Einheitlichkeit. 68 bleibt `.caption`.

```

## kilook-C23 · Ruhepunkt-JS: syncFaithUI und Aktion 'rp-faith' löschen, Kommentar anpassen

Gruppe kilook · Cluster training · Aufwand S · Befunde: bereich_training-49
Quelle: audit/spec/kilook.md Z. 709–714 · Dateien: web/js/screens/ruhepunkt.js
Abhängig von: —

```text
**C23 · web/js/screens/ruhepunkt.js** (bereich_training-49)
- **11** Kommentar „Standardwert für den Schalter "Christlicher Impuls" …“ → „Standardwert für die Einstellung "Christlicher Impuls" …“
- **824–826** `function syncFaithUI() { … }` löschen.
- **829** in `setFaith` die Zeile `syncFaithUI();` löschen. `setFaith` bleibt (Export in `root.Ruhepunkt`).
- **888** `'rp-faith': function (el) { setFaith(el.checked); },` löschen.

```

## responsiv-C6 · Mentor-Kopf am Handy einzeilig

Gruppe responsiv · Cluster training · Aufwand S · Befunde: bereich_training-38
Quelle: audit/spec/responsiv.md Z. 403–405 · Dateien: web/css/app.css
Abhängig von: —

```text
**C6 Mentor-Kopf** (bereich_training-38)
- Nach Z. 2364 neu: `@media (max-width: 560px) { .mentor-head { flex-wrap: nowrap; } .mentor-head > div:first-child { min-width: 0; } }`

```

## wording-S8.6-8.9 · Fortschritt: Kartentitel „Regeltreue“, Leerzustand Regeln, Tilt-Text mit drittem Fall, Zähler über U.count

Gruppe wording · Cluster training · Aufwand S · Befunde: wording-43, zustaende-28, bereich_trades_tag-37, bereich_training-14
Quelle: audit/spec/wording.md Z. 415–419 · Dateien: web/js/screens/progress.js
Abhängig von: wording-S1.1-1.3

```text
| 8.6 | progress.js:69 Kartentitel | `U.card('% Regeln eingehalten', …)` → `U.card('Regeltreue', …)`; `${cur.n} Tage mit Regel-Check im Zeitraum` → `${U.count(cur.n, 'Tag', 'Tage')} mit Regel-Check im Zeitraum` | wording-43, zustaende-28 |
| 8.7 | progress.js:77 | `U.empty('shield', 'Keine Regeln definiert', …)` → `U.empty('shield', 'Noch keine Regeln angelegt', …)` | bereich_trades_tag-37 |
| 8.8 | progress.js:79 Tilt-Text | `${tp.afterStreakPnL < 0 ? 'Weiterhandeln nach drei Verlusten hat dich bisher Geld gekostet. Ein hartes Tageslimit würde helfen.' : 'Nach Verlustserien hast du dich bisher gefangen. Bleib trotzdem wachsam.'}` → `${tp.afterStreakPnL < 0 ? 'Weiterhandeln nach drei Verlusten hat dich bisher Geld gekostet. Ein hartes Tageslimit würde helfen.' : tp.losing / tp.withStreak >= 0.6 ? 'Nach der Serie hast du Geld zurückgeholt, die meisten dieser Tage endeten trotzdem im Minus.' : 'Nach Verlustserien hast du dich bisher gefangen.'}` | bereich_training-14 |
| 8.9 | progress.js:28 Heatmap-Tooltip | `${a.n} Trade${a.n === 1 ? '' : 's'}` → `${U.count(a.n, 'Trade', 'Trades')}` | zustaende-28 |

```

## bewegung-C6ab · Tote Übergänge der Serie streichen (.dstreak-track em, .dstreak-track i)

Gruppe bewegung · Cluster training · Aufwand S · Befunde: bewegung-40
Quelle: audit/spec/bewegung.md Z. 266–268 · Dateien: web/css/app.css
Abhängig von: —

```text
**C6 Tote Übergänge** (bewegung-40)
- a) Z. 1256 `.dstreak-track em { …; transition: width var(--dur-2) var(--ease); }` → `transition: …;` streichen.
- b) Z. 1258 `.dstreak-track i { …; transition: background var(--dur-2) var(--ease), border-color var(--dur-2) var(--ease); }` → `transition: …;` streichen.
```

## bewegung-C8a · Ruhepunkt: Betreten nur mit calm-content, Schrittwechsel rp-in auf Tokens, Auswahlkarten ohne Eigen-Animation

Gruppe bewegung · Cluster training · Aufwand M · Befunde: bewegung-9, bewegung-33, bewegung-34
Quelle: audit/spec/bewegung.md Z. 291–296 · Dateien: web/css/app.css
Abhängig von: bewegung-A1

```text
**C8 Ruhepunkt** (bewegung-9, bewegung-33, bewegung-34)
- Z. 2115 `animation: calm-content 900ms cubic-bezier(.2, .7, .2, 1) backwards;` → `animation: calm-content 900ms var(--ease) backwards;` (900 ms bleibt, Ausnahme T1)
- Nach Z. 2118 neu: `html.calm-enter .rp-stage > * { animation-duration: 0s; animation-delay: 0s; } /* beim Betreten nur calm-content; Name bleibt, damit nach calm-enter nichts neu startet */`
- Z. 2181 `.rp-stage > * { animation: rp-in .32s cubic-bezier(.2, .7, .2, 1) both; }` → `.rp-stage > * { animation: rp-in var(--dur-2) var(--ease) both; }`
- Z. 2182 Verzögerungen `.04s` / `.08s` / `.12s` / `.16s` → `var(--stagger)` / `calc(var(--stagger) * 2)` / `calc(var(--stagger) * 3)` / `calc(var(--stagger) * 4)`
- Z. 2183 und Z. 2184 (`.rp-choices .rp-choice { animation: rp-in … }` und deren Verzögerungen) löschen.
```

## bewegung-C8b · Ruhepunkt: Atem-Kugel auf --ease-sym, .rp-swap auf --dur-3 --ease

Gruppe bewegung · Cluster training · Aufwand S · Befunde: bewegung-33, bewegung-34
Quelle: audit/spec/bewegung.md Z. 297–300 · Dateien: web/css/app.css
Abhängig von: bewegung-A1

```text
- Z. 2274 `.rp-tide { … transition: box-shadow var(--dur, 1s) ease-in-out; }` → `transition: box-shadow var(--dur, 1s) var(--ease-sym);`
- Z. 2275 `.rp-tide-glow { … transition: opacity var(--dur, 1s) ease-in-out; }` → `transition: opacity var(--dur, 1s) var(--ease-sym);`
- Z. 2277 `.rp-swap { animation: rp-swap .45s ease-out both; }` → `.rp-swap { animation: rp-swap var(--dur-3) var(--ease) both; }`

```

## bewegung-C9 · Konfidenz-Balken (Replay): Staffel aus --stagger

Gruppe bewegung · Cluster training · Aufwand S · Befunde: bewegung-34
Quelle: audit/spec/bewegung.md Z. 301–302 · Dateien: web/css/app.css
Abhängig von: bewegung-A1

```text
**C9 Konfidenz-Balken** (bewegung-34): Z. 2513 `transition-delay: 40ms;` → `transition-delay: var(--stagger);` und `transition-delay: 80ms;` → `transition-delay: calc(var(--stagger) * 2);`

```

## bewegung-3.10 · ruhepunkt.js place(): Atem-Füllung mit var(--ease-sym)

Gruppe bewegung · Cluster training · Aufwand S · Befunde: bewegung-33
Quelle: audit/spec/bewegung.md Z. 340–342 · Dateien: web/js/screens/ruhepunkt.js
Abhängig von: bewegung-A1

```text
### 3.10 `web/js/screens/ruhepunkt.js` (bewegung-33)
- Z. 262 `'height ' + secs + 's cubic-bezier(.45, .05, .55, .95)'` → `'height ' + secs + 's var(--ease-sym)'`

```
