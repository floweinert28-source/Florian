/* Web Worker für die Prop-Firm-Simulation: Monte Carlo läuft hier, damit die Oberfläche nicht blockiert.
   Nachricht hinein: { id, op: 'simulate'|'match'|'ev', args }, Nachricht heraus: { id, ok, result | error }. */
/* global importScripts, PropSim, Core, Prop */
importScripts('core.js', 'prop.js', 'propsim.js');
self.onmessage = function (e) {
  var m = e.data || {};
  try {
    var r;
    if (m.op === 'simulate') r = PropSim.simulate(m.args.dayPnLs, m.args.rules, m.args.opts);
    else if (m.op === 'match') r = PropSim.matchFirms(m.args.dayPnLs, m.args.presets, m.args.opts);
    else if (m.op === 'ev') r = PropSim.expectedValue(m.args);
    else throw new Error('Unbekannte Operation: ' + m.op);
    self.postMessage({ id: m.id, ok: true, result: r });
  } catch (err) {
    self.postMessage({ id: m.id, ok: false, error: String(err && err.message || err) });
  }
};
