# Paket 085 · trades_tag

Schritte: 4 · Dateien: web/js/app.js, web/js/screens/trades.js
Betroffene Tests laut Spezifikation: —
Baut auf Paketen auf: 11, 79, 81, 84

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## barrierefreiheit-P13 · Plan & Bewertung: Sterne als Radiogruppe mit Klasse .on und Namen „{0} von 5 Sternen“, guard

Gruppe barrierefreiheit · Cluster trades_tag · Aufwand S · Befunde: barrierefreiheit-13, barrierefreiheit-11
Quelle: audit/spec/barrierefreiheit.md Z. 664–670 · Dateien: web/js/app.js
Abhängig von: barrierefreiheit-B9a, barrierefreiheit-U3a, barrierefreiheit-P4, barrierefreiheit-P3

```text
**P13 Plan & Bewertung** (Z. 428, 435, 472)
- Z. 428 vorher: `` <span class="lbl">Bewertung</span><div class="rating" id="f-rating">${…`<button type="button" data-action="set-rating" data-value="${n}" aria-pressed="${t.rating >= n}">★</button>`…} ``
  nachher: `` <span class="lbl" id="f-rating-l">Bewertung</span><div class="rating" id="f-rating" role="radiogroup" aria-labelledby="f-rating-l">${[1, 2, 3, 4, 5].map(n => `<button type="button" role="radio" class="${t.rating >= n ? 'on' : ''}" data-action="set-rating" data-value="${n}" aria-checked="${t.rating === n}" aria-label="${n} von 5 Sternen">★</button>`).join('')}</div> ``
- Z. 435: Optionen `{ cls: 'tf-modal', guard: true, onMount: … }`
- Z. 472 `set-rating` in der Schleife: `b.classList.toggle('on', Number(b.dataset.value) <= nv); b.setAttribute('aria-checked', String(Number(b.dataset.value) === nv));`
- Befunde: barrierefreiheit-13, barrierefreiheit-11

```

## barrierefreiheit-P14a · Check-in-Skalen als Radiogruppen mit Namen „1 – entspannt“ …, seg-set setzt aria-checked

Gruppe barrierefreiheit · Cluster trades_tag · Aufwand S · Befunde: barrierefreiheit-12
Quelle: audit/spec/barrierefreiheit.md Z. 671–675 · Dateien: web/js/app.js
Abhängig von: barrierefreiheit-B9a, barrierefreiheit-P3

```text
**P14 Check-in, Session starten und beenden** (Z. 490–553)
- Z. 513 `scale`:
  `` const scale = (name, val, labels, lid) => `<div class="seg pill" role="radiogroup" aria-labelledby="${lid}" data-chips="${name}">${[1, 2, 3, 4, 5].map(n => `<button type="button" role="radio" data-action="seg-set" data-name="${name}" data-value="${n}" aria-checked="${Number(val) === n}" aria-label="${n} – ${labels[n - 1]}" title="${labels[n - 1]}">${n}</button>`).join('')}</div><input type="hidden" name="${name}" value="${val || ''}">`; ``
- Z. 517 / 518: `<span class="lbl">` → `<span class="lbl" id="lbl-stress">` bzw. `id="lbl-mood"`; Aufruf `scale('stress', ci.stress, […], 'lbl-stress')` bzw. `scale('mood', …, 'lbl-mood')`
- Z. 546 `seg-set`: `b.setAttribute('aria-pressed', b === el)` → `b.setAttribute('aria-checked', String(b === el))`
```

## barrierefreiheit-P15 · CSV-Import: Dropzone role=button tabindex=0, Textfeld „CSV-Text einfügen“

Gruppe barrierefreiheit · Cluster trades_tag · Aufwand S · Befunde: barrierefreiheit-16, barrierefreiheit-37
Quelle: audit/spec/barrierefreiheit.md Z. 683–687 · Dateien: web/js/app.js
Abhängig von: barrierefreiheit-B10, barrierefreiheit-P3

```text
**P15 CSV-Import** (Z. 560)
- `<div class="dropzone" id="import-drop">` → `<div class="dropzone" id="import-drop" role="button" tabindex="0">`
- `<textarea class="input" id="import-text" …>` → zusätzlich `aria-label="CSV-Text einfügen"`
- Befunde: barrierefreiheit-16, barrierefreiheit-37

```

## barrierefreiheit-C-trades-77-116 · Screenshots als Knopf .shot-open, Dropzonen role=button, Aktion lightbox über U.lightbox

Gruppe barrierefreiheit · Cluster trades_tag · Aufwand M · Befunde: barrierefreiheit-17, bereich_trades_tag-41, barrierefreiheit-16
Quelle: audit/spec/barrierefreiheit.md Z. 754–758 · Dateien: web/js/screens/trades.js
Abhängig von: barrierefreiheit-B10, barrierefreiheit-U5, barrierefreiheit-U7, barrierefreiheit-P3

```text
- **Z. 77 Screenshots:** `` t.screenshots.map(id => `<div class="shot"><img data-blob="${id}" alt="Screenshot" data-action="lightbox" data-blob-id="${id}"><button … del …>`) `` → `` t.screenshots.map((id, i) => `<div class="shot"><button type="button" class="shot-open" data-action="lightbox" data-blob-id="${id}" aria-label="Screenshot ${i + 1} von ${t.screenshots.length} vergrößern"><img data-blob="${id}" alt=""></button><button … del …>`) `` (Befunde: barrierefreiheit-17, bereich_trades_tag-41)
- **Z. 79 (vor Entry):** ebenso, `aria-label="Screenshot vor Entry vergrößern"` (Befund: barrierefreiheit-17)
- **Z. 80 und 81:** `<div class="dropzone" id="pre-drop" …>` bzw. `id="shot-drop"` bekommen zusätzlich `role="button" tabindex="0"` (Befunde: barrierefreiheit-16, bereich_trades_tag-41)
- **Z. 116:** `async lightbox(el) { …; const lb = document.createElement('div'); …; document.body.appendChild(lb); }` → `async lightbox(el) { const u = await root.Blobs.url(el.dataset.blobId); if (u) U.lightbox(u, 'Screenshot'); },` (Befunde: barrierefreiheit-17, bereich_trades_tag-41)

```
