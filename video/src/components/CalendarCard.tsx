import {interpolateColors} from 'remotion';
import {BOX, C, FONT, R, alpha} from '../theme';
import {ease, rise, settle} from '../motion';
import {CAL_DAYS, CAL_NET, type Day} from '../data';
import {Card, CardTitle, Num, fmtUsd} from './Primitives';
import {IconChevronLeft, IconChevronRight} from './Icons';

export const DAY_STAGGER = 3;
const DAY_IN = 30;

const GAP = 8;
const PAD_X = 20;
const PAD_Y = 18;
const innerW = BOX.calendar.w - PAD_X * 2;
const COL_W = (innerW - GAP * 5) / 6;
const GRID_TOP = PAD_Y + 32 + 14 + 22;
const ROW_H = (BOX.calendar.h - GRID_TOP - PAD_Y - GAP * 4) / 5;

// September 2026: Mon Aug 31 … Fri Oct 2, weekdays only.
type Cell = {date: string; inMonth: boolean; day?: Day; holiday?: boolean};

const WEEKS: Cell[][] = Array.from({length: 5}, (_, w) =>
  Array.from({length: 5}, (_, d) => {
    const dt = new Date(Date.UTC(2026, 7, 31 + w * 7 + d, 12));
    const date = dt.toISOString().slice(0, 10);
    return {
      date,
      inMonth: date.startsWith('2026-09'),
      day: CAL_DAYS.find((x) => x.date === date),
      holiday: date === '2026-09-07',
    };
  }),
);

// Order in which tiles fill: chronological trading days of the month.
const ORDER = new Map(CAL_DAYS.map((d, i) => [d.date, i]));
export const CALENDAR_DONE = (CAL_DAYS.length - 1) * DAY_STAGGER + DAY_IN;

const maxAbs = Math.max(...CAL_DAYS.map((d) => Math.abs(d.pnl)));

const Tile = ({cell, f}: {cell: Cell; f: number}) => {
  const idx = ORDER.get(cell.date);
  const p = idx === undefined ? 0 : ease(f, idx * DAY_STAGGER, DAY_IN);
  const day = cell.day;
  const pnl = day?.pnl ?? 0;
  const traded = !!day && day.trades > 0;
  const c = pnl >= 0 ? C.accent : C.loss;
  const strength = traded ? 0.04 + 0.1 * Math.sqrt(Math.abs(pnl) / maxAbs) : 0;
  const dateNum = Number(cell.date.slice(8));

  return (
    <div
      style={{
        position: 'relative',
        width: COL_W,
        height: ROW_H,
        borderRadius: R.small + 1,
        boxSizing: 'border-box',
        background: C.surface,
        border: `1px solid ${C.border}`,
        opacity: cell.inMonth ? 1 : 0.45,
        overflow: 'hidden',
      }}
    >
      {traded && (
        <div
          style={{
            position: 'absolute',
            inset: -1,
            borderRadius: R.small + 1,
            background: alpha(c, strength),
            border: `1px solid ${alpha(c, 0.12 + strength)}`,
            opacity: p,
          }}
        />
      )}
      <div style={{position: 'absolute', left: 10, top: 7, display: 'flex', gap: 6, alignItems: 'baseline'}}>
        <Num
          style={{
            fontSize: 11.5,
            fontWeight: 600,
            color: traded ? interpolateColors(p, [0, 1], [C.muted, C.text2]) : C.muted,
          }}
        >
          {dateNum}
        </Num>
      </div>
      {traded && (
        <Num
          style={{
            ...rise(ease(f, (idx ?? 0) * DAY_STAGGER + 4, DAY_IN), 8),
            position: 'absolute',
            right: 10,
            top: 7,
            fontSize: 11,
            color: C.muted,
          }}
        >
          {day.trades} {day.trades === 1 ? 'trade' : 'trades'}
        </Num>
      )}
      <div style={{position: 'absolute', left: 10, bottom: 7}}>
        {traded ? (
          <Num style={{...rise(ease(f, (idx ?? 0) * DAY_STAGGER + 2, DAY_IN), 8), fontSize: 14, fontWeight: 600, color: c}}>
            {fmtUsd(pnl)}
          </Num>
        ) : cell.inMonth ? (
          <span style={{fontFamily: FONT.text, fontSize: 11.5, color: C.muted, opacity: 0.8}}>
            {cell.holiday ? 'Market closed' : 'No trades'}
          </span>
        ) : null}
      </div>
    </div>
  );
};

const WeekTile = ({week, n, f}: {week: Cell[]; n: number; f: number}) => {
  const days = week.filter((c) => c.day && c.day.trades > 0 && c.inMonth);
  const total = days.reduce((s, c) => s + (c.day?.pnl ?? 0), 0);
  const lastIdx = Math.max(-1, ...days.map((c) => ORDER.get(c.date) ?? -1));
  const p = lastIdx < 0 ? 0 : ease(f, lastIdx * DAY_STAGGER + 10, DAY_IN);
  return (
    <div
      style={{
        position: 'relative',
        width: COL_W,
        height: ROW_H,
        borderRadius: R.small + 1,
        boxSizing: 'border-box',
        border: `1px solid ${C.border}`,
        background: C.card,
      }}
    >
      <span style={{position: 'absolute', left: 10, top: 7, fontFamily: FONT.text, fontSize: 11.5, color: C.muted}}>
        Week {n}
      </span>
      <div style={{position: 'absolute', left: 10, bottom: 7}}>
        <Num style={{...rise(p, 8), fontSize: 14, fontWeight: 600, color: total >= 0 ? C.accent : C.loss}}>
          {fmtUsd(total)}
        </Num>
      </div>
    </div>
  );
};

export const CalendarCard = ({b, f}: {b: number; f: number}) => {
  const appear = settle(b, 60, 50);
  const totalP = ease(f, 0, CALENDAR_DONE + 10);
  const totalColor = interpolateColors(totalP, [0, 0.1], [C.text, C.accent]);
  return (
    <Card
      style={{
        left: BOX.calendar.x,
        top: BOX.calendar.y,
        width: BOX.calendar.w,
        height: BOX.calendar.h,
        padding: `${PAD_Y}px ${PAD_X}px`,
        ...rise(appear, 20, 0.98),
      }}
    >
      <CardTitle
        right={
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
            <span style={{fontFamily: FONT.text, fontSize: 12.5, color: C.muted}}>
              Month{' '}
              <Num style={{fontSize: 14, fontWeight: 600, color: totalColor, marginLeft: 4}}>
                {fmtUsd(CAL_NET * totalP, {sign: false}).replace(/^\$/, '+$')}
              </Num>
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                height: 30,
                padding: '0 6px',
                borderRadius: R.button,
                border: `1px solid ${C.border}`,
                background: C.card,
              }}
            >
              <IconChevronLeft size={14} color={C.muted} />
              <span style={{fontFamily: FONT.text, fontSize: 12.5, fontWeight: 600, color: C.text, width: 104, textAlign: 'center'}}>
                September 2026
              </span>
              <IconChevronRight size={14} color={C.muted} />
            </div>
          </div>
        }
      >
        P&L calendar
      </CardTitle>

      <div
        style={{
          position: 'absolute',
          left: PAD_X,
          top: GRID_TOP - 22,
          display: 'flex',
          gap: GAP,
          fontFamily: FONT.text,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 0.8,
          color: C.muted,
          textTransform: 'uppercase',
        }}
      >
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Week'].map((d) => (
          <div key={d} style={{width: COL_W, paddingLeft: 10, boxSizing: 'border-box'}}>
            {d}
          </div>
        ))}
      </div>

      <div style={{position: 'absolute', left: PAD_X, top: GRID_TOP, display: 'flex', flexDirection: 'column', gap: GAP}}>
        {WEEKS.map((week, w) => (
          <div key={w} style={{display: 'flex', gap: GAP}}>
            {week.map((cell) => (
              <Tile key={cell.date} cell={cell} f={f} />
            ))}
            <WeekTile week={week} n={w + 1} f={f} />
          </div>
        ))}
      </div>
    </Card>
  );
};
