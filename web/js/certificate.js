/* Zertifikat-Karten: Menü, Modal mit Vorschau und Optionen, Karte in fester Pixelgröße, Export als PNG */
(function (root) {
  'use strict';
  const C = root.Core, S = root.Store, U = root.UI, I = U.I, esc = U.esc, fmt = U.fmt, App = root.App, D = root.CertData;
  const FORMATS = { square: { w: 1080, h: 1080, label: 'Quadrat', s: 1 }, story: { w: 1080, h: 1920, label: 'Story', s: 1.12 }, wide: { w: 1200, h: 675, label: 'Querformat', s: 0.66 } };
  const opts = () => App.state.cert || (App.state.cert = { theme: 'app', format: 'square', hide: false, user: true });

  /* ---------- Hilfen ---------- */
  function username() { const pr = S.settings.profile || {}; if (pr.username) return '@' + pr.username.replace(/^@/, ''); const n = (S.settings.name || '').trim(); return n && n !== 'Trader' ? n : ''; }
  function colors(theme) { const col = S.settings.colors || {}; const defs = root.Theme.DEFAULTS[theme] || root.Theme.DEFAULTS.dark; const v = h => root.Theme.valid(h) ? (theme === 'light' ? root.Theme.shade(h, -0.2) : h) : null; return { pos: v(col.profit) || defs.profit, neg: v(col.loss) || defs.loss }; }
  const pfText = v => v == null ? null : v === Infinity ? '∞' : fmt.num(v, 2);

  /* ---------- Karte ----------
     Bewusst reduziert: Titel, für wen, Ergebnis, Zeitraum, drei Kennzahlen, Unterschriften. Ein Design im Look der App:
     warmes Graphit, Ergebnis als grüne (bei Verlust rote) Pille wie ein aktiver Reiter, Kennzahlen als Kachelstreifen,
     feiner Kartenrahmen und unten über der Fußlinie eine weiche Kurslinie (bei Verlust fallend).
     Aufteilung je Format über Grid-Bereiche in css/app.css (Block „Zertifikat“). */
  /* Kurslinie: weiche Kurve durch feste Punkte (Catmull-Rom als Bézier), Fläche darunter läuft nach unten aus, leuchtender Endpunkt.
     Sie liegt im freien Streifen zwischen Kennzahlen und Fußlinie (Grid-Zeile 6), nichts verdeckt sie; bei Verlust gespiegelt (fallend). */
  const PTS = [[0, 250], [90, 240], [170, 246], [260, 216], [350, 222], [440, 188], [530, 194], [620, 152], [710, 160], [800, 116], [890, 104], [1000, 40]];
  const CURVE_D = PTS.map((q, i) => { if (!i) return `M${q[0]} ${q[1]}`; const a = PTS[i - 2] || PTS[i - 1], b = PTS[i - 1], d = PTS[i + 1] || q; const r = v => Math.round(v * 10) / 10; return `C${r(b[0] + (q[0] - a[0]) / 6)} ${r(b[1] + (q[1] - a[1]) / 6)} ${r(q[0] - (d[0] - b[0]) / 6)} ${r(q[1] - (d[1] - b[1]) / 6)} ${q[0]} ${q[1]}`; }).join(' ');
  const CURVE = `<div class="cert-chart" aria-hidden="true"><svg class="cert-curve" viewBox="0 0 1000 300" preserveAspectRatio="none"><defs><linearGradient id="cert-cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity=".2"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs><path d="${CURVE_D} L1000 300 L0 300 Z" fill="url(#cert-cg)"/><path class="l" d="${CURVE_D}" fill="none"/></svg><i class="end"></i></div>`;
  const KIND_SUB = { day: 'of Daily Profit', week: 'of Weekly Profit', month: 'of Monthly Profit', stats: 'of Performance' };
  function cardHTML(m, p, o) {
    if (fmt.moneyBlind()) o = Object.assign({}, o, { hide: true });
    const f = FORMATS[o.format]; const sign = m.pnl < 0 ? 'neg' : 'pos'; const c = colors('dark'); const issued = new Date(); const no = D.certNo(m.kind, p, m, issued);
    const main = o.hide ? (o.account > 0 ? fmt.pct(m.pnl / o.account, 2, true) : m.rSum != null ? fmt.r(m.rSum) : '—') : fmt.cur(m.pnl, { signed: true });
    const stat = (k, v) => v == null || v === '' ? '' : `<div class="st"><div class="v">${v}</div><div class="k">${k}</div></div>`;
    const wr = stat('Win rate', fmt.pct(m.winRate, 0)), rr = stat('Avg RR', m.avgR != null ? fmt.r(m.avgR) : null);
    const stats = m.kind === 'day' ? stat(m.n === 1 ? 'Trade' : 'Trades', fmt.int(m.n)) + wr + rr
      : m.kind === 'week' ? stat(m.tradingDays === 1 ? 'Trading day' : 'Trading days', fmt.int(m.tradingDays)) + wr + rr
      : m.kind === 'month' ? stat('Green days', `${fmt.int(m.greenDays)}<small> / ${fmt.int(m.greenDays + m.redDays)}</small>`) + wr + stat('Profit factor', pfText(m.pf))
      : wr + stat('Profit factor', pfText(m.pf)) + stat('Trades', fmt.int(m.n));
    const user = o.user ? username() : '';
    const len = String(main).replace(/<[^>]*>/g, '').length;
    return `<div class="cert" data-theme="app" data-format="${o.format}" data-kind="${m.kind}" data-sign="${sign}" style="width:${f.w}px;height:${f.h}px;--s:${f.s};--c-pos:${c.pos};--c-neg:${c.neg}">
      <div class="cert-bg" aria-hidden="true"><i class="glow-warm"></i><i class="glow-acc"></i><i class="cert-frame"></i></div>
      <div class="cert-in">${CURVE}
        <div class="cert-brand"><span class="name">Journal<em>yst</em></span><span class="tag">Trading Journal App</span></div>
        <h1 class="cert-title"><span class="ct-big">Certificate</span><span class="ct-sub">${KIND_SUB[m.kind]}</span></h1>
        <div class="cert-to">${user ? `<span class="k">Presented to</span> <span class="user">${esc(user)}</span>` : '<span class="k">Net result</span>'}</div>
        <div class="cert-hero"><div class="cert-value${len > 10 ? ' long' : ''}"><span>${main}</span></div><div class="cert-period">${esc(p.label)}</div></div>
        <div class="cert-stats">${stats}</div>
        <footer class="cert-foot">
          <div class="issue"><div class="v">Journalyst</div><div class="line"></div><div class="k">Issued by</div></div>
          <div class="issue"><div class="v mono">${no}</div><div class="line"></div><div class="k">Issued ${fmt.dateFull(issued)}</div></div>
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
    const o = opts(); o.theme = 'app';
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
            <div class="field"><span class="lbl">Format</span>${seg('format', Object.entries(FORMATS).map(([k, v]) => [k, `${v.label} <small class="muted">${v.w}×${v.h}</small>`]))}</div>
            <div class="stack" style="gap:8px">${toggle('hide', 'Beträge ausblenden (nur % bzw. R)')}${toggle('user', 'Username anzeigen')}</div>`;
          foot.innerHTML = `<span class="small muted left">PNG in doppelter Auflösung (${f.w * 2}×${f.h * 2}).</span>${canShare() ? `<button type="button" class="btn" data-c="share" ${empty ? 'disabled' : ''}>${I.external} Teilen</button>` : ''}<button type="button" class="btn" data-c="copy" ${empty ? 'disabled' : ''}>${I.copy} Kopieren</button><button type="button" class="btn primary" data-c="png" ${empty ? 'disabled' : ''}>${I.download} PNG herunterladen</button>`;
          requestAnimationFrame(fit);
        };
        const busy = async (btn, fn) => { if (state.busy) return; state.busy = true; const label = btn.innerHTML; btn.disabled = true; btn.innerHTML = `${U.spin()} Wird erstellt …`; try { await fn(); } catch (e) { U.toast(e && e.message === 'clipboard' ? 'Zwischenablage nicht verfügbar. Lade das PNG stattdessen herunter.' : e && e.message === 'share' ? 'Teilen wird hier nicht unterstützt.' : 'Export fehlgeschlagen. Bitte noch einmal versuchen.', 'err'); } finally { btn.disabled = false; btn.innerHTML = label; state.busy = false; } };
        el.addEventListener('click', e => {
          const b = e.target.closest('[data-c]'); if (!b || b.tagName === 'INPUT' || b.tagName === 'SELECT') return; const k = b.dataset.c;
          if (k === 'format') { o[k] = b.dataset.v; render(); return; }
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
