const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const base = 'file:///home/user/Florian/web/app.html'; const LOG = []; const log = m => { LOG.push(m); console.log(m); };
(async () => { const b = await chromium.launch(); const errs = [];
  for (const [theme, width] of [['dark', 1440], ['light', 1440], ['dark', 390]]) {
    const dir = path.join(__dirname, 'shots', `extra-${theme}-${width}`); fs.mkdirSync(dir, { recursive: true }); const mobile = width < 600;
    const ctx = await b.newContext({ viewport: { width, height: mobile ? 844 : 900 }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message)); try { await require('../localfonts.js')(p); } catch (e) {}
    await p.goto(base, { waitUntil: 'load' }); await p.evaluate(t => { Store.installSample(); Store.setSetting('theme', t); Store.setSetting('language', 'de'); Store.saveNow(); }, theme); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(600);
    const shot = async (name, full = false) => { try { await p.waitForTimeout(450); await p.screenshot({ path: path.join(dir, name + '.png'), fullPage: full }); log(`ok ${theme}-${width} ${name}`); } catch (e) { log(`FAIL ${theme}-${width} ${name}: ${e.message.split('\n')[0]}`); } };
    const step = async (name, fn, full = false) => { try { await fn(); await shot(name, full); } catch (e) { log(`FAIL ${theme}-${width} ${name}: ${e.message.split('\n')[0]}`); } try { await p.keyboard.press('Escape'); await p.waitForTimeout(250); } catch (e) {} };
    await p.goto(base + '#/dashboard'); await p.waitForTimeout(700);
    await step('menu_konto_unten', async () => { await p.click('[data-pop="user"]', { timeout: 4000 }); await p.waitForTimeout(400); });
    if (!mobile) { await step('sidebar_mini', async () => { await p.click('[data-action="sb-toggle"]', { timeout: 4000 }); await p.waitForTimeout(500); }); try { await p.click('[data-action="sb-toggle"]', { timeout: 4000 }); await p.waitForTimeout(300); } catch (e) {} }
    await step('dashboard_bearbeiten', async () => { await p.click('[data-pop="tpl"]', { timeout: 4000 }); await p.waitForTimeout(400); await p.click('#pop-tpl [data-action="dash-tpl-edit"]', { timeout: 4000 }); await p.waitForTimeout(700); }, true);
    await step('panel_widget_hinzufuegen', async () => { await p.click('[data-action="dash-add-open"]', { timeout: 4000 }); await p.waitForTimeout(700); });
    try { await p.click('[data-action="dash-cancel"]', { timeout: 3000 }); await p.waitForTimeout(400); } catch (e) {}
    await step('modal_trade_loggen_long', async () => { await p.click('[data-action="new-trade"]', { timeout: 4000 }); await p.waitForTimeout(500); await p.click('.dir-switch [data-action="set-dir"][data-value="1"], .dir-switch button:first-of-type', { timeout: 3000 }); await p.waitForTimeout(400); });
    await step('modal_trade_loggen_fehler', async () => { await p.click('[data-action="new-trade"]', { timeout: 4000 }); await p.waitForTimeout(500); await p.click('.modal button[type="submit"], .modal .btn.primary', { timeout: 3000 }); await p.waitForTimeout(500); });
    await p.goto(base + '#/day'); await p.waitForTimeout(700);
    await step('modal_checkin', async () => { await p.click('[data-action="check-in"]', { timeout: 4000 }); await p.waitForTimeout(500); });
    await step('tag_heute', async () => {}, true);
    await p.goto(base + '#/notebook'); await p.waitForTimeout(700);
    await step('notebook_neu', async () => { await p.click('[data-action="nb-new"]', { timeout: 4000 }); await p.waitForTimeout(700); }, true);
    await p.goto(base + '#/trades'); await p.waitForTimeout(700);
    await step('trades_offene', async () => { await p.click('[data-action="trades-view"][data-value="open"]', { timeout: 4000 }); await p.waitForTimeout(500); }, true);
    await step('trades_suche', async () => { await p.fill('#tf-q', 'NQ', { timeout: 4000 }); await p.waitForTimeout(600); }, true);
    await p.goto(base + '#/settings/design'); await p.waitForTimeout(700);
    await step('settings_design_voll', async () => {}, true);
    await p.goto(base + '#/mentor'); await p.waitForTimeout(700); await step('mentor_voll', async () => {}, true);
    await p.goto(base + '#/ruhepunkt'); await p.waitForTimeout(1500); await step('ruhepunkt_start', async () => {}, false);
    try { const choice = await p.$('.rp-choice, .rp-chip'); if (choice) { await choice.click(); await p.waitForTimeout(1200); await shot('ruhepunkt_schritt2'); } } catch (e) { log('ruhepunkt step fail'); }
    await ctx.close(); }
  fs.writeFileSync(path.join(__dirname, 'atlas-extra-log.txt'), LOG.join('\n') + '\nERRORS:\n' + errs.join('\n') + '\n'); await b.close(); console.log('EXTRADONE'); })();
