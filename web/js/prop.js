/* Journalyst – Prop-Firm-Regel-Engine (ohne DOM, deterministisch, auch in Node testbar)
 *
 * Bewertet Prop-Firm-Konten (Futures mit Kontrakten/Tick-Werten und Forex/CFD mit Lots/Pip-Werten) gegen ein RuleSet:
 * Daily Loss, Drawdown (static / trailing_intraday / trailing_eod / trailing_lock), Profit Target, Mindest-Handelstage,
 * Max-Kontrakte und Consistency Rule. Dazu Stop-Größe, Positionsgröße, Payout-Planung und Kosten-/Erlös-Bilanz.
 *
 * Datenmodell (nur Strukturen, keine Persistenz):
 *   RuleSet: { dailyLoss: { value, mode: 'abs'|'pct', basis: 'balance'|'equity', resetTime: 'HH:MM', tz: IANA } | null,
 *              drawdown: { value, mode, type: 'static'|'trailing_intraday'|'trailing_eod'|'trailing_lock', lockAt: number|null, basis: 'intraday'|'eod' } | null,
 *              profitTarget: { value, mode } | null, minTradingDays: number|null, maxContracts: number|null, consistency: { maxDayPct } | null }
 *   Account: { id, size, startBalance, startedAt: ISO, phase: 'challenge1'|'challenge2'|'funded', status: 'active'|'passed'|'breached'|'archived', rules: RuleSet, tz }
 *
 * Wichtige Annahmen (bewusst dokumentiert):
 *   - 'pct' bezieht sich immer auf die Startbalance und ist in Prozentpunkten angegeben (5 → 5 %). Auch consistency.maxDayPct ist in Prozent (30 → 30 %).
 *   - Nur GESCHLOSSENE Trades bewegen die Balance; offene Trades haben pnl 0 und werden ignoriert. Unrealisierte Verluste sind dem Journal nicht
 *     bekannt, daher ist basis 'equity' rechnerisch identisch mit 'balance'. Ein echter Equity-Breach (offene Position läuft gegen dich) kann hier nicht erkannt werden.
 *   - Zeitpunkt der Realisierung ist t.close (Core.derive). Handelstage werden über resetTime/tz bestimmt (siehe dayKey).
 *   - Der Aufrufer übergibt die Trades DES Kontos (keine Filterung nach accountId hier). Trades nach opts.now werden ignoriert („Stand zum Zeitpunkt now“).
 *   - Jede Verletzung (auch maxContracts) setzt status 'breached'; ob eine Firma Kontrakt-Verstöße nur verwarnt, muss die UI entscheiden (contracts.breaches liefert die Anzahl).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./core.js'));
  else root.Prop = factory(root.Core);
})(typeof self !== 'undefined' ? self : this, function (C) {
  'use strict';

  /* ---------- Hilfen ---------- */
  const EPS = C.EPS; /* 0,005 – Toleranz für Geldbeträge (halber Cent) */
  const num = (v, d = 0) => { const n = Number(v); return v == null || v === '' || !isFinite(n) ? d : n; };
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const pad2 = n => String(n).padStart(2, '0');
  const round2 = v => Math.round(v * 100) / 100;
  const isDate = d => d instanceof Date && !isNaN(d);

  /* ---------- Zeitzonen und Handelstag ---------- */
  /* Intl-Formatter je Zeitzone cachen (Erzeugung ist teuer). Ungültige Zeitzone → UTC. hourCycle h23 vermeidet die „24:00“-Falle von hour12:false. */
  const fmtCache = new Map();
  function tzFormatter(tz) {
    if (fmtCache.has(tz)) return fmtCache.get(tz);
    let f;
    try { f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }); }
    catch (e) { f = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }); }
    fmtCache.set(tz, f); return f;
  }
  const systemTz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch (e) { return 'UTC'; } };
  /* Kalenderbestandteile eines Zeitpunkts in einer Zeitzone: { year, month (1–12), day, hour (0–23), minute } */
  function partsIn(date, tz) { const o = {}; for (const p of tzFormatter(tz).formatToParts(date)) if (p.type !== 'literal') o[p.type] = Number(p.value); return o; }
  /* 'HH:MM' → Minuten seit Mitternacht; leer/ungültig → 0 (Mitternacht) */
  function parseResetTime(s) { const m = /^(\d{1,2}):(\d{2})$/.exec(String(s == null ? '' : s).trim()); return m ? clamp(+m[1], 0, 23) * 60 + clamp(+m[2], 0, 59) : 0; }
  /* Handelstag-Key 'YYYY-MM-DD'. Konvention: Ein Handelstag beginnt um resetTime (in tz) und trägt das Kalenderdatum seines BEGINNS.
   * Liegt die Uhrzeit in tz vor resetTime, gehört der Zeitpunkt zum Handelstag, der am Vortag um resetTime begann (Key = Vortag).
   * Beispiel New York 17:00: 16:59 am 2.3. → '2026-03-01', 17:01 am 2.3. → '2026-03-02'. Mit resetTime 00:00 ist der Key einfach das Kalenderdatum in tz.
   * Der Vortag wird über die Kalenderbestandteile berechnet (Date.UTC mit day − 1), nicht über „minus 24 h“, damit Sommerzeit-Wechsel keine Rolle spielen. */
  function dayKey(date, resetTime, tz) {
    const d = isDate(date) ? date : new Date(date); if (!isDate(d)) return null;
    const p = partsIn(d, tz || systemTz()); const reset = parseResetTime(resetTime);
    if (p.hour * 60 + p.minute < reset) { const prev = new Date(Date.UTC(p.year, p.month - 1, p.day - 1)); return `${prev.getUTCFullYear()}-${pad2(prev.getUTCMonth() + 1)}-${pad2(prev.getUTCDate())}`; }
    return `${p.year}-${pad2(p.month)}-${pad2(p.day)}`;
  }

  const DD_LABEL = { static: 'statisch', trailing_intraday: 'trailing intraday', trailing_eod: 'trailing Tagesende', trailing_lock: 'trailing + Lock' };

  /* ---------- Limits ---------- */
  /* Absolutes Limit einer Regel: 'pct' → Prozent der Startbalance (5 → 5 %), 'abs' → Wert wie angegeben. null ohne Regel. */
  function limitOf(rule, startBalance) { if (!rule || rule.value == null || rule.value === '') return null; const v = Math.abs(num(rule.value)); if (!(v > 0)) return null; /* 0 = keine Regel */ return rule.mode === 'pct' ? num(startBalance) * v / 100 : v; }

  /* ---------- Consistency Rule ---------- */
  /* Bester Tag darf höchstens maxDayPct % des Gesamtgewinns (total = Balance − Startbalance) ausmachen. Ohne Gewinn (total ≤ 0) ist die Regel nicht anwendbar → ok, bestDayPct null.
   * allowedToday: Wie viel darf heute noch verdient werden, bevor die Regel kippt? Mit m = maxDayPct/100, T = total, D = heutiger Tages-P&L gilt nach weiterem Gewinn x:
   *   (D + x) / (T + x) ≤ m  ⇔  x ≤ (m·T − D) / (1 − m)      (heute wird spätestens an dieser Grenze der beste Tag; ist die Regel aktuell ok, ist der bisherige beste Tag dann automatisch unter m)
   * Ist T ≤ 0, darf mindestens −T verdient werden (dann ist total = 0, Regel nicht anwendbar), daher max(−T, Formel). Ist die Regel schon verletzt → 0. m ≥ 1 → Infinity (nie verletzbar). */
  function consistencyOf(days, todayKey, total, maxDayPct) {
    const m = num(maxDayPct) / 100; const list = days || [];
    const best = list.reduce((b, d) => !b || d.pnl > b.pnl ? d : b, null); const bestDay = best ? Math.max(0, best.pnl) : 0;
    const bestDayPct = total > EPS && bestDay > EPS ? bestDay / total : null;
    const ok = bestDayPct == null || bestDayPct <= m + 1e-9;
    const today = list.find(d => d.key === todayKey); const D = today ? today.pnl : 0;
    const allowedToday = m >= 1 ? Infinity : !ok ? 0 : Math.max(0, -total, (m * total - D) / (1 - m));
    return { bestDay, bestDayKey: best ? best.key : null, bestDayPct, maxDayPct: num(maxDayPct), max: m, ok, allowedToday, todayPnl: D, total };
  }

  /* ---------- Bewertung eines Kontos ---------- */
  /* evaluate(account, trades, opts = { now, thresholds: { yellow: 0.5, red: 0.25 }, stopSize })
   * Läuft chronologisch über alle geschlossenen Trades (close ≤ now), führt Balance, Handelstage, Peak/Floor und sammelt Verletzungen (erste je Regel; Kontrakt-Verstöße alle). */
  function evaluate(account, trades, opts = {}) {
    const acc = account || {}; const rules = acc.rules || {};
    const start = num(acc.startBalance, num(acc.size));
    const now = opts.now ? new Date(opts.now) : new Date();
    const th = Object.assign({ yellow: 0.5, red: 0.25 }, opts.thresholds || {});
    /* Regeln ohne gültigen Wert gelten als nicht gesetzt (sonst würde ein Limit von 0 sofort verletzt) */
    const dl = rules.dailyLoss && limitOf(rules.dailyLoss, start) != null ? rules.dailyLoss : null, dd = rules.drawdown && limitOf(rules.drawdown, start) != null ? rules.drawdown : null;
    /* Handelstage: nach dailyLoss.resetTime/tz, sonst 00:00 in account.tz (Fallback: Systemzeitzone) */
    const tz = (dl && dl.tz) || acc.tz || systemTz(); const resetTime = dl && dl.resetTime ? dl.resetTime : '00:00';
    const keyOf = d => dayKey(d, resetTime, tz);
    /* Rohe Trades werden zur Sicherheit abgeleitet; dann nur geschlossene, chronologisch nach Realisierung (Tie-Break über id, damit die Reihenfolge stabil ist) */
    const list = (trades || []).filter(Boolean).map(t => isDate(t.close) || t.closed === false ? t : C.derive(t)).filter(t => t.closed && isDate(t.close) && t.close <= now).sort((a, b) => a.close - b.close || String(a.id).localeCompare(String(b.id)));

    const dlLimit = limitOf(dl, start), ddLimit = limitOf(dd, start), tgt = limitOf(rules.profitTarget, start);
    const ddType = dd ? (dd.type || 'static') : null;
    const lockAt = dd && dd.lockAt != null && dd.lockAt !== '' ? num(dd.lockAt) : null; const lockBasis = dd && dd.basis === 'eod' ? 'eod' : 'intraday';
    const usesEod = ddType === 'trailing_eod' || (ddType === 'trailing_lock' && lockBasis === 'eod'); /* Peak nur aus Tages-Endbalancen */
    const maxC = rules.maxContracts != null && rules.maxContracts !== '' ? num(rules.maxContracts) : null;

    let balance = start, peak = start, floor = dd ? start - ddLimit : null, locked = false, maxBal = start, maxUsed = 0, contractsN = 0;
    const days = [], byKey = new Map(), breaches = [], first = {}; let cur = null;
    /* Boden aus dem aktuellen Peak neu berechnen. trailing_lock: sobald der rohe Boden start + lockAt erreicht, bleibt er dort stehen (locked). */
    const raise = () => {
      if (!dd) return;
      let f = ddType === 'static' ? start - ddLimit : peak - ddLimit;
      if (ddType === 'trailing_lock' && lockAt != null && f >= start + lockAt - EPS) { f = start + lockAt; locked = true; }
      floor = f;
    };
    /* Tagesende: bei EOD-Varianten wird erst jetzt die Tages-Endbalance zum Peak */
    const closeDay = () => { if (cur && usesEod) { peak = Math.max(peak, cur.endBalance); raise(); } };

    for (const t of list) {
      const k = keyOf(t.close);
      if (!cur || cur.key !== k) { closeDay(); cur = { key: k, pnl: 0, n: 0, startBalance: balance, endBalance: balance }; days.push(cur); byKey.set(k, cur); }
      balance += t.pnl; cur.pnl += t.pnl; cur.n++; cur.endBalance = balance; maxBal = Math.max(maxBal, balance);
      const at = t.close.toISOString(); const qty = num(t.quantity);
      maxUsed = Math.max(maxUsed, qty);
      if (maxC != null && qty > maxC + 1e-9) { contractsN++; breaches.push({ rule: 'maxContracts', at, tradeId: t.id, balance, detail: `${qty} Kontrakte/Lots gehandelt, erlaubt sind ${maxC}` }); }
      /* Daily Loss: Verlust ab Tagesbeginn-Balance (erst +500, dann −1400 → Tagesverlust 900). basis 'equity' rechnet identisch, da keine offenen P&L bekannt sind. */
      if (dl && !first.dailyLoss) { const loss = cur.startBalance - balance; if (loss >= dlLimit - EPS) { first.dailyLoss = true; breaches.push({ rule: 'dailyLoss', at, tradeId: t.id, balance, loss: round2(loss), limit: round2(dlLimit), dayKey: k, detail: `Tagesverlust ${round2(loss)} erreicht das Limit ${round2(dlLimit)} (Handelstag ${k})` }); } }
      /* Drawdown: Peak je nach Variante nach jedem Trade (intraday) oder erst am Tagesende (eod); Breach, wenn Balance ≤ Boden */
      if (dd) {
        if (ddType !== 'static' && !usesEod) peak = Math.max(peak, balance);
        raise();
        if (!first.drawdown && balance <= floor + EPS) { first.drawdown = true; breaches.push({ rule: 'drawdown', at, tradeId: t.id, balance, floor: round2(floor), type: ddType, detail: `Balance ${round2(balance)} unter dem Drawdown-Boden ${round2(floor)} (${DD_LABEL[ddType] || ddType})` }); }
      }
    }
    const todayKey = keyOf(now);
    if (cur && cur.key !== todayKey) closeDay(); /* letzter Handelstag ist vorbei → Endbalance zählt für EOD-Peak; „heute“ bleibt offen */
    if (dd) raise();

    const pnl = balance - start;
    const today = byKey.get(todayKey) || null; const todayPnl = today ? balance - today.startBalance : 0;
    /* used = heutiger Verlust ab Tagesbeginn (≥ 0); remaining berücksichtigt heutigen Gewinn: bei +500 dürfen noch limit + 500 verloren werden */
    const dailyLoss = dl ? { limit: dlLimit, used: Math.max(0, -todayPnl), remaining: Math.max(0, dlLimit + todayPnl), breached: !!first.dailyLoss, dayKey: todayKey, basis: dl.basis === 'equity' ? 'equity' : 'balance', resetTime, tz } : null;
    const drawdown = dd ? { type: ddType, limit: ddLimit, peak: ddType === 'static' ? maxBal : peak, floor, remaining: Math.max(0, balance - floor), locked, breached: !!first.drawdown, lockAt, basis: ddType === 'trailing_lock' ? lockBasis : null } : null;
    const target = tgt != null ? { value: tgt, progress: tgt > 0 ? clamp(pnl / tgt, 0, 1) : 1, remaining: Math.max(0, tgt - pnl) } : null;
    const minDays = rules.minTradingDays != null && rules.minTradingDays !== '' ? num(rules.minTradingDays) : null;
    const tradingDays = minDays != null ? { n: days.length, min: minDays, remaining: Math.max(0, minDays - days.length) } : null;
    const contracts = maxC != null ? { max: maxC, maxUsed, breaches: contractsN } : null;
    const consistency = rules.consistency && rules.consistency.maxDayPct != null && rules.consistency.maxDayPct !== '' ? consistencyOf(days, todayKey, pnl, rules.consistency.maxDayPct) : null;

    const passed = target != null && target.progress >= 1 && (!tradingDays || tradingDays.remaining === 0) && (!consistency || consistency.ok);
    const status = breaches.length ? 'breached' : passed ? 'passed' : 'ok';

    /* Puffer: kleinster verbleibender Spielraum über alle Verlust-Limits; Ampel nach Verhältnis Puffer/Limit; Stops = wie viele Stop-Losses der Puffer verträgt */
    const cands = []; if (dailyLoss) cands.push({ rem: dailyLoss.remaining, lim: dailyLoss.limit }); if (drawdown) cands.push({ rem: drawdown.remaining, lim: drawdown.limit });
    const money = cands.length ? Math.min(...cands.map(c => c.rem)) : null;
    const ratio = cands.length ? Math.min(...cands.map(c => c.lim > 0 ? c.rem / c.lim : 1)) : null;
    const ampel = ratio == null ? 'gruen' : ratio <= th.red ? 'rot' : ratio <= th.yellow ? 'gelb' : 'gruen';
    const stopSz = num(opts.stopSize); const stops = money != null && stopSz > 0 ? Math.max(0, Math.floor((money + 1e-9) / stopSz)) : null;

    return { balance, start, pnl, n: list.length, todayKey, todayPnl, days, dailyLoss, drawdown, target, tradingDays, contracts, consistency, breaches, status, buffer: { money, ratio, ampel, stops, thresholds: th, stopSize: stopSz > 0 ? stopSz : null } };
  }

  /* ---------- Stop-Größe ---------- */
  /* manual > 0 → manual; sonst Median der Verlustbeträge unter den letzten 30 geschlossenen Trades; null ohne Verluste. */
  function stopSize(trades, manual) {
    if (num(manual) > 0) return num(manual);
    const closed = (trades || []).filter(t => t && t.closed && isDate(t.close)).sort((a, b) => a.close - b.close).slice(-30);
    const losses = closed.filter(t => t.status === 'loss' || (t.status == null && t.pnl < -EPS)).map(t => Math.abs(t.pnl));
    return losses.length ? C.percentile(losses, 0.5) : null;
  }

  /* ---------- Positionsgröße ---------- */
  /* positionSize({ market: 'futures'|'forex', tickValue, tickSize, pipValue, pipSize (Default 0,0001), stopTicks, stopPips, stopPrice, entryPrice, buffer, maxPct (Default 100) })
   * Futures: riskPerUnit = stopTicks × tickValue, stopTicks wahlweise aus |entry − stop| / tickSize. Forex: riskPerUnit = stopPips × pipValue je Lot, stopPips wahlweise aus |entry − stop| / pipSize.
   * maxRisk = buffer × maxPct / 100. units = maxRisk / riskPerUnit, abgerundet: Futures auf ganze Kontrakte, Forex auf 0,01 Lots. */
  function positionSize(p = {}) {
    const market = p.market === 'forex' ? 'forex' : 'futures';
    const buffer = Math.max(0, num(p.buffer)); const maxPct = p.maxPct == null || p.maxPct === '' ? 100 : Math.max(0, num(p.maxPct)); const maxRisk = buffer * maxPct / 100;
    const dist = p.stopPrice != null && p.stopPrice !== '' && p.entryPrice != null && p.entryPrice !== '' ? Math.abs(num(p.entryPrice) - num(p.stopPrice)) : null;
    const units6 = (d, s) => Math.round(d / s * 1e6) / 1e6; /* Ticks/Pips aus Preisdistanz, gegen Gleitkomma-Rauschen gerundet */
    let riskPerUnit = null, stopTicks = null, stopPips = null;
    if (market === 'futures') {
      const tv = num(p.tickValue), ts = num(p.tickSize);
      stopTicks = p.stopTicks != null && p.stopTicks !== '' ? Math.abs(num(p.stopTicks)) : dist != null && ts > 0 ? units6(dist, ts) : null;
      if (stopTicks != null && tv > 0) riskPerUnit = stopTicks * tv;
    } else {
      const pv = num(p.pipValue), ps = num(p.pipSize, 0.0001);
      stopPips = p.stopPips != null && p.stopPips !== '' ? Math.abs(num(p.stopPips)) : dist != null && ps > 0 ? units6(dist, ps) : null;
      if (stopPips != null && pv > 0) riskPerUnit = stopPips * pv;
    }
    let units = 0;
    if (riskPerUnit > 0 && maxRisk > 0) { const raw = maxRisk / riskPerUnit; units = market === 'forex' ? Math.floor(raw * 100 + 1e-9) / 100 : Math.floor(raw + 1e-9); }
    return { market, units, riskPerUnit, maxRisk, risk: riskPerUnit ? units * riskPerUnit : 0, stopTicks, stopPips };
  }

  /* ---------- Payout-Plan ---------- */
  /* payoutPlan(account, ev, opts = { minDays, minProfit, consistencyPct, minBalance, fmtMoney })
   * Handelstage seit Kontostart (ev.days), nicht seit dem letzten Payout – das Journal kennt keine Payout-Zyklen (siehe offene Punkte).
   * Vorschlag: fehlender Gewinn gleichmäßig über die fehlenden Tage, so dass kein Tag über maxDayPct des Endgewinns liegt; ist die Consistency Rule verletzt,
   * wird zusätzlich so viel Gewinn eingeplant, dass der bisherige beste Tag wieder unter die Grenze fällt (T' ≥ bestDay / m). */
  function payoutPlan(account, ev, opts = {}) {
    const e = ev || {}; const days = e.days || []; const total = num(e.pnl); const n = days.length;
    const minDays = num(opts.minDays), minProfit = num(opts.minProfit);
    const missingDays = Math.max(0, Math.ceil(minDays) - n);
    let missingProfit = Math.max(0, minProfit - total);
    if (opts.minBalance != null && opts.minBalance !== '') missingProfit = Math.max(missingProfit, num(opts.minBalance) - num(e.balance));
    let cons = e.consistency || null; const pct = opts.consistencyPct != null && opts.consistencyPct !== '' ? num(opts.consistencyPct) : cons ? cons.maxDayPct : null;
    if (pct != null && (!cons || cons.maxDayPct !== pct)) cons = consistencyOf(days, e.todayKey, total, pct);
    const consistencyOk = !cons || cons.ok;
    const fmt = opts.fmtMoney || (v => Math.round(v).toLocaleString('de-DE'));
    let consistencyWarning = null;
    if (cons && !cons.ok) consistencyWarning = `Die Consistency Rule ist aktuell verletzt: Dein bester Tag macht ${Math.round(cons.bestDayPct * 100)} % des Gesamtgewinns aus, erlaubt sind ${cons.maxDayPct} %.`;
    else if (cons && isFinite(cons.allowedToday)) consistencyWarning = `Wenn du heute mehr als ${fmt(cons.allowedToday)} machst, verletzt du die Consistency Rule.`;
    const m = cons ? cons.max : null; let need = missingProfit;
    if (m != null && m > 0 && cons.bestDay > 0) need = Math.max(need, cons.bestDay / m - total);
    let planDays = missingDays, perDay = 0;
    if (need > EPS) { const cap = m != null && m < 1 ? m * (total + need) : Infinity; const byCap = isFinite(cap) && cap > 0 ? Math.ceil(need / cap - 1e-9) : 1; planDays = Math.max(missingDays, byCap, 1); perDay = need / planDays; }
    const ready = missingDays === 0 && missingProfit <= EPS && consistencyOk && e.status !== 'breached';
    return { missingDays, missingProfit, consistencyOk, consistencyWarning, suggestion: { perDay, days: planDays, total: need }, ready, consistency: cons };
  }

  /* ---------- Bilanz: Ausgaben vs. Payouts ---------- */
  const REJECTED = ['rejected', 'cancelled', 'canceled', 'denied', 'abgelehnt', 'storniert'];
  const PAID = ['paid', 'received', 'completed', 'ausgezahlt', 'erhalten', 'bezahlt'];
  const statusOf = p => String(p.status || '').trim().toLowerCase();
  /* Netto eines Payouts: net wie angegeben, sonst gross × split (split als 0,9 oder 90) */
  function payoutNet(p) { if (p.net != null && p.net !== '') return num(p.net); const s = p.split == null || p.split === '' ? 1 : num(p.split); return num(p.gross) * (s > 1 ? s / 100 : s); }
  /* Datum → 'YYYY-MM-DD' (ISO-Strings über die ersten 10 Zeichen, sonst lokal per Core.dayKey) */
  const dateKey = v => { if (v == null || v === '') return null; if (isDate(v)) return C.dayKey(v); const s = String(v); if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10); const d = new Date(s); return isDate(d) ? C.dayKey(d) : null; };
  /* balanceSheet(expenses, payouts, accounts): Ausgaben { id, type, amount, date, firm, accountId }, Payouts { id, accountId, firm, gross, split, net, requestedAt, receivedAt, status }.
   * received zählt alle nicht abgelehnten/stornierten Payouts; pending = davon noch nicht erhalten (kein receivedAt und kein Bezahlt-Status). Firma fällt auf account.firm zurück. */
  function balanceSheet(expenses, payouts, accounts) {
    const accs = accounts || []; const byId = new Map(accs.filter(a => a && a.id != null).map(a => [a.id, a]));
    const firmOf = (o) => o.firm || (byId.get(o.accountId) || {}).firm || '—';
    const ex = (expenses || []).filter(Boolean).map((e, i) => ({ kind: 'expense', i, date: dateKey(e.date), amount: Math.abs(num(e.amount)), firm: firmOf(e) }));
    const po = (payouts || []).filter(p => p && !REJECTED.includes(statusOf(p))).map((p, i) => ({ kind: 'payout', i, date: dateKey(p.receivedAt) || dateKey(p.requestedAt), amount: payoutNet(p), firm: firmOf(p), paid: !!p.receivedAt || PAID.includes(statusOf(p)) }));
    const spent = C.sum(ex.map(e => e.amount)), received = C.sum(po.map(p => p.amount)), pending = C.sum(po.filter(p => !p.paid).map(p => p.amount));
    const net = received - spent; const roi = spent > 0 ? net / spent : null;
    const firms = new Map();
    for (const e of ex) { const f = firms.get(e.firm) || { firm: e.firm, spent: 0, received: 0 }; f.spent += e.amount; firms.set(e.firm, f); }
    for (const p of po) { const f = firms.get(p.firm) || { firm: p.firm, spent: 0, received: 0 }; f.received += p.amount; firms.set(p.firm, f); }
    const byFirm = [...firms.values()].map(f => Object.assign(f, { net: f.received - f.spent, roi: f.spent > 0 ? (f.received - f.spent) / f.spent : null })).sort((a, b) => a.firm < b.firm ? -1 : a.firm > b.firm ? 1 : 0);
    /* Funded ist eine Phase, kein Status: ein Funded-Konto zählt als bestanden, solange es nicht geplatzt ist */
    const st = s => accs.filter(a => a && a.status === s).length; const isFunded = a => a && a.phase === 'funded' && a.status !== 'breached';
    const good = accs.filter(a => a && (a.status === 'passed' || isFunded(a))).length, bad = st('breached');
    const costPerPassed = good > 0 ? spent / good : null; const passRate = good + bad > 0 ? good / (good + bad) : null;
    /* Serie: alle Ausgaben und Payouts (Payout-Datum = receivedAt, sonst requestedAt) chronologisch, ein Punkt je Ereignis; Einträge ohne Datum fehlen in der Serie, zählen aber in den Summen */
    const events = [...ex, ...po].filter(e => e.date).sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : a.kind === b.kind ? a.i - b.i : a.kind === 'expense' ? -1 : 1);
    let sc = 0, rc = 0; const series = events.map(e => { if (e.kind === 'expense') sc += e.amount; else rc += e.amount; return { date: e.date, spentCum: sc, receivedCum: rc, kind: e.kind, amount: e.amount, firm: e.firm }; });
    return { spent, received, pending, net, roi, byFirm, costPerPassed, passRate, toBreakEven: Math.max(0, spent - received), series, accounts: { passed: st('passed'), funded: accs.filter(isFunded).length, breached: st('breached'), active: st('active') } };
  }

  return { dayKey, parseResetTime, systemTz, limitOf, consistency: consistencyOf, evaluate, stopSize, positionSize, payoutPlan, balanceSheet };
});
