import React from 'react';
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { T } from './theme';
import { D, ENTER, MOVE, lerp, prog } from './motion';
import { cameraAt } from './ui/Camera';
import { Glow } from './scenes/Intro';
import './fonts';
import { CameraFrame, type CamKey } from './ui/Camera';
import { Cursor, type CursorKey } from './ui/Cursor';
import { Caption } from './ui/Primitives';
import { Intro } from './scenes/Intro';
import { DashboardScene } from './scenes/DashboardScene';
import { LogTradeScene } from './scenes/LogTradeScene';
import { StatsScene } from './scenes/StatsScene';
import { ProgressScene } from './scenes/ProgressScene';
import { ShadowScene } from './scenes/ShadowScene';
import { CalmMentorScene } from './scenes/CalmMentorScene';
import { PropScene } from './scenes/PropScene';
import { OutroOverlay, OutroStage } from './scenes/Outro';

/* Eine Timeline mit Labels (Frames bei 30 fps) statt verteilter Delays */
export const L = { intro: 0, dash: 165, log: 450, stats: 690, progress: 930, shadow: 1110, calm: 1320, prop: 1530, outro: 1710, end: 1890 } as const;

/* Kamera: Maßstab und Blickpunkt in App-Koordinaten; Fahrten 800 ms */
const CAM: CamKey[] = [
  { f: 0, s: 1, x: 960, y: 540 },
  { f: L.dash + 15, s: 1.45, x: 700, y: 216, d: 24 },
  { f: L.dash + 85, s: 1.17, x: 1076, y: 430, d: 28 },
  { f: L.dash + 165, s: 1.17, x: 1076, y: 836, d: 28 },
  { f: L.dash + 245, s: 1, x: 960, y: 540, d: 28 },
  { f: L.log + 26, s: 1.18, x: 960, y: 540, d: 24 },
  { f: L.log + 198, s: 1, x: 960, y: 540, d: 20 },
  { f: L.stats + 6, s: 1.12, x: 1076, y: 600, d: 24 },
  { f: L.stats + 70, s: 1.17, x: 1076, y: 780, d: 24 },
  { f: L.stats + 108, s: 1.17, x: 1076, y: 720, d: 24 },
  { f: L.stats + 216, s: 1, x: 960, y: 540, d: 24 },
  { f: L.progress + 6, s: 1.15, x: 1076, y: 420, d: 24 },
  { f: L.progress + 56, s: 1.4, x: 700, y: 880, d: 24 },
  { f: L.progress + 156, s: 1, x: 960, y: 540, d: 24 },
  { f: L.shadow + 6, s: 1.12, x: 1076, y: 480, d: 24 },
  { f: L.shadow + 80, s: 1.17, x: 1076, y: 760, d: 24 },
  { f: L.shadow + 186, s: 1, x: 960, y: 540, d: 24 },
  { f: L.calm + 6, s: 1.1, x: 1076, y: 450, d: 24 },
  { f: L.calm + 106, s: 1.2, x: 1030, y: 540, d: 24 },
  { f: L.calm + 186, s: 1, x: 960, y: 540, d: 24 },
  { f: L.prop + 6, s: 1.12, x: 1076, y: 470, d: 24 },
  { f: L.prop + 156, s: 1, x: 960, y: 540, d: 24 },
];

/* Cursor: Stützpunkte in App-Koordinaten; die Klick-Frames entsprechen den Konstanten in den Szenen */
const CURSOR: CursorKey[] = [
  { f: L.log + 2, x: 1500, y: 640 }, { f: L.log + 22, x: 1821, y: 114 }, { f: L.log + 24, x: 1821, y: 114, click: true },
  { f: L.log + 48, x: 1821, y: 114 }, { f: L.log + 60, x: 1072, y: 330 }, { f: L.log + 62, x: 1072, y: 330, click: true },
  { f: L.log + 112, x: 1072, y: 330 }, { f: L.log + 126, x: 1234, y: 477 }, { f: L.log + 128, x: 1234, y: 477, click: true },
  { f: L.log + 132, x: 1234, y: 477 }, { f: L.log + 144, x: 572, y: 554 }, { f: L.log + 146, x: 572, y: 554, click: true },
  { f: L.log + 180, x: 572, y: 554 }, { f: L.log + 194, x: 1316, y: 837 }, { f: L.log + 196, x: 1316, y: 837, click: true },
  { f: L.log + 210, x: 1316, y: 837, hide: true },
  { f: L.stats + 88, x: 1300, y: 700 }, { f: L.stats + 104, x: 689, y: 485 }, { f: L.stats + 106, x: 689, y: 485, click: true }, { f: L.stats + 122, x: 689, y: 485, hide: true },
  { f: L.progress + 50, x: 700, y: 760 }, { f: L.progress + 66, x: 299, y: 829 }, { f: L.progress + 68, x: 299, y: 829, click: true },
  { f: L.progress + 74, x: 299, y: 829 }, { f: L.progress + 78, x: 299, y: 881 }, { f: L.progress + 80, x: 299, y: 881, click: true },
  { f: L.progress + 86, x: 299, y: 881 }, { f: L.progress + 90, x: 299, y: 933 }, { f: L.progress + 92, x: 299, y: 933, click: true },
  { f: L.progress + 98, x: 299, y: 933 }, { f: L.progress + 102, x: 299, y: 985 }, { f: L.progress + 104, x: 299, y: 985, click: true },
  { f: L.progress + 110, x: 299, y: 985 }, { f: L.progress + 114, x: 299, y: 1037 }, { f: L.progress + 116, x: 299, y: 1037, click: true },
  { f: L.progress + 132, x: 299, y: 1037, hide: true },
  { f: L.shadow + 90, x: 1500, y: 700 }, { f: L.shadow + 104, x: 1858, y: 883 }, { f: L.shadow + 106, x: 1858, y: 883, click: true },
  { f: L.shadow + 112, x: 1858, y: 883 }, { f: L.shadow + 120, x: 1858, y: 979 }, { f: L.shadow + 122, x: 1858, y: 979, click: true },
  { f: L.shadow + 140, x: 1858, y: 979, hide: true },
];

const CAPTIONS = [
  { no: '01', text: 'Dashboard: alle Kennzahlen auf einen Blick', start: L.dash + 15, end: L.dash + 275 },
  { no: '02', text: 'Trade loggen: Plan, Setup, Emotion, Screenshot', start: L.log + 12, end: L.log + 230 },
  { no: '03', text: 'Statistiken: 16 Kennzahlen, Fehlerkosten in Euro', start: L.stats + 12, end: L.stats + 230 },
  { no: '04', text: 'Fortschritt: Regeln abhaken, Serie halten', start: L.progress + 12, end: L.progress + 170 },
  { no: '05', text: 'Schatten-Ich: was Regelbrüche kosten', start: L.shadow + 12, end: L.shadow + 200 },
  { no: '06', text: 'Ruhepunkt: ruhig rein, sauber raus', start: L.calm + 12, end: L.calm + 92 },
  { no: '07', text: 'Mentor: fragt dein Journal, nicht dein Bauchgefühl', start: L.calm + 110, end: L.calm + 200 },
  { no: '08', text: 'Prop Firms: Regel-Engine, Puffer, Ampel', start: L.prop + 12, end: L.prop + 170 },
];

const Scene: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const { fps } = useVideoConfig();
  return <Sequence from={from} durationInFrames={to - from} premountFor={fps}>{children}</Sequence>;
};

/* Bühne: die App liegt eingerahmt auf Schwarz (1728 × 972 bei 0,9), darunter ein Band für die Bauchbinde */
const STAGE = { x: 96, y: 20, w: 1728, h: 972, scale: 0.9 } as const;

export const Main: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = cameraAt(frame, CAM);
  const stageIn = prog(frame, L.dash, D.big, ENTER);
  const push = lerp(1, 0.965, prog(frame, L.outro, 60, MOVE)); /* Auflösung: die Bühne tritt leicht zurück */
  /* Umgebung: Glühen hinter der Bühne läuft der Kamera mit 25 % entgegen */
  const envX = -(cam.tx * 0.25), envY = -(cam.ty * 0.25);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: stageIn * 0.9, translate: `${envX.toFixed(1)}px ${envY.toFixed(1)}px` }}>
        <Glow frame={frame} x={420} y={300} r={700} color="rgba(52,245,138,0.10)" opacity={1} />
        <Glow frame={frame} x={1560} y={860} r={640} color="rgba(139,124,246,0.09)" opacity={1} phase={2.5} />
      </div>
      <Scene from={L.intro} to={L.dash}><Intro dur={L.dash - L.intro} /></Scene>
      <div style={{ position: 'absolute', left: STAGE.x, top: STAGE.y, width: STAGE.w, height: STAGE.h, borderRadius: 22, overflow: 'hidden', border: `1px solid ${T.border}`, background: '#000', boxShadow: '0 40px 100px rgba(0,0,0,.6)', opacity: stageIn, scale: String(push), transformOrigin: '50% 50%' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transformOrigin: '0 0', scale: String(STAGE.scale) }}>
          <CameraFrame frame={frame} keys={CAM}>
            <Scene from={L.dash} to={L.log}><DashboardScene dur={L.log - L.dash} /></Scene>
            <Scene from={L.log} to={L.stats}><LogTradeScene dur={L.stats - L.log} /></Scene>
            <Scene from={L.stats} to={L.progress}><StatsScene dur={L.progress - L.stats} /></Scene>
            <Scene from={L.progress} to={L.shadow}><ProgressScene dur={L.shadow - L.progress} /></Scene>
            <Scene from={L.shadow} to={L.calm}><ShadowScene dur={L.calm - L.shadow} /></Scene>
            <Scene from={L.calm} to={L.prop}><CalmMentorScene dur={L.prop - L.calm} /></Scene>
            <Scene from={L.prop} to={L.outro}><PropScene dur={L.outro - L.prop} /></Scene>
            <Scene from={L.outro} to={L.end}><OutroStage dur={L.end - L.outro} /></Scene>
            <Cursor frame={frame} keys={CURSOR} />
          </CameraFrame>
        </div>
      </div>
      {CAPTIONS.map((c) => (frame >= c.start - 2 && frame <= c.end + 2 ? <Caption key={c.no} frame={frame} start={c.start} end={c.end} no={c.no} text={c.text} /> : null))}
      <Scene from={L.outro} to={L.end}><OutroOverlay dur={L.end - L.outro} /></Scene>
    </AbsoluteFill>
  );
};
