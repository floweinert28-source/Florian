/* Coupon-Codes: eigener Bereich in der Gruppe Prop Trading (Seitenleiste, Titel, Kacheln, Kopieren), Prop Firms → Konten ohne Coupon-Karte */
const { chromium } = require('playwright');
const base = 'file:///tmp/claude-0/-home-user-Florian/3d79e81c-3967-55f9-a53a-e07cf04bcd94/scratchpad/sample-dev.html';
let pass = 0, fail = 0; const ok = (n, c, extra = '') => { if (c) { pass++; console.log('PASS ' + n); } else { fail++; console.log('FAIL ' + n + (extra ? ' · ' + extra : '')); } };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = []; p.on('pageerror', e => errors.push(String(e)));
  try {
    await p.goto(base + '#/coupons', { waitUntil: 'load' }); await p.waitForTimeout(900);
    const nav = await p.evaluate(() => [...document.querySelectorAll('.sidebar nav a[href^="#/"], .sidebar a[href^="#/"]')].map(a => a.getAttribute('href')));
    ok('Seitenleiste: „Coupon-Codes“ im Journal in der Gruppe Prop Trading (Prop Firms als eigener Bereich in der Leiste)', !!(await p.$('.sidebar .nav-group[aria-label="Prop Trading"] a[href="#/coupons"]')) && !nav.includes('#/prop') && !!(await p.$('.rail-item[data-rail=prop]')) && (await p.textContent('.sidebar a[href="#/coupons"]')).includes('Coupon-Codes'), JSON.stringify(nav));
    ok('Eigener Bereich: Titel „Coupon-Codes“, Eintrag aktiv, Prop Firms nicht aktiv', (await p.textContent('.topbar h1')).trim() === 'Coupon-Codes' && !!(await p.$('.sidebar a[href="#/coupons"].active')) && !(await p.$('.sidebar a[href="#/prop"].active')));
    const n = await p.evaluate(() => PropData.COUPONS.length);
    ok('Kacheln: Firma, Rabatt, Code-Ticket, Link (neuer Tab), Beispiel-Marke', n >= 2 && (await p.$$('.cpn')).length === n && ((await p.$$('.cpn .pill.neutral')).length === n || ((await p.$$('.cpn .pill.neutral')).length === 0 && (await p.$$('.cpn-top .pill.neutral')).length === 1)) && (await p.$$('.cpn-link[target=_blank][rel=noopener]')).length === n && (await p.textContent('.cpn:first-child .cpn-code')).trim() === (await p.evaluate(() => PropData.COUPONS[0].code)) && (await p.textContent('.cpn:first-child .cpn-off')).trim() === (await p.evaluate(() => PropData.COUPONS[0].discount)));
    ok('Kein Zeitraum-/Konto-Kopf, keine Karte um die Kacheln', !(await p.$('#content .rangepicker, #content [data-action=range-open]')) && !(await p.$('#content .card .cpn')));
    await p.click('.cpn:first-child .cpn-code'); await p.waitForTimeout(300);
    const toast = await p.textContent('.toast-wrap');
    ok('Klick auf den Code kopiert ihn (Toast, Rahmen kurz grün)', /Code kopiert|Kopieren nicht möglich/.test(toast) && (!/Code kopiert/.test(toast) || !!(await p.$('.cpn:first-child .cpn-code.copied'))), toast);
    await p.evaluate(() => { location.hash = '#/prop/konten'; }); await p.waitForTimeout(600);
    ok('Prop Firms → Konten ohne Coupon-Karte', !(await p.$('.cpn')) && !!(await p.$('.prop-acc-tbl, .empty')) && !!(await p.$('.rail-item[data-rail=prop].active')) && await p.evaluate(() => document.documentElement.classList.contains('sb-off')));
    await p.evaluate(() => { location.hash = '#/coupons'; }); await p.waitForTimeout(600);
    await p.screenshot({ path: 'coupons-page.png' });
    ok('keine Seitenfehler', !errors.length, errors.join(' | '));
  } catch (e) { console.log('CRASH ' + e.message); }
  console.log(errors.length ? 'ERRORS: ' + errors.join(' | ') : 'no errors'); console.log(`${pass} PASS, ${fail} FAIL`);
  await b.close();
})();
