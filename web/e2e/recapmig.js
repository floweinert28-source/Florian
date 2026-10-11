/* Migration: bestehende Daten mit eingeschalteten Recaps (alter Standard) → einmalig aus; danach selbst eingeschaltet bleibt an; Import ebenso */
const { chromium } = require('playwright');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log('PASS ' + m); } else { fail++; console.log('FAIL ' + m); } };
(async () => { const b = await chromium.launch(); const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///home/user/Florian/web/app.html#/dashboard', { waitUntil: 'load' }); await p.waitForTimeout(800);
  await p.evaluate(() => { const d = JSON.parse(localStorage.getItem('trading-journal-web-v1')); d.settings.notifications = { weekly: true, monthly: true }; delete d.settings.recapsOffV1; d.settings.recapShown = {}; localStorage.setItem('trading-journal-web-v1', JSON.stringify(d)); });
  await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(800);
  ok(await p.evaluate(() => Store.settings.notifications.weekly === false && Store.settings.notifications.monthly === false && Store.settings.recapsOffV1 === true), 'Alte Daten: Recaps einmalig aus');
  ok(await p.evaluate(() => ![...document.querySelectorAll('.banner')].some(x => /Recap/.test(x.textContent))), 'Kein Recap-Hinweis oben auf dem Dashboard');
  ok(await p.evaluate(() => Store.trades().length > 100), 'Daten bleiben erhalten');
  await p.evaluate(() => { Store.setSetting('notifications', { weekly: true, monthly: false }); Store.saveNow(); }); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(800);
  ok(await p.evaluate(() => Store.settings.notifications.weekly === true), 'Selbst eingeschaltet: bleibt nach Neuladen an');
  ok(await p.evaluate(() => [...document.querySelectorAll('.banner')].some(x => /Wochen-Recap/.test(x.textContent)) || new Date().getDay() !== 1), 'Eingeschaltet: Wochen-Recap erscheint wieder (montags)');
  const txt = await p.evaluate(async () => { const t = await Store.exportJSON(false); const o = JSON.parse(t); o.settings = Object.assign({}, o.settings, { notifications: { weekly: true, monthly: true } }); delete o.settings.recapsOffV1; return JSON.stringify(o); });
  ok(await p.evaluate(async t => { await Store.importJSON(t, 'replace'); return Store.settings.recapsOffV1 === true; }, txt), 'Import: Marke gesetzt');
  ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
  console.log(`${pass}/${pass + fail} bestanden`); await b.close(); process.exit(fail ? 1 : 0); })();
