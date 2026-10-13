const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); await require('../localfonts.js')(p);
  await p.goto(process.env.BASE, { waitUntil: 'load' }); await p.evaluate(() => { Store.installSample(); Store.setSetting('language', 'de'); Store.saveNow(); }); await p.reload({ waitUntil: 'load' });
  const id = await p.evaluate(() => { const n = Store.addNote({ title: 'Wochenrückblick KW 42', folderId: 'daily', content: { ops: [{ insert: 'Überschrift' }, { insert: '\n', attributes: { header: 1 } }, { insert: 'Ein Absatz mit etwas Text, der lang genug ist, um die Zeilenlänge der Spalte zu zeigen und einmal umzubrechen, damit man es sieht.\n' }, { insert: 'Zwischen' }, { insert: '\n', attributes: { header: 2 } }] } }); Store.saveNow(); return n.id; });
  await p.goto(process.env.BASE + '#/notebook/' + id); await p.waitForTimeout(1500);
  const r = await p.evaluate(() => { const q = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { x: Math.round(r.left), w: Math.round(r.width), fs: cs.fontSize, lh: cs.lineHeight, fw: cs.fontWeight, pad: cs.paddingLeft + ' ' + cs.paddingRight }; }; return { title: q('.nb .note-head [data-nb-title], .nb .note-head .title, .nb .note-head h1, .nb .note-head textarea, .nb .note-head input'), meta: q('.nb .note-head .meta'), ed: q('#nb-editor .ql-editor'), p: q('#nb-editor .ql-editor p'), h1: q('#nb-editor .ql-editor h1'), h2: q('#nb-editor .ql-editor h2') }; });
  console.log(JSON.stringify(r, null, 1)); await b.close();
})();
