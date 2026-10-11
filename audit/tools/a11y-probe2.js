const { chromium } = require('playwright');
const BASE = 'file:///home/user/Florian/web/app.html#/';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE + 'dashboard'); await page.waitForTimeout(800);
  await page.evaluate(() => { Store.installSample(); Store.saveNow(); }); await page.reload(); await page.waitForTimeout(1000);
  const act = () => page.evaluate(() => { const a = document.activeElement; return a === document.body ? 'BODY' : a.tagName + '.' + a.className + ' [' + (a.getAttribute('aria-label') || a.textContent || '').trim().slice(0, 24) + ']'; });
  await page.goto(BASE + 'settings/trading'); await page.waitForTimeout(800);
  await page.focus('.switch[data-action="blind-toggle"]'); await page.keyboard.press('Space'); await page.waitForTimeout(400);
  console.log('switch-space ->', await act(), 'checked=', await page.evaluate(() => document.querySelector('.switch[data-action="blind-toggle"]').getAttribute('aria-checked')));
  await page.keyboard.press('Space'); await page.waitForTimeout(300);
  await page.goto(BASE + 'stats'); await page.waitForTimeout(800);
  const tabBtn = await page.$('[data-subnav] button:nth-child(2), [data-subnav] a:nth-child(2)'); await tabBtn.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(400);
  console.log('stats-tab-enter ->', await act());
  await page.goto(BASE + 'trades'); await page.waitForTimeout(800);
  await page.focus('[data-action="trades-view"][data-value="days"]'); await page.keyboard.press('Enter'); await page.waitForTimeout(400);
  console.log('trades-view-enter ->', await act());
  await page.goto(BASE + 'dashboard'); await page.waitForTimeout(800);
  await page.focus('.d.today'); await page.keyboard.press('Enter'); await page.waitForTimeout(400);
  console.log('cal-day-enter -> route', await page.evaluate(() => location.hash));
  await page.focus('.d.today'); await page.keyboard.press('Space'); await page.waitForTimeout(400);
  console.log('cal-day-space -> route', await page.evaluate(() => location.hash));
  await page.goto(BASE + 'notebook'); await page.waitForTimeout(800);
  const f = await page.$('.folder[role=button]:not(.active)'); if (f) { await f.focus(); const before = await page.evaluate(() => (document.querySelector('.folder.active')||{}).textContent); await page.keyboard.press('Enter'); await page.waitForTimeout(400); console.log('nb-folder-enter changed=', before !== await page.evaluate(() => (document.querySelector('.folder.active')||{}).textContent), '->', await act()); }
  // Trade-Ansicht: Tab-Fokus nach Sortierung
  await page.goto(BASE + 'trades'); await page.waitForTimeout(800);
  await page.focus('.select.sm[data-change="trade-page-size"]'); await page.selectOption('.select.sm[data-change="trade-page-size"]', '10'); await page.waitForTimeout(400);
  console.log('pagesize-change ->', await act());
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
