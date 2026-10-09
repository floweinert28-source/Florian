/* Prop Firms: Multi-Account-Cockpit, echte Prop-Bilanz, Konten- und Preset-Verwaltung, Payout-Planer (Rechnung: js/prop.js, Presets: js/propdata.js)
   Unter-Tabs über #/prop/<tab>. Alle Beträge laufen über fmt.cur / U.pnl / fmt.balance, damit der Geld-blind-Modus greift. Aktionen mit Präfix prop-. */
(function (root) {
  'use strict';
  const C = root.Core, S = root.Store, U = root.UI, I = U.I, esc = U.esc, fmt = U.fmt, App = root.App, P = root.Prop, PD = root.PropData;
  const TABS = [['cockpit', 'Übersicht'], ['bilanz', 'Bilanz'], ['konten', 'Konten']];
  /* Weitere Ansichten (Friedhof, Vergleich, Simulation …) registrieren sich aus eigenen Dateien über root.PropScreen.register.
     Oben stehen nur fünf Bereiche; Finanzen und Analyse haben einen kleinen Umschalter für ihre Ansichten. Die Adressen bleiben #/prop/<ansicht> */
  /* Drei Bereiche: Übersicht (Konten auf einen Blick), Auswertung (Bilanz mit Payout-Planer, Friedhof) und Konten (Verwaltung, eigene Presets).
     Rechner, Simulation und Challenge vs. Funded sind entfallen; #/prop/rechner führt zur Übersicht, Simulation und Vergleich zur Bilanz,
     #/prop/payout zur Bilanz mit offenem Payout-Planer */
  const AREAS = [['cockpit', 'Übersicht'], ['auswertung', 'Auswertung'], ['konten', 'Konten']];
  const AREA_OF = { cockpit: 'cockpit', konten: 'konten', bilanz: 'auswertung', friedhof: 'auswertung' };
  const SUB_ORDER = ['bilanz', 'friedhof'];
  const areaOf = k => AREA_OF[k] || 'auswertung';
  const subsOf = area => TABS.filter(t => areaOf(t[0]) === area).sort((a, b) => (SUB_ORDER.indexOf(a[0]) + 1 || 99) - (SUB_ORDER.indexOf(b[0]) + 1 || 99));
  const VIEWS = {}, MOUNTS = {}, UNMOUNTS = {};
  const PHASES = [['challenge1', 'Challenge 1'], ['challenge2', 'Challenge 2'], ['funded', 'Funded']];
  const STATUS = [['active', 'Aktiv'], ['passed', 'Bestanden'], ['breached', 'Geplatzt'], ['archived', 'Archiviert']];
  const STATUS_KIND = { active: 'open', passed: 'win', breached: 'loss', archived: 'neutral' };
  const RULE_LABEL = { dailyLoss: 'Daily Loss', drawdown: 'Max. Drawdown', maxContracts: 'Max. Kontrakte/Lots' };
  const DD_SHORT = { static: 'statisch', trailing_intraday: 'trailing intraday', trailing_eod: 'trailing Tagesende', trailing_lock: 'trailing + Lock' };
  const AMPEL = { gruen: 'Grün', gelb: 'Gelb', rot: 'Rot', aus: 'Inaktiv' };
  const CURRENCIES = U.fmt.currencyCodes;
  const PAYOUT_STATUS = [['requested', 'Beantragt'], ['received', 'Erhalten'], ['denied', 'Abgelehnt']];
  const nameOf = (list, k, d = '—') => (list.find(x => x[0] === k) || [k, k || d])[1];
  const st = () => App.state.prop || (App.state.prop = { filter: { firm: '', phase: '', status: '' }, payoutAccount: null, last: {}, fold: {}, entry: {} });
  /* Aufklappbarer Abschnitt (Presets, Einstellungen, Payout-Planer, beendete Konten); der Zustand bleibt beim Neuaufbau erhalten */
  const fold = (key, title, body, o = {}) => { const open = (st().fold || {})[key] != null ? st().fold[key] : !!o.open; return `<details class="prop-fold ${o.cls || ''}" data-fold="${key}"${open ? ' open' : ''}><summary data-action="prop-fold" data-key="${key}"><span class="pf-t">${esc(title)}${o.count != null ? ` <span class="pf-n">${o.count}</span>` : ''}</span>${o.sub ? `<span class="pf-sub">${o.sub}</span>` : ''}<span class="pf-chev">${I.chev}</span></summary><div class="pf-body">${body}</div></details>`; };
  /* Kennzahlen als eine ruhige Leiste statt einzelner Kästen (gleiche .tile-Bausteine) */
  const strip = tiles => `<div class="grid tiles prop-tiles kstrip">${tiles}</div>`;
  const accSelect = (id, action, list, cur, label = 'Konto') => `<label class="prop-accsel"><span>${label}</span><select class="select" id="${id}" data-change="${action}">${list.map(x => `<option value="${x.id}" ${x.id === cur ? 'selected' : ''}>${esc(accName(x))} · ${nameOf(PHASES, x.phase)} · ${nameOf(STATUS, x.status)}</option>`).join('')}</select></label>`;
  const num = (v, d = null) => v == null || v === '' || !isFinite(Number(v)) ? d : Number(v);
  const curSym = () => fmt.moneyBlind() ? '' : fmt.cur(0, { money: true }).replace(/[\d.,\s ]/g, '');
  const unitLabel = (text) => { const s = curSym(); return s ? `${text} (${s})` : text; };
  const thresholds = () => Object.assign({ yellow: 0.5, red: 0.25 }, S.settings.propThresholds || {});
  const accounts = () => (typeof S.propAccounts === 'function' ? S.propAccounts() : []).slice();
  const presets = () => typeof S.propPresets === 'function' ? S.propPresets() : [];
  /* Altkonten ohne eigenes payout-Objekt: Bedingungen weiter aus dem Preset, auch aus den früher eingebauten (nur noch intern) */
  const presetOf = a => presets().find(p => p.id === a.firmId) || (Array.isArray(PD.PRESETS) ? PD.PRESETS.find(p => p.id === a.firmId) : null) || null;
  const accName = a => `${a.firm || 'Eigene Firma'} ${a.name || ''}`.trim();
  const today = () => C.dayKey(new Date());
  const n1 = (n, s, p) => `${fmt.int(n)} ${n === 1 ? s : p}`;
  /* Kontoname ohne Geldbetrag (im Geld-blind-Modus würde fmt.cur sonst R anzeigen) */
  const sizeName = a => a.name || (a.size ? `${fmt.int(a.size / 1000)}K` : 'Konto');
  /* Spezifikationswerte (Kontogröße, Gebühr, Tick-Wert) sind keine Ergebnisse: Zahl + Währungscode, nie in R */
  const specMoney = (v, cur) => v == null || v === '' || isNaN(Number(v)) ? '—' : `${fmt.num(Number(v), Number(v) % 1 ? 2 : 0)} ${esc(cur || '')}`.trim();
  const money = (a, v, o = {}) => fmt.cur(v, Object.assign({ currency: a && a.currency }, o));
  /* Breach-Text aus Strukturfeldern der Engine, damit Beträge über fmt.cur laufen (Geld-blind) */
  const detailOf = (a, b) => b.rule === 'dailyLoss' && b.loss != null ? `Tagesverlust ${money(a, b.loss)} erreicht das Limit ${money(a, b.limit)}${b.dayKey ? ` (Handelstag ${esc(b.dayKey)})` : ''}`
    : b.rule === 'drawdown' && b.floor != null ? `${money(a, b.floor - b.balance)} unter dem Drawdown-Boden (${DD_SHORT[b.type] || esc(b.type || '')})` : esc(b.detail || '');
  function timezones() { let list = []; try { list = Intl.supportedValuesOf('timeZone'); } catch (e) { list = ['Europe/Berlin', 'Europe/Prague', 'Europe/London', 'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'Asia/Tokyo', 'Australia/Sydney', 'UTC']; } return list; }

  /* ---------- Bewertung (je Render gecacht) ---------- */
  let cache = new Map();
  function evalOf(a, fresh) {
    if (!fresh && cache.has(a.id)) return cache.get(a.id);
    const trades = typeof S.tradesForPropAccount === 'function' ? S.tradesForPropAccount(a.id) : [];
    const stopSize = P.stopSize(trades, S.settings.propStopSize);
    const r = { trades, stopSize, ev: P.evaluate(a, trades, { thresholds: thresholds(), stopSize }) }; cache.set(a.id, r); return r;
  }
  /* Hinweis-Punkt in der Seitenleiste: aktive Konten auf Rot oder mit verletzter Regel (gleiche Zählung wie die Kachel „Aktive Konten“) */
  App.navDot('prop', () => { const n = accounts().filter(a => a.status === 'active').filter(a => { const { ev } = evalOf(a, true); return ev.buffer.ampel === 'rot' || ev.status === 'breached'; }).length; return n ? (n === 1 ? '1 Prop-Konto auf Rot oder verletzt' : `${n} Prop-Konten auf Rot oder verletzt`) : null; });
  /* Payout-Bedingungen: Funded → payout-Werte (Konto, sonst Preset); Challenge → Mindesttage und Profit Target der Regeln */
  function planOpts(a, ev) {
    const r = a.rules || {}; const po = a.payout && typeof a.payout === 'object' ? a.payout : ((presetOf(a) || {}).payout || {}); /* Snapshot im Konto; Preset nur für Altkonten ohne payout-Objekt */
    const cons = r.consistency && r.consistency.maxDayPct != null && r.consistency.maxDayPct !== '' ? num(r.consistency.maxDayPct) : null; const funded = a.phase === 'funded';
    return { funded, minDays: funded ? num(po.minDays) : num(r.minTradingDays), minProfit: funded ? num(po.minProfit) : P.limitOf(r.profitTarget, ev.start), minBalance: funded ? num(po.minBalance) : null, consistencyPct: cons, fmtMoney: v => fmt.cur(v) };
  }
  function planOf(a, ev) { const o = planOpts(a, ev); const plan = P.payoutPlan(a, ev, o); const hasCond = [o.minDays, o.minProfit, o.minBalance, o.consistencyPct].some(v => v != null && v > 0); return Object.assign(plan, { funded: o.funded, opts: o, hasCond, ready: hasCond && plan.ready }); }
  function planText(a, ev, plan) {
    if (ev.status === 'breached' || a.status === 'breached') return '<span class="neg">Konto geplatzt</span>';
    if (!plan.hasCond) return '<span class="muted">keine Bedingungen hinterlegt</span>';
    if (plan.ready) return `<span class="pos">${plan.funded ? 'bereit' : 'Ziel erreicht'}</span>`;
    const parts = []; if (plan.missingDays > 0) parts.push(`in ${plan.missingDays} Handelstag${plan.missingDays === 1 ? '' : 'en'}`); if (plan.missingProfit > C.EPS) parts.push(`Gewinn fehlt: ${fmt.cur(plan.missingProfit)}`); if (!plan.consistencyOk) parts.push('<span class="warn">Consistency verletzt</span>');
    return parts.join(' · ') || '—';
  }
  function pickAccount(list, key) { const s = st(); let a = list.find(x => x.id === s[key]) || list.find(x => x.status === 'active') || list[0]; s[key] = a.id; return a; }
  const limText = r => !r || r.value == null || r.value === '' ? '—' : r.mode === 'pct' ? `${fmt.num(r.value, 2)} %` : fmt.cur(r.value);
  const ddText = r => !r || r.value == null || r.value === '' ? '—' : `${limText(r)} <span class="muted small">${DD_SHORT[r.type] || DD_SHORT.static}${r.type === 'trailing_lock' && r.lockAt != null && r.lockAt !== '' ? ` · Lock bei Start + ${fmt.cur(r.lockAt)}` : ''}</span>`;
  const verifiedPill = p => p.unverified || !p.lastVerified ? U.pill('unverifiziert, bitte prüfen', 'warn') : U.pill(`geprüft ${fmt.dateFull(p.lastVerified)}`, 'win');
  const emptyAccounts = () => U.empty('shield', 'Noch keine Prop-Konten', 'Lege ein Konto aus einem Firmen-Preset an und ordne ihm Trades zu. Dann siehst du hier Balance, Puffer, Ampel und den Weg zum Payout.', `<button type="button" class="btn primary" data-action="prop-account-new">${I.plus} Konto anlegen</button>`);

  /* ---------- Cockpit ---------- */
  function summaryTiles(list) {
    const active = list.filter(a => a.status === 'active'); let pnl = 0, red = 0; for (const a of active) { const { ev } = evalOf(a); pnl += ev.pnl; if (ev.buffer.ampel === 'rot' || ev.status === 'breached') red++; }
    return strip(`${U.tile('Aktive Konten', `${active.length}`, { foot: red ? `<span class="neg">${red} auf Rot oder verletzt</span>` : '' })}${U.tile('P&L aktive Konten', U.pnl(pnl), { info: 'Summe der geschlossenen Trades seit Start der aktiven Konten.' })}${U.tile('Bestanden', `${list.filter(a => a.status === 'passed').length}`)}${U.tile('Geplatzt', `${list.filter(a => a.status === 'breached').length}`)}`);
  }
  function accountCard(a) {
    const { ev, stopSize } = evalOf(a); const th = thresholds(); const b = ev.buffer; const active = a.status === 'active'; const ampel = active ? b.ampel : 'aus';
    const col = r => r == null ? 'var(--accent)' : r <= th.red ? 'var(--loss)' : r <= th.yellow ? 'var(--warn)' : 'var(--profit)';
    /* ruhige Karte: nur Balken für Regeln, die es gibt; Ziel nur in der Challenge */
    const bar = (lbl, x) => x ? `<div class="prop-bar"><div class="bl"><span>${lbl} übrig</span><b>${money(a, x.remaining)} <span class="muted">von ${money(a, x.limit)}</span></b></div><div class="track"><i style="width:${x.limit > 0 ? Math.min(100, x.remaining / x.limit * 100).toFixed(1) : 0}%;background:${x.limit > 0 ? col(x.remaining / x.limit) : 'var(--surface-3)'}"></i></div></div>` : '';
    const target = ev.target && a.phase !== 'funded' ? `<div class="prop-bar"><div class="bl"><span>Ziel</span><b>${fmt.pct(ev.target.progress)} <span class="muted">· ${ev.target.remaining > C.EPS ? `${money(a, ev.target.remaining)} fehlen` : 'erreicht'}</span></b></div><div class="track"><i style="width:${(ev.target.progress * 100).toFixed(1)}%;background:var(--accent)"></i></div></div>` : '';
    const plan = planOf(a, ev); const br = ev.breaches[0];
    const breach = ev.status === 'breached' && active ? U.banner('loss', 'Regel verletzt', `${esc(RULE_LABEL[br.rule] || br.rule)} · ${detailOf(a, br)} · ${fmt.dateTime(br.at)}`, { trailing: `<button type="button" class="btn sm danger" data-action="prop-mark-breached" data-id="${a.id}">Als geplatzt markieren</button>` }) : '';
    const passed = ev.status === 'passed' && active && a.phase !== 'funded' ? U.banner('accent', 'Ziel erreicht', 'Profit Target, Mindesttage und Consistency sind erfüllt.', { trailing: `<button type="button" class="btn sm primary" data-action="prop-account-status" data-id="${a.id}" data-value="passed">Als bestanden markieren</button>` }) : '';
    const stops = b.stops != null ? `noch ${b.stops} Stop-Loss${b.stops === 1 ? '' : 'es'}` : b.money == null ? '<span class="muted">keine Verlustregel</span>' : '<span class="muted">Stop-Größe unbekannt</span>';
    return `<section class="card prop-card ${a.status}" data-id="${a.id}">
      <div class="prop-head"><div class="prop-title"><span class="prop-ampel ${ampel}" data-ampel="${ampel}" title="Ampel ${AMPEL[ampel]}${b.ratio != null ? ` · ${fmt.pct(b.ratio)} des Limits übrig` : ''}"></span><div><b>${esc(a.firm || 'Eigene Firma')}</b><div class="small muted">${esc(sizeName(a))} · ${nameOf(PD.MARKETS, a.market, 'Futures')}</div></div></div><div class="pills">${U.pill(nameOf(PHASES, a.phase), 'neutral')}${active ? '' : U.pill(nameOf(STATUS, a.status), STATUS_KIND[a.status] || 'neutral')}</div></div>
      ${breach}${passed}
      <div class="prop-balance"><div><div class="caption">Balance</div><div class="val">${fmt.balance(ev.balance, { currency: a.currency })}</div></div><div class="r"><div class="caption">P&L</div><div class="val sm">${U.pnl(ev.pnl)}</div><div class="small muted">${ev.n} Trades</div></div></div>
      <div class="prop-bars">${bar('Daily Loss', ev.dailyLoss)}${bar('Max. Drawdown', ev.drawdown)}${target}</div>
      <div class="prop-meta">${U.kv(plan.funded ? 'Nächster Payout' : 'Bestehen', planText(a, ev, plan))}${U.kv('Puffer', `<span class="prop-stops"${b.money != null ? ` data-tip="${esc(`${money(a, b.money)} Puffer${stopSize ? ` / ${fmt.cur(stopSize)} je Stop-Loss` : ''}`)}"` : ''}>${stops}</span>`)}</div>
      <div class="prop-foot"><button type="button" class="btn sm ghost" data-action="prop-assign" data-id="${a.id}">${I.check} Trades zuordnen</button><button type="button" class="btn sm ghost" data-action="prop-account-edit" data-id="${a.id}">${I.edit} Bearbeiten</button></div>
    </section>`;
  }
  function tabCockpit() {
    const list = accounts(); if (!list.length) return emptyAccounts();
    /* Filter erst ab mehr als vier Konten; darunter gilt keiner (auch kein früher gesetzter, unsichtbarer) */
    const f = list.length > 4 ? st().filter : { firm: '', phase: '', status: '' };
    const firms = [...new Set(list.map(a => a.firm || 'Eigene Firma'))].sort((a, b) => a.localeCompare(b));
    /* Filter als drei kleine Auswahlfelder in einer Reihe statt drei Reihen Knöpfe */
    const selK = (key, opts, cur, label) => `<select class="select sm prop-fsel${cur ? ' on' : ''}" data-change="prop-filter" data-key="${key}" aria-label="${label}">${opts.map(([k, l]) => `<option value="${esc(k)}" ${String(cur) === String(k) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
    const filters = list.length > 4 ? `<div class="prop-filters">${selK('firm', [['', 'Alle Firmen'], ...firms.map(x => [x, x])], f.firm, 'Firma')}${selK('phase', [['', 'Alle Phasen'], ...PHASES], f.phase, 'Phase')}${selK('status', [['', 'Alle Status'], ...STATUS], f.status, 'Status')}</div>` : '';
    const sel = list.filter(a => (!f.firm || (a.firm || 'Eigene Firma') === f.firm) && (!f.phase || a.phase === f.phase) && (!f.status || a.status === f.status));
    const order = { active: 0, passed: 1, breached: 2, archived: 3 }; sel.sort((a, b) => (order[a.status] || 0) - (order[b.status] || 0) || accName(a).localeCompare(accName(b)));
    /* Ohne Status-Filter stehen nur aktive Konten offen; bestandene, geplatzte und archivierte liegen eingeklappt darunter */
    const main = f.status ? sel : sel.filter(a => a.status === 'active'); const ended = f.status ? [] : sel.filter(a => a.status !== 'active');
    const groups = new Map(); for (const a of main) { const g = String(a.group || '').trim(); (groups.get(g) || groups.set(g, []).get(g)).push(a); } const single = groups.get('') || []; groups.delete('');
    const body = (single.length ? `<div class="grid three prop-cards">${single.map(accountCard).join('')}</div>` : '') + [...groups.entries()].map(([g, items]) => `<div class="prop-group"><div class="prop-group-title"><b>${esc(g)}</b><span class="muted small">${n1(items.length, 'Konto', 'Konten')} · Copy-Trading</span></div><div class="grid three prop-cards">${items.map(accountCard).join('')}</div></div>`).join('');
    const head = `<div class="prop-toolbar"><div class="prop-h">${f.status ? 'Konten' : 'Aktive Konten'} <span class="pf-n">${main.length}</span></div>${filters}</div>`;
    const endedHtml = ended.length ? fold('ended', 'Abgeschlossen', `<div class="grid three prop-cards">${ended.map(accountCard).join('')}</div>`, { count: ended.length, sub: 'bestanden, geplatzt oder archiviert' }) : '';
    const none = !sel.length ? U.empty('filter', 'Kein Konto passt zum Filter', 'Ändere Firma, Phase oder Status.') : !main.length ? `<div class="dashed">Kein aktives Konto${f.firm || f.phase ? ' für diesen Filter' : ''}.</div>` : '';
    return `${summaryTiles(list)}${head}${body}${none}${endedHtml}`;
  }

  /* ---------- Trades zuordnen ---------- */
  function assignModal(a) {
    const all = C.deriveAll(S.trades()).sort((x, y) => y.sortTime - x.sortTime).slice(0, 50);
    const rows = all.map(t => `<label class="prop-assign-row"><input type="checkbox" name="t" value="${esc(t.id)}" ${(t.propAccountIds || []).includes(a.id) ? 'checked' : ''}><span class="sym">${esc(t.symbol)}</span>${U.badge(t.direction)}<span class="muted small">${fmt.dateTime(t.open)}</span><span class="muted small qty">${fmt.num(t.quantity, 2)}×</span><span class="r">${t.closed ? U.pnl(t.pnl, '', { r: t.r }) : U.pill('Offen', 'open')}</span></label>`).join('');
    const siblings = a.group ? accounts().filter(x => x.id !== a.id && x.group === a.group) : [];
    U.modal(`<form data-action="prop-assign-save" data-id="${a.id}"><div class="modal-head"><h2>Trades zuordnen · ${esc(accName(a))}</h2><button type="button" class="btn ghost icon" data-close aria-label="Schließen">${I.close}</button></div><p class="muted small">Die letzten 50 Trades. Angehakte Trades zählen für dieses Konto; ein Trade kann mehreren Konten gehören (Copy-Trading). Ältere Trades ordnest du im Trade-Editor zu.</p><input type="hidden" name="shown" value="${all.map(t => t.id).join(',')}">
      ${all.length ? `<div class="row"><button type="button" class="btn xs" data-action="prop-assign-all" data-on="1">Alle</button><button type="button" class="btn xs" data-action="prop-assign-all" data-on="0">Keine</button></div><div class="prop-assign">${rows}</div>` : U.empty('tradelog', 'Keine Trades im Journal', 'Logge zuerst Trades, dann kannst du sie hier zuordnen.')}
      ${siblings.length ? `<label class="check"><input type="checkbox" name="group"><span>Auch für ${siblings.length} weitere${siblings.length === 1 ? 's Konto' : ' Konten'} der Gruppe „${esc(a.group)}“ übernehmen</span></label>` : ''}
      <div class="modal-foot"><button type="button" class="btn" data-close>Abbrechen</button><button type="submit" class="btn primary">Speichern</button></div></form>`);
  }

  /* ---------- Regel-Felder (Konto- und Preset-Dialog) ---------- */
  function rulesFields(r, po, o = {}) {
    const dl = r.dailyLoss || {}, dd = r.drawdown || {}, pt = r.profitTarget || {}, cons = r.consistency || {}; const dis = o.disabled ? 'disabled' : '';
    const sel = (name, opts, cur) => `<select class="select" name="${name}" ${dis}>${opts.map(([k, l]) => `<option value="${esc(k)}" ${String(cur) === String(k) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
    const modeSel = (name, cur) => sel(name, [['abs', unitLabel('Betrag')], ['pct', '% der Startbalance']], cur === 'pct' ? 'pct' : 'abs');
    const inp = (name, val, extra = '') => `<input class="input" name="${name}" value="${esc(val == null ? '' : val)}" ${extra} ${dis}>`;
    const numI = (name, val, step = 'any') => inp(name, val, `type="number" step="${step}" min="0" inputmode="decimal"`);
    const F = (lbl, html) => `<label class="field"><span>${esc(lbl)}</span>${html}</label>`;
    const tzs = timezones(); const tzCur = dl.tz || o.tz || P.systemTz(); const tzOpts = tzs.includes(tzCur) ? tzs : [tzCur, ...tzs];
    return `<div class="prop-rules">
      <div class="prop-rule"><b>Daily Loss</b><div class="prop-rule-f">${F('Wert', numI('dl_value', dl.value))}${F('Modus', modeSel('dl_mode', dl.mode))}${F('Basis', sel('dl_basis', [['balance', 'Balance'], ['equity', 'Equity']], dl.basis || 'balance'))}${F('Reset-Uhrzeit', inp('dl_reset', dl.resetTime || '00:00', 'type="time"'))}${F('Zeitzone', sel('dl_tz', tzOpts.map(z => [z, z.replace(/_/g, ' ')]), tzCur))}</div><span class="hint">Leer oder 0 = keine Regel. Reset-Uhrzeit und Zeitzone legen fest, wann ein neuer Handelstag beginnt.</span></div>
      <div class="prop-rule"><b>Max. Drawdown</b><div class="prop-rule-f">${F('Wert', numI('dd_value', dd.value))}${F('Modus', modeSel('dd_mode', dd.mode))}${F('Typ', sel('dd_type', PD.DRAWDOWN_TYPES, dd.type || 'static'))}${F('Lock bei Start +', numI('dd_lock', dd.lockAt))}${F('Peak-Basis (Lock)', sel('dd_basis', [['intraday', 'Intraday'], ['eod', 'Tagesende']], dd.basis || 'intraday'))}</div><span class="hint">Trailing mit Lock: Der Boden steigt mit, bis er Start + Lock erreicht, und bleibt dann stehen.</span></div>
      <div class="prop-rule"><b>Profit Target</b><div class="prop-rule-f">${F('Wert', numI('pt_value', pt.value))}${F('Modus', modeSel('pt_mode', pt.mode))}</div></div>
      <div class="prop-rule"><b>Weitere Regeln</b><div class="prop-rule-f">${F('Mindest-Handelstage', numI('minDays', r.minTradingDays, '1'))}${F('Max. Kontrakte / Lots', numI('maxContracts', r.maxContracts))}${F('Consistency: bester Tag max. %', numI('cons_pct', cons.maxDayPct))}</div></div>
      <div class="prop-rule"><b>Payout-Bedingungen</b><div class="prop-rule-f">${F('Mindest-Handelstage', numI('po_minDays', po.minDays, '1'))}${F('Mindestgewinn', numI('po_minProfit', po.minProfit))}${F('Mindestbalance', numI('po_minBalance', po.minBalance))}</div><span class="hint">Für Funded-Konten. In der Challenge gelten Profit Target und Mindest-Handelstage der Regeln.</span></div>
      ${o.fees ? `<div class="prop-rule"><b>Gebühren</b><div class="prop-rule-f">${F('Challenge', numI('fee_challenge', o.fees.challenge))}${F('Reset', numI('fee_reset', o.fees.reset))}${F('Aktivierung', numI('fee_activation', o.fees.activation))}${F('Monatlich', numI('fee_monthly', o.fees.monthly))}${F('Daten', numI('fee_data', o.fees.data))}</div></div>` : ''}
    </div>`;
  }
  function readRules(fd) {
    const g = k => { const v = fd.get(k); return v == null ? '' : String(v).trim(); }; const n = k => num(g(k)); const mode = k => g(k) === 'pct' ? 'pct' : 'abs';
    const dlv = n('dl_value'), ddv = n('dd_value'), ptv = n('pt_value'), cp = n('cons_pct'); const tz = g('dl_tz') || P.systemTz();
    const rules = {
      dailyLoss: dlv != null ? { value: dlv, mode: mode('dl_mode'), basis: g('dl_basis') === 'equity' ? 'equity' : 'balance', resetTime: g('dl_reset') || '00:00', tz } : null,
      drawdown: ddv != null ? { value: ddv, mode: mode('dd_mode'), type: PD.DRAWDOWN_TYPES.some(t => t[0] === g('dd_type')) ? g('dd_type') : 'static', lockAt: n('dd_lock'), basis: g('dd_basis') === 'eod' ? 'eod' : 'intraday' } : null,
      profitTarget: ptv != null ? { value: ptv, mode: mode('pt_mode') } : null, minTradingDays: n('minDays'), maxContracts: n('maxContracts'), consistency: cp != null ? { maxDayPct: cp } : null,
    };
    const payout = { minDays: n('po_minDays'), minProfit: n('po_minProfit'), minBalance: n('po_minBalance') };
    const fees = fd.has('fee_challenge') ? { challenge: n('fee_challenge', 0), reset: n('fee_reset', 0), activation: n('fee_activation', 0), monthly: n('fee_monthly', 0), data: n('fee_data', 0) } : null;
    return { rules, payout, fees, tz };
  }
  /* Preset in das Konto-Formular übernehmen (alle Felder bleiben editierbar); null = „Eigene Firma“ → Regeln leeren */
  function fillAccountForm(form, p) {
    const set = (name, v) => { const el = form.elements[name]; if (!el) return; const val = v == null ? '' : String(v); if (el.tagName === 'SELECT' && val && ![...el.options].some(o => o.value === val)) el.add(new Option(val, val)); el.value = val; };
    const r = (p && p.rules) || {}; const dl = r.dailyLoss || {}, dd = r.drawdown || {}, pt = r.profitTarget || {}, cons = r.consistency || {}, po = (p && p.payout) || {};
    set('firm', p ? p.firm : ''); set('name', p ? p.name : ''); set('market', p ? p.market : 'futures'); set('size', p ? p.size : ''); set('startBalance', p ? p.size : ''); set('currency', p ? p.currency : 'USD'); set('profitSplit', p ? Math.round((p.profitSplit || 0) * 100) : 90);
    set('dl_value', dl.value); set('dl_mode', dl.mode || 'abs'); set('dl_basis', dl.basis || 'balance'); set('dl_reset', dl.resetTime || '00:00'); if (dl.tz) set('dl_tz', dl.tz);
    set('dd_value', dd.value); set('dd_mode', dd.mode || 'abs'); set('dd_type', dd.type || 'static'); set('dd_lock', dd.lockAt); set('dd_basis', dd.basis || 'intraday');
    set('pt_value', pt.value); set('pt_mode', pt.mode || 'abs'); set('minDays', r.minTradingDays); set('maxContracts', r.maxContracts); set('cons_pct', cons.maxDayPct);
    set('po_minDays', po.minDays); set('po_minProfit', po.minProfit); set('po_minBalance', po.minBalance);
    const hint = form.querySelector('#pa-preset-hint'); if (hint) hint.innerHTML = p ? (p.unverified || !p.lastVerified ? `<span class="warn">Preset unverifiziert – bitte Regeln und Preise auf der Website der Firma prüfen.</span>` : `Preset geprüft am ${fmt.dateFull(p.lastVerified)}.`) + (p.note ? ` ${esc(p.note)}` : '') : 'Leeres Preset: Trage Regeln und Konto selbst ein.';
  }

  /* ---------- Konto-Dialog ---------- */
  function accountEditor(a) {
    const isNew = !a; const s = a || { firmId: '', firm: '', name: '', market: 'futures', size: '', currency: 'USD', phase: 'challenge1', status: 'active', startedAt: new Date().toISOString(), startBalance: '', rules: {}, payout: {}, profitSplit: 0.9, group: '', tz: P.systemTz(), note: '' };
    const ps = presets(); const firms = [...new Set(ps.map(p => p.firm))];
    const presetSel = `<div class="field span2"><label for="pa-preset">Firma und Kontogröße (Preset)</label><select class="select" id="pa-preset" name="firmId" data-change="prop-preset-pick"><option value="">Ohne Preset</option>${firms.map(f => `<optgroup label="${esc(f)}">${ps.filter(p => p.firm === f).map(p => `<option value="${esc(p.id)}" ${s.firmId === p.id ? 'selected' : ''}>${esc(p.firm)} ${esc(p.name)}${p.unverified || !p.lastVerified ? ' · unverifiziert' : ''}</option>`).join('')}</optgroup>`).join('')}</select><span class="hint" id="pa-preset-hint">Füllt alle Felder aus; alles bleibt editierbar.</span></div>`;
    const sel = (name, opts, cur, id) => `<select class="select" name="${name}" id="${id}">${opts.map(([k, l]) => `<option value="${esc(k)}" ${String(cur) === String(k) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
    U.modal(`<form data-action="prop-account-save" data-id="${s.id || ''}" class="prop-form"><div class="modal-head"><h2>${isNew ? 'Konto anlegen' : 'Konto bearbeiten'}</h2><button type="button" class="btn ghost icon" data-close aria-label="Schließen">${I.close}</button></div>
      <div class="banner info">${I.info}<div class="grow">Die Regeln werden beim Speichern als Momentaufnahme in das Konto kopiert. Änderst du später ein Preset, bleibt dieses Konto unverändert.</div></div>
      <div class="form-grid">${isNew && ps.length ? presetSel : ''}
        <div class="field"><label for="pa-firm">Firma</label><input class="input" id="pa-firm" name="firm" value="${esc(s.firm)}" required placeholder="z. B. Topstep"></div>
        <div class="field"><label for="pa-name">Konto (z. B. 50K)</label><input class="input" id="pa-name" name="name" value="${esc(s.name)}"></div>
        <div class="field"><label for="pa-market">Markt</label>${sel('market', PD.MARKETS, s.market, 'pa-market')}</div>
        <div class="field"><label for="pa-size">Kontogröße</label><input class="input" id="pa-size" name="size" type="number" step="any" min="0" value="${esc(s.size)}" required inputmode="decimal"></div>
        <div class="field"><label for="pa-cur">Währung</label>${sel('currency', U.fmt.currencies().map(c => [c.code, c.label]), s.currency, 'pa-cur')}<span class="hint">Balance, Limits und Puffer in Kontowährung. Trade-P&L bleibt in der Journal-Währung.</span></div>
        <div class="field"><label for="pa-phase">Phase</label>${sel('phase', PHASES, s.phase, 'pa-phase')}</div>
        <div class="field"><label for="pa-status">Status</label>${sel('status', STATUS, s.status, 'pa-status')}</div>
        <div class="field"><label for="pa-start">Startdatum</label><input class="input" id="pa-start" name="startedAt" type="date" value="${s.startedAt ? C.dayKey(new Date(s.startedAt)) : today()}"></div>
        <div class="field"><label for="pa-sb">Startbalance</label><input class="input" id="pa-sb" name="startBalance" type="number" step="any" min="0" value="${esc(s.startBalance)}" inputmode="decimal" placeholder="= Kontogröße"></div>
        <div class="field"><label for="pa-split">Profit Split (%)</label><input class="input" id="pa-split" name="profitSplit" type="number" step="1" min="0" max="100" value="${Math.round((num(s.profitSplit, 0.9)) * 100)}" inputmode="decimal"></div>
        <div class="field"><label for="pa-group">Gruppe (Copy-Trading)</label><input class="input" id="pa-group" name="group" value="${esc(s.group || '')}" placeholder="z. B. Copy A"></div>
        <div class="field span2"><label for="pa-note">Notiz</label><input class="input" id="pa-note" name="note" value="${esc(s.note || '')}"></div>
      </div>
      <h3 class="prop-h3">Regeln dieses Kontos</h3>${rulesFields(s.rules || {}, s.payout || {}, { tz: s.tz })}
      <div class="modal-foot">${isNew ? '' : `<button type="button" class="btn danger left" data-action="prop-account-delete" data-id="${s.id}">${I.trash} Löschen</button>`}<button type="button" class="btn" data-close>Abbrechen</button><button type="submit" class="btn primary">${isNew ? 'Konto anlegen' : 'Speichern'}</button></div></form>`, { cls: 'wide', onMount(el) { if (isNew && s.firmId) { const p = ps.find(x => x.id === s.firmId); if (p) fillAccountForm(el.querySelector('form'), p); } } });
  }

  /* ---------- Preset-Dialog (ansehen / bearbeiten / neu) ---------- */
  function presetEditor(p, mode) {
    const s = p || { firm: '', name: '', market: 'futures', size: '', currency: 'USD', rules: {}, fees: {}, profitSplit: 0.9, payout: {}, lastVerified: null, unverified: false, note: '' };
    const ro = mode === 'view'; const dis = ro ? 'disabled' : '';
    const sel = (name, opts, cur, id) => `<select class="select" name="${name}" id="${id}" ${dis}>${opts.map(([k, l]) => `<option value="${esc(k)}" ${String(cur) === String(k) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
    const title = ro ? 'Preset ansehen' : mode === 'edit' ? 'Preset bearbeiten' : 'Eigenes Preset';
    U.modal(`<form data-action="prop-preset-save" data-id="${s.id || ''}" class="prop-form"><div class="modal-head"><h2>${title}</h2><button type="button" class="btn ghost icon" data-close aria-label="Schließen">${I.close}</button></div>
      ${ro ? U.banner('warn', 'Eingebautes Preset: unverifiziert, bitte prüfen.', `Typische Werte, nicht geprüft (zuletzt geprüft: ${s.lastVerified ? fmt.dateFull(s.lastVerified) : 'nie'}). Zum Anpassen als eigenes Preset kopieren.${s.note ? ` ${esc(s.note)}` : ''}`) : ''}
      <div class="form-grid">
        <div class="field"><label for="pp-firm">Firma</label><input class="input" id="pp-firm" name="firm" value="${esc(s.firm)}" required ${dis}></div>
        <div class="field"><label for="pp-name">Konto (z. B. 50K)</label><input class="input" id="pp-name" name="name" value="${esc(s.name)}" required ${dis}></div>
        <div class="field"><label for="pp-market">Markt</label>${sel('market', PD.MARKETS, s.market, 'pp-market')}</div>
        <div class="field"><label for="pp-size">Kontogröße</label><input class="input" id="pp-size" name="size" type="number" step="any" min="0" value="${esc(s.size)}" required inputmode="decimal" ${dis}></div>
        <div class="field"><label for="pp-cur">Währung</label>${sel('currency', U.fmt.currencies().map(c => [c.code, c.label]), s.currency, 'pp-cur')}</div>
        <div class="field"><label for="pp-split">Profit Split (%)</label><input class="input" id="pp-split" name="profitSplit" type="number" step="1" min="0" max="100" value="${Math.round(num(s.profitSplit, 0.9) * 100)}" ${dis}></div>
        <div class="field"><label for="pp-ver">Zuletzt geprüft am</label><input class="input" id="pp-ver" name="lastVerified" type="date" value="${esc(s.lastVerified || '')}" ${dis}><span class="hint">Ohne Datum gilt das Preset als unverifiziert.</span></div>
        <div class="field span2"><label for="pp-note">Notiz</label><textarea class="input" id="pp-note" name="note" rows="2" ${dis}>${esc(s.note || '')}</textarea></div>
      </div>
      <h3 class="prop-h3">Regeln, Payout und Gebühren</h3>${rulesFields(s.rules || {}, s.payout || {}, { fees: s.fees || {}, disabled: ro })}
      <div class="modal-foot">${ro ? `<button type="button" class="btn primary" data-action="prop-preset-copy" data-id="${s.id}">${I.copy} Als eigenes Preset kopieren</button><button type="button" class="btn" data-close>Schließen</button>` : `${mode === 'edit' ? `<button type="button" class="btn danger left" data-action="prop-preset-delete" data-id="${s.id}">${I.trash} Löschen</button>` : ''}<button type="button" class="btn" data-close>Abbrechen</button><button type="submit" class="btn primary">${mode === 'edit' ? 'Speichern' : 'Preset anlegen'}</button>`}</div></form>`, { cls: 'wide' });
  }

  /* ---------- Konten ---------- */
  function tabKonten() {
    const list = accounts(); const th = thresholds(); const ps = presets();
    /* Konten: eine schlanke Tabelle, Firma und Konto in einer Zelle */
    const accTable = list.length ? `<div class="tbl-wrap inset"><table class="tbl compact prop-acc-tbl"><thead><tr><th>Konto</th><th>Phase</th><th>Status</th><th>Start</th><th>Gruppe</th><th class="r">Trades</th><th></th></tr></thead><tbody>${list.map(a => `<tr><td><b>${esc(a.firm || 'Eigene Firma')}</b> ${esc(sizeName(a))}<div class="sub">${nameOf(PD.MARKETS, a.market, 'Futures')}</div></td><td>${U.pill(nameOf(PHASES, a.phase), 'neutral')}</td><td>${U.pill(nameOf(STATUS, a.status), STATUS_KIND[a.status] || 'neutral')}</td><td>${fmt.dateFull(a.startedAt)}</td><td>${esc(a.group || '—')}</td><td class="r">${evalOf(a).ev.n}</td><td class="r nowrap"><button type="button" class="btn ghost icon sm" data-action="prop-account-edit" data-id="${a.id}" aria-label="Bearbeiten">${I.edit}</button><button type="button" class="btn ghost icon sm" data-action="prop-account-delete" data-id="${a.id}" aria-label="Löschen">${I.trash}</button></td></tr>`).join('')}</tbody></table></div>` : emptyAccounts();
    /* Presets: die wichtigsten Spalten; Mindesttage, Kontraktlimit, Consistency und alle Gebühren zeigt „Ansehen“ */
    /* Presets schlank: Name (darunter Markt und „unverifiziert“), Größe, Drawdown, Ziel, Gebühr; Daily Loss, Split, Mindesttage und alle Gebühren zeigt „Ansehen“ */
    const unvPill = p => p.unverified || !p.lastVerified ? `<span data-tip="Unverifiziert, bitte prüfen">${U.pill('unverifiziert', 'warn')}</span>` : `<span data-tip="Geprüft am ${fmt.dateFull(p.lastVerified)}">${U.pill('geprüft', 'win')}</span>`;
    const presetRows = ps.map(p => `<tr class="${p.custom ? '' : 'prop-builtin'}"><td><b>${esc(p.firm)}</b> ${esc(p.name)}<div class="sub">${nameOf(PD.MARKETS, p.market, 'Futures')} ${unvPill(p)}</div></td><td class="r">${specMoney(p.size, p.currency)}</td><td class="r"><span data-tip="${esc(DD_SHORT[(p.rules && p.rules.drawdown && p.rules.drawdown.type) || 'static'] || '')}">${limText(p.rules && p.rules.drawdown)}</span></td><td class="r">${limText(p.rules && p.rules.profitTarget)}</td><td class="r">${p.fees && p.fees.challenge != null && p.fees.challenge !== '' ? specMoney(p.fees.challenge, p.currency) : '—'}</td><td class="r nowrap">${p.custom ? `<button type="button" class="btn ghost icon sm" data-action="prop-preset-edit" data-id="${esc(p.id)}" aria-label="Bearbeiten">${I.edit}</button><button type="button" class="btn ghost icon sm" data-action="prop-preset-delete" data-id="${esc(p.id)}" aria-label="Löschen">${I.trash}</button>` : `<button type="button" class="btn ghost icon sm" data-action="prop-preset-view" data-id="${esc(p.id)}" aria-label="Ansehen">${I.eye}</button><button type="button" class="btn ghost icon sm" data-action="prop-preset-copy" data-id="${esc(p.id)}" aria-label="Kopieren">${I.copy}</button>`}</td></tr>`).join('');
    const presetBody = `<div class="prop-fold-bar"><p class="small muted prop-fold-note">Deine Regeln je Firma und Kontogröße, beim Anlegen eines Kontos auswählbar.</p><button type="button" class="btn sm" data-action="prop-preset-new">${I.plus} Eigenes Preset</button></div>${presetRows ? `<div class="tbl-wrap inset"><table class="tbl compact prop-presets"><thead><tr><th>Preset</th><th class="r">Größe</th><th class="r">Drawdown</th><th class="r">Ziel</th><th class="r">Gebühr</th><th></th></tr></thead><tbody>${presetRows}</tbody></table></div>` : '<div class="dashed">Noch keine eigenen Presets.</div>'}`;
    const settings = `<p class="small muted prop-fold-note">Die Ampel vergleicht den kleinsten verbleibenden Spielraum (Daily Loss oder Drawdown) mit dem jeweiligen Limit.</p><form data-action="prop-settings-save" class="form-grid prop-settings">
      <div class="field"><label for="ps-yellow">Gelb, wenn weniger als … % des Limits übrig</label><input class="input" id="ps-yellow" name="yellow" type="number" min="0" max="100" step="1" value="${Math.round(th.yellow * 100)}" inputmode="decimal"></div>
      <div class="field"><label for="ps-red">Rot, wenn weniger als … % übrig</label><input class="input" id="ps-red" name="red" type="number" min="0" max="100" step="1" value="${Math.round(th.red * 100)}" inputmode="decimal"></div>
      <div class="field"><label for="ps-stop">${esc(unitLabel('Stop-Größe: Risiko pro Trade'))}</label><input class="input" id="ps-stop" name="stopSize" type="number" min="0" step="any" value="${S.settings.propStopSize > 0 ? S.settings.propStopSize : ''}" inputmode="decimal" placeholder="automatisch"><span class="hint">Leer: Median der Verlust-Trades der letzten 30 Trades je Konto. Bestimmt „noch X Stop-Losses“.</span></div>
      <div class="field span2"><div><button type="submit" class="btn primary sm">Speichern</button></div></div></form>`;
    return U.card('Deine Konten', accTable, { trailing: `<button type="button" class="btn sm primary" data-action="prop-account-new">${I.plus} Konto anlegen</button>`, info: 'Regeln sind je Konto als Momentaufnahme gespeichert. Status (geplatzt, bestanden, archiviert) setzt du im Konto-Dialog.' })
      + fold('presets', 'Eigene Presets', presetBody, { count: ps.length, sub: 'Vorlagen für neue Konten' })
      + fold('ampel', 'Ampel und Stop-Größe', settings, { sub: `Gelb unter ${Math.round(th.yellow * 100)} %, Rot unter ${Math.round(th.red * 100)} %` });
  }

  /* ---------- Bilanz ---------- */
  /* Eingabe-Formulare sind eingeklappt; der Knopf im Kartenkopf klappt sie auf (ohne Neuaufbau). Leere Liste: gleich offen */
  const entryBtn = (kind, label) => { const e = st().entry || {}; return `<button type="button" class="btn sm${e[kind] ? '' : ' primary'}" data-action="prop-entry" data-value="${kind}" aria-expanded="${!!e[kind]}">${e[kind] ? `${I.close} Schließen` : `${I.plus} ${label}`}</button>`; };
  function tabBilanz() {
    const ex = typeof S.propExpenses === 'function' ? S.propExpenses() : [], po = typeof S.propPayouts === 'function' ? S.propPayouts() : [], accs = accounts(); const bs = P.balanceSheet(ex, po, accs);
    U.chartData['prop-balance'] = { points: bs.series.map(p => ({ date: C.parseDayKey(p.date), v: { spent: p.spentCum, received: p.receivedCum } })), series: [{ key: 'spent', label: 'Ausgaben kumuliert', unit: 'cur', color: 'var(--loss)' }, { key: 'received', label: 'Payouts kumuliert', unit: 'cur', color: 'var(--profit)' }], periodLabel: d => fmt.dateFull(d) };
    const good = bs.accounts.passed + bs.accounts.funded;
    const tiles = strip(`${U.tile('Netto', U.pnl(bs.net), { foot: `${fmt.cur(bs.received)} Payouts − ${fmt.cur(bs.spent)} Ausgaben`, info: 'Erhaltene und beantragte Payouts (netto) minus alle Ausgaben.' })}${U.tile('ROI', bs.roi == null ? '—' : `<span class="${U.cls(bs.roi)}">${fmt.pct(bs.roi, 0, true)}</span>`, { foot: bs.pending > C.EPS ? `davon ${fmt.cur(bs.pending)} noch offen` : bs.received > C.EPS ? 'alle Payouts erhalten' : 'noch keine Payouts', info: 'Netto geteilt durch Ausgaben.' })}${U.tile('Kosten je Bestehen', bs.costPerPassed == null ? '—' : fmt.cur(bs.costPerPassed), { foot: good ? `${good} bestanden oder funded` : 'noch kein Konto bestanden', info: 'Alle Ausgaben geteilt durch die Zahl der bestandenen oder funded Konten.' })}${U.tile('Bestehensquote', bs.passRate == null ? '—' : fmt.pct(bs.passRate), { foot: `${good} bestanden · ${bs.accounts.breached} geplatzt` })}${U.tile('Bis Break-even', bs.toBreakEven > C.EPS ? `<span class="neg">${fmt.cur(bs.toBreakEven)}</span>` : '<span class="pos">erreicht</span>', { foot: bs.toBreakEven > C.EPS ? 'fehlende Payouts (netto)' : 'Payouts decken alle Ausgaben' })}`);
    const chart = U.card('Ausgaben vs. Payouts', `<div class="chart h280" data-chart="lines" data-id="prop-balance"></div><div class="legend"><span><i style="background:var(--loss)"></i>Ausgaben kumuliert</span><span><i style="background:var(--profit)"></i>Payouts kumuliert</span></div>`, { info: 'Ein Punkt je Ausgabe oder Payout, chronologisch. Payout-Datum: erhalten, sonst beantragt.' });
    const byFirm = U.card('Pro Firma', bs.byFirm.length ? `<div class="prop-firms">${bs.byFirm.map(f => `<div class="prop-firm"><div class="pfm-top"><b>${esc(f.firm)}</b><span>${U.pnl(f.net)}</span></div><div class="pfm-sub">${fmt.cur(f.spent)} Ausgaben · ${fmt.cur(f.received)} Payouts · ROI ${f.roi == null ? '—' : fmt.pct(f.roi, 0, true)}</div></div>`).join('')}</div>` : '<div class="dashed">Noch keine Ausgaben oder Payouts.</div>', { info: 'Netto je Firma: Payouts minus Ausgaben.' });
    const accOpts = (cur) => `<option value="">—</option>${accs.map(a => `<option value="${a.id}" ${cur === a.id ? 'selected' : ''}>${esc(accName(a))} · ${nameOf(STATUS, a.status)}</option>`).join('')}`;
    const firmList = [...new Set([...presets().map(p => p.firm), ...accs.map(a => a.firm)].filter(Boolean))];
    const ent = st().entry || (st().entry = {}); if (!ex.length && ent.expense == null) ent.expense = true; if (!po.length && ent.payout == null) ent.payout = true; /* leere Liste: Formular gleich offen */
    const expForm = `<form data-action="prop-expense-add" class="form-grid prop-entry" id="prop-entry-expense"${ent.expense ? '' : ' hidden'}><div class="field"><label for="pe-type">Typ</label><select class="select" id="pe-type" name="type">${PD.EXPENSE_TYPES.map(([k, l]) => `<option value="${k}">${l}</option>`).join('')}</select></div><div class="field"><label for="pe-amount">${esc(unitLabel('Betrag'))}</label><input class="input" id="pe-amount" name="amount" type="number" step="0.01" min="0" required inputmode="decimal"></div><div class="field"><label for="pe-date">Datum</label><input class="input" id="pe-date" name="date" type="date" value="${today()}" required></div><div class="field"><label for="pe-firm">Firma</label><input class="input" id="pe-firm" name="firm" list="prop-firm-list" placeholder="oder über Konto"><datalist id="prop-firm-list">${firmList.map(f => `<option value="${esc(f)}">`).join('')}</datalist></div><div class="field"><label for="pe-acc">Konto</label><select class="select" id="pe-acc" name="accountId">${accOpts('')}</select></div><div class="field"><label for="pe-note">Notiz</label><input class="input" id="pe-note" name="note"></div><div class="field"><span class="lbl">&nbsp;</span><button type="submit" class="btn primary">${I.plus} Ausgabe erfassen</button></div></form>`;
    const exRows = ex.slice().sort((a, b) => String(b.date).localeCompare(String(a.date))).map(e => { const a = accs.find(x => x.id === e.accountId); return `<tr><td>${fmt.dateFull(e.date)}</td><td>${nameOf(PD.EXPENSE_TYPES, e.type)}</td><td>${esc(e.firm || (a ? a.firm : '') || '—')}</td><td>${a ? esc(accName(a)) : '—'}</td><td class="r neg">${fmt.cur(e.amount)}</td><td class="muted">${esc(e.note || '')}</td><td class="r"><button type="button" class="btn ghost icon sm" data-action="prop-expense-delete" data-id="${esc(e.id)}" aria-label="Löschen">${I.trash}</button></td></tr>`; }).join('');
    const expenses = U.card('Ausgaben', `${expForm}${ex.length ? `<div class="tbl-wrap"><table class="tbl compact"><thead><tr><th>Datum</th><th>Typ</th><th>Firma</th><th>Konto</th><th class="r">Betrag</th><th>Notiz</th><th></th></tr></thead><tbody>${exRows}</tbody></table></div>` : `<div class="dashed">Noch keine Ausgaben erfasst. Challenge-Gebühren, Resets, Aktivierungen und Datengebühren gehören hierher.</div>`}`, { info: 'Alle Kosten rund um Prop Firms. Summen fließen in Netto, ROI und Break-even.', trailing: entryBtn('expense', 'Ausgabe erfassen') });
    const first = accs.find(a => a.status === 'active') || accs[0]; const split0 = first ? Math.round(num(first.profitSplit, 0.9) * 100) : 90;
    const poForm = accs.length ? `<form data-action="prop-payout-add" class="form-grid prop-entry" id="prop-entry-payout"${ent.payout ? '' : ' hidden'}><div class="field"><label for="pp-acc">Konto</label><select class="select" id="pp-acc" name="accountId" required data-change="prop-payout-form">${accs.map(a => `<option value="${a.id}" ${first && a.id === first.id ? 'selected' : ''}>${esc(accName(a))} · ${nameOf(STATUS, a.status)}</option>`).join('')}</select></div><div class="field"><label for="pp-gross">${esc(unitLabel('Brutto'))}</label><input class="input" id="pp-gross" name="gross" type="number" step="0.01" min="0" required inputmode="decimal" data-input="prop-payout-net"></div><div class="field"><label for="pp-split">Split (%)</label><input class="input" id="pp-split" name="split" type="number" step="1" min="0" max="100" value="${split0}" inputmode="decimal" data-input="prop-payout-net"></div><div class="field"><label for="pp-net">${esc(unitLabel('Netto'))}</label><input class="input" id="pp-net" name="net" type="number" step="0.01" min="0" inputmode="decimal" placeholder="automatisch"></div><div class="field"><label for="pp-req">Beantragt am</label><input class="input" id="pp-req" name="requestedAt" type="date" value="${today()}" required></div><div class="field"><label for="pp-rec">Erhalten am</label><input class="input" id="pp-rec" name="receivedAt" type="date"></div><div class="field"><label for="pp-status">Status</label><select class="select" id="pp-status" name="status">${PAYOUT_STATUS.map(([k, l]) => `<option value="${k}">${l}</option>`).join('')}</select></div><div class="field"><span class="lbl">&nbsp;</span><button type="submit" class="btn primary">${I.plus} Payout erfassen</button></div></form>` : '<div class="dashed">Lege zuerst ein Prop-Konto an, dann kannst du Payouts erfassen.</div>';
    const poRows = po.slice().sort((a, b) => String(b.requestedAt).localeCompare(String(a.requestedAt))).map(p => { const a = accs.find(x => x.id === p.accountId); const kind = p.status === 'received' ? 'win' : p.status === 'denied' ? 'loss' : 'open'; return `<tr><td>${a ? esc(accName(a)) : esc(p.firm || '—')}</td><td class="r">${fmt.cur(p.gross)}</td><td class="r">${fmt.pct(num(p.split, 0))}</td><td class="r pos">${fmt.cur(p.net)}</td><td>${fmt.dateFull(p.requestedAt)}</td><td>${p.receivedAt ? fmt.dateFull(p.receivedAt) : '—'}</td><td>${U.pill(nameOf(PAYOUT_STATUS, p.status), kind)}</td><td class="r nowrap">${p.status === 'requested' ? `<button type="button" class="btn xs" data-action="prop-payout-received" data-id="${esc(p.id)}">Erhalten</button> ` : ''}<button type="button" class="btn ghost icon sm" data-action="prop-payout-delete" data-id="${esc(p.id)}" aria-label="Löschen">${I.trash}</button></td></tr>`; }).join('');
    const payouts = U.card('Payouts', `${poForm}${po.length ? `<div class="tbl-wrap"><table class="tbl compact"><thead><tr><th>Konto</th><th class="r">Brutto</th><th class="r">Split</th><th class="r">Netto</th><th>Beantragt</th><th>Erhalten</th><th>Status</th><th></th></tr></thead><tbody>${poRows}</tbody></table></div>` : `<div class="dashed">Noch keine Payouts erfasst.</div>`}`, { info: 'Netto = Brutto × Split. Abgelehnte Payouts zählen nicht in der Bilanz.', trailing: accs.length ? entryBtn('payout', 'Payout erfassen') : '' });
    /* Payout-Planer (früher eigener Reiter) als aufklappbarer Abschnitt unter den Payouts */
    const planer = accs.length ? fold('planer', 'Payout-Planer', payoutPlanner(), { sub: 'Bedingungen und Vorschlag je Konto' }) : '';
    return `${tiles}<div class="grid main-side">${chart}${byFirm}</div>${expenses}${payouts}${planer}`;
  }

  /* ---------- Payout-Planer (Abschnitt in der Bilanz) ---------- */
  function payoutPlanner() {
    const list = accounts(); if (!list.length) return emptyAccounts(); const a = pickAccount(list, 'payoutAccount'); const { ev } = evalOf(a); const plan = planOf(a, ev); const o = plan.opts; const cons = plan.consistency;
    const sel = `<div class="prop-toolbar">${accSelect('pp-acc-sel', 'prop-payout-account', list, a.id)}</div>`;
    const dead = ev.status === 'breached' || a.status === 'breached';
    const intro = dead ? U.banner('loss', 'Konto geplatzt', 'Für dieses Konto ist kein Payout mehr möglich.') : !plan.hasCond ? U.banner('info', 'Keine Bedingungen hinterlegt', plan.funded ? 'Trage im Konto die Payout-Bedingungen ein (Mindest-Handelstage, Mindestgewinn oder Mindestbalance).' : 'Trage im Konto Profit Target oder Mindest-Handelstage ein, dann zeigt der Planer den Weg zum Bestehen.') : plan.ready ? U.banner('accent', plan.funded ? 'Bereit für den Payout' : 'Challenge bestanden', 'Alle Bedingungen sind erfüllt.') : plan.funded ? '' : U.banner('info', '', `Dieses Konto ist in der ${nameOf(PHASES, a.phase)}. Der Planer zeigt den Weg zum Bestehen: Profit Target und Mindest-Handelstage statt Payout-Bedingungen.`);
    const warn = !dead && plan.consistencyWarning ? U.banner('warn', '', esc(plan.consistencyWarning)) : '';
    /* fehlender Gewinn bzw. fehlende Balance getrennt, damit beide Zeilen ihren eigenen Hinweis zeigen */
    const missP = o.minProfit != null && o.minProfit > 0 ? Math.max(0, num(o.minProfit) - num(ev.pnl)) : 0; const missB = o.minBalance != null ? Math.max(0, num(o.minBalance) - num(ev.balance)) : 0;
    const conds = U.card(plan.funded ? 'Payout-Bedingungen' : 'Bedingungen zum Bestehen', `${U.kv('Handelstage', `${ev.days.length}${o.minDays != null ? ` von ${o.minDays}` : ''} ${plan.missingDays ? `<span class="warn">· noch ${plan.missingDays}</span>` : o.minDays != null ? '<span class="pos">· erfüllt</span>' : '<span class="muted">· keine Vorgabe</span>'}`)}${U.kv(plan.funded ? 'Gewinn seit Start' : 'Profit Target', `${U.pnl(ev.pnl)}${o.minProfit != null && o.minProfit > 0 ? ` <span class="muted">von ${fmt.cur(o.minProfit)}</span>` : ''} ${missP > C.EPS ? `<span class="warn">· ${fmt.cur(missP)} fehlen</span>` : o.minProfit != null && o.minProfit > 0 ? '<span class="pos">· erfüllt</span>' : '<span class="muted">· keine Vorgabe</span>'}`)}${o.minBalance != null ? U.kv('Mindestbalance', `${fmt.balance(ev.balance)} <span class="muted">von ${fmt.cur(o.minBalance)}</span> ${missB > C.EPS ? `<span class="warn">· ${fmt.cur(missB)} fehlen</span>` : '<span class="pos">· erfüllt</span>'}`) : ''}${U.kv('Consistency Rule', cons ? `${cons.ok ? '<span class="pos">ok</span>' : '<span class="neg">verletzt</span>'} <span class="muted">· bester Tag <span title="${cons.bestDayPct > 1 ? 'Der Gesamtgewinn ist kleiner als der beste Tag' : 'Anteil des besten Tages am Gesamtgewinn'}">${cons.bestDayPct == null ? '—' : fmt.pct(cons.bestDayPct)}</span> von max. ${fmt.num(cons.maxDayPct)} %${isFinite(cons.allowedToday) ? ` · heute noch ${fmt.cur(cons.allowedToday)} erlaubt` : ''}</span>` : '<span class="muted">keine Regel</span>')}${U.kv('Profit Split', fmt.pct(num(a.profitSplit, 0)))}${plan.funded && ev.pnl > C.EPS ? U.kv('Netto bei Auszahlung des Gewinns', fmt.cur(ev.pnl * num(a.profitSplit, 0))) : ''}`);
    const sugg = !dead && plan.suggestion.total > C.EPS ? U.card('Vorschlag', `<div class="big-stat"><span>${fmt.cur(plan.suggestion.perDay)}</span></div><div class="small muted">Ø Gewinn pro Tag über ${plan.suggestion.days} Tag${plan.suggestion.days === 1 ? '' : 'e'}. So erreichst du die fehlenden ${fmt.cur(plan.suggestion.total)}${cons ? ', und kein Tag überschreitet die Consistency-Grenze' : ''}.</div>`, { info: 'Fehlender Gewinn gleichmäßig auf die fehlenden Tage verteilt; bei verletzter Consistency Rule zusätzlich so viel, dass der beste Tag wieder unter die Grenze fällt.' }) : '';
    const hist = (typeof S.propPayouts === 'function' ? S.propPayouts() : []).filter(p => p.accountId === a.id).sort((x, y) => String(y.requestedAt).localeCompare(String(x.requestedAt)));
    const history = U.card('Payouts dieses Kontos', hist.length ? `<div class="tbl-wrap inset"><table class="tbl compact"><thead><tr><th>Beantragt</th><th>Erhalten</th><th class="r">Brutto</th><th class="r">Netto</th><th>Status</th></tr></thead><tbody>${hist.map(p => `<tr><td>${fmt.dateFull(p.requestedAt)}</td><td>${p.receivedAt ? fmt.dateFull(p.receivedAt) : '—'}</td><td class="r">${fmt.cur(p.gross)}</td><td class="r pos">${fmt.cur(p.net)}</td><td>${U.pill(nameOf(PAYOUT_STATUS, p.status), p.status === 'received' ? 'win' : p.status === 'denied' ? 'loss' : 'open')}</td></tr>`).join('')}</tbody></table></div>` : '<div class="dashed">Noch keine Payouts für dieses Konto. Erfasse sie oben unter Payouts.</div>');
    return `${sel}${intro}${warn}<div class="grid two">${conds}${sugg || history}</div>${sugg ? history : ''}`;
  }

  /* ---------- Seite ---------- */
  App.screens.prop = {
    title: 'Prop Firms',
    head: { range: false, account: false }, /* Prop-Konten haben eigene Trades und Zeiträume: Journal-Zeitraum und -Konto spielen hier keine Rolle */
    actions() { return `<button type="button" class="btn" data-action="prop-account-new">${I.plus}<span class="hide-m">Prop-Konto</span></button>`; },
    render(ctx) {
      cache = new Map(); const s = st(); s.last = s.last || {};
      /* Adresse → Ansicht: alte Adressen (#/prop/bilanz …) gelten weiter; #/prop/auswertung (auch die alten #/prop/finanzen und #/prop/analyse) öffnet die zuletzt benutzte Ansicht */
      let key = ctx.params[0] || 'cockpit'; if (key === 'uebersicht') key = 'cockpit';
      if (key === 'payout') { key = 'bilanz'; (s.fold || (s.fold = {})).planer = true; } else if (key === 'simulation' || key === 'vergleich') key = 'bilanz'; else if (key === 'rechner') key = 'cockpit';
      if (key === 'finanzen' || key === 'analyse' || key === 'auswertung') { const subs = subsOf('auswertung'); key = (subs.find(t => t[0] === s.last.auswertung) || subs[0] || ['cockpit'])[0]; }
      if (!VIEWS[key]) key = 'cockpit';
      const area = areaOf(key); s.tab = key; s.last[area] = key;
      /* Die fünf Bereiche stehen links in der Kopfreihe (statt Zeitraum und Konto), die Unteransichten als Reiter darunter */
      const nav = `<nav class="prop-tabs" aria-label="Bereiche">${AREAS.filter(([k]) => subsOf(k).length).map(([k, l]) => { const subs = subsOf(k); const to = (subs.find(t => t[0] === s.last[k]) || subs[0])[0]; return `<a href="#/prop/${to}" data-area="${k}" aria-pressed="${area === k}"${area === k ? ' aria-current="page"' : ''}>${l}</a>`; }).join('')}</nav>`;
      const subs = subsOf(area); const sub = subs.length > 1 ? `<nav class="prop-sub" aria-label="Ansichten">${subs.map(([k, l]) => `<a href="#/prop/${k}" aria-pressed="${k === key}"${k === key ? ' aria-current="page"' : ''}>${esc(l)}</a>`).join('')}</nav>` : '';
      ctx.headLeft = nav;
      return sub + VIEWS[key](ctx);
    },
    mount(main) { const fn = MOUNTS[st().tab]; if (fn) fn(main); /* Diagramme zeichnet App.render über U.drawCharts */ },
    unmount() { const fn = UNMOUNTS[st().tab]; if (fn) fn(); },
  };
  Object.assign(VIEWS, { cockpit: tabCockpit, bilanz: tabBilanz, konten: tabKonten });
  /* Schnittstelle für weitere Tabs: register(key, label, render(ctx), { mount(main), unmount() }); Hilfen für dieselben Konten-/Bewertungsdaten */
  root.PropScreen = {
    TABS, register(key, label, render, o = {}) { if (!TABS.some(t => t[0] === key)) TABS.push([key, label]); VIEWS[key] = render; if (o.mount) MOUNTS[key] = o.mount; if (o.unmount) UNMOUNTS[key] = o.unmount; },
    accounts, presets, presetOf, accName, evalOf, planOf, planText, pickAccount, thresholds, st, num, nameOf, PHASES, STATUS, STATUS_KIND, DD_SHORT, AMPEL, verifiedPill, emptyAccounts,
  };

  /* ---------- Aktionen ---------- */
  const find = id => accounts().find(a => a.id === id) || null;
  Object.assign(App.actions, {
    'prop-filter'(el) { st().filter[el.dataset.key] = el.dataset.value != null ? el.dataset.value : el.value; App.rerender(); },
    'prop-fold'(el) { const d = el.closest('details'); if (!d) return; d.open = !d.open; const s = st(); (s.fold || (s.fold = {}))[el.dataset.key] = d.open; },
    'prop-entry'(el) { const s = st(); const e = s.entry || (s.entry = {}); const kind = el.dataset.value; e[kind] = !e[kind]; const f = document.getElementById('prop-entry-' + kind); if (f) { f.hidden = !e[kind]; if (e[kind]) { const first = f.querySelector('select, input'); if (first) first.focus({ preventScroll: true }); } } const lbl = kind === 'expense' ? 'Ausgabe erfassen' : 'Payout erfassen'; el.classList.toggle('primary', !e[kind]); el.setAttribute('aria-expanded', String(!!e[kind])); el.innerHTML = e[kind] ? `${I.close} Schließen` : `${I.plus} ${lbl}`; if (App.translateNow) App.translateNow(el); },
    'prop-account-new'() { accountEditor(null); },
    'prop-account-edit'(el) { const a = find(el.dataset.id); if (a) accountEditor(a); },
    'prop-preset-pick'(el) { const p = presets().find(x => x.id === el.value) || null; fillAccountForm(el.form || el.closest('form'), p); },
    'prop-account-save'(form) {
      const fd = new FormData(form); const g = k => String(fd.get(k) == null ? '' : fd.get(k)).trim(); const rr = readRules(fd); const size = num(g('size'), 0);
      if (!g('firm') || !(size > 0)) return U.toast('Bitte Firma und Kontogröße angeben', 'err');
      const patch = { firm: g('firm'), name: g('name'), market: g('market') === 'forex' ? 'forex' : 'futures', size, currency: CURRENCIES.includes(g('currency')) ? g('currency') : 'USD', phase: PHASES.some(p => p[0] === g('phase')) ? g('phase') : 'challenge1', status: STATUS.some(s => s[0] === g('status')) ? g('status') : 'active', startedAt: g('startedAt') ? C.parseDayKey(g('startedAt')).toISOString() : new Date().toISOString(), startBalance: num(g('startBalance'), size), rules: rr.rules, payout: rr.payout, profitSplit: Math.min(1, Math.max(0, num(g('profitSplit'), 90) / 100)), group: g('group'), tz: rr.tz, note: g('note') };
      if (fd.has('firmId')) patch.firmId = g('firmId');
      if (form.dataset.id) { S.updatePropAccount(form.dataset.id, patch); U.toast('Konto gespeichert', 'ok'); } else { S.addPropAccount(patch); U.toast('Konto angelegt', 'ok'); }
      U.closeModal(); App.rerender();
    },
    async 'prop-account-delete'(el) { const a = find(el.dataset.id); if (!a) return; if (await U.confirmModal('Konto löschen?', `„${esc(accName(a))}“ wird entfernt. Die Zuordnung der Trades zu diesem Konto wird gelöst, die Trades bleiben erhalten.`, { ok: 'Löschen', danger: true })) { S.deletePropAccount(a.id); U.closeModal(true); U.toast('Konto gelöscht'); App.rerender(); } },
    'prop-account-status'(el) { const a = find(el.dataset.id); if (!a) return; S.updatePropAccount(a.id, { status: el.dataset.value }); U.toast(`Status: ${nameOf(STATUS, el.dataset.value)}`, 'ok'); App.rerender(); },
    'prop-mark-breached'(el) {
      const a = find(el.dataset.id); if (!a) return; const { ev } = evalOf(a, true); const b = ev.breaches[0] || null; const at = b ? b.at : new Date().toISOString();
      S.updatePropAccount(a.id, { status: 'breached', breachedAt: at }); if (typeof S.addPropBreach === 'function') S.addPropBreach({ accountId: a.id, tradeId: b ? b.tradeId : null, rule: b ? b.rule : 'manual', at, note: b ? b.detail : 'Manuell markiert', auto: !!b });
      U.toast('Konto als geplatzt markiert'); App.rerender();
    },
    'prop-assign'(el) { const a = find(el.dataset.id); if (a) assignModal(a); },
    'prop-assign-all'(el) { el.closest('form').querySelectorAll('.prop-assign input[type=checkbox]').forEach(c => { c.checked = el.dataset.on === '1'; }); },
    'prop-assign-save'(form) {
      const fd = new FormData(form); const shown = String(fd.get('shown') || '').split(',').filter(Boolean); const on = fd.getAll('t').map(String); const off = shown.filter(id => !on.includes(id)); const a = find(form.dataset.id); if (!a) return;
      const targets = [a.id]; if (fd.get('group') === 'on' && a.group) for (const x of accounts()) if (x.id !== a.id && x.group === a.group) targets.push(x.id);
      for (const id of targets) { S.assignTradesToPropAccount(on, id, true); S.assignTradesToPropAccount(off, id, false); }
      U.closeModal(); U.toast(`${on.length} Trade${on.length === 1 ? '' : 's'} zugeordnet`, 'ok'); App.rerender();
    },
    /* Presets */
    'prop-preset-new'() { presetEditor(null, 'new'); },
    'prop-preset-edit'(el) { const p = presets().find(x => x.id === el.dataset.id); if (p) presetEditor(p, p.custom ? 'edit' : 'view'); },
    'prop-preset-view'(el) { const p = presets().find(x => x.id === el.dataset.id); if (p) presetEditor(p, 'view'); },
    'prop-preset-copy'(el) { const p = presets().find(x => x.id === el.dataset.id); if (!p) return; const c = JSON.parse(JSON.stringify(p)); delete c.id; c.name = `${p.name} (Kopie)`; c.lastVerified = null; c.unverified = true; const n = S.addPropFirm(c); U.closeModal(true); U.toast('Preset kopiert – bitte Werte prüfen', 'ok'); App.rerender(); presetEditor(n, 'edit'); },
    'prop-preset-save'(form) {
      const fd = new FormData(form); const g = k => String(fd.get(k) == null ? '' : fd.get(k)).trim(); const rr = readRules(fd); const size = num(g('size'), 0); if (!g('firm') || !g('name') || !(size > 0)) return U.toast('Bitte Firma, Konto und Größe angeben', 'err');
      const patch = { firm: g('firm'), name: g('name'), market: g('market') === 'forex' ? 'forex' : 'futures', size, currency: CURRENCIES.includes(g('currency')) ? g('currency') : 'USD', rules: rr.rules, fees: rr.fees || { challenge: 0, reset: 0, activation: 0, monthly: 0, data: 0 }, profitSplit: Math.min(1, Math.max(0, num(g('profitSplit'), 90) / 100)), payout: rr.payout, lastVerified: g('lastVerified') || null, unverified: !g('lastVerified'), note: g('note') };
      if (form.dataset.id) { S.updatePropFirm(form.dataset.id, patch); U.toast('Preset gespeichert', 'ok'); } else { S.addPropFirm(patch); U.toast('Preset angelegt', 'ok'); }
      U.closeModal(); App.rerender();
    },
    async 'prop-preset-delete'(el) { const p = presets().find(x => x.id === el.dataset.id); if (!p || !p.custom) return; if (await U.confirmModal('Preset löschen?', 'Konten, die daraus angelegt wurden, behalten ihre Regeln (Momentaufnahme).', { ok: 'Löschen', danger: true })) { S.deletePropFirm(p.id); U.closeModal(true); App.rerender(); } },
    'prop-settings-save'(form) { const fd = new FormData(form); const y = Math.min(100, Math.max(0, num(fd.get('yellow'), 50))) / 100, r = Math.min(100, Math.max(0, num(fd.get('red'), 25))) / 100; S.data.settings.propThresholds = { yellow: Math.max(y, r), red: Math.min(y, r) }; S.data.settings.propStopSize = Math.max(0, num(fd.get('stopSize'), 0)); S.save(); U.toast('Gespeichert', 'ok'); App.rerender(); },
    /* Bilanz */
    'prop-expense-add'(form) { const fd = new FormData(form); const amount = num(fd.get('amount'), 0); const date = String(fd.get('date') || ''); if (!(amount > 0) || !date) return U.toast('Bitte Betrag und Datum angeben', 'err'); const accountId = String(fd.get('accountId') || '') || null; const a = accountId ? find(accountId) : null; S.addPropExpense({ type: PD.EXPENSE_TYPES.some(t => t[0] === fd.get('type')) ? fd.get('type') : 'other', amount, date, firm: String(fd.get('firm') || '').trim() || (a ? a.firm : ''), accountId, note: String(fd.get('note') || '').trim() }); U.toast('Ausgabe erfasst', 'ok'); App.rerender(); },
    async 'prop-expense-delete'(el) { if (await U.confirmModal('Ausgabe löschen?', '', { ok: 'Löschen', danger: true })) { S.deletePropExpense(el.dataset.id); App.rerender(); } },
    'prop-payout-form'(el) { const form = el.form || el.closest('form'); const a = find(el.value); if (a && form.elements.split) form.elements.split.value = Math.round(num(a.profitSplit, 0.9) * 100); App.actions['prop-payout-net'](form.elements.gross); },
    'prop-payout-net'(el) { const form = el.form || el.closest('form'); if (!form) return; const gross = num(form.elements.gross.value, 0), split = num(form.elements.split.value, 100); form.elements.net.value = (Math.round(gross * split) / 100).toFixed(2); },
    'prop-payout-add'(form) { const fd = new FormData(form); const a = find(String(fd.get('accountId') || '')); const gross = num(fd.get('gross'), 0); if (!a || !(gross > 0)) return U.toast('Bitte Konto und Bruttobetrag angeben', 'err'); const split = Math.min(1, Math.max(0, num(fd.get('split'), 90) / 100)); const net = num(fd.get('net')) != null ? num(fd.get('net')) : Math.round(gross * split * 100) / 100; const receivedAt = String(fd.get('receivedAt') || '') || null; let status = PAYOUT_STATUS.some(s => s[0] === fd.get('status')) ? String(fd.get('status')) : 'requested'; if (receivedAt && status === 'requested') status = 'received'; S.addPropPayout({ accountId: a.id, firm: a.firm, gross, split, net, requestedAt: String(fd.get('requestedAt') || today()), receivedAt, status }); U.toast('Payout erfasst', 'ok'); App.rerender(); },
    'prop-payout-received'(el) { S.updatePropPayout(el.dataset.id, { status: 'received', receivedAt: today() }); App.rerender(); },
    async 'prop-payout-delete'(el) { if (await U.confirmModal('Payout löschen?', '', { ok: 'Löschen', danger: true })) { S.deletePropPayout(el.dataset.id); App.rerender(); } },
    /* Payout-Planer */
    'prop-payout-account'(el) { st().payoutAccount = el.value; App.rerender(); },
  });
})(typeof self !== 'undefined' ? self : this);
