# Paket 095 · bewegung, wording

Schritte: 12 · Dateien: web/README.md, web/css/app.css, web/e2e/motiontest.js, web/js/app.js, web/js/motion.js, web/js/ui.js
Betroffene Tests laut Spezifikation: web/e2e/motiontest.js nach Z. 28 (neu); web/e2e/motiontest.js nach Z. 28 neu (Schritt bewegung-3.11b); web/e2e/motiontest.js:43-47, :58
Baut auf Paketen auf: 4, 12, 16, 22, 31, 35, 55, 57, 58, 59, 93

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## responsiv-3.19 · README an den Zielzustand anpassen

Gruppe responsiv · Cluster wording · Aufwand S · Befunde: —
Quelle: audit/spec/responsiv.md Z. 554–566 · Dateien: web/README.md
Abhängig von: responsiv-B1, responsiv-3.3a, responsiv-B6a, responsiv-3.4, responsiv-B4, responsiv-A1, responsiv-A3, responsiv-B9, responsiv-3.13, responsiv-B10, responsiv-B6c, responsiv-B5d, responsiv-B8, responsiv-3.3d

```text
### 3.19 web/README.md

- Z. 51: „Auf niedrigen Bildschirmen etwas dichter.“ → „Auf niedrigen Bildschirmen etwas dichter; die Konto-Karte klebt unten, die Navigation scrollt darunter.“
- Z. 62–64: „…auf dem Handy in der Kopfreihe)“ → „…auf dem Handy in der Kopfreihe; der Konto-Knopf erscheint unter 961px nur bei mehr als einem Konto, am Handy als Symbol)“.
- Z. 67: „unten ein 3-Spalten-Raster“ → „unten ein 3-Spalten-Raster (961–1240px: zwei Spalten, oben fünf Kacheln als 3 + 2)“.
- Z. 76–77: „(Handy: einer)“ → „(Handy: einer; bei einer Vorgabe der aktuelle Monat)“; „auf dem Handy volle Breite“ → „auf dem Handy wie alle Menüs der Kopfreihe volle Breite mit 16px Rand“.
- Z. 92: „Tabellen kompakt ohne Zeilenumbruch“ → „Tabellen nur mit Kernspalten (Name/Datum, Kernwert, Aktionen; Nebeninfos in einer Unterzeile), kein seitliches Scrollen; Eingabefelder 16px; Dialoge gleiten von unten herein“.
- Z. 96: „„Teilen“ nur ab 561px“ → „„Teilen“ ab 561px in der Reihe, darunter im •••-Menü“; Werkzeugleiste: „Formatierung zuerst, Rückgängig/Wiederholen/Größe am Ende“.
- Z. 101: „Ab 961px bleibt alles wie gehabt“ → „Ab 961px gelten die Desktop-Regeln (961–1240px: Dashboard zweispaltig, Kachelreihen 4 bzw. 3 + 2)“.
- Z. 106–107: nach „die Seite selbst scrollt nicht.“ ergänzen: „Ist das Fenster für drei Tabellenzeilen zu niedrig, scrollt die Seite. Unter 961px scrollt die Tabelle mit der Seite (keine eigene Box).“
- Z. 120: „drei Spalten (Ordner und Tags, Notizliste, Notiz)“ → „drei Spalten (…); bei schmalem Inhalt (unter 1000px) Liste und Notiz, die Ordner über „Zurück“, unter 700px eine Spalte“.
- Z. 361: „Waagerechte Reiterleisten haben keinen sichtbaren Scrollbalken.“ → „… keinen sichtbaren Scrollbalken; am Rand, hinter dem es weitergeht, laufen sie weich aus (`App.edgeFade`).“

```

## responsiv-3.2d · closeModal am Handy mit --dur-2 (Bottom-Sheet gleitet hinaus)

Gruppe responsiv · Cluster bewegung · Aufwand S · Befunde: bewegung-29
Quelle: audit/spec/responsiv.md Z. 417–418 · Dateien: web/js/ui.js
Abhängig von: responsiv-B9

```text
- Z. 441 `closeModal`: `Mo.leave(bg, 'out', '--dur-1', () => bg.remove())` → `Mo.leave(bg, 'out', window.matchMedia('(max-width: 560px)').matches ? '--dur-2' : '--dur-1', () => bg.remove())` (bewegung-29)

```

## bewegung-A2 · Kommentar im Bewegungsblock: Abschalten über --dur-1 bis --dur-4 und --stagger

Gruppe bewegung · Cluster bewegung · Aufwand S · Befunde: bewegung-34
Quelle: audit/spec/bewegung.md Z. 165–166 · Dateien: web/css/app.css
Abhängig von: bewegung-A1

```text
**A2 Kommentar Bewegungsblock Z. 2367–2368** (bewegung-34): `Abschalten: --dur-1/2/3 auf 0ms setzen …` → `Abschalten: --dur-1 bis --dur-4 und --stagger auf 0ms setzen …`

```

## bewegung-B7 · Reiterwechsel: swap-in auf --dur-1 --ease

Gruppe bewegung · Cluster bewegung · Aufwand S · Befunde: bewegung-34, bewegung-33
Quelle: audit/spec/bewegung.md Z. 210–211 · Dateien: web/css/app.css
Abhängig von: —

```text
**B7 Reiterwechsel** (bewegung-34, bewegung-33): Z. 117 `animation: swap-in .16s ease-out both;` → `animation: swap-in var(--dur-1) var(--ease) both;`

```

## bewegung-B10 · Reinscroll-Staffel aus --stagger, .rv im Druck sichtbar

Gruppe bewegung · Cluster bewegung · Aufwand S · Befunde: bereich_dashboard-12, bewegung-34
Quelle: audit/spec/bewegung.md Z. 223–226 · Dateien: web/css/app.css
Abhängig von: bewegung-A1

```text
**B10 Einblenden beim Reinscrollen und Druck** (bereich_dashboard-12, bewegung-34)
- Z. 2370 `transition-delay: calc(var(--i, 0) * 40ms);` → `transition-delay: calc(var(--i, 0) * var(--stagger));`
- Im Block `@media print { … }` (Z. 1192–1200) vor der schließenden Klammer neu: `.js-motion .rv { opacity: 1 !important; transform: none !important; transition: none !important; }`

```

## bewegung-B11 · Weniger Bewegung: Lade-Ring .spin dreht weiter (2,4 s)

Gruppe bewegung · Cluster bewegung · Aufwand S · Befunde: barrierefreiheit-44
Quelle: audit/spec/bewegung.md Z. 227–228 · Dateien: web/css/app.css
Abhängig von: —

```text
**B11 Weniger Bewegung: Lade-Ring** (barrierefreiheit-44): Z. 1559 `.spin { animation-duration: 2.4s; }` → `.spin { animation: spin-turn 2.4s linear infinite !important; }` (Spezifität 0,1,0 schlägt `*` aus Z. 97).

```

## bewegung-B12 · Lade-Kurven (.skel, .ld, Tipp-Punkte) auf --ease-sym

Gruppe bewegung · Cluster bewegung · Aufwand S · Befunde: bewegung-33
Quelle: audit/spec/bewegung.md Z. 229–233 · Dateien: web/css/app.css
Abhängig von: bewegung-A1

```text
**B12 Lade-Kurven** (bewegung-33)
- Z. 1518 `animation: skel-sheen 1.8s cubic-bezier(.45, 0, .25, 1) infinite;` → `animation: skel-sheen 1.8s var(--ease-sym) infinite;`
- Z. 1527 `animation: ld-run 1.5s cubic-bezier(.65, 0, .35, 1) infinite;` → `animation: ld-run 1.5s var(--ease-sym) infinite;`
- Z. 2356 `animation: mentor-dot 1.4s infinite cubic-bezier(.45, 0, .55, 1);` → `animation: mentor-dot 1.4s infinite var(--ease-sym);`

```

## bewegung-3.4 · motion.js: Reinscroll-Staffel aus --stagger statt STEP

Gruppe bewegung · Cluster bewegung · Aufwand S · Befunde: bewegung-34
Quelle: audit/spec/bewegung.md Z. 307–311 · Dateien: web/js/motion.js
Abhängig von: bewegung-A1

```text
### 3.4 `web/js/motion.js` (bewegung-34)
- Z. 2 Kommentar `--dur-1/2/3 und --ease` → `--dur-1 bis --dur-4, --stagger und --ease`
- Z. 21 `var STEP = 40; /* … */` löschen.
- Z. 33 `ms('--dur-3') + Math.min(k, MAX_I) * STEP + 80` → `ms('--dur-3') + Math.min(k, MAX_I) * ms('--stagger') + 80`. Kein Rückfallwert, damit 0 ms wirklich abschaltet.

```

## bewegung-3.5a · App.render: M.scan nur beim echten Seitenwechsel, Kommentare Z. 75 und 98–99 anpassen

Gruppe bewegung · Cluster bewegung · Aufwand S · Befunde: bereich_dashboard-12, bewegung-3
Quelle: audit/spec/bewegung.md Z. 312–314 · Dateien: web/js/app.js
Abhängig von: —

```text
### 3.5 `web/js/app.js`
- **Z. 103** (bereich_dashboard-12, bewegung-3): `M.scan(main.querySelector('#content'), false);` → `if (anim) M.scan(main.querySelector('#content'), false); /* nur beim echten Seitenwechsel; ein Neuaufbau bereitet nichts erneut vor */`
- Kommentar Z. 75 `Neuaufbau nach Eingaben: nur, was noch unter dem Fenster liegt` → `Neuaufbau nach Eingaben: nichts blendet ein`. Kommentar Z. 98–99 entsprechend: „nur was beim Seitenwechsel unter dem Fenster liegt, blendet beim Reinscrollen ein“.
```

## bewegung-3.11b · motiontest: neuer Test „Neuaufbau bereitet nichts erneut vor“

Gruppe bewegung · Cluster bewegung · Aufwand S · Befunde: bewegung-3
Quelle: audit/spec/bewegung.md Z. 345–345 · Dateien: web/e2e/motiontest.js
Abhängig von: bewegung-3.5a

```text
- **motiontest.js** nach Z. 28 neu (bewegung-3): Fortschritt öffnen, 900 ms warten, `App.rerender()`, dann `ok('Neuaufbau bereitet nichts erneut vor', document.querySelectorAll('#content .rv').length === 0)`.
```

## bewegung-3.12a · README „Bewegung und Übergänge“ Z. 329–331: Skala, Hover-Regel, Ebenen und Reinscrollen neu beschreiben

Gruppe bewegung · Cluster bewegung · Aufwand S · Befunde: —
Quelle: audit/spec/bewegung.md Z. 349–350 · Dateien: web/README.md
Abhängig von: bewegung-A1, bewegung-B1, bewegung-B3, bewegung-B4a, bewegung-B5, bewegung-3.5a, bewegung-3.5b, bewegung-3.7b, bewegung-3.8b

```text
### 3.12 `web/README.md`
- **Z. 329–331** ersetzen durch: „Alle Animationen laufen über eine gemeinsame Skala in `css/app.css`: `--dur-1` 150 ms (Hover, Schließen, kleine Wechsel), `--dur-2` 240 ms (Zustandswechsel, Seitenüberblendung), `--dur-3` 380 ms (größere Flächen), `--dur-4` 640 ms (nur Einzug von Diagrammen, Score-Skala und Ringen beim Seitenwechsel), `--stagger` 40 ms (Staffel); Kurven `--ease` (auslaufend), `--ease-in` (Schließen), `--ease-io` (Schieber), `--ease-sym` (Schleifen und Atemtakt). Beim Darüberfahren bewegt sich nichts (kein Anheben, Verschieben oder Vergrößern), Rückmeldung nur über Rand, Fläche, Schriftfarbe oder einen feinen Umriss; nur Knöpfe geben beim Drücken nach. `js/motion.js` blendet beim Seitenwechsel Karten und Abschnitte, die unter dem Fenster liegen, beim Reinscrollen ein (einmalig, gestaffelt; nach einem Neuaufbau oder Reiterwechsel nicht erneut; im Druck ist alles sichtbar), kapselt den Seitenwechsel in eine View Transition und blendet Dialoge, Popover, Filter-Fenster, Symbol-Liste, Seitenpanel und Toasts aus, bevor sie entfernt werden. Menüs unter einem Knopf klappen von ihm herab auf, nach oben öffnende Menüs steigen auf.“
```

## bewegung-3.12b · README Z. 342–343: weniger Bewegung (Ring dreht weiter) und Abschalten über --dur-1 bis --dur-4 und --stagger

Gruppe bewegung · Cluster bewegung · Aufwand S · Befunde: —
Quelle: audit/spec/bewegung.md Z. 351–351 · Dateien: web/README.md
Abhängig von: bewegung-A1, bewegung-B11

```text
- **Z. 342–343** ersetzen durch: „Bei ‚weniger Bewegung‘ im System (`prefers-reduced-motion`) ist alles aus, nur der feine Ring in Knöpfen dreht langsam weiter (2,4 s je Umdrehung), damit ‚Wird erstellt …‘ nicht hängend wirkt. Abschalten: `--dur-1` bis `--dur-4` und `--stagger` auf `0ms` setzen oder `js/motion.js` nicht einbinden; ohne das Skript bleibt alles sofort sichtbar. Eigene Zeiten behalten nur der Ruhepunkt-Raum, Endlos-Animationen (Lade-Glanz, Kurslinie, Serie, Kerzen, Tipp-Punkte), das Start-Skelett und die Drehung des Grabsteins.“
```
