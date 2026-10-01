/* Journalyst – Prop-Firm-Simulation (ohne DOM, deterministisch, läuft auch in einem Web Worker: importScripts('core.js', 'prop.js', 'propsim.js'))
 *
 * Baut auf Prop (Regel-Engine) auf und beantwortet, was evaluate() nicht beantwortet:
 *   dayPnLs        Tages-P&L-Reihe aus Trades (Handelstage nach Reset-Zeit/Zeitzone) – Grundlage aller Simulationen
 *   simulate       Monte Carlo: Bestehens-Wahrscheinlichkeit einer Challenge mit gegebenem RuleSet (Bootstrap auf Tagesbasis)
 *   path           Ein fester Tagespfad durch die Regeln („Was wäre wenn“, Tests)
 *   matchFirms     Rangliste von Firmen-Presets nach Bestehensquote mit kurzer Begründung
 *   expectedValue  Lohnt sich die Challenge? Erwartungswert aus Bestehensquote, erster Auszahlung und Gebühren
 *   graveyard      Konto-Friedhof: Grabsteine gebrochener Konten und Muster über alle Breaches
 *   compare        Challenge- vs. Funded-Verhalten (Kennzahlen und Hervorhebungen)
 *
 * Annahmen (bewusst dokumentiert):
 *   - Bootstrap auf TAGES-Basis: ganze Handelstage werden mit Zurücklegen gezogen (× sizeFactor), damit Tagesgrenzen (Daily Loss, EOD-Peaks) realistisch greifen.
 *     Die Reihenfolge der Trades innerhalb eines Tages ist der Simulation nicht bekannt, deshalb:
 *   - Daily Loss wird am Tagesergebnis geprüft (Tagesverlust ≥ Limit → Breach). Ein Tag, der intraday unter das Limit fällt und sich erholt, wird nicht erkannt (Näherung).
 *   - trailing_intraday wird wie trailing_eod gerechnet: Peak = höchste Tages-Endbalance, Intraday-Hochs gibt es auf Tagesbasis nicht. trailing_lock friert den Boden bei Start + lockAt ein (wie Prop.evaluate).
 *   - Limits ≤ 0 (z. B. pct-Regel ohne Startbalance) gelten als nicht gesetzt.
 *   - Bestanden = Balance ≥ Start + Ziel UND Handelstage ≥ minTradingDays UND Consistency ok (bester Tag ≤ maxDayPct % des Gesamtgewinns).
 *     Ist nur die Consistency verletzt, wird weitergehandelt; läuft die Zeit ab, zählt der Grund 'consistency'.
 *   - Alle Zufallszahlen kommen aus Core.mulberry(seed): gleicher Seed, gleiche Eingaben → gleiches Ergebnis.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./core.js'), require('./prop.js'));
  else root.PropSim = factory(root.Core, root.Prop);
})(typeof self !== 'undefined' ? self : this, function (C, P) {
  'use strict';

  /* ---------- Hilfen ---------- */
  const EPS = C.EPS;
  const num = (v, d = 0) => { const n = Number(v); return v == null || v === '' || !isFinite(n) ? d : n; };
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const isDate = d => d instanceof Date && !isNaN(d);
  const fmtDefault = v => Math.round(num(v)).toLocaleString('de-DE');
  const NOTE = 'Schätzung auf Basis vergangener Trades, keine Garantie.';
  const DD_LABEL = { static: 'Statischer Drawdown', trailing_intraday: 'Intraday-Trailing-Drawdown', trailing_eod: 'EOD-Trailing-Drawdown', trailing_lock: 'Trailing-Drawdown mit Lock' };
  const RULE_LABEL = { dailyLoss: 'das Daily Loss Limit', drawdown: 'den Drawdown', maxContracts: 'das Kontrakt-Limit', consistency: 'die Consistency Rule' };
  const WEEKDAY_LONG = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
  /* Rohe Trades zur Sicherheit ableiten; nur geschlossene mit gültigem Schluss, chronologisch (Tie-Break id) */
  const closedSorted = trades => (trades || []).filter(Boolean).map(t => isDate(t.close) || t.closed === false ? t : C.derive(t)).filter(t => t.closed && isDate(t.close)).sort((a, b) => a.close - b.close || String(a.id).localeCompare(String(b.id)));
  /* Eingabe für Simulationen: Array von Tagesbeträgen oder das Objekt aus dayPnLs() */
  const source = dp => Array.isArray(dp) ? { days: dp } : (dp || {});
  const factorOf = v => num(v, 1) > 0 ? num(v, 1) : 1;

  /* ---------- Tages-P&L ---------- */
  /* dayPnLs(trades, resetTime, tz) → { days: [Tages-P&L chronologisch, nur Handelstage mit geschlossenen Trades], keys, counts, giveback, avgGiveback, tradesPerDay, tradeCount, n }
   * giveback je Tag = Intraday-Hoch des Tages-P&L (ab 0) − max(0, Tagesergebnis): so viel mehr würde ein Intraday-Trailing-Peak gegenüber einem EOD-Peak steigen. */
  function dayPnLs(trades, resetTime, tz) {
    const list = closedSorted(trades); const byKey = new Map();
    for (const t of list) {
      const k = P.dayKey(t.close, resetTime || '00:00', tz); if (!k) continue;
      let d = byKey.get(k); if (!d) { d = { key: k, pnl: 0, n: 0, high: 0 }; byKey.set(k, d); }
      d.pnl += t.pnl; d.n++; d.high = Math.max(d.high, d.pnl);
    }
    const dl = [...byKey.values()].sort((a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0);
    const giveback = dl.map(d => Math.max(0, d.high - Math.max(0, d.pnl)));
    return { days: dl.map(d => d.pnl), keys: dl.map(d => d.key), counts: dl.map(d => d.n), giveback, avgGiveback: giveback.length ? C.mean(giveback) : 0, tradesPerDay: dl.length ? list.length / dl.length : 0, tradeCount: list.length, n: dl.length };
  }

  /* ---------- Limits und Pfad ---------- */
  /* Absolute Limits eines RuleSets für eine Startbalance; Werte ≤ 0 gelten als nicht gesetzt. consistency als Bruch (0,3), null wenn ≥ 100 % (nie verletzbar). */
  function limitsOf(rules, start) {
    const r = rules || {}; const pos = v => v != null && v > EPS ? v : null;
    const dd = r.drawdown ? pos(P.limitOf(r.drawdown, start)) : null; const ddType = dd != null ? (r.drawdown.type || 'static') : null;
    const lockAt = ddType === 'trailing_lock' && r.drawdown.lockAt != null && r.drawdown.lockAt !== '' ? num(r.drawdown.lockAt) : null;
    const m = r.consistency && r.consistency.maxDayPct != null && r.consistency.maxDayPct !== '' ? num(r.consistency.maxDayPct) / 100 : null;
    return { dailyLoss: pos(P.limitOf(r.dailyLoss, start)), drawdown: dd, ddType, lockAt, target: pos(P.limitOf(r.profitTarget, start)), minDays: Math.max(0, num(r.minTradingDays)), consistency: m != null && m > 0 && m < 1 ? m : null };
  }
  /* Ein Pfad durch die Regeln: pnlAt(i) liefert den P&L des i-ten Tages (gezogen oder fest). outcome 'pass'|'dailyLoss'|'drawdown'|'timeout'|'consistency', day = gehandelte Tage.
   * Am Breach-Tag wird der volle Tagesbetrag verbucht (balance zeigt das Tagesende, nicht den Moment des Breaches). */
  function walk(L, start, pnlAt, maxDays) {
    let balance = start, peak = start, floor = L.drawdown != null ? start - L.drawdown : null, locked = false, bestDay = 0, day = 0, outcome = null;
    const reached = () => L.target != null && balance >= start + L.target - EPS && day >= L.minDays;
    const consistent = () => { if (L.consistency == null) return true; const total = balance - start; return total <= EPS || bestDay <= EPS || bestDay / total <= L.consistency + 1e-9; };
    while (day < maxDays) {
      const pnl = num(pnlAt(day)); day++; balance += pnl; if (pnl > bestDay) bestDay = pnl;
      if (L.dailyLoss != null && -pnl >= L.dailyLoss - EPS) { outcome = 'dailyLoss'; break; }
      if (L.drawdown != null) {
        if (L.ddType !== 'static') peak = Math.max(peak, balance);
        let f = L.ddType === 'static' ? start - L.drawdown : peak - L.drawdown;
        if (L.ddType === 'trailing_lock' && L.lockAt != null && f >= start + L.lockAt - EPS) { f = start + L.lockAt; locked = true; }
        floor = f;
        if (balance <= floor + EPS) { outcome = 'drawdown'; break; }
      }
      if (reached() && consistent()) { outcome = 'pass'; break; }
    }
    if (!outcome) outcome = reached() ? 'consistency' : 'timeout';
    return { outcome, day, balance, pnl: balance - start, peak, floor, locked, bestDay };
  }
  /* path(days, rules, opts = { startBalance, sizeFactor, maxDays }) → fester Pfad in der gegebenen Reihenfolge (höchstens days.length Tage) */
  function path(days, rules, opts = {}) {
    const list = (source(days).days || []).map(v => num(v)); const f = factorOf(opts.sizeFactor); const start = num(opts.startBalance);
    const L = limitsOf(rules, start); const maxDays = opts.maxDays ? Math.min(list.length, Math.max(1, Math.round(num(opts.maxDays)))) : list.length;
    return Object.assign(walk(L, start, i => list[i] * f, maxDays), { limits: L, startBalance: start, sizeFactor: f });
  }

  /* ---------- Monte Carlo ---------- */
  /* simulate(dayPnLs, rules, opts = { runs: 10000, sizeFactor: 1, seed: 7, maxDays: 90, startBalance, tradeCount })
   * → { runs, pass, fail, failReasons: [{ reason, share, n }] absteigend, avgDaysToPass, medianDaysToPass, avgDaysToFail, minSample, note, n, tradeCount, sizeFactor, maxDays, seed, startBalance, limits } */
  function simulate(dayPnLs, rules, opts = {}) {
    const src = source(dayPnLs); const days = (src.days || []).map(v => num(v)); const n = days.length;
    const runs = clamp(Math.round(num(opts.runs, 10000)), 1, 200000), maxDays = clamp(Math.round(num(opts.maxDays, 90)), 1, 10000), f = factorOf(opts.sizeFactor), seed = num(opts.seed, 7);
    const start = num(opts.startBalance, num(src.startBalance)); const tradeCount = Math.round(num(opts.tradeCount, num(src.tradeCount, n)));
    const minSample = tradeCount >= 30 && n >= 10; const L = limitsOf(rules, start);
    const note = minSample ? NOTE : `${NOTE} Zu wenig Daten (${tradeCount} Trades an ${n} Handelstagen, empfohlen: mindestens 30 Trades an 10 Tagen) – die Zahlen sind sehr unsicher.`;
    const base = { runs: 0, pass: 0, fail: 0, failReasons: [], avgDaysToPass: null, medianDaysToPass: null, avgDaysToFail: null, minSample, note, n, tradeCount, sizeFactor: f, maxDays, seed, startBalance: start, limits: L };
    if (!n) return base;
    const rng = C.mulberry(seed); const draw = () => days[Math.floor(rng() * n)] * f;
    const counts = { dailyLoss: 0, drawdown: 0, timeout: 0, consistency: 0 }; const passDays = [], failDays = [];
    for (let r = 0; r < runs; r++) { const res = walk(L, start, draw, maxDays); if (res.outcome === 'pass') passDays.push(res.day); else { counts[res.outcome]++; failDays.push(res.day); } }
    const failReasons = Object.keys(counts).filter(k => counts[k] > 0).map(k => ({ reason: k, share: counts[k] / runs, n: counts[k] })).sort((a, b) => b.share - a.share);
    const fails = runs - passDays.length;
    return Object.assign(base, { runs, pass: passDays.length / runs, fail: fails / runs, failReasons, avgDaysToPass: passDays.length ? C.mean(passDays) : null, medianDaysToPass: passDays.length ? C.percentile(passDays, 0.5) : null, avgDaysToFail: failDays.length ? C.mean(failDays) : null });
  }

  /* ---------- Firmen-Matcher ---------- */
  const dayStats = days => { const wins = days.filter(v => v > EPS), losses = days.filter(v => v < -EPS); return { n: days.length, mean: C.mean(days), sd: C.sd(days), best: days.length ? Math.max(...days) : 0, worstLoss: losses.length ? -Math.min(...losses) : 0, avgWin: C.mean(wins), avgLoss: losses.length ? -C.mean(losses) : 0, winShare: days.length ? wins.length / days.length : 0 }; };
  /* Kurze deutsche Begründung: bei guter Quote (≥ 50 %) der passende Regel-Aspekt, sonst der häufigste Scheitergrund in Zahlen */
  function reasonFor(L, sim, st, dp, fmt) {
    if (!sim.n) return 'Keine Handelstage mit geschlossenen Trades – nichts zu simulieren.';
    if (L.target == null) return 'Kein Gewinnziel hinterlegt – ein Bestehen lässt sich nicht simulieren.';
    const top = sim.failReasons.length ? sim.failReasons[0].reason : null; const give = num(dp.avgGiveback);
    if (sim.pass >= 0.5) {
      if ((L.ddType === 'trailing_eod' || L.ddType === 'trailing_lock') && give > 0.1 * L.drawdown) return `EOD-Drawdown passt besser zu deinen Intraday-Schwankungen (Ø ${fmt(give)} Rückgabe vom Tageshoch).`;
      if (L.dailyLoss == null && L.drawdown != null) return `Kein Daily Loss Limit, dafür ${L.drawdown < 3 * st.worstLoss ? 'enger' : 'bequemer'} Drawdown (${fmt(L.drawdown)} bei schlechtestem Tag ${fmt(st.worstLoss)}).`;
      if (L.dailyLoss != null && st.worstLoss > 0 && L.dailyLoss >= 2 * st.worstLoss) return `Daily Loss Limit ${fmt(L.dailyLoss)} lässt deinem schlechtesten Tag (${fmt(st.worstLoss)}) genug Luft.`;
      if (st.avgWin > 0) return `Ziel ${fmt(L.target)} entspricht etwa ${Math.max(1, Math.round(L.target / st.avgWin))} deiner durchschnittlichen Gewinntage${sim.avgDaysToPass ? `, im Schnitt bestanden nach ${Math.round(sim.avgDaysToPass)} Handelstagen` : ''}.`;
      return 'Regeln passen zu deinem Tagesprofil.';
    }
    if (top === 'dailyLoss') return `Daily Loss Limit ${fmt(L.dailyLoss)} liegt ${L.dailyLoss <= st.worstLoss + EPS ? 'unter' : 'nahe an'} deinem schlechtesten Tag (${fmt(st.worstLoss)}).`;
    if (top === 'drawdown') return `${DD_LABEL[L.ddType] || 'Drawdown'} von ${fmt(L.drawdown)} ist eng für deine Tagesschwankungen (±${fmt(st.sd)}).`;
    if (top === 'consistency') return `Consistency Rule (max. ${Math.round(L.consistency * 100)} % an einem Tag) kollidiert mit deinen Ausreißer-Tagen (bester Tag ${fmt(st.best)}).`;
    if (top === 'timeout') return `Großes Ziel (${fmt(L.target)}) bei deiner Tagesvolatilität – in ${sim.maxDays} Tagen selten erreicht.`;
    return 'Regeln passen nur mäßig zu deinem Tagesprofil.';
  }
  /* matchFirms(dayPnLs, presets, opts = { runs: 3000, seed, maxDays, sizeFactor, referenceSize, tradeCount, fmtMoney })
   * Presets: { id, firm, name, size, rules, fees: { challenge, reset, activation, monthly }, profitSplit, payout: { minDays, minProfit } }.
   * referenceSize > 0: Tagesbeträge werden auf die Kontogröße des Presets skaliert (sizeFactor × size / referenceSize). Sortierung: pass absteigend, dann Challenge-Gebühr aufsteigend. */
  function matchFirms(dayPnLs, presets, opts = {}) {
    const src = source(dayPnLs); const days = (src.days || []).map(v => num(v)); const st = dayStats(days); const fmt = typeof opts.fmtMoney === 'function' ? opts.fmtMoney : fmtDefault; /* über postMessage geklonte Werte sind keine Funktionen */
    const ref = num(opts.referenceSize); const baseFactor = factorOf(opts.sizeFactor);
    const rows = (presets || []).filter(Boolean).map(p => {
      const size = num(p.size); const sizeFactor = ref > 0 && size > 0 ? baseFactor * size / ref : baseFactor;
      const sim = simulate(src, p.rules, Object.assign({ runs: 3000 }, opts, { startBalance: size, sizeFactor }));
      return { presetId: p.id, firm: p.firm, name: p.name, size, pass: sim.pass, fail: sim.fail, failReasons: sim.failReasons, avgDaysToPass: sim.avgDaysToPass, medianDaysToPass: sim.medianDaysToPass, fees: num((p.fees || {}).challenge), sizeFactor, reason: reasonFor(sim.limits, sim, st, src, fmt), score: Math.round(sim.pass * 100), minSample: sim.minSample };
    });
    return rows.sort((a, b) => b.pass - a.pass || a.fees - b.fees || a.size - b.size || String(a.firm).localeCompare(String(b.firm)));
  }

  /* ---------- Lohnt sich die Challenge? ---------- */
  /* expectedValue({ passProb, preset, dayPnLs, opts = { runs: 5000, seed, maxDays: 90, sizeFactor, maxResets: 1, tradeCount } })
   * Funded-Phase wird bis zum ersten Payout simuliert: Regeln = preset.fundedRules, sonst die Challenge-Regeln ohne Ziel/Mindest-Tage; Payout, sobald Handelstage ≥ payout.minDays und Gewinn ≥ payout.minProfit (mindestens ein Cent).
   * expectedPayout = E[Gewinn bis Payout] × Split × P(Payout vor Breach). Gebühren = Challenge + erwartete Resets × Reset-Gebühr + passProb × Aktivierung.
   * Erwartete Resets = Σ (1 − passProb)^k für k = 1..maxResets (gedeckelt, Standard 1 → resetProb × Reset-Gebühr); Resets zählen als Kosten, nicht als zusätzliche Chance (konservativ). Monatsgebühren sind nicht enthalten. */
  function expectedValue({ passProb, preset, dayPnLs, opts } = {}) {
    const o = opts || {}; const p = preset || {}; const fees = p.fees || {}; const pay = p.payout || {};
    const prob = clamp(num(passProb), 0, 1); const size = num(p.size);
    const rawSplit = num(p.profitSplit, 100); const split = rawSplit > 1 ? rawSplit / 100 : rawSplit > 0 ? rawSplit : 1;
    const src = source(dayPnLs); const days = (src.days || []).map(v => num(v)); const n = days.length;
    const runs = clamp(Math.round(num(o.runs, 5000)), 1, 200000), maxDays = clamp(Math.round(num(o.maxDays, 90)), 1, 10000), f = factorOf(o.sizeFactor), seed = num(o.seed, 7), maxResets = clamp(Math.round(num(o.maxResets, 1)), 0, 10);
    const tradeCount = Math.round(num(o.tradeCount, num(src.tradeCount, n))); const minSample = tradeCount >= 30 && n >= 10;
    const L = limitsOf(Object.assign({}, p.fundedRules || p.rules || {}, { profitTarget: null, minTradingDays: null }), size);
    L.target = Math.max(num(pay.minProfit), 0.01); L.minDays = Math.max(0, num(pay.minDays));
    const profits = [], payDays = []; let breaches = 0, timeouts = 0;
    if (n) { const rng = C.mulberry(seed); const draw = () => days[Math.floor(rng() * n)] * f; for (let r = 0; r < runs; r++) { const res = walk(L, size, draw, maxDays); if (res.outcome === 'pass') { profits.push(res.pnl); payDays.push(res.day); } else if (res.outcome === 'dailyLoss' || res.outcome === 'drawdown') breaches++; else timeouts++; } }
    const payoutProb = n ? profits.length / runs : 0; const avgProfitAtPayout = profits.length ? C.mean(profits) : 0; const expectedPayout = avgProfitAtPayout * split * payoutProb;
    const challenge = num(fees.challenge), reset = num(fees.reset), activation = num(fees.activation);
    const resetsAt = q => { const rp = clamp(1 - q, 0, 1); let s = 0, pow = 1; for (let k = 0; k < maxResets; k++) { pow *= rp; s += pow; } return s; };
    const feesAt = q => challenge + resetsAt(q) * reset + q * activation; const evAt = q => q * expectedPayout - feesAt(q);
    let breakEvenPassRate = null;
    if (evAt(1) >= -EPS) { if (evAt(0) >= -EPS) breakEvenPassRate = 0; else { let lo = 0, hi = 1; for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (evAt(mid) >= 0) hi = mid; else lo = mid; } breakEvenPassRate = hi; } }
    const expectedResets = resetsAt(prob);
    return { ev: evAt(prob), expectedPayout, payoutProb, avgProfitAtPayout, avgDaysToPayout: payDays.length ? C.mean(payDays) : null, breachProb: n ? breaches / runs : 0, timeoutProb: n ? timeouts / runs : 0, split, passProb: prob,
      fees: { challenge, reset, activation, monthly: num(fees.monthly), expectedResets, resetCost: expectedResets * reset, activationCost: prob * activation, total: feesAt(prob) },
      breakEvenPassRate, runs: n ? runs : 0, maxDays, minSample, limits: L,
      note: `Erwartungswert netto = Bestehensquote × erwartete erste Auszahlung (Gewinn bis Payout × Split × Wahrscheinlichkeit, vorher nicht zu breachen) − Gebühren (Challenge + erwartete Resets + Aktivierung bei Bestehen). Resets zählen als Kosten, nicht als zusätzliche Chance; Monatsgebühren sind nicht enthalten. ${NOTE}` };
  }

  /* ---------- Konto-Friedhof ---------- */
  const clockCache = new Map(); const EN_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  /* Stunde (0–23) und Wochentag (0 = Montag … 6 = Sonntag) eines Zeitpunkts in einer Zeitzone; ohne oder mit ungültiger tz lokal */
  function clockIn(date, tz) {
    const d = isDate(date) ? date : new Date(date); if (!isDate(d)) return { hour: null, weekday: null };
    if (tz) { try { let f = clockCache.get(tz); if (!f) { f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', hour: '2-digit', weekday: 'short' }); clockCache.set(tz, f); } const o = {}; for (const p of f.formatToParts(d)) o[p.type] = p.value; const wd = EN_DAYS.indexOf(o.weekday); return { hour: Number(o.hour), weekday: wd < 0 ? null : wd }; } catch (e) { /* ungültige Zeitzone → lokal */ } }
    return { hour: d.getHours(), weekday: (d.getDay() + 6) % 7 };
  }
  /* Muster über alle Grabsteine: ein Satz je Dimension, wenn mindestens zwei und mindestens die Hälfte der Breaches betroffen sind */
  function patternsOf(ts) {
    const n = ts.length; const out = []; if (n < 2) return out; const sig = c => c >= 2 && c * 2 >= n;
    const streak = ts.filter(t => t.lossStreakBefore >= 2).length; if (sig(streak)) out.push(`${streak} von ${n} Breaches passierten nach 2+ Verlusttrades in Folge.`);
    const hours = ts.map(t => t.cause.hour).filter(h => h != null); let win = { c: 0, h: 0 };
    for (let h = 0; h <= 22; h++) { const c = hours.filter(x => x >= h && x < h + 2).length; if (c > win.c || (c === win.c && c > 0 && hours.includes(h) && !hours.includes(win.h))) win = { c, h }; }
    if (sig(win.c)) out.push(`${win.c} von ${n} zwischen ${win.h} und ${win.h + 2} Uhr.`);
    const top = vals => { const m = new Map(); for (const v of vals) if (v != null && v !== '') m.set(v, (m.get(v) || 0) + 1); let best = null; for (const [k, c] of m) if (!best || c > best.c) best = { k, c }; return best; };
    const wd = top(ts.map(t => t.cause.weekdayIndex)); if (wd && sig(wd.c)) out.push(`${wd.c} von ${n} an einem ${WEEKDAY_LONG[wd.k]}.`);
    const sym = top(ts.map(t => t.cause.symbol)); if (sym && sig(sym.c)) out.push(`${sym.c} von ${n} im ${sym.k}.`);
    const setup = top(ts.map(t => t.cause.setup)); if (setup && sig(setup.c)) out.push(`${setup.c} von ${n} mit dem Setup „${setup.k}“.`);
    const emo = top(ts.flatMap(t => [...new Set(t.emotions)])); if (emo && sig(emo.c)) out.push(`${emo.c} von ${n} mit der Emotion „${emo.k}“ rund um den Breach.`);
    const rule = top(ts.map(t => t.cause.rule)); if (rule && sig(rule.c)) out.push(`${rule.c} von ${n} durch ${RULE_LABEL[rule.k] || rule.k}.`);
    return out;
  }
  /* graveyard(accounts, breaches, tradesById, opts = { tradesOf(account), accountIdOf(trade), tz })
   * accounts mit status 'breached'; breaches { accountId, tradeId, rule, at, note } (erster Breach je Konto zählt); tradesById Map oder Objekt tradeId → Trade.
   * Konto-Trades: opts.tradesOf(account), sonst alle Trades mit accountId === account.id. result = P&L des Kontos bis einschließlich Breach-Trade. */
  function graveyard(accounts, breaches, tradesById, opts = {}) {
    const getTrade = id => id == null ? null : tradesById instanceof Map ? tradesById.get(id) : tradesById ? tradesById[id] : null;
    const all = tradesById instanceof Map ? [...tradesById.values()] : Object.values(tradesById || {});
    const accIdOf = opts.accountIdOf || (t => t.accountId);
    const sortedBreaches = (breaches || []).filter(Boolean).slice().sort((a, b) => new Date(a.at || 0) - new Date(b.at || 0));
    const tombstones = [];
    for (const acc of (accounts || []).filter(a => a && a.status === 'breached')) {
      const br = sortedBreaches.find(b => String(b.accountId) === String(acc.id)) || null;
      const rawTrade = br ? getTrade(br.tradeId) : null; const trade = rawTrade ? closedSorted([rawTrade])[0] || null : null;
      const trades = closedSorted(opts.tradesOf ? opts.tradesOf(acc) : all.filter(t => t && String(accIdOf(t)) === String(acc.id)));
      const atDate = br && br.at ? new Date(br.at) : trade ? trade.close : null; const at = isDate(atDate) ? atDate.toISOString() : null;
      const started = acc.startedAt ? new Date(acc.startedAt) : null;
      const lifetimeDays = isDate(started) && isDate(atDate) ? Math.max(1, Math.ceil((atDate - started) / 86400000)) : null;
      /* Trades bis zum Breach (chronologisch): Konto-P&L, Verlustserie und Emotionen vor dem auslösenden Trade */
      let upTo = trades.filter(t => !isDate(atDate) || t.close <= atDate); if (trade && !upTo.some(t => t.id === trade.id)) upTo = [...upTo, trade];
      const idx = trade ? upTo.findIndex(t => t.id === trade.id) : -1; const before = idx >= 0 ? upTo.slice(0, idx) : upTo;
      let streak = 0; for (let i = before.length - 1; i >= 0; i--) { const t = before[i]; if (t.status === 'be') continue; if (t.status === 'loss' || (t.status == null && t.pnl < -EPS)) streak++; else break; }
      const result = upTo.length ? C.sum(upTo.map(t => t.pnl)) : acc.pnl != null && acc.pnl !== '' ? num(acc.pnl) : null;
      const ctx = [trade, ...before.slice(-3).reverse()].filter(Boolean);
      const emotions = [...new Set(ctx.flatMap(t => t.emotions || []))], mistakes = [...new Set(ctx.flatMap(t => t.mistakes || []))];
      const clock = clockIn(atDate, acc.tz || opts.tz);
      tombstones.push({ accountId: acc.id, firm: acc.firm || '—', name: acc.name || '', size: num(acc.size), phase: acc.phase || null, market: acc.market || null, startedAt: acc.startedAt || null, lifetimeDays, result,
        cause: { rule: br ? br.rule : null, tradeId: br ? br.tradeId : null, at, symbol: trade ? trade.symbol || null : null, setup: trade ? trade.setup || null : null, hour: clock.hour, weekday: clock.weekday != null ? C.WEEKDAYS[clock.weekday] : null, weekdayIndex: clock.weekday, pnl: trade ? trade.pnl : null },
        lossStreakBefore: streak, emotions, mistakes, note: (br && br.note) || acc.note || '' });
    }
    tombstones.sort((a, b) => (a.cause.at || '') < (b.cause.at || '') ? -1 : (a.cause.at || '') > (b.cause.at || '') ? 1 : 0);
    return { tombstones, patterns: patternsOf(tombstones), n: tombstones.length };
  }

  /* ---------- Challenge vs. Funded ---------- */
  const COMPARE_ROWS = [{ key: 'winRate', label: 'Trefferquote', unit: 'pct' }, { key: 'avgR', label: 'Ø R', unit: 'r' }, { key: 'pf', label: 'Profit Factor', unit: 'num' }, { key: 'avgQty', label: 'Ø Positionsgröße', unit: 'num' }, { key: 'avgRisk', label: 'Ø Risiko', unit: 'cur' }, { key: 'tradesPerDay', label: 'Trades pro Tag', unit: 'num' }, { key: 'avgHold', label: 'Ø Haltedauer', unit: 'dur' }, { key: 'maxDD', label: 'Max. Drawdown', unit: 'cur' }];
  const HIGHLIGHT = {
    winRate: (d, up) => `Funded triffst du ${d} % ${up ? 'öfter' : 'seltener'}.`, avgR: (d, up) => `Funded holst du ${d} % ${up ? 'mehr' : 'weniger'} R pro Trade.`, pf: (d, up) => `Dein Profit Factor ist funded ${d} % ${up ? 'höher' : 'niedriger'}.`,
    avgQty: (d, up) => `Funded handelst du ${d} % ${up ? 'größere' : 'kleinere'} Positionen.`, avgRisk: (d, up) => `Funded riskierst du ${d} % ${up ? 'mehr' : 'weniger'} pro Trade.`, tradesPerDay: (d, up) => `Funded machst du ${d} % ${up ? 'mehr' : 'weniger'} Trades pro Tag.`,
    avgHold: (d, up) => `Funded hältst du Trades ${d} % ${up ? 'länger' : 'kürzer'}.`, maxDD: (d, up) => `Dein maximaler Drawdown ist funded ${d} % ${up ? 'größer' : 'kleiner'}.`,
  };
  function metricsOf(list) {
    const c = closedSorted(list); const s = C.summary(c); const daysN = new Set(c.map(t => C.dayKey(t.close))).size; const risks = c.filter(t => t.risk > 0).map(t => t.risk);
    return { n: c.length, winRate: s.n ? s.winRate : null, avgR: s.avgR, pf: s.n ? s.pf : null, avgQty: c.length ? C.mean(c.map(t => t.quantity)) : null, avgRisk: risks.length ? C.mean(risks) : null, tradesPerDay: daysN ? c.length / daysN : null, avgHold: s.avgHold, maxDD: s.n ? s.maxDD : null };
  }
  /* compare(challengeTrades, fundedTrades, opts = { threshold: 20 }) → { rows: [{ key, label, challenge, funded, unit, diffPct, highlight }], highlights: [Sätze bei |diffPct| ≥ threshold, nach Größe], n: { challenge, funded } } */
  function compare(challengeTrades, fundedTrades, opts = {}) {
    const a = metricsOf(challengeTrades), b = metricsOf(fundedTrades); const th = num(opts.threshold, 20);
    const rows = COMPARE_ROWS.map(r => { const ch = a[r.key], fu = b[r.key]; const diffPct = ch != null && fu != null && Math.abs(ch) > 1e-9 ? (fu - ch) / Math.abs(ch) * 100 : null; return { key: r.key, label: r.label, challenge: ch, funded: fu, unit: r.unit, diffPct, highlight: diffPct != null && Math.abs(diffPct) >= th - 1e-9 }; });
    const highlights = rows.filter(r => r.highlight).sort((x, y) => Math.abs(y.diffPct) - Math.abs(x.diffPct)).map(r => HIGHLIGHT[r.key](Math.round(Math.abs(r.diffPct)), r.diffPct > 0));
    return { rows, highlights, n: { challenge: a.n, funded: b.n } };
  }

  return { NOTE, dayPnLs, limitsOf, path, simulate, matchFirms, expectedValue, graveyard, compare };
});
