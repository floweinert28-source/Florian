# Paket 058 · zustaende, dashboard, diagramme

Schritte: 8 · Dateien: web/README.md, web/e2e/dashtest.js, web/js/app.js, web/js/ui.js, web/js/widgets.js
Betroffene Tests laut Spezifikation: web/e2e/dashtest.js:143–144; web/e2e/dashtest.js:143–144 (Schritt zustaende-S-TE2)
Baut auf Paketen auf: 2, 7, 10, 14, 31, 55, 56

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## zustaende-S-U4a · Baustein U.chartEmpty / U.chartEmptyHTML anlegen und in root.UI exportieren

Gruppe zustaende · Cluster zustaende · Aufwand S · Befunde: diagramme-38
Quelle: audit/spec/zustaende.md Z. 401–407 · Dateien: web/js/ui.js
Abhängig von: zustaende-S-C4

```text
**S-U4 Karten-/Diagramm-Leerzustand** – diagramme-38
Nach Z. 178 (`const empty = …`) neu:
```js
const chartEmptyHTML = (title = 'Noch keine Daten', hint = '', icon = 'stats') => `<div class="empty chart-empty">${I[icon] || ''}<span class="ce-t">${esc(title)}</span>${hint ? `<span class="small">${esc(hint)}</span>` : ''}</div>`;
const chartEmpty = (el, title, hint) => { el.innerHTML = chartEmptyHTML(title, hint); };
```
`chartEmpty` und `chartEmptyHTML` in `root.UI` (Z. 464) exportieren. Leerzweige der Zeichner:
```

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: root.UI] Alle Schritte ergänzen verschiedene Namen im selben Export-Objekt, ohne Überschneidung. Endstand ergänzt: toastWrap, announce, lightbox, requestClose, vbarPath, hbarPath, xLabels, fitRadars, scoreText, count, chartEmpty, chartEmptyHTML, fieldErrors, clearFieldError, clearFieldErrors. barrierefreiheit-U7 exportiert toastWrap, darum muss die Funktion vorher aus zustaende-S-U6 da sein (sonst ReferenceError beim Laden von ui.js). Jeder Export kommt erst mit seiner Funktion.

## zustaende-S-W3 · emptyBox nur mit Titel nach Leerlage; chartEmpty delegiert an U.chartEmpty

Gruppe zustaende · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-13, wording-46, diagramme-38
Quelle: audit/spec/zustaende.md Z. 475–478 · Dateien: web/js/widgets.js
Abhängig von: zustaende-S-W1, zustaende-S-U4a, zustaende-S-C4

```text
**S-W3 emptyBox und chartEmpty** – bereich_dashboard-13, wording-46, diagramme-38
- Z. 32 → `const emptyBox = (h = 220) => `<div class="empty chart-empty" style="min-height:${h}px">${I.stats}<span class="ce-t">${EMPTY_T[EMPTY]}</span></div>`;`
- Z. 44 → `const chartEmpty = el => U.chartEmpty(el);`

```

## zustaende-S-TE2 · Test dashtest.js:143–144: leeres Dashboard mit „—“-Kacheln, Karten-Titel „Noch keine Trades“, ohne „Mehr anzeigen“

Gruppe zustaende · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-13, wording-46, wording-47, zustaende-8
Quelle: audit/spec/zustaende.md Z. 878–878 · Dateien: web/e2e/dashtest.js
Abhängig von: zustaende-S-W1, zustaende-S-W2, zustaende-S-W3, zustaende-S-W4, zustaende-S-D1

```text
- `e2e/dashtest.js:143–144` ersetzen: im leeren Zustand mindestens 5 `.dash-top .tile .nodata.dash` mit `textContent` „—Noch keine Daten“; mindestens 3 `.chart-empty .ce-t` mit „Noch keine Trades“; `#content` enthält nicht „ändere den Zeitraum“; kein `.recent-card .more-link`.
```

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: #content] P1 macht #content mit tabindex="-1" fokussierbar, P10 legt die Aktion skip-content an, H1 setzt den Sprunglink. Ohne P10 würde der Link mit href="#content" die Route wechseln, denn parseRoute fällt auf das Dashboard zurück. Ohne P1 bliebe c.focus() wirkungslos. Reihenfolge P1 → P10 → H1, oder alles in einem Commit. S-TE2 (dashtest) prüft nur Text in #content und hängt nicht davon ab.

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

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: drawers.vbars] Verträglich, aber in fester Reihenfolge. B10 ergänzt den Tooltip um die Summe. U6b übernimmt diesen Text danach in groupTip (siehe Anker data-tip) und verschiebt ihn vom sichtbaren Balken auf eine transparente Trefferfläche je Fach: x = ml + i * gap mit dem jeweils gültigen ml, y = mt, Breite gap, Höhe H − mt − mb. zustaende-S-U4b betrifft nur den Leerzweig (chartEmpty(el); return;) und bleibt unverändert. Für den vbars-Umbau diagramme-C13 aus der anderen Konfliktliste gilt dieselbe Platzierung: kein data-tip am <path class="br">, kein eigenes Leer-Rechteck, Trefferflächen aus der U6b-Schleife (groupTip liefert für leere Fächer „<b>Name</b>: Keine Trades“).

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

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: root.UI] Alle Schritte ergänzen verschiedene Namen im selben Export-Objekt, ohne Überschneidung. Endstand ergänzt: toastWrap, announce, lightbox, requestClose, vbarPath, hbarPath, xLabels, fitRadars, scoreText, count, chartEmpty, chartEmptyHTML, fieldErrors, clearFieldError, clearFieldErrors. barrierefreiheit-U7 exportiert toastWrap, darum muss die Funktion vorher aus zustaende-S-U6 da sein (sonst ReferenceError beim Laden von ui.js). Jeder Export kommt erst mit seiner Funktion.
- [konflikt: aria-describedby] U.fieldErrors darf vorhandene Beschreibungen nicht überschreiben und U.clearFieldError sie nicht löschen. Betroffen sind z. B. die Währungsauswahl im Prop-Konto-Dialog mit aria-describedby="pa-cur-hint" (abstaende-M2), deren required-Prüfung über den globalen invalid-Listener läuft. Die Fehler-ID wird angehängt, beim Aufräumen wird nur der Teil mit „-err“ entfernt. switchRow (C-misc-15, Suffix „-d“) und M2 bleiben unverändert. Den Wortlaut des Hinweises legt M2 nicht fest.
- ÄNDERN: In fieldErrors statt el.setAttribute('aria-describedby', id): const keep = (el.getAttribute('aria-describedby') || '').split(/\s+/).filter(x => x && !x.endsWith('-err')); el.setAttribute('aria-describedby', keep.concat(id).join(' ')); In clearFieldError statt if ((el.getAttribute('aria-describedby') || '').endsWith('-err')) el.removeAttribute('aria-describedby'): const keep = (el.getAttribute('aria-describedby') || '').split(/\s+/).filter(x => x && !x.endsWith('-err')); if (keep.length) el.setAttribute('aria-describedby', keep.join(' ')); else el.removeAttribute('aria-describedby');
- [konflikt: aria-invalid] aria-invalid setzt und entfernt allein U.fieldErrors bzw. U.clearFieldError (zustaende-S-U5). Die händischen setAttribute- und removeAttribute-Aufrufe aus barrierefreiheit-P12 entfallen (Anweisung unter #trade-form).

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

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: App.bind] Der Toast-Container wird genau einmal am Anfang von bind() angelegt, mit `U.toastWrap(); U.announce('');` (barrierefreiheit-P10; U.toastWrap wird laut barrierefreiheit-U7 exportiert). Die zusätzliche erste Zeile `U.toast.init();` aus zustaende-S-A1 macht dasselbe unter einem zweiten Namen und entfällt. Ob toast.init als Alias bestehen bleibt, entscheidet der Anker U.toast/toastWrap. Der invalid-Listener und clearErr aus zustaende-S-A1 kommen unverändert neben den submit-Listener. Der Tastatur-Handler aus barrierefreiheit-P3 ersetzt den alten Escape-Handler. Beide Teile stören sich nicht: Der eine hört auf keydown, der andere auf invalid, input und change.
- ÄNDERN: Die Zeile `U.toast.init();` nicht einfügen, denn `U.toastWrap()` aus barrierefreiheit-P10 legt den Container an. invalid-Listener, invalidBatch und clearErr unverändert neben dem submit-Listener ergänzen.
- ÄNDERN: U.toast.init() gibt es nicht. Den Container legt beim Start U.toastWrap() an, nur einmal in App.bind. Wenn konflikt-1 den Aufruf barrierefreiheit-P10 zuteilt, entfällt die Zeile hier.

## zustaende-S-R4 · README Z. 338–340: Start-Skelett mit Design und Leiste, Skelette für News/Coach, Regeln für U.spin/U.loader

Gruppe zustaende · Cluster zustaende · Aufwand S · Befunde: —
Quelle: audit/spec/zustaende.md Z. 891–891 · Dateien: web/README.md
Abhängig von: zustaende-S-H1, zustaende-S-NW2, zustaende-S-CS2, zustaende-S-CS3

```text
- Z. 338–340: ergänzen „Design (hell/dunkel) und eingeklappte Leiste stehen schon im Skelett (Theme im `<head>` von `app.html`). Bereiche, die Daten nachladen (News, Coach), zeigen ein Skelett aus `.skel`; `U.spin()` nur in Knöpfen neben Text, `U.loader()` nur mit sichtbarem Text daneben.“
```

## zustaende-S-R5 · README: neuer Abschnitt „Zustände“ nach „Bewegung und Übergänge“

Gruppe zustaende · Cluster zustaende · Aufwand S · Befunde: —
Quelle: audit/spec/zustaende.md Z. 892–893 · Dateien: web/README.md
Abhängig von: zustaende-S-C1, zustaende-S-C4, zustaende-S-A1, zustaende-S-U6

```text
- Neuer Absatz nach „Bewegung und Übergänge“, Überschrift „Zustände“: vier Leerzustand-Stufen (Z1), „—“ für fehlende Werte, Feldfehler am Feld statt Toast, Toast-Dauer und Live-Region, Rückfrage vor endgültigem Löschen, Deaktiviert `--disabled-o`, Hover nur auf Bedienbarem.

```
