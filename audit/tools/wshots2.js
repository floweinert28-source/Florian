/* Ergänzung: trade_detail, day mit Trades (richtige IDs), CSV-Scrollprobe; 1280/1366 offen+mini, 1024 hell */
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const base = 'file:///home/user/Florian/web/app.html'; const OUT = path.join(__dirname, 'shots', 'extra', 'w');
const CSV = 'Symbol;Richtung;Eröffnung;Schluss;Einstieg;Ausstieg;Stück;Gebühren\nNQ;Long;01.10.2026 10:00;01.10.2026 10:20;21000;21050;1;4,5\nES;Short;02.10.2026 11:00;02.10.2026 11:30;5800;5790;2;4,5';
const CONTEXTS = [
  { tag: '1280-open', w: 1280, h: 800, theme: 'dark', mini: false },
  { tag: '1280-mini', w: 1280, h: 800, theme: 'dark', mini: true },
  { tag: '1366-open', w: 1366, h: 768, theme: 'dark', mini: false },
  { tag: '1366-mini', w: 1366, h: 768, theme: 'dark', mini: true },
  { tag: '1024-light', w: 1024, h: 768, theme: 'light', mini: false },
];
const M = {};
(async () => {
  const b = await chromium.launch();
  for (const C of CONTEXTS) {
    const ctx = await b.newContext({ viewport: { width: C.w, height: C.h }, reducedMotion: 'reduce' }); const p = await ctx.newPage(); try { await require('../localfonts.js')(p); } catch (e) {}
    await p.goto(base, { waitUntil: 'load' });
    await p.evaluate(c => { Store.installSample(); Store.setSetting('theme', c.theme); Store.setSetting('language', 'de'); Store.setSetting('sidebarMini', c.mini); Store.saveNow(); }, C);
    await p.goto(base + '#/trades'); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(900);
    const scrollAll = async () => { await p.evaluate(async () => { const el = document.scrollingElement; const h = el.scrollHeight; for (let y = 0; y < h; y += 300) { el.scrollTop = y; await new Promise(r => setTimeout(r, 70)); } el.scrollTop = 0; }); await p.waitForTimeout(400); };
    const meas = () => p.evaluate(() => { const out = { clip: [], svg: [] }; const root = document.querySelector('#content'); const sel = el => el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : '');
      root.querySelectorAll('*').forEach(el => { if (el.closest('svg')) return; const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); if (!r.width) return; if (['hidden', 'auto', 'scroll', 'clip'].includes(cs.overflowX) && el.scrollWidth > el.clientWidth + 2) out.clip.push({ s: (el.parentElement ? sel(el.parentElement) + ' > ' : '') + sel(el), sw: el.scrollWidth, cw: el.clientWidth, t: el.textContent.trim().replace(/\s+/g, ' ').slice(0, 70) }); });
      out.grids = [...root.querySelectorAll('.grid')].map(g => { const kids = [...g.children].filter(k => k.getBoundingClientRect().width > 0); const rows = {}; kids.forEach(k => { const t = Math.round(k.getBoundingClientRect().top); const key = Object.keys(rows).find(x => Math.abs(x - t) < 4) || t; rows[key] = (rows[key] || 0) + 1; }); return { s: sel(g), rows: Object.values(rows), w: [...new Set(kids.map(k => Math.round(k.getBoundingClientRect().width)))] }; });
      return out; });
    try {
      const t = await p.evaluate(() => { const r = document.querySelector('tr[data-action="trade"]'); const id = r && r.dataset.id; const tr = id && Store.getTrade(id); return { id, day: tr ? Core.dayKey(new Date(tr.openedAt)) : null }; });
      await p.goto(base + '#/trades/' + t.id); await p.waitForTimeout(900); await scrollAll(); await p.screenshot({ path: path.join(OUT, `${C.tag}-trade_detail.png`), fullPage: true }); M[C.tag + '/trade_detail'] = await meas(); console.log('ok', C.tag, 'trade_detail');
      await p.goto(base + '#/day/' + t.day); await p.waitForTimeout(900); await scrollAll(); await p.screenshot({ path: path.join(OUT, `${C.tag}-day_mit_trades.png`), fullPage: true }); M[C.tag + '/day'] = await meas(); console.log('ok', C.tag, 'day');
    } catch (e) { console.log('FAIL', C.tag, e.message.split('\n')[0]); }
    if (C.tag === '1366-open') {
      try { await p.goto(base + '#/trades'); await p.waitForTimeout(700); await p.evaluate(() => document.querySelector('[data-action="import"]').click()); await p.waitForTimeout(600); await p.click('#import-body details summary'); await p.fill('#import-text', CSV);
        const before = await p.evaluate(() => { const m = document.querySelector('.modal'); return { st: m.scrollTop, sh: m.scrollHeight, ch: m.clientHeight }; });
        await p.click('#import-parse'); await p.waitForTimeout(800);
        const after = await p.evaluate(() => { const m = document.querySelector('.modal'); return { st: m.scrollTop, sh: m.scrollHeight, ch: m.clientHeight, active: document.activeElement && (document.activeElement.id || document.activeElement.className || document.activeElement.tagName), mapping: [...document.querySelectorAll('#import-body select')].map(s => s.closest('tr, .row, div') && (s.closest('tr') || s.parentElement.parentElement).textContent.trim().replace(/\s+/g, ' ').slice(0, 40) + ' => ' + s.options[s.selectedIndex].text) }; });
        M.csv = { before, after }; await p.evaluate(() => { document.querySelector('.modal').scrollTop = 0; }); await p.waitForTimeout(300); await p.screenshot({ path: path.join(OUT, `${C.tag}-csv_import_oben.png`) }); console.log('ok csv');
      } catch (e) { console.log('FAIL csv', e.message.split('\n')[0]); }
    }
    await ctx.close();
  }
  fs.writeFileSync(path.join(OUT, 'measure2.json'), JSON.stringify(M, null, 1)); await b.close(); console.log('W2DONE');
})();
