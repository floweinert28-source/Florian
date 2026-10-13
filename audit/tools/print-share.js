const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const base = process.env.BASE; const D1 = path.join(__dirname, 'shots', 'extra', 'druck'), D2 = path.join(__dirname, 'shots', 'extra', 'share');
const LOG = []; const log = m => { LOG.push(m); console.log(m); };
const NOTE = () => {
  const hsl = (h, s, l) => { s /= 100; l /= 100; const k = n => (n + h / 30) % 12; const a = s * Math.min(l, 1 - l); const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); return '#' + [f(0), f(8), f(4)].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join(''); };
  const cv = document.createElement('canvas'); cv.width = 1200; cv.height = 600; const g = cv.getContext('2d'); g.fillStyle = '#131722'; g.fillRect(0, 0, 1200, 600); g.strokeStyle = '#2a2e39'; for (let x = 0; x < 1200; x += 60) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 600); g.stroke(); } for (let i = 0; i < 60; i++) { const x = 20 + i * 19, o = 300 + Math.sin(i / 5) * 120, c = o + (Math.random() - .5) * 60; g.fillStyle = c > o ? '#26a69a' : '#ef5350'; g.fillRect(x, Math.min(o, c), 12, Math.abs(c - o) + 2); }
  const img = cv.toDataURL('image/jpeg', .8);
  const P = t => [{ insert: t }, { insert: '\n' }];
  const lorem = 'Der Vormittag war ruhig, NQ lief bis 10:15 in einer engen Spanne. Ich habe zweimal zu früh eingestiegen, obwohl das Setup noch nicht bestätigt war. Nach dem zweiten Verlust habe ich eine Pause gemacht und den Plan noch einmal gelesen. Am Nachmittag kam der saubere Ausbruch über das Hoch des Vortags, den ich mit halber Größe gehandelt habe.';
  let ops = [{ insert: 'Wochenrückblick KW 42' }, { insert: '\n', attributes: { header: 1 } }, ...P(lorem),
    { insert: 'Wichtig: ' , attributes: { bold: true } }, { insert: 'Revenge-Trade nach dem zweiten Verlust', attributes: { color: hsl(0, 55, 68) } }, { insert: ' und ' }, { insert: 'gelb markierte Lektion', attributes: { background: hsl(50, 55, 26) } }, { insert: ' sowie ' }, { insert: 'heller Hinweistext', attributes: { color: '#ececec' } }, { insert: '.\n' },
    { insert: 'Plan für die nächste Woche' }, { insert: '\n', attributes: { header: 2 } },
    { insert: 'Stop immer vor dem Einstieg setzen' }, { insert: '\n', attributes: { list: 'checked' } }, { insert: 'Nach zwei Verlusten 15 Minuten Pause' }, { insert: '\n', attributes: { list: 'unchecked' } }, { insert: 'Nur A-Setups mit voller Größe' }, { insert: '\n', attributes: { list: 'unchecked' } },
    { insert: 'Zahlen der Woche' }, { insert: '\n', attributes: { header: 3 } },
  ];
  const rows = [['Tag', 'Trades', 'Netto'], ['Montag', '2', '+591,83 €'], ['Dienstag', '3', '−227,83 €'], ['Mittwoch', '1', '+120,00 €']];
  rows.forEach((r, i) => r.forEach(c => { ops.push({ insert: c }); ops.push({ insert: '\n', attributes: { table: 'row-' + (i + 1) } }); }));
  ops.push({ insert: { details: { summary: 'Details zum Ausbruch-Setup', html: '<p>Einstieg über dem Vortageshoch, Stop unter dem letzten Tief, Ziel 2 R. Teilverkauf bei 1 R.</p>', open: true } } });
  ops.push({ insert: { tweet: 'https://x.com/trader/status/1234567890' } });
  ops.push({ insert: { figure: { src: img, caption: 'NQ 5 Minuten, Ausbruch am Nachmittag' } } });
  ops.push(...P('Zitat aus meinem Regelwerk:')); ops.push({ insert: 'Kein Trade ohne Plan. Kein Plan ohne Stop.' }, { insert: '\n', attributes: { blockquote: true } });
  ops.push({ insert: 'Weitere Gedanken' }, { insert: '\n', attributes: { header: 2 } });
  for (let i = 0; i < 9; i++) ops.push(...P(lorem));
  ops.push({ insert: 'Code-Notiz: entry = high + 2 ticks' }, { insert: '\n', attributes: { 'code-block': true } });
  ops.push({ insert: { divider: true } }); ops.push(...P('Ende der Notiz.'));
  const n = Store.addNote({ title: 'Wochenrückblick KW 42', folderId: 'daily', content: { ops } }); Store.saveNow(); return n.id;
};
async function rasterize(pdf, prefix) { const { execFileSync } = require('child_process'); const out = execFileSync('python3', ['-I', '-c', `import pypdfium2 as p,sys\nd=p.PdfDocument(sys.argv[1])\nprint(len(d))\nfor i in range(min(len(d),6)):\n  d[i].render(scale=1.1).to_pil().save(sys.argv[2]+'_s%d.png'%(i+1))`, pdf, prefix]).toString(); return out.trim(); }
(async () => {
  const b = await chromium.launch();
  for (const theme of ['dark', 'light']) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); await require('../localfonts.js')(p); p.on('pageerror', e => log('PAGEERR ' + e.message));
    await p.goto(base, { waitUntil: 'load' });
    await p.evaluate(t => { Store.installSample(); Store.setSetting('theme', t); Store.setSetting('language', 'de'); Store.saveNow(); }, theme); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(900);
    const id = await p.evaluate(NOTE); log('note ' + id);
    await p.goto(base + '#/notebook/' + id); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(1500);
    await p.screenshot({ path: path.join(D1, `${theme}_notiz_bildschirm.png`) });
    // Druck
    await p.emulateMedia({ media: 'print' }); await p.waitForTimeout(400); await p.screenshot({ path: path.join(D1, `${theme}_notiz_printmedia_full.png`), fullPage: true });
    const info = await p.evaluate(() => { const q = s => { const e = document.querySelector(s); if (!e) return null; const cs = getComputedStyle(e); return { disp: cs.display, bg: cs.backgroundColor, col: cs.color, txt: (e.value || e.textContent || '').trim().slice(0, 60) }; }; return { body: q('body'), main: q('.main'), content: q('.content'), right: q('.nb > .col.right'), head: q('.nb .note-head'), title: q('.nb .note-head [data-nb-title], .nb .note-head .title, .nb .note-head input, .nb .note-head h2, .nb .note-head textarea'), meta: q('.nb .note-head .meta'), editor: q('.ql-editor'), details: q('.nb-details'), tweet: q('.nb-tweet'), table: q('.ql-editor table td'), h1: q('.ql-editor h1'), dateBtn: q('.nb .note-head .row .btn'), sb: q('.sidebar'), topbar: q('.topbar'), pagehead: q('.page-head'), dashHead: q('.dash-head') }; });
    log(theme + ' printinfo ' + JSON.stringify(info));
    for (const bg of [false, true]) { const f = path.join(D1, `${theme}_notiz${bg ? '_hintergrund' : ''}.pdf`); await p.pdf({ path: f, format: 'A4', printBackground: bg, margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' } }); log(theme + ' pdf ' + bg + ' pages ' + await rasterize(f, f.replace('.pdf', ''))); }
    await p.emulateMedia({ media: 'screen' });
    // Share-Link erzeugen
    if (theme === 'dark') {
      await p.click('.nb .note-head [data-action="nb-share"]'); await p.waitForTimeout(500); const link = await p.$eval('#share-link', e => e.value); fs.writeFileSync(path.join(D2, 'link.txt'), link); log('link len ' + link.length); await p.keyboard.press('Escape');
    }
    // Strg+P Dashboard und Stats
    for (const r of ['dashboard', 'stats', 'day']) { await p.goto(base + '#/' + r); await p.waitForTimeout(1500); const f = path.join(D1, `${theme}_${r}.pdf`); await p.pdf({ path: f, format: 'A4', printBackground: false }); log(theme + ' ' + r + ' pages ' + await rasterize(f, f.replace('.pdf', ''))); const f2 = path.join(D1, `${theme}_${r}_hintergrund.pdf`); await p.pdf({ path: f2, format: 'A4', printBackground: true }); log(theme + ' ' + r + ' bg pages ' + await rasterize(f2, f2.replace('.pdf', ''))); }
    await ctx.close();
  }
  // Geteilte Notiz
  const link = fs.readFileSync(path.join(D2, 'link.txt'), 'utf8'); const hash = link.slice(link.indexOf('#'));
  for (const theme of ['dark', 'light']) for (const w of [1440, 390]) {
    const mobile = w < 600; const ctx = await b.newContext({ viewport: { width: w, height: mobile ? 844 : 900 }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile }); const p = await ctx.newPage(); await require('../localfonts.js')(p);
    await p.goto(base, { waitUntil: 'load' }); await p.evaluate(t => { Store.setSetting('theme', t); Store.setSetting('language', 'de'); Store.saveNow(); }, theme); // frischer Besucher ohne Daten
    await p.goto(base + hash); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(1500);
    await p.screenshot({ path: path.join(D2, `${theme}-${w}_share.png`) }); await p.screenshot({ path: path.join(D2, `${theme}-${w}_share_full.png`), fullPage: true });
    if (theme === 'dark' && w === 1440) { const m = await p.evaluate(() => { const q = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), fs: cs.fontSize, lh: cs.lineHeight, fw: cs.fontWeight, ff: cs.fontFamily.split(',')[0], col: cs.color, mw: cs.maxWidth }; }; return { title: document.title, pageTitle: q('.page-title, .topbar h1, .title h1'), card: q('.nb-share-view'), h2: q('.nb-share-view h2'), meta: q('.nb-share-view .small.muted'), p: q('.nb-share-view .ql-editor p'), h1: q('.nb-share-view .ql-editor h1'), h2e: q('.nb-share-view .ql-editor h2'), h3: q('.nb-share-view .ql-editor h3'), li: q('.nb-share-view .ql-editor li'), td: q('.nb-share-view .ql-editor td'), details: q('.nb-share-view .nb-details'), sidebar: q('.sidebar'), dashHead: q('.page-head, .dash-head, .head-row'), tradeBtn: q('[data-action="trade-new"], .btn.log, .btn-log'), editorP: null, texts: [...document.querySelectorAll('.nb-share-view .ql-editor > *')].slice(0, 30).map(e => e.tagName + ':' + e.textContent.slice(0, 40)) }; }); log('share-measure ' + JSON.stringify(m)); }
    await p.goto(base + '#share_dasistkaputt'); await p.waitForTimeout(1000); await p.screenshot({ path: path.join(D2, `${theme}-${w}_share_kaputt.png`) });
    await ctx.close();
  }
  fs.writeFileSync(path.join(__dirname, 'print-share-log.txt'), LOG.join('\n') + '\n'); await b.close(); console.log('DONE');
})().catch(e => { console.error(e); fs.writeFileSync(path.join(__dirname, 'print-share-log.txt'), LOG.join('\n') + '\nERR ' + e.stack); process.exit(1); });
