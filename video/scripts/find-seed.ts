// Searches for a seed whose journal looks like a real, decent trader:
// ~58 % win rate, an early dip below zero, a clear mid-period drawdown and a mixed September.
// Run: node --experimental-strip-types scripts/find-seed.ts
import {computeStats, generate} from '../src/data.ts';

const results: string[] = [];
for (let seed = 1; seed < 20000; seed++) {
  const {trades, days} = generate(seed);
  const s = computeStats(trades, days);
  const sep = days.filter((d) => d.date.startsWith('2026-09') && d.trades > 0);
  const sepRed = sep.filter((d) => d.pnl < 0).length;
  const sepNet = sep.reduce((a, d) => a + d.pnl, 0);
  const firstHalf = days.slice(0, 15);
  const recent = trades.slice(-12);
  const recentLosses = recent.filter((t) => t.pnl <= 0).length;
  const ddIndex = days.findIndex((d) => d.date === s.maxDdDate);

  const ok =
    s.winRate >= 57.5 &&
    s.winRate <= 58.6 &&
    s.net > 8000 &&
    s.net < 16000 &&
    s.profitFactor > 1.4 &&
    s.profitFactor < 2.1 &&
    firstHalf.some((d) => d.equity < -400) &&
    s.maxDd > 2200 &&
    s.maxDd < 4500 &&
    ddIndex > 15 &&
    ddIndex < 50 &&
    sepRed >= 5 &&
    sepRed <= 8 &&
    sepNet > 1000 &&
    recentLosses >= 4 &&
    recentLosses <= 6 &&
    days[days.length - 1].equity > s.maxEquity - 1500;

  if (ok) {
    results.push(
      `seed ${seed}: n=${s.count} wr=${s.winRate.toFixed(1)} net=${s.net.toFixed(0)} pf=${s.profitFactor.toFixed(2)} ` +
        `avgR=${s.avgR.toFixed(2)} dd=${s.maxDd.toFixed(0)}@${s.maxDdDate} min=${s.minEquity.toFixed(0)} sepRed=${sepRed} sepNet=${sepNet.toFixed(0)}`,
    );
  }
}
console.log(results.slice(0, 25).join('\n'));
console.log(`${results.length} candidates`);
