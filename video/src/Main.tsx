import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import './fonts';
import { T } from './theme';
import { D, ENTER, MOVE, lerp, prog } from './motion';
import { CameraFrame, cameraAt, type CamKey } from './ui/Camera';
import { Cursor, type CursorKey } from './ui/Cursor';
import { Caption } from './ui/Primitives';
import { FootageStage } from './ui/FootageStage';
import { Intro, Glow } from './scenes/Intro';
import { OutroOverlay } from './scenes/Outro';
import { INTRO, TOTAL, allEvents, tlEv } from './footage';
import { C } from './copy';

/* Kamera: Maßstab und Blickpunkt in App-Koordinaten; Fahrten 800 ms. Zeiten kommen aus dem Ereignis-Log der Aufnahme. */
const CAM: CamKey[] = [
  { f: 0, s: 1, x: 960, y: 540 },
  { f: tlEv('dash-enter', 1.0), s: 1.35, x: 1076, y: 236, d: 24 },
  { f: tlEv('dash-enter', 2.2), s: 1.17, x: 1076, y: 500, d: 28 },
  { f: tlEv('open-editor', -0.5), s: 1, x: 960, y: 540, d: 20 },
  { f: tlEv('open-editor', 0.5), s: 1.12, x: 760, y: 540, d: 24 },
  { f: tlEv('save-trade', 0.8), s: 1, x: 960, y: 540, d: 20 },
  { f: tlEv('trade-saved', 0.5), s: 1.35, x: 1076, y: 236, d: 24 },
  { f: tlEv('nav-stats', -0.5), s: 1, x: 960, y: 540, d: 20 },
  { f: tlEv('nav-stats', 0.5), s: 1.12, x: 1076, y: 600, d: 24 },
  { f: tlEv('tab-mistakes', 0.4), s: 1.17, x: 1076, y: 720, d: 24 },
  { f: tlEv('nav-progress', -0.5), s: 1, x: 960, y: 540, d: 20 },
  { f: tlEv('nav-progress', 0.5), s: 1.15, x: 1076, y: 430, d: 24 },
  { f: tlEv('scroll-progress', 0.9), s: 1.3, x: 760, y: 540, d: 24 },
  { f: tlEv('nav-shadow', -0.5), s: 1, x: 960, y: 540, d: 20 },
  { f: tlEv('nav-shadow', 0.5), s: 1.12, x: 1076, y: 480, d: 24 },
  { f: tlEv('toggle-dailyLoss', -0.9), s: 1.17, x: 1076, y: 760, d: 24 },
  { f: tlEv('nav-ruhepunkt', -0.5), s: 1, x: 960, y: 540, d: 20 },
  { f: tlEv('nav-ruhepunkt', 0.6), s: 1.1, x: 1076, y: 470, d: 24 },
  { f: tlEv('nav-mentor', -0.5), s: 1, x: 960, y: 540, d: 20 },
  { f: tlEv('nav-mentor', 0.6), s: 1.15, x: 1076, y: 560, d: 24 },
  { f: tlEv('nav-prop', -0.5), s: 1, x: 960, y: 540, d: 20 },
  { f: tlEv('nav-prop', 0.6), s: 1.12, x: 1076, y: 470, d: 24 },
  { f: tlEv('nav-dashboard', -0.5), s: 1, x: 960, y: 540, d: 20 },
];

/* Cursor: jeder Klick aus dem Ereignis-Log; Anfahrt 12 Frames vorher mit Bogen */
const SKIP = new Set(['mentor-send', 'mentor-sent', 'mentor-reply', 'trade-saved']);
const CURSOR: CursorKey[] = (() => {
  const keys: CursorKey[] = [{ f: tlEv('dash-enter', 2.0), x: 1500, y: 640 }];
  for (const e of allEvents) {
    if (e.x == null || e.y == null || SKIP.has(e.name)) continue;
    const f = tlEv(e.name); const prev = keys[keys.length - 1];
    if (f - 12 > prev.f) keys.push({ f: f - 12, x: prev.x, y: prev.y });
    keys.push({ f: Math.max(prev.f + 1, f - 1), x: e.x, y: e.y }, { f: Math.max(prev.f + 2, f), x: e.x, y: e.y, click: true });
  }
  const last = keys[keys.length - 1]; keys.push({ f: tlEv('nav-dashboard', 0.6), x: last.x, y: last.y, hide: true });
  return keys;
})();

const CAP_TIMES: [string, number, string, number][] = [
  ['dash-enter', 0.6, 'open-editor', -0.4], ['open-editor', 0.3, 'trade-saved', 1.6], ['nav-stats', 0.4, 'nav-progress', -0.3], ['nav-progress', 0.4, 'nav-shadow', -0.3],
  ['nav-shadow', 0.4, 'nav-ruhepunkt', -0.3], ['nav-ruhepunkt', 0.4, 'nav-mentor', -0.3], ['nav-mentor', 0.4, 'nav-prop', -0.3], ['nav-prop', 0.4, 'nav-dashboard', -0.3],
];
const CAPTIONS = C.captions.map((c, i) => ({ ...c, start: tlEv(CAP_TIMES[i][0], CAP_TIMES[i][1]), end: tlEv(CAP_TIMES[i][2], CAP_TIMES[i][3]) }));

/* Bühne: die App liegt eingerahmt auf Schwarz (1728 × 972 bei 0,9), darunter ein Band für die Bauchbinde */
const STAGE = { x: 96, y: 20, w: 1728, h: 972, scale: 0.9 } as const;
export const OUTRO_AT = tlEv('nav-dashboard', 1.0);

export const Main: React.FC = () => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const cam = cameraAt(frame, CAM);
  const stageIn = prog(frame, INTRO, D.big, ENTER);
  const push = lerp(1, 0.965, prog(frame, OUTRO_AT, 60, MOVE));
  const envX = -(cam.tx * 0.25), envY = -(cam.ty * 0.25);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: stageIn * 0.9, translate: `${envX.toFixed(1)}px ${envY.toFixed(1)}px` }}>
        <Glow frame={frame} x={420} y={300} r={700} color="rgba(52,245,138,0.10)" opacity={1} />
        <Glow frame={frame} x={1560} y={860} r={640} color="rgba(139,124,246,0.09)" opacity={1} phase={2.5} />
      </div>
      <Sequence from={0} durationInFrames={INTRO} premountFor={fps}><Intro dur={INTRO} /></Sequence>
      <div style={{ position: 'absolute', left: STAGE.x, top: STAGE.y, width: STAGE.w, height: STAGE.h, borderRadius: 22, overflow: 'hidden', border: `1px solid ${T.border}`, background: '#000', boxShadow: '0 40px 100px rgba(0,0,0,.6)', opacity: stageIn, scale: String(lerp(0.96, 1, stageIn) * push), translate: `0px ${((1 - stageIn) * 36).toFixed(1)}px`, transformOrigin: '50% 60%' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transformOrigin: '0 0', scale: String(STAGE.scale) }}>
          <CameraFrame frame={frame} keys={CAM}>
            <FootageStage />
            <Cursor frame={frame} keys={CURSOR} />
          </CameraFrame>
        </div>
      </div>
      {CAPTIONS.map((c) => (frame >= c.start - 2 && frame <= c.end + 2 ? <Caption key={c.no} frame={frame} start={c.start} end={c.end} no={c.no} text={c.text} /> : null))}
      <Sequence from={OUTRO_AT} durationInFrames={TOTAL - OUTRO_AT} premountFor={fps}><OutroOverlay dur={TOTAL - OUTRO_AT} /></Sequence>
    </AbsoluteFill>
  );
};
