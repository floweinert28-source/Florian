const { chromium } = require('playwright');
const base = 'file:///home/user/Florian/web/app.html';
(async () => {
  const b = await chromium.launch();
  for (const [w, h] of [[1366, 768], [1280, 800], [1280, 720]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' }); const p = await ctx.newPage(); try { await require('../localfonts.js')(p); } catch (e) {}
    await p.goto(base, { waitUntil: 'load' }); await p.evaluate(() => { Store.installSample(); Store.setSetting('theme', 'dark'); Store.setSetting('language', 'de'); Store.setSetting('sidebarMini', true); Store.saveNow(); }); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(700);
    const m = () => p.evaluate(() => { const sb = document.getElementById('sidebar'); const u = document.querySelector('.sb-user').getBoundingClientRect(); const last = [...sb.querySelectorAll('.nav a')].pop().getBoundingClientRect(); return { sh: sb.scrollHeight, ch: sb.clientHeight, userBottom: Math.round(u.bottom), lastNavBottom: Math.round(last.bottom), vh: innerHeight }; });
    const a = await m();
    await p.addStyleTag({ content: '@media (min-width: 961px) and (max-height: 1060px) { .brand { padding-bottom: 14px; } .nav a, .nav button { padding-top: 6px; padding-bottom: 6px; } .nav.nav-group + .nav.nav-group { margin-top: 16px; } .nav-title { padding-bottom: 6px; } .nav.nav-sec { margin-top: 8px; } } @media (min-width: 961px) and (max-height: 940px) { .nav a, .nav button { padding-top: 5px; padding-bottom: 5px; } .nav.nav-group + .nav.nav-group { margin-top: 12px; } } html.sb-mini .nav a, html.sb-mini .nav button { padding: 0; } .sidebar .sb-userwrap { position: sticky; bottom: 0; z-index: 1; flex: 0 0 auto; margin: 2px 0 -18px; padding: 8px 0 18px; background: var(--bg-2); }' });
    await p.waitForTimeout(200);
    console.log(w + 'x' + h, 'mini heute', JSON.stringify(a), 'nach shell-2', JSON.stringify(await m()));
    await ctx.close();
  }
  await b.close();
})();
