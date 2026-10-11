const { chromium } = require('playwright'); const base = 'file:///home/user/Florian/web/app.html';
let pass = 0, fail = 0; const ok = (c, n) => { c ? pass++ : fail++; console.log(`${c ? 'PASS' : 'FAIL'} ${n}`); };
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(base, { waitUntil: 'load' }); await p.evaluate(() => { Store.installSample(); Store.saveNow(); });
  await p.goto(base + '#/dashboard'); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(600);
  for (const r of ['stats', 'shadow', 'prop', 'trades']) {
    await p.goto(base + '#/' + r); await p.waitForTimeout(500);
    const before = await p.evaluate(() => ({ tb: document.querySelectorAll('#tb-tools > *').length, head: (document.querySelector('.content > .dash-head') || {}).childElementCount }));
    await p.setViewportSize({ width: 900, height: 900 }); await p.waitForTimeout(300); await p.setViewportSize({ width: 1440, height: 900 }); await p.waitForTimeout(300);
    const after = await p.evaluate(() => ({ tb: document.querySelectorAll('#tb-tools > *').length, head: (document.querySelector('.content > .dash-head') || {}).childElementCount }));
    ok(JSON.stringify(before) === JSON.stringify(after) && after.tb === 0, `${r}: nach Dashboard-Besuch und Größenwechsel bleibt die Kopfreihe unverändert · ${JSON.stringify(before)} → ${JSON.stringify(after)}`);
  }
  await p.goto(base + '#/dashboard'); await p.waitForTimeout(500); await p.setViewportSize({ width: 900, height: 900 }); await p.waitForTimeout(300);
  ok(await p.evaluate(() => !!document.querySelector('.dash-head .dh-context')), 'Dashboard 900px: Kontext in der Kopfreihe');
  await p.setViewportSize({ width: 1440, height: 900 }); await p.waitForTimeout(300);
  ok(await p.evaluate(() => !!document.querySelector('#tb-tools .dh-context')), 'Dashboard 1440px: Kontext wieder oben rechts');
  ok(!errs.length, 'keine Fehler ' + errs.join(' | ')); console.log(`${pass}/${pass + fail} bestanden`); await b.close(); process.exit(fail ? 1 : 0); })();
