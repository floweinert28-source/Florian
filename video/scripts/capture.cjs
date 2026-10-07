/* Standbilder der echten Journalyst-Web-App für das Video, je Sprache: 1440 × 900, doppelte Auflösung.
   Aufruf: NODE_PATH=$(npm root -g) node scripts/capture.cjs   (Web-App unter http://127.0.0.1:8787, Schriften unter /_fonts)
   Schreibt public/shots/<sprache>/*.png und src/data/shots-<sprache>.json (Position der Knöpfe, Karten und des Dialogs). */
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const APP = 'http://127.0.0.1:8787'; const ROOT = path.resolve(__dirname, '..');
const FAKE_NOW = '2026-09-30T16:40:00Z';
const VW = 1440, VH = 900;
const LANGS = { en: { currency: 'USD', costLabel: 'Discipline cost', reason: 'Pullback to VWAP in an uptrend', notes: 'Clean, by the plan. Waited for the pullback, exit at target.' },
                de: { currency: 'EUR', costLabel: 'Disziplin-Kosten', reason: 'Pullback an den VWAP im Aufwärtstrend', notes: 'Sauber nach Plan. Auf den Pullback gewartet, Ausstieg am Ziel.' } };

(async () => {
  const css = [400, 500, 700, 900].map(w => `@font-face{font-family:'Satoshi';font-weight:${w};src:url(${APP}/_fonts/satoshi-${w}.woff2) format('woff2')}`).join('\n') + [400, 500, 600, 700].map(w => `@font-face{font-family:'Onest';font-weight:${w};src:url(${APP}/_fonts/onest-${w}.woff2) format('woff2')}`).join('\n');
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-proxy-server', '--hide-scrollbars'] });
  for (const [lang, L] of Object.entries(LANGS)) {
    const out = path.join(ROOT, 'public', 'shots', lang); fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
    const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2, locale: lang === 'de' ? 'de-DE' : 'en-US', colorScheme: 'dark' });
    await ctx.route(/fontshare\.com|fonts\.googleapis\.com/, r => r.fulfill({ status: 200, contentType: 'text/css', body: css }));
    await ctx.route(/fonts\.gstatic\.com|cdn\.fontshare\.com/, r => r.abort());
    await ctx.addInitScript(({ lang, cur }) => { try { if (!localStorage.getItem('trading-journal-web-v1')) localStorage.setItem('trading-journal-web-v1', JSON.stringify({ settings: { language: lang, currency: cur } })); } catch (e) {} }, { lang, cur: L.currency });
    const page = await ctx.newPage(); await page.clock.setSystemTime(FAKE_NOW);
    page.on('pageerror', e => console.log('PAGEERROR', e.message));
    const wait = ms => page.waitForTimeout(ms);
    const box = async (sel) => page.evaluate((s) => { const el = document.querySelector(s); if (!el) return null; const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; }, sel);
    const cards = async () => page.evaluate(() => [...document.querySelectorAll('.main .card, .main .dash-top')].map(el => { const r = el.getBoundingClientRect(); const t = el.querySelector('.card-title'); return { cls: el.className.split(' ')[0], title: t ? t.textContent.trim() : '', x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; }).filter(b => b.h > 20 && b.y < 900));
    /* Reihe der Kennzahl-Kacheln über ihren Titel finden (Element mit genau diesem Text, dann bis zur Kachel und deren Reihe hoch) */
    const rowOf = (label) => page.evaluate((label) => {
      const hit = [...document.querySelectorAll('.main *')].find(el => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim() === label));
      if (!hit) return null; let el = hit; while (el && el.getBoundingClientRect().height < 80) el = el.parentElement;
      const row = el && el.parentElement; if (!row) return null; const r = row.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
    }, label);
    const shot = async (name) => { await page.mouse.move(VW - 4, VH - 4); await page.screenshot({ path: path.join(out, name + '.png') }); console.log(lang, 'ok', name); };
    const go = async (hash) => { await page.evaluate(h => { location.hash = h; }, hash); await wait(2200); };
    const data = { lang, viewport: { w: VW, h: VH }, screens: {} };

    await page.goto(`${APP}/app.html#/dashboard`, { waitUntil: 'load' });
    await page.waitForSelector('.boot', { state: 'detached', timeout: 20000 }).catch(() => {});
    await go('#/stats'); await go('#/dashboard'); await wait(600);
    await shot('dashboard');
    data.screens.dashboard = { cards: await cards(), logTrade: await box('button[data-action="new-trade"]') };

    /* Trade loggen: Dialog öffnen und ausfüllen */
    await page.evaluate(() => document.querySelector('button[data-action="new-trade"]').click()); await wait(900);
    const fill = async (sel, v) => { await page.locator(sel).fill(String(v)); };
    await fill('#f-symbol', 'ES');
    await page.evaluate(() => document.querySelector('#f-dir button').click());
    await fill('#f-open', '2026-09-30T16:12'); await fill('#f-close', '2026-09-30T16:31');
    await fill('#f-entry', 5742.25); await fill('#f-exit', 5751.5); await fill('#f-qty', 2); await fill('#f-mult', 50); await fill('#f-fees', 4.8);
    await fill('#f-pstop', 5738); await fill('#f-ptarget', 5752); await fill('#f-reason', L.reason); await fill('#f-setup', 'Pullback');
    await page.evaluate(() => document.querySelector('#f-rating button[data-value="5"]').click());
    await page.evaluate(() => { const b = document.querySelector('[data-chips="emotions"] button[data-value="Ruhig"]'); if (b) b.click(); });
    await fill('#f-notes', L.notes);
    await page.evaluate(() => { document.activeElement && document.activeElement.blur(); const m = document.querySelector('.modal'); m.scrollTop = 0; });
    await wait(500);
    const modal = await box('.modal');
    const modalScroll = await page.evaluate(() => { const m = document.querySelector('.modal'); return { scrollH: m.scrollHeight, clientH: m.clientHeight }; });
    const saveRel = await page.evaluate(() => { const m = document.querySelector('.modal'); const b = document.querySelector('#trade-form button[type="submit"]'); const mr = m.getBoundingClientRect(), br = b.getBoundingClientRect(); return { x: Math.round(br.x - mr.x), y: Math.round(br.y - mr.y + m.scrollTop), w: Math.round(br.width), h: Math.round(br.height) }; });
    /* Hintergrund ohne Dialog, dann der ganze Dialog als ein hohes Bild */
    await page.evaluate(() => { document.querySelector('.modal').style.visibility = 'hidden'; });
    await shot('editor-bg');
    await page.evaluate(() => { const m = document.querySelector('.modal'); m.style.visibility = ''; m.style.maxHeight = 'none'; m.style.animation = 'none'; });
    await page.setViewportSize({ width: VW, height: Math.max(VH, modalScroll.scrollH + 80) }); await wait(400);
    await page.locator('.modal').screenshot({ path: path.join(out, 'editor-modal.png') }); console.log(lang, 'ok', 'editor-modal');
    await page.evaluate(() => { const m = document.querySelector('.modal'); m.style.maxHeight = ''; }); await page.setViewportSize({ width: VW, height: VH }); await wait(300);
    data.screens.editor = { modal, scrollH: modalScroll.scrollH, clientH: modalScroll.clientH, save: saveRel };

    /* Speichern: Dashboard mit neuem Trade und Hinweis */
    await page.evaluate(() => document.querySelector('#trade-form').requestSubmit()); await wait(650);
    await shot('saved');
    data.screens.saved = { cards: await cards(), toast: await box('.toast') };
    await wait(2500);

    await go('#/trades'); await shot('trades'); data.screens.trades = { cards: await cards(), table: await box('.main table'), firstRow: await box('.main table tbody tr') };
    await go('#/shadow'); await shot('shadow'); data.screens.shadow = { cards: await cards(), tiles: await rowOf(L.costLabel) };
    await go('#/prop'); await shot('prop'); data.screens.prop = { cards: await cards() };

    fs.writeFileSync(path.join(ROOT, 'src', 'data', `shots-${lang}.json`), JSON.stringify(data, null, 1));
    await ctx.close();
  }
  await browser.close();
})();
