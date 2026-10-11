/* Eigene Aufnahmen der Tagesansicht für das Hicks-Audit: Tag mit Trades (1440/390), heute ohne Trades, leer – jeweils in voller Höhe,
   plus Inventar aller Knöpfe/Felder im Inhalt. Aufruf aus dem Scratchpad: node -r ./de-default.js audit/day-hicks.js */
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const base = 'file:///home/user/Florian/web/app.html'; const dir = path.join(__dirname, 'shots', 'extra'); fs.mkdirSync(dir, { recursive: true });
const inventory = () => {
  const c = document.querySelector('#content'); if (!c) return [];
  return [...c.querySelectorAll('button, a.btn, a.item, .seg button, .checklist .it, [data-action]')].map(e => ({
    tag: e.tagName.toLowerCase(), cls: e.className, action: e.dataset.action || e.dataset.pop || '', text: (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40), label: e.getAttribute('aria-label') || '',
    visible: !!(e.offsetWidth || e.offsetHeight), card: (e.closest('.card')?.querySelector('.card-title')?.textContent || '').trim().slice(0, 30) || (e.closest('.dash-head') ? '[Kopfreihe]' : e.closest('.row.between') ? '[Tagesnav]' : ''),
  })).filter(x => x.visible);
};
const measure = () => { const m = document.querySelector('.main') || document.body; const c = document.querySelector('#content'); return { doc: document.documentElement.scrollHeight, main: m.scrollHeight, content: c ? c.scrollHeight + (c.offsetTop || 0) : 0, scroller: getComputedStyle(m).overflowY }; };
(async () => {
  const b = await chromium.launch(); const out = {};
  for (const width of [1440, 390]) {
    const mobile = width < 600;
    const ctx = await b.newContext({ viewport: { width, height: mobile ? 844 : 900 }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
    const p = await ctx.newPage(); try { await require('../localfonts.js')(p); } catch (e) { console.log('fonts:', e.message); }
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(base, { waitUntil: 'load' }); await p.evaluate(() => { Store.installSample(); Store.setSetting('theme', 'dark'); Store.setSetting('language', 'de'); Store.saveNow(); });
    const pick = await p.evaluate(() => { const by = {}; for (const t of Store.trades()) (by[t.dayKey] = by[t.dayKey] || []).push(t); const keys = Object.keys(by); const score = k => by[k].length + (Store.day(k)?.checkIn ? 3 : 0) + (Store.dayNote(k) ? 3 : 0) + (Store.day(k)?.regime ? 1 : 0); keys.sort((a, c) => score(c) - score(a)); return { key: keys[0], n: by[keys[0]].length, checkIn: !!Store.day(keys[0])?.checkIn, note: !!Store.dayNote(keys[0]), regime: Store.day(keys[0])?.regime || null, total: keys.length }; });
    console.log(width, 'Tag mit Trades:', JSON.stringify(pick));
    const shot = async (name) => { await p.waitForTimeout(700); const m = await p.evaluate(measure); const h = Math.min(6000, Math.max(m.doc, m.main, m.content) + 40); await p.setViewportSize({ width, height: h }); await p.waitForTimeout(500); await p.screenshot({ path: path.join(dir, `hicks-day-${width}-${name}.png`), fullPage: false }); const inv = await p.evaluate(inventory); out[`${width}-${name}`] = { measure: m, height: h, inventory: inv }; console.log(`ok ${width} ${name} (h=${h}, ${inv.length} Elemente)`); await p.setViewportSize({ width, height: mobile ? 844 : 900 }); };
    await p.goto(base + '#/day/' + pick.key); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(900); await shot('mit_trades');
    await p.goto(base + '#/day'); await p.waitForTimeout(900); await shot('heute');
    /* vergangener Tag ohne Trades (zeigt den „Heute“-Knopf) */
    const past = await p.evaluate(() => { const d = new Date(); d.setDate(d.getDate() - 1); const k = Core.dayKey(d); return Store.trades().some(t => t.dayKey === k) ? null : k; });
    if (past) { await p.goto(base + '#/day/' + past); await p.waitForTimeout(900); await shot('gestern_ohne'); }
    await p.evaluate(() => { Store.removeSample(); Store.saveNow(); }); await p.goto(base + '#/day'); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(900); await shot('leer');
    if (errs.length) console.log('PAGE ERRORS', width, errs.join(' | '));
    await ctx.close();
  }
  fs.writeFileSync(path.join(__dirname, 'day-hicks-inventory.json'), JSON.stringify(out, null, 1)); await b.close(); console.log('DAYDONE');
})();
