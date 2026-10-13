const fs = require('fs'); const vm = require('vm');
const ctx = { console }; ctx.self = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync('/home/user/Florian/web/js/core.js', 'utf8'), ctx);
const C = ctx.Core;
const p = C.parseCSV(fs.readFileSync(__dirname + '/flows-data/a_tradovate.csv', 'utf8'));
const r = C.mapRows(p.rows, C.guessMapping(p.headers), { decimal: 'auto', dayFirst: true });
for (const t of r.trades.slice(0, 3)) { const d = C.derive(t); console.log(t.symbol, t.pnlOverride, t.multiplier, d.pnl, p.rows[r.trades.indexOf(t)].pnl); }
console.log(C.parseNumber('$(15.00)'), C.parseNumber('$25.50'));
