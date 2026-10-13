# Paket 008 · komponenten

Schritte: 7 · Dateien: web/css/app.css, web/e2e/motiontest.js, web/js/datepicker.js
Betroffene Tests laut Spezifikation: web/e2e/motiontest.js:31 (animationName === 'pop-in' bleibt gültig); web/e2e/motiontest.js:52–53
Baut auf Paketen auf: 6, 7

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## wording-S4.6-4.7 · datepicker.js: Touch-Leerzustand .is-empty setzen; type=week bleibt nativ

Gruppe wording · Cluster komponenten · Aufwand S · Befunde: wording-2, bereich_dashboard-28
Quelle: audit/spec/wording.md Z. 346–348 · Dateien: web/js/datepicker.js
Abhängig von: wording-S3.1-3.3, wording-S4.1-4.5

```text
| 4.6 | Touch-Leerzustand | in `init()` ein `input`-Listener (capture) auf `document`: bei `TYPES[e.target.type]` → `e.target.classList.toggle('is-empty', !e.target.value)`; einmal beim Dekorieren bzw. für alle Felder beim Start setzen | wording-2 |
| 4.7 | `type="week"` | bleibt nativ (Abschnitt 5) | bereich_dashboard-28 |

```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: DatePicker.init] wording-S4.1-4.7 übernimmt den Leerzustand der Datumsfelder. zustaende-S-DP ist laut eigener Spezifikation nur ein Ersatz für den Fall, dass wording-2 fehlt, und entfällt. Eine Lücke wird geschlossen: Laut 4.5 läuft der MutationObserver nur bei fine(). Auf Touch bekämen später eingefügte Felder (Trade-Dialog, #f-close) dann beim Öffnen nicht .is-empty. Der Observer läuft darum auf allen Geräten: Bei neuen input.input mit TYPES[type] setzt er immer is-empty (= !value), das Overlay (decorate) baut er nur bei fine(). Damit braucht es kein Sonder-is-empty in app.js.
- ÄNDERN: Den Anfangszustand is-empty (= !value) für alle input.input mit TYPES[type] beim Start und für jedes später eingefügte Feld setzen. Dazu läuft der MutationObserver aus 4.5 auf allen Geräten, ruft aber decorate() nur bei fine() auf. Der input-Listener (capture) bleibt wie in 4.6. type=week bleibt nativ.
- [doppelt: .input.is-empty] wording-S4.6-4.7 übernimmt mit der Ergänzung unter DatePicker.init (Anfangszustand auch für später eingefügte Felder auf Touch). zustaende-S-DP entfällt.

## bewegung-B1 · Knöpfe: kein Anheben, kein Schein an .btn.primary, Druckdauer aus Token

Gruppe bewegung · Cluster komponenten · Aufwand S · Befunde: komponenten-13, bewegung-19, bewegung-20, bewegung-34
Quelle: audit/spec/bewegung.md Z. 167–174 · Dateien: web/css/app.css
Abhängig von: —

```text
### 3.2 `web/css/app.css` – Komponenten

**B1 Knöpfe** (komponenten-13, bewegung-19, bewegung-20, bewegung-34)
- Z. 269 `.btn { … transition: background var(--dur-1) var(--ease), border-color var(--dur-1) var(--ease), transform var(--dur-1) var(--ease), color var(--dur-1) var(--ease), box-shadow var(--dur-2) var(--ease); }` → `, box-shadow var(--dur-2) var(--ease)` streichen.
- Z. 272 `.btn:hover { background: var(--surface-2); border-color: var(--border-2); transform: translateY(-1px); }` → `.btn:hover { background: var(--surface-2); border-color: var(--border-2); }`
- Z. 273 `.btn:active { transform: scale(.97); transition-duration: 60ms; }` → `.btn:active { transform: scale(.97); transition-duration: calc(var(--dur-1) * .4); }`
- Z. 275 `.btn.primary:hover { …; box-shadow: 0 8px 20px -10px var(--accent-glow); }` → `box-shadow: …` streichen. Fläche und Rand laut Farbe-Spezifikation (referenz-6/komponenten-1). Kommt die nicht, bleibt `background: var(--accent-2); border-color: var(--accent-2);`.

```

## bewegung-B2 · Schalter: Übergangszeiten auf Tokens (Knopf 320 ms über calc)

Gruppe bewegung · Cluster komponenten · Aufwand S · Befunde: bewegung-34
Quelle: audit/spec/bewegung.md Z. 175–178 · Dateien: web/css/app.css
Abhängig von: —

```text
**B2 Schalter** (bewegung-34)
- Z. 306 `.switch { … transition: background-color .26s var(--ease), box-shadow .26s var(--ease); }` → `transition: background-color var(--dur-2) var(--ease), box-shadow var(--dur-2) var(--ease);`
- Z. 307 `.switch::after { … transition: transform .32s var(--sw-ease), width .18s var(--ease), background-color .26s var(--ease), box-shadow .26s var(--ease); }` → `transition: transform calc(var(--dur-2) * 4 / 3) var(--sw-ease), width var(--dur-1) var(--ease), background-color var(--dur-2) var(--ease), box-shadow var(--dur-2) var(--ease);`

```

## bewegung-B4a · Popover-Richtung über --pop-y/--pop-y-out, Keyframes pop-in/pop-out mit Custom Properties

Gruppe bewegung · Cluster komponenten · Aufwand M · Befunde: bewegung-27, bewegung-28
Quelle: audit/spec/bewegung.md Z. 185–191 · Dateien: web/css/app.css
Abhängig von: —

```text
**B4 Popover und Menüs: Richtung und Schließen** (bewegung-27, bewegung-28)
- Neu direkt nach Z. 328 (`.popover { … }`): `.popover, .sym-menu, .fd-pop { --pop-y: -4px; --pop-y-out: -4px; } /* unter dem Auslöser: vom Knopf herab */`
- Z. 248 (`.popover.up.open { transform-origin: bottom center; }`) davor neu: `.popover.up { --pop-y: 8px; --pop-y-out: 4px; } /* nach oben öffnend: steigt auf */`
- Keyframes Z. 2374–2375:
  - vorher `@keyframes pop-in { from { opacity: 0; transform: translateY(8px) scale(.985); } }` → nachher `@keyframes pop-in { from { opacity: 0; transform: translateY(var(--pop-y, 8px)) scale(.985); } }`
  - vorher `@keyframes pop-out { to { opacity: 0; transform: translateY(4px) scale(.99); } }` → nachher `@keyframes pop-out { to { opacity: 0; transform: translateY(var(--pop-y-out, 4px)) scale(.99); } }`
  - Dialoge (`.modal`) tragen kein `--pop-y` und bleiben bei 8 px / 4 px.
```

## bewegung-C1 · Kalendertage: kein Anheben, eigene Hover-Ränder für Gewinn- und Verlusttage

Gruppe bewegung · Cluster komponenten · Aufwand S · Befunde: bewegung-21, komponenten-13
Quelle: audit/spec/bewegung.md Z. 234–242 · Dateien: web/css/app.css
Abhängig von: —

```text
### 3.3 `web/css/app.css` – Einzelstellen

**C1 Kalendertage** (bewegung-21, komponenten-13)
- Z. 705 `.cal .d { … transition: border-color var(--dur-1) var(--ease), transform var(--dur-1) var(--ease); … }` → `transition: border-color var(--dur-1) var(--ease);`
- Z. 706 → `.cal .d:hover { border-color: var(--border-2); }`
- Nach Z. 711 (`.cal .d.loss { … }`) neu:
  `.cal .d.win:hover { border-color: color-mix(in srgb, var(--profit) 70%, var(--border)); }`
  `.cal .d.loss:hover { border-color: color-mix(in srgb, var(--loss) 75%, var(--border)); }`

```

## bewegung-C7c · Farbwähler-Punkte .cp-c: Auswahl-Ring in leiser Farbe statt Vergrößerung

Gruppe bewegung · Cluster komponenten · Aufwand S · Befunde: bereich_einstellungen-42
Quelle: audit/spec/bewegung.md Z. 285–286 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 459 `.cp-c { …; transition: transform var(--dur-1) var(--ease), box-shadow var(--dur-1) var(--ease); }` → `transition: box-shadow var(--dur-1) var(--ease);`
- Z. 460 → `.cp-c:hover { box-shadow: 0 0 0 2px var(--surface), 0 0 0 3.5px var(--border-2); }` (bleibt vor 461, damit die Auswahl beim Darüberfahren gewinnt).
```

## bewegung-3.11a · motiontest: „Kachel bleibt beim Überfahren stehen“ statt Anheben

Gruppe bewegung · Cluster komponenten · Aufwand S · Befunde: bereich_statistik-29
Quelle: audit/spec/bewegung.md Z. 343–344 · Dateien: web/e2e/motiontest.js
Abhängig von: bewegung-B5

```text
### 3.11 `web/e2e` (Tests an das neue Verhalten anpassen)
- **motiontest.js:52–53** (bereich_statistik-29): `ok('Kachel hebt sich beim Überfahren', … transform !== 'none')` → `ok('Kachel bleibt beim Überfahren stehen', await p.evaluate(() => getComputedStyle(document.querySelectorAll('.tile')[1]).transform === 'none'));`
```

**Hinweise aus der Abstimmung (verbindlich):**

- ÜBERNIMMT zustaende-S-TE3: Dieselbe Testanpassung in motiontest.js:52–53; bewegung-3.11a setzt sie einmal um (Name und Prüfung siehe dort).
- [konflikt: .tile:hover] Z. 516 `.tile:hover, .stat-tile:hover { … }` wird ganz gelöscht (zustaende-S-C5), Begründung wie beim Anker .tile. Den Test passt bewegung-3.11a einmal an: Name „Kachel bleibt beim Überfahren ruhig“. Nach `p.hover('.tile >> nth=1')` prüft er `transform === 'none'` und dass `borderColor` gleich dem Wert vor dem Überfahren ist.
- ÄNDERN: motiontest.js:52–53: borderColor von `.tile` (Index 1) vor dem Hover lesen; nach dem Hover `ok('Kachel bleibt beim Überfahren ruhig', cs.transform === 'none' && cs.borderColor === vorher)`.
