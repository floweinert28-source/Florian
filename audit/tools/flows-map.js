const fs = require('fs'); const vm = require('vm');
const ctx = { console, self: {} }; ctx.self = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync('/home/user/Florian/web/js/core.js', 'utf8'), ctx);
const C = ctx.Core || ctx.C || Object.values(ctx).find(v => v && v.guessMapping);
for (const f of ['a_tradovate.csv', 'b_deutsch.csv', 'b2_platzhalter.csv', 'c_fehler.csv', 'e_breit.csv']) {
  const p = C.parseCSV(fs.readFileSync(__dirname + '/flows-data/' + f, 'utf8'));
  const m = C.guessMapping(p.headers); console.log('==', f, JSON.stringify(m));
  const r = C.mapRows(p.rows, m, { decimal: 'auto', dayFirst: true }); console.log('  trades', r.trades.length, 'errors', r.errors.length, r.trades[0] && r.trades[0].openedAt, r.trades[0] && r.trades[0].direction);
}
console.log(Object.keys(ctx).filter(k => k !== 'console'));
