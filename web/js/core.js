/* Trading Journal – Analytik-Kern (ohne DOM, auch in Node testbar) */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Core = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---------- Hilfen ---------- */
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const sum = arr => arr.reduce((a, b) => a + b, 0);
  const mean = arr => arr.length ? sum(arr) / arr.length : 0;
  const sd = arr => { if (arr.length < 2) return 0; const m = mean(arr); return Math.sqrt(sum(arr.map(x => (x - m) ** 2)) / (arr.length - 1)); };
  const pad2 = n => String(n).padStart(2, '0');
  const dayKey = d => { const x = d instanceof Date ? d : new Date(d); return `${x.getFullYear()}-${pad2(x.getMonth() + 1)}-${pad2(x.getDate())}`; };
  const parseDayKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
  const weekStart = d => { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
  const isoWeek = d => { const x = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const day = x.getUTCDay() || 7; x.setUTCDate(x.getUTCDate() + 4 - day); const y0 = new Date(Date.UTC(x.getUTCFullYear(), 0, 1)); return Math.ceil(((x - y0) / 86400000 + 1) / 7); };
  function mulberry(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  const percentile = (arr, q) => { if (!arr.length) return 0; const s = arr.slice().sort((a, b) => a - b); const pos = q * (s.length - 1), lo = Math.floor(pos), hi = Math.ceil(pos); return lo === hi ? s[lo] : s[lo] + (s[hi] - s[lo]) * (pos - lo); };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const EPS = 0.005;

  /* ---------- Ableitung eines Trades ---------- */
  function derive(t) {
    const dir = t.direction === -1 || t.direction === 'short' ? -1 : 1;
    const open = new Date(t.openedAt);
    const close = t.closedAt ? new Date(t.closedAt) : null;
    const mult = Number(t.multiplier) > 0 ? Number(t.multiplier) : 1;
    const qty = Number(t.quantity) || 0;
    const entry = Number(t.entryPrice);
    const exit = t.exitPrice == null || t.exitPrice === '' ? null : Number(t.exitPrice);
    const fees = Number(t.fees) || 0;
    const closed = !!close && (exit != null || t.pnlOverride != null);
    let gross = closed && exit != null ? (exit - entry) * dir * qty * mult : 0;
    let pnl = closed ? gross - fees : 0;
    if (closed && t.pnlOverride != null && t.pnlOverride !== '') { pnl = Number(t.pnlOverride); gross = pnl + fees; }
    const stop = t.plannedStop != null && t.plannedStop !== '' ? Number(t.plannedStop) : null;
    const pEntry = t.plannedEntry != null && t.plannedEntry !== '' ? Number(t.plannedEntry) : null;
    const pTarget = t.plannedTarget != null && t.plannedTarget !== '' ? Number(t.plannedTarget) : null;
    const stopDist = stop != null ? Math.abs((pEntry != null ? pEntry : entry) - stop) : 0;
    const risk = stopDist > 0 ? stopDist * qty * mult : (Number(t.plannedRisk) || 0);
    const r = closed && risk > 0 ? pnl / risk : null;
    const plannedR = pTarget != null && stop != null && stopDist > 0 ? Math.abs(pTarget - (pEntry != null ? pEntry : entry)) / stopDist : null;
    const holdingMin = closed ? Math.max(0, (close - open) / 60000) : null;
    const maeR = t.mae != null && t.mae !== '' && stopDist > 0 ? (entry - Number(t.mae)) * dir / stopDist : null;
    const mfeR = t.mfe != null && t.mfe !== '' && stopDist > 0 ? (Number(t.mfe) - entry) * dir / stopDist : null;
    const status = !closed ? 'open' : pnl > EPS ? 'win' : pnl < -EPS ? 'loss' : 'be';
    const roi = risk > 0 ? pnl / risk : null;
    return Object.assign({}, t, {
      direction: dir, open, close, closed, gross, pnl, fees, risk, r, plannedR, holdingMin, maeR, mfeR, status, roi,
      stopDist, quantity: qty, entryPrice: entry, exitPrice: exit, multiplier: mult, dayKey: dayKey(open), notional: entry * qty * mult,
      mistakes: t.mistakes || [], emotions: t.emotions || [], rulesBroken: t.rulesBroken || [], screenshots: t.screenshots || [], voiceNotes: t.voiceNotes || [],
      sortTime: (close || open).getTime(),
    });
  }
  const deriveAll = list => list.map(derive);
  const closedOnly = list => list.filter(t => t.closed);

  /* ---------- Zusammenfassung ---------- */
  function summary(list) {
    const c = closedOnly(list).slice().sort((a, b) => a.close - b.close);
    const s = { n: c.length, wins: 0, losses: 0, be: 0, total: 0, gross: 0, fees: 0, gp: 0, gl: 0, rs: [], maxDD: 0, volume: 0, holds: [], plannedRs: [], largestWin: 0, largestLoss: 0, open: list.length - c.length };
    let cum = 0, peak = 0;
    for (const t of c) {
      s.total += t.pnl; s.gross += t.gross; s.fees += t.fees; s.volume += t.quantity;
      if (t.status === 'win') { s.wins++; s.gp += t.pnl; s.largestWin = Math.max(s.largestWin, t.pnl); }
      else if (t.status === 'loss') { s.losses++; s.gl += t.pnl; s.largestLoss = Math.min(s.largestLoss, t.pnl); }
      else s.be++;
      if (t.r != null) s.rs.push(t.r); if (t.plannedR != null) s.plannedRs.push(t.plannedR); if (t.holdingMin != null) s.holds.push(t.holdingMin);
      cum += t.pnl; peak = Math.max(peak, cum); s.maxDD = Math.max(s.maxDD, peak - cum);
    }
    s.winRate = s.n ? s.wins / s.n : 0;
    s.lossRate = s.n ? s.losses / s.n : 0;
    s.pf = s.gl < 0 ? s.gp / -s.gl : (s.gp > 0 ? null : 0);
    s.expectancy = s.n ? s.total / s.n : 0;
    s.avgWin = s.wins ? s.gp / s.wins : 0; s.avgLoss = s.losses ? s.gl / s.losses : 0;
    s.payoff = s.avgLoss < 0 ? s.avgWin / -s.avgLoss : (s.avgWin > 0 ? null : 0);
    s.avgR = s.rs.length ? mean(s.rs) : null; s.avgPlannedR = s.plannedRs.length ? mean(s.plannedRs) : null;
    s.avgHold = s.holds.length ? mean(s.holds) : null;
    s.winHold = mean(c.filter(t => t.status === 'win' && t.holdingMin != null).map(t => t.holdingMin));
    s.lossHold = mean(c.filter(t => t.status === 'loss' && t.holdingMin != null).map(t => t.holdingMin));
    s.tradeExpectancy = s.winRate * s.avgWin + s.lossRate * s.avgLoss;
    return s;
  }
  function streaks(list) {
    const c = closedOnly(list).slice().sort((a, b) => a.close - b.close);
    let cur = 0, kind = null, maxW = 0, maxL = 0, run = 0, runKind = null;
    for (const t of c) {
      if (t.status === 'be') continue;
      if (t.status === runKind) run++; else { run = 1; runKind = t.status; }
      if (runKind === 'win') maxW = Math.max(maxW, run); else maxL = Math.max(maxL, run);
    }
    cur = run; kind = runKind;
    return { current: cur, kind, maxWin: maxW, maxLoss: maxL };
  }

  /* ---------- Tage ---------- */
  function dailyAggregation(list) {
    const m = new Map();
    for (const t of closedOnly(list)) {
      const k = t.dayKey; const e = m.get(k) || { key: k, day: parseDayKey(k), pnl: 0, gross: 0, fees: 0, n: 0, wins: 0, losses: 0, be: 0, volume: 0, trades: [] };
      e.pnl += t.pnl; e.gross += t.gross; e.fees += t.fees; e.n++; e.volume += t.quantity; e[t.status === 'win' ? 'wins' : t.status === 'loss' ? 'losses' : 'be']++; e.trades.push(t); m.set(k, e);
    }
    const days = [...m.values()].sort((a, b) => a.day - b.day);
    for (const d of days) {
      d.trades.sort((a, b) => a.close - b.close);
      let cum = 0, peak = 0, dd = 0; for (const t of d.trades) { cum += t.pnl; peak = Math.max(peak, cum); dd = Math.max(dd, peak - cum); }
      d.intradayDD = dd; d.winRate = d.n ? d.wins / d.n : 0;
      const gp = sum(d.trades.filter(t => t.pnl > 0).map(t => t.pnl)), gl = sum(d.trades.filter(t => t.pnl < 0).map(t => t.pnl));
      d.pf = gl < 0 ? gp / -gl : (gp > 0 ? null : 0); d.gp = gp; d.gl = gl;
    }
    return days;
  }
  function daySummary(days) {
    const winDays = days.filter(d => d.pnl > EPS), lossDays = days.filter(d => d.pnl < -EPS);
    const gp = sum(winDays.map(d => d.pnl)), gl = sum(lossDays.map(d => d.pnl));
    return {
      days: days.length, winDays: winDays.length, lossDays: lossDays.length, dayWinRate: days.length ? winDays.length / days.length : 0,
      avgDayPnL: mean(days.map(d => d.pnl)), avgWinDay: mean(winDays.map(d => d.pnl)), avgLossDay: mean(lossDays.map(d => d.pnl)),
      dayPayoff: lossDays.length && winDays.length ? mean(winDays.map(d => d.pnl)) / -mean(lossDays.map(d => d.pnl)) : null,
      bestDay: days.length ? Math.max(...days.map(d => d.pnl)) : 0, worstDay: days.length ? Math.min(...days.map(d => d.pnl)) : 0,
      avgVolume: mean(days.map(d => d.volume)), avgTrades: mean(days.map(d => d.n)), avgDailyDD: mean(days.map(d => d.intradayDD)), maxDailyDD: days.length ? Math.max(...days.map(d => d.intradayDD)) : 0,
      avgDayWinRate: mean(days.map(d => d.winRate)), dayPF: gl < 0 ? gp / -gl : null,
    };
  }
  function equityCurve(list) { let e = 0; return closedOnly(list).slice().sort((a, b) => a.close - b.close).map(t => { e += t.pnl; return { date: t.close, equity: e, pnl: t.pnl, t }; }); }
  function cumulativeByDay(days) { let c = 0; return days.map(d => { c += d.pnl; return { day: d.day, key: d.key, cum: c, pnl: d.pnl, n: d.n }; }); }
  function calendarMonth(days, year, month) {
    const map = new Map(days.map(d => [d.key, d]));
    const first = new Date(year, month, 1), count = new Date(year, month + 1, 0).getDate();
    const lead = (first.getDay() + 6) % 7; const cells = Array(lead).fill(null);
    for (let i = 1; i <= count; i++) cells.push(new Date(year, month, i)); while (cells.length % 7) cells.push(null);
    const weeks = [];
    for (let w = 0; w < cells.length; w += 7) {
      const wk = cells.slice(w, w + 7).map(d => d ? { date: d, key: dayKey(d), entry: map.get(dayKey(d)) || null } : null);
      const es = wk.filter(c => c && c.entry).map(c => c.entry);
      weeks.push({ cells: wk, pnl: sum(es.map(e => e.pnl)), n: sum(es.map(e => e.n)), days: es.length, winRate: es.length ? es.filter(e => e.pnl > EPS).length / es.length : 0, index: weeks.length + 1 });
    }
    return weeks;
  }

  /* ---------- Disziplin ---------- */
  function discipline(t) {
    const hasPlan = [t.plannedEntry, t.plannedStop, t.plannedTarget].filter(v => v != null && v !== '').length;
    const planF = hasPlan / 3;
    let entryF = 0, dev = null;
    if (t.plannedEntry != null && t.plannedEntry !== '' && t.stopDist > 0) { dev = Math.abs(t.entryPrice - Number(t.plannedEntry)) / t.stopDist; entryF = clamp(1 - Math.max(0, dev - 0.25) / 0.75, 0, 1); }
    let stopF = 0;
    if (t.plannedStop != null && t.plannedStop !== '') { stopF = 1; if (t.closed && t.status === 'loss' && t.r != null) stopF = clamp(1 - Math.max(0, -1.15 - t.r) / 0.85, 0, 1); }
    const comps = [
      { key: 'plan', label: 'Plan vollständig (Einstieg, Stop, Ziel)', f: planF, w: 25 },
      { key: 'entry', label: dev == null ? 'Einstieg nahe am Plan' : `Einstieg nahe am Plan (${dev.toFixed(2).replace('.', ',')} R Abweichung)`, f: entryF, w: 20 },
      { key: 'stop', label: 'Stop eingehalten', f: stopF, w: 25 },
      { key: 'mistakes', label: 'Keine Fehler-Tags', f: t.mistakes.length ? 0 : 1, w: 20 },
      { key: 'rules', label: 'Regeln eingehalten', f: t.rulesBroken.length ? 0 : 1, w: 10 },
    ];
    return { comps, score: Math.round(sum(comps.map(c => c.f * c.w))) };
  }
  const avgDiscipline = list => { const c = closedOnly(list); return c.length ? Math.round(mean(c.map(t => discipline(t).score))) : null; };
  function weeklyDiscipline(list, weeks = 8) {
    const m = new Map();
    for (const t of closedOnly(list)) { const k = weekStart(t.open).getTime(); (m.get(k) || m.set(k, []).get(k)).push(discipline(t).score); }
    return [...m.entries()].sort((a, b) => a[0] - b[0]).slice(-weeks).map(([k, v]) => ({ week: new Date(k), score: mean(v), n: v.length }));
  }

  /* ---------- Fehlerkosten ---------- */
  function mistakeReport(list) {
    const c = closedOnly(list); const compliant = c.filter(t => !t.mistakes.length && !t.rulesBroken.length);
    const items = new Map();
    for (const t of c) for (const m of [...t.mistakes, ...t.rulesBroken.map(r => 'Regel: ' + r)]) { const e = items.get(m) || { name: m, n: 0, total: 0, wins: 0 }; e.n++; e.total += t.pnl; if (t.pnl > 0) e.wins++; items.set(m, e); }
    const actual = sum(c.map(t => t.pnl)), comp = sum(compliant.map(t => t.pnl));
    return { actual, compliant: comp, cost: actual - comp, n: c.length, compliantN: compliant.length, mistakeN: c.length - compliant.length, items: [...items.values()].sort((a, b) => a.total - b.total), compliantSummary: summary(compliant), mistakeSummary: summary(c.filter(t => t.mistakes.length || t.rulesBroken.length)) };
  }

  /* ---------- Gruppierungen ---------- */
  function groupBy(list, keyFn, order) {
    const m = new Map();
    for (const t of closedOnly(list)) for (const k of [].concat(keyFn(t))) { if (k == null || k === '') continue; (m.get(k) || m.set(k, []).get(k)).push(t); }
    let out = [...m.entries()].map(([k, v]) => ({ key: k, trades: v, s: summary(v) }));
    if (order) out.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key)); else out.sort((a, b) => b.s.total - a.s.total);
    return out;
  }
  const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const HOUR_BUCKETS = ['vor 8', '8–9', '9–10', '10–11', '11–12', '12–13', '13–14', '14–15', '15–16', '16–17', '17–18', '18–20', 'ab 20'];
  const hourBucket = h => h < 8 ? 'vor 8' : h < 18 ? `${h}–${h + 1}` : h < 20 ? '18–20' : 'ab 20';
  const HOLD_BUCKETS = ['< 5 min', '5–15 min', '15–30 min', '30–60 min', '1–2 h', '2–4 h', '> 4 h'];
  const holdBucket = m => m < 5 ? '< 5 min' : m < 15 ? '5–15 min' : m < 30 ? '15–30 min' : m < 60 ? '30–60 min' : m < 120 ? '1–2 h' : m < 240 ? '2–4 h' : '> 4 h';
  function timeAnalysis(list) {
    return {
      weekdays: groupBy(list, t => WEEKDAYS[(t.open.getDay() + 6) % 7], WEEKDAYS),
      hours: groupBy(list, t => hourBucket(t.open.getHours()), HOUR_BUCKETS),
      holding: groupBy(list, t => t.holdingMin == null ? null : holdBucket(t.holdingMin), HOLD_BUCKETS),
    };
  }
  function regimeAnalysis(list, regimeByDay) {
    const get = t => regimeByDay[t.dayKey];
    return {
      trend: groupBy(list, t => (get(t) || {}).trend || null, ['trending', 'ranging']),
      vol: groupBy(list, t => (get(t) || {}).vol || null, ['low', 'normal', 'high']),
      combined: groupBy(list, t => { const r = get(t); return r && r.trend && r.vol ? `${r.trend}|${r.vol}` : null; }),
      coverage: closedOnly(list).filter(t => get(t) && get(t).trend).length,
    };
  }

  /* ---------- Edge-Check ---------- */
  function tCrit(n) { const df = n - 1; return df >= 120 ? 1.98 : df >= 60 ? 2.0 : df >= 40 ? 2.02 : df >= 30 ? 2.04 : df >= 20 ? 2.09 : df >= 15 ? 2.13 : df >= 10 ? 2.23 : 2.45; }
  function edge(list, window = 20, minSample = 20) {
    const c = closedOnly(list).filter(t => t.r != null).sort((a, b) => a.close - b.close); const v = c.map(t => t.r); const n = v.length;
    const m = mean(v), s = sd(v), se = n > 1 ? s / Math.sqrt(n) : 0; const tc = tCrit(Math.max(n, 2));
    const low = m - tc * se, high = m + tc * se;
    const verdict = n < minSample ? 'insufficient' : low > 0 ? 'positive' : high < 0 ? 'negative' : 'unproven';
    const rolling = [];
    if (n >= window) { let run = sum(v.slice(0, window)); rolling.push({ i: window, v: run / window }); for (let i = window; i < n; i++) { run += v[i] - v[i - window]; rolling.push({ i: i + 1, v: run / window }); } }
    const recent = n >= window ? mean(v.slice(-window)) : null;
    const deteriorating = recent != null && n >= 2 * window && m > 0 && (recent < 0 || recent < 0.5 * m);
    const required = Math.abs(m) > 1e-9 && s > 0 ? Math.ceil((1.96 * s / Math.abs(m)) ** 2) : null;
    return { n, mean: m, sd: s, se, low, high, verdict, rolling, recent, deteriorating, required, window, minSample };
  }

  /* ---------- Monte Carlo ---------- */
  function monteCarlo(list, opts = {}) {
    const p = closedOnly(list).map(t => t.pnl); if (p.length < 10) return null;
    const runs = opts.runs || 1000, horizon = opts.horizon || Math.min(Math.max(p.length, 50), 250), start = opts.account || 10000, ruinPct = opts.ruinPct == null ? 0.3 : opts.ruinPct;
    const rng = mulberry(opts.seed == null ? 7 : opts.seed); const ruin = start * (1 - ruinPct);
    const finals = [], dds = [], curves = []; let ruined = 0, prof = 0;
    for (let r = 0; r < runs; r++) {
      let e = start, peak = start, dd = 0, hit = false; const curve = r < 25 ? [start] : null;
      for (let i = 0; i < horizon; i++) { e += p[Math.floor(rng() * p.length)]; peak = Math.max(peak, e); dd = Math.max(dd, peak - e); if (e <= ruin) hit = true; if (curve) curve.push(e); }
      finals.push(e); dds.push(dd); if (hit) ruined++; if (e > start) prof++; if (curve) curves.push(curve);
    }
    const fr = dds.map(d => d / start); const min = 0, max = Math.max(...fr) || 0.01, bins = 18, w = (max - min) / bins || 1e-9;
    const hist = Array.from({ length: bins }, (_, i) => ({ lo: min + i * w, hi: min + (i + 1) * w, n: 0 })); for (const f of fr) hist[Math.min(bins - 1, Math.floor((f - min) / w))].n++;
    return { runs, horizon, start, ruinPct, ruin: ruined / runs, prob: prof / runs, final: { p5: percentile(finals, .05), p25: percentile(finals, .25), p50: percentile(finals, .5), p75: percentile(finals, .75), p95: percentile(finals, .95) }, dd: { p50: percentile(dds, .5), p95: percentile(dds, .95), worst: Math.max(...dds) }, ddF: { p50: percentile(fr, .5), p95: percentile(fr, .95), worst: max }, curves, hist };
  }

  /* ---------- Zustand (Check-ins) ---------- */
  function pearson(xs, ys) { const n = xs.length; if (n < 3) return null; const mx = mean(xs), my = mean(ys); let num = 0, dx = 0, dy = 0; for (let i = 0; i < n; i++) { num += (xs[i] - mx) * (ys[i] - my); dx += (xs[i] - mx) ** 2; dy += (ys[i] - my) ** 2; } return dx > 0 && dy > 0 ? num / Math.sqrt(dx * dy) : null; }
  function stateAnalysis(days, checkInByDay) {
    const pairs = days.map(d => ({ d, c: checkInByDay[d.key] })).filter(p => p.c);
    const metric = (k, buckets) => {
      const xs = pairs.filter(p => p.c[k] != null).map(p => Number(p.c[k])), ys = pairs.filter(p => p.c[k] != null).map(p => p.d.pnl);
      const groups = buckets.map(b => { const sel = pairs.filter(p => p.c[k] != null && b.test(Number(p.c[k]))); return { label: b.label, n: sel.length, avg: mean(sel.map(p => p.d.pnl)), winRate: sel.length ? sel.filter(p => p.d.pnl > EPS).length / sel.length : 0 }; });
      return { r: pearson(xs, ys), n: xs.length, groups };
    };
    return {
      n: pairs.length,
      sleep: metric('sleep', [{ label: '< 6 h', test: v => v < 6 }, { label: '6–7,5 h', test: v => v >= 6 && v < 7.5 }, { label: '≥ 7,5 h', test: v => v >= 7.5 }]),
      stress: metric('stress', [{ label: 'niedrig (1–2)', test: v => v <= 2 }, { label: 'mittel (3)', test: v => v === 3 }, { label: 'hoch (4–5)', test: v => v >= 4 }]),
      mood: metric('mood', [{ label: 'schlecht (1–2)', test: v => v <= 2 }, { label: 'neutral (3)', test: v => v === 3 }, { label: 'gut (4–5)', test: v => v >= 4 }]),
    };
  }

  /* ---------- Score ---------- */
  const SCORE_AXES = { winRate: 'Win-Rate', profitFactor: 'Profit-Faktor', payoff: 'Gewinn/Verlust', consistency: 'Konsistenz', rules: 'Regeltreue', drawdown: 'Drawdown' };
  function traderScore(list, account) {
    const s = summary(list); const acct = account > 0 ? account : 10000;
    if (!s.n) return { overall: 0, axes: Object.keys(SCORE_AXES).map(k => ({ key: k, label: SCORE_AXES[k], score: 0, text: '—' })) };
    const days = dailyAggregation(list); const profitDays = days.filter(d => d.pnl > 0); const gross = sum(profitDays.map(d => d.pnl)); const best = profitDays.length ? Math.max(...profitDays.map(d => d.pnl)) : 0;
    const consistency = days.length >= 3 && profitDays.length ? clamp((1 - (gross > 0 ? best / gross : 1)) * 0.6 + profitDays.length / days.length * 0.4, 0, 1) : 0;
    const rules = (avgDiscipline(list) || 0) / 100; const ddF = s.maxDD / acct;
    const fmtF = v => v == null ? '∞' : v.toFixed(2).replace('.', ',');
    const axes = [
      { key: 'winRate', score: clamp(s.winRate / 0.7, 0, 1), text: Math.round(s.winRate * 100) + ' %' },
      { key: 'profitFactor', score: s.pf == null ? 1 : clamp((s.pf - 0.5) / 2.5, 0, 1), text: fmtF(s.pf) },
      { key: 'payoff', score: s.payoff == null ? 1 : clamp(s.payoff / 3, 0, 1), text: fmtF(s.payoff) },
      { key: 'consistency', score: consistency, text: Math.round(consistency * 100) + ' %' },
      { key: 'rules', score: rules, text: Math.round(rules * 100) + ' %' },
      { key: 'drawdown', score: 1 - clamp(ddF / 0.25, 0, 1), text: (ddF * 100).toFixed(1).replace('.', ',') + ' %' },
    ].map(a => Object.assign(a, { label: SCORE_AXES[a.key] }));
    return { overall: Math.round(mean(axes.map(a => a.score)) * 100), axes };
  }

  /* ---------- Tilt ---------- */
  function tiltCheck(todayTrades, opts = {}) {
    const account = opts.account || 10000, limitPct = opts.dailyLossLimitPct == null ? 0.03 : opts.dailyLossLimitPct;
    const list = todayTrades.slice().sort((a, b) => a.open - b.open); const warnings = [];
    const closed = list.filter(t => t.closed).sort((a, b) => a.close - b.close);
    let streak = 0, maxStreak = 0; for (const t of closed) { streak = t.status === 'loss' ? streak + 1 : 0; maxStreak = Math.max(maxStreak, streak); }
    if (streak >= 3) warnings.push({ kind: 'lossStreak', severity: 'high', title: `${streak} Verluste in Folge`, text: 'Verlustserien sind der häufigste Auslöser für Tilt. Mach eine Pause, bevor du den nächsten Trade eingehst.' });
    for (let i = 1; i < list.length; i++) {
      const prev = list[i - 1], cur = list[i];
      if (prev.closed && prev.status === 'loss' && prev.risk > 0 && cur.risk > prev.risk * 1.5) { warnings.push({ kind: 'sizeEscalation', severity: 'high', title: 'Positionsgröße nach Verlust erhöht', text: `Risiko von ${Math.round(prev.risk)} auf ${Math.round(cur.risk)} erhöht (${cur.symbol}). Das ist ein typisches Muster, um Verluste zurückzuholen.` }); break; }
    }
    for (let i = 2; i < list.length; i++) { if (list[i].open - list[i - 2].open <= 15 * 60000) { warnings.push({ kind: 'rapidFire', severity: 'medium', title: 'Drei Trades in 15 Minuten', text: 'Sehr schnelle Abfolge von Trades. Prüfe, ob jeder davon wirklich ein Setup nach Plan war.' }); break; } }
    for (let i = 1; i < list.length; i++) {
      const prev = list[i - 1], cur = list[i];
      if (prev.closed && prev.status === 'loss' && prev.symbol === cur.symbol && cur.open - prev.close <= 10 * 60000 && cur.open >= prev.close) { warnings.push({ kind: 'revenge', severity: 'high', title: `Sofortiger Wiedereinstieg in ${cur.symbol}`, text: 'Weniger als zehn Minuten nach einem Verlust wieder im selben Markt. Das sieht nach Revenge-Trading aus.' }); break; }
    }
    const dayPnL = sum(closed.map(t => t.pnl));
    if (limitPct > 0 && dayPnL <= -account * limitPct) warnings.push({ kind: 'dailyLoss', severity: 'critical', title: 'Tagesverlustlimit erreicht', text: `Heute ${Math.round(dayPnL)} Verlust, das Limit liegt bei ${Math.round(account * limitPct)}. Der Handelstag ist vorbei.` });
    return { warnings, streak, dayPnL, n: list.length };
  }
  function tiltProfile(list) {
    const days = dailyAggregation(list); let withStreak = 0, losing = 0, afterStreakPnL = 0;
    for (const d of days) { let s = 0, found = false; for (const t of d.trades) { if (found) afterStreakPnL += t.pnl; s = t.status === 'loss' ? s + 1 : 0; if (s >= 3 && !found) found = true; } if (found) { withStreak++; if (d.pnl < 0) losing++; } }
    return { days: days.length, withStreak, losing, afterStreakPnL };
  }

  /* ---------- 16 Kennzahlen ---------- */
  function stats16(list) {
    const s = summary(list), days = dailyAggregation(list), d = daySummary(days);
    return { s, d, items: [
      { key: 'netPnL', label: 'Netto-P&L', type: 'cur', v: s.total, info: 'Summe aller abgeschlossenen Trades nach Gebühren.' },
      { key: 'expectancy', label: 'Trade-Erwartungswert', type: 'cur', v: s.tradeExpectancy, info: 'Win-Rate × Ø Gewinn + Verlustrate × Ø Verlust.' },
      { key: 'avgTrade', label: 'Ø Netto-P&L pro Trade', type: 'cur', v: s.expectancy, info: 'Netto-P&L geteilt durch Anzahl der Trades.' },
      { key: 'avgVolume', label: 'Ø Tagesvolumen', type: 'num', v: d.avgVolume, info: 'Gehandelte Stückzahl pro Handelstag.' },
      { key: 'winRate', label: 'Win-Rate', type: 'pct', v: s.winRate, info: 'Anteil der Gewinn-Trades an allen abgeschlossenen Trades.' },
      { key: 'dayPayoff', label: 'Ø Tages-Gewinn/Verlust', type: 'factor', v: d.dayPayoff, info: 'Durchschnittlicher Gewinntag geteilt durch durchschnittlichen Verlusttag.' },
      { key: 'avgDay', label: 'Ø Tages-Netto-P&L', type: 'cur', v: d.avgDayPnL, info: 'Netto-P&L pro Handelstag.' },
      { key: 'days', label: 'Handelstage', type: 'int', v: d.days, info: 'Tage mit mindestens einem abgeschlossenen Trade.' },
      { key: 'dayWinRate', label: 'Ø Tages-Win-Rate', type: 'pct', v: d.dayWinRate, info: 'Anteil der Tage mit positivem Ergebnis.' },
      { key: 'payoff', label: 'Ø Trade-Gewinn/Verlust', type: 'factor', v: s.payoff, info: 'Durchschnittlicher Gewinn geteilt durch durchschnittlichen Verlust.' },
      { key: 'plannedR', label: 'Ø geplantes R-Multiple', type: 'r', v: s.avgPlannedR, info: 'Geplantes Chance-Risiko-Verhältnis aus Einstieg, Stop und Ziel.' },
      { key: 'maxDayDD', label: 'Max. Tages-Drawdown', type: 'curNeg', v: d.maxDailyDD, info: 'Größter Rückgang vom Tageshoch innerhalb eines Tages.' },
      { key: 'pf', label: 'Profit-Faktor', type: 'factor', v: s.pf, info: 'Bruttogewinn geteilt durch Bruttoverlust.' },
      { key: 'hold', label: 'Ø Haltedauer', type: 'dur', v: s.avgHold, info: 'Durchschnittliche Zeit zwischen Einstieg und Ausstieg.' },
      { key: 'realizedR', label: 'Ø realisiertes R-Multiple', type: 'r', v: s.avgR, info: 'Erzielter Gewinn oder Verlust im Verhältnis zum geplanten Risiko.' },
      { key: 'avgDayDD', label: 'Ø Tages-Drawdown', type: 'curNeg', v: d.avgDailyDD, info: 'Durchschnittlicher Rückgang vom Tageshoch.' },
    ] };
  }

  /* ---------- Fortschritt ---------- */
  function activityDays(list, checkInByDay, notesByDay, weeks = 26) {
    const days = dailyAggregation(list); const map = new Map(days.map(d => [d.key, d]));
    const end = new Date(); end.setHours(0, 0, 0, 0); const start = weekStart(end); start.setDate(start.getDate() - (weeks - 1) * 7);
    const out = []; const c = new Date(start);
    while (c <= end) { const k = dayKey(c); const e = map.get(k); out.push({ key: k, date: new Date(c), pnl: e ? e.pnl : 0, n: e ? e.n : 0, checkIn: !!(checkInByDay && checkInByDay[k]), note: !!(notesByDay && notesByDay[k]) }); c.setDate(c.getDate() + 1); }
    return out;
  }
  function journalStreak(activity) {
    let streak = 0; const arr = activity.slice().reverse(); let i = 0;
    if (arr.length && !(arr[0].n || arr[0].checkIn || arr[0].note)) i = 1;
    for (; i < arr.length; i++) { const a = arr[i]; const wd = a.date.getDay(); if (a.n || a.checkIn || a.note) streak++; else if (wd === 0 || wd === 6) continue; else break; }
    return streak;
  }

  /* ---------- CSV ---------- */
  function parseCSV(text) {
    text = text.replace(/^﻿/, '');
    const firstLine = text.split(/\r?\n/).find(l => l.trim()) || '';
    const counts = [',', ';', '\t', '|'].map(d => [d, (firstLine.match(new RegExp('\\' + d, 'g')) || []).length]);
    const delimiter = counts.sort((a, b) => b[1] - a[1])[0][1] > 0 ? counts[0][0] : ',';
    const rows = []; let row = [], field = '', inQ = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (inQ) { if (ch === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; } else field += ch; continue; }
      if (ch === '"') inQ = true;
      else if (ch === delimiter) { row.push(field); field = ''; }
      else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(field); field = ''; if (row.some(f => f.trim() !== '')) rows.push(row); row = []; }
      else field += ch;
    }
    row.push(field); if (row.some(f => f.trim() !== '')) rows.push(row);
    const headers = rows.length ? rows[0].map(h => h.trim()) : [];
    return { delimiter, headers, rows: rows.slice(1).map(r => { const o = {}; headers.forEach((h, i) => { o[h] = (r[i] == null ? '' : r[i]).trim(); }); return o; }) };
  }
  const FIELDS = {
    symbol: { label: 'Symbol', required: true, syn: ['symbol', 'ticker', 'instrument', 'market', 'asset', 'wert', 'wertpapier', 'kontrakt', 'contract', 'produkt', 'product', 'underlying', 'basiswert', 'pair', 'paar'] },
    direction: { label: 'Richtung', syn: ['direction', 'side', 'richtung', 'type', 'typ', 'longshort', 'position', 'buysell', 'bs', 'action', 'aktion', 'order'] },
    openedAt: { label: 'Eröffnung (Datum/Zeit)', required: true, syn: ['opendate', 'opentime', 'opened', 'entrydate', 'entrytime', 'datum', 'date', 'time', 'zeit', 'eröffnet', 'einstieg', 'open', 'entrytimestamp', 'opendatetime', 'datetime', 'boughttimestamp', 'buytime', 'einstiegszeit', 'einstiegsdatum', 'opening', 'start', 'opentimestamp'] },
    closedAt: { label: 'Schluss (Datum/Zeit)', syn: ['closedate', 'closetime', 'closed', 'exitdate', 'exittime', 'geschlossen', 'ausstieg', 'close', 'exittimestamp', 'closedatetime', 'selltime', 'soldtimestamp', 'ausstiegszeit', 'ausstiegsdatum', 'closing', 'end', 'ende', 'closetimestamp'] },
    entryPrice: { label: 'Einstiegskurs', required: true, syn: ['entryprice', 'entry', 'openprice', 'einstiegskurs', 'einstiegspreis', 'price', 'kurs', 'preis', 'buyprice', 'avgentry', 'averageentry', 'fill', 'fillprice', 'kaufkurs', 'open price', 'openingprice'] },
    exitPrice: { label: 'Ausstiegskurs', syn: ['exitprice', 'exit', 'closeprice', 'ausstiegskurs', 'ausstiegspreis', 'sellprice', 'avgexit', 'averageexit', 'verkaufskurs', 'closingprice'] },
    quantity: { label: 'Stückzahl', syn: ['quantity', 'qty', 'size', 'amount', 'volume', 'menge', 'stück', 'stueck', 'anzahl', 'contracts', 'kontrakte', 'lots', 'lot', 'shares', 'units', 'positionsgröße', 'positionsgroesse', 'positionsize', 'filledqty'] },
    fees: { label: 'Gebühren', syn: ['fees', 'fee', 'commission', 'commissions', 'gebühren', 'gebuehren', 'gebühr', 'kommission', 'costs', 'kosten', 'comm', 'totalfees'] },
    plannedStop: { label: 'Stop', syn: ['stop', 'stoploss', 'sl', 'stopp', 'stopprice', 'initialstop', 'stopkurs'] },
    plannedTarget: { label: 'Ziel', syn: ['target', 'takeprofit', 'tp', 'ziel', 'kursziel', 'targetprice', 'zielkurs'] },
    pnl: { label: 'Netto-P&L (falls vorhanden)', syn: ['pnl', 'pl', 'profit', 'net', 'netpnl', 'netpl', 'gewinn', 'ergebnis', 'realized', 'realizedpnl', 'result', 'netto', 'profitloss', 'gewinnverlust', 'gv', 'realisiert', 'netprofit', 'nettoergebnis'] },
    setup: { label: 'Setup', syn: ['setup', 'playbook', 'pattern', 'muster', 'system', 'tag', 'tags', 'model', 'modell'] },
    strategy: { label: 'Strategie', syn: ['strategy', 'strategie', 'plan'] },
    notes: { label: 'Notizen', syn: ['notes', 'note', 'comment', 'comments', 'notiz', 'notizen', 'kommentar', 'bemerkung', 'description', 'beschreibung', 'memo'] },
    multiplier: { label: 'Punktwert', syn: ['multiplier', 'pointvalue', 'contractsize', 'multiplikator', 'punktwert', 'tickvalue', 'kontraktgröße', 'kontraktgroesse'] },
  };
  const normHeader = h => String(h).toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]/g, '');
  function guessMapping(headers) {
    const mapping = {}; const used = new Set();
    const norm = headers.map(h => normHeader(h));
    const synN = {}; for (const [f, def] of Object.entries(FIELDS)) synN[f] = def.syn.map(normHeader);
    for (const f of Object.keys(FIELDS)) { const idx = norm.findIndex((n, i) => !used.has(i) && synN[f].includes(n)); if (idx >= 0) { mapping[f] = headers[idx]; used.add(idx); } }
    for (const f of Object.keys(FIELDS)) { if (mapping[f]) continue; const idx = norm.findIndex((n, i) => !used.has(i) && synN[f].some(s => s.length >= 4 && (n.includes(s) || s.includes(n)) && n.length >= 3)); if (idx >= 0) { mapping[f] = headers[idx]; used.add(idx); } }
    return mapping;
  }
  function parseNumber(str, decimal = 'auto') {
    if (str == null) return null; let s = String(str).trim(); if (!s) return null;
    let neg = false; if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1); }
    s = s.replace(/[€$£¥]|EUR|USD|CHF|GBP|\s|'/g, '').replace(/[−–]/g, '-');
    if (s.endsWith('-')) { neg = true; s = s.slice(0, -1); }
    if (s.startsWith('-')) { neg = !neg; s = s.slice(1); } else if (s.startsWith('+')) s = s.slice(1);
    const hasC = s.includes(','), hasD = s.includes('.');
    if (decimal === ',') s = s.replace(/\./g, '').replace(',', '.');
    else if (decimal === '.') s = s.replace(/,/g, '');
    else if (hasC && hasD) { s = s.lastIndexOf(',') > s.lastIndexOf('.') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, ''); }
    else if (hasC) { s = /^\d{1,3}(,\d{3}){2,}$/.test(s) ? s.replace(/,/g, '') : s.replace(/,/g, '.'); }
    else if (hasD) { if (/^\d{1,3}(\.\d{3}){2,}$/.test(s)) s = s.replace(/\./g, ''); }
    const v = Number(s); if (!isFinite(v)) return null; return neg ? -v : v;
  }
  function parseDate(str, dayFirst = true) {
    if (str == null) return null; const s = String(str).trim(); if (!s) return null;
    let m;
    if ((m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{1,2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/))) {
      if (m[7]) { const d = new Date(s.replace(' ', 'T')); return isNaN(d) ? null : d; }
      return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
    }
    if ((m = s.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/))) return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
    if ((m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})(?:,?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/))) { const y = m[3].length === 2 ? 2000 + +m[3] : +m[3]; return new Date(y, +m[2] - 1, +m[1], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0)); }
    if ((m = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})(?:,?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp][Mm])?)?$/))) {
      const y = m[3].length === 2 ? 2000 + +m[3] : +m[3]; let a = +m[1], b = +m[2]; let day, mon;
      if (a > 12) { day = a; mon = b; } else if (b > 12) { mon = a; day = b; } else if (dayFirst) { day = a; mon = b; } else { mon = a; day = b; }
      let h = +(m[4] || 0); if (m[7]) { const pm = m[7].toLowerCase() === 'pm'; if (pm && h < 12) h += 12; if (!pm && h === 12) h = 0; }
      return new Date(y, mon - 1, day, h, +(m[5] || 0), +(m[6] || 0));
    }
    if (/^\d{13}$/.test(s)) return new Date(+s); if (/^\d{10}$/.test(s)) return new Date(+s * 1000);
    const d = new Date(s); return isNaN(d) ? null : d;
  }
  function parseDirection(str) { const s = String(str || '').trim().toLowerCase(); if (!s) return 1; if (/^(short|sell|verkauf|s|sold|-1|short sell|sellshort|sell short)$/.test(s) || s.startsWith('short') || s.startsWith('sell') || s.startsWith('verk')) return -1; return 1; }
  function mapRows(rows, mapping, opts = {}) {
    const trades = [], errors = []; const dec = opts.decimal || 'auto', dayFirst = opts.dayFirst !== false;
    const get = (r, f) => mapping[f] ? r[mapping[f]] : '';
    rows.forEach((r, i) => {
      const line = i + 2; const symbol = String(get(r, 'symbol') || '').trim().toUpperCase();
      const opened = parseDate(get(r, 'openedAt'), dayFirst); const entry = parseNumber(get(r, 'entryPrice'), dec);
      if (!symbol) return errors.push({ line, msg: 'Symbol fehlt' });
      if (!opened) return errors.push({ line, msg: `Eröffnungszeit nicht lesbar: „${get(r, 'openedAt')}“` });
      if (entry == null) return errors.push({ line, msg: `Einstiegskurs nicht lesbar: „${get(r, 'entryPrice')}“` });
      const closed = mapping.closedAt ? parseDate(get(r, 'closedAt'), dayFirst) : null;
      const exit = mapping.exitPrice ? parseNumber(get(r, 'exitPrice'), dec) : null;
      const pnl = mapping.pnl ? parseNumber(get(r, 'pnl'), dec) : null;
      const qty = mapping.quantity ? parseNumber(get(r, 'quantity'), dec) : null;
      const t = {
        id: uid(), symbol, direction: mapping.direction ? parseDirection(get(r, 'direction')) : 1, openedAt: opened.toISOString(),
        closedAt: closed ? closed.toISOString() : (exit != null || pnl != null ? opened.toISOString() : null),
        entryPrice: entry, exitPrice: exit, quantity: qty == null ? 1 : Math.abs(qty), fees: mapping.fees ? Math.abs(parseNumber(get(r, 'fees'), dec) || 0) : 0,
        multiplier: mapping.multiplier ? (parseNumber(get(r, 'multiplier'), dec) || 1) : 1,
        plannedStop: mapping.plannedStop ? parseNumber(get(r, 'plannedStop'), dec) : null, plannedTarget: mapping.plannedTarget ? parseNumber(get(r, 'plannedTarget'), dec) : null,
        plannedEntry: null, setup: mapping.setup ? String(get(r, 'setup') || '').trim() : '', strategy: mapping.strategy ? String(get(r, 'strategy') || '').trim() : '',
        notes: mapping.notes ? String(get(r, 'notes') || '') : '', mistakes: [], emotions: [], rulesBroken: [], screenshots: [], voiceNotes: [], rating: null,
        pnlOverride: pnl != null && exit == null ? pnl : null, imported: true, createdAt: new Date().toISOString(),
      };
      if (qty != null && qty < 0 && !mapping.direction) t.direction = -1;
      if (pnl != null && exit != null) { const d = derive(t); if (Math.abs(d.pnl - pnl) > Math.max(1, Math.abs(pnl) * 0.02)) t.pnlOverride = pnl; }
      trades.push(t);
    });
    return { trades, errors };
  }
  function dedupeKey(t) { return `${t.symbol}|${t.openedAt}|${Number(t.entryPrice)}|${Number(t.quantity)}`; }

  /* ---------- Stimmung ---------- */
  const POS = ['ruhig', 'fokussiert', 'sauber', 'gut', 'geduldig', 'diszipliniert', 'klar', 'zufrieden', 'entspannt', 'gelassen', 'sicher', 'stark', 'perfekt', 'super', 'top', 'plan', 'geduld', 'konzentriert', 'calm', 'focused', 'good', 'patient', 'clean', 'confident', 'relaxed', 'disciplined', 'great', 'solid', 'happy', 'clear'];
  const NEG = ['wütend', 'wut', 'ärger', 'ärgerlich', 'frust', 'frustriert', 'angst', 'ängstlich', 'gier', 'gierig', 'unruhig', 'nervös', 'rache', 'revenge', 'panik', 'dumm', 'schlecht', 'müde', 'stress', 'gestresst', 'fomo', 'hektisch', 'unsicher', 'zweifel', 'verzweifelt', 'sauer', 'genervt', 'übermütig', 'euphorisch', 'angry', 'fear', 'greedy', 'frustrated', 'tired', 'stressed', 'anxious', 'nervous', 'panic', 'stupid', 'bad', 'doubt', 'tilt', 'zittrig', 'chaos', 'chaotisch'];
  function sentiment(text) {
    const words = String(text || '').toLowerCase().replace(/[^a-zäöüß\s]/g, ' ').split(/\s+/).filter(Boolean);
    let p = 0, n = 0; for (const w of words) { if (POS.some(x => w.startsWith(x))) p++; if (NEG.some(x => w.startsWith(x))) n++; }
    const score = p + n ? (p - n) / (p + n) : 0;
    return { score, label: score > 0.2 ? 'positiv' : score < -0.2 ? 'negativ' : 'neutral', pos: p, neg: n };
  }

  /* ---------- Coach: regelbasierte Einsichten ---------- */
  function insights(ctx) {
    const { trades, account, regimeByDay, checkInByDay } = ctx; const out = []; const c = closedOnly(trades);
    if (c.length < 5) { out.push({ kind: 'info', title: 'Noch zu wenig Daten', text: 'Ab etwa 20 abgeschlossenen Trades werden Muster sichtbar. Logge weiter oder importiere eine CSV.' }); return out; }
    const cur = v => (v < 0 ? '−' : '') + Math.abs(Math.round(v)).toLocaleString('de-DE') + ' ' + (ctx.currency || '€');
    const pct = v => Math.round(v * 100) + ' %';
    const mr = mistakeReport(c);
    if (mr.mistakeN >= 3 && mr.cost < 0) out.push({ kind: 'loss', title: `Fehler haben dich ${cur(-mr.cost)} gekostet`, text: `${mr.mistakeN} Trades mit Fehler-Tags. Ohne sie läge dein Ergebnis bei ${cur(mr.compliant)} statt ${cur(mr.actual)}. Häufigster Kostenfaktor: ${mr.items[0] ? mr.items[0].name : '—'}.`, link: '#/stats/mistakes' });
    const setups = groupBy(c, t => t.setup || null).filter(g => g.s.n >= 5);
    if (setups.length >= 2) { const best = setups[0], worst = setups[setups.length - 1]; out.push({ kind: 'good', title: `Dein stärkstes Setup: ${best.key}`, text: `${best.s.n} Trades, Win-Rate ${pct(best.s.winRate)}, Erwartungswert ${cur(best.s.expectancy)} pro Trade.`, link: '#/stats/setups' }); if (worst.s.expectancy < 0) out.push({ kind: 'warn', title: `${worst.key} kostet dich Geld`, text: `${worst.s.n} Trades mit ${cur(worst.s.expectancy)} pro Trade. Prüfe, ob das Setup wirklich zu dir passt oder ob du es nur unter bestimmten Bedingungen handeln solltest.`, link: '#/stats/setups' }); }
    const ta = timeAnalysis(c); const hours = ta.hours.filter(g => g.s.n >= 5);
    if (hours.length >= 2) { const sorted = hours.slice().sort((a, b) => b.s.expectancy - a.s.expectancy); const b = sorted[0], w = sorted[sorted.length - 1]; if (w.s.expectancy < 0 && b.s.expectancy > 0) out.push({ kind: 'info', title: `Beste Uhrzeit ${b.key} Uhr, schwächste ${w.key} Uhr`, text: `${b.key} Uhr: ${cur(b.s.expectancy)} pro Trade bei ${b.s.n} Trades. ${w.key} Uhr: ${cur(w.s.expectancy)} pro Trade. Überlege, ob du dich auf deine starken Stunden beschränkst.`, link: '#/stats/time' }); }
    const wd = ta.weekdays.filter(g => g.s.n >= 5).sort((a, b) => a.s.expectancy - b.s.expectancy); if (wd.length && wd[0].s.expectancy < 0 && wd[0].s.total < -account * 0.005) out.push({ kind: 'warn', title: `${wd[0].key === 'Fr' ? 'Freitag' : wd[0].key} ist dein schwächster Tag`, text: `${wd[0].s.n} Trades mit insgesamt ${cur(wd[0].s.total)}. Ein Handelstag weniger könnte dein Ergebnis verbessern.`, link: '#/stats/time' });
    const e = edge(c); if (e.verdict === 'positive') out.push({ kind: 'good', title: 'Dein Edge ist statistisch belegt', text: `Ø ${e.mean.toFixed(2).replace('.', ',')} R pro Trade, 95-%-Intervall von ${e.low.toFixed(2).replace('.', ',')} bis ${e.high.toFixed(2).replace('.', ',')} R bei ${e.n} Trades.`, link: '#/stats/edge' }); else if (e.verdict === 'unproven') out.push({ kind: 'info', title: 'Edge noch nicht belegt', text: `Ø ${e.mean.toFixed(2).replace('.', ',')} R, aber das Intervall schließt Null ein. ${e.required ? `Etwa ${e.required} Trades wären nötig, um sicher zu sein.` : ''}`, link: '#/stats/edge' }); else if (e.verdict === 'negative') out.push({ kind: 'loss', title: 'Negativer Erwartungswert', text: 'Dein Ansatz verliert statistisch signifikant. Reduziere die Größe und arbeite an Setups und Ausführung, bevor du weiter skalierst.', link: '#/stats/edge' });
    if (e.deteriorating) out.push({ kind: 'warn', title: 'Dein Edge lässt nach', text: `Die letzten ${e.window} Trades liegen bei Ø ${e.recent.toFixed(2).replace('.', ',')} R, deutlich unter deinem Gesamtschnitt. Marktphase geändert oder Ausführung schlechter?`, link: '#/stats/edge' });
    const s = summary(c); if (s.winHold && s.lossHold && s.lossHold > s.winHold * 1.4) out.push({ kind: 'warn', title: 'Verluste hältst du länger als Gewinne', text: `Verlust-Trades laufen Ø ${Math.round(s.lossHold)} min, Gewinner nur ${Math.round(s.winHold)} min. Klassisches Zeichen für zu frühes Gewinnmitnehmen und Hoffen bei Verlusten.`, link: '#/stats/time' });
    const tp = tiltProfile(c); if (tp.withStreak >= 3) out.push({ kind: tp.losing / tp.withStreak >= 0.6 ? 'loss' : 'info', title: `Nach 3 Verlusten in Folge: ${tp.losing} von ${tp.withStreak} Tagen negativ`, text: `Nach der Serie hast du an diesen Tagen zusammen ${cur(tp.afterStreakPnL)} gemacht. ${tp.afterStreakPnL < 0 ? 'Ein hartes Tageslimit nach drei Verlusten würde dich schützen.' : 'Weitermachen hat sich im Schnitt gelohnt, aber bleib wachsam.'}`, link: '#/progress' });
    const days = dailyAggregation(c); const ds = daySummary(days);
    if (days.length >= 10) { const heavy = days.filter(d => d.n > ds.avgTrades * 1.5), light = days.filter(d => d.n <= ds.avgTrades * 1.5); if (heavy.length >= 3 && mean(heavy.map(d => d.pnl)) < mean(light.map(d => d.pnl)) - account * 0.002) out.push({ kind: 'warn', title: 'Overtrading kostet', text: `Tage mit vielen Trades (${heavy.length}) bringen Ø ${cur(mean(heavy.map(d => d.pnl)))}, ruhige Tage Ø ${cur(mean(light.map(d => d.pnl)))}.`, link: '#/trades' }); }
    if (checkInByDay) { const st = stateAnalysis(days, checkInByDay); if (st.sleep.n >= 10 && st.sleep.r != null && st.sleep.r > 0.25) { const g = st.sleep.groups; out.push({ kind: 'info', title: 'Schlaf zahlt sich aus', text: `Tage mit ${g[2].label} Schlaf bringen Ø ${cur(g[2].avg)}, Tage mit ${g[0].label} nur Ø ${cur(g[0].avg)}.`, link: '#/stats/state' }); } if (st.stress.n >= 10 && st.stress.r != null && st.stress.r < -0.25) out.push({ kind: 'warn', title: 'Stress drückt dein Ergebnis', text: `Korrelation zwischen Stress und Tages-P&L: ${st.stress.r.toFixed(2).replace('.', ',')}. An gestressten Tagen kleiner handeln oder aussetzen.`, link: '#/stats/state' }); }
    if (regimeByDay) { const ra = regimeAnalysis(c, regimeByDay); const tr = ra.trend.filter(g => g.s.n >= 5); if (tr.length === 2) { const [a, b] = tr; if (Math.sign(a.s.expectancy) !== Math.sign(b.s.expectancy)) { const good = a.s.expectancy > b.s.expectancy ? a : b, bad = good === a ? b : a; out.push({ kind: 'info', title: `Du verdienst in ${good.key === 'trending' ? 'Trendphasen' : 'Seitwärtsphasen'}, nicht in ${bad.key === 'trending' ? 'Trendphasen' : 'Seitwärtsphasen'}`, text: `${good.key === 'trending' ? 'Trend' : 'Seitwärts'}: ${cur(good.s.expectancy)} pro Trade. ${bad.key === 'trending' ? 'Trend' : 'Seitwärts'}: ${cur(bad.s.expectancy)} pro Trade.`, link: '#/stats/regime' }); } } }
    const disc = weeklyDiscipline(c, 4); if (disc.length >= 4) { const recent = mean(disc.slice(-2).map(w => w.score)), before = mean(disc.slice(0, 2).map(w => w.score)); if (recent > before + 8) out.push({ kind: 'good', title: 'Disziplin steigt', text: `Disziplin-Score der letzten zwei Wochen: ${Math.round(recent)}, davor ${Math.round(before)}. Weiter so.`, link: '#/progress' }); else if (recent < before - 8) out.push({ kind: 'warn', title: 'Disziplin sinkt', text: `Disziplin-Score der letzten zwei Wochen: ${Math.round(recent)}, davor ${Math.round(before)}. Lies deine Regeln vor der nächsten Session noch einmal.`, link: '#/progress' }); }
    return out;
  }

  return {
    clamp, sum, mean, sd, dayKey, parseDayKey, weekStart, isoWeek, mulberry, percentile, uid, EPS,
    derive, deriveAll, closedOnly, summary, streaks, dailyAggregation, daySummary, equityCurve, cumulativeByDay, calendarMonth,
    discipline, avgDiscipline, weeklyDiscipline, mistakeReport, groupBy, timeAnalysis, regimeAnalysis, WEEKDAYS, HOUR_BUCKETS, HOLD_BUCKETS,
    edge, monteCarlo, pearson, stateAnalysis, traderScore, SCORE_AXES, tiltCheck, tiltProfile, stats16, activityDays, journalStreak,
    parseCSV, FIELDS, guessMapping, parseNumber, parseDate, parseDirection, mapRows, dedupeKey, sentiment, insights,
  };
});
