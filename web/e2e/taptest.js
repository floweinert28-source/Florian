/* Bedienung: eine Hauptaktion je Seite (nur ein gefüllter Knopf), Tippflächen am Handy mindestens 44 px (auch unsichtbar
   erweitert), gedrückter Zustand, Doppelklick-Sperre bei asynchronen Aktionen */
const { chromium } = require('playwright');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log('PASS ' + m); } else { fail++; console.log('FAIL ' + m); } };
const BASE = 'file:///home/user/Florian/web/app.html';
const filledCount = () => { const acc = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(); const t = document.createElement('i'); t.style.color = acc; document.body.appendChild(t); const ac = getComputedStyle(t).color; t.remove();
  return [...document.querySelectorAll('.btn')].filter(e => e.getClientRects().length && !e.closest('.popover:not(.open), [hidden], .modal-bg') && getComputedStyle(e).backgroundColor === ac).map(e => e.textContent.trim().slice(0, 24)); };
(async () => { const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); p.on('pageerror', e => errs.push(e.message)); try { await require('./localfonts.js')(p); } catch (e) {}
  await p.goto(BASE + '#/dashboard', { waitUntil: 'load' }); await p.waitForTimeout(900);
  const dayH = await p.evaluate(() => '#/day/' + Core.dayKey(Core.closedOnly(App.allTrades()).sort((a, b) => b.close - a.close)[0].close));
  const tradeH = await p.evaluate(() => '#/trades/' + Core.closedOnly(App.allTrades()).sort((a, b) => b.close - a.close)[0].id);
  for (const h of ['#/dashboard', '#/trades', dayH, tradeH, '#/notebook', '#/settings/profil', '#/settings/konten', '#/prop/konten', '#/prop/auswertung', '#/shadow']) {
    await p.evaluate(x => { location.hash = x; }, h); await p.waitForTimeout(800);
    const f = await p.evaluate(filledCount);
    ok(f.length === 1, `${h.replace(/\/[0-9a-z-]{12,}$/i, '/…')}: genau ein gefüllter Knopf · ${f.join(' | ')}`);
  }
  await p.evaluate(() => { location.hash = '#/notebook'; }); await p.waitForTimeout(700);
  ok(await p.evaluate(() => document.documentElement.classList.contains('page-primary') && getComputedStyle(document.querySelector('.sidebar .sb-new .btn')).backgroundColor === 'rgba(0, 0, 0, 0)'), 'Notebook: „Trade loggen“ als Rahmen-Knopf an derselben Stelle');
  await p.evaluate(() => { location.hash = '#/dashboard'; }); await p.waitForTimeout(700);
  ok(await p.evaluate(() => !document.documentElement.classList.contains('page-primary')), 'Dashboard: „Trade loggen“ wieder gefüllt');
  /* Doppelklick-Sperre */
  const lock = await p.evaluate(async () => { const btn = document.createElement('button'); btn.type = 'button'; btn.dataset.action = 'zz-slow'; document.getElementById('main').appendChild(btn); let n = 0; App.actions['zz-slow'] = () => { n++; return new Promise(r => setTimeout(r, 300)); };
    btn.click(); const during = btn.disabled; btn.click(); btn.click(); await new Promise(r => setTimeout(r, 400)); const res = { n, during, after: btn.disabled }; btn.remove(); delete App.actions['zz-slow']; return res; });
  ok(lock.n === 1 && lock.during && !lock.after, 'Asynchrone Aktion: Knopf gesperrt, dreifacher Klick löst einmal aus, danach wieder frei · ' + JSON.stringify(lock));
  /* Handy: Tippflächen */
  const m = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); m.on('pageerror', e => errs.push('Handy: ' + e.message)); try { await require('./localfonts.js')(m); } catch (e) {}
  await m.goto(BASE + '#/settings/benachrichtigungen', { waitUntil: 'load' }); await m.waitForTimeout(1000);
  const hit = await m.evaluate(() => { const sw = [...document.querySelectorAll('.switch')].find(x => x.getClientRects().length); sw.scrollIntoView({ block: 'center' }); const r = sw.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2; const at = (x, y) => { const e = document.elementFromPoint(x, y); return !!e && (e === sw || sw.contains(e)); }; return { w: Math.round(r.width), h: Math.round(r.height), up: at(cx, cy - 20), down: at(cx, cy + 20) }; });
  ok(hit.up && hit.down, 'Schalter (optisch ' + hit.w + '×' + hit.h + '): Tippfläche reicht 20 px über und unter die Mitte');
  const sizes = await m.evaluate(() => { const vis = e => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden'; const small = [...document.querySelectorAll('#main .btn, #main .input, #main .select, #main .set-nav a')].filter(vis).filter(e => { const r = e.getBoundingClientRect(); return r.height < 43.5; }); return small.map(e => (e.textContent || e.getAttribute('aria-label') || e.className).trim().slice(0, 20) + ' ' + Math.round(e.getBoundingClientRect().height)); });
  ok(!sizes.length, 'Einstellungen am Handy: Knöpfe, Felder und Reiter mindestens 44 px hoch · ' + sizes.slice(0, 5).join(' | '));
  await m.evaluate(() => App.openTradeEditor(null)); await m.waitForTimeout(700);
  const tf = await m.evaluate(() => [...document.querySelectorAll('.modal .btn, .modal .dir-opt, .modal .input, .modal summary, .modal .sym-btn')].filter(e => e.getClientRects().length && e.getBoundingClientRect().height < 43.5).map(e => (e.textContent || e.className).trim().slice(0, 18) + ' ' + Math.round(e.getBoundingClientRect().height)));
  ok(!tf.length, 'Trade-Fenster am Handy: alles mindestens 44 px · ' + tf.join(' | '));
  await m.keyboard.press('Escape'); await m.waitForTimeout(300);
  ok(await m.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Handy: kein seitliches Scrollen nach den größeren Tippflächen');
  /* PC bleibt kompakt */
  const pc = await p.evaluate(() => { location.hash = '#/settings/profil'; return new Promise(r => setTimeout(() => r(Math.round(document.querySelector('.btn.sm').getBoundingClientRect().height)), 700)); });
  ok(pc < 44, 'PC (Maus): kleine Knöpfe bleiben kompakt · ' + pc + ' px');
  ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
  console.log(`${pass}/${pass + fail} bestanden`); await b.close(); process.exit(fail ? 1 : 0); })();
