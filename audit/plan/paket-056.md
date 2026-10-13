# Paket 056 · zustaende, notebook_news, konto

Schritte: 5 · Dateien: web/css/app.css, web/js/screens/coach.js, web/js/screens/news.js, web/js/ui.js
Betroffene Tests laut Spezifikation: —
Baut auf Paketen auf: 2, 5

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## zustaende-S-C12 · Mentor-Fehlerzeile .mentor-err in Warn-Optik statt Rot

Gruppe zustaende · Cluster zustaende · Aufwand S · Befunde: zustaende-18
Quelle: audit/spec/zustaende.md Z. 338–340 · Dateien: web/css/app.css
Abhängig von: —

```text
**S-C12 Mentor-Fehlerzeile in Warn-Optik** – zustaende-18
Z. 2359 `.mentor-err { …; background: var(--loss-soft); color: var(--loss); … }` → `background: var(--warn-soft); border: 1px solid var(--warn); color: var(--text);`

```

## zustaende-S-C13 · Laden: tote .spin-Regel löschen, .coach-loading/.nw-loading durch Skelett-Stile .coach-skel/.nw-skel ersetzen

Gruppe zustaende · Cluster zustaende · Aufwand S · Befunde: zustaende-17, bereich_notebook_news-38, bewegung-13
Quelle: audit/spec/zustaende.md Z. 341–345 · Dateien: web/css/app.css
Abhängig von: —

```text
**S-C13 Laden: Skelette statt Ring/Kurslinie** – zustaende-17, bereich_notebook_news-38, bewegung-13
- Z. 1559 `.spin { animation-duration: 2.4s; }` löschen.
- Z. 2856 `.coach-loading {…}` → `.coach-skel { display: flex; flex-direction: column; gap: 8px; } .coach-skel .skel { height: 40px; border-radius: 10px; }`
- Z. 3108 `.nw-loading {…}` → `.nw-skel { display: flex; flex-direction: column; gap: 14px; } .nw-skel .skel { border-radius: 14px; }`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .spin] Z. 1559 wird ersetzt, nicht gelöscht. Im reduced-motion-Block steht dann `.spin { animation: spin-turn 2.4s linear infinite !important; }` (bewegung-B11). Begründung: Bewegungs-Regel R1 sagt „alles aus, nur .spin dreht, 2,4 s“. Der Ring steht laut Zustände Z5 nur noch in Knöpfen neben „Wird … …“ und zeigt, dass gerade gearbeitet wird. Die heutige Regel ist tot, weil `* { animation: none !important }` sie schlägt. B11 macht sie wirksam, statt sie zu streichen. Die Skelett-Teile von zustaende-S-C13 (.coach-skel, .nw-skel) bleiben.
- ÄNDERN: Z. 1559 nicht löschen, bewegung-B11 ersetzt sie. Nur .coach-loading → .coach-skel und .nw-loading → .nw-skel wie spezifiziert umsetzen.
- [konflikt: .nw-loading] Beim Laden zeigt News ein Skelett statt Ring und Text (BRIEF: Skelett, kein Ladesymbol). zustaende-S-C13 ersetzt .nw-loading durch .nw-skel, zustaende-S-NW2 stellt news.js:87 im selben Schritt um. typografie-3.2.3l setzt in Z. 3108 kein Token. Die Abstände des Skeletts folgen der Liste, damit nach dem Laden nichts springt: .nw-skel { display: flex; flex-direction: column; gap: var(--sp-4); } (wie .nw-list, Raster 16 laut abstaende), .coach-skel { …; gap: var(--sp-2); }.
- ÄNDERN: .nw-skel mit gap: var(--sp-4) statt 14px. .coach-skel mit gap: var(--sp-2) statt 8px. Der Rest bleibt.

## zustaende-S-NW2 · News: Skelett beim Laden statt Ring/Text

Gruppe zustaende · Cluster notebook_news · Aufwand S · Befunde: zustaende-17, bereich_notebook_news-38
Quelle: audit/spec/zustaende.md Z. 804–806 · Dateien: web/js/screens/news.js
Abhängig von: zustaende-S-C13

```text
**S-NW2 Skelett beim Laden** – zustaende-17, bereich_notebook_news-38
Z. 87 → `else if (ok && !s.events) body = `<div class="nw-skel" role="status" aria-label="Termine werden geladen"><div class="skel" style="height:78px"></div>${[2, 2, 1].map(n => `<div class="skel" style="height:${44 + n * 44}px"></div>`).join('')}</div>`;`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .nw-loading] Beim Laden zeigt News ein Skelett statt Ring und Text (BRIEF: Skelett, kein Ladesymbol). zustaende-S-C13 ersetzt .nw-loading durch .nw-skel, zustaende-S-NW2 stellt news.js:87 im selben Schritt um. typografie-3.2.3l setzt in Z. 3108 kein Token. Die Abstände des Skeletts folgen der Liste, damit nach dem Laden nichts springt: .nw-skel { display: flex; flex-direction: column; gap: var(--sp-4); } (wie .nw-list, Raster 16 laut abstaende), .coach-skel { …; gap: var(--sp-2); }.

## zustaende-S-CS2 · Coach: Skelett beim Laden statt Kurslinie

Gruppe zustaende · Cluster konto · Aufwand S · Befunde: zustaende-17
Quelle: audit/spec/zustaende.md Z. 815–817 · Dateien: web/js/screens/coach.js
Abhängig von: zustaende-S-C13

```text
**S-CS2 Skelett beim Laden** – zustaende-17
Z. 28 → `const loading = () => `<div class="coach-skel" role="status" aria-label="Wird geladen">${'<div class="skel"></div>'.repeat(5)}</div>`;` (wirkt in Z. 111, 153, 167, 184).

```

## zustaende-S-U1 · Geldbeträge immer mit zwei Nachkommastellen (fmt.cur ohne 10.000-Schwelle), Überlauf prüfen

Gruppe zustaende · Cluster zustaende · Aufwand M · Befunde: zustaende-23, wording-30, bereich_prop-6
Quelle: audit/spec/zustaende.md Z. 390–394 · Dateien: web/js/ui.js, web/css/app.css
Abhängig von: —

```text
### 3.2 `web/js/ui.js`

**S-U1 Geldbeträge immer mit zwei Stellen** – zustaende-23 (und Stellenteil von wording-30, bereich_prop-6)
Z. 122 `const a = Math.abs(v); const d = o.compact ? 0 : (a >= 10000 ? 0 : 2);` → `const a = Math.abs(v); const d = o.compact ? 0 : 2;`. Danach Dashboard-Kacheln, TradeLog-Kacheln, Affiliate-KPI-Streifen, Prop-Konto-Karten und Zertifikat (Quadrat und Story) bei 1024 und 390 px prüfen. Läuft ein Wert über, in app.css:533 die Container-Schwelle `@container (max-width: 164px)` → `190px` anheben. Nicht wieder Stellen abschneiden.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: @container (max-width: 164px)] Die Schwelle geht von 164 auf 154 (abstaende-B11). Begründung: Mit abstaende-B7 hat die Kachel seitlich 20 statt 15 px Polster. Container-Abfragen messen die Inhaltsbreite, also muss jede Abfrage um 10 px mitwandern (178 → 168, 164 → 154), sonst greifen die Notstufen bei gleicher Kachelbreite früher. Die Überlaufprüfung aus zustaende-S-U1 (Beträge immer mit zwei Nachkommastellen) läuft erst danach bei 1024 und 390 px. Nur wenn ein Wert überläuft, wird die 154er-Schwelle angehoben, höchstens auf 180px. Das entspricht den 190px aus S-U1 vor der Polster-Änderung. Stellen werden nicht abgeschnitten. Die Schriftgröße innerhalb der Abfrage entscheiden die Anker .tile .val/--fv-*, nicht dieser.
- ÄNDERN: Die Überlaufprüfung erst nach abstaende-B7/B11 machen. Läuft ein Wert über, `@container (max-width: 154px)` auf den nötigen Wert anheben, höchstens 180px (nicht 164 → 190).
