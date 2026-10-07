import React from 'react';
import { useCurrentFrame } from 'remotion';
import { J } from '../data';
import { fmtDateShort, fmtEur, fmtHold, fmtInt, fmtNum, fmtPct, fmtR } from '../format';
import { D, ENTER, MOVE, count, enterStyle, exitStyle, ms, prog, pressScale } from '../motion';
import { T } from '../theme';
import { HBars, LineChart } from '../ui/charts';
import { Card, StatTile, Tab } from '../ui/Primitives';
import { DefaultHead, HeadChip, Shell } from '../ui/Shell';

export const STATS = { tabClick: 106, gridOut: 108, barsIn: 116 } as const;
const TABS: [string, number][] = [['Übersicht', 112], ['Tage', 76], ['Setups', 92], ['Zeit', 70], ['Fehler', 86], ['Marktphase', 118], ['Zustand', 98], ['Edge-Check', 120], ['Monte Carlo', 124]];

export const StatsScene: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame(); const s = J.summary;
  const drawP = prog(f, 14, D.draw, MOVE);
  const eq = J.equity.map((e) => e.e);
  const kpis: { t: string; v: (p: number) => string; c?: string }[] = [
    { t: 'Netto P&L', v: (p) => fmtEur(s.total * p, { sign: true }), c: T.profit }, { t: 'Erwartungswert pro Trade', v: (p) => fmtEur(s.expectancy * p, { sign: true }), c: T.profit }, { t: 'Ø Haltedauer', v: (p) => fmtHold(Math.round(s.avgHoldingMin * p)) }, { t: 'Handelstage', v: (p) => fmtInt(s.tradingDays * p) },
    { t: 'Trefferquote', v: (p) => fmtPct(s.winRate * p) }, { t: 'Profit-Faktor', v: (p) => fmtNum(s.profitFactor * p, 2) }, { t: 'Ø Netto-P&L pro Tag', v: (p) => fmtEur(s.avgDailyPnl * p, { sign: true }), c: T.profit }, { t: 'Trades pro Tag', v: (p) => fmtNum(s.avgTradesPerDay * p, 1) },
    { t: 'Tages-Trefferquote', v: (p) => fmtPct(s.dailyWinRate * p) }, { t: 'Ø Gewinn/Verlust pro Trade', v: (p) => fmtNum(s.payoff * p, 2) }, { t: 'Ø geplantes R', v: (p) => fmtR(s.avgPlannedR * p) }, { t: 'Schlechtester Tag', v: (p) => fmtEur(s.worstDay * p), c: T.loss },
    { t: 'Maximaler Drawdown', v: (p) => fmtEur(J.drawdown.max * p), c: T.loss }, { t: 'Ø realisiertes R', v: (p) => fmtR(s.avgR * p) }, { t: 'Längste Gewinnserie', v: (p) => `${fmtInt(J.streaks.maxWin * p)} Trades` }, { t: 'Bester Tag', v: (p) => fmtEur(s.bestDay * p, { sign: true }), c: T.profit },
  ];
  const tabActive = f >= STATS.tabClick ? 'Fehler' : 'Übersicht';
  const gridStyle = f >= STATS.gridOut ? exitStyle(f, STATS.gridOut, ms(240)) : { opacity: 1 };
  let tx = 0;
  return (
    <Shell frame={f} exitAt={dur - 7} title="Statistiken" active="stats" prevActive="dashboard" switchAt={0} head={<DefaultHead right={<HeadChip icon="checkCircle" label="Zertifikat" caret />} />}>
      <Card style={{ left: 0, top: 0, width: 1664, height: 290 }} enter={enterStyle(f, 6, D.card)}>
        <LineChart w={1624} h={226} series={[{ values: eq, color: T.accent, area: true }]} progress={drawP} yFmt={(v) => fmtEur(v, { decimals: 0 })} xLabels={[0, 0.25, 0.5, 0.75, 1].map((q) => fmtDateShort(J.equity[Math.round(q * (J.equity.length - 1))].t))} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: -6, textAlign: 'center', fontSize: 11.5, color: T.muted }}><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: T.accent, marginRight: 6 }} />Kumulierter Netto-P&L · {s.n} Trades</div>
      </Card>
      <div style={{ position: 'absolute', left: 0, top: 308, display: 'flex', gap: 10 }}>
        {TABS.map(([label, w], i) => { const left = tx; tx += w + 10; return <div key={label} style={{ position: 'absolute', left, top: 0, scale: String(label === 'Fehler' ? pressScale(f, STATS.tabClick) : 1), ...enterStyle(f, 12 + i, ms(300), 10) }}><Tab label={label} active={label === tabActive} style={{ width: w, justifyContent: 'center' }} /></div>; })}
      </div>
      {f < STATS.gridOut + ms(240) ? (
        <div style={{ position: 'absolute', left: 0, top: 366, width: 1664, height: 500, ...gridStyle }}>
          {kpis.map((k, i) => { const col = i % 4, row = Math.floor(i / 4); const p = prog(f, 18 + i + 3, ms(700)); return <StatTile key={k.t} style={{ left: col * 420, top: row * 126, width: 404, height: 110 }} enter={enterStyle(f, 18 + i, ms(380), 20)} title={k.t} value={k.v(p)} valueColor={k.c} />; })}
        </div>
      ) : null}
      {f >= STATS.barsIn ? (
        <>
          <Card title="Fehlerkosten" style={{ left: 0, top: 366, width: 1000, height: 500 }} enter={enterStyle(f, STATS.barsIn, D.card)} right={<span style={{ fontSize: 12.5, color: T.muted }}>Netto-P&L aller Trades mit diesem Fehler-Tag</span>}>
            <HBars rows={[...J.mistakes].sort((a, b) => a.pnl - b.pnl).map((m) => ({ label: m.key, value: m.pnl, sub: `${m.n} Trades` }))} frame={f} start={STATS.barsIn + 6} stagger={2} fmt={(v) => fmtEur(v)} rowH={62} labelW={190} />
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, fontSize: 13, color: T.text2 }}>Die drei teuersten Fehler kosten zusammen <b style={{ color: T.loss }}>{fmtEur(J.mistakes.slice(-3).reduce((a, m) => a + m.pnl, 0))}</b> – mehr als das gesamte Netto-Ergebnis.</div>
          </Card>
          <Card title="Emotionen" style={{ left: 1016, top: 366, width: 648, height: 500 }} enter={enterStyle(f, STATS.barsIn + 3, D.card)}>
            <HBars rows={[...J.emotions].sort((a, b) => b.pnl - a.pnl).map((m) => ({ label: m.key, value: m.pnl, sub: `${m.n} Trades` }))} frame={f} start={STATS.barsIn + 10} stagger={2} fmt={(v) => fmtEur(v, { decimals: 0 })} rowH={54} labelW={110} />
          </Card>
        </>
      ) : null}
    </Shell>
  );
};
