# Paket 003 · tokens

Schritte: 9 · Dateien: web/app.html, web/css/app.css, web/e2e/motiontest.js, web/index.html, web/js/sample.js, web/js/ui.js
Betroffene Tests laut Spezifikation: anpassen in kilook-C27: e2e/proptest.js:55 (Erwartung baut Balance über UI.fmt.cur); prüfen: e2e/friedhoftest.js:122 (Konto ohne Größe „—“); prüfen: e2e/mobiletest.js (Kacheln bei Zeitraum „Gesamt“ mit P&L ≥ 10.000 bei 1024/390 px ohne Überlauf); prüfen: e2e/settest2.js:22–26 („Klassisch“ lädt Inter/Roboto über Theme.loadFont); web/e2e/motiontest.js:8; web/e2e/motiontest.js:8 (Schritt bewegung-3.11c)
Baut auf Paketen auf: —

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## barrierefreiheit-A1 · Token --focus in :root anlegen (inkl. Einleitung Abschnitt 3)

Gruppe barrierefreiheit · Cluster tokens · Aufwand S · Befunde: farbe_kontrast-14
Quelle: audit/spec/barrierefreiheit.md Z. 245–257 · Dateien: web/css/app.css
Abhängig von: —

```text
## 3. Umsetzungsschritte

Reihenfolge: **A Tokens → B Komponenten → C Einzelstellen → D Wörterbücher → E Tests und README.** Innerhalb jeder Phase nach Datei. Zeilen = aktueller Stand.

### Phase A – Tokens

#### `web/css/app.css`

**A1 Token `--focus`** (`:root`, nach Z. 28 `--accent-glow`)
- vorher: –
- nachher: `--focus: var(--text); /* Tastatur-Fokus: neutral, in jedem Design ≥ 3:1 (gilt auch hell, weil --text je Design gesetzt ist) */`
- Befunde: farbe_kontrast-14

```

## kilook-A1 · fmt.cur ohne Größenschwelle (Cent auch ab 10.000); Bereich enthält die Reihenfolge-Vorbemerkung von Abschnitt 3

Gruppe kilook · Cluster tokens · Aufwand S · Befunde: diagramme-32
Quelle: audit/spec/kilook.md Z. 366–380 · Dateien: web/js/ui.js
Abhängig von: —

```text
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

```

## kilook-A2 · fmt.balance: Bestände ganzzahlig (compact: true als Standard)

Gruppe kilook · Cluster tokens · Aufwand S · Befunde: diagramme-32
Quelle: audit/spec/kilook.md Z. 381–393 · Dateien: web/js/ui.js
Abhängig von: —

```text
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

```

## kilook-A3 · Regel-Kommentar über U.pnl (Ergebnisse immer mit Vorzeichen, kein signed: false)

Gruppe kilook · Cluster tokens · Aufwand S · Befunde: diagramme-35
Quelle: audit/spec/kilook.md Z. 394–397 · Dateien: web/js/ui.js
Abhängig von: —

```text
**A3 · web/js/ui.js:165 · Regel zu `U.pnl`** (diagramme-35)
- Direkt über `const pnl = …` einfügen:
  `/* Ergebnisse (P&L, Erwartungswert, Ø Gewinn/Verlust) immer mit Vorzeichen; Bestände laufen über fmt.balance ohne Vorzeichen. signed: false hier nicht übergeben. */`

```

## kilook-A4 · Neue Typo-Rolle .kpi-label hinter .caption

Gruppe kilook · Cluster tokens · Aufwand S · Befunde: ki_look-36
Quelle: audit/spec/kilook.md Z. 398–401 · Dateien: web/css/app.css
Abhängig von: —

```text
**A4 · web/css/app.css:101 · neue Rolle `.kpi-label`** (ki_look-36)
- Hinter die Zeile mit `.caption { … }` einfügen:
  `.kpi-label { font-size: 13px; line-height: 18px; font-weight: 500; color: var(--text-2); } /* Beschriftung direkt über einem Wert, Satzschreibung; .caption bleibt für Abschnittslabels */`

```

## kilook-A5 · Google-Fonts-Link nur noch Onest (wght@400..800), Inter raus

Gruppe kilook · Cluster tokens · Aufwand S · Befunde: typografie-33
Quelle: audit/spec/kilook.md Z. 402–405 · Dateien: web/app.html, web/index.html
Abhängig von: —

```text
**A5 · web/app.html:11 und web/index.html:11 · Schriften** (typografie-33)
- vorher: `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap">`
- nachher: `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Onest:wght@400..800&display=swap">`

```

## kilook-A6 · Canvas-Schrift der Beispielbilder (sample.js) auf Onest

Gruppe kilook · Cluster tokens · Aufwand S · Befunde: typografie-33
Quelle: audit/spec/kilook.md Z. 406–408 · Dateien: web/js/sample.js
Abhängig von: —

```text
**A6 · web/js/sample.js:311, 321, 323, 324, 325 · Canvas-Schrift** (typografie-33)
- In allen fünf `g.font`-Zeilen `Inter, Roboto, sans-serif` → `Onest, sans-serif`.

```

## bewegung-A1 · Tokens --dur-4, --stagger und --ease-sym in :root ergänzen (--lift-shadow bleibt)

Gruppe bewegung · Cluster tokens · Aufwand S · Befunde: bewegung-1, bewegung-33, bewegung-34
Quelle: audit/spec/bewegung.md Z. 155–164 · Dateien: web/css/app.css
Abhängig von: —

```text
## 3. Umsetzungsschritte

### 3.1 `web/css/app.css` – Tokens und Skala

**A1 `:root` Z. 46–47** (bewegung-1, bewegung-33, bewegung-34)
- Vorher Z. 46: `--dur-1: 150ms; --dur-2: 240ms; --dur-3: 380ms;`
- Nachher: `--dur-1: 150ms; --dur-2: 240ms; --dur-3: 380ms; --dur-4: 640ms; /* nur Einzug von Diagrammen, Score, Ringen */ --stagger: 40ms;`
- Z. 47 am Ende vor dem Kommentar ergänzen: `--ease-sym: cubic-bezier(.45, 0, .55, 1); /* symmetrisch: Schleifen, Atemtakt */`
- `--lift-shadow` (Z. 48, 59, 69) **bleibt** (K2).

```

## bewegung-3.11c · motiontest: Prüfung von --dur-4 (640) und --stagger (40)

Gruppe bewegung · Cluster tokens · Aufwand S · Befunde: —
Quelle: audit/spec/bewegung.md Z. 346–346 · Dateien: web/e2e/motiontest.js
Abhängig von: bewegung-A1

```text
- **motiontest.js:8** ergänzen: `&& Motion.ms('--dur-4') === 640 && Motion.ms('--stagger') === 40`.
```
