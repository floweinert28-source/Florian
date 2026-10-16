/* Ansicht Simple / Advanced (Einstellungen → Design → Ansicht): Schalter, Seitenleiste mit „Mehr“, Leiste mit „Mehr“-Menü,
   Dashboard-Kopf, größere Zahlen, Statistik-Reiter, Trades-Spalten, Trade-Fenster mit „Mehr Optionen“, zurück zu Advanced */
const { chromium } = require('playwright');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log('PASS ' + m); } else { fail++; console.log('FAIL ' + m); } };
const BASE = 'file:///home/user/Florian/web/app.html';
(async () => { const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); p.on('pageerror', e => errs.push(e.message)); try { await require('./localfonts.js')(p); } catch (e) {}
  await p.goto(BASE + '#/settings/design', { waitUntil: 'load' }); await p.waitForTimeout(900);
  /* Ausgangslage dieser Suite: Advanced (Vorlauf de-default.js) */
  ok(await p.evaluate(() => document.documentElement.dataset.mode === 'advanced' && Store.settings.uiMode === 'advanced'), 'Start in Advanced');
  const cards = await p.evaluate(() => [...document.querySelectorAll('.mode-card')].map(c => [c.dataset.value, c.getAttribute('aria-pressed')]));
  ok(JSON.stringify(cards) === '[["simple","false"],["advanced","true"]]', 'Einstellungen → Design: zwei Karten, Advanced gewählt · ' + JSON.stringify(cards));
  await p.click('.mode-card[data-value="simple"]'); await p.waitForTimeout(600);
  ok(await p.evaluate(() => document.documentElement.dataset.mode === 'simple' && Store.settings.uiMode === 'simple' && document.querySelector('.mode-card[data-value="simple"]').getAttribute('aria-pressed') === 'true'), 'Klick auf Simple: Ansicht umgestellt und gespeichert');
  /* Seitenleiste: Kern-Seiten, Rest unter „Mehr“ */
  const nav = await p.evaluate(() => ({ core: [...document.querySelectorAll('#sidebar nav.nav a')].map(a => a.getAttribute('href')), titles: document.querySelectorAll('#sidebar .nav-title').length, more: [...document.querySelectorAll('#sidebar details.nav-more a')].map(a => a.getAttribute('href')), open: document.querySelector('#sidebar details.nav-more').open }));
  ok(nav.core.join() === '#/dashboard,#/trades,#/day,#/stats,#/notebook' && !nav.titles, 'Seitenleiste: Dashboard, TradeLog, Tagesansicht, Statistiken, Notebook ohne Gruppentitel · ' + nav.core.join());
  ok(nav.more.includes('#/progress') && nav.more.includes('#/shadow') && nav.more.includes('#/ruhepunkt') && nav.more.includes('#/coupons') && !nav.open, '„Mehr“ zu, darin Fortschritt, Schatten-Ich, Ruhepunkt, Coupon-Codes · ' + nav.more.join());
  await p.evaluate(() => { location.hash = '#/progress'; }); await p.waitForTimeout(700);
  ok(await p.evaluate(() => document.querySelector('#sidebar details.nav-more').open && !!document.querySelector('#sidebar details.nav-more a.active[href="#/progress"]')), 'Seite aus „Mehr“ offen: „Mehr“ ist aufgeklappt, Eintrag aktiv');
  await p.evaluate(() => { location.hash = '#/dashboard'; }); await p.waitForTimeout(700);
  ok(await p.evaluate(() => document.querySelector('#sidebar details.nav-more').open), '„Mehr“ bleibt beim Wechsel auf eine Kern-Seite offen');
  await p.click('#sidebar details.nav-more > summary'); await p.waitForTimeout(200); await p.evaluate(() => App.rerender()); await p.waitForTimeout(300);
  ok(await p.evaluate(() => !document.querySelector('#sidebar details.nav-more').open), 'Zugeklappt bleibt zu (auch nach Neuaufbau)');
  /* Leiste ganz links: Prop, News, Backtesting, Affiliate im Menü „Mehr“ */
  const rail = await p.evaluate(() => [...document.querySelectorAll('#rail .rail-item')].map(a => a.dataset.rail || (a.dataset.pop ? 'mehr' : '?')));
  ok(rail.join() === 'journal,mentor,mehr,coach,contact', 'Leiste: Journal, Mentor, Mehr · Coach, Kontakt · ' + rail.join());
  await p.click('[data-pop="railmore"]'); await p.waitForTimeout(400);
  const rm = await p.evaluate(() => { const pop = document.getElementById('pop-railmore'); const r = pop.getBoundingClientRect(), br = document.querySelector('[data-pop="railmore"]').getBoundingClientRect(); return { open: pop.classList.contains('open'), links: [...pop.querySelectorAll('a')].map(a => a.getAttribute('href')), left: r.left, bright: br.right, top: r.top, btop: br.top, bottom: r.bottom, vh: innerHeight }; });
  ok(rm.open && rm.links.join() === '#/prop,#/news,#/backtesting,#/affiliate', 'Menü „Mehr“ offen mit Prop Firms, News, Backtesting, Affiliate · ' + rm.links.join());
  ok(rm.left >= rm.bright && Math.abs(rm.top - rm.btop) < 2 && rm.bottom <= rm.vh, 'Menü sitzt rechts neben dem Knopf, ganz im Fenster · ' + JSON.stringify(rm));
  await p.click('#pop-railmore a[href="#/news"]'); await p.waitForTimeout(800);
  ok(await p.evaluate(() => App.state.route === 'news' && document.querySelector('[data-pop="railmore"]').classList.contains('active') && !document.getElementById('pop-railmore').classList.contains('open')), 'Klick auf News: Seite offen, Menü zu, „Mehr“ markiert');
  await p.keyboard.press('Escape');
  /* Dashboard: Kopf nur mit „Mehr“, größere Zahlen, keine Nebeninfos */
  await p.evaluate(() => { location.hash = '#/dashboard'; }); await p.waitForTimeout(900);
  const dh = await p.evaluate(() => { const v = document.querySelector('.dash-top .tile .val'); const vis = s => [...document.querySelectorAll(s)].some(e => e.getClientRects().length); return { tools: [...document.querySelectorAll('.dh-tools [data-pop], .dh-tools [data-action]')].filter(e => !e.closest('.popover')).map(e => e.dataset.pop || e.dataset.action), fs: v && parseFloat(getComputedStyle(v).fontSize), foot: vis('.dash-top .tile .foot'), n: vis('.dash-top .tile .head .n'), info: vis('span.info'), gauge: vis('.dash-top .tile .gauge') }; });
  ok(dh.tools.includes('dmore') && !dh.tools.includes('tpl') && !dh.tools.includes('cert') && !dh.tools.includes('dash-f-open'), 'Dashboard-Kopf: nur „Mehr“ statt Vorlage, Zertifikat, Filter · ' + dh.tools.join());
  ok(dh.fs >= 31 && dh.fs <= 32 && !dh.foot && !dh.n && !dh.info && !dh.gauge, 'Kacheln: Zahl rund 32 px, ohne Fußzeile, Zähler, (i) und Mini-Diagramm · ' + JSON.stringify(dh));
  await p.click('[data-pop="dmore"]'); await p.waitForTimeout(400);
  const dm = await p.evaluate(() => [...document.querySelectorAll('#pop-dmore [data-action]')].map(e => e.dataset.action));
  ok(dm[0] === 'dash-f-open' && dm.includes('cert-open') && dm.includes('dash-tpl-select') && dm.includes('dash-tpl-edit'), 'Menü „Mehr“: Filter, Zertifikat, Vorlage, Dashboard anpassen · ' + [...new Set(dm)].join());
  await p.click('#pop-dmore [data-action="dash-f-open"]'); await p.waitForTimeout(500);
  const fp = await p.evaluate(() => { const pop = document.getElementById('fd-pop'); const btn = document.querySelector('[data-pop="dmore"]').getBoundingClientRect(); if (!pop) return null; const r = pop.getBoundingClientRect(); return { top: Math.round(r.top), bb: Math.round(btn.bottom), right: Math.round(r.right), br: Math.round(btn.right), menu: document.getElementById('pop-dmore').classList.contains('open') }; });
  ok(fp && fp.top > fp.bb && fp.top - fp.bb < 20 && Math.abs(fp.right - fp.br) < 4 && !fp.menu, 'Filter aus „Mehr“: Fenster rechtsbündig unter dem Knopf, Menü zu · ' + JSON.stringify(fp));
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  /* Statistiken: vier Reiter; direkt verlinkter weiterer Reiter bleibt sichtbar */
  await p.evaluate(() => { location.hash = '#/stats'; }); await p.waitForTimeout(800);
  const tabs = () => p.evaluate(() => [...document.querySelectorAll('.tabs[data-subnav] a')].map(a => a.getAttribute('href').split('/').pop()));
  ok((await tabs()).join() === 'summary,days,setups,time', 'Statistiken: Übersicht, Tage, Setups, Zeit');
  await p.evaluate(() => { location.hash = '#/stats/mc'; }); await p.waitForTimeout(800);
  ok((await tabs()).join() === 'summary,days,setups,time,mc', 'Link auf Monte Carlo: Reiter kommt dazu, solange er offen ist');
  /* Trades: vier Spalten */
  await p.evaluate(() => { location.hash = '#/trades'; }); await p.waitForTimeout(800);
  const th = await p.evaluate(() => ({ th: [...document.querySelectorAll('.tbl thead th')].map(t => t.dataset.key), td: document.querySelectorAll('.tbl tbody tr:first-child td').length, slim: document.querySelector('.tbl').classList.contains('slim') }));
  ok(th.th.join() === 'openedAt,symbol,direction,pnl' && th.td === 4 && th.slim, 'TradeLog: Datum, Symbol, Richtung, P&L · ' + JSON.stringify(th));
  /* Trade-Fenster: Nebenfelder unter „Mehr Optionen“, Speichern übernimmt sie trotzdem */
  const before = await p.evaluate(() => Store.trades().length);
  await p.evaluate(() => { const o = new Date(Date.now() - 3600e3); App.openTradeEditor(null, { symbol: 'NQ', direction: 1, entryPrice: 20000, exitPrice: 20010, openedAt: o.toISOString(), closedAt: new Date().toISOString() }); }); await p.waitForTimeout(600);
  const tf = await p.evaluate(() => { const d = document.querySelector('.tf-more'); return { has: !!d, open: d && d.open, mult: !!(d && d.querySelector('#f-mult')), fees: !!(d && d.querySelector('[name="fees"]')), entry: !!document.querySelector('.tf-main > .tf-row3 #f-entry') }; });
  ok(tf.has && !tf.open && tf.mult && tf.fees && tf.entry, 'Trade-Fenster: Punktwert und Gebühren unter „Mehr Optionen“ (zu), Einstieg sichtbar · ' + JSON.stringify(tf));
  await p.evaluate(() => { document.getElementById('f-mult').value = '20'; }); await p.click('#trade-form button[type="submit"]'); await p.waitForTimeout(700);
  const saved = await p.evaluate(() => { const t = Store.trades().slice().sort((a, b) => String(b.openedAt).localeCompare(String(a.openedAt)))[0]; return { n: Store.trades().length, mult: t.multiplier, sym: t.symbol }; });
  ok(saved.n === before + 1 && saved.mult === 20 && saved.sym === 'NQ', 'Speichern im zugeklappten Bereich: Punktwert 20 übernommen · ' + JSON.stringify(saved));
  /* gespeichert über Neuladen */
  await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(900);
  ok(await p.evaluate(() => document.documentElement.dataset.mode === 'simple' && !!document.querySelector('#sidebar details.nav-more')), 'Nach Neuladen weiter Simple');
  /* Englisch */
  await p.evaluate(async () => { Store.setLanguage('en'); I18N.setLang('en'); await new Promise(r => setTimeout(r, 900)); App.render(); App.openTradeEditor(null); }); await p.waitForTimeout(700);
  const en = await p.evaluate(() => ({ more: document.querySelector('.tf-more > summary').textContent.trim(), nav: document.querySelector('#sidebar .nav-more > summary span').textContent.trim() }));
  ok(/^More options/.test(en.more) && /Point value/.test(en.more) && en.nav === 'More', 'Englisch: „More options · Point value …“, „More“ · ' + JSON.stringify(en));
  await p.keyboard.press('Escape'); await p.evaluate(async () => { Store.setLanguage('de'); I18N.setLang('de'); await new Promise(r => setTimeout(r, 600)); App.render(); }); await p.waitForTimeout(400);
  /* Handy: Tabelle passt ohne seitliches Scrollen */
  const m = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); m.on('pageerror', e => errs.push('Handy: ' + e.message)); try { await require('./localfonts.js')(m); } catch (e) {}
  await m.goto(BASE + '#/trades', { waitUntil: 'load' }); await m.waitForTimeout(900); await m.evaluate(() => { Store.setSetting('uiMode', 'simple'); Theme.apply(Store.settings); App.render(); }); await m.waitForTimeout(700);
  const mt = await m.evaluate(() => { const sc = document.querySelector('.tbl-scroll'); const v = document.querySelector('.tile.spark-tile .val'); return { sw: sc.scrollWidth, cw: sc.clientWidth, doc: document.documentElement.scrollWidth - innerWidth, val: v.scrollWidth <= v.clientWidth + 1 }; });
  ok(mt.sw <= mt.cw + 1 && mt.doc <= 0 && mt.val, 'Handy: Tabelle passt, Seite nicht breiter, Netto-P&L nicht abgeschnitten · ' + JSON.stringify(mt));
  await m.close();
  /* zurück zu Advanced: alles wie vorher */
  await p.evaluate(() => { location.hash = '#/settings/design'; }); await p.waitForTimeout(800); await p.click('.mode-card[data-value="advanced"]'); await p.waitForTimeout(600);
  await p.evaluate(() => { location.hash = '#/dashboard'; }); await p.waitForTimeout(900);
  const adv = await p.evaluate(() => ({ mode: document.documentElement.dataset.mode, titles: document.querySelectorAll('#sidebar .nav-title').length, more: !!document.querySelector('#sidebar details.nav-more'), rail: document.querySelectorAll('#rail .rail-item[data-rail]').length, railMore: !!document.querySelector('[data-pop="railmore"]') || !!document.getElementById('pop-railmore'), tpl: !!document.querySelector('.dh-tools [data-pop="tpl"]'), fs: getComputedStyle(document.querySelector('.dash-top .tile .val')).fontSize }));
  ok(adv.mode === 'advanced' && adv.titles >= 3 && !adv.more && adv.rail === 8 && !adv.railMore && adv.tpl && adv.fs === '24px', 'Advanced: Gruppentitel, alle 8 Bereiche, Vorlage-Knopf, Zahl 24 px (Schriftskala) · ' + JSON.stringify(adv));
  ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
  console.log(`${pass}/${pass + fail} bestanden`); await b.close(); process.exit(fail ? 1 : 0); })();
