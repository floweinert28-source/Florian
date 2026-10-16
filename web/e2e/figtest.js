const { chromium } = require('playwright');
const out = []; const ok = (name, cond, extra = '') => out.push(`${cond ? 'PASS' : 'FAIL'} ${name}${extra ? ' · ' + extra : ''}`);
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1600, height: 1000 } }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///home/user/Florian/web/app.html#/notebook', { waitUntil: 'load' }); await p.waitForTimeout(900);
  await p.click('.nb .col.mid [data-action=nb-new]'); await p.waitForTimeout(500); await p.click('.nb-editor .ql-editor'); await p.keyboard.type('Setup von heute:'); await p.keyboard.press('Enter');
  await p.click('.nb-toolbar [data-pop$="insert"]'); await p.waitForTimeout(150);
  const [fc] = await Promise.all([p.waitForEvent('filechooser'), p.click('.nb-toolbar label[data-ed-label="image"]')]); await fc.setFiles('chart.png'); await p.waitForTimeout(900);
  const geo = () => p.evaluate(() => { const f = document.querySelector('.nb-figure'); const im = f.querySelector('img').getBoundingClientRect(), rs = f.querySelector('.rs').getBoundingClientRect(), cap = f.querySelector('.cap').getBoundingClientRect(), fr = f.getBoundingClientRect(); return { img: [Math.round(im.left), Math.round(im.right), Math.round(im.bottom), Math.round(im.width)], rsC: [Math.round(rs.left + rs.width / 2), Math.round(rs.top + rs.height / 2)], cap: [Math.round(cap.left), Math.round(cap.right)], full: Math.round(fr.width), w: f.querySelector('.fig').style.width }; });
  let g = await geo(); ok('Ohne Größe: Bild höchstens volle Breite', g.img[3] <= g.full && g.img[3] > 100, JSON.stringify(g));
  ok('Griff sitzt an der Bildecke', Math.abs(g.rsC[0] - g.img[1]) <= 3 && Math.abs(g.rsC[1] - g.img[2]) <= 3, JSON.stringify(g));
  /* Schnellknopf M */
  await p.hover('.nb-figure img'); await p.waitForTimeout(200); ok('Schnellknöpfe beim Drüberfahren', await p.$eval('.nb-figure .fig-bar', e => +getComputedStyle(e).opacity > 0.9));
  await p.click('.nb-figure .fig-bar [data-w="50%"]'); await p.waitForTimeout(200); g = await geo();
  ok('M setzt 50 %', g.w === '50%' && Math.abs(g.img[3] / g.full - 0.5) < 0.02, JSON.stringify(g));
  ok('Griff wandert mit an die Ecke', Math.abs(g.rsC[0] - g.img[1]) <= 3 && Math.abs(g.rsC[1] - g.img[2]) <= 3, JSON.stringify(g));
  ok('Unterschrift direkt unter dem Bild, gleich breit', Math.abs(g.cap[0] - g.img[0]) <= 2 && Math.abs(g.cap[1] - g.img[1]) <= 2, JSON.stringify(g));
  /* Ziehen */
  await p.hover('.nb-figure img'); await p.waitForTimeout(150); const rs = await p.$('.nb-figure .rs'); const bb = await rs.boundingBox();
  await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.mouse.down(); await p.mouse.move(bb.x + bb.width / 2 - 120, bb.y + 40, { steps: 8 });
  const mid = await p.evaluate(() => ({ badge: document.querySelector('.nb-figure .fig-size').hidden ? '' : document.querySelector('.nb-figure .fig-size').textContent, resizing: document.querySelector('.nb-figure').classList.contains('resizing') }));
  ok('Beim Ziehen Größe in Prozent sichtbar', mid.resizing && /\d+ %/.test(mid.badge), JSON.stringify(mid));
  await p.mouse.up(); await p.waitForTimeout(200); g = await geo();
  ok('Ziehen verkleinert, Griff bleibt an der Ecke', parseFloat(g.w) < 50 && parseFloat(g.w) > 20 && Math.abs(g.rsC[0] - g.img[1]) <= 3 && Math.abs(g.rsC[1] - g.img[2]) <= 3, JSON.stringify(g));
  /* Einrasten bei 33 % */
  const target = g.full * 0.335; const bb2 = await rs.boundingBox(); await p.mouse.move(bb2.x + bb2.width / 2, bb2.y + bb2.height / 2); await p.mouse.down(); await p.mouse.move(bb2.x + bb2.width / 2 + (target - g.img[3]), bb2.y + 10, { steps: 6 }); await p.mouse.up(); await p.waitForTimeout(150);
  g = await geo(); ok('Rastet bei 33 % ein', g.w === '33%', g.w);
  /* Grenzen */
  const bb3 = await rs.boundingBox(); await p.mouse.move(bb3.x + bb3.width / 2, bb3.y + bb3.height / 2); await p.mouse.down(); await p.mouse.move(bb3.x + 2000, bb3.y, { steps: 5 }); await p.mouse.up(); await p.waitForTimeout(150);
  g = await geo(); ok('Nicht breiter als die Notiz (100 %)', g.w === '100%' && g.img[3] <= g.full, g.w);
  await p.hover('.nb-figure img', { position: { x: 30, y: 60 } }); await p.waitForTimeout(120); await p.click('.nb-figure .fig-bar [data-w="33%"]'); await p.waitForTimeout(1500);
  /* Rahmen verschwindet nach dem Loslassen, auch wenn außerhalb losgelassen wird oder das Loslassen verloren geht */
  ok('Nach dem Ziehen kein Rahmen und keine Anzeige mehr', await p.evaluate(() => { const f = document.querySelector('.nb-figure'); return !f.classList.contains('resizing') && f.querySelector('.fig-size').hidden; }));
  await p.hover('.nb-figure img', { position: { x: 30, y: 60 } }); await p.waitForTimeout(120); const bb4 = await rs.boundingBox(); await p.mouse.move(bb4.x + bb4.width / 2, bb4.y + bb4.height / 2); await p.mouse.down(); await p.mouse.move(150, 500, { steps: 6 }); await p.mouse.up(); await p.waitForTimeout(150);
  ok('Loslassen über der Seitenleiste beendet das Ziehen', !(await p.evaluate(() => document.querySelector('.nb-figure').classList.contains('resizing'))));
  await p.evaluate(() => { const h = document.querySelector('.nb-figure .rs'); const r = h.getBoundingClientRect(); h.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerId: 7, clientX: r.left + 5, clientY: r.top + 5, buttons: 1 })); });
  const stuck = await p.evaluate(() => document.querySelector('.nb-figure').classList.contains('resizing'));
  await p.evaluate(() => document.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 600, clientY: 500, buttons: 0, pointerId: 7 }))); await p.waitForTimeout(100);
  ok('Verlorenes Loslassen: nächste Bewegung ohne Taste beendet es', stuck && !(await p.evaluate(() => document.querySelector('.nb-figure').classList.contains('resizing'))));
  await p.click('.nb-editor .ql-editor', { position: { x: 20, y: 5 } }).catch(() => {}); await p.keyboard.type('weiter'); await p.waitForTimeout(100);
  ok('Beim Schreiben kein Rahmen', !(await p.evaluate(() => !!document.querySelector('.nb-figure.resizing'))));
  /* Gespeichert und nach Neuladen gleich */
  await p.reload(); await p.waitForTimeout(1500); g = await geo(); ok('Größe nach Neuladen erhalten', g.w === '33%' && Math.abs(g.img[3] / g.full - 0.33) < 0.02, JSON.stringify(g));
  await p.screenshot({ path: 'fig-33.png' });
  /* kleines Bild: Leiste neben dem Bild */
  await p.evaluate(() => { const f = document.querySelector('.nb-figure .fig'); f.style.width = '12%'; }); await p.mouse.move(700, 300); await p.hover('.nb-figure img', { force: true, position: { x: 5, y: 5 } }); await p.waitForTimeout(250);
  ok('Kleines Bild: Schnellknöpfe neben dem Bild erreichbar', await p.evaluate(() => { const f = document.querySelector('.nb-figure'); const bar = f.querySelector('.fig-bar').getBoundingClientRect(), im = f.querySelector('img').getBoundingClientRect(); return f.classList.contains('narrow') && bar.left >= im.right; }));
  await p.mouse.move(800, 300); await p.waitForTimeout(100);
  ok('Keine Fehler', errs.length === 0, errs.join(' | '));
  console.log(out.join('\n')); console.log(`${out.filter(x => x.startsWith('PASS')).length}/${out.length} bestanden`); await b.close(); })();
