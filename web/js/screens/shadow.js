/* Schatten-Ich: Wie sähe das Konto aus, wenn du deine eigenen Regeln zu 100 % eingehalten hättest? Regelwerk, Kosten je Periode, Verstöße, Ranking, Bildkarte (Rechnung: js/shadow.js) */
(function (root) {
  'use strict';
  const C = root.Core, S = root.Store, U = root.UI, I = U.I, esc = U.esc, fmt = U.fmt, App = root.App, Sh = root.Shadow;
  const PERIODS = [['week', 'Woche'], ['month', 'Monat'], ['all', 'Gesamt']];
  const LABEL = {}; for (const r of Sh.RULES) LABEL[r.key] = r.label;
  const st = () => App.state.shadow || (App.state.shadow = { period: 'month' });

  /* ---------- Regeln lesen/schreiben ---------- */
  /* Immer ein frisches, vollständiges Objekt: gespeicherte Regeln über die Defaults gelegt, fehlende Felder ergänzt */
  function rules() { const src = (typeof S.shadowRules === 'function' && S.shadowRules()) || {}; const d = Sh.defaultRules(); for (const k of Object.keys(d)) if (src[k] && typeof src[k] === 'object') Object.assign(d[k], src[k]); return d; }
  function saveRules(r) { if (typeof S.setShadowRules === 'function') S.setShadowRules(r); else { S.data.shadowRules = r; S.save(); } App.rerender(); }
  const evaluate = all => Sh.evaluate(all, rules(), { account: App.account(), rUnit: App.rUnit(all) });

  /* ---------- Periode (wie in der Engine: nach Schlusszeitpunkt) ---------- */
  function selector(period, now) { const ws = C.weekStart(now), mk = C.dayKey(now).slice(0, 7); return period === 'week' ? d => d >= ws && d <= now : period === 'month' ? d => C.dayKey(d).slice(0, 7) === mk : () => true; }
  const periodName = period => (PERIODS.find(x => x[0] === period) || PERIODS[1])[1];
  const periodLabel = (period, now) => period === 'week' ? `Woche ab ${fmt.dateFull(C.weekStart(now))}` : period === 'month' ? fmt.monthYear(now) : 'Gesamter Zeitraum';
  /* Alles, was die Seite für eine Periode braucht: Summen, Verstöße (nach Datum absteigend), Ranking, Kurve neu ab 0 */
  function periodData(res, all, period, now) {
    const sel = selector(period, now); const byId = new Map(all.map(t => [t.id, t])); const rowById = new Map(res.trades.map(r => [r.id, r]));
    const violations = res.violations.filter(v => { const t = byId.get(v.tradeId); return sel(t && t.close ? t.close : new Date(v.date)); }).sort((a, b) => new Date(b.date) - new Date(a.date));
    const ranking = res.ranking.map(x => { const v = violations.filter(y => y.rule === x.rule); return { rule: x.rule, label: x.label, n: v.length, cost: C.sum(v.map(y => y.cost)) }; }).sort((a, b) => b.cost - a.cost || b.n - a.n);
    let real = 0, shadow = 0; const curve = res.curve.filter(p => sel(p.date)).map(p => { const r = rowById.get(p.id) || { realPnl: 0, shadowPnl: 0 }; real += r.realPnl; shadow += r.shadowPnl; return { date: p.date, real, shadow }; });
    return { sums: res.periods[period] || res.periods.all, violations, ranking, curve, label: periodLabel(period, now) };
  }
  /* Kosten-Darstellung: Betrag ohne Vorzeichen, Farbe und Text sagen, in welche Richtung */
  function costView(cost) { if (cost > C.EPS) return { cls: 'neg', text: fmt.cur(cost), foot: 'Regelbrüche haben dich das gekostet' }; if (cost < -C.EPS) return { cls: 'pos', text: fmt.cur(-cost), foot: 'Regelbrüche haben dir das gebracht' }; return { cls: 'neu', text: fmt.cur(0), foot: 'Alles nach Regeln' }; }
  const curSym = () => fmt.cur(0, { money: true }).replace(/[\d.,\s ]/g, '');

  /* ---------- Regelwerk ---------- */
  /* Eine Regel = eine ruhige Kachel: Name und kurze Erklärung links, Schalter rechts; Werte erscheinen erst, wenn die Regel an ist,
     als kompakte Felder mit Einheit im Feld (3 Trades, 2 R, 08:00 – 17:00) */
  /* kurze Erklärung je Regel, damit man ohne Info-Symbol versteht, was sie tut */
  const DESC = { maxTrades: 'Höchstens so viele Trades an einem Tag.', dailyLoss: 'Ist das Tageslimit erreicht, ist für heute Schluss.', lossStreak: 'Nach so vielen Verlusten hintereinander ist Pause.', maxRisk: 'Kein Trade mit mehr Risiko als festgelegt.', hours: 'Nur innerhalb dieser Uhrzeiten handeln.', setups: 'Nur Setups aus deiner Auswahl sind erlaubt.', cooldown: 'Nach einem Verlust erst eine Pause einlegen.' };
  function ruleRow(def, r, setups) {
    const on = !!r.on;
    const common = f => `data-change="shadow-rule-field" data-rule="${def.key}" data-field="${f.key}" aria-label="${esc(def.label + ': ' + f.label)}"`;
    const field = f => {
      if (f.type === 'unit') return `<select class="select sr-unit" ${common(f)}>${[['r', 'R-Einheit'], ['pct', '% vom Konto'], ['money', fmt.moneyBlind() ? 'Betrag' : `Betrag (${curSym()})`]].map(([k, l]) => `<option value="${k}" ${r.unit === k ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
      if (f.type === 'time') return `<input class="input sr-time" type="time" value="${esc(r[f.key])}" ${common(f)}>`;
      const suffix = def.fields.length === 1 ? f.label : '';
      return `<label class="sr-num"><input class="input" type="number" inputmode="decimal" min="0" step="${f.type === 'int' ? '1' : 'any'}" value="${esc(r[f.key])}" ${common(f)}>${suffix ? `<span>${esc(suffix)}</span>` : ''}</label>`;
    };
    const plain = def.fields.filter(f => f.type !== 'setups');
    const ctrl = !plain.length ? '' : def.key === 'hours' ? `${field(plain[0])}<span class="sr-dash">–</span>${field(plain[1])}` : plain.map(field).join('');
    let extra = '';
    if (def.fields.some(f => f.type === 'setups')) {
      const list = Array.isArray(r.list) ? r.list : []; const all = [...new Set([...(setups || []), ...list])];
      extra = !all.length ? `<div class="small muted shadow-hint">Noch keine Setups angelegt. Lege sie unter <a href="#/settings/inhalte">Einstellungen → Inhalte</a> an oder vergib sie beim Loggen.</div>`
        : `<div class="chips shadow-chips">${all.map(x => `<button type="button" class="chip sel" aria-pressed="${list.includes(x)}" data-action="shadow-setup-toggle" data-value="${esc(x)}">${esc(x)}</button>`).join('')}</div>${!list.length ? `<div class="small warn shadow-hint">Kein Setup gewählt – so zählt jeder Trade als Verstoß.</div>` : ''}`;
    }
    return `<div class="shadow-rule ${on ? 'on' : ''}"><div class="sr-main"><div class="sr-txt"><span class="sr-label">${esc(def.label)}</span>${DESC[def.key] ? `<span class="sr-desc">${esc(DESC[def.key])}</span>` : ''}</div><button type="button" class="switch" role="switch" aria-checked="${on}" data-action="shadow-rule-toggle" data-rule="${def.key}" aria-label="${esc(def.label)}"></button></div>${on && ctrl ? `<div class="sr-ctrl">${ctrl}</div>` : ''}${on && extra ? `<div class="sr-extra">${extra}</div>` : ''}</div>`;
  }
  function rulesCard(res, r) {
    const setups = (S.data.tags && S.data.tags.setups) || [];
    const notes = res.warnings.map(w => U.banner('warn', '', esc(w)));
    /* Hinweis ohne aktive Regel steht unter den Schaltern: beim ersten Einschalten verschwindet er, ohne dass sich darüber etwas verschiebt */
    if (!res.active) notes.push(U.banner('info', 'Noch keine Regel aktiv', 'Schalte oben mindestens eine Regel ein – dann rechnet dein Schatten-Ich, was Regelbrüche kosten.', { icon: 'sparkle', trailing: `<button type="button" class="btn sm" data-action="shadow-preset">${I.bolt} Vorschlag übernehmen</button>` }));
    if (res.unknownRisk) notes.push(U.banner('info', '', `${res.unknownRisk === 1 ? '1 Trade ohne Stop konnte' : `${res.unknownRisk} Trades ohne Stop konnten`} bei der Risiko-Regel nicht geprüft werden.`));
    return U.card('Mein Regelwerk', `<div class="shadow-rules">${Sh.RULES.map(def => ruleRow(def, r[def.key], setups)).join('')}</div>${notes.length ? `<div class="stack shadow-notes">${notes.join('')}</div>` : ''}`, { info: 'Schalte ein, was für dich gilt. Dein Schatten-Ich hält sich daran – Änderungen gelten sofort.' });
  }

  /* ---------- Verstöße und Ranking ---------- */
  const SHOW = 25;
  function violationsTable(list, all) {
    if (!list.length) return U.empty('shield', 'Keine Verstöße', 'In diesem Zeitraum hast du dich an deine Regeln gehalten.');
    /* Nur bei der Risiko-Regel bleibt der Trade (verkleinert) im Schatten-Konto; sonst fällt er weg und sein Schatten-Ergebnis ist 0 */
    const row = v => { const taken = v.rule === 'maxRisk'; const costR = v.r == null ? {} : { r: taken ? v.r * (v.scale - 1) : -v.r }; return `<tr class="link" data-action="trade" data-id="${esc(v.tradeId)}"><td>${fmt.dateTime(v.date)}</td><td class="sym">${esc(v.symbol)}</td><td>${esc(v.label)}${v.others.length ? ` <span class="muted small" data-tip="${esc(v.others.map(k => LABEL[k] || k).join(', '))}">+ ${v.others.length} weitere</span>` : ''}</td><td class="r">${U.pnl(v.realPnl, '', { r: v.r })}</td><td class="r">${U.pnl(v.shadowPnl, '', { r: taken ? v.r : null })}</td><td class="r">${U.pnl(v.cost, '', costR)}</td></tr>`; };
    const rows = all ? list : list.slice(0, SHOW);
    return `<div class="tbl-wrap inset"><table class="tbl compact shadow-tbl"><thead><tr><th>Datum</th><th>Symbol</th><th>Regel</th><th class="r">Echt</th><th class="r">Schatten</th><th class="r">Kosten</th></tr></thead><tbody>${rows.map(row).join('')}</tbody></table></div>${list.length > SHOW ? `<div class="row shadow-more"><button type="button" class="btn sm" data-action="shadow-more">${all ? `${I.chev.replace('<svg', '<svg style="transform:rotate(180deg)"')} Weniger anzeigen` : `${I.chev} Alle ${list.length} anzeigen`}</button></div>` : ''}`;
  }
  function rankingRows(ranking) {
    if (!ranking.length) return U.empty('shield', 'Keine Regel aktiv', '');
    const max = Math.max(0, ...ranking.map(x => Math.abs(x.cost)));
    return `<div class="shadow-rank">${ranking.map(x => U.barRow(x.label, x.cost, max, `${U.pnl(-x.cost)} <span class="muted">· ${x.n}×</span>`, x.cost > C.EPS ? 'var(--loss)' : x.cost < -C.EPS ? 'var(--profit)' : 'var(--surface-3)')).join('')}</div>`;
  }

  /* ---------- Bildkarte (feste 1080×1080, Vorschau skaliert, Export über Certificate.toBlob) ---------- */
  const CARD = { w: 1080, h: 1080, s: 1 };
  /* Kartenfarben: Gewinn/Verlust/Akzent aus den Einstellungen (sonst Standard), Rest je Theme fest – auch als Werte für die Grafik, damit der Export ohne Stylesheet-Zugriff stimmt */
  const CARD_TOKENS = { dark: { bg: '#050706', muted: '#8b948f', line: '#262d29' }, light: { bg: '#fbfbfa', muted: '#6c766f', line: '#dfe4e0' } };
  function cardColors(theme) { const T = root.Theme, col = S.settings.colors || {}; const v = h => T && typeof T.valid === 'function' && T.valid(h) ? h : null; return Object.assign({ pos: v(col.profit) || '#34f58a', neg: v(col.loss) || '#ff5c5c', accent: v(col.accent) || '#34f58a' }, CARD_TOKENS[theme] || CARD_TOKENS.dark); }
  /* Zwei Linien als inline-SVG; Darstellung als Attribute, nicht per CSS-Klasse: html-to-image übernimmt sie so in jedem Fall in das PNG */
  function miniChart(curve, W, H, c) {
    const pts = [{ real: 0, shadow: 0 }].concat(curve); const vals = pts.flatMap(p => [p.real, p.shadow]); const lo = Math.min(...vals), hi = Math.max(...vals);
    const x = i => 8 + i / Math.max(1, pts.length - 1) * (W - 16), y = v => 10 + (hi - v) / (hi - lo || 1) * (H - 20);
    const path = k => 'M' + pts.map((p, i) => `${x(i).toFixed(1)},${y(p[k]).toFixed(1)}`).join('L'); const last = pts[pts.length - 1]; const lx = x(pts.length - 1).toFixed(1);
    const line = (k, col) => `<path d="${path(k)}" fill="none" stroke="${col}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>`;
    return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true"><line x1="8" x2="${W - 8}" y1="${y(0).toFixed(1)}" y2="${y(0).toFixed(1)}" stroke="${c.line}" stroke-width="2" stroke-dasharray="6 6"/>${line('real', c.muted)}${line('shadow', c.accent)}<circle cx="${lx}" cy="${y(last.real).toFixed(1)}" r="8" fill="${c.muted}"/><circle cx="${lx}" cy="${y(last.shadow).toFixed(1)}" r="8" fill="${c.accent}" stroke="${c.bg}" stroke-width="3"/></svg>`;
  }
  function cardHTML(pd, now) {
    const cv = costView(pd.sums.cost); const theme = S.settings.theme === 'light' ? 'light' : 'dark'; const c = cardColors(theme); const top = pd.ranking.find(x => x.n > 0 && x.cost > C.EPS) || null;
    const stat = (k, v, cls = '') => `<div class="st ${cls}"><div class="k">${k}</div><div class="v">${v}</div></div>`;
    return `<div class="shadow-card" data-theme="${theme}" style="width:${CARD.w}px;height:${CARD.h}px;--c-pos:${c.pos};--c-neg:${c.neg};--c-accent:${c.accent}">
      <div class="sc-glow"></div>
      <header class="sc-head"><div class="brand"><span class="mark">${I.logo}</span><span class="no-i18n">Journal<em>yst</em></span></div><span class="sc-tag">Schatten-Ich</span></header>
      <div class="sc-main">
        <div class="sc-title">Disziplin-Kosten</div>
        <div class="sc-period">${esc(pd.label)}</div>
        <div class="sc-value ${cv.cls}">${cv.text}</div>
        <div class="sc-sub">${esc(cv.foot)}</div>
        <div class="sc-chart">${miniChart(pd.curve, 896, 230, c)}</div>
        <div class="sc-legend"><span><i class="real"></i>Echt</span><span><i class="shadow"></i>Schatten-Ich</span></div>
        <div class="sc-stats">${stat('Echt', U.pnl(pd.sums.real))}${stat('Schatten-Ich', U.pnl(pd.sums.shadow))}${stat('Verstöße', `${pd.violations.length} <small>von ${pd.sums.n} Trades</small>`)}${stat('Teuerste Regel', top ? `${esc(top.label)} <small>${top.n}×</small>` : '—', 'rule')}</div>
      </div>
      <footer class="sc-foot"><span class="sc-brand">Journalyst</span><span>${fmt.dateFull(now)}</span></footer>
    </div>`;
  }
  const toBlob = card => root.Certificate.toBlob(card, CARD);
  const fileName = period => `schatten-ich-${period}-${C.dayKey(new Date())}.png`;
  async function exportPng(card, name) { const blob = await toBlob(card); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); }
  async function copyPng(card) { if (!navigator.clipboard || !root.ClipboardItem) throw new Error('clipboard'); const blob = await toBlob(card); await navigator.clipboard.write([new root.ClipboardItem({ 'image/png': blob })]); }
  async function sharePng(card, name) { const blob = await toBlob(card); const file = new File([blob], name, { type: 'image/png' }); if (!(navigator.canShare && navigator.canShare({ files: [file] }))) throw new Error('share'); await navigator.share({ files: [file], title: 'Disziplin-Kosten' }); }
  function openCard() {
    const all = App.allTrades(); const res = evaluate(all); const now = new Date(); const period = st().period; const pd = periodData(res, all, period, now); const name = fileName(period);
    if (!res.active || !pd.sums.n) { U.toast(res.active ? 'Keine abgeschlossenen Trades in diesem Zeitraum' : 'Schalte zuerst mindestens eine Regel ein', 'err'); return; }
    const mo = {
      cls: 'wide shadow-modal',
      onMount(el) {
        const preview = el.querySelector('#shadow-card-preview'); const sc = preview.querySelector('.shadow-card-scale'); let busy = false;
        const fit = () => { const availW = preview.clientWidth - 24; const availH = Math.max(240, Math.min(window.innerHeight * 0.62, 680)); const s = Math.min(availW / CARD.w, availH / CARD.h, 1); sc.style.transform = `scale(${s})`; sc.style.width = `${CARD.w * s}px`; sc.style.height = `${CARD.h * s}px`; };
        const run = async (btn, fn) => { if (busy) return; busy = true; const label = btn.innerHTML; btn.disabled = true; btn.innerHTML = 'Wird erstellt …'; try { await fn(); } catch (e) { U.toast(e && e.message === 'clipboard' ? 'Zwischenablage nicht verfügbar. Lade das PNG stattdessen herunter.' : e && e.message === 'share' ? 'Teilen wird hier nicht unterstützt.' : 'Export fehlgeschlagen. Bitte noch einmal versuchen.', 'err'); } finally { btn.disabled = false; btn.innerHTML = label; busy = false; } };
        el.addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (!b) return; const card = preview.querySelector('.shadow-card'); if (!card) return; const k = b.dataset.c; if (k === 'png') run(b, async () => { await exportPng(card, name); U.toast('PNG wird heruntergeladen', 'ok'); }); if (k === 'copy') run(b, async () => { await copyPng(card); U.toast('In die Zwischenablage kopiert', 'ok'); }); if (k === 'share') run(b, () => sharePng(card, name)); });
        requestAnimationFrame(fit); const ro = root.ResizeObserver ? new ResizeObserver(fit) : null; if (ro) ro.observe(preview); window.addEventListener('resize', fit);
        mo.onClose = () => { window.removeEventListener('resize', fit); if (ro) ro.disconnect(); };
      },
    };
    const canShare = !!(navigator.share && navigator.canShare);
    U.modal(`<div class="modal-head"><h2>Bildkarte</h2><button type="button" class="btn ghost icon" data-close aria-label="Schließen">${I.close}</button></div><div class="shadow-card-preview" id="shadow-card-preview"><div class="shadow-card-scale">${cardHTML(pd, now)}</div></div><div class="modal-foot"><span class="small muted left">PNG in doppelter Auflösung (${CARD.w * 2}×${CARD.h * 2}).</span>${canShare ? `<button type="button" class="btn" data-c="share">${I.external} Teilen</button>` : ''}<button type="button" class="btn" data-c="copy">${I.copy} Kopieren</button><button type="button" class="btn primary" data-c="png">${I.download} PNG herunterladen</button></div>`, mo);
  }

  /* ---------- Aktionen ---------- */
  Object.assign(App.actions, {
    'shadow-period'(el) { st().period = PERIODS.some(x => x[0] === el.dataset.value) ? el.dataset.value : 'month'; App.rerender(); },
    'shadow-card'() { openCard(); },
    'shadow-more'() { st().all = !st().all; App.rerender(); },
    'shadow-rule-toggle'(el) { const r = rules(); const k = el.dataset.rule; if (!r[k]) return; r[k].on = !r[k].on; saveRules(r); },
    'shadow-rule-field'(el) { const r = rules(); const k = el.dataset.rule, f = el.dataset.field; const def = Sh.RULES.find(x => x.key === k); const fd = def && def.fields.find(x => x.key === f); if (!fd || !r[k]) return; let v = el.value; if (fd.type === 'int' || fd.type === 'number') { v = String(v).trim() === '' ? '' : Number(String(v).replace(',', '.')); if (v !== '' && !isFinite(v)) return; if (fd.type === 'int' && v !== '') v = Math.floor(v); } r[k][f] = v; saveRules(r); },
    'shadow-setup-toggle'(el) { const r = rules(); const list = Array.isArray(r.setups.list) ? r.setups.list.slice() : []; const v = el.dataset.value; const i = list.indexOf(v); if (i >= 0) list.splice(i, 1); else list.push(v); r.setups.list = list; saveRules(r); },
    /* Einstieg: drei Regeln mit Standardwerten einschalten, die ohne R-Einheit oder Setups auskommen */
    'shadow-preset'() { const r = rules(); for (const k of ['maxTrades', 'lossStreak', 'cooldown']) r[k].on = true; saveRules(r); U.toast('Drei Regeln eingeschaltet', 'ok'); },
  });

  /* ---------- Seite ---------- */
  App.screens.shadow = {
    title: 'Schatten-Ich',
    mount(main) { /* Enter in einem Zahlenfeld übernimmt den Wert sofort (change feuert erst beim Verlassen) */ main.querySelectorAll('.shadow-rule input').forEach(inp => inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); inp.blur(); } })); },
    render(ctx) {
      const s = st(); const now = new Date(); const all = ctx.all; const closed = C.closedOnly(all); const r = rules(); const res = evaluate(all); const pd = periodData(res, all, s.period, now);
      const ready = res.active && closed.length > 0;
      const head = `<div class="shadow-head"><div class="shadow-intro"><b>Dein Schatten-Ich handelt wie du – nur ohne Regelbrüche.</b><span class="small muted">Was die Abweichung kostet, siehst du hier.</span></div><div class="row shadow-ctl">${U.seg(PERIODS, s.period, 'shadow-period')}<button type="button" class="btn" data-action="shadow-card" ${ready ? '' : 'disabled'}>${I.image}<span>Bildkarte</span></button></div></div>`;
      if (!closed.length) return head + U.empty('stats', 'Noch keine abgeschlossenen Trades', 'Sobald Trades geschlossen sind, zeigt dir dein Schatten-Ich, was Regelbrüche kosten.', `<button type="button" class="btn sm" data-action="new-trade">${I.plus} Trade loggen</button>`) + rulesCard(res, r);
      const cv = res.active ? costView(pd.sums.cost) : null; const p = pd.sums;
      const tiles = `<div class="grid tiles shadow-tiles">
        <div class="tile shadow-main"><div class="head"><span>Disziplin-Kosten${U.info('Schatten-Ich minus echt: Was Regelbrüche im Zeitraum unterm Strich bewirkt haben.')}</span><span class="n">${esc(periodName(s.period))}</span></div><div class="body"><div><div class="val ${cv ? cv.cls : ''}">${cv ? cv.text : '—'}</div><div class="foot">${cv ? cv.foot : 'Keine Regel aktiv'}</div></div></div></div>
        ${U.tile('Echt', res.active ? U.pnl(p.real) : '—', { n: `${p.n} Trade${p.n === 1 ? '' : 's'}` })}
        ${U.tile('Schatten-Ich', res.active ? U.pnl(p.shadow) : '—', { foot: 'Mit allen Regeln eingehalten' })}
        ${U.tile('Verstöße', res.active ? String(pd.violations.length) : '—', { foot: res.active && p.n ? `${fmt.pct(pd.violations.length / p.n)} der Trades` : '' })}
      </div>`;
      U.chartData['shadow-curve'] = { points: res.curve.map(pt => ({ date: pt.date, v: { real: pt.real, shadow: pt.shadow } })), series: [{ key: 'real', label: 'Echt', unit: 'cur', color: 'var(--text-2)' }, { key: 'shadow', label: 'Schatten-Ich', unit: 'cur', color: 'var(--accent)' }], periodLabel: d => fmt.dateTime(d) };
      const chart = U.card('Equity: echt vs. Schatten-Ich', `<div class="legend top"><span><i style="background:var(--text-2)"></i>Echt</span><span><i style="background:var(--accent)"></i>Schatten-Ich</span></div><div class="chart h300" data-chart="lines" data-id="shadow-curve"></div>`, { info: 'Kumuliert über alle abgeschlossenen Trades. Die Schatten-Linie lässt Trades mit Regelbruch weg und verkleinert zu große Risiken.' });

      const detail = res.active ? `<div class="grid shadow-detail start">${U.card('Regelverstöße', violationsTable(pd.violations, s.all), { sub: esc(pd.label), info: 'Die erste verletzte Regel zählt als Grund. Klick auf eine Zeile öffnet den Trade.' })}${U.card('Welche Regel kostet am meisten', rankingRows(pd.ranking), { sub: 'Netto-Effekt der Verstöße auf dein Konto' })}</div>` : '';
      return head + tiles + chart + rulesCard(res, r) + detail;
    },
  };
  /* Für die Dashboard-Widgets: dieselbe Rechnung wie auf der Seite (Regelwerk, Konto, R-Einheit) */
  root.ShadowScreen = { rules, evaluate, costView };
})(typeof self !== 'undefined' ? self : this);
