/* Gesamt-Score wie am Anfang (Netz-Diagramm + Farbbalken) und Statistik → Zustand als drei ruhige Spalten mit Symbolen */
const { chromium } = require('playwright');
let pass = 0, fail = 0, document_text = ''; const ok = (c, m) => { if (c) { pass++; console.log('PASS ' + m); } else { fail++; console.log('FAIL ' + m); } };
(async () => { const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } }); p.on('pageerror', e => errs.push(e.message)); try { await require('./localfonts.js')(p); } catch (e) {}
  await p.goto('file:///home/user/Florian/web/app.html#/dashboard', { waitUntil: 'load' }); await p.waitForTimeout(400); /* Netz wächst beim Erscheinen (Animation läuft noch) */
  const sc = await p.evaluate(() => { const svg = document.querySelector('svg.radar-svg'); const card = svg && svg.closest('.card'); const vals = Core.traderScore(App.tradesInRange(), Store.accountSize());
    return { radar: !!svg, labels: svg ? [...svg.querySelectorAll('text')].map(t => t.textContent).join(',') : '', poly: svg ? svg.querySelectorAll('polygon.r2-grid').length + (svg.querySelector('.r2-cur') ? 1 : 0) : 0, big: card ? +card.querySelector('.score-big').textContent : null, foot: card ? (() => { const f = card.querySelector('.sc-foot'); return { ok: !!f, of: !!f && /\/ 100/.test(f.textContent), scale: !!card.querySelector('.score-scale'), anim: getComputedStyle(card.querySelector('svg .r2-cur')).animationName }; })() : null, overall: vals.overall, gone: !!document.querySelector('.scg, .scb') }; });
  ok(sc.radar && !sc.gone && sc.poly === 5, 'Score: Netz-Diagramm mit vier Ringen und Fläche (heygaia-Stil), kein Ring, keine Leuchtreihen');
  ok(/Trefferquote/.test(sc.labels) && /Drawdown/.test(sc.labels) && sc.labels.split(',').length === 6, 'Sechs Achsen beschriftet · ' + sc.labels);
  ok(sc.big === sc.overall && sc.foot && sc.foot.ok && sc.foot.of, 'Fußzeile zeigt den Score „/ 100“ · ' + sc.big + ' · ' + JSON.stringify(sc.foot));
  ok(sc.foot && !sc.foot.scale && sc.foot.anim === 'r2-grow', 'Keine Skala mehr; das Netz wächst beim Öffnen einmal aus der Mitte');
  await p.goto('file:///home/user/Florian/web/app.html#/stats/state', { waitUntil: 'load' }); await p.evaluate(() => { Store.setSetting('range', { preset: 'all' }); App.rerender(); }); await p.waitForTimeout(700);
  const st = await p.evaluate(() => { const cards = [...document.querySelectorAll('.stc')]; return { cards: cards.length, cols: cards.map(c => c.querySelectorAll('.stc-col').length), corr: document.querySelectorAll('.st-corr').length, paren: /\(\d/.test(cards.map(t => t.innerText).join(' ')), labels: [...document.querySelectorAll('.stc-l')].map(l => l.textContent).join(','), cut: [...document.querySelectorAll('.stc-l, .stc-col > b')].filter(s => s.scrollWidth > s.clientWidth + 1).length,
    lean: cards.every(c => !c.querySelector('.stc-plot, .stc-m, .st-bar, .bar-row')), tip: document.querySelector('.stc-col').getAttribute('data-tip'), h: Math.round(cards[0].closest('.card').getBoundingClientRect().height) }; });
  ok(st.cards === 3 && st.cols.every(n => n === 3) && st.corr === 0 && !/Korrelation/.test(document_text = await p.evaluate(() => document.getElementById('content').innerText)), 'Zustand: je Karte drei Spalten in Skalen-Reihenfolge, keine Korrelation mehr');
  await p.evaluate(async () => { Store.setLanguage('en'); I18N.setLang('en'); await new Promise(r => setTimeout(r, 900)); App.rerender(); }); await p.waitForTimeout(500);
  ok(await p.evaluate(() => /^\d+ trading days with a check-in\.$/.test(document.querySelector('.stc').closest('.grid').previousElementSibling.textContent.trim())), 'Englisch: Einleitungszeile übersetzt');
  await p.evaluate(() => { Store.setLanguage('de'); I18N.setLang('de'); App.rerender(); }); await p.waitForTimeout(400);
  ok(await p.evaluate(() => { const ic = [...document.querySelectorAll('.stc')].map(c => c.closest('.card').querySelector('.card-title .card-ico svg')); return ic.length === 3 && ic.every(Boolean) && ic.every(s => s.getBoundingClientRect().width > 10); }), 'Jede Karte hat ein Symbol vor dem Titel (Mond, Blitz, Gesicht)');
  ok(!st.paren && /Niedrig1–2/.test(st.labels) && st.cut === 0, 'Keine Klammern, Bereich mit Spanne, nichts abgeschnitten · ' + st.labels);
  ok(st.lean && /\d+\sTage · \d+\s%\sim Plus/.test(st.tip) && st.h < 150, 'Nur Bereich und Betrag, Tage und Anteil im Plus im Tooltip, Karte flach · ' + st.h + 'px · ' + st.tip);
  ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
  console.log(`${pass}/${pass + fail} bestanden`); await b.close(); process.exit(fail ? 1 : 0); })();
