/* Zertifikat-Karten: Menü, Modal mit Vorschau und Optionen, Karte in fester Pixelgröße, Export als PNG */
(function (root) {
  'use strict';
  const C = root.Core, S = root.Store, U = root.UI, I = U.I, esc = U.esc, fmt = U.fmt, App = root.App, D = root.CertData;
  const FORMATS = { square: { w: 1080, h: 1080, label: 'Quadrat', s: 1 }, story: { w: 1080, h: 1920, label: 'Story', s: 1.12 }, wide: { w: 1200, h: 675, label: 'Querformat', s: 0.66 } };
  const opts = () => App.state.cert || (App.state.cert = { theme: null, format: 'square', hide: false, user: true });

  /* ---------- Hilfen ---------- */
  function username() { const pr = S.settings.profile || {}; if (pr.username) return '@' + pr.username.replace(/^@/, ''); const n = (S.settings.name || '').trim(); return n && n !== 'Trader' ? n : ''; }
  function colors(theme) { const col = S.settings.colors || {}; const defs = root.Theme.DEFAULTS[theme] || root.Theme.DEFAULTS.dark; const v = h => root.Theme.valid(h) ? (theme === 'light' ? root.Theme.shade(h, -0.2) : h) : null; return { pos: v(col.profit) || defs.profit, neg: v(col.loss) || defs.loss }; }
  function guilloche(w, h) {
    const cx = w / 2, cy = h * 0.42; let s = '';
    for (let i = 0; i < 18; i++) s += `<ellipse cx="${cx}" cy="${cy}" rx="${w * 0.46}" ry="${h * 0.16}" transform="rotate(${i * 10} ${cx} ${cy})"/>`;
    for (let i = 0; i < 12; i++) s += `<ellipse cx="${cx}" cy="${cy}" rx="${w * 0.3}" ry="${h * 0.3}" transform="rotate(${i * 15} ${cx} ${cy})"/>`;
    return `<svg class="cert-bg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="0.7">${s}</g></svg>`;
  }
  const money = (v, o) => o.hide ? (o.account > 0 ? fmt.pct(v / o.account, 2, true) : null) : fmt.cur(v, { signed: true });
  const pfText = v => v == null ? null : v === Infinity ? '∞' : fmt.num(v, 2);

  /* ---------- Karte ---------- */
  function cardHTML(m, p, o) {
    if (fmt.moneyBlind()) o = Object.assign({}, o, { hide: true });
    const f = FORMATS[o.format]; const sign = m.pnl < 0 ? 'neg' : 'pos'; const c = colors(o.theme); const issued = new Date(); const no = D.certNo(m.kind, p, m, issued);
    const main = o.hide ? (o.account > 0 ? fmt.pct(m.pnl / o.account, 2, true) : m.rSum != null ? fmt.r(m.rSum) : '—') : fmt.cur(m.pnl, { signed: true });
    const stat = (k, v) => v == null || v === '' ? '' : `<div class="st"><div class="k">${k}</div><div class="v">${v}</div></div>`;
    const dayLabel = d => d ? new Date(C.parseDayKey(d.key)).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }) : null;
    const dayVal = d => { if (!d) return null; const v = money(d.pnl, o); return v == null ? null : `${v} <small>${dayLabel(d)}</small>`; };
    let viz = '', stats = '', extra = '', cols = 4;
    if (m.kind === 'day') {
      /* Best trade ist ein einzelner Trade: im Geld-blind-Modus sein exaktes R, ohne Stop „– R“; bei manuell ausgeblendeten Beträgen wie bisher R oder Prozent vom Konto */
      const bt = m.bestTrade ? (fmt.moneyBlind() ? fmt.cur(m.bestTrade.pnl, { signed: true, r: m.bestTrade.r }) : o.hide ? (m.bestTrade.r != null ? fmt.r(m.bestTrade.r) : money(m.bestTrade.pnl, o)) : fmt.cur(m.bestTrade.pnl, { signed: true })) : null;
      stats = stat('Trades', fmt.int(m.n)) + stat('Win rate', fmt.pct(m.winRate, 0)) + stat('Avg RR', m.avgR != null ? fmt.r(m.avgR) : null) + stat('Best trade', bt ? `${bt} <small>${esc(m.bestTrade.symbol)}</small>` : null);
      if (m.symbols.length) extra = `<div class="cert-syms">${m.symbols.slice(0, 8).map(x => `<span>${esc(x)}</span>`).join('')}${m.symbols.length > 8 ? `<span>+${m.symbols.length - 8}</span>` : ''}</div>`;
    } else if (m.kind === 'week') {
      const max = Math.max(1, ...m.weekBars.map(b => Math.abs(b.pnl || 0))); const H = 150;
      viz = `<div class="cert-week">${m.weekBars.map(b => { const v = b.pnl; const h = v == null ? 0 : Math.max(6, Math.abs(v) / max * (H / 2 - 4)); const top = v == null ? H / 2 : v >= 0 ? H / 2 - h : H / 2; return `<div class="wb"><div class="col" style="height:${H}px"><i class="${v == null ? 'none' : v >= 0 ? 'pos' : 'neg'}" style="top:${top}px;height:${v == null ? 2 : h}px"></i><em style="top:${H / 2}px"></em></div><span>${esc(b.label)}</span></div>`; }).join('')}</div>`;
      stats = stat('Trading days', fmt.int(m.tradingDays)) + stat('Win rate', fmt.pct(m.winRate, 0)) + stat('Avg RR', m.avgR != null ? fmt.r(m.avgR) : null) + stat('Best day', dayVal(m.bestDay));
    } else if (m.kind === 'month') {
      const max = Math.max(1, ...m.monthCells.filter(Boolean).map(x => Math.abs(x.pnl || 0)));
      viz = `<div class="cert-month"><div class="wd">${['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(x => `<span>${x}</span>`).join('')}</div><div class="cells">${m.monthCells.map(x => { if (!x) return '<i class="pad"></i>'; if (x.pnl == null) return `<i class="none"><b>${x.day}</b></i>`; const a = 0.35 + 0.65 * Math.abs(x.pnl) / max; return `<i class="${x.pnl >= 0 ? 'pos' : 'neg'}" style="--a:${a.toFixed(2)}"><b>${x.day}</b></i>`; }).join('')}</div></div>`;
      stats = stat('Green / red days', `<span class="pos">${m.greenDays}</span> <small>/</small> <span class="neg">${m.redDays}</span>`) + stat('Win rate', fmt.pct(m.winRate, 0)) + stat('Profit factor', pfText(m.pf)) + stat('Avg RR', m.avgR != null ? fmt.r(m.avgR) : null);
    } else {
      cols = 3;
      const aw = m.avgWin != null ? money(m.avgWin, o) : null, al = m.avgLoss != null ? money(m.avgLoss, o) : null;
      stats = stat('Win rate', fmt.pct(m.winRate, 0)) + stat('Avg RR', m.avgR != null ? fmt.r(m.avgR) : null) + stat('Profit factor', pfText(m.pf)) + stat('Avg win / loss', aw || al ? `<span class="pos">${aw || '—'}</span> <small>/</small> <span class="neg">${al || '—'}</span>` : null) + stat('Trades', fmt.int(m.n)) + stat('Max drawdown', m.maxDD != null && (o.account > 0 || !o.hide) ? (o.hide ? fmt.pct(-m.maxDD / o.account, 2) : fmt.cur(-m.maxDD, { signed: true })) : null) + stat('Best day', dayVal(m.bestDay)) + stat('Worst day', dayVal(m.worstDay)) + stat('Win streak', m.maxWinStreak ? `${m.maxWinStreak} <small>trades</small>` : null);
    }
    const user = o.user ? username() : '';
    return `<div class="cert" data-theme="${o.theme}" data-format="${o.format}" data-sign="${sign}" style="width:${f.w}px;height:${f.h}px;--s:${f.s};--c-pos:${c.pos};--c-neg:${c.neg};--c-accent:${sign === 'neg' ? c.neg : c.pos};--cols:${cols}">
      ${guilloche(f.w, f.h)}<div class="frame"></div>
      <div class="cert-in">
        <header class="cert-head"><div class="brand"><span class="mark">${I.logo}</span><span>Journal<em>yst</em></span></div>${user ? `<span class="user">${esc(user)}</span>` : ''}</header>
        <div class="cert-main">
          <div class="cert-title">${D.KINDS[m.kind].title}</div>
          <div class="cert-period">${esc(p.label)}</div>
          <div class="cert-value">${main}</div>
          <div class="cert-sub">Net P&amp;L · ${fmt.int(m.n)} ${m.n === 1 ? 'trade' : 'trades'}${m.kind !== 'day' && m.tradingDays ? ` · ${fmt.int(m.tradingDays)} ${m.tradingDays === 1 ? 'trading day' : 'trading days'}` : ''}</div>
          ${viz ? `<div class="cert-viz">${viz}</div>` : ''}
          ${stats ? `<div class="cert-stats">${stats}</div>` : ''}${extra}
        </div>
        <footer class="cert-foot">
          <div class="seal">${I.check}</div>
          <div class="issue"><div class="k">Issued by</div><div class="v">Journalyst</div></div>
          <div class="issue"><div class="k">Certificate No.</div><div class="v mono">${no}</div></div>
          <div class="issue"><div class="k">Issued on</div><div class="v">${fmt.dateFull(issued)}</div></div>
          <div class="sig"><div class="line"></div><div class="k">Signature</div></div>
        </footer>
      </div></div>`;
  }

  /* ---------- Export ---------- */
  async function toBlob(card, f) {
    if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch (e) { /* ohne Font-API */ } }
    const o = { pixelRatio: 2, width: f.w, height: f.h, cacheBust: false };
    try { return await root.htmlToImage.toBlob(card, o); } catch (e) { return await root.htmlToImage.toBlob(card, Object.assign({ skipFonts: true }, o)); }
  }
  const fileName = (m, p) => `zertifikat-${m.kind}-${String(p.short).replace(/[^\w.-]+/g, '_').replace(/_+$/, '')}.png`;
  async function exportPng(card, f, name) { const blob = await toBlob(card, f); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); }
  async function copyPng(card, f) { if (!navigator.clipboard || !root.ClipboardItem) throw new Error('clipboard'); const blob = await toBlob(card, f); await navigator.clipboard.write([new root.ClipboardItem({ 'image/png': blob })]); }
  async function sharePng(card, f, name, title) { const blob = await toBlob(card, f); const file = new File([blob], name, { type: 'image/png' }); if (!(navigator.canShare && navigator.canShare({ files: [file] }))) throw new Error('share'); await navigator.share({ files: [file], title }); }
  const canShare = () => !!(navigator.share && navigator.canShare);

  /* ---------- Menü und Modal ---------- */
  function menuHTML(ctx) {
    const day = (ctx && ctx.day) || C.dayKey(new Date());
    return [['day', 'Tag', day], ['week', 'Woche', day], ['month', 'Monat', D.monthKey(C.parseDayKey(day))], ['stats', 'Stats', 'range']].map(([k, l, ref]) => `<button type="button" class="item" data-action="cert-open" data-kind="${k}" data-ref="${ref}">${D.KINDS[k].title.replace(' Certificate', '')}<span class="muted small" style="margin-left:auto">${l}</span></button>`).join('');
  }
  function resolveRef(kind, ref) { if (ref === 'range' || ref == null || ref === '') { if (kind !== 'stats') return D.defaultRef(kind); const r = App.range(); return r.from ? { from: r.from, to: r.to } : null; } return ref; }

  function open(kind, ref) {
    const o = opts(); if (!o.theme) o.theme = S.settings.theme === 'light' ? 'light' : 'dark';
    const state = { kind, ref: resolveRef(kind, ref), busy: false };
    const mo = {
      cls: 'wide cert-modal',
      onMount(el) {
        const preview = el.querySelector('#cert-preview'), side = el.querySelector('#cert-opts'), foot = el.querySelector('#cert-foot');
        let cur = null;
        const fit = () => { const sc = preview.querySelector('.cert-scale'); if (!sc || !cur) return; const f = FORMATS[o.format]; const availW = preview.clientWidth - 24; const availH = Math.max(260, Math.min(window.innerHeight * 0.66, 720)); const s = Math.min(availW / f.w, availH / f.h, 1); sc.style.transform = `scale(${s})`; sc.style.width = `${f.w * s}px`; sc.style.height = `${f.h * s}px`; };
        const seg = (key, items) => `<div class="seg sm">${items.map(([v, l]) => `<button type="button" data-c="${key}" data-v="${v}" aria-pressed="${String(o[key]) === String(v)}">${l}</button>`).join('')}</div>`;
        const toggle = (key, label) => { const forced = key === 'hide' && fmt.moneyBlind(); return `<label class="check"><input type="checkbox" data-c="${key}" ${o[key] || forced ? 'checked' : ''} ${forced ? 'disabled' : ''}> ${label}${forced ? ' <small class="muted">(Geld-blind-Modus)</small>' : ''}</label>`; };
        const periodInput = p => {
          if (kind === 'day') return `<input class="input" type="date" data-c="ref" value="${state.ref}" aria-label="Tag">`;
          if (kind === 'week') { const from = p.from; const wk = `${from.getFullYear()}-W${String(C.isoWeek(from)).padStart(2, '0')}`; return `<input class="input" type="week" data-c="ref" value="${wk}" aria-label="Woche">`; }
          if (kind === 'month') return `<input class="input" type="month" data-c="ref" value="${state.ref}" aria-label="Monat">`;
          const r = App.range(); return `<select class="select" data-c="ref" aria-label="Zeitraum"><option value="all" ${state.ref ? '' : 'selected'}>Gesamter Zeitraum</option>${r.from ? `<option value="range" ${state.ref ? 'selected' : ''}>${esc(r.label)}</option>` : ''}</select>`;
        };
        const render = () => {
          const p = D.period(kind, state.ref); const all = App.allTrades(); const list = D.select(all, p); const m = D.compute(kind, list, p); const f = FORMATS[o.format]; const ex = Object.assign({}, o, { account: App.account() }); cur = { p, m, f };
          const empty = !list.length;
          preview.innerHTML = empty ? `<div class="cert-empty">${U.empty('stats', 'Keine Trades in diesem Zeitraum', 'Wähle einen anderen Zeitraum, um ein Zertifikat zu erstellen.')}</div>` : `<div class="cert-scale">${cardHTML(m, p, ex)}</div>`;
          side.innerHTML = `<div class="field"><span class="lbl">Zeitraum</span><div class="row" style="gap:6px;flex-wrap:nowrap">${kind !== 'stats' ? `<button type="button" class="btn round sm" data-c="prev" aria-label="Zurück">${I.chevL}</button>` : ''}${periodInput(p)}${kind !== 'stats' ? `<button type="button" class="btn round sm" data-c="next" aria-label="Weiter">${I.chevR}</button>` : ''}</div><div class="small muted" style="margin-top:6px">${esc(p.label)}${empty ? '' : ` · ${fmt.int(m.n)} Trades`}</div></div>
            <div class="field"><span class="lbl">Theme</span>${seg('theme', [['dark', 'Dunkel'], ['light', 'Hell']])}</div>
            <div class="field"><span class="lbl">Format</span>${seg('format', Object.entries(FORMATS).map(([k, v]) => [k, `${v.label} <small class="muted">${v.w}×${v.h}</small>`]))}</div>
            <div class="stack" style="gap:8px">${toggle('hide', 'Beträge ausblenden (nur % bzw. R)')}${toggle('user', 'Username anzeigen')}</div>`;
          foot.innerHTML = `<span class="small muted left">PNG in doppelter Auflösung (${f.w * 2}×${f.h * 2}).</span>${canShare() ? `<button type="button" class="btn" data-c="share" ${empty ? 'disabled' : ''}>${I.external} Teilen</button>` : ''}<button type="button" class="btn" data-c="copy" ${empty ? 'disabled' : ''}>${I.copy} Kopieren</button><button type="button" class="btn primary" data-c="png" ${empty ? 'disabled' : ''}>${I.download} PNG herunterladen</button>`;
          requestAnimationFrame(fit);
        };
        const busy = async (btn, fn) => { if (state.busy) return; state.busy = true; const label = btn.innerHTML; btn.disabled = true; btn.innerHTML = 'Wird erstellt …'; try { await fn(); } catch (e) { U.toast(e && e.message === 'clipboard' ? 'Zwischenablage nicht verfügbar. Lade das PNG stattdessen herunter.' : e && e.message === 'share' ? 'Teilen wird hier nicht unterstützt.' : 'Export fehlgeschlagen. Bitte noch einmal versuchen.', 'err'); } finally { btn.disabled = false; btn.innerHTML = label; state.busy = false; } };
        el.addEventListener('click', e => {
          const b = e.target.closest('[data-c]'); if (!b || b.tagName === 'INPUT' || b.tagName === 'SELECT') return; const k = b.dataset.c;
          if (k === 'theme' || k === 'format') { o[k] = b.dataset.v; render(); return; }
          if (k === 'prev' || k === 'next') { state.ref = D.shift(kind, state.ref, k === 'next' ? 1 : -1); render(); return; }
          const card = preview.querySelector('.cert'); if (!card || !cur) return; const name = fileName(cur.m, cur.p);
          if (k === 'png') busy(b, async () => { await exportPng(card, cur.f, name); U.toast('PNG wird heruntergeladen', 'ok'); });
          if (k === 'copy') busy(b, async () => { await copyPng(card, cur.f); U.toast('In die Zwischenablage kopiert', 'ok'); });
          if (k === 'share') busy(b, () => sharePng(card, cur.f, name, D.KINDS[kind].title));
        });
        el.addEventListener('change', e => {
          const inp = e.target.closest('[data-c]'); if (!inp) return; const k = inp.dataset.c;
          if (k === 'hide' || k === 'user') { o[k] = inp.checked; render(); return; }
          if (k !== 'ref') return; const v = inp.value; if (!v) return;
          if (kind === 'day') state.ref = v; else if (kind === 'month') state.ref = v; else if (kind === 'week') { const mt = /^(\d{4})-W(\d{2})$/.exec(v); if (mt) { const jan4 = new Date(Number(mt[1]), 0, 4); const start = C.weekStart(jan4); start.setDate(start.getDate() + (Number(mt[2]) - 1) * 7); state.ref = C.dayKey(start); } } else { const r = App.range(); state.ref = v === 'range' && r.from ? { from: r.from, to: r.to } : null; }
          render();
        });
        render();
        const ro = root.ResizeObserver ? new ResizeObserver(fit) : null; if (ro) ro.observe(preview); window.addEventListener('resize', fit);
        mo.onClose = () => { window.removeEventListener('resize', fit); if (ro) ro.disconnect(); };
      },
    };
    U.modal(`<div class="modal-head"><h2>Zertifikat erstellen</h2><button type="button" class="btn ghost icon" data-close aria-label="Schließen">${I.close}</button></div><div class="cert-body"><div class="cert-preview" id="cert-preview"></div><aside class="cert-opts" id="cert-opts"></aside></div><div class="modal-foot" id="cert-foot"></div>`, mo);
  }
  Object.assign(App.actions, { 'cert-open'(el) { open(el.dataset.kind, el.dataset.ref); } });
  root.Certificate = { FORMATS, menuHTML, open, cardHTML, toBlob, fileName };
})(typeof self !== 'undefined' ? self : this);
