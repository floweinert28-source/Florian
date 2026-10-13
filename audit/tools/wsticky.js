const { chromium } = require('playwright');
const base = 'file:///home/user/Florian/web/app.html';
const CSV = 'Symbol;Richtung;Eröffnung;Schluss;Einstieg;Ausstieg;Stück;Gebühren\nNQ;Long;01.10.2026 10:00;01.10.2026 10:20;21000;21050;1;4,5';
const CSS = '.modal-foot { position: sticky; bottom: -22px; z-index: 2; background: var(--surface); margin-bottom: -22px; padding-bottom: 22px; }';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce' }); const p = await ctx.newPage(); try { await require('../localfonts.js')(p); } catch (e) {}
  await p.goto(base, { waitUntil: 'load' }); await p.evaluate(() => { Store.installSample(); Store.setSetting('theme', 'dark'); Store.setSetting('language', 'de'); Store.saveNow(); }); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(600);
  await p.addStyleTag({ content: CSS });
  const meas = async (n) => { await p.waitForTimeout(500); const r = await p.evaluate(() => { const m = [...document.querySelectorAll('.modal')].pop(); m.scrollTop = 0; const f = m.querySelector('.modal-foot').getBoundingClientRect(); const mr = m.getBoundingClientRect(); const top0 = Math.round(f.top); m.scrollTop = m.scrollHeight; const f2 = m.querySelector('.modal-foot').getBoundingClientRect(); return { modalBottom: Math.round(mr.bottom), footTop0: top0, footBottom0: Math.round(f.bottom), footBottomEnd: Math.round(f2.bottom), sh: m.scrollHeight, ch: m.clientHeight }; }); console.log(n, JSON.stringify(r)); await p.evaluate(() => { const m = [...document.querySelectorAll('.modal')].pop(); m.scrollTop = 0; }); await p.waitForTimeout(200); await p.screenshot({ path: `audit/shots/extra/w/1366-probe-sticky-${n}.png` }); await p.keyboard.press('Escape'); await p.waitForTimeout(400); };
  await p.goto(base + '#/prop/konten'); await p.waitForTimeout(700); await p.click('[data-action="prop-account-new"]'); await meas('prop_konto');
  await p.goto(base + '#/trades'); await p.waitForTimeout(700); await p.evaluate(() => document.querySelector('[data-action="import"]').click()); await p.waitForTimeout(500); await p.click('#import-body details summary'); await p.fill('#import-text', CSV); await p.click('#import-parse'); await meas('csv');
  await p.goto(base + '#/dashboard'); await p.waitForTimeout(600); await p.click('[data-action="new-trade"]'); await meas('trade');
  await b.close();
})();
