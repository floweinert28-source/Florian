/* Für die bestehenden Testsuiten: Seit den Sprachen startet die App neu auf Englisch mit Dollar.
   Die alten Suiten prüfen deutsche Texte und Euro-Beträge. Darum liefert dieser Vorlauf js/store.js mit den früheren
   Standardwerten aus (Deutsch, Euro) – ohne in den Speicher zu schreiben, damit Neuladen und „Speicher leeren“ unverändert ablaufen.
   Aufruf: node -r ./de-default.js suite.js */
const { webPath } = require('./webroot.js'); /* WEBROOT: Arbeitskopie statt Repo (siehe webroot.js) */
const pw = require('playwright'); const fs = require('fs');
const SWAP = [["language: 'en'", "language: 'de'"], ["currency: 'USD', dailyLossLimitPct", "currency: 'EUR', dailyLossLimitPct"], ["size: 25000, currency: 'USD' }]", "size: 25000, currency: 'EUR' }]"], ["uiMode: 'simple'", "uiMode: 'advanced'"]]; /* Simple/Advanced: alte Suiten prüfen die volle Ansicht */
function storeBody(file) {
  let s = fs.readFileSync(file, 'utf8');
  for (const [a, b] of SWAP) { if (!s.includes(a)) throw new Error('de-default: Standardwert nicht gefunden: ' + a); s = s.replace(a, b); }
  return s;
}
const launch = pw.chromium.launch.bind(pw.chromium);
pw.chromium.launch = async (...a) => {
  const b = await launch(...a);
  const newContext = b.newContext.bind(b);
  b.newContext = async (...o) => {
    const c = await newContext(...o);
    /* file:// direkt von der Platte; http://127.0.0.1 (Worker-Tests mit http-server) aus dem web-Ordner des Repos */
    await c.route(/\/js\/store\.js(\?.*)?$/, r => { const u = new URL(r.request().url()); const f = u.protocol === 'file:' ? webPath(decodeURIComponent(u.pathname)) : require('path').join('/home/user/Florian/web', decodeURIComponent(u.pathname)); if (!fs.existsSync(f)) return r.continue(); r.fulfill({ status: 200, contentType: 'text/javascript; charset=utf-8', body: storeBody(f) }); });
    return c;
  };
  b.newPage = async (...o) => { const c = await b.newContext(...o); return c.newPage(); };
  return b;
};
