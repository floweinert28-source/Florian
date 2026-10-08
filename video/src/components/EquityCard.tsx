import {evolvePath, getLength, getPointAtLength} from '@remotion/paths';
import {BOX, C, FONT, alpha} from '../theme';
import {ease, rise, settle} from '../motion';
import {DAYS, EQUITY, STATS} from '../data';
import {Card, CardTitle, Num, Segmented, fmtCompact, fmtUsd} from './Primitives';

export const EQUITY_DRAW = 140;

const PAD_X = 20;
const PAD_Y = 18;
const AXIS_W = 54;
const XLABEL_H = 26;
const TOP = PAD_Y + 32 + 18;

const innerW = BOX.equity.w - PAD_X * 2;
const plotW = innerW - AXIS_W - 10;
const plotH = BOX.equity.h - TOP - PAD_Y - XLABEL_H;

const Y_MIN = -1250;
const Y_MAX = 10000;
const TICKS = [0, 2500, 5000, 7500, 10000];

const x = (i: number) => (i / (EQUITY.length - 1)) * plotW;
const y = (v: number) => plotH - ((v - Y_MIN) / (Y_MAX - Y_MIN)) * plotH;

const LINE = EQUITY.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(2)} ${y(v).toFixed(2)}`).join(' ');
const AREA = `${LINE} L${x(EQUITY.length - 1).toFixed(2)} ${plotH} L0 ${plotH} Z`;
const LENGTH = getLength(LINE);

const X_LABELS = ['2026-07-01', '2026-07-15', '2026-08-03', '2026-08-17', '2026-09-01', '2026-09-15', '2026-09-30'].map(
  (date) => {
    const i = DAYS.findIndex((d) => d.date >= date) + 1;
    const label = new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', {month: 'short', day: 'numeric', timeZone: 'UTC'});
    return {i, label};
  },
);

const troughIndex = DAYS.findIndex((d) => d.date === STATS.maxDdDate) + 1;

export const EquityCard = ({b, f}: {b: number; f: number}) => {
  const appear = settle(b, 52, 50);
  const lineP = settle(f, 0, EQUITY_DRAW);
  const areaP = ease(f, EQUITY_DRAW - 20, 60);
  const troughP = ease(f, EQUITY_DRAW + 10, 45);
  const evo = evolvePath(lineP, LINE);
  const tip = getPointAtLength(LINE, Math.max(0.01, LENGTH * lineP));
  // Equity value under the moving tip, shown live in the header.
  const tipValue = tip ? Y_MIN + ((plotH - tip.y) / plotH) * (Y_MAX - Y_MIN) : 0;
  const liveValue = lineP >= 0.999 ? EQUITY[EQUITY.length - 1] : lineP > 0.0005 ? tipValue : 0;
  const liveP = ease(f, -6, 30);

  return (
    <Card
      style={{
        left: BOX.equity.x,
        top: BOX.equity.y,
        width: BOX.equity.w,
        height: BOX.equity.h,
        padding: `${PAD_Y}px ${PAD_X}px`,
        ...rise(appear, 20, 0.98),
      }}
    >
      <CardTitle
        right={
          <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
            <div style={{...rise(liveP, 6), display: 'flex', alignItems: 'baseline', gap: 8}}>
              <span style={{fontFamily: FONT.text, fontSize: 12.5, color: C.muted}}>Net P&L</span>
              <Num style={{fontSize: 15, fontWeight: 600, color: liveValue < 0 ? C.loss : C.accent}}>
                {fmtUsd(Math.round(liveValue * 100) / 100, {sign: true}).replace(/^\$/, '+$')}
              </Num>
            </div>
            <Segmented items={['1M', '3M', 'YTD', 'All']} active={1} />
          </div>
        }
      >
        Equity curve
      </CardTitle>

      <div style={{position: 'absolute', left: PAD_X, top: TOP, width: innerW, height: plotH + XLABEL_H}}>
        {TICKS.map((t) => (
          <Num
            key={t}
            style={{
              position: 'absolute',
              left: 0,
              width: AXIS_W - 14,
              textAlign: 'right',
              top: y(t) - 8,
              fontSize: 11,
              lineHeight: '16px',
              color: C.muted,
            }}
          >
            {fmtCompact(t)}
          </Num>
        ))}
        {X_LABELS.map(({i, label}, k) => (
          <Num
            key={label}
            style={{
              position: 'absolute',
              top: plotH + 10,
              left: AXIS_W + x(i) - (k === 0 ? 0 : k === X_LABELS.length - 1 ? 44 : 22),
              width: 44,
              textAlign: k === 0 ? 'left' : k === X_LABELS.length - 1 ? 'right' : 'center',
              fontSize: 11,
              color: C.muted,
            }}
          >
            {label}
          </Num>
        ))}

        <svg
          width={plotW}
          height={plotH}
          style={{position: 'absolute', left: AXIS_W, top: 0, overflow: 'visible'}}
        >
          <defs>
            <linearGradient id="equity-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.accent} stopOpacity={0.16} />
              <stop offset="100%" stopColor={C.accent} stopOpacity={0} />
            </linearGradient>
          </defs>

          {TICKS.filter((t) => t !== 0).map((t) => (
            <line key={t} x1={0} x2={plotW} y1={y(t)} y2={y(t)} stroke={C.grid} strokeDasharray="3 5" />
          ))}
          <line x1={0} x2={plotW} y1={y(0)} y2={y(0)} stroke={C.zero} strokeDasharray="5 5" />

          <path d={AREA} fill="url(#equity-fill)" opacity={areaP} />
          <path
            d={LINE}
            fill="none"
            stroke={C.accent}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray={evo.strokeDasharray}
            strokeDashoffset={evo.strokeDashoffset}
            opacity={lineP > 0.0005 ? 1 : 0}
          />

          {/* max drawdown marker */}
          <g opacity={troughP}>
            <circle cx={x(troughIndex)} cy={y(EQUITY[troughIndex])} r={3.5} fill={C.card} stroke={C.text2} strokeWidth={1.4} />
          </g>

          {lineP > 0.0005 && tip && (
            <g>
              <circle cx={tip.x} cy={tip.y} r={8} fill={alpha(C.accent, 0.16)} />
              <circle cx={tip.x} cy={tip.y} r={3.5} fill={C.accent} />
            </g>
          )}
        </svg>

        {/* drawdown label */}
        <div
          style={{
            ...rise(troughP, 6),
            position: 'absolute',
            left: AXIS_W + x(troughIndex) - 70,
            top: y(EQUITY[troughIndex]) + 14,
            width: 140,
            textAlign: 'center',
            fontFamily: FONT.text,
            fontSize: 11.5,
            color: C.muted,
          }}
        >
          Max drawdown <Num style={{color: C.loss, fontWeight: 600}}>{fmtUsd(-STATS.maxDd, {decimals: 0})}</Num>
        </div>

      </div>
    </Card>
  );
};
