/* Nachfinder Tablet/kleine Laptops: Aufnahmen 1280x800, 1366x768 (dunkel, offen + eingeklappt), 1024x768 hell.
   Ausgabe: audit/shots/extra/w/<tag>-<name>.png und audit/shots/extra/w/measure.json */
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const base = 'file:///home/user/Florian/web/app.html'; const OUT = path.join(__dirname, 'shots', 'extra', 'w'); fs.mkdirSync(OUT, { recursive: true });
const LOG = []; const log = m => { LOG.push(m); console.log(m); };
const CSV = 'Symbol;Richtung;Eröffnung;Schluss;Einstieg;Ausstieg;Stück;Gebühren\nNQ;Long;01.10.2026 10:00;01.10.2026 10:20;21000;21050;1;4,5\nES;Short;02.10.2026 11:00;02.10.2026 11:30;5800;5790;2;4,5';
const ONLY = process.argv[2] || '';
const CONTEXTS = [
  { tag: '1280-open', w: 1280, h: 800, theme: 'dark', mini: false, full: true },
  { tag: '1280-mini', w: 1280, h: 800, theme: 'dark', mini: true, full: true },
  { tag: '1366-open', w: 1366, h: 768, theme: 'dark', mini: false, full: true },
  { tag: '1366-mini', w: 1366, h: 768, theme: 'dark', mini: true, full: true },
  { tag: '1024-light', w: 1024, h: 768, theme: 'light', mini: false, full: false },
].filter(c => !ONLY || c.tag.includes(ONLY));
const STATS = ['summary', 'days', 'setups', 'time', 'mistakes', 'regime', 'state', 'edge', 'mc'];
async function measure(p) {
  return p.evaluate(() => {
    const out = { vw: innerWidth, vh: innerHeight, docSW: document.documentElement.scrollWidth, docSH: document.documentElement.scrollHeight };
    const sel = el => { let s = el.tagName.toLowerCase(); if (el.id) s += '#' + el.id; if (typeof el.className === 'string' && el.className.trim()) s += '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.'); return s; };
    const path = el => { const a = []; let e = el; for (let i = 0; i < 3 && e && e !== document.body; i++) { a.unshift(sel(e)); e = e.parentElement; } return a.join(' > '); };
    const root = document.querySelector('#content') || document.body; const main = document.querySelector('.main');
    out.contentW = root.getBoundingClientRect().width; out.sidebarW = (document.getElementById('sidebar') || { getBoundingClientRect: () => ({ width: 0 }) }).getBoundingClientRect().width;
    /* abgeschnittene Bereiche */
    const clip = []; const ell = [];
    (document.querySelector('.modal') ? [document.querySelector('.modal')] : [root]).forEach(r => r.querySelectorAll('*').forEach(el => {
      if (el.closest('svg')) return; const cs = getComputedStyle(el); const rr = el.getBoundingClientRect(); if (!rr.width || !rr.height) return;
      if (['hidden', 'auto', 'scroll', 'clip'].includes(cs.overflowX) && el.scrollWidth > el.clientWidth + 2) clip.push({ s: path(el), sw: el.scrollWidth, cw: el.clientWidth, ox: cs.overflowX, t: el.textContent.trim().replace(/\s+/g, ' ').slice(0, 60) });
      if (cs.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 1) ell.push({ s: path(el), sw: el.scrollWidth, cw: el.clientWidth, t: el.textContent.trim().slice(0, 50) });
    }));
    out.clip = clip.slice(0, 40); out.ell = ell.slice(0, 40);
    /* Raster: Reihen und Spalten */
    const grids = [];
    root.querySelectorAll('.grid, .stat-tiles, .stat-grid, .dash-top, .dash-main, .kstrip, .settings, .theme-grid').forEach(g => {
      const kids = [...g.children].filter(k => { const r = k.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(k).position !== 'absolute'; }); if (kids.length < 2) return;
      const rows = {}; kids.forEach(k => { const t = Math.round(k.getBoundingClientRect().top); const key = Object.keys(rows).find(x => Math.abs(x - t) < 4) || t; rows[key] = (rows[key] || 0) + 1; });
      const counts = Object.values(rows); const widths = kids.map(k => Math.round(k.getBoundingClientRect().width));
      grids.push({ s: path(g), n: kids.length, rows: counts, w: [...new Set(widths)].slice(0, 6), cols: getComputedStyle(g).gridTemplateColumns.split(' ').length });
    });
    out.grids = grids;
    /* Text-Kollisionen in SVG */
    const svgc = [];
    root.querySelectorAll('svg').forEach(svg => {
      const ts = [...svg.querySelectorAll('text')].map(t => ({ t: t.textContent.trim(), r: t.getBoundingClientRect() })).filter(x => x.t && x.r.width > 0);
      for (let i = 0; i < ts.length; i++) for (let j = i + 1; j < ts.length; j++) { const a = ts[i].r, b = ts[j].r; const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left), oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top); if (ox > 1 && oy > 2) svgc.push({ card: (svg.closest('.card') && (svg.closest('.card').querySelector('.card-title, h3, .ct, b') || {}).textContent || '').trim().slice(0, 40), a: ts[i].t, b: ts[j].t, ox: Math.round(ox), oy: Math.round(oy) }); }
      const fsz = [...svg.querySelectorAll('text')].map(t => parseFloat(getComputedStyle(t).fontSize) * (svg.getBoundingClientRect().width / ((svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.width) || svg.getBoundingClientRect().width))).filter(Boolean);
      if (fsz.length && Math.min(...fsz) < 9.5) svgc.push({ card: (svg.closest('.card') && (svg.closest('.card').querySelector('.card-title, h3, .ct, b') || {}).textContent || '').trim().slice(0, 40), small: Math.round(Math.min(...fsz) * 10) / 10 });
    });
    out.svg = svgc.slice(0, 40);
    /* Titelzeile/Kopfreihe */
    const tb = document.querySelector('.topbar'); const ph = document.querySelector('.page-head');
    out.topbarH = tb ? Math.round(tb.getBoundingClientRect().height) : 0; out.pageHead = ph ? { h: Math.round(ph.getBoundingClientRect().height), kids: [...ph.querySelectorAll(':scope > *')].map(k => { const r = k.getBoundingClientRect(); return { s: sel(k), top: Math.round(r.top), h: Math.round(r.height), w: Math.round(r.width) }; }) } : null;
    out.tbTools = tb ? [...tb.querySelectorAll('.tb-tools > *, .actions > *')].map(k => { const r = k.getBoundingClientRect(); return { s: sel(k), top: Math.round(r.top), w: Math.round(r.width) }; }) : [];
    /* Reiterleisten */
    out.tabs = [...root.querySelectorAll('.tabs, .prop-tabs, .seg')].map(t => ({ s: path(t), sw: t.scrollWidth, cw: t.clientWidth, h: Math.round(t.getBoundingClientRect().height) }));
    /* Dialog */
    const m = document.querySelector('.modal'); if (m) { const r = m.getBoundingClientRect(); const f = m.querySelector('.modal-foot'); const fr = f && f.getBoundingClientRect(); out.modal = { top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height), sh: m.scrollHeight, ch: m.clientHeight, w: Math.round(r.width), footTop: fr && Math.round(fr.top), footBottom: fr && Math.round(fr.bottom), footVisible: fr ? fr.bottom <= innerHeight && fr.top >= 0 : null, cls: m.className }; }
    return out;
  });
}
(async () => {
  const b = await chromium.launch(); const M = {}; const errs = [];
  for (const C of CONTEXTS) {
    const ctx = await b.newContext({ viewport: { width: C.w, height: C.h }, reducedMotion: 'reduce' }); const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(`${C.tag}: ${e.message}`)); try { await require('../localfonts.js')(p); } catch (e) {}
    await p.goto(base, { waitUntil: 'load' });
    await p.evaluate(c => { Store.installSample(); Store.setSetting('theme', c.theme); Store.setSetting('language', 'de'); Store.setSetting('sidebarMini', c.mini); Store.saveNow(); }, C);
    await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(800);
    const scrollAll = async () => { await p.evaluate(async () => { const els = [document.scrollingElement, ...document.querySelectorAll('.main, .content, .tl-fit .tbl-wrap')].filter(e => e && e.scrollHeight > e.clientHeight + 10); for (const el of els) { const h = el.scrollHeight; for (let y = 0; y < h; y += 300) { el.scrollTop = y; await new Promise(r => setTimeout(r, 70)); } el.scrollTop = h; await new Promise(r => setTimeout(r, 150)); el.scrollTop = 0; } }); await p.waitForTimeout(400); };
    const shot = async (name, opts = {}) => { try { if (!opts.noScroll) await scrollAll(); await p.waitForTimeout(opts.wait || 300); const full = opts.full !== undefined ? opts.full : true; await p.screenshot({ path: path.join(OUT, `${C.tag}-${name}.png`), fullPage: full }); M[`${C.tag}/${name}`] = await measure(p); log(`ok ${C.tag} ${name}`); } catch (e) { log(`FAIL ${C.tag} ${name}: ${e.message.split('\n')[0]}`); } };
    const go = async (route, name, opts = {}) => { try { await p.goto(base + '#/' + route); await p.waitForTimeout(opts.wait || 800); } catch (e) { log(`FAIL goto ${route}: ${e.message.split('\n')[0]}`); } await shot(name || route.replace(/\//g, '_'), opts); };
    const T = async (name, fn) => { try { await fn(); } catch (e) { log(`FAIL ${C.tag} ${name}: ${e.message.split('\n')[0]}`); try { await p.keyboard.press('Escape'); } catch (_) {} } };
    if (!C.full) {
      await go('dashboard'); await go('stats'); await go('trades'); await go('settings/konten', 'settings_konten');
      await go('stats/time', 'stats_time'); await go('prop'); await go('settings/trading', 'settings_trading');
      await ctx.close(); continue;
    }
    await go('dashboard');
    for (const t of STATS) await go('stats/' + t, 'stats_' + t);
    await go('trades');
    await T('trade_detail', async () => { const id = await p.evaluate(() => { const t = Store.data.trades.filter(t => t.closed).sort((a, b) => b.open - a.open)[0]; return t && t.id; }); await go('trades/' + id, 'trade_detail'); });
    await T('day', async () => { const k = await p.evaluate(() => { const t = Store.data.trades.filter(t => t.closed).sort((a, b) => b.open - a.open)[0]; return t ? t.dayKey : null; }); if (k) await go('day/' + k, 'day_mit_trades'); });
    await go('prop'); await go('prop/bilanz', 'prop_bilanz'); await go('prop/konten', 'prop_konten');
    for (const s of ['konten', 'trading', 'design', 'regeln', 'logs']) await go('settings/' + s, 'settings_' + s);
    await T('notebook', async () => { await p.goto(base + '#/notebook'); await p.waitForTimeout(700); await p.click('.note-item', { timeout: 3000 }); await p.waitForTimeout(700); await shot('notebook_notiz', { full: false }); });
    await go('shadow'); await go('progress');
    await T('modal_trade', async () => { await p.goto(base + '#/dashboard'); await p.waitForTimeout(700); await p.click('[data-action="new-trade"]', { timeout: 4000 }); await p.waitForTimeout(600); await shot('modal_trade_loggen', { full: false, noScroll: true }); await p.keyboard.press('Escape'); await p.waitForTimeout(300); });
    await T('modal_cert', async () => { await p.click('[data-pop="cert"]', { timeout: 3000 }); await p.waitForTimeout(300); await p.click('#pop-cert [data-action="cert-open"]', { timeout: 3000 }); await p.waitForTimeout(1000); await shot('modal_zertifikat', { full: false, noScroll: true }); await p.keyboard.press('Escape'); await p.waitForTimeout(300); });
    await T('csv', async () => { await p.goto(base + '#/trades'); await p.waitForTimeout(700); await p.evaluate(() => { const e = document.querySelector('[data-action="import"]'); if (!e) throw new Error('kein Import-Knopf'); e.click(); }); await p.waitForTimeout(600); await shot('csv_import_start', { full: false, noScroll: true }); await p.click('#import-body details summary'); await p.fill('#import-text', CSV); await p.click('#import-parse'); await p.waitForTimeout(800); await shot('csv_import_zuordnung', { full: false, noScroll: true }); await p.keyboard.press('Escape'); });
    await ctx.close();
  }
  fs.writeFileSync(path.join(OUT, 'measure' + (ONLY ? '-' + ONLY : '') + '.json'), JSON.stringify(M, null, 1));
  fs.writeFileSync(path.join(OUT, 'log' + (ONLY ? '-' + ONLY : '') + '.txt'), LOG.join('\n') + '\nERRORS:\n' + errs.join('\n') + '\n');
  await b.close(); console.log('WDONE', errs.length);
})();
