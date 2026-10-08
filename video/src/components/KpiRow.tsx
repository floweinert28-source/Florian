import type {ReactNode} from 'react';
import {interpolateColors} from 'remotion';
import {evolvePath} from '@remotion/paths';
import {BOX, C, FONT, L} from '../theme';
import {ease, rise, settle} from '../motion';
import {DAYS, EQUITY, STATS} from '../data';
import {Card, Num, fmtCompact, fmtUsd, signed} from './Primitives';
import {IconInfo} from './Icons';

const COUNT = 110; // frames for a value to count up
const TILE_STAGGER = 5;

const shortDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', {month: 'short', day: 'numeric', timeZone: 'UTC'});

const Sparkline = ({p, w = 92, h = 36}: {p: number; w?: number; h?: number}) => {
  const step = 3;
  const pts = EQUITY.filter((_, i) => i % step === 0 || i === EQUITY.length - 1);
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const d = pts
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${((i / (pts.length - 1)) * w).toFixed(2)} ${(h - 2 - ((v - min) / (max - min)) * (h - 4)).toFixed(2)}`)
    .join(' ');
  const evo = evolvePath(p, d);
  return (
    <svg width={w} height={h} style={{display: 'block', overflow: 'visible'}}>
      <path
        d={d}
        fill="none"
        stroke={C.accent}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={evo.strokeDasharray}
        strokeDashoffset={evo.strokeDashoffset}
        opacity={p > 0 ? 1 : 0}
      />
    </svg>
  );
};

const Ring = ({p, value, size = 44}: {p: number; value: number; size?: number}) => {
  const r = (size - 5) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{display: 'block', transform: 'rotate(-90deg)'}}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.surface2} strokeWidth={4} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={C.accent}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={`${circ * value * p} ${circ}`}
        opacity={p > 0.002 ? 1 : 0}
      />
    </svg>
  );
};

const SplitBar = ({p, w = 84}: {p: number; w?: number}) => {
  const winShare = STATS.grossWin / (STATS.grossWin + STATS.grossLoss);
  return (
    <div style={{width: w, display: 'flex', gap: 3}}>
      <div style={{width: w * winShare - 1.5, height: 6, borderRadius: 3, background: C.surface2, overflow: 'hidden'}}>
        <div style={{width: `${p * 100}%`, height: '100%', borderRadius: 3, background: C.accent}} />
      </div>
      <div style={{flex: 1, height: 6, borderRadius: 3, background: C.surface2, overflow: 'hidden'}}>
        <div style={{width: `${p * 100}%`, height: '100%', borderRadius: 3, background: C.loss}} />
      </div>
    </div>
  );
};

type Tile = {
  title: string;
  value: (p: number) => string;
  color?: string;
  footer: ReactNode;
  chart?: (p: number) => ReactNode;
};

const TILES: Tile[] = [
  {
    title: 'Net P&L',
    value: (p) => fmtUsd(STATS.net * p, {sign: false}).replace(/^\$/, '+$'),
    color: C.accent,
    footer: `${STATS.count} trades · ${DAYS.length} trading days`,
    chart: (p) => <Sparkline p={p} />,
  },
  {
    title: 'Win rate',
    value: (p) => `${(STATS.winRate * p).toFixed(1)}%`,
    footer: `${STATS.wins} wins · ${STATS.losses} losses`,
    chart: (p) => <Ring p={p} value={STATS.winRate / 100} />,
  },
  {
    title: 'Profit factor',
    value: (p) => (STATS.profitFactor * p).toFixed(2),
    footer: `${fmtCompact(Math.round(STATS.grossWin / 100) * 100)} won · ${fmtCompact(Math.round(STATS.grossLoss / 100) * 100)} lost`,
    chart: (p) => <SplitBar p={p} />,
  },
  {
    title: 'Avg R',
    value: (p) => `${signed(STATS.avgR * p)}R`.replace(/^(\d)/, '+$1'),
    footer: `Win ${signed(STATS.avgWinR)}R · Loss ${signed(STATS.avgLossR)}R`,
  },
  {
    title: 'Max drawdown',
    value: (p) => `−$${(STATS.maxDd * p).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
    color: C.loss,
    footer: `${shortDate(STATS.maxDdDate)} · ${((STATS.maxDd / 50000) * 100).toFixed(1)}% of balance`,
  },
];

export const KPI_DONE = (TILES.length - 1) * TILE_STAGGER + COUNT;

export const KpiRow = ({b, f}: {b: number; f: number}) => {
  const tileW = (BOX.kpi.w - L.gap * (TILES.length - 1)) / TILES.length;
  return (
    <>
      {TILES.map((t, i) => {
        const appear = settle(b, 30 + i * 4, 45);
        const p = ease(f, i * TILE_STAGGER, COUNT);
        const footer = ease(f, i * TILE_STAGGER + 34, 40);
        const valueColor = t.color ? interpolateColors(p, [0, 0.12], [C.text, t.color]) : C.text;
        return (
          <Card
            key={t.title}
            style={{
              left: BOX.kpi.x + i * (tileW + L.gap),
              top: BOX.kpi.y,
              width: tileW,
              height: BOX.kpi.h,
              padding: '14px 16px 14px',
              ...rise(appear, 16, 0.98),
            }}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
              <span style={{fontFamily: FONT.text, fontSize: 13.5, fontWeight: 500, color: C.text2}}>{t.title}</span>
              <IconInfo size={13} color={C.muted} />
            </div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 9, height: 32}}>
              <Num style={{fontSize: 25, fontWeight: 700, color: valueColor, letterSpacing: -0.4, lineHeight: '32px'}}>
                {t.value(p)}
              </Num>
              {t.chart && <div style={{height: 32, display: 'flex', alignItems: 'center', marginTop: 8}}>{t.chart(p)}</div>}
            </div>
            <div
              style={{
                ...rise(footer, 8),
                fontFamily: FONT.text,
                fontSize: 12,
                color: C.muted,
                marginTop: 7,
                whiteSpace: 'nowrap',
              }}
            >
              {t.footer}
            </div>
          </Card>
        );
      })}
    </>
  );
};
