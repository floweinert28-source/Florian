const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const base = 'file:///home/user/Florian/web/app.html'; const OUT = path.join(__dirname, 'shots', 'extra', 'themes'); const LOG = []; const log = m => { LOG.push(m); console.log(m); };
const VARIANTS = [
  ['schwarz', { theme: 'dark', darkStyle: 'schwarz', customLook: false }],
  ['eigen-hell', { customLook: true, customBg: '#e8e4dc', theme: 'light' }],
  ['eigen-mittel', { customLook: true, customBg: '#3a4a5a', theme: 'dark' }],
  ['eigen-satt', { customLook: true, customBg: '#2a1f3d', theme: 'dark' }],
];
const only = process.argv[2];
(async () => { const b = await chromium.launch(); const errs = [];
  for (const [name, set] of VARIANTS) {
    if (only && only !== name) continue;
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(name + ': ' + e.message)); try { await require('../localfonts.js')(p); } catch (e) {}
    await p.goto(base, { waitUntil: 'load' });
    await p.evaluate(s => { Store.installSample(); Store.setSetting('language', 'de'); for (const k of Object.keys(s)) Store.setSetting(k, s[k]); Store.saveNow(); }, set);
    await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(700);
    const shot = async (n, full = false) => { try { await p.waitForTimeout(500); await p.screenshot({ path: path.join(OUT, `${name}_${n}.png`), fullPage: full }); log(`ok ${name} ${n}`); } catch (e) { log(`FAIL ${name} ${n}: ${e.message.split('\n')[0]}`); } };
    const go = async r => { await p.goto(base + '#/' + r); await p.waitForTimeout(900); };
    await go('dashboard'); await shot('dashboard', true);
    await go('stats'); await shot('stats', true);
    await go('trades'); await shot('trades', false);
    try { await p.click('[data-action="new-trade"]', { timeout: 4000 }); await p.waitForTimeout(600); await shot('modal_trade_loggen'); } catch (e) { log('FAIL modal ' + e.message.split('\n')[0]); }
    try { await p.keyboard.press('Escape'); await p.waitForTimeout(300); } catch (e) {}
    await go('prop'); await shot('prop', true);
    await go('settings/design'); await shot('settings_design', true);
    await go('notebook'); await shot('notebook');
    const vars = await p.evaluate(() => { const cs = getComputedStyle(document.documentElement); const o = {}; for (const k of ['--bg','--bg-2','--surface','--surface-2','--surface-3','--border','--border-2','--field','--text','--text-2','--muted','--faint','--accent','--profit','--loss','--be','--warn','--accent-ink']) o[k] = cs.getPropertyValue(k).trim(); o.theme = document.documentElement.dataset.theme; o.dark = document.documentElement.dataset.dark; o.bodyBg = getComputedStyle(document.body).backgroundColor; return o; });
    log(name + ' VARS ' + JSON.stringify(vars));
    await ctx.close(); }
  fs.writeFileSync(path.join(__dirname, 'themes-shots-log.txt'), LOG.join('\n') + '\nERRORS:\n' + errs.join('\n') + '\n'); await b.close(); console.log('DONE'); })();
