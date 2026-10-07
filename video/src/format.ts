/* Formate wie in der App: deutsche Zahlen, echtes Minuszeichen. */
const eur2 = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const eur0 = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
const usd2 = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const usd0 = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
const MINUS = '−';
const signed = (v: number, s: string, plus: boolean) => (v < 0 ? MINUS : plus && v > 0 ? '+' : '') + s;

export const fmtEur = (v: number, o: { sign?: boolean; decimals?: 0 | 2 } = {}) => signed(v, (o.decimals === 0 ? eur0 : eur2).format(Math.abs(v)), !!o.sign);
export const fmtUsd = (v: number, o: { sign?: boolean; decimals?: 0 | 2 } = {}) => signed(v, (o.decimals === 0 ? usd0 : usd2).format(Math.abs(v)), !!o.sign);
export const fmtNum = (v: number, d = 2) => signed(v, Math.abs(v).toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d }), false);
export const fmtPct = (v: number, d = 1) => fmtNum(v * 100, d) + ' %';
export const fmtR = (v: number) => signed(v, Math.abs(v).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' R', v > 0);
export const fmtInt = (v: number) => Math.round(v).toLocaleString('de-DE');
export const fmtDate = (iso: string) => { const d = new Date(iso); const p = (n: number) => String(n).padStart(2, '0'); return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`; };
export const fmtDateShort = (key: string) => { const [y, m, d] = key.split('-'); return `${d}.${m}.${y.slice(2)}`; };
export const fmtTime = (iso: string) => { const d = new Date(iso); const p = (n: number) => String(n).padStart(2, '0'); return `${p(d.getHours())}:${p(d.getMinutes())}`; };
export const fmtHold = (min: number) => min >= 60 ? `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')} min` : `${min} min`;
