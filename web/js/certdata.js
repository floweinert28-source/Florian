/* Zertifikat-Karten: Zeitraum, Kennzahlen und Nummer (ohne DOM, auch in Node testbar) */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./core.js'));
  else root.CertData = factory(root.Core);
})(typeof self !== 'undefined' ? self : this, function (C) {
  'use strict';
  const KINDS = {
    day: { title: 'Daily Profit Certificate', label: 'Tag' },
    week: { title: 'Weekly Profit Certificate', label: 'Woche' },
    month: { title: 'Monthly Profit Certificate', label: 'Monat' },
    stats: { title: 'Performance Certificate', label: 'Stats' },
  };
  const DAY = 86400000;
  const pad = n => String(n).padStart(2, '0');
  const monthKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  const parseMonthKey = k => { const [y, m] = String(k).split('-').map(Number); return new Date(y, m - 1, 1); };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const dateDE = (d, o) => new Date(d).toLocaleDateString('de-DE', o);
  const fmtRange = (a, b) => `${dateDE(a, { day: '2-digit', month: '2-digit' })} – ${dateDE(b, { day: '2-digit', month: '2-digit', year: 'numeric' })}`;

  /* Zeitraum aus Art und Bezug (Tag: dayKey, Woche: dayKey, Monat: YYYY-MM, Stats: {from,to} oder null = gesamt) */
  function period(kind, ref) {
    if (kind === 'day') { const d = C.parseDayKey(ref); const from = new Date(d.getFullYear(), d.getMonth(), d.getDate()); return { kind, ref, from, to: from, label: dateDE(from, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), short: dateDE(from, { day: '2-digit', month: '2-digit', year: 'numeric' }) }; }
    if (kind === 'week') { const from = C.weekStart(C.parseDayKey(ref)); const to = addDays(from, 6); return { kind, ref: C.dayKey(from), from, to, label: `KW ${C.isoWeek(from)} · ${fmtRange(from, to)}`, short: `KW ${C.isoWeek(from)}` }; }
    if (kind === 'month') { const from = parseMonthKey(ref); const to = new Date(from.getFullYear(), from.getMonth() + 1, 0); return { kind, ref, from, to, label: dateDE(from, { month: 'long', year: 'numeric' }), short: dateDE(from, { month: 'short', year: 'numeric' }) }; }
    const r = ref && ref.from ? ref : null; if (!r) return { kind, ref: null, from: null, to: null, label: 'Gesamter Zeitraum', short: 'Gesamt' };
    const from = new Date(r.from), to = new Date(r.to); from.setHours(0, 0, 0, 0); to.setHours(0, 0, 0, 0);
    return { kind, ref: { from, to }, from, to, label: fmtRange(from, to), short: fmtRange(from, to) };
  }
  function shift(kind, ref, dir) {
    if (kind === 'day') return C.dayKey(addDays(C.parseDayKey(ref), dir));
    if (kind === 'week') return C.dayKey(addDays(C.weekStart(C.parseDayKey(ref)), 7 * dir));
    if (kind === 'month') { const d = parseMonthKey(ref); return monthKey(new Date(d.getFullYear(), d.getMonth() + dir, 1)); }
    return ref;
  }
  function inPeriod(t, p) { if (!p.from) return true; const k = t.dayKey; return k >= C.dayKey(p.from) && k <= C.dayKey(p.to); }
  const select = (all, p) => C.closedOnly(all.filter(t => inPeriod(t, p))).slice().sort((a, b) => a.close - b.close);

  /* Kennzahlen für die Karte; null bedeutet „nicht berechenbar“ und wird auf der Karte ausgeblendet */
  function compute(kind, list, p) {
    const s = C.summary(list); const days = C.dailyAggregation(list).slice().sort((a, b) => a.key < b.key ? -1 : 1); const sk = C.streaks(list);
    const symCount = new Map(); for (const t of list) symCount.set(t.symbol, (symCount.get(t.symbol) || 0) + 1);
    const symbols = [...symCount.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(x => x[0]);
    const best = list.length ? list.reduce((m, t) => t.pnl > m.pnl ? t : m) : null;
    const green = days.filter(d => d.pnl > 0).length, red = days.filter(d => d.pnl < 0).length;
    const bestDay = days.length ? days.reduce((m, d) => d.pnl > m.pnl ? d : m) : null; const worstDay = days.length ? days.reduce((m, d) => d.pnl < m.pnl ? d : m) : null;
    const out = {
      kind, n: s.n, pnl: s.total, winRate: s.n ? s.winRate : null, avgR: s.rs.length ? s.avgR : null, pf: s.n ? (s.pf == null ? Infinity : s.pf) : null,
      avgWin: s.wins ? s.avgWin : null, avgLoss: s.losses ? s.avgLoss : null, maxDD: s.n ? s.maxDD : null, rSum: s.rs.length === s.n && s.n ? s.rs.reduce((a, b) => a + b, 0) : null,
      bestTrade: best ? { symbol: best.symbol, pnl: best.pnl, r: best.r != null ? best.r : null } : null, symbols,
      tradingDays: days.length, greenDays: green, redDays: red, bestDay: bestDay ? { key: bestDay.key, pnl: bestDay.pnl } : null, worstDay: worstDay ? { key: worstDay.key, pnl: worstDay.pnl } : null,
      maxWinStreak: sk.maxWin || 0, days,
    };
    if (kind === 'week') { const byKey = new Map(days.map(d => [d.key, d.pnl])); out.weekBars = []; for (let i = 0; i < 7; i++) { const d = addDays(p.from, i); const k = C.dayKey(d); const v = byKey.has(k) ? byKey.get(k) : null; if (i < 5 || v != null) out.weekBars.push({ key: k, label: dateDE(d, { weekday: 'short' }).replace('.', ''), pnl: v }); } }
    if (kind === 'month') { const byKey = new Map(days.map(d => [d.key, d.pnl])); const first = p.from; const lead = (first.getDay() + 6) % 7; const nDays = p.to.getDate(); const cells = []; for (let i = 0; i < lead; i++) cells.push(null); for (let d = 1; d <= nDays; d++) { const k = C.dayKey(new Date(first.getFullYear(), first.getMonth(), d)); cells.push({ key: k, day: d, pnl: byKey.has(k) ? byKey.get(k) : null }); } while (cells.length % 7) cells.push(null); out.monthCells = cells; }
    return out;
  }

  /* Zertifikatsnummer: #TJ-JJJJMMTT-XXXX, deterministisch aus Art, Zeitraum und Ergebnis */
  function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h; }
  function certNo(kind, p, m, issued) {
    const d = issued || new Date(); const seed = [kind, p.from ? C.dayKey(p.from) : 'all', p.to ? C.dayKey(p.to) : 'all', Math.round(m.pnl * 100), m.n].join('|');
    const code = hash(seed).toString(36).toUpperCase().padStart(4, '0').slice(-4);
    return `#TJ-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${code}`;
  }
  const defaultRef = (kind, now) => { const d = now || new Date(); return kind === 'month' ? monthKey(d) : kind === 'stats' ? null : C.dayKey(d); };
  return { KINDS, period, shift, select, compute, certNo, defaultRef, monthKey, parseMonthKey };
});
