# Paket 015 · dashboard

Schritte: 3 · Dateien: web/js/screens/dash-filter.js, web/js/screens/dashboard.js
Betroffene Tests laut Spezifikation: —
Baut auf Paketen auf: 7, 14

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## bewegung-3.7b · Seitenpanel (JS): neuer Abdunkler .settled in keepPanel, Ausblenden in 'dash-add-close' mit Doppel-Schutz

Gruppe bewegung · Cluster dashboard · Aufwand M · Befunde: bewegung-26
Quelle: audit/spec/bewegung.md Z. 325–327 · Dateien: web/js/screens/dashboard.js
Abhängig von: bewegung-B9

```text
- **keepPanel Z. 67–69** (bewegung-26): direkt nach `fn();` (vor der Prüfung `if (!old || …) return;`) ergänzen: `const nbg = document.querySelector('.panel-bg'); if (old && nbg) nbg.classList.add('settled');`
- **Z. 208 `'dash-add-close'`** (bewegung-26) → `'dash-add-close'() { const s = st(), p = document.querySelector('.side-panel'), bg = document.querySelector('.panel-bg'), Mo = root.Motion; if (p && p.classList.contains('out')) return; const done = () => { s.panel = null; s.slot = null; App.rerender(); }; if (p && Mo && Mo.enabled) { if (bg) bg.classList.add('out'); Mo.leave(p, 'out', '--dur-1', done); } else done(); },`

```

## bewegung-3.8a · Filter-Fenster place(): transform-origin je Lage (Titelzeile rechts, sonst links)

Gruppe bewegung · Cluster dashboard · Aufwand S · Befunde: bewegung-28
Quelle: audit/spec/bewegung.md Z. 328–329 · Dateien: web/js/screens/dash-filter.js
Abhängig von: bewegung-B4a

```text
### 3.8 `web/js/screens/dash-filter.js` (bewegung-27, bewegung-28)
- **`place()` Z. 150–155**: nach `Object.assign(pop.style, { … })` ergänzen: `pop.style.transformOrigin = inTop && !phone ? 'top right' : 'top left';`
```

## bewegung-3.8b · Filter-Fenster close(): nur das eigene Fenster ausblenden und entfernen

Gruppe bewegung · Cluster dashboard · Aufwand M · Befunde: bewegung-27
Quelle: audit/spec/bewegung.md Z. 330–332 · Dateien: web/js/screens/dash-filter.js
Abhängig von: bewegung-B4c

```text
- **`close()` Z. 169** → `function close() { const u = ui(); u.open = false; u.draft = null; u.pick = null; const pop = document.getElementById('fd-pop'); if (!pop) return; pop.removeAttribute('id'); const Mo = root.Motion; if (Mo && Mo.enabled) Mo.leave(pop, 'closing', '--dur-1', () => pop.remove()); else pop.remove(); }`
  - `open()` ersetzt den Inhalt von `#fd-layer` ohnehin. `refresh()` bricht wegen `open = false` ab, `place()` findet das ausblendende Fenster ohne ID nicht mehr.

```
