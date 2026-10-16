const { chromium } = require('playwright');
const base = 'file:///home/user/Florian/web/app.html';
const out = []; const ok = (n, c, x = '') => out.push(`${c ? 'PASS' : 'FAIL'} ${n}${x ? ' · ' + x : ''}`);
(async () => {
  const browser = await chromium.launch(); const errs = [];
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto(base + '#/dashboard', { waitUntil: 'load' }); await p.waitForTimeout(60);
  ok('js-motion gesetzt, Variablen lesbar', await p.evaluate(() => document.documentElement.classList.contains('js-motion') && Motion.ms('--dur-2') === 240 && Motion.ms('--dur-3') === 380));
  const early = await p.evaluate(() => [...document.querySelectorAll('#content .rv')].length);
  /* ab dem Ersetzen des Skeletts messen: der load-Zeitpunkt hängt davon ab, wie viele Schrift-Stylesheets nachgeladen werden */
  await p.waitForFunction(() => !document.querySelector('#content .skel'), null, { timeout: 5000 }); await p.waitForTimeout(900);
  const late = await p.evaluate(() => ({ rv: [...document.querySelectorAll('#content .rv')].map(e => Math.round(e.getBoundingClientRect().top)), hidden: [...document.querySelectorAll('#content > *, #content .w, #content .tile')].filter(e => getComputedStyle(e).opacity !== '1' && e.getBoundingClientRect().top < innerHeight * 0.9).length }));
  ok('Dashboard: kein Einblenden beim Scrollen, alles sofort sichtbar', early === 0 && late.rv.length === 0 && late.hidden === 0, `früh ${early}, spät ${JSON.stringify(late)}`);
  // Seitenwechsel per Hash → View Transition, Inhalt vollständig sichtbar danach
  await p.evaluate(() => { location.hash = '#/stats'; }); await p.waitForTimeout(150);
  const vt = await p.evaluate(() => !!document.startViewTransition);
  await p.waitForTimeout(900);
  ok('Statistiken nach Seitenwechsel sichtbar (View Transition: ' + vt + ')', await p.evaluate(() => document.querySelectorAll('.stat-tile').length > 10 && [...document.querySelectorAll('.stat-tile')].every(e => getComputedStyle(e).opacity === '1' && !e.classList.contains('rv'))));
  // Unterhalb des Fensters: Elemente warten auf das Scrollen
  await p.evaluate(() => { location.hash = '#/progress'; }); await p.waitForTimeout(1200);
  const below = await p.evaluate(() => [...document.querySelectorAll('#content .rv')].map(e => Math.round(e.getBoundingClientRect().top)));
  ok('Fortschritt: auch Elemente unter dem Fenster sind ohne Einblenden da', below.length === 0, JSON.stringify(below));
  await p.evaluate(() => window.scrollTo(0, 2000)); await p.waitForTimeout(900);
  ok('Nach dem Scrollen alles eingeblendet', await p.evaluate(() => document.querySelectorAll('#content .rv').length === 0 && [...document.querySelectorAll('#content .card')].every(e => getComputedStyle(e).opacity === '1')));
  // Neuaufbau (rerender) blendet Sichtbares nicht erneut aus
  await p.evaluate(() => { location.hash = '#/trades'; }); await p.waitForTimeout(900);
  await p.evaluate(() => App.rerender()); const rr = await p.evaluate(() => [...document.querySelectorAll('#content .rv')].filter(e => e.getBoundingClientRect().top < innerHeight).length);
  ok('Neuaufbau: Sichtbares bleibt sofort sichtbar', rr === 0, String(rr));
  // Popover öffnet/schließt weich
  await p.click('.page-head [data-pop=range]'); await p.waitForTimeout(50);
  ok('Popover offen mit Animation', await p.evaluate(() => { const e = document.getElementById('pop-range'); return e.classList.contains('open') && getComputedStyle(e).animationName === 'pop-in'; }));
  await p.click('.topbar h1'); await p.waitForTimeout(30);
  const closing = await p.evaluate(() => document.getElementById('pop-range').classList.contains('closing'));
  await p.waitForTimeout(260);
  ok('Popover schließt weich und ist danach zu', closing && await p.evaluate(() => !document.getElementById('pop-range').classList.contains('open')));
  await p.click('.page-head [data-pop=range]'); await p.waitForTimeout(50); await p.click('.page-head [data-pop=range]'); await p.waitForTimeout(260);
  ok('Popover per Knopf umschalten', await p.evaluate(() => !document.getElementById('pop-range').classList.contains('open')));
  await p.click('.page-head [data-pop=range]'); await p.waitForTimeout(50); await p.click('.page-head [data-pop=account]'); await p.waitForTimeout(260);
  ok('Anderes Popover öffnen schließt das erste', await p.evaluate(() => !document.getElementById('pop-range').classList.contains('open') && document.getElementById('pop-account').classList.contains('open')));
  await p.keyboard.press('Escape'); await p.waitForTimeout(260);
  // Modal: Ein- und Ausblenden
  await p.keyboard.press('n'); await p.waitForTimeout(100);
  ok('Modal mit Einblend-Animation', await p.evaluate(() => { const m = document.querySelector('.modal'); return !!m && getComputedStyle(m).animationName === 'pop-in'; }));
  await p.click('.modal [data-close]'); await p.waitForTimeout(40);
  const outCls = await p.evaluate(() => { const b = document.querySelector('.modal-bg'); return b && b.classList.contains('out'); });
  await p.waitForTimeout(260);
  ok('Modal blendet aus und wird entfernt', outCls && !(await p.$('.modal-bg')) && await p.evaluate(() => document.body.style.overflow === ''));
  // Toast
  await p.evaluate(() => UI.toast('Hallo')); await p.waitForTimeout(2500); ok('Toast blendet aus', await p.evaluate(() => { const t = document.querySelector('.toast'); return !!t && t.classList.contains('out'); })); await p.waitForTimeout(400); ok('Toast entfernt', !(await p.$('.toast')));
  // Hover auf Kachel und Knopf
  await p.evaluate(() => { location.hash = '#/trades'; }); await p.waitForTimeout(900);
  await p.hover('.tile >> nth=1'); await p.waitForTimeout(350);
  ok('Kachel bleibt beim Überfahren ruhig (kein Anheben, Kante heller)', await p.evaluate(() => { const t = document.querySelectorAll('.tile')[1]; const cs = getComputedStyle(t); return cs.transform === 'none' && cs.borderTopColor === getComputedStyle(document.documentElement).getPropertyValue('--border-2').trim().replace(/^#(..)(..)(..)$/, (_, r, g, b) => `rgb(${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)})`); }));
  // Reduced motion: nichts versteckt, keine Klasse
  const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' }); const p2 = await ctx2.newPage(); p2.on('pageerror', e => errs.push(e.message));
  await p2.goto(base + '#/stats', { waitUntil: 'load' }); await p2.waitForTimeout(80);
  ok('Reduced Motion: keine js-motion-Klasse, alles sofort sichtbar', await p2.evaluate(() => !document.documentElement.classList.contains('js-motion') && !document.querySelector('.rv') && [...document.querySelectorAll('.stat-tile')].every(e => getComputedStyle(e).opacity === '1')));
  await p2.keyboard.press('n'); await p2.waitForTimeout(50); await p2.click('.modal [data-close]'); await p2.waitForTimeout(20); ok('Reduced Motion: Modal sofort weg', !(await p2.$('.modal-bg')));
  await ctx2.close();
  // Handy: Burger → X, Scrim
  await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(300);
  await p.click('.menu-btn'); await p.waitForTimeout(300);
  ok('Handy: Menü offen, Schließen-X in der Seitenleiste, Scrim sichtbar', await p.evaluate(() => document.querySelector('.menu-btn').getAttribute('aria-expanded') === 'true' && document.querySelector('.sidebar').classList.contains('open') && getComputedStyle(document.getElementById('scrim')).opacity === '1' && document.querySelector('.sidebar .sb-toggle').getAttribute('aria-label') === 'Menü schließen'));
  await p.screenshot({ path: 'mo-phone-menu.png' });
  await p.mouse.click(350, 500); await p.waitForTimeout(300);
  ok('Handy: Scrim schließt weich', await p.evaluate(() => getComputedStyle(document.getElementById('scrim')).opacity === '0' && document.querySelector('.menu-btn').getAttribute('aria-expanded') === 'false'));
  await p.evaluate(() => { location.hash = '#/dashboard'; }); await p.waitForTimeout(900);
  ok('Handy ohne Überlauf (Dashboard)', await p.evaluate(() => document.documentElement.scrollWidth <= 390));
  // Startseite
  await p.setViewportSize({ width: 1440, height: 1000 });
  await p.goto('file:///home/user/Florian/web/index.html', { waitUntil: 'load' }); await p.waitForTimeout(100);
  ok('Startseite: Hero-Zeilen animieren, Karten sofort da (kein Einblenden beim Scrollen)', await p.evaluate(() => getComputedStyle(document.querySelector('.hero h1 span')).animationName === 'lp-in' && document.querySelectorAll('.feat-card').length === 6 && !document.querySelector('.feat-card.rv') && [...document.querySelectorAll('.feat-card')].every(e => getComputedStyle(e).opacity === '1')));
  await p.evaluate(() => window.scrollTo(0, 1400)); await p.waitForTimeout(1000);
  ok('Startseite: Karten nach dem Scrollen sichtbar, Parallax gesetzt', await p.evaluate(() => [...document.querySelectorAll('.feat-card')].every(e => getComputedStyle(e).opacity === '1') && parseFloat(document.querySelector('.hero').style.getPropertyValue('--py')) > 100));
  await p.screenshot({ path: 'mo-landing.png' });
  console.log(out.join('\n')); console.log(errs.length ? 'ERRORS: ' + errs.join(' | ') : 'no errors');
  await browser.close(); })();
