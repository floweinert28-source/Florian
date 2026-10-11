/* Google-Schriften aus lokalen Kopien ausliefern: in der Testumgebung blockiert der Proxy die Zertifikate */
const fs = require('fs'), path = require('path'); const dir = path.join(__dirname, 'fonts-local'); const css = fs.readFileSync(path.join(dir, 'fonts.css'), 'utf8');
module.exports = async function localFonts(target) {
  await target.route('https://fonts.googleapis.com/**', r => r.fulfill({ status: 200, contentType: 'text/css', headers: { 'Access-Control-Allow-Origin': '*' }, body: css }));
  /* Satoshi (Fontshare-API, feste Schnitte 400/500/700/900) aus der lokalen Kopie */
  const sat = [[400, 'Regular'], [500, 'Medium'], [700, 'Bold'], [900, 'Black']].map(([w, n]) => `@font-face{font-family:'Satoshi';src:url('https://cdn.fontshare.com/local/Satoshi-${n}.woff2') format('woff2');font-weight:${w};font-style:normal;font-display:swap}`).join('');
  await target.route('https://api.fontshare.com/**', r => r.fulfill({ status: 200, contentType: 'text/css', headers: { 'Access-Control-Allow-Origin': '*' }, body: sat }));
  await target.route('https://cdn.fontshare.com/**', r => r.fulfill({ status: 200, contentType: 'font/woff2', headers: { 'Access-Control-Allow-Origin': '*' }, body: fs.readFileSync(path.join(dir, path.basename(new URL(r.request().url()).pathname))) }));
  await target.route('https://fonts.gstatic.com/**', r => { const f = path.join(dir, path.basename(new URL(r.request().url()).pathname)); if (fs.existsSync(f)) r.fulfill({ status: 200, contentType: 'font/woff2', headers: { 'Access-Control-Allow-Origin': '*' }, body: fs.readFileSync(f) }); else r.abort(); });
};
