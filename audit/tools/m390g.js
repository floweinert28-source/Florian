/* Probe: Zertifikat-Sheet am Handy mit allen Vorschlägen (Sticky-Kopf/Fuß, Fußzeilen-Regel, Hinweis im Format-Feld, Formate in 3 Spalten) */
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const base = 'file:///home/user/Florian/web/app.html'; const OUT = path.join(__dirname, 'shots', 'extra', 'm390');
const CSS = `@media (max-width: 560px) {
  .modal:has(.modal-head) { padding-top: 0; }
  .modal:has(.modal-foot) { padding-bottom: 0; }
  .modal .modal-head { position: sticky; top: 0; z-index: 2; margin: 0 -16px; padding: 18px 16px 10px; background: var(--surface); }
  .modal .modal-foot { position: sticky; bottom: 0; z-index: 2; margin: 0 -16px; padding: 10px 16px calc(16px + env(safe-area-inset-bottom, 0px)); background: var(--surface); }
  .modal-foot > .btn { flex: 1 1 auto; justify-content: center; }
  .modal-foot > .left:not(.btn) { flex: 1 0 100%; margin-right: 0; }
  .modal-foot > .btn.left { flex: 0 0 auto; }
  .cert-opts .seg.sm { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .cert-opts .seg.sm button { text-align: center; }
  .cert-opts .seg.sm button small { display: block; font-size: 11px; }
}`;
(async () => {
  const b = await chromium.launch(); const res = {};
  for (const theme of ['dark', 'light']) for (const share of [false, true]) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    const p = await ctx.newPage(); try { await require('../localfonts.js')(p); } catch (e) {}
    await p.goto(base, { waitUntil: 'load' }); await p.evaluate(t => { Store.installSample(); Store.setSetting('theme', t); Store.setSetting('language', 'de'); Store.saveNow(); }, theme);
    await p.goto(base + '#/dashboard'); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(900);
    await p.addStyleTag({ content: CSS });
    if (share) await p.evaluate(() => { navigator.share = () => Promise.resolve(); navigator.canShare = () => true; });
    const day = await p.evaluate(() => Core.closedOnly(App.allTrades()).reduce((k, t) => t.dayKey > k ? t.dayKey : k, ''));
    await p.evaluate(d => Certificate.open('day', d), day); await p.waitForTimeout(900);
    /* Hinweis aus der Fußzeile in das Format-Feld verschieben (simuliert die Änderung in certificate.js) */
    await p.evaluate(() => { const h = document.querySelector('#cert-foot > .left'); const seg = document.querySelector('.cert-opts .seg.sm'); if (h && seg) { const s = document.createElement('span'); s.className = 'hint'; s.style.display = 'block'; s.style.marginTop = '6px'; s.textContent = h.textContent; seg.parentElement.appendChild(s); h.remove(); } });
    await p.waitForTimeout(300);
    res[`${theme}_${share}`] = await p.evaluate(() => { const R = e => { const q = e.getBoundingClientRect(); return { t: e.textContent.trim().slice(0, 24), x: Math.round(q.x), y: Math.round(q.y), w: Math.round(q.width), h: Math.round(q.height) }; }; const f = document.querySelector('.modal-foot'); return { foot: R(f), kids: [...f.children].map(R), seg: [...document.querySelectorAll('.cert-opts .seg.sm button')].map(R) }; });
    await p.screenshot({ path: path.join(OUT, `${theme}_probe_cert_final${share ? '_teilen' : ''}.png`) });
    await p.evaluate(() => { document.querySelector('.modal').scrollTop = 9999; }); await p.waitForTimeout(200);
    await p.screenshot({ path: path.join(OUT, `${theme}_probe_cert_final${share ? '_teilen' : ''}_unten.png`) });
    await ctx.close();
  }
  console.log(JSON.stringify(res)); await b.close();
})();
