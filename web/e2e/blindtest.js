const { chromium } = require('playwright');
const base = 'file:///home/user/Florian/web/app.html';
const out = []; const ok = (n, c, x = '') => out.push(`${c ? 'PASS' : 'FAIL'} ${n}${x ? ' · ' + x : ''}`);
const leaks = p => p.evaluate(() => { const o = []; const w = document.createTreeWalker(document.getElementById('main'), NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) if (/€|\bEUR\b/.test(n.nodeValue)) o.push(n.nodeValue.trim().slice(0, 50)); return o; });
(async () => {
  const browser = await chromium.launch(); const errs = [];
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto(base + '#/dashboard', { waitUntil: 'load' }); await p.evaluate(() => localStorage.clear()); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(700);
  ok('Standard: Modus aus, € sichtbar', (await leaks(p)).length > 0 && await p.evaluate(() => Store.settings.moneyBlind === false));
  for (const r of ['dashboard', 'trades', 'day', 'stats', 'progress', 'notebook', 'mentor', 'ruhepunkt', 'settings/profil']) { await p.evaluate(h => { location.hash = '#/' + h; }, r); await p.waitForTimeout(250); if (await p.$('[data-action=blind-toggle]')) ok('Schalter nur in Einstellungen → Trading, nicht auf ' + r, false); }
  await p.evaluate(() => { location.hash = '#/settings/trading'; }); await p.waitForTimeout(400);
  ok('Schalter unter Einstellungen → Trading', !!(await p.$('[data-action=blind-toggle]')));
  await p.click('[data-action=blind-toggle]'); await p.waitForTimeout(300);
  ok('Einschalten speichert', await p.evaluate(() => Store.settings.moneyBlind === true) && await p.$eval('[data-action=blind-toggle]', e => e.getAttribute('aria-checked') === 'true'));
  await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(400); ok('Bleibt nach Neuladen', await p.evaluate(() => Store.settings.moneyBlind === true));
  const routes = ['trades', 'dashboard', 'day', 'stats', 'stats/tage', 'stats/setups', 'stats/zeit', 'stats/fehler', 'stats/marktphase', 'stats/zustand', 'stats/edge', 'stats/montecarlo', 'progress', 'notebook', 'mentor', 'ruhepunkt'];
  let total = 0;
  for (const r of routes) { await p.evaluate(h => { location.hash = '#/' + h; }, r); await p.waitForTimeout(650); const l = await leaks(p); total += l.length; if (l.length) ok('Kein € auf ' + r, false, l.slice(0, 3).join(' | ')); }
  ok('Kein € auf allen Routen', total === 0);
  await p.evaluate(() => { location.hash = '#/stats'; }); await p.waitForTimeout(600);
  ok('R-Werte statt Beträge', await p.evaluate(() => (document.getElementById('main').innerText.match(/ R\b/g) || []).length > 10));
  // Trade-Editor-Vorschau
  await p.keyboard.press('n'); await p.waitForTimeout(350); await p.click('#f-dir [data-value="1"]');
  await p.fill('#trade-form [name=entryPrice]', '100'); await p.fill('#trade-form [name=exitPrice]', '110'); 
  const closedAt = await p.$('#trade-form [name=closedAt]'); if (closedAt) { await p.fill('#trade-form [name=closedAt]', '2026-09-30T12:00'); }
  await p.dispatchEvent('#trade-form [name=exitPrice]', 'input'); await p.waitForTimeout(250);
  const prev = await p.textContent('#trade-preview');
  ok('Editor-Vorschau zeigt R statt €', !/€/.test(prev) && / R/.test(prev), prev.trim().slice(0, 80));
  await p.click('.modal [data-close]'); await p.waitForTimeout(300);
  // Trade ohne Stop → „– R“, Trade mit Stop → exaktes R
  const ids = await p.evaluate(() => { const now = new Date(); const a = Store.addTrade({ symbol: 'TEST', direction: 1, openedAt: new Date(now - 7200000).toISOString(), closedAt: new Date(now - 3600000).toISOString(), entryPrice: 100, exitPrice: 110, quantity: 1, multiplier: 1, fees: 0, mistakes: [], emotions: [], rulesBroken: [], screenshots: [], voiceNotes: [] }); const b = Store.addTrade({ symbol: 'STOP', direction: 1, openedAt: new Date(now - 7000000).toISOString(), closedAt: new Date(now - 3500000).toISOString(), entryPrice: 100, exitPrice: 110, plannedStop: 95, quantity: 1, multiplier: 1, fees: 0, mistakes: [], emotions: [], rulesBroken: [], screenshots: [], voiceNotes: [] }); Store.saveNow(); return [a.id, b.id]; });
  await p.evaluate(() => { location.hash = '#/trades'; }); await p.waitForTimeout(700);
  const rowA = await p.evaluate(id => { const tr = document.querySelector(`tr[data-id="${id}"]`); return tr ? tr.innerText : ''; }, ids[0]);
  const rowB = await p.evaluate(id => { const tr = document.querySelector(`tr[data-id="${id}"]`); return tr ? tr.innerText : ''; }, ids[1]);
  ok('Trade ohne Stop zeigt „– R“', rowA.includes('– R'), rowA.replace(/\s+/g, ' ').slice(0, 80));
  const exact = await p.evaluate(id => UI.fmt.r(Core.derive(Store.getTrade(id)).r, true), ids[1]);
  ok('Trade mit Stop zeigt exaktes R', rowB.includes(exact), exact + ' in ' + rowB.replace(/\s+/g, ' ').slice(0, 80));
  // Kontostand ausgeblendet (Widgets)
  await p.evaluate(() => { const d = Store.data.dashboards[0]; d.layout.oben = [{ typ: 'kontostand_pnl' }]; d.layout.unten = [{ typ: 'kontostand', groesse: 'klein' }]; Store.saveNow(); location.hash = '#/dashboard'; }); await p.waitForTimeout(900);
  const dash = await p.evaluate(() => document.getElementById('main').innerText);
  ok('Kontostand-Kachel und -Verlauf ausgeblendet', dash.includes('ausgeblendet') && dash.includes('Kontostand ausgeblendet'), dash.replace(/\s+/g, ' ').slice(0, 120));
  // R-Einheit
  await p.evaluate(() => { Store.setSetting('blindRUnit', 100); Store.saveNow(); location.hash = '#/stats'; }); await p.waitForTimeout(700);
  const exp = await p.evaluate(() => UI.fmt.r(Core.summary(App.tradesInRange(App.allTrades())).total / 100, false));
  ok('R-Einheit aus Einstellung wird genutzt', await p.evaluate(x => document.getElementById('main').innerText.includes(x), exp), exp);
  // Zertifikat
  await p.evaluate(() => { location.hash = '#/dashboard'; }); await p.waitForTimeout(700);
  const certBtn = await p.$('[data-action=cert-menu], [data-pop=cert]'); if (certBtn) { await certBtn.click(); await p.waitForTimeout(200); const item = await p.$('.popover.open .item, .popover.open button'); if (item) { await item.click(); await p.waitForTimeout(600); } }
  const certState = await p.evaluate(() => { const m = document.querySelector('.cert-modal'); if (!m) return null; const cb = m.querySelector('input[data-c=hide]'); const txt = m.querySelector('.cert') ? m.querySelector('.cert').innerText : ''; return { checked: cb && cb.checked, disabled: cb && cb.disabled, euro: /€/.test(txt) }; });
  ok('Zertifikat: Ausblenden erzwungen, kein €', certState ? certState.checked && certState.disabled && !certState.euro : false, JSON.stringify(certState));
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  // Export/Import behält den Modus; Ausschalten
  const kept = await p.evaluate(async () => { const txt = await Store.exportJSON(false); await Store.importJSON(txt, 'replace'); return Store.settings.moneyBlind === true && Store.settings.blindRUnit === 100; });
  ok('Export/Import behält Modus und R-Einheit', kept);
  await p.evaluate(() => { location.hash = '#/settings/trading'; }); await p.waitForTimeout(400); await p.click('[data-action=blind-toggle]'); await p.waitForTimeout(300);
  await p.evaluate(() => { location.hash = '#/stats'; }); await p.waitForTimeout(600); ok('Ausschalten → € wieder da', (await leaks(p)).length > 0);
  // Handy
  await p.setViewportSize({ width: 390, height: 844 }); await p.evaluate(() => { location.hash = '#/settings/trading'; }); await p.waitForTimeout(500);
  ok('Handy: Einstellungen ohne Überlauf, Schalter da', await p.evaluate(() => document.documentElement.scrollWidth <= 390 && !!document.querySelector('[data-action=blind-toggle]')));
  console.log(out.join('\n')); console.log(errs.length ? 'ERRORS: ' + errs.join(' | ') : 'no errors'); await browser.close(); })();
