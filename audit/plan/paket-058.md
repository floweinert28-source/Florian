# Paket 058 · diagramme, zustaende

Schritte: 5 · Dateien: web/e2e/dashtest.js, web/js/ui.js, web/js/widgets.js
Betroffene Tests laut Spezifikation: web/e2e/dashtest.js:69; web/e2e/dashtest.js:69 (O1)
Baut auf Paketen auf: 51

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## zustaende-S-U2 · Kurse: ab 10 genau zwei Nachkommastellen (fmt.price)

Gruppe zustaende · Cluster zustaende · Aufwand S · Befunde: zustaende-22, typografie-13
Quelle: audit/spec/zustaende.md Z. 395–397 · Dateien: web/js/ui.js
Abhängig von: —

```text
**S-U2 Kurse** – zustaende-22 (mit typografie-13)
Z. 142 `minimumFractionDigits: a < 10 ? 4 : a < 1000 ? 2 : 1` → `minimumFractionDigits: a < 10 ? 4 : 2`. `maximumFractionDigits` bleibt `a < 10 ? 5 : 2`.

```

## zustaende-S-U3 · fmt.dur: Sekunden unter einer Minute („45 s“)

Gruppe zustaende · Cluster zustaende · Aufwand S · Befunde: zustaende-39
Quelle: audit/spec/zustaende.md Z. 398–400 · Dateien: web/js/ui.js
Abhängig von: —

```text
**S-U3 Dauer mit Sekunden** – zustaende-39
Z. 157 `dur(min)`: direkt nach der null-Prüfung `if (min < 1) return `${Math.round(min * 60)} s`;` einfügen. Rest bleibt („12 min“, „1 h 5 min“, „2 T“).

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: fmt.dur] Die Schritte widersprechen sich an zwei Stellen. (1) Tooltip: E6 lässt `durLabel` stehen, S-W6 stellt auf `fmt.dur` um. (2) Rückfall-Beschriftung der Achse: E6 nimmt `fmt.dur`, das zweiteilige Werte wie „1 h 23 min“ liefert. Die Zustände-Regel Z2.7 verlangt auf der Achse genau eine Einheit und verbietet „12m:05s“. Verbindliches Ergebnis: (a) ui.js Z. 157 `fmt.dur` wie in S-U3: direkt nach der null-Prüfung `if (min < 1) return `${Math.round(min * 60)} s`;`. (b) widgets.js Z. 38 `durLabel` wie in S-W6 (eine Einheit: „45 s“, „5 min“, „1,5 h“, „2 T“). Es dient nur noch als Achsenbeschriftung. (c) Z. 244 Tooltip `${fmt.dur(t.holdingMin)}` (S-W6). Mit S-U3 zeigt fmt.dur auch Sekunden, der Grund in E6 („Tooltip mit Sekunden“) bleibt also erfüllt, ohne das alte Format „12m:05s“. (d) Z. 246 Striche aus E6 (HOLD_TICKS, runde Werte), aber Rückfall mit durLabel: `let ticks = HOLD_TICKS.map(([m, l]) => ({ v: Math.log10(m * 60 + 1), label: l })).filter(t => t.v >= x0 && t.v <= x1); if (ticks.length < 2) ticks = [x0, (x0 + x1) / 2, x1].map(v => ({ v, label: durLabel((10 ** v - 1) / 60) }));`. Das eingebettete `min < 1 ? … s` entfällt, durLabel deckt Sekunden schon ab. (e) Z. 238 (Uhrzeit-Striche) unverändert nach E6. Die Übersetzungsmuster „{0} s“ und „{0} T“ nur einmal anlegen (Liste Zustände), die Einträge „1 T / 3 T / 1 W“ aus der Diagramm-Spezifikation bleiben.

## zustaende-S-W6 · Haltedauer-Widget: Achse mit genau einer Einheit (durLabel), Tooltip über fmt.dur

Gruppe zustaende · Cluster diagramme · Aufwand S · Befunde: zustaende-39
Quelle: audit/spec/zustaende.md Z. 486–492 · Dateien: web/js/widgets.js
Abhängig von: zustaende-S-U3

```text
**S-W6 Haltedauer** – zustaende-39
- Z. 38 `durLabel` ersetzen (nur noch Achse):
```js
const durLabel = min => { const sec = Math.round(min * 60); if (sec < 60) return `${sec} s`; if (min < 60) return `${Math.round(min)} min`; const h = min / 60; if (h < 24) return `${fmt.dec(h, h < 10 ? 1 : 0).replace(/[.,]0$/, '')} h`; return `${Math.round(h / 24)} T`; };
```
- Z. 244 Tooltip `${durLabel(t.holdingMin)}` → `${fmt.dur(t.holdingMin)}`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: fmt.dur] Die Schritte widersprechen sich an zwei Stellen. (1) Tooltip: E6 lässt `durLabel` stehen, S-W6 stellt auf `fmt.dur` um. (2) Rückfall-Beschriftung der Achse: E6 nimmt `fmt.dur`, das zweiteilige Werte wie „1 h 23 min“ liefert. Die Zustände-Regel Z2.7 verlangt auf der Achse genau eine Einheit und verbietet „12m:05s“. Verbindliches Ergebnis: (a) ui.js Z. 157 `fmt.dur` wie in S-U3: direkt nach der null-Prüfung `if (min < 1) return `${Math.round(min * 60)} s`;`. (b) widgets.js Z. 38 `durLabel` wie in S-W6 (eine Einheit: „45 s“, „5 min“, „1,5 h“, „2 T“). Es dient nur noch als Achsenbeschriftung. (c) Z. 244 Tooltip `${fmt.dur(t.holdingMin)}` (S-W6). Mit S-U3 zeigt fmt.dur auch Sekunden, der Grund in E6 („Tooltip mit Sekunden“) bleibt also erfüllt, ohne das alte Format „12m:05s“. (d) Z. 246 Striche aus E6 (HOLD_TICKS, runde Werte), aber Rückfall mit durLabel: `let ticks = HOLD_TICKS.map(([m, l]) => ({ v: Math.log10(m * 60 + 1), label: l })).filter(t => t.v >= x0 && t.v <= x1); if (ticks.length < 2) ticks = [x0, (x0 + x1) / 2, x1].map(v => ({ v, label: durLabel((10 ** v - 1) / 60) }));`. Das eingebettete `min < 1 ? … s` entfällt, durLabel deckt Sekunden schon ab. (e) Z. 238 (Uhrzeit-Striche) unverändert nach E6. Die Übersetzungsmuster „{0} s“ und „{0} T“ nur einmal anlegen (Liste Zustände), die Einträge „1 T / 3 T / 1 W“ aus der Diagramm-Spezifikation bleiben.
- ÄNDERN: Inhalt unverändert umsetzen (durLabel Z. 38 neu, Tooltip Z. 244 → fmt.dur). Zur Klarstellung: Den Achsen-Code Z. 246 fasst dieser Schritt nicht an. Den ersetzt diagramme-E6 (HOLD_TICKS), und dessen Rückfall ruft das neue durLabel auf. Damit ist „nur noch Achse“ richtig.
- [konflikt: durLabel] Gehört zur Entscheidung beim Anker `fmt.dur`. durLabel bekommt die Fassung aus S-W6 (eine Einheit) und wird nur noch im Rückfall-Zweig der Haltedauer-Achse von E6 aufgerufen. Der Tooltip nutzt fmt.dur. Die Regelstriche kommen aus HOLD_TICKS (E6). Die alten Formate „12m:05s“, „1h:15m“ und „2d:3h“ verschwinden vollständig.

## diagramme-E6 · Achsenstriche Uhrzeit (runde Schritte) und Haltedauer (HOLD_TICKS mit Rückfall)

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: bereich_dashboard-35
Quelle: audit/spec/diagramme.md Z. 573–583 · Dateien: web/js/widgets.js
Abhängig von: diagramme-E2

```text
**E6 Achsenstriche Uhrzeit/Haltedauer** (bereich_dashboard-35)
- Z. 238 `const k = 9; const ticks = Array.from(…)` →
  ```js
  const st = [15, 30, 60, 120, 180, 240, 360].find(s => Math.floor(x1 / s) - Math.ceil(x0 / s) + 1 <= 6) || 360; const ticks = []; for (let m = Math.ceil(x0 / st) * st; m <= x1; m += st) ticks.push({ v: m, label: hhmm(m) });
  ```
- Z. 246 `const k = 11; const ticks = Array.from(…)` →
  ```js
  let ticks = HOLD_TICKS.map(([m, l]) => ({ v: Math.log10(m * 60 + 1), label: l })).filter(t => t.v >= x0 && t.v <= x1); if (ticks.length < 2) ticks = [x0, (x0 + x1) / 2, x1].map(v => { const min = (10 ** v - 1) / 60; return { v, label: min < 1 ? `${Math.round(min * 60)} s` : fmt.dur(min) }; });
  ```
  Der Tooltip (Z. 244) behält `durLabel`.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: fmt.dur] Die Schritte widersprechen sich an zwei Stellen. (1) Tooltip: E6 lässt `durLabel` stehen, S-W6 stellt auf `fmt.dur` um. (2) Rückfall-Beschriftung der Achse: E6 nimmt `fmt.dur`, das zweiteilige Werte wie „1 h 23 min“ liefert. Die Zustände-Regel Z2.7 verlangt auf der Achse genau eine Einheit und verbietet „12m:05s“. Verbindliches Ergebnis: (a) ui.js Z. 157 `fmt.dur` wie in S-U3: direkt nach der null-Prüfung `if (min < 1) return `${Math.round(min * 60)} s`;`. (b) widgets.js Z. 38 `durLabel` wie in S-W6 (eine Einheit: „45 s“, „5 min“, „1,5 h“, „2 T“). Es dient nur noch als Achsenbeschriftung. (c) Z. 244 Tooltip `${fmt.dur(t.holdingMin)}` (S-W6). Mit S-U3 zeigt fmt.dur auch Sekunden, der Grund in E6 („Tooltip mit Sekunden“) bleibt also erfüllt, ohne das alte Format „12m:05s“. (d) Z. 246 Striche aus E6 (HOLD_TICKS, runde Werte), aber Rückfall mit durLabel: `let ticks = HOLD_TICKS.map(([m, l]) => ({ v: Math.log10(m * 60 + 1), label: l })).filter(t => t.v >= x0 && t.v <= x1); if (ticks.length < 2) ticks = [x0, (x0 + x1) / 2, x1].map(v => ({ v, label: durLabel((10 ** v - 1) / 60) }));`. Das eingebettete `min < 1 ? … s` entfällt, durLabel deckt Sekunden schon ab. (e) Z. 238 (Uhrzeit-Striche) unverändert nach E6. Die Übersetzungsmuster „{0} s“ und „{0} T“ nur einmal anlegen (Liste Zustände), die Einträge „1 T / 3 T / 1 W“ aus der Diagramm-Spezifikation bleiben.
- ÄNDERN: Z. 238 wie spezifiziert. Z. 246: Rückfall-Zweig statt `.map(v => { const min = (10 ** v - 1) / 60; return { v, label: min < 1 ? `${Math.round(min * 60)} s` : fmt.dur(min) }; })` → `.map(v => ({ v, label: durLabel((10 ** v - 1) / 60) }))`. Den Satz „Der Tooltip (Z. 244) behält durLabel“ streichen: Den Tooltip stellt zustaende-S-W6 auf fmt.dur um. Wird A-4 in die README übernommen, dort schreiben: „Rückfall beschriftet mit durLabel (eine Einheit); Tooltip fmt.dur (mit Sekunden)“.
- [konflikt: durLabel] Gehört zur Entscheidung beim Anker `fmt.dur`. durLabel bekommt die Fassung aus S-W6 (eine Einheit) und wird nur noch im Rückfall-Zweig der Haltedauer-Achse von E6 aufgerufen. Der Tooltip nutzt fmt.dur. Die Regelstriche kommen aus HOLD_TICKS (E6). Die alten Formate „12m:05s“, „1h:15m“ und „2d:3h“ verschwinden vollständig.

## diagramme-O1 · Test dashtest.js:69: Uhrzeit-Achse waagerecht mit vollen Zeiten (inkl. Hinweis: geänderte Dateien in den Scratchpad kopieren)

Gruppe diagramme · Cluster diagramme · Aufwand S · Befunde: bereich_dashboard-35
Quelle: audit/spec/diagramme.md Z. 744–746 · Dateien: web/e2e/dashtest.js
Abhängig von: diagramme-E2, diagramme-E6

```text
### 3.15 Tests (`web/e2e/`; danach die geänderten Dateien in den Scratchpad kopieren, weil `runall.sh` dort läuft)

- **O1** dashtest.js:69 (bereich_dashboard-35) → `ok('Uhrzeit-Achse waagerecht mit vollen Zeiten', await p.$eval('.w[data-typ="perf_uhrzeit"] .chart svg', svg => { const all = [...svg.querySelectorAll('text')]; const t = all.filter(x => /^\d{2}:\d{2}$/.test(x.textContent)); return t.length >= 2 && t.every(x => /:(00|15|30|45)$/.test(x.textContent)) && !all.some(x => (x.getAttribute('transform') || '').includes('rotate(')); }));`
```
