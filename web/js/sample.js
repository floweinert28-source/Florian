/* Beispieldaten (deterministisch, markiert mit sample: true, jederzeit entfernbar) */
(function (root) {
  'use strict';
  const C = root.Core || (typeof require === 'function' ? require('./core.js') : null);

  function generate(opts = {}) {
    const rand = C.mulberry(opts.seed == null ? 12 : opts.seed);
    const R = (a, b) => a + rand() * (b - a);
    const RI = (a, b) => Math.floor(R(a, b + 1));
    const pick = arr => arr[Math.floor(rand() * arr.length)];
    const gauss = (m = 0, s = 1) => { const u = rand() || 1e-9, v = rand(); return m + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    const roundTo = (v, d) => Math.round(v * 10 ** d) / 10 ** d;
    const clamp = C.clamp;
    const NOW = opts.now ? new Date(opts.now) : new Date();
    const ACCOUNT = opts.account || 25000;
    const accountId = opts.accountId || 'main';

    const INSTR = [
      { s: 'DAX', base: 18250, stop: [15, 40], mult: 1, dec: 1, qd: 1 },
      { s: 'NASDAQ', base: 19400, stop: [20, 60], mult: 1, dec: 1, qd: 1 },
      { s: 'EURUSD', base: 1.085, stop: [0.0008, 0.0025], mult: 100000, dec: 5, qd: 2 },
      { s: 'GOLD', base: 2340, stop: [4, 12], mult: 1, dec: 2, qd: 1 },
      { s: 'AAPL', base: 192, stop: [0.8, 2.2], mult: 1, dec: 2, qd: 0 },
    ];
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
    const REASONS = ['Rücklauf an die 20er EMA im Aufwärtstrend, Volumen nimmt ab.', 'Ausbruch über das Tageshoch nach enger Konsolidierung.', 'Fehlausbruch am Range-Hoch, Ablehnung mit langem Docht.', 'Doppelboden am Vortagestief mit Divergenz.', 'Retest der Ausbruchszone nach Eröffnungsimpuls.', 'Abpraller am VWAP mit steigender Marktbreite.'];

    const tradingDays = count => { const days = []; const c = new Date(NOW); c.setHours(0, 0, 0, 0); while (days.length < count) { const wd = c.getDay(); if (wd !== 0 && wd !== 6) days.push(new Date(c)); c.setDate(c.getDate() - 1); } return days.reverse(); };
    const trades = [], days = {}, notes = [];
    let n = 0;
    tradingDays(opts.days || 88).forEach((day, di) => {
      const key = C.dayKey(day);
      const regime = { trend: rand() < 0.55 ? 'trending' : 'ranging', vol: pick(['low', 'normal', 'normal', 'high']) };
      const tilt = di % 11 === 4;
      const entry = { key, regime, sample: true };
      if (rand() < 0.82) { const sleep = tilt ? R(4.8, 6) : R(6, 8.6); entry.checkIn = { sleep: Math.round(sleep * 2) / 2, stress: tilt ? RI(4, 5) : RI(1, 4), mood: tilt ? RI(1, 3) : RI(2, 5), note: tilt ? 'Schlecht geschlafen, unruhig.' : '', createdAt: new Date(day.getTime() + 8 * 3600000).toISOString() }; }
      const count = tilt ? RI(4, 6) : pick([0, 1, 1, 2, 2, 2, 3, 3]);
      days[key] = entry;
      if (!count) return;
      let cursor = new Date(day); cursor.setHours(9, RI(0, 45), 0, 0);
      let prevLoss = false, prevRisk = 0, prevExit = cursor; const brokenToday = new Set();
      for (let ti = 0; ti < count; ti++) {
        const ins = pick(INSTR), setup = pick(SETUPS), dir = rand() < 0.55 ? 1 : -1;
        const mistakes = [], rules = [];
        if (rand() < (tilt ? 0.55 : 0.16)) {
          mistakes.push(pick(MISTAKES));
          if (mistakes.includes('Stop verschoben')) rules.push(RULES[1].text);
          if (mistakes.includes('Übergröße')) rules.push(RULES[2].text);
          if (mistakes.includes('Regel gebrochen') && rand() < 0.7) rules.push(pick([RULES[0], RULES[3], RULES[4]]).text);
        }
        const revenge = tilt && prevLoss && ti > 0 && rand() < 0.5;
        if (revenge && !mistakes.includes('Revenge-Trade')) mistakes.push('Revenge-Trade');
        let risk = ACCOUNT * R(0.005, 0.010);
        if (tilt && prevLoss && prevRisk > 0) { risk = Math.min(prevRisk * R(1.6, 2.4), ACCOUNT * 0.03); if (!mistakes.includes('Übergröße')) mistakes.push('Übergröße'); }
        if (mistakes.includes('Übergröße') && risk < ACCOUNT * 0.015) risk = ACCOUNT * R(0.015, 0.02);
        if (ti > 0) cursor = new Date(prevExit.getTime() + (tilt ? RI(3, 9) : RI(25, 140)) * 60000);
        const hour = cursor.getHours(); if (hour >= 18) break;
        let wp = setup.wr + (regime.trend === 'trending' ? setup.tb : setup.rb);
        if (hour >= 9 && hour < 11) wp += 0.06; if (hour >= 12 && hour < 14) wp -= 0.08;
        if (day.getDay() === 5) wp -= 0.06; if (mistakes.length) wp -= 0.30; if (regime.vol === 'high') wp -= 0.03;
        wp = clamp(wp, 0.15, 0.85);
        const win = rand() < wp;
        let rr;
        if (win) { rr = R(0.7, 2.6); if (mistakes.includes('Zu früh raus')) rr = R(0.2, 0.6); if (setup.n === 'Breakout') rr += 0.3; if (mistakes.length) rr = Math.min(rr, 1.1); }
        else { rr = -R(0.75, 1.1); if (mistakes.includes('Stop verschoben')) rr = -R(1.4, 2.1); }
        const stopDist = R(ins.stop[0], ins.stop[1]);
        const plannedEntry = roundTo(ins.base + ins.base * R(-0.03, 0.03), ins.dec);
        const devR = mistakes.includes('FOMO') ? R(0.45, 0.9) : Math.abs(gauss(0, 0.12));
        const entryPrice = roundTo(plannedEntry + dir * devR * stopDist, ins.dec);
        const plannedStop = roundTo(plannedEntry - dir * stopDist, ins.dec);
        const plannedTarget = roundTo(plannedEntry + dir * stopDist * R(1.5, 3), ins.dec);
        const exitPrice = roundTo(entryPrice + dir * rr * stopDist, ins.dec);
        const qty = Math.max(roundTo(risk / (stopDist * ins.mult), ins.qd), ins.qd ? 0.1 : 1);
        const fees = roundTo(R(0.8, 3.5), 2);
        const maeR = win ? R(0.05, 0.6) : Math.min(Math.abs(rr), R(0.8, 1.15));
        const mfeR = win ? rr + R(0, 0.5) : R(0, 0.55);
        const holding = pick([4, 8, 12, 18, 25, 35, 50, 75, 110, 160, 240, 330]);
        const exit = new Date(cursor.getTime() + holding * 60000);
        const emotions = mistakes.length || tilt ? [pick(['Unsicher', 'Gierig', 'Ängstlich', 'Euphorisch'])] : (rand() < 0.7 ? [pick(['Ruhig', 'Fokussiert', 'Gelangweilt'])] : []);
        rules.forEach(r => brokenToday.add(r));
        trades.push({
          id: 'smp' + (++n), accountId, symbol: ins.s, direction: dir, openedAt: cursor.toISOString(), closedAt: exit.toISOString(), entryPrice, exitPrice, quantity: qty, multiplier: ins.mult, fees,
          plannedEntry, plannedStop, plannedTarget, plannedReason: pick(REASONS), mae: roundTo(entryPrice - dir * maeR * stopDist, ins.dec), mfe: roundTo(entryPrice + dir * mfeR * stopDist, ins.dec),
          setup: setup.n, strategy: setup.strat, mistakes, emotions, rulesBroken: rules, rating: mistakes.length ? RI(1, 2) : RI(3, 5),
          notes: mistakes.length ? pick(['Ungeduldig geworden.', 'Wollte den Verlust zurückholen.', 'Regeln ignoriert. Nicht wieder.', 'Zu groß, Nerven lagen blank.']) : pick(['Sauber nach Plan.', 'Gutes Timing, Ausführung passte.', '', 'Etwas zu früh gehandelt, sonst okay.']),
          screenshots: [], voiceNotes: [], sample: true, createdAt: exit.toISOString(),
        });
        prevLoss = !win; prevRisk = risk; prevExit = exit;
      }
      entry.rulesFollowed = RULES.filter(r => !brokenToday.has(r.text)).map(r => r.id);
      if (tilt) notes.push({ id: 'smpn' + key, folder: 'daily', dateKey: key, title: `Tagesjournal ${day.toLocaleDateString('de-DE')}`, body: `Schlecht geschlafen, schon vor der Eröffnung unruhig. Nach dem zweiten Verlust wollte ich es zurückholen und habe die Größe erhöht. Genau das Muster, das ich vermeiden will.\n\nLehre: Nach zwei Verlusten Rechner zu, Spaziergang, erst nachmittags wieder schauen.`, createdAt: exit(day).toISOString(), updatedAt: exit(day).toISOString(), sample: true });
    });
    function exit(day) { return new Date(day.getTime() + 17 * 3600000); }
    if (NOW.getDay() !== 0 && NOW.getDay() !== 6 && rand() < 2) {
      const openEntry = new Date(NOW.getTime() - 35 * 60000); const e = 18290;
      trades.push({ id: 'smpopen', accountId, symbol: 'DAX', direction: 1, openedAt: openEntry.toISOString(), closedAt: null, entryPrice: e, exitPrice: null, quantity: 6, multiplier: 1, fees: 1.2, plannedEntry: e - 2, plannedStop: e - 28, plannedTarget: e + 55, plannedReason: 'Pullback an die Eröffnungsrange, Trendtag.', setup: 'Pullback', strategy: 'Trendfolge', mistakes: [], emotions: ['Fokussiert'], rulesBroken: [], rating: null, notes: 'Läuft noch. Teilgewinn am ersten Ziel geplant.', screenshots: [], voiceNotes: [], sample: true, createdAt: openEntry.toISOString() });
    }
    const missed = [
      { symbol: 'NASDAQ', direction: 1, setup: 'Breakout', reason: 'Zu lange gezögert, Einstieg verpasst.', pnl: 312, r: 1.9 },
      { symbol: 'GOLD', direction: -1, setup: 'Reversal', reason: 'Angst nach dem Verlust davor.', pnl: -146, r: -0.8 },
      { symbol: 'DAX', direction: 1, setup: 'Pullback', reason: 'Nicht am Rechner gewesen.', pnl: 405, r: 2.4 },
      { symbol: 'EURUSD', direction: 1, setup: 'Range-Fade', reason: 'Wollte auf Bestätigung warten. Kam nie.', pnl: 188, r: 1.1 },
      { symbol: 'AAPL', direction: 1, setup: 'Pullback', reason: 'Setup nicht getraut, war aber lehrbuchmäßig.', pnl: 260, r: 1.6 },
      { symbol: 'DAX', direction: -1, setup: 'Reversal', reason: 'Zu lange gezögert, Einstieg verpasst.', pnl: -170, r: -0.9 },
    ].map((m, i) => Object.assign(m, { id: 'smpm' + i, date: C.dayKey(new Date(NOW.getTime() - (i * 6 + 2) * 86400000)), sample: true }));
    const strategies = [
      { id: 'smps1', name: 'Trendfolge', description: 'Mit dem übergeordneten Trend handeln: Pullbacks an gleitende Durchschnitte und Ausbrüche aus Konsolidierungen.', setups: ['Pullback', 'Breakout'], rules: ['Nur in Richtung des 1h-Trends', 'Einstieg erst nach Bestätigungskerze', 'Ziel mindestens 1,5 R'], sample: true },
      { id: 'smps2', name: 'Mean Reversion', description: 'Übertreibungen an Range-Grenzen und nach Fehlausbrüchen handeln.', setups: ['Range-Fade', 'Reversal'], rules: ['Nur in klaren Ranges', 'Stop hinter dem Extrem', 'Bei Trendtagen aussetzen'], sample: true },
    ];
    const rules = RULES.map(r => Object.assign({ active: true, sample: true }, r));
    notes.push({ id: 'smpn-strat', folder: 'strategy', title: 'Warum Pullbacks besser laufen als Breakouts', body: 'Beobachtung nach 3 Monaten: Pullbacks im Trend haben die beste Trefferquote, Breakouts brauchen einen Trendtag mit hoher Vola. In Seitwärtsphasen Breakouts komplett streichen.\n\nNächster Schritt: Regime morgens festlegen und Setups danach filtern.', createdAt: new Date(NOW.getTime() - 9 * 86400000).toISOString(), updatedAt: new Date(NOW.getTime() - 9 * 86400000).toISOString(), sample: true });
    notes.push({ id: 'smpn-trade', folder: 'trades', title: 'DAX Breakout: zu früh raus', body: 'Der Ausbruch lief sauber, aber ich habe bei 0,5 R Teilgewinn genommen und den Rest bei 0,8 R geschlossen. Ziel wäre 2,4 R gewesen.\n\nRegel: Erst ab 1 R Teilgewinn, Rest mit Trailing-Stop laufen lassen.', createdAt: new Date(NOW.getTime() - 4 * 86400000).toISOString(), updatedAt: new Date(NOW.getTime() - 4 * 86400000).toISOString(), sample: true });
    return { trades, days, notes, missed, strategies, rules };
  }
  const api = { generate };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.Sample = api;
})(typeof self !== 'undefined' ? self : this);
