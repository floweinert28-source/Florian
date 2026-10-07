/* Nimmt die echte Journalyst-Web-App auf: CDP-Screencast (PNG je Neuzeichnung) plus Ereignis-Log mit Zeiten und Klickpunkten.
   Aufruf: NODE_PATH=$(npm root -g) node scripts/record.cjs <web-Ordner> <Ausgabe-Ordner>
   Voraussetzung: Web-App unter http://127.0.0.1:8787 (python3 -m http.server im web-Ordner, Schriften unter /_fonts),
   Mentor-Mock unter http://127.0.0.1:8788 (python3 scripts/mentor-mock.py 8788). */
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const APP = 'http://127.0.0.1:8787'; const MENTOR = 'http://127.0.0.1:8788';
const FAKE_NOW = '2026-09-30T16:40:00Z'; /* Mittwoch, 30.09.2026: der Monat ist voll, der Kalender zeigt September */

(async () => {
  const out = process.argv[3] || 'out/footage'; const frames = path.join(out, 'frames'); fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(frames, { recursive: true });
  const css = [400, 500, 700, 900].map(w => `@font-face{font-family:'Satoshi';font-weight:${w};src:url(${APP}/_fonts/satoshi-${w}.woff2) format('woff2')}`).join('\n') + [400, 500, 600, 700].map(w => `@font-face{font-family:'Onest';font-weight:${w};src:url(${APP}/_fonts/onest-${w}.woff2) format('woff2')}`).join('\n');
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-proxy-server', '--force-device-scale-factor=1', '--hide-scrollbars'] });
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, locale: 'de-DE', colorScheme: 'dark', reducedMotion: 'no-preference' });
  await ctx.route(/fontshare\.com|fonts\.googleapis\.com/, r => r.fulfill({ status: 200, contentType: 'text/css', body: css }));
  await ctx.route(/fonts\.gstatic\.com|cdn\.fontshare\.com/, r => r.abort());
  await ctx.addInitScript(({ mentor }) => { try { if (!localStorage.getItem('trading-journal-web-v1')) localStorage.setItem('trading-journal-web-v1', JSON.stringify({ settings: { language: 'de', currency: 'EUR', mentor: { url: mentor, token: '' } } })); } catch (e) {} }, { mentor: MENTOR });
  const page = await ctx.newPage();
  await page.clock.setSystemTime(FAKE_NOW);
  page.on('pageerror', e => console.log('PAGEERROR', e.message));
  const cdp = await ctx.newCDPSession(page);
  let n = 0; const stamps = []; const events = []; let rec = false;
  cdp.on('Page.screencastFrame', async (ev) => { if (rec) { const i = n++; fs.writeFileSync(path.join(frames, `f${String(i).padStart(5, '0')}.png`), Buffer.from(ev.data, 'base64')); stamps.push([i, ev.metadata.timestamp]); } try { await cdp.send('Page.screencastFrameAck', { sessionId: ev.sessionId }); } catch (e) {} });
  const now = () => Date.now() / 1000;
  const log = async (name, loc) => { let box = null; if (loc) { try { box = await loc.boundingBox(); } catch (e) {} } events.push({ t: now(), name, x: box ? Math.round(box.x + box.width / 2) : null, y: box ? Math.round(box.y + box.height / 2) : null }); console.log(`${(now() - events[0].t).toFixed(2)}s  ${name}${box ? ` @ ${Math.round(box.x + box.width / 2)},${Math.round(box.y + box.height / 2)}` : ''}`); };
  const wait = ms => page.waitForTimeout(ms);
  const click = async (name, loc, pause = 300) => { await loc.scrollIntoViewIfNeeded(); await loc.hover(); await wait(pause); await log(name, loc); await loc.click(); };
  const typeIn = async (name, sel, text, delay = 55) => { const loc = page.locator(sel).first(); await loc.scrollIntoViewIfNeeded(); await click(name, loc, 180); await page.keyboard.type(text, { delay }); await wait(260); };
  const wheel = async (x, y, dy, steps = 10) => { await page.mouse.move(x, y); for (let i = 0; i < steps; i++) { await page.mouse.wheel(0, dy / steps); await wait(28); } await wait(220); };
  const nav = async (key, label, holdMs) => { await click('nav-' + key, page.locator(`.sidebar a[href="#/${key}"]`).first(), 350); await wait(holdMs); };

  await page.goto(`${APP}/app.html#/dashboard`, { waitUntil: 'load' });
  await page.waitForSelector('.boot', { state: 'detached', timeout: 20000 }).catch(() => {});
  await wait(600);
  await page.evaluate(() => { location.hash = '#/stats'; }); await wait(700); await page.evaluate(() => { location.hash = '#/dashboard'; }); await wait(300); /* einmal warm laufen, dann frisch einblenden */
  await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1 }); rec = true;
  events.push({ t: now(), name: 'start', x: null, y: null });
  await page.evaluate(() => { location.hash = '#/day'; }); await wait(250); await page.evaluate(() => { location.hash = '#/dashboard'; });
  await log('dash-enter'); await wait(2600); await log('dash-ready');

  /* Trade loggen */
  await click('open-editor', page.locator('button[data-action="new-trade"]').first(), 400); await wait(900);
  await typeIn('f-symbol', '#f-symbol', 'NQ', 90);
  await click('dir-long', page.locator('#f-dir button').first(), 150); await wait(200);
  await page.locator('#f-open').fill('2026-09-30T15:43'); await log('f-open', page.locator('#f-open')); await wait(300);
  await page.locator('#f-close').fill('2026-09-30T15:55'); await log('f-close', page.locator('#f-close')); await wait(300);
  await typeIn('f-entry', '#f-entry', '21190'); await typeIn('f-exit', '#f-exit', '21210.25');
  await page.locator('#f-qty').fill(''); await typeIn('f-qty', '#f-qty', '2', 80);
  await page.locator('#f-mult').fill(''); await typeIn('f-mult', '#f-mult', '20', 80);
  await page.locator('#f-fees').fill(''); await typeIn('f-fees', '#f-fees', '6.55', 70);
  await log('scroll-editor-1'); await wheel(960, 600, 300); await typeIn('f-pstop', '#f-pstop', '21181.5'); await typeIn('f-ptarget', '#f-ptarget', '21213');
  await typeIn('f-reason', '#f-reason', 'Range-Fade am Tageshoch, Ziel am Vortageshoch', 30);
  await log('scroll-editor-2'); await wheel(960, 600, 320); await typeIn('f-setup', '#f-setup', 'Range-Fade', 60);
  await click('rating-5', page.locator('#f-rating button[data-value="5"]').first(), 200); await wait(250);
  await click('emotion-ruhig', page.locator('[data-chips="emotions"] button[data-value="Ruhig"]').first(), 200); await wait(250);
  await log('scroll-editor-3'); await wheel(960, 600, 320); await typeIn('f-notes', '#f-notes', 'Sauber nach Plan. Einstieg am Range-Hoch, Ausstieg am Ziel.', 30);
  await wait(400);
  await click('save-trade', page.locator('#trade-form button[type="submit"]').first(), 500); await wait(600); await log('trade-saved'); await wait(2200);

  /* Statistiken, Reiter Fehler */
  await nav('stats', 'Statistiken', 2600);
  await click('tab-mistakes', page.locator('.main a[href="#/stats/mistakes"], .main [data-tab="mistakes"], .main a:has-text("Fehler"), .main button:has-text("Fehler")').first(), 350); await wait(2800);

  /* Fortschritt: Regeln abhaken */
  await nav('progress', 'Fortschritt', 2200);
  await log('scroll-progress'); await wheel(960, 700, 520, 12); await wait(400);
  const rules = page.locator('.checklist .it.toggle[data-action="day-rule"]'); const rn = await rules.count();
  for (let i = 0; i < Math.min(5, rn); i++) { await click(`rule-${i + 1}`, rules.nth(i), 160); await wait(330); }
  await wait(1600);

  /* Schatten-Ich: zwei Regeln einschalten */
  await nav('shadow', 'Schatten-Ich', 2800);
  await click('toggle-dailyLoss', page.locator('button[data-action="shadow-rule-toggle"][data-rule="dailyLoss"]').first(), 300); await wait(900);
  await click('toggle-maxRisk', page.locator('button[data-action="shadow-rule-toggle"][data-rule="maxRisk"]').first(), 300); await wait(2200);

  /* Ruhepunkt */
  await nav('ruhepunkt', 'Ruhepunkt', 3600);

  /* Mentor */
  await nav('mentor', 'Mentor', 1800);
  const input = page.locator('.main textarea, .main input[type="text"]').last();
  await typeIn('mentor-input', '#mentor-in', 'Wann verliere ich am meisten Geld?', 40);
  await wait(300); await log('mentor-send', page.locator('#mentor-in').first()); await page.keyboard.press('Enter'); await log('mentor-sent');
  await page.waitForSelector('.main :text("Zwischen 10 und 11 Uhr")', { timeout: 8000 }).catch(() => console.log('Mentor-Antwort nicht gefunden')); await log('mentor-reply'); await wait(3400);

  /* Prop Firms */
  await nav('prop', 'Prop Firms', 3600);

  /* zurück zum Dashboard für den Abspann */
  await nav('dashboard', 'Dashboard', 7000);
  await log('end');
  await cdp.send('Page.stopScreencast'); rec = false; await wait(300);
  const t0 = stamps.length ? stamps[0][1] : events[0].t;
  fs.writeFileSync(path.join(out, 'stamps.json'), JSON.stringify(stamps));
  fs.writeFileSync(path.join(out, 'events.json'), JSON.stringify({ t0, events: events.map(e => ({ ...e, t: Math.round((e.t - t0) * 1000) / 1000 })) }, null, 1));
  console.log(`Frames: ${n}, Dauer ${(stamps[stamps.length - 1][1] - t0).toFixed(1)} s`);
  await browser.close();
})();
