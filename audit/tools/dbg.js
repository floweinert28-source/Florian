const { chromium } = require('playwright'); const base = 'file:///home/user/Florian/web/app.html';
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(base, { waitUntil: 'load' }); await p.evaluate(() => { Store.installSample(); Store.saveNow(); }); await p.goto(base + '#/dashboard'); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(700);
  await p.click('[data-pop="user"]'); await p.waitForTimeout(400); await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  await p.click('[data-action="sb-toggle"]'); await p.waitForTimeout(500); await p.click('[data-action="sb-toggle"]'); await p.waitForTimeout(300);
  await p.click('[data-pop="tpl"]'); await p.waitForTimeout(400);
  console.log(await p.evaluate(() => { const pop = document.getElementById('pop-tpl'); const e = pop && pop.querySelector('[data-action="dash-tpl-edit"]'); return { open: pop && pop.classList.contains('open'), display: pop && getComputedStyle(pop).display, edit: !!e, r: e && e.getBoundingClientRect().toJSON(), vis: e && getComputedStyle(e).visibility, html: pop && pop.innerHTML.slice(0, 200) }; }));
  await b.close(); })();
