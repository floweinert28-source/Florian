/* Statistik: Reiter „Tage“ als Kennzahl-Leiste (6 Kacheln, 3 × 2) mit Karte „Tage im Detail“, Zähler nur bei > 0 gefärbt,
   Balken-Tooltip mit Summe bei Ø pro Trade, Monte Carlo neutral (ab Ruin rot), realisiertes R gefärbt, Gewinn-Heatmap auf --profit */
const { chromium } = require('playwright');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log('PASS ' + m); } else { fail++; console.log('FAIL ' + m); } };
const BASE = 'file:///home/user/Florian/web/app.html';
(async () => { const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); p.on('pageerror', e => errs.push(e.message)); try { await require('./localfonts.js')(p); } catch (e) {}
  await p.goto(BASE + '#/dashboard', { waitUntil: 'load' });
  await p.evaluate(() => { Store.installSample(); Store.setSetting('range', { preset: 'all' }); Store.saveNow(); });
  await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(500);
  const go = async h => { await p.evaluate(x => { location.hash = x; }, h); await p.waitForTimeout(700); };
  const tip = () => p.evaluate(() => { const t = document.getElementById('tip'); return t && t.classList.contains('on') ? t.textContent : ''; });

  /* Tage: Kennzahl-Leiste statt Wochentag-Diagramm und Karte „Tage im Überblick“ */
  await go('#/stats/days');
  const d = await p.evaluate(() => {
    const strip = document.querySelector('#content .grid.tiles.kstrip'); const tiles = strip ? [...strip.querySelectorAll(':scope > .tile')] : [];
    const tops = [...new Set(tiles.map(t => Math.round(t.getBoundingClientRect().top)))];
    const titles = [...document.querySelectorAll('#content .card-title')].map(t => t.textContent.trim());
    const card = [...document.querySelectorAll('#content .card')].find(c => (c.querySelector('.card-title') || {}).textContent === 'Tage im Detail');
    const ds = Core.daySummary(Core.dailyAggregation(App.tradesInRange()));
    const spans = tiles[1] ? [...tiles[1].querySelectorAll('.val span')].map(s => s.className.trim()) : [];
    const avg = [2, 3].map(i => tiles[i] ? ((tiles[i].querySelector('.val span') || {}).className || '').trim() : '');
    const rows = card ? [...card.querySelectorAll('tbody tr')] : []; const dd = rows.map(r => r.lastElementChild);
    return { n: tiles.length, cols: strip ? getComputedStyle(strip).gridTemplateColumns.split(' ').length : 0, rows: tops.length,
      labels: tiles.map(t => t.querySelector('.head').textContent.trim()).join('|'), vbars: !!document.querySelector('#content [data-chart="vbars"]'),
      titles, inset: !!(card && card.querySelector('.tbl-wrap.inset table')), ds: { w: ds.winDays, l: ds.lossDays, aw: ds.avgWinDay, al: ds.avgLossDay }, spans, avg,
      ddEmpty: dd.filter(c => c.textContent.trim() === '—').map(c => c.className), ddFull: dd.filter(c => c.textContent.trim() !== '—').map(c => c.className),
      over: document.documentElement.scrollWidth > innerWidth + 1 };
  });
  ok(d.n === 6 && d.labels === 'Handelstage|Gewinntage / Verlusttage|Ø Gewinntag|Ø Verlusttag|Tages-Profit-Faktor|Ø Trades pro Tag', 'Tage: Kennzahl-Leiste mit sechs Kacheln · ' + d.labels);
  ok(d.cols === 3 && d.rows === 2, `Tage 1440 px: Leiste als 3 × 2 (${d.cols} Spalten, ${d.rows} Reihen)`);
  ok(!d.vbars && !d.titles.includes('P&L nach Wochentag') && !d.titles.includes('Tage im Überblick'), 'Tage: kein Wochentag-Diagramm, keine Karte „Tage im Überblick“ (Wochentag steht unter „Zeit“)');
  ok(d.titles.includes('Tage im Detail') && d.inset, 'Tage: Tabelle in der Karte „Tage im Detail“ (tbl-wrap inset)');
  ok(d.spans[0] === (d.ds.w ? 'pos' : '') && d.spans[1] === (d.ds.l ? 'neg' : '') && d.avg[0] === (d.ds.aw > 0.005 ? 'pos' : 'neu') && d.avg[1] === (d.ds.al < -0.005 ? 'neg' : 'neu'), 'Tage: Zähler nur bei > 0 gefärbt, Ø-Tage nach Vorzeichen · ' + JSON.stringify({ spans: d.spans, avg: d.avg }));
  ok(d.ddEmpty.length > 0 && d.ddEmpty.every(c => /\bfaint\b/.test(c) && !/\bneg\b/.test(c)) && d.ddFull.every(c => /\bneg\b/.test(c)), `Tage: fehlender Drawdown als „—“ in faint (${d.ddEmpty.length}), sonst rot`);
  ok(!d.over, 'Tage 1440 px: kein Querscrollen');

  /* Ein einzelner Verlusttag: Gewinntage-Zähler 0 bleibt neutral, Ø Gewinntag 0 neutral */
  const lossKey = await p.evaluate(() => (Core.dailyAggregation(App.tradesInRange()).find(x => x.pnl < -1) || {}).key);
  await p.evaluate(k => { Store.setSetting('range', { preset: 'custom', from: k, to: k }); App.rerender(); }, lossKey); await p.waitForTimeout(500);
  const z = await p.evaluate(() => { const t = [...document.querySelectorAll('#content .kstrip > .tile')]; return { spans: [...t[1].querySelectorAll('.val span')].map(s => [s.className.trim(), s.textContent]), aw: t[2].querySelector('.val span').className.trim(), al: t[3].querySelector('.val span').className.trim() }; });
  ok(z.spans[0][0] === '' && z.spans[0][1] === '0' && z.spans[1][0] === 'neg' && z.aw === 'neu' && z.al === 'neg', 'Ein Verlusttag: „0“ Gewinntage und Ø Gewinntag neutral, Verlust rot · ' + JSON.stringify(z));
  await p.evaluate(() => { Store.setSetting('range', { preset: 'all' }); App.rerender(); }); await p.waitForTimeout(400);

  /* Handy: zwei Spalten */
  await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(400);
  const m = await p.evaluate(() => { const s = document.querySelector('#content .kstrip'); return { cols: getComputedStyle(s).gridTemplateColumns.split(' ').length, over: document.documentElement.scrollWidth > innerWidth + 1 }; });
  ok(m.cols === 2 && !m.over, 'Tage 390 px: Leiste zweispaltig, kein Querscrollen · ' + JSON.stringify(m));
  /* Tablet: 3 × 2 auch bei 1200, 1024 und 800 px (auto-fit allein ergäbe 4 + 2 bzw. unter 961 px zwei Spalten) */
  for (const w of [1200, 1024, 800]) {
    await p.setViewportSize({ width: w, height: 900 }); await p.waitForTimeout(400);
    const tb = await p.evaluate(() => { const s = document.querySelector('#content .kstrip'); const t = [...s.children]; return { cols: getComputedStyle(s).gridTemplateColumns.split(' ').length, rows: new Set(t.map(x => Math.round(x.getBoundingClientRect().top))).size, over: document.documentElement.scrollWidth > innerWidth + 1 }; });
    ok(tb.cols === 3 && tb.rows === 2 && !tb.over, `Tage ${w} px: Leiste als 3 × 2, kein Querscrollen · ` + JSON.stringify(tb));
  }
  await p.setViewportSize({ width: 1440, height: 900 }); await p.waitForTimeout(300);

  /* Balken-Tooltip: bei Ø pro Trade zusätzlich die Summe (vbars und hbars), bei Summen-Diagrammen nicht */
  await go('#/stats/time');
  const tt = await p.evaluate(() => { const t = id => [...document.querySelectorAll(`[data-id="${id}"] svg [data-tip]`)].map(e => e.getAttribute('data-tip')); return { wd: t('t-wd'), h: t('t-h') }; });
  ok(tt.wd.length > 0 && tt.wd.every(s => /pro Trade<br>Summe [+−]?[\d.,]+\s€ · \d+ Trades · Trefferquote/.test(s)), 'Ø pro Trade nach Wochentag: Tooltip mit Summe · ' + (tt.wd[0] || ''));
  ok(tt.h.length > 0 && tt.h.every(s => !/Summe|pro Trade/.test(s) && /<br>\d+ Trades · Trefferquote/.test(s)), 'Netto-P&L nach Uhrzeit: Tooltip ohne Summe · ' + (tt.h[0] || ''));
  const bar = await p.$('[data-id="t-wd"] svg rect[data-tip]'); const bb = await bar.boundingBox();
  await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2, { steps: 3 }); await p.waitForTimeout(150);
  const shown = await tip(); ok(/pro Trade/.test(shown) && /Summe/.test(shown), 'Tooltip erscheint beim Überfahren mit Summe · ' + shown);
  await go('#/stats/setups');
  const hs = await p.evaluate(() => [...document.querySelectorAll('[data-id="st-setups"] svg [data-tip]')].map(e => e.getAttribute('data-tip')));
  ok(hs.length > 0 && hs.every(s => /pro Trade<br>Summe /.test(s)), 'Erwartungswert je Setup (hbars): gleicher Tooltip mit Summe · ' + (hs[0] || ''));
  /* Gemeinsamer Baustein: leeres Fach „<b>Name</b>: Keine Trades“, sonst Wert, Summe, Trades und Trefferquote, in vbars und hbars gleich */
  const gt = await p.evaluate(() => { const g = [{ key: 'Sa', s: { n: 0, expectancy: 0, total: 0, winRate: 0 } }, { key: 'So', s: { n: 2, expectancy: 10, total: 20, winRate: 0.5 } }]; const out = {};
    for (const k of ['vbars', 'hbars']) { const el = document.createElement('div'); UI.drawers[k](el, { groups: g, metric: 'expectancy' }, 400, 200); out[k] = [...el.querySelectorAll('[data-tip]')].map(e => e.getAttribute('data-tip')); } return out; });
  ok(['vbars', 'hbars'].every(k => gt[k].length === 2 && gt[k][0] === '<b>Sa</b>: Keine Trades' && /^<b>So<\/b>: \+10,00\s€ pro Trade<br>Summe \+20,00\s€ · 2 Trades · Trefferquote 50\s%$/.test(gt[k][1])), 'Balken-Tooltip: leeres Fach „Keine Trades“, vbars und hbars gleich · ' + JSON.stringify(gt));

  /* Englisch: Tooltip übersetzt */
  await p.evaluate(async () => { Store.setLanguage('en'); I18N.setLang('en'); await new Promise(r => setTimeout(r, 900)); location.hash = '#/stats/time'; }); await p.waitForTimeout(900);
  const bar2 = await p.$('[data-id="t-wd"] svg rect[data-tip]'); const bb2 = await bar2.boundingBox();
  await p.mouse.move(bb2.x + bb2.width / 2, bb2.y + bb2.height / 2 + 1, { steps: 3 }); await p.waitForTimeout(250);
  const en = await tip(); ok(/per trade/.test(en) && /Total .+ · \d+ trades · Win rate/.test(en) && !/Summe|Trades · Trefferquote/.test(en), 'Englisch: Tooltip übersetzt · ' + en);
  await p.evaluate(() => { Store.setLanguage('de'); I18N.setLang('de'); App.rerender(); }); await p.waitForTimeout(400);
  await p.mouse.move(5, 5);

  /* Monte Carlo: Pfade und Histogramm neutral, ab Ruin --loss .9 */
  await go('#/stats/mc'); await p.waitForTimeout(400);
  const mc = await p.evaluate(() => { const pl = [...document.querySelectorAll('[data-chart="mc"] polyline')]; const hr = [...document.querySelectorAll('[data-chart="hist"] rect')];
    return { pl: pl.length, plOk: pl.every(e => e.getAttribute('stroke') === 'var(--text-2)' && e.getAttribute('stroke-opacity') === '.22'),
      hr: hr.length, hrOk: hr.every(e => (e.getAttribute('fill') === 'var(--text-2)' && e.getAttribute('fill-opacity') === '0.45') || (e.getAttribute('fill') === 'var(--loss)' && e.getAttribute('fill-opacity') === '0.9')),
      accent: !!document.querySelector('[data-chart="mc"] [stroke="var(--accent)"], [data-chart="hist"] [fill="var(--accent)"]') }; });
  ok(mc.pl > 0 && mc.plOk && mc.hr > 0 && mc.hrOk && !mc.accent, 'Monte Carlo: Pfade --text-2 .22, Histogramm --text-2 .45 bzw. ab Ruin --loss .9, kein Akzent · ' + JSON.stringify(mc));

  /* Übersicht: realisiertes R gefärbt, geplantes neutral */
  await go('#/stats/summary');
  const r = await p.evaluate(() => { const t = [...document.querySelectorAll('.stat-tile')]; const f = l => t.find(x => x.querySelector('.k').textContent.trim() === l); const re = f('Ø realisiertes R-Multiple'), pl = f('Ø geplantes R-Multiple');
    const v = Core.summary(App.tradesInRange()).avgR; return { cls: (re.querySelector('.v span') || {}).className || '', v, plain: !pl.querySelector('.v span') }; });
  ok(r.cls.trim() === (r.v == null ? 'faint' : r.v > 0.005 ? 'pos' : r.v < -0.005 ? 'neg' : 'neu') && r.plain, 'Übersicht: realisiertes R nach Vorzeichen gefärbt, geplantes R neutral · ' + JSON.stringify(r));

  /* Gewinn-Heatmap: Check-in-Stufe neutral, Gewinnstufen auf --profit */
  const h = await p.evaluate(() => { const box = document.createElement('div'); box.innerHTML = '<div class="heat"><i class="l1"></i><i class="l4"></i></div><i id="ref-l1" style="background:color-mix(in srgb, var(--text) 18%, var(--surface-3))"></i><i id="ref-p" style="background:var(--profit)"></i>'; document.getElementById('content').appendChild(box);
    const bg = e => getComputedStyle(e).backgroundColor; const out = { l1: bg(box.querySelector('.l1')), l4: bg(box.querySelector('.l4')), r1: bg(box.querySelector('#ref-l1')), rp: bg(box.querySelector('#ref-p')) }; box.remove(); return out; });
  ok(h.l1 === h.r1 && h.l4 === h.rp, 'Heatmap: l1 neutral (Text 18 %), l4 = --profit · ' + JSON.stringify(h));

  ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
  console.log(`${pass}/${pass + fail} bestanden`); await b.close(); process.exit(fail ? 1 : 0); })();
