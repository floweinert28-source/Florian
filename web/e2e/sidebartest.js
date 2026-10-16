/* Seitenleiste ohne Begrüßung: Logo, eine Trennlinie, Navigation; dunkel/hell, Mini-Modus, Handy; Login-Logik */
const { chromium } = require('playwright');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log('PASS ' + m); } else { fail++; console.log('FAIL ' + m); } };
(async () => { const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 }); p.on('pageerror', e => errs.push(e.message)); try { await require('./localfonts.js')(p); } catch (e) {}
  await p.goto('file:///home/user/Florian/web/app.html#/dashboard', { waitUntil: 'load' }); await p.waitForTimeout(900);
  /* Name setzen wie über das Profil */
  await p.evaluate(() => { Store.data.settings.profile = { firstName: 'Florian' }; Store.data.settings.name = 'Florian'; Store.save(); App.rerender(); }); await p.waitForTimeout(300);
  const t = await p.evaluate(() => ({ hello: !!document.querySelector('.sb-hello, .sb-welcome, .sb-last'), txt: document.getElementById('sidebar').innerText, sub: !!document.querySelector('.brand .sub'),  seps: document.querySelectorAll('#sidebar .sb-sep').length, over: document.getElementById('sidebar').scrollHeight > document.getElementById('sidebar').clientHeight }));
  console.log(JSON.stringify(t));
  ok(!t.hello && !/Willkommen|Letzter Login/.test(t.txt) && t.seps === 1 && !t.sub && await p.evaluate(() => { const m = document.querySelector('#rail .rail-logo svg'), r = document.getElementById('rail').getBoundingClientRect(), lr = m && m.getBoundingClientRect(); return !!m && lr.height >= 24 && lr.top - r.top < 40 && document.querySelector('#rail .rail-logo').getAttribute('aria-label') === 'Journalyst'; }), 'Keine Begrüßung, kein letzter Login, Logo oben in der Bereichsleiste (ohne Schriftzug), eine Trennlinie');
  ok(await p.evaluate(() => { const b = document.querySelector('#sidebar .sb-new [data-action=new-trade]'), d = document.querySelector('#sidebar .nav a[href="#/dashboard"]'); return !!b && b.getBoundingClientRect().bottom < d.getBoundingClientRect().top && getComputedStyle(document.querySelector('.dash-head [data-action=new-trade]')).display === 'none'; }), 'Trade loggen oben in der Seitenleiste über Dashboard, nicht doppelt in der Kopfreihe');
  await p.setViewportSize({ width: 1440, height: 1000 }); await p.waitForTimeout(300); ok(await p.evaluate(() => { const s = document.getElementById('sidebar'); return s.scrollHeight <= s.clientHeight; }), 'Seitenleiste passt bei 1440×1000 ohne Scrollen'); await p.setViewportSize({ width: 1440, height: 900 }); await p.waitForTimeout(200);
  await p.screenshot({ path: 'langshots/sb-dark.png', clip: { x: 0, y: 0, width: 300, height: 900 } });
  await p.evaluate(() => { Store.setSetting('theme', 'light'); Theme.apply(Store.settings); App.rerender(); }); await p.waitForTimeout(300);
  await p.screenshot({ path: 'langshots/sb-light.png', clip: { x: 0, y: 0, width: 300, height: 900 } });
  await p.evaluate(() => { Store.setSetting('theme', 'dark'); Theme.apply(Store.settings); App.rerender(); }); await p.waitForTimeout(300);
  /* Aufbau wie Vorlage: Bereichsleiste als abgerundete Fläche mit schmalem Schlitz, Seitenleiste über die volle Höhe, das große Fenster als abgerundete Fläche mit schmalem Rand */
  const lay = () => p.evaluate(() => { const R = e => e.getBoundingClientRect(); const rl = document.getElementById('rail'), sb = document.getElementById('sidebar'), mn = document.getElementById('main'); return { rail: getComputedStyle(rl).display, railTop: Math.round(R(rl).top), railL: Math.round(R(rl).left), railBot: Math.round(innerHeight - R(rl).bottom), railR: parseFloat(getComputedStyle(rl).borderTopRightRadius), sbTop: Math.round(R(sb).top), sbL: Math.round(R(sb).left), mainTop: Math.round(R(mn).top), mainL: Math.round(R(mn).left), sbR: Math.round(R(sb).right), radius: parseFloat(getComputedStyle(mn).borderTopLeftRadius), sbBg: getComputedStyle(sb).backgroundColor, shellBg: getComputedStyle(document.querySelector('.shell')).backgroundColor, railRight: Math.round(R(rl).right), railBg: getComputedStyle(rl).backgroundColor, sbRadius: parseFloat(getComputedStyle(sb).borderTopLeftRadius), ...(() => { const tb = document.querySelector('.topbar'), ft = document.getElementById('frame-top'); return { topH: Math.round(R(tb).height), topBg: getComputedStyle(tb).backgroundColor, frameBg: getComputedStyle(ft).backgroundColor, frameH: Math.round(R(ft).height) }; })() }; });
  const c0 = await lay();
  ok(c0.rail !== 'none' && c0.railTop === 0 && c0.railL === 0 && c0.railBot === 0 && c0.railR === 0 && c0.sbTop === c0.topH - 1 && c0.sbL === c0.railRight && c0.sbRadius >= 10 && c0.mainTop === 0 && c0.mainL === c0.sbR && c0.topBg === c0.railBg && c0.shellBg === c0.railBg && c0.frameBg === c0.railBg && c0.frameH === c0.topH - 1 && Math.abs((c0.topH - 1) - (c0.railRight - c0.railL)) <= 1 && await p.evaluate(() => getComputedStyle(document.querySelector('#sidebar .brand')).display === 'none'), 'Aufbau „Eine Fläche“: Leiste links und oben als „L“ ohne Rahmen (oben so hoch wie links breit, mit Seitentitel), darunter Seitenleiste mit runder Ecke innen und die Seite, keine zweite Kopfzeile ' + JSON.stringify(c0));
  const mid = s => p.evaluate(s => { const r = document.querySelector(s).getBoundingClientRect(); return Math.round(r.top + r.height / 2); }, s);
  const al = [await mid('.sb-new .btn'), await mid('.dash-head'), await mid('.rail-logo'), await mid('.topbar h1')];
  ok(await p.evaluate(() => { const g = e => getComputedStyle(document.querySelector(e)).backgroundColor; return g('.main') === g('.rail') && g('.card, .tile') !== g('.rail'); }), 'Fensterhintergrund in der Farbe der Leiste ganz links, Widgets heller');
  const ln = await p.evaluate(() => { const c = s => { const r = document.querySelector(s).getBoundingClientRect(); return r.top + r.height / 2; }; const ri = [...document.querySelectorAll('.rail-item .ri')]; const m = e => { const r = e.getBoundingClientRect(); return r.top + r.height / 2; }; return [m(ri[0]), c('.sidebar .nav a'), c('.dash-head'), m(ri[ri.length - 1]), c('.sb-user'), c('.topbar .avatar'), c('.rail-logo')].map(Math.round); });
  ok(Math.abs(ln[0] - ln[1]) <= 2 && Math.abs(ln[3] - ln[4]) <= 2 && Math.abs(ln[5] - ln[6]) <= 1 && Math.abs(ln[5] - al[3]) <= 1, 'Saubere Linien: erstes Symbol links = Dashboard, letztes Symbol = Konto-Karte, Logo = Seitentitel = Profilbild in der Leiste oben ' + JSON.stringify(ln));
  ok(Math.abs(al[0] - al[1]) <= 1 && Math.abs(al[2] - al[3]) <= 1 && await p.evaluate(() => document.querySelector('.sb-new .btn').getBoundingClientRect().height >= 39), 'Trade loggen (alte Größe) auf einer Linie mit der Filterzeile, Logo auf einer Linie mit dem Seitentitel ' + JSON.stringify(al));
  await p.click('.topbar .rail-btn'); await p.waitForTimeout(300);
  const c1 = await lay();
  ok(c1.rail === 'none' && c1.sbL === 0 && await p.evaluate(() => Store.settings.railHidden === true && document.querySelector('.topbar .rail-btn').getAttribute('aria-pressed') === 'true'), 'Knopf oben links in der Seite blendet die Bereichsleiste aus ' + JSON.stringify(c1));
  await p.evaluate(() => { location.hash = '#/news'; }); await p.waitForTimeout(500);
  ok(await p.evaluate(() => { const b = document.querySelector('.topbar .rail-btn'); return !!b && b.getBoundingClientRect().width > 0 && Math.round(document.getElementById('main').getBoundingClientRect().left) <= 12; }), 'Knopf auch in anderen Bereichen, Vollbild ohne Leiste');
  await p.click('.topbar .rail-btn'); await p.waitForTimeout(300);
  ok((await lay()).rail !== 'none' && await p.evaluate(() => !Store.settings.railHidden), 'Zweiter Klick: Bereichsleiste wieder da');
  await p.evaluate(() => { location.hash = '#/dashboard'; }); await p.waitForTimeout(500);
  ok(await p.evaluate(() => getComputedStyle(document.querySelector('.topbar .menu-btn')).display === 'none' && getComputedStyle(document.querySelector('.topbar .avatar')).display !== 'none'), 'Kopfzeile am PC: Knopf für die Bereichsleiste statt Menü-Symbol, Profilbild rechts');

  /* Coach steht als Bereich in der Leiste ganz links, nicht in der Navigation */
  ok(await p.evaluate(() => !document.querySelector('.sb-rail') && !document.querySelector('.sidebar .nav a[href="#/coach"]') && document.querySelectorAll('.sidebar .nav a').length === 9 && !document.querySelector('.sidebar .nav a[href="#/news"]') && ['prop', 'mentor', 'news', 'backtest', 'coach', 'affiliate', 'contact'].every(k => !!document.querySelector('.rail-item[data-rail=' + k + ']')) && !document.querySelector('.sidebar .nav a[href="#/replay"]') && !document.querySelector('.sidebar .nav a[href="#/affiliate"]')), 'Navigation ohne Coach, Affiliate und (zurückgestelltes) Blind-Replay, keine Extra-Leiste (9 Einträge im Journal inkl. Coupon-Codes; Prop Firms, Mentor, News und Backtesting als Bereiche links) (inkl. Coupon-Codes und News)');
  await p.evaluate(() => { location.hash = '#/replay'; }); await p.waitForTimeout(400);
  ok(await p.evaluate(() => App.state.route === 'dashboard' && !document.querySelector('.replay-page, [data-action=replay-start]')), 'Zurückgestelltes Blind-Replay: #/replay führt zum Dashboard');
  ok(await p.evaluate(() => !document.querySelector('#pop-user .item[href="#/coach"], #pop-user .item[href="#/affiliate"]') && !!document.querySelector('.rail-item[data-rail=coach]') && !!document.querySelector('.rail-item[data-rail=affiliate]')), 'Coach und Affiliate nur in der Leiste ganz links, nicht im Konto-Menü');
  await p.evaluate(() => { App.navDot('coach', () => '1 neue Aufgabe'); location.hash = '#/dashboard'; }); await p.waitForTimeout(500); /* Coach ist ein Bereich im Vollbild: Hinweis im Journal an der Leiste prüfen */
  ok(await p.evaluate(() => { const d = document.querySelector('.rail-item[data-rail=coach] .rail-dot'); const r = d && d.getBoundingClientRect(); return !!r && r.width > 0 && d.title === '1 neue Aufgabe' && !document.querySelector('.sb-user .sb-av-dot'); }), 'Neue Aufgabe: Hinweis am Coach-Symbol in der Leiste, nicht am Profilbild');
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
  /* Bereichsleiste links: Journal aktiv, Backtesting wechselt Seite und Navigation, Journal führt zur letzten Journal-Seite zurück */
  await p.goto('file:///home/user/Florian/web/app.html#/notebook', { waitUntil: 'load' }); await p.waitForTimeout(700);
  const r0 = await p.evaluate(() => { const rl = document.getElementById('rail'), sb = document.getElementById('sidebar'); return { n: rl ? rl.querySelectorAll('.rail-item').length : 0, act: (rl.querySelector('.rail-item.active') || {}).dataset?.rail, left: Math.round(sb.getBoundingClientRect().left) === Math.round(rl.getBoundingClientRect().right) }; });
  ok(r0.n === 8 && r0.act === 'journal' && r0.left, 'Bereichsleiste: acht Bereiche (drei unten), Journal aktiv, direkt links neben der Seitenleiste ' + JSON.stringify(r0));
  await p.click('.rail-item[data-rail=backtest]'); await p.waitForTimeout(600);
  const r1 = await p.evaluate(() => ({ h: location.hash, nav: [...document.querySelectorAll('#sidebar .nav a')].map(a => a.textContent.trim()).join(','), act: document.querySelector('.rail-item.active').dataset.rail, title: document.querySelector('.topbar h1').textContent }));
  const full = await p.evaluate(() => ({ off: document.documentElement.classList.contains('sb-off'), sb: getComputedStyle(document.getElementById('sidebar')).display, left: Math.round(document.getElementById('main').getBoundingClientRect().left), rail: Math.round(document.getElementById('rail').getBoundingClientRect().right) }));
  ok(r1.h === '#/backtesting' && r1.act === 'backtest' && r1.title === 'Backtesting' && full.off && full.sb === 'none' && full.left - full.rail >= 0 && full.left - full.rail <= 12, 'Backtesting: eigene Seite im Vollbild ohne Seitenleiste ' + JSON.stringify({ r1, full }));
  const rb = await p.evaluate(() => { const r = k => document.querySelector('.rail-item[data-rail=' + k + ']').getBoundingClientRect(); return { gap: r('coach').top - r('backtest').bottom, last: Math.round(innerHeight - r('contact').bottom) }; });
  ok(rb.gap > 100 && rb.last < 40, 'Leiste: Coach, Affiliate und Kontakt unten abgesetzt ' + JSON.stringify(rb));
  await p.click('.rail-item[data-rail=contact]'); await p.waitForTimeout(600);
  ok(await p.evaluate(() => location.hash === '#/contact' && ['Kontakt', 'Contact us'].includes(document.querySelector('.topbar h1').textContent) && !!document.querySelector('#ct-text') && document.querySelectorAll('[data-action=contact-topic]').length === 3), 'Kontakt: eigene Seite mit Thema und Nachricht');
  await p.click('.rail-item[data-rail=journal]'); await p.waitForTimeout(600);
  ok(await p.evaluate(() => location.hash === '#/notebook' && document.querySelector('.rail-item.active').dataset.rail === 'journal' && !!document.querySelector('#sidebar .nav a[href="#/trades"]')), 'Journal: zurück zur zuletzt offenen Journal-Seite mit voller Navigation');
  /* Handy: Menü öffnen */
  const m = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }); m.on('pageerror', e => errs.push(e.message)); try { await require('./localfonts.js')(m); } catch (e) {}
  await m.goto('file:///home/user/Florian/web/app.html#/dashboard', { waitUntil: 'load' }); await m.waitForTimeout(800);
  await m.evaluate(() => { const bt = document.querySelector('.menu-btn'); if (bt) bt.click(); }); await m.waitForTimeout(500);
  ok(await m.evaluate(() => { const s = document.getElementById('sidebar'); return s.classList.contains('open') && !s.querySelector('.sb-hello') && [...s.querySelectorAll('*')].every(e => e.getBoundingClientRect().right <= s.getBoundingClientRect().right + 1); }), 'Handy: Menü ohne Begrüßung, nichts ragt heraus');
  ok(await m.evaluate(() => { const rl = document.getElementById('rail'), sb = document.getElementById('sidebar'); const r = rl.getBoundingClientRect(), q = sb.getBoundingClientRect(); return rl.classList.contains('open') && r.left >= 0 && Math.abs(q.left - r.right) < 1 && q.right <= innerWidth; }), 'Handy: Bereichsleiste schiebt mit der Seitenleiste herein, beide im Bild');
  await m.screenshot({ path: 'langshots/sb-mob.png' });
  /* PC-Ansicht auf dem Handy: Konto-Menü → PC-Ansicht zeigt die App als verkleinertes PC-Fenster (1440 × 900), Knopf zurück */
  await m.click('.sb-user'); await m.waitForTimeout(300);
  await Promise.all([m.waitForNavigation().catch(() => {}), m.click('.pcv-item')]); await m.waitForTimeout(2500);
  const inner = m.frames().find(f => f !== m.mainFrame());
  const pv = inner ? await inner.evaluate(() => ({ w: innerWidth, h: innerHeight, rail: getComputedStyle(document.getElementById('rail')).display, frame: getComputedStyle(document.getElementById('frame-top')).display })) : null;
  const outer = await m.evaluate(() => { const f = document.querySelector('.pcv-frame').getBoundingClientRect(); return { W: PCView.W, H: PCView.H, turned: document.querySelector('.pcv').dataset.turned, fw: Math.round(f.width), fh: Math.round(f.height), vw: innerWidth, vh: innerHeight, links: document.querySelectorAll('link[rel=stylesheet]').length, app: !!document.querySelector('#sidebar .nav'), exit: !!document.querySelector('.pcv-exit') }; });
  ok(!!pv && pv.w === outer.W && pv.h === outer.H && pv.rail !== 'none' && pv.frame !== 'none' && outer.exit && !outer.app && outer.links > 0 && outer.turned === '1' && outer.fh > outer.fw && outer.fh <= outer.vh && outer.fw <= outer.vw, 'Handy: PC-Ansicht zeigt das PC-Layout in Originalgröße, im Hochformat quer gedreht ' + JSON.stringify({ pv, outer }));
  await m.click('.pcv-rot'); await m.waitForTimeout(300);
  ok(await m.evaluate(() => { const f = document.querySelector('.pcv-frame').getBoundingClientRect(); return document.querySelector('.pcv').dataset.turned === '0' && Math.abs(f.width - innerWidth) <= 2 && localStorage.getItem('jy_pcview_rot') === '0'; }), 'Handy: „Drehen“ stellt die PC-Ansicht aufrecht (volle Breite) und merkt es sich');
  const zs = []; for (let i = 0; i < 4; i++) { zs.push(await m.evaluate(() => { const sc = document.querySelector('.pcv-scroll'); return { z: +document.querySelector('.pcv').dataset.zoom, over: sc.scrollWidth > sc.clientWidth + 1 }; })); if (i < 3) { await m.click('.pcv-zin'); await m.waitForTimeout(150); } }
  ok(zs[0].z === 23 && !zs[0].over && zs[3].z === 100 && zs[3].over && await m.evaluate(() => /user-scalable=no/.test(document.querySelector('meta[name=viewport]').content) && document.querySelector('.pcv-zin').disabled), 'Handy: Zoom-Stufen statt Zwei-Finger-Zoom (ganz → 100 %, dann verschiebbar) ' + JSON.stringify(zs));
  await m.evaluate(() => localStorage.removeItem('jy_pcview_rot'));
  await Promise.all([m.waitForNavigation().catch(() => {}), m.click('.pcv-exit')]); await m.waitForTimeout(1200);
  ok(await m.evaluate(() => !document.querySelector('.pcv') && !!document.querySelector('#sidebar .nav') && !localStorage.getItem('jy_pcview')), 'Handy: zurück zur Handy-Ansicht');
  ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
  console.log(`${pass}/${pass + fail} bestanden`); await b.close(); process.exit(fail ? 1 : 0); })();
