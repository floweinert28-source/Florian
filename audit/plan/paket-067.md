# Paket 067 · trades_tag

Schritte: 4 · Dateien: web/js/app.js, web/js/screens/trades.js
Betroffene Tests laut Spezifikation: —
Baut auf Paketen auf: 5, 6, 61, 63, 66

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .rating] Eine Bauart `.scale5` für Check-in und Bewertung (komponenten), mit der ARIA-Struktur aus barrierefreiheit. Die Zustände hängen deshalb an `aria-checked` bzw. der Klasse `.on`, nicht mehr an `aria-pressed`. Gelbe Schrift ist `--warn-text` (Farbregel). MARKUP app.js: Z. 428 `<span class="lbl" id="f-rating-l">Bewertung</span><div class="scale5 rating" id="f-rating" role="radiogroup" aria-labelledby="f-rating-l">` mit Knöpfen `role="radio" class="${t.rating >= n ? 'on' : ''}" aria-checked="${t.rating === n}" aria-label="${n} von 5 Sternen"`; set-rating schaltet `.on` kumulativ und `aria-checked` nur am n-ten Stern (P13). Z. 513 `scale()` wird `<div class="scale5" role="radiogroup" aria-labelledby="${lid}" data-chips="${name}">` mit `role="radio" aria-checked aria-label="${n} – ${label}"`; seg-set setzt aria-checked (P14a). CSS app.css statt Z. 322–325: `.scale5 { display: inline-flex; gap: 6px; } .scale5 button { width: 32px; height: 32px; padding: 0; border-radius: 8px; border: 1px solid var(--border); background: var(--surface); color: var(--text-2); font-size: 13px; font-weight: 500; cursor: pointer; transition: … var(--dur-1) var(--ease); } .scale5 button:hover { color: var(--text); background: var(--surface-2); } .scale5.rating button { color: var(--muted); } .scale5.rating button.on { --lc: var(--warn-text); }`. Im Handy-Block (≤560px): `.scale5 button { width: 44px; height: 44px; }`, 5 × 44 + 4 × 6 = 244 px. In der gemeinsamen Auswahlregel (~Z. 3125) wird `.rating button[aria-pressed="true"]` zu `.scale5 button[aria-checked="true"], .scale5.rating button.on`; das gilt auch für barrierefreiheit-B9b, das diesen Selektor dann nicht mehr anfasst. Größe: Desktop einheitlich 32 px für beide Skalen, denn 32 ≥ 24 erfüllt WCAG 2.5.8 und eine Bauart hat eine Größe. Die 36 px aus barrierefreiheit stammen von der alten Pillenform, die komponenten löscht. Am Handy 44 px, wie barrierefreiheit es für Touch verlangt, für die ganze Bauart. barrierefreiheit-Test 19 (≥ 44 bei 390 px) bleibt gültig; Prüfpunkt 22 heißt dann „Check-in-Skala 32 px (Handy 44)“.
- ÄNDERN: Z. 428: Container `class="scale5 rating"` statt `class="rating"`. Sonst wie spezifiziert (radiogroup, role=radio, .on kumulativ, aria-checked am n-ten Stern, aria-label, guard, set-rating).
- [konflikt: #f-rating] Wie beim Anker .rating: P13 schreibt Z. 428 mit `class="scale5 rating"`, role=radiogroup, Klasse `.on` und aria-checked. A6 entfällt.
- ÄNDERN: Z. 428: Container `class="scale5 rating"` statt `class="rating"`. Sonst wie spezifiziert (radiogroup, role=radio, .on kumulativ, aria-checked am n-ten Stern, aria-label, guard, set-rating).

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

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .rating] Eine Bauart `.scale5` für Check-in und Bewertung (komponenten), mit der ARIA-Struktur aus barrierefreiheit. Die Zustände hängen deshalb an `aria-checked` bzw. der Klasse `.on`, nicht mehr an `aria-pressed`. Gelbe Schrift ist `--warn-text` (Farbregel). MARKUP app.js: Z. 428 `<span class="lbl" id="f-rating-l">Bewertung</span><div class="scale5 rating" id="f-rating" role="radiogroup" aria-labelledby="f-rating-l">` mit Knöpfen `role="radio" class="${t.rating >= n ? 'on' : ''}" aria-checked="${t.rating === n}" aria-label="${n} von 5 Sternen"`; set-rating schaltet `.on` kumulativ und `aria-checked` nur am n-ten Stern (P13). Z. 513 `scale()` wird `<div class="scale5" role="radiogroup" aria-labelledby="${lid}" data-chips="${name}">` mit `role="radio" aria-checked aria-label="${n} – ${label}"`; seg-set setzt aria-checked (P14a). CSS app.css statt Z. 322–325: `.scale5 { display: inline-flex; gap: 6px; } .scale5 button { width: 32px; height: 32px; padding: 0; border-radius: 8px; border: 1px solid var(--border); background: var(--surface); color: var(--text-2); font-size: 13px; font-weight: 500; cursor: pointer; transition: … var(--dur-1) var(--ease); } .scale5 button:hover { color: var(--text); background: var(--surface-2); } .scale5.rating button { color: var(--muted); } .scale5.rating button.on { --lc: var(--warn-text); }`. Im Handy-Block (≤560px): `.scale5 button { width: 44px; height: 44px; }`, 5 × 44 + 4 × 6 = 244 px. In der gemeinsamen Auswahlregel (~Z. 3125) wird `.rating button[aria-pressed="true"]` zu `.scale5 button[aria-checked="true"], .scale5.rating button.on`; das gilt auch für barrierefreiheit-B9b, das diesen Selektor dann nicht mehr anfasst. Größe: Desktop einheitlich 32 px für beide Skalen, denn 32 ≥ 24 erfüllt WCAG 2.5.8 und eine Bauart hat eine Größe. Die 36 px aus barrierefreiheit stammen von der alten Pillenform, die komponenten löscht. Am Handy 44 px, wie barrierefreiheit es für Touch verlangt, für die ganze Bauart. barrierefreiheit-Test 19 (≥ 44 bei 390 px) bleibt gültig; Prüfpunkt 22 heißt dann „Check-in-Skala 32 px (Handy 44)“.
- ÄNDERN: Z. 513: Container `class="scale5"` statt `class="seg pill"`. Sonst wie spezifiziert (radiogroup, aria-labelledby, role=radio, aria-checked, aria-label „{n} – {Label}“, seg-set setzt aria-checked).
- [konflikt: App.checkInFields] Wie beim Anker .rating: P14a schreibt `scale()` (Z. 513) mit `class="scale5"`, role=radiogroup/radio und aria-checked. Die Check-in-Auswahl bleibt neutral (kein --lc) über `.scale5 button[aria-checked="true"]` in der gemeinsamen Auswahlregel. A6 entfällt.
- ÄNDERN: Z. 513: Container `class="scale5"` statt `class="seg pill"`. Sonst wie spezifiziert (radiogroup, aria-labelledby, role=radio, aria-checked, aria-label „{n} – {Label}“, seg-set setzt aria-checked).
- [konflikt: .seg.pill] `.seg.pill` entfällt ganz (komponenten). Der Check-in nutzt `.scale5` mit der ARIA-Struktur aus P14a, Einzelheiten beim Anker .rating.
- ÄNDERN: Z. 513: Container `class="scale5"` statt `class="seg pill"`. Sonst wie spezifiziert (radiogroup, aria-labelledby, role=radio, aria-checked, aria-label „{n} – {Label}“, seg-set setzt aria-checked).

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
