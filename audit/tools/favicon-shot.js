const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const html = fs.readFileSync('/home/user/Florian/web/app.html', 'utf8'); const href = html.match(/<link rel="icon" href="([^"]+)"/)[1];
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 520, height: 150 }, deviceScaleFactor: 2 });
  const tab = (bg, fg, label) => `<div style="display:flex;align-items:center;gap:8px;background:${bg};color:${fg};padding:8px 14px;border-radius:8px 8px 0 0;font:13px system-ui;width:200px"><img src="${href}" width="16" height="16">${label}</div>`;
  await p.setContent(`<body style="margin:0;padding:12px;background:#dee1e6;display:flex;flex-wrap:wrap;gap:10px">${tab('#ffffff', '#1f1f1f', 'Journalyst (hell, aktiv)')}${tab('#dee1e6', '#1f1f1f', 'Journalyst (hell, inaktiv)')}${tab('#35363a', '#e8eaed', 'Journalyst (dunkel, aktiv)')}${tab('#202124', '#e8eaed', 'Journalyst (dunkel, inaktiv)')}</body>`);
  await p.waitForTimeout(300); await p.screenshot({ path: path.join(__dirname, 'shots', 'extra', 'themes', 'favicon_tabs.png') }); await b.close(); console.log('ok'); })();
