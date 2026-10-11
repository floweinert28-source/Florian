const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const base = 'file:///home/user/Florian/web/app.html'; const LOG = []; const log = m => { LOG.push(m); console.log(m); };
(async () => { const b = await chromium.launch();
  const dir = path.join(__dirname, 'shots', 'extra'); fs.mkdirSync(dir, { recursive: true });
  for (const width of [1440, 390]) {
    const mobile = width < 600;
    const ctx = await b.newContext({ viewport: { width, height: mobile ? 844 : 900 }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile }); const p = await ctx.newPage(); try { await require('../localfonts.js')(p); } catch (e) {}
    await p.goto(base, { waitUntil: 'load' }); await p.evaluate(() => { Store.installSample(); Store.setSetting('theme', 'dark'); Store.setSetting('language', 'de'); Store.saveNow(); }); await p.goto(base + '#/settings/profil'); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(900);
    const shot = async (name, full) => { await p.waitForTimeout(450); await p.screenshot({ path: path.join(dir, `hicks-settings-${width}-${name}.png`), fullPage: !!full }); log(`ok ${width} ${name}`); };
    const go = async r => { await p.goto(base + '#/settings/' + r); await p.waitForTimeout(600); };
    const click = async sel => { await p.evaluate(s => { const e = document.querySelector(s); if (!e) throw new Error('fehlt ' + s); e.click(); }, sel); await p.waitForTimeout(500); };
    const esc = async () => { await p.keyboard.press('Escape'); await p.waitForTimeout(300); };
    const tryit = async (n, f) => { try { await f(); } catch (e) { log(`FAIL ${width} ${n}: ${e.message.split('\n')[0]}`); } };
    await tryit('tags', async () => { await go('inhalte'); await click('[data-action="content-tab"][data-value="tags"]'); await shot('inhalte_tags', true); });
    await tryit('tag_dialog', async () => { await click('[data-action="tag-new"]'); await shot('dialog_tag', false); await esc(); });
    await tryit('logs_verlauf', async () => { await go('logs'); await click('[data-action="log-tab"][data-value="verlauf"]'); await shot('logs_verlauf', false); await click('[data-action="log-tab"][data-value="imports"]'); });
    await tryit('konto_dialog', async () => { await go('konten'); await click('[data-action="edit-account"][data-id]'); await shot('dialog_konto', false); await esc(); });
    await tryit('backup_dialog', async () => { await go('profil'); await click('[data-action="import-backup"][data-mode="replace"]'); await shot('dialog_sicherung_ersetzen', false); await esc(); });
    if (mobile) { await tryit('m_design', async () => { await go('design'); await shot('design', true); }); await tryit('m_trading', async () => { await go('trading'); await shot('trading', true); }); await tryit('m_benachr', async () => { await go('benachrichtigungen'); await shot('benachrichtigungen', true); }); await tryit('m_mentor', async () => { await go('mentor'); await shot('mentor', true); }); }
    await tryit('leer', async () => { await p.evaluate(() => { Store.removeSample(); Store.saveNow(); }); await p.goto(base + '#/settings/regeln'); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(800); await shot('leer_regeln', true); await go('konten'); await shot('leer_konten', true); await go('inhalte'); await shot('leer_inhalte_tags', true); await go('logs'); await click('[data-action="log-tab"][data-value="verlauf"]'); await shot('leer_logs_verlauf', true); await go('profil'); await shot('leer_profil', true); });
    await ctx.close(); }
  fs.writeFileSync(path.join(__dirname, 'atlas-hicks-settings-log.txt'), LOG.join('\n') + '\n'); await b.close(); console.log('DONE'); })();
