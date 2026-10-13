/* Sicherung einspielen: erst prüfen und zeigen, dann bestätigen; Zusammenführen meldet nur neue Trades */
const { chromium } = require('playwright'); const fs = require('fs');
const base = 'file:///home/user/Florian/web/app.html';
const out = []; const ok = (n, c, x = '') => out.push(`${c ? 'PASS' : 'FAIL'} ${n}${x ? ' · ' + x : ''}`);
(async () => {
  const browser = await chromium.launch(); const errs = [];
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } }); await require('./localfonts.js')(ctx); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto(base + '#/settings/profil', { waitUntil: 'load' }); await p.waitForTimeout(800);
  const backup = await p.evaluate(() => Store.exportJSON(false)); const n = await p.evaluate(() => Store.trades().length);
  fs.writeFileSync('bk-test.json', typeof backup === 'string' ? backup : JSON.stringify(backup)); fs.writeFileSync('bk-bad.json', '{"hallo": 1}');
  const openDlg = async mode => { await p.evaluate(m => App.actions['import-backup']({ dataset: { mode: m } }), mode); await p.waitForTimeout(300); };
  await openDlg('replace');
  ok('Ersetzen: Knopf erst nach gültiger Datei aktiv', await p.$eval('#bk-go', b => b.disabled));
  ok('Ersetzen: Banner nennt die Anzahl eigener Trades', (await p.textContent('.modal .banner')).includes(String(n)));
  await p.setInputFiles('#bk-file', 'bk-bad.json'); await p.waitForTimeout(300);
  ok('Ungültige Datei: Meldung, Knopf bleibt aus', (await p.$eval('#bk-go', b => b.disabled)) && /keine Journalyst-Sicherung/.test(await p.textContent('#bk-sum')));
  await p.setInputFiles('#bk-file', 'bk-test.json'); await p.waitForTimeout(300);
  const sum = await p.textContent('#bk-sum');
  ok('Gültige Datei: Zusammenfassung mit Trades, Knopf aktiv, noch nichts eingespielt', !(await p.$eval('#bk-go', b => b.disabled)) && sum.includes(`${n} Trades`) && !!(await p.$('.modal')), sum);
  ok('Ersetzen-Knopf rot („Daten ersetzen“)', await p.$eval('#bk-go', b => b.classList.contains('danger') && b.textContent.includes('Daten ersetzen')));
  await p.click('.modal-foot [data-close]'); await p.waitForTimeout(300);
  ok('Abbrechen schließt ohne Änderung', !(await p.$('.modal.open, .modal-wrap.open')) && (await p.evaluate(() => Store.trades().length)) === n);
  await openDlg('merge'); await p.setInputFiles('#bk-file', 'bk-test.json'); await p.waitForTimeout(300); await p.click('#bk-go'); await p.waitForTimeout(600);
  const toast = await p.evaluate(() => [...document.querySelectorAll('.toast')].map(t => t.textContent).join(' | '));
  ok('Zusammenführen derselben Sicherung: „Keine neuen Trades“, Anzahl gleich', /Keine neuen Trades/.test(toast) && (await p.evaluate(() => Store.trades().length)) === n, toast);
  fs.unlinkSync('bk-test.json'); fs.unlinkSync('bk-bad.json');
  console.log(out.join('\n')); console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no errors'); await browser.close();
})().catch(e => { console.log(out.join('\n')); console.error('CRASH', e); process.exit(1); });
