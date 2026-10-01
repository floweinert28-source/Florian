/* Journalyst – Schatten-Ich: Wie sähe das Konto aus, wenn der Nutzer seine eigenen Regeln zu 100 % eingehalten hätte? (ohne DOM, in Node testbar) */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./core.js'));
  else root.Shadow = factory(root.Core);
})(typeof self !== 'undefined' ? self : this, function (C) {
  'use strict';
  const EPS = C.EPS;

  /* ---------- Regelkatalog ----------
     Einheiten ('unit'): 'r' = Vielfaches der R-Einheit (opts.rUnit in Geld), 'pct' = Prozent der Kontogröße (opts.account), 'money' = Betrag. */
  const RULES = [
    { key: 'maxTrades', label: 'Max. Trades pro Tag', fields: [{ key: 'value', type: 'int', label: 'Trades', default: 3 }] },
    { key: 'dailyLoss', label: 'Max. Tagesverlust', fields: [{ key: 'value', type: 'number', label: 'Wert', default: 2 }, { key: 'unit', type: 'unit', label: 'Einheit', default: 'r' }] },
    { key: 'lossStreak', label: 'Stopp nach Verlusten in Folge', fields: [{ key: 'value', type: 'int', label: 'Verluste', default: 2 }] },
    { key: 'maxRisk', label: 'Max. Risiko pro Trade', fields: [{ key: 'value', type: 'number', label: 'Wert', default: 1 }, { key: 'unit', type: 'unit', label: 'Einheit', default: 'r' }] },
    { key: 'hours', label: 'Erlaubte Handelszeiten', fields: [{ key: 'from', type: 'time', label: 'Von', default: '08:00' }, { key: 'to', type: 'time', label: 'Bis', default: '17:00' }] },
    { key: 'setups', label: 'Nur bestimmte Setups', fields: [{ key: 'list', type: 'setups', label: 'Setups', default: [] }] },
    { key: 'cooldown', label: 'Kein neuer Trade nach Verlust', fields: [{ key: 'minutes', type: 'int', label: 'Minuten', default: 15 }] },
  ];
  const LABEL = {}; for (const r of RULES) LABEL[r.key] = r.label;
  const UNITS = ['r', 'pct', 'money'];

  /* Immer ein frisches Objekt: { maxTrades:{on:false,value:3}, dailyLoss:{on:false,value:2,unit:'r'}, ... } */
  function defaultRules() {
    const out = {};
    for (const r of RULES) { const o = { on: false }; for (const f of r.fields) o[f.key] = Array.isArray(f.default) ? f.default.slice() : f.default; out[r.key] = o; }
    return out;
  }

  /* ---------- Hilfen ---------- */
  const parseTime = s => { const m = /^(\d{1,2}):(\d{2})$/.exec(String(s == null ? '' : s).trim()); if (!m) return null; const h = +m[1], mi = +m[2]; return h > 23 || mi > 59 ? null : h * 60 + mi; };
  /* Fenster [from, to] in Minuten seit Mitternacht, inklusiv; from > to bedeutet ein Fenster über Mitternacht (z. B. 22:00–02:00) */
  const inWindow = (m, from, to) => from <= to ? m >= from && m <= to : m >= from || m <= to;
  const normSetup = s => String(s == null ? '' : s).trim().toLowerCase();
  /* Grenzwert in Geld je Einheit; null, wenn nicht bestimmbar (Einheit R ohne R-Einheit) */
  const moneyLimit = (value, unit, o) => unit === 'r' ? (o.rUnit ? value * o.rUnit : null) : unit === 'pct' ? value / 100 * o.account : value;

  /* Regeln einlesen, Defaults für fehlende Felder ergänzen und validieren. Je Regel: on, ok (anwendbar), unknown (Risiko-Regel wegen fehlender R-Einheit nicht prüfbar) */
  function readRules(rules, o, warn) {
    const src = rules && typeof rules === 'object' ? rules : {}; const cfg = {};
    for (const r of RULES) {
      const raw = src[r.key] && typeof src[r.key] === 'object' ? src[r.key] : {}; const c = { on: !!raw.on, ok: true, unknown: false };
      for (const f of r.fields) { const v = raw[f.key]; c[f.key] = v == null || v === '' ? (Array.isArray(f.default) ? f.default.slice() : f.default) : v; }
      cfg[r.key] = c; if (!c.on) continue;
      const bad = why => { c.ok = false; warn(`Regel „${r.label}“: ${why}`); };
      if (r.key === 'maxTrades' || r.key === 'lossStreak') { c.value = Math.floor(Number(c.value)); if (!(c.value >= 1)) bad('ungültiger Wert, Regel wird nicht angewendet.'); }
      else if (r.key === 'cooldown') { c.minutes = Number(c.minutes); if (!(c.minutes >= 0)) bad('ungültige Minutenzahl, Regel wird nicht angewendet.'); }
      else if (r.key === 'dailyLoss' || r.key === 'maxRisk') {
        c.value = Number(c.value); c.unit = UNITS.includes(c.unit) ? c.unit : 'r';
        if (!(c.value > 0)) bad('ungültiger Wert, Regel wird nicht angewendet.');
        else { c.limit = moneyLimit(c.value, c.unit, o); if (c.limit == null) { c.unknown = true; bad('Einheit R gewählt, aber keine R-Einheit hinterlegt – Regel nicht prüfbar.'); } }
      }
      else if (r.key === 'hours') { c.fromMin = parseTime(c.from); c.toMin = parseTime(c.to); if (c.fromMin == null || c.toMin == null) bad('Uhrzeiten nicht lesbar (Format HH:MM), Regel wird nicht angewendet.'); }
      else if (r.key === 'setups') { c.set = new Set((Array.isArray(c.list) ? c.list : []).map(normSetup).filter(Boolean)); if (!c.set.size) warn(`Regel „${r.label}“: keine Setups ausgewählt – jeder Trade gilt als Verstoß.`); }
    }
    return cfg;
  }

  /* ---------- Auswertung ----------
     trades: abgeleitete Trades (Core.deriveAll), offene werden ignoriert. rules: Objekt wie defaultRules (fehlende Regeln = aus).
     opts: { account, rUnit, now, dayKey, localMinutes, weekStart } – siehe Defaults unten.
     Tageslimits beziehen sich auf den Zustand des SCHATTEN-Kontos: nur genommene Schatten-Trades desselben Tages (dayKey(open)), die vor dem
     Öffnen des Kandidaten geschlossen waren, bilden Zählung, Tages-P&L, Verlustserie und letzten Verlust-Schlusszeitpunkt.
     Prüfreihenfolge (erste verletzte Regel = reason): hours, setups, cooldown, lossStreak, dailyLoss, maxTrades → Trade fällt raus.
     Danach maxRisk: zu großes Risiko wird auf das erlaubte Risiko herunterskaliert (P&L × Faktor), der Trade bleibt genommen.
     cost = shadowPnl − realPnl: > 0 heißt, Disziplin hätte Geld gespart; < 0 heißt, der Regelbruch hat Geld gebracht. */
  function evaluate(trades, rules, opts) {
    const o = Object.assign({ account: 10000, rUnit: null, now: null, dayKey: C.dayKey, localMinutes: d => d.getHours() * 60 + d.getMinutes(), weekStart: C.weekStart }, opts || {});
    o.account = Number(o.account) > 0 ? Number(o.account) : 10000; o.rUnit = Number(o.rUnit) > 0 ? Number(o.rUnit) : null;
    o.now = o.now instanceof Date ? o.now : o.now ? new Date(o.now) : new Date();
    const warnings = []; const warn = s => { if (!warnings.includes(s)) warnings.push(s); };
    const cfg = readRules(rules, o, warn); const active = RULES.some(r => cfg[r.key].on);
    const list = (trades || []).filter(t => t && t.closed && t.open instanceof Date && t.close instanceof Date).sort((a, b) => a.open - b.open || a.close - b.close);

    const byDay = new Map(); /* dayKey → genommene Schatten-Trades des Tages [{ close, shadowPnl }] */
    const entries = [], violations = []; let unknownRisk = 0;
    for (const t of list) {
      const key = o.dayKey(t.open); const realPnl = Number(t.pnl) || 0;
      /* Schatten-Tageszustand aus den bereits geschlossenen Schatten-Trades des Tages, in Schlussreihenfolge */
      const done = (byDay.get(key) || []).filter(x => x.close <= t.open).sort((a, b) => a.close - b.close);
      let dayPnl = 0, streak = 0, lastLoss = null;
      for (const x of done) { dayPnl += x.shadowPnl; if (x.shadowPnl < -EPS) { streak++; lastLoss = x.close; } else if (x.shadowPnl > EPS) streak = 0; }
      const viol = []; let unknown = false;
      const h = cfg.hours; if (h.on && h.ok && !inWindow(o.localMinutes(t.open), h.fromMin, h.toMin)) viol.push('hours');
      const s = cfg.setups; if (s.on && s.ok && !s.set.has(normSetup(t.setup))) viol.push('setups');
      const cd = cfg.cooldown; if (cd.on && cd.ok && lastLoss && t.open - lastLoss < cd.minutes * 60000) viol.push('cooldown');
      const ls = cfg.lossStreak; if (ls.on && ls.ok && streak >= ls.value) viol.push('lossStreak');
      const dl = cfg.dailyLoss; if (dl.on) { if (dl.ok) { if (dayPnl <= -dl.limit + EPS) viol.push('dailyLoss'); } else if (dl.unknown) unknown = true; }
      const mt = cfg.maxTrades; if (mt.on && mt.ok && done.length >= mt.value) viol.push('maxTrades');
      const taken = !viol.length; let scale = 1;
      /* Risiko-Regel: ohne Stop (risk 0) oder ohne R-Einheit nicht prüfbar → unknownRisk, keine Strafe */
      const mr = cfg.maxRisk;
      if (mr.on) { if (!mr.ok) { if (mr.unknown) unknown = true; } else if (!(t.risk > 0)) unknown = true; else if (t.risk > mr.limit + EPS) { viol.push('maxRisk'); if (taken) scale = mr.limit / t.risk; } }
      if (unknown) unknownRisk++;
      const shadowPnl = taken ? realPnl * scale : 0;
      if (taken) (byDay.get(key) || byDay.set(key, []).get(key)).push({ close: t.close, shadowPnl });
      const row = { id: t.id, taken, scale, realPnl, shadowPnl, violations: viol, reason: viol.length ? viol[0] : null };
      if (viol.length) violations.push({ tradeId: t.id, symbol: t.symbol, date: t.open.toISOString(), dayKey: key, rule: viol[0], label: LABEL[viol[0]], others: viol.slice(1), realPnl, shadowPnl, cost: shadowPnl - realPnl, r: t.r == null ? null : t.r, scale });
      entries.push({ t, row });
    }

    /* Kurve: ein Punkt je geschlossenem Trade nach close, kumuliert echt und Schatten (übersprungene ändern shadow nicht) */
    let real = 0, shadow = 0;
    const curve = entries.slice().sort((a, b) => a.t.close - b.t.close || a.t.open - b.t.open).map(e => { real += e.row.realPnl; shadow += e.row.shadowPnl; return { date: e.t.close, real, shadow, id: e.t.id }; });
    const totals = { real, shadow, cost: shadow - real };

    /* Perioden nach close: week = ab weekStart(now) bis now, month = Kalendermonat von now (über dayKey, damit die Zeitzonen-Sicht des Aufrufers gilt) */
    const ws = o.weekStart(o.now), monthKey = o.dayKey(o.now).slice(0, 7);
    const period = sel => { const p = { real: 0, shadow: 0, cost: 0, n: 0 }; for (const e of entries) if (sel(e.t)) { p.real += e.row.realPnl; p.shadow += e.row.shadowPnl; p.n++; } p.cost = p.shadow - p.real; return p; };
    const periods = { week: period(t => t.close >= ws && t.close <= o.now), month: period(t => o.dayKey(t.close).slice(0, 7) === monthKey), all: period(() => true) };

    /* Ranking aller aktiven Regeln: Kosten über Verstöße mit dieser Regel als reason, absteigend */
    const ranking = RULES.filter(r => cfg[r.key].on).map(r => { const v = violations.filter(x => x.rule === r.key); return { rule: r.key, label: r.label, n: v.length, cost: C.sum(v.map(x => x.cost)) }; }).sort((a, b) => b.cost - a.cost || b.n - a.n);

    return { active, trades: entries.map(e => e.row), violations, curve, totals, periods, ranking, unknownRisk, warnings };
  }

  return { RULES, defaultRules, evaluate };
});
