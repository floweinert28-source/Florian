/* Beispieldaten (deterministisch, markiert mit sample: true, jederzeit entfernbar)
   Version 2: NQ/ES-Futures als häufigste Symbole, vier Prop-Konten (Topstep in der Challenge, Apex funded mit Payouts, FTMO als
   Forex/CFD-Konto mit DAX und EURUSD geplatzt, MyFundedFutures abgebrochen) mit Ausgaben, Payouts und Breach-Datensatz,
   Replay-Screenshots (Canvas, nur im Browser), zwei Replay-Sessions und Sprachnotizen ohne Audio. Die Trade-Folge hängt nur vom Seed und vom Index des Handelstags ab, nicht vom
   Kalenderdatum, damit die Prop-Geschichte (Topstep ~40 % zum Ziel, Apex nie verletzt, FTMO am Daily Loss gerissen) an jedem Tag gleich bleibt.
   Größen sind auf ein 25.000er Konto ausgelegt (Risiko ~0,5–1,5 % je Trade, Tilt-Tage größer). */
(function (root) {
  'use strict';
  const C = root.Core || (typeof require === 'function' ? require('./core.js') : null);
  const PD = root.PropData || (typeof require === 'function' ? (require('./propdata.js').PropData || null) : null);
  const VERSION = 3; /* 3: FTMO als Forex-Konto, Tage-Merge mit Prüfsummen; Erhöhung erzwingt die Neuinstallation bestehender Beispieldaten */
  const IMAGES = 2; /* 2: Beispiel-Charts in der Factory-Palette (Obsidian, Metric Green, Signal Orange, Geist Mono); Erhöhung rendert die Beispielbilder bei Bestandsnutzern neu (Store.load) */
  const MONO = '11px "Geist Mono", ui-monospace, monospace'; /* Achsen, Marken, Footer der Beispiel-Charts */
  const SEED = 19887; /* per Seed-Suche (scratchpad/seedsearch.js) gewählt: Topstep ~35 % zum Ziel, Apex ohne Verletzung mit > 6.000 beim Funded-Wechsel, FTMO am Breach-Tag im DAX gerissen, MNQ höchstens 5 Kontrakte */
  const DAYS = 88;
  /* Fenster als Index der Handelstage (0 = ältester, 87 = heute): Topstep seit ~3 Wochen, Apex seit ~3 Monaten (funded seit ~6 Wochen), FTMO ~9 bis ~5 Wochen (Forex/CFD, Frühsession), Breach-Tag ~5 Wochen her */
  const WIN = { topstep: [71, 87], apex: [12, 87], apexFunded: 58, ftmo: [40, 62], breach: 62 };
  const ACC = { topstep: 'smpa-topstep', apex: 'smpa-apex', ftmo: 'smpa-ftmo', mffu: 'smpa-mffu' };
  const TILT = di => di % 11 === 4;
  const inWin = (di, w) => di >= w[0] && di <= w[1];
  /* FTMO ist ein Forex/CFD-Konto: nur DAX, EURUSD und AAPL werden ihm zugeordnet, Futures laufen auf Topstep und Apex */
  const FTMO_SYMS = new Set(['DAX', 'EURUSD', 'AAPL']);
  const pad2 = n => String(n).padStart(2, '0');
  const PRESET_FALLBACK = {
    'topstep-50k': { id: 'topstep-50k', firm: 'Topstep', name: '50K', market: 'futures', size: 50000, currency: 'USD', profitSplit: 0.9, rules: { dailyLoss: null, drawdown: { value: 2000, mode: 'abs', type: 'trailing_eod', lockAt: null, basis: 'eod' }, profitTarget: { value: 3000, mode: 'abs' }, minTradingDays: 2, maxContracts: 5, consistency: { maxDayPct: 50 } }, fees: { challenge: 49, reset: 49, activation: 149, monthly: 49, data: 0 }, payout: { minDays: 5, minProfit: null, minBalance: null } },
    'apex-100k': { id: 'apex-100k', firm: 'Apex Trader Funding', name: '100K', market: 'futures', size: 100000, currency: 'USD', profitSplit: 0.9, rules: { dailyLoss: null, drawdown: { value: 3000, mode: 'abs', type: 'trailing_lock', lockAt: 100, basis: 'intraday' }, profitTarget: { value: 6000, mode: 'abs' }, minTradingDays: 7, maxContracts: 14, consistency: { maxDayPct: 30 } }, fees: { challenge: 207, reset: 80, activation: 140, monthly: 207, data: 0 }, payout: { minDays: 8, minProfit: 500, minBalance: 103100 } },
    'ftmo-100k': { id: 'ftmo-100k', firm: 'FTMO', name: '100K', market: 'forex', size: 100000, currency: 'USD', profitSplit: 0.8, rules: { dailyLoss: { value: 5, mode: 'pct', basis: 'equity', resetTime: '00:00', tz: 'Europe/Prague' }, drawdown: { value: 10, mode: 'pct', type: 'static', lockAt: null, basis: 'intraday' }, profitTarget: { value: 10, mode: 'pct' }, minTradingDays: 4, maxContracts: null, consistency: null }, fees: { challenge: 540, reset: 0, activation: 0, monthly: 0, data: 0 }, payout: { minDays: null, minProfit: null, minBalance: null } },
    'mffu-50k': { id: 'mffu-50k', firm: 'MyFundedFutures', name: '50K Starter', market: 'futures', size: 50000, currency: 'USD', profitSplit: 0.9, rules: { dailyLoss: null, drawdown: { value: 2000, mode: 'abs', type: 'trailing_eod', lockAt: null, basis: 'eod' }, profitTarget: { value: 3000, mode: 'abs' }, minTradingDays: 1, maxContracts: 3, consistency: { maxDayPct: 40 } }, fees: { challenge: 80, reset: 80, activation: 0, monthly: 80, data: 0 }, payout: { minDays: 5, minProfit: 1000, minBalance: null } },
  };
  const presetOf = id => (PD && Array.isArray(PD.PRESETS) ? PD.PRESETS.find(p => p.id === id) : null) || PRESET_FALLBACK[id];
  const clone = o => JSON.parse(JSON.stringify(o));

  function generate(opts = {}) {
    const rand = C.mulberry(opts.seed == null ? SEED : opts.seed);
    const R = (a, b) => a + rand() * (b - a);
    const RI = (a, b) => Math.floor(R(a, b + 1));
    const pick = arr => arr[Math.floor(rand() * arr.length)];
    const weighted = pairs => { let r = rand() * pairs.reduce((s, p) => s + p[1], 0); for (const p of pairs) { r -= p[1]; if (r < 0) return p[0]; } return pairs[pairs.length - 1][0]; };
    const gauss = (m = 0, s = 1) => { const u = rand() || 1e-9, v = rand(); return m + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    const roundTo = (v, d) => Math.round(v * 10 ** d) / 10 ** d;
    const clamp = C.clamp;
    const NOW = opts.now ? new Date(opts.now) : new Date();
    const ACCOUNT = Number(opts.account) > 0 ? Number(opts.account) : 25000;
    const accountId = opts.accountId || 'main';

    /* Instrumente: lo/hi = Kursband über die vier Monate, noise = Tagesrauschen, mult = Punktwert, stop = Stop-Abstand in Punkten (bias > 1 zieht zu engen Stops), maxQty = Kontrakte (MNQ als Micro-Ausweichgröße bis 5), qd = Dezimalstellen der Stückzahl (CFD/Forex/Aktien) */
    const INSTR = {
      NQ: { s: 'NQ', lo: 19400, hi: 21500, noise: 230, tick: 0.25, dec: 2, mult: 20, stop: [8, 40], bias: 2.2, maxQty: 3, fut: true },
      ES: { s: 'ES', lo: 5300, hi: 5900, noise: 65, tick: 0.25, dec: 2, mult: 50, stop: [3, 12], bias: 1.5, maxQty: 3, fut: true },
      MNQ: { s: 'MNQ', lo: 19400, hi: 21500, noise: 230, tick: 0.25, dec: 2, mult: 2, stop: [10, 40], bias: 1.2, maxQty: 5, fut: true },
      GC: { s: 'GC', lo: 2300, hi: 2450, noise: 18, tick: 0.1, dec: 1, mult: 100, stop: [2.5, 6], bias: 1.3, maxQty: 1, fut: true },
      CL: { s: 'CL', lo: 68, hi: 84, noise: 1.6, tick: 0.01, dec: 2, mult: 1000, stop: [0.25, 0.55], bias: 1.3, maxQty: 1, fut: true },
      AAPL: { s: 'AAPL', lo: 185, hi: 215, noise: 3, tick: 0.01, dec: 2, mult: 1, stop: [0.8, 2.2], bias: 1, qd: 0 },
      DAX: { s: 'DAX', lo: 18000, hi: 19600, noise: 160, tick: 0.5, dec: 1, mult: 1, stop: [15, 40], bias: 1, qd: 1 },
      EURUSD: { s: 'EURUSD', lo: 1.07, hi: 1.10, noise: 0.004, tick: 0.00001, dec: 5, mult: 100000, stop: [0.0008, 0.0025], bias: 1, qd: 2 },
    };
    const US = [['NQ', 46], ['ES', 27], ['MNQ', 6], ['GC', 8], ['CL', 6], ['AAPL', 7]];
    const EU = [['DAX', 65], ['EURUSD', 35]];
    const SETUPS = [
      { n: 'Pullback', wr: 0.60, strat: 'Trendfolge', tb: 0.08, rb: -0.10 },
      { n: 'Breakout', wr: 0.53, strat: 'Trendfolge', tb: 0.12, rb: -0.14 },
      { n: 'Range-Fade', wr: 0.55, strat: 'Mean Reversion', tb: -0.12, rb: 0.10 },
      { n: 'Reversal', wr: 0.44, strat: 'Mean Reversion', tb: -0.05, rb: 0.03 },
    ];
    const MISTAKES = ['FOMO', 'Regel gebrochen', 'Revenge-Trade', 'Zu früh raus', 'Stop verschoben', 'Übergröße'];
    const RULES = [
      { id: 'r1', text: 'Nur mit vollständigem Plan handeln' },
      { id: 'r2', text: 'Stop niemals verschieben' },
      { id: 'r3', text: 'Maximal 1 % Risiko pro Trade' },
      { id: 'r4', text: 'Nach zwei Verlusten in Folge Pause machen' },
      { id: 'r5', text: 'Keine Trades in den ersten fünf Minuten' },
    ];
    const REASONS = ['Rücklauf an die 20er EMA im Aufwärtstrend, Volumen nimmt ab.', 'Ausbruch über das Tageshoch nach enger Konsolidierung.', 'Fehlausbruch am Range-Hoch, Ablehnung mit langem Docht.', 'Doppelboden am Vortagestief mit Divergenz.', 'Retest der Ausbruchszone nach dem Eröffnungsimpuls.', 'Abpraller am VWAP mit steigender Marktbreite.', 'Rücklauf an das Eröffnungshoch nach dem ersten Impuls.', 'Reaktion am Vortagesschluss, Orderflow dreht.'];

    const roundTick = (v, ins) => roundTo(Math.round(v / ins.tick) * ins.tick, ins.dec);
    const priceAt = (ins, di) => roundTick(ins.lo + (ins.hi - ins.lo) * (0.12 + 0.76 * di / (DAYS - 1)) + gauss(0, ins.noise), ins);
    /* Stop-Abstand und Stückzahl zum Risikobudget: Futures in ganzen Kontrakten; ist der NQ-Stop für das Budget zu weit, weicht der Trade auf den Micro (MNQ) aus */
    function size(base, riskTarget) {
      const sd = base.stop[0] + (base.stop[1] - base.stop[0]) * Math.pow(rand(), base.bias || 1);
      let ins = base, stopDist = base.fut ? Math.max(base.tick, Math.round(sd / base.tick) * base.tick) : sd; stopDist = roundTo(stopDist, base.dec);
      let qty;
      if (base.fut) {
        const perC = stopDist * base.mult;
        if (base.s === 'NQ' && perC > riskTarget * 2.2) { ins = INSTR.MNQ; qty = clamp(Math.round(riskTarget / (stopDist * ins.mult)), 2, ins.maxQty); }
        else qty = clamp(Math.round(riskTarget / perC), 1, base.maxQty);
      } else qty = Math.max(roundTo(riskTarget / (stopDist * base.mult), base.qd), base.qd ? 0.1 : 1);
      return { ins, stopDist, qty };
    }
    const tradingDays = count => { const days = []; const c = new Date(NOW); c.setHours(0, 0, 0, 0); while (days.length < count) { const wd = c.getDay(); if (wd !== 0 && wd !== 6) days.push(new Date(c)); c.setDate(c.getDate() - 1); } return days.reverse(); };
    const days = tradingDays(DAYS);
    const trades = [], dayMap = {}, notes = []; const info = new Map();
    let n = 0;
    /* Ein Trade aus Plan, Ausführung und Ergebnis (rr = realisiertes R-Multiple vor Gebühren) */
    function build(o) {
      const ins = o.ins, dir = o.dir;
      const devR = o.fomo ? R(0.45, 0.9) : Math.abs(gauss(0, 0.12));
      const entryPrice = roundTick(o.plannedEntry + dir * devR * o.stopDist, ins);
      const plannedStop = roundTick(o.plannedEntry - dir * o.stopDist, ins);
      const plannedTarget = roundTick(o.plannedEntry + dir * o.stopDist * R(1.5, 3), ins);
      const exitPrice = roundTick(entryPrice + dir * o.rr * o.stopDist, ins);
      const fees = ins.fut ? roundTo(o.qty * R(2.4, 4.6), 2) : roundTo(R(0.8, 3.5), 2);
      const maeR = o.win ? R(0.05, 0.6) : Math.min(Math.abs(o.rr), R(0.8, 1.15));
      const mfeR = o.win ? o.rr + R(0, 0.5) : R(0, 0.55);
      const exit = new Date(o.cursor.getTime() + o.holding * 60000);
      const t = {
        id: 'smp' + (++n), accountId, symbol: ins.s, direction: dir, openedAt: o.cursor.toISOString(), closedAt: exit.toISOString(), entryPrice, exitPrice, quantity: o.qty, multiplier: ins.mult, fees,
        plannedEntry: o.plannedEntry, plannedStop, plannedTarget, plannedReason: o.reason, mae: roundTick(entryPrice - dir * maeR * o.stopDist, ins), mfe: roundTick(entryPrice + dir * mfeR * o.stopDist, ins),
        setup: o.setup.n, strategy: o.setup.strat, mistakes: o.mistakes, emotions: o.emotions, rulesBroken: o.rules, rating: o.rating, notes: o.notes,
        screenshots: [], voiceNotes: [], propAccountIds: [], sample: true, createdAt: exit.toISOString(),
      };
      info.set(t.id, { di: o.di, win: o.win, rr: o.rr, exit, stopDist: o.stopDist });
      return t;
    }
    /* Der Tag, an dem das FTMO-Konto platzt (Forex/CFD, Frühsession): drei DAX-Trades, der dritte reißt mit dreifacher Größe das Daily Loss Limit (5 % = 5.000); danach ein später EURUSD-Versuch */
    function breachDay(day, di, cursor, entry) {
      const r = i => RULES[i].text;
      const plan = [
        { ins: INSTR.DAX, dir: -1, stop: 25, qty: 25, rr: -1.0, mistakes: [], rules: [], emotions: ['Fokussiert'], setup: SETUPS[1], rating: 3, notes: 'Ausbruch nach unten, aber sofort zurück in die Range. Stop sauber genommen.', gap: 0, hold: 18 },
        { ins: INSTR.DAX, dir: 1, stop: 35, qty: 50, rr: -1.25, mistakes: ['Revenge-Trade', 'Übergröße', 'Stop verschoben'], rules: [r(1), r(2)], emotions: ['Frustriert'], setup: SETUPS[3], rating: 1, notes: 'Wollte den ersten Verlust sofort zurückholen. Doppelte Größe, Stop nach hinten gezogen.', gap: 6, hold: 34 },
        { ins: INSTR.DAX, dir: -1, stop: 40, qty: 75, rr: -1.15, mistakes: ['Revenge-Trade', 'Übergröße', 'Stop verschoben'], rules: [r(1), r(2), r(3)], emotions: ['Ängstlich'], setup: SETUPS[1], rating: 1, notes: 'Tunnelblick. Dritter Verlust mit dreifacher Größe, damit war das FTMO-Konto weg.', gap: 4, hold: 41 },
        { ins: INSTR.EURUSD, dir: 1, stop: 0.0015, qty: 2, rr: 1.4, mistakes: ['Regel gebrochen'], rules: [r(3)], emotions: ['Unsicher'], setup: SETUPS[0], rating: 2, notes: 'Noch ein Versuch nach der Pause. Lief, aber das Konto war schon geplatzt.', gap: 55, hold: 22 },
      ];
      let prevExit = cursor; const out = [];
      plan.forEach((p, i) => {
        const at = i ? new Date(prevExit.getTime() + p.gap * 60000) : cursor;
        const t = build({ di, ins: p.ins, dir: p.dir, cursor: at, stopDist: p.stop, qty: p.qty, rr: p.rr, win: p.rr > 0, mistakes: p.mistakes, rules: p.rules, emotions: p.emotions, setup: p.setup, reason: pick(REASONS), holding: p.hold, rating: p.rating, notes: p.notes, plannedEntry: priceAt(p.ins, di) });
        trades.push(t); out.push(t); prevExit = info.get(t.id).exit;
      });
      entry.rulesFollowed = RULES.filter(x => ![1, 2, 3].includes(RULES.indexOf(x))).map(x => x.id);
      notes.push({ id: 'smpn' + entry.key, folderId: 'daily', type: 'day', dateKey: entry.key, title: dayTitle(day), tags: ['smpt-tilt', 'smpt-lehre', 'smpt-prop'], deletedAt: null, content: { ops: [{ insert: 'FTMO-Konto geplatzt' }, { attributes: { header: 2 }, insert: '\n' }, { insert: 'Erster Verlust war sauber. Danach wollte ich es zurückholen: dreifache Größe im DAX, Stop zweimal verschoben, keine Pause. Der dritte Trade hat das Daily Loss Limit gerissen.\n' }, { insert: 'Lehre' }, { attributes: { header: 3 }, insert: '\n' }, { insert: 'Nach zwei Verlusten in Folge ist der Tag vorbei. Ohne Ausnahme.' }, { attributes: { list: 'bullet' }, insert: '\n' }, { insert: 'Größe nie nach einem Verlust erhöhen, erst recht nicht auf dem Prop-Konto.' }, { attributes: { list: 'bullet' }, insert: '\n' }] }, createdAt: evening(day).toISOString(), updatedAt: evening(day).toISOString(), sample: true });
      return out;
    }

    let breachTrades = [];
    days.forEach((day, di) => {
      const key = C.dayKey(day);
      const regime = { trend: rand() < 0.55 ? (di % 2 ? 'up' : 'down') : 'ranging', vol: pick(['low', 'normal', 'normal', 'high']) };
      const tilt = TILT(di), breach = di === WIN.breach;
      const entry = { key, regime, sample: true };
      if (rand() < 0.82 || breach) { const bad = tilt || breach; const sleep = bad ? R(4.8, 6) : R(6, 8.6); entry.checkIn = { sleep: Math.round(sleep * 2) / 2, stress: bad ? RI(4, 5) : RI(1, 4), mood: bad ? RI(1, 3) : RI(2, 5), note: breach ? 'Kaum geschlafen, FTMO-Ziel sitzt im Nacken.' : tilt ? 'Schlecht geschlafen, unruhig.' : '', createdAt: new Date(day.getTime() + 8 * 3600000).toISOString() }; }
      /* Im FTMO-Fenster (Forex/CFD-Challenge) überwiegt die Frühsession mit DAX und EURUSD, der Breach-Tag liegt ebenfalls dort */
      const session = breach ? 'eu' : rand() < (inWin(di, WIN.ftmo) ? 0.5 : 0.78) ? 'us' : 'eu';
      const count = breach ? 4 : tilt ? RI(4, 5) : pick([0, 1, 1, 2, 2, 2, 3, 3, 3]);
      dayMap[key] = entry;
      if (!count) return;
      let cursor = new Date(day); if (session === 'us') cursor.setHours(15, 30 + RI(0, 40), 0, 0); else cursor.setHours(9, RI(0, 45), 0, 0);
      if (breach) { breachTrades = breachDay(day, di, cursor, entry); return; }
      const endHour = session === 'us' ? 21 : 13, capMin = session === 'us' ? 22 * 60 : 14 * 60;
      let prevLoss = false, prevRisk = 0, prevExit = cursor; const brokenToday = new Set();
      for (let ti = 0; ti < count; ti++) {
        const base = INSTR[weighted(session === 'us' ? US : EU)], setup = pick(SETUPS), dir = rand() < 0.55 ? 1 : -1;
        const mistakes = [], rules = [];
        if (rand() < (tilt ? 0.55 : 0.16)) {
          mistakes.push(pick(MISTAKES));
          if (mistakes.includes('Stop verschoben')) rules.push(RULES[1].text);
          if (mistakes.includes('Übergröße')) rules.push(RULES[2].text);
          if (mistakes.includes('Regel gebrochen') && rand() < 0.7) rules.push(pick([RULES[0], RULES[3], RULES[4]]).text);
        }
        const revenge = tilt && prevLoss && ti > 0 && rand() < 0.5;
        if (revenge && !mistakes.includes('Revenge-Trade')) mistakes.push('Revenge-Trade');
        let risk = ACCOUNT * R(0.006, 0.014);
        if (tilt && prevLoss && prevRisk > 0) { risk = Math.min(prevRisk * R(1.6, 2.4), ACCOUNT * 0.03); if (!mistakes.includes('Übergröße')) mistakes.push('Übergröße'); }
        if (mistakes.includes('Übergröße') && risk < ACCOUNT * 0.015) risk = ACCOUNT * R(0.015, 0.02);
        if (ti > 0) cursor = new Date(prevExit.getTime() + (tilt ? RI(3, 9) : RI(25, 140)) * 60000);
        const hour = cursor.getHours(); if (hour >= endHour) break;
        let wp = setup.wr + (regime.trend !== 'ranging' ? setup.tb : setup.rb);
        if (session === 'us') { if (hour < 17) wp += 0.06; if (hour >= 20) wp -= 0.08; } else { if (hour < 11) wp += 0.06; if (hour >= 12) wp -= 0.08; }
        if (mistakes.length) wp -= 0.30; if (regime.vol === 'high') wp -= 0.03;
        wp = clamp(wp, 0.15, 0.85);
        const win = rand() < wp;
        let rr;
        if (win) { rr = R(0.7, 2.6); if (mistakes.includes('Zu früh raus')) rr = R(0.2, 0.6); if (setup.n === 'Breakout') rr += 0.3; if (mistakes.length) rr = Math.min(rr, 1.1); }
        else { rr = -R(0.75, 1.1); if (mistakes.includes('Stop verschoben')) rr = -R(1.4, 2.1); }
        const sz = size(base, risk); const ins = sz.ins;
        const plannedEntry = priceAt(ins, di);
        const left = capMin - (cursor.getHours() * 60 + cursor.getMinutes());
        const holding = Math.max(4, Math.min(pick([4, 8, 12, 18, 25, 35, 50, 75, 110, 160, 240]), left));
        const emotions = mistakes.length || tilt ? [pick(['Unsicher', 'Gierig', 'Ängstlich', 'Euphorisch', 'Frustriert'])] : (rand() < 0.7 ? [pick(['Ruhig', 'Fokussiert', 'Gelangweilt'])] : []);
        rules.forEach(r => brokenToday.add(r));
        const t = build({
          di, ins, dir, cursor, stopDist: sz.stopDist, qty: sz.qty, rr, win, mistakes, rules, emotions, setup, reason: pick(REASONS), holding, fomo: mistakes.includes('FOMO'),
          rating: mistakes.length ? RI(1, 2) : RI(3, 5), plannedEntry,
          notes: mistakes.length ? pick(['Ungeduldig geworden.', 'Wollte den Verlust zurückholen.', 'Regeln ignoriert. Nicht wieder.', 'Zu groß, Nerven lagen blank.']) : pick(['Sauber nach Plan.', 'Gutes Timing, Ausführung passte.', '', 'Etwas zu früh gehandelt, sonst okay.', 'Orderflow hat die Idee bestätigt.']),
        });
        trades.push(t);
        prevLoss = !win; prevRisk = risk; prevExit = info.get(t.id).exit;
      }
      entry.rulesFollowed = RULES.filter(r => !brokenToday.has(r.text)).map(r => r.id);
      if (tilt) notes.push({ id: 'smpn' + key, folderId: 'daily', type: 'day', dateKey: key, title: dayTitle(day), tags: ['smpt-tilt', 'smpt-lehre'], deletedAt: null, content: { ops: [{ insert: 'Schlecht geschlafen, schon vor der US-Eröffnung unruhig. Nach dem zweiten Verlust wollte ich es zurückholen und habe die Kontrakte erhöht. Genau das Muster, das ich vermeiden will.\n' }, { insert: 'Lehre' }, { attributes: { header: 3 }, insert: '\n' }, { insert: 'Nach zwei Verlusten Rechner zu, Spaziergang, erst am nächsten Tag wieder schauen.' }, { attributes: { list: 'bullet' }, insert: '\n' }] }, createdAt: evening(day).toISOString(), updatedAt: evening(day).toISOString(), sample: true });
      else if (count >= 2 && rand() < 0.35) notes.push({ id: 'smpn' + key, folderId: 'daily', type: 'day', dateKey: key, title: dayTitle(day), tags: [], deletedAt: null, content: { ops: [{ insert: pick(['Ruhiger Tag, Setups sauber abgewartet. ', 'Wenig Bewegung im NQ, zwei Trades reichten. ', 'Guter Fokus nach dem Check-in, keine Hektik. ', 'Erst spät ins Geschäft gekommen, dann diszipliniert geblieben. ']) + pick(['Morgen wieder mit Plan starten.', 'Regeln gelesen, Stop nicht angefasst.', 'Teilgewinn früh, Rest laufen lassen.', 'Prop-Konto im grünen Bereich gehalten.']) + '\n' }] }, createdAt: evening(day).toISOString(), updatedAt: evening(day).toISOString(), sample: true });
    });
    function evening(day) { return new Date(day.getTime() + 22 * 3600000); }
    function dayTitle(d) { const wd = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][d.getDay()]; const mo = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'][d.getMonth()]; return `${wd}, ${d.getDate()}. ${mo} ${d.getFullYear()}`; }

    /* Heute: nur Trades, die vor jetzt eröffnet UND geschlossen wurden (ein geschlossener Trade mit Ausstieg in der Zukunft wäre im Journal sichtbar); dazu ein laufender NQ-Trade in der US-Session */
    const lastKey = C.dayKey(days[DAYS - 1]);
    for (let i = trades.length - 1; i >= 0; i--) { const t = trades[i]; if (C.dayKey(new Date(t.openedAt)) === lastKey && (new Date(t.openedAt) > NOW || new Date(t.closedAt) > NOW)) { info.delete(t.id); trades.splice(i, 1); } }
    const openPrice = priceAt(INSTR.NQ, DAYS - 1);
    let openTrade = null;
    if (NOW.getDay() !== 0 && NOW.getDay() !== 6 && NOW.getHours() >= 15 && NOW.getHours() < 22) {
      const openEntry = new Date(NOW.getTime() - 35 * 60000); const e = openPrice;
      openTrade = { id: 'smpopen', accountId, symbol: 'NQ', direction: 1, openedAt: openEntry.toISOString(), closedAt: null, entryPrice: e, exitPrice: null, quantity: 2, multiplier: 20, fees: 6.4, plannedEntry: e - 2, plannedStop: e - 18, plannedTarget: e + 40, plannedReason: 'Pullback an die Eröffnungsrange, Trendtag.', setup: 'Pullback', strategy: 'Trendfolge', mistakes: [], emotions: ['Fokussiert'], rulesBroken: [], rating: null, notes: 'Läuft noch. Teilgewinn am ersten Ziel geplant.', screenshots: [], voiceNotes: [], propAccountIds: [ACC.topstep, ACC.apex], sample: true, createdAt: openEntry.toISOString() };
      trades.push(openTrade);
    }

    /* ---------- Prop-Konten: Zuordnung nach Fenster (Topstep + Apex teilen sich jeden zweiten Trade der letzten drei Wochen = Copy-Trading) ---------- */
    const NQES = new Set(['NQ', 'ES', 'MNQ']);
    let copyN = 0;
    for (const t of trades) {
      const m = info.get(t.id); if (!m) continue;
      if (inWin(m.di, WIN.ftmo) && FTMO_SYMS.has(t.symbol)) t.propAccountIds.push(ACC.ftmo);
      if (m.di === WIN.breach || !NQES.has(t.symbol)) continue;
      if (inWin(m.di, WIN.topstep) && t.quantity <= 5) { t.propAccountIds.push(ACC.topstep); if (copyN++ % 2 === 0) t.propAccountIds.push(ACC.apex); continue; }
      if (inWin(m.di, WIN.apex) && t.quantity <= 14) t.propAccountIds.push(ACC.apex);
    }
    const breachTrade = breachTrades[2] || null;
    const iso = di => days[Math.max(0, Math.min(DAYS - 1, di))].toISOString();
    const dk = di => C.dayKey(days[Math.max(0, Math.min(DAYS - 1, di))]);
    const account = (id, presetId, o) => { const p = presetOf(presetId); return Object.assign({ id, firmId: p.id, firm: p.firm, name: p.name, market: p.market, size: p.size, currency: p.currency || 'USD', startBalance: p.size, rules: clone(p.rules), payout: clone(p.payout || {}), profitSplit: p.profitSplit, group: '', tz: (p.rules && p.rules.dailyLoss && p.rules.dailyLoss.tz) || 'America/Chicago', note: '', sample: true }, o); };
    const propAccounts = [
      account(ACC.topstep, 'topstep-50k', { phase: 'challenge1', status: 'active', startedAt: iso(WIN.topstep[0]), createdAt: iso(WIN.topstep[0]), phases: [{ phase: 'challenge1', at: iso(WIN.topstep[0]) }], group: 'Copy NQ', note: 'Trading Combine, Ziel 3.000. Nur NQ und ES, max. 3 Kontrakte.' }),
      account(ACC.apex, 'apex-100k', { phase: 'funded', status: 'active', startedAt: iso(WIN.apex[0]), createdAt: iso(WIN.apex[0]), phases: [{ phase: 'challenge1', at: iso(WIN.apex[0]) }, { phase: 'funded', at: iso(WIN.apexFunded) }], group: 'Copy NQ', note: 'PA-Konto seit sechs Wochen. Payout alle zwei Wochen beantragen.' }),
      account(ACC.ftmo, 'ftmo-100k', { phase: 'challenge1', status: 'breached', startedAt: iso(WIN.ftmo[0]), createdAt: iso(WIN.ftmo[0]), phases: [{ phase: 'challenge1', at: iso(WIN.ftmo[0]) }], breachedAt: breachTrade ? breachTrade.closedAt : iso(WIN.breach), note: 'Zweiter Versuch nach Reset, DAX und EURUSD in der Frühsession. Am Daily Loss Limit gescheitert.' }),
      account(ACC.mffu, 'mffu-50k', { phase: 'challenge1', status: 'archived', startedAt: iso(0), createdAt: iso(0), phases: [{ phase: 'challenge1', at: iso(0) }], note: 'Nach zwei Wochen abgebrochen: zu wenig Zeit neben dem Apex-Konto.' }),
    ];
    const expense = (id, accountId, type, amount, di, note) => ({ id, type, amount, date: dk(di), firm: propAccounts.find(a => a.id === accountId).firm, accountId, note, sample: true });
    const propExpenses = [
      expense('smpe1', ACC.mffu, 'challenge', 80, 0, 'Starter 50K'),
      expense('smpe2', ACC.apex, 'challenge', 207, WIN.apex[0], 'Evaluation 100K, Listenpreis'),
      expense('smpe3', ACC.ftmo, 'challenge', 540, WIN.ftmo[0] - 10, 'FTMO Challenge 100K (erster Versuch)'),
      expense('smpe4', ACC.ftmo, 'reset', 270, WIN.ftmo[0], 'Reset nach dem ersten Fehlversuch (Rabattaktion)'),
      expense('smpe5', ACC.apex, 'activation', 140, WIN.apexFunded, 'PA-Aktivierung einmalig'),
      expense('smpe6', ACC.apex, 'subscription', 85, WIN.apexFunded + 8, 'PA-Konto, Monatsgebühr'),
      expense('smpe7', ACC.topstep, 'challenge', 49, WIN.topstep[0], 'Trading Combine 50K'),
      expense('smpe8', ACC.apex, 'subscription', 85, WIN.apexFunded + 29, 'PA-Konto, Monatsgebühr'),
    ];
    const payout = (id, gross, reqDi, recDi, status) => ({ id, accountId: ACC.apex, firm: 'Apex Trader Funding', gross, split: 0.9, net: Math.round(gross * 0.9 * 100) / 100, requestedAt: dk(reqDi), receivedAt: recDi == null ? null : dk(recDi), status, sample: true });
    const propPayouts = [payout('smpp1', 1500, WIN.apexFunded + 12, WIN.apexFunded + 14, 'received'), payout('smpp2', 2000, WIN.apexFunded + 21, WIN.apexFunded + 23, 'received'), payout('smpp3', 1200, DAYS - 2, null, 'requested')];
    const propBreaches = breachTrade ? [{ id: 'smpb1', accountId: ACC.ftmo, tradeId: breachTrade.id, rule: 'dailyLoss', at: breachTrade.closedAt, note: 'Daily Loss Limit (5 % = 5.000) am dritten Verlust des Tages gerissen: dreifache Größe, Stop zweimal verschoben.', auto: true, sample: true }] : [];

    /* ---------- Blind-Replay: Screenshot vor Entry und „danach“ für jeden fünften geschlossenen Trade (ohne heutige, damit die Anzahl nicht von der Uhrzeit abhängt), zwei abgeschlossene Sessions ---------- */
    const closed = trades.filter(t => t.closedAt);
    const shotTrades = closed.filter(t => info.get(t.id).di < DAYS - 1).filter((t, i) => i % 5 === 2);
    const screenshots = [];
    const fmtTime = d => `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}, ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
    shotTrades.forEach((t, i) => {
      const m = info.get(t.id); const ins = INSTR[t.symbol] || INSTR.NQ;
      t.screenshotPre = 'sample-pre-' + t.id; t.screenshots = ['sample-post-' + t.id];
      const base = { symbol: t.symbol, direction: t.direction, entry: t.entryPrice, stop: t.plannedStop, target: t.plannedTarget, exit: t.exitPrice, stopDist: m ? m.stopDist : Math.abs(t.plannedEntry - t.plannedStop), dec: ins.dec, time: fmtTime(new Date(t.openedAt)), seed: 1000 + i };
      screenshots.push(Object.assign({ id: t.screenshotPre, kind: 'pre' }, base), Object.assign({ id: t.screenshots[0], kind: 'post' }, base));
    });
    const replay = [];
    const sessionAt = [WIN.topstep[0] + 2, DAYS - 5].map(di => new Date(days[Math.min(DAYS - 1, di)].getTime() + 19 * 3600000));
    [[0, 10, 'smps-replay-1'], [10, 20, 'smps-replay-2']].forEach(([a, b, sid], si) => {
      shotTrades.slice(a, b).forEach((t, i) => {
        const d = C.derive(t); const winner = d.pnl > C.EPS; const correct = rand() < 0.65; const decision = correct === winner ? 'take' : 'skip';
        replay.push({ tradeId: t.id, decision, confidence: RI(1, 3), correct, r: d.r == null ? null : roundTo(d.r, 2), at: new Date(sessionAt[si].getTime() + i * 45000).toISOString(), sessionId: sid, sample: true });
      });
    });

    /* ---------- Sprachjournal: vier Notizen ohne Audio (Transkript und Auswertung als Beispiel) ---------- */
    const voice = (id, t, transcript, analysis) => { if (!t) return; t.voiceNotes.push({ id, blobId: null, mime: null, duration: 24, transcript, sentiment: C.sentiment(transcript), analysis: Object.assign({ model: null, source: 'sample' }, analysis), pending: false, error: null, createdAt: new Date(new Date(t.closedAt).getTime() + 5 * 60000).toISOString() }); };
    const vClean = closed.find(t => t.symbol === 'NQ' && t.setup === 'Pullback' && !t.mistakes.length && info.get(t.id).win && info.get(t.id).di >= WIN.topstep[0]) || closed.find(t => t.symbol === 'NQ' && !t.mistakes.length && info.get(t.id).win);
    const vRevenge = closed.find(t => t.mistakes.includes('Revenge-Trade') && t.id !== (breachTrade && breachTrade.id) && info.get(t.id).di > WIN.breach) || closed.find(t => t.mistakes.includes('Revenge-Trade') && info.get(t.id).di !== WIN.breach);
    const vEarly = closed.find(t => t.mistakes.includes('Zu früh raus') && t.symbol !== 'EURUSD');
    voice('smpv1', vClean, 'Sauberer Pullback an die 20er EMA, das Volumen hat gepasst. Ich war ruhig, habe auf die Bestätigungskerze gewartet und den Stop nicht angefasst.', { emotion: 'Ruhig', setup: 'Pullback', mistakes: [], summary: 'Geduldig auf das Setup gewartet und nach Plan ausgeführt.' });
    voice('smpv2', vRevenge, 'Ich wollte den Verlust sofort zurückholen und bin ohne Setup wieder rein. Die Größe war viel zu hoch, ich habe gar nicht mehr auf den Stop geschaut.', { emotion: 'Frustriert', setup: null, mistakes: ['Revenge-Trade', 'Übergröße'], summary: 'Nach einem Verlust ohne Plan nachgelegt.' });
    voice('smpv3', breachTrade, 'Das war es mit dem FTMO-Konto. Dritter Verlust, dreifache Größe, ich habe den Stop zweimal nach hinten gezogen. Ich war wie im Tunnel.', { emotion: 'Ängstlich', setup: null, mistakes: ['Stop verschoben', 'Übergröße', 'Revenge-Trade'], summary: 'Tilt: Stop verschoben und Größe verdreifacht, Konto geplatzt.' });
    voice('smpv4', vEarly, 'Der Trade lief sofort in meine Richtung, aber ich habe bei einem halben R schon alles rausgenommen. Angst, dass er wieder dreht.', { emotion: 'Ängstlich', setup: 'Breakout', mistakes: ['Zu früh raus'], summary: 'Gewinn aus Angst zu früh mitgenommen.' });

    /* ---------- Verpasste Trades, Strategien, Regeln, Ordner, Tags, Notizen ---------- */
    const missed = [
      { symbol: 'NQ', direction: 1, setup: 'Breakout', reason: 'Zu lange gezögert, Einstieg verpasst.', pnl: 640, r: 1.9 },
      { symbol: 'GC', direction: -1, setup: 'Reversal', reason: 'Angst nach dem Verlust davor.', pnl: -270, r: -0.8 },
      { symbol: 'ES', direction: 1, setup: 'Pullback', reason: 'Nicht am Rechner gewesen.', pnl: 525, r: 2.4 },
      { symbol: 'EURUSD', direction: 1, setup: 'Range-Fade', reason: 'Wollte auf Bestätigung warten. Kam nie.', pnl: 188, r: 1.1 },
      { symbol: 'DAX', direction: 1, setup: 'Pullback', reason: 'Setup nicht getraut, war aber lehrbuchmäßig.', pnl: 405, r: 1.6 },
      { symbol: 'NQ', direction: -1, setup: 'Reversal', reason: 'Zu lange gezögert, Einstieg verpasst.', pnl: -320, r: -0.9 },
    ].map((m, i) => Object.assign(m, { id: 'smpm' + i, date: C.dayKey(new Date(NOW.getTime() - (i * 6 + 2) * 86400000)), sample: true }));
    const strategies = [
      { id: 'smps1', name: 'Trendfolge', description: 'Mit dem übergeordneten Trend handeln: Pullbacks an gleitende Durchschnitte und Ausbrüche aus Konsolidierungen, vor allem NQ und ES in der US-Session.', setups: ['Pullback', 'Breakout'], rules: ['Nur in Richtung des 1h-Trends', 'Einstieg erst nach Bestätigungskerze', 'Ziel mindestens 1,5 R'], sample: true },
      { id: 'smps2', name: 'Mean Reversion', description: 'Übertreibungen an Range-Grenzen und nach Fehlausbrüchen handeln.', setups: ['Range-Fade', 'Reversal'], rules: ['Nur in klaren Ranges', 'Stop hinter dem Extrem', 'Bei Trendtagen aussetzen'], sample: true },
    ];
    const rules = RULES.map(r => Object.assign({ active: true, sample: true }, r));
    const firstLoss = closed.find(t => (t.exitPrice - t.entryPrice) * t.direction < 0 && t.mistakes.includes('Zu früh raus')) || closed.find(t => t.mistakes.length) || closed[0];
    const folders = [{ id: 'smpf-strategie', name: 'Strategie', color: '#8a8380', isDefault: false, defaultTemplateId: null, order: 10, createdAt: new Date(NOW.getTime() - 40 * 86400000).toISOString(), sample: true }, { id: 'smpf-ideen', name: 'Ideen', color: '#ee6018', isDefault: false, defaultTemplateId: null, order: 11, createdAt: new Date(NOW.getTime() - 20 * 86400000).toISOString(), sample: true }];
    const noteTags = [{ id: 'smpt-tilt', name: 'Tilt', sample: true }, { id: 'smpt-lehre', name: 'Lehre', sample: true }, { id: 'smpt-setup', name: 'Setup', sample: true }, { id: 'smpt-fomc', name: 'FOMC', sample: true }, { id: 'smpt-prop', name: 'Prop Firm', sample: true }];
    const ago = d => new Date(NOW.getTime() - d * 86400000).toISOString();
    notes.push({ id: 'smpn-strat', folderId: 'smpf-strategie', type: 'normal', title: 'Warum Pullbacks besser laufen als Breakouts', tags: ['smpt-setup'], deletedAt: null, content: { ops: [{ insert: 'Beobachtung nach 3 Monaten' }, { attributes: { header: 2 }, insert: '\n' }, { insert: 'Pullbacks im Trend haben die beste Trefferquote, Breakouts brauchen einen Trendtag mit hoher Vola. In Seitwärtsphasen Breakouts komplett streichen.\n' }, { insert: 'Regime morgens festlegen' }, { attributes: { list: 'checked' }, insert: '\n' }, { insert: 'Setups danach filtern' }, { attributes: { list: 'unchecked' }, insert: '\n' }] }, createdAt: ago(9), updatedAt: ago(9), sample: true });
    notes.push({ id: 'smpn-trade', folderId: 'trades', type: 'trade', tradeId: firstLoss ? firstLoss.id : null, dateKey: firstLoss ? C.dayKey(new Date(firstLoss.openedAt)) : null, title: firstLoss ? `${firstLoss.symbol} ${firstLoss.direction === -1 ? 'Short' : 'Long'}: zu früh raus` : 'Trade-Notiz', tags: ['smpt-lehre'], deletedAt: null, content: { ops: [{ insert: 'Der Ausbruch lief sauber, aber ich habe bei 0,5 R Teilgewinn genommen und den Rest bei 0,8 R geschlossen. Ziel wäre 2,4 R gewesen.\n' }, { insert: 'Regel: Erst ab 1 R Teilgewinn, Rest mit Trailing-Stop laufen lassen.' }, { attributes: { blockquote: true }, insert: '\n' }] }, createdAt: ago(4), updatedAt: ago(4), sample: true });
    notes.push({ id: 'smpn-recap', folderId: 'recap', type: 'normal', title: 'Session-Recap KW ' + C.isoWeek(NOW), tags: ['smpt-fomc'], deletedAt: null, content: { ops: [{ insert: 'Woche im Rückblick' }, { attributes: { header: 2 }, insert: '\n' }, { insert: 'FOMC am Mittwoch hat die Vola im NQ hochgezogen, danach zwei saubere Trendtage. Donnerstag Overtrading, Freitag Pause.\n' }, { insert: 'Nächste Woche: maximal drei Trades pro Tag, Topstep-Puffer im Blick behalten.' }, { attributes: { bold: true }, insert: '' }, { insert: '\n' }] }, createdAt: ago(2), updatedAt: ago(1), sample: true });
    notes.push({ id: 'smpn-idea', folderId: 'smpf-ideen', type: 'normal', title: 'Idee: Eröffnungsrange nur an Trendtagen', tags: ['smpt-setup'], deletedAt: null, content: { ops: [{ insert: 'Hypothese: Der Ausbruch aus der Eröffnungsrange im NQ funktioniert nur, wenn der Vortag ein Trendtag war.\n' }, { insert: 'Prüfen: Statistiken → Marktphase → Setups je Marktphase.\n' }] }, createdAt: ago(6), updatedAt: ago(5), sample: true });
    notes.push({ id: 'smpn-prop', folderId: 'smpf-strategie', type: 'normal', title: 'Prop-Plan: Topstep bestehen, Apex halten', tags: ['smpt-prop'], deletedAt: null, content: { ops: [{ insert: 'Regeln für die Prop-Konten' }, { attributes: { header: 2 }, insert: '\n' }, { insert: 'Topstep: höchstens 3 Kontrakte, Tagesverlust 600 ist Schluss (Consistency 50 %).' }, { attributes: { list: 'bullet' }, insert: '\n' }, { insert: 'Apex: Payout alle zwei Wochen, kein Tag über 30 % des Gesamtgewinns.' }, { attributes: { list: 'bullet' }, insert: '\n' }, { insert: 'FTMO-Lehre: Nach zwei Verlusten in Folge ist der Tag vorbei.' }, { attributes: { list: 'bullet' }, insert: '\n' }] }, createdAt: ago(12), updatedAt: ago(3), sample: true });
    return { trades, days: dayMap, notes, folders, noteTags, missed, strategies, rules, propAccounts, propExpenses, propPayouts, propBreaches, replay, screenshots };
  }

  /* ---------- Screenshots: deterministisches Kerzenchart als PNG (nur im Browser; in Node gibt es kein Canvas) ---------- */
  const fmtPrice = (v, dec) => { try { return Number(v).toLocaleString('de-DE', { minimumFractionDigits: dec, maximumFractionDigits: dec }); } catch (e) { return String(v); } };
  function drawChart(spec) {
    const W = 720, H = 405; const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d'); if (!g) return Promise.resolve(null);
    const rng = C.mulberry(spec.seed || 1); const gauss = (m, s) => { const u = rng() || 1e-9, v = rng(); return m + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    const N = 40, dir = spec.direction === -1 ? -1 : 1, entry = Number(spec.entry); const sd = Number(spec.stopDist) > 0 ? Number(spec.stopDist) : Math.max(Math.abs(entry - Number(spec.stop)) || 0, entry * 0.001);
    const closes = new Array(N); closes[N - 1] = entry;
    for (let i = N - 2; i >= 0; i--) closes[i] = closes[i + 1] - gauss(0, sd * 0.45) - dir * sd * 0.04;
    const candles = []; for (let i = 0; i < N; i++) { const o = i ? closes[i - 1] : closes[0] - gauss(0, sd * 0.3); const c = closes[i]; candles.push({ o, c, hi: Math.max(o, c) + Math.abs(gauss(0, sd * 0.25)), lo: Math.min(o, c) - Math.abs(gauss(0, sd * 0.25)) }); }
    const post = [];
    if (spec.kind === 'post' && spec.exit != null) { const M = 10 + Math.floor(rng() * 7); let prev = entry; for (let k = 1; k <= M; k++) { const c = k === M ? Number(spec.exit) : entry + (Number(spec.exit) - entry) * (k / M) + gauss(0, sd * 0.3); post.push({ o: prev, c, hi: Math.max(prev, c) + Math.abs(gauss(0, sd * 0.2)), lo: Math.min(prev, c) - Math.abs(gauss(0, sd * 0.2)) }); prev = c; } }
    const all = candles.concat(post); const levels = [entry, spec.stop, spec.target].filter(v => v != null && v !== '').map(Number);
    let min = Math.min(...all.map(c => c.lo), ...levels), max = Math.max(...all.map(c => c.hi), ...levels); const pad = (max - min) * 0.08 || 1; min -= pad; max += pad;
    const L = 16, RM = 118, T = 46, B = 30; const pw = W - L - RM, ph = H - T - B; const slots = N + (post.length ? post.length + 3 : 7); const slot = pw / slots;
    const x = i => L + i * slot + slot / 2, y = v => T + (max - v) / (max - min) * ph; const dec = spec.dec == null ? 2 : spec.dec;
    g.fillStyle = '#101010'; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(238,238,238,0.07)'; g.lineWidth = 1; g.font = MONO; g.textAlign = 'left';
    for (let k = 0; k <= 5; k++) { const yy = T + k * ph / 5; g.beginPath(); g.moveTo(L, yy); g.lineTo(W - RM + 64, yy); g.stroke(); g.fillStyle = '#8a8380'; g.fillText(fmtPrice(max - k * (max - min) / 5, dec), W - RM + 70, yy + 4); }
    const candle = (c, i) => { const up = c.c >= c.o; g.strokeStyle = g.fillStyle = up ? '#a0ca92' : '#ee6018'; g.lineWidth = 1; g.beginPath(); g.moveTo(x(i), y(c.hi)); g.lineTo(x(i), y(c.lo)); g.stroke(); const bw = Math.max(3, slot * 0.6); g.fillRect(x(i) - bw / 2, y(Math.max(c.o, c.c)), bw, Math.max(1.5, Math.abs(y(c.o) - y(c.c)))); };
    candles.forEach(candle); post.forEach((c, k) => candle(c, N + k));
    const line = (v, color, label, dash) => { g.setLineDash(dash); g.strokeStyle = color; g.lineWidth = 1.2; g.beginPath(); g.moveTo(L, y(v)); g.lineTo(W - RM + 64, y(v)); g.stroke(); g.setLineDash([]); g.fillStyle = color; g.font = MONO; g.textAlign = 'right'; g.fillText(label, W - RM + 58, y(v) - 4); };
    if (spec.stop != null && spec.stop !== '') line(Number(spec.stop), '#ee6018', 'Stop ' + fmtPrice(spec.stop, dec), [5, 4]);
    if (spec.target != null && spec.target !== '') line(Number(spec.target), '#a0ca92', 'Ziel ' + fmtPrice(spec.target, dec), [5, 4]);
    line(entry, '#eeeeee', 'Einstieg ' + fmtPrice(entry, dec), [2, 3]);
    const arrow = (cx, cy, up, color) => { g.fillStyle = color; g.beginPath(); const s = 7; if (up) { g.moveTo(cx, cy - 4); g.lineTo(cx - s, cy + s); g.lineTo(cx + s, cy + s); } else { g.moveTo(cx, cy + 4); g.lineTo(cx - s, cy - s); g.lineTo(cx + s, cy - s); } g.closePath(); g.fill(); };
    arrow(x(N - 1), y(entry) + (dir > 0 ? 14 : -14), dir > 0, '#eeeeee');
    if (post.length) { const ex = Number(spec.exit); arrow(x(N + post.length - 1), y(ex) + (dir > 0 ? -14 : 14), dir < 0, '#b8b3b0'); g.fillStyle = '#b8b3b0'; g.font = MONO; g.textAlign = 'right'; g.fillText('Ausstieg ' + fmtPrice(ex, dec), W - RM + 58, y(ex) + (dir > 0 ? 14 : -6)); }
    const title = `${spec.symbol || ''} · ${dir > 0 ? 'Long' : 'Short'}`;
    g.fillStyle = '#eeeeee'; g.font = '16px Geist, ui-sans-serif, system-ui, sans-serif'; g.textAlign = 'left'; g.fillText(title, 16, 26); const titleW = g.measureText(title).width;
    g.fillStyle = '#8a8380'; g.font = '13px Geist, ui-sans-serif, system-ui, sans-serif'; g.fillText(`5 min · ${spec.time || ''} · ${spec.kind === 'post' ? 'nach dem Einstieg' : 'vor dem Einstieg'}`, 16 + titleW + 18, 26);
    g.fillStyle = '#4d4947'; g.font = MONO; g.fillText('Beispiel-Chart · Journalyst', 16, H - 10);
    return new Promise(res => { try { cv.toBlob(b => res(b || null), 'image/png'); } catch (e) { res(null); } });
  }
  /* renderScreenshots(specs, Blobs, { alive }) → Anzahl gespeicherter Bilder. alive() wird vor jedem Bild geprüft (Abbruch, wenn die Beispieldaten inzwischen entfernt wurden). */
  async function renderScreenshots(specs, Blobs, o = {}) {
    if (typeof document === 'undefined' || !Blobs || typeof Blobs.put !== 'function') return 0;
    const alive = typeof o.alive === 'function' ? o.alive : () => true; let n = 0;
    for (const s of specs || []) {
      if (!alive()) break;
      let blob = null; try { blob = await drawChart(s); } catch (e) { blob = null; }
      if (!blob || !alive()) continue;
      try { await Blobs.put(blob, s.id); n++; } catch (e) { break; /* IndexedDB nicht verfügbar */ }
    }
    return n;
  }

  const api = { generate, renderScreenshots, drawChart, VERSION, IMAGES, SEED, DAYS, WIN, ACC };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.Sample = api;
})(typeof self !== 'undefined' ? self : this);
