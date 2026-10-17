/* Diagramm-Einzug: beim Öffnen von Statistiken zeichnet sich die P&L-Linie, beim Neuaufbau nicht, bei Bewegung reduzieren nie */
const { chromium } = require('playwright');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log('PASS ' + m); } else { fail++; console.log('FAIL ' + m); } };
const BASE = 'file:///home/user/Florian/web/app.html';
const state = p => p.evaluate(() => { const svg = document.querySelector('#main .chart[data-chart="pnl"] svg'); const ln = svg && svg.querySelector('path.ln'); const cs = ln && getComputedStyle(ln); return { enter: !!svg && svg.classList.contains('enter'), len: ln ? ln.style.getPropertyValue('--len') : '', off: cs ? parseFloat(cs.strokeDashoffset) : null, anim: cs ? cs.animationName : '', ar: svg ? getComputedStyle(svg.querySelector('path.ar')).animationName : '', dt: svg ? getComputedStyle(svg.querySelector('circle.dt')).animationName : '' }; });
(async () => { const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'warning' || m.type() === 'error') errs.push(m.type() + ': ' + m.text().slice(0, 300)); }); try { await require('./localfonts.js')(p); } catch (e) {}
  await p.goto(BASE + '#/dashboard', { waitUntil: 'load' }); await p.waitForTimeout(900);
  await p.evaluate(() => { window.__r = []; const orig = App.render; App.render = function (o) { window.__r.push([App._lastRoute, location.hash, o && o.enter, !!(o && o.keep), !!(o && o.first), Math.round(performance.now())]); return orig.call(this, o); }; });
  await p.click('.sidebar .nav a[href="#/stats"]'); await p.waitForTimeout(380); const early = await state(p);
  ok(early.enter && +early.len > 500 && early.anim === 'ch-draw' && early.off > 100 && early.ar === 'ch-fade' && early.dt === 'ch-pop', 'Klick auf Statistiken: Linie zeichnet sich (Anfang), Fläche blendet ein, Endpunkt springt auf · ' + JSON.stringify(early));
  await p.waitForTimeout(1500); const late = await state(p); ok(late.off === 0, 'Nach 1,9 s ist die Linie komplett gezeichnet · ' + late.off);
  const tipOk = await p.evaluate(() => { const hit = document.querySelector('#main .chart[data-chart="pnl"] svg .hit'); const r = hit.getBoundingClientRect(); hit.dispatchEvent(new MouseEvent('mousemove', { clientX: r.left + r.width * .6, clientY: r.top + 40, bubbles: true })); return document.querySelector('#main .chart[data-chart="pnl"] svg .hover').classList.contains('on'); });
  ok(tipOk, 'Hover auf dem Diagramm funktioniert weiterhin');
  await p.evaluate(() => App.rerender()); await p.waitForTimeout(150); const re = await state(p); ok(!re.enter && re.anim === 'none', 'Neuaufbau ohne Seitenwechsel: kein erneuter Einzug');
  await p.click('.sidebar .nav a[href="#/dashboard"]'); await p.waitForTimeout(600); const dash = await p.evaluate(() => { const svg = document.querySelector('#main .chart[data-chart="pnlcmp"] svg'); const ln = svg && svg.querySelector('path.ln'); const cs = ln && getComputedStyle(ln); return { enter: !!svg && svg.classList.contains('enter'), len: ln ? ln.style.getPropertyValue('--len') : '', anim: cs ? cs.animationName : '' }; }); ok(dash.enter && +dash.len > 50 && dash.anim === 'ch-draw', 'Dashboard-P&L im Vergleich zeichnet sich beim Öffnen ebenfalls · ' + JSON.stringify(dash) + ' ' + JSON.stringify(await p.evaluate(() => ({ route: App.state.route, last: App._lastRoute, n: document.querySelectorAll('#main .chart svg').length, enters: document.querySelectorAll('#main .chart svg.enter').length, first: App.state.dash && App.state.dash.first, screen: App._screen === App.screens.dashboard, r: window.__r, charts: [...document.querySelectorAll('#main .chart')].map(c => c.dataset.chart + ':' + c.clientWidth + 'x' + c.clientHeight), skel: document.querySelectorAll('#main .skeleton, #main .skel').length }))));
  /* Schatten-Ich: Equity-Linien und Netto-P&L-Sparkline zeichnen sich ebenfalls (allgemeiner Einzug für alle Zeichner) */
  await p.click('.sidebar .nav a[href="#/shadow"]'); await p.waitForTimeout(380);
  const sh = await p.evaluate(() => [...document.querySelectorAll('#main .chart svg')].map(s => ({ enter: s.classList.contains('enter'), ln: s.querySelectorAll('.ln').length, lenOk: [...s.querySelectorAll('.ln')].every(p => +p.style.getPropertyValue('--len') > 10), anim: s.querySelector('.ln') ? getComputedStyle(s.querySelector('.ln')).animationName : '' })));
  ok(sh.length >= 1 && sh.every(x => x.enter && x.ln >= 1 && x.lenOk && x.anim === 'ch-draw'), 'Schatten-Ich: alle Diagramm-Linien zeichnen sich · ' + JSON.stringify(sh));
  await p.click('.sidebar .nav a[href="#/trades"]'); await p.waitForTimeout(380);
  const sp = await p.evaluate(() => { const s = document.querySelector('#main .chart[data-chart="spark"] svg'); return s ? { enter: s.classList.contains('enter'), ln: s.querySelectorAll('.ln').length, ar: s.querySelectorAll('.ar').length } : null; });
  ok(sp && sp.enter && sp.ln >= 1 && sp.ar >= 1, 'TradeLog: Netto-P&L-Sparkline zeichnet sich · ' + JSON.stringify(sp));
  /* Tag vor/zurück: Inhalt gleitet, Diagramm zeichnet sich nicht neu, keine Überblendung der ganzen Seite */
  await p.click('.sidebar .nav a[href="#/day"]'); await p.waitForTimeout(380);
  await p.click('#content a[aria-label="Voriger Tag"]'); await p.waitForTimeout(40);
  const dp = await p.evaluate(() => { const c = document.getElementById('content'); const cs = getComputedStyle(c); const kids = [...c.children]; return { cls: c.className, anim: cs.animationName, head: kids.filter(k => k.matches('.page-head')).map(k => getComputedStyle(k).animationName).join(','), body: [...new Set(kids.filter(k => !k.matches('.page-head')).map(k => getComputedStyle(k).animationName))].join(','), transform: cs.transform, swapAttr: document.documentElement.dataset.swap || '', chartEnter: !!document.querySelector('#main .chart svg.enter') }; });
  ok(dp.cls === 'content swap' && dp.anim === 'none' && dp.head !== 'swap-in' && dp.body === 'swap-in' && dp.transform === 'none' && !dp.swapAttr && !dp.chartEnter, 'Tag zurück: Inhalt blendet nur kurz ein (Kopfreihe steht) – keine Verschiebung, keine View Transition, kein Diagramm-Einzug · ' + JSON.stringify(dp));
  await p.waitForTimeout(300);
  await p.click('#content a[aria-label="Nächster Tag"]'); await p.waitForTimeout(40);
  ok(await p.evaluate(() => document.getElementById('content').className === 'content swap' && getComputedStyle(document.getElementById('content')).transform === 'none'), 'Tag vor: ebenso nur Einblenden');
  await p.waitForTimeout(300);
  await p.click('.sidebar .nav a[href="#/stats"]'); await p.waitForTimeout(380); await p.click('#content .tabs a[href="#/stats/days"]'); await p.waitForTimeout(40);
  const tb = await p.evaluate(() => document.getElementById('content').classList.contains('swap')); await p.waitForTimeout(300);
  ok(tb && await p.evaluate(() => App.state.statsTab === 'days' && !document.querySelector('#main .chart svg.enter')), 'Statistik-Reiter: nur weiches Einblenden, Diagramm oben zeichnet sich nicht neu');
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }); const q = await ctx.newPage(); try { await require('./localfonts.js')(q); } catch (e) {}
  await q.goto(BASE + '#/stats', { waitUntil: 'load' }); await q.waitForTimeout(150); const rm = await state(q); ok(!rm.enter, 'Bewegung reduzieren: kein Einzug');
  ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
  console.log(`${pass}/${pass + fail} bestanden`); await b.close(); process.exit(fail ? 1 : 0); })();
