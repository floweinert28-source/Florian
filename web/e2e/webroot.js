/* Für parallele Arbeitskopien: Mit WEBROOT=/pfad/zur/kopie/web liefern alle Suiten die App aus dieser Kopie aus,
   obwohl sie file:///home/user/Florian/web/… aufrufen. Ohne WEBROOT ändert sich nichts.
   Aufruf: WEBROOT=… node -r ./webroot.js suite.js (de-default.js lädt diese Datei selbst). */
const pw = require('playwright'); const fs = require('fs'); const path = require('path');
const ROOT = process.env.WEBROOT; const REPO = '/home/user/Florian/web/';
if (ROOT && path.resolve(ROOT) + '/' !== REPO && !pw.__webroot) {
  pw.__webroot = true;
  const CT = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.json': 'application/json; charset=utf-8', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json' };
  const launch = pw.chromium.launch.bind(pw.chromium);
  pw.chromium.launch = async (...a) => {
    const b = await launch(...a);
    const newContext = b.newContext.bind(b);
    b.newContext = async (...o) => {
      const c = await newContext(...o);
      await c.route(/^file:\/\/\/home\/user\/Florian\/web\//, r => {
        const f = path.join(ROOT, decodeURIComponent(new URL(r.request().url()).pathname).slice(REPO.length));
        if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) return r.continue();
        r.fulfill({ status: 200, contentType: CT[path.extname(f)] || 'application/octet-stream', body: fs.readFileSync(f) });
      });
      return c;
    };
    b.newPage = async (...o) => { const c = await b.newContext(...o); return c.newPage(); };
    return b;
  };
}
module.exports = { webPath: p => (ROOT && p.startsWith(REPO) ? path.join(ROOT, p.slice(REPO.length)) : p) };
