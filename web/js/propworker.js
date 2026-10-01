/* Web Worker für die Prop-Firm-Simulation: Monte Carlo läuft hier, damit die Oberfläche nicht blockiert.
   Nachricht hinein: { id, op: 'simulate'|'match'|'ev', args }, Nachricht heraus: { id, ok, result | error }.
   Funktionen überleben postMessage nicht: opts.fmtMoney === 'marker' lässt den Matcher Geldbeträge als ‹M:1234› markieren,
   die Oberfläche setzt sie dann mit fmt.cur (so greift auch der Geld-blind-Modus). Andere Werte für fmtMoney werden verworfen. */
/* global importScripts, PropSim, Core, Prop */
importScripts('core.js', 'prop.js', 'propsim.js');
var MARK = function (v) { return '‹M:' + Number(v) + '›'; };
function withMoney(o) { o = Object.assign({}, o || {}); if (o.fmtMoney === 'marker') o.fmtMoney = MARK; else if (typeof o.fmtMoney !== 'function') delete o.fmtMoney; return o; }
self.onmessage = function (e) {
  var m = e.data || {}; var a = m.args || {};
  try {
    var r;
    if (m.op === 'simulate') r = PropSim.simulate(a.dayPnLs, a.rules, a.opts);
    else if (m.op === 'match') r = PropSim.matchFirms(a.dayPnLs, a.presets, withMoney(a.opts));
    else if (m.op === 'ev') r = PropSim.expectedValue(a);
    else throw new Error('Unbekannte Operation: ' + m.op);
    self.postMessage({ id: m.id, ok: true, result: r });
  } catch (err) {
    self.postMessage({ id: m.id, ok: false, error: String(err && err.message || err) });
  }
};
