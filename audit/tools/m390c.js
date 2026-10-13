/* Nachfinder Handy 390, Teil 3: Einstellungs-Tabellen messen, Widget-Panel messen, Vorschlags-CSS für Sheets probehalber testen */
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const base = 'file:///home/user/Florian/web/app.html'; const OUT = path.join(__dirname, 'shots', 'extra', 'm390'); fs.mkdirSync(OUT, { recursive: true });
const LOG = []; const log = m => { LOG.push(m); console.log(m); }; const MEAS = {};
const PROBE_CSS = `@media (max-width: 560px) {
  .modal:has(.modal-head) { padding-top: 0; }
  .modal:has(.modal-foot) { padding-bottom: 0; }
  .modal .modal-head { position: sticky; top: 0; z-index: 2; margin: 0 -16px; padding: 18px 16px 10px; background: var(--surface); }
  .modal .modal-foot { position: sticky; bottom: 0; z-index: 2; margin: 0 -16px; padding: 10px 16px calc(16px + env(safe-area-inset-bottom, 0px)); background: var(--surface); }
  .modal-foot > .btn { flex: 1 1 auto; justify-content: center; }
  .modal-foot > .left:not(.btn) { flex: 1 0 100%; margin-right: 0; }
  .modal-foot > .btn.left { flex: 0 0 auto; }
}`;
(async () => {
  const b = await chromium.launch();
  for (const theme of ['dark', 'light']) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    const p = await ctx.newPage(); p.on('pageerror', e => log(`ERR ${theme}: ${e.message}`));
    try { await require('../localfonts.js')(p); } catch (e) {}
    await p.goto(base, { waitUntil: 'load' });
    await p.evaluate(t => { Store.installSample(); Store.setSetting('theme', t); Store.setSetting('language', 'de'); Store.saveNow(); }, theme);
    await p.goto(base + '#/dashboard'); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(900);
    const shot = async (name, full) => { await p.waitForTimeout(400); await p.screenshot({ path: path.join(OUT, `${theme}_${name}.png`), fullPage: !!full }); log(`ok ${theme} ${name}`); };
    const esc = async () => { await p.keyboard.press('Escape'); await p.waitForTimeout(350); };
    const tblMeasure = async key => { MEAS[`${theme}_${key}`] = await p.evaluate(() => [...document.querySelectorAll('#content .tbl-wrap')].map(w => { const wr = w.getBoundingClientRect(); return { wrapW: Math.round(wr.width), scrollW: w.scrollWidth, heads: [...w.querySelectorAll('thead th')].map(th => { const r = th.getBoundingClientRect(); return { t: th.textContent.trim() || '(leer)', x: Math.round(r.x - wr.x), w: Math.round(r.width), visible: r.right <= wr.right + 1 }; }), empty: (() => { const e = w.querySelector('.empty'); if (!e) return null; const r = e.getBoundingClientRect(); const b = e.querySelector('b'); const br = b ? b.getBoundingClientRect() : null; return { x: Math.round(r.x), w: Math.round(r.width), title: b ? b.textContent : '', titleRight: br ? Math.round(br.right) : null, wrapRight: Math.round(wr.right) }; })() }; })); };
    /* Einstellungs-Tabellen */
    await p.goto(base + '#/settings/konten'); await p.waitForTimeout(700); await tblMeasure('konten');
    await p.goto(base + '#/settings/inhalte'); await p.waitForTimeout(700); await tblMeasure('inhalte_kategorien');
    await p.evaluate(() => document.querySelector('[data-action="content-tab"][data-value="tags"]').click()); await p.waitForTimeout(600); await tblMeasure('inhalte_tags'); await shot('settings_inhalte_tags', true);
    await p.goto(base + '#/settings/logs'); await p.waitForTimeout(700); await tblMeasure('logs_imports');
    await p.evaluate(() => document.querySelector('[data-action="log-tab"][data-value="verlauf"]').click()); await p.waitForTimeout(600); await tblMeasure('logs_verlauf'); await shot('settings_logs_verlauf', true);
    /* Widget-Panel messen */
    try { await p.goto(base + '#/dashboard'); await p.waitForTimeout(700); await p.evaluate(() => document.querySelector('[data-pop="tpl"]').click()); await p.waitForTimeout(300); await p.evaluate(() => document.querySelector('#pop-tpl [data-action="dash-tpl-edit"]').click()); await p.waitForTimeout(700); await p.evaluate(() => document.querySelector('[data-action="dash-add-open"]').click()); await p.waitForTimeout(700);
      MEAS[`${theme}_panel_items`] = await p.evaluate(() => { const its = [...document.querySelectorAll('.side-panel .sp-item')]; const R = e => { const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; }; return { count: its.length, items: its.slice(0, 4).map(i => ({ h: Math.round(i.getBoundingClientRect().height), pv: R(i.querySelector('.pv')), btn: R(i.querySelector('.btn')) })), listH: Math.round(document.querySelector('.side-panel .sp-list').scrollHeight), listClient: document.querySelector('.side-panel .sp-list').clientHeight }; });
      await esc(); await p.evaluate(() => document.querySelector('[data-action="dash-cancel"]').click()); await p.waitForTimeout(400); } catch (e) { log('panel fail ' + e.message); }
    /* Vorschlags-CSS testen */
    await p.addStyleTag({ content: PROBE_CSS }); await p.waitForTimeout(200);
    const meas = async name => { MEAS[`${theme}_probe_${name}`] = await p.evaluate(() => { const m = document.querySelector('.modal'); const R = e => { if (!e) return null; const q = e.getBoundingClientRect(); return { x: Math.round(q.x), y: Math.round(q.y), w: Math.round(q.width), h: Math.round(q.height) }; }; const f = m.querySelector('.modal-foot'); return { modal: R(m), sh: m.scrollHeight, ch: m.clientHeight, head: R(m.querySelector('.modal-head')), foot: R(f), kids: f ? [...f.children].filter(x => x.offsetParent).map(x => Object.assign({ t: x.textContent.trim().slice(0, 30) }, R(x))) : [] }; }); };
    try { await p.goto(base + '#/prop/konten'); await p.waitForTimeout(700); await p.evaluate(() => document.querySelector('[data-action="prop-account-new"]').click()); await p.waitForTimeout(600); await p.evaluate(() => { document.querySelector('.modal').scrollTop = 900; }); await p.waitForTimeout(200); await meas('prop_mitte'); await shot('probe_prop_mitte'); await esc(); } catch (e) { log('probe prop fail ' + e.message); }
    try { const day = await p.evaluate(() => Core.closedOnly(App.allTrades()).reduce((k, t) => t.dayKey > k ? t.dayKey : k, '')); await p.evaluate(() => { navigator.share = () => Promise.resolve(); navigator.canShare = () => true; }); await p.evaluate(d => Certificate.open('day', d), day); await p.waitForTimeout(900); await meas('cert'); await shot('probe_cert'); await esc(); } catch (e) { log('probe cert fail ' + e.message); }
    try { await p.goto(base + '#/dashboard'); await p.waitForTimeout(600); await p.evaluate(() => App.openCheckIn(Core.dayKey(new Date()))); await p.waitForTimeout(500); await meas('checkin'); await shot('probe_checkin'); await esc(); } catch (e) { log('probe ci fail ' + e.message); }
    try { await p.evaluate(() => document.querySelector('[data-action="new-trade"]').click()); await p.waitForTimeout(500); await meas('trade'); await shot('probe_trade'); await esc(); } catch (e) { log('probe trade fail ' + e.message); }
    try { await p.evaluate(() => { UI.confirmModal('Konto löschen?', 'Alle Trades dieses Kontos bleiben erhalten.', { danger: true, ok: 'Löschen' }); }); await p.waitForTimeout(500); await meas('confirm'); await shot('probe_confirm'); await esc(); } catch (e) { log('probe confirm fail ' + e.message); }
    await ctx.close();
  }
  fs.writeFileSync(path.join(OUT, 'meas3.json'), JSON.stringify(MEAS, null, 1)); fs.writeFileSync(path.join(OUT, 'log3.txt'), LOG.join('\n'));
  await b.close(); console.log('M390CDONE');
})();
