/* Echte Werte aus der Journalyst-App (scripts/capture.cjs → src/data/app.json), aufbereitet für die Karten im Video */
import raw from './data/app.json';

const tile = (label: string) => raw.dash.tiles.find((t) => t[0] === label) ?? [];
const net = tile('Net P&L'), win = tile('Trade win rate'), pf = tile('Profit factor'), awl = tile('Avg win/loss');

export const dash = {
  net: net[2], trades: net[1], avg: net[3],
  winRate: win[1], wins: Number(win[2]), losses: Number(win[4]),
  pf: pf[1], awl: awl[1], avgWin: awl[2], avgLoss: awl[3],
  score: raw.dash.score ?? 0,
  days: raw.dash.days.map((d) => d.pnl),
  dailyWin: tile('Daily win rate')[1],
};
/* Score-Radar; die Tooltips der App sind deutsch, die Achsen heißen in der englischen Oberfläche so: */
const AXES: Record<string, string> = { 'Win-Rate': 'Win rate', 'Profit-Faktor': 'Profit factor', 'Gewinn/Verlust': 'Win/loss', Konsistenz: 'Consistency', Regeltreue: 'Rule adherence', Drawdown: 'Drawdown' };
export const radar = raw.dash.radar.map((a) => ({ label: AXES[a.label] ?? a.label, score: a.score }));
/* Kumulierte Tagesergebnisse für die Equity-Kurve */
export const cumulative = dash.days.reduce<number[]>((a, v) => [...a, (a[a.length - 1] ?? 0) + v], []);

const pv = raw.trade.preview.match(/([+−-]\$[\d,.]+)\s*·\s*([+−-][\d.]+ R)\s*·\s*\S+\s+(\d+)/);
const money = (v: string) => Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const trade = {
  symbol: raw.trade.symbol, side: 'Long', qty: raw.trade.qty,
  entry: money(raw.trade.entry), exit: money(raw.trade.exit),
  pnl: pv ? pv[1] : '', r: pv ? pv[2] : '', discipline: pv ? Number(pv[3]) : 0,
};

/* TradeLog: erste Zeilen nach dem Speichern */
export const rows = raw.trades.rows.map((r: Record<string, string>) => ({
  date: r['Opened'].replace(/^(\d\d\/\d\d)\/\d{4} (.*)$/, '$1 · $2'), day: r['Opened'].split(' ')[0], time: r['Opened'].split(' ').slice(1).join(' '),
  closed: r['Closed'].split(' ').slice(1).join(' '), symbol: r['Symbol'], side: r['Side'] as 'LONG' | 'SHORT', status: r['Status'],
  setup: r['Setup'], pnl: r['P&L'], r: r['RR'], score: r['Score'],
}));

const sh = (label: string) => raw.shadow.tiles.find((t) => t[0] === label) ?? [];
export const shadow = {
  cost: sh('Discipline cost')[2], actual: sh('Actual')[2], actualTrades: sh('Actual')[1], self: sh('Shadow Self')[1], selfSub: sh('Shadow Self')[2],
  real: raw.shadow.curve.map((p) => p.real), ideal: raw.shadow.curve.map((p) => p.shadow),
};
export const rules = raw.shadow.rules.map((r) => ({ name: r.name, hint: r.lines[1], value: r.value, unit: r.lines[2] }));
export const num = (s: string) => parseFloat(s.replace(/[^0-9.]/g, '')) || 0;
