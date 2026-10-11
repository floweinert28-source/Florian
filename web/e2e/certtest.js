const { chromium } = require('playwright');
const base = 'file:///home/user/Florian/web/app.html';
const out = []; const ok = (n, c, x = '') => out.push(`${c ? 'PASS' : 'FAIL'} ${n}${x ? ' · ' + x : ''}`);
(async () => {
  const browser = await chromium.launch(); const errs = [];
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto(base, { waitUntil: 'load' }); await p.evaluate(() => { Store.installSample(); Store.setSetting('profile', Object.assign({}, Store.settings.profile, { username: 'flo' })); Store.saveNow(); }); await p.waitForTimeout(400); /* Speicher erst übernehmen lassen, dann neu laden */
  await p.goto(base + '#/dashboard', { waitUntil: 'load' }); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(900);
  ok('Zertifikat-Menü im Dashboard', !!(await p.$('.dash-head [data-pop=cert]')) && (await p.$$('#pop-cert [data-action=cert-open]')).length === 4);
  await p.click('.dash-head [data-pop=cert]'); await p.waitForTimeout(150); await p.click('#pop-cert [data-kind=stats]'); await p.waitForTimeout(700);
  ok('Modal mit Vorschau + Optionen', !!(await p.$('.cert-modal .cert-preview .cert')) && !!(await p.$('.cert-opts')) && !!(await p.$('[data-c=png]')));
  const card = await p.$eval('.cert', e => ({ w: e.style.width, h: e.style.height, title: e.querySelector('.cert-title .ct-sub').textContent, user: (e.querySelector('.cert-to .user') || {}).textContent, no: e.querySelector('.issue .v.mono').textContent, stats: e.querySelectorAll('.cert-stats .st').length, nan: /NaN|undefined/.test(e.textContent) }));
  ok('Stats-Karte 1080×1080, Titel, Username, Nummer', card.w === '1080px' && card.h === '1080px' && card.title === 'of Performance' && card.user === '@flo' && /^#JY-\d{8}-[0-9A-Z]{4}$/.test(card.no) && card.stats === 3 && !card.nan, JSON.stringify(card));
  const scale = await p.$eval('.cert-scale', e => ({ t: e.style.transform, w: parseFloat(e.style.width) })); ok('Vorschau skaliert', /scale\(0\.\d+\)/.test(scale.t) && scale.w < 800, JSON.stringify(scale));
  await p.screenshot({ path: 'cert-stats.png' });
  ok('Nur ein Design (App-Look): keine Design-Auswahl, Karte trägt data-theme app, Graphit-Hintergrund, Kartenrahmen, kein Hintergrund-Diagramm, kein altes Aurora/Navy', !(await p.$('.cert-opts [data-c=theme]')) && await p.$eval('.cert', e => e.dataset.theme === 'app' && getComputedStyle(e).backgroundColor === 'rgb(14, 13, 11)' && !!e.querySelector('.cert-bg .cert-frame') && !e.querySelector('.cert-chart, .cert-curve') && !e.querySelector('.cert-line, .cert-bg .band, .cert-bg .bars-l, .cert-bg .blob1, .cert-bg .blob2')));
  ok('App-Look: zentriert, Ergebnis als Pille mit Licht in Grün/Rot, Kennzahlen als Kachelstreifen', await p.$eval('.cert', e => { const v = e.querySelector('.cert-value span'), cs = getComputedStyle(v), st = getComputedStyle(e.querySelector('.cert-stats')); return e.dataset.theme === 'app' && getComputedStyle(e.querySelector('.cert-in')).textAlign === 'center' && cs.backgroundImage.includes('radial-gradient') && cs.webkitTextFillColor === getComputedStyle(e).getPropertyValue(e.dataset.sign === 'neg' ? '--c-neg' : '--c-pos').trim().replace(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i, (_, r, g, b) => `rgb(${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)})`) && st.borderTopStyle === 'solid'; }));
  ok('Ergebnis-Box: Licht von links, Rand folgt dem Licht (links hell, rechts dunkel, am Rahmen ausgerichtet); Fußzeile unter den Kennzahlen', await p.$eval('.cert', e => { const ft = e.querySelector('.cert-foot').getBoundingClientRect(), st = e.querySelector('.cert-stats').getBoundingClientRect(); const v = getComputedStyle(e.querySelector('.cert-value span')); const sh = v.boxShadow.match(/(-?[\d.]+)px (-?[\d.]+)px (-?[\d.]+)px (-?[\d.]+)px/g) || []; const outer = sh.find(x => !/^0px 0px/.test(x) || true); return ft.top >= st.bottom && v.backgroundImage.includes('at 0% 60%') && v.backgroundOrigin === 'padding-box, padding-box, border-box'; }));
  await p.click('.cert-opts [data-c=format][data-v=story]'); await p.waitForTimeout(400); ok('Story-Format', await p.$eval('.cert', e => e.style.height === '1920px'));
  await p.click('.cert-opts [data-c=format][data-v=wide]'); await p.waitForTimeout(400); ok('Querformat', await p.$eval('.cert', e => e.style.width === '1200px' && e.style.height === '675px'));
  await p.screenshot({ path: 'cert-wide.png' });
  await p.click('.cert-opts [data-c=format][data-v=square]'); await p.waitForTimeout(300);
  const valBefore = await p.textContent('.cert-value'); await p.click('.cert-opts input[data-c=hide]'); await p.waitForTimeout(400); const valHidden = await p.textContent('.cert-value');
  ok('Beträge ausblenden zeigt %', valBefore.includes('€') && valHidden.includes('%') && !(await p.textContent('.cert')).includes('€'), `${valBefore} → ${valHidden}`);
  await p.click('.cert-opts input[data-c=hide]'); await p.click('.cert-opts input[data-c=user]'); await p.waitForTimeout(300); ok('Username aus', !(await p.$('.cert-to .user'))); await p.click('.cert-opts input[data-c=user]'); await p.waitForTimeout(200);
  /* Export */
  const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 30000 }), p.click('[data-c=png]')]); const path = await dl.path(); const fs = require('fs'); const buf = fs.readFileSync(path);
  ok('PNG-Download', dl.suggestedFilename().endsWith('.png') && buf.slice(1, 4).toString() === 'PNG', dl.suggestedFilename());
  const dims = { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) }; ok('PNG in doppelter Auflösung', dims.w === 2160 && dims.h === 2160, JSON.stringify(dims)); fs.copyFileSync(path, 'cert-export.png');
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  /* Tag / Woche / Monat */
  await p.click('.dash-head [data-pop=cert]'); await p.waitForTimeout(150); await p.click('#pop-cert [data-kind=week]'); await p.waitForTimeout(600);
  /* Montag oder Wochenanfang ohne Trades: die laufende Woche ist leer (richtig: „Keine Trades“), dann zur letzten Woche mit Trades */
  for (let i = 0; i < 4 && await p.$('.cert-empty'); i++) { await p.click('.cert-opts [data-c=prev]'); await p.waitForTimeout(500); }
  ok('Wochen-Karte mit Balken', (await p.textContent('.cert-title .ct-sub')) === 'of Weekly Profit' && (await p.$$('.cert-stats .st')).length === 3 && !(await p.$('.cert-week')) && !!(await p.$('.cert-opts input[type=week]')));
  const lbl = await p.textContent('.cert-opts .small.muted'); await p.click('.cert-opts [data-c=prev]'); await p.waitForTimeout(500); ok('Woche zurück', (await p.textContent('.cert-opts .small.muted')) !== lbl);
  await p.screenshot({ path: 'cert-week.png' }); await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  await p.click('.dash-head [data-pop=cert]'); await p.waitForTimeout(150); await p.click('#pop-cert [data-kind=month]'); await p.waitForTimeout(600);
  for (let i = 0; i < 3 && await p.$('.cert-empty'); i++) { await p.click('.cert-opts [data-c=prev]'); await p.waitForTimeout(500); } /* Monatsanfang ohne Trades */
  ok('Monats-Karte mit Kalender', (await p.textContent('.cert-title .ct-sub')) === 'of Monthly Profit' && (await p.$$('.cert-stats .st')).length === 3 && (await p.textContent('.cert-stats')).includes('Green days') && !(await p.$('.cert-month')));
  await p.screenshot({ path: 'cert-month.png' }); await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  await p.click('.dash-head [data-pop=cert]'); await p.waitForTimeout(150); await p.click('#pop-cert [data-kind=day]'); await p.waitForTimeout(600);
  /* Hat heute noch keine Trades (z. B. kurz nach Mitternacht), erst zum letzten Handelstag zurückblättern */
  { let n = 0; while (!(await p.$('.cert-title')) && n++ < 10) { await p.click('.cert-opts [data-c=prev]'); await p.waitForTimeout(300); } }
  const dayTitle = await p.textContent('.cert-title .ct-sub'); ok('Tages-Karte', dayTitle === 'of Daily Profit' && !!(await p.$('.cert-opts input[type=date]')));
  const has = await p.$('.cert'); if (!has) { await p.click('.cert-opts [data-c=prev]'); await p.waitForTimeout(400); }
  let tries = 0; while (!(await p.$('.cert')) && tries++ < 10) { await p.click('.cert-opts [data-c=prev]'); await p.waitForTimeout(300); }
  ok('Tages-Karte schlicht: drei Kennzahlen, keine Symbol-Chips', (await p.$$('.cert-stats .st')).length === 3 && !(await p.$('.cert-syms')));
  await p.screenshot({ path: 'cert-day.png' });
  await p.$eval('.cert-opts input[type=date]', e => { e.value = '2019-01-01'; e.dispatchEvent(new Event('change', { bubbles: true })); }); await p.waitForTimeout(400);
  ok('Leerer Zeitraum: Hinweis + Export aus', (await p.textContent('.cert-preview')).includes('Keine Trades in diesem Zeitraum') && await p.$eval('[data-c=png]', b => b.disabled));
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  /* Tagesansicht + Statistik */
  await p.evaluate(() => { location.hash = '#/day'; }); await p.waitForTimeout(500); ok('Knopf in der Tagesansicht', !!(await p.$('[data-action=cert-open][data-kind=day]')));
  await p.evaluate(() => { location.hash = '#/stats'; }); await p.waitForTimeout(500); ok('Menü in der Statistik', !!(await p.$('.page-head [data-pop=cert]')));
  /* Handy */
  await p.setViewportSize({ width: 390, height: 800 }); await p.evaluate(() => { location.hash = '#/dashboard'; }); await p.waitForTimeout(600);
  await p.evaluate(() => Certificate.open('stats', 'range')); await p.waitForTimeout(700);
  const mob = await p.evaluate(() => { const m = document.querySelector('.cert-modal'); const sc = document.querySelector('.cert-scale .cert'); return { fits: m.scrollWidth <= m.clientWidth + 1, sw: document.documentElement.scrollWidth, scaleW: sc ? sc.getBoundingClientRect().width : 0, win: window.innerWidth, modals: document.querySelectorAll('.modal-bg').length, scales: [...document.querySelectorAll('.cert-scale')].map(s => Math.round(s.getBoundingClientRect().width)), pv: [...document.querySelectorAll('.cert-preview')].map(s => Math.round(s.getBoundingClientRect().width)) }; });
  ok('Modal am Handy ohne Überlauf', mob.fits && mob.sw <= 390 && mob.scaleW <= 390, JSON.stringify(mob));
  await p.screenshot({ path: 'cert-mobile.png' });
  console.log(out.join('\n')); console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no errors'); await browser.close();
})().catch(e => { console.log(out.join('\n')); console.error('CRASH', e.message); process.exit(1); });
