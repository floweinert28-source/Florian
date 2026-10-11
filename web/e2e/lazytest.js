/* Sprachen: Wörterbuch wird nur bei Bedarf geladen; nach Neuladen ist die erste Ansicht sofort übersetzt */
const { chromium } = require('playwright');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log('PASS ' + m); } else { fail++; console.log('FAIL ' + m); } };
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const reqs = []; p.on('request', r => { const m = /lang\/([a-z]+)\.js/.exec(r.url()); if (m) reqs.push(m[1]); });
  const U = 'file:///home/user/Florian/web/app.html';
  await p.goto(U + '#/settings/sprache', { waitUntil: 'load' }); await p.waitForTimeout(600);
  ok(reqs.length === 0, 'Deutsch: kein Wörterbuch geladen (' + reqs.join(',') + ')');
  await p.click('.lang-card[data-value=en]'); await p.waitForTimeout(700);
  ok(reqs.join(',') === 'en', 'Englisch gewählt: nur en.js geladen (' + reqs.join(',') + ')');
  ok(await p.evaluate(() => [...document.querySelectorAll('.sidebar .nav a')].some(a => /Statistics/.test(a.textContent))), 'Navigation nach dem Nachladen englisch');
  ok(await p.evaluate(() => /^Settings/.test(document.title)), 'Fenstertitel nach dem Nachladen englisch: ' + await p.evaluate(() => document.title));
  /* Neu laden: erste Ansicht sofort englisch */
  await p.goto('about:blank'); reqs.length = 0; await p.goto(U + '#/dashboard', { waitUntil: 'domcontentloaded' });
  const first = await p.evaluate(() => ({ nav: [...document.querySelectorAll('.sidebar .nav a')].map(a => a.textContent.trim()).join('|'), title: document.title, dict: !!I18N.dicts.en }));
  ok(first.dict && /Statistics/.test(first.nav) && !/Statistiken/.test(first.nav), 'Nach Neuladen sofort englisch (ohne deutsches Aufblitzen): ' + first.nav.slice(0, 60));
  ok(/^Dashboard/.test(first.title), 'Fenstertitel beim Start: ' + first.title);
  await p.waitForTimeout(500); ok(reqs.join(',') === 'en', 'Beim Start nur en.js geladen (' + reqs.join(',') + ')');
  /* Wechsel zu Chinesisch zur Laufzeit */
  await p.evaluate(() => { location.hash = '#/settings/sprache'; }); await p.waitForTimeout(600); await p.click('.lang-card[data-value=zh]'); await p.waitForTimeout(700);
  ok(await p.evaluate(() => [...document.querySelectorAll('.sidebar .nav a')].some(a => /统计/.test(a.textContent)) && document.documentElement.lang === 'zh-Hans'), 'Chinesisch nachgeladen und aktiv');
  await p.click('.lang-card[data-value=de]'); await p.waitForTimeout(500);
  ok(await p.evaluate(() => [...document.querySelectorAll('.sidebar .nav a')].some(a => /Statistiken/.test(a.textContent)) && /^Einstellungen/.test(document.title)), 'Zurück auf Deutsch');
  reqs.length = 0; await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(400); ok(reqs.length === 0, 'Deutsch nach Neuladen: kein Wörterbuch (' + reqs.join(',') + ')');
  ok(!errs.length, 'keine Fehler ' + errs.join(' | ')); console.log(`${pass}/${pass + fail} bestanden`); await b.close(); process.exit(fail ? 1 : 0); })();
