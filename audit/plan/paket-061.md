# Paket 061 · trades_tag, zustaende, komponenten

Schritte: 5 · Dateien: web/e2e/dptest.js, web/js/app.js, web/js/screens/trades.js
Betroffene Tests laut Spezifikation: web/e2e/dptest.js:92
Baut auf Paketen auf: 7, 17, 18, 19, 55, 58, 60

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## barrierefreiheit-P12 · Trade-Dialog: novalidate, eigene Pflichtfeld-Prüfung mit aria-invalid und Fokus, Punktwert-(i) aus dem Label, guard

Gruppe barrierefreiheit · Cluster trades_tag · Aufwand M · Befunde: wording-1, barrierefreiheit-11, barrierefreiheit-18, bereich_statistik-31
Quelle: audit/spec/barrierefreiheit.md Z. 645–663 · Dateien: web/js/app.js
Abhängig von: barrierefreiheit-B3, barrierefreiheit-B11, barrierefreiheit-U1, barrierefreiheit-U3a, barrierefreiheit-P4

```text
**P12 Trade-Dialog** (Z. 348–373, 398–400, 475–479)
- Z. 348: `<form id="trade-form" class="tf" data-action="save-trade" …>` → `<form id="trade-form" class="tf" novalidate data-action="save-trade" …>` (`required` an 354, 356, 359 bleibt als Semantik)
- Z. 363 vorher: `<div class="field"><label for="f-mult">Punktwert ${U.info('…')}</label><input …>`
  nachher: `<div class="field"><div class="lbl-row"><label for="f-mult">Punktwert</label>${U.info('…')}</div><input …>`
- Z. 369: Optionen um `guard: true` ergänzen. Im `onMount` ergänzen: `el.addEventListener('input', e => { if (e.target.removeAttribute) e.target.removeAttribute('aria-invalid'); });`
- Z. 398 (`pick`) nach `btn.classList.remove('sym-none');`: `btn.removeAttribute('aria-invalid');`
- Z. 476 (`save-trade`) Prüfung ersetzen:
  ```js
  const t = App.readTradeForm(form);
  const bad = (sel, msg) => { const f = form.querySelector(sel); if (f) { f.setAttribute('aria-invalid', 'true'); f.focus(); } return U.toast(msg, 'err'); };
  if (!t.symbol) return bad('#f-symbol-btn', 'Symbol fehlt');
  if ('direction' in t && !t.direction) { const sw = form.querySelector('#f-dir'); if (sw) { sw.classList.remove('need'); void sw.offsetWidth; sw.classList.add('need'); sw.querySelector('button')?.focus(); } return U.toast('Long oder Short wählen', 'err'); }
  if (t.entryPrice == null) return bad('#f-entry', 'Einstieg fehlt');
  if (!(t.quantity > 0)) return bad('#f-qty', 'Kontrakte fehlen');
  if (!form.querySelector('#f-open').value) return bad('#f-open', 'Eröffnet fehlt'); /* roh prüfen: readTradeForm setzt leer still auf „jetzt“ */
  if (t.closedAt && t.exitPrice == null) return bad('#f-exit', 'Ausstieg fehlt');
  ```
- Befunde: wording-1, barrierefreiheit-11, barrierefreiheit-18, bereich_statistik-31

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: #trade-form] Eine Prüfung für den Trade-Dialog. Den Ablauf liefert zustaende-S-A4: novalidate nur am Trade-Formular, alle Fehler zugleich über U.fieldErrors am Feld (.field.invalid, aria-invalid, aria-describedby="<id>-err", .field-err), Fokus aufs erste fehlerhafte Feld, kein Toast und keine Browser-Blase. Die Texte kommen aus barrierefreiheit-P12 nach der Hausregel „<Feld> fehlt/fehlen“. Endgültige Prüfkette in 'save-trade': const t = App.readTradeForm(form); const errs = []; const q = s => form.querySelector(s); if (!t.symbol) errs.push({ el: q('#f-symbol-btn'), msg: 'Symbol fehlt' }); if ('direction' in t && !t.direction) { errs.push({ el: q('#f-dir .dir-opt'), msg: 'Long oder Short wählen' }); const sw = q('#f-dir'); if (sw) { sw.classList.remove('need'); void sw.offsetWidth; sw.classList.add('need'); } } if (t.entryPrice == null) errs.push({ el: q('#f-entry'), msg: 'Einstieg fehlt' }); if (!(Number(form.elements.quantity.value) > 0)) errs.push({ el: q('#f-qty'), msg: 'Kontrakte fehlen' }); if (!form.elements.openedAt.value) errs.push({ el: q('#f-open'), msg: 'Eröffnet fehlt' }); if (t.closedAt && t.exitPrice == null) errs.push({ el: q('#f-exit'), msg: 'Ausstieg fehlt' }); if (errs.length) { U.fieldErrors(form, errs); return; } Gründe: Eine Meldung am Feld bleibt stehen und ist mit dem Feld verknüpft (WCAG 3.3.1). Laut zustaende Z7.1 melden Toasts nur Ergebnisse, und Feldmeldungen sind ruhiger als rote Toasts. Für die Texte spricht: Es ist die Fehlerregel der Barrierefreiheit (Z8), die Schlüssel „Symbol fehlt“ und „Long oder Short wählen“ sind schon übersetzt, und der Verpasst-Dialog nutzt denselben Wortlaut. „Symbol wählen“ als Fehler würde nur den Platzhalter des Symbolknopfs wiederholen.
- ÄNDERN: Es bleiben nur zwei Teile: (1) Z. 363: Punktwert-(i) aus dem <label>, also <div class="lbl-row"><label for="f-mult">Punktwert</label>${U.info('…')}</div>; (2) Z. 369: guard: true in den U.modal-Optionen. Es entfallen: novalidate (setzt zustaende-S-A4), der input-Listener im onMount (der globale input/change-Listener aus zustaende-S-A1 entfernt Feldmeldung und aria-invalid zusammen), btn.removeAttribute('aria-invalid') in pick() (zustaende-S-A4 ruft U.clearFieldError(btn) auf) und die Prüfkette mit bad()/U.toast. Die Übersetzungen aus Z. 194 bleiben und dienen jetzt als Feldmeldung. Die alten Schlüssel 'Einstiegskurs fehlt' und 'Ausstiegskurs fehlt für geschlossenen Trade' werden entfernt. Prüfpunkt 24 neu: Absenden ohne Einstieg zeigt keine Browser-Blase und keinen Toast; unter dem Feld steht .field-err „Einstieg fehlt“, der Rand ist --loss, der Fokus liegt im ersten fehlerhaften Feld.
- [konflikt: #f-dir] Der Verpasst-Dialog meldet fehlendes Symbol und fehlende Richtung genauso wie der Trade-Dialog: als Feldmeldung über U.fieldErrors, nicht als Toast. Gleiche Texte („Symbol fehlt“, „Long oder Short wählen“) und gleiches .need-Wackeln. Die Meldungen verschwinden über U.clearFieldError, das zustaende-S-A4 in 'set-dir' und in pick() von openSymbolMenu einbaut. Beide Stellen werden von beiden Dialogen benutzt, weil App.symbolField und App.dirField (komponenten-A5b) dieselben IDs liefern. Das Datum bleibt dort natives required und läuft über den globalen invalid-Listener. Für P12 gilt, was unter #trade-form steht.
- [reihenfolge: App.openTradeEditor] Alle Schritte ändern dieselbe Vorlage. Darum gilt eine feste Reihenfolge, und zwei Doppelungen werden zusammengelegt. (1) komponenten-A5b löst Symbol und Richtung in App.symbolField und App.dirField heraus. (2) abstaende-E2 entfernt die Wrapper. Die Klasse tf-dir gehört in App.dirField: <div class="field tf-dir">…</div>. Im Verpasst-Dialog wirkt sie nicht, denn die CSS-Regeln greifen nur unter .tf-main >. (3) wording-S5.4-5.5 setzt das Feld Geschlossen und übernimmt dabei farbe-C12a: <div class="field tf-c3 tf-dt"><label for="f-close">Geschlossen <span class="lbl-hint dp-coarse">(leer lassen, solange offen)</span></label><input class="input" type="datetime-local" id="f-close" name="closedAt" data-empty="Offen" value="…"></div>. Die Klasse ist lbl-hint statt faint, weil --faint nie für Wörter steht. Der Knopftext wird ${trade ? 'Speichern' : 'Trade loggen'}, die Klasse bleibt btn primary. Wie die Bestätigen-Knöpfe aussehen, ist Nutzerfrage komponenten-1 und wird hier nicht geändert. (4) barrierefreiheit-P12 (Restteil): Punktwert-(i) in .lbl-row innerhalb von <div class="field tf-c3"> und guard: true. (5) zustaende-S-A4: novalidate und Prüfung (siehe #trade-form). abstaende-E3, aufbau-B6 und wording-S5.3 sind unter App.actions['new-trade'] entschieden, wording-S5.9 unter app.html keydown.
- [doppelt: U.toast] zustaende-S-U6 übernimmt toastWrap() und toast() ganz. Der Container hat role=status und aria-live=polite. Dauer: min(7000, max(err ? 4500 : 2400, 1200 + Länge·55)) ms. Beim Darüberfahren hält der Toast an, nach dem Verlassen bleibt er noch 1500 ms. Ausgeblendet wird über Motion.leave mit '--dur-2', passend zu .toast.out. barrierefreiheit-U4 legt nur noch announce() mit #sr-live an, denn sein toastWrap ist Wort für Wort derselbe. Es gibt nur einen Namen: U.toastWrap (Export über barrierefreiheit-U7). Die Zeile toast.init = toastWrap entfällt. Beim Start wird genau einmal U.toastWrap() aufgerufen (barrierefreiheit-P10). Wo zustaende-S-A1 U.toast.init() vorsieht, steht U.toastWrap(); die Zusammenführung von P10 und S-A1 in App.bind regelt konflikt-1. Formularfehler laufen nicht über Toasts (P12 und komponenten-S-trades-h, siehe #trade-form und #f-dir). wording-S14.8-14.9 ruft U.toast unverändert auf.
- [konflikt: aria-invalid] aria-invalid setzt und entfernt allein U.fieldErrors bzw. U.clearFieldError (zustaende-S-U5). Die händischen setAttribute- und removeAttribute-Aufrufe aus barrierefreiheit-P12 entfallen (Anweisung unter #trade-form).
- [konflikt: #f-symbol-btn] Fehler am Symbolknopf: Feldmeldung „Symbol fehlt“ über U.fieldErrors, aufgeräumt mit U.clearFieldError(btn) in pick() (siehe #trade-form). Die IDs f-symbol-btn, f-symbol und f-symbol-l bleiben in App.symbolField (komponenten-A5b) gleich, darum gilt das für Trade- und Verpasst-Dialog.
- [konflikt: #f-entry] Feldmeldung „Einstieg fehlt“ über U.fieldErrors (siehe #trade-form). required bleibt als Semantik.
- [konflikt: #f-exit] Ist Geschlossen gesetzt und fehlt der Ausstieg, erscheint die Feldmeldung „Ausstieg fehlt“ am Ausstiegsfeld (siehe #trade-form). Wie man den Trade offen lässt, zeigt das Feld Geschlossen über sein Overlay „Offen“ bzw. den Hinweis „(leer lassen, solange offen)“.
- [konflikt: #f-qty] Geprüft wird roh mit Number(form.elements.quantity.value) > 0 (aus S-A4, fängt auch negative Eingaben ab, die readTradeForm still per abs umdreht), Meldung „Kontrakte fehlen“ (siehe #trade-form).
- [konflikt: #f-open] Geprüft wird roh mit form.elements.openedAt.value, weil readTradeForm leer still auf „jetzt“ setzt. Meldung „Eröffnet fehlt“ (siehe #trade-form).
- [konflikt: App.readTradeForm] readTradeForm bleibt unverändert. Die Prüfung in 'save-trade' liest Symbol, Richtung, Einstieg und Ausstieg daraus, Kontrakte und Eröffnet roh aus dem Formular (siehe #trade-form).

## barrierefreiheit-E-dptest-92 · dptest.js:92: zweites Escape zeigt „Änderungen verwerfen?“, dann [data-confirm]

Gruppe barrierefreiheit · Cluster komponenten · Aufwand S · Befunde: barrierefreiheit-11
Quelle: audit/spec/barrierefreiheit.md Z. 908–908 · Dateien: web/e2e/dptest.js
Abhängig von: barrierefreiheit-U3a, barrierefreiheit-U3b, barrierefreiheit-P4, barrierefreiheit-P12

```text
| dptest.js:92 | „Zweites Escape schließt den Dialog“ | Das Feld wurde geändert (Z. 70–80). Zweites Escape zeigt „Änderungen verwerfen?“, dann Klick auf `[data-confirm]`, danach `!document.querySelector('.modal-bg')` |
```

## barrierefreiheit-P14b · Rückfrage (guard: true) für Session starten, Check-in, Session beenden

Gruppe barrierefreiheit · Cluster trades_tag · Aufwand S · Befunde: barrierefreiheit-11
Quelle: audit/spec/barrierefreiheit.md Z. 676–678 · Dateien: web/js/app.js
Abhängig von: barrierefreiheit-U3a, barrierefreiheit-P4

```text
- Z. 490 (`openSessionStart`): `U.modal(`…`)` → `U.modal(`…`, { guard: true })`
- Z. 524 (`openCheckIn`): `{ cls: 'narrow' }` → `{ cls: 'narrow', guard: true }`
- Z. 529 (`openSessionEnd`): `{ guard: true }` ergänzen
```

## zustaende-S-A4 · Trade-Formular: novalidate, eigene Prüfung mit Feldmeldungen statt Toasts, Meldung weg bei Richtungs- und Symbolwahl

Gruppe zustaende · Cluster zustaende · Aufwand M · Befunde: zustaende-3, barrierefreiheit-6
Quelle: audit/spec/zustaende.md Z. 553–569 · Dateien: web/js/app.js
Abhängig von: zustaende-S-U5, zustaende-S-C3, zustaende-S-A1

```text
**S-A4 Trade-Formular prüfen** – zustaende-3, barrierefreiheit-6
- Z. 348 `<form id="trade-form" class="tf" data-action="save-trade" …>` → `<form id="trade-form" class="tf" data-action="save-trade" novalidate …>`. `required` an f-entry, f-qty, f-open bleibt (Semantik).
- Z. 476 Prüfkette ersetzen durch:
```js
const t = App.readTradeForm(form); const errs = []; const q = s => form.querySelector(s);
if (!t.symbol) errs.push({ el: q('#f-symbol-btn'), msg: 'Symbol wählen' });
if ('direction' in t && !t.direction) { errs.push({ el: q('#f-dir .dir-opt'), msg: 'Long oder Short wählen' }); const sw = q('#f-dir'); if (sw) { sw.classList.remove('need'); void sw.offsetWidth; sw.classList.add('need'); } }
if (t.entryPrice == null) errs.push({ el: q('#f-entry'), msg: 'Einstieg eintragen' });
if (!(Number(form.elements.quantity.value) > 0)) errs.push({ el: q('#f-qty'), msg: 'Kontrakte eintragen' });
if (!form.elements.openedAt.value) errs.push({ el: q('#f-open'), msg: 'Datum eintragen' });
if (t.closedAt && t.exitPrice == null) errs.push({ el: q('#f-exit'), msg: 'Ausstieg eintragen oder Geschlossen leeren' });
if (errs.length) { U.fieldErrors(form, errs); return; }
```
Die Meldung „Long oder Short wählen“ hängt am `.field` der Richtung (`q('#f-dir .dir-opt').closest('.field')`). Die Fußzeilen-Vorschau (Z. 469) und `.dir-switch.need` bleiben. Der Toast „Trade gespeichert“ bleibt.
- Z. 471 `'set-dir'`: am Ende `U.clearFieldError(f.querySelector('#f-dir .dir-opt'));` ergänzen (die Meldung hängt am ersten Richtungsknopf, auch wenn „Short“ geklickt wird).
- Z. 398 (Symbolwahl in `openSymbolMenu`): nach dem Setzen von `#f-symbol` `U.clearFieldError(btn);` ergänzen.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: #trade-form] Eine Prüfung für den Trade-Dialog. Den Ablauf liefert zustaende-S-A4: novalidate nur am Trade-Formular, alle Fehler zugleich über U.fieldErrors am Feld (.field.invalid, aria-invalid, aria-describedby="<id>-err", .field-err), Fokus aufs erste fehlerhafte Feld, kein Toast und keine Browser-Blase. Die Texte kommen aus barrierefreiheit-P12 nach der Hausregel „<Feld> fehlt/fehlen“. Endgültige Prüfkette in 'save-trade': const t = App.readTradeForm(form); const errs = []; const q = s => form.querySelector(s); if (!t.symbol) errs.push({ el: q('#f-symbol-btn'), msg: 'Symbol fehlt' }); if ('direction' in t && !t.direction) { errs.push({ el: q('#f-dir .dir-opt'), msg: 'Long oder Short wählen' }); const sw = q('#f-dir'); if (sw) { sw.classList.remove('need'); void sw.offsetWidth; sw.classList.add('need'); } } if (t.entryPrice == null) errs.push({ el: q('#f-entry'), msg: 'Einstieg fehlt' }); if (!(Number(form.elements.quantity.value) > 0)) errs.push({ el: q('#f-qty'), msg: 'Kontrakte fehlen' }); if (!form.elements.openedAt.value) errs.push({ el: q('#f-open'), msg: 'Eröffnet fehlt' }); if (t.closedAt && t.exitPrice == null) errs.push({ el: q('#f-exit'), msg: 'Ausstieg fehlt' }); if (errs.length) { U.fieldErrors(form, errs); return; } Gründe: Eine Meldung am Feld bleibt stehen und ist mit dem Feld verknüpft (WCAG 3.3.1). Laut zustaende Z7.1 melden Toasts nur Ergebnisse, und Feldmeldungen sind ruhiger als rote Toasts. Für die Texte spricht: Es ist die Fehlerregel der Barrierefreiheit (Z8), die Schlüssel „Symbol fehlt“ und „Long oder Short wählen“ sind schon übersetzt, und der Verpasst-Dialog nutzt denselben Wortlaut. „Symbol wählen“ als Fehler würde nur den Platzhalter des Symbolknopfs wiederholen.
- ÄNDERN: Prüfkette wie im Entscheidungstext mit den Texten 'Symbol fehlt', 'Long oder Short wählen', 'Einstieg fehlt', 'Kontrakte fehlen', 'Eröffnet fehlt', 'Ausstieg fehlt' (statt 'Symbol wählen', 'Einstieg eintragen', 'Kontrakte eintragen', 'Datum eintragen', 'Ausstieg eintragen oder Geschlossen leeren'). Unverändert bleiben: novalidate an Z. 348, U.fieldErrors, U.clearFieldError am Ende von 'set-dir' und nach dem Setzen von #f-symbol in pick() von openSymbolMenu, das .need-Wackeln, die Fußzeilen-Vorschau und der Toast „Trade gespeichert“. Die Übersetzungsschlüssel 'Einstieg eintragen', 'Kontrakte eintragen', 'Datum eintragen' und 'Ausstieg eintragen oder Geschlossen leeren' (zustaende Z. 873) nicht anlegen. Stattdessen gelten die aus barrierefreiheit Z. 194 (Entry missing · Contracts missing · Open time missing · Exit missing). Prüfpunkt 23 bleibt.
- [konflikt: #f-symbol-btn] Fehler am Symbolknopf: Feldmeldung „Symbol fehlt“ über U.fieldErrors, aufgeräumt mit U.clearFieldError(btn) in pick() (siehe #trade-form). Die IDs f-symbol-btn, f-symbol und f-symbol-l bleiben in App.symbolField (komponenten-A5b) gleich, darum gilt das für Trade- und Verpasst-Dialog.
- [konflikt: #f-entry] Feldmeldung „Einstieg fehlt“ über U.fieldErrors (siehe #trade-form). required bleibt als Semantik.
- [konflikt: #f-exit] Ist Geschlossen gesetzt und fehlt der Ausstieg, erscheint die Feldmeldung „Ausstieg fehlt“ am Ausstiegsfeld (siehe #trade-form). Wie man den Trade offen lässt, zeigt das Feld Geschlossen über sein Overlay „Offen“ bzw. den Hinweis „(leer lassen, solange offen)“.
- [konflikt: #f-qty] Geprüft wird roh mit Number(form.elements.quantity.value) > 0 (aus S-A4, fängt auch negative Eingaben ab, die readTradeForm still per abs umdreht), Meldung „Kontrakte fehlen“ (siehe #trade-form).
- [konflikt: #f-open] Geprüft wird roh mit form.elements.openedAt.value, weil readTradeForm leer still auf „jetzt“ setzt. Meldung „Eröffnet fehlt“ (siehe #trade-form).
- [konflikt: App.readTradeForm] readTradeForm bleibt unverändert. Die Prüfung in 'save-trade' liest Symbol, Richtung, Einstieg und Ausstieg daraus, Kontrakte und Eröffnet roh aus dem Formular (siehe #trade-form).

## komponenten-S-trades-h · Verpasst-Dialog: Prüfung „Symbol fehlt“ / „Long oder Short wählen“ vor dem Speichern

Gruppe komponenten · Cluster zustaende · Aufwand S · Befunde: bereich_trades_tag-11
Quelle: audit/spec/komponenten.md Z. 725–726 · Dateien: web/js/screens/trades.js
Abhängig von: komponenten-S-trades-g

```text
- Z. 112 (`save-missed`) vor dem Speichern: `if (!fd.get('symbol')) return U.toast('Symbol fehlt', 'err'); if (!fd.get('direction')) { const sw = form.querySelector('#f-dir'); sw.classList.remove('need'); void sw.offsetWidth; sw.classList.add('need'); return U.toast('Long oder Short wählen', 'err'); }` und `direction: Number(fd.get('direction'))`.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: #f-dir] Der Verpasst-Dialog meldet fehlendes Symbol und fehlende Richtung genauso wie der Trade-Dialog: als Feldmeldung über U.fieldErrors, nicht als Toast. Gleiche Texte („Symbol fehlt“, „Long oder Short wählen“) und gleiches .need-Wackeln. Die Meldungen verschwinden über U.clearFieldError, das zustaende-S-A4 in 'set-dir' und in pick() von openSymbolMenu einbaut. Beide Stellen werden von beiden Dialogen benutzt, weil App.symbolField und App.dirField (komponenten-A5b) dieselben IDs liefern. Das Datum bleibt dort natives required und läuft über den globalen invalid-Listener. Für P12 gilt, was unter #trade-form steht.
- ÄNDERN: In 'save-missed' (trades.js Z. 112) vor dem Speichern statt der zwei Toasts: const errs = []; if (!fd.get('symbol')) errs.push({ el: form.querySelector('#f-symbol-btn'), msg: 'Symbol fehlt' }); if (!fd.get('direction')) { errs.push({ el: form.querySelector('#f-dir .dir-opt'), msg: 'Long oder Short wählen' }); const sw = form.querySelector('#f-dir'); if (sw) { sw.classList.remove('need'); void sw.offsetWidth; sw.classList.add('need'); } } if (errs.length) { U.fieldErrors(form, errs); return; } Danach unverändert direction: Number(fd.get('direction')). Kein U.toast für Formularfehler.
- [doppelt: U.toast] zustaende-S-U6 übernimmt toastWrap() und toast() ganz. Der Container hat role=status und aria-live=polite. Dauer: min(7000, max(err ? 4500 : 2400, 1200 + Länge·55)) ms. Beim Darüberfahren hält der Toast an, nach dem Verlassen bleibt er noch 1500 ms. Ausgeblendet wird über Motion.leave mit '--dur-2', passend zu .toast.out. barrierefreiheit-U4 legt nur noch announce() mit #sr-live an, denn sein toastWrap ist Wort für Wort derselbe. Es gibt nur einen Namen: U.toastWrap (Export über barrierefreiheit-U7). Die Zeile toast.init = toastWrap entfällt. Beim Start wird genau einmal U.toastWrap() aufgerufen (barrierefreiheit-P10). Wo zustaende-S-A1 U.toast.init() vorsieht, steht U.toastWrap(); die Zusammenführung von P10 und S-A1 in App.bind regelt konflikt-1. Formularfehler laufen nicht über Toasts (P12 und komponenten-S-trades-h, siehe #trade-form und #f-dir). wording-S14.8-14.9 ruft U.toast unverändert auf.
