const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const base = 'file:///home/user/Florian/web/app.html'; const log = m => console.log(m);
(async () => { const b = await chromium.launch();
  for (const width of [1440, 390]) {
    const dir = path.join(__dirname, 'shots', 'extra'); const mobile = width < 600;
    const ctx = await b.newContext({ viewport: { width, height: mobile ? 844 : 900 }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
    const p = await ctx.newPage(); try { await require('../localfonts.js')(p); } catch (e) {}
    await p.goto(base, { waitUntil: 'load' });
    const sample = async () => { await p.evaluate(() => { Store.installSample(); Store.setSetting('theme', 'dark'); Store.setSetting('language', 'de'); Store.saveNow(); }); };
    await sample();
    const shot = async (name, full) => { await p.waitForTimeout(600); await p.screenshot({ path: path.join(dir, `hicks-prop-${width}-${name}.png`), fullPage: !!full }); log(`ok ${width} ${name}`); };
    const go = async (h) => { await p.goto(base + h); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(1200); };
    const click = async sel => { await p.evaluate(s => { const el = document.querySelector(s); if (!el) throw new Error('fehlt ' + s); el.click(); }, sel); await p.waitForTimeout(700); };
    const T = async (name, fn) => { try { await fn(); } catch (e) { log(`FAIL ${width} ${name}: ${e.message.split('\n')[0]}`); } try { await p.keyboard.press('Escape'); } catch (e) {} };
    await T('bilanz', async () => { await go('#/prop/bilanz'); await shot('bilanz', true); });
    await T('bilanz_planer', async () => { await go('#/prop/payout'); await shot('bilanz_planer', true); });
    await T('bilanz_form_offen', async () => { await go('#/prop/bilanz'); await click('[data-action="prop-entry"][data-value="expense"]'); await shot('bilanz_ausgabe_offen', true); });
    await T('cockpit_abgeschlossen', async () => { await go('#/prop/cockpit'); await click('.prop-fold[data-fold="ended"] > summary'); await shot('cockpit_abgeschlossen', true); });
    await T('konten_folds', async () => { await go('#/prop/konten'); await click('.prop-fold[data-fold="presets"] > summary'); await click('.prop-fold[data-fold="ampel"] > summary'); await shot('konten_offen', true); });
    await T('modal_konto_neu', async () => { await go('#/prop/cockpit'); await click('[data-action="prop-account-new"]'); await shot('modal_konto_neu', false); await p.evaluate(() => { const m = document.querySelector('.modal'); if (m) m.scrollTop = 99999; const f = document.querySelector('.modal form'); if (f) f.scrollTop = 99999; document.querySelectorAll('.modal *').forEach(x => { if (x.scrollHeight > x.clientHeight + 20) x.scrollTop = 99999; }); }); await shot('modal_konto_neu_unten', false); });
    await T('modal_konto_edit', async () => { await go('#/prop/cockpit'); await click('.prop-card [data-action="prop-account-edit"]'); await p.evaluate(() => { document.querySelectorAll('.modal *').forEach(x => { if (x.scrollHeight > x.clientHeight + 20) x.scrollTop = 99999; }); }); await shot('modal_konto_edit_unten', false); });
    await T('modal_assign', async () => { await go('#/prop/cockpit'); await click('.prop-card [data-action="prop-assign"]'); await shot('modal_assign', false); });
    await T('modal_preset_neu', async () => { await go('#/prop/konten'); await click('.prop-fold[data-fold="presets"] > summary'); await click('[data-action="prop-preset-new"]'); await shot('modal_preset_neu', false); });
    /* Regel verletzt: geplatztes FTMO-Konto wieder aktiv setzen */
    await T('cockpit_breach', async () => { await p.evaluate(() => { const a = Store.propAccounts().find(x => x.status === 'breached'); if (a) Store.updatePropAccount(a.id, { status: 'active' }); Store.saveNow(); }); await go('#/prop/cockpit'); await shot('cockpit_breach', true); await sample(); });
    /* leer: Konten da, aber keine Ausgaben/Payouts */
    await T('bilanz_leer', async () => { await p.evaluate(() => { for (const e of Store.propExpenses().slice()) Store.deletePropExpense(e.id); for (const x of Store.propPayouts().slice()) Store.deletePropPayout(x.id); Store.saveNow(); }); await go('#/prop/bilanz'); await shot('bilanz_ohne_buchungen', true); });
    /* ganz leer */
    await T('ganz_leer', async () => { await p.evaluate(() => { for (const a of Store.propAccounts().slice()) Store.deletePropAccount(a.id); for (const e of Store.propExpenses().slice()) Store.deletePropExpense(e.id); for (const x of Store.propPayouts().slice()) Store.deletePropPayout(x.id); Store.saveNow(); }); await go('#/prop/bilanz'); await shot('leer_bilanz', true); await go('#/prop/friedhof'); await shot('leer_friedhof', true); await go('#/prop/konten'); await shot('leer_konten', true); });
    await ctx.close();
  }
  await b.close();
})();
