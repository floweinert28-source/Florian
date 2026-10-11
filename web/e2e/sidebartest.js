/* Seitenleiste ohne Begrüßung: Logo, eine Trennlinie, Navigation; dunkel/hell, Mini-Modus, Handy; Login-Logik */
const { chromium } = require('playwright');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log('PASS ' + m); } else { fail++; console.log('FAIL ' + m); } };
(async () => { const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 }); p.on('pageerror', e => errs.push(e.message)); try { await require('./localfonts.js')(p); } catch (e) {}
  await p.goto('file:///home/user/Florian/web/app.html#/dashboard', { waitUntil: 'load' }); await p.waitForTimeout(900);
  /* Name setzen wie über das Profil */
  await p.evaluate(() => { Store.data.settings.profile = { firstName: 'Florian' }; Store.data.settings.name = 'Florian'; Store.save(); App.rerender(); }); await p.waitForTimeout(300);
  const t = await p.evaluate(() => ({ hello: !!document.querySelector('.sb-hello, .sb-welcome, .sb-last'), txt: document.getElementById('sidebar').innerText, sub: document.querySelector('.brand .sub').innerText, seps: document.querySelectorAll('#sidebar .sb-sep').length, over: document.getElementById('sidebar').scrollHeight > document.getElementById('sidebar').clientHeight }));
  console.log(JSON.stringify(t));
  ok(!t.hello && !/Willkommen|Letzter Login/.test(t.txt) && t.seps === 1 && /Trading Journal App/.test(t.sub), 'Keine Begrüßung, kein letzter Login, Untertitel, eine Trennlinie');
  await p.setViewportSize({ width: 1440, height: 1000 }); await p.waitForTimeout(300); ok(await p.evaluate(() => { const s = document.getElementById('sidebar'); return s.scrollHeight <= s.clientHeight; }), 'Seitenleiste passt bei 1440×1000 ohne Scrollen'); await p.setViewportSize({ width: 1440, height: 900 }); await p.waitForTimeout(200);
  await p.screenshot({ path: 'langshots/sb-dark.png', clip: { x: 0, y: 0, width: 300, height: 900 } });
  await p.evaluate(() => { Store.setSetting('theme', 'light'); Theme.apply(Store.settings); App.rerender(); }); await p.waitForTimeout(300);
  await p.screenshot({ path: 'langshots/sb-light.png', clip: { x: 0, y: 0, width: 300, height: 900 } });
  await p.evaluate(() => { Store.setSetting('theme', 'dark'); Theme.apply(Store.settings); Store.setSetting('sidebarMini', true); App.rerender(); }); await p.waitForTimeout(300);
  ok(await p.evaluate(() => getComputedStyle(document.querySelector('.brand .brand-text')).display === 'none'), 'Mini-Modus: Untertitel ausgeblendet');
  await p.screenshot({ path: 'langshots/sb-mini.png', clip: { x: 0, y: 0, width: 120, height: 600 } });
  await p.evaluate(() => { Store.setSetting('sidebarMini', false); location.hash = '#/dashboard'; }); await p.waitForTimeout(500);
  /* Coach steht im Konto-Menü unten, nicht in der Navigation */
  ok(await p.evaluate(() => !document.querySelector('.sb-rail') && !document.querySelector('.sidebar .nav a[href="#/coach"]') && document.querySelectorAll('.sidebar .nav a').length === 12 && !!document.querySelector('.sidebar .nav a[href="#/news"]') && !document.querySelector('.sidebar .nav a[href="#/replay"]') && !document.querySelector('.sidebar .nav a[href="#/affiliate"]')), 'Navigation ohne Coach, Affiliate und (zurückgestelltes) Blind-Replay, keine Extra-Leiste (12 Einträge inkl. Coupon-Codes und News)');
  await p.evaluate(() => { location.hash = '#/replay'; }); await p.waitForTimeout(400);
  ok(await p.evaluate(() => App.state.route === 'dashboard' && !document.querySelector('.replay-page, [data-action=replay-start]')), 'Zurückgestelltes Blind-Replay: #/replay führt zum Dashboard');
  await p.click('.sb-user'); await p.waitForTimeout(300); await p.click('#pop-user .item[href="#/coach"]'); await p.waitForTimeout(500);
  ok(await p.evaluate(() => location.hash === '#/coach' && !document.querySelector('#pop-user.open') && document.querySelector('.sb-user').classList.contains('active') && document.querySelector('#pop-user .item[href="#/coach"]').classList.contains('on')), 'Konto-Menü → Coach: Seite offen, Menü zu, Karte hervorgehoben');
  await p.evaluate(() => { App.navDot('coach', () => '1 neue Aufgabe'); App.renderSidebar(); }); await p.waitForTimeout(200);
  ok(await p.evaluate(() => { const d = document.querySelector('.sb-user .sb-av-dot'); const r = d && d.getBoundingClientRect(); return !!r && r.width > 0 && d.title === '1 neue Aufgabe' && document.querySelector('#pop-user .item[href="#/coach"] .nav-dot').title === '1 neue Aufgabe'; }), 'Neue Aufgabe: Punkt am Profilbild und bei Coach im Menü');
  await p.evaluate(() => { App.navDot('coach', () => null); location.hash = '#/dashboard'; }); await p.waitForTimeout(400);
  /* Englisch */
  await p.evaluate(async () => { Store.setLanguage('en'); I18N.setLang('en'); await new Promise(r => setTimeout(r, 900)); App.rerender(); }); await p.waitForTimeout(400);
  const en = await p.evaluate(() => document.getElementById('sidebar').innerText);
  ok(!/Welcome back|Last login/.test(en) && /Dashboard/.test(en), 'Englisch: keine Begrüßung');
  await p.screenshot({ path: 'langshots/sb-en.png', clip: { x: 0, y: 0, width: 300, height: 420 } });
  /* Login-Logik: Neuladen ändert nichts, nach 31 Minuten Pause beginnt eine neue Sitzung */
  const lg = await p.evaluate(() => { const st = Store.loginInfo(); const t0 = Date.parse(st.loginAt); const a = { login: st.loginAt, prev: st.prevLoginAt };
    Store.touchLogin(t0 + 5 * 60000); const b = { login: st.loginAt, prev: st.prevLoginAt };
    Store.touchLogin(t0 + 5 * 60000 + 31 * 60000); const c = { login: st.loginAt, prev: st.prevLoginAt }; return { a, b, c }; });
  ok(lg.b.login === lg.a.login && lg.b.prev === lg.a.prev, 'Neuladen nach 5 Minuten: gleiche Sitzung');
  ok(lg.c.prev === lg.a.login && lg.c.login !== lg.a.login, 'Nach 31 Minuten Pause: neue Sitzung, letzter Login = Beginn der vorigen');
  await p.evaluate(() => { Store.setLanguage('de'); });
  /* Handy: Menü öffnen */
  const m = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }); m.on('pageerror', e => errs.push(e.message)); try { await require('./localfonts.js')(m); } catch (e) {}
  await m.goto('file:///home/user/Florian/web/app.html#/dashboard', { waitUntil: 'load' }); await m.waitForTimeout(800);
  await m.evaluate(() => { const bt = document.querySelector('.menu-btn'); if (bt) bt.click(); }); await m.waitForTimeout(500);
  ok(await m.evaluate(() => { const s = document.getElementById('sidebar'); return s.classList.contains('open') && !s.querySelector('.sb-hello') && [...s.querySelectorAll('*')].every(e => e.getBoundingClientRect().right <= s.getBoundingClientRect().right + 1); }), 'Handy: Menü ohne Begrüßung, nichts ragt heraus');
  await m.screenshot({ path: 'langshots/sb-mob.png' });
  ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
  console.log(`${pass}/${pass + fail} bestanden`); await b.close(); process.exit(fail ? 1 : 0); })();
