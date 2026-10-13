# Paket 011 · aufbau

Schritte: 7 · Dateien: web/css/app.css, web/css/landing.css, web/index.html
Betroffene Tests laut Spezifikation: prüfen: e2e/motiontest.js:72–74 (6 × .feat-card.rv, sichtbar nach Scrollen); prüfen: e2e/motiontest.js:72–74 (weiter 6 × .feat-card); web/e2e/coachtest.js (muss grün bleiben)
Baut auf Paketen auf: 2, 8

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## abstaende-C12 · Breiten: .mentor-wrap stabil 800 (width 100%), .coach-wrap volle Breite mit Varianten .read (920) und .narrow (800 mittig) statt .wide; Kopfreihe an Mentor- und News-Kante binden

Gruppe abstaende · Cluster aufbau · Aufwand M · Befunde: bereich_konto-24, hierarchie-38, zustaende-15
Quelle: audit/spec/abstaende.md Z. 361–361 · Dateien: web/css/app.css
Abhängig von: abstaende-A1, abstaende-A4

```text
| C12 | Breiten Z. 2339, 2849, 2850 | `.mentor-wrap { max-width: 800px; margin: 0 auto; }` → `.mentor-wrap { width: 100%; max-width: var(--w-chat); margin-inline: auto; }`. `.coach-wrap { max-width: 920px; margin: 0 auto; width: 100%; …; gap: 16px; }` → `.coach-wrap { width: 100%; display: flex; flex-direction: column; gap: var(--content-gap); }`. Z. 2850 `.coach-wrap.wide` ersetzen durch `.coach-wrap.read { max-width: var(--w-read); } .coach-wrap.narrow { max-width: var(--w-chat); margin-inline: auto; }`. Neu nach Z. 1338: `.content:has(> .mentor-wrap) > .page-head { width: 100%; max-width: var(--w-chat); margin-inline: auto; } .content:has(> .nw-wrap) > .page-head { width: 100%; max-width: var(--w-news); }` | bereich_konto-24, hierarchie-38, zustaende-15 |
```

## kilook-B8a · Startseite: CSS der Ankündigungsleiste löschen

Gruppe kilook · Cluster aufbau · Aufwand S · Befunde: ki_look-44
Quelle: audit/spec/kilook.md Z. 468–469 · Dateien: web/css/landing.css
Abhängig von: —

```text
**B8 · web/css/landing.css · Startseite** (ki_look-42, ki_look-43, ki_look-44)
- **3** `.lp .ribbon { … }` löschen.
```

## kilook-B8c · Startseiten-Demo: Fensterleiste/Ampelpunkte löschen, aktiver Eintrag neutral

Gruppe kilook · Cluster aufbau · Aufwand S · Befunde: ki_look-43
Quelle: audit/spec/kilook.md Z. 472–474 · Dateien: web/css/landing.css
Abhängig von: —

```text
- **21–23** löschen (die drei Regeln `.lp .shot .frame .bar`, `.lp .shot .frame .bar i`, Ampelfarben `#ff5f57/#febc2e/#28c840`).
- **27** vorher `.lp .demo .side div.on { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }`
  → nachher `.lp .demo .side div.on { border-color: var(--border); color: var(--text); background: var(--surface-2); }`
```

## kilook-B8d · Startseite: Funktionen als 2-spaltige Liste, Ablauf ohne Karten, Ziffer statt Kicker (CSS)

Gruppe kilook · Cluster aufbau · Aufwand M · Befunde: ki_look-42
Quelle: audit/spec/kilook.md Z. 475–488 · Dateien: web/css/landing.css
Abhängig von: —

```text
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
```

## kilook-C7a · Startseite: Ankündigungsleiste aus dem HTML löschen

Gruppe kilook · Cluster aufbau · Aufwand S · Befunde: ki_look-44
Quelle: audit/spec/kilook.md Z. 584–585 · Dateien: web/index.html
Abhängig von: kilook-B8a

```text
**C7 · web/index.html · Startseite** (ki_look-42, ki_look-43, ki_look-44, bereich_shell-35; Z. 11 siehe A5)
- **20** `<div class="ribbon">Neu: Session-Check-in …</div>` löschen.
```

## kilook-C7c · Startseiten-Demo: ohne Fensterleiste, Einträge in App-Reihenfolge, „Trade-Trefferquote“, monotone Kurve

Gruppe kilook · Cluster aufbau · Aufwand M · Befunde: ki_look-43
Quelle: audit/spec/kilook.md Z. 587–595 · Dateien: web/index.html
Abhängig von: kilook-B8c

```text
- **34** `<div class="shot"><div class="frame"><div class="bar"><i></i><i></i><i></i></div><div class="demo">` → `<div class="shot"><div class="frame"><div class="demo">`
- **35** Inhalt von `.side` → `<div class="on">Dashboard</div><div>Statistiken</div><div>Fortschritt</div><div>TradeLog</div><div>Tagesansicht</div><div>Notebook</div><div>News</div>`
- **37** „Netto-P&L“ bleibt (K14).
- **39** `<span>Trade-Win-Rate</span>` → `<span>Trade-Trefferquote</span>`
- **41** beide `d`-Attribute ersetzen:
  - Fläche: `M0,110 C46.7,103.2 93.3,96.3 140,92 C186.7,87.7 233.3,89.3 280,84 C326.7,78.7 373.3,62.2 420,55 C473.3,46.8 526.7,45.1 580,40 C653.3,32.9 726.7,25.5 800,18 L800,130 L0,130 Z`
  - Linie: derselbe Pfad ohne ` L800,130 L0,130 Z`

  Nachgerechnet mit dem d3-Verfahren monotoneX durch dieselben sechs Punkte. Die Kurve steigt überall, statt bei x≈580 einzusacken.
```

## kilook-C7d · Startseite: Symbole aus den Funktionen, „Trefferquote, Profit-Faktor …“, Ablauf mit Ziffer statt „SCHRITT n“

Gruppe kilook · Cluster aufbau · Aufwand S · Befunde: ki_look-42, ki_look-43
Quelle: audit/spec/kilook.md Z. 596–599 · Dateien: web/index.html
Abhängig von: kilook-B8d

```text
- **48–53** in jeder `.feat-card` das `<div class="ico"><svg …>…</svg></div>` löschen. `class="feat-card"`, `<b>` und `<p>` bleiben, damit es weiter 6 `.feat-card` sind.
- **49** „Win-Rate, Profit-Faktor, Erwartungswert …“ → „Trefferquote, Profit-Faktor, Erwartungswert …“
- **57–59** jeweils `<div class="k">SCHRITT 1</div><b>Session starten</b>` → `<b><span class="k">1</span>Session starten</b>`, ebenso für 2 („Trades loggen“) und 3 („Auswerten“).

```
