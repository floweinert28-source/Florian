/* Sprachwechsel stellt die Währung mit um; Währungswechsel ändert die Sprache nicht.
   Läuft mit de-default.js (Start: Deutsch, Euro, Beispieldaten). */
const { chromium } = require('playwright');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log('PASS ' + m); } else { fail++; console.log('FAIL ' + m); } };
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///home/user/Florian/web/app.html#/settings/sprache', { waitUntil: 'load' }); await p.waitForTimeout(800);
  const state = () => p.evaluate(() => ({ lang: document.documentElement.dataset.lang, cur: Store.settings.currency, main: Store.data.accounts.find(a => a.id === 'main').currency, money: UI.fmt.cur(1234.5).replace(/ /g, ' '), toast: [...document.querySelectorAll('.toast')].map(t => t.textContent.trim()).pop() || '' }));
  let s = await state(); ok(s.lang === 'de' && s.cur === 'EUR', 'Start: Deutsch und Euro');
  ok(await p.evaluate(() => [...document.querySelectorAll('.lang-card')].map(c => c.dataset.value + ':' + c.querySelector('.lang-cur').textContent).join(' ')) === 'de:EUR en:USD es:EUR zh:CNY hi:INR pt:BRL', 'Karten zeigen die Währung je Sprache');
  /* zweites Konto mit eigener Währung: bleibt bei allen Wechseln */
  await p.evaluate(() => { Store.data.accounts.push({ id: 'gbp', name: 'London', size: 10000, currency: 'GBP' }); Store.save(); });
  const propBefore = await p.evaluate(() => Store.propAccounts().map(a => a.currency).join(','));
  const click = async code => { await p.evaluate(() => { location.hash = '#/settings/sprache'; }); await p.waitForTimeout(350); await p.click(`.lang-card[data-value=${code}]`); await p.waitForTimeout(700); return state(); };
  const expect = { en: ['USD', '$1,234.50', 'Currency: USD'], zh: ['CNY', '¥1,234.50', '货币：CNY'], hi: ['INR', '₹1,234.50', 'मुद्रा: INR'], pt: ['BRL', 'R$ 1.234,50', 'Moeda: BRL'], es: ['EUR', '1234,50 €', 'Moneda: EUR'], de: ['EUR', '1.234,50 €', ''] };
  for (const code of ['en', 'zh', 'hi', 'pt', 'es', 'de']) {
    s = await click(code); const [cur, money, toast] = expect[code];
    ok(s.lang === code && s.cur === cur && s.main === cur && s.money === money, `${code}: Währung ${s.cur}, Hauptkonto ${s.main}, Betrag ${s.money}`);
    if (toast) ok(s.toast.startsWith(toast), `${code}: Hinweis „${s.toast}“`);
  }
  ok(await p.evaluate(() => Store.data.accounts.find(a => a.id === 'gbp').currency === 'GBP'), 'Konto mit eigener Währung (GBP) bleibt unverändert');
  ok(await p.evaluate(() => Store.propAccounts().map(a => a.currency).join(',')) === propBefore, 'Prop-Konten behalten ihre Währung (' + propBefore + ')');
  /* es → de: beide Euro, keine Meldung */
  s = await click('es'); s = await click('de'); ok(s.cur === 'EUR' && !/Währung:/.test(s.toast), 'Spanisch → Deutsch: Euro bleibt, keine Meldung');
  /* Währung unter Profil ändern: Sprache bleibt */
  await p.evaluate(() => { location.hash = '#/settings/profil'; }); await p.waitForTimeout(600);
  await p.selectOption('#pf-cur', 'INR'); await p.evaluate(() => document.querySelector('#pf-cur').closest('form').requestSubmit()); await p.waitForTimeout(500);
  s = await state(); ok(s.lang === 'de' && s.cur === 'INR' && /₹/.test(s.money), 'Währung auf Rupie geändert, Sprache bleibt Deutsch (' + s.money + ')');
  /* aktive Sprache erneut anklicken: eigene Währungswahl bleibt */
  s = await click('de'); ok(s.lang === 'de' && s.cur === 'INR', 'Aktive Sprache erneut gewählt: Rupie bleibt');
  /* gespeichert */
  await p.waitForTimeout(300); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(700);
  s = await state(); ok(s.lang === 'de' && s.cur === 'INR', 'Nach Neuladen: Deutsch und Rupie');
  s = await click('en'); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(800); s = await state();
  ok(s.lang === 'en' && s.cur === 'USD' && s.money === '$1,234.50', 'Wechsel auf Englisch gespeichert: Dollar nach Neuladen');
  await p.screenshot({ path: 'langshots/sprache-waehrung.png' });
  ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
  console.log(`${pass}/${pass + fail} bestanden`); await b.close(); process.exit(fail ? 1 : 0);
})();
