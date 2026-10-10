/* Bausteine der echten Journalyst-Web-App für das Video: ganze Seiten (JPEG) und einzelne Elemente freigestellt (PNG mit Transparenz, danach WebP).
   Aufruf: npm run capture   (Web-App unter http://127.0.0.1:8787, Schriften unter /_fonts)
   Schreibt public/cap/*.{jpg,png} und src/data/cap.json (Positionen von Feldern, Zeilen, Knöpfen und Kennzahlen). */
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const APP = 'http://127.0.0.1:8787'; const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'public', 'cap');
const FAKE_NOW = '2026-09-30T16:40:00Z';
const VW = 1440, VH = 900, DPR = 3;
/* Fehlende Übersetzungen in der englischen Oberfläche, nur für die Aufnahme ersetzt */
const FIX = { 'Offene Positionen': 'Open positions', 'Regelbrüche haben dich das gekostet': 'What breaking your rules cost you', 'Disziplin ': 'Discipline ', 'geplant ': 'planned ', 'Offener Trade': 'Open trade', 'Risiko ': 'Risk ' };
const TRADE = { symbol: 'ES', open: '2026-09-30T16:12', close: '2026-09-30T16:31', entry: '5742.25', exit: '5751.5', qty: '2' };
/* Plan und Setup trägt man in der Auswertung nach; hier als unsichtbare Felder mitgegeben, damit R, Setup und Disziplin stimmen */
const PLAN = { plannedEntry: '5742.25', plannedStop: '5738', plannedTarget: '5752', setup: 'Pullback' };

(async () => {
  fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
  const css = [400, 500, 700, 900].map(w => `@font-face{font-family:'Satoshi';font-weight:${w};src:url(${APP}/_fonts/satoshi-${w}.woff2) format('woff2')}`).join('\n') + [400, 500, 600, 700].map(w => `@font-face{font-family:'Onest';font-weight:${w};src:url(${APP}/_fonts/onest-${w}.woff2) format('woff2')}`).join('\n');
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-proxy-server', '--hide-scrollbars'] });
  const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: DPR, locale: 'en-US', colorScheme: 'dark' });
  await ctx.route(/fontshare\.com|fonts\.googleapis\.com/, r => r.fulfill({ status: 200, contentType: 'text/css', body: css }));
  await ctx.route(/fonts\.gstatic\.com|cdn\.fontshare\.com/, r => r.abort());
  await ctx.addInitScript(() => { try { if (!localStorage.getItem('trading-journal-web-v1')) localStorage.setItem('trading-journal-web-v1', JSON.stringify({ settings: { language: 'en', currency: 'USD' } })); } catch (e) {} });
  /* Freistellen: alles unsichtbar außer den markierten Elementen, kein Textcursor, kein Schatten am Dialog */
  await ctx.addInitScript(() => { addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = `
    html.iso, html.iso body { background: transparent !important; }
    html.iso * { visibility: hidden !important; }
    html.iso .iso-on, html.iso .iso-on * { visibility: visible !important; }
    html.iso .modal-bg { background: transparent !important; backdrop-filter: none !important; }
    html.iso .modal { box-shadow: none !important; }
    input, textarea { caret-color: transparent !important; }`; document.head.appendChild(s); }); });
  const page = await ctx.newPage(); await page.clock.setSystemTime(FAKE_NOW);
  page.on('pageerror', e => console.log('PAGEERROR', e.message));
  const wait = ms => page.waitForTimeout(ms);
  const data = { viewport: { w: VW, h: VH }, dpr: DPR };

  const fixText = () => page.evaluate((map) => { const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) for (const [a, b] of Object.entries(map)) if (n.textContent.includes(a)) n.textContent = n.textContent.replace(a, b); }, FIX);
  const go = async (hash) => { await page.evaluate(h => { location.hash = h; }, hash); await wait(2400); await fixText(); };
  const rect = (sel) => page.evaluate((s) => { const el = typeof s === 'string' ? document.querySelector(s) : null; if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }, sel);
  const mark = (sels) => page.evaluate((sels) => { document.querySelectorAll('.iso-on').forEach(e => e.classList.remove('iso-on')); for (const s of sels) document.querySelectorAll(s).forEach(e => e.classList.add('iso-on')); }, sels);
  /* Ganze Seite als JPEG */
  const page_ = async (name) => { await page.mouse.move(VW - 4, VH - 4); await page.screenshot({ path: path.join(OUT, name + '.jpg'), type: 'jpeg', quality: 92 }); console.log('ok', name); };
  /* Elemente freigestellt; clip in CSS-Pixeln, Standard: Umriss des ersten Elements mit etwas Rand */
  const iso = async (name, sels, clip, pad = 2) => {
    await mark(sels); await page.evaluate(() => document.documentElement.classList.add('iso'));
    const c = clip || (await rect(sels[0]));
    const r = { x: Math.max(0, c.x - pad), y: Math.max(0, c.y - pad), width: c.w + pad * 2, height: c.h + pad * 2 };
    await page.screenshot({ path: path.join(OUT, name + '.png'), clip: r, omitBackground: true });
    await page.evaluate(() => document.documentElement.classList.remove('iso'));
    console.log('ok', name); return { x: r.x, y: r.y, w: r.width, h: r.height };
  };
  /* Box eines Elements relativ zu einem Ausschnitt */
  const rel = (b, c) => b && { x: b.x - c.x, y: b.y - c.y, w: b.w, h: b.h };

  await page.goto(`${APP}/app.html#/dashboard`, { waitUntil: 'load' });
  await page.waitForSelector('.boot', { state: 'detached', timeout: 20000 }).catch(() => {});
  await go('#/stats'); await go('#/dashboard'); await wait(600);

  /* 1 Dashboard: Bildschirm, ganze Höhe und die fünf Kennzahl-Kacheln */
  await page_('dash');
  const tiles = await page.evaluate(() => [...document.querySelectorAll('.dash-top > *')].map((el, i) => { el.dataset.capTile = i; const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }));
  data.tiles = [];
  for (let i = 0; i < tiles.length; i++) data.tiles.push(await iso(`tile-${i}`, [`[data-cap-tile="${i}"]`]));
  const fullH = await page.evaluate(() => Math.ceil(document.querySelector('.content').getBoundingClientRect().bottom + scrollY));
  await page.setViewportSize({ width: VW, height: fullH }); await wait(900); await fixText();
  await page.mouse.move(VW - 4, 4); await page.screenshot({ path: path.join(OUT, 'dash-full.jpg'), type: 'jpeg', quality: 90 }); console.log('ok', 'dash-full');
  data.dashFull = { w: VW, h: fullH };
  await page.setViewportSize({ width: VW, height: VH }); await wait(600);
  data.logTrade = await rect('button[data-action="new-trade"]');

  /* 2 Trade loggen: Dialog in mehreren Zuständen, jeweils mit dem Feld im Fokus, in das gerade getippt wird */
  await page.evaluate(() => document.querySelector('button[data-action="new-trade"]').click()); await wait(1000);
  const setVal = (sel, v) => page.evaluate(([s, v]) => { const el = document.querySelector(s); el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }, [sel, v]);
  await page.evaluate((plan) => { const f = document.querySelector('#trade-form'); for (const [k, v] of Object.entries(plan)) { const i = document.createElement('input'); i.type = 'hidden'; i.name = k; i.value = v; f.appendChild(i); } }, PLAN);
  await setVal('#f-open', TRADE.open); await setVal('#f-close', TRADE.close);
  await page.evaluate(() => { document.activeElement && document.activeElement.blur(); }); await wait(300);
  const modal = await rect('.modal');
  const mclip = { x: modal.x - 24, y: modal.y - 24, w: modal.w + 48, h: modal.h + 48 + 120 };
  const mshot = async (name) => { await wait(250); await fixText(); return iso(name, ['.modal-bg', '#sym-menu'], mclip, 0); };
  const field = async (sel) => page.evaluate((s) => {
    const el = document.querySelector(s); const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
    const ctx = document.createElement('canvas').getContext('2d'); ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const start = r.x + parseFloat(cs.borderLeftWidth) + parseFloat(cs.paddingLeft);
    return { x: r.x, y: r.y, w: r.width, h: r.height, textX: start, fontSize: parseFloat(cs.fontSize), color: cs.color };
  }, sel);
  const widths = (sel, text) => page.evaluate(([s, t]) => { const el = document.querySelector(s); const cs = getComputedStyle(el); const ctx = document.createElement('canvas').getContext('2d'); ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`; return [...t].map((_, i) => ctx.measureText(t.slice(0, i + 1)).width); }, [sel, text]);
  const focus = (sel) => page.evaluate((s) => { const el = document.querySelector(s); el.focus(); if (el.select) el.select(); }, sel);
  data.modal = { clip: mclip, box: rel(modal, mclip), states: {} };
  data.modal.states.m0 = await mshot('m0');
  data.modal.symbolBtn = rel(await rect('#f-symbol-btn'), mclip);
  await page.evaluate(() => document.querySelector('#f-symbol-btn').click()); await wait(500);
  data.modal.esOpt = rel(await page.evaluate((sym) => { const o = [...document.querySelectorAll('#sym-menu .sym-opt')].find(b => b.dataset.sym === sym); o.focus(); const r = o.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }, TRADE.symbol), mclip);
  data.modal.menu = rel(await rect('#sym-menu'), mclip);
  await mshot('m1');
  await page.evaluate((sym) => [...document.querySelectorAll('#sym-menu .sym-opt')].find(b => b.dataset.sym === sym).click(), TRADE.symbol); await wait(400);
  for (const [k, sel, val, a, b] of [['entry', '#f-entry', TRADE.entry, 'm2', 'm3'], ['exit', '#f-exit', TRADE.exit, 'm4', 'm5'], ['qty', '#f-qty', TRADE.qty, 'm6', 'm7']]) {
    await focus(sel); data.modal.states[a] = await mshot(a);
    await page.locator(sel).fill(val); await page.evaluate(s => document.querySelector(s).focus(), sel);
    data.modal.states[b] = await mshot(b);
    const f = await field(sel);
    data.modal[k] = Object.assign(rel(f, mclip), { textX: f.textX - mclip.x, fontSize: f.fontSize, color: f.color, text: val, widths: await widths(sel, val) });
  }
  await page.evaluate(() => { document.activeElement && document.activeElement.blur(); });
  data.modal.states.m8 = await mshot('m8');
  data.modal.save = rel(await rect('#trade-form button[type="submit"]'), mclip);
  data.modal.preview = rel(await rect('#trade-preview'), mclip);
  data.modal.previewText = await page.evaluate(() => document.querySelector('#trade-preview').textContent.trim());
  await page.evaluate(() => document.querySelector('#trade-form').requestSubmit()); await wait(3200);

  /* 3 Dashboard nach dem Speichern: Karte „Letzte Trades“ */
  await go('#/dashboard'); await wait(400);
  await page.evaluate(() => document.querySelector('.recent-card').scrollIntoView({ block: 'center' })); await wait(700);
  data.recent = await iso('recent', ['.recent-card']);
  data.recent.firstRow = rel(await rect('.recent-card tbody tr, .recent-card .row, .recent-card li'), data.recent);
  await page.evaluate(() => scrollTo(0, 0)); await wait(300);

  /* 4 TradeLog mit dem neuen Trade oben */
  await go('#/trades');
  await page_('trades');
  const wrap = await rect('.tbl-wrap');
  data.trades = await iso('trades-table', ['.tbl-wrap']);
  data.trades.head = rel(await rect('.main table thead tr, .main table tr'), data.trades);
  data.trades.rows = await page.evaluate(() => [...document.querySelectorAll('.main table tbody tr')].slice(0, 9).map(tr => { const r = tr.getBoundingClientRect(); return { y: r.y, h: r.height, text: tr.textContent.replace(/\s+/g, ' ').trim().slice(0, 80) }; }));
  data.trades.rows = data.trades.rows.map(r => ({ y: r.y - data.trades.y, h: r.h, text: r.text }));
  data.trades.rulesCell = rel(await page.evaluate(() => { const td = document.querySelector('.main table tbody tr td:last-child'); const r = td.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }), data.trades);
  data.trades.pnlCell = rel(await page.evaluate(() => { const tds = [...document.querySelectorAll('.main table tbody tr:first-child td')]; const td = tds.find(t => /\$/.test(t.textContent)); const r = td.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, text: td.textContent.trim() }; }), data.trades);

  /* 5 Shadow Self: Seite, Kachel Disziplin-Kosten (auch ohne Zahl), Verlaufskarte mit und ohne Linien, Regeln */
  await go('#/shadow'); await wait(800);
  await page_('shadow');
  data.shTile = await iso('sh-tile', ['.tile.shadow-main']);
  data.shTile.val = await page.evaluate(() => { const v = document.querySelector('.tile.shadow-main .val'); const r = v.getBoundingClientRect(); const cs = getComputedStyle(v); return { x: r.x, y: r.y, w: r.width, h: r.height, text: v.textContent.trim(), fontSize: parseFloat(cs.fontSize), fontWeight: cs.fontWeight, fontFamily: cs.fontFamily, color: cs.color, letterSpacing: cs.letterSpacing, lineHeight: cs.lineHeight }; });
  data.shTile.val = Object.assign(data.shTile.val, rel(data.shTile.val, data.shTile));
  await page.evaluate(() => { document.querySelector('.tile.shadow-main .val').style.color = 'transparent'; });
  await iso('sh-tile-blank', ['.tile.shadow-main']);
  await page.evaluate(() => { document.querySelector('.tile.shadow-main .val').style.color = ''; });
  data.shTiles = [];
  const tileEls = await page.evaluate(() => [...document.querySelectorAll('.main .tile')].map((el, i) => { el.dataset.capSh = i; return i; }));
  for (const i of tileEls) data.shTiles.push(await iso(`sh-tile-${i}`, [`[data-cap-sh="${i}"]`]));
  const chartCard = await page.evaluate(() => { const c = document.querySelector('[data-id="shadow-curve"]').closest('.card'); c.dataset.capChart = '1'; return true; });
  data.shChart = await iso('sh-chart', ['[data-cap-chart="1"]']);
  data.shChart.plot = rel(await page.evaluate(() => { const ps = [...document.querySelectorAll('[data-id="shadow-curve"] path.ln')]; const rs = ps.map(p => p.getBoundingClientRect()); const x = Math.min(...rs.map(r => r.x)), y = Math.min(...rs.map(r => r.y)); return { x, y, w: Math.max(...rs.map(r => r.right)) - x, h: Math.max(...rs.map(r => r.bottom)) - y }; }), data.shChart);
  await page.evaluate(() => { document.querySelectorAll('[data-id="shadow-curve"] path.ln, [data-id="shadow-curve"] circle, [data-id="shadow-curve"] path.area').forEach(p => p.style.display = 'none'); });
  await iso('sh-chart-blank', ['[data-cap-chart="1"]']);
  await page.evaluate(() => { document.querySelectorAll('[data-id="shadow-curve"] path, [data-id="shadow-curve"] circle').forEach(p => p.style.display = ''); });
  /* Regelkarte: Titel „My rule set“ */
  const rulesOk = await page.evaluate(() => { const t = [...document.querySelectorAll('.main .card')].find(c => /rule set/i.test(c.textContent.slice(0, 60))); if (!t) return false; t.scrollIntoView({ block: 'center' }); t.dataset.capRules = '1'; return true; });
  if (rulesOk) {
    await wait(600); data.rules = await iso('rules', ['[data-cap-rules="1"]']);
    /* Die drei aktiven Regeln einzeln */
    data.ruleTiles = [];
    for (const [i, name] of ['Max trades per day', 'Stop after consecutive losses', 'No new trade after a loss'].entries()) {
      const ok = await page.evaluate(([name, i]) => { const card = document.querySelector('[data-cap-rules="1"]'); const els = [...card.querySelectorAll('*')].filter(el => el.textContent.trim().startsWith(name) && el.getBoundingClientRect().height > 90 && el.getBoundingClientRect().height < 220); els.sort((a, b) => a.getBoundingClientRect().height - b.getBoundingClientRect().height); if (!els[0]) return false; els[0].dataset.capRule = i; return true; }, [name, i]);
      if (ok) data.ruleTiles.push(Object.assign(await iso(`rule-${i}`, [`[data-cap-rule="${i}"]`]), { name }));
    }
    await page.evaluate(() => scrollTo(0, 0));
  }

  /* 6 Prop Firms: Seite und das Topstep-Konto */
  await go('#/prop'); await wait(600);
  await page_('prop');
  await page.evaluate(() => { const c = [...document.querySelectorAll('.main .card, .main section, .main article')].filter(el => /Topstep/.test(el.textContent) && el.getBoundingClientRect().height > 200 && el.getBoundingClientRect().height < 420); c.sort((a, b) => a.getBoundingClientRect().height - b.getBoundingClientRect().height); if (c[0]) c[0].dataset.capProp = '1'; });
  data.propCard = await iso('prop-topstep', ['[data-cap-prop="1"]']);

  fs.writeFileSync(path.join(ROOT, 'src', 'data', 'cap.json'), JSON.stringify(data, null, 1));
  await browser.close();
  console.log('fertig');
})();
