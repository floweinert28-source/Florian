/* Echte Zahlen aus der Journalyst-Web-App für das Video: Kennzahlen, Tagesergebnisse, TradeLog, Shadow Self und Regeln.
   Das Video zeichnet die Karten selbst (klarer, im Stil des Videos), die Werte kommen aber aus der App.
   Aufruf: npm run capture   (Web-App unter http://127.0.0.1:8787)   Schreibt src/data/app.json. */
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const APP = 'http://127.0.0.1:8787'; const ROOT = path.resolve(__dirname, '..');
const FAKE_NOW = '2026-09-30T16:40:00Z';
/* Der Trade, der im Video geloggt wird. Plan und Setup trägt man in der App in der Auswertung nach; hier als unsichtbare
   Felder mitgegeben, damit R, Setup und Disziplin stimmen. */
const TRADE = { symbol: 'ES', open: '2026-09-30T16:12', close: '2026-09-30T16:31', entry: '5742.25', exit: '5751.5', qty: '2' };
const PLAN = { plannedEntry: '5742.25', plannedStop: '5738', plannedTarget: '5752', setup: 'Pullback' };
const RULES = ['Max trades per day', 'Stop after consecutive losses', 'No new trade after a loss'];

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-proxy-server'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'en-US' });
  await ctx.route(/fontshare|fonts\.g/, r => r.abort());
  await ctx.addInitScript(() => { try { if (!localStorage.getItem('trading-journal-web-v1')) localStorage.setItem('trading-journal-web-v1', JSON.stringify({ settings: { language: 'en', currency: 'USD' } })); } catch (e) {} });
  const page = await ctx.newPage(); await page.clock.setSystemTime(FAKE_NOW);
  page.on('pageerror', e => console.log('PAGEERROR', e.message));
  const wait = ms => page.waitForTimeout(ms);
  const go = async (hash) => { await page.evaluate(h => { location.hash = h; }, hash); await wait(2200); };
  const data = {};

  await page.goto(`${APP}/app.html#/dashboard`, { waitUntil: 'load' });
  await page.waitForSelector('.boot', { state: 'detached', timeout: 20000 }).catch(() => {});
  await go('#/stats'); await go('#/dashboard');

  /* 1 Dashboard vor dem neuen Trade */
  data.dash = await page.evaluate(() => {
    const tiles = [...document.querySelectorAll('.dash-top > *')].map(e => e.innerText.split('\n').map(s => s.trim()).filter(Boolean));
    const score = (() => { const c = [...document.querySelectorAll('.main .card')].find(c => /Overall score/i.test(c.innerText)); const m = c && c.innerText.match(/YOUR SCORE\s*(\d+)/i); return m ? Number(m[1]) : null; })();
    const days = UI.chartData['dash-kum_pnl'].days.map(d => ({ key: d.key, pnl: Math.round(d.pnl * 100) / 100 }));
    return { tiles, score, days };
  });
  console.log('ok dashboard', data.dash.tiles.length, 'Kacheln,', data.dash.days.length, 'Tage');

  /* 2 Trade loggen */
  await page.evaluate(() => document.querySelector('button[data-action="new-trade"]').click()); await wait(900);
  await page.evaluate(([t, plan]) => {
    const f = document.querySelector('#trade-form');
    for (const [k, v] of Object.entries(plan)) { const i = document.createElement('input'); i.type = 'hidden'; i.name = k; i.value = v; f.appendChild(i); }
    const set = (s, v) => { const el = document.querySelector(s); el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); };
    set('#f-open', t.open); set('#f-close', t.close);
  }, [TRADE, PLAN]);
  await page.evaluate(() => document.querySelector('#f-symbol-btn').click()); await wait(400);
  await page.evaluate((sym) => [...document.querySelectorAll('#sym-menu .sym-opt')].find(b => b.dataset.sym === sym).click(), TRADE.symbol); await wait(300);
  for (const [sel, v] of [['#f-entry', TRADE.entry], ['#f-exit', TRADE.exit], ['#f-qty', TRADE.qty]]) await page.locator(sel).fill(v);
  await wait(300);
  data.trade = Object.assign({}, TRADE, { preview: await page.evaluate(() => document.querySelector('#trade-preview').innerText.replace(/\s+/g, ' ').trim()), pointValue: await page.evaluate(() => document.querySelector('#f-mult').value) });
  await page.evaluate(() => document.querySelector('#trade-form').requestSubmit()); await wait(3000);
  console.log('ok trade', data.trade.preview);

  /* 3 TradeLog: die ersten Zeilen, Spalten nach Überschrift */
  await go('#/trades');
  data.trades = await page.evaluate(() => {
    const head = [...document.querySelectorAll('.main table thead th, .main table tr:first-child th')].map(th => th.innerText.replace('▼', '').trim());
    const rows = [...document.querySelectorAll('.main table tbody tr')].slice(0, 6).map(tr => Object.fromEntries([...tr.querySelectorAll('td')].map((td, i) => [head[i] || i, td.innerText.replace(/\s+/g, ' ').trim()])));
    return { head, rows };
  });
  console.log('ok trades', data.trades.rows.length, 'Zeilen');

  /* 4 Shadow Self: Kacheln, Verlauf echt gegen Schatten-Ich, aktive Regeln */
  await go('#/shadow');
  data.shadow = await page.evaluate((RULES) => {
    const tiles = [...document.querySelectorAll('.main .tile')].map(e => e.innerText.split('\n').map(s => s.trim()).filter(Boolean));
    const curve = UI.chartData['shadow-curve'].points.map(p => ({ date: p.date, real: Math.round(p.v.real * 100) / 100, shadow: Math.round(p.v.shadow * 100) / 100 }));
    const card = [...document.querySelectorAll('.main .card')].find(c => /rule set/i.test(c.innerText.slice(0, 60)));
    const rules = RULES.map(name => { const el = [...card.querySelectorAll('*')].filter(e => e.innerText && e.innerText.trim().startsWith(name) && e.getBoundingClientRect().height > 90 && e.getBoundingClientRect().height < 220).sort((a, b) => a.getBoundingClientRect().height - b.getBoundingClientRect().height)[0]; const lines = el ? el.innerText.split('\n').map(s => s.trim()).filter(Boolean) : [name]; const value = el ? [...el.querySelectorAll('input')].map(i => i.value).filter(v => v !== '' && v !== 'on')[0] : null; return { name, lines, value }; });
    return { tiles, curve, rules };
  }, RULES);
  console.log('ok shadow', data.shadow.curve.length, 'Punkte');

  fs.writeFileSync(path.join(ROOT, 'src', 'data', 'app.json'), JSON.stringify(data, null, 1));
  await browser.close();
  console.log('fertig');
})();
