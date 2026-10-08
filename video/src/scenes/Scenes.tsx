import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FRAME} from '../camera';
import {C, FONT} from '../theme';
import {IDLE, ease, mix, rise, settle} from '../motion';
import {Dashboard, FULL, Stage, cameraAt, dimAt, drift, drifted} from '../components/Dashboard';

export const DUR = {
  intro: 210,
  kpi: 230,
  equity: 290,
  trades: 230,
  calendar: 225,
  outro: 300,
} as const;

// Each widget starts filling a beat after the camera starts moving towards it.
const LEAD = 24;

/* 1 — the grid builds itself */
export const IntroScene = () => {
  const frame = useCurrentFrame();
  const base = cameraAt(frame, DUR.intro, FRAME.overview, FRAME.overview);
  const win = settle(frame, 0, 50);
  const cam = {...base, z: base.z * mix(0.98, 1, win)};
  return (
    <Stage cam={cam} appear={win}>
      <Dashboard
        s={{...FULL, build: frame - 12, kpi: IDLE, equity: IDLE, trades: IDLE, calendar: IDLE}}
      />
    </Stage>
  );
};

/* 2 — KPI values count up */
export const KpiScene = () => {
  const frame = useCurrentFrame();
  const cam = cameraAt(frame, DUR.kpi, drifted(FRAME.overview), FRAME.kpi);
  return (
    <Stage cam={cam}>
      <Dashboard
        s={{
          ...FULL,
          kpi: frame - LEAD - 10,
          equity: IDLE,
          trades: IDLE,
          calendar: IDLE,
          dim: dimAt(frame, 'none', 'kpi'),
        }}
      />
    </Stage>
  );
};

/* 3 — the equity curve draws itself, then the area fades in */
export const EquityScene = () => {
  const frame = useCurrentFrame();
  const cam = cameraAt(frame, DUR.equity, drifted(FRAME.kpi), FRAME.equity, 85);
  return (
    <Stage cam={cam}>
      <Dashboard
        s={{...FULL, equity: frame - 50, trades: IDLE, calendar: IDLE, dim: dimAt(frame, 'kpi', 'equity')}}
      />
    </Stage>
  );
};

/* 4 — recent trades slide in */
export const TradesScene = () => {
  const frame = useCurrentFrame();
  const cam = cameraAt(frame, DUR.trades, drifted(FRAME.equity), FRAME.trades, 80);
  return (
    <Stage cam={cam}>
      <Dashboard s={{...FULL, trades: frame - LEAD, calendar: IDLE, dim: dimAt(frame, 'equity', 'trades')}} />
    </Stage>
  );
};

/* 5 — the P&L calendar fills day by day */
export const CalendarScene = () => {
  const frame = useCurrentFrame();
  const cam = cameraAt(frame, DUR.calendar, drifted(FRAME.trades), FRAME.calendar, 80);
  return (
    <Stage cam={cam}>
      <Dashboard s={{...FULL, calendar: frame - LEAD, dim: dimAt(frame, 'trades', 'calendar')}} />
    </Stage>
  );
};

/* 6 — pull back to the whole product, then the name */
export const OutroScene = () => {
  const frame = useCurrentFrame();
  const pull = 130;
  const t = settle(frame, 0, pull);
  const from = drifted(FRAME.calendar);
  const cam = {
    cx: mix(from.cx, FRAME.outro.cx, t),
    cy: mix(from.cy, FRAME.outro.cy, t),
    z: Math.exp(mix(Math.log(from.z), Math.log(FRAME.outro.z), t)),
  };
  const out = ease(frame, pull + 10, 50);
  const mark = ease(frame, pull + 26, 60);
  const markDrift = drift(frame - pull, DUR.outro - pull);

  return (
    <AbsoluteFill style={{background: C.stage}}>
      <AbsoluteFill style={{opacity: 1 - out, transform: `scale(${mix(1, 0.98, out)})`}}>
        <Stage cam={cam}>
          <Dashboard s={{...FULL, dim: dimAt(frame, 'calendar', 'none')}} />
        </Stage>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${markDrift})`,
        }}
      >
        <div style={{...rise(mark, 16), display: 'flex', alignItems: 'center'}}>
          <div
            style={{
              fontFamily: FONT.text,
              fontWeight: 700,
              fontSize: 78,
              letterSpacing: 15,
              color: C.text,
              lineHeight: 1,
              marginRight: -15,
            }}
          >
            JOURNALYST
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const SCENES = [
  {id: 'S1-Intro', component: IntroScene, duration: DUR.intro},
  {id: 'S2-KPIs', component: KpiScene, duration: DUR.kpi},
  {id: 'S3-EquityCurve', component: EquityScene, duration: DUR.equity},
  {id: 'S4-Trades', component: TradesScene, duration: DUR.trades},
  {id: 'S5-Calendar', component: CalendarScene, duration: DUR.calendar},
  {id: 'S6-Outro', component: OutroScene, duration: DUR.outro},
] as const;
