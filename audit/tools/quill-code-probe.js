const { chromium } = require('playwright'); const path = require('path');
const base = 'file:///home/user/Florian/web/app.html'; const OUT = path.join(__dirname, 'shots', 'extra', 'themes');
(async () => { const b = await chromium.launch();
  for (const theme of ['light', 'dark']) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); try { await require('../localfonts.js')(p); } catch (e) {}
    await p.goto(base, { waitUntil: 'load' }); await p.evaluate(t => { Store.installSample(); Store.setSetting('language', 'de'); Store.setSetting('theme', t); Store.saveNow(); }, theme); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(600);
    await p.goto(base + '#/notebook'); await p.waitForTimeout(900);
    const r = await p.evaluate(() => { const c = document.querySelector('.nb .ql-container'); const q = Quill.find(c); if (!q) return 'no quill';
      q.setContents([{ insert: 'Codeblock im Notizbuch\n', attributes: {} }, { insert: 'if (risk > 1) stop();' }, { insert: '\n', attributes: { 'code-block': 'plain' } }, { insert: 'return size;' }, { insert: '\n', attributes: { 'code-block': 'plain' } }, { insert: 'Inline: ' }, { insert: 'stopLoss', attributes: { code: true } }, { insert: ' und ein ' }, { insert: 'Link', attributes: { link: 'https://example.com' } }, { insert: '\n' }, { insert: 'Ein Zitat zum Abschluss.' }, { insert: '\n', attributes: { blockquote: true } }], 'api');
      const cb = document.querySelector('.nb .ql-editor .ql-code-block-container'); const ic = document.querySelector('.nb .ql-editor code'); const ed = document.querySelector('.nb .ql-editor');
      const g = el => el ? (s => ({ bg: s.backgroundColor, color: s.color, font: s.fontFamily.slice(0, 40), radius: s.borderRadius, pad: s.padding }))(getComputedStyle(el)) : null;
      const line = document.querySelector('.nb .ql-editor .ql-code-block'); return { codeBlock: g(cb), codeLine: g(line), inlineCode: g(ic), editorBg: getComputedStyle(document.querySelector('.nb > .col.right')).backgroundColor, editorColor: getComputedStyle(ed).color }; });
    console.log(theme, JSON.stringify(r));
    const el = await p.$('.nb > .col.right'); await p.waitForTimeout(300); await el.screenshot({ path: path.join(OUT, `quill_code_${theme}.png`) });
    await ctx.close(); }
  await b.close(); })();
