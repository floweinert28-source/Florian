/* Barrierefreiheits-Sonde: Trefferflächen, Namen, Fokus in Dialogen/Popovern, Tab-Reihenfolge, Überschriften */
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = __dirname + '/shots/extra/a11y';
fs.mkdirSync(OUT, { recursive: true });
const BASE = 'file:///home/user/Florian/web/app.html#/';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try { await require('../localfonts.js')(page); } catch (e) { console.log('fonts:', e.message); }
  await page.goto(BASE + 'dashboard'); await page.waitForTimeout(800);
  await page.evaluate(() => { Store.installSample(); Store.saveNow(); });
  await page.reload(); await page.waitForTimeout(1200);

  const scan = () => page.evaluate(() => {
    const vis = e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.05; };
    const name = e => { const l = e.getAttribute('aria-label'); if (l) return l.trim(); const lb = e.getAttribute('aria-labelledby'); if (lb) return lb.split(' ').map(id => (document.getElementById(id) || {}).textContent || '').join(' ').trim(); if (e.labels && e.labels.length) return [...e.labels].map(x => x.textContent).join(' ').trim(); const t = (e.innerText || e.textContent || '').trim(); if (t) return t; const img = e.querySelector('img[alt]'); if (img && img.alt) return img.alt; if (e.placeholder) return '(placeholder) ' + e.placeholder; if (e.title) return '(title) ' + e.title; return ''; };
    const sel = e => { let s = e.tagName.toLowerCase(); if (e.id) s += '#' + e.id; if (e.className && typeof e.className === 'string') s += '.' + e.className.trim().split(/\s+/).slice(0, 3).join('.'); for (const a of ['data-action', 'data-pop', 'data-value', 'role']) if (e.hasAttribute(a)) s += `[${a}=${e.getAttribute(a)}]`; return s.slice(0, 120); };
    const Q = 'button, a[href], input:not([type=hidden]), select, textarea, [role=button], [role=switch], [role=checkbox], [role=tab], [tabindex], [data-action], [data-pop]';
    const els = [...document.querySelectorAll(Q)].filter(vis);
    const small = [], noname = [], notfocus = [];
    for (const e of els) {
      const r = e.getBoundingClientRect();
      const focusable = e.tabIndex >= 0 && !e.disabled;
      const interactive = e.matches('button, a[href], input, select, textarea, [role=button], [role=switch], [role=checkbox], [data-action], [data-pop]') && !e.matches('form');
      if (interactive && (r.width < 32 || r.height < 32) && !e.matches('input[type=checkbox], input[type=radio]')) small.push({ s: sel(e), w: Math.round(r.width), h: Math.round(r.height), n: name(e).slice(0, 30) });
      if (interactive && !name(e)) noname.push(sel(e));
      if (e.hasAttribute('data-action') && !e.matches('form') && !focusable) notfocus.push(sel(e));
    }
    const heads = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(vis).map(h => h.tagName + ' ' + h.textContent.trim().slice(0, 40));
    const cardTitles = [...document.querySelectorAll('.card-title')].filter(vis).length;
    return { count: els.length, small, noname, notfocus, heads, cardTitles, live: [...document.querySelectorAll('[aria-live],[role=status],[role=alert]')].map(sel) };
  });

  const routes = ['dashboard', 'trades', 'day', 'stats', 'notebook', 'progress', 'shadow', 'settings/profil', 'settings/trading', 'settings/design', 'prop'];
  const res = {};
  for (const r of routes) { await page.goto(BASE + r); await page.waitForTimeout(900); res[r] = await scan(); }
  fs.writeFileSync(OUT + '/scan.json', JSON.stringify(res, null, 1));

  // Tab-Reihenfolge ab Seitenanfang: wie viele Tabs bis in #content
  await page.goto(BASE + 'dashboard'); await page.waitForTimeout(900);
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  let tabs = 0, reached = null; const seq = [];
  for (let i = 0; i < 40; i++) { await page.keyboard.press('Tab'); tabs++; const info = await page.evaluate(() => { const a = document.activeElement; return { inContent: !!(a && a.closest('#content')), inTopbar: !!(a && a.closest('.topbar')), s: a ? (a.tagName + '.' + (a.className || '') + ' ' + (a.getAttribute('aria-label') || a.textContent || '').trim().slice(0, 24)) : '' }; }); seq.push(info.s); if (info.inContent) { reached = tabs; break; } }
  console.log('tabs-to-content', reached, JSON.stringify(seq.slice(0, 6)));

  // Trade loggen: Fokus nach dem Öffnen, Fokusfalle, Rückgabe
  await page.goto(BASE + 'dashboard'); await page.waitForTimeout(900);
  await page.focus('[data-action="new-trade"]'); await page.keyboard.press('Enter'); await page.waitForTimeout(400);
  const afterOpen = await page.evaluate(() => { const a = document.activeElement; return { tag: a.tagName, cls: a.className, inModal: !!a.closest('.modal'), labelledby: document.querySelector('.modal').getAttribute('aria-labelledby') }; });
  console.log('trade-modal-after-open', JSON.stringify(afterOpen));
  const trap = [];
  for (let i = 0; i < 30; i++) { await page.keyboard.press('Tab'); trap.push(await page.evaluate(() => !!document.activeElement.closest('.modal'))); }
  console.log('trade-modal-tab-inside', JSON.stringify(trap));
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  console.log('after-escape-focus', await page.evaluate(() => { const a = document.activeElement; return a.tagName + '.' + a.className + ' ' + (a.textContent || '').trim().slice(0, 20); }));

  // Fehlerzustand: leeres Formular absenden
  await page.click('[data-action="new-trade"]'); await page.waitForTimeout(400);
  await page.click('.modal button[type=submit]'); await page.waitForTimeout(300);
  console.log('trade-submit-empty', JSON.stringify(await page.evaluate(() => ({ active: document.activeElement.id, invalid: [...document.querySelectorAll('.modal [aria-invalid=true]')].length, toast: !!document.querySelector('.toast'), validity: document.querySelector('#f-entry').validationMessage }))));
  await page.fill('#f-entry', '100'); await page.click('.modal button[type=submit]'); await page.waitForTimeout(200);
  console.log('trade-submit-entry', JSON.stringify(await page.evaluate(() => ({ toast: [...document.querySelectorAll('.toast')].map(t => t.textContent), wrapRole: (document.querySelector('.toast-wrap') || {}).getAttribute ? document.querySelector('.toast-wrap').getAttribute('role') : null, live: (document.querySelector('.toast-wrap') || {}).getAttribute ? document.querySelector('.toast-wrap').getAttribute('aria-live') : null, active: document.activeElement.id || document.activeElement.className }))));
  await page.screenshot({ path: OUT + '/trade_fehler_symbol.png' });
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);

  // Filter-Popover: Fokus nach dem Öffnen, Escape-Rückgabe, aria-expanded
  await page.goto(BASE + 'dashboard'); await page.waitForTimeout(900);
  const fbtn = await page.$('[data-action="dash-filter"], [data-pop="filter"], .fd-btn');
  const fsel = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(b => /Filter/.test(b.textContent)); if (!b) return null; b.setAttribute('data-probe', 'filter'); return b.outerHTML.slice(0, 300); });
  console.log('filter-btn', fsel);
  await page.focus('[data-probe=filter]'); await page.keyboard.press('Enter'); await page.waitForTimeout(400);
  console.log('filter-after-open', JSON.stringify(await page.evaluate(() => { const a = document.activeElement; const b = document.querySelector('[data-probe=filter]'); const pop = document.querySelector('.fd-pop'); return { active: a.tagName + '.' + a.className + ' ' + (a.textContent || '').trim().slice(0, 20), expanded: b && b.getAttribute('aria-expanded'), popRole: pop && pop.getAttribute('role'), popLabel: pop && (pop.getAttribute('aria-label') || pop.getAttribute('aria-labelledby')) }; })));
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  console.log('filter-after-escape', await page.evaluate(() => { const a = document.activeElement; return a.tagName + '.' + a.className + ' ' + (a.textContent || '').trim().slice(0, 20); }));

  // Zeitraum-Popover
  await page.focus('[data-pop="range"]'); await page.keyboard.press('Enter'); await page.waitForTimeout(400);
  console.log('range-after-open', JSON.stringify(await page.evaluate(() => { const a = document.activeElement; const b = document.querySelector('[data-pop="range"]'); return { active: a.tagName + '.' + a.className + ' ' + (a.textContent || '').trim().slice(0, 20), expanded: b.getAttribute('aria-expanded'), haspopup: b.getAttribute('aria-haspopup') }; })));
  await page.keyboard.press('Tab'); await page.keyboard.press('Tab');
  console.log('range-tab2', await page.evaluate(() => { const a = document.activeElement; return a.tagName + '.' + a.className + ' ' + (a.textContent || '').trim().slice(0, 30) + ' inPop=' + !!a.closest('.popover'); }));
  await page.keyboard.press('Escape');

  // Tooltip per Tastatur: Info-Symbol fokussierbar?
  await page.goto(BASE + 'stats'); await page.waitForTimeout(900);
  console.log('info-icons', JSON.stringify(await page.evaluate(() => { const i = [...document.querySelectorAll('.info')]; return { n: i.length, focusable: i.filter(e => e.tabIndex >= 0).length, tag: i[0] && i[0].tagName }; })));

  // Tabellenzeile TradeLog per Tastatur
  await page.goto(BASE + 'trades'); await page.waitForTimeout(900);
  console.log('trade-rows', JSON.stringify(await page.evaluate(() => { const rows = [...document.querySelectorAll('tr.link')]; const th = [...document.querySelectorAll('th.sortable')]; return { rows: rows.length, rowFocusable: rows.filter(r => r.tabIndex >= 0 || r.querySelector('a[href],button')).length, th: th.length, thFocusable: th.filter(t => t.tabIndex >= 0 || t.querySelector('button')).length, ariaSort: th.filter(t => t.hasAttribute('aria-sort')).length }; })));

  // Seitenleiste: aria-current
  console.log('nav-current', await page.evaluate(() => { const a = document.querySelector('.nav a.active'); return a ? a.outerHTML.slice(0, 160) + ' aria-current=' + a.getAttribute('aria-current') : null; }));

  // Toast-Dauer & Rolle
  await page.evaluate(() => UI.toast('Probe'));
  console.log('toast', await page.evaluate(() => { const w = document.querySelector('.toast-wrap'); return w.outerHTML.slice(0, 200); }));

  // Fokus-Ring des Schalters (Einstellungen > Trading) und Fokus auf Eingabe: Screenshot
  await page.goto(BASE + 'settings/trading'); await page.waitForTimeout(900);
  await page.focus('.switch'); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab'); await page.waitForTimeout(200);
  const sw = await page.$('.switch'); const bb = await sw.boundingBox();
  await page.screenshot({ path: OUT + '/fokus_schalter_aus.png', clip: { x: bb.x - 30, y: bb.y - 20, width: 400, height: 70 } });
  // Check-in-Dialog: Fokus auf Skala 1-5
  await page.goto(BASE + 'day'); await page.waitForTimeout(900);
  await page.evaluate(() => App.openCheckIn(Core.dayKey(new Date()))); await page.waitForTimeout(400);
  console.log('checkin-after-open', await page.evaluate(() => { const a = document.activeElement; return a.tagName + '.' + a.className + ' ' + (a.getAttribute('aria-label') || a.textContent || '').trim().slice(0, 20); }));
  await page.focus('.modal input[type=range]'); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab'); await page.waitForTimeout(200);
  const rg = await page.$('.modal .slider'); const rb = await rg.boundingBox();
  await page.screenshot({ path: OUT + '/fokus_slider_checkin.png', clip: { x: rb.x - 20, y: rb.y - 20, width: rb.width + 40, height: 70 } });
  await page.focus('.modal .seg.pill button'); await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab'); await page.waitForTimeout(200);
  const sg = await page.$('.modal .seg.pill'); const sb2 = await sg.boundingBox();
  await page.screenshot({ path: OUT + '/fokus_skala_checkin.png', clip: { x: sb2.x - 20, y: sb2.y - 30, width: sb2.width + 40, height: sb2.height + 50 } });
  console.log('checkin-scale-size', JSON.stringify(await page.evaluate(() => { const b = document.querySelector('.modal .seg.pill button').getBoundingClientRect(); return { w: Math.round(b.width), h: Math.round(b.height) }; })));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
