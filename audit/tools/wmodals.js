/* Dialoghöhen bei 1366x768 und 1280x800: Fußzeile beim Öffnen sichtbar? */
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const base = 'file:///home/user/Florian/web/app.html'; const OUT = path.join(__dirname, 'shots', 'extra', 'w');
const CSV = 'Symbol;Richtung;Eröffnung;Schluss;Einstieg;Ausstieg;Stück;Gebühren\nNQ;Long;01.10.2026 10:00;01.10.2026 10:20;21000;21050;1;4,5\nES;Short;02.10.2026 11:00;02.10.2026 11:30;5800;5790;2;4,5';
const R = {};
(async () => {
  const b = await chromium.launch();
  for (const [w, h] of [[1366, 768], [1280, 800]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' }); const p = await ctx.newPage(); try { await require('../localfonts.js')(p); } catch (e) {}
    await p.goto(base, { waitUntil: 'load' }); await p.evaluate(() => { Store.installSample(); Store.setSetting('theme', 'dark'); Store.setSetting('language', 'de'); Store.saveNow(); }); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(700);
    const m = async (name, shot) => { await p.waitForTimeout(600); const r = await p.evaluate(() => { const m = [...document.querySelectorAll('.modal')].pop(); if (!m) return null; m.scrollTop = 0; const f = m.querySelector('.modal-foot'); const mr = m.getBoundingClientRect(), fr = f && f.getBoundingClientRect(); return { h: Math.round(mr.height), sh: m.scrollHeight, ch: m.clientHeight, footTop: fr && Math.round(fr.top), vh: innerHeight, footVisible: fr ? fr.bottom <= innerHeight : null, title: (m.querySelector('h2') || {}).textContent }; }); R[`${w}x${h}/${name}`] = r; console.log(w, name, JSON.stringify(r)); if (shot) await p.screenshot({ path: path.join(OUT, `${w}-modal-${name}.png`) }); await p.keyboard.press('Escape'); await p.waitForTimeout(400); };
    const T = async (name, fn, shot) => { try { await fn(); await m(name, shot); } catch (e) { console.log('FAIL', name, e.message.split('\n')[0]); try { await p.keyboard.press('Escape'); } catch (_) {} } };
    await T('checkin', async () => { await p.goto(base + '#/dashboard'); await p.waitForTimeout(600); await p.click('[data-action="check-in"]'); }, true);
    await T('prop_konto_neu', async () => { await p.goto(base + '#/prop/konten'); await p.waitForTimeout(700); await p.click('[data-action="prop-account-new"]'); }, true);
    await T('prop_konto_edit', async () => { await p.goto(base + '#/prop/konten'); await p.waitForTimeout(700); await p.click('[data-action="prop-account-edit"]'); }, false);
    await T('prop_preset_neu', async () => { await p.goto(base + '#/prop/konten'); await p.waitForTimeout(700); await p.click('[data-action="prop-preset-new"]'); }, false);
    await T('trade_journal', async () => { await p.goto(base + '#/trades'); await p.waitForTimeout(700); const id = await p.evaluate(() => document.querySelector('tr[data-action="trade"]').dataset.id); await p.goto(base + '#/trades/' + id); await p.waitForTimeout(800); await p.click('[data-action="trade-journal"]'); }, true);
    await T('csv_zuordnung', async () => { await p.goto(base + '#/trades'); await p.waitForTimeout(700); await p.evaluate(() => document.querySelector('[data-action="import"]').click()); await p.waitForTimeout(500); await p.click('#import-body details summary'); await p.fill('#import-text', CSV); await p.click('#import-parse'); }, false);
    await T('trade_bearbeiten', async () => { await p.goto(base + '#/trades'); await p.waitForTimeout(700); const id = await p.evaluate(() => document.querySelector('tr[data-action="trade"]').dataset.id); await p.goto(base + '#/trades/' + id); await p.waitForTimeout(800); await p.click('[data-action="edit-trade"]'); }, false);
    await ctx.close();
  }
  fs.writeFileSync(path.join(OUT, 'modals.json'), JSON.stringify(R, null, 1)); await b.close(); console.log('MDONE');
})();
