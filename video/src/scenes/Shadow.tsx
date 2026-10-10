/* 33–45 s: „{ price }“, Shadow Self mit Zähler und sich zeichnenden Linien, „[ what discipline is worth ]“ */
import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame } from 'remotion';
import { evolvePath } from '@remotion/paths';
import { IN, lerp, OUT, pop, prog, sec, SIG, zoomLerp } from '../anim';
import { cap, img } from '../cap';
import { big, GREEN, GREEN_D } from '../theme';
import { Bg } from '../ui/Bg';
import { BlurText, useBox } from '../ui/Text';

export const Price: React.FC = () => {
  const f = useCurrentFrame();
  const [pRef, p] = useBox<HTMLSpanElement>();
  const open = prog(f, sec(0.65), sec(0.65), SIG); const half = p ? p.w / 2 + 18 : 120;
  return (
    <AbsoluteFill data-root style={{ background: '#fff', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ ...big(96), display: 'flex', alignItems: 'baseline' }}>
        <BlurText f={f} text="Every broken rule has a" start={sec(0.3)} stagger={0.06} />
        <span style={{ display: 'inline-block', marginLeft: '0.32em', color: GREEN_D, opacity: prog(f, sec(0.6), sec(0.2)), transform: `translateX(${lerp(half, 0, open)}px)` }}>{'{'}</span>
        <span ref={pRef} style={{ display: 'inline-block', margin: '0 0.14em', color: GREEN_D }}>
          <BlurText f={f} text="price" by="letter" start={sec(0.82)} stagger={0.05} dur={0.6} scaleFrom={0.85} color={GREEN_D} />
        </span>
        <span style={{ display: 'inline-block', color: GREEN_D, opacity: prog(f, sec(0.6), sec(0.2)), transform: `translateX(${lerp(-half, 0, open)}px)` }}>{'}'}</span>
      </div>
    </AbsoluteFill>
  );
};

/* Kachel „Discipline cost“ zählt hoch, „Actual“ und „Shadow Self“ daneben, darunter zeichnen sich beide Kurven */
const usd = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const ShadowSelf: React.FC = () => {
  const f = useCurrentFrame();
  const TS = 1.5; const tw = cap.shTile.w * TS, gap = 36; const x0 = 960 - (3 * tw + 2 * gap) / 2;
  const ch = cap.shChart; const CS = 1.15; const cx = 960 - (ch.w * CS) / 2, cy = 410;
  const enter = prog(f, sec(0.15), sec(0.6), OUT);
  const draw = prog(f, sec(0.9), sec(2.6), SIG);
  const pl = ch.plot; const crop = { x: pl.x - 12, y: pl.y - 16, w: pl.w + 24, h: pl.h + 32 };
  const v = cap.shTile.val; const target = parseFloat(v.text.replace(/[^0-9.]/g, ''));
  const count = target * prog(f, sec(1.0), sec(2.1), OUT);
  const push = zoomLerp(1, 1.06, prog(f, 0, sec(5.3), SIG)) * zoomLerp(1, 1.3, prog(f, sec(5.45), sec(0.7), IN));
  return (
    <AbsoluteFill>
      <Bg f={f} kind="mint" />
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <div style={{ position: 'absolute', left: cx, top: cy, width: ch.w, height: ch.h, transformOrigin: '0 0', opacity: enter, transform: `translateY(${lerp(50, 0, enter)}px) scale(${CS})` }}>
          <div style={{ position: 'absolute', left: 4, top: 4, right: 4, bottom: 4, borderRadius: 16, boxShadow: '0 60px 110px -30px rgba(6,40,20,0.5)' }} />
          <Img src={img('sh-chart-blank.png')} style={{ position: 'absolute', width: ch.w, height: ch.h }} />
          <div style={{ position: 'absolute', left: crop.x, top: crop.y, width: crop.w * draw, height: crop.h, overflow: 'hidden' }}>
            <Img src={img('sh-chart.png')} style={{ position: 'absolute', left: -crop.x, top: -crop.y, width: ch.w, height: ch.h }} />
          </div>
        </div>
        {[0, 1, 2].map((i) => {
          const s = pop(f, sec(0.45 + i * 0.12), { damping: 14 }); const a = prog(f, sec(0.45 + i * 0.12), sec(0.3), OUT);
          return (
            <div key={i} style={{ position: 'absolute', left: x0 + i * (tw + gap), top: 175, width: cap.shTile.w, height: cap.shTile.h, transformOrigin: '0 0', opacity: a, transform: `translateY(${lerp(30, 0, s)}px) scale(${TS * lerp(0.9, 1, s)})` }}>
              <div style={{ position: 'absolute', left: 4, top: 4, right: 4, bottom: 4, borderRadius: 14, boxShadow: '0 40px 70px -24px rgba(6,40,20,0.5)' }} />
              <Img src={img(i === 0 ? 'sh-tile-blank.png' : `sh-tile-${i}.png`)} style={{ position: 'absolute', width: cap.shTile.w, height: cap.shTile.h }} />
              {i === 0 ? <div style={{ position: 'absolute', left: v.x, top: v.y, height: v.h, fontFamily: v.fontFamily, fontSize: v.fontSize, fontWeight: Number(v.fontWeight), letterSpacing: v.letterSpacing, lineHeight: v.lineHeight, color: v.color, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{usd(count)}</div> : null}
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* Eckige Klammern zeichnen sich und öffnen sich bis an die Ränder des Satzes */
export const Worth: React.FC = () => {
  const f = useCurrentFrame();
  const [tRef, tb] = useBox<HTMLSpanElement>();
  const open = prog(f, sec(0.85), sec(0.75), SIG); const draw = prog(f, sec(0.75), sec(0.6), OUT);
  const half = tb ? tb.w / 2 + 46 : 500; const bh = 128; const arm = 30;
  const left = `M ${arm} 0 H 0 V ${bh} H ${arm}`, right = `M 0 0 H ${arm} V ${bh} H 0`;
  const eL = evolvePath(draw, left), eR = evolvePath(draw, right);
  const push = zoomLerp(1, 1.06, prog(f, 0, sec(4), SIG));
  return (
    <AbsoluteFill data-root>
      <Bg f={f} kind="deep" />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', transform: `scale(${push})` }}>
        <div style={{ ...big(58, 'rgba(255,255,255,0.78)', 500), marginBottom: 46 }}><BlurText f={f} text="Your Shadow Self shows you" start={sec(0.4)} stagger={0.07} /></div>
        <div style={{ position: 'relative', ...big(100, '#fff', 700) }}>
          <span ref={tRef}><BlurText f={f} text="what discipline is worth" start={sec(1.05)} stagger={0.08} /></span>
          <svg width={arm + 6} height={bh + 6} style={{ position: 'absolute', left: '50%', top: '50%', overflow: 'visible', transform: `translate(${-half - arm / 2}px, ${-bh / 2}px) translateX(${lerp(half, 0, open)}px)` }}>
            <path d={left} fill="none" stroke={GREEN} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={eL.strokeDasharray} strokeDashoffset={eL.strokeDashoffset} />
          </svg>
          <svg width={arm + 6} height={bh + 6} style={{ position: 'absolute', left: '50%', top: '50%', overflow: 'visible', transform: `translate(${half - arm / 2}px, ${-bh / 2}px) translateX(${lerp(-half, 0, open)}px)` }}>
            <path d={right} fill="none" stroke={GREEN} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={eR.strokeDasharray} strokeDashoffset={eR.strokeDashoffset} />
          </svg>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

