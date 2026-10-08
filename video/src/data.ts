// Deterministic demo data for the Journalyst dashboard.
// Everything derives from SEED, so every render shows exactly the same journal.

export const SEED = 9697;

export type Side = 'Long' | 'Short';

export type Trade = {
  id: number;
  date: string; // ISO yyyy-mm-dd
  time: string; // HH:MM (New York)
  symbol: string;
  side: Side;
  r: number; // realised R multiple
  pnl: number; // USD
};

export type Day = {
  date: string;
  pnl: number;
  trades: number;
  equity: number; // cumulative net P&L at the close of this day
};

const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const pick = <T,>(rand: () => number, items: readonly (readonly [T, number])[]): T => {
  const total = items.reduce((s, [, w]) => s + w, 0);
  let x = rand() * total;
  for (const [v, w] of items) {
    x -= w;
    if (x <= 0) return v;
  }
  return items[items.length - 1][0];
};

const iso = (d: Date) => d.toISOString().slice(0, 10);

// US market holidays inside the journal period.
const HOLIDAYS = new Set(['2026-07-03', '2026-09-07']);

export const PERIOD_START = '2026-07-01';
export const PERIOD_END = '2026-09-30';

const tradingDays = (): string[] => {
  const out: string[] = [];
  const d = new Date(`${PERIOD_START}T12:00:00Z`);
  const end = new Date(`${PERIOD_END}T12:00:00Z`);
  while (d <= end) {
    const wd = d.getUTCDay();
    if (wd !== 0 && wd !== 6 && !HOLIDAYS.has(iso(d))) out.push(iso(d));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
};

const SYMBOLS = [
  ['NQ', 5],
  ['ES', 4],
  ['CL', 2],
  ['GC', 2],
  ['YM', 1],
] as const;

const RISK_PER_R = 250; // USD risked per trade (1R)

export const generate = (seed: number) => {
  const rand = mulberry32(seed);
  const trades: Trade[] = [];
  const days: Day[] = [];
  let equity = 0;
  let id = 1;
  // Slowly drifting "form" of the trader – produces streaks and real drawdowns.
  let form = 0;

  for (const date of tradingDays()) {
    form = form * 0.8 + (rand() - 0.5) * 0.16;
    const count = rand() < 0.1 ? 0 : pick(rand, [[1, 4], [2, 3.5], [3, 2], [4, 0.6]] as const);
    let dayPnl = 0;
    const minutes = Array.from({length: count}, () =>
      rand() < 0.75 ? 570 + Math.floor(rand() * 120) : 810 + Math.floor(rand() * 110),
    ).sort((a, b) => a - b);

    for (const m of minutes) {
      const win = rand() < 0.58 + form;
      const r = win
        ? 0.3 + Math.min(3.2, -Math.log(1 - rand()) * 0.95)
        : rand() < 0.7
          ? -1
          : -(0.25 + rand() * 0.85);
      const risk = RISK_PER_R * (0.8 + rand() * 0.4);
      const pnl = Math.round(r * risk * 100) / 100;
      trades.push({
        id: id++,
        date,
        time: `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`,
        symbol: pick(rand, SYMBOLS),
        side: rand() < 0.55 ? 'Long' : 'Short',
        r: Math.round(r * 100) / 100,
        pnl,
      });
      dayPnl += pnl;
    }
    equity += dayPnl;
    days.push({date, pnl: Math.round(dayPnl * 100) / 100, trades: count, equity: Math.round(equity * 100) / 100});
  }
  return {trades, days};
};

export const computeStats = (trades: Trade[], days: Day[]) => {
  const wins = trades.filter((t) => t.pnl > 0);
  const losses = trades.filter((t) => t.pnl <= 0);
  const grossWin = wins.reduce((s, t) => s + t.pnl, 0);
  const grossLoss = -losses.reduce((s, t) => s + t.pnl, 0);
  const net = grossWin - grossLoss;

  let peak = 0;
  let maxDd = 0;
  let maxDdDate = days[0].date;
  let peakAtMaxDd = 0;
  for (const d of days) {
    peak = Math.max(peak, d.equity);
    if (peak - d.equity > maxDd) {
      maxDd = peak - d.equity;
      maxDdDate = d.date;
      peakAtMaxDd = peak;
    }
  }

  return {
    net,
    count: trades.length,
    wins: wins.length,
    losses: losses.length,
    winRate: (wins.length / trades.length) * 100,
    profitFactor: grossWin / grossLoss,
    grossWin,
    grossLoss,
    avgR: trades.reduce((s, t) => s + t.r, 0) / trades.length,
    avgWinR: wins.reduce((s, t) => s + t.r, 0) / wins.length,
    avgLossR: losses.reduce((s, t) => s + t.r, 0) / losses.length,
    maxDd,
    maxDdDate,
    peakAtMaxDd,
    minEquity: Math.min(0, ...days.map((d) => d.equity)),
    maxEquity: Math.max(...days.map((d) => d.equity)),
  };
};

const generated = generate(SEED);
export const TRADES = generated.trades;
export const DAYS = generated.days;
export const STATS = computeStats(TRADES, DAYS);

// Equity series with a zero point at the start of the period.
export const EQUITY = [0, ...DAYS.map((d) => d.equity)];

export const RECENT_TRADES = TRADES.slice(-12).reverse();

export const CAL_MONTH = '2026-09';
export const CAL_DAYS = DAYS.filter((d) => d.date.startsWith(CAL_MONTH));
export const CAL_NET = CAL_DAYS.reduce((s, d) => s + d.pnl, 0);
