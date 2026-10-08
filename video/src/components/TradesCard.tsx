import {BOX, C, FONT, R, alpha} from '../theme';
import {ease, rise, settle} from '../motion';
import {RECENT_TRADES, type Trade} from '../data';
import {Button, Card, CardTitle, Num, fmtUsd, signed} from './Primitives';
import {IconChevronRight} from './Icons';

export const ROW_STAGGER = 4;
const ROW_IN = 42;
export const TRADES_DONE = (RECENT_TRADES.length - 1) * ROW_STAGGER + ROW_IN;

const NAMES: Record<string, string> = {
  NQ: 'Nasdaq 100',
  ES: 'S&P 500',
  YM: 'Dow 30',
  CL: 'Crude oil',
  GC: 'Gold',
};

const COLS = '1fr 58px 62px 92px 50px';
const ROW_H = 55;

const shortDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', {month: 'short', day: 'numeric', timeZone: 'UTC'});

const Badge = ({win}: {win: boolean}) => {
  const c = win ? C.accent : C.loss;
  return (
    <div
      style={{
        height: 22,
        width: 46,
        borderRadius: R.small,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: FONT.text,
        fontSize: 11.5,
        fontWeight: 600,
        color: c,
        background: alpha(c, 0.08),
        border: `1px solid ${alpha(c, 0.28)}`,
      }}
    >
      {win ? 'Win' : 'Loss'}
    </div>
  );
};

const Row = ({t, p, last}: {t: Trade; p: number; last: boolean}) => {
  const win = t.pnl > 0;
  return (
    <div
      style={{
        ...rise(p, 18),
        display: 'grid',
        gridTemplateColumns: COLS,
        alignItems: 'center',
        columnGap: 8,
        height: ROW_H,
        borderBottom: last ? 'none' : `1px solid ${C.border}`,
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 11, minWidth: 0}}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: R.small,
            background: C.surface,
            border: `1px solid ${C.border2}`,
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: FONT.num,
            fontSize: 11,
            fontWeight: 700,
            color: C.text,
            letterSpacing: 0.3,
          }}
        >
          {t.symbol}
        </div>
        <div style={{minWidth: 0}}>
          <div style={{fontFamily: FONT.text, fontSize: 13.5, fontWeight: 600, color: C.text}}>{NAMES[t.symbol]}</div>
          <div style={{fontFamily: FONT.text, fontSize: 12, color: C.muted, marginTop: 1}}>
            {t.side} · <Num>{t.time}</Num>
          </div>
        </div>
      </div>
      <Num style={{fontSize: 12.5, color: C.text2}}>{shortDate(t.date)}</Num>
      <Num style={{fontSize: 12.5, color: C.text2, textAlign: 'right'}}>{signed(t.r)}R</Num>
      <Num style={{fontSize: 13.5, fontWeight: 600, color: win ? C.accent : C.loss, textAlign: 'right'}}>
        {fmtUsd(t.pnl)}
      </Num>
      <div style={{display: 'flex', justifyContent: 'flex-end'}}>
        <Badge win={win} />
      </div>
    </div>
  );
};

export const TradesCard = ({b, f}: {b: number; f: number}) => {
  const appear = settle(b, 56, 50);
  const head = ease(f, -10, 30);
  return (
    <Card
      style={{
        left: BOX.trades.x,
        top: BOX.trades.y,
        width: BOX.trades.w,
        height: BOX.trades.h,
        padding: '18px 20px',
        ...rise(appear, 20, 0.98),
      }}
    >
      <CardTitle
        right={
          <Button variant="ghost" style={{height: 30, padding: '0 4px 0 8px', fontSize: 12.5, gap: 4}}>
            View all <IconChevronRight size={14} color={C.text2} />
          </Button>
        }
      >
        Recent trades
      </CardTitle>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: COLS,
          columnGap: 8,
          marginTop: 16,
          height: 30,
          alignItems: 'center',
          borderBottom: `1px solid ${C.border}`,
          fontFamily: FONT.text,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 0.8,
          color: C.muted,
          textTransform: 'uppercase',
          opacity: 0.6 + 0.4 * head,
        }}
      >
        <span>Instrument</span>
        <span>Date</span>
        <span style={{textAlign: 'right'}}>R</span>
        <span style={{textAlign: 'right'}}>P&L</span>
        <span style={{textAlign: 'right'}}>Result</span>
      </div>

      <div>
        {RECENT_TRADES.map((t, i) => (
          <Row key={t.id} t={t} p={ease(f, i * ROW_STAGGER, ROW_IN)} last={i === RECENT_TRADES.length - 1} />
        ))}
      </div>
    </Card>
  );
};
