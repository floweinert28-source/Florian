import {BOX, L} from './theme';
import type {Framing} from './components/Dashboard';

const center = (b: {x: number; y: number; w: number; h: number}) => ({cx: b.x + b.w / 2, cy: b.y + b.h / 2});

// Camera framings in dashboard-canvas coordinates. Zoom values leave room for the 4 % drift.
export const FRAME = {
  overview: {cx: L.width / 2, cy: L.height / 2, z: 0.88},
  kpi: {cx: BOX.kpi.x + BOX.kpi.w / 2, cy: BOX.kpi.y + 230, z: 1.04},
  equity: {...center(BOX.equity), z: 1.55},
  trades: {cx: 1250, cy: BOX.trades.y + BOX.trades.h / 2, z: 1.17},
  calendar: {...center(BOX.calendar), z: 1.55},
  outro: {cx: L.width / 2, cy: L.height / 2, z: 0.66},
} satisfies Record<string, Framing>;
