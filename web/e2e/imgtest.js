const { chromium } = require('playwright'); const fs = require('fs');
const out = []; const ok = (name, cond, extra = '') => out.push(`${cond ? 'PASS' : 'FAIL'} ${name}${extra ? ' · ' + extra : ''}`);
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///home/user/Florian/web/app.html#/notebook', { waitUntil: 'load' }); await p.waitForTimeout(900);
  await p.click('.nb .col.mid [data-action="nb-new"], .nb .col.mid .btn.primary, .nb .col.mid .btn.accent').catch(() => {}); await p.waitForTimeout(500);
  ok('Notebook passt ins Fenster (Seite scrollt nicht, Spalten gleich hoch)', await p.evaluate(() => document.documentElement.scrollHeight <= innerHeight && new Set([...document.querySelectorAll('.nb > .col')].map(c => Math.round(c.getBoundingClientRect().bottom))).size === 1 && document.querySelector('.nb').getBoundingClientRect().bottom <= innerHeight - 10));
  const figs = () => p.$$eval('.nb-editor .ql-editor .img img', e => e.map(i => ({ ok: i.naturalWidth > 0 && +getComputedStyle(i).opacity === 1, kind: i.dataset.blob ? 'id' : (i.getAttribute('src') || '').slice(0, 10) })));
  const b64 = fs.readFileSync('testbild.png').toString('base64');
  await p.click('.nb-editor .ql-editor');
  /* 1. Knopf: Label öffnet die Dateiauswahl */
  await p.click('.nb-toolbar [data-pop$="image"]'); await p.waitForTimeout(200);
  ok('Bild-Menü mit Hinweis auf Strg+V und Ziehen', (await p.textContent('.nb-toolbar .ed-pop .ed-hint')).includes('Strg+V'));
  ok('Hochladen ist ein Label am Datei-Feld', await p.$eval('.nb-toolbar label[data-ed-label="image"]', l => !!l.control && l.control.type === 'file'));
  const [fc] = await Promise.all([p.waitForEvent('filechooser', { timeout: 3000 }).catch(() => null), p.click('.nb-toolbar label[data-ed-label="image"]')]);
  ok('Klick öffnet die Dateiauswahl', !!fc); if (fc) { await fc.setFiles('testbild.png'); await p.waitForTimeout(1000); }
  let f = await figs(); ok('Bild über den Knopf eingefügt und sichtbar', f.length === 1 && f[0].ok && f[0].kind === 'id', JSON.stringify(f));
  ok('Menü danach geschlossen', !(await p.$eval('.nb-toolbar .ed-pop[id$="image"]', e => e.classList.contains('open'))));
  /* 2. Strg+V */
  const fire = (type) => p.evaluate(async ({ b64, type }) => { const bin = atob(b64); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); const file = new File([u], 'x.png', { type: 'image/png' }); const dt = new DataTransfer(); dt.items.add(file); const ed = document.querySelector('.nb-editor .ql-editor'); const r = ed.getBoundingClientRect(); if (type === 'paste') ed.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })); else for (const t of ['dragenter', 'dragover', 'drop']) ed.dispatchEvent(new DragEvent(t, { dataTransfer: dt, bubbles: true, cancelable: true, clientX: r.left + 40, clientY: r.top + 30 })); }, { b64, type });
  await fire('paste'); await p.waitForTimeout(1000); f = await figs(); ok('Strg+V fügt ein', f.length === 2 && f.every(x => x.ok), JSON.stringify(f));
  await fire('drop'); await p.waitForTimeout(1000); f = await figs(); ok('Hineinziehen fügt ein', f.length === 3 && f.every(x => x.ok), JSON.stringify(f));
  /* 3. Bildspeicher hängt: nach 5 s Ersatz als Daten-URL */
  await p.evaluate(() => { window.__put = Blobs.put; Blobs.put = () => new Promise(() => {}); });
  await fire('paste'); await p.waitForTimeout(6200); f = await figs(); ok('Bildspeicher hängt: Bild kommt trotzdem (Daten-URL)', f.length === 4 && f[f.length - 1].ok && f.filter(x => x.kind.startsWith('data:image')).length === 1, JSON.stringify(f));
  await p.evaluate(() => { Blobs.put = window.__put; });
  /* 4. Keine Bilddatei */
  await p.evaluate(() => { const inp = document.querySelector('[data-ed-file="image"]'); const dt = new DataTransfer(); dt.items.add(new File(['hallo'], 'a.txt', { type: 'text/plain' })); inp.files = dt.files; inp.dispatchEvent(new Event('change', { bubbles: true })); }); await p.waitForTimeout(400);
  ok('Keine Bilddatei: Hinweis statt Fehler', /keine Bilddatei/.test(await p.evaluate(() => (document.querySelector('.toast-wrap') || {}).textContent || '')));
  /* 5. Nach Neuladen noch da */
  await p.waitForTimeout(1500); await p.reload(); await p.waitForTimeout(1500); f = await figs(); ok('Nach Neuladen alle 4 Bilder da', f.length === 4 && f.every(x => x.ok), JSON.stringify(f));
  await p.screenshot({ path: 'img-note.png' });
  ok('Keine Fehler', errs.length === 0, errs.join(' | '));
  console.log(out.join('\n')); console.log(`${out.filter(x => x.startsWith('PASS')).length}/${out.length} bestanden`); await b.close(); })();
