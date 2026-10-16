/* Formulare und Barrierefreiheit: Entwurf im Trade-Fenster, Erscheinungsbild „Automatisch“, sichtbarer Fokus,
   Erklärung zur Barrierefreiheit, Laden mit Platzhaltern (News), keine technischen Namen in den Einstellungen */
const { chromium } = require('playwright');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log('PASS ' + m); } else { fail++; console.log('FAIL ' + m); } };
const BASE = 'file:///home/user/Florian/web/app.html';
(async () => { const b = await chromium.launch(); const errs = [];
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: 'dark' }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message)); try { await require('./localfonts.js')(p); } catch (e) {}
  await p.goto(BASE + '#/trades', { waitUntil: 'load' }); await p.waitForTimeout(900);
  /* Entwurf: Eingaben bleiben, wenn das Fenster ohne Speichern zugeht */
  await p.evaluate(() => { localStorage.removeItem('jy_trade_draft'); App.openTradeEditor(null); }); await p.waitForTimeout(500);
  await p.evaluate(() => { const s = document.getElementById('f-symbol'); s.value = 'NQ'; s.dispatchEvent(new Event('input', { bubbles: true })); });
  await p.fill('#f-entry', '21000.5'); await p.fill('#f-qty', '2'); await p.waitForTimeout(600);
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  ok(await p.evaluate(() => !document.querySelector('#trade-form')), 'Escape schließt das Trade-Fenster');
  await p.evaluate(() => App.openTradeEditor(null)); await p.waitForTimeout(500);
  const re = await p.evaluate(() => ({ note: (document.querySelector('.tf-draft') || {}).textContent || '', sym: document.getElementById('f-symbol').value, entry: document.getElementById('f-entry').value, qty: document.getElementById('f-qty').value }));
  ok(/Entwurf wiederhergestellt/.test(re.note) && re.sym === 'NQ' && /21000[.,]5/.test(re.entry) && re.qty === '2', 'Wieder geöffnet: Entwurf mit Symbol, Einstieg und Menge da, Hinweis sichtbar · ' + JSON.stringify(re));
  await p.click('[data-action=trade-draft-discard]'); await p.waitForTimeout(500);
  const gone = await p.evaluate(() => ({ note: !!document.querySelector('.tf-draft'), entry: (document.getElementById('f-entry') || {}).value, stored: localStorage.getItem('jy_trade_draft') }));
  ok(!gone.note && !gone.entry && !/NQ/.test(gone.stored || ''), '„Verwerfen“: leeres Fenster, kein Entwurf mehr gespeichert · ' + JSON.stringify(gone));
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  await p.evaluate(() => App.openTradeEditor(null)); await p.waitForTimeout(400);
  ok(await p.evaluate(() => !document.querySelector('.tf-draft')), 'Leeres Fenster ohne Eingabe hinterlässt keinen Entwurf');
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  /* Bearbeiten: Entwurf je Trade, Speichern räumt ihn weg */
  const tid = await p.evaluate(() => Store.trades().find(t => t.closedAt).id);
  await p.evaluate(i => App.openTradeEditor(Store.getTrade(i)), tid); await p.waitForTimeout(500);
  await p.fill('#f-qty', '7'); await p.waitForTimeout(600); await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  await p.evaluate(i => App.openTradeEditor(Store.getTrade(i)), tid); await p.waitForTimeout(500);
  ok(await p.evaluate(() => document.getElementById('f-qty').value === '7' && !!document.querySelector('.tf-draft')), 'Trade bearbeiten: geänderte Menge als Entwurf wieder da');
  await p.evaluate(() => document.getElementById('trade-form').requestSubmit()); await p.waitForTimeout(700);
  const saved = await p.evaluate(i => ({ q: Store.getTrade(i).quantity, d: localStorage.getItem('jy_trade_draft') }), tid);
  ok(saved.q === 7 && !(saved.d || '').includes('edit:' + tid), 'Gespeichert: Wert übernommen, Entwurf gelöscht · ' + JSON.stringify(saved));
  /* Fokus sichtbar mit der Tastatur */
  await p.evaluate(() => { location.hash = '#/settings/profil'; }); await p.waitForTimeout(600);
  await p.keyboard.press('Tab'); await p.keyboard.press('Tab'); await p.waitForTimeout(200);
  const foc = await p.evaluate(() => { const a = document.activeElement; const cs = getComputedStyle(a); return { tag: a.tagName, ol: cs.outlineStyle, ow: parseFloat(cs.outlineWidth), sh: cs.boxShadow }; });
  ok(foc.tag !== 'BODY' && ((foc.ol !== 'none' && foc.ow >= 1) || foc.sh !== 'none'), 'Tastatur: fokussiertes Element hat sichtbaren Rahmen · ' + JSON.stringify(foc));
  /* Erscheinungsbild „Automatisch“ */
  await p.evaluate(() => { location.hash = '#/settings/design'; }); await p.waitForTimeout(600);
  ok(await p.evaluate(() => !!document.querySelector('.theme-card[data-value=system] .tc-half')), 'Design: Karte „Automatisch“ mit halb heller, halb dunkler Vorschau');
  await p.click('.theme-card[data-value=system]'); await p.waitForTimeout(500);
  const sys = await p.evaluate(() => ({ pref: Store.settings.theme, theme: document.documentElement.dataset.theme, pressed: document.querySelector('.theme-card[data-value=system]').getAttribute('aria-pressed') }));
  ok(sys.pref === 'system' && sys.theme === 'dark' && sys.pressed === 'true', 'Automatisch gewählt: Gerät dunkel → App dunkel · ' + JSON.stringify(sys));
  await p.emulateMedia({ colorScheme: 'light' }); await p.waitForTimeout(500);
  const lt = await p.evaluate(() => ({ theme: document.documentElement.dataset.theme, bg: getComputedStyle(document.body).backgroundColor, pressed: document.querySelector('.theme-card[data-value=system]').getAttribute('aria-pressed') }));
  ok(lt.theme === 'light' && lt.pressed === 'true', 'Gerät wechselt auf hell: App folgt sofort, Karte bleibt gewählt · ' + JSON.stringify(lt));
  await p.click('.theme-card[data-value=graphit]'); await p.waitForTimeout(400);
  ok(await p.evaluate(() => Store.settings.theme === 'dark' && document.documentElement.dataset.theme === 'dark'), 'Feste Wahl (Graphit) bleibt dunkel, auch wenn das Gerät hell ist');
  await p.emulateMedia({ colorScheme: 'dark' });
  /* Erklärung zur Barrierefreiheit */
  await p.evaluate(() => { location.hash = '#/settings/barrierefreiheit'; }); await p.waitForTimeout(600);
  const st = await p.evaluate(() => { const b = document.querySelector('.set-body'); return { nav: !!document.querySelector('.set-nav a[href="#/settings/barrierefreiheit"].active'), text: b.innerText, h3: b.querySelectorAll('h3').length, link: !!b.querySelector('a[href="#/contact"]') }; });
  ok(st.nav && /WCAG 2\.2/.test(st.text) && /teilweise/.test(st.text) && /Stand: 16\.10\.2026/.test(st.text) && st.h3 >= 5 && st.link, 'Barrierefreiheit: Ziel, Stand, umgesetzt, Grenzen, Kontakt · ' + st.h3);
  ok(/Achsen/.test(st.text) && /Zertifikat/.test(st.text), 'Bekannte Grenzen benannt (Diagramm-Achsen, Zertifikat)');
  await p.click('.set-body a[href="#/contact"]'); await p.waitForTimeout(500);
  ok(await p.evaluate(() => App.state.route === 'contact'), 'Link führt zum Kontaktformular');
  /* Keine technischen Namen in den Einstellungen */
  await p.evaluate(() => { location.hash = '#/settings/mentor'; }); await p.waitForTimeout(600);
  const tech = await p.evaluate(() => { const b = document.querySelector('.set-body'); return b.innerText + ' ' + [...b.querySelectorAll('[placeholder]')].map(x => x.placeholder).join(' '); });
  ok(!/MENTOR_APP_TOKEN|VOICE_STT_URL|README|COACH_SMTP/.test(tech), 'Einstellungen → Mentor: keine Variablennamen oder Dateipfade');
  /* News: Platzhalter in Listenform statt Kreisel */
  await p.route('https://news.test/**', async r => { await new Promise(res => setTimeout(res, 1500)); r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ events: [], fetchedAt: new Date().toISOString() }) }).catch(() => {}); });
  await p.evaluate(() => { Store.setSetting('mentor', { url: 'https://news.test', token: 'x' }); App.state.news = null; location.hash = '#/news'; }); await p.waitForTimeout(500);
  const nw = await p.evaluate(() => ({ skel: document.querySelectorAll('.nw-skel .nw-row').length, spin: !!document.querySelector('#main .spin'), role: (document.querySelector('.nw-skel') || {}).getAttribute && document.querySelector('.nw-skel').getAttribute('role') }));
  ok(nw.skel >= 5 && !nw.spin && nw.role === 'status', 'News lädt: Platzhalter-Zeilen statt Kreisel · ' + JSON.stringify(nw));
  /* Englisch */
  await p.evaluate(async () => { Store.setLanguage('en'); I18N.setLang('en'); await new Promise(r => setTimeout(r, 900)); location.hash = '#/settings/barrierefreiheit'; }); await p.waitForTimeout(800);
  const en = await p.evaluate(() => document.querySelector('.set-body').innerText);
  ok(/Accessibility/.test(en) && /partially meets WCAG 2\.2 AA/.test(en) && /Go to contact form/.test(en), 'Englisch: Erklärung übersetzt');
  await p.evaluate(async () => { Store.setLanguage('de'); I18N.setLang('de'); await new Promise(r => setTimeout(r, 500)); });
  ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
  console.log(`${pass}/${pass + fail} bestanden`); await b.close(); process.exit(fail ? 1 : 0); })();
