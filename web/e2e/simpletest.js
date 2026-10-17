/* Ansicht: Simple ist vorerst ausgeschaltet. Keine Auswahl mehr in Einstellungen → Design; auch mit altem gespeichertem „simple“
   zeigt die App die volle Ansicht (Seitenleiste mit Gruppen, alle Statistik-Reiter, alle TradeLog-Spalten, volle Dashboard-Kopfzeile) */
const { chromium } = require('playwright');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log('PASS ' + m); } else { fail++; console.log('FAIL ' + m); } };
const BASE = 'file:///home/user/Florian/web/app.html';
(async () => { const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); p.on('pageerror', e => errs.push(e.message)); try { await require('./localfonts.js')(p); } catch (e) {}
  await p.goto(BASE + '#/settings/design', { waitUntil: 'load' }); await p.waitForTimeout(900);
  const set = await p.evaluate(() => ({ cards: document.querySelectorAll('.mode-card').length, heads: [...document.querySelectorAll('.set-block h3')].map(h => h.textContent.trim()) }));
  ok(!set.cards && !set.heads.includes('Ansicht') && set.heads[0] === 'Erscheinungsbild', 'Einstellungen → Design: keine Auswahl Simple/Advanced mehr · ' + set.heads.join(', '));
  /* alter Speicherstand mit „simple“ */
  await p.evaluate(() => { const k = 'trading-journal-web-v1'; const d = JSON.parse(localStorage.getItem(k)); d.settings.uiMode = 'simple'; localStorage.setItem(k, JSON.stringify(d)); location.hash = '#/dashboard'; location.reload(); });
  await p.waitForTimeout(1500);
  const st = await p.evaluate(() => ({ mode: document.documentElement.dataset.mode, ui: Store.settings.uiMode, simple: App.simple(), more: !!document.querySelector('#sidebar details.nav-more'), titles: document.querySelectorAll('#sidebar .nav-title').length, railMore: !!document.querySelector('[data-pop="railmore"]'), tools: [...document.querySelectorAll('.dh-tools [data-pop], .dh-tools [data-action]')].map(e => e.dataset.pop || e.dataset.action) }));
  ok(st.mode === 'advanced' && st.ui === 'advanced' && !st.simple, 'Gespeichertes „simple“ wird beim Laden zu Advanced · ' + JSON.stringify({ mode: st.mode, ui: st.ui }));
  ok(!st.more && st.titles >= 2 && !st.railMore, 'Seitenleiste mit Gruppentiteln, ohne „Mehr“; Leiste ohne „Mehr“-Menü');
  ok(st.tools.includes('tpl') && st.tools.includes('dash-f-open') && !st.tools.includes('dmore'), 'Dashboard-Kopf: Vorlage, Filter usw. direkt, kein „Mehr“ · ' + st.tools.join());
  await p.evaluate(() => { location.hash = '#/stats'; }); await p.waitForTimeout(800);
  const tabs = await p.evaluate(() => [...document.querySelectorAll('.tabs[data-subnav] a')].length);
  ok(tabs > 4, 'Statistiken: alle Reiter (' + tabs + ')');
  await p.evaluate(() => { location.hash = '#/trades'; }); await p.waitForTimeout(800);
  const cols = await p.evaluate(() => document.querySelectorAll('.tbl thead th').length);
  ok(cols > 5, 'TradeLog: alle Spalten (' + cols + ')');
  ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
  console.log(`${pass}/${pass + fail} bestanden`); await b.close(); process.exit(fail ? 1 : 0);
})();
