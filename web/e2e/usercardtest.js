/* Konto-Karte unten in der Seitenleiste: Name/E-Mail, Menü, Links, Hell/Dunkel, eingeklappt, Handy, Englisch */
const { chromium } = require('playwright');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log('PASS ' + m); } else { fail++; console.log('FAIL ' + m); } };
const BASE = 'file:///home/user/Florian/web/app.html';
(async () => { const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 }); p.on('pageerror', e => errs.push(e.message)); try { await require('./localfonts.js')(p); } catch (e) {}
  await p.goto(BASE + '#/dashboard', { waitUntil: 'load' }); await p.waitForTimeout(900);
  /* ohne Profil: „Trader“ + Hinweis */
  await p.evaluate(() => { Store.data.settings.profile = {}; Store.data.settings.name = 'Trader'; App.rerender(); }); await p.waitForTimeout(200);
  const card0 = await p.evaluate(() => document.querySelector('.sb-user .sb-who').innerText.replace(/\n/g, ' / '));
  ok(card0 === 'Trader / Profil vervollständigen', 'Ohne Profil: Trader / Profil vervollständigen · ' + card0);
  ok(await p.evaluate(() => !document.querySelector('#sidebar .nav-sec') && !document.querySelector('#sidebar > .theme-toggle')), 'Alter Einstellungen-Eintrag und Hell/Dunkel-Schalter unten ersetzt');
  /* mit Profil */
  await p.evaluate(() => { Store.data.settings.profile = { firstName: 'Florian', lastName: 'Weinert', username: 'flo', email: 'flo@example.com' }; Store.data.settings.name = 'Florian Weinert'; Store.save(); App.rerender(); }); await p.waitForTimeout(200);
  const card = await p.evaluate(() => ({ who: document.querySelector('.sb-user .sb-who').innerText.replace(/\n/g, ' / '), av: document.querySelector('.sb-user .sb-av').innerText, bottom: Math.round(document.getElementById('sidebar').getBoundingClientRect().bottom - document.querySelector('.sb-user').getBoundingClientRect().bottom) }));
  ok(card.who === 'Florian Weinert / flo@example.com' && card.av === 'FW', 'Karte: Name, E-Mail, Initialen · ' + JSON.stringify(card));
  ok(card.bottom >= 0 && card.bottom < 40, 'Karte sitzt unten in der Leiste');
  await p.screenshot({ path: 'langshots/uc-closed.png', clip: { x: 0, y: 600, width: 300, height: 400 } });
  /* Menü öffnen */
  await p.click('.sb-user'); await p.waitForTimeout(300);
  const menu = await p.evaluate(() => { const m = document.getElementById('pop-user'); const r = m.getBoundingClientRect(), c = document.querySelector('.sb-user').getBoundingClientRect(); return { open: m.classList.contains('open'), items: [...m.querySelectorAll('.item')].filter(a => a.getClientRects().length).map(a => a.textContent.trim()), above: r.bottom <= c.top + 1, inside: r.left >= 0 && r.right <= document.getElementById('sidebar').getBoundingClientRect().right + 1, theme: !!m.querySelector('.theme-toggle') }; });
  ok(menu.open && menu.above && menu.inside && menu.theme && menu.items.join(',') === 'Profil,Einstellungen,Benachrichtigungen,Sprache', 'Menü öffnet nach oben mit Profil, Einstellungen, Benachrichtigungen, Sprache und Hell/Dunkel · ' + JSON.stringify(menu));
  await p.screenshot({ path: 'langshots/uc-open.png', clip: { x: 0, y: 500, width: 300, height: 500 } });
  /* Hell/Dunkel im Menü */
  await p.click('#pop-user .theme-toggle [data-value="light"]'); await p.waitForTimeout(300);
  ok(await p.evaluate(() => Store.settings.theme === 'light' && document.documentElement.dataset.theme === 'light'), 'Hell/Dunkel im Menü schaltet um');
  await p.screenshot({ path: 'langshots/uc-open-light.png', clip: { x: 0, y: 500, width: 300, height: 500 } });
  await p.click('#pop-user .theme-toggle [data-value="dark"]'); await p.waitForTimeout(200);
  /* Link: Benachrichtigungen */
  await p.click('#pop-user .item[href="#/settings/benachrichtigungen"]'); await p.waitForTimeout(600);
  ok(await p.evaluate(() => location.hash === '#/settings/benachrichtigungen' && !document.querySelector('#pop-user.open') && document.querySelector('.sb-user').classList.contains('active')), 'Klick auf Benachrichtigungen: Seite offen, Menü zu, Karte hervorgehoben');
  /* gleiche Adresse nochmal: Menü schließt trotzdem */
  await p.click('.sb-user'); await p.waitForTimeout(200); await p.click('#pop-user .item[href="#/settings/benachrichtigungen"]'); await p.waitForTimeout(300);
  ok(await p.evaluate(() => !document.querySelector('#pop-user.open:not(.closing)')), 'Gleicher Link: Menü schließt');
  /* Klick daneben schließt */
  await p.click('.sb-user'); await p.waitForTimeout(200); await p.mouse.click(900, 500); await p.waitForTimeout(300);
  ok(await p.evaluate(() => !document.querySelector('#pop-user.open:not(.closing)')), 'Klick daneben schließt das Menü');
  /* eingeklappt */
  await p.goto(BASE + '#/dashboard', { waitUntil: 'load' }); await p.waitForTimeout(700);
  await p.evaluate(() => { Store.setSetting('railHidden', true); App.rerender(); }); await p.waitForTimeout(300);
  await p.click('.sb-user'); await p.waitForTimeout(300);
  const mini = await p.evaluate(() => { const m = document.getElementById('pop-user'); const r = m.getBoundingClientRect(), s = document.getElementById('sidebar').getBoundingClientRect(); const hit = document.elementFromPoint(r.left + 40, r.top + 20); return { left: Math.round(r.left), sbRight: Math.round(s.right), visible: r.width > 180 && r.bottom <= innerHeight + 1 && !!hit && m.contains(hit), who: getComputedStyle(document.querySelector('.sb-who')).display }; });
  ok(mini.visible && mini.left >= 0 && mini.left < mini.sbRight, 'Bereichsleiste ausgeblendet: Konto-Menü sichtbar über der Karte in der Seitenleiste · ' + JSON.stringify(mini));
  await p.screenshot({ path: 'langshots/uc-mini.png', clip: { x: 0, y: 600, width: 400, height: 400 } });
  await p.mouse.click(900, 300); await p.evaluate(() => { Store.setSetting('railHidden', false); App.rerender(); }); await p.waitForTimeout(200);
  /* Englisch */
  await p.evaluate(async () => { Store.setLanguage('en'); I18N.setLang('en'); await new Promise(r => setTimeout(r, 900)); App.rerender(); }); await p.waitForTimeout(300);
  await p.click('.sb-user'); await p.waitForTimeout(300);
  const en = await p.evaluate(() => [...document.querySelectorAll('#pop-user .item')].filter(a => a.getClientRects().length).map(a => a.textContent.trim()).join(',') + ' | ' + document.querySelector('#pop-user .sb-menu-row span').textContent);
  ok(/Profile,Settings,Notifications,Language \| Appearance/.test(en), 'Englisch: Menü übersetzt · ' + en);
  await p.evaluate(() => Store.setLanguage('de'));
  /* Handy */
  const m = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }); m.on('pageerror', e => errs.push(e.message)); try { await require('./localfonts.js')(m); } catch (e) {}
  await m.goto(BASE + '#/dashboard', { waitUntil: 'load' }); await m.waitForTimeout(800);
  await m.evaluate(() => document.querySelector('.menu-btn').click()); await m.waitForTimeout(500);
  await m.evaluate(() => { const sb = document.getElementById('sidebar'); sb.scrollTop = sb.scrollHeight; }); await m.waitForTimeout(200);
  await m.evaluate(() => document.querySelector('.sb-user').click()); await m.waitForTimeout(300);
  ok(await m.evaluate(() => { const p2 = document.getElementById('pop-user'); const r = p2.getBoundingClientRect(); return p2.classList.contains('open') && r.top >= 0 && r.right <= innerWidth; }), 'Handy: Menü im geöffneten Seitenmenü sichtbar');
  await m.screenshot({ path: 'langshots/uc-mob.png' });
  await m.evaluate(() => document.querySelector('#pop-user .item[href="#/settings/profil"]').click()); await m.waitForTimeout(600);
  ok(await m.evaluate(() => location.hash === '#/settings/profil' && !document.getElementById('sidebar').classList.contains('open')), 'Handy: Profil geöffnet, Seitenmenü geschlossen');
  ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
  console.log(`${pass}/${pass + fail} bestanden`); await b.close(); process.exit(fail ? 1 : 0); })();
