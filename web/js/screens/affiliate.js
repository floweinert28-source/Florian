/* Affiliate: eigener Bereich in der Gruppe Konten, zwei Ansichten.
   „Alle Creator“ (#/affiliate) für den Betreiber: Kennzahlen, Tabelle je Creator (Kunden, Umsatz, Provision, verdient, offen), Provisionen je Monat.
   „Creator-Ansicht“ (#/affiliate/creator) für einen Creator: eigener Link und Code zum Kopieren, Verdienst, Kunden je Monat und letzte Kunden.
   Nur Oberfläche mit Beispieldaten aus js/affiliatedata.js; die Provision in Prozent je Creator lässt sich anpassen (settings.affiliate.pct).
   Provision = Umsatz × Prozent. Offen = Provisionen des laufenden Monats, frühere Monate gelten als ausgezahlt. */
(function (root) {
  'use strict';
  const S = root.Store, U = root.UI, I = U.I, esc = U.esc, fmt = U.fmt, App = root.App, AD = root.AffiliateData;
  const MONTHS = 8, PAGE = 10;
  const st = { limit: PAGE };

  let cache = null;
  const data = () => { const k = new Date().toDateString(); if (!cache || cache.k !== k) cache = { k, d: AD.build(new Date()) }; return cache.d; };
  const conf = () => { const a = S.settings.affiliate; return a && typeof a === 'object' ? a : (S.settings.affiliate = { pct: {}, creatorId: '' }); };
  const pctOf = c => { const p = Number((conf().pct || {})[c.id]); return isFinite(p) && p >= 0 && p <= 100 ? p : c.pct; };
  const money = v => fmt.cur(v, { money: true, currency: AD.CURRENCY });
  const pctText = p => fmt.pct(p / 100, p % 1 ? 1 : 0);
  const monthKey = d => d.slice(0, 7);
  const thisMonth = () => { const t = new Date(); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}`; };
  const loc = () => (root.I18N ? root.I18N.locale() : 'de-DE');

  /* Kennzahlen eines Creators (oder aller, wenn creator fehlt) */
  function sums(d, creator) {
    const cur = thisMonth(); const byId = Object.fromEntries(d.creators.map(c => [c.id, c]));
    const list = creator ? d.customers.filter(k => k.creatorId === creator.id) : d.customers;
    let revenue = 0, earned = 0, open = 0, link = 0;
    for (const k of list) { const fee = k.amount * pctOf(byId[k.creatorId]) / 100; revenue += k.amount; earned += fee; if (monthKey(k.date) === cur) open += fee; if (k.via === 'link') link++; }
    return { list, n: list.length, revenue, earned, open, link, code: list.length - link };
  }
  /* Provisionen der letzten Monate für das Balkendiagramm */
  function months(d, list) {
    const byId = Object.fromEntries(d.creators.map(c => [c.id, c])); const t = new Date(); const out = [];
    for (let m = MONTHS - 1; m >= 0; m--) { const dt = new Date(t.getFullYear(), t.getMonth() - m, 1); const k = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`; out.push({ k, label: dt.toLocaleDateString(loc(), { month: 'short' }), full: dt.toLocaleDateString(loc(), { month: 'long', year: 'numeric' }), v: 0, n: 0 }); }
    const at = Object.fromEntries(out.map(x => [x.k, x]));
    for (const k of list) { const x = at[monthKey(k.date)]; if (x) { x.v += k.amount * pctOf(byId[k.creatorId]) / 100; x.n++; } }
    return out;
  }

  /* Balken je Monat in einer Farbe; Achse in der Affiliate-Währung */
  U.drawers.affbars = function (el, d, W, H) {
    const ms = d && d.months || []; if (!ms.length) { el.innerHTML = ''; return; }
    const axis = v => fmt.cur(v, { money: true, compact: true, currency: AD.CURRENCY });
    const vals = ms.map(x => x.v); const ticks = U.niceTicks(0, Math.max(1, ...vals), 4); const y1 = Math.max(ticks[ticks.length - 1], ...vals);
    const ml = U.axisWidth(ticks.map(axis)), mr = 12, mt = 12, mb = 30; const iw = W - ml - mr, ih = H - mt - mb; const gap = iw / ms.length, bw = Math.min(30, gap * 0.56);
    const x = i => ml + i * gap + gap / 2, y = v => mt + (y1 - v) / (y1 || 1) * ih;
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${U.axisLeft(ticks, y, ml, W, mr, axis)}<line class="zero" x1="${ml}" x2="${W - mr}" y1="${y(0)}" y2="${y(0)}"/>
      ${ms.map((m, i) => `<rect x="${(x(i) - bw / 2).toFixed(1)}" y="${y(m.v).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(m.v > 0 ? 2 : 0, y(0) - y(m.v)).toFixed(1)}" rx="4" fill="var(--accent)" fill-opacity=".85" data-tip="<b>${esc(m.full)}</b><br>${esc(money(m.v))} · ${m.n} ${m.n === 1 ? 'Kunde' : 'Kunden'}"></rect><text x="${x(i)}" y="${H - 8}" text-anchor="middle">${esc(m.label)}</text>`).join('')}</svg>`;
  };

  const chart = (id, list, d, title) => { U.chartData[id] = { months: months(d, list) }; return U.card(title, `<div class="chart h240" data-chart="affbars" data-id="${id}"></div>`); };
  const nav = view => `<nav class="prop-tabs" aria-label="Ansicht">${[['admin', 'Alle Creator', '#/affiliate'], ['creator', 'Creator-Ansicht', '#/affiliate/creator']].map(([k, l, h]) => `<a href="${h}" aria-pressed="${view === k}"${view === k ? ' aria-current="page"' : ''}>${l}</a>`).join('')}</nav>`;
  const ticket = (label, value, kind) => `<div class="aff-ticket"><span class="aff-label">${label}</span><button type="button" class="cpn-code" data-action="aff-copy" data-text="${esc(value)}" data-kind="${kind}" data-tip="Kopieren" aria-label="${label} kopieren"><span class="no-i18n">${esc(value)}</span>${I.copy}</button></div>`;

  function admin(d) {
    const all = sums(d);
    const rows = d.creators.map(c => ({ c, s: sums(d, c) })).sort((a, b) => b.s.earned - a.s.earned);
    const tiles = `<div class="grid tiles kstrip">${U.tile('Creator', String(d.creators.length))}${U.tile('Kunden', String(all.n))}${U.tile('Umsatz', money(all.revenue))}${U.tile('Provisionen', money(all.earned))}${U.tile('Offen', money(all.open), { foot: 'Dieser Monat' })}</div>`;
    const table = `<div class="tbl-wrap inset"><table class="tbl compact aff-tbl"><thead><tr><th>Creator</th><th class="ph-hide">Code</th><th class="r">Kunden</th><th class="r ph-hide">Umsatz</th><th class="r">Provision</th><th class="r">Verdient</th><th class="r ph-hide">Offen</th><th class="ph-hide"></th></tr></thead><tbody>${rows.map(({ c, s }) => `<tr><td><button type="button" class="aff-name no-i18n" data-action="aff-view" data-id="${c.id}">${esc(c.name)}</button><div class="sub no-i18n">@${esc(c.handle)}</div></td><td class="ph-hide"><span class="aff-code no-i18n">${esc(c.code)}</span></td><td class="r num">${s.n}</td><td class="r num ph-hide">${money(s.revenue)}</td><td class="r nowrap"><button type="button" class="aff-pct" data-action="aff-pct" data-id="${c.id}" data-tip="Provision ändern" aria-label="Provision von ${esc(c.name)} ändern">${pctText(pctOf(c))}${I.edit}</button></td><td class="r num"><b>${money(s.earned)}</b></td><td class="r num ph-hide">${money(s.open)}</td><td class="r ph-hide"><button type="button" class="btn ghost icon sm" data-action="aff-view" data-id="${c.id}" aria-label="Ansicht von ${esc(c.name)}" data-tip="Creator-Ansicht">${I.chevR}</button></td></tr>`).join('')}</tbody></table></div>`;
    return `${tiles}${U.card('Creator', table, { info: 'Verdient = Umsatz × Provision. Offen = Provisionen des laufenden Monats.' })}${chart('aff-all', all.list, d, 'Provisionen je Monat')}`;
  }

  function creator(d, c) {
    const s = sums(d, c);
    const share = `<div class="aff-share">${ticket('Dein Link', AD.LINK_BASE + c.code, 'link')}${ticket('Dein Code', c.code, 'code')}</div>`;
    const tiles = `<div class="grid tiles kstrip">${U.tile('Verdient', money(s.earned), { foot: 'Gesamt' })}${U.tile('Offen', money(s.open), { foot: 'Dieser Monat' })}${U.tile('Kunden', String(s.n), { foot: `Link ${s.link} · Code ${s.code}` })}${U.tile('Provision', pctText(pctOf(c)), { foot: 'vom Umsatz' })}</div>`;
    const list = s.list.slice(0, st.limit);
    const table = s.n ? `<div class="tbl-wrap inset"><table class="tbl compact aff-tbl"><thead><tr><th>Datum</th><th class="ph-hide">Plan</th><th class="ph-hide">Über</th><th class="r ph-hide">Umsatz</th><th class="r">Provision</th><th>Status</th></tr></thead><tbody>${list.map(k => { const paid = monthKey(k.date) !== thisMonth(); return `<tr><td class="nowrap">${fmt.dateFull(k.date + 'T12:00:00')}</td><td class="ph-hide">${esc(AD.PLANS[k.plan].label)}</td><td class="ph-hide">${k.via === 'link' ? 'Link' : 'Code'}</td><td class="r num ph-hide">${money(k.amount)}</td><td class="r num"><b>${money(k.amount * pctOf(c) / 100)}</b></td><td>${U.pill(paid ? 'Ausgezahlt' : 'Offen', paid ? 'win' : 'neutral')}</td></tr>`; }).join('')}</tbody></table></div>${s.n > list.length ? `<div class="aff-more"><button type="button" class="btn sm ghost" data-action="aff-more">Mehr anzeigen</button></div>` : ''}` : '<div class="dashed">Noch keine Kunden.</div>';
    return `${share}${tiles}${chart('aff-one', s.list, d, 'Verdient je Monat')}${U.card('Kunden', table)}`;
  }

  App.screens.affiliate = {
    title: 'Affiliate',
    head: { range: false, account: false }, /* Zeitraum und Konto spielen hier keine Rolle */
    render(ctx) {
      if (!AD) return U.empty('affiliate', 'Affiliate nicht verfügbar', 'Die Affiliate-Daten konnten nicht geladen werden.');
      const view = ctx.params[0] === 'creator' ? 'creator' : 'admin'; const d = data();
      const c = d.creators.find(x => x.id === conf().creatorId) || d.creators[0];
      const pick = view === 'creator' ? `<select class="select aff-pick" data-change="aff-pick" aria-label="Creator wählen">${d.creators.map(x => `<option class="no-i18n" value="${x.id}" ${x.id === c.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select>` : '';
      const top = `<div class="aff-top">${nav(view)}${pick}<span class="grow"></span>${U.pill('Beispieldaten', 'neutral')}</div>`;
      return `<div class="aff">${top}${view === 'creator' ? creator(d, c) : admin(d)}</div>`;
    },
  };

  Object.assign(App.actions, {
    async 'aff-copy'(el) { const ok = await U.copyText(el.dataset.text || ''); U.toast(ok ? (el.dataset.kind === 'link' ? 'Link kopiert' : 'Code kopiert') : 'Kopieren nicht möglich, bitte markieren', ok ? 'ok' : 'err'); if (ok) { el.classList.add('copied'); setTimeout(() => el.classList.remove('copied'), 1400); } },
    'aff-pick'(el) { S.setSetting('affiliate', Object.assign({}, conf(), { creatorId: el.value })); st.limit = PAGE; App.rerender(); },
    'aff-view'(el) { S.setSetting('affiliate', Object.assign({}, conf(), { creatorId: el.dataset.id })); st.limit = PAGE; location.hash = '#/affiliate/creator'; },
    'aff-more'() { st.limit += PAGE; App.rerender(); },
    'aff-pct'(el) {
      const c = data().creators.find(x => x.id === el.dataset.id); if (!c) return;
      U.modal(`<form data-action="aff-pct-save" data-id="${c.id}"><div class="modal-head"><h2>Provision</h2><button type="button" class="btn ghost icon" data-close aria-label="Schließen">${I.close}</button></div>
        <p class="muted small no-i18n">${esc(c.name)} · ${esc(c.code)}</p><div class="field"><label for="aff-pct-in">Provision in %</label><input class="input" id="aff-pct-in" name="pct" type="number" min="0" max="100" step="0.5" value="${pctOf(c)}" required inputmode="decimal"></div>
        <div class="modal-foot"><button type="button" class="btn" data-close>Abbrechen</button><button type="submit" class="btn primary">Speichern</button></div></form>`, { cls: 'narrow', onMount(m) { const inp = m.querySelector('input'); setTimeout(() => { inp.focus(); inp.select(); }, 40); } });
    },
    'aff-pct-save'(form) {
      const v = Number(String(new FormData(form).get('pct') || '').replace(',', '.')); if (!isFinite(v) || v < 0 || v > 100) return U.toast('Bitte 0 bis 100 % angeben', 'err');
      const a = conf(); S.setSetting('affiliate', Object.assign({}, a, { pct: Object.assign({}, a.pct, { [form.dataset.id]: Math.round(v * 10) / 10 }) }));
      U.closeModal(); U.toast('Provision gespeichert', 'ok'); App.rerender();
    },
  });
})(typeof self !== 'undefined' ? self : this);
