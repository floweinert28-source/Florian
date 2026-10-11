/* Etappe 1: alle sichtbaren deutschen Texte (Text, Platzhalter, Titel, Tooltips) der Kernbereiche einsammeln */
const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///home/user/Florian/web/app.html#/dashboard', { waitUntil: 'load' }); await p.waitForTimeout(800);
  await p.evaluate(() => { window.__ctx = {}; window.__where = 'start'; const set = I18N.startCollect(); const orig = set.add.bind(set); set.forEach(k => { window.__ctx[k] = 'Navigation und Dashboard (Startansicht)'; }); set.add = k => { if (!set.has(k)) window.__ctx[k] = window.__where; return orig(k); };
    window.__tips = () => document.querySelectorAll('[data-tip]').forEach(el => { const d = document.createElement('div'); d.innerHTML = el.getAttribute('data-tip'); const w = document.createTreeWalker(d, 4); let t; while ((t = w.nextNode())) I18N.lookup(t.nodeValue); }); });
  const where = async w => { await p.evaluate(w => { window.__where = w; I18N.translate(document.body); window.__tips(); }, w); };
  const go = async (hash, w) => { await p.evaluate(h => { location.hash = h; }, hash); await p.waitForTimeout(700); await where(w || hash); };
  const pop = async (sel, w) => { const el = await p.$(sel); if (!el) return; await el.click().catch(() => {}); await p.waitForTimeout(250); await where(w); await p.keyboard.press('Escape'); await p.mouse.click(5, 880); await p.waitForTimeout(150); };
  const modal = async (fn, w) => { await p.evaluate(fn); await p.waitForTimeout(500); await where(w); await p.evaluate(() => UI.closeModal(true)); await p.waitForTimeout(300); };
  /* Dashboard */
  await p.evaluate(() => { Store.setSetting('range', { preset: 'all', from: null, to: null }); App.rerender(); }); await p.waitForTimeout(900); await where('Dashboard');
  for (const s of ['range', 'account', 'dfilter', 'tpl', 'cert']) await pop(`.dash-head [data-pop=${s}]`, 'Dashboard: Menü ' + s);
  await p.click('.dash-head [data-pop=range]'); await p.waitForTimeout(200); await p.click('#range-from'); await p.waitForTimeout(250); await where('Kalender'); await p.keyboard.press('Escape'); await p.keyboard.press('Escape');
  await p.click('.dash-head [data-pop=tpl]'); await p.waitForTimeout(200); await p.click('#pop-tpl [data-action="dash-tpl-edit"]'); await p.waitForTimeout(400); await where('Dashboard: Bearbeiten');
  const slot = await p.$('.dash-main .add-slot, .add-slot'); if (slot) { await slot.click(); await p.waitForTimeout(500); await where('Dashboard: Widget hinzufügen'); const tabs = await p.$$('.side-panel [data-action], .side-panel .tab, .side-panel button'); for (const t of tabs.slice(0, 12)) { await t.click().catch(() => {}); await p.waitForTimeout(120); await where('Dashboard: Widget-Auswahl'); } await p.keyboard.press('Escape'); }
  await p.evaluate(() => { const c = document.querySelector('[data-action="dash-cancel"]'); if (c) c.click(); }); await p.waitForTimeout(400);
  /* Andere Dashboard-Bereiche (Widgets mit Untermenüs) */
  for (const s of await p.$$('.dash-main [data-pop]')) { await s.click().catch(() => {}); await p.waitForTimeout(200); await where('Dashboard: Widget-Menü'); await p.mouse.click(5, 880); }
  for (const s of await p.$$('.dash-main .seg button, .dash-main .tabs button, .recent-card button')) { await s.click().catch(() => {}); await p.waitForTimeout(150); await where('Dashboard: Widget-Ansicht'); }
  /* Dialoge */
  await modal(() => App.openTradeEditor(null), 'Trade-Editor (neu)');
  await modal(() => { const t = Store.trades()[0]; App.openTradeEditor(t.id); }, 'Trade-Editor (bearbeiten)');
  await modal(() => document.querySelector('[data-action=start-session]') && document.querySelector('[data-action=start-session]').click(), 'Session starten');
  /* TradeLog */
  await go('#/trades', 'TradeLog'); for (const s of await p.$$('#content [data-pop]')) { await s.click().catch(() => {}); await p.waitForTimeout(200); await where('TradeLog: Menü'); await p.mouse.click(5, 880); }
  await modal(() => document.querySelector('[data-action=import]').click(), 'TradeLog: CSV-Import');
  await modal(() => { const b = document.querySelector('[data-action=new-missed]'); if (b) b.click(); }, 'TradeLog: Verpasster Trade');
  const tid = await p.evaluate(() => App.allTrades().find(t => t.closed).id); await go('#/trades/' + tid, 'Trade-Detail');
  for (const s of await p.$$('#content [data-pop]')) { await s.click().catch(() => {}); await p.waitForTimeout(200); await where('Trade-Detail: Menü'); await p.mouse.click(5, 880); }
  /* Einstellungen */
  const secs = await p.evaluate(() => ['profil', 'design', 'sprache', 'benachrichtigungen', 'abo', 'konten', 'trading', 'regeln', 'notebook', 'mentor', 'inhalte', 'logs']);
  for (const s of secs) { await go('#/settings/' + s, 'Einstellungen: ' + s); for (const t of await p.$$('#content .set-body .tabs button, #content .set-body .seg button')) { await t.click().catch(() => {}); await p.waitForTimeout(150); await where('Einstellungen: ' + s); } }
  await go('#/settings/konten', 'Einstellungen: Konten'); await modal(() => { const b = document.querySelector('#content [data-action*="account"]'); if (b) b.click(); }, 'Einstellungen: Konto-Dialog');
  /* Kopfreihe der übrigen Seiten (Titel, Seitenknöpfe) */
  for (const r of ['day', 'stats', 'notebook', 'progress', 'shadow', 'replay', 'mentor', 'prop', 'ruhepunkt']) { await go('#/' + r, 'Seitentitel ' + r); }
  const out = await p.evaluate(() => ({ ctx: window.__ctx, data: JSON.stringify(Store.data) }));
  /* Handy-Ansicht: eigene Kopfzeile, Menüknopf und Navigation */
  const mc = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); const m = await mc.newPage(); m.on('pageerror', e => errs.push(e.message));
  await m.goto('file:///home/user/Florian/web/app.html#/dashboard', { waitUntil: 'load' }); await m.waitForTimeout(800);
  await m.evaluate(() => { window.__ctx = {}; const set = I18N.startCollect(); set.forEach(k => { window.__ctx[k] = 'Handy: Kopfzeile und Dashboard'; }); set.add = (orig => k => { if (!set.has(k)) window.__ctx[k] = window.__where || 'Handy'; return orig(k); })(set.add.bind(set)); });
  for (const [h, w] of [['#/dashboard', 'Handy: Dashboard'], ['#/trades', 'Handy: TradeLog'], ['#/settings', 'Handy: Einstellungen'], ['#/settings/profil', 'Handy: Einstellungen']]) { await m.evaluate(h => { location.hash = h; }, h); await m.waitForTimeout(700); await m.evaluate(w => { window.__where = w; I18N.translate(document.body); }, w); }
  const menu = await m.$('[data-action=menu], .menu-btn, [aria-label*=Menü]'); if (menu) { await menu.click().catch(() => {}); await m.waitForTimeout(400); await m.evaluate(() => { window.__where = 'Handy: Menü'; I18N.translate(document.body); }); }
  const mob = await m.evaluate(() => window.__ctx); Object.keys(mob).forEach(k => { if (!(k in out.ctx)) out.ctx[k] = mob[k]; });
  fs.writeFileSync(__dirname + '/' + (process.argv[2] || 'harvest-raw.json'), JSON.stringify(out.ctx, null, 1)); fs.writeFileSync(__dirname + '/store-data.json', out.data);
  console.log('gesammelt:', Object.keys(out.ctx).length, 'Fehler:', errs.join(' | ') || 'keine'); await b.close(); })();
