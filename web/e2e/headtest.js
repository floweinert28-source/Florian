const { chromium } = require('playwright');
const base = 'file:///home/user/Florian/web/app.html';
let pass = 0, fail = 0; const ok = (c, n) => { if (c) pass++; else fail++; console.log(`${c ? 'PASS' : 'FAIL'} ${n}`); };
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 }); p.on('pageerror', e => errs.push(e.message)); try { await require('./localfonts.js')(p); } catch (e) {}
  await p.goto(base, { waitUntil: 'load' }); await p.evaluate(() => { Store.installSample(); Store.data.accounts.push({ id: 'acc2', name: 'Zweitkonto', size: 10000, currency: 'USD' }); /* zweites Konto: erst dann gibt es die Konto-Wahl */ Store.saveNow(); });
  await p.goto(base + '#/dashboard', { waitUntil: 'load' }); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(900);
  const inView = sel => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); const sb = document.querySelector('.sidebar').getBoundingClientRect(); return { l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom), w: Math.round(r.width), vw: innerWidth, sb: Math.round(sb.right), fits: r.left >= sb.right && r.right <= innerWidth && r.top >= 0 }; }, sel);
  /* Kopfzeile Desktop */
  const top = await p.evaluate(() => { const q = s => document.querySelector(s); const box = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { mid: Math.round((r.top + r.bottom) / 2), right: Math.round(r.right), left: Math.round(r.left), w: Math.round(r.width) }; }; const items = ['[data-pop=range]', '[data-pop=account]'].map(s => box(q('.dash-head .dh-context ' + s))); return { items, cert: box(q('.dash-head [data-pop=cert]')), filter: box(q('.dash-head .dh-tools [data-action="dash-f-open"]')), filterIcon: q('[data-action="dash-f-open"]').classList.contains('icon-only'), topEmpty: !q('#tb-tools').children.length, tplIcon: q('.dash-head [data-pop=tpl]').classList.contains('icon-only'), tplTxt: q('.dash-head [data-pop=tpl]').textContent.trim(), tplVisibleText: [...q('.dash-head [data-pop=tpl]').querySelectorAll('span')].every(s => s.offsetWidth <= 1), order: [...q('.dash-head .dh-tools').querySelectorAll('button, a')].filter(e => !e.closest('.popover')).map(e => e.dataset.pop || e.dataset.action || e.className).join(',') }; });
  ok(top.items.every(i => i && Math.abs(i.mid - top.cert.mid) < 3) && top.items[1].right < top.cert.left && top.topEmpty, 'Desktop: Zeitraum und Konto links in der Kopfreihe auf Höhe des Zertifikats, Titelzeile ohne Kontext · ' + JSON.stringify(top.items));
  ok(top.items[0].right < top.items[1].left, 'Reihenfolge Zeitraum · Konto');
  ok(top.filter && top.filterIcon && top.filter.w <= 44 && Math.abs(top.filter.mid - top.cert.mid) < 3 && top.filter.left > top.cert.right, 'Filter als kleines Symbol rechts neben dem Zertifikat · ' + JSON.stringify(top.filter));
  ok(top.tplIcon && top.tplVisibleText && top.tplTxt.includes('Standard'), 'Vorlage nur als Symbol (Name nur für Screenreader) · ' + top.tplTxt);
  ok(top.order === 'tpl,cert,dash-f-open,new-trade', 'Kopfreihe rechts: Vorlage, Zertifikat, Filter, Trade loggen · ' + top.order);
  await p.screenshot({ path: 'head_desktop.png', clip: { x: 0, y: 0, width: 1440, height: 220 } });
  /* Menüs der Kopfreihe bleiben im Bild */
  await p.click('.dash-head [data-pop=range]'); await p.waitForTimeout(350); const rp = await inView('#pop-range.open');
  ok(rp && rp.fits && rp.w > 400, 'Zeitraum-Menü offen und im Bild (rechts der Seitenleiste) · ' + JSON.stringify(rp));
  await p.screenshot({ path: 'head_range.png', clip: { x: 0, y: 0, width: 1440, height: 560 } });
  await p.keyboard.press('Escape'); await p.waitForTimeout(250);
  await p.click('.dash-head [data-pop=account]'); await p.waitForTimeout(350); const ap = await inView('#pop-account.open');
  ok(ap && ap.fits, 'Konto-Menü offen und im Bild · ' + JSON.stringify(ap)); await p.keyboard.press('Escape'); await p.waitForTimeout(250);
  await p.click('.dash-head [data-action="dash-f-open"]'); await p.waitForTimeout(400); const fp = await p.evaluate(() => { const e = document.querySelector('#fd-layer .fd-panel.fd-pop'); if (!e) return null; const r = e.getBoundingClientRect(), b = document.querySelector('[data-action="dash-f-open"]').getBoundingClientRect(); return { fits: r.right <= innerWidth && r.top >= b.bottom, under: Math.abs(r.top - b.bottom) < 14, right: Math.abs(r.right - b.right) <= 1 }; });
  ok(fp && fp.fits && fp.under && fp.right, 'Filter-Fenster rechtsbündig unter dem Filter-Symbol · ' + JSON.stringify(fp)); await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  await p.click('.dash-head [data-pop=tpl]'); await p.waitForTimeout(350); const tp = await inView('#pop-tpl.open');
  ok(tp && tp.fits, 'Vorlagen-Menü unter dem Symbol, im Bild · ' + JSON.stringify(tp)); await p.screenshot({ path: 'head_tpl.png', clip: { x: 700, y: 0, width: 740, height: 520 } }); await p.keyboard.press('Escape'); await p.waitForTimeout(250);
  /* schmaler Desktop und Größenwechsel: der Kontext bleibt in der Kopfreihe, nichts läuft über */
  for (const w of [1000, 800, 1440]) { await p.setViewportSize({ width: w, height: 900 }); await p.waitForTimeout(400);
    const nar = await p.evaluate(() => ({ inHead: !!document.querySelector('.dash-head .dh-context [data-pop=range]'), topEmpty: !document.querySelector('#tb-tools').children.length, over: document.documentElement.scrollWidth <= innerWidth + 1, wrap: document.querySelector('.topbar').offsetHeight }));
    ok(nar.inHead && nar.topEmpty && nar.over && nar.wrap <= 80, w + 'px: Zeitraum und Konto in der Kopfreihe, kein Querscrollen · ' + JSON.stringify(nar)); }
  await p.click('.dash-head [data-pop=range]'); await p.waitForTimeout(350); const rp2 = await inView('#pop-range.open'); ok(rp2 && rp2.fits, '1440px: Zeitraum-Menü im Bild · ' + JSON.stringify(rp2)); await p.keyboard.press('Escape'); await p.waitForTimeout(250);
  /* Score-Skala und Diagramme laufen nur beim Seitenwechsel */
  const anim1 = await p.evaluate(() => ({ enter: document.querySelector('#content').classList.contains('enter'), score: getComputedStyle(document.querySelector('.score-scale')).animationName }));
  ok(anim1.enter && anim1.score === 'score-run', 'Seite geöffnet: Score-Skala läuft · ' + JSON.stringify(anim1));
  await p.click('.w [data-action="cal-prev"]'); await p.waitForTimeout(300); /* Neuaufbau ohne Seitenwechsel (Reiter „Offene Positionen“ gibt es nur bei offenen Positionen) */
  const anim2 = await p.evaluate(() => ({ enter: document.querySelector('#content').classList.contains('enter'), score: getComputedStyle(document.querySelector('.score-scale')).animationName, today: !!document.querySelector('[data-action="cal-today"]'), charts: [...document.querySelectorAll('.chart svg.enter')].length }));
  ok(!anim2.enter && anim2.score === 'none' && anim2.today && anim2.charts === 0, 'Kalender: voriger Monat zeigt „Heute“, kein Neustart von Score und Diagrammen · ' + JSON.stringify(anim2));
  await p.goto(base + '#/stats'); await p.waitForTimeout(600); await p.goto(base + '#/dashboard'); await p.waitForTimeout(500);
  ok(await p.evaluate(() => document.querySelector('#content').classList.contains('enter') && getComputedStyle(document.querySelector('.score-scale')).animationName === 'score-run'), 'Dashboard neu geöffnet: Score-Skala läuft wieder');
  /* Balken wachsen von der Nulllinie */
  /* Balken-Diagramm „Netto-P&L pro Tag“ (nicht mehr im Standard-Dashboard, darum hier eingefügt): beim Öffnen des Dashboards wachsen die
     Balken; auf den ersten Balken warten statt fester Zeit. Vorher prüfte der Test über einen Seitenwechsel per Hash versehentlich dasselbe */
  await p.evaluate(() => { const l = Store.activeDashboard().layout; if (!l.unten.some(w => w.typ === 'pnl_pro_tag')) { l.unten.unshift({ typ: 'pnl_pro_tag', groesse: 'klein' }); Store.saveNow(); } location.hash = '#/stats'; }); await p.waitForTimeout(500);
  await p.evaluate(() => { location.hash = '#/dashboard'; }); await p.waitForSelector('.w[data-typ="pnl_pro_tag"] .chart svg.enter rect.br', { timeout: 4000 }).catch(() => {});
  const bars = await p.evaluate(() => { const r = [...document.querySelectorAll('.w[data-typ="pnl_pro_tag"] .chart svg.enter rect.br')]; if (!r.length) return null; const cs = r.map(e => getComputedStyle(e)); const up = r.find(e => !e.classList.contains('dn')), dn = r.find(e => e.classList.contains('dn')); return { n: r.length, anim: cs[0].animationName, box: cs[0].transformBox, upO: up && getComputedStyle(up).transformOrigin, dnO: dn && getComputedStyle(dn).transformOrigin, delays: r.slice(0, 3).map(e => e.style.getPropertyValue('--bd')), early: cs.some(c => c.transform !== 'none') }; });
  ok(bars && bars.anim === 'ch-grow' && bars.box === 'fill-box' && /100%|px$/.test(bars.upO || '') && bars.delays[1] !== bars.delays[0], 'Netto-P&L pro Tag: Balken wachsen (ch-grow, fill-box, gestaffelt) · ' + JSON.stringify(bars));
  ok(bars && bars.dnO && /\s0px$/.test(bars.dnO) && /[\d.]+px [\d.]+px$/.test(bars.upO) && +bars.upO.split(' ')[1].replace('px', '') > 0, 'Gewinn-Balken wachsen von unten, Verlust-Balken von oben · ' + bars.upO + ' / ' + bars.dnO);
  await p.waitForTimeout(1500);
  ok(await p.evaluate(() => [...document.querySelectorAll('.chart svg.enter rect.br')].every(e => { const t = getComputedStyle(e).transform; return t === 'none' || /matrix\(1, 0, 0, 1, 0, 0\)/.test(t); })), 'nach der Animation stehen alle Balken in voller Höhe');
  /* Fortschritt: keine Ringe, schlanke Leisten */
  await p.waitForTimeout(400); await p.goto(base + '#/progress'); await p.waitForTimeout(260);
  const pgBars = await p.evaluate(() => ({ ring: !!document.querySelector('.ring-arc'), seg: document.querySelectorAll('.pg-seg i').length, segOn: document.querySelectorAll('.pg-seg i.on').length, bar: !!document.querySelector('.pg-bar em'), flame: !!document.querySelector('.dstreak .big-stat .dstreak-flame') }));
  ok(!pgBars.ring && pgBars.seg === 5 && pgBars.bar && pgBars.flame, 'Fortschritt: keine Ringe; Heute als 5-teilige Leiste, Regeln als Balken, Flamme neben der Serie · ' + JSON.stringify(pgBars));
  /* Schriftstärke aktiver Einträge */
  const fw = await p.evaluate(() => ({ nav: getComputedStyle(document.querySelector('.nav a.active')).fontWeight, navOther: getComputedStyle(document.querySelector('.nav a:not(.active)')).fontWeight }));
  await p.goto(base + '#/settings/profil'); await p.waitForTimeout(300); fw.set = await p.evaluate(() => getComputedStyle(document.querySelector('.set-nav a.active')).fontWeight); fw.setOther = await p.evaluate(() => getComputedStyle(document.querySelector('.set-nav a:not(.active)')).fontWeight);
  await p.goto(base + '#/notebook'); await p.waitForTimeout(300); fw.folder = await p.evaluate(() => { const f = document.querySelector('.nb .folder.active'); return f ? getComputedStyle(f).fontWeight : 'n/a'; });
  fw.seg = await p.evaluate(() => { const s = document.querySelector('.seg button[aria-pressed="true"]'); return s ? getComputedStyle(s).fontWeight : 'n/a'; });
  ok(fw.nav === fw.navOther && fw.nav === '500' && fw.set === fw.setOther && fw.set === '500' && (fw.folder === 'n/a' || fw.folder === '500'), 'Aktive Einträge (Seitenleiste, Einstellungen, Ordner) in normaler Stärke 500 · ' + JSON.stringify(fw));
  /* Handy */
  const m = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); m.on('pageerror', e => errs.push(e.message));
  await m.goto(base + '#/dashboard', { waitUntil: 'load' }); await m.waitForTimeout(800);
  const mob = await m.evaluate(() => ({ inHead: !!document.querySelector('.dash-head .dh-context'), inTop: !!document.querySelector('#tb-tools .dh-context'), tpl: document.querySelector('.dash-head [data-pop=tpl]').getBoundingClientRect().width, cert: document.querySelector('.dash-head [data-pop=cert]').getBoundingClientRect().width, over: document.documentElement.scrollWidth <= innerWidth + 1, topH: document.querySelector('.topbar').offsetHeight }));
  ok(mob.inHead && !mob.inTop && mob.tpl <= 44 && mob.cert <= 44 && mob.over && mob.topH <= 80, 'Handy: Kontext in der Kopfreihe, Vorlage/Zertifikat als Symbole, kein Querscrollen · ' + JSON.stringify(mob));
  await m.screenshot({ path: 'head_mobile.png', clip: { x: 0, y: 0, width: 390, height: 300 } });
  ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
  console.log(`${pass}/${pass + fail} bestanden`); await b.close(); process.exit(fail ? 1 : 0); })();
