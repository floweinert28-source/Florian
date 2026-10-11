/* Weiches, schweres Scrollen (js/scroll.js): Rad gleitet nach, innere Bereiche, Dialoge, Bewegung reduzieren, programmatisches Scrollen */
const { chromium } = require('playwright');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log('PASS ' + m); } else { fail++; console.log('FAIL ' + m); } };
const BASE = 'file:///home/user/Florian/web/app.html';
(async () => { const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 800 } }); p.on('pageerror', e => errs.push(e.message)); try { await require('./localfonts.js')(p); } catch (e) {}
  await p.goto(BASE + '#/dashboard', { waitUntil: 'load' }); await p.waitForTimeout(900);
  const max = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight); ok(max > 600, 'Dashboard ist lang genug zum Scrollen · ' + max);
  await p.mouse.move(800, 500); await p.mouse.wheel(0, 600); await p.waitForTimeout(60);
  const early = await p.evaluate(() => scrollY); await p.waitForTimeout(2000); const late = await p.evaluate(() => scrollY);
  ok(early > 0 && early < 500 && Math.abs(late - 600) <= 1, `Rad: gleitet nach (nach 60 ms ${early}px, nach 2 s ${late}px von 600)`);
  await p.mouse.wheel(0, -600); await p.waitForTimeout(2000); ok((await p.evaluate(() => scrollY)) === 0, 'Zurück auf 0, nicht darunter');
  await p.mouse.wheel(0, 100000); await p.waitForTimeout(2000); const capped = await p.evaluate(() => scrollY); ok(Math.abs(capped - Math.min(max, Math.round(800 * 1.4))) <= 2, 'Riesiger Tick auf 1,4 Fensterhöhen gekappt · ' + capped);
  for (let i = 0; i < 3; i++) { await p.mouse.wheel(0, 100000); await p.waitForTimeout(150); } await p.waitForTimeout(2000); ok(Math.abs((await p.evaluate(() => scrollY)) - max) <= 1, 'Mehrere Ticks: am Ende der Seite, nicht darüber hinaus');
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(100); ok((await p.evaluate(() => scrollY)) === 0 && !(await p.evaluate(() => Glide.active)), 'Programmatisches scrollTo sofort, Gleiten aus');
  /* Tastatur bleibt nativ */
  await p.keyboard.press('End'); await p.waitForTimeout(600); ok((await p.evaluate(() => scrollY)) > max - 5, 'Taste Ende scrollt nativ ans Ende');
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(100);
  /* Dialog offen: Fenster bleibt stehen */
  await p.click('[data-action="new-trade"]'); await p.waitForTimeout(500); await p.mouse.move(100, 400); await p.mouse.wheel(0, 500); await p.waitForTimeout(800);
  ok((await p.evaluate(() => scrollY)) === 0 && (await p.evaluate(() => document.body.style.overflow === 'hidden')), 'Dialog offen: Rad bewegt die Seite nicht'); await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  /* innerer Bereich (Notebook-Liste) scrollt selbst, die Seite nicht */
  await p.goto(BASE + '#/notebook', { waitUntil: 'load' }); await p.waitForTimeout(900);
  const inner = await p.evaluate(() => { const els = [...document.querySelectorAll('#main *')].filter(e => { const cs = getComputedStyle(e); return /(auto|scroll)/.test(cs.overflowY) && e.scrollHeight > e.clientHeight + 20 && e.clientHeight > 100; }); const e = els[0]; if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + Math.min(r.height / 2, 200), tag: e.className }; });
  if (inner) { await p.mouse.move(inner.x, inner.y); await p.mouse.wheel(0, 200); await p.waitForTimeout(700);
    const r = await p.evaluate(() => ({ win: scrollY, inner: [...document.querySelectorAll('#main *')].filter(e => /(auto|scroll)/.test(getComputedStyle(e).overflowY) && e.scrollTop > 0).length }));
    ok(r.win === 0 && r.inner >= 1, 'Innerer Bereich scrollt nativ, Fenster bleibt · ' + JSON.stringify(r) + ' in ' + inner.tag); } else console.log('kein innerer Scrollbereich gefunden');
  /* Bewegung reduzieren: natives Scrollen */
  const ctx = await b.newContext({ viewport: { width: 1440, height: 800 }, reducedMotion: 'reduce' }); const q = await ctx.newPage(); try { await require('./localfonts.js')(q); } catch (e) {}
  await q.goto(BASE + '#/dashboard', { waitUntil: 'load' }); await q.waitForTimeout(900); await q.mouse.move(800, 500); await q.mouse.wheel(0, 600); await q.waitForTimeout(80);
  ok((await q.evaluate(() => scrollY)) >= 590, 'Bewegung reduzieren: sofort am Ziel, kein Gleiten');
  ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
  console.log(`${pass}/${pass + fail} bestanden`); await b.close(); process.exit(fail ? 1 : 0); })();
