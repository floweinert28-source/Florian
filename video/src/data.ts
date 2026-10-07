/* Echte Kennzahlen der Journalyst-Beispieldaten (web/js/sample.js + core.js), siehe scratch-Skript extract.cjs. */
import journal from './data/journal.json';

export type Row = { key: string; n: number; pnl: number; winRate: number };
export type Day = { key: string; pnl: number; n: number; wins: number; winRate: number };
export type Recent = { symbol: string; dir: 'Long' | 'Short'; pnl: number; r: number; setup: string; closedAt: string; holdingMin: number; rating: number; emotions: string[]; mistakes: string[]; entry: number; exit: number; qty: number; stop: number; target: number; fees: number };
export type Journal = {
  account: number;
  summary: { n: number; wins: number; losses: number; total: number; fees: number; gp: number; gl: number; winRate: number; profitFactor: number; avgWin: number; avgLoss: number; payoff: number; expectancy: number; balance: number; avgHoldingMin: number; tradingDays: number; avgDailyPnl: number; dailyWinRate: number; bestDay: number; worstDay: number; avgPlannedR: number; avgR: number; avgTradesPerDay: number };
  drawdown: { max: number; maxPct: number; avg: number; avgPct: number; current: number; currentPct: number; episodes: number };
  streaks: { current: number; kind: string; maxWin: number; maxLoss: number };
  activityStreak: number;
  traderScore: { overall: number; axes: { key: string; score: number; text: string; label: string }[] };
  days: Day[]; equity: { t: string; e: number; p: number }[]; shadow: { key: string; actual: number; shadow: number }[];
  violations: number; disciplineCost: number;
  setups: Row[]; symbols: Row[]; mistakes: Row[]; emotions: Row[]; weekdays: Row[]; hours: Row[]; holding: Row[];
  recent: Recent[]; rules: string[];
  propAccounts: { firm: string; name: string; phase: string; status: string; size: number }[];
};

export const J = journal as unknown as Journal;

/* kumulierter Tages-P&L */
export const daysCum = (() => { let e = 0; return J.days.map((d) => { e += d.pnl; return { key: d.key, e: Math.round(e * 100) / 100, pnl: d.pnl }; }); })();
export const dayMap = new Map(J.days.map((d) => [d.key, d]));
export const lastDays = (n: number) => J.days.slice(-n);
/* der zuletzt geloggte Trade (NQ Long) treibt die Szene „Trade loggen“ */
export const loggedTrade = J.recent[0];
export const before = { total: Math.round((J.summary.total - loggedTrade.pnl) * 100) / 100, n: J.summary.n - 1, wins: J.summary.wins - (loggedTrade.pnl > 0 ? 1 : 0) };
