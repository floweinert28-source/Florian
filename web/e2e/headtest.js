const { chromium } = require('playwright');
const base = 'file:///home/user/Florian/web/app.html';
let pass = 0, fail = 0; const ok = (c, n) => { if (c) pass++; else fail++; console.log(`${c ? 'PASS' : 'FAIL'} ${n}`); };
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 }); p.on('pageerror', e => errs.push(e.message)); try { await require('./localfonts.js')(p); } catch (e) {}
  await p.goto(base, { waitUntil: 'load' }); await p.evaluate(() => { Store.installSample(); Store.saveNow(); });
  await p.goto(base + '#/dashboard', { waitUntil: 'load' }); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(900);
  const inView = sel => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); const sb = document.querySelector('.sidebar').getBoundingClientRect(); return { l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom), w: Math.round(r.width), vw: innerWidth, sb: Math.round(sb.right), fits: r.left >= sb.right && r.right <= innerWidth && r.top >= 0 }; }, sel);
  /* Kopfzeile Desktop */
  const top = await p.evaluate(() => { const q = s => document.querySelector(s); const a = q('.topbar .avatar').getBoundingClientRect(); const items = ['[data-pop=range]', '[data-pop=account]', '[data-action="dash-f-open"]'].map(s => { const e = q('.topbar .tb-tools ' + s); if (!e) return null; const r = e.getBoundingClientRect(); return { mid: Math.round((r.top + r.bottom) / 2), right: Math.round(r.right), left: Math.round(r.left) }; }); return { amid: Math.round((a.top + a.bottom) / 2), aleft: Math.round(a.left), items, inHead: !!q('.dash-head .dh-context'), tplIcon: q('.dash-head [data-pop=tpl]').classList.contains('icon-only'), tplTxt: q('.dash-head [data-pop=tpl]').textContent.trim(), tplVisibleText: [...q('.dash-head [data-pop=tpl]').querySelectorAll('span')].every(s => s.offsetWidth <= 1), order: [...q('.dash-head .dh-tools').querySelectorAll('button, a')].filter(e => !e.closest('.popover')).map(e => e.dataset.pop || e.dataset.action || e.className).join(',') }; });
  ok(top.items.every(i => i && Math.abs(i.mid - top.amid) < 3 && i.right < top.aleft) && !top.inHead, 'Desktop: Zeitraum, Konto, Filter oben rechts auf Avatar-Höhe, nicht mehr in der Kopfreihe · ' + JSON.stringify(top.items));
  ok(top.items[0].right < top.items[1].left && top.items[1].right < top.items[2].left, 'Reihenfolge Zeitraum · Konto · Filter');
  ok(top.tplIcon && top.tplVisibleText && top.tplTxt.includes('Standard'), 'Vorlage nur als Symbol (Name nur für Screenreader) · ' + top.tplTxt);
  ok(top.order === 'tpl,cert,new-trade', 'Kopfreihe rechts: Vorlage, Zertifikat, Trade loggen · ' + top.order);
  await p.screenshot({ path: 'head_desktop.png', clip: { x: 0, y: 0, width: 1440, height: 220 } });
  /* Menüs in der Titelzeile bleiben im Bild */
  await p.click('.topbar [data-pop=range]'); await p.waitForTimeout(350); const rp = await inView('#pop-range.open');
  ok(rp && rp.fits && rp.w > 400, 'Zeitraum-Menü offen und im Bild (rechts der Seitenleiste) · ' + JSON.stringify(rp));
  await p.screenshot({ path: 'head_range.png', clip: { x: 0, y: 0, width: 1440, height: 560 } });
  await p.keyboard.press('Escape'); await p.waitForTimeout(250);
  await p.click('.topbar [data-pop=account]'); await p.waitForTimeout(350); const ap = await inView('#pop-account.open');
  ok(ap && ap.fits, 'Konto-Menü offen und im Bild · ' + JSON.stringify(ap)); await p.keyboard.press('Escape'); await p.waitForTimeout(250);
  await p.click('.topbar [data-action="dash-f-open"]'); await p.waitForTimeout(400); const fp = await p.evaluate(() => { const e = document.querySelector('#fd-layer .fd-panel.fd-pop'); if (!e) return null; const r = e.getBoundingClientRect(), b = document.querySelector('[data-action="dash-f-open"]').getBoundingClientRect(); return { fits: r.right <= innerWidth && r.top >= b.bottom, under: Math.abs(r.top - b.bottom) < 14, right: Math.abs(r.right - b.right) <= 1 }; });
  ok(fp && fp.fits && fp.under && fp.right, 'Filter-Fenster rechtsbündig unter dem Filter-Knopf · ' + JSON.stringify(fp)); await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  await p.click('.dash-head [data-pop=tpl]'); await p.waitForTimeout(350); const tp = await inView('#pop-tpl.open');
  ok(tp && tp.fits, 'Vorlagen-Menü unter dem Symbol, im Bild · ' + JSON.stringify(tp)); await p.screenshot({ path: 'head_tpl.png', clip: { x: 700, y: 0, width: 740, height: 520 } }); await p.keyboard.press('Escape'); await p.waitForTimeout(250);
  /* schmaler Desktop: Konto und Filter nur als Symbol, Menü im Bild */
  await p.setViewportSize({ width: 1000, height: 900 }); await p.waitForTimeout(400);
  const nar = await p.evaluate(() => ({ acc: document.querySelector('.tb-tools [data-pop=account] > span').offsetWidth, fil: document.querySelector('.tb-tools [data-action="dash-f-open"] > span').offsetWidth, inTop: !!document.querySelector('#tb-tools .dh-context'), wrap: document.querySelector('.topbar').offsetHeight }));
  ok(nar.acc === 0 && nar.fil === 0 && nar.inTop && nar.wrap <= 80, '1000px: Konto und Filter nur Symbol, Titelzeile einzeilig · ' + JSON.stringify(nar));
  await p.click('.topbar [data-pop=range]'); await p.waitForTimeout(350); const rp2 = await inView('#pop-range.open'); ok(rp2 && rp2.fits, '1000px: Zeitraum-Menü im Bild · ' + JSON.stringify(rp2)); await p.screenshot({ path: 'head_1000.png', clip: { x: 0, y: 0, width: 1000, height: 520 } }); await p.keyboard.press('Escape'); await p.waitForTimeout(250);
  /* Größenwechsel: unter 961px wandert der Block zurück in die Kopfreihe, und wieder hoch */
  await p.setViewportSize({ width: 800, height: 900 }); await p.waitForTimeout(400);
  ok(await p.evaluate(() => !!document.querySelector('.dash-head .dh-context') && !document.querySelector('#tb-tools .dh-context')), '800px: Zeitraum/Konto/Filter wieder in der Kopfreihe');
  await p.setViewportSize({ width: 1440, height: 1000 }); await p.waitForTimeout(400);
  ok(await p.evaluate(() => !document.querySelector('.dash-head .dh-context') && !!document.querySelector('#tb-tools .dh-context')), 'zurück auf 1440px: wieder oben rechts');
  /* Score-Skala und Diagramme laufen nur beim Seitenwechsel */
  const anim1 = await p.evaluate(() => ({ enter: document.querySelector('#content').classList.contains('enter'), score: getComputedStyle(document.querySelector('.score-scale')).animationName }));
  ok(anim1.enter && anim1.score === 'score-run', 'Seite geöffnet: Score-Skala läuft · ' + JSON.stringify(anim1));
  await p.click('[data-action="recent-tab"][data-value="open"]'); await p.waitForTimeout(300);
  const anim2 = await p.evaluate(() => ({ enter: document.querySelector('#content').classList.contains('enter'), score: getComputedStyle(document.querySelector('.score-scale')).animationName, tab: document.querySelector('[data-action="recent-tab"][data-value="open"]').getAttribute('aria-pressed'), charts: [...document.querySelectorAll('.chart svg.enter')].length }));
  ok(!anim2.enter && anim2.score === 'none' && anim2.tab === 'true' && anim2.charts === 0, 'Reiter „Offene Positionen“: kein Neustart von Score und Diagrammen · ' + JSON.stringify(anim2));
  await p.goto(base + '#/stats'); await p.waitForTimeout(600); await p.goto(base + '#/dashboard'); await p.waitForTimeout(500);
  ok(await p.evaluate(() => document.querySelector('#content').classList.contains('enter') && getComputedStyle(document.querySelector('.score-scale')).animationName === 'score-run'), 'Dashboard neu geöffnet: Score-Skala läuft wieder');
  /* Balken wachsen von der Nulllinie */
  /* Die Balken-Diagramme der Übersicht zeichnen sich nach dem ersten Bild: auf den ersten Balken warten statt fester Zeit */
  await p.goto(base + '#/stats'); await p.waitForSelector('.chart svg.enter rect.br', { timeout: 4000 }).catch(() => {});
  const bars = await p.evaluate(() => { const r = [...document.querySelectorAll('.chart svg.enter rect.br')]; if (!r.length) return null; const cs = r.map(e => getComputedStyle(e)); const up = r.find(e => !e.classList.contains('dn')), dn = r.find(e => e.classList.contains('dn')); return { n: r.length, anim: cs[0].animationName, box: cs[0].transformBox, upO: up && getComputedStyle(up).transformOrigin, dnO: dn && getComputedStyle(dn).transformOrigin, delays: r.slice(0, 3).map(e => e.style.getPropertyValue('--bd')), early: cs.some(c => c.transform !== 'none') }; });
  ok(bars && bars.anim === 'ch-grow' && bars.box === 'fill-box' && /100%|px$/.test(bars.upO || '') && bars.delays[1] !== bars.delays[0], 'Statistik: Balken wachsen (ch-grow, fill-box, gestaffelt) · ' + JSON.stringify(bars));
  ok(bars && bars.dnO && /\s0px$/.test(bars.dnO) && /[\d.]+px [\d.]+px$/.test(bars.upO) && +bars.upO.split(' ')[1].replace('px', '') > 0, 'Gewinn-Balken wachsen von unten, Verlust-Balken von oben · ' + bars.upO + ' / ' + bars.dnO);
  await p.waitForTimeout(1500);
  ok(await p.evaluate(() => [...document.querySelectorAll('.chart svg.enter rect.br')].every(e => { const t = getComputedStyle(e).transform; return t === 'none' || /matrix\(1, 0, 0, 1, 0, 0\)/.test(t); })), 'nach der Animation stehen alle Balken in voller Höhe');
  /* Fortschritt: Ringe nur beim Öffnen */
  await p.waitForTimeout(400); await p.goto(base + '#/progress'); await p.waitForTimeout(260);
  const ring1 = await p.evaluate(() => { const a = document.querySelector('.ring-arc .arc'); return a ? { tr: a.style.transition, off: a.style.strokeDashoffset, target: a.dataset.target } : null; });
  await p.waitForTimeout(600); await p.evaluate(() => App.rerender()); await p.waitForTimeout(60);
  const ring2 = await p.evaluate(() => { const a = document.querySelector('.ring-arc .arc'); return a ? { tr: a.style.transition, off: a.style.strokeDashoffset, target: a.dataset.target } : null; });
  ok(ring1 && ring1.tr === '' && ring2 && ring2.tr === 'none' && parseFloat(ring2.off) === parseFloat(ring2.target), 'Fortschritt: Ringe laufen beim Öffnen, stehen beim Neuaufbau sofort · ' + JSON.stringify({ ring1, ring2 }));
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
