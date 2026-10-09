/* Journalyst – Affiliate-Beispieldaten: Creator mit Code und Link, dazu ihre Kunden.
 *
 * Nur Oberfläche: Es gibt noch keine echte Datenquelle (Zahlungsanbieter, Server). Alles hier ist erfunden und trägt example: true;
 * die Oberfläche zeigt dazu die Marke „Beispieldaten“. Preise der Pläne und die Link-Adresse sind Platzhalter (unverifiziert).
 * Die Kunden entstehen aus einem festen Startwert immer gleich, verteilt über die letzten 8 Monate bis heute.
 *
 * Creator: { id, name, handle, code, pct (Provision in Prozent), joined: 'YYYY-MM-DD' }
 * Kunde:   { id, creatorId, date: 'YYYY-MM-DD', plan: 'month'|'year', amount, via: 'link'|'code' }
 */
(function (root) {
  'use strict';
  const C = root.Core;

  const CURRENCY = 'EUR';
  const LINK_BASE = 'https://journalyst.app/?ref='; /* Platzhalter, unverifiziert */
  const PLANS = { month: { label: 'Monat', price: 29 }, year: { label: 'Jahr', price: 249 } }; /* Platzhalter-Preise, unverifiziert */

  const CREATORS = [
    { id: 'aff-lena', name: 'Lena Berger', handle: 'lenatrades', code: 'LENA', pct: 25, rate: 7 },
    { id: 'aff-tim', name: 'Tim Kraus', handle: 'timscalps', code: 'TIM', pct: 20, rate: 5 },
    { id: 'aff-sara', name: 'Sara Yilmaz', handle: 'sarafutures', code: 'SARA', pct: 30, rate: 9 },
    { id: 'aff-jonas', name: 'Jonas Weber', handle: 'jonasorderflow', code: 'JONAS', pct: 20, rate: 3 },
    { id: 'aff-mia', name: 'Mia Hoffmann', handle: 'miacharts', code: 'MIA', pct: 15, rate: 2 },
  ];

  const pad = n => String(n).padStart(2, '0');
  const key = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  /* Kunden je Creator und Monat; der laufende Monat nur bis heute */
  function build(today = new Date()) {
    const rnd = C && C.mulberry ? C.mulberry(42) : Math.random; const out = []; let n = 0;
    const creators = CREATORS.map((c, ci) => {
      const start = new Date(today.getFullYear(), today.getMonth() - 7 + (ci % 3), 1 + ci * 3);
      return Object.assign({}, c, { joined: key(start), example: true });
    });
    for (const c of creators) {
      const start = new Date(c.joined + 'T12:00:00');
      for (let m = 7; m >= 0; m--) {
        const first = new Date(today.getFullYear(), today.getMonth() - m, 1, 12);
        const last = m === 0 ? today.getDate() : new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
        const grow = 0.55 + (7 - m) * 0.09; const count = Math.round(c.rate * grow * (0.7 + rnd() * 0.6) * (m === 0 ? last / 30 : 1));
        for (let i = 0; i < count; i++) {
          const d = new Date(first.getFullYear(), first.getMonth(), 1 + Math.floor(rnd() * last), 12);
          if (d < start || d > today) continue;
          const plan = rnd() < 0.28 ? 'year' : 'month';
          out.push({ id: 'k' + (++n), creatorId: c.id, date: key(d), plan, amount: PLANS[plan].price, via: rnd() < 0.62 ? 'link' : 'code' });
        }
      }
    }
    out.sort((a, b) => a.date < b.date ? 1 : a.date > b.date ? -1 : 0);
    return { creators: creators.map(({ rate, ...c }) => c), customers: out };
  }

  root.AffiliateData = { CURRENCY, LINK_BASE, PLANS, build };
})(typeof self !== 'undefined' ? self : this);
