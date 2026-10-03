/* Prop Firms · Tab „Simulation“: Bestehenswahrscheinlichkeit (Monte Carlo auf Tagesbasis), Firmen-Matcher und „Lohnt sich die Challenge?“
   Rechenkern js/propsim.js. Gerechnet wird lazy im Web Worker js/propworker.js (Pfad relativ zu app.html); scheitert die Worker-Erzeugung oder
   das Laden (file://, SecurityError, onerror), rechnet der Tab synchron im Hauptthread (setTimeout 0, damit „Rechnet…“ zuerst gezeichnet wird)
   und merkt sich den Fallback. Zustand (Bereich, Parameter, Ergebnisse) in PropScreen.st().sim; Ergebnisse je Parameter-Schlüssel, bei
   Parameteränderung (Trades, Faktor, Zeitraum, Referenzgröße) verworfen; die Schlüssel tragen einen Fingerabdruck der Regeln/Preise, damit ein im Tab Konten
   geändertes Konto oder Preset nie ein altes Ergebnis zeigt. Ergebnisbeträge (EV, Auszahlung) über fmt.cur / U.pnl (Geld-blind-Modus); Spezifikationswerte der
   Presets (Kontogröße, Gebühren) wie im Tab Konten als Zahl + Währungscode des Presets (specMoney), nie umgerechnet und nie als R. Aktionen mit Präfix prop-sim-.
   Geldbeträge in den Matcher-Begründungen kommen aus dem Worker als Marker ‹M:1234› (Funktionen überleben postMessage nicht) und werden hier mit fmt.cur gesetzt. */
(function (root) {
  'use strict';
  const C = root.Core, S = root.Store, U = root.UI, I = U.I, esc = U.esc, fmt = U.fmt, App = root.App, P = root.Prop, PS = root.PropSim, X = root.PropScreen;
  if (!X || !PS) return;
  const AREAS = [['pass', 'Bestehen'], ['match', 'Firmen-Matcher'], ['ev', 'Lohnt sich die Challenge?']];
  const FACTORS = [[0.5, '0,5×'], [1, '1×'], [1.5, '1,5×'], [2, '2×']];
  const DAYS = [30, 60, 90, 180];
  const RUNS = { pass: 10000, match: 3000, ev: 5000 };
  const REASON = { dailyLoss: 'Daily Loss', drawdown: 'Max. Drawdown', timeout: 'Zeit abgelaufen', consistency: 'Consistency Rule' };
  const MARK = v => '‹M:' + Number(v) + '›';
  const withMoney = o => { o = Object.assign({}, o || {}); if (o.fmtMoney === 'marker') o.fmtMoney = MARK; else if (typeof o.fmtMoney !== 'function') delete o.fmtMoney; return o; };
  const money = s => esc(s).replace(/‹M:(-?[\d.eE+-]+)›/g, (_, v) => fmt.cur(Number(v)));
  const num = X.num, accounts = X.accounts, presets = X.presets, accName = X.accName;
  /* Spezifikationswerte wie im Tab Konten (prop.js specMoney): Zahl + Währungscode des Presets, nicht fmt.cur (Journalwährung, Geld-blind → R) */
  const specMoney = typeof X.specMoney === 'function' ? X.specMoney : (v, c) => v == null || v === '' || isNaN(Number(v)) ? '—' : `${fmt.num(Number(v), Number(v) % 1 ? 2 : 0)} ${esc(c || '')}`.trim();
  const journalCur = () => (typeof S.currency === 'function' && S.currency()) || (S.settings && S.settings.currency) || 'USD';
  const sim = () => { const s = X.st(); return s.sim || (s.sim = { area: 'pass', source: 'all', sizeFactor: 1, maxDays: 90, referenceSize: null, rules: '', evPreset: '', results: {}, busy: {} }); };
  const unitDays = v => v == null ? '—' : `${fmt.num(v, 1)} Tag${Math.round(v * 10) === 10 ? '' : 'e'}`;

  /* ---------- Datengrundlage ---------- */
  let cur = null; /* Grundlage des aktuellen Renders (Trades, Tages-P&L) */
  function basis() {
    const s = sim(); let account = null;
    if (s.source !== 'all') { account = accounts().find(a => a.id === s.source) || null; if (!account) s.source = 'all'; }
    const all = C.deriveAll(S.trades()); const trades = account ? S.tradesForPropAccount(account.id) : all;
    const dl = account && account.rules && account.rules.dailyLoss; const resetTime = dl && dl.resetTime ? dl.resetTime : '00:00'; const tz = (dl && dl.tz) || (account && account.tz) || P.systemTz();
    const dp = PS.dayPnLs(trades, resetTime, tz);
    const probe = PS.simulate(dp, {}, { runs: 1, maxDays: 1 }); /* nur für minSample und den Hinweissatz, kein Ergebnis */
    return { account, dp, resetTime, tz, minSample: probe.minSample, note: probe.note, journalClosed: all.some(t => t.closed) };
  }
  /* Schlüssel der Datengrundlage: auch die Tagesreihe selbst und die Tagesgrenzen (Reset-Zeit, Zeitzone), damit ein verschobener Trade oder eine geänderte Reset-Zeit kein altes Ergebnis stehen lässt */
  const paramKey = b => { const s = sim(); return [s.source, s.sizeFactor, s.maxDays, b.resetTime, b.tz, b.dp.tradeCount, b.dp.n, hash((b.dp.days || []).map(v => Math.round(v * 100)))].join('|'); };
  /* Fingerabdruck (djb2 über JSON) der Regeln/Preise im Schlüssel: ändert der Nutzer im Tab Konten die Regeln eines Kontos oder ein eigenes Preset, passt kein gespeichertes Ergebnis mehr */
  const hash = o => { const s = JSON.stringify(o) || ''; let h = 5381; for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0; return h.toString(36); };
  const fpPreset = p => hash([p.firm, p.name, p.rules, p.fundedRules, p.fees, p.payout, p.profitSplit, p.size, p.currency]);
  const keyPass = (b, r) => `pass|${r.key}|${r.startBalance}|${hash(r.rules)}|${paramKey(b)}`;
  const keyMatch = (b, ref) => `match|${ref}|${hash(presets().map(p => [p.id, p.firm, p.name, p.rules, p.size, p.fees, p.currency, !!(p.unverified || !p.lastVerified)]))}|${paramKey(b)}`;
  const keyEv = (b, p) => `ev|${p.id}|${fpPreset(p)}|${paramKey(b)}`;
  const refSize = b => { const s = sim(); return s.referenceSize > 0 ? s.referenceSize : b.account && num(b.account.size, 0) > 0 ? num(b.account.size, 0) : 50000; };
  /* Regelwerk für „Bestehen“: 'account:<id>' (Regeln und Startbalance des Kontos) oder 'preset:<id>' (Regeln und Kontogröße des Presets) */
  function rulesOf(key) {
    const k = String(key || ''); const i = k.indexOf(':'); const kind = i < 0 ? '' : k.slice(0, i), id = k.slice(i + 1);
    if (kind === 'account') { const a = accounts().find(x => x.id === id); if (a) return { key: k, kind, account: a, rules: a.rules || {}, startBalance: num(a.startBalance, num(a.size, 0)), label: accName(a) }; }
    if (kind === 'preset') { const p = presets().find(x => x.id === id); if (p) return { key: k, kind, preset: p, rules: p.rules || {}, startBalance: num(p.size, 0), label: [p.firm, p.name].filter(Boolean).join(' ') || 'Preset' }; }
    return null;
  }
  /* Vorgabe ohne gültige Auswahl: das als Datengrundlage gewählte Konto, sonst das erste aktive Challenge-Konto (Funded-Konten haben kein Gewinnziel),
     sonst ein aktives Funded-Konto, sonst das erste Preset – archivierte, bestandene oder geplatzte Konten nie */
  const isChallenge = a => a.phase === 'challenge1' || a.phase === 'challenge2';
  function pickRules(b) {
    const s = sim(); let r = rulesOf(s.rules);
    if (!r) { const accs = accounts(); const src = (b || cur || {}).account; const a = src || accs.find(x => x.status === 'active' && isChallenge(x)) || accs.find(x => x.status === 'active'); const p = presets()[0]; r = a ? rulesOf('account:' + a.id) : p ? rulesOf('preset:' + p.id) : null; s.rules = r ? r.key : ''; }
    return r;
  }
  /* Ohne Profit Target (Funded-Konto, lückenhaftes Preset, Prozentregel bei Startbalance 0) kann kein Durchlauf bestehen: Hinweis statt einer 0-%-Quote als Ergebnis */
  const noTarget = r => !!r && PS.limitsOf(r.rules, r.startBalance).target == null;
  const noTargetHint = (r, tail) => U.banner('info', 'Kein Gewinnziel hinterlegt', `Dieses Regelwerk hat kein Gewinnziel, eine Bestehensquote ist nicht sinnvoll: ${esc(String(r.label).trim())} hat kein Profit Target${r.account && r.account.phase === 'funded' ? ' (Funded-Konto)' : ''}, jeder Durchlauf würde mit „Zeit abgelaufen“ enden. ${tail}`);
  function pickEvPreset() { const s = sim(); let p = presets().find(x => x.id === s.evPreset) || null; if (!p) { p = presets()[0] || null; s.evPreset = p ? p.id : ''; } return p; }
  const presetOptions = (selected, valueOf) => { const ps = presets(); const firms = [...new Set(ps.map(p => p.firm))]; return firms.map(f => `<optgroup label="${esc(f)}">${ps.filter(p => p.firm === f).map(p => `<option value="${esc(valueOf(p))}" ${selected === valueOf(p) ? 'selected' : ''}>${esc(p.firm)} ${esc(p.name)} · ${specMoney(p.size, p.currency)}${p.unverified || !p.lastVerified ? ' · unverifiziert' : ''}</option>`).join('')}</optgroup>`).join(''); };

  /* ---------- Rechnen: Worker mit Fallback ---------- */
  let worker = null, seq = 0, fallback = false, epoch = 0; const pending = new Map();
  function getWorker() {
    if (fallback) return null; if (worker) return worker;
    try { worker = new Worker('js/propworker.js'); } catch (e) { fallback = true; worker = null; return null; }
    worker.onmessage = e => { const m = e.data || {}; const p = pending.get(m.id); if (!p) return; pending.delete(m.id); if (m.ok) p.resolve(m.result); else p.reject(new Error(m.error || 'Fehler im Worker')); };
    /* Ladefehler (404, importScripts, Syntax): offene Aufträge im Hauptthread rechnen, Worker ab jetzt nicht mehr versuchen */
    worker.onerror = e => { if (e && e.preventDefault) e.preventDefault(); fallback = true; const list = [...pending.values()]; pending.clear(); try { worker.terminate(); } catch (x) { /* egal */ } worker = null; for (const p of list) p.local(); };
    return worker;
  }
  function computeLocal(op, a) {
    if (op === 'simulate') return PS.simulate(a.dayPnLs, a.rules, a.opts);
    if (op === 'match') return PS.matchFirms(a.dayPnLs, a.presets, withMoney(a.opts));
    if (op === 'ev') return PS.expectedValue(a);
    throw new Error('Unbekannte Operation: ' + op);
  }
  function compute(op, args) {
    const ep = epoch;
    return new Promise((resolve, reject) => {
      const local = () => setTimeout(() => { if (ep !== epoch) return reject(new Error('verworfen')); try { resolve(computeLocal(op, args)); } catch (err) { reject(err); } }, 0);
      const w = getWorker(); if (!w) return local();
      const id = ++seq; pending.set(id, { resolve, reject, local });
      try { w.postMessage({ id, op, args }); } catch (err) { pending.delete(id); fallback = true; local(); }
    });
  }
  const simulateJob = (b, r) => { const s = sim(); return compute('simulate', { dayPnLs: b.dp, rules: r.rules, opts: { runs: RUNS.pass, sizeFactor: s.sizeFactor, maxDays: s.maxDays, startBalance: r.startBalance } }); };
  function run(area) {
    const s = sim(); const b = cur || (cur = basis()); if (!b.dp.tradeCount) return;
    let key, job;
    if (area === 'match') { const ref = refSize(b); key = keyMatch(b, ref); job = () => compute('match', { dayPnLs: b.dp, presets: presets(), opts: { runs: RUNS.match, referenceSize: ref, sizeFactor: s.sizeFactor, maxDays: s.maxDays, fmtMoney: 'marker' } }); }
    else if (area === 'ev') {
      const p = pickEvPreset(); if (!p) return; key = keyEv(b, p); const r = rulesOf('preset:' + p.id); const sk = keyPass(b, r);
      job = async () => { const q = s.results[sk] || await simulateJob(b, r); s.results[sk] = q; const ev = await compute('ev', { passProb: q.pass, preset: p, dayPnLs: b.dp, opts: { runs: RUNS.ev, maxDays: s.maxDays, sizeFactor: s.sizeFactor } }); return { sim: q, ev }; };
    } else { const r = pickRules(b); if (!r || noTarget(r)) return; key = keyPass(b, r); job = () => simulateJob(b, r); }
    if (s.busy[key]) return; if (s.results[key]) { App.rerender(); return; }
    s.busy[key] = true; const ep = epoch; App.rerender(); /* zeichnet „Rechnet…“ und sperrt den Knopf */
    Promise.resolve().then(job).then(res => { if (ep !== epoch) return; s.results[key] = res; delete s.busy[key]; App.rerender(); }, err => { if (ep !== epoch) return; delete s.busy[key]; U.toast(`Simulation fehlgeschlagen: ${err && err.message || err}`, 'err'); App.rerender(); });
  }
  const invalidate = () => { const s = sim(); s.results = {}; s.busy = {}; epoch++; };
  const busyHtml = runs => `<div class="prop-sim-busy" role="status" aria-live="polite"><div class="skel tall"></div><div class="skel"></div><div class="skel short"></div><span class="muted small">Rechnet… ${fmt.int(runs)} Durchläufe</span></div>`;
  const idleMatch = n => `<div class="dashed prop-sim-idle">Noch nicht gerechnet. Der Matcher simuliert ${fmt.int(n)} Presets mit je ${fmt.int(RUNS.match)} Durchläufen aus deinen Handelstagen.</div>`;
  /* Ergebnis gezielt aus dem DOM nehmen statt App.rerender(): ein Rerender beim Tippen/Verlassen des Feldes würde den Knopf unter dem Mauszeiger ersetzen
     (mousedown → blur → change → Rerender), der Klick auf „Matcher starten“ ginge verloren */
  function showIdle(area) {
    const o = document.querySelector(`.prop-sim-out[data-area="${area}"]`); if (o) o.innerHTML = area === 'match' ? idleMatch(presets().length) : '';
    const btn = document.querySelector(`[data-action="prop-sim-run"][data-area="${area}"]`); if (btn && (area !== 'match' || presets().length)) btn.disabled = false;
  }

  /* ---------- Kopf (gemeinsam) ---------- */
  function header(b) {
    const s = sim(); const accs = accounts(); const dp = b.dp;
    const src = `<div class="field"><label for="psim-src">Trades</label><select class="select" id="psim-src" data-change="prop-sim-source"><option value="all" ${s.source === 'all' ? 'selected' : ''}>Alle geschlossenen Trades des Journals</option>${accs.map(a => `<option value="${esc(a.id)}" ${s.source === a.id ? 'selected' : ''}>${esc(accName(a))} · ${X.nameOf(X.PHASES, a.phase)} · ${X.nameOf(X.STATUS, a.status)}</option>`).join('')}</select></div>`;
    const factor = `<div class="field"><span class="lbl">Positionsgröße</span>${U.seg(FACTORS, s.sizeFactor, 'prop-sim-factor', 'pill')}</div>`;
    const days = `<div class="field"><label for="psim-days">Zeitraum</label><select class="select" id="psim-days" data-change="prop-sim-days">${DAYS.map(d => `<option value="${d}" ${s.maxDays === d ? 'selected' : ''}>${d} Tage</option>`).join('')}</select></div>`;
    const sample = `<div class="prop-sim-sample"><span class="n"><b>${fmt.int(dp.tradeCount)} Trades</b> an <b>${fmt.int(dp.n)} Handelstag${dp.n === 1 ? '' : 'en'}</b></span><span>Handelstag ab ${esc(b.resetTime)} Uhr (${esc(String(b.tz).replace(/_/g, ' '))})</span><span>${fmt.int(RUNS.pass)} Durchläufe (Matcher ${fmt.int(RUNS.match)}, Erwartungswert ${fmt.int(RUNS.ev)})</span>${fallback ? '<span class="faint">Rechnung im Hauptthread</span>' : ''}</div>`;
    const warn = b.minSample ? '' : U.banner('warn', 'Zu wenig Daten', esc(String(b.note).replace(PS.NOTE, '').trim()));
    return U.card('Datengrundlage', `<div class="prop-sim-params">${src}${factor}${days}</div>${sample}${warn}`, { info: 'Ganze Handelstage werden mit Zurücklegen gezogen (Bootstrap) und mit dem Positionsgrößen-Faktor multipliziert. Handelstage nach Reset-Uhrzeit und Zeitzone des gewählten Kontos, sonst Mitternacht in deiner Systemzeit.' });
  }

  /* ---------- Bestehen ---------- */
  function areaPass(b) {
    const s = sim(); const r = pickRules(b); const accs = accounts();
    const sel = `<select class="select" id="psim-rules" data-change="prop-sim-rules">${accs.length ? `<optgroup label="Deine Konten">${accs.map(a => `<option value="account:${esc(a.id)}" ${r && r.key === 'account:' + a.id ? 'selected' : ''}>${esc(accName(a))} · ${X.nameOf(X.PHASES, a.phase)} · ${X.nameOf(X.STATUS, a.status)}</option>`).join('')}</optgroup>` : ''}${presetOptions(r ? r.key : '', p => 'preset:' + p.id)}</select>`;
    const pill = !r ? '' : r.preset ? X.verifiedPill(r.preset) : U.pill('eigenes Konto · Regeln als Momentaufnahme', 'neutral');
    const nt = noTarget(r); const key = r && !nt ? keyPass(b, r) : null; const res = key ? s.results[key] : null; const busy = !!(key && s.busy[key]);
    const form = `<div class="prop-sim-run"><div class="field"><label for="psim-rules">Regelwerk</label>${sel}<span class="hint">${pill}</span></div><button type="button" class="btn primary" data-action="prop-sim-run" data-area="pass" ${busy || !r || nt ? 'disabled' : ''}>${I.dice} Simulieren</button></div>`;
    /* Ohne Gewinnziel: Hinweis statt Rechnung – auch ein schon gespeicherter Lauf desselben Regelwerks (aus der EV-Rechnung) wird hier nicht als 0 % gezeigt */
    const hint = nt ? noTargetHint(r, 'Wähle ein Challenge-Regelwerk oder trage das Gewinnziel im Tab Konten ein.') : '';
    const out = nt ? '' : busy ? busyHtml(RUNS.pass) : res ? passResult(res) : `<div class="dashed prop-sim-idle">Noch nicht gerechnet. „Simulieren“ zieht ${fmt.int(RUNS.pass)} Challenge-Verläufe aus deinen Handelstagen${r ? ` gegen die Regeln von ${esc(r.label)}` : ''}.</div>`;
    return U.card('Bestehenswahrscheinlichkeit', `${form}${hint}<div class="prop-sim-out" data-area="pass">${out}</div>`, { info: 'Bestanden = Profit Target erreicht, Mindest-Handelstage erfüllt und Consistency ok, bevor Daily Loss, Drawdown oder der Zeitraum greifen.' });
  }
  function passResult(r) {
    const col = U.scoreColor(r.pass * 100);
    const big = `<div class="prop-sim-big"><div class="caption">Bestehensquote</div><div class="big" style="color:${col}" data-pass="${r.pass}">${fmt.pct(r.pass, 1)}</div><div class="small muted">${fmt.int(r.runs)} Durchläufe · höchstens ${r.maxDays} Handelstage · Positionsgröße ${fmt.num(r.sizeFactor, 2)}×</div></div>`;
    const bars = r.failReasons.length ? r.failReasons.map(f => U.barRow(REASON[f.reason] || f.reason, f.share, 1, fmt.pct(f.share, 1), 'var(--loss)')).join('') : '<div class="small muted">Kein Durchlauf gescheitert.</div>';
    const fail = `<div class="prop-sim-fail"><div class="caption">Scheitern · ${fmt.pct(r.fail, 1)}</div>${bars}</div>`;
    const kv = `<div class="prop-sim-kv">${U.kv('Ø Tage bis zum Bestehen', unitDays(r.avgDaysToPass))}${U.kv('Median Tage bis zum Bestehen', unitDays(r.medianDaysToPass))}${U.kv('Ø Tage bis zum Scheitern', unitDays(r.avgDaysToFail))}</div>`;
    return `<div class="prop-sim-result">${big}${fail}${kv}</div><div class="prop-sim-note small muted">${esc(r.note)}</div>`;
  }

  /* ---------- Firmen-Matcher ---------- */
  function areaMatch(b) {
    const s = sim(); const ref = refSize(b); const key = keyMatch(b, ref); const rows = s.results[key]; const busy = !!s.busy[key]; const ps = presets();
    const form = `<div class="prop-sim-run"><div class="field"><label for="psim-ref">Kontogröße deiner Tagesbeträge</label><input class="input" id="psim-ref" type="number" min="1" step="any" inputmode="decimal" value="${esc(ref)}" data-input="prop-sim-ref"><span class="hint">Die Kontogröße, zu der deine Tagesbeträge gehören: Jedes Preset wird mit deinen Tagen × (Preset-Größe ÷ diese Größe) simuliert.</span></div><button type="button" class="btn primary" data-action="prop-sim-run" data-area="match" ${busy || !ps.length ? 'disabled' : ''}>${I.search} Matcher starten</button></div>`;
    const out = busy ? busyHtml(RUNS.match) : rows ? matchTable(rows, ps) : idleMatch(ps.length);
    return U.card('Passung zu deinem Handelsstil', `${form}<div class="prop-sim-out" data-area="match">${out}</div>`, { sub: 'Sortiert nach Bestehensquote mit deinen eigenen Tagen, keine Bewertung der Firmen.' });
  }
  function matchTable(rows, ps) {
    const byId = new Map(ps.map(p => [p.id, p]));
    /* Pill „unverifiziert“ unter dem Firmennamen statt in einer eigenen Spalte, damit die Tabelle auf Desktop ohne Scrollen passt */
    /* Größe und Gebühr sind Spezifikationswerte in der Währung des Presets (specMoney). Beträge in der Begründung (fmt.cur): Tagesbeträge aus dem Journal und Regelgrenzen aus dem Preset, ohne Umrechnung verglichen */
    const tr = r => { const p = byId.get(r.presetId); const c = p ? p.currency : ''; return `<tr data-preset="${esc(r.presetId)}" data-pass="${r.pass}"><td><b>${esc(r.firm)}</b>${p ? `<div class="sub">${X.verifiedPill(p)}</div>` : ''}</td><td>${esc(r.name)}</td><td class="r">${r.size > 0 ? specMoney(r.size, c) : '—'}</td><td><span class="prop-sim-mini"><span class="track"><i style="width:${(r.pass * 100).toFixed(1)}%;background:${U.scoreColor(r.pass * 100)}"></i></span><b>${fmt.pct(r.pass, 1)}</b></span></td><td class="r">${r.medianDaysToPass == null ? '—' : fmt.num(r.medianDaysToPass, 1)}</td><td class="r">${r.fees > 0 ? specMoney(r.fees, c) : '—'}</td><td class="reason">${money(r.reason)}</td></tr>`; };
    const unv = ps.some(p => p.unverified || !p.lastVerified); const jc = journalCur(); const mixed = ps.some(p => p.currency && p.currency !== jc);
    return `<div class="tbl-wrap prop-sim-table"><table class="tbl compact prop-sim-match"><thead><tr><th>Firma</th><th>Konto</th><th class="r">Größe</th><th>Bestehensquote</th><th class="r">Median Tage</th><th class="r">Challenge-Gebühr</th><th>Begründung</th></tr></thead><tbody>${rows.map(tr).join('')}</tbody></table></div><div class="prop-sim-note small muted">${esc(PS.NOTE)}${unv ? ' Als unverifiziert markierte Presets: Regeln und Preise bitte auf der Website der Firma prüfen.' : ''}${mixed ? ` Regelgrenzen in der Begründung sind Preset-Werte, Tagesbeträge Journalwerte in ${esc(jc)}, ohne Umrechnung verglichen.` : ''}</div>`;
  }

  /* ---------- Lohnt sich die Challenge? ---------- */
  function areaEv(b) {
    const s = sim(); const p = pickEvPreset(); const key = p ? keyEv(b, p) : null; const res = key ? s.results[key] : null; const busy = !!(key && s.busy[key]);
    const sel = `<select class="select" id="psim-ev" data-change="prop-sim-ev-preset">${presetOptions(p ? p.id : '', x => x.id)}</select>`;
    const form = `<div class="prop-sim-run"><div class="field"><label for="psim-ev">Preset</label>${sel}<span class="hint">${p ? X.verifiedPill(p) : ''}</span></div><button type="button" class="btn primary" data-action="prop-sim-run" data-area="ev" ${busy || !p ? 'disabled' : ''}>${I.dice} Erwartungswert rechnen</button></div>`;
    const rp = p ? rulesOf('preset:' + p.id) : null; const hint = noTarget(rp) ? noTargetHint(rp, 'Der Erwartungswert besteht dann nur aus den Gebühren. Trage das Gewinnziel im Tab Konten ein.') : '';
    const passDone = !!(p && s.results[keyPass(b, rulesOf('preset:' + p.id))]); /* Bestehens-Simulation desselben Presets schon gespeichert → nur noch die Funded-Läufe */
    const out = busy ? busyHtml((passDone ? 0 : RUNS.pass) + RUNS.ev) : res ? evResult(res, p) : `<div class="dashed prop-sim-idle">Noch nicht gerechnet. ${passDone ? `Die Bestehensquote mit diesem Preset ist schon gerechnet, es folgt nur` : `Erst die Bestehensquote mit diesem Preset (${fmt.int(RUNS.pass)} Durchläufe), dann`} die Funded-Phase bis zur ersten Auszahlung (${fmt.int(RUNS.ev)} Durchläufe).</div>`;
    return U.card('Lohnt sich die Challenge?', `${form}${hint}<div class="prop-sim-out" data-area="ev">${out}</div>`, { info: 'Erwartungswert netto = Bestehensquote × erwartete erste Auszahlung − Gebühren (Challenge, erwartete Resets, Aktivierung bei Bestehen). Nur Presets, weil Gebühren nötig sind.' });
  }
  function evResult(r, p) {
    const ev = r.ev, q = r.sim, f = ev.fees; const noFees = !(num(f.challenge, 0) > 0 || num(f.reset, 0) > 0 || num(f.activation, 0) > 0);
    const hint = noFees ? U.banner('warn', '', 'Gebühren im Preset nicht hinterlegt, Ergebnis ohne Kosten.') : '';
    const big = `<div class="prop-sim-big"><div class="caption">Erwartungswert netto</div><div class="big" data-ev="${ev.ev}">${U.pnl(ev.ev)}</div><div class="small muted">je Challenge-Versuch · ${fmt.int(ev.runs)} Funded-Durchläufe · höchstens ${ev.maxDays} Handelstage</div></div>`;
    const kv1 = `<div class="prop-sim-kv">${U.kv('Bestehensquote (simuliert)', fmt.pct(q.pass, 1))}${U.kv('Erwartete erste Auszahlung', fmt.cur(ev.expectedPayout))}${U.kv('Payout vor Breach', fmt.pct(ev.payoutProb, 1))}${U.kv('Ø Tage bis Payout', unitDays(ev.avgDaysToPayout))}</div>`;
    /* Gebühren sind Spezifikationswerte in Preset-Währung (specMoney); Auszahlung und EV rechnen mit den Tagesbeträgen des Journals (fmt.cur), ohne Umrechnung */
    const c = (p && p.currency) || ''; const jc = journalCur(); const sm = v => specMoney(v, c);
    const curHint = c && c !== jc ? `<div class="small faint prop-sim-curnote">Gebühren in ${esc(c)} (Preset), Tagesbeträge und Auszahlung in ${esc(jc)} (Journal) – im Erwartungswert ohne Umrechnung verrechnet.</div>` : '';
    const kv2 = `<div class="prop-sim-kv prop-sim-fees"><div class="caption">Gebühren</div>${U.kv('Challenge', sm(f.challenge))}${U.kv(`Erwartete Resets (${fmt.num(f.expectedResets, 2)} × ${sm(f.reset)})`, sm(f.resetCost))}${U.kv(`Aktivierung (${fmt.pct(ev.passProb, 1)} × ${sm(f.activation)})`, sm(f.activationCost))}${U.kv('Summe', sm(f.total))}${curHint}</div>`;
    const be = ev.breakEvenPassRate; const over = be != null && ev.passProb >= be;
    const beBox = `<div class="prop-sim-be"><div class="caption">Break-even-Bestehensquote</div><div class="val" data-be="${be == null ? '' : be}">${be == null ? 'nicht erreichbar' : fmt.pct(be, 1)}</div><div class="small">${be == null ? 'Selbst mit 100 % Bestehensquote decken die erwarteten Auszahlungen die Gebühren nicht.' : `Deine simulierte Quote (${fmt.pct(ev.passProb, 1)}) liegt <b class="${over ? 'pos' : 'neg'}">${over ? 'über' : 'unter'}</b> dem Break-even.`}</div></div>`;
    return `${hint}<div class="prop-sim-result">${big}${kv1}${kv2}${beBox}</div><div class="prop-sim-note small muted">${esc(ev.note)}</div>`;
  }

  /* ---------- Tab ---------- */
  function render() {
    const s = sim(); const b = cur = basis();
    const areas = `<div class="prop-sim-areas">${U.seg(AREAS, s.area, 'prop-sim-area')}</div>`;
    if (!b.journalClosed) return areas + U.empty('dice', 'Erst Trades eintragen', 'Die Simulation zieht aus deinen geschlossenen Handelstagen. Logge Trades oder lade die Beispieldaten in den Einstellungen.', `<button type="button" class="btn primary" data-action="new-trade">${I.plus} Trade loggen</button>`);
    const body = !b.dp.tradeCount ? U.empty('dice', 'Keine geschlossenen Trades für dieses Konto', 'Ordne dem Konto Trades zu oder wähle oben alle Trades des Journals.') : s.area === 'match' ? areaMatch(b) : s.area === 'ev' ? areaEv(b) : areaPass(b);
    return areas + header(b) + body;
  }
  /* App.render ruft unmount auch bei jedem Neuaufbau desselben Tabs; erst wenn danach kein mount folgt, ist der Tab wirklich verlassen */
  let mounted = false, leaveTimer = null;
  function teardown() { epoch++; sim().busy = {}; pending.clear(); if (worker) { try { worker.terminate(); } catch (e) { /* egal */ } worker = null; } }
  X.register('simulation', 'Simulation', render, {
    mount() { mounted = true; if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = null; } },
    unmount() { mounted = false; if (leaveTimer) clearTimeout(leaveTimer); leaveTimer = setTimeout(() => { leaveTimer = null; if (!mounted) teardown(); }, 0); },
  });
  root.PropSimScreen = { AREAS, FACTORS, DAYS, RUNS, REASON, st: sim, basis, rulesOf, pickRules, pickEvPreset, refSize, keyPass, keyMatch, keyEv, hash, noTarget, specMoney, run, worker: () => ({ fallback, active: !!worker, pending: pending.size, mounted, epoch }) };

  /* ---------- Aktionen ---------- */
  Object.assign(App.actions, {
    'prop-sim-area'(el) { sim().area = AREAS.some(a => a[0] === el.dataset.value) ? el.dataset.value : 'pass'; App.rerender(); },
    /* Trades eines Prop-Kontos als Grundlage: Regelwerk und Referenzgröße folgen diesem Konto (danach frei änderbar) */
    'prop-sim-source'(el) { const s = sim(); s.source = el.value || 'all'; s.referenceSize = null; if (s.source !== 'all' && accounts().some(a => a.id === s.source)) s.rules = 'account:' + s.source; invalidate(); App.rerender(); },
    'prop-sim-factor'(el) { const s = sim(); const f = Number(el.dataset.value); s.sizeFactor = FACTORS.some(x => x[0] === f) ? f : 1; invalidate(); App.rerender(); },
    'prop-sim-days'(el) { const d = Number(el.value); sim().maxDays = DAYS.includes(d) ? d : 90; invalidate(); App.rerender(); },
    /* input statt change und kein Rerender: Tippen + sofort „Matcher starten“ muss in einem Klick funktionieren (siehe showIdle) */
    'prop-sim-ref'(el) { const s = sim(); const v = num(el.value); const next = v > 0 ? v : null; if (next === s.referenceSize) return; const b = cur || basis(); const before = refSize(b); s.referenceSize = next; /* nur der Matcher hängt an der Referenzgröße; sein Schlüssel trägt sie, andere Ergebnisse bleiben */ if (refSize(b) !== before) showIdle('match'); },
    'prop-sim-rules'(el) { sim().rules = el.value; App.rerender(); },
    'prop-sim-ev-preset'(el) { sim().evPreset = el.value; App.rerender(); },
    'prop-sim-run'(el) { run(el.dataset.area || sim().area); },
  });
})(typeof self !== 'undefined' ? self : this);
