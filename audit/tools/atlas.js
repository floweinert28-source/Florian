/* Screenshot-Atlas + Stil-Zensus für das Design-Audit.
   Ausgabe: audit/shots/<theme>-<width>/<name>.png, audit/census/<screen>.json, audit/census.json, audit/atlas-log.txt */
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const base = 'file:///home/user/Florian/web/app.html'; const OUT = path.join(__dirname); const LOG = [];
const log = (m) => { LOG.push(m); console.log(m); };
const CONTEXTS = [['dark', 1440], ['dark', 1024], ['dark', 390], ['light', 1440], ['light', 390]];
const STATIC = ['dashboard', 'stats', 'trades', 'day', 'notebook', 'news', 'shadow', 'mentor', 'ruhepunkt', 'prop', 'prop/friedhof', 'coupons', 'affiliate', 'coach', 'settings'];
async function census(p) {
  return p.evaluate(() => {
    const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const sel = el => el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
    const text = [], boxes = []; const cnt = (m, k) => { m[k] = (m[k] || 0) + 1; };
    const agg = { fontSize: {}, fontWeight: {}, lineHeight: {}, fontFamily: {}, letterSpacing: {}, textTransform: {}, color: {}, bg: {}, border: {}, radius: {}, gap: {}, padding: {}, shadow: {} };
    const ex = {}; const example = (k, v, s) => { const key = k + '|' + v; ex[key] = ex[key] || new Set(); if (ex[key].size < 6) ex[key].add(s); };
    document.querySelectorAll('#main *, #sidebar *').forEach(el => {
      if (!vis(el) || el.closest('svg')) return; const cs = getComputedStyle(el); const s = sel(el);
      const hasText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
      if (hasText) { const fs = cs.fontSize, fw = cs.fontWeight, lh = cs.lineHeight, ff = cs.fontFamily.split(',')[0].replace(/"/g, ''); cnt(agg.fontSize, fs); cnt(agg.fontWeight, fw); cnt(agg.lineHeight, lh); cnt(agg.fontFamily, ff); cnt(agg.letterSpacing, cs.letterSpacing); cnt(agg.textTransform, cs.textTransform); cnt(agg.color, cs.color); example('fontSize', fs, s); example('fontWeight', fw, s); example('color', cs.color, s); text.push({ s, fs, fw, lh, ff, c: cs.color, t: el.textContent.trim().slice(0, 40) }); }
      const d = cs.display; if (['block', 'flex', 'grid', 'inline-flex', 'inline-grid', 'table'].includes(d) && el.getBoundingClientRect().width > 24) {
        if (cs.backgroundColor !== 'rgba(0, 0, 0, 0)') { cnt(agg.bg, cs.backgroundColor); example('bg', cs.backgroundColor, s); }
        if (cs.borderTopWidth !== '0px' && cs.borderTopStyle !== 'none') { cnt(agg.border, cs.borderTopWidth + ' ' + cs.borderTopColor); example('border', cs.borderTopWidth + ' ' + cs.borderTopColor, s); }
        if (cs.borderTopLeftRadius !== '0px') { cnt(agg.radius, cs.borderTopLeftRadius); example('radius', cs.borderTopLeftRadius, s); }
        if ((d.includes('flex') || d.includes('grid')) && cs.gap !== 'normal' && cs.gap !== '0px') { cnt(agg.gap, cs.gap); example('gap', cs.gap, s); }
        const pad = [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].join(' '); if (pad !== '0px 0px 0px 0px') { cnt(agg.padding, pad); example('padding', pad, s); }
        if (cs.boxShadow !== 'none') { cnt(agg.shadow, cs.boxShadow.slice(0, 80)); example('shadow', cs.boxShadow.slice(0, 80), s); }
        boxes.push({ s, pad, gap: cs.gap, r: cs.borderTopLeftRadius, bg: cs.backgroundColor, b: cs.borderTopWidth + ' ' + cs.borderTopColor });
      }
    });
    const exo = {}; Object.entries(ex).forEach(([k, v]) => { exo[k] = [...v]; });
    return { agg, examples: exo, text: text.slice(0, 400), boxes: boxes.slice(0, 300), title: document.title, h1: (document.querySelector('.topbar h1') || {}).textContent, scrollW: document.documentElement.scrollWidth, vw: innerWidth, overflow: document.documentElement.scrollWidth > innerWidth + 1 };
  });
}
(async () => {
  const b = await chromium.launch(); const errs = [];
  fs.mkdirSync(path.join(OUT, 'census'), { recursive: true });
  const global = {}; const perScreen = {};
  for (const [theme, width] of CONTEXTS) {
    const dir = path.join(OUT, 'shots', `${theme}-${width}`); fs.mkdirSync(dir, { recursive: true });
    const mobile = width < 600; const ctx = await b.newContext({ viewport: { width, height: mobile ? 844 : 900 }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile }); const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(`${theme}-${width}: ${e.message}`)); try { await require('../localfonts.js')(p); } catch (e) {}
    await p.goto(base, { waitUntil: 'load' }); await p.evaluate(t => { Store.installSample(); Store.setSetting('theme', t); Store.setSetting('language', 'de'); Store.saveNow(); }, theme); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(600);
    const shot = async (name, opts = {}) => { try { await p.waitForTimeout(opts.wait || 500); await p.screenshot({ path: path.join(dir, name + '.png'), fullPage: opts.full !== false }); log(`ok ${theme}-${width} ${name}`); } catch (e) { log(`FAIL ${theme}-${width} ${name}: ${e.message.split('\n')[0]}`); } };
    const go = async (route, name, opts = {}) => { try { await p.goto(base + '#/' + route); await p.waitForTimeout(opts.wait || 700); } catch (e) { log(`FAIL goto ${route}: ${e.message.split('\n')[0]}`); } await shot(name || route.replace(/\//g, '_'), opts); if (theme === 'dark' && width === 1440) { try { const c = await census(p); perScreen[name || route] = c; fs.writeFileSync(path.join(OUT, 'census', (name || route).replace(/\//g, '_') + '.json'), JSON.stringify(c)); for (const k of Object.keys(c.agg)) { global[k] = global[k] || {}; for (const [v, n] of Object.entries(c.agg[k])) global[k][v] = (global[k][v] || 0) + n; } } catch (e) { log('census fail ' + route + ' ' + e.message); } } };
    const clickShot = async (selector, name, opts = {}) => { try { await p.click(selector, { timeout: 4000 }); await p.waitForTimeout(opts.wait || 500); await shot(name, { full: false }); if (opts.close !== false) { await p.keyboard.press('Escape'); await p.waitForTimeout(300); } } catch (e) { log(`FAIL ${theme}-${width} ${name}: ${e.message.split('\n')[0]}`); } };
    /* Seiten */
    for (const r of STATIC) await go(r);
    /* Statistik-Reiter */
    try { await p.goto(base + '#/stats'); await p.waitForTimeout(500); const tabs = await p.$$eval('#content [data-subnav] a[href], #content .tabs a[href]', a => a.map(x => x.getAttribute('href')).filter(h => h && h.startsWith('#/stats/'))); for (const h of [...new Set(tabs)]) await go(h.slice(2), 'stats_' + h.split('/').pop()); } catch (e) { log('stats tabs fail ' + e.message); }
    /* Prop-Bereiche */
    try { await p.goto(base + '#/prop'); await p.waitForTimeout(500); const tabs = await p.$$eval('#content a[href^="#/prop/"]', a => [...new Set(a.map(x => x.getAttribute('href')))]); for (const h of tabs) await go(h.slice(2), 'prop_' + h.split('/').pop()); } catch (e) { log('prop tabs fail ' + e.message); }
    /* Einstellungen-Bereiche */
    try { await p.goto(base + '#/settings'); await p.waitForTimeout(500); const secs = await p.$$eval('.set-nav a[href]', a => a.map(x => x.getAttribute('href'))); for (const h of secs) await go(h.slice(2), 'settings_' + h.split('/').pop()); } catch (e) { log('settings fail ' + e.message); }
    /* Tagesansicht mit Trades, Notebook-Notiz, Handel-Detail */
    try { const k = await p.evaluate(() => { const t = Store.data.trades.filter(t => t.closed).sort((a, b) => b.open - a.open)[0]; return t ? t.dayKey : null; }); if (k) await go('day/' + k, 'day_mit_trades'); } catch (e) { log('day fail ' + e.message); }
    try { await p.goto(base + '#/notebook'); await p.waitForTimeout(600); await p.click('.note-item', { timeout: 3000 }); await p.waitForTimeout(600); await shot('notebook_notiz'); } catch (e) { log(`FAIL ${theme}-${width} notebook_notiz: ${e.message.split('\n')[0]}`); }
    try { await p.goto(base + '#/trades'); await p.waitForTimeout(600); await p.click('.tbl tbody tr', { timeout: 3000 }); await p.waitForTimeout(700); await shot('trade_detail', { full: false }); await p.keyboard.press('Escape'); await p.waitForTimeout(300); } catch (e) { log(`FAIL ${theme}-${width} trade_detail: ${e.message.split('\n')[0]}`); }
    /* Dialoge und Menüs (Dashboard) */
    await p.goto(base + '#/dashboard'); await p.waitForTimeout(700);
    await clickShot('[data-action="new-trade"]', 'modal_trade_loggen');
    await clickShot('[data-action="check-in"]', 'modal_checkin');
    await clickShot('[data-pop="range"]', 'pop_zeitraum');
    await clickShot('[data-pop="account"]', 'pop_konto');
    await clickShot('[data-action="dash-f-open"]', 'pop_filter');
    await clickShot('[data-pop="tpl"]', 'pop_vorlage');
    await clickShot('[data-pop="cert"]', 'pop_zertifikat');
    try { await p.click('[data-pop="cert"]', { timeout: 3000 }); await p.waitForTimeout(300); await p.click('#pop-cert [data-action="cert-open"]', { timeout: 3000 }); await p.waitForTimeout(900); await shot('modal_zertifikat', { full: false }); await p.keyboard.press('Escape'); await p.waitForTimeout(300); } catch (e) { log(`FAIL ${theme}-${width} modal_zertifikat: ${e.message.split('\n')[0]}`); }
    try { await p.click('[data-pop="tpl"]', { timeout: 3000 }); await p.waitForTimeout(300); await p.click('#pop-tpl [data-action="dash-tpl-edit"]', { timeout: 3000 }); await p.waitForTimeout(700); await shot('dashboard_bearbeiten'); await p.click('[data-action="dash-add-open"]', { timeout: 3000 }); await p.waitForTimeout(700); await shot('panel_widget_hinzufuegen', { full: false }); await p.keyboard.press('Escape'); await p.waitForTimeout(300); await p.click('[data-action="dash-cancel"]', { timeout: 3000 }); await p.waitForTimeout(400); } catch (e) { log(`FAIL ${theme}-${width} bearbeiten: ${e.message.split('\n')[0]}`); }
    try { await p.click('.sb-user', { timeout: 3000 }); await p.waitForTimeout(400); await shot('menu_konto_unten', { full: false }); await p.keyboard.press('Escape'); await p.waitForTimeout(300); } catch (e) { log(`FAIL ${theme}-${width} menu_konto_unten: ${e.message.split('\n')[0]}`); }
    if (mobile) { try { await p.click('[data-action="sidebar"]', { timeout: 3000 }); await p.waitForTimeout(500); await shot('mobile_menue', { full: false }); await p.keyboard.press('Escape'); await p.waitForTimeout(300); } catch (e) { log(`FAIL ${theme}-${width} mobile_menue: ${e.message.split('\n')[0]}`); } }
    else { try { await p.click('.sb-toggle, [data-action="sb-mini"]', { timeout: 3000 }); await p.waitForTimeout(500); await shot('sidebar_mini', { full: false }); await p.click('.sb-toggle, [data-action="sb-mini"]', { timeout: 3000 }); await p.waitForTimeout(300); } catch (e) { log(`FAIL ${theme}-${width} sidebar_mini: ${e.message.split('\n')[0]}`); } }
    /* leerer Zustand ohne Daten */
    try { await p.evaluate(() => { Store.removeSample(); Store.saveNow(); }); await p.goto(base + '#/dashboard'); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(700); await shot('leer_dashboard'); await go('stats', 'leer_stats'); await go('trades', 'leer_trades'); await go('progress', 'leer_progress'); await go('shadow', 'leer_shadow'); await go('prop', 'leer_prop'); } catch (e) { log(`FAIL ${theme}-${width} leer: ${e.message.split('\n')[0]}`); }
    await ctx.close();
  }
  fs.writeFileSync(path.join(OUT, 'census.json'), JSON.stringify({ global, screens: Object.keys(perScreen) }, null, 1));
  fs.writeFileSync(path.join(OUT, 'atlas-log.txt'), LOG.join('\n') + '\nERRORS:\n' + errs.join('\n') + '\nATLASDONE\n');
  await b.close(); console.log('ATLASDONE', errs.length, 'errors'); })();
