# Paket 060 · zustaende, einstellungen, diagramme

Schritte: 5 · Dateien: web/e2e/settest.js, web/js/app.js, web/js/screens/misc.js, web/js/ui.js
Betroffene Tests laut Spezifikation: web/e2e/settest.js:22; web/e2e/settest.js:22 (Schritt zustaende-S-TE6); web/e2e/settest.js:26
Baut auf Paketen auf: 6, 37, 56, 58, 59

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## zustaende-S-U4b · Leerzweige der Diagramm-Zeichner auf U.chartEmpty umstellen (pnl, line, vbars, hbars, rolling, mc, hist, weeks; equity/spark bleiben leer)

Gruppe zustaende · Cluster diagramme · Aufwand S · Befunde: diagramme-38
Quelle: audit/spec/zustaende.md Z. 408–414 · Dateien: web/js/ui.js
Abhängig von: zustaende-S-U4a

```text
- Z. 261 (pnl) und Z. 300 (line): `el.innerHTML = `<div class="empty" …>…Keine abgeschlossenen Trades im Zeitraum…`; return;` → `chartEmpty(el, 'Keine abgeschlossenen Trades im Zeitraum'); return;`
- Z. 323 (vbars), Z. 331 (hbars): → `chartEmpty(el); return;`
- Z. 339 (rolling): → `chartEmpty(el, 'Zu wenig Trades', `Mindestens ${e ? e.window : 20} Trades mit R-Wert nötig`); return;` (nur noch Rückfall, siehe S-ST4)
- Z. 347 (mc), Z. 353 (hist): `el.innerHTML = ''; return;` → `chartEmpty(el); return;`
- Z. 358 (weeks): → `chartEmpty(el, 'Noch keine Wochen'); return;` (nur noch Rückfall, siehe S-PR3)
- Z. 290 (equity, < 2 Punkte) und Z. 316 (spark) bleiben leer.

```

## zustaende-S-U5 · Feldfehler-Helfer U.fieldErrors, U.clearFieldError, U.clearFieldErrors

Gruppe zustaende · Cluster zustaende · Aufwand S · Befunde: zustaende-3, barrierefreiheit-6
Quelle: audit/spec/zustaende.md Z. 415–437 · Dateien: web/js/ui.js
Abhängig von: zustaende-S-C3

```text
**S-U5 Feldfehler-Helfer** – zustaende-3, barrierefreiheit-6
Bei Modal & Toast (vor Z. 444) neu und in `root.UI` exportieren:
```js
function clearFieldError(el) {
  const f = el.closest('.field'); if (f) { f.classList.remove('invalid'); f.querySelectorAll(':scope > .field-err').forEach(x => x.remove()); }
  if (el.getAttribute('aria-invalid') === 'true') { el.removeAttribute('aria-invalid'); if ((el.getAttribute('aria-describedby') || '').endsWith('-err')) el.removeAttribute('aria-describedby'); }
}
function clearFieldErrors(scope) { scope.querySelectorAll('[aria-invalid="true"]').forEach(clearFieldError); scope.querySelectorAll('.field.invalid').forEach(f => f.classList.remove('invalid')); scope.querySelectorAll('.field-err').forEach(x => x.remove()); }
let errSeq = 0;
function fieldErrors(form, list) {
  clearFieldErrors(form);
  for (const { el, msg } of list) {
    el.setAttribute('aria-invalid', 'true');
    const f = el.closest('.field'); if (!f) continue;
    const id = (el.id || 'fld' + (++errSeq)) + '-err';
    f.classList.add('invalid');
    const m = document.createElement('div'); m.className = 'field-err'; m.id = id; m.textContent = msg; f.appendChild(m);
    el.setAttribute('aria-describedby', id);
  }
  if (list[0]) list[0].el.focus();
}
```

```

## zustaende-S-A1 · Start: Toast-Container anlegen; globaler invalid-Listener mit Feldmeldungen und Löschen der Meldung bei Eingabe

Gruppe zustaende · Cluster zustaende · Aufwand M · Befunde: zustaende-19, barrierefreiheit-20, zustaende-3
Quelle: audit/spec/zustaende.md Z. 515–531 · Dateien: web/js/app.js
Abhängig von: zustaende-S-U5, zustaende-S-U6, zustaende-S-C3

```text
### 3.7 `web/js/app.js`

**S-A1 Start: Toast-Container, Feldfehler** – zustaende-19, barrierefreiheit-20, zustaende-3
In `bind()` (Z. 271) als erste Zeile `U.toast.init();`. Neben dem submit-Listener (nach Z. 284) neu:
```js
let invalidBatch = null;
document.addEventListener('invalid', e => {
  const el = e.target; if (!el.form || el.form.noValidate) return; e.preventDefault();
  const v = el.validity; const num = x => fmt.num(Number(x), 4);
  const msg = v.valueMissing ? 'Pflichtfeld' : v.rangeUnderflow ? `Mindestens ${num(el.min)}` : v.rangeOverflow ? `Höchstens ${num(el.max)}` : v.typeMismatch && el.type === 'email' ? 'Gültige E-Mail-Adresse eintragen' : 'Ungültiger Wert';
  if (!invalidBatch) { invalidBatch = { form: el.form, list: [] }; queueMicrotask(() => { const b = invalidBatch; invalidBatch = null; U.fieldErrors(b.form, b.list); }); }
  invalidBatch.list.push({ el, msg });
}, true);
const clearErr = e => { const el = e.target; if (el && el.getAttribute && el.getAttribute('aria-invalid') === 'true') U.clearFieldError(el); };
document.addEventListener('input', clearErr, true); document.addEventListener('change', clearErr, true);
```

```

## zustaende-S-M2 · Einstellungen → Trading speichert sofort bei change, „Gespeichert“ im Kopf, kein Speichern-Knopf

Gruppe zustaende · Cluster einstellungen · Aufwand M · Befunde: komponenten-5
Quelle: audit/spec/zustaende.md Z. 762–770 · Dateien: web/js/screens/misc.js
Abhängig von: zustaende-S-C14, zustaende-S-A1

```text
**S-M2 Trading speichert sofort** – komponenten-5
- Z. 192 `head('Trading', 'Passe dein Trading-Erlebnis an.')` → `head('Trading', 'Passe dein Trading-Erlebnis an.', '<span class="save-state" id="set-save" aria-live="polite"></span>')`; `<form data-action="save-trading" class="stack" …>` → `<form data-action="save-trading" data-change="save-trading-auto" class="stack" …>`
- Z. 201 `<div><button type="submit" class="btn primary">Speichern</button></div>` entfernen.
- Z. 335: Lesen der Form in eine Funktion `function readTrading(form) { … }` auslagern (genau der heutige Inhalt bis `C.setBreakEven(st.beOffset)`). `'save-trading'(form) { readTrading(form); U.toast('Gespeichert', 'ok'); rerender(); }` bleibt für Enter. Neu:
```js
'save-trading-auto'(form) { if (!form.checkValidity()) { form.reportValidity(); return; } readTrading(form); const s = document.getElementById('set-save'); if (s) { s.textContent = 'Gespeichert'; clearTimeout(s._t); s._t = setTimeout(() => { s.textContent = ''; }, 2000); } },
```
(kein Toast, kein `rerender`). Profil, Mentor, Notebook unverändert.

```

## zustaende-S-TE6 · Test settest.js:22: Break-even-Felder füllen und mit Tab verlassen statt Submit

Gruppe zustaende · Cluster einstellungen · Aufwand S · Befunde: komponenten-5
Quelle: audit/spec/zustaende.md Z. 882–882 · Dateien: web/e2e/settest.js
Abhängig von: zustaende-S-M2, zustaende-S-M1b

```text
- `e2e/settest.js:22`: statt Klick auf den Submit-Knopf `#be-from` und `#be-to` füllen und mit `press('Tab')` verlassen, dann den Store prüfen. Z. 26 bleibt (be-reset setzt `C.setBreakEven`).
```
