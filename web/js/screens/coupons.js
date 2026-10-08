/* Coupon-Codes: eigener Bereich in der Gruppe Konten. Rabatt-Codes für Prop Firms aus js/propdata.js (PropData.COUPONS);
   je Firma eine Kachel mit Rabatt, Code als gestricheltes Ticket (Klick kopiert), Notiz und Link. Einträge mit example: true tragen die Marke „Beispiel“. */
(function (root) {
  'use strict';
  const U = root.UI, I = U.I, esc = U.esc, App = root.App, PD = root.PropData;
  const tile = c => `<div class="cpn"><div class="cpn-head"><b class="no-i18n">${esc(c.firm)}</b>${c.example ? U.pill('Beispiel', 'neutral') : ''}</div>${c.discount ? `<div class="cpn-off">${esc(c.discount)}</div>` : ''}<button type="button" class="cpn-code no-i18n" data-action="coupon-copy" data-code="${esc(c.code)}" data-tip="Kopieren" aria-label="Code ${esc(c.code)} kopieren"><span>${esc(c.code)}</span>${I.copy}</button>${c.note ? `<div class="cpn-note">${esc(c.note)}</div>` : ''}${c.url ? `<a class="cpn-link" href="${esc(c.url)}" target="_blank" rel="noopener">Zur Website ${I.external}</a>` : ''}</div>`;

  App.screens.coupons = {
    title: 'Coupon-Codes',
    head: { range: false, account: false }, /* Zeitraum und Konto spielen hier keine Rolle */
    render() {
      const cps = PD && Array.isArray(PD.COUPONS) ? PD.COUPONS : [];
      return cps.length ? `<div class="cpn-grid">${cps.map(tile).join('')}</div>` : U.empty('coupon', 'Noch keine Codes hinterlegt', 'Rabatt-Codes für Prop Firms erscheinen hier.');
    },
  };

  Object.assign(App.actions, {
    async 'coupon-copy'(el) { const ok = await U.copyText(el.dataset.code || ''); U.toast(ok ? 'Code kopiert' : 'Kopieren nicht möglich, bitte den Code markieren', ok ? 'ok' : 'err'); if (ok) { el.classList.add('copied'); setTimeout(() => el.classList.remove('copied'), 1400); } },
  });
})(typeof self !== 'undefined' ? self : this);
