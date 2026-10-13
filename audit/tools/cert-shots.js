const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const base = 'file:///home/user/Florian/web/app.html'; const OUT = path.join(__dirname, 'shots', 'extra', 'cert'); fs.mkdirSync(OUT, { recursive: true });
const LOG = []; const log = m => { LOG.push(m); console.log(m); };
async function savePng(p, sel, fmtKey, name) {
  const data = await p.evaluate(async ([sel, fmtKey]) => { const card = document.querySelector(sel); if (!card) throw new Error('keine Karte ' + sel); const blob = await Certificate.toBlob(card, Certificate.FORMATS[fmtKey]); return await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); }); }, [sel, fmtKey]);
  fs.writeFileSync(path.join(OUT, name + '.png'), Buffer.from(data.split(',')[1], 'base64')); log('ok ' + name);
}
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); await require('../localfonts.js')(p);
  p.on('pageerror', e => log('PAGEERR ' + e.message));
  await p.goto(base, { waitUntil: 'load' });
  await p.evaluate(() => { Store.installSample(); Store.setSetting('theme', 'dark'); Store.setSetting('language', 'de'); Store.setSetting('profile', Object.assign({}, Store.settings.profile, { username: 'flo.trades' })); Store.saveNow(); });
  await p.goto(base + '#/dashboard'); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(1200);
  log('fonts ' + JSON.stringify(await p.evaluate(async () => { await document.fonts.ready; return { sat: document.fonts.check('700 20px Satoshi'), onest: document.fonts.check('700 20px Onest') }; })));
  const refs = await p.evaluate(() => { const all = App.allTrades().filter(t => t.close); const byDay = new Map(); for (const t of all) byDay.set(t.dayKey, (byDay.get(t.dayKey) || 0) + (t.pnl || 0)); const days = [...byDay.entries()].sort((a, b) => a[0] < b[0] ? 1 : -1); const win = days.find(d => d[1] > 0), loss = days.find(d => d[1] < 0); const lastDay = days[0][0]; return { win: win && win[0], winP: win && win[1], loss: loss && loss[0], lossP: loss && loss[1], lastDay, month: lastDay.slice(0, 7), months: [...new Set(days.map(d => d[0].slice(0, 7)))], n: all.length, days: days.slice(0, 40) }; });
  log('refs ' + JSON.stringify(refs).slice(0, 1500));
  const open = async (kind, ref) => { await p.evaluate(([k, r]) => Certificate.open(k, r), [kind, ref]); await p.waitForTimeout(700); };
  const close = async () => { await p.evaluate(() => { const c = document.querySelector('.modal [data-close]'); if (c) c.click(); }); await p.waitForTimeout(400); };
  const setFormat = async f => { await p.click(`[data-c="format"][data-v="${f}"]`); await p.waitForTimeout(500); };
  const variants = [['day', refs.win], ['week', refs.win], ['month', refs.month], ['stats', 'range']];
  for (const [kind, ref] of variants) {
    await open(kind, ref);
    for (const f of ['square', 'story', 'wide']) { try { await setFormat(f); if (kind === 'month' || f === 'square') await p.screenshot({ path: path.join(OUT, `modal_${kind}_${f}.png`) }); await savePng(p, '#cert-preview .cert', f, `${kind}_${f}`); } catch (e) { log(`FAIL ${kind} ${f}: ${e.message.split('\n')[0]}`); } }
    await close();
  }
  // Verlusttag
  await open('day', refs.loss); for (const f of ['square', 'story', 'wide']) { await setFormat(f); await savePng(p, '#cert-preview .cert', f, `verlust_day_${f}`); } await p.screenshot({ path: path.join(OUT, 'modal_verlust_day.png') }); await close();
  // Verlustmonat suchen
  const lossMonth = await p.evaluate(() => { const all = App.allTrades().filter(t => t.close); const m = new Map(); for (const t of all) { const k = t.dayKey.slice(0, 7); m.set(k, (m.get(k) || 0) + t.pnl); } return [...m.entries()]; }); log('monate ' + JSON.stringify(lossMonth));
  const lm = lossMonth.find(x => x[1] < 0); if (lm) { await open('month', lm[0]); await setFormat('square'); await savePng(p, '#cert-preview .cert', 'square', 'verlust_month_square'); await close(); }
  // Beträge ausblenden
  await open('month', refs.month); await setFormat('square'); await p.click('[data-c="hide"]'); await p.waitForTimeout(500); await p.screenshot({ path: path.join(OUT, 'modal_hide.png') }); await savePng(p, '#cert-preview .cert', 'square', 'hide_month_square'); await setFormat('wide'); await savePng(p, '#cert-preview .cert', 'wide', 'hide_month_wide'); await p.click('[data-c="hide"]'); await p.waitForTimeout(300);
  // ohne Username
  await p.click('[data-c="user"]'); await p.waitForTimeout(400); await setFormat('square'); await savePng(p, '#cert-preview .cert', 'square', 'nouser_month_square'); await p.click('[data-c="user"]'); await close();
  // Konstruierte Fälle direkt über cardHTML
  const synth = async (name, kind, f, mOver, o) => {
    await p.evaluate(([kind, f, mOver, o, ref]) => { const D = CertData; const p0 = D.period(kind, kind === 'month' ? ref.slice(0, 7) : kind === 'stats' ? null : ref); const m = Object.assign(D.compute(kind, D.select(App.allTrades(), p0), p0), mOver); let host = document.getElementById('synth'); if (!host) { host = document.createElement('div'); host.id = 'synth'; host.style.cssText = 'position:fixed;left:0;top:0;z-index:9999'; document.body.appendChild(host); } host.innerHTML = Certificate.cardHTML(m, p0, Object.assign({ format: f, hide: false, user: true, account: App.account() }, o)); }, [kind, f, mOver, o, refs.win]);
    await p.waitForTimeout(250); await savePng(p, '#synth .cert', f, name);
  };
  await synth('null_day_square', 'day', 'square', { pnl: 0, winRate: 0.5 }, {});
  await synth('gross_month_square', 'month', 'square', { pnl: 1234567.89 }, {});
  await synth('gross_month_story', 'month', 'story', { pnl: 1234567.89 }, {});
  await synth('gross_month_wide', 'month', 'wide', { pnl: 1234567.89 }, {});
  await synth('grossneg_month_wide', 'month', 'wide', { pnl: -48210.5 }, {});
  await synth('mittel_month_wide', 'month', 'wide', { pnl: 12345.67 }, {});
  await synth('pf_inf_month_square', 'month', 'square', { pf: Infinity }, {});
  await p.evaluate(() => { Store.setSetting('profile', Object.assign({}, Store.settings.profile, { username: 'christopher.vandenberg_futures_trading' })); });
  await synth('languser_day_square', 'day', 'square', {}, {}); await synth('languser_day_wide', 'day', 'wide', {}, {}); await synth('languser_day_story', 'day', 'story', {}, {});
  await p.evaluate(() => { Store.setSetting('profile', Object.assign({}, Store.settings.profile, { username: 'flo.trades' })); document.getElementById('synth').remove(); });
  // Englisch
  await p.evaluate(() => { Store.setSetting('language', 'en'); Store.saveNow(); }); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(1200);
  await open('month', refs.month); await setFormat('square'); await p.screenshot({ path: path.join(OUT, 'modal_en_month.png') }); await savePng(p, '#cert-preview .cert', 'square', 'en_month_square'); await close();
  await open('week', refs.win); await setFormat('wide'); await savePng(p, '#cert-preview .cert', 'wide', 'en_week_wide'); await p.screenshot({ path: path.join(OUT, 'modal_en_week.png') }); await close();
  // Handy-Modal
  await p.evaluate(() => { Store.setSetting('language', 'de'); Store.saveNow(); });
  const ctx2 = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); const q = await ctx2.newPage(); await require('../localfonts.js')(q);
  await q.goto(base, { waitUntil: 'load' }); await q.evaluate(() => { Store.installSample(); Store.setSetting('theme', 'dark'); Store.setSetting('language', 'de'); Store.setSetting('profile', Object.assign({}, Store.settings.profile, { username: 'flo.trades' })); Store.saveNow(); }); await q.reload({ waitUntil: 'load' }); await q.waitForTimeout(1200);
  await q.evaluate(m => Certificate.open('month', m), refs.month); await q.waitForTimeout(800); await q.screenshot({ path: path.join(OUT, 'm390_modal_month.png') }); await q.screenshot({ path: path.join(OUT, 'm390_modal_month_full.png'), fullPage: true });
  await q.evaluate(() => { const m = document.querySelector('.modal'); if (m) m.scrollTop = 9999; const s = document.querySelector('.modal-wrap, .modal-bg, .overlay'); if (s) s.scrollTop = 9999; }); await q.waitForTimeout(300); await q.screenshot({ path: path.join(OUT, 'm390_modal_month_unten.png') });
  fs.writeFileSync(path.join(__dirname, 'cert-shots-log.txt'), LOG.join('\n') + '\n'); await b.close(); console.log('DONE');
})().catch(e => { console.error(e); fs.writeFileSync(path.join(__dirname, 'cert-shots-log.txt'), LOG.join('\n') + '\nERR ' + e.stack); process.exit(1); });
