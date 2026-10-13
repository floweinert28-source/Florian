/* Nachfinder Handy 390, Teil 2: Zertifikat mit Daten (Quadrat/Story, mit Teilen), Tag-Dialog, CSV-Import, Ruhepunkt-Start, Mentor */
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const base = 'file:///home/user/Florian/web/app.html'; const OUT = path.join(__dirname, 'shots', 'extra', 'm390'); fs.mkdirSync(OUT, { recursive: true });
const LOG = []; const log = m => { LOG.push(m); console.log(m); }; const MEAS = {};
(async () => {
  const b = await chromium.launch();
  for (const theme of ['dark', 'light']) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    const p = await ctx.newPage(); p.on('pageerror', e => log(`ERR ${theme}: ${e.message}`));
    try { await require('../localfonts.js')(p); } catch (e) {}
    await p.addInitScript(() => { if (location.hash.includes('share')) {} });
    await p.goto(base, { waitUntil: 'load' });
    await p.evaluate(t => { Store.installSample(); Store.setSetting('theme', t); Store.setSetting('language', 'de'); Store.saveNow(); }, theme);
    await p.goto(base + '#/dashboard'); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(900);
    const shot = async (name, full) => { try { await p.waitForTimeout(450); await p.screenshot({ path: path.join(OUT, `${theme}_${name}.png`), fullPage: !!full }); log(`ok ${theme} ${name}`); } catch (e) { log(`FAIL ${theme} ${name}: ${e.message.split('\n')[0]}`); } };
    const esc = async () => { await p.keyboard.press('Escape'); await p.waitForTimeout(350); };
    const meas = async name => { MEAS[`${theme}_${name}`] = await p.evaluate(() => { const m = document.querySelector('.modal'); if (!m) return null; const R = e => { if (!e) return null; const q = e.getBoundingClientRect(); return { x: Math.round(q.x), y: Math.round(q.y), w: Math.round(q.width), h: Math.round(q.height) }; }; const f = m.querySelector('.modal-foot'); return { modal: R(m), sh: m.scrollHeight, ch: m.clientHeight, head: R(m.querySelector('.modal-head')), preview: R(m.querySelector('.cert-preview')), foot: R(f), kids: f ? [...f.children].filter(x => x.offsetParent).map(x => Object.assign({ t: x.textContent.trim().slice(0, 40) }, R(x))) : [] }; }); };
    const scrollModal = async y => p.evaluate(y => { const m = document.querySelector('.modal'); if (m) m.scrollTop = y; }, y);
    /* Zertifikat mit Daten */
    try {
      const day = await p.evaluate(() => { const ts = Core.closedOnly(App.allTrades()); return ts.reduce((k, t) => t.dayKey > k ? t.dayKey : k, ''); });
      log('cert day ' + day);
      await p.evaluate(d => Certificate.open('day', d), day); await p.waitForTimeout(900); await meas('cert_quadrat'); await shot('cert_quadrat'); await scrollModal(99999); await shot('cert_quadrat_unten');
      await p.evaluate(() => { const b = document.querySelector('.modal [data-c="format"][data-v="story"]'); if (b) b.click(); }); await p.waitForTimeout(700); await scrollModal(0); await meas('cert_story'); await shot('cert_story'); await esc();
      /* mit Teilen-Knopf wie auf echten Handys */
      await p.evaluate(() => { navigator.share = () => Promise.resolve(); navigator.canShare = () => true; });
      await p.evaluate(d => Certificate.open('day', d), day); await p.waitForTimeout(900); await meas('cert_teilen'); await scrollModal(99999); await shot('cert_teilen_unten'); await esc();
    } catch (e) { log('cert fail ' + e.message); }
    /* Tag-Dialog */
    try { await p.goto(base + '#/settings/inhalte'); await p.waitForTimeout(700); const acts = await p.$$eval('#content [data-action]', a => [...new Set(a.map(x => x.dataset.action))]); log('inhalte actions ' + acts.join(',')); } catch (e) { log('inhalte fail'); }
    /* CSV-Import */
    try { await p.goto(base + '#/trades'); await p.waitForTimeout(700); const acts = await p.$$eval('[data-action*="import"], [data-action*="csv"]', a => a.map(x => x.dataset.action)); log('import actions ' + acts.join(',')); if (acts.length) { await p.evaluate(s => document.querySelector(`[data-action="${s}"]`).click(), acts[0]); await p.waitForTimeout(700); await meas('csv'); await shot('modal_csv'); await esc(); } } catch (e) { log('csv fail ' + e.message); }
    /* Ruhepunkt: Startkarten und erster Schritt */
    try { await p.goto(base + '#/ruhepunkt'); await p.waitForTimeout(900); await shot('ruhepunkt_voll', true); const acts = await p.$$eval('.rp [data-rp], .rp button', a => a.slice(0, 30).map(x => (x.dataset.rp || x.dataset.action || '') + ':' + x.textContent.trim().slice(0, 30))); log('rp buttons ' + JSON.stringify(acts)); } catch (e) { log('rp fail ' + e.message); }
    /* Mentor */
    try { await p.goto(base + '#/mentor'); await p.waitForTimeout(900); await shot('mentor_voll', true); } catch (e) {}
    await ctx.close();
  }
  fs.writeFileSync(path.join(OUT, 'meas2.json'), JSON.stringify(MEAS, null, 1)); fs.writeFileSync(path.join(OUT, 'log2.txt'), LOG.join('\n'));
  await b.close(); console.log('M390BDONE');
})();
