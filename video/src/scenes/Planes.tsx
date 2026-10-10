/* Ganze App-Seiten schräg im Raum: Dashboard (16–19,5 s) und Prop Firms (45–48 s) */
import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame } from 'remotion';
import { lerp, OUT, pop, prog, sec, SIG } from '../anim';
import { cap, img, Rect } from '../cap';
import { APP_BG, big } from '../theme';
import { Bg } from '../ui/Bg';
import { BlurText } from '../ui/Text';

type Pose = { cx: number; cy: number; rx: number; rz: number; s: number; ty?: number };
const lerpPose = (a: Pose, b: Pose, t: number): Pose => ({ cx: lerp(a.cx, b.cx, t), cy: lerp(a.cy, b.cy, t), rx: lerp(a.rx, b.rx, t), rz: lerp(a.rz, b.rz, t), s: lerp(a.s, b.s, t), ty: lerp(a.ty ?? 0, b.ty ?? 0, t) });

/* Seite (w × h in App-Pixeln) mit dem Punkt (cx, cy) in Bildmitte, geneigt um rx und gedreht um rz */
const Plane: React.FC<{ p: Pose; w: number; h: number; src: string; opacity?: number; children?: React.ReactNode }> = ({ p, w, h, src, opacity = 1, children }) => (
  <AbsoluteFill style={{ perspective: 2600, opacity }}>
    <div style={{ position: 'absolute', left: 0, top: 0, width: w, height: h, transformOrigin: '0 0', transformStyle: 'preserve-3d',
      transform: `translate(960px, ${540 + (p.ty ?? 0)}px) rotateX(${p.rx}deg) rotateZ(${p.rz}deg) scale(${p.s}) translate(${-p.cx}px, ${-p.cy}px)` }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: 18, overflow: 'hidden', boxShadow: '0 80px 120px -40px rgba(6,40,20,0.55), 0 0 0 1px rgba(255,255,255,0.06)' }}>
        <Img src={src} style={{ width: w, height: h, display: 'block' }} />
      </div>
      {children}
    </div>
  </AbsoluteFill>
);

/* Ein freigestelltes Element hebt sich aus der Seite: darunter bleibt eine leere Mulde mit Schatten */
const Lift: React.FC<{ r: Rect; src: string; lift: number; z?: number }> = ({ r, src, lift, z = 46 }) => (
  <>
    <div style={{ position: 'absolute', left: r.x + 2, top: r.y + 2, width: r.w - 4, height: r.h - 4, borderRadius: 14, background: APP_BG, opacity: lift > 0.01 ? 1 : 0 }} />
    <div style={{ position: 'absolute', left: r.x + 6, top: r.y + 10, width: r.w - 12, height: r.h - 12, borderRadius: 16, background: 'rgba(0,0,0,0.55)', filter: 'blur(16px)', opacity: Math.min(1, lift) * 0.8 }} />
    <Img src={src} style={{ position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, transform: `translateZ(${(lift * z).toFixed(2)}px)` }} />
  </>
);

export const Dashboard3D: React.FC = () => {
  const f = useCurrentFrame();
  const t = prog(f, 0, sec(3.6), SIG);
  const p = lerpPose({ cx: 690, cy: 470, rx: 32, rz: -13, s: 0.98, ty: 120 }, { cx: 640, cy: 420, rx: 21, rz: -7, s: 1.05, ty: 120 }, t);
  return (
    <AbsoluteFill>
      <Bg f={f} kind="mint" />
      <Plane p={p} w={1440} h={900} src={img('dash.jpg')} opacity={prog(f, 0, sec(0.3), OUT)}>
        {cap.tiles.map((r, i) => <Lift key={i} r={r} src={img(`tile-${i}.png`)} lift={pop(f, sec(0.6 + i * 0.1), { damping: 14 })} z={90} />)}
      </Plane>
      <div style={{ position: 'absolute', left: 120, top: 96, ...big(70), lineHeight: 1.06 }}>
        <BlurText f={f} text="Built for" start={sec(0.45)} stagger={0.08} />{'\n'}
        <BlurText f={f} text="serious traders" start={sec(0.62)} stagger={0.08} />
      </div>
    </AbsoluteFill>
  );
};

export const Prop: React.FC = () => {
  const f = useCurrentFrame();
  const t = prog(f, 0, sec(3.4), SIG);
  const c = cap.propCard; const ccx = c.x + c.w / 2, ccy = c.y + c.h / 2;
  const p = lerpPose({ cx: 760, cy: 470, rx: 28, rz: 11, s: 1.0, ty: 40 }, { cx: lerp(760, ccx, 0.75), cy: lerp(470, ccy, 0.75), rx: 16, rz: 6, s: 1.32, ty: 20 }, t);
  return (
    <AbsoluteFill>
      <Bg f={f} kind="mint" />
      <Plane p={p} w={1440} h={900} src={img('prop.jpg')}>
        <Lift r={c} src={img('prop-topstep.png')} lift={pop(f, sec(0.7), { damping: 15 })} z={70} />
      </Plane>
    </AbsoluteFill>
  );
};
