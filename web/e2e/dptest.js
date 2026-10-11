const { chromium } = require('playwright');
const base = 'file:///home/user/Florian/web/app.html';
const out = []; const ok = (name, cond, extra = '') => out.push(`${cond ? 'PASS' : 'FAIL'} ${name}${extra ? ' · ' + extra : ''}`);
const pad = n => String(n).padStart(2, '0');
(async () => {
  const browser = await chromium.launch(); const errs = [];
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('console: ' + m.text()); });
  await p.goto(base + '#/trades', { waitUntil: 'load' }); await p.waitForTimeout(500);
  const now = new Date(); const ym = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`; const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const dpState = () => p.evaluate(() => { const d = document.getElementById('pop-dp'); if (!d) return { open: false }; const r = d.getBoundingClientRect(); return { open: d.classList.contains('open') && !d.classList.contains('closing'), title: (d.querySelector('.dp-title') || {}).textContent, top: Math.round(r.top), left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height), months: d.classList.contains('months') }; });
  /* 1. Zeitraum: Von-Feld */
  /* Seit dem Zeitraum-Kalender hat das Zeitraum-Menü keine Datumsfelder mehr: zwei Testfelder (Von/Bis) ins offene Menü setzen */
  const openRange = async () => { const open = await p.$eval('#pop-range', e => e.classList.contains('open') && !e.classList.contains('closing')).catch(() => false); if (!open) { await p.click('.page-head [data-pop=range]'); await p.waitForTimeout(200); } await p.evaluate(() => { const pop = document.getElementById('pop-range'); if (pop.querySelector('#dp-fixture')) return; const f = document.createElement('form'); f.id = 'dp-fixture'; f.className = 'range-form'; f.innerHTML = '<input class="input" type="date" id="range-from" data-dp-group="range" aria-label="Von"><input class="input" type="date" id="range-to" data-dp-group="range" aria-label="Bis">'; const cal = pop.querySelector('.rr-cal') || pop; cal.insertBefore(f, cal.firstChild); }); };
  await openRange();
  const indicatorRule = () => { for (const ss of document.styleSheets) { let rs; try { rs = ss.cssRules; } catch (e) { continue; } for (const r of rs) if (r.media && /pointer: fine/.test(r.conditionText || r.media.mediaText)) for (const rr of r.cssRules) if (/::-webkit-calendar-picker-indicator/.test(rr.selectorText) && rr.style.display === 'none' && /type="date"/.test(rr.selectorText)) return true; } return false; };
  /* Symbol-Regel und Ausblenden des nativen Symbols stehen im selben (pointer: fine)-Block; file:// sperrt CSSOM, darum über das eigene Symbol geprüft */
  ok('Eigenes Kalender-Symbol statt des nativen', await p.evaluate(() => matchMedia('(pointer: fine)').matches) && await p.$eval('#range-from', e => getComputedStyle(e).backgroundImage.includes('svg') && getComputedStyle(e).paddingRight === '38px'));
  await p.click('#range-from'); await p.waitForTimeout(250);
  let st = await dpState(); const fr = await p.$eval('#range-from', e => { const r = e.getBoundingClientRect(); return { b: Math.round(r.bottom), l: Math.round(r.left) }; });
  ok('Kalender öffnet beim Klick ins Feld', st.open, JSON.stringify(st));
  ok('Kalender unter dem Feld, links bündig', st.top >= fr.b && st.top <= fr.b + 10 && Math.abs(st.left - fr.l) <= 1, `${st.top}/${fr.b} ${st.left}/${fr.l}`);
  ok('Titel zeigt aktuellen Monat', st.title.includes(MONTHS[now.getMonth()]) && st.title.includes(String(now.getFullYear())), st.title);
  ok('42 Tage, 7 Wochentage Mo bis So', await p.$$eval('#pop-dp .dp-day', e => e.length) === 42 && (await p.$$eval('#pop-dp .dp-week span', e => e.map(x => x.textContent).join(' '))) === 'Mo Di Mi Do Fr Sa So');
  ok('Heute markiert', await p.$$eval('#pop-dp .dp-day.today', e => e.length) === 1);
  await p.click(`#pop-dp .dp-day[data-k="${ym}-03"]`); await p.waitForTimeout(250);
  ok('Tag gewählt → Wert im Feld', await p.$eval('#range-from', e => e.value) === `${ym}-03`);
  st = await dpState(); ok('Kalender schließt nach der Wahl', !st.open);
  ok('Zeitraum-Popover bleibt offen', await p.$eval('#pop-range', e => e.classList.contains('open')));
  /* 2. Bis-Feld mit Spanne */
  await p.click('#range-to'); await p.waitForTimeout(250);
  ok('Bis-Feld: Von-Tag als Rand markiert', await p.$$eval(`#pop-dp .dp-day.edge[data-k="${ym}-03"]`, e => e.length) === 1);
  await p.click(`#pop-dp .dp-day[data-k="${ym}-10"]`); await p.waitForTimeout(250);
  await p.click('#range-to'); await p.waitForTimeout(250);
  ok('Spanne dazwischen hervorgehoben (6 Tage)', await p.$$eval('#pop-dp .dp-day.in', e => e.length) === 6, String(await p.$$eval('#pop-dp .dp-day.in', e => e.length)));
  /* 3. Blättern und Monatsansicht */
  await p.click('#pop-dp [data-dp=next]'); await p.waitForTimeout(150);
  st = await dpState(); const nm = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  ok('Weiter blättert einen Monat', st.open && st.title.includes(MONTHS[nm.getMonth()]), st.title);
  ok('Blättern lässt Zeitraum-Popover offen', await p.$eval('#pop-range', e => e.classList.contains('open') && !e.classList.contains('closing')));
  await p.click('#pop-dp [data-dp=prev]'); await p.click('#pop-dp [data-dp=prev]'); await p.waitForTimeout(150);
  const pm = new Date(now.getFullYear(), now.getMonth() - 1, 1); st = await dpState(); ok('Zurück blättert', st.title.includes(MONTHS[pm.getMonth()]), st.title);
  await p.click('#pop-dp [data-dp=mode]'); await p.waitForTimeout(150); st = await dpState();
  ok('Titel öffnet Monatsansicht mit 12 Monaten', st.months && await p.$$eval('#pop-dp .dp-month', e => e.length) === 12, st.title);
  await p.click('#pop-dp [data-dp=next]'); await p.click('#pop-dp .dp-month[data-m="1"]'); await p.waitForTimeout(150); st = await dpState();
  ok('Monat wählen springt zurück in die Tage', !st.months && st.title === `Februar ${pm.getFullYear() + 1}`, st.title);
  /* 4. Escape und Klick daneben */
  await p.keyboard.press('Escape'); await p.waitForTimeout(250); st = await dpState();
  ok('Escape schließt nur den Kalender', !st.open && await p.$eval('#pop-range', e => e.classList.contains('open')));
  await p.click('#range-from'); await p.waitForTimeout(200); await p.mouse.click(1380, 880); await p.waitForTimeout(250);
  ok('Klick daneben schließt den Kalender', !(await dpState()).open);
  /* 5. Tastatur */
  await openRange();
  await p.focus('#range-from'); await p.keyboard.press('Alt+ArrowDown'); await p.waitForTimeout(250);
  ok('Alt+Pfeil öffnet, Fokus im Kalender', (await dpState()).open && await p.evaluate(() => document.activeElement && document.activeElement.classList.contains('dp-day') && document.activeElement.dataset.k), await p.evaluate(() => document.activeElement && document.activeElement.dataset.k));
  const k0 = await p.evaluate(() => document.activeElement.dataset.k);
  await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowDown'); await p.waitForTimeout(80);
  const k1 = await p.evaluate(() => document.activeElement.dataset.k); const d0 = new Date(k0 + 'T00:00'); d0.setDate(d0.getDate() + 8); const exp = `${d0.getFullYear()}-${pad(d0.getMonth() + 1)}-${pad(d0.getDate())}`;
  ok('Pfeile wandern um Tag und Woche', k1 === exp, `${k0} → ${k1} (erwartet ${exp})`);
  await p.keyboard.press('Enter'); await p.waitForTimeout(250);
  ok('Enter übernimmt den Tag', await p.$eval('#range-from', e => e.value) === exp && !(await dpState()).open);
  ok('Fokus zurück im Feld', await p.evaluate(() => document.activeElement && document.activeElement.id === 'range-from'));
  /* Anwenden funktioniert weiter */
  ok('Zeitraum-Menü zeigt den neuen Zeitraum-Kalender', await p.evaluate(() => document.querySelectorAll('#pop-range .rr-m').length === 2));
  /* 6. Trade-Editor: Datum mit Uhrzeit */
  await p.evaluate(() => App.openTradeEditor(null)); await p.waitForTimeout(400);
  const before = await p.$eval('#f-open', e => e.value);
  await p.click('#f-open'); await p.waitForTimeout(250);
  ok('Kalender über dem Dialog', (await dpState()).open && await p.evaluate(() => { const r = document.getElementById('pop-dp').getBoundingClientRect(); const t = document.elementFromPoint(r.left + 40, r.top + 60); return !!t && !!t.closest('#pop-dp'); }));
  ok('Pflichtfeld ohne „Löschen“', !(await p.$('#pop-dp [data-dp=clear]')) && !!(await p.$('#pop-dp [data-dp=today]')));
  const pickK = `${before.slice(0, 7)}-15`; await p.click(`#pop-dp .dp-day[data-k="${pickK}"]`); await p.waitForTimeout(250);
  const after = await p.$eval('#f-open', e => e.value);
  ok('Datum übernommen, Uhrzeit bleibt', after === `${pickK}T${before.slice(11, 16)}`, `${before} → ${after}`);
  ok('Dialog bleibt offen', !!(await p.$('.modal-bg .modal')));
  /* Uhrzeit: Spalten für Stunde und Minute, Klick setzt sofort, Kalender bleibt offen bis „Fertig“ */
  ok('Datum mit Uhrzeit: Kalender bleibt nach Tageswahl offen', (await dpState()).open);
  ok('Uhrzeit-Spalten: 24 Stunden, 60 Minuten, aktuelle Zeit markiert', await p.$$eval('#pop-dp .dp-t[data-dp=hour]', e => e.length) === 24 && await p.$$eval('#pop-dp .dp-t[data-dp=min]', e => e.length) === 60 && await p.$eval('#pop-dp .dp-t[data-dp=hour].sel', e => e.textContent) === before.slice(11, 13));
  await p.click('#pop-dp .dp-t[data-dp=hour][data-v="9"]'); await p.waitForTimeout(150); await p.click('#pop-dp .dp-t[data-dp=min][data-v="45"]'); await p.waitForTimeout(150);
  ok('Stunde und Minute gewählt → Wert im Feld, Kalender offen', await p.$eval('#f-open', e => e.value) === `${pickK}T09:45` && (await dpState()).open, await p.$eval('#f-open', e => e.value));
  await p.focus('#pop-dp .dp-t[data-dp=min][data-v="45"]'); await p.keyboard.press('ArrowDown'); await p.waitForTimeout(100);
  ok('Pfeil runter: nächste Minute', await p.$eval('#f-open', e => e.value) === `${pickK}T09:46` && await p.evaluate(() => document.activeElement && document.activeElement.dataset.v === '46'));
  await p.click('#pop-dp [data-dp=done]'); await p.waitForTimeout(250);
  ok('„Fertig“ schließt, Fokus im Feld', !(await dpState()).open && await p.evaluate(() => document.activeElement && document.activeElement.id === 'f-open'));
  await p.click('#f-close'); await p.waitForTimeout(250);
  ok('Schluss-Feld (optional) mit „Löschen“', !!(await p.$('#pop-dp [data-dp=clear]')));
  await p.click('#pop-dp [data-dp=today]'); await p.waitForTimeout(250);
  const tk = `${ym}-${pad(now.getDate())}`; const fc = await p.$eval('#f-close', e => e.value);
  ok('„Heute“ setzt heutiges Datum mit Uhrzeit', fc.startsWith(tk + 'T') && fc.length === 16, fc);
  await p.click('#f-close'); await p.waitForTimeout(200); await p.click('#pop-dp [data-dp=clear]'); await p.waitForTimeout(250);
  ok('„Löschen“ leert das Feld', await p.$eval('#f-close', e => e.value) === '');
  await p.click('#f-open'); await p.waitForTimeout(200); await p.keyboard.press('Escape'); await p.waitForTimeout(250);
  ok('Escape im Dialog: erst Kalender zu, Dialog bleibt', !(await dpState()).open && !!(await p.$('.modal-bg .modal')));
  await p.keyboard.press('Escape'); await p.waitForTimeout(400); ok('Zweites Escape schließt den Dialog', !(await p.$('.modal-bg')));
  /* 7. Monatsfeld (Zertifikat) */
  await p.evaluate(() => Certificate.open('month')); await p.waitForTimeout(500);
  const mInput = await p.$('input[type=month][data-c=ref]');
  if (mInput) { const mv = await mInput.evaluate(e => e.value); await mInput.click(); await p.waitForTimeout(250); st = await dpState();
    ok('Monatsfeld zeigt Monatsansicht', st.open && st.months && !(await p.$('#pop-dp [data-dp=mode]')), st.title);
    await p.click('#pop-dp .dp-month[data-m="0"]'); await p.waitForTimeout(400);
    const mv2 = await p.$eval('input[type=month][data-c=ref]', e => e.value); ok('Monat übernommen (Januar)', /^\d{4}-01$/.test(mv2) && mv2 !== mv, `${mv} → ${mv2}`); }
  else ok('Monatsfeld im Zertifikat gefunden', false);
  await p.keyboard.press('Escape'); await p.waitForTimeout(300); await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  /* 8. Seitenwechsel schließt offenen Kalender */
  await p.evaluate(() => { location.hash = '#/notebook'; }); await p.waitForTimeout(600);
  await p.click('[data-pop=nbfilter]'); await p.waitForTimeout(250); const nbFrom = await p.$('input[name=from][data-dp-group=nbrange]');
  if (nbFrom) { await nbFrom.click(); await p.waitForTimeout(200); ok('Notebook-Filter nutzt den Kalender', (await dpState()).open); await p.evaluate(() => { location.hash = '#/trades'; }); await p.waitForTimeout(600); ok('Seitenwechsel schließt den Kalender', !(await dpState()).open); }
  else ok('Notebook-Filter mit Datumsfeld', false);
  /* 9. Kalender nahe am unteren Rand klappt nach oben */
  await p.setViewportSize({ width: 1440, height: 520 }); await p.evaluate(() => App.openTradeEditor(null)); await p.waitForTimeout(400);
  await p.$eval('#f-close', e => e.scrollIntoView({ block: 'end' })); await p.waitForTimeout(100); await p.click('#f-close'); await p.waitForTimeout(250);
  st = await dpState(); const fcR = await p.$eval('#f-close', e => { const r = e.getBoundingClientRect(); return { t: Math.round(r.top), b: Math.round(r.bottom) }; });
  ok('Kalender bleibt im Fenster', st.open && st.top >= 8 && st.top + st.h <= 520 - 8 + 1, `${st.top}+${st.h} Feld ${fcR.t}-${fcR.b}`);
  await p.keyboard.press('Escape'); await p.keyboard.press('Escape'); await p.waitForTimeout(300); await p.setViewportSize({ width: 1440, height: 900 });
  /* Bildschirmfotos dunkel und hell */
  await openRange(); await p.click('#range-to'); await p.waitForTimeout(300);
  await p.screenshot({ path: 'dp-dark.png', clip: { x: 232, y: 60, width: 640, height: 560 } });
  await p.keyboard.press('Escape'); await p.keyboard.press('Escape'); await p.evaluate(() => { Store.setSetting('theme', 'light'); Theme.apply(Store.settings); }); await p.waitForTimeout(200);
  await openRange(); await p.click('#range-to'); await p.waitForTimeout(300);
  await p.screenshot({ path: 'dp-light.png', clip: { x: 232, y: 60, width: 640, height: 560 } });
  await p.keyboard.press('Escape'); await p.evaluate(() => { Store.setSetting('theme', 'dark'); Theme.apply(Store.settings); });
  /* 10. Touch-Gerät behält den System-Kalender */
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); const mp = await mctx.newPage(); mp.on('pageerror', e => errs.push('mobil: ' + e.message));
  await mp.goto(base + '#/trades', { waitUntil: 'load' }); await mp.waitForTimeout(500);
  ok('Touch: pointer coarse', await mp.evaluate(() => !matchMedia('(pointer: fine)').matches));
  await mp.evaluate(() => App.openTradeEditor(null)); await mp.waitForTimeout(400); await mp.tap('#f-open'); await mp.waitForTimeout(300);
  ok('Touch: kein eigener Kalender, natives Feld unverändert', !(await mp.evaluate(() => { const d = document.getElementById('pop-dp'); return !!d && d.classList.contains('open'); })) && await mp.$eval('#f-open', e => getComputedStyle(e).backgroundImage === 'none'));
  await mctx.close();
  ok('Keine Fehler', errs.length === 0, errs.join(' | '));
  console.log(out.join('\n')); console.log(`${out.filter(x => x.startsWith('PASS')).length}/${out.length} bestanden`);
  await browser.close();
})();
