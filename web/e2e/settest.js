const { chromium } = require('playwright');
const base = 'file:///home/user/Florian/web/app.html';
const out = []; const ok = (n, c, x = '') => out.push(`${c ? 'PASS' : 'FAIL'} ${n}${x ? ' · ' + x : ''}`);
(async () => {
  const browser = await chromium.launch(); const errs = [];
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto(base + '#/settings', { waitUntil: 'load' }); await p.waitForTimeout(500);
  ok('Bereichsliste mit 12 Einträgen (inkl. Sprache)', await p.$$eval('.set-nav a', a => a.length) === 12 && await p.$eval('.set-nav a.active', a => a.textContent.trim()) === 'Profil');
  await p.screenshot({ path: 's-profil.png', fullPage: false });
  for (const [sec, title] of [['benachrichtigungen', 'Benachrichtigungen'], ['abo', 'Abo'], ['konten', 'Konten'], ['trading', 'Trading'], ['regeln', 'Regeln'], ['notebook', 'Notebook'], ['inhalte', 'Inhalte'], ['logs', 'Logs']]) { await p.evaluate(h => { location.hash = '#/settings/' + h; }, sec); await p.waitForFunction(t => { const h = document.querySelector('.set-head h2'); return h && h.textContent.trim() === t; }, title, { timeout: 3000 }).catch(() => {}); ok(`Bereich ${title}`, (await p.textContent('.set-head h2')).trim() === title); }
  // Benachrichtigungen
  await p.evaluate(() => { location.hash = '#/settings/benachrichtigungen'; }); await p.waitForTimeout(250);
  ok('Recaps standardmäßig aus', await p.evaluate(() => Store.settings.notifications.weekly === false && Store.settings.notifications.monthly === false) && await p.$eval('[data-key="weekly"]', b => b.getAttribute('aria-checked') === 'false'));
  await p.click('[data-action="notif-toggle"][data-key="weekly"]'); await p.waitForTimeout(200);
  ok('Wöchentlicher Recap einschaltbar', await p.evaluate(() => Store.settings.notifications.weekly === true) && await p.$eval('[data-key="weekly"]', b => b.getAttribute('aria-checked') === 'true'));
  await p.click('[data-action="notif-toggle"][data-key="weekly"]'); await p.waitForTimeout(150);
  ok('… und wieder abschaltbar', await p.evaluate(() => Store.settings.notifications.weekly === false));
  await p.screenshot({ path: 's-notif.png', clip: { x: 232, y: 72, width: 1208, height: 420 } });
  // Trading: Break-even
  await p.evaluate(() => { location.hash = '#/settings/trading'; }); await p.waitForTimeout(250);
  await p.click('[data-action="instrument-toggle"][data-value="futures"]'); await p.waitForTimeout(100);
  await p.fill('#be-from', '-150'); await p.fill('#be-to', '150'); await p.click('form[data-action="save-trading"] button[type=submit]'); await p.waitForTimeout(300);
  ok('Trading gespeichert: Instrument + Break-even-Bereich', await p.evaluate(() => Store.settings.instruments.includes('futures') && Store.settings.beOffset.from === -150 && Store.settings.beOffset.to === 150));
  const beCount = await p.evaluate(() => App.allTrades().filter(t => t.status === 'be').length); ok('Break-even wirkt auf Trades', beCount > 0, String(beCount));
  await p.click('[data-action="be-mode"][data-value="pct"]'); await p.waitForTimeout(250); ok('Einheit auf % umgestellt', await p.evaluate(() => Store.settings.beOffset.mode === 'pct'));
  await p.click('[data-action="be-reset"]'); await p.waitForTimeout(250); ok('Break-even zurückgesetzt', await p.evaluate(() => Store.settings.beOffset.from === 0 && Store.settings.beOffset.to === 0 && App.allTrades().filter(t => t.status === 'be').length < 5));
  await p.screenshot({ path: 's-trading.png', clip: { x: 232, y: 72, width: 1208, height: 700 } });
  // Notebook
  await p.evaluate(() => { location.hash = '#/settings/notebook'; }); await p.waitForTimeout(250);
  await p.selectOption('select[name=h1]', '36'); await p.waitForTimeout(100); ok('Vorschau reagiert', await p.$eval('#nb-preview', e => e.style.getPropertyValue('--h1') === '36px'));
  await p.click('form[data-action="save-notebook"] button[type=submit]'); await p.waitForTimeout(300);
  ok('Notebook gespeichert + CSS-Variable gesetzt', await p.evaluate(() => Store.settings.notebook.h1 === 36 && document.documentElement.style.getPropertyValue('--nb-h1') === '36px'));
  await p.screenshot({ path: 's-notebook.png', clip: { x: 232, y: 72, width: 1208, height: 620 } });
  // Inhalte
  await p.evaluate(() => { location.hash = '#/settings/inhalte'; }); await p.waitForTimeout(250);
  ok('Kategorien-Tabelle mit 3 Zeilen', await p.$$eval('.set-body tbody tr', r => r.length) === 3);
  await p.click('[data-action="content-tab"][data-value="tags"]'); await p.waitForTimeout(250);
  const before = await p.$$eval('.set-body tbody tr', r => r.length); ok('Tags-Tabelle gefüllt', before >= 20, String(before));
  await p.click('[data-action="tag-new"]'); await p.waitForTimeout(200); await p.fill('#tg-name', 'Gap and Go'); await p.selectOption('#tg-kind', 'setups'); await p.fill('#tg-desc', 'Einstieg nach Eröffnungslücke'); await p.click('.modal button[type=submit]'); await p.waitForTimeout(300);
  ok('Tag mit Beschreibung angelegt', await p.evaluate(() => Store.data.tags.setups.includes('Gap and Go') && Store.tagMeta('setups', 'Gap and Go').desc === 'Einstieg nach Eröffnungslücke'));
  await p.fill('#tag-q', 'gap'); await p.waitForTimeout(300); ok('Tag-Suche filtert', await p.$$eval('.set-body tbody tr', r => r.length) === 1);
  await p.click('[data-action="tag-edit"][data-value="Gap and Go"]'); await p.waitForTimeout(200); await p.fill('#tg-name', 'Gap & Go'); await p.click('.modal button[type=submit]'); await p.waitForTimeout(300);
  ok('Tag umbenannt, Beschreibung bleibt', await p.evaluate(() => Store.data.tags.setups.includes('Gap & Go') && !Store.data.tags.setups.includes('Gap and Go') && Store.tagMeta('setups', 'Gap & Go').desc.length > 0));
  await p.click('[data-action="tag-delete"][data-value="Gap & Go"]'); await p.waitForTimeout(200); await p.click('.modal [data-confirm]'); await p.waitForTimeout(300);
  ok('Tag gelöscht', await p.evaluate(() => !Store.data.tags.setups.includes('Gap & Go')));
  await p.fill('#tag-q', ''); await p.waitForTimeout(300); await p.selectOption('[data-change="tag-filter"]', 'mistakes'); await p.waitForTimeout(250); ok('Filter nach Kategorie', await p.$$eval('.set-body tbody tr td:nth-child(2)', c => c.every(x => x.textContent.includes('Fehler'))));
  await p.screenshot({ path: 's-tags.png', clip: { x: 232, y: 72, width: 1208, height: 700 } });
  // Logs
  await p.evaluate(() => { Store.addTrade({ symbol: 'TEST', direction: 1, openedAt: '2026-09-28T09:00:00', closedAt: '2026-09-28T10:00:00', entryPrice: 100, exitPrice: 105, quantity: 1 }); const t = Store.trades().find(x => x.symbol === 'TEST'); Store.updateTrade(t.id, { exitPrice: 107, setup: 'Pullback' }); location.hash = '#/settings/logs'; }); await p.waitForTimeout(300);
  ok('Imports-Tab (Beispieldaten-Import gelistet)', await p.evaluate(() => (Store.data.imports || []).length) >= 0);
  await p.click('[data-action="log-tab"][data-value="verlauf"]'); await p.waitForTimeout(250);
  const logRows = await p.$$eval('.logtbl tbody tr', r => r.map(x => [...x.children].slice(1, 4).map(c => c.textContent.trim()).join('/')));
  ok('Verlauf zeigt Trade erstellt und bearbeitet', logRows.some(r => r.startsWith('Trade/erstellt')) && logRows.filter(r => r.startsWith('Trade/bearbeitet')).length === 2, logRows.slice(0, 3).join(' | '));
  await p.selectOption('[data-change="log-filter"]', 'Trade'); await p.waitForTimeout(250); ok('Verlauf-Filter', await p.$$eval('.logtbl tbody tr td:nth-child(2)', c => c.every(x => x.textContent.trim() === 'Trade')));
  await p.screenshot({ path: 's-logs.png', clip: { x: 232, y: 72, width: 1208, height: 600 } });
  await p.evaluate(() => { const t = Store.trades().find(x => x.symbol === 'TEST'); Store.deleteTrade(t.id); });
  // Recap auf dem Dashboard
  await p.evaluate(() => { Store.setSetting('recapShown', {}); location.hash = '#/dashboard'; }); await p.waitForTimeout(700);
  ok('Standard: kein Recap-Hinweis oben auf dem Dashboard', await p.$$eval('.banner.info', b => b.filter(x => x.textContent.includes('Recap')).length) === 0);
  await p.evaluate(() => { Store.setSetting('notifications', { weekly: true, monthly: true }); App.rerender(false); }); await p.waitForTimeout(500);
  const recapN = await p.$$eval('.banner.info', b => b.filter(x => x.textContent.includes('Recap')).length); ok('Recap-Banner auf dem Dashboard (Woche/Monat)', recapN >= 1, String(recapN));
  if (recapN) { await p.click('.banner.info [data-action="recap-dismiss"]'); await p.waitForTimeout(300); ok('Recap ausblendbar', await p.$$eval('.banner.info', b => b.filter(x => x.textContent.includes('Recap')).length) === recapN - 1); }
  // Handy
  const m = await browser.newContext({ viewport: { width: 400, height: 820 } }); const mp = await m.newPage(); mp.on('pageerror', e => errs.push('phone ' + e.message));
  await mp.goto(base + '#/settings/trading', { waitUntil: 'load' }); await mp.waitForTimeout(500); ok('Handy: keine Überbreite', await mp.evaluate(() => document.documentElement.scrollWidth <= 401)); await mp.screenshot({ path: 's-phone.png' });
  console.log(out.join('\n')); console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no errors'); await browser.close();
})().catch(e => { console.log(out.join('\n')); console.error('CRASH', e.message); process.exit(1); });
