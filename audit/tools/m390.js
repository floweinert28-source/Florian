/* Nachfinder Handy 390: Nebenseiten, Dialoge, Leerzustände in beiden Designs.
   Ausgabe: audit/shots/extra/m390/<theme>_<name>.png (DPR 2), reducedMotion reduce, Ganzseiten wo sinnvoll. */
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const base = 'file:///home/user/Florian/web/app.html'; const OUT = path.join(__dirname, 'shots', 'extra', 'm390'); fs.mkdirSync(OUT, { recursive: true });
const LOG = []; const log = m => { LOG.push(m); console.log(m); };
const MEAS = {};
(async () => {
  const b = await chromium.launch();
  for (const theme of ['dark', 'light']) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    const p = await ctx.newPage(); p.on('pageerror', e => log(`ERR ${theme}: ${e.message}`));
    try { await require('../localfonts.js')(p); } catch (e) {}
    await p.goto(base, { waitUntil: 'load' });
    await p.evaluate(t => { Store.installSample(); Store.setSetting('theme', t); Store.setSetting('language', 'de'); Store.saveNow(); }, theme);
    await p.goto(base + '#/dashboard'); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(900);
    const shot = async (name, full) => { try { await p.waitForTimeout(450); await p.screenshot({ path: path.join(OUT, `${theme}_${name}.png`), fullPage: !!full }); log(`ok ${theme} ${name}`); } catch (e) { log(`FAIL ${theme} ${name}: ${e.message.split('\n')[0]}`); } };
    const go = async (route, name, full = true, wait = 800) => { try { await p.goto(base + '#/' + route); await p.waitForTimeout(wait); await p.evaluate(() => window.scrollTo(0, 0)); } catch (e) { log(`FAIL goto ${route}`); } await shot(name || route.replace(/\//g, '_'), full); };
    const js = async sel => p.evaluate(s => { const e = document.querySelector(s); if (!e) throw new Error('missing ' + s); e.click(); }, sel);
    const esc = async () => { await p.keyboard.press('Escape'); await p.waitForTimeout(350); };
    const measureModal = async name => { try { MEAS[`${theme}_${name}`] = await p.evaluate(() => { const m = document.querySelector('.modal'); if (!m) return null; const r = m.getBoundingClientRect(); const f = m.querySelector('.modal-foot'); const kids = f ? [...f.children].filter(x => x.offsetParent).map(x => { const q = x.getBoundingClientRect(); return { t: x.textContent.trim().slice(0, 40), cls: x.className, x: Math.round(q.x), y: Math.round(q.y), w: Math.round(q.width), h: Math.round(q.height) }; }) : []; const cs = getComputedStyle(m); return { top: Math.round(r.top), h: Math.round(r.height), sh: m.scrollHeight, ch: m.clientHeight, pad: cs.padding, shadow: cs.boxShadow, border: cs.borderTopColor, bg: cs.backgroundColor, scrim: getComputedStyle(m.parentElement).backgroundColor, foot: f ? { y: Math.round(f.getBoundingClientRect().y), h: Math.round(f.getBoundingClientRect().height) } : null, kids }; }); } catch (e) { log('meas fail ' + name); } };
    /* Dialoge */
    try { await p.evaluate(() => App.openCheckIn(Core.dayKey(new Date()))); } catch (e) { try { await p.evaluate(() => { const b = document.createElement('button'); b.dataset.action = 'check-in'; document.body.appendChild(b); b.click(); }); } catch (e2) { log('checkin fail'); } }
    await p.waitForTimeout(500); await measureModal('modal_checkin'); await shot('modal_checkin'); await p.evaluate(() => { const m = document.querySelector('.modal'); if (m) m.scrollTop = 99999; }); await shot('modal_checkin_unten'); await esc();
    try { await js('[data-action="new-trade"]'); await p.waitForTimeout(500); await measureModal('modal_trade'); await p.evaluate(() => { const m = document.querySelector('.modal'); if (m) m.scrollTop = 99999; }); await shot('modal_trade_unten'); await esc(); } catch (e) { log('trade fail ' + e.message); }
    /* Zertifikat mit Daten */
    try { const day = await p.evaluate(() => { const t = Store.data.trades.filter(t => t.close).sort((a, b) => b.open - a.open)[0]; return t.dayKey; }); await p.evaluate(d => Certificate.open('day', d), day); await p.waitForTimeout(900); await measureModal('modal_zertifikat'); await shot('modal_zertifikat_daten'); await p.evaluate(() => { const m = document.querySelector('.modal'); if (m) m.scrollTop = 99999; }); await shot('modal_zertifikat_unten'); await esc(); } catch (e) { log('cert fail ' + e.message); }
    /* Menü, Konto-Menü */
    try { await js('[data-action="sidebar"]'); await p.waitForTimeout(600); await shot('mobile_menue'); await p.evaluate(() => { const s = document.getElementById('sidebar'); s.scrollTop = 9999; }); await shot('mobile_menue_unten'); await js('[data-pop="user"]'); await p.waitForTimeout(500); await shot('menu_konto_unten'); await esc(); await esc(); } catch (e) { log('menu fail ' + e.message); }
    await p.goto(base + '#/dashboard'); await p.waitForTimeout(700);
    try { const has = await p.$('[data-pop="account"]'); log('pop account present: ' + !!has + (has ? ' visible ' + await has.isVisible() : '')); if (has && await has.isVisible()) { await has.click(); await shot('pop_konto'); await esc(); } } catch (e) { log('pop_konto fail ' + e.message); }
    /* Widget-Panel */
    try { await js('[data-pop="tpl"]'); await p.waitForTimeout(300); await js('#pop-tpl [data-action="dash-tpl-edit"]'); await p.waitForTimeout(700); await js('[data-action="dash-add-open"]'); await p.waitForTimeout(700); await shot('panel_widget'); MEAS[`${theme}_panel`] = await p.evaluate(() => { const pn = document.querySelector('.side-panel'); const r = pn ? pn.getBoundingClientRect() : null; return pn ? { cls: pn.className, x: r.x, y: r.y, w: r.width, h: r.height } : null; }); await p.evaluate(() => { const pn = document.querySelector('.side-panel .sp-list'); if (pn) pn.scrollTop = 1200; }); await shot('panel_widget_mitte'); await esc(); await js('[data-action="dash-cancel"]'); await p.waitForTimeout(400); } catch (e) { log('panel fail ' + e.message); }
    /* Nebenseiten */
    for (const r of ['settings/konten', 'settings/logs', 'settings/inhalte', 'settings/regeln', 'settings/abo', 'settings/benachrichtigungen', 'settings/sprache', 'settings/notebook', 'settings/mentor', 'settings/profil', 'settings/trading', 'settings/design', 'ruhepunkt', 'mentor', 'news', 'coach', 'affiliate', 'coupons', 'prop', 'prop/konten', 'prop/bilanz', 'prop/friedhof']) await go(r);
    /* Dialoge aus Nebenseiten */
    try { await p.goto(base + '#/settings/konten'); await p.waitForTimeout(600); await js('[data-action="edit-account"]'); await p.waitForTimeout(500); await measureModal('modal_konto'); await shot('modal_konto'); await esc(); } catch (e) { log('konto modal fail ' + e.message); }
    try { await p.goto(base + '#/settings/inhalte'); await p.waitForTimeout(600); await js('[data-action="tag-new"]'); await p.waitForTimeout(500); await measureModal('modal_tag'); await shot('modal_tag'); await esc(); } catch (e) { log('tag modal fail ' + e.message); }
    try { await p.goto(base + '#/prop/konten'); await p.waitForTimeout(600); await js('[data-action="prop-account-new"]'); await p.waitForTimeout(600); await measureModal('modal_prop_konto'); await shot('modal_prop_konto'); await p.evaluate(() => { const m = document.querySelector('.modal'); if (m) m.scrollTop = 99999; }); await shot('modal_prop_konto_unten'); await esc(); } catch (e) { log('prop modal fail ' + e.message); }
    try { await p.evaluate(() => { UI.confirmModal('Konto löschen?', 'Alle Trades dieses Kontos bleiben erhalten.', { danger: true, ok: "Löschen" }); }); await p.waitForTimeout(500); await measureModal('modal_confirm'); await shot('modal_confirm'); await esc(); } catch (e) { log('confirm fail ' + e.message); }
    /* Leerzustände */
    try { await p.evaluate(() => { Store.removeSample(); Store.saveNow(); }); await p.goto(base + '#/dashboard'); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(800); await shot('leer_dashboard', true); } catch (e) { log('leer fail ' + e.message); }
    for (const r of ['trades', 'stats', 'shadow', 'progress', 'prop', 'prop/konten', 'prop/bilanz', 'prop/friedhof', 'notebook', 'mentor', 'coach', 'day', 'settings/konten', 'settings/logs', 'settings/regeln', 'affiliate', 'coupons', 'news']) await go(r, 'leer_' + r.replace(/\//g, '_'));
    try { await p.goto(base + '#/dashboard'); await p.waitForTimeout(600); await p.evaluate(() => Certificate.open('day', null)); await p.waitForTimeout(700); await shot('leer_modal_zertifikat'); await esc(); } catch (e) { log('leer cert fail ' + e.message); }
    await ctx.close();
  }
  fs.writeFileSync(path.join(OUT, 'meas.json'), JSON.stringify(MEAS, null, 1)); fs.writeFileSync(path.join(OUT, 'log.txt'), LOG.join('\n'));
  await b.close(); console.log('M390DONE');
})();
