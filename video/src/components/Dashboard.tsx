import type {ReactNode} from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {C, FONT, L, alpha} from '../theme';
import {DONE, mix, settle} from '../motion';
import {Header, Sidebar, Toolbar} from './Chrome';
import {KpiRow} from './KpiRow';
import {EquityCard} from './EquityCard';
import {TradesCard} from './TradesCard';
import {CalendarCard} from './CalendarCard';

export type Region = 'chrome' | 'kpi' | 'equity' | 'trades' | 'calendar';

export type DashState = {
  /** Frame of the intro build. DONE = fully built. */
  build: number;
  /** Fill frames per widget. IDLE = empty state, DONE = final state. */
  kpi: number;
  equity: number;
  trades: number;
  calendar: number;
  /** Opacity per region (1 = in focus / neutral). */
  dim: Record<Region, number>;
};

export const FULL: DashState = {
  build: DONE,
  kpi: DONE,
  equity: DONE,
  trades: DONE,
  calendar: DONE,
  dim: {chrome: 1, kpi: 1, equity: 1, trades: 1, calendar: 1},
};

const Layer = ({o, children}: {o: number; children: ReactNode}) => (
  <div style={{position: 'absolute', inset: 0, opacity: o}}>{children}</div>
);

export const Dashboard = ({s}: {s: DashState}) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      top: 0,
      width: L.width,
      height: L.height,
      background: C.bg,
      fontFamily: FONT.text,
      overflow: 'hidden',
    }}
  >
    <Layer o={s.dim.chrome}>
      <Sidebar b={s.build} />
      <Header b={s.build} />
      <Toolbar b={s.build} />
    </Layer>
    <Layer o={s.dim.kpi}>
      <KpiRow b={s.build} f={s.kpi} />
    </Layer>
    <Layer o={s.dim.equity}>
      <EquityCard b={s.build} f={s.equity} />
    </Layer>
    <Layer o={s.dim.trades}>
      <TradesCard b={s.build} f={s.trades} />
    </Layer>
    <Layer o={s.dim.calendar}>
      <CalendarCard b={s.build} f={s.calendar} />
    </Layer>
  </div>
);

/* ------------------------------------------------------------------ camera */

export type Framing = {cx: number; cy: number; z: number};

/** Slow push-in every scene gets: 1.00 → 1.04, eased in and out so cuts stay seamless. */
export const DRIFT = 1.04;

export const drift = (frame: number, duration: number) =>
  interpolate(frame, [0, duration], [1, DRIFT], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => 0.5 - Math.cos(Math.PI * t) / 2,
  });

/** End state of a scene, i.e. its framing after the drift. */
export const drifted = (f: Framing): Framing => ({...f, z: f.z * DRIFT});

/** Moves from `from` to `to` on a critically damped spring, then applies the scene drift. */
export const cameraAt = (frame: number, duration: number, from: Framing, to: Framing, moveFrames = 75): Framing => {
  const t = settle(frame, 0, moveFrames);
  return {
    cx: mix(from.cx, to.cx, t),
    cy: mix(from.cy, to.cy, t),
    z: Math.exp(mix(Math.log(from.z), Math.log(to.z), t)) * drift(frame, duration),
  };
};

export const dimAt = (frame: number, from: Region | 'none', to: Region | 'none', level = 0.38) => {
  const t = settle(frame, 0, 50);
  const target = (focus: Region | 'none', r: Region) => (focus === 'none' || focus === r ? 1 : level);
  const regions: Region[] = ['chrome', 'kpi', 'equity', 'trades', 'calendar'];
  return Object.fromEntries(regions.map((r) => [r, mix(target(from, r), target(to, r), t)])) as Record<Region, number>;
};

export const Stage = ({
  cam,
  appear = 1,
  children,
}: {
  cam: Framing;
  /** 0→1 entrance of the app window itself. */
  appear?: number;
  children: ReactNode;
}) => (
  <AbsoluteFill style={{background: C.stage}}>
    <AbsoluteFill
      style={{
        background: `radial-gradient(1200px 800px at 18% 0%, ${alpha('#fff1dc', 0.035)}, transparent 70%)`,
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: L.width,
        height: L.height,
        transformOrigin: '0 0',
        transform: `translate(${960 - cam.cx * cam.z}px, ${540 - cam.cy * cam.z}px) scale(${cam.z})`,
        borderRadius: 22,
        overflow: 'hidden',
        opacity: appear,
        boxShadow: `0 0 0 1px ${C.border2}, 0 50px 140px ${alpha('#000000', 0.55)}`,
      }}
    >
      {children}
    </div>
  </AbsoluteFill>
);
